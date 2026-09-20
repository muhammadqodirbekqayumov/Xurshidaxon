# 🎡 Sehrli Baraban — 3-sinf matematika

**Muallif:** Mamadaliyeva Xurshidaxon — Jalaquduq tumani 14-maktab boshlang'ich sinf o'qituvchisi. © 2026, barcha huquqlar himoyalangan ([LICENSE.md](LICENSE.md)).

3-sinf o'quvchilari uchun interaktiv sinf o'yini: o'qituvchi barabanni aylantiradi, tasodifiy o'quvchi tanlanadi va unga matematik topshiriq tushadi. Hech qanday server, kutubxona yoki o'rnatish kerak emas — `index.html` ni brauzerda oching.

## Xususiyatlar

**Baraban**
- Adolatli tanlash — kam chiqqan o'quvchilar ko'proq chiqadi
- "Takrorlanmasin" — hamma bir martadan chiqadi, keyin qaytadan boshlanadi
- Ro'yxatni birdaniga qo'shish (vergul yoki yangi qator), A-Z saralash, aralashtirish
- Bir nechta sinf (3-A, 3-B, ...) — har birining o'z ro'yxati va natijalari
- Jamoaviy jang: 🔴 Qizil vs 🔵 Ko'k

**21 ta o'yin**

| Bo'lim | O'yinlar |
|---|---|
| ➕ Arifmetika | Bomba, Tezkor hisob, Ha/Yo'q, Yashirin son, Amalni top, Blits (30 s) |
| 🧩 Mantiq va sonlar | Sirli son, Tarozi, Ketma-ketlik, Yaxlitlash, Razryadlar, Xotira |
| 🌍 Hayotiy matematika | Soat, O'lchov birliklari, Pul (so'm), Masala, Geometriya |
| 👥 Jamoaviy | Krestik-nolik (misol yechib katak olish) |
| 🌐 TIMSS | Bilish, Qo'llash, Mulohaza — 23 ta tayyor 4-sinf savoli (jadval, diagramma, piktogramma, soat, shakllar) |

**Aqlli rejim**
- 5 darajali qiyinlik; "Aqlli" rejimda har bir o'quvchiga o'z darajasi (3 ta ketma-ket to'g'ri → daraja oshadi)
- Seriya bonusi, yutuqlar (🔥 Olov, 🚀 Raketa, ⚡ Chaqmoq, 👑 Toj ...)
- Noto'g'ri javobdan keyin maslahat (yechim usuli)
- Statistika: aniqlik %, o'rtacha vaqt, o'yinlar bo'yicha natija, bugungi jurnal
- TIMSS natijasi: har bir o'quvchi va butun sinf bo'yicha uch kognitiv soha foizi (CSV'da ham)
- CSV eksport, JSON zaxira nusxa / tiklash

**Sinf uchun qulayliklar**
- Proyektor rejimi (katta shrift), to'liq ekran, yorug'/qorong'i mavzu
- Klaviatura: `Space` — aylantirish, `Esc` — yopish, `1`–`4` — javob tanlash, `Enter` — tekshirish
- O'qituvchi bonusi (🎁) va rekordlar jadvalida qo'lda ± yulduz
- PWA: http(s) orqali ochilganda offline ishlaydi va "ilova" sifatida o'rnatiladi

## Masterklass

- 45 daqiqalik dars ssenariysi: [docs/masterklass-45-daqiqa.md](docs/masterklass-45-daqiqa.md)
- Prezentatsiya (14 slayd): [docs/TIMSS-masterklass.pptx](docs/TIMSS-masterklass.pptx) / [PDF](docs/TIMSS-masterklass.pdf)
- Kirish chiptalari (24 ta savol-karta + javoblar varag'i): [docs/kirish-chiptalari.pdf](docs/kirish-chiptalari.pdf)

## Ishga tushirish

Oddiy: `index.html` faylini ikki marta bosing.

PWA/offline rejim uchun lokal server:

```bash
python -m http.server 8765
```

va `http://localhost:8765` ni oching.

## Tuzilma

```
index.html
css/base.css        umumiy uslublar, mavzular, proyektor rejimi
css/games.css       o'yin uslublari
js/config.js        sozlamalar va global state
js/utils.js         yordamchilar, Toast, Dialog
js/storage.js       localStorage: sinflar, ballar, sozlamalar, import/eksport
js/sound.js         Web Audio ovozlar
js/confetti.js      konfetti
js/mathgen.js       misol generatori (5 daraja) va maslahatlar
js/stats.js         statistika, adaptiv daraja, yutuqlar, jurnal
js/wheel.js         baraban (canvas)
js/games/core.js    o'yinlar registri, natija, taymer, umumiy yordamchilar
js/games/*.js       o'yinlar (har biri Games.register bilan ro'yxatdan o'tadi)
js/games/timss.js   TIMSS savollar banki (TIMSS.BANK) va uch soha o'yinlari
docs/               dars ssenariysi va prezentatsiya
js/ui.js            DOM va hodisalar
js/app.js           kirish nuqtasi
sw.js, manifest.json, icons/   PWA
```

## Yangi o'yin qo'shish

```js
Games.register({
    id: 'yangi', name: 'Yangi o\'yin', icon: '🎲', desc: 'Qisqa tavsif', cat: 'arifmetika',
    run(container, G) {
        const p = MathGen.genProblem();           // joriy darajaga mos misol
        container.innerHTML = `<div class="problem-text">${p.text} = ?</div>${G.optionsHtml(MathGen.options(p.answer))}`;
        G.bindOptions(container, p.answer, ok => G.showResult(ok, ok ? 'To\'g\'ri!' : `Javob: ${p.answer}`));
    },
});
```

O'yin avtomatik ravishda O'yinlar bo'limida, sozlamalardagi ro'yxatda va barabanda paydo bo'ladi.
