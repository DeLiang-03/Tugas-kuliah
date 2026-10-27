import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Course,
  Task,
  Badge,
  RewardItem,
  UserStats,
  SmartReminderItem,
} from './types';
import {
  INITIAL_USER_STATS,
  INITIAL_COURSES,
  INITIAL_TASKS,
  INITIAL_BADGES,
  INITIAL_REWARDS,
  LEVEL_TIERS,
} from './data/initialData';
import { playTaskCompleteSound, playLevelUpSound } from './utils/audio';
import { generateSmartReminders } from './utils/smartReminders';

import { Navbar } from './components/Navbar';
import { StudentProfileBanner } from './components/StudentProfileBanner';
import { SmartAlerts } from './components/SmartAlerts';
import { ProgressVisualizer } from './components/ProgressVisualizer';
import { TasksManager } from './components/TasksManager';
import { ScheduleTimetable } from './components/ScheduleTimetable';
import { CalendarView } from './components/CalendarView';
import { GamificationCenter } from './components/GamificationCenter';
import { PomodoroTimer } from './components/PomodoroTimer';
import { MotivationWidget } from './components/MotivationWidget';
import { EditProfileModal } from './components/EditProfileModal';

import {
  CheckSquare,
  Clock,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'jadwal' | 'tugas' | 'kalender' | 'gamifikasi'
  >('dashboard');

  // Persistent State
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('kuliahku_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USER_STATS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('kuliahku_courses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COURSES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('kuliahku_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TASKS;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('kuliahku_badges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BADGES;
  });

  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    const saved = localStorage.getItem('kuliahku_rewards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_REWARDS;
  });

  // Modal controls
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'course'>('task');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kuliahku_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('kuliahku_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('kuliahku_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('kuliahku_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('kuliahku_rewards', JSON.stringify(rewards));
  }, [rewards]);

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const isCheckedInToday = stats.lastActiveDate === todayStr;

  // Calculate Smart Reminders
  const smartReminders = useMemo(() => {
    return generateSmartReminders(courses, tasks);
  }, [courses, tasks]);

  // Helper: check level up
  const checkLevelUp = (oldExp: number, newExp: number) => {
    const oldLevel = LEVEL_TIERS.find((t) => oldExp >= t.minExp && oldExp <= t.maxExp)?.level || 1;
    const newLevel = LEVEL_TIERS.find((t) => newExp >= t.minExp && newExp <= t.maxExp)?.level || 1;
    if (newLevel > oldLevel) {
      playLevelUpSound();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Helper: award EXP and points
  const awardExpAndPoints = (amount: number, reason: string) => {
    setStats((prev) => {
      const newTotalExp = prev.totalExp + amount;
      const newPoints = prev.currentPoints + amount;
      checkLevelUp(prev.totalExp, newTotalExp);
      return {
        ...prev,
        totalExp: newTotalExp,
        currentPoints: newPoints,
      };
    });
  };

  // Handler: Daily Check-in
  const handleDailyCheckIn = () => {
    if (isCheckedInToday) return;
    awardExpAndPoints(20, 'Check-in Harian');
    setStats((prev) => ({
      ...prev,
      lastActiveDate: todayStr,
      streakDays: prev.streakDays + 1,
    }));
    playTaskCompleteSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Handler: Toggle Task Status
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isNowDone = t.status !== 'selesai';
          const newStatus = isNowDone ? 'selesai' : 'belum_dimulai';

          if (isNowDone) {
            playTaskCompleteSound();
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.7 },
            });
            awardExpAndPoints(t.expAwarded, `Penyelesaian Tugas: ${t.title}`);

            // Check badge 1
            setBadges((bList) =>
              bList.map((b) =>
                b.id === 'badge-1' && !b.unlocked
                  ? { ...b, unlocked: true, unlockedAt: todayStr }
                  : b
              )
            );
          }

          return {
            ...t,
            status: newStatus,
            completedAt: isNowDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Handler: Toggle Subtask
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return {
            ...t,
            subtasks: updatedSubtasks,
          };
        }
        return t;
      })
    );
  };

  // Handler: Add Task
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'expAwarded'>) => {
    const isMajor = newTaskData.category === 'proyek_akhir' || newTaskData.category === 'praktikum';
    const exp = isMajor ? 100 : 50;
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      expAwarded: exp,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Handler: Update Task
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  // Handler: Delete Task
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Handler: Add Course
  const handleAddCourse = (newCourseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...newCourseData,
      id: `course-${Date.now()}`,
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  // Handler: Update Course
  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  // Handler: Delete Course
  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Hapus mata kuliah ini dari jadwal?')) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
  };

  // Handler: Pomodoro Session Complete
  const handlePomodoroComplete = (durationMinutes: number) => {
    awardExpAndPoints(25, 'Sesi Pomodoro');
    setStats((prev) => ({
      ...prev,
      pomodoroSessionsCompleted: prev.pomodoroSessionsCompleted + 1,
      totalStudyMinutes: prev.totalStudyMinutes + durationMinutes,
    }));
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Handler: Claim Reward
  const handleClaimReward = (rewardId: string) => {
    const targetReward = rewards.find((r) => r.id === rewardId);
    if (!targetReward) return;
    if (stats.currentPoints < targetReward.cost) {
      alert('Poin Anda belum mencukupi untuk klaim reward ini. Selesaikan tugas untuk mengumpulkan koin!');
      return;
    }

    setStats((prev) => ({
      ...prev,
      currentPoints: prev.currentPoints - targetReward.cost,
    }));

    setRewards((prev) =>
      prev.map((r) =>
        r.id === rewardId ? { ...r, claimedCount: r.claimedCount + 1 } : r
      )
    );

    playTaskCompleteSound();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.5 },
    });
  };

  // Handler: Add Custom Reward
  const handleAddCustomReward = (newRew: { title: string; cost: number; icon: string }) => {
    const item: RewardItem = {
      id: `rew-${Date.now()}`,
      title: newRew.title,
      cost: newRew.cost,
      icon: newRew.icon,
      claimedCount: 0,
      isCustom: true,
    };
    setRewards((prev) => [item, ...prev]);
  };

  // Handler: Smart Reminder Action Click
  const handleReminderAction = (reminder: SmartReminderItem) => {
    if (reminder.type === 'upcoming_class') {
      setActiveTab('jadwal');
    } else if (reminder.type === 'study_tip') {
      setIsPomodoroOpen(true);
    } else {
      setActiveTab('tugas');
    }
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (confirm('Muat ulang data contoh simulasi mahasiswa? Data yang Anda buat akan di-reset.')) {
      setStats(INITIAL_USER_STATS);
      setCourses(INITIAL_COURSES);
      setTasks(INITIAL_TASKS);
      setBadges(INITIAL_BADGES);
      setRewards(INITIAL_REWARDS);
      localStorage.clear();
      alert('Data simulasi mahasiswa berhasil dimuat ulang!');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakDays={stats.streakDays}
        currentPoints={stats.currentPoints}
        onOpenQuickAdd={() => {
          setActiveTab('tugas');
        }}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: DASHBOARD UTAMA */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Student Profile & EXP Progress Banner */}
            <StudentProfileBanner
              stats={stats}
              courses={courses}
              onDailyCheckIn={handleDailyCheckIn}
              isCheckedInToday={isCheckedInToday}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
            />

            {/* Smart Reminders Alert Banner */}
            <SmartAlerts
              reminders={smartReminders}
              onActionClick={handleReminderAction}
            />

            {/* Visual Task Progress Charts (Donut + Bar + Workload) */}
            <ProgressVisualizer tasks={tasks} courses={courses} />

            {/* Split Row: Quick Tasks Preview & Quick Today Lecture */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Quick Tasks due soon (col-span-7) */}
              <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-neutral-800" />
                      <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                        Tugas Berjalan Terdekat
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('tugas')}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold flex items-center gap-1 group"
                    >
                      <span>Lihat Semua Tugas</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {tasks
                      .filter((t) => t.status !== 'selesai')
                      .slice(0, 3)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 flex items-center justify-between gap-3 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => handleToggleTaskStatus(task.id)}
                              className="w-4 h-4 rounded-full border border-neutral-300 hover:border-neutral-900 shrink-0"
                              title="Tandai Selesai"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-neutral-900 truncate">
                                {task.title}
                              </h4>
                              <p className="text-[11px] text-neutral-500 truncate">
                                {task.courseName} · Jatuh tempo{' '}
                                <span className="font-mono tabular-nums font-medium text-neutral-700">
                                  {new Date(task.deadline).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </p>
                            </div>
                          </div>

                          <span className="text-[11px] font-mono text-amber-700 font-semibold shrink-0">
                            +{task.expAwarded} EXP
                          </span>
                        </div>
                      ))}

                    {tasks.filter((t) => t.status !== 'selesai').length === 0 && (
                      <p className="text-xs text-neutral-400 py-4 text-center">
                        Semua tugas telah diselesaikan! Waktunya relaksasi.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>
                    {tasks.filter((t) => t.status !== 'selesai').length} tugas aktif membutuhkan perhatian
                  </span>
                  <button
                    onClick={() => setIsPomodoroOpen(true)}
                    className="text-neutral-900 font-semibold hover:underline"
                  >
                    Mulai Sesi Fokus →
                  </button>
                </div>
              </div>

              {/* Quick Today Lecture Agenda (col-span-5) */}
              <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-800" />
                      <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                        Agenda Kuliah Hari Ini
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('jadwal')}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold flex items-center gap-1 group"
                    >
                      <span>Jadwal Lengkap</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {courses.filter((c) => c.day === 'Senin').length === 0 ? (
                    <p className="text-xs text-neutral-400 py-4 text-center">
                      Tidak ada kelas perkuliahan hari ini.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {courses.slice(0, 2).map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-neutral-900">{c.name}</span>
                            <span className="text-[11px] font-mono text-neutral-600 tabular-nums">
                              {c.startTime} - {c.endTime}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500 flex items-center justify-between">
                            <span>{c.room}</span>
                            <span>{c.sks} SKS</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>Semester 5 · Total {courses.reduce((a, b) => a + b.sks, 0)} SKS</span>
                  <button
                    onClick={() => setActiveTab('kalender')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Lihat Kalender →
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Motivation & Study Tips Widget */}
            <MotivationWidget />
          </div>
        )}

        {/* TAB 2: JADWAL KULIAH */}
        {activeTab === 'jadwal' && (
          <ScheduleTimetable
            courses={courses}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        )}

        {/* TAB 3: TUGAS & PROYEK */}
        {activeTab === 'tugas' && (
          <TasksManager
            tasks={tasks}
            courses={courses}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleStatus={handleToggleTaskStatus}
            onToggleSubtask={handleToggleSubtask}
          />
        )}

        {/* TAB 4: INTEGRASI KALENDER */}
        {activeTab === 'kalender' && (
          <CalendarView courses={courses} tasks={tasks} />
        )}

        {/* TAB 5: POIN & MOTIVASI */}
        {activeTab === 'gamifikasi' && (
          <GamificationCenter
            stats={stats}
            badges={badges}
            rewards={rewards}
            onClaimReward={handleClaimReward}
            onAddCustomReward={handleAddCustomReward}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">KuliahKu</span>
            <span>·</span>
            <span>Planner Cerdas Mahasiswa Indonesia</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1"
              title="Reset data contoh mahasiswa"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Muat Ulang Data Simulasi</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Pomodoro Focus Timer Modal */}
      <PomodoroTimer
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        onSessionComplete={handlePomodoroComplete}
      />

      {/* Edit Student Profile Modal */}
      <EditProfileModal
        stats={stats}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={(updated) => setStats((prev) => ({ ...prev, ...updated }))}
      />
    </div>
  );
}
