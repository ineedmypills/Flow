const Database = require('better-sqlite3');
const db = new Database('flow.db');

const tables = ['users', 'videos', 'comments', 'subscriptions', 'interactions'];

tables.forEach(table => {
  try {
    const count = db.prepare(`SELECT count(*) as count FROM ${table}`).get().count;
    console.log(`${table}: ${count}`);
    if (count > 0) {
        const rows = db.prepare(`SELECT * FROM ${table} LIMIT 1`).all();
        console.log(`Sample row from ${table}:`, JSON.stringify(rows[0], null, 2));
    }
  } catch (e) {
    console.error(`Error checking table ${table}:`, e.message);
  }
});
