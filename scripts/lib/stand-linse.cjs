// stand-linse.cjs — DIE STAND-LINSE (Lehre 25, Gebot 7): was die Fege-Takte und die langsamen Simulationen je Frame
// ARBEITEN, wenn sich nichts ändert.
//
// Die Linse zählt UNABHÄNGIG von der Stand-Wache (`_standRuht`): sie hüllt die Fege-Takte (wer gerade geht) und ihre
// Blatt-Helfer (was ein Gang je Einheit ruft — Stufen-Wahl, Sichthöhe, Karten-Frage, Ring-Stufe, Saum-Punkt, Kachel-
// Armlänge …) und bucht jeden Blatt-Ruf auf den Takt, der ihn rief. Eine Einheit = ein Blatt-Ruf. Ruhe heißt 0. Dazu je
// Frame die Zeit je Takt (Richtwert — die Zeit misst der OMEN) und die Welt-Matrizen: Knoten, die `updateMatrixWorld`
// besucht, und Matrizen, die `updateMatrix` neu setzt (der Szenen-Graph je Gang).
//
//   Seite:     const L = window.__standLinseAn(); … je Frame L.frame() → { strom: n, archLod: n, … , ms: {…}, matrix }; L.aus()
//              window.__standLauf({ ein, ruhe, n, regler, tiere, sim }) — der echte Loop (rAF): Ruhe mit Wache (B), mit
//              gebrochener Wache (A, jeder Takt geht wie vor der Welle), in der Folge B A A B, danach `sim` s Spielzeit
//              die langsamen Simulationen (S, die Sim-Linse `__simLinseAn`, SIMS unten)
//   Urteil:    standUrteil({ ruhe, gehen, wecken, bruch, taeter, simRuhe, simWecken, pageErrors }) → [Verletzungen]
//   Werkbank:  node scripts/werkbank.cjs stand [n] [--ein s] [--ruhe max-s] [--regler voll|frei] [--tiere frei|halten]
//              [--sim s]
"use strict";

// Die Fege-Takte (Name der Wache → Methode) und ihre Blatt-Helfer.
const TAKTE = {
    strom: "_tickVoxelChunkStreaming",
    archLod: "_tickArchitectureLOD",
    archCull: "tickArchitectureCulling",
    streuLod: "_tickScatterLod",
    nahStreu: "_tickNahStreu",
    nahWiese: "_tickNahWiese",
    deckWache: "_fernRingDeckWache",
};
const BLAETTER = [
    "_voxelChunkLodFor",
    "_pruneDistantVoxelChunks",
    "_lodTreeVisHeight",
    "_chooseLODForDistance",
    "_updateFoundryLodBand",
    "_archKartenPreset",
    "_archIsRendered",
    "_archZiegelFern",
    "_foundryPresetForEntry",
    "_capNexusStructures",
    "_scatterSichtHoehe",
    "_scatterCellTransform",
    "_bodenKommtNie", // je Kachel des Rings der Nah-Streu und der Nah-Wiese (w27-takt-streu: die Stufe wählt die GPU)
    "_foundryBudgetZeile",
    "_foundryFlattenFor",
    "_fernRingPunkt",
    "_terrainMacroSurfaceY",
];
// Takte mit EIGENER Uhr, die ein Fege-Takt auch im Schlaf ruft (der Nachwuchs im Ring): ihre Blatt-Rufe gehören keinem
// Fege-Takt.
const EIGENE_UHR = ["_tickFoliageGrowth"];

// DIE LANGSAMEN SIMULATIONEN (feld.K3): Takte mit eigener Uhr außerhalb der Stand-Wache — Name → [Takte, Zellen (Pfade im state)]. In Ruhe
// arbeitet keine. Eine Einheit = ein Ruf einer Stamm-Methode unter dem Takt oder ein Element seiner Zellen, das er durchgeht;
// unter einem Schreib-Akt (AKTE) zählt die Arbeit der Tat (`akt`), nie der Ruhe.
const SIMS = {
    wasser: [["_tickWorldWaterCA"], ["waterCAActive"]],
    regen: [["_tickRain", "tickWeatherTransition"], []],
    saison: [["_tickSeason"], []],
    nachwuchs: [["_tickScatterRegrow"], ["worldMeta.taten"]],
    wuchs: [["_tickFoliageGrowth"], ["pendingFoliageChunks"]],
    feld: [["_feldTod"], ["lifeField", "emotionField", "wohlBaseline", "lifeField.tod", "emotionField.tod", "wohlBaseline.tod"]],
    brand: [["_tickBrand"], ["brandFeld"]],
    // DIE ZÜNDUNG — ein Teil des Brands mit EIGENEM Zähler (front-brand): was unter `_brandZuenden` läuft (das Bett messen, das
    // Tempo, die acht Ankünfte), bucht die Linse hier; unter `brand` bleibt der Gang der brennenden Zellen. Die Marke ist der
    // Ruf selbst (Laufzeit), nie der Name eines Lesers: so urteilt die Brand-Linse Gang und Zündung je an IHRER Einheit.
    zuendung: [["_brandZuenden"], []],
    // DIE DRUCKWELLE (same.physik.reaktion#2) — ihr Takt (`_tickDruck`: die Fristen der Ladungen und der Körper fallen zu ihrer
    // Zeit) und ihr EINER Schreiber (`_druckWelle`: je Körper im Radius eine Frist). Eine eigene Marke mit eigenem Soll an IHRER
    // Einheit (je getroffenem Körper, je gebrochenem Teil — `druckSoll`), nie im Gang des Brands versteckt: die Front, die eine
    // Ladung erreicht, bucht die Welle hier, nicht unter `zuendung`. Ohne Frist kostet der Takt nichts (Ruhe ist Null).
    druck: [["_tickDruck", "_druckWelle"], []],
};
const AKTE = ["_depositLife", "_depositEmotion", "_observeFieldWohl", "_brandEntfachen"];

// Die Sim-Linse (Seite): hüllt jede Methode des Prototyps und die Zellen jeder Sim (an der Instanz, je Frame neu gelegt).
//   const S = window.__simLinseAn(); je Frame S.frame() → { wasser: n, …, akt: n, je: { wasser: { methode: n } } }; S.aus()
function simLinseAn(sims, akte) {
    const P = Object.getPrototypeOf(r);
    const namen = Object.keys(sims);
    const rolle = Object.fromEntries(akte.map((m) => [m, "akt"]));
    for (const n of namen) for (const m of sims[n][0]) rolle[m] = n;
    const stapel = [];
    let frame;
    const buche = (wer) => {
        const o = stapel.includes("akt") ? "akt" : stapel[stapel.length - 1];
        frame[o]++;
        frame.je[o][wer] = (frame.je[o][wer] | 0) + 1;
    };
    const leer = () => {
        frame = { akt: 0, je: { akt: {} } };
        for (const n of namen) (frame[n] = 0), (frame.je[n] = {});
    };
    leer();
    const orig = {};
    for (const m of Object.getOwnPropertyNames(P)) {
        const f = Object.getOwnPropertyDescriptor(P, m).value;
        if (m === "constructor" || typeof f !== "function") continue;
        orig[m] = f;
        P[m] = function (...a) {
            if (stapel.length) buche(m);
            if (!rolle[m]) return f.apply(this, a);
            stapel.push(rolle[m]);
            try {
                return f.apply(this, a);
            } finally {
                stapel.pop();
            }
        };
    }
    const gehuellt = [];
    const ITER = ["entries", "keys", "values", Symbol.iterator];
    const huelle = (obj, wer) => {
        if (!obj || typeof obj !== "object" || gehuellt.includes(obj)) return;
        gehuellt.push(obj);
        const proto = Object.getPrototypeOf(obj);
        for (const k of ITER)
            obj[k] = function () {
                const it = proto[k].call(this);
                return Object.assign(Object.create(it), {
                    next() {
                        const x = it.next();
                        if (!x.done && stapel.length) buche(wer);
                        return x;
                    },
                });
            };
        obj.forEach = function (cb, dies) {
            for (const [k, v] of this.entries()) cb.call(dies, v, k, this);
        };
    };
    const legen = () => {
        for (const n of namen) for (const z of sims[n][1]) huelle(z.split(".").reduce((o, k) => o && o[k], st), "·" + z);
    };
    legen();
    return {
        frame() {
            const aus = frame;
            leer();
            legen();
            return aus;
        },
        // der laufende Stand einer Rolle im angefangenen Bild (ein Mitleser misst so EIN Ereignis: Stand danach − Stand davor)
        stand: (n) => frame[n] | 0,
        leser: (n) => Object.assign({}, frame.je[n]),
        aus() {
            Object.assign(P, orig);
            for (const o of gehuellt) for (const k of [...ITER, "forEach"]) delete o[k];
        },
    };
}

// Eine Sim-Phase (Frames, Spiel-Sekunden) → je Sim Summe, Frames mit Arbeit und die häufigsten Rufe (`je`); `akt` die Tat.
function simPhase(frames, spielS) {
    const aus = { frames: frames.length, spielS: +(spielS || 0).toFixed(2), sims: {} };
    for (const n of ["akt", ...Object.keys((frames[0] || {}).je || {}).filter((n) => n !== "akt")]) {
        const je = {};
        let summe = 0;
        let mitArbeit = 0;
        for (const f of frames) {
            summe += f[n] | 0;
            if (f[n] > 0) mitArbeit++;
            for (const [m, k] of Object.entries(f.je[n])) je[m] = (je[m] | 0) + k;
        }
        const t = { summe, mitArbeit, je: Object.entries(je).sort((a, b) => b[1] - a[1]).slice(0, 4) };
        if (n === "akt") [aus.akt, aus.aktJe, aus.aktSchreib, aus.aktAlle] = [summe, t.je, je._feldTod | 0, je];
        else aus.sims[n] = t;
    }
    return aus;
}

const simJe = (t) => t.je.map(([m, k]) => `${m} ${k}`).join(", ");
// in Ruhe arbeitet keine Sim, ein Akt (ein Wesen träufelt Leben) höchstens zwei Einheiten je geschriebener Zelle (feld.K3#2)
function simRuheZeilen(R, wo) {
    return Object.keys(SIMS)
        .filter((n) => !R.sims[n] || R.sims[n].summe > 0)
        .map((n) =>
            R.sims[n]
                ? `RUHE-SIM: ${n} (${SIMS[n][0].join(" · ")}) arbeitet in Ruhe ${wo} — ${R.sims[n].summe} Einheiten in ` +
                  `${R.sims[n].mitArbeit} von ${R.frames} Frames (${R.spielS} s; ${simJe(R.sims[n])})`
                : `LEER: die Sim ${n} fehlt in der Ruhe ${wo}`
        )
        .concat(
            R.akt > 2 * (R.aktSchreib | 0)
                ? [`RUHE-TAT: die Akte (${AKTE.join(" · ")}) arbeiten in Ruhe ${wo} über ihre Zellen hinaus — ${R.akt} Einheiten für ` +
                   `${R.aktSchreib | 0} geschriebene (${simJe({ je: R.aktJe || [] })})`]
                : []
        );
}

function standLinseAn(takte, blaetter, eigeneUhr) {
    const P = Object.getPrototypeOf(r);
    const namen = Object.keys(takte);
    const orig = {};
    const stapel = [];
    const leer = () => Object.fromEntries(namen.map((n) => [n, 0]));
    let [frame, ms, wirkt, geweckt] = [leer(), leer(), leer(), leer()];
    // je Methode EINE Hülle (die erste gewinnt): `h(f)` baut die neue um das Original `f`
    const um = (m, h) => typeof P[m] === "function" && !orig[m] && (P[m] = h((orig[m] = P[m])));
    for (const n of namen)
        um(takte[n], (f) => function (...a) {
            stapel.push(n);
            const t0 = performance.now();
            try {
                return f.apply(this, a);
            } finally {
                stapel.pop();
                ms[n] += performance.now() - t0;
            }
        });
    for (const b of blaetter)
        um(b, (f) => function (...a) {
            const oben = stapel[stapel.length - 1];
            if (oben) frame[oben]++;
            return f.apply(this, a);
        });
    for (const m of eigeneUhr || [])
        um(m, (f) => function (...a) {
            stapel.push("");
            try {
                return f.apply(this, a);
            } finally {
                stapel.pop();
            }
        });
    // DIE TREUE: jeder Gang, der die Welt änderte (`_standMeldet(…, gewirkt)`) — nach einer Ruhe zeigt ein Gang mit
    // gebrochener Wache, ob die Wache eine Änderung verschlief (er wirkte dann). VERSCHLAFEN heißt: die heile Wache hätte den
    // Gang schlafen lassen — ihr Urteil legt die Treue-Phase je Takt in `__standWacheUrteil` (`_standRuht` geht dort weiter
    // und antwortet nur nicht). Ein Gang, den die heile Wache selbst ging (ein Weckruf, `_standWecken`, während der Phase: die
    // Antwort des Gau-Fadens, deren Fraß-Stufe springt, `_gauAntwort` → `_nahStreuNeuIn`), ist `geweckt`, nie verschlafen.
    // Bis w28-herde zählte jeder Gang mit Wirkung als verschlafen: Code-Check 44759649370 (ce961ceb) fiel „TREUE: nahStreu …
    // nach dem Bau in 4 Gängen“, während die heile Wache 20 Frames davor ruhte — die Antwort des Gaus kam in die Phase.
    um("_standMeldet", (f) => function (name, besucht, gewirkt, offen) {
        const U = window.__standWacheUrteil;
        if (gewirkt && name in wirkt) (U && U[name] === false ? geweckt : wirkt)[name]++;
        return f.call(this, name, besucht, gewirkt, offen);
    });
    // DIE WELT-MATRIZEN: jeder Besuch von `updateMatrixWorld` (ein Knoten je Gang) und jede neu gesetzte lokale Matrix.
    const O = window.THREE.Object3D.prototype;
    const mx = { knoten: 0, compose: 0 };
    const oM = {};
    for (const [m, z] of [["updateMatrixWorld", "knoten"], ["updateMatrix", "compose"]]) {
        const f = (oM[m] = O[m]);
        O[m] = function (...a) {
            mx[z]++;
            return f.apply(this, a);
        };
    }
    return {
        namen,
        frame() {
            const aus = Object.assign(frame, { ms, wirkt, geweckt, matrix: { ...mx } });
            [frame, ms, wirkt, geweckt] = [leer(), leer(), leer(), leer()];
            mx.knoten = mx.compose = 0;
            return aus;
        },
        aus() {
            Object.assign(P, orig);
            Object.assign(O, oM);
        },
    };
}

// Eine Phase (Liste von Frames) → je Takt: Einheiten Summe, Mittel, Max, Frames mit Arbeit; Zeit je Takt; Matrizen.
function standPhase(frames) {
    const aus = { frames: frames.length, takte: {} };
    const namen = frames.length
        ? Object.keys(frames[0]).filter((n) => !["ms", "wirkt", "geweckt", "matrix", "cpu"].includes(n))
        : [];
    const mittel = (f) =>
        frames.length ? +(frames.reduce((a, x) => a + (f(x) || 0), 0) / frames.length).toFixed(3) : 0;
    for (const n of namen) {
        let s = 0,
            max = 0,
            mitArbeit = 0;
        for (const f of frames) {
            const v = f[n] | 0;
            s += v;
            if (v > max) max = v;
            if (v > 0) mitArbeit++;
        }
        aus.takte[n] = {
            summe: s,
            mittel: frames.length ? +(s / frames.length).toFixed(2) : 0,
            max,
            mitArbeit,
            ms: mittel((f) => f.ms && f.ms[n]),
            wirkt: frames.reduce((a, f) => a + ((f.wirkt && f.wirkt[n]) | 0), 0),
            geweckt: frames.reduce((a, f) => a + ((f.geweckt && f.geweckt[n]) | 0), 0),
        };
    }
    aus.summe = Object.values(aus.takte).reduce((a, t) => a + t.summe, 0);
    aus.ms = +Object.values(aus.takte)
        .reduce((a, t) => a + t.ms, 0)
        .toFixed(3);
    aus.matrix = {
        knoten: mittel((f) => f.matrix && f.matrix.knoten),
        compose: mittel((f) => f.matrix && f.matrix.compose),
    };
    aus.cpu = mittel((f) => f.cpu);
    return aus;
}

// DER ECHTE LOOP (Werkbank, echter Renderer): rAF, der Spiel-Takt wie im Spiel, die Bühne hält Mittag · Sonne · Sommer,
// das Wetter friert. Nach `ein` s und der Ruhe (Chunks gleich, Foundry und Karten-Bäcker leer, höchstens `ruhe` s) misst
// er vier Phasen à n Frames: B (die Wache) · A (die Wache gebrochen: `_standRuht` schläft nie — jeder Takt geht wie vor
// der Welle) · A · B. Gezählt je Phase: Einheiten je Takt, Zeit je Takt, Matrizen je Frame, CPU des Takts.
function standLauf(k) {
    return (async () => {
        const rend = st.renderer;
        const P = Object.getPrototypeOf(r);
        window.__buehne();
        if (k.tiere !== "frei") window.__halten?.();
        const decke = st.perfTargetMs;
        if (k.regler === "voll") st.perfTargetMs = 1000;
        const L = window.__standLinseAn();
        let ziel = null;
        let S = null; // die Sim-Linse (Phase S), nur in ihrer Phase gelegt — sie hüllt jede Methode
        let simZiel = null;
        rend.setAnimationLoop((t) => {
            window.__wetterHalten();
            L.frame();
            if (S) S.frame();
            const c0 = performance.now();
            if (window.__ortSchritt) window.__ortSchritt();
            r._gameLoopTick(t);
            const f = L.frame();
            f.cpu = performance.now() - c0;
            if (ziel) ziel.push(f);
            if (S && simZiel) simZiel.push(S.frame());
        });
        const ruheRuf = P._standRuht;
        const aus = { phasen: {}, folge: [] };
        try {
            await sleep((k.ein || 5) * 1000);
            const zustand = () =>
                [
                    st.voxelChunks ? st.voxelChunks.size : 0,
                    r._weltOffen().foundry, // die Foundry, wie das Wort „die Welt steht" sie zählt (A9)
                    (r._impostorBakeQueue || []).length,
                ].join("|");
            const t0 = performance.now();
            let vor = zustand(),
                ruhigSeit = performance.now();
            while (performance.now() - t0 < (k.ruhe || 120) * 1000) {
                await sleep(250);
                const z = zustand();
                if (z !== vor || !/\|0\|0$/.test(z)) ruhigSeit = performance.now();
                vor = z;
                if (performance.now() - ruhigSeit >= 3000) break;
            }
            aus.ruheNachS = +((performance.now() - t0) / 1000).toFixed(1);
            aus.zustand = vor;
            const n = k.n || 120;
            const fahre = async (name, bruch) => {
                if (bruch)
                    P._standRuht = function (...a) {
                        ruheRuf.apply(this, a);
                        return false;
                    };
                else P._standRuht = ruheRuf;
                // ein Frame Anlauf (die Wache schläft nach einem vollen leeren Gang wieder ein), dann n Frames
                await sleep(400);
                const fs = [];
                ziel = fs;
                while (fs.length < n) await sleep(50);
                ziel = null;
                const ph = window.__standPhase(fs.slice(0, n));
                aus.folge.push(name);
                (aus.phasen[name] = aus.phasen[name] || []).push(ph);
            };
            await fahre("B", false);
            await fahre("A", true);
            await fahre("A", true);
            await fahre("B", false);
            // (S) DIE SIMS (feld.K3): `sim` Sekunden Spielzeit Ruhe, die Sim-Linse zählt jede langsame Simulation
            if (k.sim > 0) {
                P._standRuht = ruheRuf;
                S = window.__simLinseAn();
                await sleep(400);
                const fs = [];
                const z0 = st.spielZeit;
                simZiel = fs;
                while (st.spielZeit - z0 < k.sim) await sleep(250);
                simZiel = null;
                aus.simRuhe = window.__simPhase(fs, st.spielZeit - z0);
            }
        } finally {
            P._standRuht = ruheRuf;
            rend.setAnimationLoop(null);
            if (S) S.aus();
            L.aus();
            st.perfTargetMs = decke;
        }
        aus.ruhe = aus.phasen.B[aus.phasen.B.length - 1];
        aus.ruheOnly = true;
        return aus;
    })();
}

// DAS URTEIL (gate:stand-takt; `werkbank stand` urteilt nur über die Ruhe):
//   RUHE    — in KEINEM Frame der Ruhe arbeitet ein Fege-Takt (0 Einheiten);
//   SCHARF  — derselbe Stand mit gebrochener Wache (jeder Takt geht) zeigt JEDEN Takt arbeitend (die Linse sieht ihn);
//   TREUE   — mit gebrochener Wache ändert kein Takt die Welt, und jede Treue-Phase geht jeden Takt eine volle,
//             stehende Runde;
//   TÄTER   — je Takt mit einer Runde über mehrere Gänge findet die Treue-Phase die still verstellte Einheit in der
//             zweiten Rundenhälfte (Stufen-Wahl, Streu, Saum);
//   GEHEN   — beim Gehen arbeiten Ring, Stufen-Wahl und Cull (die Änderung kostet), und der Spieler kommt voran;
//   WECKEN  — ein Bau im Stand weckt Cull und Stufen-Wahl, der Bau steht danach, und die Wache schläft wieder; ein
//             Regler-Schritt weckt den Cull, ein Wahrnehmungs-Schritt (LOD_DISTANCES) Stufen-Wahl und Streu;
//   STROM   — ein Sprung an einen fremden Ort baut den Spieler-Chunk (Streaming heilig), auch nach der Ruhe;
//   PAGE    — kein Page-Error.
// DAS URTEIL DER SIMS (feld.K3): in 60 s Ruhe nach einer Tat (Ernte, Leben) arbeitet keine Sim und kein Akt; ihr Ereignis weckt
// jede (sonst STUMPF), danach schläft sie; der Wasser-Automat geht nach einem Wecken am Fixpunkt genau EINEN Takt; das Feld und
// der Brand arbeiten nur in berührten Zellen.
// DER BRAND AN SEINEN ZWEI EINHEITEN (front-brand). Bis hier trug er EIN Soll: ≤ 64 Einheiten je brennender Zelle und Schritt
// (+ 4 096 je gemessener Bett-Maske). Der Preis einer Zündung wächst aber mit den ZÜNDUNGEN eines Schritts, nie mit den brennenden
// Zellen: zwei Zündungen bei 16 Zellen kosteten 813–895 (Soll 1 024), drei 1 206 (die Radeon-Probe am Stempel w28-front-brand
// cc19e47a, jeder Leser genau × 1,5) — das Urteil würfelte an main und an jedem Zweig. Jetzt zwei Gesetze, je an der ÄNDERUNG DER WELT:
//   GANG    — was der Takt außerhalb der Zündung tut (das Feld durchgehen, Glut, Asche, das Bild): ≤ BRAND_GANG je Zelle des Felds;
//   ZÜNDUNG — was unter `_brandZuenden` läuft (die Laufzeit-Marke `zuendung` der SIMS): ≤ BRAND_ANKUNFT je Ankunft der Front (das
//             Gemessene lesen, das Tempo-Gesetz, der Weg, die acht Nachbarinnen) + BRAND_BETT je NEU gemessenem Bett (lebendig,
//             Nässe, EIN Marsch für seine Höhe, das Gefälle, die Feuchte) + BRAND_PUNKT je Bett-Punkt (der EINE Stoff-Leser
//             `_kontaktStoffAt` mit seinen Lese-Stellen) + BRAND_KAHL je kahlem Punkt (kein Brennstoff: er fragt das Feld unter der
//             Boden-Karte, EIN Marsch durch seine Säule).
// Das Soll der Zündung kommt aus dem, was die Welt MASS (die neuen Einträge des Gemessenen `_brandBett`, ihre Punkte nach dem
// Gesetz `bettGrob` · `bettGitter`², ihre Maske), nie aus der Zahl der Lese-Rufe: ein Soll aus den Rufen wüchse mit dem Täter (eine
// Zündung, die ihr Bett zweimal liest, bliebe grün). Die Zahlen sind Ratschen der Messung an der Mess-Wiese (Radeon 890M,
// Null-Renderer, 300 Schritte, 22 Zündungen, 3 Masken; aus den Lesern je Zündung gelöst): der Gang bis 10,8 je Zelle (der
// Neubau der Wiese im kleinen Feld); eine Zündung mit neuem Bett trägt einen Sockel von 141 (mit Tempo und Nachbarinnen),
// je Laub-Punkt 15, je Gras-Punkt 52 (die Boden-Karte `_bodenSichtAt`: 37), je kahlem Punkt 116 (dazu das Feld
// `_terrainMaterialAt` mit EINEM Marsch: 64). Eine Ankunft ohne neues Bett (ein Ort ohne Bett, den eine zweite Nachbarin
// erreicht: das Gemessene lesen) kam in der Messung nicht vor, an der Quelle gelesen ≤ 5. Die groben Punkte einer Maske und
// eines Orts ohne Bett zählen als kahl (Obergrenze: der Eintrag des Gemessenen trägt nur das feine Gitter). Die Zeile der
// Sim nennt in jedem Lauf je Gesetz den Anteil am Soll.
const BRAND_GANG = 16;
// das Fenster am langsamsten Läufer (FENSTER-UHR): Median und schnellster Sprung der Köpfe auf 0,02 m/s gleich — zwischen zwei Herden
// lebt die Welt weiter (lokal 0,305 ↔ 0,307 m/s), die Uhr des Läufers trug 0,06 (0,35 ↔ 0,29 m/s) bis 0,69 (CI)
const FENSTER_MS = 0.02;
// DIE TREUE DER FRONT (FRONT-TREUE): das Vorrücken des Kopfs auf dem gesetzten Bett ÷ R des Gesetzes — gemessen 1,002 · 1,003 ·
// 0,989 (0,9° · 23,4° · 44,1°, Radeon-Laptop, Null-Renderer): jede Zelle der Kette läuft genau ihr Tempo der Ellipse. Das Band
// ±10 % statt ±15 %: das Gitter nur der Diagonalen (die Mutante) verliert an der Achse 11,5 % (0,885)
const FRONT_TREUE = [0.9, 1.1];
// DIE DREI STARTS AN DERSELBEN UHR (FENSTER-BETT): mit · alle · Vorrücken · R relativ gleich
const BETT_GLEICH = 0.02;
const BRAND_ANKUNFT = 16;
const BRAND_BETT = 160;
const BRAND_PUNKT = 56;
const BRAND_KAHL = 72;
const brandGangSoll = (Z, k) => BRAND_GANG * Z.zellen[k];
// DER FALL DER KACHELN (linse-brand-schritte 4): der Gang je Zelle (BRAND_GANG) trägt ihn nicht — er ist die Änderung am Schirm,
// gemessen an seiner Quelle (`_brandMalen` → `_nahRingNeuIn`): je Bild höchstens EIN Rechteck der Asche über ±½ Zelle
// (2 × 16 m)², je Kachel darin EIN Ruf (`_nahStreuKachelFaellt`, `_nahWieseKachelFaellt`). CI c8e95d38 und Radeon wortgleich:
// 98 + 24 Kacheln in EINEM Rechteck, im Gang lagen sie bei 9 Zellen über 144
const BRAND_KACHEL = 1;
const BRAND_RING_M2 = 1024;
const brandKachelSoll = (Z, k) => BRAND_KACHEL * (Z.kachelSoll[k] | 0);
const brandZuendSoll = (Z, k) =>
    BRAND_ANKUNFT * (Z.ankuenfte[k] | 0) + BRAND_BETT * (Z.betten[k] | 0) + BRAND_PUNKT * (Z.punkte[k] | 0) + BRAND_KAHL * (Z.kahl[k] | 0);
const brandLeser = (je, n = 6) => (je ? simJe({ je: je.slice(0, n) }) : "");
// DIE SPANNE AM SOLL (die Zeile der Sim, w28-pop-treue): je Gesetz der Schritt, der seinem Soll am nächsten kommt — sein Anteil am
// Soll und seine Leser. Die Zahl steht in jedem Lauf, nicht erst im Rot.
function brandAmSoll(Z) {
    const eng = (werte, soll, mehr) => {
        let best = null;
        (werte || []).forEach((e, k) => {
            const a = e > 0 ? e / soll(k) : 0;
            if (!best || a > best.anteil) best = { schritt: k + 1, anteil: a, einheiten: e, soll: soll(k), ...mehr(k) };
        });
        return best && Object.assign(best, { anteil: +best.anteil.toFixed(3) });
    };
    return {
        gang: eng(Z.gang, (k) => brandGangSoll(Z, k), (k) => ({ zellen: Z.zellen[k], leser: brandLeser(Z.rufe && Z.rufe[k]) })),
        kachel: Z.kachel && eng(Z.kachel, (k) => Math.max(1, brandKachelSoll(Z, k)), (k) => ({ ringe: Z.ringe[k], m2: Z.ringM2[k], leser: brandLeser(Z.rufeK && Z.rufeK[k]) })),
        zuendung: eng(Z.zuendung, (k) => brandZuendSoll(Z, k), (k) => ({ ankuenfte: Z.ankuenfte[k], betten: Z.betten[k], punkte: Z.punkte[k], kahl: Z.kahl[k], masken: Z.masken[k], leser: brandLeser(Z.rufeZ && Z.rufeZ[k]) })), // prettier-ignore
    };
}
// DIE DRUCKWELLE AN IHRER EINHEIT (same.physik.reaktion#2). Die Welle arbeitet nur, wenn eine Ladung umsetzt, und dann je
// EREIGNIS — nie je Bild, nie je Zelle des Brands: die Linse misst jedes Ereignis einzeln (der Stand der Rolle `druck` vor und
// nach ihm, `S.stand`) und urteilt es an seinem eigenen Soll:
//   UMSATZ  — die Ladung verlässt die Welt (ihr Abschied, ohne ihre Welle): ≤ DRUCK_UMSATZ;
//   WELLE   — der EINE Schreiber `_druckWelle`: ≤ DRUCK_WELLE + DRUCK_BLICK je Bau im Radius (`blick`: jeder Eintrag des
//             Platz-Netzes, der weder Natur noch freier Körper ist — ein Blick auf seinen Bauplan und sein Fahr-Profil, am
//             Eintrag gemerkt; die Natur kostet nichts, je getroffenem Körper EINE Frist);
//   STOSS   — die Frist eines gestoßenen Körpers (frei, Tier, Spieler, Wagen) und des Ohrs: ≤ DRUCK_STOSS;
//   WERK    — die Frist eines Werks: ≤ DRUCK_LAST je Teil (die Last seiner Platte), bricht es, dazu DRUCK_BRUCH (der EINE
//             Einsturz: sein Abschied, der Rest erbt den Grund) + DRUCK_SCHERBE je Scherbe (ihre Geburt, ihr Stoß);
//   ENDE    — der EINE Satz der Welle im Journal: ≤ DRUCK_ENDE;
//   STAUB   — der Staub, den die Welle aus der Asche hebt (`_druckStaub`, unter dem Schreiber gerufen, mit eigenem Maß):
//             ≤ DRUCK_STAUB + DRUCK_STAUB_ZELLE je Zelle des Lands, die er nach einer Narbe fragt (`zellen`: das Quadrat um
//             den Radius, in dem der Überdruck die Asche löst, samt Saum) + DRUCK_STAUB_BALLEN je gesätem Ballen.
// Was der Takt außerhalb seiner Ereignisse tut, ist Null (`rest`). Die Zahlen sind Ratschen EINER Messung an der Mess-Wiese
// (GTX 1050, Null-Renderer, die Welt frisch: ein Donnerfass mit 60,6 MJ, sechs Probe-Fenster in 8–48 m — das in 12 m mit zwei
// Scheiben —, eine Kiste in 6 m, der Spieler in 16 m; 71 Bauten des Dorfs im Radius), gemessen je Ereignis: Umsatz 37 ·
// Schreiber 2 245 (kalt: je Bau 31 für sein Fahr-Profil; die zweite Welle derselben Welt 231) · Stoß 2–12 · stehendes Werk 6 ·
// Bruch 1 041–1 095 mit vier Scherben, 1 780 mit acht · Ende 3. Seit dem Bruch-Gesetz der Platte (druckwelle-bild) fallen die
// Scheiben der Probe feiner — dieselben Ratschen halten: Bruch 1 597 mit sechs Scherben (Soll 1 758), 3 183–3 328 mit
// sechzehn (4 058), 6 091 mit zweiunddreißig (7 742).
// DER STAUB (druckwelle-bild (b)): ohne Narbe im Radius 172 (81 Zellen, je Zelle EIN Blick in die Brand-Karte, kein Ballen);
// über einer Narbe von 2 119 m² 4 058 mit 384 Ballen — je Ballen 10,1: der EINE Leser des gezeichneten Bodens
// (`_bodenSichtAt`, Lehre 22: vier Flächen, die Stufen-Mischung). Der Täter, an dem die Ratsche ROT fiel: die Höhe je Ballen
// aus dem Säulen-Marsch des Gesetzes (`_voxelSurfaceY`) — 16 902, je Ballen 44.
// DAS ERBE DES GRUNDS trägt sein eigenes Maß (`raeumt`: die Rufe der Natur-Räumung `_naturRaeumen` unter der Marke, je
// Ereignis): die Welle räumt keine Natur — der Rest eines Einsturzes erbt den Grund seines Werks (`grundErbe`), der freie
// Körper trägt keinen Grundriss. In Einheiten hebt die Räumung einen Bruch nur um 7 % (1 041 → 1 109), in Zeit um 43 % (GTX
// 1050, 52 brechende Werke: 7,1–7,8 → 4,06 ms je Werk) — ihre Arbeit sind Schleifen über Kacheln, die kein Ruf zählt. Die
// Mutante der Klasse (der Rest räumt den Grund seines Werks ein zweites Mal, `_grundrissRaeumen` ohne `gehalten`) fährt in
// JEDEM Lauf: sieht die Linse ihre Räumung nicht, ist sie BLIND. `DRUCK_VERZUG_S`: so weit darf die letzte Frist hinter ihrer
// Ankunft fallen — die Grenze, die der Takt BAUT: `DRUCK.verzugS` 0,25 s (über sein Bild-Budget hinaus fällt je Bild der
// Anteil, den die älteste Frist schon wartete, nach verzugS alles Fällige) plus EIN Takt am Deckel der Welt-Uhr
// (`TAKT_DECKEL_S` 0,1 s: so spät kann das Bild kommen, das die Grenze sieht). Das Budget allein hielt den letzten von 52
// Brüchen 2,6 s, die Grenze 0,27 s; gemessen an der Probe 0,032 s. `DRUCK_SCHLAF_S`: so lange darf die letzte Scherbe wach
// liegen (gemessen 1,5 s mit 20 Scherben, 2,2 s mit den 70 des Bruch-Gesetzes).
const DRUCK_UMSATZ = 50;
const DRUCK_WELLE = 80;
const DRUCK_BLICK = 40;
const DRUCK_STOSS = 16;
const DRUCK_LAST = 4;
const DRUCK_BRUCH = 370;
const DRUCK_SCHERBE = 230;
const DRUCK_ENDE = 5;
const [DRUCK_STAUB, DRUCK_STAUB_ZELLE, DRUCK_STAUB_BALLEN] = [40, 3, 11];
// DER STAUB AM GESETZ (druckwelle-bild (b)): `DRUCK_STAUB_MASSE` — so weit darf die gesäte Masse von der Summe des Gesetzes
// über der Narbe liegen (das Raster des Wirts 2 m gegen das feine ½ m der Probe: der Rand des Radius und der Saum der Narbe
// fallen zwischen die Punkte); `DRUCK_STAUB_BILD` — so weit darf der Staub, den der gezeichnete Satz trägt, neben dem
// Stand seiner Ballen liegen (Anteil der gesäten Masse: Float32 im Puffer), und so viel der gesäten Masse muss das Bild
// zu seinem Höchststand tragen (`DRUCK_STAUB_HOCH`: bis der fernste Ballen geboren ist, sank der nächste ein Stück).
const [DRUCK_STAUB_MASSE, DRUCK_STAUB_BILD, DRUCK_STAUB_HOCH] = [0.05, 0.002, 0.85];
const DRUCK_VERZUG_S = 0.35;
const [DRUCK_BILD_GRAD, DRUCK_BILD_MM] = [0.1, 1]; // das Bild der Scherbe gegen die Lage ihres Körpers
const DRUCK_SCHLAF_S = 3;
// DER BEWEIS VON DRUCK-SCHLAF (nur im ROT, nur Ausgabe — das Urteil liest ihn nie): die Uhren an der Probe (Welt-Uhr, Sim-Uhr, die
// Takte seit dem Boot, die Sprünge der Welt-Uhr und die Sim-Zeit, die der feste Schritt am Deckel verwarf), der Wind am Ort und je
// Körper, der beim Soll noch wach lag, Ort, Tempo, Auflage (die Neigung und Reibung seines Grunds) und Alter in seinem letzten
// wachen Takt; vorn der Ort der Probe O, die Neigung des Gesetzes dort und die Reste früherer Marken (freie Körper binnen 30 m)
function druckSchlafBeweis(B) {
    if (!B) return " — ohne Beweis (die Probe trug keinen)";
    const z = (v, n = 1) => (v == null ? "?" : (+v).toFixed(n));
    const O = B.ort || {};
    const je = (B.wach || []).map(
        (s) =>
            `${s.art} [${s.p.join(", ")}] ${z(s.tempo, 3)} m/s auf ${s.auf}${s.grund ? ` (Grund ${z(s.grund.grad, 1)}°, μ ${z(s.grund.mu, 2)})` : ""}, ` +
            `${z(s.alterS, 2)} s alt, ${z(s.ruheS, 2)} s ruhig, ${s.schlafS == null ? "wach" : `schlief nach ${z(s.schlafS, 2)} s`}`
    );
    return (
        ` — Beweis: Ort O (${z(O.x, 2)}, ${z(O.z, 2)}) Grund ${z(O.y, 2)} m, Neigung ${z(O.grad, 1)}°, ${O.fremd ?? "?"} fremde freie Körper ≤ 30 m (${O.fremdWach ?? "?"} wach) · ` +
        `Welt-Uhr ${z(B.welt, 2)} s · Sim-Uhr ${z(B.sim, 2)} s · ${B.takte} Takte seit dem Boot · ${B.sprungN} Sprünge der Welt-Uhr (${z(B.sprungS, 2)} s) · ` +
        `verworfene Sim-Zeit ${z(B.verworfenS, 3)} s · Wind am Ort ${z(B.windMS, 2)} m/s · ${B.amSoll} wach beim Soll: ${je.join("; ") || "keiner"}`
    );
}
const druckSoll = (e) =>
    e.art === "umsatz"
        ? DRUCK_UMSATZ
        : e.art === "welle"
          ? DRUCK_WELLE + DRUCK_BLICK * (e.blick | 0)
          : e.art === "ende"
            ? DRUCK_ENDE
            : e.art === "staub"
              ? DRUCK_STAUB + DRUCK_STAUB_ZELLE * (e.zellen | 0) + DRUCK_STAUB_BALLEN * (e.ballen | 0)
              : e.art === "werk"
              ? DRUCK_LAST * (e.teile | 0) + (e.scherben > 0 ? DRUCK_BRUCH + DRUCK_SCHERBE * e.scherben : 0)
              : DRUCK_STOSS;
const druckKlasse = (e) => (e.art === "werk" ? (e.scherben > 0 ? "bruch" : "steht") : ["umsatz", "welle", "ende", "staub"].includes(e.art) ? e.art : "stoss");
const druckNenne = (e) =>
    ({ umsatz: "der Umsatz der Ladung", welle: "der Schreiber der Welle", ende: "das Ende der Welle", staub: "der Staub der Welle", bruch: "die Frist eines brechenden Werks", steht: "die Frist eines stehenden Werks", stoss: `die Frist eines Gestoßenen (${e.art})` })[druckKlasse(e)] +
    (Number.isFinite(e.R) ? ` in ${e.R} m` : "");
const druckSollText = (e) =>
    ({
        umsatz: `${DRUCK_UMSATZ}`,
        welle: `${DRUCK_WELLE} + ${DRUCK_BLICK} je Bau im Radius (${e.blick | 0})`,
        ende: `${DRUCK_ENDE}`,
        staub: `${DRUCK_STAUB} + ${DRUCK_STAUB_ZELLE} je Zelle im Radius (${e.zellen | 0}) + ${DRUCK_STAUB_BALLEN} je Ballen (${e.ballen | 0})`,
        bruch: `${DRUCK_LAST} je Teil (${e.teile | 0}) + ${DRUCK_BRUCH} + ${DRUCK_SCHERBE} je Scherbe (${e.scherben | 0})`,
        steht: `${DRUCK_LAST} je Teil (${e.teile | 0})`,
        stoss: `${DRUCK_STOSS}`,
    })[druckKlasse(e)];
// DIE SPANNE AM SOLL (die Zeile der Sim): je Klasse das Ereignis, das seinem Soll am nächsten kommt — sein Anteil, seine Leser
function druckAmSoll(D) {
    const aus = {};
    for (const e of (D && D.ereignisse) || []) {
        const [k, soll] = [druckKlasse(e), druckSoll(e)];
        const anteil = soll > 0 ? e.einheiten / soll : e.einheiten > 0 ? Infinity : 0;
        if (!aus[k] || anteil > aus[k].anteil) aus[k] = { anteil: Number.isFinite(anteil) ? +anteil.toFixed(3) : anteil, einheiten: e.einheiten, soll, leser: brandLeser(e.leser) };
    }
    return aus;
}
// DER STAUB DER WELLE (druckwelle-bild (b)): wo der Überdruck der Welle den Boden-Stoff löst und ihr Wind sein Korn trägt,
// hebt es sich — nach dem Gesetz (schmiede `staubLast`) die Asche der Brand-Narbe, nie die Grasnarbe (Faser), nie die Krume
// (ihr Korn rollt). Die Probe stellt eine Narbe (östlich des Fasses verbrannt, westlich nie) unter eine zweite Welle durch
// den EINEN Schreiber (`_druckWelle` → `_druckStaub`) und rechnet ihr Soll aus dem Gesetz auf dem feinen Raster:
//   MASSE — die gesäte Masse = die Summe des Gesetzes über der Narbe (± DRUCK_STAUB_MASSE), auch über dem Deckel der Ballen
//           (die Ferne fällt in gröbere Flecken zusammen, nie weg);
//   RAND  — kein Ballen, wo nichts brannte, keiner jenseits des Radius, in dem der Überdruck die Asche löst;
//   BILD  — der gezeichnete Satz trägt je Bild den Staub seiner Ballen (sein Puffer gegen ihren Stand), zum Höchststand
//           die gesäte Masse; nach der letzten Geburt wächst der Staub in der Luft nie (er erfindet keinen);
//   ENDE  — der Staub liegt wieder, wenn das Sink-Tempo seines Korns seine Wolke geleert hat; danach ruht das Bild.
// Die Mutante jedes Laufs: die Narbe gilt überall als Asche (Staub, wo die Welle hinkommt) — sieht die Linse keinen Ballen
// westlich der Narbe, ist sie BLIND.
function druckStaubUrteil(D, v) {
    const X = D.staub;
    if (!X || !(X.sollG > 0) || !(X.narbeM2 > 0)) return void v.push("LEER: die Probe maß den Staub der Welle nicht (eine zweite Welle über einer gestellten Narbe: kein Soll aus dem Gesetz)");
    const soll = `das Gesetz hebt ${X.sollG} g aus ${X.narbeM2} m² Asche im Radius ${X.randM} m (schmiede \`staubLast\`, Korn ${X.kornMm} mm)`;
    if (!(X.ballen > 0) || !(X.masseG > 0)) return void v.push(`DRUCK-STAUB: die Welle hob keinen Staub aus der Narbe — ${soll}; der Leser \`_druckStaub\` säte ${X.ballen} Ballen`);
    if (!(Math.abs(X.masseG / X.sollG - 1) <= DRUCK_STAUB_MASSE))
        v.push(`DRUCK-STAUB-MASSE: die Welle säte ${X.masseG} g Staub in ${X.ballen} Ballen (${X.grob} davon gröbere Flecken) — ${soll}, ±${DRUCK_STAUB_MASSE * 100} %`);
    if (!(X.aussen === 0) || !(X.jenseits === 0))
        v.push(`DRUCK-STAUB-RAND: ${X.aussen} Ballen stehen, wo nichts brannte (mehr als 4 m westlich der Narbe), ${X.jenseits} jenseits des Radius ${X.randM} m, in dem der Überdruck die Asche löst — Staub gibt nur die Narbe des Brands (\`_brandNarbeFn\`), nur wo Δp ≥ σ_B der Zeile asche`);
    if (!(X.ballen <= X.max)) v.push(`DRUCK-STAUB-DECKEL: die Welle säte ${X.ballen} Ballen (Deckel ${X.max}, \`DRUCK.staub.max\`) — über dem Deckel fällt die Ferne in gröbere Flecken zusammen`);
    if (X.bilder == null || !(X.bilder > 0)) v.push("LEER: die Probe maß das Bild des Staubs nicht (kein Bild im Takt der Welt nach der Saat)");
    else {
        if (!(X.satzMax > 0) || !(X.ohneSatz === 0))
            v.push(`DRUCK-STAUB-BILD: der Satz des Staubs trägt seine Ballen nicht — in ${X.ohneSatz} von ${X.bilder} Bildern zeichnet er eine andere Zahl als die, die stehen (höchstens ${X.satzMax} im Satz, ${X.ballenMax} Ballen; \`_druckBild\` → \`_rauchZeichnen\`, der Satz \`druckStaubSatz\`)`);
        else if (X.nebenG == null || !(X.nebenG <= DRUCK_STAUB_BILD * X.masseG) || !(X.satzMaxG >= DRUCK_STAUB_HOCH * X.masseG) || !(X.satzMaxG <= X.masseG * (1 + DRUCK_STAUB_BILD)))
            v.push(`DRUCK-STAUB-BILD: der gezeichnete Satz trägt zum Höchststand ${X.satzMaxG} g Staub (gesät ${X.masseG} g, Soll ${DRUCK_STAUB_HOCH * 100}–100 %) und liegt bis ${X.nebenG} g neben dem Stand seiner Ballen (Soll ≤ ${DRUCK_STAUB_BILD * 100} % der Saat) — die Deckung des Ballens ist seine Masse (τ = km · Masse · (profil + 1) ÷ π r², \`_druckBild\`)`);
        if (!(X.steigt === 0)) v.push(`DRUCK-STAUB-BILD: nach der letzten Geburt wuchs der Staub in der Luft in ${X.steigt} Bildern — das Bild erfindet keinen Staub (er sinkt mit dem Sink-Tempo seines Korns)`);
        if (X.endeS == null || !(X.endeS <= X.lebenS + 1)) v.push(`DRUCK-STAUB-ENDE: der Staub ${X.endeS == null ? "steht noch" : `stand ${X.endeS} s`} — das Sink-Tempo seines Korns leert die höchste Wolke in ${X.lebenS} s (2 · Wolke ÷ Sink-Tempo)`);
        else if (!X.danach || X.danach.satz !== 0 || X.danach.uhr !== null) v.push(`DRUCK-STAUB-RUHE: nach dem letzten Ballen ruht das Bild des Staubs nicht — im Satz ${X.danach ? X.danach.satz : "?"} Ballen, seine Uhr ${X.danach ? X.danach.uhr : "?"} (Ruhe ist Null: \`_druckBild\` ohne Saat und ohne Ballen)`);
    }
    if (D.mutante) {
        const M = D.mutante.staub;
        if (!M || !(M.aussen > 0)) v.push(`BLIND: die Mutante des Staubs (die Narbe gilt überall als Asche) blieb ungesehen — ${M ? `Ballen westlich der gestellten Narbe ${M.aussen}, gesät ${M.masseG} g gegen ${M.sollG} g des Gesetzes` : "kein Maß"}`);
    }
}
// Das Urteil der Druckwelle (ein Teil von `simUrteil`): `D` = simWecken.druck
function druckUrteil(D, v) {
    if (!D || !D.start) return void v.push("LEER: an der Mess-Wiese fing der Funke neben der Ladung nicht — keine Druckwelle gemessen");
    if (!(D.frist > 0)) return void v.push("LEER: die Front des Funkens gab der Ladung keine Frist (`_ladungZuenden`: dieselbe Zelle, ein Bett)");
    const E = D.ereignisse || [];
    const welle = E.find((e) => e.art === "welle");
    if (!welle) return void v.push("LEER: die Frist der Ladung fiel, keine Welle (`_ladungUmsatz` → `_druckWelle`)");
    if (!(D.einheiten > 0)) v.push(`STUMPF: die Ladung setzte um, die Sim-Linse sieht keinen Takt der Welle (die Marke \`druck\` unter ${SIMS.druck[0].join(" · ")})`);
    // je Ereignis an seinem Soll — der erste Täter jeder Klasse beim Namen
    const gesehen = new Set();
    for (const e of E) {
        const k = druckKlasse(e);
        if (gesehen.has(k) || !(e.einheiten > druckSoll(e))) continue;
        gesehen.add(k);
        v.push(`DRUCK-SOLL: ${druckNenne(e)} kostete ${e.einheiten} Einheiten (Soll ≤ ${druckSoll(e)}: ${druckSollText(e)}) — seine Leser: ${brandLeser(e.leser, 8)}`);
    }
    if (D.rest > 0) v.push(`DRUCK-TAKT: der Takt der Welle arbeitete ${D.rest} Einheiten außerhalb jedes Ereignisses (Umsatz, Welle, Frist, Ende)`);
    if (!E.some((e) => e.art === "staub")) v.push("LEER: die Welle der Probe rief ihren Staub nicht (`_druckWelle` → `_druckStaub`) — kein Ereignis, dessen Kosten die Linse misst");
    druckStaubUrteil(D, v);
    // das Erbe des Grunds: die Welle räumt keine Natur — der erste Täter beim Namen, die Mutante jedes Laufs hält das Maß wach
    const [raeumt, erster] = [E.reduce((s, e) => s + (e.raeumt | 0), 0), E.find((e) => e.raeumt > 0)];
    if (erster) v.push(`DRUCK-ERBE: ${druckNenne(erster)} räumte die Natur seines Grunds (\`_naturRaeumen\` ${raeumt}× in der Welle) — der Rest eines Einsturzes erbt den Grund seines Werks (\`grundErbe\`), ein freier Körper trägt keinen Grundriss`);
    if (!D.mutante || !(D.mutante.raeumt > 0)) v.push(`BLIND: die Mutante der Welle (der Rest räumt den Grund seines Werks ein zweites Mal) blieb ungesehen — \`_naturRaeumen\` unter der Marke \`druck\`: ${D.mutante ? D.mutante.raeumt : "kein Lauf"}`);
    // das Gesetz am Bild der Welt: die Scheibe bricht diesseits der Grenze des Gesetzes und steht jenseits
    const S = D.scheiben || [];
    if (!(D.grenze > 0) || !S.some((s) => s.R < D.grenze) || !S.some((s) => s.R > D.grenze))
        v.push(`LEER: die Probe trägt keine Scheibe diesseits UND jenseits der Bruch-Grenze des Gesetzes (${D.grenze} m; Scheiben in ${S.map((s) => s.R).join(" · ")} m)`);
    else
        for (const s of S)
            if (s.gebrochen !== s.R < D.grenze)
                v.push(`DRUCK-BRUCH: die Scheibe in ${s.R} m ${s.gebrochen ? "brach" : "steht"} — die Grenze des Gesetzes (σ der Platte = σ_B ihrer Stoff-Zeile) liegt bei ${D.grenze} m`);
    // DAS BILD DES BRUCHS (druckwelle-bild): je gebrochenem Fenster die Scherben seines Bruch-Gesetzes am Ort (schmiede
    // `plattenBruch`: der Riss ist die Energie) — ihre Zahl in der Welt, dann ihre kleinste und größte Kante (±1 mm: die
    // Schnitte liegen, wo die Energie liegt). Bis druckwelle-bild fiel jede Scheibe in vier gleiche Stücke: eine Probe, in der
    // keine feiner als ihr Kreuz bricht, sähe diesen Stand nicht — sie ist LEER.
    const G = S.filter((s) => s.gebrochen && (s.soll > 0 || s.R < D.grenze)); // die jenseits der Grenze brach, nennt DRUCK-BRUCH
    for (const s of G) {
        if (!(s.soll > 0) || s.scherben !== s.soll)
            v.push(`DRUCK-BRUCH-BILD: das Fenster in ${s.R} m (last ${s.last}) fiel in ${s.scherben} Scherben — sein Bruch-Gesetz verlangt ${s.soll} (schmiede \`plattenBruch\`: der Riss ist die Energie; der Leser \`_druckWerk\`)`);
        else if (!s.kante || !s.kanteSoll || !s.kante.every((x, k) => Math.abs(x - s.kanteSoll[k]) <= 0.001))
            v.push(`DRUCK-BRUCH-BILD: die ${s.scherben} Scherben des Fensters in ${s.R} m tragen Kanten von ${s.kante ? s.kante.join(" bis ") : "?"} m — die Schnitte seines Gesetzes liegen, wo die Energie liegt: ${s.kanteSoll ? s.kanteSoll.join(" bis ") : "?"} m (die Mitte fein, der Rand grob)`);
    }
    if (G.length && !G.some((s) => s.soll > s.kreuz)) v.push(`LEER: keine Scheibe der Probe bricht feiner als ihr Kreuz (Scherben je Fenster nach dem Gesetz: ${G.map((s) => s.soll).join(" · ")})`);
    // DIE LAGE IM BILD (druckwelle-bild): das Bild eines freien Körpers steht, wo und wie der Löser ihn hält — bei der Geburt
    // jeder Scherbe (vor dem ersten Schritt des Lösers), nach dem Neubau ihres Bilds im Schlaf (der Cull-Takt: der Spieler geht
    // und kommt wieder) und bei der Geburt einer Kiste, wie der Stand sie legt (die zweite Art der Group: gedreht, schlafend —
    // kein Schritt zeigt sie je). Bis druckwelle-bild setzte der Bau des Bilds (`_rebuildArchitectureMesh`, der Zweig der
    // Bau-Teile) Ort, Gier und Maß von Hand, ohne die Pose des Gesetzes: GTX 1050, echtes Spiel, 4 von 4 Scherben ein Bild lang
    // 60° neben ihrem Körper; in der Linse 70 von 70 bei der Geburt (bis 92°), 16 von 16 nach dem Neubau (bis 172°).
    if (D.scherben > 0)
        for (const [k, wann] of [["geburt", "bei der Geburt einer Scherbe"], ["neubau", "nach dem Neubau des Bilds einer schlafenden Scherbe (der Cull-Takt: gehen und wiederkommen)"], ["stand", "bei der Geburt einer Kiste, wie der Stand sie legt (gedreht, schlafend)"]]) { // prettier-ignore
            const L = (D.bildLage || {})[k];
            if (!L || !(L.n > 0)) v.push(`LEER: die Probe maß die Lage im Bild nicht (${wann}: kein Bild) — der Körper trägt kein Mesh, dessen Lage die Linse liest`);
            else if (L.grad == null || L.mm == null || !(L.grad <= DRUCK_BILD_GRAD) || !(L.mm <= DRUCK_BILD_MM)) // (Lehre 17: `null <= x` ist wahr)
                v.push(`DRUCK-BILD-LAGE: ${wann} steht das Bild ${L.grad}° und ${L.mm} mm neben der Lage, die der Löser hält (${L.schief} von ${L.n} Bildern mehr als 1° daneben; Soll ≤ ${DRUCK_BILD_GRAD}° und ${DRUCK_BILD_MM} mm) — der Bau des Bilds zeigt die Pose des Gesetzes nicht (\`_rebuildArchitectureMesh\`, der Zweig der Bau-Teile → \`_werkPoseZeigen\`)`);
        }
    // die Mutante jedes Laufs hält das Maß wach: der Bau des Bilds ohne die Pose des Gesetzes steht in allen drei Augenblicken schief
    if (D.scherben > 0 && D.mutante) {
        const MB = D.mutante.bild;
        const schief = (k) => (MB && Array.isArray(MB[k]) ? MB[k][0] : null);
        if (!MB || !["geburt", "neubau", "stand"].every((k) => schief(k) > 0))
            v.push(`BLIND: die Mutante des Bilds (der Bau des Bilds zeigt die Pose des Gesetzes nicht) blieb ungesehen — ${MB ? `schiefe Bilder bei der Geburt der Scherbe ${schief("geburt")}, nach dem Neubau ${schief("neubau")}, an der Kiste des Stands ${schief("stand")}` : "kein Maß"}`);
    }
    // der Zähler der Welle gegen die Welt: an ihm rechnet ihr Vorrat (`welle.fein`)
    if (D.scherben > 0 && D.zaehler !== D.scherben) v.push(`DRUCK-ZAHL: die Welle zählte ${D.zaehler} Scherben, in der Welt liegen ${D.scherben} — ihr Vorrat (\`DRUCK.scherbenFein\`) rechnet an der Welt vorbei`);
    // der Vorrat am echten Rumpf: das Kreuz trägt jede Platte, darüber höchstens den Rest des Vorrats
    const V = D.vorrat;
    if (!V || !Array.isArray(V.scherben) || V.scherben.length < 2 || !(V.rest > 0)) v.push("LEER: die Probe maß den Vorrat der Welle nicht (zwei stehende Fenster unter einer Welle von Hand, ihr Vorrat fast verbraucht)");
    else if (!(V.scherben[0] > 4 && V.scherben[0] <= 4 + V.rest) || V.scherben[1] !== 4)
        v.push(`DRUCK-VORRAT: unter einer Welle, deren Vorrat bis auf ${V.rest} verbraucht ist, fielen zwei Scheiben in ${V.scherben[0]} und ${V.scherben[1]} Scherben — die erste trägt ihr Kreuz und höchstens den Rest (5 bis ${4 + V.rest}), die zweite ihr Kreuz (4) (\`DRUCK.scherbenFein\`, \`_druckWerk\`)`);
    const K = D.kiste;
    if (!K || !(K.soll > 0)) v.push("LEER: die Probe trägt keine freie Kiste im Radius der Welle");
    else if (!(Math.abs(K.dv / K.soll - 1) <= 0.05))
        v.push(`DRUCK-STOSS: die Kiste in ${K.R} m trägt ${K.dv} m/s (das Gesetz: Impuls × Schattenfläche ÷ Masse = ${K.soll} m/s, ±5 %)`);
    else if (!(K.wegM > 0.01)) v.push(`DRUCK-STOSS: die Kiste in ${K.R} m trägt ${K.dv} m/s und liegt danach ${K.wegM} m weiter — der Löser nahm den Stoß nicht`);
    if (!D.spieler || !(D.spieler.dv > 0)) v.push(`DRUCK-LEIB: der Spieler in ${D.spieler ? D.spieler.R : "?"} m trägt keinen Stoß der Welle (\`_druckStoss\` → \`_stossAuf\`)`);
    if (!D.ohr || !(D.ohr.dp > 0) || !(D.ohr.dauer > 0)) v.push("DRUCK-OHR: das Ohr hörte die Welle nicht (`_substanzKlang` „knall“ mit Überdruck und Dauer am Ort des Hörers)");
    // (Lehre 17: `null <= x` ist wahr — ein fehlender Wert ist ROT, nie still grün)
    if (D.verzug == null || !(D.verzug <= DRUCK_VERZUG_S)) v.push(`DRUCK-VERZUG: die letzte Frist fiel ${D.verzug} s nach ihrer Ankunft (Soll ≤ ${DRUCK_VERZUG_S} s) — der Takt hält die Grenze seines Rückstands nicht (\`_tickDruck\`, \`DRUCK.verzugS\`)`);
    // DAS BUDGET DES TAKTS IN BRÜCHEN (scherbe-liegt): je Bild höchstens `DRUCK.bruecheJeBild` Werke über dem Soll des Rückstands —
    // an der Uhr des Läufers (`brueche`) und unter stehender Uhr (`uhr`: drei Böcke im Kreis, eine Welle von Hand): bis scherbe-liegt
    // fielen Fristen, bis `performance.now()` 4 ms über dem Anfang des Takts stand, das Bild eines Bruchs hing am Läufer (DRUCK-SCHLAF
    // an ort-ausstattung 4 rot in 2 von 3 Versuchen an gleichen Bytes)
    const [BR, BU] = [D.brueche, D.uhr];
    if (!BR || !BU) v.push("LEER: die Probe maß das Budget des Takts nicht (je Takt der Welle die fälligen und die gefallenen Werke)");
    else {
        if (!(BR.ueber <= 0)) v.push(`DRUCK-BUDGET: ein Bild der Welle trug ${BR.ueber} Brüche über dem Gesetz (\`DRUCK.bruecheJeBild\` und das Soll des Rückstands, \`_tickDruck\`)`);
        if (!(BU.zugleich >= 2)) v.push(`BLIND: unter stehender Uhr sah kein Takt zwei fällige Werke (${BU.zugleich}) — die drei Böcke der Welle von Hand standen nicht zugleich an`);
        else if (!(BU.ueber <= 0)) v.push(`DRUCK-WANDUHR: unter stehender Uhr trug ein Bild ${BU.ueber} Brüche über dem Gesetz — das Budget des Takts liest die Wanduhr, das Bild eines Bruchs hängt am Läufer (\`_tickDruck\`)`);
    }
    if (!(D.scherben > 0)) v.push("LEER: die Welle der Probe brach keine Scheibe — keine Scherbe, deren Schlaf die Linse misst");
    else if (D.schlafS == null || !(D.schlafS <= DRUCK_SCHLAF_S)) v.push(`DRUCK-SCHLAF: die letzte der ${D.scherben} Scherben schlief ${D.schlafS == null ? `nie (${D.wach} liegen nach 10 s wach)` : `nach ${D.schlafS} s`} (Soll ≤ ${DRUCK_SCHLAF_S} s)${druckSchlafBeweis(D.schlafBeweis)}`);
    // DER HAUFEN (der Löser der Ruhe): je Saat sechs Quarz-Platten auf dem Ort der Probe, gestreut, der Löser im festen Schritt
    // ohne Wind — jeder Haufen schläft im Soll von DRUCK-SCHLAF. Je Mutante (warm: der Warmstart erbt über die Fläche, bias: der
    // Bias-Gang löst die Reibung mit) sucht ihre Saat, die das Soll reißt; der echte Löser geht dieselben Saaten. Bis zum Schnitt
    // schliefen 296 von 300 Haufen binnen 3 s, 4 nie (Saat 20, 84, 148, 264: eine Platte kippte alle 13–16 Schritte).
    const H = D.haufen;
    if (!H || !H.echt || !(H.saaten > 0)) v.push("LEER: die Probe legte keinen Haufen (sechs Platten je Saat am Ort der Probe) — der Schlaf des Lösers ungemessen");
    else {
        if (!(H.echt.nie === 0) || H.echt.schlafS == null || !(H.echt.schlafS <= DRUCK_SCHLAF_S))
            v.push(`HAUFEN-SCHLAF: von ${H.saaten} Haufen aus sechs Platten schliefen ${H.echt.nie} nie, der späteste nach ${H.echt.schlafS ?? "?"} s (Saat ${H.echt.saat}, Soll ≤ ${DRUCK_SCHLAF_S} s) — der Löser lässt eine Platte kippen: der Warmstart erbt über die Fläche (\`_freiKontaktBereit\`) oder der Bias-Gang löst die Reibung mit (\`_freiGang\`)`);
        for (const [k, was] of [["warm", "der Warmstart über die Fläche"], ["bias", "die Reibung im Bias-Gang"]]) {
            const M = H.mutanten && H.mutanten[k];
            if (!M || M.saat == null) v.push(`BLIND: die Mutante ${k} (${was}) ${M ? `schlief in allen ${M.n} Saaten binnen ${DRUCK_SCHLAF_S} s` : "lief nicht (der Löser trägt ihren Anker nicht mehr)"} — der Haufen trifft sie nicht`);
        }
    }
    const ruhe = D.nachher && D.nachher.sims.druck ? D.nachher.sims.druck.summe : NaN;
    if (!(ruhe === 0)) v.push(`DRUCK-RUHE: nach der Welle arbeitet ihr Takt — ${ruhe} Einheiten`);
}
function simUrteil(b, v) {
    const R = b.simRuhe;
    if (!R || !R.frames) v.push("LEER: keine Sim-Ruhe gemessen");
    else {
        if (!(R.spielS >= 59)) v.push(`LEER: die Sim-Ruhe ging ${R.spielS} s Spielzeit (Soll 60 s)`);
        if (!R.vorher || !R.vorher.ernte || !(R.vorher.leben > 0)) v.push("LEER: vor der Sim-Ruhe fehlt die Tat (Ernte, Leben)");
        v.push(...simRuheZeilen(R, "nach einer Tat"));
    }
    const W = b.simWecken || {};
    for (const [n, wer] of [
        ["saison", "ein Saison-Wort"],
        ["regen", "das Wort Regen"],
        ["wuchs", "ein Schritt des Laub-Radius"],
        ["nachwuchs", "die fällige Ernte"],
    ]) {
        const w = W[n];
        if (!w || !w.wach || !w.nachher || w.offen === 0) v.push(`LEER: keine Weck-Probe für ${n}`);
        else {
            if (!(w.wach.sims[n].summe > 0)) v.push(`STUMPF: ${wer} weckt ${n} (${SIMS[n][0].join(" · ")}) nicht`);
            const t = w.nachher.sims[n];
            if (t.summe > 0) v.push(`WECKEN-SIM: nach dem Ereignis schläft ${n} nicht wieder — ${t.summe} Einheiten (${simJe(t)})`);
        }
    }
    if (W.nachwuchs && !W.nachwuchs.nachgewachsen) v.push("NACHWUCHS: die Ernte wuchs zu ihrer Zeit nicht nach");
    // (feld.K3#2) das Feld: vier Wellen Taten, die vorige tot — danach keine Tote in der Karte, die Räumung ging nie über eine
    // ganze Karte (`·lifeField` …) noch über ihr Todes-Rad (`·lifeField.tod` …: sie nimmt die fälligen Eimer aus ihrer Halde) und
    // kostete höchstens zwei Einheiten je geschriebener Zelle
    const F = W.feld;
    if (!F || !F.wellen || F.wellen.length < 4 || !(F.geschrieben > 0)) v.push("LEER: die Feld-Probe schrieb keine vier Wellen");
    else {
        const arbeit = F.welle.sims.feld.summe + F.welle.akt;
        if (!(arbeit > 0)) v.push("STUMPF: die Taten im Feld zeigen der Sim-Linse keine Räumung");
        if (F.wellen.some((w) => w.tote > 0))
            v.push(`FELD-TOTE: nach den Wellen trägt die Karte ${F.wellen.map((w) => w.tote + " von " + w.groesse).join(" · ")} tote Zellen — sie räumt nach einer Schwelle, nicht am Tod`);
        const karte = Object.entries(F.welle.aktAlle || {}).filter(([m]) => /^·[A-Za-z]+(.tod)?$/.test(m));
        if (karte.length || arbeit > 2 * F.geschrieben)
            v.push(`FELD-BESUCH: die Wellen kosteten ${arbeit} Einheiten für ${F.geschrieben} geschriebene Zellen` +
                (karte.length ? `, die Räumung ging über die ganze Karte oder ihr Rad (${karte.map((x) => x.join(" ")).join(", ")})` : "") + " — sie besucht Unberührte");
        // (feld.K5) die Halde der Leben-Stufen trägt jede Zelle höchstens einmal: nach 100 Taten an einem Ort kein Platz über dem Stand
        if (F.ueber !== 0) v.push(`HALDE: ${F.ueber} Plätze über dem Stand der Leben-Stufen — eine Zelle steht mehrfach`);
    }
    // (stoffe.K2 · feld.K3#2) der Brand arbeitet nur in seinen Zellen — sein Gang ≤ BRAND_GANG je Zelle des Felds und Schritt, seine
    // Zündung am Soll dessen, was die Welt neu maß (`brandZuendSoll`) —, seine Front läuft mit dem Wind 0,5–2 m/s, gegen ihn
    // ≤ 0,2 m/s und ohne ihn nirgends ≥ 0,5 m/s (die Mutante), er erlischt im Regen, hinterlässt Asche, leuchtet, glüht und
    // schläft danach
    const Z = W.brand;
    if (!Z || !Z.start) v.push("LEER: an der Mess-Wiese fing kein Brand");
    else {
        const summe = (a) => (a || []).reduce((s, x) => s + x, 0);
        const an = summe(Z.ankuenfte);
        if (!(summe(Z.gang) > 0)) v.push("STUMPF: der Brand brennt, die Sim-Linse sieht keinen Takt");
        if (!(an > 0)) v.push("LEER: im Brand erreichte die Front keine Zelle — keine Zündung gemessen");
        else if (!(summe(Z.zuendung) > 0)) v.push(`STUMPF: die Front erreichte ${an} Zellen, die Sim-Linse sieht keine Zündung (die Marke \`zuendung\` unter ${SIMS.zuendung[0].join(" · ")})`);
        const i = Z.gang.findIndex((e, k) => e > brandGangSoll(Z, k));
        if (i >= 0) v.push(`BRAND-GANG: Schritt ${i + 1} kostete ${Z.gang[i]} Einheiten Gang bei ${Z.zellen[i]} Zellen des Felds (Soll ≤ ${BRAND_GANG} je Zelle) — seine Leser: ${brandLeser(Z.rufe && Z.rufe[i])}`);
        // DER FALL DER KACHELN an seinem Maß (linse-brand-schritte 4): je Bild höchstens EIN Neubau über ±½ Zelle (`_brandMalen` malt
        // EINE Zelle je Bild), je Kachel, die in seinem Rechteck steht, EIN Ruf des Fall-Lesers — nie je Zelle des Felds
        if (!Z.kachel) v.push("LEER: die Kachel-Probe des Brands lief nicht (der Fall der Wiese unter der Asche ungezählt)");
        else {
            const k = Z.kachel.findIndex((e, s) => e > brandKachelSoll(Z, s) || Z.ringe[s] > 1 || Z.ringM2[s] > BRAND_RING_M2);
            if (k >= 0)
                v.push(`KACHEL-FALL: Schritt ${k + 1} ließ ${Z.kachel[k]} Kacheln fallen — Soll ≤ ${brandKachelSoll(Z, k)} (je Kachel im Rechteck der Asche eine), ${Z.ringe[k]} ${Z.ringe[k] === 1 ? "Neubau" : "Neubauten"} von ${Z.ringM2[k]} m² (Soll ≤ 1 je Bild, ≤ ${BRAND_RING_M2} m² = ±½ Zelle) — seine Leser: ${brandLeser(Z.rufeK && Z.rufeK[k])}`);
        }
        const j = Z.zuendung.findIndex((e, k) => e > brandZuendSoll(Z, k));
        if (j >= 0)
            v.push(`BRAND-ZÜNDUNG: Schritt ${j + 1} kostete ${Z.zuendung[j]} Einheiten Zündung für ${Z.ankuenfte[j]} Ankünfte und ${Z.betten[j]} neu gemessene Betten (${Z.punkte[j]} Bett-Punkte, davon bis ${Z.kahl[j]} kahl, ${Z.masken[j]} Masken; ${(Z.lesungen || [])[j] | 0} Stoff-Lesungen) — ` +
                `Soll ≤ ${brandZuendSoll(Z, j)} (${BRAND_ANKUNFT} je Ankunft + ${BRAND_BETT} je neuem Bett + ${BRAND_PUNKT} je Punkt + ${BRAND_KAHL} je kahlem Punkt) — ihre Leser: ${brandLeser(Z.rufeZ && Z.rufeZ[j])}`);
        if (Z.brennt) v.push(`BRAND-ERLISCHT: im Regen brennen noch ${Z.brennt} Zellen`);
        if (!(Z.gegen <= 0.2)) v.push(`FRONT-GEGEN: gegen den Wind bis ${Z.gegen} m/s (Soll ≤ 0,2)`);
        if (!(Z.ohneWind < 0.5)) v.push(`BRAND-BLIND: ohne Wind läuft die Front bis ${Z.ohneWind} m/s`);
        // DIE WAHRHEIT DER FRONT (linse-brand-schritte 2): derselbe Herd auf dem GESETZTEN Bett im gesetzten Wind, sein Kopf längs
        // einer Achse, schräg und diagonal zum Gitter der Zellen. FRONT-MIT urteilt das Vorrücken des Kopfs (der Weg der vordersten
        // Zelle längs des Kopfs durch die Zeit, zu der die Front sie erreichte) — `mit`, `alle` am Herd des Spiels sind Lesewerte:
        // sein Bett trägt R 0,05–0,98 m/s je Zelle (Overlay, Fraß des Gaus, Narbe), und der Mäander dreht den Kopf. FRONT-TREUE:
        // das Vorrücken ist R des Gesetzes (`_brandTempo`) auf FRONT_TREUE in jedem Winkel — die Mutante des groben Gitters (vier
        // Nachbarn) fällt, sonst ist die Linse BLIND. FENSTER-BETT: jede Zelle verzehrte das gesetzte Bett (Stoff Gras, Last, Boden,
        // Gefälle des Herds; die Nässe 0), die drei Starts an derselben Uhr des Winds tragen dieselben Zahlen auf BETT_GLEICH, keine
        // Uhr ging rückwärts — und der Herd des Spiels (sein Bett ungesetzt) weicht ab, sonst ist sie BLIND
        const WA = Z.wahr || {};
        const WINKEL = ["achse", "schraeg", "diagonal"];
        const wz = (n, h) => `${n} (Kopf ${h.winkel}° zum Gitter): Vorrücken ${h.vor} m/s bei R ${h.R} m/s`;
        if (![...WINKEL, "wieder", "langsam", "grob"].every((n) => WA[n] && WA[n].bett)) v.push("LEER: die Herde auf dem gesetzten Bett (achse · schraeg · diagonal · wieder · langsam · grob) liefen nicht");
        else {
            for (const n of WINKEL) {
                const h = WA[n];
                if (!(h.vor >= 0.5 && h.vor <= 2)) v.push(`FRONT-MIT: ${wz(n, h)} (Soll 0,5–2)`);
                const q = h.R > 0 ? h.vor / h.R : 0;
                if (!(q >= FRONT_TREUE[0] && q <= FRONT_TREUE[1])) v.push(`FRONT-TREUE: ${wz(n, h)} — ${+q.toFixed(3)} von R (Soll ${FRONT_TREUE.join("–")}): das Gitter verliert das Gesetz`);
            }
            const g = WA.grob;
            if (g.R > 0 && g.vor / g.R >= FRONT_TREUE[0]) v.push(`BLIND: das grobe Gitter (nur Diagonalen) trägt ${wz("grob", g)} — FRONT-TREUE sieht das Gitter nicht`);
            for (const n of [...WINKEL, "wieder", "langsam"]) {
                const b = WA[n].bett;
                if (b.abweichend || b.stoff !== "gras" || b.naesse !== 0)
                    v.push(`FENSTER-BETT: ${n} zündete auf ${b.stoff} (Last ${b.w}, Boden ${b.boden}, Nässe ${b.naesse}), ${b.abweichend} von ${b.zellen} Zellen verzehrten ein anderes Bett (zuerst ${b.erste}) — Soll: jede Zelle das gesetzte Gras-Bett, Nässe 0`);
            }
            const drei = ["diagonal", "wieder", "langsam"].map((n) => WA[n]);
            const weg = ["mit", "alle", "vor", "R"].filter((k) => drei.some((h) => !(Math.abs(h[k] - drei[0][k]) <= BETT_GLEICH * Math.abs(drei[0][k]))));
            if (weg.length)
                v.push(`FENSTER-BETT: drei Starts an derselben Uhr des Winds tragen ${weg.map((k) => `${k} ${drei.map((h) => h[k]).join(" · ")}`).join(", ")} (Soll gleich auf ±${BETT_GLEICH * 100} %) — der Herd hängt an der Welt, die er antrifft`);
            if ((Z.uhrRueck || []).length) v.push(`FENSTER-BETT: die Welt-Uhr stand vor dem Herd schon später (${Z.uhrRueck.map(([a, b]) => `${a} s statt ${b} s`).join(", ")}) — ein Herd begann nicht zu seiner Uhr`);
            if (!(Z.bett && Z.bett.abweichend > 0)) v.push("BLIND: der Herd des Spiels (sein Bett ungesetzt) verzehrte überall das Bett seines Herds — FENSTER-BETT sieht kein Bett");
        }
        // DAS FENSTER HÄNGT NIE AM LÄUFER (linse-brand-schritte): derselbe Herd mit dem Wind mit dem Budget des Spiels und am
        // langsamsten Läufer (ein Stück je Bild) trägt dieselben Köpfe und Schritte, Median und schnellsten Sprung auf FENSTER_MS
        // gleich (die Welt lebt zwischen beiden Herden weiter) — bis hier zählte das Fenster Bilder und begann zur Uhr, zu der der
        // Läufer ankam: FRONT-MIT schwankte am selben Gesetz 0,335–1,029 m/s (CI voll 15/18), lokal 0,35 ↔ 0,29 m/s zwischen zwei
        // Herden. Ein Fenster, das seinen Deckel der Bilder erreicht, endet laut (FENSTER-DECKEL)
        const F = Z.fenster;
        const fz = (f) => `${f.zellen} Zellen, ${f.koepfe} Köpfe (Median ${f.mit} m/s), alle ${f.alle} m/s in ${f.schritte} Schritten und ${f.bilder} Bildern`;
        if (!F || !F.spiel || !F.langsam) v.push("LEER: die Probe des Fensters (derselbe Herd mit dem Budget des Spiels und am langsamsten Läufer) lief nicht");
        else if (F.spiel.koepfe !== F.langsam.koepfe || F.spiel.schritte !== F.langsam.schritte || !(Math.abs(F.spiel.mit - F.langsam.mit) <= FENSTER_MS) || !(Math.abs(F.spiel.alle - F.langsam.alle) <= FENSTER_MS))
            v.push(`FENSTER-UHR: derselbe Herd trägt mit dem Budget des Spiels ${fz(F.spiel)}, am langsamsten Läufer ${fz(F.langsam)} (Soll: gleiche Köpfe und Schritte, Median und alle ±${FENSTER_MS} m/s) — das Fenster hängt am Läufer`);
        for (const [wo, d] of [["mit dem Wind", Z.deckel], ["im Regen", Z.regenDeckel], ["am langsamsten Läufer", F?.langsam?.deckel]])
            if (d) v.push(`FENSTER-DECKEL: das Fenster ${wo} erreichte nach ${d} Bildern seine Schritte nicht`);
        // die Asche senkt lebendig am Herd (auraAt, der Leser) — gemessen NETTO des Leben-Overlays, das derselbe Leser im selben
        // Fenster trägt (Fraß und Tod des Bestands, kreatur-leben `_depositLife`): bis laub-messer schrieb die Linse jede Regung
        // des Overlays der Asche zu — Vorprüfung 00520c2e (CI): 0,75 → 0,725 bei Asche 0,3 und Overlay −0,09 → +0,19; lokal
        // dieselbe Asche bei Overlay −0,077 → +0,059 (Radeon-Laptop) und −0,08 → −0,03 (CPU zweifach gedrosselt)
        const ov = [Z.ovVor || 0, Z.ovNach || 0];
        const asche = +(Z.lebVor - ov[0] - (Z.lebNach - ov[1])).toFixed(3);
        if (!(Z.asche >= 1) || !(asche > 0.1))
            v.push(`BRAND-ASCHE: ${Z.asche} Aschen, lebendig am Herd ${Z.lebVor} → ${Z.lebNach} (Leben-Overlay ${ov[0]} → ${ov[1]}, die Asche senkt ${asche}, Soll > 0.1)`);
        if (!(Z.glut > 0) || !Z.licht) v.push(`BRAND-LESER: glut am Herd +${Z.glut}, Leuchtquelle ${Z.licht ? "da" : "fehlt"}`);
        const ruhe = Z.nachher.sims.brand.summe + Z.nachher.sims.zuendung.summe;
        if (ruhe > 0) v.push(`BRAND-RUHE: nach dem Erlöschen arbeitet der Brand — ${ruhe} Einheiten`);
    }
    // (same.physik.reaktion#2) die Druckwelle arbeitet je Ereignis an ihrem Soll, bricht nach dem Gesetz, stößt, klingt und ruht
    druckUrteil(W.druck, v);
    const A = W.wasser;
    if (!A || !(A.chunks > 0)) v.push("LEER: am Fluss weckt die Werk-Setzung keinen Chunk des Automaten");
    else
        A.takte.forEach((t, i) => {
            const wo = `am Fluss (${A.ort}), Wecken ${i + 1}`;
            if (A.bewegt[i] > 0.25) v.push(`LEER: ${wo} bewegte der Automat ${A.bewegt[i]} — kein Fixpunkt`);
            else if (t !== 1)
                v.push(`FIXPUNKT-WASSER: ${wo} ging der Automat ${t} Takte, ${A.gehalten[i]} Chunks blieben ohne Bewegung wach (Soll 1)`);
        });
    return v;
}

// Die Schwelle eines synchronen Chunk-Baus im Takt (ORT, K69-2): ein halber Frame des Profi-Bands (16,7 ms).
const SYNC_CHUNK_MS = 8;
function standUrteil(b) {
    const v = [];
    const namen = b.namen || Object.keys(TAKTE);
    const R = b.ruhe;
    if (!R || !R.frames) v.push("LEER: keine Ruhe-Phase gemessen");
    else
        for (const n of namen) {
            const t = R.takte[n];
            if (!t) v.push(`LEER: der Takt ${n} fehlt in der Ruhe-Phase`);
            else if (t.summe > 0)
                v.push(
                    `RUHE: ${n} (${TAKTE[n]}) arbeitet im Stand — ${t.summe} Einheiten in ${t.mitArbeit} von ${R.frames} ` +
                        `Frames (Mittel ${t.mittel}, max ${t.max}): ein Fege-Takt rechnet seine Nachbarschaft neu, obwohl sich nichts änderte`
                );
        }
    // TREUE: derselbe Stand mit gebrochener Wache — jeder Takt geht, und keiner ändert die Welt (sonst verschlief die
    // Wache eine Änderung: eine Eingabe, die der Stempel nicht kennt).
    const treue = (ph, wo, ohne) => {
        for (const n of namen) {
            const t = ph && ph.takte[n];
            if (t?.wirkt > 0 && !(ohne && n in ohne))
                v.push(
                    `TREUE: ${n} (${TAKTE[n]}) änderte mit gebrochener Wache ${wo} die Welt in ${t.wirkt} Gängen — die ` +
                        `Wache verschlief eine Änderung (eine Eingabe, die der Stempel nicht kennt)`
                );
        }
    };
    if (b.ruheOnly) {
        if (b.phasen?.A) treue(b.phasen.A[0], "nach der Ruhe");
        if (b.simRuhe) v.push(...simRuheZeilen(b.simRuhe, "(echter Loop)"));
        return v;
    }
    simUrteil(b, v);
    // DIE RUNDE: eine Treue-Phase geht JEDEN Takt mindestens eine volle Runde (die Einheiten, die er `_standRuht` als Runde
    // nennt) — ein Teil der Runde sähe eine verschlafene Änderung dahinter nie.
    const runde = (ph, wo) => {
        for (const n of namen) {
            const t = ph && ph.takte[n];
            if (!t || t.runde === undefined) v.push(`LEER: die Treue-Phase ${wo} nennt die Runde von ${n} nicht`);
            else if (!(t.gang >= t.runde))
                v.push(
                    `TREUE-LÜCKE: ${n} (${TAKTE[n]}) ging ${wo} ${t.gang} von ${t.runde} Einheiten seiner Runde — die ` +
                        `Treue sah nur einen Teil der Welt`
                );
            // die Runde muss während der Phase stehen: wächst sie, liegen die neuen Einheiten hinter dem Cursor ungesehen
            if (t && t.rundeVon !== undefined)
                v.push(
                    `TREUE-LÜCKE: ${n} (${TAKTE[n]}) änderte ${wo} seine Runde (${t.rundeVon} → ${t.runde} Einheiten) — ` +
                        `Einheiten hinter dem Cursor blieben ungesehen`
                );
            // der Ort muss während der Phase stehen: wechselt er (eine Eingabe — die Anker-Generation des Saums nach einem
            // Neu-Bestellen des Rings, die Zelle des Stroms), ging die Runde über zwei Welten, und was die Probe verstellte,
            // überschrieb die neue, statt dass die Treue es fand
            if (t?.ortWechsel) v.push(`TREUE-EINGABE: ${n} (${TAKTE[n]}) wechselte ${wo} seinen Ort (${t.ortWechsel})`);
        }
    };
    const S = b.bruch;
    if (!S || !S.frames) v.push("LEER: keine Bruch-Phase — die Linse ist ungeprüft");
    else {
        treue(S, "nach der Ruhe");
        runde(S, "nach der Ruhe");
        for (const n of namen) {
            const t = S.takte[n];
            if (!t || !(t.summe > 0))
                v.push(
                    `STUMPF: mit gebrochener Wache zählt die Linse für ${n} keine Arbeit — sie sähe den Täter nicht`
                );
        }
    }
    const G = b.gehen;
    if (!G || !G.frames) v.push("LEER: keine Geh-Phase");
    else {
        for (const n of ["archLod", "archCull", "streuLod", "nahStreu"])
            if (!G.takte[n] || !(G.takte[n].summe > 0))
                v.push(`STARR: beim Gehen arbeitet ${n} nicht — eine gehaltene Wahl wäre ein Loch`);
        // Gehen kostet nur die Änderung: der Ring liest die Spieler-Zelle, der Saum die Chunk-Menge und die Anker-Generation des
        // Fern-Rings — beide prüft nur ein Gang, der in seiner Zelle bleibt (tritt er über die Grenze, wechseln Chunks ihre Stufe,
        // und Ring und Saum gehen zu Recht)
        if (G.zelleGleich === false) v.push("LEER: der Gang verließ seine Zelle — Ring und Saum ungeprüft");
        if (G.zelleGleich && G.takte.strom && G.takte.strom.summe > 0)
            v.push(
                `GEHEN: der Ring geht ohne Zellen-Wechsel (${G.takte.strom.summe} Einheiten) — Gehen kostet mehr als die Änderung`
            );
        if (G.zelleGleich && G.ankerGleich && G.takte.deckWache && G.takte.deckWache.summe > 0)
            v.push(
                `GEHEN: der Saum geht ohne neuen Anker (${G.takte.deckWache.summe} Einheiten) — Gehen kostet mehr als die Änderung`
            );
        if (G.zelleGleich === undefined || G.ankerGleich === undefined)
            v.push("LEER: die Geh-Phase nennt Zelle und Anker nicht");
        if (!(G.weg > 1)) v.push(`BEWEGUNG: beim Gehen kam der Spieler ${G.weg} m voran (Soll > 1 m)`);
    }
    const W = b.wecken;
    if (!W) v.push("LEER: keine Weck-Phase");
    else {
        if (!W.eintrag) v.push("WECKEN: der Bau im Stand entstand nicht");
        for (const n of ["archCull", "archLod"])
            if (!W.phase || !W.phase.takte[n] || !(W.phase.takte[n].summe > 0))
                v.push(`WECKEN: ein Bau im Stand weckt ${n} nicht — die Wache verschliefe die Welt`);
        if (!W.treue) v.push("LEER: keine Treue nach dem Bau");
        else {
            treue(W.treue, "nach dem Bau");
            runde(W.treue, "nach dem Bau");
            // die Weck-Probe der Treue: ein Weckruf in der Phase ist ein Gang der heilen Wache — die Linse sieht ihn als geweckt
            const P = W.weckProbe;
            const g = W.treue.takte && W.treue.takte.nahStreu ? W.treue.takte.nahStreu.geweckt | 0 : 0;
            if (!P || !(P.kacheln > 0)) v.push("LEER: die Weck-Probe der Treue weckte keine Kachel der Nah-Streu");
            else if (!(g > 0))
                v.push(
                    `STUMPF: der Weckruf in der Treue-Phase (${P.kacheln} Kacheln neu) zeigt keinen geweckten Gang der Nah-Streu — ` +
                        `die Linse trennt Geweckt und Verschlafen nicht`
                );
        }
        if (!W.regler) v.push("LEER: kein Regler-Schritt in der Weck-Phase");
        else if (!W.regler.takte.archCull || !(W.regler.takte.archCull.summe > 0))
            v.push("WECKEN: ein Regler-Schritt (der Cull-Radius) weckt archCull nicht — der Rand bliebe stehen");
        // die Zusage eines Schläfers weckt den Cull (b-ankunft): er tritt in die Wache, sein Gang geht — sonst steht er wach mit
        // seinem gedockten Asset, bis ein fremdes Ereignis die Bau-Takte regt (GTX 1050 kalt: 6–8 s vor dem ersten Weltbild)
        if (!W.zusage) v.push("LEER: keine Zusage eines Schläfers in der Weck-Phase");
        else {
            if (W.zusage.vor !== 0) v.push(`LEER: vor der Zusage des Schläfers ruhte archCull nicht (${W.zusage.vor} Einheiten)`);
            if (W.zusage.wach !== true) v.push("WECKEN: die Zusage holt den Schläfer nicht in die Wache des Culls");
            else if (!W.zusage.takte.archCull || !(W.zusage.takte.archCull.summe > 0))
                v.push(
                    "WECKEN: die Zusage eines Schläfers weckt archCull nicht — er stünde wach mit seinem Asset, bis ein fremdes " +
                        "Ereignis den Takt regt"
                );
        }
        // der Stempel liest die Wahrnehmung selbst (kein Weckruf am Schreiber): eine neue LOD-Distanz weckt die Stufen-Wahlen
        if (!W.wahrnehmung) v.push("LEER: kein Wahrnehmungs-Schritt in der Weck-Phase");
        else
            for (const n of ["archLod", "streuLod"])
                if (!W.wahrnehmung.takte[n] || !(W.wahrnehmung.takte[n].summe > 0))
                    v.push(
                        `WECKEN: ein Wahrnehmungs-Schritt (LOD_DISTANCES, ohne Weckruf) weckt ${n} nicht — der Stempel ` +
                            `liest die Wahrnehmung nicht`
                    );
        // der Stempel liest den Schirm (w28-probe-schirm): jede Grenze des Stufen-Gesetzes liest die Zeilen des Zeichenpuffers — nach
        // einem Fenster-Wechsel steht die Welt erst, wenn ein Takt am neuen Schirm ging, und die Stufen-Wahlen gehen
        if (!W.schirm) v.push("LEER: kein Schirm-Schritt in der Weck-Phase");
        else {
            const [z0, z1] = W.schirm.zeilen || [];
            if (!(z1 !== z0)) v.push(`LEER: der Schirm-Schritt wechselte keine Zeile (${z0} → ${z1})`);
            if (W.schirm.stehtSofort !== false)
                v.push(
                    `WECKEN: nach einem Schirm-Schritt (${z0} → ${z1} Zeilen) steht die Welt ohne einen Takt — ein Bild trüge die ` +
                        `Stufen des alten Schirms`
                );
            for (const n of ["archLod", "streuLod"])
                if (!W.schirm.takte[n] || !(W.schirm.takte[n].summe > 0))
                    v.push(
                        `WECKEN: ein Schirm-Schritt (der Zeichenpuffer wechselt seine Zeilen, ohne Weckruf) weckt ${n} nicht — der ` +
                            `Stempel liest die Zeilen des Schirms nicht`
                    );
        }
        if (W.eintrag && !W.versorgt)
            v.push("WECKEN: der neue Bau trägt nach dem Wecken weder Stufe noch Gestalt (der Cull-Gang ging ihn nie)");
        if (!W.nachher || W.nachher.summe > 0)
            v.push(
                `WECKEN: nach dem Bau schläft die Wache nicht wieder (${W.nachher ? W.nachher.summe : "?"} Einheiten in Ruhe)`
            );
    }
    // DIE TÄTER: jeder Takt, dessen Runde mehrere Gänge braucht (Runde × Frames > Gang — der Gang eines Frames deckt sie
    // nicht), trägt in der zweiten Hälfte seiner Runde eine still verstellte Einheit (eine Änderung ohne Weckruf); die
    // Treue-Phase muss jede finden — sonst ist sie für die zweite Rundenhälfte blind.
    const X = b.taeter;
    if (!X || !X.phase || !X.je) v.push("LEER: keine Täter-Probe der Treue");
    else {
        for (const n of namen) {
            const t = X.phase.takte[n];
            const x = X.je[n];
            const mehrGang = !!t && t.runde * X.phase.frames > t.gang;
            if (!x) {
                if (mehrGang)
                    v.push(
                        `LEER: kein Täter für ${n} (${TAKTE[n]}) — seine Runde (${t.runde} Einheiten) braucht mehrere Gänge`
                    );
                continue;
            }
            if (!(x.stelle >= x.runde / 2))
                v.push(
                    `LEER: der Täter von ${n} steht an Stelle ${x.stelle} von ${x.runde} — nicht in der zweiten Rundenhälfte`
                );
            if (!t || !(t.wirkt > 0))
                v.push(
                    `TREUE-TÄTER: die Treue-Phase sah die verschlafene Einheit von ${n} (${TAKTE[n]}) an Stelle ${x.stelle} ` +
                        `von ${x.runde} nicht (gegangen ${t ? t.gang : "?"}) — für die zweite Rundenhälfte ist die Treue blind`
                );
        }
        treue(X.phase, "mit den Tätern", X.je); // die Takte ohne Täter bleiben treu
        runde(X.phase, "mit den Tätern");
    }
    // (U) STUFE: ein reiner Stufen-Wechsel (dieselbe Fläche im Gesetz, der Morph trägt sie) regt nur die Boden-Karte —
    // nie Stufen-Wahl, Cull, Streu, Ring oder Saum, nie Wald-Setzung oder Sichthöhen
    const U = b.stufe;
    if (!U) v.push("LEER: keine Stufen-Phase");
    else if (!(U.wechsel > 0)) v.push("STUFE: kein Stufen-Wechsel geschah — die Probe ist stumpf");
    else {
        const fremd = Object.entries(U.takte || {}).filter(([n, x]) => x > 0 && n !== "nahWiese" && n !== "nahStreu");
        if (fremd.length)
            v.push(
                `STUFE: ${U.wechsel} Stufen-Wechsel ohne Form-Änderung wecken ${fremd.map(([n, x]) => `${n} (${x} Einheiten)`).join(", ")}`
            );
        for (const m of ["_lodTreeVisHeight", "_forestStehtFrei", "_forestCellDarts"])
            if ((U.rufe || {})[m] > 0)
                v.push(
                    `STUFE: ${U.wechsel} Stufen-Wechsel ohne Form-Änderung rufen ${m} ${U.rufe[m]}× (Wald-Setzung, Sichthöhen)`
                );
    }
    // (O) ORT: ein Erdbau abseits wirft nur, was er ändern kann — der Stand des Walds (an ihm hängt die Gestalt jedes
    // Orts), die fernen Wald-Zellen, die fernen Chunk-Gedächtnisse und der Stand eines fernen Chunks bleiben.
    const O = b.ort;
    if (!O) v.push("LEER: keine Ort-Phase");
    else if (!O.gelegt) v.push("LEER: die Ort-Phase legte keinen Erdbau — die Probe ist stumpf");
    else if (!(O.darts && O.darts.fern > 0))
        v.push(`LEER: die Ort-Phase sah keine fernen Wald-Zellen (über ${O.fern} m) — die Probe ist stumpf`);
    else {
        const wo = `der Erdbau bei (${O.ort})`;
        const riss =
            `die ${O.takte} Takte danach planten ${O.plan} Wald-Zellen neu (\`_forestCellDarts › planForestCell\`), ` +
            `der längste ${O.maxTaktMs} ms`;
        if (O.standNach !== O.standVor)
            v.push(
                `ORT: ${wo} warf das Dart-Gedächtnis der Welt (Stand des Walds ${O.standVor} → ${O.standNach}: die Gestalt ` +
                    `jedes Orts fällt mit, \`_erdbauSetzen\`) — ${riss}`
            );
        if (O.darts.gehalten < O.darts.fern)
            v.push(
                `ORT: ${wo} warf ${O.darts.fern - O.darts.gehalten} von ${O.darts.fern} fernen Wald-Zellen (über ${O.fern} m, ` +
                    `\`_erdbauSetzen\`) — ${riss}`
            );
        for (const [n, c] of Object.entries(O.chunks || {}))
            if (c.gehalten < c.fern)
                v.push(
                    `ORT: ${wo} warf ${c.fern - c.gehalten} von ${c.fern} fernen Chunk-Gedächtnissen (${n}, über ${O.fern} m)`
                );
        // die Räumung seines Grunds speichert die Welt nie synchron (`removeArchitecture › saveState`)
        const Q = O.raeumung;
        if (!Q || !(Q.abbau > 0)) v.push("LEER: die Ort-Phase räumte keine Natur — der Abbau ist ungeprüft");
        else if (Q.saves > 0)
            v.push(
                `ORT: der Abbau von ${Q.abbau} Natur-Stücken speicherte die Welt ${Q.saves}× synchron (\`removeArchitecture › ` +
                    `saveState\`, Σ ${Q.saveMs} ms) — räumt ein Dorf beim Nähern seinen Grund, liegt je Stück ein voller Save im Takt`
            );
        // das Solo-Haus (Vorschau, KI): der Wirt baut nie das ganze Haus im Kern, um die Kamin-Spitze zu finden — sie reist mit der Hülle
        const H = O.kamin;
        if (!H || !H.gesetzt) v.push("LEER: die Ort-Phase setzte kein Solo-Haus — die Wurzel ist ungeprüft");
        else if (H.bau > 0)
            v.push(
                `ORT: das Solo-Haus (${H.kultur}) baute seinen Kern ${H.bau}× im Haupt-Faden (\`spawnArchitecture › ` +
                    `chimneyTipFromParams › massBau\`, ${H.ms} ms) — die Kamin-Spitze reist mit der Hülle aus dem Worker ` +
                    `(\`__huelle.kamin\` → \`_hausHuelleSetzen\`), der Wirt baut kein Haus`
            );
        // der Baum in frischem Wald (ein Hof-Baum des Dorfs, `_naturSetzen`): seine Zellen plant die Schlange des Walds im Takt
        const Wd = O.wald;
        if (!Wd || !Wd.gesetzt)
            v.push("LEER: die Ort-Phase setzte keinen Baum in frischem Wald — der Wald-Plan ist ungeprüft");
        else {
            if (Wd.synchron > 0)
                v.push(
                    `ORT: der Baum in frischem Wald bei (${Wd.ort}) plante ${Wd.synchron} Wald-Zellen synchron ` +
                        `(\`_ortGestaltSame › _forestStehtFrei › planForestCell\`, ${Wd.ms} ms) — die Gestalt plant am Stück ` +
                        `im Aufrufer, die Ausstattung eines Dorfs wird eine Lawine neben dem Takt`
                );
            if (!Number.isInteger(Wd.gestalt))
                v.push(
                    `ORT: die Gestalt des Baums in frischem Wald steht nach ${Wd.takte} Takten nicht — die Schlange des ` +
                        `Walds (\`_tickWaldPlan\`) plant seine Zellen nicht`
                );
            if (Wd.maxTaktMs > 40)
                v.push(
                    `ORT: die Schlange des Walds plante in EINEM Takt ${Wd.maxTaktMs} ms (${Wd.maxTaktZellen} Zellen) — ` +
                        `ihr Budget (\`WALD_PLAN.ms\`) hält nicht`
                );
        }
        // das Haus im Satz: sein Wieder-Eintritt (jeder Stufen-Wechsel) legt keine Ecke frisch an (`_satzBlock`)
        const SH = O.satzHaus;
        if (!SH || !SH.gesetzt || !(SH.bloecke > 0) || !(SH.ecken >= 1000))
            v.push(
                `LEER: die Ort-Phase brachte kein Haus in den Bau-Satz (` +
                    (SH?.gesetzt
                        ? `${SH.kultur}, ${SH.gruppen || 0} Gruppen, ${SH.ecken || 0} Ecken nach ${SH.takte} Takten`
                        : "keins gesetzt") +
                    `) — der Satz-Block ist ungeprüft`
            );
        else if (SH.frischKB > 64)
            v.push(
                `ORT: das Haus im Satz (${SH.kultur}, ${SH.ecken} Ecken in ${SH.gruppen} Gruppen) legte beim Wieder-Eintritt ` +
                    `${(SH.frischKB / 1024).toFixed(1)} MB frisch an (\`_tickBauSatz › _bauSatzBlock › _satzBlock\`, ` +
                    `${SH.bloecke} Blöcke) — jeder Stufen-Wechsel eines Hauses schreibt seine Ecken neu in den Heap, die volle ` +
                    `Sammlung fällt in den Takt`
            );
        if (!O.stand || !O.stand.key)
            v.push("LEER: die Ort-Phase fand keinen fernen Chunk für den Stand der Worker-Antworten");
        else if (!O.stand.gleich)
            v.push(
                `ORT: ${wo} verwarf die Worker-Antworten des fernen Chunks ${O.stand.key} (Stand ${O.stand.vor} → ` +
                    `${O.stand.nach}) — der Worker baut fern neu, was der Erdbau nie berührt`
            );
        // DER ERDBAU UNTER DEM SPIELER: der Chunk-Stoff entsteht im Worker, nie im Haupt-Faden (Lehre 14) — ein Takt,
        // der einen Chunk synchron baut (`_buildVoxelChunkData`) über SYNC_CHUNK_MS, ist der Riss beim Namen seiner Rufer.
        const AS = O.amSpieler;
        if (!AS || !AS.gelegt)
            v.push("LEER: die Ort-Phase legte keinen Erdbau unter dem Spieler — die Probe ist stumpf");
        else if (!(AS.dirty > 0))
            v.push("LEER: der Erdbau unter dem Spieler markierte keinen Chunk zum Neubau — die Probe ist stumpf");
        else {
            const riss = (AS.sync || []).filter((s) => s.ms > SYNC_CHUNK_MS);
            if (riss.length) {
                const max = riss.reduce((a, s) => (s.ms > a.ms ? s : a), riss[0]);
                v.push(
                    `ORT: der Erdbau unter dem Spieler bei (${AS.ort}) baute ${riss.length} Chunk${riss.length > 1 ? "s" : ""} ` +
                        `synchron im Haupt-Faden (\`${max.kette} › _buildVoxelChunkData\`, der längste ${max.ms} ms) — ` +
                        `der Chunk-Stoff entsteht im Worker`
                );
            }
            if (!AS.heil)
                v.push(
                    `ORT: der Erdbau unter dem Spieler bei (${AS.ort}) heilt nicht — nach ${AS.takte} Takten warten noch ` +
                        `Chunks auf ihren Neubau`
                );
        }
    }
    const T = b.strom;
    if (!T) v.push("LEER: keine Strom-Phase");
    else if (!T.spielerChunk)
        v.push(
            `STROM: nach dem Sprung an (${T.x}, ${T.z}) steht der Spieler-Chunk nach ${T.takte} Takten nicht — das Streaming verhungert`
        );
    // der Wald am fremden Ort: jede frische Zelle plant die Schlange des Walds (`_tickWaldPlan`, K69) — ein anderer Aufrufer
    // plant sie am Stück im Takt
    if (T) {
        const Wd = T.wald;
        if (!Wd) v.push("LEER: die Strom-Phase zählte den Wald-Plan nicht");
        else if (Wd.aussen > 0)
            v.push(
                `STROM: ${Wd.aussen} frische Wald-Zellen plante nicht die Schlange des Walds, sondern \`${Wd.taeter}\` ` +
                    `(${Wd.ms} ms, bis ${Wd.maxTakt} in EINEM Takt) — der Plan liegt am Stück im Aufrufer`
            );
        else if (!(Wd.imJob > 0))
            v.push("LEER: die Strom-Phase sah keinen frischen Wald — der Wald-Plan am fremden Ort ist ungeprüft");
    }
    const N = b.nachschub;
    if (!N) v.push("LEER: keine Nachschub-Probe (die Streu nach der Schlange des Walds)");
    else if (N.warten.length && (N.schlange > 0 || N.foundry > 0))
        v.push(
            `NACHSCHUB: nach ${N.takte} Takten plant die Schlange des Walds noch ${N.schlange} Zellen, die Foundry hat ` +
                `${N.foundry} Aufträge offen — ${N.warten.length} Streu-Regionen warten (${N.warten.join(", ")})`
        );
    else if (N.warten.length)
        v.push(
            `NACHSCHUB: ${N.warten.length} Streu-Regionen warten, obwohl die Schlange des Walds leer ist und kein Asset ` +
                `aussteht (${N.warten.join(", ")}) — nichts baut sie neu (_scatterRefillPending, _tickWaldPlan)`
        );
    // (K) DIE FÜHRUNG FERN: führt ein Studio die Kamera jenseits des Rings (`kameraFuehren`, eine Sonde), steht die Welt — kein
    // Fege-Takt wartet auf Boden, den kein Strom baut
    const KF = b.fuehrung;
    if (!KF) v.push("LEER: keine Führungs-Phase (die Kamera jenseits des Rings)");
    else if (!KF.steht)
        v.push(
            `FÜHRUNG: die Kamera bei (${KF.x}, ${KF.z}), ${KF.abstand} m neben dem Spieler — die Welt steht nach ${KF.takte} ` +
                `Takten nicht: ${KF.grund} (ein Fege-Takt wartet auf Boden jenseits des Rings, den kein Strom baut)`
        );
    // (W) WACH: ein Fege-Takt mit Offenem hält die Welt wach, beim Namen
    if (!/Fege-Takt[^]*archCull/.test(b.wach || "")) v.push(`WACH: ein Fege-Takt mit Offenem hält die Welt nicht wach beim Namen (${b.wach || "—"})`);
    // (B) BAKE-SCHULD: die Welt steht erst ohne Schuld der Bake-Uhr, „offen" nennt die Felder
    const BS = b.schuld || {};
    if (BS.rest !== 0 || !(BS.abgewiesen > 0) || !/Felder offen/.test(BS.grund))
        v.push(`BAKE-SCHULD: steht nach ${BS.takte} Takten mit ${BS.rest} offenen Fits (${BS.abgewiesen} abgewiesen, ${BS.grund})`);
    // (D) DORF: erst nach dem letzten Haus des Akts steht die Welt
    const D = b.dorf || {};
    if (!(D.placed > 0) || typeof D.steht !== "number")
        v.push(`DORF: die Welt stand nach ${D.steht} Takten mit dem Dorf im Flug (${D.placed} Häuser gesetzt)`);
    // (F) FIXPUNKT: „die Welt steht" (A9) heißt, ohne Eingabe wirkt nichts mehr — nach einem Regler-Schritt mit Wirkung geht nach
    // dem Wort kein Fege-Takt mehr (er stand sonst mitten in seiner Runde)
    if (b.fixWach !== false) v.push(`FIXPUNKT: die Welt hieß stehend — ${b.fixWach}: Stufen-Wahl und Streu gingen noch`);
    const fix = b.fix || [];
    if (!fix.length) v.push("LEER: keine Fixpunkt-Phase");
    else if (!fix.some((F) => F.wirkte > 0 || F.fehler)) v.push("LEER: der Regler-Schritt wirkte nicht — die Fixpunkt-Phase ist stumpf");
    for (const F of fix)
        if (F.fehler) v.push(`FIXPUNKT: nach dem Regler-Schritt steht die Welt nie — ${F.fehler}`);
        else
            for (const [n, t] of Object.entries(F.nach.takte))
                if (t.summe > 0)
                    v.push(
                        `FIXPUNKT: die Welt stand nach ${F.takte} Takten, danach ging ${n} (${TAKTE[n]}) ohne Eingabe noch ${t.summe} ` +
                            `Einheiten in ${t.mitArbeit} von ${F.nach.frames} Takten (${t.wirkt} Wirkungen) — „steht" mitten in seiner Runde`
                    );
    for (const e of b.pageErrors || []) v.push(`PAGE-ERROR: ${e}`);
    return v;
}

module.exports = {
    TAKTE,
    SIMS,
    standUrteil,
    brandAmSoll,
    druckAmSoll,
    druckUrteil,
    STAND_INSTALL:
        `window.__standLinseAn = () => (${standLinseAn.toString()})(${JSON.stringify(TAKTE)}, ${JSON.stringify(BLAETTER)}, ${JSON.stringify(EIGENE_UHR)});` +
        `window.__simLinseAn = () => (${simLinseAn.toString()})(${JSON.stringify(SIMS)}, ${JSON.stringify(AKTE)});` +
        `window.__simPhase = ${simPhase.toString()};` +
        `window.__standPhase = ${standPhase.toString()};` +
        `window.__standLauf = ${standLauf.toString()};` +
        `window.__druckSchlafS = ${DRUCK_SCHLAF_S};`,
};
