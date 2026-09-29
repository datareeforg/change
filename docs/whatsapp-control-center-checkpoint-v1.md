# WhatsApp Control Center compatibility checkpoint v1

Checkpoint recorded before the additive enhancement. No existing table, route,
local-storage record, or public entry point is removed or renamed.

## Existing surface preserved

- Public entry point: `/whatsapp`.
- Existing admin slot: `WhatsApp Gateway`, now rendered as the compatibility
  alias `WhatsApp Control Center`.
- Existing demo onboarding state remains in the existing
  `btc-change-network-state` browser record. It is not imported into the
  production WhatsApp tables.
- Existing server tables retained: `whatsapp_onboarding_sessions`,
  `whatsapp_webhook_events`, and `whatsapp_support_cases`.
- Existing payment, community, marketplace, Change Passport, Enterprise, and
  general Admin Users behavior remains outside the WhatsApp-specific namespace.

## Nested-tab compatibility map

| Previous value | Current value |
| --- | --- |
| Overview | Dashboard |
| Participants | Users |
| Onboarding Funnel | Onboarding |
| Campaigns and QR Codes | Campaigns |
| Message Templates | Templates |
| Human Support Queue | Support Queue |
| Consent and Privacy | Consent |
| Integrations and Diagnostics | Integration Health |
| Demo Sandbox | Demo Sandbox |

The old values are normalized when read, while new state uses the existing
WhatsApp admin namespace and never collides with the generic Admin Users tab.

## Additive production safeguards

- New WhatsApp records use `dataset='production'`; demo records remain local or
  explicitly marked `demo`.
- Production mode requires the feature flag and complete protected bindings.
- Raw phone numbers are not migrated from localStorage and are not returned to
  ordinary UI queries.
- Phone data is normalized server-side, encrypted with AES-GCM, and indexed by
  a deterministic HMAC hash. Full-number reveal is a separate audited action.
- Webhook receipts store immutable event IDs and processing status, not raw
  payloads. Signature validation and retry deduplication happen server-side.
- Rollback is the production flag or outbound automation pause; existing demo
  onboarding and application pages remain available.

## Current browser storage keys

`btc-change-network-state`, `btc-ui-theme`, and existing platform/browser
storage are preserved. No WhatsApp raw number is written to these keys.
