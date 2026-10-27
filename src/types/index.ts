export type Priority = 'tinggi' | 'sedang' | 'rendah';

export type TaskStatus = 'belum_dimulai' | 'sedang_dikerjakan' | 'selesai';

export type TaskCategory = 'tugas_mandiri' | 'tugas_kelompok' | 'praktikum' | 'quiz_ujian' | 'proyek_akhir' | 'lainnya';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  deadline: string; // ISO date string (YYYY-MM-DDTHH:mm)
  priority: Priority;
  category: TaskCategory;
  estimatedMinutes: number;
  status: TaskStatus;
  notes?: string;
  subtasks: SubTask[];
  completedAt?: string;
  expAwarded: number;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  sks: number;
  day: DayOfWeek;
  startTime: string; // HH:mm (e.g. "08:00")
  endTime: string;   // HH:mm (e.g. "09:40")
  room: string;
  isOnline: boolean;
  onlineLink?: string;
  color: string; // hex or tailwind class token
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number; // EXP cost to redeem
  icon: string;
  claimedCount: number;
  isCustom?: boolean;
}

export interface UserStats {
  name: string;
  nim: string;
  university: string;
  major: string;
  semester: number;
  targetIpk: number;
  totalExp: number;
  currentPoints: number; // Spendable for self-rewards
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  pomodoroSessionsCompleted: number;
  totalStudyMinutes: number;
}

export interface SmartReminderItem {
  id: string;
  type: 'urgent_deadline' | 'approaching_deadline' | 'overdue_task' | 'upcoming_class' | 'study_tip';
  title: string;
  message: string;
  timeRemaining?: string;
  actionText?: string;
  targetId?: string;
  level: 'kritis' | 'waspada' | 'informasi';
}
