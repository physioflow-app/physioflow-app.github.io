# Claude Session Context - PhysioFlow

## Project Overview
PhysioFlow is a free, browser-only physical therapy app. Users can:
- Describe a pain or mobility issue (plus optional pain level, equipment, time, fitness level) and get an AI-generated, multi-week program (Gemini via a Cloudflare Worker)
- Browse 15 ready-made programs, each with its own crawlable URL (`/program/:bodyPartId`)
- Log daily sessions and pain, see streaks and a pain trend; weeks advance once the weekly session target is met
- Share a program by link, and export/import a backup of programs and progress
- Watch exercise videos (Bob & Brad PT), or search YouTube when no verified video matches

Red-flag symptoms (numbness, bladder/bowel changes, trauma, fever, chest pain, etc.) are screened in the browser (`src/lib/safety.ts`) and by the model (it returns `{"redFlag": true, "reason": ...}`) before a program is generated.

## Live URLs
- **Production**: https://physioflow-app.github.io/
- **GitHub Repo**: https://github.com/physioflow-app/physioflow-app.github.io
- **Main Site**: https://itzsid.github.io/ (has link in Side Projects section)
- The old site (https://itzsid.github.io/physical-therapy/) redirects here.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite, React Router (`BrowserRouter`)
- **Styling**: inline styles using shared tokens from `src/theme` (also fed into `tailwind.config.js`), Tailwind for utilities
- **Testing**: Vitest + React Testing Library
- **Storage**: LocalStorage (no backend)
- **Deployment**: GitHub Pages (`gh-pages` branch) via the gh-pages package

## Key Commands
```bash
npm run dev           # Dev server at http://localhost:5173/
npm test              # Tests in watch mode (npm test -- --run for one pass)
npm run lint
npm run build         # Type-check, build, prerender pages + sitemap
npm run deploy        # Build and deploy to GitHub Pages
```

## Project Structure
```
src/
├── App.tsx / AppShell.tsx / main.tsx / entry-server.tsx   # Router, layout, client + prerender entries
├── seo.ts                     # Per-route title/description/canonical, indexable routes
├── theme/                     # Brand colour tokens (tokens.json) + fonts
├── pages/                     # HomePage, ProgramPage (/program/:id), PlanPage (/plan/:id), SharedPage (/shared#p=...), MessagePage
├── components/
│   ├── AIProgram/             # AIInputForm, SafetyCheck, GeneratingIndicator, AIProgramHistory (list + backup)
│   ├── Program/               # ProgramView, WeekView, ExerciseCard, PainTracker, ProgramLibrary, VideoPlayer
│   └── common/styles.ts       # Shared button/card styles
├── hooks/
│   ├── useLocalStorage.ts     # Shared, cross-component localStorage store
│   ├── useProgress.ts         # Sessions, pain, weeks
│   ├── useAIPrograms.ts       # Saved AI programs
│   ├── useProgramGenerator.ts # Gemini request with retries/timeouts
│   └── usePageMeta.ts         # Client-side title/description/canonical
├── lib/
│   ├── promptBuilder.ts       # System prompt (catalog derived from data), intake details
│   ├── programParser.ts       # Validates model JSON
│   ├── exerciseCatalog.ts     # Exercises with verified videos
│   ├── videoMatcher.ts        # Exact + unambiguous loose name matching, YouTube search fallback
│   ├── safety.ts              # Red-flag screening, pain thresholds
│   ├── sessions.ts            # Session/streak/trend/week-advance logic
│   ├── share.ts / encoding.ts # Share links (compressed program in the URL fragment)
│   ├── backup.ts              # Export/import
│   └── legacyHash.ts          # Rewrites old /#/... URLs
├── data/                      # bodyParts.ts, exercises/*.ts (15 programs)
└── types/index.ts
scripts/prerender.mjs, scripts/meta.mjs  # Prerender home + program pages, 404.html app shell, sitemap
worker/                       # Reference hardened Cloudflare Worker for the Gemini proxy
tests/                        # components, hooks, integration, lib, seo, worker
```

## Routing on GitHub Pages
- `/` and `/program/:id` are prerendered (`dist/index.html`, `dist/program/<id>.html`), so they are indexable.
- `/plan/:id` and unknown paths are served by `dist/404.html` (the app shell with `noindex`); `/shared` by `dist/shared.html`.
- Old hash URLs (`/#/program/neck`) are rewritten on load.

## Key Data Types
See `src/types/index.ts`. Progress is stored under `pt-progress` as `{ programs: { [programId]: Progress } }`;
each `Progress` has `sessions: SessionLog[]` (`{ date: 'YYYY-MM-DD', week, completed: exerciseId[], pain? }`).
`completedExercises` is kept for backwards compatibility. Saved AI programs are under `pt-ai-programs`.

## Adding New Body Parts/Programs
1. Add the body part in `src/data/bodyParts.ts`
2. Create the program in `src/data/exercises/[bodypart].ts`
3. Register it in `src/data/exercises/index.ts`
It then appears in the library, the sitemap, the prerendered pages, and the AI exercise catalog automatically.

## Video URLs
Verified Bob & Brad videos, format `https://www.youtube.com/embed/[VIDEO_ID]`. Exercises without one get a "Find a Video" YouTube search link.

## Run after making changes
```bash
npm test -- --run
npm run lint
npm run build
```

## Notes
- Base path: `/` (organization GitHub Pages site)
- Progress data persists in browser LocalStorage only; users can export a backup
