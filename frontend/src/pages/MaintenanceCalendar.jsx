import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import AdminNotificationsBell from "../components/admin/dashboard/AdminNotificationsBell";
import AdminProfileDropdown from "../components/admin/dashboard/AdminProfileDropdown";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import { formatMaintenanceDate, toLocalDateInputValue, toLocalDateKey, toLocalDateTimeInputValue } from "../constants/maintenance";
import {
    getAdminMaintenanceQueue,
    getMaintenanceTechnicians,
} from "../services/api";

export default function MaintenanceCalendar() {
    const [items, setItems] = useState([]);
    const [techs, setTechs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => toLocalDateInputValue());
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [adminUser, setAdminUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            setLoadError("");
            const [queueRes, techRes] = await Promise.all([getAdminMaintenanceQueue(), getMaintenanceTechnicians()]);
            const filteredItems = (queueRes.data?.data || []).filter(item => 
                !["CANCELLED", "DECLINED"].includes(item.status)
            );
            setItems(filteredItems);
            setTechs(techRes.data?.data || []);
        } catch (err) {
            setItems([]);
            setTechs([]);
            setLoadError(err?.response?.data?.message || "Unable to load calendar data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        try {
            const token = localStorage.getItem("adminToken");
            const stored = localStorage.getItem("adminUser");
            if (token && stored) {
                const parsed = JSON.parse(stored);
                if (parsed.role === "ADMIN") {
                    setAdminUser(parsed);
                } else {
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminUser");
                }
            } else {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");
            }
        } catch {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading || !adminUser) return;
        load();
    }, [authLoading, adminUser]);

    const scheduled = useMemo(
        () => items
            .filter((x) => x.scheduledAt && toLocalDateKey(x.scheduledAt) === selectedDate)
            .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)),
        [items, selectedDate]
    );

    const availableDays = useMemo(() => {
        const days = new Map();
        items.forEach((item) => {
            if (!item.scheduledAt) return;
            const dayKey = toLocalDateKey(item.scheduledAt);
            days.set(dayKey, (days.get(dayKey) || 0) + 1);
        });
        return days;
    }, [items]);

    const visibleDays = useMemo(() => {
        const [year, month] = selectedDate.split("-").map(Number);
        const startDay = new Date(year, month - 1, 1).getDay();
        const end = new Date(year, month, 0).getDate();
        
        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        for (let day = 1; day <= end; day += 1) {
            const current = new Date(year, month - 1, day);
            days.push(toLocalDateInputValue(current));
        }
        return days;
    }, [selectedDate]);

    const handlePrevMonth = () => {
        const [year, month] = selectedDate.split("-").map(Number);
        const prev = new Date(year, month - 2, 1);
        setSelectedDate(toLocalDateInputValue(prev));
    };

    const handleNextMonth = () => {
        const [year, month] = selectedDate.split("-").map(Number);
        const next = new Date(year, month, 1);
        setSelectedDate(toLocalDateInputValue(next));
    };

    const currentMonthLabel = useMemo(() => {
        const [year, month] = selectedDate.split("-").map(Number);
        return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }, [selectedDate]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            </div>
        );
    }

    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans selection:bg-blue-100">
            <AdminSidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-[88px] bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-white/50 px-8 flex items-center justify-between gap-4 shrink-0">
                    <h2 className="text-[22px] font-black tracking-tight whitespace-nowrap pl-12 lg:pl-0 text-slate-800 dark:text-slate-100">
                        Maintenance Control Center
                    </h2>
                    <div className="flex items-center gap-4 ml-auto">
                        <AdminNotificationsBell />
                        <div className="pl-2 flex">
                            <AdminProfileDropdown adminUser={adminUser} />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black tracking-widest uppercase">Calendar</span>
                            </div>
                            <h1 className="text-[32px] md:text-[40px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">Maintenance Calendar</h1>
                            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-[15px]">Select a day, inspect the schedule, and place a new visit into the queue.</p>
                        </div>
                        <Link
                            to="/admin/maintenance"
                            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-300 hover:text-emerald-700 shadow-sm"
                        >
                            Back to Maintenance Queue
                        </Link>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <MaintenanceSectionCard 
                        eyebrow="Calendar" 
                        title={currentMonthLabel} 
                        description="Dates with scheduled visits are marked for quick scanning."
                        action={
                            <div className="flex gap-2">
                                <button type="button" onClick={handlePrevMonth} className="px-3 py-1 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    Prev
                                </button>
                                <button type="button" onClick={handleNextMonth} className="px-3 py-1 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    Next
                                </button>
                            </div>
                        }
                    >
                        <div className="grid grid-cols-7 gap-2">
                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => (
                                <div key={day} className="p-2 text-center text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{day}</div>
                            ))}
                            {visibleDays.map((day, idx) => {
                                if (!day) {
                                    return <div key={`empty-${idx}`} className="min-h-24 p-3 border border-transparent" />;
                                }
                                const hasSchedule = availableDays.has(day);
                                const active = day === selectedDate;
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => setSelectedDate(day)}
                                        className={`min-h-24 rounded-2xl border p-3 text-left transition-colors ${active ? "border-slate-900 bg-slate-900 text-white dark:border-emerald-500 dark:bg-emerald-900" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"}`}
                                    >
                                        <p className="text-sm font-bold">{new Date(`${day}T00:00:00`).getDate()}</p>
                                        <p className={`mt-2 text-xs font-semibold ${active ? "text-emerald-400" : hasSchedule ? "text-emerald-600" : "text-slate-400 dark:text-slate-500"}`}>{hasSchedule ? `${availableDays.get(day)} visit(s)` : "Open"}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard eyebrow="Schedule" title={`Visits on ${selectedDate}`} description="Review the maintenance visits scheduled for this date.">
                        {loadError ? <p className="mb-3 text-sm font-medium text-red-600">{loadError}</p> : null}

                        <div className="mt-2 space-y-3">
                            {loading ? <p className="text-slate-500 dark:text-slate-400">Loading schedule...</p> : scheduled.length === 0 ? <p className="text-slate-500 dark:text-slate-400">No visits scheduled for this date.</p> : scheduled.map((item) => (
                                <div key={item.id} className={`rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 transition-all ${["RESOLVED", "CLOSED"].includes(item.status) ? "opacity-60" : ""}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{item.serviceType} • {formatMaintenanceDate(item.scheduledAt)}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">Technician: {item.technicianName || item.assignedTechnicianId || "Unassigned"}</p>
                                            {item.assignedTechnicianId ? (
                                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                                    Same-day load: {scheduled.filter((entry) => entry.assignedTechnicianId === item.assignedTechnicianId).length} visit(s)
                                                </p>
                                            ) : null}
                                        </div>
                                        <MaintenanceBadge value={item.status} />
                                    </div>
                                </div>
                            ))}
                            {!loading && scheduled.length === 0 && <p className="text-slate-500 dark:text-slate-400">No scheduled visits yet for this date.</p>}
                        </div>
                    </MaintenanceSectionCard>
                </div>
            </div>
        </main>
    </div>
);
}
