# Be The Change

Be The Change is a build-free web application for exploring missions, learning, country chapters, community events, and impact work. The browser app uses plain HTML, CSS, and JavaScript modules.

## Project status

The static interface can be deployed to Vercel as a preview. The complete application is not yet ready for a Vercel production launch:

- Google sign-in and a private Firestore passport are implemented in the browser, but require Firebase project configuration and deployed Firestore rules before they work.
- The browser calls `/api/*`, but this repository does not yet contain Vercel API functions.
- `server.js` is a Websim and Cloudflare Workers style handler. It expects runtime bindings such as `env.DB`, `env.BLOB`, and `env.AI`, and Websim identity headers.
- Profile and mission onboarding state may remain in this browser until a compatible authenticated backend is implemented.

See [docs/firebase-setup.md](docs/firebase-setup.md) to connect Firebase Authentication and Firestore. Google sign-in currently covers the private passport. Existing Websim API features still use Websim identity and are not authorized by a Firebase sign-in on Vercel.

Do not treat a successful static deployment as evidence that account, admin, messaging, payment, or data persistence features are working.

## Run the static interface locally

Serve the repository root with any static HTTP server. For example:

```sh
python3 -m http.server 8081
```

Then open `http://localhost:8081/`. This serves the UI and assets. Google sign-in can work there after Firebase is configured and `localhost` is authorized, but this static server does not provide the application API.

## Vercel preview

Use the repository root as the project root, select the **Other** framework preset, leave the build command empty, and use the repository root as the output directory. Route rewrites are defined in `vercel.json`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the distinction between a static preview and a functional release.

## Main files

- `index.html`: application document and entry module.
- `app.js`, `firebase-account.js`, `firebase-config.js`, `enterprise.js`, `whatsapp.js`: browser application modules.
- `firestore.rules`, `firebase.json`: private user rules and Firebase CLI configuration.
- `styles.css`: shared styles.
- `server.js`: current Websim and Cloudflare Workers style API handler; not a Vercel function.
- `offline-db.js`, `pwa.js`, `sw.js`, `manifest.webmanifest`: local drafts and installable app support.
- `vercel.json`: route rewrites and response headers.

## Configuration

`.env.example` is a reference for planned integrations and existing optional provider settings. Adding values to Vercel does not adapt or enable the current Worker handler. Never commit populated environment files or expose server secrets through client code.
