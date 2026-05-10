/**
 * The Hair Lab Google Apps Script Web App.
 *
 * Expected JSON payload from the Worker:
 * {
 *   formType: "homepage" | "salon",
 *   spreadsheetId: "...",
 *   sheetTab: "homepage_quotes" | "appointments",
 *   row: [...],
 *   data: {...}
 * }
 */

function doGet() {
  return jsonResponse_({
    success: true,
    message: 'The Hair Lab Google Apps Script Web App is running.',
  });
}

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    var result = appendIncomingRow_(payload);
    return jsonResponse_({
      success: true,
      appended: true,
      spreadsheetId: result.spreadsheetId,
      sheetTab: result.sheetTab,
      rowCount: result.rowCount,
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      error: error && error.message ? error.message : String(error),
    });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body.');
  }

  var payload = JSON.parse(e.postData.contents);
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload.');
  }

  return payload;
}

function appendIncomingRow_(payload) {
  var spreadsheetId = String(payload.spreadsheetId || '').trim();
  var sheetTab = String(payload.sheetTab || '').trim();
  var formType = String(payload.formType || '').trim().toLowerCase();
  var row = Array.isArray(payload.row) ? payload.row : [];

  if (!spreadsheetId) {
    throw new Error('Missing spreadsheetId.');
  }

  if (!sheetTab) {
    throw new Error('Missing sheetTab.');
  }

  if (row.length === 0) {
    throw new Error('Missing row data.');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetTab);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetTab);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(getHeaders_(formType));
  }

  sheet.appendRow(row);

  return {
    spreadsheetId: spreadsheetId,
    sheetTab: sheetTab,
    rowCount: sheet.getLastRow(),
  };
}

function getHeaders_(formType) {
  if (formType === 'salon') {
    return [
      'submitted_at',
      'source_url',
      'salon_name',
      'contact_name',
      'phone',
      'service',
      'preferred_date',
      'preferred_time',
      'note',
    ];
  }

  return [
    'submitted_at',
    'source_url',
    'business_name',
    'contact_name',
    'phone',
    'area',
    'interest',
    'business_model',
    'note',
  ];
}

function jsonResponse_(body) {
  var output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
