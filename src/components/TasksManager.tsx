import React, { useState } from 'react';
import { Task, Course, Priority, TaskCategory, TaskStatus } from '../types';
import { formatDeadlineRelative } from '../utils/smartReminders';
import { getGoogleCalendarTaskUrl } from '../utils/calendarExport';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  CheckSquare
} from 'lucide-react';

interface TasksManagerProps {
  tasks: Task[];
  courses: Course[];
  onAddTask: (task: Omit<Task, 'id' | 'expAwarded'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  filterUrgentDefault?: boolean;
}

export const TasksManager: React.FC<TasksManagerProps> = ({
  tasks,
  courses,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleStatus,
  onToggleSubtask,
  filterUrgentDefault = false,
}) => {
  const [filterTab, setFilterTab] = useState<'semua' | 'urgent' | 'hari_ini' | 'belum_selesai' | 'selesai'>(
    filterUrgentDefault ? 'urgent' : 'semua'
  );
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);

  // Modal State for adding/editing task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('sedang');
  const [formCategory, setFormCategory] = useState<TaskCategory>('tugas_mandiri');
  const [formEstimatedMin, setFormEstimatedMin] = useState(60);
  const [formNotes, setFormNotes] = useState('');
  const [formSubtasks, setFormSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const openAddModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormCourseId(courses[0]?.id || '');
    // Default deadline: tomorrow at 23:59
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    setFormDeadline(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T23:59`);
    setFormPriority('sedang');
    setFormCategory('tugas_mandiri');
    setFormEstimatedMin(60);
    setFormNotes('');
    setFormSubtasks([
      { id: `st-init-1`, title: 'Cari referensi materi & bahan studi', completed: false },
      { id: `st-init-2`, title: 'Susun draf pengerjaan & implementasi', completed: false },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormCourseId(task.courseId);
    setFormDeadline(task.deadline);
    setFormPriority(task.priority);
    setFormCategory(task.category);
    setFormEstimatedMin(task.estimatedMinutes);
    setFormNotes(task.notes || '');
    setFormSubtasks(task.subtasks || []);
    setIsModalOpen(true);
  };

  const handleAddSubtaskItem = () => {
    if (!newSubtaskInput.trim()) return;
    setFormSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, title: newSubtaskInput.trim(), completed: false },
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtaskItem = (subId: string) => {
    setFormSubtasks((prev) => prev.filter((s) => s.id !== subId));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const matchedCourse = courses.find((c) => c.id === formCourseId);
    const courseName = matchedCourse ? matchedCourse.name : 'Mata Kuliah Umum';

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: formTitle.trim(),
        courseId: formCourseId,
        courseName,
        deadline: formDeadline,
        priority: formPriority,
        category: formCategory,
        estimatedMinutes: formEstimatedMin,
        notes: formNotes.trim(),
        subtasks: formSubtasks,
      });
    } else {
      onAddTask({
        title: formTitle.trim(),
        courseId: formCourseId,
        courseName,
        deadline: formDeadline,
        priority: formPriority,
        category: formCategory,
        estimatedMinutes: formEstimatedMin,
        notes: formNotes.trim(),
        status: 'belum_dimulai',
        subtasks: formSubtasks,
      });
    }
    setIsModalOpen(false);
  };

  // Filter Tasks
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

  const filteredTasks = tasks.filter((task) => {
    // Tab filter
    if (filterTab === 'belum_selesai' && task.status === 'selesai') return false;
    if (filterTab === 'selesai' && task.status !== 'selesai') return false;
    if (filterTab === 'urgent') {
      const diffHours = (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
      if (task.status === 'selesai' || diffHours > 48) return false;
    }
    if (filterTab === 'hari_ini') {
      if (!task.deadline.startsWith(todayStr)) return false;
    }

    // Course filter
    if (courseFilter !== 'all' && task.courseId !== courseFilter) return false;

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchCourse = task.courseName.toLowerCase().includes(q);
      if (!matchTitle && !matchCourse) return false;
    }

    return true;
  });

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'tinggi':
        return 'text-rose-700 bg-rose-50 border border-rose-200';
      case 'sedang':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'rendah':
        return 'text-neutral-700 bg-neutral-100 border border-neutral-200';
    }
  };

  const getCategoryLabel = (cat: TaskCategory) => {
    switch (cat) {
      case 'tugas_mandiri':
        return 'Tugas Mandiri';
      case 'tugas_kelompok':
        return 'Tugas Kelompok';
      case 'praktikum':
        return 'Laporan Praktikum';
      case 'quiz_ujian':
        return 'Kuis / Ujian';
      case 'proyek_akhir':
        return 'Proyek Akhir';
      default:
        return 'Lainnya';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-neutral-900" />
            Manajemen Tugas & Proyek Kuliah
          </h2>
          <p className="text-xs text-neutral-500">
            Kelola tenggat waktu, checklist sub-tugas, dan kumpulkan poin setiap kali tugas tuntas
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterTab('semua')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterTab === 'semua'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Semua ({tasks.length})
          </button>
          <button
            onClick={() => setFilterTab('urgent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterTab === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Mendesak &lt; 48 Jam
          </button>
          <button
            onClick={() => setFilterTab('hari_ini')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterTab === 'hari_ini'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Deadline Hari Ini
          </button>
          <button
            onClick={() => setFilterTab('belum_selesai')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterTab === 'belum_selesai'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Belum Selesai ({tasks.filter((t) => t.status !== 'selesai').length})
          </button>
          <button
            onClick={() => setFilterTab('selesai')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterTab === 'selesai'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Selesai ({tasks.filter((t) => t.status === 'selesai').length})
          </button>
        </div>

        {/* Search & Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari judul tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-neutral-50/50 focus:outline-hidden focus:border-neutral-400"
            />
          </div>

          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-hidden focus:border-neutral-400 text-neutral-700"
            >
              <option value="all">Semua Mata Kuliah</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-hidden focus:border-neutral-400 text-neutral-700"
            >
              <option value="all">Semua Tingkat Prioritas</option>
              <option value="tinggi">Prioritas Tinggi</option>
              <option value="sedang">Prioritas Sedang</option>
              <option value="rendah">Prioritas Rendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-xs">
            <p className="text-sm font-semibold text-neutral-800">Tidak ada tugas ditemukan</p>
            <p className="text-xs text-neutral-500 mt-1">
              {searchQuery || courseFilter !== 'all' || priorityFilter !== 'all'
                ? 'Coba sesuaikan filter atau kata kunci pencarian Anda.'
                : 'Hebat! Semua tugas pada filter ini telah tuntas.'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Tugas Baru</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'selesai';
            const isExpanded = expandedTaskIds.includes(task.id);
            const { text: deadlineText, isOverdue } = formatDeadlineRelative(task.deadline);
            const matchedCourse = courses.find((c) => c.id === task.courseId);

            const subtasksCompletedCount = task.subtasks.filter((s) => s.completed).length;
            const subtasksTotalCount = task.subtasks.length;
            const subtaskProgress =
              subtasksTotalCount > 0
                ? Math.round((subtasksCompletedCount / subtasksTotalCount) * 100)
                : 0;

            const gCalUrl = getGoogleCalendarTaskUrl(task);

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-xl p-4 sm:p-5 shadow-xs transition-all ${
                  isCompleted
                    ? 'border-neutral-200/60 bg-neutral-50/50 opacity-80'
                    : isOverdue
                    ? 'border-rose-200 hover:border-rose-300'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Status Checkbox Button */}
                  <button
                    onClick={() => onToggleStatus(task.id)}
                    className="mt-0.5 shrink-0 text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-hidden"
                    title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai (+EXP)'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : task.status === 'sedang_dikerjakan' ? (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-300 hover:text-neutral-500" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                      {/* Course badge with color indicator */}
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: matchedCourse?.color || '#6B7280' }}
                        />
                        <span>{task.courseName}</span>
                      </span>

                      <span className="text-neutral-300" aria-hidden="true">·</span>

                      {/* Category */}
                      <span className="text-xs text-neutral-500">
                        {getCategoryLabel(task.category)}
                      </span>

                      <span className="text-neutral-300" aria-hidden="true">·</span>

                      {/* Priority */}
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${getPriorityStyle(task.priority)}`}>
                        Prioritas {task.priority.toUpperCase()}
                      </span>
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold text-neutral-900 tracking-tight leading-snug ${
                        isCompleted ? 'line-through text-neutral-400' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed line-clamp-2">
                        {task.notes}
                      </p>
                    )}

                    {/* Metadata strip: Deadline, Subtask meter, EXP */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500 mt-3 pt-2.5 border-t border-neutral-100">
                      {/* Deadline */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono tabular-nums">
                          {new Date(task.deadline).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span
                          className={`font-semibold font-mono tabular-nums ${
                            isOverdue
                              ? 'text-rose-600'
                              : isCompleted
                              ? 'text-neutral-400'
                              : 'text-amber-700'
                          }`}
                        >
                          ({deadlineText})
                        </span>
                      </div>

                      {/* Subtask count */}
                      {subtasksTotalCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono tabular-nums">
                            {subtasksCompletedCount}/{subtasksTotalCount} checklist ({subtaskProgress}%)
                          </span>
                        </div>
                      )}

                      {/* Estimated time */}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono tabular-nums">~{task.estimatedMinutes} menit</span>
                      </div>

                      {/* EXP Reward */}
                      <div className="flex items-center gap-1 text-amber-700 font-semibold font-mono tabular-nums">
                        <span>★ +{task.expAwarded} EXP</span>
                      </div>
                    </div>

                    {/* Subtasks checklist accordion */}
                    {task.subtasks.length > 0 && isExpanded && (
                      <div className="mt-3.5 pt-3 border-t border-neutral-100 space-y-2 bg-neutral-50/70 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-neutral-700 mb-2">
                          Langkah / Checklist Tugas:
                        </div>
                        {task.subtasks.map((st) => (
                          <label
                            key={st.id}
                            className="flex items-start gap-2.5 text-xs text-neutral-700 cursor-pointer hover:text-neutral-900 group"
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => onToggleSubtask(task.id, st.id)}
                              className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-0"
                            />
                            <span className={st.completed ? 'line-through text-neutral-400' : ''}>
                              {st.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Column */}
                  <div className="flex items-center gap-1 shrink-0">
                    {task.subtasks.length > 0 && (
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
                        title={isExpanded ? 'Sembunyikan checklist' : 'Lihat checklist'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <a
                      href={gCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-md transition-colors"
                      title="Tambahkan Deadline ke Google Calendar"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-md transition-colors"
                      title="Edit Tugas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md transition-colors"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {editingTask ? 'Edit Tugas Kuliah' : 'Tambah Tugas Kuliah Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Judul Tugas / Proyek *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Implementasi JWT API & Postman Collection"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Mata Kuliah Terkait *
                  </label>
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Kategori Tugas
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="tugas_mandiri">Tugas Mandiri</option>
                    <option value="tugas_kelompok">Tugas Kelompok</option>
                    <option value="praktikum">Laporan Praktikum</option>
                    <option value="quiz_ujian">Persiapan Kuis / Ujian</option>
                    <option value="proyek_akhir">Proyek Akhir / Makalah</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Tenggat Waktu (Deadline) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Prioritas
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="tinggi">Tinggi (Urgent)</option>
                    <option value="sedang">Sedang</option>
                    <option value="rendah">Rendah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Estimasi Durasi Pengerjaan (Menit)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={formEstimatedMin}
                  onChange={(e) => setFormEstimatedMin(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Catatan / Instruksi dari Dosen
                </label>
                <textarea
                  rows={2}
                  placeholder="Format file pengumpulan, rubrik penilaian, atau tautan referensi..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              {/* Subtask list management */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="block font-semibold text-neutral-700 mb-1">
                  Langkah Sub-Tugas (Checklist)
                </label>
                <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
                  {formSubtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-neutral-50 rounded-md border border-neutral-200/80"
                    >
                      <span className="text-neutral-800">{st.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtaskItem(st.id)}
                        className="text-neutral-400 hover:text-rose-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tambah langkah checklist baru..."
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtaskItem();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtaskItem}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold"
                  >
                    + Tambah
                  </button>
                </div>
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
                  {editingTask ? 'Simpan Perubahan' : 'Buat Tugas (+Poin EXP)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
