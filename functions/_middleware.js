export async function onRequest(context) {
  const start = Date.now()
  const res = await context.next()
  res.headers.set('Server-Timing', `edge;dur=${Date.now() - start}`)

  return res
}
