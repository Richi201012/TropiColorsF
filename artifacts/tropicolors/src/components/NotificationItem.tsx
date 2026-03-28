import { Package, Clock, DollarSign, Trash2 } from "lucide-react";
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

function formatFullDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationItem({
  notification,
  onViewOrder,
  onDelete,
}: {
  notification: Notification;
  onViewOrder?: (orderId: string) => void;
  onDelete?: (notificationId: string) => void;
}) {
  const isUnread = notification.estado === "no_leida";
  const isLargeOrder = notification.total > 1000;
  const requiresInvoice = notification.requiresInvoice;

  const handleClick = async () => {
    if (isUnread) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        console.error("[NotificationItem] Error al marcar como leída:", error);
      }
    }
    onViewOrder?.(notification.orderId);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`
        group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200
        ${
          isUnread
            ? "border-primary/20 bg-primary/5 shadow-sm"
            : "border-border/50 bg-white"
        }
        ${isLargeOrder ? "ring-2 ring-amber-200/60" : ""}
        hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
            ${isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
            ${isLargeOrder ? "bg-amber-50 text-amber-600" : ""}
          `}
        >
          {isLargeOrder ? <DollarSign size={18} /> : <Package size={18} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className={`text-sm ${isUnread ? "font-bold text-slate-950" : "font-medium text-slate-700"}`}
              >
                Nuevo pedido de {notification.customerName}
              </p>
              {requiresInvoice && (
                <p className="mt-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 ring-1 ring-amber-200">
                  Con RFC para facturar
                </p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pedido #{notification.orderId.slice(0, 8).toUpperCase()}
              </p>
              {requiresInvoice && notification.customerRfc && (
                <p className="mt-1 text-[11px] font-medium text-amber-700">
                  RFC: {notification.customerRfc}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <span
                className={`text-sm font-bold ${isLargeOrder ? "text-amber-600" : "text-slate-950"}`}
              >
                ${notification.total.toLocaleString("es-MX")}
              </span>
              {isLargeOrder && (
                <span className="ml-1 inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 ring-1 ring-amber-200">
                  Grande
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatRelativeTime(notification.createdAt)}
            </span>
            {notification.createdAt && (
              <span className="hidden sm:inline">
                {formatFullDate(notification.createdAt)}
              </span>
            )}
          </div>
        </div>

        {isUnread && (
          <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
            title="Eliminar notificación"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
