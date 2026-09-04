import type { PluginMeta } from '../types.js';
/**
 * 内置官方精选与核心插件清单（离线备份与极速冷启动源）
 */
export declare const DEFAULT_PLUGINS: PluginMeta[];
/**
 * 获取插件库清单（优先拉取 deepseek.stream 云端，失败则使用内置清单）
 */
export declare function fetchPluginCatalog(hubUrl?: string): Promise<PluginMeta[]>;
//# sourceMappingURL=catalog.d.ts.map