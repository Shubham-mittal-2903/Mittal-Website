import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/leads/login";
  const isApiRoute = pathname.startsWith("/api/");

  if (!user && isApiRoute) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/leads/login", request.url));
  }
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/leads", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/leads/:path*", "/api/leads/:path*", "/api/uploads/:path*", "/api/mos-assistant/:path*"],
};
