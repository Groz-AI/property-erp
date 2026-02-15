import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { useTranslation } from 'react-i18next';
import { useNotifications, useMarkAllNotificationsRead, useDismissNotification } from '@/hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotifications() as { data: any[] };
  const markAllReadMutation = useMarkAllNotificationsRead();
  const dismissMutation = useDismissNotification();

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const markAllRead = () => markAllReadMutation.mutate();
  const dismiss = (id: string) => dismissMutation.mutate(id);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-[360px] rounded-2xl border border-border/50 bg-card shadow-soft-lg overflow-hidden animate-fade-in-scale">
            <div className="flex items-center justify-between border-b border-border/30 px-4 py-3.5">
              <h3 className="text-sm font-semibold">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                  {t('notifications.mark_all_read')}
                </button>
              )}
            </div>
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('notifications.none')}</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3.5 flex items-start gap-3 transition-colors hover:bg-muted/20 ${!n.isRead ? 'bg-primary/[0.03]' : ''}`}
                  >
                    {!n.isRead && <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                    <div className={`min-w-0 flex-1 ${n.isRead ? 'ml-5' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium truncate">{n.title}</span>
                        <StatusBadge status={n.type} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground/50 mt-1 block">{n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="shrink-0 rounded-lg p-1 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                      style={{ opacity: 1 }}
                    >
                      <X className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
