
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401 })

  const body = await readBody(event)
  const { authorId } = body
  if (!authorId) throw createError({ statusCode: 400 })

  const db = useDb()

  // Check if already subscribed
  const existing = await db.query.subscriptions.findFirst({
    where: (subs, { and, eq }) => and(
      eq(subs.subscriberId, session.user.id),
      eq(subs.authorId, authorId)
    )
  })

  if (existing) {
    // Unsubscribe
    await db.delete(schema.subscriptions)
      .where(and(
        eq(schema.subscriptions.subscriberId, session.user.id),
        eq(schema.subscriptions.authorId, authorId)
      ))
    return { subscribed: false }
  } else {
    // Subscribe
    await db.insert(schema.subscriptions).values({
      subscriberId: session.user.id,
      authorId: authorId
    })
    return { subscribed: true }
  }
})
