import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'
import { eq, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password } = body

  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields'
    })
  }

  const db = useDb()
  
  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { or, eq }) => or(eq(users.username, username), eq(users.email, email))
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'Username or email already exists'
    })
  }

  // Hash password
  const salt = randomBytes(16).toString('hex')
  const hashedPassword = scryptSync(password, salt, 64).toString('hex')
  const storedPassword = `${salt}:${hashedPassword}`

  // Create user
  const [newUser] = await db.insert(schema.users).values({
    username,
    email,
    password: storedPassword,
    role: 'USER'
  }).returning()

  await setUserSession(event, {
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  })

  return { success: true }
})
