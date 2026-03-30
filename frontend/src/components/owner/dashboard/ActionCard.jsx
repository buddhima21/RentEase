import { motion } from "framer-motion";

/**
 * ActionCard — Modern pending-action card with slide-in animation.
 */
export default function ActionCard({
    type,
    typeBg,
    typeColor,
    title,
    description,
    time,
    actions = [],
    index = 0,
}) {
    const buttonStyles = {
        primary:
            "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30",
        secondary:
            "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800",
        outline:
            "border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700",
    };

    // Icon mapping for action types
    const iconMap = {
        "Booking Request": "event_available",
        "Maintenance": "build_circle",
        "Payment Due": "payments",
    };

    const iconGradientMap = {
        "Booking Request": "from-emerald-500 to-teal-600",
        "Maintenance": "from-blue-500 to-indigo-600",
        "Payment Due": "from-rose-500 to-pink-600",
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.01, x: 4 }}
            className="p-4 bg-white/60 backdrop-blur-sm border border-slate-100 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
        >
            {/* Left accent line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${iconGradientMap[type] || "from-emerald-500 to-teal-600"} rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Badge + Time */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${iconGradientMap[type] || "from-emerald-500 to-teal-600"} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-white text-sm">{iconMap[type] || "pending_actions"}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${typeBg} ${typeColor}`}>
                        {type}
                    </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    {time}
                </span>
            </div>

            {/* Content */}
            <p className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-slate-900 transition-colors">{title}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>

            {/* Action Buttons */}
            {actions.length > 0 && (
                <div className="mt-3.5 flex gap-2">
                    {actions.map((action) => (
                        <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all duration-200 ${buttonStyles[action.variant] || buttonStyles.outline
                                }`}
                        >
                            {action.label}
                        </motion.button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
