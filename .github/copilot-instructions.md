# Copilot Instructions for AccessManagement2.0 Frontend

## Project Overview
- This is a React 19 + Vite + Tailwind CSS SPA for access management workflows.
- Main entry: `src/main.jsx` renders `App` inside React StrictMode.
- Routing is managed via `react-router-dom` (v7), with `BrowserRouter` at the top level.
- Navigation is handled by `src/components/NavBar.jsx`, which uses `NavLink` for route highlighting.
- Page components live in `src/pages/` (e.g., `Home.jsx`, `Login.jsx`, `Layout.jsx`).
- `Layout.jsx` wraps pages with shared UI (currently just `NavBar`).

## Architecture & Patterns
- All routes are defined in `App.jsx` using `<Routes>` and `<Route>`. Example:
  ```jsx
  <Routes>
    <Route path='/' element={<Login/>}/>
  </Routes>
  ```
- Navigation links in `NavBar.jsx` reference key routes: `/`, `/dashboard`, `/new-request`, `/admin`.
- Use functional components and React hooks (see `useState` in `App.jsx`).
- Tailwind CSS is used for styling; utility classes are applied directly in JSX.
- No global state management (Redux, Context) is present yet.

## Developer Workflows
- **Start dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`
- **Lint code:** `npm run lint` (uses ESLint with custom config in `eslint.config.js`)
- No test scripts or test files are present.

## Conventions & Custom Rules
- ESLint ignores `dist/` and enforces no unused vars unless they start with a capital letter or underscore.
- All source files are in `src/`; assets in `src/assets/`.
- Use `@vitejs/plugin-react` and `@tailwindcss/vite` (see `vite.config.js`).
- Prefer named exports for components.
- Route definitions and navigation should be updated together for consistency.

## Integration Points
- External dependencies: `react`, `react-dom`, `react-router-dom`, `tailwindcss`.
- No API/service layer or backend integration is present in the frontend codebase.
- For new pages, add to `src/pages/` and update both `NavBar.jsx` and `App.jsx` routes.

## Examples
- To add a new route:
  1. Create a component in `src/pages/`.
  2. Add a `<Route>` in `App.jsx`.
  3. Add a `<NavLink>` in `NavBar.jsx`.

---

If any section is unclear or missing, please provide feedback to improve these instructions.