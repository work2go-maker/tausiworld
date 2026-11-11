"use strict";
/* =====================================================================
   EINSTELLUNGEN – hier kann man später alles anpassen
   ===================================================================== */
const CONFIG = {
  NAME: "Tausi",                         // Arbeitsname des Wesens (Chef entscheidet den endgültigen Namen)
  MODUS: "probe",                        // "probe" | "stripe_test" | "live"   (live NUR nach Freigabe Chef + Anwalt)
  SPEICHER: "browser",                   // "browser" | "supabase"
  SUPABASE_URL: "",                      // später eintragen (öffentliche Adresse des Supabase-Projekts)
  SUPABASE_KEY: "",                      // später: öffentlicher "anon"-Schlüssel. NIE den geheimen Schlüssel!
  STRIPE_CHECKOUT_FUNKTION: "/functions/v1/tausi-checkout", // Server-Funktion; der Stripe-Schlüssel liegt NUR dort
  ADRESSE: "",                           // spätere Internet-Adresse; leer = aktuelle Adresse
  WELTBEVOELKERUNG: 8200000000,
  PAKETE: [
    { id: "p1",  preisCent: 100,  pixel: 1000 },
    { id: "p5",  preisCent: 500,  pixel: 5000, beliebt: true },
    { id: "p10", preisCent: 1000, pixel: 10500, bonus: true },
  ],
  MAX_KAEUFE_PRO_STUNDE: 5,
  MAX_CENT_PRO_TAG: 2000,
  MAX_GRUSS: 60,
  BILD_W: 48, BILD_H: 36,                // Größe eines Weltgemäldes (1.728 Pixel pro Bild)
  ZUSTIMMUNG_VERSION: "2026-11-11",
};

/* ===================== Sprache ===================== */
const LI = {}; SPRACHEN.forEach(([k], i) => LI[k] = i);
let LANG = "de";
function t(key, vars) {
  const row = T[key]; let s = row ? row[LI[LANG]] : key;
  if (s === undefined || (s === "" && key !== "legal_lang")) s = row[1] || row[0];
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  return s;
}
// Später: echte KI-Sätze vom Server (zwischengespeichert, höchstens 1× pro Stunde). Jetzt: vorbereitete Sätze.
async function wesenSpricht(art, daten = {}) { const l = SAETZE[LANG] || SAETZE.en; return rnd(l[art] || l.ruhig).replace(/\{(\w+)\}/g, (_, k) => daten[k] ?? ""); }

/* ===================== Länder (Code, Name, Breite, Länge, Einwohner in Mio.) ===================== */
const LAENDER = [
["DE","Deutschland",51,10,84],["AT","Österreich",47.5,14.5,9.1],["CH","Schweiz",46.8,8.2,8.9],["FR","Frankreich",46.6,2.4,68],["IT","Italien",42.8,12.5,59],["ES","Spanien",40.2,-3.6,48],["PT","Portugal",39.6,-8,10.4],["NL","Niederlande",52.2,5.5,18],["BE","Belgien",50.6,4.6,11.8],["LU","Luxemburg",49.8,6.1,0.67],["GB","Vereinigtes Königreich",54,-2.5,68],["IE","Irland",53.2,-8,5.3],["DK","Dänemark",56,10,6],["NO","Norwegen",61,9,5.5],["SE","Schweden",62,16,10.5],["FI","Finnland",63,26,5.6],["IS","Island",65,-18.5,0.39],["PL","Polen",52,19.4,37],["CZ","Tschechien",49.8,15.5,10.9],["SK","Slowakei",48.7,19.5,5.4],["HU","Ungarn",47.2,19.4,9.6],["SI","Slowenien",46.1,14.8,2.1],["HR","Kroatien",45.3,16,3.9],["BA","Bosnien und Herzegowina",44,17.8,3.2],["RS","Serbien",44,20.8,6.6],["ME","Montenegro",42.8,19.3,0.62],["XK","Kosovo",42.6,20.9,1.6],["AL","Albanien",41.1,20,2.7],["MK","Nordmazedonien",41.6,21.7,1.8],["GR","Griechenland",39.3,22,10.3],["BG","Bulgarien",42.7,25.3,6.4],["RO","Rumänien",45.9,25,19],["MD","Moldau",47.2,28.5,2.5],["UA","Ukraine",49,31.5,37],["BY","Belarus",53.7,28,9.2],["LT","Litauen",55.3,23.9,2.9],["LV","Lettland",56.9,24.6,1.9],["EE","Estland",58.7,25.5,1.4],["TR","Türkei",39,35,86],["RU","Russland",61,95,144],["GE","Georgien",42.2,43.5,3.7],["AM","Armenien",40.2,45,3],["AZ","Aserbaidschan",40.3,47.7,10.2],["KZ","Kasachstan",48,67,20],["UZ","Usbekistan",41.5,64,36],["IR","Iran",32.5,54,89],["IQ","Irak",33,43.7,45],["SY","Syrien",35,38.5,23],["LB","Libanon",33.9,35.9,5.4],["IL","Israel",31.4,35,9.8],["JO","Jordanien",31.2,36.5,11.3],["SA","Saudi-Arabien",24,45,33],["AE","Vereinigte Arab. Emirate",24,54,10],["QA","Katar",25.3,51.2,2.7],["YE","Jemen",15.6,48,34],["AF","Afghanistan",34,66,42],["PK","Pakistan",30,70,240],["IN","Indien",22,79,1430],["BD","Bangladesch",23.7,90.3,173],["LK","Sri Lanka",7.8,80.7,22],["NP","Nepal",28.3,84,31],["CN","China",35,104,1410],["MN","Mongolei",46.8,103,3.4],["KR","Südkorea",36.4,127.9,51.7],["JP","Japan",36.5,138.5,124],["TW","Taiwan",23.7,121,23.4],["PH","Philippinen",12.5,122,117],["VN","Vietnam",16,107.8,100],["TH","Thailand",15.5,101,72],["MM","Myanmar",21,96,54],["MY","Malaysia",3.8,102,34],["SG","Singapur",1.35,103.8,5.9],["ID","Indonesien",-2.5,118,278],["AU","Australien",-25,134,27],["NZ","Neuseeland",-41.5,172.5,5.2],["PG","Papua-Neuguinea",-6.5,145,10],["EG","Ägypten",26.6,30,113],["LY","Libyen",27,17,7],["TN","Tunesien",34,9.5,12.4],["DZ","Algerien",28,3,46],["MA","Marokko",31.8,-6.5,37.8],["SN","Senegal",14.5,-14.5,18],["GH","Ghana",7.9,-1.1,34],["NG","Nigeria",9.1,8.7,224],["CM","Kamerun",5.7,12.5,28.6],["CD","DR Kongo",-2.9,23.6,102],["ET","Äthiopien",8.6,39.6,127],["KE","Kenia",0.2,37.9,55],["TZ","Tansania",-6.3,34.9,67],["UG","Uganda",1.4,32.3,48.6],["SD","Sudan",15.5,30,48],["AO","Angola",-12.3,17.5,36.7],["ZA","Südafrika",-29,25,60],["MG","Madagaskar",-19.4,46.7,30],["MZ","Mosambik",-18,35.5,33.9],["ZW","Simbabwe",-19,29.8,16.7],["CI","Elfenbeinküste",7.6,-5.5,28.9],["ML","Mali",17.5,-4,23],["US","USA",39.5,-98.5,335],["CA","Kanada",57,-102,40],["MX","Mexiko",23.6,-102.5,129],["GT","Guatemala",15.7,-90.3,18],["CU","Kuba",21.6,-79,11],["DO","Dominikanische Rep.",18.8,-70.5,11.3],["CR","Costa Rica",9.9,-84,5.2],["PA","Panama",8.5,-80.1,4.5],["CO","Kolumbien",4,-73,52],["VE","Venezuela",7,-66,28.3],["EC","Ecuador",-1.5,-78.4,18],["PE","Peru",-9.5,-75,34],["BO","Bolivien",-16.7,-64.7,12.4],["BR","Brasilien",-10.5,-52,216],["PY","Paraguay",-23.3,-58.4,6.9],["UY","Uruguay",-32.8,-56,3.4],["AR","Argentinien",-35,-65,46],["CL","Chile",-33,-71,19.6],["GL","Grönland",72,-41,0.056]
];
const LAND = {}; LAENDER.forEach(l => LAND[l[0]] = { code: l[0], name: l[1], lat: l[2], lon: l[3], mio: l[4] });
let regionNamen = null;
function landName(code) {
  try { if (!regionNamen || regionNamen.lang !== LANG) regionNamen = { lang: LANG, dn: new Intl.DisplayNames([LANG], { type: "region" }) }; const n = regionNamen.dn.of(code); if (n && n !== code) return n; } catch (e) {}
  return LAND[code] ? LAND[code].name : code;
}
// Währung nur zur Anzeige ("ungefähr"); bezahlt wird immer in Euro.
const WAEHRUNG = { US:"USD",CA:"CAD",MX:"MXN",BR:"BRL",AR:"ARS",CL:"CLP",CO:"COP",PE:"PEN",GB:"GBP",CH:"CHF",NO:"NOK",SE:"SEK",DK:"DKK",IS:"ISK",PL:"PLN",CZ:"CZK",HU:"HUF",RO:"RON",BG:"BGN",RS:"RSD",BA:"BAM",AL:"ALL",MK:"MKD",TR:"TRY",UA:"UAH",IN:"INR",PK:"PKR",BD:"BDT",CN:"CNY",JP:"JPY",KR:"KRW",TW:"TWD",ID:"IDR",PH:"PHP",VN:"VND",TH:"THB",MY:"MYR",SG:"SGD",AU:"AUD",NZ:"NZD",ZA:"ZAR",NG:"NGN",KE:"KES",EG:"EGP",MA:"MAD",SA:"SAR",AE:"AED",IL:"ILS",GH:"GHS",ET:"ETB",TZ:"TZS",UG:"UGX",LK:"LKR",NP:"NPR",QA:"QAR",JO:"JOD",GE:"GEL",KZ:"KZT" };
const KURS = { USD:1.08,CAD:1.5,MXN:20,BRL:6,ARS:1200,CLP:1000,COP:4500,PEN:4,GBP:.85,CHF:.95,NOK:11.7,SEK:11.3,DKK:7.46,ISK:150,PLN:4.3,CZK:25,HUF:400,RON:5,BGN:1.96,RSD:117,BAM:1.96,ALL:100,MKD:61.5,TRY:40,UAH:45,INR:92,PKR:300,BDT:130,CNY:7.8,JPY:165,KRW:1500,TWD:35,IDR:17500,PHP:62,VND:27500,THB:37,MYR:4.8,SGD:1.45,AUD:1.65,NZD:1.8,ZAR:19.5,NGN:1700,KES:140,EGP:53,MAD:10.8,SAR:4.05,AED:3.97,ILS:4,GHS:16,ETB:150,TZS:2900,UGX:4000,LKR:330,NPR:147,QAR:3.93,JOD:.77,GEL:2.9,KZT:540 };
function locale() { return LANG === "ar" ? "ar-u-nu-latn" : LANG === "hi" ? "hi-IN" : LANG; }
function fxText(land) {
  const cur = WAEHRUNG[land]; if (!cur || !KURS[cur]) return "";
  try { return new Intl.NumberFormat(locale(), { style: "currency", currency: cur, maximumSignificantDigits: 2 }).format(0.001 * KURS[cur]); } catch (e) { return ""; }
}

/* Grobe Umrisse der Erdteile (Länge, Breite) – nur für das Punktmuster der Weltkarte */
const KONTINENTE = [
 [[-168,66],[-162,70],[-140,70],[-125,72],[-95,72],[-80,73],[-62,66],[-55,52],[-66,45],[-70,41],[-76,35],[-81,31],[-80,25],[-82,27],[-85,30],[-90,29],[-97,27],[-97,22],[-92,18],[-87,21],[-88,16],[-83,10],[-79,8],[-78,7],[-82,8],[-86,12],[-92,14],[-105,20],[-110,24],[-112,30],[-117,32],[-124,40],[-124,48],[-133,56],[-150,60],[-158,57],[-165,60]],
 [[-55,60],[-43,60],[-20,70],[-18,80],[-40,83],[-65,80],[-58,75],[-52,68]],
 [[-80,8],[-72,12],[-62,10],[-50,0],[-35,-5],[-39,-15],[-48,-26],[-58,-35],[-65,-42],[-68,-52],[-72,-50],[-74,-40],[-71,-20],[-76,-14],[-81,-5],[-79,2]],
 [[-10,36],[-9,43],[-2,44],[-4,48],[2,51],[8,54],[8,57],[5,62],[14,68],[25,71],[40,68],[60,70],[60,45],[50,45],[40,42],[29,41],[26,40],[23,36],[20,40],[16,38],[13,44],[8,44],[3,43],[-1,37]],
 [[26,40],[36,36],[35,32],[34,28],[39,22],[43,13],[52,16],[59,22],[56,26],[51,24],[48,30],[57,25],[67,25],[72,20],[77,8],[80,15],[88,22],[92,20],[98,15],[98,8],[100,3],[104,1],[100,13],[104,9],[108,12],[110,20],[122,25],[122,31],[126,34],[129,35],[127,38],[132,43],[141,46],[135,54],[142,59],[160,60],[178,62],[180,68],[140,72],[105,78],[80,73],[60,70],[60,45],[50,45],[40,42],[29,41]],
 [[-17,21],[-17,15],[-12,8],[-8,4],[0,5],[9,4],[9,-1],[12,-6],[13,-12],[12,-17],[15,-27],[18,-34],[25,-34],[33,-27],[35,-20],[40,-15],[40,-5],[44,0],[51,11],[43,12],[38,18],[33,28],[30,31],[20,32],[11,33],[10,37],[-1,36],[-6,36],[-10,30],[-13,27]],
 [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
 [[114,-22],[114,-34],[118,-35],[129,-32],[135,-35],[140,-38],[147,-38],[150,-37],[153,-28],[153,-25],[146,-19],[142,-11],[136,-12],[130,-12],[123,-16]],
 [[-5,50],[1,51],[2,53],[-2,57],[-5,58],[-6,56],[-3,54],[-5,52]], [[-10,52],[-6,52],[-6,55],[-9,55]],
 [[130,31],[135,34],[140,35],[142,40],[141,45],[139,42],[136,37],[131,34]],
 [[109,2],[117,7],[119,1],[116,-4],[110,-3]], [[95,5],[106,-6],[102,-4],[98,1]], [[105,-6],[115,-8],[106,-8]], [[131,-1],[141,-3],[150,-10],[141,-9],[137,-5]],
 [[172,-34],[178,-38],[174,-41],[167,-46],[170,-45],[174,-39]], [[-24,64],[-14,64],[-15,66],[-22,66]], [[120,18],[122,18],[126,7],[122,7]], [[-85,22],[-74,20],[-77,21]]
];
function imPoly(x, y, poly) { let drin = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) drin = !drin; } return drin; }
let LANDPUNKTE = null;
function landPunkte() { if (LANDPUNKTE) return LANDPUNKTE; LANDPUNKTE = []; for (let lat = 80; lat >= -56; lat -= 3.4) for (let lon = -178; lon <= 180; lon += 3.4) if (KONTINENTE.some(p => imPoly(lon, lat, p))) LANDPUNKTE.push([lon, lat]); return LANDPUNKTE; }

/* ===================== Hilfen ===================== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmt = n => new Intl.NumberFormat(locale()).format(n);
const euro = cent => new Intl.NumberFormat(locale(), { style: "currency", currency: "EUR" }).format(cent / 100);
const milliEuro = m => new Intl.NumberFormat(locale(), { style: "currency", currency: "EUR", minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(m / 1000);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = a => a[Math.floor(Math.random() * a.length)];
const uid = p => p + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const heute = () => { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
function zeitText(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return t("just_now");
  if (d < 3600) return t("min_ago", { n: Math.floor(d / 60) });
  if (d < 86400) return t("h_ago", { n: Math.floor(d / 3600) });
  return new Date(ts).toLocaleDateString(locale(), { day: "numeric", month: "short" });
}
function prozentText(p) {
  if (p === 0) return "0 %";
  const o = p >= 1 ? { maximumFractionDigits: 2 } : { maximumSignificantDigits: 2, maximumFractionDigits: 20 };
  return new Intl.NumberFormat(locale(), o).format(p) + " %";
}
let toastT;
function toast(msg, ms = 2600) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), ms); }
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgbHex(r, g, b) { return "#" + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join(""); }
function mix(a, b, f) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f); }
function shade(hex, amt) { return amt >= 0 ? mix(hex, "#ffffff", amt) : mix(hex, "#000000", -amt); }
function hash(x, y, s = 0) { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function rr(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); }

/* ===================== Wortfilter (Platzhalter – live zusätzlich auf dem Server) ===================== */
const SPERRWOERTER = ["arschloch","hurensohn","fotze","nazi","hitler","wichser","fuck","bitch","nigger","schlampe","missgeburt","cunt","puta","merde"];
function textPruefen(s) {
  const x = (s || "").trim();
  if (!x) return { ok: true, text: "" };
  if (/(https?:\/\/|www\.|\.(com|de|net|org|io)\b)/i.test(x)) return { ok: false, grund: t("no_links") };
  const n = x.toLowerCase().replace(/[^a-zäöüßáéíóúñç]/g, "");
  if (SPERRWOERTER.some(w => n.includes(w))) return { ok: false, grund: t("be_nice") };
  return { ok: true, text: x };
}

/* ===================== Speicher (jetzt Browser, später Supabase) ===================== */
const KEY = "tausi-v2";
const Speicher = {
  laden() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } },
  speichern(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} },
  loeschen() { try { localStorage.removeItem(KEY); } catch (e) {} },
  // Später (CONFIG.SPEICHER === "supabase"): rpc("tausi_pixel_setzen"), rpc("tausi_stand"), Live-Updates für neue Pixel.
};

/* ===================== Bezahlung (jetzt Probe, später Stripe) =====================
   Pixel werden live NUR über den Stripe-Webhook auf dem Server gutgeschrieben – nie über den Browser. */
const Zahlung = {
  async kaufen(paket) {
    if (CONFIG.MODUS === "probe") { await sleep(1200); return { ok: true, ref: "PROBE-" + uid("").toUpperCase(), probe: true }; }
    if (!CONFIG.SUPABASE_URL) throw new Error(t("error_pay"));
    const r = await fetch(CONFIG.SUPABASE_URL + CONFIG.STRIPE_CHECKOUT_FUNKTION, { method: "POST", headers: { "Content-Type": "application/json", apikey: CONFIG.SUPABASE_KEY }, body: JSON.stringify({ paket: paket.id, zustimmung: CONFIG.ZUSTIMMUNG_VERSION }) });
    const j = await r.json(); if (j.url) { location.href = j.url; return { ok: false }; }
    throw new Error(t("error_pay"));
  }
};

/* ===================== Zustand ===================== */
let S = Speicher.laden();
function neuerZustand() {
  const teile = (navigator.language || "de-DE").split("-"), sp = teile[0].toLowerCase();
  const STANDARD = { de: "DE", en: "US", es: "ES", fr: "FR", ar: "SA", hi: "IN", zh: "CN", pt: "BR", sw: "KE" };
  let land = (teile[1] || "").toUpperCase(); if (!LAND[land]) land = STANDARD[sp] || "DE";
  return {
    v: 2, ich: { id: uid("u_"), name: "", land, sprache: null }, vorrat: 0, kaeufe: [], verlauf: [], pixel: [], demo: true, gemeldet: [], nextNr: 1,
    spiel: { best: 0, sterne: 0, tag: "", aufgaben: {}, streicheln: 0 },
  };
}
const speichern = () => Speicher.speichern(S);
const sichtbarePixel = () => S.demo ? S.pixel : S.pixel.filter(p => !p.demo);

/* ===================== Das Weltgemälde =====================
   Jedes Bild hat ein gemaltes Motiv. Es ist zuerst nur blass zu sehen;
   jeder gesetzte Pixel bringt eine Stelle zum Leuchten. */
const BW = CONFIG.BILD_W, BH = CONFIG.BILD_H, CAP = BW * BH;
const PALETTEN = [
  { himmel: ["#3a2c8f", "#8a4fc8", "#ff6f91", "#ffb36b"], sonne: "#ffd93d", ring: "#ffb400", berg1: "#7b5cd6", berg2: "#2a9d8f", meer: ["#0096c7", "#48cae4"], wiese: ["#43aa8b", "#90be6d"], blumen: ["#ff3d9a", "#ffd93d", "#ff5a5f", "#ffffff"], borte: ["#e76f51", "#f4a261", "#264653", "#e9c46a"], sterne: true },
  { himmel: ["#0077b6", "#00a8e8", "#7fd8ff", "#d8f3ff"], sonne: "#fff3b0", ring: "#ffd93d", berg1: "#5aa9e6", berg2: "#3d5afe", meer: ["#0353a4", "#00b4d8"], wiese: ["#e9c46a", "#f4a261"], blumen: ["#ff5a5f", "#00b894", "#b14aed", "#ffffff"], borte: ["#00b894", "#ffb400", "#ff3d9a", "#3d5afe"], sterne: false },
  { himmel: ["#0b1033", "#1b1f5e", "#3d2a7a", "#6a3d9a"], sonne: "#f6f1d1", ring: "#cfc8ff", berg1: "#2e2a6b", berg2: "#1d3b5c", meer: ["#13315c", "#1f4e89"], wiese: ["#243b55", "#2f5d62"], blumen: ["#ffd93d", "#ffb400", "#7cf3ff", "#ff8fd8"], borte: ["#b14aed", "#ffd93d", "#00a8e8", "#ff3d9a"], sterne: true },
];
const motivCache = {};
function motiv(nr) {
  if (motivCache[nr]) return motivCache[nr];
  const P = PALETTEN[nr % PALETTEN.length], m = [], s = nr * 7 + 3, sx = 33 - ((nr * 11) % 9), sy = 12 + (nr % 3);
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
    let c;
    const hb = 19 - 5 * Math.abs(Math.sin(x * 0.13 + 1 + s)) - 2.5 * Math.sin(x * 0.31 + s);
    const hf = 22 - 3.5 * Math.abs(Math.sin(x * 0.21 + 2 + s * 0.5));
    const hl = 28 + 1.6 * Math.sin(x * 0.22 + s);
    const d = Math.hypot(x - sx, (y - sy) * 1.05);
    if (y >= BH - 2) c = P.borte[(Math.floor(x / 2) + (y === BH - 1 ? 1 : 0)) % 4];
    else if (y >= hl) { c = P.wiese[(x + y) % 5 === 0 ? 1 : 0]; if (hash(x, y, s) < 0.16) c = P.blumen[Math.floor(hash(y, x, s) * 4)]; else if (y > hl + 2 && hash(x, y, s + 1) < 0.25) c = P.wiese[1]; }
    else if (y >= hf) { const w = Math.sin(x * 0.7 + y * 1.3 + s); c = w > 0.35 ? P.meer[1] : P.meer[0]; if (y === Math.ceil(hf) && hash(x, y, s) < .4) c = "#ffffff"; }
    else if (y >= hb) c = y > hb + 2.5 ? P.berg2 : P.berg1;
    else if (d < 5.2) c = P.sonne;
    else if (d < 6.8) c = P.ring;
    else {
      const f = clamp(y / 19, 0, 1) * 3, i = Math.min(2, Math.floor(f)); c = mix(P.himmel[i], P.himmel[i + 1], f - i);
      if (P.sterne && y < 9 && hash(x, y, s + 5) < 0.06) c = "#fff7cf";
      const wolke = Math.sin(x * 0.25 + s) * 1.5 + 7; if (Math.abs(y - wolke) < 0.9 && x > 3 && x < 24 && hash(x, 3, s) > .2) c = mix(c, "#ffffff", .65);
    }
    m.push(shade(c, (hash(x, y, s + 9) - 0.5) * 0.12));
  }
  motivCache[nr] = m; return m;
}
const bildCv = $("#bild"), bctx = bildCv.getContext("2d");
let BCS = 10, platzieren = false, gewaehlt = null, wahlFarbe = null, farbModus = "motiv", bildPop = { i: -1, t: 0 };
function bildGroesse() { const r = bildCv.getBoundingClientRect(); if (!r.width) return; const d = Math.min(devicePixelRatio || 1, 2); bildCv.width = Math.round(r.width * d); bildCv.height = Math.round(r.width * BH / BW * d); bildCv.style.height = (r.width * BH / BW) + "px"; BCS = bildCv.width / BW; }
function bildZeichnen(now) {
  const c = C; if (!c.bild || !bildCv.width) return;
  const m = motiv(c.bildNr), W = bildCv.width, g = BCS * 0.07, puls = 0.5 + 0.5 * Math.sin(now / 160);
  bctx.fillStyle = "#fffaf2"; bctx.fillRect(0, 0, W, bildCv.height);
  for (let i = 0; i < CAP; i++) {
    const x = i % BW, y = (i / BW) | 0, p = c.bild[i], px = x * BCS, py = y * BCS;
    if (p) {
      let s = BCS - g, o = g / 2;
      if (bildPop.i === i && now - bildPop.t < 700) { const q = (now - bildPop.t) / 700, k = 1 + 1.4 * (1 - q) * Math.sin(q * Math.PI); o -= (s * k - s) / 2; s *= k; }
      bctx.fillStyle = p.c; bctx.fillRect(px + o, py + o, s, s);
      bctx.fillStyle = "rgba(255,255,255,.2)"; bctx.fillRect(px + o, py + o, s, s * 0.28);
    } else {
      bctx.globalAlpha = platzieren ? 0.4 : 0.5; bctx.fillStyle = m[i]; bctx.fillRect(px, py, BCS + .5, BCS + .5); bctx.globalAlpha = 1;
      if (platzieren) { bctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.4 * puls})`; bctx.lineWidth = Math.max(1, BCS * 0.06); bctx.strokeRect(px + g * 1.5, py + g * 1.5, BCS - 3 * g, BCS - 3 * g); }
    }
  }
  if (platzieren && gewaehlt !== null) {
    const x = gewaehlt % BW, y = (gewaehlt / BW) | 0;
    bctx.fillStyle = aktuelleFarbe(); bctx.fillRect(x * BCS, y * BCS, BCS, BCS);
    for (const [farbe, lw] of [["#1f1b2e", .18], ["#ffffff", .08]]) { bctx.strokeStyle = farbe; bctx.lineWidth = BCS * lw; bctx.strokeRect(x * BCS - BCS * .3, y * BCS - BCS * .3, BCS * 1.6, BCS * 1.6); }
  }
}
function blurZeichnen() { const b = $("#bildBlur"); if (!b || !bildCv.width) return; b.width = 96; b.height = 72; b.getContext("2d").drawImage(bildCv, 0, 0, 96, 72); }
bildCv.addEventListener("click", ev => {
  const r = bildCv.getBoundingClientRect(), x = Math.floor((ev.clientX - r.left) / r.width * BW), y = Math.floor((ev.clientY - r.top) / r.height * BH);
  if (x < 0 || y < 0 || x >= BW || y >= BH) return; const i = y * BW + x;
  if (platzieren) {
    let ziel = C.bild[i] ? null : i;
    if (ziel === null) { let best = 9e9; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= BW || yy >= BH) continue; const j = yy * BW + xx, dd = dx * dx + dy * dy; if (!C.bild[j] && dd < best) { best = dd; ziel = j; } } }
    if (ziel === null) return toast(t("taken"));
    gewaehlt = ziel; pixelFormular(); return;
  }
  if (C.bild[i]) pixelInfo(C.bild[i]); else pixelStart();
});

/* ===================== Tausi (besteht aus den Farben aller Pixel) ===================== */
const STUFEN = [
  { ab: 0 }, { ab: 25, rx: 7, ry: 6.5, cy: 2, sprout: true, feet: true }, { ab: 100, rx: 9, ry: 8, cy: 1, sprout: true, feet: true },
  { ab: 500, rx: 10.5, ry: 9.5, cy: 1, ears: 3, feet: true, arms: true }, { ab: 2500, rx: 12, ry: 11, cy: 1, ears: 4, feet: true, arms: true, tail: true },
  { ab: 10000, rx: 13.5, ry: 12.5, cy: 1, ears: 4, feet: true, arms: true, tail: true, crest: true }, { ab: 100000, rx: 15, ry: 13.5, cy: 1, ears: 4, feet: true, arms: true, tail: true, crest: true },
  { ab: 1000000, rx: 16.5, ry: 14.5, cy: 1, ears: 4, feet: true, arms: true, tail: true, crest: true, halo: true },
];
const HALF = 20, maskCache = {};
function stufeIndex(n) { let i = 0; STUFEN.forEach((s, k) => { if (n >= s.ab) i = k; }); return i; }
function form(si) {
  if (maskCache[si]) return maskCache[si];
  const st = STUFEN[si], cells = new Set(), add = (x, y) => { if (Math.abs(x) <= HALF && Math.abs(y) <= HALF) cells.add(x + "," + y); };
  let eyes = [], mouth = null, rx, ry, cy;
  if (si === 0) { rx = 6.2; ry = 8; cy = 1; for (let y = -HALF; y <= HALF; y++) for (let x = -HALF; x <= HALF; x++) { const yy = (y - cy) / ry, a = rx * (yy < 0 ? 1 + 0.22 * yy : 1); if ((x / a) ** 2 + yy ** 2 <= 1) add(x, y); } }
  else {
    ({ rx, ry, cy } = st); const p = 2.6;
    for (let y = -HALF; y <= HALF; y++) for (let x = -HALF; x <= HALF; x++) if (Math.abs(x / rx) ** p + Math.abs((y - cy) / ry) ** p <= 1) add(x, y);
    const top = Math.round(cy - ry), bot = Math.round(cy + ry);
    if (st.sprout) { add(0, top - 1); add(0, top - 2); add(1, top - 3); add(-1, top - 3); add(2, top - 3); }
    if (st.ears) for (const s of [-1, 1]) { const x0 = s * rx * 0.48, yb = Math.round(cy - ry * 0.86); for (let k = 0; k < st.ears + 1; k++) { const cx = x0 + s * k * 0.45, hw = 1.6 * (1 - k / (st.ears + 1)); for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) add(x, yb - k); } }
    if (st.feet) for (const s of [-1, 1]) { const fx = Math.round(s * rx * 0.45); for (let x = fx - 1; x <= fx + 1; x++) { add(x, bot); add(x, bot + 1); } }
    if (st.arms) for (const s of [-1, 1]) { const ax = Math.round(s * rx); add(ax + s, Math.round(cy) + 1); add(ax + s, Math.round(cy) + 2); add(ax + 2 * s, Math.round(cy) + 2); add(ax + 2 * s, Math.round(cy) + 3); }
    if (st.tail) { const tx = Math.round(rx), b = Math.round(cy + ry * 0.45); [[1, 1], [2, 0], [3, -1], [3, -2], [4, -3], [3, -4]].forEach(([a, c]) => add(tx + a - 1, b + c)); }
    if (st.crest) for (let x = -3; x <= 3; x++) { add(x, top - 1); if (x % 2 === 0) add(x, top - 2); if (x === 0) add(x, top - 3); }
    const ex = Math.round(rx * 0.38), ey = Math.round(cy - ry * 0.12), ew = si >= 2 ? 3 : 2, eh = si >= 4 ? 4 : 3;
    for (const s of [-1, 1]) eyes.push({ x: s * ex - Math.floor((ew - 1) / 2), y: ey - Math.floor(eh / 2), w: ew, h: eh });
    mouth = { x: 0, y: Math.round(cy + ry * 0.32) };
    eyes.forEach(e => { for (let x = e.x; x < e.x + e.w; x++) for (let y = e.y; y < e.y + e.h; y++) cells.delete(x + "," + y); });
    for (let x = -2; x <= 2; x++) for (let y = 0; y <= 1; y++) cells.delete(x + "," + (mouth.y + y));
  }
  // Reihenfolge: von unten nach oben – Tausi "wächst" aus den Pixeln
  const list = [...cells].map(k => k.split(",").map(Number)).sort((a, b) => (b[1] - a[1]) || (Math.abs(a[0]) - Math.abs(b[0])));
  const ext = Math.max(...list.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y)))) + (st.halo ? 3 : 0);
  const top = Math.min(...list.map(([, y]) => y));
  const res = { cells, list, eyes, mouth, rx, ry, cy, si, cap: list.length, ext, top };
  maskCache[si] = res; return res;
}

/* ===================== Berechnete Werte ===================== */
let C = {}, streichelBonus = 0;
function berechnen() {
  const px = sichtbarePixel();
  const n = px.length, si = stufeIndex(n), f = form(si);
  const proBild = {}; px.forEach(p => { (proBild[p.b] = proBild[p.b] || []).push(p); });
  let bildNr = 0; while (proBild[bildNr] && proBild[bildNr].length >= CAP) bildNr++;
  const bild = new Array(CAP).fill(null); (proBild[bildNr] || []).forEach(p => { if (!bild[p.i] || bild[p.i].t < p.t) bild[p.i] = p; });
  const frei = []; for (let i = 0; i < CAP; i++) if (!bild[i]) frei.push(i);
  // Zähler: Probe-Pixel zählen nicht für Rangliste und Rekord (Vorgabe Krümel)
  const zaehl = px.filter(p => !p.probe);
  const spender = new Set(zaehl.map(p => p.d)).size, laender = new Set(zaehl.filter(p => p.k).map(p => p.k)).size;
  const now = Date.now(), bedarf = 24 + si * 8; let satt = 0, froh = 0; const landHeute = new Set();
  px.forEach(p => { const h = (now - p.t) / 3600000; if (h < 48) { satt += Math.exp(-h / 6); froh += Math.exp(-h / 24); if (h < 24 && p.k) landHeute.add(p.k); } });
  const mein = px.filter(p => p.probe && now - p.t < 86400000).length;
  const sattP = clamp(Math.round(satt / bedarf * 100), 0, 100);
  const gespielt = S.spiel.tag === heute() && S.spiel.aufgaben[1] ? 8 : 0;
  const frohP = clamp(Math.round(10 + froh / (bedarf * 3) * 100 + landHeute.size + streichelBonus + Math.min(25, mein * 8) + gespielt), 0, 100);
  const stunde = new Date().getHours();
  let stimmung = "ruhig";
  if (si === 0) stimmung = "ei"; else if (sattP < 25) stimmung = "hungrig"; else if (stunde < 6 && sattP < 80) stimmung = "muede"; else if (frohP >= 60 && sattP >= 45) stimmung = "froh";
  C = { px, n, si, f, bildNr, bild, frei, bildAnzahl: CAP - frei.length, spender, laender, zaehl, sattP, frohP, stimmung, next: STUFEN[si + 1] };
  zoom(); return C;
}

/* ===================== Beispiel-Daten (nur für die Vorschau) ===================== */
function demoErzeugen() {
  const namen = ["Ana","Luca","Mia","Jonas","Arta","Leon","Sofia","Amir","Ella","Noah","Elif","Mateo","Hana","Ben","Zoe","Ilir","Lea","Kofi","Aiko","Lars","Nora","Omar","Priya","Tom","Yara","Wanjiru","Mei","Diego","Fatou","Ravi","","","",""];
  const gruesse = ["Wachse, kleiner Freund!","Grüße aus der Heimat ❤","Hello from Lagos!","Para mi abuela 🌸","Un pixel pour la paix.","Hallo Tausi!","Bunt ist besser.","Von unserer Klasse 4b","नमस्ते दुनिया","Salamu kutoka Nairobi!","来自上海的问候","Olá do Rio! ☀","مرحبا من الرياض","Mein erster Pixel!"];
  const gewicht = [["DE",40],["XK",14],["AT",10],["CH",8],["US",12],["BR",9],["IN",10],["NG",6],["TR",6],["FR",6],["IT",5],["ES",5],["NL",3],["AL",4],["JP",4],["GB",5],["PL",3],["MX",4],["KE",5],["IS",1],["LU",2],["CA",3],["AU",3],["ID",3],["EG",3],["AR",2],["SE",2],["ZA",3],["CN",6],["SA",2],["PH",2],["GH",2],["CO",2],["VN",2]];
  const pool = []; gewicht.forEach(([k, w]) => { for (let i = 0; i < w; i++) pool.push(k); });
  const anzahl = 560, m = motiv(0), jetzt = Date.now();
  // Bevorzugt Stellen in schönen Gruppen (Sonne, Wiese), damit das Bild schon gut aussieht
  const stellen = [...Array(CAP).keys()].map(i => ({ i, w: Math.random() + (Math.hypot(i % BW - 33, ((i / BW) | 0) - 12) < 7 ? 0.9 : 0) + (((i / BW) | 0) >= 28 ? 0.35 : 0) })).sort((a, b) => b.w - a.w).slice(0, anzahl);
  stellen.forEach((st, k) => {
    const ts = jetzt - (5 * 3600000 + Math.pow(Math.random(), 1.3) * 72 * 3600000);
    const farbe = Math.random() < 0.88 ? m[st.i] : rnd(["#ff5a5f","#ffb400","#00b894","#00a8e8","#b14aed","#ff3d9a","#3d5afe"]);
    S.pixel.push({ nr: 0, b: 0, i: st.i, c: farbe, n: rnd(namen), k: rnd(pool), m: k % 4 === 0 ? rnd(gruesse) : "", t: Math.round(ts), d: "demo_" + Math.floor(Math.random() * 330), demo: true });
  });
  S.pixel.sort((a, b) => a.t - b.t).forEach(p => p.nr = S.nextNr++);
}

/* ===================== Tausi zeichnen ===================== */
const cv = $("#wesen"), ctx = cv.getContext("2d");
let W = 0, CS = 0, DPR = 1, pop = { t: 0 }, partikel = [], blinzeln = 0, naechstesBlinzeln = 0, zeiger = { x: 0, y: 0 }, freuT = 0;
function groesse() { const r = cv.getBoundingClientRect(); if (!r.width) return; DPR = Math.min(devicePixelRatio || 1, 2); W = Math.round(r.width * DPR); cv.width = W; cv.height = W; zoom(); }
function zoom() { if (!W || !C.f) return; CS = W / (2 * (Math.max(C.f.ext, 10) + 1.5) + 1); }
function bob(tt) { return Math.sin(tt * 1.6) * CS * 0.35; }
function tausiZeichnen(now) {
  if (!W) return;
  const tt = now / 1000, c = C, f = c.f, st = STUFEN[c.si];
  ctx.clearRect(0, 0, W, W);
  const g0 = ctx.createRadialGradient(W / 2, W * 0.55, W * 0.05, W / 2, W * 0.55, W * 0.5);
  g0.addColorStop(0, `rgba(255,255,255,${freuT > now ? .9 : .7})`); g0.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g0; ctx.fillRect(0, 0, W, W);
  ctx.fillStyle = "rgba(60,40,20,.12)"; ctx.beginPath(); ctx.ellipse(W / 2, W / 2 + CS * ((f.cy || 1) + (f.ry || 8) + 2.4), CS * (f.rx || 6) * 0.9, CS * 1.1, 0, 0, Math.PI * 2); ctx.fill();
  if (st.halo) { ctx.strokeStyle = `hsla(${(tt * 40) % 360},90%,60%,.6)`; ctx.lineWidth = CS * 0.4; ctx.beginPath(); ctx.ellipse(W / 2, W / 2 + CS * (f.top - 2.5), CS * 6, CS * 1.4, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.save(); ctx.translate(W / 2, W / 2 + bob(tt));
  const atem = Math.sin(tt * 1.6) * 0.018; if (c.si === 0) ctx.rotate(Math.sin(tt * 2.2) * 0.04 * (Math.sin(tt * 0.5) > 0.6 ? 1 : 0.25)); ctx.scale(1 + atem, 1 - atem);
  const gap = CS * 0.08, sz = CS - gap * 2, rad = CS * 0.22, px = c.px, n = px.length, cap = f.list.length, start = Math.max(0, n - cap);
  f.list.forEach(([x, y], k) => {
    const p = k < n ? px[start + k] : null, X = x * CS - CS / 2 + gap, Y = y * CS - CS / 2 + gap;
    if (p) {
      let s = sz, o = 0; if (k === Math.min(n, cap) - 1 && now - pop.t < 700) { const q = (now - pop.t) / 700; s = sz * (1 + 1.2 * (1 - q) * Math.sin(q * Math.PI)); o = (s - sz) / 2; }
      const sh = clamp(-(x / (f.rx || 7)) * 0.1 - ((y - (f.cy || 0)) / (f.ry || 8)) * 0.14, -0.22, 0.22);
      ctx.fillStyle = shade(p.c, sh); rr(ctx, X - o, Y - o, s, s, rad);
    } else {
      const rand = !f.cells.has((x + 1) + "," + y) || !f.cells.has((x - 1) + "," + y) || !f.cells.has(x + "," + (y + 1)) || !f.cells.has(x + "," + (y - 1));
      ctx.fillStyle = rand ? "rgba(177,74,237,.28)" : "rgba(177,74,237,.10)"; rr(ctx, X, Y, sz, sz, rad);
    }
  });
  if (c.si === 0) {
    const fort = c.next ? c.n / c.next.ab : 1;
    if (fort > 0.35) { ctx.strokeStyle = "rgba(40,30,60,.75)"; ctx.lineWidth = CS * 0.18; ctx.lineJoin = "round"; ctx.beginPath(); const pts = [[-5, -1], [-3, -2], [-2, 0], [0, -2], [1, 0], [3, -2], [5, -1]]; const mm = Math.min(pts.length, 2 + Math.floor((fort - 0.35) / 0.65 * pts.length)); pts.slice(0, mm).forEach(([a, b], i) => i ? ctx.lineTo(a * CS, b * CS) : ctx.moveTo(a * CS, b * CS)); ctx.stroke(); }
  } else {
    if (now > naechstesBlinzeln) { blinzeln = now; naechstesBlinzeln = now + 2500 + Math.random() * 4000; }
    const zu = now - blinzeln < 140, schlaf = c.stimmung === "muede", lx = clamp(zeiger.x, -1, 1), ly = clamp(zeiger.y, -1, 1);
    for (const e of f.eyes) {
      if (zu || schlaf) { ctx.fillStyle = "#1f1b2e"; rr(ctx, e.x * CS - CS / 2 + gap, (e.y + e.h - 1) * CS - CS / 2 + gap + CS * 0.3, e.w * CS - gap * 2, CS * 0.45, CS * 0.2); continue; }
      ctx.fillStyle = "#ffffff"; rr(ctx, e.x * CS - CS / 2 - gap, e.y * CS - CS / 2 - gap, e.w * CS + gap * 2, e.h * CS + gap * 2, CS * 0.6);
      ctx.fillStyle = "#1f1b2e"; rr(ctx, e.x * CS - CS / 2 + gap, e.y * CS - CS / 2 + gap, e.w * CS - gap * 2, e.h * CS - gap * 2, CS * 0.5);
      ctx.fillStyle = "#fff"; rr(ctx, (e.x + (e.w - 1) * (0.5 + lx * 0.5)) * CS - CS / 2 + gap * 2.5, (e.y + (e.h - 1) * (0.25 + ly * 0.3)) * CS - CS / 2 + gap * 2.5, CS * 0.6, CS * 0.6, CS * 0.2);
    }
    const m = f.mouth, st2 = freuT > now ? "froh" : c.stimmung;
    const cell = (a, b, w = 1, h = 1, farbe = "#1f1b2e") => { ctx.fillStyle = "rgba(255,255,255,.85)"; rr(ctx, (m.x + a) * CS - CS / 2 - gap * .5, (m.y + b) * CS - CS / 2 - gap * .5, w * CS + gap, h * CS + gap, CS * .35); ctx.fillStyle = farbe; rr(ctx, (m.x + a) * CS - CS / 2 + gap * 1.5, (m.y + b) * CS - CS / 2 + gap * 1.5, w * CS - gap * 3, h * CS - gap * 3, CS * .2); };
    if (st2 === "froh") { cell(-2, 0); cell(2, 0); cell(-1, 1, 3, 1); }
    else if (st2 === "hungrig") { cell(-1, 0, 3, 2); cell(0, 1, 1, 1, "#ff6b8b"); }
    else if (st2 === "muede") cell(-1, 1, 3, 1);
    else cell(-1, 0, 3, 1);
    if (st2 === "froh") { ctx.fillStyle = "rgba(255,90,140,.38)"; f.eyes.forEach((e, k) => rr(ctx, (e.x + (k === 0 ? -1.2 : e.w - 0.2)) * CS - CS / 2, (e.y + e.h + 0.2) * CS - CS / 2, CS * 1.4, CS * 0.8, CS * .4)); }
    // Blumenkranz ab 3 Sternen (Belohnung aus dem Spiel)
    if (S.spiel.sterne >= 3) {
      const yk = f.top + 0.6;
      for (let x = -4; x <= 4; x += 2) {
        const fc = ["#ff3d9a", "#ffd93d", "#ff5a5f", "#ffffff", "#b14aed"][(x + 4) / 2], kx = x * CS, ky = (yk - (Math.abs(x) < 3 ? 0.4 : 0)) * CS;
        ctx.fillStyle = fc; for (const [a, b] of [[0, -.45], [.45, 0], [0, .45], [-.45, 0]]) { ctx.beginPath(); ctx.arc(kx + a * CS, ky + b * CS, CS * .38, 0, 7); ctx.fill(); }
        ctx.fillStyle = "#ffb400"; ctx.beginPath(); ctx.arc(kx, ky, CS * .3, 0, 7); ctx.fill();
      }
    }
  }
  ctx.restore();
  partikel = partikel.filter(p => p.life > 0);
  for (const p of partikel) { p.x += p.vx; p.y += p.vy; p.vy += 0.04 * DPR; p.life -= 0.016; ctx.globalAlpha = clamp(p.life, 0, 1); ctx.fillStyle = p.c; if (p.herz) { ctx.font = `${CS * 1.3}px serif`; ctx.fillText("♥", p.x, p.y); } else rr(ctx, p.x, p.y, p.s, p.s, p.s * .25); }
  ctx.globalAlpha = 1;
}
cv.addEventListener("pointermove", ev => { const r = cv.getBoundingClientRect(); zeiger.x = ((ev.clientX - r.left) / r.width - .5) * 2.5; zeiger.y = ((ev.clientY - r.top) / r.height - .5) * 2.5; });
cv.addEventListener("pointerleave", () => { zeiger.x = 0; zeiger.y = 0; });
cv.addEventListener("click", ev => {
  const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) * (W / r.width), y = (ev.clientY - r.top) * (W / r.height);
  streichelBonus = Math.min(streichelBonus + 3, 15); freuT = performance.now() + 1500;
  for (let i = 0; i < 3; i++) partikel.push({ x: x + (Math.random() - .5) * CS * 3, y, vx: (Math.random() - .5) * DPR, vy: -2 * DPR - Math.random() * DPR, c: "#ff3d9a", life: 1.1, herz: true });
  wesenSpricht(C.si === 0 ? "ei" : "streicheln").then(sag);
  aufgabeZaehlen("streicheln"); berechnen(); anzeigen();
});

/* ===================== Sprechblase ===================== */
let sagT = 0, sagTimer;
function sag(text, ms = 5200) { const b = $("#bubble"); b.textContent = text; b.classList.remove("off"); sagT = Date.now(); clearTimeout(sagTimer); sagTimer = setTimeout(() => b.classList.add("off"), ms); }
setInterval(() => { if (Date.now() - sagT > 11000 && document.visibilityState === "visible" && $("#v-tausi").classList.contains("on")) wesenSpricht(C.stimmung, { p: fmt(C.spender) }).then(sag); }, 3000);

/* ===================== Animation ===================== */
function schleife(now) {
  requestAnimationFrame(schleife);
  if ($("#v-bild").classList.contains("on")) bildZeichnen(now);
  if ($("#v-tausi").classList.contains("on")) tausiZeichnen(now);
}

/* ===================== Texte & Anzeige ===================== */
function texteSetzen() {
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  $$("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
  $$(".brandName").forEach(el => el.textContent = CONFIG.NAME);
  $("#langCode").textContent = LANG.toUpperCase();
  $("#legalLang").textContent = t("legal_lang");
  $("#vorschau-band").classList.toggle("hidden", CONFIG.MODUS === "live");
  $("#stageList").innerHTML = STUFEN.map((s, i) => `<li>${t("s" + i)} – ${t("pixels_n", { n: fmt(s.ab) })}</li>`).join("");
}
function anzeigen() {
  const c = C;
  $("#bildName").textContent = t("bild_no", { n: fmt(c.bildNr + 1) }) + " · " + t("m" + (c.bildNr % 3));
  $("#bildCount").textContent = t("bild_count", { a: fmt(c.bildAnzahl), b: fmt(CAP) });
  $("#bildBar").style.width = Math.max(1, c.bildAnzahl / CAP * 100) + "%";
  $("#ctaSub").textContent = S.vorrat > 0 ? t("cta_have", { n: fmt(S.vorrat) }) : t("cta_buy");
  $$(".priceTxt").forEach(el => el.textContent = milliEuro(1));
  const fx = fxText(S.ich.land); $("#fxLine").textContent = fx ? t("fx", { v: fx }) : ""; $("#fxLine").classList.toggle("hidden", !fx);
  $("#sDonors").textContent = fmt(c.spender); $("#sPixels").textContent = fmt(c.n); $("#sSum").textContent = milliEuro(c.zaehl.length); $("#sCountries").textContent = fmt(c.laender);
  $("#sPct").textContent = prozentText(c.spender / CONFIG.WELTBEVOELKERUNG * 100);
  $("#balanceChipVal").textContent = fmt(S.vorrat);
  feedZeichnen($("#feedHome"), c.px.slice(-5).reverse());
  $("#wStage").textContent = t("stage_of", { s: t("s" + c.si), a: c.si + 1, b: STUFEN.length });
  if (c.next) { $("#nextLbl").textContent = t("next_stage", { n: fmt(c.next.ab - c.n), s: t("s" + (c.si + 1)) }); $("#stageBar").style.width = clamp((c.n - STUFEN[c.si].ab) / (c.next.ab - STUFEN[c.si].ab) * 100, 2, 100) + "%"; }
  else { $("#nextLbl").textContent = t("top_reached"); $("#stageBar").style.width = "100%"; }
  $("#steps").innerHTML = STUFEN.map((s, i) => `<i class="${i <= c.si ? "on" : ""}" title="${esc(t("s" + i))}"></i>`).join("");
  $("#hungerVal").textContent = c.sattP + " %"; $("#hungerBar").style.width = c.sattP + "%";
  $("#joyVal").textContent = c.frohP + " %"; $("#joyBar").style.width = c.frohP + "%";
  $("#moodTxt").textContent = t("mood_" + c.stimmung);
}
function zit(x) { return LANG === "de" ? "„" + esc(x) + "“" : "“" + esc(x) + "”"; }
function feedZeichnen(el, liste, mitMelden) {
  if (!liste.length) { el.innerHTML = `<li class="small">–</li>`; return; }
  el.innerHTML = liste.map(p => {
    const gem = S.gemeldet.includes(p.nr);
    return `<li><span class="px" style="background:${esc(p.c)}"></span><div style="flex:1;min-width:0">
      <div class="who">${esc(p.n || t("someone"))} ${p.k ? `<span class="cc">${p.k}</span> <span class="small">${esc(landName(p.k))}</span>` : ""}${p.demo ? `<span class="tag-demo">${t("example")}</span>` : ""}</div>
      ${p.m && !gem ? `<div class="msg">${zit(p.m)}</div>` : ""}${gem ? `<div class="msg small">${t("hidden_msg")}</div>` : ""}
      <div class="meta">${t("pixel_no", { n: fmt(p.nr) })} · ${zeitText(p.t)}</div></div>
      ${mitMelden && p.m && !gem ? `<button class="report" data-melden="${p.nr}">${t("report")}</button>` : ""}</li>`;
  }).join("");
}

/* ===================== Ansichten ===================== */
function zeige(name) {
  if (platzieren && name !== "bild") platzAbbrechen();
  if (name !== "spiel" && spiel.laeuft) spielEnde();
  $$(".view").forEach(v => v.classList.toggle("on", v.id === "v-" + name));
  $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.go === name));
  requestAnimationFrame(() => {
    if (name === "bild") bildGroesse();
    if (name === "tausi") { groesse(); blurZeichnen(); if (Date.now() - sagT > 4000) wesenSpricht(C.stimmung, { p: fmt(C.spender) }).then(sag); }
    if (name === "welt") weltZeichnen();
    if (name === "ich") ichZeichnen();
    if (name === "spiel") { spielGroesse(); aufgabenZeichnen(); spielBild(); }
  });
  window.scrollTo({ top: 0 });
}
document.addEventListener("click", ev => {
  const g = ev.target.closest("[data-go]"); if (g) { ev.preventDefault(); zeige(g.dataset.go); }
  const a = ev.target.closest("[data-act='set']"); if (a) pixelStart();
  const m = ev.target.closest("[data-melden]"); if (m) melden(+m.dataset.melden);
});
$("#balanceChip").onclick = () => zeige("ich");
function melden(nr) { if (!confirm(t("report_q"))) return; S.gemeldet.push(nr); speichern(); sheetZu(); toast(t("reported")); weltZeichnen(); anzeigen(); }

/* ===================== Bottom-Sheet ===================== */
function sheetAuf(html) { $("#sheetBody").innerHTML = html; $("#sheet").classList.remove("hidden"); $(".sheet-panel").scrollTop = 0; }
function sheetZu() { $("#sheet").classList.add("hidden"); }
$("#sheetBg").onclick = sheetZu; $("#sheetX").onclick = sheetZu;

/* ===================== Sprache wählen ===================== */
function sprachWahl() {
  sheetAuf(`<h2>🌐 ${t("language")}</h2><div class="lang-grid">${SPRACHEN.map(([k, n]) => `<button data-lang="${k}" class="${k === LANG ? "on" : ""}" lang="${k}">${n}</button>`).join("")}</div>`);
  $$("[data-lang]").forEach(b => b.onclick = () => { setzeSprache(b.dataset.lang); sheetZu(); });
}
function setzeSprache(k) { LANG = k; S.ich.sprache = k; speichern(); texteSetzen(); anzeigen(); zeige($(".view.on").id.slice(2)); }
$("#langBtn").onclick = sprachWahl;

/* ===================== Pixel setzen ===================== */
const FARBEN = ["#ff5a5f","#ff3d9a","#b14aed","#3d5afe","#00a8e8","#00b894","#90be6d","#ffd93d","#ffb400","#f4a261","#c0703f","#ffffff","#8d99ae","#1f1b2e"];
let wahl = { anzahl: 1 };
function aktuelleFarbe() { return farbModus === "motiv" && gewaehlt !== null ? motiv(C.bildNr)[gewaehlt] : (wahlFarbe || FARBEN[0]); }
function pixelStart() {
  if (S.vorrat < 1) {
    sheetAuf(`<h2>${t("need_buy_t")}</h2><p class="sub">${t("need_buy")}</p><button class="btn main block" id="zumKauf" style="margin-top:14px">${t("buy")}</button>`);
    $("#zumKauf").onclick = () => { sheetZu(); zeige("ich"); setTimeout(() => $("#packs").scrollIntoView({ behavior: "smooth", block: "center" }), 150); };
    return;
  }
  if (!$("#v-bild").classList.contains("on")) zeige("bild");
  platzieren = true; gewaehlt = null; $("#placeBar").classList.remove("hidden");
  setTimeout(() => $(".frame").scrollIntoView({ behavior: "smooth", block: "center" }), 80);
}
function platzAbbrechen() { platzieren = false; gewaehlt = null; $("#placeBar").classList.add("hidden"); }
$("#ctaSet").onclick = pixelStart;
$("#placeCancel").onclick = platzAbbrechen;
$("#placeRandom").onclick = () => { if (!C.frei.length) return; gewaehlt = rnd(C.frei); pixelFormular(); };
function laenderOptionen(sel) {
  return `<option value="">${t("none")}</option>` + LAENDER.map(l => [l[0], landName(l[0])]).sort((a, b) => a[1].localeCompare(b[1], LANG)).map(([k, n]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${esc(n)}</option>`).join("");
}
function pixelFormular() {
  if (wahl.anzahl > S.vorrat) wahl.anzahl = 1;
  const motivF = motiv(C.bildNr)[gewaehlt];
  sheetAuf(`
    <h2>${t("your_pixel")}</h2>
    <div class="sub">${t("pixel_no", { n: fmt(S.nextNr) })} · ${t("costs")}</div>
    <label class="f">${t("color")}</label>
    <button class="motif-btn ${farbModus === "motiv" ? "on" : ""}" id="motivBtn"><span class="px" style="background:${motivF}"></span>${t("motif_color")}</button>
    <div class="small" style="margin-bottom:8px">${t("own_color")}</div>
    <div class="swatches" id="sws">${FARBEN.map(f => `<button class="sw ${farbModus === "eigen" && f === wahlFarbe ? "on" : ""}" data-f="${f}" style="background:${f}" aria-label="${f}"></button>`).join("")}
      <label class="sw custom"><input type="color" id="eigeneFarbe" value="${wahlFarbe || "#ff5a5f"}"></label></div>
    <label class="f" for="fName">${t("name_f")}</label>
    <input class="inp" id="fName" maxlength="24" value="${esc(wahl.name ?? S.ich.name)}">
    <label class="f" for="fLand">${t("country_f")}</label>
    <select class="inp" id="fLand">${laenderOptionen(wahl.land ?? S.ich.land)}</select>
    <label class="f" for="fMsg">${t("greet")} (<span id="msgN">${CONFIG.MAX_GRUSS}</span>)</label>
    <input class="inp" id="fMsg" maxlength="${CONFIG.MAX_GRUSS}">
    <label class="f">${t("how_many")}</label>
    <div class="counts" id="cnts">${[1, 10, 100].map(n => `<button data-n="${n}" class="${wahl.anzahl === n ? "on" : ""}" ${n > S.vorrat ? "disabled style='opacity:.35'" : ""}>${n} · ${milliEuro(n)}</button>`).join("")}</div>
    <div class="small" style="margin-top:6px">${t("many_hint")}</div>
    <label class="check"><input type="checkbox" id="fPub" ${wahl.pub === false ? "" : "checked"}> <span>${t("public")}</span></label>
    <div class="small">${t("final")}</div>
    <button class="btn main block" id="fGo" style="margin-top:14px;padding:16px">🎨 ${t("cta")} · <span id="fPreis"></span></button>
    <div class="row" style="justify-content:space-between;margin-top:8px"><button class="btn small ghost" id="fOther">${t("other_place")}</button><span class="small">${t("rest")}: <b id="fRest"></b></span></div>`);
  const upd = () => { $("#fPreis").textContent = milliEuro(wahl.anzahl); $("#fRest").textContent = fmt(S.vorrat - wahl.anzahl); };
  upd();
  $("#motivBtn").onclick = () => { farbModus = "motiv"; $("#motivBtn").classList.add("on"); $$("#sws .sw").forEach(x => x.classList.remove("on")); };
  $$("#sws .sw[data-f]").forEach(b => b.onclick = () => { farbModus = "eigen"; wahlFarbe = b.dataset.f; $("#motivBtn").classList.remove("on"); $$("#sws .sw").forEach(x => x.classList.toggle("on", x === b)); });
  $("#eigeneFarbe").oninput = e => { farbModus = "eigen"; wahlFarbe = e.target.value; $("#motivBtn").classList.remove("on"); $$("#sws .sw").forEach(x => x.classList.remove("on")); e.target.parentElement.classList.add("on"); };
  $$("#cnts button").forEach(b => b.onclick = () => { if (b.disabled) return; wahl.anzahl = +b.dataset.n; $$("#cnts button").forEach(x => x.classList.toggle("on", x === b)); upd(); });
  $("#fMsg").oninput = e => $("#msgN").textContent = CONFIG.MAX_GRUSS - e.target.value.length;
  $("#fOther").onclick = () => { gewaehlt = null; sheetZu(); };
  $("#fGo").onclick = pixelSetzen;
}
function pixelSetzen() {
  const name = textPruefen($("#fName").value), gruss = textPruefen($("#fMsg").value);
  if (!name.ok) return toast(name.grund); if (!gruss.ok) return toast(gruss.grund);
  const anzahl = wahl.anzahl; if (S.vorrat < anzahl) return toast(t("not_enough"));
  const land = $("#fLand").value, pub = $("#fPub").checked, alteStufe = C.si, altesBild = C.bildNr, farbe = aktuelleFarbe();
  wahl = { anzahl, name: name.text, land, pub };
  if (!S.ich.name && name.text) S.ich.name = name.text;
  // Live: EINE Datenbank-Funktion (tausi_pixel_setzen) prüft den Vorrat und zieht ab. Hier im Browser nur Probe.
  let b = C.bildNr, frei = C.frei.filter(i => i !== gewaehlt).sort(() => Math.random() - .5);
  const startNr = S.nextNr, erster = gewaehlt;
  for (let k = 0; k < anzahl; k++) {
    let i = k === 0 ? gewaehlt : null;
    if (i === null) { if (!frei.length) { b++; frei = [...Array(CAP).keys()].sort(() => Math.random() - .5); } i = frei.pop(); }
    const bb = k === 0 ? C.bildNr : b;
    S.pixel.push({ nr: S.nextNr++, b: bb, i, c: farbModus === "motiv" ? motiv(bb)[i] : farbe, n: pub ? name.text : "", k: land, m: pub && k === 0 ? gruss.text : "", t: Date.now() + k, d: S.ich.id, probe: CONFIG.MODUS !== "live" });
  }
  S.vorrat -= anzahl;
  S.verlauf.unshift({ t: Date.now(), typ: "set", pixel: -anzahl, n: anzahl, nr: startNr, farbe });
  speichern(); sheetZu(); platzAbbrechen(); berechnen(); anzeigen();
  aufgabeErledigt(3);
  bildPop = { i: erster, t: performance.now() }; pop = { t: performance.now() }; freuT = performance.now() + 2500;
  if (C.bildNr > altesBild) toast("🎉 " + t("bild_done"), 4000);
  if (C.si > alteStufe) { toast("🎉 " + t("grew", { s: t("s" + C.si) }), 4500); sag(t("grew", { s: t("s" + C.si) }), 7000); }
  else wesenSpricht("danke", { name: name.text || "♥", land: land ? landName(land) : "🌍" }).then(x => sag(x, 6000));
  setTimeout(() => passAnzeigen(startNr, anzahl, land, farbe), 900);
}
function passAnzeigen(nr, anzahl, land, farbe) {
  sheetAuf(`<div style="text-align:center">
    <div style="width:76px;height:76px;border-radius:18px;margin:6px auto 14px;background:${esc(farbe)};box-shadow:0 10px 30px ${esc(farbe)}88, inset 0 0 0 4px #fff"></div>
    <h2>${t("thanks")}</h2><div class="sub">${t("pass")}</div>
    <div style="font-family:var(--serif);font-size:34px;font-weight:700;margin:8px 0">${t("pixel_no", { n: fmt(nr) + (anzahl > 1 ? "–" + fmt(nr + anzahl - 1) : "") })}</div>
    <div class="sub">${land ? esc(landName(land)) + " · " : ""}${t("bild_no", { n: fmt(C.bildNr + 1) })}</div>
    <button class="btn main block" id="passShare" style="margin-top:18px">${t("tell")}</button>
    <button class="btn ghost block" id="passTausi" style="margin-top:6px">🐣 Tausi ›</button></div>`);
  $("#passShare").onclick = () => { sheetZu(); zeige("ich"); setTimeout(() => $("#shareText").scrollIntoView({ behavior: "smooth", block: "center" }), 150); };
  $("#passTausi").onclick = () => { sheetZu(); zeige("tausi"); };
}
function pixelInfo(p) {
  const gem = S.gemeldet.includes(p.nr);
  sheetAuf(`<div class="row" style="gap:14px"><span class="px" style="width:56px;height:56px;border-radius:14px;background:${esc(p.c)}"></span>
    <div><h2 style="margin:0">${t("pixel_no", { n: fmt(p.nr) })}</h2><div class="sub">${esc(p.n || t("someone"))}${p.k ? " · " + esc(landName(p.k)) : ""} · ${zeitText(p.t)}${p.demo ? ` <span class="tag-demo">${t("example")}</span>` : ""}</div></div></div>
    ${p.m && !gem ? `<p style="font-size:17px;margin:16px 0 4px">${zit(p.m)}</p><button class="report" data-melden="${p.nr}" style="margin:0">${t("report")}</button>` : ""}`);
}

/* ===================== Welt ===================== */
let rangArt = "pct";
function laenderStatistik() {
  const m = {}; C.zaehl.forEach(p => { if (!p.k || !LAND[p.k]) return; const e = m[p.k] = m[p.k] || { k: p.k, pixel: 0, sp: new Set() }; e.pixel++; e.sp.add(p.d); });
  return Object.values(m).map(e => ({ k: e.k, pixel: e.pixel, sp: e.sp.size, proMio: e.sp.size / LAND[e.k].mio }));
}
const MAPFARBEN = ["#ff5a5f","#ffb400","#00b894","#00a8e8","#b14aed","#ff3d9a","#3d5afe"];
function weltZeichnen() {
  const st = laenderStatistik(), max = Math.max(1, ...st.map(e => e.pixel)), byK = {}; st.forEach(e => byK[e.k] = e);
  const neu = C.zaehl.length ? C.zaehl[C.zaehl.length - 1].k : null, X = lon => lon + 180, Y = lat => 82 - lat;
  let svg = "";
  landPunkte().forEach(([lon, lat]) => { svg += `<circle class="land" cx="${X(lon).toFixed(1)}" cy="${Y(lat).toFixed(1)}" r="1.15"/>`; });
  st.sort((a, b) => b.pixel - a.pixel).forEach(e => { const l = LAND[e.k], r = 1.8 + Math.sqrt(e.pixel / max) * 5.5, fc = MAPFARBEN[(e.k.charCodeAt(0) + e.k.charCodeAt(1)) % 7]; svg += `<circle class="hot ${e.k === neu ? "pulse" : ""}" data-k="${e.k}" cx="${X(l.lon)}" cy="${Y(l.lat)}" r="${r.toFixed(2)}" fill="${fc}" fill-opacity=".85" stroke="#fff" stroke-width=".6"/>`; });
  const map = $("#map"); map.innerHTML = svg;
  map.querySelectorAll(".hot").forEach(c => c.onclick = () => { const e = byK[c.dataset.k]; toast(`${landName(e.k)}: ${fmt(e.sp)} ${t("people_short")} · ${t("pixels_n", { n: fmt(e.pixel) })}`); });
  const liste = st.slice().sort((a, b) => rangArt === "pct" ? b.proMio - a.proMio : b.sp - a.sp).slice(0, 15);
  const top = liste.length ? (rangArt === "pct" ? liste[0].proMio : liste[0].sp) : 1;
  $("#rankList").innerHTML = liste.map((e, i) => {
    const v = rangArt === "pct" ? e.proMio : e.sp, pct = e.sp / (LAND[e.k].mio * 1e6) * 100;
    return `<li><span class="pos">${i + 1}</span><div><div><span class="cc">${e.k}</span> <b>${esc(landName(e.k))}</b></div><div class="bar" style="width:${Math.max(4, Math.sqrt(v / top) * 100)}%"></div></div>
      <div class="v">${rangArt === "pct" ? prozentText(pct) : fmt(e.sp)}<small>${rangArt === "pct" ? fmt(e.sp) + " " + t("people_short") : prozentText(pct)}</small></div></li>`;
  }).join("") || `<li class="small">–</li>`;
  feedZeichnen($("#feedAll"), C.px.filter(p => p.m).slice(-25).reverse(), true);
}
$$("#rankSeg button").forEach(b => b.onclick = () => { rangArt = b.dataset.r; $$("#rankSeg button").forEach(x => x.classList.toggle("on", x === b)); weltZeichnen(); });

/* ===================== Ich: Pixel kaufen, Teilen, Einstellungen ===================== */
let paketWahl = (CONFIG.PAKETE.find(p => p.beliebt) || CONFIG.PAKETE[0]).id;
function ichZeichnen() {
  $("#balBig").textContent = fmt(S.vorrat);
  $("#packs").innerHTML = CONFIG.PAKETE.map(p => `<button class="pack ${p.id === paketWahl ? "on" : ""}" data-p="${p.id}">${p.beliebt ? `<span class="tag">${t("popular")}</span>` : p.bonus ? `<span class="tag b">${t("bonus")}</span>` : ""}
    <div class="p">${euro(p.preisCent)}</div><div class="n">${t("pixels_n", { n: fmt(p.pixel) })}</div></button>`).join("");
  $$("#packs .pack").forEach(b => b.onclick = () => { paketWahl = b.dataset.p; ichZeichnen(); });
  $("#hist").innerHTML = S.verlauf.length ? S.verlauf.slice(0, 40).map(v => `<li><span class="ico" ${v.farbe ? `style="background:${esc(v.farbe)}"` : ""}>${v.typ === "kauf" ? "🛒" : ""}</span>
    <div><div>${v.typ === "kauf" ? t("hist_buy", { n: fmt(v.pixel), p: euro(v.cent) }) : t("hist_set", { n: fmt(v.n), nr: fmt(v.nr) })}</div><div class="small">${new Date(v.t).toLocaleString(locale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div></div>
    <span class="amt ${v.pixel > 0 ? "plus" : ""}">${v.pixel > 0 ? "+" : "−"}${fmt(Math.abs(v.pixel))}</span></li>`).join("") : `<li class="small">${t("nothing")}</li>`;
  $("#shareText").value = teilText();
  $("#setName").value = S.ich.name || "";
  $("#setLand").innerHTML = laenderOptionen(S.ich.land);
  $("#setLang").innerHTML = SPRACHEN.map(([k, n]) => `<option value="${k}" ${k === LANG ? "selected" : ""}>${n}</option>`).join("");
  $("#setDemo").checked = S.demo;
  $("#versionInfo").textContent = `Prototyp · ${CONFIG.MODUS} · ${CONFIG.SPEICHER} · 11.11.2026`;
}
$("#buyBtn").onclick = () => kaufDialog(CONFIG.PAKETE.find(p => p.id === paketWahl));
$("#firmaLink").onclick = e => { e.preventDefault(); sheetAuf(`<h2>${t("company")}</h2><p class="sub">${t("company_text")}</p>`); };
function limitPruefen(cent) {
  const j = Date.now(), h = S.kaeufe.filter(k => j - k.t < 3600000).length, d = S.kaeufe.filter(k => j - k.t < 86400000).reduce((a, k) => a + k.cent, 0);
  if (h >= CONFIG.MAX_KAEUFE_PRO_STUNDE) return t("limit_h"); if (d + cent > CONFIG.MAX_CENT_PRO_TAG) return t("limit_d"); return null;
}
// Kauf-Dialog nach Krümels Baustein "kauf-haekchen": zwei Pflicht-Häkchen, vorher nicht angehakt, Knopf erst dann frei.
function kaufDialog(p) {
  const ust = Math.round(p.preisCent - p.preisCent / 1.19);
  const link = (href, k) => `<a href="${href}" target="_blank" rel="noopener">${t(k)}</a>`;
  sheetAuf(`
    ${CONFIG.MODUS !== "live" ? `<div class="warn-box" style="margin-bottom:14px">${t("band_main")}</div>` : ""}
    <h2>${t("pixels_n", { n: fmt(p.pixel) })}</h2>
    <div class="sub">${t("incl_vat", { p: euro(p.preisCent), v: euro(ust) })}</div>
    <div class="small" style="margin:10px 0">${t("pay_later")}</div>
    <div class="kauf-zustimmung">
      <label class="check"><input type="checkbox" id="zust-widerruf"> <span><b>${t("chk1")}</b></span></label>
      <label class="check"><input type="checkbox" id="zust-agb"> <span>${t("chk2", { terms: link("pixel-bedingungen.html", "terms"), privacy: link("datenschutz.html", "privacy") })}</span></label>
      <div class="small" style="margin:8px 0 12px">${t("buy_note")}</div>
      <button class="btn main block" id="kauf-knopf" disabled style="padding:16px">${CONFIG.MODUS === "live" ? t("buy_now") : t("probe_buy")}</button>
    </div>`);
  const a = $("#zust-widerruf"), b = $("#zust-agb"), k = $("#kauf-knopf"), upd = () => k.disabled = !(a.checked && b.checked);
  a.onchange = upd; b.onchange = upd;
  k.onclick = async () => {
    const lim = limitPruefen(p.preisCent); if (lim) return toast(lim, 3500);
    k.disabled = true; k.innerHTML = `<span class="spin"></span> ${t("checking")}`;
    try { const r = await Zahlung.kaufen(p); if (r.ok) gutschrift(p, r.ref, r.probe); }
    catch (e) { toast(e.message, 4000); k.disabled = false; k.textContent = CONFIG.MODUS === "live" ? t("buy_now") : t("probe_buy"); }
  };
}
// Gleiche Gutschrift-Logik wie später im Webhook (dort auf dem Server; jede Zahlung nur einmal).
function gutschrift(p, ref, probe) {
  if (S.kaeufe.some(k => k.ref === ref)) return;
  S.kaeufe.push({ t: Date.now(), paket: p.id, cent: p.preisCent, pixel: p.pixel, ref, zustimmung: CONFIG.ZUSTIMMUNG_VERSION, probe: !!probe });
  S.vorrat += p.pixel; S.verlauf.unshift({ t: Date.now(), typ: "kauf", pixel: p.pixel, cent: p.preisCent });
  speichern(); berechnen(); anzeigen(); ichZeichnen();
  sheetAuf(`<div style="text-align:center"><div style="font-size:46px">✨</div><h2>${t("got", { n: fmt(p.pixel) })}</h2><p class="sub">${t("cta_have", { n: fmt(S.vorrat) })}</p>
    <button class="btn main block" id="nowSet" style="margin-top:14px">🎨 ${t("set_now")}</button></div>`);
  $("#nowSet").onclick = () => { sheetZu(); pixelStart(); };
}
function teilText() {
  const url = CONFIG.ADRESSE || location.href.split("#")[0].split("?")[0];
  return t("share_text", { name: CONFIG.NAME, p: fmt(C.spender), c: fmt(C.laender), land: S.ich.land ? landName(S.ich.land) : t("your_country"), url });
}
$("#copyShare").onclick = async () => { const x = $("#shareText").value; try { await navigator.clipboard.writeText(x); } catch (e) { $("#shareText").select(); document.execCommand("copy"); } toast(t("copied")); };
$("#nativeShare").onclick = async () => { if (navigator.share) { try { await navigator.share({ title: CONFIG.NAME, text: teilText() }); } catch (e) {} } else $("#copyShare").click(); };
$("#setName").onchange = e => { const r = textPruefen(e.target.value); if (!r.ok) { toast(r.grund); e.target.value = S.ich.name; return; } S.ich.name = r.text; wahl.name = undefined; speichern(); toast(t("saved")); };
$("#setLand").onchange = e => { S.ich.land = e.target.value; wahl.land = undefined; speichern(); anzeigen(); ichZeichnen(); toast(t("saved")); };
$("#setLang").onchange = e => setzeSprache(e.target.value);
$("#setDemo").onchange = e => { S.demo = e.target.checked; speichern(); berechnen(); anzeigen(); };
$("#resetAll").onclick = () => { if (!confirm(t("reset_q"))) return; Speicher.loeschen(); location.reload(); };

/* ===================== Mini-Spiel „Farbenregen“ (eigene Idee) =====================
   Tausi fängt fallende Farbtropfen. Die Wunschfarbe bringt viele Punkte,
   Sterne Extrapunkte, Tintenkleckse kosten ein Herz. Eine Runde dauert 60 Sekunden. */
const spielCv = $("#spiel"), sctx = spielCv.getContext("2d");
const SPIELFARBEN = ["#ff5a5f","#ffb400","#00b894","#00a8e8","#b14aed","#ff3d9a"];
const spiel = { laeuft: false, x: .5, ziel: .5, tropfen: [], punkte: 0, herzen: 3, zeit: 60, wunsch: SPIELFARBEN[0], combo: 0, letzt: 0, spawn: 0, wunschT: 0, w: 0, h: 0, effekte: [] };
function spielGroesse() { const r = spielCv.getBoundingClientRect(); if (!r.width) return; const d = Math.min(devicePixelRatio || 1, 2); spielCv.width = Math.round(r.width * d); spielCv.height = Math.round(r.height * d); spiel.w = spielCv.width; spiel.h = spielCv.height; }
function spielStart() {
  spielGroesse(); Object.assign(spiel, { laeuft: true, x: .5, ziel: .5, tropfen: [], punkte: 0, herzen: 3, zeit: 60, combo: 0, letzt: performance.now(), spawn: 0, wunschT: 0, effekte: [] });
  neuerWunsch(); $("#gameOver").classList.add("hidden"); hud(); requestAnimationFrame(spielSchritt);
}
function neuerWunsch() { let w; do { w = rnd(SPIELFARBEN); } while (w === spiel.wunsch); spiel.wunsch = w; spiel.wunschT = 0; $("#hudWish").style.background = w; }
function hud() { $("#hudScore").textContent = fmt(spiel.punkte); $("#hudHearts").textContent = "❤".repeat(Math.max(0, spiel.herzen)) + "♡".repeat(3 - Math.max(0, spiel.herzen)); $("#hudTime").textContent = Math.ceil(spiel.zeit); }
function spielEnde() {
  spiel.laeuft = false;
  const neuBest = spiel.punkte > S.spiel.best; if (neuBest) S.spiel.best = spiel.punkte;
  speichern(); aufgabeErledigt(1); if (spiel.punkte >= 150) aufgabeErledigt(2); aufgabenZeichnen();
  $("#goScore").textContent = fmt(spiel.punkte); $("#goScore").classList.remove("hidden");
  $("#goText").textContent = t("game_over") + " " + fmt(spiel.punkte) + (neuBest ? " 🏆" : "");
  $("#gameStart").textContent = t("game_again"); $("#gameOver").classList.remove("hidden");
  wesenSpricht("spiel").then(x => sag(x));
}
function spielSchritt(now) {
  if (!spiel.laeuft) return;
  const dt = Math.min(0.05, (now - spiel.letzt) / 1000); spiel.letzt = now;
  spiel.zeit -= dt; spiel.wunschT += dt; if (spiel.wunschT > 12) neuerWunsch();
  if (spiel.zeit <= 0 || spiel.herzen <= 0) { spiel.zeit = Math.max(0, spiel.zeit); hud(); spielEnde(); spielBild(); return; }
  const tempo = 1 + (60 - spiel.zeit) / 45;
  spiel.spawn -= dt;
  if (spiel.spawn <= 0) {
    spiel.spawn = 0.55 / tempo + Math.random() * 0.35; const r = Math.random();
    const typ = r < .13 ? "klecks" : r < .19 ? "stern" : "farbe", c = typ === "farbe" ? (Math.random() < .45 ? spiel.wunsch : rnd(SPIELFARBEN)) : null;
    spiel.tropfen.push({ x: .06 + Math.random() * .88, y: -.04, v: (.22 + Math.random() * .12) * tempo, typ, c, r: Math.random() * 6 });
  }
  spiel.x += (spiel.ziel - spiel.x) * Math.min(1, dt * 14);
  const breite = .16, py = .86;
  for (const d of spiel.tropfen) {
    d.y += d.v * dt; d.r += dt * 3;
    if (!d.weg && d.y > py - .03 && d.y < py + .04 && Math.abs(d.x - spiel.x) < breite / 2 + .03) {
      d.weg = true;
      if (d.typ === "klecks") { spiel.herzen--; spiel.combo = 0; effekt(d, "−❤", "#c62828"); if (navigator.vibrate) navigator.vibrate(60); }
      else if (d.typ === "stern") { spiel.punkte += 25; effekt(d, "+25 ★", "#1f1b2e"); }
      else if (d.c === spiel.wunsch) { spiel.combo++; const p = 10 * Math.min(5, 1 + Math.floor(spiel.combo / 3)); spiel.punkte += p; effekt(d, "+" + p, "#1f1b2e"); }
      else { spiel.punkte += 1; spiel.combo = 0; effekt(d, "+1", "#7a7590"); }
    }
  }
  spiel.tropfen = spiel.tropfen.filter(d => !d.weg && d.y < 1.08);
  spiel.effekte = spiel.effekte.filter(e => (e.l -= dt) > 0);
  hud(); spielBild(); requestAnimationFrame(spielSchritt);
}
function effekt(d, txt, farbe) { spiel.effekte.push({ x: d.x, y: d.y, txt, farbe, l: .8 }); }
function spielBild() {
  if (!spiel.w) spielGroesse(); const W2 = spiel.w, H2 = spiel.h; if (!W2) return;
  sctx.clearRect(0, 0, W2, H2);
  const P = PALETTEN[0];
  sctx.fillStyle = "rgba(255,217,61,.55)"; sctx.beginPath(); sctx.arc(W2 * .82, H2 * .2, W2 * .09, 0, 7); sctx.fill();
  sctx.fillStyle = P.wiese[1]; sctx.beginPath(); sctx.moveTo(0, H2); for (let x = 0; x <= W2; x += 10) sctx.lineTo(x, H2 * .92 + Math.sin(x / W2 * 6) * H2 * .02); sctx.lineTo(W2, H2); sctx.fill();
  const u = W2 / 22;
  for (const d of spiel.tropfen) {
    const x = d.x * W2, y = d.y * H2;
    if (d.typ === "klecks") { sctx.fillStyle = "#1f1b2e"; sctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + d.r * .2, r2 = u * (.7 + .25 * Math.sin(k * 2.3 + d.r)); sctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); } sctx.fill(); }
    else if (d.typ === "stern") { sctx.fillStyle = "#ffb400"; sctx.save(); sctx.translate(x, y); sctx.rotate(d.r * .5); sctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, r2 = k % 2 ? u * .4 : u * .9; sctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); } sctx.fill(); sctx.restore(); }
    else { sctx.fillStyle = d.c; rr(sctx, x - u * .5, y - u * .5, u, u, u * .25); sctx.fillStyle = "rgba(255,255,255,.35)"; sctx.fillRect(x - u * .35, y - u * .38, u * .3, u * .2); }
  }
  // Tausi als kleines Pixelwesen in der Wunschfarbe
  const px0 = spiel.x * W2, py0 = .86 * H2, c = u * .62;
  ["..xxxxx..", ".xxxxxxx.", "xxxxxxxxx", "xxxxxxxxx", "xxxxxxxxx", ".xxxxxxx.", "..x...x.."].forEach((row, ry) => [...row].forEach((ch, rx) => { if (ch !== "x") return; sctx.fillStyle = shade(spiel.wunsch, -(ry / 7) * .25); rr(sctx, px0 + (rx - 4.5) * c, py0 + (ry - 3.5) * c, c * .9, c * .9, c * .2); }));
  sctx.fillStyle = "#fff"; rr(sctx, px0 - 2.6 * c, py0 - 2.1 * c, c * 1.6, c * 1.9, c * .5); rr(sctx, px0 + 1 * c, py0 - 2.1 * c, c * 1.6, c * 1.9, c * .5);
  sctx.fillStyle = "#1f1b2e"; rr(sctx, px0 - 2.3 * c, py0 - 1.8 * c, c, c * 1.3, c * .4); rr(sctx, px0 + 1.3 * c, py0 - 1.8 * c, c, c * 1.3, c * .4); rr(sctx, px0 - c, py0 + .1 * c, c * 2, c * .5, c * .2);
  for (const e of spiel.effekte) { sctx.globalAlpha = clamp(e.l / .8, 0, 1); sctx.fillStyle = e.farbe; sctx.font = `800 ${u * .8}px system-ui`; sctx.textAlign = "center"; sctx.fillText(e.txt, e.x * W2, e.y * H2 - (0.8 - e.l) * u * 3); }
  sctx.globalAlpha = 1;
}
function zielSetzen(ev) { const r = spielCv.getBoundingClientRect(); spiel.ziel = clamp((ev.clientX - r.left) / r.width, .08, .92); }
spielCv.addEventListener("pointerdown", ev => { zielSetzen(ev); try { spielCv.setPointerCapture(ev.pointerId); } catch (e) {} });
spielCv.addEventListener("pointermove", ev => { if (spiel.laeuft) zielSetzen(ev); });
document.addEventListener("keydown", ev => { if (!spiel.laeuft) return; if (ev.key === "ArrowLeft") { spiel.ziel = clamp(spiel.ziel - .12, .08, .92); ev.preventDefault(); } if (ev.key === "ArrowRight") { spiel.ziel = clamp(spiel.ziel + .12, .08, .92); ev.preventDefault(); } });
$("#gameStart").onclick = spielStart;

/* ===================== Tagesaufgaben ===================== */
function tagPruefen() { if (S.spiel.tag !== heute()) { S.spiel.tag = heute(); S.spiel.aufgaben = {}; S.spiel.streicheln = 0; } }
function aufgabeErledigt(n) { tagPruefen(); if (S.spiel.aufgaben[n]) return; S.spiel.aufgaben[n] = true; S.spiel.sterne++; speichern(); toast("⭐ " + t("task" + n)); aufgabenZeichnen(); }
function aufgabeZaehlen(art) { tagPruefen(); if (art === "streicheln") { S.spiel.streicheln++; if (S.spiel.streicheln >= 3) aufgabeErledigt(4); else speichern(); } }
function aufgabenZeichnen() {
  tagPruefen();
  $("#taskList").innerHTML = [1, 2, 3, 4].map(n => `<li class="${S.spiel.aufgaben[n] ? "done" : ""}"><span class="ck">${S.spiel.aufgaben[n] ? "✓" : ""}</span><span>${t("task" + n)}</span></li>`).join("");
  $("#starsTxt").textContent = "⭐ " + fmt(S.spiel.sterne); $("#bestTxt").textContent = fmt(S.spiel.best);
}

/* ===================== Start ===================== */
function navPlatz() { const pc = matchMedia("(min-width:960px)").matches, slot = $("#headNavSlot"), nav = $("#tabs"); if (pc && nav.parentElement !== slot) slot.appendChild(nav); else if (!pc && nav.parentElement === slot) document.body.insertBefore(nav, $("#sheet")); }
if (!S || S.v !== 2) { S = neuerZustand(); demoErzeugen(); Speicher.speichern(S); }
{ const sp = S.ich.sprache || (navigator.language || "de").slice(0, 2).toLowerCase(); LANG = LI[sp] !== undefined ? sp : "en"; }
window.addEventListener("resize", () => { navPlatz(); bildGroesse(); groesse(); spielGroesse(); spielBild(); });
navPlatz(); texteSetzen(); berechnen(); anzeigen(); bildGroesse(); aufgabenZeichnen();
requestAnimationFrame(schleife);
setInterval(() => { streichelBonus = Math.max(0, streichelBonus - 1); berechnen(); anzeigen(); }, 30000);
