import React, { useState, useMemo } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from "lucide-react";

export default function MaintenanceQueueTable({ data, columns, emptyMessage = "No requests in queue.", loading = false }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        if (!key) return;
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;
        
        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    if (loading) {
        return (
            <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-12 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-slate-400">progress_activity</span>
                <p className="mt-4 text-sm font-medium text-slate-500">Loading queue...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-16 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{emptyMessage}</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">When new maintenance requests arrive, they will appear here.</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/80">
                    <tr>
                        {columns.map((col, idx) => (
                            <th 
                                key={idx} 
                                className={`px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400 ${col.sortable ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors' : ''}`}
                                onClick={() => col.sortable ? handleSort(col.sortKey || col.header.toLowerCase()) : undefined}
                            >
                                <div className="flex items-center gap-1.5">
                                    {col.header}
                                    {col.sortable && (
                                        <span className="text-slate-400">
                                            {sortConfig.key === (col.sortKey || col.header.toLowerCase()) ? (
                                                sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                                            ) : (
                                                <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900">
                    {sortedData.map((item, rowIdx) => (
                        <tr 
                            key={item.id || rowIdx} 
                            className="group border-b last:border-0 border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                        >
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className={`px-4 py-4 align-middle ${col.className || ''}`}>
                                    {col.render(item)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
