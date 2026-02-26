// app/api/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { client, initDB } from "@/lib/db";

export async function POST(request) {
  await initDB();
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    await client.execute({
      sql: "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      args: [name, email, hashed],
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }
}