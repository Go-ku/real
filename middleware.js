import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow next internals + static
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Check cookie existence (we verify token on server actions/pages when needed)
  const token = req.cookies.get("nyumba_session")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Apply to everything except Next.js internals
    */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
