import type { PluginMeta } from '../types.js';
/**
 * 官方精选与核心插件清单（与 deepseek.stream 官方生态市场 1:1 严谨同步与极速冷启动源）
 */
export declare const DEFAULT_PLUGINS: PluginMeta[];
/**
 * 获取插件库清单（优先拉取 deepseek.stream 云端，失败则使用官方权威离线清单）
 */
export declare function fetchPluginCatalog(hubUrl?: string): Promise<PluginMeta[]>;
//# sourceMappingURL=catalog.d.ts.map