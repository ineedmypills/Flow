import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400 })

  const db = useDb()
  const video = await db.query.videos.findFirst({
    where: (videos, { eq }) => eq(videos.id, parseInt(id)),
    with: {
      author: true
    }
  })

  if (!video) throw createError({ statusCode: 404 })
  
  // Increment views (simple way)
  await db.update(schema.videos)
    .set({ views: video.views + 1 })
    .where(eq(schema.videos.id, video.id))

  return {
    ...video,
    author: video.author.username
  }
})
