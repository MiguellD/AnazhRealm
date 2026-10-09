// 0710-5: der gestoßene Leib lebt im festen Sim-Schritt (Weg in Teil-Schritten gegen die EINE Hülle), die Leib-Kontakte
// ebenda; der veraltete Kommentar an damageCreature.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
// (1) updateCreatures: der Stoß verlässt den Frame-Takt
ers(
    `            // DER STOSS (das EINE Impuls-Gesetz, AnazhRealm.STOSS): die Geschwindigkeit eines Treffers oder Wagens trägt den
            // Leib, bis die Reibung am Boden sie aufzehrt (μ·g); der Hüllen-Kontakt danach hält ihn aus Wand und Bauwerk.
            const stossV = udS._stossV;
            if (stossV) {
                const sp = Math.hypot(stossV.x, stossV.z);
                const ab = AnazhRealm.STOSS.reibungLeib * Math.abs(this.state.gravity) * delta;
                if (!(sp > Math.max(ab, AnazhRealm.STOSS.ruheMs))) udS._stossV = null;
                else {
                    creature.position.x += stossV.x * delta;
                    creature.position.z += stossV.z * delta;
                    const k = (sp - ab) / sp;
                    stossV.x *= k;
                    stossV.z *= k;
                }
            }
            const kx0 = creature.position.x;
            const kz0 = creature.position.z;
            this._kreaturHuellenKontakt(creature, hueftL, px0, pz0);
            // Hält ein Hindernis den Leib, stirbt sein Stoß in das Hindernis (unelastisch, wie die Fahrt der Hülle an der
            // Wand): sonst trüge ein eingeklemmter Leib eine Geschwindigkeit, die er nie ausführt, und der Wagen hinter ihm
            // sähe ihn fortgleiten (Relativ-Geschwindigkeit ≤ 0, kein Stoß) und drückte je Schritt eine Stufe in ihn hinein.
            const stossH = udS._stossV;
            if (stossH) {
                const hx = creature.position.x - kx0;
                const hz = creature.position.z - kz0;
                const hd = Math.hypot(hx, hz);
                const vn = hd > 1e-6 ? (stossH.x * hx + stossH.z * hz) / hd : 0;
                if (vn < 0) {
                    stossH.x -= (vn * hx) / hd;
                    stossH.z -= (vn * hz) / hd;
                }
            }
`,
    `            // Der STOSS, den ein Leib trägt, bewegt ihn im festen Sim-Schritt (\`_kreaturStossSchritt\`, 0710-5), nie hier im
            // Frame-Takt: hier trug \`_stossV · delta\` ihn je Frame ohne Weg-Prüfung — bei 30 fps (0,46 m je Frame aus 13,7 m/s)
            // sprang ein Bär 7 von 10 Mal durch eine 0,35-m-Wand, und der Wagen las das Frame-Gedächtnis im Sim-Schritt.
            this._kreaturHuellenKontakt(creature, hueftL, px0, pz0);
`
);
ers(
    `        // LEIB AN LEIB (0710-4): nachdem jedes Tier seinen Schritt ging, lösen die Paare ihre Berührung (Lage + Impuls).
        this._leibKontakte();
    }`,
    `    }`
);
// (2) der Sim-Schritt
ers(
    `        if (this._fahrLos && this._fahrLos.size) this._fahrNachlauf(dt);
        if (this.state._replayRec) this._replayCaptureFrame(dt);`,
    `        if (this._fahrLos && this._fahrLos.size) this._fahrNachlauf(dt);
        // DER GESTOSSENE LEIB und LEIB AN LEIB im Sim-Schritt (0710-5): was einen Körper bewegt, läuft im festen Schritt.
        this._kreaturStossSchritt(dt);
        this._leibKontakte();
        if (this.state._replayRec) this._replayCaptureFrame(dt);`
);
// (3) die Methode neben _kreaturStoss
ers(
    `    // DER STOSS AUF EINEN LEIB: dv (m/s) längs (nx, nz) — er trägt den Leib, bis die Reibung ihn aufzehrt.
    _kreaturStoss(creature, nx, nz, dv) {`,
    `    // DER GESTOSSENE LEIB IM SIM-SCHRITT (0710-5, Lehre 13: was einen Körper bewegt, läuft im festen Schritt): je Tier mit
    // getragenem Stoß der Weg dieses Schritts — in Teil-Schritten von höchstens dem halben Leib-Radius, je Teil-Schritt die
    // EINE Hülle (\`_kreaturHuellenKontakt\`): die Achse erreicht in einem Teil-Schritt nie die Mitte einer Wand, gleich wie
    // dünn sie ist (dieselbe Regel wie der Deckel des Wagens: nie mehr als eine Stufe in eine Box je Schritt). Hält ein
    // Hindernis den Leib, stirbt sein Stoß in das Hindernis (unelastisch); danach zehrt die Reibung μ·g·dt. Vorher bewegte
    // updateCreatures ihn je Frame um _stossV·delta ohne Weg-Prüfung (30 fps: 7 von 10 Bären durch 0,35 m Mauer; der Wagen
    // stand nach 200 Schritten 2,03 m anders, je nach Bildrate).
    _kreaturStossSchritt(dt) {
        const wesen = this.state.creatures;
        if (!wesen || !wesen.length || !(dt > 0)) return;
        const ST = AnazhRealm.STOSS;
        const ab = ST.reibungLeib * Math.abs(this.state.gravity) * dt;
        const leib = this._kreaturStossLeib || (this._kreaturStossLeib = {});
        for (const c of wesen) {
            const ud = c && c.userData;
            const sv = ud && ud._stossV;
            if (!sv) continue;
            const sp = Math.hypot(sv.x, sv.z);
            if (!(sp > Math.max(ab, ST.ruheMs))) {
                ud._stossV = null;
                continue;
            }
            const L = this._kreaturHueftL(c);
            this._kreaturLeib(c, L, leib);
            const teile = Math.max(1, Math.ceil((sp * dt) / Math.max(0.02, 0.5 * leib.radius)));
            const h = dt / teile;
            for (let k = 0; k < teile; k++) {
                const x0 = c.position.x;
                const z0 = c.position.z;
                c.position.x += sv.x * h;
                c.position.z += sv.z * h;
                const kx = c.position.x;
                const kz = c.position.z;
                this._kreaturHuellenKontakt(c, L, x0, z0);
                const hx = c.position.x - kx;
                const hz = c.position.z - kz;
                const hd = Math.hypot(hx, hz);
                const vn = hd > 1e-6 ? (sv.x * hx + sv.z * hz) / hd : 0;
                if (vn < 0) {
                    sv.x -= (vn * hx) / hd;
                    sv.z -= (vn * hz) / hd;
                }
            }
            const sp2 = Math.hypot(sv.x, sv.z);
            if (!(sp2 > Math.max(ab, ST.ruheMs))) ud._stossV = null;
            else {
                sv.x *= (sp2 - ab) / sp2;
                sv.z *= (sp2 - ab) / sp2;
            }
        }
    }

    // DER STOSS AUF EINEN LEIB: dv (m/s) längs (nx, nz) — er trägt den Leib, bis die Reibung ihn aufzehrt.
    _kreaturStoss(creature, nx, nz, dv) {`
);
// (4) die Lage-Trennung der Leiber löst danach die Hülle (eine Achse, die der Kontakt in eine Wand schob, ginge sonst frei
//     durch sie hinaus — die Hülle lässt geborene/gestoßene Achsen frei heraus)
ers(
    `                if (wa > 0) {
                    a.q.position.x -= nx * tief * wa;
                    a.q.position.z -= nz * tief * wa;
                    a.x = a.q.position.x;
                    a.z = a.q.position.z;
                }
                if (wb > 0) {
                    b.q.position.x += nx * tief * wb;
                    b.q.position.z += nz * tief * wb;
                    b.x = b.q.position.x;
                    b.z = b.q.position.z;
                }`,
    `                if (wa > 0) {
                    const x0 = a.q.position.x;
                    const z0 = a.q.position.z;
                    a.q.position.x -= nx * tief * wa;
                    a.q.position.z -= nz * tief * wa;
                    this._kreaturHuellenKontakt(a.q, 0, x0, z0); // die Trennung schiebt nie in eine Wand
                    a.x = a.q.position.x;
                    a.z = a.q.position.z;
                }
                if (wb > 0) {
                    const x0 = b.q.position.x;
                    const z0 = b.q.position.z;
                    b.q.position.x += nx * tief * wb;
                    b.q.position.z += nz * tief * wb;
                    this._kreaturHuellenKontakt(b.q, 0, x0, z0);
                    b.x = b.q.position.x;
                    b.z = b.q.position.z;
                }`
);
ers(
    `    // Vorher trennte nur der Herden-Abstand als Steuer-Wunsch (\`_applyCreatureSeparation\`) — Leiber gingen durcheinander,
    // ohne Impuls. Paare in Index-Folge, ohne Frame-Delta, ohne Zufall (Lockstep).`,
    `    // Vorher trennte nur der Herden-Abstand als Steuer-Wunsch (\`_applyCreatureSeparation\`) — Leiber gingen durcheinander,
    // ohne Impuls. Paare in Index-Folge, ohne Frame-Delta, ohne Zufall, im festen Sim-Schritt (\`_stepFixedSim\`, 0710-5).`
);
// (5) der veraltete Kommentar an damageCreature
ers(
    `    // (_ruestungDaempft); hp ≤ 0 → Kampf-Tod (Loot + removeCreature). Knockback nur, wenn der Angreifer Ort + Wucht
    // liefert (opts.fromPos/knockback).`,
    `    // (_ruestungDaempft); hp ≤ 0 → Kampf-Tod (Loot + removeCreature). Der Rückstoß nur, wenn der Angreifer Ort und Stoß
    // liefert (opts.fromPos + opts.stoss {p, m} — das EINE Impuls-Gesetz, AnazhRealm.STOSS; ein Feld knockback liest niemand).`
);
fs.writeFileSync(p, s);
console.log("ok");
