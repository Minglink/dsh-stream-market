# ⚡ dsh-stream-market (DeepSeek Harness 内置可视化插件市场)

[![GitHub Topics: dsh-plugin](https://img.shields.io/badge/GitHub%20Topic-dsh--plugin-0284c7?style=flat-square&logo=github)](https://github.com/topics/dsh-plugin)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-v0.1.2%2B-2563eb?style=flat-square)](https://github.com/topics/deepseek-harness)
[![Protocol: dsh://](https://img.shields.io/badge/Protocol-dsh%3A%2F%2F%20%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85-0ea5e9?style=flat-square)](https://github.com/topics/dsh-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

> 🚀 **专为 DeepSeek Harness 打造的原生内置可视化插件生态市场与全生命周期管理系统**。  
> 既深度融入 DSH「系统设置」侧边栏，又全面支持官方 **`dsh://`** 一键联动安装协议，实现免命令行、极速秒开、热启停与深度彻底卸载。

---

## 🌟 核心特色 (Core Highlights)

### 1. ⚡ 0ms 瞬时秒开架构与离线高热度生态库
- **杜绝白屏与加载停滞**：内置官方高热度离线生态目录，页面启动毫秒级首屏即刻呈现。
- **并发非阻塞探测**：宿主运行态 (`/health`)、本地已装载清单 (`/installed`) 与云端生态库 (`/catalog`) 并行并发同步，带弹性超时自愈保障。

### 2. 🎨 清爽蓝白科技美学 & 设置左侧栏无缝集成
- **沉浸式体验**：完全融入 DeepSeek Harness「系统设置」侧边栏（与常规设置、模型设置同级排列）。
- **双模视窗体系**：支持嵌入式设置面板视窗与一键全屏沉浸大屏交互（`?fullscreen=1` / 模态全屏展开）。

### 3. 📦 本地插件深度生命周期管理 (支持选择彻底卸载)
- **多选批量粉碎卸载**：可视化列出当前本地已装载的所有第三方插件，支持单选/全选批量粉碎。
- **零垃圾残留保障**：一次性清理 `cordis.patch.yml` 配置规则、`package.json` 依赖声明及本地代码文件，保持环境绝对纯净。
- **运行态自动急救与自愈**：内置 Profile Bundle 隐患自动诊断通道，防止配置格式损坏引发宿主崩溃。

### 4. 🔗 官方 `dsh://` 联动协议生态全面支持
- **系统级协议拉起**：支持在网页端、技术博客或 Markdown 文档中点击直接唤起官方桌面端 (EXE) 自动化装载。
- **协议开发套件**：内置可视化协议构造器、URL 解析器与 Markdown / HTML 官方徽章一键生成。

### 5. 🛡️ 严格的数据脱敏与进程沙箱隔离
- **宿主凭据零接触**：严禁拦截、读取或上报宿主管理员令牌、API Key 与私有模型密钥。
- **白名单清洗**：本地扫描仅限插件名称、版本与启停开关，无隐私外泄通道。

---

## 🚀 极速安装与接入指南

### 方式 1：通过官方 `dsh://` 协议一键唤起安装（推荐）

在浏览器中直接点击下方安装协议直链，即可唤起 DeepSeek Harness 官方桌面端完成原子化安装：

[![一键装载到 DeepSeek Harness](https://img.shields.io/badge/DSH-一键装载插件市场-0284c7?style=for-the-badge&logo=deepseek)](dsh://plugin/install?id=dsh-stream-market&name=Stream%E6%8F%92%E4%BB%B6%E5%B8%82%E5%9C%BA&version=1.0.0&repo=Minglink/dsh-stream-market&permissions=%E7%BD%91%E7%BB%9C%E8%AE%BF%E9%97%AE,%20%E6%9C%AC%E5%9C%B0%E7%8E%AF%E5%A2%83%E6%89%A7%E8%A1%8C,%20%E6%89%A9%E5%B1%95%E7%AE%A1%E7%90%86%E5%99%A8)

协议直链：
```text
dsh://plugin/install?id=dsh-stream-market&name=Stream%E6%8F%92%E4%BB%B6%E5%B8%82%E5%9C%BA&version=1.0.0&repo=Minglink/dsh-stream-market&permissions=%E7%BD%91%E7%BB%9C%E8%AE%BF%E9%97%AE,%20%E6%9C%AC%E5%9C%B0%E7%8E%AF%E5%A2%83%E6%89%A7%E8%A1%8C,%20%E6%89%A9%E5%B1%95%E7%AE%A1%E7%90%86%E5%99%A8
```

---

### 方式 2：在当前 DSH Profile 目录中极速安装

进入您的 DeepSeek Harness 运行配置目录（如 `~/.dsh/profiles/web`）：

```bash
# 1. 安装本插件
npm install https://github.com/Minglink/dsh-stream-market.git

# 2. 启用插件补丁（在 cordis.patch.yml 中声明）
# 插件将自动启动 Bridge 服务并在系统设置中挂载「⚡ 插件市场」
```

---

### 方式 3：独立开发者调试模式 (Standalone)

```bash
git clone https://github.com/Minglink/dsh-stream-market.git
cd dsh-stream-market
npm install
npm run build
npm start
```

启动后即可在浏览器中访问 `http://127.0.0.1:18899/` 体验全功能插件市场与本地扩展管理控制台。

---

## 🔌 官方 `dsh://` 联动协议规范

### 1. 统一资源标识符定义 (URI Scheme)
```text
dsh://plugin/install?id={id}&name={name}&version={version}&repo={repo}&permissions={permissions}&downloadUrl={downloadUrl}
```

### 2. 参数字典

| 参数名 | 类型 | 是否必填 | 规范说明 |
| :--- | :---: | :---: | :--- |
| `id` | `string` | **必填** | 插件唯一标识符（如 `dsh-infinite-gen-3`） |
| `name` | `string` | **必填** | 插件展示名称（URL 编码） |
| `version` | `string` | **必填** | 语义化版本号（如 `1.0.0`） |
| `repo` | `string` | **必填** | GitHub 仓库或 npm 包名 |
| `permissions` | `string` | 可选 | 申请的宿主权限声明 |
| `downloadUrl` | `string` | 可选 | 备用离线分发直链 |

---

## 📂 项目结构

```text
dsh-stream-market/
├── client.js             # DSH 设置侧栏注入与沉浸全屏控制组件
├── cordis.patch.yml      # DSH 容器自愈与扩展启停规则声明
├── index.js              # 微内核入口转接器
├── package.json          # 依赖与 dsh 扩展元数据
├── tsconfig.json         # TypeScript 构建配置
├── src/
│   ├── index.ts          # 核心插件生命周期接入
│   ├── bridge/           # 特权通信 Bridge 与 REST/SSE 服务端
│   ├── runtime/          # 协议解析、工作区扫描与深度卸载执行器
│   └── client/           # 蓝白极简现代化单页应用
├── lib/                  # 编译后生产就绪产物
└── docs/
    └── index.html        # 官方产品特色宣传与在线一键安装展示页
```

---

## 🤝 社区贡献与主题合并

本项目作为 **[dsh-plugin](https://github.com/topics/dsh-plugin)** 官方插件生态社区的核心基础设施，遵循开源共享精神。欢迎提交 Pull Request 或 Issue 共同完善生态建设！

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。
