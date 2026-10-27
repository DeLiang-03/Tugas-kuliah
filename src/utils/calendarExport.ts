import { Course, Task } from '../types';

/**
 * Format date to Google Calendar ISO string (YYYYMMDDTHHmmssZ)
 */
function toGCalUtcString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Format local date string YYYYMMDDTHHmmss for ICS
 */
function toIcsLocalString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

/**
 * Calculate the next upcoming date for a day of week (Senin - Sabtu)
 */
export function getNextDayDate(dayName: string, timeStr: string): Date {
  const dayMap: Record<string, number> = {
    Minggu: 0,
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
  };

  const targetDay = dayMap[dayName] ?? 1;
  const now = new Date();
  const currentDay = now.getDay();
  let diff = targetDay - currentDay;
  if (diff < 0) {
    diff += 7;
  }

  const result = new Date(now);
  result.setDate(now.getDate() + diff);

  const [hours, minutes] = timeStr.split(':').map(Number);
  result.setHours(hours || 8, minutes || 0, 0, 0);
  return result;
}

/**
 * Generate a direct "Add to Google Calendar" URL for a course
 */
export function getGoogleCalendarCourseUrl(course: Course): string {
  const startDate = getNextDayDate(course.day, course.startTime);
  const endDate = getNextDayDate(course.day, course.endTime);

  const title = encodeURIComponent(`[Kuliah] ${course.name} (${course.code})`);
  const details = encodeURIComponent(
    `Mata Kuliah: ${course.name}\n` +
    `Kode: ${course.code} | SKS: ${course.sks}\n` +
    `Dosen: ${course.lecturer}\n` +
    `Ruang: ${course.room}\n` +
    (course.onlineLink ? `Tautan Kuliah: ${course.onlineLink}\n` : '') +
    `\nDikelola melalui KuliahKu Planner.`
  );
  const location = encodeURIComponent(course.room + (course.onlineLink ? ` (${course.onlineLink})` : ''));
  const dates = `${toGCalUtcString(startDate)}/${toGCalUtcString(endDate)}`;
  const recur = encodeURIComponent('RRULE:FREQ=WEEKLY;COUNT=16'); // Standard 16-week semester

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}&recur=${recur}`;
}

/**
 * Generate a direct "Add to Google Calendar" URL for a task deadline
 */
export function getGoogleCalendarTaskUrl(task: Task): string {
  const deadlineDate = new Date(task.deadline);
  const startDate = new Date(deadlineDate.getTime() - (task.estimatedMinutes || 60) * 60 * 1000);

  const title = encodeURIComponent(`[Deadline Tugas] ${task.title} - ${task.courseName}`);
  const subtasksList = task.subtasks && task.subtasks.length > 0
    ? '\nSub-tugas:\n' + task.subtasks.map((st, i) => `${i + 1}. [${st.completed ? 'x' : ' '}] ${st.title}`).join('\n')
    : '';

  const details = encodeURIComponent(
    `Mata Kuliah: ${task.courseName}\n` +
    `Prioritas: ${task.priority.toUpperCase()}\n` +
    `Status: ${task.status}\n` +
    (task.notes ? `Catatan: ${task.notes}\n` : '') +
    subtasksList +
    `\n\nDikelola via KuliahKu Planner.`
  );

  const dates = `${toGCalUtcString(startDate)}/${toGCalUtcString(deadlineDate)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

/**
 * Generate standard RFC 5545 .ics file text and trigger browser file download
 */
export function exportToIcsFile(courses: Course[], tasks: Task[], filename = 'Jadwal_Kuliah_dan_Tugas.ics') {
  const dayIcsCode: Record<string, string> = {
    Senin: 'MO',
    Selasa: 'TU',
    Rabu: 'WE',
    Kamis: 'TH',
    Jumat: 'FR',
    Sabtu: 'SA',
    Minggu: 'SU',
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KuliahKu//Manajemen Jadwal & Tugas Mahasiswa//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:KuliahKu - Jadwal Mahasiswa',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  const nowStamp = toIcsLocalString(new Date()) + 'Z';

  // 1. Export Courses with weekly recurrence
  courses.forEach((c) => {
    const start = getNextDayDate(c.day, c.startTime);
    const end = getNextDayDate(c.day, c.endTime);
    const byDay = dayIcsCode[c.day] || 'MO';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:kuliahku-course-${c.id}-${Date.now()}@kuliahku.app`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${toIcsLocalString(start)}`);
    lines.push(`DTEND:${toIcsLocalString(end)}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay};COUNT=16`);
    lines.push(`SUMMARY:[Kuliah] ${c.name} (${c.code})`);
    lines.push(`DESCRIPTION:Dosen: ${c.lecturer}\\nSKS: ${c.sks}\\nRuangan: ${c.room}${c.onlineLink ? '\\nLink: ' + c.onlineLink : ''}`);
    lines.push(`LOCATION:${c.room}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  // 2. Export Tasks as calendar deadlines
  tasks.forEach((t) => {
    const deadline = new Date(t.deadline);
    const start = new Date(deadline.getTime() - (t.estimatedMinutes || 60) * 60 * 1000);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:kuliahku-task-${t.id}-${Date.now()}@kuliahku.app`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${toIcsLocalString(start)}`);
    lines.push(`DTEND:${toIcsLocalString(deadline)}`);
    lines.push(`SUMMARY:[Deadline Tugas] ${t.title}`);
    lines.push(`DESCRIPTION:Mata Kuliah: ${t.courseName}\\nPrioritas: ${t.priority.toUpperCase()}${t.notes ? '\\nCatatan: ' + t.notes : ''}`);
    lines.push(`STATUS:${t.status === 'selesai' ? 'COMPLETED' : 'CONFIRMED'}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
