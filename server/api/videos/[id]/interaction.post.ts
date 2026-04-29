import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const videoId = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!videoId || !body.type) throw createError({ statusCode: 400 })

  const db = useDb()
  
  // Check for existing interaction
  const existing = await db.query.interactions.findFirst({
    where: (interactions, { and, eq }) => and(
      eq(interactions.userId, user.id),
      eq(interactions.videoId, parseInt(videoId))
    )
  })

  if (existing) {
    if (existing.type === body.type) {
      // Toggle off
      await db.delete(schema.interactions).where(eq(schema.interactions.id, existing.id))
    } else {
      // Update type
      await db.update(schema.interactions)
        .set({ type: body.type })
        .where(eq(schema.interactions.id, existing.id))
    }
  } else {
    // New interaction
    await db.insert(schema.interactions).values({
      userId: user.id,
      videoId: parseInt(videoId),
      type: body.type
    })
  }

  return { success: true }
})
