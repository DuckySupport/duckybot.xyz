export default async (request: Request, context: any) => {
  const url = new URL(request.url);

  if (!url.pathname.endsWith(".html") && !url.pathname.endsWith("/")) {
    return context.next();
  }

  const nonce = crypto.randomUUID().replaceAll("-", "");

  const response = await context.next();

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("text/html") || !response.body) {
    return response;
  }

  const cspTemplate = `default-src 'self'; script-src 'nonce-NONCE_PLACEHOLDER' 'self' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https://cdn.discordapp.com https://duckybot.xyz https://dev.duckybot.xyz; connect-src 'self' https://api.duckybot.xyz https://devapi.duckybot.xyz; object-src 'none'; base-uri 'self'`;

  const newHeaders = new Headers(response.headers);
  newHeaders.set(
    "Content-Security-Policy",
    cspTemplate.replace("NONCE_PLACEHOLDER", nonce)
  );

  let buffer = "";
  const searchPattern = "{{nonce}}";
  const replacement = nonce;

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      buffer += decoder.decode(chunk, { stream: true });

      let output = "";
      let lastIndex = 0;
      let patternIndex;

      while ((patternIndex = buffer.indexOf(searchPattern, lastIndex)) !== -1) {
        output += buffer.slice(lastIndex, patternIndex) + replacement;
        lastIndex = patternIndex + searchPattern.length;
      }

      const remainingBuffer = buffer.slice(lastIndex);

      if (remainingBuffer.length >= searchPattern.length - 1) {
        const keepLength = searchPattern.length - 1;
        output += remainingBuffer.slice(0, -keepLength);
        buffer = remainingBuffer.slice(-keepLength);
      } else {
        buffer = remainingBuffer;
      }

      if (output) {
        controller.enqueue(encoder.encode(output));
      }
    },

    flush(controller) {
      if (buffer) {
        const encoder = new TextEncoder();
        const finalOutput = buffer.replaceAll(searchPattern, replacement);
        controller.enqueue(encoder.encode(finalOutput));
      }
    },
  });

  return new Response(response.body.pipeThrough(transformStream), {
    status: response.status,
    headers: newHeaders,
  });
};