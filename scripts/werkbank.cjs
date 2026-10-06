// werkbank.cjs — DIE WERKBANK der Look-Arbeit (V18.503): EINE Welt bleibt offen, Fragen gehen per
// Befehl hinein. Befund 01.10.: jede Hypothese startete die Welt neu (Boot + Einschwingen 3–5 min,
// swiftshader 15–100 s je Bild) — 15 Läufe an einem Tag für Fragen, die zusammen ~30 s echte
// Rechenzeit brauchten. Profis tauschen live (Hot-Reload) und lesen Puffer-Ansichten; das hier ist
// der Weg dorthin: die Welt bleibt stehen, eine Methode aus dem Arbeitsbaum wird in die laufende
// Seite getauscht, das Terrain-Material neu gebaut, das Bild ist in Sekunden da.
//
//   node scripts/werkbank.cjs start [--port 4490] [--holz voll|nah|kienspan]
//                                                           Welt + Steuer-Server (bleibt offen)
//   node scripts/werkbank.cjs umstellen <x> <z>            Spieler setzen, einschwingen
//   node scripts/werkbank.cjs bild <px> <py> <pz> <lx> <ly> <lz> [--datei f.png] [--w 640 --h 360]
//                                                           Bühne + echter Frame (Ausgabe-Pfad)
//   node scripts/werkbank.cjs methode <name> [--terrain]   Methode aus anazhRealm.js (Arbeitsbaum)
//                                                           live tauschen; --terrain baut das EINE
//                                                           Chunk-Material neu und hängt es an alle Chunks
//   node scripts/werkbank.cjs eval '<js>'                  Funktionsrumpf in der Seite (r = Welt, T = THREE)
//   node scripts/werkbank.cjs albedo [--nur <regex>] [--ordner d]  DIE ALBEDO-SICHT je Mesh-Klasse
//                                                           (scripts/lib/licht-linsen.cjs; Karte = 0,180)
//   node scripts/werkbank.cjs licht                        DIE LICHT-BILANZ (18-%-Karte, je Licht)
//   node scripts/werkbank.cjs fernwald [--blicke nord,ost] DIE FERNWALD-LINSE: der gesetzte Fernwald im Bild (glatte
//                                                           Fläche, Textur, Vielfalt, Farbe; scripts/lib/fernwald-linse.cjs)
//   node scripts/werkbank.cjs zaehlen [px py pz lx ly lz] [--alle]
//                                                           DER DRAW-ZÄHLER: GPU-Befehle + Dreiecke je Pass
//                                                           (Hauptbild · jede Kaskade) und Täter-Klasse, ein Frame
//                                                           (scripts/lib/draw-zaehler.cjs; Top 16, --alle alle)
//   node scripts/werkbank.cjs fluss                        DIE FLUSS-LINSE: was der Foundry-Kanal den Haupt-Thread
//                                                           kostet (Bytes · Entpacken · Platte · Worker-Auslastung);
//                                                           erster Ruf installiert (scripts/lib/fluss-linse.cjs)
//   node scripts/werkbank.cjs takt [n] [--extra a,b]       DIE TAKT-LINSE: CPU je Loop-Subsystem, n Takte, Render
//                                                           ruht (scripts/lib/takt-linse.cjs)
//   node scripts/werkbank.cjs lauf [sek] [--ein s] [--regler frei|voll] [--tiere halten|frei] [--ruhe max-s]
//                                                           DER ECHTE LAUF: der Spiel-Loop läuft (rAF), nach
//                                                           `--ein` Sekunden Einschwingen misst er `sek` Sekunden
//                                                           Frame-Zeit · GPU-Zeit (timestamp-query) · Draws ·
//                                                           Dreiecke · VRAM · Regler-Stand; „voll" hebt die
//                                                           Regler-Decke (loadScale → 1, die volle Welt)
//   node scripts/werkbank.cjs profil [sek] [--regler frei|voll] [--top n]
//                                                           DAS CPU-PROFIL des echten Laufs (Chrome-Profiler,
//                                                           200 µs): Selbst- und Gesamtzeit je Funktion — wer
//                                                           den Takt trägt, beim Namen (nach einem `lauf`)
//   node scripts/werkbank.cjs schirm [--datei f.png]         DER SCHIRM: Screenshot des präsentierten Canvas
//                                                           (was der Spieler sieht) nach 1 s echtem Loop
//   node scripts/werkbank.cjs fenster <w> <h>               Viewport wechseln wie ein Spieler (resize-Ereignis)
//   node scripts/werkbank.cjs gpu-bank [n] [--runden r]      DIE GPU-BANK: n Frames ohne rAF/VSync hintereinander, die
//                                                           reine GPU-Zeit je Frame (wenn GPU-gebunden)
//   node scripts/werkbank.cjs zerlegen [--runden r] [--n frames] [--nur a,b] [--json datei] [--bilder [ordner]]
//                                      [--selbsttest [--last iter]]
//                                                           DIE GPU-ZERLEGUNG (scripts/lib/zerlege-linse.cjs): schaltet
//                                                           jeden benannten Verbraucher des echten Wegs ab (Pässe, Post-
//                                                           Stufen, Klassen, leerer Frame) und misst je Schalter die gpu-
//                                                           bank-Differenz ABBA (r ≥ 4 Runden à n Frames, Median ± halbe
//                                                           Spannweite, dazu Δ CPU und Δ Pass-Stempel) → Tabelle mit Σ,
//                                                           Rest, Frame-Anatomie (jeder GPU-Befehl je Frame mit Bytes) und
//                                                           Beleg je Schalter; `--nur` nimmt Schalter-ids (Tabelle zeigt
//                                                           sie), `--bilder` legt je Schalter das AUS-Bild aus dem Ausgabe-
//                                                           Pfad ab, `--selbsttest` schmuggelt einen Vollbild-Pass fester
//                                                           Last ein und prüft, dass er als Posten erscheint und wieder
//                                                           verschwindet. Exit 1: ein Schalter schaltet nicht, der Zustand
//                                                           ist nicht zurück, oder der Selbsttest ist ROT.
//     MESSFOLGE am ruhigen Messplatz (keine fremde Last, Port 3000 frei; Zeiten nur ruhig, ~3 min je Lauf):
//       npm start                                           (save-server :4312, eigenes Fenster)
//       node scripts/werkbank.cjs start --echt              (eigenes Fenster; wartet auf „WERKBANK bereit")
//       node scripts/werkbank.cjs umstellen -900 -850
//       node scripts/werkbank.cjs lauf 10 --ein 30 --ruhe 300 --tiere frei   (einschwingen: der Bau ruht)
//       node scripts/werkbank.cjs zerlegen --selbsttest     (die Linse prüft sich: Posten gefunden, plausibel, weg)
//       node scripts/werkbank.cjs zerlegen --runden 6 --json artifacts/werkbank/zerlegen-omen.json
//       node scripts/werkbank.cjs zerlegen --nur haupt,tiefenkopie,traa,nachbild,bloom,godrays,kontrast,feldPass,leer --runden 8
//       node scripts/werkbank.cjs stop
//   node scripts/werkbank.cjs band [--datei f.json] [--proben n] [--cap sek]
//                                                           DIE BAND-LINSE (W0): einschwingen (volle Welt, bis der Bau
//                                                           ruht), n Proben (Maximum je Klasse × Stufe × Pass) + VRAM
//                                                           je Erzeuger + gpu-bank gegen den Haushalt und die Ratsche
//                                                           (spec/profiband/, scripts/lib/band-urteil.cjs) → Tabelle
//                                                           Ist/Soll/Täter, BAND (Befehle · Dreiecke · VRAM · GPU-ms)
//                                                           und LINSE; Exit 1, solange eins ROT ist
//   node scripts/werkbank.cjs ratsche <band-*.json …>      DIE RATSCHE AUS EINER SERIE (nur Node): ≥ 4 Läufe der echten
//                                                           GPU am Messort, eingeschwungen, Erst- und Zweit-Boot — die
//                                                           Hülle zieht nach (setzt, senkt, hebt nie), nur bei sauberer
//                                                           LINSE
//   node scripts/werkbank.cjs reload | status | stop
//
// DIE MESS-SERIE: jeder `start` fährt ein eigenes Browser-Profil (Scratch, beim `stop` gelöscht) — der erste Boot ist
// ein ERST-Boot (leere Platte), jedes `reload` ein ZWEIT-Boot (die Foundry-Platte im Profil bleibt). `--serie <name>`
// hält das Profil unter artifacts/werkbank/profil-<name> über Neustarts hinweg (der Spieler, der das Spiel morgen
// wieder öffnet). `status` und `band` nennen die Boot-Art; `fluss` zählt Platte gegen Neubau (MB).
//
// `start --echt [--seite <url>]` fährt die ECHTE GPU (Fenster, WebGPU über den Hardware-Adapter, 1920×1080 bei DPR 1) gegen
// den laufenden save-server (`npm start`, :4312 — der Flugschreiber schreibt anazhRealmPerf.json); ohne
// `--echt` bleibt es swiftshader auf dem eigenen Seiten-Port. In beiden zählt der VRAM-ABGRIFF jede
// GPUDevice-Allokation (Puffer + Texturen, live nach destroy) — das ist der Speicher, nicht ein Proxy.
//
// Höhen relativ zum Boden: `bild` nimmt py/ly mit Präfix `+` als Abstand über `_voxelSurfaceY(px,pz)`
// bzw. `(lx,lz)` (z. B. `+1.6`). Die Bilder sind dieselbe Aufnahme wie die Beweis-Sonden
// (`scripts/lib/ausgabe-aufnahme.cjs`: Bühne Mittag · Sonne · Sommer, Ausgabe-Pfad).
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const { LINSEN_INSTALL } = require("./lib/licht-linsen.cjs");
const { ZAEHLER_INSTALL, FALTE_INSTALL } = require("./lib/draw-zaehler.cjs");
const { FLUSS_INSTALL } = require("./lib/fluss-linse.cjs");
const { TAKT_INSTALL } = require("./lib/takt-linse.cjs");
const { FERNWALD_INSTALL } = require("./lib/fernwald-linse.cjs");
const BAND = require("./lib/band-urteil.cjs");
const ZL = require("./lib/zerlege-linse.cjs");

const root = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
const PORT = Number(opt("--port", process.env.WERKBANK_PORT || 4490));
const SEITEN_PORT = PORT - 1;
// Das Holz-Profil der Welt: ohne Wahl erkennt sie swiftshader und fährt „kienspan" (ohne Schatten,
// kleiner Ring) — Kosten-Fragen für das Schöpfer-Holz stellen `--holz voll`.
const HOLZ = opt("--holz", process.env.WERKBANK_HOLZ || "");
const ECHT = argv.includes("--echt");
// DIE SEITE der echten Welt: `--seite` (oder WERKBANK_SEITE) hat EINE Bedeutung — die URL des save-servers
// (Ursprung, z. B. http://localhost:4312), nie eine Portnummer. Alles andere bricht laut ab, statt still eine
// falsche Adresse („5312/") zu bauen.
const ECHT_SEITE = (() => {
    const s = String(opt("--seite", process.env.WERKBANK_SEITE || "http://localhost:4312"));
    if (!/^https?:\/\/[^/\s]+\/?$/.test(s))
        throw new Error(`--seite/WERKBANK_SEITE erwartet die URL des save-servers (http://host:port), nicht „${s}"`);
    return s.replace(/\/$/, "");
})();
const SERIE = opt("--serie", process.env.WERKBANK_SERIE || "");

// DER VRAM-ABGRIFF: jede Allokation des GPUDevice (Puffer: size; Textur: alle Mip-Stufen × Schichten ×
// Samples × Bytes je Texel) live mitgezählt, destroy zieht ab. Läuft vor jedem Seiten-Skript.
function vramAbgriff() {
    if (typeof GPUDevice === "undefined" || window.__vram) return;
    const V = (window.__vram = { puffer: 0, texturen: 0, nPuffer: 0, nTexturen: 0, spitze: 0 });
    const bpt = (f) => {
        if (/^(bc1|bc4|etc2-rgb8unorm|etc2-rgb8a1|eac-r11)/.test(f)) return 0.5;
        if (/^(bc|astc-4x4|etc2-rgba8|eac-rg11)/.test(f)) return 1;
        if (/^astc/.test(f)) return 0.5;
        if (/32float-stencil8/.test(f)) return 8;
        if (/^(depth24plus|depth32float|depth24plus-stencil8)$/.test(f)) return 4;
        if (/^(depth16unorm)$/.test(f)) return 2;
        if (/^stencil8$/.test(f)) return 1;
        const k = /^(r|rg|rgba|bgra)(8|16|32)/.exec(f);
        if (k) return { r: 1, rg: 2, rgba: 4, bgra: 4 }[k[1]] * (Number(k[2]) / 8);
        if (/^(rgb10a2|rg11b10|rgb9e5)/.test(f)) return 4;
        return 4;
    };
    // Dieselbe Bytes-je-Texel-Tabelle liest die Frame-Anatomie der GPU-Zerlegung (scripts/lib/zerlege-linse.cjs), und
    // jede Ansicht kennt ihre Textur (ein Render-Pass nennt nur Ansichten — Format, Größe und Proben trägt die Textur).
    window.__vramBpt = bpt;
    const ansichtTextur = (window.__viewTex = new WeakMap());
    const cv = GPUTexture.prototype.createView;
    GPUTexture.prototype.createView = function (d) {
        const v = cv.call(this, d);
        ansichtTextur.set(v, this);
        return v;
    };
    const spitze = () => (V.spitze = Math.max(V.spitze, V.puffer + V.texturen));
    // Je Label die lebenden Bytes — `__vramBericht()` nennt die Großen beim Namen; das Label faltet die EINE Regel
    // `__vramFalte` (scripts/lib/draw-zaehler.cjs, ab Dokument-Start installiert).
    const jeLabel = new Map();
    // Texturen tragen Format und Größe im Schlüssel (wenige, große), Puffer nur das Label.
    const buche = (o, art, d, b) => {
        const s = (d && d.size) || {};
        const form =
            art === "tex"
                ? ` ${d.format} ${Array.isArray(s) ? s.join("x") : [s.width, s.height, s.depthOrArrayLayers || 1].join("x")}`
                : "";
        o.__vramK = art + ":" + window.__vramFalte((d && d.label) || "?") + form;
        const e = jeLabel.get(o.__vramK) || { bytes: 0, n: 0 };
        e.bytes += b;
        e.n++;
        jeLabel.set(o.__vramK, e);
    };
    // Ein GPU-Objekt unter einen anderen Schlüssel umbuchen: die Band-Linse (`__texturZensus`) nennt namenlose
    // Texturen über ihr three-Objekt, der Abgriff sah nur das Label beim Anlegen.
    window.__vramUmbuchen = (o, k) => {
        if (!o.__vramB || o.__vramK === k) return;
        const alt = jeLabel.get(o.__vramK);
        if (alt) {
            alt.bytes -= o.__vramB;
            alt.n--;
        }
        o.__vramK = k;
        const e = jeLabel.get(k) || { bytes: 0, n: 0 };
        e.bytes += o.__vramB;
        e.n++;
        jeLabel.set(k, e);
    };
    window.__vramBericht = (top) =>
        [...jeLabel.entries()]
            .filter(([, e]) => e.n > 0)
            .sort((a, b) => b[1].bytes - a[1].bytes)
            .slice(0, top || 20)
            .map(([k, e]) => ({ k, mb: +(e.bytes / 1048576).toFixed(1), n: e.n }));
    const P = GPUDevice.prototype;
    const cb = P.createBuffer;
    P.createBuffer = function (d) {
        const b = cb.call(this, d);
        b.__vramB = (d && d.size) || 0;
        V.puffer += b.__vramB;
        V.nPuffer++;
        buche(b, "buf", d, b.__vramB);
        spitze();
        return b;
    };
    const ct = P.createTexture;
    P.createTexture = function (d) {
        const t = ct.call(this, d);
        const s = d.size || {};
        const w = Array.isArray(s) ? s[0] : s.width || 1;
        const h = Array.isArray(s) ? s[1] || 1 : s.height || 1;
        const l = Array.isArray(s) ? s[2] || 1 : s.depthOrArrayLayers || 1;
        let b = 0;
        for (let m = 0; m < (d.mipLevelCount || 1); m++)
            b +=
                Math.max(1, w >> m) *
                Math.max(1, h >> m) *
                (d.dimension === "3d" ? Math.max(1, l >> m) : l) *
                bpt(String(d.format || ""));
        t.__vramB = b * (d.sampleCount || 1);
        V.texturen += t.__vramB;
        V.nTexturen++;
        buche(t, "tex", d, t.__vramB);
        spitze();
        return t;
    };
    for (const [K, feld, n] of [
        [GPUBuffer, "puffer", "nPuffer"],
        [GPUTexture, "texturen", "nTexturen"],
    ]) {
        const d = K.prototype.destroy;
        K.prototype.destroy = function () {
            if (this.__vramB) {
                V[feld] -= this.__vramB;
                V[n]--;
                const e = jeLabel.get(this.__vramK);
                if (e) {
                    e.bytes -= this.__vramB;
                    e.n--;
                }
                this.__vramB = 0;
            }
            return d.call(this);
        };
    }
}

// ── Client ──────────────────────────────────────────────────────────────────────────────────────
function rufe(weg, nutzlast) {
    return new Promise((res, rej) => {
        const body = JSON.stringify(nutzlast || {});
        const req = http.request(
            {
                host: "127.0.0.1",
                port: PORT,
                path: weg,
                method: "POST",
                headers: { "Content-Type": "application/json" },
            },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch (_e) {
                        res({ roh: d });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(0);
        req.end(body);
    });
}

// Eine Klassen-Methode (4 Leerzeichen eingerückt, prettier-Form) aus dem Quelltext schneiden.
function methodeAusQuelle(quelle, name) {
    const kopf = new RegExp(`\\n    (async )?${name}\\(([^)]*)\\) \\{\\n`);
    const m = kopf.exec(quelle);
    if (!m) return null;
    const start = m.index + 1;
    const ende = quelle.indexOf("\n    }\n", start);
    if (ende < 0) return null;
    const text = quelle.slice(start, ende + 6);
    return `(${m[1] || ""}function ${name}(${m[2]}) {${text.slice(text.indexOf("{\n") + 1)})`;
}

// DER ECHTE LAUF (Seiten-Kontext): der Spiel-Loop läuft über rAF wie im Spiel; nach dem Einschwingen
// zählt jeder Frame — Intervall (rAF-Zeitstempel = was der Spieler sieht), CPU-Takt, GPU-Zeit des Frames
// (r184-Pool löst den LETZTEN Frame auf, Summe aller Pässe), Draws/Dreiecke aus `_perfFrame` (die Quelle
// von HUD und Flugschreiber). Die Bühne (Mittag · Sonne · Sommer) und stille Tiere halten den Vergleich
// gleich; „voll" hebt die Regler-Decke, der PID wächst loadScale → 1 (die volle Welt, wie die Cloud maß).
function lauf(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        window.__buehne();
        // Die Tiere halten still (Vergleichbarkeit) — außer `--tiere frei`: der Halte-Griff setzt x/z je Takt zurück,
        // die Tier-KI sucht dann jeden Takt neu (Feld-Raycasts), das kostet CPU, die das Spiel so nie zahlt.
        if (k.tiere !== "frei" && window.__tiereHalten) window.__tiereHalten();
        const decke = st.perfTargetMs;
        if (k.regler === "voll") st.perfTargetMs = 1000;
        if (st.playerMesh) st.playerMesh.visible = true;
        // DIE PASS-UHR (scripts/lib/zerlege-linse.cjs, dieselbe wie `zerlegen`): r184 stempelt jeden Render-Pass mit
        // `r:<Aufruf>:<Kontext>:f<Frame>`; der Stapel der gerade rendernden Pässe beim Stempeln nennt den Pass (die EINE
        // Benennung `__passName`: haupt · k0/k1 · post · TRAA …), der Pool trägt die ms. Ein Pass, der mitten im Render neu
        // beginnt (r184 `copyFramebufferToTexture`), überschreibt seinen Anfangs-Stempel — `zerlegen` nennt ihn.
        const uhr = window.__passUhr();
        const proben = [];
        let messen = false,
            tVor = null,
            tRenderVor = null,
            gpuAm = r._gpuTsAtMs;
        rend.setAnimationLoop((t) => {
            // Das Wetter hält (der 120-s-Zug brachte im ersten Lauf Regen ins Messfenster).
            st.weatherEffectTime = Math.min(st.weatherEffectTime || 0, 100);
            const c0 = performance.now();
            const g0 = r._gpuLeine ? r._gpuLeine.gerendert : 0;
            r._gameLoopTick(t);
            // Unter der GPU-Leine rendert nicht jeder Takt — gezählt werden GERENDERTE Frames (der Takt läuft weiter).
            const gerendert = !r._gpuLeine || r._gpuLeine.gerendert > g0;
            if (!messen) {
                if (gerendert) tRenderVor = t;
                return void (tVor = t);
            }
            // `_perfFrame` ist am Takt-Ende schon gefaltet und geleert; renderer.info trägt die Summe aller Pässe
            // des Frames (der Loop setzt es je Frame zurück) — die HUD-Zahl. Bundle-Replays bucht r184 dort NICHT
            // (Lehre 23): die Wahrheit je Pass und Klasse zählt `zaehlen`.
            const ri = (rend.info && rend.info.render) || {};
            const p = { dt: tVor == null ? null : t - tVor, cpu: performance.now() - c0, gerendert };
            if (gerendert) {
                p.dtRender = tRenderVor == null ? null : t - tRenderVor;
                tRenderVor = t;
            }
            p.dc = ri.drawCalls;
            p.tri = ri.triangles;
            if (r._gpuTsAtMs !== gpuAm) {
                p.gpu = r._gpuTsLast;
                gpuAm = r._gpuTsAtMs;
            }
            // DIE GPU-WAHRHEIT: die Pass-Stempel sahen nur einen Teil (das Wasser bricht den Hauptpass für die
            // Tiefen-Kopie, der Neustart überschreibt die Stempel; Arbeit außerhalb der Pässe fehlt ganz). Der
            // Abstand der GPU-Fertig-Zeitpunkte ist der echte Durchsatz, CPU-Ende → GPU-fertig der Verzug, den der
            // Spieler als Eingabe-Lag spürt.
            const q = rend.backend && rend.backend.device ? rend.backend.device.queue : null;
            if (q && gerendert) {
                const cEnde = performance.now();
                q.onSubmittedWorkDone().then(() => {
                    p.gpuFertig = performance.now();
                    p.verzug = p.gpuFertig - cEnde;
                });
            }
            tVor = t;
            proben.push(p);
        });
        try {
            await sleep(k.ein * 1000);
            // DIE RUHE: zwischen frischen Welten streute die GPU um ±5 ms (Foundry, Karten-Bäcker, Streaming noch
            // unterwegs). Mit `--ruhe <max s>` misst der Lauf erst, wenn 3 s lang alles steht: Chunks gleich, Foundry-
            // Schlange + Ingest leer, Karten-Bäcker ohne Wartende/Hängende, die Mesh-Zone fertig oder 10 s ohne Fortschritt.
            const ruheZustand = () => {
                const f = r._foundry;
                const z = typeof r._impostorCensus === "function" ? r._impostorCensus() || {} : {};
                const pm = st.playerMesh.position;
                const R2 = (st.architectureCullingRadius || 0) ** 2;
                let offen = 0;
                for (const e of st.architectures || []) {
                    const dx = e.position.x - pm.x,
                        dz = e.position.z - pm.z;
                    if (dx * dx + dz * dz <= R2 && !r._archIsRendered(e)) offen++;
                }
                return {
                    chunks: st.voxelChunks ? st.voxelChunks.size : 0,
                    foundry:
                        (f && f.pending ? f.pending.size : 0) +
                        (f && f.warte ? f.warte.length : 0) +
                        (r._foundryIngestQueue ? r._foundryIngestQueue.length : 0),
                    karten:
                        (r._impostorBakeQueue || []).length +
                        (r._impostorBakePending ? 1 : 0) +
                        (z.wartend || 0) +
                        (z.haengendeBakes || 0),
                    meshOffen: offen,
                };
            };
            let ruhe = null;
            if (k.ruhe > 0) {
                const t0 = performance.now();
                let vor = ruheZustand(),
                    ruhigSeit = performance.now(),
                    offenSeit = performance.now(),
                    ruhig = false;
                while (performance.now() - t0 < k.ruhe * 1000) {
                    await sleep(250);
                    const z = ruheZustand();
                    if (z.meshOffen !== vor.meshOffen) offenSeit = performance.now();
                    const still =
                        z.chunks === vor.chunks &&
                        z.foundry === 0 &&
                        z.karten === 0 &&
                        (z.meshOffen === 0 || performance.now() - offenSeit > 10000);
                    if (!still) ruhigSeit = performance.now();
                    vor = z;
                    if (performance.now() - ruhigSeit >= 3000) {
                        ruhig = true;
                        break;
                    }
                }
                ruhe = Object.assign({ ruhig, sek: +((performance.now() - t0) / 1000).toFixed(1) }, vor);
            }
            const v0 = Object.assign({}, window.__vram || {});
            messen = true;
            uhr.messen = true;
            await sleep(k.sek * 1000);
            messen = false;
            uhr.messen = false;
            rend.setAnimationLoop(null);
            // Die GPU-Fertig-Meldungen laufen der CPU hinterher — warten, bis die Schlange leer ist.
            if (rend.backend && rend.backend.device) await rend.backend.device.queue.onSubmittedWorkDone();
            await sleep(50);
            const jePassFrame = (await uhr.lesen()) || {};
            const quant = (arr, q) => {
                const a = arr.filter(Number.isFinite).sort((x, y) => x - y);
                return a.length ? +a[Math.min(a.length - 1, Math.floor(q * a.length))].toFixed(2) : null;
            };
            const spalte = (f) => proben.map((p) => p[f]).filter(Number.isFinite);
            const dt = spalte("dtRender"),
                takt = spalte("dt"),
                cpu = proben.filter((p) => p.gerendert).map((p) => p.cpu),
                gpu = spalte("gpu"),
                dc = spalte("dc"),
                tri = spalte("tri");
            const zahl = (a) => ({ p50: quant(a, 0.5), p95: quant(a, 0.95), p99: quant(a, 0.99), max: quant(a, 1) });
            const s = st.perfSense || {};
            const v = window.__vram || {};
            const mb = (b) => (Number.isFinite(b) ? +(b / 1048576).toFixed(1) : null);
            const cam = st.camera;
            const dir = new window.THREE.Vector3();
            cam.getWorldDirection(dir);
            return {
                regler: k.regler,
                sekunden: k.sek,
                frames: dt.length,
                fps: dt.length ? +((1000 * dt.length) / dt.reduce((a, b) => a + b, 0)).toFixed(1) : null,
                frameMs: zahl(dt),
                cpuTaktMs: zahl(cpu),
                taktMs: zahl(takt),
                leine: r._gpuLeine
                    ? {
                          ausgesetztPct: +(
                              (100 * proben.filter((p) => !p.gerendert).length) /
                              Math.max(1, proben.length)
                          ).toFixed(1),
                          imFlug: r._gpuLeine.imFlug,
                      }
                    : null,
                gpuMs: Object.assign(zahl(gpu), { n: gpu.length, quelle: s.gpuQuelle || null }),
                gpuDurchsatzMs: (() => {
                    const g = proben.map((p) => p.gpuFertig).filter(Number.isFinite);
                    return zahl(g.slice(1).map((x, i) => x - g[i]));
                })(),
                gpuVerzugMs: zahl(spalte("verzug")),
                gpuJePassMs: Object.fromEntries(
                    Object.entries(jePassFrame).map(([p, e]) => {
                        const w = Object.values(e);
                        return [p, { p50: quant(w, 0.5), p95: quant(w, 0.95), frames: w.length }];
                    })
                ),
                draws: zahl(dc),
                dreiecke: zahl(tri),
                ueber17: dt.length ? +((100 * dt.filter((x) => x > 17).length) / dt.length).toFixed(1) : null,
                ueber33: dt.length ? +((100 * dt.filter((x) => x > 33.4).length) / dt.length).toFixed(1) : null,
                vramMB: {
                    jetzt: mb(v.puffer + v.texturen),
                    puffer: mb(v.puffer),
                    texturen: mb(v.texturen),
                    spitze: mb(v.spitze),
                    nPuffer: v.nPuffer,
                    nTexturen: v.nTexturen,
                    wuchsImFenster: mb(v.puffer + v.texturen - (v0.puffer + v0.texturen)),
                    gross: window.__vramBericht ? window.__vramBericht(14) : null,
                },
                stellgroessen: {
                    loadScale: Number.isFinite(s.loadScale) ? +s.loadScale.toFixed(2) : null,
                    renderScale: st._renderScale != null ? +(+st._renderScale).toFixed(2) : null,
                    pixelRatio: rend.getPixelRatio ? rend.getPixelRatio() : null,
                    foliageRadius: st.foliageRadius != null ? Math.round(st.foliageRadius) : null,
                    foliageDichte: st._foliageDensityScale != null ? +(+st._foliageDensityScale).toFixed(2) : null,
                    archRadius: st.architectureCullingRadius != null ? Math.round(st.architectureCullingRadius) : null,
                    ring: st._activeRingRadius,
                    schattenIntervall: st._shadowMinInterval != null ? +(+st._shadowMinInterval).toFixed(1) : null,
                    holz: st._holzProfil,
                },
                phasenEwmaMs: s.phase
                    ? Object.fromEntries(Object.entries(s.phase).map(([a, b]) => [a, +(+b).toFixed(2)]))
                    : null,
                kamera: {
                    pos: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(1)),
                    blick: [dir.x, dir.y, dir.z].map((x) => +x.toFixed(2)),
                },
                chunks: st.voxelChunks ? st.voxelChunks.size : 0,
                ruhe,
                wetter: st.weather,
                saison: st.season,
            };
        } finally {
            messen = false;
            rend.setAnimationLoop(null);
            uhr.ab();
            st.perfTargetMs = decke;
        }
    })();
}

// Das CPU-Profil verdichten: Selbstzeit je Funktion (Name + Datei:Zeile) und Gesamtzeit (jede Funktion
// einmal je Stapel gezählt, Rekursion doppelt nie). Prozent beziehen sich auf die gesampelte Wanduhr.
function profilAuswerten(p, top) {
    const knoten = new Map(p.nodes.map((n) => [n.id, n]));
    const selbst = new Map();
    for (let i = 0; i < p.samples.length; i++) {
        const id = p.samples[i];
        selbst.set(id, (selbst.get(id) || 0) + (p.timeDeltas[i] || 0));
    }
    const gesamtUs = p.timeDeltas.reduce((a, b) => a + Math.max(0, b), 0) || 1;
    const name = (n) => {
        const c = n.callFrame;
        const datei = (c.url || "").split("/").pop().split("?")[0];
        return `${c.functionName || "(anonym)"} ${datei}:${c.lineNumber + 1}`;
    };
    const jeSelbst = new Map();
    const jeGesamt = new Map();
    const lauf = (id, stapel) => {
        const n = knoten.get(id);
        const k = name(n);
        const s = selbst.get(id) || 0;
        jeSelbst.set(k, (jeSelbst.get(k) || 0) + s);
        const neu = stapel.has(k) ? stapel : new Set(stapel).add(k);
        const summe = (n.children || []).reduce((a, c) => a + lauf(c, neu), s);
        if (!stapel.has(k)) jeGesamt.set(k, (jeGesamt.get(k) || 0) + summe);
        return summe;
    };
    lauf(p.nodes[0].id, new Set());
    const liste = (m) =>
        [...m.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, top)
            .map(
                ([k, us]) =>
                    `${((100 * us) / gesamtUs).toFixed(1).padStart(5)} %  ${(us / 1000).toFixed(0).padStart(6)} ms  ${k}`
            );
    return { gesampeltMs: Math.round(gesamtUs / 1000), selbst: liste(jeSelbst), gesamt: liste(jeGesamt) };
}

// DIE GPU-BANK (Seiten-Kontext): n Frames direkt hintereinander rendern (ohne rAF, ohne VSync), dann auf die GPU
// warten. Liegt die GPU je Frame über der CPU, ist Gesamtzeit / n die reine GPU-Zeit je Frame — die rAF-Kadenz rastet
// am VSync ein und misst nur bei tiefer Schlange die GPU (gemessen 04.10.: 33,5 ms „Boden" war CPU 16 ms + VSync).
function gpuBank(k) {
    return (async () => {
        const r = window.anazhRealm;
        const rend = r.state.renderer;
        const q = rend.backend && rend.backend.device ? rend.backend.device.queue : null;
        if (!q) return { fehler: "kein GPU-Device" };
        rend.setAnimationLoop(null);
        window.__buehne();
        // DIE EINE BANK-RUNDE (scripts/lib/zerlege-linse.cjs) — dieselbe Messung, die `zerlegen` je Schalter fährt.
        const runde = (n) => window.__bankRunde(n);
        await runde(3); // warm
        const n = k.n || 12;
        const rr = [];
        for (let i = 0; i < (k.runden || 3); i++) rr.push(await runde(n));
        const med = (key) => {
            const v = rr.map((x) => x[key]).sort((a, b) => a - b);
            return +v[Math.floor(v.length / 2)].toFixed(2);
        };
        const jeFrame = med("jeFrame"),
            cpu = med("cpuJeFrame");
        return {
            n,
            runden: rr.length,
            gpuJeFrameMs: jeFrame,
            cpuJeFrameMs: cpu,
            gpuGebunden: jeFrame > cpu * 1.15,
            nachlaufMs: med("nachlauf"),
        };
    })();
}

// DAS EINSCHWINGEN DER BAND-MESSUNG (Seiten-Kontext): der Spiel-Takt läuft mit der Bühne (Mittag · Sonne · Sommer),
// bis der Bau ruht — die Foundry-Schlange leer und kein Auftrag im Flug, kein Karten-Bake offen, kein Streu-Nachschub,
// keine aufgeschobene Streu-Region, kein Chunk im Bau, und die Zahl der Chunks, der lebenden Instanzen und der
// ungebauten Bauten in der Mesh-Zone steht
// still — `ruhig` Takte am Stück. Ein Bau, der in Ruhe ungebaut bleibt (Bake-Lücke), steht im Ergebnis, er hält das
// Einschwingen nicht auf. Deckel `capMs`: dann `eingeschwungen: false`, und die Ratsche verweigert den Nachzug — ein
// Einzelbild der wachsenden Welt pinnte sonst ihre halbe Gestalt (drei Läufe am selben Ort: Tier 7/88/110, Boden
// 29/72/37, Baum 30/87/51).
function bandEinschwingen(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const f = r._foundry;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const RUHIG = k.ruhig || 30;
        // DIE VOLLE WELT: der Regler misst hier Takte mit 50 ms Pause (65 ms je Frame) und drosselte auf loadScale 0 —
        // je nach Vorgeschichte stand die Messung auf einer anderen Welt (Streu-Stufen, Laub-Radius). Die Decke geht hoch
        // (`perfTargetMs` 1000, wie `lauf --regler voll`), der PID wächst auf 1: das Band misst die volle Welt. Die
        // Werkbank setzt die Decke nach den Proben zurück.
        if (window.__bandDecke == null) window.__bandDecke = st.perfTargetMs;
        st.perfTargetMs = 1000;
        const t0 = performance.now();
        const dl = t0 + (k.capMs || 240000);
        let takte = 0,
            ruhig = 0,
            vor = null,
            o = {};
        const stand = () => {
            const pm = st.playerMesh.position;
            const rad2 = st.architectureCullingRadius * st.architectureCullingRadius;
            let ungebaut = 0;
            for (const e of st.architectures || []) {
                const dx = e.position.x - pm.x,
                    dz = e.position.z - pm.z;
                if (dx * dx + dz * dz <= rad2 && !r._archIsRendered(e)) ungebaut++;
            }
            let instanzen = 0;
            if (st.archInstanceGroups) for (const g of st.archInstanceGroups.values()) instanzen += g.mesh ? g.mesh.count : 0;
            const ls = st.perfSense ? +st.perfSense.loadScale.toFixed(3) : 1;
            return { chunks: st.voxelChunks ? st.voxelChunks.size : 0, instanzen, ungebaut, loadScale: ls };
        };
        while (performance.now() < dl) {
            try {
                window.__buehne();
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            takte++;
            o = {};
            if (f && f.warte && f.warte.length) o.foundryWarte = f.warte.length;
            if (f && f.pending && f.pending.size) o.foundryImFlug = f.pending.size;
            const kb = (r._impostorBakeQueue || []).length + (r._impostorBakePending ? 1 : 0);
            if (kb) o.kartenBake = kb;
            if (r._scatterRefillPending) o.streuNachschub = 1;
            if (st.voxelMeshPending && st.voxelMeshPending.size) o.chunkBau = st.voxelMeshPending.size;
            // Eine aufgeschobene Streu-Region wartet auf ein Asset oder eine Karte — ruhig ist die Welt erst ohne sie
            // (eine, die in Ruhe aufgeschoben bleibt, ist ein Befund: die Messung schwingt nicht ein).
            let aufgeschoben = 0;
            if (st.scatterRegions) for (const reg of st.scatterRegions.values()) if (reg._deferredFoundry) aufgeschoben++;
            if (aufgeschoben) o.streuAufgeschoben = aufgeschoben;
            const s = stand();
            if (s.loadScale < 1) o.loadScale = s.loadScale;
            if (vor) for (const key of Object.keys(s)) if (s[key] !== vor[key]) o[key] = `${vor[key]}→${s[key]}`;
            vor = s;
            ruhig = Object.keys(o).length ? 0 : ruhig + 1;
            if (takte >= 40 && ruhig >= RUHIG) break;
            await sleep(50);
        }
        return {
            eingeschwungen: ruhig >= RUHIG,
            takte,
            ms: Math.round(performance.now() - t0),
            stand: vor,
            offen: Object.keys(o).length ? o : null,
        };
    })();
}

// DIE PROBEN DER BAND-MESSUNG (Seiten-Kontext): `n` Zähl-Frames, zwischen zweien `zwischen` Spiel-Takte mit der Bühne
// (die Tiere wandern, der Takt rechnet weiter) — die Werkbank nimmt je Klasse × Pass das Maximum (`zensusMax`).
function bandProben(k) {
    return (async () => {
        const r = window.anazhRealm;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const proben = [];
        for (let i = 0; i < (k.n || 6); i++) {
            if (i)
                for (let t = 0; t < (k.zwischen || 20); t++) {
                    try {
                        window.__buehne();
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    await sleep(50);
                }
            window.__buehne();
            try {
                if (r.state.fernRing) r._tickFeldPass(r.state.fernRing);
            } catch (_e) {}
            proben.push(await window.__drawZensus({ alle: true }));
        }
        return proben;
    })();
}

// ── Server ──────────────────────────────────────────────────────────────────────────────────────
async function starte() {
    const puppeteer = require("puppeteer");
    const { softwareWebGpuArgs, echteWebGpuArgs } = require("./lib/software-gpu.cjs");
    const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".wasm": "application/wasm",
        ".json": "application/json",
        ".css": "text/css",
        ".png": "image/png",
        ".woff2": "font/woff2",
    };
    const seiten = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/") p = "/index.html";
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    if (ECHT) {
        // Der Flugschreiber schreibt nur vom save-server-Ursprung (isSaveServerHost) — ohne ihn kein Echt-Lauf.
        const da = await new Promise((r) =>
            http.get(ECHT_SEITE + "/", (res) => (res.resume(), r(res.statusCode === 200))).on("error", () => r(false))
        );
        if (!da) throw new Error(`--echt braucht den save-server auf ${ECHT_SEITE} (npm start)`);
    } else await new Promise((r) => seiten.listen(SEITEN_PORT, "127.0.0.1", r));
    // DAS PROFIL DER MESS-SERIE: ohne eigenes Profil legte puppeteer je Start ein namenloses an — jede Zahl war eine
    // Erst-Boot-Zahl („17 von 319 von der Platte"). Scratch je Start (beim `stop` gelöscht) oder benannt (`--serie`).
    const profil = SERIE
        ? path.join(root, "artifacts", "werkbank", "profil-" + SERIE.replace(/[^a-z0-9_-]+/gi, "_"))
        : path.join(require("os").tmpdir(), `werkbank-profil-${PORT}-${Date.now()}`);
    const serieNeu = !fs.existsSync(profil);
    fs.mkdirSync(profil, { recursive: true });
    const boot = { serie: SERIE || null, profil, serieNeu, ladungen: 0 };
    const bootArt = () => (boot.serieNeu && boot.ladungen <= 1 ? "erst" : "zweit");
    const browser = await puppeteer.launch({
        headless: !ECHT,
        userDataDir: profil,
        protocolTimeout: 3600000,
        defaultViewport: ECHT ? { width: 1920, height: 1080, deviceScaleFactor: 1 } : null,
        // Echt: der Hardware-Adapter; sonst swiftshader — die Schalter je Plattform trägt das EINE Rezept (die alte
        // Vulkan-Kopie lieferte unter Windows keinen Adapter: die Werkbank fuhr ohne --echt still WebGL2).
        args: ECHT ? [...echteWebGpuArgs(), "--window-size=1940,1200"] : softwareWebGpuArgs(),
    });
    const page = await browser.newPage();
    if (!ECHT) await page.setViewport({ width: 640, height: 360 });
    await page.evaluateOnNewDocument(FALTE_INSTALL);
    await page.evaluateOnNewDocument(vramAbgriff);
    const fehler = [];
    const zerstoert = { n: 0 };
    page.on("pageerror", (e) => fehler.push((e.message || String(e)).split("\n")[0]));
    // Der Tod der Seite beim NAMEN (04.10.: zweimal „detached Frame" ohne Spur — Absturz, Schließen oder
    // Navigation waren nicht zu unterscheiden): jedes Ende landet mit Uhrzeit im Werkbank-Log.
    const tod = (was) => console.log(`[seite] ${new Date().toISOString()} ${was}`);
    page.on("error", (e) => tod("ABSTURZ " + ((e && e.message) || e)));
    page.on("close", () => tod("GESCHLOSSEN"));
    page.on("framenavigated", (f) => {
        if (f === page.mainFrame()) tod("navigiert " + f.url());
    });
    browser.on("disconnected", () => tod("Browser getrennt"));
    // WebGPU-Validierung meldet sich nur als Konsolen-Fehler (kein pageerror) — die Wahrheit über schwarze Bilder.
    page.on("console", (m) => {
        if (/Destroyed texture|Destroyed buffer/.test(m.text())) zerstoert.n++;
        if (m.type() === "error" || /WebGPU|GPUValidation|Invalid/.test(m.text()))
            fehler.push(("[konsole] " + m.text()).split("\n").slice(0, 3).join(" | ").slice(0, 400));
        if (fehler.length > 200) fehler.splice(0, fehler.length - 200);
    });
    const lade = async () => {
        boot.ladungen++;
        const basis = ECHT ? ECHT_SEITE : `http://127.0.0.1:${SEITEN_PORT}`;
        await page.goto(`${basis}/index.html${HOLZ ? `?holz=${HOLZ}` : ""}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate(LINSEN_INSTALL);
        await page.evaluate(ZAEHLER_INSTALL);
        await page.evaluate(FLUSS_INSTALL);
        await page.evaluate(TAKT_INSTALL);
        await page.evaluate(FERNWALD_INSTALL);
        await page.evaluate(ZL.ZERLEGE_INSTALL);
        await page.evaluate(async () => {
            const dl = performance.now() + 300000;
            while (
                (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 200));
        });
    };
    await lade();
    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));

    const umstellen = (x, z) =>
        page.evaluate(
            async (x, z) => {
                const r = window.anazhRealm;
                const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
                r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                let stabil = 0,
                    last = -1,
                    takte = 0;
                const dl = performance.now() + 150000;
                while (performance.now() < dl) {
                    try {
                        window.__buehne();
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    takte++;
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stabil++;
                    else {
                        stabil = 0;
                        last = sz;
                    }
                    if (takte >= 40 && stabil >= 15) break;
                    await sleep(50);
                }
                return { takte, chunks: last };
            },
            x,
            z
        );

    const bild = (k) =>
        page.evaluate(async (k) => {
            const r = window.anazhRealm;
            const rend = r.state.renderer;
            const boden = (x, z, v) =>
                typeof v === "string" && v[0] === "+" ? r._voxelSurfaceY(x, z) + Number(v.slice(1)) : Number(v);
            const px = Number(k.px),
                pz = Number(k.pz),
                lx = Number(k.lx),
                lz = Number(k.lz);
            const py = boden(px, pz, k.py),
                ly = boden(lx, lz, k.ly);
            rend.setAnimationLoop(null);
            window.__buehne();
            const cam = r.state.camera;
            cam.position.set(px, py, pz);
            cam.lookAt(lx, ly, lz + 1e-4);
            cam.updateMatrixWorld(true);
            if (r.state.playerMesh) r.state.playerMesh.visible = false;
            let auf = null;
            for (let i = 0; i < 2; i++) {
                try {
                    if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing);
                } catch (_e) {}
                r._schattenAlleNeu();
                auf = await window.__ausgabeAufnahme(k.w, k.h, 1);
            }
            // Die Welt RUHT zwischen den Befehlen (nur `umstellen` tickt): im Leerlauf fraß der Loop unter
            // swiftshader ~3 Kerne und verfälschte jede andere Messung.
            window.__letzteAufnahme = auf.u8;
            const u8 = auf.u8,
                W = k.w,
                H = k.h;
            const lum = (i) => 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
            let n = 0,
                l = 0,
                k2 = 0;
            for (let y = Math.floor(H / 2); y < H - 1; y++)
                for (let x = 0; x < W - 1; x++) {
                    const i = (y * W + x) * 4;
                    const a = lum(i);
                    l += a;
                    k2 += Math.abs(a - lum(i + 4)) + Math.abs(a - lum(i + W * 4));
                    n++;
                }
            const cv = document.createElement("canvas");
            cv.width = W;
            cv.height = H;
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(W, H);
            img.data.set(u8.subarray(0, W * H * 4));
            ctx.putImageData(img, 0, 0);
            return {
                kamera: [px, py, pz].map((v) => +v.toFixed(2)),
                hell: +(l / n).toFixed(1),
                kontrast: +(k2 / (2 * n)).toFixed(2),
                dc: auf.info.drawCalls,
                dreiecke: auf.info.triangles,
                ms: Math.round(auf.ms),
                png: cv.toDataURL("image/png"),
            };
        }, k);

    const steuer = http.createServer((req, res) => {
        let d = "";
        req.on("data", (c) => (d += c));
        req.on("end", async () => {
            const send = (o) => {
                if (res.headersSent) return;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(o));
            };
            let b = {};
            try {
                b = d ? JSON.parse(d) : {};
            } catch (_e) {}
            const t0 = Date.now();
            try {
                // DER SCHIRM: was der Spieler sieht — der präsentierte Canvas nach einer Sekunde echter Loop.
                if (req.url === "/schirm") {
                    await page.evaluate(lauf, { sek: 0.5, ein: 1, regler: b.regler || "frei" });
                    await page.evaluate(() => {
                        const r = window.anazhRealm;
                        r.state.renderer.setAnimationLoop((t) => r._gameLoopTick(t));
                    });
                    await new Promise((res) => setTimeout(res, 300));
                    const datei = path.resolve(
                        b.datei || path.join(root, "artifacts", "werkbank", `schirm-${Date.now()}.png`)
                    );
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
                    await page.screenshot({ path: datei });
                    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
                    return send({ datei, ms: Date.now() - t0 });
                }
                // DAS FENSTER: Viewport wechseln wie ein Spieler (Fenster ziehen, Vollbild) — feuert das resize-Ereignis.
                if (req.url === "/fenster") {
                    await page.setViewport({ width: +b.w || 1920, height: +b.h || 1080, deviceScaleFactor: 1 });
                    return send({ fenster: [+b.w || 1920, +b.h || 1080], ms: Date.now() - t0 });
                }
                if (req.url === "/gpu-bank")
                    return send(
                        Object.assign(await page.evaluate(gpuBank, { n: +b.n || 12, runden: +b.runden || 3 }), {
                            ms: Date.now() - t0,
                        })
                    );
                if (req.url === "/status") {
                    const s = await page.evaluate(() => {
                        const st = window.anazhRealm.state;
                        const p = st.playerMesh.position;
                        return {
                            spieler: [p.x, p.y, p.z].map((v) => +v.toFixed(1)),
                            chunks: st.voxelChunks ? st.voxelChunks.size : 0,
                            wetter: st.weather,
                            saison: st.season,
                        };
                    });
                    return send(
                        Object.assign(s, {
                            boot: Object.assign({ art: bootArt() }, boot),
                            zerstoert: zerstoert.n,
                            fehler: fehler.slice(-12),
                        })
                    );
                }
                if (req.url === "/umstellen")
                    return send(Object.assign(await umstellen(+b.x, +b.z), { ms: Date.now() - t0 }));
                if (req.url === "/bild") {
                    const o = await bild(Object.assign({ w: 640, h: 360 }, b));
                    const datei = path.resolve(
                        b.datei || path.join(root, "artifacts", "werkbank", `bild-${Date.now()}.png`)
                    );
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
                    fs.writeFileSync(datei, Buffer.from(o.png.split(",")[1], "base64"));
                    delete o.png;
                    return send(Object.assign(o, { datei, gesamtMs: Date.now() - t0 }));
                }
                if (req.url === "/eval") {
                    const o = await page.evaluate(
                        (code) =>
                            new Function("r", "T", `return (async () => { ${code} })();`)(
                                window.anazhRealm,
                                window.THREE
                            ),
                        b.code
                    );
                    return send({ ergebnis: o, ms: Date.now() - t0 });
                }
                if (req.url === "/methode") {
                    const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
                    const src = methodeAusQuelle(quelle, b.name);
                    if (!src) return send({ fehler: `Methode ${b.name} nicht gefunden` });
                    const o = await page.evaluate(
                        (name, src, terrain) => {
                            const r = window.anazhRealm;
                            const fn = (0, eval)(src);
                            Object.getPrototypeOf(r)[name] = fn;
                            const aus = { getauscht: name };
                            if (terrain) {
                                const alt = r.state.voxelChunkMaterial;
                                r.state.voxelChunkMaterial = null;
                                const neu = r._getVoxelChunkMaterial();
                                let n = 0;
                                r.state.scene.traverse((m) => {
                                    if (m.material === alt) {
                                        m.material = neu;
                                        n++;
                                    }
                                });
                                aus.chunksNeu = n;
                            }
                            return aus;
                        },
                        b.name,
                        src,
                        !!b.terrain
                    );
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/albedo") {
                    const liste = await page.evaluate((o) => window.__albedoSicht(o), { nur: b.nur || null });
                    const ordner = path.resolve(b.ordner || path.join(root, "artifacts", "werkbank", "albedo"));
                    fs.mkdirSync(ordner, { recursive: true });
                    for (const e of liste) {
                        fs.writeFileSync(
                            path.join(ordner, e.name.replace(/[^a-z0-9_-]+/gi, "_") + ".png"),
                            Buffer.from(e.png.split(",")[1], "base64")
                        );
                        delete e.png;
                    }
                    return send({ klassen: liste, ordner, ms: Date.now() - t0 });
                }
                if (req.url === "/takt") {
                    const o = await page.evaluate((k) => window.__taktZerlegung(k), {
                        n: Number(b.n) || 120,
                        extra: b.extra ? String(b.extra).split(",") : [],
                    });
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/fluss") {
                    const o = await page.evaluate(() => {
                        const i = window.__flussLinse();
                        return i && i.installiert ? i : window.__flussBericht();
                    });
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/zaehlen") {
                    const o = await page.evaluate(async (k) => {
                        const r = window.anazhRealm;
                        window.__buehne();
                        if (k.px != null) {
                            const boden = (x, z, v) =>
                                typeof v === "string" && v[0] === "+"
                                    ? r._voxelSurfaceY(x, z) + Number(v.slice(1))
                                    : Number(v);
                            const cam = r.state.camera;
                            cam.position.set(+k.px, boden(+k.px, +k.pz, k.py), +k.pz);
                            cam.lookAt(+k.lx, boden(+k.lx, +k.lz, k.ly), +k.lz + 1e-4);
                            cam.updateMatrixWorld(true);
                        }
                        try {
                            if (r.state.fernRing) r._tickFeldPass(r.state.fernRing);
                        } catch (_e) {}
                        return window.__drawZensus({ top: 16, alle: !!k.alle });
                    }, b);
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                // DIE BAND-LINSE: ein Zähl-Frame (alle Klassen) + der VRAM je Erzeuger + die Szenen-Puffer je Klasse +
                // die GPU-Bank (nur mit GPU-Device) + der Fluss — geurteilt gegen Haushalt und Ratsche (spec/profiband).
                if (req.url === "/band") {
                    // DIE BAND-MESSUNG: einschwingen (bis der Bau ruht), Proben (das Maximum je Klasse × Pass), dann der
                    // VRAM je Erzeuger, die Szenen-Puffer je Klasse, der Fluss und die GPU-Bank — geurteilt gegen Haushalt
                    // und Ratsche (spec/profiband).
                    const messung = await page.evaluate(bandEinschwingen, {
                        capMs: Number(b.capMs) || 240000,
                        ruhig: Number(b.ruhig) || 30,
                    });
                    const proben = await page.evaluate(bandProben, { n: Number(b.proben) || 6, zwischen: 20 });
                    const roh = await page.evaluate(() => {
                        // Die Regler-Decke zurück (bandEinschwingen hob sie für die volle Welt).
                        if (window.__bandDecke != null) {
                            window.anazhRealm.state.perfTargetMs = window.__bandDecke;
                            window.__bandDecke = null;
                        }
                        // Der Textur-Zensus zuerst: er bucht die über ihr Ziel benannten Texturen im Abgriff um.
                        const texturen = window.__texturZensus();
                        const v = window.__vram;
                        const mb = (x) => +(x / 1048576).toFixed(1);
                        const pm = window.anazhRealm.state.playerMesh.position;
                        return {
                            texturen,
                            spieler: [pm.x, pm.z].map((x) => +x.toFixed(1)),
                            vram:
                                v && v.nTexturen + v.nPuffer > 0
                                    ? {
                                          mb: mb(v.puffer + v.texturen),
                                          puffer: mb(v.puffer),
                                          texturen: mb(v.texturen),
                                          spitze: mb(v.spitze),
                                          liste: window.__vramBericht(100000),
                                      }
                                    : null,
                            puffer: window.__pufferZensus(),
                            fluss: window.__flussBericht ? window.__flussBericht() : null,
                        };
                    });
                    const gpu = await page.evaluate(gpuBank, { n: 12, runden: 3 });
                    const { haushalt, ratsche } = BAND.ladeSpec();
                    const zensus = BAND.zensusMax(proben);
                    const u = BAND.bandUrteil({
                        zensus,
                        vram: roh.vram,
                        texturen: roh.texturen,
                        gpu: gpu && !gpu.fehler ? gpu : null,
                        haushalt,
                        ratsche,
                    });
                    // Der Foundry-Kanal dieser Ladung über alle Antwort-Arten (asset · impostor · book …): Platte gegen
                    // Neubau — im Zweit-Boot der Serie die Neubau-Zahl, die der Spieler beim zweiten Start bezahlt.
                    let fl = null;
                    for (const k of Object.values((roh.fluss && roh.fluss.kanal) || {})) {
                        fl = fl || { n: 0, platte: 0, mb: 0, platteMb: 0, neuMb: 0 };
                        for (const f of Object.keys(fl)) fl[f] += k[f] || 0;
                    }
                    if (fl) for (const f of ["mb", "platteMb", "neuMb"]) fl[f] = +fl[f].toFixed(1);
                    const am = haushalt.messort.spieler;
                    const amMessort = Math.hypot(roh.spieler[0] - am[0], roh.spieler[1] - am[1]) <= 8;
                    Object.assign(u, {
                        kamera: proben.length ? proben[proben.length - 1].kamera : null,
                        spieler: roh.spieler,
                        amMessort,
                        boot: { art: bootArt(), serie: boot.serie, ladungen: boot.ladungen },
                        messung: Object.assign({ proben: proben.length }, messung),
                        fluss: fl,
                        gpu,
                        puffer: roh.puffer,
                        unbenannt: zensus.unbenannt,
                        frameMs: proben.map((z) => z.frameMs),
                        programme: proben.length ? proben[proben.length - 1].programme : null,
                        // je Probe die Summe je Pass: die Streuung, aus der die Toleranz der Ratsche kommt
                        proben: proben.map((z) => z.passe),
                    });
                    const datei = path.resolve(
                        b.datei || path.join(root, "artifacts", "werkbank", `band-${Date.now()}.json`)
                    );
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
                    // Das ROHE der Messung reist mit: `werkbank ratsche` urteilt eine Serie neu (gegen den Haushalt von
                    // heute) und nimmt ihre Hülle — nie einen einzelnen Lauf.
                    Object.assign(u, {
                        echt: ECHT,
                        roh: { zensus: zensus.klassen, vram: roh.vram, texturen: roh.texturen },
                    });
                    fs.writeFileSync(datei, JSON.stringify(u, null, 1));
                    return send({
                        urteil: u.urteil,
                        linse: u.linse,
                        tabelle: BAND.bandTabelle(u),
                        datei,
                        ms: Date.now() - t0,
                    });
                }
                // DIE GPU-ZERLEGUNG (scripts/lib/zerlege-linse.cjs): Inventur (ein Zähl-Frame + Pass-Baum + Frame-Anatomie) →
                // Schalter aus dem echten Weg → ABBA je Schalter mit der Bank-Runde → Beleg je Schalter → Tabelle.
                if (req.url === "/zerlegen") {
                    const n = Number(b.n) || 12;
                    const runden = Math.max(4, Number(b.runden) || 4);
                    const kette = ZL.KETTE.map((x) => x.uniform);
                    let last = null;
                    if (b.selbsttest) {
                        await page.evaluate(() => {
                            window.__zerlegeVorSelbst = window.__zerlegeZustand();
                        });
                        last = await page.evaluate((k) => window.__zerlegeLast(k), {
                            an: true,
                            iter: Number(b.last) || 96,
                        });
                        if (!last || last.fehler) return send(Object.assign({ fehler: "Selbsttest-Last" }, last || {}));
                    }
                    try {
                        const inv = await page.evaluate((k) => window.__zerlegeInventur(k), { n, kette });
                        if (inv.fehler) return send(inv);
                        const { haushalt } = BAND.ladeSpec();
                        const sch = ZL.zerlegeSchalter(inv, haushalt, {
                            nur: b.nur ? String(b.nur).split(",") : null,
                            unbekannteImmer: !!b.selbsttest,
                        });
                        const roh = await page.evaluate((k) => window.__zerlegeMessen(k), {
                            schalter: sch.schalter,
                            n,
                            runden,
                            bilder: !!b.bilder,
                        });
                        if (roh.fehler) return send(roh);
                        // Die Bilder des Belegs (Ausgabe-Pfad, AN einmal, AUS je Schalter) in den Ordner, nie ins JSON.
                        let ordner = null;
                        if (b.bilder) {
                            ordner = path.resolve(
                                typeof b.bilder === "string"
                                    ? b.bilder
                                    : path.join(root, "artifacts", "werkbank", `zerlegen-${Date.now()}`)
                            );
                            fs.mkdirSync(ordner, { recursive: true });
                            const schreibe = (name, png) =>
                                fs.writeFileSync(path.join(ordner, name), Buffer.from(png.split(",")[1], "base64"));
                            if (roh.bildAn) schreibe("00-an.png", roh.bildAn);
                            delete roh.bildAn;
                            roh.schalter.forEach((e, i) => {
                                if (e.beleg && e.beleg.bild) {
                                    schreibe(
                                        `${String(i + 1).padStart(2, "0")}-${e.id.replace(/[^a-z0-9_-]+/gi, "_")}-aus.png`,
                                        e.beleg.bild
                                    );
                                    delete e.beleg.bild;
                                }
                            });
                        }
                        const a = ZL.zerlegeAuswerten(roh, sch.schalter);
                        let selbst = null;
                        if (last) {
                            await page.evaluate((k) => window.__zerlegeLast(k), { an: false });
                            last.weg = true;
                            const inv2 = await page.evaluate((k) => window.__zerlegeInventur(k), { n: 3, kette });
                            const zurueck = await page.evaluate(() =>
                                window.__zerlegeVergleich(window.__zerlegeVorSelbst, window.__zerlegeZustand())
                            );
                            const z = a.zeilen.find((x) => x.id === "pass:zerlege-selbsttest");
                            const toleranzMs = +Math.max(1, 0.35 * last.alleinMs).toFixed(2);
                            selbst = {
                                iter: last.iter,
                                ziel: last.ziel,
                                alleinMs: last.alleinMs,
                                alleinWerte: last.alleinWerte,
                                deltaMs: z ? z.deltaMs : null,
                                streuungMs: z ? z.streuungMs : null,
                                // die Stempel-Probe: was der r184-Pass-Stempel von dieser bekannten Last sieht
                                stempelMs: a.stempelJePass ? a.stempelJePass["zerlege-selbsttest"] : null,
                                toleranzMs,
                                gefunden: !!z,
                                plausibel:
                                    !!z &&
                                    Math.abs(z.deltaMs - last.alleinMs) <= toleranzMs &&
                                    z.deltaMs > 2 * z.streuungMs,
                                verschwunden: !inv2.passe.some((p) => p.name === "zerlege-selbsttest"),
                                zurueck,
                            };
                            selbst.urteil =
                                selbst.gefunden && selbst.plausibel && selbst.verschwunden && !zurueck.length
                                    ? "GRUEN"
                                    : "ROT";
                        }
                        const datei = path.resolve(
                            b.json || path.join(root, "artifacts", "werkbank", `zerlegen-${Date.now()}.json`)
                        );
                        fs.mkdirSync(path.dirname(datei), { recursive: true });
                        fs.writeFileSync(
                            datei,
                            JSON.stringify(
                                {
                                    echt: ECHT,
                                    boot: { art: bootArt(), serie: boot.serie, ladungen: boot.ladungen },
                                    inventur: inv,
                                    schalter: sch,
                                    auswertung: a,
                                    roh,
                                    selbsttest: selbst,
                                },
                                null,
                                1
                            )
                        );
                        let tabelle = ZL.zerlegeTabelle(a, inv, sch);
                        if (selbst)
                            tabelle +=
                                `\n\nSELBSTTEST ${selbst.urteil}: eingeschmuggelter Vollbild-Pass (${selbst.iter} Runden sin/cos, ` +
                                `${selbst.ziel.join("×")}) allein ${selbst.alleinMs} ms, als Posten pass:zerlege-selbsttest ` +
                                `${selbst.gefunden ? selbst.deltaMs + " ± " + selbst.streuungMs + " ms" : "NICHT GEFUNDEN"} ` +
                                `(Toleranz ± ${selbst.toleranzMs} ms: ${selbst.plausibel ? "plausibel" : "NICHT plausibel"}); ` +
                                `ohne ihn: Posten ${selbst.verschwunden ? "verschwunden" : "NOCH DA"}, Zustand ` +
                                `${selbst.zurueck.length ? "NICHT zurück (" + selbst.zurueck.join(" · ") + ")" : "zurück"}` +
                                `\nSTEMPEL-PROBE: der r184-Pass-Stempel derselben Last zeigt ${selbst.stempelMs} ms ` +
                                `(${selbst.stempelMs != null && selbst.alleinMs ? Math.round((100 * selbst.stempelMs) / selbst.alleinMs) : "–"} % ` +
                                "ihrer Kosten allein) — so viel Fragment-Arbeit sehen die Stempel dieses Geräts";
                        const ok =
                            !a.zurueck.length &&
                            !a.fenster.some((e) => !e.geschluckt) &&
                            a.zeilen.every((z) => z.geschaltet !== false) &&
                            (!selbst || selbst.urteil === "GRUEN");
                        return send({ tabelle, ok, datei, ordner, selbsttest: selbst, ms: Date.now() - t0 });
                    } finally {
                        if (last && !last.weg) await page.evaluate((k) => window.__zerlegeLast(k), { an: false });
                    }
                }
                if (req.url === "/lauf") {
                    const o = await page.evaluate(lauf, {
                        sek: Number(b.sek) || 20,
                        ein: b.ein != null ? Number(b.ein) : 30,
                        ruhe: Number(b.ruhe) || 0,
                        regler: b.regler || "frei",
                        tiere: b.tiere || "halten",
                    });
                    return send(Object.assign(o, { fehler: fehler.slice(-5), ms: Date.now() - t0 }));
                }
                if (req.url === "/profil") {
                    const cdp = await page.target().createCDPSession();
                    await cdp.send("Profiler.enable");
                    await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
                    await cdp.send("Profiler.start");
                    const l = await page.evaluate(lauf, {
                        sek: Number(b.sek) || 8,
                        ein: 2,
                        regler: b.regler || "voll",
                        tiere: b.tiere || "halten",
                    });
                    const { profile } = await cdp.send("Profiler.stop");
                    await cdp.detach();
                    return send(
                        Object.assign(profilAuswerten(profile, Number(b.top) || 30), {
                            fps: l.fps,
                            ms: Date.now() - t0,
                        })
                    );
                }
                if (req.url === "/licht")
                    return send(
                        Object.assign(await page.evaluate(() => window.__lichtBilanz()), { ms: Date.now() - t0 })
                    );
                if (req.url === "/fernwald")
                    return send(
                        Object.assign(
                            await page.evaluate((o) => window.__fernwaldLinse(o), {
                                blicke: b.blicke ? String(b.blicke).split(",") : null,
                                w: Number(b.w) || 1280,
                                h: Number(b.h) || 720,
                            }),
                            { ms: Date.now() - t0 }
                        )
                    );
                if (req.url === "/reload") {
                    await lade();
                    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
                    return send({ neu: true, ms: Date.now() - t0 });
                }
                if (req.url === "/stop") {
                    send({ stop: true });
                    // Ports SOFORT frei geben (sonst fand ein Neustart :4489 noch belegt — gemessen 01.10.).
                    seiten.close();
                    steuer.close();
                    // Eine tote Seite lässt close() werfen — der catch unten sendete dann ein zweites Mal
                    // (ERR_HTTP_HEADERS_SENT) und riss den Prozess ohne Chrome-Abbau herunter.
                    await browser.close().catch((e) => tod("close: " + ((e && e.message) || e)));
                    // Das Scratch-Profil stirbt mit der Serie; ein benanntes (`--serie`) bleibt für den nächsten Start.
                    if (!SERIE)
                        try {
                            fs.rmSync(profil, { recursive: true, force: true, maxRetries: 5 });
                        } catch (e) {
                            tod("Profil bleibt liegen: " + ((e && e.message) || e));
                        }
                    process.exit(0);
                }
                send({ fehler: "unbekannter Weg " + req.url });
            } catch (e) {
                send({ fehler: String((e && e.message) || e).split("\n")[0], ms: Date.now() - t0 });
            }
        });
    });
    await new Promise((r) => steuer.listen(PORT, "127.0.0.1", r));
    console.log(`WERKBANK bereit: Steuer 127.0.0.1:${PORT} · Seite :${SEITEN_PORT}`);
}

(async () => {
    const cmd = argv[0];
    if (cmd === "start") return starte();
    const a = argv.slice(1).filter((x, i, arr) => !x.startsWith("--") && !(i > 0 && arr[i - 1].startsWith("--")));
    let o;
    if (cmd === "status") o = await rufe("/status");
    else if (cmd === "umstellen") o = await rufe("/umstellen", { x: a[0], z: a[1] });
    else if (cmd === "bild")
        o = await rufe("/bild", {
            px: a[0],
            py: a[1],
            pz: a[2],
            lx: a[3],
            ly: a[4],
            lz: a[5],
            datei: opt("--datei"),
            w: Number(opt("--w", 640)),
            h: Number(opt("--h", 360)),
        });
    else if (cmd === "methode") o = await rufe("/methode", { name: a[0], terrain: argv.includes("--terrain") });
    else if (cmd === "eval") o = await rufe("/eval", { code: a[0] });
    else if (cmd === "albedo") o = await rufe("/albedo", { nur: opt("--nur"), ordner: opt("--ordner") });
    else if (cmd === "licht") o = await rufe("/licht");
    else if (cmd === "fernwald") o = await rufe("/fernwald", { blicke: opt("--blicke"), w: opt("--w"), h: opt("--h") });
    else if (cmd === "fluss") o = await rufe("/fluss", {});
    else if (cmd === "takt") o = await rufe("/takt", { n: a[0], extra: opt("--extra", "") });
    else if (cmd === "zaehlen")
        o = await rufe(
            "/zaehlen",
            Object.assign(
                { alle: argv.includes("--alle") },
                a.length >= 6 ? { px: a[0], py: a[1], pz: a[2], lx: a[3], ly: a[4], lz: a[5] } : {}
            )
        );
    else if (cmd === "band") {
        o = await rufe("/band", {
            datei: opt("--datei"),
            proben: opt("--proben"),
            capMs: opt("--cap") ? Number(opt("--cap")) * 1000 : undefined,
        });
        if (o && o.tabelle) {
            console.log(o.tabelle + "\n\n" + (o.datei || ""));
            process.exit(o.urteil === "GRUEN" ? 0 : 1);
        }
    } else if (cmd === "ratsche") {
        // DIE RATSCHE AUS EINER SERIE (nur Node, keine Welt nötig): jede Datei ist eine Band-Messung der echten GPU am
        // Messort, eingeschwungen; die Serie trägt mindestens vier Läufe aus Erst- UND Zweit-Boot. Die Hülle (Maximum je
        // Klasse × Pass, VRAM je Erzeuger) wird gegen den Haushalt von heute geurteilt — nur bei sauberer LINSE zieht
        // sie nach (setzt ungemessene Felder, senkt gemessene, hebt nie).
        const dateien = a.map((f) => path.resolve(f));
        const laeufe = dateien.map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
        const { haushalt, ratsche } = BAND.ladeSpec();
        const fehler = [];
        if (laeufe.length < 4) fehler.push(`${laeufe.length} Läufe — die Serie braucht mindestens vier`);
        const boots = new Set(laeufe.map((u) => u.boot && u.boot.art));
        if (!boots.has("erst") || !boots.has("zweit")) fehler.push(`Boot-Arten ${[...boots].join("/")} — Erst- UND Zweit-Boot`);
        laeufe.forEach((u, i) => {
            const n = path.basename(dateien[i]);
            if (!u.roh) fehler.push(`${n}: kein Rohes (eine Messung vor der Serien-Ratsche)`);
            if (u.echt !== true) fehler.push(`${n}: nicht die echte GPU (start --echt)`);
            if (u.amMessort !== true) fehler.push(`${n}: nicht am Messort ${haushalt.messort.spieler.join(" ")}`);
            if (!u.messung || u.messung.eingeschwungen !== true) fehler.push(`${n}: nicht eingeschwungen`);
        });
        if (fehler.length) {
            console.log("Ratsche NICHT nachgezogen:\n  " + fehler.join("\n  "));
            process.exit(1);
        }
        const h = BAND.bandHuelle(laeufe.map((u) => u.roh));
        const u = BAND.bandUrteil(Object.assign({ haushalt, ratsche }, h));
        Object.assign(u, { messung: null, boot: null });
        console.log(BAND.bandTabelle(u));
        if (u.linse !== "SAUBER") {
            console.log("\nRatsche NICHT nachgezogen: LINSE ROT — erst die Befunde heilen");
            process.exit(1);
        }
        const r = BAND.ratscheNachziehen(ratsche, u, {
            datum: new Date().toISOString(),
            geraet: haushalt.messort.geraet,
            eingeschwungen: true,
            laeufe: laeufe.length,
            boots: laeufe.map((x) => x.boot.art + "/" + x.boot.ladungen),
        });
        if (r.aenderungen.length)
            fs.writeFileSync(
                path.join(root, "spec", "profiband", "ratsche.json"),
                JSON.stringify(r.ratsche, null, 4) + "\n"
            );
        console.log(`\nRatsche nachgezogen (${r.aenderungen.length}): ${r.aenderungen.join(" · ") || "nichts fiel"}`);
        process.exit(0);
    } else if (cmd === "lauf")
        o = await rufe("/lauf", {
            sek: a[0],
            ein: opt("--ein"),
            regler: opt("--regler", "frei"),
            tiere: opt("--tiere", "halten"),
            ruhe: opt("--ruhe", 0),
        });
    else if (cmd === "profil")
        o = await rufe("/profil", {
            sek: a[0],
            regler: opt("--regler", "voll"),
            top: opt("--top", 30),
            tiere: opt("--tiere", "halten"),
        });
    else if (cmd === "schirm") o = await rufe("/schirm", { datei: opt("--datei"), regler: opt("--regler", "frei") });
    else if (cmd === "fenster") o = await rufe("/fenster", { w: a[0], h: a[1] });
    else if (cmd === "gpu-bank") o = await rufe("/gpu-bank", { n: a[0], runden: opt("--runden", 3) });
    else if (cmd === "zerlegen") {
        const bi = argv.indexOf("--bilder");
        o = await rufe("/zerlegen", {
            runden: opt("--runden"),
            n: opt("--n"),
            nur: opt("--nur"),
            json: opt("--json"),
            bilder: bi < 0 ? false : argv[bi + 1] && !argv[bi + 1].startsWith("--") ? argv[bi + 1] : true,
            selbsttest: argv.includes("--selbsttest"),
            last: opt("--last"),
        });
        if (o && o.tabelle) {
            console.log(o.tabelle + "\n\n" + o.datei + (o.ordner ? "\n" + o.ordner : ""));
            process.exit(o.ok ? 0 : 1);
        }
        if (!o || o.fehler) {
            console.log(JSON.stringify(o, null, 1));
            process.exit(1);
        }
    }
    else if (cmd === "reload") o = await rufe("/reload");
    else if (cmd === "stop") o = await rufe("/stop");
    else {
        console.log(fs.readFileSync(__filename, "utf8").split('"use strict"')[0].trimEnd());
        process.exit(1);
    }
    console.log(JSON.stringify(o, null, 1));
})().catch((e) => {
    console.error("WERKBANK-FEHLER:", (e && e.message) || e);
    process.exit(1);
});
