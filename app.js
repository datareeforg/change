import { enterpriseDefaultState, normaliseEnterpriseState, renderEnterprise, handleEnterpriseAction, bindEnterpriseInputs, passportPathMarkup, EnterpriseRepository, operationalReadinessView } from "./enterprise.js";
import { getDefaultWhatsAppState, normaliseWhatsAppState, renderWhatsAppGateway, renderWhatsAppAdmin, renderWhatsAppFloating, bindWhatsAppInputs, handleWhatsAppAction, loadWhatsAppAdminData } from "./whatsapp.js";
import { renderWhatsAppPhoneField, readWhatsAppPhoneField, bindWhatsAppPhoneField } from "./whatsapp-phone.js";
import { firebaseConfigured, accountUser, observeAccount, signInWithGoogle, signOutAccount, readAccountProfile, saveAccountProfile, isProfileSlugAvailable } from "./firebase-account.js";
import { countryFlag, countryNameFromIso3 } from "./country-flags.js";

const STORAGE_KEY = "btc-change-network-state";
const accountRuntime = { uid:null, ready:!firebaseConfigured, error:"", busy:false };
const stateStorageKey = uid => uid ? `${STORAGE_KEY}:${uid}` : STORAGE_KEY;

const icons = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.4 2.5 3.4 5.5 3.4 9s-1 6.5-3.4 9c-2.4-2.5-3.4-6.5-3.4-9S9.6 5.5 12 3Z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v14M5 12h14"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m9 6 9 6-9 6V6Z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 5v14M16 5v14"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m12 3 1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3Z"/><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.6 3-5.5 7-5.5s6.3 1.9 7 5.5"/></svg>`,
  sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m12 4 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4M4 16l8 4 8-4"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></svg>`,
  expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"/></svg>`,
  shrink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 4v5H4M15 4v5h5M20 15h-5v5M4 15h5v5"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12 4 4L19 6"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M8 20V7a3 3 0 0 1 3-3M9 9h6M9 13h6"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m12 3 7 3v5c0 4.4-2.5 7.8-7 10-4.5-2.2-7-5.6-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.5 8.6C20.5 14 12 19 12 19S3.5 14 3.5 8.6A4.1 4.1 0 0 1 12 7a4.1 4.1 0 0 1 8.5 1.6Z"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.2 13.6A8.2 8.2 0 1 1 10.4 3.8a6.74 6.74 0 0 0 9.8 9.8Z"/></svg>`,
};
const icon = (name) => icons[name] || icons.spark;

const THEME_KEY = "btc-ui-theme";
function currentTheme(){ return document.documentElement.getAttribute("data-theme") || "dark"; }
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute("content", theme==="light" ? "#f2efe6" : "#06151f");
  try{ localStorage.setItem(THEME_KEY, theme); }catch(e){}
}
function initTheme(){
  let t=null; try{ t=localStorage.getItem(THEME_KEY); }catch(e){}
  if(!t) t = (window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
  applyTheme(t);
}
function themeIcon(){ return currentTheme()==="light" ? icon("sun") : icon("moon"); }
function toggleTheme(){ const next=currentTheme()==="dark"?"light":"dark"; applyTheme(next); render(); }
initTheme();

const PERSONALIZATION_CHOICES = {
  he: { displayChoice:"He", personalizedTitle:"He Be the Change" },
  she: { displayChoice:"She", personalizedTitle:"She Be the Change" },
  they: { displayChoice:"They", personalizedTitle:"They Be the Change" },
};
function defaultPersonalization(){ return { choice:null, displayChoice:"", personalizedTitle:"Be The Change" }; }
function normalisePersonalization(value={}) {
  const choice=Object.prototype.hasOwnProperty.call(PERSONALIZATION_CHOICES,value?.choice) ? value.choice : null;
  return choice ? { choice, ...PERSONALIZATION_CHOICES[choice] } : defaultPersonalization();
}
function personalizedTitle(){ return state?.personalization?.personalizedTitle || "Be The Change"; }
function applyPersonalizationDocumentTitle(){
  const title=personalizedTitle();
  document.title=title;
  document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute("content",title);
}
function announcePersonalizedTitle(){
  const announcer=document.querySelector("#app-title-announcer");
  if(announcer){ announcer.textContent=""; requestAnimationFrame(()=>{ announcer.textContent=`${personalizedTitle()} selected.`; }); }
}
function personalizationWelcome(){
  return `<section class="personalization-welcome" aria-labelledby="personalization-heading"><div class="personalization-welcome-copy"><div class="eyebrow">A title that feels like yours</div><h2 id="personalization-heading">How would you like to enter the experience?</h2><p>Choose the title and tone that feels right for you. This only personalizes the interface.</p></div><div class="personalization-choice-grid" role="group" aria-label="Choose your personalized experience title">${Object.entries(PERSONALIZATION_CHOICES).map(([choice,option])=>`<button class="personalization-choice personalization-choice-${choice}" data-action="choose-personalization" data-personalization-choice="${choice}"><span>${option.displayChoice}</span><small>${option.personalizedTitle}</small></button>`).join("")}</div></section>`;
}

const HERO_TITLES = [
  "The World Needs Your Skills in the Game.",
  "Learn What the Mission Requires.",
  "Find Your Place in the Global Goals.",
  "Turn Local Action Into Global Evidence.",
  "Play for Peace. Build for the Planet.",
  "Every Person Has Something the World Needs.",
  "Find Your Mission. Prove the Change.",
];
const HERO_STEP_COLORS = ["#84e4e5","#eacb83","#b9a5ff","#ff9879","#8fd5a4","#ff6f91","#86bbff"];
const HERO_MODES = {
  missions: { label:"Missions", prompt:"Needs, teams, and action are connected.", cta:"Find a mission", color:"cyan" },
  peace: { label:"Peace", prompt:"Peace activities travel through schools, teams, and communities.", cta:"Join the Peace Campaign", color:"white" },
  learning: { label:"Learning", prompt:"Courses turn mission requirements into confident fieldwork.", cta:"Explore Education", color:"violet" },
  sports: { label:"Sports", prompt:"Sport becomes a bridge for connection, belonging, and peace.", cta:"Explore Sports", color:"gold" },
  partners: { label:"Partners", prompt:"Organizations and institutions make local action possible.", cta:"Meet the network", color:"green" },
  impact: { label:"Impact", prompt:"Evidence links a field activity to a result others can trust.", cta:"See the change", color:"coral" },
};
// Official Sustainable Development Goals palette from the UN SDG branding.
// Keeping the palette in one place lets badges, filters, and future record
// views share the same visual language without changing the underlying data.
const SDG_COLORS = {
  "SDG 01":"#E5243B", "SDG 02":"#DDA63A", "SDG 03":"#4C9F38", "SDG 04":"#C5192D",
  "SDG 05":"#FF3A21", "SDG 06":"#26BDE2", "SDG 07":"#FCC30B", "SDG 08":"#A21942",
  "SDG 09":"#FD6925", "SDG 10":"#DD1367", "SDG 11":"#FD9D24", "SDG 12":"#BF8B2E",
  "SDG 13":"#3F7E44", "SDG 14":"#0A97D9", "SDG 15":"#56C02B", "SDG 16":"#00689D", "SDG 17":"#19486A",
};
const INITIAL_COUNTRY_RECORDS = [
  { id:"ghana", name:"Ghana", flag:"🇬🇭", iso3:"GHA", region:"West Africa", lat:7.9465, lon:-1.0232, status:"Activation Planning", summary:"Ghana is the first complete Be The Change activation node, connecting education, health, peacebuilding, youth entrepreneurship, diaspora participation, and measurable SDG missions.", sdgs:["SDG 04","SDG 16","SDG 17"], focus:["Education","Health","Peacebuilding","Youth entrepreneurship"], note:"First complete country activation node — editable draft content requires review.", lastUpdated:"02 Sep 2026" },
  { id:"liberia", name:"Liberia", flag:"🇱🇷", iso3:"LBR", region:"West Africa", lat:6.4281, lon:-9.4295, status:"Community Forming", summary:"Liberia is forming a country network focused on education, youth opportunity, clean water, community resilience, skills development, and diaspora-supported missions.", sdgs:["SDG 04","SDG 06","SDG 08","SDG 17"], focus:["Education","Youth opportunity","Clean water","Community resilience"], note:"Country-level map center only; no office or active program is implied.", lastUpdated:"02 Sep 2026" },
  { id:"nigeria", name:"Nigeria", flag:"🇳🇬", iso3:"NGA", region:"West Africa", lat:9.082, lon:8.6753, status:"Community Forming", summary:"Nigeria is forming a multidisciplinary network connecting youth leadership, entrepreneurship, creative industries, education, health, technology, and sports for peace.", sdgs:["SDG 03","SDG 04","SDG 08","SDG 16"], focus:["Youth leadership","Entrepreneurship","Technology","Sports for peace"], note:"Country-level map center only; no office or active program is implied.", lastUpdated:"02 Sep 2026" },
  { id:"senegal", name:"Senegal", flag:"🇸🇳", iso3:"SEN", region:"West Africa", lat:14.4974, lon:-14.4524, status:"Community Forming", summary:"Senegal is forming a regional collaboration node connecting youth leadership, education, culture, sport, entrepreneurship, and peacebuilding.", sdgs:["SDG 04","SDG 08","SDG 16","SDG 17"], focus:["Youth leadership","Culture","Sport","Peacebuilding"], note:"Country-level map center only; no office or active program is implied.", lastUpdated:"02 Sep 2026" },
  { id:"sierra-leone", name:"Sierra Leone", flag:"🇸🇱", iso3:"SLE", region:"West Africa", lat:8.4606, lon:-11.7799, status:"Community Forming", summary:"Sierra Leone is forming a country network focused on education, youth leadership, public health, resilient communities, entrepreneurship, and skills-based collaboration.", sdgs:["SDG 03","SDG 04","SDG 08","SDG 11"], focus:["Education","Public health","Resilience","Entrepreneurship"], note:"Country-level map center only; no office or active program is implied.", lastUpdated:"02 Sep 2026" },
  { id:"namibia", name:"Namibia", flag:"🇳🇦", iso3:"NAM", region:"Southern Africa", lat:-22.9576, lon:18.4904, status:"Community Forming", summary:"Namibia is forming a network around climate resilience, water, education, youth leadership, sustainable communities, biodiversity, and regional collaboration.", sdgs:["SDG 04","SDG 06","SDG 13","SDG 15"], focus:["Climate resilience","Water","Biodiversity","Sustainable communities"], note:"Country-level map center only; no office or active program is implied.", lastUpdated:"02 Sep 2026" },
  { id:"zambia", name:"Zambia", flag:"🇿🇲", iso3:"ZMB", region:"Southern Africa", lat:-13.1339, lon:27.8493, status:"Community Forming", summary:"Zambia is forming a country network connecting education, youth enterprise, community health, skills development, environmental action, and peace.", sdgs:["SDG 03","SDG 04","SDG 08","SDG 13"], focus:["Education","Youth enterprise","Community health","Environmental action"], note:"Country-level map center only; no office or active program is implied.", lastUpdated:"02 Sep 2026" },
  { id:"guinea", name:"Guinea", flag:"🇬🇳", iso3:"GIN", region:"West Africa", lat:9.9456, lon:-9.6966, status:"Community Forming", summary:"Guinea is forming a country network focused on education, community development, youth skills, health, environmental stewardship, and diaspora collaboration.", sdgs:["SDG 03","SDG 04","SDG 08","SDG 15"], focus:["Education","Youth skills","Health","Environmental stewardship"], note:"Country-level map center only; no office or active program is implied.", lastUpdated:"02 Sep 2026" },
];
// Canonical country chapters requested for the public directory and map.
// The compact catalog keeps the front-end seed auditable and lets the
// backend expose the same ISO-backed records without a build step.
const REQUESTED_COUNTRY_CATALOG = `
morocco|Morocco|MA|MAR|Africa|North Africa|31.7917|-7.0926
gambia|Gambia|GM|GMB|Africa|West Africa|13.4432|-15.3101
ivory-coast|Côte d'Ivoire|CI|CIV|Africa|West Africa|7.54|-5.5471
cameroon|Cameroon|CM|CMR|Africa|Central Africa|7.3697|12.3547
democratic-republic-of-the-congo|Democratic Republic of the Congo|CD|COD|Africa|Central Africa|-2.8797|23.656
botswana|Botswana|BW|BWA|Africa|Southern Africa|-22.3285|24.6849
zimbabwe|Zimbabwe|ZW|ZWE|Africa|Southern Africa|-19.0154|29.1549
south-africa|South Africa|ZA|ZAF|Africa|Southern Africa|-30.5595|22.9375
malawi|Malawi|MW|MWI|Africa|Southeast Africa|-13.2543|34.3015
tanzania|Tanzania|TZ|TZA|Africa|East Africa|-6.369|34.8888
kenya|Kenya|KE|KEN|Africa|East Africa|-0.0236|37.9062
burundi|Burundi|BI|BDI|Africa|East Africa|-3.3731|29.9189
rwanda|Rwanda|RW|RWA|Africa|East Africa|-1.9403|29.8739
uganda|Uganda|UG|UGA|Africa|East Africa|1.3733|32.2903
ethiopia|Ethiopia|ET|ETH|Africa|East Africa|9.145|40.4897
somalia|Somalia|SO|SOM|Africa|East Africa|5.1521|46.1996
egypt|Egypt|EG|EGY|Africa|North Africa|26.8206|30.8025
mauritius|Mauritius|MU|MUS|Africa|Indian Ocean|-20.3484|57.5522
spain|Spain|ES|ESP|Europe|Southern Europe|40.4637|-3.7492
france|France|FR|FRA|Europe|Western Europe|46.2276|2.2137
germany|Germany|DE|DEU|Europe|Central Europe|51.1657|10.4515
italy|Italy|IT|ITA|Europe|Southern Europe|41.8719|12.5674
switzerland|Switzerland|CH|CHE|Europe|Central Europe|46.8182|8.2275
norway|Norway|NO|NOR|Europe|Northern Europe|60.472|8.4689
sweden|Sweden|SE|SWE|Europe|Northern Europe|60.1282|18.6435
united-kingdom|United Kingdom|GB|GBR|Europe|Northern Europe|55.3781|-3.436
netherlands|Netherlands|NL|NLD|Europe|Western Europe|52.1326|5.2913
belgium|Belgium|BE|BEL|Europe|Western Europe|50.5039|4.4699
luxembourg|Luxembourg|LU|LUX|Europe|Western Europe|49.8153|6.1296
poland|Poland|PL|POL|Europe|Central Europe|51.9194|19.1451
czechia|Czechia|CZ|CZE|Europe|Central Europe|49.8175|15.473
romania|Romania|RO|ROU|Europe|Eastern Europe|45.9432|24.9668
bulgaria|Bulgaria|BG|BGR|Europe|Eastern Europe|42.7339|25.4858
ukraine|Ukraine|UA|UKR|Europe|Eastern Europe|48.3794|31.1656
turkey|Turkey|TR|TUR|Europe|Southeastern Europe|38.9637|35.2433
monaco|Monaco|MC|MCO|Europe|Western Europe|43.7384|7.4246
vatican-city|Vatican City|VA|VAT|Europe|Southern Europe|41.9029|12.4534
saudi-arabia|Saudi Arabia|SA|SAU|Asia|Western Asia|23.8859|45.0792
united-arab-emirates|United Arab Emirates|AE|ARE|Asia|Western Asia|23.4241|53.8478
afghanistan|Afghanistan|AF|AFG|Asia|Southern Asia|33.9391|67.71
pakistan|Pakistan|PK|PAK|Asia|Southern Asia|30.3753|69.3451
india|India|IN|IND|Asia|Southern Asia|20.5937|78.9629
thailand|Thailand|TH|THA|Asia|Southeastern Asia|15.87|100.9925
singapore|Singapore|SG|SGP|Asia|Southeastern Asia|1.3521|103.8198
indonesia|Indonesia|ID|IDN|Asia|Southeastern Asia|-0.7893|113.9213
vietnam|Vietnam|VN|VNM|Asia|Southeastern Asia|14.0583|108.2772
australia|Australia|AU|AUS|Oceania|-25.2744|133.7751
papua-new-guinea|Papua New Guinea|PG|PNG|Oceania|-6.315|143.9555
vanuatu|Vanuatu|VU|VUT|Oceania|-15.3767|166.9592
united-states|United States|US|USA|Americas|North America|37.0902|-95.7129
canada|Canada|CA|CAN|Americas|North America|56.1304|-106.3468
mexico|Mexico|MX|MEX|Americas|North America|23.6345|-102.5528
brazil|Brazil|BR|BRA|Americas|South America|-14.235|-51.9253
colombia|Colombia|CO|COL|Americas|South America|4.5709|-74.2973
peru|Peru|PE|PER|Americas|South America|-9.19|-75.0152
venezuela|Venezuela|VE|VEN|Americas|South America|6.4238|-66.5897
grenada|Grenada|GD|GRD|Americas|Caribbean|12.1165|-61.679
`.trim().split("\n").map(row=>{const [id,name,iso2,iso3,continent,region,lat,lon]=row.split("|");return {id,name,iso2,iso3,continent,region,lat:Number(lat),lon:Number(lon)};});
const flagFromIso2 = iso2 => String(iso2||"").toUpperCase().replace(/[^A-Z]/g,"").slice(0,2).split("").map(letter=>String.fromCodePoint(127397+letter.charCodeAt(0))).join("") || "🌍";
const expandedCountryRecords = REQUESTED_COUNTRY_CATALOG.map(country=>({
  ...country,
  flag:flagFromIso2(country.iso2),
  status:"Research Only",
  summary:`${country.name} is available as a country chapter for reviewed, locally led Global Goals work.`,
  sdgs:["SDG 04","SDG 08","SDG 17"],
  focus:["Local leadership","Community resilience","Global Goals"],
  note:"Country-level map center only; no office or active program is implied.",
  lastUpdated:"03 Sep 2026",
  aliases:country.name==="Côte d'Ivoire"?["Ivory Coast"]:country.name==="United States"?["USA","United States of America"]:country.name==="Vatican City"?["Holy See"]:[]
}));
const COUNTRY_RECORDS = [...INITIAL_COUNTRY_RECORDS,...expandedCountryRecords.filter(country=>!INITIAL_COUNTRY_RECORDS.some(existing=>existing.id===country.id))];
function countryOptionLabel(country) {
  const rawName=typeof country==="string"?country:country?.name||"";
  const name=countryNameFromIso3(rawName)||rawName;
  const flag=typeof country==="object"?(country.flag||countryFlag(name,country.iso2)):countryFlag(name);
  return `${flag?`${flag} `:""}${name}`;
}
function countryOptionLabelForIso3(iso3) {
  const country=COUNTRY_RECORDS.find(item=>item.iso3===iso3);
  return countryOptionLabel(country||countryNameFromIso3(iso3)||iso3);
}
const REGION_PALETTES = {
  "west-africa":{label:"West Africa",color:"#F0B44D"},
  "east-africa":{label:"East Africa",color:"#2EC4B6"},
  "central-africa":{label:"Central Africa",color:"#E56B6F"},
  "southern-africa":{label:"Southern Africa",color:"#9B7EDE"},
  "north-africa":{label:"North Africa",color:"#4D96FF"},
  europe:{label:"Europe",color:"#F78FB3"},
  asia:{label:"Asia / Middle East",color:"#FF8C42"},
  "north-america":{label:"North America",color:"#59A5D8"},
  "latin-america-caribbean":{label:"Latin America & Caribbean",color:"#4BC27A"},
  oceania:{label:"Oceania",color:"#46B5D1"},
  global:{label:"Global / multi-country",color:"#A7B0C0"},
};
function countryRegionKey(country={}) {
  const region=String(country.region||"").toLowerCase(), continent=String(country.continent||"").toLowerCase();
  if(region.includes("west africa"))return "west-africa";
  if(region.includes("east africa")||region.includes("southeast africa")||region.includes("indian ocean"))return "east-africa";
  if(region.includes("central africa"))return "central-africa";
  if(region.includes("southern africa"))return "southern-africa";
  if(region.includes("north africa"))return "north-africa";
  if(continent==="europe"||region.includes("europe"))return "europe";
  if(continent==="asia"||region.includes("asia"))return "asia";
  if(continent==="oceania"||region.includes("oceania"))return "oceania";
  if(region.includes("north america"))return "north-america";
  if(continent==="americas"||region.includes("south america")||region.includes("caribbean"))return "latin-america-caribbean";
  return "global";
}
function countryRegionPalette(country) { const key=countryRegionKey(country);return {key,...REGION_PALETTES[key]}; }
function countryRegionStyle(country) { const palette=countryRegionPalette(country);return `--region-color:${palette.color};--region-name:'${palette.label}'`; }
// Profile location choices are intentionally independent from the smaller
// public country chapter register above. They cover all 195 sovereign states
// and use the same labels in the browser and backend validation.
const PROFILE_LOCATION_GROUPS = [
  { name:"Africa", countries:["Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cabo Verde","Cameroon","Central African Republic","Chad","Comoros","Congo (Republic of the Congo)","Côte d'Ivoire","Democratic Republic of the Congo","Djibouti","Egypt","Equatorial Guinea","Eritrea","Eswatini","Ethiopia","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau","Kenya","Lesotho","Liberia","Libya","Madagascar","Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria","Rwanda","Sao Tome and Principe","Senegal","Seychelles","Sierra Leone","Somalia","South Africa","South Sudan","Sudan","Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe"] },
  { name:"Asia", countries:["Afghanistan","Armenia","Azerbaijan","Bahrain","Bangladesh","Bhutan","Brunei","Cambodia","China","Cyprus","Georgia","India","Indonesia","Iran","Iraq","Israel","Japan","Jordan","Kazakhstan","Kuwait","Kyrgyzstan","Laos","Lebanon","Malaysia","Maldives","Mongolia","Myanmar","Nepal","North Korea","Oman","Pakistan","Palestine","Philippines","Qatar","Saudi Arabia","Singapore","South Korea","Sri Lanka","Syria","Tajikistan","Thailand","Timor-Leste","Turkey","Turkmenistan","United Arab Emirates","Uzbekistan","Vietnam","Yemen"] },
  { name:"Europe", countries:["Albania","Andorra","Austria","Belarus","Belgium","Bosnia and Herzegovina","Bulgaria","Croatia","Czechia","Denmark","Estonia","Finland","France","Germany","Greece","Holy See (Vatican City)","Hungary","Iceland","Ireland","Italy","Latvia","Liechtenstein","Lithuania","Luxembourg","Malta","Moldova","Monaco","Montenegro","Netherlands","North Macedonia","Norway","Poland","Portugal","Romania","Russia","San Marino","Serbia","Slovakia","Slovenia","Spain","Sweden","Switzerland","Ukraine","United Kingdom"] },
  { name:"North America", countries:["Antigua and Barbuda","Bahamas","Barbados","Belize","Canada","Costa Rica","Cuba","Dominica","Dominican Republic","El Salvador","Grenada","Guatemala","Haiti","Honduras","Jamaica","Mexico","Nicaragua","Panama","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Trinidad and Tobago","United States"] },
  { name:"Oceania", countries:["Australia","Fiji","Kiribati","Marshall Islands","Micronesia (Federated States of)","Nauru","New Zealand","Palau","Papua New Guinea","Samoa","Solomon Islands","Tonga","Tuvalu","Vanuatu"] },
  { name:"South America", countries:["Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Guyana","Paraguay","Peru","Suriname","Uruguay","Venezuela"] },
  { name:"Zealandia", countries:[] },
  { name:"Antarctica", countries:[] },
];
const PROFILE_CONTINENTS = PROFILE_LOCATION_GROUPS.map(group=>group.name);
const PROFILE_COUNTRY_DISPLAY = {"Côte d'Ivoire":"Ivory Coast","Holy See (Vatican City)":"Vatican City","United States":"USA"};
const PROFILE_COUNTRY_OPTIONS = [...new Set(PROFILE_LOCATION_GROUPS.flatMap(group=>group.countries))];
const profileCountriesFor = continent => PROFILE_LOCATION_GROUPS.find(group=>group.name===continent)?.countries || [];
const profileContinentFor = country => PROFILE_LOCATION_GROUPS.find(group=>group.countries.includes(country))?.name || "";
function profileLocationOptions(selected="") {
  const canonicalSelected=selected==="Ivory Coast"?"Côte d'Ivoire":selected==="Vatican City"?"Holy See (Vatican City)":selected==="USA"?"United States":selected;
  const groups=PROFILE_LOCATION_GROUPS.filter(group=>group.countries.length);
  return `<option value="">Select a country</option>${groups.map(group=>`<optgroup label="${esc(group.name)}">${group.countries.map(country=>`<option value="${esc(country)}" ${country===canonicalSelected?"selected":""}>${esc(countryOptionLabel(PROFILE_COUNTRY_DISPLAY[country]||country))}</option>`).join("")}</optgroup>`).join("")}`;
}
function profileLocationFields(prefix, values={}) {
  const hasContinent=Object.prototype.hasOwnProperty.call(values,"continent");
  const country=PROFILE_COUNTRY_OPTIONS.includes(values.country)?values.country:"";
  const continent=profileContinentFor(country)||(PROFILE_CONTINENTS.includes(values.continent)?values.continent:(hasContinent?"":"Africa"));
  return `<div class="field"><label for="${prefix}-continent">Continent</label><select id="${prefix}-continent" data-profile-continent="${prefix}"><option value="">Select a continent</option>${PROFILE_CONTINENTS.map(option=>`<option value="${esc(option)}" ${option===continent?"selected":""}>${esc(option)}</option>`).join("")}</select></div><div class="field"><label for="${prefix}-country">Country ${prefix==="join"?'<span class="optional-label">optional</span>':""}</label><select id="${prefix}-country" data-profile-country="${prefix}">${profileLocationOptions(country)}</select></div><div class="field"><label for="${prefix}-city">City <span class="optional-label">optional</span></label><input id="${prefix}-city" value="${esc(values.city||"")}" placeholder="City or town" maxlength="120" /></div>`;
}
// Representative, geographically specific public photographs for country
// pages. These are presentation assets only; they do not imply a project,
// office, partner, or activity at the pictured place. The remote source is
// Wikimedia Commons and the UI keeps a visible source note for later asset
// licensing review or replacement with approved local media.
const COUNTRY_HERO_IMAGES = {
  ghana:{url:"https://commons.wikimedia.org/wiki/Special:FilePath/Scenic_view_of_a_countryside_landscape_in_Ghana.jpg?width=1800",alt:"Countryside landscape in Ghana",source:"Wikimedia Commons · Ghana landscape"},
  liberia:{url:"https://commons.wikimedia.org/wiki/Special:FilePath/Central_Monrovia.jpg?width=1800",alt:"Central Monrovia, Liberia",source:"Wikimedia Commons · Central Monrovia"},
  nigeria:{url:"https://commons.wikimedia.org/wiki/Special:FilePath/Lagos_Nigeria.jpg?width=1800",alt:"Lagos, Nigeria",source:"Wikimedia Commons · Lagos Nigeria"},
  senegal:{url:"https://commons.wikimedia.org/wiki/Special:FilePath/Dakar_Senegal.JPG?width=1800",alt:"Dakar, Senegal",source:"Wikimedia Commons · Dakar Senegal"},
  "sierra-leone":{url:"https://commons.wikimedia.org/wiki/Special:FilePath/Freetown.jpg?width=1800",alt:"Freetown, Sierra Leone",source:"Wikimedia Commons · Freetown"},
  namibia:{url:"https://commons.wikimedia.org/wiki/Special:FilePath/Windhoek%2C_Namibia_%2851255338128%29.jpg?width=1800",alt:"Windhoek, Namibia",source:"Wikimedia Commons · Windhoek Namibia"},
  zambia:{url:"https://commons.wikimedia.org/wiki/Special:FilePath/Lusaka%2C_capital_city_of_Zambia.jpg?width=1800",alt:"Lusaka, Zambia",source:"Wikimedia Commons · Lusaka"},
  guinea:{url:"https://commons.wikimedia.org/wiki/Special:FilePath/Conakry%2C_Guinea.jpg?width=1800",alt:"Conakry, Guinea",source:"Wikimedia Commons · Conakry Guinea"},
};
const COUNTRY_IMAGE_POIS = {
  ghana:"Independence Arch in Accra",liberia:"Ducor Hill in Monrovia",nigeria:"the National Mosque in Abuja",senegal:"the African Renaissance Monument in Dakar", "sierra-leone":"the Cotton Tree in Freetown", namibia:"Christ Church in Windhoek", zambia:"Victoria Falls", guinea:"the Grand Mosque of Conakry",
  morocco:"the blue medina of Chefchaouen",gambia:"the River Gambia waterfront", "ivory-coast":"the Basilica of Our Lady of Peace in Yamoussoukro", cameroon:"Mount Cameroon above Limbe", "democratic-republic-of-the-congo":"the Congo River landscape", botswana:"the Okavango Delta", zimbabwe:"Victoria Falls", "south-africa":"Table Mountain above Cape Town", malawi:"Lake Malawi shoreline", tanzania:"Mount Kilimanjaro", kenya:"the Nairobi skyline and savanna", burundi:"Lake Tanganyika waterfront", rwanda:"the hills around Kigali", uganda:"the Rwenzori Mountains", ethiopia:"the rock-hewn churches of Lalibela", somalia:"the Liido Beach waterfront in Mogadishu", egypt:"the Giza pyramids", mauritius:"the Le Morne Brabant peninsula",
  spain:"the Alhambra in Granada", france:"the Eiffel Tower and Seine", germany:"the Brandenburg Gate in Berlin", italy:"the Colosseum in Rome", switzerland:"the Swiss Alps", norway:"the Geirangerfjord", sweden:"Gamla Stan in Stockholm", "united-kingdom":"the Houses of Parliament in London", netherlands:"the Amsterdam canal ring", belgium:"the Grand Place in Brussels", luxembourg:"Luxembourg Old Town", poland:"the historic center of Kraków", czechia:"Prague Castle", romania:"Bran Castle and the Carpathians", bulgaria:"Rila Monastery", ukraine:"St. Sophia Cathedral in Kyiv", turkey:"the Hagia Sophia skyline in Istanbul", monaco:"the harbor of Monaco", "vatican-city":"St. Peter's Basilica",
  "saudi-arabia":"the AlUla sandstone landscape", "united-arab-emirates":"the Dubai skyline at sunset", afghanistan:"the Bamiyan valley landscape", pakistan:"the Badshahi Mosque in Lahore", india:"the Taj Mahal in Agra", thailand:"the Grand Palace in Bangkok", singapore:"the Marina Bay skyline", indonesia:"the rice terraces of Bali", vietnam:"Ha Long Bay",
  australia:"the Sydney Harbour Bridge", "papua-new-guinea":"the highlands near Mount Hagen", vanuatu:"the volcanic coastline of Tanna",
  "united-states":"the Statue of Liberty and New York Harbor", canada:"the Canadian Rockies", mexico:"Chichén Itzá", brazil:"Christ the Redeemer above Rio", colombia:"the walled city of Cartagena", peru:"Machu Picchu", venezuela:"Angel Falls", grenada:"Grand Anse Beach"
};
function countryPlaceholderImage(country) {
  const key=String(country?.iso3||country?.id||"country");
  const hash=[...key].reduce((sum,letter)=>sum+letter.charCodeAt(0),0);
  const palettes=[["#0e5960","#13283b"],["#805b34","#273b43"],["#4b6389","#172d42"],["#765078","#213447"],["#3e7358","#183b42"],["#9a664b","#26364a"]];
  const [start,end]=palettes[hash%palettes.length];
  const cx=980+(hash%420), cy=100+(hash%230), crest=500+(hash%180), trough=650+(hash%120);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient><radialGradient id="r"><stop stop-color="#ffffff" stop-opacity=".3"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="${cx}" cy="${cy}" r="420" fill="url(#r)"/><path d="M0 700 Q300 ${crest} 620 ${trough} T1260 630 T1600 690 V900 H0Z" fill="#061923" fill-opacity=".5"/><path d="M0 770 Q350 620 700 760 T1400 700 T1600 760" fill="none" stroke="#9ce6dc" stroke-opacity=".25" stroke-width="3"/></svg>`;
  return {url:`data:image/svg+xml,${encodeURIComponent(svg)}`,alt:`Abstract country chapter background for ${country?.name||"this country"}`,source:"Generated visual placeholder · image review pending"};
}
const countryImageRuntime = { records:[], loaded:false, loading:false };
const countryBackgroundRuntime = { layer:0, request:0, currentId:"" };
const countryCatalogRuntime = { loaded:false, loading:false };
const profileRuntime = { loaded:false, loading:false };
const whatsappProfileRuntime = { loaded:false, loading:false, profile:null, error:"" };
const passportRuntime = { avatarPreviewUrl:"", referrer:null, memberSearchTimer:0, memberSearchToken:0 };
const PASSPORT_LOGO = "/uploads/sbtc-lo.png";
const BIRTH_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function passportAge(month, year) {
  const m=Number(month), y=Number(year), now=new Date();
  if(!Number.isInteger(m)||m<1||m>12||!Number.isInteger(y)||y<1900||y>now.getFullYear())return "";
  let age=now.getFullYear()-y-(now.getMonth()+1<m?1:0);
  return age>=0&&age<=130?String(age):"";
}
function passportAvatarSrc(values={}) { return passportRuntime.avatarPreviewUrl || values.avatarUrl || PASSPORT_LOGO; }
function passportCompletion(p={}) {
  let score=18;
  if(p.display_name)score+=18;
  if(p.slug)score+=10;
  if(p.continent&&p.country)score+=10;
  if(p.city)score+=4;
  if(p.skills?.length)score+=12;
  if(p.interests?.length)score+=10;
  if(p.avatarUrl)score+=5;
  if(p.birthYear&&p.birthMonth)score+=5;
  if(p.referredById||p.referredByName)score+=3;
  return Math.min(100,score);
}
function passportDraftValues(prefix="passport") {
  const read=id=>document.getElementById(`${prefix}-${id}`)?.value?.trim()||"";
  return { display_name:read("name")||read("display"), slug:profileSlugValue(read("slug")), continent:read("continent"), country:read("country"), city:read("city"), bio:read("bio"), languages:read("languages"), availability:read("availability")||"Not set", participation:read("mode")||read("participation")||"Remote and in-person", birthMonth:read("birth-month"), birthYear:read("birth-year"), skills:read("skills")?read("skills").split(",").map(value=>value.trim()).filter(Boolean):[], interests:read("interests")?read("interests").split(",").map(value=>value.trim()).filter(Boolean):[], referredById:document.getElementById(`${prefix}-referrer-id`)?.value||"" };
}
function passportPreviewMarkup(values={}, prefix="passport") {
  const p={...state.passport,...values}, age=passportAge(p.birthMonth,p.birthYear), skills=(p.skills||[]).slice(0,6), interests=(p.interests||[]).slice(0,5), completion=passportCompletion(p);
  return `<aside class="passport-live-card" data-passport-preview="${prefix}"><div class="passport-live-top"><span>CHANGE PASSPORT</span><span>DOCUMENT 01</span></div><div class="passport-live-avatar"><img data-preview-avatar src="${esc(passportAvatarSrc(p))}" alt="" /></div><div class="passport-live-name" data-preview-name>${esc(p.display_name||"Your name")}</div><div class="passport-live-handle" data-preview-handle>${p.slug?`/${esc(p.slug)}`:"/your-profile"}</div><div class="passport-live-rule"></div><div class="passport-live-grid"><div><small>LOCATION</small><strong data-preview-location>${esc([p.city,p.country||p.continent].filter(Boolean).join(" · ")||"Not set")}</strong></div><div><small>AGE</small><strong data-preview-age>${age?`${age} years`:"Not set"}</strong></div><div><small>REFERRAL</small><strong data-preview-referrer>${esc(p.referredByName||"No referrer")}</strong></div><div><small>STATUS</small><strong>PRIVATE DRAFT</strong></div></div><div class="passport-live-section"><small>SKILLS</small><div class="passport-live-tags" data-preview-skills>${skills.length?skills.map(skill=>`<span>${esc(skill)}</span>`).join(""):"<em>Add skills to begin</em>"}</div></div><div class="passport-live-section"><small>CAUSES / SDGs</small><div class="passport-live-tags" data-preview-interests>${interests.length?interests.map(item=>`<span>${esc(item)}</span>`).join(""):"<em>Add causes or SDGs</em>"}</div></div><div class="passport-live-footer"><span>ALIGNED ACTION NETWORK</span><span data-preview-completion>${completion}% COMPLETE</span></div></aside>`;
}
function updatePassportPreview(prefix="passport") {
  const previews=document.querySelectorAll(`[data-passport-preview="${prefix}"]`); if(!previews.length)return;
  const p={...state.passport,...passportDraftValues(prefix)};
  const selected=passportRuntime.referrer;
  if(selected){p.referredByName=selected.display_name;p.referredBySlug=selected.slug;p.referredByAvatarUrl=selected.avatar_url;}
  previews.forEach(preview=>{
    preview.querySelector("[data-preview-avatar]")?.setAttribute("src",passportAvatarSrc(p));
    const name=preview.querySelector("[data-preview-name]"); if(name)name.textContent=p.display_name||"Your name";
    const handle=preview.querySelector("[data-preview-handle]"); if(handle)handle.textContent=p.slug?`/${p.slug}`:"/your-profile";
    const location=preview.querySelector("[data-preview-location]"); if(location)location.textContent=[p.city,p.country||p.continent].filter(Boolean).join(" · ")||"Not set";
    const age=preview.querySelector("[data-preview-age]"); if(age)age.textContent=passportAge(p.birthMonth,p.birthYear)?`${passportAge(p.birthMonth,p.birthYear)} years`:"Not set";
    const referral=preview.querySelector("[data-preview-referrer]"); if(referral)referral.textContent=p.referredByName||"No referrer";
    const skills=preview.querySelector("[data-preview-skills]"); if(skills)skills.innerHTML=p.skills?.length?p.skills.slice(0,6).map(skill=>`<span>${esc(skill)}</span>`).join(""):"<em>Add skills to begin</em>";
    const interests=preview.querySelector("[data-preview-interests]"); if(interests)interests.innerHTML=p.interests?.length?p.interests.slice(0,5).map(item=>`<span>${esc(item)}</span>`).join(""):"<em>Add causes or SDGs</em>";
    const completion=preview.querySelector("[data-preview-completion]"); if(completion)completion.textContent=`${passportCompletion(p)}% COMPLETE`;
  });
}
function syncProfileAvatar() {
  document.querySelectorAll(".passport-nav .avatar").forEach(el=>{el.innerHTML=`<img src="${esc(state.passport.avatarUrl||PASSPORT_LOGO)}" alt="" />`;});
}
function renderMemberSearchResults(results=[], message="", prefix="passport") {
  const box=document.querySelector(`[data-member-search-results="${prefix}"]`); if(!box)return;
  if(message){box.innerHTML=`<span class="member-search-note">${esc(message)}</span>`;return;}
  box.innerHTML=results.length?results.map(member=>`<button type="button" class="member-search-result" data-member-id="${esc(member.user_id)}"><img src="${esc(member.avatar_url||PASSPORT_LOGO)}" alt="" /><span><strong>${esc(member.display_name)}</strong><small>${member.slug?`/${esc(member.slug)}`:"Member"}${member.country?` · ${esc(member.country)}`:""}</small></span></button>`).join(""):"<span class=\"member-search-note\">No members found.</span>";
  box.querySelectorAll("[data-member-id]").forEach(button=>button.addEventListener("click",()=>{
    const member=results.find(item=>item.user_id===button.dataset.memberId); if(!member)return;
    passportRuntime.referrer=member;
    const id=document.querySelector(`#${prefix}-referrer-id`); if(id)id.value=member.user_id;
    const input=document.querySelector(`#${prefix}-referrer-search`); if(input)input.value=member.display_name;
    renderMemberSearchResults([], `Selected ${member.display_name}`, prefix); updatePassportPreview(prefix); draftDirty=true;
  }));
}
async function searchMembers(query, prefix="passport") {
  const token=++passportRuntime.memberSearchToken;
  if(query.length<2){renderMemberSearchResults([],"Type at least 2 characters to search.",prefix);return;}
  renderMemberSearchResults([],"Searching members…",prefix);
  try {
    const response=await fetch(`/api/members/search?q=${encodeURIComponent(query)}`,{headers:{accept:"application/json"}}), result=await response.json().catch(()=>({}));
    if(token!==passportRuntime.memberSearchToken)return;
    renderMemberSearchResults(response.ok&&Array.isArray(result.members)?result.members:[],response.ok?"":"Member search is available after sign-in.",prefix);
  } catch (_) { if(token===passportRuntime.memberSearchToken)renderMemberSearchResults([],"Member search is temporarily unavailable.",prefix); }
}
async function handlePassportAvatar(input) {
  const file=input.files?.[0]; if(!file)return;
  if(!file.type.startsWith("image/")||file.size>5*1024*1024){input.value="";setModalFeedback("Choose an image under 5 MB.");return;}
  if(passportRuntime.avatarPreviewUrl?.startsWith("blob:"))URL.revokeObjectURL(passportRuntime.avatarPreviewUrl);
  passportRuntime.avatarPreviewUrl=URL.createObjectURL(file); updatePassportPreview("passport"); updatePassportPreview("join");
  try {
    let url="";
    const response=await fetch("/api/profile/avatar",{method:"POST",headers:{"content-type":file.type},body:file});
    const result=await response.json().catch(()=>({}));
    if(response.ok)url=result.url||"";
    else if(response.status===401&&window.websim?.upload)url=await window.websim.upload(file);
    if(url){state.passport.avatarUrl=url;passportRuntime.avatarPreviewUrl=url;persist();updatePassportPreview("passport");updatePassportPreview("join");showToast("Avatar ready","Your passport image has been updated.");}
    else throw new Error(result.error||"Avatar upload failed");
  } catch (_) { showToast("Avatar preview only",firebaseConfigured?"Image storage is not connected to this Google account yet.":"Sign in to persist the image to your passport."); }
}
function enhancePassportModal() {
  const modal=document.querySelector(".modal:has(#passport-name)");
  if(!modal||modal.querySelector("[data-passport-preview]"))return;
  const head=modal.querySelector(".modal-head"), fields=document.createElement("div"), layout=document.createElement("div");
  fields.className="passport-editor-fields"; layout.className="passport-editor-layout";
  let node=head?.nextElementSibling;
  while(node){const next=node.nextElementSibling;fields.append(node);node=next;}
  const avatar=document.createElement("div"); avatar.className="field passport-avatar-field"; avatar.innerHTML=`<label for="passport-avatar">Profile avatar</label><div class="passport-avatar-picker"><img src="${esc(passportAvatarSrc(state.passport))}" alt="" /><label class="btn small" for="passport-avatar">Choose image</label><input id="passport-avatar" type="file" accept="image/png,image/jpeg,image/webp" /><span class="micro-note">The She Be The Change logo is used until you add a photo.</span></div>`;
  fields.insertBefore(avatar,fields.firstChild);
  const birth=document.createElement("div"); birth.className="form-grid passport-birth-grid"; birth.innerHTML=`<div class="field"><label for="passport-birth-month">Month born</label><select id="passport-birth-month"><option value="">Select month</option>${BIRTH_MONTHS.map((month,index)=>`<option value="${index+1}" ${String(state.passport.birthMonth)===String(index+1)?"selected":""}>${month}</option>`).join("")}</select></div><div class="field"><label for="passport-birth-year">Year born</label><input id="passport-birth-year" type="number" min="1900" max="${new Date().getFullYear()}" value="${esc(state.passport.birthYear)}" placeholder="YYYY" /></div>`;
  const locationGrid=fields.querySelector(".form-grid"); if(locationGrid)fields.insertBefore(birth,locationGrid); else fields.append(birth);
  const referral=document.createElement("div"); referral.className="field full-width passport-referral-field"; referral.innerHTML=`<label for="passport-referrer-search">Did someone refer you?</label><input id="passport-referrer-search" autocomplete="off" value="${esc(state.passport.referredByName)}" placeholder="Search a member by name or profile slug" /><input id="passport-referrer-id" type="hidden" value="${esc(state.passport.referredById)}" /><div class="member-search-results" data-member-search-results="passport"><span class="member-search-note">Type at least 2 characters to search.</span></div>`;
  fields.insertBefore(referral,locationGrid||null);
  fields.insertAdjacentHTML("beforeend",renderWhatsAppPhoneField("passport",whatsappProfileForField(whatsappProfileRuntime.profile)));
  layout.append(fields); layout.insertAdjacentHTML("beforeend",passportPreviewMarkup(state.passport));
  modal.append(layout);
  if(state.passport.referredById)passportRuntime.referrer={user_id:state.passport.referredById,display_name:state.passport.referredByName,slug:state.passport.referredBySlug,avatar_url:state.passport.referredByAvatarUrl};
  modal.querySelector("#passport-avatar")?.addEventListener("change",event=>handlePassportAvatar(event.target));
  modal.querySelector("#passport-referrer-search")?.addEventListener("input",event=>{if(passportRuntime.referrer&&event.target.value.trim()!==passportRuntime.referrer.display_name){passportRuntime.referrer=null;modal.querySelector("#passport-referrer-id").value="";}clearTimeout(passportRuntime.memberSearchTimer);passportRuntime.memberSearchTimer=setTimeout(()=>searchMembers(event.target.value.trim(),"passport"),240);});
  fields.querySelectorAll("input:not([type=file]),textarea,select").forEach(input=>input.addEventListener("input",updatePassportPreview));
  fields.querySelectorAll("select").forEach(input=>input.addEventListener("change",updatePassportPreview));
  bindWhatsAppPhoneField("passport",()=>{});
  updatePassportPreview();
}
function enhanceJoinForm() {
  const panel=document.querySelector("#join-display")?.closest(".panel");
  if(!panel||panel.dataset.joinEnhanced)return;
  panel.dataset.joinEnhanced="true";
  const saveDraft=()=>{
    const values=profileFormValues("join");
    state.drafts={...state.drafts,passport:{
      display_name:values.display_name,
      slug:values.slug,
      continent:values.continent,
      country:values.country,
      city:values.city,
      bio:values.bio,
    }};
    persist();
  };
  panel.querySelectorAll(".form-grid input,.form-grid textarea,.form-grid select").forEach(input=>{
    input.addEventListener("input",saveDraft);
    input.addEventListener("change",saveDraft);
  });
}
const ADMIN_EMAILS = new Set(["ceo@isdrc.net"]);
const ADMIN_USERNAMES = new Set(["atozenith", "kabaniceo"]);
const adminIdentityRuntime = { checked:false, loading:false, isAdmin:false, email:"" };
function identityEmail(identity) {
  return String(identity?.email || identity?.email_address || identity?.emailAddress || "").trim().toLowerCase();
}
function isAdminIdentity(current, creator) {
  const email=identityEmail(current);
  const username=String(current?.username||"").trim().toLowerCase().replace(/^@/,"");
  return Boolean(current&&(ADMIN_USERNAMES.has(username)||(creator?.id&&creator.id===current.id)||ADMIN_EMAILS.has(email)));
}
const slugPart = value => String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
function poiSlug(record) { const base=slugPart(record?.name)||"poi", suffix=slugPart(record?.id)||"record"; return `${base.slice(0,90)}-${suffix.slice(0,80)}`.replace(/-+/g,"-").replace(/^-+|-+$/g,""); }
function countryHeroImage(country) { return countryImageRuntime.records.find(row=>row.country_id===country?.id)||country?.image||COUNTRY_HERO_IMAGES[country?.id]||countryPlaceholderImage(country); }
function countryBackgroundPosition(country) { return country?.backgroundPosition||countryHeroImage(country)?.background_position||countryHeroImage(country)?.position||"center center"; }
function countryHeroStyle(country) { const image=countryHeroImage(country); return `--country-hero-image:url('${image.url}');${countryRegionStyle(country)}`; }
function ensureCountryExplorerBackground(explorer) {
  explorer?.classList.add("has-country-background");
  let background=explorer?.querySelector("[data-country-explorer-background]");
  if(background)return background;
  explorer?.insertAdjacentHTML("afterbegin",`<div class="country-explorer-background" data-country-explorer-background aria-hidden="true"><div class="country-explorer-image active" data-country-background-layer="0"></div><div class="country-explorer-image" data-country-background-layer="1"></div><div class="country-explorer-scrim"></div></div><div class="country-explorer-context" data-country-explorer-context><span class="country-region-swatch" aria-hidden="true"></span><strong data-country-explorer-region>Global</strong><small data-country-explorer-credit>Country image loading…</small></div>`);
  countryBackgroundRuntime.currentId="";
  countryBackgroundRuntime.layer=0;
  return explorer?.querySelector("[data-country-explorer-background]");
}
function preloadCountryBackgrounds(index) {
  if(!COUNTRY_RECORDS.length)return;
  [index-1,index+1].forEach(candidate=>{
    const country=COUNTRY_RECORDS[(candidate+COUNTRY_RECORDS.length)%COUNTRY_RECORDS.length];
    const url=countryHeroImage(country)?.url;
    if(url&&!String(url).startsWith("data:")){const preload=new Image();preload.decoding="async";preload.src=url;}
  });
}
function applyCountryExplorerBackground(country,{immediate=false,force=false}={}) {
  const explorer=document.querySelector("[data-hero-explorer]");
  if(!explorer||!country)return;
  const background=ensureCountryExplorerBackground(explorer), palette=countryRegionPalette(country), image=countryHeroImage(country), fallback=countryPlaceholderImage(country);
  explorer.dataset.country=country.id;
  explorer.dataset.region=palette.key;
  explorer.style.setProperty("--region-color",palette.color);
  explorer.style.setProperty("--country-background-position",countryBackgroundPosition(country));
  const card=explorer.querySelector("[data-hero-card]");
  if(card){card.dataset.region=palette.key;card.style.setProperty("--region-color",palette.color);}
  const regionLabel=explorer.querySelector("[data-country-explorer-region]"), credit=explorer.querySelector("[data-country-explorer-credit]");
  if(regionLabel)regionLabel.textContent=palette.label;
  if(credit)credit.textContent=`${country.name} · Image: ${image.source||"review pending"}`;
  const activeLayer=background?.querySelector(".country-explorer-image.active");
  if(!force&&countryBackgroundRuntime.currentId===country.id&&activeLayer)return;
  const request=++countryBackgroundRuntime.request;
  const current=countryBackgroundRuntime.layer, target=countryBackgroundRuntime.currentId?1-current:current;
  const targetLayer=background?.querySelector(`[data-country-background-layer="${target}"]`), currentLayer=background?.querySelector(`[data-country-background-layer="${current}"]`);
  const commit=(asset,source)=>{
    if(request!==countryBackgroundRuntime.request||!targetLayer?.isConnected)return;
    targetLayer.style.backgroundImage=`url(${JSON.stringify(asset.url)})`;
    targetLayer.style.backgroundPosition="var(--country-background-position, center center)";
    if(immediate)targetLayer.classList.add("no-transition");
    requestAnimationFrame(()=>{
      targetLayer.classList.add("active");
      if(targetLayer!==currentLayer)currentLayer?.classList.remove("active");
      countryBackgroundRuntime.layer=target;
      countryBackgroundRuntime.currentId=country.id;
      if(credit)credit.textContent=`${country.name} · Image: ${source||"review pending"}`;
      if(immediate)requestAnimationFrame(()=>targetLayer.classList.remove("no-transition"));
      preloadCountryBackgrounds(COUNTRY_RECORDS.indexOf(country));
    });
  };
  if(immediate||String(image.url).startsWith("data:")){commit(image,image.source);return;}
  const loader=new Image();loader.decoding="async";loader.onload=()=>commit(image,image.source);loader.onerror=()=>commit(fallback,fallback.source);loader.src=image.url;
}
function applyCountryHeroImages() {
  document.querySelectorAll(".country-hero,.country-detail-hero").forEach(hero=>{
    const iso=hero.dataset.countryMark, heading=hero.querySelector("h1,h2")?.textContent?.trim();
    const country=COUNTRY_RECORDS.find(record=>record.iso3===iso||record.name===heading);
    if(country){const palette=countryRegionPalette(country);hero.style.setProperty("--country-hero-image",`url("${countryHeroImage(country).url}")`);hero.style.setProperty("--region-color",palette.color);hero.dataset.region=palette.key;}
  });
}
function countryForHeroElement(hero) {
  const iso=hero.dataset.countryMark, heading=hero.querySelector("h1,h2")?.textContent?.trim();
  return COUNTRY_RECORDS.find(record=>record.iso3===iso||record.name===heading);
}
function countryHeroAdminControls(country) {
  if(!adminIdentityRuntime.isAdmin||!country)return "";
  const poi=COUNTRY_IMAGE_POIS[country.id]||`a well-known landmark in ${country.name}`;
  return `<div class="country-hero-admin-tools" data-country-image-admin><span class="admin-tool-label">Owner tools</span><button class="btn small" data-action="regenerate-country-image" data-country-id="${esc(country.id)}" title="Generate a new country-specific hero image"><span class="admin-tool-icon">${icon("spark")}</span><span>Regenerate image</span></button><small>Landmark: ${esc(poi)}</small></div>`;
}
function applyCountryHeroAdminControls() {
  document.querySelectorAll(".country-hero,.country-detail-hero").forEach(hero=>{
    const country=countryForHeroElement(hero);
    if(!country||!adminIdentityRuntime.isAdmin||hero.querySelector("[data-country-image-admin]"))return;
    hero.insertAdjacentHTML("afterbegin",countryHeroAdminControls(country));
  });
}
async function loadCountryImages() {
  if(countryImageRuntime.loaded||countryImageRuntime.loading)return;
  countryImageRuntime.loading=true;
  try {
    const response=await fetch("/api/country-images",{headers:{accept:"application/json"}}), rows=await response.json();
    if(response.ok&&Array.isArray(rows))countryImageRuntime.records=rows.filter(row=>row?.country_id&&row?.url);
  } catch (_) {}
  countryImageRuntime.loaded=true;countryImageRuntime.loading=false;
  if(["countries","country","ghana"].includes(state.view)){render();}
  else if(state.view==="home")applyCountryExplorerBackground(COUNTRY_RECORDS[state.hero.countrySlide||0]||COUNTRY_RECORDS[0],{force:true});
}
async function loadCountryCatalog() {
  if(countryCatalogRuntime.loaded||countryCatalogRuntime.loading)return;
  countryCatalogRuntime.loading=true;
  try {
    const response=await fetch("/api/countries",{headers:{accept:"application/json"}}), rows=await response.json().catch(()=>[]);
    if(response.ok&&Array.isArray(rows))rows.forEach(row=>{
      const country=COUNTRY_RECORDS.find(item=>item.id===row.id||item.iso3===row.iso3);
      if(!country)return;
      const isExistingChapter=INITIAL_COUNTRY_RECORDS.some(item=>item.id===country.id);
      if(!isExistingChapter){country.status=row.status||country.status;country.summary=row.summary||country.summary;}
      country.aliases=Array.isArray(row.aliases)?row.aliases:country.aliases||[];
      if(row.image?.url){country.image=row.image;countryImageRuntime.records=[...countryImageRuntime.records.filter(image=>image.country_id!==country.id),{...row.image,country_id:country.id}];}
    });
  } catch (_) {}
  countryCatalogRuntime.loaded=true;countryCatalogRuntime.loading=false;
  if(["countries","country","ghana","map"].includes(state.view))render();
}
async function loadAdminIdentity() {
  if(adminIdentityRuntime.checked||adminIdentityRuntime.loading)return;
  adminIdentityRuntime.loading=true;
  try {
    const [current,creator]=await Promise.all([window.websim?.getUser?.(),window.websim?.getCreator?.()]);
    adminIdentityRuntime.email=identityEmail(current);
    adminIdentityRuntime.isAdmin=isAdminIdentity(current,creator);
  } catch (_) { adminIdentityRuntime.isAdmin=false; }
  adminIdentityRuntime.checked=true;adminIdentityRuntime.loading=false;
  if(adminIdentityRuntime.isAdmin&&state.view==="admin"&&["WhatsApp Gateway","WhatsApp Control Center"].includes(state.adminTab))loadWhatsAppAdminData().then(()=>{if(state.view==="admin")render();});
  if(adminIdentityRuntime.isAdmin&&(["countries","country","ghana","enterprise","admin","data-gaps"].includes(state.view)||state.modal?.type==="more")){render();}
}
async function regenerateCountryImage(buttonEl) {
  if(!adminIdentityRuntime.isAdmin){showToast("Owner access required","Only the authorized admin can regenerate country hero images.");return;}
  const country=COUNTRY_RECORDS.find(record=>record.id===buttonEl.dataset.countryId);
  if(!country)return;
  const poi=COUNTRY_IMAGE_POIS[country.id]||`a well-known landmark in ${country.name}`;
  const prompt=`Editorial country hero photograph for ${country.name}, centered on the well-known public landmark ${poi}. Wide 16:9 composition, authentic local atmosphere, documentary travel photography, warm natural light, no logos, no text, no watermarks, no invented project claims.`;
  const original=buttonEl.innerHTML;buttonEl.disabled=true;buttonEl.classList.add("is-generating");buttonEl.innerHTML=`${icon("spark")} Generating…`;
  let generatedUrl="";
  try { if(window.websim?.imageGen){const generated=await window.websim.imageGen({prompt,aspect_ratio:"16:9"});generatedUrl=generated?.url||"";} } catch (_) {}
  try {
    const response=await fetch("/api/admin/country-images",{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify({country_id:country.id,country_name:country.name,poi,prompt,image_url:generatedUrl})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok&&!generatedUrl)throw new Error(result.error||"Image generation failed");
    const image=result.image||{country_id:country.id,url:generatedUrl,alt:`${country.name} with ${poi}`,poi,prompt,updated_at:new Date().toISOString()};
    countryImageRuntime.records=[...countryImageRuntime.records.filter(row=>row.country_id!==country.id),image];
    applyCountryHeroImages();
    if(state.view==="home"&&COUNTRY_RECORDS[state.hero.countrySlide||0]?.id===country.id)applyCountryExplorerBackground(country,{force:true});
    showToast(response.ok?"Country image regenerated":"Country image generated for this session",response.ok?`${country.name} now features ${poi}.`:`The image service could not persist the update, so this preview is local only.`);
  } catch (error) {
    showToast("Image regeneration unavailable",error.message||"Try again when the image service is available.");
  } finally { buttonEl.disabled=false;buttonEl.classList.remove("is-generating");buttonEl.innerHTML=original; }
}
function applySdgBadgeStyles() {
  document.querySelectorAll(".tag").forEach(element=>{
    const sdgKey=Object.keys(SDG_COLORS).find(key=>element.textContent.trim().startsWith(key));
    if(!sdgKey)return;
    element.classList.add("sdg-badge");
    element.style.setProperty("--sdg-color",SDG_COLORS[sdgKey]);
    element.style.setProperty("--sdg-ink",sdgKey==="SDG 02"||sdgKey==="SDG 07"?"#11202a":"#fff");
  });
}
function applyCountryFlags() {
  document.querySelectorAll(".tag:not(.country-tag)").forEach(element=>{
    const label=element.textContent.trim(), country=COUNTRY_RECORDS.find(record=>record.name===label||record.iso3===label||record.id===label.toLowerCase());
    if(!country&&!/^global$/i.test(label))return;
    element.classList.add("country-tag");
    element.insertAdjacentHTML("afterbegin",`<span class="country-tag-flag" aria-hidden="true">${country?.flag||"🌍"}</span>`);
  });
}
function applyMapCountryFlags() {
  const mapRoot=document.querySelector(".map-app");
  if(!mapRoot)return;
  const records=mapRecords();
  document.querySelectorAll("[data-map-country] option").forEach(option=>{
    if(option.dataset.flagged)return;
    const country=COUNTRY_RECORDS.find(record=>record.iso3===option.value);
    const flag=country?.flag||countryFlag(country?.name||countryNameFromIso3(option.value)||option.textContent);
    if(flag)option.textContent=`${flag} ${option.textContent}`;
    option.dataset.flagged="true";
  });
  const current=state.map?.country==="GLB"?"Global":mapCountryRecord(state.map?.country||"GHA").name;
  const heading=document.querySelector(".map-context-bar h1");
  if(heading&&!heading.dataset.flagged){heading.insertAdjacentHTML("afterbegin",`<span class="map-context-flag" aria-hidden="true">${countryFlag(current)}</span>`);heading.dataset.flagged="true";}
  document.querySelectorAll(".map-record-row[data-map-record]").forEach(row=>{
    const record=records.find(item=>item.id===row.dataset.mapRecord), title=row.querySelector("strong");
    if(record&&title&&!title.dataset.flagged){title.insertAdjacentHTML("afterbegin",`<span class="map-row-flag" aria-hidden="true">${countryFlag(record.country||current)}</span>`);title.dataset.flagged="true";}
  });
  document.querySelectorAll(".map-marker[data-map-record] b").forEach(label=>{
    const record=records.find(item=>item.id===label.parentElement.dataset.mapRecord);
    if(record&&!label.dataset.flagged){label.insertAdjacentText("afterbegin",`${countryFlag(record.country||current)} `);label.dataset.flagged="true";}
  });
  const selected=records.find(item=>item.id===state.map?.selectedId), detailTitle=document.querySelector(".map-detail-panel:not(.empty) h2");
  if(selected&&detailTitle&&!detailTitle.dataset.flagged){detailTitle.insertAdjacentHTML("afterbegin",`<span class="map-detail-flag" aria-hidden="true">${countryFlag(selected.country||current)}</span>`);detailTitle.dataset.flagged="true";}
}
// Keep the richer relationship records below for the existing network UI, but
// the Earth itself only renders these eight canonical country anchors.
const heroRelationshipNodes = [
  ...COUNTRY_RECORDS.map((country,index)=>({ id:`${country.id}-node`, recordId:country.id, name:country.id==="ghana"?"Ghana Activation Node":country.name, type:"Country chapter", country:country.name, description:country.summary, sdgs:country.sdgs, status:country.status, verification:country.status==="Activation Planning"?"Draft":"Community Forming", action:country.id==="ghana"?"route-ghana":"route-country", lat:country.lat, lon:country.lon, x:22+index*8, y:43+(index%3)*12, modes:["missions","peace","learning","partners","impact"] })),
  { id:"peace-node", recordId:"peace-ghana", name:"Global Peace Campaign", type:"Peace event", country:"Ghana", description:"September 10–21 campaign for safe local activities, sports, schools, and moderated evidence.", sdgs:["SDG 16","SDG 17"], status:"Planned", verification:"Draft", action:"route-peace", lat:7.9465, lon:-1.0232, x:62, y:31, modes:["peace"] },
  { id:"learning-node", recordId:"peacebuilding", name:"Education for Action", type:"Course", country:"Ghana", description:"Draft learning pathways that help people do the work a mission requires.", sdgs:["SDG 04","SDG 16"], status:"Draft—Requires Review", verification:"Draft", action:"route-education", lat:7.9465, lon:-1.0232, x:39, y:62, modes:["learning"] },
  { id:"sports-node", recordId:"digital-twin", name:"Sports for Peace", type:"Mission", country:"Ghana", description:"Digital Twin Football and other sports activations connect identity, play, and peace.", sdgs:["SDG 03","SDG 16","SDG 17"], status:"Needs Validation", verification:"Needs Verification", action:"route-sports", lat:7.9465, lon:-1.0232, x:72, y:58, modes:["peace","sports"] },
  { id:"partner-node", recordId:"current-partners", name:"Partner Network", type:"Partner", country:"Ghana", description:"Existing partner records remain preserved while their public status is verified.", sdgs:["SDG 17"], status:"Needs Verification", verification:"Needs Verification", action:"route-partners", lat:7.9465, lon:-1.0232, x:27, y:39, modes:["partners"] },
  { id:"impact-node", recordId:"evidence", name:"Evidence → Outcome", type:"Impact result", country:"Ghana", description:"A public place for reviewed claims, sources, lessons, and replication kits.", sdgs:["SDG 16","SDG 17"], status:"Awaiting Evidence", verification:"Empty State", action:"route-impact", lat:7.9465, lon:-1.0232, x:28, y:73, modes:["impact"] },
];
const heroNodes = COUNTRY_RECORDS.map((country,index)=>({
  id:`${country.id}-node`, recordId:country.id,
  name:country.id==="ghana"?"Ghana Activation Node":country.name,
  type:"Country chapter", country:country.name, description:country.summary,
  sdgs:country.sdgs, status:country.status,
  verification:country.status==="Activation Planning"?"Draft":"Community Forming",
  action:country.id==="ghana"?"route-ghana":"route-country", lat:country.lat, lon:country.lon,
  modes:["missions","peace","learning","partners","impact"]
}));
const heroRelationshipArcs = [
  { id:"arc-learning", from:"learning-node", to:"ghana-node", label:"Participants completing a course can apply to the Ghana mission.", modes:["learning","missions"] },
  { id:"arc-peace", from:"peace-node", to:"ghana-node", label:"The Peace Campaign is connected to the Ghana activation workspace.", modes:["peace","missions"] },
  { id:"arc-sports", from:"sports-node", to:"peace-node", label:"Sports activations can register peace activities and submit evidence.", modes:["sports","peace"] },
  { id:"arc-partner", from:"partner-node", to:"ghana-node", label:"Partners can contribute skills, funding, learning, space, or trust.", modes:["partners","missions"] },
  { id:"arc-impact", from:"ghana-node", to:"impact-node", label:"Evidence submitted against a mission can become a reviewed impact claim.", modes:["impact","missions"] },
  ...COUNTRY_RECORDS.filter(country=>country.id!=="ghana").map(country=>({id:`arc-network-${country.id}`,from:"ghana-node",to:`${country.id}-node`,label:`${country.name} is connected to Ghana as a Network Formation relationship, not a signed partnership.`,modes:["missions","peace","partners","impact"]})),
];
// Relationship records remain available to the network experience, but the
// Earth gateway is intentionally limited to canonical geographic anchors.
const heroArcs = [];
const heroRuntime = { raf:0, resumeTimer:0, entryTimer:0, slideshowTimer:0, nodeCycleTimer:0, scrollRaf:0, observer:null, listeners:[], pointers:new Map(), pinchDistance:0, dragging:false, pointerId:null, lastX:0, lastY:0, moved:false, rotation:0, tilt:0, velocityX:0, zoom:1, visible:true, hidden:false, reduced:false, entryComplete:false, pausedByInteraction:false, lastFrameTime:0, pointerInside:false };
const titleRuntime = { timer:0, transition:0, enterTimer:0, focused:false, hidden:false, gestureStartX:null, manual:false };
const modalRuntime = { returnFocus:null };
const threeEarthRuntime = { requestId:0, module:null, renderer:null, scene:null, camera:null, group:null, cloudLayer:null, canvas:null, resizeObserver:null };
const ball3DControllers = new Set();
let sharedThreeModulePromise=null;
const mapRuntime = { serverRecordsByCountry:{}, requestedCountries:new Set(), glMap:null, enginePromise:null, fullscreenFallback:false, localItems:[], savedItems:[], customLayers:[], savedViews:[], draftCheckIns:[], pendingSync:[], myCheckIns:[], publicCheckIns:[], proposals:[], adminCheckIns:[], adminProposals:[], workspaceLoaded:false, activityLoaded:false, adminLoaded:false };
const impactRuntime = {claims:[],mine:[],adminEvidence:[],adminClaims:[],detail:null,pendingClaimId:null,loaded:false,loading:false,error:"",mineError:"",adminLoaded:false,adminError:"",signedIn:false,tab:"claims",filters:{search:"",country:"All countries",sdg:"All SDGs",type:"All types",status:"All statuses",from:"",to:""}};
const adminRuntime = { records:[], locations:[], loaded:false, loading:false, error:"" };
const adminMediaRuntime = { records:[], loaded:false, loading:false, error:"" };
const adminJukeboxRuntime = { records:[], settings:[], audit:[], reports:[], loaded:false, loading:false, error:"" };
const mediaRuntime = { countryId:"", records:[], loadedCountry:"", loading:false, error:"" };
const jukeboxRuntime = { countryId:"", settings:null, tracks:[], activeId:"", loadedCountry:"", loading:false, error:"" };
const publicRecordsRuntime = { records:[], loaded:false, loading:false };
const eventRuntime = { records:[], loaded:false, loading:false, error:"" };
const enterpriseRuntime = { loaded:false, loading:false };
const courseRuntime = { loaded:false, loading:false, records:[], error:"" };
const classroomRuntime = { loaded:{}, loading:{}, data:{}, errors:{}, socket:null, socketCourseId:"", connecting:false, presence:{} };
const studioRuntime = { activeBlock:"overview", activeModule:0, pendingSuggestion:null, autosaveTimer:0, feedback:"" };
const stripeAdminRuntime = { loaded:false, loading:false, data:null, error:"" };
const jobRuntime = { records:[], count:0, loaded:false, loading:false, error:"", filters:{q:"",country:"All",category:"All",work_mode:"All",employment_type:"All"}, selected:null, detailLoadedSlug:"", admin:{jobs:[],sources:[],runs:[],loaded:false,loading:false,error:""}, assessment:null, draft:{} };
const VALID_ROUTES = new Set(["home","explore","missions","enterprise","whatsapp","peace","countries","country","ghana","education","jobs","job","studio","classroom","profile","join","events","impact","partners","shop","sports","unity-ball","funding","schools","universities","admin","data-gaps","course","mission","map","my-map","sdgs","login","privacy","terms","not-found"]);
const aiRuntime = { requestId:0, active:false };
let searchTimer=0;
let routeTransitionTimer=0;
let routeTransitionToken=0;
let mapTransitionTimer=0;
let routeTransitionRendering=false;
let draftDirty=false;

const seed = {
  sdgs: [
    ["SDG 01", "No Poverty", "#e5243b"], ["SDG 02", "Zero Hunger", "#dda63a"], ["SDG 03", "Good Health", "#4c9f38"],
    ["SDG 04", "Quality Education", "#c5192d"], ["SDG 05", "Gender Equality", "#ff3a21"], ["SDG 06", "Clean Water", "#26bde2"],
    ["SDG 07", "Clean Energy", "#fcc30b"], ["SDG 08", "Decent Work", "#a21942"], ["SDG 09", "Innovation", "#fd6925"],
    ["SDG 10", "Reduced Inequality", "#dd1367"], ["SDG 11", "Sustainable Cities", "#fd9d24"], ["SDG 12", "Responsible Consumption", "#bf8b2e"],
    ["SDG 13", "Climate Action", "#3f7e44"], ["SDG 14", "Life Below Water", "#0a97d9"], ["SDG 15", "Life on Land", "#56c02b"],
    ["SDG 16", "Peace & Justice", "#00689d"], ["SDG 17", "Partnerships", "#19486a"],
  ],
  countries: [
    ...COUNTRY_RECORDS.map(country=>({...country,code:country.iso3.slice(0,2)})),
    { id:"global", name:"Global", iso3:"GLB", region:"Multi-country", lat:null, lon:null, status:"Research Only", code:"GL", sdgs:["SDG 16","SDG 17"], focus:["Peace","Skills","Partnerships"], summary:"Public ecosystem view across countries and territories.", note:"Global index, not a country record.", lastUpdated:"02 Sep 2026" },
  ],
  missions: [
    { id:"peace-ghana", title:"Peace in Action · Ghana", purpose:"Equip schools, sports teams, and community leaders to host locally led peace activities between September 10–21.", location:"Accra + participating communities", country:"Ghana", stage:"Designing", verification:"Draft", sdgs:["SDG 16","SDG 17"], skills:["Facilitation","Event production","Evidence collection"], youth:true, linkedCourse:"peacebuilding", evidence:"Activity registration, attendance, reflection, moderated media." },
    { id:"digital-twin", title:"Digital Twin Football", purpose:"A physical and digital activation that connects sport, identity, stories, and missions for the Global Goals.", location:"Global · activation tool", country:"Global", stage:"Needs Validation", verification:"Needs Verification", sdgs:["SDG 03","SDG 16","SDG 17"], skills:["Digital storytelling","Sport programming","Partnerships"], youth:false, linkedCourse:"sports-peace", evidence:"Product record, activation log, public story, partner confirmation." },
    { id:"project-inferno", title:"Project Inferno", purpose:"Existing project record retained for migration into the mission network.", location:"Information requested", country:"Global", stage:"Idea", verification:"Information Requested", sdgs:["SDG 09"], skills:["Project stewardship"], youth:false, evidence:"Project brief and steward confirmation required." },
    { id:"next-gen", title:"Next Generation Leaders", purpose:"Existing leadership initiative record retained for structured migration and review.", location:"Information requested", country:"Global", stage:"Idea", verification:"Information Requested", sdgs:["SDG 04","SDG 08"], skills:["Mentoring","Leadership"], youth:true, evidence:"Program brief and outcome framework required." },
    { id:"inclusive-cities", title:"Inclusive World Cup Cities", purpose:"Existing city-focused initiative, reframed as an open mission for inclusive public life and sport.", location:"Information requested", country:"Global", stage:"Idea", verification:"Draft", sdgs:["SDG 10","SDG 11","SDG 16"], skills:["Urban design","Inclusion","Sport"], youth:false, evidence:"City partner and evidence plan required." },
    { id:"youth-network", title:"Youth Mission Network", purpose:"A proposed network for youth-led missions, learning, and safe participation.", location:"Global", country:"Global", stage:"Partner Formation", verification:"Proposed", sdgs:["SDG 04","SDG 08","SDG 17"], skills:["Youth organizing","Safeguarding"], youth:true, evidence:"Network charter and safeguarding review required." },
  ],
  courses: [
    { id:"peacebuilding", title:"Peacebuilding & Open Collaboration", purpose:"Draft framework for practical peace work, dialogue, and collaborative action.", label:"Draft—Requires Review", level:"Foundational", duration:"5 modules · draft", sdgs:["SDG 16","SDG 17"], mission:"Peace in Action · Ghana", format:"Self-paced", access:"Free" },
    { id:"sports-peace", title:"Sports for Peace", purpose:"Use sport as a safe, inclusive platform for connection and measurable peace activities.", label:"Draft—Requires Review", level:"Foundational", duration:"5 modules · draft", sdgs:["SDG 03","SDG 05","SDG 16"], mission:"Digital Twin Football", format:"Cohort or self-paced", access:"Free" },
    { id:"evidence", title:"Evidence & Impact Verification", purpose:"Build an evidence plan, collect field signals, and prepare transparent impact claims.", label:"Draft—Requires Review", level:"Intermediate", duration:"5 modules · draft", sdgs:["SDG 16","SDG 17"], mission:"Any active mission", format:"Self-paced", access:"Free" },
    { id:"ghana-health", title:"Community Health Orientation · Ghana", purpose:"Proposed Ghana pathway for ethical community health action and local partnerships.", label:"Proposed", level:"Foundational", duration:"Outline pending", sdgs:["SDG 03","SDG 05"], mission:"Ghana workspace", format:"Cohort", access:"Pending" },
  ],
  events: [
    { id:"peace-2026", title:"Global Peace in Action · Opening", date:"10 Sep 2026", type:"Campaign", location:"Hybrid · global", status:"Registration opening soon", mission:"Peace in Action · Ghana", sdgs:["SDG 16","SDG 17"] },
    { id:"peace-close", title:"International Day of Peace", date:"21 Sep 2026", type:"Campaign", location:"Hybrid · global", status:"Planned", mission:"Peace in Action · Ghana", sdgs:["SDG 16","SDG 17"] },
    { id:"twin-lab", title:"Digital Twin Football · Community Lab", date:"Information requested", type:"Workshop", location:"Location pending", status:"Draft", mission:"Digital Twin Football", sdgs:["SDG 03","SDG 04","SDG 16"] },
  ],
  organizations: [
    { name:"Be The Change", type:"Movement", country:"Global", status:"Active", note:"Master brand and independent SDG action network." },
    { name:"Current partners", type:"Partner portfolio", country:"Information requested", status:"Needs Verification", note:"Existing records preserved pending confirmation." },
  ],
};
const LIBERIA_COUNTIES = ["Bomi","Bong","Gbarpolu","Grand Bassa","Grand Cape Mount","Grand Gedeh","Grand Kru","Lofa","Margibi","Maryland","Montserrado","Nimba","River Cess","River Gee","Sinoe"];
const MAP_RECORD_TYPES = ["Primary school","Secondary school","Combined school","Vocational school","University","College","Orphanage","Children’s home","Community learning center","Health facility","Mission site","Partner office","Event","Proposed location","Verified impact location"];
const MAP_TYPE_META = {
  chapter:{label:"Country chapter",icon:"◎",tone:"gold"},
  university:{label:"University",icon:"⌘",tone:"violet"}, college:{label:"College",icon:"◇",tone:"violet"},
  school:{label:"School",icon:"▦",tone:"cyan"}, orphanage:{label:"Children’s home",icon:"⌂",tone:"coral"},
  mission:{label:"Mission site",icon:"✦",tone:"gold"}, event:{label:"Event",icon:"◉",tone:"green"},
  partner:{label:"Partner office",icon:"↗",tone:"blue"}, impact:{label:"Impact location",icon:"✓",tone:"green"}, personal:{label:"Personal place",icon:"☆",tone:"cyan"}, checkin:{label:"Approved check-in",icon:"◉",tone:"green"}
};
const LIBERIA_LOCATIONS = [
  {id:"lib-1",name:"University of Liberia",type:"university",county:"Montserrado",city:"Monrovia",lat:6.315,lng:-10.807,description:"Liberia's oldest public university located in Monrovia.",source:"Ministry of Education / LISGIS",verification:"Publicly Sourced",privacy:"Settlement",sdgs:["SDG 04","SDG 16"],needs:["Teacher education","Research"],protected:false},
  {id:"lib-2",name:"Starz University",type:"university",county:"Montserrado",city:"Monrovia",lat:6.308,lng:-10.802,description:"Private university in Monrovia offering business and technology programs.",source:"Ministry of Education",verification:"Publicly Sourced",privacy:"Settlement",sdgs:["SDG 04","SDG 08"],needs:["Technology skills"],protected:false},
  {id:"lib-3",name:"Mother Patern College of Health Sciences",type:"college",county:"Montserrado",city:"Monrovia",lat:6.306,lng:-10.797,description:"Health sciences college in Monrovia.",source:"Catholic Education Secretariat",verification:"Publicly Sourced",privacy:"Settlement",sdgs:["SDG 03","SDG 04"],needs:["Health education"],protected:false},
  {id:"lib-4",name:"Sami University",type:"university",county:"Nimba",city:"Ganta",lat:7.229,lng:-8.979,description:"Private university serving students in Nimba County.",source:"Ministry of Education",verification:"Publicly Sourced",privacy:"Settlement",sdgs:["SDG 04"],needs:["Learning resources"],protected:false},
  {id:"lib-5",name:"Sino University of Liberia",type:"university",county:"Bong",city:"Gbarnga",lat:6.996,lng:-9.47,description:"Private university located in Gbarnga, Bong County.",source:"Ministry of Education",verification:"Publicly Sourced",privacy:"Settlement",sdgs:["SDG 04","SDG 08"],needs:["Skills training"],protected:false},
  {id:"lib-6",name:"St. Joseph's Catholic High School",type:"school",educationType:"Secondary school",county:"Montserrado",city:"Monrovia",lat:6.302,lng:-10.795,description:"Catholic secondary school in central Monrovia.",source:"Catholic Education Secretariat",verification:"Publicly Sourced",privacy:"Settlement",sdgs:["SDG 04"],needs:["Teaching","Learning materials"],protected:false},
  {id:"lib-7",name:"Monrovia Consolidated School System – Capitol Hill",type:"school",educationType:"Combined school",county:"Montserrado",city:"Monrovia",lat:6.3,lng:-10.801,description:"Public primary and junior high school on Capitol Hill.",source:"Ministry of Education / HDX",verification:"Publicly Sourced",privacy:"Settlement",sdgs:["SDG 04"],needs:["School supplies"],protected:false},
  {id:"lib-8",name:"Buchanan public school record",type:"school",educationType:"Primary school",county:"Grand Bassa",city:"Buchanan",lat:5.886,lng:-10.052,description:"Public directory record for a school location in Buchanan.",source:"Ministry of Education / OpenStreetMap",verification:"Needs Review",privacy:"Settlement",sdgs:["SDG 04"],needs:["Verification"],protected:false},
  {id:"lib-9",name:"Touching Tiny Lives Foundation",type:"orphanage",county:"Montserrado",city:"Monrovia",lat:6.318,lng:-10.787,description:"Publicly sourced care record. Exact location is intentionally withheld for safety.",source:"Ministry of Gender / UNICEF",verification:"Publicly Sourced",privacy:"County/Region",sdgs:["SDG 01","SDG 04"],needs:["Safeguarding review"],protected:true},
  {id:"lib-10",name:"Bethany Children's Home",type:"orphanage",county:"Margibi",city:"Kakata",lat:6.535,lng:-10.358,description:"Publicly sourced children’s home record. Current operating status requires verification.",source:"Ministry of Gender",verification:"Publicly Sourced",privacy:"County/Region",sdgs:["SDG 01","SDG 04"],needs:["Verification"],protected:true},
  {id:"lib-11",name:"Bong County Children's Home",type:"orphanage",county:"Bong",city:"Gbarnga",lat:7,lng:-9.475,description:"Publicly sourced children’s home record. Current operating status requires verification.",source:"Ministry of Gender",verification:"Publicly Sourced",privacy:"County/Region",sdgs:["SDG 01","SDG 04"],needs:["Safeguarding review"],protected:true},
  {id:"lib-12",name:"Nimba Children's Home",type:"orphanage",county:"Nimba",city:"Sanniquellie",lat:7.362,lng:-8.708,description:"Publicly sourced care record. Exact location is intentionally withheld for safety.",source:"Ministry of Gender / HDX",verification:"Publicly Sourced",privacy:"County/Region",sdgs:["SDG 01","SDG 04"],needs:["Verification"],protected:true},
  {id:"lib-13",name:"Peace in Action · Liberia",type:"mission",county:"Montserrado",city:"Monrovia",lat:6.4281,lng:-9.4295,description:"Country mission record connecting education, peacebuilding, and evidence work.",source:"Be The Change mission register",verification:"Draft",privacy:"Country Only",sdgs:["SDG 04","SDG 16","SDG 17"],needs:["Facilitation","Evidence collection"],protected:false},
  {id:"lib-14",name:"Liberia education access event",type:"event",county:"Montserrado",city:"Monrovia",lat:6.31,lng:-10.79,description:"Proposed event record; date and organizer require confirmation.",source:"Be The Change event register",verification:"Needs Review",privacy:"Settlement",sdgs:["SDG 04","SDG 17"],needs:["Event production"],protected:false},
];
const mapRecordForPublic = record => {
  if(record.privacy==="Hidden") return null;
  const safe={...record,country:"Liberia",countryIso:"LBR"};
  if(record.protected || ["County/Region","Country Only"].includes(record.privacy)) { safe.lat=null; safe.lng=null; }
  else if(["Settlement","Approximate"].includes(record.privacy)&&record.lat!=null&&record.lng!=null){safe.lat=Math.round(record.lat*100)/100;safe.lng=Math.round(record.lng*100)/100;}
  safe.slug=record.slug||poiSlug(record);
  return safe;
};
const PUBLIC_LOCATION_RECORDS = LIBERIA_LOCATIONS.map(mapRecordForPublic).filter(Boolean);

function auditSeedIntegrity() {
  const ids=seed.missions.map(record=>record.id);
  const duplicateIds=ids.filter((id,index)=>ids.indexOf(id)!==index);
  const missingCourses=seed.missions.filter(record=>record.linkedCourse&&!seed.courses.some(course=>course.id===record.linkedCourse));
  const countryIds=seed.countries.map(record=>record.id);
  const duplicateCountryIds=countryIds.filter((id,index)=>countryIds.indexOf(id)!==index);
  if(duplicateIds.length||missingCourses.length||duplicateCountryIds.length)console.warn("Seed integrity check found an issue.",{duplicateIds,duplicateCountryIds,missingCourses:missingCourses.map(record=>record.id)});
}
auditSeedIntegrity();

const defaultState = {
  view:"home", modal:null, search:"", missionFilter:"All", exploreType:"All records", countryFilter:"All Countries", countrySearch:"", missionView:"grid", adminTab:"Overview", adminJukeboxSettingsCountry:"ghana", adminJukeboxFilters:{country:"",provider:"",genre:"",submitter:"",status:"Pending Review"}, toast:null, whatsapp:getDefaultWhatsAppState(),
  personalization:defaultPersonalization(),
  prospectus:{title:"",tagline:"",problem:"",solution:"",audience:"",location:"Global",sdgs:"SDG 16, SDG 17",activities:"",outcomes:"",ask:"",owner:"",contact:""},
  map:{country:"GHA", county:"All counties", recordType:"All types", sdg:"All SDGs", missionStage:"All stages", chapterStatus:"All statuses", educationType:"All education", partnerStatus:"All partners", eventType:"All events", fundingStatus:"All funding", evidenceStatus:"All evidence", verification:"All verification", dateRange:"All dates", basemap:"satellite", view:"map", leftCollapsed:false, filtersOpen:false, leftTool:"filters", rightOpen:"selected", rightPinned:false, focusMode:false, selectedId:null, selectedSlug:null, search:"", sort:"Name A–Z", centerLat:null, centerLng:null, zoom:7, pitch:0, bearing:0, fov:45, terrain:false, terrainExaggeration:1, birdseye:false, layer:{chapters:true,schools:true,universities:true,orphanages:true,missions:true,events:true,partners:true,evidence:true,checkins:false,personal:false}},
  passport:{ started:false, name:"", slug:"", continent:"Africa", country:"Ghana", city:"", skills:[], interests:[], bio:"", languages:"", availability:"Not set", participation:"Remote and in-person", birthMonth:"", birthYear:"", avatarUrl:"", referredById:"", referredByName:"", referredBySlug:"", referredByAvatarUrl:"", completion:18, joined:[] },
  learning:{ enrolled:[], progress:{}, studioGenerated:false, generatedCourse:null, classrooms:{} },
  drafts:{ passport:{}, mission:{}, courseOutcome:"" },
  onboarding:{ step:1, missionId:"peace-ghana", country:"Ghana", skills:[], interests:"", availability:"Not set", participation:"Remote and in-person", consent:false, completed:false },
  hero:{ mode:"missions", paused:false, reducedMotion:false, quality:"Balanced", selected:"ghana-node", countrySlide:0, titlePaused:false, titleIndex:0 },
  enterprise:{...enterpriseDefaultState},
};
let state = loadState(firebaseConfigured ? `${STORAGE_KEY}:startup` : STORAGE_KEY);

function loadState(key=STORAGE_KEY) {
  try {
    const saved=JSON.parse(localStorage.getItem(key) || "{}");
    return normaliseState({ ...defaultState, ...saved, passport:{...defaultState.passport,...saved.passport}, learning:{...defaultState.learning,...saved.learning}, drafts:{...defaultState.drafts,...saved.drafts}, onboarding:{...defaultState.onboarding,...saved.onboarding}, hero:{...defaultState.hero,...saved.hero}, prospectus:{...defaultState.prospectus,...saved.prospectus}, whatsapp:normaliseWhatsAppState(saved.whatsapp||{}), personalization:normalisePersonalization(saved.personalization||{}), enterprise:normaliseEnterpriseState(saved.enterprise||{}) });
  }
  catch { return normaliseState({...defaultState}); }
}
function normaliseCourseModule(module, index=0) {
  const value=typeof module==="string"?{title:module}:module||{};
  return {title:String(value.title||`Module ${String(index+1).padStart(2,"0")}`).slice(0,180),objective:String(value.objective||value.summary||"").slice(0,700),activity:String(value.activity||value.content||"").slice(0,1000),check:String(value.check||value.assessment||"").slice(0,500),resource:String(value.resource||"").slice(0,500)};
}
function normaliseCourseAssessment(value) {
  const assessment=value&&typeof value==="object"?value:{};
  return {method:String(assessment.method||"Reflection plus practical evidence").slice(0,220),questions:Array.isArray(assessment.questions)?assessment.questions.slice(0,12).map(item=>String(item).slice(0,280)):[],rubric:String(assessment.rubric||"Clarity, safety, inclusion, evidence quality, and reflection.").slice(0,700),passingScore:String(assessment.passingScore||"Review required").slice(0,80)};
}
function normaliseState(candidate) {
  const next={...candidate,passport:{...defaultState.passport,...candidate.passport},learning:{...defaultState.learning,...candidate.learning},drafts:{...defaultState.drafts,...candidate.drafts},onboarding:{...defaultState.onboarding,...candidate.onboarding},hero:{...defaultState.hero,...candidate.hero},prospectus:{...defaultState.prospectus,...candidate.prospectus},whatsapp:normaliseWhatsAppState(candidate.whatsapp||{}),personalization:normalisePersonalization(candidate.personalization||{}),enterprise:normaliseEnterpriseState(candidate.enterprise||{}),map:{...defaultState.map,...candidate.map,layer:{...defaultState.map.layer,...candidate.map?.layer}}};
  next.passport.slug=typeof next.passport.slug==="string"?next.passport.slug.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40):"";
  next.passport.country=PROFILE_COUNTRY_OPTIONS.includes(next.passport.country)?next.passport.country:"";
  next.passport.continent=profileContinentFor(next.passport.country)||(PROFILE_CONTINENTS.includes(next.passport.continent)?next.passport.continent:"Africa");
  next.passport.city=typeof next.passport.city==="string"?next.passport.city.slice(0,120):"";
  next.passport.skills=Array.isArray(next.passport.skills)?next.passport.skills.filter(Boolean).slice(0,50):[];
  next.passport.interests=Array.isArray(next.passport.interests)?next.passport.interests.filter(Boolean).slice(0,30):[];
  next.passport.bio=typeof next.passport.bio==="string"?next.passport.bio.slice(0,1200):"";
  next.passport.languages=typeof next.passport.languages==="string"?next.passport.languages.slice(0,240):"";
  next.passport.availability=typeof next.passport.availability==="string"?next.passport.availability.slice(0,80):"Not set";
  next.passport.participation=typeof next.passport.participation==="string"?next.passport.participation.slice(0,80):"Remote and in-person";
  next.passport.birthMonth=String(next.passport.birthMonth||"").slice(0,2);
  next.passport.birthYear=String(next.passport.birthYear||"").slice(0,4);
  next.passport.avatarUrl=typeof next.passport.avatarUrl==="string"?next.passport.avatarUrl.slice(0,700):"";
  next.passport.referredById=typeof next.passport.referredById==="string"?next.passport.referredById.slice(0,160):"";
  next.passport.referredByName=typeof next.passport.referredByName==="string"?next.passport.referredByName.slice(0,120):"";
  next.passport.referredBySlug=typeof next.passport.referredBySlug==="string"?next.passport.referredBySlug.slice(0,40):"";
  next.passport.referredByAvatarUrl=typeof next.passport.referredByAvatarUrl==="string"?next.passport.referredByAvatarUrl.slice(0,700):"";
  next.passport.joined=Array.isArray(next.passport.joined)?next.passport.joined.filter(id=>typeof id==="string").slice(0,100):[];
  next.passport.completion=Number.isFinite(Number(next.passport.completion))?Math.max(0,Math.min(100,Number(next.passport.completion))):18;
  next.learning.enrolled=Array.isArray(next.learning.enrolled)?next.learning.enrolled.filter(id=>typeof id==="string").slice(0,100):[];
  next.learning.progress=next.learning.progress&&typeof next.learning.progress==="object"?next.learning.progress:{};
  next.learning.progress=Object.fromEntries(Object.entries(next.learning.progress).map(([id,value])=>[id,Math.max(0,Math.min(100,Number(value)||0))]));
  next.learning.generatedCourse=next.learning.generatedCourse&&typeof next.learning.generatedCourse==="object"?{
    id:String(next.learning.generatedCourse.id||"generated-course").replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,120)||"generated-course",
    title:String(next.learning.generatedCourse.title||"Reviewable course proposal").slice(0,160),
    purpose:String(next.learning.generatedCourse.purpose||"").slice(0,800),
    audience:String(next.learning.generatedCourse.audience||"Community learners and mission participants").slice(0,240),
    level:String(next.learning.generatedCourse.level||"Foundational").slice(0,80),
    duration:String(next.learning.generatedCourse.duration||"5 modules · draft").slice(0,120),
    format:String(next.learning.generatedCourse.format||"Cohort or self-paced").slice(0,120),
    countryContext:String(next.learning.generatedCourse.countryContext||"").slice(0,160),
    language:String(next.learning.generatedCourse.language||"English").slice(0,80),
    prerequisites:String(next.learning.generatedCourse.prerequisites||"").slice(0,500),
    modules:Array.isArray(next.learning.generatedCourse.modules)?next.learning.generatedCourse.modules.slice(0,8).map(normaliseCourseModule):[],
    assessment:normaliseCourseAssessment(next.learning.generatedCourse.assessment),
    safetyNote:String(next.learning.generatedCourse.safetyNote||"").slice(0,500),
    evidenceTask:String(next.learning.generatedCourse.evidenceTask||"").slice(0,500),
    accessibilityNotes:String(next.learning.generatedCourse.accessibilityNotes||"").slice(0,700),
    sourceNotes:String(next.learning.generatedCourse.sourceNotes||"").slice(0,900),
    review:{sources:Boolean(next.learning.generatedCourse.review?.sources),safeguarding:Boolean(next.learning.generatedCourse.review?.safeguarding),accessibility:Boolean(next.learning.generatedCourse.review?.accessibility),cultural:Boolean(next.learning.generatedCourse.review?.cultural),instructor:Boolean(next.learning.generatedCourse.review?.instructor),status:String(next.learning.generatedCourse.review?.status||"Draft").slice(0,80)},
    label:String(next.learning.generatedCourse.label||"Draft—Requires Review"), sdgs:Array.isArray(next.learning.generatedCourse.sdgs)?next.learning.generatedCourse.sdgs.slice(0,17):["SDG 16","SDG 17"], mission:String(next.learning.generatedCourse.mission||"Generated course"), access:String(next.learning.generatedCourse.access||"Private draft")
  }:null;
  next.learning.classrooms=next.learning.classrooms&&typeof next.learning.classrooms==="object"?Object.fromEntries(Object.entries(next.learning.classrooms).slice(0,100).map(([courseId,room])=>[courseId,{
    role:["student","instructor"].includes(room?.role)?room.role:"student", activeModule:Math.max(0,Math.min(4,Number(room?.activeModule)||0)), joined:Boolean(room?.joined), live:Boolean(room?.live), mic:Boolean(room?.mic), camera:Boolean(room?.camera), handRaised:Boolean(room?.handRaised), attendance:Boolean(room?.attendance), chat:Array.isArray(room?.chat)?room.chat.slice(-50):[]
  }])):{};
  next.hero.mode=HERO_MODES[next.hero.mode]?next.hero.mode:"missions";
  next.hero.selected=heroNodes.some(node=>node.id===next.hero.selected)?next.hero.selected:"ghana-node";
  next.hero.countrySlide=Number.isInteger(next.hero.countrySlide)?Math.max(0,Math.min(COUNTRY_RECORDS.length-1,next.hero.countrySlide)):0;
  next.hero.paused=Boolean(next.hero.paused);next.hero.reducedMotion=Boolean(next.hero.reducedMotion);next.hero.titlePaused=Boolean(next.hero.titlePaused);
  next.hero.quality=["High","Balanced","Low Power"].includes(next.hero.quality)?next.hero.quality:"Balanced";
  next.hero.titleIndex=Number.isInteger(next.hero.titleIndex)?Math.max(0,Math.min(HERO_TITLES.length-1,next.hero.titleIndex)):0;
  next.onboarding.step=Math.max(1,Math.min(4,Number(next.onboarding.step)||1));
  next.onboarding.missionId=seed?.missions?.some?.(mission=>mission.id===next.onboarding.missionId)?next.onboarding.missionId:"peace-ghana";
  next.onboarding.skills=Array.isArray(next.onboarding.skills)?next.onboarding.skills.filter(Boolean).slice(0,30):[];
  next.onboarding.country=typeof next.onboarding.country==="string"?next.onboarding.country:"Ghana";
  next.onboarding.interests=typeof next.onboarding.interests==="string"?next.onboarding.interests.slice(0,120):"";
  next.onboarding.availability=typeof next.onboarding.availability==="string"?next.onboarding.availability:"Not set";
  next.onboarding.participation=typeof next.onboarding.participation==="string"?next.onboarding.participation:"Remote and in-person";
  next.onboarding.consent=Boolean(next.onboarding.consent);next.onboarding.completed=Boolean(next.onboarding.completed);
  Object.keys(defaultState.prospectus).forEach(key=>{next.prospectus[key]=String(next.prospectus[key]||"").slice(0,1400);});
  next.adminTab=typeof next.adminTab==="string"&&next.adminTab?next.adminTab:"Overview";
  next.adminJukeboxSettingsCountry=typeof next.adminJukeboxSettingsCountry==="string"&&next.adminJukeboxSettingsCountry?next.adminJukeboxSettingsCountry:"ghana";
  next.adminJukeboxFilters={...defaultState.adminJukeboxFilters,...(candidate.adminJukeboxFilters||{})};
  Object.keys(next.adminJukeboxFilters).forEach(key=>{next.adminJukeboxFilters[key]=String(next.adminJukeboxFilters[key]||"").slice(0,120);});
  next.countryFilter=typeof next.countryFilter==="string"?next.countryFilter:"All Countries";
  next.countrySearch=typeof next.countrySearch==="string"?next.countrySearch.slice(0,80):"";
  return next;
}
function persist() {
  try { localStorage.setItem(stateStorageKey(accountRuntime.uid), JSON.stringify({ passport:state.passport, learning:state.learning, drafts:state.drafts, onboarding:state.onboarding, hero:state.hero, prospectus:state.prospectus, whatsapp:state.whatsapp, personalization:state.personalization, enterprise:state.enterprise, map:{...state.map,selectedId:null} })); }
  catch (err) { console.warn("Local draft persistence unavailable.", err); showToast("Draft kept for this session","Browser storage is unavailable."); }
}
function esc(value="") {
  return String(value).replace(/[&<>"']/g, (c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function statusClass(status="") {
  const s = status.toLowerCase();
  if (s.includes("verified") || s.includes("active")) return "verified";
  if (s.includes("draft") || s.includes("proposed") || s.includes("idea")) return "draft";
  if (s.includes("pending") || s.includes("requested") || s.includes("needs")) return "pending";
  return "";
}
function tag(text, tone="") {
  const label=String(text), sdgKey=Object.keys(SDG_COLORS).find(key=>label.trim().startsWith(key));
  const ink=sdgKey&&(sdgKey==="SDG 02"||sdgKey==="SDG 07")?"#11202a":"#fff";
  return `<span class="tag ${tone}${sdgKey?" sdg-badge":""}"${sdgKey?` style="--sdg-color:${SDG_COLORS[sdgKey]};--sdg-ink:${ink}"`:""}>${esc(text)}</span>`;
}
function countryTag(value="Global", tone="green") {
  return `<span class="tag country-tag ${tone}"><span class="country-tag-flag" aria-hidden="true">${countryFlag(value)}</span>${esc(value)}</span>`;
}
function button(label, action, cls="", attrs="") { return `<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`; }
function navButton(label, view) { return `<button class="${state.view===view?"active":""}" data-route="${view}">${label}</button>`; }
function threeDIcon(name="spark") {
  const accent={spark:"#84e4e5",arrow:"#9ed0ff",plus:"#b9a5ff",globe:"#8fd5a4",book:"#d6b9ff",heart:"#ff9879",shield:"#ffb07d"}[name]||"#84e4e5";
  return `<svg class="three-d-svg" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="three-d-${name}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".92"/><stop offset=".42" stop-color="${accent}"/><stop offset="1" stop-color="#06151f"/></linearGradient></defs><path class="three-d-top" d="M24 5 42 15 24 25 6 15 24 5Z" fill="url(#three-d-${name})"/><path class="three-d-left" d="M6 15v18l18 10V25L6 15Z" fill="${accent}" fill-opacity=".48"/><path class="three-d-right" d="M42 15v18L24 43V25l18-10Z" fill="#071b28"/><path class="three-d-edge" d="M24 5 42 15v18L24 43 6 33V15L24 5Zm0 20 18-10M24 25 6 15M24 25v18" fill="none" stroke="#efffff" stroke-opacity=".72" stroke-width="1.4" stroke-linejoin="round"/><circle cx="24" cy="19" r="3" fill="#fff" fill-opacity=".88"/></svg>`;
}
function pageHead(eyebrow, title, copy="") {
  return `<div class="section-head"><div><div class="eyebrow">${eyebrow}</div><h2 class="section-title">${title}</h2>${copy?`<p class="section-copy">${copy}</p>`:""}</div></div>`;
}
function statusBadge(value) { return `<span class="status-dot ${statusClass(value)}">${esc(value)}</span>`; }

function header() {
  const title=personalizedTitle();
  return `<header class="site-header">
    <button class="wordmark" data-route="home" aria-label="${esc(title)} home"><img class="brand-logo" src="/uploads/sbtc-lo.png" alt="" /><span class="wordmark-copy"><strong>${esc(title)}</strong><small>GLOBAL GOALS ACTION NETWORK</small></span></button>
    <nav class="primary-nav" aria-label="Primary">${navButton("Home","home")}${navButton("Explore","explore")}${navButton("Missions","missions")}${navButton("Enterprise","enterprise")}${navButton("Countries","countries")}${navButton("Education","education")}${navButton("Green Jobs","jobs")}${navButton("Events","events")}${navButton("Impact","impact")}${navButton("SDGs","sdgs")}${navButton("Partners","partners")}${navButton("Shop","shop")}${navButton("Join","join")}</nav>
    <div class="header-actions"><button class="btn primary small desktop-cta" data-action="route-missions">Find your mission</button><button class="header-action wa-header-action" data-action="wa-open" aria-label="Start on WhatsApp" title="Start on WhatsApp">◔</button><button class="header-action" data-action="toggle-theme" aria-label="Switch to ${currentTheme()==="light"?"dark":"light"} mode" aria-pressed="${currentTheme()==="light"}" title="Toggle light / dark appearance">${themeIcon()}</button><button class="header-action" data-action="open-search" aria-label="Search">${icon("search")}</button><button class="header-action" data-action="open-more" aria-label="More">${icon("menu")}</button><button class="header-action profile-dot" data-route="profile" aria-label="Profile">${state.passport.name?esc(state.passport.name.slice(0,1).toUpperCase()):icon("user")}</button></div>
  </header>`;
}
function mobileNav() {
  return `<nav class="mobile-nav" aria-label="Mobile navigation"><span class="mobile-brand-label">${esc(personalizedTitle())}</span>${[['home','Home','globe'],['explore','Explore','search'],['missions','Missions','spark'],['jobs','Jobs','briefcase'],['education','Learn','book'],['profile','Profile','user']].map(([v,l,i])=>`<button class="${state.view===v?"active":""}" data-route="${v}">${icon(i)}<span>${l}</span></button>`).join("")}</nav>`;
}
function siteFooter() {
  return `<footer class="site-footer"><div class="reef-scene" aria-hidden="true"><div class="reef-surface-glow"></div><div class="reef-rays"></div><div class="reef-particles"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="reef-fish reef-fish-one"><span></span></div><div class="reef-fish reef-fish-two"><span></span></div><div class="reef-fish reef-fish-three"><span></span></div><div class="reef-coral reef-coral-one"><i></i><i></i><i></i><i></i><i></i></div><div class="reef-coral reef-coral-two"><i></i><i></i><i></i></div><div class="reef-coral reef-coral-three"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="reef-floor"></div></div><div class="footer-content"><div class="footer-main"><div class="footer-brand"><button class="wordmark" data-route="home" aria-label="She Be The Change home"><img class="brand-logo footer-brand-logo" src="/uploads/sbtc-lo.png" alt="" /><span class="wordmark-copy"><strong>SHE BE THE CHANGE</strong><small>GLOBAL GOALS ACTION NETWORK</small></span></button><p>Turn your skills, ideas, sport, school, organization, or community into a verified mission for the Global Goals.</p><div class="footer-disclaimer">${tag("Independent network","violet")}<span>Aligned with the UN Sustainable Development Goals. No UN affiliation or endorsement is implied.</span></div></div><div class="footer-column"><div class="eyebrow">Discover</div><button data-route="explore">Explore the network</button><button data-route="missions">Find a mission</button><button data-route="enterprise">Enterprise</button><button data-route="countries">Countries & chapters</button><button data-route="impact">See the change</button></div><div class="footer-column"><div class="eyebrow">Participate</div><button data-route="education">Know The Change</button><button data-route="events">Events & Peace</button><button data-route="partners">Partners</button><button data-route="shop">Shop & sports</button></div><div class="footer-column"><div class="eyebrow">Trust & access</div><button data-route="terms">Terms of participation</button><button data-route="privacy">Privacy policy</button><button data-route="login">Sign in</button><button data-action="open-more">More controls</button></div></div><div class="footer-bottom"><span>© 2026 Be The Change</span><span class="footer-powered">Powered by <strong>Data Reef</strong></span><span>Public records show their source, date, and verification status.</span><div class="footer-status"><i></i>Map ready for reviewed records</div></div></div></footer>`;
}
function applyPersonalizedBranding(){
  const title=personalizedTitle();
  document.querySelectorAll(".site-footer .wordmark strong").forEach(el=>{el.textContent=title;});
  document.querySelectorAll(".site-footer .wordmark").forEach(el=>{el.setAttribute("aria-label",`${title} home`);});
  const titleFrame=document.querySelector("[data-title-frame]");
  if(titleFrame){
    let titleEl=titleFrame.querySelector("[data-personalized-title]");
    if(!titleEl){ titleFrame.insertAdjacentHTML("afterbegin",`<div class="hero-personalized-title" data-personalized-title></div>`); titleEl=titleFrame.querySelector("[data-personalized-title]"); }
    if(titleEl)titleEl.textContent=title;
  }
}
function shell(content) { return `${header()}${navigator.onLine?"":`<div class="offline-banner" role="status">Offline mode · local drafts remain available and will sync when connected.</div>`}${state.view!=="whatsapp"?whatsappJourneyMarkupForShell():""}<main class="page">${content}</main><span id="app-title-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></span>${mobileNav()}${siteFooter()}${renderWhatsAppFloating(state)}`; }
function whatsappJourneyMarkupForShell() { const w=state.whatsapp; if(!w||w.state==="DISCOVERED"||w.state==="ARCHIVED")return ""; const labels={DISCOVERED:"Discovered",CONSENT_PENDING:"Consent pending",LANGUAGE_SELECTED:"Language selected",ROLE_SELECTED:"Role selected",IDENTITY_STARTED:"Profile started",LOCATION_STARTED:"Location started",VENTURE_STARTED:"Venture started",IMPACT_STARTED:"Impact started",NEEDS_ASSESSED:"Needs assessed",WEB_HANDOFF_CREATED:"Workspace ready",APPLICATION_IN_PROGRESS:"Application in progress",PAUSED:"Paused",HUMAN_SUPPORT:"Human support",OPTED_OUT:"Opted out"}; return `<div class="wa-shell-journey"><span>WhatsApp journey · ${esc(labels[w.state]||w.state)}</span><button class="btn small" data-action="wa-open">${w.state==="OPTED_OUT"?"Manage preferences":"Continue on WhatsApp"}</button></div>`; }

function enterpriseContext(isAdmin=false) {
  return {hasPassport:Boolean(state.passport.started),ownerId:state.passport.slug||"local-passport",africanCountries:profileCountriesFor("Africa"),profileCountries:PROFILE_LOCATION_GROUPS.flatMap(group=>group.countries),isAdmin:Boolean(adminIdentityRuntime.isAdmin&&(isAdmin||state.view==="enterprise")),persist,render,navigate,toast:showToast};
}
function applyEnterpriseInvitations() {
  if(!state.enterprise.featureFlags.enterpriseEngine)return;
  const invitations={
    missions:["Develop this as an enterprise","Turn a validated community need into a private enterprise draft.","start"],
    mission:["Develop this as an enterprise","Keep the public mission status unchanged while developing a linked private venture.","start"],
    countries:["Explore business launch requirements","Open country-aware cost, registration, banking, and payment-readiness workspaces.","costs"],
    country:["Explore business launch requirements","Use this country context to begin a guidance-only launch plan.","costs"],
    ghana:["Explore business launch requirements","Use this country context to begin a guidance-only launch plan.","costs"],
    education:["Add this course to a founder pathway","Connect approved learning to incubator stages without changing the course record.","training"],
    course:["Add this course to a founder pathway","Connect approved learning to incubator stages without changing the course record.","training"],
    partners:["Offer resources to entrepreneurs","Prepare a private partner offer with eligibility, allocation, redemption, and evidence.","funding"],
    shop:["Create a product through an enterprise","Develop a responsible product record and optional opaque product passport.","tools"],
    sports:["Create a product through an enterprise","Develop a responsible product record and optional opaque product passport.","tools"],
    impact:["View enterprise outcomes","Enterprise totals use the same evidence and verification principles.","venture"],
    profile:["Start or grow a business","Choose an enterprise path without giving up missions, education, sport, peace, or volunteering.","home"]
  };
  const item=invitations[state.view],main=document.querySelector("main.page");
  if(!item||!main||main.querySelector("[data-enterprise-invitation]"))return;
  main.insertAdjacentHTML("beforeend",`<section class="section panel panel-pad enterprise-invitation" data-enterprise-invitation><div><div class="eyebrow">Enterprise pathway · optional</div><h2>${esc(item[0])}</h2><p>${esc(item[1])}</p></div><div class="enterprise-invitation-actions"><button class="btn primary" data-action="enterprise-invitation" data-enterprise-section="${item[2]}">${icon("arrow")} Open Enterprise</button><button class="btn" data-action="wa-send-plan">Send this plan to WhatsApp</button></div></section>`);
}
function applyPassportPathStage() {
  if(state.view!=="join"||!state.enterprise.featureFlags.founderOnboarding)return;
  const host=document.querySelector("main.page > div");
  if(host&&!host.querySelector(".passport-path-stage"))host.insertAdjacentHTML("beforeend",passportPathMarkup(state.enterprise));
}

async function loadEnterpriseState() {
  if(enterpriseRuntime.loaded||enterpriseRuntime.loading)return;
  enterpriseRuntime.loading=true;
  try{
    const loaded=await EnterpriseRepository.load();
    const currentHasActivity=state.enterprise.ventures?.length||state.enterprise.audit?.length||state.enterprise.passportPath;
    if(!currentHasActivity)state.enterprise=normaliseEnterpriseState({...state.enterprise,...loaded});
    persist();
  }catch(_){}
  enterpriseRuntime.loaded=true;enterpriseRuntime.loading=false;
  if(state.view==="enterprise"||state.adminTab==="Enterprise Ops")render();
}
async function loadCourseLibrary() {
  if(courseRuntime.loaded||courseRuntime.loading)return;
  courseRuntime.loading=true;
  try{
    const response=await fetch('/api/courses',{headers:{accept:'application/json'}}),result=await response.json().catch(()=>({}));
    if(response.ok){courseRuntime.records=Array.isArray(result.courses)?result.courses.map(course=>({...course,modules:Array.isArray(course.modules)?course.modules.map(normaliseCourseModule):[]})):[];courseRuntime.error='';}
    else if(response.status!==401&&response.status!==404)courseRuntime.error=result.error||'Course library is temporarily unavailable.';
  }catch(_){courseRuntime.error='Course library is temporarily unavailable.';}
  courseRuntime.loaded=true;courseRuntime.loading=false;
  if(['education','course','studio','classroom'].includes(state.view))render();
}
async function saveGeneratedCourse(course) {
  try{
    const response=await fetch('/api/courses',{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({...course,status:course.review?.status&&course.review.status!=="Draft"?course.review.status:(course.status||'Draft'),visibility:course.visibility||'private',modules:(course.modules||[]).map(normaliseCourseModule)})}),result=await response.json().catch(()=>({}));
    if(response.ok&&result.course){const saved={...result.course,...course, ...result.course, modules:(result.course.modules||course.modules||[]).map(normaliseCourseModule)};courseRuntime.records=[saved,...courseRuntime.records.filter(item=>item.id!==saved.id)];courseRuntime.loaded=true;return {ok:true,course:saved};}
    if(response.status===401)return {ok:false,local:true};
    return {ok:false,error:result.error||'The course remains saved locally.'};
  }catch(_){return {ok:false,local:true};}
}
async function loadClassroomState(courseId) {
  if(!courseId||classroomRuntime.loaded[courseId]||classroomRuntime.loading[courseId])return;
  classroomRuntime.loading[courseId]=true;
  try{
    const response=await fetch(`/api/courses/${encodeURIComponent(courseId)}/classroom`,{headers:{accept:'application/json'}}),result=await response.json().catch(()=>({}));
    if(response.ok){classroomRuntime.data[courseId]=result;const current=classroomForCourse(courseId),session=result.session||null,messages=Array.isArray(result.messages)?result.messages.map(message=>({name:message.username||'Participant',role:message.role||'Student',text:message.content||'',at:message.created_at||''})):current.chat;state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:{...current,live:session?.status==='Live',activeModule:Number(session?.active_module??current.activeModule),attendance:Boolean(result.myAttendance),joined:Boolean(result.myAttendance),chat:messages}};persist();classroomRuntime.errors[courseId]='';}
    else if(![401,404].includes(response.status))classroomRuntime.errors[courseId]=result.error||'Classroom sync is temporarily unavailable.';
  }catch(_){classroomRuntime.errors[courseId]='Classroom sync is temporarily unavailable.';}
  classroomRuntime.loaded[courseId]=true;classroomRuntime.loading[courseId]=false;
  if(state.view==='classroom'&&state.selectedId===courseId)render();
}
async function syncClassroomSession(courseId,room,status) {
  try{
    const current=classroomRuntime.data[courseId]?.session;
    const response=await fetch(`/api/courses/${encodeURIComponent(courseId)}/classroom`,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({id:current?.id,status,activeModule:room.activeModule,title:`${courseForId(courseId).title} classroom`})}),result=await response.json().catch(()=>({}));
    if(response.ok&&result.session){classroomRuntime.data[courseId]={...(classroomRuntime.data[courseId]||{}),session:result.session};return {ok:true,session:result.session};}
    return {ok:false,local:[401,403,404].includes(response.status),error:result.error};
  }catch(_){return {ok:false,local:true};}
}
async function syncClassroomAttendance(courseId,room,status='Present') {
  const session=classroomRuntime.data[courseId]?.session;if(!session)return {ok:false,local:true};
  try{const response=await fetch(`/api/classrooms/${encodeURIComponent(session.id)}/attendance`,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({role:room.role==='instructor'?'Instructor':'Student',status})});return {ok:response.ok,local:[401,404].includes(response.status)};}catch(_){return {ok:false,local:true};}
}
async function syncClassroomMessage(courseId,room,content) {
  const session=classroomRuntime.data[courseId]?.session;if(!session)return {ok:false,local:true};
  try{const response=await fetch(`/api/classrooms/${encodeURIComponent(session.id)}/messages`,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({role:room.role==='instructor'?'Instructor':'Student',content})}),result=await response.json().catch(()=>({}));return {ok:response.ok,message:result.message,local:[401,404].includes(response.status)};}catch(_){return {ok:false,local:true};}
}
async function initClassroomRealtime(courseId) {
  if(!courseId||!globalThis.WebsimSocket||classroomRuntime.connecting)return;
  if(classroomRuntime.socket){if(classroomRuntime.socketCourseId!==courseId){classroomRuntime.socketCourseId=courseId;classroomRuntime.socket.send({type:'classroom:join',courseId,sessionId:classroomRuntime.data[courseId]?.session?.id||courseId,role:classroomForCourse(courseId).role});}return;}
  classroomRuntime.connecting=true;
  try{
    const socket=await WebsimSocket.joinRoom();classroomRuntime.socket=socket;classroomRuntime.socketCourseId=courseId;
    socket.send({type:'classroom:join',courseId,sessionId:classroomRuntime.data[courseId]?.session?.id||courseId,role:classroomForCourse(courseId).role});
    socket.onmessage=event=>{
      let message;try{message=JSON.parse(event.data);}catch(_){return;}if(message.courseId&&message.courseId!==classroomRuntime.socketCourseId)return;
      const activeId=classroomRuntime.socketCourseId;if(!activeId)return;
      if(message.type==='classroom:presence'){classroomRuntime.presence[activeId]=Number(message.count||0);if(state.view==='classroom'&&state.selectedId===activeId)render();return;}
      if(message.type==='classroom:chat'&&message.message){const room=classroomForCourse(activeId),next={name:message.message.username||'Participant',role:message.message.role||'Student',text:message.message.content||'',at:message.message.created_at||''};if(next.text&&!(room.chat||[]).some(item=>item.at===next.at&&item.text===next.text)){room.chat=[...(room.chat||[]),next].slice(-50);state.learning.classrooms={...(state.learning.classrooms||{}),[activeId]:room};persist();if(state.view==='classroom'&&state.selectedId===activeId)render();}return;}
      if(message.type==='classroom:module'){const room=classroomForCourse(activeId);state.learning.classrooms={...(state.learning.classrooms||{}),[activeId]:{...room,activeModule:Number(message.activeModule)||0}};persist();if(state.view==='classroom'&&state.selectedId===activeId)render();return;}
      if(message.type==='classroom:session'){const room=classroomForCourse(activeId);state.learning.classrooms={...(state.learning.classrooms||{}),[activeId]:{...room,live:Boolean(message.live)}};persist();if(state.view==='classroom'&&state.selectedId===activeId)render();}
    };
    socket.onreconnect=()=>socket.send({type:'classroom:join',courseId:classroomRuntime.socketCourseId,sessionId:classroomRuntime.data[classroomRuntime.socketCourseId]?.session?.id||classroomRuntime.socketCourseId,role:classroomForCourse(classroomRuntime.socketCourseId).role});
    socket.onclose=()=>{classroomRuntime.socket=null;classroomRuntime.socketCourseId='';classroomRuntime.connecting=false;};
  }catch(_){classroomRuntime.socket=null;classroomRuntime.socketCourseId='';}
  classroomRuntime.connecting=false;
}
function sendClassroomRealtime(message) {
  try{classroomRuntime.socket?.send(message);}catch(_){}
}
function safeEnterpriseView() {
  try{return renderEnterprise(state.enterprise,enterpriseContext());}
  catch(error){console.error("Enterprise workspace render failed.",error);return `<div class="empty-state"><div class="eyebrow">Enterprise · recoverable error</div><h2>Your existing records are safe.</h2><p>The workspace could not be displayed. Reload to retry; locally saved drafts have not been deleted.</p>${button("Return home","route-home","primary")}</div>`;}
}
function stripeAdminMarkup() {
  const stripe=stripeAdminRuntime.data,credentials=stripe?.credentials||{};
  return `<section class="section panel panel-pad stripe-admin-panel"><div class="workspace-head"><div><div class="eyebrow">Payment adapter · server-side only</div><h2>Stripe configuration</h2><p>Credentials are read from server environment bindings. This form never accepts, stores, logs, or returns a secret key.</p></div>${statusBadge(stripe?.connectionState||"Not configured")}</div>${stripeAdminRuntime.error?`<div class="form-feedback" role="alert">${esc(stripeAdminRuntime.error)}</div>`:""}<div class="grid grid-2 stripe-admin-grid"><div><h3>Safe configuration</h3><div class="form-grid compact-fields"><label class="field"><span>Mode</span><select id="stripe-admin-mode"><option value="test" ${stripe?.mode!=="live"?"selected":""}>Test / sandbox</option><option value="live" ${stripe?.mode==="live"?"selected":""}>Live</option></select></label><label class="field"><span>Default currency</span><input id="stripe-admin-currency" value="${esc(stripe?.defaultCurrency||"usd")}" maxlength="3"/></label><label class="field full-width"><span>Allowed currencies</span><input id="stripe-admin-currencies" value="${esc((stripe?.allowedCurrencies||["usd"]).join(", "))}" placeholder="usd, eur, gbp"/></label><label class="field"><span>Minimum amount · minor units</span><input id="stripe-admin-min" type="number" min="1" value="${Number(stripe?.minimumAmountMinor||50)}"/></label><label class="field"><span>Maximum amount · minor units</span><input id="stripe-admin-max" type="number" min="1" value="${Number(stripe?.maximumAmountMinor||1000000)}"/></label><label class="path-choice full-width"><input id="stripe-admin-enabled" type="checkbox" ${stripe?.enabled?"checked":""}/><span>Enable Stripe after credentials and administrator approval</span></label></div><div class="enterprise-form-actions">${button("Save Stripe settings","stripe-admin-save","primary")}${button("Test server connection","stripe-admin-test")}${button("Refresh status","stripe-admin-refresh","small")}</div></div><div><h3>Environment readiness</h3><div class="readiness-list compact"><div><strong>Secret key</strong><span>${credentials.secretKeyConfigured?"Configured server-side":"Missing"}</span></div><div><strong>Publishable key</strong><span>${credentials.publishableKeyConfigured?"Configured server-side":"Missing"}</span></div><div><strong>Webhook secret</strong><span>${credentials.webhookSecretConfigured?"Configured server-side":"Missing"}</span></div><div><strong>Webhook path</strong><span>${esc(stripe?.webhookPath||"/api/payments/stripe/webhook")}</span></div></div><div class="privacy-callout"><strong>Required server bindings</strong><br/>Test: STRIPE_TEST_SECRET_KEY and STRIPE_TEST_PUBLISHABLE_KEY.<br/>Live: STRIPE_LIVE_SECRET_KEY and STRIPE_LIVE_PUBLISHABLE_KEY.<br/>Webhook: STRIPE_WEBHOOK_SECRET.</div><p class="footer-note">Start in Test / sandbox. Configure the webhook in Stripe, test idempotency and reconciliation, then obtain administrator approval before enabling Live.</p></div></div></section>`;
}
function applyStripeAdminPanel() {
  if(state.view!=="admin"||state.adminTab!=="Enterprise Ops")return;
  const host=document.querySelector(".enterprise-readiness");
  if(host&&!host.querySelector(".stripe-admin-panel"))host.insertAdjacentHTML("beforeend",stripeAdminMarkup());
}
async function loadStripeAdmin(force=false) {
  if(state.view!=="admin"||state.adminTab!=="Enterprise Ops"||!adminIdentityRuntime.isAdmin)return;
  if((stripeAdminRuntime.loaded&&!force)||stripeAdminRuntime.loading)return;
  stripeAdminRuntime.loading=true;stripeAdminRuntime.error="";
  try{const response=await fetch("/api/admin/integrations/stripe",{headers:{accept:"application/json"}}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Stripe status is unavailable.");stripeAdminRuntime.data=result;}catch(error){stripeAdminRuntime.error=error.message||"Stripe status is unavailable.";}finally{stripeAdminRuntime.loaded=true;stripeAdminRuntime.loading=false;}
  if(state.view==="admin"&&state.adminTab==="Enterprise Ops")render();
}
async function saveStripeAdminSettings() {
  if(!adminIdentityRuntime.isAdmin){showToast("Owner access required","Stripe settings are protected by the server authorization boundary.");return;}
  const allowedCurrencies=(document.getElementById("stripe-admin-currencies")?.value||"").split(",").map(value=>value.trim().toLowerCase()).filter(Boolean);
  const payload={enabled:Boolean(document.getElementById("stripe-admin-enabled")?.checked),mode:getField("stripe-admin-mode")||"test",defaultCurrency:(getField("stripe-admin-currency")||"usd").toLowerCase(),allowedCurrencies,minimumAmountMinor:Number(getField("stripe-admin-min"))||50,maximumAmountMinor:Number(getField("stripe-admin-max"))||1000000};
  try{const response=await fetch("/api/admin/integrations/stripe",{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(payload)}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Stripe settings were not saved.");stripeAdminRuntime.data=result.stripe;stripeAdminRuntime.loaded=true;showToast("Stripe settings saved",`${result.stripe.connectionState}. Credentials remained server-side.`);render();}catch(error){stripeAdminRuntime.error=error.message;showToast("Stripe settings not saved",error.message);render();}
}
async function testStripeAdminConnection() {
  if(!adminIdentityRuntime.isAdmin){showToast("Owner access required","Only the authorized administrator can test Stripe.");return;}
  try{const response=await fetch("/api/admin/integrations/stripe/test",{method:"POST",headers:{accept:"application/json"}}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Stripe connection test failed.");showToast("Stripe connection succeeded",`${result.connectionState} · charges ${result.account?.chargesEnabled?"enabled":"not enabled"} · payouts ${result.account?.payoutsEnabled?"enabled":"not enabled"}.`);stripeAdminRuntime.loaded=false;loadStripeAdmin(true);}catch(error){showToast("Stripe connection failed",error.message);}
}

function fallbackNodePosition(node) {
  if(node.lat==null||node.lon==null)return {x:node.x,y:node.y};
  const x=Math.max(8,Math.min(92,50+(node.lon+2)*0.72));
  const y=Math.max(10,Math.min(90,50-(node.lat-7)*0.8));
  return {x,y};
}
function globe() {
  const currentMode=state.hero?.mode||"missions";
  const lowPower=state.hero?.reducedMotion||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||navigator.hardwareConcurrency<=2;
  const visibleNodes=lowPower?heroNodes.slice(0,4):heroNodes;
  const nodeMarkup=visibleNodes.map(n=>{const pos=fallbackNodePosition(n);return `<button class="sim-node ${heroTone(n)} ${n.id===state.hero?.selected&&heroRuntime.entryComplete?"selected":""}" data-node-id="${n.id}" data-modes="${n.modes.join(" ")}" style="--node-x:${pos.x}%;--node-y:${pos.y}%" aria-label="Select ${esc(n.name)}"><span class="node-pulse"></span><span class="node-core"></span><span class="node-label">${esc(n.name)}</span></button>`;}).join("");
  return `<div class="hero-orbit" data-hero-root data-mode="${currentMode}" data-rendering="checking"><div class="space-glow"></div><div class="simulation-topline"><span class="eyebrow">PUBLIC ECOSYSTEM MAP · LIVE RECORDS</span><span class="simulation-status"><i></i><span data-sim-status>Ghana in view</span></span></div><div class="earth-stage" data-earth-stage tabindex="0" role="application" aria-label="Interactive global mission simulation. Drag to explore Africa. Click empty space to open the full map."><div class="earth-frame" data-earth-frame><div class="earth-core" data-earth-core><canvas class="earth-canvas" data-earth-canvas aria-hidden="true"></canvas><div class="earth-fallback-layers" aria-hidden="true"><div class="earth-grid"></div><div class="earth-night"></div><div class="earth-clouds"></div><div class="land land-one"></div><div class="land land-two"></div><div class="land land-three"></div><div class="land land-four"></div></div>${nodeMarkup}<span class="atmosphere"></span></div></div><div class="earth-toolbar" aria-label="Earth controls"><button class="btn small icon-only" data-action="hero-reset" aria-label="Reset Africa view" title="Reset Africa view">${icon("globe")}</button><button class="btn small icon-only" data-action="hero-pause" aria-label="${state.hero?.paused?"Resume animation":"Pause animation"}" title="${state.hero?.paused?"Resume animation":"Pause animation"}" aria-pressed="${state.hero?.paused?"true":"false"}">${icon(state.hero?.paused?"play":"pause")}</button><details class="earth-more"><summary class="btn small">More</summary><div class="earth-more-menu"><button class="btn small" data-action="hero-reduced" aria-pressed="${state.hero?.reducedMotion||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"true":"false"}">Reduced motion</button><button class="btn small" data-action="hero-quality">Quality: ${esc(state.hero?.quality||"Balanced")}</button></div></details></div></div><aside class="hero-simulation-panel" id="hero-simulation-panel"><div class="mode-switcher" role="tablist" aria-label="Simulation modes">${Object.entries(HERO_MODES).map(([mode,meta])=>`<button role="tab" aria-selected="${mode===currentMode}" aria-controls="hero-simulation-panel" class="${mode===currentMode?"active":""}" data-action="hero-mode" data-mode="${mode}">${meta.label}</button>`).join("")}</div><div class="simulation-copy"><div class="eyebrow" data-mode-label>${HERO_MODES[currentMode].label} mode · relationships</div><h2 data-mode-prompt>${HERO_MODES[currentMode].prompt}</h2><p>Every point is a canonical country record. Select an anchor to inspect its chapter, or open the full GIS for education and care locations.</p></div><div class="hero-info-card" data-hero-card aria-live="polite"></div><div class="hero-legend" aria-label="Country anchor legend"><span><i class="legend-node activation"></i>Activation planning</span><span><i class="legend-node forming"></i>Community forming</span></div><details class="accessible-node-list"><summary>Browse countries without the globe</summary><div class="node-list">${heroNodes.map(n=>`<button class="node-list-item" data-node-id="${n.id}"><span class="list-dot ${heroTone(n)}"></span><span><strong>${esc(n.name)}</strong><small>${esc(n.type)} · ${esc(n.country)}</small></span>${icon("arrow")}</button>`).join("")}</div></details></aside><span id="hero-simulation-announcer" class="sr-only" aria-live="polite"></span></div>`;
}
function relocateHeroExplorer() {
  if(state.view!=="home")return;
  const hero=document.querySelector(".hero"), panel=document.querySelector("#hero-simulation-panel");
  if(!hero||!panel)return;
  let explorer=document.querySelector("[data-hero-explorer]");
  if(!explorer){
    explorer=document.createElement("section");
    explorer.className="section hero-explorer";
    explorer.dataset.heroExplorer="true";
    explorer.setAttribute("aria-label","Network explorer");
    hero.insertAdjacentElement("afterend",explorer);
  }
  const pulse=hero.querySelector(".hero-network-pulse");
  const modeSwitcher=panel.querySelector(".mode-switcher");
  if(modeSwitcher&&modeSwitcher.parentElement!==hero)hero.append(modeSwitcher);
  if(panel.parentElement!==explorer)explorer.append(panel);
  if(pulse&&pulse.parentElement!==explorer)explorer.append(pulse);
  explorer.dataset.mode=state.hero?.mode||"missions";
  ensureCountryExplorerBackground(explorer);
  applyCountryExplorerBackground(COUNTRY_RECORDS[state.hero.countrySlide||0]||COUNTRY_RECORDS[0],{immediate:true});
}
function applyHeroMapCta() {
  if(state.view!=="home")return;
  const stage=document.querySelector("[data-earth-stage]"), orbit=document.querySelector("[data-hero-root]");
  if(stage&&orbit&&!document.querySelector(".hero-map-cta"))stage.insertAdjacentHTML("afterend",`<div class="hero-map-cta">${button(`${icon("arrow")} Open Full Map`,`map-open`,`primary`)}</div>`);
}

function arcPath(arc) {
  const from=heroNodes.find(n=>n.id===arc.from), to=heroNodes.find(n=>n.id===arc.to);
  if(!from||!to)return "M 0 0";
  const cx=(from.x+to.x)/2, cy=Math.min(from.y,to.y)-14-Math.abs(from.x-to.x)/8;
  return `M ${from.x} ${from.y} Q ${cx} ${Math.max(8,cy)} ${to.x} ${to.y}`;
}
function heroTone(node) {
  if(node.type==="Peace event")return "peace";
  if(node.type==="Course")return "learning";
  if(node.type==="Mission")return "sports";
  if(node.type==="Partner")return "partner";
  if(node.type==="Impact result")return "impact";
  if(node.type==="Country chapter"&&node.status!=="Activation Planning")return "forming";
  return "activation";
}
function countryProjectStats(country) {
  const missions=seed.missions.filter(mission=>mission.country===country.name).length;
  const courses=seed.courses.filter(course=>course.mission?.toLowerCase().includes(country.name.toLowerCase())).length;
  const events=seed.events.filter(event=>event.location?.toLowerCase().includes(country.name.toLowerCase())).length;
  return { missions, courses, events };
}
function countryProjectSlide(country,index,active=false) {
  const stats=countryProjectStats(country), action=country.id==="ghana"?"route-ghana":"route-country";
  const projectTitle=country.id==="ghana"?"Ghana Activation Node":`${country.name} Chapter Project`;
  const projectKicker=country.id==="ghana"?"Priority activation":"Network formation";
  const palette=countryRegionPalette(country);
  return `<article class="country-project-slide ${active?"active":""}" data-country-slide="${index}" data-region="${palette.key}" style="${countryRegionStyle(country)}" aria-hidden="${active?"false":"true"}">
    <div class="country-project-top"><span class="country-project-index">${String(index+1).padStart(2,"0")} / ${String(COUNTRY_RECORDS.length).padStart(2,"0")}</span><span class="country-project-country">${country.flag} ${esc(country.name)} · ${esc(country.iso3)}</span></div>
    <div class="hero-card-kicker"><span class="eyebrow">${projectKicker}</span>${statusBadge(country.status)}</div>
    <h3><span class="country-slide-title-flag" aria-hidden="true">${country.flag}</span><span>${esc(projectTitle)}</span></h3>
    <p>${esc(country.summary)}</p>
    <div class="country-project-connectors" aria-label="Project connections"><span><i></i>Need · ${esc(country.focus[0])}</span><span><i></i>Learn · ${country.id==="ghana"?"course linked":"pathway forming"}</span><span><i></i>Evidence · ${stats.missions||stats.events?"review path":"not yet published"}</span></div>
    <div class="card-meta">${country.sdgs.slice(0,3).map(s=>tag(s)).join("")}${tag(`${stats.missions} missions · ${stats.courses} courses · ${stats.events} events`,"violet")}</div>
    <div class="hero-card-actions"><button class="btn small primary" data-action="${action}" data-country="${esc(country.id)}">Open chapter ${icon("arrow")}</button><button class="btn small" data-action="country-slide-map" data-country="${esc(country.id)}">View on map</button></div>
  </article>`;
}
function countrySlideshowMarkup(activeIndex=0) {
  const index=Number.isInteger(activeIndex)?Math.max(0,Math.min(COUNTRY_RECORDS.length-1,activeIndex)):0;
  return `<div class="country-slideshow" data-country-slideshow aria-label="Country chapter projects" data-slide-index="${index}"><div class="country-slide-window">${COUNTRY_RECORDS.map((country,countryIndex)=>countryProjectSlide(country,countryIndex,countryIndex===index)).join("")}</div><div class="country-slide-controls"><button class="country-slide-arrow" data-action="country-slide-prev" aria-label="Previous country project">←</button><div class="country-slide-dots" role="tablist" aria-label="Country project slides">${COUNTRY_RECORDS.map((country,countryIndex)=>{const palette=countryRegionPalette(country);return `<button class="country-slide-dot ${countryIndex===index?"active":""}" data-action="country-slide-to" data-index="${countryIndex}" data-region="${palette.key}" style="--region-color:${palette.color}" role="tab" aria-selected="${countryIndex===index}" aria-label="Show ${esc(country.name)} project · ${esc(palette.label)}"></button>`;}).join("")}</div><button class="country-slide-arrow" data-action="country-slide-next" aria-label="Next country project">→</button><span class="country-slide-hint">Auto-rotating country projects</span></div></div>`;
}
function countrySlideIndexForNode(node) {
  return Math.max(0,COUNTRY_RECORDS.findIndex(country=>country.id===node?.recordId));
}
function setCountrySlide(index,announce=false) {
  if(!COUNTRY_RECORDS.length)return;
  const next=(Number(index)+COUNTRY_RECORDS.length)%COUNTRY_RECORDS.length, country=COUNTRY_RECORDS[next];
  state.hero.countrySlide=next;
  const node=heroNodes.find(candidate=>candidate.recordId===country.id);
  if(node)state.hero.selected=node.id;
  const slideshow=document.querySelector("[data-country-slideshow]");
  if(!slideshow)return;
  slideshow.dataset.slideIndex=String(next);
  slideshow.querySelectorAll("[data-country-slide]").forEach(slide=>{const active=Number(slide.dataset.countrySlide)===next;slide.classList.toggle("active",active);slide.setAttribute("aria-hidden",String(!active));});
  slideshow.querySelectorAll(".country-slide-dot").forEach(dot=>{const active=Number(dot.dataset.index)===next;dot.classList.toggle("active",active);dot.setAttribute("aria-selected",String(active));if(active)dot.scrollIntoView?.({block:"nearest",inline:"center"});});
  document.querySelectorAll(".sim-node,.node-list-item").forEach(el=>el.classList.toggle("selected",el.dataset.nodeId===state.hero.selected));
  applyCountryExplorerBackground(country);
  if(announce){focusThreeCountry(node);announceHero(`${country.name} country project selected. ${country.summary}`);}
  persist();
}
function heroCardMarkup(node) {
  if(!node)return `<div class="hero-card-empty"><span class="eyebrow">Select a record</span><p>Choose a node, arc, or the accessible list to inspect the network.</p></div>`;
  const country=COUNTRY_RECORDS.find(record=>record.id===node.recordId);
  if(country)return countrySlideshowMarkup(countrySlideIndexForNode(node));
  const primary=node.action==="route-country"?`<button class="btn small primary" data-action="route-country" data-country="${esc(node.recordId)}">Explore country ${icon("arrow")}</button>`:button(HERO_MODES[state.hero.mode]?.cta||"Primary action",node.action,"small primary");
  return `<div class="hero-card-kicker"><span class="eyebrow">${esc(node.type)}</span>${statusBadge(node.verification)}</div><h3>${esc(node.name)}</h3><p>${esc(node.description)}</p><div class="card-meta">${countryTag(node.country)}${node.sdgs.map(s=>tag(s))}${tag(node.status,"violet")}</div><div class="hero-card-actions">${primary}${button("View details","hero-details","small")}</div>`;
}
function heroNetworkPulse() {
  const chapters=COUNTRY_RECORDS.map(country=>{const palette=countryRegionPalette(country);return `<button class="hero-sidebar-card chapter-card region-card" data-action="${country.id==="ghana"?"route-ghana":"route-country"}" data-country="${esc(country.id)}" data-region="${palette.key}" style="--region-color:${palette.color}"><span class="hero-sidebar-icon">${country.flag}</span><span><strong>${esc(country.name)}</strong><small>${esc(palette.label)} · ${esc(country.status)} · ${esc(country.iso3)}</small></span>${icon("arrow")}</button>`;}).join("");
  const events=seed.events.map(event=>`<button class="hero-sidebar-card event-card" data-action="open-breakdown" data-breakdown-section="events" data-breakdown-id="${esc(event.id)}"><span class="hero-sidebar-icon">◉</span><span><strong>${esc(event.title)}</strong><small>${esc(event.date)} · ${esc(event.status)}</small></span>${icon("arrow")}</button>`).join("");
  return `<section class="hero-network-pulse" aria-label="Network pulse"><div class="hero-sidebar-heading"><span class="eyebrow">Network pulse</span><span>${COUNTRY_RECORDS.length} chapters · ${seed.events.length} events</span></div><div class="hero-sidebar-card-grid">${chapters}${events}</div></section>`;
}
function heroNodeById(id) { return heroNodes.find(node=>node.id===id) || heroNodes[0]; }
function applyHeroMode(mode, announce=false) {
  if(!HERO_MODES[mode])return;
  state.hero.mode=mode;
  const root=document.querySelector("[data-hero-root]");
  if(!root)return;
  root.dataset.mode=mode;
  const explorer=document.querySelector("[data-hero-explorer]");
  if(explorer)explorer.dataset.mode=mode;
  document.querySelectorAll("[data-action='hero-mode']").forEach(buttonEl=>{
    const active=buttonEl.dataset.mode===mode;
    buttonEl.classList.toggle("active",active);
    buttonEl.setAttribute("aria-selected",String(active));
  });
  const meta=HERO_MODES[mode];
  const modeLabel=document.querySelector("[data-mode-label]"), prompt=document.querySelector("[data-mode-prompt]");
  if(modeLabel)modeLabel.textContent=`${meta.label} mode · relationships`;
  if(prompt)prompt.textContent=meta.prompt;
  root.querySelectorAll(".arc-line").forEach(path=>path.classList.toggle("arc-visible",heroArcs.find(a=>`arc-${a.id}`===path.classList[1])?.modes.includes(mode)));
  threeEarthRuntime.arcObjects?.forEach((arcObject,id)=>{const arc=heroArcs.find(item=>item.id===id);arcObject.visible=Boolean(arc?.modes.includes(mode));});
  root.querySelectorAll(".sim-node").forEach(nodeEl=>nodeEl.classList.toggle("mode-hidden",!heroNodeById(nodeEl.dataset.nodeId).modes.includes(mode)));
  const status=root.querySelector("[data-sim-status]");
  if(status)status.textContent=`${meta.label} mode · ${heroNodes.filter(node=>node.modes.includes(mode)).length} records in view`;
  if(announce)announceHero(`Showing ${meta.label} mode`);
  persist();
}
function selectHeroNode(id, announce=false, options={}) {
  const node=heroNodeById(id);
  state.hero.selected=node.id;
  const country=COUNTRY_RECORDS.find(record=>record.id===node.recordId);
  if(country)state.hero.countrySlide=countrySlideIndexForNode(node);
  document.querySelectorAll(".sim-node,.node-list-item").forEach(el=>el.classList.toggle("selected",el.dataset.nodeId===node.id));
  const card=document.querySelector("[data-hero-card]");
  if(card){card.innerHTML=heroCardMarkup(node);card.classList.remove("card-pop");void card.offsetWidth;card.classList.add("card-pop");}
  if(country)applyCountryExplorerBackground(country);
  if(threeEarthRuntime.group&&node.lat!=null)focusThreeCountry(node,options);
  if(announce)announceHero(`${node.name} selected. ${node.description}`);
  persist();
}
function advanceHeroNode() {
  const mode=state.hero.mode||"missions";
  const candidates=heroNodes.filter(node=>node.modes.includes(mode));
  if(candidates.length<2||state.view!=="home"||state.hero.paused||heroRuntime.hidden||!heroRuntime.visible||heroRuntime.reduced||!heroRuntime.entryComplete||heroRuntime.pointerInside||document.querySelector(".sim-node:focus"))return;
  const currentIndex=Math.max(0,candidates.findIndex(node=>node.id===state.hero.selected));
  selectHeroNode(candidates[(currentIndex+1)%candidates.length].id,false,{auto:true});
}
function selectHeroArc(id, announce=false) {
  const arc=heroArcs.find(item=>item.id===id);
  if(!arc)return;
  const card=document.querySelector("[data-hero-card]");
  if(card){card.innerHTML=`<div class="hero-card-kicker">${tag("Relationship","violet")}</div><h3>How the network connects</h3><p>${esc(arc.label)}</p><div class="card-meta">${tag("Source relationship","green")}</div>`;card.classList.remove("card-pop");void card.offsetWidth;card.classList.add("card-pop");}
  if(announce)announceHero(arc.label);
}
function announceHero(message) {
  const announcer=document.querySelector("#hero-simulation-announcer");
  if(announcer){announcer.textContent="";requestAnimationFrame(()=>{announcer.textContent=message;});}
}
function titleMarkup(index) {
  const title=HERO_TITLES[index];
  const titleEl=document.querySelector("#hero-title");
  if(!titleEl)return;
  const immediate=state.hero.reducedMotion||window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(immediate){
    titleEl.textContent=title;
    titleEl.classList.remove("title-leaving","title-entering");
    document.querySelectorAll(".title-progress button").forEach((segment,i)=>{const active=i===index;segment.classList.toggle("active",active);segment.toggleAttribute("aria-current",active);});
    if(titleRuntime.manual)announceHero(`Title ${index+1} of ${HERO_TITLES.length}: ${title}`);
    return;
  }
  clearTimeout(titleRuntime.transition);clearTimeout(titleRuntime.enterTimer);
  titleEl.classList.add("title-leaving");
  titleRuntime.transition=window.setTimeout(()=>{
    const current=document.querySelector("#hero-title");
    if(!current)return;
    current.textContent=title;
    current.classList.remove("title-leaving");
    current.classList.add("title-entering");
    titleRuntime.enterTimer=window.setTimeout(()=>current.classList.remove("title-entering"),260);
  },120);
  document.querySelectorAll(".title-progress button").forEach((segment,i)=>{const active=i===index;segment.classList.toggle("active",active);segment.toggleAttribute("aria-current",active);});
  if(titleRuntime.manual)announceHero(`Title ${index+1} of ${HERO_TITLES.length}: ${title}`);
}
function setHeroTitle(index, manual=false) {
  state.hero.titleIndex=(index+HERO_TITLES.length)%HERO_TITLES.length;
  titleRuntime.manual=manual;
  titleMarkup(state.hero.titleIndex);
  if(manual)window.setTimeout(()=>{titleRuntime.manual=false;},400);
  persist();
}
function startTitleTimer() {
  if(titleRuntime.timer)return;
  titleRuntime.timer=window.setInterval(()=>{
    if(state.view!=="home"||titleRuntime.hidden||titleRuntime.focused||state.hero.titlePaused||state.hero.reducedMotion||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    setHeroTitle((state.hero.titleIndex+1)%HERO_TITLES.length,false);
  },5000);
}
function bindTitleRuntime() {
  startTitleTimer();
  const title=document.querySelector("#hero-title");
  if(!title||title.dataset.bound)return;
  title.dataset.bound="true";
  title.addEventListener("focus",()=>titleRuntime.focused=true);
  title.addEventListener("blur",()=>titleRuntime.focused=false);
  const frame=document.querySelector("[data-title-frame]");
  if(frame){
    frame.addEventListener("pointerdown",event=>{titleRuntime.gestureStartX=event.clientX;});
    frame.addEventListener("pointerup",event=>{
      if(titleRuntime.gestureStartX===null)return;
      const delta=event.clientX-titleRuntime.gestureStartX;
      if(Math.abs(delta)>45)setHeroTitle(state.hero.titleIndex+(delta<0?1:-1),true);
      titleRuntime.gestureStartX=null;
    });
  }
}
function cleanupHeroRuntime() {
  cleanupThreeEarth();
  if(heroRuntime.raf)cancelAnimationFrame(heroRuntime.raf);
  if(heroRuntime.scrollRaf)cancelAnimationFrame(heroRuntime.scrollRaf);
  if(heroRuntime.resumeTimer)clearTimeout(heroRuntime.resumeTimer);
  if(heroRuntime.entryTimer)clearTimeout(heroRuntime.entryTimer);
  if(heroRuntime.slideshowTimer)clearInterval(heroRuntime.slideshowTimer);
  if(heroRuntime.nodeCycleTimer)clearInterval(heroRuntime.nodeCycleTimer);
  heroRuntime.listeners.splice(0).forEach(([target,type,handler,options])=>target.removeEventListener(type,handler,options));
  heroRuntime.observer?.disconnect();
  heroRuntime.raf=0;heroRuntime.scrollRaf=0;heroRuntime.resumeTimer=0;heroRuntime.entryTimer=0;heroRuntime.slideshowTimer=0;heroRuntime.nodeCycleTimer=0;heroRuntime.observer=null;heroRuntime.dragging=false;heroRuntime.pointerId=null;heroRuntime.pointers.clear();heroRuntime.pinchDistance=0;heroRuntime.velocityX=0;heroRuntime.entryComplete=false;heroRuntime.lastFrameTime=0;heroRuntime.pointerInside=false;
}
function addHeroListener(target,type,handler,options={}) {
  target.addEventListener(type,handler,options);heroRuntime.listeners.push([target,type,handler,options]);
}
function scheduleHeroResume() {
  if(heroRuntime.resumeTimer)clearTimeout(heroRuntime.resumeTimer);
  heroRuntime.resumeTimer=setTimeout(()=>{
    if(!state.hero.paused&&!heroRuntime.pointerInside&&!document.querySelector(".sim-node:focus"))heroRuntime.pausedByInteraction=false;
    heroRuntime.resumeTimer=0;
  },8000);
}
function renderHeroFrame() {
  const now=performance.now(), elapsed=heroRuntime.lastFrameTime?Math.min(48,now-heroRuntime.lastFrameTime):16.67;
  heroRuntime.lastFrameTime=now;
  const frameScale=elapsed/16.67;
  const webglReady=Boolean(threeEarthRuntime.renderer&&threeEarthRuntime.group);
  const frame=document.querySelector("[data-earth-frame]");
  if(frame)frame.style.transform=`translate3d(${Math.max(-12,Math.min(12,heroRuntime.rotation*.12))}px,0,0) ${webglReady?"":`rotateY(${heroRuntime.rotation}deg) `}scale(${heroRuntime.zoom})`;
  const root=document.querySelector("[data-hero-root]");
  if(!root||heroRuntime.hidden||!heroRuntime.visible||state.hero.paused||heroRuntime.reduced){heroRuntime.raf=0;return;}
  if(webglReady){
    const targetY=threeEarthRuntime.targetY;
    if(targetY!=null){let delta=targetY-threeEarthRuntime.group.rotation.y;delta=Math.atan2(Math.sin(delta),Math.cos(delta));threeEarthRuntime.group.rotation.y+=delta*.045;if(!heroRuntime.pausedByInteraction&&Math.abs(delta)<.001)threeEarthRuntime.targetY=null;}
    if(!heroRuntime.pausedByInteraction&&targetY==null)threeEarthRuntime.group.rotation.y+=.00084*frameScale;
    threeEarthRuntime.group.rotation.x=heroRuntime.tilt;
    threeEarthRuntime.group.rotation.y+=heroRuntime.velocityX;
    heroRuntime.velocityX*=.94;
    if(threeEarthRuntime.cloudLayer)threeEarthRuntime.cloudLayer.rotation.y+=.00011*frameScale;
    if(threeEarthRuntime.entryStarted&&!heroRuntime.entryComplete){
      const entryProgress=Math.min(1,(performance.now()-threeEarthRuntime.entryStarted)/1900),ease=1-Math.pow(1-entryProgress,3);
      threeEarthRuntime.group.scale.setScalar(.72+.28*ease);threeEarthRuntime.camera.position.z=3.75-.7*ease;
    } else {threeEarthRuntime.group.scale.setScalar(1);threeEarthRuntime.camera.position.z=3.05;}
    updateWebGLPlacemarkProjection();
    threeEarthRuntime.renderer.render(threeEarthRuntime.scene,threeEarthRuntime.camera);
  } else if(!heroRuntime.pausedByInteraction) {
    heroRuntime.rotation=(heroRuntime.rotation+.05*frameScale)%360;
  }
  if(heroRuntime.pausedByInteraction&&Math.abs(heroRuntime.velocityX)<.00008){heroRuntime.raf=0;return;}
  heroRuntime.raf=requestAnimationFrame(renderHeroFrame);
}
function initHeroRuntime() {
  cleanupHeroRuntime();
  const root=document.querySelector("[data-hero-root]"); if(!root)return;
  heroRuntime.reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches||navigator.hardwareConcurrency<=2;
  root.dataset.rendering=detectWebGL()?"enhanced":"static-fallback";
  if(heroRuntime.reduced)root.dataset.reduced="true";
  const card=document.querySelector("[data-hero-card]");if(card)card.innerHTML=heroCardMarkup(null);
  applyHeroMode(state.hero.mode||"missions");
  heroRuntime.nodeCycleTimer=window.setInterval(advanceHeroNode,5200);
  const stage=root.querySelector("[data-earth-stage]"), frame=root.querySelector("[data-earth-frame]");
  const setInteractionPause=()=>{heroRuntime.pausedByInteraction=true;scheduleHeroResume();};
  addHeroListener(stage,"pointerenter",()=>{heroRuntime.pointerInside=true;setInteractionPause();});
  addHeroListener(stage,"pointerleave",()=>{heroRuntime.pointerInside=false;scheduleHeroResume();});
  addHeroListener(stage,"focusin",event=>{if(event.target.closest(".sim-node"))setInteractionPause();});
  addHeroListener(stage,"pointerdown",event=>{
    // Controls are outside the globe visually on mobile, but remain inside
    // the stage for the shared desktop markup. Never let a control tap start
    // a globe drag or steal the subsequent click.
    if(event.target.closest(".sim-node,.arc-line,.earth-controls,.earth-toolbar,.earth-more"))return;
    heroRuntime.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(heroRuntime.pointers.size===2){heroRuntime.pinchDistance=pointerDistance();setInteractionPause();return;}
    heroRuntime.dragging=true;heroRuntime.pointerId=event.pointerId;heroRuntime.lastX=event.clientX;heroRuntime.lastY=event.clientY;heroRuntime.moved=false;stage.setPointerCapture?.(event.pointerId);setInteractionPause();
  });
  addHeroListener(stage,"pointermove",event=>{
    if(heroRuntime.pointers.has(event.pointerId))heroRuntime.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(heroRuntime.pointers.size>=2){const distance=pointerDistance();if(heroRuntime.pinchDistance){heroRuntime.zoom=Math.max(.88,Math.min(1.12,heroRuntime.zoom+(distance-heroRuntime.pinchDistance)*.002));}heroRuntime.pinchDistance=distance;return;}
    if(!heroRuntime.dragging||event.pointerId!==heroRuntime.pointerId)return;
    const dx=event.clientX-heroRuntime.lastX, dy=event.clientY-heroRuntime.lastY;
    if(Math.abs(dx)>Math.abs(dy)*.75){heroRuntime.rotation=Math.max(-24,Math.min(24,heroRuntime.rotation+dx*.2));heroRuntime.velocityX=dx*.0012;heroRuntime.moved=true;if(threeEarthRuntime.group){threeEarthRuntime.group.rotation.y+=dx*.006;threeEarthRuntime.group.rotation.x=Math.max(-.38,Math.min(.38,threeEarthRuntime.group.rotation.x+dy*.003));heroRuntime.tilt=threeEarthRuntime.group.rotation.x;updateWebGLPlacemarkProjection();threeEarthRuntime.renderer.render(threeEarthRuntime.scene,threeEarthRuntime.camera);}}
    else if(threeEarthRuntime.group){threeEarthRuntime.group.rotation.x=Math.max(-.38,Math.min(.38,threeEarthRuntime.group.rotation.x+dy*.003));heroRuntime.tilt=threeEarthRuntime.group.rotation.x;updateWebGLPlacemarkProjection();threeEarthRuntime.renderer.render(threeEarthRuntime.scene,threeEarthRuntime.camera);}
    heroRuntime.lastX=event.clientX;heroRuntime.lastY=event.clientY;
    if(!threeEarthRuntime.group){const fallbackFrame=document.querySelector("[data-earth-frame]");if(fallbackFrame)fallbackFrame.style.transform=`translate3d(${Math.max(-12,Math.min(12,heroRuntime.rotation*.12))}px,0,0) rotateY(${heroRuntime.rotation}deg) scale(${heroRuntime.zoom})`;}
  });
  const pointerDistance=()=>{const points=[...heroRuntime.pointers.values()];return points.length<2?0:Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);};
  const endDrag=event=>{heroRuntime.pointers.delete(event.pointerId);if(heroRuntime.pointers.size<2)heroRuntime.pinchDistance=0;if(event.pointerId===heroRuntime.pointerId){heroRuntime.dragging=false;heroRuntime.pointerId=null;}};
  addHeroListener(stage,"pointerup",endDrag);addHeroListener(stage,"pointercancel",endDrag);
  addHeroListener(stage,"click",event=>{
    if(heroRuntime.moved||event.target.closest(".sim-node,.earth-toolbar,.earth-more,.node-label"))return;
    openMapGateway();
  });
  addHeroListener(stage,"wheel",event=>{event.preventDefault();heroRuntime.zoom=Math.max(.88,Math.min(1.12,heroRuntime.zoom-event.deltaY*.00035));setInteractionPause();},{passive:false});
  addHeroListener(stage,"keydown",event=>{
    if(event.key==="Enter"||event.key===" "){event.preventDefault();openMapGateway();return;}
    if((event.key==="r"||event.key==="R")&&!["INPUT","TEXTAREA","SELECT"].includes(event.target.tagName)){event.preventDefault();heroRuntime.rotation=0;heroRuntime.tilt=0;heroRuntime.zoom=1;heroRuntime.velocityX=0;if(threeEarthRuntime.group){threeEarthRuntime.group.rotation.set(0,0,0);updateWebGLPlacemarkProjection();threeEarthRuntime.renderer.render(threeEarthRuntime.scene,threeEarthRuntime.camera);}setInteractionPause();return;}
    if((event.key==="p"||event.key==="P")&&!["INPUT","TEXTAREA","SELECT"].includes(event.target.tagName)){event.preventDefault();state.hero.paused=!state.hero.paused;persist();if(!state.hero.paused&&!heroRuntime.reduced&&!heroRuntime.raf)heroRuntime.raf=requestAnimationFrame(renderHeroFrame);return;}
    if(["ArrowLeft","ArrowRight"].includes(event.key)){event.preventDefault();const delta=event.key==="ArrowRight"?-.07:.07;heroRuntime.rotation+=delta*10;if(threeEarthRuntime.group){threeEarthRuntime.group.rotation.y+=delta;updateWebGLPlacemarkProjection();threeEarthRuntime.renderer.render(threeEarthRuntime.scene,threeEarthRuntime.camera);}setInteractionPause();}
    if(["ArrowUp","ArrowDown"].includes(event.key)){event.preventDefault();const delta=event.key==="ArrowDown"?-.05:.05;heroRuntime.tilt=Math.max(-.38,Math.min(.38,heroRuntime.tilt+delta));if(threeEarthRuntime.group){threeEarthRuntime.group.rotation.x=heroRuntime.tilt;updateWebGLPlacemarkProjection();threeEarthRuntime.renderer.render(threeEarthRuntime.scene,threeEarthRuntime.camera);}setInteractionPause();}
    if(event.key==="+"||event.key==="="){event.preventDefault();heroRuntime.zoom=Math.min(1.12,heroRuntime.zoom+.04);setInteractionPause();}
    if(event.key==="-"){event.preventDefault();heroRuntime.zoom=Math.max(.88,heroRuntime.zoom-.04);setInteractionPause();}
  });
  const onVisibility=()=>{heroRuntime.hidden=document.hidden;titleRuntime.hidden=document.hidden;if(!document.hidden&&!state.hero.paused&&!heroRuntime.reduced&&!heroRuntime.raf)heroRuntime.raf=requestAnimationFrame(renderHeroFrame);};
  addHeroListener(document,"visibilitychange",onVisibility);
  const onScroll=()=>{if(heroRuntime.scrollRaf)return;heroRuntime.scrollRaf=requestAnimationFrame(()=>{heroRuntime.scrollRaf=0;const hero=document.querySelector(".hero");if(hero)hero.style.setProperty("--hero-scroll",Math.min(1,window.scrollY/620));});};
  addHeroListener(window,"scroll",onScroll,{passive:true});
  heroRuntime.observer=new IntersectionObserver(entries=>{heroRuntime.visible=entries[0]?.isIntersecting!==false;if(heroRuntime.visible&&!heroRuntime.reduced&&!state.hero.paused&&!heroRuntime.raf)heroRuntime.raf=requestAnimationFrame(renderHeroFrame);},{threshold:.05});
  heroRuntime.observer.observe(root);
  if(!heroRuntime.reduced)heroRuntime.raf=requestAnimationFrame(renderHeroFrame);
  root.querySelectorAll("[data-node-id]").forEach(nodeEl=>addHeroListener(nodeEl,"click",()=>selectHeroNode(nodeEl.dataset.nodeId,true)));
  root.querySelectorAll("[data-arc-id]").forEach(arcEl=>{addHeroListener(arcEl,"click",()=>selectHeroArc(arcEl.dataset.arcId,true));addHeroListener(arcEl,"keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();selectHeroArc(arcEl.dataset.arcId,true);}});});
  addHeroListener(window,"resize",()=>{const earth=root.querySelector("[data-earth-core]");if(earth)earth.style.setProperty("--dpr",Math.min(2,window.devicePixelRatio||1));});
  initThreeEarth(root);
}
function completeHeroEntry(root) {
  if(heroRuntime.entryComplete)return;
  heroRuntime.entryComplete=true;
  selectHeroNode(state.hero.selected||"ghana-node");
  const card=document.querySelector("[data-hero-card]");
  if(card)card.classList.add("entry-reveal");
}
function textureLoad(THREE,loader,url) {
  return new Promise((resolve,reject)=>loader.load(url,resolve,undefined,reject));
}
function latLonVector(THREE,lat,lon,radius=1.02) {
  const latitude=THREE.MathUtils.degToRad(lat),longitude=THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(latitude)*Math.sin(longitude)*radius,Math.sin(latitude)*radius,Math.cos(latitude)*Math.cos(longitude)*radius);
}
function createGreatCirclePoints(THREE,from,to) {
  const a=latLonVector(THREE,from.lat,from.lon,1.02).normalize();
  const b=latLonVector(THREE,to.lat,to.lon,1.02).normalize();
  const angle=Math.acos(Math.min(1,Math.max(-1,a.dot(b))));
  const points=[];
  for(let i=0;i<=36;i++){const t=i/36, sinAngle=Math.sin(angle)||1, v=a.clone().multiplyScalar(Math.sin((1-t)*angle)/sinAngle).add(b.clone().multiplyScalar(Math.sin(t*angle)/sinAngle)).normalize();v.multiplyScalar(1.025+Math.sin(Math.PI*t)*.045);points.push(v);}
  return points;
}
function nodeGeo(node) {
  if(node.lat!=null&&node.lon!=null)return node;
  return heroNodes.find(candidate=>candidate.id==="ghana-node");
}
function disposeThreeObject(object) {
  object?.traverse?.(child=>{
    if(child.geometry)child.geometry.dispose();
    if(child.material){const materials=Array.isArray(child.material)?child.material:[child.material];materials.forEach(material=>{Object.values(material).forEach(value=>{if(value?.isTexture)value.dispose?.();});material.dispose?.();});}
  });
}
function cleanupThreeEarth() {
  threeEarthRuntime.requestId++;
  threeEarthRuntime.resizeObserver?.disconnect();
  if(threeEarthRuntime.group)disposeThreeObject(threeEarthRuntime.group);
  threeEarthRuntime.renderer?.dispose?.();
  threeEarthRuntime.renderer?.forceContextLoss?.();
  threeEarthRuntime.module=null;threeEarthRuntime.renderer=null;threeEarthRuntime.scene=null;threeEarthRuntime.camera=null;threeEarthRuntime.group=null;threeEarthRuntime.cloudLayer=null;threeEarthRuntime.canvas=null;threeEarthRuntime.resizeObserver=null;threeEarthRuntime.arcObjects=null;threeEarthRuntime.entryStarted=0;
}
function focusThreeCountry(node, options={}) {
  if(node.lat==null||node.lon==null)return;
  if(!threeEarthRuntime.group){heroRuntime.rotation=Math.max(-24,Math.min(24,-(node.lon||0)*.16));const frame=document.querySelector("[data-earth-frame]");if(frame)frame.style.transform=`translate3d(0,0,0) rotateY(${heroRuntime.rotation}deg) scale(1.06)`;return;}
  const vector=latLonVector(threeEarthRuntime.module,node.lat,node.lon,1).normalize();
  threeEarthRuntime.targetY=-Math.atan2(vector.x,vector.z);
  threeEarthRuntime.targetX=Math.max(-.28,Math.min(.28,-vector.y*.1));
  heroRuntime.zoom=1.06;
  if(!options.auto){heroRuntime.pausedByInteraction=true;scheduleHeroResume();}
}
function updateWebGLPlacemarkProjection() {
  const {module:THREE,group,camera}=threeEarthRuntime;
  const core=document.querySelector("[data-earth-core]");
  if(!THREE||!group||!camera||!core)return;
  group.updateMatrixWorld(true);
  const rect=core.getBoundingClientRect();
  heroNodes.forEach(node=>{
    const element=document.querySelector(`.sim-node[data-node-id="${node.id}"]`);
    if(!element||nodeGeo(node).lat==null)return;
    const local=latLonVector(THREE,nodeGeo(node).lat,nodeGeo(node).lon,1.035);
    const world=local.applyMatrix4(group.matrixWorld);
    const depth=world.z;
    const projected=world.clone().project(camera);
    const x=(projected.x*.5+.5)*rect.width, y=(-projected.y*.5+.5)*rect.height;
    element.style.left=`${x}px`;element.style.top=`${y}px`;
    const visible=depth>-.02&&projected.z<1.05;
    element.classList.toggle("far-side",!visible);
    element.style.opacity=visible?String(Math.max(.22,Math.min(1,.35+depth*.8))):"0";
    element.style.zIndex=String(Math.round(100+depth*30));
  });
}
async function initThreeEarth(root) {
  const canvas=root.querySelector("[data-earth-canvas]");if(!canvas||!detectWebGL()){root.dataset.rendering="static-fallback";window.setTimeout(()=>completeHeroEntry(root),900);return;}
  const requestId=++threeEarthRuntime.requestId;
  let THREE;
  try { THREE=await import("https://esm.sh/three@0.160.0"); }
  catch (error) { console.warn("Earth WebGL module unavailable; using static fallback.",{name:error?.name||"module_error"});root.dataset.rendering="static-fallback";window.setTimeout(()=>completeHeroEntry(root),900);return; }
  if(requestId!==threeEarthRuntime.requestId||!document.body.contains(canvas))return;
  try {
    const core=canvas.closest("[data-earth-core]"),rect=core.getBoundingClientRect();
    const quality=state.hero.quality||"Balanced";
    const pixelRatio=quality==="High"?2:quality==="Low Power"?1:1.5;
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:quality!=="Low Power"&&!heroRuntime.reduced,powerPreference:quality==="High"?"high-performance":"low-power"});
    renderer.setPixelRatio(Math.min(pixelRatio,window.devicePixelRatio||1));
    renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(26,rect.width/rect.height,.1,20);camera.position.z=3.05;
    const group=new THREE.Group();scene.add(group);
    scene.add(new THREE.AmbientLight(0x4b7487,.62));
    const hemisphere=new THREE.HemisphereLight(0x82d7e3,0x07141e,.5);scene.add(hemisphere);
    const sun=new THREE.DirectionalLight(0xffe9c5,2.35);sun.position.set(-3,1.5,4);scene.add(sun);
    const loader=new THREE.TextureLoader(),[diffuse,normal,specular,clouds,lights]=await Promise.all([
      textureLoad(THREE,loader,"assets/earth_atmos_2048.jpg"),
      textureLoad(THREE,loader,"assets/earth_normal_2048.jpg"),
      textureLoad(THREE,loader,"assets/earth_specular_2048.jpg"),
      textureLoad(THREE,loader,"assets/earth_clouds_1024.png"),
      textureLoad(THREE,loader,"assets/earth_lights_2048.png"),
    ]);
    [diffuse,clouds,lights].forEach(texture=>{if(texture)texture.colorSpace=THREE.SRGBColorSpace;});
    // SphereGeometry's front-facing UV meridian is -90°. Shift the
    // equirectangular assets by 90° so the lon=0 Africa meridian is front.
    [diffuse,normal,specular,clouds,lights].forEach(texture=>{if(texture){texture.wrapS=THREE.RepeatWrapping;texture.offset.x=.25;texture.needsUpdate=true;}});
    const geometry=new THREE.SphereGeometry(1,72,72);
    const earthMaterial=new THREE.MeshPhongMaterial({map:diffuse,normalMap:normal,normalScale:new THREE.Vector2(.5,.5),specularMap:specular,specular:new THREE.Color(0x2c7893),shininess:22});
    const earth=new THREE.Mesh(geometry,earthMaterial);group.add(earth);
    const cloudOpacity=heroRuntime.reduced ? 0.14 : (quality==="High" ? 0.42 : quality==="Low Power" ? 0.18 : 0.32);
    const cloudMaterial=new THREE.MeshPhongMaterial({alphaMap:clouds,color:0xf0ffff,transparent:true,opacity:cloudOpacity,depthWrite:false,side:THREE.DoubleSide});
    const cloudLayer=new THREE.Mesh(new THREE.SphereGeometry(1.018,48,48),cloudMaterial);group.add(cloudLayer);
    const nightMaterial=new THREE.ShaderMaterial({uniforms:{map:{value:lights},lightDirection:{value:new THREE.Vector3(-3,1.5,4).normalize()}},vertexShader:"varying vec3 vNormal; varying vec2 vUv; void main(){vUv=uv;vNormal=normalize(normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"uniform sampler2D map; uniform vec3 lightDirection; varying vec3 vNormal; varying vec2 vUv; void main(){float night=smoothstep(0.18,-0.18,dot(normalize(vNormal),normalize(lightDirection)));vec4 lights=texture2D(map,vUv);gl_FragColor=vec4(lights.rgb,lights.a*night*.72);}",transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const nightLayer=new THREE.Mesh(new THREE.SphereGeometry(1.006,64,64),nightMaterial);group.add(nightLayer);
    const atmosphereMaterial=new THREE.ShaderMaterial({uniforms:{color:{value:new THREE.Color(0x63dbe8)}},vertexShader:"varying vec3 vNormal; varying vec3 vView; void main(){vec4 mvPosition=modelViewMatrix*vec4(position,1.0);vNormal=normalize(normalMatrix*normal);vView=normalize(-mvPosition.xyz);gl_Position=projectionMatrix*mvPosition;}",fragmentShader:"uniform vec3 color; varying vec3 vNormal; varying vec3 vView; void main(){float rim=pow(1.0-max(dot(vNormal,vView),0.0),3.5);gl_FragColor=vec4(color,rim*.34);}",side:THREE.BackSide,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
    const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.065,48,48),atmosphereMaterial);group.add(atmosphere);
    const arcObjects=new Map();
    heroArcs.forEach(arc=>{
      const from=nodeGeo(heroNodes.find(node=>node.id===arc.from)||heroNodes[0]),to=nodeGeo(heroNodes.find(node=>node.id===arc.to)||heroNodes[1]);
      if(from.lat==null||to.lat==null)return;
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(createGreatCirclePoints(THREE,from,to)),new THREE.LineBasicMaterial({color:0x8fe6e3,transparent:true,opacity:.52,depthWrite:false}));
      line.userData.arcId=arc.id;line.visible=arc.modes.includes(state.hero.mode);group.add(line);arcObjects.set(arc.id,line);
    });
    threeEarthRuntime.module=THREE;threeEarthRuntime.renderer=renderer;threeEarthRuntime.scene=scene;threeEarthRuntime.camera=camera;threeEarthRuntime.group=group;threeEarthRuntime.cloudLayer=cloudLayer;threeEarthRuntime.canvas=canvas;threeEarthRuntime.arcObjects=arcObjects;threeEarthRuntime.entryStarted=performance.now();threeEarthRuntime.targetY=0;threeEarthRuntime.targetX=0;
    root.dataset.rendering="enhanced";core.classList.add("webgl-ready");
    const resize=()=>{const next=core.getBoundingClientRect();if(!next.width||!next.height)return;renderer.setSize(next.width,next.height,false);camera.aspect=next.width/next.height;camera.updateProjectionMatrix();updateWebGLPlacemarkProjection();renderer.render(scene,camera);};
    threeEarthRuntime.resizeObserver=new ResizeObserver(resize);threeEarthRuntime.resizeObserver.observe(core);
    resize();renderer.render(scene,camera);
    const finish=()=>{if(!threeEarthRuntime.renderer)return;completeHeroEntry(root);};
    if(heroRuntime.reduced){group.scale.setScalar(1);finish();}
    else heroRuntime.entryTimer=window.setTimeout(finish,1900);
  } catch (error) {
    console.warn("Earth renderer failed; using static fallback.",{name:error?.name||"renderer_error"});root.dataset.rendering="static-fallback";window.setTimeout(()=>completeHeroEntry(root),900);
  }
}
function detectWebGL() {
  return typeof window.WebGLRenderingContext!=="undefined"||typeof window.WebGL2RenderingContext!=="undefined";
}
function normaliseCourseOutline(candidate, outcome) {
  if(!candidate||typeof candidate!=="object"||!Array.isArray(candidate.modules)||candidate.modules.length<3)return null;
  return {
    title:String(candidate.title||"Reviewable course proposal").slice(0,160),
    purpose:String(candidate.purpose||outcome).slice(0,800),
    audience:String(candidate.audience||"Community learners and mission participants").slice(0,240),
    level:String(candidate.level||"Foundational").slice(0,80),
    duration:String(candidate.duration||`${Math.min(candidate.modules.length,8)} modules · draft`).slice(0,120),
    format:String(candidate.format||"Cohort or self-paced").slice(0,120),
    language:String(candidate.language||"English").slice(0,80),
    prerequisites:String(candidate.prerequisites||"").slice(0,500),
    modules:candidate.modules.slice(0,8).map(normaliseCourseModule),
    assessment:normaliseCourseAssessment(candidate.assessment),
    safetyNote:String(candidate.safetyNote||"Proposal: add local safeguarding contacts and review with a qualified steward.").slice(0,500),
    evidenceTask:String(candidate.evidenceTask||"Submit a consented field record and reflection for review.").slice(0,500),
    accessibilityNotes:String(candidate.accessibilityNotes||"Use plain language, captions/transcripts, low-bandwidth materials, and multiple ways to participate.").slice(0,700),
    sourceNotes:String(candidate.sourceNotes||"Add local sources, contributors, and last-reviewed dates before approval.").slice(0,900),
  };
}

function sdgConnections(sdgId) {
  const missions=seed.missions.filter(record=>(record.sdgs||[]).includes(sdgId));
  const courses=seed.courses.filter(record=>(record.sdgs||[]).includes(sdgId));
  const events=seed.events.filter(record=>(record.sdgs||[]).includes(sdgId));
  const countries=COUNTRY_RECORDS.filter(record=>(record.sdgs||[]).includes(sdgId));
  return {missions,courses,events,countries,total:missions.length+courses.length+events.length+countries.length};
}
function sdgLandingSection() {
  return `<section class="section sdg-landing-section">${pageHead("The 17 Sustainable Development Goals","One connected agenda.","Explore every Global Goal and see how missions, courses, country chapters, and events can connect to the same work.")}<div class="sdg-grid">${seed.sdgs.map(([id,name])=>{const linked=sdgConnections(id)["total"];return `<button class="sdg-card" data-action="route-sdgs" data-sdg="${id}" style="--sdg-color:${SDG_COLORS[id]}"><span class="sdg-card-number">${id.replace("SDG ","")}</span><span><strong>${esc(name)}</strong><small>${linked} linked record${linked===1?"":"s"}</small></span>${icon("arrow")}</button>`;}).join("")}</div><div class="sdg-section-action">${button("Explore the SDG network","route-sdgs","primary")}</div></section>`;
}
function sdgDirectoryCard([id,name]) {
  const connections=sdgConnections(id);
  return `<article class="sdg-directory-card" style="--sdg-color:${SDG_COLORS[id]}"><div class="sdg-directory-heading"><span class="sdg-card-number">${id.replace("SDG ","")}</span><div><div class="eyebrow">${id}</div><h3>${esc(name)}</h3></div></div><p>${connections.total?`${connections.total} linked public record${connections.total===1?"":"s"} across chapters, projects, learning, and events.`:"No linked public records yet; the goal remains available for a future reviewed connection."}</p><div class="sdg-counts"><span><strong>${connections.missions.length}</strong> missions</span><span><strong>${connections.courses.length}</strong> courses</span><span><strong>${connections.events.length}</strong> events</span><span><strong>${connections.countries.length}</strong> countries</span></div></article>`;
}
function sdgConnectionButton(record,section,type) {
  return `<button class="sdg-connection-row" data-action="open-breakdown" data-breakdown-section="${section}" data-breakdown-id="${esc(record.id)}"><span class="sdg-connection-type">${type}</span><span><strong>${esc(record.title||record.name)}</strong><small>${esc(record.country||record.location||record.mission||"Global")}</small></span>${icon("arrow")}</button>`;
}
function sdgInterconnectionMarkup([id,name]) {
  const connections=sdgConnections(id), records=[...connections.missions.map(record=>sdgConnectionButton(record,"missions","Mission")),...connections.courses.map(record=>sdgConnectionButton(record,"education","Course")),...connections.events.map(record=>sdgConnectionButton(record,"events","Event")),...connections.countries.map(record=>sdgConnectionButton({id:record.id,title:record.name,country:record.name},"explore","Country"))];
  return `<article class="sdg-interconnection" style="--sdg-color:${SDG_COLORS[id]}"><div class="sdg-interconnection-head"><div class="sdg-directory-heading"><span class="sdg-card-number">${id.replace("SDG ","")}</span><div><div class="eyebrow">${id}</div><h3>${esc(name)}</h3></div></div><span class="sdg-connection-total">${connections.total} connections</span></div><div class="sdg-connection-list">${records.length?records.join(""):`<div class="sdg-no-connections">No public mission, course, event, or country record is linked yet.</div>`}</div></article>`;
}
function sdgsView() {
  return `<div>${button(`${icon("arrow")} Back home`,"route-home","text")}<section class="sdg-page-hero"><div><div class="eyebrow">The 17 Sustainable Development Goals</div><h1>See how the work connects.</h1><p class="lede">The SDGs are not separate silos. A mission can support learning, a country chapter can host an event, and evidence can help a community move from one goal to another.</p></div><div class="sdg-page-orbit"><span>17</span><small>shared goals</small></div></section><section class="section">${pageHead("SDG directory","Every goal has a place in the network.","Counts below are derived from the existing public records. Empty states stay visible until a reviewed record is connected.")}<div class="sdg-directory-grid">${seed.sdgs.map(sdgDirectoryCard).join("")}</div></section><section class="section">${pageHead("Interconnected records","Follow a goal through projects and events.","Select any linked record to inspect its existing status, context, and next step. No new activity or impact total is inferred by a connection.")}<div class="sdg-interconnection-list">${seed.sdgs.map(sdgInterconnectionMarkup).join("")}</div></section></div>`;
}

function changeProcessSection() {
  const steps=[
    ["01","Learn","Understand the need before acting.","book","cyan"],
    ["02","Connect","Bring people, places, and skills together.","globe","blue"],
    ["03","Build","Shape a mission with a clear owner.","plus","violet"],
    ["04","Fund","Move resources with visible status.","shield","gold"],
    ["05","Act","Turn the plan into local practice.","heart","coral"],
    ["06","Verify","Submit evidence others can inspect.","check","green"],
    ["07","Replicate","Share what worked for the next place.","arrow","white"],
  ];
  return `<section class="section change-process-section"><div class="section-head"><div><div class="eyebrow">The operating rhythm</div><h2 class="section-title">How change happens</h2><p class="section-copy">A living loop turns intention into work, work into evidence, and evidence into a pathway someone else can carry forward.</p></div><span class="change-process-loop">${icon("spark")} LOOP · HUMAN-LED</span></div><div class="change-process-visual" aria-label="Seven step process: Learn, Connect, Build, Fund, Act, Verify, Replicate"><div class="change-process-beam" aria-hidden="true"><i></i></div><div class="change-process-grid">${steps.map(([number,title,copy,ic,tone],index)=>`<article class="change-process-node tone-${tone}" style="--process-delay:${index*.42}s"><div class="change-process-node-top"><span>${number}</span><i></i></div><span class="change-process-icon">${threeDIcon(ic)}</span><h3>${title}</h3><p>${copy}</p><span class="change-process-pulse" aria-hidden="true"></span></article>`).join("")}</div><div class="change-process-footer"><span><i></i>Need becomes a mission</span><span><i></i>Evidence becomes trust</span><span><i></i>Trust travels to the next place</span></div></div></section>`;
}

function landingTrustStrip() {
  return `<section class="landing-trust-strip" aria-label="How public record status works"><div><span class="status-dot draft">Draft</span><small>Being shaped by a steward</small></div><div><span class="status-dot pending">Reviewed</span><small>Source and context checked</small></div><div><span class="status-dot verified">Verified</span><small>Evidence supports the public claim</small></div><button class="btn text" data-action="route-impact">See the methodology ${icon("arrow")}</button></section>`;
}
function landingTwinTeaser() {
  return `<section class="section panel landing-twin-teaser"><div class="landing-twin-copy"><div class="eyebrow">New · interactive Digital Twin Football</div><h2>Try one kick. See the system respond.</h2><p>Adjust velocity, spin, and curve to explore the ball model, then follow its QR identity into missions, learning, and reviewed community evidence.</p><div class="landing-twin-actions">${button("Open the full experience","route-unity-ball","primary")}${button("View the mission record","open-record")}</div></div><div class="landing-twin-sim">${footballArt({interactive:true})}</div></section>`;
}
function landingIntentSection() {
  const groups=[
    ["Participate","Find a role in work already moving.","spark",[["Find a mission","route-missions"],["Learn or mentor","route-education"],["Join an event","route-events"]]],
    ["Build","Turn an idea into a reviewable plan.","plus",[["Generate a prospectus","open-prospectus"],["Draft a mission","open-mission-wizard"],["Create a passport","route-join"]]],
    ["Support","Bring resources, trust, or reach.","shield",[["Fund a mission","route-funding"],["Become a partner","route-partners"],["See verified impact","route-impact"]]],
  ];
  return `<section class="section landing-intents">${pageHead("Start where you are","Choose your role.","Three clear ways into the network, each with a practical next step.")}<div class="landing-intent-grid">${groups.map(([title,copy,ic,actions])=>`<article class="panel landing-intent-card"><span class="activation-icon activation-icon-3d">${threeDIcon(ic)}</span><div><h3>${title}</h3><p>${copy}</p></div><div class="landing-intent-actions">${actions.map(([label,action],index)=>button(label,action,index===0?"primary small":"small")).join("")}</div></article>`).join("")}</div></section>`;
}
function landingIdeaPath() {
  const steps=[["01","Idea"],["02","Prospectus"],["03","Mission"],["04","Team"],["05","Evidence"]];
  return `<section class="section panel panel-pad landing-idea-path"><div><div class="eyebrow">Idea to impact</div><h2 class="section-title">Give a promising idea a credible first page.</h2><p class="section-copy">Start with the prospectus generator, then connect a steward, mission record, collaborators, and evidence without presenting an early idea as verified impact.</p>${button("Start an idea","open-prospectus","primary")}</div><div class="landing-idea-flow" aria-label="Idea to impact pathway">${steps.map(([number,label],index)=>`<span><small>${number}</small><strong>${label}</strong>${index<steps.length-1?"<i>→</i>":""}</span>`).join("")}</div></section>`;
}
function homeView() {
  const countdown=countdownParts(), campaign=peaceCampaignCopy();
  const titleIndex=state.hero?.titleIndex||0;
  const hero=`<section class="hero"><video class="hero-background-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true"><source src="/sherun.mp4" type="video/mp4" /></video><div class="hero-copy"><div class="eyebrow">Be The Change · independent SDG action network</div><div class="hero-title-frame" data-title-frame><h1 class="display" id="hero-title" tabindex="0">${esc(HERO_TITLES[titleIndex])}</h1><div class="title-controls" aria-label="Hero title controls"><button class="title-control" data-action="hero-title-prev" aria-label="Previous title">←</button><div class="title-progress" aria-label="Title progress">${HERO_TITLES.map((_,i)=>`<button class="${i===titleIndex?"active":""}" data-action="hero-title-goto" data-index="${i}" style="--step-color:${HERO_STEP_COLORS[i%HERO_STEP_COLORS.length]}" aria-label="Show title ${i+1} of ${HERO_TITLES.length}" ${i===titleIndex?'aria-current="step"':""}></button>`).join("")}</div><button class="title-control" data-action="hero-title-next" aria-label="Next title">→</button><button class="title-control title-pause" data-action="hero-title-pause" aria-label="${state.hero?.titlePaused?"Resume title rotation":"Pause title rotation"}" aria-pressed="${state.hero?.titlePaused?"true":"false"}">${state.hero?.titlePaused?"▶":"Ⅱ"}</button></div><span id="hero-title-announcer" class="sr-only" aria-live="polite"></span></div><p class="lede">Turn skills and ideas into local missions, practical learning, and evidence people can trust.</p><div class="hero-actions">${button("Find a Mission","route-missions","primary")}${button("Start an Idea","open-prospectus","gold")}${button("Try the Digital Twin","route-unity-ball")}</div><div class="hero-note"><span class="pulse"></span><span>Every public record shows whether it is draft, reviewed, or verified.</span></div></div>${globe()}${heroNetworkPulse()}</section>`;
  const campaignSection=`<section class="section panel panel-pad campaign"><div class="campaign-grid"><div><div class="eyebrow">Priority activation · ${campaign.label}</div><h2 class="campaign-title">${campaign.title}</h2><p class="lede">${campaign.copy}</p>${peaceCampaignIsLive()?`<div class="countdown">${countdown.map(([n,l])=>`<div class="count-cell"><strong>${n}</strong><span>${l}</span></div>`).join("")}</div>`:""}<div class="campaign-actions">${button(peaceCampaignIsLive()?"Register an activity":"View the impact summary",peaceCampaignIsLive()?"open-peace-form":"route-impact","primary")}${button("Join an event","route-events")}${button("Organizer resources","resources")}</div></div><div class="campaign-side"><div class="map-mini" aria-label="Participation map ready for moderated submissions"><span class="map-dot d1"></span><span class="map-dot d2"></span><span class="map-dot d3"></span><span class="map-dot d4"></span><span class="map-dot d5"></span></div><div class="micro-note">MAP STATUS · READY FOR MODERATED SUBMISSIONS<br/>No participation totals are presented until records exist.</div></div></div></section>`;
  const metricsSection=`<section class="section">${pageHead("Live global activity","A clear signal, not a vanity metric.","Every number carries its definition, source, date, and verification status.")}<div class="grid metrics">${[["0","Registered people","Awaiting submissions"],["0","Participating countries","Public records only"],["0","Active missions","No verified total yet"],["0","Evidence submissions","Moderation queue empty"],["—","Verified results","No verified claims yet"]].map(([value,label,status])=>`<article class="panel metric"><div class="eyebrow">${label}</div><div class="metric-value">${value}</div><div class="metric-label">${status}</div><div class="metric-source">STATUS · ${value==="—"?"EMPTY STATE":"TARGET / SELF-REPORTED · 02 SEP 2026"}</div></article>`).join("")}</div></section>`;
  const pathways=`<section class="section">${pageHead("Featured pathways","A place to enter the work.","Start with a country, a skill, or a shared cause.")}<div class="grid pathways">${[["01","Ghana Activation","Learning, peacebuilding, health, and youth enterprise.","route-ghana","green"],["02","Education for Action","Learning paths connected to mission requirements.","route-education","violet"],["03","Sports for Peace","Football and community-created sport as a bridge.","route-sports","gold"],["04","Gender-Lens Finance","A proposed finance initiative with transparent status.","route-impact","coral"],["05","Diaspora Collaboration","Knowledge, capital, and care across borders.","route-explore","cyan"],["06","Health & Wellbeing","Skills and learning for community-defined needs.","route-missions","green"]].map(([number,title,copy,action,tone])=>`<button class="panel pathway" data-action="${action}"><div class="pathway-top"><span class="pathway-number">${number}</span>${tag("Explore",tone)}</div><h3>${title}</h3><p>${copy}</p><span class="card-link">${icon("arrow")}</span></button>`).join("")}</div></section>`;
  return `${hero}${landingTrustStrip()}${landingTwinTeaser()}${landingIntentSection()}${landingIdeaPath()}${campaignSection}${metricsSection}${sdgLandingSection()}${pathways}${changeProcessSection()}`;
}

function countdownParts() {
  const target = new Date("2026-09-21T00:00:00Z").getTime();
  const diff = Math.max(0, target-Date.now());
  const days = Math.floor(diff/86400000), hours=Math.floor(diff%86400000/3600000), minutes=Math.floor(diff%3600000/60000);
  return [[String(days).padStart(2,"0"),"days"],[String(hours).padStart(2,"0"),"hours"],[String(minutes).padStart(2,"0"),"minutes"]];
}
function peaceCampaignIsLive() { return Date.now() < new Date("2026-09-22T00:00:00Z").getTime(); }
function peaceCampaignCopy() {
  return peaceCampaignIsLive()
    ? { label:"September 10—21 · Global Peace in Action", title:"Global Peace in Action", copy:"A live campaign for schools, sports teams, communities, and partners to register a safe local activity, connect it to the Global Goals, and submit evidence for review." }
    : { label:"Campaign impact summary · updated after September 21", title:"Peace in Action · what happened next", copy:"The campaign window has closed. This space now carries moderated participation records, evidence, stories, lessons, and invitations to replicate the work." };
}

function exploreView() {
  const exploreFilters=["All records","Missions","Courses","Events","Countries","Organizations",...new Set(publicRecordsRuntime.records.map(record=>record.tab))];
  return `<div>${pageHead("Explore","Follow the constellation.","Search public records across people, skills, missions, countries, courses, events, and organizations.")}
    <div class="toolbar"><div class="search-box">${icon("search")}<input id="global-search" value="${esc(state.search)}" placeholder="Search missions, skills, countries, courses…" aria-label="Search the ecosystem" /></div><select class="filter-select" id="explore-type" aria-label="Filter explore records">${exploreFilters.map(x=>`<option ${state.exploreType===x?"selected":""}>${esc(x)}</option>`).join("")}</select><button class="btn small" data-action="clear-explore">Clear filters</button></div>
    ${exploreResults()}</div>`;
}
function exploreRecords() {
  return [
    ...seed.missions.map(x=>({...x,type:"Mission"})),
    ...seed.courses.map(x=>({...x,type:"Course",title:x.title,purpose:x.purpose,country:"Global",verification:x.label})),
    ...seed.events.map(x=>({...x,type:"Event",purpose:`${x.type} · ${x.location}`,country:"Global",verification:x.status})),
    ...seed.countries.map(x=>({...x,type:"Country",title:x.name,purpose:x.note,verification:x.status})),
    ...seed.organizations.map((x,index)=>({...x,type:"Organization",id:`organization-${index}`,title:x.name,purpose:x.note,verification:x.status})),
    ...publicRecordsRuntime.records.map(record=>({...record,type:record.tab,title:record.title,purpose:record.summary,country:record.country,verification:record.status,source:"Admin registry"})),
  ];
}
function exploreResults() {
  const q=state.search.toLowerCase();
  const typeMap={Missions:"Mission",Courses:"Course",Events:"Event",Countries:"Country",Organizations:"Organization"};
  const rows = exploreRecords().filter(x=>(state.exploreType==="All records"||typeMap[state.exploreType]===x.type||state.exploreType===x.type)&&(!q || `${x.title} ${x.purpose} ${x.country} ${x.type}`.toLowerCase().includes(q)));
  if (!rows.length) return `<div class="empty-state"><div class="eyebrow">No matching records</div><h3>Nothing in the public index yet.</h3><p>Try a different phrase, or create a Change Passport to get recommendations from your skills.</p>${button("Create your passport","route-join","primary")}</div>`;
  return `<div class="grid record-grid">${rows.map(x=>`<article class="panel record-card clickable-card" data-action="open-breakdown" data-breakdown-section="explore" data-breakdown-id="${esc(x.id||x.title)}" tabindex="0" role="button"><div style="display:flex;justify-content:space-between;gap:10px">${tag(x.type)}${statusBadge(x.verification || "Draft")}</div><h3>${esc(x.title)}</h3><p>${esc(x.purpose)}</p><div class="card-meta">${x.country?tag(x.country,"green"):""}${x.stage?tag(x.stage,"violet"):""}</div><span class="card-link">Open full breakdown ${icon("arrow")}</span></article>`).join("")}</div>`;
}

function adminLocationRows() {
  return (adminRuntime.locations.length ? adminRuntime.locations : LIBERIA_LOCATIONS).map(row=>({
    id:row.id, title:row.name, summary:row.description||"Canonical location record", status:row.verification||"Needs Review",
    country:row.country||row.country_iso3||"Liberia", origin:adminRuntime.locations.length?"Canonical GIS record":"Front-end location seed",
    type:row.category||row.type||"location", source:row.source_name||row.source||"", county:row.county||"", city:row.settlement||row.city||"",
    lat:row.latitude==null?row.lat:row.latitude, lng:row.longitude==null?row.lng:row.longitude, privacy:row.privacy||"Approximate", source_url:row.source_url||"",
  }));
}
function adminSeedRows(tab) {
  if(["Locations","Schools","Universities","Orphanages"].includes(tab)) {
    const rows=adminLocationRows();
    if(tab==="Schools")return rows.filter(row=>["school","primary","secondary"].includes(String(row.type).toLowerCase()));
    if(tab==="Universities")return rows.filter(row=>["university","college"].includes(String(row.type).toLowerCase()));
    if(tab==="Orphanages")return rows.filter(row=>["orphanage","children_home"].includes(String(row.type).toLowerCase()));
    return rows;
  }
  if(tab==="Countries"||tab==="Chapters")return COUNTRY_RECORDS.map(country=>({id:`seed-${tab.toLowerCase()}-${country.id}`,title:tab==="Chapters"?`${country.name} Chapter`:country.name,summary:country.summary,status:country.status,country:country.name,origin:"Front-end country register",type:tab.slice(0,-1)}));
  if(tab==="Missions")return seed.missions.map(item=>({id:item.id,title:item.title,summary:item.purpose,status:item.verification,country:item.country,origin:"Front-end mission register",type:"Mission"}));
  if(tab==="Education")return seed.courses.map(item=>({id:item.id,title:item.title,summary:item.purpose,status:item.label,country:"Global",origin:"Front-end education register",type:"Course"}));
  if(tab==="Events")return seed.events.map(item=>({id:item.id,title:item.title,summary:`${item.location} · ${item.date}`,status:item.status,country:"Global",origin:"Front-end event register",type:"Event"}));
  if(tab==="Organizations"||tab==="Partners")return seed.organizations.map((item,index)=>({id:`seed-organization-${index}`,title:item.name,summary:item.note,status:item.status,country:item.country,origin:"Front-end organization register",type:item.type}));
  if(tab==="Sports")return SPORT_PRODUCTS.map(item=>({id:`seed-sport-${item.id}`,title:item.name,summary:item.description,status:item.status,country:"Global",origin:"Front-end sports collection",type:item.category}));
  return [];
}
function adminRowsForTab(tab) {
  const live=adminRuntime.records.filter(record=>tab==="Overview"||record.tab===tab).map(record=>({...record,origin:"Admin record",type:record.tab}));
  const seeds=tab==="Overview"?[]:adminSeedRows(tab);
  const seen=new Set();
  return [...live,...seeds].filter(row=>{if(seen.has(row.id))return false;seen.add(row.id);return true;});
}
function recordDate(value) { if(!value)return "Not dated"; try{return new Intl.DateTimeFormat(undefined,{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value));}catch{return String(value).slice(0,10);} }
function publicAdminRecords(tab) { return publicRecordsRuntime.records.filter(record=>record.tab===tab); }
function eventRecordsForUi() {
  const seeded=seed.events.map(event=>({...event,source:"Front-end event register",country:event.country||"Global",latitude:event.lat||null,longitude:event.lng||null}));
  return [...eventRuntime.records,...seeded].filter((event,index,rows)=>rows.findIndex(candidate=>candidate.id===event.id)===index);
}
function parseEventGeoRSS(xml) {
  const documentNode=new DOMParser().parseFromString(xml,"application/xml");
  if(documentNode.querySelector("parsererror"))throw new Error("Invalid GeoRSS XML");
  return [...documentNode.querySelectorAll("item")].map(item=>{const text=selector=>item.querySelector(selector)?.textContent?.trim()||"", namespaced=(namespace,local)=>item.getElementsByTagNameNS(namespace,local)[0]?.textContent?.trim()||"", point=namespaced("http://www.georss.org/georss","point").split(/\s+/).map(Number);return {id:text("guid")||text("link")||text("title"),title:text("title"),summary:text("description"),status:"Published",country:namespaced("https://websim.com/ns/be-the-change","country")||"Global",date:namespaced("https://websim.com/ns/be-the-change","eventDate")||text("pubDate"),type:text("category")||"Community event",location:namespaced("https://websim.com/ns/be-the-change","location"),organizer:namespaced("https://websim.com/ns/be-the-change","organizer"),latitude:Number.isFinite(point[0])?point[0]:null,longitude:Number.isFinite(point[1])?point[1]:null,source_url:text("link")};});
}
async function loadEventGeoRSS() {
  if(eventRuntime.loaded||eventRuntime.loading)return;
  eventRuntime.loading=true; eventRuntime.error="";
  try { const response=await fetch("/api/events/georss",{headers:{accept:"application/rss+xml, application/xml"}}), xml=await response.text(); if(!response.ok)throw new Error(`GeoRSS request failed (${response.status})`); eventRuntime.records=parseEventGeoRSS(xml); }
  catch(error) { eventRuntime.error="GeoRSS feed unavailable; seeded event records remain visible."; console.info(eventRuntime.error); }
  eventRuntime.loaded=true; eventRuntime.loading=false;
  if(state.view==="events")render();
  else if(state.view==="map")render();
}
function publicAdminRecordGrid(tab, heading=`Published ${tab.toLowerCase()} records`) {
  const rows=publicAdminRecords(tab); if(!rows.length)return "";
  return `<section class="section admin-public-records"><div class="section-head"><div><div class="eyebrow">Admin-published · live registry</div><h2 class="section-title" style="font-size:27px">${esc(heading)}</h2><p class="section-copy">These entries are connected to the administrator workspace and are visible because their publication status is explicit.</p></div>${tag(`${rows.length} live`,"green")}</div><div class="grid grid-3">${rows.map(record=>`<article class="panel record-card admin-public-record clickable-card" data-action="open-public-record" data-public-record-id="${esc(record.id)}" tabindex="0" role="button"><div class="admin-record-label"><span>${esc(record.tab)}</span>${statusBadge(record.status||"Published")}</div><h3>${esc(record.title)}</h3><p>${esc(record.summary||"No summary added yet.")}</p><div class="card-meta">${record.country?countryTag(record.country):tag("Global","green")}</div><small class="table-note">Updated ${esc(recordDate(record.updated_at))}${record.source_url?` · <a href="${esc(record.source_url)}" target="_blank" rel="noreferrer">Source</a>`:""}</small></article>`).join("")}</div></section>`;
}
async function loadPublicAdminRecords() {
  if(publicRecordsRuntime.loaded||publicRecordsRuntime.loading)return;
  publicRecordsRuntime.loading=true;
  try { const response=await fetch("/api/records",{headers:{accept:"application/json"}}); const rows=await response.json(); if(response.ok&&Array.isArray(rows))publicRecordsRuntime.records=rows; }
  catch(error) { console.info("Public admin registry unavailable; front-end seed records remain active."); }
  publicRecordsRuntime.loaded=true; publicRecordsRuntime.loading=false;
  if(state.view!=="admin"&&state.view!=="map")render();
}
async function loadAdminWorkspace() {
  if(adminRuntime.loaded||adminRuntime.loading)return;
  adminRuntime.loading=true; adminRuntime.error="";
  try {
    const [recordsResponse,locationsResponse,mediaResponse,jukeboxResponse,settingsResponse,auditResponse,reportsResponse]=await Promise.all([fetch("/api/admin/records",{headers:{accept:"application/json"}}),fetch("/api/admin/locations",{headers:{accept:"application/json"}}),fetch("/api/admin/media",{headers:{accept:"application/json"}}),fetch("/api/admin/jukebox/submissions",{headers:{accept:"application/json"}}),fetch("/api/admin/jukebox/settings",{headers:{accept:"application/json"}}),fetch("/api/admin/jukebox/audit",{headers:{accept:"application/json"}}),fetch("/api/admin/jukebox/reports",{headers:{accept:"application/json"}})]);
    const records=await recordsResponse.json().catch(()=>[]), locations=await locationsResponse.json().catch(()=>[]), media=await mediaResponse.json().catch(()=>[]), jukebox=await jukeboxResponse.json().catch(()=>[]), settings=await settingsResponse.json().catch(()=>[]), audit=await auditResponse.json().catch(()=>[]), reports=await reportsResponse.json().catch(()=>[]);
    if(recordsResponse.ok&&Array.isArray(records))adminRuntime.records=records;
    if(locationsResponse.ok&&Array.isArray(locations))adminRuntime.locations=locations.map(row=>({...row,type:row.category==="children_home"?"orphanage":row.category,city:row.settlement,source:row.source_name,lat:row.latitude,lng:row.longitude}));
    if(mediaResponse.ok&&Array.isArray(media))adminMediaRuntime.records=media;
    if(jukeboxResponse.ok&&Array.isArray(jukebox))adminJukeboxRuntime.records=jukebox;
    if(settingsResponse.ok&&Array.isArray(settings))adminJukeboxRuntime.settings=settings;
    if(auditResponse.ok&&Array.isArray(audit))adminJukeboxRuntime.audit=audit;
    if(reportsResponse.ok&&Array.isArray(reports))adminJukeboxRuntime.reports=reports;
    if(!recordsResponse.ok||!locationsResponse.ok||!mediaResponse.ok||!jukeboxResponse.ok)adminRuntime.error="Owner authorization is required to load persistent admin records.";
  } catch(error) { adminRuntime.error="The admin registry is temporarily unavailable. Front-end seed records are still shown."; }
  adminRuntime.loaded=true; adminRuntime.loading=false;adminMediaRuntime.loaded=true;adminMediaRuntime.loading=false;adminJukeboxRuntime.loaded=true;adminJukeboxRuntime.loading=false;
  if(state.view==="admin")render();
}

async function loadCountryMedia(country) {
  if(!country||mediaRuntime.loading||mediaRuntime.loadedCountry===country.id)return;
  mediaRuntime.loading=true;mediaRuntime.error="";mediaRuntime.countryId=country.id;mediaRuntime.records=[];
  jukeboxRuntime.countryId=country.id;jukeboxRuntime.settings=null;jukeboxRuntime.tracks=[];jukeboxRuntime.loading=true;jukeboxRuntime.error="";
  try {
    const slug=encodeURIComponent(country.slug||country.id);
    const [mediaResponse,jukeboxResponse]=await Promise.all([fetch(`/api/countries/${slug}/media`,{headers:{accept:"application/json"}}),fetch(`/api/countries/${slug}/jukebox`,{headers:{accept:"application/json"}})]);
    const result=await mediaResponse.json().catch(()=>({})), jukebox=await jukeboxResponse.json().catch(()=>({}));
    if(!mediaResponse.ok)throw new Error(result.error||"Media request failed");
    mediaRuntime.records=Array.isArray(result.media)?result.media:[];
    if(jukeboxResponse.ok){jukeboxRuntime.settings=jukebox.settings||null;jukeboxRuntime.tracks=Array.isArray(jukebox.tracks)?jukebox.tracks:[];jukeboxRuntime.activeId="";} else throw new Error(jukebox.error||"Jukebox request failed");
  } catch(error) { mediaRuntime.error="The country media shelf is temporarily unavailable."; }
  mediaRuntime.loadedCountry=country.id;mediaRuntime.loading=false;jukeboxRuntime.loadedCountry=country.id;jukeboxRuntime.loading=false;
  if(state.view==="country"||state.view==="ghana")render();
}

function missionsView() {
  const q=state.search.toLowerCase(); const filtered=seed.missions.filter(m=>(state.missionFilter==="All"||m.stage===state.missionFilter||m.country===state.missionFilter)&&(!q||`${m.title} ${m.purpose} ${m.skills.join(" ")}`.toLowerCase().includes(q)));
  return `<div>${pageHead("Missions","Find your mission.","The mission is the central record: a need, a team, a budget, a learning path, fieldwork, evidence, and a result.")}<div class="toolbar"><div class="search-box">${icon("search")}<input id="mission-search" value="${esc(state.search)}" placeholder="Search by mission, skill, or need…" aria-label="Search missions" /></div><select class="filter-select" id="mission-filter" aria-label="Filter missions"><option>All</option>${["Idea","Needs Validation","Designing","Partner Formation","Funding Ready","Active","Evidence Review","Replication Ready"].map(x=>`<option ${state.missionFilter===x?"selected":""}>${x}</option>`).join("")}</select><div class="view-switch" aria-label="Mission view"><button class="${state.missionView==="grid"?"active":""}" data-action="mission-grid">Grid</button><button class="${state.missionView==="list"?"active":""}" data-action="mission-list">List</button><button class="${state.missionView==="map"?"active":""}" data-action="mission-map">Map</button></div><button class="btn small" data-action="clear-missions">Clear filters</button><button class="btn primary small" data-action="open-mission-wizard">${icon("plus")} Create mission</button></div>${state.missionView==="map"?missionMap():state.missionView==="list"?missionList(filtered):missionGrid(filtered)}${publicAdminRecordGrid("Missions")}</div>`;
}
function missionGrid(items) {
  if(!items.length)return `<div class="empty-state"><div class="eyebrow">Mission index</div><h3>That mission is not in the public index.</h3><p>Draft a new mission, or adjust the filters. Private and unverified records stay protected.</p>${button("Draft a mission","open-mission-wizard","primary")}</div>`;
  return `<div class="grid record-grid">${items.map(missionCard).join("")}</div>`;
}
function missionList(items) { return `<div class="grid">${items.map(m=>`<article class="panel list-card clickable-card" data-action="open-breakdown" data-breakdown-section="missions" data-breakdown-id="${esc(m.id)}" tabindex="0" role="button"><div class="list-card-main">${tag(m.stage,"violet")}<h3>${esc(m.title)}</h3><p>${esc(m.purpose)}</p><div class="card-meta">${countryTag(m.country)}${m.sdgs.map(s=>tag(s))}${m.youth?tag("Youth-led","gold"):""}</div></div><div class="list-card-side">${statusBadge(m.verification)}<br/><span class="card-link">Open breakdown ${icon("arrow")}</span></div></article>`).join("")}</div>`; }
function missionCard(m) { return `<article class="panel record-card clickable-card" data-action="open-breakdown" data-breakdown-section="missions" data-breakdown-id="${esc(m.id)}" tabindex="0" role="button"><div style="display:flex;justify-content:space-between;gap:10px">${tag(m.stage,"violet")}${statusBadge(m.verification)}</div><h3>${esc(m.title)}</h3><p>${esc(m.purpose)}</p><div class="card-meta">${countryTag(m.country)}${m.sdgs.slice(0,2).map(s=>tag(s))}</div><div style="margin-top:18px;display:flex;justify-content:space-between;align-items:center"><span class="micro-note">${m.skills.slice(0,2).join(" · ")}</span><span class="card-link">View breakdown ${icon("arrow")}</span></div></article>`; }
function missionMap() { return `<div class="panel panel-pad"><h3>Mission geography</h3><p class="section-copy">Country-level mission markers appear where a public mission has an approved geographic context.</p><button class="btn primary" data-action="mission-open-map">Open mission map</button></div>`; }

function peaceView() {
  const eventCount=seed.events.filter(e=>e.mission==="Peace in Action · Ghana").length;
  const campaign=peaceCampaignCopy();
  return `<div>${button(`${icon("arrow")} Back home`,"route-home","text")}<section class="panel panel-pad campaign"><div class="campaign-grid"><div><div class="eyebrow">${campaign.label}</div><h1 class="campaign-title">${peaceCampaignIsLive()?"Make peace visible in the places you know.":"A public record of what communities made possible."}</h1><p class="lede">${campaign.copy}</p>${peaceCampaignIsLive()?`<div class="countdown">${countdownParts().map(([n,l])=>`<div class="count-cell"><strong>${n}</strong><span>${l}</span></div>`).join("")}</div>`:""}${button(peaceCampaignIsLive()?"Register an activity":"Invite a new Peace Mission",peaceCampaignIsLive()?"open-peace-form":"open-mission-wizard","primary")}</div><div class="campaign-side"><div class="map-mini"><span class="map-dot d1"></span><span class="map-dot d2"></span><span class="map-dot d3"></span><span class="map-dot d4"></span><span class="map-dot d5"></span><div class="eyebrow" style="position:absolute;bottom:17px;left:18px">Participation map · moderation first</div></div><div class="micro-note">CAMPAIGN RECORDS · ${eventCount} PLANNED EVENTS · 0 EVIDENCE SUBMISSIONS</div></div></div></section><section class="section">${pageHead("Participation funnel","From intention to evidence.","Each action has a next step, an owner, and a place to submit what happened.")}<div class="grid grid-3">${[["01","Register","Tell us what you’re organizing and who it is for.","open-peace-form"],["02","Connect","Add your school, team, country chapter, or partner.","open-peace-form"],["03","Submit evidence","Share attendance, reflection, and media with consent.","open-evidence-form"],].map(([n,t,p,a])=>`<article class="panel pathway"><div class="pathway-top"><span class="pathway-number">${n}</span>${tag(n==="03"?"Moderated":"Open",n==="03"?"gold":"")}</div><h3>${t}</h3><p>${p}</p><button class="card-link" data-action="${a}">Continue ${icon("arrow")}</button></article>`).join("")}</div></section><section class="section">${pageHead("Campaign toolkit","Ready-to-use entry points.","Resources are drafts until an organizer approves and publishes them.")}<div class="grid grid-3"><article class="panel record-card">${tag("Draft","violet")}<h3>Organizer resources</h3><p>Activity guide, safeguarding checklist, consent language, and evidence template.</p><button class="card-link" data-action="resources">Request toolkit ${icon("arrow")}</button></article><article class="panel record-card">${tag("Planned","gold")}<h3>Livestream schedule</h3><p>Schedule is being assembled. No speakers or broadcasts are confirmed here.</p><button class="card-link" data-action="show-record">View schedule ${icon("arrow")}</button></article><article class="panel record-card">${tag("Empty state")}<h3>Closing report</h3><p>After September 21, this space will convert into an impact summary with source records.</p><button class="card-link" data-action="route-impact">See reporting method ${icon("arrow")}</button></article></div></section></div>`;
}

function countryRegionLegendMarkup() {
  const palettes=[...new Map(COUNTRY_RECORDS.map(country=>{const palette=countryRegionPalette(country);return [palette.key,palette];})).values()];
  return `<div class="country-region-legend" aria-label="Country region color key">${palettes.map(palette=>`<span style="--region-color:${palette.color}"><i aria-hidden="true"></i>${esc(palette.label)}</span>`).join("")}</div>`;
}
function countriesView() {
  const filters=["All Countries","Active","Activation Planning","Community Forming","Coordinator Needed","Peace Campaign","Courses Available","Missions Available"];
  const query=(state.countrySearch||"").toLowerCase();
  const filtered=seed.countries.filter(country=>country.id!=="global").filter(country=>{
    const searchMatch=!query||`${country.name} ${country.region} ${country.iso3} ${(country.aliases||[]).join(" ")}`.toLowerCase().includes(query);
    const missions=seed.missions.filter(mission=>mission.country===country.name);
    const courses=seed.courses.filter(course=>course.mission?.toLowerCase().includes(country.name.toLowerCase()));
    const statusMatch=state.countryFilter==="All Countries"||(state.countryFilter==="Peace Campaign"&&country.id==="ghana")||(state.countryFilter==="Courses Available"&&courses.length>0)||(state.countryFilter==="Missions Available"&&missions.length>0)||country.status===state.countryFilter;
    return searchMatch&&statusMatch;
  });
  return `<div>${pageHead("Countries & chapters","Build where you are.","A country chapter is a living workspace—not a claim of activity. Every status is explicit.")}<div class="toolbar"><div class="search-box">${icon("search")}<input id="country-search" value="${esc(state.countrySearch||"")}" placeholder="Search country, ISO3, alias, or region…" aria-label="Search countries" /></div><select class="filter-select" id="country-filter" aria-label="Filter countries">${filters.map(filter=>`<option ${state.countryFilter===filter?"selected":""}>${filter}</option>`).join("")}</select><button class="btn primary small" data-action="route-join">${icon("plus")} Join or start a chapter</button></div><div class="country-directory-count"><span>${filtered.length} of ${COUNTRY_RECORDS.length} country chapters</span><span>Each record begins as reviewed research, not an activity claim.</span></div>${countryRegionLegendMarkup()}<div class="grid grid-2">${filtered.length?filtered.map(countryCardMarkup).join(""):`<div class="empty-state" style="grid-column:1/-1"><div class="eyebrow">Country directory</div><h3>No countries match these filters.</h3><p>Clear the search or choose another chapter status. No country claim is created by an empty result.</p>${button("Clear filters","clear-countries","primary")}</div>`}</div><section class="section panel panel-pad"><div class="section-head"><div><div class="eyebrow">Country network</div><h2 class="section-title">Country data layer ready.</h2><p class="section-copy">${COUNTRY_RECORDS.length} country records are available as map anchors and reviewable chapter workspaces. Existing records retain their statuses; newly added records begin as Research Only.</p></div>${tag("Editable draft content","violet")}</div><div class="country-network-strip">${COUNTRY_RECORDS.map(country=>{const palette=countryRegionPalette(country);return `<button class="network-chip region-card" data-action="${country.id==="ghana"?"route-ghana":"route-country"}" data-country="${country.id}" data-region="${palette.key}" style="--region-color:${palette.color}"><span>${country.flag}</span><strong>${country.name}</strong><small>${esc(palette.label)} · ${country.iso3}</small></button>`;}).join("")}</div><div class="empty-state" style="margin-top:22px"><h3>Country data layer ready for reviewed records.</h3><p>Every country can add SDG priorities, members, missions, events, schools, courses, and skills needed without inventing activity.</p>${button("Request a country record","show-record","small")}</div></section>${publicAdminRecordGrid("Countries","Published country records")}${publicAdminRecordGrid("Chapters","Published chapter records")}</div>`;
}
function countryCardMarkup(country) {
  const missionCount=seed.missions.filter(mission=>mission.country===country.name).length;
  const courseCount=seed.courses.filter(course=>course.mission?.toLowerCase().includes(country.name.toLowerCase())).length;
  const action=country.id==="ghana"?"route-ghana":"route-country";
  const palette=countryRegionPalette(country);
  return `<article class="panel country-hero region-card" data-country-mark="${esc(country.iso3||country.code||"")}" data-region="${palette.key}" style="${countryHeroStyle(country)}"><div class="country-card-top"><span class="country-flag" aria-hidden="true">${country.flag||"🌍"}</span><span class="eyebrow"><i class="country-region-dot" aria-hidden="true"></i>${esc(palette.label)} · ${country.iso3}</span></div><h2>${esc(country.name)}</h2>${statusBadge(country.status)}<p class="section-copy">${esc(country.summary)}</p><div class="card-meta">${country.focus.map(x=>tag(x))}</div><div class="country-card-stats"><span><strong>${missionCount||"—"}</strong> missions</span><span><strong>${courseCount||"—"}</strong> courses</span><span><strong>${country.lastUpdated}</strong> updated</span></div><div style="margin-top:22px">${country.id==="ghana"?button("Open Ghana workspace",action,"small"):`<button class="btn small" data-action="${action}" data-country="${country.id}">Explore country ${icon("arrow")}</button>`}</div><small class="country-hero-source">Image: ${esc(countryHeroImage(country).source)}</small></article>`;
}

function ghanaView() {
  return `<div>${button(`${icon("arrow")} Countries`,"route-countries","text")}<section class="panel country-hero" data-country-mark="GHA"><div class="eyebrow">🇬🇭 · GHA · West Africa · country activation node</div><h1>Ghana</h1>${statusBadge("Activation Planning")}<p class="lede">A first complete country workspace connecting community-defined needs, education, peacebuilding, health, gender-responsive finance, diaspora collaboration, and youth entrepreneurship.</p><div class="country-stats"><div class="country-stat"><strong>4</strong><span>focus areas mapped</span></div><div class="country-stat"><strong>1</strong><span>Ghana mission record</span></div><div class="country-stat"><strong>0</strong><span>verified results</span></div><div class="country-stat"><strong>—</strong><span>members · pending import</span></div></div><div style="margin-top:25px;display:flex;flex-wrap:wrap;gap:9px">${button("Become a Ghana partner","open-partner-form","primary")}${button("Join Ghana workspace","route-join")}</div></section><section class="section"><div class="grid grid-3">${[["Education","Courses and school partnerships for local action.","route-education","violet"],["Health","Community-defined pathways and ethical data collection.","route-missions","green"],["Peacebuilding","September campaign node and sports for peace.","route-peace","gold"],["Gender-responsive finance","Proposed initiative with explicit funding statuses.","route-impact","coral"],["Diaspora collaboration","A place for knowledge, capital, and care to connect.","route-partners","cyan"],["Youth entrepreneurship","Draft pathway awaiting local review.","route-education","violet"]].map(([t,p,a,co])=>`<button class="panel pathway" data-action="${a}"><div class="pathway-top">${tag("Ghana",co)}</div><h3>${t}</h3><p>${p}</p><span class="card-link">${icon("arrow")}</span></button>`).join("")}</div></section><section class="section detail-layout"><div class="panel"><div class="eyebrow">Proposed planning budget</div><h2>$5M Ghana activation plan</h2><p class="prose">This is a proposed planning budget, not received funding. Line items are placeholders for an authorized operations workspace and require supporting documents, approvals, and an audit trail.</p><div class="budget-bar"><span></span><span></span><span></span><span></span></div><div class="budget-legend"><span><i class="legend-dot"></i>Proposed programs</span><span><i class="legend-dot gold"></i>Education</span><span><i class="legend-dot coral"></i>Operations</span><span><i class="legend-dot violet"></i>Evidence</span></div><div class="footer-note">FINANCIAL STATUS · PROPOSED · PRIVATE OPERATIONS VIEW REQUIRED FOR LINE ITEMS</div></div><div class="panel"><div class="eyebrow">Operations</div><h2>Restricted workspace</h2><p class="prose">Project portfolio, approvals, responsible parties, planned versus actual, risks, documents, and audit logs belong behind role-based access.</p>${button(`${icon("lock")} Request authorized access`,"show-record","small")}</div></section></div>`;
}

function mediaTypeLabel(type) { return type==="music"?"Music":type==="video"?"Video":"Document"; }
function mediaEmbedMarkup(record) {
  if(record.media_type==="document")return `<a class="media-document-link" href="${esc(record.source_url)}" target="_blank" rel="noreferrer"><span class="media-document-icon">↗</span><span><strong>Open document</strong><small>${esc(record.source_type||"Public source")} · opens in a new tab</small></span>${icon("arrow")}</a>`;
  return `<div class="media-embed ${record.media_type}"><iframe src="${esc(record.embed_url)}" title="${esc(`${record.title} · ${record.creator||record.country_name||"country media"}`)}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
}
function mediaCardMarkup(record) {
  return `<article class="media-card"><div class="media-card-meta"><span class="media-type-pill ${record.media_type}">${record.media_type==="music"?"♫":record.media_type==="video"?"▶":"↗"} ${mediaTypeLabel(record.media_type)}</span><span>${esc(record.source_type)}</span></div>${mediaEmbedMarkup(record)}<div class="media-card-copy"><h3>${esc(record.title)}</h3><p>${esc(record.creator||record.description||"Submitted for country review.")}</p>${record.description&&record.creator?`<small>${esc(record.description)}</small>`:""}<div class="media-card-foot"><span>${esc(record.language||"Language not set")}${record.genre?` · ${esc(record.genre)}`:""}</span><span>Approved media</span></div></div></article>`;
}
function mediaEmptyMarkup(type, country) {
  return `<div class="media-empty"><span class="media-empty-mark">${type==="music"?"♫":type==="video"?"▶":"↗"}</span><div><strong>No approved ${mediaTypeLabel(type).toLowerCase()} yet</strong><p>Be the first to submit a source for ${esc(country.name)}. It will stay private until reviewed.</p></div></div>`;
}
function countryMediaSection(country) {
  const records=mediaRuntime.countryId===country.id?mediaRuntime.records:[], tracks=jukeboxRuntime.countryId===country.id?jukeboxRuntime.tracks:[], videos=records.filter(record=>record.media_type==="video"), documents=records.filter(record=>record.media_type==="document");
  const settings=jukeboxRuntime.settings||{brand_name:`${country.name} listening room`,tagline:"Community-selected sounds, reviewed before publishing.",accent_color:"#84e4e5",glow_color:"#eacb83"};
  const active=tracks.find(track=>track.id===jukeboxRuntime.activeId)||tracks[0];
  const trackList=tracks.slice(0,6).map((track,index)=>`<button class="jukebox-track ${active?.id===track.id?"active":""}" data-action="jukebox-select" data-jukebox-track-id="${esc(track.id)}" aria-pressed="${active?.id===track.id}"><span class="track-number">${String(index+1).padStart(2,"0")}</span><span><strong>${esc(track.title)}</strong><small>${esc(track.artist||"Artist not set")} · ${esc(track.provider||track.source_type)}</small></span><span class="track-status">${track.featured?"Featured":"Approved"}</span></button>`).join("");
  return `<section class="section country-media-section"><div class="section-head"><div><div class="eyebrow">Country jukebox · reviewed listening room</div><h2 class="section-title">${esc(settings.brand_name||`${country.name} listening room`)}</h2><p class="section-copy">${esc(settings.tagline||"Community-selected sounds, reviewed before publishing.")} This is a cultural context shelf, not an official soundtrack or endorsement of an entire country.</p></div><div class="country-media-actions"><button class="btn small primary" data-action="open-media-submit" data-country-id="${esc(country.id)}" data-media-type="music">Submit a track</button></div></div><div class="country-jukebox ${active?"has-track":"empty"}" style="--juke-accent:${esc(settings.accent_color)};--juke-glow:${esc(settings.glow_color)}"><div class="jukebox-disc ${active?"is-playing":""}" aria-hidden="true"><span>${country.flag||"🌍"}</span><i></i><b class="jukebox-wave"><em></em><em></em><em></em><em></em><em></em><em></em></b></div><div class="jukebox-copy"><div class="eyebrow">${active?"Now playing · approved track":"Country jukebox · awaiting its first approval"}</div><h3>${active?esc(active.title):`The ${esc(country.name)} listening room`}</h3><p>${active?esc(active.artist||active.context_note||"Approved community submission"):"Submit a public provider link and the rights to share it. Every track remains private until approved."}</p>${active?`<div class="jukebox-player">${mediaEmbedMarkup({...active,media_type:"music",creator:active.artist,country_name:country.name})}<div class="jukebox-player-meta"><span>${esc(active.provider||active.source_type)} · ${esc(active.genre||"Genre not set")} · Rights confirmed · reviewed</span><button class="card-link jukebox-report" data-action="jukebox-report" data-jukebox-track-id="${esc(active.id)}">Report / takedown</button></div></div>`:mediaEmptyMarkup("music",country)}<div class="jukebox-track-list">${trackList||`<div class="jukebox-pending-note"><strong>No approved tracks yet.</strong><span>Pending submissions stay visible only to reviewers.</span></div>`}</div><div class="jukebox-legal-note">Source/provider attribution is shown for every approved track. Rights status was confirmed by the submitter and reviewed before publication.</div></div></div><div class="country-media-grid"><section class="media-shelf"><div class="media-shelf-head"><div><div class="eyebrow">Moving image</div><h3>Videos</h3></div><span>${videos.length} approved</span></div>${videos.length?videos.slice(0,4).map(mediaCardMarkup).join(""):mediaEmptyMarkup("video",country)}</section><section class="media-shelf"><div class="media-shelf-head"><div><div class="eyebrow">Reference shelf</div><h3>Documents</h3></div><span>${documents.length} approved</span></div>${documents.length?documents.slice(0,6).map(mediaCardMarkup).join(""):mediaEmptyMarkup("document",country)}</section></div></section>`;
}

function mediaSubmitModalMarkup(countryId, type="music") {
  const country=COUNTRY_RECORDS.find(record=>record.id===countryId)||COUNTRY_RECORDS[0];
  const isMusic=type==="music";
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal media-submit-modal" data-modal-body><div class="modal-head"><div><div class="eyebrow">${isMusic?"Jukebox submission":"Community media"} · ${esc(country?.name||"Country")}</div><h2>${isMusic?"Submit a track for review.":"Submit a source for review."}</h2></div><button class="close-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><p class="section-copy">${isMusic?"Share a provider link to a song or musical work. It stays private until a reviewer confirms its source, context, and rights.":"Music, videos, and documents are private to the review queue until an administrator approves them. Submit a public source you have permission to share."}</p><div class="form-grid"><div class="field"><label for="media-submit-type">Media type</label><select id="media-submit-type"><option value="music" ${type==="music"?"selected":""}>Music</option><option value="video" ${type==="video"?"selected":""}>Video</option><option value="document" ${type==="document"?"selected":""}>Document</option></select></div><div class="field"><label for="media-submit-country">Country</label><input id="media-submit-country" value="${esc(country?.name||"")}" readonly data-country-id="${esc(country?.id||"")}" /></div><div class="field full-width"><label for="media-submit-title">Title <span class="required-mark">*</span></label><input id="media-submit-title" required placeholder="${isMusic?"Track title":"Track, video, or document title"}" /></div><div class="field"><label for="media-submit-creator">${isMusic?"Artist":"Artist / author / channel"}</label><input id="media-submit-creator" placeholder="Who created or published it?" /></div><div class="field"><label for="media-submit-language">Language</label><input id="media-submit-language" placeholder="e.g. English, Twi" /></div><div class="field"><label for="media-submit-genre">${isMusic?"Genre":"Genre / topic"}</label><input id="media-submit-genre" placeholder="${isMusic?"e.g. Highlife, Afrobeats":"e.g. education"}" /></div><div class="field full-width"><label for="media-submit-source">Public provider URL <span class="required-mark">*</span></label><input id="media-submit-source" type="url" required placeholder="${isMusic?"YouTube, SoundCloud, or Spotify track URL":"YouTube, SoundCloud, Spotify, Vimeo, or public document URL"}" /></div><div class="field full-width"><label for="media-submit-description">${isMusic?"Cultural context note":"Context note"}</label><textarea id="media-submit-description" placeholder="What should listeners or readers understand about this source?"></textarea></div><div class="field full-width"><div class="check-chip"><input id="media-submit-rights" type="checkbox" required /><label for="media-submit-rights">I confirm I have permission to submit this source, and understand it will be reviewed before publication.</label></div></div></div><div class="form-feedback" data-form-feedback role="alert"></div>${button("Submit for approval","submit-media","primary full")}</div></div>`;
}

function countryDetailView(id) {
  const country=seed.countries.find(record=>record.id===id);
  if(!country)return notFoundView("Country record not found","This country may be private, archived, or still being prepared.");
  const missions=seed.missions.filter(mission=>mission.country===country.name);
  const courses=seed.courses.filter(course=>course.mission?.toLowerCase().includes(country.name.toLowerCase()));
  const events=seed.events.filter(event=>event.location?.toLowerCase().includes(country.name.toLowerCase()));
  const count=value=>value?String(value):"—";
  return `<div>${button(`${icon("arrow")} Countries`,"route-countries","text")}<section class="panel country-detail-hero"><div class="country-flag-large" aria-hidden="true">${country.flag||"🌍"}</div><div><div class="eyebrow">${country.region} · ${country.iso3} · country-level map center</div><h1>${esc(country.name)}</h1>${statusBadge(country.status)}<p class="lede">${esc(country.summary||country.note)}</p><div class="card-meta">${country.sdgs.map(s=>tag(s))}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:22px">${button("Join this country network","route-join","primary")}${button("Propose a mission","open-mission-wizard")}${button("Help activate this chapter","open-partner-form")}</div></div></section><section class="section"><div class="grid grid-4 country-detail-stats"><article class="panel metric"><div class="eyebrow">Missions</div><div class="metric-value">${count(missions.length)}</div><div class="metric-label">Published public records</div></article><article class="panel metric"><div class="eyebrow">Courses</div><div class="metric-value">${count(courses.length)}</div><div class="metric-label">Country-linked learning</div></article><article class="panel metric"><div class="eyebrow">Events</div><div class="metric-value">${count(events.length)}</div><div class="metric-label">Published public events</div></article><article class="panel metric"><div class="eyebrow">Last updated</div><div class="metric-value" style="font-size:18px">${esc(country.lastUpdated||"Not set")}</div><div class="metric-label">Record activity date</div></article></div></section><section class="section detail-layout"><div class="panel"><div class="eyebrow">Country workspace</div><h2>What is forming here</h2><p class="prose">${esc(country.note||"No public activity has been published yet.")}</p><h3>Skills needed</h3><div class="card-meta">${country.focus.map(focus=>tag(focus,"green"))}</div><h3>Public activity</h3>${missions.length?missions.map(mission=>`<div class="editor-block"><h4>${esc(mission.title)}</h4><p>${esc(mission.purpose)}</p>${statusBadge(mission.verification)}</div>`).join(""):`<div class="empty-state"><h3>No verified public activities have been published yet.</h3><p>You can join the country network, propose a mission, register a school, or become a coordinator.</p>${button("Register a school","route-schools")}</div>`}</div><aside class="panel"><div class="eyebrow">Map & provenance</div><h2 style="font-size:25px">${country.flag||"🌍"} ${esc(country.name)}</h2><div class="detail-side-row"><span>ISO3</span><strong>${esc(country.iso3||"Not set")}</strong></div><div class="detail-side-row"><span>Map latitude</span><strong>${country.lat==null?"Not published":country.lat}</strong></div><div class="detail-side-row"><span>Map longitude</span><strong>${country.lon==null?"Not published":country.lon}</strong></div><div class="detail-side-row"><span>Verification</span><strong>${esc(country.status)}</strong></div><div class="footer-note">Coordinates describe a country-level map center. They do not identify an office, person, or precise project location.</div></aside></section></div>`;
}

function educationView() {
  return `<div><section class="panel education-hero"><div><div class="eyebrow">Know The Change</div><h1>Learn what the mission requires. Prove what you can do.</h1><p class="lede">A public learning catalog, mission-linked pathways, and an AI-assisted studio for authorized instructors and stewards.</p><div style="margin-top:22px;display:flex;flex-wrap:wrap;gap:9px">${button("Browse courses","education-catalog","primary")}${button("Create a course","open-course-studio")}</div></div><div class="learning-orbit"><div class="learning-core">LEARN<br/>TO ACT</div></div></section><div class="tabs"><button class="active">Catalog</button><button data-action="route-learning">My Learning</button><button data-action="open-course-studio">Course Generator</button><button data-action="show-record">Instructors</button><button data-action="show-record">Credentials</button></div><section>${pageHead("Featured pathways","Learning that points somewhere.","Every draft is labeled. Every credential makes its issuer and evidence visible.")}<div class="grid grid-3">${seed.courses.map(courseCard).join("")}</div></section>${publicAdminRecordGrid("Education","Published learning records")}<section class="section">${pageHead("Course generation","Start with an outcome, not a template.","Authorized creators can generate a proposed outline from a topic, mission, document, transcript, or community need. Instructor content is never silently overwritten.")}<div class="panel panel-pad"><div class="form-grid"><div class="field full-width"><label for="course-outcome">What should people be able to do after completing this course?</label><textarea id="course-outcome" placeholder="Example: Facilitate a safe, inclusive peace activity in a Ghanaian school and submit consented evidence for review."></textarea></div><div class="field"><label for="course-source">Generation source</label><select id="course-source"><option>Generate from a Topic</option><option>Generate from a Mission</option><option>Generate from a Project Proposal</option><option>Generate from a Document</option><option>Generate from a Transcript</option><option>Generate from an SDG Target</option><option>Generate from a Community Need</option></select></div><div class="field"><label for="course-context">Country or cultural context</label><input id="course-context" value="Ghana" /></div><div class="field full-width"><label for="course-material">Optional source material</label><input id="course-material" type="file" accept=".pdf,.docx,.txt,.csv,image/*,.mp3,.wav" /><span class="micro-note">PDF, DOCX, TXT, CSV, image, or audio transcript · used as a reviewable input when connected.</span></div></div><div style="display:flex;gap:9px;flex-wrap:wrap">${button(`${icon("spark")} Generate a reviewable outline`,"generate-course","primary")}${button("Open full studio","open-course-studio")}</div><div id="generation-result"></div></div></section><section class="section">${pageHead("All 17 Goals","One network, many entry points.","Browse, filter, and link every mission and course to the SDGs it serves.")}<div class="card-meta" style="gap:8px">${seed.sdgs.map(([id,name,color])=>`<span class="tag" style="color:${color};border-color:${color}55;background:${color}18">${id} · ${name}</span>`).join("")}</div></section></div>`;
}
function courseCard(c) { return `<article class="panel course-card clickable-card" data-action="open-breakdown" data-breakdown-section="education" data-breakdown-id="${esc(c.id)}" tabindex="0" role="button">${tag(c.label,c.label.includes("Draft")?"violet":"coral")}<h3>${esc(c.title)}</h3><p>${esc(c.purpose)}</p><div class="card-meta">${c.sdgs.map(s=>tag(s))}${tag(c.mission,"green")}</div><div class="course-foot"><span>${c.level} · ${c.duration}</span><span class="card-link">View full breakdown ${icon("arrow")}</span></div></article>`; }
function privateCourseCard(c) { return `<article class="panel course-card clickable-card" data-action="open-course" data-id="${esc(c.id)}" tabindex="0" role="button">${tag(c.label||c.status||"Draft","violet")}<h3>${esc(c.title)}</h3><p>${esc(c.purpose||"Private course draft")}</p><div class="card-meta">${(c.sdgs||[]).map(s=>tag(s)).join("")}${tag(c.mission||"Generated course","green")}</div><div class="course-foot"><span>${esc(c.level||"Foundational")} · ${Array.isArray(c.modules)?c.modules.length:0} modules</span><span class="card-link">Open course & classroom ${icon("arrow")}</span></div></article>`; }

function courseCatalog() {
  const courses=[...seed.courses,...(courseRuntime.records||[])];
  if(state.learning.generatedCourse)courses.push(state.learning.generatedCourse);
  return [...new Map(courses.map(course=>[course.id,course])).values()];
}

function courseForId(id) {
  return courseCatalog().find(course=>course.id===id) || seed.courses[0];
}

function classroomDefaults() {
  return {role:"student",activeModule:0,joined:false,live:false,mic:false,camera:false,handRaised:false,attendance:false,chat:[]};
}

function classroomForCourse(courseId) {
  const rooms=state.learning.classrooms||{};
  return {...classroomDefaults(),...(rooms[courseId]||{}),chat:Array.isArray(rooms[courseId]?.chat)?rooms[courseId].chat:[]};
}

function classroomModules(course) {
  const modules=Array.isArray(course.modules)&&course.modules.length?course.modules:["Course overview & learning outcomes","Module 01 · Local context and safety","Module 02 · Practical tools","Module 03 · Field exercise","Module 04 · Evidence and reflection","Module 05 · Applied project"];
  return modules.map((module,index)=>({title:typeof module==="object"?String(module.title||`Module ${index+1}`):String(module),index,objective:typeof module==="object"?module.objective||"":"",activity:typeof module==="object"?module.activity||"":"",check:typeof module==="object"?module.check||"":"",resource:typeof module==="object"?module.resource||"":""}));
}

function courseDetail(id) {
  const c=courseCatalog().find(x=>x.id===id);
  if(!c)return notFoundView("Course record not found","This course may be archived, private, or still being prepared.");
  const enrolled=state.learning.enrolled.includes(c.id); const progress=state.learning.progress[c.id]||0;
  const modules=classroomModules(c);
  return `<div>${button(`${icon("arrow")} Education`,"route-education","text")}<section class="detail-hero"><div><div class="eyebrow">${c.label} · ${c.level}</div><h1>${esc(c.title)}</h1><p class="lede">${esc(c.purpose)}</p><div class="card-meta">${(c.sdgs||[]).map(s=>tag(s))}${tag(c.mission||"Generated course","green")}${tag(c.format||"Cohort or self-paced")}</div><div style="margin-top:25px;display:flex;gap:8px;flex-wrap:wrap">${button(enrolled?"Continue learning":"Enroll in this draft pathway",enrolled?"route-learning":"enroll-course","primary")}${button("Open native classroom","enter-classroom")}</div></div><div class="panel detail-side"><h3>Course record</h3><div class="detail-side-row"><span>Status</span><strong>${esc(c.label||c.status||"Draft")}</strong></div><div class="detail-side-row"><span>Audience</span><strong>${esc(c.audience||"Community learners")}</strong></div><div class="detail-side-row"><span>Credential</span><strong>Certificate of Completion · proposed</strong></div><div class="detail-side-row"><span>Issuer</span><strong>Be The Change · pending review</strong></div></div></section><section class="section detail-layout"><div class="panel"><div class="progress-row"><span>${enrolled?"Your progress":"Preview structure"}</span><strong>${enrolled?progress+"%":"0%"} </strong></div><div class="progress-track"><div class="progress-fill" style="width:${enrolled?progress:0}%"></div></div><h2 style="margin-top:30px">Course structure</h2>${modules.map((module,i)=>`<div class="editor-block"><div style="display:flex;justify-content:space-between;gap:10px"><h4>${esc(module.title)}</h4>${tag(i===0?"Overview":i===3?"Field exercise":"Draft")}</div><p>${esc(module.objective||module.activity||"A reviewable lesson block with local and global examples, practical activity, sources, and knowledge checks.")}</p></div>`).join("")}</div><aside class="panel"><div class="eyebrow">Next mission</div><h2 style="font-size:24px">${esc(c.mission||"Generated course")}</h2><p class="prose">Successful graduates can return to the mission record, offer a skill, and join a team when the steward opens roles.</p>${button("Open linked mission","open-mission","small")}</aside></section></div>`;
}

function classroomView(id) {
  const course=courseForId(id), courseId=course.id, room=classroomForCourse(courseId), modules=classroomModules(course), active=modules[Math.min(room.activeModule,modules.length-1)]||modules[0];
  const chat=room.chat.length?room.chat:[{name:"Classroom guide",role:"Instructor",text:"Welcome. Questions, participation, and progress stay attached to this course workspace."}];
  return `<div class="classroom-page"><div class="classroom-back">${button(`${icon("arrow")} ${esc(course.title)}`,"open-course","text")}</div><section class="classroom-hero panel"><div><div class="eyebrow">Native course classroom · ${room.live?"Live session":"Room ready"}</div><h1>${esc(course.title)}</h1><p class="lede">A shared presentation room for instructors and students, created with this course draft.</p><div class="card-meta">${tag(room.live?"Live locally":"Preview room",room.live?"green":"violet")}${tag(course.format||"Cohort or self-paced")}${tag("Human-led")}</div></div><div class="classroom-hero-side"><div class="classroom-room-code"><span>ROOM</span><strong>${esc(courseId.toUpperCase().slice(0,12))}</strong><small>Local classroom state · provider connection pending</small></div><div class="classroom-role-switch" role="group" aria-label="Choose classroom view"><button class="btn small ${room.role==="student"?"primary":""}" data-action="classroom-role" data-classroom-role="student">Student view</button><button class="btn small ${room.role==="instructor"?"primary":""}" data-action="classroom-role" data-classroom-role="instructor">Instructor view</button></div></div></section><div class="classroom-layout"><aside class="panel classroom-outline"><div class="eyebrow">Course map</div><h2>Session outline</h2><p class="micro-note">Select the block being presented. The same outline is visible to every role.</p><div class="classroom-module-list">${modules.map(module=>`<button class="classroom-module ${module.index===active.index?"active":""}" data-action="classroom-module" data-classroom-module="${module.index}"><span>${String(module.index+1).padStart(2,"0")}</span><strong>${esc(module.title)}</strong>${module.index===active.index?tag("On stage","green"):""}</button>`).join("")}</div><div class="classroom-outline-footer">${button("Back to course","open-course","small")}</div></aside><main class="classroom-main"><section class="panel classroom-stage"><div class="classroom-stage-top"><div><div class="eyebrow">Now presenting · Module ${String(active.index+1).padStart(2,"0")}</div><h2>${esc(active.title)}</h2></div><span class="classroom-live-indicator"><i></i>${room.live?"LIVE SESSION":"READY TO PRESENT"}</span></div><div class="classroom-slide"><div class="classroom-slide-grid"><div><span class="classroom-slide-kicker">${esc(course.title)}</span><h3>${esc(active.title)}</h3><p>${active.index===0?esc(course.purpose):"Work through this learning block with a local example, a practical activity, and a short reflection."}</p></div><div class="classroom-slide-number">${String(active.index+1).padStart(2,"0")}<small>/ ${String(modules.length).padStart(2,"0")}</small></div></div><div class="classroom-slide-prompt"><strong>Participation prompt</strong><span>${active.index===3?"Prepare the field exercise and confirm consent, accessibility, and safeguarding steps.":"Add a question or reflection in the room chat before moving to the next block."}</span></div></div><div class="classroom-controls">${room.role==="instructor"?button(room.live?"End local session":"Start local session",room.live?"classroom-end":"classroom-start",room.live?"danger":"primary"):button(room.joined?"Joined classroom":"Join classroom","classroom-join",room.joined?"":"primary")}${button(room.mic?"Mute mic":"Enable mic","classroom-toggle","small")}${button(room.camera?"Stop camera":"Enable camera","classroom-toggle","small")}${room.role==="student"?button(room.handRaised?"Lower hand":"Raise hand","classroom-hand","small"):button("Mark attendance","classroom-attendance","small")}</div><div class="classroom-connection-note">This classroom is native to the course. Video, audio, and realtime transport are prepared as a connection boundary; this build keeps a safe local presentation mode until a provider is configured.</div></section><div class="classroom-lower-grid"><section class="panel classroom-chat"><div class="classroom-panel-head"><div><div class="eyebrow">Room chat</div><h2>Questions & reflections</h2></div>${tag(`${chat.length} messages`,"violet")}</div><div class="classroom-chat-list">${chat.map(message=>`<div class="classroom-message"><div class="classroom-avatar">${esc(String(message.name||"C").slice(0,1).toUpperCase())}</div><div><strong>${esc(message.name||"Participant")} <small>${esc(message.role||"Student")}</small></strong><p>${esc(message.text||"")}</p></div></div>`).join("")}</div><div class="classroom-chat-compose"><input id="classroom-chat-input" placeholder="Ask a question or share a reflection…" aria-label="Message the classroom" />${button("Send","classroom-chat-send","primary small")}</div></section><section class="panel classroom-people"><div class="classroom-panel-head"><div><div class="eyebrow">People in this room</div><h2>Participation</h2></div>${tag(room.attendance?"Attendance marked":"Attendance open",room.attendance?"green":"violet")}</div><div class="classroom-person"><span class="classroom-avatar">Y</span><div><strong>You</strong><small>${room.role==="instructor"?"Instructor":"Student"} · ${room.joined?"Joined":"Not joined"}</small></div><span class="classroom-presence ${room.joined?"present":"away"}"></span></div><div class="classroom-person"><span class="classroom-avatar muted">I</span><div><strong>Instructor workspace</strong><small>${room.live?"Presenting now":"Ready for an instructor"}</small></div><span class="classroom-presence ${room.live?"present":"away"}"></span></div>${room.role==="instructor"?`<div class="classroom-instructor-note"><strong>Instructor controls</strong><p>Present modules, mark attendance, and keep source, safety, and review notes visible before publishing.</p></div>`:`<div class="classroom-instructor-note"><strong>Learner controls</strong><p>Join the room, ask questions, raise your hand, and mark your current module complete locally.</p>${button(room.attendance?"Module marked complete":"Mark module complete","classroom-complete-module","small")}</div>`}</section></div></main></div></div>`;
}

function studioDraft() {
  const existing=state.learning.generatedCourse;
  if(existing)return {...existing,modules:(existing.modules||[]).map(normaliseCourseModule),assessment:normaliseCourseAssessment(existing.assessment),review:{sources:false,safeguarding:false,accessibility:false,cultural:false,instructor:false,status:"Draft",...(existing.review||{})}};
  return {id:`studio-draft-${Date.now().toString(36)}`,title:"",purpose:"",audience:"Community learners and mission participants",level:"Foundational",duration:"5 modules · draft",format:"Cohort or self-paced",countryContext:"Ghana",language:"English",prerequisites:"",modules:["Local context, consent, and safeguarding","Dialogue and inclusive facilitation","Design a practical peace activity","Collect ethical evidence","Reflect, review, and apply"].map(normaliseCourseModule),assessment:normaliseCourseAssessment({}),safetyNote:"Add local safeguarding contacts and review with a qualified steward.",evidenceTask:"Submit a consented field record and reflection for review.",accessibilityNotes:"Use plain language, captions or transcripts, low-bandwidth materials, and multiple ways to participate.",sourceNotes:"Add local sources, contributors, and last-reviewed dates before approval.",review:{sources:false,safeguarding:false,accessibility:false,cultural:false,instructor:false,status:"Draft"},label:"Draft—Requires Review",sdgs:["SDG 16","SDG 17"],mission:"Generated course",access:"Private draft"};
}
function studioField(id, label, value, options={}) {
  const control=options.select?`<select id="${id}" data-studio-field="${id}">${options.select.map(item=>`<option value="${esc(item)}" ${String(value)===String(item)?"selected":""}>${esc(item)}</option>`).join("")}</select>`:options.textarea?`<textarea id="${id}" data-studio-field="${id}" rows="${options.rows||4}" placeholder="${esc(options.placeholder||"")}">${esc(value||"")}</textarea>`:`<input id="${id}" data-studio-field="${id}" value="${esc(value||"")}" placeholder="${esc(options.placeholder||"")}" ${options.type?`type="${options.type}"`:""} />`;
  return `<label class="studio-field ${options.full!==false?"":"studio-field-compact"}"><span>${esc(label)}</span>${control}</label>`;
}
function studioSelectedModule(draft) {
  const index=Math.max(0,Math.min((draft.modules||[]).length-1,Number(studioRuntime.activeModule)||0));
  studioRuntime.activeModule=index;
  return {module:draft.modules[index]||normaliseCourseModule({},index),index};
}
function studioReviewItems(draft) {
  return [["sources","Source notes and claims reviewed"],["safeguarding","Safeguarding and consent reviewed"],["accessibility","Accessibility and low-bandwidth plan reviewed"],["cultural","Cultural context reviewed by a local contributor"],["instructor","Instructor approves the learning design"]].map(([key,label])=>({key,label,checked:Boolean(draft.review?.[key])}));
}
function studioValidation(draft) {
  const missing=[];
  if(!draft.title.trim())missing.push("Course title");
  if(!draft.purpose.trim())missing.push("Course purpose and outcomes");
  if((draft.modules||[]).filter(module=>module.title.trim()).length<3)missing.push("At least 3 modules");
  if(!draft.assessment?.method?.trim())missing.push("Assessment method");
  if(!draft.safetyNote.trim())missing.push("Safeguarding note");
  if(!draft.evidenceTask.trim())missing.push("Evidence task");
  for(const item of studioReviewItems(draft))if(!item.checked)missing.push(item.label);
  return missing;
}
function studioView() {
  const draft=studioDraft(), {module,index}=studioSelectedModule(draft), review=studioReviewItems(draft), active=studioRuntime.activeBlock;
  const blocks=[{id:"overview",label:"Course overview",meta:"Title, audience, purpose"},...draft.modules.map((item,i)=>({id:`module-${i}`,label:`Module ${String(i+1).padStart(2,"0")} · ${item.title||"Untitled"}`,meta:item.objective||"Learning block"})),{id:"assessment",label:"Assessment & evidence",meta:"Rubric, quiz, field proof"},{id:"review",label:"Review gate",meta:"Sources, safety, accessibility"}];
  let editor="";
  if(active==="overview")editor=`<div class="studio-editor-head"><div><div class="eyebrow">Step 01 · course identity</div><h2>Define the learning promise</h2><p>Give instructors, learners, and reviewers the context they need before they open the first module.</p></div>${tag("Editable draft","violet")}</div><div class="studio-form-grid">${studioField("studio-course-title","Course title",draft.title,{placeholder:"A clear, learner-facing title"})}${studioField("studio-course-audience","Primary learners",draft.audience,{placeholder:"Who is this for?"})}${studioField("studio-course-level","Level",draft.level,{select:["Foundational","Intermediate","Advanced"]})}${studioField("studio-course-duration","Estimated duration",draft.duration,{placeholder:"e.g. 5 weeks · 12 hours"})}${studioField("studio-course-format","Delivery format",draft.format,{select:["Cohort or self-paced","Instructor-led cohort","Self-paced","Hybrid"]})}${studioField("studio-course-language","Language",draft.language,{placeholder:"English, French, Twi…"})}${studioField("studio-course-context","Country / cultural context",draft.countryContext,{placeholder:"Country, community, or context"})}${studioField("studio-course-prerequisites","Prerequisites",draft.prerequisites,{placeholder:"What should learners know first?"})}<div class="studio-field studio-field-wide"><span>Purpose and observable outcomes</span><textarea id="studio-course-purpose" data-studio-field="studio-course-purpose" rows="6" placeholder="By the end, learners will be able to…">${esc(draft.purpose)}</textarea></div></div>`;
  else if(active.startsWith("module-"))editor=`<div class="studio-editor-head"><div><div class="eyebrow">Step 02 · module ${String(index+1).padStart(2,"0")}</div><h2>${esc(module.title||"Untitled module")}</h2><p>Each block should tell an instructor what to present, what learners will do, and how understanding will be checked.</p></div>${button("Remove module","studio-remove-module","small")}</div><div class="studio-form-grid"><div class="studio-field studio-field-wide"><span>Module title</span><input id="studio-module-title" data-studio-field="studio-module-title" value="${esc(module.title)}" placeholder="Module title" /></div><div class="studio-field studio-field-wide"><span>Learning objective</span><textarea id="studio-module-objective" data-studio-field="studio-module-objective" rows="4" placeholder="Learners will be able to…">${esc(module.objective)}</textarea></div><div class="studio-field studio-field-wide"><span>Instructor activity / presentation notes</span><textarea id="studio-module-activity" data-studio-field="studio-module-activity" rows="6" placeholder="Case study, discussion, demonstration, field activity…">${esc(module.activity)}</textarea></div>${studioField("studio-module-check","Knowledge check / completion evidence",module.check,{textarea:true,rows:4,full:true,placeholder:"Question, observation, or practical artifact"})}${studioField("studio-module-resource","Source or resource",module.resource,{textarea:true,rows:3,full:true,placeholder:"Reading, transcript, workbook, local source…"})}</div>`;
  else if(active==="assessment")editor=`<div class="studio-editor-head"><div><div class="eyebrow">Step 03 · assessment and evidence</div><h2>Make completion meaningful</h2><p>Separate learning checks from credential claims. A reviewer should be able to see how evidence is judged.</p></div>${tag("Review required","coral")}</div><div class="studio-form-grid">${studioField("studio-assessment-method","Assessment method",draft.assessment.method,{textarea:true,rows:3,full:true,placeholder:"e.g. practical demonstration plus reflection"})}${studioField("studio-assessment-questions","Quiz / reflection questions",(draft.assessment.questions||[]).join("\n"),{textarea:true,rows:6,full:true,placeholder:"One question per line"})}${studioField("studio-assessment-rubric","Rubric and reviewer guidance",draft.assessment.rubric,{textarea:true,rows:6,full:true,placeholder:"What counts as safe, clear, inclusive, and evidenced?"})}${studioField("studio-assessment-score","Passing / completion rule",draft.assessment.passingScore,{placeholder:"e.g. Instructor review · no automatic pass"})}${studioField("studio-evidence-task","Evidence task",draft.evidenceTask,{textarea:true,rows:5,full:true,placeholder:"What should learners submit, and what consent applies?"})}</div>`;
  else editor=`<div class="studio-editor-head"><div><div class="eyebrow">Step 04 · release gate</div><h2>Review before approval</h2><p>These checks keep generated content accountable. Approval is explicit and does not imply accreditation or endorsement.</p></div>${tag(`${review.filter(item=>item.checked).length}/${review.length} checks complete`,review.every(item=>item.checked)?"green":"violet")}</div><div class="studio-checklist">${review.map(item=>`<label class="studio-review-item"><input type="checkbox" data-studio-review="${item.key}" ${item.checked?"checked":""} /><span><strong>${esc(item.label)}</strong><small>Keep the reviewer decision attached to this draft.</small></span></label>`).join("")}</div><div class="studio-form-grid studio-review-fields">${studioField("studio-safety-note","Safeguarding, consent, and risk note",draft.safetyNote,{textarea:true,rows:5,full:true,placeholder:"Local contacts, boundaries, consent, escalation, and youth-safe practice"})}${studioField("studio-accessibility","Accessibility and inclusion notes",draft.accessibilityNotes,{textarea:true,rows:5,full:true,placeholder:"Captions, transcripts, language, bandwidth, disability access, alternatives"})}${studioField("studio-sources","Sources, contributors, and review dates",draft.sourceNotes,{textarea:true,rows:5,full:true,placeholder:"Citations, local contributors, source links, last-reviewed dates"})}</div>`;
  const suggestion=studioRuntime.pendingSuggestion;
  return `<div>${button(`${icon("arrow")} Education`,"route-education","text")}<section class="section-head studio-topbar"><div><div class="eyebrow">Authorized creator workspace · version ${esc(String(draft.currentVersion||1))}</div><h1 class="section-title">Course generation studio</h1><p class="section-copy">Author, review, and hand off a course to its native classroom. AI suggestions stay proposals until an instructor applies them.</p></div><div class="studio-status">${tag(draft.review?.status||"Draft",draft.review?.status==="Requires Review"?"gold":"violet")}<small>Local autosave · ${studioRuntime.feedback||"Ready"}</small></div></section><div class="studio"><aside class="panel studio-panel outline-panel"><div class="studio-panel-heading"><div><div class="eyebrow">Course outline</div><h3>${esc(draft.title||"Untitled draft")}</h3></div>${tag(`${draft.modules.length} modules`,"violet")}</div><div class="studio-outline-list">${blocks.map(block=>`<button class="studio-outline-item ${active===block.id?"active":""}" data-action="studio-select-block" data-studio-block="${block.id}"><span>${block.id==="overview"?"00":block.id==="assessment"?"A":block.id==="review"?"R":String(Number(block.id.split("-")[1])+1).padStart(2,"0")}</span><strong>${esc(block.label)}</strong><small>${esc(block.meta)}</small></button>`).join("")}</div><button class="btn small full" data-action="studio-add-module" style="margin-top:12px">${icon("plus")} Add module</button><div class="studio-outline-note">Modules become classroom presentation stages automatically.</div></aside><main class="panel studio-panel editor-panel">${editor}<div class="studio-editor-actions">${button("Save draft","studio-save-draft","small")}${button("Learner preview","preview-course","small")}${button("Submit for approval","submit-course","primary small")}</div></main><aside class="panel studio-panel ai-assistant"><div class="assistant-mark">${icon("spark")}</div><h3>AI co-designer</h3><p class="prose" style="font-size:11px">Choose a proposal for the active block. Nothing is published or applied automatically.</p>${["Expand this block","Localize for Ghana","Add a field exercise","Check accessibility","Generate quiz","Create learner workbook"].map(x=>`<button class="btn small full" style="margin-top:7px;justify-content:flex-start" data-action="ai-suggest" data-suggestion="${x}">${x}</button>`).join("")}${suggestion?`<div class="studio-suggestion"><div class="eyebrow">Proposal · ${esc(suggestion.kind)}</div><p>${esc(suggestion.value||"Preparing a reviewable suggestion…")}</p>${suggestion.value?`<div class="studio-suggestion-actions">${button("Apply proposal","studio-apply-suggestion","small primary")}${button("Dismiss","studio-dismiss-suggestion","small")}</div>`:`<div class="micro-note">Generating a reviewable proposal…</div>`}</div>`:""}<div class="assistant-tip">Human review required · sources, accessibility, safeguarding, cultural context, and assessment remain visible.</div></aside></div></div>`;
}

function studioReadFromDom() {
  const current=studioDraft(), next={...current,modules:(current.modules||[]).map(normaliseCourseModule),review:{...current.review}};
  const read=id=>document.getElementById(id)?.value?.trim()??null;
  const assign=(key,id)=>{const value=read(id);if(value!==null)next[key]=value;};
  assign("title","studio-course-title"); assign("purpose","studio-course-purpose"); assign("audience","studio-course-audience"); assign("level","studio-course-level"); assign("duration","studio-course-duration"); assign("format","studio-course-format"); assign("language","studio-course-language"); assign("countryContext","studio-course-context"); assign("prerequisites","studio-course-prerequisites"); assign("safetyNote","studio-safety-note"); assign("accessibilityNotes","studio-accessibility"); assign("sourceNotes","studio-sources"); assign("evidenceTask","studio-evidence-task");
  const moduleFields=["studio-module-title","studio-module-objective","studio-module-activity","studio-module-check","studio-module-resource"].some(id=>document.getElementById(id));
  if(moduleFields){const {index}=studioSelectedModule(next), module={...next.modules[index]};["title","objective","activity","check","resource"].forEach(key=>{const value=read(`studio-module-${key}`);if(value!==null)module[key]=value;});next.modules[index]=normaliseCourseModule(module,index);}
  const method=read("studio-assessment-method"); if(method!==null)next.assessment={...normaliseCourseAssessment(next.assessment),method};
  const questions=read("studio-assessment-questions"); if(questions!==null)next.assessment.questions=questions.split(/\n+/).map(item=>item.trim()).filter(Boolean).slice(0,12);
  const rubric=read("studio-assessment-rubric"); if(rubric!==null)next.assessment.rubric=rubric;
  const passing=read("studio-assessment-score"); if(passing!==null)next.assessment.passingScore=passing;
  document.querySelectorAll("[data-studio-review]").forEach(input=>{next.review[input.dataset.studioReview]=Boolean(input.checked);});
  state.learning.generatedCourse=next; state.learning.studioGenerated=true; persist(); return next;
}
function studioEnsureState() { return state.learning.generatedCourse||studioReadFromDom(); }
function studioScheduleAutosave() {
  clearTimeout(studioRuntime.autosaveTimer);
  studioRuntime.feedback="Unsaved changes";
  studioRuntime.autosaveTimer=window.setTimeout(()=>{studioReadFromDom();studioRuntime.feedback="Saved locally";},450);
}
function studioFallbackSuggestion(kind, draft, module) {
  const context=draft.countryContext||"the local context";
  if(kind==="Expand this block")return {target:"module.activity",value:`Facilitate a short ${context} case discussion, invite two learner perspectives, and close with a practical reflection connected to the module objective.`};
  if(kind==="Localize for Ghana")return {target:"module.activity",value:`Add a Ghana-informed example only after local review: name the community perspective, avoid generalizing, and invite learners to compare the example with their own context.`};
  if(kind==="Add a field exercise")return {target:"module.activity",value:`Field exercise proposal: observe or co-design one safe local action, record only consented non-sensitive evidence, and debrief what changed, what was uncertain, and what a steward should review.`};
  if(kind==="Check accessibility")return {target:"accessibilityNotes",value:"Provide captions or transcripts, plain-language instructions, low-bandwidth downloads, readable contrast, keyboard access, and an equivalent non-public participation option."};
  if(kind==="Generate quiz")return {target:"assessment.questions",value:`What is one safe action you can take in ${context}?\nWhich evidence requires consent before it is shared?\nWhat would you ask a local steward before adapting this practice?`};
  return {target:"sourceNotes",value:"Learner workbook proposal: include the purpose, module objectives, key terms, activity instructions, reflection prompts, source list, consent reminder, and a page for reviewer notes."};
}
async function requestStudioSuggestion(kind) {
  const draft=studioReadFromDom(), {module}=studioSelectedModule(draft);
  studioRuntime.pendingSuggestion={kind,value:"",target:""}; render();
  let proposal=null;
  try{
    if(window.websim?.chat?.completions?.create){
      const completion=await window.websim.chat.completions.create({messages:[{role:"system",content:"You are a learning design co-pilot. Return JSON only with keys target and proposal. Make a short, editable proposal. Never invent accreditation, endorsement, personal data, or local facts. Keep safety, consent, accessibility, and cultural review visible."},{role:"user",content:`Create a reviewable proposal for “${kind}”. Course: ${draft.title||"Untitled"}. Context: ${draft.countryContext||"not set"}. Active module: ${module.title}. Existing activity: ${module.activity}. Existing accessibility notes: ${draft.accessibilityNotes}.`}],json:true});
      const parsed=JSON.parse(completion.content||"{}"); if(parsed.proposal)proposal={target:String(parsed.target||"module.activity"),value:String(parsed.proposal).slice(0,1400)};
    }
  }catch(error){console.warn("Studio suggestion unavailable; using local proposal.",{name:error?.name||"provider_error"});}
  const fallback=studioFallbackSuggestion(kind,draft,module);
  studioRuntime.pendingSuggestion={kind,target:proposal?.target||fallback.target,value:proposal?.value||fallback.value}; render();
}
function applyStudioSuggestion() {
  const suggestion=studioRuntime.pendingSuggestion; if(!suggestion?.value)return;
  const draft=studioReadFromDom(), {index}=studioSelectedModule(draft), module={...draft.modules[index]};
  if(suggestion.target==="accessibilityNotes")draft.accessibilityNotes=suggestion.value;
  else if(suggestion.target==="assessment.questions")draft.assessment={...draft.assessment,questions:suggestion.value.split(/\n+/).map(item=>item.trim()).filter(Boolean).slice(0,12)};
  else if(suggestion.target==="sourceNotes")draft.sourceNotes=`${draft.sourceNotes}\n\n${suggestion.value}`.trim();
  else {module.activity=`${module.activity?`${module.activity}\n\n`:""}${suggestion.value}`.slice(0,1000);draft.modules[index]=normaliseCourseModule(module,index);}
  state.learning.generatedCourse=draft;persist();studioRuntime.pendingSuggestion=null;studioRuntime.feedback="Proposal applied locally";render();
}
async function saveStudioDraft() {
  const draft=studioReadFromDom(); studioRuntime.feedback="Saving…"; render();
  const result=await saveGeneratedCourse(draft);
  if(result.ok){state.learning.generatedCourse={...draft,...result.course,modules:draft.modules};studioRuntime.feedback="Saved to account";persist();}
  else studioRuntime.feedback=result.local?"Saved locally":"Account sync unavailable";
  render(); showToast(result.ok?"Course draft saved":"Course draft saved locally",result.ok?"The current version is available to your account and classroom.":"Sign in to synchronize this draft with the course library.");
}

function profileView() {
  const p=state.passport; const name=p.name||"Your Change Passport";
  return `<div><section class="passport-shell"><aside class="panel passport-nav"><div class="avatar">${esc((p.name||"Y").slice(0,1).toUpperCase())}</div><div><h3>${esc(name)}</h3><p>${p.country||"Country not set"} · private profile</p>${p.slug?`<span class="profile-slug">/${esc(p.slug)}</span>`:""}</div><button class="passport-link active">Overview</button><button class="passport-link" data-action="edit-passport">Edit passport</button><button class="passport-link" data-action="show-record">Privacy & consent</button><button class="passport-link" data-action="route-learning">My learning</button>${firebaseConfigured?`<button class="passport-link" data-action="route-login">${accountUser()?"Account & sign out":"Sign in with Google"}</button>`:""}</aside><div><div class="panel profile-overview"><div><div class="eyebrow">We The Change · member profile</div><h1 class="section-title">${p.started?"Your next move is waiting.":"Create your Change Passport."}</h1><p class="section-copy">${p.started?"A private profile that helps match your skills to missions and courses. You approve every extracted skill before it becomes a claim.":"Progressive onboarding for skills, causes, availability, and safe participation. Start small; add detail when you’re ready."}</p><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:22px">${button(p.started?"Edit your passport":"Start your passport","edit-passport","primary")}${button("Shareable view","show-record")}</div></div><div class="completion"><div class="eyebrow">Profile completion</div><strong>${p.started?p.completion:18}%</strong><div class="progress-track"><div class="progress-fill" style="width:${p.started?p.completion:18}%"></div></div><div class="micro-note" style="margin-top:9px">Private fields stay private</div></div></div><section class="section"><div class="grid grid-2"><div class="panel panel-pad"><div class="eyebrow">Recommendations</div><h2 class="section-title" style="font-size:25px">Start with a reason.</h2><p class="section-copy">Recommendations will explain the match, never make sensitive assumptions.</p><div class="grid" style="margin-top:17px"><div class="panel-soft recommend-card">${tag("Mission","green")}<div><h4>Peace in Action · Ghana</h4><p>Needs facilitation, event production, and evidence collection.</p></div></div><div class="panel-soft recommend-card">${tag("Course","violet")}<div><h4>Evidence & Impact Verification</h4><p>Build the skills to submit a trusted field record.</p></div></div></div></div><div class="panel panel-pad"><div class="eyebrow">Impact portfolio</div><h2 class="section-title" style="font-size:25px">Your contributions</h2><div class="stat-list" style="margin-top:20px"><div class="stat-row"><span>Missions joined</span><strong>${p.joined.length}</strong></div><div class="stat-row"><span>Verified skills</span><strong>0</strong></div><div class="stat-row"><span>Evidence submitted</span><strong>0</strong></div><div class="stat-row"><span>Credentials</span><strong>0</strong></div></div><div class="footer-note">No contribution is marked verified until an authorized reviewer approves evidence.</div></div></div></section></div></section></div>`;
}
function myMapWorkspaceView() {
  const items=mapRuntime.savedItems, views=mapRuntime.savedViews, drafts=mapRuntime.draftCheckIns, submitted=mapRuntime.myCheckIns;
  const draftMeta=draft=>{const pending=mapRuntime.pendingSync.find(item=>item.localId===draft.localId);return pending?`${pending.syncStatus} · ${pending.lastError?.includes("401")?"sign in to submit":pending.lastError||"waiting for connection"}`:"Private draft · on this device";};
  const row=(title,meta,action,id,extraAction,removeAction)=>`<div class="map-workspace-row"><span><strong>${esc(title)}</strong><small>${esc(meta)}</small></span><div class="map-workspace-actions"><button class="btn small" data-action="${action}" data-map-item="${esc(id)}">Open</button>${extraAction?`<button class="btn small" data-action="${extraAction}" data-map-item="${esc(id)}">Edit</button>`:""}${removeAction?`<button class="btn small" data-action="${removeAction}" data-map-item="${esc(id)}">Remove</button>`:""}</div></div>`;
  return `<div class="my-map-workspace"><section class="my-map-hero panel"><div><div class="eyebrow">Private workspace</div><h1 class="section-title">My Map</h1><p class="lede">Your saved places, views, personal layers, and field check-ins.</p><div class="my-map-actions">${button("Open Global Map","map-open","primary")}${button("Add personal place","map-add-personal")}${mapRuntime.pendingSync.length?button("Sync pending","map-sync-drafts"):""}</div></div><div class="my-map-orbit">☆<small>PRIVATE BY DEFAULT</small></div></section><div class="my-map-grid"><section class="panel panel-pad"><h2>Saved places <small>${items.length}</small></h2>${items.length?items.map(item=>row(item.payload?.record?.name||item.payload?.name||item.recordId||"Saved record",`${item.collection||"Saved Places"}${item.note?` · ${item.note}`:""}`,"map-open-saved-item",item.localId,"map-edit-note","map-remove-saved")).join(""):`<p>No saved places yet. Save a record from the map or add a private place.</p>`}</section><section class="panel panel-pad"><h2>Saved views <small>${views.length}</small></h2>${views.length?views.map(view=>row(view.name||"Map view",view.payload?.country||"Global map","map-restore-view",view.localId,null,"map-remove-view")).join(""):`<p>Save a camera and filter view from the map to return to it later.</p>`}</section><section class="panel panel-pad"><h2>Check-ins <small>${drafts.length+submitted.length}</small></h2>${drafts.map(draft=>row(draft.recordName||"Check-in draft",draftMeta(draft),"map-edit-draft",draft.localId,null,"map-discard-draft")).join("")}${submitted.map(item=>row(item.status_text||"Check-in",`${item.moderation_status} · ${new Date(item.timestamp).toLocaleDateString()}`,"map-open-submitted",item.id)).join("")}${!drafts.length&&!submitted.length?`<p>No check-ins yet. Open a place or event on the map to start one.</p>`:""}</section><section class="panel panel-pad"><h2>Personal layers <small>${mapRuntime.customLayers.length}</small></h2>${mapRuntime.customLayers.map(layer=>row(layer.name||"Imported layer",`${layer.payload?.features?.length||0} features · private on this device`,"map-open-layer",layer.localId,null,"map-remove-layer")).join("")}${!mapRuntime.customLayers.length?`<p>Import GeoJSON from the Layers panel to add a private overlay.</p>`:""}</section></div>${mapRuntime.proposals.length?`<section class="panel panel-pad"><h2>Proposed public places</h2>${mapRuntime.proposals.map(item=>`<div class="map-workspace-row"><span><strong>${esc(item.name)}</strong><small>${esc(item.country_iso3)} · ${esc(item.status)}</small></span>${item.status==="Needs Changes"?`<button class="btn small primary" data-action="map-edit-proposal" data-map-item="${esc(item.id)}">Edit</button>`:""}${item.status!=="Approved"?`<button class="btn small" data-action="map-withdraw-proposal" data-map-item="${esc(item.id)}">Withdraw</button>`:""}</div>`).join("")}</section>`:""}</div>`;
}
function pwaSettingsMarkup() {
  return `<section class="section panel panel-pad app-offline-settings"><div class="eyebrow">Settings</div><h2 class="section-title" style="font-size:25px">App and Offline</h2><p class="section-copy">Keep safe drafts and downloaded learning close at hand without making installation or push notifications required.</p><div class="app-status-grid"><div><span>Installation</span><strong>${window.__btcPwa?.isStandalone?"App Installed":"Browser mode"}</strong></div><div><span>Connection</span><strong>${navigator.onLine?"Online":"Offline"}</strong></div><div><span>Service worker</span><strong>${"serviceWorker" in navigator?"Supported":"Unavailable"}</strong></div><div><span>Offline storage</span><strong>Local drafts · available</strong></div></div><div class="app-offline-actions">${button("Install App","pwa-install-settings","primary")}${button("Downloaded Courses","route-education")}${button("Saved Missions","route-missions")}${button("Clear offline content","pwa-clear-offline")}</div><div class="footer-note">Push notifications are opt-in and nonessential. Private account, admin, payment, and verification data stays network-first.</div></section><section class="section panel panel-pad wa-preferences-card"><div class="eyebrow">Account → Communication Preferences</div><h2 class="section-title" style="font-size:25px">WhatsApp</h2><p class="section-copy">Add an optional WhatsApp number for onboarding and requested updates. A supplied number is not treated as connected until a real provider event confirms it.</p>${renderWhatsAppPhoneField("preferences",whatsappProfileForField(whatsappProfileRuntime.profile))}<div class="wa-preferences-actions">${button("Save WhatsApp preferences","save-wa-preferences","primary")}${button("Connect through WhatsApp","wa-create-connection-code")}${button("Disconnect","wa-disconnect")}${button("Request export","wa-request-export")}${button("Request deletion","wa-request-deletion")}<span class="form-feedback" data-wa-preferences-feedback role="status">${esc(whatsappProfileRuntime.error||"")}</span></div></section>`;
}

function joinView() {
  const p=state.passport,d=state.drafts.passport||{},displayName=d.display_name??p.name,slug=d.slug??p.slug;
  const location={
    continent:d.continent??(p.started?p.continent:""),
    country:d.country??(p.started?p.country:""),
    city:d.city??(p.started?p.city:""),
  };
  return `<div><section class="detail-hero"><div><div class="eyebrow">Join · We The Change</div><h1>Bring one useful thing.</h1><p class="lede">Create a Change Passport, choose what you want to offer, and let the network show you a next step.</p><div class="card-meta">${tag("Youth-safe by design","green")}${tag("Progressive onboarding","violet")}${tag("You control visibility")}</div></div><div class="panel detail-side"><h3>What you can do next</h3>${["Use your skills","Join a mission","Take a course","Find a country chapter","Register a school or team"].map((x,i)=>`<div class="detail-side-row"><span>0${i+1}</span><strong>${x}</strong></div>`).join("")}</div></section><section class="section panel panel-pad"><div class="eyebrow">Step 01 · start small</div><h2 class="section-title" style="font-size:31px">Set up your profile</h2><p class="section-copy">Start with a display name. A profile slug is optional, and you can add skills and more details later.</p><div class="form-grid" style="margin-top:25px"><div class="field"><label for="join-display">Display name</label><input id="join-display" value="${esc(displayName)}" placeholder="Your name or chosen name" /></div><div class="field"><label for="join-slug">Profile slug <span class="optional-label">optional</span> ${p.slug?"(locked)":""}</label><input id="join-slug" data-profile-slug="join" value="${esc(slug)}" placeholder="e.g. ama-boateng" maxlength="40" ${p.slug?"readonly":""} /><span class="micro-note" data-profile-slug-status>${p.slug?`Reserved as ${esc(p.slug)}`:"Lowercase letters, numbers, and hyphens · checked when you type"}</span></div>${profileLocationFields("join",location)}<div class="field full-width"><label for="join-bio">What would you like to contribute? <span class="optional-label">optional</span></label><textarea id="join-bio" placeholder="A skill, interest, experience, or question.">${esc(d.bio??p.bio)}</textarea></div></div><div style="display:flex;justify-content:space-between;gap:14px;align-items:center;flex-wrap:wrap"><span class="micro-note">Your draft is saved in this browser as you type. Sign in to sync it and reserve a profile slug.</span>${button("Save profile and continue","save-join","primary")}</div></section></div>`;
}

function eventsView() {
  const events=eventRecordsForUi();
  return `<div><section class="events-hero"><div><div class="eyebrow">Events · public calendar layer</div><h1>Gather where the work is alive.</h1><p class="lede">Find a shared moment, host a safe activity, and connect what happens in the real world to a public event record with a source, organizer, place, and status.</p><div class="events-hero-actions">${button("Register an event","open-peace-form","primary")}<a class="btn" href="/api/events/georss" target="_blank" rel="noreferrer">Open GeoRSS feed ${icon("arrow")}</a></div><div class="events-hero-meta"><span><strong>${events.length}</strong> events in view</span><span><i></i>${eventRuntime.loading?"Syncing GeoRSS":"GeoRSS ready"}</span><span>moderation first</span></div></div><div class="events-hero-art" aria-hidden="true"><span class="event-orbit orbit-one"></span><span class="event-orbit orbit-two"></span><span class="event-orbit orbit-three"></span><span class="event-core">EVENT<br/><small>→ EVIDENCE</small></span></div></section><div class="toolbar"><div class="search-box">${icon("search")}<input placeholder="Search events…" /></div><select class="filter-select"><option>All formats</option><option>Campaign</option><option>Workshop</option><option>School event</option><option>Sports event</option></select><button class="btn primary small" data-action="open-peace-form">${icon("plus")} Register event</button></div><div class="grid">${events.map(e=>{const live=eventRuntime.records.some(record=>record.id===e.id);return `<article class="panel list-card clickable-card" data-action="${live?"open-public-record":"open-breakdown"}" data-${live?"public-record-id":"breakdown-section"}="${live?esc(e.id):"events"}" ${live?"":"data-breakdown-id=\""+esc(e.id)+"\""} tabindex="0" role="button"><div class="list-card-main">${tag(e.type||"Community event","gold")}<h3>${esc(e.title)}</h3><p>${esc(e.location||"Location to be confirmed")} · ${esc(e.date||"Date to be confirmed")}</p><div class="card-meta">${statusBadge(e.status||"Published")}${e.country?countryTag(e.country,"green"):""}</div></div><div class="list-card-side">${icon("calendar")}<br/><span class="card-link">Open event record ${icon("arrow")}</span></div></article>`;}).join("")}</div></div>`;
}

function impactView() {
  const f=impactRuntime.filters,claims=impactFilteredClaims(),countries=[...new Set(impactRuntime.claims.map(item=>item.country_iso3).filter(Boolean))].sort();
  const filtered=impactRuntime.error?`<div class="empty-state impact-empty"><h3>Claim register unavailable.</h3><p>${esc(impactRuntime.error)}</p><button class="btn primary" data-action="impact-refresh">Try again</button></div>`:!impactRuntime.loaded?`<div class="empty-state impact-empty"><h3>Loading reviewed claims…</h3></div>`:claims.length?claims.map(claim=>`<button class="panel impact-claim-card" data-action="impact-open-claim" data-impact-id="${esc(claim.id)}"><span class="impact-claim-top">${tag(claim.status,claim.status==="Corrected"?"gold":"green")}<small>${esc(claim.claim_type)} · ${esc(claim.sdg?claim.sdg+" · project measure":"Project measure")}</small></span><strong>${esc(claim.title)}</strong><span class="impact-claim-value">${Number(claim.value).toLocaleString()} <small>${esc(claim.unit)}</small></span><span class="impact-claim-meta">${esc(claim.country_iso3||"Global")} · ${esc(claim.period_start)} to ${esc(claim.period_end)} · ${esc(claim.source_name)}</span><span class="card-link">Inspect the evidence ${icon("arrow")}</span></button>`).join(""):`<div class="empty-state impact-empty"><h3>${impactRuntime.claims.length?"No claims match these filters.":"No reviewed claims have been published yet."}</h3><p>${impactRuntime.claims.length?"Change a filter to explore the published claims.":"Contributors can submit evidence. A steward must review evidence and publish a measured claim before a result appears here."}</p>${button("Submit evidence","open-evidence-form","primary")}</div>`;
  const mine=!impactRuntime.loaded?`<div class="empty-state"><h3>Loading your evidence…</h3></div>`:impactRuntime.mineError?`<div class="empty-state"><h3>Evidence unavailable.</h3><p>${esc(impactRuntime.mineError)}</p><button class="btn primary" data-action="impact-refresh">Try again</button></div>`:impactRuntime.signedIn?`<div class="impact-my-list">${impactRuntime.mine.length?impactRuntime.mine.map(item=>`<article class="panel impact-my-row"><div><strong>${esc(item.summary||"Private evidence draft")}</strong><small>${esc(item.related_type)} · ${esc(item.related_id)} · ${esc(item.status)} · ${esc(item.occurred_at||"Date needed")}</small>${item.reviewer_note?`<p>Reviewer: ${esc(item.reviewer_note)}</p>`:""}</div><div class="impact-admin-actions">${["Draft","Needs Changes"].includes(item.status)?`<button class="btn small" data-action="impact-edit-evidence" data-impact-id="${esc(item.id)}">Continue</button>`:""}${["Draft","Needs Changes","Rejected"].includes(item.status)?`<button class="btn small" data-action="impact-discard-evidence" data-impact-id="${esc(item.id)}">Discard</button>`:""}</div></article>`).join(""):`<div class="empty-state"><h3>No evidence submissions yet.</h3><p>Start with a mission, event, or approved check-in.</p>${button("Submit evidence","open-evidence-form","primary")}</div>`}</div>`:`<div class="empty-state"><h3>Sign in to view your submissions.</h3><p>Use your Websim account in the site host, then check again. Submitted evidence and reviewer notes stay private to that account.</p>${button("Check sign in","impact-refresh","primary")}</div>`;
  return `<div class="impact-page">${pageHead("See The Change","Proof has a status.","Explore measured claims, their methods, supporting evidence, and review history.")}<section class="impact-overview panel"><div><span class="eyebrow">Published claim register</span><strong>${impactRuntime.loaded&&!impactRuntime.error?impactRuntime.claims.length:"—"}</strong><span>reviewed claim${impactRuntime.claims.length===1?"":"s"}</span></div><p>Each value has a definition, source, period, and reviewer. Check-ins describe participation and are not counted as outcomes.</p><button class="btn primary" data-action="open-evidence-form">Submit evidence</button></section><div class="impact-tabs" role="group" aria-label="Impact workspace"><button aria-pressed="${impactRuntime.tab==="claims"}" class="${impactRuntime.tab==="claims"?"active":""}" data-action="impact-tab" data-impact-tab="claims">Published claims</button><button aria-pressed="${impactRuntime.tab==="mine"}" class="${impactRuntime.tab==="mine"?"active":""}" data-action="impact-tab" data-impact-tab="mine">My evidence</button><button aria-pressed="${impactRuntime.tab==="method"}" class="${impactRuntime.tab==="method"?"active":""}" data-action="impact-tab" data-impact-tab="method">How proof works</button></div>${impactRuntime.tab==="claims"?`<section class="impact-directory"><div class="impact-filters"><label>Search<input data-impact-filter="search" value="${esc(f.search)}" placeholder="Claim, method, or source" /></label><label>Country<select data-impact-filter="country">${["All countries",...countries].map(value=>`<option value="${esc(value)}" ${f.country===value?"selected":""}>${esc(value==="All countries"?countryOptionLabel(value):countryOptionLabelForIso3(value))}</option>`).join("")}</select></label><label>SDG<select data-impact-filter="sdg">${["All SDGs",...new Set(impactRuntime.claims.map(item=>item.sdg).filter(Boolean))].map(value=>`<option ${f.sdg===value?"selected":""}>${esc(value)}</option>`).join("")}</select></label><label>Type<select data-impact-filter="type">${["All types","Participation","Output","Outcome","Impact"].map(value=>`<option ${f.type===value?"selected":""}>${esc(value)}</option>`).join("")}</select></label><label>Status<select data-impact-filter="status">${["All statuses","Published","Corrected"].map(value=>`<option ${f.status===value?"selected":""}>${value}</option>`).join("")}</select></label><label>From<input data-impact-filter="from" type="date" value="${esc(f.from)}" /></label><label>To<input data-impact-filter="to" type="date" value="${esc(f.to)}" /></label><button class="btn small" data-action="impact-clear-filters">Clear</button><button class="btn small" data-action="impact-open-map" data-impact-country="${f.country==="All countries"?"GLB":esc(f.country)}" ${claims.length?"":"disabled"}>Explore on map</button><button class="btn small" data-action="impact-export" ${claims.length?"":"disabled"}>Export CSV</button></div><div class="impact-results-heading"><h2>Claims <small>${claims.length}</small></h2><span>Values shown individually; units are never combined.</span></div><div class="impact-claim-grid">${filtered}</div>${impactTrendMarkup(claims)}</section>`:impactRuntime.tab==="mine"?`<section class="impact-directory"><h2>My evidence</h2>${mine}</section>`:`<section class="impact-method panel panel-pad"><h2>How proof works</h2><p>Contributors save a private draft, submit consented evidence, and receive a reviewer decision. A steward then defines a measured claim and links accepted evidence before publication.</p><div class="impact-status-grid">${[["Draft","Only its contributor can edit it."],["Submitted","Waiting for a reviewer."],["Needs Changes","The contributor can revise and resubmit."],["Accepted","A reviewer has approved the evidence record."],["Published","A measured claim is public with its method and source."],["Corrected","A published value or method changed; its history remains visible."],["Withdrawn","The claim is removed from public totals and the reason remains in the audit trail."]].map(([name,copy])=>`<div><strong>${name}</strong><span>${copy}</span></div>`).join("")}</div><p>Project measures are labeled separately from official SDG indicators. Public geography is generalized, and private evidence links stay with reviewers.</p></section>`}</div>`;
}
function impactFilteredClaims(){const f=impactRuntime.filters,q=f.search.toLowerCase();return impactRuntime.claims.filter(item=>(!q||[item.title,item.method,item.source_name,item.indicator_definition,item.unit].join(" ").toLowerCase().includes(q))&&(f.country==="All countries"||item.country_iso3===f.country)&&(f.sdg==="All SDGs"||item.sdg===f.sdg)&&(f.type==="All types"||item.claim_type===f.type)&&(f.status==="All statuses"||item.status===f.status)&&(!f.from||item.period_end>=f.from)&&(!f.to||item.period_start<=f.to));}
function impactTrendMarkup(claims){
  const groups=new Map();for(const item of claims){if(Number(item.value)<0)continue;const key=[item.indicator_definition,item.unit,item.country_iso3,item.mission_id,item.method].join("|");groups.set(key,[...(groups.get(key)||[]),item]);}
  const series=[...groups.values()].map(rows=>rows.sort((a,b)=>a.period_end.localeCompare(b.period_end))).find(rows=>rows.length>1&&rows.every((item,index)=>index===0||rows[index-1].period_end<item.period_start));
  if(!series)return "";
  const rows=series.slice(-6),maximum=Math.max(1,...rows.map(item=>Number(item.value)));
  return `<figure class="panel panel-pad impact-trend"><figcaption><span class="eyebrow">Comparable observations</span><h2>${esc(rows[0].indicator_definition)}</h2><p>Same definition, unit, country, mission, and method across distinct reporting periods. This shows recorded values; it does not establish causation.</p></figcaption><div class="impact-trend-bars" aria-hidden="true">${rows.map(item=>`<div><strong>${Number(item.value).toLocaleString()}</strong><span style="height:${Math.max(5,Math.round(Number(item.value)/maximum*100))}%"></span><small>${esc(item.period_end)}</small></div>`).join("")}</div><div class="data-table-wrap"><table class="data-table"><caption>Recorded values by period</caption><thead><tr><th scope="col">Period end</th><th scope="col">Value</th><th scope="col">Unit</th><th scope="col">Claim</th></tr></thead><tbody>${rows.map(item=>`<tr><td>${esc(item.period_end)}</td><td>${Number(item.value).toLocaleString()}</td><td>${esc(item.unit)}</td><td><button class="card-link" data-action="impact-open-claim" data-impact-id="${esc(item.id)}">${esc(item.title)}</button></td></tr>`).join("")}</tbody></table></div></figure>`;
}
function impactRelatedSection(type,id,title){
  const claims=impactRuntime.claims.filter(item=>type==="sdg"?Boolean(item.sdg):type==="event"&&id==null?item.related_records?.some(link=>link.type==="event"):item.mission_id===id||item.related_records?.some(link=>link.type===type&&link.id===id));
  return `<section class="section panel panel-pad impact-related"><div class="section-head"><div><div class="eyebrow">Reviewed impact</div><h2 class="section-title">${esc(title)}</h2><p class="section-copy">${claims.length?"Each claim opens its definition, method, and supporting evidence.":"No published claim is linked to this record yet."}</p></div>${tag(`${claims.length} published`,claims.length?"green":"violet")}</div>${claims.length?`<div class="impact-related-list">${claims.slice(0,4).map(item=>`<button data-action="impact-open-claim" data-impact-id="${esc(item.id)}"><strong>${esc(item.title)}</strong><span>${Number(item.value).toLocaleString()} ${esc(item.unit)} · ${esc(item.sdg?item.sdg+" · project measure":"Project measure")}</span></button>`).join("")}</div>`:""}<button class="btn small" data-action="route-impact">Open impact register</button></section>`;
}
function impactEnterpriseBridgeView(){return `<section class="section panel panel-pad impact-related"><div class="section-head"><div><div class="eyebrow">Shared evidence register</div><h2 class="section-title">Network impact claims</h2><p class="section-copy">${impactRuntime.claims.length} published claim${impactRuntime.claims.length===1?"":"s"} in the same reviewed register used by See The Change. Enterprise activity needs its own accepted evidence and measured claim before it appears here.</p></div>${tag("Source-linked","green")}</div><button class="btn small" data-action="route-impact">Explore claims and methods</button></section>`;}
async function loadImpactData(force=false){
  if(impactRuntime.loading||impactRuntime.loaded&&!force)return;
  impactRuntime.loading=true;
  try{
    impactRuntime.error="";
    const [publicResult,mineResult]=await Promise.all([fetch("/api/impact/claims"),fetch("/api/evidence/mine")]);
    if(!publicResult.ok)throw new Error("The public claim register is temporarily unavailable.");
    const claims=await publicResult.json();impactRuntime.claims=Array.isArray(claims)?claims:[];
    impactRuntime.signedIn=mineResult.ok;
    impactRuntime.mineError=!mineResult.ok&&mineResult.status!==401?"Your private evidence could not be loaded.":"";
    impactRuntime.mine=mineResult.ok?await mineResult.json():[];
    impactRuntime.loaded=true;
  }catch(error){impactRuntime.claims=[];impactRuntime.mine=[];impactRuntime.signedIn=false;impactRuntime.error=error?.message||"The public claim register is temporarily unavailable.";impactRuntime.mineError=impactRuntime.error;console.info("Impact register unavailable",impactRuntime.error);}
  finally{impactRuntime.loading=false;impactRuntime.loaded=true;if(["impact","mission","events","admin","sdgs","enterprise","map"].includes(state.view))render();if(state.view==="impact"&&impactRuntime.pendingClaimId){const id=impactRuntime.pendingClaimId;impactRuntime.pendingClaimId=null;openImpactClaim(id);}}
}
async function loadImpactAdmin(force=false){
  if(!adminIdentityRuntime.isAdmin||impactRuntime.adminLoaded&&!force)return;
  impactRuntime.adminLoaded=true;
  try{const [evidence,claims]=await Promise.all([fetch("/api/admin/evidence"),fetch("/api/admin/impact/claims")]);
    if(!evidence.ok||!claims.ok)throw new Error("The review queues could not be loaded.");
    impactRuntime.adminEvidence=await evidence.json();impactRuntime.adminClaims=await claims.json();impactRuntime.adminError="";
  }catch(error){impactRuntime.adminEvidence=[];impactRuntime.adminClaims=[];impactRuntime.adminError=error?.message||"Review queues unavailable";console.info("Impact review queue unavailable",impactRuntime.adminError);}
  if(state.view==="admin"&&["Evidence","Impact Claims"].includes(state.adminTab))render();
}
function impactAdminView(tab){
  const nav=ADMIN_TABS.map(item=>`<button class="${tab===item?"active":""}" data-action="admin-tab" data-admin-tab="${esc(item)}">${esc(item)}</button>`).join("");
  const evidence=impactRuntime.adminEvidence.map(item=>`<article class="panel impact-admin-row"><div><span class="eyebrow">${esc(item.status)} · ${esc(item.related_type)} ${esc(item.related_id)}</span><h3>${esc(item.summary||"Private draft")}</h3><small>${esc(item.occurred_at||"Date pending")} · submitted ${esc(recordDate(item.created_at))}</small>${item.source_url?`<p><a href="${esc(item.source_url)}" target="_blank" rel="noopener noreferrer">Open private evidence link ↗</a></p>`:""}${item.reviewer_note?`<p>Previous reviewer note: ${esc(item.reviewer_note)}</p>`:""}</div>${item.status==="Submitted"?`<div class="impact-review-fields"><label>Public-safe note<textarea data-impact-public-note maxlength="500" placeholder="What can readers know about this evidence?"></textarea></label><label>Note to contributor<textarea data-impact-reviewer-note maxlength="500" placeholder="What needs correction?"></textarea></label><div><button class="btn small primary" data-action="impact-review-evidence" data-impact-id="${esc(item.id)}" data-impact-status="Accepted">Accept</button><button class="btn small" data-action="impact-review-evidence" data-impact-id="${esc(item.id)}" data-impact-status="Needs Changes">Needs changes</button><button class="btn small" data-action="impact-review-evidence" data-impact-id="${esc(item.id)}" data-impact-status="Rejected">Reject</button></div></div>`:""}</article>`).join("");
  const claims=impactRuntime.adminClaims.map(item=>`<article class="panel impact-admin-row"><div><span class="eyebrow">${esc(item.status)} · ${esc(item.claim_type)}</span><h3>${esc(item.title)}</h3><p>${Number(item.value).toLocaleString()} ${esc(item.unit)} · ${esc(item.country_iso3||"Global")} · ${esc(item.period_start)} to ${esc(item.period_end)}</p><small>${(item.evidence_ids||[]).length} linked evidence record${item.evidence_ids?.length===1?"":"s"}</small></div><div class="impact-admin-actions">${item.status!=="Withdrawn"?`<button class="btn small" data-action="impact-edit-claim" data-impact-id="${esc(item.id)}">Edit</button>`:""}${item.status==="Draft"?`<button class="btn small primary" data-action="impact-change-claim-status" data-impact-id="${esc(item.id)}" data-impact-status="Published">Publish</button><button class="btn small" data-action="impact-discard-claim" data-impact-id="${esc(item.id)}">Discard</button>`:""}${["Published","Corrected"].includes(item.status)?`<button class="btn small" data-action="impact-change-claim-status" data-impact-id="${esc(item.id)}" data-impact-status="Withdrawn">Withdraw</button>`:""}</div></article>`).join("");
  return `<div class="admin-page"><div class="admin-topline"><div>${button("← Back to app","route-home","text")}<div class="eyebrow">Restricted workspace</div><h1>${tab}</h1><p>Human review, source records, and a durable history for every public result.</p></div></div><div class="admin-shell"><aside class="panel admin-nav">${nav}</aside><main class="admin-main"><section class="panel admin-workspace"><div class="admin-workspace-head"><div><h2>${tab==="Evidence"?"Evidence review":"Measured claims"}</h2><p>${tab==="Evidence"?"Accept only consented evidence. Write a public-safe note before linking it to a claim.":"Create a claim from accepted evidence, then publish it with a definition and method."}</p></div><div class="admin-actions"><button class="btn small" data-action="impact-admin-refresh">Refresh</button>${tab==="Impact Claims"?`<button class="btn small primary" data-action="impact-new-claim">+ New claim</button>`:""}</div></div>${impactRuntime.adminError?`<p class="form-feedback" role="alert">${esc(impactRuntime.adminError)}</p>`:tab==="Evidence"?evidence||`<p class="section-copy">No evidence submissions yet.</p>`:claims||`<p class="section-copy">No measured claims yet.</p>`}</section></main></div></div>`;
}
function impactEvidenceModal(){
  const draft=state.modal?.evidence||{},current=draft.related_type&&draft.related_id?`${draft.related_type}:${draft.related_id}`:state.view==="mission"&&state.selectedId?`mission:${state.selectedId}`:"";
  const choices=[...seed.missions.map(item=>({value:`mission:${item.id}`,label:`Mission · ${item.title}`})),...publicAdminRecords("Missions").map(item=>({value:`mission:${item.id}`,label:`Mission · ${item.title}`})),...seed.events.map(item=>({value:`event:${item.id}`,label:`Event · ${item.title}`})),...publicAdminRecords("Events").map(item=>({value:`event:${item.id}`,label:`Event · ${item.title}`})),...mapRuntime.myCheckIns.map(item=>({value:`checkin:${item.id}`,label:`My check-in · ${(item.status_text||"").slice(0,60)}`}))];
  if(current&&!choices.some(item=>item.value===current))choices.unshift({value:current,label:`${draft.related_type||"Record"} · ${draft.related_id||state.selectedId}`});
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal impact-modal" data-modal-body><div class="modal-head"><h2>${draft.id?"Continue evidence":"Submit evidence"}</h2><button class="close-btn" data-action="close-modal">${icon("close")}</button></div><p class="section-copy">A private submission for human review. Only a reviewer-approved note can be linked to a public claim.</p>${draft.reviewer_note?`<p class="impact-review-note">Reviewer: ${esc(draft.reviewer_note)}</p>`:""}<div class="form-grid"><div class="field full-width"><label for="evidence-related">Related record</label><select id="evidence-related"><option value="">Choose a mission, event, or check-in</option>${choices.map(item=>`<option value="${esc(item.value)}" ${item.value===current?"selected":""}>${esc(item.label)}</option>`).join("")}</select></div><div class="field"><label for="evidence-occurred">Activity date</label><input id="evidence-occurred" type="date" value="${esc(draft.occurred_at||"")}" /></div><div class="field"><label for="evidence-link">Evidence link (optional)</label><input id="evidence-link" type="url" maxlength="500" placeholder="https://…" value="${esc(draft.source_url||"")}" /><small>Only reviewers can open this link.</small></div><div class="field full-width"><label for="evidence-summary">What happened?</label><textarea id="evidence-summary" maxlength="1200" placeholder="Describe the activity and what this evidence supports. Leave out sensitive personal details.">${esc(draft.summary||"")}</textarea></div><label class="map-evidence-consent full-width"><input id="evidence-consent" type="checkbox" ${draft.consent_confirmed?"checked":""} /> I have permission to share the information and anything shown at the evidence link with reviewers.</label></div><div class="form-feedback" data-form-feedback role="alert"></div><div class="map-modal-actions"><button class="btn" data-action="impact-save-evidence" data-impact-submit="false">Save private draft</button><button class="btn primary" data-action="impact-save-evidence" data-impact-submit="true">Submit for review</button></div></div></div>`;
}
function impactClaimDetailModal(){
  const item=impactRuntime.detail;
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal impact-modal" data-modal-body><div class="modal-head"><h2>${esc(item?.title||"Loading claim…")}</h2><button class="close-btn" data-action="close-modal">${icon("close")}</button></div>${item?`<div class="impact-detail-value">${Number(item.value).toLocaleString()} <small>${esc(item.unit)}</small></div><div class="card-meta">${tag(item.status,item.status==="Withdrawn"?"coral":item.status==="Corrected"?"gold":"green")}${tag(item.claim_type)}${item.sdg?tag(item.sdg):""}</div>${item.status==="Withdrawn"?`<p class="impact-review-note">Historical record · this value was withdrawn and is excluded from the current claim register.</p>`:""}<dl class="impact-detail-grid"><div><dt>Definition</dt><dd>${esc(item.indicator_definition)}</dd></div><div><dt>Period</dt><dd>${esc(item.period_start)} to ${esc(item.period_end)}</dd></div><div><dt>Geography</dt><dd>${esc(item.country_iso3||"Global")} · ${esc(item.public_precision)}</dd></div><div><dt>Method</dt><dd>${esc(item.method)}</dd></div><div><dt>Source</dt><dd>${esc(item.source_name)}</dd></div><div><dt>Reviewer</dt><dd>Project steward · ${esc(item.reviewed_at?new Date(item.reviewed_at).toLocaleDateString():"Date not recorded")}</dd></div><div><dt>Limitations</dt><dd>${esc(item.limitations||"No additional limitations recorded")}</dd></div></dl><h3>Supporting evidence</h3>${item.evidence?.length?item.evidence.map(record=>`<div class="impact-evidence-note"><strong>${esc(record.public_note)}</strong><small>${esc(record.related_type)} · ${esc(record.related_id||"Private participation record")} · ${esc(record.occurred_at||"Date not published")}</small></div>`).join(""):`<p class="section-copy">The supporting record is no longer available.</p>`}<details><summary>Correction history</summary>${item.history?.map(entry=>`<p class="impact-history-row"><strong>${esc(entry.action)}</strong> · ${esc(new Date(entry.created_at).toLocaleDateString())}${entry.previous_value!=null?`<br>Previous value: ${Number(entry.previous_value).toLocaleString()} ${esc(entry.previous_unit||"")}`:""}${entry.previous_method?`<br>Previous method: ${esc(entry.previous_method)}`:""}${entry.note?`<br>${esc(entry.note)}`:""}</p>`).join("")||"No corrections recorded."}</details><div class="map-modal-actions">${item.country_iso3?`<button class="btn" data-action="impact-open-map" data-impact-country="${esc(item.country_iso3)}">Open map</button>`:""}${item.mission_id?`<button class="btn" data-action="open-mission" data-id="${esc(item.mission_id)}">Open mission</button>`:""}<button class="btn" data-action="impact-copy-link" data-impact-id="${esc(item.id)}">Copy claim link</button><button class="btn" data-action="close-modal">Close</button></div>`:`<p class="section-copy">Loading the reviewed source and method…</p>`}</div></div>`;
}
function impactClaimEditorModal(){
  const item=state.modal?.claim||{},accepted=impactRuntime.adminEvidence.filter(record=>record.status==="Accepted"),selected=new Set(item.evidence_ids||[]);
  const field=(id,label,value,wide=false)=>`<div class="field ${wide?"full-width":""}"><label for="${id}">${label}</label><input id="${id}" value="${esc(value??"")}" /></div>`;
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal impact-modal" data-modal-body><div class="modal-head"><h2>${item.id?"Edit measured claim":"New measured claim"}</h2><button class="close-btn" data-action="close-modal">${icon("close")}</button></div><div class="form-grid">${field("claim-title","Claim title",item.title,true)}<div class="field"><label for="claim-type">Claim type</label><select id="claim-type">${["Participation","Output","Outcome","Impact"].map(value=>`<option ${item.claim_type===value?"selected":""}>${value}</option>`).join("")}</select></div>${field("claim-value","Value",item.value)}${field("claim-unit","Unit",item.unit)}${field("claim-source","Source name",item.source_name)}<div class="field full-width"><label for="claim-definition">What exactly is measured?</label><textarea id="claim-definition" maxlength="700">${esc(item.indicator_definition||"")}</textarea></div><div class="field"><label for="claim-start">Period start</label><input id="claim-start" type="date" value="${esc(item.period_start||"")}" /></div><div class="field"><label for="claim-end">Period end</label><input id="claim-end" type="date" value="${esc(item.period_end||"")}" /></div><div class="field"><label for="claim-country">Country</label><select id="claim-country"><option value="">${esc(countryOptionLabel("Global"))} / not country-specific</option>${COUNTRY_RECORDS.map(country=>`<option value="${esc(country.iso3)}" ${item.country_iso3===country.iso3?"selected":""}>${esc(countryOptionLabel(country))}</option>`).join("")}</select></div><div class="field"><label for="claim-sdg">Related SDG · project measure</label><select id="claim-sdg"><option value="">Project measure</option>${seed.sdgs.map(sdg=>`<option ${item.sdg===sdg[0]?"selected":""}>${esc(sdg[0])}</option>`).join("")}</select></div><div class="field"><label for="claim-mission">Mission</label><select id="claim-mission"><option value="">No mission linked</option>${seed.missions.map(mission=>`<option value="${esc(mission.id)}" ${item.mission_id===mission.id?"selected":""}>${esc(mission.title)}</option>`).join("")}</select></div><div class="field"><label for="claim-precision">Public geography</label><strong>Country Only</strong><input id="claim-precision" type="hidden" value="Country Only" /></div><div class="field full-width"><label for="claim-method">Calculation and review method</label><textarea id="claim-method" maxlength="1200">${esc(item.method||"")}</textarea></div><div class="field full-width"><label for="claim-limitations">Limitations</label><textarea id="claim-limitations" maxlength="700">${esc(item.limitations||"")}</textarea></div><div class="field full-width"><label>Accepted supporting evidence</label><div class="impact-evidence-choices">${accepted.length?accepted.map(record=>`<label><input type="checkbox" data-claim-evidence="${esc(record.id)}" ${selected.has(record.id)?"checked":""} /> ${esc(record.public_note||record.summary)}</label>`).join(""):`<p>Accept evidence before publishing a claim.</p>`}</div></div><div class="field full-width"><label for="claim-review-note">Review or correction note</label><textarea id="claim-review-note" maxlength="500">${esc(item.reviewer_note||"")}</textarea></div></div><div class="form-feedback" data-form-feedback role="alert"></div><div class="map-modal-actions"><button class="btn primary" data-action="impact-save-claim">${["Published","Corrected"].includes(item.status)?"Save correction":"Save draft"}</button><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;
}
async function saveImpactEvidence(submit,buttonEl){
  const related=getField("evidence-related"),[related_type,related_id]=related.split(":"),current=state.modal?.evidence||{};
  const payload={id:current.id,related_type,related_id,summary:getField("evidence-summary"),occurred_at:getField("evidence-occurred"),source_url:getField("evidence-link"),consent_confirmed:Boolean(document.getElementById("evidence-consent")?.checked),submit};
  if(!related||submit&&(!payload.summary||!payload.occurred_at||!payload.consent_confirmed)){setModalFeedback("Choose a related record, add a date and summary, and confirm consent before submitting.");return;}
  if(!guardDuplicateSubmission(buttonEl))return;
  try{const response=await fetch("/api/evidence",{method:current.id?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(response.status===401?"Sign in to your Websim account in the site host, then try again.":result.error||"Evidence could not be saved");impactRuntime.loaded=false;impactRuntime.tab="mine";draftDirty=false;state.modal=null;render();loadImpactData(true);showToast(submit?"Evidence submitted":"Private draft saved",submit?`Receipt ${result.id.slice(0,8)} · awaiting human review.`:"Continue it from My Evidence.");}
  catch(error){buttonEl.disabled=false;buttonEl.dataset.busy="false";buttonEl.removeAttribute("aria-busy");buttonEl.textContent=submit?"Submit for review":"Save private draft";setModalFeedback(error.message);}
}
async function openImpactClaim(id){
  if(state.view==="impact"&&!new URLSearchParams(location.hash.split("?")[1]||"").get("claim"))history.pushState({view:"impact"},"",`#impact?claim=${encodeURIComponent(id)}`);
  impactRuntime.detail=null;setModal("impact-claim-detail");
  try{const response=await fetch(`/api/impact/claims?id=${encodeURIComponent(id)}`),result=await response.json();if(!response.ok)throw new Error(result.error||"Claim unavailable");impactRuntime.detail=result;if(state.modal?.type==="impact-claim-detail")render();}
  catch(error){impactRuntime.detail=null;state.modal=null;if(state.view==="impact")history.replaceState({view:"impact"},"","#impact");render();showToast("Claim unavailable",error.message);}
}
function impactClaimPayload(item={}){
  return {id:item.id,title:getField("claim-title"),claim_type:getField("claim-type"),value:getField("claim-value"),unit:getField("claim-unit"),indicator_definition:getField("claim-definition"),period_start:getField("claim-start"),period_end:getField("claim-end"),country_iso3:getField("claim-country"),sdg:getField("claim-sdg"),mission_id:getField("claim-mission"),source_name:getField("claim-source"),public_precision:getField("claim-precision"),method:getField("claim-method"),limitations:getField("claim-limitations"),reviewer_note:getField("claim-review-note"),evidence_ids:[...document.querySelectorAll("[data-claim-evidence]:checked")].map(input=>input.dataset.claimEvidence),status:["Published","Corrected"].includes(item.status)?"Corrected":"Draft"};
}
async function writeImpactClaim(payload,method){
  const response=await fetch("/api/admin/impact/claims",{method,headers:{"content-type":"application/json"},body:JSON.stringify(payload)}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Claim could not be saved");impactRuntime.adminLoaded=false;impactRuntime.loaded=false;await Promise.all([loadImpactAdmin(true),loadImpactData(true)]);return result;
}
function exportImpactClaims(){
  const rows=impactFilteredClaims(),columns=["id","title","claim_type","value","unit","indicator_definition","period_start","period_end","country_iso3","sdg","method","limitations","source_name","status","reviewed_at"],quote=value=>`"${String(value??"").replaceAll('"','""')}"`,csv=[columns.join(","),...rows.map(row=>columns.map(key=>quote(row[key])).join(","))].join("\r\n"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})),link=document.createElement("a");link.href=url;link.download="reviewed-impact-claims.csv";link.click();URL.revokeObjectURL(url);
}

function partnersView() {
  return `<div>${pageHead("Partners, schools & universities","Make the relationship clear.","Prospective, contacted, in discussion, agreement pending, active, verified, past, and suspended are different statuses.")}<div class="grid grid-2"><article class="panel panel-pad clickable-card" data-action="open-breakdown" data-breakdown-section="partners" data-breakdown-id="partner-directory" tabindex="0" role="button"><div class="eyebrow">Partner directory</div><h2 class="section-title" style="font-size:29px">Find a way to contribute.</h2><p class="section-copy">Organizations can offer funding, skills, learning, space, sport, evidence support, or local trust.</p><div class="card-meta">${["Prospective","In Discussion","Agreement Pending","Active","Verified"].map((x,i)=>tag(x,i===4?"green":i===0?"violet":""))}</div><div style="margin-top:22px">${button("Register an organization","open-partner-form","primary")}</div></article><article class="panel panel-pad clickable-card" data-action="open-breakdown" data-breakdown-section="partners" data-breakdown-id="institution-portal" tabindex="0" role="button"><div class="eyebrow">Institution portal</div><h2 class="section-title" style="font-size:29px">Schools & universities</h2><p class="section-copy">Host courses, join missions, register safe events, and publish evidence with a clear institutional record.</p><div style="margin-top:22px">${button("Register an institution","show-record")}</div></article></div><section class="section">${pageHead("Current records","Existing relationships stay labeled.","No endorsement, agreement, or affiliation is inferred.")}<div class="grid">${seed.organizations.map((o,index)=>`<article class="panel list-card clickable-card" data-action="open-breakdown" data-breakdown-section="partners" data-breakdown-id="organization-${index}" tabindex="0" role="button"><div class="list-card-main">${tag(o.type)}<h3>${esc(o.name)}</h3><p>${esc(o.note)}</p></div><div class="list-card-side">${statusBadge(o.status)}<br/><span class="card-link">Open breakdown ${icon("arrow")}</span></div></article>`).join("")}</div></section>${publicAdminRecordGrid("Organizations","Published organization records")}${publicAdminRecordGrid("Partners","Published partner records")}<section class="section panel panel-pad clickable-card" data-action="open-breakdown" data-breakdown-section="partners" data-breakdown-id="ecosystem-mapper" tabindex="0" role="button"><div class="eyebrow">UN Ecosystem Mapper</div><h2 class="section-title" style="font-size:29px">Public information, independently mapped.</h2><p class="section-copy">This future-facing directory can list public mandates, country presence, programs, grants, SDGs, sources, and last-verified dates. It does not imply endorsement or partnership.</p><div class="empty-state" style="margin-top:22px"><h3>Source layer awaiting reviewed entries.</h3><p>Do not display UN logos or call an organization a partner without administrator-uploaded documentation.</p></div></section></div>`;
}

const SPORT_PRODUCTS = [
  {id:"basketball",name:"Basketball",category:"Court sport",status:"Concept product",description:"A mission-ready basketball concept for schools, teams, and community tournaments.",equipment:"basketball",sdgs:["SDG 03","SDG 05","SDG 16"],needs:"Team play · coaching · safe spaces"},
  {id:"cricket",name:"Cricket",category:"Field sport",status:"Concept product",description:"A cricket equipment concept for inclusive practice, learning, and peace-building activities.",equipment:"cricket",sdgs:["SDG 03","SDG 04","SDG 16"],needs:"Coaching · equipment access · events"},
  {id:"volleyball",name:"Volleyball",category:"Court sport",status:"Concept product",description:"A volleyball concept designed for cooperative play and school or community activations.",equipment:"volleyball",sdgs:["SDG 03","SDG 05","SDG 17"],needs:"Teams · facilitation · local courts"},
  {id:"tennis",name:"Tennis",category:"Racket sport",status:"Concept product",description:"A tennis concept for skill-sharing sessions, youth pathways, and accessible community play.",equipment:"tennis",sdgs:["SDG 03","SDG 04","SDG 10"],needs:"Coaches · rackets · safe access"},
  {id:"rugby",name:"Rugby",category:"Field sport",status:"Concept product",description:"A rugby concept for teamwork, belonging, and structured sport-for-peace sessions.",equipment:"rugby",sdgs:["SDG 03","SDG 05","SDG 16"],needs:"Coaches · safeguarding · field access"},
  {id:"table-tennis",name:"Table Tennis",category:"Indoor sport",status:"Concept product",description:"A compact table-tennis concept for learning spaces, clubs, and indoor community programming.",equipment:"table-tennis",sdgs:["SDG 03","SDG 04","SDG 10"],needs:"Tables · paddles · mentors"},
  {id:"athletics",name:"Athletics",category:"Track and field",status:"Concept product",description:"An athletics concept for movement, confidence, and community-led sport pathways.",equipment:"athletics",sdgs:["SDG 03","SDG 04","SDG 17"],needs:"Coaches · safe routes · events"},
];
function sportsEquipmentArt(kind) { return `<div class="sports-equipment equipment-${esc(kind)}" aria-label="Simulated ${esc(kind)} playing equipment"><span class="equipment-main"></span><span class="equipment-detail detail-one"></span><span class="equipment-detail detail-two"></span><span class="equipment-shadow"></span></div>`; }
function shopView() {
  return `<div>${pageHead("Shop","Objects that carry a mission.","Commerce can help fund action. Every product status and checkout capability stays explicit.")}<section class="panel football-feature clickable-card" data-action="route-unity-ball" tabindex="0" role="link">${footballArt()}<div class="football-copy"><div class="eyebrow">Signature product page · /unity-ball</div><h3>Make your Unity Ball</h3><p>Explore the physical and digital identity behind the Unity Ball, then create a reviewable design request for a sport, country, SDG, mission, colors, and message.</p><div class="card-meta">${tag("Design request","violet")}${tag("Manufacturing / checkout not connected","coral")}</div><div style="margin-top:22px;display:flex;gap:8px;flex-wrap:wrap">${button("Explore Unity Ball","route-unity-ball","primary")}${button("Open configurator","open-ball-config")}</div></div></section><section class="section">${pageHead("Sports collection","Beyond football.","Each card shows a simulated playing-equipment concept. Product availability, pricing, manufacturing, and checkout require a later approved commerce connection.")}<div class="grid grid-3">${SPORT_PRODUCTS.map(product=>`<article class="panel record-card sports-product-card clickable-card" data-action="open-breakdown" data-breakdown-section="shop" data-breakdown-id="${product.id}" tabindex="0" role="button">${sportsEquipmentArt(product.equipment)}<div class="sports-product-copy"><div class="product-card-top">${tag(product.category,"green")}${tag(product.status,"violet")}</div><h3>${esc(product.name)}</h3><p>${esc(product.description)}</p><div class="card-meta">${product.sdgs.map(s=>tag(s))}</div><div class="sports-product-foot"><span>${esc(product.needs)}</span><span class="card-link">View breakdown ${icon("arrow")}</span></div></div></article>`).join("")}</div></section>${publicAdminRecordGrid("Sports","Published sports records")}</div>`;
}

function unityBallView() {
  return `<div class="unity-ball-page"><div class="unity-ball-breadcrumb">${button(`${icon("arrow")} Shop & sports`,"route-shop","text")}</div><section class="unity-ball-hero panel"><div class="unity-ball-hero-copy"><div class="eyebrow">Unity Ball · unique product page · /unity-ball</div><h1>The ball is an invitation.</h1><p class="lede">A physical and digital identity for sport, peace, stories, and missions. The Unity Ball turns play into a doorway for participation without pretending that a concept product is already manufactured or verified.</p><div class="card-meta">${tag("Design request","violet")}${tag("Digital identity concept","green")}${tag("Checkout not connected","coral")}</div><div class="unity-ball-actions">${button("Create a design request","open-ball-config","primary")}${button("Open activation mission","open-record")}</div></div><div class="unity-ball-art">${footballArt()}</div></section><section class="section unity-ball-grid"><article class="panel panel-pad"><div class="eyebrow">01 · Identity</div><h2 class="section-title" style="font-size:30px">One object, many stories.</h2><p class="section-copy">Each design can carry a sport, country, SDG, mission, colors, and a message. A QR-linked identity can point people toward the public record and the next safe action.</p><div class="unity-ball-specs"><div><span>Product</span><strong>Unity Ball</strong></div><div><span>Record status</span><strong>Design request</strong></div><div><span>Mission bridge</span><strong>Digital Twin Football</strong></div><div><span>Public claim</span><strong>Not yet verified</strong></div></div></article><article class="panel panel-pad"><div class="eyebrow">02 · Activation</div><h2 class="section-title" style="font-size:30px">Play can open a pathway.</h2><p class="section-copy">A steward can connect a ball activation to a safe event, a school or team pathway, a peace campaign, and consented evidence. Every link keeps its own status and reviewer.</p><div class="unity-ball-path"><span>Sport</span><i>→</i><span>Story</span><i>→</i><span>Mission</span><i>→</i><span>Evidence</span></div></article></section><section class="section panel panel-pad unity-ball-responsibility"><div><div class="eyebrow">03 · Responsible next step</div><h2 class="section-title" style="font-size:30px">Design first. Review before release.</h2><p class="section-copy">Submit a concept for review with its context and intended use. Manufacturing, payments, partnership claims, and impact totals remain separate decisions.</p></div><div class="unity-ball-actions">${button("Start with a design","open-ball-config","primary")}${button("Return to shop","route-shop")}</div></section></div>`;
}

function sportsView() { return shopView(); }

function jobSalary(job) {
  if(job.salary_min==null&&job.salary_max==null)return "Salary not disclosed";
  const currency=job.salary_currency||"", period=job.salary_period?` / ${job.salary_period}`:"";
  if(job.salary_min!=null&&job.salary_max!=null)return `${currency} ${Number(job.salary_min).toLocaleString()}–${Number(job.salary_max).toLocaleString()}${period}`.trim();
  return `${currency} ${Number(job.salary_min??job.salary_max).toLocaleString()}${job.salary_min!=null?"+":" max"}${period}`.trim();
}
function greenJobCard(job) {
  const location=[job.city,job.country].filter(Boolean).join(", ")||"Location flexible";
  return `<article class="panel green-job-card"><div class="green-job-card-top"><div>${tag(job.work_mode,"green")}${job.verification==="Verified"?tag("Verified","gold"):tag(job.verification||"Source checked","violet")}</div><span class="green-score" title="Automated triage score; not a verification">${Math.round(job.green_score||0)}<small>/100 green fit</small></span></div><h3>${esc(job.title)}</h3><p class="green-job-employer">${esc(job.employer_name)} · ${esc(location)}</p><p>${esc(job.summary)}</p><div class="green-job-tags">${(job.categories||[]).slice(0,3).map(value=>tag(value)).join("")}</div><dl><div><dt>Type</dt><dd>${esc(job.employment_type)}</dd></div><div><dt>Pay</dt><dd>${esc(jobSalary(job))}</dd></div></dl><footer><span>${esc(job.provenance)}${job.source_name?` · ${esc(job.source_name)}`:""}</span><button class="card-link" data-action="open-job" data-job-slug="${esc(job.slug)}">View role ${icon("arrow")}</button></footer></article>`;
}
function greenJobsView() {
  const jobs=jobRuntime.records, filters=jobRuntime.filters, countries=[...new Set(jobs.map(job=>job.country).filter(Boolean))].sort(), categories=[...new Set(jobs.flatMap(job=>job.categories||[]))].sort();
  return `<div class="green-jobs-page"><section class="green-jobs-hero panel"><div><div class="eyebrow">Green Jobs · reviewed opportunity layer</div><h1>Work that moves the transition.</h1><p class="lede">Discover climate, conservation, circular-economy, clean-energy, and just-transition roles. Every listing shows its source, review status, and application destination.</p><div class="green-jobs-actions">${button("Post a green job","open-job-post","primary")}<a class="btn" href="/api/jobs/rss.xml" target="_blank" rel="noreferrer">Subscribe via RSS ${icon("arrow")}</a></div></div><div class="green-jobs-orbit" aria-hidden="true"><span>JOBS</span><strong>${jobRuntime.count}</strong><small>reviewed listings</small></div></section><section class="green-job-filter panel" aria-label="Filter green jobs"><label class="green-job-search">${icon("search")}<input id="job-search" value="${esc(filters.q)}" placeholder="Search roles, employers, or skills" /></label><select data-job-filter="country" aria-label="Country"><option value="All">${esc(countryOptionLabel("All"))}</option>${countries.map(value=>`<option value="${esc(value)}" ${filters.country===value?"selected":""}>${esc(countryOptionLabel(value))}</option>`).join("")}</select><select data-job-filter="category" aria-label="Green job category"><option>All</option>${categories.map(value=>`<option ${filters.category===value?"selected":""}>${esc(value)}</option>`).join("")}</select><select data-job-filter="work_mode" aria-label="Work mode">${["All","Remote","Hybrid","On-site"].map(value=>`<option ${filters.work_mode===value?"selected":""}>${value}</option>`).join("")}</select><select data-job-filter="employment_type" aria-label="Employment type">${["All","Full-time","Part-time","Contract","Internship","Volunteer"].map(value=>`<option ${filters.employment_type===value?"selected":""}>${value}</option>`).join("")}</select></section>${jobRuntime.loading&&!jobRuntime.loaded?`<div class="green-jobs-empty panel"><span class="admin-sync-pulse"></span><h2>Loading reviewed opportunities…</h2></div>`:jobRuntime.error?`<div class="green-jobs-empty panel"><h2>The jobs feed is temporarily unavailable.</h2><p>${esc(jobRuntime.error)}</p>${button("Try again","jobs-refresh","primary")}</div>`:jobs.length?`<div class="green-jobs-results-head"><strong>${jobRuntime.count} opportunity${jobRuntime.count===1?"":"ies"}</strong><span>Imported roles require review before appearing here.</span></div><div class="green-jobs-grid">${jobs.map(greenJobCard).join("")}</div>`:`<div class="green-jobs-empty panel"><div class="eyebrow">No matching reviewed listings</div><h2>Be the first responsible employer in this view.</h2><p>New community submissions and imported jobs remain in moderation until a human checks the role, source, destination, and environmental claim.</p>${button("Post a green job","open-job-post","primary")}</div>`}</div>`;
}
function greenJobDetailView() {
  const job=jobRuntime.selected||jobRuntime.records.find(item=>item.slug===state.selectedId);
  if(jobRuntime.loading&&!job)return `<section class="green-jobs-empty panel"><h2>Loading job…</h2></section>`;
  if(!job)return `<section class="empty-state page-error"><div class="eyebrow">Green Jobs</div><h1>Job not found</h1><p>This listing may be awaiting review, expired, or archived.</p>${button("Browse green jobs","route-jobs","primary")}</section>`;
  const applyHref=job.application_url||`mailto:${job.application_email}`;
  return `<div class="green-job-detail"><button class="btn text" data-route="jobs">← All green jobs</button><section class="panel green-job-detail-hero"><div><div class="eyebrow">${esc(job.employer_name)} · ${esc(job.provenance)}</div><h1>${esc(job.title)}</h1><p class="lede">${esc(job.summary)}</p><div class="card-meta">${tag(job.work_mode,"green")}${tag(job.employment_type,"violet")}${tag(job.verification,"gold")}${job.country?countryTag(job.country):""}</div></div><aside><span class="green-score">${Math.round(job.green_score||0)}<small>/100 green fit</small></span><strong>${esc(jobSalary(job))}</strong><a class="btn primary" href="${esc(applyHref)}" target="_blank" rel="noopener noreferrer">Apply at source ${icon("arrow")}</a></aside></section><div class="green-job-detail-grid"><article class="panel panel-pad"><div class="eyebrow">Role</div><h2>What you’ll work on</h2><p class="prose">${esc(job.description)}</p>${job.responsibilities?`<h3>Responsibilities</h3><p class="prose">${esc(job.responsibilities)}</p>`:""}${job.requirements?`<h3>Requirements</h3><p class="prose">${esc(job.requirements)}</p>`:""}</article><aside class="panel panel-pad green-job-trust"><div class="eyebrow">Trust & provenance</div><h2>Why it is listed</h2><p>${esc(job.green_explanation||"A reviewer checks each environmental claim before publishing.")}</p><dl><div><dt>Source</dt><dd>${esc(job.source_name||job.employer_name)}</dd></div><div><dt>Review</dt><dd>${esc(job.verification)}</dd></div><div><dt>Closing date</dt><dd>${esc(job.closes_at||"Not supplied")}</dd></div><div><dt>Last checked</dt><dd>${esc((job.last_checked_at||job.updated_at||"").slice(0,10)||"Not supplied")}</dd></div></dl><p class="micro-note">Green-fit scoring supports triage. It is not an employer endorsement, accreditation, or guarantee.</p></aside></div></div>`;
}
async function loadGreenJobs(force=false) {
  if(jobRuntime.loading||jobRuntime.loaded&&!force)return; jobRuntime.loading=true; jobRuntime.error="";
  const params=new URLSearchParams(); Object.entries(jobRuntime.filters).forEach(([key,value])=>{if(value&&value!=="All")params.set(key,value);});
  try { const response=await fetch(`/api/jobs?${params}`,{headers:{accept:"application/json"}}), result=await response.json().catch(()=>({})); if(!response.ok)throw new Error(result.error||"Jobs could not be loaded."); jobRuntime.records=result.jobs||[];jobRuntime.count=Number(result.count||0);jobRuntime.loaded=true; }
  catch(error){jobRuntime.error=error.message||"Jobs could not be loaded.";jobRuntime.loaded=true;} finally {jobRuntime.loading=false;if(state.view==="jobs")render();}
}
async function loadGreenJobDetail(slug) {
  if(!slug||jobRuntime.loading||jobRuntime.detailLoadedSlug===slug)return; const local=jobRuntime.records.find(item=>item.slug===slug); if(local){jobRuntime.selected=local;jobRuntime.detailLoadedSlug=slug;return;} jobRuntime.loading=true;
  try { const response=await fetch(`/api/jobs/${encodeURIComponent(slug)}`,{headers:{accept:"application/json"}}),result=await response.json().catch(()=>({}));jobRuntime.selected=response.ok?result.job:null;jobRuntime.error=response.ok?"":result.error||"Job not found"; }
  catch(_){jobRuntime.selected=null;jobRuntime.error="Job could not be loaded.";} finally {jobRuntime.detailLoadedSlug=slug;jobRuntime.loading=false;if(state.view==="job")render();}
}
function jobPostModalMarkup() {
  const assessment=jobRuntime.assessment,d=jobRuntime.draft||{}, option=(value,current)=>`<option ${value===current?"selected":""}>${value}</option>`;
  return `<div class="modal-backdrop job-post-backdrop" data-action="close-modal"><div class="modal job-post-modal" data-modal-body><div class="modal-head"><div><div class="eyebrow">Smart listing assistant</div><h2>Post a green job</h2><p class="section-copy">Draft the role, preview its green-fit signals, then send it to human review.</p></div><button class="close-btn" data-action="close-modal">${icon("close")}</button></div><div class="form-grid"><div class="field"><label for="job-title">Role title *</label><input id="job-title" value="${esc(d.title||"")}" maxlength="160" placeholder="e.g. Solar Project Coordinator" /></div><div class="field"><label for="job-employer">Employer *</label><input id="job-employer" value="${esc(d.employer_name||"")}" maxlength="140" placeholder="Organization name" /></div><div class="field"><label for="job-country">Country</label><input id="job-country" value="${esc(d.country||"")}" placeholder="Ghana" /></div><div class="field"><label for="job-city">City / region</label><input id="job-city" value="${esc(d.city||"")}" placeholder="Accra or region" /></div><div class="field"><label for="job-mode">Work mode</label><select id="job-mode">${["On-site","Hybrid","Remote"].map(value=>option(value,d.work_mode||"On-site")).join("")}</select></div><div class="field"><label for="job-type">Employment type</label><select id="job-type">${["Full-time","Part-time","Contract","Internship","Volunteer"].map(value=>option(value,d.employment_type||"Full-time")).join("")}</select></div><div class="field full-width"><label for="job-description">Role description *</label><textarea id="job-description" minlength="80" placeholder="Describe the work, responsibilities, requirements, and intended outcomes.">${esc(d.description||"")}</textarea></div><div class="field full-width"><label for="job-green-impact">Environmental contribution *</label><textarea id="job-green-impact" placeholder="Explain the measurable climate, nature, circularity, clean-energy, or just-transition contribution.">${esc(d.green_explanation||"")}</textarea></div><div class="field"><label for="job-skills">Skills</label><input id="job-skills" value="${esc((d.skills||[]).join(", "))}" placeholder="Project management, solar PV" /></div><div class="field"><label for="job-categories">Categories</label><input id="job-categories" value="${esc((d.categories||[]).join(", "))}" placeholder="Renewable energy, Climate" /></div><div class="field"><label for="job-salary-min">Salary minimum</label><input id="job-salary-min" value="${esc(d.salary_min||"")}" type="number" min="0" /></div><div class="field"><label for="job-salary-max">Salary maximum</label><input id="job-salary-max" value="${esc(d.salary_max||"")}" type="number" min="0" /></div><div class="field"><label for="job-currency">Currency</label><input id="job-currency" value="${esc(d.salary_currency||"")}" maxlength="3" placeholder="USD" /></div><div class="field"><label for="job-closes">Closing date</label><input id="job-closes" value="${esc(d.closes_at||"")}" type="date" /></div><div class="field full-width"><label for="job-apply-url">Application URL *</label><input id="job-apply-url" value="${esc(d.application_url||"")}" type="url" placeholder="https://employer.org/jobs/role" /></div></div>${assessment?`<div class="job-smart-review"><div><span class="green-score">${assessment.score}<small>/100 green fit</small></span><strong>${esc((assessment.categories||[]).join(" · "))}</strong></div><p>${esc(assessment.explanation)}</p>${(assessment.warnings||[]).length?`<ul>${assessment.warnings.map(item=>`<li>${esc(item)}</li>`).join("")}</ul>`:`<span class="status-dot verified">Ready for submission review</span>`}</div>`:""}<div class="form-feedback" data-form-feedback role="alert"></div><div class="job-post-actions">${button("Check listing","job-smart-review")}${button("Submit for human review","submit-job","primary")}</div></div></div>`;
}
function jobFormValues(){return {title:getField("job-title"),employer_name:getField("job-employer"),country:getField("job-country"),city:getField("job-city"),work_mode:getField("job-mode"),employment_type:getField("job-type"),description:getField("job-description"),summary:getField("job-description").slice(0,360),green_explanation:getField("job-green-impact"),skills:getField("job-skills").split(",").map(value=>value.trim()).filter(Boolean),categories:getField("job-categories").split(",").map(value=>value.trim()).filter(Boolean),salary_min:getField("job-salary-min")||null,salary_max:getField("job-salary-max")||null,salary_currency:getField("job-currency"),closes_at:getField("job-closes"),application_url:getField("job-apply-url")};}

function fundingView() {
  return `<div>${pageHead("Fund The Change","Move resources with clarity.","Funding opportunities, sponsorships, scholarships, and mission support remain separate from verified impact.")}<div class="grid grid-3">${["Grants","Sponsorship","Mission support"].map((title,index)=>`<article class="panel pathway"><div class="pathway-top">${tag(index===2?"Requested":"Proposed",index===0?"violet":index===1?"gold":"coral")}</div><h3>${title}</h3><p>${index===0?"Grant records and applications with eligibility, deadlines, and a review trail.":index===1?"Organizations can offer funding, skills, space, sport, or learning.":"Public mission summaries with private financial documents protected."}</p><button class="card-link" data-action="show-record">View funding record ${icon("arrow")}</button></article>`).join("")}</div><section class="section panel panel-pad"><div class="eyebrow">Financial status vocabulary</div><h2 class="section-title" style="font-size:30px">Every amount has a state.</h2><div class="card-meta" style="margin-top:20px">${["Concept","Proposed","Requested","Applied","Pledged","Contracted","Received","Disbursed","Reconciled","Audited"].map((status,index)=>tag(status,index>6?"green":index>3?"gold":"violet"))}</div><div class="empty-state" style="margin-top:25px"><h3>No public funding transactions yet.</h3><p>Amounts will be calculated from structured records and shown with currency, date, source, restrictions, and reviewer status. Proposed never means received.</p>${button("Submit a funding opportunity","show-record","primary")}</div></section>${publicAdminRecordGrid("Funding","Published funding records")}</div>`;
}
function institutionView(kind) {
  const label=kind==="schools"?"Schools":"Universities"; const singular=kind==="schools"?"school":"university";
  return `<div>${pageHead(label,`Build a ${singular} pathway.`,"Institutions can host courses, join missions, register safe events, add faculty or student groups, and publish evidence.")}<section class="panel panel-pad"><div class="form-grid"><div class="field"><label for="institution-name">${singular} name</label><input id="institution-name" placeholder="Institution name" /></div><div class="field"><label for="institution-country">Country</label><input id="institution-country" value="Ghana" /></div><div class="field full-width"><label for="institution-goals">SDGs or mission interests</label><input id="institution-goals" placeholder="e.g. SDG 04, SDG 16, Sports for Peace" /></div></div><div style="display:flex;gap:8px;flex-wrap:wrap">${button("Save institution draft","show-record","primary")}${button("Browse education","route-education")}</div><div class="footer-note">Status · Draft. A public institution record requires an authorized representative and appropriate safeguarding review.</div></section><section class="section panel panel-pad"><div class="empty-state"><div class="eyebrow">Public directory</div><h3>No reviewed ${label.toLowerCase()} records yet.</h3><p>Private student, youth, faculty, and safeguarding information will not appear in this directory.</p></div></section>${publicAdminRecordGrid(kind==="schools"?"Schools":"Universities",`Published ${label.toLowerCase()} records`)}</div>`;
}
function qrCode(value="BTC-DIGITAL-TWIN") {
  const size=21,matrix=Array.from({length:size},()=>Array(size).fill(false));
  const reserved=Array.from({length:size},()=>Array(size).fill(false));
  const finder=(ox,oy)=>{
    for(let y=-1;y<8;y++)for(let x=-1;x<8;x++){const px=ox+x,py=oy+y;if(px<0||py<0||px>=size||py>=size)continue;reserved[py][px]=true;matrix[py][px]=x>=0&&x<=6&&y>=0&&y<=6&&(x===0||x===6||y===0||y===6||(x>=2&&x<=4&&y>=2&&y<=4));}
  };
  finder(0,0);finder(size-7,0);finder(0,size-7);
  let hash=0;for(const char of value)hash=(hash*31+char.charCodeAt(0))>>>0;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!reserved[y][x]){hash=(hash*1664525+1013904223)>>>0;matrix[y][x]=((hash>>>28)&1)===1;}
  const cells=[];for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(matrix[y][x])cells.push(`M${x} ${y}h1v1H${x}z`);
  return `<svg viewBox="0 0 21 21" role="img" aria-label="QR identity preview for ${esc(value)}"><rect width="21" height="21" fill="#fff"/><path d="${cells.join("")}" fill="#06151f"/></svg>`;
}
function footballArt({interactive=state?.view==="unity-ball"}={}) {
  const expanded=interactive&&state?.view!=="home";
  const cameraControls=expanded?`<div class="ball-camera-modes" role="group" aria-label="3D camera mode"><button class="active" data-ball-camera="orbit" aria-pressed="true">Orbit</button><button data-ball-camera="follow" aria-pressed="false">Follow</button><button data-ball-camera="field" aria-pressed="false">Field</button></div>`:"";
  const controls=interactive?`<div class="ball-sim-console" data-ball-sim-controls><div class="ball-sim-console-head"><span class="eyebrow">Live 3D ball model</span><strong data-ball-sim-status role="status" aria-live="polite">Loading 3D model…</strong></div><div class="ball-sim-controls"><label><span>Velocity <b data-ball-sim-value="speed">72</b></span><input type="range" min="20" max="100" value="72" data-ball-sim-control="speed" aria-label="Ball velocity"></label><label><span>Spin <b data-ball-sim-value="spin">18</b></span><input type="range" min="-100" max="100" value="18" data-ball-sim-control="spin" aria-label="Ball spin"></label><label><span>Curve <b data-ball-sim-value="curve">12</b></span><input type="range" min="-100" max="100" value="12" data-ball-sim-control="curve" aria-label="Ball curve"></label></div>${cameraControls}<div class="ball-sim-actions">${button("Kick the ball","ball-sim-kick","primary")}${button("Reset","ball-sim-reset","small")}<button class="btn small ball-identity-action" data-action="open-ball-config">Inspect QR identity</button></div><div class="ball-sim-telemetry"><span><small>Flight</small><strong data-ball-sim-flight>Ready</strong></span><span><small>Distance</small><strong data-ball-sim-distance>0.0 m</strong></span><span><small>Max height</small><strong data-ball-sim-height>0.0 m</strong></span><span><small>Bounces</small><strong data-ball-sim-bounces>0</strong></span><span><small>Model</small><strong>Drag + Magnus</strong></span><span><small>Identity</small><strong>QR surface decal</strong></span></div></div>`:"";
  return `<div class="football-art ${interactive?"interactive-football-art":""}" ${interactive?`data-ball-sim data-ball-sim-mode="${expanded?"full":"compact"}" aria-label="Interactive three-dimensional Digital Twin Football simulation"`:'aria-label="Digital Twin Football identity concept"'}><div class="soccer-stage" ${interactive?'data-ball-sim-stage tabindex="0" role="application" aria-label="3D football. Drag to rotate, use the mouse wheel to zoom, and press Space to kick."':''}>${interactive?'<canvas class="ball-3d-canvas" data-ball-3d-canvas aria-hidden="true"></canvas><div class="flight-trace" aria-hidden="true"></div>':''}<div class="soccer-ball" aria-hidden="true"><span class="ball-seam seam-one"></span><span class="ball-seam seam-two"></span><span class="ball-seam seam-three"></span><span class="ball-patch patch-one"></span><span class="ball-patch patch-two"></span><span class="ball-patch patch-three"></span><span class="ball-patch patch-four"></span><button class="ball-tile qr-football-tile" data-action="open-ball-config" tabindex="-1" aria-label="Open QR identity ball configurator">${qrCode()}<small>QR ID · DEMO</small></button></div><div class="ball-orbit-line"></div><span class="ball-3d-hint">Drag to rotate · wheel to zoom · Space to kick</span></div><div class="football-art-label">DIGITAL TWIN · 3D IDENTITY ACTIVATION</div>${controls}</div>`;
}

function updateBallSimulation(root) {
  if(!root)return;
  const read=key=>root.querySelector(`[data-ball-sim-control="${key}"]`)?.value||"0";
  ["speed","spin","curve"].forEach(key=>{const value=read(key);root.querySelector(`[data-ball-sim-value="${key}"]`)?.replaceChildren(document.createTextNode(value));root.style.setProperty(`--sim-${key}`,value);});
  root._ball3D?.updatePrediction();
}
function readBallSimulationValues(root) { return {speed:Number(root?.querySelector('[data-ball-sim-control="speed"]')?.value)||72,spin:Number(root?.querySelector('[data-ball-sim-control="spin"]')?.value)||0,curve:Number(root?.querySelector('[data-ball-sim-control="curve"]')?.value)||0}; }
function setBallTelemetry(root,key,value) { const field=root?.querySelector(`[data-ball-sim-${key}]`);if(field)field.textContent=value; }
function loadThreeForBall() { if(!sharedThreeModulePromise)sharedThreeModulePromise=import("https://esm.sh/three@0.160.0").catch(error=>{sharedThreeModulePromise=null;throw error;});return sharedThreeModulePromise; }
function createQrCanvasTexture(THREE) {
  const canvas=document.createElement("canvas");canvas.width=canvas.height=256;const context=canvas.getContext("2d");
  context.fillStyle="#f7f8f3";context.fillRect(0,0,256,256);context.fillStyle="#06151f";
  const size=21,cell=9,offset=33,matrix=Array.from({length:size},()=>Array(size).fill(false)),reserved=Array.from({length:size},()=>Array(size).fill(false));
  const finder=(ox,oy)=>{for(let y=-1;y<8;y++)for(let x=-1;x<8;x++){const px=ox+x,py=oy+y;if(px<0||py<0||px>=size||py>=size)continue;reserved[py][px]=true;matrix[py][px]=x>=0&&x<=6&&y>=0&&y<=6&&(x===0||x===6||y===0||y===6||(x>=2&&x<=4&&y>=2&&y<=4));}};
  finder(0,0);finder(size-7,0);finder(0,size-7);let hash=948372;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!reserved[y][x]){hash=(hash*1664525+1013904223)>>>0;matrix[y][x]=Boolean((hash>>>28)&1);}
  matrix.forEach((row,y)=>row.forEach((on,x)=>{if(on)context.fillRect(offset+x*cell,offset+y*cell,cell,cell);}));
  context.fillStyle="#14313a";context.font="700 15px monospace";context.textAlign="center";context.fillText("UNITY ID",128,244);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
class DigitalTwinBall3D {
  constructor(root){this.root=root;this.stage=root.querySelector("[data-ball-sim-stage]");this.canvas=root.querySelector("[data-ball-3d-canvas]");this.full=root.dataset.ballSimMode==="full";this.listeners=[];this.disposed=false;this.visible=true;this.dragging=false;this.moved=false;this.pointerId=null;this.cameraMode="orbit";this.flying=false;this.accumulator=0;this.elapsed=0;this.distance=0;this.maxHeight=0;this.bounces=0;this.trailCount=0;this.lastTime=0;this.raf=0;}
  on(target,type,handler,options){target?.addEventListener(type,handler,options);this.listeners.push([target,type,handler,options]);}
  async init(){
    if(!this.canvas||!detectWebGL()){this.fallback("WebGL unavailable · interactive fallback");return;}
    try{this.THREE=await loadThreeForBall();if(this.disposed||!this.canvas.isConnected)return;this.buildScene();this.bindInteraction();this.root.classList.add("ball-3d-ready");this.root.dataset.rendering="3d";this.status("Ready · drag the 3D ball or kick");this.updatePrediction();this.start();}
    catch(error){console.warn("3D football renderer unavailable; using CSS fallback.",{name:error?.name||"renderer_error"});this.fallback("3D unavailable · interactive fallback");}
  }
  fallback(message){this.root.dataset.rendering="fallback";this.status(message);}
  status(message){setBallTelemetry(this.root,"status",message);}
  buildScene(){
    const THREE=this.THREE,rect=this.stage.getBoundingClientRect(),reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,alpha:true,antialias:!reduced,powerPreference:"high-performance"});
    this.renderer.setPixelRatio(Math.min(this.full?1.7:1.35,window.devicePixelRatio||1));this.renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(this.full?35:38,rect.width/rect.height,.1,40);this.camera.position.set(0,.8,this.full?6.4:6);this.scene.add(new THREE.HemisphereLight(0xc8ffff,0x06151f,1.25));
    const key=new THREE.DirectionalLight(0xfff2d0,3.4);key.position.set(-3.5,5,5);this.scene.add(key);const rim=new THREE.DirectionalLight(0x58e2e5,2.2);rim.position.set(4,1,-3);this.scene.add(rim);
    this.ball=new THREE.Group();this.scene.add(this.ball);this.ball.position.set(0,-.28,0);
    const shell=new THREE.Mesh(new THREE.SphereGeometry(.78,this.full?64:48,this.full?64:48),new THREE.MeshStandardMaterial({color:0xf0f1e9,roughness:.58,metalness:.03}));this.ball.add(shell);
    const phi=(1+Math.sqrt(5))/2,vertices=[[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]];
    const patchMaterial=new THREE.MeshStandardMaterial({color:0x102a32,roughness:.72,metalness:.02,side:THREE.DoubleSide});
    vertices.forEach(([x,y,z])=>{const direction=new THREE.Vector3(x,y,z).normalize(),patch=new THREE.Mesh(new THREE.CircleGeometry(.195,5),patchMaterial);patch.position.copy(direction.clone().multiplyScalar(.787));patch.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction);patch.rotateZ(Math.PI/5);this.ball.add(patch);});
    const seamMaterial=new THREE.MeshBasicMaterial({color:0x45646a,transparent:true,opacity:.48});
    [[0,0,0],[Math.PI/2,0,0],[0,Math.PI/2,0],[Math.PI/4,.55,.2]].forEach(rotation=>{const seam=new THREE.Mesh(new THREE.TorusGeometry(.779,.008,5,96),seamMaterial);seam.rotation.set(...rotation);this.ball.add(seam);});
    const qrMaterial=new THREE.MeshStandardMaterial({map:createQrCanvasTexture(THREE),roughness:.5,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});this.qrMesh=new THREE.Mesh(new THREE.PlaneGeometry(.48,.54),qrMaterial);const qrDirection=new THREE.Vector3(.48,-.14,.86).normalize();this.qrMesh.position.copy(qrDirection.clone().multiplyScalar(.802));this.qrMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),qrDirection);this.ball.add(this.qrMesh);
    const field=new THREE.Mesh(new THREE.PlaneGeometry(18,10),new THREE.MeshStandardMaterial({color:0x0b3740,roughness:.92,transparent:true,opacity:.5}));field.rotation.x=-Math.PI/2;field.position.y=-1.08;this.scene.add(field);
    const ringMaterial=new THREE.MeshBasicMaterial({color:0x84e4e5,transparent:true,opacity:.12,side:THREE.DoubleSide});const ring=new THREE.Mesh(new THREE.RingGeometry(1.4,1.42,96),ringMaterial);ring.rotation.x=-Math.PI/2;ring.position.y=-1.06;this.scene.add(ring);
    this.trailPositions=new Float32Array(180*3);this.trailGeometry=new THREE.BufferGeometry();this.trailGeometry.setAttribute("position",new THREE.BufferAttribute(this.trailPositions,3));this.trailGeometry.setDrawRange(0,0);this.trail=new THREE.Line(this.trailGeometry,new THREE.LineBasicMaterial({color:0x84e4e5,transparent:true,opacity:.82}));this.scene.add(this.trail);
    this.prediction=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:0xeacb83,transparent:true,opacity:.48,dashSize:.12,gapSize:.08}));this.scene.add(this.prediction);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.velocity=new THREE.Vector3();this.angularVelocity=new THREE.Vector3();
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.stage);
    this.intersectionObserver=new IntersectionObserver(entries=>{this.visible=entries[0]?.isIntersecting!==false;if(this.visible)this.start();else this.stop();},{threshold:.03});this.intersectionObserver.observe(this.root);
  }
  bindInteraction(){
    this.on(this.stage,"pointerdown",event=>{if(event.target.closest("button"))return;this.dragging=true;this.moved=false;this.pointerId=event.pointerId;this.lastX=event.clientX;this.lastY=event.clientY;this.stage.setPointerCapture?.(event.pointerId);});
    this.on(this.stage,"pointermove",event=>{if(!this.dragging||event.pointerId!==this.pointerId)return;const dx=event.clientX-this.lastX,dy=event.clientY-this.lastY;if(Math.abs(dx)+Math.abs(dy)>2)this.moved=true;this.ball.rotation.y+=dx*.009;this.ball.rotation.x+=dy*.007;this.angularVelocity.set(dy*.002,dx*.002,0);this.lastX=event.clientX;this.lastY=event.clientY;});
    const release=event=>{if(event.pointerId!==this.pointerId)return;this.dragging=false;this.pointerId=null;if(!this.moved)this.inspectQr(event);};this.on(this.stage,"pointerup",release);this.on(this.stage,"pointercancel",release);
    this.on(this.stage,"wheel",event=>{event.preventDefault();this.camera.position.z=Math.max(4.4,Math.min(8,this.camera.position.z+event.deltaY*.004));},{passive:false});
    this.on(this.stage,"dblclick",()=>this.resetView());
    this.on(this.stage,"keydown",event=>{if(event.target!==this.stage)return;if(event.key===" "||event.key==="Enter"){event.preventDefault();this.kick();}if(event.key==="ArrowLeft")this.ball.rotation.y-=.14;if(event.key==="ArrowRight")this.ball.rotation.y+=.14;if(event.key==="ArrowUp")this.ball.rotation.x-=.12;if(event.key==="ArrowDown")this.ball.rotation.x+=.12;});
    this.root.querySelectorAll("[data-ball-camera]").forEach(buttonEl=>this.on(buttonEl,"click",()=>this.setCameraMode(buttonEl.dataset.ballCamera)));
  }
  inspectQr(event){const rect=this.canvas.getBoundingClientRect();this.pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);if(this.raycaster.intersectObject(this.qrMesh,false).length)setModal("ball-config");}
  setCameraMode(mode){this.cameraMode=["orbit","follow","field"].includes(mode)?mode:"orbit";this.root.querySelectorAll("[data-ball-camera]").forEach(buttonEl=>{const active=buttonEl.dataset.ballCamera===this.cameraMode;buttonEl.classList.toggle("active",active);buttonEl.setAttribute("aria-pressed",String(active));});}
  resetView(){if(this.camera)this.camera.position.set(0,.8,this.full?6.4:6);if(this.ball)this.ball.rotation.set(-.08,-.45,.06);this.setCameraMode("orbit");}
  launchVector(values){const launch=2.35+values.speed*.024,angle=.72;return new this.THREE.Vector3(Math.cos(angle)*launch,Math.sin(angle)*launch,values.curve*.0025);}
  updatePrediction(){
    if(!this.THREE||this.flying)return;const values=readBallSimulationValues(this.root),position=new this.THREE.Vector3(-1.75,-.28,0),velocity=this.launchVector(values),points=[position.clone()];let elapsed=0;
    while(elapsed<2.4&&position.y>-.31){const dt=1/30;velocity.y-=5.2*dt;velocity.multiplyScalar(1-.055*dt);velocity.z+=(values.spin*.0022+values.curve*.0035)*dt;position.addScaledVector(velocity,dt);points.push(position.clone());elapsed+=dt;}
    this.prediction.geometry.dispose();this.prediction.geometry=new this.THREE.BufferGeometry().setFromPoints(points);this.prediction.computeLineDistances();this.prediction.visible=true;
  }
  kick(){
    if(!this.THREE)return;const values=readBallSimulationValues(this.root);this.flying=true;this.elapsed=0;this.distance=0;this.maxHeight=0;this.bounces=0;this.accumulator=0;this.lastTrailPoint=null;this.ball.position.set(-1.75,-.28,0);this.velocity.copy(this.launchVector(values));this.angularVelocity.set(values.spin*.012,values.speed*.018,-values.curve*.01);this.trailCount=0;this.trail.geometry.setDrawRange(0,0);this.prediction.visible=false;this.status(`In flight · ${values.speed} km/h`);setBallTelemetry(this.root,"flight","0.0s");setBallTelemetry(this.root,"distance","0.0 m");setBallTelemetry(this.root,"height","0.0 m");setBallTelemetry(this.root,"bounces","0");this.start();
  }
  simulate(dt){
    const values=readBallSimulationValues(this.root),previous=this.ball.position.clone();this.velocity.y-=5.2*dt;this.velocity.multiplyScalar(1-.055*dt);this.velocity.z+=(values.spin*.0022+values.curve*.0035)*dt;this.velocity.x+=values.curve*.0009*dt;this.ball.position.addScaledVector(this.velocity,dt);this.ball.rotateX(this.angularVelocity.x*dt);this.ball.rotateY(this.angularVelocity.y*dt);this.ball.rotateZ(this.angularVelocity.z*dt);this.angularVelocity.multiplyScalar(1-.12*dt);this.elapsed+=dt;this.distance+=previous.distanceTo(this.ball.position);this.maxHeight=Math.max(this.maxHeight,this.ball.position.y+.28);
    if(!this.lastTrailPoint||this.lastTrailPoint.distanceTo(this.ball.position)>.07){const offset=this.trailCount*3;if(this.trailCount<180){this.trailPositions[offset]=this.ball.position.x;this.trailPositions[offset+1]=this.ball.position.y;this.trailPositions[offset+2]=this.ball.position.z;this.trailCount++;this.trail.geometry.attributes.position.needsUpdate=true;this.trail.geometry.setDrawRange(0,this.trailCount);this.lastTrailPoint=this.ball.position.clone();}}
    if(this.ball.position.y<-.28){this.ball.position.y=-.28;if(Math.abs(this.velocity.y)>.72&&this.bounces<4){this.velocity.y=Math.abs(this.velocity.y)*.46;this.velocity.x*=.78;this.velocity.z*=.72;this.bounces++;}else if(this.elapsed>.45){this.flying=false;this.velocity.set(0,0,0);this.status("Landed · replay ready");this.updatePrediction();}}
    if(this.elapsed>4.2){this.flying=false;this.status("Landed · replay ready");this.updatePrediction();}
    setBallTelemetry(this.root,"flight",`${this.elapsed.toFixed(1)}s`);setBallTelemetry(this.root,"distance",`${(this.distance*7.5).toFixed(1)} m`);setBallTelemetry(this.root,"height",`${(this.maxHeight*6).toFixed(1)} m`);setBallTelemetry(this.root,"bounces",String(this.bounces));
  }
  updateCamera(){
    if(this.cameraMode==="follow"&&this.flying){this.camera.position.x+=(this.ball.position.x*.42-this.camera.position.x)*.08;this.camera.position.y+=(1+this.ball.position.y*.14-this.camera.position.y)*.08;this.camera.position.z+=(5.4-this.camera.position.z)*.08;this.camera.lookAt(this.ball.position.x*.35,Math.max(0,this.ball.position.y*.25),0);}
    else if(this.cameraMode==="field"){this.camera.position.x+=(0-this.camera.position.x)*.08;this.camera.position.y+=(1.5-this.camera.position.y)*.08;this.camera.position.z+=(7.5-this.camera.position.z)*.08;this.camera.lookAt(0,-.05,0);}
    else this.camera.lookAt(0,-.1,0);
  }
  tick(time){if(this.disposed||!this.visible){this.raf=0;return;}const dt=this.lastTime?Math.min(.05,(time-this.lastTime)/1000):1/60;this.lastTime=time;if(this.flying){this.accumulator+=dt;while(this.accumulator>=1/120){this.simulate(1/120);this.accumulator-=1/120;}}else if(!this.dragging&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){this.ball.rotation.y+=dt*.26;this.ball.rotation.x+=this.angularVelocity.x;this.ball.rotation.y+=this.angularVelocity.y;this.angularVelocity.multiplyScalar(.92);}this.updateCamera();this.renderer.render(this.scene,this.camera);this.raf=requestAnimationFrame(next=>this.tick(next));}
  start(){if(this.raf||this.disposed||!this.renderer)return;this.lastTime=0;this.raf=requestAnimationFrame(time=>this.tick(time));}
  stop(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.lastTime=0;}
  resize(){if(!this.renderer||!this.stage.isConnected)return;const rect=this.stage.getBoundingClientRect();if(!rect.width||!rect.height)return;this.renderer.setSize(rect.width,rect.height,false);this.camera.aspect=rect.width/rect.height;this.camera.updateProjectionMatrix();}
  reset(resetControls=true){if(resetControls){const speed=this.root.querySelector('[data-ball-sim-control="speed"]'),spin=this.root.querySelector('[data-ball-sim-control="spin"]'),curve=this.root.querySelector('[data-ball-sim-control="curve"]');if(speed)speed.value=72;if(spin)spin.value=18;if(curve)curve.value=12;}this.flying=false;this.elapsed=0;this.distance=0;this.maxHeight=0;this.bounces=0;this.lastTrailPoint=null;if(this.ball){this.ball.position.set(0,-.28,0);this.ball.rotation.set(-.08,-.45,.06);this.velocity.set(0,0,0);this.angularVelocity.set(0,0,0);this.trailCount=0;this.trail.geometry.setDrawRange(0,0);}this.resetView();updateBallSimulation(this.root);this.status("Ready · drag the 3D ball or kick");setBallTelemetry(this.root,"flight","Ready");setBallTelemetry(this.root,"distance","0.0 m");setBallTelemetry(this.root,"height","0.0 m");setBallTelemetry(this.root,"bounces","0");}
  dispose(){this.disposed=true;this.stop();this.resizeObserver?.disconnect();this.intersectionObserver?.disconnect();this.listeners.forEach(([target,type,handler,options])=>target?.removeEventListener(type,handler,options));this.listeners=[];if(this.scene)disposeThreeObject(this.scene);this.renderer?.dispose?.();this.renderer?.forceContextLoss?.();this.root._ball3D=null;}
}
function runBallSimulation(root=document.querySelector("[data-ball-sim]")) {
  if(!root)return;updateBallSimulation(root);if(root._ball3D?.THREE){root._ball3D.kick();return;}
  const {speed,spin,curve}=readBallSimulationValues(root),duration=Math.max(620,1500-speed*7);root.style.setProperty("--sim-duration",`${duration}ms`);root.style.setProperty("--sim-flight-x",`${Math.round(curve*.9)}px`);root.style.setProperty("--sim-spin-angle",`${Math.round(spin*3.6)}deg`);root.classList.remove("sim-kicking");void root.offsetWidth;root.classList.add("sim-kicking");setBallTelemetry(root,"status",`In flight · ${speed} km/h`);setBallTelemetry(root,"flight",`${(duration/1000).toFixed(1)}s arc`);window.clearTimeout(root._simTimer);root._simTimer=window.setTimeout(()=>{root.classList.remove("sim-kicking");setBallTelemetry(root,"status","Landed · replay ready");},duration+80);
}
function resetBallSimulation(root=document.querySelector("[data-ball-sim]")) { if(!root)return;window.clearTimeout(root._simTimer);root.classList.remove("sim-kicking");if(root._ball3D){root._ball3D.reset(true);return;}const speed=root.querySelector('[data-ball-sim-control="speed"]'),spin=root.querySelector('[data-ball-sim-control="spin"]'),curve=root.querySelector('[data-ball-sim-control="curve"]');if(speed)speed.value=72;if(spin)spin.value=18;if(curve)curve.value=12;updateBallSimulation(root);setBallTelemetry(root,"status","Ready to kick");setBallTelemetry(root,"flight","Ready"); }
function cleanupBallSimulations(){ball3DControllers.forEach(controller=>controller.dispose());ball3DControllers.clear();}
function bindBallSimulation() {
  document.querySelectorAll("[data-ball-sim]").forEach(root=>{
    updateBallSimulation(root);root.querySelectorAll("[data-ball-sim-control]").forEach(input=>input.addEventListener("input",()=>updateBallSimulation(root)));
    const controller=new DigitalTwinBall3D(root);root._ball3D=controller;ball3DControllers.add(controller);controller.init();
  });
}
function loginView() {
  const user=accountUser();
  const message=accountRuntime.error ? `<div class="form-feedback" role="alert">${esc(accountRuntime.error)}</div>` : "";
  if(user)return `<div class="detail-hero"><div><div class="eyebrow">Account access</div><h1>Your Google account is connected.</h1><p class="lede">${esc(user.email||user.displayName||"Signed in")}</p></div><section class="panel panel-pad">${message}${button("Open passport","route-learning","primary full")}${guestDraftAvailable(user.uid)?`<div style="margin-top:12px">${button("Import this device’s draft","import-guest-draft","small full")}</div>`:""}<div style="margin-top:12px">${button("Sign out","google-signout","small full")}</div></section></div>`;
  return `<div class="detail-hero"><div><div class="eyebrow">Account access</div><h1>Return to your change.</h1><p class="lede">Sign in to keep your private Change Passport with your Google account.</p></div><section class="panel panel-pad">${message}${button(accountRuntime.busy?"Connecting…":accountRuntime.ready?"Continue with Google":"Loading Google sign-in…","google-signin","primary full",firebaseConfigured&&(!accountRuntime.ready||accountRuntime.busy)?"disabled":"")}${!firebaseConfigured?`<div class="footer-note">Google sign-in is ready for Firebase project configuration.</div>`:""}</section></div>`;
}
function guestDraftAvailable(uid) {
  if(!uid)return false;
  try {
    if(localStorage.getItem(`btc-imported-guest-draft:${uid}`))return false;
    const draft=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
    return Boolean(draft.passport?.name||draft.drafts?.passport?.display_name||draft.learning?.enrolled?.length);
  } catch(_){return false;}
}
async function importGuestDraft() {
  const user=accountUser();if(!user||!guestDraftAvailable(user.uid))return;
  if(!window.confirm("Import this device’s local passport and learning drafts into this Google account? Existing account profile fields may be replaced."))return;
  const guest=loadState(STORAGE_KEY), p=guest.passport, draft=guest.drafts.passport||{};
  const values={display_name:draft.display_name||p.name||user.displayName||"",slug:draft.slug||p.slug||"",continent:draft.continent||p.continent,country:draft.country||p.country,city:draft.city||p.city,bio:draft.bio||p.bio,languages:p.languages,availability:p.availability,participation:p.participation,birth_month:p.birthMonth,birth_year:p.birthYear,avatar_url:p.avatarUrl,referred_by_user_id:p.referredById,skills:p.skills,interests:p.interests};
  if(p.name||draft.display_name){
    const result=await saveProfileRecord(values);
    if(!result.ok){accountRuntime.error=result.error;render();return;}
  }
  state.learning=guest.learning;
  state.drafts=guest.drafts;
  state.onboarding=guest.onboarding;
  persist();
  try{localStorage.setItem(`btc-imported-guest-draft:${user.uid}`,"1");}catch(_){}
  accountRuntime.error="";showToast("Device draft imported",p.name||draft.display_name?"Your passport is saved to your Google account.":"Your local learning draft is now attached to this browser account.");navigate("profile");
}
function legalView(kind) {
  const privacy=kind==="privacy";
  const title=privacy?"Privacy policy":"Terms of participation";
  const intro=privacy?"Your trust matters. This policy explains what is private, what can be published, and how consent and corrections work.":"Be useful, be honest, and help keep the network safe. These terms describe how public records, missions, learning, evidence, and contributions should be used.";
  const sections=privacy?[["Data minimization","We only need the information required for a member, mission, learning, event, funding, or evidence workflow. Optional profile fields stay private until you choose to share them."],["Public versus private","Published records show a source, date, geography, status, and verification level. Youth information, safeguarding reports, private documents, precise vulnerable-project locations, and personal contact details remain protected."],["Your choices","You can request access, correction, export, or deletion. Consent can be withdrawn where appropriate, and correction history should preserve the audit trail without exposing sensitive information."]]:[["Record integrity","Do not present targets, proposals, self-reported activity, or AI-generated material as verified facts. Use the status shown on each record."],["Safe participation","Respect safeguarding guidance, obtain appropriate consent, avoid exposing youth details, and report harmful or misleading content through an authorized channel."],["Independent position","Be The Change is an independent SDG action network aligned with the UN Sustainable Development Goals. It does not imply UN affiliation, endorsement, accreditation, or a signed partnership without documentation."]];
  return `<div class="legal-page panel panel-pad"><div class="eyebrow">Independent SDG action network · last reviewed 02 Sep 2026</div><h1 class="section-title">${title}</h1><p class="lede">${intro}</p>${sections.map(([heading,copy])=>`<section class="legal-section"><h2>${heading}</h2><p class="prose">${copy}</p></section>`).join("")}<div class="footer-note">${firebaseConfigured?"Google account passports are private in Firestore. Other drafts may remain in this browser until their account workflows are connected.":"This preview uses local browser drafts only."} A production deployment must attach collections, uploads, permissions, consent records, verification decisions, and audit events to an authenticated account and published policy.</div><div style="margin-top:24px">${button("Return home","route-home","primary")}${button(privacy?"View terms":"View privacy policy",privacy?"route-terms":"route-privacy","text")}</div></div>`;
}

function legacyAdminView() {
  return `<div>${pageHead("Administration","Operate with accountability.","Role-based workspaces for records, approvals, budgets, evidence, content, permissions, and audit logs.")}<div class="admin-shell"><aside class="panel admin-nav">${["Dashboard","People","Organizations","Countries","Missions","Education","Events","Sports","Funding","Evidence","Impact Claims","Products","Permissions","Audit Logs","Settings"].map(x=>`<button class="${state.adminTab===x?"active":""}" data-action="admin-tab">${x}</button>`).join("")}</aside><main><div class="grid admin-kpis">${[[seed.missions.length,"Public mission records"],[seed.courses.length,"Course records"],[seed.countries.length,"Country records"],["0","Pending evidence"]].map(([n,l])=>`<article class="panel admin-kpi"><div class="eyebrow">${esc(state.adminTab)} · current index</div><strong>${n}</strong><span>${l}</span></article>`).join("")}</div><section class="section panel panel-pad"><div class="section-head"><div><div class="eyebrow">${esc(state.adminTab)} · review queue</div><h2 class="section-title" style="font-size:30px">Human approval is the feature.</h2><p class="section-copy">AI drafts, imported records, funding claims, public stories, and evidence all need a named status and reviewer.</p></div>${button("Create record","open-mission-wizard","primary")}</div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Record</th><th>Type</th><th>Status</th><th>Owner</th><th>Next action</th></tr></thead><tbody>${[["Peace in Action · Ghana","Mission","Draft","Country coordinator","Review need"],["Digital Twin Football","Mission","Needs Verification","Project steward","Confirm record"],["Peacebuilding & Open Collaboration","Course","Draft—Requires Review","Education admin","Review outline"],["$5M Ghana activation plan","Budget","Proposed","Finance reviewer","Add line items"],["Global Peace in Action · Opening","Event","Planned","Event organizer","Confirm agenda"]].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${statusBadge(r[2])}</td><td>${r[3]}</td><td><button class="btn small" data-action="show-record">${r[4]}</button></td></tr>`).join("")}</tbody></table></div></section></main></div></div>`;
}

const IMPACT_BREAKDOWNS = {
  "global-map": ["Global map","Draft","Public country anchors and reviewed location records are available through See The Change. Exact coordinates are generalized or withheld when safety requires it.","Map records · provenance · privacy controls"],
  "mission-progress": ["Mission progress","Empty","No verified active mission total is presented yet. A steward must connect a mission, evidence, date range, geography, and reviewer before progress is shown.","Mission status · evidence review · correction history"],
  "learning-completion": ["Learning completion","Empty","No learner completion total is presented yet. Course progress remains private to the learner until an authorized learning system is connected.","Course progress · enrollment · credentials"],
  "funding-flow": ["Funding flow","Empty","No public funding transactions are presented. Proposed budgets, requests, receipts, and audited amounts remain distinct records.","Funding status · source documents · audit trail"],
  "evidence-status": ["Evidence status","Empty","No evidence submissions are counted here yet. Submissions require consent, review, and a published status before they can support an impact claim.","Consent · reviewer · verification status"],
  stories: ["Stories","Draft","Stories are an editorial record type. Publication requires a source, consent, attribution, and review of the claims shown.","Source · consent · editorial review"],
  lessons: ["Lessons","Empty","No completed mission lessons are published yet. Approved reflections can later connect learning back to a mission record.","Reflection · linked mission · approval"],
  replication: ["Replication","Empty","No replication kits are published yet. A kit should identify the source mission, context, adaptations, safety notes, and evidence requirements.","Source mission · adaptation · evidence plan"],
};
function breakdownRecord(section,id) {
  if(section==="explore") {
    const record=exploreRecords().find(item=>(item.id||item.title)===id);
    if(!record)return null;
    return {title:record.title,eyebrow:record.type,status:record.verification||"Draft",location:record.country||"Global",overview:record.purpose,details:[["Record type",record.type],["Country",record.country||"Global"],["Source",record.source||"Be The Change public index"],["Public status",record.verification||"Draft"]],sdgs:record.sdgs||[],action:record.type==="Mission"?"open-mission":record.type==="Course"?"open-course":record.type==="Country"?"route-country":"show-record",actionLabel:record.type==="Mission"?"Open mission":record.type==="Course"?"Open course":record.type==="Country"?"Open country":"Prepare record" ,actionId:record.id};
  }
  if(section==="missions") {
    const m=seed.missions.find(item=>item.id===id); if(!m)return null;
    return {title:m.title,eyebrow:"Mission record",status:m.verification,location:`${m.location} · ${m.country}`,overview:m.purpose,details:[["Mission stage",m.stage],["Country",m.country],["Skills needed",m.skills.join(" · ")],["Learning path",m.linkedCourse||"Not linked"],["Evidence plan",m.evidence||"Pending steward review"]],sdgs:m.sdgs,action:"open-mission",actionLabel:"Open mission",actionId:m.id};
  }
  if(section==="education") {
    const c=seed.courses.find(item=>item.id===id); if(!c)return null;
    return {title:c.title,eyebrow:"Course record",status:c.label,location:c.mission||"Global catalog",overview:c.purpose,details:[["Level",c.level],["Duration",c.duration],["Format",c.format],["Access",c.access],["Linked mission",c.mission]],sdgs:c.sdgs,action:"open-course",actionLabel:"Open course",actionId:c.id};
  }
  if(section==="events") {
    const e=seed.events.find(item=>item.id===id); if(!e)return null;
    return {title:e.title,eyebrow:e.type,status:e.status,location:e.location,overview:"A public event record with a clear date, format, location, organizer path, and associated mission.",details:[["Date",e.date],["Format",e.type],["Location",e.location],["Associated mission",e.mission],["Registration","Not connected in this preview"]],sdgs:e.sdgs||["SDG 16","SDG 17"],action:"show-record",actionLabel:"View event record"};
  }
  if(section==="impact") {
    const value=IMPACT_BREAKDOWNS[id]||IMPACT_BREAKDOWNS["global-map"]; return {title:value[0],eyebrow:"Impact method",status:value[1],location:"Public impact index",overview:value[2],details:[["Current state",value[1]],["What is required",value[3]],["Totals",value[1]==="Empty"?"Not presented":"Method and records required"],["Privacy","Sensitive records remain restricted"]],sdgs:["SDG 16","SDG 17"],action:"open-evidence-form",actionLabel:"Submit evidence"};
  }
  if(section==="partners") {
    if(id==="partner-directory")return {title:"Partner directory",eyebrow:"Partner pathway",status:"Prospective",location:"Global",overview:"Organizations can offer funding, skills, learning, space, sport, evidence support, or local trust. A prospective record is not an endorsement or agreement.",details:[["Relationship statuses","Prospective · In Discussion · Agreement Pending · Active · Verified"],["Possible contributions","Funding · skills · learning · space · sport · evidence"],["Public claim","No endorsement inferred"],["Next step","Submit an organization record for review"]],sdgs:["SDG 17"],action:"open-partner-form",actionLabel:"Register organization"};
    if(id==="institution-portal")return {title:"Schools & universities",eyebrow:"Institution portal",status:"Open pathway",location:"Global",overview:"Institutions can host courses, join missions, register safe events, and publish evidence with a clear record and appropriate safeguarding review.",details:[["Institution types","Schools · universities"],["Possible actions","Host courses · join missions · register events"],["Public status","Requires institutional review"],["Next step","Submit an institution record"]],sdgs:["SDG 04","SDG 17"],action:"show-record",actionLabel:"View institution pathway"};
    if(id==="ecosystem-mapper")return {title:"UN Ecosystem Mapper",eyebrow:"Public information layer",status:"Awaiting reviewed entries",location:"Global",overview:"A future-facing directory for public mandates, country presence, programs, grants, SDGs, sources, and last-verified dates. It does not imply endorsement or partnership.",details:[["Source policy","Public information only"],["Verification","Last-verified dates required"],["Brand safety","No logos or partnership claims without documentation"],["Current state","No reviewed entries published"]],sdgs:["SDG 16","SDG 17"],action:"show-record",actionLabel:"View source policy"};
    const index=Number(id?.split("-")[1]), o=seed.organizations[index]; if(!o)return null;
    return {title:o.name,eyebrow:o.type,status:o.status,location:o.country,overview:o.note,details:[["Organization type",o.type],["Country",o.country],["Relationship status",o.status],["Source", "Existing public organization record"]],sdgs:["SDG 17"],action:"show-record",actionLabel:"View organization record"};
  }
  if(section==="shop") {
    if(id==="football")return {title:"Make your Unity Ball",eyebrow:"Existing product record · retained",status:"Design request",location:"Global",overview:"Choose a sport, country, SDG, mission, colors, and message. The QR-linked identity is a concept workflow; manufacturing and checkout are not connected.",details:[["Product type","Digital Twin Football"],["Availability","Design request only"],["Commerce","Manufacturing and checkout not connected"],["Next step","Prepare a design request"]],sdgs:["SDG 03","SDG 16","SDG 17"],action:"open-ball-config",actionLabel:"Open configurator"};
    const product=SPORT_PRODUCTS.find(item=>item.id===id); if(!product)return null;
    return {title:product.name,eyebrow:product.category,status:product.status,location:"Global concept collection",overview:product.description,details:[["Equipment concept",product.name],["Mission connection",product.needs],["Availability","Concept visual · no price or inventory published"],["Commerce","Manufacturing and checkout require approval"]],sdgs:product.sdgs,action:"open-ball-config",actionLabel:"Configure unity product"};
  }
  return null;
}
function breakdownModalMarkup() {
  const record=breakdownRecord(state.modal?.section,state.modal?.id)||{title:"Record unavailable",eyebrow:"Public index",status:"Needs review",location:"Not published",overview:"This record is not available in the current public index. No content was fabricated.",details:[["Availability","Unavailable"],["Next step","Return to the page and choose another record"]],sdgs:[],action:"close-modal",actionLabel:"Close"};
  const twinExtras=record.title==="Digital Twin Football"?`<div class="twin-modal-sim">${footballArt({interactive:true})}</div>${digitalTwinPlanMarkup()}`:"";
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal breakdown-modal ${record.title==="Digital Twin Football"?"breakdown-modal-expanded":""}" data-modal-body><div class="modal-head"><div><div class="eyebrow">${esc(record.eyebrow)}</div><h2>${esc(record.title)}</h2></div><button class="close-btn" data-action="close-modal" aria-label="Close breakdown">×</button></div>${statusBadge(record.status)}<p class="breakdown-overview">${esc(record.overview)}</p><div class="card-meta breakdown-sdgs">${(record.sdgs||[]).map(s=>tag(s))}</div><div class="breakdown-details">${record.details.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("")}</div>${twinExtras}<div class="breakdown-actions">${record.action==="open-mission"||record.action==="open-course"?`<button class="btn primary" data-action="${record.action}" data-id="${esc(record.actionId||"")}">${esc(record.actionLabel)} ${icon("arrow")}</button>`:record.action==="route-country"?`<button class="btn primary" data-action="route-country" data-id="${esc(record.actionId||"")}">${esc(record.actionLabel)} ${icon("arrow")}</button>`:button(record.actionLabel,record.action,"primary")}${record.title==="Digital Twin Football"?button("Build a prospectus","open-prospectus","text"):""}</div><div class="footer-note">This breakdown uses the same public record shown on the page. Status, source, privacy, and verification remain explicit.</div></div></div>`;
}
function coursePreviewMarkup() {
  const course=courseForId(state.modal?.courseId)||state.learning.generatedCourse||studioDraft(), modules=classroomModules(course), assessment=normaliseCourseAssessment(course.assessment);
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal course-preview-modal" data-modal-body role="dialog" aria-modal="true" aria-labelledby="course-preview-title"><div class="modal-head"><div><div class="eyebrow">Learner preview · draft only</div><h2 id="course-preview-title">${esc(course.title||"Untitled course")}</h2></div><button class="close-btn" data-action="close-modal" aria-label="Close learner preview">${icon("close")}</button></div><p class="breakdown-overview">${esc(course.purpose||"Add a purpose and observable outcomes in the studio.")}</p><div class="card-meta">${tag(course.level||"Foundational")}${tag(course.format||"Cohort or self-paced")}${tag(`${modules.length} modules`,"violet")}</div><div class="course-preview-grid"><section><div class="eyebrow">Learner pathway</div>${modules.map((module,index)=>`<article class="course-preview-module"><span>${String(index+1).padStart(2,"0")}</span><div><h3>${esc(module.title)}</h3><p>${esc(module.objective||module.activity||"Learning objective pending instructor edit.")}</p></div></article>`).join("")}</section><aside><div class="eyebrow">Completion</div><div class="course-preview-side"><strong>${esc(assessment.method)}</strong><p>${esc(assessment.rubric)}</p></div><div class="course-preview-side"><div class="eyebrow">Evidence task</div><p>${esc(course.evidenceTask||"Evidence task pending review.")}</p></div><div class="course-preview-side"><div class="eyebrow">Safety and access</div><p>${esc(course.safetyNote||"Safeguarding note pending review.")}</p><p>${esc(course.accessibilityNotes||"Accessibility notes pending review.")}</p></div></aside></div><div class="preview-actions">${button("Back to studio","close-modal")}<button class="btn primary" data-action="enter-classroom" data-id="${esc(course.id)}">Open native classroom ${icon("arrow")}</button></div><div class="footer-note">This preview shows the learner-facing shape. It is not a credential, accreditation, endorsement, or publication.</div></div></div>`;
}
function adminEventModalMarkup() {
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal admin-entry-modal" data-modal-body><div class="modal-head"><div><div class="eyebrow">Owner workspace · Events</div><h2>Add event</h2></div><button class="close-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><p class="section-copy">Add the fields used by the public calendar and GeoRSS feed. Events stay attributable, status-labeled, and moderation-aware.</p><div class="form-grid"><div class="field full-width"><label for="admin-entry-title">Event title <span class="required-mark">*</span></label><input id="admin-entry-title" required placeholder="A clear event name" /></div><div class="field"><label for="admin-entry-status">Status</label><select id="admin-entry-status"><option>Planned</option><option>Needs Review</option><option>Published</option><option>Completed</option><option>Cancelled</option></select></div><div class="field"><label for="admin-entry-type">Format</label><select id="admin-entry-type"><option>Campaign</option><option>Workshop</option><option>School event</option><option>Sports event</option><option>Community event</option><option>Virtual</option></select></div><div class="field"><label for="admin-entry-date">Date / time</label><input id="admin-entry-date" type="datetime-local" /></div><div class="field"><label for="admin-entry-country">Country</label><input id="admin-entry-country" placeholder="Ghana or Global" /></div><div class="field"><label for="admin-entry-location">Location</label><input id="admin-entry-location" placeholder="City, venue, or online" /></div><div class="field"><label for="admin-entry-organizer">Organizer</label><input id="admin-entry-organizer" placeholder="Organizer or host" /></div><div class="field"><label for="admin-entry-lat">Latitude</label><input id="admin-entry-lat" type="number" min="-90" max="90" step="any" placeholder="Optional map point" /></div><div class="field"><label for="admin-entry-lng">Longitude</label><input id="admin-entry-lng" type="number" min="-180" max="180" step="any" placeholder="Optional map point" /></div><div class="field"><label for="admin-entry-visibility">Visibility</label><select id="admin-entry-visibility"><option value="public">Public index + GeoRSS</option><option value="private">Private review</option></select></div><div class="field full-width"><label for="admin-entry-summary">Description</label><textarea id="admin-entry-summary" placeholder="What is happening, and what should participants know?"></textarea></div><div class="field full-width"><label for="admin-entry-source-url">Source / registration URL</label><input id="admin-entry-source-url" type="url" placeholder="https://…" /></div><div class="field full-width"><label for="admin-entry-details">Notes</label><textarea id="admin-entry-details" placeholder="Safeguarding, access, or reviewer notes."></textarea></div></div><div class="form-feedback" data-form-feedback role="alert"></div>${button("Save event","admin-save-entry","primary full")}</div></div>`;
}
function adminEntryModalMarkup(tab) {
  if(tab==="Events")return adminEventModalMarkup();
  const locationTab=["Locations","Schools","Universities","Orphanages"].includes(tab);
  const category=tab==="Schools"?"school":tab==="Universities"?"university":tab==="Orphanages"?"children_home":"mission";
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal admin-entry-modal" data-modal-body><div class="modal-head"><div><div class="eyebrow">Owner workspace · ${esc(tab)}</div><h2>Add ${esc(tab)} entry</h2></div><button class="close-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><p class="section-copy">Create a structured record for this tab. It is attributed to the owner, written to the audit log, and can appear publicly when visibility is set to public.</p><div class="form-grid">${locationTab?`<div class="field full-width"><label for="admin-entry-title">Name <span class="required-mark">*</span></label><input id="admin-entry-title" required placeholder="Record name" /></div><div class="field"><label for="admin-entry-category">Category</label><select id="admin-entry-category"><option value="${category}">${category.replace("children_home","children’s home")}</option><option value="mission">Mission</option><option value="event">Event</option><option value="partner">Organization / partner</option></select></div><div class="field"><label for="admin-entry-country">Country ISO3 <span class="required-mark">*</span></label><input id="admin-entry-country" required maxlength="3" value="LBR" placeholder="GHA" /></div><div class="field"><label for="admin-entry-county">County / region</label><input id="admin-entry-county" placeholder="County or region" /></div><div class="field"><label for="admin-entry-settlement">City / settlement</label><input id="admin-entry-settlement" placeholder="City or settlement" /></div><div class="field"><label for="admin-entry-lat">Latitude</label><input id="admin-entry-lat" type="number" min="-90" max="90" step="any" placeholder="Optional" /></div><div class="field"><label for="admin-entry-lng">Longitude</label><input id="admin-entry-lng" type="number" min="-180" max="180" step="any" placeholder="Optional" /></div><div class="field"><label for="admin-entry-privacy">Public precision</label><select id="admin-entry-privacy"><option>Approximate</option><option>Settlement</option><option>County/Region</option><option>Country Only</option><option>Hidden</option></select></div><div class="field"><label for="admin-entry-status">Verification</label><select id="admin-entry-status"><option>Needs Review</option><option>Publicly Sourced</option><option>Reviewed</option><option>Verified</option></select></div><div class="field"><label for="admin-entry-visibility">Visibility</label><select id="admin-entry-visibility"><option value="public">Public index</option><option value="private">Private review</option></select></div><div class="field"><label for="admin-entry-source">Source name</label><input id="admin-entry-source" placeholder="Source or steward" /></div><div class="field"><label for="admin-entry-source-url">Source URL</label><input id="admin-entry-source-url" type="url" placeholder="https://…" /></div><div class="field full-width"><label for="admin-entry-summary">Description</label><textarea id="admin-entry-summary" placeholder="What is this record, and what should the public understand?"></textarea></div>`:`<div class="field full-width"><label for="admin-entry-title">Title <span class="required-mark">*</span></label><input id="admin-entry-title" required placeholder="Clear record title" /></div><div class="field"><label for="admin-entry-status">Status</label><select id="admin-entry-status"><option>Draft</option><option>Needs Review</option><option>Proposed</option><option>Planned</option><option>Active</option><option>Verified</option><option>Published</option></select></div><div class="field"><label for="admin-entry-country">Country</label><input id="admin-entry-country" placeholder="Country or Global" /></div><div class="field"><label for="admin-entry-visibility">Visibility</label><select id="admin-entry-visibility"><option value="public">Public index</option><option value="private">Private review</option></select></div><div class="field full-width"><label for="admin-entry-summary">Summary</label><textarea id="admin-entry-summary" placeholder="What should the public understand about this record?"></textarea></div><div class="field full-width"><label for="admin-entry-source-url">Source URL</label><input id="admin-entry-source-url" type="url" placeholder="https://…" /></div><div class="field full-width"><label for="admin-entry-details">Internal notes</label><textarea id="admin-entry-details" placeholder="Optional reviewer notes, linked IDs, or publication context."></textarea></div>`}</div><div class="form-feedback" data-form-feedback role="alert"></div>${button("Save entry","admin-save-entry","primary full")}</div></div>`;
}
function publicRecordModalMarkup(record) {
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-body><div class="modal-head"><div><div class="eyebrow">Public admin record · ${esc(record.tab)}</div><h2>${esc(record.title)}</h2></div><button class="close-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div>${statusBadge(record.status||"Published")}<p class="breakdown-overview">${esc(record.summary||"No summary was added to this public record.")}</p><div class="breakdown-details"><div><span>Country</span><strong>${esc(record.country||"Global")}</strong></div><div><span>Updated</span><strong>${esc(recordDate(record.updated_at))}</strong></div></div>${record.source_url?`<a class="btn primary" href="${esc(record.source_url)}" target="_blank" rel="noreferrer">Open source ${icon("arrow")}</a>`:""}</div></div>`;
}

const DIGITAL_TWIN_PLAN = [
  ["01","Build a real physics model","Treat the ball as a controllable state: velocity, launch angle, drag, spin, curve, bounce, and surface. This makes the simulation useful for coaching, storytelling, and repeatable experiments instead of being only decorative animation."],
  ["02","Make the ball tactile","Support pointer drag, touch gestures, keyboard controls, and a clear kick action. Visitors should understand cause and effect within seconds, including what changed when they added spin or curve."],
  ["03","Show the flight path","Render an arc, landing point, and a compact telemetry strip. A visible trajectory makes the invisible model legible and gives players a reason to try another kick."],
  ["04","Add meaningful scenarios","Create reviewed presets such as pass, cross, free kick, and penalty. Each preset should explain its assumptions and remain a scenario label—not a claim about real-world performance."],
  ["05","Connect the identity layer","Let the QR identity resolve to the ball record, activation, mission, steward, and evidence policy. The physical object then becomes a doorway into the network rather than a disconnected product image."],
  ["06","Design for low bandwidth","Keep the core simulation CSS/DOM based, lazy-load heavier visuals, respect reduced motion, and make every action work without sound or video. This protects access on mobile and inconsistent connections."],
  ["07","Create replayable sessions","Store an optional local replay summary with the chosen inputs, timestamp, and scenario. A future signed-in version can attach consented sessions to a school, team, or public activation record."],
  ["08","Add learning prompts","After a kick, explain one concept—spin changes lift, drag slows the ball, curve changes lateral travel. This turns the interaction into a small sports-science learning moment."],
  ["09","Connect to community evidence","Give stewards a structured activation log for venue, age band, facilitator, consent state, and evidence link. Keep personal data private and publish only reviewed summaries."],
  ["10","Put governance around the agent","Use named roles, allowlisted phone numbers, signed commands, rate limits, two-person approval for sensitive actions, and a complete audit log before WhatsApp can change community records."],
];
function digitalTwinPlanMarkup() {
  return `<section class="twin-plan"><div class="twin-plan-head"><div><div class="eyebrow">Digital Twin Football · 10-part improvement plan</div><h3>From a beautiful object to a useful simulation.</h3><p>The current concept already has the visual identity. The next release should make the ball explain physics, open a mission pathway, and stay trustworthy as a community tool.</p></div><div class="twin-plan-mark">10<br><small>WAYS</small></div></div><div class="twin-plan-grid">${DIGITAL_TWIN_PLAN.map(([number,title,copy])=>`<article class="twin-plan-card"><span>${number}</span><div><h4>${title}</h4><p>${copy}</p></div></article>`).join("")}</div><section class="wa-agent-plan"><div class="eyebrow">Admin dashboard → WhatsApp agent</div><h3>Control selected community actions from verified phone numbers.</h3><p>Connect WhatsApp Business webhooks to a server-side command gateway. Store normalized phone numbers as allowlisted identities, require a one-time account link plus a signed challenge, and map each number to a least-privilege role such as Community Moderator, Country Coordinator, or Emergency Pause Admin.</p><div class="wa-agent-grid"><div><strong>Allowlist</strong><span>Phone number + account ID + role + expiry</span></div><div><strong>Commands</strong><span>Read queue, pause automation, approve a draft, assign a reviewer</span></div><div><strong>Guardrails</strong><span>Confirmation for writes, two-person approval for sensitive actions</span></div><div><strong>Audit</strong><span>Every message, decision, actor, timestamp, and before/after state</span></div></div><p class="micro-note">Never allow a phone number alone to send money, delete records, expose safeguarding data, or publish unreviewed impact. The agent should call the same permission-checked admin APIs as the dashboard.</p></section></section>`;
}

function prospectusValuesFromDom() {
  const keys=["title","tagline","problem","solution","audience","location","sdgs","activities","outcomes","ask","owner","contact"];
  const next={...state.prospectus};keys.forEach(key=>{const input=document.getElementById(`prospectus-${key}`);if(input)next[key]=input.value.trim();});
  return next;
}
function prospectusField(key,label,placeholder,full=false) {
  const value=esc(state.prospectus?.[key]||"");
  const area=["problem","solution","activities","outcomes","ask"].includes(key);
  return `<div class="field ${full?"full-width":""}"><label for="prospectus-${key}">${label}</label>${area?`<textarea id="prospectus-${key}" placeholder="${placeholder}">${value}</textarea>`:`<input id="prospectus-${key}" value="${value}" placeholder="${placeholder}" />`}</div>`;
}
function prospectusOnePageMarkup(p={}) {
  const chips=String(p.sdgs||"").split(",").map(x=>x.trim()).filter(Boolean).slice(0,6);
  return `<article class="prospectus-print-sheet" data-prospectus-sheet><header class="prospectus-sheet-head"><div><div class="eyebrow">BE THE CHANGE · ONE-PAGE PROSPECTUS</div><h1>${esc(p.title||"Untitled project")}</h1><p>${esc(p.tagline||"A clear idea ready for a human review conversation.")}</p></div><span class="prospectus-status">DRAFT<br><small>REVIEWABLE</small></span></header><div class="prospectus-sheet-meta"><span><small>WHERE</small><strong>${esc(p.location||"Global")}</strong></span><span><small>FOR</small><strong>${esc(p.audience||"Community participants")}</strong></span><span><small>OWNER</small><strong>${esc(p.owner||"Project steward")}</strong></span></div><div class="prospectus-sheet-grid"><section><div class="eyebrow">The opportunity</div><h2>Why now</h2><p>${esc(p.problem||"Problem statement to be refined with the community.")}</p><h2>The idea</h2><p>${esc(p.solution||"Solution summary to be refined with the community.")}</p><h2>How it works</h2><p>${esc(p.activities||"Activities and delivery approach to be confirmed.")}</p></section><aside><div class="prospectus-sheet-block"><div class="eyebrow">Intended outcomes</div><p>${esc(p.outcomes||"Outcomes and measures to be agreed with a steward.")}</p></div><div class="prospectus-sheet-block"><div class="eyebrow">The ask</div><p>${esc(p.ask||"Resources, partners, or decisions requested.")}</p></div><div class="prospectus-sheet-block"><div class="eyebrow">Global Goals</div><div class="card-meta">${(chips.length?chips:["SDG 16","SDG 17"]).map(x=>tag(x,"gold")).join("")}</div></div></aside></div><footer class="prospectus-sheet-footer"><span>Contact · ${esc(p.contact||"Not supplied")}</span><span>Draft · ${new Date().toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"})}</span></footer></article>`;
}
function prospectusModalMarkup() {
  if(state.modal?.stage==="preview")return `<div class="modal-backdrop" data-action="close-modal"><div class="modal prospectus-modal prospectus-preview-modal" data-modal-body><div class="modal-head"><div><div class="eyebrow">Generated locally · one page</div><h2>Prospectus preview</h2></div><button class="close-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div>${prospectusOnePageMarkup(state.prospectus)}<div class="prospectus-actions">${button("Edit inputs","prospectus-edit")}${button("Print / save PDF","print-prospectus","primary")}${button("Start another","prospectus-reset","text")}</div><div class="footer-note">This is a reviewable draft. Claims, partners, funding, and impact figures still require named owners and evidence.</div></div></div>`;
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal prospectus-modal" data-modal-body><div class="modal-head"><div><div class="eyebrow">Project / idea toolkit</div><h2>One-page prospectus generator</h2><p class="section-copy">Turn any project idea into a crisp, editable briefing for a partner, funder, school, or community steward.</p></div><button class="close-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><div class="prospectus-form-intro"><span>${icon("spark")}</span><p>Start with plain language. The generator adds structure, not invented facts.</p></div><div class="form-grid">${prospectusField("title","Project or idea name","e.g. Community Football Lab",true)}${prospectusField("tagline","One-line promise","What changes, for whom, and why?",true)}${prospectusField("problem","The opportunity / problem","What is happening now, and what needs to change?",true)}${prospectusField("solution","The idea","What will you do differently?",true)}${prospectusField("audience","Who it is for","Schools, teams, communities, partners…")}${prospectusField("location","Where","Global, country, city, or online")}${prospectusField("sdgs","Global Goals","SDG 16, SDG 17")}${prospectusField("owner","Project steward","Person or organization responsible")}${prospectusField("activities","What will happen","Key activities, delivery steps, or milestones",true)}${prospectusField("outcomes","Intended outcomes","What will be different and how will you know?",true)}${prospectusField("ask","The ask","Resources, partners, permissions, or decisions requested",true)}${prospectusField("contact","Contact","Email, website, or WhatsApp business contact",true)}</div><div class="form-feedback" data-prospectus-feedback role="alert"></div><div class="prospectus-actions">${button("Generate one-page prospectus","generate-prospectus","primary full")}</div></div></div>`;
}
function moreModalMarkup() {
  const features=[
    ["Prospectus generator","Create a one-page brief for any project or idea","open-prospectus","cyan","book"],
    ["Notifications","Inbox and mission updates","show-record","cyan","spark"],
    ["Saved items","Keep missions and courses close","route-my-map","violet","heart"],
    ["Language","English · more translations planned","show-record","blue","globe"],
    ["Events calendar","Gatherings, campaigns, and workshops","route-events","coral","calendar"],
    ["Funding hub","Grants, sponsorship, and scholarships","route-funding","gold","shield"],
    ["Country chapters","Explore the work by place","route-countries","green","globe"],
    ["Schools","Institutional learning pathways","route-schools","teal","book"],
    ["Universities","Research and field projects","route-universities","indigo","book"],
    ["SDG directory","Follow connections across all 17 goals","route-sdgs","rose","spark"],
    ["Privacy & safety","Consent, safeguarding, and reports","route-privacy","slate","lock"],
    ["Methodology","How records become public","route-impact","amber","check"],
    ["Appearance",`${currentTheme()==="light"?"Light":"Dark"} mode · tap to switch`,"toggle-theme","slate","sun"],
  ];
  if(adminIdentityRuntime.isAdmin)features.splice(3,0,["Admin entry","Manage connected public records","route-admin","admin","shield"],["Data Gaps","Review missing sources, evidence, and verification coverage","route-data-gaps","admin","search"]);
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal more-modal" data-modal-body><div class="modal-head"><div><div class="eyebrow">Navigate the network</div><h2>More from the network</h2><p class="section-copy">Move between participation, learning, place, and trust in one connected panel.</p></div><button class="close-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><button class="more-signin more-gradient-cyan" data-action="route-login"><span class="more-card-icon">${icon("user")}</span><span class="more-signin-copy"><strong>${accountUser()?"Account":"Sign in"}</strong><small>${firebaseConfigured?"Your private Change Passport and Google account":"Private profile and account access"}</small></span><span class="more-card-arrow">${icon("arrow")}</span></button><div class="more-feature-grid">${features.map(([title,copy,action,tone,ic])=>`<button class="more-card more-gradient-${tone}" data-action="${action}"><span class="more-card-icon">${icon(ic)}</span><span class="more-card-copy"><strong>${esc(title)}</strong><small>${esc(copy)}</small></span><span class="more-card-arrow">${icon("arrow")}</span></button>`).join("")}</div></div></div>`;
}
const WATCH_VIDEOS = [
  {key:"unity-ball",title:"Unity Ball · Translation Engine",eyebrow:"How the work travels",description:"See how sport, identity, and the Global Goals connect across communities.",url:"https://goalsunityimpact.earth/__l5e/assets-v1/3500e305-1f3d-4db5-bcfd-42b8a8e868f3/translation-engine-unity-ball.mp4"},
  {key:"verification",title:"Global Goals Verification",eyebrow:"How change becomes trusted",description:"Explore the verification layer behind public missions, evidence, and impact records.",url:"https://goalsunityimpact.earth/__l5e/assets-v1/52ebd0ee-7f03-446f-8a72-7179b98969bc/global-goals-verification.mp4"},
  {key:"architecture-of-impact",title:"The Architecture of Impact",eyebrow:"The Unity Ball economy",description:"Derive the Unity Ball economy and follow the architecture that turns shared purpose into measurable impact.",url:"https://labs.landsurveyorsunited.com/change/video/The_Architecture_of_Impact__Deriving_the_Unity_Ball_Economy.mp4"},
  {key:"asset-to-impact",title:"The Asset-to-Impact Pipeline",eyebrow:"The Unity Ball initiative",description:"Trace the pipeline from assets to action, evidence, and impact through the Unity Ball Initiative.",url:"https://labs.landsurveyorsunited.com/change/video/The_Asset-to-Impact_Pipeline__The_Unity_Ball_Initiative.mp4"},
];
function watchModalMarkup() {
  const active=WATCH_VIDEOS.find(video=>video.key===state.modal?.videoKey)||WATCH_VIDEOS[0];
  return `<div class="modal-backdrop theatre-backdrop" data-action="close-modal"><div class="watch-theatre" data-modal-body role="dialog" aria-modal="true" aria-labelledby="watch-title"><video class="watch-modal-background" autoplay muted loop playsinline preload="metadata" aria-hidden="true"><source src="https://labs.landsurveyorsunited.com/change/video/whostorch.mp4" type="video/mp4" /></video><div class="watch-modal-background-scrim" aria-hidden="true"></div><header class="watch-header"><div><div class="eyebrow">Be The Change · film room</div><h2 id="watch-title">How it works</h2></div><button class="close-btn" data-action="close-modal" aria-label="Close video theatre">${icon("close")}</button></header><div class="watch-layout"><nav class="watch-library" aria-label="Choose a film">${WATCH_VIDEOS.map(video=>`<button class="watch-choice ${video.key===active.key?"active":""}" data-action="watch-video" data-video-key="${video.key}" aria-pressed="${video.key===active.key}"><span class="watch-choice-index">0${WATCH_VIDEOS.indexOf(video)+1}</span><span><strong>${esc(video.title)}</strong><small>${esc(video.eyebrow)}</small></span>${icon("arrow")}</button>`).join("")}</nav><section class="watch-player-column"><div class="watch-player-shell"><video data-watch-video controls playsinline autoplay preload="metadata" src="${esc(active.url)}" aria-label="${esc(active.title)}"></video><div class="watch-player-glow" aria-hidden="true"></div></div><div class="watch-now-playing"><div><span class="eyebrow">Now playing</span><h3>${esc(active.title)}</h3><p>${esc(active.description)}</p></div><button class="btn small" data-action="video-fullscreen" title="Expand video" aria-label="Expand video">${icon("expand")}<span>Expand</span></button></div></section></div><footer class="watch-footer"><span>${WATCH_VIDEOS.length} films · responsive playback controls</span><span>Use the player’s fullscreen control for an immersive view.</span></footer></div></div>`;
}
function missionOnboardingMarkup() {
  const o=state.onboarding, mission=seed.missions.find(item=>item.id===o.missionId)||seed.missions[0], step=o.step;
  const steps=[["01","Mission","Choose a clear next step"],["02","Your contribution","Match what you can offer"],["03","Practical details","Set your context"],["04","Review","Save a local draft"]];
  let body="";
  if(step===1)body=`<div class="onboarding-intro"><span class="eyebrow">Step 01 · mission fit</span><h3>Choose the work you want to move.</h3><p>Select a public mission. Its needs, stage, and evidence plan stay visible throughout onboarding.</p></div><div class="onboarding-mission-list">${seed.missions.map(item=>`<button class="onboarding-mission ${item.id===mission.id?"active":""}" data-action="onboarding-select-mission" data-mission-id="${item.id}" aria-pressed="${item.id===mission.id}"><span class="onboarding-radio"></span><span><strong>${esc(item.title)}</strong><small>${esc(item.stage)} · ${esc(item.country)}</small><em>${esc(item.skills.slice(0,3).join(" · "))}</em></span></button>`).join("")}</div>`;
  if(step===2)body=`<div class="onboarding-intro"><span class="eyebrow">Step 02 · contribution</span><h3>What can you bring?</h3><p>This stays a private preference until you choose to share it. The mission needs ${esc(mission.skills.join(", "))}.</p></div><div class="field"><label for="onboarding-skills">Skills or lived experience</label><input id="onboarding-skills" data-onboarding-field="skills" value="${esc(o.skills.join(", "))}" placeholder="e.g. facilitation, storytelling, community knowledge" /></div><div class="field"><label for="onboarding-interests">Causes or questions</label><textarea id="onboarding-interests" data-onboarding-field="interests" placeholder="What makes this mission meaningful to you?">${esc(o.interests)}</textarea></div><div class="onboarding-match">${tag("Transparent match","green")}<span>Your answers suggest a conversation, never an automatic assignment.</span></div>`;
  if(step===3)body=`<div class="onboarding-intro"><span class="eyebrow">Step 03 · practical details</span><h3>Make the next step realistic.</h3><p>Choose broad context only. Precise location and sensitive details are never required here.</p></div><div class="form-grid"><div class="field"><label for="onboarding-country">Country or region</label><select id="onboarding-country" data-onboarding-field="country"><option value="">Select a country</option>${PROFILE_COUNTRY_OPTIONS.map(country=>`<option value="${esc(country)}" ${o.country===country?"selected":""}>${esc(countryOptionLabel(PROFILE_COUNTRY_DISPLAY[country]||country))}</option>`).join("")}<option value="Global" ${o.country==="Global"?"selected":""}>${esc(countryOptionLabel("Global"))}</option><option value="Prefer not to say" ${o.country==="Prefer not to say"?"selected":""}>Prefer not to say</option></select></div><div class="field"><label for="onboarding-availability">Availability</label><select id="onboarding-availability" data-onboarding-field="availability">${["Not set","1–3 hours / week","4–8 hours / week","Project-based"].map(value=>`<option ${o.availability===value?"selected":""}>${value}</option>`).join("")}</select></div><div class="field full-width"><label for="onboarding-participation">Participation preference</label><select id="onboarding-participation" data-onboarding-field="participation"><option ${o.participation==="Remote and in-person"?"selected":""}>Remote and in-person</option><option ${o.participation==="Remote only"?"selected":""}>Remote only</option><option ${o.participation==="In-person only"?"selected":""}>In-person only</option></select></div></div><div class="onboarding-privacy">${icon("lock")} <span>Location and contact details remain private. A coordinator only sees what you explicitly share.</span></div>`;
  if(step===4)body=`<div class="onboarding-intro"><span class="eyebrow">Step 04 · review</span><h3>Ready to save this mission draft?</h3><p>Review your proposed next step. This draft stays in this browser; it does not contact a mission team.</p></div><div class="onboarding-summary"><div><span>Mission</span><strong>${esc(mission.title)}</strong></div><div><span>Contribution</span><strong>${esc(o.skills.join(", ")||"Not set yet")}</strong></div><div><span>Context</span><strong>${esc(o.country)} · ${esc(o.availability)}</strong></div><div><span>Learning link</span><strong>${esc(mission.linkedCourse||"Evidence pathway")}</strong></div></div><label class="onboarding-consent"><input type="checkbox" data-onboarding-field="consent" ${o.consent?"checked":""} /><span>I understand this saves a local draft only. It does not join a team or confirm placement.</span></label>`;
  return `<div class="modal-backdrop onboarding-backdrop" data-action="close-modal"><div class="modal mission-onboarding" data-modal-body role="dialog" aria-modal="true" aria-labelledby="onboarding-title"><div class="modal-head"><div><div class="eyebrow">Mission onboarding · local draft</div><h2 id="onboarding-title">Find your place in the work.</h2></div><button class="close-btn" data-action="close-modal" aria-label="Close mission onboarding">${icon("close")}</button></div><div class="onboarding-progress" aria-label="Onboarding progress">${steps.map(([number,label,copy],index)=>`<div class="onboarding-step ${index+1===step?"active":""} ${index+1<step?"done":""}"><span>${number}</span><strong>${label}</strong><small>${copy}</small></div>`).join("")}</div><div class="onboarding-body">${body}</div><div class="form-feedback" data-form-feedback data-onboarding-feedback role="alert"></div><div class="onboarding-actions">${step>1?button("Back","onboarding-back"):button("Save and close","close-modal")}<span class="onboarding-save-note">Autosaved locally · step ${step} of 4</span>${step<4?button("Continue","onboarding-next","primary"):button("Save private draft","onboarding-complete","primary")}</div></div></div>`;
}

function personalizationModalMarkup(){
  return `<div class="modal-backdrop personalization-backdrop"><div class="modal personalization-modal" data-modal-body role="dialog" aria-modal="true" aria-labelledby="personalization-heading">${personalizationWelcome()}</div></div>`;
}
function modal() {
  if (!state.modal) return "";
  const type=state.modal.type;
  if(["map-checkin","map-personal-place","map-proposal","map-record","map-note"].includes(type))return mapActionModalMarkup(type);
  if(type==="breakdown") return breakdownModalMarkup();
  if(type==="prospectus") return prospectusModalMarkup();
  if(type==="course-preview") return coursePreviewMarkup();
  if(type==="admin-entry") return adminEntryModalMarkup(state.modal.tab||state.adminTab);
  if(type==="public-record") { const record=publicRecordsRuntime.records.find(item=>item.id===state.modal.recordId); return record?publicRecordModalMarkup(record):""; }
  if (type==="more") return moreModalMarkup();
  if (type==="watch") return watchModalMarkup();
  if (type==="mission-onboarding") return missionOnboardingMarkup();
  if (type==="media-submit") return mediaSubmitModalMarkup(state.modal.countryId,state.modal.mediaType);
  if (type==="job-post") return jobPostModalMarkup();
  if(type==="search") return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-body><div class="modal-head"><h2>Search the network</h2><button class="close-btn" data-action="close-modal">${icon("close")}</button></div><div class="search-box">${icon("search")}<input id="modal-search" autofocus placeholder="Search anything…" /></div><p class="micro-note" style="margin-top:17px">Search includes public people, skills, missions, countries, courses, events, organizations, schools, universities, funding, and stories.</p><div style="margin-top:20px">${button("Open Explore","route-explore","primary")}</div></div></div>`;
  if(type==="join") { const p=state.passport; return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-body><div class="modal-head"><h2>Build your Change Passport</h2><button class="close-btn" data-action="close-modal">${icon("close")}</button></div><div class="field"><label for="passport-name">Display name</label><input id="passport-name" value="${esc(p.name)}" placeholder="How should we call you?" /></div><div class="field"><label for="passport-slug">Profile slug ${p.slug?"(locked)":""}</label><input id="passport-slug" data-profile-slug="passport" value="${esc(p.slug)}" placeholder="e.g. ama-boateng" maxlength="40" ${p.slug?"readonly":""} /><span class="micro-note" data-profile-slug-status>${p.slug?`Reserved as ${esc(p.slug)}`:"Lowercase letters, numbers, and hyphens · checked when you type"}</span></div><div class="field"><label for="passport-bio">Biography or résumé summary</label><textarea id="passport-bio" placeholder="Describe experience, community knowledge, or what you’re learning."></textarea></div><div class="field"><label for="passport-cv">Résumé or CV upload</label><input id="passport-cv" type="file" accept=".pdf,.docx,.txt" /><span class="micro-note">Private draft input · no claim is published automatically.</span></div><div class="field"><label for="passport-skills">Skills to start with</label><input id="passport-skills" value="${esc(p.skills.join(", "))}" placeholder="e.g. facilitation, design, research" /></div><div class="field"><label for="passport-interests">Causes or SDGs</label><input id="passport-interests" value="${esc(p.interests.join(", "))}" placeholder="e.g. peace, education, SDG 16" /></div><div class="form-grid">${profileLocationFields("passport",p)}<div class="field"><label for="passport-languages">Languages</label><input id="passport-languages" placeholder="e.g. English, Twi" /></div><div class="field"><label for="passport-availability">Availability</label><select id="passport-availability"><option>Not set</option><option>1–3 hours / week</option><option>4–8 hours / week</option><option>Project-based</option></select></div><div class="field"><label for="passport-mode">Participation</label><select id="passport-mode"><option>Remote and in-person</option><option>Remote only</option><option>In-person only</option></select></div></div><div class="micro-note" style="margin-bottom:16px">Extracted or suggested skills are only added after your approval. Your profile location is private by default. Safeguarding and emergency fields stay restricted.</div><div style="display:flex;gap:8px;flex-wrap:wrap">${button("Suggest skills for approval","extract-skills")}${button("Save my passport","save-passport","primary")}</div></div></div>`; }
  if(type==="peace-form") return formModal("Register a peace activity","Campaign records stay pending moderation until an organizer reviews them.",[["Activity name","text","activity-name","School peace circle"],["Organizer","text","activity-organizer","Your name or organization"],["Date","date","activity-date",""],["Format","select","activity-format","In-person|Virtual|Hybrid"],["Location","text","activity-location","City, school, or online"],["Safeguarding note","textarea","activity-safety","What consent, accessibility, or safeguarding support is in place?"]],"Submit for moderation","submit-peace");
  if(type==="evidence-form")return impactEvidenceModal();
  if(type==="impact-claim-detail")return impactClaimDetailModal();
  if(type==="impact-claim-editor")return impactClaimEditorModal();
  if(type==="partner-form") return formModal("Register an organization","This creates a prospective record. It does not create a partnership or endorsement.",[["Public name","text","partner-name","Organization name"],["Country","text","partner-country","Ghana"],["Contribution","textarea","partner-contribution","What could you contribute to a mission?"]],"Create prospective record","submit-partner");
  if(type==="mission-wizard") return formModal("Draft a mission","AI can assist later. A human steward owns the need, budget, evidence plan, and submission.",[["Mission title","text","mission-title","A clear, community-defined need"],["Location","text","mission-location","Country, city, or community"],["Need statement","textarea","mission-need","What is the community asking to change?"],["Skills needed","text","mission-skills","e.g. facilitation, research, logistics"],["SDGs","text","mission-sdgs","e.g. SDG 04, SDG 16"],["Human approval","checkbox","mission-approval","I understand this draft is not published or verified."]],"Save mission draft","save-mission");
  if(type==="ball-config") return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-body><div class="modal-head"><h2>Make your Unity Ball</h2><button class="close-btn" data-action="close-modal">${icon("close")}</button></div><p class="section-copy">A design request, not a completed purchase. Manufacturing and checkout are not connected in this workspace.</p><div class="form-grid" style="margin-top:20px"><div class="field"><label>Sport</label><select><option>Football / soccer</option><option>Basketball</option><option>Cricket</option><option>Community-created sport</option></select></div><div class="field"><label>Country</label><select><option value="Ghana">${esc(countryOptionLabel("Ghana"))}</option><option value="Global">${esc(countryOptionLabel("Global"))}</option></select></div><div class="field"><label>SDG</label><select>${seed.sdgs.map(x=>`<option>${x[0]} · ${x[1]}</option>`).join("")}</select></div><div class="field"><label>Mission</label><select>${seed.missions.map(x=>`<option>${x.title}</option>`).join("")}</select></div><div class="field full-width"><label>Colors and message</label><input placeholder="e.g. ocean blue, Peace in Action" /></div></div>${button("Save design request","save-ball","primary full")}</div></div>`;
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-body><div class="modal-head"><h2>Record detail</h2><button class="close-btn" data-action="close-modal">${icon("close")}</button></div><p class="prose">This action is prepared for an authorized workflow. It will create a structured record with a stable ID, owner, status, consent, and audit trail when connected to an account.</p>${button("Understood","close-modal","primary")}</div></div>`;
}
function mapActionModalMarkup(type) {
  const record=mapRecords().find(item=>item.id===state.modal.recordId), draft=state.modal.draft||{}, proposal=state.modal.proposal||{};
  const wrapper=(title,body,actions)=>`<div class="modal-backdrop" data-action="close-modal"><div class="modal map-action-modal" data-modal-body role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h2>${esc(title)}</h2><button class="close-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div>${body}<div class="form-feedback" data-form-feedback role="alert"></div><div class="map-modal-actions">${actions}</div></div></div>`;
  if(type==="map-note"){const item=mapRuntime.savedItems.find(saved=>saved.localId===state.modal.itemId);return wrapper("Saved place note",`<div class="field"><label for="map-note-collection">Collection</label><select id="map-note-collection"><option ${item?.collection!=="Fieldwork"?"selected":""}>Saved Places</option><option ${item?.collection==="Fieldwork"?"selected":""}>Fieldwork</option></select></div><div class="field"><label for="map-note-text">Private note</label><textarea id="map-note-text" maxlength="500" placeholder="Context for your next visit">${esc(item?.note||"")}</textarea></div>`,button("Save note","map-save-note","primary"));}
  if(type==="map-record"){const destination=record?.type==="event"?"events":record?.type==="school"?"schools":["university","college"].includes(record?.type)?"universities":record?.type==="partner"?"partners":record?.type==="impact"?"impact":record?.type==="mission"?"missions":null;return wrapper(record?.name||"Map record",`<div class="eyebrow">${esc(record?mapRecordLabel(record):"Public record")}</div><p class="section-copy">${esc(record?.description||"No public description has been published.")}</p><div class="map-detail-rows"><div><span>Country</span><strong>${esc(record?.country||"Not published")}</strong></div><div><span>Area</span><strong>${esc(record?.county||"Not published")}</strong></div><div><span>Status</span><strong>${esc(record?.verification||"Needs Review")}</strong></div><div><span>Source</span><strong>${esc(record?.source||"Not published")}</strong></div><div><span>Public precision</span><strong>${esc(record?.privacy||"Approximate")}</strong></div></div>`,`${destination?`<button class="btn primary" data-action="map-open-section" data-map-section="${destination}">Explore ${destination}</button>`:""}${button("Close","close-modal")}`);}
  if(type==="map-checkin")return wrapper(`Check in · ${record?.name||draft.recordName||"Place"}`,`<p class="section-copy">Describe your participation. Submission is private by default and reviewed before any public activity appears.</p><div class="field"><label for="map-checkin-text">What did you do?</label><textarea id="map-checkin-text" maxlength="500" placeholder="A short account of your activity">${esc(draft.status_text||"")}</textarea></div><div class="field"><label for="map-checkin-evidence">Evidence link (optional)</label><input id="map-checkin-evidence" type="url" maxlength="500" placeholder="https://…" value="${esc(draft.evidence_url||"")}" /><small>Only a reviewer can see this link.</small></div><label class="map-evidence-consent"><input id="map-checkin-consent" type="checkbox" ${draft.consent_confirmed?"checked":""} /> I have permission to share anything shown at this link.</label><div class="field"><label for="map-checkin-visibility">After approval</label><select id="map-checkin-visibility"><option value="private" ${draft.visibility!=="public"?"selected":""}>Keep private</option><option value="public" ${draft.visibility==="public"?"selected":""}>Show a public activity note</option></select></div><p class="micro-note">Exact device location is not collected. A check-in is self-reported and does not verify impact.</p>`,`${button("Save private draft","map-checkin-save")}${button("Submit for review","map-checkin-submit","primary")}`);
  if(type==="map-personal-place")return wrapper("Add personal place",`<p class="section-copy">This place remains private on this device.</p><div class="form-grid"><div class="field full-width"><label for="map-place-name">Name</label><input id="map-place-name" maxlength="160" placeholder="A place to remember" /></div><div class="field"><label for="map-place-country">Country</label><select id="map-place-country">${COUNTRY_RECORDS.map(country=>`<option value="${country.iso3}" ${country.iso3===state.map.country?"selected":""}>${esc(countryOptionLabel(country))}</option>`).join("")}</select></div><div class="field"><label for="map-place-note">Note</label><input id="map-place-note" maxlength="240" placeholder="Why save it?" /></div><div class="field"><label for="map-place-lat">Latitude</label><input id="map-place-lat" type="number" step="any" min="-90" max="90" placeholder="Optional" /></div><div class="field"><label for="map-place-lng">Longitude</label><input id="map-place-lng" type="number" step="any" min="-180" max="180" placeholder="Optional" /></div></div>`,button("Save private place","map-personal-save","primary"));
  return wrapper("Propose public place",`<p class="section-copy">A steward reviews the source, precision, and safety of this place before it appears publicly.</p><div class="form-grid"><div class="field full-width"><label for="map-proposal-name">Place name</label><input id="map-proposal-name" maxlength="160" value="${esc(proposal.name||"")}" /></div><div class="field"><label for="map-proposal-country">Country</label><select id="map-proposal-country">${COUNTRY_RECORDS.map(country=>`<option value="${country.iso3}" ${country.iso3===(proposal.country_iso3||state.map.country)?"selected":""}>${esc(countryOptionLabel(country))}</option>`).join("")}</select></div><div class="field"><label for="map-proposal-category">Type</label><select id="map-proposal-category">${["mission","school","university","college","partner","event","impact"].map(type=>`<option value="${type}" ${proposal.category===type?"selected":""}>${type}</option>`).join("")}</select></div><div class="field"><label for="map-proposal-county">Region or county</label><input id="map-proposal-county" maxlength="120" value="${esc(proposal.county||"")}" /></div><div class="field"><label for="map-proposal-settlement">Settlement</label><input id="map-proposal-settlement" maxlength="120" value="${esc(proposal.settlement||"")}" /></div><div class="field"><label for="map-proposal-lat">Latitude</label><input id="map-proposal-lat" type="number" step="any" min="-90" max="90" placeholder="Optional" value="${proposal.latitude??""}" /></div><div class="field"><label for="map-proposal-lng">Longitude</label><input id="map-proposal-lng" type="number" step="any" min="-180" max="180" placeholder="Optional" value="${proposal.longitude??""}" /></div><div class="field full-width"><label for="map-proposal-source">Source</label><input id="map-proposal-source" maxlength="180" placeholder="Where can a reviewer verify it?" value="${esc(proposal.source_name||"")}" /></div><div class="field full-width"><label for="map-proposal-note">Review note</label><textarea id="map-proposal-note" maxlength="500" placeholder="Context and location safety considerations">${esc(proposal.note||"")}</textarea></div></div>`,button("Submit for review","map-proposal-submit","primary"));
}
function formModal(title, copy, fields, submit, action) {
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-body><div class="modal-head"><div><h2>${title}</h2><p class="section-copy">${copy}</p></div><button class="close-btn" data-action="close-modal">${icon("close")}</button></div><div class="form-grid">${fields.map(([label,type,id,placeholder])=>type==="checkbox"?`<div class="field full-width"><div class="check-chip"><input id="${id}" type="checkbox"/><label for="${id}">${placeholder}</label></div></div>`:`<div class="field ${type==="textarea"?"full-width":""}"><label for="${id}">${label}${["activity-safety","evidence-link"].includes(id)?"":" <span class='required-mark'>*</span>"}</label>${type==="select"?`<select id="${id}">${placeholder.split("|").map(x=>`<option>${x}</option>`).join("")}</select>`:`<${type==="textarea"?"textarea":"input"} id="${id}" type="${type==="textarea"?"":type}" placeholder="${placeholder}" ${["activity-safety","evidence-link"].includes(id)?"":"required"}></${type==="textarea"?"textarea":"input"}`}</div>`).join("")}</div><div class="form-feedback" data-form-feedback role="alert"></div>${button(submit,action,"primary full")}</div></div>`;
}

const ADMIN_TABS=["Overview","Enterprise Ops","WhatsApp Control Center","Users","Locations","Map Review","Countries","Chapters","Missions","Education","Green Jobs","Schools","Universities","Orphanages","Organizations","Partners","Events","Sports","Funding","Evidence","Impact Claims","Media","Jukebox","Content","Reports","Audit Log","Settings"];
function adminView() {
  const tab=ADMIN_TABS.includes(state.adminTab)?state.adminTab:"Overview", rows=LIBERIA_LOCATIONS;
  const locationsTab=["Locations","Schools","Universities","Orphanages"].includes(tab);
  return `<div class="admin-page"><div class="admin-topline"><div>${button("← Back to app","route-home","text")}<div class="eyebrow">Restricted workspace · role-based access</div><h1>Administration</h1><p>Manage canonical records, review provenance, and keep public map data safe.</p></div><div class="admin-permission">${tag("Owner / admin only","violet")}<small>Writes require server-side authorization.</small></div></div><div class="admin-shell"><aside class="panel admin-nav">${ADMIN_TABS.map(item=>`<button class="${tab===item?"active":""}" data-action="admin-tab">${item}</button>`).join("")}</aside><main class="admin-main"><div class="grid admin-kpis">${[[rows.length,"Public location records"],[COUNTRY_RECORDS.length,"Country anchors"],[LIBERIA_COUNTIES.length,"Liberian counties"],["0","Pending evidence"]].map(([n,l])=>`<article class="panel admin-kpi"><div class="eyebrow">${esc(tab)}</div><strong>${n}</strong><span>${l}</span></article>`).join("")}</div><section class="panel admin-workspace"><div class="admin-workspace-head"><div><div class="eyebrow">${esc(tab)} · canonical collections</div><h2>${locationsTab?"Location management":"Human approval is the feature."}</h2><p>${locationsTab?"Coordinates, geometry, privacy, provenance, and verification stay in the same record used by the public GIS.":"Every user, mission, course, event, funding claim, and evidence record carries a named status and audit trail."}</p></div><div class="admin-actions">${button("Import","admin-import","small")}${button("Export","admin-export","small")}${button("+ Add","admin-add","small primary")}</div></div>${locationsTab?`<div class="admin-location-filters"><input placeholder="Search locations…" aria-label="Search locations"/><select><option>All categories</option><option>School</option><option>University</option><option>Children’s home</option></select><select><option>All verification</option><option>Publicly Sourced</option><option>Needs Review</option><option>Verified</option></select></div><div class="data-table-wrap"><table class="data-table admin-location-table"><thead><tr><th>Name</th><th>Category</th><th>Country</th><th>County / settlement</th><th>Coordinates</th><th>Privacy</th><th>Source / verification</th><th>Actions</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${esc(r.name)}</strong></td><td>${esc(mapRecordLabel(r))}</td><td>Liberia</td><td>${esc(r.county)} · ${esc(r.city)}</td><td>${r.lat==null?"Generalized":`${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`}</td><td>${tag(r.privacy,"violet")}</td><td>${statusBadge(r.verification)}<small class="table-note">${esc(r.source)}</small></td><td><button class="btn small" data-action="admin-row-action">View</button></td></tr>`).join("")}</tbody></table></div><div class="admin-footer-note">Import supports Point, Line, Polygon, GeoJSON, CSV coordinates, and KML where supported. Verified records are never silently overwritten; duplicate candidates enter review.</div>`:`<div class="admin-review-grid">${[["User access","Roles, chapters, skills, consent, status, last active"],["Education","Courses, modules, instructors, enrollments, credentials"],["Missions","Needs, teams, related courses, funding, evidence"],["Audit Log","Create, edit, verify, archive, restore, merge, permission changes"]].map(([title,copy])=>`<article class="admin-review-card"><span class="record-symbol cyan">◎</span><div><h3>${title}</h3><p>${copy}</p><button class="card-link" data-action="admin-row-action">Open workspace ${icon("arrow")}</button></div></article>`).join("")}</div>`}</section></main></div></div>`;
}
function adminTabDescription(tab) {
  const descriptions={Overview:"A single control surface for the records that shape the public network.",Users:"Profiles, roles, consent, participation status, and access review.",Locations:"Canonical places, safe precision, provenance, and verification.",Countries:"Country anchors and chapter-level activation records.",Chapters:"Local coordinators, priorities, missions, and chapter readiness.",Missions:"Needs, teams, learning paths, funding, fieldwork, and evidence.",Education:"Courses, modules, instructors, enrollments, and credentials.",Schools:"School records with safe location and safeguarding review.",Universities:"University records, research pathways, and institutional activity.",Orphanages:"Sensitive care records with protected geography and explicit review.",Organizations:"Organizations and their stated contribution pathways.",Partners:"Relationship status, documentation, and contribution records.",Events:"Activities, organizers, dates, formats, and evidence paths.",Sports:"Sport concepts, teams, equipment, and peace activities.",Funding:"Grants, sponsorships, mission support, and financial status.",Evidence:"Submissions, consent, sources, reviewers, and correction history.",Impact:"Claims, indicators, geography, dates, and verification.",Media:"Approve country-linked video and document submissions before public display.",Jukebox:"Moderate country-linked tracks, provider embeds, rights confirmations, ordering, and branding.",Content:"Public stories, lessons, resources, and editorial status.",Reports:"Operational and impact reports with source trails.","Audit Log":"A durable history of create, update, verify, archive, and restore actions.",Settings:"Workspace defaults and publication controls."};
  return descriptions[tab]||"Structured records with an explicit owner, status, source, and review trail.";
}
function dataGapsView() {
  if(!adminIdentityRuntime.isAdmin) return `<section class="empty-state page-error"><div class="eyebrow">Restricted workspace</div><h1>Data Gaps</h1><p>Only an authorized administrator can review data completeness. Sign in with an approved account to continue.</p><div class="page-error-actions">${button("Sign in","route-login","primary")}${button("Return home","route-home")}</div></section>`;
  const gaps=[
    ["Evidence status","No evidence submissions are counted yet.","Consent, source, reviewer, and verification status are required before evidence supports an impact claim."],
    ["Mission progress","No verified active mission total is published.","Connect a mission, evidence record, date range, geography, and reviewer before reporting progress."],
    ["Learning completion","Learner completion data is not connected.","Course progress remains private until an authorized learning system is connected."],
    ["Funding flow","No public funding transactions are presented.","Keep proposed budgets, requests, receipts, audited amounts, and reconciliation records distinct."],
    ["Stories and lessons","Editorial records still need reviewed source trails.","Publication requires a source, consent or attribution, claim review, and a named status."],
    ["Country coverage","Most country chapters remain research-only.","Add locally reviewed priorities, sources, chapter ownership, and activity before treating a country as active."],
  ];
  return `<div class="admin-page"><div class="admin-topline"><div>${button("← Back to app","route-home","text")}<div class="eyebrow">Restricted workspace · data quality</div><h1>Data Gaps</h1><p>Review what is missing before a record becomes a public claim.</p></div><div class="admin-permission">${tag("Owner / admin only","violet")}<small>Read-only coverage review.</small></div></div><main class="admin-main"><section class="panel admin-workspace"><div class="admin-sync-note"><span class="admin-sync-pulse"></span><strong>Coverage review</strong><span>Known gaps are explicit so incomplete data is not mistaken for impact.</span></div><div class="admin-review-grid">${gaps.map(([title,summary,detail])=>`<article class="admin-review-card"><span class="record-symbol gold">!</span><div><h3>${esc(title)}</h3><p>${esc(summary)}</p><small class="table-note">${esc(detail)}</small></div></article>`).join("")}</div></section></main></div>`;
}
function mediaAdminView() {
  const tab="Media", records=adminMediaRuntime.records, pending=records.filter(record=>record.status==="Pending Review").length, approved=records.filter(record=>record.status==="Approved").length;
  const mediaRows=records.length?records.map(record=>`<article class="media-admin-row"><div class="media-admin-row-head"><div><span class="media-type-pill ${record.media_type}">${record.media_type==="music"?"♫":record.media_type==="video"?"▶":"↗"} ${mediaTypeLabel(record.media_type)}</span><h3>${esc(record.title)}</h3><p>${esc(record.creator||"Creator not supplied")} · ${esc(record.country_name||record.country_id)} · ${esc(record.source_type)}</p></div>${statusBadge(record.status)}</div><div class="media-admin-source"><a href="${esc(record.source_url)}" target="_blank" rel="noreferrer">Open submitted source ${icon("arrow")}</a><span>Submitted by @${esc(record.submitted_by||"community")}</span><span>${esc(record.language||"Language not set")}${record.genre?` · ${esc(record.genre)}`:""}</span></div>${record.description?`<p class="media-admin-description">${esc(record.description)}</p>`:""}<div class="media-admin-controls"><input data-admin-media-note="${esc(record.id)}" placeholder="Reviewer note (optional)" value="${esc(record.reviewer_note||"")}" aria-label="Reviewer note for ${esc(record.title)}" /><label class="media-featured-toggle"><input type="checkbox" data-admin-media-featured="${esc(record.id)}" ${record.featured?"checked":""} /> Featured</label><div class="media-admin-buttons">${record.status!=="Approved"?`<button class="btn small primary" data-action="admin-media-status" data-media-id="${esc(record.id)}" data-media-status="Approved">Approve</button>`:""}${record.status!=="Rejected"?`<button class="btn small" data-action="admin-media-status" data-media-id="${esc(record.id)}" data-media-status="Rejected">Reject</button>`:""}${record.status!=="Archived"?`<button class="btn small danger" data-action="admin-media-status" data-media-id="${esc(record.id)}" data-media-status="Archived">Archive</button>`:""}</div></div></article>`).join(""):"<div class=\"media-admin-empty\"><div class=\"eyebrow\">Moderation queue</div><h3>No media submissions yet.</h3><p>Approved music, videos, and documents will appear here after community members submit country-linked sources.</p></div>";
  return `<div class="admin-page"><div class="admin-topline"><div>${button("← Back to app","route-home","text")}<div class="eyebrow">Restricted workspace · ${tab}</div><h1>Media moderation</h1><p>Review country-linked music, videos, and documents before they enter the public media shelves.</p></div><div class="admin-permission">${tag("Owner / admin only","violet")}<small>Writes require server-side authorization.</small></div></div><div class="admin-shell"><aside class="panel admin-nav" aria-label="Admin sections">${ADMIN_TABS.map(item=>`<button class="${tab===item?"active":""}" data-action="admin-tab" data-admin-tab="${esc(item)}">${esc(item)}</button>`).join("")}</aside><main class="admin-main"><div class="grid admin-kpis">${[[pending,"Pending review"],[approved,"Approved"],[records.length,"All submissions"],[COUNTRY_RECORDS.length,"Country chapters"]].map(([n,l])=>`<article class="panel admin-kpi"><div class="eyebrow">Media</div><strong>${n}</strong><span>${l}</span></article>`).join("")}</div><section class="panel admin-workspace"><div class="admin-workspace-head"><div><div class="eyebrow">Media · approval pipeline</div><h2>Review before publishing.</h2><p>${adminTabDescription(tab)} Public country pages query only approved, non-archived rows.</p></div><div class="admin-actions">${button("Refresh","admin-refresh","small")}${button("Export","admin-export","small")}</div></div><div class="admin-sync-note"><span class="admin-sync-pulse"></span><strong>${adminMediaRuntime.loading?"Syncing media queue…":"Connected to the media moderation queue"}</strong><span>Approval, rejection, featuring, and archiving are written to the audit log.</span></div><div class="media-admin-list">${mediaRows}</div></section></main></div></div>`;
}
function adminJukeboxDate(value) { if(!value)return "Not recorded"; try{return new Intl.DateTimeFormat(undefined,{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(value));}catch{return String(value).slice(0,16);} }
function adminJukeboxRows() {
  const filters=state.adminJukeboxFilters||{}, rows=adminJukeboxRuntime.records||[];
  return rows.filter(record=>{
    const country=String(filters.country||"").toLowerCase(), submitter=String(filters.submitter||"").toLowerCase(), genre=String(filters.genre||"").toLowerCase();
    return (!country||`${record.country_name} ${record.country_id}`.toLowerCase().includes(country))&&(!filters.provider||record.provider===filters.provider)&&(!genre||String(record.genre||"").toLowerCase().includes(genre))&&(!submitter||`${record.submitted_by} ${record.user_id}`.toLowerCase().includes(submitter))&&(!filters.status||record.status===filters.status);
  });
}
function jukeboxSettingsForAdmin(countryId) {
  const country=COUNTRY_RECORDS.find(item=>item.id===countryId)||COUNTRY_RECORDS[0], stored=adminJukeboxRuntime.settings.find(item=>item.country_id===country?.id);
  return stored||{country_id:country?.id||"ghana",brand_name:`${country?.name||"Country"} listening room`,tagline:"Community-selected sounds, reviewed before publishing.",accent_color:"#84e4e5",glow_color:"#eacb83",updated_at:""};
}
function jukeboxReportMarkup(report) {
  return `<article class="jukebox-report-row"><div><strong>${esc(report.title||"Removed track")}</strong><span>${esc(report.country_name||report.country_id||"Country unavailable")} · ${esc(report.status||"Track unavailable")}</span></div><p>${esc(report.reason)}</p><div><small>Reported by @${esc(report.username||"community")} · ${esc(adminJukeboxDate(report.created_at))}</small>${report.track_id&&report.status!=="Archived"?`<button class="btn small danger" data-action="admin-jukebox-status" data-jukebox-id="${esc(report.track_id)}" data-jukebox-status="archive">Archive track</button>`:""}</div></article>`;
}
function jukeboxAdminView() {
  const tab="Jukebox", filters=state.adminJukeboxFilters||{}, rows=adminJukeboxRows(), all=adminJukeboxRuntime.records||[], reports=adminJukeboxRuntime.reports||[], pending=all.filter(row=>row.status==="Pending Review").length, approved=all.filter(row=>row.status==="Approved").length, archived=all.filter(row=>row.status==="Archived").length, selectedCountry=state.adminJukeboxSettingsCountry||COUNTRY_RECORDS[0]?.id||"ghana", settings=jukeboxSettingsForAdmin(selectedCountry);
  const statusOptions=["","Pending Review","Approved","Rejected","Archived"].map(value=>`<option value="${esc(value)}" ${filters.status===value?"selected":""}>${value||"All statuses"}</option>`).join("");
  const rowsMarkup=rows.length?rows.map(record=>`<article class="jukebox-admin-row"><div class="jukebox-admin-top"><div class="jukebox-admin-preview"><iframe src="${esc(record.embed_url)}" title="Preview ${esc(record.title)}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media" ></iframe></div><div class="jukebox-admin-heading"><div class="jukebox-admin-labels">${tag(record.status,record.status==="Approved"?"green":record.status==="Rejected"?"coral":"gold")}${record.featured?tag("Featured","violet"):""}<span class="media-type-pill">${esc(record.provider)}</span></div><h3>${esc(record.title)}</h3><p>${esc(record.artist||"Artist not supplied")} · ${esc(record.country_name||record.country_id)}</p><div class="jukebox-admin-meta"><span>Submitted by @${esc(record.submitted_by||"community")}</span><span>${esc(record.genre||"Genre not set")}</span><span>${esc(record.rights_status||"Rights status not set")}</span><span>Submitted ${esc(adminJukeboxDate(record.submitted_at))}</span><span>${record.reviewed_at?`Reviewed ${esc(adminJukeboxDate(record.reviewed_at))}`:"Not reviewed"}</span></div></div></div><div class="jukebox-admin-edit"><label>Title<input data-jukebox-field="title" data-jukebox-id="${esc(record.id)}" value="${esc(record.title)}" /></label><label>Artist<input data-jukebox-field="artist" data-jukebox-id="${esc(record.id)}" value="${esc(record.artist||"")}" /></label><label>Genre<input data-jukebox-field="genre" data-jukebox-id="${esc(record.id)}" value="${esc(record.genre||"")}" /></label><label>Language<input data-jukebox-field="language" data-jukebox-id="${esc(record.id)}" value="${esc(record.language||"")}" /></label><label>Order<input type="number" min="0" max="9999" data-jukebox-field="order_index" data-jukebox-id="${esc(record.id)}" value="${esc(record.order_index)}" /></label><label class="jukebox-url-field">Provider URL<input data-jukebox-field="source_url" data-jukebox-id="${esc(record.id)}" value="${esc(record.source_url)}" /></label><label class="jukebox-note-field">Context note<textarea data-jukebox-field="context_note" data-jukebox-id="${esc(record.id)}" placeholder="Cultural context, without an official-country claim">${esc(record.context_note||"")}</textarea></label><label class="jukebox-note-field">Reviewer note<textarea data-jukebox-field="reviewer_note" data-jukebox-id="${esc(record.id)}" placeholder="Add a moderation note">${esc(record.reviewer_note||"")}</textarea></label></div><div class="jukebox-admin-actions"><label class="media-featured-toggle"><input type="checkbox" data-jukebox-field="featured" data-jukebox-id="${esc(record.id)}" ${record.featured?"checked":""}/> Featured</label><button class="btn small" data-action="admin-jukebox-save" data-jukebox-id="${esc(record.id)}">Save metadata</button><div class="media-admin-buttons">${record.status!=="Approved"?`<button class="btn small primary" data-action="admin-jukebox-status" data-jukebox-id="${esc(record.id)}" data-jukebox-status="approve">Approve</button>`:""}${record.status!=="Rejected"&&record.status!=="Archived"?`<button class="btn small" data-action="admin-jukebox-status" data-jukebox-id="${esc(record.id)}" data-jukebox-status="reject">Reject</button>`:""}${record.status!=="Archived"?`<button class="btn small danger" data-action="admin-jukebox-status" data-jukebox-id="${esc(record.id)}" data-jukebox-status="archive">Archive</button>`:`<button class="btn small" data-action="admin-jukebox-status" data-jukebox-id="${esc(record.id)}" data-jukebox-status="restore">Restore</button>`}</div></div></article>`).join(""):`<div class="media-admin-empty"><div class="eyebrow">Jukebox queue</div><h3>${all.length?"No tracks match these filters.":"No track submissions yet."}</h3><p>${all.length?"Try another country, provider, genre, submitter, or status.":"Country-linked track submissions will appear here for review."}</p></div>`;
  const auditMarkup=(adminJukeboxRuntime.audit||[]).slice(0,8).map(item=>`<li><strong>${esc(item.action.replace("jukebox_",""))}</strong><span>${esc(item.detail||"Moderation action")}</span><time>${esc(adminJukeboxDate(item.created_at))}</time></li>`).join("")||`<li><span>No jukebox actions recorded yet.</span></li>`;
  return `<div class="admin-page"><div class="admin-topline"><div>${button("← Back to app","route-home","text")}<div class="eyebrow">Restricted workspace · ${tab}</div><h1>Country jukebox</h1><p>Review provider-linked tracks before they enter a country’s public listening room.</p></div><div class="admin-permission">${tag("Owner / admin only","violet")}<small>Mutations require the trusted project-owner identity.</small></div></div><div class="admin-shell"><aside class="panel admin-nav" aria-label="Admin sections">${ADMIN_TABS.map(item=>`<button class="${tab===item?"active":""}" data-action="admin-tab" data-admin-tab="${esc(item)}">${esc(item)}</button>`).join("")}</aside><main class="admin-main"><div class="grid admin-kpis">${[[pending,"Pending review"],[approved,"Approved live"],[all.length,"All tracks"],[reports.length,"Open reports"],[archived,"Archived"]].map(([n,l])=>`<article class="panel admin-kpi"><div class="eyebrow">Jukebox</div><strong>${n}</strong><span>${l}</span></article>`).join("")}</div><section class="panel admin-workspace"><div class="admin-workspace-head"><div><div class="eyebrow">Jukebox · approval pipeline</div><h2>Listen, verify, publish.</h2><p>Every preview is an embed from the submitted provider. Approval publishes immediately from the database; no frontend redeploy is needed.</p></div><div class="admin-actions">${button("Refresh","admin-refresh","small")}</div></div><div class="admin-sync-note"><span class="admin-sync-pulse"></span><strong>${adminJukeboxRuntime.loading?"Syncing jukebox queue…":"Live jukebox moderation queue"}</strong><span>Rights confirmation, attribution, timestamps, notes, and actions are retained in the audit trail.</span></div><div class="jukebox-admin-filters"><input data-admin-jukebox-filter="country" value="${esc(filters.country)}" placeholder="Country" aria-label="Filter by country" /><input data-admin-jukebox-filter="genre" value="${esc(filters.genre)}" placeholder="Genre" aria-label="Filter by genre" /><input data-admin-jukebox-filter="submitter" value="${esc(filters.submitter)}" placeholder="Submitter or user ID" aria-label="Filter by submitter" /><select data-admin-jukebox-filter="provider" aria-label="Filter by provider"><option value="">All providers</option>${["YouTube","SoundCloud","Spotify"].map(value=>`<option ${filters.provider===value?"selected":""}>${value}</option>`).join("")}</select><select data-admin-jukebox-filter="status" aria-label="Filter by status">${statusOptions}</select></div><div class="jukebox-admin-list">${rowsMarkup}</div></section><section class="panel admin-workspace jukebox-reports"><div class="admin-workspace-head"><div><div class="eyebrow">Rights & safety</div><h2>Track reports</h2><p>Review public takedown reasons and archive the affected track from this queue.</p></div></div><div class="jukebox-report-list">${reports.length?reports.slice(0,12).map(jukeboxReportMarkup).join(""):`<div class="media-admin-empty"><h3>No reports yet.</h3><p>Public takedown reports will appear here for review.</p></div>`}</div></section><section class="panel admin-workspace jukebox-branding"><div class="admin-workspace-head"><div><div class="eyebrow">Country branding</div><h2>Set the listening-room identity.</h2><p>Branding changes are country-specific. The public player uses these values on its next request.</p></div></div><div class="jukebox-settings-form"><label>Country<select data-jukebox-settings-country>${COUNTRY_RECORDS.map(country=>`<option value="${esc(country.id)}" ${selectedCountry===country.id?"selected":""}>${esc(countryOptionLabel(country))}</option>`).join("")}</select></label><label>Room name<input id="jukebox-setting-brand" value="${esc(settings.brand_name)}" maxlength="100" /></label><label>Tagline<input id="jukebox-setting-tagline" value="${esc(settings.tagline)}" maxlength="240" /></label><label>Accent<input id="jukebox-setting-accent" type="color" value="${esc(settings.accent_color)}" /></label><label>Glow<input id="jukebox-setting-glow" type="color" value="${esc(settings.glow_color)}" /></label><button class="btn small primary" data-action="admin-jukebox-save-settings" data-jukebox-country="${esc(selectedCountry)}">Save branding</button></div></section><section class="panel admin-workspace jukebox-audit"><div class="eyebrow">Audit trail · latest 8</div><h2>Moderation history</h2><ul>${auditMarkup}</ul></section></main></div></div>`;
}
function jobsAdminView() {
  const data=jobRuntime.admin, jobs=data.jobs||[], sources=data.sources||[], pending=jobs.filter(job=>job.moderation_status==="Pending Review").length, published=jobs.filter(job=>job.moderation_status==="Published").length;
  const nav=ADMIN_TABS.map(item=>`<button class="${item==="Green Jobs"?"active":""}" data-action="admin-tab" data-admin-tab="${esc(item)}">${esc(item)}</button>`).join("");
  const queue=jobs.length?jobs.slice(0,100).map(job=>`<article class="job-admin-row"><div><div class="eyebrow">${esc(job.provenance)} · ${esc(job.source_name||"Community")}</div><h3>${esc(job.title)}</h3><p>${esc(job.employer_name)} · ${esc([job.city,job.country].filter(Boolean).join(", ")||job.work_mode)}</p><div class="card-meta">${statusBadge(job.moderation_status)}${tag(`${job.green_score}/100 green fit`,job.green_score>=60?"green":"violet")}</div></div><div class="job-admin-actions">${job.moderation_status!=="Published"?`<button class="btn small primary" data-action="admin-job-status" data-job-id="${esc(job.id)}" data-job-status="Published">Publish</button>`:""}${job.verification!=="Verified"?`<button class="btn small" data-action="admin-job-status" data-job-id="${esc(job.id)}" data-job-status="${esc(job.moderation_status)}" data-job-verification="Verified">Verify</button>`:""}${job.moderation_status!=="Rejected"?`<button class="btn small" data-action="admin-job-status" data-job-id="${esc(job.id)}" data-job-status="Rejected">Reject</button>`:""}${job.moderation_status!=="Archived"?`<button class="btn small danger" data-action="admin-job-status" data-job-id="${esc(job.id)}" data-job-status="Archived">Archive</button>`:""}</div></article>`).join(""):`<div class="media-admin-empty"><h3>No jobs in the queue.</h3><p>Community submissions and feed imports will appear here before anything becomes public.</p></div>`;
  const sourceRows=sources.length?sources.map(source=>`<article class="job-source-row"><div><strong>${esc(source.name)}</strong><span>${esc(source.feed_type.toUpperCase())} · ${source.active?"Active":"Paused"}</span><small>${esc(source.feed_url)}</small></div><div><span class="status-dot ${source.last_error?"pending":"verified"}">${source.last_error?"Needs attention":source.last_success_at?"Healthy":"Not synced"}</span><small>${esc(source.last_error||source.last_success_at||"Awaiting first run")}</small><button class="btn small" data-action="admin-job-sync" data-source-id="${esc(source.id)}">Sync now</button></div></article>`).join(""):`<div class="media-admin-empty"><h3>No approved backfill sources.</h3><p>Add a public HTTPS RSS, Atom, or JSON feed. Imports remain pending until reviewed.</p></div>`;
  return `<div class="admin-page"><div class="admin-topline"><div>${button("← Back to app","route-home","text")}<div class="eyebrow">Restricted workspace · Green Jobs</div><h1>Jobs operations</h1><p>Review submissions, approve feed sources, monitor sync health, and publish from one canonical queue.</p></div><div class="admin-permission">${tag("Owner / admin only","violet")}<small>Backfill never bypasses moderation.</small></div></div><div class="admin-shell"><aside class="panel admin-nav">${nav}</aside><main class="admin-main"><div class="grid admin-kpis">${[[pending,"Pending review"],[published,"Published"],[sources.length,"Backfill sources"],[(data.runs||[]).filter(run=>run.status==="Failed").length,"Failed runs"]].map(([n,l])=>`<article class="panel admin-kpi"><div class="eyebrow">Green Jobs</div><strong>${n}</strong><span>${l}</span></article>`).join("")}</div><section class="panel admin-workspace"><div class="admin-workspace-head"><div><div class="eyebrow">Moderation queue</div><h2>Human approval is the publishing boundary.</h2><p>Check the employer, application destination, role details, source, closing date, and environmental claim.</p></div>${button("Refresh","admin-jobs-refresh","small")}</div>${data.error?`<div class="form-feedback">${esc(data.error)}</div>`:""}<div class="job-admin-list">${queue}</div></section><section class="panel admin-workspace"><div class="admin-workspace-head"><div><div class="eyebrow">Reliable backfill</div><h2>Approved sources and sync health</h2><p>Conditional requests reduce duplicate work. Existing source IDs are updated; matching roles are deduplicated.</p></div></div><div class="job-source-form"><input id="job-source-name" placeholder="Source name" /><input id="job-source-url" type="url" placeholder="https://example.org/jobs/feed.xml" /><select id="job-source-type"><option value="auto">Auto-detect</option><option value="rss">RSS</option><option value="atom">Atom</option><option value="json">JSON</option></select><button class="btn primary small" data-action="admin-job-add-source">Approve source</button></div><div class="job-source-list">${sourceRows}</div></section><section class="panel admin-workspace"><div class="eyebrow">Distribution</div><h2>RSS output</h2><p class="section-copy">The public feed is generated from the same reviewed records as the board, so expired, rejected, pending, and archived roles never leak into syndication.</p><a class="btn" href="/api/jobs/rss.xml" target="_blank" rel="noreferrer">Open public RSS feed ${icon("arrow")}</a></section></main></div></div>`;
}
async function loadJobsAdmin(force=false){
  const runtime=jobRuntime.admin;if(runtime.loading||runtime.loaded&&!force)return;runtime.loading=true;runtime.error="";
  try{const response=await fetch("/api/admin/jobs",{headers:{accept:"application/json"}}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Jobs administration is unavailable.");Object.assign(runtime,{jobs:result.jobs||[],sources:result.sources||[],runs:result.runs||[],loaded:true});}
  catch(error){runtime.error=error.message||"Jobs administration is unavailable.";runtime.loaded=true;}finally{runtime.loading=false;if(state.view==="admin"&&state.adminTab==="Green Jobs")render();}
}
function connectedAdminView() {
  if(!adminIdentityRuntime.isAdmin)return `<section class="empty-state page-error"><div class="eyebrow">Restricted workspace</div><h1>Administration</h1><p>Sign in with an authorized administrator account to review map submissions and network records.</p><div class="page-error-actions">${button("Sign in","route-login","primary")}${button("Return home","route-home")}</div></section>`;
  const requestedTab=state.adminTab==="WhatsApp Gateway"?"WhatsApp Control Center":state.adminTab, tab=ADMIN_TABS.includes(requestedTab)?requestedTab:"Overview", rows=adminRowsForTab(tab), allRecords=adminRuntime.records.length, locations=adminLocationRows().length;
  if(tab==="Map Review")return mapReviewAdminView();
  if(tab==="Evidence"||tab==="Impact Claims")return impactAdminView(tab);
  if(tab==="Media")return mediaAdminView();
  if(tab==="Jukebox")return jukeboxAdminView();
  if(tab==="Green Jobs")return jobsAdminView();
  if(tab==="WhatsApp Control Center")return renderWhatsAppAdmin(state,{persist,render,navigate,toast:showToast,loadAdminData:loadWhatsAppAdminData});
  if(tab==="Enterprise Ops")return `<div class="admin-page"><div class="admin-topline"><div>${button("← Back to app","route-home","text")}<div class="eyebrow">Restricted workspace · role-based access</div><h1>Administration</h1><p>Enterprise feature flags, connector states, validation boundaries, and release readiness.</p></div><div class="admin-permission">${tag("Owner / admin only","violet")}<small>Writes require centralized administrator permission.</small></div></div><div class="admin-shell"><aside class="panel admin-nav" aria-label="Admin sections">${ADMIN_TABS.map(item=>`<button class="${tab===item?"active":""}" data-action="admin-tab" data-admin-tab="${esc(item)}">${esc(item)}</button>`).join("")}</aside><main class="admin-main"><section class="panel admin-workspace">${operationalReadinessView(state.enterprise)}</section></main></div></div>`;
  const pending=adminRuntime.records.filter(record=>/draft|review|pending|proposed|requested/i.test(record.status||"")).length;
  const emptyCopy=tab==="Overview"?"Add an entry from any tab and it will appear here as part of the shared registry.":`No ${tab.toLowerCase()} entries are in the connected admin registry yet. Add the first one to publish a structured record.`;
  return `<div class="admin-page"><div class="admin-topline"><div>${button("← Back to app","route-home","text")}<div class="eyebrow">Restricted workspace · role-based access</div><h1>Administration</h1><p>One connected registry for public records, review status, provenance, and safe publishing.</p></div><div class="admin-permission">${tag("Owner / admin only","violet")}<small>Writes require server-side authorization.</small></div></div><div class="admin-shell"><aside class="panel admin-nav" aria-label="Admin sections">${ADMIN_TABS.map(item=>`<button class="${tab===item?"active":""}" data-action="admin-tab" data-admin-tab="${esc(item)}">${esc(item)}</button>`).join("")}</aside><main class="admin-main"><div class="grid admin-kpis">${[[rows.length,`${tab} records`],[allRecords,"Admin registry entries"],[locations,"Canonical locations"],[pending,"Needs review"]].map(([n,l])=>`<article class="panel admin-kpi"><div class="eyebrow">${esc(tab)}</div><strong>${n}</strong><span>${l}</span></article>`).join("")}</div><section class="panel admin-workspace"><div class="admin-workspace-head"><div><div class="eyebrow">${esc(tab)} · connected collection</div><h2>${esc(tab==="Overview"?"Network control center":`${tab} management`)}</h2><p>${esc(adminTabDescription(tab))}</p></div><div class="admin-actions">${button("Refresh","admin-refresh","small")}${button("Export","admin-export","small")}${button(`+ Add ${tab} entry`,"admin-add","small primary")}</div></div><div class="admin-sync-note"><span class="admin-sync-pulse"></span><strong>${adminRuntime.loading?"Syncing registry…":adminRuntime.error?"Seed data visible · owner connection pending":"Connected to the persistent admin registry"}</strong><span>Public entries reappear in their matching front-end section after publication.</span></div>${adminRuntime.error?`<div class="form-feedback" role="status">${esc(adminRuntime.error)}</div>`:""}<div class="data-table-wrap"><table class="data-table admin-entry-table"><thead><tr><th>Entry</th><th>Collection</th><th>Status</th><th>Country</th><th>Origin</th><th>Updated</th><th>Action</th></tr></thead><tbody>${rows.length?rows.map(row=>`<tr><td><strong>${esc(row.title)}</strong><small class="table-note">${esc(row.summary||"No summary")}</small></td><td>${esc(row.type||tab)}</td><td>${statusBadge(row.status||"Draft")}</td><td>${row.country?countryTag(row.country):tag("Global","green")}</td><td><span class="admin-entry-origin">${esc(row.origin||"Admin record")}</span></td><td>${esc(recordDate(row.updated_at))}</td><td><button class="btn small" data-action="admin-row-action" data-admin-record-id="${esc(row.id)}" data-admin-record-tab="${esc(tab)}">View</button></td></tr>`).join(""): `<tr><td colspan="7"><div class="admin-entry-empty"><div class="eyebrow">${esc(tab)} collection</div><h3>Nothing published here yet.</h3><p>${esc(emptyCopy)}</p><button class="btn small primary" data-action="admin-add" data-admin-tab="${esc(tab)}">Add the first entry</button></div></td></tr>`}</tbody></table></div><div class="admin-footer-note">Every admin-created entry is attributed to the owner, recorded in the audit log, and readable publicly only when its visibility is public and it has not been archived.</div></section></main></div></div>`;
}
function mapReviewAdminView() {
  const nav=ADMIN_TABS.map(item=>`<button class="${item==="Map Review"?"active":""}" data-action="admin-tab" data-admin-tab="${esc(item)}">${esc(item)}</button>`).join("");
  const proposalRows=mapRuntime.adminProposals.map(item=>`<article class="map-review-row"><div><strong>${esc(item.name)}</strong><small>${esc(item.category)} · ${esc(item.country_iso3)} ${esc(item.county||"")} · ${esc(item.status)}</small><p>${esc(item.note||"No review note")}</p><small>Source: ${esc(item.source_name||"Not supplied")} · Coordinates: ${item.latitude==null?"Not supplied":`${Number(item.latitude).toFixed(4)}, ${Number(item.longitude).toFixed(4)}`}</small></div>${item.status==="Needs Review"?`<div class="map-review-actions"><select aria-label="Public precision" data-review-precision><option>Approximate</option><option>County/Region</option><option>Country Only</option></select><button class="btn small primary" data-action="map-review-proposal" data-review-id="${esc(item.id)}" data-review-status="Approved">Approve</button><button class="btn small" data-action="map-review-proposal" data-review-id="${esc(item.id)}" data-review-status="Needs Changes">Needs changes</button><button class="btn small" data-action="map-review-proposal" data-review-id="${esc(item.id)}" data-review-status="Rejected">Reject</button></div>`:""}</article>`).join("");
  const checkinRows=mapRuntime.adminCheckIns.map(item=>`<article class="map-review-row"><div><strong>${esc(item.status_text||"Check-in")}</strong><small>${esc(item.location_id||item.event_id||item.mission_id||"Record")} · ${esc(item.visibility)} · ${esc(item.moderation_status)} · ${esc(new Date(item.timestamp).toLocaleDateString())}</small>${item.evidence_url?`<a class="map-review-evidence" href="${esc(item.evidence_url)}" target="_blank" rel="noopener noreferrer">Open submitted evidence ↗</a>`:""}</div>${item.moderation_status==="Review Required"?`<div class="map-review-actions"><button class="btn small primary" data-action="map-review-checkin" data-review-id="${esc(item.id)}" data-review-status="Approved">Approve</button><button class="btn small" data-action="map-review-checkin" data-review-id="${esc(item.id)}" data-review-status="Needs Changes">Needs changes</button><button class="btn small" data-action="map-review-checkin" data-review-id="${esc(item.id)}" data-review-status="Rejected">Reject</button></div>`:""}</article>`).join("");
  return `<div class="admin-page"><div class="admin-topline"><div>${button("← Back to app","route-home","text")}<div class="eyebrow">Restricted workspace</div><h1>Map review</h1><p>Review public place proposals and check-in activity before publication.</p></div></div><div class="admin-shell"><aside class="panel admin-nav">${nav}</aside><main class="admin-main"><section class="panel admin-workspace"><div class="admin-workspace-head"><div><h2>Proposed places</h2><p>Inspect the source and public precision before approval.</p></div>${button("Refresh","map-review-refresh","small")}</div>${proposalRows||`<p class="section-copy">No proposed places yet.</p>`}</section><section class="panel admin-workspace"><h2>Check-ins</h2><p class="section-copy">Approval never turns a private check-in into a public one.</p>${checkinRows||`<p class="section-copy">No check-ins to review yet.</p>`}</section></main></div></div>`;
}
async function loadMapReview(force=false) {
  if(mapRuntime.adminLoaded&&!force)return;mapRuntime.adminLoaded=true;
  const results=await Promise.allSettled([fetch("/api/admin/map-proposals").then(async response=>response.ok?response.json():[]),fetch("/api/admin/check-ins").then(async response=>response.ok?response.json():[])]);
  mapRuntime.adminProposals=results[0].status==="fulfilled"&&Array.isArray(results[0].value)?results[0].value:[];
  mapRuntime.adminCheckIns=results[1].status==="fulfilled"&&Array.isArray(results[1].value)?results[1].value:[];
  if(state.view==="admin"&&state.adminTab==="Map Review")render();
}
const LIBERIA_COUNTY_CENTERS = {
  Bomi:[6.75,-10.85], Bong:[7.0,-9.47], Gbarpolu:[7.25,-10.2], "Grand Bassa":[5.9,-10.05], "Grand Cape Mount":[6.75,-11.35], "Grand Gedeh":[6.1,-8.13], "Grand Kru":[4.67,-8.2], Lofa:[8.42,-9.75], Margibi:[6.45,-10.35], Maryland:[4.38,-7.72], Montserrado:[6.31,-10.8], Nimba:[7.36,-8.71], "River Cess":[5.9,-9.58], "River Gee":[5.25,-7.87], Sinoe:[5.0,-9.04]
};
function mapCountryRecord(iso) { return COUNTRY_RECORDS.find(country=>country.iso3===iso) || COUNTRY_RECORDS[0]; }
function mapCountryAnchor(country) {
  const record={id:`country-${country.iso3}`,name:country.name,type:"chapter",county:country.region,city:country.name,lat:country.lat,lng:country.lon,description:country.summary,source:"Be The Change country register",verification:country.status==="Activation Planning"?"Draft":"Community Forming",privacy:"Country Only",sdgs:country.sdgs,needs:country.focus,protected:false,country:country.name,countryIso:country.iso3,routeId:country.id};
  return {...record,slug:poiSlug(record)};
}
function mapMissionRecords(iso) {
  return seed.missions.filter(mission=>iso==="GLB"||mission.country===mapCountryRecord(iso).name).map(mission=>{
    const country=COUNTRY_RECORDS.find(item=>item.name===mission.country);
    const record={id:mission.id,name:mission.title,type:"mission",county:country?.region||"Global",city:country?.name||"Global",lat:country?.lat??null,lng:country?.lon??null,description:mission.purpose,source:"Be The Change mission register",verification:mission.verification,privacy:"Country Only",sdgs:mission.sdgs,needs:mission.skills,country:mission.country,stage:mission.stage,routeId:mission.id};
    return {...record,slug:poiSlug(record)};
  });
}
function mapEventRecords(iso) {
  const country=iso==="GLB"?null:mapCountryRecord(iso);
  return eventRuntime.records.filter(event=>iso==="GLB"||!event.country||event.country==="Global"||event.country===country?.name||event.country===iso).map(event=>{const record={id:event.id,name:event.title,type:"event",county:event.location||"Event location",city:event.location||"Location to be confirmed",lat:event.latitude,lng:event.longitude,description:event.summary,source:"Public GeoRSS event feed",verification:event.status||"Published",privacy:"Approximate",sdgs:[],needs:[event.type||"Community event"],protected:false,country:event.country||"Global"};return {...record,slug:poiSlug(record)};});
}
function mapRecords() {
  const iso=state.map?.country||"GHA";
  const serverLocations=mapRuntime.serverRecordsByCountry[iso]||[];
  const locations=iso==="LBR"||iso==="GLB"?[...new Map([...PUBLIC_LOCATION_RECORDS,...serverLocations].map(record=>[record.id,record])).values()]:serverLocations;
  const imported=mapRuntime.customLayers.filter(layer=>layer.visible!==false&&(iso==="GLB"||layer.countryIso===iso||layer.countryIso==="GLB")).flatMap(layer=>(layer.payload?.features||[]).map((feature,index)=>{const point=feature.geometry?.type==="Point"?feature.geometry.coordinates:null;return {id:feature.properties?.mapRecordId||`${layer.localId}-${index}`,name:feature.properties?.name||`Feature ${index+1}`,type:"personal",country:COUNTRY_RECORDS.find(item=>item.iso3===layer.countryIso)?.name||layer.countryIso,countryIso:layer.countryIso,county:layer.name,city:"",lat:point?.[1]??null,lng:point?.[0]??null,description:`${feature.geometry?.type||"Geometry"} from private layer ${layer.name}`,source:"Personal GeoJSON layer",verification:"Private",privacy:"Private",sdgs:[],needs:[]};}));
  const personal=[...mapRuntime.localItems.filter(item=>item.type==="personal"&&(iso==="GLB"||item.countryIso===iso)),...imported];
  let base;
  if(iso==="LBR") base=[mapCountryAnchor(mapCountryRecord("LBR")),...locations,...mapMissionRecords(iso),...mapEventRecords(iso),...personal];
  else if(iso==="GLB") base=[...COUNTRY_RECORDS.map(mapCountryAnchor),...locations,...mapMissionRecords(iso),...mapEventRecords(iso),...personal];
  else {
  const country=mapCountryRecord(iso);
    base=[mapCountryAnchor(country),...locations,...mapMissionRecords(iso),...mapEventRecords(iso),...personal];
  }
  const claims=impactRuntime.claims.filter(item=>item.country_iso3&&(iso==="GLB"||item.country_iso3===iso)).map(item=>{const country=COUNTRY_RECORDS.find(record=>record.iso3===item.country_iso3);if(!country)return null;return {id:`impact-${item.id}`,claimId:item.id,name:item.title,type:"impact",country:country.name,countryIso:country.iso3,county:country.region,city:"Country-level claim",lat:country.lat,lng:country.lon,description:`${Number(item.value).toLocaleString()} ${item.unit} · ${item.indicator_definition}. Country-level marker; no site coordinate is implied.`,source:"Reviewed impact claim",verification:item.status,privacy:"Country Only",sdgs:item.sdg?[item.sdg]:[],needs:[]};}).filter(Boolean);
  base.push(...claims);
  const activity=mapRuntime.publicCheckIns.map(item=>{const linked=base.find(record=>record.id===(item.location_id||item.event_id||item.mission_id));if(!linked||linked.lat==null||linked.lng==null||linked.type==="orphanage")return null;return {id:`checkin-${item.id}`,name:`Activity at ${linked.name}`,type:"checkin",country:linked.country,countryIso:linked.countryIso,county:linked.county,city:linked.city,lat:linked.lat,lng:linked.lng,description:item.status_text,source:"Approved community check-in",verification:"Approved",privacy:linked.privacy,sdgs:linked.sdgs||[],needs:[]};}).filter(Boolean);
  return [...base,...activity];
}
function mapVisibleRecords() {
  const m=state.map||defaultState.map, query=(m.search||"").toLowerCase();
  return mapRecords().filter(record=>{
    const hay=[record.name,record.county,record.city,record.type,record.educationType,record.source,...(record.needs||[]),...(record.sdgs||[])].join(" ").toLowerCase();
    if(query&&!hay.includes(query))return false;
    if(m.county!=="All counties"&&record.county!==m.county)return false;
    if(m.recordType!=="All types"&&mapRecordLabel(record)!==m.recordType)return false;
    if(m.educationType!=="All education"&&record.educationType!==m.educationType)return false;
    if(m.sdg!=="All SDGs"&&!(record.sdgs||[]).includes(m.sdg))return false;
    if(m.verification!=="All verification"&&record.verification!==m.verification)return false;
    if(m.missionStage!=="All stages"&&(record.type!=="mission"||record.stage!==m.missionStage))return false;
    if(record.type==="chapter"&&!m.layer.chapters)return false;
    if(record.type==="school"&&!m.layer.schools)return false;
    if(["university","college"].includes(record.type)&&!m.layer.universities)return false;
    if(record.type==="orphanage"&&!m.layer.orphanages)return false;
    if(record.type==="mission"&&!m.layer.missions)return false;
    if(record.type==="event"&&!m.layer.events)return false;
    if(record.type==="partner"&&!m.layer.partners)return false;
    if(record.type==="impact"&&!m.layer.evidence)return false;
    if(record.type==="checkin"&&!m.layer.checkins)return false;
    if(record.type==="personal"&&!m.layer.personal)return false;
    return true;
  });
}
function mapRecordLabel(record) { return MAP_TYPE_META[record.type]?.label || (record.educationType||"Mission site"); }
function mapDisplayPoint(record) {
  if(record.lat!=null&&record.lng!=null)return [record.lat,record.lng];
  const countyCenter=LIBERIA_COUNTY_CENTERS[record.county];
  return countyCenter||[6.4281,-9.4295];
}
function mapPointStyle(record) {
  const iso=state.map?.country||"GHA";
  const [lat,lng]=mapDisplayPoint(record);
  let minLat=4,maxLat=9.5,minLng=-12,maxLng=-7;
  if(iso!=="LBR"&&iso!=="GLB"){const c=mapCountryRecord(iso);minLat=c.lat-5;maxLat=c.lat+5;minLng=c.lon-7;maxLng=c.lon+7;}
  if(iso==="GLB"){minLat=-35;maxLat=38;minLng=-20;maxLng=42;}
  const left=Math.max(4,Math.min(96,((lng-minLng)/(maxLng-minLng))*100));
  const top=Math.max(6,Math.min(94,(1-(lat-minLat)/(maxLat-minLat))*100));
  return `--map-left:${left.toFixed(2)}%;--map-top:${top.toFixed(2)}%`;
}
const LIBERIA_MAP_CITIES = [["Monrovia",6.31,-10.8],["Kakata",6.53,-10.35],["Gbarnga",7,-9.47],["Buchanan",5.89,-10.05],["Ganta",7.23,-8.98],["Sanniquellie",7.36,-8.71]];
function mapCityMarkup() {
  if((state.map?.country||"")!=="LBR")return "";
  return LIBERIA_MAP_CITIES.map(([name,lat,lng])=>`<span class="map-city" style="${mapPointStyle({lat,lng})}"><i></i>${name}</span>`).join("");
}
function mapOrientationMarkup() {
  return `<div class="map-orientation" aria-hidden="true"><span class="map-live-chip"><i></i>MAP RECORDS · VISIBLE LAYERS</span><span class="map-compass"><b>N</b><i></i></span></div><div class="map-data-ribbon">${state.map?.country==="LBR"?"LIBERIA · PUBLIC LOCATIONS":"COUNTRY ANCHORS · GLOBAL DIRECTORY"}<span>Geographic map · 2D view</span></div>`;
}
function mapCountyMarkup() {
  return LIBERIA_COUNTIES.map((county,index)=>{const center=LIBERIA_COUNTY_CENTERS[county]||[6.4,-9.4];const [lat,lng]=center;const left=((lng+12)/5)*100,top=(1-(lat-4)/5.5)*100;return `<button class="county-label" style="--map-left:${Math.max(4,Math.min(92,left))}%;--map-top:${Math.max(8,Math.min(92,top))}%" data-map-county="${esc(county)}" aria-label="Filter ${esc(county)} county">${esc(county)}</button>`;}).join("");
}
function mapLegend() {
  return `<div class="map-legend"><div class="map-legend-title">Map legend</div><div class="map-legend-grid">${Object.entries(MAP_TYPE_META).map(([type,meta])=>`<span><i class="record-symbol ${meta.tone}">${meta.icon}</i>${meta.label}</span>`).join("")}</div><p>Icons and labels carry meaning beyond color.</p></div>`;
}
function mapToolButton(id, iconText, label) {
  const active=state.map.leftTool===id&&!state.map.leftCollapsed;
  return `<button class="map-tool-button ${active?"active":""}" data-action="map-tool" data-map-tool="${id}" aria-label="${label}" aria-pressed="${active}"><span aria-hidden="true">${iconText}</span><small>${label}</small></button>`;
}
function mapLayerModule() {
  const counts={chapters:0,schools:0,universities:0,orphanages:0,missions:0,events:0,partners:0,evidence:0,checkins:0,personal:0};
  mapRecords().forEach(record=>{const key=record.type==="chapter"?"chapters":record.type==="school"?"schools":["university","college"].includes(record.type)?"universities":record.type==="orphanage"?"orphanages":record.type==="mission"?"missions":record.type==="event"?"events":record.type==="partner"?"partners":record.type==="impact"?"evidence":record.type==="checkin"?"checkins":"personal";counts[key]++;});
  return `<div class="map-module-copy"><div class="eyebrow">Layers</div><h3>Visible records</h3><p>Every layer uses the same records as the list.</p></div><div class="map-module-list">${Object.entries(state.map.layer).map(([layer,on])=>`<button class="map-module-row" data-map-layer="${layer}" aria-pressed="${on}"><span class="map-module-icon">${on?"●":"○"}</span><span>${layer.replace(/^./,x=>x.toUpperCase())}</span><small>${counts[layer]||0}</small></button>`).join("")}${mapRuntime.customLayers.map(layer=>`<button class="map-module-row" data-custom-layer="${esc(layer.localId)}" aria-pressed="${layer.visible!==false&&state.map.layer.personal}"><span class="map-module-icon">${layer.visible!==false&&state.map.layer.personal?"●":"○"}</span><span>${esc(layer.name)}</span><small>${layer.payload?.features?.length||0}</small></button>`).join("")}</div><div class="map-layer-add"><button class="btn small" data-action="map-add-personal">+ Personal place</button><button class="btn small" data-action="map-import-layer">Import GeoJSON</button><button class="btn small" data-action="map-add-location">Propose public place</button><input type="file" accept=".geojson,.json,application/geo+json,application/json" data-map-layer-file hidden /></div><p class="map-module-note">Personal layers stay on this device. Proposed public places enter review.</p>`;
}
function mapViewModule() {
  return `<div class="map-module-copy"><div class="eyebrow">Camera</div><h3>View controls</h3><p>Explore the map in top-down, oblique, or Bird’s-Eye View.</p></div><div class="map-camera-actions"><button class="btn small ${!state.map.birdseye?"primary":""}" data-action="map-camera-preset" data-map-preset="top">Top Down</button><button class="btn small ${state.map.birdseye?"primary":""}" data-action="map-camera-preset" data-map-preset="birdseye">Bird’s-Eye</button><button class="btn small" data-action="map-camera-reset">Reset North</button></div><label class="map-range"><span>Pitch <output>${Math.round(state.map.pitch||0)}°</output></span><input type="range" min="0" max="60" value="${Math.round(state.map.pitch||0)}" data-map-camera="pitch" /></label><label class="map-range"><span>Bearing <output>${Math.round(state.map.bearing||0)}°</output></span><input type="range" min="-180" max="180" value="${Math.round(state.map.bearing||0)}" data-map-camera="bearing" /></label><label class="map-range"><span>Field of view <output>${Math.round(state.map.fov||45)}°</output></span><input type="range" min="25" max="75" value="${Math.round(state.map.fov||45)}" data-map-camera="fov" /></label><label class="map-check"><input type="checkbox" data-map-camera="terrain" ${state.map.terrain?"checked":""} /> Terrain where supported</label>`;
}
function mapBasemapModule() {
  return `<div class="map-module-copy"><div class="eyebrow">Basemap</div><h3>Choose context</h3></div><div class="map-basemap-grid">${["satellite","satellite streets","dark","light","terrain","humanitarian"].map(style=>`<button class="map-basemap-option ${state.map.basemap===style?"active":""}" data-map-basemap="${style}"><span class="map-basemap-swatch basemap-${style.replace(/ /g,"-")}"></span><strong>${style}</strong></button>`).join("")}</div><p class="map-module-note">If imagery is unavailable, the map preserves records and falls back to a working public basemap.</p>`;
}
function mapLeftModule() {
  const m=state.map;
  const select=(id,label,value,items)=>`<label class="map-field"><span>${label}</span><select data-map-field="${id}">${items.map(item=>`<option ${value===item?"selected":""}>${esc(item)}</option>`).join("")}</select></label>`;
  if(m.leftTool==="layers")return mapLayerModule();
  if(m.leftTool==="basemap")return mapBasemapModule();
  if(m.leftTool==="view")return mapViewModule();
  if(m.leftTool==="saved")return `<div class="map-module-copy"><div class="eyebrow">Saved maps</div><h3>Keep this view</h3><p>Save the current camera and filters to your browser or My Map when signed in.</p></div><button class="btn small primary" data-action="map-save-view">Save current view</button><button class="btn small" data-action="map-personal-map">Open My Map</button>`;
  if(m.leftTool==="offline")return `<div class="map-module-copy"><div class="eyebrow">Offline</div><h3>Field pack</h3><p>Save this country’s public records and map context for a later field visit.</p></div><button class="btn small primary" data-action="map-offline-pack">Save offline pack</button><div class="map-module-note">Detailed protected basemap tiles are never cached indiscriminately.</div>`;
  if(m.leftTool==="legend")return mapLegend();
  if(m.leftTool==="search")return `<div class="map-module-copy"><div class="eyebrow">Search</div><h3>Find a place</h3><p>Search the same canonical records available in the accessible directory.</p></div><label class="map-field"><span>Global search</span><input class="map-drawer-search" data-map-search value="${esc(m.search||"")}" placeholder="Schools, counties, missions…" /></label>`;
  const areas=[...new Set(mapRecords().map(record=>record.county).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const verifications=[...new Set(mapRecords().map(record=>record.verification).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  return `<div class="map-module-copy"><div class="eyebrow">Filters</div><h3>Explore records</h3><p>Refine records while keeping the geographic view intact.</p></div>${select("county","Region / county",m.county,["All counties",...areas])}${select("recordType","Record type",m.recordType,["All types",...MAP_TYPE_TYPES])}${select("sdg","SDG",m.sdg,["All SDGs",...seed.sdgs.map(x=>x[0])])}${select("missionStage","Mission stage",m.missionStage,["All stages",...new Set(mapRecords().filter(record=>record.type==="mission").map(record=>record.stage).filter(Boolean))])}${select("verification","Verification status",m.verification,["All verification",...verifications])}<div class="map-filter-divider"></div><div class="map-filter-note">Protected care locations never expose exact coordinates.</div><button class="btn small" data-action="map-clear-filters">Clear All</button>`;
}
function mapFilterMarkup() {
  const m=state.map;
  return `<aside class="map-filter-panel ${m.leftCollapsed?"collapsed":""}"><div class="map-tool-rail">${mapToolButton("search","⌕","Search")}${mapToolButton("filters","≡","Filters")}${mapToolButton("layers","◫","Layers")}${mapToolButton("basemap","◈","Basemap")}${mapToolButton("view","◉","View")}${mapToolButton("saved","☆","Saved")}${mapToolButton("offline","⇩","Offline")}${mapToolButton("legend","▤","Legend")}<button class="map-tool-button map-rail-toggle" data-action="map-collapse-filters" aria-label="${m.leftCollapsed?"Expand":"Collapse"} map tools"><span aria-hidden="true">${m.leftCollapsed?"→":"←"}</span><small>${m.leftCollapsed?"Expand":"Collapse"}</small></button></div><div class="map-filter-drawer ${m.leftCollapsed?"hidden":""}"><div class="map-panel-heading"><div><div class="eyebrow">${m.leftTool==="filters"?"Filters":"Map tools"}</div><h2>${m.leftTool==="filters"?"Explore records":m.leftTool}</h2></div><button class="icon-btn" data-action="map-collapse-filters" aria-label="Collapse map tools">×</button></div><div class="map-filter-content">${mapLeftModule()}</div></div></aside>`;
}
function mapStyleFor(name) {
  const raster=(tiles,attribution)=>({version:8,sources:{btcRaster:{type:"raster",tiles:[tiles],tileSize:256,attribution}},layers:[{id:"btc-raster",type:"raster",source:"btcRaster",paint:{"raster-fade-duration":0}}]});
  if(name==="satellite")return raster("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}","© Esri");
  if(name==="satellite streets")return raster("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}","© Esri");
  if(name==="humanitarian")return raster("https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png","© OpenStreetMap contributors · HOT");
  if(name==="light")return raster("https://tile.openstreetmap.org/{z}/{x}/{y}.png","© OpenStreetMap contributors");
  if(name==="terrain")return raster("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}","© Esri");
  return raster("https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png","© CARTO · © OpenStreetMap contributors");
}
function mapGeoJson(records) {
  return {type:"FeatureCollection",features:records.filter(record=>record.lat!=null&&record.lng!=null&&record.source!=="Personal GeoJSON layer").map(record=>({type:"Feature",id:record.id,properties:{id:record.id,slug:record.slug||poiSlug(record),type:record.type,name:record.name},geometry:{type:"Point",coordinates:[Number(record.lng),Number(record.lat)]}}))};
}
function loadMapLibre() {
  if(window.maplibregl)return Promise.resolve(window.maplibregl);
  if(mapRuntime.enginePromise)return mapRuntime.enginePromise;
  mapRuntime.enginePromise=new Promise((resolve,reject)=>{
    if(!document.querySelector("link[data-maplibre-css]")){const link=document.createElement("link");link.rel="stylesheet";link.href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";link.dataset.maplibreCss="true";document.head.appendChild(link);}
    const script=document.createElement("script");script.src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";script.onload=()=>window.maplibregl?resolve(window.maplibregl):reject(new Error("Map engine unavailable"));script.onerror=()=>reject(new Error("Map engine failed to load"));document.head.appendChild(script);
  }).catch(error=>{mapRuntime.enginePromise=null;throw error;});
  return mapRuntime.enginePromise;
}
function initMapEngine(records) {
  if(state.map?.view==="list")return;
  const canvas=document.querySelector("[data-map-canvas]"), target=document.querySelector("[data-maplibre-layer]");
  if(!canvas||!target)return;
  const create=engine=>{
    if(!engine||mapRuntime.glMap)return;
    const m=state.map, country=mapCountryRecord(m.country||"GHA"), point=m.centerLat!=null&&m.centerLng!=null?[m.centerLng,m.centerLat]:m.country==="LBR"?[-9.4295,6.4281]:m.country==="GLB"?[12,5]:[country.lon,country.lat];
    const map=new engine.Map({container:target,style:mapStyleFor(m.basemap),center:point,zoom:Number(m.zoom)||4.3,pitch:Number(m.pitch)||0,bearing:Number(m.bearing)||0,antialias:true,attributionControl:true});
    mapRuntime.glMap=map;
    map.addControl(new engine.NavigationControl({showCompass:true}),"top-right");
    map.addControl(new engine.ScaleControl({maxWidth:100,unit:"metric"}),"bottom-right");
    map.on("load",()=>{
      if(m.terrain){map.addSource("btc-terrain",{type:"raster-dem",tiles:["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],tileSize:256,encoding:"terrarium"});map.setTerrain({source:"btc-terrain",exaggeration:Number(m.terrainExaggeration)||1});}
      map.addSource("btc-records",{type:"geojson",data:mapGeoJson(mapVisibleRecords()),cluster:true,clusterMaxZoom:8,clusterRadius:42});
      map.addLayer({id:"btc-record-clusters",type:"circle",source:"btc-records",filter:["has","point_count"],paint:{"circle-color":"#eacb83","circle-radius":["step",["get","point_count"],18,10,23,30,29],"circle-opacity":.86,"circle-stroke-color":"#07151d","circle-stroke-width":2}});
      map.addLayer({id:"btc-record-cluster-count",type:"symbol",source:"btc-records",filter:["has","point_count"],layout:{"text-field":"{point_count_abbreviated}","text-size":11},paint:{"text-color":"#07151d"}});
      map.addLayer({id:"btc-record-points",type:"circle",source:"btc-records",filter:["!has","point_count"],paint:{"circle-color":["match",["get","type"],"chapter","#eacb83","mission","#f0b65f","event","#92dcac","school","#84e4e5","university","#bca9f1","college","#bca9f1","orphanage","#e7a4a4","personal","#ffffff","checkin","#a8df90","#84e4e5"],"circle-radius":7,"circle-opacity":.92,"circle-stroke-color":"#06222a","circle-stroke-width":2}});
      map.addLayer({id:"btc-record-labels",type:"symbol",source:"btc-records",filter:["!has","point_count"],minzoom:5,layout:{"text-field":["get","name"],"text-size":10,"text-offset":[0,1.5],"text-anchor":"top"},paint:{"text-color":"#f4f8f8","text-halo-color":"#07151d","text-halo-width":1.5}});
      mapRuntime.customLayers.filter(layer=>m.layer.personal&&layer.visible!==false&&(m.country==="GLB"||layer.countryIso===m.country||layer.countryIso==="GLB")).forEach((layer,index)=>{
        try {
          const sourceId=`btc-personal-${index}`, geometry=layer.payload;
          if(!geometry?.features?.length)return;
          map.addSource(sourceId,{type:"geojson",data:geometry});
          map.addLayer({id:`${sourceId}-fill`,type:"fill",source:sourceId,filter:["==",["geometry-type"],"Polygon"],paint:{"fill-color":"#8ee8dc","fill-opacity":.16}});
          map.addLayer({id:`${sourceId}-line`,type:"line",source:sourceId,filter:["in",["geometry-type"],["literal",["LineString","Polygon"]]],paint:{"line-color":"#8ee8dc","line-width":2}});
          map.addLayer({id:`${sourceId}-point`,type:"circle",source:sourceId,filter:["==",["geometry-type"],"Point"],paint:{"circle-color":"#eacb83","circle-radius":6,"circle-stroke-color":"#07151d","circle-stroke-width":2}});
          [`${sourceId}-fill`,`${sourceId}-line`,`${sourceId}-point`].forEach(layerId=>map.on("click",layerId,event=>{const id=event.features?.[0]?.properties?.mapRecordId;if(!id)return;state.map.selectedId=id;state.map.rightOpen="selected";updateMapUrl();render();}));
        } catch(error) { console.info("Personal layer could not be displayed",error?.message||""); }
      });
      // MapLibre can emit non-fatal style/font warnings after `load`. Keep
      // the real map visible once its canvas and records are ready; otherwise
      // a recoverable warning would incorrectly reveal the decorative offline
      // surface underneath.
      canvas.classList.add("map-engine-ready");
      canvas.classList.remove("map-tiles-warn");
      window.BTCOffline?.cachePublicRecords(records.filter(record=>record.type!=="personal")).catch(()=>{});
    });
    map.on("click","btc-record-points",event=>{const properties=event.features?.[0]?.properties||{}, id=properties.id;if(!id)return;state.map.selectedId=id;state.map.selectedSlug=properties.slug||null;state.map.rightOpen="selected";updateMapUrl();render();});
    map.on("click","btc-record-clusters",event=>map.getSource("btc-records")?.getClusterExpansionZoom(event.features[0].properties.cluster_id,(error,zoom)=>{if(!error)map.easeTo({center:event.features[0].geometry.coordinates,zoom});}));
    map.on("mouseenter","btc-record-points",()=>{map.getCanvas().style.cursor="pointer";});
    map.on("mouseleave","btc-record-points",()=>{map.getCanvas().style.cursor="";});
    map.on("moveend",()=>{const center=map.getCenter();state.map.centerLat=Number(center.lat.toFixed(5));state.map.centerLng=Number(center.lng.toFixed(5));state.map.zoom=Number(map.getZoom().toFixed(2));state.map.pitch=Math.round(map.getPitch());state.map.bearing=Math.round(map.getBearing());});
    map.on("error",(event)=>{
      const message=(event?.error?.message||"").toLowerCase();
      const isSourceError=Boolean(event?.sourceId)||/tile|sprite|glyph|worker|unimplemented/i.test(message);
      if(isSourceError&&!canvas.classList.contains("map-engine-ready"))canvas.classList.add("map-tiles-warn");
      // Do not demote a loaded map for recoverable style, glyph, or worker
      // warnings. A true engine failure is handled by the promise rejection
      // above, where the offline surface is intentionally allowed to show.
    });
  };
  const start=()=>{
    // The map can be re-rendered while the CDN script is still loading
    // (GeoRSS and canonical records arrive independently). Only initialize
    // against the current, connected target element.
    if(!target.isConnected||mapRuntime.glMap||!window.maplibregl)return false;
    try { create(window.maplibregl); return true; }
    catch (error) { console.warn("Map engine failed to initialize", error?.message||"unknown error"); canvas.classList.add("map-engine-failed"); return false; }
  };
  if(!start()) {
    loadMapLibre().then(()=>start()).catch(error=>{ console.warn("Map engine failed to load", error?.message||"unknown error"); canvas.classList.add("map-engine-failed"); });
    // If another render replaced the original promise target, or the browser
    // exposed the script before its load callback settles, make one bounded
    // retry so the real map cannot remain stuck behind the offline surface.
    window.setTimeout(start,750);
  }
}
function cleanupMapEngine() { if(mapRuntime.glMap){try{mapRuntime.glMap.remove();}catch(_){ }mapRuntime.glMap=null;} }
function syncMapFullscreenState() {
  const mapRoot=document.querySelector(".map-app");
  const active=Boolean(mapRoot&&(document.fullscreenElement===mapRoot||mapRuntime.fullscreenFallback));
  document.body.classList.toggle("map-fullscreen-fallback",Boolean(mapRuntime.fullscreenFallback&&!document.fullscreenElement));
  if(!mapRoot)return;
  const button=mapRoot.querySelector('[data-action="map-fullscreen"]');
  if(button){button.innerHTML=icon(active?"shrink":"expand");button.setAttribute("aria-label",active?"Exit full-screen map":"Open full-screen map");button.title=active?"Exit full-screen map":"Open full-screen map";button.setAttribute("aria-pressed",String(active));}
  if(mapRuntime.glMap)window.setTimeout(()=>mapRuntime.glMap?.resize(),40);
}
async function toggleMapFullscreen() {
  const mapRoot=document.querySelector(".map-app");
  if(!mapRoot)return;
  try {
    if(document.fullscreenElement===mapRoot){await document.exitFullscreen();}
    else if(mapRoot.requestFullscreen){await mapRoot.requestFullscreen();}
    else {mapRuntime.fullscreenFallback=!mapRuntime.fullscreenFallback;syncMapFullscreenState();}
  } catch (_) {
    mapRuntime.fullscreenFallback=!mapRuntime.fullscreenFallback;
    syncMapFullscreenState();
  }
}
async function toggleWatchVideoFullscreen() {
  const video=document.querySelector("[data-watch-video]");
  if(!video)return;
  try {
    if(document.fullscreenElement===video)await document.exitFullscreen();
    else if(video.requestFullscreen)await video.requestFullscreen();
    else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();
    else showToast("Fullscreen unavailable","Use the browser’s fullscreen control for this video.");
  } catch (_) { showToast("Fullscreen unavailable","Use the browser’s fullscreen control for this video."); }
}
const MAP_TYPE_TYPES=["Country chapter","University","College","School","Children’s home","Mission site","Event","Partner office","Impact location","Approved check-in","Personal place"];
function geometadataMarkup(record) {
  const point=record?.lat!=null&&record?.lng!=null&&!['Country Only','County/Region'].includes(record?.privacy), precision=record?.privacy||"Approximate";
  return `<details class="geometadata-module"><summary><span><span class="eyebrow">Spatial identity</span><strong>Geometadata</strong></span><span class="geometadata-state">${esc(precision)}</span></summary><div class="geometadata-grid"><div><span>Geometry</span><strong>Point · WGS84 / EPSG:4326</strong></div><div><span>Public precision</span><strong>${esc(precision)}</strong></div><div><span>Coordinates</span><strong>${point?`${Number(record.lat).toFixed(4)}, ${Number(record.lng).toFixed(4)}`:"Generalized for safety"}</strong></div><div><span>Capture method</span><strong>${record?.source?.includes("OpenStreetMap")?"Public file / map source":"Structured record"}</strong></div><div><span>Administrative context</span><strong>${esc(record?.county||record?.region||"Not published")}</strong></div><div><span>Verification</span><strong>${esc(record?.verification||"Needs Review")}</strong></div></div><div class="geometadata-actions"><button class="btn small" data-action="map-open-geometadata" data-map-record="${esc(record?.id||"")}">Open in Global Map</button><button class="btn small" data-action="map-copy-coordinates" data-map-lat="${point?record.lat:""}" data-map-lng="${point?record.lng:""}" ${point?"":"disabled"}>Copy coordinates</button></div><p class="map-module-note">Source: ${esc(record?.source||"Source not published")}. Publicly sourced does not mean verified.</p></details>`;
}
function mapDetailsMarkup(record) {
  if(!record)return `<aside class="map-detail-panel empty"><div class="detail-empty-icon">◎</div><div class="eyebrow">Record details</div><h2>Select a location</h2><p>Choose a map marker or a row in the accessible list to inspect its public record.</p><div class="map-detail-note">Public records show their source, date, and verification state.</div><button class="btn small" data-action="map-focus">Focus Map</button></aside>`;
  const safePosition=record.lat==null||['Country Only','County/Region'].includes(record.privacy);
  const activity=mapRuntime.publicCheckIns.filter(item=>[item.location_id,item.event_id,item.mission_id].includes(record.id));
  const related=mapRecords().filter(item=>item.id!==record.id&&item.country===record.country&&item.type!=="personal"&&item.type!=="checkin"&&(item.type==="mission"||item.type==="event")).slice(0,3);
  const canCheckIn=!["chapter","personal","checkin","orphanage"].includes(record.type)&&!record.claimId;
  return `<aside class="map-detail-panel"><div class="map-detail-toolbar"><button class="detail-close" data-action="map-clear-selection" aria-label="Close record details">×</button><button class="icon-btn" data-action="map-sidebar-collapse" aria-label="Close details sidebar">⇥</button></div><details class="map-accordion" open><summary><span class="record-detail-kicker"><span class="record-symbol ${MAP_TYPE_META[record.type]?.tone||"cyan"}">${MAP_TYPE_META[record.type]?.icon||"•"}</span><span><span class="eyebrow">${esc(mapRecordLabel(record))}</span><strong>${esc(record.name)}</strong></span></span><span class="accordion-chevron">⌄</span></summary><div class="map-accordion-body">${statusBadge(record.verification)}<div class="map-detail-rows"><div><span>Location</span><strong>${esc(record.city||"Generalized location")}</strong></div><div><span>County</span><strong>${esc(record.county||"Not published")}</strong></div><div><span>Country</span><strong>${esc(record.country||"Liberia")}</strong></div><div><span>Coordinates</span><strong>${safePosition?record.source==="Personal GeoJSON layer"?"Geometry shown on map":record.type==="personal"?"No point supplied":record.privacy==="Country Only"?"Generalized to country level":"Generalized to county / region for safety":`${Number(record.lat).toFixed(4)}, ${Number(record.lng).toFixed(4)}`}</strong></div></div><p class="detail-description">${esc(record.description||"No public description has been published.")}</p><div class="card-meta">${(record.sdgs||[]).map(s=>tag(s))}${(record.needs||[]).slice(0,3).map(s=>tag(s,"green"))}</div><div class="map-detail-actions"><button class="btn small primary" data-action="map-view-record">View Full Record</button>${canCheckIn?`<button class="btn small" data-action="map-checkin" data-map-record="${esc(record.id)}">Check In</button>`:""}<button class="btn small" data-action="map-save-record" data-map-record="${esc(record.id)}">Save to My Map</button></div></div></details>${geometadataMarkup(record)}<details class="map-accordion"><summary><span><span class="eyebrow">Connections</span><strong>Related records</strong></span><span class="accordion-chevron">⌄</span></summary><div class="map-accordion-body">${related.length?related.map(item=>`<button class="map-related-row" data-map-record="${esc(item.id)}">${esc(item.name)} →</button>`).join(""):`<p class="map-module-note">No linked public missions or events yet.</p>`}<button class="btn small" data-action="map-share">Share this record</button></div></details><details class="map-accordion"><summary><span><span class="eyebrow">Activity</span><strong>Approved check-ins</strong></span><span class="accordion-chevron">⌄</span></summary><div class="map-accordion-body">${activity.length?activity.slice(0,5).map(item=>`<p class="map-activity-row"><small>${esc(new Date(item.timestamp).toLocaleDateString())}</small><br>${esc(item.status_text)}</p>`).join(""):`<p class="map-module-note">No approved public check-ins yet.</p>`}${canCheckIn?`<button class="btn small" data-action="map-checkin" data-map-record="${esc(record.id)}">Add a check-in</button>`:""}</div></details></aside>`;
}
function mapListMarkup(records) {
  const sorted=[...records].sort((a,b)=>{const key=state.map.sort==="County"?"county":state.map.sort==="Record type"?"type":"name";return String(a[key]||"").localeCompare(String(b[key]||""))||a.name.localeCompare(b.name);});
  return `<section class="map-list-panel"><div class="map-list-heading"><div><div class="eyebrow">Accessible directory</div><h2>${records.length} record${records.length===1?"":"s"} in view</h2></div><select data-map-sort aria-label="Sort records">${["Name A–Z","County","Record type"].map(value=>`<option ${state.map.sort===value?"selected":""}>${value}</option>`).join("")}</select></div><div class="map-list-scroll">${sorted.length?sorted.map(record=>`<button class="map-record-row ${state.map.selectedId===record.id||state.map.selectedSlug===record.slug?"selected":""}" data-map-record="${esc(record.id)}" data-map-slug="${esc(record.slug||poiSlug(record))}"><span class="record-symbol ${MAP_TYPE_META[record.type]?.tone||"cyan"}">${MAP_TYPE_META[record.type]?.icon||"•"}</span><span><strong>${esc(record.name)}</strong><small>${esc(mapRecordLabel(record))} · ${esc(record.county||"Global")}</small><em>${record.source==="Personal GeoJSON layer"?"Private geometry":record.lat==null?"Generalized location":record.privacy==="Country Only"?"Country-level marker":"Map position available"} · ${esc(record.verification)}</em></span>${icon("arrow")}</button>`).join(""):`<div class="map-empty"><h3>No records match those filters.</h3><p>Clear a filter or search another county.</p></div>`}</div></section>`;
}
function mapCanvasMarkup(records) {
  const m=state.map, iso=m.country||"GHA";
  const mapName=iso==="LBR"?"Liberia":iso==="GLB"?"Global":mapCountryRecord(iso).name;
  return `<main class="map-main"><div class="map-canvas basemap-${esc(m.basemap)} ${iso==="LBR"?"liberia-map":""}" data-map-canvas tabindex="0" aria-label="Interactive ${esc(mapName)} map. Use the accessible directory for the same records."><div class="maplibre-layer" data-maplibre-layer aria-label="Live geographic map"></div><div class="map-surface"><div class="map-graticule"></div><div class="map-landmass"></div>${iso==="LBR"?`<div class="liberia-outline"></div><div class="county-boundaries"></div>${mapCountyMarkup()}${mapCityMarkup()}`:`<div class="regional-label">${esc(mapName)}</div>`}${records.filter(record=>record.lat!=null&&record.lng!=null||iso==="LBR"&&Boolean(LIBERIA_COUNTY_CENTERS[record.county])).map(record=>`<button class="map-marker ${MAP_TYPE_META[record.type]?.tone||"cyan"} ${state.map.selectedId===record.id||state.map.selectedSlug===record.slug?"selected":""}" style="${mapPointStyle(record)}" data-map-record="${esc(record.id)}" data-map-slug="${esc(record.slug||poiSlug(record))}" aria-label="Open ${esc(record.name)}"><span>${MAP_TYPE_META[record.type]?.icon||"•"}</span><b>${esc(record.name)}</b></button>`).join("")}${iso==="LBR"?`<div class="map-place-label label-monrovia">Monrovia</div>`:""}<div class="map-map-title"><span class="eyebrow">${iso==="LBR"?"LIBERIA / COUNTY EXPLORER":"GLOBAL / MISSION INDEX"}</span><strong>${countryFlag(mapName)} ${esc(mapName)}</strong><small>${records.length} records in view · personal layers stay private</small></div>${mapOrientationMarkup()}</div><div class="map-style-switcher" role="group" aria-label="Basemap style">${["satellite","satellite streets","dark","light","terrain","humanitarian"].map(style=>`<button class="${m.basemap===style?"active":""}" data-map-basemap="${style}">${style}</button>`).join("")}</div><div class="map-zoom"><button data-map-zoom="in" aria-label="Zoom in">+</button><button data-action="map-fit-results" aria-label="Fit visible results" title="Fit visible results">⌖</button><button data-map-zoom="out" aria-label="Zoom out">−</button></div><div class="map-layer-strip"><span>Layers</span>${Object.entries(m.layer).map(([layer,on])=>`<button class="${on?"active":""}" data-map-layer="${layer}" aria-pressed="${on}">${layer}</button>`).join("")}</div>${mapLegend()}</div></main>`;
}
function mapView() {
  const m=state.map||defaultState.map, records=mapVisibleRecords(), selected=mapRecords().find(record=>record.id===m.selectedId||record.slug===m.selectedSlug);
  const countries=[{iso3:"GLB",name:"Global"},...COUNTRY_RECORDS];
  return `<div class="map-app"><header class="map-topbar"><button class="map-back" data-action="map-back">← <span>Back to Be The Change</span></button><div class="map-brand"><span class="map-brand-mark">◎</span><div><strong>See The Change</strong><small>Global Mission and Impact Map</small></div></div><label class="map-global-search">${icon("search")}<input data-map-search value="${esc(m.search||"")}" placeholder="Search institutions, counties, missions…" aria-label="Global map search" /></label><div class="map-top-actions"><select data-map-country aria-label="Country selector">${countries.map(country=>`<option value="${country.iso3}" ${m.country===country.iso3?"selected":""}>${country.name}</option>`).join("")}</select><div class="map-view-switch" role="tablist" aria-label="Map view"><button class="${m.view==="map"?"active":""}" data-map-view="map">Map</button><button class="${m.view==="list"?"active":""}" data-map-view="list">List</button><button class="${m.view==="split"?"active":""}" data-map-view="split">Split</button></div><button class="map-top-btn" data-action="map-focus">Focus Map</button><button class="map-top-btn" data-action="map-share">Share</button><button class="map-top-btn" data-action="map-export">Export</button><button class="map-top-btn" data-action="map-saved">Saved views</button><button class="map-top-btn map-fullscreen-top" data-action="map-fullscreen" aria-label="Open full-screen map" title="Open full-screen map">${icon("expand")}</button></div></header><div class="map-context-bar"><div><span class="eyebrow">${m.country==="LBR"?"LIBERIA FOCUS":"GLOBAL DIRECTORY"}</span><h1>See The Change <span>/</span> ${m.country==="LBR"?"Liberia":m.country==="GLB"?"Global mission index":mapCountryRecord(m.country).name}</h1></div><div class="map-context-stats"><span><strong>${records.length}</strong> records</span><span><strong>${m.country==="LBR"?15:COUNTRY_RECORDS.length}</strong> regions indexed</span><a class="map-top-btn map-feed-link" href="/api/events/georss" target="_blank" rel="noreferrer">GeoRSS feed</a><button class="map-top-btn primary" data-action="map-add-location">+ Propose Place</button></div></div><div class="map-layout ${m.view} ${m.leftCollapsed?"filters-collapsed":""} ${m.filtersOpen?"filters-open":""} ${m.focusMode?"focus-map":""} ${m.rightOpen==="selected"?"details-open":""}">${mapFilterMarkup()}${mapCanvasMarkup(records)}${mapListMarkup(records)}${mapDetailsMarkup(selected)}</div><div class="map-mobile-filter" aria-label="Map controls"><button data-action="map-mobile-filters" aria-label="Open filters" title="Filters">${icon("sliders")}</button><button data-action="map-mobile-layers" aria-label="Open layers" title="Layers">${icon("layers")}</button><button data-map-view="list" aria-label="Browse map records" title="Browse records">${icon("list")}</button><button data-action="map-mobile-details" aria-label="Open selected record" title="Selected record">${icon("info")}</button><button data-action="map-fullscreen" aria-label="Open full-screen map" title="Open full-screen map">${icon("expand")}</button></div></div>`;
}
function mapQueryString() {
  const m=state.map||defaultState.map, params=new URLSearchParams();
  const selected=m.selectedId?mapRecords().find(record=>record.id===m.selectedId||record.slug===m.selectedSlug):null,privateSelection=selected?.type==="personal";
  if(m.country)params.set("country",m.country);
  if(m.search)params.set("q",m.search);
  if(m.county!=="All counties")params.set("county",m.county);
  if(m.recordType!=="All types")params.set("type",m.recordType.toLowerCase().replace(/ /g,"-"));
  if(m.sdg!=="All SDGs")params.set("sdg",m.sdg.replace("SDG ",""));
  const hidden=Object.entries(m.layer).filter(([,shown])=>!shown).map(([key])=>key);if(hidden.length)params.set("hide",hidden.join(","));
  if(m.basemap&&m.basemap!=="satellite")params.set("style",m.basemap);
  if(m.view&&m.view!=="map")params.set("layout",m.view);
  if(m.selectedId&&!privateSelection)params.set("poi",selected?.slug||m.selectedSlug||poiSlug({id:m.selectedId,name:m.selectedId}));
  if(m.centerLat!=null&&!privateSelection)params.set("lat",m.centerLat);
  if(m.centerLng!=null&&!privateSelection)params.set("lng",m.centerLng);
  if(m.zoom)params.set("zoom",m.zoom);
  if(m.pitch)params.set("pitch",Math.round(m.pitch));
  if(m.bearing)params.set("bearing",Math.round(m.bearing));
  if(m.fov&&m.fov!==45)params.set("fov",Math.round(m.fov));
  if(m.terrain)params.set("terrain","1");
  if(m.birdseye)params.set("view","birdseye");
  return params.toString();
}
function updateMapUrl(replace=true) {
  const query=mapQueryString(), url=query?`#map?${query}`:"#map";
  if(location.hash!==url){(replace?history.replaceState:history.pushState).call(history,{view:"map"},"",url);}
}
function mapParamsSource() {
  if(location.pathname==="/"||location.pathname==="/index.html"){
    const hash=location.hash.replace(/^#/,"");
    const idx=hash.indexOf("?");
    return idx>=0?hash.slice(idx+1):"";
  }
  return location.search.replace(/^\?/,"");
}
function parseMapRoute() {
  const p=new URLSearchParams(mapParamsSource()), raw=(p.get("country")||"GLB").toUpperCase();
  const numberParam=(key,fallback)=>{const value=Number(p.get(key));return p.has(key)&&Number.isFinite(value)?value:fallback;};
  const typeParam=p.get("type")||"", recordType=MAP_TYPE_TYPES.find(type=>type.toLowerCase().replace(/ /g,"-")===typeParam)||"All types";
  const basemap=["satellite","satellite streets","dark","light","terrain","humanitarian"].includes(p.get("style"))?p.get("style"):"satellite";
  const layout=["map","list","split"].includes(p.get("layout"))?p.get("layout"):"map";
  state.view="map";state.modal=null;state.map={...defaultState.map,country:raw==="LBR"||raw==="GLB"||COUNTRY_RECORDS.some(c=>c.iso3===raw)?raw:"GHA",search:p.get("q")||"",county:p.get("county")||"All counties",recordType,basemap,view:layout,selectedId:p.get("record")||null,selectedSlug:p.get("poi")||null,centerLat:p.has("lat")?numberParam("lat",null):null,centerLng:p.has("lng")?numberParam("lng",null):null,zoom:Math.max(2,Math.min(16,numberParam("zoom",7))),pitch:Math.max(0,Math.min(60,numberParam("pitch",0))),bearing:Math.max(-180,Math.min(180,numberParam("bearing",0))),fov:Math.max(25,Math.min(75,numberParam("fov",45))),terrain:p.get("terrain")==="1",birdseye:p.get("view")==="birdseye",layer:{...defaultState.map.layer}};
  (p.get("hide")||"").split(",").forEach(key=>{if(Object.prototype.hasOwnProperty.call(state.map.layer,key))state.map.layer[key]=false;});
  if(!state.map.selectedId&&state.map.selectedSlug){const match=mapRecords().find(record=>record.slug===state.map.selectedSlug);if(match)state.map.selectedId=match.id;}
  const layer=p.get("layer");if(layer)state.map.recordType=layer==="schools"?"School":layer==="orphanages"?"Children’s home":layer==="universities"?"University":"All types";
  if(p.get("mode")==="missions")state.map.recordType="Mission site";
  if(p.get("sdg"))state.map.sdg=`SDG ${p.get("sdg").padStart(2,"0")}`;
}
function openMapGateway() {
  const selectedNode=heroNodeById(state.hero.selected), selectedCountry=COUNTRY_RECORDS.find(country=>country.id===selectedNode?.recordId);
  state.hero.paused=true;state.map={...defaultState.map,...state.map,country:selectedCountry?.iso3||"GLB",selectedId:selectedCountry?`country-${selectedCountry.iso3}`:null};state.view="map";state.modal=null;
  clearTimeout(routeTransitionTimer);routeTransitionToken++;document.body.classList.remove("route-transition");
  clearTimeout(mapTransitionTimer);window.scrollTo({top:0,left:0,behavior:"auto"});document.body.classList.add("map-transition");
  const query=mapQueryString(), url=query?`#map?${query}`:"#map";
  history.pushState({view:"map"},"",url);parseMapRoute();transitionRender();
  mapTransitionTimer=window.setTimeout(()=>document.body.classList.remove("map-transition"),850);
}
function bindMapInputs() {
  const themeLabel=currentTheme()==="light"?"Switch to dark mode":"Switch to light mode";
  const mapActions=document.querySelector(".map-top-actions");
  if(mapActions&&!mapActions.querySelector("[data-action=toggle-theme]"))mapActions.insertAdjacentHTML("afterbegin",`<button class="map-top-btn map-theme-btn" data-action="toggle-theme" aria-label="${themeLabel}" aria-pressed="${currentTheme()==="light"}" title="${themeLabel}">${themeIcon()}</button>`);
  const mobileActions=document.querySelector(".map-mobile-filter");
  if(mobileActions&&!mobileActions.querySelector("[data-action=toggle-theme]"))mobileActions.insertAdjacentHTML("beforeend",`<button data-action="toggle-theme" aria-label="${themeLabel}" aria-pressed="${currentTheme()==="light"}" title="${themeLabel}">${themeIcon()}</button>`);
  document.querySelector("[data-map-search]")?.addEventListener("input",event=>{state.map.search=event.target.value;updateMapUrl();clearTimeout(searchTimer);searchTimer=setTimeout(()=>render(),160);});
  document.querySelector("[data-map-country]")?.addEventListener("change",event=>{state.map.country=event.target.value;state.map.county="All counties";state.map.selectedId=null;state.map.selectedSlug=null;state.map.centerLat=null;state.map.centerLng=null;state.map.zoom=state.map.country==="GLB"?3:state.map.country==="LBR"?7:5;updateMapUrl();render();});
  document.querySelectorAll("[data-map-field]").forEach(input=>input.addEventListener("change",event=>{state.map[event.target.dataset.mapField]=event.target.value;state.map.selectedId=null;state.map.selectedSlug=null;updateMapUrl();render();}));
  document.querySelectorAll("[data-map-basemap]").forEach(input=>input.addEventListener("click",()=>{state.map.basemap=input.dataset.mapBasemap;render();}));
  document.querySelectorAll("[data-map-view]").forEach(input=>input.addEventListener("click",()=>{state.map.view=input.dataset.mapView;render();}));
  document.querySelectorAll(".map-record-row[data-map-record],.map-marker[data-map-record],.map-related-row[data-map-record]").forEach(input=>input.addEventListener("click",()=>{state.map.selectedId=input.dataset.mapRecord;state.map.selectedSlug=input.dataset.mapSlug||mapRecords().find(record=>record.id===state.map.selectedId)?.slug||null;state.map.rightOpen="selected";updateMapUrl();render();}));
  document.querySelectorAll("[data-map-county]").forEach(input=>input.addEventListener("click",()=>{state.map.county=input.dataset.mapCounty;updateMapUrl();render();}));
  document.querySelectorAll("[data-map-layer]").forEach(input=>input.addEventListener("click",()=>{const key=input.dataset.mapLayer;state.map.layer[key]=!state.map.layer[key];render();}));
  document.querySelectorAll("[data-custom-layer]").forEach(input=>input.addEventListener("click",async()=>{const layer=mapRuntime.customLayers.find(item=>item.localId===input.dataset.customLayer);if(!layer)return;layer.visible=!(layer.visible!==false&&state.map.layer.personal);if(layer.visible)state.map.layer.personal=true;await window.BTCOffline?.put("cachedMapLayers",layer);render();}));
  document.querySelector("[data-map-layer-file]")?.addEventListener("change",async event=>{try{await importPersonalGeoJson(event.target.files?.[0]);}catch(error){showToast("Layer not imported",error.message||"Choose a valid GeoJSON file.");}});
  document.querySelector("[data-map-sort]")?.addEventListener("change",event=>{state.map.sort=event.target.value;render();});
  document.querySelectorAll("[data-map-zoom]").forEach(input=>input.addEventListener("click",()=>{const zoom=Math.max(2,Math.min(16,(mapRuntime.glMap?.getZoom()||state.map.zoom||7)+(input.dataset.mapZoom==="in"?1:-1)));state.map.zoom=zoom;if(mapRuntime.glMap)mapRuntime.glMap.easeTo({zoom,duration:250});else{const surface=document.querySelector(".map-surface");if(surface)surface.style.transform=`scale(${1+(zoom-7)*.045})`;}updateMapUrl();}));
  document.querySelectorAll("[data-map-camera]").forEach(input=>input.addEventListener(input.type==="range"?"input":"change",()=>{const key=input.dataset.mapCamera;state.map[key]=input.type==="checkbox"?input.checked:Number(input.value);const map=mapRuntime.glMap;if(map){if(key==="pitch")map.setPitch(state.map.pitch);if(key==="bearing")map.setBearing(state.map.bearing);if(key==="fov"&&map.setFov)map.setFov(state.map.fov);if(key==="terrain"){try{if(state.map.terrain){if(!map.getSource("btc-terrain"))map.addSource("btc-terrain",{type:"raster-dem",tiles:["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],tileSize:256,encoding:"terrarium"});map.setTerrain({source:"btc-terrain",exaggeration:1});}else map.setTerrain(null);}catch(error){state.map.terrain=false;input.checked=false;showToast("Terrain unavailable","This map view could not load elevation data.");}}}const output=input.closest("label")?.querySelector("output");if(output&&input.type==="range")output.textContent=`${Math.round(Number(input.value))}°`;updateMapUrl();}));
}
async function loadCanonicalMapRecords() {
  const iso=state.map?.country||"GHA";
  if(mapRuntime.requestedCountries.has(iso))return;
  mapRuntime.requestedCountries.add(iso);
  try {
    const response=await fetch(`/api/map/locations${iso==="GLB"?"":`?country=${iso}`}`,{headers:{accept:"application/json"}}), rows=await response.json();
    if(!response.ok||!Array.isArray(rows))throw new Error("Location service unavailable");
    mapRuntime.serverRecordsByCountry[iso]=rows.map(row=>{const record={...row,type:row.category==="children_home"?"orphanage":row.category,city:row.settlement,source:row.source_name,verification:row.verification,privacy:row.privacy,lat:row.latitude,lng:row.longitude,country:COUNTRY_RECORDS.find(country=>country.iso3===row.country_iso3)?.name||row.country_iso3,countryIso:row.country_iso3};return {...record,slug:row.slug||poiSlug(record)};});
    if(state.view==="map"&&state.map.country===iso)render();
  } catch(error) { mapRuntime.requestedCountries.delete(iso); console.info("Canonical GIS API unavailable; preserved public register remains active."); }
}
async function loadMapWorkspace(force=false) {
  if(mapRuntime.workspaceLoaded&&!force)return;
  mapRuntime.workspaceLoaded=true;
  const ownerKey=accountRuntime.uid||"guest";
  const offline=window.BTCOffline;
  if(!offline){mapRuntime.workspaceLoaded=false;window.setTimeout(()=>loadMapWorkspace(),150);return;}
  if(offline){
    const local=await Promise.allSettled([offline.list("personalMapItems"),offline.list("savedViews"),offline.list("draftCheckIns"),offline.list("cachedMapLayers"),offline.list("pendingSync")]);
    if(ownerKey!==(accountRuntime.uid||"guest"))return;
    const scoped=rows=>rows.filter(item=>(item.localOwner||"guest")===ownerKey);
    mapRuntime.savedItems=local[0].status==="fulfilled"?scoped(local[0].value):[];
    mapRuntime.savedViews=local[1].status==="fulfilled"?scoped(local[1].value):[];
    mapRuntime.draftCheckIns=local[2].status==="fulfilled"?scoped(local[2].value):[];
    mapRuntime.customLayers=local[3].status==="fulfilled"?scoped(local[3].value):[];
    mapRuntime.pendingSync=local[4].status==="fulfilled"?scoped(local[4].value):[];
    mapRuntime.localItems=mapRuntime.savedItems.map(item=>item.payload?.record).filter(record=>record?.type==="personal");
  }
  const remote=await Promise.allSettled([fetch("/api/check-ins/mine").then(response=>response.ok?response.json():[]),fetch("/api/map/proposals").then(response=>response.ok?response.json():[])]);
  if(ownerKey!==(accountRuntime.uid||"guest"))return;
  mapRuntime.myCheckIns=remote[0].status==="fulfilled"&&Array.isArray(remote[0].value)?remote[0].value:[];
  mapRuntime.proposals=remote[1].status==="fulfilled"&&Array.isArray(remote[1].value)?remote[1].value:[];
  if(["map","my-map"].includes(state.view))render();
}
async function loadMapActivity() {
  if(mapRuntime.activityLoaded)return;
  mapRuntime.activityLoaded=true;
  try { const response=await fetch("/api/check-ins");if(response.ok){const rows=await response.json();mapRuntime.publicCheckIns=Array.isArray(rows)?rows:[];if(state.view==="map")render();} }
  catch(_) { mapRuntime.activityLoaded=false; }
}
async function syncPendingMapDrafts() {
  if(!window.BTCOffline||!navigator.onLine){showToast("Still offline","Pending check-ins stay on this device until you reconnect.");return;}
  try {
    const signedInUser=await window.websim?.getUser?.();
    if(!signedInUser){showToast("Sign in to submit","Pending check-ins remain private on this device until you sign in.");return;}
    const owner=accountRuntime.uid||"guest",result=await window.BTCOffline.sync({owner});
    const [pending,drafts]=await Promise.all([window.BTCOffline.list("pendingSync"),window.BTCOffline.list("draftCheckIns")]);
    await Promise.all(drafts.filter(draft=>draft.syncStatus==="Queued"&&(draft.localOwner||"guest")===owner&&!pending.some(item=>item.localId===draft.localId)).map(draft=>window.BTCOffline.remove("draftCheckIns",draft.localId)));
    mapRuntime.workspaceLoaded=false;await loadMapWorkspace(true);
    if(result.failed)showToast("Some drafts need attention",`${result.failed} item${result.failed===1?"":"s"} could not sync. Check My Map and try again.`);
    else if(result.synced)showToast("Drafts synchronized",`${result.synced} item${result.synced===1?"":"s"} synchronized.`);
    else showToast("Nothing to sync","Your pending queue is up to date.");
  } catch(error){showToast("Sync unavailable",error.message||"Try again when connected.");}
}
function mapCheckInDraftFromForm() {
  const prior=state.modal?.draft||{}, record=mapRecords().find(item=>item.id===state.modal?.recordId);
  const id=prior.localId||crypto.randomUUID();
  return {...prior,localId:id,localOwner:accountRuntime.uid||"guest",sync_key:prior.sync_key||id,recordId:record?.id||prior.recordId,recordType:record?.type||prior.recordType,recordName:record?.name||prior.recordName||"Map record",countryIso:state.map.country,status_text:getField("map-checkin-text"),evidence_url:getField("map-checkin-evidence"),consent_confirmed:Boolean(document.getElementById("map-checkin-consent")?.checked),visibility:getField("map-checkin-visibility")||"private",syncStatus:"Local Draft",timestamp:prior.timestamp||new Date().toISOString()};
}
function mapCheckInPayload(draft) {
  const key=seed.missions.some(item=>item.id===draft.recordId)?"mission_id":draft.recordType==="event"?"event_id":"location_id";
  return {[key]:draft.recordId,status_text:draft.status_text,evidence_url:draft.evidence_url,consent_confirmed:draft.consent_confirmed,visibility:draft.visibility,sync_key:draft.sync_key};
}
async function saveMapCheckIn(submit=false) {
  const draft=mapCheckInDraftFromForm();
  if(!draft.recordId){setModalFeedback("Choose a map record first.");return;}
  if(submit&&!draft.status_text){setModalFeedback("Describe your participation before submitting.");return;}
  if(submit&&draft.evidence_url&&(!/^https:\/\//i.test(draft.evidence_url)||!draft.consent_confirmed)){setModalFeedback("Use an HTTPS evidence link and confirm permission to share it.");return;}
  if(!window.BTCOffline){setModalFeedback("Private storage is unavailable in this browser.");return;}
  try {await window.BTCOffline.put("draftCheckIns",draft);}catch(_){setModalFeedback("Private storage is full or unavailable.");return;}
  mapRuntime.draftCheckIns=[draft,...mapRuntime.draftCheckIns.filter(item=>item.localId!==draft.localId)];
  if(!submit){draftDirty=false;state.modal=null;render();showToast("Private draft saved","Open My Map to finish it later.");return;}
  const payload=mapCheckInPayload(draft);
  if(draft.submittedId){
    try {const response=await fetch("/api/check-ins/mine",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id:draft.submittedId,status_text:draft.status_text,evidence_url:draft.evidence_url,consent_confirmed:draft.consent_confirmed,visibility:draft.visibility})}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Resubmission failed");await window.BTCOffline?.remove("draftCheckIns",draft.localId);mapRuntime.draftCheckIns=mapRuntime.draftCheckIns.filter(item=>item.localId!==draft.localId);mapRuntime.myCheckIns=mapRuntime.myCheckIns.map(item=>item.id===draft.submittedId?{...item,status_text:draft.status_text,evidence_url:draft.evidence_url,visibility:draft.visibility,moderation_status:"Review Required"}:item);draftDirty=false;state.modal=null;render();showToast("Check-in resubmitted","It is back in the review queue.");}catch(error){setModalFeedback(error.message||"Try again when connected.");}return;
  }
  if(!navigator.onLine){await window.BTCOffline?.enqueue({localId:draft.localId,localOwner:draft.localOwner,endpoint:"/api/check-ins",payload});draft.syncStatus="Queued";await window.BTCOffline?.put("draftCheckIns",draft);draftDirty=false;state.modal=null;render();showToast("Check-in queued","It will submit when you reconnect while signed in.");return;}
  const buttonEl=document.querySelector('[data-action="map-checkin-submit"]');if(buttonEl)buttonEl.disabled=true;
  try {
    const response=await fetch("/api/check-ins",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}), result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||"Submission failed");
    await window.BTCOffline?.remove("draftCheckIns",draft.localId);mapRuntime.draftCheckIns=mapRuntime.draftCheckIns.filter(item=>item.localId!==draft.localId);
    mapRuntime.myCheckIns=[{...payload,id:result.id,timestamp:new Date().toISOString(),moderation_status:result.moderation_status},...mapRuntime.myCheckIns];
    draftDirty=false;state.modal=null;render();showToast("Check-in submitted","Its status is Review Required. Find it in My Map.");
  } catch(error){if(buttonEl)buttonEl.disabled=false;setModalFeedback(error.message||"Try again when connected.");}
}
async function savePersonalMapPlace() {
  const name=getField("map-place-name"),iso=getField("map-place-country"),latText=getField("map-place-lat"),lngText=getField("map-place-lng");
  if(!name){setModalFeedback("Add a name for this place.");return;}
  if(Boolean(latText)!==Boolean(lngText)){setModalFeedback("Enter both coordinates, or leave both blank.");return;}
  const lat=latText?Number(latText):null,lng=lngText?Number(lngText):null;
  if(lat!=null&&(!Number.isFinite(lat)||lat < -90||lat > 90||!Number.isFinite(lng)||lng < -180||lng > 180)){setModalFeedback("Enter valid latitude and longitude.");return;}
  const country=COUNTRY_RECORDS.find(item=>item.iso3===iso),id=`personal-${crypto.randomUUID()}`;
  const record={id,name,type:"personal",country:country?.name||iso,countryIso:iso,county:country?.region||"",city:"",lat,lng,description:getField("map-place-note"),source:"Personal map",verification:"Private",privacy:"Private",sdgs:[],needs:[]};record.slug=poiSlug(record);
  const item={localId:id,localOwner:accountRuntime.uid||"guest",recordId:id,recordType:"personal",mapId:"my-map",payload:{name,record},syncStatus:"Local Draft"};
  if(!window.BTCOffline){setModalFeedback("Private storage is unavailable in this browser.");return;}
  try {await window.BTCOffline.put("personalMapItems",item);}catch(_){setModalFeedback("Private storage is full or unavailable.");return;}mapRuntime.savedItems=[item,...mapRuntime.savedItems];mapRuntime.localItems=[record,...mapRuntime.localItems];state.map.layer.personal=true;
  draftDirty=false;state.modal=null;render();showToast("Personal place saved","It is visible only on this device.");
}
async function submitMapProposal() {
  const payload={name:getField("map-proposal-name"),country_iso3:getField("map-proposal-country"),category:getField("map-proposal-category"),county:getField("map-proposal-county"),settlement:getField("map-proposal-settlement"),source_name:getField("map-proposal-source"),note:getField("map-proposal-note"),latitude:getField("map-proposal-lat")||null,longitude:getField("map-proposal-lng")||null};
  if(!payload.name||!payload.source_name){setModalFeedback("Add a place name and a source for review.");return;}
  if(Boolean(payload.latitude)!==Boolean(payload.longitude)){setModalFeedback("Enter both coordinates, or leave both blank.");return;}
  try {const proposalId=state.modal?.proposal?.id,response=await fetch("/api/map/proposals",{method:proposalId?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...payload,id:proposalId})}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Proposal could not be submitted");mapRuntime.proposals=[{...payload,id:result.id,status:result.status},...mapRuntime.proposals.filter(item=>item.id!==result.id)];draftDirty=false;state.modal=null;render();showToast(proposalId?"Place resubmitted":"Place proposed","A steward will review its source and public location precision.");}
  catch(error){setModalFeedback(error.message||"Try again when connected.");}
}
async function importPersonalGeoJson(file) {
  if(!file||file.size>1024*1024)throw new Error("Choose a GeoJSON file under 1 MB.");
  let json;try{json=JSON.parse(await file.text());}catch(_){throw new Error("The file is not valid JSON.");}
  if(json?.type!=="FeatureCollection"||!Array.isArray(json.features)||json.features.length>1000)throw new Error("Import a GeoJSON FeatureCollection with up to 1,000 features.");
  let coordinates=0;
  const validGeometry=geometry=>{if(!geometry||!["Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon"].includes(geometry.type))return false;const walk=value=>{if(Array.isArray(value)&&value.length>=2&&typeof value[0]==="number"&&typeof value[1]==="number"){coordinates++;return coordinates<=10000&&Number.isFinite(value[0])&&Number.isFinite(value[1])&&Math.abs(value[0])<=180&&Math.abs(value[1])<=90;}return Array.isArray(value)&&value.every(walk);};return walk(geometry.coordinates);};
  if(!json.features.every(feature=>feature?.type==="Feature"&&validGeometry(feature.geometry)))throw new Error("The layer contains unsupported or invalid geometry.");
  const layerId=`layer-${crypto.randomUUID()}`;
  const safe={type:"FeatureCollection",features:json.features.map((feature,index)=>({type:"Feature",properties:{name:String(feature.properties?.name||`Feature ${index+1}`).slice(0,120),mapRecordId:`${layerId}-${index}`},geometry:feature.geometry}))};
  const layer={localId:layerId,localOwner:accountRuntime.uid||"guest",name:file.name.replace(/\.geojson$|\.json$/i,"").slice(0,80),countryIso:state.map.country,payload:safe,visible:true,syncStatus:"Local Draft"};
  if(!window.BTCOffline)throw new Error("Private storage is unavailable in this browser.");
  await window.BTCOffline.put("cachedMapLayers",layer);mapRuntime.customLayers.push(layer);state.map.layer.personal=true;render();showToast("Personal layer imported",`${safe.features.length} features are visible on this device.`);
}
async function loadProfile() {
  if(profileRuntime.loaded||profileRuntime.loading)return;
  if(firebaseConfigured&&!accountRuntime.ready)return;
  if(firebaseConfigured&&!accountUser()){profileRuntime.loaded=true;return;}
  const expectedUid=accountRuntime.uid;
  profileRuntime.loading=true;
  try {
    if(firebaseConfigured){
      const profile=await readAccountProfile();
      if(profile&&accountRuntime.uid===expectedUid){applyProfileState(profile);persist();if(!state.modal&&["profile","join"].includes(state.view))render();}
      if(accountRuntime.uid===expectedUid){profileRuntime.loaded=true;profileRuntime.loading=false;}
      return;
    }
    const response=await fetch("/api/profile",{headers:{accept:"application/json"}}), result=await response.json().catch(()=>({}));
    if(response.ok&&result.profile){applyProfileState(result.profile);persist();if(!state.modal&&["profile","join"].includes(state.view))render();}
  } catch (_) {}
  if(!firebaseConfigured||accountRuntime.uid===expectedUid){profileRuntime.loaded=true;profileRuntime.loading=false;}
}

function render() {
  applyPersonalizationDocumentTitle();
  if(!routeTransitionRendering)document.body.classList.remove("route-transition");
  if(state.view!=="map"){
    cleanupMapEngine();
    if(mapRuntime.fullscreenFallback){mapRuntime.fullscreenFallback=false;document.body.classList.remove("map-fullscreen-fallback");}
  }
  cleanupHeroRuntime();
  cleanupBallSimulations();
  if(state.view==="map") {
    cleanupMapEngine();
    document.querySelector("#app").innerHTML=mapView()+modal();
    applySdgBadgeStyles();
    applyCountryFlags();
    applyMapCountryFlags();
    document.body.classList.toggle("modal-open",Boolean(state.modal));
    bindMapInputs();
    bindInputs();
    initMapEngine(mapVisibleRecords());
    loadCanonicalMapRecords();
    loadMapWorkspace();
    loadMapActivity();
    loadImpactData();
    loadEventGeoRSS();
    loadCountryCatalog();
    syncMapFullscreenState();
    if(state.modal) window.setTimeout(()=>document.querySelector(".modal input,.modal select,.modal textarea,.modal button")?.focus(),0);
    return;
  }
  let content="";
  if(state.view==="home") content=homeView();
  if(state.view==="explore") content=exploreView();
  if(state.view==="missions") content=missionsView();
  if(state.view==="peace") content=peaceView();
  if(state.view==="countries") content=countriesView();
  if(state.view==="country") content=countryDetailView(state.selectedId);
  if(state.view==="ghana") content=ghanaView();
  if(state.view==="education") content=educationView();
  if(state.view==="jobs") content=greenJobsView();
  if(state.view==="job") content=greenJobDetailView();
  if(state.view==="education") { const privateCourses=courseCatalog().filter(course=>!seed.courses.some(seedCourse=>seedCourse.id===course.id)); if(privateCourses.length)content+=`<section class="section">${pageHead("My course drafts","Continue building and presenting.","Signed-in drafts synchronize to your account; offline drafts remain on this device.")}<div class="grid grid-3">${privateCourses.map(privateCourseCard).join("")}</div></section>`; }
  if(state.view==="enterprise") content=safeEnterpriseView();
  if(state.view==="enterprise"&&state.enterprise.featureFlags.enterpriseImpact)content+=impactEnterpriseBridgeView();
  if(state.view==="whatsapp") content=renderWhatsAppGateway(state,{profileCountries:PROFILE_LOCATION_GROUPS.flatMap(group=>group.countries),navigate,render,persist,toast:showToast});
  if(state.view==="studio") content=studioView();
  if(state.view==="classroom") content=classroomView(state.selectedId||"generated-course");
  if(state.view==="profile") content=profileView();
  if(state.view==="my-map") { content=myMapWorkspaceView();loadMapWorkspace(); }
  if(state.view==="join") content=joinView();
  if(state.view==="events") content=eventsView()+impactRelatedSection("event",null,"Claims linked to events");
  if(state.view==="impact") content=impactView()+(publicAdminRecords("Impact").length?`<p class="section-copy" style="margin-top:26px">Earlier published Impact entries remain available below. They are separate from measured claims and excluded from claim counts.</p>${publicAdminRecordGrid("Impact","Earlier Impact entries")}`:"");
  if(state.view==="sdgs") content=sdgsView()+impactRelatedSection("sdg",null,"Claims linked to SDGs");
  if(state.view==="partners") content=partnersView();
  if(state.view==="shop" || state.view==="sports") content=shopView();
  if(state.view==="unity-ball") content=unityBallView();
  if(state.view==="funding") content=fundingView();
  if(state.view==="schools"||state.view==="universities") content=institutionView(state.view);
  if(state.view==="admin") content=connectedAdminView();
  if(state.view==="data-gaps") content=dataGapsView();
  if(state.view==="course") content=courseDetail(state.selectedId);
  if(state.view==="course") content+=`<section class="section panel panel-pad course-classroom-callout"><div><div class="eyebrow">Native course classroom</div><h2 class="section-title" style="font-size:28px">Present this course with instructors and students.</h2><p class="section-copy">Every course has a shared room with a presentation stage, course outline, participation controls, and room chat.</p></div><div class="course-classroom-actions"><button class="btn primary" data-action="enter-classroom" data-id="${esc(state.selectedId||"")}">Enter virtual classroom ${icon("arrow")}</button><span class="micro-note">Provider connection pending · local classroom preview available</span></div></section>`;
  if(state.view==="studio"&&state.learning.generatedCourse) content+=`<section class="section panel panel-pad course-classroom-callout"><div><div class="eyebrow">Generated course delivery</div><h2 class="section-title" style="font-size:28px">Your generated course already has a classroom.</h2><p class="section-copy">Open the native room to review the learner view, instructor presentation controls, outline, and participation flow before approval.</p></div><div class="course-classroom-actions"><button class="btn primary" data-action="enter-classroom" data-id="${esc(state.learning.generatedCourse.id)}">Open generated-course classroom ${icon("arrow")}</button><span class="micro-note">The course remains a draft and requires human approval.</span></div></section>`;
  if(state.view==="mission") content=missionDetail(state.selectedId)+(state.selectedId==="digital-twin"?digitalTwinSimulationSection():"")+impactRelatedSection("mission",state.selectedId,"Claims linked to this mission");
  if(state.view==="login") content=loginView();
  if(state.view==="privacy"||state.view==="terms") content=legalView(state.view);
  if(state.view==="not-found") content=notFoundView("Page not found","The requested destination is not in the public index.");
  if(state.view==="ghana"||state.view==="country") {
    const geoCountry=state.view==="ghana"?COUNTRY_RECORDS.find(record=>record.iso3==="GHA"):seed.countries.find(record=>record.id===state.selectedId);
    if(geoCountry)content+=countryMediaSection(geoCountry);
    if(geoCountry)content+=`<section class="section panel panel-pad page-geometadata">${geometadataMarkup({id:`country-${geoCountry.iso3}`,name:geoCountry.name,type:"country",country:geoCountry.name,county:geoCountry.region,lat:geoCountry.lat,lng:geoCountry.lon,privacy:"Country Only",source:"Be The Change country register",verification:geoCountry.status})}</section>`;
  }
  document.querySelector("#app").innerHTML=shell(content)+modal();
  applyPersonalizedBranding();
  applyCountryHeroImages();
  applyCountryHeroAdminControls();
  relocateHeroExplorer();
  applyHeroMapCta();
  applySdgBadgeStyles();
  applyCountryFlags();
  applyMapCountryFlags();
  applyPassportPathStage();
  applyEnterpriseInvitations();
  applyStripeAdminPanel();
  if(state.view==="profile") document.querySelector(".passport-shell > div")?.insertAdjacentHTML("beforeend",pwaSettingsMarkup());
  document.body.classList.toggle("modal-open",Boolean(state.modal));
  document.documentElement.classList.toggle("user-reduced-motion",state.hero.reducedMotion||window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const modalEl=document.querySelector(".modal");
  if(modalEl){modalEl.setAttribute("role","dialog");modalEl.setAttribute("aria-modal","true");const modalTitle=modalEl.querySelector("h2");if(modalTitle){modalTitle.id="modal-title";modalEl.setAttribute("aria-labelledby","modal-title");}}
  bindInputs();
  bindWhatsAppInputs(state,{persist,render,navigate,toast:showToast});
  bindEnterpriseInputs(state.enterprise,enterpriseContext(state.view==="admin"&&state.adminTab==="Enterprise Ops"));
  if(state.view==="admin"&&adminIdentityRuntime.isAdmin)loadAdminWorkspace();
  if(state.view==="admin"&&state.adminTab==="Map Review"&&adminIdentityRuntime.isAdmin)loadMapReview();
  else loadPublicAdminRecords();
  if(state.view==="jobs")loadGreenJobs();
  if(state.view==="job")loadGreenJobDetail(state.selectedId);
  if(state.view==="admin"&&state.adminTab==="Green Jobs")loadJobsAdmin();
  if(["impact","mission","events","sdgs","enterprise"].includes(state.view))loadImpactData();
  if(state.view==="admin"&&["Evidence","Impact Claims"].includes(state.adminTab)&&adminIdentityRuntime.isAdmin)loadImpactAdmin();
  loadCountryImages();
  loadCountryCatalog();
  if(state.view==="ghana"||state.view==="country"){
    const mediaCountry=state.view==="ghana"?COUNTRY_RECORDS.find(record=>record.iso3==="GHA"):seed.countries.find(record=>record.id===state.selectedId);
    if(mediaCountry)loadCountryMedia(mediaCountry);
  }
  loadAdminIdentity();
  if(state.view==="profile"||state.view==="join"||state.modal?.type==="join"){loadProfile();loadWhatsAppProfile();}
  if(state.view==="events")loadEventGeoRSS();
  loadEnterpriseState();
  if(['education','course','studio','classroom'].includes(state.view))loadCourseLibrary();
  if(state.view==='classroom'&&state.selectedId){loadClassroomState(state.selectedId);initClassroomRealtime(state.selectedId);}
  loadStripeAdmin();
  bindTitleRuntime();
  initHeroRuntime();
  if(state.modal) {
    window.setTimeout(()=>document.querySelector(".modal input, .modal select, .modal textarea, .modal button")?.focus(),0);
  } else if(modalRuntime.returnFocus) {
    const focusTarget=modalRuntime.returnFocus.element?.isConnected?modalRuntime.returnFocus.element:[...document.querySelectorAll("[data-action],[data-route]")].find(candidate=>(candidate.dataset.action||"")===modalRuntime.returnFocus.action&&(candidate.dataset.route||"")===modalRuntime.returnFocus.route);
    window.setTimeout(()=>focusTarget?.focus(),0);
    modalRuntime.returnFocus=null;
  }
}

function notFoundView(title="Record not found", copy="The record is unavailable or has moved out of the public index.") {
  return `<section class="empty-state page-error"><div class="eyebrow">404 · public index</div><h1>${esc(title)}</h1><p>${esc(copy)} Nothing has been deleted from the audit trail.</p><div class="page-error-actions">${button("Return home","route-home","primary")}${button("Browse missions","route-missions")}${button("Open the map","map-open")}</div></section>`;
}

function missionDetail(id) {
  const m=seed.missions.find(x=>x.id===id);
  if(!m)return notFoundView("Mission record not found","This mission may be archived, private, or still being prepared.");
  const joined=state.passport.joined.includes(m.id);
  return `<div>${button(`${icon("arrow")} Missions`,"route-missions","text")}<section class="detail-hero"><div><div class="eyebrow">${m.country} · ${m.stage}</div><h1>${esc(m.title)}</h1><p class="lede">${esc(m.purpose)}</p><div class="card-meta">${m.sdgs.map(s=>tag(s))}${tag(m.verification,"coral")}</div><div style="margin-top:25px;display:flex;gap:9px;flex-wrap:wrap">${button(joined?"Joined":"Plan your contribution",joined?"show-record":"join-mission","primary")}${button("Offer a skill","edit-passport")}${button("Follow updates","show-record")}</div></div><div class="panel detail-side"><h3>Mission record</h3><div class="detail-side-row"><span>Stage</span><strong>${esc(m.stage)}</strong></div><div class="detail-side-row"><span>Country chapter</span><strong>${esc(m.country)} · ${m.country==="Ghana"?"Activation Planning":"Research Only"}</strong></div><div class="detail-side-row"><span>Verification</span><strong>${esc(m.verification)}</strong></div><div class="detail-side-row"><span>Population served</span><strong>Not yet published</strong></div></div></section><section class="section detail-layout"><div class="panel"><h2>What this mission needs</h2><div class="card-meta">${m.skills.map(x=>tag(x,"green"))}</div><h3>Evidence plan</h3><p class="prose">${esc(m.evidence||"Evidence plan pending steward review.")}</p><h3>Mission stages</h3><div class="stage-line">${["Idea","Needs Validation","Designing","Partner Formation","Funding Ready","Active","Evidence Review","Completed","Replication Ready"].map((x,i)=>`<div class="stage ${x===m.stage?"current":i<2?"done":""}"><span>${x}</span></div>`).join("")}</div><h3>Learning prerequisites</h3><p class="prose">Take the linked course before fieldwork: <button class="btn text" data-action="open-course" data-id="${m.linkedCourse||"peacebuilding"}">${m.linkedCourse||"Evidence & Impact Verification"} ${icon("arrow")}</button></p></div><aside class="panel"><div class="eyebrow">Transparent status</div><h2 style="font-size:25px">Funding and results</h2><div class="stat-list"><div class="stat-row"><span>Funds requested</span><strong>Not published</strong></div><div class="stat-row"><span>Funds received</span><strong>0 · no record</strong></div><div class="stat-row"><span>Results</span><strong>Draft</strong></div><div class="stat-row"><span>Updates</span><strong>0 public</strong></div></div><div class="footer-note">No amount is described as received, pledged, or audited without a source record.</div></aside></section></div>`;
}
function digitalTwinSimulationSection() {
  return `<section class="section panel panel-pad digital-twin-simulation-section"><div class="section-head"><div><div class="eyebrow">Interactive simulation · browser model</div><h2 class="section-title">Kick the digital twin.</h2><p class="section-copy">Move across the stage to tilt the view, tune velocity, spin, and curve, then replay the flight. This is an explanatory prototype—not a measured performance claim.</p></div><span class="status-dot draft">Prototype model</span></div>${footballArt({interactive:true})}</section>`;
}

function bindModalThemeControls() {
  const themeLabel=currentTheme()==="light"?"Switch to dark mode":"Switch to light mode";
  document.querySelectorAll(".modal,.watch-theatre").forEach(dialog=>{
    const head=dialog.querySelector(".modal-head,.watch-header");
    if(!head||head.querySelector("[data-modal-theme-toggle]"))return;
    const markup=`<button class="modal-theme-btn" data-action="toggle-theme" data-modal-theme-toggle aria-label="${themeLabel}" aria-pressed="${currentTheme()==="light"}" title="${themeLabel}">${themeIcon()}</button>`;
    const close=head.querySelector("[data-action=close-modal]");
    if(close)close.insertAdjacentHTML("beforebegin",markup);else head.insertAdjacentHTML("beforeend",markup);
  });
}
function printProspectus() {
  const sheet=document.querySelector("[data-prospectus-sheet]");if(!sheet)return;
  const printWindow=window.open("","_blank","noopener,noreferrer");
  if(!printWindow){showToast("Print window blocked","Allow pop-ups to print or save the prospectus as a PDF.");return;}
  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html><head><title>${esc(state.prospectus.title||"Prospectus")}</title><style>body{margin:0;background:#eef1ea;color:#17353b;font-family:Arial,sans-serif}.sheet{box-sizing:border-box;width:210mm;min-height:297mm;margin:18mm auto;padding:18mm;background:#fbfaf4;border:1px solid #c7d6cd;box-shadow:0 20px 50px rgba(0,0,0,.12)}h1{font-size:34px;line-height:1;margin:10px 0}h2{font-size:17px;margin:26px 0 7px}.eyebrow{font:700 10px monospace;letter-spacing:.14em;color:#197f85}.lede{font-size:15px;color:#53706b;line-height:1.5}.head{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #d3dfd6;padding-bottom:18px}.status{padding:8px 10px;border:1px solid #c78f4c;color:#9a682b;font:700 10px monospace;letter-spacing:.12em;height:max-content}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;padding:14px;background:#edf4ec}.meta small{display:block;font:700 9px monospace;color:#77918a}.meta strong{display:block;margin-top:5px;font-size:12px}.grid{display:grid;grid-template-columns:1.18fr .82fr;gap:24px}.copy{font-size:13px;line-height:1.65;color:#4d6b66}.block{padding:13px 0;border-top:1px solid #d3dfd6}.block p{font-size:13px;line-height:1.6;color:#4d6b66}.chips{display:flex;gap:6px;flex-wrap:wrap}.chip{padding:6px 8px;border-radius:5px;background:#f2dfaa;color:#6e5121;font:700 9px monospace}.footer{display:flex;justify-content:space-between;gap:12px;margin-top:40px;padding-top:12px;border-top:1px solid #d3dfd6;color:#6d8580;font:10px monospace}@media print{body{background:white}.sheet{margin:0;border:0;box-shadow:none;width:auto;min-height:0}}</style></head><body><main class="sheet">${sheet.innerHTML.replace(/prospectus-sheet-head/g,"head").replace(/prospectus-sheet-meta/g,"meta").replace(/prospectus-sheet-grid/g,"grid").replace(/prospectus-sheet-block/g,"block").replace(/prospectus-sheet-footer/g,"footer").replace(/card-meta/g,"chips").replace(/<span class="tag [^"]*">([^<]*)<\/span>/g,"<span class=\"chip\">$1</span>").replace(/<span class="tag">([^<]*)<\/span>/g,"<span class=\"chip\">$1</span>")}</main><script>window.onload=()=>window.print()<\/script></body></html>`);
  printWindow.document.close();
}
function bindInputs() {
  bindModalThemeControls();
  bindBallSimulation();
  enhancePassportModal();
  enhanceJoinForm();
  bindWhatsAppPhoneField("preferences",()=>{});
  syncProfileAvatar();
  const scheduleSearch=(input,focusSelector)=>input?.addEventListener("input",e=>{state.search=e.target.value;updateRouteQuery();clearTimeout(searchTimer);searchTimer=setTimeout(()=>{render();setTimeout(()=>document.querySelector(focusSelector)?.focus(),0);},180);});
  scheduleSearch(document.querySelector("#global-search"),"#global-search");
  scheduleSearch(document.querySelector("#mission-search"),"#mission-search");
  document.querySelector("#mission-filter")?.addEventListener("change", e=>{state.missionFilter=e.target.value;updateRouteQuery();render();});
  document.querySelector("#explore-type")?.addEventListener("change",e=>{state.exploreType=e.target.value;updateRouteQuery();render();});
  document.querySelector("#country-search")?.addEventListener("input", e=>{state.countrySearch=e.target.value;updateRouteQuery();clearTimeout(searchTimer);searchTimer=setTimeout(()=>render(),180);});
  document.querySelector("#country-filter")?.addEventListener("change", e=>{state.countryFilter=e.target.value;updateRouteQuery();render();});
  document.querySelectorAll("[data-impact-filter]").forEach(input=>input.addEventListener(input.dataset.impactFilter==="search"?"input":"change",()=>{const key=input.dataset.impactFilter;impactRuntime.filters[key]=input.value;if(key==="search"){clearTimeout(searchTimer);const at=input.selectionStart;searchTimer=setTimeout(()=>{render();const replacement=document.querySelector('[data-impact-filter="search"]');replacement?.focus();replacement?.setSelectionRange(at,at);},180);}else render();}));
  document.querySelector("#job-search")?.addEventListener("input",e=>{jobRuntime.filters.q=e.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{jobRuntime.loaded=false;loadGreenJobs(true);},260);});
  document.querySelectorAll("[data-job-filter]").forEach(input=>input.addEventListener("change",()=>{jobRuntime.filters[input.dataset.jobFilter]=input.value;jobRuntime.loaded=false;loadGreenJobs(true);}));
  document.querySelectorAll("[data-admin-jukebox-filter]").forEach(input=>input.addEventListener("change",()=>{state.adminJukeboxFilters={...state.adminJukeboxFilters,[input.dataset.adminJukeboxFilter]:input.value};render();}));
  document.querySelector("[data-jukebox-settings-country]")?.addEventListener("change", e=>{state.adminJukeboxSettingsCountry=e.target.value;render();});
  document.querySelector("#course-outcome")?.addEventListener("input", e=>{state.drafts.courseOutcome=e.target.value; persist();});
  document.querySelectorAll("[data-studio-field]").forEach(input=>{input.addEventListener("input",studioScheduleAutosave);input.addEventListener("change",studioScheduleAutosave);});
  document.querySelectorAll("input[type='file']").forEach(input=>input.addEventListener("change",()=>validateUpload(input)));
  document.querySelectorAll(".modal input:not([type='file']),.modal textarea,.modal select").forEach(input=>{const markDirty=()=>{draftDirty=true;};input.addEventListener("input",markDirty);input.addEventListener("change",markDirty);});
  document.querySelectorAll("[data-onboarding-field]").forEach(input=>{input.addEventListener("input",()=>syncOnboardingField(input));input.addEventListener("change",()=>syncOnboardingField(input));});
  document.querySelectorAll("[data-profile-continent]").forEach(input=>input.addEventListener("change",()=>{
    const prefix=input.dataset.profileContinent, country=document.querySelector(`[data-profile-country="${prefix}"]`), previous=country?.value||"";
    if(!country)return;
    const countries=profileCountriesFor(input.value);
    const nextCountry=countries.includes(previous)?previous:(prefix==="join"?"":(countries[0]||""));
    country.value=nextCountry;
    if(prefix==="join"){
      state.drafts={...state.drafts,passport:{...(state.drafts.passport||{}),continent:input.value,country:nextCountry}};
      persist();
    }
    draftDirty=true;
  }));
  document.querySelectorAll("[data-profile-country]").forEach(input=>input.addEventListener("change",()=>{
    const prefix=input.dataset.profileCountry, continent=document.querySelector(`[data-profile-continent="${prefix}"]`);
    const countryContinent=profileContinentFor(input.value);
    if(continent&&countryContinent)continent.value=countryContinent;
    if(prefix==="join"){
      state.drafts={...state.drafts,passport:{...(state.drafts.passport||{}),continent:continent?.value||"",country:input.value}};
      persist();
    }
    draftDirty=true;
  }));
  document.querySelectorAll("[data-profile-slug]").forEach(input=>{
    let timer=0;
    input.addEventListener("input",()=>{input.value=profileSlugValue(input.value);draftDirty=true;clearTimeout(timer);timer=setTimeout(()=>checkProfileSlug(input),260);});
    input.addEventListener("blur",()=>{clearTimeout(timer);checkProfileSlug(input);});
  });
}
function validateUpload(input) {
  const file=input.files?.[0]; if(!file)return;
  const accepted=(input.getAttribute("accept")||"").split(",").map(x=>x.trim().toLowerCase());
  const extension=`.${file.name.split(".").pop().toLowerCase()}`;
  const typeAllowed=!accepted.length||accepted.some(rule=>rule==="*"||rule===extension||(rule.endsWith("/*")&&file.type.startsWith(rule.slice(0,-1))));
  const maxBytes=input.id==="passport-cv"?8*1024*1024:12*1024*1024;
  if(!typeAllowed||file.size>maxBytes){
    input.value="";
    setModalFeedback(`That file cannot be used. Choose an allowed format under ${Math.round(maxBytes/1024/1024)} MB.`);
    input.focus();
    return false;
  }
  const filename=file.name.replace(/[^\w.\- ]/g,"_").slice(0,120);
  showToast("File ready for review",`${filename} · ${Math.ceil(file.size/1024)} KB. Upload is not published automatically.`);
  return true;
}

function profileSlugValue(value) {
  return String(value||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/-+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
}
async function checkProfileSlug(input) {
  const status=input?.closest(".field")?.querySelector("[data-profile-slug-status]");
  const slug=profileSlugValue(input?.value);
  if(input && input.value!==slug && !input.readOnly)input.value=slug;
  if(!status)return !slug;
  if(!slug){status.textContent="Optional until you reserve one · lowercase letters, numbers, and hyphens";input.dataset.slugAvailable="true";return true;}
  if(slug.length<3){status.textContent="Use at least 3 characters";input.dataset.slugAvailable="false";return false;}
  if(firebaseConfigured&&!accountUser()){
    status.textContent="Sign in to reserve this slug";
    input.dataset.slugAvailable="true";
    return true;
  }
  status.textContent="Checking availability…";
  try {
    if(firebaseConfigured){
      const available=await isProfileSlugAvailable(slug);
      input.dataset.slugAvailable=String(available);
      status.textContent=available?`/${slug} is available`:"That slug is already taken";
      status.classList.toggle("is-available",available);status.classList.toggle("is-unavailable",!available);
      return available;
    }
    const response=await fetch(`/api/profile/slug-availability?slug=${encodeURIComponent(slug)}`,{headers:{accept:"application/json"}}), result=await response.json().catch(()=>({}));
    const available=Boolean(response.ok&&result.available);
    input.dataset.slugAvailable=String(available);
    status.textContent=available?`/${slug} is available`:(result.error||"That slug is already taken");
    status.classList.toggle("is-available",available);status.classList.toggle("is-unavailable",!available);
    return available;
  } catch (_) {
    input.dataset.slugAvailable="false";status.textContent="Could not check the database. Try again while connected.";status.classList.remove("is-available");status.classList.add("is-unavailable");return false;
  }
}
function profileFormValues(prefix) {
  const field=id=>document.getElementById(`${prefix}-${id}`);
  const read=id=>field(id)?.value?.trim()||"";
  const valueOrExisting=(id,existing)=>field(id)?read(id):existing||"";
  const skills=field("skills"), interests=field("interests");
  return {display_name:read("name")||read("display"),slug:profileSlugValue(read("slug")),continent:read("continent"),country:read("country"),city:read("city"),bio:valueOrExisting("bio",state.passport.bio),languages:valueOrExisting("languages",state.passport.languages),availability:valueOrExisting("availability",state.passport.availability)||"Not set",participation:valueOrExisting("mode",valueOrExisting("participation",state.passport.participation))||"Remote and in-person",birth_month:valueOrExisting("birth-month",state.passport.birthMonth),birth_year:valueOrExisting("birth-year",state.passport.birthYear),avatar_url:state.passport.avatarUrl||"",referred_by_user_id:field("referrer-id")?.value||state.passport.referredById||"",skills:skills?read("skills").split(",").map(value=>value.trim()).filter(Boolean):state.passport.skills||[],interests:interests?read("interests").split(",").map(value=>value.trim()).filter(Boolean):state.passport.interests||[]};
}
function applyProfileState(profile) {
  const referrer=profile.referred_by||{};
  state.passport={...state.passport,started:true,name:profile.display_name??state.passport.name,slug:profile.slug??state.passport.slug,continent:profile.continent??state.passport.continent,country:profile.country??"",city:profile.city??"",bio:profile.bio??state.passport.bio,languages:profile.languages??state.passport.languages,availability:profile.availability??state.passport.availability,participation:profile.participation??state.passport.participation,birthMonth:profile.birth_month??state.passport.birthMonth,birthYear:profile.birth_year??state.passport.birthYear,avatarUrl:profile.avatar_url||profile.photo_url||state.passport.avatarUrl,referredById:referrer.user_id??state.passport.referredById,referredByName:referrer.display_name??state.passport.referredByName,referredBySlug:referrer.slug??state.passport.referredBySlug,referredByAvatarUrl:referrer.avatar_url??state.passport.referredByAvatarUrl,skills:Array.isArray(profile.skills)?profile.skills:state.passport.skills,interests:Array.isArray(profile.interests)?profile.interests:state.passport.interests,completion:Math.min(94,42+(profile.skills?.length?12:0)+(profile.interests?.length?10:0)+(profile.slug?10:0)+(profile.city?4:0)+(profile.avatar_url||profile.photo_url?5:0))};
  passportRuntime.referrer=referrer.user_id?{user_id:referrer.user_id,display_name:referrer.display_name,slug:referrer.slug,avatar_url:referrer.avatar_url}:null;
}
function whatsappProfileForField(profile) {
  if(!profile)return {};
  return {countryCode:profile.countryCode||profile.country_code,callingCode:profile.callingCode||profile.calling_code,localNumber:"",isPrimaryPhone:Boolean(profile.isPrimaryPhone||profile.is_primary_phone),whatsappAvailable:profile.whatsappAvailable===false||profile.whatsapp_available===0?false:profile.phoneNumberHash||profile.phone_number_hash?true:null,serviceConsent:["service_only","service_and_marketing"].includes(profile.consentStatus||profile.consent_status),marketingConsent:(profile.consentStatus||profile.consent_status)==="service_and_marketing"};
}
async function loadWhatsAppProfile() {
  if(whatsappProfileRuntime.loaded||whatsappProfileRuntime.loading)return;
  whatsappProfileRuntime.loading=true;
  try {
    const response=await fetch("/api/whatsapp/profile",{headers:{accept:"application/json"}}),result=await response.json().catch(()=>({}));
    if(response.ok){whatsappProfileRuntime.profile=result.profile||null;whatsappProfileRuntime.error="";if(["profile","join"].includes(state.view)||state.modal?.type==="join")render();}
  } catch(_){whatsappProfileRuntime.error="WhatsApp preferences are temporarily unavailable.";}
  whatsappProfileRuntime.loaded=true;whatsappProfileRuntime.loading=false;
}
async function saveWhatsAppProfileField(prefix) {
  const values=readWhatsAppPhoneField(prefix); if(!values)return {ok:true,skipped:true};
  if(values.whatsappAvailable===null)return {ok:true,skipped:true};
  const response=await fetch("/api/whatsapp/profile",{method:"PUT",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(values)}),result=await response.json().catch(()=>({}));
  if(!response.ok)return {ok:false,error:result.error||"WhatsApp number could not be saved."};
  if(values.whatsappAvailable===true){
    const consent=await fetch("/api/whatsapp/consent",{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify({service:values.service,marketing:values.marketing,source:`${prefix}_form`,languageVersion:"whatsapp-consent-v1"})}),consentResult=await consent.json().catch(()=>({}));
    if(!consent.ok)return {ok:false,error:consentResult.error||"Consent preferences could not be saved."};
  }
  whatsappProfileRuntime.loaded=false;whatsappProfileRuntime.profile=result.profile||null;await loadWhatsAppProfile();
  return {ok:true,profile:result.profile};
}
async function saveProfileRecord(values) {
  if(firebaseConfigured){
    if(!accountUser())return {ok:false,status:401,error:"Sign in with Google to save this profile."};
    try {
      const profile=await saveAccountProfile(values);
      applyProfileState(profile);persist();return {ok:true,profile};
    } catch(error){return {ok:false,status:400,error:error?.message||"The profile could not be saved."};}
  }
  const response=await fetch("/api/profile",{method:"PUT",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(values)});
  const result=await response.json().catch(()=>({}));
  if(response.ok&&result.profile){applyProfileState(result.profile);persist();return {ok:true,profile:result.profile};}
  return {ok:false,status:response.status,error:result.error||"The profile could not be saved."};
}
function saveProfileLocally(values) {
  const reservedSlug=state.passport.slug||"";
  applyProfileState({display_name:values.display_name,slug:reservedSlug,continent:values.continent,country:values.country,city:values.city,bio:values.bio,languages:values.languages,availability:values.availability,participation:values.participation,birth_month:values.birth_month,birth_year:values.birth_year,avatar_url:values.avatar_url,skills:values.skills,interests:values.interests,referred_by:{user_id:values.referred_by_user_id,display_name:passportRuntime.referrer?.display_name||"",slug:passportRuntime.referrer?.slug||"",avatar_url:passportRuntime.referrer?.avatar_url||""}});
  state.drafts={...state.drafts,passport:{...(state.drafts.passport||{}),display_name:values.display_name,slug:reservedSlug||values.slug,continent:values.continent,country:values.country,city:values.city,bio:values.bio}};
  persist();
}
async function saveJoinProfile() {
  const values=profileFormValues("join"), slugInput=document.getElementById("join-slug");
  if(!values.display_name){showToast("Add a display name","You can use a chosen name.");return;}
  if(!values.continent){showToast("Choose a broad location","Select a continent to continue.");return;}
  if(values.slug&&!(await checkProfileSlug(slugInput))){showToast("Choose another slug","A profile slug must be available before it can be reserved.");return;}
  const result=await saveProfileRecord(values);
  if(result.ok){state.drafts={...state.drafts,passport:{}};persist();const whatsapp=await saveWhatsAppProfileField("join");if(!whatsapp.ok){showToast("Profile saved",whatsapp.error);}else showToast("Profile saved",`Your profile slug is /${result.profile.slug||"not set"}.`);navigate("profile");return;}
  if(result.status===401){saveProfileLocally(values);showToast("Draft saved locally","Sign in to sync this profile and reserve a slug.");navigate("profile");return;}
  showToast("Profile not saved",result.error);
}
async function savePassportProfile() {
  const values=profileFormValues("passport"), slugInput=document.getElementById("passport-slug");
  if(!values.display_name){showToast("Add a display name","You can use a chosen name.");return;}
  if(!values.continent||(!values.country&&!['Antarctica','Zealandia'].includes(values.continent))){showToast("Choose your location","Select a continent and country.");return;}
  if(values.slug&&!(await checkProfileSlug(slugInput))){showToast("Choose another slug","A profile slug must be available before it can be reserved.");return;}
  const result=await saveProfileRecord(values);
  if(result.ok){const whatsapp=await saveWhatsAppProfileField("passport");state.modal=null;draftDirty=false;showToast("Passport saved",whatsapp.ok?"Your profile changes are synced and WhatsApp preferences are separate.":whatsapp.error);navigate("profile");return;}
  if(result.status===401){saveProfileLocally(values);state.modal=null;draftDirty=false;showToast("Passport draft saved locally","Sign in to reserve this profile slug against the database.");navigate("profile");return;}
  setModalFeedback(result.error);
}

function showToast(title, detail="") {
  const el=document.createElement("div"); el.className="toast"; el.innerHTML=`${title}${detail?`<small>${detail}</small>`:""}`; document.querySelector("#toast-region").append(el); setTimeout(()=>el.remove(),3600);
}
function transitionRender() {
  const body=document.body;
  routeTransitionToken++;
  clearTimeout(routeTransitionTimer);
  clearTimeout(mapTransitionTimer);body.classList.remove("route-transition","map-transition");
  routeTransitionRendering=true;render();routeTransitionRendering=false;
  window.scrollTo({top:0,left:0,behavior:"auto"});
}
function navigate(view, extra={}, options={}) {
  if(!VALID_ROUTES.has(view)){showToast("That destination is unavailable","The requested route was not found.");return;}
  if(state.modal&&draftDirty&&!options.skipConfirm&&!window.confirm("You have unsaved changes. Leave this panel and discard the draft?"))return;
  state.view=view; Object.assign(state,extra); if(!["course","mission","country","classroom","job"].includes(view))delete state.selectedId; state.modal=null; state.search="";
  if(view==="map"){openMapGateway();return;}
  const hash=routeHash();
  if(!options.fromHistory&&location.hash!==hash){const nextUrl=(location.pathname==="/map"||location.pathname==="/map/")?`/${hash}`:hash;history.pushState({view,...extra},"",nextUrl);}
  transitionRender();
}
function setModal(type, data={}) {
  const active=document.activeElement;
  modalRuntime.returnFocus=active?{element:active,action:active.dataset?.action||"",route:active.dataset?.route||"",isConnected:active.isConnected}:null;
  draftDirty=false; state.modal={type,...data}; render();
}
function closeModal(force=false) {
  if(!force&&state.modal&&draftDirty&&!window.confirm("You have unsaved changes. Close this panel and discard the draft?"))return;
  if(state.view==="impact"&&state.modal?.type==="impact-claim-detail")history.replaceState({view:"impact"},"", "#impact");
  draftDirty=false; state.modal=null; render();
}
function getField(id) { return document.getElementById(id)?.value?.trim()||""; }
function syncOnboardingField(field) {
  const key=field.dataset.onboardingField;
  if(!key)return;
  const value=field.type==="checkbox"?field.checked:field.value;
  state.onboarding={...state.onboarding,[key]:key==="skills"?String(value).split(",").map(item=>item.trim()).filter(Boolean).slice(0,30):value};
  persist();
}
function setModalFeedback(message, type="error") {
  const feedback=document.querySelector("[data-form-feedback]");
  if(feedback){feedback.className=`form-feedback ${type}`;feedback.textContent=message;}
}
function validateModal(action) {
  const required={
    "submit-peace":["activity-name","activity-organizer","activity-date","activity-location"],
    "submit-evidence":["evidence-record","evidence-summary","evidence-consent"],
    "submit-partner":["partner-name","partner-country","partner-contribution"],
    "save-mission":["mission-title","mission-location","mission-need","mission-approval"],
    "submit-media":["media-submit-title","media-submit-source","media-submit-rights"],
  }[action]||[];
  const missing=required.filter(id=>{const field=document.getElementById(id);return field?.type==="checkbox"?!field.checked:!field?.value?.trim();});
  if(missing.length){setModalFeedback("Complete the highlighted required fields before continuing.");const field=document.getElementById(missing[0]);field?.focus();field?.setAttribute("aria-invalid","true");return false;}
  document.querySelectorAll("[aria-invalid='true']").forEach(field=>field.removeAttribute("aria-invalid"));
  return true;
}
function guardDuplicateSubmission(buttonEl) {
  if(buttonEl.dataset.busy==="true"){setModalFeedback("This is already being submitted. Please wait.");return false;}
  buttonEl.dataset.busy="true";buttonEl.disabled=true;buttonEl.setAttribute("aria-busy","true");buttonEl.textContent="Saving…";return true;
}
async function submitMedia(buttonEl) {
  if(!validateModal("submit-media")||!guardDuplicateSubmission(buttonEl))return;
  const countryInput=document.getElementById("media-submit-country"), countryId=countryInput?.dataset.countryId||"", payload={
    media_type:getField("media-submit-type"),title:getField("media-submit-title"),creator:getField("media-submit-creator"),language:getField("media-submit-language"),genre:getField("media-submit-genre"),source_url:getField("media-submit-source"),description:getField("media-submit-description"),rights_confirmed:document.getElementById("media-submit-rights")?.checked===true,
  };
  try {
    const isMusic=payload.media_type==="music";
    const endpoint=isMusic?`/api/countries/${encodeURIComponent(countryId)}/jukebox/submissions`:`/api/countries/${encodeURIComponent(countryId)}/media`;
    const response=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(isMusic?{...payload,artist:payload.creator,context_note:payload.description}:payload)}), result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||`Submission failed (${response.status})`);
    mediaRuntime.loadedCountry="";jukeboxRuntime.loadedCountry="";state.modal=null;draftDirty=false;showToast(isMusic?"Track submitted for approval":"Submitted for approval","An administrator will review the source, context, and permission before it appears publicly.");render();
  } catch(error) {
    setModalFeedback(error.message.includes("Sign in")?"Sign in before submitting media.":error.message);buttonEl.disabled=false;buttonEl.dataset.busy="false";buttonEl.removeAttribute("aria-busy");buttonEl.textContent="Submit for approval";
  }
}
async function updateAdminMedia(buttonEl) {
  if(buttonEl.dataset.busy==="true")return;
  const id=buttonEl.dataset.mediaId,status=buttonEl.dataset.mediaStatus;if(!id||!status)return;
  buttonEl.dataset.busy="true";buttonEl.disabled=true;buttonEl.textContent="Saving…";
  try {
    const note=document.querySelector(`[data-admin-media-note="${CSS.escape(id)}"]`)?.value?.trim()||"";
    const response=await fetch(`/api/admin/media/${encodeURIComponent(id)}`,{method:"PATCH",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify({status,reviewer_note:note,featured:document.querySelector(`[data-admin-media-featured="${CSS.escape(id)}"]`)?.checked===true})}), result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||`Update failed (${response.status})`);
    if(result.media)adminMediaRuntime.records=adminMediaRuntime.records.map(record=>record.id===id?result.media:record);showToast(`Media ${status.toLowerCase()}`,`${result.media?.title||"The submission"} is now ${status.toLowerCase()}.`);adminRuntime.loaded=false;render();loadAdminWorkspace();
  } catch(error) { showToast("Media update failed",error.message||"Try again while connected.");buttonEl.disabled=false;buttonEl.dataset.busy="false";buttonEl.textContent=status==="Approved"?"Approve":status==="Rejected"?"Reject":"Archive"; }
}
async function updateAdminJukebox(buttonEl) {
  if(buttonEl.dataset.busy==="true")return;
  const id=buttonEl.dataset.jukeboxId, action=buttonEl.dataset.jukeboxStatus;
  if(!id||!action)return;
  buttonEl.dataset.busy="true";buttonEl.disabled=true;buttonEl.textContent="Saving…";
  try {
    const response=await fetch(`/api/admin/jukebox/tracks/${encodeURIComponent(id)}/${action}`,{method:"POST",headers:{accept:"application/json"}}), result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||`Update failed (${response.status})`);
    adminJukeboxRuntime.records=adminJukeboxRuntime.records.map(record=>record.id===id?result.track:record);adminJukeboxRuntime.reports=adminJukeboxRuntime.reports.map(report=>report.track_id===id?{...report,status:result.track?.status||report.status,archived:result.track?.archived||0}:report);adminJukeboxRuntime.audit=[{action:`jukebox_${action}`,detail:`Track ${action} action`,created_at:new Date().toISOString()},...adminJukeboxRuntime.audit];showToast(`Track ${action}`,`${result.track?.title||"The track"} is now ${result.track?.status?.toLowerCase()||action}.`);render();
  } catch(error) { showToast("Jukebox update failed",error.message||"Try again while connected.");buttonEl.disabled=false;buttonEl.dataset.busy="false";buttonEl.textContent=action[0].toUpperCase()+action.slice(1); }
}
async function saveAdminJukebox(buttonEl) {
  const id=buttonEl.dataset.jukeboxId;if(!id||buttonEl.dataset.busy==="true")return;
  buttonEl.dataset.busy="true";buttonEl.disabled=true;buttonEl.textContent="Saving…";
  const field=name=>document.querySelector(`[data-jukebox-field="${name}"][data-jukebox-id="${CSS.escape(id)}"]`), payload={title:field("title")?.value||"",artist:field("artist")?.value||"",genre:field("genre")?.value||"",language:field("language")?.value||"",context_note:field("context_note")?.value||"",source_url:field("source_url")?.value||"",order_index:field("order_index")?.value||0,reviewer_note:field("reviewer_note")?.value||"",featured:field("featured")?.checked===true};
  try {
    const response=await fetch(`/api/admin/jukebox/tracks/${encodeURIComponent(id)}`,{method:"PATCH",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(payload)}), result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||`Save failed (${response.status})`);
    adminJukeboxRuntime.records=adminJukeboxRuntime.records.map(record=>record.id===id?result.track:record);showToast("Track metadata saved","Provider URL, order, feature state, and reviewer note are recorded in the audit trail.");render();
  } catch(error) { showToast("Metadata save failed",error.message||"Check the provider URL.");buttonEl.disabled=false;buttonEl.dataset.busy="false";buttonEl.textContent="Save metadata"; }
}
async function saveAdminJukeboxSettings(buttonEl) {
  const countryId=buttonEl.dataset.jukeboxCountry;if(!countryId||buttonEl.dataset.busy==="true")return;
  buttonEl.dataset.busy="true";buttonEl.disabled=true;buttonEl.textContent="Saving…";
  const payload={brand_name:getField("jukebox-setting-brand"),tagline:getField("jukebox-setting-tagline"),accent_color:document.getElementById("jukebox-setting-accent")?.value,glow_color:document.getElementById("jukebox-setting-glow")?.value};
  try {
    const response=await fetch(`/api/admin/jukebox/${encodeURIComponent(countryId)}/settings`,{method:"PUT",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(payload)}), result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||`Save failed (${response.status})`);
    adminJukeboxRuntime.settings=adminJukeboxRuntime.settings.filter(item=>item.country_id!==countryId).concat(result.settings);showToast("Branding saved","The public country jukebox will use it on its next request.");render();
  } catch(error) { showToast("Branding save failed",error.message||"Try again while connected.");buttonEl.disabled=false;buttonEl.dataset.busy="false";buttonEl.textContent="Save branding"; }
}
async function reportJukeboxTrack(buttonEl) {
  const id=buttonEl.dataset.jukeboxTrackId;if(!id)return;
  const reason=window.prompt("Why should this track be reviewed or taken down?","Rights or safety concern");if(!reason?.trim())return;
  try { const response=await fetch(`/api/countries/${encodeURIComponent(jukeboxRuntime.countryId)}/jukebox/tracks/${encodeURIComponent(id)}/report`,{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify({reason})}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Report failed");showToast("Report sent","The track has been flagged for administrator review."); } catch(error) { showToast("Report unavailable",error.message||"Try again while connected."); }
}
async function saveAdminEntry(buttonEl) {
  if(!guardDuplicateSubmission(buttonEl))return;
  const tab=state.modal?.tab||state.adminTab, locationTab=["Locations","Schools","Universities","Orphanages"].includes(tab), eventTab=tab==="Events", title=getField("admin-entry-title");
  if(!title){setModalFeedback("Add a title or name before saving.");buttonEl.disabled=false;buttonEl.dataset.busy="false";buttonEl.removeAttribute("aria-busy");buttonEl.textContent="Save entry";return;}
  const id=`admin-${crypto.randomUUID?crypto.randomUUID():Date.now()}`;
  const payload=locationTab?{id,name:title,category:getField("admin-entry-category")||"mission",country_iso3:getField("admin-entry-country").toUpperCase(),county:getField("admin-entry-county"),settlement:getField("admin-entry-settlement"),latitude:getField("admin-entry-lat")||null,longitude:getField("admin-entry-lng")||null,privacy:getField("admin-entry-privacy")||"Approximate",source_name:getField("admin-entry-source"),source_url:getField("admin-entry-source-url"),verification:getField("admin-entry-status")||"Needs Review",visibility:getField("admin-entry-visibility")||"public"}:eventTab?{id,title,summary:getField("admin-entry-summary"),status:getField("admin-entry-status")||"Planned",country:getField("admin-entry-country"),date:getField("admin-entry-date"),type:getField("admin-entry-type"),location:getField("admin-entry-location"),organizer:getField("admin-entry-organizer"),latitude:getField("admin-entry-lat")||null,longitude:getField("admin-entry-lng")||null,source_url:getField("admin-entry-source-url"),notes:getField("admin-entry-details"),visibility:getField("admin-entry-visibility")||"public"}:{id,tab,title,summary:getField("admin-entry-summary"),status:getField("admin-entry-status")||"Draft",country:getField("admin-entry-country"),source_url:getField("admin-entry-source-url"),details:{notes:getField("admin-entry-details")},visibility:getField("admin-entry-visibility")||"public"};
  try {
    const endpoint=locationTab?"/api/admin/locations":eventTab?"/api/admin/events":"/api/admin/records", response=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(payload)}), result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||`Save failed (${response.status})`);
    if(result.record){adminRuntime.records=[result.record,...adminRuntime.records.filter(record=>record.id!==result.record.id)];if(eventTab&&result.record.visibility==="public"){eventRuntime.records=[result.record,...eventRuntime.records.filter(record=>record.id!==result.record.id)];eventRuntime.loaded=true;}if(result.record.visibility==="public"){publicRecordsRuntime.records=[result.record,...publicRecordsRuntime.records.filter(record=>record.id!==result.record.id)];publicRecordsRuntime.loaded=true;}}
    adminRuntime.loaded=false;adminRuntime.error="";state.modal=null;draftDirty=false;showToast("Entry saved",`${tab} is now connected to the admin registry and public index.`);render();loadAdminWorkspace();
  } catch(error) {
    setModalFeedback(error.message.includes("authorization")?"Owner authorization is required for admin writes.":error.message);
    buttonEl.disabled=false;buttonEl.dataset.busy="false";buttonEl.removeAttribute("aria-busy");buttonEl.textContent="Save entry";
  }
}
function exportAdminRecords() {
  const rows=adminRuntime.records.map(record=>({...record,details:record.details||{}}));
  const blob=new Blob([JSON.stringify(rows,null,2)],{type:"application/json"}), url=URL.createObjectURL(blob), link=document.createElement("a");
  link.href=url;link.download=`be-the-change-admin-records-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url);showToast("Export prepared",`${rows.length} persistent admin record${rows.length===1?"":"s"} exported.`);
}
function parseHashRoute() {
  if(location.pathname==="/map"||location.pathname==="/map/") { parseMapRoute(); return; }
  if(location.pathname==="/admin"||location.pathname==="/admin/") { state.view="admin"; return; }
  if(location.pathname==="/whatsapp"||location.pathname==="/whatsapp/"||location.pathname==="/whatsapp/index.html") { state.view="whatsapp"; state.modal=null; state.search=""; return; }
  if(location.pathname==="/sdgs"||location.pathname==="/sdgs/") { state.view="sdgs";state.modal=null;state.search="";return; }
  if(location.pathname==="/my-map"||location.pathname==="/my-map/") { state.view="my-map";state.modal=null;state.search="";return; }
  const cleanPath=location.pathname.replace(/^\/+|\/+$/g,"");
  const isCleanRoute=!location.hash&&cleanPath&&cleanPath!=="index.html";
  const routeSource=isCleanRoute?cleanPath:location.hash.replace(/^#/,"");
  const [path,queryStringFromHash=""]=routeSource.split("?");
  const queryString=isCleanRoute?location.search.replace(/^\?/,""):queryStringFromHash;
  const [rawView,rawId]=path.split("/");
  const params=new URLSearchParams(queryString);
  const view=!rawView?"home":VALID_ROUTES.has(rawView)?rawView:"not-found";
  state.view=view;
  impactRuntime.pendingClaimId=view==="impact"?params.get("claim"):null;
  if(view==="map"){parseMapRoute();return;}
  if(["mission","course","country","classroom","job"].includes(view)){
    try { state.selectedId=rawId?decodeURIComponent(rawId):undefined; } catch { state.selectedId=rawId||undefined; }
  }
  else delete state.selectedId;
  state.search=params.get("search")||"";
  state.missionFilter=params.get("stage")||"All";
  state.exploreType=params.get("type")||"All records";
  state.countrySearch=params.get("countrySearch")||"";
  state.countryFilter=params.get("countryFilter")||"All Countries";
}
function routeHash() {
  let hash=`#${state.view}${["mission","course","country","classroom","job"].includes(state.view)&&state.selectedId?`/${encodeURIComponent(state.selectedId)}`:""}`;
  const params=new URLSearchParams();
  if(state.search)params.set("search",state.search);
  if(state.view==="missions"&&state.missionFilter!=="All")params.set("stage",state.missionFilter);
  if(state.view==="explore"&&state.exploreType!=="All records")params.set("type",state.exploreType);
  if(state.view==="countries"&&state.countrySearch)params.set("countrySearch",state.countrySearch);
  if(state.view==="countries"&&state.countryFilter!=="All Countries")params.set("countryFilter",state.countryFilter);
  const query=params.toString();
  return query?`${hash}?${query}`:hash;
}
function updateRouteQuery() {
  const hash=routeHash();
  if(location.hash!==hash)history.replaceState({view:state.view,selectedId:state.selectedId},"",hash);
}
function modalFocusable() {
  return [...document.querySelectorAll(".modal button,.modal input,.modal select,.modal textarea,[data-modal-body] [tabindex]:not([tabindex='-1'])")].filter(el=>!el.disabled&&el.offsetParent!==null);
}
function handleGlobalKeydown(event) {
  const breakdownCard=event.target.closest?.('[data-action="open-breakdown"]');
  if(breakdownCard&&!state.modal&&(event.key==="Enter"||event.key===" ")){
    event.preventDefault();
    setModal("breakdown",{section:breakdownCard.dataset.breakdownSection,id:breakdownCard.dataset.breakdownId});
    return;
  }
  if(!state.modal)return;
  if(event.key==="Escape"){event.preventDefault();closeModal();return;}
  if(event.key==="Tab"){
    const focusable=modalFocusable();if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
}
function setOfflineState(offline) {
  if(offline)showToast("You are offline","New drafts stay in this browser until you reconnect.");
  render();
}

parseHashRoute();
window.scrollTo({top:0,left:0,behavior:"auto"});
window.addEventListener("popstate",()=>{parseHashRoute();state.modal=null;transitionRender();if(state.view==="impact"&&impactRuntime.pendingClaimId&&impactRuntime.loaded){const id=impactRuntime.pendingClaimId;impactRuntime.pendingClaimId=null;openImpactClaim(id);}});
window.addEventListener("online",()=>{setOfflineState(false);syncPendingMapDrafts();});
window.addEventListener("offline",()=>setOfflineState(true));
window.addEventListener("beforeunload",event=>{if(!draftDirty)return;event.preventDefault();event.returnValue="";});
document.addEventListener("keydown",handleGlobalKeydown);
document.addEventListener("fullscreenchange",syncMapFullscreenState);

document.addEventListener("click", async (e)=>{
  const el=e.target.closest("[data-route],[data-action]"); if(!el)return;
  const route=el.dataset.route, action=el.dataset.action;
  if(route){ e.preventDefault(); if(state.modal&&draftDirty&&!window.confirm("You have unsaved changes. Leave this panel and discard the draft?"))return; navigate(route); return; }
  if(el.closest("[data-modal-body]")===null && el.classList.contains("modal-backdrop")){closeModal();return;}
  if(action==="google-signin"){
    if(!firebaseConfigured){accountRuntime.error="Add your Firebase web app configuration to enable Google sign-in.";render();return;}
    if(accountRuntime.busy)return;
    accountRuntime.busy=true;accountRuntime.error="";render();
    try{await signInWithGoogle();}
    catch(error){if(error?.code!=="auth/popup-closed-by-user"&&error?.code!=="auth/cancelled-popup-request")accountRuntime.error=error?.message||"Google sign-in could not finish.";}
    finally{accountRuntime.busy=false;render();}
    return;
  }
  if(action==="google-signout"){
    try{await signOutAccount();}catch(error){accountRuntime.error=error?.message||"Sign-out failed.";render();}
    return;
  }
  if(action==="import-guest-draft"){await importGuestDraft();return;}
  if(action==="choose-personalization"){
    const choice=el.dataset.personalizationChoice;
    if(!Object.prototype.hasOwnProperty.call(PERSONALIZATION_CHOICES,choice))return;
    state.personalization=normalisePersonalization({choice});
    persist();
    render();
    announcePersonalizedTitle();
    return;
  }
  if(await handleWhatsAppAction(action,el,state,{persist,render,navigate,toast:showToast,loadAdminData:loadWhatsAppAdminData}))return;
  if(action==="open-search"){setModal("search");return;} if(action==="open-more"){setModal("more");return;} if(action==="open-prospectus"){setModal("prospectus");return;} if(action==="close-modal"){closeModal();return;}
  if(action==="toggle-theme"){toggleTheme();return;}
  if(action==="enterprise-invitation"){state.enterprise.section=el.dataset.enterpriseSection||"home";persist();navigate("enterprise");return;}
  if(action==="stripe-admin-save"){await saveStripeAdminSettings();return;}
  if(action==="stripe-admin-test"){await testStripeAdminConnection();return;}
  if(action==="stripe-admin-refresh"){stripeAdminRuntime.loaded=false;await loadStripeAdmin(true);return;}
  if(action?.startsWith("enterprise-")){
    const handled=await handleEnterpriseAction(action,el,state.enterprise,enterpriseContext(state.view==="admin"&&state.adminTab==="Enterprise Ops"));
    if(handled)return;
  }
  if(action==="open-breakdown"){setModal("breakdown",{section:el.dataset.breakdownSection,id:el.dataset.breakdownId});return;}
  if(action==="open-media-submit"){setModal("media-submit",{countryId:el.dataset.countryId||"ghana",mediaType:el.dataset.mediaType||"music"});return;}
  if(action==="open-job-post"){jobRuntime.assessment=null;jobRuntime.draft={};setModal("job-post");return;}
  if(action==="open-job"){jobRuntime.selected=jobRuntime.records.find(item=>item.slug===el.dataset.jobSlug)||null;jobRuntime.detailLoadedSlug=jobRuntime.selected?el.dataset.jobSlug:"";navigate("job",{selectedId:el.dataset.jobSlug});return;}
  if(action==="jobs-refresh"){jobRuntime.loaded=false;loadGreenJobs(true);return;}
  if(action==="job-smart-review"){
    const draft=jobFormValues();jobRuntime.draft=draft;
    try{const response=await fetch("/api/jobs/smart-review",{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(draft)}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"The listing could not be checked.");jobRuntime.assessment=result;render();}
    catch(error){setModalFeedback(error.message||"The listing could not be checked.");}
    return;
  }
  if(action==="submit-job"){
    const draft=jobFormValues();jobRuntime.draft=draft;if(!draft.title||!draft.employer_name||draft.description.length<80||!draft.application_url){setModalFeedback("Add a title, employer, application URL, and a role description of at least 80 characters.");return;}
    el.disabled=true;setModalFeedback("Submitting for review…","info");
    try{const response=await fetch("/api/jobs",{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(draft)}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"The job could not be submitted.");jobRuntime.loaded=false;jobRuntime.draft={};jobRuntime.assessment=null;closeModal(true);showToast("Job sent to review","It will remain private until an administrator verifies and publishes it.");}
    catch(error){el.disabled=false;setModalFeedback(error.message||"The job could not be submitted.");}
    return;
  }
  if(action==="map-open") { e.preventDefault(); e.stopPropagation(); openMapGateway(); return; }
  if(action==="regenerate-country-image") { e.preventDefault(); e.stopPropagation(); regenerateCountryImage(el); return; }
  if(action==="map-back") { if(document.fullscreenElement)document.exitFullscreen?.().catch?.(()=>{});mapRuntime.fullscreenFallback=false;document.body.classList.remove("map-fullscreen-fallback");state.view="home";state.hero.paused=false;history.pushState({view:"home"},"", "/");transitionRender();setTimeout(()=>document.querySelector("[data-map-focus]")?.focus(),0);return; }
  if(action==="map-tool") { state.map.leftTool=el.dataset.mapTool||"filters";state.map.leftCollapsed=false;state.map.filtersOpen=false;persist();render();return; }
  if(action==="map-collapse-filters") { state.map.leftCollapsed=!state.map.leftCollapsed;render();return; }
  if(action==="map-focus") { state.map.focusMode=!state.map.focusMode;state.map.leftCollapsed=true;state.map.rightOpen=state.map.focusMode?"":"selected";persist();render();return; }
  if(action==="map-sidebar-collapse") { state.map.focusMode=false;state.map.rightOpen="";render();return; }
  if(action==="map-camera-preset") { const preset=el.dataset.mapPreset;state.map.birdseye=preset==="birdseye";state.map.pitch=state.map.birdseye?52:0;state.map.bearing=state.map.birdseye?18:0;state.map.zoom=state.map.birdseye?13:state.map.zoom;updateMapUrl();if(mapRuntime.glMap)mapRuntime.glMap.easeTo({pitch:state.map.pitch,bearing:state.map.bearing,zoom:state.map.zoom,duration:420});render();return; }
  if(action==="map-camera-reset") { state.map.birdseye=false;state.map.pitch=0;state.map.bearing=0;if(mapRuntime.glMap)mapRuntime.glMap.easeTo({pitch:0,bearing:0,duration:320});render();return; }
  if(action==="map-fit-results") { const points=mapVisibleRecords().filter(item=>item.lat!=null&&item.lng!=null);if(!points.length){showToast("No mapped points","Try another layer or country.");return;}if(mapRuntime.glMap){const bounds=points.reduce((box,item)=>box.extend([Number(item.lng),Number(item.lat)]),new window.maplibregl.LngLatBounds());mapRuntime.glMap.fitBounds(bounds,{padding:65,maxZoom:points.length===1?10:12,duration:450});}else{state.map.centerLat=Number(points[0].lat);state.map.centerLng=Number(points[0].lng);state.map.zoom=points.length===1?10:6;render();}return; }
  if(action==="map-save-view") { const view={country:state.map.country,centerLat:state.map.centerLat,centerLng:state.map.centerLng,zoom:state.map.zoom,pitch:state.map.pitch,bearing:state.map.bearing,fov:state.map.fov,terrain:state.map.terrain,basemap:state.map.basemap,layer:{...state.map.layer},filters:{search:state.map.search,county:state.map.county,recordType:state.map.recordType,sdg:state.map.sdg,verification:state.map.verification}};const saved={localId:crypto.randomUUID(),localOwner:accountRuntime.uid||"guest",payload:view,name:`${state.map.country} map view`,syncStatus:"Local Draft"};window.BTCOffline?.saveMapView(saved).then(()=>{mapRuntime.savedViews.unshift(saved);showToast("Map view saved","Restore it from My Map.");}).catch(()=>showToast("Save unavailable","Offline storage is unavailable."));return; }
  if(action==="map-offline-pack") { const records=mapVisibleRecords().filter(record=>record.type!=="personal");window.BTCOffline?.put("offlinePacks",{localId:`pack-${state.map.country}`,country:state.map.country,payload:{records,county:state.map.county},syncStatus:"Synced"}).then(()=>showToast("Offline pack saved",`${records.length} public records are available on this device.`)).catch(()=>showToast("Offline storage unavailable","The map remains available while connected."));return; }
  if(action==="map-personal-map") { navigate("my-map");return; }
  if(action==="map-save-record") { const recordId=el.dataset.mapRecord,record=mapRecords().find(item=>item.id===recordId);if(!record)return;const item={localId:`saved-${accountRuntime.uid||"guest"}-${recordId}`,localOwner:accountRuntime.uid||"guest",serverId:recordId,recordId,recordType:record.type,mapId:"my-map",payload:{name:record.name,recordId,countryIso:state.map.country},syncStatus:"Local Draft"};window.BTCOffline?.put("personalMapItems",item).then(()=>{mapRuntime.savedItems=[item,...mapRuntime.savedItems.filter(saved=>saved.localId!==item.localId)];showToast("Saved to My Map","This record is private on this device.");}).catch(()=>showToast("Save unavailable","Offline storage is unavailable."));return; }
  if(action==="map-checkin") { setModal("map-checkin",{recordId:el.dataset.mapRecord});return; }
  if(action==="map-checkin-save") { await saveMapCheckIn(false);return; }
  if(action==="map-checkin-submit") { await saveMapCheckIn(true);return; }
  if(action==="map-add-personal") { setModal("map-personal-place");return; }
  if(action==="map-personal-save") { await savePersonalMapPlace();return; }
  if(action==="map-import-layer") { document.querySelector("[data-map-layer-file]")?.click();return; }
  if(action==="map-proposal-submit") { await submitMapProposal();return; }
  if(action==="map-open-geometadata") {
    const recordId=el.dataset.mapRecord;
    const countryRecord=COUNTRY_RECORDS.find(item=>`country-${item.iso3}`===recordId);
    const record=mapRecords().find(item=>item.id===recordId)||countryRecord&&{id:recordId,country:countryRecord.name};
    if(record){
      const country=COUNTRY_RECORDS.find(item=>item.name===record.country||item.iso3===record.country||item.id===record.country);
      state.view="map";state.modal=null;state.map.country=country?.iso3||state.map.country||"GLB";state.map.selectedId=record.id;state.map.selectedSlug=record.slug||poiSlug(record);state.map.rightOpen="selected";
      clearTimeout(routeTransitionTimer);routeTransitionToken++;document.body.classList.remove("route-transition");
      updateMapUrl(false);render();
    }
    return;
  }
  if(action==="map-copy-coordinates") { const lat=el.dataset.mapLat,lng=el.dataset.mapLng;if(lat&&lng&&navigator.clipboard)navigator.clipboard.writeText(`${lat}, ${lng}`).then(()=>showToast("Coordinates copied","Public precision was respected."));return; }
  if(action==="map-clear-filters") { state.map={...state.map,search:"",county:"All counties",recordType:"All types",sdg:"All SDGs",missionStage:"All stages",educationType:"All education",verification:"All verification"};updateMapUrl();render();return; }
  if(action==="map-clear-selection") { state.map.selectedId=null;state.map.selectedSlug=null;updateMapUrl();render();return; }
  if(action==="map-mobile-filters") { state.map.leftCollapsed=false;state.map.filtersOpen=!state.map.filtersOpen;render();return; }
  if(action==="map-mobile-layers") { state.map.leftTool="layers";state.map.leftCollapsed=false;state.map.filtersOpen=!state.map.filtersOpen;persist();render();return; }
  if(action==="map-mobile-details") { if(!state.map.selectedId){showToast("Select a map record","Choose a marker or browse the records list first.");return;}state.map.rightOpen=state.map.rightOpen==="selected"?"":"selected";state.map.focusMode=false;persist();render();return; }
  if(action==="map-fullscreen") { toggleMapFullscreen();return; }
  if(action==="map-share") { const params=new URLSearchParams(mapQueryString());params.delete("q");if(mapRecords().find(item=>item.id===state.map.selectedId)?.type==="personal"){params.delete("poi");params.delete("lat");params.delete("lng");}const hidden=new Set((params.get("hide")||"").split(",").filter(Boolean));hidden.add("personal");params.set("hide",[...hidden].join(","));const link=new URL(location.href);link.hash=`map?${params}`;navigator.clipboard?.writeText(link.toString()).then(()=>showToast("Map link copied","Private places and search text were excluded.")).catch(()=>showToast("Copy unavailable","Use your browser’s address bar to copy the map link."));return; }
  if(action==="map-export") { const records=mapVisibleRecords().filter(record=>record.type!=="personal").map(record=>['Country Only','County/Region'].includes(record.privacy)?{...record,lat:null,lng:null}:record),blob=new Blob([JSON.stringify(records,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="be-the-change-map-records.json";a.click();URL.revokeObjectURL(url);showToast("Public records exported","Private places and generalized coordinates were excluded.");return; }
  if(action==="map-saved") { navigate("my-map");return; }
  if(action==="map-add-location") { setModal("map-proposal");return; }
  if(action==="map-view-record") { const record=mapRecords().find(item=>item.id===state.map.selectedId);if(!record)return;if(record.claimId){openImpactClaim(record.claimId);return;}if(record.type==="chapter")return navigate(record.routeId==="ghana"?"ghana":"country",{selectedId:record.routeId});if(record.type==="mission"&&seed.missions.some(item=>item.id===record.id)){setModal("breakdown",{section:"missions",id:record.id});return;}setModal("map-record",{recordId:record.id});return; }
  if(action==="map-open-section") {navigate(el.dataset.mapSection||"explore",{}, {skipConfirm:true});return;}
  if(action==="map-open-saved-item") { const item=mapRuntime.savedItems.find(saved=>saved.localId===el.dataset.mapItem);if(!item)return;const iso=item.payload?.countryIso||item.payload?.record?.countryIso||"GLB";state.map.country=iso;state.map.selectedId=item.recordId;state.map.selectedSlug=null;state.map.layer.personal=true;state.map.centerLat=item.payload?.record?.lat??null;state.map.centerLng=item.payload?.record?.lng??null;state.map.zoom=state.map.centerLat!=null?10:6;state.view="map";updateMapUrl(false);render();return; }
  if(action==="map-edit-note") {setModal("map-note",{itemId:el.dataset.mapItem});return;}
  if(action==="map-save-note") {const item=mapRuntime.savedItems.find(saved=>saved.localId===state.modal?.itemId);if(!item)return;item.collection=getField("map-note-collection")||"Saved Places";item.note=getField("map-note-text");await window.BTCOffline?.put("personalMapItems",item);draftDirty=false;state.modal=null;render();showToast("Note saved","This note stays in your private workspace.");return;}
  if(action==="map-restore-view") { const saved=mapRuntime.savedViews.find(view=>view.localId===el.dataset.mapItem),view=saved?.payload;if(!view)return;state.map={...state.map,country:view.country||"GLB",centerLat:view.centerLat??null,centerLng:view.centerLng??null,zoom:view.zoom||6,pitch:view.pitch||0,bearing:view.bearing||0,fov:view.fov||45,terrain:Boolean(view.terrain),basemap:view.basemap||"satellite",layer:{...defaultState.map.layer,...view.layer},search:view.filters?.search||"",county:view.filters?.county||"All counties",recordType:view.filters?.recordType||"All types",sdg:view.filters?.sdg||"All SDGs",verification:view.filters?.verification||"All verification"};state.view="map";updateMapUrl(false);render();return; }
  if(action==="map-edit-draft") { const draft=mapRuntime.draftCheckIns.find(item=>item.localId===el.dataset.mapItem);if(!draft)return;state.map.country=draft.countryIso||"GLB";state.map.selectedId=draft.recordId;state.view="map";updateMapUrl(false);state.modal={type:"map-checkin",recordId:draft.recordId,draft};render();return; }
  if(action==="map-open-submitted") { const item=mapRuntime.myCheckIns.find(row=>row.id===el.dataset.mapItem);if(!item)return;if(item.moderation_status==="Needs Changes"){const recordId=item.location_id||item.event_id||item.mission_id,draft={localId:`resubmit-${item.id}`,submittedId:item.id,recordId,recordType:item.event_id?"event":item.mission_id?"mission":"location",recordName:recordId,status_text:item.status_text,evidence_url:item.evidence_url||"",consent_confirmed:Boolean(item.evidence_url),visibility:item.visibility};state.map.country=mapRuntime.savedItems.find(saved=>saved.recordId===recordId)?.payload?.countryIso||state.map.country;state.view="map";state.modal={type:"map-checkin",recordId,draft};render();return;}showToast(item.moderation_status||"Review Required",item.status_text||"Your submitted check-in");return; }
  if(action==="map-open-layer") { state.view="map";state.map.layer.personal=true;state.map.leftTool="layers";state.map.leftCollapsed=false;updateMapUrl(false);render();return; }
  if(action==="map-sync-drafts") {await syncPendingMapDrafts();return;}
  if(["map-remove-saved","map-remove-view","map-remove-layer","map-discard-draft"].includes(action)) {if(!window.confirm("Remove this item from this device?"))return;const id=el.dataset.mapItem,store=action==="map-remove-saved"?"personalMapItems":action==="map-remove-view"?"savedViews":action==="map-remove-layer"?"cachedMapLayers":"draftCheckIns";try{await window.BTCOffline.remove(store,id);if(action==="map-remove-saved"){mapRuntime.savedItems=mapRuntime.savedItems.filter(item=>item.localId!==id);mapRuntime.localItems=mapRuntime.localItems.filter(item=>item.id!==id);}if(action==="map-remove-view")mapRuntime.savedViews=mapRuntime.savedViews.filter(item=>item.localId!==id);if(action==="map-remove-layer")mapRuntime.customLayers=mapRuntime.customLayers.filter(item=>item.localId!==id);if(action==="map-discard-draft"){await window.BTCOffline.remove("pendingSync",id);mapRuntime.draftCheckIns=mapRuntime.draftCheckIns.filter(item=>item.localId!==id);}render();showToast("Removed","The item is no longer in My Map.");}catch(error){showToast("Could not remove item",error.message||"Try again.");}return;}
  if(action==="map-withdraw-proposal") {const id=el.dataset.mapItem;try{const response=await fetch(`/api/map/proposals?id=${encodeURIComponent(id)}`,{method:"DELETE"}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Withdrawal failed");mapRuntime.proposals=mapRuntime.proposals.filter(item=>item.id!==id);render();showToast("Proposal withdrawn","It was removed from the review queue.");}catch(error){showToast("Withdrawal unavailable",error.message);}return;}
  if(action==="map-edit-proposal") {const proposal=mapRuntime.proposals.find(item=>item.id===el.dataset.mapItem);if(proposal){state.map.country=proposal.country_iso3;setModal("map-proposal",{proposal});}return;}
  if(action==="pwa-install-settings"){window.__btcPwa?.meaningfulSignal?.();if(!window.__btcPwa?.isStandalone)showToast("Install from your browser menu","Install prompts appear after a meaningful action when the browser supports them.");return;}
  if(action==="pwa-clear-offline"){if(!window.confirm("Clear downloaded offline content? Local drafts and account data will remain."))return;if(!window.caches){showToast("Offline storage unavailable","Your local drafts were kept.");return;}window.caches.keys().then(keys=>Promise.all(keys.filter(key=>key.includes("btc-")&&!key.endsWith("-static")).map(key=>caches.delete(key)))).finally(()=>showToast("Offline content cleared","Your local drafts were kept."));return;}
  if(action==="route-explore"&&el.textContent.trim()==="Explore the World") { openMapGateway(); return; }
  if(action==="hero-mode"){applyHeroMode(el.dataset.mode,true);return;}
  if(action==="country-slide-prev"){setCountrySlide((state.hero.countrySlide||0)-1,true);return;}
  if(action==="country-slide-next"){setCountrySlide((state.hero.countrySlide||0)+1,true);return;}
  if(action==="country-slide-to"){setCountrySlide(Number(el.dataset.index)||0,true);return;}
  if(action==="country-slide-map"){
    const country=COUNTRY_RECORDS.find(item=>item.id===el.dataset.country), node=heroNodes.find(item=>item.recordId===country?.id);
    if(node){state.hero.selected=node.id;state.hero.countrySlide=countrySlideIndexForNode(node);openMapGateway();}
    return;
  }
  if(action==="hero-reset"){heroRuntime.rotation=0;heroRuntime.tilt=0;heroRuntime.zoom=1;heroRuntime.velocityX=0;heroRuntime.pausedByInteraction=false;const frame=document.querySelector("[data-earth-frame]");if(frame)frame.style.transform="translate3d(0,0,0) rotateY(0deg) scale(1)";if(threeEarthRuntime.group){threeEarthRuntime.group.rotation.set(0,0,0);threeEarthRuntime.targetY=null;threeEarthRuntime.targetX=0;threeEarthRuntime.group.scale.setScalar(1);threeEarthRuntime.camera.position.z=3.05;updateWebGLPlacemarkProjection();threeEarthRuntime.renderer.render(threeEarthRuntime.scene,threeEarthRuntime.camera);}persist();return;}
  if(action==="hero-pause"){state.hero.paused=!state.hero.paused;if(!state.hero.paused)heroRuntime.pausedByInteraction=false;persist();el.setAttribute("aria-pressed",String(state.hero.paused));el.setAttribute("aria-label",state.hero.paused?"Resume animation":"Pause animation");el.title=state.hero.paused?"Resume animation":"Pause animation";el.innerHTML=icon(state.hero.paused?"play":"pause");if(!state.hero.paused&&!heroRuntime.reduced&&!heroRuntime.raf)heroRuntime.raf=requestAnimationFrame(renderHeroFrame);if(state.hero.paused&&heroRuntime.raf){cancelAnimationFrame(heroRuntime.raf);heroRuntime.raf=0;}return;}
  if(action==="hero-reduced"){state.hero.reducedMotion=!state.hero.reducedMotion;heroRuntime.reduced=state.hero.reducedMotion||window.matchMedia("(prefers-reduced-motion: reduce)").matches;persist();showToast(heroRuntime.reduced?"Reduced motion on":"Reduced motion off","The Earth and title transitions adapt to your preference.");render();return;}
  if(action==="hero-quality"){const levels=["High","Balanced","Low Power"],index=levels.indexOf(state.hero.quality||"Balanced"),next=levels[(index+1)%levels.length];state.hero.quality=next;persist();showToast(`Globe quality: ${next}`,next==="Low Power"?"Lower detail and motion for cooler mobile performance.":"The globe will reload with the selected texture and cloud budget.");render();return;}
  if(action==="hero-title-prev"){setHeroTitle(state.hero.titleIndex-1,true);return;}
  if(action==="hero-title-next"){setHeroTitle(state.hero.titleIndex+1,true);return;}
  if(action==="hero-title-goto"){setHeroTitle(Number(el.dataset.index)||0,true);return;}
  if(action==="hero-title-pause"){state.hero.titlePaused=!state.hero.titlePaused;persist();render();return;}
  if(action==="hero-details"){const node=heroNodeById(state.hero.selected);if(node.action==="route-ghana")navigate("ghana");else if(node.type==="Country chapter")navigate("country",{selectedId:node.recordId});else if(node.action==="route-education")navigate("education");else if(node.action==="route-sports")navigate("sports");else if(node.action==="route-partners")navigate("partners");else if(node.action==="route-impact")navigate("impact");else if(node.action==="route-peace")navigate("peace");else navigate("mission",{selectedId:node.recordId});return;}
  if(action==="clear-explore"){state.search="";state.exploreType="All records";updateRouteQuery();render();return;}
  if(action==="clear-missions"){state.search="";state.missionFilter="All";updateRouteQuery();render();return;}
  if(action==="clear-countries"){state.countrySearch="";state.countryFilter="All Countries";updateRouteQuery();render();return;}
  if(action==="route-home")return navigate("home"); if(action==="route-explore")return navigate("explore"); if(action==="route-missions")return navigate("missions"); if(action==="route-peace")return navigate("peace"); if(action==="route-countries")return navigate("countries"); if(action==="route-country"){const countryId=el.dataset.country||el.dataset.id;return countryId==="ghana"?navigate("ghana"):navigate("country",{selectedId:countryId||"liberia"});} if(action==="route-ghana")return navigate("ghana"); if(action==="route-education"||action==="education-catalog")return navigate("education"); if(action==="route-jobs")return navigate("jobs"); if(action==="route-events")return navigate("events"); if(action==="route-impact")return navigate("impact"); if(action==="route-sdgs")return navigate("sdgs"); if(action==="route-partners")return navigate("partners"); if(action==="route-shop")return navigate("shop"); if(action==="route-sports")return navigate("sports"); if(action==="route-unity-ball")return navigate("unity-ball"); if(action==="route-funding")return navigate("funding"); if(action==="route-schools")return navigate("schools"); if(action==="route-universities")return navigate("universities"); if(action==="route-login")return navigate("login"); if(action==="route-privacy")return navigate("privacy"); if(action==="route-terms")return navigate("terms"); if(action==="route-join")return navigate("join"); if(action==="route-learning")return navigate("profile"); if(action==="route-my-map")return navigate("my-map");
  if(action==="route-admin")return navigate("admin");
  if(action==="route-data-gaps")return navigate("data-gaps");
  if(action==="open-mission")return navigate("mission",{selectedId:el.dataset.id||"peace-ghana"}); if(action==="open-course")return navigate("course",{selectedId:el.dataset.id||state.selectedId||"peacebuilding"});
  if(action==="enter-classroom")return navigate("classroom",{selectedId:el.dataset.id||state.selectedId||"generated-course"});
  if(action==="classroom-role"){const courseId=state.selectedId||"generated-course",room=classroomForCourse(courseId),role=el.dataset.classroomRole||"student";state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:{...room,role}};persist();sendClassroomRealtime({type:'classroom:join',courseId,sessionId:classroomRuntime.data[courseId]?.session?.id||courseId,role});render();return;}
  if(action==="classroom-module"){const courseId=state.selectedId||"generated-course",room=classroomForCourse(courseId),nextRoom={...room,activeModule:Math.max(0,Math.min(99,Number(el.dataset.classroomModule)||0))};state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:nextRoom};persist();if(room.role==="instructor"){if(classroomRuntime.data[courseId]?.session)syncClassroomSession(courseId,nextRoom,room.live?'Live':'Ready');sendClassroomRealtime({type:'classroom:module',activeModule:nextRoom.activeModule});}render();return;}
  if(action==="classroom-join"){const courseId=state.selectedId||"generated-course",room=classroomForCourse(courseId),nextRoom={...room,joined:true,attendance:true};state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:nextRoom};state.learning.progress[courseId]=Math.max(Number(state.learning.progress[courseId]||0),8);persist();syncClassroomAttendance(courseId,nextRoom);showToast("Joined classroom","Attendance and progress are synchronized when you are signed in.");render();return;}
  if(action==="classroom-start"||action==="classroom-end"){const courseId=state.selectedId||"generated-course",room=classroomForCourse(courseId),starting=action==="classroom-start",nextRoom={...room,live:starting};state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:nextRoom};persist();const synced=await syncClassroomSession(courseId,nextRoom,starting?'Live':'Ended');sendClassroomRealtime({type:'classroom:session',live:starting});showToast(starting?"Session started":"Session ended",synced.ok?"The classroom session was saved to the course.":"The session remains available in local presentation mode.");render();return;}
  if(action==="classroom-toggle"){const courseId=state.selectedId||"generated-course",room=classroomForCourse(courseId),key=el.textContent.toLowerCase().includes("camera")?"camera":"mic";state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:{...room,[key]:!room[key]}};persist();render();return;}
  if(action==="classroom-hand"){const courseId=state.selectedId||"generated-course",room=classroomForCourse(courseId),raised=!room.handRaised;state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:{...room,handRaised:raised}};persist();sendClassroomRealtime({type:'classroom:hand',raised});render();return;}
  if(action==="classroom-attendance"){const courseId=state.selectedId||"generated-course",room=classroomForCourse(courseId),nextRoom={...room,attendance:true};state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:nextRoom};persist();const synced=await syncClassroomAttendance(courseId,nextRoom);showToast("Attendance marked",synced.ok?"The signed-in attendance record was updated.":"This local attendance state is not yet a verified institutional record.");render();return;}
  if(action==="classroom-complete-module"){const courseId=state.selectedId||"generated-course",room=classroomForCourse(courseId),course=courseForId(courseId),total=Math.max(1,classroomModules(course).length),nextProgress=Math.round(((room.activeModule+1)/total)*100);state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:{...room,attendance:true}};state.learning.progress[courseId]=Math.max(Number(state.learning.progress[courseId]||0),nextProgress);persist();showToast("Module marked complete","Progress is saved locally until learning sync is connected.");render();return;}
  if(action==="classroom-chat-send"){const courseId=state.selectedId||"generated-course",text=getField("classroom-chat-input");if(!text){showToast("Write a message first","Questions and reflections stay attached to this course room.");return;}const room=classroomForCourse(courseId),sync=await syncClassroomMessage(courseId,room,text);sendClassroomRealtime({type:'classroom:chat',content:text});if(!classroomRuntime.socket){room.chat=[...room.chat,{name:"You",role:room.role==="instructor"?"Instructor":"Student",text,at:new Date().toISOString()}].slice(-50);state.learning.classrooms={...(state.learning.classrooms||{}),[courseId]:room};persist();}if(!sync.ok&&!sync.local)showToast("Message saved locally","Classroom synchronization is temporarily unavailable.");render();return;}
  if(action==="open-record"){return navigate("mission",{selectedId:el.dataset.record||"digital-twin"});}
  if(action==="ball-sim-kick"){runBallSimulation(el.closest("[data-ball-sim]"));return;} if(action==="ball-sim-reset"){resetBallSimulation(el.closest("[data-ball-sim]"));return;}
  if(action==="generate-prospectus"){const next=prospectusValuesFromDom();if(!next.title){const feedback=document.querySelector("[data-prospectus-feedback]");if(feedback)feedback.textContent="Add a project or idea name before generating the page.";document.getElementById("prospectus-title")?.focus();return;}state.prospectus=next;state.modal={type:"prospectus",stage:"preview"};draftDirty=false;persist();render();return;}
  if(action==="prospectus-edit"){state.modal={type:"prospectus"};draftDirty=false;render();return;}
  if(action==="prospectus-reset"){state.prospectus={...defaultState.prospectus};state.modal={type:"prospectus"};draftDirty=false;render();return;}
  if(action==="print-prospectus"){printProspectus();return;}
  if(action==="show-record"){setModal("record");return;} if(action==="open-peace-form"){setModal("peace-form");return;} if(action==="open-evidence-form"){await loadMapWorkspace();setModal("evidence-form");return;} if(action==="open-partner-form"){setModal("partner-form");return;} if(action==="open-mission-wizard"){setModal("mission-wizard");return;} if(action==="open-ball-config"){setModal("ball-config");return;} if(action==="edit-passport"){setModal("join");return;} if(action==="watch"){setModal("watch",{videoKey:WATCH_VIDEOS[0].key});return;} if(action==="watch-video"){setModal("watch",{videoKey:el.dataset.videoKey||WATCH_VIDEOS[0].key});return;} if(action==="video-fullscreen"){toggleWatchVideoFullscreen();return;} if(action==="resources"){showToast("Toolkit requested","The organizer resources are drafted and awaiting approval.");return;}
  if(action==="mission-map"||action==="mission-open-map"){state.map.recordType="Mission site";state.map.layer.chapters=false;openMapGateway();return;}
  if(action==="mission-grid"||action==="mission-list"){state.missionView=action.split("-")[1];render();return;}
  if(action==="enroll-course"){const id=state.selectedId||"peacebuilding";if(!state.learning.enrolled.includes(id))state.learning.enrolled.push(id);state.learning.progress[id]=8;persist();let synced=false;try{const response=await fetch(`/api/courses/${encodeURIComponent(id)}/enrollments`,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({role:'Student'})});synced=response.ok;}catch(_){}showToast("Enrolled in draft pathway",synced?"Enrollment is synchronized to your account.":"Progress is saved locally until account learning sync is available.");navigate("profile");return;}
  if(action==="onboarding-select-mission"){state.onboarding={...state.onboarding,missionId:el.dataset.missionId||"peace-ghana"};persist();render();return;}
  if(action==="onboarding-back"){state.onboarding={...state.onboarding,step:Math.max(1,state.onboarding.step-1)};persist();render();return;}
  if(action==="onboarding-next"){if(state.onboarding.step===1&&!seed.missions.some(item=>item.id===state.onboarding.missionId)){setModalFeedback("Choose a mission before continuing.");return;}state.onboarding={...state.onboarding,step:Math.min(4,state.onboarding.step+1)};persist();render();return;}
  if(action==="onboarding-complete"){if(!state.onboarding.consent){const feedback=document.querySelector("[data-onboarding-feedback]");if(feedback)feedback.textContent="Confirm that you want to save this local draft.";return;}const mission=seed.missions.find(item=>item.id===state.onboarding.missionId)||seed.missions[0];state.passport={...state.passport,started:true,country:state.onboarding.country,completion:Math.max(state.passport.completion,54)};state.onboarding={...state.onboarding,completed:true,step:4};persist();state.modal=null;draftDirty=false;showToast("Mission draft saved on this device",`No team was notified. Next, ${mission.linkedCourse?"review the linked learning pathway":"explore the mission details"}.`);navigate("profile");return;}
  if(action==="join-mission"){const id=state.selectedId||"peace-ghana";state.onboarding={...state.onboarding,missionId:id,step:state.onboarding.completed?4:1};setModal("mission-onboarding",{missionId:id});return;}
  if(action==="save-join"){saveJoinProfile();return;}
  if(action==="save-wa-preferences"){const feedback=document.querySelector("[data-wa-preferences-feedback]");if(feedback)feedback.textContent="Saving securely…";saveWhatsAppProfileField("preferences").then(result=>{if(feedback)feedback.textContent=result.ok?"Saved. WhatsApp statuses remain separate until verified and connected.":result.error; if(result.ok)showToast("WhatsApp preferences saved","You can change or withdraw them at any time.");});return;}
  if(action==="wa-create-connection-code"){fetch("/api/whatsapp/connect/create-code",{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify({source:"communication_preferences"})}).then(async response=>{const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"A connection code could not be created.");const number=String(result.displayNumber||"").replace(/\D/g,"");if(number)window.open(`https://wa.me/${number}?text=${encodeURIComponent(result.startText||"")}`,"_blank","noopener,noreferrer");showToast("Connection code created","Open WhatsApp and send the prefilled code before it expires.");}).catch(error=>showToast("WhatsApp connection unavailable",error.message));return;}
  if(action==="wa-disconnect"){fetch("/api/whatsapp/disconnect",{method:"POST",headers:{accept:"application/json"}}).then(async response=>{const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Disconnect failed.");whatsappProfileRuntime.loaded=false;await loadWhatsAppProfile();showToast("WhatsApp disconnected","Your existing Be the Change account is unchanged.");}).catch(error=>showToast("Could not disconnect",error.message));return;}
  if(action==="wa-request-export"||action==="wa-request-deletion"){const route=action==="wa-request-export"?"request-export":"request-deletion";fetch(`/api/whatsapp/${route}`,{method:"POST",headers:{accept:"application/json"}}).then(async response=>{const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Request could not be recorded.");showToast(action==="wa-request-export"?"Export requested":"Deletion requested",result.message||"Your request was recorded for review.");}).catch(error=>showToast("Privacy request unavailable",error.message));return;}
  if(action==="extract-skills"){const bio=getField("passport-bio").toLowerCase();const suggestions=["facilitation","community research","storytelling","partnerships","event production","evidence collection"].filter(skill=>bio.includes(skill.split(" ")[0]));const input=document.getElementById("passport-skills");if(input)input.value=[...new Set([...suggestions,...(input.value||"").split(",").map(x=>x.trim()).filter(Boolean)])].join(", ");showToast("Suggestions ready","Review each skill before saving it to your passport.");return;}
  if(action==="save-passport"){savePassportProfile();return;}
  if(action==="generate-course"){if(aiRuntime.active){showToast("Generation already running","Cancel the current draft or wait for it to finish.");return;}const outcome=getField("course-outcome")||"Facilitate a safe, inclusive peace activity and submit consented evidence.";generateCourse(outcome,getField("course-source"),getField("course-context"));return;}
  if(action==="cancel-course-generation"){aiRuntime.requestId++;aiRuntime.active=false;const result=document.querySelector("#generation-result");if(result)result.innerHTML=`<div class="form-feedback" style="margin-top:18px">Generation cancelled. Your original course inputs remain unchanged.</div>`;return;}
  if(action==="open-course-studio"){navigate("studio");return;}
  if(action==="studio-select-block"){studioReadFromDom();studioRuntime.activeBlock=el.dataset.studioBlock||"overview";if(studioRuntime.activeBlock.startsWith("module-"))studioRuntime.activeModule=Number(studioRuntime.activeBlock.split("-")[1])||0;render();return;}
  if(action==="studio-add-module"){const draft=studioReadFromDom();if(draft.modules.length>=8){showToast("Module limit reached","Keep the course focused to eight modules or fewer.");return;}draft.modules.push(normaliseCourseModule({title:`Module ${String(draft.modules.length+1).padStart(2,"0")}`,objective:"",activity:"",check:"",resource:""},draft.modules.length));state.learning.generatedCourse=draft;studioRuntime.activeModule=draft.modules.length-1;studioRuntime.activeBlock=`module-${studioRuntime.activeModule}`;persist();render();return;}
  if(action==="studio-remove-module"){const draft=studioReadFromDom();if(draft.modules.length<=3){showToast("Keep three modules","A course needs at least three learning blocks.");return;}draft.modules.splice(studioRuntime.activeModule,1);studioRuntime.activeModule=Math.max(0,studioRuntime.activeModule-1);studioRuntime.activeBlock=`module-${studioRuntime.activeModule}`;state.learning.generatedCourse=draft;persist();render();return;}
  if(action==="studio-save-draft"){saveStudioDraft();return;}
  if(action==="studio-review-toggle"){studioReadFromDom();return;}
  if(action==="ai-suggest"){requestStudioSuggestion(el.dataset.suggestion||"Expand this block");return;}
  if(action==="studio-apply-suggestion"){applyStudioSuggestion();return;}
  if(action==="studio-dismiss-suggestion"){studioRuntime.pendingSuggestion=null;render();return;}
  if(action==="submit-course"){const draft=studioReadFromDom(),missing=studioValidation(draft);if(missing.length){studioRuntime.activeBlock=missing.some(item=>/module/i.test(item))?`module-${studioRuntime.activeModule}`:missing.some(item=>/assessment|evidence/i.test(item))?"assessment":"review";studioRuntime.feedback=`${missing.length} review item${missing.length===1?"":"s"} remaining`;render();showToast("Review items remain",missing.slice(0,4).join(" · "));return;}draft.review={...draft.review,status:"Requires Review"};draft.label="Requires Review";state.learning.generatedCourse=draft;persist();saveGeneratedCourse(draft).then(result=>{if(result.ok){state.learning.generatedCourse={...draft,...result.course,modules:draft.modules};persist();}studioRuntime.feedback="Queued for instructor review";render();});showToast("Draft queued for approval","The course is ready for instructor and Education Administrator review.");return;}
  if(action==="preview-course"){studioReadFromDom();setModal("course-preview",{courseId:state.learning.generatedCourse?.id});return;}
  if(action==="submit-peace"){if(!validateModal(action)||!guardDuplicateSubmission(el))return;showToast("Activity submitted for moderation","It will appear on the public map only after review.");closeModal(true);return;}
  if(action==="submit-evidence"||action==="impact-save-evidence"){await saveImpactEvidence(action==="submit-evidence"||el.dataset.impactSubmit==="true",el);return;}
  if(action==="impact-tab"){impactRuntime.tab=el.dataset.impactTab||"claims";render();return;}
  if(action==="impact-clear-filters"){impactRuntime.filters={search:"",country:"All countries",sdg:"All SDGs",type:"All types",status:"All statuses",from:"",to:""};render();return;}
  if(action==="impact-refresh"){impactRuntime.loaded=false;loadImpactData(true);return;}
  if(action==="impact-open-claim"){openImpactClaim(el.dataset.impactId);return;}
  if(action==="impact-edit-evidence"){const item=impactRuntime.mine.find(row=>row.id===el.dataset.impactId);if(item)setModal("evidence-form",{evidence:item});return;}
  if(action==="impact-discard-evidence"){el.disabled=true;try{const response=await fetch(`/api/evidence?id=${encodeURIComponent(el.dataset.impactId||"")}`,{method:"DELETE"}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Could not discard evidence");impactRuntime.loaded=false;loadImpactData(true);showToast("Draft discarded","It was removed from My Evidence.");}catch(error){el.disabled=false;showToast("Discard unavailable",error.message);}return;}
  if(action==="impact-export"){exportImpactClaims();return;}
  if(action==="impact-copy-link"){const link=`${location.origin}/#impact?claim=${encodeURIComponent(el.dataset.impactId||"")}`;try{await navigator.clipboard.writeText(link);showToast("Claim link copied","Share the public method and review history.");}catch(_){showToast("Copy unavailable",link);}return;}
  if(action==="impact-open-map"){state.map.country=el.dataset.impactCountry||"GLB";state.map.county="All counties";state.map.layer=Object.fromEntries(Object.keys(state.map.layer).map(key=>[key,key==="chapters"||key==="evidence"]));navigate("map");return;}
  if(action==="impact-admin-refresh"){impactRuntime.adminLoaded=false;loadImpactAdmin(true);return;}
  if(action==="impact-new-claim"){setModal("impact-claim-editor",{claim:{}});return;}
  if(action==="impact-edit-claim"){const claim=impactRuntime.adminClaims.find(item=>item.id===el.dataset.impactId);if(claim)setModal("impact-claim-editor",{claim});return;}
  if(action==="impact-discard-claim"){el.disabled=true;try{const response=await fetch(`/api/admin/impact/claims?id=${encodeURIComponent(el.dataset.impactId||"")}`,{method:"DELETE"}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Could not discard claim");impactRuntime.adminLoaded=false;loadImpactAdmin(true);showToast("Claim draft discarded","The unpublished draft was removed.");}catch(error){el.disabled=false;showToast("Discard unavailable",error.message);}return;}
  if(action==="impact-save-claim"){
    const current=state.modal?.claim||{},payload=impactClaimPayload(current);
    if(["Published","Corrected"].includes(current.status)&&!payload.reviewer_note){setModalFeedback("Explain the correction before saving it.");return;}
    el.disabled=true;try{const result=await writeImpactClaim(payload,current.id?"PATCH":"POST");draftDirty=false;state.modal=null;render();showToast(result.status==="Corrected"?"Correction saved":"Claim draft saved",`Claim ${result.id.slice(0,8)} is ${result.status.toLowerCase()}.`);}catch(error){el.disabled=false;setModalFeedback(error.message);}return;
  }
  if(action==="impact-review-evidence"){
    const row=el.closest(".impact-admin-row"),payload={id:el.dataset.impactId,status:el.dataset.impactStatus,public_note:row?.querySelector("[data-impact-public-note]")?.value?.trim()||"",reviewer_note:row?.querySelector("[data-impact-reviewer-note]")?.value?.trim()||""};
    el.disabled=true;try{const response=await fetch("/api/admin/evidence",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Review failed");impactRuntime.adminLoaded=false;loadImpactAdmin(true);showToast("Evidence reviewed",result.status);}catch(error){el.disabled=false;showToast("Review failed",error.message);}return;
  }
  if(action==="impact-change-claim-status"){
    const claim=impactRuntime.adminClaims.find(item=>item.id===el.dataset.impactId);if(!claim)return;
    const status=el.dataset.impactStatus,note=status==="Withdrawn"?window.prompt("Reason for withdrawal (visible in claim history):"):(claim.reviewer_note||"Published after source and method review");
    if(status==="Withdrawn"&&!note?.trim())return;
    el.disabled=true;try{const result=await writeImpactClaim({...claim,status,reviewer_note:note},"PATCH");render();showToast("Claim updated",result.status);}catch(error){el.disabled=false;showToast("Claim update failed",error.message);}return;
  }
  if(action==="submit-media"){submitMedia(el);return;}
  if(action==="jukebox-select"){jukeboxRuntime.activeId=el.dataset.jukeboxTrackId||"";render();return;}
  if(action==="jukebox-report"){reportJukeboxTrack(el);return;}
  if(action==="submit-partner"){if(!validateModal(action)||!guardDuplicateSubmission(el))return;showToast("Prospective partner record created","This is not an agreement or endorsement.");closeModal(true);return;}
  if(action==="save-mission"){if(!validateModal(action)||!guardDuplicateSubmission(el))return;showToast("Mission draft saved","Add a team, budget, evidence plan, and risks before review.");closeModal(true);return;}
  if(action==="save-ball"){if(!guardDuplicateSubmission(el))return;showToast("Design request saved","No purchase was completed. Production and checkout remain unconnected.");closeModal(true);return;}
  if(action==="admin-tab"){state.adminTab=el.dataset.adminTab||el.textContent.trim()||"Overview";render();return;}
  if(action==="map-review-refresh"){mapRuntime.adminLoaded=false;loadMapReview(true);return;}
  if(action==="map-review-proposal"||action==="map-review-checkin") {const proposal=action==="map-review-proposal",endpoint=proposal?"/api/admin/map-proposals":"/api/admin/check-ins",precision=el.closest(".map-review-actions")?.querySelector("[data-review-precision]")?.value;el.disabled=true;try{const response=await fetch(endpoint,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id:el.dataset.reviewId,status:el.dataset.reviewStatus,public_precision:precision})}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Review failed");mapRuntime.adminLoaded=false;mapRuntime.activityLoaded=false;mapRuntime.requestedCountries.clear();showToast("Review saved",`${proposal?"Place proposal":"Check-in"}: ${result.status||result.moderation_status}`);loadMapReview(true);}catch(error){el.disabled=false;showToast("Review failed",error.message);}return;}
  if(action==="admin-jobs-refresh"){jobRuntime.admin.loaded=false;loadJobsAdmin(true);return;}
  if(action==="admin-job-status"){
    el.disabled=true;
    try{const response=await fetch(`/api/admin/jobs/${encodeURIComponent(el.dataset.jobId)}`,{method:"PATCH",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify({status:el.dataset.jobStatus,verification:el.dataset.jobVerification||undefined})}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"The job status could not be updated.");jobRuntime.admin.loaded=false;jobRuntime.loaded=false;showToast("Job record updated",`${result.job.title} is ${result.job.moderation_status.toLowerCase()}.`);loadJobsAdmin(true);}
    catch(error){el.disabled=false;showToast("Update failed",error.message);}return;
  }
  if(action==="admin-job-add-source"){
    const payload={name:getField("job-source-name"),feed_url:getField("job-source-url"),feed_type:getField("job-source-type")};if(!payload.name||!payload.feed_url){showToast("Source details required","Add a source name and public HTTPS feed URL.");return;}
    el.disabled=true;try{const response=await fetch("/api/admin/jobs/sources",{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(payload)}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"The source could not be approved.");jobRuntime.admin.loaded=false;showToast("Backfill source approved","Run the first sync when you are ready.");loadJobsAdmin(true);}catch(error){el.disabled=false;showToast("Source not added",error.message);}return;
  }
  if(action==="admin-job-sync"){
    el.disabled=true;el.textContent="Syncing…";try{const response=await fetch(`/api/admin/jobs/sources/${encodeURIComponent(el.dataset.sourceId)}/sync`,{method:"POST",headers:{accept:"application/json"}}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"The source could not be synchronized.");jobRuntime.admin.loaded=false;showToast("Source synchronized",`${result.created||0} created · ${result.updated||0} updated · ${result.skipped||0} skipped`);loadJobsAdmin(true);}catch(error){el.disabled=false;el.textContent="Sync now";showToast("Sync failed",error.message);}return;
  }
  if(action==="admin-refresh"){adminRuntime.loaded=false;adminRuntime.loading=false;loadAdminWorkspace();return;}
  if(action==="admin-media-status"){updateAdminMedia(el);return;}
  if(action==="admin-jukebox-status"){updateAdminJukebox(el);return;}
  if(action==="admin-jukebox-save"){saveAdminJukebox(el);return;}
  if(action==="admin-jukebox-save-settings"){saveAdminJukeboxSettings(el);return;}
  if(action==="admin-export"){exportAdminRecords();return;}
  if(action==="admin-add"){state.modal=null;setModal("admin-entry",{tab:el.dataset.adminTab||state.adminTab});return;}
  if(action==="admin-save-entry"){saveAdminEntry(el);return;}
  if(action==="admin-row-action"){
    const id=el.dataset.adminRecordId, record=adminRuntime.records.find(item=>item.id===id);
    if(record){setModal("public-record",{recordId:id});}
    else showToast("Seed record","Use the tab entry form to add a connected admin record.");
    return;
  }
  if(action==="open-public-record"){setModal("public-record",{recordId:el.dataset.publicRecordId});return;}
});

async function generateCourse(outcome, source, context) {
  const result=document.querySelector("#generation-result"); if(!result)return;
  const requestId=++aiRuntime.requestId;aiRuntime.active=true;
  result.innerHTML=`<div class="assistant-tip" style="margin-top:20px;display:flex;justify-content:space-between;gap:12px;align-items:center"><span>Generating a reviewable outline…</span>${button("Cancel","cancel-course-generation","small")}</div>`;
  let outline=null;
  let usedFallback=false;
  try {
    if(window.websim?.chat?.completions?.create) {
      const completion=await window.websim.chat.completions.create({messages:[{role:"system",content:"You are a careful learning-experience designer for an independent SDG action network. Return JSON only with keys title, purpose, audience, level, duration, format, language, prerequisites, modules (array of objects with title, objective, activity, check, resource), assessment (method, questions array, rubric, passingScore), safetyNote, evidenceTask, accessibilityNotes, sourceNotes. Mark assumptions as proposals and never claim accreditation or endorsement."},{role:"user",content:`Create a concise, editable five-module course outline. Outcome: ${outcome}. Source: ${source}. Context: ${context}.`}],json:true});
      outline=normaliseCourseOutline(JSON.parse(completion.content),outcome);
      if(!outline)usedFallback=true;
    }
  } catch (err) { console.warn("AI generation unavailable; using local draft.",{name:err?.name||"provider_error"});usedFallback=true; }
  if(requestId!==aiRuntime.requestId){return;}
  if(!outline)outline=normaliseCourseOutline({title:"Peace in Action · Ghana",purpose:outcome,audience:"Community learners and mission participants",modules:["Local context, consent, and safeguarding","Dialogue and inclusive facilitation","Designing a practical peace activity","Collecting ethical evidence","Reflection, review, and next mission"],safetyNote:"Proposal: add local safeguarding contacts and review with a qualified steward.",evidenceTask:"Submit a consented activity record, attendance summary, reflection, and source links."},outcome);
  if(!window.websim?.chat?.completions?.create)usedFallback=true;
  state.learning.studioGenerated=true;
  const generatedId=`generated-course-${Date.now().toString(36)}`;
  state.learning.generatedCourse={...outline,id:generatedId,label:"Draft—Requires Review",sdgs:["SDG 16","SDG 17"],mission:"Generated course",access:"Private draft",countryContext:context||outline.countryContext||"",review:{sources:false,safeguarding:false,accessibility:false,cultural:false,instructor:false,status:"Draft"}};
  persist();
  const courseSync=await saveGeneratedCourse(state.learning.generatedCourse);
  if(courseSync.ok){state.learning.generatedCourse=courseSync.course;persist();}
  aiRuntime.active=false;
  result.innerHTML=`<div class="panel" style="margin-top:20px;padding:18px;border-color:rgba(185,165,255,.35)"><div style="display:flex;justify-content:space-between;gap:10px"><div><div class="eyebrow">${usedFallback?"Local fallback draft":"Reviewable proposal"} · ${esc(source)}</div><h3 style="font:600 21px 'Space Grotesk',sans-serif;margin:8px 0">${esc(outline.title)}</h3></div>${tag("Human approval required","violet")}</div>${usedFallback?`<div class="form-feedback" style="color:var(--gold)">AI generation was unavailable, so a safe local outline was created. Your inputs were preserved.</div>`:""}<div class="form-feedback" style="color:${courseSync.ok?'var(--green)':'var(--muted)'}">${courseSync.ok?'Course and classroom foundation saved to your account.':'Course and classroom foundation saved locally; sign in to synchronize it.'}</div><p class="prose">${esc(outline.purpose)}</p><div class="grid grid-2" style="margin-top:15px">${outline.modules.map((m,i)=>`<div class="editor-block"><div class="eyebrow">Module ${String(i+1).padStart(2,"0")}</div><h4>${esc(m.title)}</h4><p>${esc(m.objective||m.activity||"Proposed lesson, practical activity, reflection, and knowledge check.")}</p></div>`).join("")}</div><div class="assistant-tip"><strong>Safety note:</strong> ${esc(outline.safetyNote)}<br/><strong>Evidence task:</strong> ${esc(outline.evidenceTask)}</div><div style="margin-top:17px;display:flex;gap:8px;flex-wrap:wrap">${button("Open in course studio","open-course-studio","primary")}<button class="btn" data-action="enter-classroom" data-id="${esc(state.learning.generatedCourse.id)}">Open native classroom ${icon("arrow")}</button></div></div>`;
}

render();
if(firebaseConfigured){
  observeAccount((user,error)=>{
    const nextUid=user?.uid||null,previousUid=accountRuntime.uid;
    const previousView=state.view,previousSelectedId=state.selectedId;
    if(previousUid&&previousUid!==nextUid){try{localStorage.removeItem(stateStorageKey(previousUid));}catch(_){}}
    accountRuntime.uid=nextUid;accountRuntime.ready=true;accountRuntime.error=error?.message||"";
    if(previousUid!==nextUid){mapRuntime.workspaceLoaded=false;mapRuntime.savedItems=[];mapRuntime.localItems=[];mapRuntime.savedViews=[];mapRuntime.customLayers=[];mapRuntime.draftCheckIns=[];mapRuntime.myCheckIns=[];mapRuntime.proposals=[];}
    profileRuntime.loaded=false;profileRuntime.loading=false;
    whatsappProfileRuntime.loaded=false;whatsappProfileRuntime.loading=false;
    state=loadState(stateStorageKey(nextUid));
    state.view=user&&previousView==="login"?"profile":previousUid&&!user?"login":previousView;
    if(["course","mission","country","classroom","job"].includes(state.view))state.selectedId=previousSelectedId;
    if(state.view!==previousView)history.replaceState({view:state.view},"",location.pathname+`#${state.view}`);
    render();
  }).catch(error=>{accountRuntime.ready=true;accountRuntime.error=error?.message||"Firebase could not start.";render();});
}
