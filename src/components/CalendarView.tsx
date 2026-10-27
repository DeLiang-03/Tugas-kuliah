import React, { useState } from 'react';
import { Course, Task } from '../types';
import { exportToIcsFile, getGoogleCalendarCourseUrl, getGoogleCalendarTaskUrl } from '../utils/calendarExport';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface CalendarViewProps {
  courses: Course[];
  tasks: Task[];
  onSelectTask?: (taskId: string) => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  courses,
  tasks,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Helper to format date key YYYY-MM-DD
  const formatDateKey = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());

  // Indonesian day name for a given date
  const getDayNameIndonesian = (d: Date): string => {
    const map = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return map[d.getDay()];
  };

  // Get courses and tasks for selected day
  const selectedDayName = getDayNameIndonesian(selectedDate);
  const selectedDayCourses = courses.filter((c) => c.day === selectedDayName);
  const selectedDayTasks = tasks.filter((t) => t.deadline.startsWith(selectedDateKey));

  return (
    <div className="space-y-6">
      {/* Header and Sync Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-neutral-900" />
            Integrasi Kalender & Agenda Akademik
          </h2>
          <p className="text-xs text-neutral-500">
            Sinkronkan seluruh jadwal kuliah dan tenggat tugas dengan Google Calendar atau Apple Calendar
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportToIcsFile(courses, tasks)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Semua (.ICS)</span>
          </button>
        </div>
      </div>

      {/* Sync Instructions Callout */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-neutral-900">
              Cara Sinkronisasi Otomatis ke HP / Laptop:
            </span>{' '}
            Unduh file <strong className="font-mono">.ICS</strong> melalui tombol di atas, lalu buka
            di perangkat Android, iPhone (Apple Calendar), atau Google Calendar Desktop (fitur
            "Import Kalender"). Semua jadwal mingguan & deadline tugas akan otomatis terisi rapi!
          </div>
        </div>

        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>Buka Google Calendar</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Grid: Calendar Month Grid + Selected Day Agenda Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Calendar (col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {MONTH_NAMES[month]} {year}
              </h3>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Hari Ini
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-500 mb-2">
            {DAY_NAMES.map((d, i) => (
              <div key={d} className={`py-1 ${i === 0 ? 'text-rose-500' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Previous month padding days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfMonth + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="min-h-[72px] sm:min-h-[88px] p-1.5 border border-neutral-100 rounded-lg text-neutral-300 bg-neutral-50/50"
                >
                  <span className="font-mono">{dayNum}</span>
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateKey = formatDateKey(dateObj);
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDateKey;

              const indonesianDay = getDayNameIndonesian(dateObj);
              const dayCourses = courses.filter((c) => c.day === indonesianDay);
              const dayTasks = tasks.filter((t) => t.deadline.startsWith(dateKey));

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(dateObj)}
                  className={`min-h-[72px] sm:min-h-[88px] p-1.5 border rounded-lg text-left flex flex-col justify-between transition-all focus:outline-hidden ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-50/80 shadow-xs ring-1 ring-neutral-900/10'
                      : 'border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`font-mono tabular-nums text-xs font-semibold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center -m-0.5'
                          : 'text-neutral-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title={`${dayTasks.length} deadline tugas`} />
                    )}
                  </div>

                  {/* Day Content Badges */}
                  <div className="w-full space-y-1 mt-1">
                    {/* Courses dots */}
                    {dayCourses.length > 0 && (
                      <div className="flex items-center gap-1 overflow-hidden">
                        {dayCourses.slice(0, 3).map((c) => (
                          <span
                            key={c.id}
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          />
                        ))}
                        {dayCourses.length > 3 && (
                          <span className="text-[9px] text-neutral-400">+{dayCourses.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Task Title preview */}
                    {dayTasks.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className={`truncate text-[10px] px-1 py-0.5 rounded-sm ${
                          t.status === 'selesai'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700 font-medium'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 1 && (
                      <div className="text-[9px] text-neutral-500 font-medium font-mono pl-1">
                        +{dayTasks.length - 1} tugas lagi
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Date Agenda Details (col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-neutral-100 mb-4">
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
                Agenda Terpilih
              </span>
              <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                {selectedDayName}, {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h3>
            </div>

            {/* Courses for this day of week */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Jadwal Kuliah ({selectedDayCourses.length})</span>
                  <span className="font-normal lowercase font-mono text-[11px] text-neutral-400">
                    setiap {selectedDayName}
                  </span>
                </h4>

                {selectedDayCourses.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-2">Tidak ada kuliah pada hari ini</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayCourses.map((c) => {
                      const gCalUrl = getGoogleCalendarCourseUrl(c);
                      return (
                        <div
                          key={c.id}
                          className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 space-y-1"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-neutral-900">
                              {c.name}
                            </span>
                            <a
                              href={gCalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-400 hover:text-blue-600 shrink-0"
                              title="Tambah ke Google Calendar"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-600 font-mono tabular-nums">
                            <span>{c.startTime} - {c.endTime}</span>
                            <span>·</span>
                            <span>{c.room}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tasks due on this specific date */}
              <div className="pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Tenggat Tugas ({selectedDayTasks.length})
                </h4>

                {selectedDayTasks.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-2">
                    Tidak ada tenggat tugas pada tanggal ini
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayTasks.map((t) => {
                      const gCalUrl = getGoogleCalendarTaskUrl(t);
                      return (
                        <div
                          key={t.id}
                          className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 space-y-1"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span
                              className={`text-xs font-semibold ${
                                t.status === 'selesai'
                                  ? 'line-through text-neutral-400'
                                  : 'text-neutral-900'
                              }`}
                            >
                              {t.title}
                            </span>
                            <a
                              href={gCalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-400 hover:text-blue-600 shrink-0"
                              title="Tambah Deadline ke Google Calendar"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                            <span>{t.courseName}</span>
                            <span className="tabular-nums">
                              Jam {new Date(t.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <button
              onClick={() => exportToIcsFile(selectedDayCourses, selectedDayTasks, `Agenda_${selectedDateKey}.ics`)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-semibold text-neutral-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              <span>Unduh Agenda Tanggal Ini (.ICS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
