# Fusion Starter

An interactive DSA (data structures & algorithms) visualizer: a React SPA with an integrated Express server, user accounts and saved history (MongoDB), React Router, JavaScript, Vitest and modern tooling.

While the starter comes with a express server, only create endpoint when strictly neccesary, for example to encapsulate logic that must leave in the server, such as private keys handling, or certain DB operations, db...

## Tech Stack

- **npm**: Package manager (use `package-lock.json`)
- **Frontend**: React 19 + React Router 7 (spa) + JavaScript + Vite 8 (`@vitejs/plugin-react`) + Tailwind CSS 4.3 (CSS-first config via `@tailwindcss/vite`, no `tailwind.config.js`) + Motion (`motion/react`) + next-themes
- **Backend**: Node + Express 5; in development it serves the app through Vite middleware
- **Database**: MongoDB via Mongoose (users + history). Optional: without `MONGODB_URI` the app runs and only accounts/history are disabled (their routes return 503)
- **Auth**: email + password (bcryptjs), JWT in an httpOnly `dsa_session` cookie, zod request validation, express-rate-limit on credential routes
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
    │   ├── components/playback/ # PlaybackControls, PseudocodePanel, StepLog (visualizer + data structures)
    │   ├── hooks/               # usePlayback, useKeyboardShortcuts
    │   ├── lib/api.js           # fetch wrapper for /api (JSON, cookies, ApiError)
    │   └── pages/NotFound.jsx
    ├── home/                    # Landing page
    │   ├── pages/Index.jsx
    │   └── components/          # HeroPreview (looping demo), AlgorithmCatalog (search + filter)
    ├── assistant/components/    # AssistantChat (floating Q&A, calls POST /api/assistant)
    ├── auth/                    # AuthContext (useAuth), Login/Register/Profile pages, RequireAuth, UserMenu, AccountSettings
    ├── history/                 # API calls, useHistorySync (auto-saves runs), HistoryList, SaveStatus
    ├── data-structures/
    │   ├── pages/               # DataStructuresIndex, DataStructurePage (/data-structures/:id)
    │   ├── engines/             # Stack, queue, heap, linked list, BST operations -> steps (+ tests)
    │   └── components/views/    # LinearViews (stack/queue/list), TreeViews (heap/BST)
    └── visualizer/
        ├── pages/Visualizer.jsx
        ├── algorithms/          # Step generators (sorting, searching, graph), recorder, registry (index.js), tests
        ├── components/
        │   ├── inputs/          # AlgorithmPicker, ArrayInputs, GraphInputs
        │   ├── canvas/          # ArrayVisualizer (boxes/bars), GraphVisualizer (draggable SVG)
        │   └── panels/          # OperationStats, math panels, AlgorithmInfoPanel
        ├── hooks/               # useVisualizerState (URL-synced)
        └── utils/inputs.js      # Presets, parsing/validation, URL params (+ tests)

server/                          # Express backend
├── start.js                     # Entry point: connects MongoDB, app.listen, dev (Vite middleware) or prod (dist/spa)
├── app.js                       # createServer(): JSON, cookies, helmet on /api, error handler
├── config/db.js                 # connectDb(), isDbConnected()
├── models/                      # Mongoose schemas: User, HistoryEntry
├── routes/                      # Route definitions only (URL -> middleware -> controller)
│   ├── index.js                 # Combines all route files under /api (+ JSON 404)
│   ├── assistant.routes.js      # POST /api/assistant
│   ├── auth.routes.js           # /api/auth/*
│   ├── history.routes.js        # /api/history/*
│   └── system.routes.js         # GET /api/ping
├── controllers/                 # Request handling + logic (assistant, auth, history, system)
├── middleware/                  # requireDb, requireAuth, validateBody(zod schema)
├── validation/schemas.js        # zod schemas for every request body
├── utils/                       # fuzzyMatch.js, session.js (JWT cookie helpers)
└── tests/                       # Unit tests + API integration tests (supertest + MongoDB)

shared/                          # Code used by both client & server
├── algorithms.js                # Algorithm metadata (pseudocode lines are referenced by step generators)
└── dataStructures.js            # Data structure metadata + per-operation pseudocode
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
- **Database / models**: MongoDB with Mongoose. Schemas live in `server/models/`, the connection string in `.env` (`MONGODB_URI`, see `.env.example`), and models are used only from controllers
- **Environment**: `MONGODB_URI` (accounts/history), `JWT_SECRET` (required in production; dev uses a random per-process secret), optional `PORT`

#### API Routes
- `POST /api/assistant` - Q&A used by the assistant chat (`{ question, algorithmId? }`, id of the algorithm or data structure on screen)
- `POST /api/auth/register` `{ name, email, password }`, `POST /api/auth/login` `{ email, password }`, `POST /api/auth/logout`
- `GET /api/auth/me`, `PATCH /api/auth/me` `{ name }`, `PUT /api/auth/password` `{ currentPassword, newPassword }`, `DELETE /api/auth/me` `{ password }`
- `GET /api/history?page&limit&kind&itemId`, `GET /api/history/stats`, `POST /api/history`, `PATCH /api/history/:id`, `DELETE /api/history/:id`, `DELETE /api/history` (all require a session)
- `GET /api/ping` - Health check

Path aliases (client):
- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
npm run dev     # Start Express + Vite dev server on port 8080
npm run build   # Build the client into dist/spa
npm start       # Start production server (serves dist/spa + API)
npm test        # Vitest: client + server projects (vitest.config.js). API integration tests use
                #   MONGODB_TEST_URI or mongodb-memory-server, and are skipped when neither is available
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
