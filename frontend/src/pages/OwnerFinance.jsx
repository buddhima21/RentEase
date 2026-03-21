import { useState, useRef } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "../components/UserDropdown";
import { ownerProfile } from "../data/ownerDashboardData";

const TENANTS = [
    { id: "t1", name: "Kamal Perera", unit: "Unit 1A", rentalFee: 18000 },
    { id: "t2", name: "Nimasha Silva", unit: "Unit 2B", rentalFee: 22000 },
    { id: "t3", name: "Ravi Fernando", unit: "Unit 3C", rentalFee: 15500 },
    { id: "t4", name: "Dilini Jayawardena", unit: "Unit 4B", rentalFee: 24500 },
    { id: "t5", name: "Saman Wickrama", unit: "Unit 5A", rentalFee: 19000 },
];

const today = new Date();
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DUE_DATE = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
const INVOICE_NO = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;

const fmt = (n) => `LKR ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

function Field({ label, icon, children }) {
    return (
        <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 block ml-1">{label}</label>
            <div className={`relative ${icon ? "group" : ""}`}>
                {icon && (
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-emerald-600 transition-colors pointer-events-none">
                        {icon}
                    </span>
                )}
                {children}
            </div>
        </div>
    );
}

const inputCls = (hasIcon) =>
    `w-full bg-[#f6f8f7] border border-emerald-100 rounded-xl ${hasIcon ? "pl-11" : "px-4"} pr-4 py-3 text-sm font-bold focus:border-emerald-500 focus:bg-white outline-none transition-all`;

export default function OwnerFinance() {
    const { user, logout } = useAuth();
    const printRef = useRef();

    // Tabs state
    const [activeTab, setActiveTab] = useState("generate"); // "generate" or "tracking"

    // Form state
    const [tenantId, setTenantId] = useState("");
    const [electricity, setElectricity] = useState("");
    const [water, setWater] = useState("");
    const [extras, setExtras] = useState([{ label: "", amount: "" }]);
    const [generated, setGenerated] = useState(false);

    const tenant = TENANTS.find((t) => t.id === tenantId);
    const rental = tenant ? tenant.rentalFee : 0;
    const elec = parseFloat(electricity) || 0;
    const wat = parseFloat(water) || 0;
    const extraTotal = extras.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const grandTotal = rental + elec + wat + extraTotal;

    const setExtra = (idx, key, val) => setExtras((ex) => ex.map((e, i) => (i === idx ? { ...e, [key]: val } : e)));
    const addExtra = () => setExtras((ex) => [...ex, { label: "", amount: "" }]);
    const removeExtra = (idx) => setExtras((ex) => ex.filter((_, i) => i !== idx));

    const handlePrint = () => window.print();
    const canGenerate = !!tenant;

    const invoices = [
        { id: "INV-20260301-1234", tenant: "Kamal Perera", amount: "LKR 20,500.00", date: "01 March 2026", status: "Paid" },
        { id: "INV-20260305-5678", tenant: "Nimasha Silva", amount: "LKR 23,200.00", date: "05 March 2026", status: "Pending" },
        { id: "INV-20260215-9012", tenant: "Ravi Fernando", amount: "LKR 18,500.00", date: "15 February 2026", status: "Overdue" },
        { id: "INV-20260306-3456", tenant: "Dilini Jayawardena", amount: "LKR 26,000.00", date: "06 March 2026", status: "Pending" },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case "Paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
            case "Overdue": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f6f8f7]" style={{ "--color-primary": "#13ec6d" }}>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0 print:hidden">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0">
                        Finance & Payments
                    </h2>
                    <div className="flex items-center gap-3 ml-auto">
                        {user ? (
                            <UserDropdown user={user} onLogout={logout} />
                        ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-primary bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${ownerProfile.avatar}')` }} />
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-emerald-100 pb-4 print:hidden">
                        <button
                            onClick={() => setActiveTab("tracking")}
                            className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === "tracking" ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-emerald-50"}`}
                        >
                            Tracking (Invoices)
                        </button>
                         <button
                            onClick={() => setActiveTab("generate")}
                            className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === "generate" ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-emerald-50"}`}
                        >
                            Generate Invoice
                        </button>
                    </div>

                    {activeTab === "tracking" && (
                        <div className="space-y-6 print:hidden">
                            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden text-sm">
                                <div className="p-6 border-b border-emerald-100">
                                    <h3 className="font-bold text-lg text-slate-900">Generated Invoices</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-emerald-50 border-b border-emerald-100 text-emerald-800 font-bold uppercase tracking-wider text-xs">
                                                <th className="p-4">Invoice ID</th>
                                                <th className="p-4">Tenant</th>
                                                <th className="p-4">Amount</th>
                                                <th className="p-4">Date Sent</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map((inv) => (
                                                <tr key={inv.id} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                                                    <td className="p-4 font-bold text-slate-900">{inv.id}</td>
                                                    <td className="p-4 text-slate-600 font-semibold">{inv.tenant}</td>
                                                    <td className="p-4 text-slate-600 font-semibold">{inv.amount}</td>
                                                    <td className="p-4 text-slate-600">{inv.date}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(inv.status)}`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button className="text-emerald-700 hover:text-emerald-900 font-bold text-xs bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                                                            View PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "generate" && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                            {/* Left: Form */}
                            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 space-y-6 print:hidden">
                                <div className="flex items-center gap-3 pb-4 border-b border-emerald-50">
                                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-emerald-800">
                                        <span className="material-symbols-outlined text-xl">receipt_long</span>
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-slate-900">New Invoice</h1>
                                        <p className="text-xs text-slate-500 font-medium">{INVOICE_NO}</p>
                                    </div>
                                </div>

                                <Field label="Select Tenant" icon="person">
                                    <select
                                        className={inputCls(true) + " appearance-none cursor-pointer"}
                                        value={tenantId}
                                        onChange={(e) => { setTenantId(e.target.value); setGenerated(false); }}
                                    >
                                        <option value="">— Choose a tenant —</option>
                                        {TENANTS.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name} · {t.unit}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">expand_more</span>
                                </Field>

                                <Field label="Monthly Rental Fee (Default)" icon="home_work">
                                    <input
                                        className={inputCls(true) + " bg-emerald-50/50 text-emerald-700 cursor-not-allowed"}
                                        value={tenant ? fmt(rental) : "Select a tenant to see fee"}
                                        readOnly
                                    />
                                </Field>

                                <Field label="Electricity Bill" icon="bolt">
                                    <input
                                        type="number"
                                        min="0"
                                        className={inputCls(true)}
                                        placeholder="0.00"
                                        value={electricity}
                                        onChange={(e) => setElectricity(e.target.value)}
                                    />
                                </Field>

                                <Field label="Water Bill" icon="water_drop">
                                    <input
                                        type="number"
                                        min="0"
                                        className={inputCls(true)}
                                        placeholder="0.00"
                                        value={water}
                                        onChange={(e) => setWater(e.target.value)}
                                    />
                                </Field>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Extra Fees</label>
                                        <button onClick={addExtra} className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                            <span className="material-symbols-outlined text-base">add_circle</span>
                                            Add Fee
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {extras.map((ex, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    className="flex-1 bg-[#f6f8f7] border border-emerald-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                                                    placeholder="Description"
                                                    value={ex.label}
                                                    onChange={(e) => setExtra(idx, "label", e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-28 bg-[#f6f8f7] border border-emerald-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                                                    placeholder="Amount"
                                                    value={ex.amount}
                                                    onChange={(e) => setExtra(idx, "amount", e.target.value)}
                                                />
                                                {extras.length > 1 && (
                                                    <button onClick={() => removeExtra(idx)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                                        <span className="material-symbols-outlined text-base">close</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-xl px-5 py-4 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Due</span>
                                    <span className="text-xl font-black text-white">{fmt(grandTotal)}</span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        disabled={!canGenerate}
                                        onClick={() => setGenerated(true)}
                                        className="flex-1 bg-primary text-slate-900 py-3 rounded-xl font-bold text-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-base">preview</span>
                                        Preview Invoice
                                    </button>
                                    <button
                                        disabled={!generated}
                                        onClick={handlePrint}
                                        className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-base">print</span>
                                        Print PDF
                                    </button>
                                </div>
                            </div>

                            {/* Right: Preview */}
                            <div ref={printRef}>
                                {generated && tenant ? (
                                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden print:shadow-none print:border-none print:mb-0">
                                        <div className="bg-emerald-900 px-8 py-6 flex items-start justify-between print:bg-white print:text-black">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="material-symbols-outlined text-primary text-2xl print:hidden">home_work</span>
                                                    <span className="text-white font-black text-lg tracking-tight print:text-slate-900">RentEase</span>
                                                </div>
                                                <p className="text-emerald-200 text-xs font-medium print:text-slate-500">Property Management Portal</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-white print:text-slate-900">INVOICE</p>
                                                <p className="text-emerald-200 text-xs mt-1 print:text-slate-500">{INVOICE_NO}</p>
                                            </div>
                                        </div>

                                        <div className="px-8 py-6 space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bill To</p>
                                                    <p className="font-bold text-slate-900">{tenant.name}</p>
                                                    <p className="text-sm text-slate-500">{tenant.unit}</p>
                                                    <p className="text-sm text-slate-500">RentEase Properties</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Invoice Date</p>
                                                    <p className="font-bold text-slate-700 text-sm">{DUE_DATE}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 mb-1">Due Date</p>
                                                    <p className="font-bold text-emerald-600 text-sm print:text-slate-900">{DUE_DATE}</p>
                                                </div>
                                            </div>

                                            <div className="bg-[#f6f8f7] rounded-xl overflow-hidden print:bg-white print:border print:border-slate-200">
                                                <div className="grid grid-cols-[1fr_auto] px-5 py-3 border-b border-emerald-100 print:border-slate-200">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Amount</span>
                                                </div>

                                                <div className="grid grid-cols-[1fr_auto] px-5 py-3.5 border-b border-emerald-50 print:border-slate-100">
                                                    <span className="text-sm font-bold text-slate-700">Monthly Rental Fee</span>
                                                    <span className="text-sm font-bold text-slate-900 text-right">{fmt(rental)}</span>
                                                </div>

                                                {elec > 0 && (
                                                    <div className="grid grid-cols-[1fr_auto] px-5 py-3.5 border-b border-emerald-50 print:border-slate-100">
                                                        <span className="text-sm font-bold text-slate-700">Electricity Bill</span>
                                                        <span className="text-sm font-bold text-slate-900 text-right">{fmt(elec)}</span>
                                                    </div>
                                                )}

                                                {wat > 0 && (
                                                    <div className="grid grid-cols-[1fr_auto] px-5 py-3.5 border-b border-emerald-50 print:border-slate-100">
                                                        <span className="text-sm font-bold text-slate-700">Water Bill</span>
                                                        <span className="text-sm font-bold text-slate-900 text-right">{fmt(wat)}</span>
                                                    </div>
                                                )}

                                                {extras.filter((e) => e.label && parseFloat(e.amount) > 0).map((e, i) => (
                                                    <div key={i} className="grid grid-cols-[1fr_auto] px-5 py-3.5 border-b border-emerald-50 print:border-slate-100">
                                                        <span className="text-sm font-bold text-slate-700">{e.label}</span>
                                                        <span className="text-sm font-bold text-slate-900 text-right">{fmt(parseFloat(e.amount))}</span>
                                                    </div>
                                                ))}

                                                <div className="grid grid-cols-[1fr_auto] px-5 py-4 bg-emerald-900 print:bg-slate-100 rounded-b-xl">
                                                    <span className="text-sm font-bold text-white print:text-slate-900 uppercase tracking-wider">Total Due</span>
                                                    <span className="text-base font-black text-primary print:text-slate-900 text-right">{fmt(grandTotal)}</span>
                                                </div>
                                            </div>

                                            <div className="bg-emerald-50 text-emerald-800 rounded-xl px-5 py-4 print:border outline-none print:bg-white print:text-slate-600">
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-800">Payment Instructions</p>
                                                <p className="text-xs font-medium leading-relaxed">
                                                    Please make payment by the due date via bank transfer or through the RentEase portal. Contact manager for queries.
                                                </p>
                                            </div>

                                            <div className="pt-2 text-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated by RentEase · {DUE_DATE}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border border-dashed border-emerald-200 flex flex-col items-center justify-center py-24 text-center print:hidden">
                                        <span className="material-symbols-outlined text-5xl text-emerald-100 mb-4">receipt_long</span>
                                        <p className="text-sm font-bold text-slate-500 mb-1">Invoice Preview</p>
                                        <p className="text-xs text-slate-400 max-w-xs">
                                            Select a tenant and click <strong>Preview Invoice</strong> to see the generated invoice here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
