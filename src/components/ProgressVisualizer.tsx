import React from 'react';
import { Task, Course } from '../types';
import { CheckCircle2, AlertCircle, BarChart3, TrendingUp, Clock, BookOpen } from 'lucide-react';

interface ProgressVisualizerProps {
  tasks: Task[];
  courses: Course[];
}

export const ProgressVisualizer: React.FC<ProgressVisualizerProps> = ({ tasks, courses }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'selesai').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'sedang_dikerjakan').length;
  const notStartedTasks = tasks.filter((t) => t.status === 'belum_dimulai').length;

  const now = new Date().getTime();
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'selesai' && new Date(t.deadline).getTime() < now
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Donut SVG parameters
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  const calcDash = (count: number) => {
    if (totalTasks === 0) return '0 999';
    const percent = count / totalTasks;
    const len = percent * circumference;
    return `${len} ${circumference - len}`;
  };

  const completedLen = totalTasks > 0 ? (completedTasks / totalTasks) * circumference : 0;
  const inProgressLen = totalTasks > 0 ? (inProgressTasks / totalTasks) * circumference : 0;
  const notStartedLen = totalTasks > 0 ? (notStartedTasks / totalTasks) * circumference : 0;

  const inProgressOffset = -completedLen;
  const notStartedOffset = -(completedLen + inProgressLen);

  // Weekly Activity Simulation (Mon - Sun) based on tasks completed or deadlines
  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const weeklyTaskData = [
    { day: 'Sen', completed: 2, hours: 3.5 },
    { day: 'Sel', completed: 1, hours: 2.0 },
    { day: 'Rab', completed: 3, hours: 4.5 },
    { day: 'Kam', completed: 2, hours: 3.0 },
    { day: 'Jum', completed: 1, hours: 1.5 },
    { day: 'Sab', completed: 4, hours: 5.0 },
    { day: 'Min', completed: 2, hours: 2.5 },
  ];
  const maxWeeklyHours = Math.max(...weeklyTaskData.map((d) => d.hours), 6);

  // Course Workload Calculation
  const courseWorkload = courses.map((c) => {
    const courseTasks = tasks.filter((t) => t.courseId === c.id);
    const active = courseTasks.filter((t) => t.status !== 'selesai').length;
    const completed = courseTasks.filter((t) => t.status === 'selesai').length;
    return {
      course: c,
      activeCount: active,
      completedCount: completed,
      total: courseTasks.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* 4 Quick KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Tingkat Kelulusan Tugas</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tabular-nums">
              {completionRate}%
            </span>
            <span className="text-xs text-neutral-500">
              ({completedTasks}/{totalTasks} tugas)
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Tugas Berjalan & Deadline</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tabular-nums">
              {inProgressTasks + notStartedTasks}
            </span>
            <span className="text-xs text-neutral-500">aktif</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            {inProgressTasks} sedang dikerjakan · {notStartedTasks} belum dibuka
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Tugas Lewat Tenggat</span>
            <AlertCircle className={`w-4 h-4 ${overdueTasks > 0 ? 'text-rose-600' : 'text-neutral-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${overdueTasks > 0 ? 'text-rose-600' : 'text-neutral-900'}`}>
              {overdueTasks}
            </span>
            <span className="text-xs text-neutral-500">tugas</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            {overdueTasks === 0 ? 'Semua tugas terkendali dengan baik' : 'Prioritaskan sekarang juga!'}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Rata-rata Waktu Tugas</span>
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tabular-nums">
              {tasks.length > 0
                ? Math.round(tasks.reduce((a, b) => a + (b.estimatedMinutes || 60), 0) / tasks.length)
                : 0}
            </span>
            <span className="text-xs text-neutral-500">menit/tugas</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Est. total {Math.round(tasks.reduce((a, b) => a + (b.estimatedMinutes || 60), 0) / 60)} jam studi
          </p>
        </div>
      </div>

      {/* Main Charts Grid: Donut + Weekly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Donut Chart - Status Distribusi */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Status Distribusi Tugas
                </h3>
                <p className="text-xs text-neutral-500">
                  Visualisasi proporsi tugas mahasiswa semester ini
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                  {/* Background Track */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    className="stroke-neutral-100"
                    strokeWidth="14"
                    fill="none"
                  />
                  {/* Completed Segment (Emerald) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    className="stroke-emerald-500 transition-all duration-700 ease-out"
                    strokeWidth="14"
                    strokeDasharray={calcDash(completedTasks)}
                    strokeDashoffset="0"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* In Progress Segment (Blue) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    className="stroke-blue-500 transition-all duration-700 ease-out"
                    strokeWidth="14"
                    strokeDasharray={calcDash(inProgressTasks)}
                    strokeDashoffset={inProgressOffset}
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Not Started Segment (Amber) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    className="stroke-amber-400 transition-all duration-700 ease-out"
                    strokeWidth="14"
                    strokeDasharray={calcDash(notStartedTasks)}
                    strokeDashoffset={notStartedOffset}
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
                    {completionRate}%
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">Selesai</span>
                </div>
              </div>

              {/* Legend with exact numbers */}
              <div className="space-y-2 text-xs w-full max-w-[190px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" />
                    <span className="text-neutral-700">Selesai</span>
                  </div>
                  <span className="font-mono font-semibold tabular-nums text-neutral-900">
                    {completedTasks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-blue-500 shrink-0" />
                    <span className="text-neutral-700">Dikerjakan</span>
                  </div>
                  <span className="font-mono font-semibold tabular-nums text-neutral-900">
                    {inProgressTasks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-amber-400 shrink-0" />
                    <span className="text-neutral-700">Belum Mulai</span>
                  </div>
                  <span className="font-mono font-semibold tabular-nums text-neutral-900">
                    {notStartedTasks}
                  </span>
                </div>
                {overdueTasks > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-rose-500 shrink-0" />
                      <span className="text-rose-700 font-semibold">Overdue</span>
                    </div>
                    <span className="font-mono font-semibold tabular-nums text-rose-700">
                      {overdueTasks}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Total Beban Tugas Terdata</span>
            <span className="font-mono font-semibold text-neutral-900 tabular-nums">
              {totalTasks} Tugas
            </span>
          </div>
        </div>

        {/* Right: Weekly Activity Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Tren Produktivitas Belajar Mingguan
                </h3>
                <p className="text-xs text-neutral-500">
                  Estimasi jam fokus & akumulasi tugas terselesaikan per hari
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-neutral-900" />
                  <span>Jam Fokus</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>Tugas Beres</span>
                </div>
              </div>
            </div>

            {/* Custom Bar Chart Canvas */}
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-neutral-100">
              {weeklyTaskData.map((item, idx) => {
                const heightPercent = Math.round((item.hours / maxWeeklyHours) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono tabular-nums bg-neutral-900 text-white px-1.5 py-0.5 rounded-md whitespace-nowrap -translate-y-1">
                      {item.hours}h · {item.completed} tugas
                    </div>

                    {/* Bar pair container */}
                    <div className="w-full flex items-end justify-center gap-1 h-32">
                      {/* Hours Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-4 sm:w-6 bg-neutral-900 rounded-t-sm group-hover:bg-neutral-700 transition-all duration-300"
                        title={`${item.day}: ${item.hours} jam belajar`}
                      />
                      {/* Completed tasks mini-bar */}
                      <div
                        style={{ height: `${Math.min(100, item.completed * 25)}%` }}
                        className="w-2 sm:w-2.5 bg-emerald-500 rounded-t-sm group-hover:bg-emerald-400 transition-all duration-300"
                        title={`${item.day}: ${item.completed} tugas selesai`}
                      />
                    </div>

                    <span className="text-xs font-medium text-neutral-600 font-mono">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs text-neutral-500">
            <span>Minggu Ini: 7 hari aktif</span>
            <span className="font-mono tabular-nums text-neutral-800 font-medium">
              Total 22.5 Jam Fokus · 15 Tugas
            </span>
          </div>
        </div>
      </div>

      {/* Course Workload Distribution Matrix */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-neutral-700" />
              Distribusi Beban Tugas per Mata Kuliah
            </h3>
            <p className="text-xs text-neutral-500">
              Mengetahui mata kuliah dengan beban tugas aktif terbanyak untuk alokasi prioritas
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {courseWorkload.map((cw) => {
            const coursePercent = totalTasks > 0 ? Math.round((cw.total / totalTasks) * 100) : 0;
            return (
              <div key={cw.course.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cw.course.color }}
                    />
                    <span className="font-semibold text-neutral-900">{cw.course.name}</span>
                    <span className="text-neutral-400">({cw.course.code} · {cw.course.sks} SKS)</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums text-neutral-600">
                    <span>
                      <strong className="text-neutral-900">{cw.activeCount}</strong> aktif
                    </span>
                    <span>/</span>
                    <span>{cw.completedCount} selesai</span>
                  </div>
                </div>

                {/* Stacked Progress Bar */}
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden flex">
                  {cw.total > 0 && (
                    <>
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(cw.completedCount / cw.total) * 100}%` }}
                        title={`${cw.completedCount} selesai`}
                      />
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${(cw.activeCount / cw.total) * 100}%` }}
                        title={`${cw.activeCount} aktif`}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
