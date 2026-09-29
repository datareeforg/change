# Be The Change — Application Overview

Last reviewed: 2026-09-11  
Documentation source: the files served from `/workspace`

## 1. Purpose and operating principles

**SHE BE THE CHANGE — Global Goals Action Network** is an independent, country-aware Sustainable Development Goals action network. It connects people, skills, learning, missions, countries, events, partners, products, evidence, funding readiness, and responsible enterprise development.

The application is designed around the operating rhythm:

> Learn → Connect → Build → Fund → Act → Verify → Replicate

The enterprise extension applies the same rhythm to:

> Change Passport → Founder Readiness → Community Need → Business Idea → Validation → Enterprise Blueprint → Country Launch Plan → Training → Mentorship → Registration → Banking → Payments → Pilot → Evidence → Funding Readiness → Launch → Impact → Replication

Core trust rules are part of the product model:

- The application is aligned with the UN Sustainable Development Goals, but does not claim UN affiliation or endorsement.
- Draft, proposed, research-only, information-requested, unverified, and demonstration records must remain visibly distinct from active or verified records.
- A payment, commitment, course enrollment, mentor recommendation, or AI-generated draft is not an approval.
- Consequential decisions require an authorized human reviewer.
- Youth, identity, banking, founder, mentor-session, financial, and private-document data is private by default.
- Public impact totals must be calculated from qualifying reviewed records, never from seeded demonstrations or unverified claims.

## 2. Runtime architecture

The project is a build-free web application served directly from `/workspace`.

| Layer | Current implementation |
| --- | --- |
| Entry point | `index.html` |
| Public application | Vanilla JavaScript SPA in `app.js` |
| Enterprise module | Composed ES module in `enterprise.js` |
| Styling | Shared responsive design system in `styles.css` |
| Server | Cloudflare Workers-style `server.js` handling `/api/*` |
| Durable server data | Project-private SQLite through `env.DB` |
| Client drafts | Versioned IndexedDB boundary in `offline-db.js`, with localStorage compatibility state |
| Offline shell | `sw.js`, `pwa.js`, `offline.html`, and `manifest.webmanifest` |
| Static map route | `map/index.html` |
| Owner route | `admin/index.html` and the SPA `admin` view |

There is no package manager, bundler, compilation pipeline, or client-side secret store. JavaScript and CSS are served as authored.

### Principal files

- `index.html`: metadata, application mount, stylesheet, modules, offline scripts.
- `app.js`: existing records, routes, views, event delegation, public/admin data loading, map, profile, course-generation flow, and composition of Enterprise.
- `enterprise.js`: feature flags, record registry, permissions, repository/adapters, founder flows, incubator, launch costs, mentors, training, registration, banking, payments, funding readiness, documents, product passports, impact, and operational readiness.
- `server.js`: schema, safe public projections, trusted-identity authorization, public APIs, owner APIs, media/jukebox workflows, profile persistence, GIS records, and Stripe adapter endpoints.
- `offline-db.js`: versioned local stores, sync queue, conflict records, offline packs, personal maps, and private enterprise drafts.
- `styles.css`: the shared dark/light visual language, responsive layout, map/admin styles, and Enterprise components.
- `sw.js`: versioned static/public caches; private and mutable API traffic is deliberately excluded.

## 3. Navigation and routes

The original navigation remains intact. Enterprise is the single added primary item and owns its own compact secondary navigation.

<!-- APP_INVENTORY:START -->
Generated inventory (2026-09-11):

- SPA routes: 30
- Enterprise feature flags: 15
- Exact `/api` route checks: 30
- IndexedDB stores: 33
<!-- APP_INVENTORY:END -->

### Public and account-facing routes

`home`, `explore`, `missions`, `mission/:id`, `peace`, `countries`, `country/:id`, `ghana`, `education`, `course/:id`, `studio`, `events`, `impact`, `sdgs`, `partners`, `shop`, `sports`, `funding`, `schools`, `universities`, `join`, `profile`, `my-map`, `map`, `login`, `privacy`, and `terms`.

### Enterprise route

`enterprise` contains:

1. Enterprise Home
2. Start a Business
3. My Venture
4. Incubator
5. Launch Cost Calculator
6. Training
7. Mentors
8. Registration
9. Banking & Payments
10. Funding
11. Next Gen Leaders
12. Business Tools

### Administration

The `admin` view retains the existing registry and moderation tools and adds **Enterprise Ops**. Enterprise Ops shows feature flags, connector states, record types, safe operational boundaries, and Stripe configuration.

The browser view is not the authorization boundary. Owner mutations are checked again in `server.js` by comparing trusted Websim identity headers with the project owner.

## 4. Existing public product areas

### Home and exploration

The homepage remains the original editorial and interactive entry point. It includes the interactive globe, country project carousel, Network Pulse, campaign content, and contextual paths into missions, education, countries, peace, partners, impact, sports, and the global map.

### Countries and map

- Country records use stable IDs, ISO codes, country-level coordinates, statuses, summaries, focus areas, SDGs, and provenance notes.
- Existing country records are retained. Liberia, Ghana, Uganda, and the broader country catalog remain expandable rather than being replaced by an enterprise-only list.
- The interactive map supports country selection, layers, filters, map/list/split views, safe geographic precision, saved views, offline packs, GeoRSS events, and accessible directory rendering.
- Protected care records suppress exact public coordinates.
- Country images and external map tiles are presentation sources, not evidence of programs, offices, or partnerships.

### Missions and peace

Existing mission IDs and public mission stages remain canonical. Enterprise incubator progress never changes a mission status automatically. Global Peace in Action, Digital Twin Football, Project Inferno, Next Generation Leaders, Inclusive World Cup Cities, and Youth Mission Network records remain present with their original status semantics.

### Education

Know The Change retains its catalog, enrollment/progress state, linked missions, draft labels, and AI-assisted course generator. Generated course content is a proposal requiring human review. Enterprise adds learning plans without replacing the course system.

### Events, evidence, and impact

Events can be published through structured records and exposed as GeoRSS. Signed-in contributors can save private evidence drafts against missions, events, or their check-ins and submit them for owner review. Reviewers record a private response and a separate public-safe note. The owner can draft, publish, correct, or withdraw a measured impact claim only with accepted supporting evidence. The public impact register and map use the same published claims; private evidence links and contributor identities do not enter public responses. Published values retain definitions, units, periods, geography, methods, limitations, reviewer dates, and correction history. Enterprise Impact links to this shared register. Empty states remain honest until reviewed claims exist.

### Partners, funding, shop, and sport

- Existing partner records and relationship-status vocabulary remain intact.
- Funding states distinguish concept, request, pledge, receipt, disbursement, reconciliation, and audit.
- Shop retains Digital Twin Football/Unity Ball and sports-product concepts.
- Product Passport support generalizes opaque QR/RFID identity without embedding personal information.
- Manufacturing, inventory, checkout, partner offers, and environmental claims remain unconnected or unverified until evidence and approved services exist.

## 5. Change Passport and identity

The Change Passport is the current account/profile onboarding layer. It supports display name, slug, location context, skills, interests, biography, languages, availability, participation preference, avatar, birth month/year, referral, joined missions, and completion state.

The Enterprise enhancement adds an optional **Choose Your Path** stage. It does not force enterprise participation and does not remove mission, education, sport, peace, school, university, or volunteer pathways.

Profile writes require a signed-in Websim identity on the server. Anonymous users can retain a local draft. Sensitive fields are not intended for public projections; any new public profile endpoint must use an explicit allowlist rather than returning the stored row.

## 6. Enterprise operating layer

### Feature flags

The current feature flags are:

`enterpriseEngine`, `founderOnboarding`, `incubatorWorkspace`, `startupCostEngine`, `mentorNetwork`, `nextGenLeaders`, `registrationTracker`, `bankingReadiness`, `paymentOrchestration`, `partnerOffers`, `fundingReadiness`, `portfolioFinance`, `projectInferno`, `productPassports`, and `enterpriseImpact`.

Informational/prototype surfaces are enabled by default. Real transactions, external submissions, identity verification, disbursements, and other consequential connectors remain disabled until configured and approved.

### Founder and venture workspace

Founders can create a private, locally persisted enterprise draft containing stage, country/city context, intended operating country, sector, community need, customer/beneficiary, team status, revenue band, registration status, banking status, payment methods, training needs, mentor needs, funding needs, SDG alignment, time commitment, and visibility preference.

The workspace includes Overview, Founder and Team, Community Need, Customer Discovery, Business Model, SDG Alignment, Launch Plan, Milestones, Startup Costs, Training, Mentorship, Registration, Banking, Payments, Funding, Documents, Evidence, Impact, Public Profile, and Activity History.

A public-profile preview uses an allowlist and excludes revenue, banking, documents, mentor notes, team contacts, and precise location.

### Incubator stages

The 17 private stages run from Founder Readiness through Replication. Each stage is prepared to hold tasks, learning, evidence, owners, reviewers, dates, dependencies, submissions, comments, revisions, approvals, blockers, and completion. Human review is explicitly required for safeguards, legal setup, evidence, funding, and related consequential steps.

### Country launch costs

Liberia, Ghana, and Uganda have expandable launch-cost workspaces. Formation, regulatory, operating-setup, and runway categories are modeled. No official fee is seeded without a reviewed source. Missing amounts display **“Official cost not yet verified”** and are excluded from totals. Currency conversion is disabled until a rate source and timestamp exist.

### Next Gen Leaders and Project Inferno

- **Liberia Next Gen Leaders — 200 Participant Goal** is linked to the preserved Next Generation Leaders mission. 200 is a target; actual record count starts at zero.
- Project Inferno receives an optional Program → Country Program → Hub/Cohort → Enterprise → Pilot Mission → Evidence/Outcomes workspace while the public mission remains Idea / Information Requested.

### Roles and permissions

The Enterprise module centralizes permission checks for Visitor, Member, Founder, Enterprise Team Member, Next Gen Leader, Mentor, Instructor, Country Coordinator, Evidence Reviewer, Finance Officer, Grant Manager, Partner Representative, Safeguarding Officer, Program Manager, Administrator, and Auditor.

The model anticipates organization, country, program, and cohort scopes, delegated access, suspension, revocation, separation of duties, and permission audit history. Client checks improve UX; server checks must authorize every durable or consequential operation.

## 7. Data and persistence

### Server database

`server.js` exports an idempotent SQLite schema. Current tables cover countries, locations, audit events, admin records, geometadata, personal maps/items, check-ins, country images, profiles, media, jukebox data, Stripe settings, Stripe PaymentIntent references, and processed Stripe webhook events.

Visitor-created rows include a `user_id` so platform moderation and user deletion can remove attributable data. Project configuration rows that should survive user deletion do not contain visitor content.

### Client database

IndexedDB database `be-the-change-offline`, version 2, contains public caches, preferences, map drafts, evidence drafts, sync queues/conflicts, media blobs, and private enterprise stores. Enterprise state also has a versioned localStorage compatibility snapshot so older records without enterprise fields continue to normalize safely.

The client repository interface can later be replaced by a production database adapter without replacing the UI.

### Offline and synchronization behavior

- Static assets are cached by the service worker.
- `/api/*`, `/admin*`, token-bearing, and session-bearing requests are excluded from service-worker caching.
- Private enterprise drafts are local-first.
- Pending network mutations use idempotency keys and a retry queue where implemented.
- Sync conflicts are separated rather than silently overwriting remote state.

Local storage is availability-oriented, not an encrypted vault. Legal identity documents, bank credentials, card data, PINs, secrets, and private keys must never be stored there.

## 8. Backend APIs

API groups currently include:

- Countries, country imagery, locations, and geometadata.
- Profile retrieval/update, slug availability, avatar update, and member search.
- Personal maps, saved items, and check-ins.
- Events and GeoRSS.
- Public/admin records.
- Media submission/moderation.
- Country jukebox settings, submissions, moderation, reporting, and audit.
- Owner audit access.
- Stripe status, owner configuration, owner connection test, PaymentIntent creation, and webhook receipt.

The backend is self-contained and uses fixed outbound destinations. It must never become a client-selected generic proxy.

## 9. Stripe adapter

Stripe is one optional payment-provider adapter, not the platform’s universal payments model. Mobile money, bank transfer, sponsored voucher, partner voucher, manual verified payment, and future regional aggregators remain separate rails.

### Safety properties

- Disabled by default in database configuration.
- Test and live modes are distinct.
- Secret and webhook keys are read only from server environment bindings.
- Admin forms never accept or display secret values.
- Owner authorization protects status/configuration and connection-test endpoints.
- PaymentIntent creation requires a signed-in user, allowed currency, configured minimum/maximum, and a 16–120 character idempotency key.
- Provider idempotency keys hash the user/key combination before transmission.
- The database stores provider references and normalized states, not PaymentIntent client secrets.
- Client secrets are returned only to the requesting client when needed for Stripe.js confirmation.
- Webhooks use the raw request body, HMAC-SHA256 signature verification, timestamp tolerance, duplicate-event protection, and minimal event retention.
- Webhook payloads and card/payment credentials are not stored.
- Payment states are normalized to Created, Pending authorization, Processing, Paid, Failed, Expired, Refunded, Partially refunded, or Disputed as applicable.

### Server environment bindings

Test mode:

- `STRIPE_TEST_SECRET_KEY`
- `STRIPE_TEST_PUBLISHABLE_KEY`

Live mode:

- `STRIPE_LIVE_SECRET_KEY`
- `STRIPE_LIVE_PUBLISHABLE_KEY`

Webhook verification:

- `STRIPE_WEBHOOK_SECRET`

Compatibility aliases `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` are accepted only when their `sk_test_`/`sk_live_` or `pk_test_`/`pk_live_` prefix matches the selected mode.

The webhook URL is:

`/api/payments/stripe/webhook`

### Administration flow

1. Provision keys in the hosting environment’s secret manager. Do not paste them into source, localStorage, IndexedDB, SQLite, comments, or admin-record notes.
2. Open Admin → Enterprise Ops → Stripe configuration.
3. Select **Test / sandbox**, currencies, and amount boundaries.
4. Save settings, then run **Test server connection**.
5. Configure the webhook endpoint in Stripe and complete sandbox webhook/idempotency/reconciliation tests.
6. Obtain administrator, legal, finance, refund-policy, and operational approval.
7. Provision live credentials separately and deliberately switch to Live.

The native Websim backend exposes `env.DB`, `env.AI`, and `env.BLOB` but does not currently provide a project-managed secret-entry UI. On a runtime without custom secret bindings the adapter will honestly remain **Not configured**. Do not work around this by storing Stripe secrets in the database or client.

### Stripe endpoints

| Endpoint | Method | Access | Purpose |
| --- | --- | --- | --- |
| `/api/payments/stripe/status` | GET | Public-safe | Non-secret adapter availability and limits |
| `/api/admin/integrations/stripe` | GET | Owner | Configuration and credential-presence booleans |
| `/api/admin/integrations/stripe` | POST | Owner | Save non-secret mode/currency/limit settings |
| `/api/admin/integrations/stripe/test` | POST | Owner | Test server-to-Stripe account access |
| `/api/payments/stripe/intents` | POST | Signed-in | Create/reuse an idempotent PaymentIntent |
| `/api/payments/stripe/webhook` | POST | Stripe signature | Verify and process provider events |

PaymentIntent creation does not itself guarantee payment, settle funds, issue a credential, approve a venture, or establish funding eligibility.

## 10. External dependencies and network services

The current browser may load Google Fonts, Three.js from esm.sh, MapLibre from unpkg, Wikimedia images, Esri tiles, OpenStreetMap/HOT tiles, CARTO tiles, and terrain tiles. The application also uses same-origin Websim APIs and may load externally hosted approved media.

These dependencies require an explicit Content Security Policy, Subresource Integrity or vendoring decisions where feasible, privacy review, availability fallbacks, and licensing/attribution review before a high-assurance production launch.

## 11. Current security and privacy boundaries

Implemented controls include:

- Trusted-header owner and signed-in-user checks on server mutations.
- SQL value binding rather than interpolating request values.
- Output escaping across most generated UI markup.
- Safe public projections for protected map data and admin rows.
- Explicit source/status/visibility fields.
- Recoverable archive behavior instead of destructive record deletion.
- Audit events for administrative, moderation, and Stripe configuration/payment actions.
- File type/size checks in backend-managed upload paths where implemented.
- Service-worker exclusion of private and mutable API data.
- Stripe signature verification and idempotency.
- No secret keys in client code or checked-in server source.

Important limitations:

- There is no complete production RBAC service for every Enterprise record yet.
- Client localStorage/IndexedDB is not encrypted and must not contain high-risk secrets or identity documents.
- A strict CSP/security-header layer is not yet present.
- Dynamic third-party script loading increases supply-chain risk.
- Rate limiting is workflow-specific rather than consistently enforced across every sensitive endpoint.
- Automated security, accessibility, migration, webhook, and end-to-end tests are not yet comprehensive.
- The current enterprise repository is a local prototype; multi-user authorization and synchronization require server implementation.

## 12. Self-updating hardening prompt backlog

This section is source-derived. Run the following command after security or architecture changes:

```bash
node docs/update-overview.mjs
```

The updater scans `index.html`, `app.js`, `enterprise.js`, `server.js`, `offline-db.js`, and `sw.js`; refreshes the inventory above; and rewrites exactly ten hardening prompts below. A passing signal means relevant controls were detected, not that the system is certified secure. Each prompt still requires evidence and human review before closure.

<!-- HARDENING_PROMPTS:START -->
Generated hardening review (2026-09-11):

1. **[OPEN] Establish a strict browser security and dependency policy.**
   Prompt: Threat-model every browser origin and external asset. Implement and test a nonce/hash-based Content Security Policy, security headers, frame policy, Referrer-Policy, Permissions-Policy, Trusted Types where viable, and a deliberate SRI/vendoring strategy for Three.js, MapLibre, fonts, map tiles, images, and media. Document required origins and prove the homepage, map, course studio, and Enterprise still work without `unsafe-eval`.
   Source signal: No explicit CSP/security-header policy was detected.

2. **[PARTIAL] Prove authorization and tenant isolation end to end.**
   Prompt: Build an authorization matrix for every API method and operational record across visitor, member, founder, team, mentor, reviewer, coordinator, finance, program, administrator, and auditor roles. Enforce organization/country/program/cohort scopes server-side, add negative tests for horizontal and vertical privilege escalation, and verify suspension, revocation, delegation, and separation-of-duties behavior.
   Source signal: Owner checks and client Enterprise permissions exist; complete server-side Enterprise RBAC is not detected.

3. **[PARTIAL] Minimize and protect sensitive personal, youth, and enterprise data.**
   Prompt: Inventory every collected field and data flow; classify sensitivity; define purpose, consent, guardian/age rules by country, retention, deletion, export, breach handling, and public-projection allowlists. Remove unnecessary birth, revenue, banking, precise-location, mentor-note, safeguarding, and identity data from clients; add access logging and encryption/key-management requirements for any future server storage.
   Source signal: Privacy-oriented projections and warnings exist; high-risk workflows still need a formal data-protection design.

4. **[PARTIAL] Complete a Stripe production-readiness and abuse review.**
   Prompt: Test the Stripe adapter with sandbox credentials, Stripe CLI/webhook fixtures, duplicate and out-of-order events, replay attempts, timestamp failures, provider timeouts, database conflicts, refunds, disputes, reconciliation, currency zero-decimal rules, amount boundaries, restricted-fund accounting, receipt behavior, and least-privilege keys. Define PCI scope, refund/chargeback operations, incident runbooks, and two-person live-mode approval before enabling transactions.
   Source signal: Server-only credentials, signature verification, idempotency, and normalized states were detected; production evidence is not present.

5. **[PARTIAL] Apply consistent API abuse, request-integrity, and response-security controls.**
   Prompt: Review every endpoint for authentication, authorization, CSRF assumptions, Origin/Host validation, CORS, content type, body/field limits, schema validation, rate limits, enumeration resistance, pagination, cache headers, error disclosure, and audit requirements. Implement reusable server helpers and demonstrate controls with automated malicious-request tests.
   Source signal: Some workflow-specific rate limiting exists; a uniform API security boundary was not detected.

6. **[PARTIAL] Eliminate DOM injection and unsafe rendering paths.**
   Prompt: Trace all server, user, URL, XML, AI, media, and admin values that reach `innerHTML`, attributes, links, styles, or third-party embeds. Replace string HTML with safer DOM construction where practical; enforce contextual escaping and URL allowlists; add sanitizer/Trusted Types boundaries for allowed rich content; and fuzz XSS payloads across search, profiles, records, country media, jukebox, Enterprise, and modals.
   Source signal: Escaping helpers exist, but the SPA still relies heavily on generated `innerHTML`.

7. **[PARTIAL] Formalize database migrations, constraints, and concurrency behavior.**
   Prompt: Replace ad hoc schema evolution with numbered, idempotent migrations and a migration ledger. Add foreign-key/uniqueness/check constraints where safe, deletion behavior, backup/restore verification, size limits, transaction tests, race-condition tests, and rollback procedures for profiles, admin records, GIS, media, enterprise records, audit events, and Stripe events.
   Source signal: Idempotent schema and one compatibility migration exist; no general migration ledger was detected.

8. **[PARTIAL] Harden uploads, media, URLs, and external content.**
   Prompt: Validate file signatures instead of trusting MIME names, cap decompressed and pixel dimensions, strip risky metadata, scan or quarantine uploads, prevent SVG/HTML execution, restrict external URL schemes/hosts, sandbox embeds, verify media rights/consent, protect youth imagery, and test storage abuse and malicious documents. Keep private material out of public blob storage.
   Source signal: Some type, size, URL, moderation, and privacy controls exist; a complete content-security pipeline was not detected.

9. **[PARTIAL] Secure offline storage, service workers, and synchronization.**
   Prompt: Model device loss, shared devices, XSS access, stale authorization, cache poisoning, replay, duplicate writes, conflict resolution, logout, account switching, retention, and deletion across localStorage, IndexedDB, Cache Storage, and retry queues. Add versioned migration tests, private-store purging, quota/error behavior, and proof that no API/private response or payment secret is cached.
   Source signal: Versioned IndexedDB and private-API cache exclusions exist; encrypted/sensitive-data lifecycle controls are incomplete.

10. **[OPEN] Build a repeatable security verification and incident-response program.**
   Prompt: Add unit, integration, contract, end-to-end, accessibility, dependency, secret, SAST, DAST, and abuse-case tests with CI gates. Define structured security logging, privacy-preserving metrics, alerting, audit-log integrity, backup recovery, dependency updates, vulnerability disclosure, incident severity, containment, key rotation, evidence preservation, communications, and post-incident review. Record owners and measurable exit criteria for every control.
   Source signal: Syntax/static checks exist, but a comprehensive automated security and incident-response program was not detected.
<!-- HARDENING_PROMPTS:END -->

## 13. Verification and maintenance

Recommended checks after changes:

```bash
node --check app.js
node --check enterprise.js
node --check server.js
node --check offline-db.js
node --check sw.js
node docs/update-overview.mjs --check
```

For backend work, reproduce the exact request against the preview, inspect the complete response, and review server logs. Do not call a live Stripe endpoint merely to prove the UI renders; use test credentials and explicit administrator action.

For visual work, preserve the existing homepage and run one targeted browser sanity check only when the change warrants it. Verify keyboard focus, reduced motion, touch targets, horizontal subnavigation, and phone-sized forms.

## 14. Definition of production-ready

The application should not be described as production-ready for registrations, banking, payments, grants, disbursements, credentials, safeguarding decisions, or verified impact until all of the following are true:

- The relevant feature flag and server connector are explicitly enabled.
- Credentials are stored in an approved server secret manager.
- Legal, privacy, financial, safeguarding, and country-specific requirements are reviewed.
- Server-side RBAC and scopes are enforced and negatively tested.
- Sources, fees, provider availability, and policies have named reviewers and current dates.
- Failure, refund, dispute, appeal, correction, and audit workflows are operational.
- Monitoring and incident response are active.
- Demonstration and draft data cannot enter live financial or verified impact totals.
- A named administrator has approved release and rollback plans.

Until then, the existing labels—Draft, Proposed, Research Only, Information Requested, Prototype, Sandbox, Not Configured, Disabled, and Guidance Only—are intentional product controls, not unfinished copy.
