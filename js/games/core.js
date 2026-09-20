/* ===================================================
   SEHRLI BARABAN — Games core (registr, natija, taymer, yordamchilar)
   Har bir o'yin: Games.register({ id, name, icon, desc, cat, run(container, G) })
   =================================================== */

const Games = {
    registry: {},
    order: [],

    CATEGORIES: {
        arifmetika: { name: 'Arifmetika', icon: '➕' },
        mantiq:     { name: 'Mantiq va sonlar', icon: '🧩' },
        dunyo:      { name: 'Hayotiy matematika', icon: '🌍' },
        jamoa:      { name: 'Jamoaviy', icon: '👥' },
        timss:      { name: 'TIMSS', icon: '🌐', desc: "Bilish → Qo'llash → Mulohaza. Tayyor 4-sinf savollari: jadval, diagramma, hayotiy masalalar" },
    },

    // --- holat ---
    timer: null,
    answered: false,
    startTime: 0,
    answerText: '',

    register(def) {
        if (this.registry[def.id]) return;
        this.registry[def.id] = def;
        this.order.push(def.id);
    },

    get(id) { return this.registry[id]; },
    list() { return this.order.map(id => this.registry[id]); },

    isEnabled(id) {
        const en = state.settings.enabledGames;
        return en == null || en.includes(id);
    },

    // Barabanda tushishi mumkin bo'lgan o'yinlar
    pool() {
        return this.list().filter(d => this.isEnabled(d.id) && (!d.team || state.teamMode));
    },

    randomId(exclude = null) {
        let p = this.pool().filter(d => d.id !== exclude);
        if (!p.length) p = this.pool();
        if (!p.length) p = this.list().filter(d => !d.team);
        return Utils.pick(p).id;
    },

    // ---------- Boshlash ----------
    begin(id, container) {
        const def = this.registry[id];
        if (!def) return;
        this.clearTimer();
        this.answered = false;
        this._resultShown = false;
        this.answerText = '';
        this.startTime = performance.now();
        container.innerHTML = '';
        def.run(container, this);
        this.mountGlobalTimer(container, def);
    },

    // ---------- Taymer ----------
    clearTimer() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    },

    startCountdown(seconds, { numberEl, barEl, onTick, onEnd } = {}) {
        this.clearTimer();
        let left = seconds;
        const total = seconds;
        const render = () => {
            if (numberEl) {
                numberEl.textContent = left;
                numberEl.classList.remove('warning', 'danger');
                if (left <= 5) numberEl.classList.add('danger');
                else if (left <= 10) numberEl.classList.add('warning');
            }
            if (barEl) {
                barEl.style.width = Math.max(0, (left / total) * 100) + '%';
                barEl.classList.toggle('danger', left <= 5);
            }
        };
        render();
        this.timer = setInterval(() => {
            if (this.answered) { this.clearTimer(); return; }
            left--;
            render();
            if (left > 0 && left <= 10) Sound.countdown();
            if (onTick) onTick(left);
            if (left <= 0) {
                this.clearTimer();
                if (!this.answered && onEnd) onEnd();
            }
        }, 1000);
    },

    mountGlobalTimer(container, def) {
        const secs = Number(state.settings.globalTimer) || 0;
        if (!secs || def.noTimer) return;
        const bar = document.createElement('div');
        bar.className = 'timer-bar';
        bar.innerHTML = `<div class="timer-fill"></div><span class="timer-num"></span>`;
        container.prepend(bar);
        this.startCountdown(secs, {
            numberEl: bar.querySelector('.timer-num'),
            barEl: bar.querySelector('.timer-fill'),
            onEnd: () => {
                this.showResult(false, `Vaqt tugadi! ⏰${this.answerText ? ' Javob: ' + this.answerText : ''}`);
            },
        });
    },

    // ---------- Yordamchi HTML ----------
    optionsHtml(options, opts = {}) {
        const cls = opts.cls || 'option-btn';
        const wrap = opts.wrapCls || 'options-grid';
        const format = opts.format || (v => v);
        return `<div class="${wrap}">${options.map((o, i) =>
            `<button class="${cls} kbd-opt" data-value="${Utils.escapeHtml(o)}" data-key="${i + 1}">` +
            `<span class="opt-key">${i + 1}</span><span class="opt-text">${Utils.escapeHtml(format(o))}</span></button>`
        ).join('')}</div>`;
    },

    // Variant tugmalarini bog'lash: to'g'ri/noto'g'ri belgilaydi, keyin onAnswer(ok, value)
    bindOptions(container, correctValue, onAnswer) {
        const btns = [...container.querySelectorAll('.kbd-opt')];
        let done = false;
        const correctStr = String(correctValue);
        btns.forEach(btn => btn.addEventListener('click', () => {
            if (done || this.answered) return;
            done = true;
            const val = btn.dataset.value;
            const ok = val === correctStr;
            btns.forEach(b => {
                if (b.dataset.value === correctStr) b.classList.add('correct');
                else if (b === btn) b.classList.add('wrong');
                else b.classList.add('dim');
                b.disabled = true;
            });
            onAnswer(ok, val);
        }));
    },

    inputRow(placeholder = '?') {
        return `<div class="answer-row">
            <input type="number" class="answer-input" id="game-answer" placeholder="${placeholder}" inputmode="numeric" autocomplete="off">
            <button class="answer-submit" id="game-submit" title="Tekshirish (Enter)">✓</button>
        </div>`;
    },

    bindInput(container, onSubmit) {
        const input = container.querySelector('#game-answer');
        const submit = container.querySelector('#game-submit');
        if (!input || !submit) return;
        setTimeout(() => input.focus(), 80);
        const check = () => {
            if (this.answered) return;
            const val = parseInt(input.value, 10);
            if (isNaN(val)) {
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 400);
                input.focus();
                return;
            }
            input.disabled = true;
            submit.disabled = true;
            onSubmit(val);
        };
        submit.addEventListener('click', check);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    },

    // ---------- Natija ----------
    /**
     * @param {boolean} correct
     * @param {string} message
     * @param {object} opts { stars, hint, noStats, noTeam, neutral }
     */
    showResult(correct, message, opts = {}) {
        if (this.answered && this._resultShown) return;
        this.answered = true;
        this._resultShown = true;
        this.clearTimer();

        const name = state.currentWinner;
        const gameId = state.currentGame;
        const isRealStudent = name && state.students.includes(name);
        const stars = opts.stars != null ? opts.stars : (correct ? 1 : 0);
        const ms = Math.round(performance.now() - this.startTime);

        let res = { newBadges: [], streak: 0, levelChange: 0, bonus: false };
        if (!opts.noStats && isRealStudent) res = Stats.recordAnswer(name, gameId, correct, ms);

        let earned = 0;
        if (correct && stars > 0 && isRealStudent) earned += this.awardStars(stars, { noTeam: opts.noTeam });
        if (res.bonus && isRealStudent) earned += this.awardStars(1, { noTeam: true });

        // Ovoz va effektlar
        if (!opts.neutral) {
            if (correct) {
                Sound.win();
                if (stars >= 2) Confetti.burst(); else Confetti.launch();
            } else {
                Sound.wrong();
            }
        }

        // Xabarlar ketma-ketligi
        let delay = 500;
        if (res.bonus) {
            setTimeout(() => { Sound.streak(); Toast.success(`🔥 ${res.streak} ta ketma-ket! Seriya bonusi +1 ⭐`); }, delay);
            delay += 700;
        }
        if (res.levelChange > 0) {
            setTimeout(() => { Sound.levelUp(); Toast.info(`📈 Daraja oshdi: ${MathGen.levelLabel(Stats.levelOf(name))}`); }, delay);
            delay += 700;
        } else if (res.levelChange < 0) {
            setTimeout(() => Toast.info(`📉 Daraja biroz pasaydi: ${MathGen.levelLabel(Stats.levelOf(name))}`), delay);
            delay += 700;
        }
        res.newBadges.forEach(id => {
            const b = Stats.BADGES[id];
            if (!b) return;
            setTimeout(() => { Sound.badge(); Toast.success(`${b.icon} Yangi yutuq: <b>${b.name}</b> — ${b.desc}`, 3500); }, delay);
            delay += 700;
        });

        // Natija matni
        const resultEl = document.getElementById('game-result');
        resultEl.className = `game-result ${opts.neutral ? 'neutral' : correct ? 'correct' : 'wrong'}`;
        resultEl.textContent = message + (earned > 0 ? `  +${earned} ⭐` : '');
        resultEl.classList.remove('hidden');

        const hintEl = document.getElementById('game-hint');
        if (opts.hint) {
            hintEl.innerHTML = `💡 ${Utils.escapeHtml(opts.hint)}`;
            hintEl.classList.remove('hidden');
        } else {
            hintEl.classList.add('hidden');
        }

        document.getElementById('retry-game-btn').classList.remove('hidden');
        document.getElementById('next-game-btn').classList.remove('hidden');
        document.getElementById('spin-again-btn').classList.toggle('hidden', state.students.length < 2);

        if (isRealStudent && !opts.noStats) {
            Stats.log({ name, game: gameId, correct, stars: earned });
        }

        Storage.save();
        UI.updateLeaderboard();
        UI.updateLog();
        UI.updateWinnerMeta();
        UI.updateTeamScores();
    },

    awardStars(n, { noTeam = false, name = state.currentWinner } = {}) {
        if (!name || !state.students.includes(name)) return 0;
        state.scores[name] = (state.scores[name] || 0) + n;
        if (state.teamMode && !noTeam) {
            if (state.teams.red.includes(name)) state.teamScores.red += n;
            else if (state.teams.blue.includes(name)) state.teamScores.blue += n;
        }
        return n;
    },

    resetResultFlag() { this._resultShown = false; },
};
