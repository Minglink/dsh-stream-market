import { EventEmitter } from 'node:events'
import type { DshProtocolInstallParams } from '../types.js'
import { installer } from './installer.js'

export const DSH_PROTOCOL_SCHEME = 'dsh:'
export const DSH_PLUGIN_INSTALL_PATH = '/plugin/install'

/**
 * 校验并解析系统级 dsh:// 一键安装协议 URL
 * 示例: dsh://plugin/install?id=open-design&name=%E6%89%93%E5%BC%80%20Design&version=1.0.0&repo=nexu-io/open-design
 */
export function parseDshProtocolUrl(rawUrl: string): DshProtocolInstallParams {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('协议 URL 不能为空')
  }

  const trimmed = rawUrl.trim()
  if (!trimmed.toLowerCase().startsWith('dsh://')) {
    throw new Error(`非法的协议头，必须以 dsh:// 开头 (实际: ${trimmed.slice(0, 10)})`)
  }

  // 兼容两种解析格式: dsh://plugin/install?... 或 URL 标准对象解析
  // node URL 解析 dsh:// 时，plugin 可能作为 host，/install 作为 pathname
  let searchParams: URLSearchParams
  let pathPart = ''

  try {
    const urlObj = new URL(trimmed)
    pathPart = (urlObj.host + urlObj.pathname).replace(/\/+/g, '/')
    searchParams = urlObj.searchParams
  } catch {
    // 手工解析容错
    const questionIndex = trimmed.indexOf('?')
    const prefix = questionIndex !== -1 ? trimmed.slice(6, questionIndex) : trimmed.slice(6)
    pathPart = prefix.replace(/^\/+/, '')
    const query = questionIndex !== -1 ? trimmed.slice(questionIndex + 1) : ''
    searchParams = new URLSearchParams(query)
  }

  // 校验操作路由
  const cleanPath = pathPart.replace(/^\/+/, '')
  if (cleanPath !== 'plugin/install' && !cleanPath.endsWith('plugin/install')) {
    throw new Error(`非法的协议操作路由: ${pathPart} (预期: /plugin/install)`)
  }

  // 提取字段并校验必填参数
  const id = (searchParams.get('id') || '').trim()
  const name = (searchParams.get('name') || '').trim()
  const version = (searchParams.get('version') || 'latest').trim()
  const repo = (searchParams.get('repo') || '').trim()
  const permissions = searchParams.get('permissions') || undefined
  const downloadUrl = searchParams.get('downloadUrl') || undefined

  if (!id) {
    throw new Error('协议缺少必填参数: id (插件唯一标识符)')
  }
  if (!/^[a-z0-9-_@/]+$/i.test(id)) {
    throw new Error(`插件 id 格式非法: ${id}，应为英文字母、数字、中划线或下划线`)
  }
  if (!name) {
    throw new Error('协议缺少必填参数: name (插件展示名称)')
  }
  if (!repo) {
    throw new Error('协议缺少必填参数: repo (官方/开源仓库地址或 npm 包名)')
  }

  return {
    id,
    name,
    version,
    repo,
    permissions,
    downloadUrl,
  }
}

/**
 * 构造标准 dsh:// 一键安装协议 URL
 */
export function buildDshProtocolUrl(params: DshProtocolInstallParams): string {
  const q = new URLSearchParams({
    id: params.id,
    name: params.name,
    version: params.version || 'latest',
    repo: params.repo || params.id,
  })

  if (params.permissions) {
    q.set('permissions', params.permissions)
  }
  if (params.downloadUrl) {
    q.set('downloadUrl', params.downloadUrl)
  }

  return `dsh://plugin/install?${q.toString()}`
}

/**
 * 生成 HTML 一键拉起链接代码 (用于网页/博客/文档)
 */
export function generateHtmlBadge(params: DshProtocolInstallParams): string {
  const url = buildDshProtocolUrl(params)
  return `<a href="${url}" class="btn-install" title="一键安装到 DeepSeek Harness 桌面端">\n  🚀 唤起客户端一键安装\n</a>`
}

/**
 * 生成 Markdown 徽章代码 (用于 GitHub README)
 */
export function generateMarkdownBadge(params: DshProtocolInstallParams): string {
  const url = buildDshProtocolUrl(params)
  return `[![Install in DeepSeek Harness](https://img.shields.io/badge/Install%20in-DeepSeek%20Harness-0ea5e9?style=for-the-badge&logo=deepseek)](${url})`
}

/**
 * 根据协议参数执行本地装载流程
 */
export function executeProtocolInstall(params: DshProtocolInstallParams, profile: string = 'web'): EventEmitter {
  // 确定实际拉取源：
  // 1. 若明确提供了 GitHub/npm 规范则优先使用
  // 2. 若 repo 不带前缀且包含 '/' 则自动补充 github:
  let installSource = params.repo
  if (params.downloadUrl) {
    installSource = params.downloadUrl
  } else if (!installSource.startsWith('github:') && !installSource.startsWith('npm:') && installSource.includes('/')) {
    installSource = `github:${installSource}`
  }

  return installer.install(params.id, installSource, profile)
}
