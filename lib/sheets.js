const { google } = require('googleapis')
const sheets = google.sheets('v4')

const SPREADSHEET_ID = process.env['SPREADSHEET_ID']
const SHEET_TITLE = process.env['SHEET_TITLE']
const START_ROW = 2;

let jwtClient = new google.auth.JWT(
  process.env['SHEETS_CLIENT_EMAIL'],
  null,
  process.env['SHEETS_PRIVATE_KEY'],
  ['https://www.googleapis.com/auth/spreadsheets']
)

module.exports.getRows = (all = false) => {
  return sheets.spreadsheets.values.get({
    auth: jwtClient,
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_TITLE + '!B2:H'
  })
  .then(resp => resp.data.values ? resp.data.values : [])
  .then(data => data.map((d,i) => ({ data: d, cell: `G${START_ROW + i}` })))
  .then(data => data.filter(d => all || d.data.length < 6))
};

module.exports.writeCell = (cell, value) => {
  const text = value.toString();
  console.log('writing', text, 'to', cell)

  return sheets.spreadsheets.values.update({
    auth: jwtClient,
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_TITLE + '!' + cell,
    valueInputOption: 'RAW',
    resource: {
      values: [[text]]
    }
  }).catch(err => {
    console.log(err);
    throw `failed to write '${text}' to ${cell}`;
  });
};

module.exports.authorize = () => {
  return new Promise((resolve, reject) => {
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
      } else {
        resolve()
      }
    });
  });
}