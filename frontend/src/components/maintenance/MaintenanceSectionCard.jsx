export default function MaintenanceSectionCard({ eyebrow, title, description, children, className = "" }) {
    return (
        <section className={`rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8 ${className}`}>
            {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">{eyebrow}</p> : null}
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">{title}</h2>
            {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">{description}</p> : null}
            <div className="mt-6">{children}</div>
        </section>
    );
}