// diag-fern-ring.cjs — DER FERN-RING (STUFE 2, das-feld-zeichnet §2: DIE FERNE
// IST FELD). Browser-Linse (Null-Renderer + Hook, das diag-settlement-TEIL-B-
// Muster): jenseits des Voxel-Streaming-Rings zeichnet das EINE Höhen-Gesetz
// (`_terrainMacroSurfaceY(x,z,false)`) den Horizont als 3 Ring-Schalen.
// Gesetze:
//   (1) STRUKTUR — genau 3 Schalen-Meshes, Vertex-Zahlen wie deklariert
//       (FERN_RING.winkel × die Reihen je Schale aus FERN_RING.seite), EIN geteiltes Material.
//   (2) HÖHEN == GESETZ — 60 deterministische Proben-Vertices: |mesh-Höhe −
//       _terrainMacroSurfaceY(snapX, snapZ, false)| < 0.01 (bzw. die flache
//       waterLevel-Klemme; Reihe 0 trägt die Saum-Tauchkante), XZ exakt gesnappt.
//   (3) RE-ZENTRIEREN — Spieler 400 m teleportieren + Ticks pumpen → der Anker
//       wandert QUANTISIERT, der Höhen-Refresh läuft BUDGETIERT durch
//       (in Scheiben aus dem Fern-Faden, mehrere Takte), die Proben stimmen am
//       neuen Ort.
//   (4) HEADLESS-DEFAULT — ohne Hook entsteht KEIN Ring (Null-Renderer ruht).
//   (5) kein pageerror.
//   (6) SICHT-BESITZ — mit bereitem Ring weitet die
//       Kamera (far = Schale-3-aussen + 500, alter Wert gemerkt); die Luft misst gate:luft-tiefe:echt im Bild;
//       _fernRingDispose stellt camera.far wieder her (die Klippe war Ring-Besitz).
//   (9) DIE NAHT — der Ring trägt den Boden-Stoff des Chunks (dieselbe Fabrik: Wege-Karte, Geologie, Licht-
//       Knoten) und dieselbe Höhe: je Kante zwischen gebautem und freiem Chunk die Stufe Ring ↔ Chunk gegen das volle
//       Gesetz (Bias ≤ 0,15 m, p95 ≤ √(Sehne² + Abweichung des Chunks²) + 0,1 m: die Sehne des Rings und das Gitter des Chunks
//       sind unabhängige Fehler — die Summe hielt an der Stufe-2-Kante (K51, Abweichung 1,39 m) das 2-m-Tauchen nicht mehr
//       auseinander), im Gebauten zeichnet er
//       nicht (die Masken-Karte seines maskNode trägt jeden gezeichneten Chunk, kein gezeichneter Durchstich). Am Ring 3
//       (Stufe 0, 1 und 2) misst die LOCH-PROBE nach der Regel des maskNode (`_fernRingRegel`): wo er verwirft, trifft der
//       senkrechte Strahl ein gezeichnetes Deck (gemorpht, mit Stich-Band), an jeder Kante in Voxel-Kanten der Stufe, innen
//       und außen. Selbsttests: das alte 2-m-Tauchen fällt rot, ohne die Karte sticht die Sehne durch, die alte Zellen-Regel
//       zeigt Löcher.
//   (10) DIE FERN-FARBE OHNE STREIFEN — längs jeder Ring-Reihe jenseits des Karten-Horizonts der Streifen-Index
//       (RMS Nachbar-Sprung / RMS 4er-Sprung, gefaltet ≈ 1, glatt ≈ 0,25) im Median ≤ 0,5; Selbsttest am Zufall und am Sinus.
//   (11) DAS DACH IST DER BESTAND — die Deckung des Kronendachs (Fern-Farbe) gegen die Kronen-Deckung, die der Wald-
//       Generator auf 192 × 192 m um den Spieler stehen lässt (0,8–1,25); Selbsttest: die Geburt als Deckung fällt rot.
//   (15) DER HORIZONT STEHT NACH DEM SCHNEE — ein Edit-Auftrag fliegt, die Schneegrenze bestellt den Ring im selben Takt
//       neu: am Ereignis (der Fern-Faden hat jede Bestellung beantwortet, der Ring hängt ganz) zählt er nichts im Flug (am
//       Stamm 9e92be45 ROT: editFlug 1, der Horizont stand nie mehr).
// Selbsttest (immer mitgeprüft): eine absichtlich verfälschte Erwartung
// (law + 0.5) MUSS rot fallen — die Linse ist nicht vakuös.
//   node scripts/diag-fern-ring.cjs
"use strict";
const { statikServer, hauptLauf, nullSeite, pruefer, wandEnde } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.FERN_RING_PORT || 4464);

const { errs, check } = pruefer();

const server = statikServer();

hauptLauf(async () => {
    console.log("=== FERN-RING (STUFE 2) — Browser, Null-Renderer + Hook ===");
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ art: "linse", frist: 240000 });
    await server.zeige(page, 30000);

    const out = await page.evaluate(async () => {
        const res = {};
        await window.__weltDa(() => !(!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.scene ||
                !window.anazhRealm.state.playerMesh ||
                !window.anazhRealm.state.worldMeta));
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.scene) return { fatal: "anazhRealm/scene kam nie" };
        const F = r.constructor.FERN_RING;
        // je Schale ihre volle Geometrie (der Träger: das ganze Index-Muster); vor der Teilung (K16 Runde 3) je Schale ein Mesh
        const geosVon = (f) => f.geos || f.meshes.map((m) => m.geometry);
        // DAS EINE QUANTIL der Linse: p der sortierten Werte (am Rand geklemmt), leer NaN
        const quantil = (a, p) => (
            a.sort((x, y) => x - y),
            a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : NaN
        );
        // DER FLUSS IN DER MASCHE als Erwartung der Linse (die Formel des Fern-Fadens `fernFlussDeckung`, B2): der Anteil einer
        // Masche (halbe Kante hs), den das Wasser des nächsten Segments deckt (`_hydroDistAt`)
        const flussDeckungL = (x, z, hs, aus) => {
            const f = r._hydroDistAt(x, z);
            if (aus) aus.spiegel = f.spiegel;
            if (!(f.dist < Infinity)) return 0;
            const w = f.halfW;
            if (!(hs > 0)) return f.dist <= w ? 1 : 0;
            return Math.max(0, Math.min(f.dist + hs, w) - Math.max(f.dist - hs, -w)) / (2 * hs);
        };
        const p0 = { x: r.state.playerMesh.position.x, z: r.state.playerMesh.position.z };

        // ===== (4) HEADLESS-DEFAULT: ohne Hook entsteht KEIN Ring =====
        // (Hook sichern + wiederherstellen — die __anazhAutoSettlement-Disziplin.)
        const prevHook = window.__anazhFernRing;
        delete window.__anazhFernRing;
        for (let t = 0; t < 5; t++) r._tickFernRing(r.state.playerMesh.position);
        res.headlessQuiet = r.state.fernRing === null || r.state.fernRing === undefined;

        // ===== Hook AN: der Ring entsteht in Scheiben aus dem Fern-Faden (B2) =====
        window.__anazhFernRing = true;
        // Der Takt bestellt Scheiben (`FERN_RING.scheibe`) beim Fern-Faden und hängt die Antworten ein — die Linse pumpt den
        // Takt mit einer Pause je Takt (die Antworten brauchen die Ereignis-Schleife), bis der Cursor durch ist.
        // DER TAKT DES RINGS bis zur Bedingung (Deckel: `ms` / 16 Takte ohne Offenes): je Takt die Zahl der eingehängten Punkte
        const pumpe = async (
            pos,
            fertig = (f) => f.cursor >= f.totalVerts,
            ms = 120000,
            takt = () => r._tickFernRing(pos)
        ) => {
            let takte = 0;
            let maxD = 0;
            let vor = r.state.fernRing ? r.state.fernRing.cursor : 0;
            for (const weiter = window.__deckel("der Fern-Ring", ms / 16); weiter(); await sleep(16)) {
                takt();
                takte++;
                const f = r.state.fernRing;
                if (f) [maxD, vor] = [Math.max(maxD, f.cursor - vor), f.cursor];
                if (f && fertig(f)) break;
            }
            return { takte, maxD };
        };
        let ticks = 0;
        let maxDelta = 0;
        {
            r._tickFernRing(r.state.playerMesh.position);
            if (!r.state.fernRing) return { fatal: "Hook an, aber kein fernRing entstand" };
            const b = await pumpe(r.state.playerMesh.position);
            ticks = b.takte + 1;
            maxDelta = b.maxD;
        }
        const fr = r.state.fernRing;
        const frBau = fr;
        res.buildTicks = ticks;
        res.buildMaxDelta = maxDelta;
        res.buildBudgeted =
            maxDelta > 0 && maxDelta <= F.scheibe * F.scheibenImFlug && ticks >= 2 && fr.cursor === fr.totalVerts;
        res.ready = fr.ready === true;

        // ===== (1) STRUKTUR: 3 Schalen, deklarierte Vertex-Zahlen, EIN Material =====
        // Die Reihen je Schale, unabhängig nachgerechnet: Reihen-Faktor 1 + seite·2π/winkel (die Masche höchstens
        // seite : 1), geometrisch von inner bis aussen.
        const qRing = 1 + (F.seite * 2 * Math.PI) / F.winkel;
        const reihenSoll = fr.schalen.map((sh) => Math.ceil(Math.log(sh.aussen / sh.inner) / Math.log(qRing)) + 1);
        const offSoll = [];
        let summeSoll = 0;
        for (const rr of reihenSoll) {
            offSoll.push(summeSoll);
            summeSoll += rr * F.winkel;
        }
        res.meshCount = fr.meshes.length;
        res.vertCounts = geosVon(fr).map((g) => g.attributes.position.count);
        res.reihen = reihenSoll;
        res.vertsDeclared =
            res.vertCounts.length === reihenSoll.length &&
            res.vertCounts.every((c, s) => c === reihenSoll[s] * F.winkel) &&
            fr.totalVerts === summeSoll;
        // ZWEI STOFFE (K16, die Kosten an der Naht): der freie (ohne Maske und Weiche) trägt die Schalen 1, 2 und die freien
        // Dreiecke der Schale 0, der Naht-Stoff (maskNode + depthNode) nur das Naht-Mesh der Schale 0
        const stoffe = fr.stoffe || {};
        res.zweiStoffe =
            !!stoffe.frei &&
            !!stoffe.naht &&
            !stoffe.frei.maskNode &&
            !stoffe.frei.depthNode &&
            !!stoffe.naht.maskNode &&
            !!stoffe.naht.depthNode &&
            fr.meshes.filter((m) => m.material === stoffe.naht).length === 1 &&
            fr.meshes.every((m) => m.material === stoffe.frei || m.material === stoffe.naht);
        res.sceneMeshes = 0;
        r.state.scene.traverse((n) => {
            if (n.isMesh && n.userData && n.userData.inventar === "fern-ring") res.sceneMeshes++;
        });
        res.visible = fr.meshes.every((m) => m.visible === true);
        res.flags = fr.meshes.every((m) => m.frustumCulled === false && !m.castShadow && m.receiveShadow === true);
        // DER LOCH-DECKEL: Schale 1 beginnt DIREKT am Spieler (0.5·span)
        // — der Ring deckt jedes Chunk-Loch (die Wasser-Plane samt Spekular bleibt
        // verdeckt); gebaute Chunks decken ihn per Depth. deckZoneRad trägt die
        // Chunk-Ziel-Zone, in der die Reihen das VOLLE Gesetz gesenkt tragen.
        const cfg = r._voxelChunkConfig();
        const targetRing = Math.max(1, Math.min(12, r.state.chunkRingRadius || 4));
        res.innerRandOk =
            Math.abs(fr.schalen[0].inner - cfg.span * 0.5) < 1e-9 &&
            Math.abs(fr.deckZoneRad - (targetRing + 0.5) * cfg.span) < 1e-9;

        // ===== (2) HÖHEN == GESETZ: 60 deterministische Proben-Vertices =====
        // Die Erwartung UNABHÄNGIG nachgerechnet (Schalen-Layout + Snap + Klemme
        // + Saum) — das Gesetz selbst kommt aus _terrainMacroSurfaceY (EINE Quelle).
        const probeVertex = (gIdx, fudge, ring) => {
            const fr = ring || frBau;
            let s = 0;
            while (s < offSoll.length - 1 && gIdx >= offSoll[s + 1]) s++;
            const li = gIdx - offSoll[s];
            const row = (li / F.winkel) | 0;
            const ai = li - row * F.winkel;
            const sh = fr.schalen[s];
            // GEOMETRISCHE Reihen + NAHT-VEREDELUNG — die Erwartung
            // spiegelt das LIVE-Layout (nah dicht, fern weit; Innen-Reihen der
            // ersten Schale tragen das volle Gesetz leicht gesenkt).
            const rad = sh.inner * Math.pow(sh.aussen / sh.inner, row / (reihenSoll[s] - 1));
            const ang = (ai / F.winkel) * Math.PI * 2;
            const sx = Math.round((fr.anchorX + Math.cos(ang) * rad) / sh.snap) * sh.snap;
            const sz = Math.round((fr.anchorZ + Math.sin(ang) * rad) / sh.snap) * sh.snap;
            const wl = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            // DIE NAHT (K16, gespiegelt): die Lage zum Gebauten aus den acht Nachbarn der Schale (_chunkDecktRing ist die Quelle).
            const orte = (rr, aa) => {
                const rd = sh.inner * Math.pow(sh.aussen / sh.inner, rr / (reihenSoll[s] - 1));
                const an = (aa / F.winkel) * Math.PI * 2;
                return [
                    Math.round((fr.anchorX + Math.cos(an) * rd) / sh.snap) * sh.snap,
                    Math.round((fr.anchorZ + Math.sin(an) * rd) / sh.snap) * sh.snap,
                ];
            };
            // an der Naht: der Punkt selbst oder einer der acht um ihn steht im Gebauten (`_fernRingNaht`)
            let naht = false;
            if (s === 0 && rad <= fr.bauZoneRad) {
                naht = r._chunkDecktRing(sx, sz);
                for (let dr = -1; dr <= 1 && !naht; dr++)
                    for (let da = -1; da <= 1 && !naht; da++) {
                        if ((!dr && !da) || row + dr < 0 || row + dr >= reihenSoll[s]) continue;
                        naht = r._chunkDecktRing(...orte(row + dr, (ai + da + F.winkel) % F.winkel));
                    }
            }
            // die Ecke eines Naht-Dreiecks trägt die Fläche des Feldes, sobald die Deck-Wache sie maß (`feldY`, K16)
            const randV = fr.teilung && fr.teilung.randV;
            const feld = s === 0 && randV && randV[li] && fr.feldY ? fr.feldY[gIdx] : NaN;
            let law = r._terrainMacroSurfaceY(sx, sz, false);
            // LOCH-DECKEL-Formel (gespiegelt): Zone = volles Gesetz −0.3, ×1.35-Blende auf Makro.
            if (s === 0 && rad <= fr.deckZoneRad * 1.35) {
                const w = rad <= fr.deckZoneRad ? 1 : (fr.deckZoneRad * 1.35 - rad) / (fr.deckZoneRad * 0.35);
                const voll = r._terrainMacroSurfaceY(sx, sz, true);
                law = law + (voll - law) * w - 0.3 * w;
            }
            if (feld === feld) law = feld;
            else if (naht) law = r._terrainMacroSurfaceY(sx, sz, true);
            // das Wasser des Punkts ist das Wasser des Bodens (`_fernNass`: Kanal, See, Meer)
            const nass = {};
            const nassHier = r._fernNass(sx, sz, law, wl, nass);
            let expY = nassHier ? nass.spiegel - r._fernRingWasserTiefe() : nass.y;
            // der Fluss in der Masche: das Mittel aus Boden und Spiegel nach seinem Anteil (`_fernRingY`, Band 14)
            if (!nassHier) {
                const pf = r._fernRingPunkt(fr, gIdx).fuss;
                const fl = {};
                const c = flussDeckungL(sx, sz, pf ? Math.max(pf.ht, pf.hr) : 0, fl);
                if (c > 0 && fl.spiegel === fl.spiegel) expY += (fl.spiegel - expY) * c;
            }
            if (row === 0) expY -= F.saumDrop;
            // Im Gebauten taucht der Ring nicht mehr: er trägt dort das volle Gesetz und verwirft sein Fragment (die
            // Masken-Karte, Band 9).
            // Selbsttest-Verfälschung NACH der Klemme (sonst bliebe eine wasser-
            // geklemmte Probe trotz Fudge grün — der Selbsttest wäre lückenhaft):
            expY += fudge || 0;
            const pos = geosVon(fr)[s].attributes.position;
            const okXZ = pos.getX(li) === sx && pos.getZ(li) === sz;
            const okY = Math.abs(pos.getY(li) - expY) < 0.01;
            return { ok: okXZ && okY, okXZ, okY, dy: Math.abs(pos.getY(li) - expY) };
        };
        // 60 Proben, deterministisch über alle Schalen/Reihen gestreut (149 ist
        // teilerfremd zu totalVerts) — inkl. Reihe-0-Saum und Wasser-Klemme.
        const probeAll = (fudge) => {
            let bad = 0;
            let worst = 0;
            for (let k = 0; k < 60; k++) {
                const p = probeVertex((k * 149) % fr.totalVerts, fudge);
                if (!p.ok) bad++;
                if (p.dy > worst) worst = p.dy;
            }
            return { bad, worst };
        };
        const p1 = probeAll(0);
        res.probesBad = p1.bad;
        res.probesWorst = p1.worst;
        // SELBSTTEST: die verfälschte Erwartung (law + 0.5) MUSS rot fallen.
        const pf = probeAll(0.5);
        res.selftestRed = pf.bad === 60;

        // ===== (2c) DAS EINE WASSER (1110-2, die Ufer-Klumpen): unter dem Fern-Wasser trägt der Ring kein zweites =====
        // Lebt das Fern-Wasser, liegt jeder nasse Ring-Punkt unter dessen tiefstem Tal (Spiegel − FAR_WATER.drop − Hub);
        // ein Punkt darüber zeigt sich in jedem tiefen Tal als dunkler Klumpen. Der Ring dieser Probe trägt ein Fern-Wasser
        // als Stellvertreter, wenn die Seite keins gebaut hat (der Null-Renderer streamt nicht); die nassen Punkte setzt die
        // EINE Naht (`_fernRingWasserNeu`). Der Hub liest die Wind-Zeile des Gesetzes (Konsum: ein anderer Wind im Gesetz
        // ändert ihn im Verhältnis). Selbsttest: die alte Regel (Spiegel − wasserDrop) MUSS rot fallen.
        {
            // DER SPIEGEL DER PROBE AUS DER WELT: trägt der Ring um den Start kein Meer (das Flussnetz-Gelände liegt dort
            // über dem Spiegel — die Probe war leer), hebt die Probe den Spiegel auf das 10-%-Quantil seiner Höhen (die Regel ist
            // eine Funktion des Spiegels) und legt danach jeden so genässten Punkt mit dem alten Spiegel zurück.
            const wl0 = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            let wlW = wl0;
            {
                const bis = Math.min(fr.totalVerts, fr.cursor);
                const hs = [];
                let nass0 = 0;
                for (let g = 0; g < bis; g++) {
                    const h = fr.law[g];
                    if (fr.nass[g]) nass0++;
                    if (h === h) hs.push(h);
                }
                if (nass0 < 50 && hs.length) wlW = quantil(hs, 0.1);
            }
            res.wasserSpiegel = { welt: +wl0.toFixed(2), probe: +wlW.toFixed(2) };
            r.state.waterLevel = wlW;
            const FW = r.constructor.FAR_WATER;
            const fwAlt = r.state.farWater;
            const zaehlen = () => {
                // je Punkt SEIN Spiegel (Meer, See, Fluss: `_fernNass` über die EINE Setz-Formel `_fernRingY`)
                const hub = FW.drop + r.constructor._wasserHubM();
                const aus = {};
                let tal = Infinity;
                let nass = 0,
                    klumpen = 0,
                    hoechster = -Infinity;
                for (let g = 0; g < Math.min(fr.totalVerts, fr.cursor); g++) {
                    if (!fr.nass[g]) continue;
                    const pp = r._fernRingPunkt(fr, g);
                    if (pp.s === 0 && pp.row === 0) continue; // die Saum-Tauchkante liegt ohnehin tiefer
                    const y = geosVon(fr)[pp.s].attributes.position.getY(pp.li);
                    r._fernRingY(fr, pp, wlW, aus);
                    const talP = aus.spiegel - hub;
                    if (talP < tal) tal = talP;
                    nass++;
                    if (y > talP + 1e-3) klumpen++;
                    if (y > hoechster) hoechster = y;
                }
                return { nass, klumpen, tal: +tal.toFixed(2), hoechster: +hoechster.toFixed(2) };
            };
            const tiefe0 = Object.getPrototypeOf(r)._fernRingWasserTiefe;
            // der Spiegel der Probe: jenseits der Kacheln ist er das Meer — der Faden gab jedem Punkt seinen Spiegel
            // (`fr.spiegel`), die Probe hebt ihn für die Punkte unter wlW und legt ihn danach zurück
            const spiegel0 = fr.spiegel.slice();
            const probeSpiegel = (an) => {
                for (let g = 0; g < Math.min(fr.totalVerts, fr.cursor); g++)
                    if (fr.law[g] < wlW) {
                        fr.spiegel[g] = an ? Math.max(spiegel0[g], wlW) : spiegel0[g];
                        r._fernRingSetzVertex(fr, r._fernRingPunkt(fr, g), an ? wlW : wl0);
                    }
            };
            try {
                if (!fwAlt || !fwAlt.mesh) r.state.farWater = { mesh: { stellvertreter: true } };
                // der Spiegel der Probe nässt jenseits der Kacheln (dort ist er das Meer): die EINE Naht setzt die Punkte neu
                if (wlW !== wl0) probeSpiegel(true);
                fr.wasserTiefe = undefined;
                r._fernRingWasserNeu(fr);
                res.wasser = zaehlen();
                // der eingespielte Täter: der Ring trägt sein eigenes Wasser 0,4 m unter dem Spiegel
                r._fernRingWasserTiefe = () => F.wasserDrop;
                fr.wasserTiefe = undefined;
                r._fernRingWasserNeu(fr);
                res.wasserAlt = zaehlen();
            } finally {
                if (r._fernRingWasserTiefe !== tiefe0) delete r._fernRingWasserTiefe;
                r.state.farWater = fwAlt;
                r.state.waterLevel = wl0;
                // die Punkte, die nur der Spiegel der Probe nässte, liegen wieder auf ihrem Gesetz
                if (wlW !== wl0) probeSpiegel(false);
                fr.wasserTiefe = undefined;
                r._fernRingWasserNeu(fr);
            }
            // der Hub liest das Gesetz: die Wind-Zeile hebt die Dünung, der Treiber (A12) das Kräuseln — beide doppelt heben
            // ihn im Verhältnis, jede allein hebt ihn (keine Zeile ist ein toter Zwilling)
            const K = r.constructor, G0 = K.Gesetz, W0 = K.WASSER_WELLE, WG = G0("terrain:WASSER_GESETZ", null);
            const hubMit = (w, t) => {
                K.Gesetz = (pfad, fb) => (pfad === "terrain:WASSER_GESETZ" ? { ...WG, wind: WG.wind.map((x) => x * w) } : G0(pfad, fb));
                K.WASSER_WELLE = { ...W0, treiber: W0.treiber.map((x) => x * t) };
                try {
                    return K._wasserHubM();
                } finally {
                    [K.Gesetz, K.WASSER_WELLE] = [G0, W0];
                }
            };
            res.hub = { hub: hubMit(1, 1), beide: hubMit(2, 2), nurWind: hubMit(2, 1), nurTreiber: hubMit(1, 2), wind: WG.wind, treiber: W0.treiber };
        }

        // ===== (3) RE-ZENTRIEREN: 400 m Teleport + Ticks pumpen =====
        const oldAnchorX = fr.anchorX;
        const p2 = { x: p0.x + 400, z: p0.z };
        // synchroner Block (Teleport + Pump ohne await — kein RAF-Interleave):
        let ticks2 = 0;
        let maxDelta2 = 0;
        {
            r.state.playerMesh.position.x = p2.x;
            r.state.playerMesh.position.z = p2.z;
            const refreshedBefore = fr.refreshed;
            const pos2 = { x: p2.x, z: p2.z };
            // DER HAUPT-FADEN RECHNET KEIN FERN-GESETZ (B2): während der Re-Anker eingehängt wird, zählt die Linse jeden Ruf
            // des Höhen-Gesetzes und der Boden-Farbe AUS dem Takt des Rings (die Zähler leben nur um den Ruf von
            // `_tickFernRing`, solange der Cursor läuft) — Soll 0; der Selbsttest ruft das Gesetz einmal im Fenster.
            const gesetz = { rufe: 0, an: false };
            const tms = r._terrainMacroSurfaceY;
            const bfa = r._bodenFarbeAt;
            r._terrainMacroSurfaceY = function (...a) {
                if (gesetz.an) gesetz.rufe++;
                return tms.apply(this, a);
            };
            r._bodenFarbeAt = function (...a) {
                if (gesetz.an) gesetz.rufe++;
                return bfa.apply(this, a);
            };
            try {
                gesetz.an = true;
                r._tickFernRing(pos2); // Re-Anker: Cursor 0 + die ersten Scheiben bestellt
                gesetz.an = false;
                res.anchorMoved = fr.anchorX !== oldAnchorX;
                res.anchorQuantized =
                    fr.anchorX === Math.round(p2.x / F.anchorQuant) * F.anchorQuant &&
                    fr.anchorZ === Math.round(p2.z / F.anchorQuant) * F.anchorQuant;
                const c1 = fr.cursor; // der erste Takt des Re-Ankers hängt ab 0 ein
                const b2 = await pumpe(pos2, (f) => f.cursor >= f.totalVerts, 120000, () => {
                    gesetz.an = fr.cursor < fr.totalVerts;
                    r._tickFernRing(pos2);
                    gesetz.an = false;
                });
                [ticks2, maxDelta2] = [b2.takte + 1, Math.max(c1, b2.maxD)];
                res.gesetzImTakt = gesetz.rufe;
                gesetz.an = true;
                r._terrainMacroSurfaceY(p2.x, p2.z, false); // der Selbsttest: EIN Ruf im Fenster
                gesetz.an = false;
                res.gesetzSelbsttest = gesetz.rufe - res.gesetzImTakt;
            } finally {
                delete r._terrainMacroSurfaceY;
                delete r._bodenFarbeAt;
            }
            res.refreshRan = fr.refreshed - refreshedBefore === fr.totalVerts;
            const p3 = probeAll(0);
            res.probes2Bad = p3.bad;
            res.probes2Worst = p3.worst;
        }
        res.reanchorTicks = ticks2;
        res.reanchorBudgeted = maxDelta2 > 0 && maxDelta2 <= F.scheibe * F.scheibenImFlug && ticks2 >= 2;

        // ===== (6) SICHT-BESITZ: Kamera-Weitung + Höhen-Öffnung + Rücknahme =====
        // Die Weitung geschah beim Pump (Ring wurde ready): far = Schale-3 + 500.
        const camFarWide = F.schalen[F.schalen.length - 1].aussen + 500;
        res.camFar = r.state.camera.far;
        res.camFarWide = camFarWide;
        res.camFarAlt = r._fernRingCamFarAlt;
        res.camWidened =
            r.state.camera.far === camFarWide &&
            Number.isFinite(r._fernRingCamFarAlt) &&
            r._fernRingCamFarAlt < camFarWide;
        // Die RÜCKNAHME: der Dispose stellt das alte far wieder her (Ring-Besitz).
        const altVorDispose = r._fernRingCamFarAlt;
        r._fernRingDispose();
        res.disposeRestored = r.state.camera.far === altVorDispose && r.state.fernRing === null;

        // ===== (7) DER NEUBAU AUS DEM FADEN: nach dem Dispose entsteht der Ring wieder ganz (B2) =====
        r._tickFernRing(r.state.playerMesh.position);
        const fr7 = r.state.fernRing;
        await pumpe(r.state.playerMesh.position);
        res.fzCpuFertig = !!(fr7 && fr7.cursor >= fr7.totalVerts && fr7.ready === true);

        // ===== (8) DER FELD-PASS: die Ferne ganz ohne Schalen-Geometrie =====
        // Der Pass ist Ring-Besitz (_tickFeldPass aus _tickFernRing): warte auf
        // den EINEN Mal-Flug (die Höhen aus gelaende-core), prüfe Struktur + Daten-
        // Parität (Texel-Höhe == f64-Gesetz im Seh-Band), dann die ECHTE
        // Render-Probe: ein WebGPURenderer zeichnet den Fullscreen-Raymarch —
        // der Horizont MUSS Pixel treffen (Kompilat + Lauf + Treffer bewiesen).
        const P8 = r.constructor.FELD_PASS;
        let fp8 = r.state.feldPass;
        // SCHATTIERUNGS-PERSISTENZ: sichtbar erst mit gebackenem
        // PANORAMA (der Fragment-March ist tot, der Blick liest das Panorama) —
        // die Probe wartet auf Feld-Anstrich UND Panorama-Bake.
        for (const weiter = window.__deckel("Feld-Anstrich und Panorama", 900); (!fp8 || fp8.laeufe < 1 || !(fp8.panoLaeufe >= 1)) && weiter(); ) {
            r._tickFernRing(r.state.playerMesh.position);
            fp8 = r.state.feldPass;
            await sleep(100);
        }
        res.fpDa = !!fp8;
        res.fpLaeufe = fp8 ? fp8.laeufe : 0;
        res.fpPanoLaeufe = fp8 ? fp8.panoLaeufe : 0;
        res.fpTexOk = !!(fp8 && fp8.tex && fp8.tex.image.width === P8.az && fp8.tex.image.height === P8.rad);
        res.fpSichtbar = !!(fp8 && fp8.mesh.visible === true);
        let fpWorst = -1;
        if (fp8 && fp8.laeufe >= 1) {
            fpWorst = 0;
            const F8 = r.constructor.FERN_RING;
            const rMin8 = F8.schalen[F8.schalen.length - 1].aussen;
            const wl8 = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            for (let k = 0; k < 40; k++) {
                const ix = (k * 37) % P8.az;
                const iy = (k * 11) % P8.rad;
                const rr = rMin8 + ((iy + 0.5) / P8.rad) * (P8.rMaxM - rMin8);
                const aa = ((ix + 0.5) / P8.az - 0.5) * 2 * Math.PI;
                const law8 = r._terrainMacroSurfaceY(
                    fp8.anchorX + Math.cos(aa) * rr,
                    fp8.anchorZ + Math.sin(aa) * rr,
                    false
                );
                const want8 = law8 < wl8 ? wl8 : law8;
                const d8 = Math.abs(fp8.daten[(iy * P8.az + ix) * 4] - want8);
                if (d8 > fpWorst) fpWorst = d8;
            }
        }
        res.fpWorst = fpWorst;
        // Die ECHTE Render-Probe (der Null-Renderer der Seite zeichnet nie):
        try {
            const szene8 = new THREE.Scene();
            const alterParent = fp8 ? fp8.mesh.parent : null;
            if (fp8) szene8.add(fp8.mesh);
            const cam8 = new THREE.PerspectiveCamera(60, 1.5, 1, 45000);
            const bodenY = r._terrainMacroSurfaceY(fp8.anchorX, fp8.anchorZ, false);
            cam8.position.set(fp8.anchorX, bodenY + 60, fp8.anchorZ);
            cam8.lookAt(fp8.anchorX + 1000, bodenY + 40, fp8.anchorZ);
            cam8.updateMatrixWorld(true);
            fp8.U.camPos.value.copy(cam8.position);
            fp8.U.invVP.value.multiplyMatrices(cam8.projectionMatrix, cam8.matrixWorldInverse).invert();
            const ren8 = new THREE.WebGPURenderer({ antialias: false });
            await ren8.init();
            ren8.setSize(96, 64, false);
            const rt8 = new THREE.RenderTarget(96, 64);
            ren8.setRenderTarget(rt8);
            const bild = async () => {
                await ren8.renderAsync(szene8, cam8);
                return ren8.readRenderTargetPixelsAsync(rt8, 0, 0, 96, 64);
            };
            const summe = (b, px) => (b[px * 4 + 3] > 0 ? b[px * 4] + b[px * 4 + 1] + b[px * 4 + 2] : 0);
            // DIE LUFT LIEST DIE EINE ATMOSPHÄRE (D3): ihre In-Streuung ist die Himmels-Sicht der Tafeln, die der Renderer
            // der Welt je Takt zeichnet (`_atmoTakt`) — die Probe zeichnet sie auf IHREM Renderer, wie der Spiel-Frame es
            // tut. Selbsttest (Konsum): ohne die Tafeln fehlt jedem Treffer-Pixel die In-Streuung — die Luft hebt ihn mit den Tafeln
            // um ≥ 24/765 (die Ferne jenseits 8 km ist Luft). Bis B2 zählte die Probe Pixel über Schwarz: das hing am Licht des
            // Feldes (`l0c` an der Basis zur Probe noch 0, der Takt lief synchron), nie an der Luft.
            const ohne8 = await bild();
            const A8 = r._atmoLutBau();
            const welt8 = r.state.renderer;
            r.state.renderer = ren8;
            try {
                r._atmoZeichne(A8.qT, A8.rtT);
                r._atmoZeichne(A8.qMS, A8.rtMS);
                r._atmoZeichne(A8.qSV, A8.rtSV);
            } finally {
                r.state.renderer = welt8;
            }
            ren8.setRenderTarget(rt8);
            const mit8 = await bild();
            [res.fpTreffer, res.fpLuftGehoben] = [0, 0];
            for (let px = 0; px < 96 * 64; px++)
                if (summe(mit8, px) > 0) [res.fpTreffer, res.fpLuftGehoben] = [res.fpTreffer + 1, res.fpLuftGehoben + (summe(mit8, px) - summe(ohne8, px) >= 24)];
            ren8.dispose();
            if (fp8 && alterParent) alterParent.add(fp8.mesh);
        } catch (e8) {
            res.fpRenderErr = (e8 && e8.message) || String(e8);
        }
        // ===== (8b) DAS EINBLENDEN: die Geburt eines fern entstandenen Satzes dithert ein =====
        // Zwei Probe-Sätze (EIN Kasten) bei sichtbarem Feld-Pass: mit `einblenden` beginnt Texel 5.w bei 1 (ganz
        // verworfen) und der Schwund-Takt löst ihn über WELT_SCHWUND_MS auf 0; ohne erscheint er sofort (0). Der Nebel
        // verdeckte solche Geburten bis V18.530 (ein fern gespawntes Tier ploppte sichtbar).
        try {
            const fp8b = r.state.feldPass;
            if (fp8b && fp8b.mesh) fp8b.mesh.visible = true;
            const wm8 = r._weltMarchEnsure();
            const kasten = () => [{ box: true, c: { x: 0, y: 0, z: 0 }, h: { x: 1, y: 1, z: 1 } }];
            const hE = r._weltKapselSpawn("probe:einblenden", null, kasten, true);
            const hS = r._weltKapselSpawn("probe:sofort", null, kasten, false);
            const L8 = wm8.listeDaten;
            const MS = r.constructor.WELT_SCHWUND_MS;
            res.einStart = hE ? L8[hE.feld * 32 + 23] : -1;
            res.sofortStart = hS ? L8[hS.feld * 32 + 23] : -1;
            await sleep(MS / 2);
            r._weltSchwundTakt(wm8);
            res.einMitte = hE ? L8[hE.feld * 32 + 23] : -1;
            await sleep(MS / 2 + 60);
            r._weltSchwundTakt(wm8);
            res.einEnde = hE ? L8[hE.feld * 32 + 23] : -1;
            res.einAus = !!hE && !wm8.schwund.has(hE);
            if (hE) r._weltFeldFrei(hE);
            if (hS) r._weltFeldFrei(hS);
        } catch (e8b) {
            res.einErr = String((e8b && e8b.message) || e8b);
        }
        // ===== (9) DIE NAHT: gebauter Boden ↔ Ring — dieselbe Höhe, derselbe Stoff =====
        // Der Bestand steht still (2 s ohne neuen Chunk), dann baut der Ring SYNCHRON neu (kein await: kein Chunk kommt
        // dazwischen) und die Linse misst, was gezeichnet wird: je Kante zwischen gebautem und freiem Chunk alle 3 m die Höhe
        // des Rings 0,3 m draußen gegen die des Chunks 0,3 m drinnen (Strahl von oben auf die Meshes), im Gebauten auf einem
        // 6-m-Raster den Durchstich (Ring > Chunk + 5 cm), und ob der Ring-Stoff der Boden-Stoff des Chunks ist (die Gesetze
        // `_wegeBodenFarbe` und `_terrainGeologyAlbedo` bauen ihn, die Licht-Knoten des Chunk-Stoffs trägt er).
        try {
            const T9 = THREE;
            const gebaut9 = () => {
                let n = 0;
                for (const e of r.state.voxelChunks ? r.state.voxelChunks.values() : [])
                    if (e && !e.empty && e.mesh) n++;
                return n;
            };
            // Der Null-Renderer treibt keinen Loop: die Linse pumpt den Spiel-Takt (das diag-boot-stage-Muster), bis der
            // Ring steht oder der Bestand 3 s ruht. RING 3 (7 × 7, gehalten gegen den Boot-Ramp, das diag-chunk-seam-Muster):
            // die äußere Reihe trägt Stufe 2 (BODEN_STUFEN: L0 bis Ring 1, L1 Ring 2) — die Bau-Kante des Spiels und die
            // Stufen-Nähte 0 ↔ 1 ↔ 2 stehen im Satz (mit dem 5 × 5-Satz sah die Linse nur Stufe 0).
            const t09 = performance.now();
            const ziel9 = 3;
            r.state.chunkRingRadius = ziel9;
            r.state._activeRingRadius = ziel9;
            let n9 = -1;
            let still9 = 0;
            for (let t = 0, weiter = window.__deckel("die Naht-Stufen im Ring 3", 20000); weiter(); t++) {
                r.state._activeRingRadius = ziel9;
                try {
                    r._gameLoopTick();
                } catch {
                    /* ein Takt-Fehler zählt im pageerror-Band */
                }
                if (t % 5 === 0) await sleep(0);
                const n = gebaut9();
                if (n !== n9) {
                    n9 = n;
                    still9 = t;
                } else if (n >= (2 * ziel9 + 1) ** 2 || (n >= 9 && t - still9 > 60 && !r._weltOffen().chunks)) break;
            }
            res.nahtStufen = [...r.state.voxelChunks.values()].reduce((a, e) => {
                if (e && !e.empty && e.mesh) a[e.lod || 0] = (a[e.lod || 0] || 0) + 1;
                return a;
            }, {});
            const tPump9 = performance.now();
            res.nahtChunks = n9;
            const spion = { geo: 0, wege: 0 };
            const tga = r._terrainGeologyAlbedo;
            const wbf = r._wegeBodenFarbe;
            r._terrainGeologyAlbedo = function (...a) {
                spion.geo++;
                return tga.apply(this, a);
            };
            r._wegeBodenFarbe = function (...a) {
                spion.wege++;
                return wbf.apply(this, a);
            };
            r._fernRingDispose();
            const pos9 = r.state.playerMesh.position;
            r._tickFernRing(pos9);
            await pumpe(pos9);
            // DIE DECK-WACHE SCHWINGT EIN: der Rand der Naht misst die Fläche des Feldes in der Wache, gedeckelt je
            // Takt (`_fernRingFeldY`, FERN_RING.feldJeTakt) — wie im Spiel nach jedem Anker: die Linse pumpt, bis jeder
            // Rand-Punkt sie trägt (höchstens 3 000 Takte), und nennt die Takte und die Kosten einer Spalten-Probe.
            {
                const f9 = r.state.fernRing;
                const randOffen = () => {
                    if (!f9 || !f9.feldY || f9.zoneVerts === undefined) return -1;
                    let n = 0;
                    for (let g = 0; g < f9.zoneVerts; g++)
                        if (f9.feldY[g] !== f9.feldY[g] && f9.teilung.randV && f9.teilung.randV[g]) n++;
                    return n;
                };
                let t = 0;
                for (; t < 3000; t++) {
                    r._tickFernRing(pos9);
                    if (t % 25 === 24 && randOffen() <= 0) break;
                }
                res.feldTakte = t + 1;
                res.feldOffen = randOffen();
                // die Ecken ohne Fläche des Feldes (`_fernRingFeldY` zählt sie, `feldOhne`): dort stünde der Ring auf dem Gesetz
                res.feldOhne = f9 ? f9.feldOhne | 0 : -1;
                const rand = [];
                for (let g = 0; f9 && f9.feldY && g < f9.zoneVerts && rand.length < 100; g++) {
                    const p = r._fernRingPunkt(f9, g);
                    if (f9.teilung.randV && f9.teilung.randV[g]) rand.push(p);
                }
                const tF = performance.now();
                for (const p of rand) r._voxelSurfaceY(p.x, p.z);
                res.feldUs = rand.length ? Math.round(((performance.now() - tF) * 1000) / rand.length) : NaN;
                res.feldRand = rand.length;
            }
            delete r._terrainGeologyAlbedo;
            delete r._wegeBodenFarbe;
            const fr9 = r.state.fernRing;
            res.nahtStoffGeo = spion.geo;
            res.nahtStoffWege = spion.wege;
            const cm = r.state.voxelChunkMaterial;
            const slots = (m) => ["colorNode", "normalNode", "roughnessNode", "outputNode"].filter((k) => m && m[k]);
            res.nahtSlotsChunk = slots(cm).join(",");
            const stoffNaht9 = fr9 && (fr9.stoffe ? fr9.stoffe.naht : fr9.material);
            res.nahtSlotsRing = slots(stoffNaht9).join(",");
            r.state.scene.updateMatrixWorld(true);
            const ray = new T9.Raycaster();
            const ab = new T9.Vector3(0, -1, 0);
            const o9 = new T9.Vector3();
            const hoch = (obj, x, z) => {
                o9.set(x, 4000, z);
                ray.set(o9, ab);
                ray.far = 9000;
                const h = ray.intersectObject(obj, false);
                return h.length ? h[0].point.y : null;
            };
            const span9 = r._voxelChunkConfig().span;
            const wl9 = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            // die volle Schale 0 (der Träger, das ganze Index-Muster) — der Strahl trifft jedes ihrer Dreiecke, ob frei oder Naht
            const ringMesh = new T9.Mesh(geosVon(fr9)[0], new T9.MeshBasicMaterial({ side: T9.DoubleSide }));
            // DIE RING-HÖHE ÜBER EIN FACH-RASTER (8 m): der Strahl prüft nur die Dreiecke der Schale 0, deren Kasten den Punkt
            // trägt — der Strahl gegen die ganze Schale (15 000 Dreiecke je Probe) trug den Großteil der Linsen-Zeit.
            const ringFach = new Map();
            {
                const P = ringMesh.geometry.attributes.position;
                const I = ringMesh.geometry.index.array;
                for (let t = 0; t < I.length; t += 3) {
                    let x0 = Infinity;
                    let x1 = -Infinity;
                    let z0 = Infinity;
                    let z1 = -Infinity;
                    for (let e = 0; e < 3; e++) {
                        x0 = Math.min(x0, P.getX(I[t + e]));
                        x1 = Math.max(x1, P.getX(I[t + e]));
                        z0 = Math.min(z0, P.getZ(I[t + e]));
                        z1 = Math.max(z1, P.getZ(I[t + e]));
                    }
                    if (x1 - x0 > 400) continue; // nur die nahe Schale (die Bau-Zone)
                    for (let a = Math.floor(x0 / 8); a <= Math.floor(x1 / 8); a++)
                        for (let b = Math.floor(z0 / 8); b <= Math.floor(z1 / 8); b++) {
                            const k = a * 65536 + b;
                            if (!ringFach.has(k)) ringFach.set(k, []);
                            ringFach.get(k).push(t);
                        }
                }
            }
            const rA = new T9.Vector3();
            const rB = new T9.Vector3();
            const rC = new T9.Vector3();
            const rT = new T9.Vector3();
            const rN = new T9.Vector3(); // die Normale des getroffenen Dreiecks (die Weiche des Saums liest sie)
            const rE1 = new T9.Vector3();
            const rE2 = new T9.Vector3();
            const ringY = (x, z) => {
                const liste = ringFach.get(Math.floor(x / 8) * 65536 + Math.floor(z / 8));
                if (!liste) return null;
                const P = ringMesh.geometry.attributes.position;
                const I = ringMesh.geometry.index.array;
                o9.set(x, 4000, z);
                ray.set(o9, ab);
                let best = null;
                for (const t of liste) {
                    rA.fromBufferAttribute(P, I[t]);
                    rB.fromBufferAttribute(P, I[t + 1]);
                    rC.fromBufferAttribute(P, I[t + 2]);
                    if (ray.ray.intersectTriangle(rA, rB, rC, false, rT) && (best === null || rT.y > best)) {
                        best = rT.y;
                        rN.crossVectors(rE1.subVectors(rB, rA), rE2.subVectors(rC, rA)).normalize();
                    }
                }
                return best;
            };
            const stufen = [];
            const eigen = [];
            const selbst = []; // SELBSTTEST: dieselben Proben mit dem alten 2-m-Tauchen müssen rot fallen
            let bias = 0;
            const sehne = []; // die mittlere Stufe mit Vorzeichen: eine systematische Kante (der alte Ring tauchte −2 m) // die Abweichung des Chunks selbst vom Gesetz (die Surface-Nets-Klasse)
            const durch = [0, 0];
            let durchOhne = 0; // SELBSTTEST: dieselben Punkte ohne die Masken-Karte (die Sehne des Rings im Gebauten)
            const maske9 = [0, 0]; // die Masken-Treue: gezeichnete Chunks mit ihrem Texel / alle
            const loch9 = [0, 0]; // DAS LOCH: verworfene Punkte ohne Deck / verworfene Punkte (nach `_fernRingRegel`)
            const lochZelle = [0, 0]; // SELBSTTEST: dasselbe nach der alten Regel (die ganze Chunk-Zelle verwirft)
            const lochSeite = {}; // der Täter beim Namen: wo die Löcher liegen (Kante −X/+X/−Z/+Z oder innen)
            const lochOrte = []; // die ersten Löcher beim Ort (Punkt, Chunk, Stufe)
            const durchSeite = {}; // ebenso der Durchstich: je Kante:Regel [Zahl, größte Höhe über dem Deck]
            const muendung9 = [0, 0]; // der Einschnitt am Saum (Höhle, Kanal): [Punkte, größte Höhe des Rings über dem Deck]
            const muendungOrte9 = [];
            let muendungAlt9 = 0; // SELBSTTEST: dieselben Punkte mit dem Ring auf der 2D-Höhe (die alte Naht)
            let muendungLuecke9 = 0; // das Deck tief, das Feld oben: der Saum füllt eine Lücke über einem tieferen Boden
            let lueckeOffen9 = 0; // ... und die Weiche zieht den Ring unter ihn (das tiefere Deck gewinnt)
            const lueckeOrte9 = [];
            let weicheMax9 = 0; // die größte Weiche des Saums an den Proben (m, senkrecht)
            const proben13 = []; // die Punkte der Loch-Probe für die Treue der Teilung (Band 13)
            const weiche9 = Number(r.constructor.FERN_RING.nahtWeiche) || 0; // der Saum weicht dem Chunk in die Tiefe
            const morphF =
                r.state.atmoUniforms && r.state.atmoUniforms.geomorph ? r.state.atmoUniforms.geomorph.value : 0;
            const morphMemo = new Map();
            const gemorpht = (m) => {
                const A = m.geometry.attributes;
                if (!morphF || !A.aMorphTarget || !A.aMorphWeight) return m;
                let g = morphMemo.get(m);
                if (g) return g;
                const P = A.position;
                const Tg = A.aMorphTarget;
                const Wg = A.aMorphWeight;
                const neu = new Float32Array(P.count * 3);
                for (let v = 0; v < P.count; v++) {
                    const f = r._morphFaktor(Wg.getX(v), P.getX(v), P.getZ(v)); // K51-2: Naht + Stufe, samt geomorph
                    neu[v * 3] = P.getX(v) + (Tg.getX(v) - P.getX(v)) * f;
                    neu[v * 3 + 1] = P.getY(v) + (Tg.getY(v) - P.getY(v)) * f;
                    neu[v * 3 + 2] = P.getZ(v) + (Tg.getZ(v) - P.getZ(v)) * f;
                }
                const geo = new T9.BufferGeometry();
                geo.setAttribute("position", new T9.BufferAttribute(neu, 3));
                geo.setIndex(m.geometry.index);
                g = new T9.Mesh(geo, m.material);
                g.matrixWorld.copy(m.matrixWorld);
                morphMemo.set(m, g);
                return g;
            };
            const seiten = [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ];
            for (const [key, e] of r.state.voxelChunks) {
                if (!e || e.empty || !e.mesh) continue;
                const [cx, cz] = key.split(",").map(Number);
                if (!r._chunkDecktRing((cx + 0.5) * span9, (cz + 0.5) * span9)) continue;
                for (const [sx, sz] of seiten) {
                    if (r._chunkDecktRing((cx + 0.5 + sx) * span9, (cz + 0.5 + sz) * span9)) continue;
                    for (let k = 1; k < 14; k++) {
                        const u = (k / 14) * span9;
                        const bx = sx ? cx * span9 + (sx > 0 ? span9 : 0) : cx * span9 + u;
                        const bz = sz ? cz * span9 + (sz > 0 ? span9 : 0) : cz * span9 + u;
                        if (r._terrainMacroSurfaceY(bx, bz, true) < wl9 + 0.5) continue;
                        // Die Stufe relativ zum EINEN Gesetz (der Hang zwischen den Proben zählt nicht): der Chunk dort, wo
                        // seine Deckfläche trägt (0,3 · 0,9 · 1,5 m drinnen — die Kante selbst trägt den Skirt-Vorhang), der Ring
                        // 0,3 m draußen.
                        let dc = null;
                        for (const d of [0.3, 0.9, 1.5]) {
                            const xi = bx - sx * d;
                            const zi = bz - sz * d;
                            const yc = hoch(e.mesh, xi, zi);
                            const g = r._terrainMacroSurfaceY(xi, zi, true);
                            if (yc !== null && Math.abs(yc - g) < 5) {
                                dc = yc - g;
                                break;
                            }
                        }
                        const xo = bx + sx * 0.3;
                        const zo = bz + sz * 0.3;
                        const yr = hoch(ringMesh, xo, zo);
                        if (dc === null || yr === null) continue;
                        eigen.push(Math.abs(dc));
                        const st = yr - r._terrainMacroSurfaceY(xo, zo, true) - dc;
                        stufen.push(Math.abs(st));
                        selbst.push(Math.abs(st - 2));
                        bias += st;
                        // DIE SEHNE DES RINGS selbst (die Referenz): 15 m draußen im Freien, gegen das Gesetz, das er dort trägt.
                        const xf = bx + sx * 15;
                        const zf = bz + sz * 15;
                        if (!r._chunkDecktRing(xf, zf)) {
                            const yf = hoch(ringMesh, xf, zf);
                            const radF = Math.hypot(xf - fr9.anchorX, zf - fr9.anchorZ);
                            // die Deck-Mischung der Bau-Zone (die Formel des Fern-Fadens, B2)
                            const mak = r._terrainMacroSurfaceY(xf, zf, false);
                            const dz = fr9.deckZoneRad;
                            const wF = radF <= dz ? 1 : radF <= dz * 1.35 ? (dz * 1.35 - radF) / (dz * 0.35) : 0;
                            const lawF = mak + (r._terrainMacroSurfaceY(xf, zf, true) - mak) * wF - 0.3 * wF;
                            if (yf !== null && !(lawF < wl9)) sehne.push(Math.abs(yf - lawF));
                        }
                    }
                }
                // DER RING WEICHT DEM GEBAUTEN: die Masken-Karte des Rings (`fr.maske`, die sein `maskNode` liest) trägt jeden
                // gezeichneten Chunk. Gemessen wird nach der REGEL, die der maskNode zeichnet (`_fernRingRegel`, ihr CPU-Spiegel:
                // 2 verworfen, 1 Saum — der Ring zeichnet und weicht dem Chunk um `nahtWeiche` in die Tiefe —, 0 frei), an den vier
                // Kanten (innen UND außen, 0,05–1,5 m) und im Inneren:
                //   DAS LOCH — die Regel verwirft, und kein Deck (Chunk oder Stich-Band der 3 × 3 Nachbarn) trifft den senkrechten
                //   Strahl: dort zeichnet niemand (im Bild eine blaue Linie über die Bau-Kante).
                //   DER DURCHSTICH — der Ring zeichnet (Saum oder frei), ein Deck liegt darunter, und der Ring (im Saum um die
                //   Weiche gesenkt) steht über ihm.
                // Selbsttest: die alte Regel (die ganze Chunk-Zelle verwirft) MUSS Löcher zeigen; ohne Karte sticht die Sehne durch.
                const M9 = fr9.maske;
                const ti = M9 ? cx - M9.uZelle0.value.x : -1;
                const tj = M9 ? cz - M9.uZelle0.value.y : -1;
                const zelleVon = (x, z) => {
                    const a = Math.floor(x / span9) - (M9 ? M9.uZelle0.value.x : 0);
                    const b = Math.floor(z / span9) - (M9 ? M9.uZelle0.value.y : 0);
                    return !!M9 && a >= 0 && b >= 0 && a < M9.n && b < M9.n && M9.daten[(b * M9.n + a) * 4] === 255;
                };
                maske9[1]++;
                if (!!M9 && ti >= 0 && tj >= 0 && ti < M9.n && tj < M9.n && M9.daten[(tj * M9.n + ti) * 4] === 255)
                    maske9[0]++;
                // DAS DECK, WIE ES GEZEICHNET WIRD: der Boden-Stoff zieht die Grenz-Zeile einer feineren Stufe auf die gröbere
                // Fläche (Geomorph, `positionNode` = position + (aMorphTarget − position) · geomorph · aMorphWeight) — der Strahl
                // trifft die gemorphte Fläche, nie die rohe CPU-Lage (die Stufen-Naht 0 ↔ 1 klafft roh bis zu einer Voxel-Kante).
                const decks = [];
                for (let di = -1; di <= 1; di++)
                    for (let dj = -1; dj <= 1; dj++) {
                        const en = r.state.voxelChunks.get(`${cx + di},${cz + dj}`);
                        if (!r._chunkGezeichnet(en)) continue;
                        decks.push(gemorpht(en.mesh));
                        if (en.lodStitchMesh) decks.push(en.lodStitchMesh);
                    }
                const deckY = (x, z) => {
                    o9.set(x, 4000, z);
                    ray.set(o9, ab);
                    ray.far = 9000;
                    const h = ray.intersectObjects(decks, false);
                    return h.length ? h[0].point.y : null;
                };
                const punkte = [];
                for (let i = 0; i < 7; i++)
                    for (let j = 0; j < 7; j++)
                        punkte.push([cx * span9 + 3 + i * 6.2, cz * span9 + 3 + j * 6.2, "innen"]);
                // je Kante in Voxel-Kanten der Stufe (0,03 … 1,6 s, innen und außen): die erste Vertex-Spalte liegt in der ersten
                // Voxel-Spalte, die Glättung schiebt sie bis über deren Rand
                const s9 = r._voxelChunkConfig(e.lod || 0).step;
                for (const d of [0.03, 0.17, 0.33, 0.5, 0.83, 1.05, 1.25, 1.6].flatMap((f) => [f * s9, -f * s9]))
                    for (let k = 1; k < 8; k++) {
                        const u = (k / 8) * span9;
                        punkte.push([cx * span9 + d, cz * span9 + u, "-X"]);
                        punkte.push([(cx + 1) * span9 - d, cz * span9 + u, "+X"]);
                        punkte.push([cx * span9 + u, cz * span9 + d, "-Z"]);
                        punkte.push([cx * span9 + u, (cz + 1) * span9 - d, "+Z"]);
                    }
                for (const [x, z, seite] of punkte) {
                    const regel = r._fernRingRegel(fr9, x, z);
                    proben13.push(x, z);
                    const yc = deckY(x, z);
                    if (regel === 2) {
                        loch9[1]++;
                        if (yc === null) {
                            loch9[0]++;
                            lochSeite[seite] = (lochSeite[seite] || 0) + 1;
                            if (lochOrte.length < 6)
                                lochOrte.push(`(${x.toFixed(2)}|${z.toFixed(2)}) ${cx},${cz} L${e.lod || 0}`);
                        }
                    }
                    if (zelleVon(x, z)) {
                        lochZelle[1]++;
                        if (yc === null) lochZelle[0]++;
                    }
                    if (yc === null || r._terrainMacroSurfaceY(x, z, true) < wl9 + 0.5) continue;
                    const yr = ringY(x, z);
                    if (yr === null) continue;
                    durch[1]++;
                    if (yr > yc + 0.05) durchOhne++;
                    // DIE WEICHE AM PUNKT (`_fernRingWeiche`, der CPU-Spiegel des depthNode): fest oder der Fehler der Masche
                    const weicheP9 =
                        regel !== 1
                            ? 0
                            : r._fernRingWeiche(fr9, x, z, rN.x, rN.y, rN.z);
                    weicheMax9 = Math.max(weicheMax9, weicheP9);
                    const ueber = yr - weicheP9 - yc;
                    const gesetz9 = r._terrainMacroSurfaceY(x, z, true);
                    const tief9 = regel !== 2 && yc < gesetz9 - 2; // das Deck mehr als 2 m unter der 2D-Höhe
                    // DER EINSCHNITT AM SAUM: das Deck liegt mehr als 2 m unter der 2D-Höhe des Gesetzes (die Surface-Nets-
                    // Abweichung ist ±0,45 m). Der Richter ist das FELD, das der Chunk zeichnet (`_voxelSurfaceY`, die oberste
                    // Fläche): liegt seine Fläche tief (Höhlen-Mündung, Kanal, Edit), darf der Ring nicht über ihr stehen; trägt
                    // das Feld oben (das Deck unter dem Strahl ist ein tieferer Boden — ein Höhlen-Grund unter der Lücke an der
                    // Bau- oder Stufen-Kante, die der Saum füllt), ist der Ring dort die Fläche des Feldes (gezählt: `luecke`).
                    const feld9 = tief9 ? r._voxelSurfaceY(x, z) : null;
                    const weicheT9 = weicheP9;
                    if (tief9 && feld9 !== null && feld9 >= gesetz9 - 2) {
                        muendungLuecke9++;
                        // DIE LÜCKE UNTER DER WEICHE (gezählt, beim Ort genannt): steht der tiefere Boden näher als die Weiche,
                        // gewinnt er — ein Deck steht dort, das Gesetz des Saums: wo das Deck fehlt, trägt der Ring, wo es
                        // steht, gewinnt es
                        if (yr - weicheT9 < yc - 0.05) {
                            lueckeOffen9++;
                            if (lueckeOrte9.length < 4)
                                lueckeOrte9.push(
                                    `(${x.toFixed(1)}|${z.toFixed(1)}) Deck ${yc.toFixed(1)} Ring ${yr.toFixed(1)} Weiche ${weicheT9.toFixed(1)}`
                                );
                        }
                    }
                    // SELBSTTEST: der Ring auf der 2D-Höhe des Gesetzes (die alte Naht, `vollY`) stünde über der tiefen Fläche
                    if (
                        tief9 &&
                        feld9 !== null &&
                        feld9 < gesetz9 - 2 &&
                        gesetz9 - (regel === 1 ? weiche9 : 0) - feld9 > 0.05
                    )
                        muendungAlt9++;
                    if (tief9 && feld9 !== null && feld9 < gesetz9 - 2 && yr - weicheT9 - feld9 > 0.05) {
                        muendung9[0]++;
                        muendung9[1] = Math.max(muendung9[1], +(yr - weicheT9 - feld9).toFixed(1));
                        if (muendungOrte9.length < 6)
                            muendungOrte9.push(
                                `(${x.toFixed(1)}|${z.toFixed(1)}) ${seite} R${regel} Deck ${yc.toFixed(1)} Feld ${feld9.toFixed(1)} Ring ${yr.toFixed(1)} Gesetz ${gesetz9.toFixed(1)}`
                            );
                    } else if (tief9) {
                        // das Deck tief, der Ring auf dem Feld (oder darunter): kein Durchstich der Sehne
                    } else if (regel !== 2 && ueber > 0.05) {
                        durch[0]++;
                        const k = `${seite}:${regel}`;
                        const d = durchSeite[k] || (durchSeite[k] = [0, 0]);
                        d[0]++;
                        d[1] = Math.max(d[1], +ueber.toFixed(2));
                    }
                }
            }
            res.zeit9 = [Math.round(tPump9 - t09), Math.round(performance.now() - tPump9)]; // ms: Ring bauen · Proben
            res.nahtN = stufen.length;
            res.nahtBias = stufen.length ? bias / stufen.length : NaN;
            res.nahtSehneP95 = quantil(sehne, 0.95);
            res.nahtSelbstP95 = quantil(selbst, 0.95);
            res.nahtP50 = quantil(stufen, 0.5);
            res.nahtP95 = quantil(stufen, 0.95);
            res.nahtMax = quantil(stufen, 1);
            res.nahtEigenP95 = quantil(eigen, 0.95);
            res.durchN = durch[1];
            res.durchAnteil = durch[1] ? durch[0] / durch[1] : NaN;
            res.durchOhne = durch[1] ? durchOhne / durch[1] : NaN;
            res.maskeTreue = maske9;
            res.maskNode = !!(stoffNaht9 && stoffNaht9.maskNode);
            res.loch = loch9;
            res.lochZelle = lochZelle;
            res.lochSeite = lochSeite;
            res.lochOrte = lochOrte;
            res.morph = morphF;
            res.durchSeite = durchSeite;
            res.muendung = muendung9;
            res.muendungOrte = muendungOrte9;
            res.muendungAlt = muendungAlt9;
            res.muendungLuecke = muendungLuecke9;
            res.lueckeOffen = lueckeOffen9;
            res.lueckeOrte = lueckeOrte9;
            res.weicheMax = +weicheMax9.toFixed(1);
            res.weiche = weiche9;
            // ===== (12) DIE WEICHE KOSTET NUR AN DER NAHT (K16, Prüfung Runde 3) =====
            // Die Tiefe aus dem Fragment (`depthNode`) kostet jedes Fragment, das sie schreibt, den frühen Tiefentest und die
            // Tiefen-Kompression (Radeon 890M gpu-bank ABAB +1,28 ms je Frame, solange der EINE Ring-Stoff sie für alle drei
            // Schalen trug). Gezählt wird je gezeichnetes Dreieck eines Stoffs mit depthNode (nicht entartet), ob in seinem
            // Kasten ± (1½ s_max + 5 cm) eine RAND-ZELLE liegt: ein gezeichneter Chunk, dessen acht Nachbarn ihn nicht alle
            // tragen (nicht gezeichnet oder eine andere Stufe) — nur an ihr hat der Saum (`_fernRingRegel` 1) seinen Ort. Ohne
            // Rand-Zelle schreibt das Dreieck seine Tiefe umsonst; der Täter beim Namen: Schale und Zahl.
            // Selbsttest: dieselbe Zählung über ALLE Ring-Dreiecke (die Weiche überall) findet Dreiecke ohne Naht.
            {
                const M = fr9.maske;
                const n = M.n;
                const i0 = M.uZelle0.value.x;
                const j0 = M.uZelle0.value.y;
                const B = (a, b) => a >= 0 && b >= 0 && a < n && b < n && M.daten[(b * n + a) * 4] === 255;
                const S = (a, b) => M.daten[(b * n + a) * 4 + 1];
                const rand = new Uint8Array(n * n);
                let sMax = 0;
                for (let a = 0; a < n; a++)
                    for (let b = 0; b < n; b++) {
                        if (!B(a, b)) continue;
                        sMax = Math.max(sMax, S(a, b) / 10);
                        for (let da = -1; da <= 1; da++)
                            for (let db = -1; db <= 1; db++)
                                if (!B(a + da, b + db) || S(a + da, b + db) !== S(a, b)) rand[b * n + a] = 1;
                    }
                const reich = 1.5 * sMax + 0.06; // die Teilung rechnet mit 5 cm: die Linse greift weiter
                const amRand = (x0, x1, z0, z1) => {
                    for (let a = Math.floor((x0 - reich) / span9) - i0; a <= Math.floor((x1 + reich) / span9) - i0; a++)
                        for (
                            let b = Math.floor((z0 - reich) / span9) - j0;
                            b <= Math.floor((z1 + reich) / span9) - j0;
                            b++
                        )
                            if (a >= 0 && b >= 0 && a < n && b < n && rand[b * n + a]) return true;
                    return false;
                };
                const schaleVon = (g) => fr9.schalen.findIndex((sh) => sh.per === g.attributes.position.count);
                const zaehle = (alle) => {
                    const z = { dreiecke: 0, ohne: 0, je: {} };
                    for (const m of fr9.meshes) {
                        if (!alle && !(m.visible && m.material && m.material.depthNode)) continue;
                        const g = m.geometry;
                        const I = g.index.array;
                        const P = g.attributes.position.array;
                        const s = schaleVon(g);
                        for (let t = 0; t < I.length; t += 3) {
                            const a = I[t];
                            const b = I[t + 1];
                            const c = I[t + 2];
                            if (a === b || b === c || a === c) continue;
                            z.dreiecke++;
                            const x0 = Math.min(P[a * 3], P[b * 3], P[c * 3]);
                            const x1 = Math.max(P[a * 3], P[b * 3], P[c * 3]);
                            const z0 = Math.min(P[a * 3 + 2], P[b * 3 + 2], P[c * 3 + 2]);
                            const z1 = Math.max(P[a * 3 + 2], P[b * 3 + 2], P[c * 3 + 2]);
                            if (amRand(x0, x1, z0, z1)) continue;
                            z.ohne++;
                            z.je[`Schale ${s}`] = (z.je[`Schale ${s}`] || 0) + 1;
                        }
                    }
                    return z;
                };
                const ring = zaehle(true);
                res.weicheKosten = zaehle(false);
                res.weicheRing = ring.dreiecke;
                res.weicheSelbst = ring.ohne;
                res.weicheRandZellen = rand.reduce((s, v) => s + v, 0);
            }
            // ===== (13) DIE TEILUNG IST TREU (K16, die Kosten an der Naht) =====
            // Die CPU teilt die Dreiecke der Schale 0 (`fr.teilung.klasse`): frei (0, ohne Maske und Weiche), Naht (1, die Regel des
            // maskNode), sicher getragen (2, gar nicht gezeichnet). Treu ist sie, wenn die Regel (`_fernRingRegel`) an jedem Punkt
            // eines freien Dreiecks 0 und eines getragenen 2 sagt — sonst stünde der Ring frei über dem Deck (der Stich) oder fehlte
            // ohne Deck (das Loch). Geprüft an den Punkten der Loch-Probe (Kanten in Voxel-Kanten, innen) und an Ecken,
            // Kanten-Mitten und Schwerpunkt jedes freien und getragenen Dreiecks der Bau-Zone. Selbsttest: die Naht als frei
            // gezeichnet zeigt Stiche, die Naht verworfen zeigt Löcher.
            {
                const T = fr9.teilung;
                const geo0 = geosVon(fr9)[0];
                const I = geo0.index.array;
                const P = geo0.attributes.position.array;
                const treu = { proben: 0, stich: 0, loch: 0, selbstStich: 0, selbstLoch: 0, orte: [] };
                const pruefe = (t, x, z) => {
                    const k = T.klasse[t / 3];
                    const regel = r._fernRingRegel(fr9, x, z);
                    treu.proben++;
                    if (k === 0 && regel !== 0) treu.stich++;
                    if (k === 2 && regel !== 2) treu.loch++;
                    if (k === 1 && regel !== 0) treu.selbstStich++;
                    if (k === 1 && regel !== 2) treu.selbstLoch++;
                    if (((k === 0 && regel !== 0) || (k === 2 && regel !== 2)) && treu.orte.length < 6)
                        treu.orte.push(`(${x.toFixed(2)}|${z.toFixed(2)}) Klasse ${k} Regel ${regel}`);
                };
                const drin = (t, x, z) => {
                    const ax = P[I[t] * 3];
                    const az = P[I[t] * 3 + 2];
                    const bx = P[I[t + 1] * 3];
                    const bz = P[I[t + 1] * 3 + 2];
                    const cx = P[I[t + 2] * 3];
                    const cz = P[I[t + 2] * 3 + 2];
                    // ein entartetes Dreieck (der Snap legt Ecken der inneren Reihen zusammen) trägt keinen Punkt
                    if (Math.abs((bx - ax) * (cz - az) - (cx - ax) * (bz - az)) < 1e-9) return false;
                    const d1 = (x - bx) * (az - bz) - (ax - bx) * (z - bz);
                    const d2 = (x - cx) * (bz - cz) - (bx - cx) * (z - cz);
                    const d3 = (x - ax) * (cz - az) - (cx - ax) * (z - az);
                    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
                };
                if (T && T.klasse && T.klasse.length * 3 === I.length) {
                    for (let p = 0; p < proben13.length; p += 2) {
                        const x = proben13[p];
                        const z = proben13[p + 1];
                        const liste = ringFach.get(Math.floor(x / 8) * 65536 + Math.floor(z / 8)) || [];
                        for (const t of liste)
                            if (drin(t, x, z)) {
                                pruefe(t, x, z);
                                break;
                            }
                    }
                    for (let t = 0; t < I.length; t += 3) {
                        const k = T.klasse[t / 3];
                        if (k === 1) continue;
                        const e = [0, 1, 2].map((q) => [P[I[t + q] * 3], P[I[t + q] * 3 + 2]]);
                        if (Math.hypot(e[0][0] - fr9.anchorX, e[0][1] - fr9.anchorZ) > fr9.bauZoneRad) continue;
                        for (let q = 0; q < 3; q++) {
                            const [x, z] = e[q];
                            const [x2, z2] = e[(q + 1) % 3];
                            pruefe(t, x, z);
                            pruefe(t, (x + x2) / 2, (z + z2) / 2);
                        }
                        pruefe(t, (e[0][0] + e[1][0] + e[2][0]) / 3, (e[0][1] + e[1][1] + e[2][1]) / 3);
                    }
                    treu.n = T.n;
                }
                res.teilung = treu;
            }
            // ===== (10) DIE FERN-FARBE OHNE STREIFEN =====
            // Längs jeder Ring-Reihe jenseits des Karten-Horizonts (das Kronendach trägt) die gezeichnete Farbe (Boden unter
            // dem Dach zur Deckung, Saison 1): der STREIFEN-INDEX = RMS der Sprünge zum Nachbarpunkt / RMS der Sprünge über
            // vier Punkte. Ein bandbegrenztes Bild steigt mit dem Abstand (glatt ≈ 0,25), ein gefaltetes Mosaik springt schon
            // am Nachbarn so weit wie über vier (≈ 1).
            const dachRand = r.constructor.SCATTER.outerM;
            const W9 = r.constructor.FERN_RING.winkel;
            const idxVon = (X) => {
                let a1 = 0;
                let a4 = 0;
                for (let a = 0; a < W9; a++) {
                    a1 += (X[(a + 1) % W9] - X[a]) ** 2;
                    a4 += (X[(a + 4) % W9] - X[a]) ** 2;
                }
                return Math.sqrt(a1 / a4);
            };
            const indizes = [];
            for (let s = 0; s < 2; s++) {
                const sh = fr9.schalen[s];
                const geo = geosVon(fr9)[s];
                const C = geo.attributes.color.array;
                const K = geo.attributes.aKrone.array;
                for (let row = 0; row < sh.reihen; row++) {
                    const rad = sh.inner * Math.pow(sh.aussen / sh.inner, row / (sh.reihen - 1));
                    if (rad < dachRand + 16) continue;
                    const L = new Float64Array(W9);

                    let nass = 0;
                    for (let a = 0; a < W9; a++) {
                        const v = row * W9 + a;
                        const al = K[v * 4 + 3];
                        if (al === 0) nass++;
                        const f = (c) => C[v * 3 + c] + (K[v * 4 + c] - C[v * 3 + c]) * al;
                        L[a] = 0.2126 * f(0) + 0.7152 * f(1) + 0.0722 * f(2);
                    }
                    if (nass > W9 / 4) continue;
                    const ix = idxVon(L);
                    if (Number.isFinite(ix)) indizes.push(ix);
                }
            }
            {
                // SELBSTTEST des Index: ein gefaltetes Mosaik (Pseudo-Zufall je Punkt) springt ≥ 0,8, eine glatte Reihe ≤ 0,3.
                let h = 12345;
                const zufall = Float64Array.from(
                    { length: W9 },
                    () => (h = (h * 1103515245 + 12345) >>> 0) / 4294967296
                );
                const glatt = Float64Array.from({ length: W9 }, (_, a) => Math.sin((a / W9) * Math.PI * 6));
                res.streifenSelbst = [idxVon(zufall), idxVon(glatt)];
            }
            res.streifenN = indizes.length;
            res.streifenMedian = quantil(indizes, 0.5);
            res.streifenP90 = quantil(indizes, 0.9);
        } catch (e9) {
            res.nahtErr = String((e9 && e9.stack) || e9).slice(0, 400);
        }
        try {
            // ===== (11) DAS DACH IST DER BESTAND =====
            // Die Deckung des Kronendachs (Fern-Farbe out[6], fussM 0) gegen die Kronen-Deckung, die der Wald-Generator auf
            // derselben Fläche wirklich stehen lässt: 192 × 192 m um den Spieler, jeder stehende Dart (_forestCellDarts +
            // _forestDartSteht, die Perf-Kappung keep) mit seiner Krone (_kronenRadiusFuer) auf ein 1-m-Raster gemalt, je
            // 32-m-Land-Kachel gegen das Mittel der Dach-Deckung (4-m-Raster). SELBSTTEST: das alte Dach (die Geburt als Deckung,
            // phyto-core forestBestand.geburt) fällt rot.
            const H = 96;
            const pp = r.state.playerMesh.position;
            const x0 = Math.round(pp.x) - H;
            const z0 = Math.round(pp.z) - H;
            const N = 2 * H;
            const F = r.constructor.FOREST;
            const seedInt = r._forestSeedInt();
            const fd = r._effectiveFoliageDensity();
            const memo = new Map();
            const cellDarts = (gx, gz) => {
                const k = gx + "," + gz;
                let d = memo.get(k);
                if (!d) memo.set(k, (d = r._forestCellDarts(gx, gz, seedInt)));
                return d;
            };
            const deck = new Uint8Array(N * N);
            for (let gz = Math.floor(z0 / F.cell); gz <= Math.floor((z0 + N) / F.cell); gz++)
                for (let gx = Math.floor(x0 / F.cell); gx <= Math.floor((x0 + N) / F.cell); gx++)
                    for (const d of cellDarts(gx, gz)) {
                        if (!r._forestDartSteht(d, gx, gz, cellDarts) || (fd < 1 && d.keep >= fd)) continue;
                        const rad = r._kronenRadiusFuer(d.sp, d.s);
                        if (!(rad > 0)) continue;
                        for (
                            let j = Math.max(0, Math.floor(d.z - rad - z0));
                            j <= Math.min(N - 1, Math.ceil(d.z + rad - z0));
                            j++
                        )
                            for (
                                let i = Math.max(0, Math.floor(d.x - rad - x0));
                                i <= Math.min(N - 1, Math.ceil(d.x + rad - x0));
                                i++
                            )
                                if ((x0 + i + 0.5 - d.x) ** 2 + (z0 + j + 0.5 - d.z) ** 2 <= rad * rad)
                                    deck[j * N + i] = 1;
                    }
            const core = globalThis.__phytoCore;
            const fbm = (px, pz) => r._forestFbm(px, pz);
            const wl = r.state.waterLevel;
            let g = 0;
            let ng = 0;
            let a = 0;
            let alt = 0;
            let na = 0;
            const K = 32;
            // DIE DECKUNG AN DER STELLE aus dem Fern-Faden (B2): erst die Land-Punkte sammeln, EIN Auftrag (fussM 0, ohne
            // Fluss-Anteil), dann in derselben Folge lesen
            const sammel = [];
            const sammelY = [];
            for (let kj = 0; kj < N / K; kj++)
                for (let ki = 0; ki < N / K; ki++)
                    for (let j = 2; j < K; j += 4)
                        for (let i = 2; i < K; i += 4) {
                            const x = x0 + ki * K + i;
                            const z = z0 + kj * K + j;
                            const y = r._terrainMacroSurfaceY(x, z, true);
                            if (!(y > wl + 0.4)) continue;
                            sammel.push(x, z);
                            sammelY.push(y);
                        }
            const deckW = (await r._fernAuftrag("teile", { punkte: new Float64Array(sammel), y: new Float64Array(sammelY), roh: true })).teile;
            let kW = 0;
            for (let kj = 0; kj < N / K; kj++)
                for (let ki = 0; ki < N / K; ki++) {
                    let gk = 0;
                    let ak = 0;
                    let altK = 0;
                    let land = 0;
                    for (let j = 2; j < K; j += 4)
                        for (let i = 2; i < K; i += 4) {
                            const x = x0 + ki * K + i;
                            const z = z0 + kj * K + j;
                            const y = r._terrainMacroSurfaceY(x, z, true);
                            if (!(y > wl + 0.4)) continue;
                            land++;
                            ak += deckW[kW++ * 8 + 6];
                            altK += core.forestBestand(fbm, x, z, 0).geburt;
                        }
                    if (land < 48) continue;
                    for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) gk += deck[(kj * K + j) * N + ki * K + i];
                    g += gk / (K * K);
                    ng++;
                    a += ak / land;
                    alt += altK / land;
                    na++;
                }
            res.dachKacheln = ng;
            res.dachGemessen = ng ? g / ng : NaN;
            res.dachDeckung = na ? a / na : NaN;
            res.dachAlt = na ? alt / na : NaN;
        } catch (e11) {
            res.dachErr = String((e11 && e11.stack) || e11).slice(0, 400);
        }
        // ===== (14) DAS WASSER DES RINGS IST DAS WASSER DES BODENS (K16, die Naht) =====
        // Der SEE (ein Wasser-Körper über dem Meer, `_atlasWaterLevelAt` → koerper): der Ring liegt unter seinem Spiegel. Der
        // FLUSS (4–17 m, schmaler als die Masche): der Ring-Punkt trägt den Anteil c der Masche, den sein Wasser deckt
        // (`_fernFlussDeckung`, Kasten-Filter über die halbe Maschen-Kante), als Wasser-Anteil aNass (der Ring-Stoff zeichnet ihn
        // mit dem Blick des Wassers, `_wasserBlick`) — |aNass − c| ≤ 0,05; seine Boden-Farbe ist das Land der Masche ohne
        // Fern-Blau (Abstand ≤ 0,01, sonst ein Zwilling der Wasser-Farbe); seine Höhe ist das Mittel der sichtbaren Fläche,
        // Boden × (1 − c) + Spiegel × c (≤ 0,05 m; die Naht-Punkte tragen das Feld bzw. das volle Gesetz und zählen nicht).
        // Selbsttest: die alte Regel (kein Anteil, keine Senkung) verfehlt jeden deutlichen Fluss-Punkt.
        try {
            const frW = r.state.fernRing;
            await pumpe(r.state.playerMesh.position);
            const wl = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            // die Erwartung je Punkt aus dem Fern-Faden: der Fluss-Anteil der Masche (Slot 7 mit Fuß) und das Land der Masche
            // (die Teile ohne Fluss-Anteil), an der Höhe, die der Ring dem Punkt gab
            const nW = frW.totalVerts;
            const ptsW = new Float64Array(nW * 2);
            const htW = new Float64Array(nW);
            const hrW = new Float64Array(nW);
            const yW = new Float64Array(nW);
            for (let g = 0; g < nW; g++) {
                const p = r._fernRingPunkt(frW, g);
                ptsW[g * 2] = p.x;
                ptsW[g * 2 + 1] = p.z;
                htW[g] = p.fuss.ht;
                hrW[g] = p.fuss.hr;
                yW[g] = frW.law[g];
            }
            const auftragW = () => ({ punkte: ptsW.slice(), y: yW.slice(), ht: htW.slice(), hr: hrW.slice(), ax: frW.anchorX, az: frW.anchorZ });
            const mitFluss = await r._fernAuftrag("teile", auftragW());
            const landW = await r._fernAuftrag("teile", { ...auftragW(), roh: true });
            const w = {
                see: 0,
                verdeckt: 0,
                fluss: 0,
                sichtbar: 0,
                abweichung: 0,
                zwilling: 0,
                hoehe: 0,
                hoeheN: 0,
                alt: 0,
                altHoehe: 0,
                hebMax: 0,
                ohneAttribut: 0,
                offen: 0,
                orte: [],
            };
            const geos = geosVon(frW);
            const aus = {};
            const nass = {};
            const fl = {};
            const land = new Float32Array(8);
            const randV = frW.teilung && frW.teilung.randV;
            const saum = r.constructor.FERN_RING.saumDrop;
            for (let g = 0; g < frW.totalVerts; g++) {
                const p = r._fernRingPunkt(frW, g);
                r._atlasWaterLevelAt(p.x, p.z, -Infinity, aus);
                if (Number.isFinite(aus.koerper) && aus.koerper > wl + 0.5) {
                    w.see++;
                    if (!(geos[p.s].attributes.position.getY(p.li) < aus.koerper)) w.verdeckt++;
                }
                if (frW.nass[g]) continue;
                const c = mitFluss.teile[g * 8 + 7];
                fl.spiegel = frW.flussSp[g];
                if (!(c >= 0.05)) continue;
                w.fluss++;
                if (c >= 0.25) w.sichtbar++;
                const attr = geos[p.s].attributes.aNass;
                const an = attr ? attr.getX(p.li) : NaN;
                if (!attr) w.ohneAttribut++;
                if (!(Math.abs(an - c) <= 0.05)) {
                    w.abweichung++;
                    if (w.orte.length < 4)
                        w.orte.push([Math.round(p.x), Math.round(p.z), +c.toFixed(2), +an.toFixed(2)]);
                }
                if (c > 0.05 && Math.abs(0 - c) > 0.05) w.alt++;
                land.set(landW.teile.subarray(g * 8, g * 8 + 8));
                const col = geos[p.s].attributes.color;
                const d = Math.hypot(col.getX(p.li) - land[0], col.getY(p.li) - land[1], col.getZ(p.li) - land[2]);
                if (p.fuss && d > 0.01) w.zwilling++;
                const naht = (p.s === 0 && randV && randV[p.li]) || r._fernRingNaht(frW, p);
                if (naht || !(fl.spiegel === fl.spiegel)) continue;
                r._fernNass(p.x, p.z, frW.law[g], wl, nass);
                const boden = nass.y - (p.row === 0 ? saum : 0);
                const soll = boden + (fl.spiegel - (p.row === 0 ? saum : 0) - boden) * c;
                const y = geos[p.s].attributes.position.getY(p.li);
                w.hoeheN++;
                if (Math.abs(y - soll) > 0.05) w.hoehe++;
                if (Math.abs(boden - soll) > 0.05) w.altHoehe++;
                w.hebMax = Math.max(w.hebMax, Math.abs(soll - boden));
            }
            // DIE FLUSS-KARTE (je Fragment im Fern-Fenster, `_flussKarteMalen`): die Mitte jedes Segments im Fenster trägt das
            // Wasser (≥ 0,8), 2 Texel jenseits seiner Kante nichts (≤ 0,08).
            w.karteMitte = 0;
            w.karteMitteFehl = 0;
            w.karteDanebenFehl = 0;
            w.karteFehlt = false;
            const wk = r.state.wegeKarte;
            const fs1 = wk && wk.stufen[1];
            if (!fs1 || !fs1.fluss || !fs1.zentriert) w.karteFehlt = true;
            else {
                const t = fs1.S.texelM;
                const N = fs1.N;
                const x0w = fs1.mitteX - fs1.S.fensterM / 2;
                const z0w = fs1.mitteZ - fs1.S.fensterM / 2;
                const lies = (x, z) => {
                    const i = Math.floor((x - x0w) / t);
                    const j = Math.floor((z - z0w) / t);
                    return i < 2 || j < 2 || i >= N - 2 || j >= N - 2 ? NaN : fs1.fluss.daten[j * N + i] / 255;
                };
                const K = r.state.hydrosphere && r.state.hydrosphere.kanal;
                for (let o = 0; K && o < K.seg.length; o += window.__gelaendeCore.KANAL_FELDER) {
                    const [ax, az, bx, bz, hwA, hwB] = K.seg.subarray(o, o + 6);
                    const hw = (hwA + hwB) / 2;
                    if (hw < 2 * t) continue;
                    const mx = (ax + bx) / 2;
                    const mz = (az + bz) / 2;
                    const m = lies(mx, mz);
                    if (!(m === m)) continue;
                    w.karteMitte++;
                    if (m < 0.8) w.karteMitteFehl++;
                    const l = Math.hypot(bx - ax, bz - az) || 1;
                    const nx = -(bz - az) / l;
                    const nz = (bx - ax) / l;
                    // daneben heißt: 2 Texel um den Punkt kein Wasser — auch keins des Nachbar-Bogens (der Mäander
                    // legt seine Schleifen eng; ein Punkt-Test traf den Rand der nächsten Schleife)
                    const aussen = flussDeckungL(mx + nx * (hw + 2 * t), mz + nz * (hw + 2 * t), 2 * t);
                    const d = lies(mx + nx * (hw + 2 * t), mz + nz * (hw + 2 * t));
                    if (aussen === 0 && d > 0.08) w.karteDanebenFehl++;
                }
            }
            res.binnen = w;
        } catch (e14) {
            res.binnenErr = String((e14 && e14.stack) || e14).slice(0, 400);
        }
        // ===== (15) DER HORIZONT STEHT NACH DEM SCHNEE (heil-horizont) =====
        // Der Spieler baut (ein Edit: der Ring bestellt die Ecken um ihn, `editFlug` 1) und im SELBEN Takt wandert die
        // Schneegrenze (`setSeason`, dann der Takt der Saison wie im Frame-Plan nach dem Horizont-Takt: `_schneeTakt` bestellt
        // den Ring neu). Geurteilt wird am EREIGNIS: hat der Fern-Faden jede Bestellung beantwortet und hängt der Ring ganz, zählt
        // er nichts mehr im Flug — [im Flug, Generation vorher, nachher, editFlug]. Bis heil-horizont setzte der Schnee-Takt die
        // Bestellung neben `_fernRingNeuBestellen` zurück: am Stamm 9e92be45 [1, 0, 1, 1], der Horizont stand nie mehr.
        try {
            const f = r.state.fernRing;
            const pos = r.state.playerMesh.position;
            const phase = r.state.seasonPhase;
            r._addVoxelEdit(f.anchorX + 300, r.state.terrainBaseHeight, f.anchorZ, 6, "fill");
            r._tickFernRing(pos); // der Horizont-Takt bestellt die Ecken um den Edit
            res.horizont = [f.editFlug, f.gen | 0];
            r.setSeason(phase < 0.5 ? "winter" : "summer");
            r._tickSeason(performance.now());
            await pumpe(pos, (g) => !r._nebenFaeden.get("fern").pending.size && g.cursor >= g.totalVerts);
            res.horizont.push(f.gen | 0, f.editFlug);
        } catch (e15) {
            res.horizont = [String(e15)];
        }
        r._fernRingDispose();
        res.fpDisposed = r.state.feldPass === null || r.state.feldPass === undefined;

        // Hook wiederherstellen (sichern + wiederherstellen, nie löschen):
        if (prevHook === undefined) delete window.__anazhFernRing;
        else window.__anazhFernRing = prevHook;
        return res;
    });

    await browser.close();
    server.close();

    if (out.fatal) {
        console.error(`❌ FATAL: ${out.fatal}`);
        process.exit(2);
    }
    check("4: HEADLESS-DEFAULT — ohne Hook entsteht KEIN Ring (Null-Renderer ruht)", out.headlessQuiet === true);
    check(
        "1: genau 4 Ring-Meshes in der Szene — 3 Schalen und die Naht der Schale 0 (Draw-Calls gedeckelt)",
        out.meshCount === 4 && out.sceneMeshes === 4,
        `meshes=${out.meshCount} szene=${out.sceneMeshes}`
    );
    check(
        "1: Vertex-Zahlen wie deklariert (winkel×reihen je Schale)",
        out.vertsDeclared === true,
        `counts=${out.vertCounts && out.vertCounts.join("/")}`
    );
    check(
        "1: ZWEI Stoffe — frei (ohne Maske und Weiche) für die Schalen und Schale 0 frei, Maske + Weiche nur auf dem Naht-Mesh",
        out.zweiStoffe === true
    );
    check("1: sichtbar erst nach vollem Refresh + frustumCulled aus, wirft nicht, empfängt (die Horizont-Karte, D3)", out.ready && out.visible && out.flags);
    check("1: LOCH-DECKEL — Schale 1 beginnt am Spieler (0.5·span), deckZoneRad = Ziel-Zone", out.innerRandOk === true);
    check(
        "Bau IN SCHEIBEN aus dem Fern-Faden über Takte (je Takt <= scheibe × scheibenImFlug, mehrere Takte, Cursor voll)",
        out.buildBudgeted === true,
        `ticks=${out.buildTicks} maxDelta=${out.buildMaxDelta}`
    );
    check(
        "2: HÖHEN == GESETZ — 60 Proben |mesh − _terrainMacroSurfaceY(snap,false)| < 0.01 (inkl. Wasser-Klemme/Saum)",
        out.probesBad === 0,
        `bad=${out.probesBad} worst=${out.probesWorst && out.probesWorst.toFixed(4)}`
    );
    check("SELBSTTEST: die verfälschte Erwartung (law + 0.5) fällt rot (60/60)", out.selftestRed === true);
    const ww = out.wasser || {};
    const wa = out.wasserAlt || {};
    check(
        "2c: DAS EINE WASSER — unter dem Fern-Wasser liegt jeder nasse Ring-Punkt unter dessen tiefstem Tal (keine Klumpen)",
        ww.nass > 0 && ww.klumpen === 0,
        `${ww.nass} nasse Punkte, Klumpen ${ww.klumpen}, tiefstes Tal ${ww.tal} m, höchster Ring-Punkt ${ww.hoechster} m, Spiegel Welt ${(out.wasserSpiegel || {}).welt} m / Probe ${(out.wasserSpiegel || {}).probe} m` +
            (ww.klumpen ? " — TÄTER: der Ring trägt ein zweites Wasser über dem Tal des Fern-Wassers" : "") +
            (ww.nass > 0 ? "" : " — keine nassen Punkte: die Probe wäre leer")
    );
    check(
        "2c SELBSTTEST: die alte Regel (Spiegel − wasserDrop) fällt rot beim Namen",
        wa.klumpen > 0,
        `alt: ${wa.klumpen} von ${wa.nass} nassen Punkten über dem tiefsten Tal (${wa.tal} m), höchster ${wa.hoechster} m`
    );
    const hb = out.hub || {};
    check(
        "2c: DER HUB liest Wind-Zeile und Treiber des Gesetzes (beide doppelt: doppelter Hub; jede allein hebt ihn)",
        hb.hub > 0 && Math.abs(hb.beide / hb.hub - 2) < 1e-6 && [hb.nurWind, hb.nurTreiber].every((h) => h > hb.hub && h < 2 * hb.hub),
        `Hub ${(hb.hub || 0).toFixed(3)} m (Wind ${hb.wind}, Treiber ${hb.treiber}), beide doppelt ×${(hb.beide / hb.hub).toFixed(4)}, nur Wind ${(hb.nurWind || 0).toFixed(3)} m, nur Treiber ${(hb.nurTreiber || 0).toFixed(3)} m`
    );
    check(
        "3: RE-ZENTRIEREN — der Anker wandert QUANTISIERT nach 400-m-Teleport",
        out.anchorMoved === true && out.anchorQuantized === true
    );
    check(
        "3: der Re-Anker hängt in Scheiben voll ein (Zähler == totalVerts)",
        out.refreshRan === true && out.reanchorBudgeted === true,
        `ticks=${out.reanchorTicks}`
    );
    check(
        "3b: DER HAUPT-FADEN RECHNET KEIN FERN-GESETZ (B2) — während ein Re-Anker einhängt, ruft der Takt des Rings weder das Höhen-Gesetz noch die Boden-Farbe; Selbsttest: EIN Ruf im Fenster zählt",
        out.gesetzImTakt === 0 && out.gesetzSelbsttest === 1,
        `Rufe im Takt ${out.gesetzImTakt}, Selbsttest ${out.gesetzSelbsttest}` +
            (out.gesetzImTakt ? " — TÄTER: der Takt des Rings rechnet das Gesetz der Ferne im Haupt-Faden" : "")
    );
    check(
        "3: die Proben stimmen am NEUEN Ort (Höhen schwimmen nicht)",
        out.probes2Bad === 0,
        `bad=${out.probes2Bad} worst=${out.probes2Worst && out.probes2Worst.toFixed(4)}`
    );
    check(
        "6: KAMERA-WEITUNG — far = Schale-3-aussen + 500, alter Wert gemerkt",
        out.camWidened === true,
        `far=${out.camFar} soll=${out.camFarWide} alt=${out.camFarAlt}`
    );
    check("6: DISPOSE-RÜCKNAHME — camera.far kehrt zum alten Wert zurück, Ring entsorgt", out.disposeRestored === true);
    check(
        "7: nach dem Dispose entsteht der Ring aus dem Fern-Faden wieder ganz (Cursor voll, sichtbar)",
        out.fzCpuFertig === true
    );
    check(
        "8: DER FELD-PASS existiert, das Feld malte, das PANORAMA ist gebacken (Persistenz)",
        out.fpDa === true &&
            out.fpLaeufe >= 1 &&
            out.fpTexOk === true &&
            out.fpSichtbar === true &&
            out.fpPanoLaeufe >= 1,
        `laeufe=${out.fpLaeufe} pano=${out.fpPanoLaeufe}`
    );
    check(
        "8: Texel-Höhen == f64-Gesetz im Seh-Band (≤ 0.5 m bis 40 km, Wasser flach auf wl)",
        out.fpWorst >= 0 && out.fpWorst <= 0.5,
        `worst=${Number.isFinite(out.fpWorst) ? out.fpWorst.toFixed(4) : out.fpWorst}`
    );
    check(
        "8: die ECHTE Render-Probe trifft — der Fullscreen-Raymarch zeichnet Horizont-Pixel",
        Number.isFinite(out.fpTreffer) && out.fpTreffer > 50,
        `treffer=${out.fpTreffer}${out.fpRenderErr ? " err=" + out.fpRenderErr : ""}`
    );
    check(
        "8 SELBSTTEST: die Luft des Passes liest die Himmels-Sicht der EINEN Atmosphäre — ohne ihre Tafeln fehlt jedem Treffer die In-Streuung",
        out.fpTreffer > 50 && out.fpLuftGehoben >= out.fpTreffer * 0.9,
        `von der Luft gehoben=${out.fpLuftGehoben} von ${out.fpTreffer} Treffern`
    );
    check(
        "8b: DAS EINBLENDEN — ein fern geborener Satz beginnt ganz verworfen und löst sich über WELT_SCHWUND_MS auf, ohne Wunsch erscheint er sofort",
        out.einStart > 0.99 &&
            out.sofortStart === 0 &&
            out.einMitte > 0.2 &&
            out.einMitte < 0.8 &&
            out.einEnde === 0 &&
            out.einAus === true,
        `start=${out.einStart} mitte=${out.einMitte} ende=${out.einEnde} aus=${out.einAus} sofort=${out.sofortStart}${out.einErr ? " " + out.einErr : ""}`
    );
    check("8: der Pass fällt mit dem Ring (Dispose)", out.fpDisposed === true);
    check(
        "9: DIE NAHT — der Ring trägt den Boden-Stoff des Chunks (Wege-Karte + Geologie bauen ihn, dieselben Licht-Knoten)",
        out.nahtStoffGeo > 0 && out.nahtStoffWege > 0 && out.nahtSlotsRing === out.nahtSlotsChunk,
        `geologie=${out.nahtStoffGeo} wege=${out.nahtStoffWege} ring=[${out.nahtSlotsRing}] chunk=[${out.nahtSlotsChunk}]` +
            (out.nahtErr ? ` err=${out.nahtErr}` : "")
    );
    check(
        "9: DIE NAHT — dieselbe Höhe: die Stufe Ring (0,3 m draußen) gegen Chunk (drinnen), je gegen das volle Gesetz — keine Kante (Bias ≤ 0,15 m), p95 ≤ √(Sehne des Rings im Freien² + Abweichung des Chunks²) + 0,1 m (zwei unabhängige Fehler); Selbsttest: das alte 2-m-Tauchen fällt rot",
        out.nahtN >= 40 &&
            Math.abs(out.nahtBias) <= 0.15 &&
            out.nahtP95 <= Math.hypot(out.nahtSehneP95, out.nahtEigenP95) + 0.1 &&
            out.nahtSelbstP95 > Math.hypot(out.nahtSehneP95, out.nahtEigenP95) + 0.1,
        `chunks=${out.nahtChunks} proben=${out.nahtN} chunk-eigen-p95=${(+out.nahtEigenP95).toFixed(3)} ring-sehne-p95=${(+out.nahtSehneP95).toFixed(3)} bias=${(+out.nahtBias).toFixed(3)} p50=${(+out.nahtP50).toFixed(3)} p95=${(+out.nahtP95).toFixed(3)} max=${(+out.nahtMax).toFixed(3)} selbsttest-p95=${(+out.nahtSelbstP95).toFixed(3)}`
    );
    check(
        "9: DIE NAHT — kein Loch: wo der maskNode verwirft (`_fernRingRegel` 2), trifft der senkrechte Strahl ein Deck (Chunk oder Stich-Band), an allen vier Kanten innen und außen und im Inneren; Selbsttest: die alte Regel (die ganze Chunk-Zelle verwirft) zeigt Löcher",
        !!out.loch &&
            out.loch[1] >= 500 &&
            out.loch[0] === 0 &&
            !!out.lochZelle &&
            out.lochZelle[0] > 0,
        `verworfen=${(out.loch || [])[1]} loch=${(out.loch || [])[0]} seiten=${JSON.stringify(out.lochSeite || {})} orte=${JSON.stringify(out.lochOrte || [])} geomorph=${out.morph} selbsttest-zelle=${(out.lochZelle || []).join("/")}`
    );
    check(
        "9: DIE NAHT — kein Durchstich: wo der Ring zeichnet, liegt er nicht über dem Deck (im Saum um die Weiche gesenkt — er weicht dem Chunk in die Tiefe); Selbsttest: ohne die Karte sticht seine Sehne durch (> 2 %)",
        out.durchN >= 100 &&
            out.durchAnteil === 0 &&
            out.maskNode === true &&
            !!out.maskeTreue &&
            out.maskeTreue[1] > 0 &&
            out.maskeTreue[0] === out.maskeTreue[1] &&
            out.durchOhne > 0.02,
        `proben=${out.durchN} anteil=${(+out.durchAnteil).toFixed(4)} seiten=${JSON.stringify(out.durchSeite || {})} weiche=${out.weiche} stufen=${JSON.stringify(out.nahtStufen || {})} zeit=${(out.zeit9 || []).join("+")}ms maskNode=${out.maskNode} karte=${(out.maskeTreue || []).join("/")} selbsttest-ohne-karte=${(+out.durchOhne).toFixed(4)}`
    );
    check(
        "9: DIE NAHT — kein Einschnitt: wo das Deck mehr als 2 m unter der 2D-Höhe liegt (Höhlen-Mündung, Kanal, Edit) und der Ring zeichnet, steht er nicht über ihm — die Naht trägt die Fläche des Feldes, das der Chunk zeichnet, und die Weiche des Saums den Fehler der Masche (`_fernRingWeiche`: Steigung × Durchmesser); Selbsttest: der Ring auf der 2D-Höhe (die alte Naht) schneidet ein",
        !!out.muendung && out.muendung[0] === 0 && out.feldOffen === 0 && out.feldOhne === 0 && out.muendungAlt > 0,
        `einschnitt=${(out.muendung || []).join("/")} orte=${JSON.stringify(out.muendungOrte || [])} luecke=${out.muendungLuecke} (davon unter der Weiche ${out.lueckeOffen} ${JSON.stringify(out.lueckeOrte || [])}) weiche-max=${out.weicheMax} m feld: takte=${out.feldTakte} offen=${out.feldOffen} ohne-flaeche=${out.feldOhne} spalte=${out.feldUs} µs (${out.feldRand} Rand-Punkte) selbsttest-2d-hoehe=${out.muendungAlt}`
    );
    check(
        "10: DIE FERN-FARBE OHNE STREIFEN — Streifen-Index (RMS Nachbar-Sprung / RMS 4er-Sprung) im Median ≤ 0,5",
        out.streifenN >= 10 &&
            out.streifenMedian <= 0.5 &&
            !!out.streifenSelbst &&
            out.streifenSelbst[0] >= 0.8 &&
            out.streifenSelbst[1] <= 0.3,
        `reihen=${out.streifenN} median=${(+out.streifenMedian).toFixed(3)} p90=${(+out.streifenP90).toFixed(3)} selbsttest zufall=${(+(out.streifenSelbst || [])[0]).toFixed(2)} glatt=${(+(out.streifenSelbst || [])[1]).toFixed(2)}`
    );
    {
        const q = out.dachGemessen / out.dachDeckung;
        const qAlt = out.dachGemessen / out.dachAlt;
        check(
            "11: DAS DACH IST DER BESTAND — die Deckung des Kronendachs trifft die Kronen-Deckung des gepflanzten Waldes (192 × 192 m, je 32-m-Land-Kachel) im Verhältnis 0,8–1,25; Selbsttest: das alte Dach (die Geburt als Deckung) fällt rot",
            out.dachKacheln >= 8 && q >= 0.8 && q <= 1.25 && !(qAlt >= 0.8 && qAlt <= 1.25),
            `kacheln=${out.dachKacheln} gepflanzt=${(+out.dachGemessen).toFixed(3)} dach=${(+out.dachDeckung).toFixed(3)} verhaeltnis=${q.toFixed(3)} selbsttest-alt=${(+out.dachAlt).toFixed(3)} (${qAlt.toFixed(3)})` +
                (out.dachErr ? ` err=${out.dachErr}` : "")
        );
    }
    {
        const wk = out.weicheKosten || {};
        check(
            "12: DIE WEICHE KOSTET NUR AN DER NAHT — kein gezeichnetes Dreieck mit depthNode ohne Rand-Zelle des Gebauten in Reichweite (1½ s_max); Selbsttest: die Weiche über den ganzen Ring findet Dreiecke ohne Naht",
            wk.dreiecke > 0 && wk.ohne === 0 && out.weicheSelbst > 0 && out.weicheRandZellen > 0,
            `weiche=${wk.dreiecke} ohne-naht=${wk.ohne} ${JSON.stringify(wk.je || {})} ring=${out.weicheRing} rand-zellen=${out.weicheRandZellen} selbsttest-weiche-überall=${out.weicheSelbst}` +
                (wk.ohne > 0
                    ? ` — TÄTER: der Ring-Stoff mit depthNode (\`_fernRingEnsure\`) schreibt die Tiefe auf ${wk.ohne} Dreiecken ohne Naht (${Object.keys(wk.je || {}).join(", ")})`
                    : "")
        );
        const tt = out.teilung || {};
        check(
            "13: DIE TEILUNG IST TREU — ein freies Dreieck trägt nur Regel 0, ein getragenes nur Regel 2 (die Punkte der Loch-Probe und Ecken, Kanten-Mitten, Schwerpunkte); Selbsttest: die Naht als frei zeigt Stiche, verworfen Löcher",
            tt.proben >= 1000 && tt.stich === 0 && tt.loch === 0 && tt.selbstStich > 0 && tt.selbstLoch > 0,
            `proben=${tt.proben} stich=${tt.stich} loch=${tt.loch} klassen(frei/naht/getragen)=${JSON.stringify(tt.n || null)} orte=${JSON.stringify(tt.orte || [])} selbsttest stich=${tt.selbstStich} loch=${tt.selbstLoch}` +
                (tt.proben ? "" : " — TÄTER: die Schale 0 hat keine Teilung (`fr.teilung`, `_fernRingTeilung`)")
        );
        const w = out.binnen || {};
        check(
            "14: DAS WASSER DES RINGS IST DAS WASSER DES BODENS — ein See liegt über dem Ring; ein Fluss trägt seinen Anteil der Masche als Wasser-Anteil aNass (≤ 0,05, gezeichnet mit dem Blick des Wassers), seine Boden-Farbe ohne Fern-Blau (≤ 0,01) und seine Höhe als Mittel aus Boden und Spiegel (≤ 0,05 m); Selbsttest: die alte Regel (kein Anteil, keine Senkung) verfehlt den Fluss",
            w.fluss >= 20 &&
                w.sichtbar >= 5 &&
                w.abweichung === 0 &&
                w.zwilling === 0 &&
                w.hoehe === 0 &&
                w.hoeheN >= 10 &&
                w.verdeckt === 0 &&
                w.alt >= w.fluss * 0.5 &&
                !w.karteFehlt &&
                w.karteMitte >= 10 &&
                w.karteMitteFehl === 0 &&
                w.karteDanebenFehl === 0,
            `see=${w.see} verdeckt=${w.verdeckt} fluss=${w.fluss} deutlich(>=0,25)=${w.sichtbar} abweichung=${w.abweichung} zwilling=${w.zwilling} hoehe=${w.hoehe}/${w.hoeheN} offen=${w.offen} orte=${JSON.stringify(w.orte || [])} selbsttest-alt=${w.alt} alt-hoehe=${w.altHoehe} hub-max=${w.hebMax.toFixed(3)} m karte(mitte/fehl/daneben)=${w.karteMitte}/${w.karteMitteFehl}/${w.karteDanebenFehl}` +
                (w.karteFehlt ? " — TÄTER: die Wege-Karte trägt keine Fluss-Schicht (`_flussKarteMalen`)" : "") +
                (out.binnenErr ? ` err=${out.binnenErr}` : "") +
                (w.verdeckt > 0
                    ? " — TÄTER: `_fernNass` legt den Ring über den See (`_atlasWaterLevelAt` koerper)"
                    : "") +
                (w.ohneAttribut > 0
                    ? " — TÄTER: der Ring trägt keinen Wasser-Anteil (aNass fehlt, `_fernRingSchreibe`)"
                    : w.abweichung > 0
                      ? " — TÄTER: der Wasser-Anteil folgt nicht dem Kasten-Filter (`_fernFlussTeil`)"
                      : "") +
                (w.zwilling > 0
                    ? " — TÄTER: die Boden-Farbe mischt eine Fern-Wasser-Farbe ein (Zwilling des Wasser-Körpers)"
                    : "") +
                (w.hoehe > 0
                    ? " — TÄTER: der Ring trägt den Fluss nicht in der Höhe (`_fernRingY`, Kasten-Mittel zum Spiegel)"
                    : "")
        );
    }
    const hz = out.horizont || [];
    check(
        "15: DER HORIZONT STEHT NACH DEM SCHNEE — ein Edit-Auftrag fliegt, die Schneegrenze bestellt neu (`_fernRingNeuBestellen`)",
        hz[0] > 0 && hz[2] > hz[1] && hz[3] === 0,
        `[im Flug, Generation vorher, nachher, editFlug] ${hz}`
    );

    wandEnde(errs, "DER FERN-RING STEHT UND DAS FELD ZEICHNET: 3 Schalen aus dem EINEN Höhen-Gesetz " +
            "(Fern-Wahrheit includeDetail=false, XZ welt-gesnappt), der Fern-Faden rechnet Ring, Feld und Krone in " +
            "Scheiben aus dem Gelände-Gesetzbuch, der Haupt-Faden hängt nur ein, " +
            "quantisiertes Re-Zentrieren, headless-default ruhig.");
});
