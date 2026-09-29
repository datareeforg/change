// Canonical GIS persistence and permission boundary for Be The Change.
// Public reads intentionally return only safe geographic precision.
const COUNTRY_CATALOG = `
ghana|Ghana|GHA|Africa|West Africa|7.9465|-1.0232
liberia|Liberia|LBR|Africa|West Africa|6.4281|-9.4295
nigeria|Nigeria|NGA|Africa|West Africa|9.082|8.6753
senegal|Senegal|SEN|Africa|West Africa|14.4974|-14.4524
sierra-leone|Sierra Leone|SLE|Africa|West Africa|8.4606|-11.7799
namibia|Namibia|NAM|Africa|Southern Africa|-22.9576|18.4904
zambia|Zambia|ZMB|Africa|Southern Africa|-13.1339|27.8493
guinea|Guinea|GIN|Africa|West Africa|9.9456|-9.6966
morocco|Morocco|MAR|Africa|North Africa|31.7917|-7.0926
gambia|Gambia|GMB|Africa|West Africa|13.4432|-15.3101
ivory-coast|Côte d'Ivoire|CIV|Africa|West Africa|7.54|-5.5471
cameroon|Cameroon|CMR|Africa|Central Africa|7.3697|12.3547
democratic-republic-of-the-congo|Democratic Republic of the Congo|COD|Africa|Central Africa|-2.8797|23.656
botswana|Botswana|BWA|Africa|Southern Africa|-22.3285|24.6849
zimbabwe|Zimbabwe|ZWE|Africa|Southern Africa|-19.0154|29.1549
south-africa|South Africa|ZAF|Africa|Southern Africa|-30.5595|22.9375
malawi|Malawi|MWI|Africa|Southeast Africa|-13.2543|34.3015
tanzania|Tanzania|TZA|Africa|East Africa|-6.369|34.8888
kenya|Kenya|KEN|Africa|East Africa|-0.0236|37.9062
burundi|Burundi|BDI|Africa|East Africa|-3.3731|29.9189
rwanda|Rwanda|RWA|Africa|East Africa|-1.9403|29.8739
uganda|Uganda|UGA|Africa|East Africa|1.3733|32.2903
ethiopia|Ethiopia|ETH|Africa|East Africa|9.145|40.4897
somalia|Somalia|SOM|Africa|East Africa|5.1521|46.1996
egypt|Egypt|EGY|Africa|North Africa|26.8206|30.8025
mauritius|Mauritius|MUS|Africa|Indian Ocean|-20.3484|57.5522
spain|Spain|ESP|Europe|Southern Europe|40.4637|-3.7492
france|France|FRA|Europe|Western Europe|46.2276|2.2137
germany|Germany|DEU|Europe|Central Europe|51.1657|10.4515
italy|Italy|ITA|Europe|Southern Europe|41.8719|12.5674
switzerland|Switzerland|CHE|Europe|Central Europe|46.8182|8.2275
norway|Norway|NOR|Europe|Northern Europe|60.472|8.4689
sweden|Sweden|SWE|Europe|Northern Europe|60.1282|18.6435
united-kingdom|United Kingdom|GBR|Europe|Northern Europe|55.3781|-3.436
netherlands|Netherlands|NLD|Europe|Western Europe|52.1326|5.2913
belgium|Belgium|BEL|Europe|Western Europe|50.5039|4.4699
luxembourg|Luxembourg|LUX|Europe|Western Europe|49.8153|6.1296
poland|Poland|POL|Europe|Central Europe|51.9194|19.1451
czechia|Czechia|CZE|Europe|Central Europe|49.8175|15.473
romania|Romania|ROU|Europe|Eastern Europe|45.9432|24.9668
bulgaria|Bulgaria|BGR|Europe|Eastern Europe|42.7339|25.4858
ukraine|Ukraine|UKR|Europe|Eastern Europe|48.3794|31.1656
turkey|Turkey|TUR|Europe|Southeastern Europe|38.9637|35.2433
monaco|Monaco|MCO|Europe|Western Europe|43.7384|7.4246
vatican-city|Vatican City|VAT|Europe|Southern Europe|41.9029|12.4534
saudi-arabia|Saudi Arabia|SAU|Asia|Western Asia|23.8859|45.0792
united-arab-emirates|United Arab Emirates|ARE|Asia|Western Asia|23.4241|53.8478
afghanistan|Afghanistan|AFG|Asia|Southern Asia|33.9391|67.71
pakistan|Pakistan|PAK|Asia|Southern Asia|30.3753|69.3451
india|India|IND|Asia|Southern Asia|20.5937|78.9629
thailand|Thailand|THA|Asia|Southeastern Asia|15.87|100.9925
singapore|Singapore|SGP|Asia|Southeastern Asia|1.3521|103.8198
indonesia|Indonesia|IDN|Asia|Southeastern Asia|-0.7893|113.9213
vietnam|Vietnam|VNM|Asia|Southeastern Asia|14.0583|108.2772
australia|Australia|AUS|Oceania|Oceania|-25.2744|133.7751
papua-new-guinea|Papua New Guinea|PNG|Oceania|Oceania|-6.315|143.9555
vanuatu|Vanuatu|VUT|Oceania|Oceania|-15.3767|166.9592
united-states|United States|USA|Americas|North America|37.0902|-95.7129
canada|Canada|CAN|Americas|North America|56.1304|-106.3468
mexico|Mexico|MEX|Americas|North America|23.6345|-102.5528
brazil|Brazil|BRA|Americas|South America|-14.235|-51.9253
colombia|Colombia|COL|Americas|South America|4.5709|-74.2973
peru|Peru|PER|Americas|South America|-9.19|-75.0152
venezuela|Venezuela|VEN|Americas|South America|6.4238|-66.5897
grenada|Grenada|GRD|Americas|Caribbean|12.1165|-61.679
`.trim().split('\n').map(row=>{const [id,name,iso3,continent,region,latitude,longitude]=row.split('|');return {id,name,iso3,continent,region,latitude:Number(latitude),longitude:Number(longitude)};});
const sqlQuote = value => `'${String(value ?? '').replaceAll("'", "''")}'`;
const LEGACY_COUNTRY_STATUS = { ghana:'Activation Planning', liberia:'Community Forming', nigeria:'Community Forming', senegal:'Community Forming', 'sierra-leone':'Community Forming', namibia:'Community Forming', zambia:'Community Forming', guinea:'Community Forming' };
const countrySeedSql = COUNTRY_CATALOG.map(country=>`INSERT OR IGNORE INTO countries (id,name,slug,iso3,continent_group,region,latitude,longitude,status,summary,focus_json,sdgs_json,aliases_json,active,created_at,updated_at) VALUES (${sqlQuote(country.id)},${sqlQuote(country.name)},${sqlQuote(country.id)},${sqlQuote(country.iso3)},${sqlQuote(country.continent)},${sqlQuote(country.region)},${country.latitude},${country.longitude},${sqlQuote(LEGACY_COUNTRY_STATUS[country.id]||'Research Only')},${sqlQuote(`${country.name} is available as a country chapter for reviewed, locally led Global Goals work.`)},'[]','["SDG 04","SDG 08","SDG 17"]',${sqlQuote(country.name==="Côte d'Ivoire"?'["Ivory Coast"]':country.name==="United States"?'["USA","United States of America"]':country.name==="Vatican City"?'["Holy See"]':'[]')},1,'2026-09-03T00:00:00.000Z','2026-09-03T00:00:00.000Z');`).join('\n');
const legacyStatusSql = Object.entries(LEGACY_COUNTRY_STATUS).map(([id,status])=>`UPDATE countries SET status=${sqlQuote(status)} WHERE id=${sqlQuote(id)};`).join('\n');
export const schema = `
  CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    iso3 TEXT NOT NULL UNIQUE,
    continent_group TEXT NOT NULL,
    region TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    status TEXT NOT NULL DEFAULT 'Research Only',
    summary TEXT NOT NULL DEFAULT '',
    focus_json TEXT NOT NULL DEFAULT '[]',
    sdgs_json TEXT NOT NULL DEFAULT '[]',
    aliases_json TEXT NOT NULL DEFAULT '[]',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS countries_continent ON countries (continent_group, active, name);
  CREATE INDEX IF NOT EXISTS countries_region ON countries (region, active, name);
  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    country_iso3 TEXT NOT NULL,
    county TEXT,
    settlement TEXT,
    latitude REAL,
    longitude REAL,
    privacy TEXT NOT NULL DEFAULT 'Approximate',
    source_name TEXT,
    source_url TEXT,
    verification TEXT NOT NULL DEFAULT 'Needs Review',
    visibility TEXT NOT NULL DEFAULT 'public',
    archived INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS locations_public_index ON locations (country_iso3, county, category, archived);
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    record_id TEXT,
    detail TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tab TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    status TEXT NOT NULL DEFAULT 'Draft',
    country TEXT,
    source_url TEXT,
    details_json TEXT,
    visibility TEXT NOT NULL DEFAULT 'public',
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS admin_records_tab ON admin_records (tab, archived, visibility, updated_at);
  CREATE INDEX IF NOT EXISTS admin_records_owner ON admin_records (user_id, updated_at);
  CREATE TABLE IF NOT EXISTS evidence_submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    related_type TEXT NOT NULL,
    related_id TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    occurred_at TEXT,
    source_url TEXT,
    consent_confirmed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Draft',
    public_note TEXT NOT NULL DEFAULT '',
    reviewer_note TEXT NOT NULL DEFAULT '',
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS evidence_owner_status ON evidence_submissions(user_id,status,updated_at);
  CREATE TABLE IF NOT EXISTS impact_claims (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    claim_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    indicator_definition TEXT NOT NULL,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    country_iso3 TEXT,
    mission_id TEXT,
    sdg TEXT,
    method TEXT NOT NULL,
    limitations TEXT NOT NULL DEFAULT '',
    source_name TEXT NOT NULL,
    public_precision TEXT NOT NULL DEFAULT 'Country Only',
    status TEXT NOT NULL DEFAULT 'Draft',
    reviewer_note TEXT NOT NULL DEFAULT '',
    reviewed_by TEXT,
    reviewed_at TEXT,
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS impact_claim_public ON impact_claims(status,country_iso3,period_end);
  CREATE TABLE IF NOT EXISTS impact_claim_evidence (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    claim_id TEXT NOT NULL,
    evidence_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(claim_id,evidence_id)
  );
  CREATE TABLE IF NOT EXISTS impact_claim_revisions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    claim_id TEXT NOT NULL,
    action TEXT NOT NULL,
    snapshot_json TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS impact_revision_claim ON impact_claim_revisions(claim_id,created_at);
  CREATE TABLE IF NOT EXISTS geometadata (
    id TEXT PRIMARY KEY,
    related_record_id TEXT NOT NULL,
    related_record_type TEXT NOT NULL,
    geometry_type TEXT NOT NULL DEFAULT 'Point',
    geojson TEXT,
    latitude REAL,
    longitude REAL,
    accuracy_m REAL,
    country_iso3 TEXT,
    administrative_area TEXT,
    settlement TEXT,
    public_precision TEXT NOT NULL DEFAULT 'Approximate',
    source_name TEXT,
    source_url TEXT,
    verification TEXT NOT NULL DEFAULT 'Needs Review',
    confidence REAL,
    visibility TEXT NOT NULL DEFAULT 'public',
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS geometadata_record ON geometadata (related_record_id, related_record_type);
  CREATE TABLE IF NOT EXISTS personal_maps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'private',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS personal_maps_user ON personal_maps (user_id, updated_at);
  CREATE TABLE IF NOT EXISTS personal_map_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    map_id TEXT NOT NULL,
    record_id TEXT,
    record_type TEXT,
    note TEXT,
    personal_label TEXT,
    marker_color TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS personal_map_items_owner ON personal_map_items (user_id, map_id);
  CREATE TABLE IF NOT EXISTS check_ins (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    location_id TEXT,
    event_id TEXT,
    mission_id TEXT,
    status_text TEXT,
    timestamp TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'private',
    verification_method TEXT NOT NULL DEFAULT 'Self-reported',
    moderation_status TEXT NOT NULL DEFAULT 'Review Required',
    sync_key TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS check_ins_sync_key ON check_ins (sync_key);
  CREATE INDEX IF NOT EXISTS check_ins_public ON check_ins (location_id, visibility, moderation_status);
  CREATE INDEX IF NOT EXISTS check_ins_owner ON check_ins (user_id, timestamp);
  CREATE TABLE IF NOT EXISTS check_in_evidence (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    check_in_id TEXT NOT NULL,
    url TEXT NOT NULL,
    consent_confirmed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS check_in_evidence_check_in ON check_in_evidence (check_in_id);
  CREATE TABLE IF NOT EXISTS map_location_proposals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    country_iso3 TEXT NOT NULL,
    county TEXT,
    settlement TEXT,
    latitude REAL,
    longitude REAL,
    source_name TEXT,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'Needs Review',
    created_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by TEXT
  );
  CREATE INDEX IF NOT EXISTS map_location_proposals_status ON map_location_proposals (status, created_at);
  CREATE TABLE IF NOT EXISTS country_images (
    country_id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    alt TEXT NOT NULL,
    poi TEXT NOT NULL,
    prompt TEXT,
    generated_by TEXT,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    slug TEXT UNIQUE,
    continent TEXT NOT NULL,
    country TEXT,
    city TEXT,
    skills_json TEXT NOT NULL DEFAULT '[]',
    interests_json TEXT NOT NULL DEFAULT '[]',
    bio TEXT NOT NULL DEFAULT '',
    languages TEXT NOT NULL DEFAULT '',
    availability TEXT NOT NULL DEFAULT 'Not set',
    participation TEXT NOT NULL DEFAULT 'Remote and in-person',
    birth_month INTEGER,
    birth_year INTEGER,
    avatar_url TEXT,
    referred_by_user_id TEXT,
    updated_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug ON profiles (slug);
  CREATE TABLE IF NOT EXISTS media_submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    country_id TEXT NOT NULL,
    media_type TEXT NOT NULL,
    title TEXT NOT NULL,
    creator TEXT,
    source_type TEXT NOT NULL,
    source_url TEXT NOT NULL,
    embed_url TEXT,
    language TEXT,
    genre TEXT,
    description TEXT,
    rights_confirmed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending Review',
    reviewer_note TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    archived INTEGER NOT NULL DEFAULT 0,
    submitted_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS media_public_index ON media_submissions (country_id, media_type, status, archived, featured, updated_at);
  CREATE INDEX IF NOT EXISTS media_submitter_index ON media_submissions (user_id, updated_at);
  CREATE TABLE IF NOT EXISTS jukebox_settings (
    country_id TEXT PRIMARY KEY,
    brand_name TEXT NOT NULL DEFAULT 'Country listening room',
    tagline TEXT NOT NULL DEFAULT 'Community-selected sounds, reviewed before publishing.',
    accent_color TEXT NOT NULL DEFAULT '#84e4e5',
    glow_color TEXT NOT NULL DEFAULT '#eacb83',
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS jukebox_tracks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    country_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT,
    source_type TEXT NOT NULL,
    source_url TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    language TEXT,
    genre TEXT,
    context_note TEXT,
    rights_confirmed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending Review',
    reviewer_note TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    archived INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 1000,
    submitted_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS jukebox_public_index ON jukebox_tracks (country_id, status, archived, featured, order_index, updated_at);
  CREATE INDEX IF NOT EXISTS jukebox_filter_index ON jukebox_tracks (country_id, source_type, genre, username, status);
  CREATE TABLE IF NOT EXISTS jukebox_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    track_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS jukebox_reports_track ON jukebox_reports (track_id, created_at);
  CREATE TABLE IF NOT EXISTS stripe_settings (
    id TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    mode TEXT NOT NULL DEFAULT 'test',
    default_currency TEXT NOT NULL DEFAULT 'usd',
    allowed_currencies_json TEXT NOT NULL DEFAULT '["usd"]',
    minimum_amount_minor INTEGER NOT NULL DEFAULT 50,
    maximum_amount_minor INTEGER NOT NULL DEFAULT 1000000,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stripe_payment_intents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider_reference TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL,
    amount_minor INTEGER NOT NULL,
    currency TEXT NOT NULL,
    purpose TEXT,
    status TEXT NOT NULL DEFAULT 'Created',
    livemode INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, idempotency_key)
  );
  CREATE INDEX IF NOT EXISTS stripe_payment_intents_user ON stripe_payment_intents (user_id, updated_at);
  CREATE INDEX IF NOT EXISTS stripe_payment_intents_status ON stripe_payment_intents (status, updated_at);
  CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    livemode INTEGER NOT NULL DEFAULT 0,
    processing_status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    processed_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS learning_courses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    title TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Draft',
    visibility TEXT NOT NULL DEFAULT 'private',
    level TEXT NOT NULL DEFAULT 'Foundational',
    format TEXT NOT NULL DEFAULT 'Cohort or self-paced',
    access_model TEXT NOT NULL DEFAULT 'Private draft',
    country_context TEXT,
    mission TEXT,
    sdgs_json TEXT NOT NULL DEFAULT '[]',
    safety_note TEXT,
    evidence_task TEXT,
    current_version INTEGER NOT NULL DEFAULT 1,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS learning_courses_owner ON learning_courses (user_id, archived, updated_at);
  CREATE INDEX IF NOT EXISTS learning_courses_public ON learning_courses (visibility, status, archived, updated_at);
  CREATE TABLE IF NOT EXISTS learning_course_versions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    snapshot_json TEXT NOT NULL,
    change_note TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(course_id, version)
  );
  CREATE INDEX IF NOT EXISTS learning_course_versions_course ON learning_course_versions (course_id, version);
  CREATE TABLE IF NOT EXISTS learning_modules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content_json TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(course_id, position)
  );
  CREATE INDEX IF NOT EXISTS learning_modules_course ON learning_modules (course_id, position);
  CREATE TABLE IF NOT EXISTS learning_enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    course_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Student',
    status TEXT NOT NULL DEFAULT 'Enrolled',
    progress INTEGER NOT NULL DEFAULT 0,
    enrolled_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, course_id)
  );
  CREATE INDEX IF NOT EXISTS learning_enrollments_course ON learning_enrollments (course_id, status, updated_at);
  CREATE TABLE IF NOT EXISTS classroom_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ready',
    active_module INTEGER NOT NULL DEFAULT 0,
    scheduled_at TEXT,
    started_at TEXT,
    ended_at TEXT,
    provider TEXT NOT NULL DEFAULT 'Native room',
    provider_reference TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS classroom_sessions_course ON classroom_sessions (course_id, status, updated_at);
  CREATE TABLE IF NOT EXISTS classroom_attendance (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    session_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Student',
    status TEXT NOT NULL DEFAULT 'Present',
    joined_at TEXT NOT NULL,
    left_at TEXT,
    last_seen_at TEXT NOT NULL,
    UNIQUE(user_id, session_id)
  );
  CREATE INDEX IF NOT EXISTS classroom_attendance_session ON classroom_attendance (session_id, status, last_seen_at);
  CREATE TABLE IF NOT EXISTS classroom_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    session_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Student',
    message_type TEXT NOT NULL DEFAULT 'chat',
    content TEXT NOT NULL,
    moderation_status TEXT NOT NULL DEFAULT 'Visible',
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS classroom_messages_session ON classroom_messages (session_id, moderation_status, created_at);
  ${countrySeedSql}
  ${legacyStatusSql}
  CREATE TABLE IF NOT EXISTS whatsapp_onboarding_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'landing_page',
    status TEXT NOT NULL DEFAULT 'DISCOVERED',
    state_ciphertext TEXT,
    state_iv TEXT,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_sessions_user ON whatsapp_onboarding_sessions (user_id, updated_at);
  CREATE TABLE IF NOT EXISTS whatsapp_webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'RECEIVED',
    received_at TEXT NOT NULL,
    processed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS whatsapp_support_cases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    queue_type TEXT NOT NULL DEFAULT 'Needs human response',
    status TEXT NOT NULL DEFAULT 'OPEN',
    summary TEXT NOT NULL DEFAULT '',
    consent_reference TEXT,
    assigned_to TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_cases_queue ON whatsapp_support_cases (status, queue_type, updated_at);
  CREATE TABLE IF NOT EXISTS whatsapp_profiles (
    user_id TEXT PRIMARY KEY,
    country_code TEXT NOT NULL DEFAULT '',
    calling_code TEXT NOT NULL DEFAULT '',
    e164_ciphertext TEXT,
    e164_iv TEXT,
    phone_number_hash TEXT UNIQUE,
    masked_display TEXT,
    whatsapp_available INTEGER,
    is_primary_phone INTEGER NOT NULL DEFAULT 0,
    verification_status TEXT NOT NULL DEFAULT 'not_provided',
    connection_status TEXT NOT NULL DEFAULT 'never_contacted',
    consent_status TEXT NOT NULL DEFAULT 'not_requested',
    consent_source TEXT,
    consent_language_version TEXT,
    consent_timestamp TEXT,
    preferred_language TEXT,
    quiet_hours_json TEXT,
    first_connection_source TEXT,
    last_inbound_at TEXT,
    last_outbound_at TEXT,
    last_message_status TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_profiles_status ON whatsapp_profiles (connection_status, verification_status, consent_status, updated_at);
  CREATE INDEX IF NOT EXISTS whatsapp_profiles_country ON whatsapp_profiles (country_code, preferred_language);
  CREATE TABLE IF NOT EXISTS whatsapp_number_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    phone_number_hash TEXT,
    masked_display TEXT,
    status TEXT NOT NULL DEFAULT 'changed',
    changed_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_number_history_user ON whatsapp_number_history (user_id, changed_at);
  CREATE TABLE IF NOT EXISTS whatsapp_provisional_contacts (
    provisional_contact_id TEXT PRIMARY KEY,
    user_id TEXT,
    provider_identifier_ciphertext TEXT,
    provider_identifier_iv TEXT,
    provider_identifier_hash TEXT UNIQUE,
    source_campaign TEXT,
    identity_match_state TEXT NOT NULL DEFAULT 'provisional_contact',
    onboarding_stage TEXT NOT NULL DEFAULT 'DISCOVERED',
    first_inbound_at TEXT,
    last_interaction_at TEXT,
    dataset TEXT NOT NULL DEFAULT 'production',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_provisional_queue ON whatsapp_provisional_contacts (identity_match_state, onboarding_stage, updated_at);
  CREATE TABLE IF NOT EXISTS whatsapp_identity_links (
    id TEXT PRIMARY KEY,
    provisional_contact_id TEXT,
    user_id TEXT,
    provider_identifier_ciphertext TEXT,
    provider_identifier_iv TEXT,
    provider_identifier_hash TEXT NOT NULL,
    identity_match_state TEXT NOT NULL DEFAULT 'provisional_contact',
    linked_at TEXT,
    disconnected_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_identity_user ON whatsapp_identity_links (user_id, identity_match_state);
  CREATE INDEX IF NOT EXISTS whatsapp_identity_provider ON whatsapp_identity_links (provider_identifier_hash, identity_match_state);
  CREATE TABLE IF NOT EXISTS whatsapp_identity_conflicts (
    id TEXT PRIMARY KEY,
    provider_identifier_hash TEXT NOT NULL,
    phone_number_hash TEXT,
    candidate_user_id TEXT,
    existing_user_id TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    reason TEXT NOT NULL DEFAULT 'Already linked elsewhere',
    resolved_by TEXT,
    resolved_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_identity_conflict_queue ON whatsapp_identity_conflicts (status, updated_at);
  CREATE TABLE IF NOT EXISTS whatsapp_connection_codes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    code_hash TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL DEFAULT 'profile',
    expires_at TEXT NOT NULL,
    used_at TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    rate_limit_key TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_connection_codes_user ON whatsapp_connection_codes (user_id, expires_at, used_at);
  CREATE TABLE IF NOT EXISTS whatsapp_consent_events (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    phone_number_hash TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    language_version TEXT NOT NULL,
    source TEXT NOT NULL,
    ip_audit_hash TEXT,
    user_agent TEXT,
    administrator_id TEXT,
    created_at TEXT NOT NULL,
    withdrawn_at TEXT
  );
  CREATE INDEX IF NOT EXISTS whatsapp_consent_history ON whatsapp_consent_events (user_id, category, created_at);
  CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    provisional_contact_id TEXT,
    provider_identifier_hash TEXT,
    queue_category TEXT NOT NULL DEFAULT 'New',
    status TEXT NOT NULL DEFAULT 'open',
    assigned_to TEXT,
    onboarding_stage TEXT NOT NULL DEFAULT 'DISCOVERED',
    automation_paused INTEGER NOT NULL DEFAULT 0,
    last_inbound_at TEXT,
    last_outbound_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    dataset TEXT NOT NULL DEFAULT 'production'
  );
  CREATE INDEX IF NOT EXISTS whatsapp_conversations_queue ON whatsapp_conversations (queue_category, status, assigned_to, updated_at);
  CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    conversation_id TEXT NOT NULL,
    provider_message_id TEXT UNIQUE,
    direction TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text',
    body_ciphertext TEXT,
    body_iv TEXT,
    template_name TEXT,
    language TEXT,
    consent_category TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    safe_error_summary TEXT,
    provider_error_reference TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    dataset TEXT NOT NULL DEFAULT 'production'
  );
  CREATE INDEX IF NOT EXISTS whatsapp_messages_conversation ON whatsapp_messages (conversation_id, created_at);
  CREATE INDEX IF NOT EXISTS whatsapp_messages_status ON whatsapp_messages (status, updated_at);
  CREATE TABLE IF NOT EXISTS whatsapp_message_status_events (
    id TEXT PRIMARY KEY,
    message_id TEXT,
    provider_message_id TEXT NOT NULL,
    status TEXT NOT NULL,
    safe_error_summary TEXT,
    provider_error_reference TEXT,
    occurred_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_message_status_history ON whatsapp_message_status_events (provider_message_id, occurred_at);
  CREATE TABLE IF NOT EXISTS whatsapp_outbox (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL UNIQUE,
    user_id TEXT,
    next_attempt_at TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    locked_at TEXT,
    last_error TEXT,
    dataset TEXT NOT NULL DEFAULT 'production',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    language TEXT NOT NULL,
    body TEXT NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'draft',
    provider_reference TEXT,
    variables_json TEXT NOT NULL DEFAULT '[]',
    created_by TEXT,
    modified_by TEXT,
    dataset TEXT NOT NULL DEFAULT 'production',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS whatsapp_automations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    trigger_name TEXT NOT NULL,
    conditions_json TEXT NOT NULL DEFAULT '{}',
    audience_json TEXT NOT NULL DEFAULT '{}',
    consent_requirement TEXT NOT NULL DEFAULT 'service_only',
    template_id TEXT,
    delay_seconds INTEGER NOT NULL DEFAULT 0,
    quiet_hours_behavior TEXT NOT NULL DEFAULT 'defer',
    max_frequency_seconds INTEGER NOT NULL DEFAULT 86400,
    enabled INTEGER NOT NULL DEFAULT 0,
    test_mode INTEGER NOT NULL DEFAULT 1,
    last_run_at TEXT,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    created_by TEXT,
    modified_by TEXT,
    dataset TEXT NOT NULL DEFAULT 'production',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS whatsapp_automation_versions (
    id TEXT PRIMARY KEY,
    automation_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    definition_json TEXT NOT NULL,
    created_by TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(automation_id, version)
  );
  CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    campaign_code TEXT NOT NULL UNIQUE,
    purpose TEXT NOT NULL,
    audience_json TEXT NOT NULL DEFAULT '{}',
    country_code TEXT,
    language TEXT,
    program TEXT,
    partner_organization TEXT,
    start_at TEXT,
    end_at TEXT,
    prefilled_message TEXT,
    landing_page_url TEXT,
    source_metadata_json TEXT NOT NULL DEFAULT '{}',
    dataset TEXT NOT NULL DEFAULT 'production',
    status TEXT NOT NULL DEFAULT 'paused',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS whatsapp_campaign_events (
    id TEXT PRIMARY KEY,
    campaign_id TEXT,
    provisional_contact_id TEXT,
    user_id TEXT,
    event_name TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    dataset TEXT NOT NULL DEFAULT 'production',
    metadata_json TEXT NOT NULL DEFAULT '{}'
  );
  CREATE INDEX IF NOT EXISTS whatsapp_campaign_events_index ON whatsapp_campaign_events (campaign_id, event_name, occurred_at);
  CREATE TABLE IF NOT EXISTS whatsapp_admin_roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    permissions_json TEXT NOT NULL DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS whatsapp_admin_role_assignments (
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    assigned_by TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY(user_id, role_id)
  );
  CREATE TABLE IF NOT EXISTS whatsapp_audit_log (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    reason TEXT,
    result TEXT NOT NULL,
    safe_metadata_json TEXT NOT NULL DEFAULT '{}',
    previous_status TEXT,
    new_status TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS whatsapp_audit_history ON whatsapp_audit_log (target_type, target_id, created_at);
  CREATE TABLE IF NOT EXISTS job_sources (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    feed_url TEXT NOT NULL,
    feed_type TEXT NOT NULL DEFAULT 'auto',
    employer_name TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    last_etag TEXT,
    last_modified TEXT,
    last_success_at TEXT,
    last_error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    employer_name TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    requirements TEXT,
    skills_json TEXT NOT NULL DEFAULT '[]',
    categories_json TEXT NOT NULL DEFAULT '[]',
    sdgs_json TEXT NOT NULL DEFAULT '[]',
    country TEXT,
    region TEXT,
    city TEXT,
    work_mode TEXT NOT NULL DEFAULT 'On-site',
    employment_type TEXT NOT NULL DEFAULT 'Full-time',
    experience_level TEXT,
    salary_min REAL,
    salary_max REAL,
    salary_currency TEXT,
    salary_period TEXT,
    application_url TEXT,
    application_email TEXT,
    source_id TEXT,
    source_name TEXT,
    source_external_id TEXT,
    source_url TEXT,
    provenance TEXT NOT NULL DEFAULT 'Community submission',
    green_score INTEGER NOT NULL DEFAULT 0,
    green_explanation TEXT,
    verification TEXT NOT NULL DEFAULT 'Unverified',
    moderation_status TEXT NOT NULL DEFAULT 'Pending Review',
    published_at TEXT,
    closes_at TEXT,
    last_checked_at TEXT,
    expires_at TEXT,
    archived INTEGER NOT NULL DEFAULT 0,
    fingerprint TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS jobs_source_external ON jobs(source_id, source_external_id) WHERE source_id IS NOT NULL AND source_external_id IS NOT NULL;
  CREATE INDEX IF NOT EXISTS jobs_public_index ON jobs(moderation_status, archived, published_at);
  CREATE INDEX IF NOT EXISTS jobs_filter_index ON jobs(country, work_mode, employment_type);
  CREATE INDEX IF NOT EXISTS jobs_fingerprint_index ON jobs(fingerprint);
  CREATE TABLE IF NOT EXISTS job_import_runs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    source_id TEXT NOT NULL,
    status TEXT NOT NULL,
    fetched_count INTEGER NOT NULL DEFAULT 0,
    created_count INTEGER NOT NULL DEFAULT 0,
    updated_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    error TEXT,
    started_at TEXT NOT NULL,
    completed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS job_audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    job_id TEXT,
    source_id TEXT,
    detail TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS job_audit_history ON job_audit_log(job_id, source_id, created_at);
  CREATE TABLE IF NOT EXISTS whatsapp_integration_settings (
    id TEXT PRIMARY KEY,
    automation_paused INTEGER NOT NULL DEFAULT 0,
    mode TEXT NOT NULL DEFAULT 'demo',
    template_sync_at TEXT,
    last_valid_webhook_at TEXT,
    last_inbound_at TEXT,
    last_outbound_at TEXT,
    failed_event_count INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );
  INSERT OR IGNORE INTO whatsapp_integration_settings (id, updated_at) VALUES ('default', CURRENT_TIMESTAMP);
  INSERT OR IGNORE INTO whatsapp_admin_roles (id, name, description, permissions_json) VALUES
    ('super_admin', 'SUPER_ADMIN', 'Full WhatsApp configuration and channel control', '["*"]'),
    ('whatsapp_admin', 'WHATSAPP_ADMIN', 'Operational WhatsApp management', '["view_health","view_connections","view_conversations","send_messages","manage_templates","manage_automations","view_analytics"]'),
    ('support_agent', 'SUPPORT_AGENT', 'Assigned support conversations', '["view_assigned_conversations","send_messages","add_notes","escalate"]'),
    ('community_manager', 'COMMUNITY_MANAGER', 'Community routing and invitations', '["view_community","send_community_messages"]'),
    ('marketplace_manager', 'MARKETPLACE_MANAGER', 'Marketplace conversations', '["view_marketplace","send_marketplace_messages"]'),
    ('analyst', 'ANALYST', 'De-identified analytics', '["view_analytics"]'),
    ('auditor', 'AUDITOR', 'Read-only audit access', '["view_audit"]');
`;

const json = (data, status = 200) => Response.json(data, { status });
const now = () => new Date().toISOString();
const user = request => request.headers.get('x-websim-user-id');
const ADMIN_EMAILS = new Set(['ceo@isdrc.net']);
const ADMIN_USERNAMES = new Set(['atozenith', 'kabaniceo']);
const requestEmail = request => String(request.headers.get('x-websim-user-email') || request.headers.get('x-websim-email') || request.headers.get('x-websim-account-email') || '').trim().toLowerCase();
const owner = request => {
  const id = user(request);
  const username = (request.headers.get('x-websim-username') || '').trim().toLowerCase().replace(/^@/, '');
  return Boolean(id && (id === request.headers.get('x-websim-project-owner-id') || ADMIN_USERNAMES.has(username) || ADMIN_EMAILS.has(requestEmail(request))));
};
const learningId = value => String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
const learningRole = value => ['Student','Instructor'].includes(String(value)) ? String(value) : 'Student';
const safeJsonArray = value => {
  if (Array.isArray(value)) return value;
  try { const parsed=JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed : []; } catch (_) { return []; }
};
const safeCourse = (row, modules=[], snapshot={}) => row ? ({
  id:row.id, title:snapshot.title || row.title, purpose:snapshot.purpose || row.purpose || '', label:row.status || 'Draft', status:row.status || 'Draft', visibility:row.visibility || 'private', level:snapshot.level || row.level || 'Foundational', format:snapshot.format || row.format || 'Cohort or self-paced', access:snapshot.access || row.access_model || 'Private draft', audience:snapshot.audience || '', duration:snapshot.duration || '', language:snapshot.language || 'English', prerequisites:snapshot.prerequisites || '', countryContext:snapshot.countryContext || row.country_context || '', mission:snapshot.mission || row.mission || 'Generated course', sdgs:Array.isArray(snapshot.sdgs)?snapshot.sdgs:safeJsonArray(row.sdgs_json), safetyNote:snapshot.safetyNote || row.safety_note || '', evidenceTask:snapshot.evidenceTask || row.evidence_task || '', assessment:snapshot.assessment || {}, accessibilityNotes:snapshot.accessibilityNotes || '', sourceNotes:snapshot.sourceNotes || '', review:snapshot.review || {}, currentVersion:Number(row.current_version || 1), archived:Boolean(row.archived), owner:Boolean(row.is_owner), createdAt:row.created_at, updatedAt:row.updated_at,
  modules:(modules || []).map(module=>{let content={};try{content=JSON.parse(module.content_json||'{}')}catch(_){}return { id:module.id, position:Number(module.position || 0), title:module.title, summary:module.summary || '', objective:content.objective || '', activity:content.activity || '', check:content.check || '', resource:content.resource || '', status:module.status || 'Draft' };})
}) : null;
const latestCourseSnapshot = async (db, courseId) => {
  const version=await db.prepare('SELECT snapshot_json FROM learning_course_versions WHERE course_id=? ORDER BY version DESC LIMIT 1').bind(courseId).first();
  try { const parsed=JSON.parse(version?.snapshot_json||'{}'); return parsed&&typeof parsed==='object'?parsed:{}; } catch (_) { return {}; }
};
const canReadCourse = (row, request) => Boolean(row && !row.archived && (row.visibility === 'public' || row.user_id === user(request) || owner(request)));

// WhatsApp production boundary. The browser never receives any of these
// values; the routes below only report configuration presence or exchange a
// short-lived signed handoff token.
const bytesToBase64 = bytes => { let binary = ''; for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte); return btoa(binary); };
const base64ToBytes = value => Uint8Array.from(atob(String(value || '')), char => char.charCodeAt(0));
const hmacHex = async (secret, value) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(secret)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(String(value))))].map(byte => byte.toString(16).padStart(2, '0')).join('');
};
const secureEqual = (left, right) => {
  const a = String(left || ''), b = String(right || ''); if (!a || a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i); return diff === 0;
};
const encryptState = async (env, value) => {
  if (!env.ENCRYPTION_KEY) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(env.ENCRYPTION_KEY)));
  const key = await crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(value || {})));
  return { ciphertext: bytesToBase64(ciphertext), iv: bytesToBase64(iv) };
};
const metaSignatureValid = async (payload, signature, secret) => {
  const supplied = String(signature || '').replace(/^sha256=/i, '').trim();
  return Boolean(supplied && secret && secureEqual(supplied, await hmacHex(secret, payload)));
};
const safeSource = value => ['landing_page','event','partner','social_campaign','referral','QR code','business calculator','marketplace','course','community page','grant page','administrator campaign'].includes(String(value)) ? String(value) : 'landing_page';
const whatsappConfig = env => ({
  enabled: Boolean(env.WHATSAPP_ENABLED === true || String(env.WHATSAPP_ENABLED || '').toLowerCase() === 'true'),
  displayNumberConfigured: Boolean(env.WHATSAPP_DISPLAY_NUMBER), webhookUrlConfigured: Boolean(env.WHATSAPP_WEBHOOK_URL), defaultLanguageConfigured: Boolean(env.WHATSAPP_DEFAULT_LANGUAGE), defaultTimezoneConfigured: Boolean(env.WHATSAPP_DEFAULT_TIMEZONE),
  apiVersionConfigured: Boolean(env.WHATSAPP_API_VERSION), phoneNumberIdConfigured: Boolean(env.WHATSAPP_PHONE_NUMBER_ID), businessAccountConfigured: Boolean(env.WHATSAPP_BUSINESS_ACCOUNT_ID), accessTokenConfigured: Boolean(env.WHATSAPP_ACCESS_TOKEN), appSecretConfigured: Boolean(env.WHATSAPP_APP_SECRET), verifyTokenConfigured: Boolean(env.WHATSAPP_VERIFY_TOKEN), signingSecretConfigured: Boolean(env.SESSION_SIGNING_SECRET), encryptionKeyConfigured: Boolean(env.PHONE_ENCRYPTION_KEY || env.ENCRYPTION_KEY), lookupHashSecretConfigured: Boolean(env.PHONE_LOOKUP_HASH_SECRET), publicAppConfigured: Boolean(env.PUBLIC_APP_URL),
});
const envFlag = value => value === true || ['1','true','yes','on'].includes(String(value || '').toLowerCase());
const whatsappMode = env => { const config=whatsappConfig(env); return config.enabled && config.displayNumberConfigured && config.webhookUrlConfigured && config.defaultLanguageConfigured && config.defaultTimezoneConfigured && config.apiVersionConfigured && config.phoneNumberIdConfigured && config.businessAccountConfigured && config.accessTokenConfigured && config.appSecretConfigured && config.verifyTokenConfigured && config.signingSecretConfigured && config.publicAppConfigured && config.lookupHashSecretConfigured && config.encryptionKeyConfigured ? 'production' : 'demo'; };
const whatsappProviderReady = env => whatsappMode(env) === 'production';
const whatsappRequiredBindings = ['WHATSAPP_ENABLED','WHATSAPP_DISPLAY_NUMBER','WHATSAPP_PHONE_NUMBER_ID','WHATSAPP_BUSINESS_ACCOUNT_ID','WHATSAPP_ACCESS_TOKEN','WHATSAPP_APP_SECRET','WHATSAPP_VERIFY_TOKEN','WHATSAPP_API_VERSION','WHATSAPP_WEBHOOK_URL','WHATSAPP_DEFAULT_LANGUAGE','WHATSAPP_DEFAULT_TIMEZONE','PUBLIC_APP_URL','SESSION_SIGNING_SECRET','PHONE_ENCRYPTION_KEY','PHONE_LOOKUP_HASH_SECRET'];
let whatsappColumnsPromise = null;
const ensureWhatsAppColumns = env => whatsappColumnsPromise || (whatsappColumnsPromise = (async () => {
  const { results } = await env.DB.prepare('PRAGMA table_info(whatsapp_support_cases)').all();
  const columns = new Set((results || []).map(row => row.name));
  const additions = [
    ['conversation_id', 'ALTER TABLE whatsapp_support_cases ADD COLUMN conversation_id TEXT'],
    ['dataset', "ALTER TABLE whatsapp_support_cases ADD COLUMN dataset TEXT NOT NULL DEFAULT 'production'"],
    ['escalation_reason', 'ALTER TABLE whatsapp_support_cases ADD COLUMN escalation_reason TEXT'],
    ['resolution', 'ALTER TABLE whatsapp_support_cases ADD COLUMN resolution TEXT'],
  ].filter(([name]) => !columns.has(name)).map(([, statement]) => env.DB.prepare(statement));
  if (additions.length) await env.DB.batch(additions);
})());
const deriveAesKey = async secret => {
  if (!secret) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(secret)));
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt','decrypt']);
};
const encryptSecret = async (secret, value) => {
  const key = await deriveAesKey(secret); if (!key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, new TextEncoder().encode(String(value || '')));
  return { ciphertext: bytesToBase64(ciphertext), iv: bytesToBase64(iv) };
};
const decryptSecret = async (secret, ciphertext, iv) => {
  const key = await deriveAesKey(secret); if (!key || !ciphertext || !iv) return '';
  try { return new TextDecoder().decode(await crypto.subtle.decrypt({ name:'AES-GCM', iv:base64ToBytes(iv) }, key, base64ToBytes(ciphertext))); } catch (_) { return ''; }
};
const lookupHash = async (env, value) => hmacHex(env.PHONE_LOOKUP_HASH_SECRET || env.WHATSAPP_APP_SECRET, String(value || ''));
const normalizeWhatsAppNumber = (countryCode, callingCode, localNumber) => {
  const country = String(countryCode || '').trim().toUpperCase();
  const dial = String(callingCode || '').replace(/[^0-9]/g, '');
  const local = String(localNumber || '').replace(/[^0-9]/g, '').replace(/^0+/, '');
  if (!/^[A-Z]{2}$/.test(country) || !/^\d{1,4}$/.test(dial) || local.length < 5 || local.length > 14) return null;
  const e164 = `+${dial}${local}`;
  return /^\+[1-9]\d{6,14}$/.test(e164) ? { countryCode:country, callingCode:`+${dial}`, e164 } : null;
};
const maskWhatsAppNumber = e164 => {
  const value = String(e164 || ''); if (!/^\+\d{7,15}$/.test(value)) return '';
  return `${value.slice(0, Math.min(4, value.length - 3))} ••• ••• ${value.slice(-3)}`;
};
const requestUserAgent = request => String(request.headers.get('user-agent') || '').slice(0, 240);
const auditWhatsApp = async (env, request, action, targetType, targetId, result, reason = '', previousStatus = '', newStatus = '', metadata = {}) => {
  const actor = user(request);
  await env.DB.prepare('INSERT INTO whatsapp_audit_log (id,actor_user_id,actor_role,action,target_type,target_id,reason,result,safe_metadata_json,previous_status,new_status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), actor, owner(request) ? 'SUPER_ADMIN' : 'ADMIN', action, targetType, targetId, String(reason || '').slice(0, 500), String(result || '').slice(0, 80), JSON.stringify(metadata || {}).slice(0, 2000), previousStatus || null, newStatus || null, now()).run();
};
const rolePermissions = async (env, request) => {
  if (owner(request)) return { roles:['SUPER_ADMIN'], permissions:['*'] };
  const uid = user(request); if (!uid) return { roles:[], permissions:[] };
  const { results } = await env.DB.prepare('SELECT r.name,r.permissions_json FROM whatsapp_admin_role_assignments a JOIN whatsapp_admin_roles r ON r.id=a.role_id WHERE a.user_id=?').bind(uid).all();
  const roles = [], permissions = [];
  for (const row of results || []) { roles.push(row.name); try { permissions.push(...JSON.parse(row.permissions_json || '[]')); } catch (_) {} }
  return { roles:[...new Set(roles)], permissions:[...new Set(permissions)] };
};
const allowed = async (env, request, permission) => { const access = await rolePermissions(env, request); return access.permissions.includes('*') || access.permissions.includes(permission); };
const requirePermission = async (env, request, permission) => {
  if (!user(request)) return json({ error:'Sign in required' }, 401);
  if (!(await allowed(env, request, permission))) return json({ error:'WhatsApp administrator permission required' }, 403);
  return null;
};
const safeProfileRow = row => row ? ({
  userId:row.user_id, countryCode:row.country_code, callingCode:row.calling_code, maskedDisplay:row.masked_display || '', whatsappAvailable:row.whatsapp_available == null ? null : Boolean(row.whatsapp_available), isPrimaryPhone:Boolean(row.is_primary_phone), verificationStatus:row.verification_status, connectionStatus:row.connection_status, consentStatus:row.consent_status, consentSource:row.consent_source || null, consentTimestamp:row.consent_timestamp || null, preferredLanguage:row.preferred_language || '', quietHours: (() => { try { return JSON.parse(row.quiet_hours_json || 'null'); } catch (_) { return null; } })(), firstConnectionSource:row.first_connection_source || null, lastInboundAt:row.last_inbound_at || null, lastOutboundAt:row.last_outbound_at || null, lastMessageStatus:row.last_message_status || null, createdAt:row.created_at, updatedAt:row.updated_at,
}) : null;
const whatsappText = message => String(message?.text?.body || message?.button?.text || message?.interactive?.button_reply?.title || message?.interactive?.list_reply?.title || '').trim().slice(0, 4000);
const optOutWords = new Set(['stop','unsubscribe','cancel','quit','end','arret','desinscrire','desabonner']);
const isWhatsAppOptOut = text => optOutWords.has(String(text || '').trim().toLowerCase());
const providerStatus = value => ({sent:'sent',delivered:'delivered',read:'read',failed:'failed',undeliverable:'undeliverable'})[String(value || '').toLowerCase()] || null;
const metaApiRequest = async (env, path, body) => {
  if (!whatsappProviderReady(env)) throw Object.assign(new Error('WhatsApp Cloud API is not configured'), { code:'whatsapp_not_configured', status:503 });
  const configuredVersion = String(env.WHATSAPP_API_VERSION || 'v20.0');
  const apiVersion = configuredVersion.toLowerCase().startsWith('v') ? configuredVersion : `v${configuredVersion}`;
  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${path.replace(/^\//,'')}`, { method:'POST', headers:{'content-type':'application/json',authorization:`Bearer ${env.WHATSAPP_ACCESS_TOKEN}`}, body:JSON.stringify(body) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error('WhatsApp provider rejected the request'), { status:response.status, code:'provider_rejected', providerReference:String(result?.error?.fbtrace_id || result?.error?.code || '').slice(0,120) });
  return result;
};
const upsertWhatsAppProfile = async (env, values) => {
  const timestamp = now();
  await env.DB.prepare(`INSERT INTO whatsapp_profiles (user_id,country_code,calling_code,e164_ciphertext,e164_iv,phone_number_hash,masked_display,whatsapp_available,is_primary_phone,verification_status,connection_status,consent_status,consent_source,consent_language_version,consent_timestamp,preferred_language,quiet_hours_json,first_connection_source,last_inbound_at,last_outbound_at,last_message_status,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET country_code=excluded.country_code,calling_code=excluded.calling_code,e164_ciphertext=excluded.e164_ciphertext,e164_iv=excluded.e164_iv,phone_number_hash=excluded.phone_number_hash,masked_display=excluded.masked_display,whatsapp_available=excluded.whatsapp_available,is_primary_phone=excluded.is_primary_phone,verification_status=excluded.verification_status,connection_status=excluded.connection_status,consent_status=excluded.consent_status,consent_source=excluded.consent_source,consent_language_version=excluded.consent_language_version,consent_timestamp=excluded.consent_timestamp,preferred_language=excluded.preferred_language,quiet_hours_json=excluded.quiet_hours_json,first_connection_source=COALESCE(whatsapp_profiles.first_connection_source,excluded.first_connection_source),last_inbound_at=COALESCE(excluded.last_inbound_at,whatsapp_profiles.last_inbound_at),last_outbound_at=COALESCE(excluded.last_outbound_at,whatsapp_profiles.last_outbound_at),last_message_status=COALESCE(excluded.last_message_status,whatsapp_profiles.last_message_status),updated_at=excluded.updated_at`)
    .bind(values.userId,values.countryCode || '',values.callingCode || '',values.e164Ciphertext || null,values.e164Iv || null,values.phoneNumberHash || null,values.maskedDisplay || null,values.whatsappAvailable == null ? null : (values.whatsappAvailable ? 1 : 0),values.isPrimaryPhone ? 1 : 0,values.verificationStatus || 'not_provided',values.connectionStatus || 'never_contacted',values.consentStatus || 'not_requested',values.consentSource || null,values.consentLanguageVersion || null,values.consentTimestamp || null,values.preferredLanguage || null,values.quietHours ? JSON.stringify(values.quietHours) : null,values.firstConnectionSource || null,values.lastInboundAt || null,values.lastOutboundAt || null,values.lastMessageStatus || null,values.createdAt || timestamp,timestamp).run();
};
const recordConsent = async (env, request, values) => {
  const timestamp = now();
  await env.DB.prepare('INSERT INTO whatsapp_consent_events (id,user_id,phone_number_hash,category,status,language_version,source,ip_audit_hash,user_agent,administrator_id,created_at,withdrawn_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(),values.userId || user(request),values.phoneNumberHash || null,values.category,values.status,values.languageVersion || 'wa-consent-v1',values.source || 'unknown',null,requestUserAgent(request),values.administratorId || null,timestamp,values.status === 'withdrawn' ? timestamp : null).run();
};
const upsertConversation = async (env, providerHash, userId, provisionalId, queueCategory = 'New', dataset = 'production') => {
  let conversation = await env.DB.prepare('SELECT * FROM whatsapp_conversations WHERE provider_identifier_hash=? AND dataset=? ORDER BY updated_at DESC LIMIT 1').bind(providerHash,dataset).first();
  const timestamp = now();
  if (!conversation) {
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO whatsapp_conversations (id,user_id,provisional_contact_id,provider_identifier_hash,queue_category,status,created_at,updated_at,dataset) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,userId || null,provisionalId || null,providerHash,queueCategory,'open',timestamp,timestamp,dataset).run();
    conversation = { id, user_id:userId || null, provisional_contact_id:provisionalId || null, provider_identifier_hash:providerHash, queue_category:queueCategory, status:'open', dataset };
  } else {
    await env.DB.prepare('UPDATE whatsapp_conversations SET user_id=COALESCE(?,user_id),provisional_contact_id=COALESCE(?,provisional_contact_id),updated_at=? WHERE id=?').bind(userId || null,provisionalId || null,timestamp,conversation.id).run();
  }
  return conversation;
};
const processInboundWhatsAppMessage = async (env, request, message, campaignCode = '') => {
  const providerId = String(message?.from || '').replace(/[^0-9]/g,'').slice(0,40); if (!providerId) return;
  const providerHash = await lookupHash(env, providerId), timestamp = now(), text = whatsappText(message);
  let identity = await env.DB.prepare("SELECT * FROM whatsapp_identity_links WHERE provider_identifier_hash=? AND identity_match_state='linked_to_user' ORDER BY updated_at DESC LIMIT 1").bind(providerHash).first();
  let userId = identity?.user_id || null, provisionalId = identity?.provisional_contact_id || null;
  const codeMatch = text.match(/\bCONNECT\s+(BTC-[A-Z0-9]{4,24})\b/i);
  if (!userId && codeMatch) {
    const suppliedHash = await lookupHash(env, `CONNECT ${codeMatch[1].toUpperCase()}`);
    const code = await env.DB.prepare('SELECT * FROM whatsapp_connection_codes WHERE code_hash=? AND used_at IS NULL AND expires_at>? LIMIT 1').bind(suppliedHash,timestamp).first();
    if (code) {
      const used = await env.DB.prepare('UPDATE whatsapp_connection_codes SET used_at=? WHERE id=? AND used_at IS NULL AND expires_at>?').bind(timestamp,code.id,timestamp).run();
      if (used?.meta?.changes !== 0) {
        userId = code.user_id;
        const existing = await env.DB.prepare("SELECT * FROM whatsapp_identity_links WHERE provider_identifier_hash=? AND identity_match_state='linked_to_user' LIMIT 1").bind(providerHash).first();
        if (existing && existing.user_id !== userId) {
          await env.DB.prepare('INSERT INTO whatsapp_identity_conflicts (id,provider_identifier_hash,candidate_user_id,existing_user_id,status,reason,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),providerHash,userId,existing.user_id,'OPEN','Provider identity already linked',timestamp,timestamp).run();
          userId = null;
        } else {
          const encrypted = await encryptSecret(env.PHONE_ENCRYPTION_KEY || env.ENCRYPTION_KEY, providerId);
          const linkId = crypto.randomUUID();
          await env.DB.prepare('INSERT INTO whatsapp_identity_links (id,user_id,provider_identifier_ciphertext,provider_identifier_iv,provider_identifier_hash,identity_match_state,linked_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(linkId,userId,encrypted?.ciphertext || null,encrypted?.iv || null,providerHash,'linked_to_user',timestamp,timestamp,timestamp).run();
          const profile = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(userId).first();
          if (profile) await env.DB.prepare("UPDATE whatsapp_profiles SET connection_status='connected',verification_status=CASE WHEN verification_status='not_provided' THEN 'verified' ELSE verification_status END,last_inbound_at=?,updated_at=? WHERE user_id=?").bind(timestamp,timestamp,userId).run();
          await auditWhatsApp(env,request,'whatsapp_identity_linked','user',userId,'success','User-initiated connection code redeemed','','connected',{source:'inbound_code'});
        }
      }
    }
  }
  if (!userId && !provisionalId) {
    provisionalId = crypto.randomUUID();
    const encrypted = await encryptSecret(env.PHONE_ENCRYPTION_KEY || env.ENCRYPTION_KEY, providerId);
    await env.DB.prepare('INSERT OR IGNORE INTO whatsapp_provisional_contacts (provisional_contact_id,provider_identifier_ciphertext,provider_identifier_iv,provider_identifier_hash,source_campaign,identity_match_state,onboarding_stage,first_inbound_at,last_interaction_at,dataset,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(provisionalId,encrypted?.ciphertext || null,encrypted?.iv || null,providerHash,campaignCode || null,'provisional_contact','DISCOVERED',timestamp,timestamp,'production',timestamp,timestamp).run();
    await env.DB.prepare('INSERT OR IGNORE INTO whatsapp_identity_links (id,provisional_contact_id,provider_identifier_ciphertext,provider_identifier_iv,provider_identifier_hash,identity_match_state,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),provisionalId,encrypted?.ciphertext || null,encrypted?.iv || null,providerHash,'provisional_contact',timestamp,timestamp).run();
  }
  const conversation = await upsertConversation(env,providerHash,userId,provisionalId,isWhatsAppOptOut(text) ? 'Opted out' : 'New');
  const bodySecret = env.MESSAGE_ENCRYPTION_KEY || env.PHONE_ENCRYPTION_KEY || env.ENCRYPTION_KEY;
  const encryptedBody = await encryptSecret(bodySecret,text);
  await env.DB.prepare('INSERT OR IGNORE INTO whatsapp_messages (id,user_id,conversation_id,provider_message_id,direction,sender_type,message_type,body_ciphertext,body_iv,status,created_at,updated_at,dataset) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),userId,conversation.id,String(message?.id || '').slice(0,240) || null,'inbound','participant','text',encryptedBody?.ciphertext || null,encryptedBody?.iv || null,'delivered',timestamp,timestamp,'production').run();
  if (userId) {
    if (isWhatsAppOptOut(text)) {
      const profile = await env.DB.prepare('SELECT phone_number_hash FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(userId).first();
      await env.DB.prepare("UPDATE whatsapp_profiles SET consent_status='withdrawn',connection_status='opted_out',last_inbound_at=?,last_message_status='delivered',updated_at=? WHERE user_id=?").bind(timestamp,timestamp,userId).run();
      await recordConsent(env,request,{userId,phoneNumberHash:profile?.phone_number_hash,category:'marketing',status:'withdrawn',source:'whatsapp_stop',languageVersion:'wa-consent-v1'});
      await recordConsent(env,request,{userId,phoneNumberHash:profile?.phone_number_hash,category:'service',status:'withdrawn',source:'whatsapp_stop',languageVersion:'wa-consent-v1'});
      await auditWhatsApp(env,request,'consent_withdrawn','user',userId,'success','Inbound STOP command','','opted_out',{keyword:text.toLowerCase()});
    } else {
      await env.DB.prepare("UPDATE whatsapp_profiles SET connection_status=CASE WHEN connection_status='never_contacted' THEN 'conversation_started' ELSE connection_status END,last_inbound_at=?,last_message_status='delivered',updated_at=? WHERE user_id=?").bind(timestamp,timestamp,userId).run();
    }
  }
};
const processWhatsAppStatuses = async (env, statuses = []) => {
  for (const status of statuses || []) {
    const normalized = providerStatus(status?.status); if (!normalized || !status?.id) continue;
    const timestamp = now(), providerId = String(status.id).slice(0,240), errorRef = String(status?.errors?.[0]?.code || status?.errors?.[0]?.title || '').slice(0,120);
    const message = await env.DB.prepare('SELECT id FROM whatsapp_messages WHERE provider_message_id=? LIMIT 1').bind(providerId).first();
    await env.DB.prepare('INSERT INTO whatsapp_message_status_events (id,message_id,provider_message_id,status,safe_error_summary,provider_error_reference,occurred_at,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),message?.id || null,providerId,normalized,normalized === 'failed' || normalized === 'undeliverable' ? 'Provider delivery failed' : null,errorRef,status?.timestamp ? new Date(Number(status.timestamp) * 1000).toISOString() : timestamp,timestamp).run();
    await env.DB.prepare('UPDATE whatsapp_messages SET status=?,safe_error_summary=?,provider_error_reference=?,updated_at=? WHERE provider_message_id=?').bind(normalized,normalized === 'failed' || normalized === 'undeliverable' ? 'Provider delivery failed' : null,errorRef || null,timestamp,providerId).run();
  }
};
const randomConnectionCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `BTC-${[...bytes].map(byte => alphabet[byte % alphabet.length]).join('')}`;
};
const aggregateConsent = (service, marketing, explicit = true) => !explicit ? 'not_requested' : service && marketing ? 'service_and_marketing' : service ? 'service_only' : 'declined';
const serviceWindowOpen = row => Boolean(row?.last_inbound_at && Date.now() - Date.parse(row.last_inbound_at) <= 24 * 60 * 60 * 1000);
const quietHoursActive = row => {
  if (!row?.quiet_hours_json) return false;
  try {
    const quiet = JSON.parse(row.quiet_hours_json); if (!quiet?.enabled || !quiet.start || !quiet.end) return false;
    const nowValue = new Intl.DateTimeFormat('en-GB',{timeZone:quiet.timezone || 'UTC',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
    const minute = Number(nowValue.slice(0,2)) * 60 + Number(nowValue.slice(3,5)), start = Number(quiet.start.slice(0,2)) * 60 + Number(quiet.start.slice(3,5)), end = Number(quiet.end.slice(0,2)) * 60 + Number(quiet.end.slice(3,5));
    return start <= end ? minute >= start && minute < end : minute >= start || minute < end;
  } catch (_) { return false; }
};
const safeConversation = row => ({ id:row.id, userId:row.user_id || null, provisionalContactId:row.provisional_contact_id || null, queueCategory:row.queue_category, status:row.status, assignedTo:row.assigned_to || null, onboardingStage:row.onboarding_stage, automationPaused:Boolean(row.automation_paused), lastInboundAt:row.last_inbound_at || null, lastOutboundAt:row.last_outbound_at || null, createdAt:row.created_at, updatedAt:row.updated_at, dataset:row.dataset });
const sendAuthorizedWhatsAppMessage = async (env, request, payload = {}) => {
  const targetUserId = String(payload.targetUserId || '').slice(0,160), body = String(payload.body || '').trim().slice(0,4000), category = ['service','marketing','authentication'].includes(payload.category) ? payload.category : 'service';
  if (!targetUserId) return { error:'A recipient is required', status:400 };
  const profile = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(targetUserId).first();
  if (!profile?.e164_ciphertext) return { error:'The recipient has no stored WhatsApp number', status:409 };
  if (profile.whatsapp_available === 0 || profile.connection_status === 'opted_out' || profile.consent_status === 'declined' || profile.consent_status === 'withdrawn') return { error:'Messaging is not permitted for this recipient', status:403 };
  if (category === 'marketing' && profile.consent_status !== 'service_and_marketing') return { error:'Marketing consent is required', status:403 };
  if (category !== 'marketing' && !['service_only','service_and_marketing'].includes(profile.consent_status)) return { error:'Service consent is required', status:403 };
  if (!['connected','conversation_started','identity_match_pending'].includes(profile.connection_status)) return { error:'The WhatsApp identity is not connected', status:409 };
  if (quietHoursActive(profile)) return { error:'The recipient is currently in quiet hours', status:409, code:'quiet_hours' };
  const templateName = String(payload.templateName || '').trim().slice(0,120);
  if (!templateName && !serviceWindowOpen(profile)) return { error:'An approved template is required outside the active service window', status:409, code:'template_required' };
  let template = null;
  if (templateName) {
    template = await env.DB.prepare("SELECT * FROM whatsapp_templates WHERE name=? AND approval_status='approved' LIMIT 1").bind(templateName).first();
    if (!template) return { error:'The requested template is not approved', status:409, code:'template_not_approved' };
  }
  const e164 = await decryptSecret(env.PHONE_ENCRYPTION_KEY || env.ENCRYPTION_KEY, profile.e164_ciphertext, profile.e164_iv); if (!e164) return { error:'The protected recipient number could not be read', status:503 };
  const conversation = await upsertConversation(env,profile.phone_number_hash,targetUserId,null,category === 'marketing' ? 'Campaigns' : 'New','production'), timestamp = now(), bodySecret = env.MESSAGE_ENCRYPTION_KEY || env.PHONE_ENCRYPTION_KEY || env.ENCRYPTION_KEY, encrypted = await encryptSecret(bodySecret,body || template?.body || '');
  const messageId = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO whatsapp_messages (id,user_id,conversation_id,direction,sender_type,message_type,body_ciphertext,body_iv,template_name,language,consent_category,status,created_at,updated_at,dataset) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(messageId,user(request),conversation.id,'outbound',payload.senderType === 'human' ? 'human' : 'automated',templateName ? 'template' : 'text',encrypted?.ciphertext || null,encrypted?.iv || null,templateName || null,String(payload.language || env.WHATSAPP_DEFAULT_LANGUAGE || 'en').slice(0,35),category,'queued',timestamp,timestamp,'production').run();
  try {
    const metaPayload = templateName ? { messaging_product:'whatsapp', to:e164.replace(/^\+/,''), type:'template', template:{ name:templateName, language:{code:String(payload.language || template.language || env.WHATSAPP_DEFAULT_LANGUAGE || 'en').slice(0,35)}, components:Array.isArray(payload.components) ? payload.components : [] } } : { messaging_product:'whatsapp', to:e164.replace(/^\+/,''), type:'text', text:{ preview_url:false, body } };
    const result = await metaApiRequest(env,`${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,metaPayload), providerMessageId = String(result?.messages?.[0]?.id || '').slice(0,240);
    await env.DB.prepare("UPDATE whatsapp_messages SET provider_message_id=?,status='sent',attempt_count=attempt_count+1,updated_at=? WHERE id=?").bind(providerMessageId || null,now(),messageId).run();
    await env.DB.prepare("UPDATE whatsapp_profiles SET last_outbound_at=?,last_message_status='sent',updated_at=? WHERE user_id=?").bind(now(),now(),targetUserId).run();
    await env.DB.prepare("UPDATE whatsapp_integration_settings SET last_outbound_at=?,updated_at=? WHERE id='default'").bind(now(),now()).run();
    await auditWhatsApp(env,request,templateName ? 'template_sent' : 'human_message_sent','user',targetUserId,'success',String(payload.reason || '').slice(0,500),'queued','sent',{category,template:templateName || null});
    return { ok:true, messageId, providerMessageId:providerMessageId || null, status:'sent' };
  } catch (error) {
    await env.DB.prepare("UPDATE whatsapp_messages SET status='failed',safe_error_summary=?,provider_error_reference=?,attempt_count=attempt_count+1,updated_at=? WHERE id=?").bind('Provider delivery failed',String(error.providerReference || '').slice(0,120) || null,now(),messageId).run();
    await auditWhatsApp(env,request,'message_send_failed','user',targetUserId,'failed',String(payload.reason || '').slice(0,500),'queued','failed',{category});
    return { error:error.message || 'Message could not be sent', status:error.status >= 400 && error.status < 600 ? error.status : 502, code:error.code || 'send_failed' };
  }
};

// Stripe adapter boundary. Credentials are read from server-side environment
// bindings only and are never accepted from, stored by, or returned to the
// browser. Supported bindings: STRIPE_TEST_SECRET_KEY,
// STRIPE_LIVE_SECRET_KEY, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, and
// STRIPE_WEBHOOK_SECRET.
const stripeSecret = (env, mode = 'test') => mode === 'live'
  ? (env.STRIPE_LIVE_SECRET_KEY || (String(env.STRIPE_SECRET_KEY || '').startsWith('sk_live_') ? env.STRIPE_SECRET_KEY : ''))
  : (env.STRIPE_TEST_SECRET_KEY || (String(env.STRIPE_SECRET_KEY || '').startsWith('sk_test_') ? env.STRIPE_SECRET_KEY : ''));
const stripePublishableKey = (env, mode = 'test') => {
  const candidate = mode === 'live' ? (env.STRIPE_LIVE_PUBLISHABLE_KEY || env.STRIPE_PUBLISHABLE_KEY) : (env.STRIPE_TEST_PUBLISHABLE_KEY || env.STRIPE_PUBLISHABLE_KEY);
  return String(candidate || '').startsWith(mode === 'live' ? 'pk_live_' : 'pk_test_') ? String(candidate) : '';
};
const stripeSettings = async env => {
  const row = await env.DB.prepare("SELECT * FROM stripe_settings WHERE id = 'stripe' LIMIT 1").first();
  let allowedCurrencies = ['usd'];
  try { allowedCurrencies = JSON.parse(row?.allowed_currencies_json || '["usd"]'); } catch (_) {}
  if (!Array.isArray(allowedCurrencies) || !allowedCurrencies.length) allowedCurrencies = ['usd'];
  return {
    enabled:Boolean(row?.enabled), mode:row?.mode === 'live' ? 'live' : 'test',
    defaultCurrency:String(row?.default_currency || 'usd').toLowerCase(),
    allowedCurrencies:allowedCurrencies.filter(value => /^[a-z]{3}$/.test(String(value))).slice(0, 12),
    minimumAmountMinor:Math.max(1, Number(row?.minimum_amount_minor || 50)),
    maximumAmountMinor:Math.max(1, Number(row?.maximum_amount_minor || 1000000)),
    updatedAt:row?.updated_at || null,
  };
};
const stripeConnectionState = (env, settings) => {
  if (!settings.enabled) return 'Disabled';
  if (!stripeSecret(env, settings.mode) || !stripePublishableKey(env, settings.mode)) return 'Not configured';
  return settings.mode === 'live' ? 'Live' : 'Sandbox';
};
const stripeStatus = (env, settings, includeAdmin = false) => ({
  provider:'Stripe', adapter:'stripe-v1', enabled:settings.enabled, mode:settings.mode,
  connectionState:stripeConnectionState(env, settings), defaultCurrency:settings.defaultCurrency,
  allowedCurrencies:settings.allowedCurrencies, minimumAmountMinor:settings.minimumAmountMinor,
  maximumAmountMinor:settings.maximumAmountMinor, updatedAt:settings.updatedAt,
  webhookPath:'/api/payments/stripe/webhook',
  ...(includeAdmin ? {
    credentials:{ secretKeyConfigured:Boolean(stripeSecret(env, settings.mode)), publishableKeyConfigured:Boolean(stripePublishableKey(env, settings.mode)), webhookSecretConfigured:Boolean(env.STRIPE_WEBHOOK_SECRET) },
    environmentBindings:['STRIPE_TEST_SECRET_KEY','STRIPE_LIVE_SECRET_KEY','STRIPE_TEST_PUBLISHABLE_KEY','STRIPE_LIVE_PUBLISHABLE_KEY','STRIPE_WEBHOOK_SECRET'],
  } : {})
});
const stripeIntentState = providerState => ({
  requires_payment_method:'Created', requires_confirmation:'Created', requires_action:'Pending authorization',
  processing:'Processing', requires_capture:'Processing', succeeded:'Paid', canceled:'Expired'
})[providerState] || 'Created';
const stripeRequest = async (env, settings, path, options = {}) => {
  const secret = stripeSecret(env, settings.mode);
  if (!secret) throw Object.assign(new Error('Stripe credentials are not configured'), { status:503, code:'stripe_not_configured' });
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method:options.method || 'GET',
    headers:{ Authorization:`Bearer ${secret}`, ...(options.body ? {'content-type':'application/x-www-form-urlencoded'} : {}), ...(options.idempotencyKey ? {'Idempotency-Key':options.idempotencyKey} : {}) },
    body:options.body || undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error('Stripe rejected the request'), { status:response.status, code:result?.error?.code || 'stripe_request_failed', type:result?.error?.type || 'provider_error' });
  return result;
};
const safeCurrencyList = value => [...new Set((Array.isArray(value) ? value : []).map(item => String(item || '').trim().toLowerCase()).filter(item => /^[a-z]{3}$/.test(item)))].slice(0, 12);
const safeHexEqual = (left, right) => {
  const a=String(left || '').toLowerCase(), b=String(right || '').toLowerCase();
  if (a.length !== b.length || !a.length) return false;
  let difference=0; for (let index=0; index<a.length; index++) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
};
const sha256Hex = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value))))].map(byte => byte.toString(16).padStart(2,'0')).join('');
const verifyStripeSignature = async (payload, header, secret) => {
  const parts=String(header || '').split(',').map(part => part.trim().split('='));
  const timestamp=Number(parts.find(([key]) => key === 't')?.[1]);
  const signatures=parts.filter(([key]) => key === 'v1').map(([,value]) => value);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now()/1000 - timestamp) > 300 || !signatures.length || !secret) return false;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected=[...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2,'0')).join('');
  return signatures.some(signature => safeHexEqual(signature, expected));
};
const slugPart = value => String(value || "").normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const profileSlug = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const PROFILE_LOCATION_GROUPS = {
  Africa: "Algeria|Angola|Benin|Botswana|Burkina Faso|Burundi|Cabo Verde|Cameroon|Central African Republic|Chad|Comoros|Congo (Republic of the Congo)|Côte d'Ivoire|Democratic Republic of the Congo|Djibouti|Egypt|Equatorial Guinea|Eritrea|Eswatini|Ethiopia|Gabon|Gambia|Ghana|Guinea|Guinea-Bissau|Kenya|Lesotho|Liberia|Libya|Madagascar|Malawi|Mali|Mauritania|Mauritius|Morocco|Mozambique|Namibia|Niger|Nigeria|Rwanda|Sao Tome and Principe|Senegal|Seychelles|Sierra Leone|Somalia|South Africa|South Sudan|Sudan|Tanzania|Togo|Tunisia|Uganda|Zambia|Zimbabwe".split('|'),
  Asia: "Afghanistan|Armenia|Azerbaijan|Bahrain|Bangladesh|Bhutan|Brunei|Cambodia|China|Cyprus|Georgia|India|Indonesia|Iran|Iraq|Israel|Japan|Jordan|Kazakhstan|Kuwait|Kyrgyzstan|Laos|Lebanon|Malaysia|Maldives|Mongolia|Myanmar|Nepal|North Korea|Oman|Pakistan|Palestine|Philippines|Qatar|Saudi Arabia|Singapore|South Korea|Sri Lanka|Syria|Tajikistan|Thailand|Timor-Leste|Turkey|Turkmenistan|United Arab Emirates|Uzbekistan|Vietnam|Yemen".split('|'),
  Europe: "Albania|Andorra|Austria|Belarus|Belgium|Bosnia and Herzegovina|Bulgaria|Croatia|Czechia|Denmark|Estonia|Finland|France|Germany|Greece|Holy See (Vatican City)|Hungary|Iceland|Ireland|Italy|Latvia|Liechtenstein|Lithuania|Luxembourg|Malta|Moldova|Monaco|Montenegro|Netherlands|North Macedonia|Norway|Poland|Portugal|Romania|Russia|San Marino|Serbia|Slovakia|Slovenia|Spain|Sweden|Switzerland|Ukraine|United Kingdom".split('|'),
  "North America": "Antigua and Barbuda|Bahamas|Barbados|Belize|Canada|Costa Rica|Cuba|Dominica|Dominican Republic|El Salvador|Grenada|Guatemala|Haiti|Honduras|Jamaica|Mexico|Nicaragua|Panama|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Trinidad and Tobago|United States".split('|'),
  Oceania: "Australia|Fiji|Kiribati|Marshall Islands|Micronesia (Federated States of)|Nauru|New Zealand|Palau|Papua New Guinea|Samoa|Solomon Islands|Tonga|Tuvalu|Vanuatu".split('|'),
  "South America": "Argentina|Bolivia|Brazil|Chile|Colombia|Ecuador|Guyana|Paraguay|Peru|Suriname|Uruguay|Venezuela".split('|'),
  Zealandia: [],
  Antarctica: [],
};
const PROFILE_COUNTRY_ALIASES = { 'Ivory Coast':"Côte d'Ivoire", 'Vatican City':'Holy See (Vatican City)', USA:'United States' };
const canonicalProfileCountry = value => PROFILE_COUNTRY_ALIASES[String(value || '').trim()] || String(value || '').trim();
const PROFILE_COUNTRY_CONTINENTS = new Map(Object.entries(PROFILE_LOCATION_GROUPS).flatMap(([continent,countries]) => countries.map(country => [country,continent])));
let profileColumnsPromise = null;
const ensureProfileColumns = env => profileColumnsPromise || (profileColumnsPromise = (async () => {
  const { results } = await env.DB.prepare('PRAGMA table_info(profiles)').all();
  const columns = new Set((results || []).map(row => row.name));
  const additions = [
    ['bio', "ALTER TABLE profiles ADD COLUMN bio TEXT NOT NULL DEFAULT ''"],
    ['languages', "ALTER TABLE profiles ADD COLUMN languages TEXT NOT NULL DEFAULT ''"],
    ['availability', "ALTER TABLE profiles ADD COLUMN availability TEXT NOT NULL DEFAULT 'Not set'"],
    ['participation', "ALTER TABLE profiles ADD COLUMN participation TEXT NOT NULL DEFAULT 'Remote and in-person'"],
    ['birth_month', 'ALTER TABLE profiles ADD COLUMN birth_month INTEGER'],
    ['birth_year', 'ALTER TABLE profiles ADD COLUMN birth_year INTEGER'],
    ['avatar_url', 'ALTER TABLE profiles ADD COLUMN avatar_url TEXT'],
    ['referred_by_user_id', 'ALTER TABLE profiles ADD COLUMN referred_by_user_id TEXT'],
  ].filter(([name]) => !columns.has(name)).map(([, statement]) => env.DB.prepare(statement));
  if (additions.length) await env.DB.batch(additions);
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS profiles_referrer ON profiles (referred_by_user_id)').run();
})());
const profileSafe = row => {
  if (!row) return null;
  let skills = [], interests = [];
  try { skills = JSON.parse(row.skills_json || '[]'); } catch (_) {}
  try { interests = JSON.parse(row.interests_json || '[]'); } catch (_) {}
  return { display_name:row.display_name, slug:row.slug || '', continent:row.continent, country:row.country || '', city:row.city || '', bio:row.bio || '', languages:row.languages || '', availability:row.availability || 'Not set', participation:row.participation || 'Remote and in-person', birth_month:row.birth_month || '', birth_year:row.birth_year || '', avatar_url:row.avatar_url || '', referred_by:row.referred_by_user_id ? { user_id:row.referred_by_user_id, display_name:row.referred_by_display_name || '', slug:row.referred_by_slug || '', avatar_url:row.referred_by_avatar_url || '/uploads/sbtc-lo.png' } : null, skills:Array.isArray(skills) ? skills : [], interests:Array.isArray(interests) ? interests : [], updated_at:row.updated_at };
};
const safeCountry = row => {
  if (!row) return null;
  let focus = [], sdgs = [], aliases = [];
  try { focus = JSON.parse(row.focus_json || '[]'); } catch (_) {}
  try { sdgs = JSON.parse(row.sdgs_json || '[]'); } catch (_) {}
  try { aliases = JSON.parse(row.aliases_json || '[]'); } catch (_) {}
  return { id:row.id, name:row.name, slug:row.slug, iso3:row.iso3, continent:row.continent_group, region:row.region, lat:row.latitude, lon:row.longitude, status:row.status, summary:row.summary || '', focus:Array.isArray(focus) ? focus : [], sdgs:Array.isArray(sdgs) ? sdgs : [], aliases:Array.isArray(aliases) ? aliases : [], image:row.image_url ? { url:row.image_url, alt:row.image_alt || row.name, poi:row.image_poi || '', prompt:row.image_prompt || '', updated_at:row.image_updated_at || '' } : null };
};
const locationSlug = row => {
  const base = slugPart(row.name) || 'poi';
  const suffix = slugPart(row.id) || 'record';
  return `${base.slice(0, 90)}-${suffix.slice(0, 80)}`.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};
const safeLocation = row => {
  const safe = { ...row };
  const protectedPrecision = ['Exact', 'Approximate', 'Settlement', 'County/Region', 'Country Only', 'Hidden'].includes(row.privacy) && ['orphanage', 'children_home'].includes(row.category);
  if (['Hidden','County/Region','Country Only'].includes(row.privacy) || row.archived || row.visibility !== 'public' || protectedPrecision) {
    safe.latitude = null;
    safe.longitude = null;
  } else if (['Approximate','Settlement'].includes(row.privacy) && row.latitude != null && row.longitude != null) {
    safe.latitude = Math.round(Number(row.latitude) * 100) / 100;
    safe.longitude = Math.round(Number(row.longitude) * 100) / 100;
  }
  delete safe.user_id;
  safe.slug = row.slug || locationSlug(row);
  return safe;
};
const validCoordinate = (value, min, max) => Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
const safeHttpUrl = value => /^https?:\/\//i.test(String(value || "")) ? String(value).slice(0, 500) : "";
const impactDate = value => {const text=String(value||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return false;const date=new Date(`${text}T00:00:00Z`);return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===text;};
const impactPublicClaim = row => ({
  id:row.id,title:row.title,claim_type:row.claim_type,value:row.value,unit:row.unit,
  indicator_definition:row.indicator_definition,period_start:row.period_start,period_end:row.period_end,
  country_iso3:row.country_iso3,mission_id:row.mission_id,sdg:row.sdg,method:row.method,
  limitations:row.limitations,source_name:row.source_name,public_precision:row.public_precision,
  status:row.status,reviewed_at:row.reviewed_at,published_at:row.published_at,updated_at:row.updated_at
});
const impactClaimInput = payload => ({
  title:String(payload?.title || '').trim().slice(0,180),
  claim_type:['Participation','Output','Outcome','Impact'].includes(payload?.claim_type) ? payload.claim_type : 'Output',
  value:payload?.value==null||payload.value===''?NaN:Number(payload.value),unit:String(payload?.unit || '').trim().slice(0,80),
  indicator_definition:String(payload?.indicator_definition || '').trim().slice(0,700),
  period_start:String(payload?.period_start || ''),period_end:String(payload?.period_end || ''),
  country_iso3:String(payload?.country_iso3 || '').toUpperCase().slice(0,3),
  mission_id:String(payload?.mission_id || '').slice(0,120),
  sdg:/^SDG (0[1-9]|1[0-7])$/.test(String(payload?.sdg || '')) ? payload.sdg : '',
  method:String(payload?.method || '').trim().slice(0,1200),
  limitations:String(payload?.limitations || '').trim().slice(0,700),
  source_name:String(payload?.source_name || '').trim().slice(0,180),
  public_precision:'Country Only'
});
const MEDIA_TYPES = ['music', 'video', 'document'];
const MEDIA_STATUSES = ['Pending Review', 'Approved', 'Rejected', 'Archived'];
const JUKEBOX_STATUSES = ['Pending Review', 'Approved', 'Rejected', 'Archived'];
const jukeboxSubmissionWindows = new Map();
const jukeboxOwner = request => {
  return owner(request);
};
const jukeboxAccent = countryId => {
  const accents = ['#84e4e5', '#ff9879', '#eacb83', '#b9a5ff', '#8fd5a4', '#9ed0ff'];
  const hash = [...String(countryId || '')].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return accents[hash % accents.length];
};
const safeColor = value => /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value).toLowerCase() : '';
const jukeboxRateLimited = request => {
  const id = user(request), current = Date.now(), windowMs = 10 * 60 * 1000, limit = 5;
  const previous = jukeboxSubmissionWindows.get(id) || [];
  const recent = previous.filter(timestamp => current - timestamp < windowMs);
  if (recent.length >= limit) { jukeboxSubmissionWindows.set(id, recent); return true; }
  recent.push(current); jukeboxSubmissionWindows.set(id, recent);
  if (jukeboxSubmissionWindows.size > 5000) jukeboxSubmissionWindows.clear();
  return false;
};
const mediaSource = (value, type) => {
  const sourceUrl = safeHttpUrl(value);
  if (!sourceUrl) return null;
  let parsed;
  try { parsed = new URL(sourceUrl); } catch (_) { return null; }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (type === 'document') return { source_type: 'document-link', source_url: sourceUrl, embed_url: '' };
  if (['youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host)) {
    const match = sourceUrl.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/i);
    if (!match) return null;
    return { source_type: 'YouTube', source_url: sourceUrl, embed_url: `https://www.youtube-nocookie.com/embed/${match[1]}` };
  }
  if (host === 'soundcloud.com' || host === 'w.soundcloud.com') {
    if (!/soundcloud\.com\//i.test(sourceUrl)) return null;
    return { source_type: 'SoundCloud', source_url: sourceUrl, embed_url: `https://w.soundcloud.com/player/?url=${encodeURIComponent(sourceUrl)}&color=%23197f85&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true` };
  }
  if (host === 'open.spotify.com') {
    const match = parsed.pathname.match(/^\/(track|album|playlist|episode)\/([A-Za-z0-9]+)(?:\/|$)/i);
    if (!match) return null;
    return { source_type: 'Spotify', source_url: sourceUrl, embed_url: `https://open.spotify.com/embed/${match[1].toLowerCase()}/${match[2]}` };
  }
  if (type === 'video' && (host === 'vimeo.com' || host === 'player.vimeo.com')) {
    const match = sourceUrl.match(/(?:vimeo\.com\/|video\/)(\d{6,})/i);
    if (!match) return null;
    return { source_type: 'Vimeo', source_url: sourceUrl, embed_url: `https://player.vimeo.com/video/${match[1]}` };
  }
  return null;
};
const safeMedia = row => ({
  id:row.id, country_id:row.country_id, country_name:row.country_name || '', media_type:row.media_type,
  title:row.title, creator:row.creator || '', source_type:row.source_type, source_url:row.source_url,
  embed_url:row.embed_url || '', language:row.language || '', genre:row.genre || '', description:row.description || '',
  status:row.status, featured:Boolean(row.featured), submitted_by:row.username || 'Community contributor',
  submitted_at:row.submitted_at, reviewed_at:row.reviewed_at || '', updated_at:row.updated_at
});
const safeAdminMedia = row => ({ ...safeMedia(row), reviewer_note:row.reviewer_note || '', reviewed_by:row.reviewed_by || '', user_id:row.user_id });
const safeJukebox = row => ({
  id:row.id, country_id:row.country_id, country_name:row.country_name || '', title:row.title,
  artist:row.artist || '', source_type:row.source_type, provider:row.source_type, source_url:row.source_url,
  embed_url:row.embed_url, language:row.language || '', genre:row.genre || '', context_note:row.context_note || '',
  status:row.status, featured:Boolean(row.featured), archived:Boolean(row.archived), rights_confirmed:Boolean(row.rights_confirmed), rights_status:row.rights_confirmed ? 'Confirmed by submitter' : 'Not confirmed', order_index:Number(row.order_index || 0),
  submitted_by:row.username || 'Community contributor', submitted_at:row.submitted_at, reviewed_at:row.reviewed_at || '', updated_at:row.updated_at
});
const safeAdminJukebox = row => ({ ...safeJukebox(row), reviewed_by:row.reviewed_by || '', reviewer_note:row.reviewer_note || '', user_id:row.user_id });
const defaultJukeboxSettings = country => ({
  country_id:country.id, brand_name:`${country.name} listening room`,
  tagline:'Community-selected sounds, reviewed before publishing.', accent_color:jukeboxAccent(country.id), glow_color:'#eacb83', updated_at:''
});
const jukeboxRowQuery = (env, countryId) => env.DB.prepare("SELECT t.*, c.name AS country_name FROM jukebox_tracks t JOIN countries c ON c.id = t.country_id WHERE t.country_id = ? AND t.status = 'Approved' AND t.archived = 0 ORDER BY t.featured DESC, t.order_index ASC, t.updated_at DESC LIMIT 200").bind(countryId);
const updateJukeboxStatus = async (env, request, id, status) => {
  if (!jukeboxOwner(request)) return json({ error:'Owner authorization required' }, 403);
  const existing = await env.DB.prepare('SELECT * FROM jukebox_tracks WHERE id = ?').bind(id).first();
  if (!existing) return json({ error:'Jukebox track not found' }, 404);
  const uid = user(request), timestamp = now(), archived = status === 'Archived' ? 1 : 0;
  await env.DB.batch([
    env.DB.prepare('UPDATE jukebox_tracks SET status=?,archived=?,reviewed_at=?,reviewed_by=?,updated_at=? WHERE id=?').bind(status, archived, timestamp, uid, timestamp, id),
    env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, `jukebox_${status.toLowerCase().replaceAll(' ','_')}`, id, `Jukebox track status changed from ${existing.status} to ${status}`, timestamp),
  ]);
  const row = await env.DB.prepare('SELECT t.*, c.name AS country_name FROM jukebox_tracks t JOIN countries c ON c.id = t.country_id WHERE t.id = ?').bind(id).first();
  return json({ ok:true, track:safeAdminJukebox(row) });
};
const ADMIN_TABS = ["Overview","WhatsApp Gateway","Users","Locations","Countries","Chapters","Missions","Education","Schools","Universities","Orphanages","Organizations","Partners","Events","Sports","Funding","Evidence","Media","Content","Reports","Audit Log","Settings"];
const safeAdminRecord = row => {
  let details = {};
  try { details = row.details_json ? JSON.parse(row.details_json) : {}; } catch (_) {}
  return { id:row.id, tab:row.tab, title:row.title, summary:row.summary || "", status:row.status, country:row.country || "", source_url:row.source_url || "", visibility:row.visibility || "public", details, created_at:row.created_at, updated_at:row.updated_at };
};
const adminRecordPayload = payload => ({
  tab: ADMIN_TABS.includes(String(payload?.tab)) ? String(payload.tab) : null,
  title: String(payload?.title || "").trim().slice(0, 240),
  summary: String(payload?.summary || "").slice(0, 1200),
  status: String(payload?.status || "Draft").slice(0, 80),
  country: String(payload?.country || "").slice(0, 120),
  source_url: safeHttpUrl(payload?.source_url),
  details_json: JSON.stringify(payload?.details && typeof payload.details === "object" ? payload.details : {}).slice(0, 6000),
  visibility: ["public","private"].includes(payload?.visibility) ? payload.visibility : "public",
});
const safeEventRecord = row => {
  const record = safeAdminRecord(row), details = record.details || {};
  return { ...record, date:String(details.date || row.updated_at || "").slice(0, 80), type:String(details.type || "Community event").slice(0, 80), location:String(details.location || "Online / location to be confirmed").slice(0, 180), organizer:String(details.organizer || "Organizer to be confirmed").slice(0, 180), latitude:Number.isFinite(Number(details.latitude)) ? Number(details.latitude) : null, longitude:Number.isFinite(Number(details.longitude)) ? Number(details.longitude) : null };
};
const COUNTRY_IMAGE_POIS = Object.fromEntries(COUNTRY_CATALOG.map(country=>[country.id,`a recognizable landscape or public landmark in ${country.name}`]));
Object.assign(COUNTRY_IMAGE_POIS, {
  ghana: "Independence Arch in Accra", liberia: "Ducor Hill in Monrovia", nigeria: "the National Mosque in Abuja", senegal: "the African Renaissance Monument in Dakar", "sierra-leone": "the Cotton Tree in Freetown", namibia: "Christ Church in Windhoek", zambia: "Victoria Falls", guinea: "the Grand Mosque of Conakry",
  morocco:"the blue medina of Chefchaouen", "ivory-coast":"the Basilica of Our Lady of Peace in Yamoussoukro", "democratic-republic-of-the-congo":"the Congo River landscape", botswana:"the Okavango Delta", "south-africa":"Table Mountain above Cape Town", tanzania:"Mount Kilimanjaro", kenya:"the Nairobi skyline and savanna", rwanda:"the hills around Kigali", ethiopia:"the rock-hewn churches of Lalibela", egypt:"the Giza pyramids", mauritius:"the Le Morne Brabant peninsula", spain:"the Alhambra in Granada", france:"the Eiffel Tower and Seine", germany:"the Brandenburg Gate in Berlin", italy:"the Colosseum in Rome", switzerland:"the Swiss Alps", norway:"the Geirangerfjord", sweden:"Gamla Stan in Stockholm", "united-kingdom":"the Houses of Parliament in London", netherlands:"the Amsterdam canal ring", belgium:"the Grand Place in Brussels", luxembourg:"Luxembourg Old Town", poland:"the historic center of Kraków", czechia:"Prague Castle", romania:"Bran Castle and the Carpathians", bulgaria:"Rila Monastery", ukraine:"St. Sophia Cathedral in Kyiv", turkey:"the Hagia Sophia skyline in Istanbul", monaco:"the harbor of Monaco", "vatican-city":"St. Peter's Basilica", "saudi-arabia":"the AlUla sandstone landscape", "united-arab-emirates":"the Dubai skyline at sunset", india:"the Taj Mahal in Agra", thailand:"the Grand Palace in Bangkok", singapore:"the Marina Bay skyline", indonesia:"the rice terraces of Bali", vietnam:"Ha Long Bay", australia:"the Sydney Harbour Bridge", "papua-new-guinea":"the highlands near Mount Hagen", vanuatu:"the volcanic coastline of Tanna", "united-states":"the Statue of Liberty and New York Harbor", canada:"the Canadian Rockies", mexico:"Chichén Itzá", brazil:"Christ the Redeemer above Rio", colombia:"the walled city of Cartagena", peru:"Machu Picchu", venezuela:"Angel Falls", grenada:"Grand Anse Beach"
});
const xmlEscape = value => String(value ?? "").replace(/[<>&'\"]/g, character => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[character]));
const eventGeoRss = rows => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:georss="http://www.georss.org/georss" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#" xmlns:btc="https://websim.com/ns/be-the-change">
  <channel>
    <title>Be The Change Events</title>
    <link>https://websim.com/</link>
    <description>Public events published by the Be The Change action network.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rows.map(row=>{const event=safeEventRecord(row), point=event.latitude!=null&&event.longitude!=null?`<georss:point>${event.latitude} ${event.longitude}</georss:point><geo:lat>${event.latitude}</geo:lat><geo:long>${event.longitude}</geo:long>`:"";return `<item><title>${xmlEscape(event.title)}</title><link>${xmlEscape(event.source_url || "https://websim.com/")}</link><guid isPermaLink="false">${xmlEscape(event.id)}</guid><description>${xmlEscape(`${event.summary} · ${event.type} · ${event.location}`)}</description><pubDate>${new Date(event.updated_at || Date.now()).toUTCString()}</pubDate><category>${xmlEscape(event.type)}</category><btc:eventDate>${xmlEscape(event.date)}</btc:eventDate><btc:country>${xmlEscape(event.country)}</btc:country><btc:location>${xmlEscape(event.location)}</btc:location><btc:organizer>${xmlEscape(event.organizer)}</btc:organizer>${point}</item>`;}).join("")}
  </channel>
</rss>`;

const jobText = (value, limit = 2000) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
const jobSlug = value => jobText(value, 100).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'green-job';
const jobHash = value => { let hash = 2166136261; for (const char of String(value || '').toLowerCase()) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(36); };
const jobArray = (value, limit = 12) => (Array.isArray(value) ? value : String(value || '').split(',')).map(item => jobText(item, 80)).filter(Boolean).slice(0, limit);
const JOB_MODES = ['Remote','Hybrid','On-site'];
const JOB_TYPES = ['Full-time','Part-time','Contract','Internship','Volunteer'];
const JOB_STATUSES = ['Pending Review','Published','Rejected','Expired','Archived'];
const greenJobAssessment = payload => {
  const body = `${payload.title || ''} ${payload.summary || ''} ${payload.description || ''} ${payload.green_explanation || ''}`.toLowerCase();
  const groups = [
    ['Renewable energy',['solar','wind','renewable','clean energy','energy efficiency']],
    ['Climate & carbon',['climate','carbon','decarbon','emission','net zero']],
    ['Nature & conservation',['conservation','biodiversity','forestry','ecosystem','wildlife','restoration']],
    ['Circular economy',['circular','recycl','waste','reuse','compost']],
    ['Sustainable food & water',['sustainable agriculture','agroecology','food system','water','irrigation']],
    ['Green buildings & mobility',['green building','sustainable transport','electric vehicle','public transit','mobility']],
    ['Environmental justice',['environmental justice','community resilience','adaptation','just transition']]
  ];
  const categories = groups.filter(([, words]) => words.some(word => body.includes(word))).map(([name]) => name);
  const score = Math.min(100, 20 + categories.length * 16 + (jobText(payload.green_explanation, 800).length >= 80 ? 18 : 0) + (jobText(payload.description, 4000).length >= 220 ? 10 : 0));
  const warnings = [];
  if (!jobText(payload.green_explanation, 800)) warnings.push('Explain how this role produces a measurable environmental or just-transition benefit.');
  if (!payload.salary_min && !payload.salary_max) warnings.push('Add a salary range to improve trust and applicant quality.');
  if (!safeHttpUrl(payload.application_url) && !/^\S+@\S+\.\S+$/.test(String(payload.application_email || ''))) warnings.push('Add a valid application URL or email address.');
  if (/pay.*(fee|deposit)|crypto|telegram|whatsapp only/i.test(body)) warnings.push('This listing contains language that requires additional scam review.');
  return { score, categories:categories.length ? categories : ['Green economy'], warnings, explanation:categories.length ? `Matched ${categories.join(', ')} signals; a reviewer must still verify the environmental claim.` : 'The role needs a clearer, evidence-based green impact statement before publication.' };
};
const safeJob = row => ({
  id:row.id, employer_name:row.employer_name, title:row.title, slug:row.slug, summary:row.summary, description:row.description,
  responsibilities:row.responsibilities || '', requirements:row.requirements || '', skills:safeJsonArray(row.skills_json), categories:safeJsonArray(row.categories_json), sdgs:safeJsonArray(row.sdgs_json),
  country:row.country || '', region:row.region || '', city:row.city || '', work_mode:row.work_mode, employment_type:row.employment_type, experience_level:row.experience_level || '',
  salary_min:row.salary_min, salary_max:row.salary_max, salary_currency:row.salary_currency || '', salary_period:row.salary_period || '', application_url:row.application_url || '', application_email:row.application_email || '',
  source_name:row.source_name || '', source_url:row.source_url || '', provenance:row.provenance, green_score:Number(row.green_score || 0), green_explanation:row.green_explanation || '', verification:row.verification,
  moderation_status:row.moderation_status, published_at:row.published_at || '', closes_at:row.closes_at || '', last_checked_at:row.last_checked_at || '', created_at:row.created_at, updated_at:row.updated_at
});
const jobRss = (rows, origin) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:job="https://websim.com/ns/green-jobs"><channel><title>Be The Change Green Jobs</title><link>${xmlEscape(`${origin}/#jobs`)}</link><description>Reviewed green jobs from the Be The Change network.</description><language>en</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${rows.map(row => { const item=safeJob(row), link=item.application_url || `${origin}/#jobs`; return `<item><title>${xmlEscape(`${item.title} — ${item.employer_name}`)}</title><link>${xmlEscape(link)}</link><guid isPermaLink="false">${xmlEscape(item.id)}</guid><description>${xmlEscape(item.summary)}</description><pubDate>${new Date(item.published_at || item.updated_at).toUTCString()}</pubDate>${item.categories.map(value=>`<category>${xmlEscape(value)}</category>`).join('')}<job:country>${xmlEscape(item.country)}</job:country><job:workMode>${xmlEscape(item.work_mode)}</job:workMode><job:employmentType>${xmlEscape(item.employment_type)}</job:employmentType><job:verified>${xmlEscape(item.verification)}</job:verified></item>`; }).join('')}</channel></rss>`;
const decodeFeedText = value => jobText(String(value || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'"), 5000);
const feedTag = (block, names) => { for (const name of names) { const match=String(block).match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i')); if (match) return decodeFeedText(match[1]); } return ''; };
const feedLink = block => feedTag(block,['link','job:applicationUrl']) || decodeFeedText(String(block).match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1] || '');
const parseJobFeed = (text, type, source) => {
  if (type === 'json' || /^\s*[\[{]/.test(text)) {
    let parsed; try { parsed=JSON.parse(text); } catch (_) { throw new Error('The source did not return valid JSON.'); }
    const rows=Array.isArray(parsed) ? parsed : (parsed.jobs || parsed.results || parsed.items || []);
    return rows.slice(0, 50).map(item=>({ external_id:String(item.id || item.guid || item.url || ''), title:item.title || item.position, employer_name:item.company || item.company_name || item.employer || source.employer_name, description:item.description || item.summary || item.content, summary:item.summary || item.description, country:item.country || item.location?.country, region:item.region || '', city:item.city || item.location?.city || item.location, work_mode:item.work_mode || item.remote_type || (item.remote ? 'Remote' : 'On-site'), employment_type:item.employment_type || item.type || 'Full-time', application_url:item.apply_url || item.application_url || item.url, closes_at:item.expires_at || item.closing_date || '', source_url:item.url || source.feed_url}));
  }
  const blocks=[...String(text).matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(match=>match[2]).slice(0,50);
  return blocks.map(block=>({ external_id:feedTag(block,['guid','id']), title:feedTag(block,['title']), employer_name:feedTag(block,['company','author','dc:creator']) || source.employer_name, description:feedTag(block,['content:encoded','content','description','summary']), summary:feedTag(block,['summary','description']), country:feedTag(block,['job:country','country']), city:feedTag(block,['job:city','location']), work_mode:feedTag(block,['job:workMode','workMode']) || 'On-site', employment_type:feedTag(block,['job:employmentType','employmentType']) || 'Full-time', application_url:feedLink(block), closes_at:feedTag(block,['job:closingDate','closingDate']), source_url:feedLink(block) || source.feed_url}));
};
const publicFeedUrl = value => {
  let parsed; try { parsed=new URL(String(value || '')); } catch (_) { return ''; }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return '';
  const host=parsed.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:') || /^(0|10|127|169\.254|192\.168)\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) return '';
  return parsed.toString();
};
const fetchJobSource = async source => {
  let target=publicFeedUrl(source.feed_url); if (!target) throw new Error('Only public HTTPS feed URLs are allowed.');
  for (let redirects=0; redirects<3; redirects++) {
    const response=await fetch(target,{headers:{accept:'application/rss+xml, application/atom+xml, application/json, text/xml;q=0.9','user-agent':'BeTheChange-GreenJobs/1.0',...(source.last_etag?{'if-none-match':source.last_etag}:{}),...(source.last_modified?{'if-modified-since':source.last_modified}:{})},redirect:'manual'});
    if ([301,302,303,307,308].includes(response.status)) { target=publicFeedUrl(new URL(response.headers.get('location') || '', target).toString()); if (!target) throw new Error('Feed redirected to a blocked address.'); continue; }
    if (response.status === 304) return { notModified:true, response };
    if (!response.ok) throw new Error(`Feed request failed with HTTP ${response.status}.`);
    const text=await response.text(); if (text.length > 2_000_000) throw new Error('Feed exceeds the 2 MB import limit.');
    return { text, response };
  }
  throw new Error('Feed redirected too many times.');
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    await ensureWhatsAppColumns(env);
    if (url.pathname === '/api/jobs/rss.xml' && request.method === 'GET') {
      const clauses=["moderation_status='Published'","archived=0","(closes_at IS NULL OR closes_at='' OR closes_at>=?)"], values=[now()];
      for (const [parameter,column] of [['country','country'],['work_mode','work_mode'],['employment_type','employment_type']]) { const value=jobText(url.searchParams.get(parameter),80); if (value) { clauses.push(`${column}=?`); values.push(value); } }
      const category=jobText(url.searchParams.get('category'),80); if (category) { clauses.push('categories_json LIKE ?'); values.push(`%${category}%`); }
      const { results }=await env.DB.prepare(`SELECT * FROM jobs WHERE ${clauses.join(' AND ')} ORDER BY published_at DESC, updated_at DESC LIMIT 100`).bind(...values).all();
      const latest=results?.[0]?.updated_at || now(), etag=`W/"jobs-${jobHash(`${results.length}-${latest}-${url.search}`)}"`;
      if (request.headers.get('if-none-match') === etag) return new Response(null,{status:304,headers:{etag}});
      return new Response(jobRss(results || [],url.origin),{headers:{'content-type':'application/rss+xml; charset=utf-8','cache-control':'public, max-age=300',etag,'last-modified':new Date(latest).toUTCString()}});
    }
    if (url.pathname === '/api/jobs' && request.method === 'GET') {
      const clauses=["moderation_status='Published'","archived=0","(closes_at IS NULL OR closes_at='' OR closes_at>=?)"], values=[now()];
      const search=jobText(url.searchParams.get('q'),120); if (search) { clauses.push('(title LIKE ? OR employer_name LIKE ? OR summary LIKE ? OR skills_json LIKE ?)'); const term=`%${search}%`; values.push(term,term,term,term); }
      for (const [parameter,column] of [['country','country'],['work_mode','work_mode'],['employment_type','employment_type'],['verification','verification']]) { const value=jobText(url.searchParams.get(parameter),80); if (value && value !== 'All') { clauses.push(`${column}=?`); values.push(value); } }
      const category=jobText(url.searchParams.get('category'),80); if (category && category !== 'All') { clauses.push('categories_json LIKE ?'); values.push(`%${category}%`); }
      const limit=Math.min(100,Math.max(1,Number(url.searchParams.get('limit')) || 40)), offset=Math.max(0,Number(url.searchParams.get('offset')) || 0), where=clauses.join(' AND ');
      const [{ results }, countRow]=await Promise.all([env.DB.prepare(`SELECT * FROM jobs WHERE ${where} ORDER BY CASE verification WHEN 'Verified' THEN 0 ELSE 1 END, published_at DESC, updated_at DESC LIMIT ? OFFSET ?`).bind(...values,limit,offset).all(),env.DB.prepare(`SELECT COUNT(*) AS count FROM jobs WHERE ${where}`).bind(...values).first()]);
      return json({ jobs:(results || []).map(safeJob), count:Number(countRow?.count || 0), offset, limit });
    }
    const publicJobMatch=url.pathname.match(/^\/api\/jobs\/([a-z0-9-]+)$/i);
    if (publicJobMatch && request.method === 'GET') {
      const row=await env.DB.prepare("SELECT * FROM jobs WHERE slug=? AND moderation_status='Published' AND archived=0 LIMIT 1").bind(publicJobMatch[1]).first();
      return row ? json({ job:safeJob(row) }) : json({ error:'Job not found' },404);
    }
    if (url.pathname === '/api/jobs/smart-review' && request.method === 'POST') {
      const payload=await request.json().catch(()=>({})); return json(greenJobAssessment(payload));
    }
    if (url.pathname === '/api/jobs' && request.method === 'POST') {
      const uid=user(request); if (!uid) return json({ error:'Sign in required to submit a job' },401);
      const payload=await request.json().catch(()=>({})), title=jobText(payload.title,160), employer=jobText(payload.employer_name,140), description=jobText(payload.description,6000), greenExplanation=jobText(payload.green_explanation,1200);
      if (!title || !employer || description.length < 80) return json({ error:'Title, employer, and a description of at least 80 characters are required.' },400);
      const applicationUrl=safeHttpUrl(payload.application_url), applicationEmail=/^\S+@\S+\.\S+$/.test(String(payload.application_email || '')) ? String(payload.application_email).slice(0,200) : '';
      if (!applicationUrl && !applicationEmail) return json({ error:'A valid application URL or email is required.' },400);
      const assessment=greenJobAssessment({...payload,title,description,green_explanation:greenExplanation}), id=crypto.randomUUID(), timestamp=now(), slug=`${jobSlug(`${title}-${employer}`)}-${id.slice(0,8)}`, fingerprint=jobHash(`${title}|${employer}|${payload.city || ''}|${payload.country || ''}`);
      const duplicate=await env.DB.prepare("SELECT id FROM jobs WHERE fingerprint=? AND archived=0 AND moderation_status NOT IN ('Rejected','Expired','Archived') LIMIT 1").bind(fingerprint).first();
      if (duplicate) return json({ error:'A matching active listing is already in review or published.', duplicate:true },409);
      const username=jobText(request.headers.get('x-websim-username'),80), categories=jobArray(payload.categories).length ? jobArray(payload.categories) : assessment.categories, mode=JOB_MODES.includes(payload.work_mode) ? payload.work_mode : 'On-site', type=JOB_TYPES.includes(payload.employment_type) ? payload.employment_type : 'Full-time';
      await env.DB.prepare('INSERT INTO jobs (id,user_id,username,employer_name,title,slug,summary,description,responsibilities,requirements,skills_json,categories_json,sdgs_json,country,region,city,work_mode,employment_type,experience_level,salary_min,salary_max,salary_currency,salary_period,application_url,application_email,source_name,source_url,provenance,green_score,green_explanation,verification,moderation_status,closes_at,archived,fingerprint,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?,?)').bind(id,uid,username,employer,title,slug,jobText(payload.summary || description,420),description,jobText(payload.responsibilities,3000),jobText(payload.requirements,3000),JSON.stringify(jobArray(payload.skills)),JSON.stringify(categories),JSON.stringify(jobArray(payload.sdgs)),jobText(payload.country,100),jobText(payload.region,100),jobText(payload.city,100),mode,type,jobText(payload.experience_level,80),Number(payload.salary_min)||null,Number(payload.salary_max)||null,jobText(payload.salary_currency,8).toUpperCase(),jobText(payload.salary_period,40),applicationUrl,applicationEmail,jobText(payload.source_name || employer,140),safeHttpUrl(payload.source_url),'Community submission',assessment.score,greenExplanation || assessment.explanation,'Unverified','Pending Review',jobText(payload.closes_at,40),fingerprint,timestamp,timestamp).run();
      await env.DB.prepare('INSERT INTO job_audit_log (id,user_id,action,job_id,detail,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),uid,'submit_job',id,`Green score ${assessment.score}; queued for review`,timestamp).run();
      const row=await env.DB.prepare('SELECT * FROM jobs WHERE id=?').bind(id).first();
      return json({ ok:true, status:'Pending Review', job:safeJob(row), assessment },201);
    }
    if (url.pathname === '/api/admin/jobs' && request.method === 'GET') {
      if (!owner(request)) return json({ error:'Owner authorization required' },403);
      const [{ results:jobs },{ results:sources },{ results:runs }]=await Promise.all([env.DB.prepare('SELECT * FROM jobs ORDER BY archived, updated_at DESC LIMIT 500').all(),env.DB.prepare('SELECT * FROM job_sources ORDER BY active DESC, updated_at DESC LIMIT 100').all(),env.DB.prepare('SELECT * FROM job_import_runs ORDER BY started_at DESC LIMIT 30').all()]);
      return json({ jobs:(jobs || []).map(safeJob), sources:sources || [], runs:runs || [] });
    }
    const adminJobMatch=url.pathname.match(/^\/api\/admin\/jobs\/([a-f0-9-]+)$/i);
    if (adminJobMatch && request.method === 'PATCH') {
      if (!owner(request)) return json({ error:'Owner authorization required' },403);
      const payload=await request.json().catch(()=>({})), status=JOB_STATUSES.includes(payload.status) ? payload.status : null; if (!status) return json({ error:'A valid moderation status is required' },400);
      const existing=await env.DB.prepare('SELECT * FROM jobs WHERE id=? LIMIT 1').bind(adminJobMatch[1]).first(); if (!existing) return json({ error:'Job not found' },404);
      if (status === 'Published' && !safeHttpUrl(existing.application_url) && !/^\S+@\S+\.\S+$/.test(String(existing.application_email || ''))) return json({ error:'Add a valid application destination before publishing.' },409);
      if (status === 'Published' && existing.closes_at && new Date(existing.closes_at).getTime() < Date.now()) return json({ error:'This role has already passed its closing date.' },409);
      const timestamp=now(), uid=user(request), verification=['Verified','Source checked','Unverified'].includes(payload.verification) ? payload.verification : (status === 'Published' ? 'Source checked' : 'Unverified'), archived=status === 'Archived' ? 1 : 0;
      await env.DB.batch([env.DB.prepare("UPDATE jobs SET moderation_status=?,verification=?,archived=?,published_at=CASE WHEN ?='Published' THEN COALESCE(published_at,?) ELSE published_at END,updated_at=? WHERE id=?").bind(status,verification,archived,status,timestamp,timestamp,adminJobMatch[1]),env.DB.prepare('INSERT INTO job_audit_log (id,user_id,action,job_id,detail,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),uid,`job_${status.toLowerCase().replaceAll(' ','_')}`,adminJobMatch[1],jobText(payload.note || `Status changed to ${status}`,500),timestamp)]);
      const row=await env.DB.prepare('SELECT * FROM jobs WHERE id=?').bind(adminJobMatch[1]).first(); return json({ ok:true,job:safeJob(row) });
    }
    if (url.pathname === '/api/admin/jobs/sources' && request.method === 'POST') {
      if (!owner(request)) return json({ error:'Owner authorization required' },403);
      const payload=await request.json().catch(()=>({})), feedUrl=publicFeedUrl(payload.feed_url), name=jobText(payload.name,140); if (!name || !feedUrl) return json({ error:'A source name and public HTTPS feed URL are required.' },400);
      const id=crypto.randomUUID(), timestamp=now(), feedType=['auto','rss','atom','json'].includes(payload.feed_type) ? payload.feed_type : 'auto', uid=user(request);
      await env.DB.batch([env.DB.prepare('INSERT INTO job_sources (id,user_id,name,feed_url,feed_type,employer_name,active,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?)').bind(id,uid,name,feedUrl,feedType,jobText(payload.employer_name,140),timestamp,timestamp),env.DB.prepare('INSERT INTO job_audit_log (id,user_id,action,source_id,detail,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),uid,'create_job_source',id,`Approved feed: ${feedUrl}`,timestamp)]);
      return json({ ok:true,source:await env.DB.prepare('SELECT * FROM job_sources WHERE id=?').bind(id).first() },201);
    }
    const sourceSyncMatch=url.pathname.match(/^\/api\/admin\/jobs\/sources\/([a-f0-9-]+)\/sync$/i);
    if (sourceSyncMatch && request.method === 'POST') {
      if (!owner(request)) return json({ error:'Owner authorization required' },403);
      const source=await env.DB.prepare('SELECT * FROM job_sources WHERE id=? AND active=1').bind(sourceSyncMatch[1]).first(); if (!source) return json({ error:'Active job source not found' },404);
      const uid=user(request), runId=crypto.randomUUID(), started=now(); await env.DB.prepare('INSERT INTO job_import_runs (id,user_id,source_id,status,started_at) VALUES (?,?,?,?,?)').bind(runId,uid,source.id,'Running',started).run();
      try {
        const fetched=await fetchJobSource(source); if (fetched.notModified) { await env.DB.prepare("UPDATE job_import_runs SET status='Not Modified',completed_at=? WHERE id=?").bind(now(),runId).run(); return json({ ok:true,status:'Not Modified',created:0,updated:0 }); }
        const entries=parseJobFeed(fetched.text,source.feed_type,source).filter(item=>jobText(item.title,160) && jobText(item.description,6000).length >= 40), timestamp=now(); let created=0,updated=0,skipped=0;
        for (const item of entries) {
          const externalId=jobText(item.external_id || item.application_url || `${item.title}|${item.employer_name}`,240), existing=await env.DB.prepare('SELECT id FROM jobs WHERE source_id=? AND source_external_id=? LIMIT 1').bind(source.id,externalId).first(), assessment=greenJobAssessment(item), title=jobText(item.title,160), employer=jobText(item.employer_name || source.employer_name || source.name,140), description=jobText(item.description,6000), applicationUrl=safeHttpUrl(item.application_url), fingerprint=jobHash(`${title}|${employer}|${item.city || ''}|${item.country || ''}`);
          if (existing) { await env.DB.prepare('UPDATE jobs SET employer_name=?,title=?,summary=?,description=?,country=?,region=?,city=?,work_mode=?,employment_type=?,application_url=?,source_url=?,green_score=?,green_explanation=?,last_checked_at=?,closes_at=?,updated_at=? WHERE id=?').bind(employer,title,jobText(item.summary || description,420),description,jobText(item.country,100),jobText(item.region,100),jobText(item.city,100),JOB_MODES.includes(item.work_mode)?item.work_mode:'On-site',JOB_TYPES.includes(item.employment_type)?item.employment_type:'Full-time',applicationUrl,safeHttpUrl(item.source_url || source.feed_url),assessment.score,assessment.explanation,timestamp,jobText(item.closes_at,40),timestamp,existing.id).run(); updated++; continue; }
          const duplicate=await env.DB.prepare("SELECT id FROM jobs WHERE fingerprint=? AND archived=0 AND moderation_status NOT IN ('Rejected','Expired','Archived') LIMIT 1").bind(fingerprint).first(); if (duplicate) { skipped++; continue; }
          const id=crypto.randomUUID(), slug=`${jobSlug(`${title}-${employer}`)}-${id.slice(0,8)}`;
          await env.DB.prepare("INSERT INTO jobs (id,user_id,employer_name,title,slug,summary,description,categories_json,country,region,city,work_mode,employment_type,application_url,source_id,source_name,source_external_id,source_url,provenance,green_score,green_explanation,verification,moderation_status,closes_at,last_checked_at,archived,fingerprint,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'Pending Review',?,?,0,?,?,?)").bind(id,uid,employer,title,slug,jobText(item.summary || description,420),description,JSON.stringify(assessment.categories),jobText(item.country,100),jobText(item.region,100),jobText(item.city,100),JOB_MODES.includes(item.work_mode)?item.work_mode:'On-site',JOB_TYPES.includes(item.employment_type)?item.employment_type:'Full-time',applicationUrl,source.id,source.name,externalId,safeHttpUrl(item.source_url || source.feed_url),'Imported feed',assessment.score,assessment.explanation,'Unverified',jobText(item.closes_at,40),timestamp,fingerprint,timestamp,timestamp).run(); created++;
        }
        await env.DB.batch([env.DB.prepare("UPDATE job_import_runs SET status='Completed',fetched_count=?,created_count=?,updated_count=?,skipped_count=?,completed_at=? WHERE id=?").bind(entries.length,created,updated,skipped,timestamp,runId),env.DB.prepare('UPDATE job_sources SET last_etag=?,last_modified=?,last_success_at=?,last_error=NULL,updated_at=? WHERE id=?').bind(fetched.response.headers.get('etag'),fetched.response.headers.get('last-modified'),timestamp,timestamp,source.id),env.DB.prepare('INSERT INTO job_audit_log (id,user_id,action,source_id,detail,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),uid,'sync_job_source',source.id,`Fetched ${entries.length}; created ${created}; updated ${updated}; skipped ${skipped}`,timestamp)]);
        return json({ ok:true,status:'Completed',fetched:entries.length,created,updated,skipped });
      } catch (error) {
        const message=jobText(error?.message || 'Feed synchronization failed',500), timestamp=now(); await env.DB.batch([env.DB.prepare("UPDATE job_import_runs SET status='Failed',error=?,completed_at=? WHERE id=?").bind(message,timestamp,runId),env.DB.prepare('UPDATE job_sources SET last_error=?,updated_at=? WHERE id=?').bind(message,timestamp,source.id)]); return json({ error:message },502);
      }
    }
    if (url.pathname === '/api/whatsapp/webhook' && request.method === 'GET') {
      const mode = url.searchParams.get('hub.mode'), verifyToken = url.searchParams.get('hub.verify_token'), challenge = url.searchParams.get('hub.challenge');
      if (!env.WHATSAPP_VERIFY_TOKEN || mode !== 'subscribe' || verifyToken !== env.WHATSAPP_VERIFY_TOKEN) return new Response('Webhook verification failed', { status: 403 });
      return new Response(challenge || '', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
    if (url.pathname === '/api/whatsapp/webhook' && request.method === 'POST') {
      const raw = await request.text();
      if (!env.WHATSAPP_APP_SECRET || !(await metaSignatureValid(raw, request.headers.get('x-hub-signature-256'), env.WHATSAPP_APP_SECRET))) return json({ error: 'Invalid webhook signature' }, 401);
      let payload; try { payload = JSON.parse(raw || '{}'); } catch (_) { return json({ error:'Invalid webhook payload' }, 400); }
      const value = payload?.entry?.[0]?.changes?.[0]?.value || {}, eventId = String(value?.messages?.[0]?.id || value?.statuses?.[0]?.id || payload?.entry?.[0]?.id || await hmacHex(env.WHATSAPP_APP_SECRET, raw)).slice(0, 240);
      const eventType = String(payload?.entry?.[0]?.changes?.[0]?.field || 'whatsapp.event').slice(0, 120), timestamp = now();
      const inserted = await env.DB.prepare('INSERT OR IGNORE INTO whatsapp_webhook_events (event_id,event_type,processing_status,received_at) VALUES (?,?,?,?)').bind(eventId, eventType, 'RECEIVED', timestamp).run();
      if (inserted?.meta?.changes === 0) return json({ ok:true, accepted:true, duplicate:true, eventId });
      await env.DB.prepare("UPDATE whatsapp_integration_settings SET last_valid_webhook_at=?,updated_at=? WHERE id='default'").bind(timestamp,timestamp).run();
      const process = (async () => {
        try {
          const campaignCode = String(value?.messages?.[0]?.text?.body || '').match(/\bBTC-[A-Z0-9]{4,24}\b/i)?.[0] || '';
          for (const message of value.messages || []) await processInboundWhatsAppMessage(env, request, message, campaignCode);
          await processWhatsAppStatuses(env, value.statuses || []);
          await env.DB.prepare("UPDATE whatsapp_webhook_events SET processing_status='PROCESSED',processed_at=? WHERE event_id=?").bind(now(),eventId).run();
        } catch (_) {
          await env.DB.prepare("UPDATE whatsapp_webhook_events SET processing_status='FAILED',processed_at=? WHERE event_id=?").bind(now(),eventId).run();
          await env.DB.prepare("UPDATE whatsapp_integration_settings SET failed_event_count=failed_event_count+1,updated_at=? WHERE id='default'").bind(now()).run();
        }
      })();
      if (ctx?.waitUntil) ctx.waitUntil(process); else await process;
      return json({ ok: true, accepted: true, eventId });
    }
    if (url.pathname === '/api/whatsapp/profile' && request.method === 'GET') {
      const uid = user(request); if (!uid) return json({ error:'Sign in required' },401);
      const row = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(uid).first();
      return json({ profile:safeProfileRow(row), mode:whatsappMode(env) });
    }
    if (url.pathname === '/api/whatsapp/profile' && ['POST','PUT','PATCH'].includes(request.method)) {
      const uid = user(request); if (!uid) return json({ error:'Sign in required' },401);
      const payload = await request.json().catch(() => ({})), available = payload.whatsappAvailable === false ? false : payload.whatsappAvailable === true ? true : null;
      const previous = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(uid).first();
      if (available === null && !String(payload.localNumber || '').trim()) return json({ ok:true, profile:safeProfileRow(previous), mode:whatsappMode(env) });
      let normalized = null;
      if (available !== false) {
        normalized = normalizeWhatsAppNumber(payload.countryCode,payload.callingCode,payload.localNumber);
        if (!normalized) return json({ error:'Enter a valid local number for the selected country' },400);
      }
      const phoneHash = normalized ? await lookupHash(env,normalized.e164) : null;
      if (phoneHash) {
        const conflict = await env.DB.prepare('SELECT user_id FROM whatsapp_profiles WHERE phone_number_hash=? AND user_id<>? LIMIT 1').bind(phoneHash,uid).first();
        if (conflict) return json({ error:'This number cannot be connected to this account. Contact support if you believe this is an error.', code:'number_conflict' },409);
      }
      const timestamp = now(), encrypted = normalized ? await encryptSecret(env.PHONE_ENCRYPTION_KEY || env.ENCRYPTION_KEY,normalized.e164) : null;
      if (previous?.phone_number_hash && previous.phone_number_hash !== phoneHash) await env.DB.prepare('INSERT INTO whatsapp_number_history (id,user_id,phone_number_hash,masked_display,status,changed_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),uid,previous.phone_number_hash,previous.masked_display || null,'changed',timestamp).run();
      await upsertWhatsAppProfile(env,{userId:uid,countryCode:normalized?.countryCode || '',callingCode:normalized?.callingCode || '',e164Ciphertext:encrypted?.ciphertext || null,e164Iv:encrypted?.iv || null,phoneNumberHash:phoneHash,maskedDisplay:normalized ? maskWhatsAppNumber(normalized.e164) : null,whatsappAvailable:available,isPrimaryPhone:Boolean(payload.isPrimaryPhone),verificationStatus:normalized ? (previous?.phone_number_hash === phoneHash ? previous.verification_status : 'unverified') : 'not_provided',connectionStatus:previous?.phone_number_hash && previous.phone_number_hash !== phoneHash ? 'never_contacted' : (previous?.connection_status || 'never_contacted'),consentStatus:previous?.consent_status || 'not_requested',preferredLanguage:String(payload.preferredLanguage || previous?.preferred_language || env.WHATSAPP_DEFAULT_LANGUAGE || 'en').slice(0,35),quietHours:payload.quietHours || null,firstConnectionSource:payload.source || previous?.first_connection_source || null,createdAt:previous?.created_at || timestamp});
      await auditWhatsApp(env,request,normalized ? 'number_added_or_changed' : 'whatsapp_unavailable_selected','user',uid,'success',String(payload.source || 'user_form').slice(0,500),previous?.masked_display || '',normalized ? 'unverified' : 'not_provided',{phoneHash:phoneHash ? 'present' : 'absent'});
      const row = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(uid).first();
      return json({ ok:true, profile:safeProfileRow(row), mode:whatsappMode(env) });
    }
    if (url.pathname === '/api/whatsapp/connect/create-code' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in required' },401);
      const profile = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(uid).first();
      if (!profile?.phone_number_hash || profile.whatsapp_available === 0) return json({ error:'Add a WhatsApp number before connecting' },409);
      const active = await env.DB.prepare('SELECT COUNT(*) AS count FROM whatsapp_connection_codes WHERE user_id=? AND used_at IS NULL AND expires_at>?').bind(uid,now()).first('count');
      if (Number(active || 0) >= 3) return json({ error:'Too many active connection requests. Try again later.' },429);
      const code = randomConnectionCode(), timestamp = now(), expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(), hash = await lookupHash(env,`CONNECT ${code}`);
      await env.DB.prepare('INSERT INTO whatsapp_connection_codes (id,user_id,code_hash,source,expires_at,rate_limit_key,created_at) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),uid,hash,String((await request.json().catch(() => ({})))?.source || 'profile').slice(0,80),expires,'user:'+uid,timestamp).run();
      await env.DB.prepare("UPDATE whatsapp_profiles SET connection_status='identity_match_pending',updated_at=? WHERE user_id=?").bind(timestamp,uid).run();
      await auditWhatsApp(env,request,'verification_initiated','user',uid,'success','User-initiated connection code created','','identity_match_pending');
      return json({ ok:true, code, expiresAt:expires, displayNumber:env.WHATSAPP_DISPLAY_NUMBER || null, mode:whatsappMode(env), startText:`CONNECT ${code}` },201);
    }
    if (url.pathname === '/api/whatsapp/connect/confirm' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in required' },401);
      const row = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(uid).first();
      return json({ ok:true, confirmed:Boolean(row && row.connection_status === 'connected'), profile:safeProfileRow(row), note:'Only a verified Meta webhook event can confirm a WhatsApp connection.' });
    }
    if (url.pathname === '/api/whatsapp/preferences' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in required' },401);
      const payload = await request.json().catch(() => ({})), row = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(uid).first();
      if (!row) return json({ error:'WhatsApp preferences are not set up yet' },404);
      await env.DB.prepare('UPDATE whatsapp_profiles SET preferred_language=?,quiet_hours_json=?,is_primary_phone=?,updated_at=? WHERE user_id=?').bind(String(payload.preferredLanguage || row.preferred_language || '').slice(0,35),payload.quietHours ? JSON.stringify(payload.quietHours) : row.quiet_hours_json, payload.isPrimaryPhone == null ? row.is_primary_phone : (payload.isPrimaryPhone ? 1 : 0),now(),uid).run();
      const updated = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(uid).first();
      return json({ ok:true, profile:safeProfileRow(updated) });
    }
    if (url.pathname === '/api/whatsapp/consent' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in required' },401);
      const payload = await request.json().catch(() => ({})), service = payload.service === true, marketing = payload.marketing === true && service, row = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(uid).first();
      if (!row?.phone_number_hash) return json({ error:'A validated WhatsApp number is required before consent can be recorded' },409);
      const consentStatus = aggregateConsent(service,marketing,payload.explicit !== false), timestamp = now();
      await env.DB.prepare('UPDATE whatsapp_profiles SET consent_status=?,consent_source=?,consent_language_version=?,consent_timestamp=?,updated_at=? WHERE user_id=?').bind(consentStatus,String(payload.source || 'user_form').slice(0,120),String(payload.languageVersion || 'wa-consent-v1').slice(0,80),timestamp,timestamp,uid).run();
      await recordConsent(env,request,{userId:uid,phoneNumberHash:row.phone_number_hash,category:'service',status:service ? 'granted' : 'declined',source:payload.source || 'user_form',languageVersion:payload.languageVersion || 'wa-consent-v1'});
      await recordConsent(env,request,{userId:uid,phoneNumberHash:row.phone_number_hash,category:'marketing',status:marketing ? 'granted' : (payload.explicit === false ? 'not_requested' : 'declined'),source:payload.source || 'user_form',languageVersion:payload.languageVersion || 'wa-consent-v1'});
      await auditWhatsApp(env,request,service ? 'consent_granted' : 'consent_declined','user',uid,'success',String(payload.source || 'user_form').slice(0,500),row.consent_status,consentStatus,{service,marketing});
      return json({ ok:true, consentStatus });
    }
    if (url.pathname === '/api/whatsapp/disconnect' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in required' },401);
      const row = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(uid).first();
      await env.DB.prepare("UPDATE whatsapp_profiles SET connection_status='disconnected',updated_at=? WHERE user_id=?").bind(now(),uid).run();
      await env.DB.prepare("UPDATE whatsapp_identity_links SET identity_match_state='disconnected',disconnected_at=?,updated_at=? WHERE user_id=? AND identity_match_state='linked_to_user'").bind(now(),now(),uid).run();
      await auditWhatsApp(env,request,'identity_disconnected','user',uid,'success','User requested disconnect',row?.connection_status || '', 'disconnected');
      return json({ ok:true, status:'disconnected' });
    }
    if (url.pathname === '/api/whatsapp/request-export' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in required' },401);
      await auditWhatsApp(env,request,'export_requested','user',uid,'queued','User requested WhatsApp data export');
      return json({ ok:true,status:'queued',message:'Your authorized export request has been recorded.' },202);
    }
    if (url.pathname === '/api/whatsapp/request-deletion' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in required' },401);
      await auditWhatsApp(env,request,'deletion_requested','user',uid,'queued','User requested permitted conversation deletion');
      return json({ ok:true,status:'queued',message:'Your deletion request has been recorded for review.' },202);
    }
    if (url.pathname === '/api/whatsapp/send' && request.method === 'POST') {
      if (!user(request)) return json({ error: 'Sign in required' }, 401);
      const configured = env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_API_VERSION;
      if (!configured) return json({ error: 'WhatsApp Cloud API is not configured; demo mode remains available.', code: 'whatsapp_disconnected' }, 503);
      return json({ error: 'Cloud API provider adapter is not enabled in this deployment.' }, 501);
    }
    if (url.pathname === '/api/whatsapp/templates/send' && request.method === 'POST') {
      if (!user(request)) return json({ error: 'Sign in required' }, 401);
      if (!env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_ACCESS_TOKEN) return json({ error: 'WhatsApp template sending is disconnected.' }, 503);
      return json({ error: 'Template delivery requires a protected provider adapter and approved template.' }, 501);
    }
    if (url.pathname === '/api/onboarding/session' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required to create a durable onboarding session' }, 401);
      const payload = await request.json().catch(() => ({})), id = crypto.randomUUID(), timestamp = now(), expires = new Date(Date.now() + 20 * 60 * 1000).toISOString();
      await env.DB.prepare('INSERT INTO whatsapp_onboarding_sessions (id,user_id,source,status,expires_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').bind(id, uid, safeSource(payload?.source), 'DISCOVERED', expires, timestamp, timestamp).run();
      return json({ ok: true, sessionId: id, expiresAt: expires, mode: 'production-session-metadata-only' }, 201);
    }
    if (url.pathname === '/api/onboarding/handoff' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required to create a signed handoff' }, 401);
      if (!env.SESSION_SIGNING_SECRET || !env.ENCRYPTION_KEY) return json({ error: 'Signed handoff is disconnected; configure SESSION_SIGNING_SECRET and ENCRYPTION_KEY.' }, 503);
      const payload = await request.json().catch(() => ({})), id = crypto.randomUUID(), timestamp = now(), expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(), encrypted = await encryptState(env, payload?.state || {});
      if (!encrypted) return json({ error: 'Handoff encryption is unavailable.' }, 503);
      await env.DB.prepare('INSERT INTO whatsapp_onboarding_sessions (id,user_id,source,status,state_ciphertext,state_iv,expires_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, uid, safeSource(payload?.source), String(payload?.status || 'ACCOUNT_LINK_PENDING').slice(0, 80), encrypted.ciphertext, encrypted.iv, expiresAt, timestamp, timestamp).run();
      const tokenPayload = `${id}.${Date.parse(expiresAt)}`, signature = await hmacHex(env.SESSION_SIGNING_SECRET, tokenPayload), token = `${tokenPayload}.${signature}`;
      return json({ ok: true, token, expiresAt, singleUse: true }, 201);
    }
    if (url.pathname === '/api/onboarding/link-account' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required to link an account' }, 401);
      if (!env.SESSION_SIGNING_SECRET) return json({ error: 'Signed handoff is disconnected.' }, 503);
      const payload = await request.json().catch(() => ({})), parts = String(payload?.token || '').split('.');
      if (parts.length !== 3) return json({ error: 'Invalid handoff token' }, 400);
      const [id, expires, signature] = parts, expected = await hmacHex(env.SESSION_SIGNING_SECRET, `${id}.${expires}`);
      if (!secureEqual(signature, expected) || Number(expires) < Date.now()) return json({ error: 'Expired or invalid handoff token' }, 410);
      const row = await env.DB.prepare('SELECT * FROM whatsapp_onboarding_sessions WHERE id = ? AND user_id = ? LIMIT 1').bind(id, uid).first();
      if (!row) return json({ error: 'Handoff not found' }, 404);
      if (row.used_at) return json({ error: 'Handoff already used' }, 409);
      await env.DB.prepare('UPDATE whatsapp_onboarding_sessions SET used_at=?,status=?,updated_at=? WHERE id=? AND used_at IS NULL').bind(now(), 'APPLICATION_IN_PROGRESS', now(), id).run();
      return json({ ok: true, sessionId: id, status: 'APPLICATION_IN_PROGRESS' });
    }
    if (url.pathname === '/api/community/recommend' && request.method === 'POST') {
      if (!user(request)) return json({ error: 'Sign in required' }, 401);
      return json({ recommendations: [], status: 'No connected community directory is available yet.' });
    }
    if (url.pathname === '/api/human-handoff' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const payload = await request.json().catch(() => ({})), id = crypto.randomUUID(), timestamp = now();
      await env.DB.prepare('INSERT INTO whatsapp_support_cases (id,user_id,queue_type,status,summary,consent_reference,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, uid, String(payload?.queueType || 'Needs human response').slice(0, 80), 'OPEN', String(payload?.summary || '').slice(0, 1200), String(payload?.consentReference || '').slice(0, 160), timestamp, timestamp).run();
      return json({ ok: true, caseId: id, status: 'OPEN' }, 201);
    }
    if (url.pathname === '/api/admin/whatsapp/metrics' && request.method === 'GET') {
      const denied = await requirePermission(env,request,'view_analytics'); if (denied) return denied;
      const from = String(url.searchParams.get('from') || '').slice(0,30), to = String(url.searchParams.get('to') || '').slice(0,30), range = from && to ? ' AND created_at>=? AND created_at<=?' : '', bindRange = from && to ? [from,to] : [];
      const count = async (table, where = '', values = []) => { const datasetClause = table === 'whatsapp_profiles' ? '' : "dataset='production' AND "; return Number(await env.DB.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ${datasetClause}1=1${where}`).bind(...values).first('count') || 0); };
      const [contacts,connected,provisional,verified,unverified,declined,serviceOnly,marketing,conversations,completed,failures] = await Promise.all([
        count('whatsapp_conversations',range,bindRange), count('whatsapp_profiles'," AND connection_status='connected'",[]), count('whatsapp_provisional_contacts',range,bindRange), count('whatsapp_profiles'," AND verification_status='verified'",[]), count('whatsapp_profiles'," AND verification_status='unverified'",[]), count('whatsapp_profiles'," AND consent_status='declined'",[]), count('whatsapp_profiles'," AND consent_status='service_only'",[]), count('whatsapp_profiles'," AND consent_status='service_and_marketing'",[]), count('whatsapp_conversations','',[]), count('whatsapp_conversations'," AND onboarding_stage IN ('APPLICATION_SUBMITTED','ACTIVE_PARTICIPANT')",[]), count('whatsapp_messages'," AND status IN ('failed','undeliverable')",[])
      ]);
      return json({ mode:'production', dateRange:{from:from || null,to:to || null}, definitions:{contacts:'Production WhatsApp conversations with a provider identity',connected:'Users with a securely linked WhatsApp identity',provisional:'Inbound contacts without a linked app account',verified:'Users whose ownership was confirmed by a provider event',unverified:'Users with a supplied number not yet verified',declined:'Users who explicitly declined WhatsApp',serviceOnly:'Users opted into essential service messages only',marketing:'Users opted into service and marketing messages',failures:'Production messages with failed or undeliverable status'}, metrics:{contacts,connected,provisional,verified,unverified,declined,serviceOnly,marketing,conversations,completed,failures}, empty:contacts === 0 && conversations === 0 });
    }
    if (url.pathname === '/api/admin/whatsapp/connections' && request.method === 'GET') {
      const denied = await requirePermission(env,request,'view_connections'); if (denied) return denied;
      const search = `%${String(url.searchParams.get('q') || '').trim().toLowerCase().slice(0,80)}%`, filter = String(url.searchParams.get('status') || '').slice(0,60);
      const { results } = await env.DB.prepare(`SELECT w.*,p.display_name,(
        SELECT COUNT(*) FROM whatsapp_support_cases c WHERE c.user_id=w.user_id AND c.status='OPEN' AND c.dataset='production'
      ) AS open_cases FROM whatsapp_profiles w LEFT JOIN profiles p ON p.user_id=w.user_id WHERE (lower(COALESCE(p.display_name,'')) LIKE ? OR lower(w.user_id) LIKE ? OR lower(COALESCE(w.country_code,'')) LIKE ?) AND (?='' OR w.connection_status=?) ORDER BY w.updated_at DESC LIMIT 300`).bind(search,search,search,filter,filter).all();
      return json((results || []).map(row => ({ userId:row.user_id, user:row.display_name || 'Participant', maskedNumber:row.masked_display || '', country:row.country_code || '', language:row.preferred_language || '', verificationStatus:row.verification_status, connectionStatus:row.connection_status, consentStatus:row.consent_status, onboardingStage:'Not recorded', sourceCampaign:row.first_connection_source || null, firstInboundMessageDate:row.last_inbound_at || null, lastInteraction:row.last_inbound_at || row.last_outbound_at || null, assignedStaff:null, openSupportCases:Number(row.open_cases || 0), dataset:'production' })));
    }
    if (url.pathname === '/api/admin/whatsapp/conversations' && request.method === 'GET') {
      const access = await rolePermissions(env,request); if (!access.permissions.includes('*') && !access.permissions.includes('view_conversations') && !access.permissions.includes('view_assigned_conversations')) return json({ error:'WhatsApp conversation permission required' },403);
      const assignedOnly = !access.permissions.includes('*') && !access.permissions.includes('view_conversations');
      const { results } = await env.DB.prepare(`SELECT * FROM whatsapp_conversations WHERE dataset='production' ${assignedOnly ? 'AND assigned_to=?' : ''} ORDER BY updated_at DESC LIMIT 300`).bind(...(assignedOnly ? [user(request)] : [])).all();
      return json((results || []).map(safeConversation));
    }
    if (url.pathname === '/api/admin/whatsapp/messages' && request.method === 'POST') {
      const payload = await request.json().catch(() => ({})), category = String(payload.category || 'service');
      const access = await rolePermissions(env,request); const canSend = access.permissions.includes('*') || access.permissions.includes('send_messages') || (category === 'community' && access.permissions.includes('send_community_messages')) || (category === 'marketplace' && access.permissions.includes('send_marketplace_messages'));
      if (!user(request)) return json({ error:'Sign in required' },401); if (!canSend) return json({ error:'Sending WhatsApp messages is not permitted for this role' },403); if (!String(payload.reason || '').trim()) return json({ error:'A reason is required before sending' },400);
      const result = await sendAuthorizedWhatsAppMessage(env,request,{...payload,senderType:'human'}); return json(result,result.status || (result.ok ? 200 : 400));
    }
    if (url.pathname === '/api/admin/whatsapp/templates/send' && request.method === 'POST') {
      const denied = await requirePermission(env,request,'send_messages'); if (denied) return denied;
      const payload = await request.json().catch(() => ({})); if (!payload.templateName) return json({ error:'An approved template is required' },400); if (!String(payload.reason || '').trim()) return json({ error:'A reason is required before sending' },400);
      const result = await sendAuthorizedWhatsAppMessage(env,request,{...payload,senderType:'human'}); return json(result,result.status || (result.ok ? 200 : 400));
    }
    if (url.pathname === '/api/admin/whatsapp/automations/pause' && request.method === 'POST') {
      const denied = await requirePermission(env,request,'manage_automations'); if (denied) return denied;
      await env.DB.prepare("UPDATE whatsapp_integration_settings SET automation_paused=1,updated_at=? WHERE id='default'").bind(now()).run(); await auditWhatsApp(env,request,'global_automation_paused','integration','default','success','Administrator emergency pause','','paused'); return json({ ok:true, automationPaused:true });
    }
    if (url.pathname === '/api/admin/whatsapp/automations/resume' && request.method === 'POST') {
      const denied = await requirePermission(env,request,'manage_automations'); if (denied) return denied;
      await env.DB.prepare("UPDATE whatsapp_integration_settings SET automation_paused=0,updated_at=? WHERE id='default'").bind(now()).run(); await auditWhatsApp(env,request,'global_automation_resumed','integration','default','success','Administrator resumed outbound automation','paused','resumed'); return json({ ok:true, automationPaused:false });
    }
    if (url.pathname === '/api/admin/whatsapp/templates' && request.method === 'GET') {
      const denied = await requirePermission(env,request,'manage_templates'); if (denied) return denied;
      const { results } = await env.DB.prepare("SELECT id,name,category,language,approval_status,provider_reference,variables_json,created_at,updated_at FROM whatsapp_templates WHERE dataset='production' ORDER BY updated_at DESC LIMIT 300").all(); return json(results || []);
    }
    if (url.pathname === '/api/admin/whatsapp/campaigns' && request.method === 'GET') {
      const denied = await requirePermission(env,request,'view_analytics'); if (denied) return denied;
      const { results } = await env.DB.prepare("SELECT id,name,campaign_code,purpose,country_code,language,program,status,start_at,end_at,created_at,updated_at FROM whatsapp_campaigns WHERE dataset='production' ORDER BY updated_at DESC LIMIT 300").all(); return json(results || []);
    }
    if (url.pathname === '/api/admin/whatsapp/delivery' && request.method === 'GET') {
      const denied = await requirePermission(env,request,'view_analytics'); if (denied) return denied;
      const { results } = await env.DB.prepare("SELECT status,COUNT(*) AS count FROM whatsapp_messages WHERE dataset='production' GROUP BY status ORDER BY status").all(); return json(results || []);
    }
    if (url.pathname === '/api/admin/whatsapp/roles' && request.method === 'GET') {
      const denied = await requirePermission(env,request,'manage_roles'); if (denied) return denied;
      const { results } = await env.DB.prepare('SELECT r.id,r.name,r.description,r.permissions_json,a.user_id,a.assigned_by,a.created_at FROM whatsapp_admin_roles r LEFT JOIN whatsapp_admin_role_assignments a ON a.role_id=r.id ORDER BY r.name,a.created_at DESC').all(); return json(results || []);
    }
    const assignmentMatch = url.pathname.match(/^\/api\/admin\/whatsapp\/conversations\/([^/]+)\/assign$/);
    if (assignmentMatch && request.method === 'POST') {
      const denied = await requirePermission(env,request,'assign_conversations'); if (denied) return denied;
      const conversationId = decodeURIComponent(assignmentMatch[1]), payload = await request.json().catch(() => ({})), assignee = String(payload.assignedTo || '').slice(0,160);
      const existing = await env.DB.prepare('SELECT assigned_to FROM whatsapp_conversations WHERE id=? AND dataset=\'production\' LIMIT 1').bind(conversationId).first(); if (!existing) return json({ error:'Conversation not found' },404);
      await env.DB.prepare('UPDATE whatsapp_conversations SET assigned_to=?,updated_at=? WHERE id=?').bind(assignee || null,now(),conversationId).run(); await auditWhatsApp(env,request,'conversation_assigned','conversation',conversationId,'success','Administrator assigned conversation',existing.assigned_to || '',assignee || 'unassigned'); return json({ ok:true,conversationId,assignedTo:assignee || null });
    }
    if (url.pathname === '/api/admin/whatsapp/audit' && request.method === 'GET') {
      const denied = await requirePermission(env,request,'view_audit'); if (denied) return denied;
      const { results } = await env.DB.prepare('SELECT actor_user_id,actor_role,action,target_type,target_id,reason,result,safe_metadata_json,previous_status,new_status,created_at FROM whatsapp_audit_log ORDER BY created_at DESC LIMIT 300').all(); return json(results || []);
    }
    const revealMatch = url.pathname.match(/^\/api\/admin\/whatsapp\/connections\/([^/]+)\/reveal$/);
    if (revealMatch && request.method === 'POST') {
      const denied = await requirePermission(env,request,'reveal_numbers'); if (denied) return denied;
      const target = decodeURIComponent(revealMatch[1]), row = await env.DB.prepare('SELECT * FROM whatsapp_profiles WHERE user_id=? LIMIT 1').bind(target).first(); if (!row) return json({ error:'Connection not found' },404);
      const number = await decryptSecret(env.PHONE_ENCRYPTION_KEY || env.ENCRYPTION_KEY,row.e164_ciphertext,row.e164_iv); await auditWhatsApp(env,request,'number_revealed','user',target,'success','Authorized full-number reveal'); return json({ userId:target, e164Number:number });
    }
    if (url.pathname === '/api/admin/whatsapp/health' && request.method === 'GET') {
      const denied = await requirePermission(env,request,'view_health'); if (denied) return denied;
      const config = whatsappConfig(env), settings = await env.DB.prepare("SELECT * FROM whatsapp_integration_settings WHERE id='default' LIMIT 1").first(), complete = whatsappProviderReady(env), webhookReady = config.enabled && config.displayNumberConfigured && config.apiVersionConfigured && config.phoneNumberIdConfigured && config.businessAccountConfigured && config.accessTokenConfigured && config.appSecretConfigured && config.verifyTokenConfigured && config.signingSecretConfigured && config.publicAppConfigured && config.lookupHashSecretConfigured && config.encryptionKeyConfigured, status = !envFlag(env.WHATSAPP_ENABLED) ? 'Not configured' : settings?.failed_event_count > 0 ? 'Degraded' : complete ? (settings?.automation_paused ? 'Paused' : 'Connected') : webhookReady && !config.webhookUrlConfigured ? 'Webhook verification pending' : 'Configuration incomplete';
      return json({ status, mode:whatsappMode(env), enabled:envFlag(env.WHATSAPP_ENABLED), displayNumber:env.WHATSAPP_DISPLAY_NUMBER || null, maskedPhoneNumberId:env.WHATSAPP_PHONE_NUMBER_ID ? `••••${String(env.WHATSAPP_PHONE_NUMBER_ID).slice(-4)}` : null, businessAccountConfigured:config.businessAccountConfigured, webhook:{urlConfigured:Boolean(env.WHATSAPP_WEBHOOK_URL),lastValid:settings?.last_valid_webhook_at || null}, lastInboundMessage:settings?.last_inbound_at || null, lastSuccessfulOutbound:settings?.last_outbound_at || null, queueStatus:settings?.automation_paused ? 'paused' : 'ready', failedEventCount:Number(settings?.failed_event_count || 0), templateSynchronization:settings?.template_sync_at || null, tokenStatus:config.accessTokenConfigured ? 'configured' : 'missing', apiVersion:env.WHATSAPP_API_VERSION || null, globalAutomationPaused:Boolean(settings?.automation_paused), productionMode:complete, configuration:config, requiredBindings:whatsappRequiredBindings });
    }
    if (url.pathname === '/api/payments/stripe/status' && request.method === 'GET') {
      const settings=await stripeSettings(env);
      return json(stripeStatus(env,settings,false));
    }
    if (url.pathname === '/api/admin/integrations/stripe' && request.method === 'GET') {
      if (!owner(request)) return json({ error:'Owner authorization required' },403);
      const settings=await stripeSettings(env);
      return json(stripeStatus(env,settings,true));
    }
    if (url.pathname === '/api/admin/integrations/stripe' && request.method === 'POST') {
      if (!owner(request)) return json({ error:'Owner authorization required' },403);
      const payload=await request.json().catch(() => null);
      if (!payload || typeof payload !== 'object') return json({ error:'Valid JSON configuration required' },400);
      const mode=payload.mode === 'live' ? 'live' : 'test', enabled=Boolean(payload.enabled);
      const allowedCurrencies=safeCurrencyList(payload.allowedCurrencies);
      const defaultCurrency=String(payload.defaultCurrency || allowedCurrencies[0] || 'usd').toLowerCase();
      if (!/^[a-z]{3}$/.test(defaultCurrency)) return json({ error:'Default currency must be a three-letter ISO currency code' },400);
      if (!allowedCurrencies.includes(defaultCurrency)) allowedCurrencies.unshift(defaultCurrency);
      const minimum=Math.max(1,Math.min(100000000,Math.round(Number(payload.minimumAmountMinor)||50)));
      const maximum=Math.max(minimum,Math.min(100000000,Math.round(Number(payload.maximumAmountMinor)||1000000)));
      if (enabled && (!stripeSecret(env,mode) || !stripePublishableKey(env,mode))) return json({ error:`Stripe ${mode} credentials are not configured in the server environment. No settings were changed.`, code:'stripe_credentials_missing' },409);
      if (enabled && mode === 'live' && !env.STRIPE_WEBHOOK_SECRET) return json({ error:'A Stripe webhook secret is required before live mode can be enabled. No settings were changed.', code:'stripe_webhook_secret_missing' },409);
      const uid=user(request),timestamp=now();
      await env.DB.batch([
        env.DB.prepare("INSERT INTO stripe_settings (id,enabled,mode,default_currency,allowed_currencies_json,minimum_amount_minor,maximum_amount_minor,updated_at) VALUES ('stripe',?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled,mode=excluded.mode,default_currency=excluded.default_currency,allowed_currencies_json=excluded.allowed_currencies_json,minimum_amount_minor=excluded.minimum_amount_minor,maximum_amount_minor=excluded.maximum_amount_minor,updated_at=excluded.updated_at").bind(enabled?1:0,mode,defaultCurrency,JSON.stringify(allowedCurrencies.slice(0,12)),minimum,maximum,timestamp),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid,'stripe_configuration_updated','stripe',`Stripe adapter ${enabled?'enabled':'disabled'} in ${mode} mode; credentials were not stored`,timestamp),
      ]);
      const settings=await stripeSettings(env);
      return json({ ok:true, stripe:stripeStatus(env,settings,true) });
    }
    if (url.pathname === '/api/admin/integrations/stripe/test' && request.method === 'POST') {
      if (!owner(request)) return json({ error:'Owner authorization required' },403);
      const settings=await stripeSettings(env);
      if (!stripeSecret(env,settings.mode)) return json({ error:`Stripe ${settings.mode} secret key is not configured`, code:'stripe_not_configured' },503);
      try {
        const account=await stripeRequest(env,settings,'/account');
        await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(user(request),'stripe_connection_tested','stripe',`Stripe ${settings.mode} connection test succeeded`,now()).run();
        return json({ ok:true, connectionState:settings.mode==='live'?'Live':'Sandbox', account:{ country:account.country||null, businessType:account.business_type||null, chargesEnabled:Boolean(account.charges_enabled), payoutsEnabled:Boolean(account.payouts_enabled), detailsSubmitted:Boolean(account.details_submitted) } });
      } catch (error) {
        return json({ error:'Stripe connection test failed', code:error.code||'stripe_test_failed', type:error.type||'provider_error' },error.status>=400&&error.status<600?error.status:502);
      }
    }
    if (url.pathname === '/api/payments/stripe/intents' && request.method === 'POST') {
      const uid=user(request); if (!uid) return json({ error:'Sign in required' },401);
      const settings=await stripeSettings(env);
      if (!settings.enabled || stripeConnectionState(env,settings)==='Not configured' || stripeConnectionState(env,settings)==='Disabled') return json({ error:'Stripe payments are not enabled', code:'stripe_disabled' },503);
      const idempotencyKey=String(request.headers.get('x-idempotency-key')||'').trim();
      if (!/^[A-Za-z0-9._:-]{16,120}$/.test(idempotencyKey)) return json({ error:'A valid 16–120 character idempotency key is required' },400);
      const payload=await request.json().catch(() => null), amountMinor=Math.round(Number(payload?.amountMinor));
      const currency=String(payload?.currency||settings.defaultCurrency).toLowerCase(),purpose=String(payload?.purpose||'Program commitment').trim().slice(0,80);
      if (!Number.isInteger(amountMinor)||amountMinor<settings.minimumAmountMinor||amountMinor>settings.maximumAmountMinor) return json({ error:`Amount must be between ${settings.minimumAmountMinor} and ${settings.maximumAmountMinor} minor currency units` },400);
      if (!settings.allowedCurrencies.includes(currency)) return json({ error:'Currency is not enabled for this Stripe adapter' },400);
      const existing=await env.DB.prepare('SELECT * FROM stripe_payment_intents WHERE user_id=? AND idempotency_key=? LIMIT 1').bind(uid,idempotencyKey).first();
      try {
        if (existing) {
          const providerIntent=await stripeRequest(env,settings,`/payment_intents/${encodeURIComponent(existing.provider_reference)}`);
          return json({ ok:true,reused:true,paymentIntent:{ id:existing.id,providerReference:existing.provider_reference,status:stripeIntentState(providerIntent.status),amountMinor:existing.amount_minor,currency:existing.currency,clientSecret:providerIntent.client_secret||null,publishableKey:stripePublishableKey(env,settings.mode),mode:settings.mode } });
        }
        const localId=crypto.randomUUID(),providerIdempotency=`btc-${await sha256Hex(`${uid}:${idempotencyKey}`)}`;
        const form=new URLSearchParams();form.set('amount',String(amountMinor));form.set('currency',currency);form.set('automatic_payment_methods[enabled]','true');form.set('description',purpose);form.set('metadata[btc_intent_id]',localId);
        const providerIntent=await stripeRequest(env,settings,'/payment_intents',{method:'POST',body:form.toString(),idempotencyKey:providerIdempotency});
        const timestamp=now(),normalizedStatus=stripeIntentState(providerIntent.status);
        await env.DB.batch([
          env.DB.prepare('INSERT INTO stripe_payment_intents (id,user_id,provider_reference,idempotency_key,amount_minor,currency,purpose,status,livemode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(localId,uid,providerIntent.id,idempotencyKey,amountMinor,currency,purpose,normalizedStatus,providerIntent.livemode?1:0,timestamp,timestamp),
          env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid,'stripe_payment_intent_created',localId,`Stripe payment intent created in ${settings.mode} mode`,timestamp),
        ]);
        return json({ ok:true,reused:false,paymentIntent:{ id:localId,providerReference:providerIntent.id,status:normalizedStatus,amountMinor,currency,clientSecret:providerIntent.client_secret||null,publishableKey:stripePublishableKey(env,settings.mode),mode:settings.mode } },201);
      } catch (error) {
        return json({ error:'Stripe payment intent could not be created', code:error.code||'stripe_request_failed', type:error.type||'provider_error' },error.status>=400&&error.status<600?error.status:502);
      }
    }
    if (url.pathname === '/api/payments/checkout' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const payload = await request.json().catch(() => ({})), provider = String(payload?.provider || '').trim().toLowerCase();
      if (!provider) return json({ error: 'A configured payment provider is required' }, 400);
      if (provider !== 'stripe') return json({ error: `${provider} checkout is not configured for this country`, code: 'provider_unavailable' }, 503);
      return json({ error: 'Use the existing verified Stripe adapter at /api/payments/stripe/intents; browser redirects do not confirm payment.', code: 'use_stripe_adapter' }, 501);
    }
    if (url.pathname === '/api/payments/stripe/webhook' && request.method === 'POST') {
      const rawBody=await request.text(),signature=request.headers.get('stripe-signature')||'';
      if (!(await verifyStripeSignature(rawBody,signature,env.STRIPE_WEBHOOK_SECRET))) return json({ error:'Invalid Stripe signature' },400);
      let event;try{event=JSON.parse(rawBody);}catch(_){return json({ error:'Invalid webhook payload' },400);}
      const eventId=String(event?.id||'').slice(0,120),eventType=String(event?.type||'unknown').slice(0,120),timestamp=now();
      if (!eventId) return json({ error:'Stripe event id is required' },400);
      const prior=await env.DB.prepare('SELECT processing_status FROM stripe_webhook_events WHERE event_id=?').bind(eventId).first();
      if (prior?.processing_status==='Processed') return json({ received:true,duplicate:true });
      await env.DB.prepare("INSERT INTO stripe_webhook_events (event_id,event_type,livemode,processing_status,created_at,processed_at) VALUES (?,?,?,?,?,?) ON CONFLICT(event_id) DO UPDATE SET processing_status='Processing',processed_at=excluded.processed_at").bind(eventId,eventType,event.livemode?1:0,'Processing',timestamp,timestamp).run();
      try {
        const object=event?.data?.object||{},providerReference=String(object.payment_intent||object.id||'');
        const mapped={
          'payment_intent.created':'Created','payment_intent.requires_action':'Pending authorization','payment_intent.processing':'Processing',
          'payment_intent.succeeded':'Paid','payment_intent.payment_failed':'Failed','payment_intent.canceled':'Expired',
          'charge.refunded':object.amount_refunded<object.amount?'Partially refunded':'Refunded','charge.dispute.created':'Disputed'
        }[eventType];
        const statements=[];
        if (mapped&&providerReference) statements.push(env.DB.prepare('UPDATE stripe_payment_intents SET status=?,updated_at=? WHERE provider_reference=?').bind(mapped,timestamp,providerReference));
        statements.push(env.DB.prepare("UPDATE stripe_webhook_events SET processing_status='Processed',processed_at=? WHERE event_id=?").bind(timestamp,eventId));
        await env.DB.batch(statements);
        return json({ received:true });
      } catch (_) {
        await env.DB.prepare("UPDATE stripe_webhook_events SET processing_status='Failed',processed_at=? WHERE event_id=?").bind(now(),eventId).run();
        return json({ error:'Webhook processing failed' },500);
      }
    }
    if (url.pathname === '/api/countries' && request.method === 'GET') {
      const continent = String(url.searchParams.get('continent') || '').trim().slice(0, 40);
      const queryText = String(url.searchParams.get('q') || '').trim().toLowerCase().slice(0, 80);
      let query = 'SELECT c.*, i.url AS image_url, i.alt AS image_alt, i.poi AS image_poi, i.prompt AS image_prompt, i.updated_at AS image_updated_at FROM countries c LEFT JOIN country_images i ON i.country_id = c.id WHERE c.active = 1';
      const bindings = [];
      if (continent) { query += ' AND c.continent_group = ?'; bindings.push(continent); }
      if (queryText) { query += ' AND (lower(c.name) LIKE ? OR lower(c.iso3) LIKE ? OR lower(c.region) LIKE ? OR lower(c.aliases_json) LIKE ?)'; const term = `%${queryText}%`; bindings.push(term, term, term, term); }
      query += ' ORDER BY c.continent_group, c.name LIMIT 200';
      const { results } = await env.DB.prepare(query).bind(...bindings).all();
      return json(results.map(safeCountry));
    }
    const jukeboxCountryMatch = url.pathname.match(/^\/api\/countries\/([^/]+)\/jukebox(?:\/(tracks|submissions))?$/);
    if (jukeboxCountryMatch && request.method === 'GET' && jukeboxCountryMatch[2] !== 'submissions') {
      const slug = decodeURIComponent(jukeboxCountryMatch[1]).trim().toLowerCase();
      const country = await env.DB.prepare('SELECT id,name,slug,iso3 FROM countries WHERE active = 1 AND slug = ?').bind(slug).first();
      if (!country) return json({ error:'Country not found' }, 404);
      const [settingsRow, tracksResult] = await Promise.all([
        env.DB.prepare('SELECT * FROM jukebox_settings WHERE country_id = ?').bind(country.id).first(),
        jukeboxRowQuery(env, country.id).all(),
      ]);
      const settings = settingsRow ? { country_id:settingsRow.country_id, brand_name:settingsRow.brand_name, tagline:settingsRow.tagline, accent_color:settingsRow.accent_color, glow_color:settingsRow.glow_color, updated_at:settingsRow.updated_at } : defaultJukeboxSettings(country);
      const tracks = tracksResult.results.map(safeJukebox);
      if (jukeboxCountryMatch[2] === 'tracks') return json({ country:{ id:country.id, name:country.name, slug:country.slug, iso3:country.iso3 }, tracks });
      return json({ country:{ id:country.id, name:country.name, slug:country.slug, iso3:country.iso3 }, settings, tracks });
    }
    if (jukeboxCountryMatch && jukeboxCountryMatch[2] === 'submissions' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in to submit a jukebox track' }, 401);
      if (jukeboxRateLimited(request)) return json({ error:'Submission limit reached. Try again in a few minutes.' }, 429);
      const slug = decodeURIComponent(jukeboxCountryMatch[1]).trim().toLowerCase();
      const country = await env.DB.prepare('SELECT id,name,slug FROM countries WHERE active = 1 AND slug = ?').bind(slug).first();
      if (!country) return json({ error:'Country not found' }, 404);
      const payload = await request.json().catch(() => null);
      const title = String(payload?.title || '').trim().slice(0, 180);
      const artist = String(payload?.artist || payload?.creator || '').trim().slice(0, 160);
      const language = String(payload?.language || '').trim().slice(0, 80);
      const genre = String(payload?.genre || '').trim().slice(0, 100);
      const contextNote = String(payload?.context_note || payload?.description || '').trim().slice(0, 1200);
      if (!title) return json({ error:'A track title is required' }, 400);
      if (!payload?.rights_confirmed) return json({ error:'Confirm that you have permission to submit this track' }, 400);
      const source = mediaSource(payload?.source_url, 'music');
      if (!source) return json({ error:'Use a valid public YouTube, SoundCloud, or Spotify track URL' }, 400);
      const timestamp = now(), id = `jukebox-${crypto.randomUUID()}`, username = request.headers.get('x-websim-username') || '';
      await env.DB.batch([
        env.DB.prepare(`INSERT INTO jukebox_tracks (id,user_id,username,country_id,title,artist,source_type,source_url,embed_url,language,genre,context_note,rights_confirmed,status,featured,archived,order_index,submitted_at,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,? ,0,0,1000,?,?,?)`).bind(id, uid, username, country.id, title, artist, source.source_type, source.source_url, source.embed_url, language, genre, contextNote, 1, 'Pending Review', timestamp, timestamp, timestamp),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'jukebox_submit', id, `Submitted a track for ${country.name}`, timestamp),
      ]);
      const row = await env.DB.prepare('SELECT t.*, c.name AS country_name FROM jukebox_tracks t JOIN countries c ON c.id = t.country_id WHERE t.id = ?').bind(id).first();
      return json({ ok:true, track:safeAdminJukebox(row) }, 201);
    }
    const jukeboxReportMatch = url.pathname.match(/^\/api\/countries\/([^/]+)\/jukebox\/tracks\/([^/]+)\/report$/);
    if (jukeboxReportMatch && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in to report a track' }, 401);
      const trackId = decodeURIComponent(jukeboxReportMatch[2]);
      const existing = await env.DB.prepare("SELECT id FROM jukebox_tracks WHERE id = ? AND status = 'Approved' AND archived = 0").bind(trackId).first();
      if (!existing) return json({ error:'Track not found' }, 404);
      const payload = await request.json().catch(() => null), reason = String(payload?.reason || 'Rights or safety concern').trim().slice(0, 500), timestamp = now(), reportId = `jukebox-report-${crypto.randomUUID()}`;
      await env.DB.batch([
        env.DB.prepare('INSERT INTO jukebox_reports (id,user_id,username,track_id,reason,created_at) VALUES (?,?,?,?,?,?)').bind(reportId, uid, request.headers.get('x-websim-username') || '', trackId, reason, timestamp),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'jukebox_report', trackId, reason, timestamp),
      ]);
      return json({ ok:true, report_id:reportId }, 201);
    }
    const mediaMatch = url.pathname.match(/^\/api\/countries\/([^/]+)\/media$/);
    if (mediaMatch && request.method === 'GET') {
      const slug = decodeURIComponent(mediaMatch[1]).trim().toLowerCase();
      const country = await env.DB.prepare('SELECT id,name FROM countries WHERE active = 1 AND slug = ?').bind(slug).first();
      if (!country) return json({ error:'Country not found' }, 404);
      const mediaType = String(url.searchParams.get('type') || '').trim().toLowerCase();
      const query = mediaType && MEDIA_TYPES.includes(mediaType)
        ? env.DB.prepare("SELECT m.*, c.name AS country_name FROM media_submissions m JOIN countries c ON c.id = m.country_id WHERE m.country_id = ? AND m.media_type = ? AND m.status = 'Approved' AND m.archived = 0 ORDER BY m.featured DESC, m.updated_at DESC LIMIT 100").bind(country.id, mediaType)
        : env.DB.prepare("SELECT m.*, c.name AS country_name FROM media_submissions m JOIN countries c ON c.id = m.country_id WHERE m.country_id = ? AND m.status = 'Approved' AND m.archived = 0 ORDER BY m.media_type, m.featured DESC, m.updated_at DESC LIMIT 200").bind(country.id);
      const { results } = await query.all();
      return json({ country:{ id:country.id, name:country.name, slug }, media:results.map(safeMedia) });
    }
    if (mediaMatch && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error:'Sign in to submit media' }, 401);
      const slug = decodeURIComponent(mediaMatch[1]).trim().toLowerCase();
      const country = await env.DB.prepare('SELECT id,name,slug FROM countries WHERE active = 1 AND slug = ?').bind(slug).first();
      if (!country) return json({ error:'Country not found' }, 404);
      const payload = await request.json().catch(() => null);
      const mediaType = String(payload?.media_type || '').trim().toLowerCase();
      const title = String(payload?.title || '').trim().slice(0, 180);
      const creator = String(payload?.creator || '').trim().slice(0, 160);
      const description = String(payload?.description || '').trim().slice(0, 1200);
      const language = String(payload?.language || '').trim().slice(0, 80);
      const genre = String(payload?.genre || '').trim().slice(0, 100);
      if (!MEDIA_TYPES.includes(mediaType)) return json({ error:'Choose music, video, or document' }, 400);
      if (!title) return json({ error:'A title is required' }, 400);
      if (!payload?.rights_confirmed) return json({ error:'Confirm that you have permission to submit this item' }, 400);
      const source = mediaSource(payload?.source_url, mediaType);
      if (!source) return json({ error:mediaType === 'document' ? 'Enter a valid public document URL' : 'Use an approved YouTube, SoundCloud, Spotify, or Vimeo URL' }, 400);
      const timestamp = now(), id = `media-${crypto.randomUUID()}`, username = request.headers.get('x-websim-username') || '';
      await env.DB.prepare(`INSERT INTO media_submissions (id,user_id,username,country_id,media_type,title,creator,source_type,source_url,embed_url,language,genre,description,rights_confirmed,status,featured,archived,submitted_at,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,? ,0,0,?,?,?)`).bind(id, uid, username, country.id, mediaType, title, creator, source.source_type, source.source_url, source.embed_url, language, genre, description, 1, 'Pending Review', timestamp, timestamp, timestamp).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'submit_media', id, `Submitted ${mediaType} for ${country.name}`, timestamp).run();
      const row = await env.DB.prepare('SELECT m.*, c.name AS country_name FROM media_submissions m JOIN countries c ON c.id = m.country_id WHERE m.id = ?').bind(id).first();
      return json({ ok:true, media:safeMedia(row) }, 201);
    }
    if (url.pathname.startsWith('/api/countries/') && request.method === 'GET') {
      const slug = decodeURIComponent(url.pathname.slice('/api/countries/'.length)).trim().toLowerCase();
      const row = await env.DB.prepare('SELECT c.*, i.url AS image_url, i.alt AS image_alt, i.poi AS image_poi, i.prompt AS image_prompt, i.updated_at AS image_updated_at FROM countries c LEFT JOIN country_images i ON i.country_id = c.id WHERE c.active = 1 AND c.slug = ?').bind(slug).first();
      return row ? json({ country:safeCountry(row) }) : json({ error:'Country not found' }, 404);
    }
    if (url.pathname === '/api/admin/countries' && request.method === 'GET') {
      if (!owner(request)) return json({ error:'Owner authorization required' }, 403);
      const { results } = await env.DB.prepare('SELECT c.*, i.url AS image_url, i.alt AS image_alt, i.poi AS image_poi, i.prompt AS image_prompt, i.updated_at AS image_updated_at FROM countries c LEFT JOIN country_images i ON i.country_id = c.id ORDER BY c.continent_group, c.name').all();
      return json(results.map(safeCountry));
    }
    if (url.pathname === '/api/admin/jukebox/submissions' && request.method === 'GET') {
      if (!jukeboxOwner(request)) return json({ error:'Owner authorization required' }, 403);
      const country = String(url.searchParams.get('country') || '').trim().slice(0, 120);
      const provider = String(url.searchParams.get('provider') || '').trim().slice(0, 40);
      const genre = String(url.searchParams.get('genre') || '').trim().slice(0, 100);
      const submitter = String(url.searchParams.get('submitter') || '').trim().slice(0, 120);
      const status = String(url.searchParams.get('status') || '').trim();
      let query = 'SELECT t.*, c.name AS country_name FROM jukebox_tracks t JOIN countries c ON c.id = t.country_id WHERE 1 = 1';
      const bindings = [];
      if (country) { query += ' AND (c.id = ? OR c.slug = ? OR lower(c.name) LIKE ?)'; bindings.push(country, country, `%${country.toLowerCase()}%`); }
      if (provider && ['YouTube','SoundCloud','Spotify'].includes(provider)) { query += ' AND t.source_type = ?'; bindings.push(provider); }
      if (genre) { query += ' AND lower(coalesce(t.genre,\'\')) LIKE ?'; bindings.push(`%${genre.toLowerCase()}%`); }
      if (submitter) { query += ' AND (lower(coalesce(t.username,\'\')) LIKE ? OR t.user_id = ?)'; bindings.push(`%${submitter.toLowerCase()}%`, submitter); }
      if (status && JUKEBOX_STATUSES.includes(status)) { query += ' AND t.status = ?'; bindings.push(status); }
      query += " ORDER BY CASE t.status WHEN 'Pending Review' THEN 0 WHEN 'Approved' THEN 1 WHEN 'Rejected' THEN 2 ELSE 3 END, c.name, t.order_index, t.updated_at DESC LIMIT 1000";
      const { results } = await env.DB.prepare(query).bind(...bindings).all();
      return json(results.map(safeAdminJukebox));
    }
    if (url.pathname === '/api/admin/jukebox/settings' && request.method === 'GET') {
      if (!jukeboxOwner(request)) return json({ error:'Owner authorization required' }, 403);
      const { results } = await env.DB.prepare('SELECT * FROM jukebox_settings ORDER BY country_id').all();
      return json(results);
    }
    if (url.pathname === '/api/admin/jukebox/audit' && request.method === 'GET') {
      if (!jukeboxOwner(request)) return json({ error:'Owner authorization required' }, 403);
      const trackId = String(url.searchParams.get('track_id') || '').trim();
      const query = trackId
        ? env.DB.prepare("SELECT action,record_id,detail,created_at,user_id FROM audit_log WHERE record_id = ? AND action LIKE 'jukebox_%' ORDER BY id DESC LIMIT 200").bind(trackId)
        : env.DB.prepare("SELECT action,record_id,detail,created_at,user_id FROM audit_log WHERE action LIKE 'jukebox_%' ORDER BY id DESC LIMIT 200");
      const { results } = await query.all();
      return json(results);
    }
    if (url.pathname === '/api/admin/jukebox/reports' && request.method === 'GET') {
      if (!jukeboxOwner(request)) return json({ error:'Owner authorization required' }, 403);
      const { results } = await env.DB.prepare(`SELECT r.id,r.track_id,r.user_id,r.username,r.reason,r.created_at,
          t.title,t.artist,t.status,t.archived,t.country_id,c.name AS country_name
        FROM jukebox_reports r
        LEFT JOIN jukebox_tracks t ON t.id = r.track_id
        LEFT JOIN countries c ON c.id = t.country_id
        ORDER BY r.created_at DESC LIMIT 200`).all();
      return json(results);
    }
    const jukeboxReportAdminMatch = url.pathname.match(/^\/api\/admin\/jukebox\/reports\/([^/]+)$/);
    if (jukeboxReportAdminMatch && request.method === 'DELETE') {
      if (!jukeboxOwner(request)) return json({ error:'Owner authorization required' }, 403);
      const reportId = decodeURIComponent(jukeboxReportAdminMatch[1]);
      const existing = await env.DB.prepare('SELECT id,track_id,reason FROM jukebox_reports WHERE id = ?').bind(reportId).first();
      if (!existing) return json({ error:'Jukebox report not found' }, 404);
      const uid = user(request), timestamp = now();
      await env.DB.batch([
        env.DB.prepare('DELETE FROM jukebox_reports WHERE id = ?').bind(reportId),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'jukebox_dismiss_report', existing.track_id, `Dismissed jukebox report: ${existing.reason}`, timestamp),
      ]);
      return json({ ok:true, dismissed:true, id:reportId });
    }
    const jukeboxTrackMatch = url.pathname.match(/^\/api\/admin\/jukebox\/tracks\/([^/]+)(?:\/(approve|reject|archive|restore))?$/);
    if (jukeboxTrackMatch && !jukeboxTrackMatch[2] && request.method === 'DELETE') {
      if (!jukeboxOwner(request)) return json({ error:'Owner authorization required' }, 403);
      const id = decodeURIComponent(jukeboxTrackMatch[1]), existing = await env.DB.prepare('SELECT title FROM jukebox_tracks WHERE id = ?').bind(id).first();
      if (!existing) return json({ error:'Jukebox track not found' }, 404);
      const uid = user(request), timestamp = now();
      await env.DB.batch([
        env.DB.prepare('DELETE FROM jukebox_reports WHERE track_id = ?').bind(id),
        env.DB.prepare('DELETE FROM jukebox_tracks WHERE id = ?').bind(id),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'jukebox_delete', id, `Permanently removed jukebox track ${existing.title}`, timestamp),
      ]);
      return json({ ok:true, deleted:true, id });
    }
    if (jukeboxTrackMatch && !jukeboxTrackMatch[2] && request.method === 'PATCH') {
      if (!jukeboxOwner(request)) return json({ error:'Owner authorization required' }, 403);
      const id = decodeURIComponent(jukeboxTrackMatch[1]);
      const existing = await env.DB.prepare('SELECT * FROM jukebox_tracks WHERE id = ?').bind(id).first();
      if (!existing) return json({ error:'Jukebox track not found' }, 404);
      const payload = await request.json().catch(() => null);
      const title = payload?.title == null ? existing.title : String(payload.title).trim().slice(0, 180);
      const artist = payload?.artist == null ? existing.artist || '' : String(payload.artist).trim().slice(0, 160);
      const language = payload?.language == null ? existing.language || '' : String(payload.language).trim().slice(0, 80);
      const genre = payload?.genre == null ? existing.genre || '' : String(payload.genre).trim().slice(0, 100);
      const contextNote = payload?.context_note == null ? existing.context_note || '' : String(payload.context_note).trim().slice(0, 1200);
      const sourceUrl = payload?.source_url == null ? existing.source_url : String(payload.source_url).trim();
      if (!title) return json({ error:'A track title is required' }, 400);
      const source = mediaSource(sourceUrl, 'music');
      if (!source) return json({ error:'Use a valid public YouTube, SoundCloud, or Spotify track URL' }, 400);
      const orderIndex = payload?.order_index == null ? Number(existing.order_index || 1000) : Math.max(0, Math.min(9999, Math.round(Number(payload.order_index))));
      if (!Number.isFinite(orderIndex)) return json({ error:'Order must be a number' }, 400);
      const featured = payload?.featured == null ? Number(existing.featured || 0) : (payload.featured ? 1 : 0);
      const reviewerNote = payload?.reviewer_note == null ? existing.reviewer_note || '' : String(payload.reviewer_note).trim().slice(0, 1000);
      const timestamp = now(), uid = user(request);
      await env.DB.batch([
        env.DB.prepare('UPDATE jukebox_tracks SET title=?,artist=?,source_type=?,source_url=?,embed_url=?,language=?,genre=?,context_note=?,reviewer_note=?,featured=?,order_index=?,updated_at=? WHERE id=?').bind(title, artist, source.source_type, source.source_url, source.embed_url, language, genre, contextNote, reviewerNote, featured, orderIndex, timestamp, id),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'jukebox_update_metadata', id, `Updated metadata, provider URL, feature state, or order for ${title}`, timestamp),
      ]);
      const row = await env.DB.prepare('SELECT t.*, c.name AS country_name FROM jukebox_tracks t JOIN countries c ON c.id = t.country_id WHERE t.id = ?').bind(id).first();
      return json({ ok:true, track:safeAdminJukebox(row) });
    }
    if (jukeboxTrackMatch && jukeboxTrackMatch[2] && request.method === 'POST') {
      const action = ({approve:'Approved', reject:'Rejected', archive:'Archived', restore:'Approved'})[jukeboxTrackMatch[2]] || '';
      if (action) return updateJukeboxStatus(env, request, decodeURIComponent(jukeboxTrackMatch[1]), action);
    }
    const jukeboxSettingsMatch = url.pathname.match(/^\/api\/admin\/jukebox\/([^/]+)\/settings$/);
    if (jukeboxSettingsMatch && request.method === 'PUT') {
      if (!jukeboxOwner(request)) return json({ error:'Owner authorization required' }, 403);
      const countryId = decodeURIComponent(jukeboxSettingsMatch[1]).trim().toLowerCase();
      const country = await env.DB.prepare('SELECT id,name FROM countries WHERE active = 1 AND (id = ? OR slug = ?)').bind(countryId, countryId).first();
      if (!country) return json({ error:'Country not found' }, 404);
      const payload = await request.json().catch(() => null);
      const defaults = defaultJukeboxSettings(country);
      const brandName = String(payload?.brand_name ?? defaults.brand_name).trim().slice(0, 100) || defaults.brand_name;
      const tagline = String(payload?.tagline ?? defaults.tagline).trim().slice(0, 240) || defaults.tagline;
      const accentColor = safeColor(payload?.accent_color) || defaults.accent_color;
      const glowColor = safeColor(payload?.glow_color) || defaults.glow_color;
      const timestamp = now(), uid = user(request);
      await env.DB.batch([
        env.DB.prepare('INSERT INTO jukebox_settings (country_id,brand_name,tagline,accent_color,glow_color,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(country_id) DO UPDATE SET brand_name=excluded.brand_name,tagline=excluded.tagline,accent_color=excluded.accent_color,glow_color=excluded.glow_color,updated_at=excluded.updated_at').bind(country.id, brandName, tagline, accentColor, glowColor, timestamp),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'jukebox_update_settings', country.id, `Updated jukebox branding for ${country.name}`, timestamp),
      ]);
      return json({ ok:true, settings:{ country_id:country.id, brand_name:brandName, tagline, accent_color:accentColor, glow_color:glowColor, updated_at:timestamp } });
    }
    if (url.pathname === '/api/admin/media' && request.method === 'GET') {
      if (!owner(request)) return json({ error:'Owner authorization required' }, 403);
      const mediaType = String(url.searchParams.get('type') || '').trim().toLowerCase();
      const status = String(url.searchParams.get('status') || '').trim();
      let query = 'SELECT m.*, c.name AS country_name FROM media_submissions m JOIN countries c ON c.id = m.country_id WHERE 1 = 1';
      const bindings = [];
      if (mediaType && MEDIA_TYPES.includes(mediaType)) { query += ' AND m.media_type = ?'; bindings.push(mediaType); }
      if (status && MEDIA_STATUSES.includes(status)) { query += ' AND m.status = ?'; bindings.push(status); }
      query += ' ORDER BY CASE m.status WHEN \'Pending Review\' THEN 0 WHEN \'Approved\' THEN 1 ELSE 2 END, m.updated_at DESC LIMIT 1000';
      const { results } = await env.DB.prepare(query).bind(...bindings).all();
      return json(results.map(safeAdminMedia));
    }
    const adminMediaMatch = url.pathname.match(/^\/api\/admin\/media\/([^/]+)$/);
    if (adminMediaMatch && request.method === 'PATCH') {
      if (!owner(request)) return json({ error:'Owner authorization required' }, 403);
      const id = decodeURIComponent(adminMediaMatch[1]);
      const existing = await env.DB.prepare('SELECT * FROM media_submissions WHERE id = ?').bind(id).first();
      if (!existing) return json({ error:'Media submission not found' }, 404);
      const payload = await request.json().catch(() => null), status = String(payload?.status || '').trim();
      if (!MEDIA_STATUSES.includes(status)) return json({ error:'Choose Pending Review, Approved, Rejected, or Archived' }, 400);
      const reviewerNote = String(payload?.reviewer_note || '').trim().slice(0, 1000), featured = payload?.featured ? 1 : 0;
      const uid = user(request), timestamp = now();
      await env.DB.prepare('UPDATE media_submissions SET status=?,reviewer_note=?,featured=?,archived=?,reviewed_at=?,reviewed_by=?,updated_at=? WHERE id=?').bind(status, reviewerNote, featured, status === 'Archived' ? 1 : 0, timestamp, uid, timestamp, id).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, `media_${status.toLowerCase().replaceAll(' ','_')}`, id, reviewerNote || `Media status changed to ${status}`, timestamp).run();
      const row = await env.DB.prepare('SELECT m.*, c.name AS country_name FROM media_submissions m JOIN countries c ON c.id = m.country_id WHERE m.id = ?').bind(id).first();
      return json({ ok:true, media:safeAdminMedia(row) });
    }
    if (url.pathname === '/api/courses' && request.method === 'GET') {
      const uid=user(request), mine=url.searchParams.get('mine') === '1';
      if (mine && !uid) return json({ error:'Sign in required' }, 401);
      const query=mine
        ? env.DB.prepare('SELECT *, 1 AS is_owner FROM learning_courses WHERE user_id=? AND archived=0 ORDER BY updated_at DESC LIMIT 100').bind(uid)
        : uid
          ? env.DB.prepare("SELECT *, CASE WHEN user_id=? THEN 1 ELSE 0 END AS is_owner FROM learning_courses WHERE archived=0 AND (visibility='public' OR user_id=?) ORDER BY updated_at DESC LIMIT 100").bind(uid,uid)
          : env.DB.prepare("SELECT *, 0 AS is_owner FROM learning_courses WHERE archived=0 AND visibility='public' ORDER BY updated_at DESC LIMIT 100");
      const { results }=await query.all(), courses=[];
      for(const row of results || []){
        const { results:modules }=await env.DB.prepare("SELECT id,position,title,summary,content_json,status FROM learning_modules WHERE course_id=? AND status!='Retired' ORDER BY position LIMIT 100").bind(row.id).all();
        courses.push(safeCourse(row,modules,await latestCourseSnapshot(env.DB,row.id)));
      }
      return json({ courses });
    }
    if (url.pathname === '/api/courses' && request.method === 'POST') {
      const uid=user(request); if(!uid)return json({ error:'Sign in required to save a course' },401);
      const payload=await request.json().catch(()=>null), title=String(payload?.title||'').trim().slice(0,160), modules=Array.isArray(payload?.modules)?payload.modules.slice(0,30):[];
      if(!title)return json({ error:'Course title is required' },400);
      if(!modules.length)return json({ error:'Add at least one course module' },400);
      const id=learningId(payload?.id)||`course-${crypto.randomUUID()}`, existing=await env.DB.prepare('SELECT user_id,current_version FROM learning_courses WHERE id=?').bind(id).first();
      if(existing && existing.user_id!==uid && !owner(request))return json({ error:'Only the course owner can update this draft' },403);
      const timestamp=now(), version=Number(existing?.current_version||0)+1, username=String(request.headers.get('x-websim-username')||'').slice(0,120), status=['Draft','Requires Review','Approved','Published','Retired'].includes(payload?.status)?payload.status:'Draft', visibility=payload?.visibility==='public'?'public':'private';
      const snapshot={title,purpose:String(payload?.purpose||'').slice(0,1200),status,visibility,level:String(payload?.level||'Foundational').slice(0,80),format:String(payload?.format||'Cohort or self-paced').slice(0,120),access:String(payload?.access||'Private draft').slice(0,80),audience:String(payload?.audience||'').slice(0,240),duration:String(payload?.duration||'').slice(0,120),language:String(payload?.language||'English').slice(0,80),prerequisites:String(payload?.prerequisites||'').slice(0,700),countryContext:String(payload?.countryContext||'').slice(0,120),mission:String(payload?.mission||'Generated course').slice(0,180),sdgs:Array.isArray(payload?.sdgs)?payload.sdgs.slice(0,17):[],safetyNote:String(payload?.safetyNote||'').slice(0,1200),evidenceTask:String(payload?.evidenceTask||'').slice(0,1200),assessment:payload?.assessment&&typeof payload.assessment==='object'?payload.assessment:{},accessibilityNotes:String(payload?.accessibilityNotes||'').slice(0,1000),sourceNotes:String(payload?.sourceNotes||'').slice(0,1400),review:payload?.review&&typeof payload.review==='object'?payload.review:{},modules:modules.map(module=>typeof module==='string'?{title:String(module).slice(0,240)}:{title:String(module?.title||'Untitled module').slice(0,240),objective:String(module?.objective||'').slice(0,700),activity:String(module?.activity||'').slice(0,1000),check:String(module?.check||'').slice(0,500),resource:String(module?.resource||'').slice(0,500)} )};
      const statements=[
        env.DB.prepare(`INSERT INTO learning_courses (id,user_id,username,title,purpose,status,visibility,level,format,access_model,country_context,mission,sdgs_json,safety_note,evidence_task,current_version,archived,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?) ON CONFLICT(id) DO UPDATE SET username=excluded.username,title=excluded.title,purpose=excluded.purpose,status=excluded.status,visibility=excluded.visibility,level=excluded.level,format=excluded.format,access_model=excluded.access_model,country_context=excluded.country_context,mission=excluded.mission,sdgs_json=excluded.sdgs_json,safety_note=excluded.safety_note,evidence_task=excluded.evidence_task,current_version=excluded.current_version,updated_at=excluded.updated_at`).bind(id,uid,username,title,snapshot.purpose,status,visibility,snapshot.level,snapshot.format,snapshot.access,snapshot.countryContext||null,snapshot.mission,JSON.stringify(snapshot.sdgs),snapshot.safetyNote||null,snapshot.evidenceTask||null,version,existing?timestamp:timestamp,timestamp),
        env.DB.prepare("UPDATE learning_modules SET status='Retired',updated_at=? WHERE course_id=?").bind(timestamp,id),
        env.DB.prepare('INSERT INTO learning_course_versions (id,user_id,course_id,version,snapshot_json,change_note,created_at) VALUES (?,?,?,?,?,?,?)').bind(`version-${crypto.randomUUID()}`,uid,id,version,JSON.stringify(snapshot).slice(0,30000),String(payload?.changeNote||'Course draft saved').slice(0,500),timestamp),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid,existing?'update_course':'create_course',id,`Course version ${version} saved as ${status}`,timestamp),
      ];
      modules.forEach((module,index)=>{const moduleTitle=typeof module==='string'?module:module?.title, summary=typeof module==='object'?(module?.summary||module?.objective||''):'';const content=typeof module==='object'?{...(module?.content||{}),objective:module?.objective||'',activity:module?.activity||'',check:module?.check||'',resource:module?.resource||{}}:{};statements.push(env.DB.prepare(`INSERT INTO learning_modules (id,user_id,course_id,position,title,summary,content_json,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(course_id,position) DO UPDATE SET title=excluded.title,summary=excluded.summary,content_json=excluded.content_json,status=excluded.status,updated_at=excluded.updated_at`).bind(`${id}-module-${index+1}`,uid,id,index,String(moduleTitle||`Module ${index+1}`).slice(0,240),String(summary||'').slice(0,1200),JSON.stringify(content).slice(0,12000),'Draft',timestamp,timestamp));});
      await env.DB.batch(statements);
      const row=await env.DB.prepare('SELECT *,1 AS is_owner FROM learning_courses WHERE id=?').bind(id).first(), moduleRows=await env.DB.prepare("SELECT id,position,title,summary,content_json,status FROM learning_modules WHERE course_id=? AND status!='Retired' ORDER BY position").bind(id).all();
      return json({ ok:true, course:safeCourse(row,moduleRows.results,snapshot) },existing?200:201);
    }
    const courseMatch=url.pathname.match(/^\/api\/courses\/([^/]+)$/);
    if(courseMatch && request.method==='GET'){
      const id=learningId(decodeURIComponent(courseMatch[1])), row=await env.DB.prepare('SELECT *,CASE WHEN user_id=? THEN 1 ELSE 0 END AS is_owner FROM learning_courses WHERE id=?').bind(user(request)||'',id).first();
      if(!canReadCourse(row,request))return json({ error:'Course not found' },404);
      const { results:modules }=await env.DB.prepare("SELECT id,position,title,summary,content_json,status FROM learning_modules WHERE course_id=? AND status!='Retired' ORDER BY position").bind(id).all();
      return json({ course:safeCourse(row,modules,await latestCourseSnapshot(env.DB,id)) });
    }
    const enrollmentMatch=url.pathname.match(/^\/api\/courses\/([^/]+)\/enrollments$/);
    if(enrollmentMatch && request.method==='POST'){
      const uid=user(request);if(!uid)return json({ error:'Sign in required to enroll' },401);
      const courseId=learningId(decodeURIComponent(enrollmentMatch[1])), course=await env.DB.prepare('SELECT * FROM learning_courses WHERE id=?').bind(courseId).first();
      if(!canReadCourse(course,request))return json({ error:'Course not found' },404);
      const payload=await request.json().catch(()=>({})), timestamp=now(), role=learningRole(payload?.role), username=String(request.headers.get('x-websim-username')||'').slice(0,120);
      await env.DB.prepare(`INSERT INTO learning_enrollments (id,user_id,username,course_id,role,status,progress,enrolled_at,updated_at) VALUES (?,?,?,?,?,'Enrolled',0,?,?) ON CONFLICT(user_id,course_id) DO UPDATE SET role=excluded.role,status='Enrolled',updated_at=excluded.updated_at`).bind(`enrollment-${uid}-${courseId}`,uid,username,courseId,role,timestamp,timestamp).run();
      return json({ ok:true, courseId, role },201);
    }
    const classroomMatch=url.pathname.match(/^\/api\/courses\/([^/]+)\/classroom$/);
    if(classroomMatch && request.method==='GET'){
      const courseId=learningId(decodeURIComponent(classroomMatch[1])), course=await env.DB.prepare('SELECT * FROM learning_courses WHERE id=?').bind(courseId).first();
      if(!canReadCourse(course,request))return json({ error:'Course not found' },404);
      const session=await env.DB.prepare('SELECT id,course_id,title,status,active_module,scheduled_at,started_at,ended_at,provider,created_at,updated_at FROM classroom_sessions WHERE course_id=? ORDER BY updated_at DESC LIMIT 1').bind(courseId).first();
      if(!session)return json({ session:null,messages:[],attendanceCount:0,myAttendance:null });
      const { results:messages }=await env.DB.prepare("SELECT id,username,role,message_type,content,created_at FROM classroom_messages WHERE session_id=? AND moderation_status='Visible' ORDER BY created_at DESC LIMIT 50").bind(session.id).all();
      const attendanceCount=Number(await env.DB.prepare("SELECT COUNT(*) AS count FROM classroom_attendance WHERE session_id=? AND status='Present'").bind(session.id).first('count')||0), myAttendance=user(request)?await env.DB.prepare('SELECT role,status,joined_at,left_at,last_seen_at FROM classroom_attendance WHERE session_id=? AND user_id=?').bind(session.id,user(request)).first():null;
      return json({ session,messages:(messages||[]).reverse(),attendanceCount,myAttendance });
    }
    if(classroomMatch && request.method==='POST'){
      const uid=user(request);if(!uid)return json({ error:'Sign in required' },401);
      const courseId=learningId(decodeURIComponent(classroomMatch[1])), course=await env.DB.prepare('SELECT * FROM learning_courses WHERE id=?').bind(courseId).first();
      if(!course || (course.user_id!==uid && !owner(request)))return json({ error:'Instructor permission required' },403);
      const payload=await request.json().catch(()=>({})), timestamp=now(), requestedId=learningId(payload?.id), current=requestedId?await env.DB.prepare('SELECT * FROM classroom_sessions WHERE id=? AND course_id=?').bind(requestedId,courseId).first():await env.DB.prepare("SELECT * FROM classroom_sessions WHERE course_id=? AND status!='Ended' ORDER BY updated_at DESC LIMIT 1").bind(courseId).first(), id=current?.id||requestedId||`classroom-${crypto.randomUUID()}`, status=['Ready','Live','Ended'].includes(payload?.status)?payload.status:'Ready', activeModule=Math.max(0,Math.min(99,Number(payload?.activeModule)||0)), username=String(request.headers.get('x-websim-username')||'').slice(0,120);
      await env.DB.prepare(`INSERT INTO classroom_sessions (id,user_id,username,course_id,title,status,active_module,scheduled_at,started_at,ended_at,provider,provider_reference,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,status=excluded.status,active_module=excluded.active_module,scheduled_at=excluded.scheduled_at,started_at=CASE WHEN excluded.status='Live' THEN COALESCE(classroom_sessions.started_at,excluded.started_at) ELSE classroom_sessions.started_at END,ended_at=CASE WHEN excluded.status='Ended' THEN excluded.ended_at ELSE NULL END,updated_at=excluded.updated_at`).bind(id,uid,username,courseId,String(payload?.title||`${course.title} classroom`).slice(0,180),status,activeModule,payload?.scheduledAt||null,status==='Live'?timestamp:null,status==='Ended'?timestamp:null,'Native room',null,current?.created_at||timestamp,timestamp).run();
      const session=await env.DB.prepare('SELECT id,course_id,title,status,active_module,scheduled_at,started_at,ended_at,provider,created_at,updated_at FROM classroom_sessions WHERE id=?').bind(id).first();
      return json({ ok:true,session },current?200:201);
    }
    const attendanceMatch=url.pathname.match(/^\/api\/classrooms\/([^/]+)\/attendance$/);
    if(attendanceMatch && request.method==='POST'){
      const uid=user(request);if(!uid)return json({ error:'Sign in required' },401);
      const sessionId=learningId(decodeURIComponent(attendanceMatch[1])), session=await env.DB.prepare('SELECT * FROM classroom_sessions WHERE id=?').bind(sessionId).first();if(!session)return json({ error:'Classroom not found' },404);
      const course=await env.DB.prepare('SELECT * FROM learning_courses WHERE id=?').bind(session.course_id).first();if(!canReadCourse(course,request))return json({ error:'Classroom not found' },404);
      const payload=await request.json().catch(()=>({})), timestamp=now(), role=learningRole(payload?.role), status=payload?.status==='Left'?'Left':'Present', username=String(request.headers.get('x-websim-username')||'').slice(0,120);
      await env.DB.prepare(`INSERT INTO classroom_attendance (id,user_id,username,session_id,course_id,role,status,joined_at,left_at,last_seen_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id,session_id) DO UPDATE SET role=excluded.role,status=excluded.status,left_at=excluded.left_at,last_seen_at=excluded.last_seen_at`).bind(`attendance-${uid}-${sessionId}`,uid,username,sessionId,session.course_id,role,status,timestamp,status==='Left'?timestamp:null,timestamp).run();
      return json({ ok:true,status,joinedAt:timestamp },201);
    }
    const classroomMessageMatch=url.pathname.match(/^\/api\/classrooms\/([^/]+)\/messages$/);
    if(classroomMessageMatch && request.method==='POST'){
      const uid=user(request);if(!uid)return json({ error:'Sign in required to message the classroom' },401);
      const sessionId=learningId(decodeURIComponent(classroomMessageMatch[1])), session=await env.DB.prepare('SELECT * FROM classroom_sessions WHERE id=?').bind(sessionId).first();if(!session)return json({ error:'Classroom not found' },404);
      const course=await env.DB.prepare('SELECT * FROM learning_courses WHERE id=?').bind(session.course_id).first();if(!canReadCourse(course,request))return json({ error:'Classroom not found' },404);
      const payload=await request.json().catch(()=>null), content=String(payload?.content||'').trim().slice(0,1000);if(!content)return json({ error:'Message content is required' },400);
      const timestamp=now(), id=`message-${crypto.randomUUID()}`, username=String(request.headers.get('x-websim-username')||'').slice(0,120), role=learningRole(payload?.role), messageType=['chat','question','reflection','announcement'].includes(payload?.messageType)?payload.messageType:'chat';
      await env.DB.prepare('INSERT INTO classroom_messages (id,user_id,username,session_id,course_id,role,message_type,content,moderation_status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,uid,username,sessionId,session.course_id,role,messageType,content,'Visible',timestamp).run();
      return json({ ok:true,message:{id,username,role,message_type:messageType,content,created_at:timestamp} },201);
    }
    if (url.pathname === '/api/members/search' && request.method === 'GET') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      await ensureProfileColumns(env);
      const query = String(url.searchParams.get('q') || '').trim().toLowerCase().slice(0, 80);
      if (query.length < 2) return json({ members: [] });
      const term = `%${query}%`;
      const { results } = await env.DB.prepare(`SELECT user_id,display_name,slug,country,avatar_url FROM profiles WHERE user_id <> ? AND (lower(display_name) LIKE ? OR lower(COALESCE(slug,'')) LIKE ?) ORDER BY display_name LIMIT 8`).bind(uid, term, term).all();
      return json({ members:(results || []).map(row=>({user_id:row.user_id,display_name:row.display_name,slug:row.slug||'',country:row.country||'',avatar_url:row.avatar_url||'/uploads/sbtc-lo.png'})) });
    }
    if (url.pathname === '/api/profile/avatar' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in to upload an avatar' }, 401);
      await ensureProfileColumns(env);
      const contentType = String(request.headers.get('content-type') || '').toLowerCase();
      if (!['image/png','image/jpeg','image/webp'].includes(contentType)) return json({ error: 'Use a PNG, JPEG, or WebP image.' }, 400);
      const bytes = await request.arrayBuffer();
      if (bytes.byteLength > 5 * 1024 * 1024) return json({ error: 'Avatar images must be 5 MB or smaller.' }, 400);
      const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
      const stored = await env.BLOB.put(`profile-avatar-${uid}-${Date.now()}.${extension}`, bytes, { contentType });
      await env.DB.prepare('UPDATE profiles SET avatar_url=?,updated_at=? WHERE user_id=?').bind(stored.url, now(), uid).run();
      return json({ ok:true, url:stored.url });
    }
    if (url.pathname === '/api/profile/slug-availability' && request.method === 'GET') {
      await ensureProfileColumns(env);
      const requested = profileSlug(url.searchParams.get('slug'));
      if (requested.length < 3 || requested.length > 40) return json({ error: 'Slug must be 3–40 characters using lowercase letters, numbers, and hyphens.' }, 400);
      const uid = user(request);
      const row = await env.DB.prepare('SELECT user_id FROM profiles WHERE slug = ?').bind(requested).first();
      return json({ slug: requested, available: !row || row.user_id === uid });
    }
    if (url.pathname === '/api/profile' && request.method === 'GET') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      await ensureProfileColumns(env);
      const row = await env.DB.prepare('SELECT p.*,r.display_name AS referred_by_display_name,r.slug AS referred_by_slug,r.avatar_url AS referred_by_avatar_url FROM profiles p LEFT JOIN profiles r ON r.user_id=p.referred_by_user_id WHERE p.user_id = ?').bind(uid).first();
      return json({ profile: profileSafe(row) });
    }
    if (url.pathname === '/api/profile' && ['POST','PUT','PATCH'].includes(request.method)) {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required to reserve a profile slug' }, 401);
      await ensureProfileColumns(env);
      const payload = await request.json().catch(() => null);
      const displayName = String(payload?.display_name || '').trim().slice(0, 120);
      const slug = profileSlug(payload?.slug);
      const continent = String(payload?.continent || '').trim();
      const country = canonicalProfileCountry(payload?.country);
      const city = String(payload?.city || '').trim().slice(0, 120);
      const bio = String(payload?.bio || '').trim().slice(0, 1200);
      const languages = String(payload?.languages || '').trim().slice(0, 240);
      const availability = String(payload?.availability || 'Not set').trim().slice(0, 80) || 'Not set';
      const participation = String(payload?.participation || 'Remote and in-person').trim().slice(0, 80) || 'Remote and in-person';
      const birthMonth = Number(payload?.birth_month);
      const birthYear = Number(payload?.birth_year);
      const avatarUrl = String(payload?.avatar_url || '').trim().slice(0, 700);
      const referrerId = String(payload?.referred_by_user_id || '').trim().slice(0, 160);
      if (!displayName) return json({ error: 'Display name is required' }, 400);
      if (slug && (slug.length < 3 || !/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug))) return json({ error: 'Slug must be 3–40 characters using lowercase letters, numbers, and hyphens.' }, 400);
      if (!Object.prototype.hasOwnProperty.call(PROFILE_LOCATION_GROUPS, continent)) return json({ error: 'Choose a valid continent' }, 400);
      if (country && !PROFILE_COUNTRY_CONTINENTS.has(country)) return json({ error: 'Choose a valid country' }, 400);
      if (country && PROFILE_COUNTRY_CONTINENTS.get(country) !== continent) return json({ error: 'Choose the continent that matches your country' }, 400);
      if (referrerId === uid) return json({ error: 'You cannot refer yourself.' }, 400);
      if (referrerId) { const referrer = await env.DB.prepare('SELECT user_id FROM profiles WHERE user_id = ?').bind(referrerId).first(); if (!referrer) return json({ error: 'That member could not be found.' }, 400); }
      if (avatarUrl && !avatarUrl.startsWith('/') && !/^https:\/\//i.test(avatarUrl)) return json({ error: 'Avatar URL is not valid.' }, 400);
      const currentYear = new Date().getFullYear();
      const hasBirthMonth = Number.isInteger(birthMonth) && birthMonth >= 1 && birthMonth <= 12;
      const hasBirthYear = Number.isInteger(birthYear) && birthYear >= 1900 && birthYear <= currentYear;
      if ((payload?.birth_month || payload?.birth_year) && (!hasBirthMonth || !hasBirthYear)) return json({ error: 'Choose a valid birth month and year.' }, 400);
      const existing = await env.DB.prepare('SELECT slug FROM profiles WHERE user_id = ?').bind(uid).first();
      if (existing?.slug && existing.slug !== slug) return json({ error: 'Your profile slug is locked after it is first reserved.' }, 409);
      if (slug) {
        const claimed = await env.DB.prepare('SELECT user_id FROM profiles WHERE slug = ?').bind(slug).first();
        if (claimed && claimed.user_id !== uid) return json({ error: 'That profile slug is already taken' }, 409);
      }
      const timestamp = now();
      try {
        await env.DB.prepare(`INSERT INTO profiles (user_id,display_name,slug,continent,country,city,skills_json,interests_json,bio,languages,availability,participation,birth_month,birth_year,avatar_url,referred_by_user_id,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name,slug=excluded.slug,continent=excluded.continent,country=excluded.country,city=excluded.city,skills_json=excluded.skills_json,interests_json=excluded.interests_json,bio=excluded.bio,languages=excluded.languages,availability=excluded.availability,participation=excluded.participation,birth_month=excluded.birth_month,birth_year=excluded.birth_year,avatar_url=excluded.avatar_url,referred_by_user_id=excluded.referred_by_user_id,updated_at=excluded.updated_at`)
          .bind(uid, displayName, slug || null, continent, country || null, city || null, JSON.stringify(Array.isArray(payload?.skills) ? payload.skills.map(value => String(value).trim()).filter(Boolean).slice(0, 50) : []), JSON.stringify(Array.isArray(payload?.interests) ? payload.interests.map(value => String(value).trim()).filter(Boolean).slice(0, 30) : []), bio, languages, availability, participation, hasBirthMonth ? birthMonth : null, hasBirthYear ? birthYear : null, avatarUrl || null, referrerId || null, timestamp)
          .run();
      } catch (error) {
        if (String(error?.message || error).toLowerCase().includes('unique')) return json({ error: 'That profile slug is already taken' }, 409);
        throw error;
      }
      const row = await env.DB.prepare('SELECT p.*,r.display_name AS referred_by_display_name,r.slug AS referred_by_slug,r.avatar_url AS referred_by_avatar_url FROM profiles p LEFT JOIN profiles r ON r.user_id=p.referred_by_user_id WHERE p.user_id = ?').bind(uid).first();
      return json({ ok: true, profile: profileSafe(row) }, existing ? 200 : 201);
    }
    if (url.pathname === '/api/map/locations' && request.method === 'GET') {
      const country = (url.searchParams.get('country') || '').toUpperCase();
      const county = url.searchParams.get('county') || '';
      const query = country && county
        ? env.DB.prepare("SELECT * FROM locations WHERE country_iso3 = ? AND county = ? AND archived = 0 AND visibility = ? AND privacy != 'Hidden' ORDER BY name LIMIT 500").bind(country, county, 'public')
        : country
          ? env.DB.prepare("SELECT * FROM locations WHERE country_iso3 = ? AND archived = 0 AND visibility = ? AND privacy != 'Hidden' ORDER BY name LIMIT 500").bind(country, 'public')
          : env.DB.prepare("SELECT * FROM locations WHERE archived = 0 AND visibility = ? AND privacy != 'Hidden' ORDER BY name LIMIT 500").bind('public');
      const { results } = await query.all();
      return json(results.map(safeLocation));
    }
    if (url.pathname === '/api/map/geometadata' && request.method === 'GET') {
      const recordId = url.searchParams.get('record');
      if (!recordId) return json({ error: 'record is required' }, 400);
      const row = await env.DB.prepare('SELECT * FROM geometadata WHERE related_record_id = ? AND visibility = ? LIMIT 1').bind(recordId, 'public').first();
      if (!row) return json({ id: `geo-${recordId}`, related_record_id: recordId, geometry_type: 'Point', public_precision: 'Approximate', verification: 'Needs Review' });
      const safe = { ...row };
      if (['Hidden', 'Country Only', 'County/Region'].includes(row.public_precision)) { safe.latitude = null; safe.longitude = null; }
      delete safe.geojson;
      return json(safe);
    }
    if (url.pathname === '/api/personal-maps' && request.method === 'GET') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const { results } = await env.DB.prepare('SELECT id,name,visibility,created_at,updated_at FROM personal_maps WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100').bind(uid).all();
      return json(results);
    }
    if (url.pathname === '/api/personal-maps' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const payload = await request.json().catch(() => null), id = String(payload?.id || crypto.randomUUID()).slice(0, 120), timestamp = now();
      if (!payload?.name) return json({ error: 'name is required' }, 400);
      await env.DB.prepare('INSERT INTO personal_maps (id,user_id,name,visibility,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(id, uid, String(payload.name).slice(0, 160), ['private','shared','team','public'].includes(payload.visibility) ? payload.visibility : 'private', timestamp, timestamp).run();
      return json({ ok: true, id }, 201);
    }
    if (url.pathname === '/api/personal-maps/items' && request.method === 'GET') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const mapId = url.searchParams.get('map_id'); if (!mapId) return json({ error: 'map_id is required' }, 400);
      const personalMap = await env.DB.prepare('SELECT id FROM personal_maps WHERE id = ? AND user_id = ?').bind(mapId, uid).first();
      if (!personalMap) return json({ error: 'Map not found' }, 404);
      const { results } = await env.DB.prepare('SELECT * FROM personal_map_items WHERE user_id = ? AND map_id = ? ORDER BY updated_at DESC LIMIT 500').bind(uid, mapId).all();
      return json(results);
    }
    if (url.pathname === '/api/personal-maps/items' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const payload = await request.json().catch(() => null), id = String(payload?.id || crypto.randomUUID()).slice(0, 120), timestamp = now();
      if (!payload?.map_id || !payload?.record_id) return json({ error: 'map_id and record_id are required' }, 400);
      const personalMap = await env.DB.prepare('SELECT id FROM personal_maps WHERE id = ? AND user_id = ?').bind(String(payload.map_id), uid).first();
      if (!personalMap) return json({ error: 'Map not found' }, 404);
      const existingItem = await env.DB.prepare('SELECT user_id FROM personal_map_items WHERE id = ?').bind(id).first();
      if (existingItem && existingItem.user_id !== uid) return json({ error: 'Item not found' }, 404);
      await env.DB.prepare('INSERT INTO personal_map_items (id,user_id,map_id,record_id,record_type,note,personal_label,marker_color,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET note=excluded.note,personal_label=excluded.personal_label,marker_color=excluded.marker_color,updated_at=excluded.updated_at').bind(id, uid, String(payload.map_id), String(payload.record_id), payload.record_type || null, payload.note || null, payload.personal_label || null, payload.marker_color || null, timestamp, timestamp).run();
      return json({ ok: true, id }, 201);
    }
    if (url.pathname === '/api/check-ins/mine' && request.method === 'GET') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const { results } = await env.DB.prepare('SELECT c.id,c.location_id,c.event_id,c.mission_id,c.status_text,c.timestamp,c.visibility,c.verification_method,c.moderation_status,e.url AS evidence_url FROM check_ins c LEFT JOIN check_in_evidence e ON e.check_in_id = c.id WHERE c.user_id = ? ORDER BY c.timestamp DESC LIMIT 100').bind(uid).all();
      return json(results);
    }
    if (url.pathname === '/api/check-ins/mine' && request.method === 'PATCH') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const payload = await request.json().catch(() => null), id = String(payload?.id || ''), statusText = String(payload?.status_text || '').trim().slice(0, 500);
      if (!statusText) return json({ error: 'Describe your participation' }, 400);
      const evidenceUrl = String(payload?.evidence_url || '').trim();
      if (evidenceUrl && (!/^https:\/\//i.test(evidenceUrl) || evidenceUrl.length > 500 || payload?.consent_confirmed !== true)) return json({ error: 'Use an HTTPS evidence link and confirm consent' }, 400);
      const existing = await env.DB.prepare('SELECT id,moderation_status FROM check_ins WHERE id = ? AND user_id = ?').bind(id, uid).first();
      if (!existing) return json({ error: 'Check-in not found' }, 404);
      if (existing.moderation_status !== 'Needs Changes') return json({ error: 'Only a check-in needing changes can be resubmitted' }, 409);
      const updates=[env.DB.prepare('UPDATE check_ins SET status_text = ?, visibility = ?, moderation_status = ? WHERE id = ? AND user_id = ?').bind(statusText, ['private','public'].includes(payload.visibility) ? payload.visibility : 'private', 'Review Required', id, uid),env.DB.prepare('DELETE FROM check_in_evidence WHERE check_in_id = ? AND user_id = ?').bind(id, uid),env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'resubmit_check_in', id, 'Review Required', now())];
      if(evidenceUrl)updates.push(env.DB.prepare('INSERT INTO check_in_evidence (id,user_id,check_in_id,url,consent_confirmed,created_at) VALUES (?,?,?,?,?,?)').bind(`evidence-${id}`, uid, id, evidenceUrl, 1, now()));
      await env.DB.batch(updates);
      return json({ ok:true, id, moderation_status:'Review Required' });
    }
    if (url.pathname === '/api/check-ins' && request.method === 'GET') {
      const locationId = url.searchParams.get('location_id');
      if (locationId && /^lib-(?:9|1[0-2])$/.test(locationId)) return json([]);
      const query = locationId
        ? env.DB.prepare("SELECT id,location_id,event_id,mission_id,status_text,timestamp,verification_method,moderation_status FROM check_ins WHERE location_id = ? AND visibility = 'public' AND moderation_status = 'Approved' AND NOT EXISTS (SELECT 1 FROM locations WHERE locations.id = check_ins.location_id AND locations.category IN ('orphanage','children_home')) ORDER BY timestamp DESC LIMIT 100").bind(locationId)
        : env.DB.prepare("SELECT id,location_id,event_id,mission_id,status_text,timestamp,verification_method,moderation_status FROM check_ins WHERE visibility = 'public' AND moderation_status = 'Approved' AND (location_id IS NULL OR location_id NOT IN ('lib-9','lib-10','lib-11','lib-12')) AND NOT EXISTS (SELECT 1 FROM locations WHERE locations.id = check_ins.location_id AND locations.category IN ('orphanage','children_home')) ORDER BY timestamp DESC LIMIT 100");
      const { results } = await query.all(); return json(results);
    }
    if (url.pathname === '/api/check-ins' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const payload = await request.json().catch(() => null), id = crypto.randomUUID(), syncKey = String(payload?.sync_key || id).slice(0, 160), timestamp = now();
      const links = ['location_id','event_id','mission_id'].filter(key => payload?.[key]);
      if (links.length !== 1) return json({ error: 'Choose one location, event, or mission' }, 400);
      const linkId = String(payload[links[0]]).slice(0, 120);
      if (!/^[a-zA-Z0-9_-]{2,120}$/.test(linkId)) return json({ error: 'Invalid record' }, 400);
      const existing = await env.DB.prepare('SELECT id,user_id,moderation_status FROM check_ins WHERE sync_key = ?').bind(syncKey).first();
      if (existing) return existing.user_id === uid ? json({ ok:true, id:existing.id, moderation_status:existing.moderation_status }) : json({ error:'Duplicate submission key' }, 409);
      let linked = false;
      if (links[0] === 'location_id') {
        const location = await env.DB.prepare("SELECT id,category FROM locations WHERE id = ? AND archived = 0 AND visibility = 'public' AND privacy != 'Hidden'").bind(linkId).first();
        linked = (/^lib-(?:[1-8]|1[3-4])$/.test(linkId) || Boolean(location)) && !['orphanage','children_home'].includes(location?.category);
      }
      if (links[0] === 'event_id') linked = Boolean(await env.DB.prepare("SELECT id FROM admin_records WHERE id = ? AND tab = 'Events' AND archived = 0 AND visibility = 'public'").bind(linkId).first());
      if (links[0] === 'mission_id') linked = ['peace-ghana','digital-twin','project-inferno','next-gen','inclusive-cities','youth-network'].includes(linkId) || Boolean(await env.DB.prepare("SELECT id FROM admin_records WHERE id = ? AND tab = 'Missions' AND archived = 0 AND visibility = 'public'").bind(linkId).first());
      if (!linked) return json({ error: 'This record is not available for check-ins' }, 404);
      const statusText = String(payload?.status_text || '').trim().slice(0, 500);
      if (!statusText) return json({ error: 'Describe your participation before submitting' }, 400);
      const evidenceUrl = String(payload?.evidence_url || '').trim();
      if (evidenceUrl && (!/^https:\/\//i.test(evidenceUrl) || evidenceUrl.length > 500 || payload?.consent_confirmed !== true)) return json({ error: 'Use an HTTPS evidence link and confirm consent' }, 400);
      const recent = await env.DB.prepare('SELECT COUNT(*) AS count FROM check_ins WHERE user_id = ? AND timestamp >= ?').bind(uid, new Date(Date.now() - 3600000).toISOString()).first();
      if (Number(recent?.count || 0) >= 10) return json({ error: 'Check-in limit reached. Try again later.' }, 429);
      const visibility = ['private','public'].includes(payload?.visibility) ? payload.visibility : 'private';
      const writes=[env.DB.prepare('INSERT INTO check_ins (id,user_id,location_id,event_id,mission_id,status_text,timestamp,visibility,verification_method,moderation_status,sync_key,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, uid, links[0] === 'location_id' ? linkId : null, links[0] === 'event_id' ? linkId : null, links[0] === 'mission_id' ? linkId : null, statusText, timestamp, visibility, 'Self-reported', 'Review Required', syncKey, timestamp),env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'submit_check_in', id, visibility, timestamp)];
      if(evidenceUrl)writes.push(env.DB.prepare('INSERT INTO check_in_evidence (id,user_id,check_in_id,url,consent_confirmed,created_at) VALUES (?,?,?,?,?,?)').bind(`evidence-${id}`, uid, id, evidenceUrl, 1, timestamp));
      await env.DB.batch(writes);
      return json({ ok: true, id, moderation_status: 'Review Required' }, 201);
    }
    if (url.pathname === '/api/admin/check-ins' && request.method === 'GET') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const { results } = await env.DB.prepare('SELECT c.id,c.location_id,c.event_id,c.mission_id,c.status_text,c.timestamp,c.visibility,c.moderation_status,e.url AS evidence_url FROM check_ins c LEFT JOIN check_in_evidence e ON e.check_in_id = c.id ORDER BY c.timestamp DESC LIMIT 200').all();
      return json(results);
    }
    if (url.pathname === '/api/admin/check-ins' && request.method === 'PATCH') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const payload = await request.json().catch(() => null), id = String(payload?.id || ''), status = String(payload?.status || '');
      if (!['Approved','Needs Changes','Rejected'].includes(status)) return json({ error: 'Invalid review status' }, 400);
      const existing = await env.DB.prepare('SELECT id FROM check_ins WHERE id = ?').bind(id).first();
      if (!existing) return json({ error: 'Check-in not found' }, 404);
      await env.DB.batch([
        env.DB.prepare('UPDATE check_ins SET moderation_status = ? WHERE id = ?').bind(status, id),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(user(request), 'review_check_in', id, status, now())
      ]);
      return json({ ok:true, id, moderation_status:status });
    }
    if (url.pathname === '/api/map/proposals' && request.method === 'GET') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const { results } = await env.DB.prepare('SELECT id,name,category,country_iso3,county,settlement,latitude,longitude,source_name,note,status,created_at FROM map_location_proposals WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').bind(uid).all();
      return json(results);
    }
    if (url.pathname === '/api/map/proposals' && request.method === 'PATCH') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const payload = await request.json().catch(() => null), id = String(payload?.id || ''), name = String(payload?.name || '').trim().slice(0, 160), country = String(payload?.country_iso3 || '').trim().toUpperCase();
      const existing = await env.DB.prepare('SELECT status FROM map_location_proposals WHERE id = ? AND user_id = ?').bind(id, uid).first();
      if (!existing) return json({ error: 'Proposal not found' }, 404);
      if (existing.status !== 'Needs Changes') return json({ error: 'This proposal is not open for changes' }, 409);
      if (!name || !COUNTRY_CATALOG.some(item => item.iso3 === country)) return json({ error: 'Choose a name and valid country' }, 400);
      if (!String(payload?.source_name || '').trim()) return json({ error: 'A source is required for review' }, 400);
      if (payload?.latitude != null && !validCoordinate(payload.latitude, -90, 90)) return json({ error: 'Invalid latitude' }, 400);
      if (payload?.longitude != null && !validCoordinate(payload.longitude, -180, 180)) return json({ error: 'Invalid longitude' }, 400);
      const duplicate = await env.DB.prepare('SELECT id FROM locations WHERE lower(name) = lower(?) AND country_iso3 = ? AND archived = 0 LIMIT 1').bind(name, country).first();
      if (duplicate) return json({ error: 'A public place with this name already exists.' }, 409);
      await env.DB.prepare("UPDATE map_location_proposals SET name = ?, category = ?, country_iso3 = ?, county = ?, settlement = ?, latitude = ?, longitude = ?, source_name = ?, note = ?, status = 'Needs Review', reviewed_at = NULL, reviewed_by = NULL WHERE id = ? AND user_id = ?").bind(name, ['school','university','college','mission','partner','impact','event'].includes(payload.category) ? payload.category : 'mission', country, String(payload.county || '').slice(0, 120), String(payload.settlement || '').slice(0, 120), payload.latitude == null ? null : Number(payload.latitude), payload.longitude == null ? null : Number(payload.longitude), String(payload.source_name || '').slice(0, 180), String(payload.note || '').slice(0, 500), id, uid).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'resubmit_map_proposal', id, 'Needs Review', now()).run();
      return json({ ok:true, id, status:'Needs Review' });
    }
    if (url.pathname === '/api/map/proposals' && request.method === 'POST') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const payload = await request.json().catch(() => null), name = String(payload?.name || '').trim().slice(0, 160), country = String(payload?.country_iso3 || '').trim().toUpperCase();
      if (!name || !COUNTRY_CATALOG.some(item => item.iso3 === country)) return json({ error: 'Choose a valid country' }, 400);
      if (!String(payload?.source_name || '').trim()) return json({ error: 'A source is required for review' }, 400);
      if (payload?.latitude != null && !validCoordinate(payload.latitude, -90, 90)) return json({ error: 'Invalid latitude' }, 400);
      if (payload?.longitude != null && !validCoordinate(payload.longitude, -180, 180)) return json({ error: 'Invalid longitude' }, 400);
      const category = ['school','university','college','mission','partner','impact','event'].includes(payload?.category) ? payload.category : 'mission';
      const duplicate = await env.DB.prepare('SELECT id FROM locations WHERE lower(name) = lower(?) AND country_iso3 = ? AND archived = 0 LIMIT 1').bind(name, country).first();
      if (duplicate) return json({ error: 'A public place with this name already exists. Open it on the map or send a correction to the steward.' }, 409);
      const pending = await env.DB.prepare("SELECT id FROM map_location_proposals WHERE lower(name) = lower(?) AND country_iso3 = ? AND status = 'Needs Review' LIMIT 1").bind(name, country).first();
      if (pending) return json({ error: 'This place is already awaiting review.' }, 409);
      const proposalCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM map_location_proposals WHERE user_id = ? AND status = 'Needs Review'").bind(uid).first();
      if (Number(proposalCount?.count || 0) >= 10) return json({ error: 'Review queue limit reached. Wait for a decision on an existing proposal.' }, 429);
      const id = crypto.randomUUID(), timestamp = now();
      await env.DB.prepare('INSERT INTO map_location_proposals (id,user_id,name,category,country_iso3,county,settlement,latitude,longitude,source_name,note,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, uid, name, category, country, String(payload.county || '').slice(0, 120), String(payload.settlement || '').slice(0, 120), payload.latitude == null ? null : Number(payload.latitude), payload.longitude == null ? null : Number(payload.longitude), String(payload.source_name || '').slice(0, 180), String(payload.note || '').slice(0, 500), 'Needs Review', timestamp).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'propose_map_location', id, country, timestamp).run();
      return json({ ok:true, id, status:'Needs Review' }, 201);
    }
    if (url.pathname === '/api/map/proposals' && request.method === 'DELETE') {
      const uid = user(request); if (!uid) return json({ error: 'Sign in required' }, 401);
      const id = String(url.searchParams.get('id') || '');
      const proposal = await env.DB.prepare('SELECT status FROM map_location_proposals WHERE id = ? AND user_id = ?').bind(id, uid).first();
      if (!proposal) return json({ error: 'Proposal not found' }, 404);
      if (proposal.status === 'Approved') return json({ error: 'Published places require administrator review to archive' }, 409);
      await env.DB.prepare('DELETE FROM map_location_proposals WHERE id = ? AND user_id = ?').bind(id, uid).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'withdraw_map_proposal', id, proposal.status, now()).run();
      return json({ ok:true, id });
    }
    if (url.pathname === '/api/admin/map-proposals' && request.method === 'GET') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const { results } = await env.DB.prepare('SELECT * FROM map_location_proposals ORDER BY created_at DESC LIMIT 200').all();
      return json(results);
    }
    if (url.pathname === '/api/admin/map-proposals' && request.method === 'PATCH') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const payload = await request.json().catch(() => null), id = String(payload?.id || ''), status = String(payload?.status || '');
      if (!['Approved','Rejected','Needs Changes'].includes(status)) return json({ error: 'Invalid review status' }, 400);
      const proposal = await env.DB.prepare('SELECT * FROM map_location_proposals WHERE id = ?').bind(id).first();
      if (!proposal) return json({ error: 'Proposal not found' }, 404);
      const timestamp = now();
      const writes = [
        env.DB.prepare('UPDATE map_location_proposals SET status = ?, reviewed_at = ?, reviewed_by = ? WHERE id = ?').bind(status, timestamp, user(request), id),
        env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(user(request), 'review_map_proposal', id, status, timestamp)
      ];
      if (status === 'Approved') writes.push(env.DB.prepare('INSERT OR IGNORE INTO locations (id,user_id,name,category,country_iso3,county,settlement,latitude,longitude,privacy,source_name,verification,visibility,archived,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,?)').bind(`proposal-${id}`, proposal.user_id, proposal.name, proposal.category, proposal.country_iso3, proposal.county, proposal.settlement, proposal.latitude, proposal.longitude, ['Approximate','County/Region','Country Only'].includes(payload.public_precision) ? payload.public_precision : 'Approximate', proposal.source_name || 'Community proposal', 'Needs Review', 'public', timestamp));
      await env.DB.batch(writes);
      return json({ ok:true, id, status });
    }
    if (url.pathname === '/api/impact/claims' && request.method === 'GET') {
      const id = String(url.searchParams.get('id') || '').slice(0,120);
      if (id) {
        const claim = await env.DB.prepare("SELECT * FROM impact_claims WHERE id = ? AND (status = 'Withdrawn' OR (status IN ('Published','Corrected') AND EXISTS (SELECT 1 FROM impact_claim_evidence l JOIN evidence_submissions e ON e.id=l.evidence_id WHERE l.claim_id=impact_claims.id AND e.status='Accepted')))").bind(id).first();
        if (!claim) return json({ error:'Published claim not found' },404);
        const {results:evidence} = await env.DB.prepare("SELECT e.id,e.public_note,e.occurred_at,e.related_type,e.related_id FROM impact_claim_evidence l JOIN evidence_submissions e ON e.id=l.evidence_id WHERE l.claim_id=? AND e.status='Accepted' ORDER BY e.occurred_at DESC").bind(id).all();
        const {results:history} = await env.DB.prepare('SELECT action,note,snapshot_json,created_at FROM impact_claim_revisions WHERE claim_id=? ORDER BY created_at DESC LIMIT 30').bind(id).all();
        return json({...impactPublicClaim(claim),evidence:evidence.map(item=>({public_note:item.public_note||'Reviewed supporting evidence',occurred_at:item.occurred_at,related_type:item.related_type,related_id:item.related_type==='checkin'?null:item.related_id})),history:history.map(item=>{let previous={};try{previous=JSON.parse(item.snapshot_json||'{}');}catch(_){}return {action:item.action,note:item.note,created_at:item.created_at,previous_value:previous.value,previous_unit:previous.unit,previous_method:previous.method};})});
      }
      const {results} = await env.DB.prepare("SELECT * FROM impact_claims WHERE status IN ('Published','Corrected') AND EXISTS (SELECT 1 FROM impact_claim_evidence l JOIN evidence_submissions e ON e.id=l.evidence_id WHERE l.claim_id=impact_claims.id AND e.status='Accepted') ORDER BY period_end DESC, published_at DESC LIMIT 300").all();
      const {results:relations}=await env.DB.prepare("SELECT l.claim_id,e.related_type,e.related_id FROM impact_claim_evidence l JOIN evidence_submissions e ON e.id=l.evidence_id WHERE e.status='Accepted'").all();
      return json(results.map(row=>({...impactPublicClaim(row),related_records:relations.filter(link=>link.claim_id===row.id&&link.related_type!=='checkin').map(link=>({type:link.related_type,id:link.related_id}))})));
    }
    if (url.pathname === '/api/evidence/mine' && request.method === 'GET') {
      const uid=user(request);if(!uid)return json({error:'Sign in required'},401);
      const {results}=await env.DB.prepare('SELECT id,related_type,related_id,summary,occurred_at,source_url,consent_confirmed,status,public_note,reviewer_note,created_at,updated_at FROM evidence_submissions WHERE user_id=? ORDER BY updated_at DESC LIMIT 100').bind(uid).all();
      return json(results);
    }
    if (url.pathname === '/api/evidence' && ['POST','PATCH'].includes(request.method)) {
      const uid=user(request);if(!uid)return json({error:'Sign in required'},401);
      const payload=await request.json().catch(()=>null), id=request.method==='POST'?crypto.randomUUID():String(payload?.id||''), timestamp=now();
      if(!payload)return json({error:'Invalid evidence payload'},400);
      const relatedType=String(payload.related_type||''),relatedId=String(payload.related_id||'').slice(0,120);
      if(!['mission','event','checkin'].includes(relatedType)||!/^[a-zA-Z0-9_-]{2,120}$/.test(relatedId))return json({error:'Choose a mission, event, or your check-in'},400);
      let linked=false;
      if(relatedType==='mission')linked=['peace-ghana','digital-twin','project-inferno','next-gen','inclusive-cities','youth-network'].includes(relatedId)||Boolean(await env.DB.prepare("SELECT id FROM admin_records WHERE id=? AND tab='Missions' AND archived=0 AND visibility='public'").bind(relatedId).first());
      if(relatedType==='event')linked=['peace-2026','peace-close','twin-lab'].includes(relatedId)||Boolean(await env.DB.prepare("SELECT id FROM admin_records WHERE id=? AND tab='Events' AND archived=0 AND visibility='public'").bind(relatedId).first());
      if(relatedType==='checkin')linked=Boolean(await env.DB.prepare('SELECT id FROM check_ins WHERE id=? AND user_id=?').bind(relatedId,uid).first());
      if(!linked)return json({error:'The related record is unavailable'},404);
      const summary=String(payload.summary||'').trim().slice(0,1200),occurredAt=String(payload.occurred_at||''),sourceUrl=String(payload.source_url||'').trim(),submit=payload.submit===true;
      if(occurredAt&&!impactDate(occurredAt))return json({error:'Enter a valid activity date'},400);
      if(sourceUrl&&(!/^https:\/\//i.test(sourceUrl)||sourceUrl.length>500))return json({error:'Use an HTTPS evidence link'},400);
      if(submit&&(!summary||!impactDate(occurredAt)||payload.consent_confirmed!==true))return json({error:'Summary, date, and consent are required for submission'},400);
      if(submit&&occurredAt>new Date().toISOString().slice(0,10))return json({error:'Evidence activity date cannot be in the future'},400);
      let existing=null;
      if(request.method==='PATCH'){
        existing=await env.DB.prepare('SELECT id,status FROM evidence_submissions WHERE id=? AND user_id=?').bind(id,uid).first();
        if(!existing)return json({error:'Evidence draft not found'},404);
        if(!['Draft','Needs Changes'].includes(existing.status))return json({error:'This submission cannot be edited'},409);
      } else {
        const recent=await env.DB.prepare('SELECT COUNT(*) AS count FROM evidence_submissions WHERE user_id=? AND created_at>=?').bind(uid,new Date(Date.now()-3600000).toISOString()).first();
        if(Number(recent?.count||0)>=10)return json({error:'Submission limit reached; try again later'},429);
      }
      const status=submit?'Submitted':'Draft', consent=payload.consent_confirmed===true?1:0;
      const writes=request.method==='POST'?
        [env.DB.prepare('INSERT INTO evidence_submissions(id,user_id,related_type,related_id,summary,occurred_at,source_url,consent_confirmed,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id,uid,relatedType,relatedId,summary,occurredAt||null,sourceUrl||null,consent,status,timestamp,timestamp)]:
        [env.DB.prepare("UPDATE evidence_submissions SET related_type=?,related_id=?,summary=?,occurred_at=?,source_url=?,consent_confirmed=?,status=?,reviewer_note='',reviewed_by=NULL,reviewed_at=NULL,updated_at=? WHERE id=? AND user_id=?").bind(relatedType,relatedId,summary,occurredAt||null,sourceUrl||null,consent,status,timestamp,id,uid)];
      writes.push(env.DB.prepare('INSERT INTO audit_log(user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid,submit?'submit_evidence':'save_evidence_draft',id,status,timestamp));
      await env.DB.batch(writes);
      return json({ok:true,id,status},request.method==='POST'?201:200);
    }
    if (url.pathname === '/api/evidence' && request.method === 'DELETE') {
      const uid=user(request);if(!uid)return json({error:'Sign in required'},401);
      const id=String(url.searchParams.get('id')||'');
      const existing=await env.DB.prepare('SELECT status FROM evidence_submissions WHERE id=? AND user_id=?').bind(id,uid).first();
      if(!existing)return json({error:'Evidence not found'},404);
      if(!['Draft','Needs Changes','Rejected'].includes(existing.status))return json({error:'Submitted or accepted evidence must remain in its review trail'},409);
      await env.DB.batch([env.DB.prepare('DELETE FROM evidence_submissions WHERE id=? AND user_id=?').bind(id,uid),env.DB.prepare('INSERT INTO audit_log(user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid,'discard_evidence',id,existing.status,now())]);
      return json({ok:true,id});
    }
    if (url.pathname === '/api/admin/evidence' && request.method === 'GET') {
      if(!owner(request))return json({error:'Owner authorization required'},403);
      const {results}=await env.DB.prepare('SELECT * FROM evidence_submissions ORDER BY updated_at DESC LIMIT 300').all();return json(results);
    }
    if (url.pathname === '/api/admin/evidence' && request.method === 'PATCH') {
      if(!owner(request))return json({error:'Owner authorization required'},403);
      const payload=await request.json().catch(()=>null),id=String(payload?.id||''),status=String(payload?.status||'');
      if(!['Accepted','Needs Changes','Rejected'].includes(status))return json({error:'Invalid evidence decision'},400);
      const existing=await env.DB.prepare('SELECT id,status FROM evidence_submissions WHERE id=?').bind(id).first();
      if(!existing)return json({error:'Evidence not found'},404);
      if(!['Submitted','Accepted'].includes(existing.status))return json({error:'Evidence is not ready for review'},409);
      if(existing.status==='Accepted'&&status==='Accepted')return json({error:'Accepted evidence cannot be silently edited'},409);
      if(existing.status==='Accepted'&&status!=='Accepted'){
        const published=await env.DB.prepare("SELECT c.id FROM impact_claim_evidence l JOIN impact_claims c ON c.id=l.claim_id WHERE l.evidence_id=? AND c.status IN ('Published','Corrected') LIMIT 1").bind(id).first();
        if(published)return json({error:'Withdraw or revise the published claim before changing this evidence'},409);
      }
      const publicNote=String(payload?.public_note||'').trim().slice(0,500),reviewerNote=String(payload?.reviewer_note||'').trim().slice(0,500),timestamp=now();
      if(status==='Accepted'&&!publicNote)return json({error:'Add a public-safe evidence note'},400);
      await env.DB.batch([env.DB.prepare('UPDATE evidence_submissions SET status=?,public_note=?,reviewer_note=?,reviewed_by=?,reviewed_at=?,updated_at=? WHERE id=?').bind(status,status==='Accepted'?publicNote:'',reviewerNote,user(request),timestamp,timestamp,id),env.DB.prepare('INSERT INTO audit_log(user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(user(request),'review_evidence',id,status,timestamp)]);
      return json({ok:true,id,status});
    }
    if (url.pathname === '/api/admin/impact/claims' && request.method === 'GET') {
      if(!owner(request))return json({error:'Owner authorization required'},403);
      const {results}=await env.DB.prepare('SELECT * FROM impact_claims ORDER BY updated_at DESC LIMIT 300').all();
      const {results:links}=await env.DB.prepare('SELECT claim_id,evidence_id FROM impact_claim_evidence').all();
      return json(results.map(row=>({...row,evidence_ids:links.filter(link=>link.claim_id===row.id).map(link=>link.evidence_id)})));
    }
    if (url.pathname === '/api/admin/impact/claims' && request.method === 'DELETE') {
      if(!owner(request))return json({error:'Owner authorization required'},403);
      const id=String(url.searchParams.get('id')||''),claim=await env.DB.prepare('SELECT status FROM impact_claims WHERE id=?').bind(id).first();
      if(!claim)return json({error:'Claim not found'},404);
      if(claim.status!=='Draft')return json({error:'Published claims must be withdrawn with a visible history'},409);
      await env.DB.batch([env.DB.prepare('DELETE FROM impact_claim_evidence WHERE claim_id=?').bind(id),env.DB.prepare('DELETE FROM impact_claim_revisions WHERE claim_id=?').bind(id),env.DB.prepare('DELETE FROM impact_claims WHERE id=?').bind(id),env.DB.prepare('INSERT INTO audit_log(user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(user(request),'discard_impact_draft',id,'Draft removed',now())]);
      return json({ok:true,id});
    }
    if (url.pathname === '/api/admin/impact/claims' && ['POST','PATCH'].includes(request.method)) {
      if(!owner(request))return json({error:'Owner authorization required'},403);
      const payload=await request.json().catch(()=>null),fields=impactClaimInput(payload),timestamp=now(),uid=user(request),id=request.method==='POST'?crypto.randomUUID():String(payload?.id||'');
      if(!fields.title||!Number.isFinite(fields.value)||!fields.unit||!fields.indicator_definition||!fields.method||!fields.source_name||!impactDate(fields.period_start)||!impactDate(fields.period_end)||fields.period_start>fields.period_end)return json({error:'Complete the value, definition, period, method, and source'},400);
      if(fields.country_iso3&&!COUNTRY_CATALOG.some(country=>country.iso3===fields.country_iso3))return json({error:'Invalid country'},400);
      if(fields.mission_id&&!['peace-ghana','digital-twin','project-inferno','next-gen','inclusive-cities','youth-network'].includes(fields.mission_id)&&!await env.DB.prepare("SELECT id FROM admin_records WHERE id=? AND tab='Missions' AND archived=0 AND visibility='public'").bind(fields.mission_id).first())return json({error:'Invalid mission link'},400);
      const requested=Array.isArray(payload?.evidence_ids)?[...new Set(payload.evidence_ids.map(String))].slice(0,20):null;
      let existing=null;
      if(request.method==='PATCH'){
        existing=await env.DB.prepare('SELECT * FROM impact_claims WHERE id=?').bind(id).first();
        if(!existing)return json({error:'Claim not found'},404);
      }
      const status=String(payload?.status||'Draft');
      if(!['Draft','Published','Corrected','Withdrawn'].includes(status))return json({error:'Invalid claim status'},400);
      if(['Published','Corrected'].includes(status)&&fields.period_end>new Date().toISOString().slice(0,10))return json({error:'Measured periods must have ended before publication'},400);
      if(request.method==='POST'&&!['Draft','Published'].includes(status))return json({error:'Create a draft or published claim'},400);
      if(existing?.status==='Withdrawn')return json({error:'Withdrawn claims remain historical. Create a new claim instead'},409);
      if(existing&&['Published','Corrected'].includes(existing.status)&&!['Corrected','Withdrawn'].includes(status))return json({error:'Published claims require a correction or withdrawal'},409);
      if(status==='Corrected'&&(!existing||!['Published','Corrected'].includes(existing.status)))return json({error:'Publish the claim before correcting it'},409);
      if(status==='Withdrawn'&&(!existing||!['Published','Corrected'].includes(existing.status)))return json({error:'Only published claims can be withdrawn'},409);
      if(['Corrected','Withdrawn'].includes(status)&&!String(payload?.reviewer_note||'').trim())return json({error:'Explain the correction or withdrawal'},400);
      const evidenceIds=requested??(existing?(await env.DB.prepare('SELECT evidence_id FROM impact_claim_evidence WHERE claim_id=?').bind(id).all()).results.map(row=>row.evidence_id):[]);
      if(['Published','Corrected'].includes(status)&&!evidenceIds.length)return json({error:'Link accepted evidence before publishing'},400);
      if(['Published','Corrected'].includes(status))for(const evidenceId of evidenceIds){const accepted=await env.DB.prepare("SELECT id FROM evidence_submissions WHERE id=? AND status='Accepted'").bind(evidenceId).first();if(!accepted)return json({error:'Every linked evidence record must be accepted'},400);}
      const note=String(payload?.reviewer_note||'').trim().slice(0,500),snapshot=JSON.stringify(existing?impactPublicClaim(existing):{}).slice(0,8000);
      const writes=[];
      if(request.method==='POST')writes.push(env.DB.prepare('INSERT INTO impact_claims(id,user_id,title,claim_type,value,unit,indicator_definition,period_start,period_end,country_iso3,mission_id,sdg,method,limitations,source_name,public_precision,status,reviewer_note,reviewed_by,reviewed_at,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,uid,fields.title,fields.claim_type,fields.value,fields.unit,fields.indicator_definition,fields.period_start,fields.period_end,fields.country_iso3||null,fields.mission_id||null,fields.sdg||null,fields.method,fields.limitations,fields.source_name,fields.public_precision,status,note,['Published','Corrected'].includes(status)?uid:null,['Published','Corrected'].includes(status)?timestamp:null,status==='Published'?timestamp:null,timestamp,timestamp));
      else writes.push(env.DB.prepare('UPDATE impact_claims SET title=?,claim_type=?,value=?,unit=?,indicator_definition=?,period_start=?,period_end=?,country_iso3=?,mission_id=?,sdg=?,method=?,limitations=?,source_name=?,public_precision=?,status=?,reviewer_note=?,reviewed_by=?,reviewed_at=?,published_at=?,updated_at=? WHERE id=?').bind(fields.title,fields.claim_type,fields.value,fields.unit,fields.indicator_definition,fields.period_start,fields.period_end,fields.country_iso3||null,fields.mission_id||null,fields.sdg||null,fields.method,fields.limitations,fields.source_name,fields.public_precision,status,note,['Published','Corrected'].includes(status)?uid:existing.reviewed_by,['Published','Corrected'].includes(status)?timestamp:existing.reviewed_at,existing.published_at||(status==='Published'?timestamp:null),timestamp,id));
      if(requested){writes.push(env.DB.prepare('DELETE FROM impact_claim_evidence WHERE claim_id=?').bind(id));for(const evidenceId of evidenceIds)writes.push(env.DB.prepare('INSERT INTO impact_claim_evidence(id,user_id,claim_id,evidence_id,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),uid,id,evidenceId,timestamp));}
      writes.push(env.DB.prepare('INSERT INTO impact_claim_revisions(id,user_id,claim_id,action,snapshot_json,note,created_at) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),uid,id,existing?`${existing.status} → ${status}`:`Created ${status}`,snapshot,note,timestamp));
      writes.push(env.DB.prepare('INSERT INTO audit_log(user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid,'review_impact_claim',id,status,timestamp));
      await env.DB.batch(writes);return json({ok:true,id,status},request.method==='POST'?201:200);
    }
    if (url.pathname === '/api/events' && request.method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM admin_records WHERE tab = 'Events' AND archived = 0 AND visibility = 'public' ORDER BY updated_at DESC LIMIT 500").all();
      return json(results.map(safeEventRecord));
    }
    if (url.pathname === '/api/events/georss' && request.method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM admin_records WHERE tab = 'Events' AND archived = 0 AND visibility = 'public' ORDER BY updated_at DESC LIMIT 500").all();
      return new Response(eventGeoRss(results), { headers:{ 'content-type':'application/rss+xml; charset=utf-8', 'cache-control':'public, max-age=60' } });
    }
    if (url.pathname === '/api/country-images' && request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT country_id,url,alt,poi,prompt,updated_at FROM country_images ORDER BY country_id').all();
      return json(results);
    }
    if (url.pathname === '/api/admin/country-images' && request.method === 'POST') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const payload = await request.json().catch(() => null);
      const countryId = String(payload?.country_id || '').trim().toLowerCase();
      if (!COUNTRY_IMAGE_POIS[countryId]) return json({ error: 'A supported country is required' }, 400);
      const poi = String(payload?.poi || COUNTRY_IMAGE_POIS[countryId]).trim().slice(0, 180);
      const countryName = String(payload?.country_name || countryId).trim().slice(0, 120);
      const prompt = String(payload?.prompt || `Editorial country hero photograph for ${countryName}, centered on the well-known public landmark ${poi}. Wide 16:9 composition, authentic local atmosphere, documentary travel photography, warm natural light, no logos, no text, no watermarks, no invented project claims.`).slice(0, 1200);
      let imageUrl = safeHttpUrl(payload?.image_url);
      try {
        if (!imageUrl) {
          if (!env.AI?.generateImage) return json({ error: 'Image generation is unavailable right now' }, 503);
          const generated = await env.AI.generateImage({ prompt, aspectRatio: '16:9' });
          imageUrl = safeHttpUrl(generated?.url);
        }
      } catch (error) {
        return json({ error: 'The image service could not generate this country image' }, 502);
      }
      if (!imageUrl) return json({ error: 'The image service returned no public image URL' }, 502);
      const timestamp = now(), uid = user(request);
      await env.DB.prepare('INSERT INTO country_images (country_id,url,alt,poi,prompt,generated_by,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(country_id) DO UPDATE SET url=excluded.url,alt=excluded.alt,poi=excluded.poi,prompt=excluded.prompt,generated_by=excluded.generated_by,updated_at=excluded.updated_at').bind(countryId, imageUrl, `${countryName} with ${poi}`, poi, prompt, uid, timestamp).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'regenerate_country_image', countryId, `Country hero generated with landmark: ${poi}`, timestamp).run();
      return json({ ok: true, image: { country_id:countryId, url:imageUrl, alt:`${countryName} with ${poi}`, poi, prompt, updated_at:timestamp } }, 201);
    }
    if (url.pathname === '/api/admin/events' && request.method === 'POST') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const payload = await request.json().catch(() => null), title = String(payload?.title || '').trim().slice(0, 240);
      if (!title) return json({ error: 'title is required' }, 400);
      if (payload?.latitude != null && !validCoordinate(payload.latitude, -90, 90)) return json({ error: 'Latitude must be between -90 and 90' }, 400);
      if (payload?.longitude != null && !validCoordinate(payload.longitude, -180, 180)) return json({ error: 'Longitude must be between -180 and 180' }, 400);
      const uid = user(request), id = String(payload.id || crypto.randomUUID()).slice(0, 120), timestamp = now();
      const details = JSON.stringify({ date:String(payload.date || '').slice(0, 80), type:String(payload.type || 'Community event').slice(0, 80), location:String(payload.location || '').slice(0, 180), organizer:String(payload.organizer || '').slice(0, 180), latitude:payload.latitude == null ? null : Number(payload.latitude), longitude:payload.longitude == null ? null : Number(payload.longitude), notes:String(payload.notes || '').slice(0, 1200) }).slice(0, 6000);
      await env.DB.prepare('INSERT INTO admin_records (id,user_id,tab,title,summary,status,country,source_url,details_json,visibility,archived,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,?,?)').bind(id, uid, 'Events', title, String(payload.summary || '').slice(0, 1200), String(payload.status || 'Planned').slice(0, 80), String(payload.country || '').slice(0, 120), safeHttpUrl(payload.source_url), details, ['public','private'].includes(payload.visibility) ? payload.visibility : 'public', timestamp, timestamp).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'create_event', id, 'Admin event write with GeoRSS fields', timestamp).run();
      const row = await env.DB.prepare('SELECT * FROM admin_records WHERE id = ?').bind(id).first();
      return json({ ok:true, record:safeEventRecord(row) }, 201);
    }
    if (url.pathname === '/api/records' && request.method === 'GET') {
      const tab = url.searchParams.get('tab');
      const query = tab && ADMIN_TABS.includes(tab)
        ? env.DB.prepare("SELECT * FROM admin_records WHERE tab = ? AND archived = 0 AND visibility = 'public' ORDER BY updated_at DESC LIMIT 500").bind(tab)
        : env.DB.prepare("SELECT * FROM admin_records WHERE archived = 0 AND visibility = 'public' ORDER BY updated_at DESC LIMIT 500");
      const { results } = await query.all();
      return json(results.map(safeAdminRecord));
    }
    if (url.pathname === '/api/admin/records' && request.method === 'GET') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const tab = url.searchParams.get('tab');
      const query = tab && ADMIN_TABS.includes(tab)
        ? env.DB.prepare('SELECT * FROM admin_records WHERE tab = ? ORDER BY archived, updated_at DESC LIMIT 1000').bind(tab)
        : env.DB.prepare('SELECT * FROM admin_records ORDER BY archived, updated_at DESC LIMIT 2000');
      const { results } = await query.all();
      return json(results.map(safeAdminRecord));
    }
    if (url.pathname === '/api/admin/records' && ['POST','PUT','PATCH'].includes(request.method)) {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const payload = await request.json().catch(() => null), fields = adminRecordPayload(payload);
      if (!fields.tab || !fields.title) return json({ error: 'tab and title are required' }, 400);
      const uid = user(request), id = String(payload.id || crypto.randomUUID()).slice(0, 120), timestamp = now();
      if (request.method === 'POST') {
        await env.DB.prepare('INSERT INTO admin_records (id,user_id,tab,title,summary,status,country,source_url,details_json,visibility,archived,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,?,?)').bind(id, uid, fields.tab, fields.title, fields.summary, fields.status, fields.country, fields.source_url, fields.details_json, fields.visibility, timestamp, timestamp).run();
      } else {
        const existing = await env.DB.prepare('SELECT id FROM admin_records WHERE id = ?').bind(id).first();
        if (!existing) return json({ error: 'Record not found' }, 404);
        await env.DB.prepare('UPDATE admin_records SET tab=?,title=?,summary=?,status=?,country=?,source_url=?,details_json=?,visibility=?,updated_at=? WHERE id=?').bind(fields.tab, fields.title, fields.summary, fields.status, fields.country, fields.source_url, fields.details_json, fields.visibility, timestamp, id).run();
      }
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, request.method === 'POST' ? 'create_admin_record' : 'update_admin_record', id, `Admin ${fields.tab} record write`, timestamp).run();
      const row = await env.DB.prepare('SELECT * FROM admin_records WHERE id = ?').bind(id).first();
      return json({ ok: true, record: safeAdminRecord(row) }, request.method === 'POST' ? 201 : 200);
    }
    if (url.pathname === '/api/admin/records' && request.method === 'DELETE') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const id = url.searchParams.get('id'); if (!id) return json({ error: 'id is required' }, 400);
      const uid = user(request), timestamp = now();
      await env.DB.prepare('UPDATE admin_records SET archived = 1, updated_at = ? WHERE id = ?').bind(timestamp, id).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'archive_admin_record', id, 'Archive is recoverable; data is not deleted', timestamp).run();
      return json({ ok: true, archived: true });
    }
    if (url.pathname === '/api/admin/locations' && request.method === 'GET') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const { results } = await env.DB.prepare('SELECT * FROM locations ORDER BY updated_at DESC LIMIT 1000').all();
      return json(results.map(row => ({ ...row, slug:row.slug || locationSlug(row) })));
    }
    if (url.pathname === '/api/admin/locations' && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const payload = await request.json().catch(() => null);
      if (!payload || !payload.id || !payload.name || !payload.category || !payload.country_iso3) return json({ error: 'id, name, category, and country_iso3 are required' }, 400);
      if (payload.latitude != null && !validCoordinate(payload.latitude, -90, 90)) return json({ error: 'Latitude must be between -90 and 90' }, 400);
      if (payload.longitude != null && !validCoordinate(payload.longitude, -180, 180)) return json({ error: 'Longitude must be between -180 and 180' }, 400);
      const existing = await env.DB.prepare('SELECT verification FROM locations WHERE id = ?').bind(String(payload.id)).first();
      if (existing?.verification === 'Verified' && request.method === 'POST') return json({ error: 'Verified records require an explicit update workflow' }, 409);
      const uid = user(request), timestamp = now();
      await env.DB.prepare(`INSERT INTO locations (id,user_id,name,category,country_iso3,county,settlement,latitude,longitude,privacy,source_name,source_url,verification,visibility,archived,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name,category=excluded.category,country_iso3=excluded.country_iso3,county=excluded.county,settlement=excluded.settlement,latitude=excluded.latitude,longitude=excluded.longitude,privacy=excluded.privacy,source_name=excluded.source_name,source_url=excluded.source_url,verification=excluded.verification,visibility=excluded.visibility,archived=excluded.archived,updated_at=excluded.updated_at`).bind(
        String(payload.id).slice(0, 120), uid, String(payload.name).slice(0, 240), String(payload.category).slice(0, 60), String(payload.country_iso3).slice(0, 3).toUpperCase(), payload.county || null, payload.settlement || null, payload.latitude == null ? null : Number(payload.latitude), payload.longitude == null ? null : Number(payload.longitude), payload.privacy || 'Approximate', payload.source_name || null, safeHttpUrl(payload.source_url) || null, payload.verification || 'Needs Review', ['public','private'].includes(payload.visibility) ? payload.visibility : 'public', payload.archived ? 1 : 0, timestamp).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, request.method === 'POST' ? 'create_location' : 'update_location', String(payload.id), 'Admin location write', timestamp).run();
      return json({ ok: true, id: payload.id }, request.method === 'POST' ? 201 : 200);
    }
    if (url.pathname === '/api/admin/locations' && request.method === 'DELETE') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'id is required' }, 400);
      const uid = user(request), timestamp = now();
      await env.DB.prepare('UPDATE locations SET archived = 1, updated_at = ? WHERE id = ?').bind(timestamp, id).run();
      await env.DB.prepare('INSERT INTO audit_log (user_id,action,record_id,detail,created_at) VALUES (?,?,?,?,?)').bind(uid, 'archive_location', id, 'Archive is recoverable; data is not deleted', timestamp).run();
      return json({ ok: true, archived: true });
    }
    if (url.pathname === '/api/admin/audit' && request.method === 'GET') {
      if (!owner(request)) return json({ error: 'Owner authorization required' }, 403);
      const { results } = await env.DB.prepare('SELECT action,record_id,detail,created_at FROM audit_log ORDER BY id DESC LIMIT 200').all();
      return json(results);
    }
    return new Response('Not found', { status: 404 });
  },
};

const liveClassroomMembers = new Map();
export const room = {
  async onConnect(conn) {
    conn.send({ type:'classroom:welcome', connectionId:conn.id, signedIn:conn.identity==='user' });
  },
  async onMessage(conn, message, room) {
    let input;try{input=JSON.parse(message);}catch(_){return;}
    if(input?.type==='classroom:join'){
      const courseId=learningId(input.courseId),sessionId=learningId(input.sessionId||courseId);if(!courseId)return;
      const member={connectionId:conn.id,userId:conn.identity==='user'?conn.userId:null,username:conn.username||'Guest',courseId,sessionId,role:input.role==='instructor'&&conn.isOwner?'Instructor':'Student'};
      liveClassroomMembers.set(conn.id,member);
      const count=[...liveClassroomMembers.values()].filter(item=>item.courseId===courseId).length;
      room.broadcast({type:'classroom:presence',courseId,count,member:{connectionId:member.connectionId,username:member.username,role:member.role},state:'joined'});
      return;
    }
    const member=liveClassroomMembers.get(conn.id);if(!member)return;
    if(input?.type==='classroom:chat'){
      if(conn.identity!=='user')return conn.send({type:'classroom:error',courseId:member.courseId,message:'Sign in to message the classroom.'});
      const content=room.censor(String(input.content||'')).trim().slice(0,1000);if(!content)return;
      room.broadcast({type:'classroom:chat',courseId:member.courseId,sessionId:member.sessionId,message:{id:`live-${crypto.randomUUID()}`,username:member.username,role:member.role,content,created_at:now()}});
      return;
    }
    if(input?.type==='classroom:hand'){
      if(conn.identity!=='user')return;
      room.broadcast({type:'classroom:hand',courseId:member.courseId,connectionId:conn.id,username:member.username,raised:Boolean(input.raised)});
      return;
    }
    if(input?.type==='classroom:module'&&conn.isOwner){
      room.broadcast({type:'classroom:module',courseId:member.courseId,activeModule:Math.max(0,Math.min(99,Number(input.activeModule)||0))});
      return;
    }
    if(input?.type==='classroom:session'&&conn.isOwner){
      room.broadcast({type:'classroom:session',courseId:member.courseId,live:Boolean(input.live)});
    }
  },
  async onClose(conn, room) {
    const member=liveClassroomMembers.get(conn.id);if(!member)return;
    liveClassroomMembers.delete(conn.id);
    const count=[...liveClassroomMembers.values()].filter(item=>item.courseId===member.courseId).length;
    room.broadcast({type:'classroom:presence',courseId:member.courseId,count,member:{connectionId:member.connectionId,username:member.username,role:member.role},state:'left'});
  },
};
