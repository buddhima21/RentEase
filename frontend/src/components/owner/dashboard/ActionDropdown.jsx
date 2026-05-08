import React, { useState, useRef, useEffect } from "react";

export default function ActionDropdown({ onUpdate, onDelete, onView }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Menu Item Component for consistency
    const MenuItem = ({ icon, label, onClick, isDestructive }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                if (onClick) onClick();
            }}
            className={`w-full text-left px-5 py-3 text-sm font-semibold flex items-center gap-3 transition-colors duration-200 ${isDestructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-primary"
                }`}
        >
            <span className={`material-symbols-outlined text-[20px] ${isDestructive ? 'text-red-500' : 'text-slate-400 group-hover:text-primary'}`}>
                {icon}
            </span>
            {label}
        </button>
    );

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center border ${isOpen
                        ? "text-primary bg-primary/10 border-primary/20 shadow-sm"
                        : "text-slate-400 bg-white dark:bg-slate-900 border-transparent hover:text-primary hover:bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200 dark:border-slate-700 hover:shadow-sm"
                    }`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className="material-symbols-outlined text-xl transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    more_vert
                </span>
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-700/50 z-50 overflow-hidden transform origin-top-right transition-all duration-200 ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
                    }`}
            >
                <div className="py-2">
                    <MenuItem
                        icon="edit_square"
                        label="Edit Property"
                        onClick={onUpdate}
                    />
                    <MenuItem
                        icon="visibility"
                        label="View Details"
                        onClick={onView}
                    />
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-4"></div>
                    <MenuItem
                        icon="delete"
                        label="Delete Listing"
                        onClick={onDelete}
                        isDestructive={true}
                    />
                </div>
            </div>
        </div>
    );
}
