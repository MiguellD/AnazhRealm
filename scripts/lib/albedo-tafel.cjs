// albedo-tafel.cjs — DIE ALBEDO-TAFEL LABOR ↔ WELT (S1 W1e, Gebot 10: die Klasse beim NAMEN, bevor ein Schnitt fällt).
// Befund (Synthese §2.2 b, Karten): das r128-Labor liest ein Paletten-Hex roh als lineare Albedo, die Welt (r184) liest
// die Albedo, die der Kern backt — wo das FARB-GESETZ (Lehre 21: Hex = sRGB-Absicht, Albedo = sein linearer Wert) erst im
// Ofen oder nur in der Welt greift, sieht der Schöpfer im Labor eine andere Farbe als im Spiel (Holz-Griff 0,10 ↔ 0,31,
// Karamell-Haut 1,4–3,0× je Kanal). Keine Linse maß das je Klasse an BEIDEN Seiten mit DERSELBEN Rechnung.
//
// DIE TAFEL (spec/farbe/albedo-tafel.json): je Klasse (Rinde · Laub · Fels · Boden · Haus · Metall/Lack · Haut/Fell ·
// Klinge) ein Exemplar im Labor (Studio · Vorlage · Stoff-Wähler) und in der Welt (Exemplar · Täter-Klasse · Stoff-Wähler),
// gemessen mit EINER Rechnung: Licht = nur ein weißes Umgebungslicht (Lambert: Ausgabe = Albedo), Albedo = Schuss hell −
// Schuss dunkel (Emission und jedes andere Licht fallen heraus), Metall für den Schuss 0 (die Basis-Albedo), gezählt jeder
// geschriebene Pixel (Alpha > 0), ausgewertet von `albedoAuswerten` (scripts/lib/licht-linsen.cjs — Welt und Labor lesen DIESELBE
// Funktion), selbst geeicht an der 18-%-Karte (liest 0,180 auf beiden Seiten). Je Zeile: Labor-Y, Welt-Y, das Verhältnis
// v = Labor / Welt und die Abweichung a = |ln v|.
//   RATSCHE  je Zeile die Abweichung des letzten Nachzugs — eine neue Messung darf nur näher an 1 (a ≤ Ratsche + Messrand);
//            sie ist die Wand, solange W5 (das FARB-GESETZ in jedem Kern) offen ist.
//   SOLL     a ≤ ln(1 + Toleranz) (die Toleranz steht in der Tafel, W5: „Albedo Lab ↔ Welt je Klasse innerhalb einer
//            gesetzten Toleranz") — benannt, gezählt (n von N innerhalb), nie Teil des Ratschen-Urteils.
//   KARTE    je Studio die 18-%-Karte unter dem Labor-Licht: k·L = Belichtung × Leuchtdichte (der Eingang der Tonkurve),
//            Soll 0,3147 (AnazhRealm.BELICHTUNG.zielKarte: Mittelgrau + 1 EV, Synthese W5 „die 18-%-Karte im Labor trifft
//            0,3147"), dazu der Pixel, den der Ausgabe-Weg des Labors zeigt (Welt: 173). Ratsche und Soll wie oben.
//
// Werkzeuge:  node scripts/werkbank.cjs albedo --tafel --datei welt.json     (die Welt-Seite, echte GPU, am Ort)
//             node scripts/diag-albedo-tafel.cjs --labor [--echt] --datei labor.json   (die Labor-Seite, r128 je Studio)
//             node scripts/diag-albedo-tafel.cjs --nachziehen welt.json labor.json     (setzt Ist, senkt die Ratsche)
//   Wand:     node scripts/diag-albedo-tafel.cjs [--selftest]   (npm run gate:albedo-tafel)
"use strict";
const fs = require("fs");
const path = require("path");
const { albedoAuswerten, stoffPasst, TAFEL_BLICKE } = require("./licht-linsen.cjs");

const ROOT = path.resolve(__dirname, "..", "..");
const TAFEL_PFAD = path.join(ROOT, "spec", "farbe", "albedo-tafel.json");

// Die acht Klassen des Studio-Befunds (Synthese §4 W1e) — jede trägt mindestens eine Zeile.
const PFLICHT_GRUPPEN = ["Rinde", "Laub", "Fels", "Boden", "Haus", "Metall/Lack", "Haut/Fell", "Klinge"];

// DIE STUDIOS des Labors (r128): Seite, die globalen Namen ihrer Szene, ihres Renderers, ihres Ausgabe-Wegs (der
// Composer oder der Renderer selbst) und die Bereitschaft. Jede Shell legt diese Namen als klassische Globale ab.
const STUDIOS = {
    terrain: { pfad: "worlds/terrain/index.html", szene: "scene", renderer: "renderer", ausgabe: "composer", wurzel: "subject" },
    garage: { pfad: "worlds/garage/index.html", szene: "scene", renderer: "R", ausgabe: null, wurzel: "vehicle" },
    portale: { pfad: "worlds/portale/index.html", szene: "scene", renderer: "renderer", ausgabe: "composer", wurzel: "gate" },
    schmiede: { pfad: "worlds/schmiede/index.html", szene: "scene", renderer: "R", ausgabe: "composer", wurzel: "weapon" },
    fachwerk: { pfad: "worlds/fachwerk/index.html", szene: "scene", renderer: "renderer", ausgabe: null, wurzel: "houseGroup" },
    koerperstudio: {
        pfad: "worlds/koerperstudio/index.html",
        szene: "scene",
        renderer: "renderer",
        ausgabe: "composer",
        wurzel: "character",
    },
    tetrapoda: { pfad: "worlds/tetrapoda/index.html", szene: "scene", renderer: "renderer", ausgabe: "composer", wurzel: "wolf" },
};

function ladeTafel(p) {
    return JSON.parse(fs.readFileSync(p || TAFEL_PFAD, "utf8"));
}

const zahl = (x) => typeof x === "number" && Number.isFinite(x);
const abweichung = (v) => (zahl(v) && v > 0 ? Math.abs(Math.log(v)) : null);

// Das Schema der Tafel. `ist`/`ratsche` dürfen null sein (ungemessen), sonst Zahlen; jede Pflicht-Gruppe trägt eine Zeile.
function tafelPruefen(t) {
    const f = [];
    if (!t || t.version !== 1) f.push("version ist nicht 1");
    if (!(zahl(t.toleranz) && t.toleranz > 0 && t.toleranz < 1)) f.push("toleranz (Soll-Rand Labor/Welt, 0..1) fehlt");
    if (!(zahl(t.messRand) && t.messRand >= 0 && t.messRand < 0.2)) f.push("messRand (Rand der Ratsche, 0..0,2) fehlt");
    if (!t.karte || t.karte.albedo !== 0.18 || !(zahl(t.karte.eichRand) && t.karte.eichRand > 0))
        f.push("karte {albedo 0.18, eichRand} fehlt (die Selbst-Eichung)");
    if (!t.belichtung || t.belichtung.zielKarte !== 0.3147) f.push("belichtung.zielKarte ist nicht 0.3147");
    const ids = new Set();
    for (const z of t.zeilen || []) {
        if (!z.id || !/^[a-z][a-z0-9-]*$/.test(z.id) || ids.has(z.id)) f.push(`Zeile ohne/mit doppelter id: ${z.id}`);
        ids.add(z.id);
        if (!PFLICHT_GRUPPEN.includes(z.gruppe)) f.push(`${z.id}: gruppe ${z.gruppe} ist keine der acht Klassen`);
        const L = z.labor || {};
        if (!STUDIOS[L.studio]) f.push(`${z.id}: labor.studio ${L.studio} unbekannt`);
        const W = z.welt || {};
        try {
            new RegExp(W.klasse);
            if (!W.klasse || !W.klasse.startsWith("^") || !W.klasse.endsWith("$")) f.push(`${z.id}: welt.klasse ohne Anker ^…$`);
        } catch (_e) {
            f.push(`${z.id}: welt.klasse ist kein Regex`);
        }
        const ex = W.exemplar || {};
        if (!["architektur", "tier", "spieler", "boden"].includes(ex.typ)) f.push(`${z.id}: welt.exemplar.typ unbekannt`);
        if ((ex.typ === "architektur" || ex.typ === "tier") && !ex.name) f.push(`${z.id}: welt.exemplar.name fehlt`);
        if (ex.radius !== undefined && !(zahl(ex.radius) && ex.radius > 0)) f.push(`${z.id}: welt.exemplar.radius ist keine Zahl > 0`);
        for (const sel of [L.stoff, W.stoff])
            if (sel)
                for (const k of ["r", "mt", "cc"])
                    if (sel[k] && !(Array.isArray(sel[k]) && sel[k].length === 2 && sel[k].every(zahl)))
                        f.push(`${z.id}: Stoff-Wähler ${k} ist kein [min, max]`);
        const ist = z.ist;
        if (ist !== null && ist !== undefined) {
            for (const s of ["labor", "welt"])
                if (!ist[s] || !zahl(ist[s].Y) || typeof ist[s].rgb !== "string") f.push(`${z.id}: ist.${s} {Y, rgb} fehlt`);
            if (!zahl(ist.verhaeltnis)) f.push(`${z.id}: ist.verhaeltnis fehlt`);
            else if (ist.labor && ist.welt && Math.abs(ist.verhaeltnis - ist.labor.Y / ist.welt.Y) > 1e-3 * ist.verhaeltnis)
                f.push(`${z.id}: ist.verhaeltnis ${ist.verhaeltnis} ist nicht Labor/Welt`);
        }
        if (z.ratsche !== null && z.ratsche !== undefined && !zahl(z.ratsche)) f.push(`${z.id}: ratsche ist weder null noch Zahl`);
    }
    for (const g of PFLICHT_GRUPPEN)
        if (!(t.zeilen || []).some((z) => z.gruppe === g)) f.push(`die Klasse ${g} trägt keine Zeile`);
    for (const [s, k] of Object.entries(t.karten || {})) {
        if (!STUDIOS[s]) f.push(`karten.${s}: Studio unbekannt`);
        if (k.ist !== null && k.ist !== undefined && !(zahl(k.ist.kL) && k.ist.kL > 0)) f.push(`karten.${s}: ist.kL fehlt`);
        if (k.ratsche !== null && k.ratsche !== undefined && !zahl(k.ratsche)) f.push(`karten.${s}: ratsche ist keine Zahl`);
    }
    for (const s of Object.keys(STUDIOS)) if (!(t.karten || {})[s]) f.push(`karten.${s} fehlt (jedes Studio misst seine Karte)`);
    if (t.gemessen !== null && t.gemessen !== undefined && (!t.gemessen.labor || !t.gemessen.welt))
        f.push("gemessen braucht {labor, welt} (Gerät, Datum, Ort der beiden Seiten)");
    return f;
}

// DAS URTEIL einer Messung (`messung` = { labor: {id: {Y, rgb}}, welt: {id: {Y, rgb}}, karten: {studio: {kL}},
// eichung: {labor: [Y …], welt: Y} }) gegen die Tafel: je Zeile v, a, Ratsche (ROT, wenn a über der Ratsche + Messrand),
// Soll (innerhalb Toleranz ja/nein). Eine Seite ohne Messung ist ROT (`stumm` — eine stille Linse ist nie grün).
function tafelUrteil(t, messung) {
    const rot = [];
    const randA = Math.log(1 + t.messRand);
    const sollA = Math.log(1 + t.toleranz);
    const zeilen = [];
    const eich = (messung && messung.eichung) || {};
    const eichOk = (y) => zahl(y) && Math.abs(y - t.karte.albedo) <= t.karte.eichRand;
    if (!eichOk(eich.welt)) rot.push({ art: "eichung", text: `Welt-Karte liest ${eich.welt} statt ${t.karte.albedo}` });
    for (const [s, y] of Object.entries(eich.labor || {}))
        if (!eichOk(y)) rot.push({ art: "eichung", text: `Labor-Karte ${s} liest ${y} statt ${t.karte.albedo}` });
    for (const z of t.zeilen) {
        const L = messung.labor && messung.labor[z.id];
        const W = messung.welt && messung.welt[z.id];
        const e = { id: z.id, gruppe: z.gruppe, titel: z.titel, labor: L || null, welt: W || null, ratsche: z.ratsche };
        if (!L || !zahl(L.Y) || !(L.Y > 0)) rot.push({ art: "stumm", text: `${z.id}: das Labor maß nichts (${(L && L.fehler) || "keine Zeile"})` });
        if (!W || !zahl(W.Y) || !(W.Y > 0)) rot.push({ art: "stumm", text: `${z.id}: die Welt maß nichts (${(W && W.fehler) || "keine Zeile"})` });
        if (L && W && L.Y > 0 && W.Y > 0) {
            e.verhaeltnis = +(L.Y / W.Y).toFixed(4);
            e.abweichung = +abweichung(e.verhaeltnis).toFixed(4);
            e.imSoll = e.abweichung <= sollA;
            if (zahl(z.ratsche) && e.abweichung > z.ratsche + randA)
                rot.push({
                    art: "ratsche",
                    text: `${z.id}: Labor/Welt ${e.verhaeltnis} (|ln| ${e.abweichung}) über der Ratsche ${z.ratsche} + Rand`,
                });
        }
        zeilen.push(e);
    }
    const karten = [];
    for (const [s, k] of Object.entries(t.karten || {})) {
        const m = messung.karten && messung.karten[s];
        const e = { studio: s, ist: m || null, ratsche: k.ratsche };
        if (!m || !(m.kL > 0)) rot.push({ art: "stumm", text: `Karte ${s}: das Labor maß keine Karte` });
        else {
            e.verhaeltnis = +(m.kL / t.belichtung.zielKarte).toFixed(4);
            e.abweichung = +abweichung(e.verhaeltnis).toFixed(4);
            e.imSoll = e.abweichung <= sollA;
            if (zahl(k.ratsche) && e.abweichung > k.ratsche + randA)
                rot.push({ art: "ratsche", text: `Karte ${s}: k·L ${m.kL} (|ln| ${e.abweichung} zu 0,3147) über der Ratsche ${k.ratsche}` });
        }
        karten.push(e);
    }
    const imSoll = zeilen.filter((z) => z.imSoll).length;
    const kartenImSoll = karten.filter((k) => k.imSoll).length;
    return {
        urteil: rot.length ? "ROT" : "GRUEN",
        rot,
        zeilen,
        karten,
        soll: { zeilen: `${imSoll}/${zeilen.length}`, karten: `${kartenImSoll}/${karten.length}`, toleranz: t.toleranz },
    };
}

// DER NACHZUG (nur aus einer Messung beider Seiten mit grüner Eichung und ohne stumme Zeile): Ist setzen, die Ratsche
// SENKEN (nie heben — eine Zeile über der Ratsche ist ROT, heben ist ein begründeter Akt von Hand im Commit).
function tafelNachziehen(t, messung, gemessen) {
    const u = tafelUrteil(t, messung);
    if (u.rot.some((r) => r.art === "eichung" || r.art === "stumm"))
        return { tafel: null, aenderungen: [], u, grund: "Eichung oder stumme Zeile — kein Nachzug" };
    const neu = JSON.parse(JSON.stringify(t));
    const aenderungen = [];
    for (const z of neu.zeilen) {
        const e = u.zeilen.find((x) => x.id === z.id);
        const knapp = (m) => ({ Y: m.Y, rgb: m.rgb, pixel: m.pixel });
        z.ist = { labor: knapp(e.labor), welt: knapp(e.welt), verhaeltnis: e.verhaeltnis };
        if (z.ratsche == null || e.abweichung < z.ratsche) {
            aenderungen.push(`${z.id}: ${z.ratsche == null ? "–" : z.ratsche} → ${e.abweichung}`);
            z.ratsche = e.abweichung;
        }
    }
    for (const k of u.karten) {
        const z = neu.karten[k.studio];
        z.ist = { kL: k.ist.kL, ausgabe: k.ist.ausgabe };
        if (z.ratsche == null || k.abweichung < z.ratsche) {
            aenderungen.push(`Karte ${k.studio}: ${z.ratsche == null ? "–" : z.ratsche} → ${k.abweichung}`);
            z.ratsche = k.abweichung;
        }
    }
    neu.gemessen = gemessen;
    return { tafel: neu, aenderungen, u };
}

function tafelTabelle(u) {
    const z = [];
    const pad = (s, n) => String(s).padEnd(n);
    const lpad = (s, n) => String(s).padStart(n);
    z.push(`ALBEDO LABOR ↔ WELT ${u.urteil} · im Soll (±${Math.round(u.soll.toleranz * 100)} %): ${u.soll.zeilen} Zeilen, ${u.soll.karten} Karten`);
    z.push("");
    z.push(pad("Zeile", 14) + pad("Klasse", 12) + lpad("Labor Y", 9) + lpad("Welt Y", 9) + lpad("L/W", 8) + lpad("Ratsche", 9) + "  Soll  Labor rgb · Welt rgb");
    for (const e of u.zeilen)
        z.push(
            pad(e.id, 14) +
                pad(e.gruppe, 12) +
                lpad(e.labor && zahl(e.labor.Y) ? e.labor.Y.toFixed(4) : "–", 9) +
                lpad(e.welt && zahl(e.welt.Y) ? e.welt.Y.toFixed(4) : "–", 9) +
                lpad(zahl(e.verhaeltnis) ? e.verhaeltnis.toFixed(2) : "–", 8) +
                lpad(zahl(e.ratsche) ? e.ratsche.toFixed(3) : "–", 9) +
                "  " +
                pad(e.imSoll ? "ja" : "nein", 5) +
                ` ${(e.labor && e.labor.rgb) || "–"} · ${(e.welt && e.welt.rgb) || "–"}`
        );
    z.push("");
    z.push(pad("Karte (18 %)", 16) + lpad("k·L", 8) + lpad("/0,3147", 9) + lpad("Ratsche", 9) + "  Soll  Ausgabe-Pixel (Welt 173)");
    for (const k of u.karten)
        z.push(
            pad(k.studio, 16) +
                lpad(k.ist && zahl(k.ist.kL) ? k.ist.kL.toFixed(4) : "–", 8) +
                lpad(zahl(k.verhaeltnis) ? k.verhaeltnis.toFixed(2) : "–", 9) +
                lpad(zahl(k.ratsche) ? k.ratsche.toFixed(3) : "–", 9) +
                "  " +
                pad(k.imSoll ? "ja" : "nein", 5) +
                ` ${k.ist && k.ist.ausgabe ? k.ist.ausgabe.join("/") : "–"}`
        );
    z.push("");
    for (const r of u.rot) z.push(`  [${r.art}] ${r.text}`);
    return z.join("\n");
}

// ── DIE LABOR-LINSE (r128, im Studio): dieselbe Rechnung wie die Welt-Tafel (`__albedoSicht({zeilen})`) ──────────────────
// Der Stoff eines Labor-Materials: seine Art (der Spiegel der Brücken-Zuordnung `__assetMaterialKind`, worlds/terrain/
// phytogenesis.js — die geteilten Pflanzen-Stoffe sind Globale der Pflanzen-Shell; sonst die Look-Klasse des Bäckers
// `userData.__klasse`), Rauheit, Metall, Klarlack und die Seh-Klasse des Gesetzbuchs (`userData.__seh`) — dieselben
// Felder, die die Brücke über die Naht reicht und der Wirt in seinen Stoff-Schlüssel schreibt.
function laborAlbedo(o) {
    return (async () => {
        const T = window.THREE;
        const g = (n) => (n ? new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)() : undefined);
        const R = g(o.studio.renderer),
            sc = g(o.studio.szene);
        const gl = R.getContext();
        gl.getExtension("EXT_color_buffer_float");
        const W = o.w || 640,
            H = o.h || 400;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const artOf = (m) => {
            if (m && (m === g("barkMat") || m === g("barkMatBirch"))) return "bark";
            if (m && m === g("foliageMatTex")) return "foliageTex";
            if (m && m === g("foliageMat")) return "foliage";
            if (m && m === g("grassMat")) return "grass";
            if (m && m === g("stemMat")) return "stem";
            const k = m && m.userData && m.userData.__klasse;
            return typeof k === "string" ? k : "unknown";
        };
        const stoffOf = (m) => ({
            kind: artOf(m),
            r: m.roughness,
            mt: m.metalness,
            cc: m.clearcoat || 0,
            seh: (m.userData && m.userData.__seh) || null,
        });
        const matsOf = (x) => (Array.isArray(x.material) ? x.material : [x.material]).filter(Boolean);
        const alleMeshes = [];
        sc.traverse((x) => {
            if (x.isMesh || x.isPoints || x.isLine || x.isSprite) alleMeshes.push(x);
        });
        const unter = (x, w) => {
            for (let p = x; p; p = p.parent) if (p === w) return true;
            return false;
        };
        const karte = new T.Mesh(
            new T.PlaneGeometry(2, 2),
            new T.MeshStandardMaterial({ color: new T.Color(0.18, 0.18, 0.18), roughness: 1, metalness: 0, side: T.DoubleSide })
        );
        const rt = new T.WebGLRenderTarget(W, H, { type: T.HalfFloatType, format: T.RGBAFormat, depthBuffer: true });
        const cam = new T.PerspectiveCamera(35, W / H, 0.01, 4000);
        const amb = new T.AmbientLight(0xffffff, 0);
        const lichter = [];
        sc.traverse((x) => {
            if (x.isLight) lichter.push([x, x.intensity]);
        });
        const alt = {
            fog: sc.fog,
            bg: sc.background,
            env: sc.environment,
            tm: R.toneMapping,
            rt: R.getRenderTarget(),
            vis: new Map(alleMeshes.map((x) => [x, x.visible])),
            matVis: new Map(),
            metall: new Map(),
        };
        // Lambert unter dem Umgebungslicht: r128 trägt π im Legacy-Modus selbst (Ausgabe = Farbe × Albedo), mit
        // physikalischen Lichtern ist die Stärke π nötig — die Karte prüft beides (0,180).
        const AMB = R.physicallyCorrectLights ? Math.PI : 1;
        // WebGL liest von unten nach oben — die Zeilen kehren um (das Bild steht wie in der Welt aufrecht).
        const lies = () => {
            const roh = new Float32Array(W * H * 4);
            gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, roh);
            const out = new Float32Array(W * H * 4);
            for (let y = 0; y < H; y++) out.set(roh.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
            return out;
        };
        const schuss = (sicht) => {
            for (const x of alleMeshes) x.visible = !!alt.vis.get(x) && sicht(x);
            for (const [l] of lichter) l.intensity = 0;
            sc.fog = null;
            sc.background = null;
            sc.environment = null;
            R.toneMapping = T.NoToneMapping;
            const pass = (e) => {
                amb.intensity = e;
                R.setRenderTarget(rt);
                R.setClearColor(0x000000, 0);
                R.clear();
                R.render(sc, cam);
                const px = lies();
                R.setRenderTarget(null);
                return px;
            };
            pass(AMB);
            return { hell: pass(AMB), dunkel: pass(0) };
        };
        // Die Stellungen der Kamera: wie in der Welt die TAFEL-BLICKE auf die Hülle der gewählten Züge, oder von oben.
        const stellungenFuer = (sel, blick) => {
            const bb = new T.Box3();
            for (const x of sel) bb.expandByObject(x);
            const c = bb.getCenter(new T.Vector3());
            if (blick === "oben") {
                // Der Boden von oben: der Mittelpunkt ist der Ort des Labor-Blicks (im Wald der Spieler), die Höhe der
                // Strahl auf die gewählten Züge.
                const lc = g("camera") ? g("camera").position : c;
                const ray = new T.Raycaster(new T.Vector3(lc.x, 1e4, lc.z), new T.Vector3(0, -1, 0));
                const hit = ray.intersectObjects(sel, false)[0];
                const y = hit ? hit.point.y : c.y;
                return [[new T.Vector3(lc.x, y + 14, lc.z + 0.01), new T.Vector3(lc.x, y, lc.z)]];
            }
            const rad = Math.max(0.4, bb.getSize(new T.Vector3()).length() / 2);
            return window.__tafelBlicke.map((d) => [
                c.clone().addScaledVector(new T.Vector3(d[0], d[1], d[2]).normalize(), rad * 2.6),
                c,
            ]);
        };
        sc.add(amb);
        const ergebnisse = [];
        try {
            for (const z of o.zeilen || []) {
                const L = z.labor || {};
                const wurzel = g(L.wurzel || o.studio.wurzel);
                const nur = (L.nur || []).map(g),
                    ohne = (L.ohne || []).map(g);
                const passtMat = (m) =>
                    window.__stoffPasst(L.stoff || null, stoffOf(m)) &&
                    (!nur.length || nur.includes(m)) &&
                    !ohne.includes(m);
                const sel = alleMeshes.filter((x) => alt.vis.get(x) && wurzel && unter(x, wurzel) && matsOf(x).some(passtMat));
                if (!sel.length) {
                    ergebnisse.push({ id: z.id, pixel: 0, fehler: "kein Zug mit passendem Stoff unter " + (L.wurzel || o.studio.wurzel) });
                    continue;
                }
                // Gemischte Züge (Material-Liste): die fremden Stoffe des Zugs sind für den Schuss unsichtbar.
                for (const x of sel)
                    for (const m of matsOf(x)) {
                        if (!passtMat(m) && !alt.matVis.has(m)) {
                            alt.matVis.set(m, m.visible);
                            m.visible = false;
                        }
                        if (passtMat(m) && z.basis !== false && typeof m.metalness === "number" && !alt.metall.has(m)) {
                            alt.metall.set(m, m.metalness);
                            m.metalness = 0;
                        }
                    }
                const stellungen = stellungenFuer(sel, L.blick);
                const set = new Set(sel);
                const s = {
                    hell: new Float32Array(W * H * 4 * stellungen.length),
                    dunkel: new Float32Array(W * H * 4 * stellungen.length),
                };
                stellungen.forEach(([p, ziel], i) => {
                    cam.position.copy(p);
                    cam.lookAt(ziel);
                    cam.updateMatrixWorld(true);
                    const t = schuss((x) => set.has(x));
                    s.hell.set(t.hell, i * W * H * 4);
                    s.dunkel.set(t.dunkel, i * W * H * 4);
                });
                for (const [m, v] of alt.matVis) m.visible = v;
                alt.matVis.clear();
                for (const [m, v] of alt.metall) m.metalness = v;
                alt.metall.clear();
                const stoffe = [...new Set(sel.flatMap((x) => matsOf(x).filter(passtMat).map((m) => JSON.stringify(stoffOf(m)))))];
                ergebnisse.push(
                    Object.assign(window.__albedoAuswerten(s.hell, s.dunkel, W, H * stellungen.length, 0, z.id), {
                        id: z.id,
                        zuege: sel.length,
                        stoffe,
                    })
                );
            }
            // Die Selbst-Eichung: die 18-%-Karte liest unter demselben Licht 0,180.
            sc.add(karte);
            alleMeshes.push(karte);
            alt.vis.set(karte, true);
            karte.position.set(0, 50, 0);
            karte.updateMatrixWorld(true);
            cam.position.set(0, 50, 2.2);
            cam.lookAt(0, 50, 0);
            cam.updateMatrixWorld(true);
            const sk = schuss((x) => x === karte);
            ergebnisse.push(window.__albedoAuswerten(sk.hell, sk.dunkel, W, H, 0, "graukarte"));
        } finally {
            for (const [m, v] of alt.matVis) m.visible = v;
            for (const [m, v] of alt.metall) m.metalness = v;
            for (const x of alleMeshes) if (alt.vis.has(x)) x.visible = alt.vis.get(x);
            for (const [l, i] of lichter) l.intensity = i;
            sc.remove(amb);
            sc.remove(karte);
            sc.fog = alt.fog;
            sc.background = alt.bg;
            sc.environment = alt.env;
            R.toneMapping = alt.tm;
            R.setRenderTarget(alt.rt);
            rt.dispose();
        }
        await sleep(0);
        return ergebnisse;
    })();
}

// DIE KARTE IM LABOR: eine waagrechte 18-%-Karte am Ort des Exemplars, allein (alles andere aus, kein Nebel), unter dem
// Licht des Labors wie es steht (Lichter, Umgebung, Belichtung). k·L = Belichtung × Leuchtdichte: die Tonkurve linear
// (r128 `LinearToneMapping` = Belichtung × Farbe) in ein Halb-Float-Ziel. Dazu der Pixel, den der Ausgabe-Weg des Labors
// (sein Composer bzw. der Renderer auf den Schirm) für dieselbe Karte zeigt.
function laborKarte(o) {
    return (async () => {
        const T = window.THREE;
        const g = (n) => (n ? new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)() : undefined);
        const R = g(o.studio.renderer),
            sc = g(o.studio.szene);
        const gl = R.getContext();
        gl.getExtension("EXT_color_buffer_float");
        const W = 64,
            H = 64;
        const wurzel = g(o.studio.wurzel);
        const bb = new T.Box3();
        if (wurzel) bb.setFromObject(wurzel);
        const c = bb.isEmpty() ? new T.Vector3() : bb.getCenter(new T.Vector3());
        const y0 = bb.isEmpty() ? 0 : bb.min.y + 0.02;
        const karte = new T.Mesh(
            new T.PlaneGeometry(2, 2),
            new T.MeshStandardMaterial({ color: new T.Color(0.18, 0.18, 0.18), roughness: 1, metalness: 0 })
        );
        karte.rotation.x = -Math.PI / 2;
        karte.position.set(c.x, y0, c.z);
        karte.updateMatrixWorld(true);
        const cam = new T.PerspectiveCamera(35, 1, 0.01, 100);
        cam.position.set(c.x, y0 + 2, c.z + 0.001);
        cam.lookAt(c.x, y0, c.z);
        cam.updateMatrixWorld(true);
        const alle = [];
        sc.traverse((x) => {
            if (x.isMesh || x.isPoints || x.isLine || x.isSprite) alle.push(x);
        });
        const vis = new Map(alle.map((x) => [x, x.visible]));
        const alt = { fog: sc.fog, tm: R.toneMapping, rt: R.getRenderTarget() };
        const rt = new T.WebGLRenderTarget(W, H, { type: T.HalfFloatType, format: T.RGBAFormat, depthBuffer: true });
        const out = { studio: o.studioId, belichtung: R.toneMappingExposure, physikalisch: !!R.physicallyCorrectLights };
        try {
            for (const x of alle) x.visible = false;
            sc.add(karte);
            sc.fog = null;
            R.toneMapping = T.LinearToneMapping;
            R.setRenderTarget(rt);
            R.setClearColor(0x000000, 0);
            R.clear();
            R.render(sc, cam);
            const px = new Float32Array(W * H * 4);
            gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, px);
            R.setRenderTarget(null);
            const s = [0, 0, 0];
            let n = 0;
            for (let y = H / 2 - 4; y < H / 2 + 4; y++)
                for (let x = W / 2 - 4; x < W / 2 + 4; x++) {
                    for (let k = 0; k < 3; k++) s[k] += px[(y * W + x) * 4 + k];
                    n++;
                }
            const m = s.map((v) => v / n);
            out.kL = +(0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]).toFixed(4);
            out.kLrgb = m.map((v) => +v.toFixed(4)).join("/");
            // Der Ausgabe-Weg des Labors: seine Tonkurve und sein Composer (dessen Pässe kurz auf die Karten-Kamera sehen).
            R.toneMapping = alt.tm;
            const comp = o.studio.ausgabe ? g(o.studio.ausgabe) : null;
            const kams = [];
            if (comp && comp.passes) {
                for (const p of comp.passes)
                    if (p && p.camera) {
                        kams.push([p, p.camera]);
                        p.camera = cam;
                    }
                const groesse = R.getSize(new T.Vector2());
                cam.aspect = groesse.x / groesse.y;
                cam.updateProjectionMatrix();
                comp.render();
            } else {
                const groesse = R.getSize(new T.Vector2());
                cam.aspect = groesse.x / groesse.y;
                cam.updateProjectionMatrix();
                R.render(sc, cam);
            }
            const db = R.getDrawingBufferSize(new T.Vector2());
            const u8 = new Uint8Array(4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.readPixels(Math.floor(db.x / 2), Math.floor(db.y / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, u8);
            out.ausgabe = [u8[0], u8[1], u8[2]];
            for (const [p, k] of kams) p.camera = k;
        } finally {
            for (const x of alle) x.visible = vis.get(x);
            sc.remove(karte);
            sc.fog = alt.fog;
            R.toneMapping = alt.tm;
            R.setRenderTarget(alt.rt);
            rt.dispose();
        }
        return out;
    })();
}

const LABOR_INSTALL =
    `window.__albedoAuswerten = ${albedoAuswerten.toString()};` +
    `window.__stoffPasst = ${stoffPasst.toString()};` +
    `window.__tafelBlicke = ${JSON.stringify(TAFEL_BLICKE)};` +
    `window.__laborAlbedo = ${laborAlbedo.toString()};` +
    `window.__laborKarte = ${laborKarte.toString()};`;

module.exports = {
    TAFEL_PFAD,
    PFLICHT_GRUPPEN,
    STUDIOS,
    ladeTafel,
    tafelPruefen,
    tafelUrteil,
    tafelNachziehen,
    tafelTabelle,
    abweichung,
    LABOR_INSTALL,
};
