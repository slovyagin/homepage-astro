export async function onRequest(context) {
  const dest = context.request.headers.get('Sec-Fetch-Dest')

  if (dest === 'document') {
    return Response.redirect(new URL('/', context.request.url), 302)
  }

  return context.next()
}
