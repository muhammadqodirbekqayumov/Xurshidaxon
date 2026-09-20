/* ===================================================
   SEHRLI BARABAN — Xotira (Memory match): misol ↔ javob
   =================================================== */

Games.register({
    id: 'xotira', name: 'Xotira', icon: '🃏', desc: 'Misol va javobini juftla', cat: 'mantiq', noTimer: true,
    run(c, G) {
        const L = MathGen.level();
        const pairs = L <= 2 ? 4 : 6;

        // Javoblari va matnlari takrorlanmaydigan misollar
        const problems = [];
        const answers = new Set(), texts = new Set();
        let guard = 0;
        while (problems.length < pairs && guard++ < 400) {
            const p = MathGen.genProblem();
            if (answers.has(p.answer) || texts.has(p.text)) continue;
            answers.add(p.answer); texts.add(p.text);
            problems.push(p);
        }

        const cards = [];
        problems.forEach((p, k) => {
            cards.push({ key: k, text: p.text, kind: 'q' });
            cards.push({ key: k, text: String(p.answer), kind: 'a' });
        });
        const deck = Utils.shuffle(cards);

        let moves = 0, found = 0, first = null, lock = false;
        c.innerHTML = `
            <p class="instruction-text">Misol va uning javobini juftlang 🃏</p>
            <div class="memory-stats">Harakatlar: <b id="mem-moves">0</b> · Juftlar: <b id="mem-pairs">0</b>/${pairs}</div>
            <div class="memory-grid cols-4">
                ${deck.map((card, i) => `<button class="mem-card ${card.kind}" data-i="${i}" aria-label="Karta ${i + 1}">
                    <span class="mem-face mem-front">?</span>
                    <span class="mem-face mem-back">${Utils.escapeHtml(card.text)}</span>
                </button>`).join('')}
            </div>`;

        const movesEl = c.querySelector('#mem-moves');
        const pairsEl = c.querySelector('#mem-pairs');

        c.querySelectorAll('.mem-card').forEach(btn => {
            btn.addEventListener('click', () => {
                if (lock || G.answered) return;
                if (btn.classList.contains('flipped') || btn.classList.contains('matched')) return;
                btn.classList.add('flipped');
                Sound.flip();
                const card = deck[Number(btn.dataset.i)];

                if (!first) { first = { btn, card }; return; }

                moves++;
                movesEl.textContent = moves;
                const second = { btn, card };
                if (first.card.key === second.card.key && first.card.kind !== second.card.kind) {
                    first.btn.classList.add('matched');
                    second.btn.classList.add('matched');
                    found++;
                    pairsEl.textContent = found;
                    Sound.pop();
                    first = null;
                    if (found === pairs) {
                        const stars = moves <= Math.ceil(pairs * 1.6) ? 2 : 1;
                        setTimeout(() => G.showResult(true, `Barcha juftlar topildi! 🎉 ${moves} ta harakat`, { stars }), 400);
                    }
                } else {
                    lock = true;
                    const a = first.btn, b = second.btn;
                    first = null;
                    setTimeout(() => {
                        a.classList.remove('flipped');
                        b.classList.remove('flipped');
                        lock = false;
                    }, 850);
                }
            });
        });
    },
});
