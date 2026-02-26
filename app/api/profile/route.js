// app/api/profile/route.js
import { NextResponse } from "next/server";
import { client, initDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initDB();

  const result = await client.execute({
    sql: "SELECT id, name, email FROM users WHERE id = ?",
    args: [session.user.id],
  });

  return NextResponse.json(result.rows[0]);
}

export async function PATCH(request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initDB();

  const { name, email, password } = await request.json();

  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    await client.execute({
      sql: "UPDATE users SET name=?, email=?, password=? WHERE id=?",
      args: [name, email, hashed, session.user.id],
    });
  } else {
    await client.execute({
      sql: "UPDATE users SET name=?, email=? WHERE id=?",
      args: [name, email, session.user.id],
    });
  }

  return NextResponse.json({ success: true });
}