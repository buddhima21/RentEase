import { useState } from "react";

const BRAND_COLORS = { Visa: "#0055a6", Mastercard: "#eb001b", Amex: "#007bc1" };

const INITIAL_CARDS = [
  { id: "c1", brand: "Visa", last4: "4242", expiry: "08/27" },
  { id: "c2", brand: "Mastercard", last4: "5555", expiry: "11/26" },
];

function CardTile({ card, selected, onSelect }) {
  return (
    <div
      className={`flex items-center justify-between p-4 mb-3 border-2 rounded-2xl cursor-pointer transition-all ${selected ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200 bg-white"
        }`}
      onClick={() => onSelect(card.id)}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-24 h-16 rounded-xl flex items-center justify-center text-[18px] font-black text-white shadow-md"
          style={{ background: BRAND_COLORS[card.brand] || "#64748b" }}
        >
          {card.brand.toUpperCase()}
        </div>
        <div>
          <div className="text-2xl font-black text-slate-800 tracking-[0.15em]">•••• •••• •••• {card.last4}</div>
          <div className="text-xl text-slate-500 font-bold mt-1">Expires {card.expiry}</div>
        </div>
      </div>
      <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${selected ? "border-primary bg-primary scale-110 shadow-lg shadow-primary/20" : "border-slate-300"
        }`}>
        {selected && <div className="w-4 h-4 rounded-full bg-white" />}
      </div>
    </div>
  );
}

export default function RentPayment() {
  const [method, setMethod] = useState("card");
  const [savedCards, setSavedCards] = useState(INITIAL_CARDS);
  const [selectedCard, setSelectedCard] = useState("c1");
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ name: "", card: "", expiry: "", cvv: "" });
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleForm = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleNewCard = (e) => {
    let { name, value } = e.target;
    if (name === "card") value = value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
    if (name === "expiry") value = value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5);
    if (name === "cvv") value = value.replace(/\D/g, "").slice(0, 3);
    setNewCard(f => ({ ...f, [name]: value }));
  };

  const newCardValid = newCard.name && newCard.card.length === 19 && newCard.expiry.length === 5 && newCard.cvv.length === 3;

  const addCard = () => {
    if (!newCardValid) return;
    const id = "c" + Date.now();
    const brands = Object.keys(BRAND_COLORS);
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const last4 = newCard.card.replace(/\s/g, "").slice(-4);
    setSavedCards(c => [...c, { id, brand, last4, expiry: newCard.expiry }]);
    setSelectedCard(id);
    setNewCard({ name: "", card: "", expiry: "", cvv: "" });
    setShowAddCard(false);
  };

  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1800);
  };

  const valid = form.name && form.email && (method !== "card" || selectedCard);

  return (
    <div className="w-full bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
      {/* Amount Summary - Fixed Header */}
      <div className="bg-primary/5 p-8 lg:p-12 border-b border-primary/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <p className="text-base font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">Total Amount Due</p>
          <div className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">$2,450.00</div>
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-sm font-bold uppercase text-slate-400 mb-1 tracking-widest">Due Date</p>
          <p className="text-lg lg:text-xl font-black text-primary">March 05, 2026</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 lg:p-12">
          {/* Header section inside modal */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">Rent Payment Portal</h1>
            <p className="text-lg lg:text-xl text-slate-500">Unit 4B · Meridian Residences · Premium Resident Portfolio</p>
          </div>

          {/* Payment Method Tabs */}
          <div className="mb-12 font-display">
            <label className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 block">Choose Payment Method</label>
            <div className="flex gap-6">
              {[["card", "credit_card", "Debit / Credit Card"], ["bank", "account_balance", "Direct Bank Transfer"]].map(([id, icon, label]) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={`flex-1 flex items-center justify-center gap-4 py-6 lg:py-8 rounded-[2rem] transition-all font-black text-lg lg:text-xl ${method === id ? "bg-primary text-white shadow-[0_20px_50px_rgba(13,148,136,0.3)] scale-[1.02]" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-2 border-transparent"
                    }`}
                >
                  <span className="material-symbols-outlined text-3xl lg:text-4xl">{icon}</span>
                  <span className="">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <label className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block ml-1">Resident Full Name</label>
              <input
                className="w-full bg-slate-50 border-4 border-slate-50 rounded-[1.5rem] px-8 py-5 lg:py-6 text-lg lg:text-xl focus:border-primary focus:bg-white outline-none transition-all shadow-inner font-medium"
                name="name" placeholder="John Doe" value={form.name} onChange={handleForm}
              />
            </div>
            <div>
              <label className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block ml-1">Official Email Address</label>
              <input
                className="w-full bg-slate-50 border-4 border-slate-50 rounded-[1.5rem] px-8 py-5 lg:py-6 text-lg lg:text-xl focus:border-primary focus:bg-white outline-none transition-all shadow-inner font-medium"
                name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleForm}
              />
            </div>
          </div>

          {method === "card" && (
            <div className="mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block ml-1">Select A Card</label>
              {savedCards.map(card => (
                <CardTile key={card.id} card={card} selected={selectedCard === card.id} onSelect={setSelectedCard} />
              ))}

              {!showAddCard ? (
                <button
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold uppercase hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2"
                  onClick={() => setShowAddCard(true)}
                >
                  <span className="material-symbols-outlined">add</span> Add New Payment Method
                </button>
              ) : (
                <div className="mt-8 p-12 bg-slate-50 rounded-[3rem] border-2 border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-2xl font-black uppercase text-slate-900 tracking-widest">Add New Secure Card</span>
                    <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowAddCard(false)}>
                      <span className="material-symbols-outlined text-4xl">close</span>
                    </button>
                  </div>
                  <div className="space-y-8">
                    <input className="w-full bg-white border-4 border-slate-100 rounded-2xl px-8 py-6 text-2xl font-medium focus:border-primary outline-none shadow-sm" name="name" placeholder="Name on card" value={newCard.name} onChange={handleNewCard} />
                    <input className="w-full bg-white border-4 border-slate-100 rounded-2xl px-8 py-6 text-2xl font-medium focus:border-primary outline-none shadow-sm" name="card" placeholder="Card Number" value={newCard.card} onChange={handleNewCard} />
                    <div className="grid grid-cols-2 gap-8">
                      <input className="bg-white border-4 border-slate-100 rounded-2xl px-8 py-6 text-2xl font-medium focus:border-primary outline-none shadow-sm" name="expiry" placeholder="MM/YY" value={newCard.expiry} onChange={handleNewCard} />
                      <input className="bg-white border-4 border-slate-100 rounded-2xl px-8 py-6 text-2xl font-medium focus:border-primary outline-none shadow-sm" name="cvv" placeholder="CVV" value={newCard.cvv} onChange={handleNewCard} />
                    </div>
                    <button className="w-full bg-primary text-white py-8 rounded-2xl font-black text-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50" onClick={addCard} disabled={!newCardValid}>
                      Save & Confirm Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {method === "bank" && (
            <div className="mb-14">
              <label className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block ml-1">Routing + Account Number</label>
              <input className="w-full bg-slate-50 border-4 border-slate-50 rounded-[1.5rem] px-8 py-8 text-3xl font-black tracking-widest focus:border-primary focus:bg-white outline-none shadow-inner" name="bank" placeholder="000000000 000000000" />
              <p className="mt-4 text-sm text-slate-400 italic px-2 font-medium tracking-wide">Processing may take 3-5 business days for bank transfers.</p>
            </div>
          )}

          <button
            className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3 mt-4"
            onClick={submit} disabled={!valid || loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-lg">lock</span>
            )}
            {loading ? "Processing..." : "Securely Pay $2,450.00"}
          </button>
        </div>

        {!success && (
          <div className="bg-slate-50 py-4 text-center border-t border-emerald-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">verified</span> PCI DSS Compliant &middot; 256-bit SSL
            </span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-50 p-8 border-t-2 border-emerald-200 text-center">
            <div className="w-16 h-16 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl font-bold">check</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Sent!</h2>
            <p className="text-slate-600 mb-6 max-w-sm mx-auto">
              $2,450.00 has been successfully paid for Unit 4B. A receipt has been sent to <span className="text-slate-900 font-bold">{form.email}</span>.
            </p>
            <button
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
              onClick={() => { setSuccess(false); setForm({ name: "", email: "" }); }}
            >
              Pay Another Bill
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
