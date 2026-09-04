import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { existsSync, rmSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { resolveProfileDir, rescueDshBundles } from './profile.js';
import { setPluginPatchState, removePluginPatchEntry } from './patch.js';
export class PluginInstaller {
    activeTasks = new Map();
    /**
     * 安装插件并返回一个事件流
     */
    install(pluginId, source, profile = 'web') {
        const emitter = new EventEmitter();
        const taskKey = `${profile}:${pluginId}`;
        if (this.activeTasks.has(taskKey)) {
            setImmediate(() => {
                emitter.emit('error', new Error(`插件 ${pluginId} 正在安装中，请勿重复操作`));
            });
            return emitter;
        }
        const task = {
            id: pluginId,
            source,
            profile,
            eventEmitter: emitter,
        };
        this.activeTasks.set(taskKey, task);
        this.runInstallProcess(task);
        return emitter;
    }
    /**
     * 基础卸载插件（内部委托至深度干净卸载管道）
     */
    uninstall(pluginId, profile = 'web') {
        return this.cleanUninstall([pluginId], profile, {
            ids: [pluginId],
            cleanFiles: true,
            cleanConfig: true,
            cleanSource: false,
        });
    }
    /**
     * 彻底干净卸载本地插件（支持单选、多选与批量彻底卸载）
     * 彻底清除：cordis.patch 规则、package.json 依赖与 bundles、node_modules 实体、本地插件源
     */
    cleanUninstall(pluginIds, profile = 'web', options = {}) {
        const emitter = new EventEmitter();
        const profileDir = resolveProfileDir(profile);
        const cleanFiles = options.cleanFiles !== false;
        const cleanConfig = options.cleanConfig !== false;
        const cleanSource = options.cleanSource === true;
        setImmediate(async () => {
            const emitLog = (msg, type = 'log') => {
                emitter.emit('data', { type, message: msg });
            };
            emitLog(`🧹 开始批量彻底清理本地插件 (共 ${pluginIds.length} 个)...`);
            emitLog(`📂 目标 Profile: ${profileDir}`);
            let successCount = 0;
            let errorCount = 0;
            for (let i = 0; i < pluginIds.length; i++) {
                const pluginId = pluginIds[i];
                const prefix = `[${i + 1}/${pluginIds.length}] ${pluginId}`;
                if (pluginId === 'dsh-stream-market') {
                    emitLog(`⚠️ ${prefix}: 检测到插件市场管理端核心，为保证控制台正常运行，已安全保护跳过`, 'log');
                    continue;
                }
                emitLog(`\n>>> 正在彻底粉碎卸载: ${pluginId} ...`);
                try {
                    // 1. 清理 cordis.patch.yml
                    if (cleanConfig) {
                        emitLog(`  - [1/4] 清理 cordis.patch.yml 规则配置...`);
                        removePluginPatchEntry(profileDir, pluginId);
                    }
                    // 2. 清理 package.json (dependencies 与 bundles)
                    emitLog(`  - [2/4] 从 package.json 移除依赖项与 Profile Bundles...`);
                    const pkgJsonPath = join(profileDir, 'package.json');
                    let localSourcePath = null;
                    if (existsSync(pkgJsonPath)) {
                        try {
                            const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
                            const depVal = pkg.dependencies?.[pluginId] || pkg.devDependencies?.[pluginId];
                            if (depVal && typeof depVal === 'string' && depVal.startsWith('file:')) {
                                localSourcePath = resolve(profileDir, depVal.replace('file:', ''));
                            }
                            if (pkg.dependencies)
                                delete pkg.dependencies[pluginId];
                            if (pkg.devDependencies)
                                delete pkg.devDependencies[pluginId];
                            if (pkg.dsh?.profile?.bundles && Array.isArray(pkg.dsh.profile.bundles)) {
                                pkg.dsh.profile.bundles = pkg.dsh.profile.bundles.filter((b) => b !== pluginId && b !== `~${pluginId}`);
                            }
                            writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
                        }
                        catch (err) {
                            emitLog(`  ⚠️ package.json 修改异常: ${err.message}`, 'log');
                        }
                    }
                    // 3. 物理清理 node_modules 文件
                    if (cleanFiles) {
                        emitLog(`  - [3/4] 物理粉碎 node_modules 目录与残留文件...`);
                        const nodeModulesPluginPath = join(profileDir, 'node_modules', pluginId);
                        if (existsSync(nodeModulesPluginPath)) {
                            try {
                                rmSync(nodeModulesPluginPath, { recursive: true, force: true, maxRetries: 3 });
                            }
                            catch (err) {
                                emitLog(`  ⚠️ 移除 node_modules 失败: ${err.message}`, 'log');
                            }
                        }
                        // 处理作用域目录，如 @dsh-external
                        if (pluginId.startsWith('@') && pluginId.includes('/')) {
                            const scopeDir = join(profileDir, 'node_modules', pluginId.split('/')[0]);
                            if (existsSync(scopeDir)) {
                                try {
                                    const files = readdirSync(scopeDir);
                                    if (files.length === 0) {
                                        rmSync(scopeDir, { recursive: true, force: true });
                                    }
                                }
                                catch { }
                            }
                        }
                        // 若存在本地 .dsh/plugins/<id> 链接且用户要求清理源
                        if (cleanSource && localSourcePath && existsSync(localSourcePath)) {
                            emitLog(`  - 清理本地插件源工程: ${localSourcePath}`);
                            try {
                                rmSync(localSourcePath, { recursive: true, force: true, maxRetries: 3 });
                            }
                            catch (err) {
                                emitLog(`  ⚠️ 移除插件源目录异常: ${err.message}`, 'log');
                            }
                        }
                    }
                    // 4. 清理完成
                    emitLog(`  - [4/4] 刷新配置状态与热重载索引...`);
                    successCount++;
                    emitLog(`✅ ${pluginId} 彻底卸载完成，0 冗余残留！`, 'success');
                }
                catch (err) {
                    errorCount++;
                    emitLog(`❌ ${pluginId} 卸载失败: ${err.message}`, 'error');
                }
            }
            emitLog(`\n🎉 本地插件彻底卸载执行完毕: 成功清理 ${successCount} 个, 失败 ${errorCount} 个`, successCount > 0 ? 'success' : 'log');
            emitter.emit('end');
        });
        return emitter;
    }
    runInstallProcess(task) {
        const { id, source, profile, eventEmitter } = task;
        const profileDir = resolveProfileDir(profile);
        const taskKey = `${profile}:${id}`;
        const emitLog = (msg, stage = 'installing') => {
            eventEmitter.emit('data', {
                type: 'log',
                message: msg,
                stage,
            });
        };
        emitLog(`🚀 启动极速装载: ${id} (来源: ${source})`, 'prepare');
        emitLog(`📂 目标 Profile 工作区: ${profileDir}`, 'prepare');
        // 优先调用 dsh CLI
        const isWindows = process.platform === 'win32';
        const dshCmd = isWindows ? 'dsh.cmd' : 'dsh';
        const args = ['plugin', '--profile', profile, 'add', source];
        let dshExecuted = false;
        try {
            const proc = spawn(dshCmd, args, {
                cwd: profileDir,
                shell: true,
            });
            dshExecuted = true;
            proc.stdout.on('data', (d) => {
                emitLog(d.toString(), 'installing');
            });
            proc.stderr.on('data', (d) => {
                emitLog(d.toString(), 'installing');
            });
            proc.on('error', (err) => {
                emitLog(`⚠️ 未检测到系统级 dsh CLI 或命令不可用 (${err.message})，启用内置包管理器引擎...`, 'prepare');
                this.runFallbackPackageManager(task, profileDir);
            });
            proc.on('close', (code) => {
                if (code === 0) {
                    // 确保补丁处于启用状态
                    setPluginPatchState(profileDir, id, true);
                    try {
                        rescueDshBundles(profile);
                    }
                    catch { }
                    eventEmitter.emit('data', {
                        type: 'success',
                        message: `🎉 插件 ${id} 安装成功！DeepSeek Harness 正在热重载...`,
                        stage: 'complete',
                    });
                    eventEmitter.emit('end');
                    this.activeTasks.delete(taskKey);
                }
                else {
                    emitLog(`⚠️ dsh 进程退出 (code ${code})，尝试使用备用包管理器...`, 'installing');
                    this.runFallbackPackageManager(task, profileDir);
                }
            });
        }
        catch {
            if (!dshExecuted) {
                this.runFallbackPackageManager(task, profileDir);
            }
        }
    }
    runFallbackPackageManager(task, profileDir) {
        const { id, source, profile, eventEmitter } = task;
        const taskKey = `${profile}:${id}`;
        const emitLog = (msg) => {
            eventEmitter.emit('data', { type: 'log', message: msg });
        };
        emitLog(`📦 使用 npm / pnpm 极速装载源: ${source}...`);
        const isWindows = process.platform === 'win32';
        const npmCmd = isWindows ? 'npm.cmd' : 'npm';
        const args = ['install', source, '--save'];
        const proc = spawn(npmCmd, args, { cwd: profileDir, shell: true });
        proc.stdout.on('data', (d) => emitLog(d.toString()));
        proc.stderr.on('data', (d) => emitLog(d.toString()));
        proc.on('close', (code) => {
            if (code === 0) {
                setPluginPatchState(profileDir, id, true);
                try {
                    rescueDshBundles(profile);
                }
                catch { }
                eventEmitter.emit('data', {
                    type: 'success',
                    message: `🎉 插件 ${id} 装载完成并已启用！`,
                    stage: 'complete',
                });
                eventEmitter.emit('end');
            }
            else {
                eventEmitter.emit('data', {
                    type: 'error',
                    message: `❌ 安装失败，进程退出码: ${code}`,
                    stage: 'complete',
                });
                eventEmitter.emit('end');
            }
            this.activeTasks.delete(taskKey);
        });
    }
    runNpmUninstall(pluginId, profileDir, emitter) {
        const isWindows = process.platform === 'win32';
        const npmCmd = isWindows ? 'npm.cmd' : 'npm';
        const proc = spawn(npmCmd, ['uninstall', pluginId], { cwd: profileDir, shell: true });
        proc.stdout.on('data', (d) => emitter.emit('data', { type: 'log', message: d.toString() }));
        proc.stderr.on('data', (d) => emitter.emit('data', { type: 'log', message: d.toString() }));
        proc.on('close', (code) => {
            if (code === 0) {
                emitter.emit('data', { type: 'success', message: `✅ ${pluginId} 已成功卸载` });
            }
            else {
                emitter.emit('data', { type: 'error', message: `❌ 卸载异常，代码: ${code}` });
            }
            emitter.emit('end');
        });
    }
}
export const installer = new PluginInstaller();
//# sourceMappingURL=installer.js.map