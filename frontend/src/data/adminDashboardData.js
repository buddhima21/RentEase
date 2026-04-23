/**
 * adminDashboardData.js
 * Centralized mock data for the Admin Dashboard.
 * Replace with API calls when backend endpoints are ready.
 */

// ── Admin Profile ─────────────────────────────────────────────
export const adminProfile = {
  name: "System Administrator",
  role: "Super Admin",
  avatar:
    "https://ui-avatars.com/api/?name=System+Admin&background=1DBC60&color=fff&bold=true&size=128",
};

// ── Sidebar Navigation ────────────────────────────────────────
export const adminSidebarLinks = [
  { label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
  { label: "Users", icon: "group", path: "/admin/users", badge: 24 },
  { label: "Listing Moderation", icon: "fact_check", path: "/admin/listings" },
  { label: "Reviews", icon: "reviews", path: "/admin/reviews", badge: 5 },
  { label: "Bookings", icon: "calendar_month", path: "/admin/bookings" },
  { label: "Maintenance", icon: "construction", path: "/admin/maintenance" },
  { label: "Reports", icon: "assessment", path: "/admin/reports" },
  { label: "Settings", icon: "settings", path: "/admin/settings" },
];

// ── KPI Stats ─────────────────────────────────────────────────
export const adminStatsData = [
  {
    icon: "group",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    label: "Total Users",
    value: "1,248",
    badge: "+32 this month",
    badgeBg: "bg-emerald-50",
    badgeColor: "text-emerald-600",
  },
  {
    icon: "home_work",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    label: "Total Properties",
    value: "486",
    badge: "+18 new",
    badgeBg: "bg-emerald-50",
    badgeColor: "text-emerald-600",
  },
  {
    icon: "rate_review",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    label: "Pending Reviews",
    value: "12",
    badge: "Needs attention",
    badgeBg: "bg-amber-50",
    badgeColor: "text-amber-600",
  },
  {
    icon: "account_balance_wallet",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    label: "Platform Revenue",
    value: "LKR 2.4M",
    badge: "+15%",
    badgeBg: "bg-emerald-50",
    badgeColor: "text-emerald-600",
  },
];

// ── Recent Platform Activity ──────────────────────────────────
export const adminRecentActivity = [
  {
    id: 1,
    dotColor: "bg-emerald-500",
    icon: "person_add",
    text: "New owner Nimantha Perera registered and listed 2 properties",
    highlight: "Nimantha Perera",
    time: "Today, 11:42 AM",
  },
  {
    id: 2,
    dotColor: "bg-red-500",
    icon: "flag",
    text: "Review flagged for inappropriate content on Skyline Studio listing",
    highlight: "Skyline Studio",
    time: "Today, 10:15 AM",
  },
  {
    id: 3,
    dotColor: "bg-blue-500",
    icon: "home",
    text: "New property Colombo Heights listed by owner Kavindu S.",
    highlight: "Colombo Heights",
    time: "Yesterday, 4:30 PM",
  },
  {
    id: 4,
    dotColor: "bg-amber-500",
    icon: "report",
    text: "Maintenance complaint escalated for Rosewood Annex — Tenant Dilshan K.",
    highlight: "Rosewood Annex",
    time: "Yesterday, 2:10 PM",
  },
  {
    id: 5,
    dotColor: "bg-purple-500",
    icon: "payments",
    text: "Monthly payout of LKR 450K processed to owner Arjun Perera",
    highlight: "Arjun Perera",
    time: "Mar 20, 9:00 AM",
  },
];

// ── Platform Overview (for charts/summary) ────────────────────
export const platformOverview = {
  totalBookings: 342,
  activeListings: 412,
  occupancyRate: "78%",
  avgRating: "4.6",
};

// ── Admin Notifications (header bell) ───────────────────────
export const adminNotifications = [
  {
    id: 1,
    title: "5 property approvals pending",
    description: "New owner listings are waiting for your review.",
    time: "Just now",
    icon: "fact_check",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    typeLabel: "Moderation",
    typeBg: "bg-amber-50 border-amber-100",
    typeText: "text-amber-700",
    unread: true,
  },
  {
    id: 2,
    title: "Flagged review requires action",
    description: "Review on Skyline Studio was reported as inappropriate.",
    time: "14 minutes ago",
    icon: "flag",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    typeLabel: "Abuse",
    typeBg: "bg-red-50 border-red-100",
    typeText: "text-red-700",
    unread: true,
  },
  {
    id: 3,
    title: "New owner onboarding completed",
    description: "Owner Nimantha Perera verified and accepted terms.",
    time: "45 minutes ago",
    icon: "verified_user",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    typeLabel: "Owner",
    typeBg: "bg-emerald-50 border-emerald-100",
    typeText: "text-emerald-700",
    unread: true,
  },
  {
    id: 4,
    title: "Platform health looks good",
    description: "Error rate is under 0.5% and uptime is 99.99%.",
    time: "Today, 9:05 AM",
    icon: "health_and_safety",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    typeLabel: "Status",
    typeBg: "bg-blue-50 border-blue-100",
    typeText: "text-blue-700",
    unread: false,
  },
  {
    id: 5,
    title: "Monthly payouts processed",
    description: "LKR 2.4M in payouts were sent to owners.",
    time: "Yesterday, 6:20 PM",
    icon: "payments",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    typeLabel: "Finance",
    typeBg: "bg-purple-50 border-purple-100",
    typeText: "text-purple-700",
    unread: false,
  },
];

