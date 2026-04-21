import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import RentPayment from "../pages/RentPaymentTracking/RentPayment";
import { connectWebSocket, disconnectWebSocket } from "../utils/websocket";
import API from "../services/api";

const fmt = (n) => `LKR ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

export default function TenantBills() {
    const { user, logout } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.id) {
            navigate("/login");
            return;
        }
        let handleWebSocketMessage;
        fetchInvoices();

        // WebSocket connection for real-time updates
        handleWebSocketMessage = (updatedInvoice) => {
            if (updatedInvoice.tenantId === user.id) {
                setInvoices((prev) => {
                    const index = prev.findIndex((inv) => inv.invoiceNo === updatedInvoice.invoiceNo);
                    if (index !== -1) {
                        const next = [...prev];
                        next[index] = updatedInvoice;
                        return next;
                    }
                    return [updatedInvoice, ...prev];
                });
            }
        };

        connectWebSocket(handleWebSocketMessage);

        return () => {
            if (handleWebSocketMessage) {
                disconnectWebSocket(handleWebSocketMessage);
            }
        };
    }, [user?.id, navigate]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await API.get(`/api/v1/invoices/tenant/${user.id}`);
            setInvoices(response.data);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PAID": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "SENT": return "bg-blue-100 text-blue-700 border-blue-200";
            case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
            case "OVERDUE": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700";
        }
    };

    const handlePayBill = (bill) => {
        setSelectedBill(bill);
        setShowPaymentModal(true);
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm("Are you sure you want to remove this record from your dashboard? This action cannot be undone.")) return;

        try {
            await API.delete(`/api/v1/invoices/${id}/tenant`);
            setInvoices((prev) => prev.filter((inv) => (inv.id || inv.invoiceNo) !== id));
            alert("Invoice removed from your dashboard.");
        } catch (error) {
            console.error("Error deleting invoice:", error);
            alert(error.response?.data || "Failed to delete invoice.");
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 shadow-sm overflow-hidden text-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b border-emerald-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Invoices List</h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-black uppercase tracking-widest animate-pulse">Live Tracking</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-emerald-50 border-b border-emerald-100 text-emerald-800 font-bold uppercase tracking-wider text-xs">
                                <th className="p-4">Bill ID</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Overdue Fee</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">Loading bills...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">No bills found.</td></tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id || inv.invoiceNo} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-900 dark:text-white">{inv.invoiceNo}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{fmt(inv.total)}</td>
                                        <td className="p-4 text-red-600 font-semibold">{inv.overdueFee > 0 ? fmt(inv.overdueFee) : "-"}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{inv.dueDate}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                {inv.status !== "PAID" ? (
                                                    <button
                                                        onClick={() => handlePayBill(inv)}
                                                        className="bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition-all active:scale-95 shadow-sm">
                                                        Pay Rent
                                                    </button>
                                                ) : (
                                                    <button className="text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-lg opacity-50 cursor-default">
                                                        Paid
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteInvoice(inv.id || inv.invoiceNo)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all ml-1"
                                                    title="Remove from dashboard"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={showPaymentModal}
                onClose={() => { setShowPaymentModal(false); fetchInvoices(); }}
                title="Pay Your Bill"
            >
                <RentPayment bill={selectedBill} onComplete={() => { setShowPaymentModal(false); fetchInvoices(); }} />
            </Modal>
        </>
    );
}
