/**
 * 内置官方精选与核心插件清单（离线备份与极速冷启动源）
 */
export const DEFAULT_PLUGINS = [
    {
        id: 'dsh-infinite-gen-2',
        name: '⚡ 无限三代 (Infinite Gen 2)',
        description: '官方旗舰级增强插件：彻底释放思考上限，解锁双通道深度推理，全方位提升代码生成与逻辑突破能力。',
        version: '2.5.0',
        author: 'MingLin',
        category: 'essential',
        tags: ['官方必装', '无限思考', '双通道推理', '生产力爆表'],
        source: 'github:shigu4795-design/deepseek-plugins-storage#path=plugins/dsh-infinite-gen-2',
        downloads: 12480,
        stars: 580,
        isOfficial: true,
        isEssential: true,
        homepage: 'https://deepseek.stream/plugin/dsh-infinite-gen-2',
    },
    {
        id: 'dsh-better-sidebar',
        name: '🎨 极致侧边栏 (Better Sidebar)',
        description: 'DeepSeek Harness 现代化侧栏界面增强，支持会话分组、智能置顶、历史沉降与快捷按键导航。',
        version: '1.4.2',
        author: 'MingLin',
        category: 'efficiency',
        tags: ['UI增强', '会话分组', '丝滑动效', '沉浸式'],
        source: 'github:shigu4795-design/deepseek-plugins-storage#path=plugins/dsh-better-sidebar',
        downloads: 9320,
        stars: 412,
        isOfficial: true,
        isEssential: true,
    },
    {
        id: 'dsh-deep-whale',
        name: '🐋 智囊鲸鱼 (Deep Whale Agent)',
        description: '自主多步规划与工具调度 Agent 引擎，支持终端自执行、自动找 Bug、跨文件重构与沙箱仿真。',
        version: '1.8.0',
        author: 'MingLin',
        category: 'agent',
        tags: ['Autonomous', 'Agent', 'Tool Calling', '极客首选'],
        source: 'github:shigu4795-design/deepseek-plugins-storage#path=plugins/dsh-deep-whale',
        downloads: 8750,
        stars: 395,
        isOfficial: true,
        isEssential: true,
    },
    {
        id: 'dsh-plugin-latex',
        name: '📐 极速 LaTeX 公式渲染器',
        description: '秒级渲染复杂科学公式与矩阵，支持高对比度高亮、一键导出矢量 SVG / PNG 及剪贴板拷贝。',
        version: '1.2.0',
        author: 'MingLin',
        category: 'coding',
        tags: ['KaTeX', 'LaTeX', '学术助手', '数学神器'],
        source: 'github:shigu4795-design/deepseek-plugins-storage#path=plugins/dsh-plugin-latex',
        downloads: 6420,
        stars: 289,
        isOfficial: true,
    },
    {
        id: 'dsh-theme-cyberpunk',
        name: '🌃 赛博霓虹主题 (Neon Cyberpunk)',
        description: '深黑底色与青粉霓虹呼吸灯效，专为长时间夜间编程调教的视网膜友好级极客色彩方案。',
        version: '1.1.0',
        author: 'MingLin',
        category: 'theme',
        tags: ['暗黑风格', '霓虹高亮', '护眼', '个性化'],
        source: 'github:shigu4795-design/deepseek-plugins-storage#path=plugins/dsh-theme-cyberpunk',
        downloads: 7100,
        stars: 340,
        isOfficial: true,
    },
    {
        id: 'dsh-security-inspector',
        name: '🛡️ 逆向与代码审计护盾 (Security Inspector)',
        description: '实时静态分析模型输入输出中的敏感凭证、硬编码私钥与反序列化漏洞特征，提供代码沙箱拦截。',
        version: '1.3.1',
        author: 'MingLin',
        category: 'security',
        tags: ['代码审计', '安全护盾', '合规扫描', '逆向分析'],
        source: 'github:shigu4795-design/deepseek-plugins-storage#path=plugins/dsh-security-inspector',
        downloads: 5120,
        stars: 260,
        isOfficial: true,
    },
    {
        id: 'dsh-prompt-studio',
        name: '🧠 提示词工坊 (Prompt Studio)',
        description: '提供结构化系统提示词调校、版本 Diff 对比、自动少样本增强与对抗提示词测试矩阵。',
        version: '1.5.0',
        author: 'MingLin',
        category: 'efficiency',
        tags: ['Prompt', '提示词工程', '调试工具'],
        source: 'github:shigu4795-design/deepseek-plugins-storage#path=plugins/dsh-prompt-studio',
        downloads: 4890,
        stars: 215,
        isOfficial: true,
    },
    {
        id: 'dsh-media-whisper',
        name: '🎙️ 本地语音与音频转录插件',
        description: '集成轻量级本地语音识别，将语音输入秒转为提示词，支持多语言识别与智能分段排版。',
        version: '1.0.4',
        author: 'MingLin',
        category: 'media',
        tags: ['语音识别', 'Whisper', '多模态', '效率神器'],
        source: 'github:shigu4795-design/deepseek-plugins-storage#path=plugins/dsh-media-whisper',
        downloads: 3600,
        stars: 180,
        isOfficial: true,
    }
];
let cachedRemotePlugins = null;
let lastFetchTime = 0;
/**
 * 获取插件库清单（优先拉取 deepseek.stream 云端，失败则使用内置清单）
 */
export async function fetchPluginCatalog(hubUrl = 'https://deepseek.stream') {
    const now = Date.now();
    if (cachedRemotePlugins && now - lastFetchTime < 60000) {
        return cachedRemotePlugins;
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${hubUrl}/api/plugins`, {
            signal: controller.signal,
            headers: { 'User-Agent': 'dsh-stream-market/1.0.0' }
        });
        clearTimeout(timeout);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.plugins) && data.plugins.length > 0) {
                cachedRemotePlugins = data.plugins.map((item) => ({
                    id: item.id || item.pluginId,
                    name: item.name,
                    description: (item.description || '').replace(/\s+/g, ' ').trim(),
                    version: item.version || '1.0.0',
                    author: item.author || 'MingLin',
                    authorUrl: item.authorUrl,
                    category: item.category || 'tools',
                    icon: item.icon || 'Sparkles',
                    banner: item.coverBannerUrl || item.banner,
                    tags: Array.isArray(item.tags) ? item.tags : ['dsh-plugin'],
                    source: item.source === 'community' && item.githubRepo
                        ? `github:${item.githubRepo}`
                        : (item.downloadUrl || item.source || `github:shigu4795-design/deepseek-plugins-storage#path=plugins/${item.id}`),
                    repo: item.githubRepo || item.repo || item.source || '',
                    permissions: Array.isArray(item.permissions) ? item.permissions.join(', ') : (item.permissions || '网络访问, 本地环境执行'),
                    downloadUrl: item.downloadUrl || (item.versionHistory && item.versionHistory[0] ? item.versionHistory[0].downloadUrl : ''),
                    downloads: item.downloadCount ?? item.userDownloadCount ?? item.downloads ?? 0,
                    stars: item.githubStars ?? item.likesCount ?? item.stars ?? 0,
                    ratingScore: item.ratingScore || 9.5,
                    reviewCount: item.reviewCount || 0,
                    fileSize: item.fileSize || '',
                    isOfficial: item.source === 'official' || item.uploaderId === 'user_1787573735221_k7vl' || item.isOfficial || false,
                    isEssential: item.isEssential ?? (item.downloadCount > 100 || item.category === 'tools'),
                    homepage: item.homepage || item.authorUrl,
                    versionHistory: item.versionHistory || [],
                }));
                lastFetchTime = now;
                return cachedRemotePlugins;
            }
        }
    }
    catch {
        // 网络不可用或超时，降级到本地缺省数据
    }
    return DEFAULT_PLUGINS;
}
//# sourceMappingURL=catalog.js.map