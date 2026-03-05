export const mockMaintenanceRequests = [
    {
        id: "MR-2024-001",
        serviceType: "Plumbing",
        property: "Unit 3B, Colombo 04",
        description: "Kitchen sink is leaking from the pipe connection underneath. Water drips continuously.",
        priority: "High",
        status: "In Progress",
        technician: {
            id: "TECH-001",
            name: "Maria Fernando",
            specialty: "Plumbing Expert",
            rating: 4.9,
            phone: "+94 77 123 4567"
        },
        tenant: {
            name: "Kasun Perera",
            phone: "+94 77 123 4567"
        },
        createdDate: "2024-01-15T09:30:00",
        assignedDate: "2024-01-15T09:45:00",
        estimatedCompletion: "2024-01-15T12:30:00",
        photos: [],
        notes: "Started leaking yesterday evening. Getting worse."
    },
    {
        id: "MR-2024-002",
        serviceType: "Electrical",
        property: "Unit 5A, Malabe",
        description: "Power socket in bedroom not working. Need urgent repair.",
        priority: "Medium",
        status: "Assigned",
        technician: {
            id: "TECH-002",
            name: "John Silva",
            specialty: "Electrical Specialist",
            rating: 4.8,
            phone: "+94 77 234 5678"
        },
        tenant: {
            name: "Amal Silva",
            phone: "+94 77 234 5678"
        },
        createdDate: "2024-01-16T10:00:00",
        assignedDate: "2024-01-16T10:15:00",
        estimatedCompletion: "2024-01-16T14:00:00",
        photos: [],
        notes: ""
    },
    {
        id: "MR-2024-003",
        serviceType: "HVAC",
        property: "Unit 8D, Colombo 03",
        description: "Air conditioner not cooling properly. Making strange noise.",
        priority: "Low",
        status: "Pending",
        technician: null,
        tenant: {
            name: "Nimal Fernando",
            phone: "+94 77 345 6789"
        },
        createdDate: "2024-01-16T11:30:00",
        assignedDate: null,
        estimatedCompletion: null,
        photos: [],
        notes: "AC is 3 years old"
    }
];

export const mockTechnicians = [
    {
        id: "TECH-001",
        name: "Maria Fernando",
        specialty: "Plumbing",
        rating: 4.9,
        completedJobs: 112,
        phone: "+94 77 123 4567",
        email: "maria.fernando@rentease.lk",
        workload: "Medium",
        tasksToday: 4,
        maxTasksPerDay: 5,
        available: true
    },
    {
        id: "TECH-002",
        name: "John Silva",
        specialty: "Electrical",
        rating: 4.8,
        completedJobs: 96,
        phone: "+94 77 234 5678",
        email: "john.silva@rentease.lk",
        workload: "Low",
        tasksToday: 2,
        maxTasksPerDay: 5,
        available: true
    },
    {
        id: "TECH-003",
        name: "Kasun Perera",
        specialty: "HVAC",
        rating: 4.7,
        completedJobs: 84,
        phone: "+94 77 345 6789",
        email: "kasun.perera@rentease.lk",
        workload: "Low",
        tasksToday: 1,
        maxTasksPerDay: 5,
        available: true
    },
    {
        id: "TECH-004",
        name: "Amal Silva",
        specialty: "Painting",
        rating: 4.6,
        completedJobs: 67,
        phone: "+94 77 456 7890",
        email: "amal.silva@rentease.lk",
        workload: "High",
        tasksToday: 5,
        maxTasksPerDay: 5,
        available: false
    }
];

export const mockServiceTypes = [
    {
        id: "electrical",
        name: "Electrical Repairs",
        icon: "electrical_services",
        description: "Wiring, sockets, breakers",
        avgTime: "2-4 hours",
        costRange: "LKR 3,000 - 15,000"
    },
    {
        id: "plumbing",
        name: "Plumbing Services",
        icon: "plumbing",
        description: "Leaks, pipes, installations",
        avgTime: "1-3 hours",
        costRange: "LKR 2,500 - 12,000"
    },
    {
        id: "hvac",
        name: "HVAC Maintenance",
        icon: "ac_unit",
        description: "AC servicing, filters",
        avgTime: "2-5 hours",
        costRange: "LKR 4,000 - 20,000"
    },
    {
        id: "appliance",
        name: "Appliance Repair",
        icon: "kitchen",
        description: "Fridge, washer, dryer",
        avgTime: "1-4 hours",
        costRange: "LKR 3,500 - 18,000"
    },
    {
        id: "painting",
        name: "Painting",
        icon: "format_paint",
        description: "Interior and exterior",
        avgTime: "1-3 days",
        costRange: "LKR 10,000 - 50,000"
    },
    {
        id: "handyman",
        name: "General Handyman",
        icon: "handyman",
        description: "Various repairs",
        avgTime: "1-3 hours",
        costRange: "LKR 2,000 - 10,000"
    }
];

export const mockMaintenanceHistory = [
    {
        id: "MR-2023-098",
        serviceType: "Electrical",
        property: "Unit 3B, Colombo 04",
        date: "2023-12-20",
        technician: "John Silva",
        status: "Completed",
        rating: 4,
        cost: 5000
    },
    {
        id: "MR-2023-087",
        serviceType: "HVAC",
        property: "Unit 3B, Colombo 04",
        date: "2023-11-10",
        technician: "Kasun Perera",
        status: "Completed",
        rating: 5,
        cost: 8000
    },
    {
        id: "MR-2023-076",
        serviceType: "Plumbing",
        property: "Unit 3B, Colombo 04",
        date: "2023-10-05",
        technician: "Maria Fernando",
        status: "Completed",
        rating: 5,
        cost: 3500
    }
];
