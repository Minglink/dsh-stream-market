import type { HostEnvironment, InstalledPluginInfo } from '../types.js';
/**
 * 确定当前激活的 DSH Profile 目录
 */
export declare function resolveProfileDir(profileName?: string): string;
/**
 * 获取 DSH 宿主环境运行状态
 */
export declare function getHostEnvironment(profileName?: string): HostEnvironment;
/**
 * 扫描当前 Profile 下已安装的所有本地插件及其启用状态与路径
 */
export declare function scanInstalledPlugins(profileName?: string): Record<string, InstalledPluginInfo>;
/**
 * 判定是否为核心基础运行系统包（不属于可卸载扩展）
 */
export declare function isCoreSystemPackage(name: string): boolean;
/**
 * 判定包名是否为 DSH 相关插件
 */
export declare function isDshPluginName(name: string): boolean;
/**
 * 自动扫描并急救修复当前及所有 Profile 中缺少 dsh.bundle.patch 的插件
 * 彻底消除: Error: dsh: profile bundle "xxx" declares no dsh.bundle in its package.json (退出码 1)
 */
export declare function rescueDshBundles(profileName?: string): number;
//# sourceMappingURL=profile.d.ts.map