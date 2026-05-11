
import Database from 'better-sqlite3'
const db = new Database('flow.db')

const rows = db.prepare('SELECT id, title, views, created_at FROM videos').all()
console.log(JSON.stringify(rows, null, 2))
db.close()
