// app/dashboard/page.js
import { auth } from "@/lib/auth";
import { client, initDB } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await initDB();

  const userId = String(session.user.id);

  const sitesResult = await client.execute({
    sql: "SELECT * FROM sites WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });

  const sites = await Promise.all(
    sitesResult.rows.map(async (row) => {
      const expResult = await client.execute({
        sql: "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE site_id = ?",
        args: [String(row.id)],
      });

      const invResult = await client.execute({
        sql: "SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE site_id = ?",
        args: [String(row.id)],
      });

      const totalExpense = Number(expResult.rows[0].total);
      const totalInvoiced = Number(invResult.rows[0].total);

      return {
        id: Number(row.id),
        user_id: Number(row.user_id),
        name: String(row.name),
        client_name: row.client_name ? String(row.client_name) : null,
        status: String(row.status),
        created_at: String(row.created_at),
        total_expense: totalExpense,
        total_invoiced: totalInvoiced,
        profit: totalInvoiced - totalExpense,
      };
    })
  );

  return <DashboardClient sites={sites} userId={userId} />;
}