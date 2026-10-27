import React, { useState, useEffect } from 'react';
import { playTimerDoneSound } from '../utils/audio';
import { Play, Pause, RotateCcw, X, Clock, Coffee, Sparkles } from 'lucide-react';

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete: (durationMinutes: number) => void;
}

type Mode = 'fokus' | 'istirahat_singkat' | 'istirahat_panjang';

const MODE_CONFIG: Record<Mode, { name: string; minutes: number; exp: number }> = {
  fokus: { name: 'Sesi Fokus Belajar', minutes: 25, exp: 25 },
  istirahat_singkat: { name: 'Istirahat Singkat', minutes: 5, exp: 0 },
  istirahat_panjang: { name: 'Istirahat Panjang', minutes: 15, exp: 0 },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  isOpen,
  onClose,
  onSessionComplete,
}) => {
  const [mode, setMode] = useState<Mode>('fokus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_CONFIG.fokus.minutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Switch mode
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].minutes * 60);
    setIsRunning(false);
  };

  // Timer interval effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playTimerDoneSound();

      if (mode === 'fokus') {
        onSessionComplete(MODE_CONFIG.fokus.minutes);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, onSessionComplete]);

  if (!isOpen) return null;

  const totalSeconds = MODE_CONFIG[mode].minutes * 60;
  const progressPercent = Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_CONFIG[mode].minutes * 60);
  };

  // SVG circular timer properties
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative border border-neutral-100 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
          title="Tutup Timer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Teknik Pomodoro Mahasiswa</span>
          </div>
          <h3 className="text-base font-bold text-neutral-900 mt-0.5">
            {MODE_CONFIG[mode].name}
          </h3>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl mb-6 text-xs">
          <button
            onClick={() => handleModeChange('fokus')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mode === 'fokus'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Fokus 25m
          </button>
          <button
            onClick={() => handleModeChange('istirahat_singkat')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mode === 'istirahat_singkat'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Istirahat 5m
          </button>
          <button
            onClick={() => handleModeChange('istirahat_panjang')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mode === 'istirahat_panjang'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Rehat 15m
          </button>
        </div>

        {/* Circular Countdown Progress */}
        <div className="relative w-52 h-52 flex items-center justify-center mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-neutral-100"
              strokeWidth="10"
              fill="none"
            />
            {/* Active animated progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className={`transition-all duration-500 ease-linear ${
                mode === 'fokus' ? 'stroke-neutral-900' : 'stroke-emerald-500'
              }`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-neutral-900 tabular-nums">
              {formattedTime}
            </span>
            <span className="text-xs text-neutral-500 font-medium mt-1">
              {isRunning ? 'Sedang Berjalan' : timeLeft === 0 ? 'Sesi Selesai!' : 'Siap Mulai'}
            </span>
          </div>
        </div>

        {/* Controls: Play, Pause, Reset */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={resetTimer}
            className="p-3 text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors"
            title="Reset Waktu"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white shadow-md transition-all ${
              isRunning
                ? 'bg-neutral-800 hover:bg-neutral-700'
                : 'bg-neutral-900 hover:bg-neutral-800 scale-105'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white ml-0.5" />
                <span>{timeLeft === 0 ? 'Ulangi' : 'Mulai Fokus'}</span>
              </>
            )}
          </button>
        </div>

        {/* Motivational Tip Strip */}
        <div className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center text-xs text-neutral-600">
          {mode === 'fokus' ? (
            <div className="flex items-center justify-center gap-1.5 text-neutral-800 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Selesaikan 1 sesi = Dapatkan +25 EXP & 25 Poin</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-medium">
              <Coffee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Minum air putih, renggangkan punggung & leher!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
