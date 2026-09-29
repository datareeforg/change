#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const docsDir=dirname(fileURLToPath(import.meta.url));
const root=resolve(docsDir,"..");
const overviewPath=resolve(docsDir,"overview.md");
const files=Object.fromEntries(await Promise.all(["index.html","app.js","enterprise.js","server.js","offline-db.js","sw.js"].map(async name=>[name,await readFile(resolve(root,name),"utf8")])));
const all=Object.values(files).join("\n");
const day=new Date().toISOString().slice(0,10);
const has=pattern=>pattern.test(all);
const status=(complete,partial)=>complete?"READY FOR REVIEW":partial?"PARTIAL":"OPEN";

const routeMatch=files["app.js"].match(/const VALID_ROUTES = new Set\(\[([^\]]+)\]/s);
const routes=routeMatch?[...routeMatch[1].matchAll(/"([^"]+)"/g)].map(match=>match[1]):[];
const flagMatch=files["enterprise.js"].match(/ENTERPRISE_FEATURE_FLAGS = Object\.freeze\(\{([\s\S]*?)\}\);/);
const flags=flagMatch?[...flagMatch[1].matchAll(/([A-Za-z][A-Za-z0-9]+):(?:true|false)/g)].map(match=>match[1]):[];
const exactApis=[...files["server.js"].matchAll(/url\.pathname === ['"](\/api\/[^'"]+)['"]/g)].map(match=>match[1]);
const storeMatch=files["offline-db.js"].match(/const STORES = \[([\s\S]*?)\];/);
const stores=storeMatch?[...storeMatch[1].matchAll(/"([^"]+)"/g)].map(match=>match[1]):[];

const prompts=[
  {
    title:"Establish a strict browser security and dependency policy.",
    state:status(has(/Content-Security-Policy/i)&&has(/Permissions-Policy/i),has(/Content-Security-Policy|security headers/i)),
    prompt:"Threat-model every browser origin and external asset. Implement and test a nonce/hash-based Content Security Policy, security headers, frame policy, Referrer-Policy, Permissions-Policy, Trusted Types where viable, and a deliberate SRI/vendoring strategy for Three.js, MapLibre, fonts, map tiles, images, and media. Document required origins and prove the homepage, map, course studio, and Enterprise still work without `unsafe-eval`.",
    evidence:has(/Content-Security-Policy/i)?"A CSP signal was detected; verify enforcement and coverage.":"No explicit CSP/security-header policy was detected."
  },
  {
    title:"Prove authorization and tenant isolation end to end.",
    state:status(has(/serverEnterprisePermission|authorizeEnterpriseScope/),has(/const owner = request/)&&has(/canEnterprise/)),
    prompt:"Build an authorization matrix for every API method and operational record across visitor, member, founder, team, mentor, reviewer, coordinator, finance, program, administrator, and auditor roles. Enforce organization/country/program/cohort scopes server-side, add negative tests for horizontal and vertical privilege escalation, and verify suspension, revocation, delegation, and separation-of-duties behavior.",
    evidence:"Owner checks and client Enterprise permissions exist; complete server-side Enterprise RBAC is not detected."
  },
  {
    title:"Minimize and protect sensitive personal, youth, and enterprise data.",
    state:status(has(/dataRetentionPolicyVersion/)&&has(/sensitive_access_log/),has(/Private by default|public profile preview|safeLocation/i)),
    prompt:"Inventory every collected field and data flow; classify sensitivity; define purpose, consent, guardian/age rules by country, retention, deletion, export, breach handling, and public-projection allowlists. Remove unnecessary birth, revenue, banking, precise-location, mentor-note, safeguarding, and identity data from clients; add access logging and encryption/key-management requirements for any future server storage.",
    evidence:"Privacy-oriented projections and warnings exist; high-risk workflows still need a formal data-protection design."
  },
  {
    title:"Complete a Stripe production-readiness and abuse review.",
    state:status(has(/stripe webhook integration test/i)&&has(/zero-decimal/i),has(/verifyStripeSignature/)&&has(/idempotency_key/)&&has(/stripe_payment_intents/)),
    prompt:"Test the Stripe adapter with sandbox credentials, Stripe CLI/webhook fixtures, duplicate and out-of-order events, replay attempts, timestamp failures, provider timeouts, database conflicts, refunds, disputes, reconciliation, currency zero-decimal rules, amount boundaries, restricted-fund accounting, receipt behavior, and least-privilege keys. Define PCI scope, refund/chargeback operations, incident runbooks, and two-person live-mode approval before enabling transactions.",
    evidence:has(/verifyStripeSignature/)?"Server-only credentials, signature verification, idempotency, and normalized states were detected; production evidence is not present.":"No complete Stripe server adapter was detected."
  },
  {
    title:"Apply consistent API abuse, request-integrity, and response-security controls.",
    state:status(has(/validateApiRequest/)&&has(/globalRateLimit/),has(/RateLimited|rate limit|rateLimit/i)),
    prompt:"Review every endpoint for authentication, authorization, CSRF assumptions, Origin/Host validation, CORS, content type, body/field limits, schema validation, rate limits, enumeration resistance, pagination, cache headers, error disclosure, and audit requirements. Implement reusable server helpers and demonstrate controls with automated malicious-request tests.",
    evidence:"Some workflow-specific rate limiting exists; a uniform API security boundary was not detected."
  },
  {
    title:"Eliminate DOM injection and unsafe rendering paths.",
    state:status(!/\.innerHTML\s*=/.test(files["app.js"]),has(/function esc\(|const esc=/)),
    prompt:"Trace all server, user, URL, XML, AI, media, and admin values that reach `innerHTML`, attributes, links, styles, or third-party embeds. Replace string HTML with safer DOM construction where practical; enforce contextual escaping and URL allowlists; add sanitizer/Trusted Types boundaries for allowed rich content; and fuzz XSS payloads across search, profiles, records, country media, jukebox, Enterprise, and modals.",
    evidence:"Escaping helpers exist, but the SPA still relies heavily on generated `innerHTML`."
  },
  {
    title:"Formalize database migrations, constraints, and concurrency behavior.",
    state:status(has(/schema_migrations/)&&has(/PRAGMA foreign_keys/),has(/CREATE TABLE IF NOT EXISTS/)&&has(/ensureProfileColumns/)),
    prompt:"Replace ad hoc schema evolution with numbered, idempotent migrations and a migration ledger. Add foreign-key/uniqueness/check constraints where safe, deletion behavior, backup/restore verification, size limits, transaction tests, race-condition tests, and rollback procedures for profiles, admin records, GIS, media, enterprise records, audit events, and Stripe events.",
    evidence:"Idempotent schema and one compatibility migration exist; no general migration ledger was detected."
  },
  {
    title:"Harden uploads, media, URLs, and external content.",
    state:status(has(/file signature|magic bytes/i)&&has(/Content-Disposition.*attachment/i),has(/content-type|byteLength|safeHttpUrl|rights_confirmed/i)),
    prompt:"Validate file signatures instead of trusting MIME names, cap decompressed and pixel dimensions, strip risky metadata, scan or quarantine uploads, prevent SVG/HTML execution, restrict external URL schemes/hosts, sandbox embeds, verify media rights/consent, protect youth imagery, and test storage abuse and malicious documents. Keep private material out of public blob storage.",
    evidence:"Some type, size, URL, moderation, and privacy controls exist; a complete content-security pipeline was not detected."
  },
  {
    title:"Secure offline storage, service workers, and synchronization.",
    state:status(has(/privateStorePurge/)&&has(/accountSwitchCleanup/),has(/indexedDB/)&&has(/isPrivateOrMutable/)&&has(/syncConflicts/)),
    prompt:"Model device loss, shared devices, XSS access, stale authorization, cache poisoning, replay, duplicate writes, conflict resolution, logout, account switching, retention, and deletion across localStorage, IndexedDB, Cache Storage, and retry queues. Add versioned migration tests, private-store purging, quota/error behavior, and proof that no API/private response or payment secret is cached.",
    evidence:"Versioned IndexedDB and private-API cache exclusions exist; encrypted/sensitive-data lifecycle controls are incomplete."
  },
  {
    title:"Build a repeatable security verification and incident-response program.",
    state:status(has(/security-test-suite/)&&has(/incident-response/),has(/node --check|Static acceptance checks/i)),
    prompt:"Add unit, integration, contract, end-to-end, accessibility, dependency, secret, SAST, DAST, and abuse-case tests with CI gates. Define structured security logging, privacy-preserving metrics, alerting, audit-log integrity, backup recovery, dependency updates, vulnerability disclosure, incident severity, containment, key rotation, evidence preservation, communications, and post-incident review. Record owners and measurable exit criteria for every control.",
    evidence:"Syntax/static checks exist, but a comprehensive automated security and incident-response program was not detected."
  }
];

const inventory=`<!-- APP_INVENTORY:START -->\nGenerated inventory (${day}):\n\n- SPA routes: ${routes.length}\n- Enterprise feature flags: ${flags.length}\n- Exact \`/api\` route checks: ${new Set(exactApis).size}\n- IndexedDB stores: ${stores.length}\n<!-- APP_INVENTORY:END -->`;
const backlog=`<!-- HARDENING_PROMPTS:START -->\nGenerated hardening review (${day}):\n\n${prompts.map((item,index)=>`${index+1}. **[${item.state}] ${item.title}**\n   Prompt: ${item.prompt}\n   Source signal: ${item.evidence}`).join("\n\n")}\n<!-- HARDENING_PROMPTS:END -->`;

let overview=await readFile(overviewPath,"utf8");
const updated=overview
  .replace(/<!-- APP_INVENTORY:START -->[\s\S]*?<!-- APP_INVENTORY:END -->/,inventory)
  .replace(/<!-- HARDENING_PROMPTS:START -->[\s\S]*?<!-- HARDENING_PROMPTS:END -->/,backlog);

if (process.argv.includes("--check")) {
  if (updated !== overview) {
    const currentLines=overview.split("\n"),expectedLines=updated.split("\n");
    const firstDifference=currentLines.findIndex((line,index)=>line!==expectedLines[index]);
    const lineNumber=firstDifference<0?Math.min(currentLines.length,expectedLines.length)+1:firstDifference+1;
    console.error(`docs/overview.md is stale near line ${lineNumber}.`);
    console.error(`Current:  ${JSON.stringify(currentLines[lineNumber-1] ?? "<end of file>")}`);
    console.error(`Expected: ${JSON.stringify(expectedLines[lineNumber-1] ?? "<end of file>")}`);
    console.error("Run: node docs/update-overview.mjs");
    process.exit(1);
  }
  console.log("docs/overview.md generated sections are current.");
} else {
  await writeFile(overviewPath,updated);
  console.log("Updated docs/overview.md inventory and 10 hardening prompts.");
}
