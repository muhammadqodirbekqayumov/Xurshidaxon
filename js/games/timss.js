/* ===================================================
   SEHRLI BARABAN — TIMSS rejimi
   Uch kognitiv soha: Bilish (knowing), Qo'llash (applying), Mulohaza (reasoning)
   Tayyor 4-sinf savollari: jadval, diagramma, piktogramma, shakllar, hayotiy masalalar
   =================================================== */

const TIMSS = {
    DOMAINS: {
        bilish:   { name: 'Bilish',    icon: '📘', short: 'B', desc: "Qoida, tushuncha va faktlarni bilish" },
        qollash:  { name: "Qo'llash",  icon: '🛠️', short: 'Q', desc: "Bilimni hayotiy masalada qo'llash" },
        mulohaza: { name: 'Mulohaza',  icon: '🧩', short: 'M', desc: "Ma'lumotni tahlil qilib xulosa chiqarish" },
    },

    used: new Set(),

    BANK: [
        // ================= BILISH =================
        { id: 'b1', domain: 'bilish', topic: 'Sonlar', type: 'options',
          text: "4 507 sonida 5 raqami qaysi razryadda turibdi?",
          options: ['Birlik', "O'nlik", 'Yuzlik', 'Minglik'], answer: 'Yuzlik',
          expl: "4 507 = 4 minglik, 5 yuzlik, 0 o'nlik, 7 birlik." },
        { id: 'b2', domain: 'bilish', topic: 'Sonlar', type: 'options',
          text: "Quyidagi sonlardan qaysi biri eng katta?",
          options: ['3 089', '3 809', '3 098', '3 890'], answer: '3 890',
          expl: "Minglik bir xil (3), yuzlik: 0, 8, 0, 8; o'nlik: 8 va 9 — 3 890 eng katta." },
        { id: 'b3', domain: 'bilish', topic: 'Geometriya', type: 'options',
          text: "Qaysi shaklning 4 ta teng tomoni va 4 ta to'g'ri burchagi bor?",
          options: ['Uchburchak', 'Kvadrat', 'Doira', 'Beshburchak'], answer: 'Kvadrat',
          expl: "Kvadrat — barcha tomonlari teng va barcha burchaklari to'g'ri bo'lgan to'rtburchak." },
        { id: 'b4', domain: 'bilish', topic: 'Arifmetika', type: 'input',
          text: "Hisoblang: 7 × 8 = ?", answer: 56,
          expl: "7 × 8 = 56. Tekshirish: 56 ÷ 8 = 7." },
        { id: 'b5', domain: 'bilish', topic: 'Kasrlar', type: 'options',
          text: "Qaysi kasr 1/2 ga teng?",
          visual: { type: 'fraction', parts: 4, shaded: 2 },
          options: ['2/4', '1/3', '3/5', '2/3'], answer: '2/4',
          expl: "2/4 — 4 bo'lakdan 2 tasi, ya'ni yarmi. Rasmda 4 bo'lakdan 2 tasi bo'yalgan." },
        { id: 'b6', domain: 'bilish', topic: "O'lchov", type: 'input',
          text: "3 hafta necha kun?", answer: 21,
          expl: "1 hafta = 7 kun, 3 hafta = 7 × 3 = 21 kun." },
        { id: 'b7', domain: 'bilish', topic: 'Vaqt', type: 'options',
          text: "Soat nechchini ko'rsatmoqda?",
          visual: { type: 'clock', h: 9, m: 45 },
          options: ['9:45', '10:45', '9:15', '8:45'], answer: '9:45',
          expl: "Kalta strelka 9 dan o'tgan, uzun strelka 9 da (45 daqiqa)." },

        // ================= QO'LLASH =================
        { id: 'q1', domain: 'qollash', topic: 'Masala', type: 'input',
          text: "Do'konda 25 ta daftar bor edi. Yana 37 ta daftar olib kelindi. Kun davomida 48 ta daftar sotildi. Do'konda nechta daftar qoldi?",
          answer: 14, expl: "25 + 37 = 62, 62 − 48 = 14 ta daftar.",
          hint: "Avval jami daftarlarni toping, keyin sotilganini ayiring." },
        { id: 'q2', domain: 'qollash', topic: "Ma'lumotlar", type: 'options',
          text: "Jadvalda sinf kutubxonasidagi kitoblar soni berilgan. Ertaklar she'rlardan nechta ko'p?",
          visual: { type: 'table', head: ['Kitob turi', 'Soni'], rows: [['Ertaklar', '24'], ["She'rlar", '15'], ['Qomuslar', '9'], ['Hikoyalar', '18']] },
          options: ['9', '6', '39', '15'], answer: '9',
          expl: "24 − 15 = 9 ta ko'p." },
        { id: 'q3', domain: 'qollash', topic: 'Masala', type: 'input',
          text: "Bir qutida 6 ta tuxum bor. Oyim 5 ta quti va yana 4 ta alohida tuxum sotib oldi. Jami nechta tuxum?",
          answer: 34, expl: "6 × 5 = 30, 30 + 4 = 34 ta tuxum." },
        { id: 'q4', domain: 'qollash', topic: 'Pul', type: 'options',
          text: "Ruchka 3 500 so'm, daftar 2 000 so'm. Aziz 2 ta ruchka va 3 ta daftar sotib oldi va 20 000 so'm berdi. U qancha qaytim oladi?",
          options: ["7 000 so'm", "13 000 so'm", "5 500 so'm", "14 500 so'm"], answer: "7 000 so'm",
          expl: "2 × 3 500 = 7 000; 3 × 2 000 = 6 000; jami 13 000; 20 000 − 13 000 = 7 000 so'm." },
        { id: 'q5', domain: 'qollash', topic: 'Geometriya', type: 'input',
          text: "To'rtburchakning uzunligi 8 sm, kengligi 5 sm. Uning perimetrini toping (sm).",
          visual: { type: 'rect', w: 8, h: 5 },
          answer: 26, expl: "P = (8 + 5) × 2 = 26 sm." },
        { id: 'q6', domain: 'qollash', topic: 'Vaqt', type: 'options',
          text: "Dars soat 8:30 da boshlanadi va 45 daqiqa davom etadi. Dars qachon tugaydi?",
          options: ['9:15', '9:05', '8:75', '9:30'], answer: '9:15',
          expl: "8:30 + 30 daqiqa = 9:00, yana 15 daqiqa = 9:15." },
        { id: 'q7', domain: 'qollash', topic: "O'lchov", type: 'options',
          text: "Bir shisha suv 1 litr 500 millilitr. 3 ta shunday shishada jami qancha suv bor?",
          options: ['4 l 500 ml', '3 l 500 ml', '4 l', '5 l'], answer: '4 l 500 ml',
          expl: "1 l 500 ml = 1 500 ml; 1 500 × 3 = 4 500 ml = 4 l 500 ml." },

        // ================= MULOHAZA =================
        { id: 'm1', domain: 'mulohaza', topic: 'Diagramma', type: 'options',
          text: "Diagrammada o'quvchilarning sevimli mevalari ko'rsatilgan. Qaysi ikki mevani tanlagan o'quvchilar soni birgalikda olmani tanlaganlar soniga teng?",
          visual: { type: 'bars', items: [{ label: 'Olma', value: 8 }, { label: 'Banan', value: 5 }, { label: 'Uzum', value: 7 }, { label: 'Nok', value: 3 }] },
          options: ['Banan va Nok', 'Uzum va Nok', 'Banan va Uzum', 'Olma va Nok'], answer: 'Banan va Nok',
          expl: "Banan 5 + Nok 3 = 8, olma ham 8." },
        { id: 'm2', domain: 'mulohaza', topic: 'Qonuniyat', type: 'input',
          text: "Qonuniyatni toping va keyingi sonni yozing: 1, 4, 9, 16, 25, ?",
          answer: 36, expl: "Bular kvadrat sonlar: 1×1, 2×2, 3×3, 4×4, 5×5, 6×6 = 36. Farqlar ham ortib boradi: +3, +5, +7, +9, +11.",
          hint: "Qo'shni sonlar orasidagi farqni yozib ko'ring." },
        { id: 'm3', domain: 'mulohaza', topic: 'Masala', type: 'options',
          text: "Dilnoza 3 ta bir xil kitob uchun 27 000 so'm to'ladi. 5 ta shunday kitob necha so'm turadi?",
          options: ["45 000 so'm", "35 000 so'm", "30 000 so'm", "54 000 so'm"], answer: "45 000 so'm",
          expl: "Bitta kitob 27 000 ÷ 3 = 9 000 so'm; 5 ta kitob 9 000 × 5 = 45 000 so'm." },
        { id: 'm4', domain: 'mulohaza', topic: 'Mantiq', type: 'options',
          text: "Ali Validan katta. Vali Sobirdan katta. Sobir Karimdan katta. Eng kichigi kim?",
          options: ['Karim', 'Sobir', 'Vali', 'Ali'], answer: 'Karim',
          expl: "Ali > Vali > Sobir > Karim — eng kichigi Karim." },
        { id: 'm5', domain: 'mulohaza', topic: 'Piktogramma', type: 'input',
          text: "Piktogrammada har bir 🍎 belgisi 2 ta olmani bildiradi. Uch kunda jami nechta olma sotildi?",
          visual: { type: 'picto', icon: '🍎', unit: 2, rows: [{ label: 'Dushanba', count: 3 }, { label: 'Seshanba', count: 5 }, { label: 'Chorshanba', count: 2 }] },
          answer: 20, expl: "Belgilar: 3 + 5 + 2 = 10 ta, har biri 2 ta olma: 10 × 2 = 20 ta olma." },
        { id: 'm6', domain: 'mulohaza', topic: 'Sonlar', type: 'options',
          text: "Ikki sonning yig'indisi 15, ayirmasi 3. Bu qaysi sonlar?",
          options: ['9 va 6', '10 va 5', '8 va 7', '12 va 3'], answer: '9 va 6',
          expl: "9 + 6 = 15 va 9 − 6 = 3. Boshqa juftlarda ayirma 3 ga teng emas." },
        { id: 'm7', domain: 'mulohaza', topic: 'Geometriya', type: 'input',
          text: "To'rtburchakning perimetri 24 sm, uzunligi 8 sm. Uning kengligi necha sm?",
          visual: { type: 'rect', w: 8, h: '?' },
          answer: 4, expl: "Uzunlik + kenglik = 24 ÷ 2 = 12; kenglik = 12 − 8 = 4 sm.",
          hint: "Perimetr = (uzunlik + kenglik) × 2. Avval ikkiga bo'ling." },
        { id: 'm8', domain: 'mulohaza', topic: 'Pul', type: 'input',
          text: "Karimda 4 ta 500 so'mlik tanga va 3 ta 1 000 so'mlik pul bor. U 4 500 so'mlik o'yinchoq sotib oldi. Unda necha so'm qoldi?",
          answer: 500, expl: "4 × 500 = 2 000; 3 × 1 000 = 3 000; jami 5 000; 5 000 − 4 500 = 500 so'm." },
        { id: 'm9', domain: 'mulohaza', topic: 'Jadval', type: 'options',
          text: "Jadvalda to'rt o'quvchining sakrash natijalari berilgan. Kim g'olib va u 2-o'rindan qancha ko'p sakragan?",
          visual: { type: 'table', head: ["O'quvchi", 'Sakrash (sm)'], rows: [['Malika', '118'], ['Jasur', '132'], ['Nodira', '127'], ['Bekzod', '125']] },
          options: ['Jasur, 5 sm', 'Jasur, 7 sm', 'Nodira, 5 sm', 'Jasur, 14 sm'], answer: 'Jasur, 5 sm',
          expl: "Eng katta 132 (Jasur), ikkinchi 127 (Nodira): 132 − 127 = 5 sm." },
    ],

    pick(domain) {
        let pool = this.BANK.filter(q => q.domain === domain && !this.used.has(q.id));
        if (!pool.length) {
            this.BANK.filter(q => q.domain === domain).forEach(q => this.used.delete(q.id));
            pool = this.BANK.filter(q => q.domain === domain);
        }
        const q = Utils.pick(pool);
        this.used.add(q.id);
        return q;
    },

    renderVisual(v) {
        if (!v) return '';
        const esc = Utils.escapeHtml;
        switch (v.type) {
            case 'table':
                return `<table class="timss-table"><thead><tr>${v.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
                    <tbody>${v.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
            case 'bars': {
                const max = Math.max(...v.items.map(i => i.value));
                const colors = ['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-rose)', 'var(--accent-emerald)', 'var(--accent-amber)'];
                return `<div class="timss-bars">${v.items.map((it, i) => `
                    <div class="timss-bar-col">
                        <span class="timss-bar-val">${it.value}</span>
                        <div class="timss-bar" style="height:${Math.round(it.value / max * 100)}%;background:${colors[i % colors.length]}"></div>
                        <span class="timss-bar-label">${esc(it.label)}</span>
                    </div>`).join('')}</div>`;
            }
            case 'picto':
                return `<div class="timss-picto">${v.rows.map(r => `
                    <div class="timss-picto-row"><span class="timss-picto-label">${esc(r.label)}</span><span class="timss-picto-icons">${v.icon.repeat(r.count)}</span></div>`).join('')}
                    <div class="timss-picto-key">${v.icon} = ${v.unit} ta</div></div>`;
            case 'rect': {
                const h = typeof v.h === 'number' ? v.h : Math.max(2, Math.round(v.w / 2));
                const scale = Math.min(220 / v.w, 120 / h);
                const pw = v.w * scale, ph = h * scale;
                const x = (260 - pw) / 2, y = (170 - ph) / 2 + 6;
                return `<svg viewBox="0 0 260 176" class="shape-svg">
                    <rect x="${x}" y="${y}" width="${pw}" height="${ph}" fill="rgba(139,92,246,0.18)" stroke="var(--accent-purple)" stroke-width="3" rx="4"/>
                    <text x="${x + pw / 2}" y="${y - 8}" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor">${v.w} sm</text>
                    <text x="${x + pw + 8}" y="${y + ph / 2}" dominant-baseline="central" font-size="16" font-weight="800" fill="currentColor">${typeof v.h === 'number' ? v.h : '?'} sm</text>
                </svg>`;
            }
            case 'clock':
                return World.clockSVG(v.h, v.m);
            case 'fraction': {
                const cells = [];
                for (let i = 0; i < v.parts; i++) cells.push(`<span class="timss-frac-cell ${i < v.shaded ? 'on' : ''}"></span>`);
                return `<div class="timss-fraction">${cells.join('')}</div>`;
            }
            default:
                return '';
        }
    },

    run(domain, c, G) {
        const q = this.pick(domain);
        const d = this.DOMAINS[domain];
        G.answerText = String(q.answer);
        const body = q.type === 'input' ? G.inputRow() : G.optionsHtml(Utils.shuffle(q.options), { cls: 'option-btn timss-opt' });
        c.innerHTML = `
            <div class="timss-head">
                <span class="timss-domain ${domain}">${d.icon} TIMSS · ${d.name}</span>
                <span class="timss-topic">${Utils.escapeHtml(q.topic)}</span>
            </div>
            <div class="story-text">${Utils.escapeHtml(q.text)}</div>
            ${this.renderVisual(q.visual)}
            ${body}`;

        const done = ok => {
            Stats.recordTimss(state.currentWinner, domain, ok);
            G.showResult(ok,
                ok ? `To'g'ri! 🎉 ${q.expl}` : `Noto'g'ri! Javob: ${q.answer}`,
                { hint: ok ? '' : (q.hint ? `${q.hint} Yechim: ${q.expl}` : `Yechim: ${q.expl}`) });
        };
        if (q.type === 'input') G.bindInput(c, v => done(v === q.answer));
        else G.bindOptions(c, q.answer, ok => done(ok));
    },
};

Object.entries(TIMSS.DOMAINS).forEach(([domain, d]) => {
    Games.register({
        id: `timss_${domain}`, name: `TIMSS: ${d.name}`, icon: d.icon, desc: d.desc, cat: 'timss',
        run(c, G) { TIMSS.run(domain, c, G); },
    });
});
