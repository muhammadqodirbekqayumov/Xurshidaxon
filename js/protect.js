/* ===================================================
   SEHRLI BARABAN — Muallif huquqi va nusxa ko'chirishga qarshi choralar
   © Mamadaliyeva Xurshidaxon, Jalaquduq tumani 14-maktab
   Eslatma: bu choralar to'siq, 100% himoya emas (brauzer kodni baribir yuklaydi)
   =================================================== */

const AUTHOR = {
    name: 'Mamadaliyeva Xurshidaxon',
    school: "Jalaquduq tumani 14-maktab boshlang'ich sinf o'qituvchisi",
    year: 2026,
};

(() => {
    const isEditable = el => !!(el && el.closest && el.closest('input, textarea, select, [contenteditable]'));
    let lastWarn = 0;
    const warn = () => {
        const now = Date.now();
        if (now - lastWarn < 2500) return;
        lastWarn = now;
        if (typeof Toast !== 'undefined') Toast.info(`© ${AUTHOR.name} — muallif huquqi bilan himoyalangan`);
    };

    // O'ng tugma menyusi (nusxa olish / rasmni saqlash / kodni ko'rish)
    document.addEventListener('contextmenu', e => {
        if (isEditable(e.target)) return;
        e.preventDefault();
        warn();
    });

    // Klaviatura: saqlash, manbani ko'rish, DevTools, chop etish
    document.addEventListener('keydown', e => {
        const k = (e.key || '').toLowerCase();
        const blocked =
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) ||
            (e.ctrlKey && ['s', 'u', 'p'].includes(k)) ||
            (e.ctrlKey && k === 'a' && !isEditable(e.target));
        if (blocked) { e.preventDefault(); e.stopPropagation(); warn(); }
    }, true);

    // Rasm/canvasni sudrab olish
    document.addEventListener('dragstart', e => {
        const t = e.target.tagName;
        if (t === 'IMG' || t === 'CANVAS' || t === 'SVG') e.preventDefault();
    });

    // Nusxa olish (kiritish maydonlaridan tashqari)
    document.addEventListener('copy', e => {
        if (isEditable(e.target)) return;
        e.preventDefault();
        warn();
    });

    // Konsolda muallif belgisi
    try {
        console.log(`%c🎡 Sehrli Baraban\n© ${AUTHOR.year} ${AUTHOR.name} — ${AUTHOR.school}.\nBarcha huquqlar himoyalangan. Muallif roziligisiz nusxa ko'chirish va tarqatish taqiqlanadi.`,
            'font-weight:bold;font-size:13px;color:#8b5cf6');
    } catch (e) { /* ignore */ }

    // Sahifa pastidagi muallif yozuvi
    document.addEventListener('DOMContentLoaded', () => {
        const app = document.getElementById('app');
        if (!app) return;
        const f = document.createElement('footer');
        f.className = 'app-footer';
        f.innerHTML = `© ${AUTHOR.year} <b>${AUTHOR.name}</b> · ${AUTHOR.school}. Barcha huquqlar himoyalangan.`;
        app.appendChild(f);
        const ver = document.getElementById('app-version');
        if (ver) ver.textContent += ` · © ${AUTHOR.name}`;
    });
})();
