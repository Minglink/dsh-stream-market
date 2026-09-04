import { fileURLToPath } from 'node:url'
import { MarketBridgeServer } from './bridge/server.js'
import { parseDshProtocolUrl, executeProtocolInstall } from './runtime/protocol.js'
import type { MarketConfig } from './types.js'

export const name = 'dsh-stream-market'

/**
 * DSH 宿主微内核规范接入入口
 * @param ctx 宿主 Cordis Context
 * @param config 用户在 cordis.yml 中配置的参数
 */
export function apply(ctx: any, config: MarketConfig = {}) {
  const bridge = new MarketBridgeServer(config)

  // 1. 如果宿主提供了 webServer 容器，直接挂载路由
  if (ctx && ctx.inject) {
    ctx.inject(['webServer'], (serverCtx: any) => {
      const server = serverCtx.webServer
      if (server && typeof server.use === 'function') {
        server.use('/api/market', (req: any, res: any) => {
          bridge.handleRequest(req, res)
        })
        server.use('/market', (req: any, res: any) => {
          bridge.handleRequest(req, res)
        })
        console.log('[dsh-stream-market] ✅ 已成功挂载至 DSH 宿主 WebServer: /market')
      }
    })

    // 2. 尝试向 DSH 设置/侧栏注入菜单入口
    try {
      ctx.inject(['settings' as any], (sCtx: any) => {
        if (sCtx.settings && typeof sCtx.settings.register === 'function') {
          sCtx.settings.register('stream-market', {
            title: 'Stream 插件市场',
            description: 'DeepSeek Harness 内置可视化插件市场',
            schema: {},
          })
        }
      })
    } catch {}
  }

  // 3. 同时保持独立本地 Bridge 端口运行，以便与外部浏览器 deepseek.stream 双向打通
  bridge.start().catch((err) => {
    console.warn('[dsh-stream-market] 独立 Bridge 端口启动提示:', err.message)
  })
}

// 自动检测命令行调用与协议唤起处理
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) {
  // 检查是否是通过系统级 dsh:// 协议直接拉起命令行
  const protocolArg = process.argv.find(arg => arg.toLowerCase().startsWith('dsh://'))

  if (protocolArg) {
    console.log('⚡ ========================================================')
    console.log('⚡ DeepSeek Harness 协议捕获: dsh:// 一键安装')
    console.log('⚡ ========================================================')

    try {
      // 步骤 1: 协议捕获与解析
      const params = parseDshProtocolUrl(protocolArg)
      console.log(`\n📦 插件 ID:       ${params.id}`)
      console.log(`🏷️ 插件名称:     ${params.name}`)
      console.log(`📌 版本号:       ${params.version}`)
      console.log(`📂 代码仓库/源:   ${params.repo}`)
      console.log(`🛡️ 申请权限:     ${params.permissions || '网络访问, 本地文件读取'}`)
      if (params.downloadUrl) {
        console.log(`🔗 备用直链:     ${params.downloadUrl}`)
      }

      console.log('\n🚀 开始执行自动化安全装载与热重载...')
      const profile = process.argv.includes('--profile')
        ? process.argv[process.argv.indexOf('--profile') + 1]
        : 'web'

      const emitter = executeProtocolInstall(params, profile)
      emitter.on('data', (evt: any) => {
        if (evt.type === 'log') console.log(`[安装日志] ${evt.message.trim()}`)
        if (evt.type === 'success') console.log(`\n✅ ${evt.message}`)
        if (evt.type === 'error') console.error(`\n❌ ${evt.message}`)
      })
      emitter.on('end', () => {
        console.log('🎉 协议处理完成，按回车键退出或自动保持后台。')
      })
    } catch (err: any) {
      console.error('❌ 解析 dsh:// 协议失败:', err.message)
      process.exit(1)
    }
  } else {
    // 普通独立服务运行模式 (npm start)
    console.log('⚡ ========================================================')
    console.log('⚡ DeepSeek Harness 内置插件市场 · 独立开发与测试服务')
    console.log('⚡ ========================================================')

    const server = new MarketBridgeServer({
      profile: process.argv.includes('--profile')
        ? process.argv[process.argv.indexOf('--profile') + 1]
        : 'web',
      port: 18899,
    })

    server.start().then((port) => {
      console.log(`\n👉 浏览器访问内置商城页面: http://127.0.0.1:${port}`)
      console.log(`👉 协议解析端点: http://127.0.0.1:${port}/api/market/protocol/parse?url=dsh://...`)
      console.log(`👉 宿主状态接口: http://127.0.0.1:${port}/api/market/health`)
      console.log(`👉 插件库清单:   http://127.0.0.1:${port}/api/market/catalog\n`)
    })
  }
}
