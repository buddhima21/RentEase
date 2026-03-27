import { motion } from "framer-motion";
import { recentActivity } from "../../../data/ownerDashboardData";

/**
 * ActivityList — Modern timeline with staggered animations and enhanced styling.
 */
export default function ActivityList() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -15 },
        visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120 } },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6 hover:shadow-xl transition-shadow duration-500"
        >
            {/* Header */}
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2.5 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                    <span className="material-symbols-outlined text-lg">history</span>
                </div>
                Recent Activity
                <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Live</span>
            </h3>

            {/* Timeline */}
            <motion.div
                className="space-y-1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {recentActivity.map((item, index) => (
                    <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="flex gap-3.5 group hover:bg-slate-50/50 rounded-xl px-2 py-3 -mx-2 transition-colors duration-200 cursor-default"
                    >
                        {/* Dot + Vertical line */}
                        <div className="flex flex-col items-center pt-1.5">
                            <motion.div
                                className={`w-3 h-3 rounded-full ${item.dotColor} ring-4 ring-white shrink-0 shadow-sm`}
                                whileHover={{ scale: 1.5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            />
                            {index < recentActivity.length - 1 && (
                                <div className="w-px flex-1 bg-gradient-to-b from-slate-200 to-transparent mt-2" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="pb-2 min-w-0 flex-1">
                            <p className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                                {item.text.split(item.highlight).map((part, i, arr) =>
                                    i < arr.length - 1 ? (
                                        <span key={i}>
                                            {part}
                                            <span className="font-bold text-emerald-600">{item.highlight}</span>
                                        </span>
                                    ) : (
                                        part
                                    )
                                )}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="material-symbols-outlined text-[12px] text-slate-300">schedule</span>
                                <p className="text-[11px] text-slate-400 font-medium">{item.time}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Load More */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 py-3 text-[11px] font-bold text-slate-400 border border-slate-100 rounded-xl hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-300 uppercase tracking-widest"
            >
                Load More Activity
            </motion.button>
        </motion.div>
    );
}
