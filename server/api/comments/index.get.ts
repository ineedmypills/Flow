import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const videoId = query.videoId
  
  if (!videoId) throw createError({ statusCode: 400 })

  const db = useDb()
  const result = await db.query.comments.findMany({
    where: (comments, { eq }) => eq(comments.videoId, parseInt(videoId as string)),
    with: {
      user: true
    },
    orderBy: [desc(schema.comments.createdAt)]
  })

  return result.map(c => ({
    ...c,
    user: c.user.username
  }))
})
