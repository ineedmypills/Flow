import { like, or, eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = query.q as string

  if (!searchTerm) {
    return []
  }

  const results = await db.select({
    id: schema.videos.id,
    title: schema.videos.title,
    description: schema.videos.description,
    url: schema.videos.url,
    thumbnailUrl: schema.videos.thumbnailUrl,
    views: schema.videos.views,
    createdAt: schema.videos.createdAt,
    author: schema.users.username,
  })
    .from(schema.videos)
    .leftJoin(schema.users, eq(schema.videos.userId, schema.users.id))
    .where(
      and(
        eq(schema.videos.status, 'PUBLIC'),
        or(
          like(schema.videos.title, `%${searchTerm}%`),
          like(schema.videos.description, `%${searchTerm}%`)
        )
      )
    )
    .all()

  return results
})