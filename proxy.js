import { NextResponse } from "next/server";

export function proxy(request) {
  const session = request.cookies.get("session");
  const isAuth = session?.value === "authenticated";
  const isLoginPage = request.nextUrl.pathname === "/";

  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};