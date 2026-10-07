// sicht-linse.cjs — DIE SICHT-LINSE (Welle C): was die Sicht-Kette je Frame ARBEITET. Befund 06.10. (OMEN, GTX 1060 +
// i7-8750H, CPU-Profil 12 s, Regler voll, Blick gepinnt, Mess-Wiese −900/−850): die Sicht je Pass (`_passSicht` an
// scene.onBeforeRender) kostete ~6 ms CPU je Frame — `_chunkSatzPass` 5,3 · `_hoehlenSicht` 4,5 · `_hoehlenSichtLicht` 3,6
// (je Kaskaden-Pass acht Ecken je Box über JEDE Mündung des Rings und jede Höhlen-Zelle der Box, ohne Frühausstieg) —
// obwohl der Spieler an der Oberfläche stand, keine Höhle im Bild war und sich nichts bewegte. Die Draw-Ersparnis der
// Sicht fraß sich selbst wieder auf. Kein Gate sah es: jede Zahl im Flugschreiber war „der Frame".
//
// Die Linse hüllt die Leser der Sicht-Kette (Prototyp-Methoden, wie die Takt-Linse) und zählt je Frame: die Pässe, die
// Aufrufe je Leser, die geprüften KÖRPER (`_passTrifft` je Leser, `_hoehlenRect` und `_hoehlenLichtLage` je acht Ecken,
// `_instanzBehalten` je Instanz), die Index-Bytes der Neuschreib-Linse der Sätze (`s.schreiben`) und die TREFFER (eine
// Wahl, deren Lage steht: `_satzAbschnittSteht` · `_instanzWahlSteht`). Das Urteil (rein, im Selbsttest wie im Lauf):
// in RUHE (Kamera, Kaskaden und Welt stehen) verlangt die Sicht nach dem ersten Frame keine neue Arbeit — jede Prüfung,
// jede Höhlen-Rechnung, jedes Byte in Ruhe ist ein Cache-Bruch; wer dreht oder geht, rechnet neu (eine Wahl, die über
// eine neue Lage hält, wäre ein Loch).
//
//   Seite:     window.__sichtLinse.an() · .frame() → Zähler seit dem letzten frame() · .aus()
//              window.__sichtLauf({ ein, ruhe, drehen, gehen, tag }) → je Phase Mittel/Median/Maximum je Frame (echter Loop)
//   Werkbank:  node scripts/werkbank.cjs sicht [--ruhe n] [--drehen n] [--gehen n] [--tag laeuft|steht]
//   Gate:      scripts/diag-sicht-arbeit.cjs (Null-Renderer, Stellvertreter-Kaskaden, dieselbe Linse, dasselbe Urteil)

// Die Leser der Sicht-Kette (Aufrufe je Frame) — `_passTrifft` zählt je Leser, der es ruft.
const SICHT_KETTE = [
    "_passSicht",
    "_passWahlLage",
    "_chunkSatzPass",
    "_chunkSatzAbschnitt",
    "_hoehlenSicht",
    "_hoehlenSichtLicht",
    "_hoehlenHinaus",
    "_hoehlenAusgang",
    "_hoehlenBesuch",
    "_instanzWahlPass",
    "_werferWahlPass",
    "_nahWieseSicht",
];
// Die Körper-Prüfungen: je Aufruf EIN Körper (Box mit Saum) bzw. acht Ecken einer Box.
const SICHT_PRUEFUNG = ["_passTrifft", "_hoehlenRect", "_hoehlenLichtLage", "_instanzBehalten"];
// Die Treffer: eine Wahl, deren Lage steht (true = Cache-Treffer).
const SICHT_TREFFER = ["_satzAbschnittSteht", "_instanzWahlSteht"];
// Die Täter beim NAMEN: jede neu gerechnete Wahl (der Satz und sein Pass, die Gruppe).
const SICHT_NEU = ["_satzAbschnittMerke", "_instanzWahlMerke"];
// DIE BYTES BEIM GRUND (K, 07.10.): jedes Index-Byte eines Satzes (`_chunkSatzSchreib`) trägt den Grund seines Schreibers —
// die neue Wahl eines Passes (`wahl:<warum die Wahl nicht stand>`: `stand` = der Satz änderte Bereich, Hülle oder Ordnung,
// `neu` = der Abschnitt fehlte, `lage` = die Lage des Passes, `liste`/`hoehle`), das Verdichten einer ruhenden Wahl
// (`dicht`), das Umlegen aller Abschnitte (`umlegen`). Der Grund ist der innerste Schreiber im Stapel.
const SICHT_GRUND = ["_chunkSatzRuht", "_chunkSatzUmlegen"];
const SICHT_SCHREIB = "_chunkSatzSchreib";
// Leser, deren Prüfungen in Ruhe 0 sein MÜSSEN; die Werfer der Region-Bündel (eine Handvoll Bündel-Hüllen je Schatten-
// Pass) zählt die Linse mit, das Urteil nennt sie, verlangt dort aber keine Null.
// Der echte Loop: höchstens so viele Ruhe-Frames dürfen ein Ereignis der Welt tragen (die Wand fordert 0).
const RUHE_EREIGNIS = 0.05;
const RUHE_LESER = ["_chunkSatzAbschnitt", "_hoehlenSicht", "_hoehlenSichtLicht", "_instanzWahlPass", "_nahWieseSicht"];

function sichtLinse(cfg) {
    const r = window.anazhRealm;
    const P = Object.getPrototypeOf(r);
    if (window.__sichtLinse && window.__sichtLinse.P === P) return window.__sichtLinse;
    const stapel = [];
    let z = null;
    const neu = () => ({
        aufrufe: {},
        pruefung: {},
        trifft: {},
        treffer: {},
        verfehlt: {},
        neu: {},
        jePass: {},
        // die Index-Bytes je „Familie Grund" und warum eine Satz-Wahl nicht stand (je „Familie Grund")
        bytesGrund: {},
        warum: {},
        paesse: 0,
        nach: 0,
    });
    const familie = (s) => String(s && s.art).split("|")[0];
    // der Grund der letzten Wahl je Satz (`_satzAbschnittSteht` = false): ihre Bytes tragen ihn
    const wahlGrund = new WeakMap();
    // DIE SCHULD DER FOLGE: das Verdichten (`dicht`) und das Umlegen (`umlegen`) sind die Arbeit einer Änderung davor — nur,
    // solange eine Wahl sie schuldet. Jede neue Wahl eines Passes (`_satzAbschnittMerke`) schuldet ihrem Abschnitt („Familie
    // Pass") EIN Verdichten und ihrem Satz („Familie") EIN Umlegen; ein Verdichten ohne offene Schuld (ein Abschnitt, der
    // sich in Ruhe immer wieder dicht legt) heißt `dicht:ohne`, ein Umlegen ohne Wahl `umlegen:ohne` — Bytes ohne Grund.
    // Was vor der Linse geschah, schuldet sie ab `an()` (ein Abschnitt mit Lücken, ein Satz über dem Verschnitt).
    const schuld = new Set();
    const schuldSaat = () => {
        schuld.clear();
        const ss = r.state.chunkSaetze;
        if (!ss) return;
        const V = (r.constructor.CHUNK_SATZ_ABSCHNITT || {}).verschnitt || 0;
        for (const s of ss.values()) {
            const fam = familie(s);
            let belegt = 0;
            for (const ab of s.abschnitte.values()) {
                belegt += ab.kap;
                if (!ab.dicht) schuld.add(fam + " " + ab.key);
            }
            if (s.iEnde - belegt > s.iKap * V) schuld.add(fam);
        }
    };
    // der Pass, in dem gerade geprüft wird (haupt · k<i> · anders) — die Prüfungen je Pass
    let pass = "?";
    const passName = (kam) => {
        if (kam === r.state.camera) return "haupt";
        const k = typeof r._schattenKameraIndex === "function" ? r._schattenKameraIndex(kam) : -1;
        return k >= 0 ? "k" + k : "anders";
    };
    z = neu();
    const orig = {};
    // ein Leser, den die Welt nicht trägt, ist ein blinder Fleck der Linse — er steht beim Namen im Urteil, nie still
    const fehlt = [];
    const leser = new Set(cfg.kette);
    const huelle = (name, art) => {
        if (orig[name]) return;
        if (typeof P[name] !== "function") {
            if (!fehlt.includes(name)) fehlt.push(name);
            return;
        }
        const f = (orig[name] = P[name]);
        P[name] = function (...a) {
            if (art === "grund") {
                // `_chunkSatzRuht(s, ab, key)` · `_chunkSatzUmlegen(s, neu, kap, wer)`: der Grund trägt, ob eine Wahl ihn schuldet
                const fam = familie(a[0]);
                const ruht = name === "_chunkSatzRuht";
                const kd = fam + " " + a[2];
                const inWahl = stapel.includes("_chunkSatzAbschnitt");
                const g = ruht
                    ? schuld.has(kd)
                        ? "dicht"
                        : "dicht:ohne"
                    : inWahl || schuld.has(fam)
                      ? "umlegen"
                      : "umlegen:ohne";
                stapel.push(name + "|" + g);
                try {
                    return f.apply(this, a);
                } finally {
                    stapel.pop();
                    if (ruht) {
                        if (a[1] && a[1].dicht) schuld.delete(kd);
                    } else if (!inWahl) schuld.delete(fam);
                }
            }
            if (art === "schreib") {
                // der innerste Schreiber im Stapel nennt den Grund der Bytes
                let g = "?";
                for (let i = stapel.length - 1; i >= 0; i--) {
                    const n = stapel[i];
                    if (n.startsWith("_chunkSatzRuht|") || n.startsWith("_chunkSatzUmlegen|")) g = n.split("|")[1];
                    else if (n === "_chunkSatzAbschnitt") g = "wahl:" + (wahlGrund.get(a[0]) || "?");
                    else continue;
                    break;
                }
                const k = familie(a[0]) + " " + g + " " + a[1];
                z.bytesGrund[k] = (z.bytesGrund[k] || 0) + 4 * a[4];
                return f.apply(this, a);
            }
            if (art === "kette") {
                z.aufrufe[name] = (z.aufrufe[name] || 0) + 1;
                if (name === "_passSicht") a[1] ? z.nach++ : z.paesse++;
                const vorher = pass;
                if (name === "_passSicht") pass = a[1] ? "nach" : passName(a[0]);
                stapel.push(name);
                try {
                    return f.apply(this, a);
                } finally {
                    stapel.pop();
                    pass = vorher;
                }
            }
            const o = f.apply(this, a);
            if (art === "pruefung") {
                z.pruefung[name] = (z.pruefung[name] || 0) + 1;
                const jp = z.jePass[pass] || (z.jePass[pass] = { pruefung: 0, ecken: 0 });
                jp.pruefung++;
                if (name === "_hoehlenRect" || name === "_hoehlenLichtLage") jp.ecken += 8;
                if (name === "_passTrifft") {
                    // der nächste Leser im Stapel, der kein Körper-Helfer ist
                    let wer = "?";
                    for (let i = stapel.length - 1; i >= 0; i--)
                        if (leser.has(stapel[i]) && stapel[i] !== "_passSicht" && stapel[i] !== "_chunkSatzPass") {
                            wer = stapel[i];
                            break;
                        }
                    z.trifft[wer] = (z.trifft[wer] || 0) + 1;
                }
            } else if (art === "treffer") {
                const k = o ? "treffer" : "verfehlt";
                z[k][name] = (z[k][name] || 0) + 1;
                if (!o && name === "_satzAbschnittSteht") {
                    // warum die Wahl dieses Passes nicht stand (die Felder von `_satzAbschnittMerke`)
                    const [s, ab, L] = a;
                    const w = ab && ab.wahl;
                    const H = s.hoehle;
                    const g = !w
                        ? "neu"
                        : w.gen !== L.gen
                          ? "lage"
                          : w.stand !== s.stand
                            ? "stand"
                            : w.liste !== ab.liste
                              ? "liste"
                              : H && w.boden !== H.boden
                                ? "boden"
                                : "hoehle";
                    wahlGrund.set(s, g);
                    const kw = familie(s) + " " + g;
                    z.warum[kw] = (z.warum[kw] || 0) + 1;
                }
            } else if (art === "neu") {
                // der Satz × Pass bzw. die Gruppe, deren Wahl dieser Frame neu rechnete
                const w =
                    name === "_satzAbschnittMerke"
                        ? "satz " + String(a[0].art).split("|")[0] + "|" + a[1].key
                        : "gruppe " + ((a[0].mesh && a[0].mesh.name) || a[0].key || "?");
                z.neu[w] = (z.neu[w] || 0) + 1;
                // die neue Wahl schuldet ihrem Abschnitt ein Verdichten und ihrem Satz ein Umlegen
                if (name === "_satzAbschnittMerke") {
                    schuld.add(familie(a[0]) + " " + a[1].key);
                    schuld.add(familie(a[0]));
                }
            }
            return o;
        };
    };
    // die Index-Bytes je Satz-Familie (boden · wasser · bauSatz · streuSatz · formationenSatz), kumulativ
    const bytesJe = () => {
        const o = {};
        const ss = r.state.chunkSaetze;
        if (ss)
            for (const s of ss.values()) {
                const fam = String(s.art).split("|")[0];
                for (const k in s.schreiben) o[fam + " " + k] = (o[fam + " " + k] || 0) + s.schreiben[k];
            }
        return o;
    };
    const bytes = () => Object.values(bytesJe()).reduce((a, x) => a + x, 0);
    let b0 = 0,
        bj0 = {};
    // DER INHALT der Sätze je Frame — nur aus UNABHÄNGIGEN Belegen (Gegenprüfung 07.10.): ein Bereich kam (+), ging (−) oder
    // wurde neu gebaut (~), der Anker der Ordnung zog um (der Spieler wechselte den Chunk), eine Hülle (Bereich oder Zelle)
    // änderte ihre Lage (`^`, ein Geomorph). Der Stand eines Satzes (`s.stand`) und sein Verdichten-Zähler sind die
    // Cache-Schlüssel des Spiels selbst — sie belegen NICHTS: ein Stand, den kein Beleg trägt, ist Satz-Arbeit OHNE Ursache
    // (`<Familie> stand:ohne`), beim Namen. Die geschuldete Folge trägt ihre Ursache (`sichtSatzInhalt`). Vorher zählten
    // `s.stand` und `s.verdichtet` selbst als Änderung: ein eingeschmuggelter Stand-Bruch (15 072 Prüfungen je Frame) stand
    // GRÜN, und jede Arbeit des Frames war entschuldigt.
    const inhaltVor = new Map();
    let inhaltOffen = {};
    let inhaltOhneOffen = {};
    // die Hülle eines Bereichs und seiner Zellen als Zahlen (gerechnet nur, wenn der Stand sich bewegte oder der Bereich neu ist)
    const huelleZahlen = (b) => {
        const zl = b.zellen || [];
        const a = new Float64Array(6 * (1 + zl.length));
        const setze = (h, o) => {
            if (!h) return void a.fill(-1.5e308, o, o + 6);
            a[o] = h.min.x;
            a[o + 1] = h.min.y;
            a[o + 2] = h.min.z;
            a[o + 3] = h.max.x;
            a[o + 4] = h.max.y;
            a[o + 5] = h.max.z;
        };
        setze(b.huelle, 0);
        for (let i = 0; i < zl.length; i++) setze(zl[i].huelle, 6 + 6 * i);
        return a;
    };
    // DAS BILD eines Satzes: die Zähler des Spiels (Stand, Verdichten) und daneben die Belege (Bereiche mit Hülle, Anker, die
    // offene Ordnung, Geometrie und Kapazität, der Überhang `ueberSeit`, den das Spiel selbst misst)
    const satzBild = (s, vor) => {
        const stand = s.stand || 0;
        const bloecke = new Map();
        for (const [k, b] of s.bloecke) {
            const x = vor && vor.bloecke.get(k);
            bloecke.set(k, { b, h: x && x.b === b && vor.stand === stand ? x.h : huelleZahlen(b) });
        }
        return {
            stand,
            verdichtet: s.verdichtet || 0,
            anker: s.anker,
            schmutzig: !!s.schmutzig,
            geom: s.geom,
            vKap: s.vKap,
            iKap: s.iKap,
            ueber: s.ueberSeit >= 0,
            bloecke,
            offen: false,
        };
    };
    // ein Eintrag je Familie: die Belege summiert, der Grund die stärkste Klasse (Änderung vor Folge)
    const inhaltDazu = (ziel, fam, e) => {
        const a =
            ziel[fam] ||
            (ziel[fam] = {
                grund: null,
                bereiche: 0,
                anker: false,
                huelle: 0,
                ordnung: false,
                verdichtet: 0,
                stand: 0,
                keys: [],
            });
        a.grund = a.grund === "aenderung" || e.grund === "aenderung" ? "aenderung" : "folge";
        a.bereiche += e.bereiche || 0;
        a.anker = a.anker || !!e.anker;
        a.huelle += e.huelle || 0;
        a.ordnung = a.ordnung || !!e.ordnung;
        a.verdichtet += e.verdichtet || 0;
        a.stand += e.stand || 0;
        for (const k of e.keys || []) if (a.keys.length < 4) a.keys.push(k);
    };
    // `erstes` (an()): jedes Bild ist der Bezug; danach je Satz der Inhalt gegen sein Bild davor
    const inhalt = (erstes) => {
        const o = { inhalt: {}, ohne: {} };
        const ss = r.state.chunkSaetze;
        const da = new Set();
        if (ss)
            for (const s of ss.values()) {
                da.add(s);
                const fam = familie(s);
                const vor = inhaltVor.get(s);
                const jetzt = satzBild(s, vor);
                if (!vor) {
                    // die offene Ordnung eines Satzes, der vor der Linse schmutzig wurde, schuldet sie ab `an()`
                    jetzt.offen = jetzt.schmutzig;
                    inhaltVor.set(s, jetzt);
                    if (!erstes)
                        inhaltDazu(o.inhalt, fam, {
                            grund: "aenderung",
                            bereiche: jetzt.bloecke.size,
                            keys: ["+" + s.art],
                        });
                    continue;
                }
                const e = window.__sichtSatzInhalt(vor, jetzt, vor.offen);
                jetzt.offen = e.offen;
                inhaltVor.set(s, jetzt);
                if (e.grund) inhaltDazu(o.inhalt, fam, e);
                if (e.ohne.stand > 0) o.ohne[fam + " stand:ohne"] = (o.ohne[fam + " stand:ohne"] || 0) + e.ohne.stand;
                if (e.ohne.verdichtet > 0)
                    o.ohne[fam + " verdichtet:ohne"] = (o.ohne[fam + " verdichtet:ohne"] || 0) + e.ohne.verdichtet;
            }
        for (const [s, vor] of inhaltVor)
            if (!da.has(s)) {
                inhaltVor.delete(s);
                if (!erstes)
                    inhaltDazu(o.inhalt, familie(s), {
                        grund: "aenderung",
                        bereiche: vor.bloecke.size,
                        keys: ["-" + s.art],
                    });
            }
        return o;
    };
    // die Licht-Richtung des Frames (Richtlicht: Ort − Ziel) — dreht sie gegen den Frame davor?
    let lichtVor = null;
    // eine Drehung in einem Tick ohne Pass (der Loop rendert nicht jeden Tick) zählt zum nächsten gerenderten Frame
    let lichtOffen = 0;
    // die Kamera des Hauptbilds: wandert ihr Auge über den Halt der Lage oder dreht ihr Blick über den halben Dreh-Rand gegen
    // den ANKER (`sichtKameraBewegt`), ist der Frame eine Änderung, und der Anker rückt nach (dieselbe Offen-Regel wie das
    // Licht). Das Auge der Spiel-Kamera atmet im Stand um Millimeter — gegen den Frame davor zählte jeder Ruhe-Frame als
    // bewegt (Radeon, Mess-Wiese, 07.10.: 299 von 299), und die Linse entschuldigte jede Arbeit und jedes Byte.
    let kameraAnker = null;
    let kameraOffen = 0;
    const kameraBewegt = () => {
        const c = r.state.camera;
        if (!c) return 0;
        // Welt-Matrix (16) und Projektion ohne den Versatz der zeitlichen Auflösung (Elemente 8 und 9 — TRAA)
        const e = Array.from(c.matrixWorld.elements).concat(
            Array.from(c.projectionMatrix.elements).map((x, i) => (i === 8 || i === 9 ? 0 : x))
        );
        if (!kameraAnker) {
            kameraAnker = e;
            return 0;
        }
        const PW = r.constructor.PASS_WAHL || {};
        if (!window.__sichtKameraBewegt(kameraAnker, e, PW.haltM, PW.drehRand)) return 0;
        kameraAnker = e;
        return 1;
    };
    // DIE BLENDE (die LIVE-Uniforms jeder LOD-Maske: an · Auge · Perf-Streck · Bezug · die Kanten des Blend-Gesetzes — der
    // Regler legt sie): ändert sie sich, wählt jeder Pass neu (`_passLageHaelt`: die Blende gleich). Das ist eine Änderung.
    let blendeVor = null;
    let blendeOffen = 0;
    const blendeDreht = () => {
        const lu = r.state.lodUniforms;
        const v = (u) =>
            u && u.value != null ? (typeof u.value === "number" ? u.value : u.value.x + "," + u.value.z) : "-";
        const jetzt = lu
            ? [lu.uLodMaskOn, lu.uLodAuge, lu.uLodPerf, lu.uLodRef, lu.uLodD0, lu.uLodD1, lu.uLodFade, lu.uLodFade0]
                  .map(v)
                  .join("|")
            : "";
        const vor = blendeVor;
        blendeVor = jetzt;
        return vor !== null && vor !== jetzt ? 1 : 0;
    };
    const lichtDreht = () => {
        const dl = r.state.directionalLight;
        if (!dl || !dl.target) return 0;
        const x = dl.position.x - dl.target.position.x,
            y = dl.position.y - dl.target.position.y,
            z = dl.position.z - dl.target.position.z;
        const l = Math.hypot(x, y, z) || 1;
        const jetzt = [x / l, y / l, z / l];
        const vor = lichtVor;
        lichtVor = jetzt;
        if (!vor) return 0;
        return 1 - (vor[0] * jetzt[0] + vor[1] * jetzt[1] + vor[2] * jetzt[2]) > 1e-12 ? 1 : 0;
    };
    const L = {
        P,
        an() {
            for (const n of cfg.kette) huelle(n, "kette");
            for (const n of cfg.pruefung) huelle(n, "pruefung");
            for (const n of cfg.treffer) huelle(n, "treffer");
            for (const n of cfg.neu) huelle(n, "neu");
            for (const n of cfg.grund) huelle(n, "grund");
            huelle(cfg.schreib, "schreib");
            z = neu();
            b0 = bytes();
            bj0 = bytesJe();
            schuldSaat();
            inhaltVor.clear();
            inhaltOffen = {};
            inhaltOhneOffen = {};
            inhalt(true);
            lichtDreht();
            kameraBewegt();
            blendeDreht();
            return { gehuellt: Object.keys(orig), fehlt: fehlt.slice() };
        },
        // Die Zähler seit dem letzten frame() — und frisch weiter.
        frame() {
            const o = z;
            const b = bytes();
            o.bytes = b - b0;
            b0 = b;
            const bj = bytesJe();
            o.bytesJe = {};
            for (const k in bj) if (bj[k] !== (bj0[k] || 0)) o.bytesJe[k] = bj[k] - (bj0[k] || 0);
            bj0 = bj;
            // eine Änderung in einem Takt ohne Pass (der Loop rendert nicht jeden Takt) zählt zum nächsten gerenderten Frame
            const inh = inhalt(false);
            for (const [fam, e] of Object.entries(inh.inhalt)) inhaltDazu(inhaltOffen, fam, e);
            for (const [k, n] of Object.entries(inh.ohne)) inhaltOhneOffen[k] = (inhaltOhneOffen[k] || 0) + n;
            o.inhalt = inhaltOffen;
            o.inhaltOhne = inhaltOhneOffen;
            if (o.paesse > 0) {
                inhaltOffen = {};
                inhaltOhneOffen = {};
            }
            const p = o.pruefung;
            o.ecken = 8 * ((p._hoehlenRect || 0) + (p._hoehlenLichtLage || 0));
            let ruhe = (p._hoehlenRect || 0) + (p._hoehlenLichtLage || 0);
            for (const n of cfg.ruheLeser) ruhe += o.trifft[n] || 0;
            ruhe += p._instanzBehalten || 0;
            for (const n of ["_hoehlenSicht", "_hoehlenSichtLicht", "_chunkSatzAbschnitt"]) ruhe += o.aufrufe[n] || 0;
            o.arbeit = ruhe;
            o.trefferSumme = Object.values(o.treffer).reduce((a, x) => a + x, 0);
            o.fehlt = fehlt;
            lichtOffen = lichtDreht() || lichtOffen;
            o.licht = lichtOffen;
            if (o.paesse > 0) lichtOffen = 0;
            kameraOffen = kameraBewegt() || kameraOffen;
            o.kamera = kameraOffen;
            if (o.paesse > 0) kameraOffen = 0;
            blendeOffen = blendeDreht() || blendeOffen;
            o.blende = blendeOffen;
            if (o.paesse > 0) blendeOffen = 0;
            o.tag = r.state.timeOfDay;
            o.stufe = r.state._sonne && r.state._sonne.stufe > 0 ? r.state._sonne.stufe : null;
            // der Licht-Rand der Kaskaden mit Box (`PASS_WAHL.lichtRandTexel`): trägt ihn jede gerade gehaltene Lage?
            o.mitBox = false;
            o.lichtRand = 0;
            if (r._passLagen) {
                let rand = true;
                for (const [k, a] of r._passLagen)
                    if (k[0] === "k" && a.sig[27] === 1) {
                        o.mitBox = true;
                        if (!(a.sig[85] > 0)) rand = false;
                    }
                if (o.mitBox && rand) o.lichtRand = r.constructor.PASS_WAHL.lichtRandTexel || 0;
            }
            z = neu();
            return o;
        },
        aus() {
            for (const n in orig) P[n] = orig[n];
            for (const n in orig) delete orig[n];
            delete window.__sichtLinse;
        },
    };
    window.__sichtLinse = L;
    return L;
}

// DER INHALT EINES SATZES zwischen zwei Bildern (rein, Gegenprüfung 07.10.): die Belege beim Namen, nie die Zähler des Spiels.
// `vor`/`jetzt` je { stand, verdichtet, anker, schmutzig, geom, vKap, iKap, ueber, bloecke: Map(Schlüssel → { b, h }) } —
// `b` der Bereich (Identität), `h` seine Hülle und die seiner Zellen als Zahlen. `offen` = die Ordnung, die ein Ein-/Austritt
// davor offen ließ. Grund `aenderung`: ein Bereich kam, ging oder wurde neu gebaut, der Anker zog um, eine Hülle änderte sich
// (der Stand bewegte sich mit ihr). Grund `folge`: die offene Ordnung lief (der Satz ist nicht mehr schmutzig) — oder das
// Verdichten tauschte die Geometrie, nachdem das Spiel den Überhang maß (`ueber`). Ein Stand ohne einen dieser Belege heißt
// `ohne.stand`, ein Verdichten-Zähler ohne Tausch oder ohne Überhang `ohne.verdichtet` — Satz-Arbeit OHNE Ursache.
function sichtSatzInhalt(vor, jetzt, offen) {
    const e = {
        grund: null,
        bereiche: 0,
        anker: false,
        huelle: 0,
        ordnung: false,
        verdichtet: 0,
        stand: (jetzt.stand || 0) - (vor.stand || 0),
        keys: [],
        ohne: { stand: 0, verdichtet: 0 },
        offen: false,
    };
    const name = (k) => {
        if (e.keys.length < 4) e.keys.push(k);
    };
    for (const [k, x] of jetzt.bloecke) {
        const y = vor.bloecke.get(k);
        if (y && y.b === x.b) {
            if (e.stand > 0 && y.h !== x.h) {
                let gleich = !!y.h && !!x.h && y.h.length === x.h.length;
                for (let i = 0; gleich && i < x.h.length; i++) if (x.h[i] !== y.h[i]) gleich = false;
                if (!gleich) {
                    e.huelle++;
                    name("^" + k);
                }
            }
            continue;
        }
        e.bereiche++;
        name((y ? "~" : "+") + k);
    }
    for (const k of vor.bloecke.keys())
        if (!jetzt.bloecke.has(k)) {
            e.bereiche++;
            name("-" + k);
        }
    e.anker = vor.anker !== jetzt.anker;
    if (e.anker) name("anker " + jetzt.anker);
    // die Ordnung: ein Ein-/Austritt macht den Satz schmutzig, das Spiel ordnet im nächsten Render — sie bleibt offen, solange
    // er schmutzig ist, und läuft als Folge, wenn er es nicht mehr ist
    e.ordnung = !!offen && vor.schmutzig && !jetzt.schmutzig;
    e.offen = !!jetzt.schmutzig && (e.bereiche > 0 || !!offen);
    const dV = (jetzt.verdichtet || 0) - (vor.verdichtet || 0);
    if (dV > 0) {
        if (vor.ueber && jetzt.geom !== vor.geom) e.verdichtet = dV;
        else e.ohne.verdichtet = dV;
    }
    const aenderung = e.bereiche > 0 || e.anker || e.huelle > 0;
    if (e.stand > 0 && !aenderung && !e.ordnung) e.ohne.stand = e.stand;
    e.grund = aenderung ? "aenderung" : e.ordnung || e.verdichtet > 0 ? "folge" : null;
    return e;
}

// DIE BYTES UND IHR GRUND (rein, K 07.10.): je Frame die Index-Bytes nach Klasse — `aenderung` (eine neue Wahl, deren
// Grund im selben Frame geschah: die Lage eines Passes bei gedrehtem Licht, der Inhalt ihrer Familie mit BENANNTEM Grund —
// ein Bereich, ein Anker, eine Hülle: Streaming, ein Bau, ein Geomorph), `folge` (die Arbeit einer Änderung davor, solange eine
// Wahl sie schuldet: das Verdichten einer ruhenden Wahl nach `dichtNach` Pässen, das Umlegen aller Abschnitte, eine fremd
// geleerte Liste, die offene Ordnung, das Verdichten des Satzes nach seinem Überhang) und `ohne` (kein Grund — der Täter, je
// „Familie Grund Pass"; `dicht:ohne` · `umlegen:ohne`: die Folge, die keine Wahl schuldet; eine Wahl, deren Satz nur seinen
// Stand zählte). Bytes, die der Schreiber-Haken nicht sah, haben keinen Grund („? ungesehen" — die Linse ist blind). Die Lage
// eines Passes ändert sich mit der Kamera über den Halt (`kamera`) und der Blende des Reglers (`blende`, jeder Pass) oder
// dem Licht (nur die Kaskaden `k<i>`). Ein Inhalt ohne `grund` (nur die Zähler des Spiels) entschuldigt nichts.
function sichtBytesKlasse(f) {
    const aus = { aenderung: 0, folge: 0, ohne: 0, aenderungJe: {}, folgeJe: {}, ohneJe: {} };
    let gesehen = 0;
    for (const [k, b] of Object.entries(f.bytesGrund || {})) {
        gesehen += b;
        const [fam, g, pass] = k.split(" ");
        let kl = "ohne";
        if (g === "dicht" || g === "umlegen" || g === "wahl:liste") kl = "folge";
        else if (g === "wahl:lage")
            kl = f.kamera || f.blende || (f.licht && /^k\d+$/.test(pass || "")) ? "aenderung" : "ohne";
        else if (/^wahl:(stand|neu|boden|hoehle)$/.test(g)) {
            const e = f.inhalt && f.inhalt[fam];
            kl = e && e.grund === "aenderung" ? "aenderung" : e && e.grund === "folge" ? "folge" : "ohne";
        }
        aus[kl] += b;
        aus[kl + "Je"][k] = (aus[kl + "Je"][k] || 0) + b;
    }
    if ((f.bytes || 0) > gesehen) {
        aus.ohne += f.bytes - gesehen;
        aus.ohneJe["? ungesehen"] = (aus.ohneJe["? ungesehen"] || 0) + f.bytes - gesehen;
    }
    return aus;
}
// DIE KAMERA BEWEGT SICH (rein): Anker und jetzt je Welt-Matrix (Elemente 0–15, Spalten-Folge), dahinter optional die
// Projektion ohne den Versatz der zeitlichen Auflösung (16–31) — das Auge wanderte um mehr als den halben Halt (`haltM`,
// `_wahlHaelt`: jeder Ort der Lage hält bis zur Hälfte), eine Achse des Blicks (Blick −z, Oben +y) drehte um mehr als den
// halben Dreh-Rand (`drehRand`), oder die Projektion änderte sich (Sichtfeld, Seiten, Nah/Fern — die Lage einer Perspektive
// verlangt sie gleich). Das Atmen des Auges im Stand (±4 mm, keine Drehung) ist keine Bewegung.
function sichtKameraBewegt(a, e, haltM, drehRand) {
    const halt = (Number.isFinite(haltM) ? haltM : 0.02) / 2;
    const dreh = (Number.isFinite(drehRand) ? drehRand : Math.PI / 90) / 2;
    if (Math.hypot(e[12] - a[12], e[13] - a[13], e[14] - a[14]) > halt) return true;
    for (let i = 16; i < Math.min(a.length, e.length); i++) if (a[i] !== e[i]) return true;
    for (const o of [4, 8]) {
        const la = Math.hypot(a[o], a[o + 1], a[o + 2]) || 1,
            le = Math.hypot(e[o], e[o + 1], e[o + 2]) || 1;
        const c = (a[o] * e[o] + a[o + 1] * e[o + 1] + a[o + 2] * e[o + 2]) / (la * le);
        if (Math.acos(Math.max(-1, Math.min(1, c))) > dreh) return true;
    }
    return false;
}
// Die Arbeit eines Frames ohne Änderung: eine bewegte Kamera, eine neue Blende oder ein Satz-Inhalt mit BENANNTEM Grund
// (`grund`: Änderung oder ihre Folge) erklären die ganze Arbeit, ein gedrehtes Licht die Arbeit der Kaskaden-Pässe (je Pass
// `jePass`) — was bleibt, ist ein Cache-Bruch. Die Zähler eines Satzes allein (Stand, Verdichten) erklären nichts.
function sichtArbeitOhne(f) {
    if (f.kamera || f.blende || Object.values(f.inhalt || {}).some((e) => !!(e && e.grund))) return 0;
    if (!f.licht) return f.arbeit;
    let n = 0;
    for (const [k, x] of Object.entries(f.jePass || {})) if (!/^k\d+$/.test(k)) n += x.pruefung;
    return n;
}
const sichtAenderung = (f) =>
    !!(f.licht || f.kamera || f.blende || Object.values(f.inhalt || {}).some((e) => !!(e && e.grund)));

// Die Statistik einer Phase: je Zähl-Größe Mittel · Median · Maximum über die Frames (ab `ab`).
function sichtPhase(frames, ab) {
    const fs = frames.slice(ab || 0).filter((f) => f.paesse > 0);
    for (const f of fs) f.klasse = window.__sichtBytesKlasse(f);
    const reihe = (g) => fs.map(g).sort((a, b) => a - b);
    const st = (g) => {
        const x = reihe(g);
        if (!x.length) return { mittel: 0, median: 0, max: 0 };
        return {
            mittel: +(x.reduce((a, b) => a + b, 0) / x.length).toFixed(1),
            median: x[Math.floor(x.length / 2)],
            max: x[x.length - 1],
        };
    };
    const auf = (n) => (f) => f.aufrufe[n] || 0;
    // die Täter: wer in der Phase neu rechnete, je Frame im Mittel (die häufigsten zuerst)
    const neu = {};
    for (const f of fs) for (const k in f.neu || {}) neu[k] = (neu[k] || 0) + f.neu[k];
    const taeter = Object.entries(neu)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([k, n]) => k + " ×" + +(n / Math.max(1, fs.length)).toFixed(2));
    // je Pass die Prüfungen und Ecken, je Satz-Familie die Bytes — im Mittel je Frame
    const jePass = {};
    for (const f of fs)
        for (const k in f.jePass || {}) {
            const x = jePass[k] || (jePass[k] = { pruefung: 0, ecken: 0 });
            x.pruefung += f.jePass[k].pruefung / fs.length;
            x.ecken += f.jePass[k].ecken / fs.length;
        }
    for (const k in jePass) for (const g in jePass[k]) jePass[k][g] = +jePass[k][g].toFixed(1);
    const bytesJe = {};
    for (const f of fs) for (const k in f.bytesJe || {}) bytesJe[k] = (bytesJe[k] || 0) + f.bytesJe[k] / fs.length;
    for (const k in bytesJe) bytesJe[k] = Math.round(bytesJe[k]);
    // die Bytes je „Familie Grund" (Summe über die Phase) und warum eine Satz-Wahl nicht stand (Zahl der Pässe)
    const summe = (feld) => {
        const o = {};
        for (const f of fs) for (const k in f[feld] || {}) o[k] = (o[k] || 0) + f[feld][k];
        return o;
    };
    const bytesGrund = summe("bytesGrund");
    const warum = summe("warum");
    // die Schreib-Frames beim Namen: Bytes, Grund, warum die Wahl nicht stand, die Änderung des Inhalts im selben Frame
    const schreibBelege = [];
    fs.forEach((f, i) => {
        if (f.bytes > 0 && schreibBelege.length < 24)
            schreibBelege.push({
                frame: i,
                bytes: f.bytes,
                klasse: { aenderung: f.klasse.aenderung, folge: f.klasse.folge, ohne: f.klasse.ohne },
                grund: f.bytesGrund,
                warum: f.warum,
                inhalt: f.inhalt,
                inhaltOhne: f.inhaltOhne,
                licht: f.licht,
                kamera: f.kamera,
                blende: f.blende,
            });
    });
    // je Klasse die Summe je „Familie Grund" über die Phase (die Änderung beim Namen, der Täter beim Namen)
    const klasseJe = (kl) => {
        const o = {};
        for (const f of fs) for (const k in f.klasse[kl + "Je"]) o[k] = (o[k] || 0) + f.klasse[kl + "Je"][k];
        return o;
    };
    // der Inhalt, der sich in der Phase mit BENANNTEM Grund änderte (je Familie die Belege und die ersten Schlüssel) — und die
    // Satz-Arbeit ohne Ursache (je „Familie stand:ohne" bzw. „Familie verdichtet:ohne", Summe über die Phase)
    const inhaltJe = {};
    for (const f of fs)
        for (const [fam, e] of Object.entries(f.inhalt || {})) {
            if (!e || !e.grund) continue;
            const a =
                inhaltJe[fam] ||
                (inhaltJe[fam] = {
                    frames: 0,
                    aenderung: 0,
                    folge: 0,
                    bereiche: 0,
                    anker: 0,
                    huelle: 0,
                    ordnung: 0,
                    verdichtet: 0,
                    stand: 0,
                    keys: [],
                });
            a.frames++;
            a[e.grund]++;
            a.bereiche += e.bereiche || 0;
            a.anker += e.anker ? 1 : 0;
            a.huelle += e.huelle || 0;
            a.ordnung += e.ordnung ? 1 : 0;
            a.verdichtet += e.verdichtet || 0;
            a.stand += e.stand || 0;
            for (const k of e.keys || []) if (a.keys.length < 8 && !a.keys.includes(k)) a.keys.push(k);
        }
    const inhaltOhneJe = summe("inhaltOhne");
    const inhaltOhneFrames = fs.filter((f) => Object.keys(f.inhaltOhne || {}).length > 0).length;
    const inhaltFrames = fs.filter((f) =>
        Object.values(f.inhalt || {}).some((e) => !!(e && e.grund === "aenderung"))
    ).length;
    const ohneAenderung = fs.filter((f) => !window.__sichtAenderung(f));
    // DIE SONNE der Phase: in wie vielen Frames das Licht drehte, um wie viel die Sonne lief (Bogenmaß, aus der Tageszeit —
    // der Weg über den Tag ist 2π), ihre Stufe (`state._sonne.stufe`, null = keine)
    let sonneRad = 0;
    for (let i = 1; i < fs.length; i++) {
        let d = (fs[i].tag || 0) - (fs[i - 1].tag || 0);
        if (d < -0.5) d += 1;
        sonneRad += Math.abs(d) * 2 * Math.PI;
    }
    const stufen = fs.map((f) => f.stufe).filter((x) => x > 0);
    return {
        lichtFrames: fs.filter((f) => f.licht).length,
        sonneRad: +sonneRad.toFixed(5),
        stufe: stufen.length ? stufen[Math.floor(stufen.length / 2)] : null,
        // die Kaskaden mit Box und ihr Licht-Rand in Texeln (0, wenn ein Frame ohne ihn wählte)
        mitBox: fs.some((f) => f.mitBox),
        lichtRand: fs.some((f) => f.mitBox) ? Math.min(...fs.filter((f) => f.mitBox).map((f) => f.lichtRand || 0)) : 0,
        jePass,
        bytesJe,
        bytesGrund,
        warum,
        schreibBelege,
        // die Bytes je Klasse (Summe über die Phase) und die Frames mit Bytes ohne Grund
        bytesAenderung: klasseJe("aenderung"),
        bytesFolge: klasseJe("folge"),
        bytesOhneJe: klasseJe("ohne"),
        bytesOhne: st((f) => f.klasse.ohne),
        ohneFrames: fs.filter((f) => f.klasse.ohne > 0).length,
        inhaltJe,
        inhaltFrames,
        inhaltOhneJe,
        inhaltOhneFrames,
        // die Frames mit einer Änderung (Kamera, Licht, Inhalt) und je Frame die Arbeit, die keine Änderung erklärt
        aenderungFrames: fs.length - ohneAenderung.length,
        kameraFrames: fs.filter((f) => f.kamera).length,
        blendeFrames: fs.filter((f) => f.blende).length,
        arbeitOhne: (() => {
            const x = fs.map((f) => window.__sichtArbeitOhne(f)).sort((a, b) => a - b);
            return {
                frames: x.filter((a) => a > 0).length,
                median: x.length ? x[Math.floor(x.length / 2)] : 0,
                max: x.length ? x[x.length - 1] : 0,
            };
        })(),
        taeter,
        frames: fs.length,
        paesse: st((f) => f.paesse),
        arbeit: st((f) => f.arbeit),
        // die Frames, in denen die Kette überhaupt arbeitete bzw. schrieb
        arbeitFrames: fs.filter((f) => f.arbeit > 0).length,
        schreibFrames: fs.filter((f) => f.bytes > 0).length,
        ecken: st((f) => f.ecken),
        rect: st((f) => f.pruefung._hoehlenRect || 0),
        lichtLage: st((f) => f.pruefung._hoehlenLichtLage || 0),
        bytes: st((f) => f.bytes),
        treffer: st((f) => f.trefferSumme),
        hoehlenSicht: st(auf("_hoehlenSicht")),
        hoehlenSichtLicht: st(auf("_hoehlenSichtLicht")),
        abschnitt: st(auf("_chunkSatzAbschnitt")),
        passTrifft: st((f) => f.pruefung._passTrifft || 0),
        instanzBehalten: st((f) => f.pruefung._instanzBehalten || 0),
        werferTrifft: st((f) => f.trifft._werferWahlPass || 0),
        hinaus: st((f) => (f.aufrufe._hoehlenHinaus || 0) + (f.aufrufe._hoehlenAusgang || 0)),
        // die Leser, die die Linse nicht hüllen konnte (die Welt trägt sie nicht)
        fehlt: fs.length && fs[0].fehlt ? fs[0].fehlt.slice() : [],
    };
}

// DAS URTEIL (rein): Liste der Verstöße, leer = grün. `b.ruhe` / `b.drehen` / `b.gehen` sind Phasen (`sichtPhase`).
//   (R) RUHE: nach dem ersten Frame keine neue Arbeit und kein Byte OHNE ÄNDERUNG, und die Pässe treffen ihren Cache (sonst
//       prüfte die Linse nichts). Eine Änderung ist ein gedrehtes Licht (die Sonne läuft im Spiel) oder ein Satz-Inhalt mit
//       BENANNTEM Grund (ein Bereich, ein Anker, eine Hülle: Streaming, ein Bau, ein Geomorph — `sichtSatzInhalt`); ihre
//       Arbeit und ihre Bytes nennt die Linse, sie fallen nie rot. Ein Byte ohne Grund fällt in jedem Frame rot, beim Namen
//       („Familie Grund"), ebenso Satz-Arbeit ohne Ursache (ein Stand oder ein Verdichten, den kein Beleg trägt — „Familie
//       stand:ohne"). Die Arbeit ohne Änderung: `b.streng` (die Wand, eingefrorene Welt) in KEINEM Frame, und dort ist auch
//       jede Inhalts-Änderung rot (die Welt steht); sonst (der echte Loop — eine Gruppe wird geräumt) der Median 0 und
//       höchstens `RUHE_EREIGNIS` der Frames;
//   (B) BEWEGUNG: wer dreht oder geht, rechnet neu — eine Phase ohne Arbeit hielte eine Wahl über eine neue Lage (Loch);
//   (T) TREUE: die gehaltene Wahl ist die frisch gerechnete (`b.treue`: je Satz × Pass die Zellen, je Gruppe die Zahl);
//   (S) SCHARF: ein eingeschmuggelter Cache-Bruch (`b.bruch`, eine Ruhe-Phase mit gebrochenem Cache) fällt rot; ein
//       eingeschmuggelter Stand-Bruch (`b.standBruch`: jeder Satz zählt je Frame seinen Stand, kein Beleg ändert sich) zählt
//       als Arbeit ohne Änderung und steht als `stand:ohne` beim Namen;
//   (L) RUHE MIT LAUFENDER SONNE (`b.sonne`, die Tageslänge des Spiels — der Tag steht im Spiel nie): das Licht hat eine
//       Stufe (`state._sonne.stufe`) und dreht nur an ihr (höchstens doppelt so oft wie die Drehung der Sonne durch die
//       Stufe), und die Kette arbeitet nur, wo eine Stufe fiel (je Stufe höchstens ein Frame je Kaskade); eine Kaskade mit Box
//       wählt mit dem Licht-Rand (`lichtRand` Texel) und wählt neu erst, wenn die Sonne ihn verbraucht hat (die halbe
//       Rand-Breite über den Licht-Weg — je Kaskade höchstens 2 × Drehung / (½ Rand × Stufe) + 1 neue Wahlen).
const KASKADEN = 2;
function sichtUrteil(b) {
    const v = [];
    const So = b.sonne;
    if (So) {
        if (!(So.frames > 0)) v.push("LEER: keine Phase mit laufender Sonne gemessen");
        else if (!(So.sonneRad > 0)) v.push("LEER: in der Phase mit laufender Sonne lief die Sonne nicht");
        else {
            if (!(So.stufe > 0))
                v.push(
                    `SONNE: das Licht hat keine Stufe — es dreht in ${So.lichtFrames} von ${So.frames} Frames, jede Kaskade ` +
                        "bekommt bei jedem Render eine neue Lage und wählt neu"
                );
            else {
                const erwartet = Math.ceil(So.sonneRad / So.stufe) + 1;
                if (So.lichtFrames > 2 * erwartet)
                    v.push(
                        `SONNE: das Licht dreht in ${So.lichtFrames} von ${So.frames} Frames — die Sonne lief ` +
                            `${So.sonneRad} rad, die Stufe ${So.stufe} rad erlaubt etwa ${erwartet}`
                    );
            }
            if (So.mitBox && !(So.lichtRand > 0))
                v.push(
                    "SONNE: die Kaskaden wählen ohne Licht-Rand — jede Stufe der Sonne legt ihre Lage neu, und jede wählt neu"
                );
            const erlaubt = b.streng ? 0 : Math.floor(So.frames * RUHE_EREIGNIS);
            const halt = So.lichtRand > 0 && So.stufe > 0 ? (So.lichtRand / 2) * So.stufe : 0;
            const wahlen =
                halt > 0 ? Math.min(So.lichtFrames, Math.ceil((2 * So.sonneRad) / halt) + 1) : So.lichtFrames;
            if (So.arbeitFrames > KASKADEN * wahlen + erlaubt)
                v.push(
                    `SONNE: die Sicht-Kette arbeitet in ${So.arbeitFrames} von ${So.frames} Frames (Ø ${So.arbeit.mittel} ` +
                        `Prüfungen), das Licht drehte in ${So.lichtFrames}` +
                        (halt > 0
                            ? `, der Licht-Rand (${So.lichtRand} Texel) erlaubt etwa ${wahlen} neue Wahlen je Kaskade`
                            : "") +
                        " — Arbeit zwischen den Stufen"
                );
        }
    }
    // die Linse sieht jeden Leser der Kette (ein fehlender zählte still nichts)
    const blind = new Set();
    for (const n of ["ruhe", "sonne", "drehen", "gehen"]) for (const x of (b[n] && b[n].fehlt) || []) blind.add(x);
    if (blind.size)
        v.push(`LINSE BLIND: die Welt trägt die Leser ${[...blind].join(", ")} nicht — ihre Arbeit zählt nichts`);
    const R = b.ruhe;
    if (!R || !(R.frames > 0)) v.push("LEER: keine Ruhe-Phase gemessen (die Linse prüfte nichts)");
    else {
        // Arbeit und Bytes zählen in Ruhe nur OHNE Änderung: ein Frame, in dem das Licht drehte (die Sonne läuft im Spiel)
        // oder ein Satz-Inhalt sich änderte (Streaming, ein Bau, ein Asset), arbeitet für die Änderung — die Linse nennt sie
        // (`bytesAenderung`, `inhaltJe`), sie ist kein Cache-Bruch. Ein Byte ohne Grund ist es in JEDEM Frame.
        const erlaubt = b.streng ? 0 : Math.floor(R.frames * RUHE_EREIGNIS);
        const A = R.arbeitOhne;
        if (A.median > 0 || A.frames > erlaubt)
            v.push(
                `RUHE: die Sicht-Kette arbeitet in Ruhe ohne Änderung (Median ${A.median}, max ${A.max} Prüfungen, in ` +
                    `${A.frames} von ${R.frames} Frames, ${R.aenderungFrames} mit Änderung; alle Frames Ø ${R.arbeit.mittel}, ` +
                    `Höhlen-Sicht ${R.hoehlenSicht.mittel} + Licht ${R.hoehlenSichtLicht.mittel} Aufrufe, ` +
                    `Abschnitte ${R.abschnitt.mittel}, Ecken ${R.ecken.mittel}, Instanzen ${R.instanzBehalten.mittel}) — ` +
                    "nichts hat sich geändert, jede Prüfung ist ein Cache-Bruch" +
                    (R.taeter && R.taeter.length ? `; neu gerechnet je Frame: ${R.taeter.join(", ")}` : "")
            );
        if (R.ohneFrames > 0)
            v.push(
                `RUHE: ${R.bytesOhne.mittel} Index-Bytes je Frame ohne Änderung (max ${R.bytesOhne.max}, in ${R.ohneFrames} ` +
                    `von ${R.frames} Frames) — ein Pass schreibt ohne Änderung: ` +
                    Object.entries(R.bytesOhneJe)
                        .sort((x, y) => y[1] - x[1])
                        .map(([k, n]) => `${k} ${n} B`)
                        .join(" · ")
            );
        // die Satz-Arbeit ohne Ursache: der Cache-Schlüssel eines Satzes zählt (Stand, Verdichten), ohne dass ein Bereich, ein
        // Anker oder eine Hülle sich änderte — jede Wahl dieses Satzes rechnet neu, in jedem Frame ein Bruch
        if (R.inhaltOhneFrames > 0)
            v.push(
                `RUHE: Satz-Arbeit ohne Ursache in ${R.inhaltOhneFrames} von ${R.frames} Frames — ` +
                    Object.entries(R.inhaltOhneJe || {})
                        .sort((x, y) => y[1] - x[1])
                        .map(([k, n]) => `${k} ×${n}`)
                        .join(" · ") +
                    " (der Cache-Schlüssel eines Satzes zählt, kein Bereich, kein Anker, keine Hülle änderte sich)"
            );
        if (b.streng && R.inhaltFrames > 0)
            v.push(
                `RUHE: die Welt ist eingefroren, doch ihr Inhalt änderte sich in ${R.inhaltFrames} von ${R.frames} Frames (` +
                    Object.entries(R.inhaltJe || {})
                        .map(([fam, e]) => `${fam} ${e.keys.join(" ")}`)
                        .join(" · ") +
                    ") — die Ruhe misst nicht die Ruhe"
            );
        if (!(R.treffer.median > 0))
            v.push(
                "LINSE BLIND: kein Pass traf in Ruhe seinen Cache (die Wahl steht nie — oder die Linse sieht sie nicht)"
            );
    }
    for (const name of ["drehen", "gehen"]) {
        const x = b[name];
        if (!x) continue;
        if (!(x.frames > 0)) v.push(`LEER: Phase ${name} ohne Frame`);
        else if (!(x.arbeit.median > 0))
            v.push(
                `STARR: beim ${name === "drehen" ? "Drehen" : "Gehen"} rechnet die Sicht nicht neu (Median der Arbeit ` +
                    `${x.arbeit.median}) — eine gehaltene Wahl über eine neue Lage ist ein Loch`
            );
    }
    for (const t of (b.treue && b.treue.abweichung) || [])
        v.push(`TREUE: ${t} — die gehaltene Wahl ist nicht die frisch gerechnete`);
    if (b.treue && !(b.treue.geprueft > 0)) v.push("LEER: Treue ohne Vergleich (kein Abschnitt, keine Gruppe)");
    if (b.bruch !== undefined) {
        const x = b.bruch;
        if (!x || !(x.arbeit.median > 0))
            v.push(
                "LINSE STUMPF: ein eingeschmuggelter Cache-Bruch (die Lage jedes Passes neu) arbeitet in Ruhe nicht"
            );
    }
    // der Byte-Bruch (`b.byteBruch`): jeder ruhende Abschnitt legt sich je Pass dicht neu, ohne dass eine Wahl es schuldet —
    // die Linse muss die Bytes OHNE Änderung zählen und den Grund `dicht:ohne` beim Namen nennen
    if (b.byteBruch !== undefined) {
        const x = b.byteBruch;
        if (!x || !(x.ohneFrames > 0) || !Object.keys(x.bytesOhneJe || {}).some((k) => / dicht:ohne /.test(k)))
            v.push(
                "LINSE STUMPF: ein eingeschmuggelter Byte-Bruch (jeder ruhende Abschnitt legt sich je Pass dicht neu) zählt " +
                    `nicht als Bytes ohne Änderung (${x ? x.ohneFrames : "?"} Frames, ${JSON.stringify((x && x.bytesOhneJe) || {})})`
            );
    }
    // der Stand-Bruch (`b.standBruch`, Gegenprüfung 07.10.): jeder Satz zählt je Frame seinen Stand, ohne dass ein Bereich, ein
    // Anker oder eine Hülle sich ändert — die Linse muss seine Arbeit als Arbeit OHNE Änderung zählen und `stand:ohne` beim
    // Namen nennen (vorher hieß der eigene Zähler „Inhalt geändert", und die Wand stand grün)
    if (b.standBruch !== undefined) {
        const x = b.standBruch;
        const benannt =
            !!x && x.inhaltOhneFrames > 0 && Object.keys(x.inhaltOhneJe || {}).some((k) => / stand:ohne$/.test(k));
        if (!benannt || !(x.arbeitOhne && x.arbeitOhne.frames > 0))
            v.push(
                "LINSE STUMPF: ein eingeschmuggelter Stand-Bruch (jeder Satz zählt je Frame seinen Stand, kein Bereich, kein " +
                    "Anker, keine Hülle ändert sich) zählt als Änderung (" +
                    (x
                        ? `${x.aenderungFrames} von ${x.frames} Frames mit Änderung, Arbeit ohne Änderung in ` +
                          `${x.arbeitOhne ? x.arbeitOhne.frames : "?"}, ohne Ursache ${JSON.stringify(x.inhaltOhneJe || {})}`
                        : "keine Phase") +
                    ")"
            );
    }
    return v;
}

// DER ECHTE LAUF (Seiten-Kontext, die Werkbank): der Spiel-Loop läuft über rAF; nach `ein` Sekunden Einschwingen zählt
// die Linse je gerendertem Frame — RUHE (der Spieler steht, der Blick steht), DREHEN (yaw 1° je Frame), GEHEN (W gedrückt).
// `tag: "steht"` hält die Tageszeit (die Sonne wandert sonst je Frame, jede Kaskade bekommt bei jedem Render eine neue
// Lage); die Bühne (Mittag · Sonne · Sommer) gilt vorher.
function sichtLauf(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        window.__buehne();
        if (window.__tiereHalten) window.__tiereHalten();
        const decke = st.perfTargetMs;
        if (k.regler === "voll") st.perfTargetMs = 1000;
        const tagAlt = st.dayLengthMinutes;
        // die Tageslänge je Phase: `steht` hält den Tag; die Phase `sonne` und `laeuft` fahren die Tageslänge des Spiels
        const tagSetzen = (laeuft) => {
            if (laeuft) delete st.dayLengthMinutes;
            else st.dayLengthMinutes = 1e12;
        };
        tagSetzen(k.tag !== "steht");
        // der Spieler kehrt nach dem Gehen an seinen Ort zurück (die nächste Messung steht wieder am Messort)
        const ort = st.playerMesh.position.clone();
        const yaw0 = st.yaw;
        const L = window.__sichtLinseAn();
        L.an();
        const phasen = [];
        let phase = null;
        let rest = 0;
        let fertigP = null;
        const fertig = new Promise((res) => (fertigP = res));
        const plan = [];
        if (k.ruhe > 0) plan.push(["ruhe", k.ruhe]);
        if (k.sonne > 0) plan.push(["sonne", k.sonne]);
        if (k.drehen > 0) plan.push(["drehen", k.drehen]);
        if (k.gehen > 0) plan.push(["gehen", k.gehen]);
        const naechste = () => {
            st.keys.w = false;
            const p = plan.shift();
            if (!p) return void (phase = null);
            phase = { name: p[0], frames: [] };
            phasen.push(phase);
            rest = p[1];
            tagSetzen(p[0] === "sonne" || k.tag !== "steht");
            if (p[0] === "gehen") st.keys.w = true;
        };
        let messen = false;
        // der Vorlauf: gerenderte Frames, bevor die Ruhe zählt — ein Abschnitt mit Lücken legt sich nach `dichtNach` ruhigen
        // Pässen EINMAL dicht (die ferne Kaskade rendert jeden dritten Frame); das ist die Arbeit der Änderung davor
        let vorlauf = k.vorlauf != null ? k.vorlauf : 120;
        rend.setAnimationLoop((t) => {
            // Drehen: `drehGrad` je Frame (1° — darüber wählt jeder Frame neu: der Halt reicht einen halben Dreh-Rand)
            if (messen && phase && phase.name === "drehen") st.yaw += ((k.drehGrad || 1) * Math.PI) / 180;
            // wie jeder Werkbank-Takt: die Wetter-Wache der Bühne und der Ort-Takt des gestellten Orts
            window.__wetterHalten();
            if (window.__ortSchritt) window.__ortSchritt();
            r._gameLoopTick(t);
            const f = L.frame();
            if (!messen || !phase || f.paesse === 0) return;
            if (vorlauf > 0) return void vorlauf--;
            phase.frames.push(f);
            if (--rest <= 0) {
                naechste();
                if (!phase) {
                    rend.setAnimationLoop(null);
                    fertigP();
                }
            }
        });
        try {
            await sleep((k.ein || 5) * 1000);
            // DIE WELT STEHT: 3 s lang kein neuer Chunk und kein neuer Stand eines Satzes (Bereich, Hülle, Ordnung) — sonst misst
            // die Ruhe das Einschwingen (höchstens `ruheMax` s)
            const welt = () => {
                let n = st.voxelChunks ? st.voxelChunks.size : 0;
                if (st.chunkSaetze) for (const x of st.chunkSaetze.values()) n += 1e6 * (x.stand || 0) + x.bloecke.size;
                return n;
            };
            const t0 = performance.now();
            let vor = welt(),
                seit = performance.now();
            while (performance.now() - t0 < (k.ruheMax || 120) * 1000 && performance.now() - seit < 3000) {
                await sleep(250);
                const w = welt();
                if (w !== vor) {
                    vor = w;
                    seit = performance.now();
                }
            }
            messen = true;
            naechste();
            if (!phase) rend.setAnimationLoop(null);
            else await Promise.race([fertig, sleep(600000)]);
        } finally {
            rend.setAnimationLoop(null);
            st.keys.w = false;
            st.perfTargetMs = decke;
            if (tagAlt === undefined) delete st.dayLengthMinutes;
            else st.dayLengthMinutes = tagAlt;
            L.aus();
        }
        const aus = {};
        for (const p of phasen)
            aus[p.name] = window.__sichtPhase(p.frames, p.name === "ruhe" || p.name === "sonne" ? 1 : 0);
        const pm = st.playerMesh.position;
        aus.spieler = [pm.x, pm.y, pm.z].map((x) => +x.toFixed(1));
        pm.copy(ort);
        st.yaw = yaw0;
        return aus;
    })();
}

module.exports = {
    SICHT_KETTE,
    SICHT_PRUEFUNG,
    SICHT_TREFFER,
    SICHT_NEU,
    RUHE_LESER,
    sichtKameraBewegt,
    sichtSatzInhalt,
    sichtBytesKlasse,
    sichtArbeitOhne,
    sichtAenderung,
    sichtPhase,
    sichtUrteil,
    SICHT_INSTALL:
        `window.__sichtLinseAn = () => (${sichtLinse.toString()})(${JSON.stringify({
            kette: SICHT_KETTE,
            pruefung: SICHT_PRUEFUNG,
            treffer: SICHT_TREFFER,
            neu: SICHT_NEU,
            grund: SICHT_GRUND,
            schreib: SICHT_SCHREIB,
            ruheLeser: RUHE_LESER,
        })});` +
        `window.__sichtKameraBewegt = ${sichtKameraBewegt.toString()};` +
        `window.__sichtSatzInhalt = ${sichtSatzInhalt.toString()};` +
        `window.__sichtBytesKlasse = ${sichtBytesKlasse.toString()};` +
        `window.__sichtAenderung = ${sichtAenderung.toString()};` +
        `window.__sichtArbeitOhne = ${sichtArbeitOhne.toString()};` +
        `window.__sichtPhase = ${sichtPhase.toString()};` +
        `window.__sichtLauf = ${sichtLauf.toString()};`,
};
