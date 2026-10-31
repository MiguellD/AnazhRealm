class AnazhRealm_gelaende_boden {
    // ===== ATLAS · Gelaende/boden — Welt-Genese · Genesis-Platz · Boden-Sicht · Hang und Fels · Stufen-Kette · Höhe =====
    // DER GEZEICHNETE BODEN AM WELT-PUNKT (K07, der Chunk-Rand): je Punkt die OBERSTE tragende Fläche aller Meshe, die dort
    // zeichnen — das Gesetz der Boden-Karte (`_bodenKarteAusMesh`) über die Chunk-Naht hinweg. Am unteren Rand jedes Chunks
    // (je Achse ein halber Zellen-Schritt, 0,9 m) zeichnet das Mesh des NACHBARN (Surface-Nets: die Fläche zwischen seiner
    // letzten und der ersten eigenen Zelle gehört ihm); die Karte des Eigners ist dort leer oder trägt nur, was er darunter
    // zeichnet (einen Höhlen-Boden 60 m tiefer), und die Naht der Meshe liegt zwischen zwei Punkten des Rasters. Darum nimmt
    // jede Ecke der Raster-Zelle das Maximum aus Eigner und unteren Nachbarn: die Karten einer Stufe tasten dasselbe Raster der
    // Welt ab (Ursprung Chunk − Schritt, Abstand Schritt/Teilung, der Chunk ein Vielfaches davon), ihr Saum reicht zwei Schritte
    // herüber. Vorher las der Stand-Leser nur die Karte des Eigners und fiel im Streifen auf den Träger: 4,9 % der Fläche, ein
    // Netz aus 0,9-m-Streifen, auf dem Pfoten und Füße auf der Höhe des Leibs standen (am 30°-Hang 86 von 869 Stand-Pfoten im
    // Trab 12–22 cm über dem Boden, ein stehender Wolf hangauf mit den Hinterpfoten 0,40 m — gate:koerper-stand K6). null ohne
    // Karte (fern, ungebaut) oder ohne Boden an einer Ecke. DER EINE LESER DES GEZEICHNETEN BODENS (K21): Stand-Leser, Nah-Wiese
    // (Fuß, Hang, Grün) und Nah-Streu (Fuß, Hang) lesen nur ihn — bis K21 lasen Wiese und Streu nur die Karte des Eigners, im
    // Rand-Streifen fiel kaum ein Büschel (Dichte 0,11 gegen 1,31 je m², gate:koerper-stand K7). `aus` (optional) trägt den
    // Grün-Kanal (0…1) der Karte, die an jeder Ecke gewinnt; welche Karten ein Rechteck liest, nennt `_bodenSichtChunks`.
    // `stufe` (optional, 0…1) legt das Stufen-Gewicht fest, statt es am Auge zu messen: die Enden des Geomorphs, Lage (0) und
    // Ziel (1), zwischen denen der Fuß der Streu dem Auge folgt (`_streuFuss`).
    _bodenSichtAt(x, z, aus, stufe) {
        const vc = this.state.voxelChunks;
        if (!vc) return null;
        const span = this._voxelChunkConfig(0).span;
        const cx = Math.floor(x / span);
        const cz = Math.floor(z / span);
        const e = vc.get(`${cx},${cz}`);
        const lod = e ? e.lod || 0 : 0;
        const cfg = this._voxelChunkConfig(lod);
        const T = AnazhRealm.BODEN_KARTE_TEILUNG;
        const h = cfg.step / T;
        const M = T * (cfg.dim + 3) + 1;
        const n = cfg.dim * T; // Raster-Abstände je Chunk
        const gx = Math.floor(x / h);
        const gz = Math.floor(z / h);
        let a = -Infinity,
            b = -Infinity,
            c = -Infinity,
            d = -Infinity;
        let ga = 0,
            gb = 0,
            gc = 0,
            gd = 0;
        // DIE STUFEN-NAHT (K51): ein unterer Nachbar einer anderen Stufe tastet sein eigenes Raster ab — er trägt seine Fläche
        // bilinear in SEINEM Raster bei (alle vier Ecken), die Karten der Stufe des Eigners je Ecke. Bis K51 las der Leser über die
        // Stufen-Grenze nichts: im Rand-Streifen einer Naht (die Nah-Zone 3×3, 43–65 m vor dem Auge) fiel er auf den Träger
        // (gate:koerper-stand K6: 346 von 772 Punkten mehr als 25 cm neben dem gezeichneten Boden, Pfoten 24 cm).
        let fremd = -Infinity,
            fremdG = 0;
        for (let q = 0; q < 4; q++) {
            const ax = cx - (q & 1);
            const az = cz - (q >> 1);
            const E = q === 0 ? e : vc.get(`${ax},${az}`);
            if (E && E.surfMap && (E.lod || 0) !== lod) {
                const v = this._bodenKarteBilinear(E, ax, az, x, z, aus, stufe);
                if (v !== null && v.y > fremd) {
                    fremd = v.y;
                    fremdG = v.gruen;
                }
                continue;
            }
            const m = E && (E.lod || 0) === lod ? E.surfMap : null;
            if (!m) continue;
            const i = gx - ax * n + T;
            const j = gz - az * n + T;
            if (i < 0 || j < 0 || i + 1 >= M || j + 1 >= M) continue;
            const o = i + j * M;
            const g = aus ? E.gruenMap : null;
            // DER GEOMORPH DER STUFE (K51-2): im Übergangs-Band zeichnet der Stoff zwischen der Karte der Lage und der des Ziels
            const st = this._bodenStufeMisch(E, ax, az, x, z, stufe);
            const ka = st ? st(m, o) : m[o],
                kb = st ? st(m, o + 1) : m[o + 1],
                kc = st ? st(m, o + M) : m[o + M],
                kd = st ? st(m, o + M + 1) : m[o + M + 1];
            if (ka > a) {
                a = ka;
                ga = g ? g[o] : 0;
            }
            if (kb > b) {
                b = kb;
                gb = g ? g[o + 1] : 0;
            }
            if (kc > c) {
                c = kc;
                gc = g ? g[o + M] : 0;
            }
            if (kd > d) {
                d = kd;
                gd = g ? g[o + M + 1] : 0;
            }
        }
        const eigen = a > -Infinity && b > -Infinity && c > -Infinity && d > -Infinity;
        const fu = x / h - gx;
        const fv = z / h - gz;
        let y = eigen ? (a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + d * fu) * fv : -Infinity;
        let gruen = 0;
        if (fremd > y) {
            y = fremd;
            gruen = fremdG;
        } else if (eigen && aus) gruen = ((ga * (1 - fu) + gb * fu) * (1 - fv) + (gc * (1 - fu) + gd * fu) * fv) / 255;
        // DIE SÄULE, DIE KEIN NETZ TRÄGT (`_saeuleVorlaeufig`): bis zum Neubau ihrer Chunks ist ihre Krone der gezeichnete Boden
        // über ihrem Grundriss (ohne Grün) — der Fuß auf dem Block, der Block auf dem Dachboden
        const S = this.state.saeulenVorlaeufig;
        if (S && S.size)
            for (const s of S.values())
                if ((x - s.x) ** 2 + (z - s.z) ** 2 < s.rr && !(y >= s.krone)) {
                    y = s.krone;
                    gruen = 0;
                }
        if (!(y > -Infinity)) return null;
        if (aus) aus.gruen = gruen;
        return y;
    }
    // Die Karte EINES Chunks (ax, az) bilinear am Punkt in ihrem eigenen Raster (Schritt ihrer Stufe / Teilung): { y, gruen }
    // oder null (der Punkt liegt nicht über der Karte, eine Ecke ohne Boden). Der Leser der Stufen-Naht (`_bodenSichtAt`).
    _bodenKarteBilinear(E, ax, az, x, z, aus, stufe) {
        const cfg = this._voxelChunkConfig(E.lod || 0);
        const T = AnazhRealm.BODEN_KARTE_TEILUNG;
        const h = cfg.step / T;
        const M = T * (cfg.dim + 3) + 1;
        const n = cfg.dim * T;
        const gx = Math.floor(x / h);
        const gz = Math.floor(z / h);
        const i = gx - ax * n + T;
        const j = gz - az * n + T;
        if (i < 0 || j < 0 || i + 1 >= M || j + 1 >= M) return null;
        const m = E.surfMap;
        const o = i + j * M;
        const st = this._bodenStufeMisch(E, ax, az, x, z, stufe);
        const a = st ? st(m, o) : m[o],
            b = st ? st(m, o + 1) : m[o + 1],
            c = st ? st(m, o + M) : m[o + M],
            d = st ? st(m, o + M + 1) : m[o + M + 1];
        if (!(a > -Infinity && b > -Infinity && c > -Infinity && d > -Infinity)) return null;
        const fu = x / h - gx;
        const fv = z / h - gz;
        const g = aus ? E.gruenMap : null;
        return {
            y: (a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + d * fu) * fv,
            gruen: g
                ? ((g[o] * (1 - fu) + g[o + 1] * fu) * (1 - fv) + (g[o + M] * (1 - fu) + g[o + M + 1] * fu) * fv) / 255
                : 0,
        };
    }
    // DIE KARTE DES ZIELS (K51-2): die Boden-Karte des Chunks aus seinen Morph-Zielen (`aMorphTarget` — das Netz der nächst
    // gröberen Stufe, an der Naht der gröbere Nachbar), lazy beim ersten Leser im Übergangs-Band, neu nach jedem Naht-Morph
    // (`_applyCrossLodGeomorph` leert sie). Der Stoff zeichnet Lage + (Ziel − Lage) · Faktor; Naht + Stufe − Naht · Stufe ist in
    // der Stufe linear: die Karte der Lage (`surfMap`, Naht eingerechnet) und die des Ziels, gemischt mit dem Stufen-Gewicht.
    // Liefert die Misch-Funktion (Karte, Index) → Höhe am Punkt (x, z), oder null, wo das Gewicht 0 ist; `stufe` legt es fest.
    _bodenStufeMisch(E, ax, az, x, z, stufe) {
        if (!E || !E.mesh || !E.mesh.geometry || (E.lod || 0) >= 3) return null;
        const w = stufe == null ? this._stufeGewichtAuge(E.lod || 0, x, z) : stufe;
        if (!(w > 0)) return null;
        if (!E.surfMapZiel) {
            const g = E.mesh.geometry;
            const k = this._bodenKarteNaht(g, ax, az, E.lod || 0, g.attributes.aMorphTarget.array, "ziel");
            E.surfMapZiel = k && k.hoehe;
            if (!E.surfMapZiel) return null;
        }
        const mz = E.surfMapZiel;
        return (m, o) => (m[o] > -Infinity && mz[o] > -Infinity ? m[o] + (mz[o] - m[o]) * w : m[o]);
    }
    // DIE KARTEN DES BODEN-LESERS über einem Rechteck (Welt-XZ): jeder Chunk, dessen Karte `_bodenSichtAt` dort liest — der
    // Eigner und, in den ersten zwei Zellen-Schritten des Chunks (so weit reicht der Saum einer Karte herüber), seine unteren
    // Nachbarn. Map Schlüssel → Karte (ein leerer Chunk mit undefined: baut er später Boden, ist das ein Neubau), dazu ihr
    // `rechteck`; null, solange einer davon noch keine Karte hat — die Kachel wartet auf ihren GANZEN Boden, nie nach
    // Streaming-Reihenfolge.
    _bodenSichtChunks(x0, z0, x1, z1) {
        const vc = this.state.voxelChunks;
        if (!vc) return null;
        const cfg = this._voxelChunkConfig(0);
        const out = new Map();
        out.rechteck = [x0, z0, x1, z1];
        // je Chunk die Lage-Karte, die die Kachel las, und ihr Stand bei der Lesung (`_bodenKarteNaht` rastert an Ort und Stelle)
        [out.lage, out.stand] = [new Map(), new Map()];
        for (let cz = Math.floor((z0 - 2 * cfg.step) / cfg.span); cz <= Math.floor(z1 / cfg.span); cz++) {
            for (let cx = Math.floor((x0 - 2 * cfg.step) / cfg.span); cx <= Math.floor(x1 / cfg.span); cx++) {
                const k = `${cx},${cz}`;
                const e = vc.get(k);
                if (!e || !(e.surfMap || e.empty)) return null;
                out.set(k, e.surfMap);
                const L = e.mesh && e.mesh.geometry.userData.naht ? e.mesh.geometry.userData.naht.lage : null;
                out.lage.set(k, L);
                out.stand.set(k, L ? L.stand | 0 : 0);
            }
        }
        return out;
    }

    // DIE KACHEL LIEST IHREN BODEN (F3): tragen die Karten, die eine Kachel der Nah-Wiese/Nah-Streu las (`_bodenSichtChunks`),
    // über ihrem Rechteck noch denselben Boden? Ein neu gebauter Chunk fällt die Kachel nur, wenn sich seine Karte dort ändert
    // (die Zellen, die `_bodenSichtAt` im Rechteck liest); sonst liest sie ab jetzt die neue. Bis F3 fiel jede Kachel über
    // einem neu gebauten Chunk — ein Graben baut bis 3 × 3 Chunks neu, die Wiese daneben wuchs Kachel um Kachel neu, eine
    // je Takt (am Graben der Mess-Wiese 25 Fälle jenseits von 8 m: das Flackern).
    // DIE KARTE AN ORT UND STELLE (w4-b-boden): jede weitere Lage derselben Geometrie rastert in die Felder der Karte, die die
    // Kachel las (`_bodenKarteNaht`) — deren Werte sind dann nicht mehr die gelesenen. Die Kachel fragt darum den Stand je Zelle
    // ihres Rechtecks: wechselte eine seit der Lesung, fällt sie (hin und zurück zählt als Wechsel); jede andere Zelle trägt noch
    // den gelesenen Wert und vergleicht ihn mit der Karte, die der Chunk jetzt trägt — byte-gleich mit dem Vergleich einer Kopie.
    _bodenKartenStehen(karten) {
        const vc = this.state.voxelChunks;
        const [x0, z0, x1, z1] = karten.rechteck || [0, 0, -1, -1];
        for (const [ck, karte] of karten) {
            const e = vc && vc.get(ck);
            if (!e) return false;
            const L = karten.lage ? karten.lage.get(ck) : null;
            const gelesen = karten.stand ? karten.stand.get(ck) | 0 : 0;
            const S = L && (L.stand | 0) !== gelesen ? L.zelleStand : null;
            if (e.surfMap === karte && !S) continue;
            if (!e.surfMap || !karte || e.surfMap.length !== karte.length) return false;
            const cfg = this._voxelChunkConfig(e.lod || 0);
            const h = cfg.step / AnazhRealm.BODEN_KARTE_TEILUNG;
            const M = Math.round(Math.sqrt(karte.length));
            const c = ck.indexOf(",");
            const ox = Number(ck.slice(0, c)) * cfg.span - cfg.step;
            const oz = Number(ck.slice(c + 1)) * cfg.span - cfg.step;
            const i1 = Math.min(M - 1, Math.floor((x1 - ox) / h) + 1);
            const k1 = Math.min(M - 1, Math.floor((z1 - oz) / h) + 1);
            for (let k = Math.max(0, Math.floor((z0 - oz) / h)); k <= k1; k++)
                for (let i = Math.max(0, Math.floor((x0 - ox) / h)); i <= i1; i++) {
                    if (S && S[i + k * M] > gelesen) return false;
                    const a = karte[i + k * M];
                    const b = e.surfMap[i + k * M];
                    if (a !== b && !(a !== a && b !== b)) return false; // NaN = kein Boden, beide gleich
                }
            // die Kachel liest ab jetzt die Karte, die der Chunk trägt, in ihrem Stand
            const jetzt = e.mesh && e.mesh.geometry.userData.naht ? e.mesh.geometry.userData.naht.lage : null;
            karten.set(ck, e.surfMap);
            if (karten.lage) karten.lage.set(ck, jetzt);
            if (karten.stand) karten.stand.set(ck, jetzt ? jetzt.stand | 0 : 0);
        }
        return true;
    }

    // Täler und Seen trägt das Flussnetz des Gelände-Gesetzbuchs (K16): ein See ist eine Senke des Netzes (Ebene 0),
    // die Hydrosphäre füllt sie — keine Erosions-Simulation, kein Tarn-Pass, das Gelände entwässert aus sich selbst.

    // Worldgen-Inseln über `spawnIslandAt` (Surface-Nets, ein Pfad); Spawn-Y aus der echten Voxel-Surface
    // (`maxHeight` ist in Voxel-Welten 0 — `maxHeight + 20` landete Inseln IM Terrain).
    _worldgenSpawnFloatingIslands(WORLD_SIZE) {
        this.state.floatingIslands = [];
        this.state.ufos = [];
        // V18.331 — Dev-Drossel revertiert (schneller Cold-Start): fliegende Inseln zurück auf 3.
        const numIslands = 3;
        // Γ5-Stream-Gesetz: Math.random im Worldgen würfelt Peers in verschiedene Welten — pro Insel ein
        // eigener Stream (seed + "-island-i") für Größe/Höhe/Position.
        const baseSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        for (let i = 0; i < numIslands; i++) {
            const rng = this._streamRng(baseSeed + `-island-${i}`);
            const islandSize = 14 + rng() * 30; // 14..44 m Durchmesser
            const islandHeight = 6 + rng() * 10; // 6..16 m Wölbung
            const islandX = (rng() - 0.5) * WORLD_SIZE * 0.8;
            const islandZ = (rng() - 0.5) * WORLD_SIZE * 0.8;
            // Die Schwebe-Insel ist ein Wurf des Feldes: trägt die Wildnis den Ort nicht, steht keine (die Würfe davor
            // bleiben, der Strom je Insel ist eigen).
            if (!this._wildnisTraegt(islandX, islandZ)) continue;
            const surfY = typeof this._voxelSurfaceY === "function" ? this._voxelSurfaceY(islandX, islandZ) : 0;
            const baseSurf = Number.isFinite(surfY) ? surfY : this.state.terrainBaseHeight || 0;
            const islandY = baseSurf + 50 + rng() * 90; // 50..140 m über dem Boden
            const islandSeed = baseSeed + `-island-${i}`;
            const island = this.spawnIslandAt(islandX, islandY, islandZ, islandHeight, {
                size: islandSize,
                seed: islandSeed,
            });
            if (!island) continue;
            this.log(
                `Fliegende Insel ${i} erstellt: Position (${islandX.toFixed(1)}, ${islandY.toFixed(1)}, ${islandZ.toFixed(1)}), Grösse ${islandSize.toFixed(1)} m, Höhe ${islandHeight.toFixed(1)} m`
            );
            // V18.364 — die kosmetischen Insel-Begleiter-UFOs entfernt (Schöpfer „die
            // können raus, wirken falsch + flach, keine Struktur"). `spawnUfoAt`/`spawn_ufo`
            // bleiben fürs explizite Beschwören; der Himmel bleibt klar von Auto-UFOs.
        }
    }

    // DIE BEPFLANZTEN CHUNKS (speicher.K3): ein Stand trägt keinen Wurf des Gesetzes, nur die Chunks, deren Würfe ein älterer
    // Stand mitbrachte (`worldMeta.feldStand`) — jeder andere Chunk pflanzt neu, wie am ersten Tag. Ein Stand ohne die Liste
    // trug jeden Wurf: seine Chunks leiten sich aus dem Bestand ab (kein Doppel-Wurf) und reisen als Liste weiter. Die Chunks,
    // die schon stehen (ein Laden in der lebenden Seite, `_loadStateRestoreArchitectures`), pflanzen neu.
    // Vegetation streamt am Chunk-Lifecycle (`_populateVoxelChunkVegetation` in `_ensureVoxelChunkAt`).
    _worldgenBuildVoxelChunkCache() {
        try {
            const vspan = this._voxelChunkConfig().span;
            const wm = this.state.worldMeta || {};
            // V9.96 — Spawn-Queue beim Worldgen-Reset leeren. Pending-Tasks
            // aus der alten Welt sind nicht mehr relevant (Atlas + Surface
            // sind neu generiert, alte Positionen können kollidieren).
            this.state.pendingVegSpawns = [];
            this._saatOffen = null; // ebenso die Saat der alten Welt (`_tickSaat`)
            if (!Array.isArray(wm.feldStand)) {
                const alt = new Set();
                for (const a of this.state.architectures || [])
                    if (a && a.position)
                        alt.add(`${Math.floor(a.position.x / vspan)},${Math.floor(a.position.z / vspan)}`);
                wm.feldStand = [...alt];
            }
            this.state.voxelPopulatedChunks = new Set(wm.feldStand);
            for (const key of this.state.voxelChunks ? this.state.voxelChunks.keys() : [])
                if (!this.state.voxelPopulatedChunks.has(key))
                    (this.state.pendingFoliageChunks || (this.state.pendingFoliageChunks = new Set())).add(key);
            this.log(
                `Welle 6.G P2: voxel-basierte Welt — Vegetation streamt mit den Voxel-Chunks (${this.state.voxelPopulatedChunks.size} Chunks aus einem älteren Stand)`,
                "INFO"
            );
        } catch (e) {
            this.log(`populateChunkVegetation initial fehlgeschlagen: ${e.message}`, "ERROR");
        }
    }

    // Hydrosphären-Atlas (Drainage-Netz: Flüsse/Seen/Wasserfälle) + Render; Atlas VOR Render (Render liest state.hydrosphere).
    // DIE HEIMAT ENTSTEHT IM FADEN (Karte hydro-faden, Lehre 14): die Weltgen räumt die alte Wahrheit (die fernen Kacheln des
    // alten Seeds fallen mit, A3), gibt dem Voxel-Faden den Stand dieser Welt (`_voxelWorkerSyncWorldgenState`) und bestellt
    // die Heimat (`_hydroBestellen`). Das Versprechen trägt den Rest: mit ihr stehen Band und Wasser-Meshes, und erst dann
    // fragt der Strom den Faden (`voxelWorkerWorldgenSynced`). Bis zur Karte rechnete der Haupt-Faden sie hier synchron
    // (Kalt-Boot 168 ms headless). → Promise<Hydrosphäre | null> (null: eine neuere Welt kam ihr zuvor).
    _worldgenComputeAndBuildHydrosphere() {
        this._hydroWelt = (this._hydroWelt | 0) + 1;
        this._hydroBestellt = new Map();
        this.state.hydroTiles = new Map();
        this.state.hydrosphere = null;
        this.state.voxelWorkerWorldgenSynced = false;
        this._computeHydroBand();
        this._voxelWorkerSyncWorldgenState();
        return this._hydroBestellen("heim", null).then((hydro) => {
            if (!hydro) return null;
            this.log(
                `V9.43-b: Hydrosphäre aus dem Faden — ${hydro.fluesse} Flüsse, ${hydro.seen} Seen, ${hydro.waterfalls.length} Wasserfälle`,
                "INFO"
            );
            try {
                this._buildHydrosphereMeshes();
            } catch (e) {
                this.log(`Hydrosphäre-Rendering fehlgeschlagen: ${e.message}`, "ERROR");
            }
            // ab hier fragt der Strom den Faden (`_voxelFadenTraegt`): die Heimat steht in Main und Faden
            this.state.voxelWorkerWorldgenSynced = true;
            return hydro;
        });
    }

    // DIE BESTELLUNG EINER REGION (Karte hydro-faden): die Heimat (`key` "heim", `origin` null) oder eine ferne Kachel entsteht
    // im Faden — der EINE Sender des Zustands (`_voxelZustandPost`) trägt den Auftrag an jeden Faden an DERSELBEN Stelle seiner
    // Reihe (jeder Auftrag dahinter liest sie; ein später geborener Neben-Faden bekommt sie vom Voxel-Faden, `_nebenFaden`),
    // der Voxel-Faden antwortet per Transfer (`_hydroAn`). Der Haupt-Faden rechnet sie nie: ohne Faden bricht es laut
    // (`_bruchMelden`); kommt der Faden über den Blob-Weg, wartet die Bestellung auf ihn.
    // → das Versprechen der Region (eine schon bestellte gibt ihres zurück; null, wenn eine neuere Welt ihr zuvorkam).
    _hydroBestellen(key, origin) {
        const B = this._hydroBestellt || (this._hydroBestellt = new Map());
        const da = B.get(key);
        if (da) return da.zusage;
        const welt = this._hydroWelt | 0;
        const e = { ab: null, origin, gepostet: false };
        const zusage = new Promise((ok, ab) => {
            e.ab = ab;
            e.post = () => {
                e.gepostet = true; // ein später geborener Voxel-Faden bekommt sie bestellt (`_getVoxelWorker`)
                const requestId = this.state.voxelWorkerNextRequestId++;
                this.state.voxelWorkerPending.set(requestId, { resolve: ok, reject: ab });
                this._voxelZustandPost({ type: "hydro", key, origin, requestId });
            };
        });
        e.zusage = zusage.then((msg) => this._hydroAn(key, msg.region, welt));
        B.set(key, e);
        if (this.state.voxelWorker) e.post();
        else if (this._voxelWeltWartet) (this._hydroWarte || (this._hydroWarte = [])).push(e.post);
        else {
            this._bruchMelden(
                `HYDRO-FADEN: die Hydrosphäre (${key}) ohne Voxel-Faden — der Haupt-Faden rechnet sie nie (Lehre 14)`
            );
            e.ab(new Error("kein Voxel-Faden für die Hydrosphäre"));
        }
        if (key !== "heim")
            e.zusage = e.zusage.catch((err) => {
                B.delete(key);
                this._bruchMelden(`HYDRO-FADEN: die Kachel ${key} kam nicht — ${(err && err.message) || err}`);
                return null;
            });
        return e.zusage;
    }

    // DER EMPFANG EINER REGION (Karte hydro-faden): die Region der eigenen Welt geht in den Zustand (Heimat oder Kachel), das
    // globale Band folgt (`_computeHydroBand`). Jeder Faden trägt sie schon (selbst gerechnet oder vom Voxel-Faden).
    _hydroAn(key, h, welt) {
        if (welt !== (this._hydroWelt | 0) || !h) return null; // eine Region einer alten Welt fällt
        if (key === "heim") this.state.hydrosphere = h;
        else {
            this.state.hydroTiles.set(key, h);
            this.log(`A3: Hydro-Kachel ${key} aus dem Faden (${h.fluesse} Fluesse, ${h.seen} Seen)`, "INFO");
        }
        this._computeHydroBand();
        return h;
    }

    // Globales Wasser-Y-Band: top = der höchste Spiegel JEDES Wasser-Körpers (waterLevel, jeder See, jeder Punkt jedes Flusses)
    // + 10 m, bottom = waterLevel − 10 m (reicht, weil die Iso nur die OBERE Wassergrenze rendert). Cells außerhalb werden ohne
    // Density-Sample klassifiziert (above=AIR, below=WATER) — dieselbe Regel wie der OOB-Live-Compute in
    // `_buildVoxelChunkWaterIsoSurface` → nahtfrei. DER FLUSS GEHÖRT HINEIN (K16): das Band kannte nur die Seen; seit die
    // Landform im Gelände-Gesetz liegt, steigen die Flüsse in die Täler des Mittelgebirges (Spiegel bis 55 m), das Band endete
    // bei 23,7 m (der höchste See + 10) — der Zell-Bau ließ jede Fluss-Zelle darüber AIR: in der Heimat 344 von 549 Fluss-
    // Segmenten ohne gezeichnetes Wasser (am Bach -744/-872 Wasser-Meshes 0, die Quellen trocken).
    // A3 (V18.132) — das Band ist GLOBAL (V9.77: alle Chunks teilen die Thresholds): die Spiegel der fernen Kacheln heben es
    // mit, sonst übersprünge der Band-Skip ihre Zellen als garantiert-AIR. Der Rechner ist der des Gelände-Kerns (`hydroBand`),
    // derselbe im Faden.
    _computeHydroBand() {
        const wl = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
        const regionen = [this.state.hydrosphere].concat(
            this.state.hydroTiles ? [...this.state.hydroTiles.values()] : []
        );
        this.state.hydroBand = globalThis.__gelaendeCore.hydroBand(wl, regionen);
    }

    // Das Wasser-Cell-Feld ist DERIVED (Worldgen-Density + voxelEdits + Architektur-Stempel): Spieler-
    // Mutationen propagieren via `_remeshVoxelChunksAround`, keine zweite Reaktiv-Schicht; der Atlas
    // (`state.hydrosphere`) bleibt worldgen-frozen.

    // Deterministischer (alle Peers gleich) offener, flacher, trockener Spawn-Punkt: Ring-Spirale um
    // (0,0), der ERSTE Punkt, der (a) kein Kavernenboden ist (surf ≥ macro − 6; `getTerrainHeightAt` ist
    // die echte Voxel-Oberfläche), (b) trocken liegt — über JEDEM Wasser (`_nassAt`, Marge 1,5 m: See,
    // Fluss, Tarn; bis 06.10. nur über dem Meeresspiegel), (c) die Scheibe der Genesis-Plattform trägt: der Grund unter ihr
    // (`_genesisGrund`) streut höchstens ihre Dicke — sie liegt auf und keine Kante steckt im Hang (K52; bis dahin ±6-m-Proben
    // mit Δ ≤ 3,5 m, die Scheibe schwebte darum 5 m darüber). Die Lichtung um die Plattform hält die EINE Natur-Wand frei
    // (ihr Bauplan trägt sie, Befund V-D1). Nichts gefunden bis 240 m → (0,0).
    _findOpenSpawnSpot() {
        const candidates = [[0, 0]];
        for (let r = 12; r <= 240; r += 12) {
            for (let a = 0; a < 8; a++) {
                const ang = (a / 8) * Math.PI * 2;
                candidates.push([Math.round(Math.cos(ang) * r), Math.round(Math.sin(ang) * r)]);
            }
        }
        const S = this._genesisScheibe();
        for (const [x, z] of candidates) {
            const surf = this.getTerrainHeightAt(x, z);
            if (!Number.isFinite(surf)) continue;
            const macro = this._terrainMacroSurfaceY(x, z);
            if (Number.isFinite(macro) && surf < macro - 6) continue; // Kavernen-/Kraterboden
            if (!this._landAt(x, z, 1.5)) continue; // nass (jedes Wasser)
            const g = this._genesisGrund(x, z, S.r);
            if (!(g.max - g.min <= S.dick)) continue;
            return { x, z, y: surf };
        }
        const h0 = this.getTerrainHeightAt(0, 0);
        return { x: 0, z: 0, y: Number.isFinite(h0) ? h0 : 0 };
    }

    // Die Scheibe der Genesis-Plattform aus ihrem Bauplan (die erste Scheibe: cylinder, size.x = Durchmesser, size.y = Dicke) —
    // dieselbe Zeile, aus der `_grundrissVon` ihre Lichtung misst. Der Bauplan ist eingebaut; fehlt er, bricht es laut.
    _genesisScheibe() {
        const bp = this.state.blueprints && this.state.blueprints.start_plattform;
        const p0 = bp && Array.isArray(bp.parts) && bp.parts[0] && bp.parts[0].size;
        if (!p0 || !(p0.x > 0) || !(p0.y > 0)) throw new Error("start_plattform: der Bauplan trägt keine Scheibe");
        return { r: p0.x / 2, dick: p0.y };
    }

    // Der Grund unter einer Scheibe mit Radius r um (x, z): der tiefste und der höchste Punkt des EINEN Boden-Gesetzes
    // (`getTerrainHeightAt` → `_voxelSurfaceY`) in der Mitte und auf zwei Ringen (r/2, r; je 12 Proben). { min, max }.
    _genesisGrund(x, z, r) {
        let min = this.getTerrainHeightAt(x, z);
        let max = min;
        for (const f of [0.5, 1])
            for (let k = 0; k < 12; k++) {
                const a = (k / 12) * Math.PI * 2;
                const h = this.getTerrainHeightAt(x + Math.cos(a) * r * f, z + Math.sin(a) * r * f);
                if (!(h >= min)) min = h;
                if (!(h <= max)) max = h;
            }
        return { min, max };
    }

    // Genesis-Plattform, idempotent (nur wenn keine start_plattform existiert, z. B. nach Reload — die EINE Quelle
    // `_genesisPlattform` sagt es); der Spieler steht oben drauf. Der Punkt kommt aus `_findOpenSpawnSpot`.
    // DIE SOHLE LIEGT AUF DEM GRUND (K52): die Scheibe steht mit ihrer Sohle auf dem tiefsten Punkt des Bodens unter ihr
    // (`_genesisGrund`) — sie schwebt an keiner Stelle, die höhere Kante sinkt höchstens ihre Dicke ein (die Wahl des Orts).
    // Bis K52 stand sie 5 m über dem Grund („erhöhte Warte", V8.29): seit der Ring der Tore um sie auf dem Boden steht
    // (V18.486), schwebte eine graue Scheibe über den Toren (Genesis 0/0: Sohle 95,31 m über Grund 90,01–90,57 m).
    _ensureGenesisPlatform() {
        if (!this.state.architectures) return;
        if (this._genesisPlattform()) return;
        const spot = this._findOpenSpawnSpot();
        const S = this._genesisScheibe();
        const g = this._genesisGrund(spot.x, spot.z, S.r);
        const sohle = Number.isFinite(g.min) ? g.min : spot.y;
        // spawnArchitecture setzt den Bau 0.5 unter den gereichten Ort (at_player-Kalibrierung): sein Ursprung ist die Sohle.
        this.spawnArchitecture("start_plattform", { x: spot.x, y: sohle + 0.5, z: spot.z }, { silent: true });
        // die Lichtung (ihr Bauplan, `_grundrissVon`): was die Natur schon um die Scheibe geworfen hat, fällt wie im Haus —
        // geräumt an der Wurzel (`spawnArchitecture`)
        // Spieler oben auf die Plattform setzen: die Oberseite liegt bei Sohle + Dicke, +1,2 Puffer.
        const spawnY = sohle + S.dick + 1.2;
        if (this.state.playerMesh) {
            this.state.playerMesh.position.set(spot.x, spawnY, spot.z);
            // Feld-nativ: Velocity nullen + vertikalen Feld-Zustand zurück (kein Ammo-Body).
            if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
            this.state._fieldVy = 0;
        }
        this.log(
            `Genesis-Plattform erstellt bei (${spot.x}, ${spot.z}), Sohle y=${sohle.toFixed(1)}, Spieler auf y=${spawnY.toFixed(1)}`
        );
    }

    // ### Terrain-Erweiterung ###
    // Höhen-Quelle ist `_voxelSurfaceY` (oberste Fest/Luft-Grenze im Dichte-Feld `_voxelDensityAt`);
    // `getTerrainHeightAt` + `findSurfaceAbove` routen darüber.

    // ### Das Dichte-Feld + Surface Nets ###
    // Tunnel/Höhlen/Überhänge brauchen ein 3D-Dichte-Feld — ein Heightfield hebt/senkt nur Säulen.

    // Dichte-Feld: > 0 fest, < 0 Luft, 0 Oberfläche = 2D-Makro-Oberfläche (`surf − y`) + zwei 3D-Noise-
    // Bänder (Höhlen, Überhänge); die Makro-Oberfläche ist die EINE Quelle für Dichte UND Hydrosphäre.
    // ===== FERNE BINNENGEWAESSER: die seed-deterministischen KACHELN =====
    // Die Heimat-Region (state.hydrosphere, ±1024 m) bleibt unangetastet; jenseits liefert eine
    // lazy Kachel (2048 m, dieselbe Maschinerie) Seen·Flüsse = f(seed, Kachel) — für jeden Peer
    // gleich. Der Kachel-Schlüssel wohnt im Gelände-Gesetzbuch (gelaende-core.js
    // `kachelSchluessel`), Stamm und voxel-worker lesen ihn dort; Kacheln sind DERIVED (nie im
    // Snapshot), Welt-Regen leert sie.
    // Die EINE Region-Aufloesung fuer alle Hydro-Leser: das Gesetz des Kerns (gelaende-core `hydroRegion`).
    _hydroFor(x, z) {
        return globalThis.__gelaendeCore.hydroRegion(this._gelaende(), x, z);
    }

    // Stellt sicher, dass jede Kachel, die [x±r, z±r] schneidet, da ist oder im Faden entsteht (Heimat "0,0" immer): eine
    // fehlende wird bestellt (`_hydroBestellen`). Am Chunk-Build-Eingang gerufen (`_hydroSteht`) = die HARTE Garantie: kein
    // Chunk baut vor seiner Wasser/Erosions-Wahrheit (keine Kachel-Naht durch Build-Reihenfolge). → die Zahl der Kacheln, die
    // noch fehlen (0 = alle da). Bis zur Karte hydro-faden rechnete der Haupt-Faden jede neue Kachel hier synchron (235 ms
    // headless) und klonte danach den ganzen Zustand samt aller Kacheln in jeden Faden (0,82 MB je Faden und Kachel).
    _ensureHydroTilesAround(x, z, r) {
        const h = this.state.hydrosphere;
        if (!h || !h.ready) return 0; // vor dem Worldgen gibt es keine Wahrheit zu kacheln
        const size = AnazhRealm.HYDROSPHERE.regionSize;
        const half = size / 2;
        const r0x = Math.floor((x - r + half) / size);
        const r1x = Math.floor((x + r + half) / size);
        const r0z = Math.floor((z - r + half) / size);
        const r1z = Math.floor((z + r + half) / size);
        if (!this.state.hydroTiles) this.state.hydroTiles = new Map();
        let fehlt = 0;
        for (let rx = r0x; rx <= r1x; rx++) {
            for (let rz = r0z; rz <= r1z; rz++) {
                if (rx === 0 && rz === 0) continue;
                const key = `${rx},${rz}`;
                if (this.state.hydroTiles.has(key)) continue;
                fehlt++;
                this._hydroBestellen(key, { x: rx * size - half, z: rz * size - half });
            }
        }
        return fehlt;
    }

    // DIE WAHRHEIT VOR DEM BAU (Karte hydro-faden): die Heimat steht und jede Kachel um den Chunk (cx, cz) samt 64 m Polster
    // für die Leser über die Grenze ist da — sonst ist sie bestellt, und der Bau wartet (false).
    _hydroSteht(cx, cz) {
        const h = this.state.hydrosphere;
        if (!h || !h.ready) return false;
        const { span } = this._voxelChunkConfig(0);
        const half = span / 2;
        return !this._ensureHydroTilesAround(cx * span + half, cz * span + half, half + 64);
    }

    // Slope + Rock-Exposure als abgeleitete Welt-Felder direkt aus `_voxelSurfaceY` — am Genese-Leser
    // (Spawn/Streu/Boden/Material), NICHT in worldFieldAt (Hot-Path). Vier `_voxelSurfaceY`-Calls pro
    // Slope: OK für Punkt-Probes, nicht für Massen-Aufrufe.
    // h_dx, h_dz: Δ über 2 m → slope dimensionslos (m/m): ~0 flach, ~1 = 45°, ~2 Klippe.
    _slopeAt(x, z, surf, eps, aus) {
        // Die EINE Platzierungs-Slope-Quelle: |∇h| (m/m); Sampler + eps sind Parameter — Gras reicht die
        // gecachte surfMap, der Scatter-Bäcker getTerrainHeightAt ±2 m, Default _voxelSurfaceY. So lesen Gras
        // und Fels DIESELBE Steilheit. Die Fragment-Slope `aSlope`/`_steep` (Fels-FARBE) bleibt bewusst
        // getrennt (gerenderte Normale pro Pixel). `aus` (DARF) nimmt den Gradienten selbst (gx, gz: die Ebene des
        // Hangs, auf der ein Büschel der Nah-Wiese steht, `_nahWieseKachelDaten`).
        const s = surf || ((px, pz) => this._voxelSurfaceY(px, pz));
        const e = eps || 1;
        const yE = s(x + e, z);
        const yW = s(x - e, z);
        const yN = s(x, z - e);
        const yS = s(x, z + e);
        if (!Number.isFinite(yE) || !Number.isFinite(yW) || !Number.isFinite(yN) || !Number.isFinite(yS)) {
            if (aus) aus.gx = aus.gz = 0;
            return 0;
        }
        const dxh = (yE - yW) / (2 * e);
        const dzh = (yS - yN) / (2 * e);
        if (aus) [aus.gx, aus.gz] = [dxh, dzh];
        return Math.hypot(dxh, dzh);
    }

    // Rock-Exposure: slope-getrieben, `smoothstep(0.75, 1.45, slope)` — die Kliffs und Flanken des Flussnetzes tragen
    // den Fels (K16: der Massiv-Bias des Ein-Massiv-Ankers fiel mit ihm). Returnt [0, 1].
    _rockExposureAt(x, z) {
        const slope = this._slopeAt(x, z);
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        return ss(0.75, 1.45, slope);
    }

    // DIE EINE 2D-HÖHE der Welt: das Gelände-Gesetzbuch (gelaende-core.js `hoehe` — der Term-Auswerter des Erbguts,
    // der Wildnis-Term, der Makro-Anker) an der Lage dieser Welt. Liest jeder Leser der Höhe (Dichte, Hydrosphäre,
    // Fern-Ring, Spawn-Ort, Erosion); der voxel-worker ruft DASSELBE Gesetzbuch mit seinem Zustand (kein Spiegel).
    // `aus` (optional) trägt den Hang der Fläche (`hang`, tan) — der Spalten-Kontext liest ihn für die Höhlen-Mündung.
    _terrainMacroSurfaceY(x, z, includeDetail = true, aus) {
        return globalThis.__gelaendeCore.hoehe(this._gelaende(), x, z, includeDetail, aus);
    }

    // DIE GELÄNDE-LAGE: was das Gesetzbuch liest, unter den Namen des Worker-Zustands — eine LEBENDE Sicht auf
    // `state` (jeder Zugriff liest den Stand von jetzt; kein zweiter Speicher, nichts zu synchronisieren). Der Rausch-
    // Strom `_voxelNoise` entsteht beim ersten Lesen aus der Saat; `erbgut` ist die gemerkte Normalform (sie trägt die
    // Regler der Landform), `regionSize` die Kachel-Kante der Hydrosphäre.
    _gelaende() {
        if (this._gelaendeLage) return this._gelaendeLage;
        const realm = this;
        this._gelaendeLage = {
            get seed() {
                return (realm.state.worldMeta && realm.state.worldMeta.seed) || "anazh-realm-seed";
            },
            get noise() {
                if (!realm._voxelNoise)
                    realm._voxelNoise = globalThis.__gelaendeCore.lageRausch(this.seed, SimplexNoise);
                return realm._voxelNoise;
            },
            get baseHeight() {
                return realm.state.terrainBaseHeight;
            },
            get waterLevel() {
                return realm.state.waterLevel;
            },
            get erbgut() {
                return realm._erbgutCache || realm._erbgut();
            },
            get regionSize() {
                return AnazhRealm.HYDROSPHERE.regionSize;
            },
            get erdbau() {
                return realm._erdbauLage();
            },
            // die Hydrosphäre (Heimat, Kacheln, ihr Gesetz) — die Dichte und der Spiegel des Kerns lesen sie
            get hydrosphere() {
                return realm.state.hydrosphere;
            },
            get hydroTiles() {
                return realm.state.hydroTiles;
            },
            get hydroGesetz() {
                return AnazhRealm.HYDROSPHERE;
            },
            // der Stau der Werke (`_stauFelder`: beim Edit und je Takt, wenn sich ein Werk änderte) — der Spiegel des Kerns liest
            // ihn; während seiner eigenen Rechnung das Gesetz ohne Stau
            get stau() {
                return realm._stauRechnet ? null : realm.state.waterStau || null;
            },
            // der Pegel der Binnen-Gewässer (stoffe.K3-2, `_pegelGilt`: die Tafel des Tags) — der Spiegel des Kerns liest ihn
            get pegel() {
                return realm._pegelGilt();
            },
        };
        return this._gelaendeLage;
    }

    // DER ERDBAU DER ORTE (K10, Welt = Funktion + Abweichungen): `worldMeta.erdbau` trägt je Ort (Schlüssel) die Splats seines
    // Plans v2 (fachwerk `ortPlan`); die Gelände-Funktion liest sie als letzten Term (gelaende-core `erdbauY`) — Stamm und
    // voxel-worker dieselbe Liste in derselben Reihenfolge (die Reihenfolge, in der die Orte entstanden). Reist im Snapshot
    // (worldMeta) und zum Gast; jeder Peer, der denselben Akt ausführt, legt denselben Erdbau.
    _erdbauRoh() {
        const wm = this.state.worldMeta;
        const E = wm && wm.erdbau && typeof wm.erdbau === "object" ? wm.erdbau : null;
        const out = [];
        if (!E) return out;
        for (const k of Object.keys(E)) if (Array.isArray(E[k])) for (const p of E[k]) out.push(p);
        return out;
    }
    // Die Normalform des Erdbaus (gemerkt je Stand; null = kein Ort) — die Gelände-Lage liest sie je Höhe.
    _erdbauLage() {
        const wm = this.state.worldMeta;
        const roh = wm ? wm.erdbau : undefined;
        if (
            this._erdbauGemerkt === true &&
            this._erdbauGemerktRoh === roh &&
            this._erdbauGemerktStand === this._erdbauStand
        )
            return this._erdbauNorm;
        this._erdbauNorm = globalThis.__gelaendeCore.erdbauNormal(this._erdbauRoh());
        this._erdbauGemerkt = true;
        this._erdbauGemerktRoh = roh;
        this._erdbauGemerktStand = this._erdbauStand;
        return this._erdbauNorm;
    }
    // Ein Ort legt seinen Erdbau (einmal je Schlüssel): die Gelände-Funktion, ihre Caches, der Worker, die Chunks und Felder im
    // Umkreis folgen, und der Wald plant den Ort frei. Fail-closed: eine fremde Splat-Art wirft, bevor die Welt sie trägt.
    // DER ERDBAU FÄLLT AM ORT (K69, das Gesetz der Edits seit K23): der Term wirkt nur bis `ERDBAU.reichweiteM` um seine
    // Flächen (gelaende-core `erdbauY`) — so fallen nur die Gedächtnisse, die er ändern kann: Dichte, Basis-Dichte und Mesh
    // der Chunks im Umkreis, die Antworten des Workers im Flug nur dort (`_voxelStand`), der Wald seiner Zellen samt allem,
    // was sie liest (`_forestDartsFallen`). Bis K69 warf jeder Erdbau die Gedächtnisse der ganzen Welt: der Gang in ein Dorf
    // (der Dorf-Zug legt das nächste) plante danach 2 579 Wald-Zellen synchron neu, der längste Takt 880 ms (Null-Renderer,
    // Dorfweg gehend), an der Radeon ein Frame von 3,1 s (`_forestCellDarts › planForestCell`, die Hänger-Linse).
    // `nass`: das Urteil, das die Raten des Erwachens schon fällten (`_dorfErwachen`).
    _erdbauSetzen(key, splats, nass) {
        const wm = this.state.worldMeta || (this.state.worldMeta = {});
        if (!wm.erdbau || typeof wm.erdbau !== "object") wm.erdbau = {};
        if (wm.erdbau[key] || !Array.isArray(splats) || !splats.length) return false;
        const G = globalThis.__gelaendeCore;
        // gefragt VOR dem Eintrag: ändert dieser Erdbau den Grund an gezeichnetem Wasser? (`_erdbauAmWasser`)
        const amWasser = nass === undefined ? this._erdbauAmWasser(G.erdbauNormal(splats)) : nass;
        wm.erdbau[key] = splats;
        this._erdbauWirkt(splats, amWasser, { erdbauDazu: splats });
        this._ortFremdPruefen(key, splats); // ein gesetztes Haus im Ortsradius: die Gasse weicht ihm (bauen.K2 Staffel 2)
        return true;
    }
    // DER GRUND FÄLLT MIT DEM BAU (S4, Lehre 3): der Erdbau `grund` eines Hauses — der eigene Schlüssel des gesetzten Hauses
    // (`haus:`, `_hausGrundSetzen`) oder ein Splat im Erdbau seines Orts (`ortPlan`) — liegt mit der Mitte auf dem Eintrag;
    // `removeArchitecture` nimmt ihn mit, die Gedächtnisse am Ort fallen wie beim Legen (`_erdbauWirkt`). Die Platte des Orts
    // (seine Fläche) bleibt; der Ein-Slot-Ort des gesetzten Hauses (`haus:`: Platte, Grund, Vorplatz, bauen.K2) fällt ganz —
    // sonst trüge sein Schlüssel die Platte weiter, und ein Haus am selben Ort legte nie wieder einen Grund. Vorher überlebte der Grund den Bau: der gezeichnete Boden blieb geschnitten, der Keller hohl —
    // ein Loch in der Welt, wo das Haus stand.
    _erdbauGrundFaellt(entry) {
        const wm = this.state.worldMeta;
        const p = entry && entry.position;
        if (!p || !wm || !wm.erdbau || typeof wm.erdbau !== "object") return false;
        const sein = (q) => q && q.art === "grund" && Math.abs(q.cx - p.x) < 0.05 && Math.abs(q.cz - p.z) < 0.05;
        const weg = [];
        const ohne = []; // ihre Stellen in der Reihe des Erdbaus (`_erdbauRoh`) vor dem Fall
        const haus = []; // die Schlüssel gesetzter Häuser, die ganz fallen (die Gasse ihres Orts liegt wieder, wie sie lag)
        let i = 0;
        for (const k of Object.keys(wm.erdbau)) {
            const liste = wm.erdbau[k];
            if (!Array.isArray(liste)) continue;
            if (!liste.some(sein)) {
                i += liste.length;
                continue;
            }
            const ganz = k.startsWith("haus:");
            for (const q of liste) {
                if (ganz || sein(q)) {
                    weg.push(q);
                    ohne.push(i);
                }
                i++;
            }
            const rest = ganz ? [] : liste.filter((q) => !sein(q));
            if (rest.length) wm.erdbau[k] = rest;
            else delete wm.erdbau[k];
            if (ganz) haus.push([k, liste]);
        }
        if (!weg.length) return false;
        this._erdbauWirkt(weg, this._erdbauAmWasser(globalThis.__gelaendeCore.erdbauNormal(weg)), { erdbauOhne: ohne });
        for (const [k, liste] of haus) this._ortFremdPruefen(k, liste);
        return true;
    }
    // Was ein gelegter oder gefallener Erdbau (seine Splats) am Ort ändert, fällt dort: Stand, Caches und Wald im Umkreis,
    // der Worker, die Chunks, die Wege-Karte, das Wasser, die Bakes, der Save. DIE WIRKUNG IST DER KASTEN (S4, Lehre 25): je
    // Splat die Achsen-Box seiner gedrehten Fläche (Platte, Grund, frei) oder seiner Strecke (Trasse) samt der Reichweite des
    // Terms (`ERDBAU.reichweiteM`: weiter liest weder `erdbauY` noch `erdbauWand` ihn); ein Chunk fällt in der Stufe, deren Gitter
    // (Probe-Rand und Glätten: 3 Zellen über die Spanne) einen Kasten trifft, gezeichnet wird nur er neu. Bis S4 fiel der Kreis
    // um den Umkreis-Kreis samt einem Chunk Rand: der Grund des Vorschau-Hauses am Tor (4,1 × 4,9 m) warf beim Boot 16
    // gezeichnete Chunks um den Spieler, verändert hat er einen.
    // `delta`: die Änderung für die Fäden (die Splats eines neuen Orts, die Stellen gefallener), ohne sie der ganze Erdbau.
    _erdbauWirkt(splats, amWasser, delta) {
        const G = globalThis.__gelaendeCore;
        this._erdbauStand = (this._erdbauStand || 0) + 1;
        const R = G.ERDBAU.reichweiteM;
        const kaesten = splats.map((p) => {
            if (p.art === "trasse") {
                const w = p.w / 2;
                return [
                    Math.min(p.x0, p.x1) - w,
                    Math.max(p.x0, p.x1) + w,
                    Math.min(p.z0, p.z1) - w,
                    Math.max(p.z0, p.z1) + w,
                ];
            }
            const [c, s] = [Math.abs(Math.cos(p.phi || 0)), Math.abs(Math.sin(p.phi || 0))];
            const [hx, hz] = [p.ex * c + p.ez * s, p.ex * s + p.ez * c];
            return [p.cx - hx, p.cx + hx, p.cz - hz, p.cz + hz];
        });
        const x0 = Math.min(...kaesten.map((k) => k[0]));
        const x1 = Math.max(...kaesten.map((k) => k[1]));
        const z0 = Math.min(...kaesten.map((k) => k[2]));
        const z1 = Math.max(...kaesten.map((k) => k[3]));
        const { span } = this._voxelChunkConfig();
        const rand = [0, 1, 2, 3].map((lod) => 3 * this._voxelChunkConfig(lod).step);
        // die Kästen je Chunk, den sie in der gröbsten Stufe erreichen (Lehre 25: ein Chunk fragt nur seine — bis stadt-erwachen
        // fragte jeder Chunk des Umkreises jeden Kasten, der Erdbau nH 300 ~1 200 Chunks × 4 Stufen × ~2 000 Kästen)
        const mMax = R + Math.max(...rand);
        const jeChunk = new Map();
        for (const k of kaesten)
            for (let a = Math.floor((k[0] - mMax) / span); a <= Math.floor((k[1] + mMax) / span); a++)
                for (let b = Math.floor((k[2] - mMax) / span); b <= Math.floor((k[3] + mMax) / span); b++) {
                    const l = jeChunk.get(`${a},${b}`);
                    if (l) l.push(k);
                    else jeChunk.set(`${a},${b}`, [k]);
                }
        // trifft das Gitter des Chunks (a, b) in der Stufe lod die Wirkung eines Splats?
        const trifft = (a, b, lod) => {
            const m = R + rand[lod];
            const [u0, u1, v0, v1] = [a * span - m, (a + 1) * span + m, b * span - m, (b + 1) * span + m];
            return (jeChunk.get(`${a},${b}`) || []).some((k) => k[0] < u1 && k[1] > u0 && k[2] < v1 && k[3] > v0);
        };
        const ka = Math.floor((x0 - R - rand[3]) / span);
        const kb = Math.floor((x1 + R + rand[3]) / span);
        const la = Math.floor((z0 - R - rand[3]) / span);
        const lb = Math.floor((z1 + R + rand[3]) / span);
        const caches = [this.state.voxelBaseDensityCache, this.state.voxelDensityCache, this.state.voxelMeshCache];
        const genKarte = this._chunkGenKarte || (this._chunkGenKarte = new Map());
        this._editGenZaehler = (this._editGenZaehler || 0) + 1; // EIN steigender Zähler mit den Edits (nie wiederholt)
        const gezeichnet = this.state.voxelChunks;
        if (gezeichnet && gezeichnet.size && !this.state.dirtyVoxelChunks) this.state.dirtyVoxelChunks = new Set();
        if (!this.state.grassDirtyChunks) this.state.grassDirtyChunks = new Set();
        for (let a = ka; a <= kb; a++)
            for (let b = la; b <= lb; b++) {
                if (!trifft(a, b, 3)) continue;
                const key = `${a},${b}`;
                genKarte.set((a + 32768) * 65536 + (b + 32768), this._editGenZaehler);
                for (let lod = 0; lod <= 3; lod++)
                    if (trifft(a, b, lod)) for (const c of caches) if (c && c.size) c.delete(`${key},${lod}`);
                const ch = gezeichnet && gezeichnet.get(key);
                if (ch && trifft(a, b, Number.isFinite(ch.lod) ? ch.lod : 0)) this.state.dirtyVoxelChunks.add(key);
                if (trifft(a, b, 0)) this.state.grassDirtyChunks.add(key);
            }
        this._forestDartsFallen(x0, z0, x1, z1);
        // der Erdbau reist an JEDEN Faden am Zustand (Voxel- und Wald-Faden) über den EINEN Sender (`_voxelZustandPost`) — als
        // Änderung (`delta`, voxel-worker `applyStateDelta`), nie als Klon der Welt je Haus (Gebot 7; stadt-erwachen: im Zug
        // nH 300 klonte jeder gefallene Slot ~2 000 Splats an jeden Faden, 5–28 ms je Takt)
        this._voxelZustandPost({ type: "state-update", delta: delta || { erdbau: this._erdbauRoh() } });
        const cx = (x0 + x1) / 2;
        const cz = (z0 + z1) / 2;
        const rad = Math.hypot(x1 - x0, z1 - z0) / 2 + R;
        // der Grund eines Hauses ist Erde in der Wege-Karte (S4, `_wegeStufeMalen`): die Stufe, deren Fenster er trifft, malt
        // beim nächsten Takt neu — nur ein Grund mit einer Box, deren Boden der Grund ist, nie jede Platte und Trasse
        if (this.state.wegeKarte && splats.some((p) => p.art === "grund" && p.boxen.some((b) => !b[4])))
            for (const st of this.state.wegeKarte.stufen) {
                const h = st.S.fensterM / 2 + R;
                if (x1 > st.mitteX - h && x0 < st.mitteX + h && z1 > st.mitteZ - h && z0 < st.mitteZ + h)
                    st.grundNeu = true;
            }
        if (amWasser) this._invalidateWaterCapsAround(cx, cz, rad);
        if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
    }
    // DAS WASSER DES ERDBAUS (K10): ändert der Erdbau E (die Normalform seiner Splats) den Grund an gezeichnetem Wasser? Die
    // Regel des Zell-Stempels — ein Bau weckt den Automaten nur, wenn er eine Wasser-Zelle berührt (gate:werk-im-wasser R:
    // das Dorf am Seerand weckte ihn, ohne Wasser zu verdrängen). Je Zelle seiner Reichweite (gelaende-core `zellen`) ein
    // 2-m-Raster: an jeder nassen Spalte (`_nassAt`) rückt E den Grund in eine andere Sim-Zelle (DIESELBEN Zellen, die der
    // Automat liest — ein Grund, der in seiner Zelle bleibt, ändert kein Wasser), oder eine Sim-Zelle daneben schneidet E ihn
    // eine Zelle tiefer unter den Spiegel (ein Schnitt öffnet dem Wasser einen Weg; eine Schüttung daneben verdrängt keins).
    // `ab`, `n`: nur die Zellen ab der `ab`-ten, höchstens `n` (die Raten des Erwachens, `_dorfErwachen`).
    _erdbauAmWasser(E, ab = 0, n = Infinity) {
        if (!E) return false;
        const G = globalThis.__gelaendeCore;
        const Z = G.ERDBAU.zelleM;
        const cfg = this._voxelChunkConfig(0);
        const d = cfg.step;
        const oy = (this.state.terrainBaseHeight || 0) - cfg.floorDrop;
        const zelle = (h) => Math.floor((h - oy) / d);
        let spiegel = -Infinity;
        const aendert = (x, z, nurSchnitt) => {
            const h0 = this._terrainMacroSurfaceY(x, z, true);
            const h1 = G.erdbauY(E, x, z, h0);
            return nurSchnitt ? zelle(h1) < zelle(h0) && h1 < spiegel : zelle(h1) !== zelle(h0);
        };
        let i = 0;
        for (const key of E.zellen.keys()) {
            if (i++ < ab) continue;
            if (i > ab + n) break;
            const a = Math.floor(key / 65536) - 32768;
            const b = (key % 65536) - 32768;
            for (let i = 1; i < Z; i += 2)
                for (let j = 1; j < Z; j += 2) {
                    const x = a * Z + i;
                    const z = b * Z + j;
                    if (!this._nassAt(x, z)) continue;
                    if (aendert(x, z, false)) return true;
                    spiegel = this._atlasWaterLevelAt(x, z, -1e9);
                    if (
                        aendert(x + d, z, true) ||
                        aendert(x - d, z, true) ||
                        aendert(x, z + d, true) ||
                        aendert(x, z - d, true)
                    )
                        return true;
                }
        }
        return false;
    }
    // DIE ORT-WAHL (K10 · siedlung.K5): der Plan v2 des Exports `plan` am nächsten Ort der Ringe um den Wunsch `origin`, der
    // jedes Haus trägt. Die Kandidaten rechnet der Ort-Faden (`_nebenAuftrag("ort")`, voxel-worker `ortWahl`: fachwerk
    // `ortPlan` und das Wasser-Urteil `ortTraegt` am Zustand des Gesetzes); der Wirt urteilt am Sieger des groben Rasters, was nur
    // er kennt (`_ortTraegtWirt`: die Bauten, der Spieler jetzt), erst dann zahlt der Faden das Raster der Wand (`wand`); fällt
    // der Ort an einem davon, rechnet der Faden ab dem nächsten weiter. Bis K5 rechnete der
    // Haupt-Thread jeden Kandidaten in 3-ms-Scheiben (Teleport ins Erwachen nH 300: 70 761 Haus-Pläne, 18,7 s bis zum ersten
    // Haus; nH 12: 300, 1,4 s). Je Ort EIN Plan v2 (der zweite Akt am selben Anker liest sonst den Erdbau des ersten als
    // Gelände); zwei Rufer desselben Orts teilen EINE Wahl. `legen` false (der Vorlauf, `_dorfBereiten`): ihr Erdbau liegt erst,
    // wenn der Ort Welt wird (`_ortPlanSetzen`). `frei`: der Ort, den kein Haus berühren darf — ohne Angabe der Spieler (der
    // Akt vor ihm), null keiner (die Zelle der Welt: ihr Ort ist eine Funktion von Saat und Gesetz, Lehre 7). `fest`: der Ort
    // steht schon (er kehrt aus seinem Gedächtnis wieder, speicher.K3) — der Plan v2 an genau ihm, keine Wahl. Rückgabe: Promise
    // des Plans v2, `origin` rückt an seinen Ort.
    async _ortWahl(plan, origin, legen = true, frei, fest) {
        if (plan && plan.version === 2) return plan;
        const key = AnazhRealm._ortSchluessel(plan, origin);
        const ple = this._ortPlaene || (this._ortPlaene = new Map());
        if (!ple.has(key)) {
            const flug = this._ortWahlFlug || (this._ortWahlFlug = new Map());
            let wahl = flug.get(key);
            if (!wahl) {
                wahl = this._ortWahlImFaden(plan, { x: origin.x, z: origin.z }, frei, fest).then(
                    (v2) => (ple.set(key, v2), flug.delete(key), this._ortFremdPruefen(key), v2),
                    (e) => (flug.delete(key), Promise.reject(e))
                );
                flug.set(key, wahl);
            }
            await wahl;
        }
        return this._ortPlanSetzen(plan, origin, legen);
    }
    static _ortSchluessel(plan, origin) {
        return "ort:" + (plan.seed >>> 0) + ":" + Math.round(origin.x) + "," + Math.round(origin.z);
    }
    // Der Faden rechnet mit den Fremd-Slots um den Ort (`_ortFest`: die gesetzten Häuser, um die der Plan seine Wege legt, bauen.K2
    // Staffel 2); `ohne` [von, bis): die Stellen des Erdbaus, die die Höhe nicht trägt (der eigene des Orts, `_ortNeuPlanen`).
    async _ortWahlImFaden(plan, origin, frei, fest, ohne) {
        const W = fest ? Object.assign({}, AnazhRealm.ORT_WAHL, { ringe: 0 }) : AnazhRealm.ORT_WAHL;
        const mass = (this._ortWahlMass = { kandidaten: 0, scheiben: 0, ms: 0, maxMs: 0, abstandM: null });
        let reich = 0; // so weit reicht der Plan um seinen Ursprung (das Wasser jedes Kandidaten muss gekachelt sein)
        for (const s of plan.slots) reich = Math.max(reich, Math.hypot(s.x || 0, s.z || 0) + 16);
        // das Wasser der ganzen Suche ist gekachelt, bevor der Faden urteilt: jede fehlende Kachel rechnet der Faden
        // (`_hydroBestellen`), die Wahl wartet auf ihre Ankunft — ein Ort-Faden, der nach der Bestellung geboren wurde, trägt
        // sie erst mit ihr (`_hydroAn`)
        const suche = reich + W.ringe * W.schrittM;
        if (this._ensureHydroTilesAround(origin.x, origin.z, suche)) {
            await Promise.all([...this._hydroBestellt.values()].map((e) => e.zusage));
            if (this._ensureHydroTilesAround(origin.x, origin.z, suche))
                throw new Error(
                    `ORT: das Wasser um ${Math.round(origin.x)}/${Math.round(origin.z)} kam nicht aus dem Faden`
                );
        }
        for (let ab = 0, wand = -1; ;) {
            const pm = frei === undefined ? this.state.playerMesh && this.state.playerMesh.position : frei;
            const raster = this._ortRaster(plan);
            const r = await this._nebenAuftrag(
                "ort",
                {
                    type: "ort-wahl",
                    plan,
                    origin,
                    ab,
                    wand,
                    W,
                    M: AnazhRealm.WERK_LAND_M,
                    spieler: pm ? { x: pm.x, z: pm.z, frei: AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN } : null,
                    raster,
                    fest: this._ortFest(origin, suche),
                    ohne,
                },
                [raster.lx.buffer, raster.lz.buffer]
            );
            mass.kandidaten += r.kandidaten;
            mass.scheiben++;
            mass.ms += r.ms;
            if (fest) return r.v2;
            if (r.index < 0) {
                this.log(
                    `ORT: der Plan „${plan.name || "?"}" findet binnen ${W.ringe * W.schrittM} m um ` +
                        `${Math.round(origin.x)}/${Math.round(origin.z)} keinen Ort, der jedes Haus trocken trägt — die Wand ` +
                        "wirft die nassen Häuser",
                    "WARN"
                );
                return r.v2;
            }
            if (r.wand) {
                mass.abstandM = r.abstandM;
                return r.v2;
            }
            const t0 = performance.now();
            const traegt = this._ortTraegtWirt(r.v2, pm);
            mass.maxMs = Math.max(mass.maxMs, performance.now() - t0);
            ab = traegt ? r.index : r.index + 1;
            wand = traegt ? r.index : -1;
        }
    }
    // DAS RASTER DER ORT-WAHL je Slot des Exports (plan-lokal, haus-lokal vor seiner Gier): das Fundament-Raster des Wirts
    // (`_fundamentRaster`: Grundriss samt Saum `ORT_GESETZ.saumM` und Vorplatz) im Schritt `ORT_WAHL.grobM` und in dem der
    // Wand (0,5 m, `_fundamentLand`), `radius` die Reichweite des Grundrisses (NaN ohne) — der Ort-Faden legt es je Kandidat an.
    _ortRaster(plan) {
        const grobM = AnazhRealm.ORT_WAHL.grobM;
        const lx = [];
        const lz = [];
        const grobN = [];
        const wandN = [];
        const radius = [];
        for (const sl of plan.slots) {
            const fp = this._grundrissVon(sl);
            let nG = 0;
            let nW = 0;
            if (fp) {
                const s = fp.saum || 0;
                const raster = { ex: fp.ex + s, ez: fp.ez + s, ox: fp.ox, oz: fp.oz };
                const grob = AnazhRealm._fundamentRaster(raster, sl.tuer, grobM);
                const wand = AnazhRealm._fundamentRaster(raster, sl.tuer, 0.5);
                for (const p of grob.concat(wand)) {
                    lx.push(p[0]);
                    lz.push(p[1]);
                }
                nG = grob.length;
                nW = wand.length;
            }
            grobN.push(nG);
            wandN.push(nW);
            radius.push(fp ? Math.hypot(fp.ex, fp.ez) : NaN);
        }
        return { lx: Float64Array.from(lx), lz: Float64Array.from(lz), grobN, wandN, radius };
    }
    // DAS URTEIL DES WIRTS am Sieger des Ort-Fadens: kein Haus berührt den Ort `p` (der Spieler JETZT beim Akt, Reichweite +
    // `STRUCTURE_PLAYER_CLEAR_MARGIN`, das Dorf vor dir, `_siedlungsAnker`; null: die Zelle der Welt) und keins steht in einem
    // Bau (`_bauFrei`, die zweite Wand der Slot-Quelle: der Genesis-Platz, ein früheres Dorf).
    _ortTraegtWirt(k, p) {
        const frei = AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN;
        for (const sl of k.slots) {
            const fp = this._grundrissVon(sl);
            if (!fp) continue;
            const wx = k.ort.x + sl.x;
            const wz = k.ort.z + sl.z;
            if (p && Math.hypot(p.x - wx, p.z - wz) < Math.hypot(fp.ex, fp.ez) + frei) return false;
            if (!this._bauFrei(wx, wz, sl.phi || 0, fp, sl.tuer, sl.y)) return false;
        }
        return true;
    }
    // DIE ALTEN ORTE ZIEHEN UM (K10 × Entscheid §5.4: „alte Welten ziehen um, ihre Bauten werden auf das neue Gelände
    // geerdet"): ein Haus eines Orts (`fundament`), das kein Erdbau trägt — ein Save vor dem Plan v2 stellte es auf die höchste
    // Ecke seines Grunds über ein Podest, das mit dem Erdbau fiel —, erhält die Platte seines Grundrisses samt Saum (fachwerk
    // `ORT_GESETZ.saumM`) auf seinem Boden (`yVon(haus)` − 0,5): der Grund steigt zum Haus, das Haus bleibt, wo es stand.
    // `liste` sind die Bauten (gespeichert oder lebend), `yVon` ihre Höhe. Der Boden-Umzug ruft es, BEVOR er die Höhen aller
    // Bauten rechnet (`_bodenUmzug`: Baum, Brunnen und Bau neben einem Haus stehen dann auf dem geerdeten Grund), das Laden
    // danach für die Häuser eines Saves desselben Bodens. Gibt die Zahl der geerdeten Häuser.
    _erdbauAltOrte(liste, yVon) {
        const platten = [];
        for (const e of liste) {
            // ein Haus eines Orts trägt sein Fundament samt Saum (`_grundrissVon`: `saum`)
            const f = e && e.position ? this._grundrissVon(e) : null;
            if (!f || !f.saum) continue;
            const y = yVon(e);
            if (!Number.isFinite(y)) continue;
            const ry = Number.isFinite(e.rotationY) ? e.rotationY : 0;
            const c = Math.cos(ry);
            const s = Math.sin(ry);
            const cx = e.position.x + f.ox * c + f.oz * s;
            const cz = e.position.z - f.ox * s + f.oz * c;
            if (!this._ortFrei(cx, cz, 0.01)) continue; // ein Erdbau trägt das Haus schon
            platten.push({ art: "platte", cx, cz, phi: ry, ex: f.ex + f.saum, ez: f.ez + f.saum, y: y - 0.5 });
        }
        if (!platten.length) return 0;
        const p0 = platten[0];
        this._erdbauSetzen(`alt:${platten.length}:${Math.round(p0.cx)},${Math.round(p0.cz)}`, platten);
        return platten.length;
    }
    // Trägt der Grund an (x, z) eine Krone vom Radius T, ohne einen Ort zu berühren? (der Erdbau ist der reservierte Grund:
    // Grundrisse, Vorplätze, Platz, Gassen). Leser: der Wald-Plan (phyto `planForestCell`, ctx.ortFrei).
    _ortFrei(x, z, T) {
        const E = this._erdbauLage();
        if (!E) return true;
        const Z = globalThis.__gelaendeCore.ERDBAU.zelleM;
        const liste = E.zellen.get((Math.floor(x / Z) + 32768) * 65536 + (Math.floor(z / Z) + 32768));
        if (!liste) return true;
        for (const i of liste) {
            const p = E.splats[i];
            if (p.frei) continue; // unter einer Brücke ist der Grund frei
            let d;
            if (p.platte) {
                const dx = x - p.cx;
                const dz = z - p.cz;
                const u = Math.max(0, Math.abs(dx * p.c - dz * p.s) - p.ex);
                const v = Math.max(0, Math.abs(dx * p.s + dz * p.c) - p.ez);
                d = Math.hypot(u, v);
            } else {
                let q = p.len2 > 0 ? ((x - p.x0) * p.dx + (z - p.z0) * p.dz) / p.len2 : 0;
                q = q < 0 ? 0 : q > 1 ? 1 : q;
                d = Math.max(0, Math.hypot(x - (p.x0 + p.dx * q), z - (p.z0 + p.dz * q)) - p.hw);
            }
            if (d < T) return false;
        }
        return true;
    }

    // DAS ERBGUT der Welt (`worldMeta.erbgut`), validiert und gemerkt: { terme, wildnis, hash }. Fehlt es, ist die Welt
    // [wildnis] (jeder heutige Save). Die Empfänger-Wand ist fail-closed und
    // ohne stillen Ersatz: eine unbekannte Term-Art, eine fehlende Zahl oder eine Form außerhalb der Regeln WIRFT — die
    // Welt erwacht nicht und sagt es auf dem Ladeschirm (init), nie still Wildnis. `wildnis` ist das Gewicht des
    // Wildnis-Terms (1 = die Welt trägt ihn, 0 = nicht); `_wildnisTraegt` und die Spalte lesen es.
    _erbgut() {
        const wm = this.state.worldMeta;
        const roh = wm ? wm.erbgut : undefined;
        if (this._erbgutCache && this._erbgutRoh === roh) return this._erbgutCache;
        const terme = globalThis.__gelaendeCore.erbgutNormal(roh);
        this._erbgutRoh = roh;
        this._erbgutCache = {
            terme,
            wildnis: terme[0].art === "wildnis" ? 1 : 0,
            hash: this._fastHash(JSON.stringify(terme)),
        };
        return this._erbgutCache;
    }

    // DER SPALTEN-KONTEXT (x, z) der Dichte: das Gesetz des Kerns (gelaende-core `dichteSpalte`: die Höhe, das Wildnis-Gewicht,
    // die Decke der Höhle, Kanal und See-Becken — EINMAL je Spalte, `dichteBasis` liest sie über das y-Band), dazu DER KELLER
    // DER SPALTE (S4): die Lage des Erdbaus, wenn (x, z) über einem Keller liegt (`erdbauKeller`), sonst null — das Feld
    // (`_fieldDensityAt`) liest ihn je Probe als einen Blick, das Gitter nie. Die Basis-Dichte OHNE Edits ist worldgen-frozen →
    // je Chunk+LOD cachebar (`state.voxelBaseDensityCache`), Edits legen nur ihre Form drauf.
    _terrainColumnContext(x, z) {
        return this._terrainColumnContextIn(x, z, {});
    }
    // Füll-Variante: der Aufrufer stellt den Behälter (der ctx-lose Heiß-Pfad `_terrainBaseDensityAt` seinen Scratch).
    _terrainColumnContextIn(x, z, out) {
        globalThis.__gelaendeCore.dichteSpalte(this._gelaende(), x, z, out);
        out.keller = this._kellerLage(x, z);
        return out;
    }

    // Die EINE-Punkt-API ohne Edits (Gradient-, Raycast-, Kreatur-Proben): die Spalte im privaten SCRATCH (der Konsum in
    // `dichteBasis` ist rein synchron, kein Aufrufer hält diesen ctx), die Dichte des Kerns (`dichteBasis`).
    _terrainBaseDensityAt(x, y, z) {
        const s = this._fieldCtxScratch || (this._fieldCtxScratch = {});
        return globalThis.__gelaendeCore.dichteBasis(x, y, z, this._terrainColumnContextIn(x, z, s));
    }

    // Volle Terrain-Dichte = Basis mit den Edits für Punkt-Samples (Wasser-Iso-OOB, `_voxelSurfaceY`, direkte Aufrufer); der
    // Chunk-Grid-Pfad nutzt `_voxelEditedDensityGrid` (base-gecacht, dieselbe Form je Ecke).
    _terrainDensityAt(x, y, z) {
        // Die Edits liest `_mitEdits`, damit der feld-native Kollisions-Pfad (`_fieldDensityAt`) DIESELBE Edit-Wahrheit
        // liest; die Form ist das Gesetz des Kerns (gelaende-core `mitEdits`, `editsImGitter` — Punkt, Gitter und Worker
        // rufen es; gate:worker-dichte Teil H: Main = Worker = Gesetz, LOD 0–3, mit Edits über dem Band).
        // DER KELLER IST HOHL (S4, gelaende-core `erdbauHohl`): das Feld trägt den Raum des Hauses, das Gitter des Netzes nicht
        const d = this._mitEdits(this._terrainBaseDensityAt(x, y, z), x, y, z);
        const K = this._kellerLage(x, z);
        return K ? globalThis.__gelaendeCore.erdbauHohl(K, x, y, z, d) : d;
    }
    // Die Lage des Erdbaus, wenn (x, z) über einem Keller liegt (gelaende-core `erdbauKeller`), sonst null.
    _kellerLage(x, z) {
        const E = this._erdbauLage();
        return E && E.hohl && globalThis.__gelaendeCore.erdbauKeller(E, x, z) ? E : null;
    }

    // DIE EDIT-KARTE (K23): die Edits der Welt je Chunk — das Gesetz des Kerns (gelaende-core `editKarte`) über der EINEN Liste
    // `worldMeta.voxelEdits` (persistiert, in Setz-Reihenfolge, ohne Deckel — kein Edit fällt still). Je Chunk eine Generation
    // aus EINEM steigenden Zähler (`_editGenZaehler`, nie wiederholt; der Erdbau zieht denselben) — der Stale-Filter der
    // Worker-Antworten (`_voxelStand`). Jede Dichte-Probe fragt die Karte: steht sie (gelaende-core `editKarteSteht`),
    // kostet die Frage zwei Vergleiche, erst ein neuer Edit zieht Maß und Generation (ek-schleife, Lehre 25 — bis dahin
    // baute jede Probe `_voxelChunkConfig`: im Fall-Wächter 60 Mio. Mal, der Edit-Weg 48 % der Feld-Dichte).
    _voxelEditKarte() {
        const meta = this.state.worldMeta;
        const edits = meta && Array.isArray(meta.voxelEdits) ? meta.voxelEdits : null;
        const G = globalThis.__gelaendeCore;
        if (G.editKarteSteht(this._editKarte, edits)) return this._editKarte;
        const gen = this._editGen || (this._editGen = () => (this._editGenZaehler = (this._editGenZaehler || 0) + 1));
        const span = this._voxelChunkConfig().span;
        return (this._editKarte = G.editKarte(this._editKarte, edits, span, gen));
    }

    // Die Edits, die den Chunk (cx, cz) samt einem Chunk Rand berühren können — in Setz-Reihenfolge, leer ohne.
    _voxelEditsNah(cx, cz) {
        return globalThis.__gelaendeCore.editsNah(this._voxelEditKarte(), cx, cz);
    }

    // Die Edits, die den waagrechten Kasten [x0, x1] × [z0, z1] berühren können (gelaende-core `editsImKasten`).
    _voxelEditsImKasten(x0, x1, z0, z1) {
        return globalThis.__gelaendeCore.editsImKasten(this._voxelEditKarte(), x0, x1, z0, z1);
    }

    // Der Stand eines Chunks für den Stale-Filter der Worker- und Platten-Antworten: der Welt-Sync
    // (`voxelWorkerStateGen`) und die jüngste Generation eines Edits, eines Erdbaus (`_erdbauSetzen`, K69) oder eines Staus
    // (`_stauAn`; beide in `_chunkGenKarte`) im 3×3 um ihn. Ein Edit, ein Ort und ein Stausee verwerfen nur die Antworten ihrer
    // Nachbarschaft, nie die der ganzen Welt.
    _voxelStand(cx, cz) {
        const gen = this._voxelEditKarte().gen;
        const erd = this._chunkGenKarte;
        let g = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const k = (cx + dx + 32768) * 65536 + (cz + dz + 32768);
                const v = gen.get(k);
                if (v > g) g = v;
                const w = erd ? erd.get(k) : undefined;
                if (w > g) g = w;
            }
        }
        return `${this.state.voxelWorkerStateGen}|${g}`;
    }

    // Die Dichte über der Basis `basis` an (x, y, z) mit den Edits (EINE Quelle): sie leben in worldMeta.voxelEdits
    // (persistiert) und gelten ZULETZT — der Spieler-Wille überschreibt Terrain UND Hydrosphäre-Sculpting. Gefragt werden nur
    // die Edits, deren Reichweite den Chunk der Probe berührt (der Kern der Karte); die Form ist das Gesetz des Kerns
    // (gelaende-core `mitEdits`: die Säule `editForm`, Graben und Aufschütten, mode-lose Alt-Edits graben).
    // Ohne Edit die Basis; die stehende Karte fragt die Probe direkt (`editKarteSteht`), ihr letzter Chunk bleibt
    // gemerkt (`editsAm`) — ABAB je Spalten-Probe mit 147 Edits 238 → 134 ns, ohne Edit 89 → 90 ns (ek-schleife).
    _mitEdits(basis, x, y, z) {
        const meta = this.state.worldMeta;
        const edits = meta && meta.voxelEdits;
        if (!edits || !edits.length) return basis;
        const G = globalThis.__gelaendeCore;
        const k = G.editKarteSteht(this._editKarte, edits) ? this._editKarte : this._voxelEditKarte();
        return G.mitEdits(basis, x, y, z, G.editsAm(k, x, z));
    }

    // Base-gecachter Density-Grid-Pfad: das Gitter des Kerns (gelaende-core `dichteGitter`, Band und Basis-Dichte), je Chunk+LOD
    // gecacht; der Edit-Rebuild legt nur die Form der Edits auf eine Kopie (`gitterMitEdits`, ~2 ms statt ~126 ms) — die Edits
    // des Gitter-Kastens (`_voxelEditsImKasten`; der Worker fragt denselben Kasten). Ohne Edits: read-only-Reuse.
    _voxelEditedDensityGrid(cacheKey, gox, goy, goz, dimX, dimY, dimZ, step) {
        const G = globalThis.__gelaendeCore;
        const L = this._gelaende();
        const [Nx, Ny, Nz] = [dimX + 1, dimY + 1, dimZ + 1];
        if (!this.state.voxelBaseDensityCache) this.state.voxelBaseDensityCache = new Map();
        let baseGrid = this.state.voxelBaseDensityCache.get(cacheKey);
        if (!baseGrid || baseGrid.length !== Nx * Ny * Nz) {
            baseGrid = G.dichteGitter(L, gox, goy, goz, Nx, Ny, Nz, step);
            this.state.voxelBaseDensityCache.set(cacheKey, baseGrid);
        }
        const edits = this._voxelEditsImKasten(gox, gox + dimX * step, goz, goz + dimZ * step);
        return G.gitterMitEdits(L, baseGrid, gox, goy, goz, Nx, Ny, Nz, step, edits);
    }

    // DER FLUSS-KANAL an xz → `{ P, L, k }` oder null (gelaende-core `flussKanal`): die Dichte nimmt das weiche Maximum aus
    // Gelände und Damm und davon das weiche Minimum mit dem Kanal — so schneidet der Kanal Buckel und überbrückt Senken, und
    // die Krone hält das Wasser. See-Becken: `_hydrosphereLakeAt`.
    _hydrosphereCarveAt(x, z) {
        return globalThis.__gelaendeCore.flussKanal(this._gelaende(), x, z);
    }

    // Der nächste Fluss-Rand an (x,z) → { dist, halfW, spiegel } (gelaende-core `flussRand`, die 3×3-Buckets: die
    // Feuchte reicht weiter als die Bank).
    _hydroDistAt(x, z) {
        return globalThis.__gelaendeCore.flussRand(this._gelaende(), x, z);
    }

    // Γ1 (genese-plan) — die GENESE-Version der Welt: fehlend = 1 (Legacy —
    // bestehende Welten behalten ihr Gesicht; das Drainage-Netz-Gesetz
    // konsequent: Genese ist Welt-Identität). Neue Welten werden mit 2 geboren.
    _genVersion() {
        return (this.state.worldMeta && this.state.worldMeta.genVersion) || 1;
    }

    // Das Feuchte-Feld, abgeleitet aus der HYDROSPHÄRE (Terrain → Wasser → Feuchte → Leben), nicht aus
    // Noise. Lebt am Genese-Leser (Spawn/Scatter/Boden), NICHT in worldFieldAt (Bucket-Walk nicht in den
    // Hot-Path; der Höhen-Term braucht surfY). max() aus (a) Fluss-Nähe (smoothstep über die Segment-
    // Distanz) und (b) Höhe über dem Wasserspiegel (feuchte Niederungen). Die Fläche der Ferne (`fussM`, das Mittel der
    // Fluss-Bänder über den Abdruck) rechnet der Fern-Faden (`feuchteAt` im voxel-worker, B2).
    _feuchteAt(x, z, surfY) {
        if (this._genVersion() < 2) return 0;
        const F = AnazhRealm.FEUCHTE;
        let fluss = 0;
        const r = this._hydroDistAt(x, z);
        if (Number.isFinite(r.dist)) {
            const inner = Math.max(1, r.halfW);
            const outer = inner + F.flussReichweite;
            const t = Math.max(0, Math.min(1, (outer - r.dist) / (outer - inner)));
            fluss = t * t * (3 - 2 * t);
        }
        let hoehe = 0;
        const sy = Number.isFinite(surfY) ? surfY : this._voxelSurfaceY ? this._voxelSurfaceY(x, z) : null;
        if (Number.isFinite(sy)) {
            // die Ufer-Bänder über beiden Bezügen (`_waterLevelAt`): See/Meer voll, der Fluss mit seiner Kronen-Blende
            const uf = { see: 0, fluss: null, ufer: 0 };
            this._waterLevelAt(x, z, uf);
            const band = (above) => {
                const t = Math.max(0, Math.min(1, (F.hoeheFern - above) / (F.hoeheFern - F.hoeheNah)));
                return t * t * (3 - 2 * t) * F.hoeheGewicht;
            };
            hoehe = band(sy - uf.see);
            if (uf.fluss !== null) hoehe = Math.max(hoehe, uf.ufer * band(sy - uf.fluss));
        }
        return Math.max(0, Math.min(1, Math.max(fluss, hoehe)));
    }

    // Pfad-Feld: Fluss-Bänke sind getrampelte Erde — knapp außerhalb der Wasserkante (dist ∈ [halfW,
    // halfW+bankW]) auf niedriger Bank (0..5 m über dem Spiegel) → Pfad ∈ [0,1]. Render-only (Boden-
    // Farbe, Gras unterdrückt); liest den worker-gespiegelten _hydroDistAt → P2P bit-identisch. Die Bank der Ferne (das
    // Mittel über die Fläche, `fussM`) rechnet der Fern-Faden (`pathFieldAt` im voxel-worker, B2).
    _pathFieldAt(x, z, surfY) {
        if (this._genVersion() < 2) return 0;
        const bankW = 4.5;
        const niedrig = (above) => (above < 0 || above > 5 ? 0 : 1);
        const r = this._hydroDistAt(x, z);
        if (!Number.isFinite(r.dist)) return 0;
        const inner = Math.max(1, r.halfW);
        const d = r.dist - inner;
        if (d < 0 || d > bankW) return 0;
        const band = 1 - d / bankW;
        if (!Number.isFinite(surfY)) return band * band;
        // niedrige Bank (0..5 m) über einem der beiden Bezüge (`_waterLevelAt`): See/Meer voll, der Fluss mit seiner
        // Kronen-Blende
        const uf = { see: 0, fluss: null, ufer: 0 };
        this._waterLevelAt(x, z, uf);
        let w = niedrig(surfY - uf.see);
        if (uf.fluss !== null) w = Math.max(w, uf.ufer * niedrig(surfY - uf.fluss));
        return band * band * w;
    }

    // See-Becken an xz → `{bedY, w}` oder null (gelaende-core `seeBecken`): `bedY` die flache, dichte Bett-Höhe, `w` die
    // Becken-Zugehörigkeit — die Dichte blendet mit `w` zur Bett-Ebene (lückenloser Boden, keine Rauheit im Becken).
    _hydrosphereLakeAt(x, z) {
        return globalThis.__gelaendeCore.seeBecken(this._gelaende(), x, z);
    }

    // Surface Nets: (1) je Zelle mit Oberflächen-Schnitt EIN Vertex (Mittel der Kanten-Kreuzungen);
    // (2) je Gitter-Kante mit Vorzeichenwechsel ein Quad aus 4 Zell-Vertices → BufferGeometry oder null.
    // dimX/dimY/dimZ = Zell-Zahlen; der Chunk ist bewusst nicht würfelförmig (`span` breit, aber hoch
    // genug fürs ganze Oberflächen-Band — sonst ein Loch, wo die Oberfläche aus dem Kasten tritt).
    _voxelChunkGeometry(
        ox,
        oy,
        oz,
        dimX,
        dimY,
        dimZ,
        step,
        densityFn,
        cropMargin = 0,
        preDensity = null,
        smoothIters = 1,
        hoehle = null
    ) {
        const sample = densityFn || ((x, y, z) => this._terrainDensityAt(x, y, z));
        // `preDensity`: hat der Aufrufer das Grid schon (Cell-Klassifikation), läuft die teure Sample-
        // Schleife (~90k `_terrainDensityAt`-Calls) nur einmal pro Chunk-Build.
        // ein eigener Sampler (`densityFn`, die Schwebe-Insel) ist nicht der Boden: er trägt dessen Band nicht
        const density =
            preDensity || this._voxelSampleDensityGrid(ox, oy, oz, dimX, dimY, dimZ, step, sample, !densityFn);
        const { positions, vertCells, cellVert, sharp } = this._voxelExtractSurfaceVertices(
            density,
            ox,
            oy,
            oz,
            dimX,
            dimY,
            dimZ,
            step
        );
        if (positions.length === 0) return null;
        // `hoehle` (der Höhlen-Graph des Boden-Chunks, `_voxelHoehlenGraph`): je Dreieck die Zelle seiner Luft
        const triZelle = hoehle ? [] : null;
        const indices = this._voxelEmitQuadIndices(
            density,
            cellVert,
            dimX,
            dimY,
            dimZ,
            hoehle ? hoehle.lab : null,
            triZelle
        );
        this._voxelLaplacianSmoothPositions(positions, indices, smoothIters, sharp);
        this._voxelCropPad(positions, indices, vertCells, dimX, dimZ, cropMargin, triZelle);
        // DER BODEN FÄLLT IM GRUND DES HAUSES (S4, gelaende-core `erdbauSchnitt`, derselbe Code wie im Voxel-Faden); ein eigener
        // Sampler (die Schwebe-Insel) ist nicht der Boden
        if (!densityFn) globalThis.__gelaendeCore.erdbauSchnitt(this._erdbauLage(), positions, indices, triZelle);
        if (positions.length === 0) return null;
        // Gradient-Normals nutzen das geteilte preDensity-Grid (statt ~18k Dichte-Calls);
        // _voxelGradientNormals interpoliert trilinear, Out-of-Bounds → sample().
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const Nz = dimZ + 1;
        const preGrid = { density, ox, oy, oz, Nx, Ny, Nz, step };
        const normals = this._voxelGradientNormals(positions, sample, step, preGrid);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        if (indices.length > 0) geom.setIndex(indices);
        geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
        // JEDE Terrain-Geometrie trägt die Morph-Attribute — WebGPU-strikt: ein NodeMaterial-`attribute()`
        // MUSS auf jedem Mesh existieren (sonst Pipeline-Crash), darum ZENTRAL hier. Default Identität
        // (Ziel = Position, Gewicht 0), bis `_applyCrossLodGeomorph` Cross-LOD-Boundary-Vertices auf die
        // grobe Nachbar-Oberfläche zieht. Render-only (Vertex-Shader), main-only, Physik-Position unberührt.
        geom.setAttribute("aMorphTarget", new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
        geom.setAttribute("aMorphWeight", new THREE.Float32BufferAttribute(new Float32Array(positions.length / 3), 1));
        geom.setAttribute(
            "aHimmel",
            new THREE.Float32BufferAttribute(
                globalThis.__gelaendeCore.himmelsSicht(indices, triZelle, positions.length / 3, step),
                1
            )
        );
        if (hoehle)
            geom.hoehle = {
                tri: Int32Array.from(triZelle),
                n: hoehle.n,
                knoten: hoehle.knoten,
                muend: hoehle.muend,
                seiten: hoehle.seiten,
                kanten: hoehle.kanten,
                rand: hoehle.rand,
                step,
            };
        return geom;
    }

    // DIE BODEN-KARTE (V18.508): die Höhe des GERENDERTEN Bodens je Chunk, gerastert aus dem fertigen
    // Mesh (Surface-Nets-Vertices nach Glättung + Crop) auf ein Gitter von step/BODEN_KARTE_TEILUNG (LOD 0:
    // 0,45 m, Origin chunk − step, über das Pad (dim+3)·step); je Punkt die OBERSTE nicht-steile Fläche (Wände
    // tragen nichts), NaN ohne Boden, dazu der Grün-Kanal (Uint8). Vorher las die Karte die Dichte-Spalten
    // (Nulldurchgang an den Gitter-Ecken) — gemessen 01.10.: an der Mess-Wiese −1004/−790 liegt der gerenderte
    // Boden ±0,22 m (q05–q95, max +0,43) neben dem Gesetz, im Spawn-Chunk Median 45 cm; das 1,8-m-Netz trägt
    // die Feinform der Funktion nicht, die Glättung verdoppelt die Abweichung. Die Karte trifft das Mesh im
    // Median auf 0,9 cm. Ein Halm von 8–24 cm auf der
    // Gesetzes-Höhe steckte so halb im sichtbaren Boden. Wer etwas AUF den sichtbaren Boden stellt (Gras,
    // Streu, Deko), liest diese Karte; Körper (Spieler, Tiere, Bäume) stehen weiter auf dem Gesetz
    // (`_voxelSurfaceY`, deterministisch für den Lockstep — die Karte hängt am Streaming-Zustand).
    // DIE NAHT (gehen-takt, `_bodenKarteNaht`): `basis` ist die vorige Karte derselben Geometrie (`hoehe`, `gruen`, ihre Lage
    // `ref`, je Dreieck sein Zellen-Rechteck `zellen`). Neu gerastert werden nur die Zellen unter den Dreiecken, die gegen `ref`
    // ihre Lage ändern (ihr Rechteck alt und neu), dort jedes Dreieck mit markierter Zelle in der Reihe des Netzes; jede andere
    // Zelle sieht dieselben Dreiecke in derselben Lage — byte-gleich mit der ganzen Karte. `rand` (fahrt-takt): bewegen kann nur
    // der Saum (`_bodenNaht`: `rand` die Vertices, `randTri` ihre Dreiecke) — die Suche nach bewegten geht nur ihn.
    // DIE RECHNUNG IST DER KERN (w4-b-boden, gelaende-core `bodenKarte`): der voxel-worker rastert die Karte jedes Netzes, das
    // er baut (der Einbau setzt sie nur ein); hier rastern der Sync-Bau, der Naht-Morph und die vorläufige Gestalt eines Edits.
    _bodenKarteAusMesh(pos, idx, col, cx, cz, lod, basis = null, rand = null, anOrt = false) {
        if (!pos || !idx || idx.length < 3) return null;
        const G = globalThis.__gelaendeCore;
        const gs = AnazhRealm.TERRAIN_GEOLOGY.gruenSchwelle;
        const T = AnazhRealm.BODEN_KARTE_TEILUNG;
        return G.bodenKarte(pos, idx, col, cx, cz, this._voxelChunkConfig(lod || 0), T, gs, basis, rand, anOrt);
    }

    // Pass 0 — Density-Grid: Nx*Ny*Nz Eck-Werte vom Sample. Float32Array,
    // Indizierung gi = i + j*Nx + k*Nx*Ny.
    // DAS BAND IST DAS DES BODENS (`boden`): ein Feld in eigenen Koordinaten (die Schwebe-Insel, `_voxelChunkGeometry` mit
    // eigenem Sampler) sampelt jede Ecke. Bis 10.10. schnitt das Boden-Band jedes Feld — die Insel (lokal um 0|0|0) bekam
    // das Band des Bodens am Welt-Ursprung: lag er tiefer als ~−3 m, verlor sie ihre Kuppe, unter ~−20 m (Tiefsee) jede
    // Ecke, und `new THREE.Mesh(null)` riss den Boot ab (1 von 40 frisch geborenen Welten erwachte nie).
    // Der Chunk des Bodens sampelt das Gitter des Kerns (`_voxelEditedDensityGrid`); hier sampelt `sample` jede Ecke im Band
    // (Sync-Bau ohne Vorab-Gitter: der Punkt `_terrainDensityAt` mit den Edits, deren Reichweite das Band deckt).
    _voxelSampleDensityGrid(ox, oy, oz, dimX, dimY, dimZ, step, sample, boden = true) {
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const Nz = dimZ + 1;
        const density = new Float32Array(Nx * Ny * Nz);
        // BAND-SKIP: pro Spalte (i,k) nur die j-Ebenen um die Oberfläche sample()-n — über dem Band garantiert Luft, unter
        // ihm garantiert Fels → −1/+1 statt sample(), ~60–70 % weniger Calls. Das Band ist EIN Gesetz des Kerns
        // (`bandOben`/`bandUnten`); wo ein Edit seine Fläche hinlegt, deckt es seine Reichweite (`bandUmEdits`).
        const G = globalThis.__gelaendeCore;
        const base = this.state.terrainBaseHeight || 0;
        for (let k = 0; k < Nz; k++) {
            const wz = oz + k * step;
            for (let i = 0; i < Nx; i++) {
                const wx = ox + i * step;
                const surf = boden ? this._terrainMacroSurfaceY(wx, wz) : 0;
                const bandTopJ = boden ? G.bandOben(surf, oy, step) : Ny;
                const bandBotJ = boden ? G.bandUnten(surf, base, oy, step) : -1;
                const colBase = i + k * Nx * Ny;
                for (let j = 0; j < Ny; j++) {
                    const idx = colBase + j * Nx;
                    if (j > bandTopJ) density[idx] = -1;
                    else if (j < bandBotJ) density[idx] = 1;
                    else density[idx] = sample(wx, oy + j * step, wz);
                }
            }
        }
        if (boden) {
            const edits = this._voxelEditsImKasten(ox, ox + dimX * step, oz, oz + dimZ * step);
            const spalte = (x, z) => this._terrainColumnContext(x, z);
            G.bandUmEdits(density, ox, oy, oz, Nx, Ny, Nz, step, edits, base, spalte, (x, y, z) => sample(x, y, z));
        }
        return density;
    }

    // Pass 1 — ein Vertex pro oberflächen-schneidender Zelle. Liefert positions (x/y/z-Tripel),
    // cellVert (Zell-Index → Vertex-Index, -1 ohne Oberfläche), vertCells (i/j/k pro Vertex, Crop-Filter).
    _voxelExtractSurfaceVertices(density, ox, oy, oz, dimX, dimY, dimZ, step) {
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const gi = (i, j, k) => i + j * Nx + k * Nx * Ny;
        const ci = (i, j, k) => i + j * dimX + k * dimX * dimY;
        // Die 12 Würfel-Kanten als Eck-Paare (Eck c: bit0=x, bit1=y, bit2=z).
        const EDGES = [
            [0, 1],
            [0, 2],
            [0, 4],
            [1, 3],
            [1, 5],
            [2, 3],
            [2, 6],
            [3, 7],
            [4, 5],
            [4, 6],
            [5, 7],
            [6, 7],
        ];
        const solid = (v) => v > 0;
        const cellVert = new Int32Array(dimX * dimY * dimZ).fill(-1);
        const positions = [];
        const vertCells = [];
        const sharp = []; // T3 — pro Vertex: 1, wenn das QEF eine echte FEATURE-Ecke fand (scharf)
        // T3 (Manifold Dual Contouring): LAMBDA regularisiert das QEF Richtung Mass-Point (=der
        // alte Surface-Nets-Mittel-Vertex). Klein → scharf (QEF dominiert, Feature-Ecken); gross →
        // glatt (Mass-Point). Browser-justierbar; das Clamp auf die Zelle bannt Self-Intersection.
        const LAMBDA = AnazhRealm.DC_LAMBDA;
        for (let k = 0; k < dimZ; k++) {
            for (let j = 0; j < dimY; j++) {
                for (let i = 0; i < dimX; i++) {
                    const corner = new Array(8);
                    let mask = 0;
                    for (let c = 0; c < 8; c++) {
                        const cx = i + (c & 1);
                        const cy = j + ((c >> 1) & 1);
                        const cz = k + ((c >> 2) & 1);
                        corner[c] = density[gi(cx, cy, cz)];
                        if (solid(corner[c])) mask |= 1 << c;
                    }
                    if (mask === 0 || mask === 0xff) continue;
                    // Mass-Point (Mittel der Kanten-Kreuzungen) + QEF (Dual Contouring): jede Kreuzung p_i mit Hermite-
                    // Normale n_i (analytischer Trilinear-Gradient) spannt n_i·(x−p_i)=0; das Minimum von
                    // Σ(n_i·(x−p_i))² sitzt am Feature-Eckpunkt.
                    let vx = 0;
                    let vy = 0;
                    let vz = 0;
                    let count = 0;
                    let a00 = 0,
                        a01 = 0,
                        a02 = 0,
                        a11 = 0,
                        a12 = 0,
                        a22 = 0;
                    let b0 = 0,
                        b1 = 0,
                        b2 = 0;
                    for (const [a, b] of EDGES) {
                        if (solid(corner[a]) === solid(corner[b])) continue;
                        const da = corner[a];
                        const db = corner[b];
                        const denom = da - db;
                        const t = Math.abs(denom) > 1e-9 ? da / denom : 0.5;
                        const ax = a & 1;
                        const ay = (a >> 1) & 1;
                        const az = (a >> 2) & 1;
                        const bx = b & 1;
                        const by = (b >> 1) & 1;
                        const bz = (b >> 2) & 1;
                        const px = ax + (bx - ax) * t;
                        const py = ay + (by - ay) * t;
                        const pz = az + (bz - az) * t;
                        vx += px;
                        vy += py;
                        vz += pz;
                        count++;
                        // analytischer Trilinear-Gradient an (px,py,pz) aus den 8 Ecken
                        let gx =
                            (corner[1] - corner[0]) * (1 - py) * (1 - pz) +
                            (corner[3] - corner[2]) * py * (1 - pz) +
                            (corner[5] - corner[4]) * (1 - py) * pz +
                            (corner[7] - corner[6]) * py * pz;
                        let gy =
                            (corner[2] - corner[0]) * (1 - px) * (1 - pz) +
                            (corner[3] - corner[1]) * px * (1 - pz) +
                            (corner[6] - corner[4]) * (1 - px) * pz +
                            (corner[7] - corner[5]) * px * pz;
                        let gz =
                            (corner[4] - corner[0]) * (1 - px) * (1 - py) +
                            (corner[5] - corner[1]) * px * (1 - py) +
                            (corner[6] - corner[2]) * (1 - px) * py +
                            (corner[7] - corner[3]) * px * py;
                        const glen = Math.sqrt(gx * gx + gy * gy + gz * gz);
                        if (glen < 1e-9) continue; // flacher Punkt → nur Mass-Point
                        gx /= glen;
                        gy /= glen;
                        gz /= glen;
                        const d = gx * px + gy * py + gz * pz;
                        a00 += gx * gx;
                        a01 += gx * gy;
                        a02 += gx * gz;
                        a11 += gy * gy;
                        a12 += gy * gz;
                        a22 += gz * gz;
                        b0 += gx * d;
                        b1 += gy * d;
                        b2 += gz * d;
                    }
                    if (count === 0) continue;
                    const s = 1 / count;
                    const cx = vx * s,
                        cy = vy * s,
                        cz = vz * s; // Mass-Point (= der alte Surface-Nets-Vertex)
                    // QEF + Mass-Point-Regularisierung (λ), dann 3×3 via Cramer (deterministisch)
                    a00 += LAMBDA;
                    a11 += LAMBDA;
                    a22 += LAMBDA;
                    b0 += LAMBDA * cx;
                    b1 += LAMBDA * cy;
                    b2 += LAMBDA * cz;
                    let fx = cx,
                        fy = cy,
                        fz = cz,
                        isSharp = 0;
                    const det =
                        a00 * (a11 * a22 - a12 * a12) - a01 * (a01 * a22 - a12 * a02) + a02 * (a01 * a12 - a11 * a02);
                    if (Math.abs(det) > 1e-9) {
                        const inv = 1 / det;
                        const m00 = a11 * a22 - a12 * a12,
                            m01 = a02 * a12 - a01 * a22,
                            m02 = a01 * a12 - a02 * a11;
                        const m11 = a00 * a22 - a02 * a02,
                            m12 = a01 * a02 - a00 * a12;
                        const m22 = a00 * a11 - a01 * a01;
                        fx = (m00 * b0 + m01 * b1 + m02 * b2) * inv;
                        fy = (m01 * b0 + m11 * b1 + m12 * b2) * inv;
                        fz = (m02 * b0 + m12 * b1 + m22 * b2) * inv;
                        if (fx < 0) fx = 0;
                        else if (fx > 1) fx = 1;
                        if (fy < 0) fy = 0;
                        else if (fy > 1) fy = 1;
                        if (fz < 0) fz = 0;
                        else if (fz > 1) fz = 1;
                        // „scharf" = das QEF zog den Vertex spürbar vom Mass-Point weg (ein echtes
                        // Feature, kein flaches Mittel) → der feature-bewusste Laplacian verschont ihn.
                        const dxm = fx - cx,
                            dym = fy - cy,
                            dzm = fz - cz;
                        if (dxm * dxm + dym * dym + dzm * dzm > AnazhRealm.DC_SHARP_MOVE2) isSharp = 1;
                    }
                    cellVert[ci(i, j, k)] = positions.length / 3;
                    vertCells.push(i, j, k);
                    sharp.push(isSharp);
                    positions.push(ox + (i + fx) * step, oy + (j + fy) * step, oz + (k + fz) * step);
                }
            }
        }
        return { positions, vertCells, cellVert, sharp };
    }

    // Pass 2 — je Gitter-Kante mit Vorzeichenwechsel ein Quad; die Diagonale alterniert mit der
    // Zell-Parität `(i+j+k) & 1` (sonst Streifen-Muster auf flachen Hügeln). cv() ist die Out-of-Range-
    // Wand: ohne sie aliast `ci(dim, j, k)` in einen fremden Zell-Slot → Streck-Dreieck an jeder Naht.
    // Mit `lab` (je Gitter-Punkt die Höhlen-Zelle, `_voxelHoehlenGraph`) trägt `triZelle` je Dreieck die Zelle des
    // LUFT-Endes seiner Kante (−1: Himmels-Luft) — die Fläche gehört der Luft, aus der man sie sieht.
    _voxelEmitQuadIndices(density, cellVert, dimX, dimY, dimZ, lab = null, triZelle = null) {
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const gi = (i, j, k) => i + j * Nx + k * Nx * Ny;
        const ci = (i, j, k) => i + j * dimX + k * dimX * dimY;
        const solid = (v) => v > 0;
        const cv = (i, j, k) => {
            if (i < 0 || j < 0 || k < 0 || i >= dimX || j >= dimY || k >= dimZ) return -1;
            return cellVert[ci(i, j, k)];
        };
        const indices = [];
        const quad = (a, b, c, d, parity, zelle) => {
            if (a < 0 || b < 0 || c < 0 || d < 0) return;
            if (parity & 1) {
                indices.push(a, b, d, b, c, d);
            } else {
                indices.push(a, b, c, a, c, d);
            }
            if (triZelle) triZelle.push(zelle, zelle);
        };
        // die Zelle des Luft-Endes der Kante p0–p1 (s0: p0 fest)
        const luft = (p0, p1, s0) => (lab ? lab[s0 ? p1 : p0] : -1);
        for (let k = 0; k <= dimZ; k++) {
            for (let j = 0; j <= dimY; j++) {
                for (let i = 0; i <= dimX; i++) {
                    const p0 = gi(i, j, k);
                    const s0 = solid(density[p0]);
                    const parity = (i + j + k) & 1;
                    // +x-Kante → 4 Zellen bei (i, j-1..j, k-1..k)
                    if (i < dimX && j > 0 && k > 0 && s0 !== solid(density[gi(i + 1, j, k)])) {
                        quad(
                            cv(i, j - 1, k - 1),
                            cv(i, j, k - 1),
                            cv(i, j, k),
                            cv(i, j - 1, k),
                            parity,
                            luft(p0, gi(i + 1, j, k), s0)
                        );
                    }
                    // +y-Kante → 4 Zellen bei (i-1..i, j, k-1..k)
                    if (j < dimY && i > 0 && k > 0 && s0 !== solid(density[gi(i, j + 1, k)])) {
                        quad(
                            cv(i - 1, j, k - 1),
                            cv(i, j, k - 1),
                            cv(i, j, k),
                            cv(i - 1, j, k),
                            parity,
                            luft(p0, gi(i, j + 1, k), s0)
                        );
                    }
                    // +z-Kante → 4 Zellen bei (i-1..i, j-1..j, k)
                    if (k < dimZ && i > 0 && j > 0 && s0 !== solid(density[gi(i, j, k + 1)])) {
                        quad(
                            cv(i - 1, j - 1, k),
                            cv(i, j - 1, k),
                            cv(i, j, k),
                            cv(i - 1, j, k),
                            parity,
                            luft(p0, gi(i, j, k + 1), s0)
                        );
                    }
                }
            }
        }
        return indices;
    }

    // DIE HÖHLEN-SCHICHT (Welle 7) — der Sicht-Graph der Höhlen-Luft aus dem Dichte-Gitter des Chunks (MUSS bit-identisch
    // im Worker, `hoehlenGraph`). Befund (echte GPU, Mess-Wiese −900/−850, Gitter-Probe): 68 % der Boden-Kanten trennen Fels
    // von HÖHLEN-Luft, und der Boden-Satz zeichnete sie in jedem Pass; eine Tiefen-Grenze unter der Oberfläche risse an
    // Mündungen, Überhängen und Klippen Löcher. Die Wahrheit liegt in der Luft: HIMMELS-Luft ist ein Luft-Punkt über der
    // obersten festen Ecke seiner Spalte, HÖHLEN-Luft einer darunter. Senkrecht unter Himmels-Luft liegt nur Himmels-Luft
    // oder Fels — ein Strahl aus dem Himmel betritt Höhlen-Luft nur WAAGERECHT, durch eine MÜNDUNG (Höhlen-Luft neben
    // Himmels-Luft). Eine ZELLE ist eine Höhlen-Luft-Komponente (6-Nachbarschaft, wie Surface-Nets die Luft trennt) je
    // Chunk-Teil (Kachel × Lage); ein PORTAL sind zwei 6-benachbarte Punkte verschiedener Zellen (über eine Teil-Grenze); das RAND-BAND
    // trägt die Punkte bis einen Schritt jenseits jeder Chunk-Kante (dort verknüpft der Haupt-Thread die Nachbar-Chunks,
    // `_hoehlenVerknuepfe`). Zelle 0 sammelt die versiegelten Komponenten (keine Mündung, kein Portal, kein Rand-Band — von
    // außen nie zu sehen). Rückgabe: `lab` (je Gitter-Punkt die Zelle, −1 = keine Höhlen-Luft), `n` Zellen, `knoten` (je
    // Zelle ihre Luft-Box, min xyz · max xyz, leer = +∞/−∞), `muend` (je Zelle und Fach von 4³ Punkten eine Mündungs-Box:
    // Zelle · Box), `seiten` (je Zelle und Seite −x · +x ·
    // −z · +z die Box ihrer Rand-Band-Punkte), `kanten` (je Portal Zelle a · Zelle b · Box), `rand` (die Höhlen-Punkte auf
    // den Chunk-Kanten, `_hoehlenVerknuepfe`).
    _voxelHoehlenGraph(density, ox, oy, oz, dimX, dimY, dimZ, step) {
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const Nz = dimZ + 1;
        const NxNy = Nx * Ny;
        const N = NxNy * Nz;
        // die oberste feste Ecke je Spalte (−1: keine)
        const top = new Int32Array(Nx * Nz).fill(-1);
        for (let k = 0; k < Nz; k++)
            for (let i = 0; i < Nx; i++)
                for (let j = Ny - 1; j >= 0; j--)
                    if (density[i + j * Nx + k * NxNy] > 0) {
                        top[i + k * Nx] = j;
                        break;
                    }
        const hoehle = (p, i, j, k) => density[p] <= 0 && j < top[i + k * Nx];
        // DIE TEILUNG der Zellen (MUSS gleich in Main und Worker): je Chunk-Seite TEIL Kacheln, je SCHICHT Gitter-Ebenen eine
        // Lage — eine kleine Zelle hält das Rechteck der Portal-Sicht eng (Werkbank 06.10., Mess-Wiese: Viertel ohne Lagen
        // 13,8k, 4 × 4 Kacheln mit Lagen 7,5k Höhlen-Dreiecke im Hauptbild bei derselben Mündungs-Wahl).
        const TEIL = 4,
            SCHICHT = 8;
        const kachel = (i, dim) => {
            const t = Math.floor(((i - 1) * TEIL) / dim);
            return t < 0 ? 0 : t >= TEIL ? TEIL - 1 : t;
        };
        const teil = (i, j, k) =>
            kachel(i, dimX - 3) + TEIL * kachel(k, dimZ - 3) + TEIL * TEIL * Math.floor(j / SCHICHT);
        // (1) die Komponenten je Teil (Breitensuche über einen Stapel, Punkte in Index-Folge — deterministisch)
        const lab = new Int32Array(N).fill(-1);
        const stapel = new Int32Array(N);
        let nRoh = 0;
        for (let p = 0; p < N; p++) {
            if (lab[p] >= 0) continue;
            const i = p % Nx;
            const j = ((p / Nx) | 0) % Ny;
            const k = (p / NxNy) | 0;
            if (!hoehle(p, i, j, k)) continue;
            const v = teil(i, j, k);
            lab[p] = nRoh;
            let sp = 0;
            stapel[sp++] = p;
            const tritt = (q, qi, qj, qk) => {
                if (lab[q] >= 0 || !hoehle(q, qi, qj, qk) || teil(qi, qj, qk) !== v) return;
                lab[q] = nRoh;
                stapel[sp++] = q;
            };
            while (sp > 0) {
                const q = stapel[--sp];
                const qi = q % Nx;
                const qj = ((q / Nx) | 0) % Ny;
                const qk = (q / NxNy) | 0;
                if (qi + 1 < Nx) tritt(q + 1, qi + 1, qj, qk);
                if (qi > 0) tritt(q - 1, qi - 1, qj, qk);
                if (qj + 1 < Ny) tritt(q + Nx, qi, qj + 1, qk);
                if (qj > 0) tritt(q - Nx, qi, qj - 1, qk);
                if (qk + 1 < Nz) tritt(q + NxNy, qi, qj, qk + 1);
                if (qk > 0) tritt(q - NxNy, qi, qj, qk - 1);
            }
            nRoh++;
        }
        // (2) je Komponente: Luft-Box, Mündungs-Boxen je Fach, Rand-Bänder (Gitter-Indizes) und die Portale zu den Nachbar-Teilen
        const LEER = [2147483647, -2147483648];
        const luftB = new Int32Array(nRoh * 6);
        // die Mündungen je Komponente und Fach (4 × 4 × 4 Gitter-Punkte): eine kleine Box hält die Horizont-Probe und das Licht-
        // Rechteck eng (eine Komponente trägt oft Mündungen über die ganze Höhe einer Schlucht-Wand)
        const mundM = new Map();
        const mund = (c, i, j, k, i2, k2) => {
            const key = c * 4096 + (i >> 2) + 8 * ((k >> 2) + 8 * (j >> 2));
            let B = mundM.get(key);
            if (!B) mundM.set(key, (B = [c, LEER[0], LEER[0], LEER[0], LEER[1], LEER[1], LEER[1]]));
            dehne(B, 1, i, j, k);
            dehne(B, 1, i2, j, k2);
        };
        const seitB = new Int32Array(nRoh * 24);
        for (let c = 0; c < nRoh; c++) {
            for (let a = 0; a < 3; a++) {
                luftB[c * 6 + a] = LEER[0];
                luftB[c * 6 + 3 + a] = LEER[1];
            }
            for (let sd = 0; sd < 4; sd++)
                for (let a = 0; a < 3; a++) {
                    seitB[c * 24 + sd * 6 + a] = LEER[0];
                    seitB[c * 24 + sd * 6 + 3 + a] = LEER[1];
                }
        }
        const dehne = (B, o, i, j, k) => {
            if (i < B[o]) B[o] = i;
            if (j < B[o + 1]) B[o + 1] = j;
            if (k < B[o + 2]) B[o + 2] = k;
            if (i > B[o + 3]) B[o + 3] = i;
            if (j > B[o + 4]) B[o + 4] = j;
            if (k > B[o + 5]) B[o + 5] = k;
        };
        const offen = new Uint8Array(nRoh); // Mündung, Portal oder Rand-Band → nicht versiegelt
        const paare = []; // je Portal-Fund [a, b, i, j, k, i2, k2]
        const himmel = (q, qi, qj, qk) => density[q] <= 0 && qj > top[qi + qk * Nx];
        for (let p = 0; p < N; p++) {
            const c = lab[p];
            if (c < 0) continue;
            const i = p % Nx;
            const j = ((p / Nx) | 0) % Ny;
            const k = (p / NxNy) | 0;
            dehne(luftB, c * 6, i, j, k);
            if (i <= 2) dehne(seitB, c * 24, i, j, k);
            if (i >= dimX - 3) dehne(seitB, c * 24 + 6, i, j, k);
            if (k <= 2) dehne(seitB, c * 24 + 12, i, j, k);
            if (k >= dimZ - 3) dehne(seitB, c * 24 + 18, i, j, k);
            if (i <= 2 || i >= dimX - 3 || k <= 2 || k >= dimZ - 3) offen[c] = 1;
            // die Mündung: ein waagerechter Nachbar in Himmels-Luft
            if (i + 1 < Nx && himmel(p + 1, i + 1, j, k)) {
                mund(c, i, j, k, i + 1, k);
                offen[c] = 1;
            }
            if (i > 0 && himmel(p - 1, i - 1, j, k)) {
                mund(c, i, j, k, i - 1, k);
                offen[c] = 1;
            }
            if (k + 1 < Nz && himmel(p + NxNy, i, j, k + 1)) {
                mund(c, i, j, k, i, k + 1);
                offen[c] = 1;
            }
            if (k > 0 && himmel(p - NxNy, i, j, k - 1)) {
                mund(c, i, j, k, i, k - 1);
                offen[c] = 1;
            }
            // das Portal: der +x-, +y- bzw. +z-Nachbar in einer anderen Zelle (nur über eine Teil-Grenze möglich)
            if (i + 1 < Nx && lab[p + 1] >= 0 && lab[p + 1] !== c) {
                paare.push(c, lab[p + 1], i, j, k, i + 1, j, k);
                offen[c] = offen[lab[p + 1]] = 1;
            }
            if (j + 1 < Ny && lab[p + Nx] >= 0 && lab[p + Nx] !== c) {
                paare.push(c, lab[p + Nx], i, j, k, i, j + 1, k);
                offen[c] = offen[lab[p + Nx]] = 1;
            }
            if (k + 1 < Nz && lab[p + NxNy] >= 0 && lab[p + NxNy] !== c) {
                paare.push(c, lab[p + NxNy], i, j, k, i, j, k + 1);
                offen[c] = offen[lab[p + NxNy]] = 1;
            }
        }
        // (3) Zellen: die versiegelten → 0, jede offene Komponente ihre Zelle 1…n−1 (in Fund-Folge)
        const zelleVon = new Int32Array(nRoh);
        let n = 1;
        for (let c = 0; c < nRoh; c++) zelleVon[c] = offen[c] ? n++ : 0;
        for (let p = 0; p < N; p++) if (lab[p] >= 0) lab[p] = zelleVon[lab[p]];
        const wx = (i) => ox + i * step;
        const wy = (j) => oy + j * step;
        const wz = (k) => oz + k * step;
        const knoten = new Float32Array(n * 6);
        const seiten = new Float32Array(n * 24);
        for (let z = 0; z < n; z++) {
            for (let a = 0; a < 3; a++) {
                knoten[z * 6 + a] = Infinity;
                knoten[z * 6 + 3 + a] = -Infinity;
            }
            for (let sd = 0; sd < 4; sd++)
                for (let a = 0; a < 3; a++) {
                    seiten[z * 24 + sd * 6 + a] = Infinity;
                    seiten[z * 24 + sd * 6 + 3 + a] = -Infinity;
                }
        }
        // eine Gitter-Box (Int32, leer: min > max) in eine Welt-Box (Float32) vereinen
        const vereine = (Z, zo, B, bo) => {
            if (B[bo] > B[bo + 3]) return;
            const v = [wx(B[bo]), wy(B[bo + 1]), wz(B[bo + 2]), wx(B[bo + 3]), wy(B[bo + 4]), wz(B[bo + 5])];
            for (let a = 0; a < 3; a++) {
                if (v[a] < Z[zo + a]) Z[zo + a] = v[a];
                if (v[3 + a] > Z[zo + 3 + a]) Z[zo + 3 + a] = v[3 + a];
            }
        };
        for (let c = 0; c < nRoh; c++) {
            const z = zelleVon[c];
            vereine(knoten, z * 6, luftB, c * 6);
            for (let sd = 0; sd < 4; sd++) vereine(seiten, z * 24 + sd * 6, seitB, c * 24 + sd * 6);
        }
        // (4) die Portale je Zellen-Paar (a < b) als EINE Box beider Punkte, in Fund-Folge
        const portal = new Map();
        for (let q = 0; q < paare.length; q += 8) {
            const a = zelleVon[paare[q]];
            const b = zelleVon[paare[q + 1]];
            const lo = a < b ? a : b;
            const hi = a < b ? b : a;
            const key = lo * n + hi;
            let B = portal.get(key);
            if (!B) portal.set(key, (B = [lo, hi, Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]));
            const pts = [
                [paare[q + 2], paare[q + 3], paare[q + 4]],
                [paare[q + 5], paare[q + 6], paare[q + 7]],
            ];
            for (const [i, j, k] of pts) {
                const x = wx(i),
                    y = wy(j),
                    zz = wz(k);
                if (x < B[2]) B[2] = x;
                if (y < B[3]) B[3] = y;
                if (zz < B[4]) B[4] = zz;
                if (x > B[5]) B[5] = x;
                if (y > B[6]) B[6] = y;
                if (zz > B[7]) B[7] = zz;
            }
        }
        // die Mündungs-Boxen [Zelle, Box] in Fund-Folge (eine versiegelte Komponente trägt keine)
        const muend = new Float32Array(mundM.size * 7);
        let om = 0;
        for (const B of mundM.values()) {
            muend[om++] = zelleVon[B[0]];
            muend[om++] = wx(B[1]);
            muend[om++] = wy(B[2]);
            muend[om++] = wz(B[3]);
            muend[om++] = wx(B[4]);
            muend[om++] = wy(B[5]);
            muend[om++] = wz(B[6]);
        }
        const kanten = new Float32Array(portal.size * 8);
        let o = 0;
        for (const B of portal.values()) for (let a = 0; a < 8; a++) kanten[o++] = B[a];
        // (5) die RAND-EBENEN: je Höhlen-Punkt auf einer Chunk-Kante (−x: i = 1 · +x: i = dimX − 2 · −z: k = 1 · +z: k = dimZ − 2)
        // [Seite, j, u (k bzw. i), Zelle] — derselbe Welt-Punkt liegt im Gitter des Nachbarn auf seiner Gegen-Kante (gleiche
        // Stufe: dieselben Indizes), dort verknüpft der Haupt-Thread die Zellen exakt (`_hoehlenVerknuepfe`).
        const randL = [];
        for (let k = 0; k < Nz; k++)
            for (let j = 0; j < Ny; j++) {
                const a = lab[1 + j * Nx + k * NxNy];
                if (a > 0) randL.push(0, j, k, a);
                const b = lab[dimX - 2 + j * Nx + k * NxNy];
                if (b > 0) randL.push(1, j, k, b);
            }
        for (let i = 0; i < Nx; i++)
            for (let j = 0; j < Ny; j++) {
                const a = lab[i + j * Nx + NxNy];
                if (a > 0) randL.push(2, j, i, a);
                const b = lab[i + j * Nx + (dimZ - 2) * NxNy];
                if (b > 0) randL.push(3, j, i, b);
            }
        const rand = Int32Array.from(randL);
        return { lab, n, knoten, muend, seiten, kanten, rand };
    }

    // Laplacian-Smooth MUTIERT positions in place (Surface-Nets-Treppen → sanfte Schrägen).
    // Naht: N Iterationen propagieren N Zellen → pad+crop MUSS N Zellen breit sein, sonst Risse zwischen
    // Nachbar-Chunks (Seam-Test). Alle Pfade nutzen 1 (cropMargin 1); mehr braucht einen breiteren pad
    // im geteilten Density-Grid (auch von den Wasser-Cells indiziert).
    _voxelLaplacianSmoothPositions(positions, indices, iterations = 1, sharp = null) {
        if (indices.length < 3) return;
        const vertCount = positions.length / 3;
        const neighborSets = new Array(vertCount);
        for (let v = 0; v < vertCount; v++) neighborSets[v] = new Set();
        for (let t = 0; t + 2 < indices.length; t += 3) {
            const ia = indices[t];
            const ib = indices[t + 1];
            const ic = indices[t + 2];
            neighborSets[ia].add(ib);
            neighborSets[ia].add(ic);
            neighborSets[ib].add(ia);
            neighborSets[ib].add(ic);
            neighborSets[ic].add(ia);
            neighborSets[ic].add(ib);
        }
        const lambda = 0.5;
        const smoothed = new Array(positions.length);
        for (let iter = 0; iter < iterations; iter++) {
            for (let v = 0; v < vertCount; v++) {
                const nbrs = neighborSets[v];
                const cnt = nbrs.size;
                // T3 — feature-bewusst: ein scharfer QEF-Vertex (Feature-Ecke) bleibt UNgesmootht,
                // sonst rundet der Laplacian die Kante wieder weg (er fügte vor T3 die Blobigkeit zu).
                if (cnt === 0 || (sharp && sharp[v])) {
                    smoothed[v * 3] = positions[v * 3];
                    smoothed[v * 3 + 1] = positions[v * 3 + 1];
                    smoothed[v * 3 + 2] = positions[v * 3 + 2];
                    continue;
                }
                let sx = 0;
                let sy = 0;
                let sz = 0;
                for (const n of nbrs) {
                    sx += positions[n * 3];
                    sy += positions[n * 3 + 1];
                    sz += positions[n * 3 + 2];
                }
                const ax = sx / cnt;
                const ay = sy / cnt;
                const az = sz / cnt;
                smoothed[v * 3] = positions[v * 3] + lambda * (ax - positions[v * 3]);
                smoothed[v * 3 + 1] = positions[v * 3 + 1] + lambda * (ay - positions[v * 3 + 1]);
                smoothed[v * 3 + 2] = positions[v * 3 + 2] + lambda * (az - positions[v * 3 + 2]);
            }
            for (let i = 0; i < positions.length; i++) positions[i] = smoothed[i];
        }
    }

    // Crop-Pass: die äußersten `cropMargin` Zell-Ebenen in X/Z (nur Smooth-Stützen) verwerfen. MUTIERT
    // positions + indices in place (.length=0 + push — der Aufrufer hält Referenzen).
    // `triZelle` (die Höhlen-Zelle je Dreieck, `_voxelEmitQuadIndices`) fällt mit seinen Dreiecken.
    _voxelCropPad(positions, indices, vertCells, dimX, dimZ, cropMargin, triZelle = null) {
        if (cropMargin <= 0 || positions.length === 0) return;
        const vc = positions.length / 3;
        const remap = new Int32Array(vc).fill(-1);
        const keptPos = [];
        let kept = 0;
        for (let v = 0; v < vc; v++) {
            const ciV = vertCells[v * 3];
            const ckV = vertCells[v * 3 + 2];
            if (ciV < cropMargin || ciV >= dimX - cropMargin || ckV < cropMargin || ckV >= dimZ - cropMargin) {
                continue;
            }
            remap[v] = kept++;
            keptPos.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
        }
        const keptIdx = [];
        const keptZelle = [];
        for (let t = 0; t + 2 < indices.length; t += 3) {
            const a = remap[indices[t]];
            const b = remap[indices[t + 1]];
            const c = remap[indices[t + 2]];
            if (a >= 0 && b >= 0 && c >= 0) {
                keptIdx.push(a, b, c);
                if (triZelle) keptZelle.push(triZelle[t / 3]);
            }
        }
        positions.length = 0;
        for (let i = 0; i < keptPos.length; i++) positions.push(keptPos[i]);
        indices.length = 0;
        for (let i = 0; i < keptIdx.length; i++) indices.push(keptIdx[i]);
        if (triZelle) {
            triZelle.length = 0;
            for (let i = 0; i < keptZelle.length; i++) triZelle.push(keptZelle[i]);
        }
    }

    // Normalen = −∇d des Dichtefelds (die wahre Iso-Normale, facettierungs-unabhängig) statt
    // `computeVertexNormals` (nimmt jede Quad-Diagonal-Faltung auf → Rauten-Facetten). Mit preGrid
    // trilinear aus den 8 Corner-Densities (spart 6 Dichte-Calls/Vertex); nicht abgedeckt → sample().
    _voxelGradientNormals(positions, sample, step, preGrid = null) {
        const normals = new Float32Array(positions.length);
        // NIE up-Normalen in die Geometrie backen: die Geometrie trägt die echte Oberflächen-Normale (der Boden-Stoff
        // liest sie als `normalWorldGeometry` — das Bump-Tor nach Hangneigung, die Mischung zur Senkrechten), das
        // Shading flacht im Material-normalNode (TERRAIN_NORMAL_FLATTEN). Der Schatten-Versatz liest NICHT die
        // Geometrie, sondern die End-Normale dieses normalNode (r184 `normalWorld`).
        const eps = step * 1.5;
        // Schneller Trilinear-Sampler aus dem Grid. Wenn preGrid==null oder
        // Sample-Punkt out-of-bounds → fallback auf sample(x,y,z).
        let lookup;
        if (preGrid) {
            const d = preGrid.density;
            const gOx = preGrid.ox;
            const gOy = preGrid.oy;
            const gOz = preGrid.oz;
            const gStep = preGrid.step;
            const Nx = preGrid.Nx;
            const Ny = preGrid.Ny;
            const Nz = preGrid.Nz;
            const NxNy = Nx * Ny;
            const NxMax = Nx - 1;
            const NyMax = Ny - 1;
            const NzMax = Nz - 1;
            lookup = (x, y, z) => {
                const fx = (x - gOx) / gStep;
                const fy = (y - gOy) / gStep;
                const fz = (z - gOz) / gStep;
                const i = Math.floor(fx);
                const j = Math.floor(fy);
                const k = Math.floor(fz);
                // Beide Bounds-Seiten prüfen (i+1 muss noch im Grid liegen).
                if (i < 0 || j < 0 || k < 0 || i >= NxMax || j >= NyMax || k >= NzMax) {
                    return sample(x, y, z);
                }
                const tx = fx - i;
                const ty = fy - j;
                const tz = fz - k;
                const base = i + j * Nx + k * NxNy;
                const d000 = d[base];
                const d100 = d[base + 1];
                const d010 = d[base + Nx];
                const d110 = d[base + 1 + Nx];
                const d001 = d[base + NxNy];
                const d101 = d[base + 1 + NxNy];
                const d011 = d[base + Nx + NxNy];
                const d111 = d[base + 1 + Nx + NxNy];
                const d00 = d000 * (1 - tx) + d100 * tx;
                const d10 = d010 * (1 - tx) + d110 * tx;
                const d01 = d001 * (1 - tx) + d101 * tx;
                const d11 = d011 * (1 - tx) + d111 * tx;
                const d0 = d00 * (1 - ty) + d10 * ty;
                const d1 = d01 * (1 - ty) + d11 * ty;
                return d0 * (1 - tz) + d1 * tz;
            };
        } else {
            lookup = sample;
        }
        // Konforme Rand-Normale: Same-LOD-Nachbarn teilen Rand-Verts float-exakt, aber trilinear (lokales
        // Grid) vs. sample()-Fallback (Nachbar out-of-bounds) ergibt verschiedene Normalen → Lichtungs-Naht.
        // Darum in der RAND-SCHALE (≤3 Zellen vom Grid-Rand) den ganzen Gradienten via sample() = reine
        // Funktion der Welt-Position → identische Normale; das Innere bleibt trilinear. Worker-Mirror
        // (`gradientNormals`), maxDiff 0. gridBound* nur mit preGrid (sonst ist lookup schon sample).
        const hasGrid = !!preGrid;
        let gx0 = 0,
            gx1 = 0,
            gz0 = 0,
            gz1 = 0,
            boundMargin = 0;
        if (hasGrid) {
            const gStep = preGrid.step;
            gx0 = preGrid.ox;
            gx1 = preGrid.ox + (preGrid.Nx - 1) * gStep;
            gz0 = preGrid.oz;
            gz1 = preGrid.oz + (preGrid.Nz - 1) * gStep;
            boundMargin = 3 * gStep;
        }
        for (let v = 0; v < positions.length; v += 3) {
            const px = positions[v];
            const py = positions[v + 1];
            const pz = positions[v + 2];
            // Rand-Schale → sample() (konforme Normale); sonst der schnelle Grid-Trilinear.
            const useSample =
                hasGrid &&
                (px - gx0 < boundMargin || gx1 - px < boundMargin || pz - gz0 < boundMargin || gz1 - pz < boundMargin);
            const L = useSample ? sample : lookup;
            const gx = L(px + eps, py, pz) - L(px - eps, py, pz);
            const gy = L(px, py + eps, pz) - L(px, py - eps, pz);
            const gz = L(px, py, pz + eps) - L(px, py, pz - eps);
            const len = Math.hypot(gx, gy, gz);
            if (len < 1e-6) {
                // Gradient ~0 (sehr seltener Sattelpunkt) → Default „oben".
                normals[v] = 0;
                normals[v + 1] = 1;
                normals[v + 2] = 0;
            } else {
                normals[v] = -gx / len;
                normals[v + 1] = -gy / len;
                normals[v + 2] = -gz / len;
            }
        }
        return normals;
    }
    // Welt-Feld-Farbe pro Voxel-Vertex als `color`-Attribut: jeder Vertex durch DIE EINE BODEN-FARBE.
    _attachVoxelFieldColors(geom) {
        const pos = geom && geom.getAttribute ? geom.getAttribute("position") : null;
        if (!pos || typeof this.worldFieldAt !== "function") return;
        const n = pos.count;
        const colors = new Float32Array(n * 3);
        const out = [0, 0, 0];
        for (let i = 0; i < n; i++) {
            this._bodenFarbeAt(pos.getX(i), pos.getY(i), pos.getZ(i), out);
            colors[i * 3] = out[0];
            colors[i * 3 + 1] = out[1];
            colors[i * 3 + 2] = out[2];
        }
        geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        this._felsStoff(geom);
    }

    // DER FELS HAT STOFF (K17; davor K02a „unter Fels wächst nichts"): das EINE Gesetz rechnet ihn — gelaende-core `felsStoff`
    // (die Pakete, die Rinde aus der Krümmung, Mulden, Flechte, Moos und der Schutt des Schicht-Gesetzes, Gewicht aus Himmels-
    // Sicht und Steile). Er entsteht, wo das Netz entsteht (K17-2): der Streaming-Pfad bekommt ihn fertig vom voxel-worker
    // (`buildChunkMesh`, per Transfer — `_buildVoxelChunkDataFromWorkerMesh` setzt nur die Attribute), der Haupt-Thread rechnet
    // ihn nur im Sync-Bau (`_attachVoxelFieldColors`: Spieler-Chunk, Graben, Voxel-Test). Bis K17-2 rechnete `_felsStoff` je
    // Worker-Bau im Haupt-Thread (Mess-Wiese Σ 59,4 ms je Ring, max 7,3 ms je Chunk, `gate:hoehlen-sicht` (n)).
    _felsStoff(geom) {
        const col = geom.attributes.color;
        const him = geom.attributes.aHimmel;
        const nor = geom.attributes.normal;
        const pos = geom.attributes.position;
        if (!col || !nor || !pos)
            throw new Error("_felsStoff: der Boden trägt nicht color · normal · position (fail-closed)");
        // Ohne Höhlen-Graph (nur der Voxel-Test `_voxelTest`: ein Gitter ohne Sicht-Graph) steht jeder Vertex unter dem
        // Himmel — jeder Chunk trägt `aHimmel` (`_buildVoxelChunkData*` bauen den Graph fail-closed).
        const S = globalThis.__gelaendeCore.felsStoff(
            this._gelaende(),
            AnazhRealm.FELS_STOFF.basis,
            AnazhRealm.FELS_STOFF.netz,
            pos.array,
            nor.array,
            geom.index ? geom.index.array : null,
            him ? him.array : null,
            col.array,
            pos.count,
            (x, z, y) => this._feuchteAt(x, z, y)
        );
        geom.setAttribute("aSchutt", new THREE.Float32BufferAttribute(S.schutt, 1));
        // die Linse (`gate:hoehlen-sicht` (k)) liest, womit das Moos gerechnet wurde
        if (S.feuchte !== undefined) geom.userData.felsFeuchte = S.feuchte;
        col.needsUpdate = true;
    }

    // DIE EINE BODEN-FARBE (V18.530): die Welt-Feld-Farbe eines Boden-Punkts aus derselben fraktalen Sprache
    // (worldFieldAt) → dieselben Biom-Regionen wie der Boden. Der Voxel-Chunk färbt jeden Vertex durch sie, der
    // Fern-Ring und das Feld-Panorama lesen sie für die Ferne (kein vereinfachter Fern-Zwilling); der Worker
    // rechnet sie bit-identisch (`attachFieldColors`) mit DERSELBEN Palette (`bodenPalette` im Schnappschuss).
    // Die Farben sind die Studio-Palette nach dem FARB-GESETZ (`BODEN_FARBE`): bis V18.530 trug der Boden Absichts-
    // Werte roh als linear (der Stein 0,42/0,44/0,49 mit dem Magie-Violett darüber: weiß-lavendel, Blick-Tour 05).
    // Magie ist ein AKZENT in Flecken, der Seegrund unter jedem Wasser Schlick. Die Laubstreu liegt NICHT hier: sie
    // folgt den echten Kronen (`_kronenStreuNeu` → `_wegeBodenFarbe`). `out` = [r, g, b] (linear, wie das Vertex-
    // Attribut). Die Ferne (das Mittel der Flecken und Bänder über eine Fläche) rechnet der Fern-Faden (`bodenFarbe` im
    // voxel-worker mit `fussM`, B2) — ohne fussM dieselben Zahlen wie hier.
    _bodenFarbeAt(x, y, z, out) {
        // V9.60-b.2 — Sand-Variation: lazy-laden des deterministischen
        // Welt-Noises (gleiche Instanz wie `_terrainMacroSurfaceY`). Macht
        // Strand-Breite + Intensität regional variabel statt überall gleich.
        const sandNoise = this._gelaende().noise;
        const base = this.state.terrainBaseHeight || 0;
        const P = AnazhRealm.BODEN_FARBE;
        const stone = P.rock;
        const earth = P.mead;
        const dampEarth = P.wet;
        const lava = P.basalt;
        const violet = P.magie;
        const snow = P.schnee;
        const sed = P.sediment;
        const sand = P.sand;
        const packedDirt = P.dirt;
        const ss = (e0, e1, x) => {
            let t = (x - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        // Feuchte-Sichtbarkeitskurve aus AnazhRealm.FEUCHTE (im Main justierbar); der Worker-Spiegel
        // hardkodiert sie — eine Runtime-Tunable bräche den bit-Vertrag.
        const F_VIS_LO = AnazhRealm.FEUCHTE.sichtbarLo;
        const F_VIS_HI = AnazhRealm.FEUCHTE.sichtbarHi;
        const f = this.worldFieldAt(x, z);
        const c = [stone[0], stone[1], stone[2]];
        const mix = (target, t) => {
            c[0] += (target[0] - c[0]) * t;
            c[1] += (target[1] - c[1]) * t;
            c[2] += (target[2] - c[2]) * t;
        };
        mix(earth, ss(0.25, 0.85, f.lebendig));
        // Feuchte schiebt den Boden Richtung dampEarth. Reihenfolge im mix-Stack ist Pflicht: nach earth, VOR
        // lava/snow/sed/strand. genVersion-Schleuse via _feuchteAt (< 2 → 0); Vertex-y ist die Surface.
        const feuchte = typeof this._feuchteAt === "function" ? this._feuchteAt(x, z, y) : 0;
        mix(dampEarth, ss(F_VIS_LO, F_VIS_HI, feuchte));
        // Kein Kronendach im Vertex: bis 06.10. dunkelte das Kronenlicht-Feld der Platzierung (`_canopyLightAt`, wo
        // Bäume wachsen DÜRFEN) den Boden × (0,58 + 0,46 · Licht) — zu 98 % ohne Baum darüber, unter einem Baum
        // zusätzlich zu seinem echten Schatten. Die Laubstreu unter den echten Kronen legt `_wegeBodenFarbe` auf.
        // Lichen: grüne Patina = feuchte × dichte (Stein, nicht Erde/Lava) × cluster (Flecken). Im Mix-Stack
        // NACH dampEarth, VOR lava/snow/sed/strand (die überschreiben den Stein). Schwellen in
        // AnazhRealm.LICHEN (der Worker spiegelt sie hardkodiert), die Farbe ist die Flechte der Palette.
        const LCH = AnazhRealm.LICHEN;
        const lichenCluster = (sandNoise.noise2D(x * 0.04 + 7.7, z * 0.04 - 3.3) + 1) * 0.5; // [0..1]
        const lichenMix =
            ss(LCH.feuchteLo, LCH.feuchteHi, feuchte) *
            ss(LCH.dichteLo, LCH.dichteHi, f.dichte || 0) *
            lichenCluster *
            LCH.strength;
        mix(P.flechte, lichenMix);
        mix(lava, ss(0.48, 1.02, f.glut) * 0.65); // dunkles Basalt, gekappt — kein flaches Rot
        // Der Magie-Akzent: Flecken (λ ≈ 11 m, ein Sechstel der Fläche, höchstens 30 %) in den Magie-Regionen — nie die Grundfarbe.
        const magieFleck = ss(0.6, 0.85, (sandNoise.noise2D(x * 0.09 + 3.1, z * 0.09 - 8.7) + 1) * 0.5);
        mix(violet, ss(0.55, 1.0, f.magieleitung) * magieFleck * 0.3);
        // Die Schneegrenze ist Gesetz (gelaende-core `schnee`: die Höhe über dem Meer, dieselbe Funktion ruft der Worker
        // in `attachFieldColors`) und liest den Pegel des Schnees (stoffe.K3-2): den Versatz, den die Welt trägt (`_schneeGilt`).
        mix(snow, globalThis.__gelaendeCore.schnee(this._gelaende(), y, x, z, this._schneeGilt()));
        // Der Seegrund: unter JEDEM Wasser (Meer, See, Fluss — der Spiegel des Orts) liegt Schlick, voll ab 4 m
        // Tiefe (bis V18.530 nur unter dem Meeresspiegel y < −2: die Bergseen lagen auf Wiese und Streu).
        // Schlick und Strand sind Ufer-Bänder über beiden Bezügen (`_waterLevelAt`): See/Meer voll, der Fluss mit seiner
        // Kronen-Blende — stetig über die Krone, wo der Fluss-Spiegel endet.
        const uf = { see: 0, fluss: null, ufer: 0 };
        this._waterLevelAt(x, z, uf);
        const aboveWater = y - uf.see;
        const aboveFluss = uf.fluss !== null ? y - uf.fluss : null;
        let schlick = ss(-0.5, -4, aboveWater);
        if (aboveFluss !== null) schlick = Math.max(schlick, uf.ufer * ss(-0.5, -4, aboveFluss));
        // Strand: Glocken-Profil über dem Wasser (`_waterLevelAt` O(1) für Ozean; See-Vertices bekommen den
        // See-Spiegel). Drei Noise-Modulationen statt einer Schwelle: (a) Breite (λ~570 m), (b) Intensität
        // (λ~290 m), (c) karge Fels-Patches ohne Sand. Die Glocke trägt bis 0,6 + 1,9 m — das Fenster schneidet sie nie
        // (bis Welle L endete es bei 2,0 m: ein Sprung im Strand jeder breiten Glocke).
        const imStrand = (a) => a !== null && a > -1.3 && a < 2.5;
        mix(sed, schlick);
        if (imStrand(aboveWater) || (uf.ufer > 0 && imStrand(aboveFluss))) {
            const widthNoise = (sandNoise.noise2D(x * 0.0018, z * 0.0018) + 1) * 0.5; // [0, 1]
            const intenseNoise = (sandNoise.noise2D(x * 0.0034 + 17, z * 0.0034 - 9) + 1) * 0.5;
            if (widthNoise > 0.18) {
                const width = 0.5 + 1.4 * widthNoise; // [0.5, 1.9] m
                const intensity = 0.25 + 0.55 * intenseNoise; // [0.25, 0.8]
                const glocke = (a) => Math.max(0, 1 - Math.abs(a - 0.6) / width);
                let shoreBlend = glocke(aboveWater);
                if (aboveFluss !== null) shoreBlend = Math.max(shoreBlend, uf.ufer * glocke(aboveFluss));
                mix(sand, shoreBlend * intensity);
            }
            // widthNoise <= 0.18 → karge Stelle, Sand bleibt aus (Stone/
            // Earth gewinnt). Spielt mit den V9.60-b.1-Hochseen zusammen:
            // jeder See hat sein eigenes Mix aus Sand-Strand und Fels-Ufer.
        }
        // V18.230 (Ω-OPSIS Säule II Ω-O6) — die PFADE: die Fluss-Bänke sind
        // getrampelte, gepackte Erde (Gras wird zusätzlich unterdrückt, s.
        // _buildVoxelChunkGrass). Lawful aus dem Drainage-Netz (_pathFieldAt).
        const pathF = this._pathFieldAt(x, z, y);
        if (pathF > 0.01) mix(packedDirt, pathF * 0.6);
        // DER WIESEN-GRUND (K53, `WIESEN_GRUND`): wo die Wache Grün sagt, deckt das Mittel des Halms den Grund, der Fleck
        // (λ 7,7 m) lässt karge Stellen.
        const WG = AnazhRealm.WIESEN_GRUND;
        const gruen = ss(0, WG.schwelle, c[1] - 0.5 * (c[0] + c[2]));
        if (gruen > 0) {
            const fleck = (sandNoise.noise2D(x * 0.13 + 5.3, z * 0.13 - 2.9) + 1) * 0.5;
            mix(WG.farbe, gruen * (0.5 + 0.5 * fleck));
        }
        out[0] = c[0];
        out[1] = c[1];
        out[2] = c[2];
        return out;
    }

    // Test-Chunk (`voxel test`): ein Voxel-Chunk wird neben dem Spieler gemesht und in die Szene gestellt
    // (begehbar über die feld-native Kollision); ein zweiter Aufruf ersetzt den alten.
    _spawnVoxelTestChunk() {
        if (!this.state.scene) return null;
        if (this._voxelTestMesh) {
            this.state.scene.remove(this._voxelTestMesh);
            // V10.0-j.f — Defer (WebGPU Submit-Race-frei).
            if (this._voxelTestMesh.geometry) this._queueDispose(this._voxelTestMesh.geometry);
            if (this._voxelTestMesh.material) this._queueDispose(this._voxelTestMesh.material);
            this._voxelTestMesh = null;
        }
        const pm = this.state.playerMesh;
        const px = pm ? pm.position.x : 0;
        const pz = pm ? pm.position.z : 0;
        const dim = 24;
        const stepSize = 1.6;
        const ox = px + 22;
        const oz = pz - dim * stepSize * 0.5;
        // V14.7 — das vertikale Band straddelt die ECHTE Oberfläche am Chunk-Zentrum
        // (vorher fix `base-20`; die V14.7-Massive heben surf weit über base → ein
        // festes Tiefband läge ganz unter Grund → leeres Mesh). Robust für jede Höhe.
        const oy = Math.round(this._terrainMacroSurfaceY(ox + dim * stepSize * 0.5, oz + dim * stepSize * 0.5)) - 20;
        const geom = this._voxelChunkGeometry(ox, oy, oz, dim, dim, dim, stepSize);
        if (!geom) {
            this.log("Voxel-Test: das Dichte-Feld war hier leer.", "INFO");
            return null;
        }
        this._attachVoxelFieldColors(geom);
        // V10.0-g — Voxel-Test-Mesh nutzt den ToonNodeMaterial-Helper (WebGPU-kompatibel).
        const mat = this._buildToonNodeMaterial({ vertexColors: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.name = "voxel-testchunk";
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.state.scene.add(mesh);
        this._voxelTestMesh = mesh;
        const vCount = geom.getAttribute("position").count;
        this.log(
            `Voxel-Test-Chunk gemesht: ${vCount} Vertices (Surface Nets) — begehbar (feld-native Kollision).`,
            "INFO"
        );
        return mesh;
    }

    // ### Der Voxel-Chunk-Ring ###
    // Voxel-Chunks streamen um den Spieler.

    // Konfiguration des Voxel-Chunk-Rings — eine Quelle der Wahrheit, optional per `lod`.
    // span = dim·step = 43.2 m ist LOD-invariant → Chunks sind über LOD-Grenzen world-aligned, ebenso die
    // vertikale Spanne. Jede gröbere LOD verdoppelt step (weniger Cells), Fog tarnt die Differenz;
    // Pad+Crop gilt nur innerhalb einer LOD. EINE Geometrie-Maschinerie (`_voxelChunkGeometry`),
    // mehrere step-Varianten.
    _voxelChunkConfig(lod = 0) {
        // ringRadius folgt dem Sicht-Ring-Regler (Default 4), beim Boot gedeckelt durch `_activeRingRadius`:
        // der startet klein und wächst, sobald der aktuelle Ring VOLL steht (`_ringWaechst`) — eine kleine
        // settled Basis statt 81 Chunks auf einmal.
        const targetRing = Math.max(1, Math.min(12, this.state.chunkRingRadius || 4));
        const activeRing = this.state._activeRingRadius != null ? this.state._activeRingRadius : targetRing;
        // Der Boot-Ring darf 0 sein (EIN Chunk, RING_RAMP_START=0) — ein `Math.max(1,…)`-Floor erzwänge 3×3.
        // Der Nebel/Void-Boden trägt den Rand, bis Ring 1 nachzieht.
        const ringRadius = Math.max(0, Math.min(targetRing, activeRing));
        // LOD-Pyramide: alle Stufen teilen Horizontal-Span (dim·step = 43.2 m) UND Vertikal-Span → LOD-
        // invariant; LOD2/LOD3 sind die fernen Ringe. Das Vertikal-Gitter ist FEST und ausgerichtet (kein
        // per-Chunk-`oy` — das bräche die Ausrichtung → neue Nähte): Band floorDrop 135 .. Decke +282.6
        // (417.6 m) umfasst Gipfel ~+247 m und Tiefsee bis ~−144 m; der Band-Skip hält die Hülle billig.
        if (lod >= 3) {
            // LOD 3 — step 14.4, dim 3 (64× weniger Cells als LOD0). Fernster Ring. span 29·14.4 = 417.6.
            return { dim: 3, step: 14.4, span: 43.2, ringRadius, dimY: 29, floorDrop: 135, lod: 3 };
        }
        if (lod >= 2) {
            // LOD 2 — step 7.2, dim 6 (16× weniger Cells als LOD0). span 58·7.2 = 417.6.
            return { dim: 6, step: 7.2, span: 43.2, ringRadius, dimY: 58, floorDrop: 135, lod: 2 };
        }
        if (lod >= 1) {
            // LOD 1 — Half-Resolution (8× weniger Cells). span 116·3.6 = 417.6.
            return { dim: 12, step: 3.6, span: 43.2, ringRadius, dimY: 116, floorDrop: 135, lod: 1 };
        }
        // LOD 0 — volle Auflösung, Band base−135 .. base+282.6; der Band-Skip sampelt nur um die Oberfläche
        // (die Hülle kostet nur Allokation). Vertikal-Span 232·1.8 = 116·3.6 = 58·7.2 = 29·14.4 = 417.6 m —
        // LOD-invariant, damit Wasser-Zellen/Cross-Chunk-Logik ausgerichtet bleiben.
        return { dim: 24, step: 1.8, span: 43.2, ringRadius, dimY: 232, floorDrop: 135, lod: 0 };
    }

    // ===== DIE DETAIL-KASKADE — die EINE Distanz-Quelle =====
    // EIN kamera-relatives Distanz-Feld (`r` = Chebyshev-Chunk-Distanz vom Spieler), das alle Welt-
    // Schichten für „wie viel Detail HIER" lesen (Farbe, Geometrie-LOD, Schatten, Deko/Kreaturen,
    // Draw-Calls). EINE frozen Tabelle (`DETAIL_CASCADE`); jedes Band-Feld braucht einen verifizierten
    // Leser. Alles ist `f(r)`, derived → kein State, kein Drift.
    _detailBand(r) {
        const c = AnazhRealm.DETAIL_CASCADE;
        for (let i = 0; i < c.length; i++) if (r <= c[i].maxRing) return c[i];
        return c[c.length - 1];
    }

    // DIE STUFE EINES CHUNKS (K51-2, CDLOD): aus dem KASTEN-Abstand des Spielers (px, pz in Metern) zum Chunk-Quadrat
    // (Chebyshev) — verfeinert, sobald er unter `bis + vorlauf` seiner Stufe fällt (`BODEN_STUFEN`), mit `currentLod`
    // (Streaming-Takt) hält die Hysterese einen feineren Chunk, bis der Abstand `bis + vorlauf + halt` erreicht. Der
    // Wechsel geschieht so nur, wo jeder Vertex des Chunks ganz auf der gröberen Fläche liegt (Gewicht 1, `_stufeGewicht`):
    // der Ring der Stufe-0-Zone (r ≤ 1) war für die CDLOD-Bedingung zu grob — ein Chunk-Ring trägt 2 Spannen Abstand.
    _voxelChunkLodFor(cx, cz, px, pz, currentLod = null) {
        const B = AnazhRealm.BODEN_STUFEN;
        const S = this._voxelChunkConfig(0).span;
        const d = Math.max(Math.max(cx * S - px, 0, px - (cx + 1) * S), Math.max(cz * S - pz, 0, pz - (cz + 1) * S));
        const st = B.stufen;
        let lod = st[st.length - 1].lod;
        for (let i = 0; i < st.length; i++)
            if (d < st[i].bis + B.vorlauf) {
                lod = st[i].lod;
                break;
            }
        // Hysterese nur beim VERGRÖBERN; verfeinern greift sofort — Detail erscheint prompt, nur das Entfernen ist träge
        if (currentLod === null || !Number.isFinite(currentLod) || currentLod >= lod) return lod;
        const halt = st.find((x) => x.lod === currentLod);
        return halt && d < halt.bis + B.vorlauf + B.halt ? currentLod : lod;
    }

    // DIE STUFEN-ZELLE (K51-3): wo sich die Wahl des Rings ändern KANN — die Spieler-Zelle und je Achse das Fach der Lage
    // in ihr zwischen den kritischen Brüchen. Der Kasten-Abstand zu einem Chunk ist je Achse i·S − f (vorne) oder
    // f + (|i| − 1)·S (hinten), er kreuzt eine Schwelle t (`bis + vorlauf`, `bis + vorlauf + halt`) nur bei f = S − t mod S
    // oder f = t mod S; dazwischen trägt jeder Chunk dieselbe Stufe. Der Stempel der Strom-Wache (`_tickVoxelStreaming`) und
    // die Gehen-Probe der Stand-Linse lesen sie: Gehen kostet die Änderung, nie die 2-m-Spur.
    _stufenZelle(px, pz) {
        const B = AnazhRealm.BODEN_STUFEN;
        const S = this._voxelChunkConfig(0).span;
        const cx = Math.floor(px / S),
            cz = Math.floor(pz / S);
        const fach = (f) => {
            let n = 0;
            for (const s of B.stufen) {
                if (!(s.bis < Infinity)) continue;
                for (const t of [s.bis + B.vorlauf, s.bis + B.vorlauf + B.halt]) {
                    const m = t % S;
                    if (f >= m) n++;
                    if (f >= S - m) n++;
                }
            }
            return n;
        };
        return cx + "," + cz + ":" + fach(px - cx * S) + "," + fach(pz - cz * S);
    }

    // DAS GEWICHT DER STUFE am Welt-Punkt (x, z): 0 im Inneren der Stufe `lod`, 1 an ihrer Grenze `bis` — smoothstep über das
    // Übergangs-Band `band` im Chebyshev-Abstand zum Auge der Stufen (`state.stufeAuge`, der Spieler des Streaming-Takts).
    // Der CPU-Spiegel des Boden-Stoffs (`_buildPbrNodeMaterial` geomorph); Leser: der Boden-Leser und die Sprung-Linse.
    _stufeGewicht(lod, x, z) {
        const st = AnazhRealm.BODEN_STUFEN.stufen[Math.min(2, Math.max(0, lod | 0))];
        const a = this.state.stufeAuge;
        if (!a || !(st.bis < Infinity)) return 0;
        const d = Math.max(Math.abs(x - a.x), Math.abs(z - a.z));
        const t = Math.max(0, Math.min(1, (d - (st.bis - st.band)) / st.band));
        return t * t * (3 - 2 * t);
    }

    // DER MORPH-CODE DES BODENS (K51-2): EIN Float je Vertex (`aMorphWeight`) trägt die Stufe des Chunks und das Naht-Gewicht
    // (0…1, `_applyCrossLodGeomorph`) — 2 · Stufe + Naht. Der Stoff liest beide: die Stufe wählt das Übergangs-Band, die Naht
    // zieht die Grenz-Zeile an den gröberen Nachbarn; der Faktor ist Naht + Stufe − Naht · Stufe (`_morphFaktor`).
    _morphCode(lod, naht) {
        return 2 * (lod | 0) + Math.max(0, Math.min(1, naht || 0));
    }
    _morphNaht(code) {
        return code - 2 * Math.floor(code * 0.5);
    }
    _morphFaktor(code, x, z) {
        const s = this._morphNaht(code);
        const w = this._stufeGewicht(Math.floor(code * 0.5), x, z);
        const U = this.state.atmoUniforms;
        const gm = U && U.geomorph ? U.geomorph.value : 1;
        return (s + w - s * w) * gm;
    }
    // das Gewicht, das der Stoff zeichnet: das der Stufe × der Geomorph-Regler (Leser: der Boden-Leser, der Fuß der Streu)
    _stufeGewichtAuge(lod, x, z) {
        const U = this.state.atmoUniforms;
        return this._stufeGewicht(lod, x, z) * (U && U.geomorph ? U.geomorph.value : 1);
    }

    // DAS AUGE DER STUFEN: der Spieler des Streaming-Takts — die Stufen-Wahl und der Boden-Stoff lesen denselben Punkt
    _stufeAugeTakt(p) {
        const a = this.state.stufeAuge || (this.state.stufeAuge = { x: 0, z: 0 });
        a.x = p.x;
        a.z = p.z;
        const U = this.state.atmoUniforms;
        if (U && U.stufeAuge) U.stufeAuge.value.set(p.x, p.z);
        this._streuFussAuge(); // der Fuß der Streu folgt demselben Auge wie der Geomorph des Stoffs (Gelände H5)
    }

    // DAS ZIEL DER GRÖBEREN STUFE im Sync-Bau (Spiegel von `stufeZielNetz` im voxel-worker): das Netz der Stufe `grobLod` um
    // den Chunk-Ursprung mit einer Zelle Polster vor der Kante, die Ziele über das EINE Gesetz (gelaende-core `stufeZiel`)
    _stufeZielNetz(fein, feinNormal, feinFarbe, cx, cz, grobLod) {
        const g = this._voxelChunkConfig(grobLod);
        const gs = g.step;
        const ox = cx * g.span - 2 * gs;
        const oz = cz * g.span - 2 * gs;
        const oy = (this.state.terrainBaseHeight || 0) - g.floorDrop;
        const gd = g.dim + 4;
        const dichte = this._voxelEditedDensityGrid(`${cx},${cz},${grobLod},ziel`, ox, oy, oz, gd, g.dimY, gd, gs);
        const hoehle = this._voxelHoehlenGraph(dichte, ox, oy, oz, gd, g.dimY, gd, gs);
        const geo = this._voxelChunkGeometry(ox, oy, oz, gd, g.dimY, gd, gs, undefined, 1, dichte, 1, hoehle);
        const G = globalThis.__gelaendeCore;
        const leer = new Float32Array(0);
        if (!geo)
            return G.stufeZiel(fein, leer, new Uint32Array(0), gs, [
                { fein: feinNormal, grob: leer, einheit: true },
                { fein: feinFarbe, grob: leer },
            ]);
        this._attachVoxelFieldColors(geo);
        const A = geo.attributes;
        const ziel = G.stufeZiel(fein, A.position.array, geo.index.array, gs, [
            { fein: feinNormal, grob: A.normal.array, einheit: true },
            { fein: feinFarbe, grob: A.color.array },
        ]);
        geo.dispose();
        return ziel;
    }

    // Inline-Kollision beim Stream (`buildBVH`)? Entscheidet die Chebyshev-Distanz r zum Spieler-Chunk.
    _voxelChunkLazyBVHFor(cx, cz, pcx, pcz) {
        const r = Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz));
        // NUR der Spieler-Chunk (r===0) baut inline — ein Kollisions-Baum kostet ~10 ms/Chunk, 9 inline in
        // einem Frame waren ein ~300-ms-Lauf-Spike.
        return r === 0;
    }

    // explore-Magnitude emergiert aus Neuheit (erste Begegnung > Wiederkehr) + Distanz vom Ursprung +
    // Kühnheit (karge/glut-Aura via auraAt): ein neuer, ferner, karger Vorstoß bewegt viel, vertrautes
    // Pendeln wenig. `state.visitedRegions` ist reaktiv (nicht persistiert), bounded.
    _exploreMagnitude(pcx, pcz) {
        const cfg = AnazhRealm.EXPLORE;
        if (!this.state.visitedRegions) this.state.visitedRegions = new Set();
        const regions = this.state.visitedRegions;
        const key = pcx + "," + pcz;
        const novel = !regions.has(key);
        regions.add(key);
        if (regions.size > cfg.maxRegions) {
            const it = regions.values(); // Set hält Insertion-Order → die ältesten zuerst
            for (let i = 0; i < cfg.pruneRegions; i++) {
                const next = it.next();
                if (next.done) break;
                regions.delete(next.value);
            }
        }
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const dist = pm ? Math.hypot(pm.x, pm.z) : 0;
        const distTerm = Math.min(1, dist / cfg.distScale) * cfg.distWeight; // das epische Reisen
        let boldTerm = 0;
        if (pm) {
            const aura = this.auraAt(pm.x, pm.z, performance.now() / 1000);
            const bold = Math.max(0, Math.min(1, (1 - (aura.lebendig || 0)) * 0.5 + (aura.glut || 0) * 0.5));
            boldTerm = bold * cfg.boldWeight; // Kühnheit: in das Karge/Glühende wagen
        }
        const noveltyTerm = novel ? cfg.noveltyNew : cfg.noveltyRevisit;
        return Math.max(cfg.min, Math.min(cfg.max, cfg.base + noveltyTerm + distTerm + boldTerm));
    }

    // Der gebaute zusammenhängende Ring: größtes k, dessen Ringe 0..k VOLL stehen (mesh ODER empty;
    // pending/fehlend bricht; ≤ ~81 Map-Gets); null solange der Spieler-Chunk unbekannt ist.
    _builtRingRadius() {
        const st = this.state;
        if (!st || !st.voxelChunks || !st.lastPlayerVoxelChunk) return null;
        const cfg = this._voxelChunkConfig();
        const { cx, cz } = st.lastPlayerVoxelChunk;
        let k = -1;
        outer: for (let ring = 0; ring <= cfg.ringRadius; ring++) {
            for (let dx = -ring; dx <= ring; dx++) {
                for (let dz = -ring; dz <= ring; dz++) {
                    if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
                    const e = st.voxelChunks.get(`${cx + dx},${cz + dz}`);
                    if (!e || (!e.mesh && !e.empty)) break outer;
                }
            }
            k = ring;
        }
        return k;
    }

    // DER RING IST EXISTENZ (Lehre 13): der aktive Ring wächst bis zu seinem Ziel (`chunkRingRadius`, der Regler des Spielers
    // unter dem Holz-Deckel), eine Schale, sobald die jetzige steht (gebaut, kein Rückstau, das Gras nach) — nie an Bildrate
    // oder Regler und nie zurück unter Last (Gebot 7: die Kosten tragen Schirm und Änderung, nie die Größe der Welt). Unter
    // dem Ladeschirm springt er auf den Boden des ersten Weltbilds (`RING_EXIST_FLOOR`), die Arbeit trägt der Strom; headless
    // steht er sofort am Ziel. Der Strom ruft ihn je Takt (prio 0). Bis hierher wuchs er im Aktuator des PID: über dem Boden
    // nur bei anhaltendem Kopfraum (frameMs < 13 ms, an 60 Hz nie) und gar nicht bei ruhendem Regler (`__weltStehtNach`) —
    // die Mess-Wiese stand auf der Radeon mit Ring 2 von 4 und 89–95 Streu-Kontakten (gelaende.K5#2).
    _ringWaechst() {
        const st = this.state;
        const ziel = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
        let ring = Math.min(ziel, st._activeRingRadius ?? AnazhRealm.RING_RAMP_START);
        if (st.renderer && st.renderer._isHeadlessNull) ring = ziel;
        else if (this._ladeTakt()) ring = Math.max(ring, Math.min(ziel, AnazhRealm.RING_EXIST_FLOOR));
        else if (
            ring < ziel &&
            (this._builtRingRadius() ?? -1) >= ring &&
            !(st.voxelMeshPending && st.voxelMeshPending.size) &&
            !(st.pendingGrass && st.pendingGrass.size)
        )
            ring++;
        st._activeRingRadius = ring;
    }

    _setLastPlayerVoxelChunk(pcx, pcz) {
        if (!this.state) return;
        // Erkundung: betritt der Spieler einen anderen Chunk, heben sich awe + hope — rate-limitiert (~6 s)
        // und graduiert über `_exploreMagnitude` (Neuheit + Distanz + Kühnheit).
        const prev = this.state.lastPlayerVoxelChunk;
        if (prev && (prev.cx !== pcx || prev.cz !== pcz)) {
            const now = performance.now() / 1000;
            if (now - (this.state.lastExploreFelt ?? -Infinity) >= 6) {
                this.state.lastExploreFelt = now;
                this._feelAction("explore", { magnitude: this._exploreMagnitude(pcx, pcz) });
            }
        }
        this.state.lastPlayerVoxelChunk = { cx: pcx, cz: pcz };
    }

    // DER FELS-STOFF DER WELT (K17): das EINE Gesetz (gelaende-core `FELS`, `felsFarbe`) mit dem Stein der Boden-Palette als
    // Grundton (`felsBasis`: die dunkle Lage und die helle Bank aus ihm), der Kante des Nah-Netzes (1,8 m: was es nicht trägt,
    // trägt sein Mittel) und dem Mittel für die Ferne (`felsMittel`). Ohne den Kern bricht der Boden laut (Kern-Pflicht).
    static get FELS_STOFF() {
        const GK = globalThis.__gelaendeCore;
        if (
            !GK ||
            typeof GK.felsFarbe !== "function" ||
            typeof GK.felsKruemmung !== "function" ||
            typeof GK.felsFein !== "function" ||
            typeof GK.schuttKorn !== "function" ||
            !GK.FELS
        )
            AnazhRealm._kernPflichtBruch("gelaende:felsFarbe");
        const basis = GK.felsBasis(AnazhRealm.BODEN_FARBE.rock);
        const G = AnazhRealm.TERRAIN_GEOLOGY;
        return this._einmal(
            "FELS_STOFF",
            Object.freeze({
                gesetz: GK.FELS,
                basis,
                // die Kante des Nah-Netzes (1,8 m) lebt EINMAL in `netz.fuss` (bis K17-2 NB1 stand ein ungelesener Zwilling daneben)
                // die Geologie des Boden-Netzes für gelaende-core `felsStoff` — der Stamm (Sync-Bau) und der voxel-worker (der
                // Init-Schnappschuss `felsStoff`) lesen DIESELBEN Zahlen
                netz: Object.freeze({
                    rockLo: G.rockLo,
                    rockHi: G.rockHi,
                    schuttKandidat: G.schuttKandidat,
                    schuttGitter: G.schuttGitter,
                    schutt: G.schutt,
                    fuss: 1.8,
                }),
                mittel: Object.freeze(GK.felsMittel(basis)),
                mittelWerte: GK.felsMittelWerte(),
            })
        );
    }

    // DER BODEN-UMZUG (K16, Schöpfer-Entscheid §5.4): ein Save einer anderen Boden-Generation (vor K16: keine) schrieb seine
    // Höhen auf einen Boden, den es nicht mehr gibt (Basis → K16 im Umkreis ±500 m: |Δh| p50 37,7 m). Jeder Bau und der
    // Spieler stehen nach dem Laden auf dem Boden des Gesetzes in ihrer Höhe über Grund — `ueberGrund` des Saves, sonst die
    // Fuß-Höhe, auf der jeder Bau und jeder Spieler gesetzt wird (`PLAYER_FOOT_OFFSET`). Liefert die neuen Höhen je Bau-Index
    // (null: derselbe Boden) und nennt die Zahl (`state.bodenUmzug`, Log): wie viele Bauten sich bewegen, um wie viel.
    _bodenUmzug(state) {
        const gen = globalThis.__gelaendeCore.BODEN_GENERATION;
        if (!state || state.bodenGeneration === gen) return null;
        const fuss = AnazhRealm.PLAYER_FOOT_OFFSET;
        const hoehen = new Map();
        const dh = [];
        const liste = Array.isArray(state.architectures) ? state.architectures : [];
        // DIE ALTEN ORTE ZUERST (K10): der Erdbau des alten Bodens fällt (seine Höhen standen auf einem Gelände, das es nicht
        // mehr gibt), die Häuser jedes Orts legen ihre Platten auf den neuen Boden in ihrer Höhe über Grund — erst danach fallen
        // die Höhen aller Bauten, auf dem geerdeten Grund (vorher stand der Baum am Rand eines Orts bis 2,28 m neben seinem Boden).
        const wmU = this.state.worldMeta;
        if (wmU && wmU.erdbau) {
            delete wmU.erdbau;
            this._erdbauStand = (this._erdbauStand || 0) + 1;
        }
        // DIE GRUBEN ZIEHEN MIT, vor den Bauten (die auf dem gegrabenen Grund stehen): der Hieb traf den alten Boden, die oberste
        // Grube (die unterste Schüttung) einer Säule lag an ihm. Jeder Edit steht danach in seiner Lage zu ihr auf dem Gesetz
        // (`_terrainMacroSurfaceY`, ohne Edits) — bis 24.10. blieb er in der Höhe des alten Bodens, ~30 m unter dem neuen (der
        // Korpus, speicher.K5: kein Loch des Spielers kam sichtbar zurück).
        const eds = wmU && Array.isArray(wmU.voxelEdits) ? wmU.voxelEdits : [];
        const zelle = new Map();
        const schluessel = (x, z) => Math.floor(x / 4) + "," + Math.floor(z / 4);
        for (const e of eds) zelle.set(schluessel(e.x, e.z), (zelle.get(schluessel(e.x, e.z)) || []).concat(e));
        if (eds.length)
            wmU.voxelEdits = eds.map((e) => {
                const fuellt = e.mode === "fill";
                let ref = e.y;
                for (let i = -4; i <= 4; i += 4)
                    for (let j = -4; j <= 4; j += 4)
                        for (const f of zelle.get(schluessel(e.x + i, e.z + j)) || [])
                            if ((f.mode === "fill") === fuellt && Math.hypot(f.x - e.x, f.z - e.z) < f.r)
                                ref = fuellt ? Math.min(ref, f.y) : Math.max(ref, f.y);
                return { ...e, y: this._terrainMacroSurfaceY(e.x, e.z) + e.y - ref };
            });
        const geerdet = this._erdbauAltOrte(liste, (a) => {
            const p = a.position;
            const g = Number.isFinite(p.x) && Number.isFinite(p.z) ? this._voxelSurfaceY(p.x, p.z) : NaN;
            return g + (Number.isFinite(a.ueberGrund) ? a.ueberGrund : fuss);
        });
        for (let i = 0; i < liste.length; i++) {
            const a = liste[i];
            const p = a && a.position;
            if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.z)) continue;
            const g = this._voxelSurfaceY(p.x, p.z);
            if (!Number.isFinite(g)) continue;
            const y = g + (Number.isFinite(a.ueberGrund) ? a.ueberGrund : fuss);
            hoehen.set(i, y);
            dh.push(Number.isFinite(p.y) ? Math.abs(y - p.y) : 0);
        }
        let spieler = null;
        const pm = this.state.playerMesh;
        if (pm && state.playerPosition) {
            const g = this._voxelSurfaceY(pm.position.x, pm.position.z);
            if (Number.isFinite(g)) {
                const y = g + (Number.isFinite(state.spielerUeberGrund) ? state.spielerUeberGrund : fuss);
                spieler = Math.round((y - pm.position.y) * 100) / 100;
                pm.position.y = y;
            }
        }
        dh.sort((p, q) => p - q);
        const q = (f) =>
            dh.length ? Math.round(dh[Math.min(dh.length - 1, Math.floor(f * dh.length))] * 100) / 100 : 0;
        const bericht = {
            von: Number.isFinite(state.bodenGeneration) ? state.bodenGeneration : 0,
            nach: gen,
            bauten: dh.length,
            bewegt: dh.filter((d) => d > 0.05).length,
            geerdet,
            dhP50: q(0.5),
            dhMax: q(1),
            spieler,
        };
        this.state.bodenUmzug = bericht;
        this.log(
            `BODEN-UMZUG: ${bericht.bewegt} von ${bericht.bauten} Bauten stehen auf dem Boden der Generation ${gen} ` +
                `(|Δh| p50 ${bericht.dhP50} m, max ${bericht.dhMax} m), der Spieler ${spieler} m`,
            "INFO"
        );
        return hoehen;
    }
    // Der Same, dessen Gestalt der Ort wählt (K20): `_foundryVariantFor` liest h = Same × 2654435761 in T Eimern; der Ort
    // legt den Eimer fest (frei: der Solitär T, Bestand: 1..T−1 = die V Bestand-Gestalten nach dem eigenen Wurf), die Lage
    // im Eimer bleibt die des Samens, und das Inverse des Knuth-Faktors gibt den Samen zurück. Synchron am Spawn aus dem
    // Kern (der Bestand pflanzt vor dem Buch). Eine Art ohne Solitär behält ihren Samen; `stehtFrei` fragt den Ort nur dann.
    _foundryGestaltSame(seed, preset, stehtFrei) {
        if (!AnazhRealm._ortWaehlt(preset)) return seed >>> 0;
        const T = AnazhRealm._studioGestaltenKern(preset);
        const h = Math.imul(seed >>> 0 || 0, 2654435761) >>> 0;
        const lage = h / 4294967296;
        const eimer = stehtFrei() ? T - 1 : Math.floor(lage * (T - 1));
        const h2 = Math.ceil((eimer * 4294967296) / T) + Math.floor(lage * (Math.floor(4294967296 / T) - 1));
        return Math.imul(h2 >>> 0, AnazhRealm.KNUTH_INVERS) >>> 0;
    }

    // ### 6.G3.c — Fauna-Lifecycle ###

    // Raycast-Helper: der Aufrufer übergibt einen Extractor (Normale, hitPoint oder nur hasHit) —
    // der Lifecycle bleibt in dieser EINEN Funktion. `o` reicht die Optionen des Feld-Strahls durch (`_fieldRaycast`).
    _runRaycast(rayStart, rayEnd, extractor, o) {
        // Feld-nativer Raycast (DDA durch das Dichtefeld + Struktur-Box-Ray, kein Ammo). Ein synthetisches
        // `cb` mit derselben Schnittstelle (get_m_hitPointWorld/get_m_hitNormalWorld/hasHit) hält alle
        // Aufrufer unverändert. rayStart/rayEnd in skalierten Einheiten → × sf rein, ÷ sf im cb raus.
        const sf = this.state.scaleFactor || 1;
        const rc = this._fieldRaycast(
            rayStart.x() * sf,
            rayStart.y() * sf,
            rayStart.z() * sf,
            rayEnd.x() * sf,
            rayEnd.y() * sf,
            rayEnd.z() * sf,
            o
        );
        const cb = {
            get_m_hitPointWorld: () => ({ x: () => rc.x / sf, y: () => rc.y / sf, z: () => rc.z / sf }),
            get_m_hitNormalWorld: () => ({ x: () => rc.nx, y: () => rc.ny, z: () => rc.nz }),
            hasHit: () => rc.hit,
        };
        return extractor(cb, rc.hit);
    }

    // Voxel ist permanent: getTerrainHeightAt/findSurfaceAbove lesen nur den Voxel-Pfad; Default
    // `terrainBaseHeight || 0`, falls `_voxelSurfaceY` nicht-finit ist (vor Welt-Aufbau, Edge-Case).
    getTerrainHeightAt(x, z) {
        const vy = this._voxelSurfaceY(x, z);
        if (typeof vy === "number" && Number.isFinite(vy)) return vy;
        return this.state.terrainBaseHeight || 0;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_gelaende_boden]);

// ===== ATLAS · Gelaende/boden — Außen-Konstanten =====
// Die leere Edit-Liste eines Chunks ohne Edits (`_voxelEditsNah`, `_voxelEditsImKasten`): eingefroren, nie beschrieben.
AnazhRealm.KEINE_EDITS = Object.freeze([]);
// DER RING (`_ringWaechst`): er beginnt beim Boot mit EINEM Chunk (V18.397, Schöpfer „1 Chunk statt 9!" — ein großer
// Start-Ring von 25 Chunks fror den Boot ein; der Fern-Ring und `_softFloorWhileChunkLoading` tragen den Rand) und springt
// unter dem Ladeschirm auf den Boden des ersten Weltbilds (2 = 5×5 Chunks, `_weltbildLuecken`; auf kienspan zugleich das Ziel).
AnazhRealm.RING_RAMP_START = 0;
AnazhRealm.RING_EXIST_FLOOR = 2;
// DIE ORT-WAHL eines Plans (K10, `_ortWahl`): Ringe um den Wunsch-Anker (`ringe` × `schrittM` = 128 m, die halbe
// Siedlungs-Zelle fachwerk `SIEDLUNG.cellM`; auf jedem Ring Orte im Abstand ≤ `schrittM`), der nächste Ort, an dem der Plan
// jedes Haus trägt (Ort-Faden `ortTraegt`, am Wirt `_ortTraegtWirt`), gewinnt. `grobM`: das Raster des ersten Urteils (die
// Wand urteilt im halben Meter). `bodenTolM`: so weit darf die Gestalt des Gewässers (gelaende-core `gewaesserForm`) den Boden des Plans
// unter einem Haus verschieben. `trasseRunden`: so oft rechnet der Export am gewählten Ort neu (`_ortMitTrasse`, siedlung.K3).
AnazhRealm.ORT_WAHL = Object.freeze({ schrittM: 16, ringe: 8, grobM: 2, bodenTolM: 0.05, trasseRunden: 6 });

// DIE BODEN-STUFEN (K51, K51-2 CDLOD) — die Stufen-Kette des Chunk-Netzes (`_voxelChunkConfig(lod)`: Schritt 1,8 · 3,6 · 7,2 ·
// 14,4 m) nach dem KASTEN-Abstand des Spielers zum Chunk-Quadrat (Chebyshev, `_voxelChunkLodFor`): `bis` die Grenze der Stufe,
// `band` ihr Übergangs-Band davor — darin wandert jeder Vertex stetig auf das Netz der nächst gröberen Stufe (`stufeZiel`,
// `_stufeGewicht`), an `bis` liegt er ganz auf ihr. Verfeinert wird unter `bis + vorlauf` (der Bau hat den Vorlauf Zeit, das
// feine Netz erscheint ganz gemorpht), vergröbert erst ab `bis + vorlauf + halt` (Hysterese). Die CDLOD-Bedingung: ein Chunk
// der Stufe L reicht bis `bis(L) + vorlauf + halt + Spanne + Saum-Zelle` — dort darf das Band von L+1 noch nicht beginnen
// (36 + 7 + 43,2 + 1,8 = 88 ≤ 100 − 12; 100 + 7 + 43,2 + 3,6 = 153,8 ≤ 388,8 − 40). Die Ring-Kette (K51: L0 bis Ring 1, L1
// Ring 2) konnte sie nie halten — ein Ring trägt zwei Spannen Abstand, der Wechsel sprang sichtbar bei 43–65 m (Gang über die
// Kante an der Mess-Wiese, Radeon: p99,9 der Luma-Änderung 17 gegen 5 im Rauschen). Stufe 0 trägt das Auge bis 24 m ganz
// (Nah-Wiese 14 m, Nah-Streu 24 m, `_bodenSichtAt`), Stufe 3 erst jenseits 388,8 m (Ring 10).
AnazhRealm.BODEN_STUFEN = Object.freeze({
    vorlauf: 3,
    halt: 4,
    stufen: Object.freeze([
        Object.freeze({ lod: 0, bis: 36, band: 12 }),
        Object.freeze({ lod: 1, bis: 100, band: 12 }),
        Object.freeze({ lod: 2, bis: 388.8, band: 40 }),
        Object.freeze({ lod: 3, bis: Infinity, band: 0 }),
    ]),
});

// LICHEN: grüne Patina auf alten/feuchten Steinen — reine Render-Schicht im
// `_bodenFarbeAt`-Mix-Stack (kein Tag). Der Worker hardkodiert diese Schwellen
// spiegelbildlich (bit-Vertrag: jede Änderung in BEIDE); die Farbe ist die Flechte der Boden-Palette.
AnazhRealm.LICHEN = Object.freeze({
    // Feuchte muss ≥ feuchteLo sein für Lichen-Wachstum (trockene Steine bleiben blank).
    feuchteLo: 0.5,
    feuchteHi: 0.9,
    // Dichte (Stein-Achse) muss ≥ dichteLo sein (kein Lichen auf Erde/Glut/Quarz).
    dichteLo: 0.5,
    dichteHi: 0.85,
    // Maximaler Mix-Anteil (sehr subtil — Lichen ist eine Tönung, kein
    // Decken-Anstrich).
    strength: 0.22,
});
// Compound-Bonus-Faktoren (SPATIAL_*_BONUS, weiter unten): multiplikativ auf die aggregierten
// Compound-Tags nach Standard-MAX, konservativ — der große Effekt entsteht aus der Kombination.
// MACRO_ANKER wohnt im Gelände-Gesetzbuch (gelaende-core.js, K09a).
// FEUCHTE (unten) — die fünfte Welt-Stimme (aus der Hydrosphäre abgeleitet, nicht Noise).
AnazhRealm.FEUCHTE = Object.freeze({
    flussReichweite: 26, // m jenseits der Fluss-Halbbreite, smoothstep-Fade
    hoeheNah: 1.5, // ≤ so hoch überm Wasserspiegel = voll feucht (Niederung)
    hoeheFern: 7, // ab so hoch überm Spiegel = trocken (der Höhen-Fade)
    hoeheGewicht: 0.85, // V6 (Look-Finale, 3): 0.6→0.85 — das FEUCHTE-DACH gehoben (breitere, sattere Niederungen → dichtere Wald-/Wiesen-Nähe); bit-identisch im Worker FEUCHTE_HOEHE_GEWICHT
    affinitaetGewicht: 0.8, // feuchte × lebendig in der Spawn-Affinität
    erdeGewicht: 0.35, // Γ1-Lesart Boden: feuchte hebt die erde-Achse beim Graben
    // Feuchte sichtbar: Vertex-Color-Mix einer dunkleren, satteren Erd-Schicht über der lebendig-Erde —
    // ein Ufer liest sich als Ufer, auch ohne Wasser im Frame. sichtbarLo/sichtbarHi = schmale, deutliche
    // Kurve (Niederungen kippen, trockener Boden bleibt earth). Bit-identisch im Worker
    // `attachFieldColors` (dort hardkodiert — jede Änderung in BEIDE).
    sichtbarLo: 0.3,
    sichtbarHi: 0.85,
});
// Der Keil der Hüllen-Form im Welt-March: die First-Kante → der Typ der Kapsel-Liste (pB.w; 0 Kasten · 1 Ellipsoid). Der
// Walm (0..1) reist im Bruchteil (Typ + 0,49 · walm), das WGSL (`sdKeil`) schneidet die zwei Stirnen mit der Dach-Neigung.
AnazhRealm.HUELLE_KEIL_TYP = Object.freeze({ "+z": 2, "-z": 3, "+x": 4, "-x": 5 });

// === Der emotionale Kern — das ABENTEUER GRADUIERT ===
// Die explore-Magnitude emergiert aus NEUHEIT (erste Begegnung mit einer Region,
// `state.visitedRegions`), DISTANZ vom Ursprung und KÜHNHEIT (in eine karge/glut-Aura wagen, via
// auraAt). Die Appraisal wertet das Ziel, dies den Akt des Wagens.
AnazhRealm.EXPLORE = Object.freeze({
    base: 0.3, // der Grund-Beitrag jedes Chunk-Wechsels
    noveltyNew: 0.7, // erste Begegnung mit einer Region → starkes Staunen
    noveltyRevisit: 0.05, // Wiederkehr → kaum (du kennst den Ort)
    distScale: 600, // m — die Distanz vom Ursprung, ab der das Reisen episch wird
    distWeight: 0.4, // der Distanz-Beitrag (geklemmt auf 1× distWeight)
    boldWeight: 0.5, // die Kühnheit (karge/glut-Aura) als Mut-Beitrag
    min: 0.3,
    max: 1.8, // ein neuer, ferner, karger Wagnis bewegt ~6× ein vertrautes Pendeln
    maxRegions: 4000, // die visitedRegions-Map bounded halten
    pruneRegions: 1000, // beim Überlauf die ältesten Regionen vergessen
});
