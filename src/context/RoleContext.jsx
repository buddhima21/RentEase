import React, { createContext, useContext, useMemo, useState } from 'react';
const RoleContext = createContext(undefined);
const ALLOWED_ROLES = new Set(['tenant', 'owner', 'admin']);
function normalizeRole(value) {
    return ALLOWED_ROLES.has(value) ? value : 'tenant';
}
export function RoleProvider({ children }) {
    const [role, setRole] = useState(() => {
        const saved = localStorage.getItem('rentease_role') || 'tenant';
        return normalizeRole(saved);
    });
    const setRoleSync = (nextRole) => {
        setRole((current) => {
            const resolved = typeof nextRole === 'function' ? nextRole(current) : nextRole;
            const normalized = normalizeRole(resolved);
            localStorage.setItem('rentease_role', normalized);
            return normalized;
        });
    };
    const value = useMemo(() => ({ role, setRole: setRoleSync }), [role]);
    return (<RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>);
}
export function useRole() {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
}
