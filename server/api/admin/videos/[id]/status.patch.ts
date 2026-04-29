import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403 })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!id || !body.status) throw createError({ statusCode: 400 })

  const db = useDb()
  await db.update(schema.videos)
    .set({ status: body.status })
    .where(eq(schema.videos.id, parseInt(id)))

  return { success: true }
})
