/* ===================================================
   SEHRLI BARABAN — Utilities, Toast, Dialog
   =================================================== */

const Utils = {
    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    },

    hash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
        return Math.abs(h);
    },

    avatarFor(name) {
        return CONFIG.AVATARS[this.hash(name) % CONFIG.AVATARS.length];
    },

    pad2(n) {
        return String(n).padStart(2, '0');
    },

    formatTime(ts) {
        const d = new Date(ts);
        return `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`;
    },

    formatNumber(n) {
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },

    normalizeName(name) {
        return name.replace(/\s+/g, ' ').trim();
    },

    downloadFile(filename, content, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    todayStamp() {
        const d = new Date();
        return `${d.getFullYear()}-${this.pad2(d.getMonth() + 1)}-${this.pad2(d.getDate())}`;
    },
};

// ==================== TOAST ====================
const Toast = {
    show(message, type = 'info', duration = 2600) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.innerHTML = message;
        container.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 300);
        }, duration);
    },
    success(m, d) { this.show(m, 'success', d); },
    error(m, d) { this.show(m, 'error', d); },
    info(m, d) { this.show(m, 'info', d); },
};

// ==================== DIALOG (confirm / prompt / textarea) ====================
const Dialog = {
    _resolve: null,

    refs() {
        return {
            modal: document.getElementById('dialog-modal'),
            title: document.getElementById('dialog-title'),
            message: document.getElementById('dialog-message'),
            input: document.getElementById('dialog-input'),
            textarea: document.getElementById('dialog-textarea'),
            ok: document.getElementById('dialog-ok'),
            cancel: document.getElementById('dialog-cancel'),
        };
    },

    init() {
        const r = this.refs();
        r.ok.addEventListener('click', () => this._finish(true));
        r.cancel.addEventListener('click', () => this._finish(false));
        r.modal.querySelector('.modal-overlay').addEventListener('click', () => this._finish(false));
        r.input.addEventListener('keydown', e => { if (e.key === 'Enter') this._finish(true); });
    },

    isOpen() {
        return !this.refs().modal.classList.contains('hidden');
    },

    _open({ title, message, mode, value = '', okText = 'OK', cancelText = 'Bekor qilish', danger = false, placeholder = '' }) {
        const r = this.refs();
        r.title.textContent = title || '';
        r.message.textContent = message || '';
        r.message.classList.toggle('hidden', !message);
        r.input.classList.toggle('hidden', mode !== 'prompt');
        r.textarea.classList.toggle('hidden', mode !== 'textarea');
        r.ok.textContent = okText;
        r.cancel.textContent = cancelText;
        r.ok.className = danger ? 'btn-danger btn-dialog' : 'btn-primary';
        r.input.value = value;
        r.input.placeholder = placeholder;
        r.textarea.value = value;
        r.textarea.placeholder = placeholder;
        r.modal.classList.remove('hidden');
        setTimeout(() => {
            if (mode === 'prompt') { r.input.focus(); r.input.select(); }
            else if (mode === 'textarea') r.textarea.focus();
            else r.ok.focus();
        }, 50);
        return new Promise(resolve => { this._resolve = resolve; });
    },

    _finish(ok) {
        const r = this.refs();
        if (r.modal.classList.contains('hidden')) return;
        r.modal.classList.add('hidden');
        const resolve = this._resolve;
        this._resolve = null;
        if (!resolve) return;
        if (!ok) return resolve(null);
        if (!r.input.classList.contains('hidden')) return resolve(r.input.value);
        if (!r.textarea.classList.contains('hidden')) return resolve(r.textarea.value);
        resolve(true);
    },

    confirm(message, opts = {}) {
        return this._open({ title: opts.title || 'Tasdiqlang', message, mode: 'confirm', okText: opts.okText || 'Ha', cancelText: 'Yo\'q', danger: opts.danger })
            .then(v => v === true);
    },

    prompt(title, value = '', opts = {}) {
        return this._open({ title, message: opts.message, mode: 'prompt', value, okText: opts.okText || 'Saqlash', placeholder: opts.placeholder || '' });
    },

    textarea(title, opts = {}) {
        return this._open({ title, message: opts.message, mode: 'textarea', value: opts.value || '', okText: opts.okText || 'Qo\'shish', placeholder: opts.placeholder || '' });
    },
};
