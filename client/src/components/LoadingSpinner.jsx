function LoadingSpinner({ label = 'Loading', fullScreen = false }) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-[60vh]' : 'py-8'}`}>
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
    </div>
  );
}

export default LoadingSpinner;