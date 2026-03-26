/**
 * API Backend FISBOT MAKER - Google Apps Script
 * Copia este código en tu Editor de Scripts de un Google Sheet.
 * Despliega como: Aplicación Web (Acceso: Cualquier persona / Ejecutar como: Tú).
 */

const ACCESS_TOKEN = "FISBOT_SECURITY_TOKEN_123"; // CAMBIA ESTO Y PONLO EN TU .env

function doPost(e) {
  let params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: "JSON Inválido"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (params.apiKey !== ACCESS_TOKEN) {
    return ContentService.createTextOutput(JSON.stringify({error: "No autorizado"})).setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = params.action;

  try {
    if (action === "saveTable") {
      const sheet = ss.getSheetByName(params.sheetName) || ss.insertSheet(params.sheetName);
      const data = params.data; 
      
      sheet.clearContents();
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        sheet.appendRow(headers);
        data.forEach(row => {
          const rowValues = headers.map(h => {
             const val = row[h];
             return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
          });
          sheet.appendRow(rowValues);
        });
      }
      return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Acción: Subir imagen y devolver URL de Drive (Futuro)
    // ...
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const db = {};

  sheets.forEach(s => {
    const data = s.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0];
      db[s.getName()] = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          let val = row[i];
          // Detectar JSON strings (ej. los items de la venta)
          if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
            try { val = JSON.parse(val); } catch(e) {}
          }
          obj[h] = val;
        });
        return obj;
      });
    } else {
      db[s.getName()] = [];
    }
  });

  return ContentService.createTextOutput(JSON.stringify(db)).setMimeType(ContentService.MimeType.JSON);
}
