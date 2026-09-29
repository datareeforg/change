/*
 * Be The Change · WhatsApp Gateway
 *
 * This module is deliberately provider-neutral. The browser adapter is a
 * clearly labelled local demo that maps into the existing Change Passport and
 * Enterprise draft fields. Production messaging, identity linking, payment,
 * and webhook work belongs behind the server endpoints documented in
 * docs/whatsapp-gateway.md.
 */
import { countryFlag } from "./country-flags.js";
import { renderWhatsAppPhoneField, readWhatsAppPhoneField, bindWhatsAppPhoneField } from "./whatsapp-phone.js";

export const WHATSAPP_STATES = [
  ["DISCOVERED", "Discovered", "Welcome received"],
  ["CONSENT_PENDING", "Consent pending", "Review the privacy summary"],
  ["LANGUAGE_SELECTED", "Language selected", "Preferred language saved"],
  ["ROLE_SELECTED", "Role selected", "Pathway selected"],
  ["IDENTITY_STARTED", "Profile started", "A few essentials captured"],
  ["LOCATION_STARTED", "Location started", "Country context captured"],
  ["VENTURE_STARTED", "Venture started", "Idea and stage captured"],
  ["IMPACT_STARTED", "Impact started", "SDG pathway under review"],
  ["NEEDS_ASSESSED", "Needs assessed", "Support needs mapped"],
  ["ACCOUNT_LINK_PENDING", "Workspace link pending", "Secure handoff requested"],
  ["WEB_HANDOFF_CREATED", "Workspace ready", "Review link created"],
  ["APPLICATION_IN_PROGRESS", "Application in progress", "Review before submitting"],
  ["APPLICATION_SUBMITTED", "Application submitted", "Awaiting review"],
  ["VERIFICATION_PENDING", "Verification pending", "Human review required"],
  ["PAYMENT_PENDING", "Payment pending", "Checkout needs attention"],
  ["COHORT_ROUTING", "Cohort routing", "Finding the right pathway"],
  ["COMMUNITY_INVITE_READY", "Community invite ready", "Invitation awaits your action"],
  ["ACTIVE_PARTICIPANT", "Active participant", "Journey is active"],
  ["PAUSED", "Paused", "You can resume any time"],
  ["HUMAN_SUPPORT", "Human support", "A guide is needed"],
  ["OPTED_OUT", "Opted out", "Service messages stopped"],
  ["BLOCKED", "Blocked", "Further action is unavailable"],
  ["ARCHIVED", "Archived", "Journey is closed"],
];

export const WHATSAPP_LANGUAGES = [
  "English", "French", "Portuguese", "Arabic", "Swahili", "Twi", "Ewe", "Ga",
  "Yoruba", "Igbo", "Hausa", "Liberian English", "Krio",
];

export const WHATSAPP_ROLES = [
  ["aspiring_entrepreneur", "Aspiring entrepreneur"],
  ["existing_business", "Existing business owner"],
  ["young_entrepreneur", "Young entrepreneur"],
  ["community_group", "Cooperative or community group"],
  ["mentor", "Mentor"],
  ["investor", "Investor or funder"],
  ["trainer", "Trainer"],
  ["vendor", "Vendor or service provider"],
  ["ngo_partner", "NGO or development partner"],
  ["institutional_partner", "Government or institutional partner"],
  ["exploring", "Just exploring"],
];

export const WHATSAPP_NEEDS = [
  "Registration", "Licensing", "Banking", "Mobile money", "Recordkeeping", "Product development",
  "Equipment", "Premises or land", "Internet and technology", "Workforce", "Training", "Mentoring",
  "Funding", "Market access", "Logistics", "Export readiness", "Environmental compliance",
];

export const WHATSAPP_SDG_OPTIONS = [
  ["SDG 01", "No Poverty", "Income and livelihood pathways"],
  ["SDG 02", "Zero Hunger", "Food systems and agricultural enterprise"],
  ["SDG 04", "Quality Education", "Learning, skills, and opportunity"],
  ["SDG 05", "Gender Equality", "More equitable participation and finance"],
  ["SDG 06", "Clean Water", "Water access, hygiene, and resilience"],
  ["SDG 07", "Affordable and Clean Energy", "Energy access and transition"],
  ["SDG 08", "Decent Work", "Enterprise, jobs, and livelihoods"],
  ["SDG 09", "Industry, Innovation & Infrastructure", "Products, systems, and infrastructure"],
  ["SDG 10", "Reduced Inequalities", "Access and inclusion"],
  ["SDG 11", "Sustainable Cities & Communities", "Place-based community development"],
  ["SDG 12", "Responsible Consumption", "Circular and responsible production"],
  ["SDG 13", "Climate Action", "Adaptation, mitigation, and resilience"],
  ["SDG 16", "Peace, Justice & Strong Institutions", "Trust, safety, and good governance"],
  ["SDG 17", "Partnerships for the Goals", "Collaboration and shared delivery"],
];

const FLOW_SCREENS = [
  ["FLOW_SCREEN_1_WELCOME", "Welcome", "Choose a starting point for your Be the Change journey.", ["intent"], "Intent is one of the supported quick replies.", true, "FLOW_SCREEN_2_LANGUAGE_AND_CONSENT", "wa.flow.welcome"],
  ["FLOW_SCREEN_2_LANGUAGE_AND_CONSENT", "Language and consent", "Choose your language, then review how your information is used.", ["language", "service_consent", "marketing_consent"], "Language required; service consent must be true; marketing consent is optional.", true, "FLOW_SCREEN_3_ROLE", "wa.flow.languageConsent"],
  ["FLOW_SCREEN_3_ROLE", "Your pathway", "Tell us how you want to participate. You may choose more than one role.", ["roles"], "At least one role is required.", true, "FLOW_SCREEN_4_LOCATION", "wa.flow.role"],
  ["FLOW_SCREEN_4_LOCATION", "Location", "Country context helps us route local guidance. Precise location is not required.", ["country", "region", "city", "settlement_type", "service_radius"], "Country must be present in the verified country dataset.", true, "FLOW_SCREEN_5_VENTURE_STAGE", "wa.flow.location"],
  ["FLOW_SCREEN_5_VENTURE_STAGE", "Venture stage", "Share the smallest useful description of where you are.", ["stage", "industry", "description"], "Stage and a short description are required for enterprise pathways.", true, "FLOW_SCREEN_6_BUSINESS_IDEA", "wa.flow.stage"],
  ["FLOW_SCREEN_6_BUSINESS_IDEA", "Business idea", "What problem are you solving, and for whom?", ["problem", "customers", "team_size", "revenue_band", "obstacle"], "Original wording is retained; fields are editable later.", true, "FLOW_SCREEN_7_SUPPORT_NEEDS", "wa.flow.idea"],
  ["FLOW_SCREEN_7_SUPPORT_NEEDS", "Support needs", "Which support would be most useful right now?", ["needs"], "Choose at least one need or select ‘Just exploring’. ", false, "FLOW_SCREEN_8_SDG_INTEREST", "wa.flow.needs"],
  ["FLOW_SCREEN_8_SDG_INTEREST", "SDG interest", "Review up to three possible Global Goal connections.", ["sdgs"], "The participant confirms or changes the suggested goals.", true, "FLOW_SCREEN_9_COMMUNICATION_PREFERENCES", "wa.flow.sdg"],
  ["FLOW_SCREEN_9_COMMUNICATION_PREFERENCES", "Communication preferences", "Choose service reminders and optional updates.", ["quiet_hours", "marketing_consent", "frequency"], "Service messages remain separate from marketing consent.", false, "FLOW_SCREEN_10_REVIEW_AND_HANDOFF", "wa.flow.preferences"],
  ["FLOW_SCREEN_10_REVIEW_AND_HANDOFF", "Review and handoff", "Review your imported profile before entering the web workspace.", ["confirm", "handoff"], "Never submits the application automatically.", true, null, "wa.flow.review"],
].map(([id, title, body, fields, validation, required, next, translationKey]) => ({
  id, title, body, fields, validation, required, nextScreen: next, errorState: "Show the field-level error and keep the answer local.", accessibilityLabel: `${title} screen`, translationKey,
}));

export const WHATSAPP_FLOW_BLUEPRINT = FLOW_SCREENS;
export const WHATSAPP_REQUIRED_ENV = [
  "WHATSAPP_ENABLED", "WHATSAPP_DISPLAY_NUMBER", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_BUSINESS_ACCOUNT_ID", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_APP_SECRET",
  "WHATSAPP_VERIFY_TOKEN", "WHATSAPP_API_VERSION", "WHATSAPP_WEBHOOK_URL", "WHATSAPP_DEFAULT_LANGUAGE", "WHATSAPP_DEFAULT_TIMEZONE", "PUBLIC_APP_URL", "SESSION_SIGNING_SECRET", "PHONE_ENCRYPTION_KEY", "PHONE_LOOKUP_HASH_SECRET",
];

const initialMessages = () => [
  { id: "welcome", direction: "in", text: "Welcome to Be the Change 🌍", at: new Date().toISOString() },
  { id: "welcome-reply", direction: "out", text: "I can help you explore an idea, grow a business, find training or mentorship, join the community, or continue an existing application.", at: new Date().toISOString() },
];

export function getDefaultWhatsAppState() {
  return {
    mode: "demo",
    state: "DISCOVERED",
    step: 0,
    source: "landing_page",
    campaignCode: "BTC-LANDING",
    language: "English",
    consent: { service: null, marketing: null, at: null, source: "web_demo" },
    roles: [],
    participant: { name: "", ageEligible: "", accessibility: "", demographic: "Prefer not to say" },
    location: { country: "Ghana", region: "", city: "", settlementType: "", serviceRadius: "", timeZone: "" },
    venture: { stage: "", industry: "", description: "", problem: "", customers: "", teamSize: "", revenueBand: "", obstacle: "", support: "" },
    sdgs: [],
    needs: [],
    communication: { frequency: "Service messages only", quietHours: "", language: "English" },
    handoff: null,
    importedSections: [],
    originalIdea: "",
    aiDraft: "",
    aiAssumptions: [],
    communityInvitation: "NOT_REQUESTED",
    payment: { state: "NOT_REQUIRED", provider: "", amount: "", currency: "" },
    qrOpen: false,
    adminTab: "Overview",
    sandboxScenario: "New entrepreneur",
    sandboxEvents: [],
    messages: initialMessages(),
    lastUpdated: new Date().toISOString(),
  };
}

export function normaliseWhatsAppState(value = {}) {
  const base = getDefaultWhatsAppState();
  const next = {
    ...base, ...value,
    consent: { ...base.consent, ...(value.consent || {}) },
    participant: { ...base.participant, ...(value.participant || {}) },
    location: { ...base.location, ...(value.location || {}) },
    venture: { ...base.venture, ...(value.venture || {}) },
    communication: { ...base.communication, ...(value.communication || {}) },
    payment: { ...base.payment, ...(value.payment || {}) },
  };
  next.state = WHATSAPP_STATES.some(([code]) => code === next.state) ? next.state : "DISCOVERED";
  next.step = Math.max(0, Math.min(10, Number(next.step) || 0));
  next.language = WHATSAPP_LANGUAGES.includes(next.language) ? next.language : "English";
  next.communication.language = WHATSAPP_LANGUAGES.includes(next.communication.language) ? next.communication.language : next.language;
  next.roles = Array.isArray(next.roles) ? next.roles.filter(role => WHATSAPP_ROLES.some(([id]) => id === role)).slice(0, 5) : [];
  next.sdgs = Array.isArray(next.sdgs) ? [...new Set(next.sdgs.filter(id => WHATSAPP_SDG_OPTIONS.some(([code]) => code === id)))].slice(0, 3) : [];
  next.needs = Array.isArray(next.needs) ? [...new Set(next.needs.filter(need => WHATSAPP_NEEDS.includes(need)))].slice(0, 8) : [];
  next.messages = Array.isArray(next.messages) ? next.messages.slice(-40) : initialMessages();
  next.importedSections = Array.isArray(next.importedSections) ? [...new Set(next.importedSections)].slice(0, 20) : [];
  return next;
}

function esc(value = "") { return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])); }
function labelForRole(id) { return WHATSAPP_ROLES.find(([key]) => key === id)?.[1] || id; }
function labelForSdg(id) { return WHATSAPP_SDG_OPTIONS.find(([key]) => key === id)?.[1] || id; }
function stateLabel(code) { return WHATSAPP_STATES.find(([key]) => key === code)?.[1] || code; }
function sourceLabel(source) { return String(source || "landing_page").replace(/_/g, " "); }
function localSave(state, ctx) { state.whatsapp.lastUpdated = new Date().toISOString(); ctx.persist?.(); }
function pushMessage(state, direction, text, id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`) { state.whatsapp.messages = [...(state.whatsapp.messages || []), { id, direction, text, at: new Date().toISOString() }].slice(-40); }
function setState(state, code, step, ctx) { state.whatsapp.state = code; state.whatsapp.step = step; localSave(state, ctx); }
function btn(label, action, cls = "") { return `<button class="btn ${cls}" data-action="${action}">${label}</button>`; }
function tag(text, cls = "") { return `<span class="wa-tag ${cls}">${esc(text)}</span>`; }

function qrCode(value = "BTC-LANDING") {
  const size = 21, matrix = Array.from({ length: size }, () => Array(size).fill(false)), reserved = Array.from({ length: size }, () => Array(size).fill(false));
  const finder = (ox, oy) => { for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) { const px = ox + x, py = oy + y; if (px < 0 || py < 0 || px >= size || py >= size) continue; reserved[py][px] = true; matrix[py][px] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)); } };
  finder(0, 0); finder(size - 7, 0); finder(0, size - 7);
  let hash = 0; for (const c of value) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!reserved[y][x]) { hash = (hash * 1664525 + 1013904223) >>> 0; matrix[y][x] = ((hash >>> 28) & 1) === 1; }
  const cells = []; for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (matrix[y][x]) cells.push(`M${x} ${y}h1v1H${x}z`);
  return `<svg viewBox="0 0 21 21" role="img" aria-label="QR code for safe campaign ${esc(value)}"><rect width="21" height="21" fill="#fff"/><path d="${cells.join("")}" fill="#0b2d24"/></svg>`;
}

function safeLink(state) { return `https://wa.me/?text=START%20${encodeURIComponent(state.whatsapp.campaignCode || "BTC-LANDING")}`; }
function progressPercent(state) { return Math.round(Math.min(100, (state.whatsapp.step / 10) * 100)); }
function journeyMarkup(state) {
  const current = state.whatsapp.state;
  const stages = [["WhatsApp", ["DISCOVERED", "CONSENT_PENDING", "LANGUAGE_SELECTED", "ROLE_SELECTED"]], ["Profile", ["IDENTITY_STARTED", "LOCATION_STARTED"]], ["Plan", ["VENTURE_STARTED", "IMPACT_STARTED", "NEEDS_ASSESSED"]], ["Commitment", ["PAYMENT_PENDING"]], ["Incubator", ["COHORT_ROUTING"]], ["Community", ["COMMUNITY_INVITE_READY"]], ["Impact", ["ACTIVE_PARTICIPANT"]]];
  return `<section class="wa-journey" aria-label="Journey stage"><div class="wa-journey-line"></div>${stages.map(([label, states]) => { const active = states.includes(current), passed = stages.findIndex(item => item[1].includes(current)) > stages.findIndex(item => item[0] === label); return `<span class="wa-journey-stage ${active ? "active" : ""} ${passed ? "passed" : ""}"><i></i><small>${label}</small></span>`; }).join("")}<span class="wa-journey-source">${tag(state.whatsapp.mode === "demo" ? "DEMO MODE" : "CONNECTED", "green")}</span></section>`;
}

export function renderWhatsAppFloating(state) {
  const active = state.whatsapp?.state && state.whatsapp.state !== "DISCOVERED" && state.whatsapp.state !== "ARCHIVED";
  return `<button class="wa-float" data-action="wa-open" aria-label="${active ? "Continue on WhatsApp" : "Ask Be the Change on WhatsApp"}"><span class="wa-float-mark">◔</span><span>${active ? "Continue on WhatsApp" : "Ask Be the Change"}</span></button>`;
}

function conversationHeader(state) {
  return `<div class="wa-phone-top"><div class="wa-brand-avatar">🌍</div><div><strong>Be the Change</strong><small>Demo conversation · ${esc(stateLabel(state.whatsapp.state))}</small></div><span class="wa-online"><i></i>local</span></div>`;
}
function messageList(state) { return `<div class="wa-message-list" aria-live="polite">${(state.whatsapp.messages || []).map(message => `<div class="wa-message ${message.direction === "in" ? "user" : "business"}"><p>${esc(message.text)}</p><time>${message.direction === "in" ? "You" : "Be the Change"}</time></div>`).join("")}</div>`; }
function quickReplies(items) { return `<div class="wa-quick-replies">${items.map(([label, action, data = ""]) => `<button class="wa-quick-reply" data-action="${action}" ${data ? `data-value="${esc(data)}"` : ""}>${esc(label)}</button>`).join("")}</div>`; }

function welcomeStep() {
  return `<div class="wa-step-copy"><div class="eyebrow">Message 01 · start small</div><h2>One clear next step.</h2><p>Start in this browser demo, then carry the same context into the existing Change Passport and Enterprise workspace.</p></div>${quickReplies([["Start a business", "wa-intent", "Start a business"], ["Grow my business", "wa-intent", "Grow my business"], ["Join the community", "wa-intent", "Join the community"], ["Become a mentor", "wa-intent", "Become a mentor"], ["Offer services", "wa-intent", "Offer services"], ["Continue application", "wa-intent", "Continue application"], ["Learn more", "wa-learn-more"]])}`;
}
function languageStep() {
  return `<div class="wa-step-copy"><div class="eyebrow">Message 02 · preferred language</div><h2>Which language feels best?</h2><p>Content falls back to English when a translation has not been reviewed. Untranslated copy is flagged for administrator review.</p><div class="wa-language-grid">${WHATSAPP_LANGUAGES.map(language => `<button class="wa-choice ${language === "English" ? "selected" : ""}" data-action="wa-language" data-value="${esc(language)}">${esc(language)}</button>`).join("")}</div></div>`;
}
function consentStep(state) {
  return `<div class="wa-step-copy"><div class="eyebrow">Message 03 · informed consent</div><h2>Here’s how this works.</h2><p>You are communicating with Be the Change. Messages may be processed automatically and stored in the Be the Change system. A human team member may review the conversation. Essential service messages are separate from optional marketing updates.</p><div class="wa-consent-points"><span>Type STOP or manage preferences at any time.</span><span>No emergency, legal, medical, or guaranteed-financing advice.</span><span>We ask only for information needed for the pathway.</span></div></div>${renderWhatsAppPhoneField("gateway",{})}<div class="wa-consent-actions">${btn("Read privacy summary", "wa-privacy-summary", "text")}${btn("Save optional WhatsApp details", "wa-save-number")}${btn("I agree and continue", "wa-consent", "primary")}${btn("Talk to a person", "wa-human")}${btn("Exit", "wa-opt-out")}</div>`;
}
function roleStep(state) {
  return `<div class="wa-step-copy"><div class="eyebrow">Message 04 · your role</div><h2>How would you like to participate?</h2><p>Choose one or more. This helps route you to the right support and community without creating duplicate profiles.</p></div><div class="wa-role-grid">${WHATSAPP_ROLES.map(([id, label]) => `<button class="wa-choice ${state.whatsapp.roles.includes(id) ? "selected" : ""}" data-action="wa-role" data-value="${id}" aria-pressed="${state.whatsapp.roles.includes(id)}">${esc(label)}</button>`).join("")}</div>${btn("Continue", "wa-role-next", "primary full")}`;
}
function identityStep(state) {
  const p = state.whatsapp.participant;
  return `<div class="wa-step-copy"><div class="eyebrow">Message 05 · just enough identity</div><h2>What should we call you?</h2><p>A preferred name is enough for this first pass. Age eligibility is a confirmation, not a birthdate.</p></div><div class="wa-mini-form"><label>Preferred name<input id="wa-name" data-wa-draft="participant.name" value="${esc(p.name)}" placeholder="Your preferred name" autocomplete="name" /></label><label>Age eligibility<select id="wa-age" data-wa-draft="participant.ageEligible"><option value="">Choose one</option><option value="yes" ${p.ageEligible === "yes" ? "selected" : ""}>I meet the program age eligibility</option><option value="no" ${p.ageEligible === "no" ? "selected" : ""}>I do not meet it</option><option value="unknown" ${p.ageEligible === "unknown" ? "selected" : ""}>I’m not sure</option></select></label><label>Accessibility or communication needs <span class="optional-label">optional</span><input id="wa-accessibility" data-wa-draft="participant.accessibility" value="${esc(p.accessibility)}" placeholder="Anything we should make easier?" /></label></div>${btn("Save and continue", "wa-identity-next", "primary full")}`;
}
function locationStep(state, ctx) {
  const l = state.whatsapp.location, countries = ctx.profileCountries || [];
  return `<div class="wa-step-copy"><div class="eyebrow">Message 06 · country context</div><h2>Where are you based?</h2><p>Country helps with routing. Region and city are optional, and we never require precise location or device location.</p></div><div class="wa-mini-form"><label>Country<select id="wa-country" data-wa-draft="location.country">${(countries.length ? countries : ["Ghana", "Liberia", "Nigeria", "Sierra Leone"]).map(country => `<option value="${esc(country)}" ${l.country === country ? "selected" : ""}>${countryFlag(country)} ${esc(country)}</option>`).join("")}</select></label><label>Region / state / county <span class="optional-label">optional</span><input id="wa-region" data-wa-draft="location.region" value="${esc(l.region)}" placeholder="Region, state, or county" /></label><label>City / community <span class="optional-label">optional</span><input id="wa-city" data-wa-draft="location.city" value="${esc(l.city)}" placeholder="City or community" /></label><label>Settlement context <select id="wa-settlement" data-wa-draft="location.settlementType"><option value="">Choose one</option><option ${l.settlementType === "Urban" ? "selected" : ""}>Urban</option><option ${l.settlementType === "Peri-urban" ? "selected" : ""}>Peri-urban</option><option ${l.settlementType === "Rural" ? "selected" : ""}>Rural</option></select></label></div>${btn("Save country context", "wa-location-next", "primary full")}`;
}
function ventureStep(state) {
  const v = state.whatsapp.venture;
  return `<div class="wa-step-copy"><div class="eyebrow">Message 07 · idea capture</div><h2>What are you building?</h2><p>Keep it short. Your original wording stays intact and can be edited later. Voice notes, photos, documents, and video can be added in the web workspace.</p></div><div class="wa-mini-form"><label>Stage<select id="wa-stage" data-wa-draft="venture.stage"><option value="">Choose one</option>${["Exploring an idea", "Testing with customers", "Existing small business", "Growing operations", "Cooperative or community project"].map(x => `<option ${v.stage === x ? "selected" : ""}>${x}</option>`).join("")}</select></label><label>Industry / category <span class="optional-label">optional</span><input id="wa-industry" data-wa-draft="venture.industry" value="${esc(v.industry)}" placeholder="e.g. food, logistics, education" /></label><label class="full-width">Short description<textarea id="wa-description" data-wa-draft="venture.description" placeholder="I want to…">${esc(v.description)}</textarea></label><label>Problem being solved <span class="optional-label">optional</span><input id="wa-problem" data-wa-draft="venture.problem" value="${esc(v.problem)}" placeholder="What needs to change?" /></label><label>Intended customers <span class="optional-label">optional</span><input id="wa-customers" data-wa-draft="venture.customers" value="${esc(v.customers)}" placeholder="Who is this for?" /></label><label>Team size <span class="optional-label">optional</span><input id="wa-team" data-wa-draft="venture.teamSize" value="${esc(v.teamSize)}" placeholder="e.g. just me, 3 people" /></label></div>${v.aiDraft ? `<div class="wa-ai-note"><strong>AI-proposed editable draft</strong><textarea data-wa-draft="aiDraft">${esc(v.aiDraft)}</textarea><span>Assumption: ${esc((state.whatsapp.aiAssumptions || []).join(", ") || "proposal only")}. Original wording remains unchanged.</span></div>` : btn("Offer an AI clarification draft", "wa-ai-enhance", "text")}${btn("Save idea", "wa-venture-next", "primary full")}${btn("Keep my original wording", "wa-keep-original", "text")}`;
}
function impactStep(state) {
  const v = state.whatsapp.venture, selected = state.whatsapp.sdgs;
  return `<div class="wa-step-copy"><div class="eyebrow">Message 08 · SDG routing</div><h2>Which change matters most?</h2><p>We’ll suggest up to three possible connections. These are working hypotheses, not UN endorsement or impact claims. Confirm or change them.</p>${v.industry || v.description ? `<div class="wa-ai-note"><strong>Possible relevance</strong><span>${esc(v.industry || v.description.slice(0, 90))} may connect to enterprise, skills, and local opportunity. Review before saving.</span></div>` : ""}</div><div class="wa-sdg-grid">${WHATSAPP_SDG_OPTIONS.map(([id, name, why]) => `<button class="wa-sdg-choice ${selected.includes(id) ? "selected" : ""}" data-action="wa-sdg" data-value="${id}" aria-pressed="${selected.includes(id)}"><strong>${id}</strong><span>${esc(name)}</span><small>${esc(why)}</small></button>`).join("")}</div>${btn("Confirm impact pathway", "wa-impact-next", "primary full")}`;
}
function needsStep(state) {
  return `<div class="wa-step-copy"><div class="eyebrow">Message 09 · support needs</div><h2>What would help next?</h2><p>Pick the support that should activate existing Be the Change tools. You can change this later.</p></div><div class="wa-needs-grid">${WHATSAPP_NEEDS.map(need => `<button class="wa-choice ${state.whatsapp.needs.includes(need) ? "selected" : ""}" data-action="wa-need" data-value="${esc(need)}" aria-pressed="${state.whatsapp.needs.includes(need)}">${esc(need)}</button>`).join("")}</div>${btn("Build my starting profile", "wa-needs-next", "primary full")}`;
}
function handoffStep(state) {
  const w = state.whatsapp, p = w.participant, v = w.venture, l = w.location;
  return `<div class="wa-step-copy"><div class="eyebrow">Message 10 · review and handoff</div><h2>Your starting profile is ready.</h2><p>Open your Be the Change workspace to review the information, see your initial roadmap, and edit anything before submitting. Nothing is submitted automatically.</p></div><div class="wa-review-grid"><div><span>Preferred name</span><strong>${esc(p.name || "Not set")}</strong></div><div><span>Country</span><strong>${esc(l.country || "Not set")}</strong></div><div><span>Role</span><strong>${esc(w.roles.map(labelForRole).join(", ") || "Not set")}</strong></div><div><span>Idea stage</span><strong>${esc(v.stage || "Not set")}</strong></div><div class="full-width"><span>Original idea</span><strong>${esc(v.description || "Not set")}</strong></div><div class="full-width"><span>Support needs</span><strong>${esc(w.needs.join(", ") || "Not set")}</strong></div></div><div class="wa-handoff-actions">${btn("Open my workspace", "wa-open-workspace", "primary")}${btn("Keep answering here", "wa-pause")}${btn("Talk to a guide", "wa-human")}</div><div class="wa-handoff-note">${tag("Imported from your WhatsApp conversation", "green")} <span>Demo handoff · local session only</span></div>`;
}
function stepContent(state, ctx) {
  const w = state.whatsapp;
  if (w.state === "DISCOVERED") return welcomeStep();
  if (w.state === "LANGUAGE_SELECTED") return languageStep();
  if (w.state === "CONSENT_PENDING") return consentStep(state);
  if (w.state === "ROLE_SELECTED") return roleStep(state);
  if (w.state === "IDENTITY_STARTED") return identityStep(state);
  if (w.state === "LOCATION_STARTED") return locationStep(state, ctx);
  if (w.state === "VENTURE_STARTED") return ventureStep(state);
  if (w.state === "IMPACT_STARTED") return impactStep(state);
  if (w.state === "NEEDS_ASSESSED" || w.state === "ACCOUNT_LINK_PENDING" || w.state === "WEB_HANDOFF_CREATED") return handoffStep(state);
  if (w.state === "OPTED_OUT") return `<div class="wa-step-copy"><div class="eyebrow">Communication preference</div><h2>You’re opted out.</h2><p>Essential service messages are stopped in this demo. You can request to start again from a future WhatsApp conversation where appropriate.</p></div>${btn("Start again", "wa-reset", "primary")}`;
  return `<div class="wa-step-copy"><div class="eyebrow">${esc(stateLabel(w.state))}</div><h2>Your journey is saved.</h2><p>Return to WhatsApp or open the workspace when you’re ready. Live status comes only from connected records.</p></div>${btn("Continue in workspace", "wa-open-workspace", "primary")}`;
}

function sourceCards(state) {
  const w = state.whatsapp;
  return `<section class="wa-source-panel panel-soft"><div><div class="eyebrow">Safe entry link</div><h3>${esc(sourceLabel(w.source))}</h3><p>Use a signed state token in production. This demo uses only the safe campaign code <code>${esc(w.campaignCode)}</code>; no personal data is placed in the URL.</p><div class="wa-short-link"><code>${esc(safeLink(state))}</code><button class="btn small" data-action="wa-copy-link">Copy link</button></div><div class="wa-share-actions"><button class="btn small" data-action="wa-reminders">${w.communication.frequency === "Service and milestone reminders" ? "Reminders on" : "Get reminders on WhatsApp"}</button><button class="btn small" data-action="wa-share">Share with a future entrepreneur</button><button class="btn small" data-action="wa-human">Contact a human guide</button></div></div><div class="wa-qr-block">${qrCode(w.campaignCode)}<button class="btn small" data-action="wa-qr-open">Desktop QR</button></div></section>`;
}

export function renderWhatsAppGateway(state, ctx = {}) {
  const w = state.whatsapp, pct = progressPercent(state);
  return `<div class="wa-page"><div class="wa-page-head"><div><div class="eyebrow">WhatsApp Gateway · conversational entrance</div><h1 class="section-title">Start with one message.</h1><p class="section-copy">A low-bandwidth, one-question-at-a-time path into the existing Be the Change workspace. Your answers map into the Change Passport and Enterprise draft instead of creating duplicate records.</p></div><div class="wa-head-actions">${tag("DEMO MODE", "green")}${btn(w.state === "DISCOVERED" ? "Open WhatsApp" : "Continue on WhatsApp", "wa-open-external", "primary")}</div></div>${journeyMarkup(state)}<div class="wa-gateway-layout"><section class="wa-phone panel" aria-label="Simulated WhatsApp conversation">${conversationHeader(state)}${messageList(state)}<div class="wa-progress"><div><span>Onboarding progress</span><strong>${pct}%</strong></div><div class="wa-progress-track"><i style="width:${pct}%"></i></div></div><div class="wa-interaction">${stepContent(state, ctx)}</div></section><aside class="wa-side-stack"><section class="panel wa-state-card"><div class="eyebrow">Current state</div><h2>${esc(stateLabel(w.state))}</h2><p>${esc(WHATSAPP_STATES.find(([code]) => code === w.state)?.[2] || "Saved locally")}</p><div class="wa-state-meta"><span>Source<strong>${esc(sourceLabel(w.source))}</strong></span><span>Language<strong>${esc(w.language)}</strong></span><span>Updated<strong>${new Date(w.lastUpdated || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></span></div></section><section class="panel wa-map-card"><div class="eyebrow">Mapped into existing app</div><h3>One record, two channels.</h3><div class="wa-mapping-list"><span><i>01</i> Change Passport <b>${w.participant.name || w.location.country ? "Prefill ready" : "Waiting"}</b></span><span><i>02</i> Enterprise venture <b>${w.venture.description ? "Idea captured" : "Waiting"}</b></span><span><i>03</i> SDG pathway <b>${w.sdgs.length ? `${w.sdgs.length} reviewed` : "Waiting"}</b></span><span><i>04</i> Roadmap and costs <b>Existing tools</b></span></div>${btn("Open Enterprise workspace", "wa-open-enterprise", "small")}</section>${sourceCards(state)}</aside></div>${w.qrOpen ? `<div class="wa-qr-overlay" data-action="wa-qr-close"><div class="wa-qr-modal" role="dialog" aria-modal="true" aria-label="Campaign QR code"><button class="close-btn" data-action="wa-qr-close" aria-label="Close">×</button><div class="eyebrow">Campaign entry · ${esc(w.campaignCode)}</div>${qrCode(w.campaignCode)}<h3>Scan to start in WhatsApp</h3><p>Safe code only. Live business number is configured server-side.</p>${btn("Copy short link", "wa-copy-link", "primary")}</div></div>` : ""}</div>`;
}

function emptyProduction(label) { return `<div class="wa-empty"><strong>No production ${esc(label)} yet.</strong><span>Connect the protected backend and record a real event before this view can show data.</span></div>`; }
const whatsappAdminRuntime = { metrics:null, connections:[], conversations:[], health:null, loaded:false, loading:false, error:"" };
const WA_ADMIN_TABS = ["Dashboard", "Connections", "Conversations", "Users", "Onboarding", "Message Composer", "Templates", "Automations", "Campaigns", "Communities", "Support Queue", "Consent", "Delivery and Errors", "Integration Health", "Settings", "Audit Log", "Demo Sandbox"];
const WA_ADMIN_ALIASES = { Overview:"Dashboard", "Onboarding Funnel":"Onboarding", Participants:"Users", "Campaigns and QR Codes":"Campaigns", "Message Templates":"Templates", "WhatsApp Flows":"Settings", "Human Support Queue":"Support Queue", "Consent and Privacy":"Consent", Integrations:"Integration Health", Diagnostics:"Integration Health" };
function normaliseAdminTab(value) { return WA_ADMIN_ALIASES[value] || (WA_ADMIN_TABS.includes(value) ? value : "Dashboard"); }
function adminTabs(state) { const selected = normaliseAdminTab(state.whatsapp.adminTab); return `<div class="wa-admin-tabs">${WA_ADMIN_TABS.map(tab => `<button class="${selected === tab ? "active" : ""}" data-action="wa-admin-tab" data-value="${esc(tab)}">${esc(tab)}</button>`).join("")}</div>`; }
function adminOverview(state) {
  const source = whatsappAdminRuntime.metrics?.metrics || {}, metrics = [[source.contacts ?? "—", "Total WhatsApp contacts"], [source.connected ?? "—", "Connected app users"], [source.provisional ?? "—", "Provisional contacts"], [source.verified ?? "—", "Verified numbers"], [source.marketing ?? "—", "Marketing opt-ins"], [source.failures ?? "—", "Failed messages"]];
  const productionReady = whatsappAdminRuntime.health?.mode === "production";
  return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Dashboard · production dataset only</div><h2>WhatsApp Control Center</h2><p>No analytics are invented here. Demo events remain isolated in Demo Sandbox. Every metric uses production events only.</p></div>${tag(productionReady ? "Production" : "Demo mode", productionReady ? "green" : "gold")}</div><div class="grid grid-3 wa-admin-metrics">${metrics.map(([value, label]) => `<article class="panel-soft"><strong>${value}</strong><span>${label}</span></article>`).join("")}</div><div class="wa-admin-empty-grid"><section class="panel-soft">${whatsappAdminRuntime.metrics?.empty ? emptyProduction("production events") : `<div class="wa-definition-list"><strong>Metric definitions</strong><span>Contacts count production conversations; connected users require a linked provider identity; delivery counts come from Meta status events.</span></div>`}</section><section class="panel-soft"><div class="eyebrow">Operational status</div><h3>${esc(whatsappAdminRuntime.health?.status || "Configuration incomplete")}</h3><p>${esc(whatsappAdminRuntime.health?.mode === "production" ? "Real provider events are eligible for reporting." : "No real messages are being sent or received.")}</p></section><section class="panel-soft"><div class="eyebrow">Next safe action</div><h3>Review Integration Health</h3><p>Configuration presence is shown without exposing provider secrets.</p><button class="btn small" data-action="wa-admin-tab" data-value="Integration Health">View health</button></section></div>`;
}
function templateManager() { const templates = [["welcome_opt_in", "Utility", "Welcome after explicit opt-in"], ["secure_workspace_link", "Authentication", "Secure workspace link"], ["application_submitted", "Utility", "Application submitted"], ["mentor_session", "Utility", "Upcoming mentor session"], ["payment_confirmation", "Utility", "Payment confirmation"], ["community_invitation", "Utility", "Community invitation"], ["feedback_request", "Marketing", "Participant feedback request"]]; return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Message Template Manager</div><h2>Reviewable concepts, not Meta approvals.</h2><p>Approval status stays honest until a real Meta API response exists. Promotional templates require marketing opt-in.</p></div>${btn("Add template", "wa-template-add", "small primary")}</div><div class="wa-template-list">${templates.map(([name, category, body]) => `<article class="panel-soft"><div>${tag(category, category === "Marketing" ? "coral" : "green")}<h3>${esc(body)}</h3><p><code>${name}</code> · English · variables: preferred_name, secure_link</p></div><span class="wa-status-pill">DRAFT</span></article>`).join("")}</div>`; }
function flowSpec() { const json = JSON.stringify({ version: "prototype-blueprint-1", screens: WHATSAPP_FLOW_BLUEPRINT }, null, 2); return `<div class="wa-admin-panel-head"><div><div class="eyebrow">WhatsApp Flows · export view</div><h2>Short, mobile-first screens.</h2><p>This is a structured specification for protected backend publication. The browser does not publish a Flow to Meta.</p></div>${btn("Copy Flow Specification", "wa-copy-flow", "small primary")}</div><pre class="wa-json-view" id="wa-flow-json">${esc(json)}</pre>`; }
function communityAdmin(state) { const hasFit = state.whatsapp.location.country || state.whatsapp.language || state.whatsapp.sdgs.length; return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Community routing</div><h2>Recommend, never silently add.</h2><p>Invitation destinations are controlled, replaceable, and separate from invitation opened or self-reported joined.</p></div></div>${hasFit ? `<div class="wa-community-grid"><article class="panel-soft"><div>${tag("Recommendation", "green")}<h3>${esc(state.whatsapp.location.country || "Country")} · ${esc(state.whatsapp.language)} community</h3><p>Recommended because your captured pathway is local, language-aware, and connected to ${esc(state.whatsapp.sdgs.map(labelForSdg).join(", ") || "a Global Goals interest")}.</p><div class="wa-community-meta"><span>Purpose<strong>Peer learning and referrals</strong></span><span>Privacy<strong>Controlled invite · rules shown first</strong></span><span>Frequency<strong>Set by moderators</strong></span></div>${btn(state.whatsapp.communityInvitation === "REQUESTED" ? "Request recorded" : "Request invitation", "wa-community-request", "small primary")}</article></div>` : emptyProduction("community recommendations")}`; }
function consentAdmin(state) { return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Consent and privacy</div><h2>Service access is not marketing access.</h2><p>Every consent record needs a timestamp, source, language, and withdrawal event. Phone numbers are normalized and masked server-side.</p></div></div><div class="wa-privacy-grid"><section class="panel-soft"><h3>Participant controls</h3><ul><li>STOP / UNSUBSCRIBE and localized equivalents</li><li>Quiet hours based on editable time zone</li><li>Data export, correction, deletion requests</li><li>Retention policy shown before sensitive capture</li></ul></section><section class="panel-soft"><h3>Current demo record</h3><div class="wa-consent-status"><span>Service consent<strong>${state.whatsapp.consent.service === true ? "Accepted" : "Not accepted"}</strong></span><span>Marketing consent<strong>${state.whatsapp.consent.marketing === true ? "Accepted" : "Not accepted"}</strong></span><span>Source<strong>${esc(state.whatsapp.consent.source)}</strong></span></div></section></div>`; }
function integrationsAdmin() { const providers = ["Stripe", "PayPal", "Flutterwave", "Paystack", "Orange Money", "MTN Mobile Money", "M-Pesa", "Bank transfer", "Cash / agent", "Sponsored enrollment"]; return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Integrations · honest disconnected states</div><h2>Protected connections.</h2><p>Provider availability is configuration-driven. Secrets never enter browser code, localStorage, demo fixtures, or URLs.</p></div>${tag("Backend required", "gold")}</div><div class="wa-integration-list">${providers.map(name => `<div class="panel-soft"><span>${esc(name)}</span>${tag("Not configured", "gold")}</div>`).join("")}</div><div class="wa-env-list"><strong>Protected environment bindings</strong><span>${WHATSAPP_REQUIRED_ENV.join(" · ")}</span></div>`; }
function campaignAdmin(state) { const code = state.whatsapp.campaignCode || "BTC-LANDING"; return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Campaigns and QR Codes</div><h2>Give every doorway a safe source.</h2><p>Only a non-sensitive campaign identifier is encoded. A real business number and any signed session token remain server-side.</p></div>${tag("No personal data in QR", "green")}</div><div class="wa-campaign-editor panel-soft"><label>Campaign code<input data-wa-draft="campaignCode" value="${esc(code)}" maxlength="40" placeholder="BTC-EVENT-ACCRA" /></label><div class="wa-campaign-preview">${qrCode(code)}<div><strong>${esc(code)}</strong><span>Source attribution: administrator campaign</span><button class="btn small" data-action="wa-campaign-generate">Save campaign code</button></div></div></div>`; }
function diagnosticsAdmin() { return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Diagnostics</div><h2>Connection checks.</h2><p>Checks report presence and state, never secret values. Browser demo stays usable when production is disconnected.</p></div></div><div class="wa-diagnostic-list">${[["Cloud API provider", "Disconnected"], ["Webhook signature verification", "Backend required"], ["Deduplication store", "Backend required"], ["Signed handoff", "Prototype local adapter"], ["Payment webhooks", "Existing Stripe adapter · configuration required"], ["Translation review queue", "No records yet"]].map(([key, value]) => `<div><span>${esc(key)}</span>${tag(value, value.includes("Prototype") ? "green" : "gold")}</div>`).join("")}</div>`; }
export async function loadWhatsAppAdminData(force = false) {
  if (whatsappAdminRuntime.loading || (whatsappAdminRuntime.loaded && !force)) return;
  whatsappAdminRuntime.loading = true; whatsappAdminRuntime.error = "";
  try {
    const [healthResponse, metricsResponse, connectionsResponse, conversationsResponse] = await Promise.all([
      fetch("/api/admin/whatsapp/health",{headers:{accept:"application/json"}}),
      fetch("/api/admin/whatsapp/metrics",{headers:{accept:"application/json"}}),
      fetch("/api/admin/whatsapp/connections",{headers:{accept:"application/json"}}),
      fetch("/api/admin/whatsapp/conversations",{headers:{accept:"application/json"}}),
    ]);
    whatsappAdminRuntime.health = await healthResponse.json().catch(() => null);
    whatsappAdminRuntime.metrics = await metricsResponse.json().catch(() => null);
    whatsappAdminRuntime.connections = await connectionsResponse.json().catch(() => []);
    whatsappAdminRuntime.conversations = await conversationsResponse.json().catch(() => []);
    if (!healthResponse.ok && !metricsResponse.ok) whatsappAdminRuntime.error = "WhatsApp Control Center data is unavailable.";
  } catch (_) { whatsappAdminRuntime.error = "WhatsApp Control Center data is temporarily unavailable."; }
  whatsappAdminRuntime.loaded = true; whatsappAdminRuntime.loading = false;
}
function connectionsAdmin() {
  const rows = whatsappAdminRuntime.connections || [];
  return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Connections · masked by default</div><h2>Who actually connected.</h2><p>Number provided, verified, conversation started, and account connected are separate production states.</p></div><button class="btn small" data-action="wa-admin-refresh">Refresh</button></div><div class="wa-connection-filters"><input data-wa-connection-search placeholder="Search user, country, or status" aria-label="Search WhatsApp connections" /></div><div class="data-table-wrap"><table class="data-table wa-connection-table"><thead><tr><th>User</th><th>Number</th><th>Country</th><th>Verification</th><th>Connection</th><th>Consent</th><th>Last interaction</th><th>Cases</th></tr></thead><tbody>${rows.length ? rows.map(row => `<tr><td><strong>${esc(row.user)}</strong><small class="table-note">${esc(row.userId)}</small></td><td>${esc(row.maskedNumber || "Not provided")}</td><td>${esc(row.country || "—")}</td><td>${tag(row.verificationStatus || "not_provided", row.verificationStatus === "verified" ? "green" : "gold")}</td><td>${tag(row.connectionStatus || "never_contacted", row.connectionStatus === "connected" ? "green" : "gold")}</td><td>${tag(row.consentStatus || "not_requested", row.consentStatus === "service_and_marketing" ? "green" : "gold")}</td><td>${esc(row.lastInteraction || "Not recorded")}</td><td>${Number(row.openSupportCases || 0)}</td></tr>`).join("") : `<tr><td colspan="8">${emptyProduction("connections")}</td></tr>`}</tbody></table></div>`;
}
function conversationsAdmin() {
  const rows = whatsappAdminRuntime.conversations || [];
  return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Conversations · production inbox</div><h2>Conversation routing</h2><p>Participant messages, automation, human support, consent, and delivery events remain distinct.</p></div><button class="btn small" data-action="wa-admin-refresh">Refresh</button></div><div class="wa-conversation-list">${rows.length ? rows.map(row => `<article class="panel-soft wa-conversation-row"><div><strong>${esc(row.queueCategory)}</strong><span>${esc(row.status)} · ${esc(row.onboardingStage)}</span></div><div><small>${esc(row.userId || row.provisionalContactId || "Provisional contact")}</small><time>${esc(row.updatedAt || "")}</time></div></article>`).join("") : emptyProduction("conversations")}</div>`;
}
function messageComposerAdmin() {
  return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Message Composer · permission checked server-side</div><h2>Send a permitted message.</h2><p>Consent, connection status, templates, service window, quiet hours, and administrator reason are validated by the backend.</p></div></div><form class="wa-composer-form" data-wa-composer-form><label>User ID<input name="targetUserId" required placeholder="Authenticated user ID" /></label><label>Category<select name="category"><option value="service">Service</option><option value="marketing">Marketing</option><option value="authentication">Authentication</option></select></label><label>Approved template name<input name="templateName" placeholder="Required outside the service window" /></label><label class="full-width">Message body<textarea name="body" maxlength="4000" placeholder="Message or template context"></textarea></label><label class="full-width">Reason<input name="reason" required placeholder="Why is this message permitted and necessary?" /></label><button class="btn small primary" type="submit">Send through backend</button><div class="form-feedback" data-wa-composer-feedback role="status"></div></form>`;
}
function sandboxAdmin(state, ctx) { const scenarios = ["New entrepreneur", "Existing business", "Mentor", "Vendor", "Partner", "Returning participant", "Unsupported response", "Voice-note transcript approval", "AI enhancement rejected", "Payment pending", "Payment success", "Human escalation", "Community recommendation", "Opt-out", "Expired handoff link", "Duplicate webhook"]; return `<div class="wa-admin-panel-head"><div><div class="eyebrow">Demo Sandbox · isolated records</div><h2>Test the journey safely.</h2><p class="wa-demo-banner">DEMONSTRATION DATA — NOT A REAL PARTICIPANT, PAYMENT OR WHATSAPP CONVERSATION</p></div></div><div class="wa-sandbox-layout"><section class="wa-sandbox-phone panel"><div class="wa-phone-top"><div class="wa-brand-avatar">🌍</div><div><strong>Be the Change</strong><small>Sandbox simulator</small></div>${tag("DEMO", "green")}</div><div class="wa-sandbox-chat">${(state.whatsapp.sandboxEvents || []).length ? state.whatsapp.sandboxEvents.map(item => `<div class="wa-sandbox-event"><span>${esc(item.actor)}</span><p>${esc(item.text)}</p><small>${esc(item.state)}</small></div>`).join("") : `<div class="wa-empty"><strong>Select a scenario.</strong><span>Simulated records stay in this sandbox.</span></div>`}</div></section><section class="panel wa-sandbox-controls"><label>Scenario<select data-wa-scenario>${scenarios.map(item => `<option ${state.whatsapp.sandboxScenario === item ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label><div class="wa-sandbox-actions">${btn("Run scenario", "wa-run-scenario", "primary")}${btn("Reset sandbox", "wa-reset-sandbox")}</div><div class="wa-sandbox-data"><div><span>Current state</span><strong>${esc(stateLabel(state.whatsapp.state))}</strong></div><div><span>Captured data</span><strong>${state.whatsapp.participant.name || state.whatsapp.venture.description || "None"}</strong></div><div><span>Next transition</span><strong>${state.whatsapp.state === "WEB_HANDOFF_CREATED" ? "APPLICATION_IN_PROGRESS" : "User-controlled"}</strong></div></div></section></div>`; }
function implementationReport() { const rows = [["Existing components reused", "Change Passport, Enterprise venture/cost readiness, course/mentor/partner/funding/shop routes, local draft persistence, owner admin shell"], ["New components", "WhatsApp Gateway, phone-frame demo, journey strip, QR entry, handoff review, community fit, templates, Flow blueprint, sandbox, diagnostics"], ["Mapped fields", "Preferred name → passport.name; country/city → passport.country/city; role → onboarding role; idea/stage/industry/need → enterprise venture draft; SDGs → enterprise alignment"], ["States", `${WHATSAPP_STATES.length} required states available in the local state machine`], ["Demo scenarios", "New entrepreneur, returning participant, unsupported response, transcript approval, AI rejection, payment pending/success, human, community, opt-out, expired handoff, duplicate webhook"], ["Production endpoints", "Webhook GET/POST, send, templates, Flow exchange, onboarding session/handoff/link-account, community, payments, human handoff, health"], ["Remaining production actions", "Configure Meta app and approved templates, publish Flow server-side, connect signed identity handoff, payment credentials/webhooks, privacy/security review, real analytics" ]]; return `<div class="wa-report"><div class="eyebrow">Administrator implementation report</div><h2>What is ready and what still needs a protected connection.</h2><div class="wa-report-table">${rows.map(([key, value]) => `<div><strong>${esc(key)}</strong><span>${esc(value)}</span></div>`).join("")}</div></div>`; }
function implementationReportV2() {
  const rows = [
    ["Existing components reused", "Change Passport, Enterprise workspace, /join, profile, /whatsapp, owner admin shell, existing demo sandbox"],
    ["New components added", "Protected reusable phone field, consent controls, masked connections, secure codes, Control Center, provider adapter, additive schema"],
    ["Routes and forms modified", "/join, profile editing, Communication Preferences, /whatsapp onboarding, existing WhatsApp Gateway slot"],
    ["Database migrations required", "Additive WhatsApp profile, identity, code, consent, messaging, automation, campaign, role, audit, integration tables and support-case columns"],
    ["Backend endpoints implemented", "Webhook, profile/preferences/consent, connect-code create/confirm, disconnect, export/deletion, admin health/metrics/connections/conversations/messages/templates/pause/resume/audit/reveal"],
    ["Meta configuration required", "Cloud API credentials, phone/business IDs, webhook subscription, and approved utility/authentication/marketing templates"],
    ["Environment variables required", WHATSAPP_REQUIRED_ENV.join(" · ")],
    ["Security safeguards implemented", "AES-GCM, HMAC lookup hashes, server E.164 normalization, masking, signature checks, deduplication, consent/template/window gates, RBAC hooks, reveal audit, dataset separation"],
    ["Tests passed", "JavaScript syntax and additive integration checks; provider acceptance tests remain required"],
    ["Remaining production activation steps", "Protected bindings, webhook verification, bounded outbox consumer, template approval, privacy/security/accessibility/safeguarding review, canary, production enablement"],
  ];
  return `<div class="wa-report"><div class="eyebrow">Administrator implementation report</div><h2>What is ready and what still needs a protected connection.</h2><div class="wa-report-table">${rows.map(([key,value]) => `<div><strong>${esc(key)}</strong><span>${esc(value)}</span></div>`).join("")}</div></div>`;
}
export function renderWhatsAppAdmin(state, ctx = {}) {
  const tab = normaliseAdminTab(state.whatsapp.adminTab);
  let body = adminOverview(state);
  if (tab === "Connections") body = connectionsAdmin();
  if (tab === "Conversations") body = conversationsAdmin();
  if (tab === "Message Composer") body = messageComposerAdmin();
  if (tab === "Templates") body = templateManager();
  if (tab === "Campaigns") body = campaignAdmin(state);
  if (tab === "Communities") body = communityAdmin(state);
  if (tab === "Consent") body = consentAdmin(state);
  if (tab === "Integration Health") body = diagnosticsAdmin();
  if (tab === "Demo Sandbox") body = sandboxAdmin(state, ctx);
  if (tab === "Users") body = connectionsAdmin();
  if (tab === "Onboarding") body = `<div class="wa-admin-panel-head"><div><div class="eyebrow">Onboarding · production funnel</div><h2>Continue incomplete journeys.</h2><p>Stages advance from real inbound events and secure handoffs only.</p></div></div>${emptyProduction("onboarding funnel")}`;
  if (tab === "Support Queue") body = `<div class="wa-admin-panel-head"><div><div class="eyebrow">Support Queue</div><h2>Human approval is the feature.</h2><p>Cases are empty until a real participant or demo sandbox scenario creates one.</p></div></div>${emptyProduction("support cases")}`;
  if (["Automations", "Settings", "Audit Log", "Delivery and Errors"].includes(tab)) body = `<div class="wa-admin-panel-head"><div><div class="eyebrow">${esc(tab)}</div><h2>${esc(tab)} stays evidence-led.</h2><p>Production records appear here only after the protected backend records real events.</p></div></div>${emptyProduction(tab.toLowerCase())}`;
  return `<div class="admin-page wa-admin-page"><div class="admin-topline"><div><button class="btn text" data-route="home">← Back to app</button><div class="eyebrow">Restricted workspace · WhatsApp Control Center</div><h1>WhatsApp Control Center</h1><p>One protected workspace for conversational onboarding, connections, consent, delivery, support, and provider health.</p></div><div class="admin-permission">${tag("Role-based access", "violet")}<small>Production mutations require server-side authorization.</small></div></div><div class="admin-shell"><aside class="panel admin-nav wa-admin-nav" aria-label="WhatsApp Control Center tabs">${adminTabs(state)}</aside><main class="admin-main"><section class="panel admin-workspace wa-admin-workspace">${body}</section><section class="panel admin-workspace">${implementationReportV2()}</section></main></div></div>`;
}

export function bindWhatsAppInputs(state, ctx = {}) {
  bindWhatsAppPhoneField("gateway",()=>{});
  document.querySelectorAll("[data-wa-draft]").forEach(input => {
    const path = input.dataset.waDraft.split(".");
    const onChange = () => { let target = state.whatsapp; for (let i = 0; i < path.length - 1; i++) target = target[path[i]]; target[path[path.length - 1]] = input.value; localSave(state, ctx); };
    input.addEventListener("input", onChange); input.addEventListener("change", onChange);
  });
  document.querySelector("[data-wa-scenario]")?.addEventListener("change", event => { state.whatsapp.sandboxScenario = event.target.value; localSave(state, ctx); });
  document.querySelector("[data-wa-composer-form]")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, feedback = form.querySelector("[data-wa-composer-feedback]"), payload = Object.fromEntries(new FormData(form).entries());
    if (feedback) feedback.textContent = "Sending through the protected backend…";
    try {
      const response = await fetch("/api/admin/whatsapp/messages",{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(payload)}), result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Message could not be sent.");
      if (feedback) feedback.textContent = `Message recorded with status ${result.status || "sent"}.`;
      form.reset();
    } catch (error) { if (feedback) feedback.textContent = error.message; }
  });
}

export async function handleWhatsAppAction(action, el, state, ctx = {}) {
  const w = state.whatsapp;
  if (!w) return false;
  if (action === "wa-open") { const sourceByView = { enterprise: "business_calculator", shop: "marketplace", sports: "marketplace", education: "course", course: "course", partners: "partner", funding: "grant", community: "community_page" }; w.source = sourceByView[state.view] || "landing_page"; ctx.navigate?.("whatsapp"); return true; }
  if (action === "wa-open-external") { window.open(safeLink(state), "_blank", "noopener,noreferrer"); pushMessage(state, "out", "A safe START link was opened. In production, the phone number is configured server-side.", "external-open"); localSave(state, ctx); return true; }
  if (action === "wa-intent") { pushMessage(state, "in", el.dataset.value || "Start a business"); pushMessage(state, "out", "Great — I’ll ask one thing at a time and save progress after each answer."); setState(state, "LANGUAGE_SELECTED", 1, ctx); return true; }
  if (action === "wa-learn-more") { pushMessage(state, "in", "Learn more"); pushMessage(state, "out", "Be the Change connects ideas, skills, training, enterprise tools, mentors, community, and evidence. You stay in control of what is shared."); return true; }
  if (action === "wa-language") { w.language = el.dataset.value || "English"; w.communication.language = w.language; pushMessage(state, "in", w.language); pushMessage(state, "out", `Thanks — we’ll use ${w.language} where reviewed, with a safe English fallback. Next, please review consent.`); setState(state, "CONSENT_PENDING", 2, ctx); return true; }
  if (action === "wa-privacy-summary") { pushMessage(state, "out", "Privacy summary: service messages need your agreement; marketing is optional; humans may review; STOP or privacy requests remain available. No passwords, PINs, card details, or unnecessary IDs are requested."); ctx.toast?.("Privacy summary shown", "Service and marketing consent stay separate."); return true; }
  if (action === "wa-save-number") {
    const values=readWhatsAppPhoneField("gateway");
    if(!values||values.whatsappAvailable===null){ctx.toast?.("No number saved", "Leave the optional field blank or choose ‘I do not use WhatsApp’. ");return true;}
    fetch("/api/whatsapp/profile",{method:"PUT",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(values)}).then(async response=>{const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Sign in to save this number securely.");if(values.whatsappAvailable===true){const consent=await fetch("/api/whatsapp/consent",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({service:values.service,marketing:values.marketing,source:"whatsapp_onboarding",languageVersion:"whatsapp-consent-v1"})});if(!consent.ok)throw new Error((await consent.json().catch(()=>({}))).error||"Consent could not be saved.");}ctx.toast?.("WhatsApp details saved", "The number remains unverified until a real provider event confirms control.");}).catch(error=>ctx.toast?.("Number not saved",error.message));
    return true;
  }
  if (action === "wa-consent") { const values=readWhatsAppPhoneField("gateway"); if(values&&!values.service){ctx.toast?.("Service consent required", "Marketing remains optional and separate.");return true;} w.consent = { service: true, marketing: Boolean(values?.marketing), at: new Date().toISOString(), source: "web_demo" }; pushMessage(state, "in", "I agree and continue"); pushMessage(state, "out", "Thank you. You can change communication preferences later. Which role fits you?"); setState(state, "ROLE_SELECTED", 3, ctx); return true; }
  if (action === "wa-human") { w.state = "HUMAN_SUPPORT"; pushMessage(state, "in", "Talk to a person"); pushMessage(state, "out", "A human support case is requested. No response time or assignment is invented in demo mode."); localSave(state, ctx); ctx.toast?.("Human support requested", "The case is visible in the demo sandbox."); ctx.render?.(); return true; }
  if (action === "wa-opt-out") { w.consent.service = false; w.consent.marketing = false; w.state = "OPTED_OUT"; pushMessage(state, "in", "STOP"); pushMessage(state, "out", "You are opted out. No promotional messages will be sent."); localSave(state, ctx); return true; }
  if (action === "wa-role") { const role = el.dataset.value; w.roles = w.roles.includes(role) ? w.roles.filter(item => item !== role) : [...w.roles, role].slice(0, 5); localSave(state, ctx); ctx.render?.(); return true; }
  if (action === "wa-role-next") { if (!w.roles.length) { ctx.toast?.("Choose a role", "You can choose more than one role."); return true; } pushMessage(state, "in", w.roles.map(labelForRole).join(", ")); pushMessage(state, "out", "Thanks. What should we call you for this first profile?"); setState(state, "IDENTITY_STARTED", 4, ctx); return true; }
  if (action === "wa-identity-next") { const name = document.getElementById("wa-name")?.value.trim(); const age = document.getElementById("wa-age")?.value; if (!name || !age) { ctx.toast?.("A little more is needed", "Add a preferred name and age-eligibility confirmation."); return true; } w.participant.name = name; w.participant.ageEligible = age; w.participant.accessibility = document.getElementById("wa-accessibility")?.value.trim() || ""; pushMessage(state, "in", name); pushMessage(state, "out", "Saved. Country context helps us route local support; precise location is not required."); setState(state, "LOCATION_STARTED", 5, ctx); return true; }
  if (action === "wa-location-next") { const country = document.getElementById("wa-country")?.value; if (!country) { ctx.toast?.("Choose a country", "Use a country from the verified list."); return true; } w.location = { ...w.location, country, region: document.getElementById("wa-region")?.value.trim() || "", city: document.getElementById("wa-city")?.value.trim() || "", settlementType: document.getElementById("wa-settlement")?.value || "" }; pushMessage(state, "in", country); pushMessage(state, "out", "Country context saved. Now share the smallest useful description of your idea."); setState(state, "VENTURE_STARTED", 6, ctx); return true; }
  if (action === "wa-venture-next") { const stage = document.getElementById("wa-stage")?.value; const description = document.getElementById("wa-description")?.value.trim(); if (!stage || !description) { ctx.toast?.("Add the basics", "Choose a stage and describe the idea in your own words."); return true; } w.venture = { ...w.venture, stage, industry: document.getElementById("wa-industry")?.value.trim() || "", description, problem: document.getElementById("wa-problem")?.value.trim() || "", customers: document.getElementById("wa-customers")?.value.trim() || "", teamSize: document.getElementById("wa-team")?.value.trim() || "" }; w.originalIdea = description; pushMessage(state, "in", description); pushMessage(state, "out", "Your original wording is retained. Here are possible SDG connections to review."); setState(state, "IMPACT_STARTED", 7, ctx); return true; }
  if (action === "wa-ai-enhance") { const description = document.getElementById("wa-description")?.value.trim() || w.venture.description; if (!description) { ctx.toast?.("Add your own wording first", "The AI proposal starts from what you write."); return true; } w.venture.description = description; w.aiDraft = `${description} This draft can be clarified with customer, delivery, and first-step details.`; w.aiAssumptions = ["customer and delivery details are still assumptions"]; localSave(state, ctx); ctx.render?.(); return true; }
  if (action === "wa-keep-original") { w.aiDraft = ""; w.aiAssumptions = []; ctx.toast?.("Original wording kept", "No AI rewrite was applied."); return true; }
  if (action === "wa-sdg") { const id = el.dataset.value; w.sdgs = w.sdgs.includes(id) ? w.sdgs.filter(item => item !== id) : [...w.sdgs, id].slice(0, 3); localSave(state, ctx); ctx.render?.(); return true; }
  if (action === "wa-impact-next") { if (!w.sdgs.length) { ctx.toast?.("Choose an SDG pathway", "Confirm or change at least one possible connection."); return true; } pushMessage(state, "in", w.sdgs.join(", ")); pushMessage(state, "out", "That connection is saved as a reviewable draft. What support would help next?"); setState(state, "NEEDS_ASSESSED", 8, ctx); return true; }
  if (action === "wa-need") { const need = el.dataset.value; w.needs = w.needs.includes(need) ? w.needs.filter(item => item !== need) : [...w.needs, need].slice(0, 8); localSave(state, ctx); ctx.render?.(); return true; }
  if (action === "wa-needs-next") { pushMessage(state, "in", w.needs.join(", ") || "Just exploring"); pushMessage(state, "out", "Your starting profile is ready. Review everything in the web workspace before submitting."); setState(state, "WEB_HANDOFF_CREATED", 10, ctx); w.importedSections = ["identity", "location", "venture", "impact", "needs"]; w.handoff = { mode: "demo", sessionId: `demo-${Math.random().toString(36).slice(2, 10)}`, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), singleUse: true }; localSave(state, ctx); return true; }
  if (action === "wa-open-workspace") { const p = w.participant, l = w.location, v = w.venture; state.passport = { ...state.passport, started: true, name: p.name || state.passport.name, country: l.country || state.passport.country, city: l.city || state.passport.city, bio: v.description || state.passport.bio, interests: w.sdgs.length ? w.sdgs : state.passport.interests, completion: Math.max(Number(state.passport.completion || 0), 42) }; state.onboarding = { ...state.onboarding, country: l.country || state.onboarding.country, interests: w.sdgs.join(", "), completed: false }; state.enterprise = { ...state.enterprise, founderOnboarding: true, passportPath: { ...(state.enterprise.passportPath || {}), source: "WhatsApp demo", stage: "Founder Readiness", status: "Draft" }, ventureDraft: { ...(state.enterprise.ventureDraft || {}), businessStage: v.stage, country: l.country, city: l.city, sector: v.industry, communityNeed: v.problem, customer: v.customers, teamStatus: v.teamSize, sdgs: w.sdgs } }; w.state = "APPLICATION_IN_PROGRESS"; w.handoff = { ...(w.handoff || {}), usedAt: new Date().toISOString() }; localSave(state, ctx); ctx.toast?.("Workspace prefilled", "Imported from your WhatsApp conversation. Review and edit before submitting."); ctx.navigate?.("enterprise", { whatsappPrefill: true }); return true; }
  if (action === "wa-open-enterprise") { ctx.navigate?.("enterprise", { whatsappPrefill: Boolean(w.importedSections.length) }); return true; }
  if (action === "wa-pause") { w.state = "PAUSED"; pushMessage(state, "out", "Paused. Your local draft remains available to resume."); localSave(state, ctx); return true; }
  if (action === "wa-send-plan") { w.source = "business_calculator"; ctx.navigate?.("whatsapp"); pushMessage(state, "out", "I’m ready to carry this plan into WhatsApp. Review the summary and choose your next step."); localSave(state, ctx); return true; }
  if (action === "wa-reminders") { w.communication.frequency = w.communication.frequency === "Service and milestone reminders" ? "Service messages only" : "Service and milestone reminders"; localSave(state, ctx); ctx.toast?.("Reminder preference saved", "Marketing messages remain separately opted in."); ctx.render?.(); return true; }
  if (action === "wa-reset") { const fresh = getDefaultWhatsAppState(); state.whatsapp = fresh; localSave(state, ctx); ctx.render?.(); return true; }
  if (action === "wa-copy-link") { if (navigator.clipboard) navigator.clipboard.writeText(safeLink(state)).then(() => ctx.toast?.("Safe link copied", "Only the campaign code is included.")); return true; }
  if (action === "wa-share") { const payload = { title: "Be the Change", text: "Start your enterprise journey with Be the Change on WhatsApp.", url: safeLink(state) }; if (navigator.share) navigator.share(payload).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(safeLink(state)).then(() => ctx.toast?.("Share link copied", "Only the safe campaign code is included.")); return true; }
  if (action === "wa-qr-open") { w.qrOpen = true; ctx.render?.(); return true; }
  if (action === "wa-qr-close") { w.qrOpen = false; ctx.render?.(); return true; }
  if (action === "wa-admin-tab") { w.adminTab = el.dataset.value || "Dashboard"; localSave(state, ctx); ctx.render?.(); return true; }
  if (action === "wa-admin-refresh") { loadWhatsAppAdminData(true).then(() => ctx.render?.()); return true; }
  if (action === "wa-community-request") { w.communityInvitation = "REQUESTED"; localSave(state, ctx); ctx.toast?.("Invitation request recorded", "You control whether to join after rules and privacy are shown."); ctx.render?.(); return true; }
  if (action === "wa-copy-flow") { const json = JSON.stringify({ version: "prototype-blueprint-1", screens: WHATSAPP_FLOW_BLUEPRINT }, null, 2); navigator.clipboard?.writeText(json).then(() => ctx.toast?.("Flow specification copied", "Publishing remains a protected backend action.")); return true; }
  if (action === "wa-campaign-generate") { const code = String(document.querySelector("[data-wa-draft='campaignCode']")?.value || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "-").slice(0, 40) || "BTC-LANDING"; w.campaignCode = code; w.source = "administrator campaign"; localSave(state, ctx); ctx.toast?.("Campaign code saved", "QR data contains only the safe identifier."); ctx.render?.(); return true; }
  if (action === "wa-template-add") { ctx.toast?.("Template draft started", "Meta approval is not claimed in this demo."); return true; }
  if (action === "wa-run-scenario") { const scenario = document.querySelector("[data-wa-scenario]")?.value || w.sandboxScenario; w.sandboxScenario = scenario; const scenarioState = scenario === "Opt-out" ? "OPTED_OUT" : scenario === "Human escalation" ? "HUMAN_SUPPORT" : scenario === "Payment pending" ? "PAYMENT_PENDING" : scenario === "Expired handoff link" ? "ACCOUNT_LINK_PENDING" : scenario === "Returning participant" ? "APPLICATION_IN_PROGRESS" : "WEB_HANDOFF_CREATED"; w.state = scenarioState; w.sandboxEvents = [{ actor: "Scenario", text: scenario, state: "DEMONSTRATION DATA" }, { actor: "System", text: scenario === "Unsupported response" ? "Recovery: explain the available choices and ask one clear question again." : `Transition preview: ${scenarioState}`, state: scenarioState }, { actor: "System", text: "No production message, payment, participant, or approval was created.", state: "SANDBOX ONLY" }]; localSave(state, ctx); ctx.render?.(); return true; }
  if (action === "wa-reset-sandbox") { w.sandboxEvents = []; localSave(state, ctx); ctx.render?.(); return true; }
  return false;
}
