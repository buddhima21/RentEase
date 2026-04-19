import { motion } from "framer-motion";

const itemVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 15 } },
};

const THEME_MAP = {
    red: {
        containerHover: "hover:bg-red-50/30",
        iconContainer: "bg-red-50 text-red-500 border-red-100/50",
        valueText: "text-red-600",
        button: "bg-red-600 hover:bg-red-700 shadow-[0_4px_14px_rgba(220,38,38,0.2)]",
    },
    emerald: {
        containerHover: "hover:bg-emerald-50/30",
        iconContainer: "bg-emerald-50 text-emerald-500 border-emerald-100/50",
        valueText: "text-emerald-600",
        button: "bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_14px_rgba(5,150,105,0.2)]",
    },
    primary: {
        containerHover: "hover:bg-emerald-50/30",
        iconContainer: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
        valueText: "text-emerald-600",
        button: "bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_14px_rgba(5,150,105,0.2)]",
    },
    blue: {
        containerHover: "hover:bg-blue-50/30",
        iconContainer: "bg-blue-50 text-blue-600 border-blue-100/50",
        valueText: "text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.2)]",
    }
};

export default function AdminStatCard({
    title,
    value,
    subtitle,
    icon,
    colorTheme = "primary",
    actionText,
    onActionClick,
}) {
    const theme = THEME_MAP[colorTheme] || THEME_MAP.primary;

    return (
        <motion.div
            variants={itemVariants}
            className={`bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 flex flex-col items-center justify-between flex-1 text-center group transition-colors duration-500 ${theme.containerHover}`}
        >
            <div className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center mb-6 border ${theme.iconContainer}`}>
                <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </span>
            </div>
            
            <div className="mb-8">
                <h3 className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                    {title}
                </h3>
                <div className={`text-[48px] font-black leading-none ${theme.valueText}`}>
                    {value}
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">{subtitle}</p>
            </div>
            
            {actionText ? (
                <button
                    onClick={onActionClick}
                    className={`w-full text-white font-bold py-3.5 rounded-full shadow-md transition-all active:scale-[0.98] ${theme.button}`}
                >
                    {actionText}
                </button>
            ) : (
                <div className="w-full h-[52px] bg-slate-50/50 rounded-full border border-slate-100/50 mt-auto"></div>
            )}
        </motion.div>
    );
}
