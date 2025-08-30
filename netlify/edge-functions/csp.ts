export default async (request: Request, context: any) => {
  const url = new URL(request.url);

  if (!url.pathname.endsWith(".html") && !url.pathname.endsWith("/")) {
    return context.next();
  }

  const nonce = crypto.randomUUID().replaceAll("-", "");

  const response = await context.next();

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("text/html")) {
    return response;
  }

  const cspTemplate = `default-src 'self'; script-src 'nonce-NONCE_PLACEHOLDER' 'self' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https://cdn.discordapp.com https://duckybot.xyz https://dev.duckybot.xyz; connect-src 'self' https://api.duckybot.xyz https://devapi.duckybot.xyz; object-src 'none'; base-uri 'self'`;

  const bodyText = await response.text();

  const newBody = bodyText.includes("{{nonce}}")
    ? bodyText.replaceAll("{{nonce}}", nonce)
    : bodyText;
  const newHeaders = new Headers(response.headers);
  newHeaders.set(
    "Content-Security-Policy",
    cspTemplate.replace("NONCE_PLACEHOLDER", nonce)
  );

  return new Response(newBody, {
    status: response.status,
    headers: newHeaders,
  });
};