export default function AuthLoading() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-sky-200 border-t-sky-600" />
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
}
