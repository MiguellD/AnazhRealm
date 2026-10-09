// gate:fahr-leben: L9 misst die Freigabe des Wurzel-Knochens (Lage + Gier gegen den Stand vor dem ersten Aufsitzen) statt
// der Welt-Höhe der Hüfte (die trägt Fuß-IK und Gang-Phase: 0,007–0,045 m je Lauf); L6(a) nennt, ob der Spieler beim
// Kontakt auf den Wagen steigt (der Fuß über dem Boden) und ob ein Schub des Wagens ihn traf.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
// L9: die Freigabe
ers(
    `            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            for (let i = 0; i < 6; i++) frame(i);
            const steh0 = huefteRel().y - pm.position.y;`,
    `            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            for (let i = 0; i < 6; i++) frame(i);
            const wurzel0 = rigR().hips.position.clone(); // der Wurzel-Knochen vor dem ersten Aufsitzen`
);
ers(
    `            S.reiterStand = { abw: +Math.abs(huefteRel().y - pm.position.y - steh0).toFixed(4) };`,
    `            const w1 = rigR().hips;
            S.reiterStand = {
                abw: +Math.hypot(w1.position.x - wurzel0.x, w1.position.z - wurzel0.z).toFixed(4),
                gier: +Math.abs(w1.rotation.y).toFixed(4),
            };`
);
ers(
    `    if (s.reiterStand && !(s.reiterStand.abw <= STATION.sitzM))
        out.push(\`reiter: nach dem Absteigen steht die Hüfte \${s.reiterStand.abw.toFixed(3)} m anders als vorher\`);`,
    `    if (s.reiterStand && !(s.reiterStand.abw <= 1e-6 && !(s.reiterStand.gier > 1e-6)))
        out.push(
            \`reiter: nach dem Absteigen steht der Wurzel-Knochen \${s.reiterStand.abw.toFixed(3)} m neben seinem Stand (Gier \${(s.reiterStand.gier || 0).toFixed(3)})\`
        );`
);
ers(
    "            (S.reiterStand ? ` · Stand nach dem Absteigen ${S.reiterStand.abw} m` : \"\")",
    "            (S.reiterStand ? ` · abgestiegen: Wurzel ${S.reiterStand.abw} m, Gier ${S.reiterStand.gier}` : \"\")"
);
// L6(a): Aufsteigen und Schub beim Namen
ers(
    `                    const m = { minAbstand: Infinity, wagenWeg: 0, kontakt: -1, vorKontakt: 0, nachKontakt: Infinity };
                    tasten(true);
                    let vorher = 0;
                    for (let i = 0; i < 240; i++) {
                        frame(i);
                        const ab = kapselAbstand(e);`,
    `                    const m = {
                        minAbstand: Infinity,
                        wagenWeg: 0,
                        kontakt: -1,
                        vorKontakt: 0,
                        nachKontakt: Infinity,
                        aufstieg: 0, // wie hoch der Fuß nach dem Kontakt über dem Boden stand (der Spieler stieg auf den Wagen)
                        schub: 0, // in wie vielen Schritten der Wagen den Spieler aus seiner Hülle schob
                    };
                    const SQroh = r._stepCharacterStructures;
                    r._stepCharacterStructures = function (pos, feetY, headY, radius, huelle, quellen) {
                        const n0 = quellen ? quellen.length : 0;
                        const t = SQroh.call(this, pos, feetY, headY, radius, huelle, quellen);
                        if (!huelle && quellen && quellen.length > n0 && m.kontakt >= 0) m.schub++;
                        return t;
                    };
                    tasten(true);
                    let vorher = 0;
                    for (let i = 0; i < 240; i++) {
                        frame(i);
                        const ab = kapselAbstand(e);
                        if (m.kontakt >= 0 && i - m.kontakt <= 30) {
                            const pmA = st.playerMesh.position;
                            m.aufstieg = Math.max(m.aufstieg, pmA.y - 0.5 - hh(pmA.x, pmA.z)); // Fuß = Ursprung − 0,5
                        }`
);
ers(
    `                    tasten(false);
                    for (let i = 0; i < 60; i++) frame(240 + i);
                    m.wagenWeg = Math.hypot(e.position.x - p0.x, e.position.z - p0.z);`,
    `                    tasten(false);
                    delete r._stepCharacterStructures;
                    for (let i = 0; i < 60; i++) frame(240 + i);
                    m.wagenWeg = Math.hypot(e.position.x - p0.x, e.position.z - p0.z);`
);
ers(
    "            ? `Spieler → GT: Fahrt in den Wagen ${swz.a.vorKontakt.toFixed(2)} → ${swz.a.nachKontakt.toFixed(2)} m/s, Wagen ${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung ${swz.a.minAbstand.toFixed(3)} m · GT → Spieler: Spieler ${swz.b.spielerDv.toFixed(2)} m/s, tiefste Berührung ${swz.b.minAbstand.toFixed(3)} m`",
    "            ? `Spieler → GT: Fahrt in den Wagen ${swz.a.vorKontakt.toFixed(2)} → ${swz.a.nachKontakt.toFixed(2)} m/s, Wagen ${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung ${swz.a.minAbstand.toFixed(3)} m, Schub des Wagens in ${swz.a.schub} Schritten, Fuß bis ${Number.isFinite(swz.a.aufstieg) ? swz.a.aufstieg.toFixed(2) : \"–\"} m über dem Boden · GT → Spieler: Spieler ${swz.b.spielerDv.toFixed(2)} m/s, tiefste Berührung ${swz.b.minAbstand.toFixed(3)} m`"
);
fs.writeFileSync(p, s);
console.log("ok");
