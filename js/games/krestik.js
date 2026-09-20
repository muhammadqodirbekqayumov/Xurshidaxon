/* ===================================================
   SEHRLI BARABAN — Krestik-nolik (jamoaviy): katakni olish uchun misol yech
   =================================================== */

Games.register({
    id: 'krestik', name: 'Krestik-nolik', icon: '⭕', desc: 'Jamoa: misol yech — katakni ol', cat: 'jamoa', team: true, noTimer: true,
    run(c, G) {
        const SIDES = {
            red:  { label: '🔴 Qizil', mark: '🔴', cls: 'red' },
            blue: { label: "🔵 Ko'k", mark: '🔵', cls: 'blue' },
        };
        const winner = state.currentWinner;
        let turn = state.teams.blue.includes(winner) ? 'blue' : 'red';
        const myTeam = turn;
        const board = Array(9).fill(null);
        let over = false, busy = false;
        const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

        c.innerHTML = `
            <div class="kn-head" id="kn-head"></div>
            <div class="kn-board">
                ${board.map((_, i) => `<button class="kn-cell" data-i="${i}" aria-label="Katak ${i + 1}">?</button>`).join('')}
            </div>
            <div class="kn-question" id="kn-q"><p class="instruction-text small">Katakni tanlang — misol chiqadi. To'g'ri yechsangiz katak sizniki!</p></div>`;

        const headEl = c.querySelector('#kn-head');
        const qEl = c.querySelector('#kn-q');
        const cells = [...c.querySelectorAll('.kn-cell')];
        const renderHead = () => {
            headEl.innerHTML = `<span class="kn-turn ${SIDES[turn].cls}">Navbat: ${SIDES[turn].label}</span>`;
        };
        renderHead();

        const winnerOf = () => {
            for (const [a, b, d] of LINES) {
                if (board[a] && board[a] === board[b] && board[a] === board[d]) return { side: board[a], line: [a, b, d] };
            }
            return null;
        };

        const finish = (res) => {
            over = true;
            if (res) {
                res.line.forEach(i => cells[i].classList.add('win'));
                if (state.teamMode) { state.teamScores[res.side] += 2; UI.updateTeamScores(); }
                const won = res.side === myTeam;
                G.showResult(won, `${SIDES[res.side].label} jamoasi g'olib! 🏆 (+2 jamoa ochkosi)`, { stars: won ? 2 : 0, noTeam: true });
            } else {
                G.showResult(false, 'Durrang! 🤝 Hamma katak to\'ldi', { neutral: true, noStats: true, stars: 0 });
            }
        };

        cells.forEach(cell => cell.addEventListener('click', () => {
            const i = Number(cell.dataset.i);
            if (over || busy || board[i] || G.answered) return;
            busy = true;
            cells.forEach(x => x.classList.remove('active'));
            cell.classList.add('active');
            Sound.click();

            const p = MathGen.genProblem();
            qEl.innerHTML = `<div class="problem-text">${p.text} = ?</div>${G.optionsHtml(MathGen.options(p.answer, 4))}`;
            G.bindOptions(qEl, p.answer, ok => {
                cell.classList.remove('active');
                if (ok) {
                    board[i] = turn;
                    cell.textContent = SIDES[turn].mark;
                    cell.classList.add('taken', SIDES[turn].cls);
                    Sound.pop();
                    const res = winnerOf();
                    if (res) { finish(res); return; }
                    if (board.every(Boolean)) { finish(null); return; }
                } else {
                    Sound.wrong();
                    Toast.error(`Noto'g'ri! Javob: ${p.answer}. Navbat o'tdi`);
                }
                turn = turn === 'red' ? 'blue' : 'red';
                renderHead();
                setTimeout(() => {
                    qEl.innerHTML = `<p class="instruction-text small">${SIDES[turn].label} jamoasi, katakni tanlang!</p>`;
                    busy = false;
                }, ok ? 300 : 900);
            });
        }));
    },
});
