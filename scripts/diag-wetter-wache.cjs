#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-wetter-wache.cjs — DIE WACHE VON UHR UND WETTER: Halt heißt Halt, frei gehören Uhr und Wetter dem Spieler, und das
// Wetter ist eine Funktion von Saat, Ort und Spiel-Zeit. Der EINE Wetter-Schreiber `_setWeather` verweigert jeden Zug unter der
// Bühne (Uhr < 0); das GESETZ DER SCHREIBER (`_himmelSchreiber`): die Uhr schreiben ihr Gang, der Spieler und das Laden
// (`_uhrSetzen`), das Wort des Spielers steht bis „frei", die Welt wünscht nur — der Zug zieht im Takt `WETTER_ZUG_SEK` ihren
// Wunsch oder die Front am Ort. Die Wand (Null-Renderer, echte Welten):
//   (H) HALT: unter der Bühne dreht kein Weg das Wetter (Emotion, Nexus, Gesetz, Mensch, Mitspieler, Zug), jeder steht beim
//       Namen; (S) SCHARF: ein roher Schreiber am `_setWeather` vorbei fällt ROT;
//   (Z) SAAT: frei zieht der Zug in 20 min Spiel-Zeit (Ereignis-Takte) je Saat und Ort dieselbe Folge, welche Wanduhr gilt;
//   (F) FRONT im Zug: Regen an A bei trockenem B (3 km windab) ≥ 20 % der Zeit, Lag = Abstand ÷ Zug ±20 %, alle fünf Zeilen von
//       WX_GESETZ erreichbar, der Sturm des Kerns (phyto-core wetterAt) zieht den Zug der Welt und das Wetterspiel des Labors;
//   (G) GESETZ: eine frische Welt läuft `HIMMEL_MIN` Minuten getaktet — Nexus, Emotion und ein Wesen im Schöpfer-Modus gegen das
//       Wort des Spielers, jeder Täter beim Namen (`himmelUrteil`); (B) BAND: frei schreibt nur der Zug, nie schneller als sein
//       Takt; (R) REGLER zeigt die Welt-Zeit; (T) TAG trägt eine Szene, ein alter Stand setzt ihn nicht zurück; (Q) QUELLE: kein
//       Wurf des Nexus trägt einen Uhr-Op; (U) UHR (A9): die Bühne hält NUR die Bild-Uhr, jeder Leser steht mit ihr; (P) kein
//       Page-Error — der EINE Sammler (welt-boot) macht den Lauf ROT mit Namen.
//   (W) WANDUHR (w28-welt-uhr, rein statisch, `--quelle` in `npm run check`): die Welt entscheidet nach ihrer eigenen Uhr — jeder
//       Leser der Gerätezeit in stamm/ und den Wurzel-Dateien (performance.now · Date.now · new Date() · der rAF-Stempel) steht je
//       Datei und Glied mit Zahl und Grund in spec/uhr/geraetezeit.json; ein neuer Leser, eine Zahl über der Tafel und jede
//       Weitergabe des rAF-Stempels im Takt an ein Glied ohne Grund (`this._bildZeit = wandZeit`) ist ROT beim Namen (Datei:Zeile).
//   (K) KALENDER: Licht, Tag der Prozesse, Pegel und Jahr gehen bei jeder Tag-Länge im Verhältnis 1; DAS JAHR AM LAUB: im Winter des
//       Kalenders deckt keine Laub-Art über `JAHR_LAUB_DECKUNG` ihrer Sommer-Fläche, die Nadel steht (`jahrLaubRot`).
//   (O) ORT (wetter-am-ort, im Selbsttest am echten Kern): das Wetter ist ein Feld je Ort (phyto-core `wetterFeldAm`) — Weg des
//       Winds = Integral seiner Richtung, gleiche Saat → gleiches Feld, stetig, der Eingriff trägt sein Feld, Bilanz Ziel + Lee
//       ±10 %, der Luv-Hang regnet mehr als der Lee-Hang (`ortRot`).
//   (L) LAND-MEER-LUFT (klima-kontinent, im Selbsttest am echten Kern planet-core): das Δ des Orts trägt das Klima von Land, Meer und
//       Luft — Regenschatten am Kamm, Nebel an der Auftriebs-Küste, die Spanne West ↔ Ost —, der Gipfel steht auf Konvergenz
//       (ks liest die Grenze jemals) und das Eis auf der Kälte des Orts; fünf gepflanzte Täter fallen je an ihrer Klinge und nennen
//       ihr Gesetz (`planetKlimaR`, `ortRoh ks`, `ortEisZeit`), ein Δ ohne nebelQuote wirft (`lmlRot`).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): jedes Urteil fällt bei jedem eingeschmuggelten Täter rot und bleibt
// bei Bühne, Verweigerung und Wunsch grün.
//   node scripts/diag-wetter-wache.cjs [--selftest | --quelle]   (npm run gate:wetter-wache; Port WETTER_WACHE_PORT, HIMMEL_MIN)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const {
    statikServer,
    starteBrowser,
    nullRenderer,
    hauptLauf,
    selbsttestEnde,
    wandEnde,
    SELBSTTEST,
} = require("./lib/welt-boot.cjs");
const {
    AUSGABE_INSTALL,
    wetterUrteil,
    wetterSelbsttest,
    himmelUrteil,
    himmelSelbsttest,
    hm,
} = require("./lib/ausgabe-aufnahme.cjs");

const PORT = Number(process.env.WETTER_WACHE_PORT || 4602);
// Spiel-Minuten je Fenster (G und B): drei Takte des Wetter-Zugs (120 s), 77 Feuer eines 4,7-s-Gesetzes, 15 Nexus-Evolutionen.
const HIMMEL_MIN = Number(process.env.HIMMEL_MIN || 6);
const SCHRITT_SEK = 0.25;
// Der Takt des Wesens im Schöpfer-Modus (Spiel-Sekunden): sechs Vorschläge je Fenster, zwei je Takt des Wetter-Zugs.
const WESEN_SEK = 60;

// ── (W) WANDUHR (w28-welt-uhr): die Leser der Gerätezeit am AST (Kommentare und Literale lesen nie). Die Tafel nennt je Datei
// (stamm/ ohne Pfad) ihre Gründe mit deren Gliedern (`name:n` = n Leser), `weiter` je Glied mit rAF-Stempel, wem es ihn reicht (ein
// Glied, `=feld`; er fließt über Variablen und lokale Funktionen), `spielTakt` die Namen, die die Spiel-Zeit SIND. Gelesen: stamm/
// und jede Wurzel-Datei; worlds/ sind die Labore der Studios mit eigener Uhr. Ein Leser ohne Grund, eine Zahl neben der Tafel, eine
// Weitergabe ohne Grund und ein Eintrag ohne Leser sind ROT beim Namen (Datei:Zeile).
const UHR_TAFEL = "spec/uhr/geraetezeit.json";
const istFn = (n) => /^(Arrow)?Function(Expression|Declaration)$/.test(n?.type);
const geraet = (n, c = n.callee, o = c?.object) =>
    n.type === "NewExpression" ? c.name === "Date" && !n.arguments.length && "new Date"
    : n.type === "CallExpression" && c.property?.name === "now" && ((o.name || o.property?.name) === "performance" ? "performance.now" : o.name === "Date" && "Date.now"); // prettier-ignore
const klasse = (A) => A.find((a) => /^(Method|Property)Definition$/.test(a.type));
function uhrBefund(t, sauber) {
    const { ast, wandere, zeileVon } = require("./lib/stamm.cjs");
    const [leser, weiter, je, Z] = [[], [], new Map(), (n) => zeileVon(t, n.start)];
    wandere(ast(t), (n, A, k = klasse(A)) => {
        const g =
            k?.key.name ||
            A.map((a) => (a.type === "FunctionDeclaration" ? a.id : istFn(a.init || a.value) && (a.id || a.key))).find(
                Boolean
            )?.name;
        if (geraet(n)) leser.push([g, `${Z(n)} ${geraet(n)}`]);
        if (k && /^(requestAnimationFrame|setAnimationLoop)$/.test(n.callee?.name || n.callee?.property?.name))
            je.set(k, [...(je.get(k) || []), n]);
    });
    for (const [k, rufe] of je) {
        const [g, fns, saat, p] = [k.key.name, new Map(), new Set(), (fn, i) => fn?.params?.[i]?.name];
        wandere(k, (n) => void (istFn(n.init) && fns.set(n.id.name, n.init)));
        for (const r of rufe) {
            const fn = fns.get(r.arguments[0].name) || r.arguments[0];
            if (p(fn, 0)) (saat.add(p(fn, 0)), leser.push([g, `${Z(r)} rAF-Stempel`]));
        }
        // trägt der Ausdruck den Stempel? (ein Name als Referenz, nie als Feld- oder Schlüssel-Name)
        const traegt = (e, ja = false) => (wandere(e, (n, A, a = A.at(-1)) => !(ja ||= (n.type === "Identifier" && saat.has(n.name) && a?.property !== n && a?.key !== n) || !!geraet(n))), ja); // prettier-ignore
        let vor;
        do {
            vor = saat.size;
            wandere(k, (n) => {
                const [id, e] = n.type === "VariableDeclarator" ? [n.id, n.init] : [n.left, n.right];
                if (id?.type === "Identifier" && e && !istFn(e) && !sauber.includes(id.name) && traegt(e))
                    saat.add(id.name);
                const f = fns.get(n.callee?.name);
                n.arguments?.forEach((x, i) => p(f, i) && traegt(x) && saat.add(p(f, i)));
            });
        } while (vor !== saat.size);
        const vonThis = (m) => (m?.type === "MemberExpression" ? vonThis(m.object) : m?.type === "ThisExpression");
        wandere(k, (n) => {
            if (vonThis(n.callee) && n.arguments.some((x) => traegt(x)))
                weiter.push([`${g} ${n.callee.property.name}`, Z(n)]);
            if (vonThis(n.left) && traegt(n.right)) weiter.push([`${g} =${n.left.property.name}`, Z(n)]);
        });
    }
    return { leser, weiter };
}
function uhrRotVon(befunde, T) {
    const rot = [];
    const liste = (s = "") =>
        s.split(" · ").flatMap((x) =>
            x
                .split(" ")
                .slice(1)
                .map((n) => [...n.split(":"), x.split(" ")[0]])
        );
    for (const d of new Set([...Object.keys(befunde), ...Object.keys(T.leser)])) {
        const [B, ist, weit] = [befunde[d] || { leser: [], weiter: [] }, new Map(), new Map()];
        for (const [g, wo] of B.leser) ist.set(g, [...(ist.get(g) || []), `${d}:${wo}`]);
        for (const [n, z, g] of liste(T.leser[d]).map(([n, z, g]) => (g ? [n, +z, g] : [n, 1, z]))) {
            const L = ist.get(n) || [];
            if (!T.gruende[g] || L.length !== z)
                rot.push(`(W) WANDUHR ${d} ${n}: ${L.length} Leser, die Tafel trägt ${z} (${g}) ${L}`);
            ist.delete(n);
        }
        for (const [n, L] of ist) rot.push(`(W) WANDUHR ${n} liest die Gerätezeit ohne Grund — ${L.join(", ")}`);
        for (const [w, z] of B.weiter) weit.set(w, z);
        for (const [k, s] of Object.entries(T.weiter).filter(([k]) => k.startsWith(d + " ")))
            for (const [n, g] of liste(s))
                if (!weit.delete(`${k.slice(d.length + 1)} ${n}`) || !T.gruende[g])
                    rot.push(`(W) WANDUHR ${k} ${n}: der Takt reicht es nicht`);
        for (const [w, z] of weit)
            rot.push(`(W) WANDUHR ${w.replace(" ", " reicht den rAF-Stempel an ")} ohne Grund — ${d}:${z}`);
    }
    return rot;
}
function uhrQuelle() {
    const [fs, path] = [require("fs"), require("path")];
    const [R, befunde] = [path.resolve(__dirname, ".."), {}];
    const T = JSON.parse(fs.readFileSync(path.join(R, UHR_TAFEL), "utf8"));
    for (const f of [...require("./lib/stamm.cjs").dateien(R), ...fs.readdirSync(R).filter((f) => f.endsWith(".js"))]) {
        const d = f.replace(/^stamm\/|\.js$/g, "");
        const B = uhrBefund(fs.readFileSync(path.join(R, f), "utf8"), (T.spielTakt[d] || "").split(" "));
        if (B.leser.length + B.weiter.length) befunde[d] = B;
    }
    return { rot: uhrRotVon(befunde, T), B: Object.values(befunde) };
}
// ── (K) DER KALENDER (zeit-ein-kalender): `spielZeit` ist die EINE laufende Größe; Tag, Tag der Prozesse, Pegel und Jahr sind
// Funktionen von ihr durch die EINE Tag-Länge (`_kalender`, `_kalenderZeit`, das Gesetz `WELT_GESETZ_ERDE.kalender`). Die Schreiber
// der Uhr, der Schritt 1/60 und die Zahlen des Jahrs hält die Ein-Schreiber-Wand (`spec/stamm/grundgroessen.json`, gate:constitution);
// hier urteilt der Lauf (Null-Renderer): bei jeder Tag-Länge gehen Licht, Tag der Prozesse, Pegel und Jahr im Verhältnis 1 (vor dem
// Kalender am 8-min-Tag 7,5 : 1 : 1 : 1). Jeder Leser, der davon abweicht, ist ROT beim Namen.
// (K) das Urteil des Laufs (rein): je Tag-Länge die Tage, die Licht, Tag der Prozesse, Pegel und Jahr im selben Fenster der
// Welt-Uhr gingen — jedes Verhältnis zum Licht 1 (±1 %: der Pegel liest die volle Sekunde), sonst ROT beim Leser.
function kalenderRot(je) {
    const rot = [];
    const leser = {
        prozess: "der Tag der Prozesse (`_weltTag`)",
        pegel: "der Pegel (`pegelLauf`)",
        jahr: "das Jahr (`seasonPhase`)",
    };
    if (!(je && je.length >= 2)) return ["(K) KALENDER: der Lauf maß keine zwei Tag-Längen"];
    for (const j of je)
        for (const [k, name] of Object.entries(leser)) {
            const v = j.licht / j[k];
            if (!(Math.abs(v - 1) <= 0.01))
                rot.push(
                    `(K) KALENDER ${j.min} min: das Licht geht ${v.toFixed(3)}-mal so schnell wie ${name} — ${(+j[k]).toFixed(4)} gegen ${j.licht.toFixed(4)} Tage in ${j.welt.toFixed(0)} s Welt-Uhr`
                );
        }
    return rot;
}
function kalenderSelbsttest() {
    const j = (o) => ({ min: 8, welt: 240, licht: 0.5, prozess: 0.5, pegel: 0.5, jahr: 0.5, ...o });
    return [
        [kalenderRot([j(), j({ min: 60 })]), null],
        [
            kalenderRot([j({ pegel: 0.0667 }), j({ min: 60 })]),
            /8 min: das Licht geht 7\.496-mal so schnell wie der Pegel/,
        ],
        [kalenderRot([j(), j({ min: 60, jahr: 0.3 })]), /60 min: .* wie das Jahr/],
    ].flatMap(([rot, soll], i) =>
        (soll ? rot.length === 1 && soll.test(rot) : !rot.length) ? [] : [`kalender Fall ${i}: ${rot}`]
    );
}
// (K) die Probe im Seiten-Kontext (eine frische Welt, der echte Takt `_gameLoopTick`): je Tag-Länge `o.minuten` ein Fenster von
// `o.sek` Sekunden Welt-Uhr; gelesen die Tage des Lichts (`worldMeta.tag` + `timeOfDay`), des Tags der Prozesse (`_weltTag`), des
// Pegels (Zeit ÷ Tag, wie der Lauf des Kerns sie bekommt, `pegelLauf`) und des Jahrs (Phase ÷ `jahreJeTag`).
function kalenderProbe(o) {
    const [r, K] = [window.anazhRealm, globalThis.__gelaendeCore];
    const st = r.state;
    st.renderer.setAnimationLoop(null);
    let arg = null;
    const lauf = K.pegelLauf;
    const spion = { value: (...a) => ((arg = { t: a[2], tagS: a[3] }), lauf.apply(K, a)) };
    globalThis.__gelaendeCore = Object.create(K, { pegelLauf: spion });
    const [tag0, jahr0, jeTag] = [st.dayLengthMinutes, st.autoSeason, AnazhRealm.WELT_GESETZ_ERDE.kalender.jahreJeTag];
    st.autoSeason = true; // das Jahr des Spiels läuft (die Aufnahme hält es beim Boot an, `saisonFest`)
    const lies = () => {
        r._pegelStand = null;
        r._pegelTafel();
        return {
            licht: (st.worldMeta.tag || 0) + st.timeOfDay,
            prozess: r._weltTag(),
            jahr: st.seasonPhase,
            pegel: arg.t / arg.tagS,
            z: st.spielZeit,
        };
    };
    const [je, T0] = [[], performance.now()];
    let k = 0;
    const takt = () => r._gameLoopTick(T0 + ++k * o.schrittSek * 1000);
    try {
        for (const min of o.minuten) {
            st.dayLengthMinutes = min;
            for (let i = 0; i < 4; i++) takt();
            const a = lies();
            while (st.spielZeit - a.z < o.sek) takt();
            const b = lies();
            const jahr = ((((b.jahr - a.jahr) % 1) + 1) % 1) / jeTag;
            je.push({
                min,
                welt: b.z - a.z,
                licht: b.licht - a.licht,
                prozess: b.prozess - a.prozess,
                pegel: b.pegel - a.pegel,
                jahr,
            });
        }
    } finally {
        globalThis.__gelaendeCore = K;
        [st.dayLengthMinutes, st.autoSeason] = [tag0, jahr0];
    }
    return je;
}

// (K) DAS JAHR AM LAUB (saison-am-laub): der Kalender trägt die Welt in den Winter — und jede Pflanzen-Art liest ihn. Gemessen an
// jedem Körper jeder Art (Baum, Strauch, Blume, Farn; L0 · L1 · L2, gebaut über den echten Faden des Studios, asset-worker-harness)
// die Laub-Fläche (Stoff foliage · foliageTex) je Typ des Jahrs, gewogen mit der Präsenz, die die Welt im Winter ihres Kalenders
// trägt (`uLaubPraesenz` nach `_tickSeason`: x Laub, y Blüte, jede andere Ecke steht ganz): die Deckung des Winters = Σ Fläche ×
// Präsenz² ÷ Fläche des Sommers. Eine Laub-Art über `JAHR_LAUB_DECKUNG` ist ROT beim Namen („Laubkrone sommergrün bei Jahr im
// Winter"); die Nadel (der Phänotyp der Art, `artPhaenotyp().conifer`) steht und tönt nicht — fällt sie, ist sie ROT. Bis
// saison-am-laub stand die Blume ROT: ihre L2 (die Kugel der Blütenfarbe, Typ 0) deckte im Winter 100 %, L0/L1 7–9 % (der Korb).
const JAHR_LAUB_DECKUNG = 0.05;
function jahrLaubRot(J) {
    const rot = [];
    if (!(J && J.arten && J.arten.length)) return ["(K) JAHR AM LAUB: keine Art gebaut"];
    if (!(J.phase >= 0.75 && J.praesenz && J.praesenz[0] <= 0.25))
        rot.push(
            `(K) JAHR AM LAUB: der Kalender trug die Welt in den Winter (Phase ${J.phase}), ihr Laub steht mit Präsenz ${J.praesenz} — sommergrün`
        );
    // die Karte: ihre Reihe des Jahrs (`_karteJahrFarbe`) teilt die gebackene Albedo durch die Tönung ihres Bakes — als Objekt-Puffer
    // lud die Diät sie nie nach, die GPU trug 1 und die Rinde der Ferne stand im Winter × uSeasonMul (magenta)
    for (const [n, geteilt] of Object.entries(J.karteReihen || {}))
        if (!geteilt)
            rot.push(
                `(K) JAHR AM LAUB Karte: die Reihe ${n} liegt in einer eigenen Gruppe — die Diät lädt sie nie, die Karte zeichnet ihr Jahr nicht (Rinde × uSeasonMul)`
            );
    // das Feld (die Fernform "gesetz": Blume, Fels — `_streuGesetzFit`, gezeichnet im Welt-March): seine Teile tragen ihren Typ des
    // Jahrs (`jahr`) und ziehen sich um die Präsenz wie die Gestalt (`jahrMass`); Deckung = Σ Volumen × Präsenz³ ÷ Σ Volumen
    for (const f of J.feld || []) {
        if (f.fehlt) rot.push(`(K) JAHR AM LAUB Feld ${f.id}: ${f.fehlt}`);
        else if (f.kind === "flower" && f.winter > JAHR_LAUB_DECKUNG)
            rot.push(
                `(K) JAHR AM LAUB Feld ${f.id}: Laubkrone sommergrün bei Jahr im Winter — die Fernform deckt ${(100 * f.winter).toFixed(1)} % (Teile ${JSON.stringify(f.typen)})`
            );
        else if (f.kind !== "flower" && f.winter < 0.99)
            rot.push(
                `(K) JAHR AM LAUB Feld ${f.id}: der Stein trägt das Jahr — Deckung ${(100 * f.winter).toFixed(1)} %`
            );
    }
    for (const a of J.arten) {
        const d = a.flaeche > 0 ? a.winter / a.flaeche : null;
        if (d == null) continue;
        if (a.nadel ? d < 0.99 : d > JAHR_LAUB_DECKUNG)
            rot.push(
                a.nadel
                    ? `(K) JAHR AM LAUB ${a.id} L${a.lod}: die Nadel fällt im Winter — Deckung ${(100 * d).toFixed(1)} %`
                    : `(K) JAHR AM LAUB ${a.id} L${a.lod}: Laubkrone sommergrün bei Jahr im Winter — ${(100 * d).toFixed(1)} % ihrer Laub-Fläche deckt (Typen ${JSON.stringify(a.typen)})`
            );
    }
    return rot;
}
function jahrLaubSelbsttest() {
    const a = (o) => ({ id: "eiche", lod: 1, nadel: false, flaeche: 100, winter: 0.4, typen: { 1: 1 }, ...o });
    const J = (arten, o) => ({ phase: 0.875, praesenz: [0.06, 0], arten, ...o });
    return [
        [jahrLaubRot(J([a(), a({ id: "fichte", nadel: true, winter: 100 })])), null],
        [
            jahrLaubRot(J([a({ id: "blume", lod: 2, winter: 100, typen: { 0: 1 } })])),
            /blume L2: Laubkrone sommergrün .* 100\.0 %/,
        ],
        [jahrLaubRot(J([a({ id: "fichte", nadel: true, winter: 50 })])), /fichte L1: die Nadel fällt/],
        [jahrLaubRot(J([a()], { praesenz: [1, 1] })), /Präsenz 1,1 — sommergrün/],
        [
            jahrLaubRot(J([a()], { karteReihen: { nadel: true, jahr: false } })),
            /Karte: die Reihe jahr liegt in einer eigenen Gruppe/,
        ],
        [
            jahrLaubRot(J([a()], { feld: [{ id: "blume", kind: "flower", winter: 1, typen: { 0: 4 } }] })),
            /Feld blume: Laubkrone sommergrün .* 100.0 %/,
        ],
        [
            jahrLaubRot(J([a()], { feld: [{ id: "findling", kind: "rock", winter: 0.5, typen: { 1: 1 } }] })),
            /Feld findling: der Stein trägt das Jahr/,
        ],
    ].flatMap(([rot, soll], i) =>
        (soll ? rot.length === 1 && soll.test(rot) : !rot.length) ? [] : [`jahr-laub Fall ${i}: ${rot}`]
    );
}
// (K) die Probe des Winters im Seiten-Kontext: der Kalender läuft (8-min-Tag, `autoSeason`, der echte Takt), bis das Jahr der Welt
// in der Mitte des Winters steht (0,86–0,9); gelesen Phase und Präsenz der Uniform, die jeder Laub-Stoff liest
function jahrWinterProbe(o) {
    const r = window.anazhRealm, st = r.state; // prettier-ignore
    st.renderer.setAnimationLoop(null);
    const [tag0, jahr0] = [st.dayLengthMinutes, st.autoSeason];
    st.autoSeason = true;
    st.dayLengthMinutes = 8;
    const T0 = performance.now();
    let k = 0;
    try {
        while (!(st.seasonPhase >= 0.86 && st.seasonPhase < 0.9) && k < 4000)
            r._gameLoopTick(T0 + ++k * o.schrittSek * 1000);
        const p = st.seasonUniforms.uLaubPraesenz.value;
        // die Reihen der Karte (Nadel, Jahr je Schicht): sie wechseln zur Laufzeit — nur in der geteilten Gruppe lädt die Diät sie
        const reihe = (u) => !!(u && u.groupNode && u.groupNode.shared === true);
        const karteReihen = { nadel: reihe(r._karteNadel(null)), jahr: reihe(r._karteJahrFarbe(null)) };
        return {
            phase: +st.seasonPhase.toFixed(4),
            praesenz: [+p.x.toFixed(4), +p.y.toFixed(4)],
            takte: k,
            karteReihen,
        };
    } finally {
        [st.dayLengthMinutes, st.autoSeason] = [tag0, jahr0];
    }
}
// (K) das Feld im Winter (Seiten-Kontext): je Art der Fernform "gesetz" die Passung der Studio-Gestalt (`_streuGesetzFit`, derselbe
// Fit, den der Welt-March zeichnet), je Teil sein Typ des Jahrs und sein Volumen, gewogen mit der Präsenz des Winters
async function jahrFeldProbe(o) {
    const r = window.anazhRealm;
    const SG = r.constructor._saisonGesetz().typ;
    const T = globalThis.__terrainCore.PHYTO_PRESETS;
    const out = [];
    for (const [id, rec] of Object.entries(T)) {
        if (!(rec && (rec.kind === "flower" || rec.kind === "rock"))) continue;
        let fit = null;
        for (let i = 0; !fit && i < 600; i++) {
            fit = r._streuGesetzFit(id, 1, 0, 0);
            if (!fit) await window.sleep(50); // das EINE Warten der Seite (welt-boot `sleep`)
        }
        if (!fit) {
            out.push({ id, kind: rec.kind, fehlt: "die Passung steht nach 600 Fragen nicht" });
            continue;
        }
        const pr = (j) => (j === SG.laub ? o.praesenz[0] : j === SG.bluete ? o.praesenz[1] : 1);
        let v = 0,
            w = 0;
        const typen = {};
        for (const k of fit) {
            // die Blume wiegt ihr Laub (der Stoff des Jahrs: Laub, Blüte — der Stängel steht wie an der Gestalt), der Stein jeden Teil
            if (rec.kind === "flower" && !k.laubStoff) continue;
            v += k.vol;
            w += k.vol * pr(k.jahr) ** 3;
            typen[k.jahr || 0] = (typen[k.jahr || 0] || 0) + 1;
        }
        out.push({ id, kind: rec.kind, winter: +(v > 0 ? w / v : 1).toFixed(4), typen });
    }
    return out;
}
// (K) die Arten: je Laub-Art und Stufe die Laub-Fläche je Typ (der echte Faden des Studios), gewogen mit der Präsenz des Winters
async function jahrLaubArten(praesenz) {
    const H = require("./lib/asset-worker-harness.cjs");
    const { ctx } = H.KLASSE;
    const [T, PC, SG] = [ctx.__terrainCore.PHYTO_PRESETS, ctx.__phytoCore, ctx.SAISON_GESETZ];
    const p = { [SG.typ.laub]: praesenz[0], [SG.typ.bluete]: praesenz[1] };
    const dek = (b64, Typ) => {
        const b = Buffer.from(b64, "base64");
        return new Typ(b.buffer, b.byteOffset, b.byteLength / Typ.BYTES_PER_ELEMENT);
    };
    return H.runWithWorker(PORT + 1, async ({ build }) => {
        const out = [];
        for (const [id, rec] of Object.entries(T)) {
            if (!(rec && ["tree", "shrub", "flower", "fern"].includes(rec.kind))) continue;
            const nadel = !!(rec.s && PC.artPhaenotyp(rec.s, rec).conifer);
            for (const lod of [0, 1, 2]) {
                const a = { id, lod, nadel, flaeche: 0, winter: 0, typen: {} };
                for (const m of (await build({ presetId: id, seed: 1, lod })).meshes) {
                    if (m.kind !== "foliage" && m.kind !== "foliageTex") continue;
                    const P = dek(m.attrs.position.b64, Float32Array);
                    const at = m.attrs.aType ? dek(m.attrs.aType.b64, Float32Array) : null;
                    const I = m.index ? dek(m.index, P.length / 3 > 65535 ? Uint32Array : Uint16Array) : null;
                    const n = I ? I.length : P.length / 3;
                    for (let t = 0; t + 2 < n; t += 3) {
                        const [i, j, k] = I ? [I[t], I[t + 1], I[t + 2]] : [t, t + 1, t + 2];
                        const d = (q, s) => P[q * 3 + s] - P[i * 3 + s];
                        const [ux, uy, uz, vx, vy, vz] = [d(j, 0), d(j, 1), d(j, 2), d(k, 0), d(k, 1), d(k, 2)];
                        const A = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
                        const ty = at ? Math.round(at[i]) : 0;
                        const pr = ty in p ? p[ty] : 1;
                        a.flaeche += A;
                        a.winter += A * pr * pr;
                        a.typen[ty] = (a.typen[ty] || 0) + A;
                    }
                }
                for (const ty in a.typen) a.typen[ty] = +(a.typen[ty] / (a.flaeche || 1)).toFixed(3);
                out.push(a);
            }
        }
        return out;
    });
}

// der Selbsttest: der erlaubte Leser grün; der neue Leser (auch `new Date()`), die Zahl darüber, der Eintrag ohne Leser, die Bild-Uhr
// aus dem rAF-Stempel und die Spiel-Zeit ohne ihren Takt — je beim Namen
// ── (O) DAS WETTER AM ORT (wetter-am-ort, rein, ohne Browser — im Selbsttest gemessen): das Feld des Kerns (phyto-core
// `wetterFeldAm`) je Ort statt EINES Worts der Welt. Gemessen am echten Kern: der Weg des Winds ist das Integral der EINEN Richtung
// (d/dt `windWeg` = `windRichtung`, |Δ| ≤ 1e-5), gleiche Saat → gleiches Feld (byte), der Eingriff trägt an seinem Ort sein Feld,
// die Bilanz Ziel + Lee mit ÷ ohne steht in ±10 % (median ±5 %, ≥ 85 % der Fälle — wo das Lee weniger Regen trägt, als der Eingriff
// zieht, nimmt er nur, was dort fällt), der Luv-Hang regnet mehr als die Ebene, der Lee-Hang weniger, und das Feld springt nie
// (10 m Schritt: |Δ| < 0,2 je Kanal — die Zeilen der Tafel liegen bis 0,85 auseinander). Leser: `ortRot`.
const ORT_BILANZ = { median: 0.05, band: 0.1, anteil: 0.85, sprung: 0.2 };
function ortMessung(P) {
    const W = P.WETTER_ORT;
    const K = ["fog", "sun", "grey", "wind", "rain"];
    let weg = 0;
    for (const saat of ["anazh-realm-seed", "o1"])
        for (let k = 0; k < 24; k++) {
            const t = k * 1733.7 - 4000;
            const [a, b, r] = [P.windWeg(saat, 0, t - 0.01), P.windWeg(saat, 0, t + 0.01), P.windRichtung(saat, t)];
            weg = Math.max(weg, Math.abs((b.x - a.x) / 0.02 - r.x), Math.abs((b.z - a.z) / 0.02 - r.z));
        }
    let gleich = true;
    let sprung = 0;
    for (let i = 0; i < 300; i++) {
        const [x, z, t] = [((i * 7919) % 40000) - 20000, ((i * 104729) % 40000) - 20000, i * 37];
        const a = P.wetterFeldAm("o1", x, z, t);
        if (JSON.stringify(a) !== JSON.stringify(P.wetterFeldAm("o1", x, z, t))) gleich = false;
        const b = P.wetterFeldAm("o1", x + 10, z, t);
        for (const c of K) sprung = Math.max(sprung, Math.abs(a[c] - b[c]));
    }
    const feld = { fog: 0.4, sun: 0.55, grey: 0.6, wind: 0.35, rain: 0.6 };
    const bilanz = [];
    let hier = 0;
    for (const saat of ["o1", "o2", "o3", "o4", "o5", "o6"])
        for (const t of [0, 900, 1800, 2700]) {
            const H = { x: 1000, z: -500, feld }; // BÜHNE: ein Punkt der Kern-Ebene (Saat o1–o6 ohne Welt), kein Welt-Ort
            hier = Math.max(hier, Math.abs(P.wetterFeldAm(saat, H.x, H.z, t, null, { hier: H }).rain - feld.rain));
            const g = P.windGrund(saat);
            const R = W.hierM[1];
            let [mit, ohne] = [0, 0];
            for (const [cx, cz] of [
                [H.x, H.z],
                [H.x + g.x * W.leeM, H.z + g.z * W.leeM],
            ])
                for (let dx = -R; dx <= R; dx += 400)
                    for (let dz = -R; dz <= R; dz += 400) {
                        if (dx * dx + dz * dz > R * R) continue;
                        mit += P.wetterFeldAm(saat, cx + dx, cz + dz, t, null, { hier: H }).rain;
                        ohne += P.wetterFeldAm(saat, cx + dx, cz + dz, t, null).rain;
                    }
            bilanz.push(mit / ohne);
        }
    bilanz.sort(aufsteigend); // der EINE Vergleich und der EINE Rang der Boot-Lib (`aufsteigend`, `rang`: Node global)
    const gr = P.windGrund("o1");
    const hang = (s) => (x, z) => s * 0.05 * (x * gr.x + z * gr.z);
    let [luv, flach, lee] = [0, 0, 0];
    for (let t = 0; t < 3600; t += 120) {
        flach += P.wetterFeldAm("o1", 0, 0, t).rain;
        luv += P.wetterFeldAm("o1", 0, 0, t, null, { hoehe: hang(1) }).rain;
        lee += P.wetterFeldAm("o1", 0, 0, t, null, { hoehe: hang(-1) }).rain;
    }
    const r3 = (v) => Math.round(v * 1000) / 1000;
    return {
        weg,
        gleich,
        sprung: r3(sprung),
        hier,
        bilanz: { min: r3(bilanz[0]), median: r3(rang(bilanz)), max: r3(bilanz[bilanz.length - 1]) },
        imBand: r3(bilanz.filter((v) => Math.abs(v - 1) <= ORT_BILANZ.band).length / bilanz.length),
        relief: { luv: r3(luv), flach: r3(flach), lee: r3(lee) },
    };
}
function ortRot(O) {
    const rot = [];
    if (!(O.weg <= 1e-5)) rot.push(`(O) WEG: d/dt windWeg weicht von windRichtung um ${O.weg} ab — die Wolken-Schicht zieht neben dem Wind`); // prettier-ignore
    if (!O.gleich) rot.push("(O) SAAT: gleiche Saat, gleicher Ort, gleiche Uhr — ein anderes Feld");
    if (!(O.sprung < ORT_BILANZ.sprung)) rot.push(`(O) STETIG: das Feld springt um ${O.sprung} auf 10 m — die Zeile wechselt hart`); // prettier-ignore
    if (!(O.hier <= 1e-12))
        rot.push(`(O) EINGRIFF: am Ort des Eingriffs trägt das Feld nicht sein Feld (Regen ±${O.hier})`);
    if (!(Math.abs(O.bilanz.median - 1) <= ORT_BILANZ.median && O.imBand >= ORT_BILANZ.anteil))
        rot.push(`(O) BILANZ: Ziel + Lee mit ÷ ohne median ${O.bilanz.median}, ${(100 * O.imBand).toFixed(0)} % in ±${100 * ORT_BILANZ.band} % — der Eingriff erfindet oder verliert Regen`); // prettier-ignore
    if (!(O.relief.luv > O.relief.flach && O.relief.flach > O.relief.lee))
        rot.push(`(O) RELIEF: Luv ${O.relief.luv} · Ebene ${O.relief.flach} · Lee ${O.relief.lee} — der Hang formt den Regen nicht`); // prettier-ignore
    return rot;
}
function ortSelbsttest() {
    require("../phyto-core.js");
    const O = ortMessung(globalThis.__phytoCore);
    const v = ortRot(O).map((r) => `ort am Kern: ${r}`);
    const A = (o) => ortRot(Object.assign({}, O, o)).length;
    if (
        [
            { weg: 0.3 },
            { gleich: false },
            { sprung: 0.6 },
            { hier: 0.2 },
            { bilanz: { min: 1.4, median: 1.4, max: 2 } },
            { imBand: 0.5 },
            { relief: { luv: 1, flach: 1, lee: 1 } },
        ].some((o) => A(o) !== 1)
    )
        v.push("ort: ein eingeschmuggelter Täter (Weg, Saat, Sprung, Eingriff, Bilanz, Band, Relief) fällt nicht rot");
    return { v, O };
}

// (L) LAND-MEER-LUFT (klima-kontinent, Karte 2 planet.kopplung.land-meer-luft): das Wetter am Ort liest das Klima des Planeten — der
// Leser des Spiels (planet-core `planetOrt` → Δ wetter → phyto-core `wetterAt`, die Zeilen gezählt wie die Station) auf sechs Saaten
// LML_SAATEN, Breitenkreise im 3°-Takt. KAMM: Kämme ≥ 1 500 m mit ≥ 800 m Abfall nach beiden Seiten — Median nass West ÷ Ost
// ≥ 2 (Sperre und Föhn, Smith & Evans 2007; Kaskaden, Anden 3–10 : 1); NEBEL: Passat-Westküsten (±25°) — Anteil der Küsten mit
// Nebel Küste ÷ 9° landein ≥ 2 mindestens 70 % (Namib, Atacama: Advektions-Nebel über dem Auftrieb, Seely & Henschel 1998);
// SPANNE: das Jahres-Mittel West- minus Ostküste an ±42° ≥ 5 K (Bergen ↔ Magadan, Vancouver ↔ Halifax; WMO-Normalwerte).
// GIPFEL (Karte 2 planet.kopplung.gegenwart#2): Gipfel > 2 km (Gitter 6°, Nachbarn je 6°) stehen zu ≥ 95 % auf einer jemals
// konvergenten Grenze — ks über dem Boden der Saat (ks am ersten Land ohne Gebirge und ohne konvergenten Rand) um > 0,05; Himalaya,
// Alpen, Ural, Appalachen: jedes Hochgebirge ist Kollision oder ihre Naht (Dewey & Bird 1970), die Ausnahmen Dom und Trapp.
// EIS (Karte 2 planet.kopplung.gegenwart#1): jedes Land im selben Gitter, dessen Jahresmittel heute unter der Eis-Linie liegt
// (planetKlima tJahrC < KLIMA.tEisC, −10 °C nach North 1975), trug das Eis des Quartärs — eis.zeit 1 an 100 % (Grönland, Tibet,
// Antarktis: Hochland und Inneres, nicht die Breite allein).
// Der Selbsttest pflanzt je Klinge ihren Täter in den Kern (EINE Zeile, ohne git): ohne Sperre und Föhn, ohne Auftrieb im Nebel,
// ohne den Winter der Meeresluft, ks nur an der Grenze von heute, das Eis nur nach der Breite — jeder fällt ROT an genau seiner
// Klinge und nennt sein Gesetz.
// Leser: `lmlRot`.
const LML_SAATEN = ["anazh-realm-seed", "zsp-0", "zsp-1", "zsp-2", "zsp-3", "zsp-4"];
const LML_SOLL = { kamm: 2, nebelAnteil: 0.7, spanneK: 5, gipfelAnteil: 0.95, eisAnteil: 1 };
const LML_TAETER = [
    ["kamm", "ohne Sperre und Föhn", /sperreKm: 2\.5,/, "sperreKm: 1e9, schattenKm: 1e9,", "planetKlimaR"],
    ["nebel", "ohne Auftrieb im Nebel", /auftrieb = glatt\(0, KLIMA\.nebelTaupunktK, -dTj\);/, "auftrieb = 0;", "planetKlimaR"],
    ["spanne", "ohne den Winter der Meeresluft", /westWinterK: 14, westSommerK: -2,/, "westWinterK: 0, westSommerK: 0,", "planetKlimaR"],
    ["gipfel", "ks nur an der Grenze von heute", /const konv = Math\.max\(st, /, "const konv = Math.max(0, ", "ortRoh ks"],
    ["eis", "das Eis nur nach der Breite", /if \(G\.T0 \+ G\.T2 \* p2 \+ ab < KLIMA\.tEisC\) return 1;/, "if ((breite < 0 ? -breite : breite) >= G.eisBreite) return 1;", "ortEisZeit"], // prettier-ignore
];
function lmlKern(taeter) {
    // der Kern des Baums, bei einem Täter mit EINER getauschten Zeile (sein Text; fehlt die Zeile, bricht der Selbsttest beim Namen)
    const fs = require("fs");
    const os = require("os");
    const path = require("path");
    const kern = path.join(__dirname, "..", "planet-core.js");
    const halt = globalThis.__planetCore;
    if (!taeter) {
        delete globalThis.__planetCore;
        delete require.cache[kern];
        try {
            return require(kern);
        } finally {
            if (halt === undefined) delete globalThis.__planetCore;
            else globalThis.__planetCore = halt;
        }
    }
    const text = fs.readFileSync(kern, "utf8");
    if (!taeter[2].test(text)) throw new Error(`(L) der Kern trägt die Zeile ${taeter[2]} nicht — der Täter „${taeter[1]}" lässt sich nicht pflanzen`); // prettier-ignore
    const aus = path.join(os.tmpdir(), `planet-core-lml-${taeter[0]}-${process.pid}.js`);
    fs.writeFileSync(aus, text.replace(taeter[2], taeter[3]));
    delete globalThis.__planetCore;
    try {
        return require(aus);
    } finally {
        if (halt === undefined) delete globalThis.__planetCore;
        else globalThis.__planetCore = halt;
        fs.unlinkSync(aus);
    }
}
function lmlMessung(P, W, og) {
    const RAD = Math.PI / 180;
    const je = new Map();
    const anteil = (d, zeile) => {
        const k = `${d.regenQuote}|${d.sturmQuote}|${d.nebelQuote}|${zeile}`;
        if (!je.has(k)) {
            let n = 0;
            for (let i = 0; i < 200; i++) {
                const z = W.wetterAt("anazh-realm-seed", 0, 0, i * 97.3, d).zeile;
                if (zeile === "nebel" ? z === "nebel" : z === "regen" || z === "sturm") n++;
            }
            je.set(k, n / 200);
        }
        return je.get(k);
    };
    const v = (a, b) => (a + 0.0025) / (b + 0.0025);
    const [kamm, nebel, spanne] = [[], [], []];
    let [gipfel, gipfelKonv, kalt, kaltEis] = [0, 0, 0, 0];
    for (const samen of LML_SAATEN) {
        const plan = P.planetPlan(samen, P.PLANET_ERDE);
        const S = P.planetScheibe(plan, 0);
        // GIPFEL: das Relief im 6°-Gitter, ks nur an den Gipfeln und am Boden der Saat
        const g = [];
        for (let b = -66; b <= 66; b += 6) {
            const z = [];
            for (let l = -180; l < 180; l += 6) {
                const p = {};
                P.planetPunkt(S, b * RAD, l * RAD, 16, p);
                z.push({ b, l, h: p.hoeheM, boden: p.hoeheM > 0 && p.orogenStaerke === 0 && p.randArt !== P.RAND_ART.konvergent }); // prettier-ignore
                if (!(p.hoeheM > 0) || !(P.planetKlima(S, b * RAD, l * RAD, -1, {}, p).tJahrC < P.KLIMA.tEisC)) continue;
                kalt++;
                if (P.planetOrt(S, b * RAD, l * RAD, og, undefined, plan).eis.zeit === 1) kaltEis++;
            }
            g.push(z);
        }
        const ks = (q) => P.planetOrt(S, q.b * RAD, q.l * RAD, og, undefined, plan).wildnis.ks;
        const boden = g.flat().find((q) => q.boden);
        if (!boden) throw new Error(`(L) GIPFEL: die Saat ${samen} trägt kein Land ohne Gebirge — der Boden von ks fehlt`);
        const ks0 = ks(boden);
        for (let i = 0; i < g.length; i++)
            for (let j = 0; j < g[i].length; j++) {
                const q = g[i][j];
                const nb = [g[i][(j + 1) % g[i].length], g[i][(j + g[i].length - 1) % g[i].length], (g[i - 1] || [])[j], (g[i + 1] || [])[j]]; // prettier-ignore
                if (!(q.h > 2000) || nb.some((n) => n && n.h > q.h)) continue;
                gipfel++;
                if (ks(q) > ks0 + 0.05) gipfelKonv++;
            }
        const ort = (b, l) => {
            const o = P.planetOrt(S, b * RAD, l * RAD, og, undefined, plan);
            const p = {};
            P.planetPunkt(S, b * RAD, l * RAD, 16, p);
            return { land: p.hoeheM > 0, h: p.hoeheM, t: (o.delta.klima.sommer + o.delta.klima.winter) / 2, w: o.delta.wetter };
        };
        for (const b of [42, -42, 52, 25, -25]) {
            const o = [];
            for (let l = -180; l < 180; l += 3) o.push(ort(b, l));
            const at = (i) => o[(i + o.length) % o.length];
            for (let i = 0; i < o.length; i++) {
                const x = at(i);
                if (!x.land) continue;
                if (Math.abs(b) === 25) {
                    if (!at(i - 1).land && !at(i - 2).land && at(i + 3).land)
                        nebel.push(v(anteil(x.w, "nebel"), anteil(at(i + 3).w, "nebel")));
                    continue;
                }
                const [w1, e1] = [at(i - 1), at(i + 1)];
                if (x.h >= 1500 && w1.land && e1.land && x.h - w1.h >= 800 && x.h - e1.h >= 800 && [-2, 2].every((d) => at(i + d).h <= x.h)) // prettier-ignore
                    kamm.push(v(anteil(w1.w, "nass"), anteil(e1.w, "nass")));
                if (Math.abs(b) === 42 && !w1.land && !at(i - 2).land)
                    for (let j = i + 1; j < i + 40; j++) {
                        if (!at(j).land) break;
                        if (!at(j + 1).land && !at(j + 2).land) {
                            spanne.push(x.t - at(j).t);
                            break;
                        }
                    }
            }
        }
    }
    const r3 = (x) => Math.round(x * 1000) / 1000;
    return {
        kamm: r3(rang(kamm.sort(aufsteigend))),
        kaemme: kamm.length,
        nebelAnteil: r3(nebel.filter((x) => x >= 2).length / Math.max(1, nebel.length)),
        kuesten: nebel.length,
        spanneK: r3(rang(spanne.sort(aufsteigend))),
        paare: spanne.length,
        gipfelAnteil: r3(gipfelKonv / Math.max(1, gipfel)),
        gipfel,
        eisAnteil: r3(kaltEis / Math.max(1, kalt)),
        kalt,
    };
}
function lmlRot(L) {
    const rot = [];
    if (!(L.kaemme >= 10 && L.kamm >= LML_SOLL.kamm))
        rot.push(`(L) KAMM: nass West ÷ Ost am Kamm Median ${L.kamm} an ${L.kaemme} Kämmen (soll ≥ ${LML_SOLL.kamm}) — planetKlimaR trägt keinen Regenschatten`); // prettier-ignore
    if (!(L.kuesten >= 10 && L.nebelAnteil >= LML_SOLL.nebelAnteil))
        rot.push(`(L) NEBEL: ${(100 * L.nebelAnteil).toFixed(0)} % von ${L.kuesten} Passat-Westküsten mit Nebel ≥ 2× landein (soll ≥ ${100 * LML_SOLL.nebelAnteil} %) — planetKlimaR liest den Auftrieb nicht`); // prettier-ignore
    if (!(L.paare >= 10 && L.spanneK >= LML_SOLL.spanneK))
        rot.push(`(L) SPANNE: West- minus Ostküste an ±42° Median ${L.spanneK} K an ${L.paare} Paaren (soll ≥ ${LML_SOLL.spanneK} K) — planetKlimaR trägt die Meeresluft nicht`); // prettier-ignore
    if (!(L.gipfel >= 50 && L.gipfelAnteil >= LML_SOLL.gipfelAnteil))
        rot.push(`(L) GIPFEL: ${(100 * L.gipfelAnteil).toFixed(1)} % von ${L.gipfel} Gipfeln > 2 km auf jemals konvergenter Grenze (soll ≥ ${100 * LML_SOLL.gipfelAnteil} %) — ortRoh ks liest das Gebirge nicht`); // prettier-ignore
    if (!(L.kalt >= 20 && L.eisAnteil >= LML_SOLL.eisAnteil))
        rot.push(`(L) EIS: ${(100 * L.eisAnteil).toFixed(1)} % von ${L.kalt} Land-Orten unter −10 °C Jahresmittel tragen das Eis des Quartärs (soll 100 %) — ortEisZeit liest die Kälte des Orts nicht`); // prettier-ignore
    return rot;
}
function lmlSelbsttest() {
    require("../phyto-core.js");
    require("../gelaende-core.js");
    const W = globalThis.__phytoCore;
    const og = globalThis.__gelaendeCore.ortGesetz();
    const L = lmlMessung(lmlKern(null), W, og);
    const v = lmlRot(L).map((r) => `land-meer-luft am Kern: ${r}`);
    const taeter = LML_TAETER.map(([klinge, name, re, ersatz, gesetz]) => {
        const rot = lmlRot(lmlMessung(lmlKern([klinge, name, re, ersatz]), W, og));
        const soll = new RegExp(`^\\(L\\) ${klinge.toUpperCase()}:.*${gesetz}`);
        if (!(rot.length === 1 && soll.test(rot[0])))
            v.push(`land-meer-luft: der Täter „${name}" fällt nicht genau an (L) ${klinge.toUpperCase()} rot: ${rot.join(" · ") || "grün"}`); // prettier-ignore
        return `${name} → ${rot.join(" · ") || "GRÜN"}`;
    });
    // das Δ ohne Nebel ist kein Wetter: der Kern wirft beim Namen, nie still 0
    let wurf = "";
    try {
        W.wetterAt("anazh-realm-seed", 0, 0, 10, { regenQuote: 0, sturmQuote: 0 });
    } catch (e) {
        wurf = String(e.message);
    }
    if (!/nebelQuote/.test(wurf)) v.push("land-meer-luft: ein Δ ohne nebelQuote läuft still durch wetterAt");
    return { v, L, taeter };
}

function uhrSelbsttest() {
    const K = (r) => `class A {\n${r}\n}`;
    const U = (text, leser, sp) =>
        uhrRotVon(
            { a: uhrBefund(K(text), sp || []) },
            { gruende: { f: 1 }, leser: { a: leser }, weiter: sp ? { "a l": "f h" } : {} }
        );
    const a = "_a() { return performance.now(); // Date.now()\n}";
    const l = (b) => `l() {\n const s = (zeit) => {\n  const t = zeit / 1000, d = t;\n  this.state.spielZeit += d;\n  this.h(t);\n  this.q = this.w.zeit;\n  this._bildZeit = ${b};\n };\n const takt = (time) => s(time);\n this.r.setAnimationLoop(takt);\n}`; // prettier-ignore
    return [
        [U(a, "f _a"), null],
        [
            U(a + "\n_b() { this.x = Date.now() + new Date(5) + new Date(); }", "f _a"),
            /_b liest .* — a:4 Date\.now, a:4 new Date$/,
        ],
        [U("_a() { return performance.now() - self.performance.now(); }", "f _a"), /_a: 2 Leser, die Tafel trägt 1/],
        [U(a, "f _a _c"), /_c: 0 Leser/],
        [U(l("this.state.spielZeit"), "f l", ["d"]), null],
        [U(l("t"), "f l", ["d"]), /l reicht den rAF-Stempel an =_bildZeit ohne Grund — a:8$/],
        [U(l("this.state.spielZeit"), "f l", ["x"]), /=spielZeit/],
    ].flatMap(([rot, soll], i) =>
        (soll ? rot.length === 1 && soll.test(rot) : !rot.length) ? [] : [`uhr-quelle Fall ${i}: ${rot}`]
    );
}
if (process.argv.includes("--quelle")) {
    const { rot, B } = uhrQuelle();
    const n = (k) => B.reduce((s, b) => s + b[k].length, 0);
    console.log(
        `=== (W) WANDUHR — ${n("leser")} Leser der Gerätezeit in ${B.length} Dateien, ${n("weiter")} Weitergaben des rAF-Stempels (${UHR_TAFEL}) ===`
    );
    wandEnde(
        [...rot, ...uhrSelbsttest()],
        "jeder Leser der Gerätezeit steht mit Grund in der Tafel; die Welt liest ihre eigene Uhr."
    );
    process.exit(0);
}

if (SELBSTTEST) {
    console.log("=== WETTER-WACHE — Selbsttest der Urteile (ohne Browser) ===");
    const v = wetterSelbsttest()
        .map((x) => "wetter: " + x)
        .concat(himmelSelbsttest().map((x) => "himmel: " + x))
        .concat(uhrSelbsttest(), kalenderSelbsttest(), jahrLaubSelbsttest());
    const ort = ortSelbsttest();
    v.push(...ort.v);
    const O = ort.O;
    console.log(
        `  (O) Ort am Kern · Weg ${O.weg.toExponential(1)} · Sprung ${O.sprung} · Bilanz ${O.bilanz.min}/${O.bilanz.median}/${O.bilanz.max} (${(100 * O.imBand).toFixed(0)} % in ±10 %) · Regen Luv ${O.relief.luv} · Ebene ${O.relief.flach} · Lee ${O.relief.lee}`
    );
    const lml = lmlSelbsttest();
    v.push(...lml.v);
    const L = lml.L;
    console.log(
        `  (L) Land-Meer-Luft am Kern · Kamm West ÷ Ost ${L.kamm} (${L.kaemme}) · Nebel-Küsten ≥ 2× ${(100 * L.nebelAnteil).toFixed(0)} % (${L.kuesten}) · West − Ost ${L.spanneK} K (${L.paare}) · Gipfel auf Konvergenz ${(100 * L.gipfelAnteil).toFixed(1)} % (${L.gipfel}) · Eis am kalten Land ${(100 * L.eisAnteil).toFixed(1)} % (${L.kalt})`
    );
    for (const t of lml.taeter) console.log(`      gepflanzt: ${t}`);
    const U = (b, n, ohne) => {
        const vor = { himmel: 2, wind: 2, böe: 1.1, wasser: ohne === "T" ? 3 : 2 };
        delete vor[ohne];
        return { T: 2, vor, nach: Object.assign({}, vor, { wind: b }), verweigert: n, wort: ohne === "wort" ? 2 : 3 };
    };
    if (
        uhrRot(U(2, 3)).length ||
        uhrRot(U(2.5, 3)).length !== 1 ||
        uhrRot(U(2, 0)).length !== 1 ||
        !uhrRot(U(2, 3, "himmel")).length ||
        uhrRot(U(2, 3, "T")).length !== 1 ||
        uhrRot(U(2, 3, "wort")).length !== 1
    )
        v.push(
            "uhr: die stehende Uhr ist nicht grün, der laufende Leser, der stumme Loop, der fehlende, der Leser neben T oder das stille Wort nicht rot"
        );
    const Z = (...f) => ({ zuege: 2, laeufe: f.map((x, i) => [`L${i}`, { folge: x, fade: wechsel(x) }]) });
    const [g, s, h] = ["rainy sunny", "stormy sunny", "sunny cloudy"];
    const stumm = Z(g, g, h, h, s);
    stumm.laeufe[2][1].fade = 0;
    if (
        saatRot(Z(g, g, h, h, s)).length ||
        saatRot(Z(g, s, h, h, s)).length !== 1 ||
        saatRot(Z(g, g, h, h, g)).length !== 1 ||
        saatRot(Z(g, g, g, g, s)).length !== 1 ||
        saatRot(Z(g, g, "rainy", "rainy", s)).length !== 2 ||
        saatRot(Z("sunny sunny", "sunny sunny", h, h, s)).length !== 2 ||
        saatRot(stumm).length !== 1
    )
        v.push("saat: die Folge, Wanduhr, blinde Saat, blinder Ort, stehende Front oder stummer Zug");
    const F = (o) =>
        frontRot(
            Object.assign(
                { nassTrocken: 0.3, lag: 270, soll: 273, worte: [1, 2, 3, 4, 5], welt: "stormy", labor: "sturm" },
                o
            )
        );
    if (
        F({}).length ||
        [{ nassTrocken: 0.1 }, { lag: 600 }, { worte: [1, 2, 3] }, { welt: "sunny" }, { labor: "klar" }].some(
            (o) => F(o).length !== 1
        )
    )
        v.push("front: die Front, trockener Ort, falscher Lag, fehlende Zeile oder blinde Mutation");
    // der Selbsttest: jeder eingeschmuggelte Täter fällt rot; Bühne, Verweigerung und Wunsch grün.
    selbsttestEnde(v);
    process.exit(0);
}

const server = statikServer();

// Die Probe im Seiten-Kontext: jeder Schreiber-Weg des Spiels unter der Bühne, der rohe Schmuggel, die freie Welt.
function probe(o) {
    const t = () => performance.now() / 1000;
    const fenster = (tat) => {
        const vor = { wetter: st.weather, uhr: st.weatherEffectTime, seq: window.__wetterBuch().seq };
        tat();
        const b = window.__wetterBuch(vor.seq);
        return {
            vorher: vor.wetter,
            nachher: st.weather,
            uhrVorher: vor.uhr,
            uhrNachher: st.weatherEffectTime,
            buch: b.buch,
        };
    };
    // jeder Schreiber-Weg des Spiels (der echte Code-Pfad, keine Abkürzung)
    const wege = {
        emotion: () => {
            st.player.emotions.sorrow = 1;
            r._tickWorldRules(t() + 3600);
        },
        nexus: () => {
            st.nexusWirk = 1e6;
            st.nexusEvolutionQueue.push({
                name: "wache",
                program: ["repeat", 2, ["weather", "stormy"]],
                source: "nexus",
            });
            r._loopNexusUpdate();
        },
        gesetz: () => {
            r.dslRun(["rule", ["weather_is", "sunny"], ["weather", "rainy"]], { source: "human" });
            r._tickWorldRules(t() + 3600);
        },
        mensch: () => r.dslRun(["weather", "rainy"], { source: "human" }),
        mitspieler: () => r.dslRun(["weather", "stormy"], { source: "remote:peer-wache" }),
        // der Auto-Zug: sein Takt läuft (die Uhr zählt weiter), der Zug fällt nie, solange die Uhr unter 0 steht
        autoZug: () => r._loopWeatherAndGrowth(0.016, t()),
    };
    const aus = { halt: {} };
    window.__buehne();
    for (const [n, w] of Object.entries(wege)) aus.halt[n] = fenster(w);
    // die Gesetze, die die Probe registrierte, fallen wieder (die freie Welt prüft nur den Menschen und den Auto-Zug)
    st.worldRules = (st.worldRules || []).filter(
        (x) => !(x.source === "human" && JSON.stringify(x.effect) === '["weather","rainy"]')
    );
    // (S) der rohe Schreiber am `_setWeather` vorbei
    aus.roh = fenster(() => {
        st.weather = "rainy";
    });
    // (Z) je Lauf (Saat, Ort d m windab, Wanduhr-Gang je Takt in ms) `zuege` Takte des Zugs; je Takt springt die Wetter-Uhr um
    // WETTER_ZUG_SEK (Ereignis-Takte), die Folge ist das Wort nach jedem Takt
    const wm = st.worldMeta || (st.worldMeta = {});
    const pm = st.playerMesh.position;
    const [saat0, pn, x0, y0, uhr0, Z] = [
        wm.seed,
        performance.now,
        pm.x,
        pm.z,
        st.spielZeit,
        AnazhRealm.WETTER_ZUG_SEK,
    ];
    const P = globalThis.__phytoCore;
    const zug = (saat, d) => {
        const g = P.windGrund(saat);
        [wm.seed, pm.x, pm.z] = [saat, x0 + d * g.x, y0 + d * g.z];
        r._weltUhrNeu(0); // je Lauf eine neue Welt-Uhr, bestellt bei der Welt
        window.__wetterSetzen("sunny");
        r.dslRun(["weather", "frei"], { source: "human" });
    };
    const lauf = ([saat, d, uhr]) => {
        zug(saat, d);
        const [folge, s0] = [[], window.__wetterSpion().seq];
        for (let i = 0; i < o.zuege; i++) {
            performance.now = () => pn.call(performance) + uhr * (i + 1);
            r._weltUhrNimm(Z * (i + 1)); // der Zug der Welt-Uhr über ihren EINEN Weg (vorwärts)
            st.weatherEffectTime = 0;
            r._loopWeatherAndGrowth(0);
            folge.push(st.weather);
            window.__uebergangFaellt(r);
        }
        performance.now = pn;
        const buch = window.__wetterBuch(s0).buch.filter((e) => e.quelle === "auto-zug" && e.art === "schreiber");
        return { folge: folge.join(" "), fade: buch.length };
    };
    aus.saat = { zuege: o.zuege, laeufe: o.laeufe.map((l) => [l.join(" · "), lauf(l)]) };
    // (F) DIE FRONT im Zug der Welt: A = der erste Lauf, B = derselbe 3 km windab; der Lag ist die Verschiebung in Takten, um
    // die B die Folge von A am besten wiederholt; die Worte des Kerns an 4 096 Orten; der Sturm des Kerns im Zug
    const [A, B] = [0, 2].map((i) => aus.saat.laeufe[i][1].folge.split(" "));
    const gleich = (k) => A.filter((w, i) => w === B[i + k]).length / (A.length - k);
    let lag = 0;
    for (let k = 1; k < A.length / 2; k++) if (gleich(k) > gleich(lag)) lag = k;
    const worte = new Set(
        Array.from({ length: 4096 }, (_, i) => r._wetterAmOrt((i % 64) * 977, (i >> 6) * 977, i * 41))
    );
    const kern = P.wetterAt;
    P.wetterAt = () => ({ zeile: "sturm" });
    zug("saat-a", 0);
    r._weltUhrNimm(Z);
    st.weatherEffectTime = 0;
    r._loopWeatherAndGrowth(0);
    P.wetterAt = kern;
    const nass = (w) => r._weatherIsWet(w);
    aus.front = {
        nassTrocken: A.filter((w, i) => nass(w) && !nass(B[i])).length / A.length,
        lag: Z * lag,
        worte: [...worte],
    };
    Object.assign(aus.front, { soll: 3000 / P.WIND_FELD.front.zugMS, welt: st.weather });
    window.__uebergangFaellt(r);
    [wm.seed, pm.x, pm.z] = [saat0, x0, y0];
    r._weltUhrNeu(uhr0); // die Welt-Uhr des Anfangs zurück über die Welt
    window.__buehne();
    aus.ende = { wetter: st.weather, uhr: st.weatherEffectTime };
    // (Q) der Zwilling `time_of_day` ist fort
    aus.zwilling = typeof r.dslEffects.time_of_day === "function";
    // (Q) die Würfel des Nexus: kein Atom, kein Gesetz, keine Mutation trägt einen Uhr-Op
    const uhrOps = new Set(["time_of_day", "set_time_of_day"]);
    const rng = r._samenStrom(4711);
    const N = 4000;
    const wuerfe = { atome: 0, gesetze: 0, mutationen: 0, n: N };
    for (let i = 0; i < N; i++) {
        if (r._dslContainsAnyOp(r.dslComposeAtomic(rng), uhrOps)) wuerfe.atome++;
        if (r._dslContainsAnyOp(r.dslComposeRule(rng), uhrOps)) wuerfe.gesetze++;
        const m = r.dslMutate(["rule", ["random_chance", 1], ["weather", "rainy"], { everySec: 5 }], rng);
        if (r._dslContainsAnyOp(m, uhrOps)) wuerfe.mutationen++;
    }
    aus.wuerfe = wuerfe;
    // (U) die Leser der Bild-Uhr unter der Bühne, der Loop läuft drei Frames weiter (je Frame die Knoten-Uhr, dann der Takt).
    // Die Wind-Uhr lebt im Wind-Satz, den der erste Leser anlegt (Boden, Gras: `_windUniformsEnsure`) — die Wache nimmt dieselbe
    // Tür, bevor der Takt schreibt (bis 16.11. legte ihn zufällig das Material einer fliegenden Insel an).
    r._windUniformsEnsure();
    r._gameLoopTick(performance.now());
    window.__buehne();
    window.__buehne({ wetter: "rainy", saison: "winter" });
    let wort = +!!(r._rainSystem && r._rainSystem.mesh.visible);
    r._loopRender();
    const uhren = () => Object.fromEntries(window.__bildUhren().map(([n, o, k]) => [n, o[k]]));
    const vor = uhren();
    const z0 = window.__buehneUhr.verweigert;
    const nf = st.renderer && st.renderer._nodes && st.renderer._nodes.nodeFrame;
    for (let k = 1; k <= 3; k++) {
        if (nf) nf.update();
        r._gameLoopTick(performance.now() + 700 * k);
    }
    for (const k of [{ wetter: "regen" }, { saison: "sommerX" }])
        try {
            window.__buehne(k);
        } catch {
            wort++;
        }
    aus.uhren = { T: r._bildZeit, vor, nach: uhren(), verweigert: window.__buehneUhr.verweigert - z0, wort };
    return aus;
}

// (Z) das Urteil der Saat (rein), Läufe A, A+Uhr, B, B+Uhr, A mit Saat 2: jeder Wechsel über `_setWeather`, die Front zieht,
// die Folge ist eine Funktion von Saat und Ort, nie der Wanduhr
function wechsel(folge) {
    return folge.split(" ").filter((w, i, x) => w !== (i ? x[i - 1] : "sunny")).length;
}
function saatRot(Z) {
    const [a, au, b, bu, c] = Z.laeufe;
    const rot = Z.laeufe
        .filter(([, f]) => f.folge.split(" ").length !== Z.zuege || f.fade !== wechsel(f.folge) || !f.fade)
        .map(
            ([n, f]) =>
                `(Z) SAAT ${n}: ${f.fade} Wechsel über _setWeather in ${Z.zuege} Takten (${f.folge || "keiner"})`
        );
    for (const [x, y] of [
        [a, au],
        [b, bu],
    ])
        if (x[1].folge !== y[1].folge)
            rot.push(`(Z) SAAT: die Folge hängt an der Wanduhr — ${x[0]}: ${x[1].folge} ≠ ${y[0]}: ${y[1].folge}`);
    for (const [x, was] of [
        [c, "die Saat"],
        [b, "den Ort"],
    ])
        if (x[1].folge === a[1].folge)
            rot.push(`(Z) SAAT: die Folge ist blind für ${was} — ${x[0]} = ${a[0]}: ${a[1].folge}`);
    return rot;
}

// (F) das Urteil der Front (rein)
function frontRot(F) {
    return [
        [F.nassTrocken >= 0.2, "FRONT: Regen an A bei trockenem B unter 20 % der Zeit"],
        [Math.abs(F.lag - F.soll) <= 0.2 * F.soll, "LAG: B wiederholt A nicht nach Abstand ÷ Zug ±20 %"],
        [F.worte.length === 5, "WORTE: nicht alle 5 Zeilen erreichbar"],
        [F.welt === "stormy" && F.labor === "sturm", "MUTATION: der Sturm des Kerns zieht Welt und Labor nicht beide"],
    ]
        .filter(([ok]) => !ok)
        .map(([, t]) => `(F) ${t} (${JSON.stringify(F)})`);
}

// (F) DAS LABOR (worlds/terrain): sein Wetterspiel ruft denselben Kern — Rechnung ohne Bild (der Null-Renderer trägt kein WebGL,
// `updateWorld` wählt das Wetter vor jedem Pixel)
function laborProbe() {
    const P = window.__phytoCore;
    const kern = P.wetterAt;
    WXPLAY = true;
    P.wetterAt = () => ({ zeile: "sturm" });
    updateWorld(0.05);
    P.wetterAt = kern;
    return WWEATHER;
}

// (U) das Urteil der Uhr-Wache (rein): jeder Leser steht mit der gehaltenen Bild-Uhr, jede Shader-Zeit zeichnet zu T, die Leser
// jeder Welt stehen in der Liste, und der Loop schrieb die Bild-Uhr (verweigert).
function uhrRot(U) {
    const rot = [];
    for (const [n, a] of Object.entries(U.vor))
        if (!Object.is(U.nach[n], a))
            rot.push(`(U) UHR ${n} läuft unter der Bühne: ${a} → ${U.nach[n]} (liest nicht die Bild-Uhr)`);
        else if (/^(himmel|wasser|wind|fell|regen)$|^tor /.test(n) && !Object.is(a, U.T))
            rot.push(`(U) UHR ${n} zeichnet nicht zur Bild-Uhr: ${a} statt ${U.T}`);
    for (const n of ["himmel", "wind", "böe"])
        if (!(n in U.vor)) rot.push(`(U) UHR ${n}: die Bühne kennt sie nicht (${Object.keys(U.vor).join(", ")})`);
    if (!(U.verweigert > 0)) rot.push(`(U) die Bild-Uhr: der Loop schrieb sie nicht — die Wache sah keinen Zug`);
    if (U.wort !== 3)
        rot.push(`(U) WORT: ${U.wort} von 3 — die Bühne zeichnet keinen Regen oder nimmt ein falsches Wort still`);
    return rot;
}

// Die Himmels-Probe (eine FRISCHE Welt): das Spiel läuft getaktet (`_gameLoopTick` in Schritten von `o.schrittSek`).
function himmelProbe(o) {
    const aus = {};
    // (T) die Tag-Länge einer frischen Welt, und was ein alter Spielstand (8-min-Tag) über den echten Restore-Weg aus ihr macht
    const tagMin = st.dayLengthMinutes;
    let alterStand = null;
    try {
        r._loadStateRestoreSoulAndAtmosphere({ dayLengthMinutes: 8, timeOfDay: st.timeOfDay });
        alterStand = st.dayLengthMinutes;
    } catch (e) {
        alterStand = "Fehler: " + e.message;
    }
    st.dayLengthMinutes = tagMin;
    aus.tag = {
        tagMin,
        standard: AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES,
        szene: AnazhRealm.TAG_SZENE_MINUTEN,
        alterStand,
    };
    st.renderer.setAnimationLoop(null);
    const U = window.__uhrSpion();
    const W = window.__wetterSpion();
    const T0 = performance.now();
    let k = 0;
    window.__taktZeit = 0;
    // DAS WESEN IM SCHÖPFER-MODUS schlägt alle `WESEN_SEK` Spiel-Sekunden von selbst `wesenWort` vor, über den EINEN Weg aller
    // Vorschläge (`_handleCreatureProposedProgram`).
    const pm = st.playerMesh.position;
    const wesen =
        r.spawnCreatureAt(pm.x + 30, pm.y, pm.z + 30, "happy", "wesen") ||
        (st.creatures || []).find((c) => c?.userData);
    if (wesen && !wesen.userData.name) wesen.userData.name = "Wache-Wesen";
    aus.wesen = wesen ? wesen.userData.name : null;
    let wesenWort = null;
    const WESEN_TAKTE = Math.round(o.wesenSek / o.schrittSek);
    const lauf = (sek) => {
        const n = Math.round(sek / o.schrittSek);
        for (let i = 0; i < n; i++) {
            k++;
            window.__taktZeit = k * o.schrittSek;
            // ein trauriger Spieler: die Emotion sorrow wirkt auf das Wetter
            st.player.emotions.sorrow = 1;
            r._gameLoopTick(T0 + k * o.schrittSek * 1000);
            if (wesen && wesenWort && k % WESEN_TAKTE === 0)
                r._handleCreatureProposedProgram(wesen, wesen.userData.name, ["weather", wesenWort]);
        }
        return n;
    };
    const fenster = (phase, sek, wort, freiAb, taeter) => {
        const sU = U.seq,
            sW = W.seq,
            g0 = Object.assign({}, U.gang),
            start = st.timeOfDay,
            z0 = st.spielZeit;
        const n = lauf(sek);
        const g = U.gang;
        return {
            phase,
            // die Welt-Uhr des Fensters (`weltSek`, Δ spielZeit): an ihr geht der Tag (w28-nacht-licht)
            takt: { schritte: n, schrittSek: o.schrittSek, weltSek: st.spielZeit - z0, tagMin: st.dayLengthMinutes },
            uhr: {
                buch: U.buch.filter((e) => e.seq > sU),
                gang: { n: g.n - g0.n, weg: g.weg - g0.weg, max: g.max },
                start,
                ende: st.timeOfDay,
            },
            wetter: { buch: W.buch.filter((e) => e.seq > sW), wort, ende: st.weather, freiAb },
            zugSek: AnazhRealm.WETTER_ZUG_SEK || 120,
            taeter,
        };
    };
    lauf(2);
    // DER SPIELER SPRICHT (der echte Chat-Pfad)
    r.processChatCommand("setze uhrzeit mittag");
    r.processChatCommand("setze wetter sonnig");
    aus.wort = { uhr: st.timeOfDay, wetter: st.weather };
    // DIE TÄTER: Nexus-Gesetze auf die Uhr (`time_of_day`, `set_time_of_day`) und den Regen (alle 4,7 s), Würfel auf Uhr und Sturm
    st.nexusWirk = 1e6;
    const q = st.nexusEvolutionQueue;
    const regel = (wirkung) => ["rule", ["random_chance", 1], wirkung, { everySec: 4.7, ttlSec: 3600 }];
    q.push({ name: "schau-gesetz-uhr", program: regel(["time_of_day", 0.17]), source: "nexus" });
    q.push({ name: "schau-gesetz-uhr2", program: regel(["set_time_of_day", 0.144]), source: "nexus" });
    q.push({ name: "schau-gesetz-regen", program: regel(["weather", "rainy"]), source: "nexus" });
    q.push({ name: "schau-wurf-uhr", program: ["set_time_of_day", 0.25], source: "nexus" });
    q.push({ name: "schau-wurf-uhr2", program: ["time_of_day", 0.06], source: "nexus" });
    q.push({ name: "schau-wurf-sturm", program: ["weather", "stormy"], source: "nexus" });
    const gesetzUhr = {
        name: "Nexus-Gesetz Uhr (Schau 04:05)",
        wo: "uhr",
        quelle: "rule:nexus",
        stapel: "_tickWorldRules",
    };
    const regen = {
        name: "Nexus-Gesetz Regen (alle 4,7 s)",
        wo: "wetter",
        quelle: "rule:nexus",
        stapel: "_tickWorldRules",
    };
    const trauer = {
        name: "Emotion sorrow → Regen",
        wo: "wetter",
        quelle: "rule:emotion:sorrow",
        stapel: "_tickWorldRules",
    };
    // beim Stapel, nicht bei der Quelle: so steht das Wesen im Buch, welchen Namen seine Quelle auch trägt
    const wesenT = {
        name: "Wesen im Schöpfer-Modus (von selbst)",
        wo: "wetter",
        quelle: null,
        stapel: "_executeCreatureProgram",
    };
    r.setGameMode("schöpfer");
    aus.modus = r.getGameMode();
    wesenWort = "rainy";
    aus.gesetz = fenster("gesetz", o.fensterSek, "sunny", null, [
        gesetzUhr,
        { name: "Nexus-Wurf Uhr", wo: "uhr", quelle: "nexus", stapel: "_loopNexusUpdate" },
        regen,
        trauer,
        { name: "Nexus-Wurf Sturm", wo: "wetter", quelle: "nexus", stapel: "_loopNexusUpdate" },
        wesenT,
    ]);
    // (R) der Regler der Einstellungen
    const sl = document.getElementById("slider-timeofday");
    const slv = document.getElementById("slider-timeofday-val");
    aus.regler = {
        wert: sl ? Number(sl.value) : null,
        text: slv ? slv.textContent : null,
        welt: st.timeOfDay,
        label: r._timeOfDayLabel(st.timeOfDay).replace(/^[^\s]+\s/, ""),
    };
    // (B) DAS BAND: der Spieler gibt das Wetter frei
    r.processChatCommand("setze wetter frei");
    wesenWort = "stormy";
    aus.frei = fenster("frei", o.fensterSek, null, window.__taktZeit, [gesetzUhr, regen, trauer, wesenT]);
    window.__taktZeit = undefined;
    return aus;
}

// Die Täter eines Urteils je Tat gezählt: Uhrzeiten und Wetter-Worte fallen aus dem Schlüssel, das erste Beispiel bleibt.
function taeterGezaehlt(liste) {
    const g = new Map();
    for (const x of liste) {
        const k = x.replace(/\d\d:\d\d/g, "hh:mm").replace(/\b[a-z]+ → [a-z]+\b/g, "… → …");
        const e = g.get(k);
        if (e) e[0]++;
        else g.set(k, [1, x]);
    }
    return [...g.values()];
}

function urteil(S, H) {
    const rot = [];
    const SOLL_QUELLE = {
        emotion: "rule:emotion:sorrow",
        nexus: "nexus",
        gesetz: "rule:human",
        mensch: "human",
        mitspieler: "remote:peer-wache",
    };
    for (const [n, w] of Object.entries(S.halt)) {
        const u = wetterUrteil(w);
        if (u.urteil !== "GRUEN") rot.push(`(H) HALT ${n}: ${u.taeter.join(" · ")}`);
        if (w.nachher !== "sunny") rot.push(`(H) HALT ${n}: das Wetter ist „${w.nachher}" unter der Bühne`);
        const soll = SOLL_QUELLE[n];
        if (soll && !Object.keys(u.verweigert).some((k) => k.startsWith(soll + " → ")))
            rot.push(
                `(H) HALT ${n}: kein verweigerter Zug der Quelle „${soll}" im Buch (${JSON.stringify(u.verweigert)}) — der Weg schrieb nicht oder der Spion ist blind`
            );
    }
    const roh = wetterUrteil(S.roh);
    if (roh.urteil !== "ROT" || !roh.taeter.some((t) => /ROH am _setWeather vorbei/.test(t)))
        rot.push(
            `(S) SCHARF: der rohe Schreiber fällt nicht rot beim Namen (${roh.urteil}: ${roh.taeter.join(" · ")})`
        );
    if (S.ende.wetter !== "sunny" || !(S.ende.uhr < 0))
        rot.push(`(Z) die Bühne stellt den Halt nicht wieder her (${JSON.stringify(S.ende)})`);
    if (S.zwilling) rot.push("(Q) QUELLE: der Zwilling `time_of_day` schreibt die Uhr neben `set_time_of_day`");
    const w = S.wuerfe;
    if (w.atome || w.gesetze || w.mutationen)
        rot.push(
            `(Q) WÜRFEL: der Nexus würfelt die Uhr — ${w.atome} von ${w.n} Atomen, ${w.gesetze} von ${w.n} Gesetzen, ${w.mutationen} von ${w.n} Mutationen tragen einen Uhr-Op`
        );
    // (G) und (B) — das Urteil des Himmels, je Täter gezählt (dieselbe Tat zu anderer Stunde ist derselbe Täter)
    for (const f of ["gesetz", "frei"]) {
        const u = himmelUrteil(H[f]);
        for (const [n, x] of taeterGezaehlt(u.taeter)) rot.push(`(${f === "gesetz" ? "G" : "B"}) ${n}× ${x}`);
    }
    if (H.wort.wetter !== "sunny" || Math.abs(H.wort.uhr - 0.5) > 1e-9)
        rot.push(`(G) der Satz des Spielers wirkt nicht (Uhr ${hm(H.wort.uhr)}, Wetter ${H.wort.wetter})`);
    if (!H.wesen || H.modus !== "schöpfer")
        rot.push(
            `(G) das Wesen im Schöpfer-Modus läuft nicht (Wesen ${H.wesen || "–"}, Modus ${H.modus}) — sein Täter ist ungeprüft`
        );
    // (R) der Regler zeigt die Welt-Zeit
    const R = H.regler;
    if (R.wert == null) rot.push("(R) REGLER: #slider-timeofday fehlt");
    else if (Math.abs(R.wert - R.welt * 1000) > 1.5 || R.text !== R.label)
        rot.push(`(R) REGLER: der Tageszeit-Regler zeigt ${R.text} (${R.wert}), die Welt steht bei ${R.label}`);
    // (T) die Tag-Länge trägt eine Szene, ein alter Spielstand setzt sie nicht zurück
    const T = H.tag;
    if (!(0.25 * T.tagMin >= T.szene))
        rot.push(
            `(T) TAG: ein Tag von ${T.tagMin} min trägt von Mittag bis Sonnenuntergang ${(0.25 * T.tagMin).toFixed(1)} min — die Szene braucht ${T.szene} min`
        );
    if (!Number.isFinite(T.szene)) rot.push("(T) TAG: das Spiel nennt die Szene nicht (`TAG_SZENE_MINUTEN`)");
    if (T.alterStand !== T.tagMin)
        rot.push(
            `(T) TAG: ein alter Spielstand (8-min-Tag) setzt die Tag-Länge auf ${T.alterStand} — er hält den alten Tag fest`
        );
    rot.push(...uhrRot(S.uhren), ...saatRot(S.saat), ...frontRot(S.front));
    return rot;
}

async function boot(browser) {
    const page = await browser.newPage();
    await nullRenderer(page);
    await server.zeige(page, 60000);
    await page.evaluate(async () => {
        await __weltDa((r) => r.state && r.state.player && r.nexus);
    });
    await page.evaluate(AUSGABE_INSTALL);
    return page;
}

hauptLauf(async () => {
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "null", frist: 900000, erwartet: /Error creating WebGL context/ });
    const page = await boot(browser);
    const S = await page.evaluate(probe, {
        zuege: 10,
        laeufe: [
            ["saat-a", 0, 0],
            ["saat-a", 0, 12e4],
            ["saat-a", 3000, 0],
            ["saat-a", 3000, 12e4],
            ["saat-b", 0, 0],
        ],
    });
    await page.close();
    // (G)(B)(R)(T) in einer FRISCHEN Welt: die Probe oben hat Gesetze, Bühne und Wort hinterlassen
    const page2 = await boot(browser);
    const t0 = Date.now();
    const H = await page2.evaluate(himmelProbe, {
        schrittSek: SCHRITT_SEK,
        fensterSek: HIMMEL_MIN * 60,
        wesenSek: WESEN_SEK,
    });
    const laufS = (Date.now() - t0) / 1000;
    // (K) in einer FRISCHEN Welt: der Kalender bei kurzem und langem Tag
    const page3 = await boot(browser);
    const KAL = await page3.evaluate(kalenderProbe, { minuten: [8, 60], sek: 240, schrittSek: SCHRITT_SEK });
    const JL = await page3.evaluate(jahrWinterProbe, { schrittSek: SCHRITT_SEK });
    JL.feld = await page3.evaluate(jahrFeldProbe, { praesenz: JL.praesenz });
    const lab = await browser.newPage();
    await server.zeige(lab, 60000, "worlds/terrain/index.html");
    await lab.waitForFunction("typeof updateWorld === 'function' && typeof camera === 'object' && camera");
    S.front.labor = await lab.evaluate(laborProbe);
    await browser.close();
    server.close();
    JL.arten = await jahrLaubArten(JL.praesenz);

    console.log("=== DIE WACHE VON UHR UND WETTER — Halt heißt Halt, frei gehören sie dem Spieler (Null-Renderer) ===");
    for (const [n, w] of Object.entries(S.halt)) {
        const u = wetterUrteil(w);
        console.log(
            `  Halt · ${n.padEnd(10)} ${u.urteil}  ${w.vorher} → ${w.nachher}, Uhr ${Math.round(w.uhrNachher)}; verweigert ${JSON.stringify(u.verweigert)}` +
                (u.taeter.length ? `; Täter: ${u.taeter.join(" · ")}` : "")
        );
    }
    const roh = wetterUrteil(S.roh);
    // der rohe Schreiber ist der erwartete Fang: ROT am Täter heißt der Spion sieht — die Zeile sagt GEFANGEN, das Urteil steht in `urteil`
    const rohFang = roh.urteil === "ROT" ? "GEFANGEN" : `ENTKAM (${roh.urteil})`;
    console.log(`  Scharf · roh      ${rohFang}  ${roh.taeter.join(" · ")}`);
    console.log(
        `  Würfel: Uhr-Ops in ${S.wuerfe.atome}/${S.wuerfe.n} Atomen, ${S.wuerfe.gesetze}/${S.wuerfe.n} Gesetzen, ${S.wuerfe.mutationen}/${S.wuerfe.n} Mutationen`
    );
    console.log(
        `  Tag: ${H.tag.tagMin} min (Standard ${H.tag.standard}, Szene ${H.tag.szene}), Mittag → Sonnenuntergang ${(0.25 * H.tag.tagMin).toFixed(1)} min; nach einem alten Stand (8 min): ${H.tag.alterStand} min`
    );
    console.log(
        `  Wort des Spielers: Uhr ${hm(H.wort.uhr)}, Wetter ${H.wort.wetter} (getaktet ${HIMMEL_MIN} min je Fenster, ${laufS.toFixed(1)} s Wanduhr)`
    );
    console.log(
        `  Modus ${H.modus}: das Wesen „${H.wesen || "–"}" schlägt alle ${WESEN_SEK} s von selbst vor (Gesetz: rainy, Band: stormy)`
    );
    for (const f of ["gesetz", "frei"]) {
        const g = H[f];
        const u = himmelUrteil(g);
        const uSp = g.uhr.buch.filter((e) => e.art !== "verweigert").length;
        const wSp = g.wetter.buch.filter((e) => e.art !== "verweigert" && e.art !== "gewuenscht").length;
        console.log(
            `  ${f === "gesetz" ? "Gesetz" : "Band  "} · ${u.urteil}  Uhr ${hm(g.uhr.start)} → ${hm(g.uhr.ende)} (Gang ${(g.uhr.gang.weg * g.takt.tagMin * 60).toFixed(1)} s in ${g.takt.schritte} Takten; ${uSp} fremde Schreiber), Wetter ${f === "gesetz" ? g.wetter.wort : "frei"} → ${g.wetter.ende} (${wSp} Schreiber, ${u.zuege} Züge)`
        );
        console.log(`           verweigert ${JSON.stringify(u.verweigert)}`);
        if (f === "frei") console.log(`           gewünscht ${JSON.stringify(u.gewuenscht)}`);
        for (const [n, x] of taeterGezaehlt(u.taeter)) console.log(`           Täter ${n}×: ${x}`);
    }
    console.log(`  Regler: ${H.regler.text} (${H.regler.wert}) bei Welt ${H.regler.label}`);
    const uz = Object.entries(S.uhren.nach).map(([n, x]) => `${n} ${+(+x).toFixed(4)}`);
    console.log(`  Bild-Uhr ${S.uhren.T}: ${uz.join(" · ")}; verweigert ${S.uhren.verweigert}`);
    for (const [n, f] of S.saat.laeufe) console.log(`  Saat ${n.padEnd(22)} ${f.folge} (${f.fade} überblendet)`);
    const F = S.front;
    console.log(
        `  Front · Regen an A bei trockenem B ${(100 * F.nassTrocken).toFixed(0)} % · Lag ${F.lag} s (Soll ${F.soll.toFixed(0)} s ±20 %)` +
            ` · Worte ${F.worte.length}/5 (${F.worte.join(" ")}) · Mutation des Kerns: Welt ${F.welt}, Labor ${F.labor}`
    );
    for (const j of KAL)
        console.log(
            `  Kalender ${String(j.min).padStart(2)} min · in ${j.welt.toFixed(0)} s Welt-Uhr: Licht ${j.licht.toFixed(4)} · Prozesse ${j.prozess.toFixed(4)} · Pegel ${j.pegel.toFixed(4)} · Jahr ${j.jahr.toFixed(4)} Tage (Licht : Pegel ${(j.licht / j.pegel).toFixed(3)})`
        );
    const laub = JL.arten.filter((a) => !a.nadel && a.flaeche > 0);
    const dmax = laub.reduce((m, a) => (a.winter / a.flaeche > m.d ? { d: a.winter / a.flaeche, a } : m), {
        d: 0,
        a: null,
    });
    console.log(
        `  Jahr am Laub · Kalender im Winter (Phase ${JL.phase} nach ${JL.takte} Takten, Präsenz Laub ${JL.praesenz[0]} · Blüte ${JL.praesenz[1]}): ${laub.length} Laub-Stufen, höchste Deckung ${(100 * dmax.d).toFixed(1)} % (${dmax.a ? dmax.a.id + " L" + dmax.a.lod : "–"}), ${JL.arten.length - laub.length} Nadel- und leere Stufen; Feld (Fernform gesetz) ${(JL.feld || []).map((f) => f.id + " " + (f.fehlt ? "–" : (100 * f.winter).toFixed(1) + " %")).join(" · ")}`
    );
    const rot = [...urteil(S, H), ...kalenderRot(KAL), ...jahrLaubRot(JL)];
    wandEnde(
        rot,
        "unter der Bühne dreht kein Schreiber das Wetter; frei gehen Uhr und Wetter nach dem Wort des Spielers, die Welt" +
            " wünscht nur, jeder Schreiber steht beim Namen."
    );
});
