import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserDropdown from "../../UserDropdown";
import { useAuth } from "../../../context/AuthContext";
import { ownerProfile } from "../../../data/ownerDashboardData";

export default function UpdateProperty() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Form state initialized with mock data
    const [formData, setFormData] = useState({
        title: "The Emerald Suite - Unit 402",
        category: "Luxury Apartment",
        description: "Spacious, light-filled luxury apartment featuring modern finishes, floor-to-ceiling windows, and a private balcony. Fully furnished with high-end appliances, perfect for students seeking a quiet but connected living space.",
        rent: 1250,
        deposit: 1800,
        amenities: {
            wifi: true,
            ac: true,
            furnished: true,
            parking: false,
            kitchen: true,
            laundry: false,
            water: true
        }
    });

    const handleSave = () => {
        // Mock save logic, then redirect
        console.log("Saving property updates:", formData);
        navigate("/owner/properties");
    };

    const handleCancel = () => {
        navigate("/owner/properties");
    };

    return (
        <div className="flex min-h-screen bg-[#f6f8f7]" style={{ "--color-primary": "#1DBC60" }}>
            {/* ── Sidebar ─────────────────────────────────────── */}
            <Sidebar />

            {/* ── Main Content ────────────────────────────────── */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* ── Top Bar ───────────────────────────────────── */}
                <header className="h-20 bg-white border-b border-emerald-100 px-6 lg:px-8 flex items-center justify-between shrink-0 gap-4">
                    <div className="flex items-center gap-6 flex-1 max-w-2xl">
                        <h2 className="text-xl font-bold whitespace-nowrap pl-12 lg:pl-0">Update Property</h2>
                    </div>
                    <div className="flex items-center gap-4 ml-4 lg:ml-8">
                        <button className="p-2 text-slate-500 hover:bg-emerald-50 rounded-full transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        {user ? (
                            <UserDropdown user={user} onLogout={logout} />
                        ) : (
                            <div
                                className="w-10 h-10 rounded-full border-2 border-primary bg-cover bg-center shrink-0"
                                style={{ backgroundImage: `url('${ownerProfile.avatar}')` }}
                            />
                        )}
                    </div>
                </header>

                {/* ── Page Content ──────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    {/* Header Section */}
                    <header className="mb-8 pl-12 lg:pl-0">
                        <Link to="/owner/properties" className="inline-flex items-center gap-2 text-primary hover:text-emerald-700 font-bold mb-4 transition-colors">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            <span className="text-xs uppercase tracking-[0.15em] font-[Inter]">Back to Property List</span>
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Update Property</h1>
                        <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">Modify listing details for your property. Note that core structural identifiers are locked to ensure lease integrity.</p>
                    </header>

                    {/* Bento Layout Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-6xl pl-12 lg:pl-0">
                        {/* LEFT COLUMN: Editable Fields */}
                        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                            {/* Section 1: Basic Information */}
                            <section className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-emerald-100 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-primary bg-emerald-50 p-2 rounded-lg">edit_note</span>
                                    <h3 className="text-lg font-bold text-slate-900">Basic Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Property Title</label>
                                        <input 
                                            name="title"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 font-medium" 
                                            type="text" 
                                            value={formData.title} 
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Property Category</label>
                                        <select 
                                            name="category"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 font-medium appearance-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option>Premium Studio</option>
                                            <option>Luxury Apartment</option>
                                            <option>Shared Student Housing</option>
                                            <option>Penthouse Suite</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Property Description</label>
                                    <textarea 
                                        name="description"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 font-medium resize-none min-h-[120px]" 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>
                            </section>

                            {/* Section 2: Financial Terms */}
                            <section className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-emerald-100 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-primary bg-emerald-50 p-2 rounded-lg">payments</span>
                                    <h3 className="text-lg font-bold text-slate-900">Financial Terms</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2 relative">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Rent</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                            <input 
                                                name="rent"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 font-bold font-mono text-base" 
                                                type="number" 
                                                value={formData.rent} 
                                                onChange={(e) => setFormData({...formData, rent: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 relative">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Security Deposit</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                            <input 
                                                name="deposit"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 font-bold font-mono text-base" 
                                                type="number" 
                                                value={formData.deposit} 
                                                onChange={(e) => setFormData({...formData, deposit: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Amenities */}
                            <section className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-emerald-100 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-primary bg-emerald-50 p-2 rounded-lg">check_circle</span>
                                    <h3 className="text-lg font-bold text-slate-900">Amenities</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(formData.amenities).map(([key, value]) => (
                                        <label key={key} className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                checked={value} 
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    amenities: { ...formData.amenities, [key]: e.target.checked }
                                                })}
                                                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer" 
                                                type="checkbox"
                                            />
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-primary transition-colors capitalize">
                                                {key === 'ac' ? 'A/C' : key}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 pb-12 lg:pb-0">
                                <button 
                                    onClick={handleSave}
                                    className="w-full sm:w-auto px-10 py-3.5 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-emerald-600 hover:shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Save Changes
                                </button>
                                <button 
                                    onClick={handleCancel}
                                    className="w-full sm:w-auto px-10 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: View-Only Info & Security */}
                        <div className="lg:col-span-4 space-y-6 lg:space-y-8">
                            {/* Immutable Fields Card */}
                            <section className="bg-slate-900 text-white p-6 lg:p-8 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] pt-0.5">Locked Fields</span>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2">Address</label>
                                        <p className="text-base lg:text-lg font-bold leading-snug">422 Heritage Way, University District, North Wing, 90210</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2">Property Type</label>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400">apartment</span>
                                            <p className="text-base font-bold">Multi-Unit Residential</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/10">
                                        <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                                            <span className="material-symbols-outlined text-emerald-400 shrink-0 text-lg mt-0.5">info</span>
                                            <p className="text-[11px] leading-relaxed text-slate-300 italic">
                                                For security and lease compliance, the registered address and property classification cannot be modified online. Please contact our support team if a clerical error requires correction.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Help Card */}
                            <section className="bg-emerald-50/80 p-6 lg:p-8 rounded-xl border border-emerald-100">
                                <h4 className="font-bold text-emerald-900 mb-3 text-lg">Need Assistance?</h4>
                                <p className="text-sm text-emerald-800/80 leading-relaxed mb-6 font-medium">
                                    Updating your financial terms will notify all prospective applicants currently watching this property.
                                </p>
                                <button className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm hover:text-emerald-900 group transition-colors">
                                    Contact Support Agent
                                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </section>

                            {/* Map Thumbnail (View Only) */}
                            <div className="rounded-xl overflow-hidden shadow-sm h-48 relative border border-slate-200">
                                <img 
                                    alt="Property Location Map" 
                                    className="w-full h-full object-cover" 
                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5 shadow-sm">
                                        <span className="material-symbols-outlined text-sm text-primary">location_on</span> 
                                        Fixed Location
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
