/**
 * DeepSeek Harness 前端客户端插件 (Client Half)
 * 将插件市场移入系统设置左侧栏（与通用设置、模型、插件管理同级），支持全屏沉浸视窗
 */
window.__ModuleLoader__.load({
  id: "dsh-stream-market",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    let react = require("react");
    const inject = ["slots"];

    // 模态弹窗（全屏视窗展开容器）
    let fullscreenOverlay = null;

    function getOrCreateFullscreenOverlay() {
      if (fullscreenOverlay && document.body.contains(fullscreenOverlay)) {
        return fullscreenOverlay;
      }

      var style = document.getElementById("dsh-market-fullscreen-style");
      if (!style) {
        style = document.createElement("style");
        style.id = "dsh-market-fullscreen-style";
        style.textContent = `
          #dsh-market-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(8px);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          #dsh-market-modal-overlay.active {
            display: flex;
          }
          #dsh-market-modal-container {
            width: 95vw;
            max-width: 1560px;
            height: 92vh;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #cbd5e1;
            box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.25);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .dsh-market-modal-header {
            height: 48px;
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
          }
          .dsh-market-modal-title {
            font-size: 14px;
            font-weight: 600;
            color: #0284c7;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .dsh-market-modal-close {
            background: none;
            border: none;
            color: #64748b;
            font-size: 24px;
            cursor: pointer;
            line-height: 1;
            transition: color 0.15s;
          }
          .dsh-market-modal-close:hover {
            color: #0f172a;
          }
          #dsh-market-modal-frame {
            width: 100%;
            flex: 1;
            border: none;
            background: #f8fafc;
          }
        `;
        document.head.appendChild(style);
      }

      var overlay = document.createElement("div");
      overlay.id = "dsh-market-modal-overlay";
      overlay.innerHTML = `
        <div id="dsh-market-modal-container">
          <div class="dsh-market-modal-header">
            <div class="dsh-market-modal-title">
              <span>⚡</span>
              <span>DeepSeek Harness 插件生态市场 · 全屏视窗</span>
            </div>
            <button class="dsh-market-modal-close" id="dsh-market-close-btn">&times;</button>
          </div>
          <iframe id="dsh-market-modal-frame" src="http://127.0.0.1:18899/?fullscreen=1" allow="clipboard-read; clipboard-write; fullscreen"></iframe>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector("#dsh-market-close-btn").addEventListener("click", function () {
        overlay.classList.remove("active");
      });

      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });

      fullscreenOverlay = overlay;
      return fullscreenOverlay;
    }

    function openMarketFullscreen() {
      var overlay = getOrCreateFullscreenOverlay();
      overlay.classList.add("active");
      var frame = document.getElementById("dsh-market-modal-frame");
      if (frame && !frame.src) {
        frame.src = "http://127.0.0.1:18899/?fullscreen=1";
      }
    }

    // 设置左侧栏接入组件
    function MarketSettingsPage() {
      const hostRef = (0, react.useRef)(null);

      (0, react.useEffect)(() => {
        const root = hostRef.current;
        if (!root) return;

        const container = document.createElement("div");
        container.id = "dsh-market-settings-wrapper";
        container.style.cssText = `
          width: 100%;
          height: calc(100vh - 100px);
          min-height: 640px;
          display: flex;
          flex-direction: column;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
        `;

        const iframe = document.createElement("iframe");
        iframe.src = "http://127.0.0.1:18899/?embedded=1";
        iframe.style.cssText = "width: 100%; height: 100%; border: none; background: #f8fafc;";
        iframe.allow = "clipboard-read; clipboard-write; fullscreen";

        container.appendChild(iframe);
        root.appendChild(container);

        // 监听来自市场 iframe 的全屏或交互广播
        const handleMessage = (event) => {
          if (event.data && (event.data.type === "dsh-market-open-fullscreen" || event.data.type === "dsh-market-expand")) {
            openMarketFullscreen();
          }
        };
        window.addEventListener("message", handleMessage);

        return () => {
          window.removeEventListener("message", handleMessage);
          container.remove();
        };
      }, []);

      return (0, react.createElement)("div", {
        ref: hostRef,
        style: { width: "100%", height: "100%", minHeight: "640px" }
      });
    }

    function apply(ctx) {
      // 1. 注册到系统设置左侧栏
      if (ctx && ctx.slots) {
        ctx.effect(() => {
          return ctx.slots.inject("settings.section", () => ctx.slots.register({
            name: "settings.section",
            id: "stream-market",
            order: 48,
            label: () => "⚡ 插件市场"
          }, () => (0, react.createElement)(MarketSettingsPage)));
        }, "stream-market: settings section");
      }

      // 2. 挂载全局唤起 API 与消息监听
      window.openDshMarket = openMarketFullscreen;
      window.addEventListener("message", (event) => {
        if (event.data && (event.data.type === "dsh-market-open-fullscreen" || event.data.type === "dsh-market-expand")) {
          openMarketFullscreen();
        }
      });
    }

    exports.name = "dsh-stream-market";
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
