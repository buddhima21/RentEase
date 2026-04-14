export function normalizeRole(role) {
    return typeof role === "string" ? role.toUpperCase() : "";
}

export function getDashboardPathByRole(role) {
    const normalized = normalizeRole(role);

    if (normalized === "ADMIN") return "/admin/dashboard";
    if (normalized === "OWNER") return "/owner/dashboard";
    if (normalized === "TECHNICIAN") return "/technician/dashboard";
    if (normalized === "TENANT") return "/tenant/dashboard";

    return "/";
}

export function getMaintenancePathByRole(role) {
    const normalized = normalizeRole(role);

    if (normalized === "TENANT") return "/tenant/maintenance/dashboard";
    if (normalized === "OWNER") return "/owner/maintenance";
    if (normalized === "ADMIN") return "/admin/maintenance";
    if (normalized === "TECHNICIAN") return "/technician/dashboard";

    return "/maintenance";
}
