import { eq, sql, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400 })

  const session = await getUserSession(event)
  const db = useDb()
  
  const video = await db.query.videos.findFirst({
    where: (videos, { eq }) => eq(videos.id, parseInt(id)),
    with: {
      author: true
    }
  })

  if (!video) throw createError({ statusCode: 404 })
  
  // Increment views
  await db.update(schema.videos)
    .set({ views: video.views + 1 })
    .where(eq(schema.videos.id, video.id))

  // Get author subscriber count
  const subscriberCount = await db.select({ 
    count: sql`count(*)` 
  }).from(schema.subscriptions)
    .where(eq(schema.subscriptions.authorId, video.userId))
    .then(res => res[0]?.count || 0)

  // Check if current user is subscribed
  let isSubscribed = false
  let userInteraction = null
  
  if (session.user) {
    const sub = await db.query.subscriptions.findFirst({
      where: (subs, { and, eq }) => and(
        eq(subs.subscriberId, session.user.id),
        eq(subs.authorId, video.userId)
      )
    })
    isSubscribed = !!sub

    userInteraction = await db.query.interactions.findFirst({
      where: (ints, { and, eq }) => and(
        eq(ints.userId, session.user.id),
        eq(ints.videoId, video.id)
      )
    })
  }

  // Get total likes and dislikes
  const interactions = await db.select({
    type: schema.interactions.type,
    count: sql`count(*)`
  }).from(schema.interactions)
    .where(eq(schema.interactions.videoId, video.id))
    .groupBy(schema.interactions.type)

  const likesCount = interactions.find(i => i.type === 'LIKE')?.count || 0
  const dislikesCount = interactions.find(i => i.type === 'DISLIKE')?.count || 0

  return {
    ...video,
    author: video.author.username,
    authorId: video.userId,
    subscriberCount,
    isSubscribed,
    userInteraction: userInteraction?.type || null,
    likesCount,
    dislikesCount
  }
})
