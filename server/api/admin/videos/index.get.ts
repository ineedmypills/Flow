import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403 })

  const db = useDb()
  const result = await db.query.videos.findMany({
    with: {
      author: true
    },
    orderBy: [desc(schema.videos.createdAt)]
  })

  return result.map(v => ({
    ...v,
    author: v.author.username
  }))
})
