const SHEET_NAME = "申請紀錄";

function doPost(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet_(spreadsheet);
  const data = JSON.parse(e.postData.contents || "{}");

  ensureHeader_(sheet);
  sheet.appendRow([
    data.createdAt || new Date(),
    data.id || "",
    data.applicantName || "",
    data.studentId || "",
    data.email || "",
    data.department || "",
    data.category || "",
    data.amount || "",
    data.expenseDate || "",
    data.reviewer || "",
    data.purpose || "",
    data.attachment || "",
    data.status || "待審核",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "經費申請系統已連線" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_(spreadsheet) {
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.appendRow([
    "送出時間",
    "申請編號",
    "申請人",
    "學號",
    "Email",
    "系所年級",
    "經費類別",
    "申請金額",
    "預計支出日期",
    "審核人",
    "申請用途",
    "附件連結",
    "狀態",
  ]);
}
