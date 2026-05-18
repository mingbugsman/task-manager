import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth-options";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
  /\/$/,
  ""
);

async function proxyRequest(req: Request, pathSegments: string[]) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    return Response.json(
      { success: false, message: "Unauthorized", data: null },
      { status: 401 }
    );
  }

  const targetPath = pathSegments.join("/");
  const incomingUrl = new URL(req.url);
  const targetUrl = `${BACKEND_URL}/${targetPath}${incomingUrl.search}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${session.accessToken}`);

  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const backendRes = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
    cache: "no-store",
  });

  const responseBody = await backendRes.arrayBuffer();
  const responseHeaders = new Headers();
  const backendContentType = backendRes.headers.get("content-type");
  if (backendContentType) {
    responseHeaders.set("Content-Type", backendContentType);
  }

  return new Response(responseBody, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function POST(req: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function PUT(req: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function PATCH(req: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function DELETE(req: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}
