import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function TenantWallet() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [showCardModal, setShowCardModal] = useState(false);
    const [cardForm, setCardForm] = useState({ id: "", cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "" });
    const [cardErrors, setCardErrors] = useState({});

    useEffect(() => {
        if (!user?.id) {
            navigate("/login");
            return;
        }
        fetchCards();
    }, [user?.id, navigate]);

    const fetchCards = async () => {
        if (!user?.id) return;
        try {
            const resp = await API.get(`/api/v1/cards/${user.id}`);
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
            if (cardForm.id) await API.put(`/api/v1/cards/${cardForm.id}`, payload);
            else await API.post(`/api/v1/cards`, payload);
            alert("Card saved successfully!");
            setShowCardModal(false);
            setCardErrors({});
            setCardForm({ id: "", cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "" });
            fetchCards();
        } catch (error) {
            alert("Failed to save card.");
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Are you sure you want to delete this card?")) return;
        try {
            await API.delete(`/api/v1/cards/${cardId}`);
            alert("Card deleted successfully!");
            fetchCards();
        } catch (error) {
            alert("Failed to delete card.");
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-emerald-100">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">My Saved Cards</h3>
                    <button
                        onClick={() => { setCardForm({ id: "", cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "" }); setShowCardModal(true); }}
                        className="bg-primary text-slate-900 dark:text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_card</span>
                        Add New Card
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cards.length === 0 ? (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">No bank cards saved yet.</p>
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
                                        <button onClick={() => { setCardForm(card); setShowCardModal(true); }} className="bg-white/20 hover:bg-white dark:bg-slate-900 text-white hover:text-slate-900 dark:text-white p-2 rounded-lg backdrop-blur-md transition-all">
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

            {/* Add/Edit Card Modal */}
            {showCardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-6">{cardForm.id ? "Edit Bank Card" : "Add Bank Card"}</h3>
                        <form onSubmit={handleSaveCard} noValidate className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Card Holder Name</label>
                                <input
                                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-xl px-4 py-3 text-sm font-medium focus:bg-white dark:bg-slate-900 transition-colors outline-none ${cardErrors.cardHolderName ? "border-red-400 focus:border-red-400" : "border-slate-200 dark:border-slate-700 focus:border-primary"}`}
                                    value={cardForm.cardHolderName}
                                    onChange={e => { setCardForm({ ...cardForm, cardHolderName: e.target.value }); setCardErrors(prev => ({ ...prev, cardHolderName: "" })); }}
                                    placeholder="JOHN DOE"
                                />
                                {cardErrors.cardHolderName && <p className="text-xs text-red-500 ml-1 mt-0.5">{cardErrors.cardHolderName}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Card Number</label>
                                <input
                                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-xl px-4 py-3 text-sm font-medium focus:bg-white dark:bg-slate-900 transition-colors outline-none ${cardErrors.cardNumber ? "border-red-400 focus:border-red-400" : "border-slate-200 dark:border-slate-700 focus:border-primary"}`}
                                    value={cardForm.cardNumber}
                                    onChange={e => { handleCardInput(e, 'cardNumber'); setCardErrors(prev => ({ ...prev, cardNumber: "" })); }}
                                    placeholder="xxxx xxxx xxxx xxxx"
                                    maxLength="19"
                                />
                                {cardErrors.cardNumber && <p className="text-xs text-red-500 ml-1 mt-0.5">{cardErrors.cardNumber}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Expiry Date</label>
                                    <input
                                        className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-xl px-4 py-3 text-sm font-medium focus:bg-white dark:bg-slate-900 transition-colors outline-none ${cardErrors.expiryDate ? "border-red-400 focus:border-red-400" : "border-slate-200 dark:border-slate-700 focus:border-primary"}`}
                                        value={cardForm.expiryDate}
                                        onChange={e => { handleCardInput(e, 'expiryDate'); setCardErrors(prev => ({ ...prev, expiryDate: "" })); }}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                    />
                                    {cardErrors.expiryDate && <p className="text-xs text-red-500 ml-1 mt-0.5">{cardErrors.expiryDate}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-1">CVV</label>
                                    <input
                                        className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-xl px-4 py-3 text-sm font-medium focus:bg-white dark:bg-slate-900 transition-colors outline-none ${cardErrors.cvv ? "border-red-400 focus:border-red-400" : "border-slate-200 dark:border-slate-700 focus:border-primary"}`}
                                        placeholder="***"
                                        type="password"
                                        maxLength="3"
                                        value={cardForm.cvv}
                                        onChange={e => { const v = e.target.value.replace(/\D/g, ''); setCardForm({ ...cardForm, cvv: v }); setCardErrors(prev => ({ ...prev, cvv: "" })); }}
                                    />
                                    {cardErrors.cvv && <p className="text-xs text-red-500 ml-1 mt-0.5">{cardErrors.cvv}</p>}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setShowCardModal(false); setCardErrors({}); setCardForm({ id: "", cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "" }); }} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary text-slate-900 dark:text-white px-6 py-3 rounded-xl font-bold">Save Card</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
