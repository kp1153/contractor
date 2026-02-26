// app/api/expenses/route.js
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

  const { site_id, category, amount, note, date } = body;

  if (!site_id || !amount || !date)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });

  await client.execute({
    sql: "INSERT INTO expenses (site_id, category, amount, note, date) VALUES (?, ?, ?, ?, ?)",
    args: [String(site_id), category || null, String(amount), note || null, date],
  });

  return NextResponse.json({ success: true });
}