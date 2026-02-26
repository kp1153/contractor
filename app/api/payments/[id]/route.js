// app/api/payments/[id]/route.js
import { NextResponse } from "next/server";
import { client } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await client.execute({
    sql: "DELETE FROM payments WHERE id = ?",
    args: [id],
  });

  return NextResponse.json({ success: true });
}