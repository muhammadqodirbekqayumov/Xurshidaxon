/* ===================================================
   SEHRLI BARABAN — Kutish ekrani (lobby)
   Xush kelibsiz, boshlanishgacha hisoblagich, aylanuvchi baraban,
   "Bilasizmi?" faktlari va isinish savollari
   =================================================== */

const Lobby = {
    FACTS: [
        "TIMSS 1995 yildan beri har 4 yilda o'tkaziladi.",
        "TIMSSda dunyoning 60 ga yaqin davlati qatnashadi.",
        "TIMSS 4-sinf matematika: Bilish 40%, Qo'llash 40%, Mulohaza 20%.",
        "TIMSS matematika mazmuni: sonlar 50%, o'lchash va geometriya 30%, ma'lumotlar 20%.",
        "TIMSS savollarining bir qismi ochiq javobli — bola yechimini o'zi yozadi.",
        "TIMSS faqat javobni emas, bola qanday fikrlaganini ham baholaydi.",
        "111 111 111 × 111 111 111 = 12 345 678 987 654 321.",
        "9 ga karrali har qanday sonning raqamlari yig'indisi ham 9 ga bo'linadi.",
        "Uchburchak burchaklarining yig'indisi har doim 180°.",
        "Bir sutkada 86 400 soniya bor.",
        "Nol (0) raqamini matematikaga hind olimlari kiritgan.",
        "1 dan 100 gacha sonlar yig'indisi 5 050 — buni Gauss 7 yoshida topgan.",
        "Diagramma o'qiy olish — TIMSSning «Ma'lumotlar» bo'limi.",
        "Har darsda bitta «nima uchun?» savoli — mulohaza sohasini kuchaytiradi.",
    ],

    QUESTIONS: [
        { q: '1, 4, 9, 16, 25, ?', a: '36 — kvadrat sonlar' },
        { q: "Uchta ketma-ket sonning yig'indisi 96. Eng kattasi?", a: '33' },
        { q: "Tovuq va qo'ylar: 20 bosh, 56 oyoq. Nechta qo'y?", a: "8 ta qo'y" },
        { q: 'A + B = 15, B + C = 20, A + C = 19. A + B + C = ?', a: '27' },
        { q: "Kvadratning perimetri 36 sm. Yuzi?", a: '81 sm²' },
        { q: "1 dan 100 gacha 7 raqami necha marta yoziladi?", a: '20 marta' },
        { q: "Soat 10:45 dan 14:20 gacha necha daqiqa?", a: '215 daqiqa' },
        { q: "Ota 36, o'g'li 8 yoshda. Necha yildan keyin ota 3 marta katta bo'ladi?", a: '6 yildan keyin' },
        { q: "4 × 6 shokoladni bo'laklarga ajratish uchun kamida necha sindirish kerak?", a: '23' },
        { q: "Ikki sonning yig'indisi 84, biri ikkinchisidan 3 marta katta. Sonlar?", a: '63 va 21' },
        { q: "Qaysi katta: 3/4 yoki 5/7?", a: '3/4' },
        { q: "5 ta qizil, 3 ta ko'k shar. Kamida nechtasini olsak, 2 tasi bir xil rang bo'ladi?", a: '3 ta' },
        { q: '2, 3, 5, 8, 12, 17, ?', a: '23 (+1, +2, +3, …)' },
        { q: "Bir son 3 ga ham, 5 ga ham bo'linadi, 40 < son < 60. Bu?", a: '45' },
    ],

    open: false,
    timer: null,
    qIndex: 0, fIndex: 0,
    qTick: 0, fTick: 0,
    Q_EVERY: 30, Q_REVEAL: 20, F_EVERY: 12,

    refs() {
        const $ = id => document.getElementById(id);
        return {
            root: $('lobby'), title: $('lobby-title'), sub: $('lobby-sub'), count: $('lobby-count'), countLabel: $('lobby-count-label'),
            clock: $('lobby-clock'), wheel: $('lobby-wheel'), name: $('lobby-name'), add: $('lobby-add'), people: $('lobby-people'),
            q: $('lobby-q'), a: $('lobby-a'), fact: $('lobby-fact'), start: $('lobby-start'), titleInput: $('lobby-title-input'),
            subInput: $('lobby-sub-input'), startBtn: $('lobby-start-btn'), close: $('lobby-close'), qBar: $('lobby-q-bar'),
        };
    },

    settings() {
        if (!state.settings.lobby) state.settings.lobby = { title: 'TIMSS masterklass', sub: "Bilish → Qo'llash → Mulohaza", startTime: '' };
        return state.settings.lobby;
    },

    init() {
        const r = this.refs();
        if (!r.root) return;
        r.close.addEventListener('click', () => this.hide());
        r.startBtn.addEventListener('click', () => { this.hide(); UI.switchTab('baraban'); Sound.fanfare(); Confetti.launch(); });
        r.add.addEventListener('click', () => this.addName());
        r.name.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.addName(); } });
        r.start.addEventListener('change', () => { this.settings().startTime = r.start.value; Storage.save(); this.tick(); });
        r.titleInput.addEventListener('input', () => { this.settings().title = r.titleInput.value; r.title.textContent = r.titleInput.value || 'TIMSS masterklass'; Storage.save(); });
        r.subInput.addEventListener('input', () => { this.settings().sub = r.subInput.value; r.sub.textContent = r.subInput.value; Storage.save(); });
        r.q.addEventListener('click', () => this.reveal());
        this.qIndex = Math.floor(Math.random() * this.QUESTIONS.length);
        this.fIndex = Math.floor(Math.random() * this.FACTS.length);
    },

    show() {
        const r = this.refs();
        const s = this.settings();
        r.title.textContent = s.title || 'TIMSS masterklass';
        r.sub.textContent = s.sub || '';
        r.titleInput.value = s.title || '';
        r.subInput.value = s.sub || '';
        r.start.value = s.startTime || '';
        r.root.classList.remove('hidden');
        this.open = true;
        this.qTick = 0; this.fTick = 0;
        this.showQuestion(); this.showFact();
        this.renderWheel();
        this.tick();
        this.timer = setInterval(() => this.tick(), 1000);
        setTimeout(() => r.name.focus(), 100);
    },

    hide() {
        const r = this.refs();
        r.root.classList.add('hidden');
        this.open = false;
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    },

    isOpen() { return this.open; },

    addName() {
        const r = this.refs();
        const name = r.name.value;
        if (!Utils.normalizeName(name)) return;
        if (UI.addStudent(name, { silent: true })) {
            Storage.save();
            UI.updateNamesList();
            Wheel.draw();
            Sound.pop();
            Toast.success(`${Utils.avatarFor(Utils.normalizeName(name))} ${Utils.escapeHtml(Utils.normalizeName(name))} — xush kelibsiz!`, 1800);
        } else {
            Toast.error("Bu ism allaqachon ro'yxatda");
        }
        r.name.value = '';
        r.name.focus();
        this.renderWheel();
    },

    renderWheel() {
        const r = this.refs();
        if (!r.wheel) return;
        const names = state.students;
        const n = names.length;
        r.people.textContent = n === 0 ? "Hali hech kim yo'q — ismingizni kiriting 👇" : `${n} ishtirokchi`;
        if (n === 0) {
            r.wheel.style.background = 'conic-gradient(rgba(139,92,246,0.25), rgba(6,182,212,0.25), rgba(244,63,94,0.25), rgba(139,92,246,0.25))';
            r.wheel.innerHTML = '';
            return;
        }
        const seg = 360 / n;
        const stops = names.map((_, i) => {
            const c = CONFIG.WHEEL_COLORS[i % CONFIG.WHEEL_COLORS.length];
            return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
        }).join(', ');
        r.wheel.style.background = `conic-gradient(${stops})`;
        const fs = Math.max(9, Math.min(18, 300 / n));
        r.wheel.innerHTML = names.map((name, i) => {
            const angle = i * seg + seg / 2 - 90;
            const label = n <= 16 ? `${Utils.avatarFor(name)} ${Utils.escapeHtml(name)}` : Utils.escapeHtml(name);
            return `<span class="lobby-seg" style="transform:translateY(-50%) rotate(${angle}deg);font-size:${fs}px">${label}</span>`;
        }).join('');
    },

    tick() {
        const r = this.refs();
        const now = new Date();
        r.clock.textContent = `${Utils.pad2(now.getHours())}:${Utils.pad2(now.getMinutes())}:${Utils.pad2(now.getSeconds())}`;

        const st = this.settings().startTime;
        if (st) {
            const [h, m] = st.split(':').map(Number);
            const target = new Date(now); target.setHours(h, m, 0, 0);
            const diff = Math.floor((target - now) / 1000);
            if (diff > 0) {
                const hh = Math.floor(diff / 3600), mm = Math.floor((diff % 3600) / 60), ss = diff % 60;
                r.countLabel.textContent = 'Boshlanishiga';
                r.count.textContent = hh > 0 ? `${hh}:${Utils.pad2(mm)}:${Utils.pad2(ss)}` : `${Utils.pad2(mm)}:${Utils.pad2(ss)}`;
                r.count.classList.toggle('soon', diff <= 60);
            } else {
                r.countLabel.textContent = '';
                r.count.textContent = 'Boshlaymiz! 🎉';
                r.count.classList.add('soon');
            }
        } else {
            r.countLabel.textContent = 'Boshlash vaqti';
            r.count.textContent = 'belgilanmagan';
            r.count.classList.remove('soon');
        }

        // Savol va fakt aylanishi
        this.qTick++; this.fTick++;
        if (r.qBar) r.qBar.style.width = `${Math.max(0, 100 - (this.qTick / this.Q_EVERY) * 100)}%`;
        if (this.qTick === this.Q_REVEAL) this.reveal();
        if (this.qTick >= this.Q_EVERY) { this.qTick = 0; this.qIndex = (this.qIndex + 1) % this.QUESTIONS.length; this.showQuestion(); }
        if (this.fTick >= this.F_EVERY) { this.fTick = 0; this.fIndex = (this.fIndex + 1) % this.FACTS.length; this.showFact(); }
    },

    showQuestion() {
        const r = this.refs();
        const item = this.QUESTIONS[this.qIndex];
        r.q.textContent = item.q;
        r.a.classList.add('hidden');
        r.a.textContent = `Javob: ${item.a}`;
        r.q.classList.remove('fade'); void r.q.offsetWidth; r.q.classList.add('fade');
    },

    reveal() {
        const r = this.refs();
        r.a.classList.remove('hidden');
    },

    showFact() {
        const r = this.refs();
        r.fact.textContent = this.FACTS[this.fIndex];
        r.fact.classList.remove('fade'); void r.fact.offsetWidth; r.fact.classList.add('fade');
    },
};
