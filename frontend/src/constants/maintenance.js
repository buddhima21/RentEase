export const MAINTENANCE_SERVICES = [
    {
        key: "ELECTRICAL",
        label: "Electrical",
        description: "Power outages, faulty wiring, switches, outlets, and lighting issues.",
        commonIssues: ["Power tripping", "Dead sockets", "Light fixtures"],
        averageRepairTime: "2-6 hours",
        costRange: "LKR 3,000 - 12,000",
    },
    {
        key: "PLUMBING",
        label: "Plumbing",
        description: "Leaks, blocked drains, water pressure problems, and fixture repairs.",
        commonIssues: ["Pipe leaks", "Clogged drains", "Tap failures"],
        averageRepairTime: "2-8 hours",
        costRange: "LKR 2,500 - 15,000",
    },
    {
        key: "HVAC",
        label: "HVAC",
        description: "Air conditioning, ventilation, filtration, and temperature control issues.",
        commonIssues: ["Weak cooling", "Filter replacement", "Thermostat faults"],
        averageRepairTime: "4-24 hours",
        costRange: "LKR 5,000 - 20,000",
    },
    {
        key: "APPLIANCE",
        label: "Appliance",
        description: "Washing machines, refrigerators, ovens, and other household appliances.",
        commonIssues: ["Motor failure", "Door seal issues", "Error codes"],
        averageRepairTime: "4-12 hours",
        costRange: "LKR 4,000 - 18,000",
    },
    {
        key: "PAINTING",
        label: "Painting",
        description: "Touch-ups, patch repairs, wall finishing, and repainting jobs.",
        commonIssues: ["Peeling walls", "Water stains", "Scratch marks"],
        averageRepairTime: "1-2 days",
        costRange: "LKR 6,000 - 25,000",
    },
    {
        key: "HANDYMAN",
        label: "General Handyman",
        description: "Small repairs, fittings, assembly, and general maintenance work.",
        commonIssues: ["Loose fittings", "Door issues", "Minor fixture repairs"],
        averageRepairTime: "1-4 hours",
        costRange: "LKR 2,000 - 8,000",
    },
];

export const MAINTENANCE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];
export const MAX_MAINTENANCE_IMAGES = 5;

export const MAINTENANCE_STATUSES = ["REPORTED", "ASSIGNED", "SCHEDULED", "DECLINED", "IN_PROGRESS", "PAUSED", "RESOLVED", "CANCELLED", "CLOSED"];

/**
 * Linear forward-progression steps for the visual tracker stepper.
 * DECLINED, CANCELLED, PAUSED are intentionally excluded — they are
 * terminal or branch states handled separately.
 */
export const MAINTENANCE_STEPS = [
    {
        key: "REPORTED",
        label: "Submitted",
        icon: "assignment",
        description: "Your request has been received and is in the admin queue.",
    },
    {
        key: "ASSIGNED",
        label: "Assigned",
        icon: "person_add",
        description: "A technician has been assigned and will be in touch soon.",
    },
    {
        key: "SCHEDULED",
        label: "Scheduled",
        icon: "calendar_month",
        description: "A visit time has been confirmed. Check the dispatch details below.",
    },
    {
        key: "IN_PROGRESS",
        label: "In Progress",
        icon: "construction",
        description: "Your technician is actively working on the issue.",
    },
    {
        key: "RESOLVED",
        label: "Resolved",
        icon: "check_circle",
        description: "Work is complete. The request will be formally closed shortly.",
    },
    {
        key: "CLOSED",
        label: "Closed",
        icon: "lock",
        description: "This request has been fully closed and archived.",
    },
];

/** Terminal / branch states that break the linear stepper flow. */
export const MAINTENANCE_TERMINAL_STATES = {
    DECLINED:  { label: "Declined",   icon: "cancel",        color: "red",    description: "This request was declined by the admin. Check the admin notes for details." },
    CANCELLED: { label: "Cancelled",  icon: "do_not_disturb", color: "slate",  description: "This request was cancelled." },
    PAUSED:    { label: "Paused",     icon: "pause_circle",  color: "amber",  description: "Work has been paused. It will resume once the issue is resolved." },
};

/** @deprecated Use MAINTENANCE_STEPS instead */
export const MAINTENANCE_TIMELINE = [
    { key: "REPORTED", label: "Submitted" },
    { key: "ASSIGNED", label: "Assigned" },
    { key: "SCHEDULED", label: "Scheduled" },
    { key: "DECLINED", label: "Declined" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "PAUSED", label: "Paused" },
    { key: "RESOLVED", label: "Resolved" },
    { key: "CANCELLED", label: "Cancelled" },
    { key: "CLOSED", label: "Closed" },
];


export const MAINTENANCE_PRIORITY_META = {
    LOW: { label: "Low", tone: "slate" },
    MEDIUM: { label: "Medium", tone: "blue" },
    HIGH: { label: "High", tone: "amber" },
    EMERGENCY: { label: "Emergency", tone: "red" },
};

export const MAINTENANCE_STATUS_META = {
    REPORTED: { label: "Reported", tone: "slate" },
    ASSIGNED: { label: "Assigned", tone: "blue" },
    SCHEDULED: { label: "Scheduled", tone: "blue" },
    DECLINED: { label: "Declined", tone: "slate" },
    IN_PROGRESS: { label: "In Progress", tone: "amber" },
    PAUSED: { label: "Paused", tone: "slate" },
    RESOLVED: { label: "Resolved", tone: "emerald" },
    CANCELLED: { label: "Cancelled", tone: "slate" },
    CLOSED: { label: "Closed", tone: "emerald" },
};

export function getMaintenancePriorityMeta(priority) {
    return MAINTENANCE_PRIORITY_META[priority] || { label: priority || "Unknown", tone: "slate" };
}

export function getMaintenanceStatusMeta(status) {
    return MAINTENANCE_STATUS_META[status] || { label: status || "Unknown", tone: "slate" };
}

export function formatMaintenanceDate(value) {
    if (!value) return "Not scheduled";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function pad2(value) {
    return String(value).padStart(2, "0");
}

export function toLocalDateInputValue(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function toLocalDateKey(value) {
    return toLocalDateInputValue(value);
}

export function toLocalDateTimeInputValue(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return `${toLocalDateInputValue(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function isEmergencyPriority(priority) {
    return String(priority || "").toUpperCase() === "EMERGENCY";
}