# WhatsApp Gateway implementation notes

The Be the Change WhatsApp layer is implemented as a local-first demo adapter
in `whatsapp.js`, composed into the existing SPA by `app.js`. The demo never
claims a WhatsApp message was delivered, never stores a password/PIN/payment
credential, and keeps demonstration records isolated from production data.

## Existing field mapping

| WhatsApp answer | Existing application field |
| --- | --- |
| Preferred name | `state.passport.name` / Change Passport display name |
| Country and city | `state.passport.country`, `state.passport.city` |
| Short idea | `state.passport.bio` and `state.enterprise.ventureDraft` |
| SDG choices | `state.passport.interests`, `state.onboarding.interests`, venture `sdgs` |
| Venture stage | Enterprise venture `businessStage` |
| Industry | Enterprise venture `sector` |
| Problem | Enterprise venture `communityNeed` |
| Customers | Enterprise venture `customer` |
| Team size | Enterprise venture `teamStatus` |
| Role and support needs | WhatsApp onboarding state; route into Enterprise/community tools |

The handoff opens the existing Enterprise workspace and marks the destination
as imported from WhatsApp. It never submits an application automatically.

## Browser demo adapter

`/whatsapp` provides a phone-frame conversation with one question at a time,
progress, language choices, service consent separate from marketing consent,
role selection, location, idea capture, SDG review, support needs, safe link,
QR preview, sharing, reminders, community request, human escalation, and a
review/handoff action. Drafts are stored in the existing `btc-change-network-state`
local state record.

The existing admin-only `WhatsApp Gateway` slot is rendered as the
`WhatsApp Control Center` compatibility alias. It includes the requested
Dashboard, Connections, Conversations, Users, Onboarding, Message Composer,
Templates, Automations, Campaigns, Communities, Support Queue, Consent,
Delivery and Errors, Integration Health, Settings, Audit Log, and isolated
Demo Sandbox views. The persistent sandbox banner is:

> DEMONSTRATION DATA — NOT A REAL PARTICIPANT, PAYMENT OR WHATSAPP CONVERSATION

## Protected production routes

The existing Websim-compatible `server.js` includes these boundaries:

- `GET /api/whatsapp/webhook` — validates Meta's verification token and returns the challenge.
- `POST /api/whatsapp/webhook` — verifies `X-Hub-Signature-256`, deduplicates the event ID, stores an immutable receipt, and acknowledges quickly.
- `GET /api/whatsapp/profile` and `PUT /api/whatsapp/profile` — return/store only masked, server-protected profile data.
- `POST /api/whatsapp/connect/create-code` and `/connect/confirm` — create a short-lived hashed code; only a verified webhook can confirm it.
- `POST /api/whatsapp/preferences`, `/consent`, `/disconnect`, `/request-export`, and `/request-deletion` — account-controlled preferences and privacy requests.
- `POST /api/admin/whatsapp/messages` and `/templates/send` — server-enforced permission, consent, window, quiet-hours, and approval checks.
- `GET /api/admin/whatsapp/health`, `/metrics`, `/connections`, `/conversations`, and `/audit` — authorized operational views with masking and production-only analytics.
- `POST /api/admin/whatsapp/automations/pause` and `/resume` — global outbound automation control.
- `POST /api/admin/whatsapp/connections/:userId/reveal` — separately permissioned and audited full-number reveal.
- `POST /api/onboarding/session` — creates sign-in-attributed session metadata.
- `POST /api/onboarding/handoff` — encrypts state, creates a 15-minute single-use signed token, and never puts profile data in a URL.
- `POST /api/onboarding/link-account` — validates expiry, account ownership, signature, and single-use status.
- `POST /api/community/recommend` — returns an honest empty state until a connected directory exists.
- `POST /api/human-handoff` — creates a sign-in-attributed support case.
- `GET /api/admin/whatsapp/health` — owner-only configuration presence check; values are never returned.

Webhook processing records immutable receipts, deduplicates retries, and uses
the platform wait-until hook for bounded asynchronous processing. Production
activation still requires a deployed queue or scheduled outbox consumer for
retryable outbound work; the feature flag remains disabled until that exists.

## Provider interfaces

The production adapter should keep these interfaces behind server code:

```js
// Conceptual interfaces; provider credentials never cross into browser code.
WhatsAppProvider = { verifyWebhook, sendText, sendTemplate, createFlow, exchangeFlowData };
MessagingService = { sendUtility, sendMarketingIfOptedIn, respectQuietHours };
TemplateService = { validate, submitForReview, status };
FlowService = { blueprint, publishServerSide, exchangeData };
WebhookProcessor = { verifySignature, deduplicate, acknowledge, enqueue, processIdempotently };
ConsentService = { record, withdraw, export, correction, deletion, audit };
IdentityLinkService = { createSession, createHandoff, exchangeSingleUseToken, detectConflict };
CommunityRoutingService = { recommend, issueExpiringInvite, recordOpened, recordSelfReportedJoined };
PaymentService = { createCheckout, providerAvailability, verifyWebhook, reconcile };
MarketplaceService = { searchApproved, createCart, createOrder, verifyVendor };
NotificationService = { sendUtility, receipt, failure, reminder };
HumanHandoffService = { createCase, assign, pauseAutomation, approveDraft, resolve };
AuditService = { appendImmutable, queryAuthorized, recordStaffAccess };
```

## Environment bindings

Configure these as encrypted server environment values, never in source,
browser storage, demo fixtures, console output, or URLs:

`WHATSAPP_ENABLED`, `WHATSAPP_DISPLAY_NUMBER`, `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_WEBHOOK_URL`,
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`,
`WHATSAPP_API_VERSION`, `WHATSAPP_DEFAULT_LANGUAGE`,
`WHATSAPP_DEFAULT_TIMEZONE`, `PUBLIC_APP_URL`, `SESSION_SIGNING_SECRET`,
`PHONE_ENCRYPTION_KEY`, `PHONE_LOOKUP_HASH_SECRET`.

`ENCRYPTION_KEY` remains a temporary compatibility binding for existing signed
handoff records while a documented key-rotation migration is completed.

Payment providers remain configuration-specific. Existing Stripe readiness is
preserved; Flutterwave, Paystack, Orange Money, MTN Mobile Money, M-Pesa, bank
transfer, cash/agent, and sponsored enrollment require their own approved
adapter, country availability, webhook verification, reconciliation, and
administrator review.

## Go-live checklist

1. Create and verify the Meta Business app and phone number.
2. Configure the environment values above in the protected deployment.
3. Register and test the webhook signature and retry/deduplication path.
4. Submit utility, authentication, service, and marketing templates for Meta review; do not display approval until returned by the real API.
5. Publish the Flow from a protected backend using the blueprint in the admin tab.
6. Connect identity linking, encryption key rotation, retention, RBAC, staff-access logging, and privacy-request workflows.
7. Configure regional payment adapters and verify payment webhooks before describing a payment as succeeded.
8. Connect a real community directory and expiring invite redirect.
9. Start analytics only from immutable production events. Keep Demo Sandbox data separate.
10. Complete legal, safeguarding, language, security, and accessibility review.
