const apiOrigin = process.env.API_ORIGIN ?? "http://127.0.0.1:3001";

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  const upstream = await fetch(`${apiOrigin}/questions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body,
  });

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  headers.set("cache-control", "no-cache");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
