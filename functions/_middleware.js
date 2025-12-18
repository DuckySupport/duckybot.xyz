export const onRequest = async (context) => {
  const { request, env, next } = context
  const url = new URL(request.url)

  const isServerRoute =
    /^\/servers\/[^/]+$/.test(url.pathname) ||
    /^\/servers\/[^/]+\/panel$/.test(url.pathname)

  let response

  if (isServerRoute) {
    const assetUrl = new URL(request.url)
    assetUrl.pathname = "/servers/panel.html"

    response = await env.ASSETS.fetch(
      new Request(assetUrl.toString(), {
        method: "GET",
        headers: request.headers,
      })
    )

    // 🚫 prevent Pages from canonical redirecting
    const headers = new Headers(response.headers)
    headers.delete("Location")

    response = new Response(response.body, {
      status: 200,
      headers,
    })
  } else {
    response = await next()
  }

  // ---- CSP for ALL HTML ----
  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("text/html")) {
    return response
  }

  const nonce = crypto.randomUUID().replace(/-/g, "")

  const csp =
    `default-src 'self'; ` +
    `script-src 'nonce-${nonce}' 'self' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com; ` +
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; ` +
    `font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; ` +
    `img-src 'self' data: https://cdn.discordapp.com https://duckybot.xyz https://dev.duckybot.xyz; ` +
    `connect-src 'self' https://api.duckybot.xyz https://devapi.duckybot.xyz; ` +
    `object-src 'none'; base-uri 'self'`

  const rewritten = new HTMLRewriter()
    .on("script", {
      element(el) {
        if (el.getAttribute("nonce") === "{{nonce}}") {
          el.setAttribute("nonce", nonce)
        }
      },
    })
    .transform(response)

  const headers = new Headers(rewritten.headers)
  headers.set("Content-Security-Policy", csp)

  return new Response(rewritten.body, {
    status: rewritten.status,
    headers,
  })
}
