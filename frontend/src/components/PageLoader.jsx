import React from "react";
import { motion } from "framer-motion";

export default function PageLoader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ 
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                    className="w-16 h-16 rounded-3xl bg-primary/20 flex flex-col items-center justify-center shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-primary text-3xl font-bold">diamond</span>
                </motion.div>
                <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                    className="text-sm font-bold text-slate-400 tracking-widest uppercase"
                >
                    Loading...
                </motion.p>
            </div>
        </div>
    );
}
