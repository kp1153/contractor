// lib/db.js
import { createClient } from "@libsql/client/http";

const client = createClient({
  url: "https://contractor-kamtatiwari.aws-ap-south-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzIwNjUzMDAsImlkIjoiM2U4MTMxMTEtMmIxZS00ZTRkLTg1ZGYtZWE5MmFhMTcwYTYwIiwicmlkIjoiMDAwZTVlZjEtM2RkZS00ZWY4LWI4OWItYTE2ZTMwYzBjYTMwIn0.Ichh5i3RjB7Wq6orDnnwO-qxvL4rV9oL9Mgnyc96HO9FNRPcBZvyovzBsrXw-wK2vl2C0AZjfIgl-kIEzFm2BA",
});

export async function initDB() {
  await client.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    client_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    daily_rate REAL NOT NULL
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    site_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    category TEXT,
    amount REAL NOT NULL,
    note TEXT,
    date TEXT NOT NULL
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    gst REAL DEFAULT 0,
    status TEXT DEFAULT 'unpaid',
    date TEXT NOT NULL
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    rate REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    note TEXT,
    date TEXT NOT NULL
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    mode TEXT DEFAULT 'cash',
    note TEXT,
    date TEXT NOT NULL
  )`);
}

export { client };