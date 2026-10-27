import React, { useState } from 'react';
import { STUDENT_QUOTES } from '../data/initialData';
import { Quote, RefreshCw, Compass, CheckCircle2 } from 'lucide-react';

export const MotivationWidget: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % STUDENT_QUOTES.length);
  };

  const current = STUDENT_QUOTES[quoteIndex];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left: Study Desk Aesthetic Hero Image */}
        <div className="lg:col-span-5 relative min-h-[180px] lg:min-h-full">
          <img
            src="/src/assets/images/study_desk_hero_1793068763210.jpg"
            alt="Meja Belajar Mahasiswa Produktif"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
              Kapsul Motivasi Harian
            </span>
            <p className="text-sm font-bold leading-tight mt-1">
              "Fokus pada proses hari ini, bukan rasa cemas esok hari."
            </p>
          </div>
        </div>

        {/* Right: Dynamic Quote & Student Productivity Tips */}
        <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Kutipan Inspirasi Mahasiswa
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs text-neutral-500">{current.tag}</span>
              </div>

              <button
                onClick={nextQuote}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
                title="Ganti Kutipan Baru"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quote Body */}
            <div className="py-3">
              <blockquote className="text-sm sm:text-base font-semibold text-neutral-900 leading-relaxed italic">
                "{current.quote}"
              </blockquote>
              <div className="text-xs text-neutral-500 font-medium mt-2">
                — {current.author}
              </div>
            </div>
          </div>

          {/* 3 Quick Actionable Tips for College Students */}
          <div className="pt-3 border-t border-neutral-100">
            <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-neutral-500" />
              <span>Strategi Mengalahkan Rasa Malas (Procrastination)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="font-semibold text-neutral-900">Aturan 5 Menit</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Buka file tugas & kerjakan 5 menit saja. Seringkali otak lanjut tanpa paksaan.
                </div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="font-semibold text-neutral-900">Pecah Sub-tugas</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Tugas 10 lembar menakutkan, tapi mencari 2 referensi sangat mudah dimulai.
                </div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="font-semibold text-neutral-900">Self-Reward</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Selesaikan bab ini, lalu nikmati secangkir es kopi susu favoritmu!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
