# 🎨 生成式藝術畫廊 - 專案總覽

## 專案簡介
一個展示創意編程與現代 Web 技術的生成式藝術平台，結合 p5.js、Three.js、AI 等技術，創造令人驚艷的互動藝術體驗。

## 📁 專案計畫文件

專案提供兩個版本的詳細實施計畫：

### [📘 基礎版 (V1)](./docs/plans/PROJECT_PLAN_V1.md)
穩定可靠的實施方案，適合 4-5 週開發週期
- 核心生成器實現
- 參數控制系統  
- 社群分享功能
- 基礎效能優化

### [📗 進階版 (V2)](./docs/plans/PROJECT_PLAN_V2.md)
技術極限挑戰，打造讓面試官驚艷的作品
- 百萬級 GPU 粒子系統
- AI 藝術生成
- 即時協作功能
- WebAssembly 加速

### [📚 完整文檔](./docs/plans/README.md)
查看詳細對比與選擇建議

---

## 快速開始

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置專案
npm run build
```

## 技術棧

- **框架**: Next.js 15 (App Router)
- **3D 圖形**: Three.js + React Three Fiber
- **2D 藝術**: p5.js
- **狀態管理**: Zustand
- **樣式**: Tailwind CSS
- **語言**: TypeScript

## 專案結構

```
artistic-gallery/
├── app/                # Next.js App Router
├── components/         # React 元件
├── lib/               # 核心邏輯
├── docs/              # 文檔
│   └── plans/         # 專案計畫
└── public/            # 靜態資源
```

## 選擇你的路徑

- 🚀 **想要快速完成？** → 查看 [V1 計畫](./docs/plans/PROJECT_PLAN_V1.md)
- 💪 **追求技術極限？** → 查看 [V2 計畫](./docs/plans/PROJECT_PLAN_V2.md)
- 🤔 **還在猶豫？** → 閱讀 [選擇指南](./docs/plans/README.md)

---

*選擇適合的版本，開始創造令人驚艷的藝術作品！*