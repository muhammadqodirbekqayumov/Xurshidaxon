/* ===================================================
   SEHRLI BARABAN — Storage (sinflar, ballar, sozlamalar)
   =================================================== */

const Storage = {
    data: null,   // { version, activeClass, classes: { name: classData }, settings }

    load() {
        let raw = null;
        try { raw = localStorage.getItem(CONFIG.STORAGE_KEY); } catch (e) { /* localStorage yo'q */ }

        if (raw) {
            try { this.data = this._sanitize(JSON.parse(raw)); } catch (e) { this.data = null; }
        }

        if (!this.data) {
            this.data = this._migrateLegacy() || this._fresh();
        }

        if (!this.data.classes[this.data.activeClass]) {
            this.data.activeClass = Object.keys(this.data.classes)[0] || CONFIG.DEFAULT_CLASS;
            if (!this.data.classes[this.data.activeClass]) this.data.classes[this.data.activeClass] = emptyClassData();
        }

        state.settings = { ...DEFAULT_SETTINGS, ...this.data.settings };
        this.applyClass(this.data.activeClass);
    },

    _fresh() {
        return {
            version: CONFIG.VERSION,
            activeClass: CONFIG.DEFAULT_CLASS,
            classes: { [CONFIG.DEFAULT_CLASS]: emptyClassData() },
            settings: { ...DEFAULT_SETTINGS },
        };
    },

    // v1 (bitta ro'yxat) → v2 (sinflar)
    _migrateLegacy() {
        let raw = null;
        try { raw = localStorage.getItem(CONFIG.LEGACY_KEY); } catch (e) { return null; }
        if (!raw) return null;
        try {
            const old = JSON.parse(raw);
            const cls = emptyClassData();
            if (Array.isArray(old.students)) cls.students = old.students.filter(s => typeof s === 'string');
            if (old.scores && typeof old.scores === 'object') cls.scores = old.scores;
            if (old.teams && Array.isArray(old.teams.red)) cls.teams = old.teams;
            if (old.teamScores) cls.teamScores = old.teamScores;
            cls.teamMode = !!old.teamMode;
            const data = this._fresh();
            data.classes[CONFIG.DEFAULT_CLASS] = cls;
            data.settings = {
                ...DEFAULT_SETTINGS,
                soundEnabled: old.soundEnabled !== false,
                timerDuration: Number(old.timerDuration) || 15,
                difficulty: ['easy', 'medium', 'hard'].includes(old.difficulty) ? old.difficulty : 'medium',
            };
            return data;
        } catch (e) { return null; }
    },

    _sanitize(d) {
        if (!d || typeof d !== 'object' || !d.classes || typeof d.classes !== 'object') return null;
        const out = { version: CONFIG.VERSION, activeClass: String(d.activeClass || ''), classes: {}, settings: {} };
        for (const [name, cls] of Object.entries(d.classes)) {
            if (!cls || typeof cls !== 'object') continue;
            const c = emptyClassData();
            if (Array.isArray(cls.students)) c.students = cls.students.filter(s => typeof s === 'string').slice(0, CONFIG.MAX_STUDENTS);
            if (cls.scores && typeof cls.scores === 'object') c.scores = cls.scores;
            if (cls.stats && typeof cls.stats === 'object') c.stats = cls.stats;
            if (cls.teams && Array.isArray(cls.teams.red) && Array.isArray(cls.teams.blue)) c.teams = cls.teams;
            if (cls.teamScores && typeof cls.teamScores === 'object') c.teamScores = { red: Number(cls.teamScores.red) || 0, blue: Number(cls.teamScores.blue) || 0 };
            c.teamMode = !!cls.teamMode;
            c.noRepeat = !!cls.noRepeat;
            c.fairPick = cls.fairPick !== false;
            if (Array.isArray(cls.usedStudents)) c.usedStudents = cls.usedStudents;
            if (Array.isArray(cls.log)) c.log = cls.log.slice(-CONFIG.LOG_LIMIT);
            out.classes[name] = c;
        }
        if (d.settings && typeof d.settings === 'object') out.settings = d.settings;
        if (Object.keys(out.classes).length === 0) out.classes[CONFIG.DEFAULT_CLASS] = emptyClassData();
        return out;
    },

    // Sinf ma'lumotlarini state ga yuklash
    applyClass(name) {
        const cls = this.data.classes[name] || emptyClassData();
        state.className = name;
        state.students = [...cls.students];
        state.scores = { ...cls.scores };
        state.stats = JSON.parse(JSON.stringify(cls.stats || {}));
        state.teams = { red: [...cls.teams.red], blue: [...cls.teams.blue] };
        state.teamScores = { ...cls.teamScores };
        state.teamMode = cls.teamMode;
        state.noRepeat = cls.noRepeat;
        state.fairPick = cls.fairPick;
        state.usedStudents = new Set(cls.usedStudents);
        state.log = [...cls.log];
        state.currentWinner = null;
        this.data.activeClass = name;
    },

    collectClass() {
        return {
            students: state.students,
            scores: state.scores,
            stats: state.stats,
            teams: state.teams,
            teamScores: state.teamScores,
            teamMode: state.teamMode,
            noRepeat: state.noRepeat,
            fairPick: state.fairPick,
            usedStudents: [...state.usedStudents],
            log: state.log.slice(-CONFIG.LOG_LIMIT),
        };
    },

    save() {
        if (!this.data) return;
        this.data.classes[state.className] = this.collectClass();
        this.data.settings = state.settings;
        this.data.activeClass = state.className;
        this.data.version = CONFIG.VERSION;
        try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
    },

    classNames() {
        return Object.keys(this.data.classes);
    },

    createClass(name) {
        name = Utils.normalizeName(name);
        if (!name) return { ok: false, error: 'Sinf nomi bo\'sh' };
        if (this.data.classes[name]) return { ok: false, error: 'Bunday sinf allaqachon bor' };
        this.save();
        this.data.classes[name] = emptyClassData();
        this.applyClass(name);
        this.save();
        return { ok: true };
    },

    switchClass(name) {
        if (!this.data.classes[name] || name === state.className) return false;
        this.save();
        this.applyClass(name);
        this.save();
        return true;
    },

    renameClass(oldName, newName) {
        newName = Utils.normalizeName(newName);
        if (!newName || newName === oldName) return { ok: false, error: 'Nom o\'zgarmadi' };
        if (this.data.classes[newName]) return { ok: false, error: 'Bunday sinf allaqachon bor' };
        this.save();
        this.data.classes[newName] = this.data.classes[oldName];
        delete this.data.classes[oldName];
        if (state.className === oldName) state.className = newName;
        this.data.activeClass = state.className;
        this.save();
        return { ok: true };
    },

    deleteClass(name) {
        if (!this.data.classes[name]) return false;
        delete this.data.classes[name];
        if (Object.keys(this.data.classes).length === 0) {
            this.data.classes[CONFIG.DEFAULT_CLASS] = emptyClassData();
        }
        if (state.className === name) {
            this.applyClass(Object.keys(this.data.classes)[0]);
        }
        this.save();
        return true;
    },

    exportJSON() {
        this.save();
        return JSON.stringify(this.data, null, 2);
    },

    importJSON(text) {
        let parsed;
        try { parsed = JSON.parse(text); } catch (e) { return { ok: false, error: 'Fayl JSON formatida emas' }; }
        const clean = this._sanitize(parsed);
        if (!clean) return { ok: false, error: 'Fayl tuzilishi noto\'g\'ri' };
        this.data = clean;
        state.settings = { ...DEFAULT_SETTINGS, ...clean.settings };
        if (!this.data.classes[this.data.activeClass]) this.data.activeClass = Object.keys(this.data.classes)[0];
        this.applyClass(this.data.activeClass);
        this.save();
        return { ok: true, classes: Object.keys(clean.classes).length };
    },

    resetAll() {
        try { localStorage.removeItem(CONFIG.STORAGE_KEY); localStorage.removeItem(CONFIG.LEGACY_KEY); } catch (e) { /* ignore */ }
        this.data = this._fresh();
        state.settings = { ...DEFAULT_SETTINGS };
        this.applyClass(CONFIG.DEFAULT_CLASS);
        this.save();
    },
};
