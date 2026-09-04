export interface PatchRow {
    id: string;
    disabled?: boolean;
    [key: string]: any;
}
/**
 * 读取 profileDir 下的 cordis.patch.yml 文件
 */
export declare function readPatchFileState(profileDir: string): Record<string, PatchRow>;
/**
 * 切换插件启用/禁用状态并写回 cordis.patch.yml
 */
export declare function setPluginPatchState(profileDir: string, pluginId: string, enabled: boolean): boolean;
/**
 * 彻底从 cordis.patch.yml 中移除插件的任何配置条目与禁用标记
 */
export declare function removePluginPatchEntry(profileDir: string, pluginId: string): boolean;
//# sourceMappingURL=patch.d.ts.map