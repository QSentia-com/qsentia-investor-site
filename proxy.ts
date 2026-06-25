import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminPage = pathname.startsWith("/admin");
  const adminApi = pathname.startsWith("/api/admin");
  const customerPage = pathname.startsWith("/dashboard") || pathname.startsWith("/customer");
  const customerApi = pathname.startsWith("/api/customer");
  const protectedPage = adminPage || customerPage;
  const protectedApi = adminApi || customerApi;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (protectedApi) {
      return NextResponse.json(
        { error: "Authentication is not configured" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (protectedPage) {
      const signin = new URL("/signin", request.url);
      signin.searchParams.set("next", pathname);
      signin.searchParams.set("error", "auth_not_configured");
      return NextResponse.redirect(signin);
    }

    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (protectedApi && !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (protectedPage && !user) {
    const signin = new URL("/signin", request.url);
    signin.searchParams.set("next", pathname);
    return NextResponse.redirect(signin);
  }

  // redirect signed in users away from signin page
  if (pathname === "/signin" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/dashboard/:path*", "/customer/:path*", "/api/customer/:path*", "/signin"],
};
