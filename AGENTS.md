# Fusion Starter

An interactive DSA (data structures & algorithms) visualizer: a React SPA with an integrated Express server, user accounts and saved history (MongoDB), React Router, JavaScript, Vitest and modern tooling.

While the starter comes with a express server, only create endpoint when strictly neccesary, for example to encapsulate logic that must leave in the server, such as private keys handling, or certain DB operations, db...

## Tech Stack

- **npm**: Package manager (use `package-lock.json`)
- **Frontend**: React 19 + React Router 7 (spa) + JavaScript + Vite 8 (`@vitejs/plugin-react`) + Tailwind CSS 4.3 (CSS-first config via `@tailwindcss/vite`, no `tailwind.config.js`) + Motion (`motion/react`) + next-themes
- **Backend**: Node + Express 5; in development it serves the app through Vite middleware
- **Database**: MongoDB via Mongoose (users + history). Optional: without `MONGODB_URI` the app runs and only accounts/history are disabled (their routes return 503)
- **Auth**: email + password (bcryptjs), JWT in an httpOnly `dsa_session` cookie, zod request validation, express-rate-limit on credential routes (only failed attempts count; unknown emails take the same time as wrong passwords)
- **Testing**: Vitest
- **UI**: Radix UI + TailwindCSS + react-icons (Lucide set, `react-icons/lu`)

## Project Structure

```
client/                          # React SPA frontend (Vite root)
├── index.html                   # HTML entry
├── App.jsx                      # Providers (theme, tooltips, toasts) + routes (Visualizer is lazy-loaded)
├── vite.config.js               # Vite config (React + Tailwind plugins, aliases, build → ../dist/spa)
├── public/                      # Static files copied as-is: favicon.ico/.svg, icons, site.webmanifest, og-image.jpg
└── features/
    ├── global.css               # Tailwind v4 config: tokens, @theme, @custom-variant dark, @utility
    ├── common/                  # Shared across features
    │   ├── components/ui/       # Radix-based UI primitives (only the ones in use)
    │   ├── components/layout/   # Header, Logo (brand mark + wordmark; same drawing as public/favicon.svg), ThemeToggle, ScrollToTop
    │   ├── components/playback/ # PlaybackControls, PseudocodePanel, StepLog (visualizer + data structures)
    │   ├── hooks/               # usePlayback, useKeyboardShortcuts
    │   ├── seo/SeoManager.jsx   # Updates <head> (title, canonical, OG, JSON-LD) on client-side navigation
    │   ├── lib/api.js           # fetch wrapper for /api (JSON, cookies, ApiError)
    │   └── pages/NotFound.jsx
    ├── home/                    # Landing page
    │   ├── pages/Index.jsx
    │   └── components/          # HeroPreview (looping demo), AlgorithmCatalog (search + filter)
    ├── assistant/components/    # AssistantChat (floating Q&A, calls POST /api/assistant)
    ├── auth/                    # AuthContext (useAuth), Login/Register/Profile pages, RequireAuth, UserMenu, AccountSettings
    ├── history/                 # API calls, useHistorySync (auto-saves runs), HistoryList, SaveStatus
    ├── compare/                 # /compare: two algorithms on one input (CompareLane), RaceChart of all sorts/searches
    ├── patterns/                # /patterns roadmap + /patterns/:id (template, practice list, LeetCode-style problem)
    │   ├── problems/            # Step generators for problems (arrays, graphs, dp) + registry (index.js) + tests
    │   ├── utils/problemInput.js # Parses LeetCode-format inputs ("[2,7,11,15]", "\"abc\""), URL params
    │   └── components/          # PatternsMenu (header dropdown), ProblemWorkbench, ProblemInputs, ArrayProblemView,
    │                            #   SolutionPanel (language dropdown: JavaScript / Python / Java / C++)
    ├── data-structures/
    │   ├── pages/               # DataStructuresIndex, DataStructurePage (/data-structures/:id)
    │   ├── engines/             # Stack, queue, heap, linked list, BST, hash table, trie, union-find -> steps (+ tests)
    │   ├── utils/values.js      # Parses the value box (numbers, words, pairs) and ?values= (+ tests)
    │   └── components/views/    # LinearViews (stack/queue/list), TreeViews (heap/BST/trie/union-find), HashTableView
    └── visualizer/
        ├── pages/Visualizer.jsx
        ├── algorithms/          # Step generators (sorting, searching, graph, pathfinding, dynamicProgramming), recorder, registry (index.js), tests
        ├── components/
        │   ├── inputs/          # AlgorithmPicker, ArrayInputs, GraphInputs, GridInputs (walls/maze), DpInputs
        │   ├── canvas/          # ArrayVisualizer (boxes/bars), GraphVisualizer (draggable SVG), GridVisualizer (paint walls, drag start/goal), DpTableVisualizer
        │   └── panels/          # OperationStats, math panels, AlgorithmInfoPanel
        ├── hooks/               # useVisualizerState (URL-synced)
        └── utils/               # inputs.js: presets, parsing/validation (edges: "0-1"), URL params;
                                 #   grid.js: grid size, maze/random generators, cell encoding for the URL (+ tests)

server/                          # Express backend
├── start.js                     # Entry point: connects MongoDB, app.listen, dev (Vite middleware) or prod (dist/spa);
│                                #   every page is index.html rendered with its SEO tags and HTTP status (seo/html.js)
├── app.js                       # createServer(): gzip, JSON, cookies, helmet + X-Robots-Tag on /api, trailing-slash 301s,
│                                #   /robots.txt and /sitemap.xml, error handler
├── seo/                         # html.js (head tags + no-JS fallback into index.html), sitemap.js (urlset / sitemap index)
├── config/db.js                 # connectDb(), isDbConnected()
├── config/site.js               # siteOrigin(req): SITE_URL, or the request's origin in development
├── models/                      # Mongoose schemas: User, HistoryEntry
├── routes/                      # Route definitions only (URL -> middleware -> controller)
│   ├── index.js                 # Combines all route files under /api (+ JSON 404)
│   ├── assistant.routes.js      # POST /api/assistant
│   ├── auth.routes.js           # /api/auth/*
│   ├── history.routes.js        # /api/history/*
│   ├── seo.routes.js            # GET /robots.txt, /sitemap.xml (+ /sitemap-N.xml when split)
│   └── system.routes.js         # GET /api/ping
├── controllers/                 # Request handling + logic (assistant, auth, history, system)
├── middleware/                  # requireDb, requireAuth, validateBody(zod schema)
├── validation/schemas.js        # zod schemas for every request body
├── utils/                       # fuzzyMatch.js, session.js (JWT cookie helpers)
└── tests/                       # Unit tests + API integration tests (supertest + MongoDB)

shared/                          # Code used by both client & server
├── algorithms.js                # Algorithm metadata (pseudocode lines are referenced by step generators)
├── dataStructures.js            # Data structure metadata + per-operation pseudocode
├── patterns.js                  # Patterns grouped in roadmap order (summary, signals, template, practice, links)
├── problems.js                  # LeetCode-style problems: statement, fields + limits, examples, JS solution code
├── solutions.js                 # The same solutions in Python, Java and C++, with a line map to the JS code
└── seo.js                       # resolveSeo(path, query): title, description, canonical, robots, breadcrumbs, JSON-LD
                                 #   for every route; seoTags() -> head tags; sitemapPaths() -> indexable URLs
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
- **Environment**: `MONGODB_URI` (accounts/history), `JWT_SECRET` (required in production; dev uses a random per-process secret), `SITE_URL` (production URL for canonical/social/sitemap URLs), optional `PORT`

#### API Routes
- `POST /api/assistant` - Q&A used by the assistant chat (`{ question, algorithmId? }`, id of the algorithm or data structure on screen)
- `POST /api/auth/register` `{ name, email, password }`, `POST /api/auth/login` `{ email, password }`, `POST /api/auth/logout`
- `GET /api/auth/me` (`{ user }`, or `{ user: null }` for guests), `PATCH /api/auth/me` `{ name }`, `PUT /api/auth/password` `{ currentPassword, newPassword }`, `DELETE /api/auth/me` `{ password }`
- `GET /api/history?page&limit&kind&itemId`, `GET /api/history/stats`, `POST /api/history`, `PATCH /api/history/:id`, `DELETE /api/history/:id`, `DELETE /api/history` (all require a session). `kind` is `algorithm`, `data-structure` or `problem`
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
                #   MONGODB_TEST_URI or mongodb-memory-server, and are skipped when neither is available.
                #   With Docker: docker run -d -p 27017:27017 mongo:8
                #   then MONGODB_TEST_URI=mongodb://127.0.0.1:27017 npm test
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

### Adding a pattern problem

1. Add the problem to `shared/problems.js`: `fields` (types `int`, `int[]`, `int[][]` with `tuple`, `string`, with limits), `examples`, `view` (`array`, `graph` or `table`) and the JavaScript solution in `code`.
2. Write a step generator in `client/features/patterns/problems/` whose steps set `line` to a line of that `code`, and register it (plus any extra input `check`) in `problems/index.js`.
3. Add Python, Java and C++ versions to `shared/solutions.js` (LeetCode style, a `Solution` class with the same method name). `lines[i]` is the line of that language matching line `i` of the JavaScript code, so the highlight follows the animation.
4. List its id in the pattern's `problems` in `shared/patterns.js`. The tests run the shown JavaScript and compare its result with the animation's output; when `python3`, `javac` and `g++` are installed they also compile and run the other languages on the same inputs.

### Adding a data structure

1. Add metadata to `shared/dataStructures.js`: operations with `pseudoCode`, `complexity`, `needsValue`, optional `arity: 2`; set `valueKind: "word"` if values are words.
2. Write an engine in `client/features/data-structures/engines/` exposing `empty`, `fromValues`, `toValues`, `operations` (and optionally `randomValues`); register it in `engines/index.js`.
3. Add a view to `VIEWS` (and starter values) in `pages/DataStructurePage.jsx`. The shared engine tests check pseudocode lines automatically.

### New Page Route
1. Create component in `client/features/<feature>/pages/MyPage.jsx`
2. Add route in `client/App.jsx`:
```jsx
<Route path="/my-page" element={<MyPage />} />
```
3. Add the route to `resolvePage` in `shared/seo.js` (title, description, canonical path, breadcrumbs, JSON-LD; `robots: "noindex, follow"` for private pages). Unknown routes resolve to a 404, so a page missing there is served with status 404. Add public pages to `sitemapPaths()`; the SEO tests check that every sitemap URL is a 200, indexable and its own canonical.

### SEO
- The server renders `client/index.html` for every page with the tags from `shared/seo.js` in place of `<!-- seo:head -->`, the right status (404 for unknown routes and ids) and a `<noscript>` fallback (heading, description, links). `SeoManager` updates the same tags (marked `data-seo`) on client-side navigation.
- Content comes from `shared/*.js`, so `sitemap.xml` is built once per process and changes with a deploy. It has no `lastmod` (no reliable per-page date) and switches to a sitemap index above 50,000 URLs.
- `robots.txt` only disallows `/api/`; private pages use `noindex` so crawlers can still read it.

## Production Deployment

- Run `npm run build`, then `npm start` on any Node host (Render, Railway, a VPS…). Set `PORT` if the host requires it.

## Architecture Notes

- Single-port Node + Express server with Vite integration
- JavaScript throughout (client, server, shared)
- Comprehensive UI component library included
