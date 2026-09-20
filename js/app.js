/* ===================================================
   SEHRLI BARABAN — Ilova kirish nuqtasi
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
    Storage.load();
    Confetti.init(document.getElementById('confetti-canvas'));
    Wheel.init(document.getElementById('wheel-canvas'));
    UI.init();

    // Saqlash: sahifa yopilganda / fonga o'tganda
    window.addEventListener('beforeunload', () => Storage.save());
    document.addEventListener('visibilitychange', () => { if (document.hidden) Storage.save(); });

    // PWA: faqat http(s) orqali ochilganda
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
        navigator.serviceWorker.register('sw.js').catch(() => { /* offline rejim ixtiyoriy */ });
    }
});
