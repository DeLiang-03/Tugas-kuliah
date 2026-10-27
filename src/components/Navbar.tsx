import React from 'react';
import { Calendar, CheckSquare, Clock, Trophy, LayoutDashboard, Flame } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'jadwal' | 'tugas' | 'kalender' | 'gamifikasi';
  setActiveTab: (tab: 'dashboard' | 'jadwal' | 'tugas' | 'kalender' | 'gamifikasi') => void;
  streakDays: number;
  currentPoints: number;
  onOpenQuickAdd: () => void;
  onOpenPomodoro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streakDays,
  currentPoints,
  onOpenQuickAdd,
  onOpenPomodoro,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-neutral-800 transition-colors">
              K
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors whitespace-nowrap">
                KuliahKu
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-neutral-500 font-normal">
                Planner Mahasiswa
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean hover underlines) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('jadwal')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'jadwal'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Jadwal Kuliah</span>
          </button>

          <button
            onClick={() => setActiveTab('tugas')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'tugas'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tugas & Proyek</span>
          </button>

          <button
            onClick={() => setActiveTab('kalender')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'kalender'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Integrasi Kalender</span>
          </button>

          <button
            onClick={() => setActiveTab('gamifikasi')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'gamifikasi'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Poin & Motivasi</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Productivity Stats */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Streak indicator */}
          <div
            title="Runtutan Hari Produktif"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold tabular-nums"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{streakDays} Hari</span>
          </div>

          {/* Points indicator */}
          <button
            onClick={() => setActiveTab('gamifikasi')}
            title="Koin Poin Hadiah Diri"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold tabular-nums hover:bg-amber-100 transition-colors"
          >
            <span className="text-amber-500 font-bold">★</span>
            <span>{currentPoints} Poin</span>
          </button>

          {/* Focus Timer Button */}
          <button
            onClick={onOpenPomodoro}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap"
            title="Buka Timer Belajar Pomodoro"
          >
            <Clock className="w-3.5 h-3.5 text-neutral-600" />
            <span>Timer Fokus</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-200 bg-white px-2 py-1.5 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-md ${activeTab === 'dashboard' ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Dasbor</span>
        </button>
        <button
          onClick={() => setActiveTab('jadwal')}
          className={`flex flex-col items-center py-1 px-2 rounded-md ${activeTab === 'jadwal' ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Jadwal</span>
        </button>
        <button
          onClick={() => setActiveTab('tugas')}
          className={`flex flex-col items-center py-1 px-2 rounded-md ${activeTab === 'tugas' ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}
        >
          <CheckSquare className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Tugas</span>
        </button>
        <button
          onClick={() => setActiveTab('kalender')}
          className={`flex flex-col items-center py-1 px-2 rounded-md ${activeTab === 'kalender' ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Kalender</span>
        </button>
        <button
          onClick={() => setActiveTab('gamifikasi')}
          className={`flex flex-col items-center py-1 px-2 rounded-md ${activeTab === 'gamifikasi' ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] mt-0.5">Poin</span>
        </button>
      </div>
    </header>
  );
};
