import { useState, useEffect } from "react";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import AdminNotificationsBell from "../components/admin/dashboard/AdminNotificationsBell";
import AdminProfileDropdown from "../components/admin/dashboard/AdminProfileDropdown";
import { getAllBookingsForAdmin } from "../services/api";

const TABS = [
    { id: "active", label: "Active", statuses: ["ALLOCATED", "APPROVED"] },
    { id: "pending", label: "Pending", statuses: ["PENDING"] },
    { id: "completed", label: "Completed", statuses: ["COMPLETED"] },
    { id: "all", label: "All Records", statuses: [] }
];

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");
    const [error, setError] = useState(null);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        const storedAdmin = localStorage.getItem("adminUser");
        if (storedAdmin) {
            setAdminUser(JSON.parse(storedAdmin));
        }
    }, []);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                const tab = TABS.find(t => t.id === activeTab);
                const res = await getAllBookingsForAdmin(tab.statuses);
                if (res.data.success) {
                    setBookings(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
                setError("Failed to load records. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [activeTab]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "ALLOCATED": return "bg-blue-50 text-blue-700 border-blue-100";
            case "APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100";
            case "COMPLETED": return "bg-slate-50 text-slate-700 border-slate-100";
            case "REJECTED": return "bg-red-50 text-red-700 border-red-100";
            case "CANCELLED": return "bg-gray-50 text-gray-700 border-gray-100";
            default: return "bg-slate-50 text-slate-700 border-slate-100";
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans selection:bg-blue-100">
            {/* Sidebar */}
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-30 h-[88px] bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-white/50 px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-[22px] font-black tracking-tight text-slate-800">
                        Platform Bookings
                    </h2>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="bg-white border border-slate-100 p-2.5 rounded-full shadow-sm text-slate-400 hover:text-blue-600 cursor-pointer transition-colors relative">
                            <AdminNotificationsBell />
                        </div>
                        <div className="pl-4 flex">
                            {adminUser && <AdminProfileDropdown adminUser={adminUser} />}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    
                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                <span className="text-[10px] font-black tracking-widest uppercase text-blue-600">Live Management</span>
                            </div>
                            <h1 className="text-[32px] md:text-[40px] font-black tracking-tight text-slate-900 leading-[1.1]">
                                Booking Command
                            </h1>
                            <p className="text-slate-500 font-medium mt-2 text-[15px]">Monitor and audit every tenancy across the RentEase network.</p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm self-start md:self-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === tab.id
                                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                            <p className="text-slate-400 font-bold tracking-tight">Syncing with platform database...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 p-8 rounded-3xl flex items-center gap-5 text-red-600">
                            <span className="material-symbols-outlined text-4xl">error</span>
                            <div>
                                <h3 className="font-black text-lg">Data Retrieval Error</h3>
                                <p className="font-medium opacity-80">{error}</p>
                            </div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-20 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                                <span className="material-symbols-outlined text-5xl">inventory_2</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Empty Queue</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">No bookings match the selected filter. Try switching to a different tab or checking back later.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-50 bg-slate-50/30">
                                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Property Information</th>
                                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Tenant Profile</th>
                                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Duration</th>
                                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Financials</th>
                                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {bookings.map((booking) => (
                                            <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:scale-105 transition-transform duration-300">
                                                            {booking.propertyImageUrl ? (
                                                                <img src={booking.propertyImageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                                                                    <span className="material-symbols-outlined">home</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-[15px]">{booking.propertyTitle}</div>
                                                            <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-1">
                                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                                {booking.propertyCity}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <div className="font-black text-slate-800 text-[15px]">{booking.tenantName}</div>
                                                        <div className="text-xs text-slate-500 font-bold mt-1 group-hover:text-slate-700">{booking.tenantEmail}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            {new Date(booking.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm font-black text-slate-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                            {new Date(booking.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-slate-900 text-lg leading-tight">
                                                        LKR {booking.monthlyRent?.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-blue-600 mt-1 uppercase font-black tracking-widest">Monthly Rate</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all ${getStatusStyle(booking.status)}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
