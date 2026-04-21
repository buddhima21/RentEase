import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MaintenanceBadge from "../components/maintenance/MaintenanceBadge";
import MaintenanceSectionCard from "../components/maintenance/MaintenanceSectionCard";
import { formatMaintenanceDate, toLocalDateInputValue, toLocalDateKey, toLocalDateTimeInputValue } from "../constants/maintenance";
import {
    getAdminMaintenanceQueue,
    getMaintenanceTechnicians,
    scheduleMaintenance,
} from "../services/api";

export default function MaintenanceCalendar() {
    const [items, setItems] = useState([]);
    const [techs, setTechs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => toLocalDateInputValue());
    const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [selectedRequestId, setSelectedRequestId] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");
    const minScheduleTime = useMemo(() => toLocalDateTimeInputValue(new Date(Date.now() + 60 * 60 * 1000)), []);

    const load = async () => {
        setLoading(true);
        try {
            setLoadError("");
            const [queueRes, techRes] = await Promise.all([getAdminMaintenanceQueue(), getMaintenanceTechnicians()]);
            setItems(queueRes.data?.data || []);
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
        load();
    }, []);

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
        const now = new Date(selectedDate);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const days = [];
        for (let day = 1; day <= end.getDate(); day += 1) {
            const current = new Date(now.getFullYear(), now.getMonth(), day);
            days.push(toLocalDateInputValue(current));
        }
        return days;
    }, [selectedDate]);

    const saveSchedule = async () => {
        setError("");
        if (!selectedRequestId || !scheduledAt) {
            setError("Select a request and schedule time before saving.");
            return;
        }

        if (new Date(scheduledAt).getTime() < Date.now() + 60 * 60 * 1000) {
            setError("Scheduled time must be at least 1 hour in the future.");
            return;
        }

        try {
            await scheduleMaintenance(selectedRequestId, { scheduledAt, adminNotes: notes, technicianId: selectedTechnicianId || undefined });
            setSelectedRequestId("");
            setNotes("");
            setScheduledAt("");
            await load();
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to save this schedule.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 p-6 md:p-10">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Maintenance Calendar</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">Select a day, inspect the schedule, and place a new visit into the queue.</p>
                    </div>
                    <Link
                        to="/admin/maintenance"
                        className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                    >
                        Back to Maintenance Queue
                    </Link>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <MaintenanceSectionCard eyebrow="Calendar" title="Month view" description="Dates with scheduled visits are marked for quick scanning.">
                        <div className="grid grid-cols-7 gap-2">
                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => (
                                <div key={day} className="p-2 text-center text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{day}</div>
                            ))}
                            {visibleDays.map((day) => {
                                const hasSchedule = availableDays.has(day);
                                const active = day === selectedDate;
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => setSelectedDate(day)}
                                        className={`min-h-24 rounded-2xl border p-3 text-left transition-colors ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"}`}
                                    >
                                        <p className="text-sm font-bold">{new Date(`${day}T00:00:00`).getDate()}</p>
                                        <p className={`mt-2 text-xs ${active ? "text-slate-200" : "text-slate-500 dark:text-slate-400"}`}>{hasSchedule ? `${availableDays.get(day)} visit(s)` : "Open"}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </MaintenanceSectionCard>

                    <MaintenanceSectionCard eyebrow="Schedule" title={`Visits on ${selectedDate}`} description="Review the selected date and schedule a new visit if needed.">
                        {loadError ? <p className="mb-3 text-sm font-medium text-red-600">{loadError}</p> : null}
                        <div className="flex flex-wrap gap-2">
                            <select className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3" value={selectedRequestId} onChange={(e) => setSelectedRequestId(e.target.value)}>
                                <option value="">Select request</option>
                                {items.map((item) => (
                                    <option key={item.id} value={item.id}>{item.title}</option>
                                ))}
                            </select>
                            <select className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3" value={selectedTechnicianId} onChange={(e) => setSelectedTechnicianId(e.target.value)}>
                                <option value="">Select technician</option>
                                {techs.map((tech) => (
                                    <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                ))}
                            </select>
                            <input className="rounded-xl border border-slate-300 bg-white p-3" type="datetime-local" min={minScheduleTime} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                            <input className="rounded-xl border border-slate-300 bg-white p-3" placeholder="Admin note" maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
                            <button type="button" disabled={loading} className="rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60" onClick={saveSchedule}>
                                Schedule visit
                            </button>
                        </div>
                        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

                        <div className="mt-6 space-y-3">
                            {loading ? <p className="text-slate-500 dark:text-slate-400">Loading schedule...</p> : scheduled.map((item) => (
                                <div key={item.id} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{item.serviceType} • {formatMaintenanceDate(item.scheduledAt)}</p>
                                            <p className="text-sm text-slate-600">Technician: {item.technicianName || item.assignedTechnicianId || "Unassigned"}</p>
                                            {item.assignedTechnicianId ? (
                                                <p className="text-xs text-amber-700">
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
        </div>
    );
}
