function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
      <p className="text-lg font-bold text-slate-900">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;