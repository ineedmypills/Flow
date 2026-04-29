export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const path = getRequestPath(event)

  if (path.startsWith('/api/admin') && user?.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Admin access required'
    })
  }
})
