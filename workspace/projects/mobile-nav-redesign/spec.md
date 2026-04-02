# Mobile Nav Redesign — 規格書

## 背景與目標

目前 app 底部導覽列在 5 個頁面以上時，使用者點錯率明顯上升（內部數據：誤點率 18%）。本次改版目標：

- 誤點率降至 8% 以下
- 在 iOS / Android 主流機型上 touch target 符合 WCAG 2.5.5（至少 44×44pt）
- 視覺層級清晰，當前頁面狀態一眼可辨

---

## 現況問題

| 問題 | 嚴重程度 |
|---|---|
| 圖示過小（24px），間距不足 | 高 |
| Active 狀態只靠顏色區分，色盲使用者無法辨別 | 高 |
| 超過 5 個項目時擠在同一排，沒有 overflow 處理 | 中 |
| 底部安全區（Home Indicator）未正確 padding | 中 |

---

## 設計決策

### 1. Touch Target 擴大

圖示本身維持 24px，但可點擊區域擴展至 48×48pt，用透明 padding 實現，不影響視覺密度。

### 2. Active 狀態多重指示

同時使用：顏色（primary blue）+ 底部 indicator bar（3px 圓角線條）+ 圖示輕微放大（1.1x scale）。三重指示確保色盲友善。

### 3. 超過 5 個項目的處理

第 5 個位置固定為「更多」，展開 bottom sheet 列出其餘項目。bottom sheet 採用 drag handle + 半透明背景。

### 4. 安全區處理

底部加入 `env(safe-area-inset-bottom)` padding，確保 iPhone 全面屏機型不被 Home Indicator 遮擋。

---

## 互動規格

```
使用者點擊 nav item
  → haptic feedback（輕觸，iOS: .light, Android: VIRTUAL_KEY）
  → 圖示 scale 動畫 100% → 90% → 110% → 100%，duration 200ms, easing ease-out
  → 頁面切換用 slide transition（同層級：fade，上下層級：slide up/down）
```

---

## 驗收標準

- [ ] 所有 touch target ≥ 44×44pt（用 Xcode Accessibility Inspector 驗證）
- [ ] Active 狀態在 Deuteranopia 模擬下可辨別
- [ ] 底部安全區在 iPhone 15 Pro / Samsung S24 實機測試通過
- [ ] 動畫在低電量模式（Reduce Motion 開啟）下自動降級為 fade
- [ ] 5+ 項目的「更多」bottom sheet 在 VoiceOver / TalkBack 下可操作
