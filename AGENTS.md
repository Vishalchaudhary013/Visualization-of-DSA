# Fusion Starter

An interactive DSA (data structures & algorithms) visualizer: a React SPA with an integrated Express server, React Router, JavaScript, Vitest and modern tooling.

While the starter comes with a express server, only create endpoint when strictly neccesary, for example to encapsulate logic that must leave in the server, such as private keys handling, or certain DB operations, db...

## Tech Stack

- **npm**: Package manager (use `package-lock.json`)
- **Frontend**: React 19 + React Router 7 (spa) + JavaScript + Vite 8 (`@vitejs/plugin-react`) + Tailwind CSS 4.3 (CSS-first config via `@tailwindcss/vite`, no `tailwind.config.js`) + Motion (`motion/react`) + next-themes
- **Backend**: Node + Express server; in development it serves the app through Vite middleware
- **Testing**: Vitest
- **UI**: Radix UI + TailwindCSS + react-icons (Lucide set, `react-icons/lu`)

## Project Structure

```
client/                          # React SPA frontend (Vite root)
├── index.html                   # HTML entry
├── App.jsx                      # Providers (theme, tooltips, toasts) + routes (Visualizer is lazy-loaded)
├── vite.config.js               # Vite config (React + Tailwind plugins, aliases, build → ../dist/spa)
├── public/                      # Static files copied as-is to the site root (robots.txt)
└── features/
    ├── global.css               # Tailwind v4 config: tokens, @theme, @custom-variant dark, @utility
    ├── common/                  # Shared across features
    │   ├── components/ui/       # Radix-based UI primitives (only the ones in use)
    │   ├── components/layout/   # Header, ThemeToggle, ScrollToTop
    │   └── pages/NotFound.jsx
    ├── home/                    # Landing page
    │   ├── pages/Index.jsx
    │   └── components/          # HeroPreview (looping demo), AlgorithmCatalog (search + filter)
    ├── assistant/components/    # AssistantChat (floating Q&A, calls POST /api/assistant)
    └── visualizer/
        ├── pages/Visualizer.jsx
        ├── algorithms/          # Step generators (sorting, searching, graph), recorder, registry (index.js), tests
        ├── components/
        │   ├── inputs/          # AlgorithmPicker, ArrayInputs, GraphInputs
        │   ├── controls/        # PlaybackControls
        │   ├── canvas/          # ArrayVisualizer (boxes/bars), GraphVisualizer (draggable SVG)
        │   └── panels/          # Pseudocode, StepLog, OperationStats, math panels, AlgorithmInfoPanel
        ├── hooks/               # usePlayback, useKeyboardShortcuts, useVisualizerState (URL-synced)
        └── utils/inputs.js      # Presets, parsing/validation, URL params (+ tests)

server/                          # Express backend
├── start.js                     # Entry point: app.listen + dev (Vite middleware) or prod (serves dist/spa)
├── app.js                       # createServer(): Express middleware + mounts /api
├── routes/                      # Route definitions only (URL -> controller)
│   ├── index.js                 # Combines all route files under /api
│   ├── assistant.routes.js      # POST /api/assistant
│   └── system.routes.js         # GET /api/ping
├── controllers/                 # Request handling + logic
│   ├── assistant.controller.js
│   └── system.controller.js
└── utils/                       # Reusable helpers (fuzzyMatch.js)

shared/                          # Code used by both client & server
└── algorithms.js                # Algorithm metadata (pseudocode lines are referenced by step generators)
```

### Adding an algorithm

1. Add its metadata (incl. `pseudoCode`, `howItWorks`, `useCases`) to `shared/algorithms.js`.
2. Write a step generator in `client/features/visualizer/algorithms/` (use `createRecorder` for arrays) and set each step's `line` to the pseudocode line index.
3. Register it in `client/features/visualizer/algorithms/index.js`. The picker, home catalog and tests pick it up automatically.

Components are written as regular JSX (`<Button className="...">`), not compiled `_jsx(...)` calls.

## Key Features

## SPA Routing System

The routing system is powered by React Router:

- `client/features/home/pages/Index.jsx` represents the home page.
- Routes are defined in `client/App.jsx` using the `react-router-dom` import
- Page components live in `client/features/<feature>/pages/`

For example, routes can be defined with:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

### Styling System

- **Primary**: TailwindCSS utility classes
- **Theme and design tokens**: Configure in `client/features/global.css`
- **UI components**: Pre-built library in `client/features/common/components/ui/`
- **Icons**: `import { LuPlay as Play } from "react-icons/lu"`
- **Class names**: plain strings / template literals (no `cn`, `clsx`, `tailwind-merge` or `cva`)
- **Variants**: small functions with a lookup object per prop, e.g. `buttonVariants({ variant, size, className })`

```jsx
// Component: defaults first, caller classes appended
className={`rounded-md px-4 ${isActive ? "bg-primary" : "bg-muted"} ${className ?? ""}`}

// Caller: classes are appended, not merged, so to override a default that sets the
// same property, mark the override important with a trailing "!"
<Button size="lg" className="px-6!" />
```

### Express Server Integration

- **Development**: Single port (8080, or `PORT`) for frontend, backend and hot-reload websocket
- **Hot reload**: Vite HMR for client code; the server restarts on changes in `server/` and `shared/`
- **API endpoints**: Prefixed with `/api/`
- **Database / models**: None needed currently (algorithm data is static in `shared/algorithms.js`). If one is added (e.g. MongoDB with Mongoose), put schemas in `server/models/`, keep the connection string in `.env`, and use models only from controllers

#### API Routes
- `POST /api/assistant` - Algorithm Q&A used by the assistant chat (`{ question, algorithmId? }`)
- `GET /api/ping` - Health check

Path aliases (client):
- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
npm run dev     # Start Express + Vite dev server on port 8080
npm run build   # Build the client into dist/spa
npm start       # Start production server (serves dist/spa + API)
npm test        # Run Vitest tests (*.test.js under client/)
```

## Adding Features

### Add new colors to the theme

Tailwind 4 is configured in CSS only. In `client/features/global.css`, add the raw HSL value to `:root` (and `.dark`), then map it in `@theme inline` as `--color-<name>: hsl(var(--<name>));`. The `bg-<name>`, `text-<name>`, etc. utilities then exist automatically.

### React 19 notes

- Components receive `ref` as a normal prop; don't use `forwardRef` in new code.
- Animations use Motion: `import { motion } from "motion/react"`.

### New API Route
Logic goes in a controller; route files only map URLs to controller functions.
Server files run directly in Node, so always include the `.js` extension in imports.

1. Create a controller in `server/controllers/my.controller.js`:
```js
export const getMessage = (req, res) => {
  res.json({ message: "Hello from my endpoint!" });
};
```

2. Create a route file `server/routes/my.routes.js` (definitions only):
```js
import { Router } from "express";
import { getMessage } from "../controllers/my.controller.js";

const router = Router();

router.get("/", getMessage);

export default router;
```

3. Mount it in `server/routes/index.js`:
```js
import myRoutes from "./my.routes.js";

router.use("/my-endpoint", myRoutes); // -> GET /api/my-endpoint
```

4. Use in React components:
```js
const response = await fetch("/api/my-endpoint");
const data = await response.json();
```

### New Page Route
1. Create component in `client/features/<feature>/pages/MyPage.jsx`
2. Add route in `client/App.jsx`:
```jsx
<Route path="/my-page" element={<MyPage />} />
```

## Production Deployment

- Run `npm run build`, then `npm start` on any Node host (Render, Railway, a VPS…). Set `PORT` if the host requires it.

## Architecture Notes

- Single-port Node + Express server with Vite integration
- JavaScript throughout (client, server, shared)
- Comprehensive UI component library included
