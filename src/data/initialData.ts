import { Course, Task, Badge, RewardItem, UserStats } from '../types';

export const INITIAL_USER_STATS: UserStats = {
  name: 'Arya Pratama',
  nim: '221401089',
  university: 'Universitas Indonesia',
  major: 'Ilmu Komputer',
  semester: 5,
  targetIpk: 3.85,
  totalExp: 680,
  currentPoints: 230,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  pomodoroSessionsCompleted: 14,
  totalStudyMinutes: 350,
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'CS3101',
    name: 'Pemrograman Web Lanjut',
    lecturer: 'Dr. Ir. Hendra Gunawan, M.T.',
    sks: 3,
    day: 'Senin',
    startTime: '08:00',
    endTime: '10:30',
    room: 'Lab Komputasi 3 & Gedung A.204',
    isOnline: false,
    color: '#3B82F6', // Blue
  },
  {
    id: 'course-2',
    code: 'CS3102',
    name: 'Basis Data Terdistribusi',
    lecturer: 'Prof. Sri Wahyuni, Ph.D.',
    sks: 3,
    day: 'Senin',
    startTime: '13:00',
    endTime: '15:30',
    room: 'Ruang Teori R.402',
    isOnline: false,
    color: '#10B981', // Emerald
  },
  {
    id: 'course-3',
    code: 'CS3103',
    name: 'Kecerdasan Buatan & ML',
    lecturer: 'Budi Santoso, S.Kom., M.Cs.',
    sks: 3,
    day: 'Selasa',
    startTime: '09:00',
    endTime: '11:30',
    room: 'Zoom Meeting Kampus',
    isOnline: true,
    onlineLink: 'https://meet.google.com/xyz-study-indonesia',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'course-4',
    code: 'CS3104',
    name: 'Rekayasa Perangkat Lunak',
    lecturer: 'Dra. Ratna Dewi, M.Sc.',
    sks: 4,
    day: 'Rabu',
    startTime: '08:00',
    endTime: '11:20',
    room: 'Auditorium Fasilkom',
    isOnline: false,
    color: '#F59E0B', // Amber
  },
  {
    id: 'course-5',
    code: 'CS3105',
    name: 'Jaringan & Keamanan Sistem',
    lecturer: 'Agus Setiawan, S.T., M.Kom.',
    sks: 3,
    day: 'Kamis',
    startTime: '10:00',
    endTime: '12:30',
    room: 'Lab Jaringan Komputer',
    isOnline: false,
    color: '#EC4899', // Pink
  },
  {
    id: 'course-6',
    code: 'CS3106',
    name: 'Interaksi Manusia & Komputer',
    lecturer: 'Nurul Hidayah, M.T.I.',
    sks: 2,
    day: 'Jumat',
    startTime: '13:30',
    endTime: '15:10',
    room: 'Studio Desain UI/UX',
    isOnline: false,
    color: '#06B6D4', // Cyan
  },
];

// Helper to create dates relative to today
const getRelativeDate = (daysOffset: number, hours: number, minutes: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  // Return YYYY-MM-DDTHH:mm format in local timezone
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hh}:${mm}`;
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Implementasi Autentikasi JWT & REST API',
    courseId: 'course-1',
    courseName: 'Pemrograman Web Lanjut',
    deadline: getRelativeDate(1, 23, 59), // Tomorrow night
    priority: 'tinggi',
    category: 'praktikum',
    estimatedMinutes: 90,
    status: 'sedang_dikerjakan',
    notes: 'Gunakan Express + TypeScript dan buat skema refresh token dengan bcrypt.',
    subtasks: [
      { id: 'st-1-1', title: 'Setup endpoint register & login hash password', completed: true },
      { id: 'st-1-2', title: 'Middleware verifikasi Bearer token', completed: true },
      { id: 'st-1-3', title: 'Pengujian endpoint via Postman & Dokumentasi', completed: false },
    ],
    expAwarded: 75,
  },
  {
    id: 'task-2',
    title: 'Resume Paper Sharding & Partisi Horizontal',
    courseId: 'course-2',
    courseName: 'Basis Data Terdistribusi',
    deadline: getRelativeDate(2, 17, 0), // In 2 days
    priority: 'sedang',
    category: 'tugas_mandiri',
    estimatedMinutes: 60,
    status: 'belum_dimulai',
    notes: 'Minimal 3 halaman PDF, sertakan studi kasus arsitektur Google Spanner atau DynamoDB.',
    subtasks: [
      { id: 'st-2-1', title: 'Cari 2 jurnal IEEE terkait sharding terdistribusi', completed: false },
      { id: 'st-2-2', title: 'Tulis ringkasan trade-off CAP theorem', completed: false },
      { id: 'st-2-3', title: 'Export ke format PDF standar IEEE', completed: false },
    ],
    expAwarded: 50,
  },
  {
    id: 'task-3',
    title: 'Training Model Klasifikasi Gambar dengan PyTorch',
    courseId: 'course-3',
    courseName: 'Kecerdasan Buatan & ML',
    deadline: getRelativeDate(3, 23, 59), // In 3 days
    priority: 'tinggi',
    category: 'praktikum',
    estimatedMinutes: 120,
    status: 'sedang_dikerjakan',
    notes: 'Akurasi minimal pada test set CIFAR-10 sebesar 85% dengan augmentasi data.',
    subtasks: [
      { id: 'st-3-1', title: 'Data preprocessing & dataloader setup', completed: true },
      { id: 'st-3-2', title: 'Training loop & validation epoch loss tracking', completed: false },
      { id: 'st-3-3', title: 'Plot confusion matrix & ROC curve', completed: false },
    ],
    expAwarded: 100,
  },
  {
    id: 'task-4',
    title: 'Diagram Use Case & Wireframe UI Aplikasi Kampus',
    courseId: 'course-4',
    courseName: 'Rekayasa Perangkat Lunak',
    deadline: getRelativeDate(5, 12, 0), // In 5 days
    priority: 'sedang',
    category: 'tugas_kelompok',
    estimatedMinutes: 75,
    status: 'belum_dimulai',
    notes: 'Diskusi bersama tim kelompok via Figma & buat use case specification lengkap.',
    subtasks: [
      { id: 'st-4-1', title: 'Brainstorming kebutuhan fungsional aktor mahasiswa & dosen', completed: false },
      { id: 'st-4-2', title: 'Pembuatan diagram kelas & urutan aktivitas', completed: false },
    ],
    expAwarded: 60,
  },
  {
    id: 'task-5',
    title: 'Analisis Wireshark Packet Sniffing Protokol TCP',
    courseId: 'course-5',
    courseName: 'Jaringan & Keamanan Sistem',
    deadline: getRelativeDate(-1, 23, 59), // Completed yesterday
    priority: 'sedang',
    category: 'praktikum',
    estimatedMinutes: 60,
    status: 'selesai',
    notes: 'Laporan analisis 3-way handshake SYN, SYN-ACK, ACK.',
    subtasks: [
      { id: 'st-5-1', title: 'Capture pcap dump paket HTTP vs HTTPS', completed: true },
      { id: 'st-5-2', title: 'Screenshot header flags TCP', completed: true },
    ],
    completedAt: getRelativeDate(-1, 21, 30),
    expAwarded: 50,
  },
  {
    id: 'task-6',
    title: 'Heuristic Evaluation 10 Prinsip Nielsen UI Mobile',
    courseId: 'course-6',
    courseName: 'Interaksi Manusia & Komputer',
    deadline: getRelativeDate(-3, 16, 0), // Completed 3 days ago
    priority: 'rendah',
    category: 'tugas_mandiri',
    estimatedMinutes: 45,
    status: 'selesai',
    notes: 'Evaluasi antarmuka aplikasi pemesanan tiket kereta.',
    subtasks: [
      { id: 'st-6-1', title: 'Pilih 5 layar utama aplikasi', completed: true },
      { id: 'st-6-2', title: 'Catat temuan pelanggaran usability', completed: true },
    ],
    completedAt: getRelativeDate(-3, 15, 0),
    expAwarded: 40,
  },
  {
    id: 'task-7',
    title: 'Studi Kasus Normalisasi Database 1NF hingga BCNF',
    courseId: 'course-2',
    courseName: 'Basis Data Terdistribusi',
    deadline: getRelativeDate(-5, 23, 59), // Completed 5 days ago
    priority: 'tinggi',
    category: 'tugas_mandiri',
    estimatedMinutes: 70,
    status: 'selesai',
    notes: 'Soal latihan pemecahan anomali update dan delete.',
    subtasks: [
      { id: 'st-7-1', title: 'Identifikasi functional dependency', completed: true },
      { id: 'st-7-2', title: 'Dekomposisi lossless join', completed: true },
    ],
    completedAt: getRelativeDate(-5, 20, 15),
    expAwarded: 65,
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-1',
    title: 'Langkah Pertama',
    description: 'Menyelesaikan tugas pertama di KuliahKu',
    iconName: 'Zap',
    unlocked: true,
    unlockedAt: '2026-10-20',
    requirement: 'Selesaikan 1 tugas apa saja',
  },
  {
    id: 'badge-2',
    title: 'Disiplin Waktu',
    description: 'Menyelesaikan 3 tugas sebelum H-1 deadline',
    iconName: 'Clock',
    unlocked: true,
    unlockedAt: '2026-10-23',
    requirement: 'Submit sebelum tenggat waktu',
  },
  {
    id: 'badge-3',
    title: 'Fokus Tajam',
    description: 'Menyelesaikan 10 sesi Pomodoro belajar mandiri',
    iconName: 'Target',
    unlocked: true,
    unlockedAt: '2026-10-25',
    requirement: 'Selesaikan 10 sesi Pomodoro (25 menit)',
  },
  {
    id: 'badge-4',
    title: 'Streak Membara',
    description: 'Aktif mempertahankan produktivitas 5 hari berturut-turut',
    iconName: 'Flame',
    unlocked: false,
    requirement: 'Capai 5 hari streak produktif',
  },
  {
    id: 'badge-5',
    title: 'SKS Master',
    description: 'Mengelola jadwal kuliah dengan beban 18 SKS atau lebih',
    iconName: 'BookOpen',
    unlocked: true,
    unlockedAt: '2026-10-18',
    requirement: 'Ambil minimal 18 SKS dalam semester aktif',
  },
  {
    id: 'badge-6',
    title: 'Penakluk Deadline',
    description: 'Menyelesaikan seluruh tugas aktif dalam seminggu',
    iconName: 'Award',
    unlocked: false,
    requirement: 'Semua tugas minggu berjalan selesai 100%',
  },
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rew-1',
    title: 'Beli Kopi Susu Aren Favorit',
    cost: 100,
    icon: 'Coffee',
    claimedCount: 2,
  },
  {
    id: 'rew-2',
    title: 'Nonton 1 Episode Serial / Anime Santai',
    cost: 80,
    icon: 'Tv',
    claimedCount: 4,
  },
  {
    id: 'rew-3',
    title: 'Main Game Bebas Selama 1 Jam',
    cost: 120,
    icon: 'Gamepad2',
    claimedCount: 1,
  },
  {
    id: 'rew-4',
    title: 'Makan Makanan Enak Tanpa Rasa Bersalah',
    cost: 150,
    icon: 'Utensils',
    claimedCount: 1,
  },
  {
    id: 'rew-5',
    title: 'Tidur Siang Berkualitas 45 Menit',
    cost: 60,
    icon: 'Moon',
    claimedCount: 3,
  },
];

export const STUDENT_QUOTES = [
  {
    quote: "Pendidikan adalah senjata paling ampuh yang bisa kau gunakan untuk mengubah dunia.",
    author: "Nelson Mandela",
    tag: "Visi Mahasiswa",
  },
  {
    quote: "Kunci sukses bukan tidak pernah lelah, tetapi tahu kapan harus istirahat dan kapan harus melangkah maju lagi.",
    author: "B.J. Habibie",
    tag: "Ketekunan",
  },
  {
    quote: "Tugas sulit hari ini adalah portofolio membanggakan esok hari. Selesaikan satu per satu dengan tenang.",
    author: "Refleksi Akademik",
    tag: "Manajemen Stress",
  },
  {
    quote: "Disiplin mengalahkan motivasi. Ketika rasa malas datang, mulailah 5 menit pertama, momentum akan membimbingmu.",
    author: "Prinsip Produktivitas",
    tag: "Aturan 5 Menit",
  },
  {
    quote: "IPK memang membuka pintu wawancara, tapi konsistensi dan etos kerjamu yang membuktikan masa depanmu.",
    author: "Pesan Dosen Senior",
    tag: "Inspirasi Kampus",
  },
];

export const LEVEL_TIERS = [
  { level: 1, title: 'Mahasiswa Baru', minExp: 0, maxExp: 200, color: 'text-neutral-600', icon: 'GraduationCap' },
  { level: 2, title: 'Pejuang Semester', minExp: 201, maxExp: 500, color: 'text-blue-600', icon: 'BookMarked' },
  { level: 3, title: 'Organisator Ulung', minExp: 501, maxExp: 900, color: 'text-emerald-600', icon: 'Compass' },
  { level: 4, title: 'Master Manajemen Waktu', minExp: 901, maxExp: 1500, color: 'text-amber-600', icon: 'Clock' },
  { level: 5, title: 'Bintang Prestasi Kampus', minExp: 1501, maxExp: 2300, color: 'text-indigo-600', icon: 'Sparkles' },
  { level: 6, title: 'Calon Wisudawan Cum Laude', minExp: 2301, maxExp: 9999, color: 'text-purple-600', icon: 'Trophy' },
];
