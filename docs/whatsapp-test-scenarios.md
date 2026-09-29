# WhatsApp Gateway deterministic scenarios

These scenarios can be run from the owner-only Demo Sandbox. They are
deliberately isolated from production records and use no real phone numbers,
payments, messages, approvals, or participant analytics.

| Scenario | Expected result |
| --- | --- |
| New opt-in | `DISCOVERED → LANGUAGE_SELECTED → CONSENT_PENDING → ROLE_SELECTED` |
| Refused consent / STOP | `OPTED_OUT`; service and marketing consent are false |
| Marketing denied, service accepted | Onboarding continues; promotional messaging remains disabled |
| Language change | Language preference changes; untranslated content falls back to English and is reviewable |
| Duplicate inbound message | Same event ID is ignored by the webhook deduplication store |
| Out-of-order webhook | Event is retained by immutable ID; state updates must be idempotent in the queue consumer |
| Returning participant | Sandbox shows `APPLICATION_IN_PROGRESS`; no progress is invented in production |
| Existing account match | Handoff is scoped to the signed-in account; a conflict is rejected server-side |
| Expired handoff | Signed token is rejected with an expired/invalid response |
| Voice-note correction | Transcript is a draft that must be approved or edited; original media policy still applies |
| AI enhancement rejected | Original idea remains unchanged; AI draft is not submitted |
| Unsupported country | No invented subdivision or cost; route to human/local verification |
| Missing verified cost source | Show `Local verification required` |
| Payment pending | State remains pending; never rendered as paid |
| Forged payment redirect | Browser redirect cannot change payment state |
| Verified payment webhook | Only a verified provider webhook may transition the payment state |
| Community recommendation | Explain fit; user must request/open an invitation; never auto-add |
| Human escalation | `HUMAN_SUPPORT`; automation pause is explicit |
| Data deletion request | Create a privacy case; do not silently delete the audit trail |
| Mobile 320px | Controls remain thumb-sized, no horizontal page overflow, floating action clears bottom nav |
| Keyboard navigation | Focus-visible controls; dialog and close actions remain reachable |
| Screen-reader labels | Phone frame, QR, progress, buttons, and forms have accessible labels |
| Loss of connectivity | Local draft stays available; production actions show reconnect state |
| Provider disconnected | Diagnostics and production dashboards show an honest empty/disconnected state |

The visual sanity check used `/#whatsapp` at 390×844 and reported no console
errors. Direct clean-route hosting is configured in `vercel.json`; the local
preview helper uses the existing hash-based SPA route convention.
