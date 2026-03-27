import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getOwnerProperties } from "../../../services/api";

const statusStyles = {
    Published: "bg-emerald-50 text-emerald-700 ring-emerald-500/20 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 ring-amber-500/20 border-amber-200",
    Occupied: "bg-blue-50 text-blue-700 ring-blue-500/20 border-blue-200",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-500/20 border-rose-200",
    Archived: "bg-slate-50 text-slate-600 ring-slate-400/20 border-slate-200",
    Draft: "bg-slate-50 text-slate-500 ring-slate-400/20 border-slate-200",
};

const statusIcons = {
    Published: "check_circle",
    Pending: "schedule",
    Occupied: "person",
    Rejected: "cancel",
    Archived: "archive",
    Draft: "edit_note",
};

/**
 * PropertyTable — Modern card-style property listing with hover animations.
 */
export default function PropertyTable() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProperties = async () => {
        try {
            const res = await getOwnerProperties();
            if (res.data.success) {
                const formatter = new Intl.NumberFormat("en-LK");
                const mapped = res.data.data.map((p) => ({
                    id: p.id,
                    name: p.title,
                    type: p.propertyType,
                    status: mapStatusMapping(p.status),
                    rent: `LKR ${formatter.format(Number(p.price) || 0)}/mo`,
                    thumbnail:
                        p.imageUrls?.[0] ||
                        `https://source.unsplash.com/featured/?home&sig=${encodeURIComponent(p.id)}`,
                    updatedAt: p.updatedAt || p.createdAt || new Date(0).toISOString(),
                }));
                mapped.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setProperties(mapped.slice(0, 5));
            }
        } catch (error) {
            console.error("Failed to fetch dashboard properties:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const mapStatusMapping = (backendStatus) => {
        switch (backendStatus) {
            case "PENDING_APPROVAL": return "Pending";
            case "APPROVED": return "Published";
            case "RENTED": return "Occupied";
            case "REJECTED": return "Rejected";
            case "PENDING_DELETE": return "Archived";
            case "DELETED": return "Archived";
            default: return "Draft";
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    // Skeleton loader
    const SkeletonRow = ({ i }) => (
        <div className="flex items-center gap-4 p-4 animate-pulse">
            <div className="w-14 h-14 bg-slate-100 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded-lg w-1/2" />
            </div>
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
            <div className="h-4 w-24 bg-slate-100 rounded ml-auto" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-500"
        >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                        <span className="material-symbols-outlined text-lg">home_work</span>
                    </div>
                    My Properties
                </h3>
                <motion.button
                    whileHover={{ scale: 1.05, x: 3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/owner/properties")}
                    className="text-emerald-600 text-sm font-bold hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all flex items-center gap-1"
                >
                    View All
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </motion.button>
            </div>

            {/* Property List */}
            <div className="divide-y divide-slate-50">
                {isLoading ? (
                    [...Array(3)].map((_, i) => <SkeletonRow key={i} i={i} />)
                ) : properties.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-slate-300">home_work</span>
                        </div>
                        <p className="text-sm text-slate-400 font-medium">No properties yet</p>
                        <p className="text-xs text-slate-300 mt-1">Start by adding your first property</p>
                    </div>
                ) : (
                    properties.map((prop, index) => (
                        <motion.div
                            key={prop.id}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.06, duration: 0.4 }}
                            onClick={() => navigate(`/owner/properties/${prop.id}`)}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-transparent transition-all duration-300 cursor-pointer group"
                        >
                            {/* Thumbnail */}
                            <div className="relative shrink-0">
                                <img
                                    src={prop.thumbnail}
                                    alt={prop.name}
                                    className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 border border-slate-100"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                    {prop.name}
                                </p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{prop.type}</p>
                            </div>

                            {/* Status */}
                            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${statusStyles[prop.status] || statusStyles.Draft}`}>
                                <span className="material-symbols-outlined text-[11px]">{statusIcons[prop.status] || "edit_note"}</span>
                                {prop.status}
                            </span>

                            {/* Rent */}
                            <div className="text-right shrink-0">
                                <span className="text-sm font-bold text-slate-700">{prop.rent}</span>
                            </div>

                            {/* Arrow */}
                            <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300">
                                chevron_right
                            </span>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
