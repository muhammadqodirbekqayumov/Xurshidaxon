/* ===================================================
   SEHRLI BARABAN — Sound (Web Audio, fayllarsiz)
   =================================================== */

const Sound = {
    ctx: null,

    ensure() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return false;
            this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return true;
    },

    play(freq, type, duration, vol = 0.25, delay = 0) {
        if (!state.settings.soundEnabled) return;
        try {
            if (!this.ensure()) return;
            const t0 = this.ctx.currentTime + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, t0);
            gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
            osc.start(t0);
            osc.stop(t0 + duration);
        } catch (e) { /* ignore */ }
    },

    tick()      { this.play(900, 'sine', 0.04, 0.15); },
    click()     { this.play(600, 'sine', 0.05, 0.12); },
    flip()      { this.play(500, 'triangle', 0.08, 0.15); },
    pop()       { this.play(1200, 'sine', 0.08, 0.2); },
    wrong()     { this.play(220, 'sawtooth', 0.25, 0.15); },
    countdown() { this.play(440, 'sine', 0.08, 0.12); },

    win() {
        [523, 659, 784, 1047].forEach((f, i) => this.play(f, 'sine', 0.25, 0.25, i * 0.12));
    },

    streak() {
        [659, 784, 988, 1319, 1568].forEach((f, i) => this.play(f, 'triangle', 0.2, 0.22, i * 0.09));
    },

    badge() {
        [784, 988, 1175, 1568].forEach((f, i) => this.play(f, 'square', 0.18, 0.12, i * 0.1));
    },

    bomb() {
        this.play(80, 'sawtooth', 0.4, 0.35);
        this.play(50, 'square', 0.3, 0.3, 0.15);
    },

    fanfare() {
        [392, 494, 587, 784].forEach((f, i) => this.play(f, 'triangle', 0.35, 0.3, i * 0.1));
    },

    levelUp() {
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.play(f, 'sine', 0.3, 0.2, i * 0.08));
    },
};
