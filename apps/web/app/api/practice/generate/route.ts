const apiOrigin = process.env.API_ORIGIN ?? "http://127.0.0.1:3001";

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  const upstream = await fetch(`${apiOrigin}/practice/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  headers.set("cache-control", "no-store");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
