const ALLOWED_ORIGINS = (
  process.env.PROOFOS_CORS_ORIGINS ?? "*"
).split(",").map((o) => o.trim());

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  let allowOrigin = "*";

  if (ALLOWED_ORIGINS[0] !== "*" && origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      allowOrigin = origin;
    }
  } else if (origin) {
    allowOrigin = origin;
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

export function withCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function optionsResponse(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
