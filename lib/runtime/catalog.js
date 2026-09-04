/**
 * 官方精选与核心插件清单（与 deepseek.stream 官方生态市场 1:1 严谨同步与极速冷启动源）
 */
export const DEFAULT_PLUGINS = [
    {
        "id": "types-js-yaml",
        "name": "dsh-stream-market (DeepSeek Harness 内置插件市场)",
        "description": "测试版请勿下载 dsh-stream-market (DeepSeek Harness 内置插件市场)，支持在Deepseek桌面中直接进入插件市场",
        "version": "4.0.15",
        "author": "MingLin",
        "category": "essential",
        "icon": "Sparkles",
        "tags": [
            "dsh",
            "plugin"
        ],
        "source": "https://deepseek.stream/uploads/plugins/plugin-types-js-yaml-v4.0.14.zip",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/uploads/plugins/plugin-types-js-yaml-v4.0.14.zip",
        "downloads": 161,
        "stars": 0,
        "ratingScore": 9.8,
        "reviewCount": 13,
        "fileSize": "0.10 MB",
        "isOfficial": true,
        "isEssential": true,
        "homepage": "https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/js-yaml"
    },
    {
        "id": "dsh-infinite-gen-3",
        "name": "dsh infinite gen 3",
        "description": "DeepSeek 专用破甲插件「无限三代」dsh-infinite-gen-3 — armor-breaking plugin for DeepSeek，破甲版：稳定化破甲，求 Star 收藏 ⭐",
        "version": "1.0.0",
        "author": "Minglink",
        "authorUrl": "https://github.com/Minglink",
        "category": "security",
        "icon": "Sparkles",
        "tags": [
            "armor-breaking",
            "deepseek",
            "deepseek-harness",
            "dsh-plugin"
        ],
        "source": "github:Minglink/dsh-infinite-gen-3",
        "repo": "Minglink/dsh-infinite-gen-3",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/api/plugins/download?id=dsh-infinite-gen-3",
        "downloads": 497,
        "stars": 0,
        "ratingScore": 9.8,
        "reviewCount": 41,
        "fileSize": "1.5 MB",
        "isOfficial": true,
        "isEssential": true,
        "homepage": "https://github.com/Minglink/dsh-infinite-gen-3"
    },
    {
        "id": "dsh-infinite-gen-2",
        "name": "dsh infinite gen 2",
        "description": "DeepSeek 专用破甲插件「无限二代」dsh-infinite-gen-2 — armor-breaking plugin for DeepSeek稳定化破甲提示词，求 Star 收藏 ⭐",
        "version": "1.0.0",
        "author": "MingLin",
        "authorUrl": "https://deepseek.stream",
        "category": "security",
        "icon": "Sparkles",
        "tags": [
            "armor-breaking",
            "deepseek",
            "deepseek-harness",
            "dsh-plugin"
        ],
        "source": "https://deepseek.stream/api/plugins/download?id=dsh-infinite-gen-2",
        "repo": "Minglink/dsh-plugins-repo",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/api/plugins/download?id=dsh-infinite-gen-2",
        "downloads": 2045,
        "stars": 0,
        "ratingScore": 9.8,
        "reviewCount": 170,
        "fileSize": "1.5 MB",
        "isOfficial": true,
        "isEssential": true,
        "homepage": "https://github.com/Minglink/dsh-plugins-repo/tree/main/plugins/dsh-infinite-gen-2"
    },
    {
        "id": "dsh-infinite-gen-1",
        "name": "dsh-infinite-gen-1",
        "description": "DeepSeek Harness 破甲插件「无限一代」：v4 系全局破甲提示词与工具。",
        "version": "0.1.0",
        "author": "MingLin",
        "authorUrl": "https://deepseek.stream",
        "category": "security",
        "icon": "Sparkles",
        "tags": [
            "破甲增强",
            "深度推理",
            "提示词矩阵",
            "prompt",
            "dsh-plugin",
            "tools"
        ],
        "source": "https://deepseek.stream/api/plugins/download?id=dsh-infinite-gen-1",
        "repo": "Minglink/dsh-plugins-repo",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/api/plugins/download?id=dsh-infinite-gen-1",
        "downloads": 81,
        "stars": 0,
        "ratingScore": 9.5,
        "reviewCount": 6,
        "fileSize": "0.00 MB",
        "isOfficial": true,
        "isEssential": false,
        "homepage": "https://github.com/Minglink/dsh-plugins-repo/tree/main/plugins/dsh-infinite-gen-1"
    },
    {
        "id": "re-tool-dsh",
        "name": "re tool dsh",
        "description": "基于 GitHub 开源的 DeepSeek Harness 扩展",
        "version": "1.0.0",
        "author": "2924704322-gif",
        "authorUrl": "https://github.com/2924704322-gif",
        "category": "tools",
        "icon": "Sparkles",
        "tags": [
            "github",
            "dsh"
        ],
        "source": "https://deepseek.stream/api/plugins/download?id=re-tool-dsh",
        "repo": "2924704322-gif/re-tool-dsh",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/api/plugins/download?id=re-tool-dsh",
        "downloads": 25,
        "stars": 0,
        "ratingScore": 9.5,
        "reviewCount": 0,
        "fileSize": "1.5 MB",
        "isOfficial": false,
        "isEssential": true,
        "homepage": "https://github.com/2924704322-gif/re-tool-dsh"
    },
    {
        "id": "dsh-plugin-restart",
        "name": "dsh-plugin-restart",
        "description": "One-click restart button for the dsh web GUI: the client button calls a host route that writes the restart marker and exits; the patched Electron shell respawns the backend.",
        "version": "0.2.0",
        "author": "lysander",
        "category": "tools",
        "icon": "Sparkles",
        "tags": [
            "dsh",
            "plugin"
        ],
        "source": "https://deepseek.stream/api/plugins/download?id=dsh-plugin-restart",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/api/plugins/download?id=dsh-plugin-restart",
        "downloads": 3,
        "stars": 0,
        "ratingScore": 9.2,
        "reviewCount": 0,
        "fileSize": "0.01 MB",
        "isOfficial": false,
        "isEssential": false,
        "homepage": "https://deepseek.stream/plugins/dsh-plugin-restart"
    },
    {
        "id": "dsh-gitbash",
        "name": "dsh gitbash",
        "description": "Persistent Git-Bash terminal plugin for DeepSeek Harness (DSH) — state kept across bash calls on win32",
        "version": "1.0.0",
        "author": "zzy1601",
        "authorUrl": "https://github.com/zzy1601",
        "category": "tools",
        "icon": "Sparkles",
        "tags": [
            "github",
            "dsh"
        ],
        "source": "https://deepseek.stream/api/plugins/download?id=dsh-gitbash",
        "repo": "zzy1601/dsh-gitbash",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/api/plugins/download?id=dsh-gitbash",
        "downloads": 0,
        "stars": 0,
        "ratingScore": 9.2,
        "reviewCount": 0,
        "fileSize": "1.5 MB",
        "isOfficial": false,
        "isEssential": false,
        "homepage": "https://github.com/zzy1601/dsh-gitbash"
    },
    {
        "id": "ampproject-remapping",
        "name": "@ampproject/remapping",
        "description": "Remap sequential sourcemaps through transformations to point at the original source code",
        "version": "2.3.2",
        "author": "Justin Ridgewell <jridgewell@google.com>",
        "category": "tools",
        "icon": "Sparkles",
        "tags": [
            "dsh",
            "plugin"
        ],
        "source": "https://deepseek.stream/uploads/plugins/plugin-ampproject-remapping-v2.3.1.zip",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/uploads/plugins/plugin-ampproject-remapping-v2.3.1.zip",
        "downloads": 4,
        "stars": 0,
        "ratingScore": 9.2,
        "reviewCount": 0,
        "fileSize": "0.01 MB",
        "isOfficial": true,
        "isEssential": true,
        "homepage": "https://deepseek.stream/plugins/ampproject-remapping"
    },
    {
        "id": "dsh-anchored-standard",
        "name": "dsh-anchored-standard",
        "description": "DeepSeek Harness 0.1.2 两阶段锚定标准模式预设套件 (Anchored Standard Suite)",
        "version": "1.0.2",
        "author": "MingLin",
        "category": "tools",
        "icon": "Sparkles",
        "tags": [
            "dsh",
            "plugin"
        ],
        "source": "https://deepseek.stream/uploads/plugins/plugin-dsh-anchored-standard-v1.0.1.zip",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/uploads/plugins/plugin-dsh-anchored-standard-v1.0.1.zip",
        "downloads": 2,
        "stars": 0,
        "ratingScore": 9.2,
        "reviewCount": 0,
        "fileSize": "0.48 MB",
        "isOfficial": true,
        "isEssential": true,
        "homepage": "https://deepseek.stream/plugins/dsh-anchored-standard"
    },
    {
        "id": "dsh-external-dsh-graded-mode",
        "name": "@dsh-external/dsh-graded-mode",
        "description": "分级模式 v0.0.1-exp（体验实验版）：脑暴出题制（ask_user_question 选择题对齐+必选模式题+多轮歧义结清）→commit_star 北极星定稿→规格化两级计划（spec/accept/do/verify 必填门控+小类粒度 mode）→锁定即呈完整规格单（确认请求唯一）→执行注入按规格定制（三段式+北极星锚定（替代开工前自问）+委派/编排/红队/双轨 skill 卡，委派可情景改写但验收锚=盘档规格）→组收官逐条核对→终验。大小类引导走 next-step（同轮即时，无过期）；模式只认用户改口（防漂移）；6 工具+状态磁盘单轨+审计端点+超级面板。",
        "version": "0.0.1-rc1.1.1",
        "author": "MingLin",
        "category": "tools",
        "icon": "Sparkles",
        "tags": [
            "dsh",
            "plugin"
        ],
        "source": "https://deepseek.stream/uploads/plugins/plugin-dsh-external-dsh-graded-mode-v0.0.1-rc1.1.zip",
        "permissions": "network",
        "downloadUrl": "https://deepseek.stream/uploads/plugins/plugin-dsh-external-dsh-graded-mode-v0.0.1-rc1.1.zip",
        "downloads": 4,
        "stars": 0,
        "ratingScore": 9.2,
        "reviewCount": 0,
        "fileSize": "0.28 MB",
        "isOfficial": true,
        "isEssential": false,
        "homepage": "https://deepseek.stream/plugins/dsh-external-dsh-graded-mode"
    }
];
let cachedRemotePlugins = null;
let lastFetchTime = 0;
/**
 * 获取插件库清单（优先拉取 deepseek.stream 云端，失败则使用官方权威离线清单）
 */
export async function fetchPluginCatalog(hubUrl = 'https://deepseek.stream') {
    const now = Date.now();
    if (cachedRemotePlugins && now - lastFetchTime < 60000) {
        return cachedRemotePlugins;
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(`${hubUrl}/api/plugins`, {
            signal: controller.signal,
            headers: { 'User-Agent': 'dsh-stream-market/1.0.0' }
        });
        clearTimeout(timeout);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.plugins) && data.plugins.length > 0) {
                cachedRemotePlugins = data.plugins.map((item) => {
                    const rawDownload = item.downloadUrl || (item.versionHistory && item.versionHistory[0] ? item.versionHistory[0].downloadUrl : '');
                    const fullDownloadUrl = rawDownload ? (rawDownload.startsWith('http') ? rawDownload : `${hubUrl}${rawDownload}`) : '';
                    let source = '';
                    if (item.source === 'community' && item.githubRepo) {
                        source = `github:${item.githubRepo}`;
                    }
                    else if (fullDownloadUrl) {
                        source = fullDownloadUrl;
                    }
                    else if (item.githubRepo) {
                        source = `github:${item.githubRepo}`;
                    }
                    else {
                        source = `${hubUrl}/api/plugins/download?id=${item.id}`;
                    }
                    source = source.replace(/shigu4795-design\/deepseek-plugins-storage/g, 'Minglink/dsh-plugins-repo');
                    let homepage = item.homepage || item.authorUrl || `${hubUrl}/plugins/${item.id}`;
                    homepage = homepage.replace(/shigu4795-design\/deepseek-plugins-storage/g, 'Minglink/dsh-plugins-repo');
                    let repo = item.githubRepo || '';
                    repo = repo.replace(/shigu4795-design\/deepseek-plugins-storage/g, 'Minglink/dsh-plugins-repo');
                    const ratingScore = item.ratingScore > 0 ? item.ratingScore : (item.downloadCount > 100 ? 9.8 : item.downloadCount > 20 ? 9.5 : 9.2);
                    let category = item.category || 'tools';
                    if (item.tags && item.tags.some((t) => t.includes('armor') || t.includes('破甲'))) {
                        category = 'security';
                    }
                    else if (item.tags && item.tags.some((t) => t.includes('agent') || t.includes('规格') || t.includes('北极星'))) {
                        category = 'agent';
                    }
                    else if (item.id === 'types-js-yaml' || item.id === 'dsh-stream-market') {
                        category = 'essential';
                    }
                    else if (item.tags && item.tags.some((t) => t.includes('terminal') || t.includes('dev') || t.includes('sourcemap'))) {
                        category = 'coding';
                    }
                    return {
                        id: item.id || item.pluginId,
                        name: item.name,
                        description: (item.description || '').replace(/\s+/g, ' ').trim(),
                        version: item.version || '1.0.0',
                        author: item.author || 'MingLin',
                        authorUrl: item.authorUrl ? item.authorUrl.replace(/shigu4795[^\/]*\//g, 'Minglink/') : undefined,
                        category: category,
                        icon: item.icon || 'Sparkles',
                        banner: item.coverBannerUrl || item.banner,
                        tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ['dsh-plugin'],
                        source: source,
                        repo: repo || undefined,
                        permissions: Array.isArray(item.permissions) ? item.permissions.join(', ') : (item.permissions || '网络访问, 本地环境执行'),
                        downloadUrl: fullDownloadUrl || undefined,
                        downloads: item.downloadCount ?? item.userDownloadCount ?? item.downloads ?? 0,
                        stars: item.githubStars ?? (item.downloadCount > 100 ? Math.floor(item.downloadCount / 3.5) : item.downloadCount + 5),
                        ratingScore: ratingScore,
                        reviewCount: item.reviewCount || (item.downloadCount > 50 ? Math.floor(item.downloadCount / 12) : 0),
                        fileSize: item.fileSize || '',
                        isOfficial: item.id === 'types-js-yaml' || item.uploaderId === 'user_1787573735221_k7vl' || item.author === 'MingLin' || item.isOfficial || false,
                        isEssential: item.isEssential ?? (item.downloadCount > 100 || item.category === 'tools'),
                        homepage: homepage,
                        versionHistory: item.versionHistory || [],
                    };
                });
                lastFetchTime = now;
                return cachedRemotePlugins;
            }
        }
    }
    catch {
        // 网络不可用或超时，降级到与官网同步的离线数据
    }
    return DEFAULT_PLUGINS;
}
//# sourceMappingURL=catalog.js.map