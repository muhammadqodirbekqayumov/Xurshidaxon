/* ===================================================
   SEHRLI BARABAN — UI (DOM, hodisalar, render)
   =================================================== */

const UI = {
    refs: {},

    init() {
        const $ = id => document.getElementById(id);
        this.refs = {
            spinBtn: $('spin-btn'), nameInput: $('name-input'), addNameBtn: $('add-name-btn'),
            namesList: $('names-list'), namesEmpty: $('names-empty'), namesActions: $('names-actions'), namesCount: $('names-count'),
            clearNamesBtn: $('clear-names-btn'), noRepeatToggle: $('no-repeat-toggle'), fairPickToggle: $('fair-pick-toggle'),
            importNamesBtn: $('import-names-btn'), sortNamesBtn: $('sort-names-btn'), shuffleNamesBtn: $('shuffle-names-btn'),
            teamToggle: $('team-toggle'), teamDisplay: $('team-display'), reshuffleBtn: $('reshuffle-teams-btn'), resetTeamsBtn: $('reset-teams-btn'),
            redScore: $('red-score'), blueScore: $('blue-score'),
            leaderboard: $('leaderboard'), leaderboardEmpty: $('leaderboard-empty'), resetScoresBtn: $('reset-scores-btn'), classSummary: $('class-summary'),
            gameLog: $('game-log'), logEmpty: $('log-empty'), clearLogBtn: $('clear-log-btn'),
            exportCsvBtn: $('export-csv-btn'), exportJsonBtn: $('export-json-btn'), importJsonBtn: $('import-json-btn'), importJsonFile: $('import-json-file'),
            gameModal: $('game-modal'), settingsModal: $('settings-modal'), classModal: $('class-modal'),
            winnerName: $('winner-name'), winnerTeamBadge: $('winner-team-badge'), winnerLevelBadge: $('winner-level-badge'), winnerStreakBadge: $('winner-streak-badge'),
            gameTitle: $('game-title'), gameArea: $('game-area'), gameResult: $('game-result'), gameHint: $('game-hint'),
            bonusStarBtn: $('bonus-star-btn'), retryGameBtn: $('retry-game-btn'), nextGameBtn: $('next-game-btn'), spinAgainBtn: $('spin-again-btn'),
            soundToggle: $('sound-toggle'), timerSelect: $('timer-select'), globalTimerSelect: $('global-timer-select'), difficultySelect: $('difficulty-select'),
            streakToggle: $('streak-toggle'), projectorToggle: $('projector-toggle'),
            gamesToggleGrid: $('games-toggle-grid'), gamesAllBtn: $('games-all-btn'), gamesNoneBtn: $('games-none-btn'), resetAllBtn: $('reset-all-btn'),
            lobbyBtn: $('lobby-btn'), themeBtn: $('theme-btn'), fullscreenBtn: $('fullscreen-btn'), settingsBtn: $('settings-btn'),
            classSelect: $('class-select'), classMenuBtn: $('class-menu-btn'), classList: $('class-list'), classAddBtn: $('class-add-btn'), classCloseBtn: $('class-close-btn'),
            headerClass: $('header-class'), gamesContainer: $('games-container'), appVersion: $('app-version'),
        };

        Dialog.init();
        Lobby.init();
        this.bindEvents();
        this.renderGamesGrid();
        this.refs.appVersion.textContent = 'v' + CONFIG.VERSION;
        this.refreshAll();
    },

    // Sinf almashganda / import qilinganda hamma narsani qayta chizish
    refreshAll() {
        this.applyTheme();
        this.applyProjector();
        this.syncSettingsUI();
        this.renderGameToggles();
        this.updateClassUI();
        this.updateTeamMode();
        this.updateNamesList();
        this.updateLeaderboard();
        this.updateLog();
        Wheel.draw();
    },

    // ==================== EVENTS ====================
    bindEvents() {
        const r = this.refs;

        document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => this.switchTab(btn.dataset.tab)));

        // O'quvchilar
        r.addNameBtn.addEventListener('click', () => this.addStudent(r.nameInput.value));
        r.nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') this.addStudent(r.nameInput.value); });
        r.importNamesBtn.addEventListener('click', () => this.importNames());
        r.sortNamesBtn.addEventListener('click', () => {
            state.students.sort((a, b) => a.localeCompare(b, 'uz'));
            Storage.save(); this.updateNamesList(); Wheel.draw();
        });
        r.shuffleNamesBtn.addEventListener('click', () => {
            state.students = Utils.shuffle(state.students);
            Storage.save(); this.updateNamesList(); Wheel.draw(); Sound.click();
        });
        r.namesList.addEventListener('click', e => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const name = btn.dataset.name;
            if (btn.dataset.action === 'remove') this.removeStudent(name);
            if (btn.dataset.action === 'unuse') { state.usedStudents.delete(name); Storage.save(); this.updateNamesList(); Wheel.draw(); }
        });
        r.clearNamesBtn.addEventListener('click', async () => {
            if (!await Dialog.confirm("Barcha ismlar va ularning natijalari o'chiriladi. Davom etasizmi?", { danger: true, okText: "O'chirish" })) return;
            const cls = emptyClassData();
            Object.assign(state, { students: [], scores: {}, stats: {}, teams: cls.teams, teamScores: cls.teamScores, usedStudents: new Set(), log: [] });
            Storage.save();
            this.refreshAll();
            Toast.info("Ro'yxat tozalandi");
        });

        r.noRepeatToggle.addEventListener('change', () => {
            state.noRepeat = r.noRepeatToggle.checked;
            state.usedStudents.clear();
            Storage.save(); this.updateNamesList(); Wheel.draw();
        });
        r.fairPickToggle.addEventListener('change', () => { state.fairPick = r.fairPickToggle.checked; Storage.save(); });

        // Aylantirish
        r.spinBtn.addEventListener('click', () => { Sound.ensure(); Wheel.spin(); });

        // Jamoa
        r.teamToggle.addEventListener('change', () => { state.teamMode = r.teamToggle.checked; this.updateTeamMode(); Storage.save(); });
        r.reshuffleBtn.addEventListener('click', () => { this.shuffleTeams(); Toast.info('Jamoalar qayta aralashtirildi'); });
        r.resetTeamsBtn.addEventListener('click', () => { state.teamScores = { red: 0, blue: 0 }; Storage.save(); this.updateTeamScores(); });

        // Natijalar
        r.leaderboard.addEventListener('click', e => {
            const btn = e.target.closest('[data-action]');
            if (btn) {
                const name = btn.dataset.name;
                if (btn.dataset.action === 'plus') { Games.awardStars(1, { name }); Sound.pop(); }
                if (btn.dataset.action === 'minus') { state.scores[name] = Math.max(0, (state.scores[name] || 0) - 1); }
                Stats.checkBadges(name, {});
                Storage.save(); this.updateLeaderboard(); this.updateTeamScores();
                return;
            }
            const row = e.target.closest('.lb-row');
            if (row) row.classList.toggle('open');
        });
        r.resetScoresBtn.addEventListener('click', async () => {
            if (!await Dialog.confirm('Barcha ballar, statistika va jurnal tozalanadi. Davom etasizmi?', { danger: true, okText: 'Tozalash' })) return;
            state.scores = {}; state.stats = {}; state.teamScores = { red: 0, blue: 0 }; state.log = [];
            state.students.forEach(n => { state.scores[n] = 0; });
            Storage.save(); this.updateLeaderboard(); this.updateLog(); this.updateTeamScores(); this.updateNamesList();
            Toast.info('Natijalar tozalandi');
        });
        r.clearLogBtn.addEventListener('click', () => { state.log = []; Storage.save(); this.updateLog(); });
        r.exportCsvBtn.addEventListener('click', () => {
            Utils.downloadFile(`natijalar-${state.className}-${Utils.todayStamp()}.csv`, Stats.toCSV(), 'text/csv;charset=utf-8');
            Toast.success('CSV fayl yuklandi');
        });
        r.exportJsonBtn.addEventListener('click', () => {
            Utils.downloadFile(`sehrli-baraban-${Utils.todayStamp()}.json`, Storage.exportJSON(), 'application/json');
            Toast.success('Zaxira nusxa saqlandi');
        });
        r.importJsonBtn.addEventListener('click', () => r.importJsonFile.click());
        r.importJsonFile.addEventListener('change', async () => {
            const file = r.importJsonFile.files[0];
            r.importJsonFile.value = '';
            if (!file) return;
            if (!await Dialog.confirm("Joriy ma'lumotlar fayldagi ma'lumotlar bilan almashtiriladi. Davom etasizmi?", { okText: 'Yuklash' })) return;
            const text = await file.text();
            const res = Storage.importJSON(text);
            if (res.ok) { this.refreshAll(); Toast.success(`Yuklandi: ${res.classes} ta sinf`); }
            else Toast.error(res.error);
        });

        // O'yin modali
        r.bonusStarBtn.addEventListener('click', () => {
            const name = state.currentWinner;
            if (!name || !state.students.includes(name)) { Toast.info("Bonus faqat ro'yxatdagi o'quvchiga beriladi"); return; }
            Games.awardStars(1);
            Sound.pop(); Confetti.launch(40);
            Stats.log({ name, game: 'bonus', correct: true, stars: 1 });
            Storage.save(); this.updateLeaderboard(); this.updateLog(); this.updateTeamScores();
            Toast.success(`🎁 ${Utils.escapeHtml(name)} +1 ⭐ bonus!`);
        });
        r.retryGameBtn.addEventListener('click', () => this.startGame(state.currentGame));
        r.nextGameBtn.addEventListener('click', () => this.startGame(Games.randomId(state.currentGame)));
        r.spinAgainBtn.addEventListener('click', () => { this.closeModal(r.gameModal); setTimeout(() => Wheel.spin(), 250); });

        document.getElementById('modal-close-btn').addEventListener('click', () => this.closeModal(r.gameModal));
        document.getElementById('settings-close-btn').addEventListener('click', () => this.closeModal(r.settingsModal));
        r.classCloseBtn.addEventListener('click', () => this.closeModal(r.classModal));
        document.querySelectorAll('.modal-overlay').forEach(ov => ov.addEventListener('click', () => {
            const modal = ov.closest('.modal');
            if (modal.id !== 'dialog-modal') this.closeModal(modal);
        }));

        // Sozlamalar
        r.settingsBtn.addEventListener('click', () => this.openModal(r.settingsModal));
        r.soundToggle.addEventListener('change', () => { state.settings.soundEnabled = r.soundToggle.checked; Storage.save(); if (state.settings.soundEnabled) Sound.pop(); });
        r.timerSelect.addEventListener('change', () => { state.settings.timerDuration = parseInt(r.timerSelect.value, 10); Storage.save(); });
        r.globalTimerSelect.addEventListener('change', () => { state.settings.globalTimer = parseInt(r.globalTimerSelect.value, 10); Storage.save(); });
        r.difficultySelect.addEventListener('change', () => { state.settings.difficulty = r.difficultySelect.value; Storage.save(); });
        r.streakToggle.addEventListener('change', () => { state.settings.streakBonus = r.streakToggle.checked; Storage.save(); });
        r.projectorToggle.addEventListener('change', () => { state.settings.projector = r.projectorToggle.checked; Storage.save(); this.applyProjector(); });
        r.gamesToggleGrid.addEventListener('change', () => this.readGameToggles());
        r.gamesAllBtn.addEventListener('click', () => { state.settings.enabledGames = null; Storage.save(); this.renderGameToggles(); });
        r.gamesNoneBtn.addEventListener('click', () => { state.settings.enabledGames = []; Storage.save(); this.renderGameToggles(); });
        r.resetAllBtn.addEventListener('click', async () => {
            if (!await Dialog.confirm("BARCHA sinflar, ballar va sozlamalar butunlay o'chiriladi!", { danger: true, okText: "Ha, hammasini o'chirish" })) return;
            Storage.resetAll();
            this.closeModal(r.settingsModal);
            this.refreshAll();
            Toast.info("Hammasi o'chirildi");
        });

        r.themeBtn.addEventListener('click', () => {
            state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
            Storage.save(); this.applyTheme(); Wheel.draw();
        });
        r.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        r.lobbyBtn.addEventListener('click', () => { Sound.ensure(); Lobby.show(); });
        document.addEventListener('fullscreenchange', () => { r.fullscreenBtn.textContent = document.fullscreenElement ? '🗗' : '⛶'; });

        // Sinflar
        r.classSelect.addEventListener('change', () => {
            if (Storage.switchClass(r.classSelect.value)) { this.refreshAll(); Toast.info(`Sinf: ${Utils.escapeHtml(state.className)}`); }
        });
        r.classMenuBtn.addEventListener('click', () => { this.renderClassList(); this.openModal(r.classModal); });
        r.classAddBtn.addEventListener('click', async () => {
            const name = await Dialog.prompt('Yangi sinf nomi', '', { placeholder: 'Masalan: 3-B' });
            if (name == null) return;
            const res = Storage.createClass(name);
            if (!res.ok) { Toast.error(res.error); return; }
            this.refreshAll(); this.renderClassList();
            Toast.success(`Sinf yaratildi: ${Utils.escapeHtml(state.className)}`);
        });
        r.classList.addEventListener('click', async e => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const name = btn.dataset.name;
            if (btn.dataset.action === 'switch') {
                if (Storage.switchClass(name)) this.refreshAll();
                this.closeModal(r.classModal);
            } else if (btn.dataset.action === 'rename') {
                const newName = await Dialog.prompt('Sinf nomini o\'zgartirish', name);
                if (newName == null) return;
                const res = Storage.renameClass(name, newName);
                if (!res.ok) { Toast.error(res.error); return; }
                this.refreshAll(); this.renderClassList();
            } else if (btn.dataset.action === 'delete') {
                if (!await Dialog.confirm(`"${name}" sinfi va uning barcha natijalari o'chiriladi.`, { danger: true, okText: "O'chirish" })) return;
                Storage.deleteClass(name);
                this.refreshAll(); this.renderClassList();
            }
        });

        // O'yin kartalari
        this.refs.gamesContainer.addEventListener('click', e => {
            const card = e.target.closest('.game-card');
            if (!card) return;
            Sound.ensure();
            const id = card.dataset.game;
            const def = Games.get(id);
            if (def && def.team && !state.teamMode) {
                Toast.info("Bu o'yin uchun avval Jamoaviy Jang rejimini yoqing 👥");
                return;
            }
            let winner = 'O\'yinchi';
            if (state.students.length > 0) {
                const idx = state.students.length >= 2 ? Wheel.pickIndex() : 0;
                winner = state.students[idx];
                Stats.recordPick(winner);
                if (state.noRepeat) state.usedStudents.add(winner);
                this.updateNamesList();
            }
            state.currentWinner = winner;
            this.showGameModal(winner, id);
        });

        // Klaviatura
        document.addEventListener('keydown', e => this.onKeyDown(e));
    },

    onKeyDown(e) {
        const r = this.refs;
        const tag = document.activeElement ? document.activeElement.tagName : '';
        const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
        const gameOpen = !r.gameModal.classList.contains('hidden');
        const anyModal = gameOpen || !r.settingsModal.classList.contains('hidden') || !r.classModal.classList.contains('hidden') || Dialog.isOpen() || Lobby.isOpen();

        if (e.key === 'Escape') {
            if (Dialog.isOpen()) { Dialog._finish(false); return; }
            if (Lobby.isOpen()) { Lobby.hide(); return; }
            if (gameOpen) this.closeModal(r.gameModal);
            else if (!r.settingsModal.classList.contains('hidden')) this.closeModal(r.settingsModal);
            else if (!r.classModal.classList.contains('hidden')) this.closeModal(r.classModal);
            return;
        }
        if (e.code === 'Space' && !typing && !anyModal && !Wheel.spinning) {
            e.preventDefault();
            Sound.ensure();
            Wheel.spin();
            return;
        }
        if (gameOpen && !typing && /^[1-9]$/.test(e.key)) {
            const btn = r.gameArea.querySelector(`.kbd-opt[data-key="${e.key}"]:not(:disabled)`);
            if (btn) { e.preventDefault(); btn.click(); }
        }
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tabName}`));
        if (tabName === 'baraban') requestAnimationFrame(() => { Wheel.resize(); Wheel.draw(); });
    },

    // ==================== O'QUVCHILAR ====================
    addStudent(raw, { silent = false } = {}) {
        const name = Utils.normalizeName(raw || '');
        const input = this.refs.nameInput;
        if (!name) return false;
        if (state.students.length >= CONFIG.MAX_STUDENTS) { if (!silent) Toast.error(`Ko'pi bilan ${CONFIG.MAX_STUDENTS} ta o'quvchi`); return false; }
        if (state.students.some(s => s.toLowerCase() === name.toLowerCase())) {
            if (!silent) {
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 400);
                Toast.error(`"${Utils.escapeHtml(name)}" allaqachon ro'yxatda`);
            }
            return false;
        }
        state.students.push(name);
        state.scores[name] = state.scores[name] || 0;
        if (state.teamMode) this.assignToTeam(name);
        if (!silent) {
            input.value = '';
            input.focus();
            Storage.save();
            this.updateNamesList();
            Wheel.draw();
        }
        return true;
    },

    async importNames() {
        const text = await Dialog.textarea("Ro'yxatni qo'shish", {
            message: 'Har bir ismni yangi qatordan yoki vergul bilan ajratib yozing',
            placeholder: 'Ali\nLaylo\nBobur',
        });
        if (!text) return;
        let added = 0;
        text.split(/[\n,;]+/).forEach(n => { if (this.addStudent(n, { silent: true })) added++; });
        Storage.save();
        this.updateNamesList();
        Wheel.draw();
        Toast.success(`${added} ta o'quvchi qo'shildi`);
    },

    removeStudent(name) {
        const idx = state.students.indexOf(name);
        if (idx < 0) return;
        state.students.splice(idx, 1);
        delete state.scores[name];
        delete state.stats[name];
        state.usedStudents.delete(name);
        state.teams.red = state.teams.red.filter(n => n !== name);
        state.teams.blue = state.teams.blue.filter(n => n !== name);
        Storage.save();
        this.updateNamesList();
        this.updateLeaderboard();
        Wheel.draw();
    },

    updateNamesList() {
        const r = this.refs;
        if (Lobby.isOpen()) Lobby.renderWheel();
        const n = state.students.length;
        r.namesCount.textContent = n;
        r.namesEmpty.classList.toggle('hidden', n > 0);
        r.namesActions.classList.toggle('hidden', n === 0);
        r.spinBtn.disabled = n < 2 || Wheel.spinning;
        r.noRepeatToggle.checked = state.noRepeat;
        r.fairPickToggle.checked = state.fairPick;

        const spinSub = r.spinBtn.querySelector('.spin-sub');
        if (n < 2) spinSub.textContent = n === 0 ? 'Avval ismlarni kiriting' : 'Kamida 2 ta ism kerak';

        r.namesList.innerHTML = state.students.map(name => {
            const isUsed = state.noRepeat && state.usedStudents.has(name);
            let dot = 'name-dot';
            if (state.teamMode) dot += state.teams.red.includes(name) ? ' red' : state.teams.blue.includes(name) ? ' blue' : '';
            if (isUsed) dot += ' used';
            const safe = Utils.escapeHtml(name);
            const stars = state.scores[name] || 0;
            return `<li class="${isUsed ? 'used' : ''}">
                <span class="name-info">
                    <span class="${dot}"></span>
                    <span class="name-avatar">${Utils.avatarFor(name)}</span>
                    <span class="name-text">${safe}</span>
                    ${stars ? `<span class="name-stars">⭐${stars}</span>` : ''}
                </span>
                <span class="name-tools">
                    ${isUsed ? `<button class="name-remove" data-action="unuse" data-name="${safe}" title="Qayta faollashtirish">↺</button>` : ''}
                    <button class="name-remove" data-action="remove" data-name="${safe}" title="O'chirish">✕</button>
                </span>
            </li>`;
        }).join('');
    },

    // ==================== JAMOA ====================
    assignToTeam(name) {
        if (state.teams.red.includes(name) || state.teams.blue.includes(name)) return;
        if (state.teams.red.length <= state.teams.blue.length) state.teams.red.push(name);
        else state.teams.blue.push(name);
    },

    shuffleTeams() {
        const shuffled = Utils.shuffle(state.students);
        const mid = Math.ceil(shuffled.length / 2);
        state.teams.red = shuffled.slice(0, mid);
        state.teams.blue = shuffled.slice(mid);
        Storage.save();
        this.updateNamesList();
        this.updateTeamScores();
    },

    updateTeamMode() {
        const r = this.refs;
        r.teamToggle.checked = state.teamMode;
        r.teamDisplay.classList.toggle('hidden', !state.teamMode);
        if (state.teamMode) {
            // Ro'yxatdan chiqib ketganlarni olib tashlash, yangilarni qo'shish
            state.teams.red = state.teams.red.filter(n => state.students.includes(n));
            state.teams.blue = state.teams.blue.filter(n => state.students.includes(n));
            if (state.teams.red.length + state.teams.blue.length === 0 && state.students.length > 0) this.shuffleTeams();
            else state.students.forEach(n => this.assignToTeam(n));
        }
        this.updateNamesList();
        this.updateTeamScores();
    },

    updateTeamScores() {
        this.refs.redScore.textContent = state.teamScores.red;
        this.refs.blueScore.textContent = state.teamScores.blue;
    },

    // ==================== NATIJALAR ====================
    updateLeaderboard() {
        const r = this.refs;
        const entries = state.students
            .map(name => ({ name, stars: state.scores[name] || 0, s: Stats.get(name) }))
            .filter(e => e.stars > 0 || e.s.attempts > 0)
            .sort((a, b) => b.stars - a.stars || Stats.accuracy(b.name) - Stats.accuracy(a.name) || a.name.localeCompare(b.name, 'uz'));

        r.leaderboardEmpty.classList.toggle('hidden', entries.length > 0);
        r.resetScoresBtn.classList.toggle('hidden', entries.length === 0);

        const sum = Stats.classSummary();
        r.classSummary.classList.toggle('hidden', sum.attempts === 0);
        r.classSummary.innerHTML = `
            <span>⭐ Jami: <b>${sum.stars}</b></span>
            <span>✏️ Javoblar: <b>${sum.attempts}</b></span>
            <span>✅ Aniqlik: <b>${sum.accuracy}%</b></span>`;

        this.updateTimssCard();
        const openRows = new Set([...r.leaderboard.querySelectorAll('.lb-row.open')].map(el => el.dataset.name));
        const isAuto = state.settings.difficulty === 'auto';

        r.leaderboard.innerHTML = entries.map((e, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
            const safe = Utils.escapeHtml(e.name);
            const acc = Stats.accuracy(e.name);
            const badges = e.s.badges.map(b => Stats.BADGES[b] ? `<span title="${Stats.BADGES[b].name}: ${Stats.BADGES[b].desc}">${Stats.BADGES[b].icon}</span>` : '').join('');
            const details = Object.entries(e.s.games).map(([gid, g]) => {
                const def = Games.get(gid);
                const label = def ? `${def.icon} ${def.name}` : gid === 'bonus' ? '🎁 Bonus' : gid;
                return `<span class="lb-detail">${label}: <b>${g.correct}/${g.attempts}</b></span>`;
            }).join('');
            const avgTime = e.s.timedAnswers ? (e.s.totalTime / e.s.timedAnswers / 1000).toFixed(1) : null;
            const t = Stats.timssSummary(e.name);
            const timssLine = t.total ? Object.entries(TIMSS.DOMAINS).filter(([k]) => t[k].attempts)
                .map(([k, d]) => `${d.icon} ${t[k].pct}%`).join(' ') : '';
            return `<div class="lb-row ${openRows.has(e.name) ? 'open' : ''}" data-name="${safe}">
                <span class="lb-rank">${medal}</span>
                <span class="lb-avatar">${Utils.avatarFor(e.name)}</span>
                <span class="lb-main">
                    <span class="lb-name">${safe}</span>
                    <span class="lb-sub">
                        ${e.s.attempts ? `✅ ${acc}% (${e.s.correct}/${e.s.attempts})` : ''}
                        ${e.s.streak >= 2 ? ` · 🔥 ${e.s.streak}` : ''}
                        ${isAuto ? ` · 🧠 ${MathGen.levelLabel(e.s.level)}` : ''}
                        ${timssLine ? ` · 🌐 ${timssLine}` : ''}
                    </span>
                    ${badges ? `<span class="lb-badges">${badges}</span>` : ''}
                    <span class="lb-details">
                        ${details || '<span class="lb-detail">Hali o\'yin o\'ynalmadi</span>'}
                        ${avgTime ? `<span class="lb-detail">⏱ o'rtacha ${avgTime} s</span>` : ''}
                        ${e.s.bestStreak ? `<span class="lb-detail">🔥 eng uzun seriya ${e.s.bestStreak}</span>` : ''}
                    </span>
                </span>
                <span class="lb-stars">⭐ ${e.stars}</span>
                <span class="lb-tools">
                    <button class="btn-icon-sm" data-action="minus" data-name="${safe}" title="−1 yulduz">−</button>
                    <button class="btn-icon-sm" data-action="plus" data-name="${safe}" title="+1 yulduz">+</button>
                </span>
            </div>`;
        }).join('');
    },

    updateTimssCard() {
        const card = document.getElementById('timss-card');
        const body = document.getElementById('timss-summary');
        if (!card || !body) return;
        const t = Stats.timssSummary();
        card.classList.toggle('hidden', t.total === 0);
        body.innerHTML = Object.entries(TIMSS.DOMAINS).map(([k, d]) => `
            <div class="timss-sum-row">
                <span class="timss-sum-label">${d.icon} ${d.name}</span>
                <div class="timss-sum-track"><div class="timss-sum-fill ${k}" style="width:${t[k].pct}%"></div></div>
                <span class="timss-sum-val">${t[k].attempts ? `${t[k].pct}% <small>(${t[k].correct}/${t[k].attempts})</small>` : '—'}</span>
            </div>`).join('');
    },

    updateLog() {
        const r = this.refs;
        const items = state.log.slice(-40).reverse();
        r.logEmpty.classList.toggle('hidden', items.length > 0);
        r.gameLog.innerHTML = items.map(it => {
            const def = Games.get(it.game);
            const game = def ? `${def.icon} ${def.name}` : it.game === 'bonus' ? '🎁 Bonus' : it.game;
            const res = it.correct ? `<span class="log-res ok">✅${it.stars ? ` +${it.stars}⭐` : ''}</span>` : `<span class="log-res bad">❌</span>`;
            return `<li>
                <span class="log-time">${Utils.formatTime(it.t)}</span>
                <span class="log-name">${Utils.avatarFor(it.name)} ${Utils.escapeHtml(it.name)}</span>
                <span class="log-game">${game}</span>
                ${res}
            </li>`;
        }).join('');
    },

    // ==================== SINFLAR ====================
    updateClassUI() {
        const r = this.refs;
        r.headerClass.textContent = state.className;
        r.classSelect.innerHTML = Storage.classNames().map(n =>
            `<option value="${Utils.escapeHtml(n)}" ${n === state.className ? 'selected' : ''}>${Utils.escapeHtml(n)}</option>`).join('');
        document.title = `Sehrli Baraban — ${state.className}`;
    },

    renderClassList() {
        this.refs.classList.innerHTML = Storage.classNames().map(n => {
            const cls = Storage.data.classes[n];
            const safe = Utils.escapeHtml(n);
            const active = n === state.className;
            return `<li class="${active ? 'active' : ''}">
                <button class="class-name" data-action="switch" data-name="${safe}">${active ? '✅ ' : ''}${safe} <small>${cls.students.length} o'quvchi</small></button>
                <span class="class-tools">
                    <button class="btn-icon-sm" data-action="rename" data-name="${safe}" title="Nomini o'zgartirish">✏️</button>
                    <button class="btn-icon-sm danger" data-action="delete" data-name="${safe}" title="O'chirish">🗑</button>
                </span>
            </li>`;
        }).join('');
    },

    // ==================== O'YINLAR RO'YXATI ====================
    renderGamesGrid() {
        const groups = {};
        Games.list().forEach(def => { (groups[def.cat] = groups[def.cat] || []).push(def); });
        this.refs.gamesContainer.innerHTML = Object.entries(Games.CATEGORIES).filter(([k]) => groups[k]).map(([k, cat]) => `
            <div class="games-group">
                <h4 class="games-group-title">${cat.icon} ${cat.name}</h4>
                ${cat.desc ? `<p class="games-group-desc">${cat.desc}</p>` : ''}
                <div class="games-grid">
                    ${groups[k].map(def => `<button class="game-card" data-game="${def.id}">
                        <span class="game-icon">${def.icon}</span>
                        <span class="game-name">${def.name}</span>
                        <span class="game-desc">${def.desc}</span>
                        ${def.team ? '<span class="game-tag">👥 jamoa</span>' : ''}
                    </button>`).join('')}
                </div>
            </div>`).join('');
    },

    renderGameToggles() {
        this.refs.gamesToggleGrid.innerHTML = Games.list().map(def => `
            <label class="game-toggle ${Games.isEnabled(def.id) ? 'on' : ''}">
                <input type="checkbox" data-game="${def.id}" ${Games.isEnabled(def.id) ? 'checked' : ''}>
                <span>${def.icon} ${def.name}</span>
            </label>`).join('');
    },

    readGameToggles() {
        const boxes = [...this.refs.gamesToggleGrid.querySelectorAll('input[type=checkbox]')];
        const on = boxes.filter(b => b.checked).map(b => b.dataset.game);
        state.settings.enabledGames = on.length === boxes.length ? null : on;
        boxes.forEach(b => b.closest('.game-toggle').classList.toggle('on', b.checked));
        if (on.length === 0) Toast.info("Hech qanday o'yin tanlanmadi — baraban barcha o'yinlardan tanlaydi");
        Storage.save();
    },

    // ==================== SOZLAMALAR / MAVZU ====================
    syncSettingsUI() {
        const r = this.refs, s = state.settings;
        r.soundToggle.checked = s.soundEnabled;
        r.timerSelect.value = String(s.timerDuration);
        r.globalTimerSelect.value = String(s.globalTimer || 0);
        r.difficultySelect.value = s.difficulty;
        r.streakToggle.checked = s.streakBonus;
        r.projectorToggle.checked = !!s.projector;
    },

    applyTheme() {
        const light = state.settings.theme === 'light';
        document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
        this.refs.themeBtn.textContent = light ? '🌙' : '☀️';
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = light ? '#f4f4fb' : '#0a0a1a';
    },

    applyProjector() {
        document.body.classList.toggle('projector', !!state.settings.projector);
        requestAnimationFrame(() => { Wheel.resize(); Wheel.draw(); });
    },

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen && document.exitFullscreen();
        }
    },

    // ==================== MODALLAR ====================
    openModal(modal) { modal.classList.remove('hidden'); },

    closeModal(modal) {
        modal.classList.add('hidden');
        if (modal === this.refs.gameModal) {
            Games.clearTimer();
            Games.answered = true;   // kutilayotgan callbacklarni to'xtatish
            state.currentGame = null;
        }
    },

    showGameModal(winner, gameId) {
        const r = this.refs;
        const real = state.students.includes(winner);
        state.currentWinner = winner;
        r.winnerName.textContent = (real ? Utils.avatarFor(winner) + ' ' : '') + winner;
        this.updateWinnerMeta();
        this.openModal(r.gameModal);
        this.startGame(gameId);
    },

    updateWinnerMeta() {
        const r = this.refs;
        const name = state.currentWinner;
        const real = name && state.students.includes(name);

        r.winnerTeamBadge.className = 'winner-team-badge hidden';
        if (state.teamMode && real) {
            if (state.teams.red.includes(name)) { r.winnerTeamBadge.textContent = '🔴 Qizil jamoa'; r.winnerTeamBadge.className = 'winner-team-badge red'; }
            else if (state.teams.blue.includes(name)) { r.winnerTeamBadge.textContent = "🔵 Ko'k jamoa"; r.winnerTeamBadge.className = 'winner-team-badge blue'; }
        }

        const s = real ? Stats.get(name) : null;
        const auto = state.settings.difficulty === 'auto';
        r.winnerLevelBadge.classList.toggle('hidden', !(real && auto));
        if (real && auto) r.winnerLevelBadge.textContent = `🧠 ${MathGen.levelLabel(s.level)}`;
        r.winnerStreakBadge.classList.toggle('hidden', !(s && s.streak >= 2));
        if (s && s.streak >= 2) r.winnerStreakBadge.textContent = `🔥 ${s.streak}`;
    },

    startGame(gameId) {
        const r = this.refs;
        const def = Games.get(gameId);
        if (!def) return;
        r.gameResult.classList.add('hidden');
        r.gameHint.classList.add('hidden');
        r.retryGameBtn.classList.add('hidden');
        r.nextGameBtn.classList.add('hidden');
        r.spinAgainBtn.classList.add('hidden');
        state.currentGame = gameId;
        r.gameTitle.innerHTML = `${def.icon} ${def.name} <span class="game-title-desc">${def.desc}</span>`;
        Games.begin(gameId, r.gameArea);
        r.gameArea.scrollIntoView({ block: 'nearest' });
    },
};
