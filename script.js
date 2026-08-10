/* ===================================================
   SEHRLI BARABAN — Main Application Logic
   Wheel, 6 Games, Sounds, Confetti, Team Mode
   =================================================== */

// ==================== CONFIGURATION ====================
const CONFIG = {
    WHEEL_COLORS: [
        '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b',
        '#ec4899', '#3b82f6', '#ef4444', '#14b8a6', '#a855f7',
        '#f97316', '#6366f1', '#22d3ee', '#e11d48', '#84cc16',
        '#d946ef', '#0ea5e9', '#fb923c',
    ],
    CONFETTI_COLORS: ['#8b5cf6','#06b6d4','#f43f5e','#10b981','#f59e0b','#ec4899','#3b82f6','#ffd700'],
    GAME_TYPES: ['bomba','tezkor','sirli','tarozi','ketma','hayo'],
    SPIN_DURATION_MIN: 4000,
    SPIN_DURATION_MAX: 7000,
    SPIN_ROTATIONS_MIN: 8,
    SPIN_ROTATIONS_MAX: 18,
};

// ==================== STATE ====================
const state = {
    students: [],
    scores: {},          // { name: number }
    teamMode: false,
    teams: { red: [], blue: [] },
    teamScores: { red: 0, blue: 0 },
    noRepeat: false,
    usedStudents: new Set(),
    currentWinner: null,
    currentGame: null,
    soundEnabled: true,
    timerDuration: 15,
    difficulty: 'medium',
};

// ==================== STORAGE ====================
const Storage = {
    KEY: 'sehrli_baraban_data',

    save() {
        const data = {
            students: state.students,
            scores: state.scores,
            teamMode: state.teamMode,
            teams: state.teams,
            teamScores: state.teamScores,
            soundEnabled: state.soundEnabled,
            timerDuration: state.timerDuration,
            difficulty: state.difficulty,
        };
        try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch(e) {}
    },

    load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.students) state.students = data.students;
            if (data.scores) state.scores = data.scores;
            if (data.teamMode != null) state.teamMode = data.teamMode;
            if (data.teams) state.teams = data.teams;
            if (data.teamScores) state.teamScores = data.teamScores;
            if (data.soundEnabled != null) state.soundEnabled = data.soundEnabled;
            if (data.timerDuration) state.timerDuration = data.timerDuration;
            if (data.difficulty) state.difficulty = data.difficulty;
        } catch(e) {}
    },
};

// ==================== SOUND ====================
const Sound = {
    ctx: null,

    ensure() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    play(freq, type, duration, vol = 0.25) {
        if (!state.soundEnabled) return;
        try {
            this.ensure();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    },

    tick()  { this.play(900, 'sine', 0.04, 0.15); },

    win() {
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.play(f, 'sine', 0.25, 0.25), i * 120));
    },

    wrong()    { this.play(220, 'sawtooth', 0.25, 0.15); },
    countdown(){ this.play(440, 'sine', 0.08, 0.12); },

    bomb() {
        this.play(80, 'sawtooth', 0.4, 0.35);
        setTimeout(() => this.play(50, 'square', 0.3, 0.3), 150);
    },

    fanfare() {
        [392,494,587,784].forEach((f,i) => setTimeout(() => this.play(f,'triangle',0.35,0.3), i*100));
    },
};

// ==================== CONFETTI ====================
const Confetti = {
    canvas: null, ctx: null, particles: [], running: false,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    launch() {
        for (let i = 0; i < 120; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: -10 - Math.random() * 80,
                w: 4 + Math.random() * 8,
                h: 4 + Math.random() * 8,
                color: CONFIG.CONFETTI_COLORS[Math.floor(Math.random() * CONFIG.CONFETTI_COLORS.length)],
                vx: (Math.random() - 0.5) * 5,
                vy: 2 + Math.random() * 4,
                rot: Math.random() * 360,
                rv: (Math.random() - 0.5) * 12,
                life: 1,
            });
        }
        if (!this.running) { this.running = true; this.animate(); }
    },

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => p.life > 0.01);
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.rot += p.rv;
            p.life -= 0.004;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rot * Math.PI / 180);
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            this.ctx.restore();
        }
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.running = false;
        }
    },
};

// ==================== WHEEL ====================
const Wheel = {
    canvas: null, ctx: null,
    angle: 0,
    spinning: false,
    lastSegment: -1,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => { this.resize(); this.draw(); });
        this.draw();
    },

    resize() {
        const wrapper = this.canvas.parentElement;
        const size = Math.min(wrapper.clientWidth, wrapper.clientHeight, 450);
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.displaySize = size;
    },

    draw() {
        const ctx = this.ctx;
        const size = this.displaySize;
        const cx = size / 2;
        const cy = size / 2;
        const r = cx - 8;
        const n = state.students.length;

        ctx.clearRect(0, 0, size, size);

        if (n === 0) {
            // Empty state
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.font = `600 ${Math.max(14, size * 0.04)}px Nunito, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Ismlarni qo'shing", cx, cy - 10);
            ctx.font = `400 ${Math.max(11, size * 0.03)}px Nunito, sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillText('👆', cx, cy + 20);
            return;
        }

        const segAngle = (Math.PI * 2) / n;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.angle);

        // Draw segments
        for (let i = 0; i < n; i++) {
            const start = i * segAngle - Math.PI / 2;
            const end = start + segAngle;
            const color = CONFIG.WHEEL_COLORS[i % CONFIG.WHEEL_COLORS.length];
            const isUsed = state.noRepeat && state.usedStudents.has(state.students[i]);

            // Segment fill
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, start, end);
            ctx.closePath();
            ctx.fillStyle = isUsed ? 'rgba(60,60,80,0.6)' : color;
            ctx.fill();

            // Segment border
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Text
            ctx.save();
            ctx.rotate(start + segAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const fontSize = Math.max(10, Math.min(16, r * 0.1, (segAngle * r * 0.35)));
            ctx.font = `700 ${fontSize}px Nunito, sans-serif`;
            ctx.fillStyle = isUsed ? 'rgba(255,255,255,0.3)' : '#fff';
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 3;

            // Truncate long names
            let name = state.students[i];
            const maxW = r * 0.65;
            while (ctx.measureText(name).width > maxW && name.length > 2) {
                name = name.slice(0, -1);
            }
            if (name !== state.students[i]) name += '…';

            ctx.fillText(name, r - 12, 0);
            ctx.restore();
        }

        // Center circle
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Outer ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139,92,246,0.2)';
        ctx.lineWidth = 3;
        ctx.stroke();
    },

    spin() {
        if (this.spinning || state.students.length < 2) return;

        // Check if all students used in no-repeat mode
        const available = state.students.filter(s => !state.usedStudents.has(s));
        if (state.noRepeat && available.length === 0) {
            state.usedStudents.clear();
            UI.updateNamesList();
        }

        this.spinning = true;
        UI.refs.spinBtn.disabled = true;

        const duration = CONFIG.SPIN_DURATION_MIN + Math.random() * (CONFIG.SPIN_DURATION_MAX - CONFIG.SPIN_DURATION_MIN);
        const totalRotation = Math.PI * 2 * (CONFIG.SPIN_ROTATIONS_MIN + Math.random() * (CONFIG.SPIN_ROTATIONS_MAX - CONFIG.SPIN_ROTATIONS_MIN));

        // Ensure winner is an available student
        let targetWinnerIndex;
        if (state.noRepeat) {
            const availableIndices = state.students
                .map((s, i) => state.usedStudents.has(s) ? -1 : i)
                .filter(i => i >= 0);
            targetWinnerIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        } else {
            targetWinnerIndex = Math.floor(Math.random() * state.students.length);
        }

        const segAngle = (Math.PI * 2) / state.students.length;
        // Calculate angle so that targetWinnerIndex lands under the pointer
        const targetAngle = targetWinnerIndex * segAngle + segAngle * (0.15 + Math.random() * 0.7);
        const fullRotations = Math.floor(totalRotation / (Math.PI * 2)) * Math.PI * 2;
        const finalAngle = this.angle + fullRotations + targetAngle - (this.angle % (Math.PI * 2));

        const startAngle = this.angle;
        const startTime = performance.now();
        this.lastSegment = -1;

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart for realistic deceleration
            const eased = 1 - Math.pow(1 - progress, 4);
            this.angle = startAngle + (finalAngle - startAngle) * eased;

            // Tick sound at segment boundaries
            const n = state.students.length;
            const seg = Math.floor(((this.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / segAngle);
            if (seg !== this.lastSegment) {
                this.lastSegment = seg;
                if (progress < 0.95) Sound.tick();
            }

            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.spinning = false;
                UI.refs.spinBtn.disabled = false;
                this.onSpinComplete(targetWinnerIndex);
            }
        };
        requestAnimationFrame(animate);
    },

    onSpinComplete(winnerIndex) {
        const winner = state.students[winnerIndex];
        state.currentWinner = winner;

        if (state.noRepeat) {
            state.usedStudents.add(winner);
            UI.updateNamesList();
        }

        Sound.fanfare();
        Confetti.launch();

        // Pick random game
        const gameType = CONFIG.GAME_TYPES[Math.floor(Math.random() * CONFIG.GAME_TYPES.length)];
        UI.showGameModal(winner, gameType);
    },
};

// ==================== MATH HELPERS ====================
const MathGen = {
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    // Generate arithmetic problem based on difficulty
    genProblem() {
        const d = state.difficulty;
        const ops = d === 'easy' ? ['+','-'] : d === 'medium' ? ['+','-','×','÷'] : ['+','-','×','÷'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a, b, answer;

        switch(op) {
            case '+':
                if (d === 'easy') { a = this.randInt(1, 20); b = this.randInt(1, 20); }
                else if (d === 'medium') { a = this.randInt(10, 50); b = this.randInt(10, 50); }
                else { a = this.randInt(20, 100); b = this.randInt(20, 100); }
                answer = a + b;
                return { text: `${a} + ${b}`, answer, a, b, op };
            case '-':
                if (d === 'easy') { a = this.randInt(5, 20); b = this.randInt(1, a); }
                else if (d === 'medium') { a = this.randInt(20, 100); b = this.randInt(1, a); }
                else { a = this.randInt(50, 200); b = this.randInt(1, a); }
                answer = a - b;
                return { text: `${a} − ${b}`, answer, a, b, op };
            case '×':
                if (d === 'easy') { a = this.randInt(2, 5); b = this.randInt(2, 5); }
                else if (d === 'medium') { a = this.randInt(2, 9); b = this.randInt(2, 9); }
                else { a = this.randInt(2, 12); b = this.randInt(2, 12); }
                answer = a * b;
                return { text: `${a} × ${b}`, answer, a, b, op };
            case '÷':
                if (d === 'medium') { b = this.randInt(2, 9); answer = this.randInt(1, 9); }
                else { b = this.randInt(2, 12); answer = this.randInt(1, 12); }
                a = b * answer;
                return { text: `${a} ÷ ${b}`, answer, a, b, op };
        }
    },

    genExpression() {
        const p = this.genProblem();
        return { text: p.text, value: p.answer };
    },

    genWrongAnswers(correct, count) {
        const wrongs = new Set();
        while (wrongs.size < count) {
            let delta = this.randInt(1, Math.max(5, Math.ceil(correct * 0.3)));
            if (Math.random() < 0.5) delta = -delta;
            const w = correct + delta;
            if (w !== correct && w >= 0) wrongs.add(w);
        }
        return [...wrongs];
    },
};

// ==================== GAMES ====================
const Games = {
    timer: null,
    answered: false,

    clearTimer() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    },

    // ---- BOMBA ----
    bomba(container) {
        this.answered = false;
        const problem = MathGen.genProblem();
        let timeLeft = state.timerDuration;

        container.innerHTML = `
            <div class="bomb-display">
                <div class="bomb-icon" id="bomb-icon">💣</div>
                <div class="bomb-timer" id="bomb-timer">${timeLeft}</div>
            </div>
            <div class="problem-text">${problem.text} = ?</div>
            <div class="answer-row">
                <input type="number" class="answer-input" id="game-answer" placeholder="?" inputmode="numeric" autocomplete="off">
                <button class="answer-submit" id="game-submit">✓</button>
            </div>
        `;

        const timerEl = container.querySelector('#bomb-timer');
        const bombEl = container.querySelector('#bomb-icon');
        const input = container.querySelector('#game-answer');
        const submit = container.querySelector('#game-submit');

        input.focus();

        const check = () => {
            if (this.answered) return;
            const val = parseInt(input.value);
            if (isNaN(val)) return;
            this.answered = true;
            this.clearTimer();

            if (val === problem.answer) {
                bombEl.textContent = '✅';
                bombEl.className = 'bomb-icon defused';
                this.showResult(true, `To'g'ri! 🎉 ${problem.text} = ${problem.answer}`);
            } else {
                bombEl.textContent = '💥';
                bombEl.className = 'bomb-icon exploded';
                this.showResult(false, `Noto'g'ri! To'g'ri javob: ${problem.answer}`);
            }
        };

        submit.addEventListener('click', check);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });

        this.timer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 5) timerEl.className = 'bomb-timer danger';
            else if (timeLeft <= 10) timerEl.className = 'bomb-timer warning';
            Sound.countdown();

            if (timeLeft <= 0) {
                this.clearTimer();
                if (!this.answered) {
                    this.answered = true;
                    bombEl.textContent = '💥';
                    bombEl.className = 'bomb-icon exploded';
                    Sound.bomb();
                    this.showResult(false, `Vaqt tugadi! 💥 Javob: ${problem.answer}`);
                }
            }
        }, 1000);
    },

    // ---- TEZKOR HISOB ----
    tezkor(container) {
        this.answered = false;
        const problem = MathGen.genProblem();
        const wrongs = MathGen.genWrongAnswers(problem.answer, 3);
        const options = MathGen.shuffle([problem.answer, ...wrongs]);

        container.innerHTML = `
            <div class="problem-text">${problem.text} = ?</div>
            <div class="options-grid">
                ${options.map(o => `<button class="option-btn" data-value="${o}">${o}</button>`).join('')}
            </div>
        `;

        container.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                this.answered = true;
                const val = parseInt(btn.dataset.value);
                const correct = val === problem.answer;

                // Highlight all buttons
                container.querySelectorAll('.option-btn').forEach(b => {
                    if (parseInt(b.dataset.value) === problem.answer) b.classList.add('correct');
                    else b.classList.add('wrong');
                    b.style.pointerEvents = 'none';
                });

                this.showResult(correct,
                    correct ? `To'g'ri! 🎉 ${problem.text} = ${problem.answer}`
                            : `Noto'g'ri! To'g'ri javob: ${problem.answer}`);
            });
        });
    },

    // ---- SIRLI SON ----
    sirli(container) {
        this.answered = false;

        // Pick a rule
        const rules = [
            { name: 'juft', check: n => n % 2 === 0, gen: () => MathGen.randInt(1, 25) * 2, oddGen: () => MathGen.randInt(1, 25) * 2 - 1 },
            { name: 'toq', check: n => n % 2 !== 0, gen: () => MathGen.randInt(1, 25) * 2 - 1, oddGen: () => MathGen.randInt(1, 25) * 2 },
            { name: '5ga karrali', check: n => n % 5 === 0, gen: () => MathGen.randInt(1, 15) * 5, oddGen: () => { let v; do { v = MathGen.randInt(1, 74); } while(v % 5 === 0); return v; }},
            { name: '3ga karrali', check: n => n % 3 === 0, gen: () => MathGen.randInt(1, 20) * 3, oddGen: () => { let v; do { v = MathGen.randInt(1, 59); } while(v % 3 === 0); return v; }},
        ];
        const rule = rules[Math.floor(Math.random() * rules.length)];

        // Generate 5 matching + 1 odd
        const matching = new Set();
        while (matching.size < 5) matching.add(rule.gen());
        let odd;
        do { odd = rule.oddGen(); } while (matching.has(odd));

        const all = MathGen.shuffle([...matching, odd]);

        container.innerHTML = `
            <p class="instruction-text">Qaysi son boshqalardan farq qiladi? 🤔</p>
            <div class="numbers-grid">
                ${all.map(n => `<button class="number-btn" data-value="${n}">${n}</button>`).join('')}
            </div>
        `;

        container.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                this.answered = true;
                const val = parseInt(btn.dataset.value);
                const correct = val === odd;

                // Highlight
                container.querySelectorAll('.number-btn').forEach(b => {
                    if (parseInt(b.dataset.value) === odd) b.classList.add('correct');
                    else b.classList.add('wrong');
                    b.style.pointerEvents = 'none';
                });

                this.showResult(correct,
                    correct ? `To'g'ri! 🎉 ${odd} — boshqacha (boshqalari ${rule.name})`
                            : `Noto'g'ri! Javob: ${odd} (boshqalari ${rule.name})`);
            });
        });
    },

    // ---- TAROZI ----
    tarozi(container) {
        this.answered = false;
        const left = MathGen.genExpression();
        const right = MathGen.genExpression();
        const correctSign = left.value > right.value ? '>' : left.value < right.value ? '<' : '=';

        container.innerHTML = `
            <div class="tarozi-display">
                <div class="tarozi-pans">
                    <div class="tarozi-pan" id="pan-left">${left.text}</div>
                    <div class="tarozi-scale">⚖️</div>
                    <div class="tarozi-pan" id="pan-right">${right.text}</div>
                </div>
                <div class="compare-btns">
                    <button class="compare-btn" data-value="<">&lt;</button>
                    <button class="compare-btn" data-value="=">=</button>
                    <button class="compare-btn" data-value=">">&gt;</button>
                </div>
            </div>
        `;

        container.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                this.answered = true;
                const val = btn.dataset.value;
                const correct = val === correctSign;

                // Animate pans
                const panL = container.querySelector('#pan-left');
                const panR = container.querySelector('#pan-right');
                if (left.value > right.value) panR.classList.add('right-down');
                else if (left.value < right.value) panL.classList.add('left-down');

                container.querySelectorAll('.compare-btn').forEach(b => {
                    if (b.dataset.value === correctSign) b.classList.add('correct');
                    else b.classList.add('wrong');
                    b.style.pointerEvents = 'none';
                });

                this.showResult(correct,
                    correct ? `To'g'ri! 🎉 ${left.text} (${left.value}) ${correctSign} ${right.text} (${right.value})`
                            : `Noto'g'ri! ${left.text} (${left.value}) ${correctSign} ${right.text} (${right.value})`);
            });
        });
    },

    // ---- KETMA-KETLIK ----
    ketma(container) {
        this.answered = false;
        const step = MathGen.randInt(2, 10);
        const start = MathGen.randInt(1, 20);
        const count = MathGen.randInt(4, 5);
        const sequence = [];
        for (let i = 0; i < count; i++) sequence.push(start + step * i);
        const answer = start + step * count;

        container.innerHTML = `
            <p class="instruction-text">Keyingi son nima? 🔢</p>
            <div class="sequence-row">
                ${sequence.map(n => `<span class="seq-num">${n}</span>`).join('')}
                <span class="seq-num seq-mystery">?</span>
            </div>
            <div class="answer-row">
                <input type="number" class="answer-input" id="game-answer" placeholder="?" inputmode="numeric" autocomplete="off">
                <button class="answer-submit" id="game-submit">✓</button>
            </div>
        `;

        const input = container.querySelector('#game-answer');
        const submit = container.querySelector('#game-submit');
        input.focus();

        const check = () => {
            if (this.answered) return;
            const val = parseInt(input.value);
            if (isNaN(val)) return;
            this.answered = true;
            const correct = val === answer;

            // Reveal answer in mystery box
            container.querySelector('.seq-mystery').textContent = answer;
            container.querySelector('.seq-mystery').style.color = correct ? '#10b981' : '#f43f5e';
            container.querySelector('.seq-mystery').style.animation = 'none';

            this.showResult(correct,
                correct ? `To'g'ri! 🎉 Ketma-ketlik: +${step}`
                        : `Noto'g'ri! Javob: ${answer} (qadam: +${step})`);
        };

        submit.addEventListener('click', check);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    },

    // ---- HA YOKI YO'Q ----
    hayo(container) {
        this.answered = false;
        const problem = MathGen.genProblem();
        // 50% chance to show correct answer, 50% wrong
        const showCorrect = Math.random() < 0.5;
        let shownAnswer;
        if (showCorrect) {
            shownAnswer = problem.answer;
        } else {
            const delta = MathGen.randInt(1, Math.max(3, Math.ceil(problem.answer * 0.2)));
            shownAnswer = problem.answer + (Math.random() < 0.5 ? delta : -delta);
            if (shownAnswer === problem.answer) shownAnswer = problem.answer + 1;
        }

        container.innerHTML = `
            <div class="problem-text">${problem.text} = ${shownAnswer}</div>
            <p class="instruction-text">Bu to'g'rimi? 🤔</p>
            <div class="hayo-btns">
                <button class="hayo-btn yes" data-value="true">Ha ✅</button>
                <button class="hayo-btn no" data-value="false">Yo'q ❌</button>
            </div>
        `;

        container.querySelectorAll('.hayo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                this.answered = true;
                const userSaysYes = btn.dataset.value === 'true';
                const isCorrectStatement = showCorrect;
                const correct = userSaysYes === isCorrectStatement;

                container.querySelectorAll('.hayo-btn').forEach(b => {
                    b.style.pointerEvents = 'none';
                });

                if (correct) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('wrong');
                    // Highlight the correct answer
                    const correctBtn = container.querySelector(`.hayo-btn[data-value="${isCorrectStatement}"]`);
                    if (correctBtn) correctBtn.classList.add('correct');
                }

                const explanation = showCorrect
                    ? `${problem.text} = ${problem.answer} ✅`
                    : `${problem.text} = ${problem.answer} (${shownAnswer} emas!)`;

                this.showResult(correct,
                    correct ? `To'g'ri! 🎉 ${explanation}`
                            : `Noto'g'ri! ${explanation}`);
            });
        });
    },

    // ---- Show Result ----
    showResult(correct, message) {
        if (correct) {
            Sound.win();
            Confetti.launch();
            this.awardStar();
        } else {
            Sound.wrong();
        }

        const resultEl = document.getElementById('game-result');
        resultEl.className = `game-result ${correct ? 'correct' : 'wrong'}`;
        resultEl.textContent = message;
        resultEl.classList.remove('hidden');

        // Show action buttons
        document.getElementById('next-game-btn').classList.remove('hidden');
        document.getElementById('spin-again-btn').classList.remove('hidden');
    },

    awardStar() {
        const winner = state.currentWinner;
        if (!winner) return;
        state.scores[winner] = (state.scores[winner] || 0) + 1;

        // Team scoring
        if (state.teamMode) {
            if (state.teams.red.includes(winner)) state.teamScores.red++;
            else if (state.teams.blue.includes(winner)) state.teamScores.blue++;
            UI.updateTeamScores();
        }

        Storage.save();
        UI.updateLeaderboard();
    },
};

// ==================== UI ====================
const UI = {
    refs: {},

    init() {
        // Cache DOM references
        this.refs = {
            spinBtn: document.getElementById('spin-btn'),
            nameInput: document.getElementById('name-input'),
            addNameBtn: document.getElementById('add-name-btn'),
            namesList: document.getElementById('names-list'),
            namesEmpty: document.getElementById('names-empty'),
            namesActions: document.getElementById('names-actions'),
            clearNamesBtn: document.getElementById('clear-names-btn'),
            noRepeatToggle: document.getElementById('no-repeat-toggle'),
            teamToggle: document.getElementById('team-toggle'),
            teamDisplay: document.getElementById('team-display'),
            reshuffleBtn: document.getElementById('reshuffle-teams-btn'),
            redScore: document.getElementById('red-score'),
            blueScore: document.getElementById('blue-score'),
            leaderboard: document.getElementById('leaderboard'),
            leaderboardEmpty: document.getElementById('leaderboard-empty'),
            resetScoresBtn: document.getElementById('reset-scores-btn'),
            gameModal: document.getElementById('game-modal'),
            settingsModal: document.getElementById('settings-modal'),
            winnerName: document.getElementById('winner-name'),
            winnerTeamBadge: document.getElementById('winner-team-badge'),
            gameArea: document.getElementById('game-area'),
            gameResult: document.getElementById('game-result'),
            nextGameBtn: document.getElementById('next-game-btn'),
            spinAgainBtn: document.getElementById('spin-again-btn'),
            soundToggle: document.getElementById('sound-toggle'),
            timerSelect: document.getElementById('timer-select'),
            difficultySelect: document.getElementById('difficulty-select'),
        };

        this.bindEvents();
        this.syncSettingsUI();
        this.updateNamesList();
        this.updateLeaderboard();
        this.updateTeamMode();
    },

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Add student
        this.refs.addNameBtn.addEventListener('click', () => this.addStudent());
        this.refs.nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') this.addStudent(); });

        // Spin
        this.refs.spinBtn.addEventListener('click', () => {
            Sound.ensure && Sound.ensure();
            Wheel.spin();
        });

        // Clear names
        this.refs.clearNamesBtn.addEventListener('click', () => {
            if (confirm("Barcha ismlarni o'chirmoqchimisiz?")) {
                state.students = [];
                state.scores = {};
                state.usedStudents.clear();
                state.teams = { red: [], blue: [] };
                state.teamScores = { red: 0, blue: 0 };
                Storage.save();
                this.updateNamesList();
                this.updateLeaderboard();
                this.updateTeamScores();
                Wheel.draw();
            }
        });

        // No-repeat toggle
        this.refs.noRepeatToggle.addEventListener('change', () => {
            state.noRepeat = this.refs.noRepeatToggle.checked;
            state.usedStudents.clear();
            this.updateNamesList();
        });

        // Team toggle
        this.refs.teamToggle.addEventListener('change', () => {
            state.teamMode = this.refs.teamToggle.checked;
            this.updateTeamMode();
            Storage.save();
        });

        // Reshuffle teams
        this.refs.reshuffleBtn.addEventListener('click', () => this.shuffleTeams());

        // Reset scores
        this.refs.resetScoresBtn.addEventListener('click', () => {
            if (confirm("Barcha natijalarni tozalamoqchimisiz?")) {
                state.scores = {};
                state.teamScores = { red: 0, blue: 0 };
                Storage.save();
                this.updateLeaderboard();
                this.updateTeamScores();
            }
        });

        // Game modal actions
        this.refs.nextGameBtn.addEventListener('click', () => {
            const gameType = CONFIG.GAME_TYPES[Math.floor(Math.random() * CONFIG.GAME_TYPES.length)];
            this.startGame(gameType);
        });

        this.refs.spinAgainBtn.addEventListener('click', () => {
            this.closeModal(this.refs.gameModal);
            setTimeout(() => Wheel.spin(), 300);
        });

        // Modal close buttons
        document.getElementById('modal-close-btn').addEventListener('click', () => {
            Games.clearTimer();
            this.closeModal(this.refs.gameModal);
        });
        document.getElementById('settings-close-btn').addEventListener('click', () => this.closeModal(this.refs.settingsModal));

        // Modal overlay close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                Games.clearTimer();
                this.closeModal(overlay.closest('.modal'));
            });
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => this.openModal(this.refs.settingsModal));
        this.refs.soundToggle.addEventListener('change', () => { state.soundEnabled = this.refs.soundToggle.checked; Storage.save(); });
        this.refs.timerSelect.addEventListener('change', () => { state.timerDuration = parseInt(this.refs.timerSelect.value); Storage.save(); });
        this.refs.difficultySelect.addEventListener('change', () => { state.difficulty = this.refs.difficultySelect.value; Storage.save(); });

        // Game cards on O'yinlar tab
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameType = card.dataset.game;
                state.currentWinner = state.students.length > 0
                    ? state.students[Math.floor(Math.random() * state.students.length)]
                    : 'O\'yinchi';
                this.showGameModal(state.currentWinner, gameType);
            });
        });

        // Keyboard shortcut: Space to spin
        document.addEventListener('keydown', e => {
            if (e.code === 'Space' && !Wheel.spinning && !this.refs.gameModal.classList.contains('hidden') === false
                && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                Wheel.spin();
            }
        });
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    },

    addStudent() {
        const name = this.refs.nameInput.value.trim();
        if (!name) return;
        if (state.students.includes(name)) {
            this.refs.nameInput.classList.add('shake');
            setTimeout(() => this.refs.nameInput.classList.remove('shake'), 400);
            return;
        }
        state.students.push(name);
        state.scores[name] = state.scores[name] || 0;
        this.refs.nameInput.value = '';
        this.refs.nameInput.focus();
        Storage.save();
        this.updateNamesList();
        Wheel.draw();

        if (state.teamMode) this.shuffleTeams();
    },

    removeStudent(index) {
        const name = state.students[index];
        state.students.splice(index, 1);
        delete state.scores[name];
        state.usedStudents.delete(name);
        Storage.save();
        this.updateNamesList();
        this.updateLeaderboard();
        Wheel.draw();

        if (state.teamMode) this.shuffleTeams();
    },

    updateNamesList() {
        const n = state.students.length;
        this.refs.namesEmpty.classList.toggle('hidden', n > 0);
        this.refs.namesActions.classList.toggle('hidden', n === 0);
        this.refs.spinBtn.disabled = n < 2;

        // Update spin button text
        const spinSub = this.refs.spinBtn.querySelector('.spin-sub');
        if (n < 2) {
            spinSub.textContent = n === 0 ? "Avval ismlarni kiriting" : "Kamida 2 ta ism kerak";
        }

        this.refs.namesList.innerHTML = state.students.map((name, i) => {
            const isUsed = state.noRepeat && state.usedStudents.has(name);
            let dotClass = 'name-dot';
            if (state.teamMode) {
                if (state.teams.red.includes(name)) dotClass += ' red';
                else if (state.teams.blue.includes(name)) dotClass += ' blue';
            }
            if (isUsed) dotClass += ' used';
            return `<li>
                <span class="name-info">
                    <span class="${dotClass}"></span>
                    <span style="${isUsed ? 'opacity:0.4;text-decoration:line-through' : ''}">${name}</span>
                </span>
                <button class="name-remove" onclick="UI.removeStudent(${i})" title="O'chirish">✕</button>
            </li>`;
        }).join('');
    },

    updateLeaderboard() {
        const entries = Object.entries(state.scores)
            .filter(([_, v]) => v > 0)
            .sort((a, b) => b[1] - a[1]);

        this.refs.leaderboardEmpty.classList.toggle('hidden', entries.length > 0);
        this.refs.resetScoresBtn.classList.toggle('hidden', entries.length === 0);

        this.refs.leaderboard.innerHTML = entries.map(([name, score], i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
            return `<div class="lb-row">
                <span class="lb-rank">${medal}</span>
                <span class="lb-name">${name}</span>
                <span class="lb-stars">⭐ ${score}</span>
            </div>`;
        }).join('');
    },

    updateTeamMode() {
        this.refs.teamToggle.checked = state.teamMode;
        this.refs.teamDisplay.classList.toggle('hidden', !state.teamMode);
        if (state.teamMode && state.teams.red.length === 0 && state.students.length > 0) {
            this.shuffleTeams();
        }
        this.updateNamesList();
        this.updateTeamScores();
    },

    shuffleTeams() {
        const shuffled = MathGen.shuffle(state.students);
        const mid = Math.ceil(shuffled.length / 2);
        state.teams.red = shuffled.slice(0, mid);
        state.teams.blue = shuffled.slice(mid);
        state.teamScores = { red: 0, blue: 0 };
        Storage.save();
        this.updateNamesList();
        this.updateTeamScores();
    },

    updateTeamScores() {
        this.refs.redScore.textContent = state.teamScores.red;
        this.refs.blueScore.textContent = state.teamScores.blue;
    },

    syncSettingsUI() {
        this.refs.soundToggle.checked = state.soundEnabled;
        this.refs.timerSelect.value = state.timerDuration;
        this.refs.difficultySelect.value = state.difficulty;
    },

    // ---- Modals ----
    openModal(modal) { modal.classList.remove('hidden'); },
    closeModal(modal) { modal.classList.add('hidden'); },

    showGameModal(winner, gameType) {
        this.refs.winnerName.textContent = winner;

        // Show team badge
        if (state.teamMode) {
            const badge = this.refs.winnerTeamBadge;
            if (state.teams.red.includes(winner)) {
                badge.textContent = '🔴 Qizil jamoa';
                badge.className = 'winner-team-badge red';
            } else if (state.teams.blue.includes(winner)) {
                badge.textContent = '🔵 Ko\'k jamoa';
                badge.className = 'winner-team-badge blue';
            } else {
                badge.classList.add('hidden');
            }
        } else {
            this.refs.winnerTeamBadge.classList.add('hidden');
        }

        this.openModal(this.refs.gameModal);
        this.startGame(gameType);
    },

    startGame(gameType) {
        Games.clearTimer();
        this.refs.gameResult.classList.add('hidden');
        this.refs.nextGameBtn.classList.add('hidden');
        this.refs.spinAgainBtn.classList.add('hidden');

        state.currentGame = gameType;
        const container = this.refs.gameArea;
        container.innerHTML = '';

        switch(gameType) {
            case 'bomba':  Games.bomba(container); break;
            case 'tezkor': Games.tezkor(container); break;
            case 'sirli':  Games.sirli(container); break;
            case 'tarozi': Games.tarozi(container); break;
            case 'ketma':  Games.ketma(container); break;
            case 'hayo':   Games.hayo(container); break;
        }
    },
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    Storage.load();
    Confetti.init(document.getElementById('confetti-canvas'));
    Wheel.init(document.getElementById('wheel-canvas'));
    UI.init();
});
