export default function MaintenanceSectionCard({ eyebrow, title, description, action, children, className = "" }) {
    return (
        <section className={`rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8 ${className}`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">{eyebrow}</p> : null}
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">{title}</h2>
                    {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">{description}</p> : null}
                </div>
                {action && (
                    <div className="shrink-0 mt-2 md:mt-0">
                        {action}
                    </div>
                )}
            </div>
            <div className="mt-6">{children}</div>
        </section>
    );
}