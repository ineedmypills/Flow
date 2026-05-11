import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../database/schema'
import { join } from 'pathe'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export const useDb = () => {
  if (!_db) {
    const sqlite = new Database('flow_v3.db')
    _db = drizzle(sqlite, { schema })
  }
  return _db
}

export const db = useDb()
export { schema }
