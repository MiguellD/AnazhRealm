async (r, T, arg) => {
                const st = r.state;
                const pm = st.playerMesh.position;
                const draussen = [];
                for (const S of (r._bewohnerSiedlungen || new Map()).values()) for (const b of S.liste || []) if (b.leib && !b.drinnen) draussen.push({ b, S });
                const fern = (x, z, R) => draussen.every((q) => Math.hypot(q.b.leib.position.x - x, q.b.leib.position.z - z) >= R);
                let ort = { x: arg.start[0], z: arg.start[1] };
                if (!arg.gesehen) {
                    ort = null;
                    for (const R of [60, 110, 160, 220]) {
                        for (let k = 0; k < 24 && !ort; k++) {
                            const a = (k / 24) * 2 * Math.PI + arg.i;
                            const [x, z] = [arg.start[0] + Math.cos(a) * R, arg.start[1] + Math.sin(a) * R];
                            if (r._landAt(x, z, 0.2) && !(r._imGrundriss && r._imGrundriss(x, z, 2)) && fern(x, z, 45)) ort = { x, z };
                        }
                        if (ort) break;
                    }
                    if (!ort) return { gueltig: false, gesehen: false, grund: "keine Stelle ≥ 45 m von jedem Bewohner draußen binnen 220 m" };
                }
                pm.set(ort.x, r._voxelSurfaceY(ort.x, ort.z) + 1.8, ort.z);
                const P0 = { x: pm.x, z: pm.z };
                const [fx, fz] = [ort.x + 1.2, ort.z + 0.9];
                const zeugen = draussen.filter((q) => Math.hypot(q.b.leib.position.x - fx, q.b.leib.position.z - fz) < r.constructor.BEWOHNER.zeugeM);
                const istW = (b) => b.rolle === "waechter" || b.rolle === "nachtwaechter" || b.beruf === "waechter" || b.beruf === "nachtwaechter";
                const wachen = zeugen.filter((q) => istW(q.b));
                const dSp = (b) => Math.hypot(b.leib.position.x - pm.x, b.leib.position.z - pm.z);
                const dF = (b) => Math.hypot(b.leib.position.x - fx, b.leib.position.z - fz);
                const vor = new Map(draussen.map((q) => [q.b, { sp: dSp(q.b), f: dF(q.b) }]));
                const cells = (st.worldMeta && st.worldMeta.settlementCells) || {};
                const akten = () => Object.values(cells).reduce((s, c) => s + ((c && c.akten) || []).length, 0);
                const a0 = akten();
                const tier = r.spawnCreatureAt(fx, r.getTerrainHeightAt(fx, fz), fz, "happy", "fuchs", { bodySize: 1, precise: true });
                if (!tier) return { gueltig: false, gesehen: !!arg.gesehen, grund: "kein Fuchs an der Stelle" };
                const schlag = r.damageCreature(tier, 0.001, { source: "player" });
                if (!(schlag && schlag.ok)) return { gueltig: false, gesehen: !!arg.gesehen, grund: "der Schlag traf nicht" };
                const [t0, w0] = [st.spielZeit, performance.now()];
                while (st.spielZeit - t0 < arg.fensterS && performance.now() - w0 < arg.fensterS * 3000) await window.__werkTakt();
                let [nach, fliehen, wacheAntwort] = [0, 0, 0];
                for (const q of draussen) {
                    if (!q.b.leib) continue;
                    const v = vor.get(q.b);
                    const [sp, f] = [dSp(q.b), dF(q.b)];
                    if (sp <= 3 && sp <= v.sp - 3) nach++;
                    if (zeugen.includes(q) && f >= v.f + 3) fliehen++;
                    if (wachen.includes(q) && f <= v.f - 1) wacheAntwort++;
                }
                const versetzt = Math.hypot(pm.x - P0.x, pm.z - P0.z);
                const da = akten() - a0;
                const S0 = zeugen.length ? zeugen[0].S.key : null;
                pm.set(arg.start[0], r._voxelSurfaceY(arg.start[0], arg.start[1]) + 1.8, arg.start[1]);
                const gesehen = zeugen.length > 0;
                return {
                    gueltig: gesehen === !!arg.gesehen,
                    gesehen,
                    zeugen: zeugen.length,
                    wachen: wachen.length,
                    wacheAntwort,
                    nach,
                    fliehen,
                    versetzt: +versetzt.toFixed(2),
                    akten: da,
                    ort: S0,
                    folge: nach > 0 || versetzt >= 2 || (!gesehen && da > 0),
                    uhr: +(st.spielZeit - t0).toFixed(2),
                };
            }