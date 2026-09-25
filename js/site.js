/* ==========================================================================
   Elite Aroma Café & Restaurant — shared page shell
   Header behaviour, mobile navigation, smooth in-page scrolling, scroll
   reveals and the homepage's opening/welcome sequences. Every function is
   guarded, so a page only gets the behaviour it actually has markup for.
   Shared by index.html and gallery.html so the two stay identical.
   ========================================================================== */
(function () {
    'use strict';

    /* ---------------------------------------------------------------------
       OPENING ANIMATION (homepage only)
       --------------------------------------------------------------------- */
    function initOpeningAnimation() {
        var overlay = document.getElementById('openingOverlay');
        if (!overlay) return;

        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
            initWelcomePopup();
            return;
        }

        document.body.style.overflow = 'hidden';
        setTimeout(function () {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
            initWelcomePopup();
        }, 2800);
    }

    /* ---------------------------------------------------------------------
       WELCOME POPUP (homepage only, once per session)
       --------------------------------------------------------------------- */
    function initWelcomePopup() {
        var WELCOME_KEY = 'elite-aromas-welcomed';
        var overlay = document.getElementById('welcomeOverlay');
        var closeBtn = document.getElementById('welcomeClose');
        var exploreBtn = document.getElementById('welcomeExploreBtn');

        if (!overlay) return;

        try {
            if (sessionStorage.getItem(WELCOME_KEY)) {
                overlay.classList.remove('active');
                return;
            }
        } catch (e) { }

        setTimeout(function () {
            overlay.classList.add('active');
        }, 300);

        function closePopup() {
            overlay.classList.remove('active');
            try { sessionStorage.setItem(WELCOME_KEY, '1'); } catch (e) { }
        }

        if (closeBtn) closeBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closePopup();
        });

        if (exploreBtn) {
            exploreBtn.addEventListener('click', function (e) {
                e.preventDefault();
                closePopup();
                var targetSection = document.getElementById('about') || document.getElementById('home');
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    /* ---------------------------------------------------------------------
       HEADER SHRINK ON SCROLL
       --------------------------------------------------------------------- */
    function initHeaderScroll() {
        var header = document.getElementById('siteHeader');
        if (!header) return;

        function update() {
            var scrollY = window.pageYOffset || document.documentElement.scrollTop;
            header.classList.toggle('scrolled', scrollY > 60);
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    /* ---------------------------------------------------------------------
       ACTIVE NAV LINK
       --------------------------------------------------------------------- */
    function initActiveNav() {
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.header-nav a, .mobile-menu a[href^="#"]');
        if (!sections.length || !navLinks.length) return;

        function onScroll() {
            var scrollY = window.pageYOffset + 150;
            Array.prototype.forEach.call(sections, function (section) {
                var top = section.offsetTop;
                var height = section.offsetHeight;
                var id = section.getAttribute('id');
                if (scrollY >= top && scrollY < top + height) {
                    Array.prototype.forEach.call(navLinks, function (link) {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------------------------------------------------------------------
       SMOOTH SCROLL FOR SAME-PAGE ANCHORS
       --------------------------------------------------------------------- */
    function initSmoothScroll() {
        var header = document.getElementById('siteHeader');
        Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (anchor) {
            anchor.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#' || targetId.length < 2) return;
                var target;
                try {
                    target = document.querySelector(targetId);
                } catch (err) {
                    return;
                }
                if (!target) return;
                e.preventDefault();
                var headerH = (header && header.offsetHeight) || 80;
                var top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
                window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
            });
        });
    }

    /* ---------------------------------------------------------------------
       MOBILE MENU
       --------------------------------------------------------------------- */
    function initMobileMenu() {
        var btn = document.getElementById('hamburgerBtn');
        var menu = document.getElementById('mobileMenu');
        if (!btn || !menu) return;

        function setOpen(isOpen) {
            menu.classList.toggle('active', isOpen);
            btn.classList.toggle('active', isOpen);
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }

        btn.addEventListener('click', function () {
            setOpen(!menu.classList.contains('active'));
        });

        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) setOpen(false);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('active')) setOpen(false);
        });
    }

    /* ---------------------------------------------------------------------
       SCROLL REVEAL
       --------------------------------------------------------------------- */
    function initScrollReveal() {
        var elements = document.querySelectorAll('.reveal:not(.revealed)');
        if (!elements.length) return;

        if (!('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(elements, function (el) { el.classList.add('revealed'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        Array.prototype.forEach.call(elements, function (el) { observer.observe(el); });
    }

    /* --------------------------------------------------------------------- */
    function boot() {
        initHeaderScroll();
        initActiveNav();
        initSmoothScroll();
        initMobileMenu();
        initScrollReveal();
        initOpeningAnimation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
