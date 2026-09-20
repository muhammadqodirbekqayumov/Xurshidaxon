/* ===================================================
   SEHRLI BARABAN — Math generator (5 daraja + adaptiv)
   Daraja:
     1 — 20 ichida qo'shish/ayirish, 2..5 ko'paytirish
     2 — 100 ichida, jadval 2..6
     3 — 100 ichida ikki xonali, jadval 2..9
     4 — 1000 ichida (o'nliklar), jadval 2..10, 12×3 kabi
     5 — 1000 ichida uch xonali, 23×4, 96÷8 kabi
   =================================================== */

const MathGen = {
    randInt: (a, b) => Utils.randInt(a, b),
    shuffle: a => Utils.shuffle(a),

    // Joriy o'quvchi uchun daraja
    level(name = state.currentWinner) {
        const d = state.settings.difficulty;
        if (d === 'easy') return 1;
        if (d === 'medium') return 3;
        if (d === 'hard') return 5;
        // auto
        return Stats.levelOf(name);
    },

    levelLabel(level) {
        return ['', 'Boshlang\'ich', 'Oson', 'O\'rtacha', 'Qiyin', 'Usta'][Utils.clamp(level, 1, 5)];
    },

    genProblem(level = this.level(), allowedOps = null) {
        const L = Utils.clamp(level, 1, 5);
        let ops = L === 1 ? ['+', '-', '+', '-', '×'] : ['+', '-', '×', '÷'];
        if (allowedOps) {
            const filtered = ops.filter(o => allowedOps.includes(o));
            ops = filtered.length ? filtered : allowedOps;
        }
        const op = Utils.pick(ops);
        let a, b, answer;
        const r = this.randInt;

        switch (op) {
            case '+':
                if (L === 1)      { a = r(1, 15); b = r(1, 20 - a); }
                else if (L === 2) { a = r(10, 60); b = r(1, 40); }
                else if (L === 3) { a = r(10, 80); b = r(10, 99 - a); }
                else if (L === 4) { a = r(10, 70) * 10; b = r(1, 29) * 10; }
                else              { a = r(100, 800); b = r(100, 999 - a); }
                answer = a + b;
                return { text: `${a} + ${b}`, answer, a, b, op };
            case '-':
                if (L === 1)      { a = r(5, 20); b = r(1, a); }
                else if (L === 2) { a = r(20, 100); b = r(1, 9); }
                else if (L === 3) { a = r(30, 100); b = r(10, a - 1); }
                else if (L === 4) { a = r(20, 99) * 10; b = r(1, a / 10 - 1) * 10; }
                else              { a = r(200, 999); b = r(100, a - 1); }
                answer = a - b;
                return { text: `${a} − ${b}`, answer, a, b, op };
            case '×':
                if (L === 1)      { a = r(2, 5); b = r(2, 5); }
                else if (L === 2) { a = r(2, 6); b = r(2, 6); }
                else if (L === 3) { a = r(2, 9); b = r(2, 9); }
                else if (L === 4) { if (Math.random() < 0.3) { a = r(11, 20); b = r(2, 5); } else { a = r(2, 10); b = r(2, 10); } }
                else              { if (Math.random() < 0.5) { a = r(12, 25); b = r(2, 9); } else { a = r(3, 12); b = r(3, 12); } }
                answer = a * b;
                return { text: `${a} × ${b}`, answer, a, b, op };
            case '÷':
            default:
                if (L === 1)      { b = r(2, 5); answer = r(1, 5); }
                else if (L === 2) { b = r(2, 6); answer = r(1, 6); }
                else if (L === 3) { b = r(2, 9); answer = r(1, 9); }
                else if (L === 4) { b = r(2, 10); answer = r(1, 10); }
                else              { b = r(2, 9); answer = r(5, 15); }
                a = b * answer;
                return { text: `${a} ÷ ${b}`, answer, a, b, op: '÷' };
        }
    },

    genExpression(level) {
        const p = this.genProblem(level);
        return { text: p.text, value: p.answer };
    },

    // Noto'g'ri variantlar (to'g'risiga yaqin, manfiy emas, takrorlanmas)
    genWrongAnswers(correct, count, opts = {}) {
        const min = opts.min != null ? opts.min : 0;
        const spread = opts.spread || Math.max(5, Math.ceil(Math.abs(correct) * 0.3));
        const wrongs = new Set();
        let guard = 0;
        while (wrongs.size < count && guard++ < 200) {
            let delta = this.randInt(1, spread);
            if (Math.random() < 0.5) delta = -delta;
            // Tez-tez uchraydigan xatolar: ±1, ±10
            if (Math.random() < 0.25) delta = Utils.pick([1, -1, 10, -10, 2, -2]);
            const w = correct + delta;
            if (w !== correct && w >= min && !wrongs.has(w)) wrongs.add(w);
        }
        // Zaxira: agar yetmasa
        let extra = correct + spread + 1;
        while (wrongs.size < count) { if (!wrongs.has(extra)) wrongs.add(extra); extra++; }
        return [...wrongs];
    },

    options(correct, count = 4, opts) {
        return this.shuffle([correct, ...this.genWrongAnswers(correct, count - 1, opts)]);
    },

    // Noto'g'ri javobdan keyin ko'rsatiladigan maslahat
    hint(p) {
        const { a, b, op, answer } = p;
        switch (op) {
            case '+': {
                if (b >= 10) {
                    const tens = Math.floor(b / 10) * 10, ones = b % 10;
                    if (ones === 0) return `${a} + ${b} = ${answer}. O'nliklarni qo'shing: ${a} + ${tens} = ${answer}`;
                    return `Bo'lib qo'shing: ${a} + ${tens} = ${a + tens}, keyin ${a + tens} + ${ones} = ${answer}`;
                }
                return `${a} dan boshlab ${b} ta oldinga sanang: ${answer}`;
            }
            case '-':
                return `Tekshiring: ${answer} + ${b} = ${a}, demak ${a} − ${b} = ${answer}`;
            case '×': {
                if (b <= 5) return `${a} × ${b} — bu ${a} ni ${b} marta qo'shish: ${Array(b).fill(a).join(' + ')} = ${answer}`;
                if (a <= 10 && b <= 10) return `Ko'paytirish jadvali: ${a} × ${b} = ${answer}. Eslab qoling: ${b} × ${a} ham ${answer}`;
                const tens = Math.floor(a / 10) * 10, ones = a % 10;
                return `Bo'lib ko'paytiring: ${tens} × ${b} = ${tens * b}, ${ones} × ${b} = ${ones * b}, jami ${answer}`;
            }
            case '÷':
                return `Tekshiring: ${answer} × ${b} = ${a}, demak ${a} ÷ ${b} = ${answer}`;
            default:
                return '';
        }
    },
};
