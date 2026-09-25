# Fusion Starter

A production-ready full-stack React application template with integrated Express server, featuring React Router SPA mode, JavaScript, Vitest, Zod and modern tooling.

While the starter comes with a express server, only create endpoint when strictly neccesary, for example to encapsulate logic that must leave in the server, such as private keys handling, or certain DB operations, db...

## Tech Stack

- **npm**: Package manager (use `package-lock.json`)
- **Frontend**: React 18 + React Router (spa) + JavaScript + Vite + TailwindCSS 4 (with `tailwind.config.js` loaded via `@config`)
- **Backend**: Node + Express server; in development it serves the app through Vite middleware
- **Testing**: Vitest
- **UI**: Radix UI + TailwindCSS + react-icons (Lucide set, `react-icons/lu`)

## Project Structure

```
client/                          # React SPA frontend (Vite root)
├── index.html                   # HTML entry
├── App.jsx                      # App entry point and SPA routing setup
├── vite.config.js               # Vite config (aliases, build → ../dist/spa)
├── tailwind.config.js           # Tailwind theme (loaded by global.css via @config)
├── postcss.config.js
├── public/                      # Static files copied as-is to the site root (robots.txt)
└── features/
    ├── global.css               # Tailwind import + theme tokens and global styles
    ├── common/                  # Shared UI library, hooks, NotFound page
    ├── home/pages/Index.jsx     # Home page
    └── visualizer/              # Visualizer page, components, hooks, algorithm steps

server/                          # Express backend
├── start.js                     # Entry point: app.listen + dev (Vite middleware) or prod (serves dist/spa)
├── app.js                       # createServer(): Express middleware + mounts /api
├── routes/                      # Route definitions only (URL -> controller)
│   ├── index.js                 # Combines all route files under /api
│   ├── assistant.routes.js      # POST /api/assistant
│   └── system.routes.js         # GET /api/ping, GET /api/demo
├── controllers/                 # Request handling + logic
│   ├── assistant.controller.js
│   └── system.controller.js
└── utils/                       # Reusable helpers (fuzzyMatch.js)

shared/                          # Code used by both client & server
└── algorithms.js                # Algorithm metadata

docs/                            # Migration notes
```

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
- `POST /api/assistant` - Algorithm Q&A used by the assistant chat
- `GET /api/ping` - Simple ping api
- `GET /api/demo` - Demo endpoint

Path aliases (client):
- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
npm run dev     # Start Express + Vite dev server on port 8080
npm run build   # Build the client into dist/spa
npm start       # Start production server (serves dist/spa + API)
npm test        # Run Vitest tests (*.spec.js / *.test.js under client/; none yet)
```

## Adding Features

### Add new colors to the theme

Open `client/features/global.css` and `client/tailwind.config.js` and add new tailwind colors.

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
