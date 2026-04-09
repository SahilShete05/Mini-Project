const styles = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 ring-rose-200',
  cancelled: 'bg-slate-100 text-slate-700 ring-slate-200',
  active: 'bg-cyan-100 text-cyan-800 ring-cyan-200',
};

function StatusBadge({ value }) {
  const key = String(value || '').toLowerCase();

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ring-1 ${styles[key] || styles.pending}`}>
      {value}
    </span>
  );
}

export default StatusBadge;