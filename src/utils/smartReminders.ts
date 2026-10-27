import { Course, Task, SmartReminderItem } from '../types';

export function getIndonesianDayName(date: Date = new Date()): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
}

export function formatDeadlineRelative(deadlineStr: string): { text: string; isOverdue: boolean; hoursLeft: number } {
  const now = new Date().getTime();
  const deadline = new Date(deadlineStr).getTime();
  const diffMs = deadline - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const overdueHours = Math.abs(diffHours);
    if (overdueHours < 24) {
      return { text: `Terlambat ${overdueHours} jam yang lalu`, isOverdue: true, hoursLeft: diffHours };
    }
    const overdueDays = Math.abs(diffDays);
    return { text: `Terlambat ${overdueDays} hari yang lalu`, isOverdue: true, hoursLeft: diffHours };
  }

  if (diffHours <= 1) {
    const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return { text: `Sisa ${diffMinutes} menit lagi!`, isOverdue: false, hoursLeft: diffHours };
  }

  if (diffHours < 24) {
    return { text: `Sisa ${diffHours} jam lagi`, isOverdue: false, hoursLeft: diffHours };
  }

  if (diffDays === 1) {
    return { text: 'Besok', isOverdue: false, hoursLeft: diffHours };
  }

  return { text: `${diffDays} hari lagi`, isOverdue: false, hoursLeft: diffHours };
}

export function generateSmartReminders(courses: Course[], tasks: Task[]): SmartReminderItem[] {
  const reminders: SmartReminderItem[] = [];
  const now = new Date();
  const todayDayName = getIndonesianDayName(now);
  const currentMinutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

  // 1. Evaluate today's upcoming and ongoing classes
  const todaysCourses = courses.filter((c) => c.day === todayDayName);
  todaysCourses.forEach((course) => {
    const [startH, startM] = course.startTime.split(':').map(Number);
    const [endH, endM] = course.endTime.split(':').map(Number);
    const classStartMin = startH * 60 + startM;
    const classEndMin = endH * 60 + endM;

    // Ongoing class
    if (currentMinutesSinceMidnight >= classStartMin && currentMinutesSinceMidnight <= classEndMin) {
      reminders.push({
        id: `class-ongoing-${course.id}`,
        type: 'upcoming_class',
        title: `Kelas Sedang Berlangsung: ${course.name}`,
        message: `${course.room} · Dosen: ${course.lecturer} (Berakhir pk ${course.endTime})`,
        timeRemaining: 'Sedang berlangsung',
        actionText: course.onlineLink ? 'Buka Tautan Daring' : 'Lihat Detail Ruang',
        targetId: course.id,
        level: 'informasi',
      });
    }
    // Class starting within the next 90 minutes
    else if (classStartMin > currentMinutesSinceMidnight && classStartMin - currentMinutesSinceMidnight <= 90) {
      const minutesUntil = classStartMin - currentMinutesSinceMidnight;
      reminders.push({
        id: `class-upcoming-${course.id}`,
        type: 'upcoming_class',
        title: `Kuliah Segera Dimulai: ${course.name}`,
        message: `Mulai pukul ${course.startTime} di ${course.room}. Siapkan modul kuliahmu!`,
        timeRemaining: `${minutesUntil} menit lagi`,
        actionText: course.onlineLink ? 'Masuk Kelas Online' : 'Cek Jadwal',
        targetId: course.id,
        level: 'waspada',
      });
    }
  });

  // 2. Evaluate tasks: overdue, urgent (< 24h), and approaching (< 72h)
  const activeTasks = tasks.filter((t) => t.status !== 'selesai');

  // Check for overdue tasks
  const overdueTasks = activeTasks.filter((t) => new Date(t.deadline).getTime() < now.getTime());
  if (overdueTasks.length > 0) {
    const topOverdue = overdueTasks[0];
    reminders.push({
      id: `task-overdue-${topOverdue.id}`,
      type: 'overdue_task',
      title: `Tenggat Terlewat: ${topOverdue.title}`,
      message: `${topOverdue.courseName} · Segera selesaikan dan hubungi dosen/asisten jika ada toleransi waktu!`,
      timeRemaining: 'Melewati batas deadline',
      actionText: 'Tandai Selesai / Kerjakan',
      targetId: topOverdue.id,
      level: 'kritis',
    });
  }

  // Check for urgent tasks (< 24 hours)
  const urgentTasks = activeTasks
    .filter((t) => {
      const diffHours = (new Date(t.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  if (urgentTasks.length > 0) {
    const topUrgent = urgentTasks[0];
    const { text } = formatDeadlineRelative(topUrgent.deadline);
    reminders.push({
      id: `task-urgent-${topUrgent.id}`,
      type: 'urgent_deadline',
      title: `Prioritas Mendesak: ${topUrgent.title}`,
      message: `${topUrgent.courseName} · Estimasi pengerjaan ${topUrgent.estimatedMinutes} menit. (${text})`,
      timeRemaining: text,
      actionText: 'Mulai Fokus Sekarang',
      targetId: topUrgent.id,
      level: 'kritis',
    });
  }

  // Check for tasks due within 3 days (approaching)
  const approachingTasks = activeTasks
    .filter((t) => {
      const diffHours = (new Date(t.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours > 24 && diffHours <= 72;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  if (approachingTasks.length > 0) {
    const topApproaching = approachingTasks[0];
    const { text } = formatDeadlineRelative(topApproaching.deadline);
    reminders.push({
      id: `task-approaching-${topApproaching.id}`,
      type: 'approaching_deadline',
      title: `Tenggat Mendekati: ${topApproaching.title}`,
      message: `${topApproaching.courseName} · Jatuh tempo ${text}. Cicil sub-tugasnya agar tidak menumpuk!`,
      timeRemaining: text,
      actionText: 'Lihat Sub-tugas',
      targetId: topApproaching.id,
      level: 'waspada',
    });
  }

  // Smart Study Recommendation
  if (activeTasks.length > 0 && reminders.length < 4) {
    // Score tasks by priority and deadline
    const scoredTasks = [...activeTasks].sort((a, b) => {
      const priorityWeight = { tinggi: 3, sedang: 2, rendah: 1 };
      const scoreA = priorityWeight[a.priority] * 1000000000 - new Date(a.deadline).getTime();
      const scoreB = priorityWeight[b.priority] * 1000000000 - new Date(b.deadline).getTime();
      return scoreB - scoreA;
    });

    const recommendedTask = scoredTasks[0];
    reminders.push({
      id: `study-tip-${recommendedTask.id}`,
      type: 'study_tip',
      title: 'Rekomendasi Belajar Pintar Hari Ini',
      message: `Berdasarkan bobot prioritas, kami sarankan fokus menyelesaikan "${recommendedTask.title}" (${recommendedTask.courseName}). Gunakan 1 sesi Pomodoro!`,
      actionText: 'Buka Timer Belajar',
      targetId: recommendedTask.id,
      level: 'informasi',
    });
  }

  return reminders;
}
