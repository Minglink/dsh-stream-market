/**
 * dsh-stream-market: 核心类型定义
 */

export interface PluginMeta {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: 'essential' | 'efficiency' | 'coding' | 'agent' | 'theme' | 'security' | 'media' | 'general'
  icon?: string
  banner?: string
  tags: string[]
  source: string // npm 包名或 GitHub 规范: github:user/repo#path=plugins/xxx
  repo?: string   // 官方开源仓库或 npm 规范
  permissions?: string // 插件权限描述
  downloadUrl?: string // 离线 zip/tar 安装包直链
  installed?: boolean
  installedVersion?: string
  enabled?: boolean
  downloads?: number
  stars?: number
  isOfficial?: boolean
  isEssential?: boolean
  homepage?: string
  authorUrl?: string
  ratingScore?: number
  reviewCount?: number
  fileSize?: string
  versionHistory?: Array<{
    version: string
    releaseDate?: string
    changelog?: string
    downloadUrl?: string
  }>
}

export interface InstalledPluginInfo {
  id: string
  name?: string
  displayName?: string
  version: string
  enabled: boolean
  isDirectDependency: boolean
  description?: string
  path?: string
  source?: string
  isLocalLink?: boolean
  size?: string
}

export interface CleanUninstallOptions {
  ids: string[]
  cleanFiles?: boolean
  cleanConfig?: boolean
  cleanSource?: boolean
  profile?: string
}

export interface HostEnvironment {
  profile: string
  profileDir: string
  dshVersion: string
  nodeVersion: string
  installedCount: number
  hasPatchFile: boolean
}

export interface InstallProgressEvent {
  type: 'log' | 'progress' | 'error' | 'success'
  message: string
  percent?: number
  stage?: 'prepare' | 'downloading' | 'installing' | 'patching' | 'complete'
}

export interface MarketConfig {
  profile?: string
  hubUrl?: string
  port?: number
  allowRestart?: boolean
  autoSync?: boolean
}

/**
 * DeepSeek Harness 官方桌面端与插件市场「一键安装联动协议规范」
 * 格式: dsh://plugin/install?id={id}&name={name}&version={version}&repo={repo}&permissions={permissions}&downloadUrl={downloadUrl}
 */
export interface DshProtocolInstallParams {
  id: string
  name: string
  version: string
  repo: string
  permissions?: string
  downloadUrl?: string
}
