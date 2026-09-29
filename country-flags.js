const COUNTRY_FLAG_ROWS = `
Algeria|DZ|DZA|+213
Angola|AO|AGO|+244
Benin|BJ|BEN|+229
Botswana|BW|BWA|+267
Burkina Faso|BF|BFA|+226
Burundi|BI|BDI|+257
Cabo Verde|CV|CPV|+238
Cameroon|CM|CMR|+237
Central African Republic|CF|CAF|+236
Chad|TD|TCD|+235
Comoros|KM|COM|+269
Congo (Republic of the Congo)|CG|COG|+242
Côte d'Ivoire|CI|CIV|+225
Democratic Republic of the Congo|CD|COD|+243
Djibouti|DJ|DJI|+253
Egypt|EG|EGY|+20
Equatorial Guinea|GQ|GNQ|+240
Eritrea|ER|ERI|+291
Eswatini|SZ|SWZ|+268
Ethiopia|ET|ETH|+251
Gabon|GA|GAB|+241
Gambia|GM|GMB|+220
Ghana|GH|GHA|+233
Guinea|GN|GIN|+224
Guinea-Bissau|GW|GNB|+245
Kenya|KE|KEN|+254
Lesotho|LS|LSO|+266
Liberia|LR|LBR|+231
Libya|LY|LBY|+218
Madagascar|MG|MDG|+261
Malawi|MW|MWI|+265
Mali|ML|MLI|+223
Mauritania|MR|MRT|+222
Mauritius|MU|MUS|+230
Morocco|MA|MAR|+212
Mozambique|MZ|MOZ|+258
Namibia|NA|NAM|+264
Niger|NE|NER|+227
Nigeria|NG|NGA|+234
Rwanda|RW|RWA|+250
Sao Tome and Principe|ST|STP|+239
Senegal|SN|SEN|+221
Seychelles|SC|SYC|+248
Sierra Leone|SL|SLE|+232
Somalia|SO|SOM|+252
South Africa|ZA|ZAF|+27
South Sudan|SS|SSD|+211
Sudan|SD|SDN|+249
Tanzania|TZ|TZA|+255
Togo|TG|TGO|+228
Tunisia|TN|TUN|+216
Uganda|UG|UGA|+256
Zambia|ZM|ZMB|+260
Zimbabwe|ZW|ZWE|+263
Afghanistan|AF|AFG|+93
Armenia|AM|ARM|+374
Azerbaijan|AZ|AZE|+994
Bahrain|BH|BHR|+973
Bangladesh|BD|BGD|+880
Bhutan|BT|BTN|+975
Brunei|BN|BRN|+673
Cambodia|KH|KHM|+855
China|CN|CHN|+86
Cyprus|CY|CYP|+357
Georgia|GE|GEO|+995
India|IN|IND|+91
Indonesia|ID|IDN|+62
Iran|IR|IRN|+98
Iraq|IQ|IRQ|+964
Israel|IL|ISR|+972
Japan|JP|JPN|+81
Jordan|JO|JOR|+962
Kazakhstan|KZ|KAZ|+7
Kuwait|KW|KWT|+965
Kyrgyzstan|KG|KGZ|+996
Laos|LA|LAO|+856
Lebanon|LB|LBN|+961
Malaysia|MY|MYS|+60
Maldives|MV|MDV|+960
Mongolia|MN|MNG|+976
Myanmar|MM|MMR|+95
Nepal|NP|NPL|+977
North Korea|KP|PRK|+850
Oman|OM|OMN|+968
Pakistan|PK|PAK|+92
Palestine|PS|PSE|+970
Philippines|PH|PHL|+63
Qatar|QA|QAT|+974
Saudi Arabia|SA|SAU|+966
Singapore|SG|SGP|+65
South Korea|KR|KOR|+82
Sri Lanka|LK|LKA|+94
Syria|SY|SYR|+963
Tajikistan|TJ|TJK|+992
Thailand|TH|THA|+66
Timor-Leste|TL|TLS|+670
Turkey|TR|TUR|+90
Turkmenistan|TM|TKM|+993
United Arab Emirates|AE|ARE|+971
Uzbekistan|UZ|UZB|+998
Vietnam|VN|VNM|+84
Yemen|YE|YEM|+967
Albania|AL|ALB|+355
Andorra|AD|AND|+376
Austria|AT|AUT|+43
Belarus|BY|BLR|+375
Belgium|BE|BEL|+32
Bosnia and Herzegovina|BA|BIH|+387
Bulgaria|BG|BGR|+359
Croatia|HR|HRV|+385
Czechia|CZ|CZE|+420
Denmark|DK|DNK|+45
Estonia|EE|EST|+372
Finland|FI|FIN|+358
France|FR|FRA|+33
Germany|DE|DEU|+49
Greece|GR|GRC|+30
Holy See (Vatican City)|VA|VAT|+39
Hungary|HU|HUN|+36
Iceland|IS|ISL|+354
Ireland|IE|IRL|+353
Italy|IT|ITA|+39
Latvia|LV|LVA|+371
Liechtenstein|LI|LIE|+423
Lithuania|LT|LTU|+370
Luxembourg|LU|LUX|+352
Malta|MT|MLT|+356
Moldova|MD|MDA|+373
Monaco|MC|MCO|+377
Montenegro|ME|MNE|+382
Netherlands|NL|NLD|+31
North Macedonia|MK|MKD|+389
Norway|NO|NOR|+47
Poland|PL|POL|+48
Portugal|PT|PRT|+351
Romania|RO|ROU|+40
Russia|RU|RUS|+7
San Marino|SM|SMR|+378
Serbia|RS|SRB|+381
Slovakia|SK|SVK|+421
Slovenia|SI|SVN|+386
Spain|ES|ESP|+34
Sweden|SE|SWE|+46
Switzerland|CH|CHE|+41
Ukraine|UA|UKR|+380
United Kingdom|GB|GBR|+44
Antigua and Barbuda|AG|ATG|+1
Bahamas|BS|BHS|+1
Barbados|BB|BRB|+1
Belize|BZ|BLZ|+501
Canada|CA|CAN|+1
Costa Rica|CR|CRI|+506
Cuba|CU|CUB|+53
Dominica|DM|DMA|+1
Dominican Republic|DO|DOM|+1
El Salvador|SV|SLV|+503
Grenada|GD|GRD|+1
Guatemala|GT|GTM|+502
Haiti|HT|HTI|+509
Honduras|HN|HND|+504
Jamaica|JM|JAM|+1
Mexico|MX|MEX|+52
Nicaragua|NI|NIC|+505
Panama|PA|PAN|+507
Saint Kitts and Nevis|KN|KNA|+1
Saint Lucia|LC|LCA|+1
Saint Vincent and the Grenadines|VC|VCT|+1
Trinidad and Tobago|TT|TTO|+1
United States|US|USA|+1
Australia|AU|AUS|+61
Fiji|FJ|FJI|+679
Kiribati|KI|KIR|+686
Marshall Islands|MH|MHL|+692
Micronesia (Federated States of)|FM|FSM|+691
Nauru|NR|NRU|+674
New Zealand|NZ|NZL|+64
Palau|PW|PLW|+680
Papua New Guinea|PG|PNG|+675
Samoa|WS|WSM|+685
Solomon Islands|SB|SLB|+677
Tonga|TO|TON|+676
Tuvalu|TV|TUV|+688
Vanuatu|VU|VUT|+678
Argentina|AR|ARG|+54
Bolivia|BO|BOL|+591
Brazil|BR|BRA|+55
Chile|CL|CHL|+56
Colombia|CO|COL|+57
Ecuador|EC|ECU|+593
Guyana|GY|GUY|+592
Paraguay|PY|PRY|+595
Peru|PE|PER|+51
Suriname|SR|SUR|+597
Uruguay|UY|URY|+598
Venezuela|VE|VEN|+58
`.trim();

const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const countryRows = COUNTRY_FLAG_ROWS.split("\n").map(row => row.split("|"));
const countryCodes = new Map(countryRows.flatMap(([name, iso2, iso3]) => {
  return [[normalize(name), iso2], [normalize(iso3), iso2]];
}));
const countryNamesByIso3 = new Map(countryRows.map(([name, , iso3]) => [normalize(iso3), name]));
const aliases = new Map([
  ["ivorycoast", "CI"],
  ["vaticancity", "VA"],
  ["holysee", "VA"],
  ["usa", "US"],
  ["unitedstatesofamerica", "US"],
  ["global", "🌐"],
  ["all", "🌐"],
  ["allcountries", "🌐"],
]);

export function countryFlag(name = "", iso2 = "") {
  const normalized = normalize(name);
  const code = /^[a-z]{2}$/i.test(iso2) ? iso2.toUpperCase() : aliases.get(normalized) || countryCodes.get(normalized);
  if (code === "🌐") return code;
  if (!code) return "";
  return [...code].map(letter => String.fromCodePoint(127397 + letter.charCodeAt(0))).join("");
}

export const COUNTRY_METADATA = countryRows.map(([name, iso2, iso3, callingCode]) => ({
  name,
  iso2,
  iso3,
  callingCode,
  flag: countryFlag(name, iso2),
}));

export function countryNameFromIso3(iso3 = "") {
  return countryNamesByIso3.get(normalize(iso3)) || "";
}
