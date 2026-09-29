import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PHONE_COUNTRIES } from "../whatsapp-phone.js";

const server = readFileSync(new URL("../server.js", import.meta.url), "utf8");
const whatsapp = readFileSync(new URL("../whatsapp.js", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.ok(PHONE_COUNTRIES.length >= 50, "country selector metadata is present");
for (const table of ["whatsapp_profiles", "whatsapp_identity_links", "whatsapp_connection_codes", "whatsapp_consent_events", "whatsapp_messages", "whatsapp_outbox", "whatsapp_audit_log", "whatsapp_integration_settings"]) {
  assert.match(server, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
}
for (const route of ["/api/whatsapp/webhook", "/api/whatsapp/profile", "/api/whatsapp/connect/create-code", "/api/whatsapp/consent", "/api/whatsapp/preferences", "/api/whatsapp/disconnect", "/api/admin/whatsapp/health", "/api/admin/whatsapp/metrics", "/api/admin/whatsapp/connections", "/api/admin/whatsapp/conversations", "/api/admin/whatsapp/messages", "/api/admin/whatsapp/templates", "/api/admin/whatsapp/automations/pause", "/api/admin/whatsapp/audit"]) {
  assert.match(server, new RegExp(route.replaceAll("/", "\\/")));
}
assert.match(server, /X-Hub-Signature-256|x-hub-signature-256/);
assert.match(server, /PHONE_ENCRYPTION_KEY/);
assert.match(server, /PHONE_LOOKUP_HASH_SECRET/);
assert.match(server, /INSERT OR IGNORE INTO whatsapp_webhook_events/);
assert.match(whatsapp, /WhatsApp Control Center/);
assert.match(whatsapp, /Demo Sandbox/);
assert.match(app, /WhatsApp Gateway.*WhatsApp Control Center|WhatsApp Control Center/);

console.log("WhatsApp Control Center static safeguards passed.");
