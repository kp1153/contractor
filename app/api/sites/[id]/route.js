// app/api/sites/[id]/route.js
import { NextResponse } from "next/server";
import { client } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { status } = body;

  if (!["active", "completed", "on_hold"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  await client.execute({
    sql: "UPDATE sites SET status = ? WHERE id = ? AND user_id = ?",
    args: [status, String(id), String(session.user.id)],
  });

  return NextResponse.json({ success: true });
}