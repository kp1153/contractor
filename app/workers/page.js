// app/workers/page.js
import { auth } from "@/lib/auth";
import { client, initDB } from "@/lib/db";
import { redirect } from "next/navigation";
import WorkersClient from "./WorkersClient";

export default async function WorkersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await initDB();

  const result = await client.execute({
    sql: "SELECT * FROM workers WHERE user_id = ? ORDER BY name ASC",
    args: [String(session.user.id)],
  });

  const workers = result.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : null,
    daily_rate: Number(row.daily_rate),
  }));

  return <WorkersClient workers={workers} userId={String(session.user.id)} />;
}