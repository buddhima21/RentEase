export const MAINTENANCE_STATUS = {
    PENDING: "Pending",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed"
};

export const PRIORITY_LEVELS = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    EMERGENCY: "Emergency"
};

export const SERVICE_TYPES = [
    { value: "Electrical", label: "Electrical Repairs" },
    { value: "Plumbing", label: "Plumbing Services" },
    { value: "HVAC", label: "HVAC Maintenance" },
    { value: "Appliance", label: "Appliance Repair" },
    { value: "Painting", label: "Painting" },
    { value: "Handyman", label: "General Handyman" }
];

export const TECHNICIANS = [
    { id: "TECH-001", name: "Maria Fernando", specialty: "Plumbing", rating: 4.9, workload: "Medium", tasksToday: 4 },
    { id: "TECH-002", name: "John Silva", specialty: "Electrical", rating: 4.8, workload: "Low", tasksToday: 2 },
    { id: "TECH-003", name: "Kasun Perera", specialty: "HVAC", rating: 4.7, workload: "Low", tasksToday: 1 },
    { id: "TECH-004", name: "Amal Silva", specialty: "Painting", rating: 4.6, workload: "High", tasksToday: 5 }
];
