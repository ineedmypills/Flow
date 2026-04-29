export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody(event)
  
  if (!body.videoId || !body.content) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  const db = useDb()
  const [comment] = await db.insert(schema.comments).values({
    content: body.content,
    userId: user.id,
    videoId: parseInt(body.videoId)
  }).returning()

  return comment
})
