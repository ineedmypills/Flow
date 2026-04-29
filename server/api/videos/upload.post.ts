import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }

  let title = ''
  let description = ''
  let videoFile: any = null
  let thumbnailFile: any = null

  for (const field of formData) {
    if (field.name === 'title') title = field.data.toString()
    if (field.name === 'description') description = field.data.toString()
    if (field.name === 'video') videoFile = field
    if (field.name === 'thumbnail') thumbnailFile = field
  }

  if (!title || !videoFile) {
    throw createError({ statusCode: 400, message: 'Title and video are required' })
  }

  const uploadDir = join(process.cwd(), 'public/uploads')
  await mkdir(uploadDir, { recursive: true })

  const videoFilename = `${Date.now()}-${videoFile.filename}`
  const videoPath = join(uploadDir, videoFilename)
  await writeFile(videoPath, videoFile.data)

  let thumbnailUrl = ''
  if (thumbnailFile) {
    const thumbFilename = `thumb-${Date.now()}-${thumbnailFile.filename}`
    const thumbPath = join(uploadDir, thumbFilename)
    await writeFile(thumbPath, thumbnailFile.data)
    thumbnailUrl = `/uploads/${thumbFilename}`
  }

  const db = useDb()
  const [video] = await db.insert(schema.videos).values({
    title,
    description,
    url: `/uploads/${videoFilename}`,
    thumbnailUrl,
    userId: user.id,
    status: 'PUBLIC'
  }).returning()

  return video
})
