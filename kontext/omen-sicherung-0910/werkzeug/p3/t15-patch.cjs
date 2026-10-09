// 0710-4 Klasse 2: gate:kampf-gefuehl T15 — der Biss durch das EINE Impuls-Gesetz.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 90));
    s = s.replace(a, b);
}
ers(
    `const mime = {
    ".html": "text/html",`,
    `// (T15) DER BISS ALS STOSS (0710-4 — pure Funktion, Probe UND Selbst-Test): Fuchs, Wolf und Bär (Größe 1) beißen je einen
// Hirsch (die Jagd auf Beute) und den Spieler (die Jagd auf den Spieler): das Ziel bekommt seinen Impuls (Δv > 0), und
// der schwerere Jäger stößt stärker (Fuchs < Wolf < Bär). Vorher: Schaden ohne Rückstoß auf allen Biss-Wegen.
const BISS_SOLL = { dvMin: 0.05, jaeger: ["fuchs", "wolf", "baer"] };
function bissVerdict(B) {
    if (!B || !B.beute || !B.spieler) return ["biss keine Probe"];
    const v = [];
    for (const [ziel, name] of [
        ["beute", "den Hirsch"],
        ["spieler", "den Spieler"],
    ]) {
        const z = B[ziel];
        for (const j of BISS_SOLL.jaeger) {
            const m = z[j];
            if (!m || m.biss !== true) v.push(\`biss-\${ziel}: \${j} biss \${name} nicht (keine Probe)\`);
            else if (!(m.dv >= BISS_SOLL.dvMin))
                v.push(\`biss-\${ziel}: \${j} beißt \${name} ohne Rückstoß (Δv \${(m.dv || 0).toFixed(3)} m/s)\`);
        }
        const dv = BISS_SOLL.jaeger.map((j) => (z[j] && z[j].dv) || 0);
        if (dv.every((x) => x >= BISS_SOLL.dvMin) && !(dv[0] < dv[1] && dv[1] < dv[2]))
            v.push(
                \`biss-masse: an \${name} Fuchs \${dv[0].toFixed(2)} · Wolf \${dv[1].toFixed(2)} · Bär \${dv[2].toFixed(2)} m/s — der schwerere Jäger stößt nicht stärker\`
            );
    }
    return v;
}
const mime = {
    ".html": "text/html",`
);
ers(
    `            w.z.masse = { leiber, kernFehlt, zwillinge };
        }`,
    `            w.z.masse = { leiber, kernFehlt, zwillinge };
        }
        // (T15) DER BISS ALS STOSS (0710-4): je Jäger (Größe 1) ein Biss auf einen frischen Hirsch 1,5 m vor ihm (die Jagd
        // auf Beute, _tickCreatureScentStrike) und einer auf den Spieler 1,5 m vor ihm (die Jagd, _tickCreatureHuntStrike,
        // im Pfad-Modus, volle Gesundheit). Gemessen: das Δv des Ziels im Biss-Takt.
        {
            const bissAlt = { mode: r.getGameMode(), hp: p.hp, gnade: p.respawnGraceUntil };
            r.setGameMode("pfad");
            const ort0 = pm.position;
            const beute = {};
            const spieler = {};
            for (const seele of ["fuchs", "wolf", "baer"]) {
                s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 3);
                const bx = ort0.x + 400,
                    bz = ort0.z + 400;
                const j = r.spawnCreatureAt(bx, ort0.y, bz, "calm", seele, { bodySize: 1 });
                const h = r.spawnCreatureAt(bx + 1.5, ort0.y, bz, "calm", "wesen", { bodySize: 1 });
                if (j && h) {
                    j.position.set(bx, r.getTerrainHeightAt(bx, bz), bz);
                    h.position.set(bx + 1.5, r.getTerrainHeightAt(bx + 1.5, bz), bz);
                    h.userData._stossV = null;
                    j.userData.nextHuntStrikeAt = 0;
                    const biss = r._tickCreatureScentStrike(j) === true;
                    const sv = h.userData._stossV;
                    beute[seele] = { biss, dv: sv ? Math.hypot(sv.x, sv.z) : 0 };
                }
                if (h) r.removeCreature(h);
                if (j) {
                    // derselbe Jäger 1,5 m vor dem Spieler
                    j.position.set(ort0.x + 1.5, ort0.y, ort0.z);
                    j.userData.nextHuntStrikeAt = 0;
                    p.hp = p.maxHp || 100;
                    p.respawnGraceUntil = 0;
                    s.playerVel.setValue(0, s.playerVel.y(), 0);
                    const biss = r._tickCreatureHuntStrike(j) === true;
                    spieler[seele] = { biss, dv: Math.hypot(s.playerVel.x(), s.playerVel.z()) };
                    s.playerVel.setValue(0, s.playerVel.y(), 0);
                    r.removeCreature(j);
                }
            }
            p.hp = bissAlt.hp;
            p.respawnGraceUntil = bissAlt.gnade;
            if (r.getGameMode() !== bissAlt.mode) r.setGameMode(bissAlt.mode);
            w.z.biss = { beute, spieler };
        }`
);
ers(
    `        check(c.bogenVerschleiss, "Q8 K-D6: der Bogen verschleißt wie die Klinge`,
    `        const bz2 = z.biss || {};
        const bw = (t) =>
            ["fuchs", "wolf", "baer"]
                .map((j) => (t && t[j] ? \`\${j} \${t[j].biss ? "biss" : "kein Biss"} Δv \${t[j].dv.toFixed(3)}\` : j + " –"))
                .join(" · ");
        console.log(\`  (T15) Biss: Hirsch \${bw(bz2.beute)} · Spieler \${bw(bz2.spieler)} m/s\`);
        const bv = bissVerdict(z.biss);
        check(
            bv.length === 0,
            "0710-4 T15: der Biss stößt durch das EINE Impuls-Gesetz — Hirsch und Spieler bekommen ihren Impuls, der schwerere Jäger stößt stärker (Fuchs < Wolf < Bär)" +
                (bv.length ? " — " + bv.join(" · ") : "")
        );
        const nullBiss = { biss: true, dv: 0 };
        const bvAlt = bissVerdict({
            beute: { fuchs: nullBiss, wolf: nullBiss, baer: nullBiss },
            spieler: { fuchs: nullBiss, wolf: nullBiss, baer: nullBiss },
        });
        const bvVerkehrt = bissVerdict({
            beute: { fuchs: { biss: true, dv: 2 }, wolf: { biss: true, dv: 1 }, baer: { biss: true, dv: 0.5 } },
            spieler: { fuchs: { biss: true, dv: 0.2 }, wolf: { biss: true, dv: 0.4 }, baer: { biss: true, dv: 0.9 } },
        });
        const bvGut = bissVerdict({
            beute: { fuchs: { biss: true, dv: 0.5 }, wolf: { biss: true, dv: 1.4 }, baer: { biss: true, dv: 2.6 } },
            spieler: { fuchs: { biss: true, dv: 0.2 }, wolf: { biss: true, dv: 0.6 }, baer: { biss: true, dv: 1.5 } },
        });
        check(
            bvGut.length === 0 &&
                ["biss-beute", "biss-spieler"].every((t) => bvAlt.some((x) => x.startsWith(t))) &&
                bvVerkehrt.some((x) => x.startsWith("biss-masse")),
            "Selbst-Test T15: der Befund (Biss ohne Rückstoß) nennt Beute und Spieler, ein Jäger-Gewicht ohne Wirkung nennt die Masse; ein Biss nach Masse bleibt grün"
        );
        check(c.bogenVerschleiss, "Q8 K-D6: der Bogen verschleißt wie die Klinge`
);
fs.writeFileSync(p, s);
console.log("ok");
