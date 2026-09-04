import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import yaml from './vendor/yaml.js'

export interface PatchRow {
  id: string
  disabled?: boolean
  [key: string]: any
}

/**
 * 读取 profileDir 下的 cordis.patch.yml 文件
 */
export function readPatchFileState(profileDir: string): Record<string, PatchRow> {
  const patchPath = join(profileDir, 'cordis.patch.yml')
  if (!existsSync(patchPath)) {
    return {}
  }

  try {
    const raw = readFileSync(patchPath, 'utf-8')
    const parsed = yaml.load(raw)
    if (!Array.isArray(parsed)) {
      return {}
    }

    const map: Record<string, PatchRow> = {}
    for (const item of parsed) {
      if (item && typeof item === 'object' && typeof item.id === 'string') {
        map[item.id] = item as PatchRow
      }
    }
    return map
  } catch (err) {
    console.error(`[dsh-stream-market] 读取 patch 文件失败:`, err)
    return {}
  }
}

/**
 * 切换插件启用/禁用状态并写回 cordis.patch.yml
 */
export function setPluginPatchState(profileDir: string, pluginId: string, enabled: boolean): boolean {
  const patchPath = join(profileDir, 'cordis.patch.yml')
  let patchList: PatchRow[] = []

  if (existsSync(patchPath)) {
    try {
      const raw = readFileSync(patchPath, 'utf-8')
      const parsed = yaml.load(raw)
      if (Array.isArray(parsed)) {
        patchList = parsed.filter(i => i && typeof i === 'object') as PatchRow[]
      }
    } catch {
      patchList = []
    }
  }

  // 查找是否已存在该插件配置
  const existingIndex = patchList.findIndex(item => item.id === pluginId)

  if (enabled) {
    // 启用插件：通常删除 disabled: true 行，或者标记 disabled: false
    if (existingIndex !== -1) {
      if (Object.keys(patchList[existingIndex]).length <= 2 && patchList[existingIndex].disabled !== undefined) {
        // 如果只有 id 和 disabled 字段，直接移除该行以保持纯净
        patchList.splice(existingIndex, 1)
      } else {
        patchList[existingIndex].disabled = false
      }
    }
  } else {
    // 停用插件：标记 disabled: true
    if (existingIndex !== -1) {
      patchList[existingIndex].disabled = true
    } else {
      patchList.push({ id: pluginId, disabled: true })
    }
  }

  try {
    const newYaml = yaml.dump(patchList, { indent: 2, lineWidth: -1 })
    writeFileSync(patchPath, newYaml, 'utf-8')
    return true
  } catch (err) {
    console.error(`[dsh-stream-market] 写入 patch 文件失败:`, err)
    return false
  }
}

/**
 * 彻底从 cordis.patch.yml 中移除插件的任何配置条目与禁用标记
 */
export function removePluginPatchEntry(profileDir: string, pluginId: string): boolean {
  const patchPath = join(profileDir, 'cordis.patch.yml')
  if (!existsSync(patchPath)) return true

  try {
    const raw = readFileSync(patchPath, 'utf-8')
    const parsed = yaml.load(raw)
    if (!Array.isArray(parsed)) return true

    const filtered = parsed.filter(item => {
      if (!item || typeof item !== 'object') return true
      const id = String(item.id || '')
      return id !== pluginId && id !== `~${pluginId}` && !id.startsWith(`${pluginId}:`)
    })

    const newYaml = yaml.dump(filtered, { indent: 2, lineWidth: -1 })
    writeFileSync(patchPath, newYaml, 'utf-8')
    return true
  } catch (err) {
    console.error(`[dsh-stream-market] 移除 patch 配置失败:`, err)
    return false
  }
}

