import React from 'react';
import { UserStats, Course } from '../types';
import { LEVEL_TIERS } from '../data/initialData';
import { Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';

interface StudentProfileBannerProps {
  stats: UserStats;
  courses: Course[];
  onDailyCheckIn: () => void;
  isCheckedInToday: boolean;
  onOpenEditProfile: () => void;
}

export const StudentProfileBanner: React.FC<StudentProfileBannerProps> = ({
  stats,
  courses,
  onDailyCheckIn,
  isCheckedInToday,
  onOpenEditProfile,
}) => {
  // Find current level
  const currentLevelInfo = LEVEL_TIERS.find(
    (tier) => stats.totalExp >= tier.minExp && stats.totalExp <= tier.maxExp
  ) || LEVEL_TIERS[LEVEL_TIERS.length - 1];

  const nextLevelInfo = LEVEL_TIERS.find((t) => t.level === currentLevelInfo.level + 1);

  const expInCurrentLevel = stats.totalExp - currentLevelInfo.minExp;
  const levelExpRange = nextLevelInfo
    ? nextLevelInfo.minExp - currentLevelInfo.minExp
    : 1000;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((expInCurrentLevel / levelExpRange) * 100))
  );

  const totalSks = courses.reduce((acc, c) => acc + c.sks, 0);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Identity */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <img
              src="/src/assets/images/student_avatar_1793068761992.jpg"
              alt={stats.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-neutral-200 bg-neutral-100 shadow-xs"
              onError={(e) => {
                // Fallback to initials if image path fails
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div
              style={{ display: 'none' }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-neutral-900 text-white font-bold text-2xl flex items-center justify-center border border-neutral-200"
            >
              {stats.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              Lv.{currentLevelInfo.level}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Halo, {stats.name}!
              </h1>
              <button
                onClick={onOpenEditProfile}
                title="Edit Profil Akademik"
                className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors p-1"
              >
                ✎
              </button>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
              <span>{stats.major}</span>
              <span aria-hidden="true">·</span>
              <span>Semester {stats.semester}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Target IPK {stats.targetIpk.toFixed(2)}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                {currentLevelInfo.title}
              </span>
              <span className="text-xs text-neutral-500 font-mono tabular-nums">
                {stats.totalExp} EXP
              </span>
            </div>
          </div>
        </div>

        {/* Center: EXP Level Progress */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between text-xs text-neutral-600 mb-1.5">
            <span className="font-medium flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-neutral-500" />
              Progress Menuju Level {currentLevelInfo.level + 1}
            </span>
            <span className="font-mono tabular-nums font-semibold text-neutral-800">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-neutral-900 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-neutral-500 mt-1 font-mono tabular-nums">
            <span>{stats.totalExp} EXP saat ini</span>
            <span>{nextLevelInfo ? `${nextLevelInfo.minExp} EXP target` : 'Maksimal'}</span>
          </div>
        </div>

        {/* Right: Academic Quick Stats & Check-in button */}
        <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-lg p-2 min-w-[76px]">
              <div className="text-[10px] text-neutral-500 uppercase font-medium">Beban SKS</div>
              <div className="text-base font-bold font-mono text-neutral-900 tabular-nums">
                {totalSks} SKS
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-lg p-2 min-w-[76px]">
              <div className="text-[10px] text-neutral-500 uppercase font-medium">Belajar</div>
              <div className="text-base font-bold font-mono text-neutral-900 tabular-nums">
                {Math.round(stats.totalStudyMinutes / 60)} Jam
              </div>
            </div>
          </div>

          <button
            onClick={onDailyCheckIn}
            disabled={isCheckedInToday}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              isCheckedInToday
                ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isCheckedInToday ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Check-in Sukses</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Klaim +20 EXP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
