import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/owner/dashboard/Sidebar";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "../components/UserDropdown";
import { ownerProfile } from "../data/ownerDashboardData";
import { connectWebSocket, disconnectWebSocket } from "../utils/websocket";
import API from "../services/api";

const today = new Date();
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const BILL_NO = `BILL-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;


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
    const [activeTab, setActiveTab] = useState("generate"); // "generate", "tracking", "wallet"

    // Data state
    const [tenants, setTenants] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loadingTenants, setLoadingTenants] = useState(true);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    // Wallet state
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loadingWallet, setLoadingWallet] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [cardForm, setCardForm] = useState({ cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "" });
    const [cardErrors, setCardErrors] = useState({});
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [selectedCardForWithdrawal, setSelectedCardForWithdrawal] = useState("");

    // Form state
    const [tenantId, setTenantId] = useState("");
    const [electricity, setElectricity] = useState("");
    const [water, setWater] = useState("");
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const localTodayString = `${yyyy}-${mm}-${dd}`;

    const [dueDate, setDueDate] = useState(localTodayString);
    const [extras, setExtras] = useState([{ label: "", amount: "" }]);
    const [generated, setGenerated] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        // WebSocket connection
        const handleWebSocketMessage = (updatedInvoice) => {
            setInvoices(prev => {
                const index = prev.findIndex(inv => inv.invoiceNo === updatedInvoice.invoiceNo);
                if (index !== -1) {
                    const next = [...prev];
                    next[index] = updatedInvoice;
                    return next;
                }
                return [updatedInvoice, ...prev];
            });
            // Also refresh wallet if an invoice was paid
            if (updatedInvoice.status === "PAID") fetchWallet();
        };

        connectWebSocket(handleWebSocketMessage);

        return () => disconnectWebSocket(handleWebSocketMessage);
    }, []);

    useEffect(() => {
        if (activeTab === "generate" && user?.id) fetchTenants();
        if (activeTab === "tracking") fetchInvoices();
        if (activeTab === "wallet") fetchWallet();
    }, [activeTab, user?.id]);

    const fetchTenants = async () => {
        if (!user?.id) return;
        try {
            const response = await API.get(`/api/v1/users/tenants?ownerId=${user.id}`);
            if (response.data.success) {
                const mappedTenants = response.data.data.map(item => ({
                    id: item.tenantId,
                    propertyId: item.propertyId,
                    name: item.tenantName,
                    email: item.tenantEmail,
                    unit: item.propertyTitle,
                    rentalFee: item.rentalFee
                }));
                setTenants(mappedTenants);
            }
        } catch (error) {
            console.error("Error fetching tenants:", error);
        } finally {
            setLoadingTenants(false);
        }
    };

    const fetchInvoices = async () => {
        setLoadingInvoices(true);
        try {
            const response = await API.get("/api/v1/invoices");
            setInvoices(response.data);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoadingInvoices(false);
        }
    };

    const fetchWallet = async () => {
        if (!user?.id) return;
        setLoadingWallet(true);
        try {
            const [wResp, tResp] = await Promise.all([
                API.get(`/api/v1/wallet/${user.id}`),
                API.get(`/api/v1/wallet/${user.id}/transactions`)
            ]);
            setWallet(wResp.data);
            setTransactions(tResp.data);
            setCardForm({
                id: "",
                cardHolderName: "",
                cardNumber: "",
                expiryDate: ""
            });
            if (wResp.data.cards?.length > 0) {
                setSelectedCardForWithdrawal(wResp.data.cards[0].id);
            }
        } catch (error) {
            console.error("Error fetching wallet:", error);
        } finally {
            setLoadingWallet(false);
        }
    };

    const handleCardInput = (e, field) => {
        let { value } = e.target;
        if (field === "cardNumber") {
            value = value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
        }
        if (field === "expiryDate") {
            value = value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5);
        }
        setCardForm({ ...cardForm, [field]: value });
    };

    const handleNumericInput = (e) => {
        if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const validateCardForm = () => {
        const errors = {};
        if (!cardForm.cardHolderName.trim()) errors.cardHolderName = "Card holder name is required.";
        const rawDigits = cardForm.cardNumber.replace(/\s/g, "");
        if (!rawDigits) errors.cardNumber = "Card number is required.";
        else if (rawDigits.length !== 16) errors.cardNumber = "Card number must be exactly 16 digits.";
        if (!cardForm.expiryDate) {
            errors.expiryDate = "Expiry date is required.";
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiryDate)) {
            errors.expiryDate = "Enter a valid expiry date (MM/YY).";
        } else {
            const [mm, yy] = cardForm.expiryDate.split("/").map(Number);
            const now = new Date();
            const expYear = 2000 + yy;
            const expMonth = mm;
            if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
                errors.expiryDate = "This card has expired.";
            }
        }
        if (!cardForm.cvv) errors.cvv = "CVV is required.";
        else if (!/^\d{3}$/.test(cardForm.cvv)) errors.cvv = "CVV must be exactly 3 digits.";
        setCardErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveCard = async (e) => {
        e.preventDefault();
        if (!validateCardForm()) return;
        try {
            const payload = { ...cardForm, ownerId: user.id };
            if (cardForm.id) {
                await API.put(`/api/v1/cards/${cardForm.id}`, payload);
            } else {
                await API.post(`/api/v1/cards`, payload);
            }
            alert("Bank card saved successfully!");
            setShowCardModal(false);
            setCardErrors({});
            setCardForm({ id: "", cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "" });
            fetchWallet();
        } catch (error) {
            alert("Failed to save card details.");
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Are you sure you want to delete this card?")) return;
        try {
            await API.delete(`/api/v1/cards/${cardId}`);
            alert("Card deleted successfully!");
            fetchWallet();
        } catch (error) {
            alert("Failed to delete card.");
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        try {
            const amt = parseFloat(withdrawAmount);
            if (amt <= 0) return alert("Please enter a valid amount.");
            if (!selectedCardForWithdrawal) return alert("Please select a card for withdrawal.");
            
            const response = await API.post(`/api/v1/wallet/${user.id}/withdraw`, { amount: amt, cardId: selectedCardForWithdrawal });
            if (response.data.success) {
                alert("Withdrawal successful!");
                setShowWithdrawModal(false);
                setWithdrawAmount("");
                fetchWallet();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Withdrawal failed.");
        }
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm("Are you sure you want to remove this record from your dashboard? This action cannot be undone.")) return;
        
        try {
            await API.delete(`/api/v1/invoices/${id}/owner`);
            setInvoices(prev => prev.filter(inv => (inv.id || inv.invoiceNo) !== id));
            alert("Record removed from your dashboard.");
        } catch (error) {
            console.error("Error deleting invoice:", error);
            alert(error.response?.data || "Failed to delete invoice.");
        }
    };

    const tenant = tenants.find((t) => t.id === tenantId);
    const rental = tenant ? tenant.rentalFee : 0;
    const elec = parseFloat(electricity) || 0;
    const wat = parseFloat(water) || 0;
    const extraTotal = extras.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const grandTotal = rental + elec + wat + extraTotal;

    const setExtra = (idx, key, val) => setExtras((ex) => ex.map((e, i) => (i === idx ? { ...e, [key]: val } : e)));
    const addExtra = () => setExtras((ex) => [...ex, { label: "", amount: "" }]);
    const removeExtra = (idx) => setExtras((ex) => ex.filter((_, i) => i !== idx));

    const handleDownloadPDF = async () => {
        if (!tenant || isDownloading) return;
        setIsDownloading(true);

        const billData = {
            invoiceNo: BILL_NO,
            tenantName: tenant.name,
            tenantId: tenant.id,
            ownerId: user.id,
            tenantEmail: tenant.email,
            unit: tenant.unit,
            dueDate: dueDate,
            items: [
                { description: "Monthly Rental Fee", amount: rental },
                ...(elec > 0 ? [{ description: "Electricity Bill", amount: elec }] : []),
                ...(wat > 0 ? [{ description: "Water Bill", amount: wat }] : []),
                ...extras.filter((e) => e.label && parseFloat(e.amount) > 0).map((e) => ({
                    description: e.label,
                    amount: parseFloat(e.amount),
                })),
            ],
            total: grandTotal,
            status: "PENDING"
        };

        try {
            const response = await fetch("http://localhost:8080/api/v1/invoices/generate-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(billData),
            });
            if (!response.ok) throw new Error("Failed to generate PDF");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Bill-${BILL_NO}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            alert("Bill generated and saved successfully!");
        } catch (error) {
            alert("Failed to download PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSendInvoice = async () => {
        if (!tenant || isSending) return;
        setIsSending(true);

        const billData = {
            invoiceNo: BILL_NO,
            tenantName: tenant.name,
            tenantId: tenant.id,
            ownerId: user.id,
            tenantEmail: tenant.email,
            unit: tenant.unit,
            dueDate: dueDate,
            items: [
                { description: "Monthly Rental Fee", amount: rental },
                ...(elec > 0 ? [{ description: "Electricity Bill", amount: elec }] : []),
                ...(wat > 0 ? [{ description: "Water Bill", amount: wat }] : []),
                ...extras.filter((e) => e.label && parseFloat(e.amount) > 0).map((e) => ({
                    description: e.label,
                    amount: parseFloat(e.amount),
                })),
            ],
            total: grandTotal,
        };

        try {
            await API.post("/api/v1/invoices/send", billData);
            alert("Bill sent to tenant successfully!");
            if (activeTab === "tracking") fetchInvoices();
        } catch (error) {
            alert("Failed to send bill.");
        } finally {
            setIsSending(false);
        }
    };

    const canGenerate = !!tenant;

    const getStatusStyle = (status) => {
        switch (status) {
            case "PAID": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "SENT": return "bg-blue-100 text-blue-700 border-blue-200";
            case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
            case "OVERDUE": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 font-sans selection:bg-emerald-100" style={{ "--color-primary": "#26C289" }}>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <motion.header 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4 }}
                    className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0 print:hidden"
                >
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0">
                        Finance & Payments
                    </h2>
                    <div className="flex items-center gap-3 ml-auto">
                        {user ? <UserDropdown user={user} onLogout={logout} /> : (
                            <div className="w-10 h-10 rounded-full border-2 border-primary bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${ownerProfile.avatar}')` }} />
                        )}
                    </div>
                </motion.header>

                <motion.div 
                    className="flex-1 overflow-y-auto p-5 lg:p-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-4 mb-8 border-b border-emerald-100 pb-4 print:hidden">
                        <button onClick={() => setActiveTab("tracking")} className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === "tracking" ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-emerald-50"}`}>
                            Tracking (Bills)
                        </button>
                         <button onClick={() => setActiveTab("generate")} className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === "generate" ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-emerald-50"}`}>
                            Generate Bill
                        </button>
                        <button onClick={() => setActiveTab("wallet")} className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === "wallet" ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-emerald-50"}`}>
                            My Wallet
                        </button>
                    </div>

                    {activeTab === "tracking" && (
                        <div className="space-y-6 print:hidden">
                            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden text-sm">
                                <div className="p-6 border-b border-emerald-100 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-slate-900">Generated Bills</h3>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-black uppercase tracking-widest animate-pulse">Live Updates Active</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-emerald-50 border-b border-emerald-100 text-emerald-800 font-bold uppercase tracking-wider text-xs">
                                                <th className="p-4">Bill ID</th>
                                                <th className="p-4">Tenant</th>
                                                <th className="p-4">Amount</th>
                                                <th className="p-4">Overdue Fee</th>
                                                <th className="p-4">Due Date</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingInvoices ? (
                                                <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-medium">Loading invoices...</td></tr>
                                            ) : invoices.length === 0 ? (
                                                <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-medium">No invoices found.</td></tr>
                                            ) : (
                                                invoices.map((inv) => (
                                                    <tr key={inv.id || inv.invoiceNo} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                                                        <td className="p-4 font-bold text-slate-900">{inv.invoiceNo}</td>
                                                        <td className="p-4 text-slate-600 font-semibold">{inv.tenantName}</td>
                                                        <td className="p-4 text-slate-600 font-semibold">{fmt(inv.total)}</td>
                                                        <td className="p-4 text-red-600 font-semibold">{inv.overdueFee > 0 ? fmt(inv.overdueFee) : "-"}</td>
                                                        <td className="p-4 text-slate-600 font-semibold">{inv.dueDate}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(inv.status)}`}>
                                                                {inv.status}
                                                            </span>
                                                        </td>
                                                         <td className="p-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button className="text-emerald-700 hover:text-emerald-900 font-bold text-xs bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                                                                    Details
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteInvoice(inv.id || inv.invoiceNo)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                                                    title="Remove record"
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
                        </div>
                    )}

                    {activeTab === "wallet" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Wallet Dashboard */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Balance Card */}
                                <div className="lg:col-span-2 bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
                                    <div className="relative z-10">
                                        <p className="text-emerald-300 text-sm font-bold uppercase tracking-widest mb-1">Total Balance</p>
                                        <h3 className="text-5xl font-black mb-10">{wallet ? fmt(wallet.balance) : "LKR 0.00"}</h3>
                                        
                                        <div className="flex gap-4">
                                            <button onClick={() => setShowWithdrawModal(true)} className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">payments</span>
                                                Withdraw Money
                                            </button>
                                            <button onClick={() => {
                                                setCardForm({ id: "", cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "" });
                                                setShowCardModal(true);
                                            }} className="bg-emerald-800 text-white border border-emerald-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">add_card</span>
                                                Add Bank Card
                                            </button>
                                        </div>
                                    </div>
                                    {/* Abstract background shapes */}
                                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-800 rounded-full blur-3xl opacity-50" />
                                    <div className="absolute -left-20 -top-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl opacity-30" />
                                </div>

                                {/* Linked Cards Display */}
                                <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-sm flex flex-col justify-between max-h-[350px] overflow-y-auto">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Linked Cards</span>
                                            <span className="material-symbols-outlined text-emerald-600 text-3xl">contactless</span>
                                        </div>
                                        {wallet?.cards && wallet.cards.length > 0 ? (
                                            <div className="space-y-4">
                                                {wallet.cards.map(card => (
                                                    <div key={card.id} className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between bg-slate-50 relative group">
                                                        <p className="text-lg font-mono font-bold tracking-[0.1em] text-slate-800 mb-2">
                                                            **** **** **** {card.cardNumber.slice(-4)}
                                                        </p>
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase text-slate-400">Card Holder</p>
                                                                <p className="font-bold text-slate-700 text-sm">{card.cardHolderName}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-bold uppercase text-slate-400">Expires</p>
                                                                <p className="font-bold text-slate-700 text-sm">{card.expiryDate}</p>
                                                            </div>
                                                        </div>
                                                        {/* Action Buttons */}
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-sm p-1 rounded-lg border border-slate-200">
                                                            <button onClick={() => { setCardForm(card); setShowCardModal(true); }} className="w-8 h-8 rounded-md text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors">
                                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                            </button>
                                                            <button onClick={() => handleDeleteCard(card.id)} className="w-8 h-8 rounded-md text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors">
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-6 text-center">
                                                <p className="text-sm text-slate-400 font-medium">No cards linked yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Transaction History */}
                            <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-emerald-50">
                                    <h3 className="font-bold text-slate-900">Recent Transactions</h3>
                                </div>
                                <div className="divide-y divide-emerald-50">
                                    {transactions.length === 0 ? (
                                        <div className="p-12 text-center text-slate-400 font-medium italic">No transactions yet</div>
                                    ) : transactions.map((t) => (
                                        <div key={t.id} className="p-6 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    <span className="material-symbols-outlined text-xl">
                                                        {t.type === 'DEPOSIT' ? 'arrow_downward' : 'arrow_upward'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{t.description}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{new Date(t.timestamp).toLocaleDateString()} · {new Date(t.timestamp).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                            <div className={`text-sm font-black ${t.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                {t.type === 'DEPOSIT' ? '+' : '-'} {fmt(t.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modals */}
                            {showCardModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                                        <h3 className="text-xl font-bold mb-6">{cardForm.id ? "Edit Bank Card" : "Link Bank Card"}</h3>
                                        <form onSubmit={handleSaveCard} noValidate className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Card Holder Name</label>
                                                <input
                                                    className={`w-full bg-[#f6f8f7] border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${cardErrors.cardHolderName ? "border-red-400 focus:border-red-400" : "border-emerald-100 focus:border-emerald-500 focus:bg-white"}`}
                                                    value={cardForm.cardHolderName}
                                                    onChange={e => { setCardForm({...cardForm, cardHolderName: e.target.value}); setCardErrors(prev => ({...prev, cardHolderName: ""})); }}
                                                    placeholder="JOHN DOE"
                                                />
                                                {cardErrors.cardHolderName && <p className="text-xs text-red-500 ml-1 mt-0.5">{cardErrors.cardHolderName}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Card Number</label>
                                                <input
                                                    className={`w-full bg-[#f6f8f7] border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${cardErrors.cardNumber ? "border-red-400 focus:border-red-400" : "border-emerald-100 focus:border-emerald-500 focus:bg-white"}`}
                                                    value={cardForm.cardNumber}
                                                    onChange={e => { handleCardInput(e, 'cardNumber'); setCardErrors(prev => ({...prev, cardNumber: ""})); }}
                                                    placeholder="xxxx xxxx xxxx xxxx"
                                                    maxLength="19"
                                                />
                                                {cardErrors.cardNumber && <p className="text-xs text-red-500 ml-1 mt-0.5">{cardErrors.cardNumber}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Expiry Date</label>
                                                    <input
                                                        className={`w-full bg-[#f6f8f7] border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${cardErrors.expiryDate ? "border-red-400 focus:border-red-400" : "border-emerald-100 focus:border-emerald-500 focus:bg-white"}`}
                                                        value={cardForm.expiryDate}
                                                        onChange={e => { handleCardInput(e, 'expiryDate'); setCardErrors(prev => ({...prev, expiryDate: ""})); }}
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                    />
                                                    {cardErrors.expiryDate && <p className="text-xs text-red-500 ml-1 mt-0.5">{cardErrors.expiryDate}</p>}
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">CVV</label>
                                                    <input
                                                        className={`w-full bg-[#f6f8f7] border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${cardErrors.cvv ? "border-red-400 focus:border-red-400" : "border-emerald-100 focus:border-emerald-500 focus:bg-white"}`}
                                                        placeholder="***"
                                                        type="password"
                                                        maxLength="3"
                                                        value={cardForm.cvv}
                                                        onChange={e => { const v = e.target.value.replace(/\D/g, ''); setCardForm({...cardForm, cvv: v}); setCardErrors(prev => ({...prev, cvv: ""})); }}
                                                    />
                                                    {cardErrors.cvv && <p className="text-xs text-red-500 ml-1 mt-0.5">{cardErrors.cvv}</p>}
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <button type="button" onClick={() => { setShowCardModal(false); setCardErrors({}); setCardForm({ id: "", cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "" }); }} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                                                <button type="submit" className="flex-1 bg-emerald-900 text-white px-6 py-3 rounded-xl font-bold">Save Card</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {showWithdrawModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                                        <h3 className="text-xl font-bold mb-2">Withdraw Money</h3>
                                        <p className="text-sm text-slate-500 mb-6">Available Money: {fmt(wallet?.balance)}</p>
                                        <form onSubmit={handleWithdraw} className="space-y-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Select Bank Card</label>
                                                <select
                                                    className={inputCls(false)}
                                                    value={selectedCardForWithdrawal || ""}
                                                    onChange={e => setSelectedCardForWithdrawal(e.target.value)}
                                                    required
                                                >                                                    <option value="" disabled>-- Choose linked card --</option>
                                                    {wallet?.cards?.map(card => {
                                                        const optValue = card.id || card.cardNumber;
                                                        return (
                                                            <option key={optValue} value={optValue}>
                                                                {card.cardHolderName} (****{card.cardNumber?.slice(-4)})
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Amount to Withdraw</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">LKR</span>
                                                    <input required type="number" min="0" step="0.01" onKeyDown={handleNumericInput} className={inputCls(false) + " pl-14 text-2xl"} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" />
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button type="button" onClick={() => setShowWithdrawModal(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                                                <button type="submit" className="flex-1 bg-emerald-900 text-white px-6 py-3 rounded-xl font-bold">Withdraw Now</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
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
                                        <h1 className="text-lg font-bold text-slate-900">New Bill</h1>
                                        <p className="text-xs text-slate-500 font-medium">{BILL_NO}</p>
                                    </div>
                                </div>

                                <Field label="Select Tenant" icon="person">
                                    <select className={inputCls(true) + " cursor-pointer"} value={tenantId} onChange={(e) => { setTenantId(e.target.value); setGenerated(false); }}>
                                        <option value="">{loadingTenants ? "Loading tenants..." : "— Choose a tenant —"}</option>
                                        {tenants.map((t) => (
                                            <option key={`${t.id}-${t.propertyId}`} value={t.id}>{t.unit} · {t.name}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Monthly Rental Fee (Default)" icon="home_work">
                                    <input className={inputCls(true) + " bg-emerald-50/50 text-emerald-700 cursor-not-allowed"} value={tenant ? fmt(rental) : "Select a tenant to see fee"} readOnly />
                                </Field>

                                <Field label="Electricity Bill" icon="bolt">
                                    <input type="number" min="0" step="0.01" onKeyDown={handleNumericInput} className={inputCls(true)} placeholder="0.00" value={electricity} onChange={(e) => setElectricity(e.target.value)} />
                                </Field>

                                <Field label="Water Bill" icon="water_drop">
                                    <input type="number" min="0" step="0.01" onKeyDown={handleNumericInput} className={inputCls(true)} placeholder="0.00" value={water} onChange={(e) => setWater(e.target.value)} />
                                </Field>

                                <Field label="Due Date" icon="calendar_today">
                                    <input type="date" min={localTodayString} className={inputCls(true)} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
                                                <input className="flex-1 bg-[#f6f8f7] border border-emerald-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-emerald-500 outline-none transition-all" placeholder="Description" value={ex.label} onChange={(e) => setExtra(idx, "label", e.target.value)} />
                                                <input type="number" min="0" step="0.01" onKeyDown={handleNumericInput} className="w-28 bg-[#f6f8f7] border border-emerald-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-emerald-500 outline-none transition-all" placeholder="Amount" value={ex.amount} onChange={(e) => setExtra(idx, "amount", e.target.value)} />
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

                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <button disabled={!canGenerate} onClick={() => setGenerated(true)} className="flex-1 bg-primary text-slate-900 py-3 rounded-xl font-bold text-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-base">preview</span>
                                            Preview Bill
                                        </button>
                                        <button disabled={!generated || isDownloading} onClick={handleDownloadPDF} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-base">{isDownloading ? "hourglass_bottom" : "download"}</span>
                                            {isDownloading ? "Generating..." : "Generate & Save"}
                                        </button>
                                    </div>
                                    <button disabled={!generated || isSending} onClick={handleSendInvoice} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-base">{isSending ? "hourglass_bottom" : "send"}</span>
                                        {isSending ? "Sending to Tenant..." : "Send to Tenant via Email"}
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
                                                <p className="text-2xl font-black text-white print:text-slate-900">BILL</p>
                                                <p className="text-emerald-200 text-xs mt-1 print:text-slate-500">{BILL_NO}</p>
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
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bill Date</p>
                                                    <p className="font-bold text-slate-700 text-sm">{today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 mb-1">Due Date</p>
                                                    <p className="font-bold text-emerald-600 text-sm print:text-slate-900">{dueDate}</p>
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
                                                <p className="text-xs font-medium leading-relaxed">Please make payment by the due date via bank transfer or through the RentEase portal. Contact manager for queries.</p>
                                            </div>
                                            <div className="pt-2 text-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated by RentEase · {today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border border-dashed border-emerald-200 shadow-sm p-12 text-center text-slate-500 font-medium print:hidden">
                                        Fill out the form to securely generate and review the professional billing document.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
