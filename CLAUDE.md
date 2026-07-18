# AI빌드 오피스텔 분양 홈페이지

Static marketing/presale site for a fictional Korean officetel (오피스텔) development, "AI빌드 오피스텔".

## Stack

Plain HTML/CSS/JS — no build tooling, no framework, no package manager.

- `index.html` — entire site markup (single page, section-anchor navigation)
- `css/style.css` — all styles
- `js/main.js` — all behavior (hero mouse effects, mobile nav, modal, floorplan tabs, scroll-based header theming, back-to-top, demo form submission)
- `assets/` — images (`assets/gallery/` for the gallery section) and hand-built SVG floor plans (`floorplan-a.svg` … `floorplan-d.svg`)

## Hosting

- GitHub: `AI-BuilderSchool/aibuild-officetel` (public)
- Vercel: team `ai-builder-school`, production URL `https://aibuild-officetel.vercel.app`

**GitHub → Vercel auto-deploy is NOT connected.** The user's GitHub account has "member" (not "owner") role in the `AI-BuilderSchool` org, which blocks installing the Vercel GitHub App. Every deploy is therefore manual:

```
git push
vercel --prod --yes
```

Do not spend time re-attempting the GitHub App connection unless the user says org permissions have changed.

## Working conventions

- All user-facing copy is Korean. Match existing tone/register when adding text.
- No Python available on this machine (Windows Store stub only). For local preview, use a small Node static file server instead of `python -m http.server`.
- Before treating any change as done: start a local static server, drive the page with Playwright (screenshot + check for `console`/`pageerror`/`requestfailed` events), then commit, push, and `vercel --prod --yes`, and finally `curl` the production URL to confirm HTTP 200. See the `deploy-verify` skill for the exact sequence.
- Sourcing images: only use confirmed free-license stock photos (e.g. Unsplash "Free", not "Unsplash+ Premium" — verify licensing before downloading, since premium thumbnails are visually indistinguishable from free ones).
- Scroll-based header theming (`updateHeaderTheme` in `js/main.js`) uses `document.elementFromPoint()` at the header's bottom edge rather than IntersectionObserver — keep that pattern if extending it, don't mix in a second scrollspy mechanism.
