import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity">
      <div className="flex flex-col items-center gap-4">
        {/* Loader2 is the standard 'spokes' loader in Lucide */}
        <Loader2
          className="animate-spin text-slate-600"
          size={40}
          strokeWidth={2}
        />

        {/* Added a subtle message to improve UX */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-semibold text-slate-900">Loading...</p>
          <p className="text-xs text-slate-500">Please wait a moment.</p>
        </div>
      </div>
    </div>
  );
}
