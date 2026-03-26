import { Bell, Package, Clock } from "lucide-react";
import { markNotificationAsRead } from "@/services/notification-service";
import type { Notification } from "@/hooks/useNotifications";

function formatRelativeTime(dateString: string): string {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return "Ahora mismo";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const isUnread = notification.estado === "no_leida";

  const handleMarkAsRead = async () => {
    if (!isUnread) return;
    try {
      await markNotificationAsRead(notification.id);
    } catch (error) {
      console.error("[NotificationItem] Error al marcar como leída:", error);
    }
  };

  return (
    <div
      className={`
        group relative rounded-2xl border p-4 transition-all duration-200
        ${
          isUnread
            ? "border-primary/20 bg-primary/5 shadow-sm"
            : "border-border/50 bg-white"
        }
        hover:shadow-md hover:-translate-y-0.5
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
            ${isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
          `}
        >
          <Package size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className={`text-sm ${isUnread ? "font-bold text-slate-950" : "font-medium text-slate-700"}`}
              >
                Nuevo pedido de {notification.customerName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pedido #{notification.orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <span className="shrink-0 text-sm font-bold text-slate-950">
              ${notification.total.toLocaleString("es-MX")}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />
              {formatRelativeTime(notification.createdAt)}
            </div>

            {isUnread && (
              <button
                type="button"
                onClick={handleMarkAsRead}
                className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Marcar como leída
              </button>
            )}
          </div>
        </div>

        {isUnread && (
          <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
}
