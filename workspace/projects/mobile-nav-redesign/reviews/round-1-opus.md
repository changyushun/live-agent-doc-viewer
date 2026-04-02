# Review — Mobile Nav Redesign Spec（Round 1）

**Reviewer:** Claude Opus 4.6
**Date:** 2026-04-01
**Overall:** 規格完整度高，但有兩個細節需要在實作前確認。

---

## 優點

**Touch Target 策略正確。** 用透明 padding 擴大可點擊區域而不改變視覺尺寸，是業界標準做法，不會影響設計師的排版意圖。

**Active 狀態三重指示很好。** 顏色 + indicator bar + scale 三者並用，比只改顏色的設計在 accessibility 上強得多。WCAG 2.5.5 + 色盲友善，這個方向是對的。

**Reduce Motion 降級有考慮到。** 很多規格書忘記這個，這裡寫出來值得讚。

---

## 需要確認的問題

### 問題 1：「更多」底部的第幾個項目固定？

規格寫「第 5 個位置固定為『更多』」，但這樣的話，使用者常用的第 5 個 tab 就永遠進了「更多」抽屜，會造成多一步操作。

**建議討論：** 是否讓使用者自訂前 4 個 pin 的項目？或由使用頻率自動排序？

### 問題 2：Bottom sheet 的關閉手勢衝突

如果頁面內容本身可以垂直滾動（例如通知列表），bottom sheet 的 drag-to-dismiss 手勢和內容滾動手勢會衝突。規格目前沒有處理這個 edge case。

**建議：** 加入「滾動到頂端才啟動 dismiss drag」的邏輯，類似 iOS Maps 的實作。

---

## 小建議（不擋 proceed）

- 驗收標準裡的 Xcode Accessibility Inspector 步驟可以寫更具體，避免 QA 不知道怎麼操作
- haptic feedback 的 Android 規格可以補上 `VibrationEffect.createOneShot` 的參數（duration: 10ms, amplitude: 50）

---

## 結論

**建議：修改後繼續（Revise & Proceed）**

兩個問題解決後即可進入設計稿階段。問題 1 需要 PM 決策，問題 2 需要工程師評估實作成本。
