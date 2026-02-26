// app/api/payments/route.js
import { NextResponse } from "next/server";
import { client, initDB } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initDB();

  const { searchParams } = new URL(request.url);
  const site_id = searchParams.get("site_id");

  const result = await client.execute({
    sql: "SELECT * FROM payments WHERE site_id = ? ORDER BY date DESC",
    args: [site_id],
  });

  return NextResponse.json(result.rows);
}

export async function POST(request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initDB();

  const { site_id, amount, mode, note, date } = await request.json();

  if (!site_id || !amount || !date)
    return NextResponse.json({ error: "All fields required" }, { status: 400 });

  await client.execute({
    sql: "INSERT INTO payments (site_id, amount, mode, note, date) VALUES (?, ?, ?, ?, ?)",
    args: [String(site_id), amount, mode || "cash", note || null, date],
  });

  return NextResponse.json({ success: true });
}