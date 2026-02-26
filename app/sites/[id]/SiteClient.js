"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";

export default function SiteClient({ site, workers, attendance, expenses, invoices, materials, payments, siteId }) {
  const router = useRouter();
  const [tab, setTab] = useState("attendance");
  const [workerId, setWorkerId] = useState("");
  const [attDate, setAttDate] = useState("");
  const [attStatus, setAttStatus] = useState("full");
  const [expCategory, setExpCategory] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expNote, setExpNote] = useState("");
  const [expDate, setExpDate] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invGst, setInvGst] = useState("");
  const [invDate, setInvDate] = useState("");
  const [matName, setMatName] = useState("");
  const [matQty, setMatQty] = useState("");
  const [matUnit, setMatUnit] = useState("");
  const [matRate, setMatRate] = useState("");
  const [matNote, setMatNote] = useState("");
  const [matDate, setMatDate] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("cash");
  const [payNote, setPayNote] = useState("");
  const [payDate, setPayDate] = useState("");

  async function handleAttendance(e) {
    e.preventDefault();
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker_id: workerId, site_id: siteId, date: attDate, status: attStatus }),
    });
    router.refresh();
  }

  async function handleExpense(e) {
    e.preventDefault();
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId, category: expCategory, amount: expAmount, note: expNote, date: expDate }),
    });
    router.refresh();
  }

  async function handleInvoice(e) {
    e.preventDefault();
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId, amount: invAmount, gst: invGst, date: invDate }),
    });
    router.refresh();
  }

  async function handleMaterial(e) {
    e.preventDefault();
    await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId, name: matName, quantity: matQty, unit: matUnit, rate: matRate, note: matNote, date: matDate }),
    });
    router.refresh();
    setMatName(""); setMatQty(""); setMatUnit(""); setMatRate(""); setMatNote(""); setMatDate("");
  }

  async function handlePayment(e) {
    e.preventDefault();
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId, amount: payAmount, mode: payMode, note: payNote, date: payDate }),
    });
    router.refresh();
    setPayAmount(""); setPayMode("cash"); setPayNote(""); setPayDate("");
  }

  async function toggleInvoiceStatus(inv) {
    const newStatus = inv.status === "paid" ? "unpaid" : "paid";
    await fetch(`/api/invoices/${inv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  async function deleteRecord(type, id) {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/${type}/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function downloadInvoicePDF(inv) {
    const doc = new jsPDF();
    const gstAmount = (inv.amount * inv.gst) / 100;
    const total = inv.amount + gstAmount;
    doc.setFontSize(20);
    doc.text("INVOICE", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Site: ${site.name}`, 20, 40);
    doc.text(`Client: ${site.client_name || "N/A"}`, 20, 50);
    doc.text(`Date: ${inv.date}`, 20, 60);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 20, 70);
    doc.line(20, 80, 190, 80);
    doc.text("Description", 20, 90);
    doc.text("Amount", 150, 90);
    doc.line(20, 95, 190, 95);
    doc.text("Contract Amount", 20, 105);
    doc.text(`Rs. ${inv.amount.toLocaleString()}`, 150, 105);
    doc.text(`GST (${inv.gst}%)`, 20, 115);
    doc.text(`Rs. ${gstAmount.toLocaleString()}`, 150, 115);
    doc.line(20, 125, 190, 125);
    doc.setFontSize(14);
    doc.text("Total", 20, 135);
    doc.text(`Rs. ${total.toLocaleString()}`, 150, 135);
    doc.save(`invoice-${site.name}-${inv.date}.pdf`);
  }

  function shareOnWhatsApp(inv) {
    const gstAmount = (inv.amount * inv.gst) / 100;
    const total = inv.amount + gstAmount;
    const message = `Invoice - ${site.name}\nClient: ${site.client_name || "N/A"}\nDate: ${inv.date}\nAmount: Rs. ${inv.amount.toLocaleString()}\nGST (${inv.gst}%): Rs. ${gstAmount.toLocaleString()}\nTotal: Rs. ${total.toLocaleString()}\nStatus: ${inv.status.toUpperCase()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  const wagesByWorker = {};
  attendance.forEach((a) => {
    if (!wagesByWorker[a.worker_id]) {
      wagesByWorker[a.worker_id] = { name: a.worker_name, daily_rate: a.daily_rate, full: 0, half: 0, absent: 0 };
    }
    if (a.status === "full") wagesByWorker[a.worker_id].full += 1;
    if (a.status === "half") wagesByWorker[a.worker_id].half += 1;
    if (a.status === "absent") wagesByWorker[a.worker_id].absent += 1;
  });

  const wagesList = Object.values(wagesByWorker).map((w) => ({
    ...w,
    total: w.full * w.daily_rate + w.half * (w.daily_rate / 2),
  }));

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalReceived = (payments || []).reduce((sum, p) => sum + p.amount, 0);
  const totalPending = totalInvoiced - totalReceived;

  const inputClass = "block w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 mb-3";
  const selectClass = "block w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-orange-500 mb-3";
  const saveBtn = "px-6 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded-lg font-bold transition-colors";
  const deleteBtn = "px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg text-xs font-bold transition-colors";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-black text-black text-sm">C</div>
          <span className="font-bold text-lg tracking-tight">ContractorDesk</span>
        </div>
        <button onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-medium transition-colors">
          &larr; Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black">{site.name}</h1>
            <p className="text-zinc-500 mt-1">Client: {site.client_name || "N/A"}</p>
          </div>
          <select defaultValue={site.status}
            onChange={async (e) => {
              await fetch(`/api/sites/${siteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: e.target.value }),
              });
              router.refresh();
            }}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-orange-500 text-sm font-bold">
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total Invoiced</p>
            <p className="text-2xl font-black text-orange-400">&#8377;{totalInvoiced.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total Expenses</p>
            <p className="text-2xl font-black text-red-400">&#8377;{totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Received</p>
            <p className="text-2xl font-black text-green-400">&#8377;{totalReceived.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Pending</p>
            <p className={`text-2xl font-black ${totalPending > 0 ? "text-yellow-400" : "text-green-400"}`}>&#8377;{totalPending.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4 flex-wrap">
          {["attendance", "expenses", "invoices", "wages", "materials", "payments"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
                tab === t ? "bg-orange-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "attendance" && (
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <h2 className="font-bold text-zinc-300 mb-4">Mark Attendance</h2>
              <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className={selectClass}>
                <option value="">Select Worker</option>
                {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} className={inputClass} />
              <select value={attStatus} onChange={(e) => setAttStatus(e.target.value)} className={selectClass}>
                <option value="full">Full Day</option>
                <option value="half">Half Day</option>
                <option value="absent">Absent</option>
              </select>
              <button onClick={handleAttendance} className={saveBtn}>Save</button>
            </div>
            <h2 className="font-bold text-zinc-300 mb-3">Records</h2>
            {attendance.length === 0 && <p className="text-zinc-600">No records yet.</p>}
            <div className="grid gap-2">
              {attendance.map((a) => (
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex justify-between items-center">
                  <span className="font-medium">{a.worker_name}</span>
                  <span className="text-zinc-500 text-sm">{a.date}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    a.status === "full" ? "bg-green-500/20 text-green-400" :
                    a.status === "half" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>{a.status}</span>
                  <button onClick={() => deleteRecord("attendance", a.id)} className={deleteBtn}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "expenses" && (
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <h2 className="font-bold text-zinc-300 mb-4">Add Expense</h2>
              <input type="text" placeholder="Category (Cement, Labour...)" value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Amount" value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)} className={inputClass} />
              <input type="text" placeholder="Note" value={expNote}
                onChange={(e) => setExpNote(e.target.value)} className={inputClass} />
              <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className={inputClass} />
              <button onClick={handleExpense} className={saveBtn}>Save</button>
            </div>
            <h2 className="font-bold text-zinc-300 mb-3">Records</h2>
            {expenses.length === 0 && <p className="text-zinc-600">No expenses yet.</p>}
            <div className="grid gap-2">
              {expenses.map((e) => (
                <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{e.category || "Uncategorized"}</p>
                    {e.note && <p className="text-zinc-500 text-sm">{e.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-400">&#8377;{e.amount.toLocaleString()}</p>
                    <p className="text-zinc-500 text-sm">{e.date}</p>
                  </div>
                  <button onClick={() => deleteRecord("expenses", e.id)} className={deleteBtn}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "invoices" && (
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <h2 className="font-bold text-zinc-300 mb-4">Create Invoice</h2>
              <input type="number" placeholder="Amount" value={invAmount}
                onChange={(e) => setInvAmount(e.target.value)} className={inputClass} />
              <input type="number" placeholder="GST %" value={invGst}
                onChange={(e) => setInvGst(e.target.value)} className={inputClass} />
              <input type="date" value={invDate} onChange={(e) => setInvDate(e.target.value)} className={inputClass} />
              <button onClick={handleInvoice} className={saveBtn}>Save</button>
            </div>
            <h2 className="font-bold text-zinc-300 mb-3">Records</h2>
            {invoices.length === 0 && <p className="text-zinc-600">No invoices yet.</p>}
            <div className="grid gap-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-orange-400">&#8377;{inv.amount.toLocaleString()}</p>
                    <p className="text-zinc-500 text-sm">GST {inv.gst}% - {inv.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleInvoiceStatus(inv)}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
                        inv.status === "paid" ? "bg-green-500/20 text-green-400 hover:bg-green-500/40" : "bg-red-500/20 text-red-400 hover:bg-red-500/40"
                      }`}>{inv.status}</button>
                    <button onClick={() => downloadInvoicePDF(inv)}
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg text-xs font-bold transition-colors">PDF</button>
                    <button onClick={() => shareOnWhatsApp(inv)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors">WhatsApp</button>
                    <button onClick={() => deleteRecord("invoices", inv.id)} className={deleteBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "wages" && (
          <div>
            <h2 className="font-bold text-zinc-300 mb-4">Wages Calculator</h2>
            {wagesList.length === 0 && <p className="text-zinc-600">No attendance records yet.</p>}
            <div className="grid gap-3">
              {wagesList.map((w, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h3 className="font-bold text-lg mb-4">{w.name}</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { label: "Full Days", value: w.full, color: "text-green-400" },
                      { label: "Half Days", value: w.half, color: "text-yellow-400" },
                      { label: "Absent", value: w.absent, color: "text-red-400" },
                      { label: "Daily Rate", value: `₹${w.daily_rate}`, color: "text-zinc-300" },
                      { label: "Total Wages", value: `₹${w.total.toLocaleString()}`, color: "text-orange-400" },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-zinc-600 text-xs uppercase tracking-wide mb-1">{item.label}</p>
                        <p className={`font-black text-lg ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {wagesList.length > 0 && (
              <div className="bg-zinc-900 border border-orange-500/30 rounded-xl p-5 mt-4">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total Wages Payable</p>
                <p className="text-3xl font-black text-orange-400">
                  &#8377;{wagesList.reduce((sum, w) => sum + w.total, 0).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "materials" && (
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <h2 className="font-bold text-zinc-300 mb-4">Add Material</h2>
              <input type="text" placeholder="Material Name (Cement, Sand...)" value={matName}
                onChange={(e) => setMatName(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Quantity" value={matQty}
                onChange={(e) => setMatQty(e.target.value)} className={inputClass} />
              <input type="text" placeholder="Unit (bags, kg, cft...)" value={matUnit}
                onChange={(e) => setMatUnit(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Rate per unit (₹)" value={matRate}
                onChange={(e) => setMatRate(e.target.value)} className={inputClass} />
              <input type="text" placeholder="Note" value={matNote}
                onChange={(e) => setMatNote(e.target.value)} className={inputClass} />
              <input type="date" value={matDate}
                onChange={(e) => setMatDate(e.target.value)} className={inputClass} />
              <button onClick={handleMaterial} className={saveBtn}>Save</button>
            </div>
            <h2 className="font-bold text-zinc-300 mb-3">Stock Records</h2>
            {materials.length === 0 && <p className="text-zinc-600">No materials yet.</p>}
            <div className="grid gap-2">
              {materials.map((m) => (
                <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    {m.note && <p className="text-zinc-500 text-sm">{m.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-400">{m.quantity} {m.unit}</p>
                    {m.rate > 0 && <p className="text-green-400 text-sm font-bold">&#8377;{(m.total_cost || 0).toLocaleString()}</p>}
                    <p className="text-zinc-500 text-sm">{m.date}</p>
                  </div>
                  <button onClick={() => deleteRecord("materials", m.id)} className={deleteBtn}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <h2 className="font-bold text-zinc-300 mb-4">Payment Received</h2>
              <input type="number" placeholder="Amount (₹)" value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)} className={inputClass} />
              <select value={payMode} onChange={(e) => setPayMode(e.target.value)} className={selectClass}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="bank">Bank Transfer</option>
              </select>
              <input type="text" placeholder="Note" value={payNote}
                onChange={(e) => setPayNote(e.target.value)} className={inputClass} />
              <input type="date" value={payDate}
                onChange={(e) => setPayDate(e.target.value)} className={inputClass} />
              <button onClick={handlePayment} className={saveBtn}>Save</button>
            </div>
            <div className="bg-zinc-900 border border-orange-500/30 rounded-xl p-5 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total Invoiced</p>
                  <p className="text-xl font-black text-orange-400">&#8377;{totalInvoiced.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Received</p>
                  <p className="text-xl font-black text-green-400">&#8377;{totalReceived.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Pending</p>
                  <p className={`text-xl font-black ${totalPending > 0 ? "text-yellow-400" : "text-green-400"}`}>&#8377;{totalPending.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <h2 className="font-bold text-zinc-300 mb-3">Payment Records</h2>
            {(payments || []).length === 0 && <p className="text-zinc-600">No payments yet.</p>}
            <div className="grid gap-2">
              {(payments || []).map((p) => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-black text-green-400 text-lg">&#8377;{p.amount.toLocaleString()}</p>
                    {p.note && <p className="text-zinc-500 text-sm">{p.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-300 text-sm font-bold uppercase">{p.mode}</p>
                    <p className="text-zinc-500 text-sm">{p.date}</p>
                  </div>
                  <button onClick={() => deleteRecord("payments", p.id)} className={deleteBtn}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}