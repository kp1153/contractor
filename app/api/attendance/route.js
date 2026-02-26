// app/api/attendance/route.js
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

  const { worker_id, site_id, date, status } = body;

  if (!worker_id || !site_id || !date || !status)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });

  await client.execute({
    sql: "INSERT INTO attendance (worker_id, site_id, date, status) VALUES (?, ?, ?, ?)",
    args: [String(worker_id), String(site_id), date, status],
  });

  return NextResponse.json({ success: true });
}