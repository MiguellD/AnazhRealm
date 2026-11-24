// KARTE 2 · ERLEBEN — die Leitern erleben.* (vision/meisterkarte-2.json): je Leiter EINE Station — EIN Messprogramm über alle Sprossen, ihre
// Sprossen als Zwillinge derselben Probe (staffel = die Sprosse) — über DAS LEITER-GERÜST in k2-same.js (das Gesetz der Leiter,
// die Arten gemessen · umfang · leser · auge, die Wand des Wortlauts, der Selbsttest je Sprosse). Der Preis jeder Sprosse kommt
// aus dem Strom der Sitzung (richter-akte.cjs), an der dichtesten Pose, an der die Probe endet.
"use strict";
const { leiter } = require("./k2-same.js").geruest;
const { SAATEN } = require("./sitzung-seite.js");
const { FAECHER } = require("./faecher.js");
const LEITERN = [];

// DIE LANDMARKE AN EINER ADRESSE (erleben.spieler.wegfindung#1, das Gesetz des Fächers, stationen/faecher.js): a.saat ist die Saat.
// Der Wurf der Landmarke (stamm/vegetation-baum.js:1534, im Landmarken-Pass von `_vegetationSampleSpawn` :1482, gerufen je Probe des
// Chunks :2607) liest die GELADENE Welt — das Feld über `_saatJe(this)` = worldMeta.seed (stamm/feld-leben.js:1805), das Land der Spalte
// (`_landAt`), die Feuchte aus der Hydrosphäre des Fadens (`_hydroDistAt`, stamm/gelaende-boden.js:1619) und die Höhe des gebauten
// Meshs (`_voxelSurfaceY`). An der geladenen Saat zählt das Gesetz, was der Wurf trug (r.state.architectures: felsturm/felsbogen in
// 1–3 km, davon im Kegel der Kamera); jede andere Saat ist keine Funktion, die die warme Welt rufen kann — sie nennt das Fehlende
const LANDMARKE_AN = async (r, T, a) => {
    const st = r.state;
    if (!st.worldMeta || a.saat !== st.worldMeta.seed)
        return { fehlt: "der Wurf der Landmarke ist keine Funktion der Saat: stamm/vegetation-baum.js:1482 _vegetationSampleSpawn liest die geladene Welt (_saatJe → worldMeta.seed, _landAt, _hydroDistAt, _voxelSurfaceY)" };
    r._loopCamera(performance.now());
    const cam = st.camera;
    cam.updateMatrixWorld(true);
    const F = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const p = st.playerMesh.position;
    let n13 = 0, imBild = 0;
    for (const e of st.architectures || []) {
        if (!e || typeof e.type !== "string" || !e.position || !(e.type.indexOf("felsturm") === 0 || e.type.indexOf("felsbogen") === 0)) continue;
        const d = Math.hypot(e.position.x - p.x, e.position.z - p.z);
        if (d < 1000 || d > 3000) continue;
        n13++;
        if (F.containsPoint(new T.Vector3(e.position.x, e.position.y, e.position.z))) imBild++;
    }
    return { n13, imBild, treffer: imBild > 0 ? 1 : 0, geladen: (st.architectures || []).length, x: p.x, z: p.z };
};

// ─────────── DIE GESETZE DER SPIELER-ADRESSEN (BUEHNE Spieler, M4: der Richter stellt keine Spieler auf) ───────────
// Je Adresse (Saat × Ort × Zeit × Rolle) ruft die Funktion, was das Spiel an dieser Adresse liest; sie rechnet nichts nach. Jede
// reist als Text in die Seite (H.seite.NAME) und sieht nur r, T, a.

// DIE FREIE LAGE (erleben.bild.kamera#1): a = { saat, lage: [dx, dy, dz] vom Leib, gier, kontrolle? }. Ob die Welt an einer Lage
// gezeichnet ist, sagt `_chunkGezeichnet` (stamm/gelaende-fern.js:1468) am Eintrag der Chunk-Karte `state.voxelChunks` — dieselbe
// Frage, die die Maske des Fern-Rings stellt (`_fernRingMaske` :1497). Eine Kamera in RUHE an der Lage trüge den Ring derselben Stufe
// um sich (`_voxelChunkConfig(0)`, stamm/gelaende-boden.js:2856: ringRadius × Spanne); gezählt wird je Boden-Probe (6 m) dieses
// Rings im waagrechten Kegel der Lage (Bildwinkel der Welt-Kamera × Seitenverhältnis, die Richtung aus `_blickVorn`
// stamm/koerper-bewegung.js:1645 — wie der Blick des ersten Bilds `_imErstenBlick` stamm/dirigent-ankunft.js:1065), ob ihr Chunk
// gezeichnet ist. Die Lücke ist der Anteil ohne. Die Kamera wird nie bewegt (das zöge `_lodAuge` und den Strom).
const KAMERA_AN = async (r, T, a) => {
    const st = r.state;
    if (!st.worldMeta || a.saat !== st.worldMeta.seed) return { fehlt: "die Residenz der Chunks lebt nur für die geladene Saat (state.voxelChunks, stamm/gelaende-chunks.js:2803 _tickVoxelChunkStreaming)" };
    if (!st.voxelChunks || !st.playerMesh) return { fehlt: "die Welt trägt keine Chunk-Karte (state.voxelChunks) oder keinen Leib" };
    const cfg = r._voxelChunkConfig(0), span = cfg.span, reich = (cfg.ringRadius + 0.5) * span;
    const p = st.playerMesh.position, cam = st.camera;
    const x0 = p.x + a.lage[0], z0 = p.z + a.lage[2];
    const halb = Math.atan(Math.tan(((cam && cam.fov > 0 ? cam.fov : 75) * Math.PI) / 360) * (cam && cam.aspect > 0 ? cam.aspect : 16 / 9));
    const v = r._blickVorn(a.gier, 0);
    let n = 0, luecke = 0;
    for (let dx = -reich; dx <= reich; dx += 6)
        for (let dz = -reich; dz <= reich; dz += 6) {
            const d = Math.hypot(dx, dz);
            if (d < 2 || d > reich || Math.acos(Math.max(-1, Math.min(1, (dx * v.x + dz * v.z) / d))) > halb) continue;
            n++;
            if (!r._chunkGezeichnet(st.voxelChunks.get(Math.floor((x0 + dx) / span) + "," + Math.floor((z0 + dz) / span)))) luecke++;
        }
    return { n, luecke_pct: n ? +((100 * luecke) / n).toFixed(2) : null, chunks: st.voxelChunks.size, ring: cfg.ringRadius, span };
};

// WAS AN EINEM ORT STEHT (erleben.sinn.staunen#1): a = { saat, radius, mutante? } um den Leib. Gelesen wird, was die Welt dort trägt
// und zeichnet: die Werke `state.architectures` (der Wurf der Natur `_vegetationSampleSpawn` stamm/vegetation-baum.js:1482, die
// Bauten über `spawnArchitecture` stamm/siedlung-satz.js:1257; gezeichnet bis 150 m vom Spieler, stamm/dirigent-ankunft.js:1233), die
// Arten der Natur (`_istNatur`, `_lodSpecies`), die Bau-Arten und die Wesen `state.creatures`. „statisch“ sind Natur und Bau: kein
// Gesetz bewegt sie; ein Wesen wird relativ zum Spieler geboren (`_kreaturGeburtsOrt` stamm/kreatur-leben.js:1785).
const STAUNEN_AN = async (r, T, a) => {
    const st = r.state;
    if (!st.worldMeta || a.saat !== st.worldMeta.seed)
        return { fehlt: "was an einem Ort steht, ist keine Funktion der Saat: Streu, Wald und Siedlung lesen die geladene Welt (stamm/vegetation-streu.js:28 _saatJe, stamm/siedlung-ort.js:1433)" };
    if (!st.playerMesh) return { fehlt: "kein Leib an der Ankunft" };
    const p = st.playerMesh.position, d = (q) => Math.hypot(q.x - p.x, q.z - p.z);
    const A = (st.architectures || []).filter((e) => e && e.position && d(e.position) <= a.radius);
    const natur = [...new Set(A.filter((e) => r._istNatur(e)).map((e) => e._lodSpecies || e.type))];
    const bau = [...new Set(A.filter((e) => !r._istNatur(e)).map((e) => e.type))];
    const wesen = [...new Set((st.creatures || []).filter((c) => c && c.position && d(c.position) <= a.radius).map((c) => (c.userData && (c.userData.soul || c.userData.kind)) || "wesen"))];
    return { dinge: natur.length + bau.length + wesen.length, statisch: natur.length + bau.length, natur: natur.length, bau: bau.length, wesen: wesen.length, werke: A.length, namen: natur.concat(bau, wesen).slice(0, 16).join(",") };
};

// DIE ANKUNFT EINES NEULINGS (erleben.sinn.sog#1): a = { saat, kontrolle? }. Der Ort der Ankunft ist EIN Plan des Ort-Gesetzes
// (`genesisLayout(genesisSaat(saat), welten)`, fachwerk-core.js:13075 — rein in der Saat; Leser: der Voxel-Faden voxel-worker.js:1375).
// Was der Neuling zuerst hört, ist der erste Satz des Begleiters (Pool `firstSpawn` stamm/dirigent-kern.js:458 → „begleiter.erstes“,
// stamm/daten.js:2833; gesprochen von `grokMarkFirstSpawn` stamm/werkstatt-hud.js:101). Das Prädikat: nennt dieser Satz eine Tat —
// eine Taste der Belegung (`_formatBindingCode` über KEYBINDING_ACTIONS) oder einen Satz der Hilfe (`hilfe` der Muster, wie
// `_hilfeZeilen` stamm/feld-leben.js:1664 sie liest)? An der Kontrolle steht statt des Grußes die Hilfe selbst: dort muss es tragen.
const SOG_AN = async (r, T, a) => {
    const st = r.state, K = r.constructor, FC = globalThis.__fachwerkCore;
    if (!FC || typeof FC.genesisLayout !== "function") return { fehlt: "der Kern trägt kein Ort-Gesetz der Ankunft (fachwerk-core genesisLayout)" };
    const plan = FC.genesisLayout(FC.genesisSaat(a.saat), r._genesisWelten());
    const hilfe = r._hilfeZeilen().map((z) => r._t(z[0], z[1]));
    const gruss = a.kontrolle ? hilfe.join(" ") : r._t(st.grok.pool.firstSpawn[0][0]);
    const kb = st.keybindings || K.DEFAULT_KEYBINDINGS;
    const tasten = [];
    for (const x of K.KEYBINDING_ACTIONS) for (const t of String(r._formatBindingCode(kb[x] || K.DEFAULT_KEYBINDINGS[x]) || "").split(" / ")) if (t.trim()) tasten.push(t.trim().toLowerCase());
    const probier = [];
    for (const q of (r.chatDslPatterns || []).concat(r.chatSystemPatterns || [])) if (Array.isArray(q.hilfe)) for (const b of q.hilfe) probier.push(String(b).toLowerCase());
    const g = gruss.toLowerCase();
    const frei = (t) => new RegExp("(^|[^\\p{L}\\p{N}])" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^\\p{L}\\p{N}])", "u").test(g);
    const taste = tasten.find(frei) || null, satz = probier.find((b) => g.includes(b)) || null;
    return { nennt: taste || satz ? 1 : 0, taste, satz, tore: (plan.tore || []).length, stationen: (plan.stationen || []).length, gruss: gruss.slice(0, 80) };
};

// DER ERSTE WUNSCH EINES NEULINGS (erleben.schoepfen.gespraech#1): a = { satz, sprache }. Die Kette, die das Spiel liest: der Satz →
// das Programm (`parseChatToDsl` stamm/feld-sprache.js:545; Leser `_chatTryDslParse` stamm/feld-leben.js:910 → `dslRun`; ohne
// Programm die KI `maybeAnswerWithLlm` :1603) → das Werk (`spawn_studio` → `_spawnStudioWerk` stamm/feld-dsl.js:2028 über
// `_studioBlueprintForWord` stamm/studio-wort.js:289, Same baseSeed + i) → der Code (`_werkCode({ programm: _werkReise(name) })`
// stamm/netz-identitaet.js:617/666, wie `teileWerk` :651 ihn ohne Dialog baut). „eigen“: der Code trägt den Samen des gesetzten Werks
// (sonst steht beim Empfänger ein anderes). Der Same-Zähler `worldMeta.bauSame`, den der Parser hochzählt, kehrt zurück.
const NEULING_AN = async (r, T, a) => {
    const st = r.state, wm = st.worldMeta || {}, bs = JSON.stringify(wm.bauSame || {});
    let p = null;
    try {
        p = r.parseChatToDsl(a.satz);
    } finally {
        wm.bauSame = JSON.parse(bs);
    }
    const prog = p && Array.isArray(p.program) ? p.program : null;
    const nein = (weg, erschafft) => ({ ganz: 0, erschafft: erschafft ? 1 : 0, teilt: 0, eigen: 0, weg });
    if (!prog) {
        const llm = st.llm || {}, defs = r.llmProviderDefs ? r.llmProviderDefs() : {}, def = defs[llm.provider], cfg = (llm.providerConfig || {})[llm.provider] || {};
        const ki = !def ? "llm.fehler.provider" : !llm.enabled ? "llm.fehler.aus" : def.requiresKey && !cfg.apiKey ? "llm.fehler.schluessel" : null;
        if (!ki) return { fehlt: "der Satz geht an die KI (stamm/feld-leben.js:1603 maybeAnswerWithLlm) — der Richter ruft kein Modell" };
        return nein("kein Programm, die KI fehlt (" + ki + ")");
    }
    if (prog[0] !== "spawn_studio") return nein("Verb " + prog[0] + ", kein Werk");
    const name = r._studioBlueprintForWord(String(prog[1] == null ? "" : prog[1]));
    if (!name) return nein("das Wort „" + prog[1] + "“ trägt kein Werk");
    if (!(st.blueprints && st.blueprints[name])) return nein("das Werk " + name + " hat keinen Bauplan (teileWerk: unbekannt)", true);
    if (!st.vibePass || !st.vibePass.ready) return { fehlt: "der Vibe-Pass ist nicht bereit (stamm/netz-identitaet.js:655 no_vibepass)" };
    const c = await r._werkCode({ programm: r._werkReise(name) });
    if (!c || !c.ok) return nein("der Code fällt: " + (c && c.grund), true);
    const pr = JSON.parse(c.huelle).programm;
    const sp = Array.isArray(pr) && pr[0] === "chain" ? pr.find((x) => Array.isArray(x) && x[0] === "spawn_blueprint") : pr;
    const seedCode = Array.isArray(sp) && sp[3] != null ? Number(sp[3]) >>> 0 : null, seedWerk = prog[4] != null ? Number(prog[4]) >>> 0 : null;
    const eigen = seedCode != null && seedCode === seedWerk ? 1 : 0;
    return { ganz: eigen, erschafft: 1, teilt: 1, eigen, weg: eigen ? "ganz" : "geteilt mit Same " + seedCode + ", gesetzt mit " + seedWerk, name, zeichen: c.code.length };
};

// EIN ZIEL DER HAND (erleben.spieler.hand#1, das Gesetz des Fächers): a = { pitch, gier } — ein Strahl vom Auge der Welt-Kamera
// (Ego, nie bewegt) in die Richtung `_blickVorn(gier, pitch)` (stamm/koerper-bewegung.js:1645), 30 m wie `_raycastWorldHit(30)`.
// Der TREFFER ist, wo die Tat wirkt: `_fieldRaycast` (stamm/gelaende-chunks.js:2339, der Strahl durch das Dichtefeld samt Edits —
// derselbe, den `tryMouseBreak` stamm/kampf.js:2371 über `_runRaycast` stamm/gelaende-boden.js:3281 liest). Das ZIEL ist, was das
// Fadenkreuz zeigt: der Schnitt desselben Strahls mit den gezeichneten Gelände-Meshes (`_chunkGezeichnet`, binnen 45 m) — gemessen
// mit dem Raycaster von THREE an der Geometrie, die die Welt zeichnet (das Messgerät, kein Gesetz). Die Zelle ist der Schritt der
// feinen Stufe (`_voxelChunkConfig(0).step`, stamm/gelaende-boden.js:2856).
const HAND_AN = async (r, T, a) => {
    const st = r.state;
    if (!st.voxelChunks || !st.voxelChunks.size || !st.camera) return { fehlt: "die Welt trägt keine gebauten Chunks (state.voxelChunks leer) — kein gezeichnetes Ziel" };
    const c = st.camera.position, v = r._blickVorn(a.gier, a.pitch), weit = 30;
    const hit = r._fieldRaycast(c.x, c.y, c.z, c.x + v.x * weit, c.y + v.y * weit, c.z + v.z * weit, { durchPflanzen: true });
    const meshes = [];
    for (const e of st.voxelChunks.values()) if (r._chunkGezeichnet(e) && e.mesh.position && Math.hypot(e.mesh.position.x - c.x, e.mesh.position.z - c.z) < 45 + 64) meshes.push(e.mesh);
    if (!meshes.length) return { fehlt: "kein gezeichneter Chunk binnen 45 m um das Auge (`_chunkGezeichnet` stamm/gelaende-fern.js:1468)" };
    for (const m of meshes) m.updateMatrixWorld(true);
    const z = new T.Raycaster(new T.Vector3(c.x, c.y, c.z), new T.Vector3(v.x, v.y, v.z).normalize(), 0, weit).intersectObjects(meshes, true)[0];
    const step = r._voxelChunkConfig(0).step, trifft = !!(hit && hit.hit);
    if (!trifft && !z) return { leer: 1 };
    if (!trifft || !z) return { zellen: 99, d_m: null, step, nur: trifft ? "Treffer ohne gezeichnetes Ziel" : "gezeichnetes Ziel ohne Treffer" };
    const d = Math.hypot(hit.x - z.point.x, hit.y - z.point.y, hit.z - z.point.z);
    return { zellen: +(d / step).toFixed(3), d_m: +d.toFixed(3), step, dy: +(hit.y - z.point.y).toFixed(3) };
};

// EIN SATZ DES KORPUS (erleben.schoepfen.satz#1, das Gesetz des Fächers): a = { satz, still } — ein Satz des eingefrorenen Korpus
// (spec/abnahme/ki-korpus.json; still: der Satz verlangt keine Tat). Der Weg, den das Spiel liest (stamm/feld-leben.js:671–673): erst
// die Regel (`_regelAusSatz` stamm/feld-sprache.js:568), dann das Programm (`parseChatToDsl` :545); ohne beides die KI
// (`maybeAnswerWithLlm` stamm/feld-leben.js:1603 — der Richter ruft kein Modell: ist die KI bereit, zählt der Satz ohne Fähigkeit).
// Gültig: ein Satz mit Tat trägt ein Programm, ein stiller keines; ein Wurf des Parsers ist ein Bruch, über 100 ms ein Hänger (die
// Uhr der Seite um den Ruf). Der Same-Zähler `worldMeta.bauSame` kehrt zurück.
const SATZ_AN = async (r, T, a) => {
    const st = r.state, wm = st.worldMeta || {}, bs = JSON.stringify(wm.bauSame || {});
    let p = null, bruch = 0;
    const t0 = performance.now();
    try {
        const q = typeof r._regelAusSatz === "function" ? r._regelAusSatz(a.satz) : null;
        p = q && Array.isArray(q.program) ? q : r.parseChatToDsl(a.satz);
    } catch (e) {
        bruch = 1;
    } finally {
        wm.bauSame = JSON.parse(bs);
    }
    const ms = performance.now() - t0;
    const prog = p && Array.isArray(p.program) ? p.program : null;
    const llm = st.llm || {}, defs = r.llmProviderDefs ? r.llmProviderDefs() : {}, def = defs[llm.provider], cfg = (llm.providerConfig || {})[llm.provider] || {};
    const ki = !def ? "llm.fehler.provider" : !llm.enabled ? "llm.fehler.aus" : def.requiresKey && !cfg.apiKey ? "llm.fehler.schluessel" : null;
    if (!prog && !bruch && !a.still && !ki) return { fehlt: "der Satz geht an die KI (stamm/feld-leben.js:1603 maybeAnswerWithLlm) — der Richter ruft kein Modell" };
    return { gueltig: bruch ? 0 : a.still ? (prog ? 0 : 1) : prog ? 1 : 0, bruch, haenger: ms > 100 ? 1 : 0, ms: +ms.toFixed(2), verb: prog ? String(prog[0]) : null, ki: ki || "bereit" };
};

// DIE LUFT EINES WETTERS (erleben.bild.ferne#1, das Gesetz des Fächers): a = { wetter } — ein Wort der Wetter-Tabelle
// (`WEATHER_FIELD`, stamm/daten.js:122) oder a.feld (die Mutante: ein Feld ohne Dunst und Regen). Die CPU-Eingänge des Knotens der
// Luft: β am Bezugs-Niveau (`_luftBeta(wf)` stamm/bild-himmel.js:2473) und die Extinktion je Kanal relativ zu β (`_luftSpektrum`
// :2492); die Sicht V = −ln(LUFT.kontrast)/β (derselbe Weg wie `_luftSichtM` :2502 ohne Szene). Gesetzt werden sie von
// `_dayNightApplyLuft` :2665 (β :2711, Spektrum :2718); die Durchlässigkeit T(d) selbst rechnet nur der Knoten `faktor` :2543 in TSL.
const FERNE_AN = async (r, T, a) => {
    const A = r.constructor, wf = a.feld || (A.WEATHER_FIELD && A.WEATHER_FIELD[a.wetter]);
    if (!wf) return { fehlt: "das Wetter-Wort " + a.wetter + " steht nicht in WEATHER_FIELD" };
    const beta = r._luftBeta(wf), s = r._luftSpektrum(beta, null, new T.Vector3());
    return { beta, sicht_m: Math.round(-Math.log(A.LUFT.kontrast) / beta), rot: +s.x.toFixed(3), gruen: +s.y.toFixed(3), blau: +s.z.toFixed(3) };
};

// ═══════════════════════════════════════ Perspektive spieler ═══════════════════════════════════════
{
    // ─────────── erleben.spieler.praesenz — Präsenz: der Leib antwortet ───────────
    // Zählt an der dichtesten Pose (stadt-voll third) den Umfang jeder Sprosse in der Welt: die Saat der Sitzung, die Bewohner-Leiber
    // im Kegel der Kamera (`_bewohnerSiedlungen` je Siedlung ihre Liste, x/z/kopfY des Satzes), die fahrbaren Leiber
    // (`state.architectures` mit affordances.moveable), die Bewohner im Umkreis von 5 km (Liste oder das Gesetz `leuteVon` je Platz) und
    // die Arten, die der Spieler sein kann (`playerSoulDefs` + `customSouls`). Unter dem Umfang urteilt `L.umfang` mit der Zahl; trägt die
    // Welt ihn, nennt `L.leser` den Haken, der die Schwelle der Karte je Bild zählen müsste. S1 trägt g5.js.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.praesenz",
            sek: 45,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/siedlung-bewohner.js", "stamm/siedlung-verkehr.js", "stamm/bau-teile.js", "stamm/siedlung-satz.js", "stamm/koerper-seele.js", "stamm/koerper-fahrt.js", "stamm/koerper-bewegung.js", "stamm/gelaende-boden.js"],
            welt: [{ wort: "leib_proben", ab: 1, was: "Proben des Leibs in der Welt der Sitzung (Lagen, Leiber, Bewohner im Bild)" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [{ wort: "anteil_schwellen", richtung: "≥", wert: 0.95, wortlaut: "Anteil, der alle drei Schwellen hält ≥ 0,95", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Saaten der Sitzung", wortlaut: "N = 100 Zufallslagen aus 10 Saaten", feld: "richter" },
                },
                3: {
                    soll: [
                        { wort: "bilder_leib_in_leib", richtung: "≤", wert: 0, wortlaut: "0 Bilder Leib in Leib", feld: "richter" },
                        { wort: "latenz_p95_ms", richtung: "≤", wert: 50, wortlaut: "Taste → erstes Bild mit Leib-Antwort p95 ≤ 50 ms", feld: "richter", aus: 1 },
                    ],
                    umfang: { verlangt: 1000, einheit: "Bewohner-Leiber im Bild der Stadt-Pose", wortlaut: "im Gedränge: 10³ Bewohner im Bild", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "latenz_p95_ms", richtung: "≤", wert: 50, wortlaut: "Latenz p95 ≤ 50 ms", feld: "richter" },
                        { wort: "kamera_bilder_im_bau", richtung: "≤", wert: 0, wortlaut: "0 Kamera-Bilder im Bau", feld: "richter" },
                    ],
                    umfang: { verlangt: 50, einheit: "fahrbare Leiber der Welt (Wagen, Boot, Flieger)", wortlaut: "N = 50 Zufallsleiber", feld: "richter" },
                },
                5: {
                    soll: [{ wort: "anteil_schwellen", richtung: "≥", wert: 0.95, wortlaut: "Lagen-Stichprobe wie S2 im dichtesten Viertel: Anteil ≥ 0,95", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Bewohner im Umkreis von 5 km", wortlaut: "Megastadt, 10⁶ Bewohner im Umkreis von 5 km", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "latenz_p95_ms", richtung: "≤", wert: 35, wortlaut: "Latenz ≤ 35 ms", feld: "richter" },
                        { wort: "anteil_frei", richtung: "≥", wert: 0.95, wortlaut: "Kamera frei — Anteil ≥ 0,95", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "(Saat, Art)-Paare der Sitzung", wortlaut: "N = 1 000 (Saat, Art, Lage)", feld: "richter" },
                },
            },
            seite: { SAATEN },
            lauf: async function praesenzLauf(H, P, L) {
                const saat = await L.ev("return r.state.worldMeta && r.state.worldMeta.seed;");
                // S2 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort; gezählt
                // ist die Saat, die die Welt trägt, mit ihrem Spawn (dort begänne die Stichprobe der Lagen). Die Schleife endet 25 s vor
                // der Frist: die Stadt-Pose der Sprossen 3–6 bleibt gemessen. Trägt die Welt alle Saaten, nennt S2 den Leser je Lage.
                await L.je(2, async () => {
                    const v = P.sprossen[2].umfang.verlangt;
                    const arg = { stamm: P.leiter + "-s2", n: v, bis: Date.now() + Math.max(0, (L.rest() - 25) * 1000) };
                    const s = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", (r) => { const p = r.state.playerMesh.position; return [Math.round(p.x), Math.round(p.z)]; });", Math.max(5, L.rest() - 2));
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("praesenz S2 Saaten " + JSON.stringify(s));
                    const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m)";
                    if (s.je.length < v) return L.umfang(2, s.je.length, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Saaten (" + zeit + "; Ende: " + s.grund + ")");
                    L.leser(2, "die drei Schwellen je Zufallslage: kein Leser, der in jeder Saat Lagen zieht und Taste → Bild, Fuß und Kamera je Lage urteilt (scripts/werkbank.cjs:1892 `/latenz` misst nur am Ort der Pose) — " + zeit, s.je.length);
                });
                // die dichteste Pose der Leiter: der Markt der Stadt im Gedränge (dort fährt auch der Preis, R3)
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await L.ev(`
                    r._loopCamera(performance.now());
                    const cam = r.state.camera;
                    cam.updateMatrixWorld(true);
                    const F = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
                    const v = new T.Vector3();
                    const p = r.state.playerMesh.position;
                    const FC = globalThis.__fachwerkCore;
                    let imBild = 0, geboren = 0, alle = 0, sied = 0, umkreis5 = 0, wagen = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (Array.isArray(S.liste)) {
                            n = S.liste.length;
                            for (const b of S.liste) {
                                if (!b || !b.leib) continue;
                                geboren++;
                                if (b.drinnen === true || !Number.isFinite(b.x) || !Number.isFinite(b.z)) continue;
                                v.set(b.x, Number.isFinite(b.kopfY) ? b.kopfY : r.getTerrainHeightAt(b.x, b.z) + 1.6, b.z);
                                if (v.distanceTo(cam.position) <= cam.far && F.containsPoint(v)) imBild++;
                            }
                        } else {
                            if (!FC || typeof FC.leuteVon !== "function") throw new Error("fachwerk-core leuteVon fehlt (stamm/siedlung-bewohner.js:839)");
                            for (const sl of (S.plan && S.plan.slots) || []) { const k = FC.leuteVon(sl.ov); if (k > 0) n += k; }
                        }
                        alle += n;
                        if (Math.hypot(S.ox - p.x, S.oz - p.z) <= 5000) umkreis5 += n;
                        if (S.verkehr && Array.isArray(S.verkehr.wagen)) wagen += S.verkehr.wagen.length;
                    }
                    const fahrbar = (r.state.architectures || []).filter((e) => e && e.affordances && e.affordances.moveable);
                    const arten = [...new Set(fahrbar.map((e) => e.type))];
                    const seelen = Object.keys(r.playerSoulDefs || {}).length + Object.keys(r.state.customSouls || {}).length;
                    return { imBild, geboren, alle, sied, umkreis5, wagen, fahrbar: fahrbar.length, fahrArten: arten.slice(0, 12), seelen, far: cam.far };
                `);
                L.zeile("Stadt-Pose: " + JSON.stringify(z));
                await L.je(3, async () => {
                    const v = P.sprossen[3].umfang.verlangt;
                    if (z.imBild < v)
                        return L.umfang(3, z.imBild, "im Kegel der Kamera an stadt-voll third stehen " + z.imBild + " Bewohner-Leiber (" + z.geboren + " geboren, " + z.alle + " Bewohner in " + z.sied + " Siedlungen) — kein Gedränge von " + v);
                    L.leser(3, "Bilder Leib in Leib: kein Leser je Bild, der den Leib des Spielers gegen die Bewohner-Leiber hält — `_bewohnerSpielerAbstand` (stamm/siedlung-bewohner.js:2142) weicht, zählt aber kein Bild; der Gang 2 min passt nicht in die Leiter (sek ≤ 60)", z.imBild);
                });
                await L.je(4, async () => {
                    const v = P.sprossen[4].umfang.verlangt;
                    if (z.fahrbar < v)
                        return L.umfang(4, z.fahrbar, "die Welt der Sitzung trägt " + z.fahrbar + " fahrbare Leiber (affordances.moveable, stamm/bau-teile.js:209; Arten: " + (z.fahrArten.join(", ") || "keine") + "; Wagen des Verkehrs " + z.wagen + ")");
                    L.leser(4, "0 Kamera-Bilder im Bau: kein Leser je Bild, ob die Kamera eines gerittenen Leibs im Bau steht (stamm/koerper-bewegung.js:1759 `_loopCamera`); die Latenz-Linse wählt keinen Leib der Welt (scripts/werkbank.cjs:1894)", z.fahrbar);
                });
                await L.je(5, async () => {
                    const v = P.sprossen[5].umfang.verlangt;
                    if (z.umkreis5 < v) return L.umfang(5, z.umkreis5, "im Umkreis von 5 km um die Stadt-Pose wohnen " + z.umkreis5 + " Bewohner (" + z.sied + " Siedlungen der Sitzung) — keine Megastadt");
                    L.leser(5, "Lagen-Stichprobe im dichtesten Viertel: kein Leser, der Zufallslagen zieht und die drei Schwellen je Lage urteilt (scripts/werkbank.cjs:1892 `/latenz` misst nur am Ort der Pose)", z.umkreis5);
                });
                await L.je(6, async () => {
                    const n = 1 * z.seelen;
                    const v = P.sprossen[6].umfang.verlangt;
                    if (n < v) return L.umfang(6, n, "eine Saat (" + saat + ") × " + z.seelen + " Arten, die der Spieler sein kann (playerSoulDefs + customSouls, stamm/koerper-seele.js:437) = " + n + " (Saat, Art)-Paare");
                    L.leser(6, "Kontakt ohne Durchdringen und Kamera frei je (Saat, Art, Lage): kein Leser (stamm/koerper-fahrt.js:2744 `applyPlayerSoul` wechselt den Leib, nie ein Urteil seiner Lage)", n);
                });
            },
        })
    );

    // ─────────── erleben.spieler.rolle — Die Rolle: jeder Bewohner ist übernehmbar ───────────
    // Zählt an stadt-voll die Bewohner der größten Siedlung der Sitzung (Liste oder das Gesetz `leuteVon` je Platz), alle Bewohner und die
    // Tiere (`state.creatures`) gegen Dorf 10² · Stadt 10⁴ · Metropole 10⁶ · Megastadt 10⁷ · Planet 10⁹. Wo die Welt den Umfang trägt,
    // fehlt der Haken der Übernahme (Bewohner → Leib des Spielers): `L.leser`; darunter `L.umfang`. S4 (Blindurteil gegen Quellen) schösse
    // das Bild erst an einer Metropole. S7 verlangt 10 Saaten (wie S6). S1 trägt g4.js.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.rolle",
            sek: 40,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/siedlung-bewohner.js", "stamm/koerper-fahrt.js", "stamm/koerper-seele.js"],
            welt: [{ wort: "rollen_proben", ab: 1, was: "übernommene Bewohner, deren Verben die Welt änderten" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [
                        { wort: "verben_des_berufs", richtung: "≥", wert: 3, wortlaut: "spielbar mit ≥ 3 Verben seines Berufs", feld: "richter" },
                        { wort: "anteil_spielbar", richtung: "≥", wert: 0.9, wortlaut: "Anteil ≥ 0,9", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "ein Dorf, 10² Bewohner: jeden übernehmen", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "anteil_kopplung", richtung: "≥", wert: 0.8, wortlaut: "Δ in B binnen 1 Spieltag messbar, Anteil ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 1e4, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "eine Stadt, 10⁴", feld: "umfang" },
                },
                4: {
                    auge: {
                        pose: "stadt-voll third, Mittag, Sommer, Sonne — der Markt im Gedränge, Bewohner bei ihren Verben",
                        vorbild: "Quellen der Epoche: Berufs- und Werkstattbilder (Schmied 1200, Mechaniker 1950) im Blindpaar",
                    },
                    soll: [{ wort: "anteil_epochentreu", richtung: "≥", wert: 0.8, wortlaut: "Anteil epochentreuer Verben im Blindurteil gegen Quellen ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "eine Metropole, 10⁶ — über Epochen und Kulturen", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "gesichter_bildpaar", richtung: "≥", wert: 10, wortlaut: "an 10 Zufallsgesichtern im Ego sichtbar (Bildpaar)", feld: "richter" }],
                    umfang: { verlangt: 1e7, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "Megastadt bis jenseits Tokio, 10⁷–4·10⁸, Herrscher eingeschlossen", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "verben_der_art", richtung: "≥", wert: 3, wortlaut: "spielbar mit ≥ 3 arteigenen Verben mit Weltwirkung", feld: "richter" },
                        { wort: "anteil_spielbar", richtung: "≥", wert: 0.95, wortlaut: "Anteil ≥ 0,95", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e9, einheit: "Lebewesen der Sitzung (Bewohner + Tiere)", wortlaut: "Planet, 10⁹–10¹⁰ Lebewesen, auch Wolf, Wal, Biene im Stock", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "anteil_spielbar", richtung: "≥", wert: 0.95, wortlaut: "Anteil ≥ 0,95", feld: "richter", aus: 6 }],
                    umfang: { verlangt: 10, einheit: "Saaten der Sitzung", wortlaut: "N = 1 000 Zufallslebewesen aus 10 Saaten", feld: "richter", aus: 6 },
                },
            },
            lauf: async function rolleLauf(H, P, L) {
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await L.ev(`
                    const FC = globalThis.__fachwerkCore;
                    let max = 0, maxName = null, summe = 0, sied = 0;
                    const berufe = new Set();
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (Array.isArray(S.liste)) {
                            n = S.liste.length;
                            for (const b of S.liste) if (b && b.beruf) berufe.add(b.beruf);
                        } else {
                            if (!FC || typeof FC.leuteVon !== "function") throw new Error("fachwerk-core leuteVon fehlt (stamm/siedlung-bewohner.js:839)");
                            for (const sl of (S.plan && S.plan.slots) || []) { const k = FC.leuteVon(sl.ov); if (k > 0) n += k; }
                        }
                        summe += n;
                        if (n > max) { max = n; maxName = (S.plan && S.plan.name) || S.key; }
                    }
                    return { saat: r.state.worldMeta && r.state.worldMeta.seed, max, maxName, summe, sied, berufe: [...berufe].slice(0, 16), tiere: (r.state.creatures || []).length };
                `);
                L.zeile("Bewohner der Sitzung: " + JSON.stringify(z));
                const haken =
                    "Übernahme: kein Haken, der einen Bewohner zum Leib des Spielers macht — der Bewohner trägt seinen Beruf (stamm/siedlung-bewohner.js:875), der Spieler wechselt nur die Seele (stamm/koerper-fahrt.js:2744 `applyPlayerSoul`)";
                const stufe = async (nr, n, was) => {
                    const v = P.sprossen[nr].umfang.verlangt;
                    if (n < v) return L.umfang(nr, n, was);
                    if (P.sprossen[nr].auge) return L.auge(nr, { erzeugt: n, b: { wahl: 0 } });
                    L.leser(nr, haken, n);
                };
                const groesste = "die größte Siedlung der Sitzung („" + z.maxName + "“) trägt " + z.max + " Bewohner (" + z.sied + " Siedlungen, " + z.summe + " Bewohner, Berufe: " + (z.berufe.join(", ") || "keine") + ")";
                await L.je(2, () => stufe(2, z.max, groesste));
                await L.je(3, () => stufe(3, z.max, groesste + " — keine Stadt von 10⁴"));
                await L.je(4, () => stufe(4, z.max, groesste + " — keine Metropole"));
                await L.je(5, () => stufe(5, z.max, groesste + " — keine Megastadt"));
                await L.je(6, () => stufe(6, z.summe + z.tiere, "die Sitzung trägt " + z.summe + " Bewohner und " + z.tiere + " Tiere = " + (z.summe + z.tiere) + " Lebewesen — kein Planet von 10⁹"));
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält eine Saat (" + z.saat + ") und einen Planeten — kein Wechsel von Saat, Planet und Epoche im Lauf"));
            },
        })
    );

    // ─────────── erleben.spieler.hand — Hand und Werk: Wirkung aus dem Stoff ───────────
    // An der Wiese (ego) zählt das Programm die Werkzeuge der Hand (die leere Hand + jeder Bauplan, den `_blueprintUseKind` „hold“
    // nennt), die Stoffe des Bodens am Spawn (`_terrainMaterialAt` auf 7 × 7 Punkten in drei Tiefen), das längste Werkstück (opChain) und
    // die Tasten brechen/setzen. S1 fehlt der Leser der Wirkung (die Latenz-Linse misst Kamera, Leib, Hand); S2 schlägt mit dem Verb des
    // Spiels (`tryMouseBreak`, Blick zum Boden) und schießt das Ergebnisbild fürs Blindurteil; S3–S6 urteilen den gezählten Umfang.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.hand",
            sek: 60,
            mutiert: true,
            seite: { FAECHER, HAND_AN },
            pfad: ["scripts/werkbank.cjs", "stamm/gelaende-chunks.js", "stamm/gelaende-fern.js", "scripts/lib/haenger-linse.cjs", "scripts/lib/ausgabe-aufnahme.cjs", "spec/profiband/haushalt.json", "stamm/kampf.js", "stamm/vegetation-wiese.js", "stamm/bau-buch.js", "stamm/koerper-bewegung.js", "stamm/koerper-seele.js", "stamm/werkstatt-bauen.js", "stamm/gelaende-boden.js"],
            welt: [{ wort: "wirkungen", ab: 1, was: "Wirkungen der Hand an einem Stoff der Welt" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "wirkung_p95_ms", richtung: "≤", wert: 50, wortlaut: "Eingabe → erstes Bild mit Wirkung p95 ≤ 50 ms", feld: "richter" },
                        { wort: "treffer_zellen", richtung: "≤", wert: 1, wortlaut: "Trefferpunkt = Zielpunkt ± 1 Zelle", feld: "richter" },
                    ],
                    welt: [{ wort: "strahlen", ab: 1, was: "Ziel-Strahlen, an denen Treffer und gezeichnetes Ziel gemessen wurden" }],
                },
                2: {
                    auge: {
                        pose: "wiese ego, Blick 60° zum Boden auf das Ziel des Hiebs, nach einem Hieb der Hand (`tryMouseBreak`), Mittag, Sommer, Sonne, wahl 0",
                        vorbild: "Real-Foto desselben Stoffs nach derselben Tat (Grube im Wiesenboden, gesplittertes Holz, zerpflücktes Laub)",
                    },
                    soll: [{ wort: "anteil_plausibel", richtung: "≥", wert: 0.8, wortlaut: "Anteil plausibel ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Paare (Werkzeug × Stoff) des Spawns", wortlaut: "N = 20 Zufallspaare (Werkzeug × Stoff)", feld: "richter" },
                },
                3: {
                    soll: [{ wort: "anteil_monoton", richtung: "≥", wert: 0.95, wortlaut: "Anteil monotoner Antwort ≥ 0,95", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Paare (Werkzeug × Stoff) mit einem Parameter des Spielers", wortlaut: "N = 100 Zufallspaare, je ein Parameter variiert", feld: "richter" },
                },
                4: {
                    auge: { pose: "das Werkstück des Spielers auf der Werkbank, ego, Mittag", vorbild: "Museumsfoto des Werkstücks der Epoche (Töpferware, Gewebe, Schmiedestück)" },
                    umfang: { verlangt: 5, einheit: "Schritte des längsten Werkstücks der Welt (opChain)", wortlaut: "Form-Abweichung im Band, ≥ 5 Schritte", feld: "richter" },
                },
                5: {
                    soll: [{ wort: "anteil_benutzbar", richtung: "≥", wert: 0.8, wortlaut: "Anteil benutzbar mit plausibler Wirkung ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 200, einheit: "(Saat, Epoche, Werkzeug, Stoff) der Sitzung", wortlaut: "N = 200 (Saat, Epoche, Werkzeug, Stoff)", feld: "richter" },
                },
                6: {
                    soll: [{ wort: "anteil_plausibel", richtung: "≥", wert: 0.8, wortlaut: "Anteil plausibler Wirkung ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "(Saat, Art, Glied, Stoff, Tätigkeit) der Sitzung", wortlaut: "N = 1 000 (Saat, Art, Glied, Stoff, Tätigkeit)", feld: "richter" },
                },
            },
            lauf: async function handLauf(H, P, L) {
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const z = await L.ev(`
                    const st = r.state;
                    const t0 = performance.now();
                    const bps = Object.values(st.blueprints || {});
                    let halt = 0, geprueft = 0, ketteMax = 0;
                    for (const bp of bps) {
                        for (const part of (bp && bp.parts) || []) if (part && Array.isArray(part.opChain)) ketteMax = Math.max(ketteMax, part.opChain.length);
                        if (performance.now() - t0 > 4000) continue;
                        geprueft++;
                        if (r._blueprintUseKind(bp) === "hold") halt++;
                    }
                    const p = st.playerMesh.position;
                    const stoffe = new Set();
                    for (let i = -3; i <= 3; i++)
                        for (let k = -3; k <= 3; k++) {
                            const x = p.x + i * 10, zz = p.z + k * 10;
                            const y = r.getTerrainHeightAt(x, zz);
                            for (const tief of [0.2, 1.5, 4]) { const m = r._terrainMaterialAt(x, zz, y - tief); if (m) stoffe.add(m); }
                        }
                    const kb = st.keybindings || {};
                    const seelen = Object.keys(r.playerSoulDefs || {}).length + Object.keys(st.customSouls || {}).length;
                    return { saat: st.worldMeta && st.worldMeta.seed, werkzeuge: 1 + halt, halt, geprueft, bauplaene: bps.length, stoffe: [...stoffe], ketteMax, brechen: kb.break != null, setzen: kb.place != null, seelen };
                `);
                L.zeile("Hand an der Wiese: " + JSON.stringify(z));
                const S = z.stoffe.length;
                const paare = z.werkzeuge * S;
                const paarText = z.werkzeuge + " Werkzeuge der Hand (die leere Hand + " + z.halt + " Baupläne „hold“, stamm/kampf.js:1843; geprüft " + z.geprueft + " von " + z.bauplaene + ") × " + S + " Stoffe des Bodens (" + z.stoffe.join(", ") + ") = " + paare + " Paare";
                // S1 · setzen und brechen: die Tasten trägt die Welt, den Leser der Wirkung nicht. TREFFER ↔ ZIEL ÜBER DEN FÄCHER: 20 Ziele
                // (Neigung −10° … −60° × 4 Richtungen) und die schlechte Pose (der streifende Strahl, −4°) — je Ziel der Treffer der Tat
                // gegen das gezeichnete Ziel (HAND_AN); über 1 Zelle urteilt S1 gemessen, sonst bleibt die Wirkung je Bild beim Namen
                await L.je(1, async () => {
                    if (!(z.brechen && z.setzen)) throw new Error("die Tasten-Tafel trägt brechen " + z.brechen + " · setzen " + z.setzen + " (stamm/werkstatt-bauen.js:3634)");
                    const ziele = [];
                    for (const g of [-10, -20, -30, -45, -60]) for (let k = 0; k < 4; k++) ziele.push({ pitch: (g * Math.PI) / 180, gier: (k * Math.PI) / 2 });
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.HAND_AN, export: "stamm/gelaende-chunks.js:2339 _fieldRaycast (gegen die gezeichneten Meshes, `_chunkGezeichnet` stamm/gelaende-fern.js:1468)", leser: "stamm/kampf.js:2371 tryMouseBreak → stamm/gelaende-boden.js:3281 _runRaycast" },
                        adressen: { dazu: ziele.concat([{ pitch: (-4 * Math.PI) / 180, gier: 0, streif: true }]) },
                        ms: Math.max(3000, Math.floor((L.rest() - 30) * 1000)),
                        masse: {
                            ziele: { wie: "anzahl", nur: (a, w) => !w.leer },
                            zellen: { wie: "max", feld: "zellen" },
                            mittel: { wie: "mittel", feld: "d_m" },
                            ueber: { wie: "anzahl", nur: (a, w) => w.zellen > 1 },
                            streif: { wie: "erste", feld: "zellen", nur: "streif" },
                        },
                        schlecht: { feld: "zellen", richtung: "max" },
                        pose: (a) => "wiese ego, Blick " + Math.round((a.pitch * 180) / Math.PI) + "° (Gier " + +a.gier.toFixed(2) + ") auf das Ziel — Fadenkreuz und Grube im Bild",
                        ungemessen: ["Eingabe → erstes Bild mit Wirkung p95: ungemessen bis zum Gerät (kein Leser der Wirkung je Bild)", "beide Geräte: die Sitzung fährt eines"],
                    });
                    L.zeile("hand S1: " + R.akte.slice(0, 500));
                    const w = R.werte, s1 = P.sprossen[1].soll;
                    if (w.ziele && w.zellen > s1[1].wert)
                        return L.gemessen(1, { treffer_zellen: w.zellen }, {
                            welt: { strahlen: w.ziele },
                            taeter:
                                "die Tat trifft das Dichtefeld (`_fieldRaycast` stamm/gelaende-chunks.js:2339), das Fadenkreuz zeigt das Mesh — an " + w.ueber + " von " + w.ziele + " Zielen über 1 Zelle (" + (R.schlecht ? R.schlecht.w.d_m + " m" : "?") + ", streifend " + w.streif + " Zellen); kein Raycast gegen das Gelände-Mesh im Spiel; Wirkung je Bild p95: ungemessen bis zum Gerät · " + R.akte,
                        });
                    const treff = w.ziele ? "Treffer ↔ Ziel an " + w.ziele + " Zielen höchstens " + w.zellen + " Zellen (mittel " + w.mittel + " m)" : "Treffer ↔ Ziel: " + (R.fehlt || "kein Ziel gemessen");
                    L.leser(1, "Eingabe → erstes Bild mit Wirkung: die Latenz-Linse kennt kein Verb setzen (scripts/werkbank.cjs:1894) und misst an Kamera, Leib und Hand, nie die Wirkung am Stoff (scripts/lib/haenger-linse.cjs:1181); " + treff + " (kein Raycast gegen das Gelände-Mesh im Spiel, der Fächer misst es mit THREE) · " + R.akte);
                });
                await L.je(3, async () => {
                    if (paare < P.sprossen[3].umfang.verlangt) return L.umfang(3, paare, paarText + " — und Kraft und Winkel sind kein Parameter des Spielers");
                    L.leser(3, "Kraft und Winkel des Hiebs: kein Parameter des Spielers — `tryMouseBreak` liest nur das gehaltene Gerät (stamm/kampf.js:2226); kein Leser der Antwort je Parameter", paare);
                });
                await L.je(4, async () => {
                    if (z.ketteMax < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.ketteMax, "das längste Werkstück der Welt trägt " + z.ketteMax + " Schritte (opChain der Teile, stamm/bau-buch.js:2371) in " + z.bauplaene + " Bauplänen");
                    L.leser(4, "kein Weg legt ein Werkstück mit seinen Schritten vor die Kamera der Probe (stamm/bau-buch.js:2371 opChain)", z.ketteMax);
                });
                await L.je(5, async () => {
                    const n = 1 * 1 * paare;
                    if (n < P.sprossen[5].umfang.verlangt) return L.umfang(5, n, "eine Saat (" + z.saat + ") × eine Epoche × " + paarText);
                    L.leser(5, "Epoche: die Sitzung trägt eine Epoche; kein Leser der Wirkung je (Werkzeug, Stoff) (stamm/kampf.js:2226)", n);
                });
                await L.je(6, async () => {
                    const taten = (z.brechen ? 1 : 0) + (z.setzen ? 1 : 0);
                    const n = 1 * z.seelen * 1 * S * taten;
                    if (n < P.sprossen[6].umfang.verlangt)
                        return L.umfang(6, n, "eine Saat × " + z.seelen + " Arten (stamm/koerper-seele.js:437) × ein Glied (der Platz held, stamm/kampf.js:1747) × " + S + " Stoffe × " + taten + " Tätigkeiten (brechen, setzen) = " + n);
                    L.leser(6, "fremde Glieder: die Hand hat EINEN Platz (held, stamm/kampf.js:1747); kein Leser der Wirkung je Glied", n);
                });
                // S2 · das Ergebnisbild: ein Hieb der Hand mit dem Verb des Spiels, der Blick zum Ziel, das Bild fürs Blindurteil
                await L.je(2, async () => {
                    if (paare < P.sprossen[2].umfang.verlangt) return L.umfang(2, paare, paarText);
                    const d = await L.ev(`
                        const st = r.state;
                        const pitch0 = st.pitch;
                        st.pitch = -1.05;
                        r._loopCamera(performance.now());
                        const hit = r._raycastWorldHit(30);
                        const stoff = hit && hit.hit ? r._terrainMaterialAt(hit.x, hit.z, hit.y) : null;
                        // ein Hieb ins Leere ist keine Wirkung: nur graben · pflücken · abbauen · zünden wirken am Stoff (stamm/kampf.js:2226)
                        const WIRK = ["graben", "pfluecken", "abbau", "zuenden"];
                        let schlaege = 0, gewirkt = false, verb = null;
                        for (let i = 0; i < 12; i++) {
                            schlaege++;
                            const ok = r.tryMouseBreak();
                            verb = st.player && st.player._mausVerb;
                            if (!ok || WIRK.indexOf(verb) < 0) break;
                            const dg = st.player._dig;
                            if (verb !== "graben" || !dg || !(dg.progress > 0)) { gewirkt = true; break; }
                        }
                        r._loopCamera(performance.now());
                        return { pitch0, schlaege, gewirkt, verb, stoff, ziel: hit && hit.hit ? [hit.x, hit.y, hit.z] : null };
                    `);
                    L.zeile("Hieb der Hand: " + JSON.stringify(d));
                    try {
                        if (!d.gewirkt) throw new Error("der Hieb der Hand wirkte nicht (" + d.schlaege + " Schläge, Verb " + d.verb + ", Stoff " + d.stoff + ")");
                        await L.auge(2, { b: { wahl: 0, uhr: 0.5 }, erzeugt: paare });
                    } finally {
                        await L.ev("r.state.pitch = " + (Number.isFinite(d.pitch0) ? d.pitch0 : 0) + "; return true;");
                    }
                });
            },
        })
    );

    // ─────────── erleben.spieler.wegfindung — Wegfindung ohne Pfeil ───────────
    // An der Wiese zählt das Programm die Landmarken der Welt (felsturm/felsbogen aus dem Landmarken-Wurf, stamm/vegetation-baum.js:1519)
    // in 1 km und 1–3 km, die größte Siedlung, den Planeten (Anker `_planetAnker`, sein Körper aus planet-core `planetPlan(samen,
    // PLANET_ERDE)` wie der Faden, voxel-worker.js:1159) und misst S5: die Mittags-Sonne je Saison-Wort (`_sonnenRichtung`, die Quelle von
    // Licht und Himmel) und die Pol-Höhe der Sternfeld-Achse (`state.starField.rotation`) gegen die Breite des Ankers.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.wegfindung",
            sek: 45,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/vegetation-baum.js", "stamm/siedlung-satz.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-wege.js", "stamm/bild-himmel.js", "welt-licht.js", "stamm/dirigent-takt.js", "stamm/gelaende-chunks.js", "voxel-worker.js", "planet-core.js", "stamm/feld-leben.js", "stamm/netz-portal.js"],
            welt: [{ wort: "gestirn_proben", ab: 5, was: "Gestirn-Lagen aus der Welt: die Mittags-Sonne je Saison-Wort und die Achse des Sternfelds" }],
            sprossen: {
                1: {
                    soll: [{ wort: "anteil_landmarke", richtung: "≥", wert: 0.9, wortlaut: "Kontrast ≥ 0,1, ≥ 0,9", feld: "richter" }],
                    umfang: { verlangt: 50, einheit: "Saaten der Sitzung", wortlaut: "N = 50 Saaten", feld: "richter" },
                    welt: [{ wort: "saaten", ab: 1, was: "Saaten, in die die Welt am Ort wechselte (worldMeta.seed trägt die Saat)" }],
                },
                2: {
                    soll: [
                        { wort: "erfolg", richtung: "≥", wert: 0.9, wortlaut: "Erfolg ≥ 0,9", feld: "richter" },
                        { wort: "umweg", richtung: "≤", wert: 1.5, wortlaut: "Umweg ≤ 1,5", feld: "richter" },
                    ],
                    umfang: { verlangt: 1, einheit: "Landmarken in 1 km um die Wiese", wortlaut: "Ziel in 1 km per Landmarke", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "wege_deckung", richtung: "≥", wert: 0.95, wortlaut: "Wege-Deckung Karte ↔ Draufsicht ≥ 0,95", feld: "richter" },
                        { wort: "erfolg", richtung: "≥", wert: 0.9, wortlaut: "Ziel in 10 km mit Karte: Erfolg ≥ 0,9", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "km Weite des Planeten der Welt", wortlaut: "Karte aus dem Gesetz, 10 km", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "erfolg", richtung: "≥", wert: 0.8, wortlaut: "Auskunft befolgt → Ziel erreicht ≥ 0,8", feld: "richter" },
                        { wort: "landmarken_im_satz", richtung: "≥", wert: 1, wortlaut: "der Satz nennt ≥ 1 sichtbare Landmarke", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "Auskunft der Bewohner, 100 km, in einer Stadt von 10⁶", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "gestirn_fehler_grad", richtung: "≤", wert: 1, wortlaut: "Gestirn-Höhe im Bild ↔ Breite: Fehler ≤ 1°", feld: "richter" },
                        { wort: "seereise_erfolg", richtung: "≥", wert: 0.8, wortlaut: "Seereise 1 000 km nur mit Himmel: Erfolg ≥ 0,8", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "km Weite des Planeten der Welt", wortlaut: "Sonne und Sterne, 10³ km", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "erfolg", richtung: "≥", wert: 0.8, wortlaut: "Erfolg ≥ 0,8 mit den Mitteln der gewählten Epoche", feld: "richter" }],
                    umfang: { verlangt: 4e4, einheit: "km Umfang des Planeten der Welt", wortlaut: "Planet, 4·10⁴ km, mit den Mitteln der Epoche", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "erfolg", richtung: "≥", wert: 0.8, wortlaut: "N = 100 Saaten × 10 Ziele: Erfolg ≥ 0,8", feld: "richter" },
                        { wort: "umweg", richtung: "≤", wert: 1.5, wortlaut: "Umweg ≤ 1,5", feld: "richter" },
                        { wort: "hud_pfeile", richtung: "≤", wert: 0, wortlaut: "0 HUD-Pfeile", feld: "richter" },
                        { wort: "dv_ueber_pct", richtung: "≤", wert: 10, wortlaut: "≤ 10 % Δv über dem physikalischen", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Saaten der Sitzung", wortlaut: "N = 100 Saaten × 10 Ziele", feld: "richter" },
                },
            },
            seite: { FAECHER, LANDMARKE_AN },
            lauf: async function wegfindungLauf(H, P, L) {
                const path = require("path");
                const tOrt = Date.now();
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const ortMs = Date.now() - tOrt;
                const z = await L.ev(`
                    const st = r.state;
                    const p = st.playerMesh.position;
                    const lm = (st.architectures || []).filter((e) => e && typeof e.type === "string" && e.position && (e.type.indexOf("felsturm") === 0 || e.type.indexOf("felsbogen") === 0));
                    const dist = (e) => Math.hypot(e.position.x - p.x, e.position.z - p.z);
                    const lm1 = lm.filter((e) => dist(e) <= 1000).length;
                    const lm13 = lm.filter((e) => dist(e) >= 1000 && dist(e) <= 3000).length;
                    const FC = globalThis.__fachwerkCore;
                    let max = 0, sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (Array.isArray(S.liste)) n = S.liste.length;
                        else {
                            if (!FC || typeof FC.leuteVon !== "function") throw new Error("fachwerk-core leuteVon fehlt (stamm/siedlung-bewohner.js:839)");
                            for (const sl of (S.plan && S.plan.slots) || []) { const k = FC.leuteVon(sl.ov); if (k > 0) n += k; }
                        }
                        if (n > max) max = n;
                    }
                    const sf = st.starField;
                    if (!sf) throw new Error("kein Sternfeld (state.starField, stamm/dirigent-takt.js:2422)");
                    const q = (y) => new T.Quaternion().setFromEuler(new T.Euler(sf.rotation.x, y, sf.rotation.z, sf.rotation.order));
                    const dq = q(1).multiply(q(0).invert());
                    const ax = new T.Vector3(dq.x, dq.y, dq.z).normalize();
                    if (sf.parent) ax.applyQuaternion(sf.parent.getWorldQuaternion(new T.Quaternion()));
                    const polHoehe = (Math.asin(Math.min(1, Math.abs(ax.y))) * 180) / Math.PI;
                    const alt = { tod: st.timeOfDay, phase: st.seasonPhase, season: st.season, auto: st.autoSeason, anker: r._saisonAnker, sonne: st._sonne ? Object.assign({}, st._sonne) : st._sonne };
                    const mittag = [];
                    try {
                        for (const w of ["fruehling", "sommer", "herbst", "winter"]) {
                            if (!r.setSeason(w)) throw new Error("das Saison-Wort " + w + " gilt nicht");
                            st.timeOfDay = 0.5;
                            const s = r._sonnenRichtung();
                            mittag.push({ w, phase: st.seasonPhase, hoehe: (Math.asin(Math.max(-1, Math.min(1, s.y))) * 180) / Math.PI });
                        }
                    } finally {
                        st.timeOfDay = alt.tod; st.seasonPhase = alt.phase; st.season = alt.season; st.autoSeason = alt.auto; r._saisonAnker = alt.anker; st._sonne = alt.sonne;
                    }
                    const anker = await r._planetAnker();
                    return { saat: st.worldMeta && st.worldMeta.seed, samen: r._planetSamen(), breite: anker.breite, laenge: anker.laenge, lm1, lm13, lmAlle: lm.length, max, sied, polHoehe, mittag };
                `);
                L.zeile("Wegfindung an der Wiese: " + JSON.stringify(z));
                // der Körper des Planeten der Welt: dieselbe reine Funktion wie im Planet-Faden (voxel-worker.js:1159 planetPlan(samen, PLANET_ERDE))
                const PC = require(path.resolve("planet-core.js"));
                const K = PC.planetPlan(z.samen, PC.PLANET_ERDE).koerper;
                const umfangKm = 2 * Math.PI * K.radiusKm;
                const zahl = (x, n) => String(+Number(x).toFixed(n == null ? 1 : n)).replace(".", ",");
                await L.je(2, async () => {
                    if (z.lm1 < P.sprossen[2].umfang.verlangt) return L.umfang(2, z.lm1, "in 1 km um die Wiese steht keine Landmarke (felsturm/felsbogen, stamm/vegetation-baum.js:1519; " + z.lm13 + " in 1–3 km, " + z.lmAlle + " geladen)");
                    L.leser(2, "Erfolg und Umweg eines menschlichen Testspielers: kein Leser des Ziel-Gangs (Start, Ziel, gegangener Weg) — der Ort wäre eine Route neben `/latenz` (scripts/werkbank.cjs:1892), der Testspieler ein Panel (R11)", z.lm1);
                });
                await L.je(3, async () => {
                    if (umfangKm < P.sprossen[3].umfang.verlangt) return L.umfang(3, umfangKm, "der Planet der Welt misst " + zahl(umfangKm) + " km Umfang");
                    L.leser(3, "Karte aus dem Gesetz: kein Haken, der die Welt als Karte vor den Spieler legt (Höhenlinien, Wege, Ortsnamen) — `_wegeKarteEnsure` (stamm/siedlung-wege.js:16) ist eine Boden-Textur, keine Karte des Spielers", umfangKm);
                });
                await L.je(4, async () => {
                    if (z.max < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.max, "die größte Siedlung der Sitzung trägt " + z.max + " Bewohner (" + z.sied + " Siedlungen) — keine Stadt von 10⁶");
                    L.leser(4, "Auskunft: kein Satz eines Bewohners aus dem Wegenetz (stamm/siedlung-wege.js:16)", z.max);
                });
                // S5 · Gestirn-Höhe ↔ Breite: die Mittags-Sonne je Saison-Wort gegen 90° − |φ − δ|, die Pol-Höhe der Sterne gegen |φ|
                await L.je(5, async () => {
                    const phiG = (z.breite * 180) / Math.PI;
                    const s = phiG < 0 ? -1 : 1;
                    const zeilen = z.mittag.map((m) => {
                        const delta = (s * Math.asin(Math.sin(K.neigungRad) * Math.sin(2 * Math.PI * m.phase)) * 180) / Math.PI;
                        const soll = 90 - Math.abs(phiG - delta);
                        return { w: m.w, ist: m.hoehe, soll, f: Math.abs(m.hoehe - soll) };
                    });
                    const fSonne = Math.max(...zeilen.map((x) => x.f));
                    const fPol = Math.abs(z.polHoehe - Math.abs(phiG));
                    const f = Math.max(fSonne, fPol);
                    const schlecht = zeilen.reduce((a, x) => (x.f > a.f ? x : a), zeilen[0]);
                    L.zeile("Gestirne bei Breite " + zahl(phiG, 2) + "°: " + JSON.stringify(zeilen) + " · Pol " + zahl(z.polHoehe, 2) + "°");
                    if (f <= 1) return L.leser(5, "Seereise 1 000 km nur mit Himmel: kein Leser des Erfolgs — die Reise ist ein Sprung der Konsole (stamm/feld-leben.js:1278), keine Fahrt über See unter dem Himmel", umfangKm);
                    L.gemessen(5, { gestirn_fehler_grad: +f.toFixed(3) }, {
                        erzeugt: umfangKm,
                        welt: { gestirn_proben: z.mittag.length + 1 },
                        taeter:
                            "die Sonnenbahn kennt weder Breite noch Saison (welt-licht.js:711 `sonnenRichtung`): Mittag " + schlecht.w + " " + zahl(schlecht.ist) + "° statt " + zahl(schlecht.soll) + "°; Pol der Sterne " + zahl(z.polHoehe) + "° statt " + zahl(Math.abs(phiG)) +
                            "° (stamm/dirigent-takt.js:2422 feste Achse); Seereise: kein Leser (stamm/feld-leben.js:1278 die Reise springt)",
                    });
                });
                await L.je(6, async () => {
                    if (umfangKm < P.sprossen[6].umfang.verlangt) return L.umfang(6, umfangKm, "der Planet der Welt misst " + zahl(umfangKm) + " km Umfang");
                    L.leser(6, "Mittel der Epoche: die Reise ist ein Sprung der Konsole in eine neue Welt (stamm/feld-leben.js:1278 → `_reiseBetreten` stamm/netz-portal.js:660), keine Fahrt mit Karte, Schiff oder Fahrzeug der Epoche", umfangKm);
                });
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält eine Saat (" + z.saat + ") und einen Planeten — kein Nachbarplanet, keine Bahn zwischen Planeten"));
                // S1 ÜBER DEN FÄCHER (stationen/faecher.js; vorher die Bühne H.seite.SAATEN, je Saat ein Welt-Wechsel am Ort): die 50 Saaten der
                // Sprosse (dieselben Namen wie die Bühne, P.leiter-s1-i) und die geladene Saat; je Adresse der Wurf der Landmarke an der Wiese.
                // Der Anteil mit ≥ 1 Landmarke in 1–3 km im Kegel ist die Obergrenze des Solls (der Kontrast ist ein Bild, ungemessen); eine Saat,
                // die die warme Welt nicht rufen kann, zählt ohne Fähigkeit — trägt keine der 50 Saaten, bleibt S1 beim Namen offen
                await L.je(1, async () => {
                    const v = P.sprossen[1].umfang.verlangt;
                    const geladen = await L.ev("return r.state.worldMeta && r.state.worldMeta.seed;", 10);
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.LANDMARKE_AN, export: "stamm/vegetation-baum.js:1534 Landmarken-Pass", leser: "stamm/vegetation-baum.js:2607" },
                        adressen: { saaten: Array.from({ length: v }, (_, i) => P.leiter + "-s1-" + (i + 1)), dazu: [{ saat: geladen }] },
                        ms: Math.max(4000, Math.floor((L.rest() - 6) * 1000)),
                        masse: { saaten: { wie: "anzahl", nur: "saat" }, anteil_landmarke: { wie: "mittel", feld: "treffer" }, n13: { wie: "min", feld: "n13" }, geladen: { wie: "min", feld: "geladen" } },
                        schlecht: { feld: "n13", richtung: "min" },
                        pose: (a) => "Saat " + a.saat + " an der Wiese, ego, Blick in den Kegel der Landmarke (Kontrast im Bild)",
                        ungemessen: ["Kontrast ≥ 0,1 der Landmarke gegen ihren Grund (ein Bild je Saat, am Gerät)"],
                    });
                    L.zeile("wegfindung S1 (die Wiese wuchs in " + ortMs + " ms): " + R.akte.slice(0, 400));
                    const w = R.werte;
                    if (R.gemessen >= v && w.anteil_landmarke < P.sprossen[1].soll[0].wert)
                        return L.gemessen(1, { anteil_landmarke: +w.anteil_landmarke.toFixed(3) }, { erzeugt: R.gemessen, welt: { saaten: R.gemessen }, taeter: "Landmarke im Kegel in 1–3 km: Anteil " + w.anteil_landmarke + " · " + R.akte });
                    L.leser(1, (R.gemessen >= v ? "Kontrast ≥ 0,1 der Landmarke gegen ihren Grund im Bild: kein Leser des Pixel-Kontrasts je Saat" : (R.fehlt || "keine Saat gemessen") + " — gemessen " + R.gemessen + " von " + (v + 1) + " Adressen (die geladene " + geladen + ": " + (w.n13 == null ? "—" : w.n13) + " Landmarken in 1–3 km, im Kegel-Anteil " + (w.anteil_landmarke == null ? "—" : w.anteil_landmarke) + ")") + " · " + R.akte, R.gemessen);
                });
            },
        })
    );

    // ─────────── erleben.spieler.zeit — Die Zeit des Spielers: Dehnen, Raffen, Springen ───────────
    // S1 misst die Sonnenbahn der Welt (`_sonnenRichtung`, die Quelle von Licht und Himmel) über den Tag je Saison-Wort gegen die Ephemeride
    // der Breite des Ankers (ε und Drehsinn aus dem Körper des Planeten, die Nordrichtung frei gedreht und gespiegelt) und das Bildpaar des
    // Saison-Worts (sommer · winter · sommer, wahl 0); S2–S6 zählen die Zeit-Verben (DSL-Ops, Sätze der Konsole), die Tag-Länge und das
    // Jahr der Welt; S7–S9 die Zeitachse des Planeten, gefragt im Planet-Faden (`_planetAuftrag` planet-ort an −4 500 · −4 000 · +1 000 · +5 000 Ma).
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.zeit",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "scripts/lib/ausgabe-aufnahme.cjs", "scripts/lib/abnahme-urteil.cjs", "spec/profiband/haushalt.json", "stamm/bild-himmel.js", "welt-licht.js", "stamm/daten.js", "stamm/feld-dsl.js", "stamm/feld-leben.js", "stamm/gelaende-chunks.js", "voxel-worker.js", "planet-core.js", "stamm/netz-portal.js"],
            welt: [{ wort: "zeit_proben", ab: 1, was: "Zustände der Welt-Uhr, im Lauf gelesen" }],
            sprossen: {
                1: {
                    soll: [{ wort: "sonnenbahn_fehler_grad", richtung: "≤", wert: 1, wortlaut: "Sonnenbahn gegen Ephemeride der Breite ≤ 1°", feld: "richter" }],
                    umfang: { verlangt: 60, einheit: "min Tag-Länge (Regler des Spielers, ab 1 min)", wortlaut: "Tag-Länge 1–60 min, Jahreszeit per Spieler-Wort", feld: "umfang" },
                    welt: [
                        { wort: "sonnen_proben", ab: 100, was: "Sonnen-Richtungen der Welt über Uhr und Saison-Wort" },
                        { wort: "saison_bild_delta", ab: 1, was: "Graustufen, um die das Saison-Wort Sommer → Winter das Bild über dem Rauschen eines Wiederholungs-Schusses ändert" },
                    ],
                },
                2: {
                    soll: [
                        { wort: "fallzeit_abweichung_pct", richtung: "≤", wert: 5, wortlaut: "Fallzeit ±5 % zum Fallgesetz", feld: "richter" },
                        { wort: "sprung_px", richtung: "≤", wert: 2, wortlaut: "≤ 2 px Sprung je Bild", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "× Zeitlupe als Verb des Spielers", wortlaut: "Zeitlupe 10× (Fliegen-Takt)", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "feld_abweichung_pct", richtung: "≤", wert: 5, wortlaut: "Feld-Abweichung ≤ 5 %", feld: "richter" },
                        { wort: "bewohner_ort_pct", richtung: "≥", wert: 80, wortlaut: "der Ort von ≥ 80 % der Bewohner", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "× Raffer des Tags als Verb des Spielers", wortlaut: "Raffer 10³: ein Tag in 90 s, als Spieler-Verb", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "laub_bestand_abweichung_pct", richtung: "≤", wert: 10, wortlaut: "Laub-Deckung und Bestand nach Raffer-Jahr ±10 % zum Normal-Lauf", feld: "richter" }],
                    umfang: { verlangt: 1e5, einheit: "× Raffer des Jahrs der Welt", wortlaut: "Raffer ~10⁵: ein Jahr in ≤ 5 min", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "eiche_kronenform", richtung: "≥", wert: 0.7, wortlaut: "Eiche 0 → 100 Jahre Kronenform ≥ 0,7", feld: "richter" },
                        { wort: "sukzession", richtung: "≥", wert: 0.8, wortlaut: "in der Folge realer Chronosequenzen (Pionier → Busch → Hochwald) ≥ 0,8", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Jahre, die die Welt in einer Spielstunde ohne Sprung trägt", wortlaut: "10² Jahre: Generationen, Baum-Zeit, Sukzession", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "stadt_betretbar_s", richtung: "≤", wert: 5, wortlaut: "Stadt an Zufallsdatum betretbar ≤ 5 s", feld: "richter" }],
                    umfang: { verlangt: 1e4, einheit: "Jahre, die die Welt in einer Spielstunde ohne Sprung trägt", wortlaut: "10⁴ Jahre: Kulturen kommen und gehen", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "ego_bild_s", richtung: "≤", wert: 5, wortlaut: "Raffer an Zufallsdatum anhalten: Ego-Bild ≤ 5 s", feld: "richter" }],
                    umfang: { verlangt: 1e8, einheit: "Jahre der Zeitachse des Planeten", wortlaut: "10⁸ Jahre: Platten driften, Gebirge wachsen, Arten entstehen", feld: "umfang" },
                },
                8: {
                    soll: [{ wort: "halte_im_band", richtung: "≥", wert: 6, wortlaut: "an 6 Halten der Zukunft Kontinentlage, Ozean und Sonnenscheibe im Band der Rechnung", feld: "richter" }],
                    umfang: { verlangt: 5, einheit: "Ga Zukunft der Zeitachse des Planeten", wortlaut: "10 min Raffer −4,5 Ga → +5 Ga an 20 Orten", feld: "richter" },
                },
                9: {
                    soll: [
                        { wort: "ankunft_s", richtung: "≤", wert: 5, wortlaut: "Ankunft ≤ 5 s", feld: "richter" },
                        { wort: "sprung_bild_diff_pct", richtung: "≤", wert: 1, wortlaut: "zweimal gesprungen = dieselbe Welt (Bild-Diff ≤ 1 %)", feld: "richter" },
                    ],
                    umfang: { verlangt: 13.8, einheit: "Ga Zeitachse des Planeten", wortlaut: "Millisekunde ↔ 13,8 Ga (≈ 21 Dekaden) stufenlos", feld: "umfang" },
                },
            },
            lauf: async function zeitLauf(H, P, L) {
                const fs = require("fs");
                const path = require("path");
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const z = await L.ev(`
                    const st = r.state;
                    const alt = { tod: st.timeOfDay, phase: st.seasonPhase, season: st.season, auto: st.autoSeason, anker: r._saisonAnker, sonne: st._sonne ? Object.assign({}, st._sonne) : st._sonne };
                    const proben = [];
                    try {
                        for (const w of ["fruehling", "sommer", "herbst", "winter"]) {
                            if (!r.setSeason(w)) throw new Error("das Saison-Wort " + w + " gilt nicht");
                            const phase = st.seasonPhase;
                            for (let i = 0; i < 50; i++) {
                                st.timeOfDay = i / 50;
                                const d = r._sonnenRichtung();
                                proben.push([w, phase, i / 50, d.x, d.y, d.z]);
                            }
                        }
                    } finally {
                        st.timeOfDay = alt.tod; st.seasonPhase = alt.phase; st.season = alt.season; st.autoSeason = alt.auto; r._saisonAnker = alt.anker; st._sonne = alt.sonne;
                    }
                    const ops = Object.keys(r.dslEffects || {});
                    const saetze = (r.chatSystemPatterns || []).map((c) => String((c && c.example) || ""));
                    const worte = ops.concat(saetze);
                    const zeitlupe = worte.filter((k) => /zeitlupe|slow|langsam/i.test(k));
                    const raffer = worte.filter((k) => /raffer|time_?scale|zeit_?faktor|zeitfaktor/i.test(k));
                    const anker = await r._planetAnker();
                    const samen = r._planetSamen();
                    await r._fadenQuelle();
                    const achse = [];
                    for (const zeitMa of [-4500, -4000, 1000, 5000]) {
                        try {
                            const o = await r._planetAuftrag({ type: "planet-ort", samen, breite: (anker.breite * 180) / Math.PI, laenge: (anker.laenge * 180) / Math.PI, zeitMa });
                            achse.push({ zeitMa, ok: true, land: !!o.land });
                        } catch (e) {
                            achse.push({ zeitMa, ok: false, grund: String((e && e.message) || e).slice(0, 140) });
                        }
                    }
                    return {
                        proben, breite: anker.breite, samen,
                        tagMin: r.constructor.DAY_LENGTH_MIN_MINUTES, tagMax: r.constructor.DAY_LENGTH_MAX_MINUTES,
                        jahrSek: r._kalender().jahrK, jahrSekGesetzt: r._kalender().jahrK,
                        ops: ops.length, saetze: saetze.length, zeitlupe, raffer, achse,
                    };
                `);
                L.zeile("Zeit der Welt: " + JSON.stringify(Object.assign({}, z, { proben: z.proben.length })));
                const zahl = (x, n) => String(+Number(x).toFixed(n == null ? 1 : n)).replace(".", ",");
                // S1 · die Sonnenbahn gegen die Ephemeride der Breite (Meeus: sin h = sin φ sin δ + cos φ cos δ cos H)
                const PC = require(path.resolve("planet-core.js"));
                const K = PC.planetPlan(z.samen, PC.PLANET_ERDE).koerper;
                const RAD = Math.PI / 180;
                const phi = z.breite, eps = K.neigungRad, dreh = K.drehsinn || 1, hem = phi < 0 ? -1 : 1;
                const ephem = (p, t) => {
                    const dl = hem * Math.asin(Math.sin(eps) * Math.sin(2 * Math.PI * p));
                    const Hw = 2 * Math.PI * (t - 0.5) * dreh;
                    return [-Math.cos(dl) * Math.sin(Hw), Math.cos(phi) * Math.sin(dl) - Math.sin(phi) * Math.cos(dl) * Math.cos(Hw), Math.sin(phi) * Math.sin(dl) + Math.cos(phi) * Math.cos(dl) * Math.cos(Hw)];
                };
                const paare = z.proben.map(([w, p, t, x, y, zz]) => ({ w, t, g: [x, y, zz], e: ephem(p, t) })).filter((q) => q.g[1] > 0 || q.e[2] > 0);
                const winkel = (a, b) => Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b))))) / RAD;
                let best = { f: Infinity, psi: 0, m: 1, w: null, t: null };
                const pruefe = (psi, m) => {
                    const c = Math.cos(psi), sn = Math.sin(psi);
                    let f = 0, wo = null;
                    for (const q of paare) {
                        const [E, N, U] = q.e;
                        const a = winkel([E * c - m * N * sn, U, E * sn + m * N * c], q.g);
                        if (a > f) (f = a), (wo = q);
                        if (f >= best.f) return;
                    }
                    best = { f, psi, m, w: wo && wo.w, t: wo && wo.t };
                };
                for (const m of [1, -1]) for (let g = 0; g < 360; g += 1) pruefe(g * RAD, m);
                const grob = best.psi;
                for (let g = -1; g <= 1; g += 0.05) pruefe(grob + g * RAD, best.m);
                L.zeile("Sonnenbahn bei Breite " + zahl(phi / RAD, 2) + "°: Fehler " + zahl(best.f, 2) + "° (" + paare.length + " Proben, Nord " + zahl(best.psi / RAD) + "°, Spiegel " + best.m + ", am größten " + best.w + " t " + best.t + ")");
                // S2 · Zeitlupe: ein Verb des Spielers, das die Zeit dehnt
                await L.je(2, async () => {
                    if (!z.zeitlupe.length) return L.umfang(2, 1, "kein Verb des Spielers dehnt die Zeit: " + z.ops + " DSL-Ops (stamm/feld-dsl.js:926) und " + z.saetze + " Sätze der Konsole (stamm/feld-leben.js:1004) tragen keine Zeitlupe — die Welt läuft im Takt 1×");
                    L.leser(2, "Fallzeit und Sprung je Bild in der Zeitlupe (" + z.zeitlupe.join(", ") + "): kein Leser (scripts/werkbank.cjs:1892)");
                });
                // S3 · der Raffer des Tags: die Tag-Länge des Spielers (1 min je Tag = 1 440×)
                await L.je(3, async () => {
                    const raffer = 86400 / (z.tagMin * 60);
                    if (raffer < P.sprossen[3].umfang.verlangt && !z.raffer.length) return L.umfang(3, raffer, "die kürzeste Tag-Länge des Spielers ist " + z.tagMin + " min (stamm/daten.js:146): Raffer " + zahl(raffer, 0) + "×");
                    L.leser(3, "Zustand nach Raffer ↔ nach Echtzeit-Lauf: kein Leser, der Feld, Wetter und Bewohner-Orte eines gerafften Tags gegen den Echtzeit-Tag hält — der Raffer des Spielers ist die Tag-Länge (`setDayLength`, stamm/bild-himmel.js:2774, " + z.tagMin + " min je Tag)", raffer);
                });
                // S4 · der Raffer des Jahrs: ein Jahr der Welt dauert das Jahr des Kalenders (`_kalender().jahrK`, in Welt-Uhr × tagS ÷ normS)
                const jahrRaffer = (365.25 * 86400) / z.jahrSek;
                const jahreJeStunde = 3600 / z.jahrSek;
                await L.je(4, async () => {
                    if (jahrRaffer < P.sprossen[4].umfang.verlangt) return L.umfang(4, jahrRaffer, "ein Jahr der Welt dauert " + z.jahrSek + " s Spielzeit (Kalender jahrK " + z.jahrSekGesetzt + ", stamm/feld-leben.js `_kalender`): Raffer " + zahl(jahrRaffer, 0) + "×; kein Verb des Spielers rafft das Jahr auf ≤ 5 min");
                    L.leser(4, "Laub-Deckung und Bestand nach Raffer-Jahr gegen den Normal-Lauf: kein Leser (stamm/bild-himmel.js:898 `_tickSeason`)", jahrRaffer);
                });
                const ohneSprung = "eine Spielstunde trägt " + zahl(jahreJeStunde, 2) + " Jahre (ein Jahr = " + z.jahrSek + " s); der Sprung der Konsole nimmt nur ganze Ma (stamm/feld-leben.js:1278)";
                await L.je(5, async () => {
                    if (jahreJeStunde < P.sprossen[5].umfang.verlangt) return L.umfang(5, jahreJeStunde, ohneSprung);
                    L.leser(5, "Häuser-, Bewohner- und Kronen-Kurve über 10² Jahre: kein Leser (stamm/bild-himmel.js:898)", jahreJeStunde);
                });
                await L.je(6, async () => {
                    if (jahreJeStunde < P.sprossen[6].umfang.verlangt) return L.umfang(6, jahreJeStunde, ohneSprung);
                    L.leser(6, "Bildpaar vor/nach über 10⁴ Jahre: kein Leser (stamm/bild-himmel.js:898)", jahreJeStunde);
                });
                // S7–S9 · die Zeitachse des Planeten, gefragt im Planet-Faden
                const ok = z.achse.filter((a) => a.ok).map((a) => a.zeitMa);
                const achseText = "die Zeitachse des Planeten (planet-core im Planet-Faden) antwortet an " + z.achse.map((a) => a.zeitMa + " Ma " + (a.ok ? "ja" : "nein")).join(" · ");
                const minMa = ok.length ? Math.min(...ok) : 0, maxMa = ok.length ? Math.max(...ok) : 0;
                await L.je(7, async () => {
                    const jahre = (maxMa - minMa) * 1e6;
                    if (jahre < P.sprossen[7].umfang.verlangt) return L.umfang(7, jahre, achseText);
                    L.leser(7, "Raffer an Zufallsdatum anhalten: die Zeitachse des Planeten hat keinen Raffer — die Zeit ist ein Sprung der Konsole in ganzen Ma in eine neue Welt (stamm/feld-leben.js:1278 → stamm/netz-portal.js:660); kein Leser der Zeit bis zum Ego-Bild", jahre);
                });
                await L.je(8, async () => {
                    const ga = maxMa / 1000;
                    if (ga < P.sprossen[8].umfang.verlangt) return L.umfang(8, ga, achseText + " — kein Raffer, die Zukunft endet vor +5 Ga, der Anfang nach −4,5 Ga");
                    L.leser(8, "der ungeschnittene Raffer: kein Raffer über die Zeitachse (stamm/feld-leben.js:1278)", ga);
                });
                await L.je(9, async () => {
                    const ga = (maxMa - minMa) / 1000;
                    if (ga < P.sprossen[9].umfang.verlangt) return L.umfang(9, ga, achseText + " — " + zahl(ga, 2) + " Ga, nicht bis zum ersten Licht; der Sprung nimmt nur ganze Ma");
                    L.leser(9, "Sprung an jedes Datum: kein Leser der Ankunft je Datum (stamm/netz-portal.js:660)", ga);
                });
                // S1 · das Bildpaar des Saison-Worts an derselben Pose (sommer · winter · sommer): zuletzt, es kostet drei Schüsse
                await L.je(1, async () => {
                    const kam = await L.ev("r._loopCamera(performance.now()); const c = r.state.camera; return [...c.position.toArray(), ...c.getWorldDirection(new T.Vector3()).multiplyScalar(20).add(c.position).toArray()];");
                    const AU = require(path.resolve("scripts/lib/abnahme-urteil.cjs"));
                    const schuss = async (saison, name) => {
                        const b = await L.wb("/bild", { px: kam[0], py: kam[1], pz: kam[2], lx: kam[3], ly: kam[4], lz: kam[5], w: 640, h: 360, wahl: 0, uhr: 0.5, saison, datei: path.join(L.D, P.leiter + "-S1-" + name + ".png") }, 120);
                        return { datei: b.datei, bild: AU.pngLesen(fs.readFileSync(b.datei)) };
                    };
                    const abstand = (a, b) => {
                        if (a.W !== b.W || a.H !== b.H) throw new Error("die Bilder des Paars haben ungleiche Maße");
                        let s = 0;
                        for (let i = 0; i < a.u8.length; i += 4) s += (Math.abs(a.u8[i] - b.u8[i]) + Math.abs(a.u8[i + 1] - b.u8[i + 1]) + Math.abs(a.u8[i + 2] - b.u8[i + 2])) / 3;
                        return s / (a.W * a.H);
                    };
                    const so1 = await schuss("sommer", "sommer");
                    const wi = await schuss("winter", "winter");
                    const so2 = await schuss("sommer", "sommer-wieder");
                    const rauschen = abstand(so1.bild, so2.bild);
                    const saison = abstand(so1.bild, wi.bild);
                    const delta = saison - rauschen;
                    const taeter = [];
                    if (!(best.f <= 1)) taeter.push("die Sonnenbahn kennt weder Breite noch Saison (welt-licht.js:711 `sonnenRichtung`, gelesen über stamm/bild-himmel.js:1383): " + zahl(best.f, 2) + "° gegen die Ephemeride bei " + zahl(phi / RAD, 2) + "° Breite, am größten " + best.w + " t " + best.t);
                    if (!(delta >= 1)) taeter.push("das Saison-Wort winter ändert das Bild um " + zahl(saison, 2) + " Graustufen bei " + zahl(rauschen, 2) + " Rauschen (stamm/bild-himmel.js:963 `setSeason`)");
                    L.gemessen(1, { sonnenbahn_fehler_grad: +best.f.toFixed(3) }, {
                        erzeugt: z.tagMin <= 1 ? z.tagMax : 0,
                        welt: { sonnen_proben: paare.length, saison_bild_delta: +delta.toFixed(3) },
                        taeter: taeter.join(" · ") || null,
                        beleg: { bilder: [so1.datei, wi.datei, so2.datei], saison: +saison.toFixed(3), rauschen: +rauschen.toFixed(3) },
                    });
                });
            },
        })
    );

    // ─────────── erleben.spieler.gemeinsam — Viele Menschen, EINE Welt ───────────
    // Zählt die Spieler der Sitzung: der eigene Leib + die Peers der EINEN Netz-Tafel (`state.p2p.peers`, stamm/dirigent-kern.js:541). Jede
    // Sprosse verlangt eine Menge echter Spieler (2 · 10 · 10² · … · 10⁶); unter ihr `L.umfang` mit der gezählten Zahl, über ihr fehlt der
    // Leser der Latenz Taste an A → Bild bei B (`L.leser`).
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.gemeinsam",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "stamm/dirigent-kern.js", "stamm/netz-p2p.js"],
            welt: [{ wort: "peer_bilder", ab: 1, was: "Bilder, in denen ein Peer-Leib der Sitzung stand" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "pose_latenz_p95_ms", richtung: "≤", wert: 150, wortlaut: "Taste an A → Leib im Bild von B p95 ≤ 150 ms", feld: "richter" },
                        { wort: "pixel_abweichung_pct", richtung: "≤", wert: 1, wortlaut: "Welt-Bild an gleicher Kamera ≤ 1 % Pixel-Abweichung", feld: "richter" },
                    ],
                    umfang: { verlangt: 2, einheit: "Spieler der Sitzung (echte Geräte)", wortlaut: "2 Spieler, zwei physische Geräte", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "werk_bei_b_s", richtung: "≤", wert: 1, wortlaut: "Werk von A bei B ≤ 1 s", feld: "richter" },
                        { wort: "verlorene_edits", richtung: "≤", wert: 0, wortlaut: "0 verlorene Edits", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Spieler der Sitzung", wortlaut: "10 Spieler, ein Dorf", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "pose_latenz_p95_ms", richtung: "≤", wert: 150, wortlaut: "Pose-Latenz p95 ≤ 150 ms", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Spieler der Sitzung", wortlaut: "10² Spieler, eine Stadt", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "weltzeit_quote", richtung: "≥", wert: 0.99, wortlaut: "Welt-Zeit / Wand-Zeit ≥ 0,99", feld: "richter" },
                        { wort: "pose_latenz_p95_ms", richtung: "≤", wert: 200, wortlaut: "Pose-Latenz p95 ≤ 200 ms", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Spieler der Sitzung", wortlaut: "10³ (EVE-Größe, ohne Zeitdehnung)", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "pose_latenz_p95_ms", richtung: "≤", wert: 200, wortlaut: "Pose-Latenz p95 ≤ 200 ms an den echten Fenstern", feld: "richter" },
                        { wort: "zweiafc_pct", richtung: "≤", wert: 75, wortlaut: "2AFC ≤ 75 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e4, einheit: "Spieler der Sitzung", wortlaut: "10⁴ in einer Stadt", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "erreicht_pct", richtung: "≥", wert: 100, wortlaut: "A erreicht B über Reise und sieht ihn, 100 %", feld: "richter" }],
                    umfang: { verlangt: 1e5, einheit: "Spieler der Sitzung", wortlaut: "10⁵ auf einem Kontinent", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "ereignis_abweichung_s", richtung: "≤", wert: 1, wortlaut: "Ereignis-Zeitpunkt je echtem Fenster ±1 s", feld: "richter" },
                        { wort: "pixel_abweichung_pct", richtung: "≤", wert: 1, wortlaut: "(≤ 1 % Abweichung)", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Spieler der Sitzung", wortlaut: "10⁶ auf einem Planeten, verschiedene Zeiten und Rollen", feld: "umfang" },
                },
            },
            lauf: async function gemeinsamLauf(H, P, L) {
                const z = await L.ev("const p2p = r.state.p2p || {}; return { peers: p2p.peers instanceof Map ? p2p.peers.size : 0, an: !!p2p.enabled, verbunden: !!p2p.connected, raum: p2p.room || null };");
                L.zeile("Netz der Sitzung: " + JSON.stringify(z));
                const n = 1 + z.peers;
                for (const nr of [1, 2, 3, 4, 5, 6, 7])
                    await L.je(nr, async () => {
                        const v = P.sprossen[nr].umfang.verlangt;
                        if (n < v) return L.umfang(nr, n, "die Sitzung trägt " + n + " Spieler: den eigenen Leib und " + z.peers + " Peers (state.p2p.peers, stamm/dirigent-kern.js:541; p2p an " + z.an + ", verbunden " + z.verbunden + ")");
                        L.leser(nr, "Latenz und Welt-Bild über das Netz: kein Leser, der die Taste an A gegen das Bild bei B hält (stamm/netz-p2p.js:566 `_p2pHandleChannelMessage`)", n);
                    });
            },
        })
    );

    // ─────────── erleben.spieler.nichtleib — Sein, was kein Leib ist ───────────
    // Zählt an stadt-voll die Perspektiven, die der Spieler einnehmen kann (`playerSoulDefs` + `customSouls`: Seelen ohne Leib), die
    // Maschinen-Rollen der Welt (Baupläne, deren Rolle `_displayRole` machine oder vehicle nennt), die Bewohner der größten Siedlung und
    // die Jahre je Minute, die die Welt dem Spieler rafft (das Jahr des Kalenders, `_kalender().jahrK`). Der Fluss und die Stadt als Ganzes trägt die Welt, die
    // Perspektive nicht: `L.leser`; S5 schösse das Bildpaar erst bei einem Raffer von 10⁶ Jahren je Minute.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.nichtleib",
            sek: 60,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/koerper-seele.js", "stamm/bau-buch.js", "stamm/siedlung-bewohner.js", "stamm/bild-himmel.js", "gelaende-core.js", "stamm/feld-leben.js"],
            welt: [{ wort: "ding_proben", ab: 1, was: "Perspektiven ohne Leib, die der Spieler im Lauf einnahm" }],
            sprossen: {
                1: { soll: [{ wort: "gefaelle_abweichung_pct", richtung: "≤", wert: 5, wortlaut: "der Weg ist die Gefälle-Linie der Welt (Abweichung ≤ 5 %)", feld: "richter" }] },
                2: {
                    soll: [{ wort: "verben_je_ding", richtung: "≥", wert: 3, wortlaut: "je Ding 3 Verben mit Weltwirkung im Bildpaar", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Dinge ohne Leib, die der Spieler sein kann", wortlaut: "10 Dinge: Wolke, Wind, Feuer, Lava, Gletscher", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "wachstum_jahre", richtung: "≤", wert: 50, wortlaut: "das Wachstum folgt binnen 50 Spieljahren", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "100 Zufallsbewohner leben ihren Tag weiter", feld: "richter" },
                },
                4: {
                    soll: [
                        { wort: "verben_je_rolle", richtung: "≥", wert: 3, wortlaut: "je ≥ 3 arteigene Verben", feld: "richter" },
                        { wort: "panel_bauart_pct", richtung: "≥", wert: 70, wortlaut: "das Blind-Panel erkennt die Bauart ≥ 70 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Maschinen-Rollen der Welt (Baupläne der Rolle machine/vehicle)", wortlaut: "10 Maschinen-Rollen: je ≥ 3 arteigene Verben", feld: "richter" },
                },
                5: {
                    auge: {
                        pose: "Orbit-Bild des Planeten über der Lage des Ankers nach gesetzter Hebung, im Raffer",
                        vorbild: "Gegenlauf derselben Saat ohne Hebung; Erd-Muster Gebirge → Regenschatten → Wüste (Anden/Atacama)",
                    },
                    umfang: { verlangt: 1e6, einheit: "Jahre je Minute im Raffer des Planeten", wortlaut: "im Raffer von 10⁶ Jahren je Minute", feld: "tiefe" },
                },
                6: {
                    soll: [{ wort: "anteil_spielbar", richtung: "≥", wert: 0.9, wortlaut: "spielbar mit ≥ 3 Verben mit Weltwirkung ≥ 0,9", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Saaten der Sitzung", wortlaut: "N = 100 Zufalls-Dinge aus 10 Saaten", feld: "richter" },
                },
                7: {
                    soll: [{ wort: "anteil_spielbar", richtung: "≥", wert: 0.9, wortlaut: "spielbar mit ≥ 3 Verben mit Weltwirkung ≥ 0,9", feld: "richter", aus: 6 }],
                    umfang: { verlangt: 10, einheit: "Saaten der Sitzung", wortlaut: "N = 100 Zufalls-Dinge aus 10 Saaten", feld: "richter", aus: 6 },
                },
            },
            seite: { SAATEN },
            lauf: async function nichtleibLauf(H, P, L) {
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await L.ev(`
                    const st = r.state;
                    const seelen = Object.entries(r.playerSoulDefs || {}).concat(Object.entries(st.customSouls || {}));
                    const ohneLeib = seelen.filter(([k, d]) => !(d && (typeof d.build === "function" || (Array.isArray(d.bodyParts) && d.bodyParts.length)))).map(([k]) => k);
                    const t0 = performance.now();
                    const bps = Object.entries(st.blueprints || {});
                    const maschinen = [];
                    let geprueft = 0;
                    for (const [name, bp] of bps) {
                        if (performance.now() - t0 > 4000) break;
                        geprueft++;
                        const rolle = r._displayRole(bp);
                        if (rolle === "machine" || rolle === "vehicle") maschinen.push(name);
                    }
                    const FC = globalThis.__fachwerkCore;
                    let max = 0, sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (Array.isArray(S.liste)) n = S.liste.length;
                        else {
                            if (!FC || typeof FC.leuteVon !== "function") throw new Error("fachwerk-core leuteVon fehlt (stamm/siedlung-bewohner.js:839)");
                            for (const sl of (S.plan && S.plan.slots) || []) { const k = FC.leuteVon(sl.ov); if (k > 0) n += k; }
                        }
                        if (n > max) max = n;
                    }
                    return { saat: st.worldMeta && st.worldMeta.seed, seelen: seelen.map(([k]) => k), ohneLeib, maschinen: maschinen.length, maschinenNamen: maschinen.slice(0, 12), geprueft, bauplaene: bps.length, max, sied, jahrSek: r._kalender().jahrK };
                `);
                L.zeile("Perspektiven der Sitzung: " + JSON.stringify(z));
                const seelenText = z.seelen.length + " Seelen (" + z.seelen.join(", ") + "), " + z.ohneLeib.length + " ohne Leib";
                await L.je(1, async () =>
                    L.leser(1, "Perspektive Ding: kein Haken, der den Spieler zum Fluss macht — die Seele wechselt nur zwischen Leibern (stamm/koerper-seele.js:437 `_getSoulDef`, " + seelenText + "); den Lauf nach dem Gefälle trägt das Gesetz der Flüsse (gelaende-core.js:1953 `flussLaeufe`)")
                );
                await L.je(2, async () => {
                    if (z.ohneLeib.length < P.sprossen[2].umfang.verlangt) return L.umfang(2, z.ohneLeib.length, "der Spieler kann " + z.ohneLeib.length + " Dinge ohne Leib sein: " + seelenText + " (stamm/koerper-seele.js:437)");
                    L.leser(2, "je Ding 3 Verben mit Weltwirkung: kein Leser (stamm/koerper-seele.js:437)", z.ohneLeib.length);
                });
                await L.je(3, async () => {
                    if (z.max < P.sprossen[3].umfang.verlangt) return L.umfang(3, z.max, "die größte Siedlung der Sitzung trägt " + z.max + " Bewohner (" + z.sied + " Siedlungen)");
                    L.leser(3, "Perspektive Stadt: kein Haken, der den Spieler zur Stadt macht und eine Vorliebe (Hafen, Höhe) ins Wachstum gibt — die Siedlung kennt keinen Willen des Spielers (stamm/siedlung-bewohner.js:275 `_bewohnerMelden`)", z.max);
                });
                await L.je(4, async () => {
                    if (z.maschinen < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.maschinen, "die Welt trägt " + z.maschinen + " Baupläne der Rolle machine/vehicle (stamm/bau-buch.js:637 `_displayRole`; " + (z.maschinenNamen.join(", ") || "keine") + "; geprüft " + z.geprueft + " von " + z.bauplaene + ")");
                    L.leser(4, "Maschine sein: kein Haken, der den Spieler in die Maschine setzt — `mountArchitecture` trägt den Leib, nie Sinne und Verben der Maschine (stamm/koerper-fahrt.js:1158)", z.maschinen);
                });
                await L.je(5, async () => {
                    const jahreJeMinute = 60 / z.jahrSek;
                    if (jahreJeMinute < P.sprossen[5].umfang.verlangt) return L.umfang(5, jahreJeMinute, "die Welt rafft " + jahreJeMinute + " Jahre je Minute (ein Jahr = " + z.jahrSek + " s, stamm/bild-himmel.js:970); die Zeitachse des Planeten ist nur ein Sprung der Konsole (stamm/feld-leben.js:1278)");
                    await L.auge(5, { erzeugt: jahreJeMinute, b: { wahl: 0 } });
                });
                // S6 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort; je Saat
                // die Seelen ohne Leib und die Epoche der Welt der Saat. Die Schleife läuft zuletzt (S1–S5 lasen die Stadt der Sitzung) und
                // endet 4 s vor der Frist; S7 urteilt über dieselbe Fahrt (sein Umfang ist der von S6).
                let saaten = null;
                const seelenJe = function (r) {
                    const st = r.state, teil = r._gelaende().ort.teil;
                    const seelen = Object.entries(r.playerSoulDefs || {}).concat(Object.entries(st.customSouls || {}));
                    const ohne = seelen.filter(([k, d]) => !(d && (typeof d.build === "function" || (Array.isArray(d.bodyParts) && d.bodyParts.length)))).length;
                    return { ohne, zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0 };
                };
                await L.je(6, async () => {
                    const v = P.sprossen[6].umfang.verlangt;
                    const arg = { stamm: P.leiter + "-s6", n: v, bis: Date.now() + Math.max(0, (L.rest() - 4) * 1000) };
                    const s = (saaten = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", " + seelenJe + ");", Math.max(5, L.rest() - 2)));
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("nichtleib S6 Saaten " + JSON.stringify(s));
                    const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m)";
                    const ohne = "Seelen ohne Leib je Saat " + (s.je.map((x) => x.z.ohne).join("/") || "—");
                    if (s.je.length < v) return L.umfang(6, s.je.length, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Saaten (" + ohne + "; " + zeit + "; Ende: " + s.grund + ")");
                    L.leser(6, "Zufalls-Dinge spielen: keine Saat trägt ein Ding, das der Spieler sein kann — die Seele wechselt nur zwischen Leibern (stamm/koerper-seele.js:437 `_getSoulDef`), " + ohne + " (" + zeit + ")", s.je.length);
                });
                await L.je(7, async () => {
                    const s = saaten;
                    if (!s || s.fehler) throw new Error("S7 urteilt über die Fahrt von S6, sie fuhr nicht" + (s && s.fehler ? " (" + s.fehler + ")" : ""));
                    const v = P.sprossen[7].umfang.verlangt;
                    const ep = "die Epoche je Saat (zeitMa) " + (s.je.map((x) => x.z.zeitMa).join("/") || "—");
                    if (s.je.length < v) return L.umfang(7, s.je.length, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Saaten (" + ep + "; Ende: " + s.grund + ")");
                    L.leser(7, "über Welten und Epochen: jede Saat erwacht in EINER Epoche, kein Lauf wechselt sie (" + ep + ") — die Epoche wechselt nur der Satz reise als eigene Welt (stamm/feld-leben.js:1224); die Zufalls-Dinge fehlen wie in S6", s.je.length);
                });
            },
        })
    );

    // ─────────── erleben.spieler.forscher — Instrument und Ursache — der Blick des Forschers ───────────
    // Zählt die Instrumente der Welt an den Affordanzen ihrer Baupläne (`computeBlueprintAffordances`: das Fernrohr ist magnifying, ein
    // Mikroskop, Thermometer, Kompass, Lot oder ein Zeit-Instrument kennt das Profil nicht), liest den Mond (`state.moonMesh`: Karte oder
    // Farbknoten am Stoff) und das Feld der Welt (`worldFieldAt`). Wo das Ding fehlt, das die Messung bräuchte (Krater, Feldkarte), nennt
    // `L.leser` den Haken; die Zahl der Instrumente und Lesungen urteilt `L.umfang`.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.forscher",
            sek: 30,
            pfad: ["scripts/werkbank.cjs", "stamm/bau-teile.js", "stamm/koerper-fahrt.js", "stamm/dirigent-ankunft.js", "stamm/feld-leben.js"],
            welt: [{ wort: "messungen", ab: 1, was: "Messungen eines Instruments gegen den zweiten Weg in der Welt" }],
            sprossen: {
                1: { soll: [{ wort: "krater_lagefehler_pct", richtung: "≤", wert: 1, wortlaut: "Lagefehler ≤ 1 %", feld: "richter" }] },
                2: {
                    soll: [{ wort: "abweichung_pct", richtung: "≤", wert: 5, wortlaut: "(Eis schmilzt bei 0, Lot gegen Tauchgang) ±5 %", feld: "richter" }],
                    umfang: { verlangt: 5, einheit: "Instrumente der Welt", wortlaut: "5 Instrumente: dazu Mikroskop, Thermometer, Kompass, Lot", feld: "umfang" },
                },
                3: { soll: [{ wort: "treffer_pct", richtung: "≥", wert: 90, wortlaut: "die Karte sagt den Ort voraus, an dem der Spieler das Ding dann antrifft (Herde, Strömung) ≥ 90 %", feld: "richter" }] },
                4: {
                    soll: [{ wort: "ereignis_pct", richtung: "≥", wert: 90, wortlaut: "der Sprung in die gelesene Zeit zeigt das Ereignis ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Lesungen eines Zeit-Instruments der Welt", wortlaut: "10 Lesungen (Eiszeit im Kern, Brand im Ring)", feld: "richter" },
                },
                5: { soll: [{ wort: "folge_pct", richtung: "≥", wert: 80, wortlaut: "die von der Feldkarte vorhergesagte Folge tritt ein ≥ 80 %", feld: "richter" }] },
                6: { soll: [{ wort: "zuwachs_prozentpunkte", richtung: "≥", wert: 30, wortlaut: "+30 Prozentpunkte", feld: "richter" }] },
                7: {
                    soll: [
                        { wort: "abweichung_pct", richtung: "≤", wert: 5, wortlaut: "Wert ±5 % gegen den zweiten Weg", feld: "richter" },
                        { wort: "vorhersage_pct", richtung: "≥", wert: 70, wortlaut: "Vorhersage ≥ 70 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "(Saat, Instrument)-Paare der Sitzung", wortlaut: "100 Zufalls-Messungen über Saaten", feld: "richter" },
                },
            },
            lauf: async function forscherLauf(H, P, L) {
                const z = await L.ev(`
                    const st = r.state;
                    const t0 = performance.now();
                    const bps = Object.entries(st.blueprints || {});
                    const art = {};
                    let geprueft = 0;
                    for (const [name, bp] of bps) {
                        if (performance.now() - t0 > 4000) break;
                        geprueft++;
                        const a = r.computeBlueprintAffordances(bp) || {};
                        for (const k of Object.keys(a)) if (a[k]) (art[k] = art[k] || []).push(name);
                    }
                    const m = st.moonMesh;
                    const mat = m && m.material;
                    const gp = m && m.geometry && m.geometry.parameters;
                    return {
                        saat: st.worldMeta && st.worldMeta.seed, bauplaene: bps.length, geprueft,
                        arten: Object.fromEntries(Object.entries(art).map(([k, v]) => [k, v.length])),
                        fernrohre: (art.magnifying || []).slice(0, 6),
                        mond: !!m, mondKarte: !!(mat && (mat.map || mat.colorNode)), mondTeile: gp ? [gp.widthSegments, gp.heightSegments] : null,
                        feld: typeof r.worldFieldAt === "function",
                    };
                `);
                L.zeile("Instrumente der Welt: " + JSON.stringify(z));
                // die Instrumente, die das Affordanz-Profil kennt (stamm/bau-teile.js:202): nur das Fernrohr (magnifying)
                const instrumente = ["magnifying"].filter((k) => z.arten[k] > 0);
                const artenText = Object.entries(z.arten).map(([k, n]) => k + " " + n).join(", ") || "keine";
                await L.je(1, async () =>
                    L.leser(1,
                        "Krater des Mondes: die Mondscheibe ist eine Kugel " + JSON.stringify(z.mondTeile) + (z.mondKarte ? " mit Karte" : " ohne Karte und Farbknoten") +
                        " (stamm/dirigent-ankunft.js:340) — kein Krater, dessen Lage Fernrohr und Anflug teilen; kein Anflug an den Mond; das Fernrohr vergrößert nur das Bild (stamm/koerper-fahrt.js:2246 `setZoomActive`, " + (z.arten.magnifying || 0) + " Fernrohr-Baupläne)")
                );
                await L.je(2, async () => {
                    if (instrumente.length < P.sprossen[2].umfang.verlangt) return L.umfang(2, instrumente.length, "die Affordanzen der Baupläne (stamm/bau-teile.js:202; " + artenText + "; geprüft " + z.geprueft + " von " + z.bauplaene + ") kennen als Instrument nur das Fernrohr — kein Mikroskop, Thermometer, Kompass, Lot");
                    L.leser(2, "je Instrument 20 Messungen gegen den zweiten Weg: kein Leser (stamm/bau-teile.js:202)", instrumente.length);
                });
                const feldkarte = "Feldkarte: kein Haken, der ein Feld der Welt (" + (z.feld ? "`worldFieldAt`, stamm/feld-leben.js:1793" : "kein `worldFieldAt`") + ") als Karte vor den Spieler legt";
                await L.je(3, async () => L.leser(3, feldkarte + " — Wärme, Strömung, Wind, Bestand, Dichte der Menschen"));
                await L.je(4, async () => {
                    const zeitInstrumente = ["bohrkern", "jahresringe", "schichtprofil", "sternspektrum"].filter((k) => z.arten[k] > 0);
                    if (zeitInstrumente.length < 1) return L.umfang(4, 0, "kein Zeit-Instrument in den Affordanzen der Baupläne (stamm/bau-teile.js:202; " + artenText + ") — 0 Lesungen der Vergangenheit");
                    L.leser(4, "Lesung → Sprung in die gelesene Zeit: kein Leser (stamm/feld-leben.js:1278)");
                });
                await L.je(5, async () => L.leser(5, feldkarte + " — die vorhergesagte Folge eines Versuchs hat keine Karte, die sie nennt"));
                await L.je(6, async () => L.leser(6, "Lernen blinder Neulinge: kein Protokoll im Spiel (vor/nach 60 min, Kontrollgruppe Lehrfilm) — ein Panel nach R11 (vision/REGELN.md:17), kein Haken der Welt"));
                await L.je(7, async () => {
                    const n = 1 * instrumente.length;
                    if (n < P.sprossen[7].umfang.verlangt) return L.umfang(7, n, "eine Saat (" + z.saat + ") × " + instrumente.length + " Instrumente = " + n + " (Saat, Instrument)-Paare");
                    L.leser(7, "Messung gegen den zweiten Weg über Saaten: kein Leser (stamm/bau-teile.js:202)", n);
                });
            },
        })
    );
}

// ═══════════════════════════════════════ Perspektive schoepfen ═══════════════════════════════════════
{
    // ─────────── erleben.schoepfen.hebel — Der Hebel: Geste, Plan, Gott — Folge im Ego ───────────
    // S1 baut EIN Werk über den echten Weg des Spielers (Linse diag-werkstatt-weg: Hotbar · schöpfer · Haus · Ego, Eingaben am
    // Ereignis-Strom, Wille → Bild aus `zeiten`, Bau-Hash = L0) und fährt den Konstruktions-Prüfsatz (spec/pruefsatz/bauen-k3.json) über
    // `confirmBuild` + `tickAffordances` in der Welt der Sitzung; der Bildvergleich Studio ↔ Welt hat keinen Leser (dann `leser`, sonst ROT
    // beim Täter). S3/S4 sprechen die Geste im echten Chat (`processChatCommand`) und zählen die Werke je Geste; S5–S9 lesen Op-Tafel und Bewohner.
    LEITERN.push(
        leiter({
            leiter: "erleben.schoepfen.hebel",
            sek: 60,
            mutiert: true,
            pfad: [
                "scripts/diag-werkstatt-weg.cjs",
                "spec/pruefsatz/bauen-k3.json",
                "stamm/werkstatt-bauen.js",
                "stamm/feld-leben.js",
                "stamm/feld-sprache.js",
                "stamm/feld-dsl.js",
                "stamm/feld-nexus.js",
                "stamm/siedlung-ort.js",
                "stamm/siedlung-satz.js",
                "stamm/siedlung-bewohner.js",
                "stamm/gelaende-chunks.js",
            ],
            welt: [{ wort: "werke_neu", ab: 1, was: "Werke, die die Geste neu in die Welt setzte (state.architectures)" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "wille_bild_s", richtung: "≤", wert: 1, wortlaut: "Wille → Bild ≤ 1 s", feld: "preis" },
                        { wort: "eingaben", richtung: "≤", wert: 3, wortlaut: "1 Werk über ≤ 3 Eingaben", feld: "umfang" },
                    ],
                    welt: [
                        { wort: "werk_steht", ab: 1, was: "das Werk des Wegs steht in der Welt (wegLauf steht)" },
                        { wort: "eingaben_echt_pct", ab: 100, was: "echte Eingaben am Ereignis-Strom (isTrusted) in %" },
                        { wort: "bau_gleich_l0", ab: 1, was: "Bau-Hash des Werks = L0-Bau des Studio-Plans" },
                        { wort: "pruefsatz_richtig_pct", ab: 100, was: "Konstruktionen des Prüfsatzes richtig geurteilt in % (stabil steht, instabil stürzt sichtbar mit Zeile)" },
                    ],
                },
                2: {
                    soll: [{ wort: "blind_unterscheidet_pct", richtung: "≤", wert: 60, wortlaut: "Blindurteil unterscheidet ≤ 60 %", feld: "richter" }],
                    auge: { pose: "dorf third Mittag — der Hof eines Spieler-Werks neben einem Hof des Plans derselben Region", vorbild: "Gesetz-Hof derselben Region (Hof des fachwerk-Plans der Siedlung)" },
                },
                3: {
                    soll: [{ wort: "bewohner_wege_neu", richtung: "≥", wert: 1, wortlaut: "nach 1 Spieltag: Anteil Bewohner-Wege über den neuen Weg > 0", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Werke einer Weg-Geste", wortlaut: "10¹: einen Weg setzen", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "belegung_abw_pct", richtung: "≤", wert: 10, wortlaut: "Belegung ± 10 % gegen ein Gesetz-Viertel", feld: "richter" },
                        { wort: "blind_pinsel_pct", richtung: "≤", wert: 60, wortlaut: "Blindurteil Pinsel ↔ Gesetz ≤ 60 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Werke je Geste", wortlaut: "10² Werke je Geste: Viertel-Pinsel", feld: "umfang" },
                    auge: { pose: "dorf third Mittag — das gemalte Viertel neben einem Gesetz-Viertel", vorbild: "Gesetz-Viertel derselben Region (fachwerk-Plan)" },
                },
                5: {
                    soll: [
                        { wort: "edit_fernring_s", richtung: "≤", wert: 1, wortlaut: "Edit im Fern-Ring ≤ 1 s", feld: "preis" },
                        { wort: "blind_plausibel_pct", richtung: "≥", wert: 70, wortlaut: "verlegte Siedlung im Bildpaar plausibel (Blindurteil ≥ 70 %)", feld: "richter" },
                    ],
                    auge: { pose: "gipfel-blick third — derselbe Talgrund vor dem Eingriff und nach 1 Spieljahr", vorbild: "reale Landschaft nach einer Flussverlegung (Luftbild-Paar vorher/nachher)" },
                },
                6: {
                    soll: [{ wort: "stadtplan_band_pct", richtung: "≥", wert: 80, wortlaut: "Stadtplan-Statistik im Band realer Städte gleicher Epoche ≥ 80 % in 100 Saaten", feld: "richter" }],
                    umfang: { verlangt: 100000, einheit: "Bewohner unter einem Gesetz", wortlaut: "ein Gesetz für 10⁵–10⁷ Bewohner", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "domaenen", richtung: "≥", wert: 3, wortlaut: "Kopplungskette: Eingriff → ≥ 3 Domänen messbar", feld: "richter" }],
                    umfang: { verlangt: 1e8, einheit: "Bewohner eines Reichs", wortlaut: "ein Reich von 10⁸", feld: "umfang" },
                },
                8: { soll: [{ wort: "erdmuster_pct", richtung: "≥", wert: 80, wortlaut: "gehorcht dem Erd-Muster (Gebirge an Nähten, Wüsten an Wendekreisen) ≥ 80 %", feld: "richter" }] },
                9: { soll: [{ wort: "folge_anteil", richtung: "≥", wert: 0.8, wortlaut: "Folge sichtbar (Kleidung, Ernte, Stimmung), Anteil ≥ 0,8", feld: "richter" }] },
            },
            lauf: async function hebelLauf(H, P, L) {
                // ── S1 · EIN Werk über den Weg des Spielers + der Prüfsatz der Konstruktionen ──
                await L.je(1, async () => {
                    const W = H.linse("scripts/diag-werkstatt-weg.cjs", ["probe", "wegHelfer", "bauWeg", "wegLauf", "WERKE", "TEILE"]);
                    const { page } = await H.verbinde();
                    await page.setViewport({ width: 1280, height: 720 });
                    // die Schleife des Spiels läuft wie im Spiel (die Werkbank hält sie zwischen ihren Befehlen an)
                    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop((t) => window.anazhRealm._gameLoopTick(t)));
                    H.beimAbbau(() => page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null)));
                    await H.ereignisStrom(page);
                    const { frei } = await page.evaluate(W.probe, { nurOrt: true });
                    if (!frei) throw new Error("kein freier, trockener Ort um den Spieler (Linse diag-werkstatt-weg probe nurOrt)");
                    await H.binnen(page.evaluate(() => window.__weltStehtNach()), 15000);
                    if (await page.evaluate(() => window.anazhRealm._ladeschirmSteht())) throw new Error("der Ladeschirm steht — keine Taste der Welt");
                    await page.evaluate(W.wegHelfer, { frei, teile: { eigen_huette: W.TEILE.eigen_huette }, bild: true });
                    let offen = true;
                    H.beimAbbau(() => offen && W.bauWeg(page, "ende"));
                    await W.bauWeg(page, "konsum");
                    const e = await H.binnen(W.wegLauf(page, { lage: "schöpfer", weg: "hotbar", name: W.WERKE.Haus, sicht: "Ego" }), Math.max(5, H.rest() - 30) * 1000, { fehler: "Frist der Leiter" });
                    offen = false;
                    await W.bauWeg(page, "ende");
                    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
                    // der Prüfsatz in der Welt: gesetzt über den Bau-Weg (Hotbar, Phantom, confirmBuild), 150 Takte zu 1/30 s
                    const pruefFn = function (r, T, arg) {
                        const st = r.state;
                        const bm = st.buildMode;
                        const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
                        const setze = (name, plan, x, z) => {
                            const key = "__pruef_" + name;
                            const vor = new Set(st.architectures);
                            const modus = r.getGameMode();
                            const slot = st.hotbar[6];
                            const teil = (p) => ({ shape: p[7] || "box", material: p[6] || "stein", position: { x: p[0], y: p[1], z: p[2] }, size: { x: p[3], y: p[4], z: p[5] }, rotation: { x: 0, y: 0, z: p[8] || 0 } });
                            st.blueprints[key] = { name: key, label: name, parts: plan.map(teil) };
                            r.setGameMode("schöpfer");
                            r._clearBuildMode();
                            bm.slotIndex = -1;
                            r.setHotbarSlot(6, key);
                            r.selectHotbarSlot(6);
                            bm.phantomMesh.position.set(x, r._voxelSurfaceY(x, z), z);
                            bm.phantomMesh.rotation.y = 0;
                            bm.phantomOnGround = true;
                            try {
                                r.confirmBuild();
                            } finally {
                                r._clearBuildMode();
                                r.setHotbarSlot(6, slot);
                                r.setGameMode(modus);
                            }
                            return st.architectures.find((x2) => !vor.has(x2) && x2.type === key) || null;
                        };
                        const bild = (e) => {
                            const m = new T.Matrix4();
                            if (e.mesh) m.compose(e.mesh.position, e.mesh.quaternion, e.mesh.scale);
                            else if (e.instSlots && e.instSlots.length) st.archInstanceGroups.get(e.instSlots[0].key).mesh.getMatrixAt(e.instSlots[0].slot, m);
                            else return null;
                            const p = new T.Vector3();
                            const q = new T.Quaternion();
                            m.decompose(p, q, new T.Vector3());
                            return { p, q };
                        };
                        const grad = (a, b) => (360 / Math.PI) * Math.acos(Math.min(1, Math.abs(a.q.dot(b.q))));
                        const f = arg.frei;
                        const pos0 = st.playerMesh.position.clone();
                        st.playerMesh.position.set(f.x, f.y + 1.2, f.z);
                        const aus = {};
                        try {
                            for (const art of ["stabil", "instabil"])
                                for (const name of Object.keys(arg.satz[art])) {
                                    const n0 = zeilen().length;
                                    const e = setze(name, arg.satz[art][name], f.x + 12, f.z);
                                    const b0 = e && bild(e);
                                    const o = { art, neigung: 0, fall: 0 };
                                    for (let t = 0; t < 150 && b0 && st.architectures.includes(e); t++) {
                                        r.tickAffordances(1 / 30);
                                        const b = st.architectures.includes(e) && bild(e);
                                        if (b) {
                                            o.neigung = Math.max(o.neigung, grad(b0, b));
                                            o.fall = Math.max(o.fall, b0.p.y - b.p.y);
                                        }
                                    }
                                    const da = !!e && st.architectures.includes(e);
                                    o.gesetzt = !!b0;
                                    o.steht = da && o.neigung < 0.5 && o.fall < 0.01;
                                    o.zeile = (zeilen().slice(n0).find((l) => l.includes(name)) || "").slice(0, 120);
                                    o.richtig = o.gesetzt && (art === "stabil" ? o.steht : (o.neigung >= 30 || o.fall >= 0.3) && !!o.zeile);
                                    o.neigung = +o.neigung.toFixed(2);
                                    o.fall = +o.fall.toFixed(3);
                                    if (da) r.removeArchitecture(e);
                                    aus[name] = o;
                                }
                        } finally {
                            for (const k of Object.keys(st.blueprints)) if (k.startsWith("__pruef_")) delete st.blueprints[k];
                            st.playerMesh.position.copy(pos0);
                        }
                        return aus;
                    };
                    const satz = require(require("path").resolve("spec/pruefsatz/bauen-k3.json"));
                    const ps = await L.ev("return (" + pruefFn + ")(r, T, " + JSON.stringify({ frei, satz: { stabil: satz.stabil, instabil: satz.instabil } }) + ");", 45);
                    const faelle = Object.entries(ps || {});
                    const falsch = faelle.filter(([, o]) => !o.richtig);
                    const z = (e && e.zeiten) || [];
                    const werte = { wille_bild_s: Number.isFinite(z[4]) ? z[4] / 1000 : null, eingaben: Number.isFinite(e && e.eingaben) ? e.eingaben : null };
                    const welt = {
                        werk_steht: e && e.steht === 1 ? 1 : 0,
                        eingaben_echt_pct: e && e.eingaben > 0 ? (100 * (e.eingaben - (e.unecht || 0))) / e.eingaben : 0,
                        bau_gleich_l0: e && e.bau && e.bau === e.soll ? 1 : 0,
                        pruefsatz_richtig_pct: faelle.length ? (100 * (faelle.length - falsch.length)) / faelle.length : 0,
                    };
                    const taeter = [
                        e && e.fehler ? "Weg: " + e.fehler : null,
                        e && e.unecht ? e.unecht + " unechte Eingaben" : null,
                        e && e.bau !== e.soll ? "Bau-Hash ≠ L0 (" + e.bau + " / " + e.soll + ")" : null,
                        ...falsch.map(([k, o]) => "Prüfsatz " + k + " (" + o.art + ": steht " + o.steht + ", Neigung " + o.neigung + "°, Fall " + o.fall + " m, Zeile „" + o.zeile + "“)"),
                    ].filter(Boolean);
                    L.zeile("hebel S1 Weg " + JSON.stringify({ steht: e && e.steht, eingaben: e && e.eingaben, zeiten: z, kalt: e && e.kalt }) + " · Prüfsatz " + (faelle.length - falsch.length) + "/" + faelle.length);
                    const sollOk = werte.wille_bild_s !== null && werte.wille_bild_s <= 1 && werte.eingaben !== null && werte.eingaben <= 3;
                    const weltOk = welt.werk_steht >= 1 && welt.eingaben_echt_pct >= 100 && welt.bau_gleich_l0 >= 1 && welt.pruefsatz_richtig_pct >= 100;
                    if (sollOk && weltOk)
                        return L.leser(
                            1,
                            "Bildvergleich Studio ↔ Welt im Band: kein Leser vergleicht das Bild des Werks im Studio mit dem in der Welt — der Haken säße am Bild-Weg der Linse (scripts/diag-werkstatt-weg.cjs:935 wegHelfer bild); gemessen: Wille → Bild " +
                                werte.wille_bild_s + " s, " + werte.eingaben + " Eingaben, Prüfsatz " + faelle.length + "/" + faelle.length + " richtig"
                        );
                    L.gemessen(1, werte, { erzeugt: welt.werk_steht, welt, taeter: taeter.join(" · ") || "Wille → Bild " + werte.wille_bild_s + " s, " + werte.eingaben + " Eingaben" });
                });
                // ── die Geste im echten Chat (der Halt der Messung fällt für sie, danach steht er wieder): Werke je Geste ──
                const gesteFn = function (r, saetze) {
                    const st = r.state;
                    const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
                    const uhr = st.weatherEffectTime;
                    const aus = [];
                    st.weatherEffectTime = 0;
                    try {
                        for (const satz of saetze) {
                            const vor = new Set(st.architectures);
                            const n0 = zeilen().length;
                            const t0 = performance.now();
                            r.processChatCommand(satz);
                            const ms = performance.now() - t0;
                            const neu = st.architectures.filter((a) => !vor.has(a));
                            aus.push({ satz, neu: neu.length, werke: neu.filter((a) => a.werk).length, ms: Math.round(ms), zeile: zeilen().slice(n0 + 1).join(" | ").slice(0, 200) });
                            for (const a of neu) r.removeArchitecture(a);
                        }
                    } finally {
                        st.weatherEffectTime = uhr;
                    }
                    return aus;
                };
                const worte = await L.ev("return { haeuser: !!r._studioBlueprintForWord('häuser'), weg: r._studioBlueprintForWord('weg') || null, werke: (r.state.architectures || []).filter((a) => a.werk).length };");
                const saetze = ["bau mir einen weg", "bau mir 100 " + (worte.haeuser ? "häuser" : "haus")];
                const g = await L.ev("return (" + gesteFn + ")(r, " + JSON.stringify(saetze) + ");", 40).then(
                    (x) => x,
                    (e) => ({ fehler: String((e && e.message) || e).split("\n")[0] })
                );
                L.zeile("hebel Geste " + JSON.stringify(g).slice(0, 400));
                // ── S2 · ein Werk wird Teil des Orts ──
                await L.je(2, async () =>
                    L.leser(
                        2,
                        "ein Spieler-Werk als Slot eines Orts: kein Leser führt es — der Plan der Siedlung kennt nur die Slots seines Gesetzes (stamm/siedlung-ort.js:738), das Werk trägt nur die Marke `werk` (stamm/siedlung-satz.js:1358); die Welt trägt " +
                            worte.werke + " Spieler-Werke"
                    )
                );
                // ── S3 · einen Weg setzen ──
                await L.je(3, async () => {
                    if (g.fehler) throw new Error("die Geste warf: " + g.fehler);
                    const w = g[0];
                    if (w.werke < P.sprossen[3].umfang.verlangt)
                        return L.umfang(3, w.werke, "„" + w.satz + "“ setzt " + w.werke + " Werke (Wort „weg“ im Katalog: " + (worte.weg || "keines") + ", Antwort „" + w.zeile + "“) — das Wegenetz ist eine Funktion des Plans (`_wegeNetzGrund`, stamm/siedlung-ort.js:3231), keine Geste legt einen Weg hinein");
                    L.leser(3, "Bewohner-Wege über den neuen Weg: kein Leser — das Wegenetz der Bewohner liest nur den Plan (stamm/siedlung-ort.js:3231 `_wegeNetzGrund`)", w.werke);
                });
                // ── S4 · der Viertel-Pinsel: 100 Werke je Geste ──
                await L.je(4, async () => {
                    if (g.fehler) throw new Error("die Geste warf: " + g.fehler);
                    const w = g[1];
                    if (w.werke < P.sprossen[4].umfang.verlangt)
                        return L.umfang(4, w.werke, "„" + w.satz + "“ setzt " + w.werke + " Werke in " + w.ms + " ms — spawn_studio klemmt die Anzahl auf 1–24 (stamm/feld-dsl.js:2019), kein Viertel-Pinsel");
                    L.leser(4, "Belegung gegen ein Gesetz-Viertel: kein Leser der Belegung eines gemalten Viertels (stamm/siedlung-ort.js:738)", w.werke);
                });
                // ── S5–S9 · die Op-Tafel (die EINE Quelle der Taten, `dslEffects`) und die Bewohner der Sitzung ──
                const t = await L.ev(
                    "const ops = Object.keys(r.dslEffects || {}); const st = r.state; const FC = globalThis.__fachwerkCore; let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === 'function' ? S.plan.slots.reduce((a, sl) => a + Math.max(0, FC.leuteVon(sl.ov) | 0), 0) : 0); } const p = st.playerMesh ? st.playerMesh.position : null; return { ops: ops.length, fluss: ops.filter((o) => /fluss|river|wasserlauf|berg|erosion|abtrag/i.test(o)), planet: ops.filter((o) => /platte|plate|tekton|vulkan|volcano|klima|climate|zeitalter|epoch/i.test(o)), system: ops.filter((o) => /sonne|sun|planet|orbit|stern|star/i.test(o)), bew, sied, pos: p ? [Math.round(p.x), Math.round(p.z)] : null };"
                );
                L.zeile("hebel Op-Tafel " + JSON.stringify(t));
                await L.je(5, async () =>
                    L.leser(
                        5,
                        "Fluss umleiten, Berg abtragen: kein Verb der Geste in der Op-Tafel (" + t.ops + " Ops, Treffer [" + t.fluss.join(", ") + "], stamm/feld-dsl.js:926 dslEffects) und kein Raffer über 1 Spieljahr — der Haken säße im Wortschatz der DSL (stamm/feld-nexus.js:1068 `_dslVokabular`)"
                    )
                );
                // der Umfang als Argument: erreicht die Welt ihn, fehlt der Leser des Urteils (nie ein Umfang, der sich widerspricht)
                const urteile = (nr, erzeugt, was, fehlt) => (erzeugt >= P.sprossen[nr].umfang.verlangt ? L.leser(nr, fehlt, erzeugt) : L.umfang(nr, erzeugt, was));
                await L.je(6, async () =>
                    urteile(6, t.bew, "die Welt trägt an der Pose " + JSON.stringify(t.pos) + " " + t.bew + " Bewohner in " + t.sied + " Siedlungen — keine Stadt von 10⁵ unter einem Gesetz", "Stadtplan-Statistik nach 50 Spieljahren: kein Leser, kein Raffer (stamm/siedlung-ort.js:738)")
                );
                await L.je(7, async () => urteile(7, t.bew, "die Welt trägt " + t.bew + " Bewohner in " + t.sied + " Siedlungen — kein Reich von 10⁸, keine Megastruktur ≥ 10 km", "Kopplungskette über 3 Domänen: kein Leser (stamm/feld-dsl.js:926)"));
                await L.je(8, async () =>
                    L.leser(8, "Platte schieben, Vulkan, Klima, Zeitalter je Geste: kein Verb in der Op-Tafel (Treffer [" + t.planet.join(", ") + "], stamm/feld-dsl.js:926), kein Raffer über 10⁷ Spieljahre — der Haken säße im Wortschatz der DSL (stamm/feld-nexus.js:1068 `_dslVokabular`)")
                );
                await L.je(9, async () =>
                    L.leser(9, "ein Sonnensystem je Geste: kein Verb (Treffer [" + t.system.join(", ") + "], stamm/feld-dsl.js:926) — der Planet ist der Same der Welt (`_planetSamen`, stamm/gelaende-chunks.js:672), kein Leser der Folge am Gesicht eines Bewohners")
                );
            },
        })
    );

    // ─────────── erleben.schoepfen.satz — Ein Satz wird Welt ───────────
    // Der Stand der KI (state.llm, llmProviderDefs, die Fehler von `llmCall` stamm/dienst.js:93–96) urteilt die KI-Sprossen beim Namen:
    // ohne Schlüssel erreicht kein Satz des eingefrorenen Korpus (spec/abnahme/ki-korpus.json) das Modell. S3 spricht Ensembles über
    // den Studio-Satz ohne KI im echten Chat (feld-sprache.js, spawn_studio) und zählt sie; S4/S5 zählen Häuser und Bauten der Sitzung,
    // S6–S9 lesen die Op-Tafel (kein Weg Satz → Landschaft/Planet/Epoche).
    LEITERN.push(
        leiter({
            leiter: "erleben.schoepfen.satz",
            sek: 30,
            mutiert: true,
            seite: { FAECHER, SATZ_AN },
            pfad: ["spec/abnahme/ki-korpus.json", "stamm/dienst.js", "stamm/feld-nexus.js", "stamm/feld-leben.js", "stamm/feld-sprache.js", "stamm/feld-dsl.js", "stamm/siedlung-bewohner.js", "stamm/gelaende-chunks.js"],
            welt: [{ wort: "werke_neu", ab: 1, was: "Werke, die der Satz neu in die Welt setzte (state.architectures)" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "gueltig_pct", richtung: "≥", wert: 95, wortlaut: "gültig ≥ 95 %", feld: "richter" },
                        { wort: "absicht_pct", richtung: "≥", wert: 85, wortlaut: "Absicht ≥ 85 % am Ausgabebild", feld: "richter" },
                        { wort: "brueche", richtung: "≤", wert: 0, wortlaut: "0 Brüche", feld: "richter" },
                        { wort: "haenger", richtung: "≤", wert: 0, wortlaut: "0 Hänger > 100 ms", feld: "richter" },
                        { wort: "satz_bild_s", richtung: "≤", wert: 6, wortlaut: "Satz → Bild ≤ 6 s lokal", feld: "preis" },
                    ],
                    umfang: { verlangt: 40, einheit: "Sätze des eingefrorenen Korpus im echten Fenster", wortlaut: "eingefrorener Korpus ≥ 40 Sätze", feld: "richter" },
                    welt: [{ wort: "saetze", ab: 1, was: "Sätze des Korpus, die der Weg des Spiels las (Regel, Parser)" }],
                },
                2: {
                    soll: [{ wort: "passt_pct", richtung: "≥", wert: 70, wortlaut: "Blindurteil „passt\" ≥ 70 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Regler-Sätze", wortlaut: "100 Regler-Sätze", feld: "richter" },
                    auge: { pose: "wiese ego Mittag — das Satz-Werk „knorrige alte Eiche“ vor dem Spieler", vorbild: "Referenzfoto der genannten Eigenschaft (eine knorrige alte Eiche)" },
                },
                3: {
                    soll: [{ wort: "plausibel_pct", richtung: "≥", wert: 80, wortlaut: "Anteil plausibler Ensembles im Blindurteil ≥ 80 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Zufallssätze × Zufallsorte", wortlaut: "100 Zufallssätze × Zufallsorte", feld: "richter" },
                    auge: { pose: "wiese third Mittag — das Ensemble eines Satzes (Hain, Weiler) an seinem Ort", vorbild: "reale Ensembles derselben Art (Hof, Weiler, Hain) an Hang, Wasser, Weg" },
                },
                4: {
                    soll: [{ wort: "epoche_pct", richtung: "≥", wert: 70, wortlaut: "Blindurteil trifft die Epoche ≥ 70 %", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "Werke eines Dorfs aus einem Satz", wortlaut: "10³ Werke: ein Dorf oder Viertel mit Bewohnern", feld: "umfang" },
                    auge: { pose: "dorf third Mittag — das Dorf eines Satzes", vorbild: "Referenzfoto der genannten Epoche/Region" },
                },
                5: {
                    soll: [
                        { wort: "stadtplan_pct", richtung: "≥", wert: 80, wortlaut: "im Band realer Großstädte ≥ 80 %", feld: "richter" },
                        { wort: "echt_pct", richtung: "≥", wert: 50, wortlaut: "Turmblick gegen Luftbild einer Megastadt ≥ 50 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Bauten der Megastadt aus einem Satz", wortlaut: "10⁶ Bauten, 10⁷ Bewohner: Megastadt", feld: "umfang" },
                    auge: { pose: "hochhaus-dach third — Turmblick über die Stadt", vorbild: "Luftbild einer Megastadt" },
                },
                6: {
                    soll: [{ wort: "hafen_pct", richtung: "≥", wert: 80, wortlaut: "Stadt am geschützten Hafen ≥ 80 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "km² Landschaft aus einem Satz", wortlaut: "10²–10⁴ km²: eine Landschaft (Vulkaninseln, Delta)", feld: "umfang" },
                    auge: { pose: "gipfel-blick third — Küste der Insel mit der Hafenstadt", vorbild: "reale Vulkaninsel mit Hafenstadt (Höhenprofil, Küstenform)" },
                },
                7: {
                    soll: [
                        { wort: "text_pct", richtung: "≥", wert: 80, wortlaut: "Orbit- und Bodenbild entsprechen dem Text im Blindurteil ≥ 80 %", feld: "richter" },
                        { wort: "erstes_bild_s", richtung: "≤", wert: 5, wortlaut: "erstes Bild ≤ 5 s", feld: "preis" },
                    ],
                    auge: { pose: "Orbit über dem Planeten und Boden-Ego am Ort des Absatzes", vorbild: "der Text des Absatzes (Blindurteil Text ↔ Bild)" },
                },
                8: {
                    soll: [{ wort: "glaubwuerdig_pct", richtung: "≥", wert: 70, wortlaut: "Fach-Blindurteil „glaubwürdig\" ≥ 70 %", feld: "richter" }],
                    auge: { pose: "die Epoche am Ort, Ego Mittag", vorbild: "historische/paläontologische Rekonstruktion (Rom 50 n. Chr., Kreide)" },
                },
                9: { soll: [{ wort: "kausal_pct", richtung: "≥", wert: 80, wortlaut: "Anteil, der Text UND Vorzeit gehorcht (Blindurteil + Kausal-Probe: Gebirge, wo Platten es fordern) ≥ 80 %", feld: "richter" }] },
            },
            lauf: async function satzLauf(H, P, L) {
                const kiFn = "const llm = r.state.llm || {}; const defs = r.llmProviderDefs ? r.llmProviderDefs() : {}; const def = defs[llm.provider]; const cfg = (llm.providerConfig || {})[llm.provider] || {}; let grund = null; if (!def) grund = 'llm.fehler.provider'; else if (!llm.enabled) grund = 'llm.fehler.aus'; else if (def.requiresKey && !cfg.apiKey) grund = 'llm.fehler.schluessel'; return { an: !!llm.enabled, anbieter: llm.provider || null, schluessel: !!cfg.apiKey, braucht: !!(def && def.requiresKey), grund };";
                const ki = await L.ev(kiFn);
                const korpus = require(require("path").resolve("spec/abnahme/ki-korpus.json"));
                const nSaetze = Object.keys(korpus.saetze || {}).length;
                const nRegler = Object.keys((korpus.regler && korpus.regler.saetze) || {}).length;
                const kiText = ki.grund ? "der LLM-Lauf fehlt: " + ki.grund + " (Anbieter " + ki.anbieter + ", an " + ki.an + ", Schlüssel " + ki.schluessel + "; stamm/dienst.js:93–96)" : "das Modell ist erreichbar (Anbieter " + ki.anbieter + ")";
                L.zeile("satz KI " + JSON.stringify(ki) + " · Korpus " + nSaetze + " Sätze, Regler " + nRegler);
                // ── S1 · der eingefrorene Korpus ÜBER DEN FÄCHER (vorher: ohne Schlüssel „Umfang nicht erzeugbar“, mit Schlüssel je Satz
                // ein Ruf des Modells): je Satz der Weg des Spiels (SATZ_AN) — die Kontrolle („bau mir ein haus“ mit Tat) muss gültig
                // sein, die Mutante (derselbe Satz als still verlangt) ungültig. Absicht am Ausgabebild und Satz → Bild: am Gerät ──
                await L.je(1, async () => {
                    const s1 = P.sprossen[1];
                    const saetze = Object.entries(korpus.saetze || {}).map(([satz, e]) => ({ satz, still: !!(e && e.still) }));
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.SATZ_AN, export: "stamm/feld-sprache.js:568 _regelAusSatz → :545 parseChatToDsl", leser: "stamm/feld-leben.js:671 _chatTryRuleCommand · :673 _chatTryDslParse" },
                        adressen: { dazu: saetze.concat([{ satz: "bau mir ein haus", still: false, kontrolle: true }, { satz: "bau mir ein haus", still: true, mutante: true }]) },
                        ms: Math.max(3000, Math.floor((L.rest() - 20) * 1000)),
                        masse: {
                            saetze: { wie: "anzahl", nur: (a) => !a.kontrolle && !a.mutante },
                            gueltig: { wie: "mittel", feld: "gueltig", nur: (a) => !a.kontrolle && !a.mutante },
                            brueche: { wie: "summe", feld: "bruch", nur: (a) => !a.kontrolle && !a.mutante },
                            haenger: { wie: "summe", feld: "haenger", nur: (a) => !a.kontrolle && !a.mutante },
                            msMax: { wie: "max", feld: "ms" },
                            kontrolle: { wie: "max", feld: "gueltig", nur: "kontrolle" },
                            mutante: { wie: "max", feld: "gueltig", nur: "mutante" },
                            ki: { wie: "erste", feld: "ki" },
                        },
                        schlecht: { feld: "gueltig", richtung: "min" },
                        pose: (a) => "der Satz „" + a.satz + "“ an der Wiese, Ego — das Ausgabebild",
                        ungemessen: ["Absicht am Ausgabebild: ungemessen bis zum Gerät (das Urteil je Satz lebt in der Linse scripts/diag-v1-pfad.cjs:1009 korpusSatzUrteil)", "Satz → Bild ≤ 6 s: die Wanduhr am Gerät"],
                    });
                    L.zeile("satz S1: " + R.akte.slice(0, 500));
                    const w = R.werte;
                    if (w.kontrolle !== 1 || w.mutante !== 0) throw new Error("Kontrolle " + w.kontrolle + " / Mutante " + w.mutante + " — das Prädikat „gültig“ trennt nicht (" + R.akte.slice(0, 200) + ")");
                    if (!w.saetze) return L.leser(1, "der Weg eines Satzes: " + (R.fehlt || "kein Satz gemessen") + " · " + R.akte);
                    const pct = +(100 * w.gueltig).toFixed(1);
                    const zahlen = w.saetze + " von " + saetze.length + " Sätzen auf dem Weg des Spiels (KI " + w.ki + "): gültig " + pct + " %, " + w.brueche + " Brüche, " + w.haenger + " Hänger > 100 ms (längster " + w.msMax + " ms)";
                    if (pct < s1.soll[0].wert || w.brueche > 0 || w.haenger > 0)
                        return L.gemessen(1, { gueltig_pct: pct, brueche: w.brueche, haenger: w.haenger }, {
                            erzeugt: w.saetze,
                            welt: { saetze: R.gemessen },
                            taeter: zahlen + " — ohne KI trägt nur der Parser (Regel und Studio-Satz, stamm/feld-sprache.js:497–568) ein Programm, jeder andere Satz bleibt ohne Tat; Absicht am Ausgabebild und Satz → Bild: ungemessen bis zum Gerät · " + R.akte,
                        });
                    L.leser(1, "Absicht am Ausgabebild: kein Leser in der Sitzung — das Urteil je Satz lebt in der Linse (scripts/diag-v1-pfad.cjs:1009 korpusSatzUrteil); " + zahlen + (R.fehlt ? "; " + (saetze.length - w.saetze) + " Sätze an die KI: " + R.fehlt : "") + " · " + R.akte, w.saetze);
                });
                // ── S2 · 100 Regler-Sätze ──
                await L.je(2, async () => {
                    const n = ki.grund ? 0 : nRegler;
                    if (n >= P.sprossen[2].umfang.verlangt) return L.leser(2, "das Bildpaar Satz-Werk ↔ Referenzfoto: kein Leser schießt es je Regler-Satz (scripts/diag-v1-pfad.cjs:1009)", n);
                    L.umfang(2, n, "der Regler-Korpus trägt " + nRegler + " Sätze (spec/abnahme/ki-korpus.json regler), verlangt 100; " + kiText);
                });
                // ── S3 · Ensembles aus dem Studio-Satz (ohne KI, der echte Chat) ──
                await L.je(3, async () => {
                    const gesteFn = function (r, saetze) {
                        const st = r.state;
                        const uhr = st.weatherEffectTime;
                        const aus = [];
                        st.weatherEffectTime = 0;
                        try {
                            for (const satz of saetze) {
                                const vor = new Set(st.architectures);
                                const t0 = performance.now();
                                r.processChatCommand(satz);
                                const ms = performance.now() - t0;
                                const neu = st.architectures.filter((a) => !vor.has(a));
                                aus.push({ satz, werke: neu.filter((a) => a.werk).length, ms: Math.round(ms) });
                                for (const a of neu) r.removeArchitecture(a);
                            }
                        } finally {
                            st.weatherEffectTime = uhr;
                        }
                        return aus;
                    };
                    const hw = await L.ev("return !!r._studioBlueprintForWord('häuser');");
                    const saetze = ["pflanz mir einen eichenhain", "bau mir drei " + (hw ? "häuser" : "haus")];
                    const g = await L.ev("return (" + gesteFn + ")(r, " + JSON.stringify(saetze) + ");", 30);
                    const ens = g.filter((x) => x.werke >= 2).length;
                    L.zeile("satz S3 " + JSON.stringify(g));
                    L.umfang(3, ens, "der Lauf sprach " + g.length + " Sätze, " + ens + " Ensembles standen (" + g.map((x) => "„" + x.satz + "“ " + x.werke + " Werke in " + x.ms + " ms").join(", ") + ") — 100 Zufallssätze × Zufallsorte passen nicht in die Leiter");
                });
                // ── S4–S9 · die Häuser, die Bauten und die Op-Tafel der Sitzung ──
                const t = await L.ev(
                    "const st = r.state; let maxHaus = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; const h = S.plan && S.plan.slots ? S.plan.slots.length : 0; if (h > maxHaus) maxHaus = h; } const ops = Object.keys(r.dslEffects || {}); return { maxHaus, sied, bauten: (st.architectures || []).length, ops: ops.length, land: ops.filter((o) => /insel|island|delta|vulkan|volcano|landschaft|landscape/i.test(o)) };"
                );
                L.zeile("satz Welt " + JSON.stringify(t));
                await L.je(4, async () => L.umfang(4, t.maxHaus, "ein Satz baut ein Dorf des Siedlungs-Gesetzes (spawn_village, stamm/feld-dsl.js:1093); die größte Siedlung der Sitzung trägt " + t.maxHaus + " Häuser (" + t.sied + " Siedlungen)"));
                await L.je(5, async () => L.umfang(5, t.bauten, "die Welt trägt an der Pose der Sitzung " + t.bauten + " Bauten — keine Megastadt aus einem Satz"));
                await L.je(6, async () =>
                    L.leser(6, "ein Satz formt eine Landschaft (Vulkaninsel, Delta): kein Verb in der Op-Tafel (" + t.ops + " Ops, Treffer [" + t.land.join(", ") + "], stamm/feld-dsl.js:926 dslEffects) — der Haken säße im Wortschatz der DSL (stamm/feld-nexus.js:1068 `_dslVokabular`)")
                );
                await L.je(7, async () => L.leser(7, "Absatz → Planet: kein Weg — der Planet ist der Same der Welt (`_planetSamen`, stamm/gelaende-chunks.js:672); " + kiText));
                await L.je(8, async () =>
                    L.leser(8, "Satz → Epoche: die Zeit des Planeten wählt nur die Reise („reise <Breite> <Länge> <Ma>“, stamm/feld-leben.js:1265) in ganzen Millionen Jahren und mit Neuladen der Welt; kein Satz setzt eine Epoche, Rom 50 n. Chr. liegt unter ihrer Auflösung")
                );
                await L.je(9, async () => L.leser(9, "Absatz → Sonnensystem mit Zeitachse: kein Weg — EIN Planet je Same (`_planetSamen`, stamm/gelaende-chunks.js:672), keine Kausal-Probe Gebirge ↔ Platten; " + kiText));
            },
        })
    );

    // ─────────── erleben.schoepfen.gesetz — Gesetz erfinden ───────────
    // S1 schreibt die Regel im echten Chat („wann immer es regnet, dann setze wetter sunny“, GESETZ_VORLAGEN[0] → `_chatTryRuleCommand`
    // → state.worldRules), stellt Regen (`__wetterSetzen`), hebt den Halt der Messung und tickt `_tickWorldRules` an der Welt-Uhr: wirkt
    // die Regel (Wetter kippt), fehlt nur B (kein Mitspieler, kein Leser der Wirkung bei B) — sonst ROT beim Täter. S2–S6 zählen Saat,
    // den Deckel der Regeln (WORLD_RULES.cap), die Op-Tafel und die Welt-Uhr.
    LEITERN.push(
        leiter({
            leiter: "erleben.schoepfen.gesetz",
            sek: 25,
            mutiert: true,
            pfad: ["stamm/feld-leben.js", "stamm/feld-sprache.js", "stamm/feld-dsl.js", "stamm/feld-nexus.js", "stamm/netz-p2p.js", "stamm/dienst.js", "scripts/lib/ausgabe-aufnahme.cjs", "spec/abnahme/*"],
            welt: [
                { wort: "regel_feuer", ab: 1, was: "Feuern der Spieler-Regel in der Welt (worldRules fires)" },
                { wort: "wetter_wechsel", ab: 1, was: "das Wetter der Welt kippte durch die Regel (rainy → sunny)" },
            ],
            sprossen: {
                1: { soll: [{ wort: "regeln_wirkend", richtung: "≥", wert: 1, wortlaut: "1 Spieler-Regel wirkt in der Welt", feld: "umfang" }] },
                2: {
                    soll: [
                        { wort: "plausibel_pct", richtung: "≥", wert: 80, wortlaut: "≥ 80 % plausible Werke", feld: "richter" },
                        { wort: "treffer_pct", richtung: "≤", wert: 60, wortlaut: "Blindvergleich gegen Studio-Werke derselben Gattung ≤ 60 % Trefferquote", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Saaten", wortlaut: "100 Saaten: ≥ 80 % plausible Werke", feld: "richter" },
                    auge: { pose: "wiese third Mittag — Werke des Spieler-Gesetzbuchs neben Studio-Werken derselben Gattung", vorbild: "Studio-Werke derselben Gattung" },
                },
                3: {
                    soll: [
                        { wort: "plausibel_verschieden_pct", richtung: "≥", wert: 70, wortlaut: "Anteil plausibler UND vom Bestand verschiedener Werke ≥ 70 %", feld: "richter" },
                        { wort: "erstes_werk_s", richtung: "≤", wert: 10, wortlaut: "Satz → erstes Werk ≤ 10 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 100, einheit: "Erfindungssätze", wortlaut: "100 Erfindungssätze × 100 Saaten", feld: "richter" },
                    auge: { pose: "wiese third Mittag — das erfundene Werk an seinem Ort und Klima", vorbild: "Bestand der Studios derselben Gattung (vom Bestand verschieden) und reale Salzwüsten-Flora" },
                },
                4: {
                    soll: [
                        { wort: "delta_pct", richtung: "≤", wert: 5, wortlaut: "Frame p95 und Ankunft bei 10³ gegen 10 Gesetze ± 5 %", feld: "richter" },
                        { wort: "ueberleben_pct", richtung: "≥", wert: 90, wortlaut: "keine Art stirbt in 90 % der Saaten sofort aus", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "erfundene Gesetze nebeneinander", wortlaut: "10³ erfundene Gesetze nebeneinander", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "folgerichtig_pct", richtung: "≥", wert: 70, wortlaut: "Fach-Blindurteil „folgerichtig\" ≥ 70 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Saaten je Physik", wortlaut: "100 Saaten je Physik", feld: "richter" },
                    auge: { pose: "wiese third Mittag — Leben und Bauten unter der erfundenen Physik", vorbild: "dieselbe Szene unter Erd-Physik (Fach-Blindurteil)" },
                },
                6: {
                    soll: [{ wort: "vielfalt_pct", richtung: "≥", wert: 70, wortlaut: "Artenvielfalt und Körperbau-Verteilung im Band der Erd-Fossilgeschichte ≥ 70 %", feld: "richter" }],
                    umfang: { verlangt: 1e8, einheit: "Spieljahre", wortlaut: "nach 10⁸ Spieljahren in 100 Saaten", feld: "richter" },
                },
            },
            lauf: async function gesetzLauf(H, P, L) {
                // ── S1 · die Spieler-Regel im echten Chat, ihre Wirkung an der Welt-Uhr ──
                await L.je(1, async () => {
                    const regelFn = function (r) {
                        const st = r.state;
                        const A = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
                        const satz = A.GESETZ_VORLAGEN[0];
                        const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
                        const vorRegeln = new Set(st.worldRules || []);
                        const wetterAlt = st.weather;
                        const uhr = st.weatherEffectTime;
                        const n0 = zeilen().length;
                        const o = { satz, peers: st.p2p && st.p2p.peers ? st.p2p.peers.size : 0 };
                        let regel = null;
                        try {
                            st.weatherEffectTime = 0;
                            r.processChatCommand(satz);
                            o.zeile = zeilen().slice(n0 + 1).join(" | ").slice(0, 160);
                            regel = (st.worldRules || []).find((x) => !vorRegeln.has(x) && x.source === "human") || null;
                            o.regel = !!regel;
                            if (!regel) return o;
                            o.vor = window.__wetterSetzen("rainy");
                            st.weatherEffectTime = 0; // der Halt fällt: die Wirkung der Regel schreibt das Wetter wie im Spiel
                            const t0 = performance.now();
                            let t = st.spielZeit;
                            for (let i = 0; i < 40 && st.weather !== "sunny"; i++) {
                                t += 0.5;
                                r._tickWorldRules(t);
                            }
                            o.ms = Math.round(performance.now() - t0);
                            o.spielS = +(t - st.spielZeit).toFixed(1);
                            o.nach = st.weather;
                            o.feuer = regel.fires || 0;
                        } finally {
                            if (regel) st.worldRules = (st.worldRules || []).filter((x) => x !== regel);
                            if (st.weather !== wetterAlt) window.__wetterSetzen(wetterAlt);
                            st.weatherEffectTime = uhr;
                        }
                        return o;
                    };
                    const o = await L.ev("return (" + regelFn + ")(r);", 30);
                    L.zeile("gesetz S1 " + JSON.stringify(o));
                    const werte = { regeln_wirkend: o.regel && o.nach === "sunny" ? 1 : 0 };
                    const welt = { regel_feuer: o.feuer || 0, wetter_wechsel: o.vor === "rainy" && o.nach === "sunny" ? 1 : 0 };
                    if (werte.regeln_wirkend >= 1 && welt.regel_feuer >= 1 && welt.wetter_wechsel >= 1)
                        return L.leser(
                            1,
                            "die Wirkung bei Mitspieler B: die Sitzung trägt " + o.peers + " Mitspieler, kein Leser an A nennt die Wirkung der Regel bei B — der Haken säße am Empfang des Akts (stamm/netz-p2p.js:1895 remote-dsl); an A gemessen: „" + o.satz + "“ feuerte " + o.feuer + "×, Wetter " + o.vor + " → " + o.nach + " nach " + o.spielS + " Spiel-s"
                        );
                    L.gemessen(1, werte, { welt, taeter: !o.regel ? "der Satz stellte keine Regel auf („" + o.zeile + "“)" : "die Regel feuerte " + (o.feuer || 0) + "×, Wetter " + o.vor + " → " + o.nach });
                });
                // ── S2–S6 · Saat, Regel-Deckel, Op-Tafel, Welt-Uhr, KI ──
                const t = await L.ev(
                    "const st = r.state; const A = typeof AnazhRealm !== 'undefined' ? AnazhRealm : r.constructor; const ops = Object.keys(r.dslEffects || {}); const llm = st.llm || {}; const defs = r.llmProviderDefs ? r.llmProviderDefs() : {}; const def = defs[llm.provider]; const cfg = (llm.providerConfig || {})[llm.provider] || {}; let ki = null; if (!def) ki = 'llm.fehler.provider'; else if (!llm.enabled) ki = 'llm.fehler.aus'; else if (def.requiresKey && !cfg.apiKey) ki = 'llm.fehler.schluessel'; return { saat: st.worldMeta ? st.worldMeta.seed : null, regeln: (st.worldRules || []).length, cap: A.WORLD_RULES && A.WORLD_RULES.cap, ops: ops.length, physik: ops.filter((o) => /grav|schwer|physik|chemie|loesung|lösung|solvent/i.test(o)), tag: r._weltTag ? +r._weltTag().toFixed(2) : null, ki, anbieter: llm.provider || null };"
                );
                L.zeile("gesetz Welt " + JSON.stringify(t));
                const fs = require("fs");
                const erfindung = fs.readdirSync("spec/abnahme").filter((f) => /erfind/i.test(f)).length;
                await L.je(2, async () => L.umfang(2, t.saat != null ? 1 : 0, "die Sitzung hält eine Saat (" + t.saat + ") — ein Spieler-Gesetzbuch dockt im Faden an (stamm/studio-bruecke.js:165), 100 Saaten verlangt"));
                await L.je(3, async () =>
                    L.umfang(3, 0, "kein Korpus von Erfindungssätzen im Spiel-Baum (spec/abnahme: " + erfindung + " Dateien)" + (t.ki ? "; der LLM-Lauf fehlt: " + t.ki + " (stamm/dienst.js:93–96)" : "") + " — 0 Erfindungssätze × Saaten liefen")
                );
                await L.je(4, async () => {
                    if (t.cap >= P.sprossen[4].umfang.verlangt) return L.leser(4, "Frame p95 und Ankunft bei 10³ gegen 10 Gesetze: kein Leser vergleicht beide Lasten (stamm/feld-dsl.js:679 `_tickWorldRules`)", t.cap);
                    L.umfang(4, t.cap, "die Welt hält höchstens " + t.cap + " Regeln nebeneinander (WORLD_RULES.cap, `_registerWorldRule` verdrängt und verweigert am Deckel, stamm/feld-dsl.js:609); jetzt stehen " + t.regeln);
                });
                await L.je(5, async () => {
                    if (!t.physik.length)
                        return L.leser(5, "eine erfundene Physik (Schwerkraft, Lösungsmittel): kein Verb in der Op-Tafel (" + t.ops + " Ops, stamm/feld-dsl.js:926 dslEffects) — der Haken säße im Wortschatz der DSL (stamm/feld-nexus.js:1068 `_dslVokabular`)");
                    L.umfang(5, 1, "die Sitzung hält eine Saat (" + t.saat + "), Physik-Verben [" + t.physik.join(", ") + "] — 100 Saaten je Physik verlangt");
                });
                await L.je(6, async () => L.umfang(6, t.tag != null ? +(t.tag / 365).toFixed(4) : 0, "die Welt lief " + t.tag + " Welt-Tage (`_weltTag`, stamm/feld-leben.js:2604) — kein Raffer über Zeitalter, keine Evolution über 10⁸ Spieljahre"));
            },
        })
    );

    // ─────────── erleben.schoepfen.gespraech — Im Gespräch erschaffen ───────────
    // Die Sprossen verlangen Menschen (Neulinge, Gruppen, Schöpfer-Urteile) und das Modell: das Programm zählt die Spieler der Sitzung
    // (1 + state.p2p.peers), liest den Stand der KI (state.llm, stamm/dienst.js:93–96) und sucht den Korrektur-Korpus im Spiel-Baum;
    // jede Sprosse urteilt den Umfang, den die Sitzung trägt.
    LEITERN.push(
        leiter({
            leiter: "erleben.schoepfen.gespraech",
            sek: 15,
            seite: { FAECHER, NEULING_AN },
            pfad: ["stamm/netz-p2p.js", "stamm/dienst.js", "stamm/feld-sprache.js", "stamm/studio-wort.js", "stamm/netz-identitaet.js", "stamm/feld-dsl.js", "stamm/feld-nexus.js", "stamm/feld-leben.js", "spec/abnahme/*"],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Spieler, Stand der KI)" }],
            sprossen: {
                1: {
                    soll: [{ wort: "anteil_pct", richtung: "≥", wert: 80, wortlaut: "Anteil, der in 5 min ein eigenes Werk erschafft und teilt ≥ 80 %", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Neulinge ab 10 Jahren", wortlaut: "20 Neulinge ab 10 Jahren", feld: "richter" },
                },
                2: {
                    soll: [{ wort: "naeher_pct", richtung: "≥", wert: 80, wortlaut: "Endfassung im Blindurteil näher am Wunsch als jede Zwischenfassung ≥ 80 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Dialoge des Korrektur-Korpus", wortlaut: "Korrektur-Korpus 100 Dialoge", feld: "richter" },
                    auge: { pose: "wiese ego Mittag — Zwischenfassungen und Endfassung desselben Werks an fester Pose", vorbild: "der Wunsch des Spielers (die Korrektursätze) gegen jede Zwischenfassung" },
                },
                3: {
                    soll: [
                        { wort: "vergessen", richtung: "≤", wert: 1, wortlaut: "≤ 1 vergessene Absicht", feld: "richter" },
                        { wort: "urteil_von5", richtung: "≥", wert: 4, wortlaut: "„das wollte ich\" ≥ 4/5", feld: "richter" },
                    ],
                    umfang: { verlangt: 60, einheit: "min Gespräch an einem Ort", wortlaut: "nach 60 min", feld: "richter" },
                },
                4: {
                    soll: [
                        { wort: "verloren", richtung: "≤", wert: 0, wortlaut: "0 still verlorene Absichten im Protokoll", feld: "richter" },
                        { wort: "urteil_von5", richtung: "≥", wert: 4, wortlaut: "Urteil des Schöpfers ≥ 4/5", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Sitzungen", wortlaut: "ein Werk über 10 Sitzungen und Wochen", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "wiederfinden_pct", richtung: "≥", wert: 100, wortlaut: "jeder findet ≥ 1 eigene Absicht sichtbar wieder (100 %)", feld: "richter" },
                        { wort: "ueberschrieben", richtung: "≤", wert: 0, wortlaut: "0 still überschriebene Werke", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Spieler mit der KI an einer Stadt", wortlaut: "eine Gruppe (10) mit der KI an einer Stadt", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "angenommen_pct", richtung: "≥", wert: 50, wortlaut: "Anteil angenommener Welt-Vorschläge in 100 Sitzungen ≥ 50 %", feld: "richter" },
                        { wort: "blind_pct", richtung: "≤", wert: 60, wortlaut: "Blindurteil Vorschlag ↔ Spieler-Werk ≤ 60 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Sitzungen", wortlaut: "Anteil angenommener Welt-Vorschläge in 100 Sitzungen ≥ 50 %", feld: "richter" },
                    auge: { pose: "wiese third Mittag — ein Welt-Vorschlag neben einem Spieler-Werk", vorbild: "Spieler-Werk derselben Art (Blindurteil Vorschlag ↔ Werk)" },
                },
            },
            lauf: async function gespraechLauf(H, P, L) {
                const t = await L.ev(
                    "const st = r.state; const llm = st.llm || {}; const defs = r.llmProviderDefs ? r.llmProviderDefs() : {}; const def = defs[llm.provider]; const cfg = (llm.providerConfig || {})[llm.provider] || {}; let ki = null; if (!def) ki = 'llm.fehler.provider'; else if (!llm.enabled) ki = 'llm.fehler.aus'; else if (def.requiresKey && !cfg.apiKey) ki = 'llm.fehler.schluessel'; return { spieler: 1 + (st.p2p && st.p2p.peers ? st.p2p.peers.size : 0), ki, anbieter: llm.provider || null, chats: st.player && st.player.recentActivity ? st.player.recentActivity.chats : null };"
                );
                L.zeile("gespraech Welt " + JSON.stringify(t));
                const kiText = t.ki ? "; der LLM-Lauf fehlt: " + t.ki + " (Anbieter " + t.anbieter + ", stamm/dienst.js:93–96)" : "";
                const korrektur = require("fs").readdirSync("spec/abnahme").filter((f) => /korrektur|dialog/i.test(f)).length;
                const urteile = (nr, erzeugt, was, fehlt) => (erzeugt >= P.sprossen[nr].umfang.verlangt ? L.leser(nr, fehlt, erzeugt) : L.umfang(nr, erzeugt, was));
                // S1 ÜBER DEN FÄCHER (vorher „Umfang nicht erzeugbar“: 1 Spieler): der Richter stellt keine Neulinge auf. Die Adresse eines
                // Neulings ist sein erster Wunsch (Rolle Neuling × Sprache): die Schöpfungs-Sätze des Korpus im Spiel-Baum
                // (spec/abnahme/ki-korpus.json, die Sätze mit Werk oder Wesen, deutsch und englisch). Je Satz die Kette, die das Spiel liest
                // (NEULING_AN): erschafft er ein Werk, teilt der Code genau dieses? Die Mutante („lass es regnen“) erschafft keines.
                await L.je(1, async () => {
                    const s1 = P.sprossen[1];
                    const K = require(require("path").resolve("spec/abnahme/ki-korpus.json"));
                    const schoepf = (S, sprache) => Object.entries(S || {}).filter(([, e]) => e && (e.werk || e.wesen)).map(([satz]) => ({ satz, sprache }));
                    const saetze = schoepf(K.saetze, "de").concat(schoepf(K.en && K.en.saetze, "en"));
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.NEULING_AN, export: "stamm/feld-sprache.js:545 parseChatToDsl → stamm/studio-wort.js:289 _studioBlueprintForWord → stamm/netz-identitaet.js:617 _werkCode(_werkReise)", leser: "stamm/feld-leben.js:910 _chatTryDslParse · stamm/netz-identitaet.js:651 teileWerk" },
                        adressen: { dazu: saetze.concat([{ satz: "lass es regnen", sprache: "de", mutante: true }]) },
                        ms: Math.max(3000, Math.floor((L.rest() - 4) * 1000)),
                        masse: {
                            neulinge: { wie: "anzahl", nur: (a) => !a.mutante },
                            ganz: { wie: "mittel", feld: "ganz", nur: (a) => !a.mutante },
                            erschafft: { wie: "summe", feld: "erschafft", nur: (a) => !a.mutante },
                            teilt: { wie: "summe", feld: "teilt", nur: (a) => !a.mutante },
                            mutante: { wie: "max", feld: "ganz", nur: "mutante" },
                            wege: { wie: (v) => [...new Set(v)].slice(0, 6).join(" | "), feld: "weg", nur: (a) => !a.mutante },
                        },
                        schlecht: { feld: "ganz", richtung: "min" },
                        pose: (a) => "der Satz „" + a.satz + "“ an der Wiese, Ego — das gesetzte Werk und dasselbe beim Empfänger des Codes",
                        ungemessen: ["die Uhr des Neulings (5 min bis zum geteilten Werk) und Neulinge ab 10 Jahren: Panel (R11)", "das Bildpaar Werk ↔ Werk beim Empfänger: ungemessen bis zum Gerät"],
                    });
                    L.zeile("gespraech S1: " + R.akte.slice(0, 500));
                    if (R.werte.mutante != null && R.werte.mutante !== 0) throw new Error("die Mutante („lass es regnen“) teilt ein eigenes Werk — das Prädikat ist blind");
                    const w = R.werte;
                    if (!w.neulinge) return L.leser(1, "der erste Wunsch eines Neulings: " + (R.fehlt || "kein Satz gemessen") + " · " + R.akte);
                    const pct = +(100 * w.ganz).toFixed(1);
                    const kette = w.neulinge + " Neulinge (" + saetze.length + " Schöpfungs-Sätze des Korpus): " + w.erschafft + " erschaffen ein Werk, " + w.teilt + " teilen einen Code, " + Math.round(w.ganz * w.neulinge) + " genau ihr Werk — Wege: " + w.wege;
                    if (pct < s1.soll[0].wert)
                        return L.gemessen(1, { anteil_pct: pct }, {
                            erzeugt: w.neulinge,
                            welt: { gelesen: R.gemessen },
                            taeter:
                                kette + "; der Code trägt den Samen der Werkstatt (`_werkReise` → `_werkSame`, stamm/netz-identitaet.js:666), das Werk den Samen des Satzes (stamm/feld-dsl.js:2078 baseSeed + i) — geteilt wird nie das gesetzte Werk, Teilen kennt nur den Bauplan der Werkstatt (stamm/werkstatt-vorschau.js:2413) · " + R.akte,
                        });
                    L.leser(1, "die Uhr bis zum geteilten Werk je Neuling: kein Leser (der letzte Chat-Akt `state.dsl.lastUserAt` stamm/feld-leben.js:932 ist keine Uhr der Schöpfung); Neulinge ab 10 Jahren: Panel (R11) — " + kette + " · " + R.akte, w.neulinge);
                });
                await L.je(2, async () => L.umfang(2, 0, "kein Korrektur-Korpus im Spiel-Baum (spec/abnahme: " + korrektur + " Dateien), 0 Dialoge liefen" + kiText));
                await L.je(3, async () => L.umfang(3, +(H.sek() / 60).toFixed(2), "die Leiter fährt " + H.sek() + " s, kein Gespräch einer Stunde" + kiText));
                await L.je(4, async () => L.umfang(4, 1, "der Lauf der Leiter ist eine Sitzung — 10 Sitzungen über Wochen verlangt"));
                await L.je(5, async () =>
                    urteile(5, t.spieler, "die Sitzung trägt " + t.spieler + " Spieler — eine Gruppe von 10 mit der KI verlangt" + kiText, "Absichten mehrerer Spieler: kein Leser der Absicht je Spieler (stamm/feld-nexus.js:1349 llmBuildContext)")
                );
                await L.je(6, async () => L.umfang(6, 1, "der Lauf der Leiter ist eine Sitzung — 100 Sitzungen mit Welt-Vorschlägen (`proactiveSuggestions`, stamm/feld-leben.js:1731) verlangt"));
            },
        })
    );

    // ─────────── erleben.schoepfen.teilen — Teilen und offene Bibliothek ───────────
    // S1 trägt g4 (PAAR_PROBE). Das Programm zählt fremde Geräte (state.p2p.peers), die Einträge der Bibliothek (`_bibliothek`,
    // stamm/netz-identitaet.js:789) und die Welten des Speichers (`worldsIndexLoad`, stamm/speicher-welten.js:231); die Bibliothek
    // findet und forkt (netz-identitaet.js:879/909), doch kein Weg des Spiels ruft sie — S3 urteilt `leser`.
    LEITERN.push(
        leiter({
            leiter: "erleben.schoepfen.teilen",
            sek: 15,
            bestehend: [1],
            pfad: ["stamm/netz-p2p.js", "stamm/netz-identitaet.js", "stamm/speicher-welten.js", "stamm/speicher-laden.js", "stamm/werkstatt-vorschau.js", "spec/abnahme/*"],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Peers, Bibliothek, Welten)" }],
            sprossen: {
                2: {
                    soll: [{ wort: "geste_bild_b_s", richtung: "≤", wert: 5, wortlaut: "Geste → Bild bei B ≤ 5 s über Mobilfunk", feld: "preis" }],
                    umfang: { verlangt: 1, einheit: "Bauplan auf einem fremden Gerät (Peer, frisches Profil)", wortlaut: "1 Bauplan / 1 Welt auf ein fremdes Gerät, frisches Profil", feld: "umfang" },
                },
                3: { soll: [{ wort: "zufall_bild_s", richtung: "≤", wert: 5, wortlaut: "Zufallseintrag im Bild ≤ 5 s", feld: "richter" }] },
                4: {
                    soll: [{ wort: "treffer_pct", richtung: "≥", wert: 80, wortlaut: "Treffer unter den ersten 5 ≥ 80 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Sätze im Such-Korpus", wortlaut: "Such-Korpus 100 Sätze", feld: "richter" },
                },
                5: {
                    soll: [
                        { wort: "spielbar_pct", richtung: "≥", wert: 90, wortlaut: "spielbar ≥ 90 %", feld: "richter" },
                        { wort: "verschieden_pct", richtung: "≥", wert: 70, wortlaut: "im Blindurteil von beiden Eltern verschieden ≥ 70 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Zufallsfusionen", wortlaut: "1 000 Zufallsfusionen", feld: "richter" },
                    auge: { pose: "die fusionierte Welt an der Ankunft, Ego Mittag", vorbild: "beide Eltern-Welten an derselben Pose" },
                },
                6: {
                    soll: [{ wort: "gleich_pct", richtung: "≥", wert: 100, wortlaut: "Welt-Bild an gleicher Pose gleich in 100 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Welten (Stichprobe fremder Nachbau)", wortlaut: "Stichprobe 100 Welten", feld: "richter" },
                },
            },
            lauf: async function teilenLauf(H, P, L) {
                const t = await L.ev(
                    "const st = r.state; const b = r._bibliothek ? r._bibliothek() : {}; const welten = r.worldsIndexLoad ? r.worldsIndexLoad() : []; return { peers: st.p2p && st.p2p.peers ? st.p2p.peers.size : 0, bibliothek: Object.keys(b || {}).length, welten: welten.length, suche: !!document.getElementById('workshop-search') };"
                );
                L.zeile("teilen Welt " + JSON.stringify(t));
                const such = require("fs").readdirSync("spec/abnahme").filter((f) => /such/i.test(f)).length;
                await L.je(2, async () => {
                    if (t.peers < 1) return L.umfang(2, t.peers, "kein fremdes Gerät in der Sitzung (state.p2p.peers " + t.peers + ") — B mit leerem Speicher fehlt");
                    L.leser(2, "Bildpaar A ↔ B: kein Leser des Bilds bei B an A — der Haken säße am Empfang des Werks (stamm/netz-p2p.js:1895)", t.peers);
                });
                await L.je(3, async () =>
                    L.leser(3, "Zufallseintrag → Bild und Herkunft des Forks im Spiel: kein Weg des Spiels ruft `bibliothekFinde`/`bibliothekForke` (stamm/netz-identitaet.js:879, :909) — die Bibliothek der Sitzung trägt " + t.bibliothek + " Einträge, keiner kommt ins Bild")
                );
                await L.je(4, async () => L.umfang(4, 0, "kein Such-Korpus im Spiel-Baum (spec/abnahme: " + such + " Dateien) — die Suche der Werkstatt (#workshop-search " + t.suche + ", stamm/werkstatt-vorschau.js:244) misst gegen keinen Satz"));
                await L.je(5, async () => {
                    const paare = (t.welten * (t.welten - 1)) / 2;
                    L.umfang(5, 0, "0 Fusionen in der Sitzung: jede lädt die Seite neu (`_confirmWorldFusion` → fuseWorlds reload, stamm/speicher-laden.js:1794); der Speicher hielte " + t.welten + " Welten = " + paare + " Paare");
                });
                await L.je(6, async () => {
                    if (t.welten >= P.sprossen[6].umfang.verlangt) return L.leser(6, "fremder Nachbau aus Quelle + Same: kein Leser des Welt-Bilds eines fremden Nachbaus an A (stamm/netz-p2p.js:1895)", t.welten);
                    L.umfang(6, t.welten, "der Speicher der Sitzung hält " + t.welten + " Welten (`worldsIndexLoad`, stamm/speicher-welten.js:231) — 100 fremd nachgebaute verlangt, kein fremdes Gerät (peers " + t.peers + ")");
                });
            },
        })
    );

    // ─────────── erleben.schoepfen.schutz — Schutz, Vertrauen und Moderation ───────────
    // S1 trägt g4 (PAAR_PROBE, feindliche Welt). Das Programm zählt den feindlichen Korpus des Spiel-Baums (spec/abnahme/ki-feind-korpus.json,
    // je Träger eine Injektion) und die Spieler der Sitzung (1 + state.p2p.peers): Störer, rote Spieler und manipulierte Klienten
    // verlangen Menschen und Geräte, die die Sitzung nicht trägt.
    LEITERN.push(
        leiter({
            leiter: "erleben.schoepfen.schutz",
            sek: 15,
            bestehend: [1],
            pfad: ["spec/abnahme/ki-feind-korpus.json", "stamm/netz-p2p.js", "stamm/feld-dsl.js"],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Korpus, Peers)" }],
            sprossen: {
                2: {
                    soll: [{ wort: "ausgefuehrt", richtung: "≤", wert: 0, wortlaut: "0 ausgeführte fremde Anweisungen", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Injektionen im feindlichen Korpus", wortlaut: "Injektions-Korpus ≥ 100", feld: "richter" },
                },
                3: {
                    soll: [
                        { wort: "schaeden", richtung: "≤", wert: 0, wortlaut: "0 bleibende Schäden am fremden Werk", feld: "richter" },
                        { wort: "erlaubt_pct", richtung: "≥", wert: 100, wortlaut: "100 % erlaubte Änderungen gelingen", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Versuche eines roten Spielers am zweiten Gerät", wortlaut: "30 min, 100 Versuche", feld: "richter" },
                },
                4: {
                    soll: [{ wort: "stoer_sichtbar_pct", richtung: "≤", wert: 1, wortlaut: "Anteil Störaktionen, die ein anderer länger als 60 s sieht ≤ 1 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Spieler", wortlaut: "10² Spieler, 10 % Störer", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "erkannt_pct", richtung: "≥", wert: 99, wortlaut: "erkannt ≥ 99 %", feld: "richter" },
                        { wort: "fehlalarm_pct", richtung: "≤", wert: 1, wortlaut: "Fehlalarm ≤ 1 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 10000, einheit: "Spieler", wortlaut: "10⁴ Spieler, Text- und Bauwerk-Inhalte", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "benannt_pct", richtung: "≥", wert: 100, wortlaut: "100 % benannt", feld: "richter" },
                        { wort: "fremd", richtung: "≤", wert: 0, wortlaut: "0 Fremd-Zustand verändert", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Spieler", wortlaut: "10⁶ Spieler, manipulierter Klient", feld: "umfang" },
                },
            },
            lauf: async function schutzLauf(H, P, L) {
                const t = await L.ev("const st = r.state; return { spieler: 1 + (st.p2p && st.p2p.peers ? st.p2p.peers.size : 0), peers: st.p2p && st.p2p.peers ? st.p2p.peers.size : 0 };");
                const feind = require(require("path").resolve("spec/abnahme/ki-feind-korpus.json"));
                const nFeind = Object.keys(feind.injektionen || {}).length;
                L.zeile("schutz Welt " + JSON.stringify(t) + " · feindlicher Korpus " + nFeind);
                const urteile = (nr, erzeugt, was, fehlt) => (erzeugt >= P.sprossen[nr].umfang.verlangt ? L.leser(nr, fehlt, erzeugt) : L.umfang(nr, erzeugt, was));
                await L.je(2, async () =>
                    urteile(
                        2,
                        nFeind,
                        "der feindliche Korpus trägt " + nFeind + " Injektionen (spec/abnahme/ki-feind-korpus.json, je Träger eine: " + Object.keys(feind.injektionen || {}).join(", ") + ") — ≥ 100 verlangt",
                        "ausgeführte fremde Anweisungen: der Korpus läuft nur über das gehorsame Modell der Linse (scripts/diag-v1-pfad.cjs:2217), kein Leser in der Sitzung"
                    )
                );
                await L.je(3, async () => L.umfang(3, 0, "kein zweites Gerät in der Sitzung (state.p2p.peers " + t.peers + "), kein roter Spieler — 0 Versuche am fremden Werk"));
                await L.je(4, async () => urteile(4, t.spieler, "die Sitzung trägt " + t.spieler + " Spieler, keine Störer", "Störaktionen, die ein anderer > 60 s sieht: kein Leser (stamm/netz-p2p.js:1895)"));
                await L.je(5, async () => urteile(5, t.spieler, "die Sitzung trägt " + t.spieler + " Spieler — kein feindlicher Werk-Korpus von 1 000 unter 10⁴ Spielern", "anstößige Werke erkannt/Fehlalarm: kein Leser (stamm/netz-p2p.js:1895)"));
                await L.je(6, async () => urteile(6, t.spieler, "die Sitzung trägt " + t.spieler + " Spieler, keinen manipulierten Klienten", "manipulierter Klient benannt: kein Leser (stamm/netz-p2p.js:1895)"));
            },
        })
    );
}

// ═══════════════════════════════════════ Perspektive sinn ═══════════════════════════════════════
{
    // ─────────── erleben.sinn.ziele — Ziele aus dem Zustand der Welt ───────────
    // S1 trägt bestehend affekt.K1#2 (Tafel „gleich“, gebuchte Akten; Richter-Falte 19.11.: der Zwilling dieser Probe fiel).
    // S2–S7 zählen Saat, Bewohner (Liste oder `leuteVon` des Plans) und Welten.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinn.ziele",
            sek: 45,
            pfad: [
                "stamm/feld-sprache.js",
                "stamm/feld-leben.js",
                "stamm/klang.js",
                "klang-core.js",
                "stamm/dirigent-takt.js",
                "stamm/bild-himmel.js",
                "stamm/siedlung-bewohner.js",
                "stamm/speicher-welten.js",
                "fachwerk-core.js",
                "scripts/lib/ausgabe-aufnahme.cjs",
            ],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Bewohner, Saat, Welten)" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [
                        { wort: "ziele_genannt", richtung: "≥", wert: 1, wortlaut: "nennt nach 60 min ≥ 1 Ziel", feld: "richter" },
                        { wort: "wahr_pct", richtung: "≥", wert: 100, wortlaut: "100 % wahr gegen den Zustand", feld: "tiefe" },
                    ],
                },
                3: {
                    soll: [
                        { wort: "ziel_arten", richtung: "≥", wert: 10, wortlaut: "≥ 10 unterscheidbare Ziel-Arten", feld: "richter" },
                        { wort: "rho", richtung: "≥", wert: 0.6, wortlaut: "ρ ≥ 0,6", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Saaten", wortlaut: "10 Saaten", feld: "richter" },
                },
                4: {
                    soll: [
                        { wort: "kausal_pct", richtung: "≥", wert: 30, wortlaut: "≥ 30 % der Ziele mit kausalem Vorgänger", feld: "richter" },
                        { wort: "folge_spieltage", richtung: "≤", wert: 1, wortlaut: "binnen 1 Spieltag im Blick", feld: "richter" },
                    ],
                    umfang: { verlangt: 10000, einheit: "Bewohner einer Stadt", wortlaut: "10² offene Ziele in einer Stadt mit 10⁴ Bewohnern", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "praeferenz_pct", richtung: "≥", wert: 50, wortlaut: "Präferenz ≥ 50 %", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Bewohner einer Metropole", wortlaut: "10⁵ ungeschriebene Ziele, Metropole mit 10⁶", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "wechsel_pct", richtung: "≥", wert: 90, wortlaut: "Zustand getauscht → das Ziel wechselt ≥ 90 %", feld: "richter" },
                        { wort: "panel_pct", richtung: "≤", wert: 70, wortlaut: "Panel-2AFC gegen von Menschen geschriebene Ziele derselben Lage ≤ 70 %", feld: "richter" },
                        { wort: "sprung_s", richtung: "≤", wert: 5, wortlaut: "Zeitsprung ≤ 5 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 1e9, einheit: "Bewohner eines Planeten", wortlaut: "10⁸ Ziele auf einem Planeten mit 10⁹ Bewohnern", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "rate_pct", richtung: "≥", wert: 50, wortlaut: "nach 1 000 h ≥ 50 % der Rate in Stunde 10", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "Planeten", wortlaut: "jeder Bewohner auf 10³ Planeten über 10⁵ Jahre", feld: "umfang" },
                },
            },
            seite: { SAATEN },
            lauf: async function zieleLauf(H, P, L) {
                // ── S2–S7 · Saat, Bewohner und Welten der Sitzung ──
                const zaehlFn = function (r) {
                    const st = r.state;
                    const FC = globalThis.__fachwerkCore;
                    let bew = 0;
                    let sied = 0;
                    let maxBew = 0;
                    let nachPlan = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (S.liste) n = S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function") {
                            n = S.plan.slots.reduce((a, sl) => a + Math.max(0, FC.leuteVon(sl.ov) | 0), 0);
                            nachPlan++;
                        }
                        bew += n;
                        if (n > maxBew) maxBew = n;
                    }
                    const welten = new Set((r.worldsIndexLoad ? r.worldsIndexLoad() : []).map((w) => w.worldId));
                    if (st.worldMeta && st.worldMeta.worldId) welten.add(st.worldMeta.worldId);
                    const p = st.playerMesh ? st.playerMesh.position : null;
                    const peers = st.p2p && st.p2p.peers ? st.p2p.peers.size : 0;
                    return { bew, sied, maxBew, nachPlan, welten: welten.size, saat: st.worldMeta ? st.worldMeta.seed : null, peers, pos: p ? [Math.round(p.x), Math.round(p.z)] : null };
                };
                const t = await L.ev("return (" + zaehlFn + ")(r);");
                L.zeile("ziele Welt " + JSON.stringify(t));
                const urteile = (nr, erzeugt, was, fehlt) => (erzeugt >= P.sprossen[nr].umfang.verlangt ? L.leser(nr, fehlt, erzeugt) : L.umfang(nr, erzeugt, was));
                const bewText = t.bew + " Bewohner in " + t.sied + " Siedlungen (" + t.nachPlan + " gezählt nach `leuteVon` ihres Plans), die größte " + t.maxBew;
                const keinZiel = "kein Leser offener Ziele: die Welt führt kein Ziel des Spielers — die Bewohner tragen ihre Bedürfnisse nur als Orte ihres Tags (`_bewohnerListe`, stamm/siedlung-bewohner.js:458)";
                await L.je(2, async () =>
                    L.leser(
                        2,
                        "eine Not, die ein Bewohner im Blick äußert: kein Bewohner spricht — die Bedürfnisse sind die Bindung seiner Orte (koerper-core `tagesBindung` in `_bewohnerListe`, stamm/siedlung-bewohner.js:458), keine Äußerung; der Haken säße im Bewohner-Takt (stamm/siedlung-bewohner.js:1554 `_tickBewohner`)"
                    )
                );
                await L.je(4, async () => urteile(4, t.maxBew, "die größte Siedlung der Sitzung trägt " + t.maxBew + " Bewohner (" + bewText + ") — keine Stadt mit 10⁴", keinZiel));
                await L.je(5, async () => urteile(5, t.maxBew, "die größte Siedlung trägt " + t.maxBew + " Bewohner — keine Metropole mit 10⁶", keinZiel));
                await L.je(6, async () => urteile(6, t.bew, "die Welt trägt " + bewText + " — kein Planet mit 10⁹ Bewohnern; ein Zeitsprung lädt die Welt neu (stamm/feld-leben.js:1265)", keinZiel));
                await L.je(7, async () => urteile(7, t.welten, "der Speicher der Sitzung kennt " + t.welten + " Welten (`worldsIndexLoad`, stamm/speicher-welten.js:231), je Welt ein Planet (`_planetSamen`, stamm/gelaende-chunks.js:672) — 10³ verlangt", keinZiel));
                // S3 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort; je Saat
                // gezählt Bewohner und Siedlungen (die Domänen, an denen die Arten je Ort stiegen). Trägt die Welt alle Saaten, urteilt der
                // fehlende Leser offener Ziele. Die Schleife läuft zuletzt bis 8 s vor der Frist (S4–S7 lasen die Welt der Sitzung).
                await L.je(3, async () => {
                    const v = P.sprossen[3].umfang.verlangt;
                    const arg = { stamm: P.leiter + "-s3", n: v, bis: Date.now() + Math.max(0, (L.rest() - 8) * 1000) };
                    const s = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", (r) => { const z = (" + zaehlFn + ")(r); return [z.bew, z.sied]; });", Math.max(5, L.rest() - 2));
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("ziele S3 Saaten " + JSON.stringify(s));
                    const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m)";
                    const welten = "Bewohner/Siedlungen je Saat " + (s.je.map((x) => x.z.join("/")).join(" · ") || "—");
                    if (s.je.length < v) return L.umfang(3, s.je.length, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Saaten (" + zeit + "; " + welten + "; Ende: " + s.grund + ")");
                    L.leser(3, keinZiel + " — in " + v + " Saaten (" + welten + "; " + zeit + ")", s.je.length);
                });
            },
        })
    );

    // ─────────── erleben.sinn.legenden — Legenden aus Bewohnern und Ereignissen ───────────
    // Das Tagebuch der Welt (`state.worldJournal`, `journalAppend` stamm/dienst.js:385, Deckel 200) ist der Leser von S1: das Programm
    // zählt seine Zeilen und die, die einen Ort tragen. Bewohner erzählen nicht und geben nichts weiter (kein Gedächtnis gesehener
    // Taten) — S2 urteilt `leser`; S3–S7 zählen Bewohner (Liste oder `leuteVon` des Plans) und Welten der Sitzung.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinn.legenden",
            sek: 15,
            pfad: ["stamm/dienst.js", "stamm/dirigent-kern.js", "stamm/siedlung-bewohner.js", "stamm/feld-nexus.js", "stamm/speicher-welten.js", "fachwerk-core.js"],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Tagebuch, Bewohner, Welten)" }],
            sprossen: {
                1: {
                    soll: [{ wort: "spur_pct", richtung: "≥", wert: 95, wortlaut: "findet die Spur der Tat im Bild (Bildpaar gegen dieselbe Saat ohne die Tat) ≥ 95 %", feld: "richter" }],
                    umfang: { verlangt: 200, einheit: "Zeilen des Tagebuchs der Welt", wortlaut: "1 Tagebuch der Welt, 200 Zeilen", feld: "umfang" },
                    auge: { pose: "der Ort einer Zufallszeile des Tagebuchs, Ego Mittag", vorbild: "dieselbe Saat ohne die Tat an derselben Pose (Bildpaar)" },
                },
                2: {
                    soll: [
                        { wort: "faktentreue_pct", richtung: "≥", wert: 95, wortlaut: "Faktentreue ≥ 95 %", feld: "richter" },
                        { wort: "antwort_p95_s", richtung: "≤", wert: 2, wortlaut: "Antwort p95 ≤ 2 s am Gerät allein", feld: "preis" },
                    ],
                },
                3: {
                    soll: [{ wort: "kern_pct", richtung: "≥", wert: 90, wortlaut: "Kern-Treue (Wer, Was, Wo) ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Bewohner eines Dorfs", wortlaut: "durch ein Dorf (10²)", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "ursprung_pct", richtung: "≥", wert: 80, wortlaut: "findet ein Agent das Ursprungsereignis in ≥ 80 %", feld: "richter" }],
                    umfang: { verlangt: 10000, einheit: "Bewohner einer Stadt", wortlaut: "10³ Geschichten in einer Stadt mit 10⁴", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "gefuehrt", richtung: "≥", wert: 7, wortlaut: "≥ 7 führen zu einem Ort, dessen Bild das Erzählte trägt", feld: "richter" },
                        { wort: "reise_s", richtung: "≤", wert: 5, wortlaut: "Reise an den Ort ≤ 5 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Bewohner einer Region", wortlaut: "Legenden über 10³ Jahre einer Region mit 10⁶", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "kern_wahr", richtung: "≥", wert: 8, wortlaut: "Kern in ≥ 8 im Bild wahr", feld: "richter" },
                        { wort: "sprung_s", richtung: "≤", wert: 5, wortlaut: "Sprung zum Ursprung ≤ 5 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 1e9, einheit: "Bewohner", wortlaut: "10⁹ Bewohner, 10⁴ Jahre: Mythen mit wahrem Kern", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "saaten_pct", richtung: "≥", wert: 90, wortlaut: "in ≥ 90 % wählt das Panel", feld: "richter" },
                        { wort: "paare_pct", richtung: "≥", wert: 50, wortlaut: "die Legende vor der Lore der Vergleichstitel in ≥ 50 % der Paare", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Planeten", wortlaut: "10³ Planeten, 10⁶ Jahre", feld: "umfang" },
                },
            },
            lauf: async function legendenLauf(H, P, L) {
                const zaehlFn = function (r) {
                    const st = r.state;
                    const FC = globalThis.__fachwerkCore;
                    let bew = 0;
                    let sied = 0;
                    let maxBew = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (S.liste) n = S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function") n = S.plan.slots.reduce((a, sl) => a + Math.max(0, FC.leuteVon(sl.ov) | 0), 0);
                        bew += n;
                        if (n > maxBew) maxBew = n;
                    }
                    const welten = new Set((r.worldsIndexLoad ? r.worldsIndexLoad() : []).map((w) => w.worldId));
                    if (st.worldMeta && st.worldMeta.worldId) welten.add(st.worldMeta.worldId);
                    const J = (st.worldJournal && st.worldJournal.entries) || [];
                    const ort = (e) => !!(e && e.ctx && Number.isFinite(e.ctx.x) && Number.isFinite(e.ctx.z));
                    const arten = {};
                    for (const e of J) arten[e.type] = (arten[e.type] || 0) + 1;
                    return { zeilen: J.length, deckel: (st.worldJournal && st.worldJournal.entryCap) || 200, mitOrt: J.filter(ort).length, arten, bew, sied, maxBew, welten: welten.size };
                };
                const t = await L.ev("return (" + zaehlFn + ")(r);");
                L.zeile("legenden Welt " + JSON.stringify(t));
                const urteile = (nr, erzeugt, was, fehlt) => (erzeugt >= P.sprossen[nr].umfang.verlangt ? L.leser(nr, fehlt, erzeugt) : L.umfang(nr, erzeugt, was));
                const keinGedaechtnis = "kein Bewohner trägt ein Gedächtnis gesehener Taten und gibt keines weiter — der Haken säße im Bewohner-Takt (stamm/siedlung-bewohner.js:1554 `_tickBewohner`)";
                // ── S1 · das Tagebuch der Welt ──
                await L.je(1, async () =>
                    urteile(
                        1,
                        t.zeilen,
                        "das Tagebuch der Sitzung trägt " + t.zeilen + " Zeilen (Deckel " + t.deckel + ", " + JSON.stringify(t.arten) + "), " + t.mitOrt + " davon mit Ort — 200 Zeilen verlangt",
                        "die Zeile trägt keinen Ort (" + t.mitOrt + " von " + t.zeilen + " mit Ort, `journalAppend` stamm/dienst.js:385) und kein Gegenbild derselben Saat ohne die Tat — der Spieler kann der Zeile nicht folgen"
                    )
                );
                // ── S2 · ein Bewohner erzählt, was er sah ──
                await L.je(2, async () =>
                    L.leser(2, "ein Bewohner erzählt auf Frage eine Tat, die er sah: " + keinGedaechtnis + "; das einzige Gespräch ist die KI des Chats (`maybeAnswerWithLlm`, stamm/feld-nexus.js:1463), sie liest das Tagebuch, nie einen Bewohner")
                );
                await L.je(3, async () => urteile(3, t.maxBew, "die größte Siedlung der Sitzung trägt " + t.maxBew + " Bewohner (" + t.sied + " Siedlungen) — ein Dorf von 10² verlangt", "Weitergabe über 2 Hände: " + keinGedaechtnis));
                await L.je(4, async () => urteile(4, t.maxBew, "die größte Siedlung trägt " + t.maxBew + " Bewohner — keine Stadt mit 10⁴", "Gerücht neben Wahrheit (Stemma-Probe): " + keinGedaechtnis));
                await L.je(5, async () => urteile(5, t.bew, "die Welt trägt " + t.bew + " Bewohner in " + t.sied + " Siedlungen — keine Region mit 10⁶, keine Zeit von 10³ Jahren", "die Legende führt zu einem Ort: " + keinGedaechtnis));
                await L.je(6, async () => urteile(6, t.bew, "die Welt trägt " + t.bew + " Bewohner — 10⁹ verlangt; ein Sprung zum Ursprung lädt die Welt neu (stamm/feld-leben.js:1265)", "Mythos mit wahrem Kern: " + keinGedaechtnis));
                await L.je(7, async () => urteile(7, t.welten, "der Speicher kennt " + t.welten + " Welten (`worldsIndexLoad`, stamm/speicher-welten.js:231) — 10³ Planeten verlangt", "Überlieferung je Art: " + keinGedaechtnis));
            },
        })
    );

    // ─────────── erleben.sinn.tod — Leben und Tod des Spielers ───────────
    // S1 stirbt im echten Spiel: ein fahrbares Werk ≤ 40 m (sonst „bau mir einen wagen“ im Chat), aufsitzen (`mountArchitecture`), Pfad,
    // tödlicher Schaden (`damagePlayer` → `_playerDeathRespawn`); gemessen: derselbe Leib, am Anker (`_genesisAnkunft`), das Gefährt bleibt
    // stehen, das Tagebuch trägt den Tod, die Rückkehr bis die Welt am Ankunftsort steht. S2 rafft die Wunde über die Uhr der Vitals
    // (`tickPlayerVitals`) und legt das Bildpaar am Todesort; danach steht der Leib der Sitzung wieder, wo er war. S3–S7: kein Gesetz.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinn.tod",
            sek: 60,
            mutiert: true,
            pfad: [
                "stamm/koerper-seele.js",
                "stamm/koerper-fahrt.js",
                "stamm/gelaende-boden.js",
                "stamm/siedlung-ort.js",
                "stamm/siedlung-bauten.js",
                "stamm/dienst.js",
                "stamm/dirigent-kern.js",
                "stamm/feld-leben.js",
                "stamm/koerper-leib.js",
                "scripts/lib/welt-boot.cjs",
                "fachwerk-core.js",
            ],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Leib, Tagebuch, Bewohner)" }],
            sprossen: {
                1: {
                    soll: [{ wort: "rueckkehr_s", richtung: "≤", wert: 5, wortlaut: "Rückkehr ≤ 5 s", feld: "preis" }],
                    welt: [
                        { wort: "tod_journal", ab: 1, was: "der Tod steht im Tagebuch der Welt (journalAppend „loss“)" },
                        { wort: "leib_gleich", ab: 1, was: "derselbe Leib (dasselbe playerMesh) nach der Rückkehr" },
                        { wort: "am_anker", ab: 1, was: "der Leib steht ≤ 2 m an der Mitte des Genesis-Orts (`_genesisAnkunft`)" },
                        { wort: "gefaehrt_bleibt", ab: 1, was: "das Gefährt steht ≤ 0,5 m, wo er fiel, nicht mehr geritten, im Bild" },
                    ],
                },
                2: {
                    soll: [{ wort: "wunde_min", richtung: "≥", wert: 10, wortlaut: "die Wunde mindert die Werte des Spielers messbar über ~10 min", feld: "richter" }],
                    // ZAHL (auge-klasse.cjs): die Wunde urteilt an der Zeit, das Bildpaar ist Beleg — der Zeuge: Werte, die der Tod wirklich minderte
                    welt: [{ wort: "gemindert", ab: 1, was: "Werte des Spielers, die der Tod minderte (Stand vor dem Tod gegen nach der Rückkehr)" }],
                    auge: { pose: "der Todesort der Sitzung, Ego — das Bild vor dem Tod (-S2-vor.png) und nach der Rückkehr (-S2.png)", vorbild: "dasselbe Bild vor dem Tod (Bildpaar vor/nach am Todesort: Lebensspur)" },
                },
                3: { soll: [{ wort: "nennen_pct", richtung: "≥", wert: 80, wortlaut: "≥ 80 % nennen Ort und Täter", feld: "richter" }] },
                4: {
                    umfang: { verlangt: 40, einheit: "Jahre eines Spieler-Lebens im Zeitraffer", wortlaut: "Zeitraffer 40 Jahre", feld: "richter" },
                    auge: { pose: "der Leib des Spielers vor seinem Haus, Ego/Third — mit 20 und mit 60 Jahren", vorbild: "derselbe Mensch mit 20 und 60 Jahren (Altersfotos), Haus und Beziehungen geändert" },
                },
                5: { soll: [{ wort: "bestaende_erbe", richtung: "≥", wert: 3, wortlaut: "nach dem Tod gehen ≥ 3 Bestände sichtbar an den Erben", feld: "richter" }] },
                6: {
                    soll: [{ wort: "unterschied_pp", richtung: "≥", wert: 20, wortlaut: "Unterschied ≥ 20 Prozentpunkte", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Bewohner, die den Spieler nie sahen", wortlaut: "der Ruf reist: 10⁶ Bewohner, die den Spieler nie sahen", feld: "umfang" },
                },
                7: { soll: [{ wort: "teil_pct", richtung: "≥", wert: 70, wortlaut: "ihren Tod als „Teil der Geschichte\" ≥ 70 %", feld: "richter" }] },
            },
            lauf: async function todLauf(H, P, L) {
                const path = require("path");
                // ── das Bild vor dem Tod an der Pose der Sitzung (dieselbe Kamera und dasselbe /bild wie L.auge) ──
                try {
                    const kam = await L.ev(
                        "r._loopCamera(performance.now()); const c = r.state.camera; return [...c.position.toArray(), ...c.getWorldDirection(new T.Vector3()).multiplyScalar(20).add(c.position).toArray()];"
                    );
                    const b = await L.wb("/bild", { px: kam[0], py: kam[1], pz: kam[2], lx: kam[3], ly: kam[4], lz: kam[5], w: 1280, h: 720, datei: path.join(L.D, P.leiter + "-S2-vor.png") }, 60);
                    L.zeile("tod Bild vor dem Tod " + ((b && b.datei) || "?"));
                } catch (e) {
                    if (e && e.messort) throw e;
                    L.zeile("tod Bild vor dem Tod warf: " + String((e && e.message) || e).split("\n")[0].slice(0, 160));
                }
                const frist = Math.max(10, H.rest() - 12);
                const capRueck = Math.min(22, Math.max(5, frist / 2));
                const capZurueck = Math.min(22, Math.max(5, frist - capRueck));
                // ── der Tod in der Welt der Sitzung (in der Seite; danach steht der Leib wieder, wo er war) ──
                const todFn = async function (r, T, arg) {
                    const st = r.state;
                    const S = st.player;
                    const pmesh = st.playerMesh;
                    const pm = pmesh.position;
                    const o = {};
                    const zahlen = (x) => Object.fromEntries(Object.entries(x || {}).filter(([, v]) => typeof v === "number" && Number.isFinite(v)));
                    const steht = () => r._weltSteht() && !r._bepflanzungWartet();
                    // das Warten der Werkbank (`__weltStehtNach`, scripts/lib/welt-boot.cjs:306) mit Frist: Takt um Takt der Seite, bis die Welt steht
                    const warte = async (capMs) => {
                        const t0 = performance.now();
                        const regler = st.perfRegulator;
                        st.perfRegulator = false;
                        let n = 0;
                        try {
                            while (performance.now() - t0 < capMs) {
                                await window.__seitenTakt(n);
                                n++;
                                if (steht()) return { s: +((performance.now() - t0) / 1000).toFixed(2), takte: n, steht: true };
                            }
                        } finally {
                            st.perfRegulator = regler;
                        }
                        return { s: +((performance.now() - t0) / 1000).toFixed(2), takte: n, steht: false };
                    };
                    const J = () => (st.worldJournal && st.worldJournal.entries) || [];
                    const vor = {
                        pos: pm.clone(),
                        modus: r.getGameMode(),
                        hp: S.hp,
                        wunde: S.deathWoundIntensity || 0,
                        gnade: S.respawnGraceUntil,
                        letzt: S.deathLastTick,
                        emo: S.emotions ? { sorrow: S.emotions.sorrow, awe: S.emotions.awe } : null,
                        halt: st.weatherEffectTime,
                        ausdauer: S.stamina,
                        mana: S.mana,
                        stats: zahlen(S.stats),
                        letzte: J()[J().length - 1] || null,
                    };
                    const neu = [];
                    let wagen = null;
                    try {
                        try {
                            // das Gefährt: das nächste fahrbare Werk ≤ 40 m, sonst ein Wagen aus dem Satz des Spielers (spawn_studio)
                            const ab = (a) => Math.hypot(a.position.x - vor.pos.x, a.position.z - vor.pos.z);
                            wagen = st.architectures.filter((a) => a && a.position && a.affordances && a.affordances.moveable && ab(a) <= 40).sort((a, b) => ab(a) - ab(b))[0] || null;
                            o.wagenHer = wagen ? "Welt (" + wagen.type + ")" : null;
                            if (!wagen) {
                                const alt = new Set(st.architectures);
                                st.weatherEffectTime = 0;
                                try {
                                    r.processChatCommand("bau mir einen wagen");
                                } finally {
                                    st.weatherEffectTime = vor.halt;
                                }
                                for (const a of st.architectures) if (!alt.has(a)) neu.push(a);
                                wagen = neu.find((a) => a.affordances && a.affordances.moveable) || null;
                                o.wagenHer = wagen ? "Satz „bau mir einen wagen“ (" + wagen.type + ")" : "keines (" + neu.length + " neue Werke aus „bau mir einen wagen“)";
                            }
                            if (wagen) {
                                const m = r.mountArchitecture(wagen);
                                o.aufgesessen = S.mountedArch === wagen.id ? 1 : 0;
                                if (!o.aufgesessen) o.aufsitzen = (m && m.reason) || "?";
                            }
                            const wp = wagen ? { x: wagen.position.x, z: wagen.position.z } : null;
                            // der Tod im Pfad (frieden und schöpfer verwerfen jeden Schaden, `damagePlayer`), ohne Gnade einer früheren Rückkehr
                            if (vor.modus !== "pfad") r.setGameMode("pfad");
                            S.respawnGraceUntil = -Infinity;
                            const t0 = performance.now();
                            for (let i = 0; i < 6 && !((S.respawnGraceUntil || -Infinity) > st.spielZeit); i++) r.damagePlayer(1000, "probe");
                            o.tot = (S.respawnGraceUntil || -Infinity) > st.spielZeit ? 1 : 0;
                            o.todZeit = S.respawnGraceUntil - AnazhRealm.RESPAWN_GRACE_SEC;
                            o.todMs = +(performance.now() - t0).toFixed(1);
                            const e = J()[J().length - 1];
                            o.journal = e && e !== vor.letzte && e.type === "loss" ? 1 : 0;
                            o.leib = st.playerMesh === pmesh ? 1 : 0;
                            o.ritt = S.mountedArch === null || S.mountedArch === undefined ? false : S.mountedArch;
                            o.wunde = S.deathWoundIntensity;
                            const statsTod = zahlen(S.stats);
                            o.gemindert = Object.keys(vor.stats)
                                .filter((k) => Number.isFinite(statsTod[k]) && statsTod[k] < vor.stats[k] - 1e-9)
                                .map((k) => k + " " + +vor.stats[k].toFixed(3) + "→" + +statsTod[k].toFixed(3));
                            if (o.tot) {
                                // die Rückkehr: bis die Welt am Ankunftsort steht (das Bild trägt den Leib dort)
                                o.rueckkehr = await warte(arg.capRueck);
                                const M = r._genesisMitte();
                                o.anker = M ? +Math.hypot(pm.x - M.x, pm.z - M.z).toFixed(2) : null;
                                o.wegM = +Math.hypot(pm.x - vor.pos.x, pm.z - vor.pos.z).toFixed(1);
                                if (wagen) o.wagen = { da: st.architectures.includes(wagen) ? 1 : 0, d: +Math.hypot(wagen.position.x - wp.x, wagen.position.z - wp.z).toFixed(2), ritt: o.ritt };
                                // die Wunde über die Uhr der Vitals (`tickPlayerVitals`, die Spiel-Uhr) im Raffer zu 10 s, bis sie verheilt ist
                                // (die Lebenszeit der Wunde ab dem Tod in Spiel-Sekunden: die Rückkehr trug schon Takte der Vitals)
                                let t = Math.max(Number.isFinite(S.deathLastTick) ? S.deathLastTick : -Infinity, st.spielZeit);
                                let sek = 0;
                                for (; sek < 1800 && (S.deathWoundIntensity || 0) > 0; sek += 10) r.tickPlayerVitals((t += 10));
                                o.wundeSek = +(t - o.todZeit).toFixed(1);
                                o.wunde_min = o.gemindert.length && !((S.deathWoundIntensity || 0) > 0) ? +(o.wundeSek / 60).toFixed(2) : o.gemindert.length ? 30 : 0;
                            }
                        } finally {
                            // der Leib der Sitzung zurück: Ort, Modus, Lebenswerte, Wunde, Gnade, Gefühl — das Tagebuch behält den Tod
                            if (wagen && S.mountedArch === wagen.id) r.dismountArchitecture();
                            pm.copy(vor.pos);
                            if (st.playerVel && st.playerVel.setValue) st.playerVel.setValue(0, 0, 0);
                            st._fieldVy = 0;
                            if (r.getGameMode() !== vor.modus) r.setGameMode(vor.modus);
                            S.deathWoundIntensity = vor.wunde;
                            S.respawnGraceUntil = vor.gnade;
                            S.deathLastTick = vor.letzt;
                            if (vor.emo && S.emotions) Object.assign(S.emotions, vor.emo);
                            S.stamina = vor.ausdauer;
                            S.mana = vor.mana;
                            r.recomputePlayerStats();
                            S.hp = vor.hp;
                            st.weatherEffectTime = vor.halt;
                        }
                        // zurück an der Pose der Sitzung: die Welt dort steht wieder, das Gefährt steht im Bild, wo er fiel
                        o.zurueck = await warte(arg.capZurueck);
                        if (wagen && o.wagen) o.wagen.bild = st.architectures.includes(wagen) && r._archIsRendered(wagen) ? 1 : 0;
                    } finally {
                        for (const a of neu) if (st.architectures.includes(a)) r.removeArchitecture(a, { still: true });
                    }
                    return o;
                };
                const o = await L.ev("return (" + todFn + ")(r, T, " + JSON.stringify({ capRueck: capRueck * 1000, capZurueck: capZurueck * 1000 }) + ");", capRueck + capZurueck + 15).then(
                    (x) => x,
                    (e) => ({ fehler: String((e && e.message) || e).split("\n")[0].slice(0, 240) })
                );
                L.zeile("tod " + JSON.stringify(o).slice(0, 700));
                // ── S1 · Tod setzt zurück an den Ankunftsort ──
                await L.je(1, async () => {
                    if (o.fehler) throw new Error("der Tod warf: " + o.fehler);
                    const w = o.wagen || {};
                    const R = o.rueckkehr || {};
                    const werte = { rueckkehr_s: R.steht ? R.s : null };
                    const welt = {
                        tod_journal: o.journal || 0,
                        leib_gleich: o.leib || 0,
                        am_anker: Number.isFinite(o.anker) && o.anker <= 2 ? 1 : 0,
                        gefaehrt_bleibt: w.da === 1 && w.d <= 0.5 && w.ritt === false && w.bild === 1 ? 1 : 0,
                    };
                    const taeter = [
                        !o.tot ? "der Leib starb nicht (" + o.todMs + " ms Schaden im Pfad)" : null,
                        o.tot && !R.steht ? "die Welt am Ankunftsort stand nach " + R.s + " s noch nicht (" + R.takte + " Takte)" : null,
                        !o.wagen ? "kein Gefährt: " + o.wagenHer + (o.aufsitzen ? ", Aufsitzen " + o.aufsitzen : "") : null,
                        o.wagen && !welt.gefaehrt_bleibt ? "das Gefährt (" + o.wagenHer + "): " + JSON.stringify(w) : null,
                        !welt.am_anker ? "der Leib steht " + o.anker + " m von der Mitte des Genesis-Orts" : null,
                        "Rückkehr " + R.s + " s über " + o.wegM + " m",
                    ].filter(Boolean);
                    L.gemessen(1, werte, { welt, taeter: taeter.join(" · ") });
                });
                // ── S2 · die Spur am Todesort und die Wunde ──
                await L.je(2, async () => {
                    if (o.fehler) throw new Error("der Tod warf: " + o.fehler);
                    if (!o.tot) throw new Error("kein Tod in der Sitzung — kein Bildpaar am Todesort");
                    L.zeile("tod S2 Wunde " + JSON.stringify({ gemindert: o.gemindert, sek: o.wundeSek, zurueck: o.zurueck }));
                    await L.auge(2, { werte: { wunde_min: o.wunde_min }, welt: { gemindert: (o.gemindert || []).length } });
                });
                const zaehlFn = function (r) {
                    const st = r.state;
                    const FC = globalThis.__fachwerkCore;
                    let bew = 0;
                    let sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        if (S.liste) bew += S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function") bew += S.plan.slots.reduce((a, sl) => a + Math.max(0, FC.leuteVon(sl.ov) | 0), 0);
                    }
                    const inv = st.player && Array.isArray(st.player.inventory) ? st.player.inventory.filter(Boolean).length : 0;
                    return { bew, sied, inv };
                };
                const t = await L.ev("return (" + zaehlFn + ")(r);");
                L.zeile("tod Welt " + JSON.stringify(t));
                await L.je(3, async () =>
                    L.leser(3, "Zeugen erzählen den Tod, der Täter steigt im Ruf: kein Bewohner trägt ein Gedächtnis gesehener Taten, kein Ruf eines Täters — der Tod steht nur im Tagebuch (stamm/koerper-seele.js:379 journalAppend „loss“)")
                );
                await L.je(4, async () =>
                    L.leser(4, "der Leib altert nicht: das Alter des Spielers ist ein Wert seiner Gestalt (stamm/koerper-leib.js:55 `alter`), keine Uhr altert ihn, kein Zeitraffer über 40 Jahre (die Welt-Uhr `_weltTag`, stamm/feld-leben.js:2604)")
                );
                await L.je(5, async () =>
                    L.leser(5, "kein Erbe: der Tod kehrt denselben Leib zurück (stamm/koerper-seele.js:355 `_playerDeathRespawn`), kein Kind, kein Gesetz des Erbes — " + t.inv + " Bestände im Inventar bleiben beim selben Leib")
                );
                await L.je(6, async () =>
                    t.bew >= P.sprossen[6].umfang.verlangt
                        ? L.leser(6, "der Ruf reist: kein Ruf des Spielers in der Welt (stamm/koerper-seele.js:355)", t.bew)
                        : L.umfang(6, t.bew, "die Welt trägt " + t.bew + " Bewohner in " + t.sied + " Siedlungen — keine ferne Stadt, keine 10⁶ Bewohner, die den Spieler nie sahen")
                );
                await L.je(7, async () =>
                    L.leser(7, "Tod als Wendepunkt in jeder Epoche, auf jedem Planeten, als jede Art: die Rückkehr kennt nur die Mitte des Genesis-Orts derselben Welt und Zeit (stamm/koerper-seele.js:355, `_genesisAnkunft` stamm/gelaende-boden.js:561); kein Leser der Beschreibung blinder Spieler")
                );
            },
        })
    );

    // ─────────── erleben.sinn.entdeckung — Entdeckung ───────────
    // Das Programm liest die Saat: das Welt-Affinitäts-Feld (`worldFieldAt`, stamm/feld-leben.js:1793, die vier Achsen, aus denen Wald,
    // Fels, Kristall und Glut wachsen) und die Höhe der Saat (`_terrainSaatY`) an 8 Orten 400 m um den Spieler gegen seinen Ort, und
    // zählt die Funde im Umkreis 50 m (Wesen, Seltenheiten des Felds, Ruinen). Wo die Welt den Umfang trägt, legt die Probe das Bild für
    // den Blind-Agenten (auge); Ursache, Schicht, fremder Planet haben keinen Leser.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinn.entdeckung",
            sek: 60,
            pfad: ["stamm/feld-leben.js", "stamm/gelaende-boden.js", "stamm/vegetation-baum.js", "stamm/siedlung-ort.js", "stamm/speicher-welten.js", "stamm/gelaende-chunks.js"],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Feld, Funde, Welten)" }],
            sprossen: {
                1: {
                    soll: [{ wort: "orte_anders", richtung: "≥", wert: 1, wortlaut: "Blind-Agent nennt in 10 min ≥ 1 Ort", feld: "richter" }],
                    umfang: { verlangt: 1, einheit: "Orte, die sich aus der Saat vom Nachbarn unterscheiden", wortlaut: "1 Ort, der sich aus der Saat vom Nachbarn unterscheidet", feld: "umfang" },
                    auge: { pose: "der Ort der Sitzung, Ego — neben dem Nachbar-Ort 400 m weiter mit anderem Feld der Saat", vorbild: "der Nachbar-Ort derselben Saat (Blind-Agent: „anders als der vorige“, begründet am Bild)" },
                },
                2: {
                    soll: [{ wort: "funde_besonders", richtung: "≥", wert: 5, wortlaut: "Funde, die ein Blind-Agent „besonders\" nennt ≥ 5", feld: "richter" }],
                    umfang: { verlangt: 1, einheit: "Funde je 100 m Weg (Umkreis 50 m der Pose)", wortlaut: "1 Fund je 100 m Weg", feld: "umfang" },
                    auge: { pose: "der Ort der Sitzung, Ego — die Funde im Umkreis 50 m", vorbild: "Blind-Agent-Urteil „besonders“ über den Spielgang von 10 min" },
                },
                3: { soll: [{ wort: "ursache_pct", richtung: "≥", wert: 80, wortlaut: "Anteil Funde mit Ursache im Ereignis-Graph ≥ 80 %", feld: "richter" }] },
                4: {
                    soll: [{ wort: "neues_pct", richtung: "≥", wert: 90, wortlaut: "Anteil Regionen, in denen Blind-Agenten nach 30 min noch Neues finden ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Saaten", wortlaut: "N = 100 Saaten", feld: "richter" },
                },
                5: {
                    soll: [{ wort: "plausibel_pct", richtung: "≥", wert: 80, wortlaut: "Grabung: Schichtbild gegen Referenz der Epoche, Plausibilität ≥ 80 %", feld: "richter" }],
                    auge: { pose: "die Grabung unter der Stadt, Ego — das Schichtbild", vorbild: "archäologisches Schichtprofil der Epoche (Referenz)" },
                },
                6: {
                    soll: [
                        { wort: "richtig_pct", richtung: "≥", wert: 70, wortlaut: "beantwortet der Spieler Fragen zu einem fremden Planeten ≥ 70 % richtig", feld: "richter" },
                        { wort: "sprung_s", richtung: "≤", wert: 5, wortlaut: "Planetensprung ≤ 5 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 10, einheit: "h Spiel", wortlaut: "nach 10 h", feld: "richter" },
                },
                7: {
                    soll: [{ wort: "rueckgang_pct", richtung: "≤", wert: 50, wortlaut: "Rate neuer Funde je Stunde fällt nach 1 000 h um ≤ 50 %", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "Planeten", wortlaut: "Ultiversum aus 10³ Planeten", feld: "umfang" },
                },
            },
            seite: { SAATEN },
            lauf: async function entdeckungLauf(H, P, L) {
                const feldFn = function (r) {
                    const st = r.state;
                    const p = st.playerMesh.position;
                    const art = (x, z) => {
                        const f = r.worldFieldAt(x, z);
                        let k = "lebendig";
                        for (const q of Object.keys(f)) if (f[q] > f[k]) k = q;
                        return k + "/" + Math.round(r._terrainSaatY(x, z) / 40);
                    };
                    const mitte = art(p.x, p.z);
                    const ring = [];
                    for (let i = 0; i < 8; i++) ring.push(art(p.x + 400 * Math.cos((i * Math.PI) / 4), p.z + 400 * Math.sin((i * Math.PI) / 4)));
                    const d = (q) => Math.hypot(q.x - p.x, q.z - p.z);
                    const nah = (st.architectures || []).filter((a) => a && a.position && d(a.position) <= 50);
                    const wesen = (st.creatures || []).filter((c) => c && c.position && d(c.position) <= 50).length;
                    const selten = nah.filter((a) => r._istNatur(a) && !/baum|gras|busch|strauch|kraut|blume/i.test(a._lodSpecies || a.type));
                    const ruinen = nah.filter((a) => /ruin/i.test(a.type)).length;
                    const welten = new Set((r.worldsIndexLoad ? r.worldsIndexLoad() : []).map((w) => w.worldId));
                    if (st.worldMeta && st.worldMeta.worldId) welten.add(st.worldMeta.worldId);
                    return {
                        mitte,
                        ring,
                        anders: ring.filter((x) => x !== mitte).length,
                        wesen,
                        selten: selten.length,
                        seltenArten: [...new Set(selten.map((a) => a._lodSpecies || a.type))].slice(0, 6),
                        ruinen,
                        saat: st.worldMeta ? st.worldMeta.seed : null,
                        welten: welten.size,
                        pos: [Math.round(p.x), Math.round(p.z)],
                    };
                };
                const f = await L.ev("return (" + feldFn + ")(r);");
                L.zeile("entdeckung Welt " + JSON.stringify(f));
                const funde = f.wesen + f.selten + f.ruinen;
                // ── S1 · ein Ort, der sich aus der Saat vom Nachbarn unterscheidet ──
                await L.je(1, async () => {
                    if (f.anders < P.sprossen[1].umfang.verlangt)
                        return L.umfang(1, f.anders, "an der Pose " + JSON.stringify(f.pos) + " trägt kein Ort 400 m weiter ein anderes Feld der Saat (" + f.mitte + " gegen " + f.ring.join(", ") + ")");
                    await L.auge(1, { erzeugt: f.anders });
                });
                // ── S2 · ein Fund je 100 m Weg ──
                await L.je(2, async () => {
                    if (funde < P.sprossen[2].umfang.verlangt) return L.umfang(2, funde, "im Umkreis 50 m der Pose " + JSON.stringify(f.pos) + " steht kein Fund (Wesen " + f.wesen + ", Seltenheiten " + f.selten + ", Ruinen " + f.ruinen + ")");
                    await L.auge(2, { erzeugt: funde });
                });
                await L.je(3, async () =>
                    L.leser(3, "Funde mit Ursache: kein Ereignis-Graph — die Seltenheit eines Funds emergiert aus dem Rauschen des Welt-Felds (`worldFieldAt`, stamm/feld-leben.js:1793), kein Fund trägt eine Geschichte; im Umkreis 50 m " + funde + " Funde")
                );
                await L.je(5, async () =>
                    L.leser(5, "unter der Stadt liegt keine ältere: der Ort wächst über die Jahre EINES Plans (plan.jahr + spanne, stamm/siedlung-ort.js:2858), kein Gesetz legt eine ältere Schicht darunter, keine Grabung zeigt sie")
                );
                await L.je(6, async () =>
                    L.umfang(6, +(H.sek() / 3600).toFixed(4), "die Leiter spielt " + H.sek() + " s, kein fremder Planet: ein Planetensprung lädt die Welt neu (Reise, stamm/feld-leben.js:1265; `_reiseBetreten`, stamm/netz-portal.js:660)")
                );
                await L.je(7, async () => L.umfang(7, f.welten, "der Speicher kennt " + f.welten + " Welten (`worldsIndexLoad`, stamm/speicher-welten.js:231), je Welt ein Planet (`_planetSamen`, stamm/gelaende-chunks.js:672)"));
                // S4 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort; je Saat
                // dasselbe Feld-Programm am Spawn (Orte 400 m weiter mit anderem Feld / Funde im Umkreis 50 m). Die Schleife läuft zuletzt
                // (S1–S3, S5–S7 lasen die Welt der Sitzung) und endet 4 s vor der Frist. Trägt die Welt alle Saaten, nennt S4 den Leser.
                await L.je(4, async () => {
                    const v = P.sprossen[4].umfang.verlangt;
                    const arg = { stamm: P.leiter + "-s4", n: v, bis: Date.now() + Math.max(0, (L.rest() - 4) * 1000) };
                    const s = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", (r) => { const f = (" + feldFn + ")(r); return [f.anders, f.wesen + f.selten + f.ruinen]; });", Math.max(5, L.rest() - 2));
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("entdeckung S4 Saaten " + JSON.stringify(s));
                    const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m)";
                    const je = "anders/Funde am Spawn je Saat " + (s.je.map((x) => x.z.join("/")).join(" · ") || "—");
                    if (s.je.length < v) return L.umfang(4, s.je.length, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Saaten (" + je + "; " + zeit + "; Ende: " + s.grund + ")");
                    L.leser(4, "Neues nach 30 min je Region: kein Blind-Agent spielt eine Region 30 min ohne Spieler — die Probe legt nur sein Bild (S1/S2 auge), der Leib geht nur über die Eingabe (`_eingabeTakt`, stamm/koerper-bewegung.js:2386) — in " + v + " Saaten (" + je + "; " + zeit + ")", s.je.length);
                });
            },
        })
    );

    // ─────────── erleben.sinn.takt — Takt: Dramaturgie ohne Regisseur ───────────
    // S1 trägt g4 (TAKT_PROBE, 10 min an der Ankunft). Die Sprossen 2–7 verlangen Stunden, Abende, Spieler verschiedener Stärke, eine
    // Metropole und Zeitsprünge: das Programm zählt die Zeit der Leiter, die Bewohner (Liste oder `leuteVon` des Plans) und die Spieler
    // der Sitzung; ein Zeitsprung lädt die Welt neu, die Erfahrung eines Spielers hat keinen Leser.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinn.takt",
            sek: 15,
            bestehend: [1],
            pfad: ["stamm/siedlung-bewohner.js", "stamm/dirigent-kern.js", "stamm/feld-leben.js", "stamm/netz-p2p.js", "fachwerk-core.js"],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Bewohner, Spieler)" }],
            sprossen: {
                2: {
                    soll: [
                        { wort: "tote_pct", richtung: "≤", wert: 20, wortlaut: "tote Minuten ≤ 20 %", feld: "richter" },
                        { wort: "anspruch_pct", richtung: "≤", wert: 10, wortlaut: "Minuten mit > 3 gleichzeitigen Ansprüchen ≤ 10 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1, einheit: "h Spielgang", wortlaut: "1 h Spielgang", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "hoehepunkte", richtung: "≥", wert: 1, wortlaut: "≥ 1 Höhepunkt je 30–60 min", feld: "richter" },
                        { wort: "ruhe_min", richtung: "≥", wert: 5, wortlaut: "danach ≥ 5 min Ruhe", feld: "richter" },
                    ],
                    umfang: { verlangt: 3, einheit: "h eines Abends", wortlaut: "1 Abend (3 h)", feld: "umfang" },
                },
                4: { soll: [{ wort: "rate_abw_pct", richtung: "≤", wert: 30, wortlaut: "Höhepunkt-Rate innerhalb ± 30 %", feld: "richter" }] },
                5: {
                    soll: [
                        { wort: "tote_pct", richtung: "≤", wert: 10, wortlaut: "tote Minuten ≤ 10 %", feld: "richter" },
                        { wort: "ueberlast_pct", richtung: "≤", wert: 10, wortlaut: "Überlast-Minuten ≤ 10 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Bewohner einer Metropole", wortlaut: "Metropole mit 10⁶ Bewohnern", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "ziel_pct", richtung: "≥", wert: 80, wortlaut: "≥ 80 % binnen 2 min bei einem Ziel oder Ereignis im Blick", feld: "richter" },
                        { wort: "sprung_s", richtung: "≤", wert: 5, wortlaut: "Sprung ≤ 5 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 100, einheit: "Zeitsprünge", wortlaut: "N = 100 Sprünge", feld: "richter" },
                },
                7: {
                    soll: [{ wort: "gleichwertig_pct", richtung: "≥", wert: 50, wortlaut: "Bogen gegen AAA-Kampagne ≥ gleichwertig in ≥ 50 %", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "h Blind-Spiel", wortlaut: "Blind-Spieler über 10 h", feld: "richter" },
                },
            },
            lauf: async function taktLauf(H, P, L) {
                const zaehlFn = function (r) {
                    const st = r.state;
                    const FC = globalThis.__fachwerkCore;
                    let maxBew = 0;
                    let sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (S.liste) n = S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function") n = S.plan.slots.reduce((a, sl) => a + Math.max(0, FC.leuteVon(sl.ov) | 0), 0);
                        if (n > maxBew) maxBew = n;
                    }
                    const peers = st.p2p && st.p2p.peers ? st.p2p.peers.size : 0;
                    return { maxBew, sied, peers, spielZeit: Math.round(st.spielZeit || 0) };
                };
                const t = await L.ev("return (" + zaehlFn + ")(r);");
                L.zeile("takt Welt " + JSON.stringify(t));
                const stunden = () => +(H.sek() / 3600).toFixed(4);
                const urteile = (nr, erzeugt, was, fehlt) => (erzeugt >= P.sprossen[nr].umfang.verlangt ? L.leser(nr, fehlt, erzeugt) : L.umfang(nr, erzeugt, was));
                const keinAnspruch = "kein Leser der Ansprüche im Blick je Minute (stamm/dirigent-kern.js:687 state.player)";
                await L.je(2, async () => urteile(2, stunden(), "die Leiter spielt " + H.sek() + " s — 1 h Spielgang verlangt (die Welt-Uhr der Sitzung " + t.spielZeit + " s)", keinAnspruch));
                await L.je(3, async () => urteile(3, stunden(), "die Leiter spielt " + H.sek() + " s — ein Abend von 3 h verlangt", "Höhepunkt (δ im Blick ≥ 3× Median): " + keinAnspruch));
                await L.je(4, async () =>
                    L.leser(4, "die Stärke eines Spielers: kein Leser — der Spieler trägt keine Spielzeit und keine Erfahrung (stamm/dirigent-kern.js:687 state.player), die Sitzung trägt " + (1 + t.peers) + " Spieler")
                );
                await L.je(5, async () => urteile(5, t.maxBew, "die größte Siedlung der Sitzung trägt " + t.maxBew + " Bewohner (" + t.sied + " Siedlungen) — keine Metropole mit 10⁶", keinAnspruch));
                await L.je(6, async () => L.umfang(6, 0, "0 Zeitsprünge in der Sitzung: ein Sprung („reise <Breite> <Länge> <Ma>“, stamm/feld-leben.js:1265) lädt die Welt neu, in ganzen Millionen Jahren"));
                await L.je(7, async () => urteile(7, stunden(), "die Leiter spielt " + H.sek() + " s, " + t.peers + " fremde Spieler in der Sitzung — 10 h Blind-Spiel verlangt", keinAnspruch));
            },
        })
    );

    // ─────────── erleben.sinn.sog — Der Sog — bleiben und wiederkommen ───────────
    // Die Sprossen zählen Menschen: blinde Neulinge, ihre freiwillige Zeit, ihre Wiederkehr über Tage bis Jahre. Das Programm zählt die
    // Spieler der Sitzung (1 + state.p2p.peers) und die Welten des Speichers (`worldsIndexLoad`: je Welt nur `lastPlayed`); eine
    // Spielzeit je Spieler und eine Folge von Besuchen trägt das Spiel nicht — dort `leser`.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinn.sog",
            sek: 15,
            seite: { FAECHER, SOG_AN },
            pfad: ["stamm/netz-p2p.js", "stamm/dirigent-kern.js", "stamm/speicher-welten.js", "fachwerk-core.js", "stamm/daten.js", "stamm/feld-leben.js"],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Spieler, Welten)" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "weiter_pct", richtung: "≥", wert: 70, wortlaut: "Anteil, der nach 10 min freiwillig weiterspielt ≥ 70 %", feld: "richter" },
                        { wort: "erste_tat_min", richtung: "≤", wert: 2, wortlaut: "Zeit bis zur ersten eigenen Tat ≤ 2 min", feld: "richter" },
                    ],
                    umfang: { verlangt: 12, einheit: "blinde Neulinge", wortlaut: "die ersten 10 Minuten, 12 blinde Neulinge", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "median_min", richtung: "≥", wert: 45, wortlaut: "Median ≥ 45 von 60 min", feld: "richter" },
                        { wort: "will_pct", richtung: "≥", wert: 60, wortlaut: "„will weiter“ ≥ 60 %", feld: "richter" },
                    ],
                },
                3: {
                    soll: [
                        { wort: "folgetag_pct", richtung: "≥", wert: 40, wortlaut: "Wiederkehr am Folgetag ≥ 40 %", feld: "richter" },
                        { wort: "tag7_pct", richtung: "≥", wert: 20, wortlaut: "nach 7 Tagen ≥ 20 %", feld: "richter" },
                    ],
                },
                4: {
                    soll: [{ wort: "stunden_getragen", richtung: "≥", wert: 10, wortlaut: "fällt bis Stunde 10 nicht unter die Hälfte von Stunde 1", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "h Spiel", wortlaut: "10 Stunden: die Welt trägt", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "hier_pct", richtung: "≥", wert: 50, wortlaut: "Anteil, der die freie Stunde hier verbringt ≥ 50 %", feld: "richter" },
                        { wort: "blind_pct", richtung: "≥", wert: 50, wortlaut: "Blindpräferenz derselben Szene ≥ 50 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 2, einheit: "h hier gespielt", wortlaut: "2 h hier", feld: "umfang" },
                    auge: { pose: "eine Szene der Sitzung, Ego Mittag", vorbild: "dieselbe Szene im Vergleichstitel (Blindpräferenz)" },
                },
                6: {
                    soll: [
                        { wort: "tag30_pct", richtung: "≥", wert: 20, wortlaut: "Wiederkehr nach 30 Tagen ≥ 20 %", feld: "richter" },
                        { wort: "tag90_pct", richtung: "≥", wert: 10, wortlaut: "nach 90 Tagen ≥ 10 %", feld: "richter" },
                        { wort: "median_h", richtung: "≥", wert: 20, wortlaut: "Median der Gesamtzeit ≥ 20 h", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Spieler", wortlaut: "100 Stunden, 10³ Spieler", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "jahr_pct", richtung: "≥", wert: 10, wortlaut: "Wiederkehr nach 1 Jahr ≥ 10 %", feld: "richter" },
                        { wort: "geworben", richtung: "≥", wert: 1, wortlaut: "je Spieler ≥ 1 weiterer, der durch ihn kam", feld: "richter" },
                    ],
                },
            },
            lauf: async function sogLauf(H, P, L) {
                const t = await L.ev(
                    "const st = r.state; const peers = st.p2p && st.p2p.peers ? st.p2p.peers.size : 0; const w = r.worldsIndexLoad ? r.worldsIndexLoad() : []; return { peers, spieler: 1 + peers, welten: w.length, mitLastPlayed: w.filter((e) => Number.isFinite(e.lastPlayed)).length };"
                );
                L.zeile("sog Welt " + JSON.stringify(t));
                const urteile = (nr, erzeugt, was, fehlt) => (erzeugt >= P.sprossen[nr].umfang.verlangt ? L.leser(nr, fehlt, erzeugt) : L.umfang(nr, erzeugt, was));
                const keineZeit = "kein Leser der Spielzeit je Spieler: der Spieler trägt keine Uhr seines Spiels (stamm/dirigent-kern.js:687 state.player)";
                const keineKehr =
                    "kein Leser der Wiederkehr: der Speicher hält je Welt nur `lastPlayed` (stamm/speicher-welten.js:254 worldsIndexUpsert, " + t.mitLastPlayed + " von " + t.welten + " Welten), keine Folge der Besuche je Spieler";
                // S1 ÜBER DEN FÄCHER (vorher „Umfang nicht erzeugbar“: 0 fremde Spieler): der Richter stellt keine Neulinge auf, er liest
                // je Adresse eines Neulings (12 Saaten, Rolle Neuling an der Ankunft) das Gesetz der Ankunft und ihr erstes Wort — führt es
                // zu einer ersten Tat? Die Kontrolle (die Hilfe statt des Grußes) muss tragen, sonst ist das Prädikat blind.
                await L.je(1, async () => {
                    const v = P.sprossen[1].umfang.verlangt;
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.SOG_AN, export: "fachwerk-core.js:13075 genesisLayout + der Pool firstSpawn (stamm/dirigent-kern.js:458 → stamm/daten.js:2833)", leser: "stamm/werkstatt-hud.js:101 grokMarkFirstSpawn · voxel-worker.js:1375" },
                        adressen: { saaten: Array.from({ length: v }, (_, i) => P.leiter + "-s1-" + (i + 1)), dazu: [{ saat: P.leiter + "-kontrolle", kontrolle: true }] },
                        ms: Math.max(3000, Math.floor((L.rest() - 4) * 1000)),
                        masse: {
                            saaten: { wie: "anzahl", nur: (a) => !a.kontrolle },
                            nennt: { wie: "summe", feld: "nennt", nur: (a) => !a.kontrolle },
                            kontrolle: { wie: "max", feld: "nennt", nur: "kontrolle" },
                            tore: { wie: "min", feld: "tore", nur: (a) => !a.kontrolle },
                            gruss: { wie: "erste", feld: "gruss", nur: (a) => !a.kontrolle },
                        },
                        schlecht: { feld: "nennt", richtung: "min" },
                        pose: (a) => "die Ankunft der Saat " + a.saat + ", Ego, das erste Wort des Begleiters im Bild",
                        ungemessen: ["weiter nach 10 min und die Uhr der ersten Tat: Panel blinder Neulinge (R11)", "das Bild der Ankunft: ungemessen bis zum Gerät"],
                    });
                    L.zeile("sog S1: " + R.akte.slice(0, 500));
                    if (R.werte.kontrolle !== 1) throw new Error("die Kontrolle (die Hilfe als erstes Wort) nennt keine Tat — das Prädikat ist blind (" + R.akte.slice(0, 200) + ")");
                    const w = R.werte;
                    if (!w.saaten) return L.leser(1, "die Ankunft eines Neulings: " + (R.fehlt || "keine Saat gemessen") + " · " + R.akte);
                    const tat =
                        w.nennt < w.saaten
                            ? "kein Gesetz der ersten Tat: das erste Wort des Begleiters „" + w.gruss + "“ (stamm/daten.js:2833) nennt an " + (w.saaten - w.nennt) + " von " + w.saaten + " Saaten keine Taste und keinen Satz der Hilfe; die Hilfe (`_hilfeZeilen` stamm/feld-leben.js:1664) kommt nur auf „hilfe“ (:1009)"
                            : "die erste Tat in ≤ 2 min: das erste Wort nennt sie an " + w.nennt + " von " + w.saaten + " Saaten";
                    L.leser(1, tat + "; " + keineZeit + " — weiter nach 10 min: Panel (R11) · " + R.akte, w.saaten);
                });
                await L.je(2, async () => L.leser(2, "freiwillige Spielzeit ohne Auftrag: " + keineZeit + "; die Sitzung trägt " + t.spieler + " Spieler"));
                await L.je(3, async () => L.leser(3, "Wiederkehr am Folgetag und nach 7 Tagen: " + keineKehr));
                await L.je(4, async () => L.umfang(4, +(H.sek() / 3600).toFixed(4), "die Leiter spielt " + H.sek() + " s — 10 Stunden verlangt; " + keineZeit));
                await L.je(5, async () => L.umfang(5, +(H.sek() / 3600).toFixed(4), "die Leiter spielt " + H.sek() + " s — 2 h hier, 2 h im Vergleichstitel und eine freie Stunde verlangt"));
                await L.je(6, async () => urteile(6, t.spieler, "die Sitzung trägt " + t.spieler + " Spieler — 10³ verlangt", keineKehr));
                await L.je(7, async () =>
                    L.leser(7, "Wiederkehr nach 1 Jahr und Spieler, die durch einen kamen: " + keineKehr + "; keine Einladung zählt, wer durch sie kam (der Beitritt über die Adresse der Einladung, `_weltBeitritt` stamm/netz-p2p.js:61)")
                );
            },
        })
    );

    // ─────────── erleben.sinn.staunen — Die erlebte Größe — Staunen und Merken ───────────
    // Die Sprossen urteilen blinde Spieler und Panels. Das Programm zählt, was die Welt an der Pose der Sitzung trägt (Arten der Natur,
    // Bau-Arten, Gesichter der Bewohner, Wesen, Sterne des Himmels `state.starField`) und wie weit die Sitzung von der Ankunft ging;
    // S2 legt das Bild für die Schätzfrage. Augenblicke aus Gesetzen und der Anflug auf einen Punkt haben keinen Leser.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinn.staunen",
            sek: 30,
            seite: { FAECHER, STAUNEN_AN },
            pfad: ["stamm/vegetation-baum.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-ort.js", "stamm/bild-himmel.js", "stamm/kreatur-leben.js", "stamm/feld-leben.js", "stamm/netz-p2p.js"],
            welt: [{ wort: "gelesen", ab: 1, was: "Leser der Welt, die die Probe las (Bauten, Bewohner, Wesen, Himmel)" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "dinge", richtung: "≥", wert: 10, wortlaut: "blinde Spieler nennen nach 30 min ≥ 10 verschiedene Dinge beim Namen oder im Bild", feld: "richter" },
                        { wort: "wiedergefunden", richtung: "≥", wert: 5, wortlaut: "5 davon finden sie wieder", feld: "richter" },
                    ],
                    umfang: { verlangt: 30, einheit: "min an EINEM Ort", wortlaut: "EIN Ort, 30 min", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "faktor", richtung: "≤", wert: 3, wortlaut: "Median im Faktor 3 der gezählten Zahl", feld: "richter" },
                        { wort: "wiederholt_pct", richtung: "≤", wert: 20, wortlaut: "„wiederholt sich“ ≤ 20 %", feld: "richter" },
                    ],
                    auge: { pose: "der Ort der Sitzung, Ego — Wald, Siedlung oder Markt im Blick", vorbild: "die gezählte Zahl der Arten, Gesichter und Häuser am Ort (Schätzfrage blinder Spieler gegen die Zählung der Probe)" },
                },
                3: {
                    soll: [
                        { wort: "verweil_faktor", richtung: "≥", wert: 2, wortlaut: "Verweildauer und freiwillige Standbilder an den Augenblicken ≥ 2× Umgebung", feld: "richter" },
                        { wort: "panel_median", richtung: "≥", wert: 5, wortlaut: "Staunen-Panel (Skala 1–7) Median ≥ 5", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Augenblicke aus Gesetzen", wortlaut: "10 Augenblicke aus Gesetzen", feld: "umfang" },
                    auge: { pose: "ein Augenblick aus Gesetzen (Sonnenaufgang über dem Meer, Herde am Horizont, Stadt bei Nacht), Ego", vorbild: "die Umgebung desselben Orts ohne den Augenblick (Verweildauer ≥ 2×) und das Staunen-Panel" },
                },
                4: {
                    soll: [
                        { wort: "landmarken", richtung: "≥", wert: 5, wortlaut: "≥ 5 Landmarken in richtiger Folge", feld: "richter" },
                        { wort: "eintoenig_pct", richtung: "≤", wert: 20, wortlaut: "„wurde es eintönig?“ ≤ 20 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "km Reise", wortlaut: "eine Reise über 100 km", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "erkannt_pct", richtung: "≥", wert: 70, wortlaut: "erkennen ≥ 70 % denselben Ort an Bergform oder Flusslauf", feld: "richter" },
                        { wort: "panel_median", richtung: "≥", wert: 5, wortlaut: "Staunen-Panel Median ≥ 5", feld: "richter" },
                        { wort: "sprung_s", richtung: "≤", wert: 5, wortlaut: "Sprung ≤ 5 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 10000, einheit: "Jahre Zeitsprung", wortlaut: "ein Sprung über 10⁴ Jahre", feld: "umfang" },
                    auge: { pose: "derselbe Ort vor und nach dem Sprung, Orbit und Boden", vorbild: "derselbe Ort in der Gegenwart (Bergform, Flusslauf)" },
                },
                6: {
                    soll: [
                        { wort: "faktor", richtung: "≤", wert: 10, wortlaut: "Schätzfrage zur Menge im Faktor 10 der wahren", feld: "richter" },
                        { wort: "einzeln_pct", richtung: "≥", wert: 80, wortlaut: "„jeder Punkt war ein Einzelner“ ≥ 80 %", feld: "richter" },
                    ],
                },
                7: {
                    soll: [{ wort: "wahl_pct", richtung: "≥", wert: 60, wortlaut: "Staunen-Wahl ≥ 60 % für diese Welt", feld: "richter" }],
                    auge: { pose: "ein Augenblick aus Gesetzen, Ego — dieselbe Art Augenblick wie im Vergleichstitel", vorbild: "dieselbe Art Augenblick in den Vergleichstiteln (Paarvergleich)" },
                },
            },
            lauf: async function staunenLauf(H, P, L) {
                const vielFn = function (r) {
                    const st = r.state;
                    const p = st.playerMesh.position;
                    const d = (q) => Math.hypot(q.x - p.x, q.z - p.z);
                    const A = (st.architectures || []).filter((a) => a && a.position && d(a.position) <= 150);
                    const natur = A.filter((a) => r._istNatur(a));
                    const arten = new Set(natur.map((a) => a._lodSpecies || a.type)).size;
                    const bauArten = new Set(A.filter((a) => !r._istNatur(a)).map((a) => a.type)).size;
                    let gesichter = 0;
                    let maxBew = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        const n = S.liste ? S.liste.length : 0;
                        if (Math.hypot(S.ox - p.x, S.oz - p.z) <= 300) gesichter += n;
                        if (n > maxBew) maxBew = n;
                    }
                    const wesen = (st.creatures || []).filter((c) => c && c.position && d(c.position) <= 150);
                    const wesenArten = new Set(wesen.map((c) => (c.userData && (c.userData.soul || c.userData.kind)) || "wesen")).size;
                    const M = r._genesisMitte();
                    const peers = st.p2p && st.p2p.peers ? st.p2p.peers.size : 0;
                    return {
                        arten,
                        bauArten,
                        gesichter,
                        wesen: wesen.length,
                        wesenArten,
                        werke: A.length,
                        sterne: st.starField ? st.starField.count : 0,
                        maxBew,
                        weg_km: M ? +(Math.hypot(p.x - M.x, p.z - M.z) / 1000).toFixed(3) : null,
                        peers,
                        pos: [Math.round(p.x), Math.round(p.z)],
                    };
                };
                const t = await L.ev("return (" + vielFn + ")(r);");
                L.zeile("staunen Welt " + JSON.stringify(t));
                const keinAugenblick =
                    "kein Leser eines Augenblicks: kein Gesetz nennt einen Augenblick (Sonnenaufgang über dem Meer, Herde am Horizont, Stadt bei Nacht), keine Verweildauer des Blicks und kein freiwilliges Standbild je Spieler — der Haken säße am Blick (`_kreaturImBlick`, stamm/kreatur-leben.js:1798)";
                // S1 ÜBER DEN FÄCHER (vorher „Umfang nicht erzeugbar“: 30 min an einem Ort, kein blinder Spieler): der Richter fragt, was
                // die Welt an der Adresse des Neulings trägt — der Ort der Ankunft mit dem Horizont des Gezeichneten (150 m) und der nahe
                // Ort (50 m); die Mutante (3 m) muss unter 10 fallen. Gemessen urteilt S1 nur, wo schon die Welt das Soll nicht trägt
                // (die Obergrenze dessen, was ein Spieler nennen kann); sonst bleibt das Nennen ein Panel (R11) beim Namen.
                await L.je(1, async () => {
                    const s1 = P.sprossen[1].soll;
                    const saat = await L.ev("return r.state.worldMeta && r.state.worldMeta.seed;", 10);
                    // was an einem Ort steht, zählt erst, wenn die Welt steht (`_weltSteht` stamm/dirigent-takt.js:795): eine Welt, die
                    // noch lädt, ist keine leere — höchstens 10 s, sonst kein Urteil beim Namen
                    let steht = false;
                    for (let i = 0; i < 20 && !(steht = await L.ev("return r._weltSteht();", 10)); i++) await H.schlaf(500);
                    if (!steht) throw new Error("die Welt steht nicht (`_weltSteht` stamm/dirigent-takt.js:795 nach 10 s) — was an der Ankunft steht, ist unterwegs, kein Urteil");
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.STAUNEN_AN, export: "state.architectures (stamm/vegetation-baum.js:1482 _vegetationSampleSpawn · stamm/siedlung-satz.js:1257 spawnArchitecture) und state.creatures", leser: "stamm/dirigent-ankunft.js:1233" },
                        adressen: { dazu: [{ saat, radius: 150 }, { saat, radius: 50 }, { saat, radius: 3, mutante: true }] },
                        ms: Math.max(3000, Math.floor((L.rest() - 10) * 1000)),
                        masse: {
                            dinge: { wie: "max", feld: "dinge", nur: (a) => !a.mutante },
                            statisch: { wie: "max", feld: "statisch", nur: (a) => !a.mutante },
                            nah: { wie: "min", feld: "dinge", nur: (a) => !a.mutante },
                            mutante: { wie: "max", feld: "dinge", nur: "mutante" },
                            orte: { wie: "anzahl", nur: (a) => !a.mutante },
                        },
                        schlecht: { feld: "dinge", richtung: "min" },
                        pose: (a) => "der Ort der Ankunft, Ego, Umkreis " + a.radius + " m (das Bild der Schätzfrage)",
                        ungemessen: [
                            "die Zeit 0–30 min am Ort: Wetter (`wetterAt` phyto-core.js:4804) und Tagesplan (`tagesPlan` koerper-core.js:5630) sind Funktionen der Zeit, die Dinge des Orts nicht — kein Verzeichnis Ding × Ort × Zeit",
                            "das Nennen blinder Spieler: Panel (R11); das Bild: ungemessen bis zum Gerät",
                        ],
                    });
                    L.zeile("staunen S1: " + R.akte.slice(0, 500));
                    if (R.werte.mutante != null && R.werte.mutante >= s1[0].wert) throw new Error("die Mutante (Umkreis 3 m) zählt " + R.werte.mutante + " Dinge — das Maß trennt nicht");
                    if (!R.werte.orte) return L.leser(1, "was an einem Ort steht: " + (R.fehlt || "kein Ort gemessen") + " · " + R.akte);
                    const w = R.werte;
                    if (w.dinge < s1[0].wert || w.statisch < s1[1].wert)
                        return L.gemessen(1, { dinge: w.dinge, wiedergefunden: w.statisch }, {
                            erzeugt: 0,
                            welt: { gelesen: R.gemessen },
                            taeter: "an der Ankunft trägt die Welt " + w.dinge + " verschiedene Dinge, " + w.statisch + " davon ohne Gesetz der Bewegung (Natur und Bau) — die Obergrenze dessen, was ein Spieler nennen und wiederfinden kann; der Fächer trägt keine Zeit (0 von 30 min) · " + R.akte,
                        });
                    L.leser(
                        1,
                        "blinde Spieler nennen und finden wieder: Panel (R11) — die Welt trägt an der Ankunft " + w.dinge + " Dinge (nah " + w.nah + "), " + w.statisch +
                            " ohne Gesetz der Bewegung; über 30 min kein Verzeichnis Ding × Ort × Zeit (ein Wesen wird relativ zum Spieler geboren, `_kreaturGeburtsOrt` stamm/kreatur-leben.js:1785) · " + R.akte
                    );
                });
                // ── S2 · die Vielfalt am Ort: das Bild für die Schätzfrage, die Zählung daneben in der Zeile ──
                await L.je(2, async () => {
                    L.zeile("staunen S2 gezählt " + JSON.stringify({ arten: t.arten, bauArten: t.bauArten, gesichter: t.gesichter, wesen: t.wesen, werke: t.werke }));
                    await L.auge(2, {});
                });
                await L.je(3, async () => L.leser(3, keinAugenblick));
                await L.je(4, async () => L.umfang(4, t.weg_km != null ? t.weg_km : 0, "die Sitzung steht " + t.weg_km + " km von der Mitte des Genesis-Orts (`_genesisMitte`, stamm/siedlung-ort.js:1675) — eine Reise über 100 km verlangt"));
                await L.je(5, async () => L.umfang(5, 0, "0 Jahre Zeitsprung in der Sitzung: ein Sprung („reise <Breite> <Länge> <Ma>“, stamm/feld-leben.js:1265) lädt die Welt neu, in ganzen Millionen Jahren"));
                await L.je(6, async () =>
                    L.leser(
                        6,
                        "jeder Punkt ein Einzelner: kein Anflug auf einen Punkt — der Sternhimmel sind " + t.sterne + " Billboards um die Kamera (`_buildStarField`, stamm/bild-himmel.js:315, Radius 480 m), die größte Siedlung trägt " + t.maxBew + " Bewohner; keine Menge von Millionen im Blick"
                    )
                );
                await L.je(7, async () => L.leser(7, "Paarvergleich derselben Art Augenblick: " + keinAugenblick));
            },
        })
    );
}

// ═══════════════════════════════════════ Perspektive sinne ═══════════════════════════════════════
{
    // ─────────── erleben.sinne.sicht — Fremde Sicht: das Auge als Leser des Lichts ───────────
    // Die Welt zeichnet EIN Auge (das Menschenbild, Atlas Bild/sicht): kein Leser für Rezeptor-Kurven, Wärme, Polarisation oder
    // Sehschärfe — S1–S4 urteilen „Leser fehlt“ mit Ort; S5 zählt die Bewohner der Sitzung gegen die Megastadt, S6 die Planeten
    // (EINE Saat). Der Zensus liest das Gesetzbuch der Tiere (`__tetrapodaCore`): erscheint dort ein Sinnes-Gesetz, wirft die Sprosse
    // beim Namen, statt alt zu urteilen.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinne.sicht",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "stamm/bild-sicht.js", "stamm/bild-kosten.js", "stamm/siedlung-bewohner.js", "tetrapoda-core.js", "planet-core.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "muster_nur_biene", richtung: "≥", wert: 1, wortlaut: "≥ 1 Muster nur im Bienenbild", feld: "richter" },
                        { wort: "kontrast", richtung: "≥", wert: 0.2, wortlaut: "Kontrast ≥ 0,2", feld: "richter" },
                    ],
                },
                2: { soll: [{ wort: "spearman", richtung: "≥", wert: 0.7, wortlaut: "Kontrast-Rangordnung über 10 Pflanzenklassen Spearman ≥ 0,7", feld: "richter" }] },
                3: { soll: [{ wort: "pol_winkel_fehler_grad", richtung: "≤", wert: 10, wortlaut: "Polarisationswinkel ±10° zur Rayleigh-Erwartung", feld: "richter" }] },
                4: { soll: [{ wort: "schaerfe_abweichung_pct", richtung: "≤", wert: 30, wortlaut: "im Verhältnis der biologischen Sehschärfe ±30 %", feld: "richter" }] },
                5: {
                    soll: [{ wort: "anteil_ohne_bruch", richtung: "≥", wert: 1, wortlaut: "Anteil ohne Bruch (kein Stoff ohne Spektrum, kein RGB-Zwilling) = 1,0", feld: "richter" }],
                    umfang: { verlangt: 1e7, einheit: "Bewohner der Megastadt", wortlaut: "Megastadt ≥ 10⁷", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "r_rezeptor_boden", richtung: "≥", wert: 0.6, wortlaut: "korrelieren mit dem Bodenspektrum r ≥ 0,6", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Planeten", wortlaut: "N = 20 Planeten", feld: "richter" },
                },
            },
            lauf: async function sichtLauf(H, P, L) {
                const z = await L.ev(
                    "const TC = globalThis.__tetrapodaCore || {}; let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : (S.plan && S.plan.slots ? S.plan.slots.length : 0); } return { saat: r.state.worldMeta && r.state.worldMeta.seed, bew, sied, sinnGesetz: Object.keys(TC).filter((k) => /sinn|rezeptor|spektr|polari|waerme|schaerfe/i.test(k)) };",
                    30
                );
                L.zeile("Zensus Sicht: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.sinnGesetz.length) throw new Error("Leser erschienen (" + z.sinnGesetz.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                await L.je(1, async () => (neu(1), L.leser(1, "kein Bienen-Auge: die Welt zeichnet nur das Menschenbild (RGB), kein Leser für UV/B/G-Rezeptoren und kein UV-Spektrum im Stoff der Blüte (stamm/bild-sicht.js:2, Atlas Bild/sicht)")));
                await L.je(2, async () => (neu(2), L.leser(2, "kein Leser für beliebige Rezeptor-Kurven (2–16): kein Auge außer dem Menschenbild (stamm/bild-sicht.js:2); bild-kosten simuliert den Dichromaten nur als Prüfung des Bildschirms (stamm/bild-kosten.js:3031)")));
                await L.je(3, async () => (neu(3), L.leser(3, "kein Wärmebild und keine Himmels-Polarisation: kein Leser der Leib-Temperatur im Bild, kein Polarisationswinkel im Himmel (stamm/bild-sicht.js:2)")));
                await L.je(4, async () => (neu(4), L.leser(4, "keine Raum-/Zeitauflösung je Auge (Facette, Habicht, Flimmerfusion): das Gesetzbuch der Tiere trägt nur die Farbe des Auges (tetrapoda-core.js:4117 tierAuge)")));
                await L.je(5, async () => {
                    if (z.bew < 1e7) return L.umfang(5, z.bew, "die Sitzung trägt " + z.bew + " Bewohner in " + z.sied + " Siedlungen, keine Megastadt ≥ 10⁷ — und kein Auge außer dem Menschenbild");
                    L.leser(5, "kein Zufallsauge: die Welt zeichnet nur das Menschenbild (stamm/bild-sicht.js:2)", z.bew);
                });
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält EINEN Planeten (Saat " + z.saat + ") und keinen fremden Stern — planetPlan(samen) trägt keinen Stern-Typ (planet-core.js:9)"));
            },
        })
    );

    // ─────────── erleben.sinne.hoeren — Hören jenseits des Menschen ───────────
    // Der Klang der Welt ist das Ohr des Spielers (Atlas Klang): kein Echo, kein Fledermaus-Leib, kein Infraschall, kein Ohr je Art —
    // S1–S5 urteilen „Leser fehlt“ mit Ort, gezählt werden die Gattungen des Gesetzbuchs (wolf · fox · bear · deer); S6 zählt die
    // Saaten der Sitzung (EINE).
    LEITERN.push(
        leiter({
            leiter: "erleben.sinne.hoeren",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "stamm/klang.js", "klang-core.js", "tetrapoda-core.js", "stamm/kreatur-furcht.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            sprossen: {
                1: { soll: [{ wort: "zeit_faktor_blind", richtung: "≤", wert: 2, wortlaut: "Ausgang in ≤ 2× der sehenden Zeit", feld: "richter" }] },
                2: {
                    soll: [
                        { wort: "kollisionen_je_100m", richtung: "≤", wert: 1, wortlaut: "≤ 1 Kollision je 100 m", feld: "richter" },
                        { wort: "trinkt_von_5", richtung: "≥", wert: 4, wortlaut: "trinkt im Flug ≥ 4 von 5", feld: "richter" },
                    ],
                },
                3: { soll: [{ wort: "fangquote_verhaeltnis", richtung: "≥", wert: 0.7, wortlaut: "Fangquote im Echobild ≥ 0,7 der Fangquote im Sichtbild", feld: "richter" }] },
                4: { soll: [{ wort: "richtung_fehler_grad", richtung: "≤", wert: 15, wortlaut: "Richtung zu Gewitter in 10 km ±15°", feld: "richter" }] },
                5: { soll: [{ wort: "spektrum_abweichung_pct", richtung: "≤", wert: 20, wortlaut: "Abgriff-Spektrum folgt dem Hörbereich der Art ±20 %", feld: "richter" }] },
                6: {
                    soll: [{ wort: "anteil_fang_ohne_licht", richtung: "≥", wert: 0.9, wortlaut: "Anteil echo-ortender Arten, deren Fang ohne Licht gelingt ≥ 0,9", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Saaten", wortlaut: "100 Saaten", feld: "richter" },
                },
            },
            lauf: async function hoerenLauf(H, P, L) {
                const z = await L.ev(
                    "const TC = globalThis.__tetrapodaCore || {}; const gatt = new Set(Object.keys(TC.GATTUNGEN || {})); for (const c of r.state.creatures || []) { const g = r._kreaturGattung(c); if (g) gatt.add(g); } return { saat: r.state.worldMeta && r.state.worldMeta.seed, gattungen: [...gatt], sinnGesetz: Object.keys(TC).filter((k) => /hoer|echo|ohr|schall|sinn/i.test(k)), klang: !!(r.state.symphony && r.state.symphony.enabled) };",
                    30
                );
                L.zeile("Zensus Hören: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.sinnGesetz.length) throw new Error("Leser erschienen (" + z.sinnGesetz.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                const g = z.gattungen.join(" · ");
                await L.je(1, async () => (neu(1), L.leser(1, "kein Echo-Sinn: der Klang rechnet keine Laufzeit gegen die Geometrie, kein Blind-Lauf (stamm/klang.js:2, Atlas Klang — nur das Ohr des Spielers)")));
                await L.je(2, async () => (neu(2), L.leser(2, "kein Fledermaus-Leib und kein Echo-Leser: die Gattungen der Welt sind " + g + " (tetrapoda-core.js:62 GATTUNGEN)")));
                await L.je(3, async () => (neu(3), L.leser(3, "keine Beute im Flug und kein Doppler eines Echos: kein fliegender Jäger in " + g + " (tetrapoda-core.js:62), die Jagd liest nur die Witterung (stamm/kreatur-verhalten.js:190)")));
                await L.je(4, async () => (neu(4), L.leser(4, "kein Infraschall-Ohr und kein Fernschall 10–100 km: das Umwelt-Ohr hält die lautesten 7 Stimmen am Spieler (klang-core.js:413 UMWELT), kein Elefanten- oder Wal-Leib")));
                await L.je(5, async () => (neu(5), L.leser(5, "kein Ohr je Art: Hörbereich, Richtung und Schwelle stehen nicht im Leib — die Furcht hört nicht, sie liest Abstand und Witterung (stamm/kreatur-furcht.js:44 _creatureWarinessEigen)")));
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 100 Saaten verlangt, und keine echo-ortende Art"));
            },
        })
    );

    // ─────────── erleben.sinne.geruch — Das Geruchs-Feld: Chemie im Wind ───────────
    // S1 misst im Fenster der Sitzung den Gegenlauf der Karte am ECHTEN Kreatur-Takt (die Folge von `_gameLoopTick`: Stoß-Schritt,
    // Leib-Kontakte, updateCreatures; Bühne wie kreatur-proben): ein Wolf 40 m windab eines Rehs (Größe 0,6), die Suchzeit bis 8 m
    // (der Ring der Hetze + 2 m) — dann dasselbe mit Witterung aus (`_scentAt` → 0) und mit gedrehtem Wind (`_windAt` −x, −z); die
    // Gegenläufe enden am Deckel 3,2 × die Suchzeit (darüber gilt ≥ 3,2). S2–S4 urteilen „Leser fehlt“, S5/S6 zählen Bewohner und Saaten.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinne.geruch",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "scripts/lib/welt-boot.cjs", "stamm/koerper-seele.js", "stamm/kreatur-verhalten.js", "stamm/kreatur-leben.js", "stamm/stoff-material.js", "stamm/siedlung-bewohner.js", "tetrapoda-core.js"],
            welt: [
                { wort: "weg_wolf_m", ab: 5, was: "Weg des Wolfs im Lauf mit Witterung (m)" },
                { wort: "takte", ab: 60, was: "Takte des Kreatur-Takts über die drei Läufe" },
            ],
            sprossen: {
                1: {
                    soll: [
                        { wort: "suchzeit_faktor_aus", richtung: "≥", wert: 3, wortlaut: "Witterung aus oder Wind gedreht → Suchzeit ≥ 3×", feld: "richter" },
                        { wort: "suchzeit_faktor_wind", richtung: "≥", wert: 3, wortlaut: "Witterung aus oder Wind gedreht → Suchzeit ≥ 3×", feld: "richter" },
                    ],
                },
                2: {
                    soll: [
                        { wort: "zeit_s", richtung: "≤", wert: 90, wortlaut: "Aas 100 m gegen den Wind in ≤ 90 s", feld: "richter" },
                        { wort: "faktor_nase_aus", richtung: "≥", wert: 3, wortlaut: "Nase aus ≥ 3× die Zeit", feld: "richter" },
                    ],
                },
                3: { soll: [{ wort: "intermittenz_abweichung_pct", richtung: "≤", wert: 30, wortlaut: "Intermittenz-Faktor ±30 % gegen Rauch-/Tracer-Aufnahme", feld: "richter" }] },
                4: { soll: [{ wort: "abweichung_m", richtung: "≤", wert: 5, wortlaut: "1 h alte Fährte 500 m durch eine Stadt, Abweichung ≤ 5 m", feld: "richter" }] },
                5: {
                    soll: [{ wort: "treffer", richtung: "≥", wert: 0.8, wortlaut: "Treffer ≥ 0,8 über 20 Proben", feld: "richter" }],
                    umfang: { verlangt: 1e7, einheit: "Personen der Megastadt", wortlaut: "Megastadt ≥ 10⁷ Personen", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "trefferquote", richtung: "≥", wert: 0.9, wortlaut: "N = 20 Saaten ≥ 0,9", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Saaten", wortlaut: "N = 20 Saaten", feld: "richter" },
                },
            },
            lauf: async function geruchLauf(H, P, L) {
                // DIE SEITE DER JAGD (im Fenster der Sitzung, r = die Welt): Bühne wie kreatur-proben `buehne` (eigene Tier-Liste, die
                // Welt-Tiere ruhen, Spieler · Modus · Gefühl zurück), drei Läufe an demselben Ort und Wind
                async function jagdSeite(o) {
                    const s = r.state;
                    const A = r.constructor;
                    const pm = s.playerMesh.position;
                    const P0 = pm.clone();
                    const t0 = performance.now();
                    const altModus = r.getGameMode();
                    const altGefuehl = Object.assign({}, s.player.emotions || {});
                    const altSpieler = Object.assign({}, s.player);
                    const altVel = s.playerVel ? [s.playerVel.x(), s.playerVel.y(), s.playerVel.z()] : null;
                    const tote0 = new Set(s.leichname || []);
                    const zurueck = [
                        leihe(s, { creatures: [], creatureEmotions: [], maxCreatures: 64, creatureAnimationTime: 100, _herdContagionAcc: 0, _creatureNetSeq: 1e6, dayLengthMinutes: A.DAY_LENGTH_DEFAULT_MINUTES, lifeField: undefined, emotionField: undefined, faunaBestand: undefined, feldAkte: [], spielZeit: s.spielZeit, faunaLifecycle: s.faunaLifecycle }),
                        leihe(r, { _creatureAiFrame: 0, _faunaStroeme: null, _spielerLageAlt: null }),
                    ];
                    const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                    const neben = (x, z) => {
                        const h = r.getTerrainHeightAt(x, z);
                        return { x, y: (Number.isFinite(h) ? h : pm.y) + 0.5, z };
                    };
                    const imUmkreisLand = (x, z, R) => {
                        if (r._imGrundriss(x, z)) return false;
                        for (const f of [0.5, 1])
                            for (let q = 0; q < 8; q++) {
                                const a = (q / 8) * 2 * Math.PI;
                                const px = x + Math.cos(a) * R * f, pz = z + Math.sin(a) * R * f;
                                if (!r._landAt(px, pz) || r._imGrundriss(px, pz)) return false;
                            }
                        return true;
                    };
                    const kand = [];
                    const huelleNah = (x, z, h, R) => {
                        kand.length = 0;
                        r._blockerUmPlatz(x, z, R + 8, kand);
                        for (const e of kand)
                            for (const b of e.blockerAABBs || []) {
                                if (b.topY <= h + A.PLAYER_STEP_UP || b.botY >= h + 2) continue;
                                if (r._boxAbstand2(b, x, z) < R * R) return true;
                            }
                        return false;
                    };
                    const frei = (dx, dz, R) => {
                        for (let ring = 0; ring < 40; ring++) {
                            const n = Math.max(1, ring * 6);
                            for (let q = 0; q < n; q++) {
                                const a = (q / n) * 2 * Math.PI;
                                const x = P0.x + dx + Math.cos(a) * ring * 8, z = P0.z + dz + Math.sin(a) * ring * 8;
                                const p = r._landAt(x, z) && imUmkreisLand(x, z, R) && neben(x, z);
                                if (p && !huelleNah(x, z, p.y - 0.5, R)) return p;
                            }
                        }
                        return null;
                    };
                    const ruhig = (c) => (c.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 });
                    const takt = (dt) => {
                        r._kreaturStossSchritt(dt);
                        r._leibKontakte();
                        r.updateCreatures(dt);
                    };
                    const weg = () => [...s.creatures].forEach((c) => r.removeCreature(c));
                    try {
                        r.setGameMode("pfad");
                        const M = frei(0, 70, 30);
                        if (!M) return { fehler: "kein freies Feld (30 m ohne Hülle und Wasser) um den Spieler" };
                        const d = r._windDirAt(s._simZeit);
                        const reh0 = neben(M.x - d.x * o.abstandM * 0.5, M.z - d.z * o.abstandM * 0.5);
                        const wolf0 = neben(M.x + d.x * o.abstandM * 0.5, M.z + d.z * o.abstandM * 0.5);
                        const sp = neben(M.x - d.z * 70, M.z + d.x * 70); // der Spieler quer zum Wind, jenseits der Witterung des Wolfs
                        const dt = 1 / 60;
                        let takteSumme = 0;
                        const lauf = (art, deckelS) => {
                            weg();
                            Object.assign(s, { _creatureNetSeq: 1e6, creatureAnimationTime: 100 });
                            Object.assign(r, { _creatureAiFrame: 0, _faunaStroeme: null });
                            const ab2 = [];
                            if (art === "aus") ab2.push(leihe(r, { _scentAt: () => 0 }));
                            if (art === "wind") {
                                const alt = r._windAt;
                                ab2.push(leihe(r, { _windAt: function (x, z, t, aus) { const w = alt.call(this, x, z, t, aus); w.x = -w.x; w.z = -w.z; return w; } }));
                            }
                            try {
                                pm.set(sp.x, sp.y, sp.z);
                                if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                                const wolf = r.spawnCreatureAt(wolf0.x, wolf0.y, wolf0.z, "happy", "wolf", { precise: true, bodySize: 1 });
                                const reh = r.spawnCreatureAt(reh0.x, reh0.y, reh0.z, "happy", "wesen", { precise: true, bodySize: 0.6 });
                                if (!wolf || !reh) return { fehler: "Spawn " + (!wolf ? "wolf" : "wesen") };
                                ruhig(wolf);
                                ruhig(reh);
                                const deckel = Math.ceil(deckelS / dt);
                                const alt = wolf.position.clone();
                                let k = 0, fund = null, witter = null, wegM = 0, minD = ab(wolf.position, reh.position), wand = false;
                                for (; k < deckel; k++) {
                                    if (s.player.emotions) Object.assign(s.player.emotions, { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 });
                                    takt(dt);
                                    wegM += ab(wolf.position, alt);
                                    alt.copy(wolf.position);
                                    if (witter == null && wolf.userData._beute === reh) witter = (k + 1) * dt;
                                    const dd = s.creatures.includes(reh) ? ab(wolf.position, reh.position) : 0;
                                    minD = Math.min(minD, dd);
                                    if (dd <= o.fundM) {
                                        fund = (k + 1) * dt;
                                        k++;
                                        break;
                                    }
                                    if (performance.now() - t0 > o.wandMs) {
                                        wand = true;
                                        break;
                                    }
                                }
                                takteSumme += k;
                                return { art, fundS: fund, bisS: +(k * dt).toFixed(2), deckelS: +deckelS.toFixed(2), witterS: witter, wegM: +wegM.toFixed(1), minD: +minD.toFixed(1), wand };
                            } finally {
                                ab2.reverse().forEach((f) => f());
                            }
                        };
                        const an = lauf("an", o.deckelS);
                        if (an.fehler || an.fundS == null) return { an, takte: takteSumme, wind: d };
                        const aus = lauf("aus", o.faktor * an.fundS);
                        const wind = lauf("wind", o.faktor * an.fundS);
                        return { an, aus, gedreht: wind, takte: takteSumme, wind: { x: +d.x.toFixed(3), z: +d.z.toFixed(3) }, ms: Math.round(performance.now() - t0) };
                    } finally {
                        weg();
                        for (const c of s.leichname || []) if (!tote0.has(c)) r.removeCreature(c);
                        for (const f of zurueck.reverse()) f();
                        pm.copy(P0);
                        const span = r._voxelChunkConfig().span, pc = s.lastPlayerVoxelChunk;
                        if (pc && (pc.cx !== Math.floor(P0.x / span) || pc.cz !== Math.floor(P0.z / span))) await __weltStehtNach();
                        r.setGameMode(altModus);
                        if (s.player.emotions) Object.assign(s.player.emotions, altGefuehl);
                        for (const k of Object.keys(s.player)) if (!(k in altSpieler)) delete s.player[k];
                        Object.assign(s.player, altSpieler);
                        if (altVel && s.playerVel) s.playerVel.setValue(altVel[0], altVel[1], altVel[2]);
                    }
                }
                const z = await L.ev(
                    "let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : (S.plan && S.plan.slots ? S.plan.slots.length : 0); } const TC = globalThis.__tetrapodaCore || {}; return { saat: r.state.worldMeta && r.state.worldMeta.seed, bew, sied, nase: Object.keys(TC).filter((k) => /geruch|duft|faehrte|pheromon|nase/i.test(k)) };",
                    30
                );
                L.zeile("Zensus Geruch: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.nase.length) throw new Error("Leser erschienen (" + z.nase.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                // die billigen Sprossen zuerst (reißt die Frist im Gegenlauf, stehen sie schon in der Ausgabe)
                await L.je(2, async () => (neu(2), L.leser(2, "der Spieler hat keine Nase: das Geruch-Feld `_scentAt` (stamm/koerper-seele.js:1614) lesen nur die Jagd und das Aas der Tiere (stamm/kreatur-verhalten.js:223, :282), kein Leser des Spielers")));
                await L.je(3, async () => (neu(3), L.leser(3, "keine Fahne mit Turbulenz und Alter: `_scentAt` ist ein Augenblicks-Feld exp(−d/rangeM) × Wind ohne Filamente, Intermittenz und Spur-Gedächtnis (stamm/koerper-seele.js:1614)")));
                await L.je(4, async () => (neu(4), L.leser(4, "keine Duftklassen und keine Fährte: Quellen des Felds sind nur Leiber und Fleisch (stamm/kreatur-verhalten.js:221, :282) — keine Blüte, kein Rauch, kein Mensch, kein Pheromon, keine Spur über eine Stunde")));
                await L.je(5, async () => {
                    if (z.bew < 1e7) return L.umfang(5, z.bew, "die Sitzung trägt " + z.bew + " Bewohner in " + z.sied + " Siedlungen, keine Megastadt mit 10⁷ Personen, und keine Person emittiert Geruch");
                    L.leser(5, "keine Person emittiert Geruch (stamm/kreatur-verhalten.js:221)", z.bew);
                });
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 20 Saaten verlangt; kein Fluss trägt Duft (kein Lachs, kein Pheromon-Netz)"));
                await L.je(1, async () => {
                    await L.ort("wiese", "ego");
                    L.preisPose("wiese", "ego");
                    const wandMs = Math.max(5000, (L.rest() - 12) * 1000);
                    const J = await L.ev("return await (" + jagdSeite + ")(" + JSON.stringify({ abstandM: 40, fundM: 8, deckelS: 90, faktor: 3.2, wandMs }) + ");", Math.max(10, L.rest() - 4));
                    L.zeile("Jagd-Gegenlauf: " + JSON.stringify(J));
                    if (J.fehler) throw new Error(J.fehler);
                    if (J.an.fehler) throw new Error(J.an.fehler);
                    const welt = { weg_wolf_m: J.an.wegM, takte: J.takte };
                    if (J.an.fundS == null)
                        return L.gemessen(1, { suchzeit_faktor_aus: null, suchzeit_faktor_wind: null }, { welt, taeter: "der Wolf fand das Reh MIT Witterung nicht in " + J.an.bisS + " s (nächster Abstand " + J.an.minD + " m" + (J.an.wand ? ", Wand-Deckel" : "") + ") — _creatureScentHuntDir (stamm/kreatur-verhalten.js:190)" });
                    for (const g of [J.aus, J.gedreht]) if (!g || g.fehler) throw new Error("Gegenlauf: " + ((g && g.fehler) || "fehlt"));
                    // die Suchzeit eines Gegenlaufs: gefunden → seine Zeit; am Deckel ohne Fund → mindestens der Deckel (bzw. so weit er lief)
                    const f = (g) => +((g.fundS != null ? g.fundS : g.bisS) / J.an.fundS).toFixed(2);
                    const fa = f(J.aus), fw = f(J.gedreht);
                    const schlecht = fa <= fw ? ["Witterung aus", J.aus, fa] : ["Wind gedreht", J.gedreht, fw];
                    L.gemessen(1, { suchzeit_faktor_aus: fa, suchzeit_faktor_wind: fw }, {
                        welt,
                        taeter: schlecht[0] + ": Suchzeit " + (schlecht[1].fundS != null ? schlecht[1].fundS.toFixed(1) + " s" : "> " + schlecht[1].bisS + " s") + " gegen " + J.an.fundS.toFixed(1) + " s mit Witterung (Faktor " + schlecht[2] + ")" +
                            (schlecht[0] === "Wind gedreht" ? " — gegen den Wind wittert der Wolf mit windMod ≥ minDirectional weiter (stamm/koerper-seele.js:1636), _creatureScentHuntDir wählt jede Witterung > 0 (stamm/kreatur-verhalten.js:224)" : "") +
                            (schlecht[1].wand ? " · Wand-Deckel der Probe" : ""),
                    });
                });
            },
        })
    );

    // ─────────── erleben.sinne.feld — Feld-Sinne: Magnetismus, Elektrizität, Schwingung ───────────
    // Der Planet trägt kein Magnetfeld (planetPlan: Körper, Schollen, Schlüsselbilder …) und kein Wesen einen Feld-Sinn: S1–S3 und S5
    // urteilen „Leser fehlt“ mit Ort, S4 ist ein Bildvergleich (auge) — die Kruste trägt keine Magnetisierung, also urteilt der Leser;
    // S6 zählt die Planeten der Sitzung (EINEN).
    LEITERN.push(
        leiter({
            leiter: "erleben.sinne.feld",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "planet-core.js", "tetrapoda-core.js", "stamm/kreatur-furcht.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "polarlicht_breite_min_grad", richtung: "≥", wert: 60, wortlaut: "60–75° geomagnetisch", feld: "richter" },
                        { wort: "polarlicht_breite_max_grad", richtung: "≤", wert: 75, wortlaut: "60–75° geomagnetisch", feld: "richter" },
                    ],
                },
                2: {
                    soll: [
                        { wort: "fehler_km", richtung: "≤", wert: 50, wortlaut: "Fehler ≤ 50 km", feld: "richter" },
                        { wort: "faktor_feld_aus", richtung: "≥", wert: 5, wortlaut: "Feld aus → Fehler ≥ 5×", feld: "richter" },
                    ],
                },
                3: { soll: [{ wort: "fundquote", richtung: "≥", wert: 0.8, wortlaut: "Hai findet eingegrabenen Rochen ohne Licht ≥ 0,8", feld: "richter" }] },
                4: { auge: { pose: "Ozeanboden über einem mittelozeanischen Rücken, Draufsicht der Magnetisierung (kein Messort der Sitzung)", vorbild: "Vine & Matthews 1963, Magnetstreifen am Carlsberg-/Reykjanes-Rücken" } },
                5: {
                    soll: [
                        { wort: "anteil_vorlauf", richtung: "≥", wert: 0.7, wortlaut: "Herde flieht ≥ 10 s vor dem Spieler-Erleben des Bebens in ≥ 0,7 der Fälle", feld: "richter" },
                        { wort: "vorlauf_s", richtung: "≥", wert: 10, wortlaut: "Herde flieht ≥ 10 s vor dem Spieler-Erleben des Bebens in ≥ 0,7 der Fälle", feld: "richter" },
                    ],
                },
                6: {
                    soll: [{ wort: "fehlpaarungen", richtung: "≤", wert: 0.1, wortlaut: "Fehlpaarungen ≤ 0,1", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Planeten", wortlaut: "N = 20 Planeten", feld: "richter" },
                },
            },
            lauf: async function feldLauf(H, P, L) {
                const z = await L.ev(
                    "const PC = globalThis.__planetCore || {}; const TC = globalThis.__tetrapodaCore || {}; return { saat: r.state.worldMeta && r.state.worldMeta.seed, planetFeld: Object.keys(PC).filter((k) => /magnet|dipol|dynamo|polarlicht|aurora/i.test(k)), sinn: Object.keys(TC).filter((k) => /magnet|elektro|seitenlinie|vibration|schwingung/i.test(k)) };",
                    30
                );
                L.zeile("Zensus Feld: " + JSON.stringify(z));
                const neu = (nr) => {
                    const n = z.planetFeld.concat(z.sinn);
                    if (n.length) throw new Error("Leser erschienen (" + n.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                await L.je(1, async () => (neu(1), L.leser(1, "kein Dipolfeld: der Planet als Funktion trägt Körper, Schollen, Relief, Vulkanismus, Meer — kein Magnetfeld, keinen Kompass, kein Polarlicht am magnetischen Pol (planet-core.js:9 planetPlan)")));
                await L.je(2, async () => (neu(2), L.leser(2, "kein Magnetsinn und kein Zugvogel: kein Feld (planet-core.js:9), die Gattungen tragen keinen Feld-Sinn (tetrapoda-core.js:62)")));
                await L.je(3, async () => (neu(3), L.leser(3, "kein Elektrosinn, keine Seitenlinie im Verhalten: kein Hai, kein Rochen (tetrapoda-core.js:62 GATTUNGEN); die Seitenlinie im Leib-Kern ist nur Gestalt")));
                await L.je(4, async () => (neu(4), L.leser(4, "keine Magnetisierung der Kruste: die Ozean-Platten wachsen an Nähten ohne Feld und ohne Umpolung (planet-core.js:9 planetPlan) — kein Bild der Streifen zu schießen")));
                await L.je(5, async () => (neu(5), L.leser(5, "keine Boden-Schwingung: die Furcht liest Spieler, Jäger und Glut, kein Beben (stamm/kreatur-furcht.js:44 _creatureWarinessEigen) — und die Welt kennt kein Beben")));
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält EINEN Planeten (Saat " + z.saat + ") — 20 Planeten verlangt, keiner trägt einen Dynamo"));
            },
        })
    );

    // ─────────── erleben.sinne.genom — Sinnes-Genom: Breite und Evolution der Umwelten ───────────
    // Gezählt wird das Gesetzbuch der Tiere in der Sitzung: die Gattungen (GATTUNGEN ∪ die Gattungen der lebenden Tiere) und die
    // Sinnes-Radien des Verhaltens (`_verhaltenGesetz`: jagd.scentRangeM, furcht.noticeRadius) — EIN Wert für alle Gattungen, kein
    // Genom. S1/S2 urteilen „Leser fehlt“ (kein Radius je Gattung, kein Sinnes-Genom), S3–S6 „Umfang nicht erzeugbar“ an der Artenzahl
    // und den Saaten.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinne.genom",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "tetrapoda-core.js", "stamm/kreatur-furcht.js", "stamm/kreatur-verhalten.js", "stamm/studio-glieder.js", "stamm/koerper-leib.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            sprossen: {
                1: { soll: [{ wort: "anteil_im_band", richtung: "≥", wert: 0.9, wortlaut: "Anteil Sinneswerte im Band der Biologie ≥ 0,9", feld: "richter", aus: 2 }] },
                2: { soll: [{ wort: "anteil_im_band", richtung: "≥", wert: 0.9, wortlaut: "Anteil Sinneswerte im Band der Biologie ≥ 0,9", feld: "richter" }] },
                3: {
                    soll: [
                        { wort: "anteil_hoehle_auge_klein", richtung: "≥", wert: 0.7, wortlaut: "Höhlenarten mit reduziertem Auge ≥ 0,7", feld: "richter" },
                        { wort: "anteil_nacht_auge_gross", richtung: "≥", wert: 0.7, wortlaut: "Nachtarten mit größerem Auge ≥ 0,7", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Arten je Saat", wortlaut: "10³ Arten je Saat", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "generationen", richtung: "≥", wert: 1e5, wortlaut: "Evolution über 10⁵ Generationen", feld: "umfang" }],
                    umfang: { verlangt: 20, einheit: "Saaten", wortlaut: "N = 20 Saaten", feld: "richter" },
                },
                5: {
                    soll: [{ wort: "anteil_feld_ueberlappt", richtung: "≥", wert: 0.9, wortlaut: "Sinnesband überlappt ein im Lebensraum vorhandenes Feld (Licht, Schall, Duft, Feld) ≥ 0,9", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Arten", wortlaut: "10⁶ Arten auf einem Planeten", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "anteil_ohne_bruch", richtung: "≥", wert: 1, wortlaut: "Anteil ohne Bruch und ≤ 5 s = 1,0", feld: "richter" },
                        { wort: "ankunft_s", richtung: "≤", wert: 5, wortlaut: "Ankunft in der Umwelt einer Zufallsart ≤ 5 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Arten", wortlaut: "10⁶ Arten × beliebig viele Planeten", feld: "umfang" },
                },
            },
            lauf: async function genomLauf(H, P, L) {
                const z = await L.ev(
                    "const TC = globalThis.__tetrapodaCore || {}; const VG = r.constructor._verhaltenGesetz(); const gatt = new Set(Object.keys(TC.GATTUNGEN || {})); for (const c of r.state.creatures || []) { const g = r._kreaturGattung(c); if (g) gatt.add(g); } return { saat: r.state.worldMeta && r.state.worldMeta.seed, gattungen: [...gatt], witterM: VG.jagd.scentRangeM, sichtM: VG.furcht.noticeRadius, pirschM: VG.jagd.pirschSichtM, genom: Object.keys(TC).filter((k) => /sinn|genom|rezeptor/i.test(k)) };",
                    30
                );
                L.zeile("Zensus Genom: " + JSON.stringify(z));
                const n = z.gattungen.length;
                const eins = typeof z.witterM === "number" && typeof z.sichtM === "number";
                await L.je(1, async () => {
                    if (!eins) throw new Error("Leser erschienen: Witter-/Sicht-Radius ist kein einzelner Wert mehr (" + JSON.stringify([z.witterM, z.sichtM]) + ") — S1 misst ihn noch nicht");
                    L.leser(1, "kein Radius je Gattung: EIN Witter-Radius " + z.witterM + " m und EIN Sicht-Radius " + z.sichtM + " m (Pirsch " + z.pirschM + " m) für alle " + n + " Gattungen (" + z.gattungen.join(" · ") + ") — tetrapoda-core.js:151 scentRangeM, :183 noticeRadius; nur die Flucht-Distanz trägt die Gattung (tetrapoda-core.js:1998)", n);
                });
                await L.je(2, async () => {
                    if (z.genom.length) throw new Error("Leser erschienen (" + z.genom.join(", ") + ") — S2 misst ihn noch nicht");
                    L.leser(2, "kein Sinnes-Genom: die Gattungen tragen size · neck · leg · diet · build (tetrapoda-core.js:62), die Sinne sind Konstanten des Verhaltens (tetrapoda-core.js:151, :183) — keine Kurve, kein Band, keine Reichweite je Art", n);
                });
                await L.je(3, async () => L.umfang(3, n, "die Saat " + z.saat + " trägt " + n + " Gattungen (" + z.gattungen.join(" · ") + "), keine Höhlen- oder Nachtart mit eigenem Auge"));
                await L.je(4, async () => L.umfang(4, 1, "die Sitzung hält EINE Saat (" + z.saat + ") und keine Evolution der Sinne — die Gattungen sind gesetzt (tetrapoda-core.js:62), keine Generation verändert ein Auge"));
                await L.je(5, async () => L.umfang(5, n, "der Planet der Sitzung trägt " + n + " Gattungen, 10⁶ Arten verlangt"));
                await L.je(6, async () => L.umfang(6, n, "die Welt trägt " + n + " Gattungen auf EINEM Planeten (Saat " + z.saat + ") — keine Umwelt einer Zufallsart zu betreten"));
            },
        })
    );

    // ─────────── erleben.sinne.signale — Signale: ein Wesen schreibt, ein anderes liest ───────────
    // S1 misst im Fenster der Sitzung die Herde des ECHTEN Wurfs (`_kreaturWurf`, Hirsche) wie die Linse herde: der Spieler geht ab 30 m mit
    // 1,4 m/s durch sie, je Flüchter der erste Takt in Flucht und Lauf und ob er selbst witterte (`_alarmEigen`) — der Anteil aus zweiter
    // Hand; Gegenlauf: der Alarm des Verbands aus (`_kreaturVerbandAlarm` nur das eigene Wittern) — der Zeuge ist der Abfall in
    // Prozentpunkten. S2/S4–S6 urteilen „Leser fehlt“, S3 zählt die Saaten.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinne.signale",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "scripts/lib/welt-boot.cjs", "stamm/kreatur-furcht.js", "stamm/kreatur-leben.js", "stamm/kreatur-verhalten.js", "stamm/siedlung-bewohner.js", "stamm/klang.js"],
            welt: [
                { wort: "fluechter", ab: 1, was: "Glieder der Herde, die im Lauf flohen" },
                { wort: "gegenlauf_pp", ab: 1, was: "Prozentpunkte, um die der Anteil aus zweiter Hand fällt, wenn der Alarm des Verbands aus ist" },
            ],
            sprossen: {
                1: { soll: [{ wort: "anteil_zweite_hand", richtung: "≥", wert: 0.7, wortlaut: "Fluchtbeginn vor eigener Wahrnehmung ≥ 0,7", feld: "richter" }] },
                2: { soll: [{ wort: "richtungsfehler_grad", richtung: "≤", wert: 15, wortlaut: "Richtungsfehler ≤ 15°", feld: "richter" }] },
                3: {
                    soll: [{ wort: "r_aehnlichkeit_distanz", richtung: "≥", wert: 0.4, wortlaut: "Gesangs-Ähnlichkeit fällt mit Distanz r ≥ 0,4", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Saaten", wortlaut: "N = 20 Saaten", feld: "richter" },
                },
                4: { soll: [{ wort: "generationen", richtung: "≥", wert: 1000, wortlaut: "Annahmequote gefälschter Signale fällt über 10³ Generationen", feld: "richter" }] },
                5: { soll: [{ wort: "anteil_vor_ereignis", richtung: "≥", wert: 0.6, wortlaut: "Bewohner mit Beruf handeln vor dem Ereignis nach dem Signal (Herde eingetrieben vor dem Wolf) ≥ 0,6", feld: "richter" }] },
                6: { soll: [{ wort: "empfaenger_reagieren", richtung: "≥", wert: 0.8, wortlaut: "Empfänger reagieren ≥ 0,8", feld: "richter" }] },
            },
            lauf: async function signaleLauf(H, P, L) {
                // DIE SEITE DER HERDE (im Fenster der Sitzung): Bühne wie kreatur-proben `buehne`, zwei Läufe (Alarm an · aus) am selben Ort
                async function herdeSeite(o) {
                    const s = r.state;
                    const A = r.constructor;
                    const pm = s.playerMesh.position;
                    const P0 = pm.clone();
                    const t0 = performance.now();
                    const altModus = r.getGameMode();
                    const altGefuehl = Object.assign({}, s.player.emotions || {});
                    const altSpieler = Object.assign({}, s.player);
                    const altVel = s.playerVel ? [s.playerVel.x(), s.playerVel.y(), s.playerVel.z()] : null;
                    const tote0 = new Set(s.leichname || []);
                    const zurueck = [
                        leihe(s, { creatures: [], creatureEmotions: [], maxCreatures: 64, creatureAnimationTime: 100, _herdContagionAcc: 0, _creatureNetSeq: 1e6, dayLengthMinutes: A.DAY_LENGTH_DEFAULT_MINUTES, lifeField: undefined, emotionField: undefined, faunaBestand: undefined, feldAkte: [], spielZeit: s.spielZeit, faunaLifecycle: s.faunaLifecycle }),
                        leihe(r, { _creatureAiFrame: 0, _faunaStroeme: null, _spielerLageAlt: null }),
                    ];
                    const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                    const neben = (x, z) => {
                        const h = r.getTerrainHeightAt(x, z);
                        return { x, y: (Number.isFinite(h) ? h : pm.y) + 0.5, z };
                    };
                    const imUmkreisLand = (x, z, R) => {
                        if (r._imGrundriss(x, z)) return false;
                        for (const f of [0.5, 1])
                            for (let q = 0; q < 8; q++) {
                                const a = (q / 8) * 2 * Math.PI;
                                const px = x + Math.cos(a) * R * f, pz = z + Math.sin(a) * R * f;
                                if (!r._landAt(px, pz) || r._imGrundriss(px, pz)) return false;
                            }
                        return true;
                    };
                    const kand = [];
                    const huelleNah = (x, z, h, R) => {
                        kand.length = 0;
                        r._blockerUmPlatz(x, z, R + 8, kand);
                        for (const e of kand)
                            for (const b of e.blockerAABBs || []) {
                                if (b.topY <= h + A.PLAYER_STEP_UP || b.botY >= h + 2) continue;
                                if (r._boxAbstand2(b, x, z) < R * R) return true;
                            }
                        return false;
                    };
                    const frei = (dx, dz, R) => {
                        for (let ring = 0; ring < 40; ring++) {
                            const n = Math.max(1, ring * 6);
                            for (let q = 0; q < n; q++) {
                                const a = (q / n) * 2 * Math.PI;
                                const x = P0.x + dx + Math.cos(a) * ring * 8, z = P0.z + dz + Math.sin(a) * ring * 8;
                                const p = r._landAt(x, z) && imUmkreisLand(x, z, R) && neben(x, z);
                                if (p && !huelleNah(x, z, p.y - 0.5, R)) return p;
                            }
                        }
                        return null;
                    };
                    const takt = (dt) => {
                        r._kreaturStossSchritt(dt);
                        r._leibKontakte();
                        r.updateCreatures(dt);
                    };
                    const weg = () => [...s.creatures].forEach((c) => r.removeCreature(c));
                    try {
                        r.setGameMode("frieden");
                        const heim = frei(0, 70, 40);
                        if (!heim) return { fehler: "kein freies Land für die Herde (40 m ohne Hülle und Wasser)" };
                        const lauf = (alarm) => {
                            weg();
                            Object.assign(s, { _creatureNetSeq: 1e6, creatureAnimationTime: 100 });
                            Object.assign(r, { _creatureAiFrame: 0, _faunaStroeme: null });
                            const ab2 = alarm ? [] : [leihe(r, { _kreaturVerbandAlarm: (c, NAT, von, w) => ((c.userData._alarmEigen = w >= NAT.fleeThreshold), w) })];
                            try {
                                // DER WURF NACH DEM GESETZ DES SPIELS (pm-front-f1; GTX 31ea3847 „Herde 1“): `_kreaturWurf` stellt jeden
                                // weiteren Geworfenen nur fern vom Spieler (≥ CREATURE_SPAWN_FAR_MIN 130 m) und außer Blick — der Spieler
                                // stand 30 m daneben, die Herde der Rothirsche (wesen → deer, Kopfzahl 3–7) fiel auf EIN Tier. Der Spieler
                                // steht beim Wurf 200 m westlich, der Blick ist leer (kein Frustum: die Kamera der Probe zeigt nicht hin);
                                // danach beginnt der Gang 30 m vor der Herde wie zuvor
                                const fern = neben(heim.x - 200, heim.z);
                                pm.set(fern.x, fern.y, fern.z);
                                const blick = leihe(r, { _frustumCache: null });
                                let glieder;
                                try {
                                    glieder = r._kreaturWurf({ x: heim.x, z: heim.z }, "wesen", "happy", r._faunaRng("verband"), 7) || [];
                                } finally {
                                    blick();
                                }
                                const p0 = neben(heim.x - 30, heim.z);
                                pm.set(p0.x, p0.y, p0.z);
                                if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                                if (!glieder.length) return { fehler: "der Wurf trug kein Glied" };
                                const alt = glieder.map((c) => c.position.clone());
                                const beginn = [];
                                let k = 0, wegM = 0, wand = false;
                                for (; k < o.takte; k++) {
                                    const q = neben(heim.x - 30 + (1.4 * k) / 60, heim.z);
                                    pm.set(q.x, q.y, q.z);
                                    takt(1 / 60);
                                    glieder.forEach((c, i) => {
                                        const d = ab(c.position, alt[i]);
                                        wegM += d;
                                        alt[i].copy(c.position);
                                        if (!beginn[i] && c.userData._motionZustand === "flucht" && d > 1 / 60) beginn[i] = [k, c.userData._alarmEigen === true];
                                    });
                                    if (performance.now() - t0 > o.wandMs) {
                                        wand = true;
                                        break;
                                    }
                                }
                                const B = beginn.filter(Boolean);
                                return { n: glieder.length, laufen: B.length, zweiteHand: B.filter((x) => !x[1]).length, wegM: +wegM.toFixed(1), takte: k, ersterS: B.length ? +(Math.min(...B.map((x) => x[0])) / 60).toFixed(2) : null, letzterS: B.length ? +(Math.max(...B.map((x) => x[0])) / 60).toFixed(2) : null, wand };
                            } finally {
                                ab2.forEach((f) => f());
                            }
                        };
                        const an = lauf(true);
                        if (an.fehler) return { an };
                        const aus = lauf(false);
                        return { an, aus, heim: { x: Math.round(heim.x), z: Math.round(heim.z) }, ms: Math.round(performance.now() - t0) };
                    } finally {
                        weg();
                        for (const c of s.leichname || []) if (!tote0.has(c)) r.removeCreature(c);
                        for (const f of zurueck.reverse()) f();
                        pm.copy(P0);
                        const span = r._voxelChunkConfig().span, pc = s.lastPlayerVoxelChunk;
                        if (pc && (pc.cx !== Math.floor(P0.x / span) || pc.cz !== Math.floor(P0.z / span))) await __weltStehtNach();
                        r.setGameMode(altModus);
                        if (s.player.emotions) Object.assign(s.player.emotions, altGefuehl);
                        for (const k of Object.keys(s.player)) if (!(k in altSpieler)) delete s.player[k];
                        Object.assign(s.player, altSpieler);
                        if (altVel && s.playerVel) s.playerVel.setValue(altVel[0], altVel[1], altVel[2]);
                    }
                }
                const z = await L.ev(
                    "let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : (S.plan && S.plan.slots ? S.plan.slots.length : 0); } const TC = globalThis.__tetrapodaCore || {}; return { saat: r.state.worldMeta && r.state.worldMeta.seed, bew, sied, signal: Object.keys(TC).filter((k) => k.split('_').flatMap((t) => (t === t.toUpperCase() ? [t] : t.split(/(?=[A-Z])/))).some((w) => /^(signal|tanz|marke|gesang|dialekt|mimikry)/i.test(w))) };",
                    30
                );
                // der Wächter liest WORTE der Schlüssel (camelCase, SNAKE), nie Teilworte: GTX f68dbf09 nannte `fluchtDistanz` („Dis-tanz“)
                // einen erschienenen Leser, S2 · S4 · S5 · S6 warfen und standen ohne Urteil (richter-ohne-urteil)
                L.zeile("Zensus Signale: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.signal.length) throw new Error("Leser erschienen (" + z.signal.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                // die billigen Sprossen zuerst (reißt die Frist in der Herde, stehen sie schon in der Ausgabe)
                await L.je(2, async () => (neu(2), L.leser(2, "kein Bienentanz und keine Reviermarke: kein Wesen schreibt Richtung und Entfernung, kein Revier liest eine Marke (tetrapoda-core.js:62 GATTUNGEN, stamm/kreatur-verhalten.js:190 — die Nase liest nur Leiber)")));
                await L.je(3, async () => L.umfang(3, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 20 Saaten verlangt; kein Gesang je Population"));
                await L.je(4, async () => (neu(4), L.leser(4, "kein Lauscher, kein Fälscher: der Räuber wittert nur Leiber (stamm/kreatur-verhalten.js:190), der Tier-Ruf klingt nur im Ohr des Spielers (stamm/klang.js:506 _tierRuf)")));
                await L.je(5, async () => (neu(5), L.leser(5, "kein Bewohner liest ein Signal der Welt vor dem Ereignis: die Flucht der Bewohner folgt dem gesehenen Jäger aus zweiter Hand (stamm/siedlung-bewohner.js:2174), kein Hirte treibt vor dem Wolf ein", z.bew)));
                await L.je(6, async () => (neu(6), L.leser(6, "keine Signale in fremden Kanälen (UV, Entladung, Biolumineszenz): kein Sinnes-Genom von Sender und Empfänger, nur das Menschenbild (stamm/bild-sicht.js:2)")));
                await L.je(1, async () => {
                    await L.ort("wiese", "ego");
                    L.preisPose("wiese", "ego");
                    const wandMs = Math.max(5000, (L.rest() - 12) * 1000);
                    const J = await L.ev("return await (" + herdeSeite + ")(" + JSON.stringify({ takte: 3600, wandMs }) + ");", Math.max(10, L.rest() - 4));
                    L.zeile("Herde Alarm an/aus: " + JSON.stringify(J));
                    if (J.fehler) throw new Error(J.fehler);
                    if (J.an.fehler) throw new Error(J.an.fehler);
                    if (!J.aus || J.aus.fehler) throw new Error("Gegenlauf Alarm aus: " + ((J.aus && J.aus.fehler) || "fehlt"));
                    if (J.an.wand || J.aus.wand) throw new Error("Wand-Deckel der Probe: Lauf " + J.an.takte + " / Gegenlauf " + J.aus.takte + " von 3600 Takten — der Gegenlauf ist unvollständig");
                    const anteil = (t) => (t && t.laufen ? t.zweiteHand / t.laufen : 0);
                    const a = +anteil(J.an).toFixed(3), b = +anteil(J.aus).toFixed(3);
                    L.gemessen(1, { anteil_zweite_hand: J.an.laufen ? a : null }, {
                        welt: { fluechter: J.an.laufen, gegenlauf_pp: Math.round((a - b) * 100) },
                        taeter: "zweite Hand " + J.an.zweiteHand + " von " + J.an.laufen + " Flüchtern (Herde " + J.an.n + ", Flucht ab " + J.an.ersterS + " s bis " + J.an.letzterS + " s; Alarm aus: " + J.aus.zweiteHand + " von " + J.aus.laufen + ") — der Alarm des Verbands (stamm/kreatur-furcht.js:7 _kreaturVerbandAlarm)",
                    });
                });
            },
        })
    );

    // ─────────── erleben.sinne.gesehen — Gesehen werden: Tarnung, Mimikry, Warnfarbe ───────────
    // Die Entdeckung des Spielers liest Abstand, Aura und Erinnerung, nie Farbe (`_kreaturMenschFlucht`, `_creatureWarinessSpieler`):
    // S1–S3 und S5 urteilen „Leser fehlt“ mit Ort, S4/S6 zählen Saaten und Planeten der Sitzung.
    LEITERN.push(
        leiter({
            leiter: "erleben.sinne.gesehen",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "stamm/kreatur-furcht.js", "stamm/siedlung-bewohner.js", "tetrapoda-core.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            sprossen: {
                1: { soll: [{ wort: "abweichung_orange_gruen_pct", richtung: "≤", wert: 15, wortlaut: "Entdeckungsdistanz bei Spieler in Orange ≈ Grün (±15 %)", feld: "richter" }] },
                2: { soll: [{ wort: "distanz_minus_pct", richtung: "≥", wert: 30, wortlaut: "getarnte Beute: Entdeckungsdistanz −≥ 30 %", feld: "richter" }] },
                3: { soll: [{ wort: "unterschied_pct", richtung: "≥", wert: 30, wortlaut: "Entdeckungsdistanzen verschieden ≥ 30 %", feld: "richter" }] },
                4: {
                    soll: [{ wort: "abstand_fall_pct", richtung: "≥", wert: 50, wortlaut: "Abstand Beute ↔ Boden im Jäger-Farbraum fällt ≥ 50 %", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Saaten", wortlaut: "N = 20 Saaten", feld: "richter" },
                },
                5: { soll: [{ wort: "anteil_kulturen", richtung: "≥", wert: 0.8, wortlaut: "Jäger-Kleidung im Rezeptorraum des Wilds näher am Boden als Festkleidung ≥ 0,8 der Kulturen", feld: "richter" }] },
                6: {
                    soll: [{ wort: "anteil_unter_zufall", richtung: "≥", wert: 0.8, wortlaut: "Beute-Boden-Abstand im Jäger-Farbraum unter Zufall in ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Planeten", wortlaut: "N = 20 Planeten", feld: "richter" },
                },
            },
            lauf: async function gesehenLauf(H, P, L) {
                const z = await L.ev(
                    "let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : (S.plan && S.plan.slots ? S.plan.slots.length : 0); } const TC = globalThis.__tetrapodaCore || {}; const NAT = r.constructor._verhaltenGesetz().furcht; return { saat: r.state.worldMeta && r.state.worldMeta.seed, bew, sied, sichtM: NAT.noticeRadius, farbe: Object.keys(TC).filter((k) => /tarn|mimikry|warnfarb|rezeptor|farbraum/i.test(k)) };",
                    30
                );
                L.zeile("Zensus Gesehen: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.farbe.length) throw new Error("Leser erschienen (" + z.farbe.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                await L.je(1, async () => (neu(1), L.leser(1, "die Entdeckung des Spielers liest keine Farbe: Abstand (noticeRadius " + z.sichtM + " m), Aura und Erinnerung (stamm/kreatur-furcht.js:107 _creatureWarinessSpieler, :164 _kreaturMenschFlucht) — kein dichromates Auge des Rotwilds")));
                await L.je(2, async () => (neu(2), L.leser(2, "keine Tarnung im Jäger-Auge: die Jagd findet die Beute über die Witterung, nie über Muster gegen Boden (stamm/kreatur-verhalten.js:190); der Pirsch-Blick ist ein Radius (stamm/kreatur-furcht.js:64)")));
                await L.je(3, async () => (neu(3), L.leser(3, "keine sinn-abhängige Tarnung: kein zweites Jäger-Auge (Vogel, UV), kein Rezeptorraum (stamm/kreatur-furcht.js:64, stamm/bild-sicht.js:2)")));
                await L.je(4, async () => L.umfang(4, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 20 Saaten verlangt; keine Färbung entsteht durch Selektion"));
                await L.je(5, async () => (neu(5), L.leser(5, "Bewohner tarnen sich nicht: Kleidung liest kein Auge des Wilds, die Flucht des Wilds vor dem Menschen liest keine Farbe (stamm/kreatur-furcht.js:164)", z.bew)));
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält EINEN Planeten (Saat " + z.saat + ") — 20 Planeten verlangt, kein fremder Stern"));
            },
        })
    );
}

// ═══════════════════════════════════════ Perspektive bild ═══════════════════════════════════════
{
    // ─────────── erleben.bild.ferne — Fernsicht und Treue über die Stufen: die Ferne ist dieselbe Welt ───────────
    // Zählt die Sichtweite (Feld-Pass bis FELD_PASS.rMaxM, stamm/bild-sicht.js:3907, sichtbar erst gemalt, :2239; sonst camera.far des
    // Fern-Rings, stamm/gelaende-fern.js:2360), die Saat und die Sterne mit Ort im Raum (stamm/bild-himmel.js:453/471). „Ferne = Nähe“
    // (SSIM/ΔE nach Abzug der Luft) liest kein Leser: S1–S6 urteilen an der Sicht in km (darunter Umfang, sonst leser), S7/S8 leser (ihr
    // Umfang trägt keine Zahl), S9 Umfang mit den Sternen im Raum.
    LEITERN.push(
        leiter({
            leiter: "erleben.bild.ferne",
            sek: 45,
            seite: { FAECHER, FERNE_AN },
            pfad: ["stamm/bild-sicht.js", "stamm/gelaende-fern.js", "stamm/bild-himmel.js", "stamm/netz-portal.js", "welt-licht.js", "scripts/lib/licht-linsen.cjs", "scripts/werkbank.cjs", "spec/profiband/haushalt.json"],
            welt: [{ wort: "sicht_m", ab: 200, was: "Sichtweite der Welt in m (Feld-Pass oder camera.far), gezählt" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "t_t_soll_min", richtung: "≥", wert: 0.8, wortlaut: "Restkontrast je Kanal gegen Koschmieder T/T_soll 0,8–1,2" },
                        { wort: "t_t_soll_max", richtung: "≤", wert: 1.2, wortlaut: "Restkontrast je Kanal gegen Koschmieder T/T_soll 0,8–1,2" },
                        { wort: "ferne_naehe", richtung: "≥", wert: 0.8, wortlaut: "Ferne = Nähe ≥ 0,8 an 12 Posen" },
                    ],
                    umfang: { verlangt: 0.2, einheit: "km Sicht", wortlaut: "0,2 km", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "bildsprung_pct", richtung: "≤", wert: 5, wortlaut: "kein Bildsprung > 5 % Leuchtdichte im Zielfenster" },
                        { wort: "ferne_naehe", richtung: "≥", wert: 0.8, wortlaut: "Ferne = Nähe ≥ 0,8" },
                    ],
                    umfang: { verlangt: 2, einheit: "km Sicht", wortlaut: "2 km", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "t_t_soll_min", richtung: "≥", wert: 0.86, wortlaut: "T/T_soll 0,86–1,08, Restkontrast ≤ 1,3 % am Rand" },
                        { wort: "t_t_soll_max", richtung: "≤", wert: 1.08, wortlaut: "T/T_soll 0,86–1,08, Restkontrast ≤ 1,3 % am Rand" },
                        { wort: "restkontrast_rand_pct", richtung: "≤", wert: 1.3, wortlaut: "T/T_soll 0,86–1,08, Restkontrast ≤ 1,3 % am Rand" },
                        { wort: "ferne_naehe", richtung: "≥", wert: 0.8, wortlaut: "Ferne = Nähe für Relief ≥ 0,8" },
                    ],
                    umfang: { verlangt: 8, einheit: "km Sicht", wortlaut: "8 km", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "ferne_naehe_anteil", richtung: "≥", wert: 0.9, wortlaut: "Ferne = Nähe ≥ 0,8 für Wald- und Stadtziele aus 25 km in 100 Saaten (Anteil ≥ 0,9)" }],
                    umfang: { verlangt: 25, einheit: "km Sicht", wortlaut: "25 km", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "wetter_anteil", richtung: "≥", wert: 0.9, wortlaut: "Anteil von 100 Saaten, in denen das ferne Wetter bei Ankunft dort herrscht ≥ 0,9" },
                        { wort: "afc_pct", richtung: "≤", wert: 60, wortlaut: "2AFC Fernbild gegen Foto ≤ 60 %" },
                    ],
                    umfang: { verlangt: 100, einheit: "km Sicht", wortlaut: "100 km", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "horizont_abw_grad", richtung: "≤", wert: 0.05, wortlaut: "Horizontabsenkung ±0,05° gegen Kugel + Standard-Refraktion" },
                        { wort: "ferne_naehe", richtung: "≥", wert: 0.8, wortlaut: "Ferne = Nähe ≥ 0,8 für einen 500-km-Gipfel" },
                    ],
                    umfang: { verlangt: 500, einheit: "km Sicht", wortlaut: "500 km", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "ferne_naehe", richtung: "≥", wert: 0.8, wortlaut: "Ferne = Nähe vom Orbit auf 20 Zufalls-Landepunkte ≥ 0,8" },
                        { wort: "ks", richtung: "≤", wert: 0.1, wortlaut: "Blue-/Black-Marble-Statistik KS ≤ 0,1" },
                    ],
                },
                8: {
                    soll: [
                        { wort: "ferne_naehe", richtung: "≥", wert: 0.8, wortlaut: "Ferne = Nähe Fernrohr-Bild ↔ Ankunft ≥ 0,8" },
                        { wort: "phase_abw_min", richtung: "≤", wert: 1, wortlaut: "Phase und Finsternis ±1 min gegen Himmelsmechanik der Saat" },
                    ],
                },
                9: {
                    soll: [{ wort: "sternlage_abw_grad", richtung: "≤", wert: 0.1, wortlaut: "Lage der 500 hellsten Sterne ±0,1°" }],
                    umfang: { verlangt: 500, einheit: "Sterne mit Ort in der Galaxie (nicht auf der Kuppel)", wortlaut: "Lage der 500 hellsten Sterne ±0,1°", feld: "richter" },
                },
            },
            lauf: async function ferneLauf(H, P, L) {
                // DIE ZÄHLUNG (billig, ein Ruf): Sichtweite, Saat, Sterne auf der Kuppel ↔ im Raum
                const z = await L.ev(
                    `const st = r.state, A = r.constructor, fp = st.feldPass;
                    const feld = !!(fp && fp.mesh && fp.mesh.visible);
                    const far = st.camera ? st.camera.far : 0;
                    const sichtM = Math.max(far, feld ? A.FELD_PASS.rMaxM : 0);
                    const sf = st.starField;
                    let n = 0, raum = 0;
                    if (sf) {
                        const a = sf.instanceMatrix.array;
                        n = sf.count;
                        const R = [];
                        for (let i = 0; i < n; i++) R.push(Math.hypot(a[i * 16 + 12], a[i * 16 + 13], a[i * 16 + 14]));
                        const m = R.slice().sort((x, y) => x - y)[n >> 1];
                        raum = R.filter((x) => Math.abs(x - m) > 1).length;
                    }
                    return { sichtM, feld, far, saat: st.worldMeta && st.worldMeta.seed, sterne: n, sterneRaum: raum, sternfeld: !!sf };`,
                    30
                );
                L.zeile("Ferne der Sitzung: " + JSON.stringify(z));
                const km = z.sichtM / 1000;
                const sichtWas = "die Welt zeichnet bis " + km.toFixed(1) + " km (" + (z.feld ? "Feld-Pass FELD_PASS.rMaxM, stamm/bild-sicht.js:3907" : "camera.far " + z.far + " m, der Feld-Pass ungemalt") + ")";
                const FN =
                    "Ferne = Nähe (Fernbild gegen verkleinerte Nahaufnahme nach Abzug der Luft, SSIM ≥ 0,8, ΔE ≤ 5): kein Leser — nahFernSicht (scripts/lib/licht-linsen.cjs:1281) vergleicht die Albedo nah/fern orthogonal von oben, kein SSIM des Blicks";
                const stufe = (nr, fehlt) =>
                    L.je(nr, async () => {
                        if (km < P.sprossen[nr].umfang.verlangt) return L.umfang(nr, km, sichtWas);
                        L.leser(nr, fehlt, km);
                    });
                // S1 ÜBER DEN FÄCHER: je Wort der Wetter-Tabelle die Luft, die das Spiel dem Knoten gibt (FERNE_AN); die Mutante (ein Feld
                // ohne Dunst und Regen) muss weiter sehen als jedes Wetter mit Dunst. T(0,2 km) je Kanal rechnet nur der Knoten selbst —
                // der Richter rechnet ihn nicht nach: dort bleibt der Leser beim Namen, die Eingänge stehen gemessen daneben.
                await L.je(1, async () => {
                    if (km < P.sprossen[1].umfang.verlangt) return L.umfang(1, km, sichtWas);
                    const worte = await L.ev("return Object.keys(r.constructor.WEATHER_FIELD || {});", 10);
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.FERNE_AN, export: "stamm/bild-himmel.js:2473 _luftBeta + :2492 _luftSpektrum", leser: "stamm/bild-himmel.js:2665 _dayNightApplyLuft → :2543 faktor (TSL)" },
                        adressen: { dazu: worte.map((wetter) => ({ wetter })).concat([{ wetter: "ohne-dunst", feld: { fog: 0, rain: 0 }, mutante: true }]) },
                        ms: Math.max(2000, Math.floor((L.rest() - 30) * 1000)),
                        masse: {
                            worte: { wie: "anzahl", nur: (a) => !a.mutante },
                            sichtMin: { wie: "min", feld: "sicht_m", nur: (a) => !a.mutante },
                            sichtMax: { wie: "max", feld: "sicht_m", nur: (a) => !a.mutante },
                            mutante: { wie: "max", feld: "sicht_m", nur: "mutante" },
                            je: { wie: (v, aus) => aus.map((x) => x.a.wetter + " " + (x.w.sicht_m / 1000).toFixed(2) + " km (" + x.w.rot + "/" + x.w.gruen + "/" + x.w.blau + ")").join(", "), nur: (a) => !a.mutante },
                        },
                        schlecht: { feld: "sicht_m", richtung: "min" },
                        pose: (a) => "die Wiese, Ego, Wetter " + a.wetter + ", ein Ziel in 0,2 km gegen den Himmel",
                        ungemessen: ["T/T_soll je Kanal in 0,2 km: kein CPU-Leser des Knotens `faktor` (stamm/bild-himmel.js:2543)", "Ferne = Nähe an 12 Posen: ungemessen bis zum Gerät"],
                    });
                    L.zeile("ferne S1: " + R.akte.slice(0, 500));
                    const w = R.werte;
                    if (!w.worte) return L.leser(1, "die Luft je Wetter: " + (R.fehlt || "kein Wetter gemessen") + " · " + R.akte, km);
                    if (!(w.mutante > w.sichtMax)) throw new Error("die Mutante ohne Dunst sieht " + w.mutante + " m, nicht weiter als das klarste Wetter (" + w.sichtMax + " m) — das Gesetz der Luft trennt nicht");
                    L.leser(
                        1,
                        "T/T_soll je Kanal gegen Koschmieder in 0,2 km: kein CPU-Leser der Durchlässigkeit — der Knoten `faktor` (stamm/bild-himmel.js:2543) rechnet T(d) nur in TSL, kein Export (Auge, Punkt, Wetter) → T je Kanal; die Eingänge an " + w.worte +
                            " Wettern: Sicht und Extinktion rot/grün/blau je β — " + w.je + "; " + FN + " · " + R.akte,
                        km
                    );
                });
                await stufe(2, FN + "; der Gang auf ein Ziel aus 2 km mit der Leuchtdichte im Zielfenster: kein Leser (/bild, scripts/werkbank.cjs:2110, schießt stehend)");
                await stufe(3, FN + "; T/T_soll und Restkontrast am Rand von 8 km: luftTiefe (scripts/lib/licht-linsen.cjs:2364) misst den Blick vom Hügel, nicht den Rand");
                await stufe(4, FN + "; 100 Saaten verlangt, die Sitzung hält EINE (" + z.saat + ") — kein Leser wechselt die Saat in der Welt der Sitzung");
                await stufe(5, "das Wetter der Ferne bei Ankunft und 2AFC gegen Foto: kein Leser (kein Flug, kein Fotosatz im Baum)");
                await stufe(6, "Horizontabsenkung gegen Kugel + Refraktion: kein Leser — das Gelände ist eben (stamm/gelaende-fern.js:2360 FERN_RING)");
                await L.je(7, async () =>
                    L.leser(
                        7,
                        "Umfang nicht erzeugbar (der Umfang „Planet: Boden → Orbit ohne Ladebild“ trägt keine Zahl): " + sichtWas + ", das Gelände ist eben (FERN_RING, stamm/gelaende-fern.js:2360) — kein Orbit, kein Landepunkt von oben, kein Leser Ferne = Nähe"
                    )
                );
                await L.je(8, async () =>
                    L.leser(
                        8,
                        "Umfang nicht erzeugbar (der Umfang „Sonnensystem“ trägt keine Zahl): kein Himmelskörper ist eine bereisbare Welt — die Wandelsterne sind Punkte des Sternfelds (stamm/bild-himmel.js:368), Reisen gehen durch Tore (stamm/netz-portal.js:562); Phase: der Mond steht stets der Sonne gegenüber (welt-licht.js:720)"
                    )
                );
                await L.je(9, async () => {
                    if (!z.sternfeld) throw new Error("das Sternfeld ist nicht gebaut (state.starField null, stamm/bild-himmel.js:471)");
                    if (z.sterneRaum >= 500) return L.leser(9, "Lage der 500 hellsten Sterne gegen die Galaxie-Ansicht: kein Leser", z.sterneRaum);
                    L.umfang(9, z.sterneRaum, "die " + z.sterne + " Sterne liegen alle auf der Himmelskuppel (Instanz-Matrizen, stamm/bild-himmel.js:453), keiner hat einen Ort in einer Galaxie");
                });
                L.preisPose("gipfel-blick", "ego");
            },
        })
    );

    // ─────────── erleben.bild.nacht — Nacht: Lichter, die werfen ───────────
    // An der dichtesten Pose (stadt-voll, Third) zählt das Programm die Leuchtquellen, die die Welt selbst setzt: das Verzeichnis „licht“
    // (`_blockerMit`, stamm/gelaende-kollision.js:1193) mit Emitter-Datum (`_lichtDatum`, stamm/dirigent-kern.js:1834), dazu die
    // glühende Lava (`_tatIndex().lava`, stamm/feld-leben.js:2648) — je Sprosse gegen 1 · 10² · 10³ … 10⁹. Unter dem Umfang urteilt
    // Umfang; trägt die Welt ihn, fehlt der Leser des Bilds (Fenster je Uhr, Fotosätze).
    // DIE LESER VON S1 UND S2 (pm-nacht-licht, 21.11.): an der dichtesten Pose die Nacht-Linse des Spiels (`nachtSicht`,
    // scripts/lib/licht-linsen.cjs — der Bodenfleck je sichtbarer Quelle in 50 m, die Kelvin-Farbe je Leuchte; `nachtKelvin` die EINE
    // Regel der Gasse, dieselbe wie gate:nacht-licht:echt), dann an derselben Pose der Teil schatten.K5 der NEUN-Seite
    // (g3.js `neunSeite`, mit denselben Maßen `neunC` und derselben Gültigkeit `k5Gilt`): der Pfosten 2 m neben dem nächsten Feuer,
    // das Auge lotrecht darüber. Fehlt die Linse am SHA, fehlt der Leser — beim Namen.
    // Die Seite der NEUN (43 000 Zeichen) passt nie ins argv (ENAMETOOLONG): die Probe lädt sie aus g3.js wie `neunProbe` und prüft ihren
    // Abdruck gegen den der Station (ein geänderter Teil ändert die Station). Der Anker steht genau einmal, sonst laut beim Laden.
    const NEUN = require("./g3.js");
    const K5_ANKER = "const teil = async (name, fn) => {";
    const neunNur = (s, anker) => {
        const n = s.split(anker).length - 1;
        if (n !== 1) throw new Error("erleben.bild.nacht: der Anker „" + anker + "“ steht " + n + "× in der NEUN-Seite (g3.js neunSeite), nie genau einmal");
        // der Teil, den C.nur nennt, und nur er: die übrigen Teile der NEUN kosten an dieser Pose nichts
        return s.replace(anker, anker + " if (C.nur && !C.nur.includes(name)) return;");
    };
    const NEUN_NUR_ABDRUCK = require("crypto").createHash("sha1").update(neunNur(String(NEUN.neunSeite), K5_ANKER)).digest("hex").slice(0, 16);
    LEITERN.push(
        leiter({
            leiter: "erleben.bild.nacht",
            sek: 60,
            seite: { NEUN_NUR: String(neunNur), K5_ANKER: JSON.stringify(K5_ANKER), NEUN_ABDRUCK: JSON.stringify(NEUN_NUR_ABDRUCK), NEUN_C: JSON.stringify(NEUN.neunC), K5_GILT: String(NEUN.k5Gilt) },
            pfad: ["stamm/dirigent-kern.js", "stamm/gelaende-kollision.js", "stamm/stoff-material.js", "stamm/feld-leben.js", "welt-licht.js", "scripts/lib/licht-linsen.cjs", "spec/profiband/haushalt.json"],
            welt: [{ wort: "quellen", ab: 1, was: "Leuchtquellen der Welt, gezählt im Verzeichnis „licht“" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "schatten_kontrast", richtung: "≥", wert: 3, wortlaut: "Schatten-Kontrast ≥ 3:1 an einem Pfosten 2 m vom Feuer" },
                        { wort: "kelvin_abw", richtung: "≤", wert: 200, wortlaut: "Gasse in der Kelvin-Farbe ±200 K" },
                    ],
                    umfang: { verlangt: 1, einheit: "Leuchtquellen", wortlaut: "1 Quelle", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "bodenfleck_anteil", richtung: "≥", wert: 0.9, wortlaut: "Anteil sichtbarer Quellen in 50 m mit Bodenfleck ≥ 1 EV über Umgebung ≥ 0,9" },
                        { wort: "gasse_dev_median", richtung: "≤", wert: 0.5, wortlaut: "Gassen-Histogramm gegen Fotosatz ΔEV-Median ≤ 0,5" },
                    ],
                    umfang: { verlangt: 100, einheit: "Leuchtquellen der Welt", wortlaut: "10²: Dorf bei Nacht", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "fenster_abw", richtung: "≤", wert: 0.1, wortlaut: "Anteil beleuchteter Fenster 20 → 4 Uhr gegen gemessene Nachtgang-Kurven ±0,1" },
                        { wort: "strasse_lx_min", richtung: "≥", wert: 5, wortlaut: "Straße 5–30 lx" },
                        { wort: "strasse_lx_max", richtung: "≤", wert: 30, wortlaut: "Straße 5–30 lx" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Leuchtquellen der Welt", wortlaut: "10³: Kleinstadt", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "histogramm_dev", richtung: "≤", wert: 0.5, wortlaut: "Leuchtdichte-Histogramm und Spiegelstreifen gegen Fotosatz nasser Nachtstraßen ΔEV ≤ 0,5" },
                        { wort: "afc_pct", richtung: "≤", wert: 65, wortlaut: "2AFC ≤ 65 %" },
                    ],
                    umfang: { verlangt: 10000, einheit: "Leuchtquellen der Welt", wortlaut: "10⁴: Viertel mit Verkehr", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "walker_abw_pct", richtung: "≤", wert: 30, wortlaut: "Himmelshelligkeit am Stadtrand gegen Walker's Law ±30 %, Bortle ±1" },
                        { wort: "bortle_abw", richtung: "≤", wert: 1, wortlaut: "Himmelshelligkeit am Stadtrand gegen Walker's Law ±30 %, Bortle ±1" },
                    ],
                    umfang: { verlangt: 1e5, einheit: "Leuchtquellen der Welt", wortlaut: "10⁵: Großstadt aus 300 m", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "ks", richtung: "≤", wert: 0.1, wortlaut: "Radianz je km² gegen VIIRS-Ausschnitte gleicher Dichte KS ≤ 0,1" },
                        { wort: "ferne_naehe", richtung: "≥", wert: 0.8, wortlaut: "Ferne = Nähe beim Sinkflug ≥ 0,8" },
                    ],
                    umfang: { verlangt: 1e7, einheit: "Leuchtquellen der Welt", wortlaut: "10⁷: Tokio-Maß aus dem Flugzeug", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "anteil", richtung: "≥", wert: 0.8, wortlaut: "100 Saaten mit Stadt und Vulkan: Nachtbild-Statistik passt zur Black-Marble-Statistik extrapolierter Dichte ≥ 0,8" }],
                    umfang: { verlangt: 1e8, einheit: "Leuchtquellen der Welt", wortlaut: "10⁸: Megaregion + Vulkanglut in einem Bild vom Gipfel", feld: "umfang" },
                },
                8: {
                    soll: [
                        { wort: "ks", richtung: "≤", wert: 0.1, wortlaut: "Nachtlicht-Statistik je Epoche gegen DMSP/VIIRS-Archiv 1992 → heute KS ≤ 0,1" },
                        { wort: "bortle_abw", richtung: "≤", wert: 1, wortlaut: "Bortle eines Orts folgt seiner Epoche ±1" },
                    ],
                    umfang: { verlangt: 1e9, einheit: "Leuchtquellen der Welt", wortlaut: "10⁹–10¹⁰: Nachtseite eines Planeten über Epochen", feld: "umfang" },
                },
            },
            lauf: async function nachtLauf(H, P, L) {
                const ort = await L.ort("stadt-voll", "third").then(
                    () => null,
                    (e) => String((e && e.message) || e).split("\n")[0]
                );
                L.preisPose("stadt-voll", "third");
                if (ort) {
                    // ohne die dichteste Pose wäre die Zählung zu klein und „Umfang nicht erzeugbar“ gelogen: jede Sprosse wirft beim Ort
                    L.zeile("Nacht: stadt-voll nicht gestellt — " + ort);
                    for (const nr of [1, 2, 3, 4, 5, 6, 7, 8])
                        await L.je(nr, async () => {
                            throw new Error("stadt-voll third nicht gestellt: " + ort);
                        });
                    return;
                }
                const z = await L.ev(
                    `const st = r.state, A = r.constructor, p = st.playerMesh.position;
                    let welt = 0, nah = 0;
                    const arten = {};
                    for (const e of r._blockerMit("licht")) {
                        if (!r._lichtDatum(e)) continue;
                        welt++;
                        arten[e.type] = (arten[e.type] || 0) + 1;
                        const q = e.position;
                        if (q && Math.hypot(q.x - p.x, q.z - p.z) <= 50) nah++;
                    }
                    const lava = r._tatIndex().lava.length;
                    return { welt, nah, lava, plaetze: A.LICHT_POOL.plaetze, arten: Object.entries(arten).sort((a, b) => b[1] - a[1]).slice(0, 4), ort: [Math.round(p.x), Math.round(p.z)] };`,
                    30
                );
                L.zeile("Nacht der Sitzung (stadt-voll third): " + JSON.stringify(z));
                const n = z.welt + z.lava;
                const zaehlWas = "die Welt setzt " + n + " Leuchtquellen (" + z.welt + " im Verzeichnis „licht“, stamm/gelaende-kollision.js:1193, dazu " + z.lava + " glühende Lava; die Fenster glühen über EIN Uniform je Licht-Art, atmoUniforms.lichtGlut stamm/dirigent-kern.js:1606, und zählen nicht als Quelle)";
                // DIE NACHT-LINSE DES SPIELS an der Gasse (stadt-voll third): Bodenfleck und Kelvin für S1 und S2, EIN Lauf
                const LLd = require("path").resolve("scripts/lib/licht-linsen.cjs");
                const LL = require("fs").existsSync(LLd) ? require(LLd) : {};
                const linse = typeof LL.nachtSicht === "function" && typeof LL.nachtKelvin === "function";
                let nacht = null;
                if (linse && n >= 1) {
                    nacht = await L.ev("return await (" + LL.nachtSicht + ")({});", Math.max(20, L.rest() - 20));
                    L.zeile("Nacht-Linse (stadt-voll third): " + JSON.stringify({ quellen: nacht.quellen, sichtbar: nacht.sichtbar, gut: nacht.gut, anteil: nacht.anteil, ohneKarte: nacht.ohneKarte, kelvin: nacht.kelvin }).slice(0, 900));
                }
                const ohneLinse = "kein Leser am SHA — nachtSicht und nachtKelvin fehlen in scripts/lib/licht-linsen.cjs (gate:nacht-licht:echt)";
                await L.je(2, async () => {
                    if (n < P.sprossen[2].umfang.verlangt) return L.umfang(2, n, zaehlWas);
                    if (!linse) return L.leser(2, "Bodenfleck ≥ 1 EV je sichtbarer Quelle in 50 m: " + ohneLinse, n);
                    if (!(nacht.sichtbar > 0)) throw new Error("die Nacht-Linse sah an stadt-voll third keine Quelle (" + nacht.quellen + " in 50 m)");
                    L.gemessen(2, { bodenfleck_anteil: nacht.anteil, gasse_dev_median: null }, {
                        erzeugt: n,
                        welt: { quellen: n },
                        taeter: "Gassen-Histogramm gegen Fotosatz: kein Fotosatz nächtlicher Gassen im Baum, kein Leser des Histogramms" + (nacht.anteil >= 0.9 ? "" : " · Bodenfleck " + nacht.gut + " von " + nacht.sichtbar),
                        beleg: { sichtbar: nacht.sichtbar, gut: nacht.gut, ohneKarte: nacht.ohneKarte, quellen50: nacht.quellen },
                    });
                });
                await L.je(1, async () => {
                    if (n < P.sprossen[1].umfang.verlangt) return L.umfang(1, n, zaehlWas);
                    if (!linse) return L.leser(1, "Kelvin der Gasse: " + ohneLinse, n);
                    const { kMed, kel } = LL.nachtKelvin(nacht);
                    // DER PFOSTEN an der Gasse: der Teil schatten.K5 allein (die nächste Leuchtquelle des Gesetzes am Spieler, ihr Platz im Pool
                    // trägt den Wurf), im Fenster der NEUN, danach das Fenster der Sitzung — die Leiter hält 60 s, ein Ortswechsel kostet 30
                    const C = Object.assign(H.seite.NEUN_C, { teile: [], nur: ["schatten.K5"], rest: Math.max(5, Math.min(25, L.rest() - 20)) });
                    let k5;
                    try {
                        await L.wb("/fenster", { w: C.fenster[0], h: C.fenster[1] }, 30);
                        const pf = require("path");
                        const G = require(pf.join(pf.dirname(String(process.env.PUNKTE_MASCHINE || "")), "stationen", "g3.js"));
                        const seite = H.seite.NEUN_NUR(String(G.neunSeite), H.seite.K5_ANKER);
                        const ist = require("crypto").createHash("sha1").update(seite).digest("hex").slice(0, 16);
                        if (ist !== H.seite.NEUN_ABDRUCK) throw new Error("NEUN-BRUCH die Seite in g3.js trägt den Abdruck " + ist + ", die Station " + H.seite.NEUN_ABDRUCK);
                        const a = await L.ev("return await (" + seite + ")(r, T, " + JSON.stringify(C) + ");", C.rest + 30);
                        k5 = (a && a.teile && a.teile["schatten.K5"]) || { fehler: "der Teil kam nicht dran (" + JSON.stringify((a && a.ausgelassen) || []) + ")" };
                    } finally {
                        await L.wb("/fenster", { w: 1920, h: 1080 }, 30).catch(() => {});
                    }
                    L.zeile("Pfosten (schatten.K5 an stadt-voll third): " + JSON.stringify(k5));
                    const gilt = !k5.fehler && H.seite.K5_GILT(k5);
                    const taeter = [];
                    if (k5.fehler) taeter.push("der Pfosten-Teil brach: " + k5.fehler);
                    else if (!gilt) taeter.push("das Maß am Pfosten gilt nicht (im Blick " + k5.pfosten + ", im Pool " + k5.imPool + ", ohne Pfosten " + k5.kontrolle + ", Punkte " + k5.n + ")");
                    if (!kel.length) taeter.push("keine Leuchte der Gasse mit Farbe gesehen");
                    L.gemessen(1, { schatten_kontrast: gilt ? k5.kontrast : null, kelvin_abw: kMed }, {
                        erzeugt: n,
                        welt: { quellen: n },
                        taeter: taeter.join(" · ") || null,
                        beleg: { pfosten: k5, kelvin: kel, gasse: "stadt-voll third" },
                    });
                });
                const FEHLT = {
                    3: "Anteil beleuchteter Fenster je Uhr: kein Leser — die Fenster glühen nach EINEM Zeitplan je Licht-Art (stamm/dirigent-kern.js:1882 _lichtZeitplan), nicht nach ihren Bewohnern; Straße in lx: kein geeichtes k",
                    4: "Leuchtdichte-Histogramm nasser Nachtstraßen gegen Fotosatz: kein Leser, kein Fotosatz im Baum (scripts/lib/licht-linsen.cjs:743)",
                    5: "Himmelshelligkeit am Stadtrand gegen Walker's Law: kein Leser — die Himmels-Sicht (welt-licht.js:989 himmelSicht) trägt keine Lichtglocke der Stadt",
                    6: "Radianz je km² gegen VIIRS: kein Leser, kein VIIRS-Ausschnitt im Baum",
                    7: "Nachtbild-Statistik gegen Black Marble: kein Leser; 100 Saaten verlangt, die Sitzung hält eine",
                    8: "Nachtlicht je Epoche gegen DMSP/VIIRS: kein Leser; die Lichter tragen keine Epoche (stamm/dirigent-kern.js:1882)",
                };
                for (const nr of [3, 4, 5, 6, 7, 8])
                    await L.je(nr, async () => {
                        if (n < P.sprossen[nr].umfang.verlangt) return L.umfang(nr, n, zaehlWas);
                        L.leser(nr, FEHLT[nr], n);
                    });
            },
        })
    );

    // ─────────── erleben.bild.flaeche — Fläche im wahren Licht ───────────
    // S1 trägt bestehend g3.js (karte2.erleben.bild.flaeche#1). S2 ist ein Bildpaar: das Dorf im Regen an fester Pose (Third, Uhr 0,35) gegen
    // ein Foto, sobald die gezählte Dorffläche 10⁴ m² trägt. Gezählt in der Welt: die Fläche der größten Siedlung (Hüllrechteck der Slots
    // ihres Plans, `_bewohnerSiedlungen`, stamm/siedlung-bewohner.js:277), die Zeilen des Stoff-Gesetzes (schmiede STOFF_GESETZ.ZEILEN, schmiede-core.js:2860),
    // die glühende Lava (stamm/feld-leben.js:2648). Tageslichtquotient, Glutfarbe gegen Planck und Fotosätze haben keinen Leser.
    LEITERN.push(
        leiter({
            leiter: "erleben.bild.flaeche",
            sek: 50,
            mutiert: true,
            pfad: ["stamm/siedlung-bewohner.js", "stamm/bild-himmel.js", "stamm/feld-leben.js", "stamm/dirigent-kern.js", "stamm/speicher-welten.js", "stamm/daten.js", "schmiede-core.js", "welt-licht.js", "scripts/werkbank.cjs", "scripts/lib/licht-linsen.cjs", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Größe (Fläche, Stoffe, Glut)" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [
                        { wort: "flimmer_pct", richtung: "≤", wert: 1, wortlaut: "Flimmer-Anteil der Schattenkante ≤ 1 % im Gang" },
                        { wort: "wand_abw_pct", richtung: "≤", wert: 20, wortlaut: "Wand unten/Sonnenseite ±20 % gegen Messung" },
                    ],
                    auge: { pose: "dorf third · Uhr 0,35 · Wetter rainy (Nässe der Bühne)", vorbild: "Foto eines Dorfplatzes bei Regen im Vormittags-Streiflicht: Glanz auf nassem Pflaster und Holz" },
                    umfang: { verlangt: 1e4, einheit: "m² Dorffläche", wortlaut: "Dorf, 10⁴ m²", feld: "umfang" },
                },
                3: { soll: [{ wort: "tlq_abw_pct", richtung: "≤", wert: 30, wortlaut: "Tageslichtquotient im Bild gegen gemessene Werte gleicher Fenstergröße (1–5 %) ±30 %" }] },
                4: {
                    soll: [
                        { wort: "fassade_abw_pct", richtung: "≤", wert: 20, wortlaut: "Schatten-/Sonnenfassade ±20 % gegen Messwerte" },
                        { wort: "spiegel_px", richtung: "≤", wert: 2, wortlaut: "Spiegelbild der Gegenfassade ±2 px" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "m² Stadtfläche", wortlaut: "Stadtschlucht, 10⁶ m²", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "anteil", richtung: "≥", wert: 0.9, wortlaut: "100 Zufallsstoffe unter Normlicht: Albedo und Glanz im Band gemessener Datensätze, ΔE ≤ 5, Anteil ≥ 0,9" },
                        { wort: "de", richtung: "≤", wert: 5, wortlaut: "100 Zufallsstoffe unter Normlicht: Albedo und Glanz im Band gemessener Datensätze, ΔE ≤ 5, Anteil ≥ 0,9" },
                    ],
                    umfang: { verlangt: 100, einheit: "Stoffe des Gesetzes", wortlaut: "100 Zufallsstoffe unter Normlicht", feld: "richter" },
                },
                6: {
                    soll: [
                        { wort: "glut_de", richtung: "≤", wert: 5, wortlaut: "Glutfarbe gegen Schwarzkörper der Temperatur des Geologie-Gesetzes ΔE ≤ 5" },
                        { wort: "wolke_de", richtung: "≤", wert: 10, wortlaut: "Wolkenunterseite gegen Fotos ΔE ≤ 10" },
                    ],
                },
                7: { soll: [{ wort: "anteil", richtung: "≥", wert: 0.9, wortlaut: "288 Zufallsposen (12 Orte × 24 h): Bildstatistik im Band des Fotosatzes gleicher Szene ≥ 0,9" }] },
                8: { soll: [{ wort: "anteil", richtung: "≥", wert: 0.95, wortlaut: "Zufalls-Planetenstoffe mit Albedo und Glanz im physikalisch möglichen Band ≥ 0,95" }] },
            },
            lauf: async function flaecheLauf(H, P, L) {
                const z = await L.ev(
                    `const st = r.state;
                    let best = null, siedlungen = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        const sl = (S.plan && S.plan.slots) || [];
                        siedlungen++;
                        let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
                        for (const s of sl) {
                            if (!Number.isFinite(s.x) || !Number.isFinite(s.z)) continue;
                            x0 = Math.min(x0, s.x); x1 = Math.max(x1, s.x); z0 = Math.min(z0, s.z); z1 = Math.max(z1, s.z);
                        }
                        const f = sl.length > 1 && x1 > x0 && z1 > z0 ? (x1 - x0) * (z1 - z0) : 0;
                        if (!best || f > best.f) best = { n: sl.length, f: Math.round(f), key: S.key };
                    }
                    const flaeche = best ? best.f : 0, bauten = best ? best.n : 0;
                    const SG = globalThis.__schmiedeCore && globalThis.__schmiedeCore.STOFF_GESETZ;
                    const stoffe = SG && SG.ZEILEN ? Object.keys(SG.ZEILEN).length : null;
                    const gesetz = Object.keys(r.constructor._weltGesetz(st.worldMeta));
                    return { siedlung: best, siedlungen, flaeche, bauten, stoffe, lava: r._tatIndex().lava.length, welten: Object.keys(r.constructor.ULTIVERSUM).length, gesetz };`,
                    30
                );
                L.zeile("Fläche der Sitzung: " + JSON.stringify(z));
                await L.je(3, async () =>
                    L.leser(3, "Tageslichtquotient (E innen ÷ E außen hinter einem Fenster bekannter Größe) im Bild: kein Leser — der Raum am Auge steuert nur die Blende (stamm/bild-himmel.js:1968 _raumBlendeTakt), keine Messung der Beleuchtungsstärke im Raum")
                );
                await L.je(4, async () => {
                    if (!z.siedlung) throw new Error("keine Siedlung in der Welt der Sitzung (_bewohnerSiedlungen leer)");
                    const was = "die größte von " + z.siedlungen + " Siedlungen deckt mit " + z.bauten + " Plätzen " + z.flaeche + " m² (Hüllrechteck der Slots ihres Plans, stamm/siedlung-bewohner.js:277)";
                    if (z.flaeche < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.flaeche, was);
                    L.leser(4, "Schatten-/Sonnenfassade gegen Messwerte und Spiegelbild der Gegenfassade: kein Leser (/bild, scripts/werkbank.cjs:2110, urteilt die Abnahme, keinen Fassaden-Kontrast)", z.flaeche);
                });
                await L.je(5, async () => {
                    if (!(z.stoffe >= 0)) throw new Error("schmiede STOFF_GESETZ.ZEILEN nicht geladen");
                    if (z.stoffe < 100) return L.umfang(5, z.stoffe, "das Stoff-Gesetz trägt " + z.stoffe + " Zeilen (schmiede STOFF_GESETZ.ZEILEN, schmiede-core.js:2860)");
                    L.leser(5, "Albedo und Glanz je Stoff unter Normlicht gegen gemessene Datensätze: kein Leser", z.stoffe);
                });
                await L.je(6, async () =>
                    L.leser(
                        6,
                        "Glutfarbe gegen den Schwarzkörper ihrer Temperatur: kein Leser — die Lava glüht über _lavaZustand (stamm/feld-leben.js:2482) und leuchtet im Pool (stamm/dirigent-kern.js:1816), kein Leser misst ihre Farbe im Bild gegen Planck (in der Sitzung " + z.lava + " Lava-Taten); Wolkenunterseite gegen Fotos: kein Fotosatz"
                    )
                );
                await L.je(7, async () =>
                    L.leser(7, "Bildstatistik je Pose gegen den Fotosatz gleicher Szene: kein Leser, kein Fotosatz im Baum — tagKurve (scripts/lib/licht-linsen.cjs:1078) schießt je Uhr und urteilt gegen spec/farbe/tag-ref.json, nie gegen Fotos")
                );
                await L.je(8, async () =>
                    L.leser(
                        8,
                        "Umfang nicht erzeugbar (der Umfang „jeder Planet“ trägt keine Zahl): " + z.welten + " Welten im Ultiversum (stamm/daten.js:84), ihr Gesetz trägt nur " + z.gesetz.join(", ") + " (stamm/speicher-welten.js:88) — keine eigenen Stoffe; EINE Sonne (welt-licht.js:711), kein Doppelschatten"
                    )
                );
                // S2 · das Bildpaar an fester Pose: Dorf, Third, Vormittag, Regen der Bühne
                await L.je(2, async () => {
                    if (!z.siedlung) throw new Error("keine Siedlung in der Welt der Sitzung (_bewohnerSiedlungen leer)");
                    if (z.flaeche < P.sprossen[2].umfang.verlangt)
                        return L.umfang(2, z.flaeche, "die größte von " + z.siedlungen + " Siedlungen deckt " + z.flaeche + " m² (Hüllrechteck der " + z.bauten + " Slots ihres Plans)");
                    await L.auge(2, { ort: "dorf", sicht: "third", b: { uhr: 0.35, wetter: "rainy" }, erzeugt: z.flaeche });
                });
                L.preisPose("dorf", "third");
            },
        })
    );

    // ─────────── erleben.bild.himmel — Luft, Tag und Himmel ───────────
    // S2 GEMESSEN: die Tag-Achse des Spiels im Ausgabe-Bild (`__tagKurve`, scripts/lib/licht-linsen.cjs:1078) an der Mess-Wiese, Ego, über
    // 24 Uhren (stündlich), REF wie tagKurveUrteil (scripts/lib/licht-linsen.cjs:1177): die Stufen der Szene gegen die Referenzkurve
    // spec/farbe/tag-ref.json (USNO-Beleuchtungsstärke durch die Kamera BELICHTUNG), max |Abweichung| ≤ 0,3 EV; Zeugen: 24 Uhren, die
    // Spanne der Sonnenhöhe. Die übrigen Achsen (Klarhimmel in cd/m², Wetter-Sicht je Wort, Breite × Tag, Aerosol, Zeitalter, Planet) leser.
    LEITERN.push(
        leiter({
            leiter: "erleben.bild.himmel",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/lib/licht-linsen.cjs", "spec/farbe/tag-ref.json", "spec/farbe/luft-referenz.json", "scripts/werkbank.cjs", "welt-licht.js", "stamm/bild-himmel.js", "stamm/feld-leben.js", "stamm/netz-portal.js", "stamm/daten.js", "schmiede-core.js", "spec/profiband/haushalt.json"],
            welt: [
                { wort: "uhren", ab: 24, was: "Uhren der Kurve im Ausgabe-Bild" },
                { wort: "sonne_spanne_grad", ab: 90, was: "Spanne der Sonnenhöhe über die Kurve (°)" },
            ],
            sprossen: {
                1: { soll: [{ wort: "himmel_ev_abw", richtung: "≤", wert: 0.3, wortlaut: "Himmels-Leuchtdichte gegen gemessenen Klarhimmel ±0,3 EV" }] },
                2: { soll: [{ wort: "ref_max_ev", richtung: "≤", wert: 0.3, wortlaut: "Belichtungskurve über 24 h gegen Referenzkurve, max. Abweichung ≤ 0,3 EV" }] },
                3: { soll: [{ wort: "sicht_abw_pct", richtung: "≤", wert: 15, wortlaut: "Sichtweite im Bild ±15 % zur gesetzten" }] },
                4: {
                    soll: [
                        { wort: "allsky_ev_abw", richtung: "≤", wert: 0.3, wortlaut: "Zufalls-(Breite, Tag, Uhr): All-Sky-Bild ±0,3 EV gegen Himmelsfoto-Datensätze, Anteil ≥ 0,9" },
                        { wort: "anteil", richtung: "≥", wert: 0.9, wortlaut: "Zufalls-(Breite, Tag, Uhr): All-Sky-Bild ±0,3 EV gegen Himmelsfoto-Datensätze, Anteil ≥ 0,9" },
                    ],
                },
                5: {
                    soll: [
                        { wort: "bogen_abw_grad", richtung: "≤", wert: 1, wortlaut: "Regenbogen 42° ±1°, Halo 22° ±1°" },
                        { wort: "abendrot_de", richtung: "≤", wert: 10, wortlaut: "Abendrot nach Ausbruch ΔE ≤ 10 gegen Beobachtung" },
                    ],
                },
                6: {
                    soll: [
                        { wort: "farbe_ev_abw", richtung: "≤", wert: 0.3, wortlaut: "Himmelsfarbe ±0,3 EV gegen Strahlungstransport-Referenz, Anteil von 100 Zeitpunkten ≥ 0,9" },
                        { wort: "anteil", richtung: "≥", wert: 0.9, wortlaut: "Himmelsfarbe ±0,3 EV gegen Strahlungstransport-Referenz, Anteil von 100 Zeitpunkten ≥ 0,9" },
                    ],
                },
                7: {
                    soll: [
                        { wort: "kanal_ev_abw", richtung: "≤", wert: 0.3, wortlaut: "Mars-Abend gegen Rover-Fotos ±0,3 EV je Kanal" },
                        { wort: "planeten_anteil", richtung: "≥", wert: 0.9, wortlaut: "Zufalls-Planeten gegen Referenz ±0,3 EV ≥ 0,9" },
                    ],
                },
            },
            lauf: async function himmelLauf(H, P, L) {
                const z = await L.ev(
                    `const A = r.constructor, SG = globalThis.__schmiedeCore && globalThis.__schmiedeCore.STOFF_GESETZ;
                    let bogen = null;
                    try { bogen = SG.bogenGrad(SG.zeile("wasser").n); } catch (e) { bogen = null; }
                    return { worte: Object.keys(A.WETTER_ZEILE || {}), bogen, welten: Object.keys(A.ULTIVERSUM) };`,
                    30
                );
                L.zeile("Himmel der Sitzung: " + JSON.stringify(z));
                await L.je(1, async () =>
                    L.leser(1, "Himmels-Leuchtdichte in cd/m² gegen den gemessenen Klarhimmel: kein Leser — die Bild-Maße tragen kein geeichtes k; die Tag-Achse (scripts/lib/licht-linsen.cjs:1078 tagKurve) liest die untere Bildhälfte, nicht den Himmel")
                );
                await L.je(3, async () =>
                    L.leser(
                        3,
                        "Sicht im Bild je Wetter-Wort (" + z.worte.join(", ") + ") gegen die gesetzte (stamm/bild-himmel.js:2280 _luftSichtM): der Leser luftTiefe/wetterLuftUrteil (scripts/lib/licht-linsen.cjs:2364/2690) kennt nur das Sturm-Soll (spec/farbe/luft-referenz.json sichtSturmM), Hügel-Lauf und Wetter-Zug (scripts/lib/licht-linsen.cjs:2660) tragen die 60 s der Leiter nicht"
                    )
                );
                await L.je(4, async () =>
                    L.leser(4, "Himmel je (Breite, Tag, Uhr): kein Leser — die Welt kennt die Breite (die Reise, stamm/feld-leben.js:1277), die Sonnenbahn liest sie nicht: welt-licht.js:711 sonnenRichtung(winkel) aus der Uhr allein, der Tag der Welt (stamm/bild-himmel.js:2738 worldMeta.tag) geht nicht ein; kein Himmelsfoto-Datensatz im Baum")
                );
                await L.je(5, async () =>
                    L.leser(
                        5,
                        "Regenbogen: das Gesetz des Bogens steht im Kern (schmiede-core.js:2945 STOFF_GESETZ.bogenGrad, Wasser " + (Number.isFinite(z.bogen) ? z.bogen.toFixed(1) + "°" : "—") + "), kein Leser des Himmels zeichnet ihn (welt-licht.js:989 himmelSicht: Rayleigh, Mie, Wolken); Halo 22°: keine Eiskristall-Optik; Abendrot nach Ausbruch: kein Leser gegen Beobachtung"
                    )
                );
                await L.je(6, async () =>
                    L.leser(6, "Himmelsfarbe je Zeitalter: kein Leser — die Reise in die Zeit (stamm/feld-leben.js:1277 zeitMa) erbt den Himmel der Heimat (stamm/netz-portal.js:701 himmel.rayleighTiefe), keine Strahlungstransport-Referenz im Baum")
                );
                await L.je(7, async () =>
                    L.leser(7, "Mars-Abend gegen Rover-Fotos je Kanal: kein Leser, kein Rover-Korpus im Baum — der Himmel der Fremdwelt steht im Gesetz (stamm/daten.js:84 ULTIVERSUM.ferne rayleighTiefe; Welten " + z.welten.join(", ") + ")")
                );
                // S2 · die Tag-Achse über 24 Uhren an der Mess-Wiese, Ego (die Kamera des Spiels, die Bühne der Werkbank)
                await L.je(2, async () => {
                    await L.ort("wiese", "ego");
                    if (L.rest() < 22) throw new Error("die Frist trägt die 24 Uhren nicht mehr (Rest " + Math.round(L.rest()) + " s)");
                    const uhren = Array.from({ length: 24 }, (_, i) => i / 24);
                    let m;
                    try {
                        m = await L.ev("return await __tagKurve(" + JSON.stringify({ uhren, png: false }) + ");", Math.max(10, Math.floor(L.rest()) - 4));
                    } finally {
                        await L.ev("r.setTimeOfDay(0.5, 'human'); return true;", 20).catch(() => null);
                    }
                    const R = require(require("path").resolve("spec/farbe/tag-ref.json")).zeilen;
                    const stufen = (h) => {
                        const i = R.findIndex((x) => x[0] <= h);
                        return i < 1 ? R[Math.max(i, 0)][2] : R[i][2] + ((R[i - 1][2] - R[i][2]) * (h - R[i][0])) / (R[i - 1][0] - R[i][0]);
                    };
                    const zeilen = (m && m.zeilen) || [];
                    const mittag = zeilen.find((x) => x.uhr === 0.5);
                    if (!mittag) throw new Error("die Kurve trägt keinen Mittag (" + zeilen.length + " Uhren)");
                    const ev = (a, b) => Math.log2(Math.max(a, 1e-9) / Math.max(b, 1e-9));
                    let max = 0, wo = zeilen[0];
                    for (const x of zeilen) {
                        const d = ev(x.X, mittag.X) - stufen(x.sonne) + stufen(mittag.sonne);
                        if (Math.abs(d) >= Math.abs(max)) (max = d), (wo = x);
                    }
                    const sonnen = zeilen.map((x) => x.sonne);
                    L.gemessen(
                        2,
                        { ref_max_ev: +Math.abs(max).toFixed(3) },
                        {
                            welt: { uhren: zeilen.length, sonne_spanne_grad: +(Math.max(...sonnen) - Math.min(...sonnen)).toFixed(2) },
                            taeter: "Uhr " + (+wo.uhr.toFixed(4)) + " (Sonne " + wo.sonne + "°) " + max.toFixed(2) + " EV neben der Referenz (spec/farbe/tag-ref.json)",
                            beleg: zeilen.map((x) => [+x.uhr.toFixed(4), x.sonne, x.X, x.frisch]),
                        }
                    );
                });
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── erleben.bild.auge — Das Auge: Belichtung, Dynamik, Ruhe ───────────
    // S1 trägt bestehend g3.js (karte2.erleben.bild.auge#1). S4 Blendung ist ein Bildpaar: Mess-Wiese, Ego, Uhr 0,30, der Blick waagrecht
    // in die Sonne (Gier aus `_sonnenRichtung`, stamm/bild-himmel.js:1383; Höhe ≈ 18° im Bildfeld) gegen ein Gegenlicht-Foto. S6 zählt die
    // Größenordnungen, die EIN Bild des Auges trägt (Fern- durch Nahgrenze der Kamera, Feld-Pass stamm/bild-sicht.js:3907). Höhle → Sonne,
    // HDR-Korpus und die zeitabgetastete Referenz haben keinen Leser.
    LEITERN.push(
        leiter({
            leiter: "erleben.bild.auge",
            sek: 50,
            mutiert: true,
            pfad: ["stamm/bild-himmel.js", "stamm/bild-sicht.js", "stamm/dirigent-kern.js", "stamm/koerper-bewegung.js", "scripts/werkbank.cjs", "scripts/lib/licht-linsen.cjs", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Größe der Kamera" }],
            bestehend: [1],
            sprossen: {
                2: { soll: [{ wort: "ausbrand_pct", richtung: "≤", wert: 2, wortlaut: "Höhle → Mittagssonne: ausgebrannte Fläche ≤ 2 % nach 1 s" }] },
                3: { soll: [{ wort: "geklippt_pct", richtung: "≤", wert: 2, wortlaut: "20 Szenen: geklippte Fläche ≤ 2 %, Tonwertumfang im Band kalibrierter HDR-Fotos" }] },
                4: {
                    soll: [{ wort: "afc_pct", richtung: "≤", wert: 65, wortlaut: "Panel-2AFC gegen Fotos gleicher Blendsituation ≤ 65 %" }],
                    auge: { pose: "wiese ego · Uhr 0,30 · Blick waagrecht in die Sonne (Höhe ≈ 18°)", vorbild: "Foto Gegenlicht über einer Wiese mit der Sonne ≈ 18° hoch im Bildfeld (Blendung, Streulicht, Hof)" },
                },
                5: { soll: [{ wort: "geister_pct", richtung: "≤", wert: 1, wortlaut: "Geister-Fläche gegen 16-fach zeitabgetastete Referenz ≤ 1 %" }] },
                6: {
                    soll: [{ wort: "ohne_bruch_anteil", richtung: "≥", wert: 0.9, wortlaut: "200 Zufalls-Kameraposen: Anteil ohne Bruch ≥ 0,9" }],
                    umfang: { verlangt: 10, einheit: "Größenordnungen, die EIN Bild des Auges trägt (Fern- durch Nahgrenze)", wortlaut: "dasselbe Auge über 10 Größenordnungen Höhe", feld: "tiefe" },
                },
            },
            lauf: async function augeLauf(H, P, L) {
                const z = await L.ev(
                    `const st = r.state, c = st.camera, A = r.constructor, fp = st.feldPass;
                    const feld = !!(fp && fp.mesh && fp.mesh.visible);
                    return { near: c.near, far: c.far, fern: Math.max(c.far, feld ? A.FELD_PASS.rMaxM : 0), feld, modus: st.cameraMode, fov: c.fov };`,
                    30
                );
                L.zeile("Auge der Sitzung: " + JSON.stringify(z));
                await L.je(2, async () =>
                    L.leser(2, "Höhle → Mittagssonne, ausgebrannte Fläche nach 1 s: kein Leser — der Himmel belichtet sofort (stamm/bild-himmel.js:1943 _belichtungAusLicht), nur die Blende des Raums gleitet (stamm/bild-himmel.js:1968 _raumBlendeTakt); kein Gang aus dem Dunkel ins Licht mit Schuss nach 1 s")
                );
                await L.je(3, async () =>
                    L.leser(3, "20 Szenen über 8 Dekaden: geklippte Fläche und Tonwertumfang gegen kalibrierte HDR-Fotos: kein Leser, kein HDR-Korpus im Baum; die Bild-Maße tragen kein geeichtes k in cd/m² (scripts/lib/licht-linsen.cjs:743)")
                );
                await L.je(5, async () =>
                    L.leser(5, "Geister-Fläche gegen die 16-fach zeitabgetastete Referenz: kein Leser — /bild (scripts/werkbank.cjs:2110) schießt EIN Bild ohne Zeitabtastung, keine Referenz mit 16 Teilbildern je Bild")
                );
                await L.je(6, async () => {
                    const dek = Math.log10(z.fern / z.near);
                    L.umfang(
                        6,
                        +dek.toFixed(2),
                        "das Auge zeichnet von " + z.near + " m bis " + (z.fern / 1000).toFixed(1) + " km (" + (z.feld ? "Feld-Pass" : "camera.far") + ") — die Sichten des Spielers sind Ego und Third (stamm/dirigent-kern.js:1237 setCameraMode); Makro-Flug und Orbit fährt nur die Kamera-Führung des Gelände-Studios (kameraFuehren, stamm/dirigent-kern.js:1232, Leser stamm/koerper-bewegung.js:1767)"
                    );
                });
                // S4 · Blendung: Wiese, Ego, Uhr 0,30, die Gier zur Sonne, der Blick waagrecht
                await L.je(4, async () => {
                    await L.ort("wiese", "ego");
                    const s = await L.ev(
                        "if (r.setTimeOfDay(0.3, 'human') !== true) throw new Error('die Uhr nimmt den Spieler nicht'); const d = r._sonnenRichtung(); r.state.yaw = Math.atan2(d.x, d.z); r.state.pitch = 0; return [d.x, d.y, d.z, Math.asin(d.y) * 180 / Math.PI];",
                        20
                    );
                    L.zeile("Sonne der Blendung: " + JSON.stringify(s));
                    try {
                        await L.auge(4, { b: { uhr: 0.3 } });
                    } finally {
                        await L.ev("r.setTimeOfDay(0.5, 'human'); return true;", 20).catch(() => null);
                    }
                });
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── erleben.bild.kamera — Jede Kamera: Foto, Kino, Wiederholung, Zuschauen ───────────
    // Die Probe fragt die Welt nach jeder Blickweise jenseits von Ego und Third (`setCameraMode` je Wort frei · foto · kino · karte ·
    // zuschauen · wiederholung, stamm/dirigent-kern.js:1237; der Modus kehrt zurück), zählt die Wesen, denen eine Kamera folgen könnte
    // (Bewohner `_bewohnerSiedlungen`, Tiere `state.creatures`), die Sekunden der Aufnahme (`state._replayRec`, stamm/dirigent-takt.js:1293)
    // und die Saaten. Nimmt die Welt keinen Modus, ist der Umfang nicht erzeugbar; Foto und Übertragung tragen keine Zahl (leser).
    LEITERN.push(
        leiter({
            leiter: "erleben.bild.kamera",
            sek: 40,
            mutiert: true,
            seite: { FAECHER, KAMERA_AN },
            pfad: ["stamm/dirigent-kern.js", "stamm/dirigent-takt.js", "stamm/koerper-bewegung.js", "stamm/siedlung-bewohner.js", "stamm/gelaende-fern.js", "stamm/gelaende-boden.js", "stamm/gelaende-chunks.js", "scripts/werkbank.cjs", "spec/profiband/haushalt.json"],
            welt: [{ wort: "gezaehlt", ab: 1, was: "in der Welt gezählte Größe der Kamera" }],
            sprossen: {
                1: {
                    soll: [{ wort: "luecke_pct", richtung: "≤", wert: 2, wortlaut: "20 Standbilder aus freier Lage: Bild ganz (Lücke ≤ 2 %)" }],
                    umfang: { verlangt: 20, einheit: "Standbilder aus freier Lage", wortlaut: "20 Standbilder aus freier Lage", feld: "richter" },
                },
                2: {
                    soll: [
                        { wort: "unschaerfe_abw_pct", richtung: "≤", wert: 10, wortlaut: "Unschärfe-Kreis gegen die Linsenformel ±10 %" },
                        { wort: "blindpaar_pct", richtung: "≤", wert: 80, wortlaut: "Blindpaar gegen ein Foto gleicher Brennweite und Blende ≤ 80 %" },
                    ],
                },
                3: {
                    soll: [{ wort: "diff_pct", richtung: "≤", wert: 1, wortlaut: "Wiederholung aus der Spieler-Lage gegen die Aufnahme: Diff ≤ 1 %" }],
                    umfang: { verlangt: 60, einheit: "s Wiederholung der Welt", wortlaut: "Wiederholung: die letzten 60 s aus jeder Lage", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "plan_abw_pct", richtung: "≤", wert: 5, wortlaut: "20 gefolgte Wesen über 1 Spieltag: Tagesplan gleich dem ohne Zuschauer (Abweichung ≤ 5 %)" }],
                    umfang: { verlangt: 20, einheit: "Wesen", wortlaut: "20 gefolgte Wesen über 1 Spieltag", feld: "richter" },
                },
                5: {
                    soll: [
                        { wort: "verstanden_pct", richtung: "≥", wert: 80, wortlaut: "blinde Zuschauer verstehen Stand und Entscheidung nach 5 min ≥ 80 %" },
                        { wort: "blindpaar_pct", richtung: "≤", wert: 75, wortlaut: "Blindpaar gegen eine Fernseh-Übertragung ≤ 75 %" },
                    ],
                },
                6: {
                    soll: [
                        { wort: "luma_sprung_pct", richtung: "≤", wert: 5, wortlaut: "Zoom Karte → Straße ohne Sprung (Luma ≤ 5 %, Lage ≤ 1 %)" },
                        { wort: "lage_sprung_pct", richtung: "≤", wert: 1, wortlaut: "Zoom Karte → Straße ohne Sprung (Luma ≤ 5 %, Lage ≤ 1 %)" },
                    ],
                    umfang: { verlangt: 20, einheit: "Befehle aus dem Kartenblick", wortlaut: "20 Befehle aus der Karte kommen am Boden an", feld: "richter" },
                },
                7: {
                    soll: [{ wort: "afc_pct", richtung: "≤", wert: 65, wortlaut: "Panel-2AFC 60 s Fahrt gegen eine Filmaufnahme gleicher Szene ≤ 65 %" }],
                    umfang: { verlangt: 20, einheit: "Saaten", wortlaut: "N = 20 Zufalls-Fahrten über Saaten", feld: "richter" },
                },
            },
            lauf: async function kameraLauf(H, P, L) {
                const z = await L.ev(
                    `const st = r.state, vor = st.cameraMode, genommen = [];
                    try {
                        for (const m of ["frei", "foto", "kino", "karte", "zuschauen", "wiederholung"]) {
                            r.setCameraMode(m);
                            if (st.cameraMode === m) genommen.push(m);
                        }
                    } finally {
                        r.setCameraMode(vor);
                    }
                    let bew = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) bew += S.liste ? S.liste.length : 0;
                    const rec = st._replayRec;
                    const aufnahmeS = rec && Array.isArray(rec.frames) ? rec.frames.reduce((a, f) => a + (f.dt || 0), 0) : 0;
                    return { vor, nach: st.cameraMode, genommen, bew, tiere: (st.creatures || []).length, aufnahmeS, saat: st.worldMeta && st.worldMeta.seed };`,
                    30
                );
                L.zeile("Kamera der Sitzung: " + JSON.stringify(z));
                const modi = "die Welt nimmt keine Sicht außer Ego und Third (gefragt: frei, foto, kino, karte, zuschauen, wiederholung — genommen: " + (z.genommen.join(", ") || "keine") + "; stamm/dirigent-kern.js:1237 setCameraMode)";
                // S1 ÜBER DEN FÄCHER (stationen/faecher.js; vorher „Umfang nicht erzeugbar“, weil keine freie Kamera steht): der Richter
                // stellt keine Kamera auf, er fragt das Gesetz der Residenz an 20 freien Lagen (5 Abstände × 4 Richtungen um den Leib,
                // der Blick zurück auf ihn) — trüge die Welt dort den Boden, den eine ruhende Kamera an der Lage hätte? Vier Kontrollen am
                // Leib selbst müssen tragen (sonst zeichnet die Welt gar nicht, kein Urteil); die schlechteste Lage ist die Pose des Bilds.
                await L.je(1, async () => {
                    const v = P.sprossen[1].umfang.verlangt;
                    const lagen = [];
                    for (const dM of [30, 120, 400, 1500, 4000])
                        for (let k = 0; k < 4; k++) {
                            const g = (k * Math.PI) / 2;
                            lagen.push({ saat: z.saat, d: dM, gier: g + Math.PI, lage: [Math.sin(g) * dM, 2, Math.cos(g) * dM] });
                        }
                    const kontrollen = [0, 1, 2, 3].map((k) => ({ saat: z.saat, d: 0, gier: (k * Math.PI) / 2, lage: [0, 2, 0], kontrolle: true }));
                    const R = await H.seite.FAECHER((c, ms) => L.ev(c, ms / 1000), {
                        gesetz: { fn: H.seite.KAMERA_AN, export: "stamm/gelaende-fern.js:1468 _chunkGezeichnet über state.voxelChunks (Spanne und Ring: stamm/gelaende-boden.js:2856 _voxelChunkConfig)", leser: "stamm/gelaende-fern.js:1497 _fernRingMaske" },
                        adressen: { dazu: lagen.slice(0, v).concat(kontrollen) },
                        ms: Math.max(4000, Math.floor((L.rest() - 8) * 1000)),
                        masse: {
                            lagen: { wie: "anzahl", nur: (a) => !a.kontrolle },
                            luecke: { wie: "max", feld: "luecke_pct", nur: (a) => !a.kontrolle },
                            kontrolle: { wie: "max", feld: "luecke_pct", nur: "kontrolle" },
                            proben: { wie: "summe", feld: "n" },
                            ring: { wie: "erste", feld: "ring" },
                        },
                        schlecht: { feld: "luecke_pct", richtung: "max" },
                        pose: (a) => "freie Lage " + a.d + " m vom Leib, Blick zurück (Gier " + +a.gier.toFixed(2) + "), 2 m über dem Grund — das Standbild dort",
                        ungemessen: ["Schärfe und Licht wie im Spiel: ungemessen bis zum Gerät (kein Bild ohne GPU)", "Bauten ab 150 m vom Spieler (stamm/dirigent-ankunft.js:1233) und der Fern-Ring (gröber, kein Ersatz des Bodens)"],
                    });
                    L.zeile("kamera S1: " + R.akte.slice(0, 500));
                    if (R.werte.lagen < v || R.werte.luecke == null) return L.leser(1, "Lücke an freien Lagen: " + (R.fehlt || "keine Lage gemessen") + " — " + R.gemessen + " von " + R.adressen + " Adressen · " + R.akte, R.werte.lagen);
                    if (!(R.werte.kontrolle <= P.sprossen[1].soll[0].wert)) throw new Error("die Kontrolle am Leib zeigt " + R.werte.kontrolle + " % Lücke (" + R.werte.proben + " Proben, " + z.saat + ") — die Welt zeichnet am Spieler nicht, kein Urteil an freien Lagen");
                    const s = R.schlecht && R.schlecht.a;
                    const frei = "keine freie Kamera: " + modi + "; die Führung `kameraFuehren` (stamm/dirigent-kern.js:1232) setzt nur ein Studio";
                    if (R.werte.luecke > P.sprossen[1].soll[0].wert)
                        return L.gemessen(1, { luecke_pct: R.werte.luecke }, {
                            erzeugt: R.werte.lagen,
                            welt: { gezaehlt: R.werte.proben },
                            taeter:
                                "die Welt lädt den Boden nur um den Leib (Ring " + R.werte.ring + " Chunks, `_tickVoxelChunkStreaming` stamm/gelaende-chunks.js:2803, `_pruneDistantVoxelChunks` stamm/gelaende-fern.js:5) — keine zweite Quelle des Ladens an der Kamera; schlechteste Lage " +
                                (s ? s.d + " m" : "?") + " mit " + R.werte.luecke + " % Lücke; " + frei + " · " + R.akte,
                        });
                    L.leser(1, frei + " — an " + R.werte.lagen + " freien Lagen trüge der Boden (Lücke höchstens " + R.werte.luecke + " %); Schärfe und Licht: ungemessen bis zum Gerät · " + R.akte, R.werte.lagen);
                });
                await L.je(2, async () => L.leser(2, "Umfang nicht erzeugbar (der Umfang „Foto“ trägt keine Zahl): kein Foto mit Brennweite, Blende, Belichtungszeit — " + modi + "; keine Schärfentiefe im Bild"));
                await L.je(3, async () =>
                    L.umfang(3, 0, "keine Wiederholung der Welt: die Aufnahme hält nur auf Ruf die Eingaben des Spielers (stamm/dirigent-takt.js:1293 startReplayRecording, jetzt " + z.aufnahmeS.toFixed(1) + " s Eingaben), kein Bild aus anderer Lage")
                );
                await L.je(4, async () => {
                    const n = z.bew + z.tiere;
                    if (n < 20) return L.umfang(4, n, "die Welt trägt " + z.bew + " Bewohner und " + z.tiere + " Tiere");
                    L.leser(4, "keine Folge-Kamera: " + modi + ", die Führung kameraFuehren (stamm/dirigent-kern.js:1232) setzt nur ein Studio; kein Leser des Tagesplans mit ↔ ohne Zuschauer", n);
                });
                await L.je(5, async () => L.leser(5, "Umfang nicht erzeugbar (der Umfang „ein Wettkampf mit Regie“ trägt keine Zahl): keine Regie-Kamera, keine Übertragung — " + modi));
                await L.je(6, async () => {
                    if (!z.genommen.includes("karte")) return L.umfang(6, 0, "kein Kartenblick: " + modi);
                    L.leser(6, "Befehle aus der Karte am Boden: kein Leser");
                });
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält EINE Saat (" + z.saat + ") und keine Kinofahrt"));
                L.preisPose("wiese", "ego");
            },
        })
    );
}

// ═══════════════════════════════════════ Perspektive klang ═══════════════════════════════════════
{
    // ─────────── erleben.klang.raum — Raumklang: Richtung, Entfernung, Nachhall aus der Welt ───────────
    // S1 misst im Fenster der Sitzung den Ruf EINES Leibs der Welt (`_tierRuf` → das Gesetzbuch `tierRuf`, dieselben zwei Schritte
    // wie die Klang-Werkstatt) an einem Stereo-OfflineAudioContext: 8 Winkel × 3 Abstände = 24 Quellenlagen, die Kamera dreht das Ohr;
    // je Lage Pegelunterschied (ILD = R − L, |ILD| ≥ 1 dB) und Laufzeitunterschied (Gipfel der Kreuzkorrelation L/R über ±40 Samples)
    // gegen die Seite aus der Spalte 0 der Kamera-Matrix. S2 liest den Nachhall des Graphen am Ort (EIN Raum binnen der Leiter);
    // S3–S5 zählen Bauten und die Hörweite des Gesetzes, S6 „Leser fehlt“, S7 zählt die Saaten.
    LEITERN.push(
        leiter({
            leiter: "erleben.klang.raum",
            sek: 45,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "stamm/klang.js", "klang-core.js", "stamm/kreatur-leben.js", "stamm/dirigent-takt.js", "tetrapoda-core.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "pegel_pct", richtung: "≥", wert: 100, wortlaut: "Pegel- und Laufzeitunterschied am Abgriff an 24 Quellenlagen mit richtigem Vorzeichen (100 %)", feld: "richter" },
                        { wort: "laufzeit_pct", richtung: "≥", wert: 100, wortlaut: "Pegel- und Laufzeitunterschied am Abgriff an 24 Quellenlagen mit richtigem Vorzeichen (100 %)", feld: "richter" },
                    ],
                    umfang: { verlangt: 24, einheit: "Quellenlagen", wortlaut: "an 24 Quellenlagen", feld: "richter" },
                    welt: [
                        { wort: "lagen", ab: 1, was: "Quellenlagen, an denen der Leib der Welt im verlangten Abstand rief" },
                        { wort: "pegel_spanne_db", ab: 1, was: "Pegel am Abgriff 3 m gegen 20 m (dB, Mittel über die Winkel)" },
                    ],
                },
                2: {
                    soll: [
                        { wort: "nachhall_faktor_min", richtung: "≥", wert: 1.3, wortlaut: "Nachhall paarweise ≥ 1,3× verschieden", feld: "tiefe" },
                        { wort: "verdeckung_db", richtung: "≥", wert: 6, wortlaut: "hinter Haus/Hang ≥ 6 dB leiser und dumpfer", feld: "tiefe" },
                    ],
                    umfang: { verlangt: 4, einheit: "Raumklassen", wortlaut: "4 Raumklassen (Feld, Wald, Gasse, Höhle)", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "lokalisierung_pct", richtung: "≥", wert: 85, wortlaut: "Blind-Lokalisierung (geeicht) ≥ 85 %", feld: "richter" },
                        { wort: "rt60_abweichung_pct", richtung: "≤", wert: 25, wortlaut: "RT60 an 50 Zufallsorten ±25 % der Sabine-Zahl", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "begehbare Orte", wortlaut: "10³ begehbare Orte einer Siedlung", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "oktav_rt60_abweichung_pct", richtung: "≤", wert: 20, wortlaut: "Oktav-RT60 ±20 %", feld: "richter" },
                        { wort: "daemmung_abweichung_db", richtung: "≤", wert: 5, wortlaut: "Wanddämmung ±5 dB gegen Bauakustik-Tafel", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e5, einheit: "Innenräume", wortlaut: "10⁵ Innenräume einer Stadt", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "laufzeit_abweichung_pct", richtung: "≤", wert: 2, wortlaut: "Laufzeit ±2 %", feld: "richter" },
                        { wort: "hoehendaempfung_abweichung_db", richtung: "≤", wert: 3, wortlaut: "Höhendämpfung nach ISO 9613 ±3 dB", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "km Fernschall", wortlaut: "Fernschall bis 10 km", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "schwerpunkt_abweichung_pct", richtung: "≤", wert: 20, wortlaut: "Spektralschwerpunkt kippt wie Hydrophon-Referenz ±20 %", feld: "richter" },
                        { wort: "schall_faktor_wasser", richtung: "≥", wert: 4.3, wortlaut: "4,3× schnellerer Schall", feld: "tiefe" },
                    ],
                },
                7: {
                    soll: [
                        { wort: "atmosphaere_pct", richtung: "≥", wert: 95, wortlaut: "folgen der Atmosphären-Zeile in ≥ 95 %", feld: "richter" },
                        { wort: "luftschall_vakuum", richtung: "≤", wert: 0, wortlaut: "Vakuum: Luftschall 0", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Saaten", wortlaut: "100 Saaten", feld: "richter" },
                },
            },
            lauf: async function raumLauf(H, P, L) {
                // DER ZENSUS (in der Seite): Bauten ohne den Wuchs der Natur (`_klangWuchs`), die Hörweiten des Gesetzes, neue Leser
                function raumZensus() {
                    const K = window.__klangCore || {};
                    const A = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
                    let bauten = 0;
                    for (const e of r.state.architectures || []) if (e && !A._klangWuchs(e) && !e._verkehrWagen) bauten++;
                    const U = K.UMWELT || {};
                    const weit = [["fahrt", (K.FAHRT_OHR || {}).hoerweiteM], ["tier", (U.tier || {}).hoerweiteM]]
                        .concat(Object.entries(U.stimmen || {}).map(([n, v]) => [n, v && v.hoerweiteM]))
                        .filter((x) => Number.isFinite(x[1]));
                    let rufM = 0;
                    if (typeof K.tierRufPegel === "function") for (let d = 1; d < 2e4; d *= 1.02) if (K.tierRufPegel(d) >= U.hoerschwelleDb) rufM = d;
                    const top = weit.reduce((a, b) => (b[1] > a[1] ? b : a), ["—", 0]);
                    const k = Object.keys(K);
                    return {
                        saat: r.state.worldMeta && r.state.worldMeta.seed,
                        bauten,
                        weitM: Math.max(top[1], rufM),
                        weitWer: top[1] >= rufM ? top[0] : "tier-ruf",
                        rufM: +rufM.toFixed(1),
                        c: (K.FAHRT_OHR || {}).c,
                        hrtf: k.filter((n) => /hrtf|binaural|itd|laufzeit/i.test(n)),
                        medium: k.filter((n) => /medium|hydrophon|koerperschall|unterwasser/i.test(n)),
                    };
                }
                // DIE SEITE DES RAUMS: (S2) der Loop mischt raumMs lang, dann der Nachhall des Graphen am Ort; (S1) EIN Leib ruft an 24 Lagen
                async function raumSeite(o) {
                    const s = r.state, K = window.__klangCore, cam = s.camera, rend = s.renderer, pm = s.playerMesh.position;
                    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
                    const war = !!(s.symphony && s.symphony.enabled);
                    const c0 = cam.position.clone(), q0 = cam.quaternion.clone();
                    let eigen = null, tier = null, tp = null, raum = null;
                    const lagen = [];
                    try {
                        if (!war) r.initSymphony();
                        const sy = s.symphony;
                        if (sy.ctx && sy.ctx.state !== "running") await sy.ctx.resume();
                        if (!sy.enabled || !sy.umwelt || !sy.umwelt.werkstatt) return { fehler: "der Klang steht nicht (enabled " + !!sy.enabled + ", Werkstatt " + !!(sy.umwelt && sy.umwelt.werkstatt) + ")" };
                        rend.setAnimationLoop((t) => r._gameLoopTick(t));
                        await warte(o.raumMs);
                        rend.setAnimationLoop(null);
                        const um = sy.umwelt, lr = (um.lage && um.lage.raum) || {};
                        raum = { rt60: um.raum && Number.isFinite(um.raum.rt60) ? +um.raum.rt60.toFixed(3) : null, deckung: lr.deckung, bau: lr.bau, fels: lr.fels, hoehle: lr.hoehle };
                        tier = (s.creatures || []).find((c) => c && c.position && !(c.userData && c.userData.dying)) || null;
                        if (!tier) tier = eigen = r.spawnCreatureAt(pm.x + 3, pm.y, pm.z, "happy", "wolf", { precise: true, bodySize: 1 });
                        if (!tier) return { fehler: "kein Leib für den Ruf (spawnCreatureAt wolf gab null)", raum };
                        tp = tier.position.clone();
                        for (const d of o.abstaende)
                            for (const w of o.winkel) {
                                // der Blick steht so, dass die Quelle (+x vom Ohr) w° rechts von ihm klingt
                                const a = (-w * Math.PI) / 180;
                                tier.position.set(pm.x + d, pm.y, pm.z);
                                cam.position.set(pm.x, pm.y, pm.z);
                                cam.lookAt(pm.x + Math.cos(a), pm.y, pm.z + Math.sin(a));
                                cam.updateMatrixWorld(true);
                                const seite = Math.sign(cam.matrixWorld.elements[0]);
                                const ruf = r._tierRuf(tier, "ruhe");
                                if (!ruf) {
                                    lagen.push({ d, w, seite, ruf: false });
                                    continue;
                                }
                                const ctx = new OfflineAudioContext(2, Math.round(48000 * o.sek), 48000);
                                K.tierRuf(ctx, ctx.destination, ruf);
                                const buf = await ctx.startRendering();
                                const A = buf.getChannelData(0), B = buf.getChannelData(1);
                                let pa = 0, pb = 0;
                                for (let i = 0; i < A.length; i++) (pa += A[i] * A[i]), (pb += B[i] * B[i]);
                                // die Laufzeit: der Gipfel von Σ L[i]·R[i−t] — R später (Quelle links) gibt t < 0, L später t > 0
                                let lag = 0, best = 0;
                                for (let t = -o.maxLag; t <= o.maxLag; t++) {
                                    let v = 0;
                                    for (let i = Math.max(0, t), n = Math.min(A.length, A.length + t); i < n; i++) v += A[i] * B[i - t];
                                    if (v > best * (1 + 1e-9) + 1e-15) (lag = t), (best = v);
                                }
                                lagen.push({ d, w, seite, ruf: true, dWelt: +ruf.d.toFixed(2), pan: +ruf.pan.toFixed(3), ild: +(10 * Math.log10((pb + 1e-12) / (pa + 1e-12))).toFixed(2), db: +(10 * Math.log10((pa + pb) / A.length + 1e-15)).toFixed(2), lag });
                            }
                        return { raum, lagen, eigen: !!eigen };
                    } finally {
                        rend.setAnimationLoop(null);
                        if (tier && tp && !eigen) tier.position.copy(tp);
                        if (eigen) r.removeCreature(eigen);
                        cam.position.copy(c0);
                        cam.quaternion.copy(q0);
                        cam.updateMatrixWorld(true);
                        if (!war && s.symphony.enabled) r.disposeSymphony();
                    }
                }
                const z = await L.ev("return (" + raumZensus + ")();", 30);
                L.zeile("Zensus Raum: " + JSON.stringify(z));
                const neu = (nr, k) => {
                    if (z[k].length) throw new Error("Leser erschienen (" + z[k].join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                // die billigen Sprossen zuerst (reißt die Frist am Ohr, stehen sie schon in der Ausgabe)
                await L.je(3, async () => {
                    neu(3, "hrtf");
                    if (z.bauten < P.sprossen[3].umfang.verlangt)
                        return L.umfang(3, z.bauten, "die Sitzung trägt " + z.bauten + " Bauten (begehbare Hüllen) — keine Siedlung mit 10³ begehbaren Orten; und das Ohr kennt kein vorn/hinten/oben (EIN StereoPanner je Quelle, klang-core.js:1277)");
                    L.leser(3, "kein vorn/hinten/oben am Ohr: jede Quelle geht durch EINEN StereoPanner, kein HRTF (klang-core.js:1277); der Nachhall ist die Formel basis + krone + bau + fels + hoehle (klang-core.js:1182), keine Sabine-Zahl aus Volumen und Absorption", z.bauten);
                });
                await L.je(4, async () => {
                    if (z.bauten < P.sprossen[4].umfang.verlangt)
                        return L.umfang(4, z.bauten, "die Sitzung trägt " + z.bauten + " Bauten — keine Stadt mit 10⁵ Innenräumen; kein Raum-in-Raum: der Raum am Ohr liest 16 waagerechte Strahlen (UMWELT.raum, klang-core.js:440)");
                    L.leser(4, "keine Impulsantwort je Raum und keine Wanddämmung nach Stoff: der Raum am Ohr sind vier Kammfilter mit EINER RT60 (klang-core.js:1188 umweltRaum), die Verdeckung pauschal −10 dB (klang-core.js:442 verdecktDb)", z.bauten);
                });
                await L.je(5, async () => {
                    const km = +(z.weitM / 1000).toFixed(3);
                    if (km < P.sprossen[5].umfang.verlangt)
                        return L.umfang(5, km, "das weiteste Ohr des Gesetzes reicht " + z.weitM + " m (" + z.weitWer + "; FAHRT_OHR.hoerweiteM klang-core.js:1757, Tier-Ruf " + z.rufM + " m) — kein Fernschall bis 10 km, keine Laufzeit (fahrtAmOhr ohne Verzögerung, klang-core.js:1759), keine Luftdämpfung nach ISO 9613");
                    L.leser(5, "keine Laufzeit und keine Höhendämpfung: fahrtAmOhr rechnet nur Doppler und −20·log10(d) (klang-core.js:1759)", km);
                });
                await L.je(6, async () => (neu(6, "medium"), L.leser(6, "kein Medienwechsel: unter Wasser schweigt nur der Schritt (stamm/klang.js:911), c = " + z.c + " m/s fest (klang-core.js:1757 FAHRT_OHR), kein Körperschall und keine Bodenwelle")));
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 100 Saaten verlangt; c und Dämpfung stehen fest im Gesetz (klang-core.js:1757), keine Atmosphären-Zeile, kein Vakuum"));
                // DAS OHR AN DER WIESE (S2, S1): EIN Seiten-Lauf
                let R = null, fehlR = null;
                try {
                    await L.ort("wiese", "ego");
                    L.preisPose("wiese", "ego");
                    R = await L.ev("return await (" + raumSeite + ")(" + JSON.stringify({ raumMs: 2000, abstaende: [3, 8, 20], winkel: [-90, -60, -30, -15, 15, 30, 60, 90], sek: 0.6, maxLag: 40 }) + ");", Math.max(10, L.rest() - 3));
                    L.zeile("Raum am Ohr: " + JSON.stringify(R).slice(0, 2400));
                } catch (e) {
                    if (e && e.messort) throw e;
                    fehlR = String((e && e.message) || e).split("\n")[0].slice(0, 200);
                }
                await L.je(2, async () => {
                    const rt = R && R.raum ? R.raum.rt60 : null;
                    L.umfang(2, Number.isFinite(rt) ? 1 : 0, "binnen einer Leiter (60 s) liest das Ohr EINEN Raum: das Feld der Wiese (RT60 " + (Number.isFinite(rt) ? rt + " s" : "ungelesen" + (fehlR ? ": " + fehlR : "")) + ") — Wald, Gasse und Höhle verlangen drei Ortswechsel mit kaltem Ring (11–28 s je Ort); klang.K3#2 misst sie headless in 10 min");
                });
                await L.je(1, async () => {
                    if (fehlR) throw new Error(fehlR);
                    if (!R || R.fehler) throw new Error((R && R.fehler) || "der Seiten-Lauf gab nichts");
                    const n = P.sprossen[1].umfang.verlangt;
                    const echt = R.lagen.filter((x) => x.ruf && Math.abs(x.dWelt - x.d) < 0.1);
                    const pegel = echt.filter((x) => x.seite !== 0 && Math.sign(x.ild) === x.seite && Math.abs(x.ild) >= 1);
                    const zeit = echt.filter((x) => x.seite !== 0 && Math.sign(x.lag) === x.seite);
                    const db = (d, w) => (echt.find((x) => x.d === d && x.w === w) || {}).db;
                    const sp = [...new Set(echt.map((x) => x.w))].map((w) => db(3, w) - db(20, w)).filter(Number.isFinite);
                    const spanne = sp.length ? +(sp.reduce((a, b) => a + b, 0) / sp.length).toFixed(2) : 0;
                    const stumm = R.lagen.filter((x) => !x.ruf || Math.abs(x.dWelt - x.d) >= 0.1);
                    const lag0 = echt.filter((x) => x.lag === 0).length;
                    const taeter =
                        zeit.length < n
                            ? "kein Laufzeitunterschied: tierRufSpielen führt den Ruf durch EINEN StereoPannerNode ohne Verzögerung je Ohr (klang-core.js:1277) — Lag 0 Samples an " + lag0 + " von " + echt.length + " Lagen"
                            : pegel.length < n
                              ? "Pegel mit falschem Vorzeichen oder < 1 dB an " + echt.filter((x) => !pegel.includes(x)).map((x) => x.w + "° " + x.d + " m (" + x.ild + " dB)").slice(0, 4).join(", ") + " — _umweltPanorama (stamm/klang.js:350)"
                              : null;
                    L.gemessen(1, { pegel_pct: +((100 * pegel.length) / n).toFixed(1), laufzeit_pct: +((100 * zeit.length) / n).toFixed(1) }, {
                        erzeugt: echt.length,
                        welt: { lagen: echt.length, pegel_spanne_db: spanne },
                        taeter: (taeter || "") + (stumm.length ? (taeter ? " · " : "") + stumm.length + " Lagen ohne Ruf im verlangten Abstand" : "") || null,
                        beleg: "Leib " + (R.eigen ? "gesetzt (Wolf)" : "der Welt") + " · ILD " + echt.map((x) => x.w + "°/" + x.d + "m " + x.ild).slice(0, 8).join(" · "),
                    });
                });
            },
        })
    );

    // ─────────── erleben.klang.ereignis — Ereignis-Klang: Stoß, Bruch, Kaskade ───────────
    // S1 und S2 trägt bestehend klang.K4#2 (Tafel „gleich“, gebuchte Akten; Richter-Falte 19.11.: der Zwilling dieser Probe —
    // Schritt je Stoff und Körper-Teil der Klang-Linse — fiel). S3–S6 urteilen „Leser fehlt“ bzw. zählen Bauten, S7 die Saaten.
    LEITERN.push(
        leiter({
            leiter: "erleben.klang.ereignis",
            sek: 60,
            pfad: ["scripts/werkbank.cjs", "scripts/diag-klang-zensus.cjs", "scripts/lib/welt-orte.cjs", "spec/profiband/haushalt.json", "klang-core.js", "vehicle-core.js", "koerper-core.js", "stamm/klang.js", "stamm/koerper-seele.js", "stamm/koerper-fahrt.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            bestehend: [1, 2],
            sprossen: {
                3: { soll: [{ wort: "stoff_erkannt_pct", richtung: "≥", wert: 70, wortlaut: "Stoff aus 10 nur am Klang ≥ 70 %", feld: "richter" }] },
                4: {
                    soll: [
                        { wort: "eigenfrequenz_abweichung_pct", richtung: "≤", wert: 10, wortlaut: "tiefste Eigenfrequenz ±10 % gegen Platten-/Balkenformel", feld: "richter" },
                        { wort: "truemmer_r", richtung: "≥", wert: 0.8, wortlaut: "Trümmer im Bild ↔ Einschläge am Abgriff r ≥ 0,8", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Zufallsbauten", wortlaut: "100 Zufallsbauten", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "donner_abweichung_pct", richtung: "≤", wert: 25, wortlaut: "Donner-Spektrum und -Dauer ±25 %", feld: "richter" },
                        { wort: "brandung_r", richtung: "≥", wert: 0.9, wortlaut: "Brandungspegel ∝ Wellenhöhe im Bild r ≥ 0,9", feld: "richter" },
                    ],
                },
                6: { soll: [{ wort: "pegel_abweichung_db", richtung: "≤", wert: 6, wortlaut: "Eruptionsstärke → Pegel in 1/5/20 km gegen Vulkan-Akustik-Messungen ±6 dB", feld: "richter" }] },
                7: {
                    soll: [{ wort: "plausibel_pct", richtung: "≥", wert: 90, wortlaut: "geeichtes Ohr „plausibel für Stoff und Medium\" ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Saaten", wortlaut: "10⁶ Saaten", feld: "umfang" },
                },
            },
            lauf: async function ereignisLauf(H, P, L) {
                function ereignisZensus() {
                    const K = window.__klangCore || {};
                    const A = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
                    let bauten = 0;
                    for (const e of r.state.architectures || []) if (e && !A._klangWuchs(e) && !e._verkehrWagen) bauten++;
                    const k = Object.keys(K), sti = Object.keys((K.UMWELT || {}).stimmen || {});
                    return {
                        saat: r.state.worldMeta && r.state.worldMeta.seed,
                        bauten,
                        stimmen: sti,
                        gesetze: ["SCHRITT", "TREFFER_PAAR", "FAHRT", "SUBSTANZ"].filter((n) => K[n]).concat(sti.filter((n) => n === "glut")),
                        kontakt: k.filter((n) => /kratz|gleit|bruch|truemmer|reib/i.test(n)),
                        modal: k.filter((n) => /eigenfreq|modal|platte|balken/i.test(n)),
                        elementar: sti.concat(k).filter((n) => /donner|brandung|lawine|hagel/i.test(n)),
                        geologie: sti.concat(k).filter((n) => /vulkan|eruption|beben|geysir|kalben|infraschall/i.test(n)),
                    };
                }
                const z = await L.ev("return (" + ereignisZensus + ")();", 30);
                L.zeile("Zensus Ereignis: " + JSON.stringify(z));
                const neu = (nr, k) => {
                    if (z[k].length) throw new Error("Leser erschienen (" + z[k].join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                await L.je(3, async () => (neu(3, "kontakt"), L.leser(3, "keine Kontaktart außer dem Stoß: der Kontakt klingt als Treffer (TREFFER_PAAR klang-core.js:1408) und Schritt (SCHRITT klang-core.js:1483), gerollt wird nur das Abrollen des Wagens (FAHRT.abrollen klang-core.js:1615) — kein Kratzen, Gleiten, Bruch; kein Foley-Korpus")));
                await L.je(4, async () => {
                    neu(4, "modal");
                    if (z.bauten < P.sprossen[4].umfang.verlangt)
                        return L.umfang(4, z.bauten, "die Sitzung trägt " + z.bauten + " Bauten — 100 Zufallsbauten verlangt; und kein Ding klingt nach Größe oder Hohlraum (SUBSTANZ klang-core.js:1310 klingt nach Tags)");
                    L.leser(4, "keine Eigenfrequenz aus Größe und Hohlraum, kein Trümmer-Klang: ein Ding klingt nach den Tags seiner Substanz (SUBSTANZ klang-core.js:1310), nie nach Platten-/Balkenformel", z.bauten);
                });
                await L.je(5, async () => (neu(5, "elementar"), L.leser(5, "kein Donner, keine Lawine, kein Hagel: UMWELT trägt die Stimmen " + z.stimmen.join(" · ") + " (klang-core.js:443); das Ufer schlägt aus dem Wind (ufer.wellenDb klang-core.js:451), nie aus der Wellenhöhe im Bild")));
                await L.je(6, async () => (neu(6, "geologie"), L.leser(6, "kein Vulkan-, Beben- oder Geysir-Klang und kein Infraschall: keine Stimme der Geologie in UMWELT (klang-core.js:443), das weiteste Ohr hört 160 m (klang-core.js:1757)")));
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 10⁶ Saaten verlangt; kein fremder Stoff, kein fremdes Medium"));
                // die Pose des Preises (R3): die Wiese, Ego
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── erleben.klang.landschaft — Klang-Landschaft: was wirklich lebt, fährt, arbeitet ───────────
    // S1 trägt die Station g6 (karte2.erleben.klang.landschaft#1: Wind Bild ↔ Ohr, Klang-Zensus je Ort). Der Zensus der Sitzung zählt
    // Bewohner (je Siedlung die Liste oder Σ leuteVon des Plans), Wagen des Verkehrs (`_verkehrWagen`) und Saaten: unter dem Umfang
    // urteilt `L.umfang`, darüber „Leser fehlt“ — die Bewohner klingen nicht (der Schritt-Klang gehört dem Spieler allein).
    LEITERN.push(
        leiter({
            leiter: "erleben.klang.landschaft",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "stamm/klang.js", "klang-core.js", "stamm/koerper-seele.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-verkehr.js", "fachwerk-core.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [{ wort: "kreuzkorrelation", richtung: "≥", wert: 0.6, wortlaut: "Kreuzkorrelation Bild ↔ Ohr ≥ 0,6 je Biom", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Wagen", wortlaut: "20 Wagen", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "mittag_nacht_db", richtung: "≥", wert: 15, wortlaut: "Dorfplatz Mittag gegen Nacht ≥ 15 dB", feld: "richter" },
                        { wort: "quellen_r", richtung: "≥", wert: 0.8, wortlaut: "Quellen am Abgriff ↔ Bewohner im Bild r ≥ 0,8", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "lebende Quellen", wortlaut: "10² lebende Quellen eines Dorfs", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "indizes_abweichung_pct", richtung: "≤", wert: 25, wortlaut: "Bioakustik-Indizes (ACI, NDSI) ±25 % gegen Feldaufnahmen", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Zufallsorte", wortlaut: "jedes Biom der Erde (20 Zufallsorte)", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "pegel_abweichung_db", richtung: "≤", wert: 5, wortlaut: "Tagpegel und Oktavspektrum an 10 Zufallsorten ±5 dB gegen Lärmkarten", feld: "richter" }],
                    umfang: { verlangt: 1e4, einheit: "Quellen", wortlaut: "10⁴ Quellen einer Großstadt", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "aktivitaet_r", richtung: "≥", wert: 0.9, wortlaut: "Pegelkurve folgt der Aktivität r ≥ 0,9", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Bewohner", wortlaut: "10⁶ Bewohner einer Metropole", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "bezirk_uhrzeit_pct", richtung: "≥", wert: 70, wortlaut: "Bezirkstyp und Uhrzeit nur am Abgriff ≥ 70 %", feld: "richter" },
                        { wort: "verursacher_pct", richtung: "≥", wert: 99, wortlaut: "hörbare Quellen mit Verursacher im Bild ≥ 99 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e8, einheit: "Bewohner einer Stadt", wortlaut: "10⁸ in einer Stadt", feld: "umfang" },
                },
                8: {
                    soll: [
                        { wort: "lebendig_pct", richtung: "≥", wert: 80, wortlaut: "„lebendig und eigen\" ≥ 80 %", feld: "richter" },
                        { wort: "paare_pct", richtung: "≥", wert: 90, wortlaut: "Paare unterscheidbar ≥ 90 %", feld: "richter" },
                        { wort: "allometrie_abweichung_pct", richtung: "≤", wert: 20, wortlaut: "Allometrie-Steigung ±20 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Saaten", wortlaut: "100 Saaten", feld: "richter" },
                },
            },
            lauf: async function landschaftLauf(H, P, L) {
                function landZensus() {
                    const FC = globalThis.__fachwerkCore;
                    let bew = 0, maxS = 0, sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (S.liste) n = S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function")
                            for (const sl of S.plan.slots)
                                try {
                                    n += Math.max(0, FC.leuteVon(sl.ov) | 0);
                                } catch (_e) {}
                        bew += n;
                        if (n > maxS) maxS = n;
                    }
                    let wagen = 0;
                    for (const e of r.state.architectures || []) if (e && e._verkehrWagen) wagen++;
                    const namen = [];
                    for (let o = Object.getPrototypeOf(r); o && o !== Object.prototype; o = Object.getPrototypeOf(o)) namen.push(...Object.getOwnPropertyNames(o));
                    return { saat: r.state.worldMeta && r.state.worldMeta.seed, bew, maxS, sied, wagen, bewohnerKlang: namen.filter((n) => /klang/i.test(n) && /bewohner|leute|murmel|werkzeug|tuer/i.test(n)) };
                }
                const z = await L.ev("return (" + landZensus + ")();", 30);
                L.zeile("Zensus Landschaft: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.bewohnerKlang.length) throw new Error("Leser erschienen (" + z.bewohnerKlang.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                const stumm = "die Bewohner klingen nicht: der Schritt-Klang gehört dem Spieler allein (`_schrittKlangTick` stamm/klang.js:888, gerufen nur aus animatePlayerSoul stamm/koerper-seele.js:1771) — kein Werkzeug, keine Tür, kein Murmeln";
                await L.je(2, async () => {
                    if (z.wagen < P.sprossen[2].umfang.verlangt)
                        return L.umfang(2, z.wagen, "die Sitzung trägt " + z.wagen + " Wagen des Verkehrs (`_verkehrWagen`, stamm/siedlung-verkehr.js:634) — 20 verlangt; 5 Biome × Tag/Nacht × Regen liegen jenseits einer Leiter von 60 s");
                    throw new Error("20 Wagen stehen (" + z.wagen + "), doch 5 Biome × Tag/Nacht × Regen verlangen 20 Ortswechsel mit kaltem Ring — jenseits der 60 s einer Leiter");
                });
                await L.je(3, async () => {
                    neu(3);
                    if (z.maxS < P.sprossen[3].umfang.verlangt) return L.umfang(3, z.maxS, "die größte Siedlung der Sitzung trägt " + z.maxS + " Bewohner (" + z.sied + " Siedlungen) — 10² lebende Quellen verlangt; und " + stumm);
                    L.leser(3, stumm, z.maxS);
                });
                await L.je(4, async () => L.leser(4, "die Arten teilen das Spektrum nicht: der Chor sind zwei Texturen (vogelA, vogelB) hinter EINEM Tiefpass 9 kHz (klang-core.js:479), Grillen EIN Band (klang-core.js:491); kein Feldaufnahmen-Korpus für ACI/NDSI"));
                await L.je(5, async () => {
                    neu(5);
                    const q = z.bew + z.wagen;
                    if (q < P.sprossen[5].umfang.verlangt) return L.umfang(5, q, "die Sitzung trägt " + z.bew + " Bewohner und " + z.wagen + " Wagen als mögliche Quellen — 10⁴ verlangt; und " + stumm);
                    L.leser(5, stumm, q);
                });
                await L.je(6, async () => {
                    neu(6);
                    if (z.bew < P.sprossen[6].umfang.verlangt) return L.umfang(6, z.bew, "die Sitzung trägt " + z.bew + " Bewohner in " + z.sied + " Siedlungen — keine Metropole mit 10⁶");
                    L.leser(6, stumm, z.bew);
                });
                await L.je(7, async () => {
                    neu(7);
                    if (z.maxS < P.sprossen[7].umfang.verlangt) return L.umfang(7, z.maxS, "die größte Siedlung trägt " + z.maxS + " Bewohner — 10⁸ in einer Stadt verlangt");
                    L.leser(7, stumm, z.maxS);
                });
                await L.je(8, async () => L.umfang(8, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 100 Saaten verlangt; der Ruf folgt dem Leib nur über f0 ∝ L^−0,9 der vier Gattungen (klang-core.js:497)"));
            },
        })
    );

    // ─────────── erleben.klang.stimme — Stimme: Personen sprechen aus dem Leib ───────────
    // Kein Bewohner spricht; der Begleiter spricht über speechSynthesis des Browsers (stamm/werkstatt-hud.js:73) — eine Gerätestimme
    // außerhalb des Klang-Graphen (R4). S1/S2 urteilen „Leser fehlt“, S3/S4 zählen Bewohner je Siedlung und gesamt, S5 die Saaten.
    LEITERN.push(
        leiter({
            leiter: "erleben.klang.stimme",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "stamm/werkstatt-hud.js", "stamm/klang.js", "klang-core.js", "stamm/siedlung-bewohner.js", "fachwerk-core.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            sprossen: {
                1: { soll: [{ wort: "formant_abweichung_pct", richtung: "≤", wert: 15, wortlaut: "F0 und Formanten am Abgriff gegen Peterson-Barney-Tafel ±15 % nach Leibmaßen", feld: "richter" }] },
                2: {
                    soll: [
                        { wort: "wer_pct", richtung: "≤", wert: 10, wortlaut: "Wortfehlerrate eines Spracherkenners am Abgriff ≤ 10 %", feld: "richter" },
                        { wort: "affekt_pct", richtung: "≥", wert: 60, wortlaut: "Affekt blind ≥ 60 %", feld: "richter" },
                    ],
                },
                3: {
                    soll: [{ wort: "verwechslung_pct", richtung: "≤", wert: 5, wortlaut: "Sprecher-Verwechslung zweier Zufallsbewohner ≤ 5 %", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "Bewohner einer Siedlung", wortlaut: "jeder Bewohner einer Siedlung (10³)", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "latenz_s", richtung: "≤", wert: 1, wortlaut: "Latenz ≤ 1 s", feld: "richter" },
                        { wort: "wer_pct", richtung: "≤", wert: 10, wortlaut: "Spielersprache ≤ 10 % WER", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Personen", wortlaut: "jede Person einer Metropole (10⁶) spricht und antwortet", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "sprache_pct", richtung: "≥", wert: 90, wortlaut: "geeichtes Ohr „Sprache\" ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Saaten", wortlaut: "100 Saaten", feld: "richter" },
                },
            },
            lauf: async function stimmeLauf(H, P, L) {
                function stimmeZensus() {
                    const FC = globalThis.__fachwerkCore, K = window.__klangCore || {};
                    let bew = 0, maxS = 0, sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (S.liste) n = S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function")
                            for (const sl of S.plan.slots)
                                try {
                                    n += Math.max(0, FC.leuteVon(sl.ov) | 0);
                                } catch (_e) {}
                        bew += n;
                        if (n > maxS) maxS = n;
                    }
                    const namen = [];
                    for (let o = Object.getPrototypeOf(r); o && o !== Object.prototype; o = Object.getPrototypeOf(o)) namen.push(...Object.getOwnPropertyNames(o));
                    const leib = namen.concat(Object.keys(K)).filter((n) => /sprech|formant|murmel|vokal/i.test(n) || (/stimme/i.test(n) && /bewohner|leib|mensch/i.test(n)));
                    return { saat: r.state.worldMeta && r.state.worldMeta.seed, bew, maxS, sied, leib, tts: typeof window.speechSynthesis === "object" };
                }
                const z = await L.ev("return (" + stimmeZensus + ")();", 30);
                L.zeile("Zensus Stimme: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.leib.length) throw new Error("Leser erschienen (" + z.leib.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                const stumm = "kein Bewohner spricht; der Begleiter spricht über speechSynthesis des Browsers (stamm/werkstatt-hud.js:73) — Gerätestimme außerhalb des Klang-Graphen, nicht aus Gesetz (R4)";
                await L.je(1, async () => (neu(1), L.leser(1, "keine Stimme aus dem Leib: kein Formant-Gesetz für Menschen (der Klang-Kern formt nur den Tier-Ruf, f1/f2 ∝ 1/L klang-core.js:497); " + stumm)));
                await L.je(2, async () => (neu(2), L.leser(2, "keine Sprache am Abgriff: " + stumm + "; keine Prosodie aus Affekt im Graphen")));
                await L.je(3, async () => {
                    neu(3);
                    if (z.maxS < P.sprossen[3].umfang.verlangt) return L.umfang(3, z.maxS, "die größte Siedlung der Sitzung trägt " + z.maxS + " Bewohner (" + z.sied + " Siedlungen) — 10³ verlangt; und " + stumm);
                    L.leser(3, stumm, z.maxS);
                });
                await L.je(4, async () => {
                    neu(4);
                    if (z.bew < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.bew, "die Sitzung trägt " + z.bew + " Bewohner — keine Metropole mit 10⁶ Personen; und " + stumm);
                    L.leser(4, stumm, z.bew);
                });
                await L.je(5, async () => L.umfang(5, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 100 Saaten verlangt; kein fremdes Sprechorgan"));
            },
        })
    );

    // ─────────── erleben.klang.musik — Musik aus Gesetz: Stoff → Spektrum → Tonsystem → Tradition ───────────
    // Die Musik der Welt spielt am Master aus den Genre-Tafeln (klang-core.js:95 PRESETS) in 12-TET-Skalen (klang-core.js:39): S1 ist ein
    // Hörer-Blindtest — das Bild der Szene an fester Pose (Wiese, Ego) liegt ab, das Urteil fällt am Gerät; S2/S4/S6 „Leser fehlt“,
    // S3/S5 zählen die Tonsysteme (in der Seite aus SCALES: ganzzahlige Halbtöne = 12-TET), S7 die Saaten.
    LEITERN.push(
        leiter({
            leiter: "erleben.klang.musik",
            sek: 40,
            pfad: ["scripts/werkbank.cjs", "klang-core.js", "stamm/klang.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "stimmung_pct", richtung: "≥", wert: 70, wortlaut: "Stimmung der Szene aus der Musik erkannt ≥ 70 %", feld: "richter" },
                        { wort: "wiederholung_frei_min", richtung: "≥", wert: 10, wortlaut: "am Abgriff keine Wiederholung in 10 min", feld: "richter" },
                    ],
                    auge: { pose: "wiese ego (Mittag, Sonne, Sommer — die Bühne der Sitzung)", vorbild: "Hörer-Blindtest (R11): Stimmung der Szene aus der Musik erkannt, Szene ↔ Musik blind gepaart" },
                },
                2: { soll: [{ wort: "tonhoehe_abweichung_pct", richtung: "≤", wert: 3, wortlaut: "Tonhöhe am Abgriff folgt Saiten-/Röhrenlänge ±3 %", feld: "richter" }] },
                3: {
                    soll: [
                        { wort: "nachbar_cent", richtung: "≤", wert: 15, wortlaut: "jede hat einen Nachbarn ≤ 15 cent", feld: "richter" },
                        { wort: "paare_pct", richtung: "≥", wert: 90, wortlaut: "Paare unterscheidbar ≥ 90 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Kulturen", wortlaut: "100 Zufallskulturen", feld: "umfang" },
                },
                4: { soll: [{ wort: "familie_pct", richtung: "≥", wert: 80, wortlaut: "Klassifikator ordnet den Abgriff der richtigen Hornbostel-Sachs-Familie ≥ 80 %", feld: "richter" }] },
                5: {
                    soll: [
                        { wort: "afc_pct", richtung: "≤", wert: 75, wortlaut: "2AFC gegen Feldaufnahmen des Musik-Korpus ≤ 75 %", feld: "richter" },
                        { wort: "anlass_pct", richtung: "≥", wert: 70, wortlaut: "Anlass blind erkannt ≥ 70 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Kulturen", wortlaut: "100 Kulturen", feld: "richter" },
                },
                6: { soll: [{ wort: "baumabstand_pct", richtung: "≤", wert: 25, wortlaut: "Baumabstand ≤ 25 %", feld: "richter" }] },
                7: {
                    soll: [
                        { wort: "traditionen", richtung: "≥", wert: 1e5, wortlaut: "effektive Zahl der angetroffenen Traditionen (Chao1 über Hör-Cluster) ≥ 10⁵", feld: "richter" },
                        { wort: "struktur_pct", richtung: "≥", wert: 95, wortlaut: "Struktur messbar (Wiederholung, Hierarchie, Tonzentrum oder Puls) ≥ 95 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Saaten", wortlaut: "Zufallsreise über 1 000 Saaten", feld: "richter" },
                },
            },
            lauf: async function musikLauf(H, P, L) {
                function musikZensus() {
                    const K = window.__klangCore || {};
                    const sys = new Set(Object.values(K.SCALES || {}).map((a) => (Array.isArray(a) && a.every(Number.isInteger) ? "12-TET" : "andere " + JSON.stringify(a))));
                    return {
                        saat: r.state.worldMeta && r.state.worldMeta.seed,
                        systeme: [...sys],
                        skalen: Object.keys(K.SCALES || {}).length,
                        genres: Object.keys(K.GENRES || {}).length,
                        instrumente: Object.keys(K.INSTRUMENTS || {}).length,
                        neu: Object.keys(K).filter((n) => /tonsystem|tradition|kultur|hornbostel|stilbaum/i.test(n)),
                    };
                }
                const z = await L.ev("return (" + musikZensus + ")();", 30);
                L.zeile("Zensus Musik: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.neu.length) throw new Error("Leser erschienen (" + z.neu.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                await L.je(2, async () => (neu(2), L.leser(2, "kein Instrument in der Welt: die Musik spielt am Master aus " + z.genres + " Genre-Tafeln (klang-core.js:95 PRESETS) mit " + z.instrumente + " Instrument-Stimmen (klang-core.js:74 INSTRUMENTS) — keine Quelle mit Saite oder Röhre im Raum")));
                await L.je(3, async () => (neu(3), L.umfang(3, z.systeme.length, "die Welt hält " + z.systeme.length + " Tonsystem (" + z.systeme.join(", ") + ", " + z.skalen + " Skalen klang-core.js:39) — keine Kultur mit eigenem Tonsystem aus dem Spektrum ihrer Instrumente")));
                await L.je(4, async () => (neu(4), L.leser(4, "die Klangfarbe folgt nicht Stoff und Bauform: INSTRUMENTS ist eine feste Tafel (klang-core.js:74), keine Kultur baut ein Instrument aus ihren Stoffen")));
                await L.je(5, async () => (neu(5), L.umfang(5, z.systeme.length, "EIN Musik-System für jede Siedlung (" + z.systeme.join(", ") + ") — 100 Kulturen verlangt; kein Gesang, kein Anlass (Fest, Arbeit, Trauer) im Klang")));
                await L.je(6, async () => (neu(6), L.leser(6, "kein Stil-Wandel: die Genre-Tafeln sind ein fester Katalog (klang-core.js:95 PRESETS), kein Stammbaum aus Kontakt und Technik")));
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält EINE Saat (" + z.saat + ") — 1 000 Saaten verlangt; keine Musik fremder Arten"));
                await L.je(1, async () => {
                    await L.auge(1, { ort: "wiese", sicht: "ego" });
                    L.preisPose("wiese", "ego");
                });
            },
        })
    );

    // ─────────── erleben.klang.getuemmel — Getümmel: das Wichtige hören ───────────
    // S1 misst im Fenster der Sitzung am Ausgang der Spitzen-Wand (`s.spitze.ausgang`, stamm/klang.js:29): an der Wiese im Regen läuft
    // der Loop ~14 s, je 40 ms die Spitze (dBFS) und die Stimmen des Graphen (`umwelt.graph.zensus`); steht die Musik frei, senkt der
    // Weg des Begleiters (`_musikDuck("gespraech")`, stamm/werkstatt-hud.js:90) den Duck-Bus — gelesen am Gain des Busses. 10 min
    // trägt keine Leiter (Zeuge `dauer_min`). S2/S3/S5 zählen Bewohner, S4/S6 „Leser fehlt“.
    LEITERN.push(
        leiter({
            leiter: "erleben.klang.getuemmel",
            sek: 45,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "scripts/lib/ausgabe-aufnahme.cjs", "stamm/klang.js", "klang-core.js", "stamm/werkstatt-hud.js", "stamm/siedlung-bewohner.js", "fachwerk-core.js"],
            welt: [{ wort: "proben", ab: 1, was: "Proben der Welt im Lauf" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "spitze_dbfs", richtung: "≤", wert: 0, wortlaut: "Spitzen ≤ 0 dBFS über 10 min", feld: "richter" },
                        { wort: "dauer_min", richtung: "≥", wert: 10, wortlaut: "Spitzen ≤ 0 dBFS über 10 min", feld: "richter" },
                        { wort: "duck_db", richtung: "≥", wert: 8, wortlaut: "Duck 8–12 dB bei Stimme", feld: "richter" },
                        { wort: "duck_db_bis", richtung: "≤", wert: 12, wortlaut: "Duck 8–12 dB bei Stimme", feld: "richter" },
                    ],
                    umfang: { verlangt: 7, einheit: "Stimmen zugleich", wortlaut: "7 Stimmen zugleich", feld: "umfang" },
                    welt: [
                        { wort: "proben", ab: 50, was: "Spitzen-Proben am Ausgang der Wand" },
                        { wort: "duck_wechsel_db", ab: 1, was: "Senkung des Duck-Busses gegen vorher (dB)" },
                    ],
                },
                2: {
                    soll: [{ wort: "wer_pct", richtung: "≤", wert: 15, wortlaut: "WER des zugewandten Sprechers bei 65 dB(A) ≤ 15 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Quellen", wortlaut: "Dorfplatz mit 10² Quellen", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "wer_pct", richtung: "≤", wert: 15, wortlaut: "WER ≤ 15 %", feld: "richter" },
                        { wort: "menge_senkung_db", richtung: "≤", wert: 3, wortlaut: "Menge dabei ≤ 3 dB gesenkt", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e4, einheit: "Quellen", wortlaut: "Großstadtstraße 75 dB(A), 10⁴ Quellen", feld: "umfang" },
                },
                4: { soll: [{ wort: "schwelle_abweichung_pct", richtung: "≤", wert: 30, wortlaut: "Hörschwelle steigt und erholt sich nach der Audiologie ±30 %", feld: "richter" }] },
                5: {
                    soll: [
                        { wort: "wer_pct", richtung: "≤", wert: 20, wortlaut: "WER des zugewandten Sprechers bei 90 dB(A) ≤ 20 %", feld: "richter" },
                        { wort: "warn_pct", richtung: "≥", wert: 95, wortlaut: "Warnsignal hörbar erkannt ≥ 95 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e5, einheit: "Stimmen", wortlaut: "Stadion 10⁵ Stimmen", feld: "umfang" },
                },
                6: { soll: [{ wort: "hoerbar_pct", richtung: "≥", wert: 95, wortlaut: "zugewandter Sprecher, Warnung und eigener Schritt hörbar in ≥ 95 %", feld: "richter" }] },
            },
            lauf: async function getuemmelLauf(H, P, L) {
                function getuemmelZensus() {
                    const FC = globalThis.__fachwerkCore, K = window.__klangCore || {};
                    let bew = 0, maxS = 0, sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (S.liste) n = S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function")
                            for (const sl of S.plan.slots)
                                try {
                                    n += Math.max(0, FC.leuteVon(sl.ov) | 0);
                                } catch (_e) {}
                        bew += n;
                        if (n > maxS) maxS = n;
                    }
                    let wagen = 0;
                    for (const e of r.state.architectures || []) if (e && e._verkehrWagen) wagen++;
                    const U = K.UMWELT || {};
                    return { bew, maxS, sied, wagen, schwelle: U.hoerschwelleDb, deckel: U.stimmenMax, stimmen: Object.keys(U.stimmen || {}), neu: Object.keys(K).filter((n) => /vertaeub|tinnitus|maskier|zuwend|warnung/i.test(n)) };
                }
                // DIE SEITE DES GETÜMMELS: Spitzen am Ausgang der Wand, Stimmen des Graphen, der Duck bei Stimme
                async function getuemmelSeite(o) {
                    const s = r.state, rend = s.renderer;
                    const warte = (ms) => new Promise((f) => setTimeout(f, ms));
                    const war = !!(s.symphony && s.symphony.enabled), wetter0 = s.weather;
                    const ton0 = (k, sr, n) => (k * sr) / n;
                    let takt = null, an = null, sy = null, ton = null, tonG = null;
                    try {
                        if (!war) r.initSymphony();
                        sy = s.symphony;
                        if (sy.ctx && sy.ctx.state !== "running") await sy.ctx.resume();
                        if (!sy.enabled || !sy.spitze || !sy.lofi || !sy.lofi.duck || !sy.umwelt || !sy.umwelt.graph)
                            return { fehler: "der Klang steht nicht (enabled " + !!sy.enabled + ", Wand " + !!sy.spitze + ", Duck " + !!(sy.lofi && sy.lofi.duck) + ")" };
                        if (o.wetter && s.weather !== o.wetter && window.__wetterSetzen(o.wetter) !== o.wetter) return { fehler: "das Wetter-Wort " + o.wetter + " gilt nicht" };
                        rend.setAnimationLoop((t) => r._gameLoopTick(t));
                        an = sy.ctx.createAnalyser();
                        an.fftSize = 4096;
                        sy.spitze.ausgang.connect(an);
                        const td = new Float32Array(an.fftSize);
                        const U = sy.umwelt.kern.UMWELT;
                        let spitze = 0, proben = 0, stimmenMax = 0, verletzt = 0;
                        const namen = {};
                        const t0 = performance.now();
                        takt = setInterval(() => {
                            an.getFloatTimeDomainData(td);
                            let p = 0;
                            for (let i = 0; i < td.length; i++) {
                                const a = Math.abs(td[i]);
                                if (a > p) p = a;
                            }
                            if (p > spitze) spitze = p;
                            proben++;
                            const zz = sy.umwelt.graph.zensus();
                            const ein = zz.filter((v) => v.an);
                            if (ein.length > stimmenMax) stimmenMax = ein.length;
                            for (const v of ein) namen[v.name] = (namen[v.name] || 0) + 1;
                            if (ein.length >= U.stimmenMax) {
                                const leiseste = Math.min(...ein.map((v) => v.db));
                                if (zz.some((v) => !v.an && v.db > leiseste + U.hystereseDb)) verletzt++;
                            }
                        }, 40);
                        await warte(o.vorMs);
                        // DER DUCK AM ABGRIFF: ein Mess-Ton (−60 dBFS, auf einer Linie der FFT) läuft durch den Duck-Bus der Musik, ein
                        // Analyser an seinem Ausgang liest die Linie vor und nach der Stimme — der Ton hält den Bus zugleich im Takt des
                        // Audio-Fadens (ein Bus ohne Eingang rechnet seine Rampe nicht)
                        const Lf = sy.lofi, ctx = sy.ctx;
                        const an2 = ctx.createAnalyser();
                        an2.fftSize = 4096;
                        an2.smoothingTimeConstant = 0;
                        const k = Math.round(o.tonHz / (ctx.sampleRate / an2.fftSize));
                        ton = ctx.createOscillator();
                        tonG = ctx.createGain();
                        ton.frequency.value = (k * ctx.sampleRate) / an2.fftSize;
                        tonG.gain.value = 1e-3;
                        ton.connect(tonG);
                        tonG.connect(Lf.duck);
                        Lf.duck.connect(an2);
                        ton.start();
                        const fd = new Float32Array(an2.frequencyBinCount);
                        const linie = async () => {
                            let q = 0;
                            for (let i = 0; i < 3; i++) {
                                await warte(60);
                                an2.getFloatFrequencyData(fd);
                                q += Math.pow(10, fd[k] / 10);
                            }
                            return 10 * Math.log10(q / 3);
                        };
                        await warte(200);
                        for (let i = 0; i < 60 && Lf.duckBis > ctx.currentTime; i++) await warte(50);
                        const [l0, g0] = [await linie(), Lf.duck.gain.value];
                        const ok = r._musikDuck("gespraech", o.zeichen);
                        await warte(o.duckMs);
                        const [l1, g1] = [await linie(), Lf.duck.gain.value];
                        ton.stop();
                        tonG.disconnect();
                        Lf.duck.disconnect(an2);
                        [ton, tonG] = [null, null];
                        while (performance.now() - t0 < o.sek * 1000) await warte(100);
                        clearInterval(takt);
                        takt = null;
                        return { ms: Math.round(performance.now() - t0), proben, spitzeDbfs: spitze > 0 ? +(20 * Math.log10(spitze)).toFixed(2) : -999, stimmenMax, namen, verletzt, deckel: U.stimmenMax, duck: { ok: !!ok, tonHz: +ton0(k, ctx.sampleRate, an2.fftSize).toFixed(1), l0: +l0.toFixed(2), l1: +l1.toFixed(2), g0: +g0.toFixed(4), g1: +g1.toFixed(4) }, wetter: s.weather };
                    } finally {
                        if (takt) clearInterval(takt);
                        if (ton)
                            try {
                                ton.stop();
                                tonG.disconnect();
                            } catch (_e) {}
                        rend.setAnimationLoop(null);
                        if (an && sy && sy.spitze)
                            try {
                                sy.spitze.ausgang.disconnect(an);
                            } catch (_e) {}
                        if (wetter0 && s.weather !== wetter0) window.__wetterSetzen(wetter0);
                        if (!war && s.symphony.enabled) r.disposeSymphony();
                    }
                }
                const z = await L.ev("return (" + getuemmelZensus + ")();", 30);
                L.zeile("Zensus Getümmel: " + JSON.stringify(z));
                const neu = (nr) => {
                    if (z.neu.length) throw new Error("Leser erschienen (" + z.neu.join(", ") + ") — S" + nr + " misst ihn noch nicht");
                };
                const kein = "kein zugewandter Sprecher: Bewohner sprechen nicht, der Begleiter spricht über speechSynthesis außerhalb des Klang-Graphen (stamm/werkstatt-hud.js:73)";
                await L.je(2, async () => {
                    neu(2);
                    if (z.maxS < P.sprossen[2].umfang.verlangt) return L.umfang(2, z.maxS, "die größte Siedlung trägt " + z.maxS + " Bewohner — kein Dorfplatz mit 10² Quellen; und " + kein);
                    L.leser(2, kein, z.maxS);
                });
                await L.je(3, async () => {
                    neu(3);
                    const q = z.bew + z.wagen;
                    if (q < P.sprossen[3].umfang.verlangt) return L.umfang(3, q, "die Sitzung trägt " + z.bew + " Bewohner und " + z.wagen + " Wagen — keine Großstadtstraße mit 10⁴ Quellen; und " + kein);
                    L.leser(3, kein + "; keine Zuwendung im Graphen (der Deckel wählt die lautesten " + z.deckel + " Stimmen, klang-core.js:417)", q);
                });
                await L.je(4, async () => (neu(4), L.leser(4, "keine Vertäubung: die Hörschwelle steht fest bei " + z.schwelle + " dB (klang-core.js:415 UMWELT.hoerschwelleDb), kein Klingeln, kein 130-dB-Ereignis")));
                await L.je(5, async () => {
                    neu(5);
                    if (z.maxS < P.sprossen[5].umfang.verlangt) return L.umfang(5, z.maxS, "die größte Siedlung trägt " + z.maxS + " Bewohner — kein Stadion mit 10⁵ Stimmen; und " + kein);
                    L.leser(5, kein + "; keine Warn-Stimme in UMWELT (klang-core.js:443)", z.maxS);
                });
                await L.je(6, async () => (neu(6), L.leser(6, kein + "; keine Warn-Stimme in UMWELT (" + z.stimmen.join(" · ") + ", klang-core.js:443) — hörbar bleibt nur der eigene Schritt (stamm/klang.js:888)")));
                await L.je(1, async () => {
                    await L.ort("wiese", "ego");
                    L.preisPose("wiese", "ego");
                    const sek = Math.max(6, Math.min(14, L.rest() - 10));
                    const G = await L.ev("return await (" + getuemmelSeite + ")(" + JSON.stringify({ wetter: "rainy", sek, vorMs: Math.round(sek * 300), duckMs: 300, zeichen: 30, tonHz: 15000 }) + ");", Math.max(10, L.rest() - 2));
                    L.zeile("Getümmel am Ohr: " + JSON.stringify(G));
                    if (G.fehler) throw new Error(G.fehler);
                    // der Duck am Abgriff: die Linie des Mess-Tons am Ausgang des Duck-Busses vor gegen nach der Stimme (dB)
                    const duck = Number.isFinite(G.duck.l0) && Number.isFinite(G.duck.l1) ? +(G.duck.l0 - G.duck.l1).toFixed(2) : null;
                    const wechsel = duck == null ? 0 : duck;
                    const dauer = +(G.ms / 60000).toFixed(3);
                    const t = [];
                    if (G.spitzeDbfs > 0) t.push("Spitze " + G.spitzeDbfs + " dBFS hinter der Wand (umweltSpitze klang-core.js:1168, UMWELT.spitze :424)");
                    if (!(duck >= 8 && duck <= 12)) t.push("Duck " + duck + " dB bei Stimme (MUSIK.duck.gespraech klang-core.js:382, `_musikDuck` " + (G.duck.ok ? "lief" : "verweigert") + ")");
                    if (G.stimmenMax < P.sprossen[1].umfang.verlangt) t.push("nur " + G.stimmenMax + " Stimmen zugleich an der Wiese im Regen (" + Object.keys(G.namen).join(", ") + ")");
                    if (dauer < 10) t.push("die Leiter hört " + dauer + " min — 10 min übersteigen den Deckel einer Leiter (60 s)");
                    L.gemessen(1, { spitze_dbfs: G.spitzeDbfs, dauer_min: dauer, duck_db: duck, duck_db_bis: duck }, {
                        erzeugt: G.stimmenMax,
                        welt: { proben: G.proben, duck_wechsel_db: wechsel },
                        taeter: t.join(" · ") || null,
                        beleg: "Wetter " + G.wetter + " · Stimmen je Probe " + JSON.stringify(G.namen) + " · Deckel " + G.deckel + ", lautere stumm " + G.verletzt + "× · Mess-Ton " + G.duck.tonHz + " Hz " + G.duck.l0 + " → " + G.duck.l1 + " dB · Gain des Busses " + G.duck.g0 + " → " + G.duck.g1,
                    });
                });
            },
        })
    );
}

module.exports = LEITERN.flat();
