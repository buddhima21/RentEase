import { useState } from 'react';

export default function DeletePropertyModal({ isOpen, onClose, onConfirm, propertyName }) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (!reason) return;
        
        setIsDeleting(true);
        // Combine reason and description if "Other" is selected
        const finalReason = reason === "Other" ? `Other: ${description}` : reason;
        
        try {
            await onConfirm(finalReason);
            setReason("");
            setDescription("");
            onClose();
        } catch (error) {
            console.error("Deletion failed", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 m-auto">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                        <span className="material-symbols-outlined text-red-600">warning</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Request Property Deletion</h3>
                    
                    <p className="text-center text-slate-500 text-sm mb-6">
                        You are about to request deletion for <span className="font-bold text-slate-900">{propertyName}</span>.
                        This action requires admin approval. Once approved, all data including bookings and reviews will be permanently removed.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                Reason for Deletion <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            >
                                <option value="" disabled>Select a reason...</option>
                                <option value="Sold">Property Sold</option>
                                <option value="No longer renting">No longer renting</option>
                                <option value="Moving to another platform">Moving to another platform</option>
                                <option value="Duplicate listing">Duplicate listing</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {reason === "Other" && (
                            <div className="animate-in slide-in-from-top-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                    Please specify <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please provide more details..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none h-24"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={!reason || (reason === "Other" && !description) || isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                "Request Delete"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
