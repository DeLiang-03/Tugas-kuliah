import React, { useState } from 'react';
import { Course, DayOfWeek } from '../types';
import { getIndonesianDayName } from '../utils/smartReminders';
import { getGoogleCalendarCourseUrl, exportToIcsFile } from '../utils/calendarExport';
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  User,
  Video,
  Download,
  Trash2,
  Edit2,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface ScheduleTimetableProps {
  courses: Course[];
  onAddCourse: (course: Omit<Course, 'id'>) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const ScheduleTimetable: React.FC<ScheduleTimetableProps> = ({
  courses,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
}) => {
  const [viewMode, setViewMode] = useState<'hari_ini' | 'mingguan'>('hari_ini');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [sks, setSks] = useState(3);
  const [day, setDay] = useState<DayOfWeek>('Senin');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:30');
  const [room, setRoom] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [onlineLink, setOnlineLink] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const todayDay = getIndonesianDayName(new Date()) as DayOfWeek;

  const totalSks = courses.reduce((acc, c) => acc + c.sks, 0);

  const openAddModal = () => {
    setEditingCourse(null);
    setCode('');
    setName('');
    setLecturer('');
    setSks(3);
    setDay(DAYS_OF_WEEK.includes(todayDay) ? todayDay : 'Senin');
    setStartTime('08:00');
    setEndTime('10:30');
    setRoom('Ruang Teori R.301');
    setIsOnline(false);
    setOnlineLink('');
    setColor('#3B82F6');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setCode(c.code);
    setName(c.name);
    setLecturer(c.lecturer);
    setSks(c.sks);
    setDay(c.day);
    setStartTime(c.startTime);
    setEndTime(c.endTime);
    setRoom(c.room);
    setIsOnline(c.isOnline);
    setOnlineLink(c.onlineLink || '');
    setColor(c.color);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCourse) {
      onUpdateCourse({
        ...editingCourse,
        code: code.trim().toUpperCase() || 'MK001',
        name: name.trim(),
        lecturer: lecturer.trim() || 'Dosen Pengampu',
        sks: Number(sks),
        day,
        startTime,
        endTime,
        room: room.trim() || 'Ruang Kuliah',
        isOnline,
        onlineLink: isOnline ? onlineLink.trim() : undefined,
        color,
      });
    } else {
      onAddCourse({
        code: code.trim().toUpperCase() || 'MK001',
        name: name.trim(),
        lecturer: lecturer.trim() || 'Dosen Pengampu',
        sks: Number(sks),
        day,
        startTime,
        endTime,
        room: room.trim() || 'Ruang Kuliah',
        isOnline,
        onlineLink: isOnline ? onlineLink.trim() : undefined,
        color,
      });
    }
    setIsModalOpen(false);
  };

  // Helper to determine status today
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getCourseLiveStatus = (course: Course) => {
    if (course.day !== todayDay) return null;
    const [startH, startM] = course.startTime.split(':').map(Number);
    const [endH, endM] = course.endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (currentMinutes >= startMin && currentMinutes <= endMin) {
      return { label: 'Sedang Berlangsung', color: 'bg-emerald-500 text-white animate-pulse' };
    }
    if (currentMinutes < startMin) {
      const diff = startMin - currentMinutes;
      return { label: `Akan datang (${diff} mnt lagi)`, color: 'bg-blue-50 text-blue-700 border border-blue-200' };
    }
    return { label: 'Selesai Hari Ini', color: 'bg-neutral-100 text-neutral-500' };
  };

  const todaysCourses = courses
    .filter((c) => c.day === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const filteredCourses = selectedDayFilter === 'all'
    ? courses
    : courses.filter((c) => c.day === selectedDayFilter);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-900" />
            Jadwal Kuliah & Beban SKS Semester
          </h2>
          <p className="text-xs text-neutral-500">
            Pantau ruang kuliah, nama dosen, dan tautan kelas online dengan mudah
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportToIcsFile(courses, [])}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            title="Download file .ICS untuk Apple Calendar / Outlook / Google Calendar"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor .ICS</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      </div>

      {/* SKS Summary Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center font-bold text-neutral-800">
            🎓
          </div>
          <div>
            <div className="text-xs text-neutral-500">Total Kredit Semester Aktif</div>
            <div className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span className="font-mono tabular-nums">{totalSks} SKS</span>
              <span className="text-xs font-normal text-neutral-400">
                (Batas Maks. 24 SKS)
              </span>
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-1 bg-neutral-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('hari_ini')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'hari_ini'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Hari Ini ({todayDay})
          </button>
          <button
            onClick={() => setViewMode('mingguan')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'mingguan'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Matriks Mingguan (Senin - Sabtu)
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Agenda Hari Ini */}
      {viewMode === 'hari_ini' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-800">
              Agenda Kuliah Hari Ini ({todayDay})
            </h3>
            <span className="text-xs text-neutral-500">
              {todaysCourses.length} mata kuliah terjadwal
            </span>
          </div>

          {todaysCourses.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-xs">
              <p className="text-sm font-semibold text-neutral-800">
                Tidak ada jadwal kuliah hari ini! 🎉
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Gunakan waktu luang hari ini untuk mencicil tugas atau beristirahat.
              </p>
              <button
                onClick={() => setViewMode('mingguan')}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Lihat Jadwal Hari Lainnya →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todaysCourses.map((c) => {
                const liveStatus = getCourseLiveStatus(c);
                const gCalUrl = getGoogleCalendarCourseUrl(c);

                return (
                  <div
                    key={c.id}
                    className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="text-xs font-mono font-semibold text-neutral-500">
                            {c.code}
                          </span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span className="text-xs font-semibold text-neutral-700 font-mono">
                            {c.sks} SKS
                          </span>
                        </div>

                        {liveStatus && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${liveStatus.color}`}>
                            {liveStatus.label}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-neutral-900 tracking-tight">
                        {c.name}
                      </h4>

                      <div className="space-y-1.5 mt-3 text-xs text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="font-mono tabular-nums font-semibold text-neutral-800">
                            {c.startTime} - {c.endTime} WIB
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{c.lecturer}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{c.room}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      {c.isOnline && c.onlineLink ? (
                        <a
                          href={c.onlineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Masuk Google Meet</span>
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-400">Tatap Muka Luring</span>
                      )}

                      <div className="flex items-center gap-1">
                        <a
                          href={gCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-md transition-colors"
                          title="Sinkronkan jadwal mingguan ke Google Calendar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCourse(c.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Matriks Mingguan (Senin s/d Sabtu) */}
      {viewMode === 'mingguan' && (
        <div className="space-y-4">
          {/* Day Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedDayFilter === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              Semua Hari ({courses.length})
            </button>
            {DAYS_OF_WEEK.map((d) => {
              const dayCourses = courses.filter((c) => c.day === d);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDayFilter(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedDayFilter === d
                      ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {d} ({dayCourses.length})
                </button>
              );
            })}
          </div>

          {/* Grid Layout by Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.filter((d) => selectedDayFilter === 'all' || selectedDayFilter === d).map(
              (d) => {
                const dayCourses = courses
                  .filter((c) => c.day === d)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                const isToday = d === todayDay;

                return (
                  <div
                    key={d}
                    className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between ${
                      isToday ? 'border-neutral-900 ring-1 ring-neutral-900/10' : 'border-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-neutral-900">{d}</h4>
                          {isToday && (
                            <span className="text-[10px] bg-neutral-900 text-white font-bold px-1.5 py-0.5 rounded-sm">
                              HARI INI
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-500 font-mono tabular-nums">
                          {dayCourses.reduce((sum, c) => sum + c.sks, 0)} SKS
                        </span>
                      </div>

                      {dayCourses.length === 0 ? (
                        <p className="text-xs text-neutral-400 py-6 text-center">
                          Tidak ada kuliah terjadwal
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {dayCourses.map((c) => {
                            const gCalUrl = getGoogleCalendarCourseUrl(c);
                            return (
                              <div
                                key={c.id}
                                className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/60 hover:bg-neutral-50 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <span className="text-xs font-bold text-neutral-900 truncate">
                                    {c.name}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <a
                                      href={gCalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-neutral-400 hover:text-blue-600"
                                      title="Google Calendar"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                      onClick={() => openEditModal(c)}
                                      className="text-neutral-400 hover:text-neutral-800"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-[11px] text-neutral-600 space-y-0.5 font-mono tabular-nums">
                                  <div>
                                    {c.startTime} - {c.endTime} · {c.sks} SKS
                                  </div>
                                  <div className="truncate font-sans text-neutral-500">
                                    {c.room}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {editingCourse ? 'Edit Jadwal Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Kode Mata Kuliah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: CS3101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono uppercase focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Nama Mata Kuliah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemrograman Web Lanjut"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    placeholder="Nama dosen & gelar"
                    value={lecturer}
                    onChange={(e) => setLecturer(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Bobot SKS
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={sks}
                    onChange={(e) => setSks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Hari Kuliah *
                  </label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Ruang Kuliah / Laboratorium
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gedung A R.304"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Warna Penanda
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'].map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          color === col ? 'border-neutral-900 scale-110' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900"
                  />
                  <span className="font-semibold text-neutral-700">
                    Kelas diselenggarakan secara daring (Online/Hybrid)
                  </span>
                </label>

                {isOnline && (
                  <div>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx atau link Zoom..."
                      value={onlineLink}
                      onChange={(e) => setOnlineLink(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  {editingCourse ? 'Simpan Perubahan' : 'Tambah ke Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
