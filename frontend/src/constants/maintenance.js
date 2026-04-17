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

export const MAINTENANCE_STATUSES = ["REPORTED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export const MAINTENANCE_TIMELINE = [
    { key: "REPORTED", label: "Submitted" },
    { key: "ASSIGNED", label: "Assigned" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "PAUSED", label: "Paused" },
    { key: "RESOLVED", label: "Resolved" },
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
    IN_PROGRESS: { label: "In Progress", tone: "amber" },
    PAUSED: { label: "Paused", tone: "slate" },
    RESOLVED: { label: "Resolved", tone: "emerald" },
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

export function isEmergencyPriority(priority) {
    return String(priority || "").toUpperCase() === "EMERGENCY";
}