import { scryptSync, randomBytes } from 'node:crypto'

export default defineNitroPlugin(async () => {
  const db = useDb()
  
  // Check if admin exists
  const admin = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.role, 'ADMIN')
  })

  if (!admin) {
    console.log('Seeding admin user...')
    const salt = randomBytes(16).toString('hex')
    const password = scryptSync('admin123', salt, 64).toString('hex')
    
    await db.insert(schema.users).values({
      username: 'admin',
      email: 'admin@flow.com',
      password: `${salt}:${password}`,
      role: 'ADMIN'
    })
    console.log('Admin seeded: admin / admin123')
  }
})
