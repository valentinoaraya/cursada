const apiOrigin = process.env.API_ORIGIN ?? "http://127.0.0.1:3001";

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const upstream = await fetch(`${apiOrigin}/documents`, {
    method: "POST",
    body: formData,
  });

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
