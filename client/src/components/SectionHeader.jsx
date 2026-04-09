function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-teal-700">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export default SectionHeader;