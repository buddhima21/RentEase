/**
 * ownerDashboardData.js
 * Centralized mock data for the Owner Dashboard.
 * Replace these with API calls when backend is ready.
 */

// ── Owner Profile ─────────────────────────────────────────────
export const ownerProfile = {
  name: "Arjun Perera",
  role: "Premium Owner",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuATEcs2_YkdAPgi6wkMf1CEI-zGyhlTLBZax_nWrCv5NeqruOFO77ePt-10UVstxkQydSclcPx8UkQX3pkchd1wg9uVNDK7L4QQUQhG8SG2N67A2yo7oHx-EHeMyeRcDoqHNBNHmRUGjxcXGTYq75-X_2IyqLYG2lnoV2BD1RSQ9ZHQ5dvCkQS2x32L-3BZ0ifpvjsZVTt92QxdS6ircclFuRDPPuiuRm9XGOrfKq04E3TDM6NAcsMEkD_S_LkSigQjrsbLSa8ui7H8",
};

// ── Sidebar Navigation ────────────────────────────────────────
export const sidebarLinks = [
  { label: "Dashboard", icon: "dashboard", path: "/owner/dashboard" },
  { label: "My Properties", icon: "home_work", path: "/owner/properties" },
  { label: "Bookings", icon: "calendar_month", path: "/owner/bookings" },
  { label: "Agreements", icon: "description", path: "/owner/agreements" },
  { label: "Reviews", icon: "star_rate", path: "/owner/reviews" },
  { label: "Maintenance", icon: "build", path: "/owner/maintenance", badge: 3 },
  { label: "Finance", icon: "payments", path: "/owner/finance" },
  { label: "Analytics", icon: "analytics", path: "/owner/analytics" },
];

// ── KPI Stats ─────────────────────────────────────────────────
export const statsData = [
  {
    icon: "apartment",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    label: "Total Properties",
    value: "12",
    badge: "+1 this month",
    badgeBg: "bg-emerald-50",
    badgeColor: "text-emerald-600",
  },
  {
    icon: "person_pin_circle",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    label: "Occupancy Rate",
    value: "85%",
    badge: "+5%",
    badgeBg: "bg-emerald-50",
    badgeColor: "text-emerald-600",
  },
  {
    icon: "notification_important",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    label: "Pending Requests",
    value: "5",
    badge: "High Priority",
    badgeBg: "bg-red-50",
    badgeColor: "text-red-600",
  },
  {
    icon: "account_balance_wallet",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    label: "Monthly Earnings",
    value: "LKR 450K",
    badge: "+12%",
    badgeBg: "bg-emerald-50",
    badgeColor: "text-emerald-600",
  },
];

// ── Properties (Dashboard Summary) ───────────────────────────
export const propertiesData = [
  {
    id: 1,
    name: "Skyline Studio — Colombo 03",
    type: "Studio",
    status: "Published",
    statusColor: "green",
    rent: "LKR 85,000",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPRIlQsKS4usX2ML59wXFqwIcx5pX7ECGLqrSIdGt3F3ESdx_YkSbxzV647HPL4eLxA6GnImsxmKaoyctKQMpXjE6ujxg9HTkcFTcp4W_7g0HW9k8aA91xSUoCwLtOz9OHuORkFP0HB-j0PFELMyXNijqkW-0vnE1a69oT6fscEunxjcK2F5vuqVUGlee21bHhD10ma4E4WJQTqnWRa15F5QRjY68DNnL42Ilg8I1PGjnyRH2w7CX5V0-IiPuZjCBhLVuKQptwfZLI",
  },
  {
    id: 2,
    name: "Rosewood Annex — Nugegoda",
    type: "Annex",
    status: "Published",
    statusColor: "green",
    rent: "LKR 45,000",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqgqFr2QWKLD5XQLvNQz8mglR9jMEHd3g9gjwo5JmLOAA9BuzwSluNvAITS8bZl05kibH_5TjCpIM-kRjzqXXSII0W80tJPEtoNgDxpD6UHsW99-uNGvoyunriFLt8Hg6o08nWEWg78Lr5oelCu9iEubF8N5KsYYAR_n0o3Qbxap-t3UxZl1bxf9Nf48sDYpWZd34iCEgyJT8TlvdrM4KPL76XQQFHktw970NLU4wSsEPPAcivoi4WWDn8wkFVLwsPauSmxhI0bUOG",
  },
  {
    id: 3,
    name: "Havelock City Ph. IV",
    type: "Apartment",
    status: "Draft",
    statusColor: "slate",
    rent: "LKR 165,000",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCZT94F9wvjHaTE2EXCUw0ZmRYCnxDH88TQCO70Ye4wJOvvqSvX3fc6KO-_PJAOiRYLM092VrYoGd4VyPhRGWVM0fUacXOHNzoUp0NjYeDSudGAfHS1D4WDUOgLKin-s97YBtrEHwNLPH0hfxtuavjsuTbCGxXiY4AKyQkRcL_y7H7F-G78wys162r4J2vMqEiIefbcU7AugRbjF73CJsXOXOZHrqoFeDpMYJEoHPShCJcLueMya_uEQ8tq0ltIsgs73RlU4tbnTub",
  },
  {
    id: 4,
    name: "Palm Grove Villa — Mount Lavinia",
    type: "Villa",
    status: "Published",
    statusColor: "green",
    rent: "LKR 120,000",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPRIlQsKS4usX2ML59wXFqwIcx5pX7ECGLqrSIdGt3F3ESdx_YkSbxzV647HPL4eLxA6GnImsxmKaoyctKQMpXjE6ujxg9HTkcFTcp4W_7g0HW9k8aA91xSUoCwLtOz9OHuORkFP0HB-j0PFELMyXNijqkW-0vnE1a69oT6fscEunxjcK2F5vuqVUGlee21bHhD10ma4E4WJQTqnWRa15F5QRjY68DNnL42Ilg8I1PGjnyRH2w7CX5V0-IiPuZjCBhLVuKQptwfZLI",
  },
];

// ── Monthly Revenue (last 6 months) ──────────────────────────
export const revenueData = [
  { month: "Oct", amount: 285000, label: "285K" },
  { month: "Nov", amount: 340000, label: "340K" },
  { month: "Dec", amount: 310000, label: "310K" },
  { month: "Jan", amount: 395000, label: "395K" },
  { month: "Feb", amount: 420000, label: "420K" },
  { month: "Mar", amount: 450000, label: "450K" },
];

export const revenueMax = 500000; // scale ceiling

// ── Pending Actions ───────────────────────────────────────────
export const pendingActions = [
  {
    id: 1,
    type: "Booking Request",
    typeBg: "bg-emerald-50",
    typeColor: "text-emerald-700",
    title: "Tharindu S. for Skyline Studio",
    description: "Request for viewing on Saturday, 10:00 AM",
    time: "2h ago",
    actions: [
      { label: "Approve", variant: "primary" },
      { label: "Decline", variant: "secondary" },
    ],
  },
  {
    id: 2,
    type: "Maintenance",
    typeBg: "bg-blue-50",
    typeColor: "text-blue-600",
    title: "Tap Leakage — Rosewood Annex",
    description: "Reported by tenant. Requires plumber review.",
    time: "5h ago",
    actions: [{ label: "Review Ticket", variant: "outline" }],
  },
  {
    id: 3,
    type: "Payment Due",
    typeBg: "bg-red-50",
    typeColor: "text-red-600",
    title: "Overdue rent — Palm Grove Villa",
    description: "Tenant Dilshan K. — 5 days overdue",
    time: "1d ago",
    actions: [{ label: "Send Reminder", variant: "primary" }],
  },
];

// ── Recent Activity ───────────────────────────────────────────
export const recentActivity = [
  {
    id: 1,
    dotColor: "bg-emerald-500",
    text: "Rent payment of LKR 85,000 received for Skyline Studio",
    highlight: "Skyline Studio",
    time: "Today, 9:24 AM",
  },
  {
    id: 2,
    dotColor: "bg-blue-500",
    text: "Contract renewed for Tenant: Kavinda M.",
    highlight: "Kavinda M.",
    time: "Yesterday, 4:15 PM",
  },
  {
    id: 3,
    dotColor: "bg-primary",
    text: "New property Havelock City Ph. IV added to drafts",
    highlight: "Havelock City Ph. IV",
    time: "Mar 12, 11:30 AM",
  },
  {
    id: 4,
    dotColor: "bg-amber-500",
    text: "Maintenance request resolved — Rosewood Annex",
    highlight: "Rosewood Annex",
    time: "Mar 10, 3:45 PM",
  },
];

// ── Owner Notifications (header bell) ───────────────────────
export const ownerNotifications = [
  {
    id: 1,
    title: "New booking request for Skyline Studio",
    description: "Tharindu S. requested a property viewing for Saturday, 10:00 AM.",
    time: "5 minutes ago",
    icon: "event_available",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    typeLabel: "Booking",
    typeBg: "bg-emerald-50 border-emerald-100",
    typeText: "text-emerald-700",
    unread: true,
  },
  {
    id: 2,
    title: "Skyline Studio listing published",
    description: "Your updated listing is now live on RentEase.",
    time: "25 minutes ago",
    icon: "rocket_launch",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    typeLabel: "Listing",
    typeBg: "bg-primary/10 border-primary/20",
    typeText: "text-emerald-700",
    unread: true,
  },
  {
    id: 3,
    title: "Deletion request received for Palm Grove Villa",
    description: "Admin team is reviewing your request to remove this listing.",
    time: "1 hour ago",
    icon: "delete_forever",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    typeLabel: "Request",
    typeBg: "bg-amber-50 border-amber-100",
    typeText: "text-amber-700",
    unread: true,
  },
  {
    id: 4,
    title: "Tenant applied for Rosewood Annex",
    description: "New long-term tenancy application submitted by Dilshan K.",
    time: "Yesterday, 4:10 PM",
    icon: "assignment_turned_in",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    typeLabel: "Application",
    typeBg: "bg-blue-50 border-blue-100",
    typeText: "text-blue-700",
    unread: false,
  },
  {
    id: 5,
    title: "Maintenance ticket closed",
    description: "Leaking tap at Rosewood Annex was marked as resolved.",
    time: "Mar 20, 2:05 PM",
    icon: "build_circle",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    typeLabel: "Maintenance",
    typeBg: "bg-slate-100 border-slate-200",
    typeText: "text-slate-600",
    unread: false,
  },
];
// ── Business Evolution Milestones ───────────────────────────
export const milestonesData = [
  {
    category: "Resident Engagement",
    items: [
      { id: 1, title: "Verified Feedback System", status: "Completed", description: "Implementation of multi-tier tenant verification to ensure 100% authentic property insights.", progress: 100 },
      { id: 2, title: "Response Rate Optimization", status: "Completed", description: "AI-assisted owner response tools to maintain high community engagement standards.", progress: 100 },
      { id: 3, title: "Conflict Resolution Portal", status: "Completed", description: "Streamlined arbitration workflow for transparent resolution of resident-owner feedback.", progress: 100 },
    ]
  },
  {
    category: "Market Intelligence",
    items: [
      { id: 4, title: "Smart Pricing Engine", status: "Completed", description: "Dynamic market benchmarking to help owners optimize rental yields based on real-time demand.", progress: 100 },
      { id: 5, title: "Predictive Analytics V2", status: "Completed", description: "Historical trend analysis to forecast occupancy rates and seasonal booking shifts.", progress: 100 },
      { id: 6, title: "Business Intelligence Exports", status: "Completed", description: "Professional-grade reporting suite for financial auditing and performance tracking.", progress: 100 },
    ]
  },
  {
    category: "Platform Excellence",
    items: [
      { id: 7, title: "High-Security Auth Tier", status: "Completed", description: "Enterprise-level data protection protocols for sensitive financial and property records.", progress: 100 },
      { id: 8, title: "Global Accessibility Audit", status: "Completed", description: "Full compliance with modern web accessibility standards for an inclusive resident experience.", progress: 100 },
      { id: 9, title: "Multi-Unit Scalability Tier", status: "Completed", description: "Optimized architecture to support property managers handling 50+ diverse listings.", progress: 100 },
    ]
  }
];
