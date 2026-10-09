// gate:settlement C7 (0710-7): der Blick gehört dem, der das Dorf verlangt.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(
    `            } catch (e6) {
                res.c.wegeErr = (e6 && e6.message) || String(e6);
            }`,
    `            } catch (e6) {
                res.c.wegeErr = (e6 && e6.message) || String(e6);
            }
            // C7 — DER BLICK GEHÖRT DEM, DER DAS DORF VERLANGT (0710-7; OMEN 0710-6 Boot 4B: ein Nexus-Dorf drehte die Gier
            // mitten im Lauf auf −2,745): ein Dorf aus einem Nexus-Programm (DSL-Quelle „nexus") lässt den Blick des Spielers
            // stehen; eines aus dem Chat-Programm des Spielers (DSL-Quelle „human") und der Befehl „dorf" richten ihn auf IHR
            // neues Dorf (den Schwerpunkt der eben gesetzten Häuser) — nie auf alle Häuser der Welt.
            try {
                const pm = r.state.playerMesh;
                const orig = r.spawnSettlement;
                let laeuft = null;
                r.spawnSettlement = function (o) {
                    laeuft = orig.call(this, o);
                    return laeuft;
                };
                const probe = async (px, pz, setzen) => {
                    pm.position.set(px, r.getTerrainHeightAt(px, pz) + 1.2, pz);
                    r.state.yaw = 1;
                    const vorher = new Set(r.state.architectures);
                    laeuft = null;
                    setzen();
                    if (laeuft) await laeuft;
                    const neu = r.state.architectures.filter(
                        (e) => e && !vorher.has(e) && typeof e.type === "string" && e.type.startsWith("haus_")
                    );
                    let cx = 0,
                        cz = 0;
                    for (const e of neu) {
                        cx += e.position.x;
                        cz += e.position.z;
                    }
                    const soll = neu.length ? r._blickGierZu(cx / neu.length - px, cz / neu.length - pz) : null;
                    const d = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
                    return {
                        haeuser: neu.length,
                        gier: +r.state.yaw.toFixed(4),
                        gedreht: +d(r.state.yaw, 1).toFixed(4),
                        nebenDorf: soll === null ? null : +d(r.state.yaw, soll).toFixed(4),
                    };
                };
                res.c.blick = {
                    nexus: await probe(1500, -1500, () =>
                        r.dslRun(["spawn_village", ["at_player"], 4712], { source: "nexus" })
                    ),
                    spieler: await probe(-1500, -1500, () =>
                        r.dslRun(["spawn_village", ["at_player"], 4713], { source: "human" })
                    ),
                    chat: await probe(1800, 600, () => {
                        const muster = r.chatSystemPatterns.find((q) => q.re.test("dorf 4714 8"));
                        muster.run("dorf 4714 8".match(muster.re), () => {});
                    }),
                };
                r.spawnSettlement = orig;
            } catch (e7) {
                res.c.blickErr = (e7 && e7.message) || String(e7);
            }`
);
ers(
    `    const ring = c.ring || {};
    check(
        "C5: DER GENESIS-PORTAL-RING`,
    `    const bl = c.blick || {};
    const blZ = (q) => (q ? \`\${q.haeuser} Häuser, Gier \${q.gier} (gedreht \${q.gedreht}, neben dem Dorf \${q.nebenDorf})\` : "–");
    check(
        "C7: ein Nexus-Dorf lässt den Blick des Spielers stehen (0710-7; 4B: −2,745 mitten im Lauf)",
        !!bl.nexus && bl.nexus.haeuser > 0 && bl.nexus.gedreht < 1e-6,
        \`Nexus: \${blZ(bl.nexus)}\${c.blickErr ? " err=" + c.blickErr : ""}\`
    );
    check(
        "C7: ein Dorf, das der Spieler verlangt (Chat-Programm, Befehl „dorf"), richtet den Blick auf SEIN neues Dorf",
        !!bl.spieler &&
            !!bl.chat &&
            bl.spieler.haeuser > 0 &&
            bl.chat.haeuser > 0 &&
            bl.spieler.nebenDorf < 0.05 &&
            bl.chat.nebenDorf < 0.05,
        \`Chat-Programm: \${blZ(bl.spieler)} · dorf: \${blZ(bl.chat)}\`
    );
    const ring = c.ring || {};
    check(
        "C5: DER GENESIS-PORTAL-RING`
);
fs.writeFileSync(p, s);
console.log("ok");
