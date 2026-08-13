const SHEET_NAME = "Registrations";
const HEADERS = [
  "Registration ID",
  "Submitted At",
  "Full Name",
  "Email",
  "Mobile / WhatsApp",
  "Company",
  "Designation",
  "Company Address",
  "Country",
  "Emirate",
  "Nationality",
  "Licence Type",
  "Free Zone",
  "Years in Industry",
  "Business Category",
  "Marketing Consent",
];

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(
      "DBRG_WEBHOOK_SECRET"
    );

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    if (!payload.registrationId || !payload.email || !payload.fullName) {
      return jsonResponse({ ok: false, error: "Missing required registration data" });
    }

    lock.waitLock(10000);

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet =
      spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    const existingRegistration = sheet
      .getRange(1, 1, Math.max(sheet.getLastRow(), 1), 1)
      .createTextFinder(String(payload.registrationId))
      .matchEntireCell(true)
      .findNext();

    if (existingRegistration) {
      return jsonResponse({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      safeCell(payload.registrationId),
      payload.submittedAt ? new Date(payload.submittedAt) : new Date(),
      safeCell(payload.fullName),
      safeCell(payload.email),
      safeCell(payload.phone),
      safeCell(payload.company),
      safeCell(payload.designation),
      safeCell(payload.companyAddress),
      safeCell(payload.country),
      safeCell(payload.emirate || "Not applicable"),
      safeCell(payload.nationality || "Not provided"),
      safeCell(payload.licenceType),
      safeCell(payload.freeZone || "Not applicable"),
      safeCell(payload.yearsInIndustry || "Not provided"),
      safeCell(payload.businessCategory),
      payload.marketingConsent === "yes" ? "Yes" : "No",
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: "Unable to store registration" });
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
