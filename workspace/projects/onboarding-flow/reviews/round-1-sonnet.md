# Review — Onboarding Flow Spec v2（Round 1）

**Reviewer:** Claude Sonnet 4.6
**Date:** 2026-03-30
**Overall:** 相較 v1 有實質改善，核心設計決策正確。以下是細節意見。

---

## 優點

**問題診斷精準。** 從漏斗數據找到 Step 3 是最大流失點，再針對性地改設計（即時 checklist），這是正確的方法論。不是「整體感覺不好所以全部重做」，而是有數據支撐。

**blur 驗證的決策有說明理由。** 很多規格書只寫「blur 後驗證」，不解釋為什麼。這裡寫出 keyup 的問題，讓工程師和 QA 都理解設計意圖，往後維護時不會誤改回去。

**可跳過的 CTA 層級處理好。** 跳過按鈕用較小字 + gray-400，讓主 CTA 保持視覺優先，同時不讓使用者感覺被困住。這個細節很多設計師會忽略。

---

## 問題

### 問題 1：Step 5 的「進入主畫面」缺乏過渡說明

規格寫「直接進入 app 主畫面」，但沒有說明過渡方式。如果用 push transition，用戶會感覺進度列突然消失；如果用 full-screen modal dismiss，節奏不對。

**建議：** 明確說明 Step 5 → 主畫面的 transition 方式，以及進度列如何收合（例如：confetti 播完後，進度列 fade out，然後整個 onboarding container slide down dismiss）。

### 問題 2：Sign in with Apple / Google 的帳號衝突處理

規格 Step 2 有提到支援 SSO，但沒有說明：如果用戶用 Google 登入，後續的 Step 3（設定密碼）是否跳過？還是強制設一個 app 密碼？

這個決策會影響 Step 3 的流程邏輯，需要在規格裡說清楚。

---

## 小意見（不擋 proceed）

- 驗收標準的 A/B test 目標（Step 3 完成率 ≥ 75%）建議同時說明樣本量和觀察週期，避免過早看數據下結論
- Step 4 問卷的 3 個單選題內容沒有列出，如果這個規格書要給設計師當依據，需要補上

---

## 結論

**建議：已通過，可進設計稿（Approved with minor notes）**

兩個問題建議在設計稿階段確認，不需要重新來一輪 spec review。問題 1 是視覺決策，問題 2 是產品決策，兩者在設計稿 review 時一起處理效率更高。
