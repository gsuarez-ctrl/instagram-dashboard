// scripts/fetchData.js
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function fetchData() {
    try {
        // Configure Google Sheets API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // Fetch data from Google Sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Sheet1!A:P',
        });

        const rows = response.data.values;
        
        if (!rows || rows.length === 0) {
            throw new Error('No data found');
        }

        // Process the data
        const headers = rows[0];
        const data = rows.slice(1).map(row => {
            const entry = {};
            headers.forEach((header, index) => {
                if (index === 0) {
                    entry[header] = new Date(row[index]).toLocaleDateString();
                } else if (!header.includes('Change') && !header.includes('Weekly')) {
                    entry[header] = row[index] ? Number(row[index]) : null;
                }
            });
            return entry;
        });

        // Write to data file
        fs.writeFileSync(
            path.join(__dirname, '../data/followers.json'),
            JSON.stringify(data, null, 2)
        );

        console.log('Data successfully fetched and saved');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fetchData();