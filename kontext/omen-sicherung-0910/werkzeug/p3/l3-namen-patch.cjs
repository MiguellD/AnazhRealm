// gate:fahr-leben L3–L5: die Stoß-Probe nennt den Partner des ersten Kontakts (mit Winkel und Abstand zum Ziel), jeden
// Partner eines Stoßes ohne Annäherung und die Tiere, die während der Probe in die Gasse kommen (CI 37696340913: L3 traf
// im CI-Takt zuerst etwas anderes — 6,63 m/s statt 7,50, vier Stöße ohne Annäherung).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(
    `                ruck: 0,
                ohneAnnaeherung: 0,
            };`,
    `                ruck: 0,
                ohneAnnaeherung: 0,
                ohneWer: {}, // der Partner je Stoß ohne Annäherung
                erster: null, // der erste Kontakt: wer, unter welchem Winkel, wie weit vor dem Ziel
                gasseTiere: 0, // die meisten Tiere zugleich in der Gasse (3 m quer, −3…12 m längs)
                gasseArten: [],
            };
            let schrittEv = []; // die Stoß-Partner dieses Sim-Schritts
            const nenne = (w) => schrittEv.push(w);`
);
ers(
    `            const annaeherung = (gx, gz, nx, nz) => {
                if (vEin && !(vEin.x * nx + vEin.z * nz > gx * nx + gz * nz + 1e-6)) m.ohneAnnaeherung++;
            };`,
    `            const annaeherung = (gx, gz, nx, nz, wer) => {
                if (vEin && !(vEin.x * nx + vEin.z * nz > gx * nx + gz * nz + 1e-6)) {
                    m.ohneAnnaeherung++;
                    m.ohneWer[wer] = (m.ohneWer[wer] || 0) + 1;
                }
            };`
);
ers(
    `                const v = sw && Number.isFinite(sw.v) ? sw.v : 0;
                annaeherung(
                    (v ? Math.sin(sw.gier) * v : 0) + (sv ? sv.x : 0),
                    (v ? Math.cos(sw.gier) * v : 0) + (sv ? sv.z : 0),
                    nx,
                    nz
                );
                return KSroh.call(this, c, nx, nz, dv);`,
    `                const v = sw && Number.isFinite(sw.v) ? sw.v : 0;
                const wer = "Tier " + (ud.soul || c.name || "?");
                if (vEin) nenne(wer);
                annaeherung(
                    (v ? Math.sin(sw.gier) * v : 0) + (sv ? sv.x : 0),
                    (v ? Math.cos(sw.gier) * v : 0) + (sv ? sv.z : 0),
                    nx,
                    nz,
                    wer
                );
                return KSroh.call(this, c, nx, nz, dv);`
);
ers(
    `                const fahrt = f && Number.isFinite(f.vlong) && Number.isFinite(f.yaw);
                if (d > 0)
                    annaeherung(
                        fahrt ? f.vlong * Math.cos(f.yaw) - f.vlat * Math.sin(f.yaw) : 0,
                        fahrt ? -f.vlong * Math.sin(f.yaw) - f.vlat * Math.cos(f.yaw) : 0,
                        dvx / d,
                        dvz / d
                    );`,
    `                const fahrt = f && Number.isFinite(f.vlong) && Number.isFinite(f.yaw);
                const wer = "Wagen " + (e.type || "?") + (e === gS ? " (der eigene)" : "");
                if (vEin) nenne(wer);
                if (d > 0)
                    annaeherung(
                        fahrt ? f.vlong * Math.cos(f.yaw) - f.vlat * Math.sin(f.yaw) : 0,
                        fahrt ? -f.vlong * Math.sin(f.yaw) - f.vlat * Math.cos(f.yaw) : 0,
                        dvx / d,
                        dvz / d,
                        wer
                    );`
);
ers(
    `                r._stossEreignis = function (...a) {
                    m.ereignisse++;
                    return evRoh.apply(this, a);
                };`,
    `                r._stossEreignis = function (...a) {
                    m.ereignisse++;
                    nenne(\`Ereignis Δv \${Number.isFinite(a[1]) ? a[1].toFixed(2) : "?"}\`);
                    return evRoh.apply(this, a);
                };`
);
ers(
    `            r._stepFixedSim = function (simTime, dt) {
                PF.call(this, simTime, dt);
                const v = st.playerVel.x() * ux + st.playerVel.z() * uz;
                m.ruck = Math.max(m.ruck, st._landImpactPending || 0);
                if (m.kontakt < 0 && vPrev > 2 && z.kontakt) {
                    m.kontakt = m.schritte;
                    m.vVor = vPrev;
                    m.vNach = v;
                    m.vMinNach = v;
                } else if (m.kontakt >= 0 && m.schritte - m.kontakt <= 8) m.vMinNach = Math.min(m.vMinNach, v);`,
    `            r._stepFixedSim = function (simTime, dt) {
                schrittEv = [];
                PF.call(this, simTime, dt);
                const v = st.playerVel.x() * ux + st.playerVel.z() * uz;
                m.ruck = Math.max(m.ruck, st._landImpactPending || 0);
                if (m.kontakt < 0 && vPrev > 2 && z.kontakt) {
                    m.kontakt = m.schritte;
                    m.vVor = vPrev;
                    m.vNach = v;
                    m.vMinNach = v;
                    // wer, unter welchem Winkel (Fahrt gegen die Richtung zum Ziel), wie weit vor dem Ziel (längs der Gasse)
                    const pz = h.lage(ziel);
                    const wx = pz.x - gS.position.x;
                    const wz = pz.z - gS.position.z;
                    const vx2 = st.playerVel.x();
                    const vz2 = st.playerVel.z();
                    const cw = (vPrev * (wx * ux + wz * uz)) / Math.max(1e-9, Math.hypot(wx, wz) * Math.abs(vPrev));
                    m.erster = {
                        mit: schrittEv.length ? schrittEv.join(" + ") : "der Löser ohne Stoß",
                        winkel: +((Math.acos(Math.max(-1, Math.min(1, cw))) * 180) / Math.PI).toFixed(1),
                        abstand: +(wx * ux + wz * uz).toFixed(2),
                        quer: +Math.abs(wx * uz - wz * ux).toFixed(2),
                        vQuer: +Math.abs(vx2 * uz - vz2 * ux).toFixed(2),
                    };
                } else if (m.kontakt >= 0 && m.schritte - m.kontakt <= 8) m.vMinNach = Math.min(m.vMinNach, v);
                // die Gasse: Tiere, die während der Probe hineinkommen
                let n = 0;
                for (const cr of st.creatures || []) {
                    if (!cr || !cr.position) continue;
                    const dx = cr.position.x - gasse.x;
                    const dz = cr.position.z - gasse.z;
                    const l = dx * ux + dz * uz;
                    if (l < -3 || l > 12 || Math.abs(dx * uz - dz * ux) > 3) continue;
                    n++;
                    const art = (cr.userData && cr.userData.soul) || "?";
                    if (m.gasseArten.indexOf(art) < 0) m.gasseArten.push(art);
                }
                m.gasseTiere = Math.max(m.gasseTiere, n);`
);
ers(
    "            ? `Fahrt ${z2(m.vVor)} → ${z2(m.vNach)} m/s (kleinste danach ${z2(m.vMinNach)}) · Gegner ${z2(m.zielWeg)} m · ${m.ereignisse} Stoß-Ereignisse · Kamera-Ruck ${z2(m.ruck)} · ohne Annäherung ${m.ohneAnnaeherung}`",
    "            ? `Fahrt ${z2(m.vVor)} → ${z2(m.vNach)} m/s (kleinste danach ${z2(m.vMinNach)}) · Gegner ${z2(m.zielWeg)} m · ${m.ereignisse} Stoß-Ereignisse · Kamera-Ruck ${z2(m.ruck)} · ohne Annäherung ${m.ohneAnnaeherung}${m.ohneAnnaeherung && m.ohneWer ? ` (${Object.entries(m.ohneWer).map(([w, k]) => `${w} ×${k}`).join(\", \")})` : \"\"}${m.erster ? ` · erster Kontakt: ${m.erster.mit}, ${m.erster.winkel}° zur Richtung des Ziels, ${m.erster.abstand} m davor (${m.erster.quer} m quer), Quer-Fahrt ${m.erster.vQuer} m/s` : \"\"}${m.gasseTiere ? ` · Tiere in der Gasse: ${m.gasseTiere} (${m.gasseArten.join(\", \")})` : \"\"}`"
);
fs.writeFileSync(p, s);
console.log("ok");
