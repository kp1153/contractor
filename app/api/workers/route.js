// app/api/workers/route.js
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

  const { name, phone, daily_rate } = body;

  if (!name || !daily_rate)
    return NextResponse.json({ error: "Name and daily rate are required" }, { status: 400 });

  await client.execute({
    sql: "INSERT INTO workers (user_id, name, phone, daily_rate) VALUES (?, ?, ?, ?)",
    args: [String(session.user.id), name, phone || null, daily_rate],
  });

  return NextResponse.json({ success: true });
}