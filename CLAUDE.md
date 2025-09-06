# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 指令

### 開發
```bash
npm run dev          # 使用 Turbopack 啟動開發伺服器 (http://localhost:3000)
npm run build        # 使用 Turbopack 建置生產版本
npm run start        # 啟動生產伺服器
npm run lint         # 執行 ESLint 檢查
```

### TypeScript
```bash
npx tsc --noEmit     # 型別檢查（不產生檔案）
```

## 架構概覽

### 技術堆疊
- **框架**: Next.js 15.5.2 搭配 App Router 和 Turbopack
- **創意圖形**: p5.js（2D 生成式藝術）和 Three.js（3D 圖形）
- **狀態管理**: Zustand 搭配 URL 持久化
- **樣式**: Tailwind CSS v4
- **語言**: TypeScript 嚴格模式

### 核心架構

#### 1. 生成式藝術系統
應用程式實作了模組化的生成式藝術系統，核心包括：

- **Flow Field 生成器** (`components/generators/flow-field/`): 
  - 使用 p5.js 實作基於 Perlin noise 的粒子系統流場
  - 實作物件池模式以提升效能 (ParticlePool.ts)
  - 自訂 p5.js 整合 hook (`hooks/useP5.ts`) 處理生命週期管理
  - 粒子物理與滑鼠互動（吸引/排斥力）

#### 2. 狀態管理模式
- **Zustand Store** (`lib/stores/useFlowFieldStore.ts`):
  - 將參數持久化到 URL 以實現可分享的藝術配置
  - 自訂 URL 儲存適配器用於狀態同步
  - Partialize 函數在序列化時過濾掉方法

#### 3. p5.js 整合策略
- **型別安全的 p5 擴展**: 使用 TypeScript 交集型別定義自訂 p5 方法
  ```typescript
  p5 & { updateParams?: (params: FlowFieldParams) => void }
  ```
- **效能優化**:
  - 使用 useRef 模式建立單一 p5 實例
  - 動態參數更新而不重新建立實例
  - 離屏圖形緩衝區用於軌跡效果

#### 4. 元件架構
- **動態載入**: 控制面板按需載入以減少初始包大小
- **記憶化策略**: React.memo 搭配 useCallback 用於 sketch 函數
- **參數控制系統**: 即時操作並立即視覺回饋

### 關鍵設計模式

1. **物件池模式**: ParticlePool 高效管理多達 10,000 個粒子
2. **命令模式**: updateParams 方法允許執行時行為修改
3. **類單例 p5 實例**: 防止多個畫布實例
4. **URL 作為狀態來源**: 實現藝術配置的分享和書籤功能

### 效能考量

- 生產環境中停用 p5.js Friendly Errors System: `disableFriendlyErrors = true`
- 使用 `pixelDensity(1)` 確保跨裝置一致的效能
- 實作幀率監控用於效能除錯
- 在繪製迴圈中批次處理粒子渲染操作

### 型別安全方法

- 嚴格的 TypeScript 配置
- p5.js 擴展的自訂型別定義
- FlowFieldParams 介面用於型別安全的參數傳遞
- 避免 `any` 型別 - 使用特定的型別聯集或交集

### 專案計畫

文件化了兩個實施路徑：
- **V1 (基礎版)**: 核心生成器、參數控制、分享功能（4-5 週）
- **V2 (進階版)**: GPU 粒子、AI 生成、即時協作（雄心勃勃）

詳細路線圖和技術規格請參見 `docs/plans/`。