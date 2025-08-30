export default async (request: Request, context: any) => {
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const response = await context.next();

  const newHeaders = new Headers(response.headers);
  newHeaders.set(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src 'nonce-${nonce}' 'strict-dynamic' 'self' https://unpkg.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      report-uri /.netlify/functions/__csp-violations
    `.replace(/\s+/g, " ")
  );

  const bodyText = await response.text();
  const newBody = bodyText.replace("{{nonce}}", nonce);

  return new Response(newBody, {
    status: response.status,
    headers: newHeaders,
  });
};
