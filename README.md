# Universal "Coming Soon" Landing Page

A modern, elegant, fully responsive **Coming Soon** landing page that can be reused for any business, startup, product, SaaS, agency, hospital, institute, portfolio, or eCommerce website launch.

Built with **HTML5, CSS3, and Vanilla JavaScript** only — no frameworks, no build tools, no external dependencies except Google Fonts.

---

## Features

- ✅ Premium black & gold luxury design (light mode also included)
- ✅ Live countdown timer (Days / Hours / Minutes / Seconds)
- ✅ "We Are Live!" message + confetti celebration when the timer hits zero
- ✅ Light / Dark theme toggle with `localStorage` persistence
- ✅ Floating WhatsApp button with pulse animation
- ✅ Glassmorphism cards, golden glow, smooth micro-interactions
- ✅ Fully responsive (desktop → laptop → tablet → mobile → ultra-wide)
- ✅ SEO-ready (meta, Open Graph, Twitter Cards, canonical, semantic HTML)
- ✅ Accessibility (ARIA labels, keyboard navigation, reduced-motion support)
- ✅ Placeholder logo, hero image, and favicon included
- ✅ Future-ready layout for adding newsletters, forms, social links, etc.

---

## Folder Structure

```
coming-soon/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── images/
│   ├── logo.jpeg
│   ├── hero-image.jpeg
│   └── favicon.ico
└── README.md
```

---

## Quick Start

No build step is required. Open `index.html` in a browser, or serve the folder locally:

```bash
# Python 3
python3 -m http.server 8080
# then visit http://localhost:8080
```

---

## Customization

**Everything is configured from the `CONFIG` object at the top of `js/script.js`.** No other code changes are required.

| Setting                 | Key                 | Example                         |
| ----------------------- | ------------------- | ------------------------------- |
| Launch date             | `launchDate`        | `'2027-01-01T00:00:00'`         |
| Company name            | `companyName`       | `'Your Company'`                |
| Website / tab title     | `websiteTitle`      | `'Coming Soon — My Brand'`      |
| Logo image path         | `logoPath`          | `'images/logo.jpeg'`            |
| Hero image path         | `heroImagePath`     | `'images/hero-image.jpeg'`      |
| WhatsApp number         | `whatsappNumber`    | `'14155552671'`                 |
| WhatsApp message        | `whatsappMessage`   | `'Hello! I\'m interested…'`     |
| WhatsApp button label   | `whatsappLabel`     | `'Chat with us'`                |
| Description text        | `descriptionText`   | `'Our new experience is ready…'`|
| Default theme           | `themeDefault`      | `'dark'` / `'light'`            |
| Primary accent color    | `primaryAccent`     | `'#D4AF37'`                     |
| Confetti on launch      | `showConfetti`      | `true` / `false`                |

> **Note:** the WhatsApp number must be in international format **digits only** (e.g. `14155552671` for `+1 415 555 2671`).

### Replacing the placeholder images

Simply overwrite the files in `images/` (or point `logoPath` / `heroImagePath` in the config to your own files):

- `logo.jpeg` — company logo, **PNG/JPEG/SVG**, max height 100px (auto-scales on mobile)
- `hero-image.jpeg` — the large preview illustration (laptop mockup / dashboard / abstract artwork; display height is capped at 62vh so portrait images also look balanced)
- `favicon.ico` — browser tab icon

### SEO

The `<head>` of `index.html` contains the meta title, description, canonical URL, robots, Open Graph, and Twitter Card tags. Update the URLs to your real domain and swap in your own branding.

---

## Browser Support

Chrome, Firefox, Safari, Edge, Opera, Android Browser, and iOS Safari (modern evergreen browsers).

---

## Performance Targets

The page is intentionally lightweight (pure HTML/CSS/JS, no frameworks) to hit Lighthouse goals of **Performance 95+ · Accessibility 95+ · SEO 95+ · Best Practices 95+**.

---

## Extending the Page

The layout is designed so future sections can be added without a redesign — e.g. email subscription form, contact form, social media links, progress bar, background video, particle animation, QR code, multi-language support, or a launch-announcement banner.
