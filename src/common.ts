// =============
// 正規表現・定数
// =============
const NOTIFIED_DATES = "__NOTIFIED_DATES__";

// ================
// SpreadsheetApp
// ================
const activeSpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
const notifiedDatesSheet = activeSpreadSheet.getSheetByName(NOTIFIED_DATES);
const lastRowIndex = notifiedDatesSheet?.getLastRow() ?? 0;
