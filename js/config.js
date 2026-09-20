/* ===================================================
   SEHRLI BARABAN — Configuration & global state
   =================================================== */

const CONFIG = {
    VERSION: '2.2.0',
    STORAGE_KEY: 'sehrli_baraban_v2',
    LEGACY_KEY: 'sehrli_baraban_data',
    DEFAULT_CLASS: '3-sinf',

    WHEEL_COLORS: [
        '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b',
        '#ec4899', '#3b82f6', '#ef4444', '#14b8a6', '#a855f7',
        '#f97316', '#6366f1', '#22d3ee', '#e11d48', '#84cc16',
        '#d946ef', '#0ea5e9', '#fb923c',
    ],
    CONFETTI_COLORS: ['#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ffd700'],
    AVATARS: ['🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🐨', '🐰', '🦄', '🐙', '🦉', '🐬',
              '🦋', '🐢', '🦜', '🐝', '🐧', '🦒', '🐳', '🦔', '🐞', '🦩', '🐿️', '🦭',
              '🐺', '🐮', '🐷', '🐹', '🐻', '🐤'],

    SPIN_DURATION_MIN: 4000,
    SPIN_DURATION_MAX: 7000,
    SPIN_ROTATIONS_MIN: 6,
    SPIN_ROTATIONS_MAX: 12,

    LEVEL_MIN: 1,
    LEVEL_MAX: 5,
    LEVEL_START: 2,
    LEVEL_UP_STREAK: 3,     // ketma-ket to'g'ri javoblar → daraja oshadi
    LEVEL_DOWN_STREAK: 2,   // ketma-ket noto'g'ri → daraja tushadi

    STREAK_BONUS_AT: 3,
    BLITZ_SECONDS: 30,
    LOG_LIMIT: 80,
    MAX_STUDENTS: 60,
};

const DEFAULT_SETTINGS = {
    soundEnabled: true,
    timerDuration: 15,
    globalTimer: 0,
    difficulty: 'medium',   // easy | medium | hard | auto
    theme: 'dark',
    projector: false,
    streakBonus: true,
    enabledGames: null,     // null → hammasi yoqilgan
};

// Bitta sinfga tegishli ma'lumotlar
function emptyClassData() {
    return {
        students: [],
        scores: {},
        stats: {},
        teams: { red: [], blue: [] },
        teamScores: { red: 0, blue: 0 },
        teamMode: false,
        noRepeat: false,
        fairPick: true,
        usedStudents: [],
        log: [],
    };
}

const state = {
    className: CONFIG.DEFAULT_CLASS,
    students: [],
    scores: {},          // { name: number }
    stats: {},           // { name: {...} } — Stats moduli boshqaradi
    teams: { red: [], blue: [] },
    teamScores: { red: 0, blue: 0 },
    teamMode: false,
    noRepeat: false,
    fairPick: true,
    usedStudents: new Set(),
    log: [],
    settings: { ...DEFAULT_SETTINGS },
    currentWinner: null,
    currentGame: null,
};
