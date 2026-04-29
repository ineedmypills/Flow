import { scryptSync, timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { identifier, password } = body // identifier can be username or email

  if (!identifier || !password) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields'
    })
  }

  const db = useDb()
  
  const user = await db.query.users.findFirst({
    where: (users, { or, eq }) => or(eq(users.username, identifier), eq(users.email, identifier))
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  const [salt, storedHash] = user.password.split(':')
  const hashToVerify = scryptSync(password, salt, 64).toString('hex')

  if (hashToVerify !== storedHash) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  })

  return { success: true }
})
