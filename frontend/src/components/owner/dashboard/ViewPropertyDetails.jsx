import { useNavigate, useParams, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserDropdown from "../../UserDropdown";
import { useAuth } from "../../../context/AuthContext";
import { ownerProfile } from "../../../data/ownerDashboardData";

export default function ViewPropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-[#f6f8f7]" style={{ "--color-primary": "#1DBC60" }}>
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* ── Top Bar ───────────────────────────────────── */}
                <header className="h-20 bg-white border-b border-emerald-100 flex items-center justify-between px-6 lg:px-8 shrink-0 gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <Link 
                            to="/owner/properties"
                            className="flex items-center gap-2 text-primary font-bold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors active:scale-95 duration-150 pl-12 lg:pl-3"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            <span className="text-sm uppercase tracking-wider font-label">Back to List</span>
                        </Link>
                        <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">Property Details</h2>
                    </div>
                    <div className="flex items-center gap-4">
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

                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    <div className="max-w-7xl mx-auto pl-12 lg:pl-0">
                        {/* Header Section (Bento Style) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Title Card */}
                            <div className="lg:col-span-2 bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-emerald-100 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-10 -mt-10 pointer-events-none"></div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">Active/Occupied</span>
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">ID: RE-40291</span>
                                    </div>
                                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">The Emerald Suite - Unit 402</h1>
                                    <p className="text-slate-500 flex items-start sm:items-center gap-2 text-sm sm:text-base">
                                        <span className="material-symbols-outlined text-primary text-[20px] shrink-0">location_on</span>
                                        422 Heritage Way, University District, North Wing, 90210
                                    </p>
                                </div>
                                <div className="mt-8 flex flex-wrap gap-3 relative z-10">
                                    <button 
                                        onClick={() => navigate(`/owner/properties/${id}/edit`)}
                                        className="bg-primary hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                        Edit Property
                                    </button>
                                    <button className="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all w-full sm:w-auto justify-center">
                                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                        Manage Bookings
                                    </button>
                                    <button className="sm:ml-auto text-red-600 font-bold text-sm px-4 py-3 hover:bg-red-50 rounded-lg transition-colors w-full sm:w-auto justify-center">
                                        Deactivate Listing
                                    </button>
                                </div>
                            </div>
                            
                            {/* Financial Snapshot */}
                            <div className="bg-slate-900 text-white rounded-xl p-6 lg:p-8 flex flex-col justify-center shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                                <div className="relative z-10">
                                    <p className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                                        Financial Terms
                                    </p>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1 font-medium">Monthly Rent</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-3xl font-black tracking-tight text-white">$1250</span>
                                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">USD</span>
                                            </div>
                                        </div>
                                        <div className="h-[1px] bg-slate-800"></div>
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1 font-medium">Security Deposit</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-2xl font-bold tracking-tight text-slate-200">$1800</span>
                                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">USD</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Main Details Col (Left) */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Description & Category */}
                                <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-emerald-100">
                                    <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">info</span>
                                        Property Information
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-[24px]">apartment</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Category</p>
                                                <p className="font-bold text-slate-900 text-sm">Luxury Apartment</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-[24px]">holiday_village</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Type</p>
                                                <p className="font-bold text-slate-900 text-sm">Multi-Unit Residential</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-slate-100">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Description</p>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            Experience elevated living in the heart of the University District. The Emerald Suite Unit 402 offers a refined architectural aesthetic with high ceilings, floor-to-ceiling windows overlooking the north wing, and designer finishes. This premium unit is optimized for graduate students or faculty members seeking a quiet, sophisticated sanctuary with all modern conveniences included.
                                        </p>
                                    </div>
                                </div>

                                {/* Amenities Bento */}
                                <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-emerald-100">
                                    <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">star</span>
                                        Premium Amenities
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {['wifi', 'ac_unit', 'chair', 'local_parking', 'countertops', 'local_laundry_service', 'water_drop', 'security'].map(icon => {
                                            const labels = {
                                                'wifi': 'WiFi',
                                                'ac_unit': 'A/C',
                                                'chair': 'Furnished',
                                                'local_parking': 'Parking',
                                                'countertops': 'Kitchen',
                                                'local_laundry_service': 'Laundry',
                                                'water_drop': 'Water',
                                                'security': '24/7 Security'
                                            };
                                            return (
                                                <div key={icon} className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 transition-colors border border-slate-100 hover:border-emerald-200">
                                                    <span className="material-symbols-outlined text-primary text-[28px]">{icon}</span>
                                                    <span className="text-xs font-bold text-slate-700">{labels[icon]}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Info Cards Col (Right) */}
                            <div className="space-y-6">
                                {/* Owner Profile Card */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-emerald-100">
                                    <div className="h-20 bg-slate-900 flex items-end px-6 pb-4 relative">
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(45deg, #1DBC60 0%, transparent 100%)" }}></div>
                                        <p className="text-primary text-[10px] font-bold tracking-widest uppercase relative z-10">Verified Owner</p>
                                    </div>
                                    <div className="px-6 pb-6 -mt-10 relative z-10">
                                        <img 
                                            alt="Sarah Jenkins" 
                                            className="w-20 h-20 rounded-2xl object-cover border-4 border-white mb-4 shadow-sm bg-white" 
                                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
                                        />
                                        <h3 className="text-lg font-bold text-slate-900">Sarah Jenkins</h3>
                                        <p className="text-xs text-slate-500 font-medium mb-6">Member since Jan 2021</p>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
                                                </div>
                                                <span className="text-sm text-slate-700 font-medium truncate">s.jenkins@rentez.com</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                                                </div>
                                                <span className="text-sm text-slate-700 font-medium">+1 (555) 902-1042</span>
                                            </div>
                                            
                                            <button className="w-full mt-4 py-3 rounded-lg border border-emerald-200 text-primary font-bold text-sm hover:bg-emerald-50 transition-colors active:scale-[0.98]">
                                                Contact Owner
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Location / Map Preview */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-emerald-100">
                                    <div className="p-6">
                                        <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">map</span>
                                            Map Location
                                        </p>
                                        <div className="rounded-lg overflow-hidden h-48 relative border border-slate-200">
                                            <img 
                                                alt="Location Map" 
                                                className="w-full h-full object-cover" 
                                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <div className="w-10 h-10 bg-primary/30 rounded-full flex items-center justify-center animate-pulse">
                                                    <div className="w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-slate-200"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-sm font-bold text-slate-900">422 Heritage Way</p>
                                            <p className="text-xs text-slate-500 mt-0.5">North Wing, University District</p>
                                            <button className="mt-4 flex items-center gap-1.5 text-primary text-xs font-bold hover:text-emerald-700 transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                Open in Google Maps
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
