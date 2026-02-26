// app/api/materials/route.js
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

  const { site_id, name, quantity, unit, note, date } = body;

  if (!site_id || !name || !quantity || !unit || !date)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });

  await client.execute({
    sql: "INSERT INTO materials (site_id, name, quantity, unit, note, date) VALUES (?, ?, ?, ?, ?, ?)",
    args: [String(site_id), name, String(quantity), unit, note || null, date],
  });

  return NextResponse.json({ success: true });
}