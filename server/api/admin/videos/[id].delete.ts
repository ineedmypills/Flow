import { eq } from 'drizzle-orm'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing ID' })

  const db = useDb()
  const videoId = parseInt(id)

  // Fetch video first to check ownership and get file paths
  const video = await db.query.videos.findFirst({
    where: eq(schema.videos.id, videoId)
  })

  if (!video) throw createError({ statusCode: 404, message: 'Video not found' })

  // Check permission: ADMIN or owner
  if (user.role !== 'ADMIN' && video.userId !== user.id) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // Delete physical files
  const uploadDir = join(process.cwd(), 'public')
  
  try {
    if (video.url) {
      await unlink(join(uploadDir, video.url)).catch(() => {})
    }
    if (video.thumbnailUrl) {
      await unlink(join(uploadDir, video.thumbnailUrl)).catch(() => {})
    }
  } catch (err) {
    console.error('Error deleting files:', err)
  }

  // Delete from database (interactions and comments will be handled if cascading is set, 
  // but Drizzle/SQLite might need manual cleanup if not)
  // According to schema, we didn't specify ON DELETE CASCADE explicitly in the table defs,
  // but let's assume simple deletion for now. 
  // Better to delete interactions and comments first if no cascade.
  
  await db.delete(schema.interactions).where(eq(schema.interactions.videoId, videoId))
  await db.delete(schema.comments).where(eq(schema.comments.videoId, videoId))
  await db.delete(schema.videos).where(eq(schema.videos.id, videoId))

  return { success: true }
})
