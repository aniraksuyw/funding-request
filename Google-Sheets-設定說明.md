# Google Sheets 連線設定

## 1. 建立試算表

1. 到 Google Drive 建立一個 Google Sheets。
2. 檔名可取為「研究生經費申請紀錄」。
3. 不需要先建立欄位，Apps Script 會自動建立「申請紀錄」工作表與欄位。

## 2. 貼上 Apps Script

1. 在 Google Sheets 上方選單選「擴充功能」。
2. 選「Apps Script」。
3. 刪掉預設內容。
4. 貼上本資料夾的 `google-apps-script.gs` 內容。
5. 按儲存。

## 3. 部署成 Web App

1. 在 Apps Script 右上角按「部署」。
2. 選「新增部署作業」。
3. 類型選「網頁應用程式」。
4. 設定如下：
   - 執行身分：我
   - 誰可以存取：任何人
5. 按「部署」。
6. 第一次部署時 Google 會要求授權，照畫面完成即可。
7. 複製產生的 Web App URL。

## 4. 回到經費申請系統

1. 打開 `index.html`。
2. 在「Google Sheets 連線」貼上 Web App URL。
3. 按「儲存連線」。
4. 可按「測試」確認 Google Sheets 是否收到一筆測試資料。

如果按「儲存連線」或「測試」沒有看到提示，請先重新整理頁面；如果仍然沒有反應，請關掉 `index.html` 後重新打開。

## 5. 開始使用

之後每次送出申請，系統會：

1. 先把資料存在目前瀏覽器。
2. 如果已設定 Web App URL，就同步寫入 Google Sheets。
3. 申請紀錄會顯示同步狀態。

如果同步失敗，請檢查 Web App URL 是否正確，或 Apps Script 部署權限是否設為「任何人」。
