# Claude Session Context - Physical Therapy App

## Project Overview
An interactive physical therapy website where users can:
- View human anatomy (front and back views)
- Click on body parts to select areas for physical therapy
- Get multi-week stretching and strengthening programs
- Watch exercise video demonstrations (Bob & Brad PT videos)
- Track progress with LocalStorage persistence

## Live URLs
- **Production**: https://physioflow-app.github.io/
- **GitHub Repo**: https://github.com/physioflow-app/physioflow-app.github.io
- **Main Site**: https://itzsid.github.io/ (has link in Side Projects section)

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Storage**: LocalStorage (no backend)
- **Deployment**: GitHub Pages via gh-pages package

## Key Commands
```bash
# Development
npm run dev          # Start dev server at http://localhost:5173/

# Testing
npm test             # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Build & Deploy
npm run build        # Build for production
npm run deploy       # Build and deploy to GitHub Pages
```

## Project Structure
```
physical_therapy/
├── src/
│   ├── components/
│   │   ├── AnatomyView/
│   │   │   ├── AnatomyView.tsx      # Main anatomy component
│   │   │   ├── BodyPartSvg.tsx      # SVG body with clickable regions
│   │   │   └── BodyPartSelector.tsx # Front/back toggle
│   │   ├── Program/
│   │   │   ├── ProgramView.tsx      # Display exercise program
│   │   │   ├── ExerciseCard.tsx     # Individual exercise display
│   │   │   ├── WeekView.tsx         # Weekly breakdown
│   │   │   └── VideoPlayer.tsx      # YouTube embed component
│   │   ├── Progress/
│   │   │   ├── ProgressTracker.tsx  # Track completed exercises
│   │   │   └── ProgressBar.tsx      # Visual progress indicator
│   │   └── common/
│   │       ├── Button.tsx
│   │       └── Loading.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts       # LocalStorage hook
│   │   ├── useProgress.ts           # Progress tracking logic
│   │   └── useProgram.ts            # Program selection logic
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── data/
│   │   ├── bodyParts.ts             # Body part definitions
│   │   └── exercises/               # Pre-defined exercise programs
│   │       ├── neck.ts
│   │       ├── shoulders.ts
│   │       ├── lowerBack.ts
│   │       ├── hips.ts
│   │       ├── knees.ts
│   │       ├── ankles.ts
│   │       └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── components/
│   ├── hooks/
│   └── setup.ts
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Key TypeScript Interfaces
```typescript
interface BodyPart {
  id: string;
  name: string;
  region: 'front' | 'back';
  description: string;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  sets?: number;
  reps?: number;
  duration?: string;
  videoUrl: string;  // YouTube embed URL
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetArea: string;
}

interface WeekProgram {
  week: number;
  focus: string;
  exercises: Exercise[];
}

interface Program {
  id: string;
  bodyPart: string;
  bodyPartId: string;
  title: string;
  description: string;
  duration: number;  // weeks
  weeks: WeekProgram[];
}

interface Progress {
  programId: string;
  completedExercises: Record<string, boolean>;
  currentWeek: number;
  startedAt: string;
  lastUpdated: string;
}
```

## Adding New Body Parts/Programs
1. Add body part definition in `src/data/bodyParts.ts`
2. Create exercise program in `src/data/exercises/[bodypart].ts`
3. Export from `src/data/exercises/index.ts`
4. Add clickable region in `src/components/AnatomyView/BodyPartSvg.tsx`

## Video URLs
All exercise videos use verified Bob & Brad physical therapy YouTube videos:
- Format: `https://www.youtube.com/embed/[VIDEO_ID]`
- Channel: "Bob & Brad" - licensed physical therapists

## Common Tasks

### Add a new exercise to existing program
Edit the relevant file in `src/data/exercises/`:
```typescript
{
  id: 'unique-id',
  name: 'Exercise Name',
  description: 'Brief description',
  instructions: ['Step 1', 'Step 2', ...],
  sets: 3,
  reps: 10,  // OR duration: '30 seconds'
  videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
  difficulty: 'beginner',
  targetArea: 'Target muscle/area'
}
```

### Update styling
- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Component-specific: inline Tailwind classes

### Run after making changes
```bash
npm test           # Verify tests pass
npm run build      # Verify build succeeds
npm run deploy     # Deploy to production
```

## Testing
- Tests cover hooks, components, complete application flows, AI response validation, and catalog integrity
- Run `npm test` to verify all pass
- Tests located in `tests/` directory

## Notes
- Base path configured for the organization GitHub Pages site: `/`
- Repository was made public for GitHub Pages hosting
- Progress data persists in browser LocalStorage
