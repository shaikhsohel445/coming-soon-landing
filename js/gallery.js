/* ==========================================================================
   Elite Aroma’s Café & Restaurant — gallery engine
   Vanilla JS, no dependencies, ~7 KB. Each page loads only what it needs:

     #previewGallery  → homepage preview (8 curated photos + lightbox)
     #galleryGrid     → /gallery  (filters + masonry + lightbox)

   Every photo manifest lives in js/gallery-data.js (window.GALLERY_DATA).
   Adding photos later = add optimised files + one manifest entry; no markup
   or CSS changes required.
   ========================================================================== */
(function () {
    'use strict';

    var IMG = 'images/gallery/';
    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Preview uses 4 columns, the gallery page 3 — so the `sizes` hint differs. */
    var SIZES = {
        grid: '(max-width: 560px) 92vw, (max-width: 1024px) 46vw, (max-width: 1440px) 31vw, 370px',
        preview: '(max-width: 560px) 92vw, (max-width: 1024px) 46vw, (max-width: 1440px) 23vw, 272px',
        lightbox: '(max-width: 768px) 92vw, 82vw'
    };

    var ICON = {
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
        next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
        zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>'
    };

    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function srcset(photo) {
        return photo.srcs.map(function (s) { return IMG + s.f + ' ' + s.w + 'w'; }).join(', ');
    }

    /* Human label for a photo, derived from the categories it belongs to. */
    function labelFor(photo, categories) {
        var i, c;
        for (i = 0; i < categories.length; i++) {
            c = categories[i];
            if (c.match && c.match !== 'signature' && photo.cats.indexOf(c.match) !== -1) {
                return c.label;
            }
        }
        for (i = 0; i < photo.cats.length; i++) {
            for (var j = 0; j < categories.length; j++) {
                if (categories[j].match === photo.cats[i]) return categories[j].label;
            }
        }
        return 'Elite Aroma’s Café & Restaurant';
    }

    /* ---------------------------------------------------------------------
       CARD
       --------------------------------------------------------------------- */
    function buildCard(photo, label, sizes) {
        var card = document.createElement('figure');
        card.className = 'gallery-card';
        card.setAttribute('data-slug', photo.slug);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gallery-card__frame';
        btn.setAttribute('aria-label', 'Enlarge photo: ' + photo.title);
        /* Blur-up: an inline ~300 B preview paints instantly, then the real
           file crossfades in. No layout shift because width/height are set. */
        btn.style.backgroundImage = 'url("' + photo.placeholder + '")';

        var img = document.createElement('img');
        img.className = 'gallery-card__img';
        img.alt = photo.alt;
        img.width = photo.w;
        img.height = photo.h;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.sizes = sizes;
        img.srcset = srcset(photo);
        img.src = IMG + photo.srcs[0].f;

        var veil = document.createElement('span');
        veil.className = 'gallery-card__veil';
        veil.innerHTML =
            '<span class="gallery-card__zoom">' + ICON.zoom + '</span>' +
            '<span class="gallery-card__meta">' +
            '<span class="gallery-card__tag">' + esc(label) + '</span>' +
            '<span class="gallery-card__title">' + esc(photo.title) + '</span>' +
            '</span>';

        var err = document.createElement('span');
        err.className = 'gallery-card__error';
        err.innerHTML = '<b>Photo unavailable</b><span>Open the full-size photo instead</span>';

        btn.appendChild(img);
        btn.appendChild(veil);
        btn.appendChild(err);

        var cap = document.createElement('figcaption');
        cap.className = 'gallery-visually-hidden';
        cap.textContent = photo.alt;

        card.appendChild(btn);
        card.appendChild(cap);

        /* Fallback chain: optimised local file → the restaurant's own Google
           Drive original → branded placeholder. A broken image is never
           rendered, and visitors never see Drive's own UI. */
        var stage = 0;
        img.addEventListener('load', function () {
            img.classList.add('is-loaded');
            card.classList.add('is-loaded');
        });
        img.addEventListener('error', function () {
            if (stage === 0) {
                stage = 1;
                img.removeAttribute('srcset');
                img.src = photo.drive;
            } else {
                stage = 2;
                card.classList.add('is-error');
            }
        });

        return card;
    }

    function revealCards(scope) {
        var cards = scope.querySelectorAll('.gallery-card:not(.is-in)');
        if (REDUCED || !('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(cards, function (c) { c.classList.add('is-in'); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('is-in');
                io.unobserve(e.target);
            });
        }, { rootMargin: '300px 0px' });
        Array.prototype.forEach.call(cards, function (c) { io.observe(c); });
    }

    /* ---------------------------------------------------------------------
       LIGHTBOX — hand-rolled, ~2.5 KB, no library
       --------------------------------------------------------------------- */
    function Lightbox(list) {
        this.list = list;
        this.index = 0;
        this.isOpen = false;
        this.stage = 0;
        this.deepLink = false;
        this._build();
    }

    Lightbox.prototype._build = function () {
        var root = document.createElement('div');
        root.className = 'gallery-lightbox';
        root.id = 'galleryLightbox';
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-label', 'Photo viewer');
        root.setAttribute('aria-hidden', 'true');
        root.innerHTML =
            '<div class="gallery-lightbox__stage" data-lb="dismiss">' +
            '<button type="button" class="gallery-lightbox__btn gallery-lightbox__btn--close" data-lb="close" aria-label="Close photo viewer (Escape)">' + ICON.close + '</button>' +
            '<button type="button" class="gallery-lightbox__btn gallery-lightbox__btn--prev" data-lb="prev" aria-label="Previous photo (left arrow)">' + ICON.prev + '</button>' +
            '<figure class="gallery-lightbox__figure">' +
            '<span class="gallery-lightbox__spinner" aria-hidden="true"></span>' +
            '<img class="gallery-lightbox__img" alt="">' +
            '</figure>' +
            '<button type="button" class="gallery-lightbox__btn gallery-lightbox__btn--next" data-lb="next" aria-label="Next photo (right arrow)">' + ICON.next + '</button>' +
            '</div>' +
            '<div class="gallery-lightbox__bar">' +
            '<div class="gallery-lightbox__caption">' +
            '<p class="gallery-lightbox__title"></p>' +
            '<p class="gallery-lightbox__meta"></p>' +
            '</div>' +
            '<p class="gallery-lightbox__counter" aria-live="polite"></p>' +
            '</div>';
        document.body.appendChild(root);

        this.root = root;
        this.figure = root.querySelector('.gallery-lightbox__figure');
        this.img = root.querySelector('.gallery-lightbox__img');
        this.title = root.querySelector('.gallery-lightbox__title');
        this.meta = root.querySelector('.gallery-lightbox__meta');
        this.counter = root.querySelector('.gallery-lightbox__counter');
        this.btnPrev = root.querySelector('[data-lb="prev"]');
        this.btnNext = root.querySelector('[data-lb="next"]');
        this.btnClose = root.querySelector('[data-lb="close"]');

        var self = this;

        root.addEventListener('click', function (e) {
            var act = e.target.closest('[data-lb]');
            if (act && act.dataset.lb !== 'dismiss') {
                e.preventDefault();
                if (act.dataset.lb === 'close') self.close();
                else if (act.dataset.lb === 'prev') self.show(self.index - 1);
                else if (act.dataset.lb === 'next') self.show(self.index + 1);
                return;
            }
            /* Backdrop click dismisses; clicking the photo itself does not. */
            if (e.target.closest('.gallery-lightbox__figure')) return;
            self.close();
        });

        document.addEventListener('keydown', function (e) {
            if (!self.isOpen) return;
            if (e.key === 'Escape') { self.close(); }
            else if (e.key === 'ArrowRight') { self.show(self.index + 1); }
            else if (e.key === 'ArrowLeft') { self.show(self.index - 1); }
            else if (e.key === 'Tab') { self._trap(e); }
        });

        this.touchX = null;
        root.addEventListener('touchstart', function (e) {
            self.touchX = e.changedTouches[0].clientX;
        }, { passive: true });
        root.addEventListener('touchend', function (e) {
            if (self.touchX === null) return;
            var dx = e.changedTouches[0].clientX - self.touchX;
            if (Math.abs(dx) > 55) self.show(self.index + (dx < 0 ? 1 : -1));
            self.touchX = null;
        }, { passive: true });

        this.img.addEventListener('load', function () {
            self.figure.classList.remove('is-loading');
            self.img.classList.add('is-loaded');
        });
        this.img.addEventListener('error', function () {
            self.figure.classList.remove('is-loading');
            var p = self.list[self.index];
            if (self.stage === 0) {
                self.stage = 1;
                self.img.removeAttribute('srcset');
                self.img.src = p.drive;
            } else {
                self.img.alt = p.alt + ' — this photo could not be loaded';
            }
        });
    };

    Lightbox.prototype._trap = function (e) {
        var f = [this.btnClose, this.btnPrev, this.btnNext].filter(function (el) { return el && !el.hidden; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    Lightbox.prototype.show = function (i) {
        var n = this.list.length;
        if (!n) return;
        this.index = (i % n + n) % n;
        this.stage = 0;
        var p = this.list[this.index];

        this.root.classList.add('is-open');
        this.root.setAttribute('aria-hidden', 'false');
        document.body.classList.add('gallery-lightbox-open');
        this.isOpen = true;

        this.figure.classList.add('is-loading');
        this.img.classList.remove('is-loaded');
        this.img.alt = p.alt;
        this.img.sizes = SIZES.lightbox;
        this.img.srcset = srcset(p);
        this.img.src = IMG + p.srcs[p.srcs.length - 1].f;

        this.title.textContent = p.title;
        this.meta.innerHTML = '<span>' + esc(p.label) + '</span>' +
            '<span>Khadakpada, Kalyan West</span>';
        this.counter.textContent = (this.index + 1) + ' / ' + n;

        this.btnPrev.hidden = n < 2;
        this.btnNext.hidden = n < 2;
        this.btnClose.focus({ preventScroll: true });

        this._preload(this.index + 1);
        this._preload(this.index - 1);
        if (this.deepLink) this._hash(p.slug);
    };

    Lightbox.prototype._preload = function (i) {
        var n = this.list.length;
        if (n < 2) return;
        var p = this.list[((i % n) + n) % n];
        var pre = new Image();
        pre.src = IMG + p.srcs[p.srcs.length - 1].f;
    };

    Lightbox.prototype._hash = function (slug) {
        if (history.replaceState) history.replaceState(null, '', '#' + slug);
    };

    Lightbox.prototype.close = function () {
        this.isOpen = false;
        this.root.classList.remove('is-open');
        this.root.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('gallery-lightbox-open');
        this.img.removeAttribute('srcset');
        this.img.removeAttribute('sizes');
        this.img.src = '';
        this.figure.classList.remove('is-loading');
        if (this.deepLink && history.replaceState) {
            history.replaceState(null, '', location.pathname + location.search);
        }
    };

    /* ---------------------------------------------------------------------
       HOMEPAGE PREVIEW — 8 curated photos, nothing else loaded
       --------------------------------------------------------------------- */
    function initPreview() {
        var grid = document.getElementById('previewGallery');
        var d = window.GALLERY_DATA;
        if (!grid || !d) return;

        var picks = [];
        function take(list, n) {
            list.forEach(function (p) {
                if (picks.length < n && picks.indexOf(p) === -1) picks.push(p);
            });
        }
        take(d.photos.filter(function (p) { return p.cats.indexOf('signature') !== -1; }), 4);
        take(d.photos.filter(function (p) { return p.group === 'ambience'; }), 4);
        take(d.photos, 8);

        var frag = document.createDocumentFragment();
        var list = [];
        picks.forEach(function (p) {
            var label = labelFor(p, d.categories);
            list.push({ title: p.title, alt: p.alt, srcs: p.srcs, drive: p.drive, label: label, slug: p.slug });
            frag.appendChild(buildCard(p, label, SIZES.preview));
        });
        grid.appendChild(frag);
        revealCards(grid);

        var lb = new Lightbox(list);
        grid.addEventListener('click', function (e) {
            var card = e.target.closest('.gallery-card');
            if (!card) return;
            var slug = card.getAttribute('data-slug');
            for (var i = 0; i < list.length; i++) {
                if (list[i].slug === slug) { lb.show(i); return; }
            }
        });

        var total = document.getElementById('previewTotal');
        if (total) total.textContent = String(d.photos.length);
    }

    /* ---------------------------------------------------------------------
       GALLERY PAGE — filters, masonry, lightbox
       --------------------------------------------------------------------- */
    function initGallery() {
        var grid = document.getElementById('galleryGrid');
        var filters = document.getElementById('galleryFilters');
        var d = window.GALLERY_DATA;
        if (!grid || !d) return;

        var photos = d.photos;
        var labelled = photos.map(function (p) {
            return {
                photo: p,
                label: labelFor(p, d.categories),
                view: { title: p.title, alt: p.alt, srcs: p.srcs, drive: p.drive, slug: p.slug, label: labelFor(p, d.categories) }
            };
        });

        /* Build every card once. Filtering then only toggles visibility, so
           switching categories is instant and already-loaded photos are
           never re-fetched. */
        var frag = document.createDocumentFragment();
        labelled.forEach(function (item) {
            frag.appendChild(buildCard(item.photo, item.label, SIZES.grid));
        });
        grid.appendChild(frag);
        revealCards(grid);

        var cards = grid.querySelectorAll('.gallery-card');
        var visible = labelled.slice();
        var current = 'all';

        var lb = new Lightbox(labelled.map(function (i) { return i.view; }));

        function catById(id) {
            for (var i = 0; i < d.categories.length; i++) {
                if (d.categories[i].id === id) return d.categories[i];
            }
            return d.categories[0];
        }

        function apply(id, opts) {
            current = id;
            var cat = catById(id);
            visible = cat.match
                ? labelled.filter(function (i) { return i.photo.cats.indexOf(cat.match) !== -1; })
                : labelled.slice();

            for (var i = 0; i < labelled.length; i++) {
                var on = cat.match ? labelled[i].photo.cats.indexOf(cat.match) !== -1 : true;
                cards[i].hidden = !on;
            }
            lb.list = visible.map(function (i) { return i.view; });

            var empty = document.getElementById('galleryEmpty');
            if (empty) empty.hidden = visible.length > 0;

            var blurb = document.getElementById('galleryBlurb');
            if (blurb) {
                blurb.style.opacity = '0';
                window.setTimeout(function () {
                    blurb.textContent = cat.blurb;
                    blurb.style.opacity = '1';
                }, 140);
            }

            var live = document.getElementById('galleryLive');
            if (live) {
                live.textContent = visible.length + ' ' +
                    (visible.length === 1 ? 'photo' : 'photos') + ' in ' + cat.label;
            }

            if (filters) {
                var btns = filters.querySelectorAll('.gallery-filter');
                Array.prototype.forEach.call(btns, function (b) {
                    var on = b.getAttribute('data-cat') === id;
                    b.setAttribute('aria-selected', on ? 'true' : 'false');
                    b.tabIndex = on ? 0 : -1;
                });
            }

            if (history.replaceState && opts && opts.push) {
                history.replaceState(null, '', '#cat=' + id);
            }
        }

        if (filters) {
            filters.innerHTML = d.categories.map(function (c) {
                return '<button type="button" role="tab" class="gallery-filter" data-cat="' +
                    esc(c.id) + '" aria-selected="false" aria-controls="galleryPanel" tabindex="-1">' +
                    esc(c.label) + '<span class="gallery-filter__count">' + c.count + '</span></button>';
            }).join('');

            filters.addEventListener('click', function (e) {
                var b = e.target.closest('.gallery-filter');
                if (!b) return;
                apply(b.getAttribute('data-cat'));
            });

            /* ARIA tabs keyboard pattern: arrows, Home, End */
            filters.addEventListener('keydown', function (e) {
                if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) === -1) return;
                var list = Array.prototype.slice.call(filters.querySelectorAll('.gallery-filter'));
                var i = list.indexOf(document.activeElement);
                if (i === -1) return;
                e.preventDefault();
                var next = e.key === 'Home' ? 0
                    : e.key === 'End' ? list.length - 1
                        : (i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length;
                apply(list[next].getAttribute('data-cat'));
                list[next].focus();
            });
        }

        grid.addEventListener('click', function (e) {
            var card = e.target.closest('.gallery-card');
            if (!card || card.hidden) return;
            var slug = card.getAttribute('data-slug');
            for (var i = 0; i < visible.length; i++) {
                if (visible[i].photo.slug === slug) { lb.show(i); return; }
            }
        });

        apply('all');

        /* Deep links: /gallery#cat=food or /gallery#allahabadi-paneer-tikka */
        var hash = location.hash.replace('#', '');
        if (hash.indexOf('cat=') === 0) {
            apply(hash.slice(4));
        } else if (hash) {
            for (var k = 0; k < labelled.length; k++) {
                if (labelled[k].photo.slug === hash) {
                    lb.deepLink = true;
                    lb.show(visible.indexOf(labelled[k]));
                    break;
                }
            }
        }

        var toolbar = document.getElementById('galleryToolbar');
        if (toolbar) {
            var onScroll = function () {
                toolbar.classList.toggle('is-stuck', window.pageYOffset > 240);
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
    }

    function boot() {
        initPreview();
        initGallery();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
