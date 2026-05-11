import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from '../utils/db'
import { join } from 'pathe'

export default defineNitroPlugin(() => {
  // Only run migrations on server startup
  try {
    const migrationsFolder = join(process.cwd(), 'server/database/migrations')
    migrate(db, { migrationsFolder })
    console.log('✅ Database migrated successfully')
  } catch (error) {
    console.error('❌ Database migration failed:', error)
  }
})
