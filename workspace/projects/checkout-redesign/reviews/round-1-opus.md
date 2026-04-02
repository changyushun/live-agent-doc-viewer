# Review — Checkout Redesign Spec v1（Round 1）

**Reviewer:** Claude Opus 4.6
**Date:** 2026-04-02
**結論：Revise & Proceed**

---

## 優點

**問題診斷有數據支撐，說服力強。** 熱圖分析指出 Step 2 是流失主因、手機用戶佔 83%，這讓後續的設計決策有明確依據，不是憑感覺做設計。

**「步驟壓縮」的決策理由寫得很好。** 說明用戶在意的是「步驟數量的視覺感知」而非「實際欄位數量」，這是有研究支撐的洞察，讓合併步驟的決策可信。

**驗收標準可量化。** A/B test 的條件（p < 0.05、樣本量 1000/組）寫清楚了，QA 和 PM 都知道什麼叫「通過」。信用卡 Luhn 驗證的 300ms 時限也很具體。

**無障礙規格完整。** `aria-live`、`aria-invalid`、`aria-describedby`、`aria-busy` 都有列出，比多數 spec 做得好。

---

## 需要修改的問題

### 問題 1：SPA 步驟轉換的 session 處理未說明（擋 proceed）

規格說步驟轉換改為 fetch + DOM 更新，但沒有說明：
- 用戶在 Step 2 填到一半時，session token 過期了怎麼處理？
- 購物車資料在前端如何暫存（localStorage? sessionStorage? 記憶體？）
- 用戶關掉 tab 再回來，填到一半的資料是否保留？

這直接影響工程實作，需要在 spec 裡說清楚，否則工程師會各自解讀。

**建議：** 補一個「狀態管理」章節，說明各步驟資料的暫存策略和 session 過期的降級處理（例如：提示用戶重新登入但保留已填的收件資料）。

### 問題 2：Apple Pay 的 fallback 情境未涵蓋（擋 proceed）

Payment Request API 在以下情境下會失敗或不可用：
- iOS Safari 但未設定 Apple Pay 卡片
- Android Chrome 但未設定 Google Pay
- 在 App Webview 內（非原生 Safari/Chrome）

規格只寫「偵測到裝置支援時顯示」，但沒有定義偵測邏輯和 fallback 行為。如果偵測錯誤，用戶會看到 Apple Pay 按鈕但點了沒反應。

**建議：** 補充偵測邏輯（`PaymentRequest.canMakePayment()`）、偵測失敗時的 UI 降級方式（靜默隱藏 Apple Pay 選項，直接顯示信用卡表單）。

---

## 小意見（不擋 proceed）

- 「步驟轉換時間 < 150ms」這個驗收標準用 Lighthouse 量不準（Lighthouse 是 lab data），建議改用 `PerformanceObserver` 在 field 量，或用 WebPageTest 的 interaction to next paint。
- 優惠碼的驗證 API 呼叫需要 debounce（建議 500ms），否則用戶每輸入一個字就打一次 API。這個細節工程師可能忽略。
- 地址自動完成依賴 Google Places API，需要說明費用分攤方式和達到免費額度上限後的降級行為。

---

## 結論

**Revise & Proceed** — 兩個擋 proceed 的問題（session 處理、Apple Pay fallback）解決後即可進入設計稿。其餘小意見在設計稿 review 時一起處理。

預計修訂工作量：補充兩個章節，不影響核心設計方向，可在半天內完成。
