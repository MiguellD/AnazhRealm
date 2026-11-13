#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-boot-stage.cjs — „VOLLE BÜHNE" ALS PRÄDIKAT (W2) und DIE KALT-ZEILE (K30, Pflicht-OFFEN B; ankunft K1–K3)
//
// Die volle Bühne ist ein PRÄDIKAT aus kanonischen Quellen (nichts hartkodiert, die Impostor-Erwartung aus der Bibliothek):
//   RING ≥ Ziel · GRAS/WASSER ohne Wartende · STREU `_streuWartet` 0 (keine Region fehlt, wartet auf ihr Asset oder trägt
//   eine offene Scheibe; eine fehlende Regionen-Karte heißt „der Streamer lief noch nie") · BIBLIO Foundry ready + Prefetch
//   fertig · IMPOST Bake-Queue leer (nur mit Renderer) · LUFT die EINE Luftperspektive (scene.fogNode, Sichtweite ≥ 5 km).
// Der Null-Renderer nennt den Takt, in dem das Prädikat schließt — eine Zeit trägt er nicht (die Wanduhr des Containers war ein
// Anhalt, und `_weltbildDa` ist die Eigenmeldung: die Zeit misst die Kalt-Zeile von außen). --selftest: die Bühnen-Wahrheit
// liest dieselbe Streu (die wartende Region trägt gate:ankunft L2a).   node scripts/diag-boot-stage.cjs [--selftest]
//
// DIE KALT-ZEILE: `--kalt` bootet mit echtem Renderer und LEEREM Profil (IDB leer, wie nach jedem Versions-Update) und nennt
// je Sekunde, worauf das erste Weltbild wartet (`_weltbildFehlt`), die blockierten ms des Haupt-Threads (benannt: Boden,
// Streu, Bauten, Gruppen-Bau, Buch, Ort-Wahl, Dorf und der Knoten-Bau der Zeichnung, aus der Spur),
// die Phase des Vorrats (`f._vorrat` wörtlich) und die Foundry-Schlange; der Adapter vom Gerät (`device.adapterInfo`).
// DIE KONTROLLE VON AUSSEN (ankunft K1): t = die Prozess-Uhr ab Navigation, als die gehaltene Taste W den Leib um ≥ 0,1 m trug
// — nie `_weltbildDa` (die Eigenmeldung steht daneben). Urteil: t ≤ 5 s ohne halbes Weltbild (kalt: Pflicht-OFFEN B; mit
// `--profil` am Zweit-Boot: die Wiederkehr, ankunft K3). `--bild`: das Bild der Kontrolle gegen dieselbe Pose nach 60 s Ruhe
// (ankunft K2: ≤ 2 % Lücke, nichts offen im Bild). `--mutante eigenmeldung|bild|bruch`: die Schlupflöcher, ROT beim Namen.
// Ohne `--echt` swiftshader, mit `--echt` die Hardware-GPU (1920×1080).
// AM BILD GEZEICHNET (w28-bild-ganz): die Zeile zählt von AUSSEN (`BILD_PROBE`, unabhängig vom Term „zeichnung“ des Spiels), wer
// im Bild des ersten Weltbilds zeichnen wollte (ein Ruf der Erst-Zeichnung mit Zug-Parametern) und nicht zeichnete (kein Zug
// des Backends; ein Bündel, das ohne ihn versiegelte, spielt ohne ihn ab) — ROT beim Namen: „Weltbild steht, <Bürger> nicht
// gezeichnet“. GTX 1050 an main 523e3a38: kalt 6–8 Bürger des Hauptbilds (Karten-Atlas, Fern-Ring, Ferne der Wiese), am
// Zweit-Boot 5–11 (dazu Boden-Satz, Himmel, Sonne — ein fast schwarzes Bild). Das Bild der Kontrolle (ankunft K2) sah die
// Klasse nie: sein Schuss ruht den Loop, und der ruhende Loop baut jedes Programm am Stück.
// DIE ANKUNFT BRICHT NICHT (w28-loop-vor-init): die Zeile liest das Bruch-Buch des EINEN Melders (`_bruchMelden`) am ersten
// Weltbild und reicht JEDEN Eintrag in den EINEN Sammler (welt-boot `bruchBuch`) — ROT beim Wort: „Weltbild steht, die Ankunft
// brach n-mal beim Namen: …“. GTX 1050 an main e6f0cf7e, 7 von 126 Zweit-Boots: die Antwort des Buch-Fadens kam 44–64 ms vor
// `rendererReady`, `_loopRuht` warf am Vendor (`getAnimationLoop` auf null), die Kette der Spieler-Vorlagen riss („STOFF: …“),
// der Bau goss beide Stufen des Leibs im Haupt-Faden („FADEN-UMGANGEN: Guss „mensch“ …“, EINE Aufgabe 3,3–3,9 s) — drei laute
// Einträge im Buch, und kein Tor las sie. `--mutante bruch` pflanzt einen Bruch vor dem Bild.
// DIE WIEDERKEHR TRIFFT DEN PIPELINE-CACHE (w28-ankunft-reihe, ankunft K3): mit `--profil` legt jeder Lauf die Kennungen der
// Shader-Texte seiner Pipelines ins Profil (`programme.json`); am Zweit-Boot ist jede Pipeline ROT beim Namen, deren Bytes kein
// Boot davor trug („Die Wiederkehr verfehlt den Pipeline-Cache: n von m …“). GTX 1050 an main b1531071: 20 von 42 — r184
// reihte die Glieder der geteilten Uniform-Gruppe nach der Geburt ihrer Knoten, und die hängt am Gang des Boots. --selftest
// füttert das Urteil mit einer fremden Pipeline.
// DIE SPUR (B, w4-ankunft): die Zeile fährt die EINE Spur der Hänger-Familie (CDP-Trace, CPU-Stichproben jedes Fadens) von der
// Navigation bis zur Kontrolle und urteilt sie (`ankunftsHalter`, scripts/lib/haenger-linse.cjs): die Phasen (HTML, Skripte, DOM,
// Buch, der Schluss jedes Terms des ersten Weltbilds, Ring, erstes Lade-Bild, Weltbild, Kontrolle — je mit der belegten Zeit des
// Haupt-Fadens bis dahin), die längsten Aufgaben vor dem Bild mit ihren HALTERN (Funktion · Datei:Zeile · ms) und die
// Funktionen vor dem Bild (inklusiv · selbst). DIE HALTER-LINSE ist ROT beim Namen jeder Funktion, die vor dem ersten Bild den
// Haupt-Faden ≥ 50 ms hält (Selbsttest: `werkbank takt --selbsttest`). `--spur datei` legt Spur und Seite ab.
//   node scripts/diag-boot-stage.cjs --kalt [--echt] [--profil ordner] [--json datei] [--spur datei] [--bild kontrolle.png] [--mutante m]
//
// DIE LIEFER-ZEILE (pipeline.K4 Stufe 1): die Kalt-Zeile liest die Liefer-Marke des Spiels (`_foundryLiefer`: Körper-Aufträge,
// Antworten von der Platte · im Werk gebaut · leer, Güsse des Haupt-Fadens). Mit `--profil` wartet sie auf die Ruhe der Foundry
// (der Erst-Boot füllt die Platte ganz); am Zweit-Boot urteilt sie: ≥ 95 % von der Platte, kein Auftrag verschluckt.
// --selftest verschluckt eine Lieferung (Null-Renderer) — die Zeile ist ROT beim Namen.
// DIE ART-ZEILE (pipeline.K4 Stufe 2): am Zweit-Boot Blatt-Atlas, Dorf-Export und Karten je ganz von der Platte, dazu die
// Haupt-Faden-ms ihrer Erzeuger (die Liefer-Marke zählt sie). Jeder Lauf mit `--profil` legt die Liste seiner Lieferungen
// (Art · Rest · Weg · Kerne) ins Profil; `--kern-wechsel <kern>` serviert die Skripte des Kerns mit einem Kommentar mehr
// (sein Gesetz-SHA springt) und urteilt gegen die Liste davor: nur seine Leser bauen neu — ein fremder Neubau dessen, was
// die Platte trug, ist ROT beim Namen, ebenso ein Leser, der noch von der Platte kommt (`wechselUrteil`; --selftest füttert
// es mit Bruch-Daten). DIE LANDUNG (w28-platte-fein): `--wechsel-marke <n>` hängt die Marke an den Kommentar (jede Marke ein
// neuer SHA: der n-te Boot nach einer Landung im selben Profil), `--kern-text "<alt>=><neu>"` tauscht dazu einen Text im
// Gesetz des Kerns (eine Landung, die Bytes ändert). DER ABDRUCK: `--abdruck` legt je Lieferung den EINEN Bau-Fingerabdruck
// ihrer Bytes ab (asset-worker-harness `bauAbdruck`, dazu Beipack, Plan und Atlas; im `--json` unter `abdruck`),
// `--gegen <json>` zählt gegen den Lauf dieser Datei, wie viele Lieferungen byte-anders sind, und urteilt: was hier von der
// Platte kam, trägt die Bytes des Laufs dort — sonst ROT beim Namen „ALT UNTER NEUEM GESETZ“ (der Lauf dort ist der frische
// Bau unter demselben Gesetz; `abdruckUrteil`, --selftest füttert es mit einem alten Körper).
// ─────────────────────────────────────────────────────────────────────────
const { statikServer, starteBrowser, sleep, hauptLauf, nullWelt, urteilEnde, pngDatei, path, fs, SELBSTTEST, argOpt: OPT, jsonLesen, jsonSchreiben, bruchBuch, taeter } = require("./lib/welt-boot.cjs");
const HL = require("./lib/haenger-linse.cjs");

const PORT = Number(process.env.BOOT_STAGE_PORT || 4406);
const ARGV = process.argv.slice(2);
// Das Soll der Ankunft (docs/PFLICHT-OFFEN.md B, roadmap §0.v1 Schritt 1): kalt bis Kontrolle ≤ 5 s.
// Die Kontrolle von außen (ankunft K1): die Taste trägt den Leib ≥ 0,1 m; nach 1500 Atemzügen ohne Weg hat er sie nie.
// Das ganze Bild (ankunft K2 Staffel 1): in KEINER Kachel (8 × 6) weichen mehr als 2 % der Pixel gegen dieselbe Pose nach 60 s Ruhe
// um mehr als ein Achtel ab (`lueckeKacheln`).
const [ANKUNFT_SOLL_MS, KONTROLLE_M, KONTROLLE_DRUECKE, RUHE_MS, LUECKE_SOLL] = [5000, 0.1, 1500, 60000, 0.02];
const KERN = require("../cores.manifest.json").find((k) => k.id === OPT("--kern-wechsel"));
// der Tausch im Gesetz des Kerns (`--kern-text`): ein Text, den keine seiner Dateien trägt, bricht beim Namen
const TAUSCH = KERN && OPT("--kern-text") ? OPT("--kern-text").split("=>") : null;
if (TAUSCH && (TAUSCH.length !== 2 || !KERN.scripts.some((s) => fs.readFileSync(path.join(__dirname, "..", s), "utf8").includes(TAUSCH[0]))))
    throw new Error(`--kern-text: kein Skript des Kerns ${KERN.id} trägt „${TAUSCH[0]}“ (Form "<alt>=><neu>")`);
const gewechselt = (roh) => (TAUSCH ? String(roh).split(TAUSCH[0]).join(TAUSCH[1]) : roh) + "//" + (OPT("--wechsel-marke") || "");
const server = statikServer({ wandle: (p, roh) => (roh != null && KERN?.scripts.includes(p.slice(1)) ? gewechselt(roh) : roh) });
// (Seite) trägt die gehaltene Taste den Leib um `m`? Der Weg in einem Atem von 200 ms, waagrecht — der Fall zählt nicht.
async function LEIB_WEG(m) {
    const p = () => r?.state.playerMesh?.position;
    const a = p() && p().clone();
    await window.sleep(200);
    return !!a && Math.hypot(p().x - a.x, p().z - a.z) >= m;
}
// (Seite) DER SCHUSS DER KONTROLLE: der Loop ruht, dieselbe Pose (der erste Schuss merkt die Kamera, der zweite stellt sie
// zurück), die Bühne hält Mittag · Sonne · Sommer, der Mess-Frame wartet auf keine stehende Welt. `mut`: der Schuss endet nach 20 m.
async function SCHUSS(W, H, mut, r = window.anazhRealm, cam = r.state.camera) {
    const P = window.__pose || (window.__pose = [cam.position.clone(), cam.quaternion.clone()]);
    r.state.renderer.setAnimationLoop(null);
    const far = cam.far;
    cam.position.copy(P[0]);
    cam.quaternion.copy(P[1]);
    cam.far = mut ? 20 : far;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    window.__buehne();
    let auf = null;
    try {
        for (let i = 0; i < 2; i++) auf = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
    } finally {
        cam.far = far;
        cam.updateProjectionMatrix();
        r.state.renderer.setAnimationLoop(r._gameLoopTick);
    }
    return { dc: auf.info.drawCalls, dreiecke: auf.info.triangles, png: __png(auf.u8.slice(0, W * H * 4), W, H) };
}
// DIE LÜCKE (rein; ankunft K2, w28-linse-wahr F der Augen-Karte): je Kachel eines nx × ny-Rasters der Anteil der Pixel, die in einem
// Kanal um mehr als 32 abweichen — das Urteil liest das MAXIMUM, die Zeile nennt Kachel und Bildmittel. Bis hier mittelte sie über das
// ganze Bild: am Dorf fehlten bei Kontrolle die Büsche, GRÜN „1,07 % Lücke“ (P29), ein Loch in der Bildmitte verschwand im Mittel (P27).
function lueckeKacheln(A, B, [nx, ny] = [8, 6]) {
    const n = new Array(nx * ny).fill(0);
    let summe = 0;
    for (let y = 0; y < A.H; y++)
        for (let x = 0; x < A.W; x++) {
            const i = (y * A.W + x) * 4;
            if (![0, 1, 2].some((k) => Math.abs(A.u8[i + k] - B.u8[i + k]) > 32)) continue;
            summe++;
            n[Math.floor((y * ny) / A.H) * nx + Math.floor((x * nx) / A.W)]++;
        }
    const je = n.map((k, j) => k / ((Math.floor(((j % nx) + 1) * A.W / nx) - Math.floor(((j % nx) * A.W) / nx)) * (Math.floor((Math.floor(j / nx) + 1) * A.H / ny) - Math.floor((Math.floor(j / nx) * A.H) / ny)))); // prettier-ignore
    const j = je.indexOf(Math.max(...je));
    return { luecke: je[j], kachel: `${j % nx}/${Math.floor(j / nx)}`, mittel: summe / (A.W * A.H) };
}
// die Seite wartet Takt um Takt (`__gebautNach`), bis die Foundry nichts mehr offen hat (`_weltOffen`) und der Vorrat durch ist —
// dann gilt ihre Liefer-Marke
const RUHE = (r = window.anazhRealm) =>
    window
        .__gebautNach("die Ruhe der Foundry", { fertig: () => !r._weltOffen().foundry && !r._foundry._vorrat && !r._impostorBakeQueue?.length, max: 600 })
        .then(() => r._foundry.lieferung);
// DER GEPFLANZTE BRUCH (--selftest): die erste Körper-Antwort nach dem Erwachen verschluckt der Haupt-Faden, ihr Leser bekommt null
function SCHLUCK() {
    __weltDa((r) => r._foundry).then((r) => {
        r._foundryAntwort = (f, m) => {
            const p = m.type === "asset" && f.pending.get(m.reqId);
            if (!p) return Object.getPrototypeOf(r)._foundryAntwort.call(r, f, m);
            delete r._foundryAntwort;
            f.pending.delete(m.reqId);
            p(null);
        };
    });
}
// die Liefer-Zeile aus der Marke: jede Lieferung zählt (auch der Guss des Haupt-Fadens), ein Auftrag ohne Antwort ist verschluckt
// die Pipelines, die ab dem Bild (`da`) synchron entstanden, beim Namen und Pass (der Haken der Hänger-Familie)
const nachBild = (sync, da) => sync.filter((e) => e.t >= da).map((e) => `${e.n} (${e.pass})`);
function lieferUrteil(roh, zweit) {
    const L = Object.assign({ auftrag: 0, platte: 0, werk: 0, leer: 0, haupt: 0 }, roh);
    const n = L.platte + L.werk + L.leer + L.haupt;
    const weg = L.auftrag + L.haupt - n;
    const q = n ? L.platte / n : 0;
    const je = ["blatt-atlas", "dorf-export", "karte"].map((k) => [k, Object.assign({ platte: 0, werk: 0, haupt: 0, ms: 0 }, L.je?.[k])]);
    return {
        weg,
        gruen: zweit && !weg && q >= 0.95,
        zeile: `LIEFERUNG ${zweit ? "zweit" : "kalt"}: ${L.platte} von ${n} von der Platte (${(q * 100).toFixed(1)} %) · Werk ${L.werk} · Haupt-Faden ${L.haupt} · leer ${L.leer} · verschluckt ${weg}`,
        artGruen: zweit && je.every(([, J]) => J.platte && !J.werk && !J.haupt),
        artZeile: `LIEFERUNG je Art: ${je.map(([k, J]) => `${k} ${J.platte}/${J.platte + J.werk + J.haupt} ${Math.round(J.ms)} ms`).join(" · ")}`,
    };
}
// DIE PROGRAMM-ZEILE (ankunft K3, w28-ankunft-reihe) — die Probe: jede Pipeline des Boots mit der Kennung ihrer Shader-Texte
// (Länge:FNV-1a von Vertex und Fragment, gemerkt am Modul) — [Etikett, Vertex, Fragment]
function PROGRAMM_PROBE() {
    if (typeof GPUDevice === "undefined" || window.__programmProbe) return;
    const P = (window.__programmProbe = { liste: [], fehler: "" });
    const G = GPUDevice.prototype;
    const texte = new WeakMap();
    const kennung = (s) => {
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
        return s.length + ":" + h.toString(16);
    };
    const modul = G.createShaderModule;
    G.createShaderModule = function (d) {
        const m = modul.call(this, d);
        texte.set(m, kennung(String((d && d.code) || "")));
        return m;
    };
    for (const art of ["createRenderPipeline", "createRenderPipelineAsync"]) {
        const roh = G[art];
        if (typeof roh !== "function") continue;
        G[art] = function (d) {
            try {
                const name = String((d && d.label) || "?").replace(/^renderPipeline_/, "");
                P.liste.push([name, texte.get(d.vertex.module) || "?", (d.fragment && texte.get(d.fragment.module)) || "–"]);
            } catch (e) {
                P.fehler = String(e && e.message);
            }
            return roh.call(this, d);
        };
    }
}
// DAS URTEIL (rein): an der Wiederkehr trägt jede Pipeline die Bytes eines Boots davor im selben Profil — der Pipeline-Cache
// des Browsers trifft nur gleiche Bytes, eine fremde übersetzt neu in der EINEN Schlange des GPU-Prozesses (GTX 1050: 20 von
// 42 fremd, je 1,25–1,36 s, das Weltbild der ersten Wiederkehr 3,3 s später als das der zweiten). ROT beim Namen jeder
// fremden; ohne Messung ROT (Lehre 6). Der Kalt-Boot legt nur ab. `vor`: die Text-Paare „Vertex|Fragment" der Boots davor.
function programmUrteil(vor, nach, zweit) {
    if (!Array.isArray(nach) || !nach.length)
        return { gruen: false, zeile: "PROGRAMME: keine Messung — die Probe sah keine Pipeline des Boots" };
    if (!zweit) return { gruen: false, zeile: `PROGRAMME kalt: ${nach.length} Pipelines, ihre Texte liegen im Profil — die Wiederkehr urteilt` };
    if (!Array.isArray(vor) || !vor.length)
        return { gruen: false, zeile: "PROGRAMME zweit: keine Messung — das Profil trägt keine Liste der Boots davor" };
    const trug = new Set(vor);
    const fremd = nach.filter(([, v, f]) => !trug.has(`${v}|${f}`));
    if (!fremd.length) return { gruen: true, zeile: `PROGRAMME zweit: jede der ${nach.length} Pipelines trägt die Bytes eines Boots davor — der Pipeline-Cache trifft` };
    // jedes Programm EINMAL beim Namen (dieselbe Pipeline entsteht je Pass neu), mit der Zahl seiner Pipelines
    const je = new Map();
    for (const [n, v, f] of fremd) je.set(`${n} (V ${v.split(":")[0]} · F ${f.split(":")[0]} B)`, (je.get(`${n} (V ${v.split(":")[0]} · F ${f.split(":")[0]} B)`) || 0) + 1);
    const namen = [...je].slice(0, 4).map(([n, z]) => (z > 1 ? `${z}× ${n}` : n));
    return {
        gruen: false,
        zeile: `Die Wiederkehr verfehlt den Pipeline-Cache: ${fremd.length} von ${nach.length} Pipelines tragen andere Bytes als in den Boots davor — ${namen.join(" · ")}${je.size > 4 ? ` und ${je.size - 4} weitere Programme` : ""} (ihr Text hängt am Gang des Boots: die Reihe der Glieder, ein Puffer ohne festen Namen, ein Graph mit wechselnden Lesern)`,
    };
}
// (Seite) DER ABDRUCK JEDER LIEFERUNG (`--abdruck`): je Antwort eines Studio-Fadens mit Liefer-Marke — Körper, Dorf-Export,
// Blatt-Atlas; die Karte backt die GPU — der Fingerabdruck ihrer Bytes, wie sie den Wirt erreichen: für die Teile der EINE
// Bau-Fingerabdruck (`bauAbdruck`), dazu der Beipack (Skelett, Hüllen, Maß, Krone), der Plan, die Stufen des Atlas.
// `je`: Rest → [Abdruck, Weg]. Die Probe liest die Puffer im Ereignis der Antwort, vor ihrem Leser.
function ABDRUCK_PROBE(bauAbdruck) {
    const A = (window.__lieferAbdruck = { je: {}, offen: 0 });
    const hex = (b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");
    const sha = (x) => crypto.subtle.digest("SHA-256", typeof x === "string" ? new TextEncoder().encode(x) : x).then(hex);
    const W0 = window.Worker;
    window.Worker = class extends W0 {
        constructor(u, o) {
            super(u, o);
            this.addEventListener("message", (e) => {
                const m = e.data;
                if (!m || !m.liefer || m.vorrat || !(m.bau || m.platte)) return;
                let p = null;
                if (m.type === "asset") {
                    const bei = (m.meshes || []).filter((x) => x && typeof x.kind === "string" && x.kind.startsWith("__") && !x.position?.array);
                    p = Promise.all([bauAbdruck(m.meshes), sha(JSON.stringify(bei))]).then(([a, b]) => a.hash.slice(0, 32) + "+" + b.slice(0, 16));
                } else if (m.type === "settlement") p = sha(JSON.stringify(m.plan));
                else if (m.type === "blatt-atlas" && m.blattAtlas)
                    p = Promise.all(m.blattAtlas.rgba.mips.concat(m.blattAtlas.bc ? m.blattAtlas.bc.mips : []).map((s) => sha(s.data))).then((h) => sha(h.join()));
                if (!p) return;
                A.offen++;
                p.then((h) => (A.je[m.liefer.rest] = [h, m.platte ? "platte" : "werk"])).finally(() => A.offen--);
            });
        }
    };
}
// DAS URTEIL DES ABDRUCKS (rein) gegen den Lauf einer anderen Datei (`dort`: Rest → [Abdruck, Weg]): wie viele gemeinsame
// Lieferungen byte-anders sind (eine Zahl, kein Urteil: zwei Gesetze dürfen sich unterscheiden) — und DAS URTEIL: was HIER von
// der Platte kam, trägt die Bytes von dort. Der Lauf dort ist der frische Bau unter demselben Gesetz; ein Treffer der Platte mit
// anderen Bytes ist ein ALTES Ding unter neuem Gesetz, ROT beim Namen. `leser` (mit `--kern-wechsel`: die Reste, deren Marke
// den gewechselten Kern nennt): ein Treffer mit anderen Bytes, der den Kern NICHT las, kann nicht alt sein — sein Bau ist
// nicht byte-stabil (er hängt an der Folge seines Fadens), ROT beim eigenen Namen. Ohne gemeinsame Lieferung ROT (Lehre 6).
function abdruckUrteil(hier, dort, name, leser) {
    const gemein = Object.keys(hier || {}).filter((r) => dort && dort[r]);
    if (!gemein.length) return { gruen: false, zeile: `ABDRUCK gegen ${name}: keine Messung — keine gemeinsame Lieferung` };
    const anders = gemein.filter((r) => hier[r][0] !== dort[r][0]);
    const platte = gemein.filter((r) => hier[r][1] === "platte");
    const fremd = platte.filter((r) => hier[r][0] !== dort[r][0]);
    const [alt, lose] = [fremd.filter((r) => !leser || leser.has(r)), fremd.filter((r) => leser && !leser.has(r))];
    const kopf = `ABDRUCK gegen ${name}: ${anders.length} von ${gemein.length} Lieferungen byte-anders${anders.length ? ` (${anders.slice(0, 4).join(" · ")})` : ""}`;
    const stabil = lose.length ? ` · NICHT BYTE-STABIL: ${lose.length} Lieferungen der Platte, die den gewechselten Kern nie lasen, tragen andere Bytes als ihr frischer Bau — ${lose.slice(0, 6).join(" · ")} (der Bau hängt an der Folge seines Fadens)` : "";
    if (alt.length) return { gruen: false, anders, zeile: `ALT UNTER NEUEM GESETZ: ${alt.length} von ${platte.length} Lieferungen der Platte tragen andere Bytes als ihr frischer Bau — ${alt.slice(0, 6).join(" · ")} · ${kopf}${stabil}` };
    if (lose.length) return { gruen: false, anders, zeile: `${kopf} · kein altes Ding unter neuem Gesetz (von der Platte ${platte.length})${stabil}` };
    return { gruen: true, anders, zeile: `${kopf} · von der Platte ${platte.length}, jede trägt die Bytes ihres frischen Baus` };
}
// DAS URTEIL DES KERN-WECHSELS über die Listen [Art, Rest, Weg, Kerne] zweier Boots: `neu` sind die neu gebauten Leser
function wechselUrteil(vor, nach, kern) {
    const [trug, neu, fremd, alt] = [new Set(vor.filter((z) => z[2] === "platte").map((z) => z[1])), new Set(), [], []];
    for (const [, rest, weg, kerne] of nach) {
        const liest = kerne.split(",").includes(kern);
        if (weg === "platte" && liest && !neu.has(rest)) alt.push(rest);
        if (weg === "werk" || weg === "haupt") liest ? neu.add(rest) : trug.has(rest) && fremd.push(rest);
    }
    return {
        gruen: neu.size > 0 && !fremd.length && !alt.length,
        zeile: `KERN-WECHSEL ${kern}: ${neu.size} Leser neu · fremd ${fremd.length} ${fremd.slice(0, 6)} · alt ${alt.length} ${alt.slice(0, 6)}`,
    };
}
// DIE HALTER-ZEILEN (der Kalt-Lauf): die Tafel, die Spur — wie viele Proben unter „(Knoten verloren)" zählen,
// ein verlorener ProfileChunk steht laut (`profilLesen`, über 5 % sind die Halter ROT ohne Namen) — und DIE HALTER-LINSE
// (Hänger-Familie, Selbsttest `werkbank takt --selbsttest`): ROT beim Namen jeder Funktion, die vor dem ersten Bild den
// Haupt-Faden ≥ ANKUNFT_HALT_MS hält (blind ohne Marken ist sie ROT)
const halterZeilen = (a) =>
    `${HL.ankunftsHalterTafel(a)}\n  die Spur: ${a.verlust?.satz || "ohne Proben"}\n` +
    `  ${a.befunde.length ? "❌" : "✅"} DIE HALTER bis zur Kontrolle: ${a.befunde.slice(0, 6).join(" · ") || "keiner"}`;

// ── DIE KALT-ZEILE (`--kalt`): die Probe je 200 ms in der Seite, ab dem ersten Skript ──
// Die Haupt-Thread-Zeit je Sekunde der schweren Ankunfts-Arbeiter liest die Spur (`ankunftsHalter`, Klassen über die Namen der
// Rahmen; verschachtelt zählt doppelt, nur in der Klasse Pflanzen der Äußere). Bis w4-ankunft wickelte die Probe diese
// Methoden am Prototyp (zwei Uhr-Rufe je Ruf): die Gestalt des Orts läuft je Takt tausendfach, die Hülle allein trug headless
// kalt 2,7–4,0 s Selbstzeit vor dem Bild (`P.<computed>`) — das Instrument maß sich selbst mit.
const KALT_KLASSEN = {
    // DIE KLASSE BODEN (B, w4-b-boden2): was der Boden im Haupt-Faden trägt — der Bau, der Einbau samt Anlegen im Satz und
    // Eintritt in den Faden, die Nähte aus dem Faden (`_tickMorphFolge`)
    _buildVoxelChunkDataFromWorkerMesh: "Boden",
    _buildVoxelChunkData: "Boden",
    _finalizeVoxelChunkBuild: "Boden",
    _tickMorphFolge: "Boden",
    _scatterRegion: "Streu",
    _rebuildArchitectureMesh: "Bauten",
    _foundryBuildGroup: "Gruppen-Bau",
    _foundryIngestBook: "Buch",
    _spawnSettlementSlot: "Dorf",
    // DIE KLASSE PFLANZEN (B): die Saat der Chunks, der Plan des Walds, die Gestalt des Orts — in der Familie zählt der
    // Äußere (die Gestalt in der Streu ist Streu), ihre Summe bis zum Bild steht in der Klassen-Zeile
    _tickSaat: "Saat",
    _forestPlantChunk: "Saat",
    _tickWaldPlan: "Wald-Plan",
    _ortGestaltSame: "Gestalt",
    // DER KNOTEN-BAU (w16-lade-atem): am Stück (r184 `getNodeBuilderState`, Bühnen und Einmal-Renders) und in Raten (`_knotenRate`,
    // die Welt-Szene auch unter dem Ladeschirm) — bis hier zählte ihn ein zweites Instrument, der Zähler `_erstZeichnung.bauMs`
    // der Probe, der die Raten nie sah
    getNodeBuilderState: "Knoten-Bau",
    _knotenRate: "Knoten-Bau",
    // die Teile des Takts (Post 06.11. 18:15: wohin geht die Belegung bis zur Kontrolle?) — das Bild, die Jobs, der Himmel
    _loopRender: "Bild",
    _runFrameScheduler: "Jobs",
    tickDayNight: "Himmel",
    // die zwei Schnitte von w27-ankunft-faden beim Namen: der Leib im Fix-Schritt (die Spalte einmal) und die Wiese mit ihrer
    // Ferne (die Zelle über dem Anteil), diese als Teil der Jobs
    _loopFixedStep: "Physik",
    _tickNahWiese: "Wiese",
};
const KALT_PFLANZEN = ["Streu", "Saat", "Wald-Plan", "Gestalt"];
function KALT_PROBE() {
    // `marken`: die Seiten-Uhr jeder Marke `anazh-kalt` — die Spur trägt sie auf ihrer Uhr (der Versatz legt die Proben an)
    const A = (window.__kalt = { proben: [], lang: [], marken: [] });
    new PerformanceObserver((l) => {
        for (const e of l.getEntries()) A.lang.push([Math.round(e.startTime), Math.round(e.duration)]);
    }).observe({ type: "longtask", buffered: true });
    // WANN der Vorrat wartet und bestellt, sagt sein Merker (`f._vorrat`, je Sekunde unten); dass er erst nach dem ersten Bild
    // bestellt, urteilt gate:ankunft L2a — die Kalt-Zeile zählt nur noch die Arbeit vor dem Bild
    setInterval(() => {
        const o = { t: Math.round(performance.now()) };
        A.marken.push(performance.mark("anazh-kalt").startTime);
        if (r?.state) {
            if (!A.buchDa && r._foundry?.ready && r._foundry.recipes) A.buchDa = o.t;
            // das Bruch-Buch am ersten Weltbild (die erste Probe nach ihm): jeder Eintrag des EINEN Melders bis dahin [Text, Zahl]
            if (!A.bruch && r.state._weltbildDa) A.bruch = [...(r._bruchBuch || [])].map(([t, e]) => [t, e.n]);
            try {
                const L = r._weltbildLuecken();
                o.fehlt = L.map((l) => l.satz);
                o.terme = L.map((l) => l.term);
            } catch (e) {
                o.fehlt = ["Probe warf: " + e.message];
            }
            // der Ring (der Boden um den Spieler bis zu seinem Ziel) und das erste gezeichnete Lade-Bild
            const st = r.state;
            o.ring = [st._activeRingRadius, st.chunkRingRadius];
            o.bilder = r._gpuLeine ? r._gpuLeine.gerendert : 0;
            const f = r._foundry;
            if (f) {
                o.vorrat = f._vorrat || null; // die Phase wörtlich (VORRAT_PHASE), null = steht nicht an oder ist durch
                o.schlange = `${(f.warte || []).length} wartend · ${f.pending.size} im Werk`; // der Bäcker fiel mit S2
            }
        }
        A.proben.push(o);
    }, 200);
}

// (Seite) DAS BILD IST GEZEICHNET — die Zählung von außen, je Bild: jeder Ruf der Erst-Zeichnung (`_renderObjectDirect`) der
// Welt-Szene mit Zug-Parametern gegen jeden Zug des Backends, getrennt nach Hauptbild und Wurf (jede andere Kamera). Ein Bündel,
// das ohne einen Bürger versiegelte, spielt ohne Ruf ab: seine Fehlenden gelten in jedem Bild, in dem es läuft, bis es neu
// aufnimmt. `amBild`: der Stand im Task des ersten Weltbilds [ms, Hauptbild, Wurf]; `ganz`: das erste Bild ab dort ohne Fehlende.
function BILD_PROBE() {
    const B = (window.__bildProbe = { amBild: null, ganz: null, bilder: 0, fehler: "" });
    const wer = (o, m) => {
        const glieder = o.isGeometrieArena && Array.isArray(o.glieder) ? o.glieder : null;
        const n = glieder
            ? glieder.slice(0, 3).map((g) => g.userData?.archInstanceKey || g.name || g.type).join(", ") + (glieder.length > 3 ? ` und ${glieder.length - 3} weitere` : "")
            : o.name || o.userData?.inventar || o.userData?.archInstanceKey || o.type;
        return `${n} (${m?.name || m?.type}_${m?.id})`;
    };
    let [versucht, gezogen, gelaufen, jetzt] = [new Map(), new Set(), new Set(), { haupt: [], wurf: [] }];
    const jeBuendel = new WeakMap();
    __weltDa((w) => w.state.rendererReady).then((r) => {
        const [rend, P] = [r.state.renderer, Object.getPrototypeOf(r)];
        if (rend._isHeadlessNull || typeof rend._renderObjectDirect !== "function") return (B.fehler = "kein Renderer mit Erst-Zeichnung");
        const art = (kam) => (kam === r.state.camera ? "haupt" : "wurf");
        const [R0, D0, N0, K0, W0] = [rend._renderObjectDirect, rend.backend.draw, rend._renderBundle, P._kontaktPassZeichne, P._weltbildSteht];
        rend._renderObjectDirect = function (object, material, scene, camera, lightsNode, group, clip, passId) {
            const aus = R0.call(this, object, material, scene, camera, lightsNode, group, clip, passId);
            // ein Gast des Vorbaus will nichts zeichnen, er baut nur (der Gast der Ankunft steht schon unter dem Ladeschirm) — Gast ist nur,
            // wer die Prägung trägt UND keinen Raum nimmt (Maßstab 0): ein Bürger mit Prägung zählt als Bürger
            if (scene === r.state.scene && !(object.__vorbauGast && object.matrixWorld.determinant() === 0) && this._objects.get(object, material, scene, camera, lightsNode, this._currentRenderContext, clip, passId).getDrawParameters() !== null)
                versucht.set(object.id + "|" + art(camera), [wer(object, object.material), art(camera), this._currentRenderBundle || null]);
            return aus;
        };
        rend.backend.draw = function (ro, info) {
            gezogen.add(ro.object.id + "|" + art(ro.camera));
            return D0.call(this, ro, info);
        };
        rend._renderBundle = function (bundle, sceneRef, lightsNode) {
            const rb = this._bundles.get(bundle.bundleGroup, bundle.camera, this._currentRenderContext);
            const daten = this.backend.get(rb);
            if (!(daten.bundleGPU !== undefined && bundle.bundleGroup.version === daten.version)) jeBuendel.set(rb, new Map());
            gelaufen.add(rb);
            return N0.call(this, bundle, sceneRef, lightsNode);
        };
        // das Ende jedes Bilds (hinter dem Render desselben Tasks, vor dem Urteil `_ankunftsBild`)
        P._kontaktPassZeichne = function (direkt) {
            const aus = K0.call(this, direkt);
            const fehlt = { haupt: [], wurf: [] };
            for (const [k, [name, a, rb]] of versucht) {
                const zog = gezogen.has(k);
                const m = rb && jeBuendel.get(rb);
                if (m) zog ? m.delete(k) : m.set(k, [name, a]);
                else if (!zog) fehlt[a].push(name);
            }
            for (const rb of gelaufen) for (const [name, a] of (jeBuendel.get(rb) || new Map()).values()) fehlt[a].push(name);
            if (B.amBild && B.ganz == null && !fehlt.haupt.length && !fehlt.wurf.length) B.ganz = Math.round(performance.now());
            [jetzt, versucht, gezogen, gelaufen] = [fehlt, new Map(), new Set(), new Set()];
            B.bilder++;
            return aus;
        };
        P._weltbildSteht = function () {
            const aus = W0.call(this);
            B.amBild = [Math.round(performance.now()), jetzt.haupt.slice().sort(), jetzt.wurf.slice().sort()];
            if (!jetzt.haupt.length && !jetzt.wurf.length) B.ganz = B.amBild[0];
            return aus;
        };
    });
}
// DAS URTEIL (rein): im Bild des ersten Weltbilds zeichnete jeder Bürger der Welt-Szene, der zeichnen wollte — sonst ROT beim
// Namen, im Hauptbild wie im Wurf. Ohne Messung ROT (eine Sonde ohne Messung ist nie grün, Lehre 6).
function gezeichnetUrteil(B) {
    if (!B || !B.amBild) return { gruen: false, zeile: `AM BILD GEZEICHNET: keine Messung — die Probe sah das erste Weltbild nicht${B?.fehler ? ` (${B.fehler})` : ""}` };
    const [t, haupt, wurf] = B.amBild;
    const namen = [...new Set(haupt.concat(wurf.map((n) => `${n} im Wurf`)))];
    if (!namen.length) return { gruen: true, zeile: `AM BILD GEZEICHNET: jeder Bürger des ersten Weltbilds zeichnete (${B.bilder} Bilder gezählt)` };
    const spaet = B.ganz != null ? `${B.ganz - t} ms nach ihm` : "nicht bis zur Kontrolle";
    return { gruen: false, zeile: `Weltbild steht, ${namen.slice(0, 6).join(" · ")}${namen.length > 6 ? ` und ${namen.length - 6} weitere` : ""} nicht gezeichnet — das ganze Bild kam ${spaet} (\`_bildWartet\`, der Term „zeichnung“)` };
}

// DIE ANKUNFT BRICHT NICHT (rein, w28-loop-vor-init): das Bruch-Buch des EINEN Melders (`_bruchMelden`) ist am ersten Weltbild
// leer — sonst ROT beim Wort JEDES Eintrags, nie nur zweier Wörter. Ohne Messung ROT (Lehre 6).
function bruchUrteil(liste) {
    if (!Array.isArray(liste)) return { gruen: false, zeile: "DIE ANKUNFT BRICHT NICHT: keine Messung — die Probe las das Bruch-Buch am ersten Weltbild nicht" };
    if (!liste.length) return { gruen: true, zeile: "DIE ANKUNFT BRICHT NICHT: das Bruch-Buch ist am ersten Weltbild leer" };
    const namen = liste.slice(0, 4).map(([t, n]) => `${n > 1 ? `${n}× ` : ""}${String(t).slice(0, 170)}`);
    return { gruen: false, zeile: `Weltbild steht, die Ankunft brach ${liste.length}-mal beim Namen: ${namen.join(" ‖ ")}${liste.length > 4 ? ` und ${liste.length - 4} weitere` : ""} (\`_bruchMelden\`, das Bruch-Buch)` };
}

async function kaltLauf() {
    const ECHT = ARGV.includes("--echt");
    // ohne `--echt` die EINE Weiche (K40: lokal der Hardware-Adapter, die CI swiftshader, `LINSE_GPU=software` der Rückweg),
    // und der Lauf nennt seinen Adapter, damit keine Kalt-Zeile ein swiftshader-Ergebnis als Radeon ausgibt
    await server.lausche(PORT);
    // DIE ZWEIT-ZEILE (1310-16): `--profil <ordner>` hält das Profil (die Foundry-Platte, der HTTP-Cache) über den Lauf hinaus —
    // der erste Lauf in einem neuen Ordner ist kalt, jeder weitere ein Zweit-Boot; ohne die Option das leere Scratch-Profil des
    // EINEN Starters (welt-boot `startePuppeteer`: es stirbt mit dem Browser, auch beim Abbruch).
    // Mit ihr wartet die Zeile auf die Ruhe der Foundry: der Erst-Boot füllt die Platte ganz, der Zweit-Boot zählt jede Lieferung.
    const profilBenannt = OPT("--profil");
    const zweit = !!(profilBenannt && fs.existsSync(profilBenannt));
    const profil = profilBenannt && path.resolve(profilBenannt);
    if (profil) fs.mkdirSync(profil, { recursive: true });
    const browser = await starteBrowser({
        art: ECHT ? "echt" : "linse",
        headless: !ECHT,
        profil,
        frist: 600000,
        viewport: ECHT ? { width: 1920, height: 1080, deviceScaleFactor: 1 } : { width: 1280, height: 720 },
        zusatz: ECHT ? ["--window-size=1940,1200"] : [],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(KALT_PROBE);
    await page.evaluateOnNewDocument(BILD_PROBE);
    await page.evaluateOnNewDocument(PROGRAMM_PROBE);
    if (ARGV.includes("--abdruck")) await page.evaluateOnNewDocument(`(${ABDRUCK_PROBE})(${require("./lib/asset-worker-harness.cjs").bauAbdruck})`);
    // DIE MUTANTE (`--mutante eigenmeldung`, das Schlupfloch von ankunft K1): die Eigenmeldung steht ab dem Erwachen — die
    // Kontrolle von außen folgt ihr nie; `--mutante bild`: der erste Schuss endet nach 20 m, die Welt dahinter fehlt (ROT)
    const MUT = OPT("--mutante");
    if (MUT === "eigenmeldung")
        await page.evaluateOnNewDocument(() =>
            __weltDa().then((r) => (r.state._weltbildDa = performance.now()))
        );
    // `--mutante bruch`: ein Bruch des EINEN Melders vor dem Bild — die Zeile „die Ankunft brach" nennt ihn (ROT)
    if (MUT === "bruch")
        await page.evaluateOnNewDocument(() =>
            __weltDa().then((r) => r._bruchMelden("STOFF: der gepflanzte Bruch der Ankunft (Mutante) — vor dem ersten Weltbild"))
        );
    // DER GPU-PROZESS HÄLT DIE KONTROLLE NICHT (w25-ankunft-block): jede Pipeline, die nach dem Bild bis zur Kontrolle synchron
    // entsteht, ist ROT beim Namen (der Haken der Hänger-Familie, `haengerAn`; `nachBild`) — Radeon kalt baute der Spiegel 0,4 s
    // nach dem Bild seine Pipeline synchron, der rAF stand 1,3–2,2 s. Der Selbsttest pflanzt eine synchrone Pipeline nach dem Bild.
    await page.evaluateOnNewDocument(HL.HAENGER_INSTALL + ";__weltDa((w) => w.state.rendererReady).then(() => (__haengerAn().an = true))");
    // DIE SPUR DER ANKUNFT (B): die CPU-Stichproben jedes Fadens ab der Navigation (die EINE Spur der Hänger-Linse,
    // `spurProfil`), die Marken der Probe legen sie auf die Seiten-Uhr — sie endet mit der Kontrolle
    const cdp = await page.target().createCDPSession();
    const ev = [];
    cdp.on("Tracing.dataCollected", (e) => e.value.forEach((x) => ev.push(x)));
    await cdp.send("Tracing.start", {
        traceConfig: { includedCategories: ["blink.user_timing", "disabled-by-default-v8.cpu_profiler"] },
    });
    const t0 = Date.now();
    // das Holz wählt die Seite selbst (swiftshader → kienspan)
    await server.zeige(page, 120000, "index.html");
    // DIE KONTROLLE VON AUSSEN (ankunft K1–K3, nie die Eigenmeldung `_weltbildDa`): der Spieler hält W über das Protokoll des
    // Browsers; je Atem schickt er den Druck neu (Autorepeat — der Ladeschirm hält jede Taste, die erste nach ihm gilt), bis
    // die Taste den Leib um ≥ KONTROLLE_M trägt: t ist die Prozess-Uhr ab Navigation, als der Weg gesehen wurde.
    let [tK, druecke] = [0, 0];
    for (; !tK && druecke++ < KONTROLLE_DRUECKE; await page.keyboard.down("KeyW"))
        if (await page.evaluate(LEIB_WEG, KONTROLLE_M)) tK = Date.now() - t0;
    await page.keyboard.up("KeyW");
    const spurDa = new Promise((f) => cdp.once("Tracing.tracingComplete", f));
    await cdp.send("Tracing.end");
    await spurDa;
    // DAS BILD DER KONTROLLE (`--bild datei.png`, ankunft K2): der Schuss bei t(Kontrolle) aus dem Ausgabe-Pfad
    // (scripts/lib/ausgabe-aufnahme.cjs) und derselbe nach RUHE_MS Ruhe (der Loop läuft), daneben `<datei>-ruhe.png`; dazu der
    // offene Bedarf im Bild in dem Moment (`_weltbildLuecken`, im Blick)
    const offen = tK ? await page.evaluate(() => r._weltbildFehlt()) : [];
    const bildDatei = OPT("--bild");
    let bild = null;
    if (tK && bildDatei) {
        const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
        await page.evaluate(AUSGABE_INSTALL);
        const schuss = async (mut, datei) => {
            const s = await page.evaluate(SCHUSS, ECHT ? 960 : 640, ECHT ? 540 : 360, mut);
            pngDatei(datei, s.png);
            return Object.assign(s, { png: datei });
        };
        const a = await schuss(MUT === "bild", path.resolve(bildDatei));
        // die Ruhe streamt, nie geht: Tiere, Bewohner, Wagen und der Leib stehen (`__halten`), sonst hieße jeder Schritt eine Lücke
        await page.evaluate(() => __halten(["tiere", "bewohner", "wagen", "leib"]));
        await sleep(RUHE_MS);
        const b = await schuss(false, path.resolve(bildDatei).replace(/(\.png)?$/, "-ruhe.png"));
        bild = Object.assign(b, { a }, lueckeKacheln(...[a.png, b.png].map((f) => require("./lib/abnahme-urteil.cjs").pngLesen(fs.readFileSync(f)))));
    }
    if (tK && profilBenannt) await page.evaluate(RUHE);
    // der Abdruck steht, wenn die Foundry ruht und kein Fingerabdruck mehr rechnet
    const abdruck = ARGV.includes("--abdruck") ? await page.evaluate(async () => (await window.__gebautNach("die Fingerabdrücke", { fertig: () => !window.__lieferAbdruck.offen, max: 600 }), window.__lieferAbdruck.je)) : null; // prettier-ignore
    const out = await page.evaluate((r = window.anazhRealm, st = r.state) => {
        // der Adapter vom Gerät, das zeichnet: r184 hält den Adapter nicht (WebGPUBackend.init, lokal)
        let adapter = null;
        try {
            const i = st.renderer.backend.device.adapterInfo;
            adapter = [i.vendor, i.architecture, i.device, i.description].filter(Boolean).join(" ") || null;
        } catch {}
        // das Laden der Seite (Navigation und Ressourcen, Seiten-Uhr): HTML da, die Skripte da, DOM bereit
        const nav = performance.getEntriesByType("navigation")[0] || {};
        const skripte = performance.getEntriesByType("resource").filter((e) => e.initiatorType === "script");
        return Object.assign({}, window.__kalt, {
            laden: {
                html: Math.round(nav.responseEnd || 0),
                skripte: Math.round(Math.max(0, ...skripte.map((e) => e.responseEnd))),
                dom: Math.round(nav.domContentLoadedEventEnd || 0),
            },
            weltbildDa: Math.round(st._weltbildDa),
            holz: st._holzProfil || null,
            version: r.constructor.VERSION,
            adapter,
            ohne: (st.logBuffer || []).filter((z) => /Das erste Weltbild steht ohne/.test(z)),
            sync: __haengerH.namen.filter((e) => e.art === "sync"),
            lieferung: r._foundry.lieferung,
            bildProbe: window.__bildProbe,
            programme: window.__programmProbe ? window.__programmProbe.liste : null,
        });
    });
    const liste = path.join(browser.profil || profil, "lieferung.json");
    // ohne Liste davor (ein leeres Profil: der frische Bau unter dem gewechselten Kern) urteilt der Wechsel nicht
    const wechsel = KERN && fs.existsSync(liste) && wechselUrteil(jsonLesen(liste), out.lieferung.liste, KERN.id);
    if (profilBenannt && !KERN) fs.writeFileSync(liste, JSON.stringify(out.lieferung.liste));
    // DIE PROGRAMM-ZEILE (ankunft K3): das Profil trägt die Text-Paare JEDES Boots davor (was der Pipeline-Cache kennen kann);
    // die Wiederkehr urteilt gegen sie, dann legt der Lauf seine dazu. Ein Kern-Wechsel ändert Programme mit Recht: er legt nicht ab.
    const pDatei = path.join(browser.profil || profil, "programme.json");
    const pVor = zweit && fs.existsSync(pDatei) ? jsonLesen(pDatei) : null;
    const programm = profilBenannt ? programmUrteil(pVor, out.programme, zweit) : null;
    if (profilBenannt && !KERN && Array.isArray(out.programme))
        fs.writeFileSync(pDatei, JSON.stringify([...new Set((pVor || []).concat(out.programme.map(([, v, f]) => `${v}|${f}`)))]));
    Object.assign(out, { tK, druecke, offen, bild, zweit, abdruck });
    const leserK = KERN ? new Set(out.lieferung.liste.filter((z) => z[3].split(",").includes(KERN.id)).map((z) => z[1])) : null;
    const gegen = OPT("--gegen") && abdruckUrteil(abdruck, jsonLesen(path.resolve(OPT("--gegen"))).abdruck, path.basename(OPT("--gegen")), leserK);
    await browser.close();
    server.close();
    // DIE PHASEN der Ankunft (Seiten-Uhr): das Laden (HTML, Skripte, DOM), das Buch, je Term des ersten Weltbilds sein Schluss
    // (die erste Probe nach seiner letzten), der Ring an seinem Ziel, das erste Lade-Bild, das Weltbild, die Kontrolle
    const P0 = out.proben.filter((p) => p.t <= out.weltbildDa);
    const meilensteine = {
        "HTML da": out.laden.html,
        "Skripte da": out.laden.skripte,
        "DOM bereit": out.laden.dom,
        "Buch da": out.buchDa,
    };
    for (const term of new Set(P0.flatMap((p) => p.terme || []))) {
        const letzte = P0.findLastIndex((p) => (p.terme || []).includes(term));
        meilensteine[`${term} steht`] = (P0[letzte + 1] || { t: out.weltbildDa }).t;
    }
    meilensteine["Ring am Ziel"] = (out.proben.find((p) => p.ring && p.ring[0] >= p.ring[1]) || {}).t;
    meilensteine["erstes Lade-Bild"] = (out.proben.find((p) => p.bilder > 0) || {}).t;
    Object.assign(meilensteine, { Weltbild: out.weltbildDa, Kontrolle: tK || undefined });
    // DIE HALTER (Hänger-Familie, `ankunftsHalter`): jede Aufgabe ≥ 50 ms vor dem Bild mit ihren Funktionen beim Namen
    // `--spur datei`: die Spur des Haupt-Fadens (Profil + Marken) und die Seite dazu
    const spur = HL.spurProfil(ev, "anazh-kalt");
    const seite = {
        lang: out.lang,
        marken: out.marken,
        // DAS FENSTER DER HALTER ist das der Station (ankunft.K5, w27-ankunft-erstbild): bis zur Kontrolle (die Uhr ab Navigation),
        // nie nur bis zum Bild — jede Aufgabe ≥ 50 ms davor beim Namen (headless kalt main da0e790f: die längste 704 ms)
        bis: tK || out.weltbildDa,
        meilensteine,
        klassen: KALT_KLASSEN,
        familie: KALT_PFLANZEN,
    };
    if (OPT("--spur") && spur)
        fs.writeFileSync(OPT("--spur"), JSON.stringify({ spur, seite }));
    out.halter = HL.ankunftsHalter(spur, seite);
    [out.kosten, out.vorBild] = [out.halter.kosten, out.halter.vorBild];
    delete out.marken;
    const json = OPT("--json");
    if (json) jsonSchreiben(json, out);
    // je Sekunde: der Stand am Ende der Sekunde (die letzte Probe) und die blockierten ms des Haupt-Threads
    const S = Math.ceil((tK || out.weltbildDa) / 1000);
    const blockiert = new Array(S + 1).fill(0);
    for (const [s, d] of out.lang)
        for (let a = s, b, k; a < s + d; a = b) {
            k = Math.floor(a / 1000);
            b = Math.min(s + d, (k + 1) * 1000);
            if (k <= S) blockiert[k] += b - a;
        }
    console.log(
        `\n=== DIE ${zweit ? "ZWEIT-ZEILE (Profil mit Platte)" : "KALT-ZEILE (leeres Profil)"} — ${ECHT ? "echte GPU" : "swiftshader"} · ${out.adapter || "Adapter ?"} · ` +
            `Holz ${out.holz} · V${out.version} ===`
    );
    for (let s = 0; s < S; s++) {
        const q = out.proben.filter((p) => p.t < (s + 1) * 1000).pop() || {};
        const gruende = tK && tK < (s + 1) * 1000 ? "— die Kontrolle" : (q.fehlt || ["die Seite lädt"]).join(" · ");
        const kosten = Object.entries(out.kosten)
            .map(([k, z]) => [k, Math.round(z[s] || 0)])
            .filter(([, ms]) => ms >= 5)
            .map((z) => z.join(" "))
            .join(" · ");
        console.log(
            `  ${String(s).padStart(3)} s  blockiert ${String(Math.round(blockiert[s])).padStart(4)} ms` +
                (kosten ? ` (${kosten})` : "") +
                `${q.vorrat ? ` · Vorrat ${q.vorrat}` : ""}` +
                `${q.schlange ? ` · Foundry ${q.schlange}` : ""} | ${gruende}`
        );
    }
    if (out.buchDa) console.log(`  ${(out.buchDa / 1000).toFixed(1)} s  das Buch der Studios ist da`);
    const kl = Object.entries(out.vorBild);
    if (kl.length)
        console.log(
            `  die Klasse Pflanzen bis zur Kontrolle: ${Math.round(kl.reduce((a, [, ms]) => a + ms, 0))} ms Haupt-Faden (` +
                kl.map(([k, ms]) => `${k} ${Math.round(ms)}`).join(" · ") +
                ")"
        );
    console.log(halterZeilen(out.halter));
    const halter = out.halter.befunde;
    const halb = out.ohne[0];
    const gut = tK > 0 && tK <= ANKUNFT_SOLL_MS && !halb;
    if (halb) console.log(`  ❌ das halbe Weltbild: ${halb}`);
    console.log(
        `\n  ${gut ? "✅" : "❌"} t(Kontrolle) ${zweit ? "warm" : "kalt"} ${tK ? (tK / 1000).toFixed(2) + " s" : "—"} von außen ` +
            `(Soll ≤ ${ANKUNFT_SOLL_MS / 1000} s; W trug den Leib im Atem ${tK ? druecke : "nie"}) · Eigenmeldung ${(out.weltbildDa / 1000).toFixed(2)} s`
    );
    const ganz = !bild || (bild.luecke <= LUECKE_SOLL && !offen.length);
    if (bild)
        console.log(
            `  ${ganz ? "✅" : "❌"} das Bild der Kontrolle: ${(100 * bild.luecke).toFixed(2)} % Lücke in Kachel ${bild.kachel} nach ${RUHE_MS / 1000} s ` +
                `(Soll je Kachel ≤ ${100 * LUECKE_SOLL} %, Bildmittel ${(100 * bild.mittel).toFixed(2)} %, ${bild.a.png}) · offen im Bild: ${offen.join(" · ") || "nichts"}`
        );
    // DIE LIEFER-ZEILE (pipeline.K4 Stufe 1): am Zweit-Boot urteilt sie (und trägt den Exit, unten)
    const k4 = lieferUrteil(out.lieferung, zweit);
    console.log(`  ${zweit ? (k4.gruen ? "✅ " : "❌ ") : ""}${k4.zeile}`);
    console.log(`  ${zweit ? (k4.artGruen ? "✅ " : "❌ ") : ""}${k4.artZeile}`);
    if (wechsel) console.log(`  ${wechsel.gruen ? "✅" : "❌"} ${wechsel.zeile}`);
    if (gegen) console.log(`  ${gegen.gruen ? "✅" : "❌"} ${gegen.zeile}`);
    // DIE PROGRAMM-ZEILE: am Zweit-Boot urteilt sie (und trägt den Exit, unten — wie die Liefer-Zeile)
    if (programm) console.log(`  ${zweit ? (programm.gruen ? "✅ " : "❌ ") : ""}${programm.zeile}`);
    const nach = nachBild(out.sync, out.weltbildDa);
    console.log(`  ${nach.length ? "❌" : "✅"} synchron nach dem Bild: ${nach.join(" · ") || "keine Pipeline"}`);
    const gez = gezeichnetUrteil(out.bildProbe);
    console.log(`  ${gez.gruen ? "✅" : "❌"} ${gez.zeile}`);
    // jeder Eintrag des Bruch-Buchs geht in den EINEN Sammler (welt-boot `bruchBuch`): ROT am Prozess-Ende wie ein Wurf
    bruchBuch(out.bruch, "vor dem ersten Weltbild");
    const bru = bruchUrteil(out.bruch);
    console.log(`  ${bru.gruen ? "✅" : "❌"} ${bru.zeile}`);
    // jede ❌-Zeile oben ist Urteil (w28-probe-urteil, Lehre 6): die Liefer-Zeilen am Zweit-Boot und der Wechsel des Kerns tragen den
    // Exit mit — bis dahin „Exit bleibt die Ankunft“, ❌ über Exit 0; die Programm-Zeile ebenso (w28-ankunft-reihe)
    const liefer = !zweit || (k4.gruen && k4.artGruen && (!programm || programm.gruen));
    process.exit(gut && ganz && !halter.length && !nach.length && gez.gruen && bru.gruen && liefer && (!wechsel || wechsel.gruen) && (!gegen || gegen.gruen) ? 0 : 1);
}

hauptLauf(async () => {
    if (ARGV.includes("--kalt")) return kaltLauf();
    const { browser, page } = await nullWelt(server, { port: PORT, frist: 300000, vor: SELBSTTEST && SCHLUCK }, 120000, "index.html", "networkidle0");
    // das erste Weltbild (der Null-Renderer setzt es beim Renderer-Bau; eine Zeit trägt nur die Kalt-Zeile, von außen) UND das Buch
    // der Studios (`_foundryBuchOffen`): sein Faden bootet in Wanduhr, kein Takt bringt ihn — die Pumpe beginnt nach seinem Ereignis
    // wann es kam, nennt die Zeile (über die Zeit urteilt die Kalt-Zeile, nie dieses Prädikat)
    await page.evaluate(() => __weltDa((r) => r.state._weltbildDa));
    const tBild = Date.now();
    await page.evaluate(() => __weltDa((r) => !r._foundryBuchOffen()));
    const buchS = ((Date.now() - tBild) / 1000).toFixed(1);
    const out = await page.evaluate(async (selftest, r = window.anazhRealm, st = r.state) => {
        const o = { stage: 0 };
        // ── DER INIT BAUT NICHTS VERBORGENES (ankunft.K5, w16-lade-atem) — am ersten Weltbild, bevor eine Tafel sich zeigte und
        // bevor der Vorbau der Bedienung lief (der Null-Renderer baut ihn nie): leer sind Rezeptbuch (inventoryInitDOM), Werkstatt-
        // Liste (_renderWorkshopDOM) und Bibliothek (libraryInitDOM), und die Mammut-Art (sie liest kein Wurf des Felds) wartet noch
        // auf ihren ersten Leser (_defaultBlueprints). Jeder Täter beim Namen seiner Tafel; fehlt eine, wirft die Linse laut.
        o.verborgen = ["inventory-recipes", "workshop-list", "library-list"].filter((id) => document.getElementById(id).childElementCount);
        if (!Object.getOwnPropertyDescriptor(st.blueprints.baum_mammut, "parts").get) o.verborgen.push("baum_mammut");
        const headless = !!st.renderer?._isHeadlessNull;
        // ── DAS PRÄDIKAT (jeder Term aus der kanonischen Quelle) ──
        const terms = () => {
            const f = r._foundry;
            const ringTarget = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
            const q = r._impostorBakeQueue;
            return {
                ring: st._activeRingRadius != null && st._activeRingRadius >= ringTarget,
                grass: !st.pendingGrass || st.pendingGrass.size === 0,
                water: !st.pendingWaterIso || st.pendingWaterIso.size === 0,
                // die EINE Antwort der Welt (`_streuWartet`): fehlend · aufgeschoben · Scheibe offen, je Region in Reichweite
                streu: !!st.playerMesh && r._streuWartet(st.playerMesh.position) === 0,
                biblio: !!(f?.ready && !f._vorrat),
                // Headless no-opt der RTT-Bake (gate-treu) → Term übersprungen, ehrlich markiert.
                impost: headless ? true : !q || q.length === 0,
                luft: !!st.scene?.fogNode && sichtM() >= 5000,
            };
        };
        const sichtM = () => (st.luft ? r._luftSichtM(st.playerMesh ? st.playerMesh.position.y : 0) : -1);
        // ── PUMPEN, bis das Prädikat schließt (jeder Term steht; in Takten) — am EINEN Deckel (welt-boot `__deckel`): er zählt
        // einen Takt nur, wenn die Welt nichts mehr offen hat (`_weltOffen`), und bricht nach 6000 solchen beim Namen; wartet sie
        // auf einen Faden, atmet jeder Takt (die Antwort landet zwischen zwei Takten), sonst jeder fünfte. Ein Wurf des Takts
        // bricht beim Namen. Bis w27-foundry-halter zählte die Pumpe JEDEN Takt (6000 ≈ 17,5 s an der GTX 1050) gegen den Faden
        // des Buchs, der dort 9–25 s später steht, und schluckte jeden Wurf: 7 von 12 Läufen ROT ohne Täter im Spiel.
        try {
            for (let t = 1, weiter = __deckel("die volle Bühne", 6000); !o.stage && weiter(); t++) {
                r._gameLoopTick();
                o.terms = terms();
                if (Object.values(o.terms).every(Boolean)) o.stage = t;
                else if (t % 5 === 0 || Object.values(r._weltOffen()).some(Boolean)) await sleep(0);
            }
        } catch (e) {
            [o.bruch, o.terms] = [String((e && e.message) || e).slice(0, 500), terms()];
        }
        o.terms._streuWartet = r._streuWartet(st.playerMesh ? st.playerMesh.position : null);
        Object.assign(o, {
            headless,
            sichtM: Math.round(sichtM()),
            chunks: st.voxelChunks ? st.voxelChunks.size : 0,
            impostorRecords: r._kartenAtlas ? r._kartenAtlas.zellen.size : 0,
        });
        if (selftest && o.stage) {
            const map = st.scatterRegions;
            // die Bühnen-Wahrheit der Welt (`_buehneSteht`, das Prädikat live) liest dieselbe Antwort: ohne Regionen-Karte
            // steht sie nicht, mit ihr steht sie — nicht-headless gerechnet; Latch, Uhr und Renderer-Marke kehren zurück
            const merk = [st.renderer._isHeadlessNull, st._buehneStand, r._buehneT0];
                const frag = (ohneKarte, gedeckelt) => {
                    // die Uhr beginnt in `_buehneSteht` neu — oder sie steht weit hinter dem Deckel
                    [st.renderer._isHeadlessNull, st._buehneStand, r._buehneT0] = [false, false, gedeckelt ? -Infinity : null];
                    if (ohneKarte) delete st.scatterRegions;
                    const steht = r._buehneSteht();
                    st.scatterRegions = map;
                    return steht;
                };
                const t = (o.selftest = { buehneOhneKarte: frag(true), buehneMitKarte: frag(false) });
                // der Deckel öffnet LAUT: ohne Regionen-Karte und hinter BUEHNE_SETTLE_CAP_MS steht die Bühne, und das Log
                // nennt die Lücke (WARN „Die Bühne steht ohne: … Wald-Stücke …")
                const warnt = () => st.logBuffer.slice(-30).filter((z) => /Bühne steht ohne: .*Wald-Stücke/.test(z)).length;
                const w0 = warnt();
                t.deckelSteht = frag(true, true);
                t.deckelWarnt = warnt() > w0;
                [st.renderer._isHeadlessNull, st._buehneStand, r._buehneT0] = merk;
                // das Buch, das sich noch öffnet, hält die Welt offen (`_foundryBuchOffen` → `_weltOffen`): ohne Rezepte ein
                // Offenes mehr, mit ihnen wie zuvor — der Deckel jeder Linse liest es dort
                const [f, vor] = [r._foundry, r._weltOffen().foundry];
                const rz = f.recipes;
                f.recipes = null;
                t.buchOffen = r._foundryBuchOffen() && r._weltOffen().foundry === vor + 1;
                f.recipes = rz;
                t.buchZu = !r._foundryBuchOffen() && r._weltOffen().foundry === vor;
            // (W4.3, der Wachhund eines hängenden Bakes, fiel mit S2: die Karte backt synchron im Takt)
        }
        return o;
    }, SELBSTTEST);
    if (SELBSTTEST) out.liefer = lieferUrteil(await page.evaluate(RUHE));
    await browser.close();
    server.close();
    console.log(
        `\n=== VOLLE BÜHNE — das Prädikat (headless-Mechanik) === Takt ${out.stage || "— (nicht erreicht)"} · ` +
            `${out.chunks} Chunks · ${out.impostorRecords} Impostor-Records · Sichtweite ${out.sichtM} m` +
            (out.headless ? " (headless: RTT-Term übersprungen, gate-treu)" : "")
    );
    const [T, s] = [out.terms, out.selftest || {}];
    // je Invariante [hält, Name]
    const checks = [
        [T.ring, "RING erreicht Ziel"],
        [T.grass && T.water, `GRAS aufgeholt (${T.grass}) · WASSER aufgeholt (${T.water})`],
        [
            T.streu,
            `STREU steht — keine Region in Reichweite fehlt, wartet oder trägt eine offene Scheibe (\`_streuWartet\` ${T._streuWartet})`,
        ],
        [T.biblio && T.impost, `BIBLIOTHEK warm (${T.biblio}) · IMPOSTOREN idle (${T.impost}) · das Buch kam ${buchS} s nach dem ersten Weltbild`],
        [!!out.stage, "die BÜHNE wurde erreicht (das Prädikat schloss)" + (out.bruch ? " — " + out.bruch : "")],
        [!out.verborgen.length, `DER INIT BAUT NICHTS VERBORGENES ${out.verborgen}`],
    ];
    if (SELBSTTEST)
        checks.push(
            [
                s.buehneOhneKarte === false && s.buehneMitKarte,
                `SELBST-TEST: die Bühnen-Wahrheit der Welt (\`_buehneSteht\`) liest dieselbe Streu — ohne Regionen-Karte ${s.buehneOhneKarte === false ? "steht sie nicht" : "STEHT sie"}, mit ihr ${s.buehneMitKarte ? "steht sie" : "steht sie NICHT"}`,
            ],
            [
                s.deckelSteht && s.deckelWarnt,
                `SELBST-TEST: der Deckel der Bühne öffnet laut — ohne Regionen-Karte hinter BUEHNE_SETTLE_CAP_MS ${s.deckelSteht ? "steht sie" : "steht sie NICHT"}, das Log ${s.deckelWarnt ? "nennt die Lücke (WARN)" : "SCHWEIGT"}`,
            ],
            [s.buchOffen && s.buchZu, `SELBST-TEST: das Buch, das sich noch öffnet, hält die Welt offen (\`_weltOffen\`) — ohne Rezepte ${s.buchOffen ? "ein Offenes mehr" : "NICHTS offen"}, mit ihnen ${s.buchZu ? "wie zuvor" : "ANDERS als zuvor"}`],
            [out.liefer.weg === 1, `SELBST-TEST: die verschluckte Lieferung ist ROT — ${out.liefer.zeile}`]
        );
    // das Urteil des Kern-Wechsels an Bruch-Daten: gesund GRÜN, ein fremder Neubau (e) und ein alter Leser (d) ROT
    const W = (e, d) => wechselUrteil([[0, "e", "platte", "phyto"], [0, "d", "platte", "fachwerk"]], [[0, "e", e, "phyto"], [0, "d", d, "fachwerk"]], "fachwerk").gruen; // prettier-ignore
    if (SELBSTTEST) checks.push([W("platte", "werk") && !W("werk", "werk") && !W("platte", "platte"), "SELBST-TEST: der Kern-Wechsel urteilt (fremder Neubau, alter Leser ROT)"]); // prettier-ignore
    if (SELBSTTEST) checks.push([nachBild([{ t: 9 }, { t: 1 }], 5).length === 1, "SELBST-TEST: synchron nach dem Bild ROT"]);
    // das Urteil des Abdrucks: gleiche Bytes von der Platte GRÜN (ein neu gebauter Leser darf anders sein, er zählt), ein Körper
    // der Platte mit den Bytes des alten Gesetzes ROT beim Namen, ohne gemeinsame Lieferung ROT
    const AU = (mensch) => abdruckUrteil({ "eiche|1|0": ["aa", "platte"], "mensch|0|0": mensch }, { "eiche|1|0": ["aa", "werk"], "mensch|0|0": ["neu", "werk"] }, "frisch.json"); // prettier-ignore
    if (SELBSTTEST) checks.push([AU(["neu", "werk"]).gruen && AU(["alt", "werk"]).gruen && AU(["alt", "werk"]).anders.length === 1 && AU(["alt", "platte"]).zeile.startsWith("ALT UNTER NEUEM GESETZ: 1 von 2 Lieferungen der Platte tragen andere Bytes als ihr frischer Bau — mensch|0|0") && !abdruckUrteil({}, {}, "x").gruen && /kein altes Ding unter neuem Gesetz \(von der Platte 2\) · NICHT BYTE-STABIL: 1 Lieferungen der Platte.*— eiche\|1\|0/.test(abdruckUrteil({ "eiche|1|0": ["ab", "platte"], "mensch|0|0": ["neu", "platte"] }, { "eiche|1|0": ["aa", "werk"], "mensch|0|0": ["neu", "werk"] }, "frisch.json", new Set(["mensch|0|0"])).zeile), "SELBST-TEST: der Abdruck urteilt — ein Körper der Platte mit den Bytes des alten Gesetzes ist GEFANGEN beim Namen (ALT UNTER NEUEM GESETZ), ein Treffer mit anderen Bytes, der den gewechselten Kern nie las, heißt NICHT BYTE-STABIL, ohne Messung fällt die Zeile"]); // prettier-ignore
    // die Programm-Zeile: gleiche Bytes GRÜN; eine fremde Pipeline ROT beim Namen; ohne Messung (kein Boot davor, keine Pipeline) ROT
    const PU = programmUrteil;
    const leben = ["MeshStandardNodeMaterial_25", "9184:7fe4bf62", "68205:4b5043f5"];
    const karte = ["impostor#fimp:atlas_109", "25200:1fc6bf95", "133000:18bc6d70"];
    const trug = ["9184:7fe4bf62|68205:4b5043f5"];
    if (SELBSTTEST) checks.push([PU(trug, [leben], true).gruen && !PU(null, [leben], true).gruen && !PU(trug, [], true).gruen && !PU(trug, [leben], false).gruen && PU(trug, [leben, karte], true).zeile.startsWith("Die Wiederkehr verfehlt den Pipeline-Cache: 1 von 2 Pipelines tragen andere Bytes als in den Boots davor — impostor#fimp:atlas_109 (V 25200 · F 133000 B)"), "SELBST-TEST: die Programm-Zeile urteilt (gleiche Bytes GRÜN, eine fremde Pipeline ROT beim Namen, ohne Messung ROT)"]); // prettier-ignore
    // die Lücke je Kachel: ein Busch, der fehlt (30 × 30 von 640 × 360, 0,39 % des Bilds), reißt seine Kachel (18,75 %); die Mutante
    // (das Bildmittel von main) hält ihn GRÜN, ein gleiches Bild ist 0
    if (SELBSTTEST) {
        const leer = { W: 640, H: 360, u8: new Uint8Array(640 * 360 * 4) };
        const busch = { ...leer, u8: leer.u8.map((v, i) => (Math.floor(i / 4 / 640) < 30 && (i / 4) % 640 < 30 ? 200 : v)) };
        const L = lueckeKacheln(leer, busch);
        checks.push([L.luecke > LUECKE_SOLL && L.kachel === "0/0" && L.mittel < LUECKE_SOLL && !(L.mittel > LUECKE_SOLL) && lueckeKacheln(leer, leer).luecke === 0, `SELBST-TEST: die Lücke je Kachel — der fehlende Busch reißt Kachel ${L.kachel} (${(100 * L.luecke).toFixed(2)} %), das Bildmittel (main, ${(100 * L.mittel).toFixed(2)} %) hielte ihn`]); // prettier-ignore
    }
    // am Bild gezeichnet: gesund GRÜN; ein wartender Bürger ROT beim Namen (Hauptbild und Wurf); ohne Messung ROT
    const G = gezeichnetUrteil;
    const atlas = "impostor#fimp:atlas (MeshStandardNodeMaterial_109)";
    if (SELBSTTEST) checks.push([G({ amBild: [9, [], []], bilder: 3 }).gruen && G({ amBild: [9, [atlas], []], ganz: 2009 }).zeile.startsWith(`Weltbild steht, ${atlas} nicht gezeichnet — das ganze Bild kam 2000 ms`) && /bodenSatz im Wurf nicht gezeichnet/.test(G({ amBild: [9, [], ["bodenSatz"]] }).zeile) && !G({ amBild: [9, [atlas], []] }).gruen && !G({}).gruen && !G(null).gruen, "SELBST-TEST: am Bild gezeichnet — ein wartender Bürger ist ROT beim Namen (Hauptbild und Wurf), ohne Messung ROT"]); // prettier-ignore
    // die Ankunft bricht nicht: ein leeres Buch GRÜN; jeder Eintrag ROT beim Wort; ohne Messung ROT — und der EINE Sammler SAH
    // den Eintrag (`taeter` nimmt den gepflanzten wieder heraus: leer hieße still grün)
    const BU = bruchUrteil;
    const stoff = "STOFF: die Spieler-Vorlagen (Mensch-Ofen im Faden) — Cannot read properties of null (reading 'getAnimationLoop')";
    const guss = "FADEN-UMGANGEN: Guss „mensch“ ohne Vorlage im Haupt-Faden — _buildHumanoidRig (Lehre 14)";
    if (SELBSTTEST) {
        bruchBuch([[stoff, 1], [guss, 2]], "Selbsttest"); // prettier-ignore
        const doppelt = bruchBuch([[stoff, 1]], "Selbsttest"); // was der Sammler schon trägt, zählt nicht doppelt
        const sah = taeter(/^bruch: Selbsttest — /);
        checks.push([BU([]).gruen && !BU(undefined).gruen && BU([[stoff, 1], [guss, 2]]).zeile.startsWith(`Weltbild steht, die Ankunft brach 2-mal beim Namen: ${stoff} ‖ 2× ${guss}`) && sah.length === 2 && sah[1].includes(`2× ${guss}`) && doppelt.length === 0, "SELBST-TEST: die Ankunft bricht nicht — jeder Eintrag des Bruch-Buchs vor dem Bild ist ROT beim Wort, ohne Messung ROT, der EINE Sammler sah ihn"]); // prettier-ignore
    }
    const fails = checks.filter(([pass, name]) => (console.log(`  ${pass ? "✅" : "❌"} ${name}`), !pass)).length;
    console.log(`\n${checks.length - fails}/${checks.length} Bühnen-Invarianten OK.`);
    urteilEnde(fails, "⛔ Die volle Bühne steht nicht (oder die Linse ist stumpf) — Kriterium 2 ist nicht abnehmbar.", `✅ „Volle Bühne" ist ein Prädikat — Kriterium 2 ist messbar.`);
});
