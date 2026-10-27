import React, { useState } from 'react';
import { SmartReminderItem } from '../types';
import { AlertTriangle, Clock, BookOpen, Lightbulb, Bell, X, ArrowRight } from 'lucide-react';

interface SmartAlertsProps {
  reminders: SmartReminderItem[];
  onActionClick: (reminder: SmartReminderItem) => void;
}

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ reminders, onActionClick }) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const activeReminders = reminders.filter((r) => !dismissedIds.includes(r.id));

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const requestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationEnabled(true);
        new Notification('Pengingat KuliahKu Aktif', {
          body: 'Notifikasi pintar telah aktif untuk mengingatkan jadwal kuliah dan deadline tugas Anda!',
          icon: '/favicon.ico',
        });
      }
    }
  };

  if (activeReminders.length === 0) {
    return null;
  }

  const getReminderIcon = (type: SmartReminderItem['type']) => {
    switch (type) {
      case 'overdue_task':
      case 'urgent_deadline':
        return <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />;
      case 'upcoming_class':
        return <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
      case 'study_tip':
        return <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />;
    }
  };

  const getReminderBadgeStyle = (level: SmartReminderItem['level']) => {
    switch (level) {
      case 'kritis':
        return 'border-rose-200 bg-rose-50/60 text-rose-950';
      case 'waspada':
        return 'border-amber-200 bg-amber-50/60 text-amber-950';
      default:
        return 'border-blue-200 bg-blue-50/60 text-blue-950';
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
        <span className="font-semibold flex items-center gap-1.5 text-neutral-800">
          <Bell className="w-3.5 h-3.5 text-amber-500" />
          Pengingat Pintar & Rekomendasi Waktu Belajar
        </span>
        {!notificationEnabled && typeof window !== 'undefined' && 'Notification' in window && (
          <button
            onClick={requestNotification}
            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>Aktifkan Notifikasi Browser</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeReminders.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className={`border rounded-xl p-3.5 relative flex flex-col justify-between transition-shadow hover:shadow-xs ${getReminderBadgeStyle(
              item.level
            )}`}
          >
            <button
              onClick={() => handleDismiss(item.id)}
              className="absolute top-2.5 right-2.5 text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors"
              title="Abaikan pengingat"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div>
              <div className="flex items-start gap-2 pr-6">
                {getReminderIcon(item.type)}
                <div>
                  <h4 className="text-xs font-bold leading-tight tracking-tight">
                    {item.title}
                  </h4>
                  {item.timeRemaining && (
                    <span className="inline-block mt-0.5 text-[11px] font-mono tabular-nums text-neutral-600 font-medium">
                      {item.timeRemaining}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-neutral-700 mt-2 leading-relaxed">
                {item.message}
              </p>
            </div>

            {item.actionText && (
              <div className="mt-3 pt-2.5 border-t border-neutral-200/50 flex items-center justify-end">
                <button
                  onClick={() => onActionClick(item)}
                  className="text-xs font-semibold text-neutral-900 hover:text-neutral-700 flex items-center gap-1 group transition-colors"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
