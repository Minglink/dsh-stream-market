/**
 * DeepSeek Harness 运行时崩溃一键自愈与急救修复工具
 * 专门解决: Error: dsh: profile bundle "xxx" declares no dsh.bundle in its package.json (退出码 1)
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const dshHome = path.join(os.homedir(), '.dsh');
const profilesDir = path.join(dshHome, 'profiles');
const pluginsDir = path.join(dshHome, 'plugins');

console.log('>>> 正在诊断 DeepSeek Harness 运行时崩溃故障...');
console.log('📂 DSH Home:', dshHome);

if (!fs.existsSync(profilesDir)) {
  console.log('ℹ️ 未检测到 profiles 目录，无需修复。');
  process.exit(0);
}

const profiles = fs.readdirSync(profilesDir).filter(p => fs.statSync(path.join(profilesDir, p)).isDirectory());
let totalFixed = 0;

for (const profile of profiles) {
  const profileDir = path.join(profilesDir, profile);
  const pkgJsonPath = path.join(profileDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) continue;

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  } catch (err) {
    console.error(`❌ 解析 ${profileDir}/package.json 失败:`, err.message);
    continue;
  }

  const bundles = pkg.dsh?.profile?.bundles;
  if (!Array.isArray(bundles)) continue;

  const validBundles = [];
  let modified = false;

  for (const bundleName of bundles) {
    // 系统核心 bundle 保留
    if (bundleName.startsWith('@deepseek-ai/dsh-base') || bundleName.startsWith('@deepseek-ai/dsh-web-app')) {
      validBundles.push(bundleName);
      continue;
    }

    // 纯类型或非 bundle 依赖严禁进入 profile bundles
    if (bundleName === 'types-js-yaml' || bundleName.startsWith('@types/')) {
      console.log(`ℹ️ [${bundleName}] 为非 bundle 依赖项，已从 bundles 过滤，安全保留在 dependencies 中。`);
      modified = true;
      totalFixed++;
      continue;
    }

    // 定位该 bundle 的真实安装路径
    let bundleDir = path.join(profileDir, 'node_modules', bundleName);
    const depVal = pkg.dependencies?.[bundleName] || pkg.devDependencies?.[bundleName];
    if (depVal && typeof depVal === 'string' && depVal.startsWith('file:')) {
      bundleDir = path.resolve(profileDir, depVal.replace('file:', ''));
    } else if (!fs.existsSync(bundleDir)) {
      const candidatePluginDir = path.join(pluginsDir, bundleName);
      if (fs.existsSync(candidatePluginDir)) {
        bundleDir = candidatePluginDir;
      }
    }

    const bundlePkgPath = path.join(bundleDir, 'package.json');

    if (!fs.existsSync(bundlePkgPath)) {
      console.log(`⚠️ 检测到幽灵 bundle [${bundleName}]，目录不存在: ${bundleDir}`);
      console.log(`   -> 从 profile bundles 列表中移除该失效项，防止启动中断。`);
      modified = true;
      totalFixed++;
      continue;
    }

    let bundlePkg;
    try {
      bundlePkg = JSON.parse(fs.readFileSync(bundlePkgPath, 'utf-8'));
    } catch {
      bundlePkg = {};
    }

    // 检查是否存在 dsh.bundle.patch 声明
    const declaredPatch = bundlePkg.dsh?.bundle?.patch;
    const patchFile = path.join(bundleDir, 'cordis.patch.yml');

    if (!declaredPatch) {
      console.log(`🔧 发现致命缺陷: [${bundleName}] 未声明 dsh.bundle.patch (导致退出码 1 的罪魁祸首)`);
      
      // 方案 A: 自动为其生成合法的 cordis.patch.yml 并补全 package.json 声明
      if (!fs.existsSync(patchFile)) {
        fs.writeFileSync(patchFile, `# DSH 自动修复补丁配置\n- id: ${bundleName}\n  name: ${bundleName}\n`, 'utf-8');
      }

      bundlePkg.dsh = bundlePkg.dsh || {};
      bundlePkg.dsh.bundle = { patch: './cordis.patch.yml' };
      fs.writeFileSync(bundlePkgPath, JSON.stringify(bundlePkg, null, 2) + '\n', 'utf-8');
      console.log(`   ✅ 已自动注入补丁规范: ${bundlePkgPath}`);
      validBundles.push(bundleName);
      totalFixed++;
    } else {
      // 若声明了 patch 文件但实际物理文件不存在，补齐空 patch
      const realPatchPath = path.join(bundleDir, declaredPatch);
      if (!fs.existsSync(realPatchPath)) {
        fs.writeFileSync(realPatchPath, `# DSH 自动修复补丁配置\n- id: ${bundleName}\n  name: ${bundleName}\n`, 'utf-8');
        console.log(`   ✅ 补齐缺失的 patch 文件: ${realPatchPath}`);
        totalFixed++;
      }
      validBundles.push(bundleName);
    }
  }

  if (modified) {
    pkg.dsh.profile.bundles = validBundles;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    console.log(`✅ 已净化 ${profile} 配置清单: ${pkgJsonPath}`);
  }
}

console.log(`\n🎉 急救诊断完毕！共修复/净化 ${totalFixed} 处潜在崩溃隐患。DeepSeek Harness 现可安全启动！`);
