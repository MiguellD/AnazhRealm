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
        paesse: 0,
        nach: 0,
    });
    // der Pass, in dem gerade geprüft wird (haupt · k<i> · anders) — die Prüfungen je Pass
    let pass = "?";
    const passName = (kam) => {
        if (kam === r.state.camera) return "haupt";
        const k = typeof r._schattenKameraIndex === "function" ? r._schattenKameraIndex(kam) : -1;
        return k >= 0 ? "k" + k : "anders";
    };
    z = neu();
    const orig = {};
    const leser = new Set(cfg.kette);
    const huelle = (name, art) => {
        if (typeof P[name] !== "function" || orig[name]) return;
        const f = (orig[name] = P[name]);
        P[name] = function (...a) {
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
            } else if (art === "neu") {
                // der Satz × Pass bzw. die Gruppe, deren Wahl dieser Frame neu rechnete
                const w =
                    name === "_satzAbschnittMerke"
                        ? "satz " + String(a[0].art).split("|")[0] + "|" + a[1].key
                        : "gruppe " + ((a[0].mesh && a[0].mesh.name) || a[0].key || "?");
                z.neu[w] = (z.neu[w] || 0) + 1;
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
    // die Licht-Richtung des Frames (Richtlicht: Ort − Ziel) — dreht sie gegen den Frame davor?
    let lichtVor = null;
    // eine Drehung in einem Tick ohne Pass (der Loop rendert nicht jeden Tick) zählt zum nächsten gerenderten Frame
    let lichtOffen = 0;
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
            z = neu();
            b0 = bytes();
            bj0 = bytesJe();
            lichtDreht();
            return { gehuellt: Object.keys(orig) };
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
            const p = o.pruefung;
            o.ecken = 8 * ((p._hoehlenRect || 0) + (p._hoehlenLichtLage || 0));
            let ruhe = (p._hoehlenRect || 0) + (p._hoehlenLichtLage || 0);
            for (const n of cfg.ruheLeser) ruhe += o.trifft[n] || 0;
            ruhe += p._instanzBehalten || 0;
            for (const n of ["_hoehlenSicht", "_hoehlenSichtLicht", "_chunkSatzAbschnitt"]) ruhe += o.aufrufe[n] || 0;
            o.arbeit = ruhe;
            o.trefferSumme = Object.values(o.treffer).reduce((a, x) => a + x, 0);
            lichtOffen = lichtDreht() || lichtOffen;
            o.licht = lichtOffen;
            if (o.paesse > 0) lichtOffen = 0;
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

// Die Statistik einer Phase: je Zähl-Größe Mittel · Median · Maximum über die Frames (ab `ab`).
function sichtPhase(frames, ab) {
    const fs = frames.slice(ab || 0).filter((f) => f.paesse > 0);
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
    };
}

// DAS URTEIL (rein): Liste der Verstöße, leer = grün. `b.ruhe` / `b.drehen` / `b.gehen` sind Phasen (`sichtPhase`).
//   (R) RUHE: nach dem ersten Frame keine neue Arbeit und kein Byte, und die Pässe treffen ihren Cache (sonst prüfte die
//       Linse nichts). `b.streng` (die Wand, eingefrorene Welt): in KEINEM Frame; sonst (der echte Loop, die Welt lebt —
//       ein Foundry-Asset kommt, eine Gruppe wird geräumt) der Median 0 und höchstens `RUHE_EREIGNIS` der Frames mit
//       Arbeit bzw. Bytes: jedes solche Ereignis ist eine Änderung, die Linse nennt den Täter;
//   (B) BEWEGUNG: wer dreht oder geht, rechnet neu — eine Phase ohne Arbeit hielte eine Wahl über eine neue Lage (Loch);
//   (T) TREUE: die gehaltene Wahl ist die frisch gerechnete (`b.treue`: je Satz × Pass die Zellen, je Gruppe die Zahl);
//   (S) SCHARF: ein eingeschmuggelter Cache-Bruch (`b.bruch`, eine Ruhe-Phase mit gebrochenem Cache) fällt rot;
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
    const R = b.ruhe;
    if (!R || !(R.frames > 0)) v.push("LEER: keine Ruhe-Phase gemessen (die Linse prüfte nichts)");
    else {
        const erlaubt = b.streng ? 0 : Math.floor(R.frames * RUHE_EREIGNIS);
        if (R.arbeit.median > 0 || R.arbeitFrames > erlaubt)
            v.push(
                `RUHE: die Sicht-Kette arbeitet in Ruhe ${R.arbeit.mittel} Prüfungen je Frame (Median ${R.arbeit.median}, ` +
                    `max ${R.arbeit.max}, in ${R.arbeitFrames} von ${R.frames} Frames; Höhlen-Sicht ${R.hoehlenSicht.mittel} + ` +
                    `Licht ${R.hoehlenSichtLicht.mittel} Aufrufe, ` +
                    `Abschnitte ${R.abschnitt.mittel}, Ecken ${R.ecken.mittel}, Instanzen ${R.instanzBehalten.mittel}) — ` +
                    "nichts hat sich geändert, jede Prüfung ist ein Cache-Bruch" +
                    (R.taeter && R.taeter.length ? `; neu gerechnet je Frame: ${R.taeter.join(", ")}` : "")
            );
        if (R.bytes.median > 0 || R.schreibFrames > erlaubt)
            v.push(
                `RUHE: ${R.bytes.mittel} Index-Bytes je Frame (max ${R.bytes.max}, in ${R.schreibFrames} von ${R.frames} ` +
                    "Frames) — ein Pass schreibt ohne Änderung"
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
            if (messen && phase && phase.name === "drehen") st.yaw += Math.PI / 180;
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
    sichtPhase,
    sichtUrteil,
    SICHT_INSTALL:
        `window.__sichtLinseAn = () => (${sichtLinse.toString()})(${JSON.stringify({
            kette: SICHT_KETTE,
            pruefung: SICHT_PRUEFUNG,
            treffer: SICHT_TREFFER,
            neu: SICHT_NEU,
            ruheLeser: RUHE_LESER,
        })});` +
        `window.__sichtPhase = ${sichtPhase.toString()};` +
        `window.__sichtLauf = ${sichtLauf.toString()};`,
};
