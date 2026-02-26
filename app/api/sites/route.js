// app/api/sites/route.js
import { NextResponse } from "next/server";
import { client, initDB } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initDB();

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, client_name } = body;

  if (!name) return NextResponse.json({ error: "Site name is required" }, { status: 400 });

  await client.execute({
    sql: "INSERT INTO sites (user_id, name, client_name) VALUES (?, ?, ?)",
    args: [String(session.user.id), name, client_name || null],
  });

  return NextResponse.json({ success: true });
}