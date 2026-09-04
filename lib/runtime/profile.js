import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { readPatchFileState } from './patch.js';
/**
 * 确定当前激活的 DSH Profile 目录
 */
export function resolveProfileDir(profileName = 'web') {
    // 1. 优先环境变量
    if (process.env.DSH_PROFILE_DIR && existsSync(process.env.DSH_PROFILE_DIR)) {
        return resolve(process.env.DSH_PROFILE_DIR);
    }
    // 2. 检查用户主目录下的 profiles 目录
    const candidateDirs = [
        join(homedir(), '.dsh', 'profiles', profileName),
        join(homedir(), '.deepseek', 'profiles', profileName),
        join(homedir(), '.dsh'),
        join(homedir(), '.deepseek'),
    ];
    for (const dir of candidateDirs) {
        if (existsSync(dir) && existsSync(join(dir, 'package.json'))) {
            return dir;
        }
    }
    // 3. 当前工作目录（若确实为 DSH profile 工作区）
    const cwd = process.cwd();
    if (existsSync(join(cwd, 'package.json')) && existsSync(join(cwd, 'cordis.patch.yml')) && existsSync(join(cwd, 'node_modules', '@deepseek-ai'))) {
        return cwd;
    }
    // 默认 fallback
    return join(homedir(), '.dsh', 'profiles', profileName);
}
/**
 * 获取 DSH 宿主环境运行状态
 */
export function getHostEnvironment(profileName = 'web') {
    const profileDir = resolveProfileDir(profileName);
    const patchPath = join(profileDir, 'cordis.patch.yml');
    let dshVersion = 'unknown';
    const dshPkgPath = join(profileDir, 'node_modules', '@deepseek-ai', 'dsh', 'package.json');
    if (existsSync(dshPkgPath)) {
        try {
            const pkg = JSON.parse(readFileSync(dshPkgPath, 'utf-8'));
            dshVersion = pkg.version || 'unknown';
        }
        catch { }
    }
    const installed = scanInstalledPlugins(profileName);
    return {
        profile: profileName,
        profileDir,
        dshVersion,
        nodeVersion: process.version,
        installedCount: Object.keys(installed).length,
        hasPatchFile: existsSync(patchPath),
    };
}
/**
 * 扫描当前 Profile 下已安装的所有本地插件及其启用状态与路径
 */
export function scanInstalledPlugins(profileName = 'web') {
    const profileDir = resolveProfileDir(profileName);
    const results = {};
    const patchStates = readPatchFileState(profileDir);
    // 1. 读取 package.json 中的 dependencies 与 profile bundles
    const pkgJsonPath = join(profileDir, 'package.json');
    const allDeps = {};
    if (existsSync(pkgJsonPath)) {
        try {
            const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
            const deps = {
                ...(pkg.dependencies || {}),
                ...(pkg.devDependencies || {}),
            };
            for (const [name, ver] of Object.entries(deps)) {
                if (!isCoreSystemPackage(name)) {
                    allDeps[name] = String(ver);
                }
            }
            // 补充 bundles 中声明的插件
            const bundles = pkg.dsh?.profile?.bundles;
            if (Array.isArray(bundles)) {
                for (const b of bundles) {
                    if (typeof b === 'string' && !isCoreSystemPackage(b) && !allDeps[b]) {
                        allDeps[b] = 'latest';
                    }
                }
            }
        }
        catch { }
    }
    // 2. 解析插件目录与元数据
    for (const [depName, declaredVer] of Object.entries(allDeps)) {
        let pluginDir = join(profileDir, 'node_modules', depName);
        let isLocalLink = false;
        let resolvedPath = pluginDir;
        if (declaredVer.startsWith('file:')) {
            const targetRel = declaredVer.replace('file:', '');
            resolvedPath = resolve(profileDir, targetRel);
            isLocalLink = true;
        }
        let installedVersion = declaredVer.replace('file:', '');
        let description = '';
        let displayName = depName;
        // 尝试读取 package.json 元数据
        const innerPkgPath = existsSync(join(resolvedPath, 'package.json'))
            ? join(resolvedPath, 'package.json')
            : join(pluginDir, 'package.json');
        if (existsSync(innerPkgPath)) {
            try {
                const innerPkg = JSON.parse(readFileSync(innerPkgPath, 'utf-8'));
                installedVersion = innerPkg.version || installedVersion;
                description = innerPkg.description || '';
                displayName = innerPkg.displayName || innerPkg.name || depName;
            }
            catch { }
        }
        // 检查 cordis.patch.yml 中是否被明确 disabled
        const isExplicitlyDisabled = patchStates[depName]?.disabled === true || patchStates[`~${depName}`]?.disabled === true;
        results[depName] = {
            id: depName,
            name: depName,
            displayName,
            version: installedVersion,
            enabled: !isExplicitlyDisabled,
            isDirectDependency: true,
            description,
            path: existsSync(resolvedPath) ? resolvedPath : pluginDir,
            source: declaredVer,
            isLocalLink,
        };
    }
    return results;
}
/**
 * 判定是否为核心基础运行系统包（不属于可卸载扩展）
 */
export function isCoreSystemPackage(name) {
    if (name.startsWith('@deepseek-ai/dsh-base') || name.startsWith('@deepseek-ai/dsh-web-app') || name === 'cordis') {
        return true;
    }
    return false;
}
/**
 * 判定包名是否为 DSH 相关插件
 */
export function isDshPluginName(name) {
    return !isCoreSystemPackage(name);
}
/**
 * 自动扫描并急救修复当前及所有 Profile 中缺少 dsh.bundle.patch 的插件
 * 彻底消除: Error: dsh: profile bundle "xxx" declares no dsh.bundle in its package.json (退出码 1)
 */
export function rescueDshBundles(profileName = 'web') {
    const profileDir = resolveProfileDir(profileName);
    const pkgJsonPath = join(profileDir, 'package.json');
    if (!existsSync(pkgJsonPath))
        return 0;
    let fixed = 0;
    try {
        const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
        const bundles = pkg.dsh?.profile?.bundles;
        if (!Array.isArray(bundles))
            return 0;
        const validBundles = [];
        let modified = false;
        for (const b of bundles) {
            if (typeof b !== 'string')
                continue;
            if (b.startsWith('@deepseek-ai/dsh-base') || b.startsWith('@deepseek-ai/dsh-web-app')) {
                validBundles.push(b);
                continue;
            }
            // 1. 明确黑名单：纯类型库或普通运行时库坚决不能进入 dsh.profile.bundles（保留在 dependencies）
            if (b === 'types-js-yaml' ||
                b.startsWith('@types/') ||
                b.endsWith('-types') ||
                b === 'js-yaml' ||
                b === 'tslib' ||
                b === 'yaml') {
                modified = true;
                fixed++;
                console.log(`[dsh-stream-market] 🛡️ 拦截并从 bundles 剔除非 bundle 依赖: ${b} (安全保留在 dependencies)`);
                continue;
            }
            // 检查插件路径
            let bDir = join(profileDir, 'node_modules', b);
            const dep = pkg.dependencies?.[b] || pkg.devDependencies?.[b];
            if (dep && typeof dep === 'string' && dep.startsWith('file:')) {
                bDir = resolve(profileDir, dep.replace('file:', ''));
            }
            else if (!existsSync(bDir)) {
                const cand = join(homedir(), '.dsh', 'plugins', b);
                if (existsSync(cand))
                    bDir = cand;
            }
            const bPkgPath = join(bDir, 'package.json');
            if (!existsSync(bPkgPath)) {
                // 幽灵 bundle，目录不存在，移除避免启动崩溃
                modified = true;
                fixed++;
                console.log(`[dsh-stream-market] 🛡️ 剔除不存在的幽灵 bundle: ${b}`);
                continue;
            }
            try {
                const bPkg = JSON.parse(readFileSync(bPkgPath, 'utf-8'));
                const patchFile = join(bDir, 'cordis.patch.yml');
                const clientFile = join(bDir, 'client.js');
                // 判断是否属于 DSH 插件扩展
                const isDshPlugin = b.startsWith('dsh-') ||
                    b.includes('/dsh-') ||
                    bPkg.dsh !== undefined ||
                    existsSync(patchFile) ||
                    existsSync(clientFile);
                if (!isDshPlugin) {
                    // 该包为普通依赖项（非 DSH 扩展），从 bundles 剔除，保留在 dependencies
                    modified = true;
                    fixed++;
                    console.log(`[dsh-stream-market] 🛡️ 剔除普通依赖库: ${b} (非 DSH bundle)`);
                    continue;
                }
                if (!bPkg.dsh?.bundle?.patch) {
                    if (!existsSync(patchFile)) {
                        writeFileSync(patchFile, `# DSH 自动修复补丁配置\n- id: ${b}\n  name: ${b}\n`, 'utf-8');
                    }
                    bPkg.dsh = bPkg.dsh || {};
                    bPkg.dsh.bundle = { patch: './cordis.patch.yml' };
                    writeFileSync(bPkgPath, JSON.stringify(bPkg, null, 2) + '\n', 'utf-8');
                    fixed++;
                }
                else {
                    const realPatch = join(bDir, bPkg.dsh.bundle.patch);
                    if (!existsSync(realPatch)) {
                        writeFileSync(realPatch, `# DSH 自动修复补丁配置\n- id: ${b}\n  name: ${b}\n`, 'utf-8');
                        fixed++;
                    }
                }
                validBundles.push(b);
            }
            catch {
                validBundles.push(b);
            }
        }
        if (modified) {
            pkg.dsh.profile.bundles = validBundles;
            writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
        }
    }
    catch { }
    return fixed;
}
//# sourceMappingURL=profile.js.map