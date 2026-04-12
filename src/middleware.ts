import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip rate limiting for public, heavily cached routes
  if (pathname.startsWith("/api/categories")) {
    return NextResponse.next();
  }

  // Skip rate limiting entirely if Redis is not configured
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return NextResponse.next();
  }

  // Use IP address as identifier
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";

  // Use stricter auth rate limit for auth endpoints
  const type = pathname.startsWith("/api/auth/") ? "auth" : "general";

  const { success, remaining } = await checkRateLimit(ip, type as "general" | "auth");

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "Retry-After": "60",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
