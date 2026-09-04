/**
 * Windows 系统下自动注册 dsh:// 自定义协议脚本
 */
const { execSync } = require('child_process')
const path = require('path')
const os = require('os')
const fs = require('fs')

function registerProtocol() {
  if (process.platform !== 'win32') {
    console.log('[dsh-protocol] 当前非 Windows 系统，跳过注册表写入。')
    return
  }

  // 探测可执行文件路径
  const possibleExePaths = [
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'DeepSeek-Harness', 'DeepSeek Harness.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'DeepSeek-Harness', 'DeepSeek Harness.exe'),
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'DeepSeek-Harness', 'DeepSeek Harness.exe'),
    // 如果没有找到桌面端，使用当前 node 启动命令作为开发调试命令
    process.execPath,
  ]

  let targetExe = possibleExePaths.find(p => fs.existsSync(p)) || possibleExePaths[0]
  console.log(`[dsh-protocol] 绑定执行目标: "${targetExe}"`)

  try {
    // 1. 注册协议键
    execSync('reg add "HKCU\\Software\\Classes\\dsh" /ve /d "DeepSeek Harness Protocol" /f', { stdio: 'ignore' })
    execSync('reg add "HKCU\\Software\\Classes\\dsh" /v "URL Protocol" /t REG_SZ /d "" /f', { stdio: 'ignore' })

    // 2. 注册 command 关联
    const commandStr = `"${targetExe}" "%1"`
    execSync(`reg add "HKCU\\Software\\Classes\\dsh\\shell\\open\\command" /ve /d "${commandStr.replace(/"/g, '\\"')}" /f`, { stdio: 'ignore' })

    console.log('✅ [dsh-protocol] 成功写入 Windows 注册表！')
    console.log('🚀 系统已支持通过 dsh://plugin/install?... 唤起 DeepSeek Harness 桌面端。')
  } catch (err) {
    console.error('❌ [dsh-protocol] 注册表写入失败:', err.message)
  }
}

registerProtocol()
