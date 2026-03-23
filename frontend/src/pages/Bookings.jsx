import React, { useState } from "react";
import Sidebar from "../components/owner/dashboard/Sidebar";
import UserDropdown from "../components/UserDropdown";
import { useAuth } from "../context/AuthContext";
import { ownerProfile } from "../data/ownerDashboardData";
import { bookingsData } from "../data/bookingsData";
import BookingRequestCard from "../components/owner/bookings/BookingRequestCard";

export default function Bookings() {
    const [searchQuery, setSearchQuery] = useState("");
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("All");

    const tabs = ["All", "Pending", "Approved", "Rejected"];

    const filteredBookings = bookingsData.filter(booking => {
        if (activeTab === "All") return true;
        return booking.status === activeTab;
    });

    return (
        <div
            className="flex min-h-screen bg-[#f6f8f7]"
            style={{ "--color-primary": "#1DBC60" }}
        >
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0">
                {/* ── Header ────────────────────────────────────── */}
                <header className="sticky top-0 z-30 h-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight whitespace-nowrap pl-12 lg:pl-0">
                        Bookings
                    </h2>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Search */}
                        <div className="relative hidden sm:block w-52 lg:w-72">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                search
                            </span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8f7] border border-emerald-100 rounded-lg focus:ring-2 focus:ring-primary text-sm placeholder-slate-400 transition-all"
                                placeholder="Search requests..."
                                type="text"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-full hover:bg-emerald-50 transition-colors text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                        </button>

                        {/* Avatar / Dropdown */}
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

                {/* ── Dashboard Content ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5 lg:p-8">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Booking Requests</h2>
                            <p className="text-slate-500 mt-1">
                                You have <span className="font-semibold text-primary">12 pending</span> requests across your portfolio.
                            </p>
                        </div>
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                                        activeTab === tab
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-slate-500 hover:text-primary hover:bg-slate-50"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bento Layout / Card List */}
                    <div className="grid grid-cols-1 gap-6">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <BookingRequestCard key={booking.id} booking={booking} />
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                No booking requests found for this status.
                            </div>
                        )}
                    </div>

                    {/* Footer Pagination */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-800">1-{filteredBookings.length}</span> of 12 requests
                        </p>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-colors">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-bold bg-primary/5">1</button>
                            <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors">2</button>
                            <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors">3</button>
                            <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-colors">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

