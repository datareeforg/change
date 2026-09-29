# Be The Change deployment

## Current status

The front end is a build-free static application. Vercel can serve it as a preview with no framework build step. Google sign-in and a private Firestore passport work after the Firebase configuration and rules in `docs/firebase-setup.md` are applied. A static deployment does **not** provide the remaining Websim API persistence, admin operations, or connected messaging and payment services.

The root `server.js` exports a Websim and Cloudflare Workers style `fetch(request, env, ctx)` handler. It expects bindings such as `env.DB`, `env.BLOB`, and `env.AI`, plus trusted Websim identity headers. Vercel does not automatically expose that file as `/api/*` functions, and those identity headers are not a valid Vercel authorization mechanism. Do not describe a static preview as a production-ready application.

## Vercel static preview

1. Import the GitHub repository.
2. Set the project root to the repository root and the framework preset to **Other**.
3. Leave the build command empty and use the repository root as the output directory.
4. Keep `vercel.json` at the root. It rewrites known clean application paths to `index.html`; static assets use root-relative paths.
5. Use this deployment to review the interface only. Account and API actions need the backend work below.

No `package.json` or bundler is needed for the current front end.

## Required before a functional Vercel release

1. Verify Firebase ID tokens on every protected application API route and derive identity and roles from the verified token. Replace Websim identity headers and hard-coded administrator identities for production routes. Google sign-in in the browser does not authorize the current Worker routes on Vercel.
2. Add Vercel API function entry points for the `/api/*` routes used by the browser.
3. Select a durable database and storage provider. Migrate the current D1/SQLite schema and queries deliberately; use versioned migrations, backups, and a restore procedure.
4. Replace Worker bindings (`env.DB`, `env.BLOB`, `env.AI`) and browser-only Websim services with Vercel-compatible integrations.
5. Keep preview and production databases, authentication callback URLs, and provider credentials separate.
6. Keep Stripe and WhatsApp disabled until their secrets, webhook verification, consent handling, and support procedures are configured.
7. Verify that profile edits and mission membership persist to the authenticated account across browsers. Until then, label those actions as local drafts or demonstrations.

`.env.example` is a reference, not proof that those names are currently wired into Vercel. Configure only variables that the selected implementation actually reads. Never commit populated `.env` files or put server secrets in browser code.

## PWA release checks

- Serve the final domain over HTTPS.
- Confirm `/manifest.webmanifest`, `/sw.js`, `/offline.html`, and app icons are directly accessible.
- Replace or supplement SVG catalog icons with correctly sized raster exports if a store requires them.
- Bump `CACHE_VERSION` in `sw.js` for intentional shell releases.
- On a Preview deployment, check install behavior, offline navigation, update prompts, authenticated network-first behavior, nested route refresh, and sign-out/account switching before Production.
