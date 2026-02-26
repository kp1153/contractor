// app/sites/[id]/page.js
import { auth } from "@/lib/auth";
import { client, initDB } from "@/lib/db";
import { redirect } from "next/navigation";
import SiteClient from "./SiteClient";

export default async function SitePage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  await initDB();

  const siteResult = await client.execute({
    sql: "SELECT * FROM sites WHERE id = ? AND user_id = ?",
    args: [id, String(session.user.id)],
  });
  if (siteResult.rows.length === 0) redirect("/dashboard");

  const site = {
    id: Number(siteResult.rows[0].id),
    name: String(siteResult.rows[0].name),
    client_name: siteResult.rows[0].client_name ? String(siteResult.rows[0].client_name) : null,
    status: String(siteResult.rows[0].status),
  };

  const workersResult = await client.execute({
    sql: "SELECT * FROM workers WHERE user_id = ?",
    args: [String(session.user.id)],
  });
  const workers = workersResult.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : null,
    daily_rate: Number(row.daily_rate),
  }));

  const attendanceResult = await client.execute({
    sql: "SELECT a.*, w.name as worker_name, w.daily_rate FROM attendance a JOIN workers w ON a.worker_id = w.id WHERE a.site_id = ? ORDER BY a.date DESC",
    args: [id],
  });
  const attendance = attendanceResult.rows.map((row) => ({
    id: Number(row.id),
    worker_id: Number(row.worker_id),
    worker_name: String(row.worker_name),
    daily_rate: Number(row.daily_rate),
    date: String(row.date),
    status: String(row.status),
  }));

  const expensesResult = await client.execute({
    sql: "SELECT * FROM expenses WHERE site_id = ? ORDER BY date DESC",
    args: [id],
  });
  const expenses = expensesResult.rows.map((row) => ({
    id: Number(row.id),
    category: row.category ? String(row.category) : null,
    amount: Number(row.amount),
    note: row.note ? String(row.note) : null,
    date: String(row.date),
  }));

  const invoicesResult = await client.execute({
    sql: "SELECT * FROM invoices WHERE site_id = ? ORDER BY date DESC",
    args: [id],
  });
  const invoices = invoicesResult.rows.map((row) => ({
    id: Number(row.id),
    amount: Number(row.amount),
    gst: Number(row.gst),
    status: String(row.status),
    date: String(row.date),
  }));

  const materialsResult = await client.execute({
    sql: "SELECT * FROM materials WHERE site_id = ? ORDER BY date DESC",
    args: [id],
  });
  const materials = materialsResult.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    quantity: Number(row.quantity),
    unit: String(row.unit),
    rate: Number(row.rate || 0),
    total_cost: Number(row.total_cost || 0),
    note: row.note ? String(row.note) : null,
    date: String(row.date),
  }));

  const paymentsResult = await client.execute({
    sql: "SELECT * FROM payments WHERE site_id = ? ORDER BY date DESC",
    args: [id],
  });
  const payments = paymentsResult.rows.map((row) => ({
    id: Number(row.id),
    amount: Number(row.amount),
    mode: String(row.mode),
    note: row.note ? String(row.note) : null,
    date: String(row.date),
  }));

  return (
    <SiteClient
      site={site}
      workers={workers}
      attendance={attendance}
      expenses={expenses}
      invoices={invoices}
      materials={materials}
      payments={payments}
      siteId={id}
    />
  );
}