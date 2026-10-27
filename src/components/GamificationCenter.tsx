import React, { useState } from 'react';
import { UserStats, Badge, RewardItem } from '../types';
import { LEVEL_TIERS } from '../data/initialData';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Clock,
  Target,
  BookOpen,
  Coffee,
  Tv,
  Gamepad2,
  Utensils,
  Moon,
  Plus,
  CheckCircle2,
  Sparkles,
  Gift
} from 'lucide-react';

interface GamificationCenterProps {
  stats: UserStats;
  badges: Badge[];
  rewards: RewardItem[];
  onClaimReward: (rewardId: string) => void;
  onAddCustomReward: (reward: { title: string; cost: number; icon: string }) => void;
}

export const GamificationCenter: React.FC<GamificationCenterProps> = ({
  stats,
  badges,
  rewards,
  onClaimReward,
  onAddCustomReward,
}) => {
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCost, setCustomCost] = useState(100);
  const [customIcon, setCustomIcon] = useState('Coffee');

  const currentLevelInfo = LEVEL_TIERS.find(
    (tier) => stats.totalExp >= tier.minExp && stats.totalExp <= tier.maxExp
  ) || LEVEL_TIERS[LEVEL_TIERS.length - 1];

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    onAddCustomReward({
      title: customTitle.trim(),
      cost: Number(customCost),
      icon: customIcon,
    });
    setCustomTitle('');
    setCustomCost(100);
    setIsAddRewardOpen(false);
  };

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'Tv':
        return <Tv className="w-5 h-5 text-indigo-600" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-purple-600" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-rose-600" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-blue-600" />;
      default:
        return <Gift className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Target':
        return <Target className="w-5 h-5 text-rose-500" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-emerald-500" />;
      default:
        return <Award className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Hero Overview */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Sistem Poin & Gamifikasi Produktivitas
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl leading-relaxed">
            Dapatkan EXP setiap menyelesaikan tugas harian, belajar dengan timer Pomodoro, dan check-in setiap hari.
            Tukarkan koin poin Anda untuk self-reward tanpa rasa bersalah!
          </p>
        </div>

        {/* Big Balance Counters */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-center min-w-[120px]">
            <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
              Total Pengalaman
            </div>
            <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              {stats.totalExp} <span className="text-xs font-sans text-neutral-500">EXP</span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Level {currentLevelInfo.level}</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-center min-w-[120px]">
            <div className="text-[11px] text-amber-800 font-medium uppercase tracking-wider">
              Poin Self-Reward
            </div>
            <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
              {stats.currentPoints} <span className="text-xs font-sans text-amber-700">Poin</span>
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">Siap ditukarkan</div>
          </div>
        </div>
      </div>

      {/* Section 1: Level Roadmap Hierarchy */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
            Jenjang Tingkatan Mahasiswa
          </h3>
          <p className="text-xs text-neutral-500">
            Tingkatkan status akademikmu dari Mahasiswa Baru hingga Calon Wisudawan Cum Laude
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEVEL_TIERS.map((tier) => {
            const isCurrent = tier.level === currentLevelInfo.level;
            const isPassed = tier.level < currentLevelInfo.level;

            return (
              <div
                key={tier.level}
                className={`p-3.5 rounded-xl border text-center flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm ring-2 ring-neutral-900/10'
                    : isPassed
                    ? 'border-neutral-200 bg-neutral-50/80 text-neutral-700'
                    : 'border-neutral-100 bg-white text-neutral-400 opacity-60'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
                    Level {tier.level}
                  </div>
                  <div
                    className={`text-xs font-bold leading-tight ${
                      isCurrent ? 'text-white' : 'text-neutral-900'
                    }`}
                  >
                    {tier.title}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-200/20 text-[11px] font-mono tabular-nums">
                  {tier.minExp} EXP
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Toko Hadiah Pribadi (Self-Reward Shop) */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              Toko Hadiah Diri Sendiri (Self-Reward Shop)
            </h3>
            <p className="text-xs text-neutral-500">
              Reward kecil setelah menyelesaikan tugas terbukti psikologis meningkatkan motivasi belajar
            </p>
          </div>

          <button
            onClick={() => setIsAddRewardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-semibold text-neutral-800 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Hadiah Baru</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((rew) => {
            const canAfford = stats.currentPoints >= rew.cost;

            return (
              <div
                key={rew.id}
                className="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col justify-between hover:border-neutral-300 transition-all shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                    {getRewardIcon(rew.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                      {rew.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                      <span className="font-mono tabular-nums font-semibold text-amber-800">
                        {rew.cost} Poin
                      </span>
                      <span>·</span>
                      <span>Diklaim {rew.claimedCount}x</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    {canAfford ? 'Koin mencukupi' : `Kurang ${rew.cost - stats.currentPoints} poin`}
                  </span>

                  <button
                    onClick={() => onClaimReward(rew.id)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      canAfford
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    Klaim Hadiah
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Lencana Prestasi (Badges) */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-neutral-900" />
            Lencana Pencapaian Akademik
          </h3>
          <p className="text-xs text-neutral-500">
            Buka lencana khusus dengan konsistensi belajar, ketepatan waktu, dan produktivitas harian
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                badge.unlocked
                  ? 'border-neutral-200 bg-white shadow-xs'
                  : 'border-neutral-100 bg-neutral-50/50 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  badge.unlocked ? 'bg-amber-50 border border-amber-200/80' : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {getBadgeIcon(badge.iconName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-neutral-900 truncate">
                    {badge.title}
                  </h4>
                  {badge.unlocked && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Terbuka
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                  {badge.description}
                </p>

                <div className="text-[10px] text-neutral-400 mt-2 font-mono">
                  {badge.unlocked && badge.unlockedAt
                    ? `Dicapai pada ${badge.unlockedAt}`
                    : `Syarat: ${badge.requirement}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EXP Rules Reference */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-xs text-neutral-700 shadow-xs">
        <h4 className="font-bold text-neutral-900 mb-2">Panduan Perolehan Poin & EXP:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-neutral-200/80">
            <div className="font-bold text-neutral-900">+50 EXP & Poin</div>
            <div className="text-neutral-500 mt-0.5">Menyelesaikan tugas mandiri kuliah</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-neutral-200/80">
            <div className="font-bold text-neutral-900">+100 EXP & Poin</div>
            <div className="text-neutral-500 mt-0.5">Menyelesaikan laporan praktikum / proyek besar</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-neutral-200/80">
            <div className="font-bold text-neutral-900">+25 EXP & Poin</div>
            <div className="text-neutral-500 mt-0.5">Sesi belajar fokus 25 menit (Pomodoro)</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-neutral-200/80">
            <div className="font-bold text-neutral-900">+20 EXP & Poin</div>
            <div className="text-neutral-500 mt-0.5">Check-in harian membuka aplikasi</div>
          </div>
        </div>
      </div>

      {/* Modal Add Custom Reward */}
      {isAddRewardOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                Tambah Hadiah Diri Kustom
              </h3>
              <button
                onClick={() => setIsAddRewardOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nama Hadiah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli Boba Brown Sugar"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Biaya Poin (Penukaran)
                </label>
                <input
                  type="number"
                  min="20"
                  step="10"
                  value={customCost}
                  onChange={(e) => setCustomCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'Coffee', label: 'Kopi' },
                    { id: 'Tv', label: 'Film' },
                    { id: 'Gamepad2', label: 'Game' },
                    { id: 'Utensils', label: 'Makan' },
                    { id: 'Moon', label: 'Tidur' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCustomIcon(item.id)}
                      className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                        customIcon === item.id
                          ? 'border-neutral-900 bg-neutral-100'
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {getRewardIcon(item.id)}
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddRewardOpen(false)}
                  className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Simpan Hadiah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
