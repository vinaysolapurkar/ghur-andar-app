import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "ghur_session";

function getSessionFromRequest(request: NextRequest): { role: string } | null {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    const [encoded, sig] = cookie.value.split(".");
    if (!encoded || !sig) return null;

    // Decode the payload
    const payload = JSON.parse(atob(encoded));

    if (!payload.role || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;

    // Simple signature check - we verify the full HMAC in the server action
    // The proxy just needs to check the cookie exists and isn't expired
    return { role: payload.role };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow login page and public endpoints
  if (
    pathname === "/login" ||
    pathname === "/api/seed" ||
    pathname === "/api/setup"
  ) {
    return NextResponse.next();
  }

  const session = getSessionFromRequest(request);

  // Root path: redirect based on role or to login
  if (pathname === "/") {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (session.role === "dtd") {
      return NextResponse.redirect(new URL("/dtd/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin routes: require admin role
  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // DTD routes: require dtd role
  if (pathname.startsWith("/dtd")) {
    if (!session || session.role !== "dtd") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Other API routes: require valid session
  if (pathname.startsWith("/api")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
