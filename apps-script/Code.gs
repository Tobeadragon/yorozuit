const SHEET_TAB_NAME = 'Contact requests';
const HEADERS = ['Received at', 'Name', 'Email', 'Phone', 'Preferred language', 'Service', 'Message', 'Consent recorded at'];
const ALLOWED_LANGUAGES = ['ja', 'de', 'en'];
const ALLOWED_SERVICES = ['general', 'web', 'purchase', 'internet', 'smart-home', 'other'];

function doPost(event) {
  try {
    const body = event && event.postData && event.postData.contents;
    if (!body || body.length > 12000) return jsonResponse({ ok: false });

    const data = JSON.parse(body);
    if (data.website) return jsonResponse({ ok: true });
    if (!isValidSubmission(data)) return jsonResponse({ ok: false });

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) throw new Error('Missing SPREADSHEET_ID script property');

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const sheet = spreadsheet.getSheetByName(SHEET_TAB_NAME) || spreadsheet.insertSheet(SHEET_TAB_NAME);
      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
      sheet.appendRow([
        new Date(),
        sheetSafeValue(data.name, 120),
        sheetSafeValue(data.email, 254),
        sheetSafeValue(data.phone, 60),
        sheetSafeValue(data.language, 10),
        sheetSafeValue(data.service, 40),
        sheetSafeValue(data.message, 5000),
        new Date()
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false });
  }
}

function isValidSubmission(data) {
  return data &&
    typeof data.name === 'string' && data.name.trim().length >= 2 && data.name.length <= 120 &&
    typeof data.email === 'string' && data.email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    typeof data.phone === 'string' && data.phone.length <= 60 &&
    ALLOWED_LANGUAGES.includes(data.language) &&
    ALLOWED_SERVICES.includes(data.service) &&
    typeof data.message === 'string' && data.message.trim().length >= 10 && data.message.length <= 5000 &&
    data.consent === true;
}

function sheetSafeValue(value, maxLength) {
  const normalized = String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength);
  return /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
