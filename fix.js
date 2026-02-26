const {createClient} = require('@libsql/client');
const c = createClient({
  url: 'https://contractor-kamtatiwari.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzIwNjUzMDAsImlkIjoiM2U4MTMxMTEtMmIxZS00ZTRkLTg1ZGYtZWE5MmFhMTcwYTYwIiwicmlkIjoiMDAwZTVlZjEtM2RkZS00ZWY4LWI4OWItYTE2ZTMwYzBjYTMwIn0.Ichh5i3RjB7Wq6orDnnwO-qxvL4rV9oL9Mgnyc96HO9FNRPcBZvyovzBsrXw-wK2vl2C0AZjfIgl-kIEzFm2BA'
});
async function fix() {
  await c.execute('DROP TABLE IF EXISTS payments');
  await c.execute('CREATE TABLE payments (id INTEGER PRIMARY KEY AUTOINCREMENT, site_id INTEGER NOT NULL, amount REAL NOT NULL, mode TEXT DEFAULT (\'cash\'), note TEXT, date TEXT NOT NULL)');
  console.log('Done');
}
fix().catch(e => console.log(e.message));