import { createClient } from "@libsql/client/http";

export const db = createClient({
  url: "https://contractor-kamtatiwari.aws-ap-south-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzE4MzYwNTcsImlkIjoiM2U4MTMxMTEtMmIxZS00ZTRkLTg1ZGYtZWE5MmFhMTcwYTYwIiwicmlkIjoiMDAwZTVlZjEtM2RkZS00ZWY4LWI4OWItYTE2ZTMwYzBjYTMwIn0.Pz7Ur0r07Tdy9PTOYz4Oh_dgPUdQSHrNA2A8TUhOqXEgQv1xDMLVaIxTnvSE5xBLn8wdde4r3yVWFaMvIjYABw",
});

export async function initDB() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mobile TEXT,
      email TEXT,
      address TEXT,
      gst TEXT,
      created_at TEXT DEFAULT (date('now'))
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id),
      title TEXT NOT NULL,
      type TEXT DEFAULT 'residential',
      contract_value REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT (date('now'))
    );
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER REFERENCES projects(id),
      description TEXT NOT NULL,
      unit TEXT,
      qty REAL,
      rate REAL,
      vendor TEXT,
      date TEXT DEFAULT (date('now'))
    );
    CREATE TABLE IF NOT EXISTS labour (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER REFERENCES projects(id),
      worker_name TEXT NOT NULL,
      trade TEXT,
      days REAL,
      rate_per_day REAL,
      date TEXT DEFAULT (date('now'))
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER REFERENCES projects(id),
      amount REAL NOT NULL,
      type TEXT DEFAULT 'received',
      note TEXT,
      date TEXT DEFAULT (date('now'))
    );
  `);
}