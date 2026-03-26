import { Bell } from "lucide-react";

export function NotificationBell({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/5 hover:text-primary hover:shadow-md active:translate-y-0"
    >
      <Bell size={16} />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/30 animate-bounce">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
