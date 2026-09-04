import { EventEmitter } from 'node:events';
import type { CleanUninstallOptions } from '../types.js';
export interface InstallTask {
    id: string;
    source: string;
    profile: string;
    eventEmitter: EventEmitter;
}
export declare class PluginInstaller {
    private activeTasks;
    /**
     * 安装插件并返回一个事件流
     */
    install(pluginId: string, source: string, profile?: string): EventEmitter;
    /**
     * 基础卸载插件（内部委托至深度干净卸载管道）
     */
    uninstall(pluginId: string, profile?: string): EventEmitter;
    /**
     * 彻底干净卸载本地插件（支持单选、多选与批量彻底卸载）
     * 彻底清除：cordis.patch 规则、package.json 依赖与 bundles、node_modules 实体、本地插件源
     */
    cleanUninstall(pluginIds: string[], profile?: string, options?: Partial<CleanUninstallOptions>): EventEmitter;
    private runInstallProcess;
    private runFallbackPackageManager;
    private runNpmUninstall;
}
export declare const installer: PluginInstaller;
//# sourceMappingURL=installer.d.ts.map