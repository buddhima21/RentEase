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
