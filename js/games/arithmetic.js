/* ===================================================
   SEHRLI BARABAN — Arifmetika o'yinlari
   bomba, tezkor, hayo, yashirin, amal, tezlik
   =================================================== */

// ---- BOMBA ----
Games.register({
    id: 'bomba', name: 'Bomba!', icon: '💣', desc: 'Vaqt tugagunicha yech!', cat: 'arifmetika', noTimer: true,
    run(c, G) {
        const p = MathGen.genProblem();
        G.answerText = String(p.answer);
        const secs = Number(state.settings.timerDuration) || 15;
        c.innerHTML = `
            <div class="bomb-display">
                <div class="bomb-icon" id="bomb-icon">💣</div>
                <div class="bomb-timer" id="bomb-timer">${secs}</div>
            </div>
            <div class="problem-text">${p.text} = ?</div>
            ${G.inputRow()}`;
        const bombEl = c.querySelector('#bomb-icon');
        const explode = () => { bombEl.textContent = '💥'; bombEl.className = 'bomb-icon exploded'; Sound.bomb(); };

        G.bindInput(c, val => {
            if (val === p.answer) {
                bombEl.textContent = '✅';
                bombEl.className = 'bomb-icon defused';
                G.showResult(true, `To'g'ri! 🎉 ${p.text} = ${p.answer}`);
            } else {
                explode();
                G.showResult(false, `Noto'g'ri! To'g'ri javob: ${p.answer}`, { hint: MathGen.hint(p) });
            }
        });

        G.startCountdown(secs, {
            numberEl: c.querySelector('#bomb-timer'),
            onEnd: () => { explode(); G.showResult(false, `Vaqt tugadi! 💥 Javob: ${p.answer}`, { hint: MathGen.hint(p) }); },
        });
    },
});

// ---- TEZKOR HISOB ----
Games.register({
    id: 'tezkor', name: 'Tezkor Hisob', icon: '⚡', desc: "To'g'ri javobni tanlang", cat: 'arifmetika',
    run(c, G) {
        const p = MathGen.genProblem();
        G.answerText = String(p.answer);
        c.innerHTML = `<div class="problem-text">${p.text} = ?</div>${G.optionsHtml(MathGen.options(p.answer, 4))}`;
        G.bindOptions(c, p.answer, ok => G.showResult(ok,
            ok ? `To'g'ri! 🎉 ${p.text} = ${p.answer}` : `Noto'g'ri! To'g'ri javob: ${p.answer}`,
            { hint: ok ? '' : MathGen.hint(p) }));
    },
});

// ---- HA YOKI YO'Q ----
Games.register({
    id: 'hayo', name: "Ha yoki Yo'q", icon: '🧠', desc: "To'g'rimi yoki noto'g'ri?", cat: 'arifmetika',
    run(c, G) {
        const p = MathGen.genProblem();
        const showCorrect = Math.random() < 0.5;
        const shown = showCorrect ? p.answer : MathGen.genWrongAnswers(p.answer, 1)[0];
        G.answerText = showCorrect ? 'Ha' : `Yo'q (${p.answer})`;
        c.innerHTML = `
            <div class="problem-text">${p.text} = ${shown}</div>
            <p class="instruction-text">Bu to'g'rimi? 🤔</p>
            <div class="hayo-btns">
                <button class="hayo-btn yes kbd-opt" data-value="true" data-key="1"><span class="opt-key">1</span>Ha ✅</button>
                <button class="hayo-btn no kbd-opt" data-value="false" data-key="2"><span class="opt-key">2</span>Yo'q ❌</button>
            </div>`;
        G.bindOptions(c, String(showCorrect), ok => {
            const expl = showCorrect ? `${p.text} = ${p.answer} ✅` : `${p.text} = ${p.answer} (${shown} emas!)`;
            G.showResult(ok, ok ? `To'g'ri! 🎉 ${expl}` : `Noto'g'ri! ${expl}`, { hint: ok ? '' : MathGen.hint(p) });
        });
    },
});

// ---- YASHIRIN SON ----
Games.register({
    id: 'yashirin', name: 'Yashirin son', icon: '🎭', desc: "12 + ? = 20 — yashirin sonni top", cat: 'arifmetika',
    run(c, G) {
        const p = MathGen.genProblem();
        const hideA = Math.random() < 0.5;
        const answer = hideA ? p.a : p.b;
        const opSym = p.op === '-' ? '−' : p.op;
        const text = hideA
            ? `<span class="mystery" id="mys">?</span> ${opSym} ${p.b} = ${p.answer}`
            : `${p.a} ${opSym} <span class="mystery" id="mys">?</span> = ${p.answer}`;
        G.answerText = String(answer);
        c.innerHTML = `
            <p class="instruction-text">Yashirin sonni toping 🎭</p>
            <div class="problem-text">${text}</div>
            ${G.inputRow()}`;
        G.bindInput(c, val => {
            const ok = val === answer;
            const mys = c.querySelector('#mys');
            mys.textContent = answer;
            mys.classList.add(ok ? 'revealed-ok' : 'revealed-bad');
            const full = `${p.a} ${opSym} ${p.b} = ${p.answer}`;
            G.showResult(ok, ok ? `To'g'ri! 🎉 ${full}` : `Noto'g'ri! Javob: ${answer} (${full})`,
                { hint: ok ? '' : `Teskari amal bilan tekshiring: ${full}` });
        });
    },
});

// ---- AMALNI TOP ----
Games.register({
    id: 'amal', name: 'Amalni top', icon: '🔣', desc: '7 ? 3 = 21 — qaysi amal?', cat: 'arifmetika',
    run(c, G) {
        const OPS = ['+', '-', '×', '÷'];
        const calc = (a, b, op) => op === '+' ? a + b : op === '-' ? a - b : op === '×' ? a * b : (b !== 0 && a % b === 0 ? a / b : null);
        let p, guard = 0;
        do {
            p = MathGen.genProblem(Math.max(2, MathGen.level()));
            guard++;
        } while (guard < 60 && OPS.filter(o => calc(p.a, p.b, o) === p.answer).length !== 1);

        const sym = o => o === '-' ? '−' : o;
        G.answerText = sym(p.op);
        c.innerHTML = `
            <p class="instruction-text">Qaysi amal to'g'ri keladi? 🔣</p>
            <div class="problem-text">${p.a} <span class="mystery" id="mys">?</span> ${p.b} = ${p.answer}</div>
            <div class="compare-btns">
                ${OPS.map((o, i) => `<button class="compare-btn kbd-opt" data-value="${o}" data-key="${i + 1}"><span class="opt-key">${i + 1}</span>${sym(o)}</button>`).join('')}
            </div>`;
        G.bindOptions(c, p.op, ok => {
            c.querySelector('#mys').textContent = sym(p.op);
            const full = `${p.a} ${sym(p.op)} ${p.b} = ${p.answer}`;
            G.showResult(ok, ok ? `To'g'ri! 🎉 ${full}` : `Noto'g'ri! ${full}`, { hint: ok ? '' : MathGen.hint(p) });
        });
    },
});

// ---- BLITS (tezlik) ----
Games.register({
    id: 'tezlik', name: 'Blits', icon: '💨', desc: `${CONFIG.BLITZ_SECONDS} soniyada iloji boricha ko'p yech`, cat: 'arifmetika', noTimer: true,
    run(c, G) {
        const secs = CONFIG.BLITZ_SECONDS;
        let ok = 0, bad = 0, running = true;
        c.innerHTML = `
            <div class="blitz-head">
                <span class="blitz-score good">✅ <b id="bz-ok">0</b></span>
                <span class="bomb-timer blitz-timer" id="bz-timer">${secs}</span>
                <span class="blitz-score bad">❌ <b id="bz-bad">0</b></span>
            </div>
            <div id="bz-q"></div>
            <p class="instruction-text small">5 ta = ⭐ · 10 ta = ⭐⭐ · 15 ta = ⭐⭐⭐</p>`;
        const qEl = c.querySelector('#bz-q');
        const okEl = c.querySelector('#bz-ok');
        const badEl = c.querySelector('#bz-bad');

        const next = () => {
            if (!running || G.answered) return;
            const p = MathGen.genProblem();
            qEl.innerHTML = `<div class="problem-text">${p.text} = ?</div>${G.optionsHtml(MathGen.options(p.answer, 4))}`;
            G.bindOptions(qEl, p.answer, correct => {
                if (correct) { ok++; okEl.textContent = ok; Sound.pop(); }
                else { bad++; badEl.textContent = bad; Sound.wrong(); }
                setTimeout(next, correct ? 250 : 600);
            });
        };
        next();

        G.startCountdown(secs, {
            numberEl: c.querySelector('#bz-timer'),
            onEnd: () => {
                running = false;
                qEl.innerHTML = `<div class="blitz-final">⏰ Vaqt tugadi!</div>`;
                const stars = ok >= 15 ? 3 : ok >= 10 ? 2 : ok >= 5 ? 1 : 0;
                const s = Stats.get(state.currentWinner);
                if (state.students.includes(state.currentWinner) && ok > (s.blitzBest || 0)) s.blitzBest = ok;
                G.showResult(stars > 0, `Blits tugadi! ✅ ${ok} ta to'g'ri, ❌ ${bad} ta xato`,
                    { stars, hint: stars === 0 ? "Yulduz olish uchun kamida 5 ta to'g'ri javob kerak" : '' });
            },
        });
    },
});
