/* ===================================================
   SEHRLI BARABAN — Wheel (canvas)
   Strelka tepada (−π/2). Segment i ning boshlang'ich burchagi
   i·seg − π/2, keyin butun g'ildirak this.angle ga buriladi.
   Strelka ostidagi segment: floor(((−angle) mod 2π) / seg)
   =================================================== */

const Wheel = {
    canvas: null, ctx: null,
    angle: 0,
    spinning: false,
    lastSegment: -1,
    displaySize: 300,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => { this.resize(); this.draw(); });
        this.draw();
    },

    resize() {
        const wrapper = this.canvas.parentElement;
        const size = Math.max(120, Math.min(wrapper.clientWidth, wrapper.clientHeight || wrapper.clientWidth, 600));
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.displaySize = size;
    },

    cssVar(name, fallback) {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fallback;
    },

    normalize(a) {
        const t = Math.PI * 2;
        return ((a % t) + t) % t;
    },

    indexUnderPointer() {
        const n = state.students.length;
        if (n === 0) return -1;
        const seg = (Math.PI * 2) / n;
        return Math.floor(this.normalize(-this.angle) / seg) % n;
    },

    draw() {
        const ctx = this.ctx;
        const size = this.displaySize;
        const cx = size / 2, cy = size / 2;
        const r = cx - 8;
        const n = state.students.length;
        const light = document.documentElement.getAttribute('data-theme') === 'light';

        ctx.clearRect(0, 0, size, size);

        if (n === 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)';
            ctx.fill();
            ctx.strokeStyle = light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = light ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.15)';
            ctx.font = `600 ${Math.max(14, size * 0.04)}px Nunito, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Ismlarni qo'shing", cx, cy - 10);
            ctx.font = `400 ${Math.max(16, size * 0.05)}px sans-serif`;
            ctx.fillText('👆', cx, cy + 22);
            return;
        }

        const segAngle = (Math.PI * 2) / n;
        const showAvatar = n <= 16;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.angle);

        for (let i = 0; i < n; i++) {
            const start = i * segAngle - Math.PI / 2;
            const end = start + segAngle;
            const color = CONFIG.WHEEL_COLORS[i % CONFIG.WHEEL_COLORS.length];
            const student = state.students[i];
            const isUsed = state.noRepeat && state.usedStudents.has(student);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, start, end);
            ctx.closePath();
            ctx.fillStyle = isUsed ? (light ? 'rgba(120,120,140,0.35)' : 'rgba(60,60,80,0.6)') : color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Text
            ctx.save();
            ctx.rotate(start + segAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const fontSize = Math.max(9, Math.min(17, r * 0.1, segAngle * r * 0.38));
            ctx.font = `700 ${fontSize}px Nunito, sans-serif`;
            ctx.fillStyle = isUsed ? 'rgba(255,255,255,0.35)' : '#fff';
            ctx.shadowColor = 'rgba(0,0,0,0.45)';
            ctx.shadowBlur = 3;

            let name = student;
            const maxW = r * (showAvatar ? 0.58 : 0.66);
            while (ctx.measureText(name).width > maxW && name.length > 2) name = name.slice(0, -1);
            if (name !== student) name += '…';
            const label = showAvatar ? `${Utils.avatarFor(student)} ${name}` : name;
            ctx.fillText(label, r - 12, 0);
            ctx.restore();
        }

        // Center hub
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
        ctx.fillStyle = this.cssVar('--bg-secondary', '#1a1a2e');
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = `${Math.max(14, r * 0.12)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎡', 0, 1);

        ctx.restore();

        // Outer ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139,92,246,0.25)';
        ctx.lineWidth = 3;
        ctx.stroke();
    },

    // G'olib indeksini tanlash: takrorlanmasin + adolatli (vaznli) tanlash
    pickIndex() {
        const n = state.students.length;
        let candidates = state.students.map((s, i) => i);
        if (state.noRepeat) {
            candidates = candidates.filter(i => !state.usedStudents.has(state.students[i]));
            if (candidates.length === 0) {
                state.usedStudents.clear();
                UI.updateNamesList();
                candidates = state.students.map((s, i) => i);
            }
        }
        if (!state.fairPick || candidates.length === 1) return Utils.pick(candidates);

        const minPicks = Math.min(...candidates.map(i => Stats.picksOf(state.students[i])));
        const weights = candidates.map(i => {
            const extra = Stats.picksOf(state.students[i]) - minPicks;
            return 1 / (1 + extra * extra);   // kam chiqqanlar ancha ko'proq ehtimol
        });
        const total = weights.reduce((a, b) => a + b, 0);
        let rnd = Math.random() * total;
        for (let k = 0; k < candidates.length; k++) {
            rnd -= weights[k];
            if (rnd <= 0) return candidates[k];
        }
        return candidates[candidates.length - 1];
    },

    spin() {
        if (this.spinning || state.students.length < 2) return;

        const n = state.students.length;
        const targetIndex = this.pickIndex();

        this.spinning = true;
        UI.refs.spinBtn.disabled = true;
        UI.refs.spinBtn.classList.add('spinning');

        const duration = CONFIG.SPIN_DURATION_MIN + Math.random() * (CONFIG.SPIN_DURATION_MAX - CONFIG.SPIN_DURATION_MIN);
        const rotations = CONFIG.SPIN_ROTATIONS_MIN + Math.random() * (CONFIG.SPIN_ROTATIONS_MAX - CONFIG.SPIN_ROTATIONS_MIN);

        // targetIndex strelka ostiga tushishi uchun kerakli burchak (mod 2π)
        const segAngle = (Math.PI * 2) / n;
        const frac = 0.12 + Math.random() * 0.76;
        const desired = this.normalize(Math.PI * 2 - (targetIndex + frac) * segAngle);
        const current = this.normalize(this.angle);
        let delta = desired - current;
        if (delta < 0) delta += Math.PI * 2;

        const startAngle = this.angle;
        const finalAngle = startAngle + Math.floor(rotations) * Math.PI * 2 + delta;
        const startTime = performance.now();
        this.lastSegment = -1;

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            this.angle = startAngle + (finalAngle - startAngle) * eased;

            const seg = Math.floor(this.normalize(this.angle) / segAngle);
            if (seg !== this.lastSegment) {
                this.lastSegment = seg;
                if (progress < 0.97) Sound.tick();
            }

            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.angle = this.normalize(finalAngle);
                this.draw();
                this.spinning = false;
                UI.refs.spinBtn.disabled = state.students.length < 2;
                UI.refs.spinBtn.classList.remove('spinning');
                const actual = this.indexUnderPointer();
                if (actual !== targetIndex) console.warn('Wheel mismatch', actual, targetIndex);
                this.onSpinComplete(actual >= 0 ? actual : targetIndex);
            }
        };
        requestAnimationFrame(animate);
    },

    onSpinComplete(winnerIndex) {
        const winner = state.students[winnerIndex];
        state.currentWinner = winner;
        Stats.recordPick(winner);

        if (state.noRepeat) state.usedStudents.add(winner);
        UI.updateNamesList();
        Storage.save();

        Sound.fanfare();
        Confetti.launch();

        const gameId = Games.randomId();
        UI.showGameModal(winner, gameId);
    },
};
