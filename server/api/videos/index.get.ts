import { desc, eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const isAdmin = session.user?.role === 'ADMIN'
  
  const db = useDb()
  
  // Normal users only see PUBLIC videos. Admins see everything.
  const conditions = []
  if (!isAdmin) {
    conditions.push(eq(schema.videos.status, 'PUBLIC'))
  }

  const result = await db.query.videos.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      author: true
    },
    orderBy: [desc(schema.videos.createdAt)]
  })

  // Map author to a simpler field for frontend
  return result.map(v => ({
    ...v,
    author: v.author.username
  }))
})
