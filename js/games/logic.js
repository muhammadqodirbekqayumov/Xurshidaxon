/* ===================================================
   SEHRLI BARABAN — Mantiq va sonlar
   sirli, tarozi, ketma, yaxlit, razryad
   =================================================== */

// ---- SIRLI SON ----
Games.register({
    id: 'sirli', name: 'Sirli Son', icon: '🔍', desc: 'Boshqacha sonni top!', cat: 'mantiq',
    run(c, G) {
        const L = MathGen.level();
        const r = Utils.randInt;
        const nonMultiple = (k, max) => { let v; do { v = r(1, max); } while (v % k === 0); return v; };
        const big = L >= 3;
        const rules = [
            { name: 'juft', gen: () => r(1, big ? 49 : 12) * 2, odd: () => r(1, big ? 49 : 12) * 2 - 1 },
            { name: 'toq', gen: () => r(1, big ? 49 : 12) * 2 - 1, odd: () => r(1, big ? 49 : 12) * 2 },
            { name: '5 ga karrali', gen: () => r(1, big ? 19 : 8) * 5, odd: () => nonMultiple(5, big ? 99 : 40) },
            { name: '3 ga karrali', gen: () => r(1, big ? 30 : 8) * 3, odd: () => nonMultiple(3, big ? 90 : 25) },
        ];
        if (L >= 2) rules.push({ name: '10 ga karrali', gen: () => r(1, 9) * 10, odd: () => nonMultiple(10, 99) });
        if (L >= 2) rules.push({ name: 'ikki xonali', gen: () => r(10, 99), odd: () => Math.random() < 0.5 ? r(1, 9) : r(100, 999) });
        if (L >= 4) rules.push({ name: '4 ga karrali', gen: () => r(1, 20) * 4, odd: () => nonMultiple(4, 80) });
        if (L >= 4) rules.push({ name: 'uch xonali', gen: () => r(100, 999), odd: () => r(10, 99) });
        const rule = Utils.pick(rules);

        const matching = new Set();
        let guard = 0;
        while (matching.size < 5 && guard++ < 500) matching.add(rule.gen());
        let odd; guard = 0;
        do { odd = rule.odd(); } while (matching.has(odd) && guard++ < 100);

        const all = Utils.shuffle([...matching, odd]);
        G.answerText = String(odd);
        c.innerHTML = `
            <p class="instruction-text">Qaysi son boshqalardan farq qiladi? 🤔</p>
            ${G.optionsHtml(all, { cls: 'number-btn', wrapCls: 'numbers-grid' })}`;
        G.bindOptions(c, odd, ok => G.showResult(ok,
            ok ? `To'g'ri! 🎉 ${odd} — boshqacha (qolganlari ${rule.name})` : `Noto'g'ri! Javob: ${odd} (qolganlari ${rule.name})`));
    },
});

// ---- TAROZI ----
Games.register({
    id: 'tarozi', name: 'Tarozi', icon: '⚖️', desc: 'Katta, kichik yoki teng?', cat: 'mantiq',
    run(c, G) {
        const left = MathGen.genExpression();
        let right = MathGen.genExpression();
        // Ba'zan teng bo'lsin
        if (Math.random() < 0.15) right = { text: String(left.value), value: left.value };
        const sign = left.value > right.value ? '>' : left.value < right.value ? '<' : '=';
        G.answerText = sign;
        c.innerHTML = `
            <div class="tarozi-display">
                <div class="tarozi-pans">
                    <div class="tarozi-pan" id="pan-left">${left.text}</div>
                    <div class="tarozi-scale">⚖️</div>
                    <div class="tarozi-pan" id="pan-right">${right.text}</div>
                </div>
                <div class="compare-btns">
                    <button class="compare-btn kbd-opt" data-value="<" data-key="1"><span class="opt-key">1</span>&lt;</button>
                    <button class="compare-btn kbd-opt" data-value="=" data-key="2"><span class="opt-key">2</span>=</button>
                    <button class="compare-btn kbd-opt" data-value=">" data-key="3"><span class="opt-key">3</span>&gt;</button>
                </div>
            </div>`;
        G.bindOptions(c, sign, ok => {
            if (left.value > right.value) c.querySelector('#pan-left').classList.add('down');
            else if (left.value < right.value) c.querySelector('#pan-right').classList.add('down');
            const expl = `${left.text} (${left.value}) ${sign} ${right.text} (${right.value})`;
            G.showResult(ok, ok ? `To'g'ri! 🎉 ${expl}` : `Noto'g'ri! ${expl}`);
        });
    },
});

// ---- KETMA-KETLIK ----
Games.register({
    id: 'ketma', name: 'Ketma-ketlik', icon: '🔢', desc: 'Keyingi sonni top!', cat: 'mantiq',
    run(c, G) {
        const L = MathGen.level();
        const r = Utils.randInt;
        const types = ['up'];
        if (L >= 2) types.push('down');
        if (L >= 3) types.push('mul');
        if (L >= 4) types.push('grow');
        const type = Utils.pick(types);
        const count = r(4, 5);
        const seq = [];
        let rule, answer;

        if (type === 'up') {
            const step = L === 1 ? r(1, 5) : L === 2 ? r(2, 10) : r(3, 25);
            const start = r(1, L >= 3 ? 50 : 10);
            for (let i = 0; i <= count; i++) seq.push(start + step * i);
            rule = `+${step}`;
        } else if (type === 'down') {
            const step = L === 2 ? r(2, 10) : r(3, 25);
            const start = r(step * (count + 1), step * (count + 1) + (L >= 3 ? 100 : 30));
            for (let i = 0; i <= count; i++) seq.push(start - step * i);
            rule = `−${step}`;
        } else if (type === 'mul') {
            const k = Utils.pick([2, 2, 3]);
            const start = r(1, k === 2 ? 5 : 3);
            const n = 4;
            for (let i = 0; i <= n; i++) seq.push(start * Math.pow(k, i));
            rule = `×${k}`;
        } else {
            const start = r(1, 20);
            let v = start;
            seq.push(v);
            for (let i = 1; i <= count; i++) { v += i; seq.push(v); }
            rule = '+1, +2, +3, …';
        }
        answer = seq.pop();
        G.answerText = String(answer);

        c.innerHTML = `
            <p class="instruction-text">Keyingi son nima? 🔢</p>
            <div class="sequence-row">
                ${seq.map(n => `<span class="seq-num">${n}</span>`).join('')}
                <span class="seq-num seq-mystery" id="seq-mys">?</span>
            </div>
            ${G.inputRow()}`;
        G.bindInput(c, val => {
            const ok = val === answer;
            const mys = c.querySelector('#seq-mys');
            mys.textContent = answer;
            mys.classList.add(ok ? 'revealed-ok' : 'revealed-bad');
            G.showResult(ok, ok ? `To'g'ri! 🎉 Qoida: ${rule}` : `Noto'g'ri! Javob: ${answer} (qoida: ${rule})`);
        });
    },
});

// ---- YAXLITLASH ----
Games.register({
    id: 'yaxlit', name: 'Yaxlitlash', icon: '🎯', desc: "O'nlik yoki yuzlikkacha yaxlitla", cat: 'mantiq',
    run(c, G) {
        const L = MathGen.level();
        const r = Utils.randInt;
        let n, base;
        if (L <= 2) { n = r(11, 99); base = 10; }
        else if (L === 3) { n = r(101, 999); base = 10; }
        else { n = r(101, 999); base = Math.random() < 0.5 ? 10 : 100; }
        if (n % base === 0) n += r(1, base - 1);
        const answer = Math.round(n / base) * base;
        G.answerText = String(answer);

        const cand = new Set([Math.floor(n / base) * base, Math.ceil(n / base) * base, answer + base, answer - base,
            Math.round(n / (base === 10 ? 100 : 10)) * (base === 10 ? 100 : 10), n]);
        cand.delete(answer);
        const wrongs = Utils.shuffle([...cand].filter(v => v >= 0)).slice(0, 3);
        while (wrongs.length < 3) wrongs.push(answer + base * (wrongs.length + 2));
        const options = Utils.shuffle([answer, ...wrongs]);

        c.innerHTML = `
            <p class="instruction-text">${n} sonini ${base === 10 ? "o'nlik" : 'yuzlik'}kacha yaxlitlang 🎯</p>
            <div class="problem-text">${n} ≈ ?</div>
            ${G.optionsHtml(options)}`;
        G.bindOptions(c, answer, ok => G.showResult(ok,
            ok ? `To'g'ri! 🎉 ${n} ≈ ${answer}` : `Noto'g'ri! ${n} ≈ ${answer}`,
            { hint: ok ? '' : `${base === 10 ? 'Birlik' : "O'nlik"} raqami 5 yoki undan katta bo'lsa — yuqoriga, kichik bo'lsa — pastga yaxlitlanadi` }));
    },
});

// ---- RAZRYADLAR ----
Games.register({
    id: 'razryad', name: 'Razryadlar', icon: '🏗️', desc: 'Yuzlik, o\'nlik, birlik', cat: 'mantiq',
    run(c, G) {
        const L = MathGen.level();
        const r = Utils.randInt;
        const three = L >= 3;
        const n = three ? r(101, 999) : r(11, 99);
        const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10;
        const modes = ['digit', 'compose', 'expand'];
        const mode = Utils.pick(modes);

        if (mode === 'digit') {
            const places = three ? [['yuzlik', h], ["o'nlik", t], ['birlik', u]] : [["o'nlik", t], ['birlik', u]];
            const [placeName, answer] = Utils.pick(places);
            G.answerText = String(answer);
            const wrongs = Utils.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== answer)).slice(0, 3);
            c.innerHTML = `
                <p class="instruction-text">${n} sonida nechta ${placeName} bor? 🏗️</p>
                <div class="problem-text">${n}</div>
                ${G.optionsHtml(Utils.shuffle([answer, ...wrongs]))}`;
            G.bindOptions(c, answer, ok => G.showResult(ok,
                ok ? `To'g'ri! 🎉 ${n}: ${three ? h + ' yuzlik, ' : ''}${t} o'nlik, ${u} birlik`
                   : `Noto'g'ri! ${n}: ${three ? h + ' yuzlik, ' : ''}${t} o'nlik, ${u} birlik`));
        } else if (mode === 'compose') {
            G.answerText = String(n);
            const parts = three ? `${h} yuzlik, ${t} o'nlik, ${u} birlik` : `${t} o'nlik, ${u} birlik`;
            c.innerHTML = `
                <p class="instruction-text">Qanday son hosil bo'ladi? 🏗️</p>
                <div class="problem-text">${parts} = ?</div>
                ${G.inputRow()}`;
            G.bindInput(c, val => G.showResult(val === n,
                val === n ? `To'g'ri! 🎉 ${parts} = ${n}` : `Noto'g'ri! ${parts} = ${n}`,
                { hint: val === n ? '' : `${three ? h * 100 + ' + ' : ''}${t * 10} + ${u} = ${n}` }));
        } else {
            // n = h00 + ? + u  (yoki ikki xonali: n = ? + u)
            const missing = three ? Utils.pick(['h', 't', 'u']) : Utils.pick(['t', 'u']);
            const val = { h: h * 100, t: t * 10, u }[missing];
            const parts = three ? [h * 100, t * 10, u] : [t * 10, u];
            const keys = three ? ['h', 't', 'u'] : ['t', 'u'];
            const text = parts.map((p, i) => keys[i] === missing ? '<span class="mystery" id="mys">?</span>' : p).join(' + ');
            G.answerText = String(val);
            c.innerHTML = `
                <p class="instruction-text">Yashirin sonni toping 🏗️</p>
                <div class="problem-text">${n} = ${text}</div>
                ${G.inputRow()}`;
            G.bindInput(c, v => {
                const ok = v === val;
                const mys = c.querySelector('#mys');
                mys.textContent = val;
                mys.classList.add(ok ? 'revealed-ok' : 'revealed-bad');
                G.showResult(ok, ok ? `To'g'ri! 🎉 ${n} = ${parts.join(' + ')}` : `Noto'g'ri! ${n} = ${parts.join(' + ')}`);
            });
        }
    },
});
