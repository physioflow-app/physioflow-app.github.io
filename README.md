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
- **AI-driven personalization** — powered by Gemini, tailored to exactly what you describe

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

Generation uses the existing `pt-gemini-proxy` Cloudflare Worker; API keys stay in its secret bindings. Its CORS allowlist includes `https://physioflow-app.github.io` and the original `https://itzsid.github.io` origin. Set `VITE_GEMINI_PROXY_URL` to override the endpoint. The Vite development server proxies `/api/gemini` to the Worker.

The organization site publishes the built `dist` directory from the `gh-pages` branch. Source checks run on `main` and pull requests. The scoped minimatch override keeps the linter dependency on the patched version until typescript-eslint updates its dependency range.

## Usage

1. Open [PhysioFlow](https://physioflow-app.github.io/)
2. Describe your pain, stiffness, or mobility issue
3. Get a personalized multi-week program with explanations
4. Watch video demonstrations for each exercise
5. Track your progress — saved automatically in your browser

## Disclaimer

This application is for educational purposes only. Always consult with a healthcare professional or licensed physical therapist before starting any exercise program, especially if you have existing injuries or medical conditions.

## License

MIT
