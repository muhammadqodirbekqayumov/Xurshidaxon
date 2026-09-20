/* ===================================================
   SEHRLI BARABAN — Confetti
   =================================================== */

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

    launch(count = 120, opts = {}) {
        const w = this.canvas.width;
        const fromX = opts.x != null ? opts.x : null;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: fromX != null ? fromX + (Math.random() - 0.5) * 60 : Math.random() * w,
                y: opts.y != null ? opts.y : -10 - Math.random() * 80,
                w: 4 + Math.random() * 8,
                h: 4 + Math.random() * 8,
                color: CONFIG.CONFETTI_COLORS[Math.floor(Math.random() * CONFIG.CONFETTI_COLORS.length)],
                vx: (Math.random() - 0.5) * (fromX != null ? 12 : 5),
                vy: fromX != null ? -4 - Math.random() * 6 : 2 + Math.random() * 4,
                rot: Math.random() * 360,
                rv: (Math.random() - 0.5) * 12,
                life: 1,
            });
        }
        if (!this.running) { this.running = true; this.animate(); }
    },

    burst() {
        this.launch(80, { x: this.canvas.width / 2, y: this.canvas.height / 2 });
        this.launch(100);
    },

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => p.life > 0.01 && p.y < this.canvas.height + 20);
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.vx *= 0.99;
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
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },
};
