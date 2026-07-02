"use client";

import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string | number;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

interface NotificationBellProps {
  role: string;
}

function BellIcon({ hasUnread }: { hasUnread: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-6 h-6 transition-colors ${hasUnread ? "text-amber-400" : "text-slate-400"}`}
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell({ role }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function fetchNotifications() {
    try {
      const res = await fetch(`/api/notifications?role=${role}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data: Notification[] = await res.json();
      setNotifications(data);
    } catch {
      // Silently fail on network errors
    }
  }

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
  }, [role]);

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [role]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Optionally call an API endpoint here
    fetch("/api/notifications/read-all", { method: "POST" }).catch(() => {});
  }

  function markRead(id: string | number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    fetch(`/api/notifications/${id}/read`, { method: "POST" }).catch(() => {});
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-800 active:bg-slate-700 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <BellIcon hasUnread={unreadCount > 0} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none border-2 border-slate-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
        >
          {/* Dropdown header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-amber-600 hover:text-amber-500 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-amber-400 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markRead(notification.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                    !notification.read ? "bg-amber-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Unread dot */}
                    <span
                      className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${
                        !notification.read ? "bg-amber-400" : "bg-transparent"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm leading-snug ${
                          !notification.read
                            ? "font-medium text-slate-800"
                            : "text-slate-600"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50">
              <p className="text-xs text-slate-400 text-center">
                {unreadCount === 0
                  ? "All caught up"
                  : `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
