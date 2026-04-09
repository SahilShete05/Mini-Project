function Alert({ type = 'info', title, children }) {
  const styles = {
    info: 'border-teal-200 bg-teal-50 text-teal-900',
    error: 'border-rose-200 bg-rose-50 text-rose-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles[type] || styles.info}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <p className="mt-1 text-sm leading-6 opacity-90">{children}</p> : null}
    </div>
  );
}

export default Alert;