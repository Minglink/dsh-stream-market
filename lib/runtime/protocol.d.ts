import { EventEmitter } from 'node:events';
import type { DshProtocolInstallParams } from '../types.js';
export declare const DSH_PROTOCOL_SCHEME = "dsh:";
export declare const DSH_PLUGIN_INSTALL_PATH = "/plugin/install";
/**
 * 校验并解析系统级 dsh:// 一键安装协议 URL
 * 示例: dsh://plugin/install?id=open-design&name=%E6%89%93%E5%BC%80%20Design&version=1.0.0&repo=nexu-io/open-design
 */
export declare function parseDshProtocolUrl(rawUrl: string): DshProtocolInstallParams;
/**
 * 构造标准 dsh:// 一键安装协议 URL
 */
export declare function buildDshProtocolUrl(params: DshProtocolInstallParams): string;
/**
 * 生成 HTML 一键拉起链接代码 (用于网页/博客/文档)
 */
export declare function generateHtmlBadge(params: DshProtocolInstallParams): string;
/**
 * 生成 Markdown 徽章代码 (用于 GitHub README)
 */
export declare function generateMarkdownBadge(params: DshProtocolInstallParams): string;
/**
 * 根据协议参数执行本地装载流程
 */
export declare function executeProtocolInstall(params: DshProtocolInstallParams, profile?: string): EventEmitter;
//# sourceMappingURL=protocol.d.ts.map