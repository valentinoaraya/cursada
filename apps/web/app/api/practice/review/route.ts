const apiOrigin = process.env.API_ORIGIN ?? "http://127.0.0.1:3001";

export async function GET(request: Request): Promise<Response> {
  const materia = new URL(request.url).searchParams.get("materia") ?? "";
  const upstream = await fetch(`${apiOrigin}/practice/review?materia=${encodeURIComponent(materia)}`);

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
