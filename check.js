const {createClient} = require('@libsql/client');
const c = createClient({
  url: 'https://contractor-kamtatiwari.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzIwNjUzMDAsImlkIjoiM2U4MTMxMTEtMmIxZS00ZTRkLTg1ZGYtZWE5MmFhMTcwYTYwIiwicmlkIjoiMDAwZTVlZjEtM2RkZS00ZWY4LWI4OWItYTE2ZTMwYzBjYTMwIn0.Ichh5i3RjB7Wq6orDnnwO-qxvL4rV9oL9Mgnyc96HO9FNRPcBZvyovzBsrXw-wK2vl2C0AZjfIgl-kIEzFm2BA'
});
async function check() {
  const r = await c.execute('SELECT * FROM payments WHERE site_id = 2');
  console.log('payments query OK, rows:', r.rows.length);
}
check().catch(e => console.log('ERROR:', e.message));