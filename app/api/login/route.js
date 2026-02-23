import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { password } = await request.json();
  if (password === "Maqbool2@") {
    const c = await cookies();
    c.set("session", "authenticated", { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}