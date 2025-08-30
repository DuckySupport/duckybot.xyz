export default async (request: Request, context: any) => {
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const response = await context.next();

  const bodyText = await response.text();
  const newBody = bodyText.replace(/{{nonce}}/g, nonce);

  const newHeaders = new Headers(response.headers);
  newHeaders.set(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src 'nonce-${nonce}' 'self' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
      font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
      img-src 'self' data: https://cdn.discordapp.com;
      connect-src 'self' https://api.duckybot.xyz https://devapi.duckybot.xyz;
      object-src 'none';
      base-uri 'self';
      report-uri /.netlify/functions/__csp-violations
    `.replace(/\s+/g, " ")
  );

  return new Response(newBody, {
    status: response.status,
    headers: newHeaders,
  });
};