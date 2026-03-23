import React, { useState } from 'react';

export default function DeletePropertyModal({ isOpen, onClose, onConfirm, propertyName }) {
    const [reason, setReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleDelete = () => {
        if (!reason.trim() || (reason === "other" && !otherReason.trim())) return;
        setIsDeleting(true);
        // Simulate API call
        setTimeout(() => {
            const finalReason = reason === "other" ? otherReason : reason;
            onConfirm(finalReason);
            setIsDeleting(false);
            setReason("");
            setOtherReason("");
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 m-auto">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                            <span className="material-symbols-outlined text-red-500">warning</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Property</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                        <p className="text-slate-700 text-sm leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-slate-900">{propertyName}</span>? 
                            This action cannot be undone and will permanently remove all associated data, including active bookings and reviews.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            Reason for Deletion <span className="text-red-500">*</span>
                        </label>
                        <select 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-900 outline-none appearance-none"
                        >
                            <option value="" disabled>Select a reason...</option>
                            <option value="sold">Property has been sold</option>
                            <option value="renovation">Undergoing major renovations</option>
                            <option value="platform_switch">Moving to another platform</option>
                            <option value="personal_use">Reclaiming for personal use</option>
                            <option value="issues">Issues with tenants or management</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {reason === "other" && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                Please Specify <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                rows="3"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-900 resize-none outline-none"
                                placeholder="..."
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3 relative z-10">
                    <button 
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={!reason.trim() || (reason === "other" && !otherReason.trim()) || isDeleting}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-600/20 rounded-xl transition-all flex items-center justify-center min-w-[160px] gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        {isDeleting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                Deleting...
                            </>
                        ) : (
                            "Permanently Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
