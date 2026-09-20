/* ===================================================
   SEHRLI BARABAN — Statistika, adaptiv daraja, yutuqlar, jurnal
   =================================================== */

const Stats = {
    BADGES: {
        first_star: { icon: '⭐', name: 'Birinchi yulduz', desc: 'Birinchi to\'g\'ri javob' },
        streak3:    { icon: '🔥', name: 'Olov', desc: '3 ta ketma-ket to\'g\'ri' },
        streak5:    { icon: '🚀', name: 'Raketa', desc: '5 ta ketma-ket to\'g\'ri' },
        stars10:    { icon: '🏅', name: 'Medal', desc: '10 ta yulduz' },
        stars25:    { icon: '👑', name: 'Toj', desc: '25 ta yulduz' },
        games5:     { icon: '🎯', name: 'Ko\'p qirrali', desc: '5 xil o\'yinda g\'alaba' },
        speed:      { icon: '⚡', name: 'Chaqmoq', desc: '3 soniyadan tez javob' },
        level5:     { icon: '🧠', name: 'Usta', desc: '5-darajaga chiqdi' },
        blitz10:    { icon: '💨', name: 'Shamol', desc: 'Blitsda 10+ to\'g\'ri' },
    },

    get(name) {
        if (!name) return this._empty();
        if (!state.stats[name]) state.stats[name] = this._empty();
        const s = state.stats[name];
        // Eski yozuvlar uchun maydonlarni to'ldirish
        if (!s.games) s.games = {};
        if (!Array.isArray(s.badges)) s.badges = [];
        if (!s.level) s.level = CONFIG.LEVEL_START;
        return s;
    },

    _empty() {
        return {
            attempts: 0, correct: 0,
            streak: 0, bestStreak: 0,
            wrongStreak: 0, levelStreak: 0,
            picks: 0, totalTime: 0, timedAnswers: 0,
            level: CONFIG.LEVEL_START,
            games: {}, badges: [],
            blitzBest: 0,
        };
    },

    levelOf(name) {
        return Utils.clamp(this.get(name).level || CONFIG.LEVEL_START, CONFIG.LEVEL_MIN, CONFIG.LEVEL_MAX);
    },

    accuracy(name) {
        const s = this.get(name);
        return s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0;
    },

    picksOf(name) {
        return state.stats[name] ? (state.stats[name].picks || 0) : 0;
    },

    recordPick(name) {
        const s = this.get(name);
        s.picks = (s.picks || 0) + 1;
    },

    /**
     * Javobni qayd etish.
     * @returns {{ newBadges: string[], streak: number, levelChange: number, bonus: boolean }}
     */
    recordAnswer(name, gameId, correct, ms = 0) {
        const s = this.get(name);
        const result = { newBadges: [], streak: 0, levelChange: 0, bonus: false };

        s.attempts++;
        if (!s.games[gameId]) s.games[gameId] = { attempts: 0, correct: 0 };
        s.games[gameId].attempts++;

        if (ms > 0) { s.totalTime += ms; s.timedAnswers++; }

        if (correct) {
            s.correct++;
            s.games[gameId].correct++;
            s.streak++;
            s.wrongStreak = 0;
            s.levelStreak++;
            if (s.streak > s.bestStreak) s.bestStreak = s.streak;

            // Seriya bonusi
            if (state.settings.streakBonus && s.streak > 0 && s.streak % CONFIG.STREAK_BONUS_AT === 0) {
                result.bonus = true;
            }

            // Adaptiv daraja: ketma-ket to'g'ri → oshadi
            if (s.levelStreak >= CONFIG.LEVEL_UP_STREAK && s.level < CONFIG.LEVEL_MAX) {
                s.level++;
                s.levelStreak = 0;
                result.levelChange = 1;
            }
        } else {
            s.streak = 0;
            s.levelStreak = 0;
            s.wrongStreak++;
            if (s.wrongStreak >= CONFIG.LEVEL_DOWN_STREAK && s.level > CONFIG.LEVEL_MIN) {
                s.level--;
                s.wrongStreak = 0;
                result.levelChange = -1;
            }
        }

        result.streak = s.streak;
        result.newBadges = this.checkBadges(name, { correct, ms, gameId });
        return result;
    },

    award(name, id, list) {
        const s = this.get(name);
        if (!s.badges.includes(id)) { s.badges.push(id); list.push(id); }
    },

    checkBadges(name, ctx = {}) {
        const s = this.get(name);
        const list = [];
        const stars = state.scores[name] || 0;
        if (s.correct >= 1) this.award(name, 'first_star', list);
        if (s.streak >= 3) this.award(name, 'streak3', list);
        if (s.streak >= 5) this.award(name, 'streak5', list);
        if (stars >= 10) this.award(name, 'stars10', list);
        if (stars >= 25) this.award(name, 'stars25', list);
        if (Object.values(s.games).filter(g => g.correct > 0).length >= 5) this.award(name, 'games5', list);
        if (ctx.correct && ctx.ms > 0 && ctx.ms < 3000) this.award(name, 'speed', list);
        if (s.level >= 5) this.award(name, 'level5', list);
        if (s.blitzBest >= 10) this.award(name, 'blitz10', list);
        return list;
    },

    recordTimss(name, domain, correct) {
        if (!name || !state.students.includes(name)) return;
        const s = this.get(name);
        if (!s.timss) s.timss = {};
        const d = s.timss[domain] = s.timss[domain] || { attempts: 0, correct: 0 };
        d.attempts++;
        if (correct) d.correct++;
    },

    // name berilsa — o'quvchi bo'yicha, bo'lmasa — butun sinf bo'yicha
    timssSummary(name = null) {
        const out = {};
        for (const domain of Object.keys(TIMSS.DOMAINS)) out[domain] = { attempts: 0, correct: 0, pct: 0 };
        const sources = name ? [state.stats[name]] : Object.values(state.stats);
        for (const s of sources) {
            if (!s || !s.timss) continue;
            for (const [domain, d] of Object.entries(s.timss)) {
                if (!out[domain]) continue;
                out[domain].attempts += d.attempts || 0;
                out[domain].correct += d.correct || 0;
            }
        }
        let total = 0;
        for (const d of Object.values(out)) { d.pct = d.attempts ? Math.round(d.correct / d.attempts * 100) : 0; total += d.attempts; }
        out.total = total;
        return out;
    },

    log(entry) {
        state.log.push({ t: Date.now(), ...entry });
        if (state.log.length > CONFIG.LOG_LIMIT) state.log = state.log.slice(-CONFIG.LOG_LIMIT);
    },

    classSummary() {
        let attempts = 0, correct = 0, stars = 0;
        for (const s of Object.values(state.stats)) { attempts += s.attempts || 0; correct += s.correct || 0; }
        for (const v of Object.values(state.scores)) stars += v || 0;
        return { attempts, correct, stars, accuracy: attempts ? Math.round(correct / attempts * 100) : 0 };
    },

    toCSV() {
        const rows = [['Ism', 'Yulduzlar', 'Urinishlar', "To'g'ri", 'Aniqlik %', 'Eng uzun seriya', 'Daraja', 'TIMSS Bilish %', "TIMSS Qo'llash %", 'TIMSS Mulohaza %', 'Yutuqlar']];
        for (const name of state.students) {
            const s = this.get(name);
            const t = this.timssSummary(name);
            const pct = d => t[d].attempts ? t[d].pct : '';
            rows.push([
                name, state.scores[name] || 0, s.attempts, s.correct, this.accuracy(name),
                s.bestStreak, s.level, pct('bilish'), pct('qollash'), pct('mulohaza'), s.badges.map(b => this.BADGES[b] ? this.BADGES[b].name : b).join('; '),
            ]);
        }
        return '﻿' + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    },
};
