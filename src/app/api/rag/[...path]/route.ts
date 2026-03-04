import { NextRequest, NextResponse } from "next/server";

const UNIRAG_BASE_URL = process.env.UNIRAG_BASE_URL;
const UNIRAG_INTERNAL_KEY = process.env.UNIRAG_INTERNAL_KEY;

async function forwardRequest(
  req: NextRequest,
  params: Promise<{ path: string[] }>,
  method: "GET" | "POST",
) {
  // Build the forwarded URL
  const { path: segments } = await params;
  const path = segments.join("/");
  const url = new URL(`${UNIRAG_BASE_URL}/api/${path}`);

  // 3. Forward query params for GET requests
  if (method === "GET") {
    req.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  // 4. Forward the request to UniRAG
  const body = method === "POST" ? await req.text() : undefined;

  console.log("Forwarding with key:", process.env.UNIRAG_INTERNAL_KEY);

  const response = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Key": UNIRAG_INTERNAL_KEY!,
    },
    body,
  });

  // 5. Stream the response back to the client, forwarding headers as-is
  const responseHeaders: Record<string, string> = {};
  const contentType = response.headers.get("Content-Type");
  const cacheControl = response.headers.get("Cache-Control");
  if (contentType) responseHeaders["Content-Type"] = contentType;
  if (cacheControl) responseHeaders["Cache-Control"] = cacheControl;

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(req, params, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(req, params, "POST");
}
