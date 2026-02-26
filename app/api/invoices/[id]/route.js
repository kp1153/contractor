import { NextResponse } from "next/server";
import { client } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await request.json();
  await client.execute({ sql: "UPDATE invoices SET status=? WHERE id=?", args: [status, id] });
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await client.execute({ sql: "DELETE FROM invoices WHERE id=?", args: [id] });
  return NextResponse.json({ success: true });
}