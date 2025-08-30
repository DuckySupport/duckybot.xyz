export default async (request: Request, context: any) => {
  const nonce = crypto.randomUUID().replace(/-/g, "");

  let response = await context.next();

  const newHeaders = new Headers(response.headers);

  newHeaders.set(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src 'nonce-${nonce}' 'strict-dynamic' 'self';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      report-uri /.netlify/functions/__csp-violations
    `.replace(/\s+/g, " ")
  );

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
};
