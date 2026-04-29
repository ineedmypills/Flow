import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  const results = await db.select({
    id: schema.videos.id,
    title: schema.videos.title,
    description: schema.videos.description,
    url: schema.videos.url,
    thumbnailUrl: schema.videos.thumbnailUrl,
    views: schema.videos.views,
    status: schema.videos.status,
    createdAt: schema.videos.createdAt,
    author: schema.users.username,
  })
  .from(schema.videos)
  .leftJoin(schema.users, eq(schema.videos.userId, schema.users.id))
  .where(eq(schema.videos.userId, session.user.id))
  .orderBy(desc(schema.videos.createdAt))
  .all()

  return results
})
