/**
 * ActionCard — A single pending-action item (booking request, maintenance, etc.).
 *
 * Props: type, typeBg, typeColor, title, description, time, actions[]
 */
export default function ActionCard({
    type,
    typeBg,
    typeColor,
    title,
    description,
    time,
    actions = [],
}) {
    const buttonStyles = {
        primary:
            "bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20",
        secondary:
            "bg-slate-100 hover:bg-slate-200 text-slate-700",
        outline:
            "border border-slate-200 hover:border-primary/40 hover:bg-primary/5 text-slate-700 hover:text-primary",
    };

    return (
        <div className="p-4 border border-emerald-50 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all duration-200 group">
            {/* Badge + Time */}
            <div className="flex justify-between items-start mb-2.5">
                <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${typeBg} ${typeColor}`}
                >
                    {type}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{time}</span>
            </div>

            {/* Content */}
            <p className="text-sm font-semibold text-slate-800 leading-snug">{title}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>

            {/* Action Buttons */}
            {actions.length > 0 && (
                <div className="mt-4 flex gap-2">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all duration-200 ${buttonStyles[action.variant] || buttonStyles.outline
                                }`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
