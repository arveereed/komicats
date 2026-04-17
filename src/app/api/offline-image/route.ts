import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set([
  "res.cloudinary.com",
  "your-cdn-domain.com",
  "your-bucket.s3.amazonaws.com",
]);

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return new Response("Missing url", { status: 400 });
  }

  let remoteUrl: URL;

  try {
    remoteUrl = new URL(rawUrl);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(remoteUrl.hostname)) {
    return new Response("Host not allowed", { status: 403 });
  }

  const upstream = await fetch(remoteUrl.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response(`Upstream fetch failed: ${upstream.status}`, {
      status: upstream.status,
    });
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";

  const buffer = await upstream.arrayBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}
