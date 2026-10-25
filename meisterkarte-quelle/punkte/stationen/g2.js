// Stationen der Gruppe II (src/g2.js). Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst: jedes Kriterium mit Punkten am Kopf (tiere.K1 · tiere.K3 · oekologie.K5 · mensch.K2 · mensch.K3) und jedes der
// Messschuld M30–M43 (M40 mensch.K1 · M41 vegetation.K4 · M42 tiere.K3); kein Stau-Zweig kippt ein Kriterium der Gruppe II.
// Was sich nicht als Station fassen lässt, steht in `fehlt` (befehl: null, grund beim Namen) — die Liste der Stationen
// bleibt dadurch lauffähig (pruefeStationen verlangt je Eintrag ein argv).
"use strict";
const { jsonZeile } = require("../hilfe.cjs");

// die Zeile „  ✅|❌ <probe> {…}" der Kreatur-Linse (diag-kreatur-takt.cjs, padEnd 9)
const probeZeile = (stdout, probe) => jsonZeile(stdout, new RegExp("^\\s*(✅|❌) " + probe + "\\s"));

// R6 der Tier-Gesetze (Zweig tier-gesetz-k5): Kern, Kreatur-Stamm, Leben-Feld, Leib und die Kreatur-Linse
const KREATUR = [
    "tetrapoda-core.js",
    "stamm/kreatur-*.js",
    "stamm/feld-leben.js",
    "stamm/daten.js",
    "stamm/koerper-leib.js",
    "scripts/diag-kreatur-takt.cjs",
    "scripts/diag-kreatur-leben.cjs",
    "scripts/lib/kreatur-proben.cjs",
    "scripts/lib/welt-boot.cjs",
];

const stationen = [
    {
        kriterium: "mensch.K3",
        staffel: 1,
        geraet: "headless",
        // die Wege der Bewohner im Start-Dorf am echten Kreatur-Takt (Kontakt-Mechanik, Null-Renderer, R3; Präzedenz Siedlung K1)
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "bewohner"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = jsonZeile(lauf.stdout, /^\s*(✅|❌) bewohner\s/);
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const w = z.wege || {};
            const gruen = w.wandN === 0 && w.durch > 0 && w.tuer === w.durch && z.huellen === z.haeuser && z.haeuser > 0;
            return {
                gruen,
                zahl:
                    "Durchdringung " + w.wandN + ", Tür " + w.tuer + "/" + w.durch + ", Hüllen " + z.huellen + "/" +
                    z.haeuser + ", Gangzeit auf Wegen " + w.aufWeg,
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = 0 Durchdringung und Eintritt zu 100 % über die Tür im Start-Dorf",
    },
    {
        kriterium: "mensch.K2",
        staffel: 1,
        geraet: "headless",
        // der Tag der Bewohner im Zeitraffer der Spieler-Uhr (`_uhrSetzen`, 24 Spielstunden) am echten Bewohner-Takt — die
        // Tagesablauf-Mechanik (R3), gemessen wie M32 headless (bericht/2210-messschuld-6cfce.md § M32 K2). Strenger als die
        // Staffel: jeder Bewohner ≥ 0,9 (trefferMin, das Soll der Linse); das Schlupfloch Teleport fällt an sprungN, der
        // Plan muss bei gleichem Samen bit-gleich sein.
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "bewohner"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "bewohner");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const gruen =
                z.plan === true &&
                z.planGleich === true &&
                z.bewohner > 0 &&
                typeof z.trefferMin === "number" &&
                z.trefferMin >= 0.9 &&
                z.sprungN === 0;
            return {
                gruen,
                zahl:
                    "Soll-Orte über 24 Spielstunden min " + z.trefferMin + " (" + (z.bewohner - z.unterN) + "/" +
                    z.bewohner + " ≥ 0,9), Plan bit-gleich " + z.planGleich + ", Schmiede 10/2 Uhr " + z.schmiede10 +
                    "/" + z.schmiede2 + ", Sprünge " + z.sprungN,
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/bild-himmel.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = ein Bewohner trifft ≥ 0,9 seiner Soll-Orte über 24 Spielstunden",
    },
    {
        kriterium: "tiere.K1",
        staffel: 1,
        geraet: "headless",
        // (a) Kohäsion des Verbands am ECHTEN Wurf (`_kreaturWurf`, scheue Hirsche) wandernd und fliehend — Verband ist Mechanik
        // (R3: der Null-Renderer beweist Gesetz, Kontakt, Verband); die Probe herde der Kreatur-Linse (Q11), wie S6 (475a446a)
        // „bei jedem Push". Soll aus `messung`: wandernd ≥ 0,9, auf der Flucht ≥ 0,8; das Schlupfloch (klebende Glieder,
        // vakuöse Probe) fällt an Gliedern ≥ 3, Fluchtanteil ≥ 0,1, wandernd 0 Flucht.
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "herde"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "herde");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe herde (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const V = z.verband || {};
            const W = V.wander || {};
            const F = V.flucht || {};
            const echt = Math.min(W.n, F.n) >= 3 && F.fluchtAnteil >= 0.1 && W.fluchtAnteil === 0;
            const gruen = echt && W.mittel >= 0.9 && F.fluchtMittel !== null && F.fluchtMittel >= 0.8;
            return {
                gruen,
                zahl:
                    "Kohäsion wandernd " + W.mittel + " (" + W.n + " Glieder), fliehend " + F.fluchtMittel + " (min " +
                    F.fluchtMin + ", in Flucht " + F.fluchtAnteil + ")",
            };
        },
        pfad: [
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "tetrapoda-core.js",
            "gelaende-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = (a) Kohäsion an einem Gerät",
    },
    // ───────── tiere.K1 Staffel 2 — der Verband ganz (Zweig tiere-k1-s2, tetrapoda fluchtRadius: fernstes Glied + FURCHT_GESETZ.fluchtWegJeRadius Radien) ─────────
    // (a)–(d) der Probe herde am echten Kreatur-Takt (Null-Renderer, R3: Verband ist Mechanik; Port {PORT}+10000): (a) Kohäsion
    // wandernd ≥ 0,9, fliehend ≥ 0,8; (b) Φ = |Σv̂|/N der laufenden Glieder (ab 1 m/s) ≥ 0,8 über ≥ 60 Flucht-Takte; (c) der
    // letzte Flüchter läuft ≤ 1,0 s nach dem ersten, ≥ 1 Glied aus zweiter Hand; (d) 600 s neben einem fremden Verband derselben
    // Art, beide fliehen ≥ 3 s, die Glieder des Gesetzes bleiben dieselben Leiber; Schlupfloch: Glieder ≥ 3, Fluchtanteil ≥ 0,1,
    // Fluchtweg je Glied ≥ 30 m. Die Bild-Serie „Herde am Hang" (Ego auf 40 m, die Herde flieht als EIN Pulk im Bild beider
    // Geräte) hat kein Werkzeug: das Urteil bleibt ROT beim Namen, bis ein Schritt ihre Abnahme nach {AUS} schreibt.
    {
        kriterium: "tiere.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: ["bash", "-c", "KREATUR_TAKT_PORT=$(( {PORT} + 10000 )) node scripts/diag-kreatur-takt.cjs --proben herde"],
        gpu: true,
        minuten: 3,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "herde");
            if (!z || z.fehler || !z.alarm || !z.id)
                return { gruen: false, zahl: "keine Zeile (a)–(d) der Probe herde (Exit " + lauf.exit + (z && z.fehler ? ": " + z.fehler : "") + ")" };
            const { wander: W, flucht: F } = z.verband;
            const [R, K, I] = [z.ausrichtung, z.alarm, z.id];
            const echt = Math.min(W.n, F.n, z.fremdN, ...I.fluchtS) >= 3 && F.fluchtAnteil >= 0.1 && W.fluchtAnteil === 0 && K.zweiteHand >= 1;
            const ad =
                echt && W.mittel >= 0.9 && F.fluchtMittel >= 0.8 && R.takte >= 60 && R.mittel >= 0.8 && K.letzterS !== null &&
                K.letzterS <= 1 && z.fluchtWegM >= 30 && !I.bruch;
            return {
                gruen: false,
                zahl:
                    "(a)–(d) headless " + (ad ? "GRÜN" : "ROT") + ": Kohäsion " + W.mittel + " / " + F.fluchtMittel + ", Φ " + R.mittel +
                    " über " + R.takte + " Takte, letzter Flüchter " + K.letzterS + " s (" + K.zweiteHand + " aus zweiter Hand), Fluchtweg " +
                    z.fluchtWegM + " m, ID 600 s " + (I.bruch ? "bricht nach " + I.bruch[0] + " s" : "hält") + " (Flucht " + I.fluchtS.join(" / ") +
                    " s) · Bild-Serie „Herde am Hang“ ungemessen: kein Werkzeug",
            };
        },
        pfad: [
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "tetrapoda-core.js",
            "gelaende-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = (a)–(d) auf beiden Geräten mit der Bild-Serie „Herde am Hang“",
    },
    {
        kriterium: "tiere.K3",
        staffel: 1,
        geraet: "headless",
        // der Stand-Fuß gleitet nicht — Kontakt-Mechanik (R3), wie der Beleg die 1 frisch hält: gate:tier-gang, jede Gattung bei
        // v̂ 0,3 · 0,74 · 1,2 · 3,5 als Leib (auch unter Last) UND im Satz (jenseits `nahLeiber`: `_tierSatzGang`, gemessen am
        // Knochen-Puffer, wie der Knoten zeichnet — seit tiere-gang-tastgrad dort statt in der Probe tiersatz der Kreatur-Linse).
        // Gerichtet wird nur der Schlupf der Tiere (Staffel 1), nicht Mensch, Becken, Labor.
        befehl: ["node", "scripts/diag-tier-gang.cjs"],
        env: { TIER_GANG_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const zeilen = (re) =>
                String(lauf.stdout || "")
                    .split(/\r?\n/)
                    .map((l) => re.exec(l))
                    .filter(Boolean)
                    .map((m) => ({ seele: m[2], vh: m[3], schlupf: m[4] === "null" ? null : Number(m[4]) }));
            const tiere = zeilen(/^\s*(✅|❌) (\S+)\s+v̂ (\S+) \S+ m\/s(?: \(.*\))? · Hüfte \S+ m · Stand \S+ · Schlupf (\S+)\s*$/);
            const satz = zeilen(/^\s*(✅|❌) satz (\S+)\s+v̂ (\S+) \S+ m\/s · Band \S+ · Hüfte \S+ m · Stand \S+ · Schlupf (\S+)\s*$/);
            const [gL, gS] = [tiere, satz].map((a) => new Set(a.map((t) => t.seele)).size);
            const gleiten = [...tiere, ...satz.map((t) => ({ ...t, seele: "satz " + t.seele }))].filter(
                (t) => !(t.schlupf !== null && t.schlupf <= 0.05)
            );
            const max = (a) => a.reduce((m, t) => (t.schlupf === null ? m : Math.max(m, t.schlupf)), 0);
            const gruen = tiere.length >= 16 && gL >= 4 && satz.length >= 16 && gS >= 4 && gleiten.length === 0;
            return {
                gruen,
                zahl:
                    "Schlupf des Stand-Fußes max " + max(tiere) + " in " + tiere.length + " Läufen als Leib (" + gL +
                    " Gattungen), max " + max(satz) + " in " + satz.length + " im Satz (" + gS + " Gattungen)" +
                    (gleiten.length ? ", über 0,05: " + gleiten.map((t) => t.seele + " v̂ " + t.vh).join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/stoff-instanz.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "tetrapoda-core.js",
            "koerper-core.js",
            "gelaende-core.js",
            "scripts/diag-tier-gang.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = der Fuß steht (Schlupf ≤ 0,05)",
    },
    // ───────── tiere.K3#2 — der Gang aus Fr in Welt (Leib und Satz) und Labor, am Querhang, im Bild aus 10 m (tiere-gang-tastgrad) ─────────
    // Kern: gate:tier-gang — je Gattung bei v̂ 0,3 · 0,74 · 1,2 · 3,5 Fußfolge und Tastgrad im Band als Leib, im Satz (jenseits
    // `nahLeiber`, gemessen am Knochen-Puffer, wie der Knoten zeichnet) und im Labor; Welt − Labor und Satz − Labor ≤ 0,05 Zyklus
    // über die Phasen (das Aufsetzen je Fuß); die Kreuz-Probe Stimmung × Tempo im lateinischen Quadrat (die Welt-Zeilen tragen
    // Freude · Furcht · Trauer · Jagd), unter Last (30 fps, Raten-Leiter) der Schlupf — dazu gate:kreatur-takt querhang (Hang
    // 20–30° der Welt und Rampe 29,9°: Bein-Lot ≤ 10°, Schlupf ≤ 0,05). Bild: die Gang-Bühne (die vier Gattungen im Schritt
    // v̂ 0,5 nebeneinander auf dem Boden der Welt, der Loop ruht, der Lebenszyklus der Fauna hält — kein Hunger-Tod im Schuss)
    // aus 10 m im Profil; je Tier drei Füße am Boden (BUEHNE-Zeile,
    // derselbe Aufsetz-Punkt wie gate:tier-gang), jede Gattung im Bild (`--klasse '^tier:'`). Ports: save-server {PORT},
    // tier-gang {PORT}+10000, Werkbank {PORT}+20000, Kreatur-Linse {PORT}+30000.
    {
        kriterium: "tiere.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: [
            "bash",
            "-c",
            [
                "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"",
                "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
                "raeum() { for p in $(netstat -ano | grep -E \":($S|$W|$((W - 1))) .*(LISTEN|ABH)\" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }",
                "stand() { mkdir -p \"$B-stand\"; mv anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json \"$B-stand/\" 2> /dev/null; }",
                "ende() { node scripts/werkbank.cjs stop > /dev/null 2>&1; sleep 2; raeum; stand; }",
                "trap ende EXIT; trap 'exit 143' INT TERM",
                "raeum; stand",
                "TIER_GANG_PORT=$(( {PORT} + 10000 )) node scripts/diag-tier-gang.cjs; echo \"TIER-GANG EXIT=$?\"",
                "KREATUR_TAKT_PORT=$(( {PORT} + 30000 )) node scripts/diag-kreatur-takt.cjs --proben querhang; echo \"QUERHANG EXIT=$?\"",
                "(PORT=$S node save-server.js > \"$B-save.log\" 2>&1 &)",
                "for t in $(seq 1 30); do curl -s -o /dev/null -w '%{http_code}' http://localhost:$S/ 2> /dev/null | grep -q 200 && break; sleep 1; done",
                "(node scripts/werkbank.cjs start --echt --port $W --seite http://localhost:$S > \"$B-werkbank.log\" 2>&1 &)",
                "for t in $(seq 1 120); do grep -qE 'WERKBANK bereit|WERKBANK-FEHLER' \"$B-werkbank.log\" 2> /dev/null && break; sleep 5; done",
                "grep -E 'WERKBANK bereit' \"$B-werkbank.log\" || { echo 'WERKBANK startet nicht'; tail -5 \"$B-werkbank.log\"; exit 1; }",
                "node scripts/werkbank.cjs fenster 1920 1080 > /dev/null 2>&1",
                "erg() { node -e 'const t = require(\"fs\").readFileSync(0, \"utf8\"); console.log(JSON.stringify(JSON.parse(t.slice(t.indexOf(\"{\"))).ergebnis))'; }",
                "G=$(node scripts/werkbank.cjs eval 'const s = r.state, pm = s.playerMesh.position, h = (x, z) => r.getTerrainHeightAt(x, z), V = () => new window.THREE.Vector3(); r.setGameMode(\"pfad\"); for (const c of [...s.creatures, ...s.leichname]) r.removeCreature(c); s.renderer.setAnimationLoop(null); s.faunaLifecycle.lastTick = 1e12; const z0 = pm.z + 24; const tiere = [\"wolf\", \"fuchs\", \"baer\", \"wesen\"].map((seele, n) => { const x0 = pm.x - 5 + n * 3.4; s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4); const c = r.spawnCreatureAt(x0, h(x0, z0) + 0.3, z0, \"happy\", seele, { precise: true, bodySize: 1 }); c.userData.task = { name: \"wait\", args: {}, since: 0 }; c.userData.emotions = null; c.rotation.set(0, Math.PI / 2, 0); c.userData._animFade = 1; const tb = c.userData._tierBaum, T = tb.teile, P = [T.flP, T.frP, T.hlP, T.hrP]; r._tierBaumNeutralStance(c); c.updateMatrixWorld(true); const lokal = P.map((p) => { const w = V().setFromMatrixPosition(p.matrixWorld); w.y = c.position.y; return p.worldToLocal(w); }); const hl = V().setFromMatrixPosition(T.legHL.matrixWorld).y - c.position.y; const v = 0.5 * Math.sqrt(-s.gravity * tb.beinL * (c.scale.x || 1)); c.position.x = x0 - v * 4.3; for (let i = 0, t = 0; i < 258 + n * 7; i++) { c.position.x += v / 60; const y = h(c.position.x, c.position.z); c.position.y = y; c.userData._traegerY = y; c.userData._traegerStruktur = false; r._animateCompoundMotion(c, r._motionRolesForSoul(c.userData.soul), (t += 1 / 60), 0, true, null); } c.updateMatrixWorld(true); const amBoden = P.filter((p, j) => { const w = p.localToWorld(lokal[j].clone()); return w.y - h(w.x, w.z) <= 0.05 * hl; }).length; return { seele, x: +c.position.x.toFixed(1), art: tb._gang.art, amBoden }; }); const xc = tiere.reduce((a, t) => a + t.x, 0) / 4; return { tiere, kamera: [xc, h(xc, z0 - 10) + 2, z0 - 10, xc, h(xc, z0) + 0.5, z0].map((v) => +v.toFixed(2)) };' | erg); echo \"BUEHNE $G\"",
                "node scripts/werkbank.cjs bild $(node -e 'console.log(JSON.parse(process.argv[1]).kamera.join(\" \"))' \"$G\") --w 1920 --h 1080 --klasse '^tier:' --ziel gang --datei \"$B-gang.png\" > \"$B-bild.txt\" 2>&1",
                "echo \"BILD $(grep -o '\"abnahme\": \"[^\"]*\"' \"$B-bild.txt\")\"",
                "cp \"$B-gang.abnahme.json\" \"$A\"",
            ].join("\n"),
        ],
        gpu: true,
        minuten: 14,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const z = out.split(/\r?\n/);
            const gang = z.map((l) => /^\s*(✅|❌) Gangart (Welt|Satz|Labor) (\S+)/.exec(l)).filter(Boolean);
            const je = (wo) => gang.filter((m) => m[2] === wo);
            const gat = (wo) => new Set(je(wo).map((m) => m[3])).size;
            const kreuz = z.filter((l) => /^\s*✅ Gangart Welt \S+ \((Freude|Furcht|Trauer|Jagd)\)/.test(l)).length;
            const lab = z.filter((l) => /^\s*(✅|❌) Gangart Labor/.test(l) && /Welt − Labor/.test(l) && /Satz − Labor/.test(l));
            const ab = (wer) => Math.max(0, ...lab.map((l) => Number((new RegExp(wer + " − Labor (\\S+)").exec(l) || [])[1])));
            const kern =
                /TIER-GANG EXIT=0/.test(out) && gang.every((m) => m[1] === "✅") && ["Welt", "Satz", "Labor"].every((w) => je(w).length >= 16 && gat(w) >= 4) &&
                kreuz >= 16 && lab.length >= 16 && ab("Welt") <= 0.05 && ab("Satz") <= 0.05;
            const q = probeZeile(out, "querhang");
            const quer = !!q && !q.fehler && /^\s*✅ querhang\s/m.test(out) && q.hangGrad >= 20;
            const bu = jsonZeile(out, /^BUEHNE /);
            const T = (bu && bu.tiere) || [];
            const K = (j && j.klasse && j.klasse.klassen) || {};
            const px = ["wolf", "fuchs", "baer", "wesen"].map((s) => (K["tier:" + s] || {}).pixel || 0);
            const b = (j && j.bild) || {};
            const bild = T.length === 4 && T.every((t) => t.amBoden >= 3 && t.art === "schritt") && px.every((p) => p >= 400) && b.w === 1920 && b.h === 1080 && j.ok === true;
            return {
                gruen: kern && quer && bild,
                zahl:
                    "Gangart " + gang.filter((m) => m[1] === "✅").length + "/" + gang.length + " grün (Welt " + je("Welt").length + ", Satz " + je("Satz").length +
                    ", Labor " + je("Labor").length + ", Kreuz " + kreuz + "), Welt − Labor ≤ " + ab("Welt") + ", Satz − Labor ≤ " +
                    ab("Satz") + " Zyklus · Querhang " + (q ? (q.fehler ? "Fehler " + q.fehler : q.hangGrad + "°, Schlupf " + JSON.stringify(q.schlupf)) : "ohne Zeile") +
                    " · Bühne " + (T.length ? T.map((t) => t.seele + " " + t.art + " " + t.amBoden + " Füße").join(", ") : "ohne Zeile") + " · tier-Pixel " + px.join("/") +
                    " in " + b.w + "×" + b.h + ", " + ((j && j.zeile) || "ohne Abnahme-Zeile"),
            };
        },
        pfad: [
            ...KREATUR,
            "stamm/stoff-*.js",
            "stamm/bild-*.js",
            "stamm/gelaende-boden.js",
            "stamm/gelaende-kollision.js",
            "koerper-core.js",
            "gelaende-core.js",
            "worlds/tetrapoda/*",
            "save-server.js",
            "scripts/diag-tier-gang.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle:
            "2 = Fußfolge aus Fr für alle 4 Gattungen, Tastgrad im Band, Querhang 20°, Labor = Welt über die Phasen, Third-Bild aus 10 m",
    },
    {
        kriterium: "mensch.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M40 = M32 wiederholt (bericht/2210-messschuld-6cfce.md § M32, skripte/sitzung.sh + m32b-schritte.txt): EINE echte
        // Werkbank-Sitzung `--echt` gegen einen eigenen save-server, darin `diag-kreatur-takt --werkbank --proben bewohner`
        // (Quote, gegangene Menschen im Blick) und `platz-8.js` als `werkbank eval` (Third am Rand des Dorfplatzes, Uhr 8 als
        // Spieler-Wort, Loop 12 s, gezählt im Frustum der Spiel-Kamera, gezeichnet, Sichtlinie frei) mit dem Bild aus dem
        // Ausgabe-Pfad (`b64png.cjs` → <aus>-platz-8uhr-third.png). Ports: save-server {PORT}, Werkbank {PORT}+20000 (Seite −1).
        // platz-8.js und b64png.cjs leben im Koord-Baum (R6 sieht sie nicht; ihr Text steht hier per Pfad im Abdruck).
        befehl: [
            "bash",
            "-c",
            [
                "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"; SK=\"$(printf %s '{KOORD}' | tr '\\\\' /)/bericht/2210-messschuld-6cfce/skripte\"",
                "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
                "raeum() { for p in $(netstat -ano | grep -E \":($S|$W|$((W - 1))) .*(LISTEN|ABH)\" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }",
                "stand() { mkdir -p \"$B-stand\"; mv anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json \"$B-stand/\" 2> /dev/null; }",
                "ende() { node scripts/werkbank.cjs stop > /dev/null 2>&1; sleep 2; raeum; stand; }",
                "trap ende EXIT; trap 'exit 143' INT TERM",
                "raeum; stand",
                "(PORT=$S node save-server.js > \"$B-save.log\" 2>&1 &)",
                "for t in $(seq 1 30); do curl -s -o /dev/null -w '%{http_code}' http://localhost:$S/ 2> /dev/null | grep -q 200 && break; sleep 1; done",
                "(node scripts/werkbank.cjs start --echt --port $W --seite http://localhost:$S > \"$B-werkbank.log\" 2>&1 &)",
                "for t in $(seq 1 120); do grep -qE 'WERKBANK bereit|WERKBANK-FEHLER' \"$B-werkbank.log\" 2> /dev/null && break; sleep 5; done",
                "grep -E 'WERKBANK bereit' \"$B-werkbank.log\" || { echo 'WERKBANK startet nicht'; tail -5 \"$B-werkbank.log\"; exit 1; }",
                "node scripts/diag-kreatur-takt.cjs --werkbank $W --proben bewohner",
                "node scripts/werkbank.cjs eval \"$(cat \"$SK/platz-8.js\")\" > \"$B-platz.txt\"",
                "node \"$SK/b64png.cjs\" \"$B-platz.txt\" \"$B-platz-8uhr-third.png\"",
            ].join("\n"),
        ],
        gpu: true,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "bewohner");
            const p = jsonZeile(lauf.stdout, /^\{"uhr":/);
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner im Fenster (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            if (!p) return { gruen: false, zahl: "kein Platz-Bild um 8 Uhr (platz-8.js / b64png, Exit " + lauf.exit + ")" };
            if (p.fehler) return { gruen: false, zahl: "Platz-Bild: " + p.fehler };
            const ib = z.imBlick || {};
            const gruen =
                z.leiber > 0 &&
                typeof z.quote === "number" &&
                Math.abs(z.quote - 1) <= 0.05 &&
                z.leerN === 0 &&
                ib.ego >= 10 &&
                ib.third >= 10 &&
                p.imBild >= 10 &&
                p.sicht === "third";
            return {
                gruen,
                zahl:
                    "Quote " + z.leiber + "/" + z.sollSumme + " = " + z.quote + ", Häuser ohne Bewohner " + z.leerN +
                    ", gegangene im Blick " + ib.ego + " Ego / " + ib.third + " Third; Third-Bild 8 Uhr am Dorfplatz " +
                    p.imBild + " Menschen im Bild, " + p.gehendImBild + " gehend, " + p.fps + " fps",
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/stoff-instanz.js",
            "stamm/studio-bruecke.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "foundry-bruecke.js",
            "save-server.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Start-Dorf voll: Körper mit Menschen-Leib je Siedlung ÷ Σ leute = 1,0 ±0,05, ≥ 10 Menschen im Bild am Dorfplatz an einem Gerät",
    },
    {
        kriterium: "vegetation.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M41 = M24 wiederholt (bericht/2110-messschuld-radeon/m24-grund-bild.*): W9 aus dem Ausgabe-Bild, echter Renderer —
        // das Start-Dorf (erwacht in Raten) und das gesetzte Haus des Spielers, je Box des Körper-Satzes Halm- und Boden-Pixel,
        // das Büschel am Gesetz, die Gegenprobe vor der Tür. Gerichtet werden die Häuser des Start-Dorfs (Staffel 1); die
        // Phasen Waise/Ausstattung sind im Bild-Lauf blind und machen den Exit 1 (so auch M24) — das Urteil liest das JSON.
        // Eine Box ohne freies Auge (M24: haus_skandinavisch, haupt) steht beim Namen in der Zahl als ungemessen, nie als ROT
        // (wie M24: 26/27 gesehen, die blinde Box offen benannt); gesehen sein müssen ≥ 90 %. Halm- UND Boden-Pixel zählen wie
        // in M24 und im W9 der Linse: der Boden-Pixel ist der Grund IN der Box (grün = die Halm-Schicht des Boden-Stoffs; trägt
        // die Box eine Diele, jeder Grund durch sie) — 23.10. an 7c6f4b49 der Turm des haus_gotisch, Bild grund-41-0-turm-*.png.
        // Jede Box heißt beim Namen wie das Bild der Linse: Haus-Index/Box-Index (artifacts/haus-welt/grund-<i>-<j>-<art>-<v>.png).
        befehl: ["node", "scripts/diag-haus-welt.cjs", "--phasen=grund", "--bild"],
        env: { HAUS_WELT_PORT: "{PORT}", HAUS_WELT_PARALLEL: "1", HAUS_WELT_JSON: "{AUS}" },
        gpu: true,
        minuten: 6,
        urteil: (j) => {
            const w = j && j.w9;
            if (!w || !Array.isArray(w.haeuser)) return { gruen: false, zahl: "kein W9 im JSON der Linse (HAUS_WELT_JSON)" };
            if (!w.bild) return { gruen: false, zahl: "W9 ohne Bild (der Lauf fuhr nicht --bild)" };
            const dorf = w.haeuser.filter((h) => !h.spieler);
            const boxen = dorf.flatMap((h) => (h.koerper || []).map((b, jb) => ({ ...b, typ: h.typ, wo: w.haeuser.indexOf(h) + "-" + jb })));
            const name = (b) => b.typ + " " + b.wo + " " + b.art;
            const gesehen = boxen.filter((b) => b.blicke > 0);
            const blind = boxen.filter((b) => !(b.blicke > 0));
            const halm = gesehen.filter((b) => b.halm > 0 || b.boden > 0);
            const bueschel = boxen.filter((b) => b.bueschel > 0);
            const gegen = Math.max(0, ...w.haeuser.map((h) => h.gegenprobe || 0));
            const gruen =
                dorf.length >= 10 &&
                gesehen.length >= Math.ceil(0.9 * boxen.length) &&
                halm.length === 0 &&
                bueschel.length === 0 &&
                gegen > 0;
            const sum = (f) => gesehen.reduce((a, b) => a + (b[f] || 0), 0);
            return {
                gruen,
                zahl:
                    dorf.length + " Häuser des Start-Dorfs, " + gesehen.length + "/" + boxen.length + " Boxen im Bild: Halm " +
                    sum("halm") + " px, Boden " + sum("boden") + " px, Büschel am Gesetz " + bueschel.length +
                    " Boxen; Gegenprobe " + gegen + " px" +
                    (halm.length ? "; Halm/Boden in " + halm.map((b) => name(b) + " " + (b.halm || 0) + "/" + (b.boden || 0) + " px").join(" · ") : "") +
                    (bueschel.length ? "; Büschel in " + bueschel.map((b) => name(b) + " " + b.bueschel).join(" · ") : "") +
                    (blind.length ? "; ungemessen (ohne freies Auge) " + blind.map(name).join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/vegetation-*.js",
            "stamm/siedlung-*.js",
            "stamm/gelaende-*.js",
            "stamm/stoff-*.js",
            "stamm/bild-*.js",
            "stamm/daten.js",
            "fachwerk-core.js",
            "foundry-bruecke.js",
            "phyto-core.js",
            "gelaende-core.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = Halm- und Büschel-Pixel 0 in jeder Haus-Box des Start-Dorfs an einem Gerät",
    },

    // ───────── oekologie.K3 — EIN Furcht-Gesetz (Zweig tier-gesetz-k5, tetrapoda FURCHT_GESETZ) ─────────
    // Probe furcht der Kreatur-Linse (Null-Renderer, R3: sie misst ein Gesetz): je Rolle 4 Orte, das Tier reist über
    // `_serializeCreature` → `_restoreCreatureFromSnapshot` (Speichern), dann geht der Spieler auf es zu; Schlag und Gabe über
    // die Chokepoints damageCreature (source player) und activateCreatureConsumable. Staffel 2 dazu (z.ort): ein Riss in der
    // Zelle der Herde gegen den Gegenlauf mit Feld-Furcht 0. An main fehlt die Probe (ROT „keine Zeile").
    ...[1, 2].map((staffel) => ({
        kriterium: "oekologie.K3",
        staffel,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "furcht"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "furcht");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe furcht (Exit " + lauf.exit + ")" };
            if (z.fehler || !z.erinnert || !z.ort) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne erinnert/ort") };
            const { kontrolle: K, geschlagen: G, gefuettert: F } = z.erinnert;
            const O = z.ort;
            const wesen =
                [...G.erinnerungen, ...F.erinnerungen].every((n) => n >= 1) &&
                K.medianM >= 5 &&
                G.medianM >= 2 * K.medianM &&
                F.medianM <= 0.5 * K.medianM &&
                F.naeherM >= 2;
            const ort = O.gegenlauf >= 0.2 && O.aufenthalt <= 0.5 * O.gegenlauf;
            return {
                gruen: wesen && (staffel === 1 || ort),
                zahl:
                    "geschlagen " + G.medianM + " m gegen Kontrolle " + K.medianM + " m · gefüttert " + F.medianM + " m, selbst " +
                    F.naeherM + " m näher · Gedächtnis nach dem Laden " + G.erinnerungen + " / " + F.erinnerungen +
                    " · Riss-Zelle Aufenthalt " + O.aufenthalt + " gegen Gegenlauf " + O.gegenlauf,
            };
        },
        pfad: [...KREATUR],
        quelle:
            staffel === 1
                ? "1 = ein Wesen, das der Spieler schlug, hält bei der nächsten Begegnung Abstand (Median ≥ 2× ein Kontroll-Wesen), ein gefüttertes nähert sich, ohne Modell, über Speichern"
                : "2 = dazu deponiert ein Riss Furcht am Ort, und die Herde meidet die Zelle (Aufenthalt −50 % gegen den Gegenlauf)",
    })),

    // ───────── tiere.K2 — der Jagd-Kreislauf (Zweig tier-gesetz-k5, tetrapoda JAGD_GESETZ) ─────────
    // Probe jagdkreis (A) je Jagd: die Beute trägt die HP aus dem Leib-Gesetz (Hirsch 168, Kitz 60), drei Szenen — 1 Wolf und
    // 4 Wölfe gegen den gesunden Hirsch, das Rudel gegen das Kitz — mit dem Band nach MacNulty (Schlupfloch hp 1e6 / HP 1:
    // das Band hat ein Oben und ein Unten, hp0 ≥ 100 verlangt den Leib). An main zählt die Probe Riss je Ort (ROT „ohne quote").
    {
        kriterium: "tiere.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "jagdkreis"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "jagdkreis");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe jagdkreis (Exit " + lauf.exit + ")" };
            const Q = z.riss && z.riss.quote;
            if (z.fehler || !Q) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne riss.quote") };
            const band = { einWolf: [0, 0.1], rudel: [0.2, 0.4], kitz: [0.6, 1] };
            const je = Object.entries(band).map(([sz, [lo, hi]]) => {
                const q = Q[sz] || {};
                const v = q.jagden ? q.risse / q.jagden : null;
                return { sz, ok: q.jagden >= 10 && v != null && v >= lo && v <= hi, t: sz + " " + q.risse + "/" + q.jagden + " (HP " + q.hp0 + ")" };
            });
            const hp = Q.rudel && Q.rudel.hp0 >= 100;
            return {
                gruen: je.every((x) => x.ok) && hp && z.riss.rissS != null,
                zahl: "Riss je Jagd " + je.map((x) => (x.ok ? "" : "✗ ") + x.t).join(" · ") + " · erster Riss " + z.riss.rissS + " s",
            };
        },
        pfad: [...KREATUR],
        quelle: "1 = Hetze und Riss mit HP aus dem Leib-Gesetz, Quote im Band über ≥ 10 Seeds",
    },

    // ───────── tiere.K4 — Lebensraum (Zweig tier-gesetz-k5, tetrapoda LEBENSRAUM_GESETZ) ─────────
    // Probe lebensraum: neun Orte (Raster 300 m) je 25 natürliche Geburten, je Tier die Boden-Klasse am Ort gegen die Gattung;
    // die Gegenprobe in einer importierten Welt anderer Saat (lebensraum-gegen). Schlupfloch Hand-Setzen: Saat-Wechsel. An
    // main fehlt die Probe (ROT „keine Zeile").
    {
        kriterium: "tiere.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "lebensraum"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "lebensraum");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe lebensraum (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const g = z.gegen || {};
            const gruen =
                z.n >= 150 && Object.keys(z.gattung || {}).length >= 3 && z.anteil >= 0.9 &&
                !g.fehler && g.n >= 150 && g.anteil >= 0.9 && !!g.saat && g.saat !== z.saat;
            return {
                gruen,
                zahl:
                    "im Lebensraum " + z.drin + "/" + z.n + " = " + z.anteil + " (Saat " + z.saat + ", " + JSON.stringify(z.gattung) + ") · Gegenprobe " +
                    (g.fehler ? g.fehler : g.drin + "/" + g.n + " = " + g.anteil + " (Saat " + g.saat + ")"),
            };
        },
        pfad: [
            ...KREATUR,
            "gelaende-core.js",
            "phyto-core.js",
            "stamm/gelaende-boden.js",
            "stamm/vegetation-wiese.js",
            "stamm/wasser-hydro.js",
            "spec/pruefbuehne/welt.json",
        ],
        quelle: "1 = ≥ 0,9 der Geburten in der Boden-Klasse der Gattung, mit Gegenprobe bei anderem Seed",
    },

    // ───────── tiere.K4 Staffel 2 — der Tag (Zweig tiere-k2k4, tetrapoda ETHOGRAMM_GESETZ) ─────────
    // Probe tagesbudget: je Gattung drei Tiere am Ufer, 12 Spielstunden der Spieler-Uhr eingelaufen, 24 gemessen — das Budget
    // ruhen · nahrung · ziehen gegen das Ethogramm (±20 %; was die Gattung nicht tut, ≤ 0,01), jedes Tier trinkt am Wasser, der
    // Gegenlauf „Durst aus“ trinkt 0, die Ruhe steht (< 3 % bewegt); Probe lebensraum: je Wurf der Bär am Fluss gegen abseits in
    // zwei Saaten (Schlupfloch Zeitplan: das Budget kommt aus den Pegeln, die Täter alte Uhr und leerer Ruhe-Pegel sind ROT). An
    // main fehlt die Probe tagesbudget (ROT „keine Zeile“).
    {
        kriterium: "tiere.K4",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "lebensraum,tagesbudget"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const t = probeZeile(lauf.stdout, "tagesbudget");
            const l = probeZeile(lauf.stdout, "lebensraum");
            if (!t || !l) return { gruen: false, zahl: "keine Zeile der Probe " + (t ? "lebensraum" : "tagesbudget") + " (Exit " + lauf.exit + ")" };
            if (t.fehler || l.fehler || !l.baer) return { gruen: false, zahl: "Probe-Fehler: " + (t.fehler || l.fehler || "ohne baer") };
            const je = Object.entries(t.soll || {}).flatMap(([g, S]) =>
                Object.entries(S).map(([k, v]) => {
                    const ist = t.budget[g][k];
                    return { ok: v > 0 ? Math.abs(ist / v - 1) <= 0.2 : ist <= 0.01, t: g + " " + k + " " + ist + "/" + v };
                })
            );
            const tr = t.truenke || [];
            const durst = tr.length >= 12 && tr.every((n) => n >= 1) && t.amWasser === tr.reduce((a, b) => a + b, 0) && t.durstAus === 0;
            const ruhe = t.ruhe[0] >= 1000 && t.ruhe[1] < 0.03 * t.ruhe[0];
            const gb = (l.gegen && l.gegen.baer) || { fluss: [0, 0], sonst: [0, 0] };
            const [F, N] = ["fluss", "sonst"].map((k) => [l.baer[k][0] + gb[k][0], l.baer[k][1] + gb[k][1]]);
            const baer = F[0] >= 10 && N[0] >= 10 && F[1] > 0 && F[1] / F[0] >= (2 * N[1]) / N[0];
            return {
                gruen: je.length >= 12 && je.every((x) => x.ok) && durst && ruhe && baer,
                zahl:
                    "Budget " + je.map((x) => (x.ok ? "" : "✗ ") + x.t).join(" · ") + " · Trünke " + tr.join(",") + " (am Wasser " +
                    t.amWasser + ", Durst aus " + t.durstAus + ") · Ruhe bewegt " + t.ruhe[1] + "/" + t.ruhe[0] + " · Bär am Fluss " +
                    F[1] + "/" + F[0] + " Würfe, abseits " + N[1] + "/" + N[0],
            };
        },
        pfad: [
            ...KREATUR,
            "gelaende-core.js",
            "phyto-core.js",
            "stamm/gelaende-boden.js",
            "stamm/wasser-hydro.js",
            "stamm/bild-himmel.js",
            "spec/pruefbuehne/welt.json",
        ],
        quelle: "2 = dazu das Tages-Budget je Gattung ±20 % am Ethogramm, Trinken aus Durst (Mutante „Durst aus“ → 0), am Fluss Bären-Sichtung ≥ 2× wahrscheinlicher",
    },

    // ───────── tiere.K2 Staffel 2 — das Mahl und das Wolfsrevier im Bild (Zweig tiere-k2k4) ─────────
    // (1) das Mahl headless wie tiere.K2#1 (`diag-kreatur-takt --proben jagdkreis`, Port {PORT}+10000): nach dem ersten Riss des Rudels
    // am gesunden Hirsch frisst es ≥ 60 s der 120 s (z.riss.fressS), Fuchs oder Bär sind ≤ 120 s am Aas (gaeste[].kommtS) — im
    // Fenster der Werkbank misst die Probe ihren Sprinter am Spieler des Fensters (Sprint 7,88 m/s), darum nicht dort; (2) EINE
    // Werkbank-Sitzung `--echt` gegen einen eigenen save-server, das Wolfsrevier: der nächste Ort der Boden-Klasse wald 50–400 m
    // um den Spieler, der Spieler 30 m daneben (`umstellen`), vier Wölfe als Verband reißen am echten Takt ein Kitz und fressen
    // (≥ 2), geschossen aus dem Ausgabe-Pfad 8 m vor dem Riss, 2,2 m hoch, 1920×1080: die Wölfe im Bild (Klasse tier:wolf ≥ 800 px —
    // vier Sichtungen zu 200 px), die Abnahme GRÜN. Ports: save-server {PORT}, Werkbank {PORT}+20000.
    {
        kriterium: "tiere.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: [
            "bash",
            "-c",
            [
                "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"",
                "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
                "raeum() { for p in $(netstat -ano | grep -E \":($S|$W|$((W - 1))) .*(LISTEN|ABH)\" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }",
                "stand() { mkdir -p \"$B-stand\"; mv anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json \"$B-stand/\" 2> /dev/null; }",
                "ende() { node scripts/werkbank.cjs stop > /dev/null 2>&1; sleep 2; raeum; stand; }",
                "trap ende EXIT; trap 'exit 143' INT TERM",
                "raeum; stand",
                "KREATUR_TAKT_PORT=$(( {PORT} + 10000 )) node scripts/diag-kreatur-takt.cjs --proben jagdkreis",
                "(PORT=$S node save-server.js > \"$B-save.log\" 2>&1 &)",
                "for t in $(seq 1 30); do curl -s -o /dev/null -w '%{http_code}' http://localhost:$S/ 2> /dev/null | grep -q 200 && break; sleep 1; done",
                "(node scripts/werkbank.cjs start --echt --port $W --seite http://localhost:$S > \"$B-werkbank.log\" 2>&1 &)",
                "for t in $(seq 1 120); do grep -qE 'WERKBANK bereit|WERKBANK-FEHLER' \"$B-werkbank.log\" 2> /dev/null && break; sleep 5; done",
                "grep -E 'WERKBANK bereit' \"$B-werkbank.log\" || { echo 'WERKBANK startet nicht'; tail -5 \"$B-werkbank.log\"; exit 1; }",
                "node scripts/werkbank.cjs fenster 1920 1080 > /dev/null 2>&1",
                "erg() { node -e 'const t = require(\"fs\").readFileSync(0, \"utf8\"); console.log(JSON.stringify(JSON.parse(t.slice(t.indexOf(\"{\"))).ergebnis))'; }",
                "O=$(node scripts/werkbank.cjs eval 'const pm = r.state.playerMesh.position; let O = null; for (let ring = 2; ring <= 16 && !O; ring++) for (let q = 0, n = ring * 6; q < n && !O; q++) { const a = (q / n) * 2 * Math.PI, x = pm.x + Math.cos(a) * ring * 25, z = pm.z + Math.sin(a) * ring * 25; if (r._landAt(x, z) && r._bodenKlasseAt(x, z) === \"wald\" && r._bodenKlasseAt(x + 30, z) !== \"fluss\" && r._kreaturGrundFrei(x, z) && r._kreaturGrundFrei(x + 30, z)) O = [+x.toFixed(1), +z.toFixed(1)]; } return O;' | erg); echo \"ORT $O\"",
                "node scripts/werkbank.cjs umstellen $(node -e 'const o = JSON.parse(process.argv[1]); console.log(o[0] + 30, o[1])' \"$O\") > \"$B-umstellen.txt\" 2>&1",
                "R=$(node scripts/werkbank.cjs eval 'const s = r.state, pm = s.playerMesh.position; r.setGameMode(\"pfad\"); const O = { x: pm.x - 30, z: pm.z }; for (const c of [...s.creatures, ...s.leichname]) r.removeCreature(c); const neu = (x, z, seele, gr) => { const c = r.spawnCreatureAt(x, r.getTerrainHeightAt(x, z) + 0.5, z, \"happy\", seele, { precise: true, bodySize: gr }); c.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 }; return c; }; const kitz = neu(O.x, O.z, \"wesen\", 0.6); const W = [0, 1, 2, 3].map((i) => neu(O.x + Math.cos(Math.PI + (i - 1.5) * 0.5) * 25, O.z + Math.sin(Math.PI + (i - 1.5) * 0.5) * 25, \"wolf\", 1)); r._kreaturVerbinden(W); let rissS = null, k = 0; const frisst = () => W.filter((c) => c.userData._motionZustand === \"fressen\").length; for (; k < 7200 && (rissS === null || (frisst() < 3 && k / 60 < rissS + 20)); k++) { r._kreaturStossSchritt(1 / 60); r._leibKontakte(); r.updateCreatures(1 / 60); if (rissS === null && s.leichname.includes(kitz)) rissS = +(k / 60).toFixed(1); } const fressen = frisst(); const nah = W.filter((c) => Math.hypot(c.position.x - kitz.position.x, c.position.z - kitz.position.z) < 4).length; const K = kitz.position, d = Math.hypot(pm.x - K.x, pm.z - K.z) || 1, ax = K.x + ((pm.x - K.x) / d) * 8, az = K.z + ((pm.z - K.z) / d) * 8; return { ort: r._bodenKlasseAt(O.x, O.z), kamera: [ax, r.getTerrainHeightAt(ax, az) + 2.2, az, K.x, K.y + 0.4, K.z].map((v) => +v.toFixed(2)), klasse: r._bodenKlasseAt(kitz.position.x, kitz.position.z), rissS, fressen, nah, woelfe: W.length };' | erg); echo \"REVIER $R\"",
                "node scripts/werkbank.cjs bild $(node -e 'console.log(JSON.parse(process.argv[1]).kamera.join(\" \"))' \"$R\") --w 1920 --h 1080 --klasse '^tier:' --ziel Riss --datei \"$B-wolfsrevier.png\" > \"$B-bild.txt\" 2>&1",
                "echo \"BILD $(grep -o '\"abnahme\": \"[^\"]*\"' \"$B-bild.txt\")\"",
                "cp \"$B-wolfsrevier.abnahme.json\" \"$A\"",
            ].join("\n"),
        ],
        gpu: true,
        minuten: 12,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "jagdkreis");
            const R = z && z.riss;
            if (!R || z.fehler) return { gruen: false, zahl: "keine Zeile der Probe jagdkreis (Exit " + lauf.exit + (z && z.fehler ? ": " + z.fehler : "") + ")" };
            const rv = jsonZeile(lauf.stdout, /^REVIER /);
            const w = j && j.klasse && (j.klasse.klassen || {})["tier:wolf"];
            const b = (j && j.bild) || {};
            const gaeste = (R.gaeste || []).map((G) => G.seele + " " + G.kommtS + " s");
            const mahl = R.rissS != null && R.fressS >= 60 && (R.gaeste || []).some((G) => G.kommtS != null && G.kommtS <= 120);
            const bild = !!rv && rv.ort === "wald" && rv.rissS != null && rv.fressen >= 2 && !!w && w.pixel >= 800 && b.w === 1920 && b.h === 1080 && j.ok === true;
            return {
                gruen: mahl && bild,
                zahl:
                    "Fressen " + R.fressS + " s nach dem Riss bei " + R.rissS + " s, am Aas " + gaeste.join(", ") + " · Wolfsrevier " +
                    (rv ? rv.ort + ", Riss " + rv.rissS + " s, " + rv.fressen + " fressen" : "ohne REVIER-Zeile") + ": tier:wolf " +
                    (w ? w.pixel : 0) + " px in " + b.w + "×" + b.h + ", " + ((j && j.zeile) || "ohne Abnahme-Zeile"),
            };
        },
        pfad: [
            ...KREATUR,
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/vegetation-*.js",
            "stamm/gelaende-boden.js",
            "gelaende-core.js",
            "phyto-core.js",
            "save-server.js",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = dazu Fressen ≥ 60 s, der Kadaver lockt Fuchs oder Bär ≤ 120 s, Station Wolfsrevier im Bild beider Geräte",
    },

    // ───────── affekt.K1 — die Wertung antwortet am Ort (affekt-k1-ort) ─────────
    {
        kriterium: "affekt.K1",
        staffel: 1,
        geraet: "headless",
        // gate:weltakt-wache (T) an der Mess-Wiese, Null-Renderer, der Leib steht — 10× „pflege das land" je 30 s Spielzeit über den
        // echten Weg (processChatCommand → dslEval → _tatWerten), δ aus der Situation (`_playerSituationWohl`), die Antwort im
        // Vogel-Chor der Lage, die der Ausgabe-Pfad abtastet, gegen 32 m daneben; die gestempelte Freude trägt 0 (Schlupfloch)
        befehl: ["node", "scripts/diag-weltakt-wache.cjs"],
        env: { WELTAKT_WACHE_PORT: "{PORT}" },
        gpu: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const z = jsonZeile(lauf.stdout, /^\s*(✅|❌) tat-k1 \{/);
            if (!z || !Array.isArray(z.delta) || !z.delta.length || !Array.isArray(z.antwortDb))
                return { gruen: false, zahl: "keine Zeile tat-k1 (Exit " + lauf.exit + ")" };
            const [d1, dn] = [z.delta[0], z.delta[z.delta.length - 1]];
            const st = z.stempel || {};
            const gruen = z.gruen === true && d1 > 0 && Math.abs(dn) <= 0.3 * d1 && z.antwortDb[0] > 0 && z.nachbarDb <= 0.5 && !st.delta && !st.antwort;
            return {
                gruen,
                zahl:
                    "δ Tat 1 " + d1 + " → Tat " + z.delta.length + " " + dn + " (" + (Math.abs(dn) / d1).toFixed(3) + " ≤ 0,3), Vogel-Chor am Ort " +
                    z.antwortDb[0] + " dB, Nachbar " + z.nachbarDb + " dB, Stempel " + st.delta + "/" + st.antwort,
            };
        },
        pfad: ["stamm/feld-sprache.js", "stamm/feld-dsl.js", "stamm/feld-leben.js", "stamm/klang.js", "klang-core.js",
            "stamm/dirigent-takt.js", "scripts/diag-weltakt-wache.cjs", "scripts/lib/welt-boot.cjs", "scripts/lib/ausgabe-aufnahme.cjs"],
        quelle: "1 = Gewöhnung (δ von Tat 10 ≤ 0,3 × Tat 1) und Antwort am Ort (ΔE ≥ 2 am Ort der Tat gegen die Nachbarzelle, oder ein Klang-Parameter am Ort) an einer Pose",
    },

    // ───────── oekologie.K2 / K1 / K5 — Zweig oeko-bestand-k2 (tetrapoda BESTAND_GESETZ, UMWEG_GESETZ) ─────────
    // Proben der Kreatur-Linse (Null-Renderer, R3: sie messen ein Gesetz). bestand und kaskade: der echte Lebenszyklus
    // (tickFaunaLifecycle) im Zeitraffer an EINEM Ort, die Bühne leer, der Spieler ruhig; folgen: „folge mir“ über die
    // Chat-DSL, der Spieler geht 10 min mit W im echten Sim-Schritt um Wand und gedrehtes Haus, über einen Sockel. An main
    // fehlen die Proben (ROT „keine Zeile“).
    {
        kriterium: "oekologie.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "bestand"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "bestand");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bestand (Exit " + lauf.exit + ")" };
            if (z.fehler || !z.voll || !z.halb) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne voll/halb") };
            const { voll: V, halb: H } = z;
            const gruen =
                V.bestand >= 4 && H.bestand <= 0.7 * V.bestand && V.hunger <= 0.7 * V.bestand && V.tode[1] >= 1 && z.kappe === 0;
            return {
                gruen,
                zahl:
                    "Bestand voll " + V.bestand + " · halbe Nahrung " + H.bestand + " · nach dem Halbieren " + V.hunger +
                    " mit " + V.tode[1] + " Hungertoden · Takte an der Kappe " + z.kappe,
            };
        },
        pfad: [...KREATUR],
        quelle: "1 = Geburt und Tod folgen der Nahrung an einem Ort (Mutante Nahrung halbiert → Bestand fällt)",
    },
    {
        kriterium: "oekologie.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "kaskade"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "kaskade");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe kaskade (Exit " + lauf.exit + ")" };
            if (z.fehler || !Array.isArray(z.saaten)) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne saaten") };
            const paare = z.saaten.flatMap((je) => Object.values(je));
            const da = paare.filter(([a]) => a >= 1);
            const bruch = paare.filter(([a, e]) => (a >= 1 ? !(e >= a / 3 && e <= 3 * a) : e > 3));
            const q = da.map(([a, e]) => e / a);
            return {
                gruen: z.saaten.length >= 8 && da.length >= 16 && !bruch.length && z.kappe === 0,
                zahl:
                    z.saaten.length + " Saaten · " + da.length + " ansässige Bestände · Stunde 8 gegen 2: " +
                    (q.length ? Math.min(...q).toFixed(2) + "–" + Math.max(...q).toFixed(2) + "×" : "–") + " · außer Band " +
                    bruch.length + " · Takte an der Kappe " + z.kappe,
            };
        },
        pfad: [...KREATUR],
        quelle: "1 = jede Art bleibt in [⅓×, 3×] des Starts, ohne Aussterben und ohne Ausbruch, über ≥ 8 Seeds",
    },
    {
        kriterium: "oekologie.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "folgen"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "folgen");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe folgen (Exit " + lauf.exit + ")" };
            if (z.fehler || !z.hindernisse) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne hindernisse") };
            const W = z.hindernisse.filter((h) => h.art !== "sockel");
            const S = z.hindernisse.find((h) => h.art === "sockel") || {};
            const halt =
                W.length >= 3 && W.every((h) => h.kontakt > 0 && h.drin === 0 && h.quer === 0 && h.vornMinM > 0) &&
                S.ueber >= 30 && !S.imSockel;
            const gruen =
                z.bindung[0] > 0 && z.bindung[1] > z.bindung[0] && z.proben >= 600 && z.aufgabe === z.proben &&
                z.abstand.p95 <= 10 && halt && z.gegenlauf.abstandM >= 30;
            return {
                gruen,
                zahl:
                    z.proben + " s gebunden (bond " + z.bindung.join(" → ") + "): Abstand p50 " + z.abstand.p50 + " · p95 " +
                    z.abstand.p95 + " · max " + z.abstand.max + " m · " + W.length + " Wände ohne Durchdringung, Sockel " +
                    S.ueber + " Takte darüber · Hang > 15° " + z.steilS + " s, nass " + z.nassS + " s · ungebunden " +
                    z.gegenlauf.abstandM + " m",
            };
        },
        pfad: [
            ...KREATUR,
            "stamm/koerper-bewegung.js",
            "stamm/gelaende-kollision.js",
            "stamm/feld-sprache.js",
            "stamm/feld-dsl.js",
        ],
        quelle: "1 = ein gebundenes Tier folgt ≥ 10 min über Hindernisse",
    },

    // ───────── mensch.K2 Staffel 2 — die Ankunft der Bewohner (mensch-bewohner-k5 1e4e725a) ─────────
    {
    kriterium: "mensch.K2",
    staffel: 2,
    geraet: ["radeon", "gtx"],
    // die Ankunft (`_bewohnerAnkunft`, mensch-bewohner-k5) im Fenster der echten GPU, wie M40: EINE Werkbank-Sitzung `--echt`
    // gegen einen eigenen save-server, darin `diag-kreatur-takt --werkbank --proben bewohner` — alle Bewohner des Start-Dorfs
    // über 24 Spielstunden je ≥ 0,9 ihrer Soll-Orte (unterN 0), 4–10 Wege je Bewohner und Tag, und je 1,5 h die Lage, die sah,
    // wer blieb, gegen die, die findet, wer 1 h fort war (16 Prüf-Stunden, die Liste neu, die Uhr gesprungen): jeder ±2 m.
    // Das Schlupfloch Teleport fällt an sprungN, der Plan bit-gleich je Same. Ports: save-server {PORT}, Werkbank {PORT}+20000.
    befehl: [
        "bash",
        "-c",
        [
            "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"",
            "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
            "raeum() { for p in $(netstat -ano | grep -E \":($S|$W|$((W - 1))) .*(LISTEN|ABH)\" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }",
            "stand() { mkdir -p \"$B-stand\"; mv anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json \"$B-stand/\" 2> /dev/null; }",
            "ende() { node scripts/werkbank.cjs stop > /dev/null 2>&1; sleep 2; raeum; stand; }",
            "trap ende EXIT; trap 'exit 143' INT TERM",
            "raeum; stand",
            "(PORT=$S node save-server.js > \"$B-save.log\" 2>&1 &)",
            "for t in $(seq 1 30); do curl -s -o /dev/null -w '%{http_code}' http://localhost:$S/ 2> /dev/null | grep -q 200 && break; sleep 1; done",
            "(node scripts/werkbank.cjs start --echt --port $W --seite http://localhost:$S > \"$B-werkbank.log\" 2>&1 &)",
            "for t in $(seq 1 120); do grep -qE 'WERKBANK bereit|WERKBANK-FEHLER' \"$B-werkbank.log\" 2> /dev/null && break; sleep 5; done",
            "grep -E 'WERKBANK bereit' \"$B-werkbank.log\" || { echo 'WERKBANK startet nicht'; tail -5 \"$B-werkbank.log\"; exit 1; }",
            "node scripts/diag-kreatur-takt.cjs --werkbank $W --proben bewohner",
        ].join("\n"),
    ],
    gpu: true,
    minuten: 10,
    urteil: (j, lauf) => {
        const z = probeZeile(lauf.stdout, "bewohner");
        if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner im Fenster (Exit " + lauf.exit + ")" };
        if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
        const w = z.wege || {};
        const k = z.wiederkehr || {};
        const alle = z.bewohner > 0 && z.unterN === 0 && typeof z.trefferMin === "number" && z.trefferMin >= 0.9;
        const wege = w.ausserN === 0 && w.wegeMin >= 4 && w.wegeMax <= 10;
        const zurueck = k.n >= z.bewohner && k.ueberN === 0 && k.maxM <= 2;
        const gruen = z.plan === true && z.planGleich === true && z.sprungN === 0 && alle && wege && zurueck;
        return {
            gruen,
            zahl:
                "Soll-Orte alle " + (z.bewohner - z.unterN) + "/" + z.bewohner + " ≥ 0,9 (min " + z.trefferMin +
                "), Wege je Tag " + w.wegeMin + "–" + w.wegeMax + " (außer 4–10: " + w.ausserN + "), Wiederkehr nach 1 h " +
                k.ueberN + " von " + k.n + " Lagen über ±2 m (max " + k.maxM + " m), Sprünge " + z.sprungN +
                ", Plan bit-gleich " + z.planGleich,
        };
    },
    pfad: [
        "stamm/siedlung-*.js",
        "stamm/kreatur-*.js",
        "stamm/koerper-*.js",
        "stamm/stoff-instanz.js",
        "stamm/studio-bruecke.js",
        "stamm/gelaende-kollision.js",
        "stamm/bild-himmel.js",
        "stamm/daten.js",
        "koerper-core.js",
        "fachwerk-core.js",
        "foundry-bruecke.js",
        "save-server.js",
        "scripts/diag-kreatur-takt.cjs",
        "scripts/werkbank.cjs",
        "scripts/lib/kreatur-proben.cjs",
        "scripts/lib/software-gpu.cjs",
        "scripts/lib/welt-boot.cjs",
    ],
    quelle: "2 = alle Bewohner einer Siedlung, 4–10 Wege am Tag, Wiederkehr nach 1 h Abwesenheit auf ±2 m",
    },
];

// Nicht als Station fassbar (heute): je Kriterium und Staffel der Grund beim Namen. Sie tragen keine Punkte der Maschine;
// was hier steht, bucht weiter die Hand oder bleibt 0, bis das Werkzeug steht.
const fehlt = [
    {
        kriterium: "oekologie.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Mechanik und Werkzeug fehlen: der Spieler ist Ziel einer Jagd nur in jagd.radius 12 m (_creatureHuntDrive), die Witterung " +
            "(_creatureScentHuntDir) liest nur Tiere — ein Rudel aus der Geburt (≥ 130 m, Leine am Geburtsort) wird nicht zum Spieler gezogen; " +
            "ungemessen, „im Bild\" verlangt eine Radeon-Station",
        quelle: "1 = im Wolfsrevier wird der Spieler in 10 Spielminuten ≥ 1× gepirscht und umstellt (im Bild)",
    },
    {
        kriterium: "oekologie.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug fehlt: kein Gegenlauf bond = 0 (Ansteckung `_tickEmotionContagion` gegen die Stimmung des Spielers) " +
            "und kein Reload der Bindung in einer Linse; GTX ungemessen",
        quelle:
            "2 = die Ansteckung verschiebt die Stimmung des Spielers messbar gegen einen Gegenlauf mit bond = 0, und die Bindung übersteht den Reload",
    },
    {
        kriterium: "mensch.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug und Welt fehlen: keine Stadt ≥ 200 Bewohner mit ≥ 40 nah animiert in einer Linse (die Probe bewohner " +
            "kennt nur das Start-Dorf), das ABAB an der GTX ist ein Lauf des Richter-Zugs, keine Station",
        quelle: "2 = Stadt ≥ 200 mit ≥ 40 nah animiert, ABAB an der GTX nicht schlechter",
    },
    {
        kriterium: "mensch.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug und Welt fehlen: keine Stadt (nH ≥ 27) in der Probe bewohner, kein 24-h-Lauf auf Steckenbleiber, " +
            "kein Ausweichen ohne Berührung; ≥ 100 m je Bewohner ist am Start-Dorf min 46 m",
        quelle:
            "2 = 24 h ohne Steckenbleiber in einer Stadt, Gangzeit auf Wegen ≥ 0,85, ≥ 100 m Weg je Bewohner und Tag, Ausweichen ohne Berührung",
    },
    {
        kriterium: "vegetation.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug fehlt: kein Bild zählt Halme unter dem Wasser-Spiegel (diag-haus-welt --bild kennt nur Haus-Boxen), " +
            "Third vor dem Haus ungemessen; die Häuser-Hälfte ist die Station vegetation.K4#1 auf beiden Geräten",
        quelle: "2 = jedes Haus und jedes Wasser, auch gesetzte Bauten, beide Geräte",
    },
];

module.exports = stationen;
module.exports.fehlt = fehlt;
