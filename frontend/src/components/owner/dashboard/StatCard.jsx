import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * AnimatedCounter — Smoothly counts up from 0 to a target value.
 */
function AnimatedCounter({ value, duration = 1.5 }) {
    const [count, setCount] = useState(0);
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    const suffix = value.replace(/[0-9.,]/g, "").trim();
    const hasDecimal = value.includes(".");
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const start = performance.now();
                    const animate = (now) => {
                        const elapsed = (now - start) / 1000;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = eased * numericValue;
                        setCount(hasDecimal ? Math.round(current * 10) / 10 : Math.round(current));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [numericValue, duration, hasDecimal]);

    const display = hasDecimal ? count.toFixed(1) : count.toLocaleString();
    return <span ref={ref}>{display}{suffix}</span>;
}

/**
 * StatCard — Modern glassmorphism KPI card with animated counter & micro-interactions.
 */
export default function StatCard({
    icon,
    iconBg,
    iconColor,
    label,
    value,
    badge,
    badgeBg,
    badgeColor,
    index = 0,
}) {
    // Gradient mappings for icon backgrounds
    const gradientMap = {
        "bg-blue-50": "from-blue-500 to-indigo-600",
        "bg-emerald-50": "from-emerald-500 to-teal-600",
        "bg-red-50": "from-rose-500 to-pink-600",
        "bg-amber-50": "from-amber-500 to-orange-600",
    };

    const gradient = gradientMap[iconBg] || "from-emerald-500 to-teal-600";

    // Glow color mapping
    const glowMap = {
        "bg-blue-50": "shadow-blue-500/20",
        "bg-emerald-50": "shadow-emerald-500/20",
        "bg-red-50": "shadow-rose-500/20",
        "bg-amber-50": "shadow-amber-500/20",
    };
    const glow = glowMap[iconBg] || "shadow-emerald-500/20";

    return (
        <motion.div
            className="relative bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[170px] overflow-hidden group cursor-default"
            whileHover={{ y: -6, scale: 1.02 }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.12, duration: 0.5, type: "spring", stiffness: 100 }}
        >
            {/* Animated background orb */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-[0.06] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-700 pointer-events-none blur-xl`} />
            <div className={`absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none blur-lg`} />

            {/* Top row: icon + badge */}
            <div className="flex items-start justify-between mb-4 z-10">
                <motion.div
                    className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg ${glow} flex items-center justify-center`}
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                </motion.div>
                {badge && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.12 + 0.3 }}
                        className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${badgeBg} ${badgeColor} border border-current/10`}
                    >
                        {badge}
                    </motion.span>
                )}
            </div>

            {/* Label + Animated Value */}
            <div className="z-10">
                <p className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase mb-1.5">{label}</p>
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
                    <AnimatedCounter value={value} duration={1.2 + index * 0.2} />
                </h3>
            </div>

            {/* Bottom shimmer line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </motion.div>
    );
}
