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

  const { site_id, name, quantity, unit, rate, note, date } = body;

  if (!site_id || !name || !quantity || !unit || !date)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });

  const total_cost = parseFloat(quantity) * parseFloat(rate || 0);

  await client.execute({
    sql: "INSERT INTO materials (site_id, name, quantity, unit, rate, total_cost, note, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [String(site_id), name, String(quantity), unit, rate || 0, total_cost, note || null, date],
  });

  return NextResponse.json({ success: true });
}