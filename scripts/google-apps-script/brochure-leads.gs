const SHEET_NAME = "Brochure Downloads";
const HEADERS = [
  "Lead ID",
  "Submitted At",
  "Email",
  "CTA Source",
  "Page",
];

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(
      "BROCHURE_WEBHOOK_SECRET"
    );

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    if (!payload.leadId || !payload.email) {
      return jsonResponse({ ok: false, error: "Missing required lead data" });
    }

    lock.waitLock(10000);

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet =
      spreadsheet.getSheetByName(SHEET_NAME) ||
      spreadsheet.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    const existingLead = sheet
      .getRange(1, 1, Math.max(sheet.getLastRow(), 1), 1)
      .createTextFinder(String(payload.leadId))
      .matchEntireCell(true)
      .findNext();

    if (existingLead) {
      return jsonResponse({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      safeCell(payload.leadId),
      payload.submittedAt ? new Date(payload.submittedAt) : new Date(),
      safeCell(payload.email),
      safeCell(payload.source),
      safeCell(payload.page),
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: "Unable to store brochure lead" });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function safeCell(value) {
  const text = String(value == null ? "" : value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
