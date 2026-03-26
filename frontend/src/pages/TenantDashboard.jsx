import { useState, useEffect } from "react";
import TenantSidebar from "../components/dashboard/TenantSidebar";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "../components/UserDropdown";
import Modal from "../components/Modal";
import RentPayment from "../pages/RentPaymentTracking/RentPayment";
import { connectWebSocket, disconnectWebSocket } from "../utils/websocket";
import axios from "axios";


import { useLocation, useNavigate } from "react-router-dom";

const fmt = (n) => `LKR ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

export default function TenantDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("bills");
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [cards, setCards] = useState([]);
    const [showCardModal, setShowCardModal] = useState(false);
    const [cardForm, setCardForm] = useState({ id: "", cardHolderName: "", cardNumber: "", expiryDate: "" });

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get("tab");
        if (tab) setActiveTab(tab);
    }, [location.search]);

    useEffect(() => {
        let handleWebSocketMessage;
        
        if (user?.id) {
            fetchInvoices();
            fetchCards();
            
            // WebSocket connection for real-time updates
            handleWebSocketMessage = (updatedInvoice) => {
                // If the updated invoice belongs to this tenant, update it in the list
                if (updatedInvoice.tenantId === user.id) {
                    setInvoices(prev => {
                        const index = prev.findIndex(inv => inv.invoiceNo === updatedInvoice.invoiceNo);
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
        }
        
        return () => {
            if (handleWebSocketMessage) {
                disconnectWebSocket(handleWebSocketMessage);
            }
        };
    }, [user?.id]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/invoices/tenant/${user.id}`);
            setInvoices(response.data);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCards = async () => {
        if (!user?.id) return;
        try {
            const resp = await axios.get(`http://localhost:8081/api/v1/cards/${user.id}`);
            setCards(resp.data);
        } catch (error) {
            console.error("Error fetching bank cards:", error);
        }
    };

    const handleCardInput = (e, field) => {
        let { value } = e.target;
        if (field === "cardNumber") value = value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
        if (field === "expiryDate") value = value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5);
        setCardForm({ ...cardForm, [field]: value });
    };

    const handleSaveCard = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...cardForm, ownerId: user.id };
            if (cardForm.id) await axios.put(`http://localhost:8081/api/v1/cards/${cardForm.id}`, payload);
            else await axios.post(`http://localhost:8081/api/v1/cards`, payload);
            alert("Card saved successfully!");
            setShowCardModal(false);
            fetchCards();
        } catch (error) {
            alert("Failed to save card.");
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Are you sure you want to delete this card?")) return;
        try {
            await axios.delete(`http://localhost:8081/api/v1/cards/${cardId}`);
            alert("Card deleted successfully!");
            fetchCards();
        } catch (error) {
            alert("Failed to delete card.");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PAID": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "SENT": return "bg-blue-100 text-blue-700 border-blue-200";
            case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
            case "OVERDUE": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const handlePayBill = (bill) => {
        setSelectedBill(bill);
        setShowPaymentModal(true);
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm("Are you sure you want to remove this record from your dashboard? This action cannot be undone.")) return;
        
        try {
            await axios.delete(`http://localhost:8081/api/v1/invoices/${id}/tenant`);
            setInvoices(prev => prev.filter(inv => (inv.id || inv.invoiceNo) !== id));
            alert("Invoice removed from your dashboard.");
        } catch (error) {
            console.error("Error deleting invoice:", error);
            alert(error.response?.data || "Failed to delete invoice.");
        }
    };


    return (
        <div className="flex min-h-screen bg-[#f6f8f7]" style={{ "--color-primary": "#13ec6d" }}>
            <TenantSidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0">
                        Tenant Dashboard
                    </h2>
                    <div className="flex items-center gap-3 ml-auto">
                        {user && <UserDropdown user={user} onLogout={logout} />}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    <div className="flex gap-4 mb-8 border-b border-emerald-100 pb-4">
                        <button
                            onClick={() => { setActiveTab("overview"); navigate("/tenant/dashboard?tab=overview"); }}
                            className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === "overview" ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-emerald-50"}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => { setActiveTab("bills"); navigate("/tenant/dashboard?tab=bills"); }}
                            className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === "bills" ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-emerald-50"}`}
                        >
                            My Bills
                        </button>
                        <button
                            onClick={() => { setActiveTab("wallet"); navigate("/tenant/dashboard?tab=wallet"); }}
                            className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === "wallet" ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-emerald-50"}`}
                        >
                            My Wallet
                        </button>
                    </div>


                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Active Lease</h3>
                                <p className="text-2xl font-black text-slate-900">Unit TBD</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Bills</h3>
                                <p className="text-2xl font-black text-amber-600">
                                    {invoices.filter(i => i.status !== "PAID").length}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Paid</h3>
                                <p className="text-2xl font-black text-emerald-600">
                                    {fmt(invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.total, 0))}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "bills" && (
                        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden text-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 border-b border-emerald-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-900">My Bills</h3>
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
                                            <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Loading bills...</td></tr>
                                        ) : invoices.length === 0 ? (
                                            <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No bills found.</td></tr>
                                        ) : (
                                            invoices.map((inv) => (
                                                <tr key={inv.id || inv.invoiceNo} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                                                    <td className="p-4 font-bold text-slate-900">{inv.invoiceNo}</td>
                                                    <td className="p-4 text-slate-600 font-semibold">{fmt(inv.total)}</td>
                                                    <td className="p-4 text-red-600 font-semibold">{inv.overdueFee > 0 ? fmt(inv.overdueFee) : "-"}</td>
                                                    <td className="p-4 text-slate-600 font-semibold">{inv.dueDate}</td>
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
                    )}

                    {activeTab === "wallet" && (
                        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-emerald-100">
                                <h3 className="font-bold text-xl text-slate-900">My Saved Cards</h3>
                                <button
                                    onClick={() => { setCardForm({ id: "", cardHolderName: "", cardNumber: "", expiryDate: "" }); setShowCardModal(true); }}
                                    className="bg-primary text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_card</span>
                                    Add New Card
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {cards.length === 0 ? (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                        <p className="text-slate-500 font-medium mb-2">No bank cards saved yet.</p>
                                        <p className="text-sm text-slate-400">Add a card to quickly pay rent.</p>
                                    </div>
                                ) : (
                                    cards.map(card => (
                                        <div key={card.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative group overflow-hidden">
                                            <div className="flex justify-between items-start mb-6">
                                                <span className="material-symbols-outlined opacity-50 text-3xl">contactless</span>
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 opacity-80" alt="Card Logo" />
                                            </div>
                                            <div className="mb-6 z-10 relative">
                                                <p className="text-xl font-mono tracking-[0.2em] font-medium text-slate-100">**** **** **** {card.cardNumber.slice(-4)}</p>
                                            </div>
                                            <div className="flex justify-between items-end z-10 relative">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Card Holder</p>
                                                    <p className="font-bold tracking-wide text-sm truncate max-w-[120px]">{card.cardHolderName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expires</p>
                                                    <p className="font-bold tracking-wide text-sm">{card.expiryDate}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Action Overlay */}
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 z-20">
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setCardForm(card); setShowCardModal(true); }} className="bg-white/20 hover:bg-white text-white hover:text-slate-900 p-2 rounded-lg backdrop-blur-md transition-all">
                                                        <span className="material-symbols-outlined text-sm block">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteCard(card.id)} className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg backdrop-blur-md transition-all">
                                                        <span className="material-symbols-outlined text-sm block">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* decorative circle */}
                                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-xl z-0 pointer-events-none" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {showCardModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold mb-6">{cardForm.id ? "Edit Bank Card" : "Add Bank Card"}</h3>
                            <form onSubmit={handleSaveCard} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Card Holder Name</label>
                                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:bg-white transition-colors outline-none" value={cardForm.cardHolderName} onChange={e => setCardForm({...cardForm, cardHolderName: e.target.value})} placeholder="JOHN DOE" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Card Number</label>
                                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:bg-white transition-colors outline-none" value={cardForm.cardNumber} onChange={e => handleCardInput(e, 'cardNumber')} placeholder="xxxx xxxx xxxx xxxx" maxLength="19" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Expiry Date</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:bg-white transition-colors outline-none" value={cardForm.expiryDate} onChange={e => handleCardInput(e, 'expiryDate')} placeholder="MM/YY" maxLength="5" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">CVV</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:bg-white transition-colors outline-none" placeholder="***" type="password" maxLength="3" onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '') }} />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowCardModal(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                                    <button type="submit" className="flex-1 bg-primary text-slate-900 px-6 py-3 rounded-xl font-bold">Save Card</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <Modal 
                    isOpen={showPaymentModal} 
                    onClose={() => setShowPaymentModal(false)}
                    title="Pay Your Bill"
                >
                    <RentPayment bill={selectedBill} onComplete={() => setShowPaymentModal(false)} />
                </Modal>
            </main>

        </div>
    );
}
