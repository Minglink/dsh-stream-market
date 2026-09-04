import { createServer } from 'node:http';
import { URL } from 'node:url';
import { getHostEnvironment, resolveProfileDir, scanInstalledPlugins, rescueDshBundles } from '../runtime/profile.js';
import { setPluginPatchState } from '../runtime/patch.js';
import { installer } from '../runtime/installer.js';
import { fetchPluginCatalog } from '../runtime/catalog.js';
import { renderMarketplaceHtml } from '../client/html.js';
import { parseDshProtocolUrl, buildDshProtocolUrl, executeProtocolInstall, generateHtmlBadge, generateMarkdownBadge, } from '../runtime/protocol.js';
export class MarketBridgeServer {
    server = null;
    config;
    constructor(config = {}) {
        this.config = {
            profile: 'web',
            port: 18899,
            hubUrl: 'https://deepseek.stream',
            ...config,
        };
    }
    /**
     * 核心请求分发器（可供独立 Server 调用，亦可接入 DSH 内置 WebServer）
     */
    async handleRequest(req, res) {
        const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
        const pathname = parsedUrl.pathname;
        const profile = this.config.profile || 'web';
        const profileDir = resolveProfileDir(profile);
        // CORS 跨域响应头（允许 deepseek.stream 与本地 DSH 前端访问）
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
        // 1. 首页：可视化内置商城客户端
        if (pathname === '/' || pathname === '/market') {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(renderMarketplaceHtml(this.config.hubUrl));
            return;
        }
        // 2. 健康检查与宿主信息
        if (pathname === '/api/market/health') {
            const info = getHostEnvironment(profile);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(info));
            return;
        }
        // 3. 扫描本地已安装插件与启用状态
        if (pathname === '/api/market/installed') {
            const installed = scanInstalledPlugins(profile);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ profile, installed }));
            return;
        }
        // 4. 插件生态库目录检索 (纯实时动态官网同步)
        if (pathname === '/api/market/catalog') {
            try {
                const force = parsedUrl.searchParams.get('force') === 'true';
                const plugins = await fetchPluginCatalog(this.config.hubUrl, force);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ plugins }));
            }
            catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message, plugins: [] }));
            }
            return;
        }
        // 5. 极速装载插件 (SSE 实时日志流)
        if (pathname === '/api/market/install') {
            const pluginId = parsedUrl.searchParams.get('id');
            const source = parsedUrl.searchParams.get('source');
            if (!pluginId || !source) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '缺少 id 或 source 参数' }));
                return;
            }
            res.writeHead(200, {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            });
            const emitter = installer.install(pluginId, source, profile);
            const onData = (evt) => {
                res.write(`data: ${JSON.stringify(evt)}\n\n`);
            };
            emitter.on('data', onData);
            emitter.once('end', () => {
                emitter.off('data', onData);
                res.end();
            });
            emitter.once('error', (err) => {
                emitter.off('data', onData);
                res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
                res.end();
            });
            req.on('close', () => {
                emitter.off('data', onData);
            });
            return;
        }
        // 6. 热启停切换插件 (更新 cordis.patch.yml)
        if (pathname === '/api/market/toggle' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const { id, enabled } = JSON.parse(body || '{}');
                    if (!id || typeof enabled !== 'boolean') {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: '参数不合法' }));
                        return;
                    }
                    const ok = setPluginPatchState(profileDir, id, enabled);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: ok }));
                }
                catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }
        // 7. 单插件卸载
        if (pathname === '/api/market/uninstall' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const { id, cleanFiles = true, cleanConfig = true, cleanSource = false } = JSON.parse(body || '{}');
                    if (!id) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: '缺少 id 参数' }));
                        return;
                    }
                    installer.cleanUninstall([id], profile, { cleanFiles, cleanConfig, cleanSource });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                }
                catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }
        // 7.1. 批量选择彻底卸载 (SSE 实时日志流 / JSON 响应)
        if (pathname === '/api/market/clean-uninstall' && (req.method === 'POST' || req.method === 'GET')) {
            const isStream = parsedUrl.searchParams.get('stream') === '1' || req.headers.accept?.includes('text/event-stream');
            let ids = [];
            let cleanFiles = true;
            let cleanConfig = true;
            let cleanSource = false;
            if (req.method === 'GET') {
                const rawIds = parsedUrl.searchParams.get('ids') || '';
                ids = rawIds.split(',').map(s => s.trim()).filter(Boolean);
                cleanFiles = parsedUrl.searchParams.get('cleanFiles') !== 'false';
                cleanConfig = parsedUrl.searchParams.get('cleanConfig') !== 'false';
                cleanSource = parsedUrl.searchParams.get('cleanSource') === 'true';
            }
            const executeClean = (targetIds, opts) => {
                if (!targetIds.length) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '未提供待卸载的插件 ID 列表' }));
                    return;
                }
                if (isStream) {
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream; charset=utf-8',
                        'Cache-Control': 'no-cache, no-transform',
                        'Connection': 'keep-alive',
                    });
                    const emitter = installer.cleanUninstall(targetIds, profile, opts);
                    const onData = (evt) => res.write(`data: ${JSON.stringify(evt)}\n\n`);
                    emitter.on('data', onData);
                    emitter.once('end', () => {
                        emitter.off('data', onData);
                        res.end();
                    });
                    emitter.once('error', (err) => {
                        emitter.off('data', onData);
                        res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
                        res.end();
                    });
                    req.on('close', () => {
                        emitter.off('data', onData);
                    });
                }
                else {
                    const emitter = installer.cleanUninstall(targetIds, profile, opts);
                    emitter.once('end', () => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, count: targetIds.length }));
                    });
                    emitter.once('error', (err) => {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: err.message }));
                    });
                }
            };
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body || '{}');
                        ids = Array.isArray(data.ids) ? data.ids : (data.id ? [data.id] : []);
                        cleanFiles = data.cleanFiles !== false;
                        cleanConfig = data.cleanConfig !== false;
                        cleanSource = data.cleanSource === true;
                        executeClean(ids, { cleanFiles, cleanConfig, cleanSource });
                    }
                    catch (err) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'JSON 解析异常: ' + err.message }));
                    }
                });
            }
            else {
                executeClean(ids, { cleanFiles, cleanConfig, cleanSource });
            }
            return;
        }
        // 7.2. 运行时一键急救与自愈 (修复 profile bundle ... declares no dsh.bundle)
        if (pathname === '/api/market/rescue' && (req.method === 'POST' || req.method === 'GET')) {
            try {
                const fixedCount = rescueDshBundles(profile);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, fixedCount, message: `急救成功！已修复/净化 ${fixedCount} 处 bundle 配置隐患` }));
            }
            catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
            return;
        }
        // 8. 协议解析端点: GET /api/market/protocol/parse?url=dsh://...
        if (pathname === '/api/market/protocol/parse') {
            const rawUrl = parsedUrl.searchParams.get('url');
            if (!rawUrl) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: '缺少 url 参数' }));
                return;
            }
            try {
                const parsed = parseDshProtocolUrl(rawUrl);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, params: parsed }));
            }
            catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
            return;
        }
        // 9. 协议生成端点: POST /api/market/protocol/build
        if (pathname === '/api/market/protocol/build' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const params = JSON.parse(body || '{}');
                    const deepLink = buildDshProtocolUrl(params);
                    const markdownBadge = generateMarkdownBadge(params);
                    const htmlBadge = generateHtmlBadge(params);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        url: deepLink,
                        markdownBadge,
                        htmlBadge,
                    }));
                }
                catch (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }
        // 10. 通过协议 URL 直接安装 (SSE): GET /api/market/protocol/install?url=dsh://...
        if (pathname === '/api/market/protocol/install') {
            const rawUrl = parsedUrl.searchParams.get('url');
            if (!rawUrl) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '缺少 url 参数' }));
                return;
            }
            try {
                const parsed = parseDshProtocolUrl(rawUrl);
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache, no-transform',
                    'Connection': 'keep-alive',
                });
                const emitter = executeProtocolInstall(parsed, profile);
                const onData = (evt) => res.write(`data: ${JSON.stringify(evt)}\n\n`);
                emitter.on('data', onData);
                emitter.once('end', () => {
                    emitter.off('data', onData);
                    res.end();
                });
                emitter.once('error', (err) => {
                    emitter.off('data', onData);
                    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
                    res.end();
                });
                req.on('close', () => {
                    emitter.off('data', onData);
                });
            }
            catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }
        // 11. 用户头像代理端点: GET /api/avatar-proxy?user=...
        if (pathname === '/api/avatar-proxy') {
            const targetUrl = `${this.config.hubUrl}/api/avatar-proxy${parsedUrl.search}`;
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 6000);
                const remoteRes = await fetch(targetUrl, { signal: controller.signal });
                clearTimeout(timeout);
                if (remoteRes.ok) {
                    const contentType = remoteRes.headers.get('content-type') || 'image/png';
                    const buf = Buffer.from(await remoteRes.arrayBuffer());
                    res.writeHead(200, {
                        'Content-Type': contentType,
                        'Cache-Control': 'public, max-age=86400',
                    });
                    res.end(buf);
                    return;
                }
            }
            catch { }
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Avatar not found' }));
            return;
        }
        // 12. 用户登录 / 注册 / 状态 / 退出 (云端同步与本地鉴权双通道)
        if (pathname.startsWith('/api/auth/')) {
            const subpath = pathname.replace('/api/auth', '');
            const targetUrl = `${this.config.hubUrl}/api/auth${subpath}${parsedUrl.search}`;
            let bodyBuffer = '';
            if (req.method === 'POST') {
                const chunks = [];
                for await (const chunk of req) {
                    chunks.push(chunk);
                }
                bodyBuffer = Buffer.concat(chunks).toString('utf-8');
            }
            try {
                const fetchHeaders = {
                    'Content-Type': req.headers['content-type'] || 'application/json',
                    'User-Agent': 'dsh-stream-market/1.0.0',
                };
                if (req.headers.cookie) {
                    fetchHeaders['Cookie'] = req.headers.cookie;
                }
                if (req.headers.authorization) {
                    fetchHeaders['Authorization'] = req.headers.authorization;
                }
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 6000);
                const remoteRes = await fetch(targetUrl, {
                    method: req.method,
                    headers: fetchHeaders,
                    body: bodyBuffer || undefined,
                    signal: controller.signal,
                });
                clearTimeout(timeout);
                const resData = await remoteRes.text();
                const setCookie = remoteRes.headers.get('set-cookie');
                if (setCookie) {
                    res.setHeader('Set-Cookie', setCookie);
                }
                res.writeHead(remoteRes.status, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(resData);
            }
            catch (err) {
                // 网络超时或失败时的优雅离线体验
                if (subpath === '/login') {
                    try {
                        const body = JSON.parse(bodyBuffer || '{}');
                        const acc = body.emailOrUsername || 'Developer';
                        const user = {
                            id: 'local_' + Date.now(),
                            username: acc.includes('@') ? acc.split('@')[0] : acc,
                            email: acc.includes('@') ? acc : `${acc}@deepseek.stream`,
                            role: 'developer',
                            isOffline: true,
                            createdAt: new Date().toISOString(),
                        };
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ user, message: '离线/测试模式已登录' }));
                        return;
                    }
                    catch { }
                }
                if (subpath === '/me') {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ user: null }));
                    return;
                }
                if (subpath === '/logout') {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ success: true }));
                    return;
                }
                res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: '认证代理服务暂时不可用: ' + err.message }));
            }
            return;
        }
        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
    }
    /**
     * 启动独立本地服务
     */
    start() {
        return new Promise((resolve) => {
            this.server = createServer((req, res) => {
                this.handleRequest(req, res).catch(err => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                });
            });
            const port = this.config.port || 18899;
            this.server.listen(port, '127.0.0.1', () => {
                console.log(`[dsh-stream-market] 🚀 内置插件商城服务已就绪 (端口: ${port})`);
                resolve(port);
            });
        });
    }
    stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => resolve());
            }
            else {
                resolve();
            }
        });
    }
}
//# sourceMappingURL=server.js.map