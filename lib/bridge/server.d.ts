import { type IncomingMessage, type ServerResponse } from 'node:http';
import type { MarketConfig } from '../types.js';
export declare class MarketBridgeServer {
    private server;
    private config;
    constructor(config?: MarketConfig);
    /**
     * 核心请求分发器（可供独立 Server 调用，亦可接入 DSH 内置 WebServer）
     */
    handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void>;
    /**
     * 启动独立本地服务
     */
    start(): Promise<number>;
    stop(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map