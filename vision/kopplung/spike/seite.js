// SPIKE KOPPLUNG — die Seiten-Bibliothek (läuft IN der Seite, als window.__spike): Boot an der Mess-Wiese, Leeren des Brands,
// Linien-Zündung, der Takt des Brands an der Welt-Uhr (der echte `_tickBrand`), das Protokoll jeder Zündung (`_brandZuenden`).
// Nichts hier rechnet Physik: jede Zahl liest die geladenen Module (Original oder Kopie).
window.__spike = (() => {
    const S = {};
    const cs = () => AnazhRealm.LIFE_FIELD.cell;
    const B = () => AnazhRealm.BRAND;
    S.gesetz = () => typeof globalThis.__phytoCore.ortWetter === "function";
    S.saat = () => (st.worldMeta && st.worldMeta.seed) || "anazh-realm-seed";

    S.boot = async (M) => {
        await __weltDa((x) => x.state.playerMesh && x._foundry?.ready);
        const pm = st.playerMesh.position;
        let tw = performance.now();
        const takt = () => r._gameLoopTick((tw += 1000 / 60));
        st.perfRegulator = false;
        st.autoSeason = false;
        st.seasonPhase = 0.375;
        pm.set(M.x, r._voxelSurfaceY(M.x, M.z) + 1.8, M.z);
        await __weltStehtNach(takt);
        r._feldFolgeSteht = () => true;
        return {
            gesetz: S.gesetz(),
            ortWetter: typeof __phytoCore.ortWetter,
            feuchteAm: typeof r._feuchteAm,
            lastAm: typeof r._lastAm,
            emc: typeof __gelaendeCore.emc,
            pegelRegen: __gelaendeCore.PEGEL.regen,
            tagNull: st.worldMeta.tagNull,
            spielZeit: st.spielZeit,
            wetter: st.weather,
            naesse: st.naesse,
        };
    };

    // Die Uhr: die Welt-Zeit, zu der die Tag-Phase `phase` (14 Uhr = 14/24) nach `ab` zuerst steht
    S.zeitZurPhase = (phase, ab = st.spielZeit) => {
        const tn = +st.worldMeta.tagNull || 0;
        const P = AnazhRealm.PEGEL_TAG_S;
        const d = (ab / P + tn) % 1;
        let dt = ((phase - d + 1) % 1) * P;
        return 5 * Math.round((ab + dt) / 5);
    };

    S.leer = () => {
        const bf = st.brandFeld || (st.brandFeld = new Map());
        bf.clear();
        r._brandRest = null;
        r._brandBett = null;
        const L = st.worldMeta.taten || [];
        for (let i = L.length - 1; i >= 0; i--) if (L[i].tat === "brand" || L[i].tat === "wetter") L.splice(i, 1);
        r._tatGen = (r._tatGen | 0) + 1;
        // die gemalte Asche der entfernten Taten fällt mit ihnen: der Maler des Spiels malt jede zentrierte Stufe aus den Taten
        // neu (`_ascheStufeMalen`, wie vegetation-wiese.js:2235) — die Wiese liest sie (`_wieseGrund` → `_ascheAt` → `_bodenDeckeAt`)
        const wk = st.wegeKarte;
        if (wk && wk.stufen) for (const stufe of wk.stufen) if (stufe.zentriert) r._ascheStufeMalen(stufe);
        r._wetterAmMerk = null;
        r._feuchteMerk = null;
        r._windDirMerk = null;
        S.protokoll = [];
        S.absagen = [];
    };

    // DAS PROTOKOLL: jede Zelle, die fängt (`_brandZuenden` gibt sie zurück) — Ort, Eintritt, Zeit, Tempo, Feuchte und Wind,
    // wie die geladenen Module sie ihr gaben
    S.protokoll = [];
    S.lauscht = false;
    S.lauschen = () => {
        if (S.lauscht) return;
        S.lauscht = true;
        const P = Object.getPrototypeOf(r);
        const echt = P._brandZuenden;
        r._brandZuenden = function (cx, cz, t, ex, ez, ein) {
            r._tempoLetzt = null;
            const vor = this.state.brandFeld && this.state.brandFeld.get(cx + "," + cz);
            const von = vor && vor.t0 === null ? vor.von || null : null; // die Quelle der Wartenden (die Absage löscht den Eintrag)
            const z = echt.call(this, cx, cz, t, ex, ez, ein);
            // die Glieder, die `_brandTempo` dieser Zelle las (Mess-Ersetzung `diag-tempo-glieder`): M, U10 am Ort, I_R, u, Deckel
            const T = r._tempoLetzt;
            if (z && S.protokoll) {
                if (!T) throw new Error("lauschen: die Mess-Ersetzung diag-tempo-glieder fehlt (kein _tempoLetzt)");
                S.protokoll.push({ cx, cz, t, ex, ez, R: z.R, ecc: z.ecc, M: T.M, U: T.U10, deckel: T.deckel, IR: T.IR, u: T.u, leb: T.leb, stoff: z.stoff });
            }
            if (!z && S.absagen) {
                const [xc, zc] = [(cx + 0.5) * cs(), (cz + 0.5) * cs()];
                const M = S.gesetz() ? r._feuchteAm(xc, zc, r._voxelSurfaceY(xc, zc), t).gras : T ? T.M : null;
                S.absagen.push({ cx, cz, t, M, von, bett: !!r._brandStoff(cx, cz) });
            }
            return z;
        };
    };

    // Die Linie quer zu (dx, dz) durch (x, z): n Punkte im Abstand einer Zelle
    S.linie = (x, z, dx, dz, n = 10) =>
        Array.from({ length: n }, (_, k) => ({ x: x + (k - (n - 1) / 2) * cs() * -dz, z: z + (k - (n - 1) / 2) * cs() * dx }));

    // Zünden zur Welt-Zeit t an den Punkten (der Akt der Seite, wie das Brennglas und die Fackel) → Zahl der Zellen, die fingen
    S.zuenden = (punkte, t) => {
        st.spielZeit = t;
        let n = 0;
        for (const p of punkte) if (r._brandEntfachen(p.x, p.z)) n++;
        return n;
    };

    // Der Takt des Brands bis zur Welt-Zeit `bis` (der echte `_tickBrand`, Schritt um Schritt an der Welt-Uhr); `jeSchritt(t)`
    S.brennenBis = (bis, jeSchritt) => {
        const sc = B().schrittS;
        let ruf = 0;
        while (r._brandUhr < bis - 1e-9 && r._brandLebt()) {
            st.spielZeit = r._brandUhr + sc;
            const n = st.brandFeld.size;
            const t0 = performance.now();
            r._tickBrand();
            S.uhr.tick += performance.now() - t0;
            S.uhr.zellSek += n;
            if (jeSchritt) jeSchritt(r._brandUhr);
            if (++ruf > 2e6) throw new Error("brennenBis: der Takt steht");
        }
        st.spielZeit = Math.max(st.spielZeit, bis);
        return r._brandUhr;
    };

    // DIE UHREN DES PREISES: die Zeit in den Gliedern des Brands (der echte Leib, je Ruf gemessen) und in den neuen Funktionen
    S.uhr = { tick: 0, zellSek: 0 };
    S.uhrNull = () => {
        for (const k of Object.keys(S.uhr)) S.uhr[k] = 0;
    };
    S.messen = (namen) => {
        const P = Object.getPrototypeOf(r);
        for (const n of namen) {
            if (typeof P[n] !== "function" || Object.hasOwn(r, n)) continue;
            const echt = P[n];
            S.uhr[n] = 0;
            S.uhr[n + "#"] = 0;
            r[n] = function (...a) {
                const t0 = performance.now();
                try {
                    return echt.apply(this, a);
                } finally {
                    S.uhr[n] += performance.now() - t0;
                    S.uhr[n + "#"]++;
                }
            };
        }
    };

    // Das Wort der Welt ohne Übergang (wie die Brand-Linsen): `_setWeather` des Stamms, der Übergang fällt
    S.wort = (w) => {
        st.weatherEffectTime = 0;
        r._setWeather(w, "human");
        st.weatherEffectTime = -1e9;
        window.__uebergangFaellt(r);
        return st.weather;
    };

    // Die Linie (10 Zellen quer zu d) nächst (x, z), deren Zellen alle die Wiesen-Bedeckung p·anteil ≥ pMin tragen (`_lastAm`,
    // nur im Gesetz) — Suche in Ringen um die Zelle von (x, z) → { x, z, ring, p: [...] } oder null
    S.wiesenLinie = (x, z, dx, dz, pMin = 0.95, ringMax = 40) => {
        const c = cs();
        const [c0x, c0z] = [Math.floor(x / c), Math.floor(z / c)];
        const M = new Map();
        const p = (cx, cz) => {
            const k = cx + "," + cz;
            if (!M.has(k)) {
                const g = r._lastAm(cx, cz);
                M.set(k, g ? g.p * g.anteil : 0);
            }
            return M.get(k);
        };
        for (let ring = 0; ring <= ringMax; ring++) {
            const kand = [];
            for (let j = -ring; j <= ring; j++)
                for (let i = -ring; i <= ring; i++) if (Math.max(Math.abs(i), Math.abs(j)) === ring) kand.push([c0x + i, c0z + j]);
            kand.sort((a, b) => Math.hypot(a[0] - c0x, a[1] - c0z) - Math.hypot(b[0] - c0x, b[1] - c0z));
            for (const [cx, cz] of kand) {
                const L = S.linie((cx + 0.5) * c, (cz + 0.5) * c, dx, dz);
                const ps = L.map((q) => p(Math.floor(q.x / c), Math.floor(q.z / c)));
                if (ps.every((v) => v >= pMin)) return { x: (cx + 0.5) * c, z: (cz + 0.5) * c, ring, p: ps };
            }
        }
        return null;
    };

    // Der Anteil der Zellen mit Bett (`_lastAm` p·anteil ≥ minStoff) im Streifen 160 m × `lang` m windab der Linie
    S.bettStreifen = (x, z, dx, dz, lang) => {
        const c = cs();
        const seen = new Set();
        let [n, bett] = [0, 0];
        for (let s = 0; s <= lang; s += c / 2)
            for (const q of S.linie(x + s * dx, z + s * dz, dx, dz)) {
                const k = Math.floor(q.x / c) + "," + Math.floor(q.z / c);
                if (seen.has(k)) continue;
                seen.add(k);
                n++;
                const g = r._lastAm(Math.floor(q.x / c), Math.floor(q.z / c));
                if (g && g.p * g.anteil >= AnazhRealm.BRAND.minStoff) bett++;
            }
        return { zellen: n, bett, anteil: bett / n };
    };

    // Die Karte der Bedeckung p·anteil (`_lastAm`) je Zelle im Quadrat ±halbM um (x, z), und der Ort der Linie (10 Zellen quer
    // zu (dx, dz), alle ≥ pMin), dessen Lauf windab am längsten auf Bett ≥ pMin bleibt (die drei mittleren Zellen quer) — der
    // nächste mit Lauf ≥ sollM, sonst der längste
    S.laufOrt = (x, z, halbM, dx, dz, pMin, sollM, pLauf = pMin) => {
        const c = cs();
        const n = Math.ceil(halbM / c);
        const [c0x, c0z] = [Math.floor(x / c), Math.floor(z / c)];
        const W = 2 * n + 1;
        const K = new Float32Array(W * W).fill(NaN);
        const t0 = performance.now();
        const p = (cx, cz) => {
            const i = cx - c0x + n,
                j = cz - c0z + n;
            if (i < 0 || j < 0 || i >= W || j >= W) return 0;
            const k = j * W + i;
            if (Number.isNaN(K[k])) {
                const g = r._lastAm(cx, cz);
                K[k] = g ? g.p * g.anteil : 0;
            }
            return K[k];
        };
        const pAt = (px, pz) => p(Math.floor(px / c), Math.floor(pz / c));
        let best = null,
            gezaehlt = 0;
        const kand = [];
        for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) kand.push([c0x + i, c0z + j, Math.hypot(i, j)]);
        kand.sort((a, b) => a[2] - b[2]);
        for (const [cx, cz, d] of kand) {
            const [lx, lz] = [(cx + 0.5) * c, (cz + 0.5) * c];
            if (pAt(lx, lz) < pMin) continue;
            if (!S.linie(lx, lz, dx, dz).every((q) => pAt(q.x, q.z) >= pMin)) continue;
            gezaehlt++;
            let s = 0;
            for (; s <= sollM; s += c / 2) {
                const [sx, sz] = [lx + s * dx, lz + s * dz];
                if (![-1, 0, 1].every((k) => pAt(sx - k * c * dz, sz + k * c * dx) >= pLauf)) break;
            }
            if (!best || s > best.laufM) best = { x: lx, z: lz, laufM: s, abstandZellen: d };
            if (s > sollM) break;
        }
        let bett = 0,
            gemessen = 0;
        for (const v of K) if (!Number.isNaN(v)) (gemessen++, v >= AnazhRealm.BRAND.minStoff && bett++);
        return Object.assign(best || {}, { kandidaten: gezaehlt, zellenGemessen: gemessen, zellenMitBett: bett, ms: performance.now() - t0 });
    };

    S.zaehle = () => {
        let [brennt, wartet] = [0, 0];
        for (const z of (st.brandFeld || new Map()).values()) z.t0 !== null ? brennt++ : wartet++;
        return { brennt, wartet, asche: (st.worldMeta.taten || []).filter((a) => a.tat === "brand").length };
    };

    // Der Kopf längs (dx, dz): die größte Projektion eines Eintritts (ex, ez) einer Zelle, die bis t fing, relativ zu (x0, z0)
    S.kopf = (t, x0, z0, dx, dz) => {
        let m = -Infinity;
        for (const p of S.protokoll) if (p.t <= t + 1e-9) m = Math.max(m, (p.ex - x0) * dx + (p.ez - z0) * dz);
        return m;
    };
    return S;
})();
