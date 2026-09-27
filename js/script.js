/* ==========================================================================
   Universal "Coming Soon" Landing Page — script.js
   All customization happens in the CONFIG object below. No other code
   changes are required.
   ========================================================================== */

'use strict';

/* ==========================================================================
   CONFIGURATION — edit everything here
   ========================================================================== */
const CONFIG = {
    /* Launch date & time (local time). ISO format: YYYY-MM-DDTHH:MM:SS */
    launchDate: '2026-08-20T00:00:00',

    /* Company / brand */
    companyName: 'Your Company',
    websiteTitle: 'Coming Soon — We Are Almost Ready',
    logoPath: 'images/newlogo.png',
    logoAlt: 'Your Company logo',

    /* Hero image (preview of the future website) */
    heroImagePath: 'images/hero-image.jpeg',
    heroImageAlt: 'Preview of our upcoming website experience',

    /* WhatsApp */
    whatsappNumber: '1234567890',                       // digits only, incl. country code
    whatsappMessage: 'Hello! I\'m interested in your launch.',
    whatsappLabel: 'Chat with us',

    /* Description shown under the hero image */
    descriptionText:
        'Our new digital experience is almost ready. ' +
        'We\'re working hard to deliver something amazing. ' +
        'Stay connected for exciting updates.',

    /* Theme: 'dark' (default) or 'light' */
    themeDefault: 'dark',

    /* Primary accent color — hex, e.g. Luxury Gold #D4AF37 */
    primaryAccent: '#D4AF37',

    /* Confetti on launch (true/false) */
    showConfetti: true,
};

/* ==========================================================================
   Core
   ========================================================================== */
(function init() {
    'use strict';

    document.dispatchEvent(new CustomEvent('beforeLandingInit', { detail: CONFIG }));

    applyConfig(CONFIG);
    applyTheme(CONFIG.themeDefault);
    initThemeToggle();
    initCountdown(CONFIG.launchDate);
    initWhatsApp(CONFIG);

    document.dispatchEvent(new CustomEvent('landingReady', { detail: CONFIG }));
})();

/* --------------------------------------------------------------------------
   Apply config values to the page
   -------------------------------------------------------------------------- */
function applyConfig(cfg) {
    const { document: doc } = window;

    /* Accent color */
    doc.documentElement.style.setProperty('--accent', cfg.primaryAccent);

    /* Title / meta */
    if (cfg.websiteTitle) {
        doc.title = cfg.websiteTitle;
    }
    setMeta('description', cfg.descriptionText);

    /* Logo */
    const logo = doc.getElementById('logo');
    if (logo && cfg.logoPath) {
        logo.src = cfg.logoPath;
        logo.alt = cfg.logoAlt || cfg.companyName + ' logo';
    }

    /* Hero image */
    const heroImage = doc.getElementById('heroImage');
    if (heroImage && cfg.heroImagePath) {
        heroImage.src = cfg.heroImagePath;
        heroImage.alt = cfg.heroImageAlt || 'Preview of our upcoming website';
    }

    /* Description */
    const desc = doc.getElementById('pageDescription');
    if (desc && cfg.descriptionText) {
        desc.textContent = cfg.descriptionText;
    }

    /* Footer year + company name */
    const footerText = doc.getElementById('footerText');
    if (footerText) {
        footerText.innerHTML = '&copy; ' + new Date().getFullYear() +
            (cfg.companyName ? ' ' + cfg.companyName : '') + '. All rights reserved.';
    }
}

/* --------------------------------------------------------------------------
   Helper: set a meta tag value (create it if missing)
   -------------------------------------------------------------------------- */
function setMeta(name, content) {
    let el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

/* --------------------------------------------------------------------------
   Theme (Light / Dark) — saved in localStorage
   -------------------------------------------------------------------------- */
const THEME_KEY = 'landing-theme';

function applyTheme(preferred) {
    const saved = getStoredTheme();
    const theme = saved || preferred || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.setAttribute('aria-pressed', String(theme === 'light'));
        const icon = theme === 'light' ? 'sun' : 'moon';
        toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'light' ? 'dark' : 'light') + ' mode');
    }
}

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_KEY);
    } catch (e) {
        return null;
    }
}

function storeTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
        /* localStorage unavailable — ignore */
    }
}

function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        storeTheme(next);
        toggle.setAttribute('aria-pressed', String(next === 'light'));
        toggle.setAttribute('aria-label', 'Switch to ' + (next === 'light' ? 'dark' : 'light') + ' mode');
    });
}

/* --------------------------------------------------------------------------
   Countdown timer — auto-updates every second
   -------------------------------------------------------------------------- */
function initCountdown(launchDateString) {
    const launchTime = new Date(launchDateString).getTime();

    /* Invalid date → fall back to a sensible default (60 days out) */
    const target = Number.isFinite(launchTime)
        ? launchTime
        : Date.now() + 60 * 24 * 60 * 60 * 1000;

    const els = {
        days: document.getElementById('countdown-days'),
        hours: document.getElementById('countdown-hours'),
        minutes: document.getElementById('countdown-minutes'),
        seconds: document.getElementById('countdown-seconds'),
        countdown: document.getElementById('countdown'),
        live: document.getElementById('live-message'),
    };

    const liveTitle = els.live ? els.live.querySelector('.live-title') : null;
    const heroVisual = document.getElementById('heroVisual');

    function pad(n, len) {
        return String(n).padStart(len, '0');
    }

    function animateValue(el, value, len) {
        const text = pad(value, len);
        if (el && el.textContent !== text) {
            el.textContent = text;
            el.classList.remove('flip');
            /* restart animation */
            void el.offsetWidth;
            el.classList.add('flip');
        }
    }

    function update() {
        const now = Date.now();
        const diff = target - now;

        if (diff <= 0) {
            showLive();
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        animateValue(els.days, days, 2);
        animateValue(els.hours, hours, 2);
        animateValue(els.minutes, minutes, 2);
        animateValue(els.seconds, seconds, 2);

        /* Accessible live region summary */
        if (els.countdown && els.live) {
            els.countdown.setAttribute('aria-label',
                days + ' days, ' + hours + ' hours, ' + minutes + ' minutes, and ' +
                seconds + ' seconds until launch');
        }
    }

    let timer = null;
    let launched = false;

    function showLive() {
        if (launched) return;
        launched = true;
        if (timer) clearInterval(timer);

        if (els.countdown) {
            els.countdown.hidden = true;
            els.countdown.removeAttribute('role');
        }
        if (els.live) {
            els.live.hidden = false;
        }

        if (heroVisual) {
            heroVisual.style.display = 'none';
        }

        if (liveTitle && CONFIG.companyName) {
            liveTitle.textContent = 'We Are Live!';
        }

        if (CONFIG.showConfetti) {
            launchConfetti();
        }
    }

    update();
    timer = setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   WhatsApp button
   -------------------------------------------------------------------------- */
function initWhatsApp(cfg) {
    const btn = document.getElementById('whatsappBtn');
    if (!btn) return;

    const digits = String(cfg.whatsappNumber).replace(/\D/g, '');
    const message = encodeURIComponent(cfg.whatsappMessage || '');
    btn.href = 'https://wa.me/' + digits + '?text=' + message;

    const label = btn.querySelector('.whatsapp-label');
    if (label && cfg.whatsappLabel) {
        label.textContent = cfg.whatsappLabel;
    }
}

/* --------------------------------------------------------------------------
   Confetti celebration (lightweight, CSS-driven)
   -------------------------------------------------------------------------- */
function launchConfetti() {
    const container = document.getElementById('confetti');
    if (!container) return;

    const count = 60;
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';

        const size = 6 + Math.random() * 10;
        piece.style.width = size + 'px';
        piece.style.height = size * 1.3 + 'px';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
        piece.style.setProperty('--spin', (Math.random() * 720 + 360) + 'deg');
        piece.style.animationDuration = (2.5 + Math.random() * 3) + 's';
        piece.style.animationDelay = (Math.random() * 1.2) + 's';

        container.appendChild(piece);
    }
}
