/* ===================================================
   SEHRLI BARABAN — Hayotiy matematika
   soat, olchov, pul, masala, shakl
   =================================================== */

// ---- SOAT ----
Games.register({
    id: 'soat', name: 'Soat nechchi?', icon: '🕒', desc: 'Soat strelkalarini o\'qi', cat: 'dunyo',
    run(c, G) {
        const L = MathGen.level();
        const r = Utils.randInt;
        const h = r(1, 12);
        let m;
        if (L <= 1) m = 0;
        else if (L === 2) m = Utils.pick([0, 30]);
        else if (L === 3) m = Utils.pick([0, 15, 30, 45]);
        else m = r(0, 11) * 5;

        const fmt = (hh, mm) => `${hh}:${Utils.pad2(mm)}`;
        const answer = fmt(h, m);
        G.answerText = answer;

        const cand = new Set();
        const add = (hh, mm) => { hh = ((hh - 1 + 12) % 12) + 1; mm = ((mm % 60) + 60) % 60; const s = fmt(hh, mm); if (s !== answer) cand.add(s); };
        if (m % 5 === 0 && m / 5 >= 1 && m / 5 <= 12) add(m / 5, h * 5 % 60);   // strelkalar almashgan
        add(h + 1, m); add(h - 1, m); add(h, m + 30); add(h, m + 15); add(h, m - 15); add(h + 1, m + 30);
        const wrongs = Utils.shuffle([...cand]).slice(0, 3);
        const options = Utils.shuffle([answer, ...wrongs]);

        c.innerHTML = `
            <p class="instruction-text">Soat nechchi? 🕒</p>
            ${World.clockSVG(h, m)}
            ${G.optionsHtml(options, { cls: 'option-btn time-opt' })}`;
        G.bindOptions(c, answer, ok => G.showResult(ok,
            ok ? `To'g'ri! 🎉 Soat ${answer}` : `Noto'g'ri! Soat ${answer}`,
            { hint: ok ? '' : 'Kalta strelka — soat, uzun strelka — daqiqa (har bir raqam = 5 daqiqa)' }));
    },
});

// ---- O'LCHOV BIRLIKLARI ----
Games.register({
    id: 'olchov', name: "O'lchov birliklari", icon: '📏', desc: '1 m = ? sm, 1 soat = ? daqiqa', cat: 'dunyo',
    run(c, G) {
        const L = MathGen.level();
        const r = Utils.randInt;
        const UNITS = [
            { from: 'm', to: 'sm', k: 100 }, { from: 'dm', to: 'sm', k: 10 }, { from: 'm', to: 'dm', k: 10 },
            { from: 'sm', to: 'mm', k: 10 }, { from: 'km', to: 'm', k: 1000 }, { from: 'kg', to: 'g', k: 1000 },
            { from: 'soat', to: 'daqiqa', k: 60 }, { from: 'daqiqa', to: 'soniya', k: 60 }, { from: 'kun', to: 'soat', k: 24 },
            { from: 'hafta', to: 'kun', k: 7 }, { from: 'yil', to: 'oy', k: 12 }, { from: 'l', to: 'ml', k: 1000 },
        ];
        const u = Utils.pick(UNITS);
        const reverse = L >= 3 && Math.random() < 0.4;
        const n = L <= 2 ? r(1, 5) : r(1, 9);
        const correct = reverse ? n : n * u.k;
        const question = reverse ? `${Utils.formatNumber(n * u.k)} ${u.to} = ? ${u.from}` : `${n} ${u.from} = ? ${u.to}`;
        G.answerText = `${Utils.formatNumber(correct)} ${reverse ? u.from : u.to}`;

        const cand = new Set(reverse
            ? [n * 10, n * u.k, n + 1, n - 1, n * 100, n * u.k / 10]
            : [n * u.k * 10, n * u.k / 10, n * u.k + n, n * (u.k + 1), n * u.k - n, n * u.k * 2, n * u.k + 10]);
        cand.delete(correct);
        const wrongs = Utils.shuffle([...cand].filter(v => Number.isInteger(v) && v > 0)).slice(0, 3);
        while (wrongs.length < 3) wrongs.push(correct + (wrongs.length + 1) * 7);
        const options = Utils.shuffle([correct, ...wrongs]);

        c.innerHTML = `
            <p class="instruction-text">O'lchov birliklarini aylantiring 📏</p>
            <div class="problem-text">${question}</div>
            ${G.optionsHtml(options, { format: Utils.formatNumber.bind(Utils) })}`;
        G.bindOptions(c, correct, ok => G.showResult(ok,
            ok ? `To'g'ri! 🎉 ${question.replace('?', Utils.formatNumber(correct))}` : `Noto'g'ri! ${question.replace('?', Utils.formatNumber(correct))}`,
            { hint: ok ? '' : `Eslab qoling: 1 ${u.from} = ${Utils.formatNumber(u.k)} ${u.to}` }));
    },
});

// ---- PUL ----
Games.register({
    id: 'pul', name: "Pul (so'm)", icon: '💵', desc: 'Pullarni sana, qaytimni top', cat: 'dunyo',
    run(c, G) {
        const L = MathGen.level();
        const r = Utils.randInt;
        const notes = L <= 2 ? [1000, 2000, 5000] : L === 3 ? [1000, 2000, 5000, 10000] : [1000, 2000, 5000, 10000, 20000, 50000];
        const count = L <= 2 ? r(2, 3) : L === 3 ? r(3, 4) : r(3, 5);
        const change = L >= 4 && Math.random() < 0.4;

        let picked = [];
        for (let i = 0; i < count; i++) picked.push(Utils.pick(notes));
        picked.sort((a, b) => b - a);
        const sum = picked.reduce((a, b) => a + b, 0);

        let correct, question, expl;
        if (change) {
            const price = Math.round(r(1, sum / 1000 - 1)) * 1000 - Utils.pick([0, 0, 500]);
            correct = sum - price;
            question = `Narxi ${Utils.formatNumber(price)} so'm. Berildi: jami ${Utils.formatNumber(sum)} so'm. Qaytim?`;
            expl = `${Utils.formatNumber(sum)} − ${Utils.formatNumber(price)} = ${Utils.formatNumber(correct)} so'm`;
        } else {
            correct = sum;
            question = 'Jami necha so\'m?';
            expl = `${picked.map(Utils.formatNumber).join(' + ')} = ${Utils.formatNumber(sum)} so'm`;
        }
        G.answerText = `${Utils.formatNumber(correct)} so'm`;

        const cand = new Set([correct + 1000, correct - 1000, correct + 5000, correct - 5000, correct + 500, sum - picked[picked.length - 1], correct * 2, correct + 10000]);
        cand.delete(correct);
        const wrongs = Utils.shuffle([...cand].filter(v => v > 0)).slice(0, 3);
        const options = Utils.shuffle([correct, ...wrongs]);

        c.innerHTML = `
            <p class="instruction-text">${question} 💵</p>
            <div class="money-row">${picked.map(v => `<span class="money-note n${v}">${Utils.formatNumber(v)}</span>`).join('')}</div>
            ${G.optionsHtml(options, { format: v => Utils.formatNumber(v) + ' so\'m' })}`;
        G.bindOptions(c, correct, ok => G.showResult(ok, ok ? `To'g'ri! 🎉 ${expl}` : `Noto'g'ri! ${expl}`));
    },
});

// ---- MASALA ----
Games.register({
    id: 'masala', name: 'Masala', icon: '📖', desc: 'Matnli masalani yech', cat: 'dunyo',
    run(c, G) {
        const L = MathGen.level();
        const names = state.students.length >= 2 ? state.students : ['Ali', 'Laylo', 'Bobur', 'Nilufar', 'Sardor', 'Madina'];
        const [n1, n2] = Utils.shuffle(names).slice(0, 2);
        const p = MathGen.genProblem(L, ['+', '-', '×', '÷']);
        const { a, b, answer, op } = p;
        const T = {
            '+': [
                `${n1}da ${a} ta daftar bor edi. ${n2} unga yana ${b} ta daftar berdi. ${n1}da nechta daftar bo'ldi?`,
                `Sinfda ${a} ta o'g'il bola va ${b} ta qiz bola bor. Sinfda jami nechta o'quvchi bor?`,
                `${n1} ${a} ta olma, ${n2} esa ${b} ta olma terdi. Ular jami nechta olma terishdi?`,
                `Avtobusda ${a} kishi bor edi. Bekatda yana ${b} kishi chiqdi. Avtobusda nechta kishi bo'ldi?`,
            ],
            '-': [
                `Do'konda ${a} ta non bor edi. ${b} tasi sotildi. Do'konda nechta non qoldi?`,
                `Daraxtda ${a} ta qush o'tirgan edi. ${b} tasi uchib ketdi. Daraxtda nechta qush qoldi?`,
                `Kitob ${a} betdan iborat. ${n1} ${b} betini o'qidi. Yana necha bet qoldi?`,
                `${n1}ning ${a} ta stikeri bor edi. U ${b} tasini ${n2}ga berdi. ${n1}da nechta stiker qoldi?`,
            ],
            '×': [
                `Bir qutida ${a} ta qalam bor. ${b} ta qutida nechta qalam bor?`,
                `${n1} har kuni ${a} ta misol yechadi. U ${b} kunda nechta misol yechadi?`,
                `Bir stol atrofida ${a} ta stul bor. ${b} ta stol atrofida nechta stul bor?`,
                `Bitta daftar ${a} so'm turadi. ${b} ta daftar necha so'm turadi?`,
            ],
            '÷': [
                `${a} ta konfetni ${b} ta bolaga teng bo'lib berishdi. Har bir bolaga nechtadan konfet tegdi?`,
                `${n1} ${a} ta gulni ${b} ta guldastaga teng joyladi. Har bir guldastada nechta gul bor?`,
                `${a} ta o'quvchi ${b} ta jamoaga teng bo'lindi. Har bir jamoada nechta o'quvchi bor?`,
                `${a} ta olma ${b} ta savatga teng solindi. Har bir savatda nechta olma bor?`,
            ],
        };
        let text = Utils.pick(T[op]);
        let ans = answer;
        let expl = `${a} ${op === '-' ? '−' : op} ${b} = ${answer}`;

        // Ikki bosqichli masala (yuqori darajada)
        if (L >= 4 && Math.random() < 0.35) {
            const x = Utils.randInt(20, 60), y = Utils.randInt(5, 15), z = Utils.randInt(5, 15);
            text = `Avtobusda ${x} kishi bor edi. Bekatda ${y} kishi tushdi va ${z} kishi chiqdi. Avtobusda nechta kishi bo'ldi?`;
            ans = x - y + z;
            expl = `${x} − ${y} + ${z} = ${ans}`;
        }
        G.answerText = String(ans);

        c.innerHTML = `
            <p class="instruction-text">Masalani o'qing va yeching 📖</p>
            <div class="story-text">${Utils.escapeHtml(text)}</div>
            ${G.inputRow()}`;
        G.bindInput(c, val => G.showResult(val === ans,
            val === ans ? `To'g'ri! 🎉 ${expl}` : `Noto'g'ri! Javob: ${ans}`,
            { hint: val === ans ? '' : `Yechim: ${expl}` }));
    },
});

// ---- GEOMETRIYA ----
Games.register({
    id: 'shakl', name: 'Geometriya', icon: '📐', desc: 'Perimetr va shakllar', cat: 'dunyo',
    run(c, G) {
        const L = MathGen.level();
        const r = Utils.randInt;
        const modes = L <= 1 ? ['sides', 'count'] : L <= 2 ? ['sides', 'count', 'square'] : ['count', 'square', 'rect', 'rect'];
        const mode = Utils.pick(modes);

        if (mode === 'sides') {
            const shapes = [['Uchburchak', 3], ["To'rtburchak", 4], ['Beshburchak', 5], ['Oltiburchak', 6], ['Kvadrat', 4]];
            const [name, sides] = Utils.pick(shapes);
            G.answerText = String(sides);
            const wrongs = Utils.shuffle([3, 4, 5, 6, 8].filter(v => v !== sides)).slice(0, 3);
            c.innerHTML = `
                <p class="instruction-text">${name}ning nechta tomoni bor? 📐</p>
                ${World.polygonSVG(sides)}
                ${G.optionsHtml(Utils.shuffle([sides, ...wrongs]))}`;
            G.bindOptions(c, sides, ok => G.showResult(ok, ok ? `To'g'ri! 🎉 ${name} — ${sides} tomon` : `Noto'g'ri! ${name} — ${sides} tomon`));
        } else if (mode === 'count') {
            const total = L <= 2 ? r(6, 9) : r(9, 14);
            const items = [];
            for (let i = 0; i < total; i++) items.push(Utils.pick(['tri', 'circle', 'square']));
            const target = Utils.pick(['tri', 'circle', 'square']);
            const answer = items.filter(t => t === target).length;
            const label = { tri: 'uchburchak', circle: 'doira', square: 'kvadrat' }[target];
            G.answerText = String(answer);
            const cand = new Set([answer + 1, answer - 1, answer + 2, answer - 2, answer + 3]);
            cand.delete(answer);
            const wrongs = Utils.shuffle([...cand].filter(v => v >= 0)).slice(0, 3);
            c.innerHTML = `
                <p class="instruction-text">Rasmda nechta ${label} bor? 📐</p>
                ${World.shapesSVG(items)}
                ${G.optionsHtml(Utils.shuffle([answer, ...wrongs]))}`;
            G.bindOptions(c, answer, ok => G.showResult(ok, ok ? `To'g'ri! 🎉 ${answer} ta ${label}` : `Noto'g'ri! ${answer} ta ${label}`));
        } else if (mode === 'square') {
            const s = r(2, L >= 3 ? 12 : 7);
            const P = s * 4;
            G.answerText = `${P} sm`;
            const wrongs = Utils.shuffle([...new Set([s * s, s * 2, s * 3, P + s, P - s])].filter(v => v !== P && v > 0)).slice(0, 3);
            c.innerHTML = `
                <p class="instruction-text">Kvadratning perimetri nechchi? 📐</p>
                ${World.rectSVG(s, s, true)}
                ${G.optionsHtml(Utils.shuffle([P, ...wrongs]), { format: v => v + ' sm' })}`;
            G.bindOptions(c, P, ok => G.showResult(ok, ok ? `To'g'ri! 🎉 P = ${s} × 4 = ${P} sm` : `Noto'g'ri! P = ${s} × 4 = ${P} sm`,
                { hint: ok ? '' : 'Kvadratning barcha 4 tomoni teng: P = tomon × 4' }));
        } else {
            const w = r(3, 12), h = r(2, w - 1);
            const P = 2 * (w + h);
            G.answerText = `${P} sm`;
            const wrongs = Utils.shuffle([...new Set([w * h, w + h, 2 * w + h, w + 2 * h, P + 2, P - 2])].filter(v => v !== P && v > 0)).slice(0, 3);
            c.innerHTML = `
                <p class="instruction-text">To'rtburchakning perimetri nechchi? 📐</p>
                ${World.rectSVG(w, h, false)}
                ${G.optionsHtml(Utils.shuffle([P, ...wrongs]), { format: v => v + ' sm' })}`;
            G.bindOptions(c, P, ok => G.showResult(ok, ok ? `To'g'ri! 🎉 P = (${w} + ${h}) × 2 = ${P} sm` : `Noto'g'ri! P = (${w} + ${h}) × 2 = ${P} sm`,
                { hint: ok ? '' : "To'rtburchak perimetri: (uzunlik + kenglik) × 2" }));
        }
    },
});

// ==================== SVG yordamchilar ====================
const World = {
    clockSVG(h, m) {
        const cx = 100, cy = 100;
        const hourAngle = ((h % 12) + m / 60) * 30;
        const minAngle = m * 6;
        const pt = (ang, len) => { const a = (ang - 90) * Math.PI / 180; return [cx + Math.cos(a) * len, cy + Math.sin(a) * len]; };
        let ticks = '';
        for (let i = 0; i < 60; i++) {
            const big = i % 5 === 0;
            const [x1, y1] = pt(i * 6, big ? 80 : 84);
            const [x2, y2] = pt(i * 6, 88);
            ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${big ? 3 : 1}" opacity="${big ? 0.9 : 0.4}"/>`;
        }
        let nums = '';
        for (let i = 1; i <= 12; i++) {
            const [x, y] = pt(i * 30, 66);
            nums += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="800" fill="currentColor">${i}</text>`;
        }
        const [hx, hy] = pt(hourAngle, 42);
        const [mx, my] = pt(minAngle, 62);
        return `<svg viewBox="0 0 200 200" class="clock-svg" aria-label="Soat ${h}:${Utils.pad2(m)}">
            <circle cx="${cx}" cy="${cy}" r="94" fill="var(--bg-card)" stroke="var(--accent-purple)" stroke-width="4"/>
            ${ticks}${nums}
            <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="var(--accent-amber)" stroke-width="7" stroke-linecap="round"/>
            <line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="var(--accent-cyan)" stroke-width="4" stroke-linecap="round"/>
            <circle cx="${cx}" cy="${cy}" r="5" fill="var(--accent-rose)"/>
        </svg>`;
    },

    rectSVG(w, h, isSquare) {
        const maxW = 220, maxH = 120;
        const scale = Math.min(maxW / w, maxH / h);
        const pw = w * scale, ph = h * scale;
        const x = (260 - pw) / 2, y = (170 - ph) / 2 + 6;
        return `<svg viewBox="0 0 260 176" class="shape-svg">
            <rect x="${x}" y="${y}" width="${pw}" height="${ph}" fill="rgba(139,92,246,0.18)" stroke="var(--accent-purple)" stroke-width="3" rx="4"/>
            <text x="${x + pw / 2}" y="${y - 8}" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor">${w} sm</text>
            <text x="${x + pw + 8}" y="${y + ph / 2}" text-anchor="start" dominant-baseline="central" font-size="16" font-weight="800" fill="currentColor">${isSquare ? '' : h + ' sm'}</text>
        </svg>`;
    },

    polygonSVG(sides) {
        const cx = 100, cy = 95, R = 70;
        const pts = [];
        for (let i = 0; i < sides; i++) {
            const a = (i * 360 / sides - 90) * Math.PI / 180;
            pts.push(`${cx + Math.cos(a) * R},${cy + Math.sin(a) * R}`);
        }
        return `<svg viewBox="0 0 200 180" class="shape-svg small">
            <polygon points="${pts.join(' ')}" fill="rgba(6,182,212,0.18)" stroke="var(--accent-cyan)" stroke-width="3" stroke-linejoin="round"/>
        </svg>`;
    },

    shapesSVG(items) {
        const cols = 5;
        const size = 44;
        const rows = Math.ceil(items.length / cols);
        const colors = ['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-rose)', 'var(--accent-emerald)', 'var(--accent-amber)'];
        let out = '';
        items.forEach((t, i) => {
            const col = i % cols, row = Math.floor(i / cols);
            const x = 10 + col * size + size / 2, y = 10 + row * size + size / 2;
            const color = colors[i % colors.length];
            const rot = Utils.randInt(0, 40);
            if (t === 'circle') out += `<circle cx="${x}" cy="${y}" r="15" fill="${color}"/>`;
            else if (t === 'square') out += `<rect x="${x - 14}" y="${y - 14}" width="28" height="28" fill="${color}" transform="rotate(${rot} ${x} ${y})"/>`;
            else out += `<polygon points="${x},${y - 17} ${x + 16},${y + 12} ${x - 16},${y + 12}" fill="${color}" transform="rotate(${rot} ${x} ${y})"/>`;
        });
        return `<svg viewBox="0 0 ${20 + cols * size} ${20 + rows * size}" class="shape-svg">${out}</svg>`;
    },
};
