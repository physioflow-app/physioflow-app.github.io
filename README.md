# PhysioFlow

**AI-powered physical therapy, accessible to everyone.**

**Try it now: [physioflow-app.github.io](https://physioflow-app.github.io/)**

---

Physical therapy is expensive ($50-150/session), waitlists are long, and most people with everyday pain — stiff necks from desk work, sore knees from running, tight hips from sitting — never seek help. They either ignore it or scroll through random YouTube videos hoping something works.

**PhysioFlow** lets you describe your pain in plain language, and generates a personalized, multi-week exercise program in seconds. It explains *why* your issue developed (muscle imbalances, postural habits, overuse) and *how* the exercises will fix it — so you understand your body, not just follow instructions blindly.

### What makes it different

- **No sign-up, no cost, no backend** — runs entirely in your browser with progress saved locally
- **Educational, not just prescriptive** — explains the root cause and the therapeutic reasoning behind each exercise
- **Progressive programs** — 3-4 weeks that build from gentle mobility to strengthening, like a real PT would design
- **Video demonstrations** — matching exercise videos are included when available, primarily from Bob & Brad
- **AI-driven personalization** — powered by Gemini, tailored to what you describe plus optional pain level, equipment, time, and fitness level
- **Safety first** — red-flag symptoms (numbness, bladder/bowel changes, trauma, fever, chest pain…) are flagged with advice to see a clinician before any program is generated
- **Real progress tracking** — log each session and your pain; see streaks and your pain trend, and move to the next week when you hit your session goal
- **Ready-made programs** — 15 four-week programs you can start right away, no AI needed
- **Yours to keep** — share a program by link, or export and import a backup of everything

### Who it's for

Anyone dealing with everyday musculoskeletal pain who wants a structured plan — not a replacement for a doctor, but a smart first step before (or between) professional visits.

---

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — Styling
- **Gemini API** — AI program generation (via Cloudflare Worker proxy)
- **LocalStorage** — Progress persistence, no backend needed
- **GitHub Pages** — Hosting

## Getting Started

### Prerequisites

- Node.js 22.12+ (22, 24, or 26+)
- npm

### Installation

```bash
git clone https://github.com/physioflow-app/physioflow-app.github.io.git
cd physioflow-app.github.io
npm install
npm run dev
```

### Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm test` — Run tests
- `npm run deploy` — Build and deploy to GitHub Pages

## AI service and deployment

Generation uses the existing `pt-gemini-proxy` Cloudflare Worker; API keys stay in its secret bindings. A hardened reference version (origin allowlist, per-IP rate limiting, request allowlist) is in [`worker/`](worker/README.md). Its CORS allowlist includes `https://physioflow-app.github.io` and the original `https://itzsid.github.io` origin. Set `VITE_GEMINI_PROXY_URL` to override the endpoint. The Vite development server proxies `/api/gemini` to the Worker.

The organization site publishes the built `dist` directory from the `gh-pages` branch. Source checks run on `main` and pull requests. The scoped minimatch override keeps the linter dependency on the patched version until typescript-eslint updates its dependency range.

## Search indexing

The production build prerenders the homepage and each ready-made program page (`/program/:id`) into HTML with its own title, description, canonical URL, and social metadata, and generates `sitemap.xml`/`sitemap.txt` from the same route list. Personal programs (`/plan/:id`) are served by the `404.html` app shell with `noindex`, and saved programs and progress never appear in generated HTML.

To request Google indexing, verify the URL-prefix property `https://physioflow-app.github.io/` in Google Search Console, submit `https://physioflow-app.github.io/sitemap.xml`, and request indexing for the homepage through URL Inspection. If using Google's HTML-file verification, place the supplied file in `public/` and redeploy. Submission does not guarantee indexing.

## Usage

1. Open [PhysioFlow](https://physioflow-app.github.io/)
2. Describe your pain, stiffness, or mobility issue (or pick a ready-made program)
3. Get a personalized multi-week program with explanations — saved automatically, with its own link
4. Watch video demonstrations for each exercise
5. Log each session and your pain level; export a backup to keep your data safe

## Disclaimer

This application is for educational purposes only. Always consult with a healthcare professional or licensed physical therapist before starting any exercise program, especially if you have existing injuries or medical conditions.

## License

MIT
