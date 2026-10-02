# MFT – Medical Fitness Transformation

Static marketing site for **MFT**, a personalized medical-fitness coaching program led by **Dr. Mohamed El-Rayes** in Egypt.

The site is plain HTML + CSS + vanilla JS — no build step, no framework. It is fully bilingual (English chrome + Arabic content) and the structure is laid out for easy hand-editing.

---

## Quick start

Any static file server will work. The simplest options:

```bash
# Python (no install needed)
cd mft-hero
python3 -m http.server 8000
# → http://localhost:8000

# Node
npx serve .

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

> **Tip:** never open `index.html` via `file://` — the `<a href="about.html">` links and the SVG `<use href="#…">` references can fail under the `file://` protocol on some browsers. Always run a local server.

---

## File layout

```
mft-hero/
├── index.html              ← Home (hero, marquee, stats, about, why, coaching, method, steps, programs, pricing, FAQ, instagram, CTA, contact, footer)
├── about.html              ← About page (story, why-choose, team, gallery, final CTA)
├── transformations.html    ← Before/after transformations page
│
├── css/
│   └── main.css            ← ★ All CSS bundled into one file (49 KB, ~1 HTTP request)
│
├── js/
│   └── main.js             ← Reveal-on-scroll, step selector, IG rail, contact form, count-up, current-page highlight, mobile menu
│
├── assets/
│   └── images/             ← Logo, hero photos, story/team/gallery, before/after pairs
│
└── README.md               ← This file
```

`css/main.css` is a single bundled stylesheet. Inside it, the code is organized into 9 clearly labeled sections (just scroll past the `/* ===== */` headers):

```
1. TOKENS & RESET
2. UTILITIES & GLOBAL ELEMENTS
3. HERO (home page) — nav, marquee strip, socials
4. GENERIC SECTION PRIMITIVES
5. HOME PAGE SECTIONS
6. ARABIC CONTENT LAYER + STATS + PLANS + FORMS
7. POLISH & MOTION
8. ABOUT PAGE
9. TRANSFORMATIONS PAGE
```

> **Don't** add `:root { ... }` declarations anywhere other than at the top of `main.css`. There is exactly one source of truth for tokens.

---

## Design tokens

All colors, type stacks, spacing, radii, and easing curves live in the `:root` block of `css/base.css`. Anywhere else in the codebase you should reference them as `var(--token-name)`, never hard-code values.

| Group      | Tokens                                                         |
| ---------- | -------------------------------------------------------------- |
| Brand      | `--red`, `--brand-red`, `--red-ink`, `--brand-orange`          |
| Surfaces   | `--bg`, `--bg-dark`, `--bg-dark-2`, `--bg-light`               |
| Text       | `--ink`, `--on-dark-body`, `--on-light`, `--on-light-body`     |
| Lines      | `--line`, `--line-d`, `--line-l`                               |
| Radii      | `--r-lg`, `--r-md`                                             |
| Type       | `--display`, `--head`, `--body`, `--ar`                        |
| Layout     | `--wrap`, `--px`, `--sy`, `--sec-y`, `--ease`                  |

---

## Section map (`index.html`)

The home page is composed of these top-level blocks, in order. Each section has a stable `id` you can deep-link to:

| Section ID     | Purpose                                       | Anchor         |
| -------------- | --------------------------------------------- | -------------- |
| `hero`         | Full-bleed hero with photo + scratches + nav  | (top)          |
| `strip`        | Scrolling red marquee                         | —              |
| `stats`        | Animated counter strip                        | —              |
| `about`        | About MFT + founder signature                 | `#about`       |
| `why`          | Why MFT (icon rows)                           | `#why`         |
| `coaching`     | Online Coaching card grid                     | `#coaching`    |
| `method`       | 4 pillars of the methodology                  | `#method`      |
| `steps`        | 6-step "How do I start?" stepper              | `#steps`       |
| `programs`     | 6 program cards                               | `#programs`    |
| `pricing`      | 3 pricing plans (Starter / Transformation / Elite) | `#pricing` |
| `faq`          | 10 expandable Q&A items                        | `#faq`         |
| `instagram`    | 8-tile Instagram rail with prev/next buttons  | `#instagram`   |
| `cta2`         | Final dark CTA banner                         | —              |
| `contact`      | Contact cards + WhatsApp form                 | `#contact`     |
| `ft`           | Site footer                                   | —              |

---

## How `js/main.js` works

Eight small, independent behaviors. Nothing depends on a framework.

1. **`.js` class** on `<html>` so CSS can branch on JS-availability.
2. **Reveal on scroll** — every `.rv` element fades in once via `IntersectionObserver`, with a small per-element stagger.
3. **Step selector** — the 6 step buttons in `#steps` highlight on hover/focus/click.
4. **Instagram rail** — the `<button data-dir="…">` prev/next buttons scroll the rail by ~80% of its width.
5. **Contact form** — submits to `https://wa.me/201155822360` with the form fields pre-filled in the message body.
6. **Count-up animation** — the four `.st b` stat numbers animate from 0 to their final value with an easeOutCubic curve (respects `prefers-reduced-motion`).
7. **Current-page highlight** — adds `aria-current="page"` to the matching nav link, which CSS styles as the active item.
8. **Mobile burger menu** — toggles `body.nav-open`; CSS in `base.css` shows the link list and recolors the burger.

All scroll/observers stop watching after the first hit, so the page stays cheap to scroll.

---

## Adding content

### A new section on the home page

1. Add a `<section id="your-id" aria-labelledby="h-your-id" class="sec light ctr">` (or `dark`/`black`) inside `<main>`.
2. Mark the elements that should reveal on scroll with `class="… rv"`.
3. Reuse the existing utility classes (`.wrap`, `.ttl`, `.lbl`, `.ap`, `.btn`, `.card`, `.chips`, etc.) — see `css/sections.css` and `css/content.css` for the full library.
4. If you need a new token, add it to `base.css` and reference it via `var(--your-token)` everywhere else.

### A new before/after on the transformations page

1. Drop the JPGs into `assets/images/transformations/N-before.jpg` and `N-after.jpg`.
2. Copy one of the existing `<li class="tc rv">` blocks in `transformations.html` and update the file paths, the kind, the duration, and the headline.

---

## Known gaps to fill later

- **Calorie Calculator** — the nav links to `#calculator` but the page doesn't include the section yet. Add a `<section id="calculator">` on `index.html`.
- **TikTok** — link is a placeholder URL; replace with the real `@dr_mohamed_elrayes` TikTok handle.
- **Programs/Instagram images** — the cards on `index.html` currently fall back to Unsplash photos in `polish.css`; replace the gradients with proper owned photos in `assets/images/programs/` and `assets/images/instagram/`.
- **Team photos** — `assets/images/about/team-1..4.jpg` and `gallery-1..5.jpg` are not in the repo yet; add them and the `.ph`/`.g*` backgrounds in `about.css` will pick them up.

---

## License

© 2026 MFT – Medical Fitness Transformation. All Rights Reserved.
