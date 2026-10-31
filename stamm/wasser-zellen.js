class AnazhRealm_wasser_zellen {
    // ===== ATLAS · Wasser/zellen — Wasser-Zellen · Sheet · Iso · Wasser-CA · Stau =====
    // Cell-Feld: Uint8Array (0=air, 1=water, 2=solid), Index `i + k·dim + j·dim·dim`, deterministisch.
    // Trägt der Chunk-Footprint überhaupt Wasser? Wenn nein, entfallen ~71k Dichte-Samples pro Chunk.
    // Atlas-Strict (Wasser kommt aus Seed/Atlas, nie aus lokaler Geometrie-Heuristik): (1) ein Voxel-
    // Carve unter waterLevel berührt den Footprint (Spieler-Pool); (2) der Atlas hat eine Ozean-
    // (waterKind 1) oder See-Zelle (2) im Footprint (+1 Cell Marge); (3) ein Fluss-Bucket im Footprint.
    _voxelChunkHasAnyWater(cx, cz) {
        const { span } = this._voxelChunkConfig();
        const ox = cx * span;
        const oz = cz * span;
        const waterLevel = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
        // (1) Voxel-Carve unter waterLevel im xz-Footprint — Spieler-Wille
        // überschreibt Atlas (Hochland-Pool emergiert lokal). Gefragt wird die Karte des Chunks.
        const edits = this._voxelEditsNah(cx, cz);
        if (edits.length) {
            for (let e = 0; e < edits.length; e++) {
                const ed = edits[e];
                if (!ed || ed.mode !== "carve") continue;
                const r = ed.r;
                if (!Number.isFinite(r) || r <= 0) continue;
                if (ed.y - r >= waterLevel) continue;
                if (ed.x + r < ox || ed.x - r > ox + span) continue;
                if (ed.z + r < oz || ed.z - r > oz + span) continue;
                return true;
            }
        }
        const hHome = this.state.hydrosphere;
        if (!hHome || !hHome.ready) return false;
        // A3 (V18.132) — der Chunk kann eine KACHEL-Grenze queren: alle
        // Regionen sammeln, die sein Footprint (+1-Cell-Marge) beruehrt
        // (Heimat + bis zu 4 Kacheln via die 4 Ecken; dedupe per Identitaet).
        const regions = [];
        for (const [px, pz] of [
            [ox, oz],
            [ox + span, oz],
            [ox, oz + span],
            [ox + span, oz + span],
        ]) {
            const hr = this._hydroFor(px, pz);
            if (hr && hr.ready && regions.indexOf(hr) < 0) regions.push(hr);
        }
        for (const h of regions) {
            // (2) Atlas-Marker: Ozean (kind === 1) ODER See (kind === 2) im
            // Chunk-Footprint (+1 Cell Marge für Boundary-Continuität — der
            // 16-m-Atlas-Cell-Raster liegt nicht perfekt auf dem Chunk-Raster).
            if (h.water && h.water.waterKind) {
                const c0i = Math.floor((ox - h.originX) / h.cell) - 1;
                const c1i = Math.floor((ox + span - h.originX) / h.cell) + 1;
                const c0j = Math.floor((oz - h.originZ) / h.cell) - 1;
                const c1j = Math.floor((oz + span - h.originZ) / h.cell) + 1;
                const wK = h.water.waterKind;
                for (let cj = c0j; cj <= c1j; cj++) {
                    for (let ci = c0i; ci <= c1i; ci++) {
                        if (ci < 0 || cj < 0 || ci >= h.dim || cj >= h.dim) continue;
                        const kind = wK[ci + cj * h.dim];
                        if (kind === 1 || kind === 2) return true;
                    }
                }
            }
            // (3) Fluss-Bucket im Footprint
            if (h.kanal) {
                const b0i = Math.floor((ox - h.originX) / h.bucketSize);
                const b1i = Math.floor((ox + span - h.originX) / h.bucketSize);
                const b0j = Math.floor((oz - h.originZ) / h.bucketSize);
                const b1j = Math.floor((oz + span - h.originZ) / h.bucketSize);
                for (let bj = b0j; bj <= b1j; bj++) {
                    for (let bi = b0i; bi <= b1i; bi++) {
                        if (bi < 0 || bj < 0 || bi >= h.bucketsDim || bj >= h.bucketsDim) continue;
                        const kb = bi + bj * h.bucketsDim;
                        if (h.kanal.ab[kb + 1] > h.kanal.ab[kb]) return true;
                    }
                }
            }
        }
        // (4) Makro-Dip-Predicate für Wasser jenseits des Atlas: der globale Ozean jenseits der ±1024-Region
        // und Küsten-Aquifer (Roughness-Senken, die der 16-m-Atlas nicht sieht). Dippt das Makro-Terrain im
        // 5×5-Raster unter waterLevel + Marge, kann der Chunk Wasser tragen. Marge ≥ Roughness (±12 m) →
        // keine false-negatives; ein false-positive kostet nur einen leeren Zellen-Build.
        const OCEAN_GATE_MARGIN = 16;
        {
            const thr = waterLevel + OCEAN_GATE_MARGIN;
            for (let gj = 0; gj <= 4; gj++) {
                for (let gi = 0; gi <= 4; gi++) {
                    const sx = ox + (gi / 4) * span;
                    const sz = oz + (gj / 4) * span;
                    if (this._terrainMacroSurfaceY(sx, sz, true) < thr) return true;
                }
            }
        }
        return false;
    }

    // DIE FLUT-SAAT DER NACHBARN (die reaktive Flut über die Chunkgrenze): liegt ein CARVE in der 3×3-Chunk-Region
    // (`_chunkRegionHasCarve`), seedet der OOB-Ring des Chunks AUCH aus den nassen Nachbar-ZELLEN (`waterCells`) — der
    // Atlas-Ring kennt nur frozen Körper, ein Carve-Kanal bliebe im Nachbarn trocken. Je Rand-Spalte ein Bit, ob die
    // angrenzende Spalte des Nachbarn bis `jMax` eine Wasser-Zelle trägt: West · Ost · Nord · Süd, je `dim` (LOD 0, wie
    // jede Zelle). Der Sync-Bau liest sie (`_buildVoxelChunkWaterCells`), jeder Worker-Auftrag trägt sie als Daten
    // (`_voxelWorkerComputeChunkMesh` → `buildChunkWaterCells`, bit-identisch) — der Carve-Neubau geht über denselben
    // Worker-Pfad wie jeder Chunk (K69-2; bis dahin zwang sie den Neubau in den Haupt-Faden). null ohne Carve oder
    // ohne nasse Nachbar-Spalte (dann atlas-only).
    _flutSaat(cx, cz) {
        if (!this.state.voxelChunks || !this._chunkRegionHasCarve(cx, cz)) return null;
        const { dim, dimY, step, floorDrop } = this._voxelChunkConfig(0);
        const oy = (this.state.terrainBaseHeight || 0) - floorDrop;
        const band = this.state.hydroBand;
        let jMax = Math.floor(((band ? band.top : Infinity) - oy) / step);
        if (jMax >= dimY) jMax = dimY - 1;
        const dimSq = dim * dim;
        const WATER = AnazhRealm.CELL_STATE.WATER;
        const colWet = (nkey, ni, nk) => {
            const nb = this.state.voxelChunks.get(nkey);
            if (!nb || !nb.waterCells) return 0;
            const nc = nb.waterCells;
            const b = ni + nk * dim;
            for (let j = 0; j <= jMax && b + j * dimSq < nc.length; j++) if (nc[b + j * dimSq] === WATER) return 1;
            return 0;
        };
        const saat = new Uint8Array(4 * dim);
        let n = 0;
        for (let q = 0; q < dim; q++) {
            n += saat[q] = colWet(`${cx - 1},${cz}`, dim - 1, q);
            n += saat[dim + q] = colWet(`${cx + 1},${cz}`, 0, q);
            n += saat[2 * dim + q] = colWet(`${cx},${cz - 1}`, q, dim - 1);
            n += saat[3 * dim + q] = colWet(`${cx},${cz + 1}`, q, 0);
        }
        return n ? saat : null;
    }

    // DER SCHNITT ÖFFNET DAS GESETZ (F3, Graben am Fluss): der Spiegel einer Spalte (Mitte x/z, Kante `step`), die der Atlas
    // trocken nennt, ein Schnitt aber berührt (eine Kugel der EINEN Edit-Karte reicht waagrecht an sie heran): der Fluss-
    // Spiegel quer (`_hydroSpiegelQuer`). Den Raum, den der Graben am Fluss öffnet, flutet so das Gesetz selbst bis zum
    // Spiegel des Flusses — nur, wo er durch freie Zellen mit einer Quelle verbunden ist (die Flut unten), und das Sheet
    // zeichnet dort denselben Spiegel (`_computeWaterSheetData`): EINE Fläche mit dem Fluss. −Infinity ohne Schnitt (die
    // Welt ohne Graben bleibt Bit für Bit). Das Gesetz des Kerns (gelaende-core `schnittSpiegel`).
    _schnittSpiegel(x, z, step) {
        return globalThis.__gelaendeCore.schnittSpiegel(this._gelaende(), this._voxelEditKarte(), x, z, step);
    }

    // `preDensity` = das Grid des Boden-Meshers ((dim+4)·(dimY+1)·(dim+4), Origin `ox-step, oy,
    // oz-step`); Cell-Center-Density = 8-Corner-Avg (spart ~71k Dichte-Calls). Ohne preDensity sampelt es
    // selbst — IDENTISCHE Klassifikation. `lod` wählt dim/dimY wie der Boden-Mesher.
    _buildVoxelChunkWaterCells(ox, oy, oz, step, preDensity = null, lod = 0) {
        const { dim, dimY } = this._voxelChunkConfig(lod);
        const cells = new Uint8Array(dim * dim * dimY);
        const STATE = AnazhRealm.CELL_STATE;
        // Density-Grid besorgen (vorab oder selbst samplen)
        let density = preDensity;
        if (!density) {
            const sample = (x, y, z) => this._terrainDensityAt(x, y, z);
            density = this._voxelSampleDensityGrid(ox - step, oy, oz - step, dim + 3, dimY, dim + 3, step, sample);
        }
        const band = this.state.hydroBand;
        const bandTop = band ? band.top : Infinity;
        // Cell (i, k, j) Center ist Mittelpunkt der 8 Density-Grid-Vertices
        // (i+1, j, k+1) bis (i+2, j+1, k+2) (Pad +1 links/unten ausgeglichen).
        const Nx = dim + 4;
        const Ny = dimY + 1;
        const NxNy = Nx * Ny;
        // Verbundenes Wasser per 3D-Flood-Fill von echten Quellen (Ozean/See/Fluss): gefüllt wird NUR, was
        // durch nicht-soliden Raum UNTER dem Body-Spiegel mit einer Quelle verbunden ist → kein Bluten durch
        // Wände, keine Luftblasen in getauchten Höhlen. Seeds aus dem GLOBALEN Atlas (in-chunk + OOB-Ring) →
        // nahtfrei. Die Architektur stempelt NACH dem Flood (6), wie im Worker-Pfad: das Wasser des Gesetzes steht, der Stempel
        // verdrängt es — und sagt, ob er es tat.
        const dimSq = dim * dim;
        const cellD = (i, j, k) => {
            const a = j * Nx + (k + 1) * NxNy;
            const b = (j + 1) * Nx + (k + 1) * NxNy;
            const c = j * Nx + (k + 2) * NxNy;
            const e = (j + 1) * Nx + (k + 2) * NxNy;
            const i1 = i + 1;
            const i2 = i + 2;
            return (
                (density[i1 + a] +
                    density[i2 + a] +
                    density[i1 + b] +
                    density[i2 + b] +
                    density[i1 + c] +
                    density[i2 + c] +
                    density[i1 + e] +
                    density[i2 + e]) *
                0.125
            );
        };
        let jMax = Math.floor((bandTop - oy) / step);
        if (jMax >= dimY) jMax = dimY - 1;
        // 1) SOLID/AIR aus der Density (Wasser kommt erst durch den Flood). Über
        //    dem Band bleibt alles AIR (Uint8Array-Default 0 = AIR).
        for (let j = 0; j <= jMax; j++) {
            const baseJ = j * dimSq;
            for (let k = 0; k < dim; k++) {
                const baseK = k * dim;
                for (let i = 0; i < dim; i++) {
                    if (cellD(i, j, k) > 0) cells[i + baseK + baseJ] = STATE.SOLID;
                }
            }
        }
        // 3) Quell-Spiegel pro Spalte: NUR echtes Atlas-Wasser/Fluss (kein Rim).
        //    `_atlasWaterLevelAt` mit terrainTop = +Infinity unterdrückt das Rand-
        //    3×3 (`rim < +∞` ist immer false) → liefert nur den echten Body-Spiegel.
        const WATER = STATE.WATER;
        const AIR = STATE.AIR;
        // Aquifer: ein Oberflächen-See flutet NICHT die Höhlen darunter — eine tiefe Höhlen-Zelle (cy unter
        // surf-18) über dem globalen Wassertisch (`waterLevel`) bleibt trocken, darunter nass.
        // MUSS bit-identisch im Worker.
        const aquiferY = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
        const colSurf = new Float64Array(dim * dim);
        for (let k = 0; k < dim; k++) {
            const cz = oz + (k + 0.5) * step;
            for (let i = 0; i < dim; i++) colSurf[i + k * dim] = this._terrainMacroSurfaceY(ox + (i + 0.5) * step, cz);
        }
        // Fels über der Zelle: die Unterkante der obersten FESTEN Zelle der Spalte — darunter
        // ist eine Zelle bedeckt, darüber steht sie unter offenem Himmel (`AnazhRealm._aquiferTrocken`).
        const colFels = new Float64Array(dimSq).fill(-Infinity);
        for (let idx0 = 0; idx0 < dimSq; idx0++) {
            for (let j = jMax; j >= 0; j--) {
                if (cells[idx0 + j * dimSq] !== STATE.SOLID) continue;
                colFels[idx0] = oy + j * step;
                break;
            }
        }
        const caveDry = (i, k, cy) =>
            AnazhRealm._aquiferTrocken(cy, colSurf[i + k * dim], aquiferY, cy < colFels[i + k * dim]);
        // DER BODEN JE SPALTE (Gegenprüfung 07.10., Runde 3): der tiefste Null-Durchgang der Dichte an den vier Ecken der Spalte
        // (das Gitter, aus dem auch der Mesher die Fläche setzt) — das Wasser der Spalte steht, wo es über irgendeinem Teil
        // ihres Bodens steht. Das Ufer-Urteil des Spiegels und die Deck-Zelle lesen ihn, wie der Körper seinen Boden liest
        // (`_koerperWasser`); bis zur Gegenprüfung las das Ufer-Urteil die Makro-Fläche (an den Seen der Kacheln bis 4,6 m über
        // dem Boden): der Körper stand im Ufer-Wasser, das die Welt nicht zeichnete. Reicht das Gelände über das Band, trägt
        // die Ecke kein Wasser; ohne Gelände im Band die Makro-Fläche.
        const colBoden = new Float64Array(dimSq);
        {
            const jTop = Math.min(dimY, jMax + 1);
            for (let k = 0; k < dim; k++) {
                for (let i = 0; i < dim; i++) {
                    let b = Infinity;
                    let gelaende = false;
                    for (let e = 0; e < 4; e++) {
                        const g = i + 1 + (e & 1) + (k + 1 + (e >> 1)) * NxNy;
                        for (let j = jTop; j >= 0; j--) {
                            const dS = density[g + j * Nx];
                            if (!(dS > 0)) continue;
                            gelaende = true;
                            const dD = j + 1 <= dimY ? density[g + (j + 1) * Nx] : 1;
                            if (dD <= 0) b = Math.min(b, oy + j * step + (step * dS) / (dS - dD));
                            break;
                        }
                    }
                    colBoden[i + k * dim] = gelaende ? b : colSurf[i + k * dim];
                }
            }
        }
        // Die EINE kanonische Wasserspiegel-Höhe `colL` PRO SPALTE, terrain-gated (`_atlasWaterLevelAt` mit
        // dem Boden der Spalte → Ufer füllt sub-zellig, Land bleibt trocken). `colSrc` = echte
        // Atlas-Wasser-Quelle (Seed). Gefragt wird an der Mitte UND den vier Ecken der Spalte (das Höchste): die Ränder des
        // Gesetzes (das 16-m-Raster der Seen und ihres Ufers, die Krone des Flusses) liegen nicht auf dem 1,8-m-Gitter — an
        // der Mitte allein zeichnete die Welt einen Ufer-Streifen nicht, in dem der Körper stand (Gegenprüfung 07.10., Runde 3).
        const colL = new Float64Array(dimSq);
        const colSrc = new Uint8Array(dimSq);
        const spalteL = (i, k, boden) => {
            let l = this._atlasWaterLevelAt(ox + (i + 0.5) * step, oz + (k + 0.5) * step, boden);
            for (let e = 0; e < 4; e++) {
                const le = this._atlasWaterLevelAt(ox + (i + (e & 1)) * step, oz + (k + (e >> 1)) * step, boden);
                if (le > l) l = le;
            }
            return l;
        };
        for (let k = 0; k < dim; k++) {
            for (let i = 0; i < dim; i++) {
                const idx0 = i + k * dim;
                colL[idx0] = spalteL(i, k, colBoden[idx0]);
                if (colL[idx0] === -Infinity)
                    colL[idx0] = this._schnittSpiegel(ox + (i + 0.5) * step, oz + (k + 0.5) * step, step);
                colSrc[idx0] = spalteL(i, k, Infinity) > -Infinity ? 1 : 0;
            }
        }
        // OOB-Ring: ein Wasser-Körper jenseits der Kante flutet herein → die
        // Kant-Spalte als Quelle markieren (Konnektivität von außen, seam-frei via
        // globalem Atlas; gefüllt wird sie bis IHR eigenes colL).
        for (let k = 0; k < dim; k++) {
            const cz = oz + (k + 0.5) * step;
            if (this._atlasWaterLevelAt(ox - 0.5 * step, cz, Infinity) > -Infinity) colSrc[0 + k * dim] = 1;
            if (this._atlasWaterLevelAt(ox + (dim + 0.5) * step, cz, Infinity) > -Infinity)
                colSrc[dim - 1 + k * dim] = 1;
        }
        for (let i = 0; i < dim; i++) {
            const cxw = ox + (i + 0.5) * step;
            if (this._atlasWaterLevelAt(cxw, oz - 0.5 * step, Infinity) > -Infinity) colSrc[i + 0 * dim] = 1;
            if (this._atlasWaterLevelAt(cxw, oz + (dim + 0.5) * step, Infinity) > -Infinity)
                colSrc[i + (dim - 1) * dim] = 1;
        }
        // Reaktive Flut über die Chunkgrenze: die Flut-Saat der Nachbarn (`_flutSaat`) — derselbe Schritt im Worker
        // (`buildChunkWaterCells`), dem sie als Daten mit dem Auftrag reist.
        {
            const _span = dim * step;
            const saat = this._flutSaat(Math.round(ox / _span), Math.round(oz / _span));
            if (saat)
                for (let q = 0; q < dim; q++) {
                    if (saat[q]) colSrc[0 + q * dim] = 1;
                    if (saat[dim + q]) colSrc[dim - 1 + q * dim] = 1;
                    if (saat[2 * dim + q]) colSrc[q + 0 * dim] = 1;
                    if (saat[3 * dim + q]) colSrc[q + (dim - 1) * dim] = 1;
                }
        }
        // Küsten-Aquifer: die 3D-Roughness (±12 m) taucht echtes Terrain bis −24 m unter den Spiegel, wo das
        // Makro „Land" sagt (colL=−Inf → die BFS füllte die himmel-offene Senke nie). Jede Atlas-lose Spalte,
        // deren erste SOLID-Zelle von oben KLAR unter dem Wassertisch liegt, wird Aquifer-Quelle
        // (colL=waterLevel, colSrc=1). Per-Spalte lokal → nahtfrei, Worker bit-identisch (voxel-worker.js).
        // Land-Spalten behalten colL=−Inf; gedeckelte Höhlen filtert _skyOpenWaterFilter.
        const SHELF_MIN_DEPTH = 1.0;
        for (let k = 0; k < dim; k++) {
            const baseK = k * dim;
            for (let i = 0; i < dim; i++) {
                const idx0 = i + baseK;
                if (colSrc[idx0]) continue; // schon echte Quelle (Atlas/Fluss)
                const lvl0 = colL[idx0];
                // Ein See-/Fluss-Rim ÜBER dem Wassertisch ist KEIN Grundwasser — sonst füllte eine getrennte Senke
                // neben einem Hochland-See bis zu dessen Spiegel. Ozean-Rim und Unter-Meer-See-Rim bleiben.
                if (lvl0 > -Infinity && lvl0 > aquiferY + 1e-6) continue;
                let topJ = -1;
                for (let j = jMax; j >= 0; j--) {
                    if (cells[idx0 + j * dimSq] === STATE.SOLID) {
                        topJ = j;
                        break;
                    }
                }
                if (topJ < 0) continue; // Terrain unterm Band — exotisch, konservativ
                const topCy = oy + (topJ + 0.5) * step;
                if (topCy < aquiferY - SHELF_MIN_DEPTH) {
                    colL[idx0] = lvl0 > -Infinity ? lvl0 : aquiferY;
                    colSrc[idx0] = 1;
                }
            }
        }
        const queue = [];
        // U-W3: eine Quell-Spalte wird bis IHR colL geflutet (NICHT bis ein
        // propagierter höherer Quell-Spiegel — das heilt die gemessene 4–15-m-
        // Über-Füllung `cellTop−L`).
        const seedColumn = (i, k) => {
            const idx0 = i + k * dim;
            if (!colSrc[idx0]) return;
            const lvl = colL[idx0];
            if (!(lvl > -Infinity)) return;
            const baseK = k * dim;
            for (let j = 0; j <= jMax; j++) {
                const cy = oy + (j + 0.5) * step;
                if (cy > lvl) break;
                const cidx = i + baseK + j * dimSq;
                if (cells[cidx] === AIR && !caveDry(i, k, cy)) {
                    cells[cidx] = WATER;
                    queue.push(cidx);
                }
            }
        };
        for (let k = 0; k < dim; k++) for (let i = 0; i < dim; i++) seedColumn(i, k);
        // 4) BFS-Flood durch nicht-soliden Raum — jede Zelle bis colL[ihre Spalte]
        //    (U-W3: kein propagierter Quell-Spiegel → keine Über-Füllung; die
        //    BFS-Konnektivität bleibt = kein Phantom-Wasser, kein Bluten an Wänden).
        const pushN = (ni, nk, nj) => {
            if (ni < 0 || nk < 0 || ni >= dim || nk >= dim || nj < 0 || nj > jMax) return;
            const cy = oy + (nj + 0.5) * step;
            if (cy > colL[ni + nk * dim]) return;
            const nidx = ni + nk * dim + nj * dimSq;
            if (cells[nidx] === AIR && !caveDry(ni, nk, cy)) {
                cells[nidx] = WATER;
                queue.push(nidx);
            }
        };
        for (let qh = 0; qh < queue.length; qh++) {
            const cidx = queue[qh];
            const j = (cidx / dimSq) | 0;
            const rem = cidx - j * dimSq;
            const k = (rem / dim) | 0;
            const i = rem - k * dim;
            pushN(i + 1, k, j);
            pushN(i - 1, k, j);
            pushN(i, k + 1, j);
            pushN(i, k - 1, j);
            pushN(i, k, j + 1);
            pushN(i, k, j - 1);
        }
        // 4b) DIE DECK-ZELLE (EINE Regel für jedes flache Wasser, Gegenprüfung 07.10., Runde 3): liegt der Spiegel einer
        //    Quell-Spalte über ihrem Boden, aber unter der Mitte ihrer ersten freien Zelle (ein Rinnsal, ein flaches Ufer, die
        //    Küsten-Schelfe), fällt das Wasser durchs 1,8-m-Gitter — der Körper las es (`_koerperWasser`: der Spiegel des
        //    Gesetzes über dem Boden), die Welt zeichnete es nicht (der Bach der Mess-Wiese: Körper nass in 104 von 104
        //    Querschnitten, gezeichnet in 52). Dann trägt die DECK-Zelle das Wasser, und das Sheet zeichnet in ihr den Spiegel
        //    des Gesetzes (`_computeWaterSheetData`). Der Boden der Spalte ist der Null-Durchgang der Dichte zwischen ihrer
        //    obersten festen Zelle und der Deck-Zelle (dort setzt auch der Mesher die Fläche); eine gestempelte Zelle (Bau)
        //    trägt keinen Boden. Eine Quell-Spalte trägt ihr flaches Wasser immer, eine Ufer-Spalte, wenn sie an Wasser grenzt
        //    (an der Oberfläche einer Nachbar-Spalte im Chunk, auch einer Deck-Zelle — der flache Ufer-Streifen wächst vom
        //    Wasser her). Kein queue-Push: die Deck-Zelle flutet nichts weiter; `_skyOpenWaterFilter` behält sie (Luft
        //    darüber). Bis zur Gegenprüfung trug nur die Küsten-Schelfe diese Regel, ohne Boden-Urteil. Worker bit-identisch.
        const deckZelle = (i, k) => {
            const idx0 = i + k * dim;
            const lvl = colL[idx0];
            if (!(lvl > -Infinity)) return -1;
            let topJ = -1;
            for (let j = jMax; j >= 0; j--) {
                const c = cells[idx0 + j * dimSq];
                if (c === AIR) continue;
                if (c === STATE.SOLID) topJ = j;
                break; // eine Wasser-Zelle: die Spalte trägt ihr Wasser schon
            }
            if (topJ < 0 || topJ + 1 > jMax) return -1;
            const deckIdx = idx0 + (topJ + 1) * dimSq;
            const topCy = oy + (topJ + 0.5) * step;
            // der Spiegel liegt in der Deck-Zelle oder in der festen Zelle darunter (bis dorthin zeichnet das Sheet ihn,
            // `_computeWaterSheetData`), über dem Boden der Spalte; die feste Zelle ist Gelände, kein Bau-Stempel
            if (cells[deckIdx] !== AIR || topCy + step <= lvl || !(lvl > topCy - 0.5 * step)) return -1;
            if (!(cellD(i, topJ, k) > 0) || !(lvl > colBoden[idx0])) return -1;
            return deckIdx;
        };
        const nassOben = new Uint8Array(dimSq);
        const offen = [];
        for (let idx0 = 0; idx0 < dimSq; idx0++) {
            for (let j = jMax; j >= 0; j--) {
                const c = cells[idx0 + j * dimSq];
                if (c === AIR) continue;
                if (c === WATER) {
                    nassOben[idx0] = 1;
                    offen.push(idx0);
                }
                break;
            }
        }
        for (let idx0 = 0; idx0 < dimSq; idx0++) {
            if (!colSrc[idx0] || nassOben[idx0]) continue;
            const d = deckZelle(idx0 % dim, (idx0 / dim) | 0);
            if (d < 0) continue;
            cells[d] = WATER;
            nassOben[idx0] = 1;
            offen.push(idx0);
        }
        for (let h = 0; h < offen.length; h++) {
            const i = offen[h] % dim;
            const k = (offen[h] / dim) | 0;
            for (const [ni, nk] of [
                [i + 1, k],
                [i - 1, k],
                [i, k + 1],
                [i, k - 1],
            ]) {
                if (ni < 0 || nk < 0 || ni >= dim || nk >= dim) continue;
                const n0 = ni + nk * dim;
                if (nassOben[n0]) continue;
                const d = deckZelle(ni, nk);
                if (d < 0) continue;
                cells[d] = WATER;
                nassOben[n0] = 1;
                offen.push(n0);
            }
        }
        // 5) 3D-Konnektivität: eine WATER-Zelle ist nur echt, wenn sie durch Wasser mit der OFFENEN
        //    ATMOSPHÄRE verbunden ist („komme ich zur Oberfläche?", nicht „Deckel über mir?") — erhält die
        //    Überhang-Bucht (lateral verbunden) und trocknet die Sub-Terrain-Blase mit EINER Regel.
        this._skyOpenWaterFilter(cells, dim, dimY, jMax);
        // 6) DER STEMPEL DER WERKE NACH DEM WASSER (Schau-2 wasser-wahrheit, Gegenprüfung Runde 3): EINE Reihenfolge für Main
        //    und Worker (der Worker flutet ohne Werke, der Main stempelt seine Zellen danach, `_buildVoxelChunkDataFromWorkerMesh`)
        //    — die Zellen sind dieselben, gleich welcher Pfad den Chunk baut, und der Stempel liest an ihnen, ob er Wasser
        //    verdrängt. Bis zur Gegenprüfung stempelte der Main VOR dem Flood (ein Damm hielt das ruhende Wasser ab, im
        //    Worker-Pfad nicht), und die Weck-Frage las eine zweite Wahrheit (das Gesetz samt Rand-Füllung).
        this._stampArchitectureSolidCellsInto(cells, ox, oy, oz, lod);
        return cells;
    }

    // Die EINE Wasser-Regel: Wasser existiert nur, wo es durch nicht-soliden Raum mit der offenen
    // Atmosphäre verbunden ist. (A) Sky-Air: AIR-Zellen, vom Band-Dach (j=jMax) durch AIR erreichbar.
    // (B) Keep: WATER-Zellen an Sky-Air oder über Wasser damit verbunden; alles übrige WATER → AIR.
    // See und Überhang-Bucht bleiben, Sub-Terrain-Blasen trocknen, Wasser „klettert" nie.
    // Worker-Mirror Pflicht (bit-identisch).
    _skyOpenWaterFilter(cells, dimC, dimYC, jMaxC) {
        const STATE = AnazhRealm.CELL_STATE;
        const dq = dimC * dimC;
        // (A) Sky-Air-Flood vom Chunk-DACH (j=dimYC-1, über dem ganzen Wasser-Band); über jMaxC ist alles
        //     AIR, der Flood fällt durch jeden AIR-Raum nach unten/seitlich.
        const topJ = dimYC - 1;
        const skyAir = new Uint8Array(dq * dimYC);
        const stack = [];
        for (let k = 0; k < dimC; k++) {
            for (let i = 0; i < dimC; i++) {
                const idx = i + k * dimC + topJ * dq;
                if (cells[idx] === STATE.AIR) {
                    skyAir[idx] = 1;
                    stack.push(idx);
                }
            }
        }
        const tryAir = (ni, nk, nj) => {
            if (ni < 0 || nk < 0 || ni >= dimC || nk >= dimC || nj < 0 || nj >= dimYC) return;
            const nidx = ni + nk * dimC + nj * dq;
            if (skyAir[nidx] || cells[nidx] !== STATE.AIR) return;
            skyAir[nidx] = 1;
            stack.push(nidx);
        };
        while (stack.length) {
            const idx = stack.pop();
            const j = (idx / dq) | 0;
            const rem = idx - j * dq;
            const k = (rem / dimC) | 0;
            const i = rem - k * dimC;
            tryAir(i + 1, k, j);
            tryAir(i - 1, k, j);
            tryAir(i, k + 1, j);
            tryAir(i, k - 1, j);
            tryAir(i, k, j + 1);
            tryAir(i, k, j - 1);
        }
        // (B) Keep-Flood: WATER, das an Sky-Air grenzt oder durch Wasser damit
        //     verbunden ist. Seed = WATER mit Sky-Air-Nachbar (die Oberfläche).
        const keep = new Uint8Array(dq * dimYC);
        const wstack = [];
        const hasSkyNbr = (i, k, j, idx) =>
            (j < topJ && skyAir[idx + dq]) ||
            (j > 0 && skyAir[idx - dq]) ||
            (i + 1 < dimC && skyAir[idx + 1]) ||
            (i > 0 && skyAir[idx - 1]) ||
            (k + 1 < dimC && skyAir[idx + dimC]) ||
            (k > 0 && skyAir[idx - dimC]);
        for (let j = 0; j <= jMaxC; j++) {
            for (let k = 0; k < dimC; k++) {
                for (let i = 0; i < dimC; i++) {
                    const idx = i + k * dimC + j * dq;
                    if (cells[idx] === STATE.WATER && !keep[idx] && hasSkyNbr(i, k, j, idx)) {
                        keep[idx] = 1;
                        wstack.push(idx);
                    }
                }
            }
        }
        const tryWater = (ni, nk, nj) => {
            if (ni < 0 || nk < 0 || ni >= dimC || nk >= dimC || nj < 0 || nj > jMaxC) return;
            const nidx = ni + nk * dimC + nj * dq;
            if (keep[nidx] || cells[nidx] !== STATE.WATER) return;
            keep[nidx] = 1;
            wstack.push(nidx);
        };
        while (wstack.length) {
            const idx = wstack.pop();
            const j = (idx / dq) | 0;
            const rem = idx - j * dq;
            const k = (rem / dimC) | 0;
            const i = rem - k * dimC;
            tryWater(i + 1, k, j);
            tryWater(i - 1, k, j);
            tryWater(i, k + 1, j);
            tryWater(i, k - 1, j);
            tryWater(i, k, j + 1);
            tryWater(i, k, j - 1);
        }
        // Alles WATER ohne Sky-Verbindung → AIR (eingeschlossene Blase, Phantom).
        for (let idx = 0; idx < cells.length; idx++) {
            if (cells[idx] === STATE.WATER && !keep[idx]) cells[idx] = STATE.AIR;
        }
    }

    // Stempelt solide Architektur-AABBs (`blockerAABBs`) als SOLID ins Cell-Feld, NACH dem Wasser des Gesetzes (Main und
    // Worker in derselben Reihenfolge); Y-Range je AABB von aabb.botY bis topY. `lod` MUSS zur Cell-Grid-Geometrie des
    // Aufrufers passen — sonst out-of-bounds-Writes. Gestempelt werden die Werke, deren Hülle den Chunk berührt (die
    // Nachbarschaft der Blocker, `_blockerNahe`): die Kosten folgen den Werken am Ort, nie dem Bestand (Lehre 25; bis zur
    // Gegenprüfung Runde 3 lief jeder Chunk-Bau den ganzen Bestand durch — 763–1 940 Werke, 0,7–8,1 ms, Spitze 14,9 ms).
    // DIE PFLANZE STEHT IM WASSER (Schau-2 wasser-wahrheit): die Hülle einer Pflanze (Stamm, Trieb) und eines Gefährts
    // (`aabb.stempelfrei`, Karte K02) stempelt keine Zelle — das Wasser fließt um sie, wie der Körper sie schon liest
    // (`_koerperWasserSpiegel`). Auf dem 1,8-m-Gitter
    // wurde ein 0,6-m-Stamm am Ufer zu einer Zellen-Säule, die Wasser verdrängte: der Bau weckte den Automaten, und der
    // flutete das Tal (Schau 09.10.: der Eichenhain am Fluss −872/−1127 stand nach 20 s 1,9–3,8 m unter dem Wasser).
    // DER DAMM ENTSTEHT MIT SEINEN ZELLEN (Gegenprüfung Runden 2 und 3): überschreibt der Stempel eine WASSER-Zelle, verdrängt
    // das Werk Wasser — gefragt an DENSELBEN Zellen, die der Chunk trägt, nie an einer zweiten Wahrheit. Dann ist es ein Damm
    // (`entry._stempelNass`, der Abbau liest es), und der Automat wacht um die Hülle, wann immer ein Chunk mit dem Stempel
    // entsteht (der Neubau des Fußabdrucks beim Bau, der Reload, das Wieder-Strömen): der Stausee bildet sich neu. Die Kappen
    // und Stau-Felder bauen faul aus den Zellen, die dieser Bau gleich ablegt. Befunde: nach dem Reload stand der Damm
    // −937/−1064 im fließenden Fluss (3 574 nasse Punkte davor, 1 557 danach — die Frage las die geladenen Zellen, beim Reload
    // keine); danach weckte ein Haus am Seerand den Automaten (die Frage las das Gesetz samt Rand-Füllung, die Zellen fluten
    // den Rand nur, wo er mit der Quelle verbunden ist). `fest` (optional) sammelt die Zellen, die der Stempel fest machte — die
    // Zellen des Fadens samt dieser Liste sind die des Chunks (`_buildVoxelChunkDataFromWorkerMesh`, das Wasser-Sheet).
    _stampArchitectureSolidCellsInto(cells, ox, oy, oz, lod = 0, fest = null) {
        if (!Array.isArray(this.state.architectures) || this.state.architectures.length === 0) return;
        const { dim, dimY, step } = this._voxelChunkConfig(lod);
        const STATE = AnazhRealm.CELL_STATE;
        const halb = dim * step * 0.5;
        const nahe = this._stempelNahe || (this._stempelNahe = []);
        nahe.length = 0;
        this._blockerNahe(ox + halb, oz + halb, halb, 0, nahe);
        for (const entry of nahe) {
            if (!entry.blockerAABBs) continue;
            for (const aabb of entry.blockerAABBs) {
                const s = this._stempelSpanne(aabb, ox, oy, oz, dim, dimY, step);
                if (!s) continue;
                // DIE GEDREHTE BOX STEMPELT IHRE ZELLEN (Karte K02): ein gedrehtes Teil (`aabb.obb`) stempelt nur die Zellen, die
                // es berührt — der Schnitt der Zelle mit dem Rechteck in der Ebene (die Achsen der Box; die Welt-Achsen trägt die
                // Spanne), nie die Ecken seiner Welt-AABB. Bis hierhin stempelte ein 45° gedrehtes Haus am Fluss die Ecken seiner
                // Hülle über dem Wasser: Wasser-Zellen ohne Wand, ein Damm, den es nicht gibt — der Automat wachte (9–11 Chunks)
                // und hob den Fluss −872/−1113 auf 33,6 m, 1,9 m über seinen Spiegel. Achsparallele Teile stempeln byte-alt.
                const ob = aabb.obb;
                const obR = ob ? step * 0.5 * (Math.abs(ob.c) + Math.abs(ob.s)) : 0;
                let nass = false;
                for (let j = s.j0; j <= s.j1; j++) {
                    const baseJ = j * dim * dim;
                    for (let k = s.k0; k <= s.k1; k++) {
                        const baseK = k * dim;
                        const qz = ob ? oz + (k + 0.5) * step - ob.cz : 0;
                        for (let i = s.i0; i <= s.i1; i++) {
                            if (ob) {
                                const qx = ox + (i + 0.5) * step - ob.cx;
                                if (Math.abs(qx * ob.c - qz * ob.s) > ob.hx + obR) continue;
                                if (Math.abs(qx * ob.s + qz * ob.c) > ob.hz + obR) continue;
                            }
                            const idx = i + baseK + baseJ;
                            if (cells[idx] === STATE.WATER) nass = true;
                            if (fest && cells[idx] !== STATE.SOLID) fest.push(idx);
                            cells[idx] = STATE.SOLID;
                        }
                    }
                }
                if (!nass) continue;
                entry._stempelNass = true;
                this._invalidateWaterCapsAround(
                    (aabb.minX + aabb.maxX) * 0.5,
                    (aabb.minZ + aabb.maxZ) * 0.5,
                    Math.max(aabb.maxX - aabb.minX, aabb.maxZ - aabb.minZ) * 0.5
                );
            }
        }
    }

    // Die Zellen, die eine Blocker-Hülle in einem Chunk (Ursprung ox/oy/oz) stempelt: xz der Überlapp, y vom Fuß (botY, sonst
    // topY − 4) bis zum Kopf. null = die Hülle stempelt hier nichts (außerhalb des Chunks, oder stempelfrei). Liefert ein
    // geteiltes Scratch-Objekt.
    _stempelSpanne(aabb, ox, oy, oz, dim, dimY, step) {
        if (aabb.stempelfrei) return null;
        if (aabb.maxX < ox || aabb.minX > ox + dim * step) return null;
        if (aabb.maxZ < oz || aabb.minZ > oz + dim * step) return null;
        const s = this._stempelScratch || (this._stempelScratch = {});
        s.i0 = Math.max(0, Math.floor((aabb.minX - ox) / step));
        s.i1 = Math.min(dim - 1, Math.floor((aabb.maxX - ox) / step));
        s.k0 = Math.max(0, Math.floor((aabb.minZ - oz) / step));
        s.k1 = Math.min(dim - 1, Math.floor((aabb.maxZ - oz) / step));
        const yBot = Number.isFinite(aabb.botY) ? aabb.botY : aabb.topY - 4;
        s.j0 = Math.max(0, Math.floor((yBot - oy) / step));
        s.j1 = Math.min(dimY - 1, Math.floor((aabb.topY - oy) / step));
        return s;
    }

    // Das Wasser eines Chunks (EIN Render-Pfad: das Zell-Oberkanten-Sheet). Idempotent: das alte Mesh fällt vor dem Bau.
    // Bis zur Welle L lebte hinter einem Einstellungs-Schalter ein zweiter Renderer („Zell-Iso (Debug)", im Save
    // persistiert, W-kD7) — der Zwilling ist gefallen.
    _buildVoxelChunkWaterIsoSurface(cx, cz) {
        if (!this.state.scene || typeof THREE === "undefined") return null;
        if (!this.state.voxelChunks) return null;
        if (!this.state.voxelChunkWaterIso) this.state.voxelChunkWaterIso = new Map();
        const key = `${cx},${cz}`;
        this._disposeVoxelChunkWaterIso(key);
        return this._buildVoxelChunkWaterCellSheet(cx, cz, key);
    }

    // Zell-Oberkanten-Sheet (Default-Wasser-Render): Domäne NUR über wassertragenden Spalten + 1-Zell-
    // Anker-Ring, der unter das Terrain taucht; Ruhe-Höhe = sub-zelliger Body-Spiegel `L` (±1 Zelle) +
    // Live-CA-Delta (`_caColumnScan`); wet-only-Glätten (PAD=3) über Säulen-Dächer, nie die Zell-Iso-
    // Hülle. Naht-symmetrisch: Rand-Spalten aus DENSELBEN Zellen. Mathe EINMAL in `_computeWaterSheetData`
    // (Zellen/Level nur via ctx) → Worker `buildWaterSheetGeometry` byte-identisch; Carve/CA-aktiv sync.
    _buildVoxelChunkWaterCellSheet(cx, cz, key) {
        const entry = this.state.voxelChunks.get(key);
        if (!entry || !entry.waterCells || !this._wasserSheetTraegt(cx, cz)) {
            this.state.voxelChunkWaterIso.set(key, null);
            return null;
        }
        // Der eigene Bau ZEICHNET das gewünschte Dach (`_caDachNeu` der Re-Mesh-Entscheidung): ab jetzt zeigt der
        // Chunk es, also lesen die acht Nachbarn es — sie bauen neu (die Kante wandert mit, s. `_caDachAus`).
        if (entry._caDachOffen) {
            const alt = entry._caDach;
            entry._caDach = entry._caDachNeu;
            entry._caDachNeu = alt || null; // der Puffer kehrt als nächster Wunsch-Puffer zurück (alloc-frei)
            entry._caDachOffen = false;
            if (!this.state.pendingWaterIso) this.state.pendingWaterIso = new Set();
            for (let dz = -1; dz <= 1; dz++)
                for (let dx = -1; dx <= 1; dx++) {
                    if (!dx && !dz) continue;
                    const nk = `${cx + dx},${cz + dz}`;
                    const nb = this.state.voxelChunks.get(nk);
                    if (nb && nb.waterCells) this.state.pendingWaterIso.add(nk);
                }
        }
        const data = this._computeWaterSheetData(cx, cz, this._mainWaterSheetCtx(cx, cz, entry));
        if (!data) {
            this.state.voxelChunkWaterIso.set(key, null);
            return null;
        }
        return this._finalizeWaterSheetMesh(cx, cz, key, data);
    }

    // Trägt der Chunk ein Sheet? Das Gate kennt das LIVE-Wasser: ein Chunk ohne Atlas-Wasser kann CA-Wasser tragen
    // (Ausbreitung über die Grenze) — hat er einen Level-Eintrag, entscheidet der Spalten-Scan, nicht der Atlas. EIN Gate
    // für den Bau (`_buildVoxelChunkWaterCellSheet`) und das Gezeichnete, bevor es gezeichnet ist (`_wasserNetz`).
    _wasserSheetTraegt(cx, cz) {
        const levelMap = this.state.waterLevelCells;
        return this._voxelChunkHasAnyWater(cx, cz) || !!(levelMap && levelMap.has(`${cx},${cz}`));
    }

    // ═══ DAS GEZEICHNETE WASSER ALS WAHRHEIT (Gegenprüfung 07.10., Runde 4) ═══
    // Was die Welt als Wasser zeichnet, ist die Wasser-Wahrheit am Körper (`_koerperWasser`): die Dreiecke des Wasser-Sheets
    // eines Chunks — dieselben Zahlen, die der Renderer bekommt (`geometry.attributes.position`, Float32) — je Zelle des
    // 1,8-m-Gitters gefächert. Bis zur Gegenprüfung las der Körper das Gesetz an seinem Punkt, die Welt zeichnete auf dem
    // 1,8-m-Gitter (jede Spalte flutet ganz, ihre Ecken tragen den Spiegel): am Bach der Mess-Wiese zeichnete sie auf 64 m
    // Breite Wasser, in dem der Körper trocken stand, und die Nah-Streu setzte Farne hinein; vor Runde 3 umgekehrt (der
    // Körper las 177 m, die die Welt nicht zeichnete). Rückgabe: das Netz, null (der Chunk zeichnet kein Wasser) oder
    // undefined (kein Chunk geladen — die Ferne, dort liest der Körper das Gesetz). Ist ein Chunk geladen, sein Sheet aber noch
    // nicht gebaut, rechnet DIESELBE Rechnung (`_computeWaterSheetData`, das Gate `_wasserSheetTraegt`) das Netz vorab, einmal
    // je Zell-Stand. Gleicher Inhalt ist dasselbe Netz: seine Kennung bleibt (die Nah-Streu baut nur bei echter Änderung neu).
    _wasserNetz(cx, cz) {
        const st = this.state;
        const key = `${cx},${cz}`;
        const entry = st.voxelChunks ? st.voxelChunks.get(key) : null;
        if (!entry) return undefined;
        if (!entry.waterCells) return null;
        const iso = st.voxelChunkWaterIso;
        const gezeichnet = !!iso && iso.has(key);
        const quelle = gezeichnet ? iso.get(key) : entry.waterCells;
        const alt = entry._wasserNetz;
        if (alt && alt.quelle === quelle) return alt.netz;
        let pos = null;
        let idx = null;
        if (gezeichnet) {
            if (quelle) {
                // DAS NETZ TRÄGT SEINE BYTES (K37): die Positionen des gezeichneten Sheets sind ein View in den Puffer des
                // Wasser-Satzes (`_chunkSatzViews`); verdichtet sich der Satz, schiebt er die Bereiche im alten Puffer nach
                // vorn (`copyWithin`) und zeigt neue Views — ein Netz, das den alten View hielt, las danach fremde Bytes. Am
                // Damm im Tal 26/−120 verlor `_nassAt` so 285–1 309 von 2 070 nassen Punkten eines Sees, dessen Sheet stand.
                pos = Float32Array.from(quelle.geometry.attributes.position.array);
                idx = quelle.geometry.index.array;
            }
        } else if (this._wasserSheetTraegt(cx, cz)) {
            const d = this._computeWaterSheetData(cx, cz, this._mainWaterSheetCtx(cx, cz, entry));
            if (d) {
                pos = Float32Array.from(d.positions);
                idx = Uint32Array.from(d.indices);
            }
        }
        let netz = pos ? this._wasserNetzBau(cx, cz, pos, idx) : null;
        if (alt && AnazhRealm._wasserNetzGleich(alt.netz, netz)) netz = alt.netz;
        entry._wasserNetz = { quelle, netz };
        return netz;
    }

    // Das Netz eines Sheets: jedes Dreieck in jeder Zelle (1,8 m) des um eine Zelle erweiterten Chunks, die seine xz-Hülle
    // berührt (die Rand-Vertices sind bis 0,54 m versetzt, `_computeWaterSheetData`) — CSR (`start` · `liste`).
    _wasserNetzBau(cx, cz, pos, idx) {
        const { dim, step, span } = this._voxelChunkConfig(0);
        const nb = dim + 2;
        const gx0 = cx * span - step;
        const gz0 = cz * span - step;
        const triN = (idx.length / 3) | 0;
        const start = new Int32Array(nb * nb + 1);
        const faecher = (t, tu) => {
            const a = 3 * idx[3 * t];
            const b = 3 * idx[3 * t + 1];
            const c = 3 * idx[3 * t + 2];
            const i0 = Math.max(0, Math.floor((Math.min(pos[a], pos[b], pos[c]) - gx0) / step));
            const i1 = Math.min(nb - 1, Math.floor((Math.max(pos[a], pos[b], pos[c]) - gx0) / step));
            const k0 = Math.max(0, Math.floor((Math.min(pos[a + 2], pos[b + 2], pos[c + 2]) - gz0) / step));
            const k1 = Math.min(nb - 1, Math.floor((Math.max(pos[a + 2], pos[b + 2], pos[c + 2]) - gz0) / step));
            for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) tu(i + k * nb);
        };
        for (let t = 0; t < triN; t++) faecher(t, (f) => start[f + 1]++);
        for (let f = 0; f < nb * nb; f++) start[f + 1] += start[f];
        const liste = new Int32Array(start[nb * nb]);
        const fuell = start.slice(0, nb * nb);
        for (let t = 0; t < triN; t++) faecher(t, (f) => (liste[fuell[f]++] = t));
        return { pos, idx, gx0, gz0, nb, step, start, liste };
    }

    // Das höchste Dreieck eines Netzes über (x, z) (baryzentrisch in xz; senkrechte Vorhänge tragen keine Fläche) oder null.
    static _wasserNetzHoehe(n, x, z) {
        const i = Math.floor((x - n.gx0) / n.step);
        const k = Math.floor((z - n.gz0) / n.step);
        if (i < 0 || k < 0 || i >= n.nb || k >= n.nb) return null;
        const f = i + k * n.nb;
        const p = n.pos;
        const ix = n.idx;
        let best = null;
        for (let q = n.start[f]; q < n.start[f + 1]; q++) {
            const t = n.liste[q];
            const a = 3 * ix[3 * t];
            const b = 3 * ix[3 * t + 1];
            const c = 3 * ix[3 * t + 2];
            const d = (p[b + 2] - p[c + 2]) * (p[a] - p[c]) + (p[c] - p[b]) * (p[a + 2] - p[c + 2]);
            if (Math.abs(d) < 1e-12) continue;
            const u = ((p[b + 2] - p[c + 2]) * (x - p[c]) + (p[c] - p[b]) * (z - p[c + 2])) / d;
            const v = ((p[c + 2] - p[a + 2]) * (x - p[c]) + (p[a] - p[c]) * (z - p[c + 2])) / d;
            const w = 1 - u - v;
            if (u < -1e-6 || v < -1e-6 || w < -1e-6) continue;
            const y = u * p[a + 1] + v * p[b + 1] + w * p[c + 1];
            if (best === null || y > best) best = y;
        }
        return best;
    }

    static _wasserNetzGleich(a, b) {
        if (!a || !b) return a === b;
        if (a.pos.length !== b.pos.length || a.idx.length !== b.idx.length) return false;
        for (let i = 0; i < a.pos.length; i++) if (a.pos[i] !== b.pos[i]) return false;
        for (let i = 0; i < a.idx.length; i++) if (a.idx[i] !== b.idx[i]) return false;
        return true;
    }

    // Die Höhe des gezeichneten Wassers an (x, z): das höchste Dreieck der Sheets, die den Punkt tragen — des eigenen Chunks
    // und der Nachbarn, deren Kante näher als WASSER_BILD_RAND liegt (ihre Rand-Vertices sind versetzt). null = kein Wasser
    // gezeichnet, undefined = kein Chunk geladen.
    _wasserBildAt(x, z) {
        const span = this._voxelChunkConfig(0).span;
        const R = AnazhRealm.WASSER_BILD_RAND;
        const cx = Math.floor(x / span);
        const cz = Math.floor(z / span);
        const eigen = this._wasserNetz(cx, cz);
        if (eigen === undefined) return undefined;
        let best = eigen ? AnazhRealm._wasserNetzHoehe(eigen, x, z) : null;
        const fx = x - cx * span;
        const fz = z - cz * span;
        for (let dz = -1; dz <= 1; dz++) {
            if (dz < 0 ? fz > R : dz > 0 ? span - fz > R : false) continue;
            for (let dx = -1; dx <= 1; dx++) {
                if ((!dx && !dz) || (dx < 0 ? fx > R : dx > 0 ? span - fx > R : false)) continue;
                const n = this._wasserNetz(cx + dx, cz + dz);
                if (!n) continue;
                const y = AnazhRealm._wasserNetzHoehe(n, x, z);
                if (y !== null && (best === null || y > best)) best = y;
            }
        }
        return best;
    }

    // Die Kennungen des gezeichneten Wassers über einem Rechteck (eine Kachel der Nah-Streu/Nah-Wiese): das Rechteck, dann je
    // Chunk, dessen Sheet ein Punkt des Rechtecks lesen kann, sein Netz. Eine Kachel baut neu, sobald sich das Wasser IM
    // RECHTECK ändert (`_wasserKennungenGleich`).
    _wasserKennungen(x0, z0, x1, z1) {
        const span = this._voxelChunkConfig(0).span;
        const R = AnazhRealm.WASSER_BILD_RAND;
        const aus = [x0, z0, x1, z1];
        for (let cz = Math.floor((z0 - R) / span); cz <= Math.floor((z1 + R) / span); cz++)
            for (let cx = Math.floor((x0 - R) / span); cx <= Math.floor((x1 + R) / span); cx++)
                aus.push(cx, cz, this._wasserNetz(cx, cz));
        return aus;
    }

    // DIE KACHEL LIEST IHR WASSER (F3): ein neues Netz eines Chunks fällt die Kachel nur, wenn sich seine Dreiecke über ihrem
    // Rechteck ändern (`_wasserNetzGleichIn`); sonst liest sie ab jetzt das neue Netz. Bis F3 fiel sie mit jedem neuen Netz —
    // der Automat baute am Graben das Sheet alle vier Takte neu, und die Wiese um den Graben fiel 557-mal in 600 Takten
    // (eine Kachel wächst je Takt neu: das Flackern).
    _wasserKennungenGleich(k) {
        if (!k) return false;
        for (let i = 4; i < k.length; i += 3) {
            const n = this._wasserNetz(k[i], k[i + 1]);
            if (n === k[i + 2]) continue;
            if (!AnazhRealm._wasserNetzGleichIn(k[i + 2], n, k[0], k[1], k[2], k[3])) return false;
            k[i + 2] = n;
        }
        return true;
    }

    // Tragen zwei Netze desselben Chunks über dem Rechteck dieselben Dreiecke (je Zelle des Netzes, die das Rechteck berührt,
    // dieselben Ecken in derselben Folge)? Dann liest jeder Punkt des Rechtecks dieselbe Höhe (`_wasserNetzHoehe`).
    static _wasserNetzGleichIn(a, b, x0, z0, x1, z1) {
        const n = a || b;
        if (!n) return true;
        const i0 = Math.max(0, Math.floor((x0 - n.gx0) / n.step));
        const i1 = Math.min(n.nb - 1, Math.floor((x1 - n.gx0) / n.step));
        const k0 = Math.max(0, Math.floor((z0 - n.gz0) / n.step));
        const k1 = Math.min(n.nb - 1, Math.floor((z1 - n.gz0) / n.step));
        for (let k = k0; k <= k1; k++)
            for (let i = i0; i <= i1; i++) {
                const f = i + k * n.nb;
                const la = a ? a.start[f + 1] - a.start[f] : 0;
                if (la !== (b ? b.start[f + 1] - b.start[f] : 0)) return false;
                for (let q = 0; q < la; q++)
                    for (let e = 0; e < 3; e++) {
                        const pa = 3 * a.idx[3 * a.liste[a.start[f] + q] + e];
                        const pb = 3 * b.idx[3 * b.liste[b.start[f] + q] + e];
                        if (
                            a.pos[pa] !== b.pos[pb] ||
                            a.pos[pa + 1] !== b.pos[pb + 1] ||
                            a.pos[pa + 2] !== b.pos[pb + 2]
                        )
                            return false;
                    }
            }
        return true;
    }

    // B1 — der Main-Zell-Kontext: liest die geladenen Chunk-Zellen + DAS GEZEICHNETE DACH jedes Chunks
    // (`entry._caDach`, s. `_caDachAus`). Der Worker-Pendant (im `water-sheet`-Handler) liest stattdessen den
    // gesendeten Block (dachlos: der Worker baut nur dachlose Nachbarschaften, `_waterSheetCaFree`).
    _mainWaterSheetCtx(cx, cz, entry) {
        const voxelChunks = this.state.voxelChunks;
        // V18.91 — OBERFLÄCHENSPANNUNG (Schöpfer: „nicht geknäulte Alufolie"): die
        // Glätt-Pässe (browser-justierbar 0..6). PAD = Pässe + 1 (naht-symmetrisch).
        const smoothRaw =
            this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterSheetSmooth)
                ? Math.round(this.state.atmosphere.waterSheetSmooth)
                : 4;
        return {
            smoothPasses: Math.max(0, Math.min(6, smoothRaw)),
            getCells: (ncx, ncz) => {
                if (ncx === cx && ncz === cz) return entry.waterCells;
                const nb = voxelChunks.get(`${ncx},${ncz}`);
                return nb && nb.waterCells ? nb.waterCells : null;
            },
            // DIE WASSER-NAHT (Linse 05.10., echte GPU): ein Sheet las den LIVE-Pegel seiner Nachbarn, der Nachbar
            // selbst zeigte den Pegel SEINES letzten Baus (das Re-Mesh folgt nur der sichtbaren Dach-Änderung, über
            // Takte verteilt) — die gemeinsame Kante stand auf zwei Höhen (bis 5,9 cm, 68 Stufen an 22 Kanten):
            // durch den Schlitz die dunkle Linie über dem See. Jedes Sheet liest darum das GEZEICHNETE Dach, das
            // die Re-Mesh-Entscheidung schreibt — dieselbe Zahl, die der Nachbar zeichnet.
            getDach: (ncx, ncz) => {
                const e = ncx === cx && ncz === cz ? entry : voxelChunks.get(`${ncx},${ncz}`);
                return e && e._caDach ? e._caDach : undefined;
            },
        };
    }

    // B1 — die THREE-Hülle des Wasser-Sheets (Main-only): die rohen Arrays (Main-sync
    // ODER vom Worker geliefert) → BufferGeometry + geteiltes Hydro-Material + Mesh.
    // Geteilt vom Sync-Pfad UND dem async Worker-Pfad (`_applyWorkerWaterSheet`).
    _finalizeWaterSheetMesh(cx, cz, key, data) {
        if (!this.state.scene || typeof THREE === "undefined") return null;
        if (!this.state.voxelChunkWaterIso) this.state.voxelChunkWaterIso = new Map();
        this._disposeVoxelChunkWaterIso(key);
        // die Arrays des Fadens SIND die Attribute (Lehre 24, Karte hydro-faden): übernommen, nie kopiert — der Sync-Bau
        // liefert Zahlen-Listen, die erst hier ihr Typ-Array bekommen
        const f32 = (a) => (a instanceof Float32Array ? a : new Float32Array(a));
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(f32(data.positions), 3));
        geom.setAttribute("aFlow", new THREE.BufferAttribute(f32(data.aFlow), 2));
        geom.setAttribute("aWave", new THREE.BufferAttribute(f32(data.aWave), 1));
        geom.setAttribute("aDepth", new THREE.BufferAttribute(f32(data.aDepth), 1));
        geom.setAttribute("aSlope", new THREE.BufferAttribute(f32(data.aSlope), 1));
        const ix = data.indices;
        geom.setIndex(new THREE.BufferAttribute(ix instanceof Uint32Array ? ix : new Uint32Array(ix), 1));
        const mat = this._ensureHydroSurfaceMaterial();
        if (!mat) {
            this._queueGeometryDispose(geom);
            this.state.voxelChunkWaterIso.set(key, null);
            return null;
        }
        // CPU-Körper wie der Iso-Pfad; gezeichnet als Bereich im Wasser-Satz (Sync- und Worker-Sheet, ein Eintritt).
        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData = {
            isHydrosphere: true,
            hydroKind: "chunk-water-cellsheet",
            voxelChunkX: cx,
            voxelChunkZ: cz,
        };
        this._chunkSatzEin("wasser", key, geom, key);
        this.state.voxelChunkWaterIso.set(key, mesh);
        return mesh;
    }

    // Die EINE pure-typed-array-Mathematik des Zell-Oberkanten-Sheets: keine THREE-Objekte, Zellen/Level
    // NUR via ctx → der Worker-Mirror `buildWaterSheetGeometry` ist byte-identisch. Liefert
    // {positions, indices, aFlow, aWave, aDepth, aSlope} (plain Arrays) oder null.
    _computeWaterSheetData(cx, cz, ctx) {
        // Wie die Zellen + die Fläche: IMMER LOD0 (V9.93/V18.22 — eine Skala).
        const cfg0 = this._voxelChunkConfig(0);
        const dim = cfg0.dim,
            dimY = cfg0.dimY,
            step = cfg0.step,
            span = cfg0.span;
        const ox = cx * span;
        const oz = cz * span;
        const oy = (this.state.terrainBaseHeight || 0) - cfg0.floorDrop;
        const dimSq = dim * dim;
        const waterLevel = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
        const SMOOTH_PASSES = ctx.smoothPasses;
        const PAD = SMOOTH_PASSES + 1;
        const GW = dim + 2 * PAD;
        const topG = new Float64Array(GW * GW).fill(NaN); // NaN = trocken
        const solidG = new Float64Array(GW * GW); // Boden-Anker (Unterkante der höchsten SOLID-Zelle)
        const depthG = new Float64Array(GW * GW); // Wasser-Säulen-Dicke (aDepth)
        // RUHENDES Wasser je Spalte (1): das Dach IST der Spiegel des Gesetzes — kein Live-Delta, keine Klemme. Seine Vertices
        // tragen den Spiegel des Gesetzes an ihrem eigenen Ort (`addVert`), nie das Mittel der Nachbar-Dächer.
        const ruhG = new Uint8Array(GW * GW);
        for (let ck = -PAD; ck < dim + PAD; ck++) {
            for (let ci = -PAD; ci < dim + PAD; ci++) {
                const gi = ci + PAD + (ck + PAD) * GW;
                // Nachbar-Redirect (V18.18-Muster; PAD < dim → ein Schritt genügt).
                let ncx = cx,
                    ncz = cz,
                    li = ci,
                    lk = ck;
                if (li < 0) {
                    ncx -= 1;
                    li += dim;
                } else if (li >= dim) {
                    ncx += 1;
                    li -= dim;
                }
                if (lk < 0) {
                    ncz -= 1;
                    lk += dim;
                } else if (lk >= dim) {
                    ncz += 1;
                    lk -= dim;
                }
                let src = ctx.getCells(cx, cz);
                let srcCX = cx,
                    srcCZ = cz;
                let dryFallback = false;
                if (ncx !== cx || ncz !== cz) {
                    const nb = ctx.getCells(ncx, ncz);
                    if (nb) {
                        src = nb;
                        srcCX = ncx;
                        srcCZ = ncz;
                    } else {
                        // Symmetrie-Fallback: ein fehlender/trockener Nachbar zählt TROCKEN (reader-unabhängig — ein Clamp
                        // auf die eigene Rand-Spalte gab zwei Chunks am 4-Ecken-Punkt verschiedene Pad-Werte → Naht); der
                        // Boden (nur für den Anker) kommt aus der eigenen Rand-Spalte; Ungeladene heilen beim Re-Enqueue.
                        li = Math.max(0, Math.min(dim - 1, ci));
                        lk = Math.max(0, Math.min(dim - 1, ck));
                        src = ctx.getCells(cx, cz);
                        srcCX = cx;
                        srcCZ = cz;
                        dryFallback = true;
                    }
                }
                // Flood und Boden aus den Zellen; das LIVE-Dach (oberste Zeile + Füllgrad > 0,5) aus dem gezeichneten
                // Dach des Quell-Chunks (`ctx.getDach`, −1 = keins) — nie der Live-Pegel (die Wasser-Naht).
                const dach = ctx.getDach(srcCX, srcCZ);
                const sc = this._caColumnScan(src, null, li + lk * dim, dimSq, dimY);
                const live = dach ? dach[li + lk * dim] : -1;
                solidG[gi] = sc.solidTopJ >= 0 ? oy + sc.solidTopJ * step : oy;
                if (dryFallback) continue; // trocken — topG bleibt NaN (symmetrisch)
                // Live-only-Spalten (der CA trug Wasser in flood-trockene Spalten) sind NASS ab Level > 0.5:
                // Top = Live-Dach (sub-zellig via liveFrac), kein L-Anker (jenseits der statischen Domäne).
                if (sc.floodTopJ < 0) {
                    if (dach && live >= 0) {
                        // V18.377 — depthG (aDepth) wird GLOBAL als KONTINUIERLICHE Tiefe
                        // gesetzt (tops − geglättetes Bett, NACH dem Glätten); hier nur topG.
                        topG[gi] = oy + live * step;
                    }
                    continue; // sonst trocken (topG bleibt NaN)
                }
                // DIE GELEERTE SPALTE IST TROCKEN (K37): trägt das gezeichnete Dach des Automaten in einer Flut-Spalte kein
                // Wasser mehr (−1), ist die Spalte trocken. Bis K37 zeichnete das Sheet sie 14 m unter dem Spiegel (die Klemme
                // des Live-Deltas): eine Grube mit weißen Wänden, Spalte für Spalte eine Treppe. Worker bit-identisch.
                if (dach && live < 0) continue;
                const faceY = oy + (sc.floodTopJ + 1) * step; // Zell-Dach (quantisiert)
                // RUHE: sub-zellig der Body-Spiegel `L` (das Gesetz `_atlasWaterLevelAt`: Ozean, See, der Fluss-Spiegel
                // — stromab nie steigend, quer waagrecht), geklemmt von der Unterkante der Zelle unter dem Dach bis eine
                // Zelle darüber (gegen Atlas/Zell-Drift): die Deck-Zelle (`_buildVoxelChunkWaterCells` 4b) trägt einen
                // Spiegel, der in der obersten festen Zelle liegt (ein Rinnsal über seinem Boden).
                const wx = ox + (ci + 0.5) * step;
                const wz = oz + (ck + 0.5) * step;
                // Das Ufer-Urteil liest die Unterkante der obersten festen Zelle: die Spalte IST nass (das Zell-Gesetz flutete
                // sie über dem tiefsten Boden ihrer Ecken), nur „unbekannt" (−Inf) verliert die Rim-Füllung; bis zur
                // Gegenprüfung 07.10. (Runde 3) las es die Oberkante. Gefragt wird wie im Zell-Gesetz an der Mitte und den
                // vier Ecken (das Höchste): eine Spalte, die das Wasser nur an einer Ecke trägt, zeichnete sonst ihr Zell-Dach.
                let L = this._atlasWaterLevelAt(wx, wz, solidG[gi]);
                for (let e = 0; e < 4; e++) {
                    const le = this._atlasWaterLevelAt(
                        ox + (ci + (e & 1)) * step,
                        oz + (ck + (e >> 1)) * step,
                        solidG[gi]
                    );
                    if (le > L) L = le;
                }
                if (L === -Infinity) L = this._schnittSpiegel(wx, wz, step); // die Flut des Schnitts (F3), wie die Zellen
                let top = L > -Infinity ? Math.max(faceY - 2 * step, Math.min(faceY + step, L)) : faceY;
                let ruht = L > -Infinity && top === L;
                // LIVE: der CA-Delta obendrauf (gezeichnetes Live-Dach − Flood-Dach, geclampt).
                if (dach) {
                    const floodRel = (sc.floodTopJ + 1) * step;
                    let d = live * step - floodRel; // live ≥ 0: die geleerte Spalte ist oben schon trocken
                    if (d > -0.05 && d < 0.05) d = 0;
                    if (d !== 0) ruht = false;
                    top += Math.max(-14, Math.min(4, d));
                }
                topG[gi] = top;
                ruhG[gi] = ruht ? 1 : 0;
                // depthG (aDepth) wird GLOBAL als kontinuierliche Tiefe gesetzt (V18.377, s.u.).
            }
        }
        // Der Boden-Anker ist überhang-blind: `solidG` (erste SOLID-Zelle von oben) wäre unter einem
        // schwebenden Bau der BAU. Für trockene Anker-Spalten (≥1 nasser 4-Nachbar) darum die erste SOLID-
        // Zelle UNTERHALB des höchsten Nachbar-Wasserdachs → Verankerung am Ufer-Fuß. Nasse Spalten brauchen
        // das nicht (kein SOLID über ihrem Wasser → solid-von-oben == Boden).
        const SOLID_CS = AnazhRealm.CELL_STATE.SOLID;
        for (let ck = -PAD; ck < dim + PAD; ck++) {
            for (let ci = -PAD; ci < dim + PAD; ci++) {
                const gi = ci + PAD + (ck + PAD) * GW;
                if (!Number.isNaN(topG[gi])) continue; // nass → Boden stimmt schon
                let nbTop = -Infinity;
                if (ci + 1 < dim + PAD) {
                    const v = topG[gi + 1];
                    if (!Number.isNaN(v) && v > nbTop) nbTop = v;
                }
                if (ci - 1 >= -PAD) {
                    const v = topG[gi - 1];
                    if (!Number.isNaN(v) && v > nbTop) nbTop = v;
                }
                if (ck + 1 < dim + PAD) {
                    const v = topG[gi + GW];
                    if (!Number.isNaN(v) && v > nbTop) nbTop = v;
                }
                if (ck - 1 >= -PAD) {
                    const v = topG[gi - GW];
                    if (!Number.isNaN(v) && v > nbTop) nbTop = v;
                }
                if (nbTop === -Infinity) continue; // kein Wasser angrenzend → Anker irrelevant
                // Redirect wie im Grid-Pass (eigene Rand-Spalte als Fallback).
                let ncx = cx,
                    ncz = cz,
                    li = ci,
                    lk = ck;
                if (li < 0) {
                    ncx -= 1;
                    li += dim;
                } else if (li >= dim) {
                    ncx += 1;
                    li -= dim;
                }
                if (lk < 0) {
                    ncz -= 1;
                    lk += dim;
                } else if (lk >= dim) {
                    ncz += 1;
                    lk -= dim;
                }
                let src = ctx.getCells(cx, cz);
                if (ncx !== cx || ncz !== cz) {
                    const nb = ctx.getCells(ncx, ncz);
                    if (nb) src = nb;
                    else {
                        li = Math.max(0, Math.min(dim - 1, ci));
                        lk = Math.max(0, Math.min(dim - 1, ck));
                        src = ctx.getCells(cx, cz);
                    }
                }
                const colBase = li + lk * dim;
                const fromJ = Math.min(dimY - 1, Math.floor((nbTop - oy) / step) + 1);
                let gj = -1;
                for (let j = fromJ; j >= 0; j--) {
                    if (src[colBase + j * dimSq] === SOLID_CS) {
                        gj = j;
                        break;
                    }
                }
                solidG[gi] = gj >= 0 ? oy + gj * step : oy;
            }
        }
        // Wet-only-Glätten (SMOOTH_PASSES × Radius 1): nimmt 1.8-m-Treppen + CA-Stufen, ohne das Ufer zum
        // Trockenen zu ziehen. Höhen-Gate: ein Nachbar zählt NUR bei |top_nb − top_roh| ≤ BLUR_GATE = 2·step
        // — eine CA-Stufe (≤1 Zelle) soll glätten, ab 2 Zellen ist es eine WAND (sonst zöge der Blur Tal-
        // Dächer über die Klippe → Phantom-Wasserfall). ROH gegen ROH → symmetrisch, naht-frei. Mirror
        // byte-identisch in voxel-worker.js `buildWaterSheetGeometry`; Linse `gate:wasser-wahrheit`.
        const BLUR_GATE = step * 2;
        const topRawG = Float64Array.from(topG);
        let cur = topG;
        let buf = new Float64Array(GW * GW);
        for (let pass = 0; pass < SMOOTH_PASSES; pass++) {
            buf.fill(NaN);
            for (let g = 0; g < GW * GW; g++) {
                if (Number.isNaN(cur[g])) continue;
                const gx = g % GW;
                const gz = (g / GW) | 0;
                let sum = 0;
                let n = 0;
                for (let dz2 = -1; dz2 <= 1; dz2++) {
                    for (let dx2 = -1; dx2 <= 1; dx2++) {
                        const nx = gx + dx2;
                        const nz = gz + dz2;
                        if (nx < 0 || nz < 0 || nx >= GW || nz >= GW) continue;
                        const ng = nx + nz * GW;
                        const v = cur[ng];
                        if (!Number.isNaN(v)) {
                            // V18.475 — das Höhen-Gate (s.o.): nur Dächer derselben Etage.
                            if (Math.abs(topRawG[ng] - topRawG[g]) > BLUR_GATE) continue;
                            sum += v;
                            n++;
                        }
                    }
                }
                buf[g] = sum / n;
            }
            const t = cur;
            cur = buf;
            buf = t;
        }
        const tops = cur;
        const colTop = (ci, ck) => tops[ci + PAD + (ck + PAD) * GW];
        const colWet = (ci, ck) => !Number.isNaN(colTop(ci, ck));
        // SLOPE pro Spalte (|∇top| der geglätteten Dächer) treibt das Wildwasser im Shader. Nass↔nass =
        // Dach-Gefälle; nass↔trocken zählt nur als LIPPE, wenn der Boden > 3 m unter dem Dach liegt —
        // normale Ufer bleiben ruhig.
        const slopeG = new Float32Array(GW * GW);
        for (let gz = 1; gz < GW - 1; gz++) {
            for (let gx = 1; gx < GW - 1; gx++) {
                const g = gx + gz * GW;
                const t0 = tops[g];
                if (Number.isNaN(t0)) continue;
                let mx = 0;
                for (const nb of [g - 1, g + 1, g - GW, g + GW]) {
                    const tn = tops[nb];
                    let d = 0;
                    if (!Number.isNaN(tn)) d = Math.abs(t0 - tn) / step;
                    else if (solidG[nb] < t0 - 3) d = Math.min(4, (t0 - solidG[nb]) / step);
                    if (d > mx) mx = d;
                }
                slopeG[g] = mx;
            }
        }
        // aDepth + aSlope sind Shader-AMPLITUDEN-Treiber (rippleAmt, whitewater) → sie laufen durch DENSELBEN
        // wet-only Box-Blur wie `tops` (über das padded GW-Grid, beide Nachbarn rechnen am Rand denselben
        // Wert) — roh sprangen sie von Zelle zu Zelle und an der Grenze (konzentrisches Naht-Muster).
        // Die Pass-Zahl MUSS ≤ SMOOTH_PASSES sein: nur dann passt der Radius in den PAD (=SMOOTH_PASSES+1),
        // sonst wird die Rand-Trunkierung asymmetrisch → Attribut-Naht. Byte-identisch im Worker-Mirror.
        const _smoothWetAttr = (arr, passes = SMOOTH_PASSES) => {
            const out = new Float64Array(GW * GW);
            for (let pass = 0; pass < passes; pass++) {
                for (let g = 0; g < GW * GW; g++) {
                    if (Number.isNaN(tops[g])) {
                        out[g] = arr[g];
                        continue;
                    }
                    const gx = g % GW;
                    const gz = (g / GW) | 0;
                    let sum = 0;
                    let nn = 0;
                    for (let dz2 = -1; dz2 <= 1; dz2++) {
                        for (let dx2 = -1; dx2 <= 1; dx2++) {
                            const nx = gx + dx2;
                            const nz = gz + dz2;
                            if (nx < 0 || nz < 0 || nx >= GW || nz >= GW) continue;
                            const ng = nx + nz * GW;
                            if (Number.isNaN(tops[ng])) continue; // nur NASSE Nachbarn (kein Ufer-Zug)
                            // V18.475 — dasselbe HÖHEN-GATE wie der tops-Blur (Herleitung dort):
                            // Bett/Slope/Flow bluten nicht über die Klippe — Plateau-Lauf und
                            // Tal-Pool sind zwei Etagen, keine Nachbarn.
                            if (Math.abs(topRawG[ng] - topRawG[g]) > BLUR_GATE) continue;
                            sum += arr[ng];
                            nn++;
                        }
                    }
                    out[g] = nn > 0 ? sum / nn : arr[g];
                }
                for (let g = 0; g < GW * GW; g++) arr[g] = out[g];
            }
        };
        // Kontinuierliche Tiefe: depth = smooth(tops) − smooth(bed), bed = `solidG + step` (Bett-OBERFLÄCHE;
        // ohne +step 1 Zelle zu tief) — stetig über die Breite statt zell-quantisiert (1,8-m-Stufen gaben
        // diskrete Farb-Bänder). KEINE zweite Glättung der Differenz: zwei naht-exakte Felder ergeben eine
        // naht-exakte Differenz; ein weiterer Blur reichte über den Pad. Byte-identisch im Worker.
        const bedG = new Float64Array(GW * GW);
        for (let g = 0; g < GW * GW; g++) bedG[g] = solidG[g] + step;
        _smoothWetAttr(bedG);
        for (let g = 0; g < GW * GW; g++) depthG[g] = Number.isNaN(tops[g]) ? 0 : Math.max(0, tops[g] - bedG[g]);
        // slope ist eine ABLEITUNG (liest tops ±1) → ihr Grenz-Kegel reicht eine Zelle weiter; ein Pass
        // weniger hält ihn im PAD. Rest-Diff am geteilten Vertex ~0.004 (0.1–0.4 % Schaum-Amplitude,
        // unsichtbar); exakt 0 bräuchte PAD+4 (~50 % teurer) — bewusst nicht.
        const slopeGS = new Float64Array(GW * GW);
        for (let g = 0; g < GW * GW; g++) slopeGS[g] = slopeG[g];
        _smoothWetAttr(slopeGS, Math.max(0, SMOOTH_PASSES - 1));
        for (let g = 0; g < GW * GW; g++) slopeG[g] = slopeGS[g];
        // Strömung als geglättetes Spalten-Feld: EIN `_hydroRiverAt`-Sample pro Spalte (GW² statt ~5625
        // Calls) → derselbe wet-only Box-Blur → der Vertex mittelt 4 geglättete Spalten. Ein Pro-Vertex-
        // Mittel binärer Treffer flatterte → riverness/flowMix wechselten das Regime dreieckshart.
        const flowXG = new Float64Array(GW * GW);
        const flowZG = new Float64Array(GW * GW);
        for (let gz = 0; gz < GW; gz++) {
            for (let gx = 0; gx < GW; gx++) {
                const g = gx + gz * GW;
                if (Number.isNaN(tops[g])) continue; // Strömung lebt auf dem WASSER (Anker 0)
                const wxc = ox + (gx - PAD + 0.5) * step;
                const wzc = oz + (gz - PAD + 0.5) * step;
                const rv = this._hydroRiverAt(wxc, wzc);
                if (rv && (rv.flowX || rv.flowZ)) {
                    const m = Math.hypot(rv.flowX, rv.flowZ) || 1;
                    flowXG[g] = rv.flowX / m;
                    flowZG[g] = rv.flowZ / m;
                }
            }
        }
        _smoothWetAttr(flowXG);
        _smoothWetAttr(flowZG);
        // Vertex-Grid (dim+1)²: Vertex (i,k) = Ecke der Spalten (i−1,k−1)…(i,k).
        const NV = dim + 1;
        const positions = [];
        const indices = [];
        const aFlow = [];
        const aWave = [];
        const aDepth = [];
        const aSlope = [];
        const vmap = new Int32Array(NV * NV).fill(-1);
        const vertIsAnchor = []; // V18.114 — pro Vertex: Anker (kein nasser Nachbar)?
        // Welt-deterministischer Vertex-Jitter gegen Gitter-Moiré: das reguläre 1,8-m-Gitter aliast am
        // grazing-Blick; ein kleiner horizontaler Versatz pro Vertex aus dem GLOBALEN Grid-Index (cx·dim+i)
        // macht daraus inkohärentes Rauschen. Naht-sicher (Rand-Vertices teilen den Index). Integer-Hash
        // (Math.imul/>>>0) → byte-identisch im Worker (diag-worker-watersheet 0).
        const _jhash = (a, b) => {
            let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
            h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
            return ((h ^ (h >>> 16)) >>> 0) / 4294967296 - 0.5;
        };
        const _jitAmp = step * 0.6;
        const addVert = (i, k) => {
            const vi = i + k * NV;
            if (vmap[vi] >= 0) return vmap[vi];
            const wx = ox + i * step;
            const wz = oz + k * step;
            let sum = 0;
            let n = 0;
            let rohMin = Infinity;
            let rohMax = -Infinity;
            let ruht = true;
            let dsum = 0;
            let sfx = 0;
            let sfz = 0;
            let slopeMax = 0;
            let anchor = Infinity;
            for (const [aci, ack] of [
                [i - 1, k - 1],
                [i, k - 1],
                [i - 1, k],
                [i, k],
            ]) {
                const gi2 = aci + PAD + (ack + PAD) * GW;
                const v = colTop(aci, ack);
                if (!Number.isNaN(v)) {
                    sum += v;
                    n++;
                    if (topRawG[gi2] < rohMin) rohMin = topRawG[gi2];
                    if (topRawG[gi2] > rohMax) rohMax = topRawG[gi2];
                    if (!ruhG[gi2]) ruht = false;
                    dsum += depthG[gi2];
                    sfx += flowXG[gi2];
                    sfz += flowZG[gi2];
                    if (slopeG[gi2] > slopeMax) slopeMax = slopeG[gi2];
                }
                const sv = solidG[gi2];
                if (sv < anchor) anchor = sv;
            }
            // UNIFORMER Jitter (keine Steigungs-Skala): `slopeMax` ist pro Chunk verschieden → verschiedene
            // Magnituden an Rand-Vertices = Riss. Gleiche Amplitude + globaler-Index-Hash → Rand-Vertices fallen
            // exakt zusammen; auf flachem Wasser ist horizontaler Jitter unsichtbar. `slopeMax` bleibt für
            // aSlope/Whitewater.
            const _jdir = _jhash(cx * dim + i, cz * dim + k) * _jitAmp;
            const _jdir2 = _jhash(cz * dim + k + 8191, cx * dim + i + 131071) * _jitAmp;
            // Nasser Vertex: RUHT das Wasser aller nassen Nachbar-Spalten, trägt er den Spiegel des Gesetzes an seinem
            // eigenen Ort (dieselbe Zahl, die der Körper dort liest, `_koerperWasser`; jenseits der Krone der Fluss-Spiegel quer,
            // `_hydroSpiegelQuer`), gehalten zwischen die rohen Dächer der nassen Nachbar-Spalten (ein fremdes Wasser am Ort des
            // Vertex — ein See-Feld daneben — hebt ihn nie) — das Mittel der GEGLÄTTETEN Dächer zog am Ende eines steilen Laufs
            // das Wasser unter den Boden
            // (Quelle der Kachel −1624/−1080: Spiegel 74,04, gezeichnet 73,00, Boden 73,62). Sonst (Live-Delta, Klemme) das
            // geglättete Wasser-Dach. Anker-Vertex (kein nasser Nachbar): UNTER das Terrain (`solidG` = Unterkante der
            // höchsten SOLID-Zelle), MIN über die 4 Nachbar-Spalten — nie MAX (griffe an Klippen/Überhängen die Wand →
            // schwebende Kante); die Kante taucht am Ufer-Fuß ein.
            let surfY = anchor - 0.5;
            if (n > 0 && ruht) {
                const Lv = this._atlasWaterLevelAt(wx + _jdir, wz + _jdir2, Infinity);
                const Lq = Lv > -Infinity ? Lv : this._hydroSpiegelQuer(wx + _jdir, wz + _jdir2);
                surfY = Lq > -Infinity ? Math.max(rohMin, Math.min(rohMax, Lq)) : rohMax;
            } else if (n > 0) surfY = sum / n;
            const depthM = n > 0 ? dsum / n : 0;
            const id = positions.length / 3;
            vertIsAnchor[id] = n === 0;
            positions.push(wx + _jdir, surfY, wz + _jdir2);
            // aFlow: der Vertex mittelt die 4 geglätteten Nachbar-Spalten von flowXG/flowZG (sfx/sfz im
            // wet-Loop) → kein Regime-Patchwork, naht-exakt; der Blur trägt das Tapern zur Mündung/Bank.
            const flowN = n > 0 ? n : 1;
            const avFx = sfx / flowN;
            const avFz = sfz / flowN;
            // aWave = Höhen-Rampe (Nähe zum Meeresspiegel) × Art-Dämpfung: die Fluss-Abdeckung fmag ist DIESELBE
            // Rampe, mit der der Shader die Strähnen blendet (riverness) → Meeres-Wellen laufen sanft in die
            // Mündung ein, wo die Strähnen ausfaden. Seen bleiben still (uLakeRipple trägt ihr Kräuseln).
            const heightRamp = Math.max(0, Math.min(1, 1 - (Math.abs(surfY - waterLevel) - 0.8) / 2.0));
            const rt = Math.max(0, Math.min(1, (Math.hypot(avFx, avFz) - 0.04) / 0.46));
            const riverness = rt * rt * (3 - 2 * rt);
            const isLake = n > 0 && heightRamp > 0 && this._hydrosphereLakeAt(wx, wz);
            aWave.push(isLake ? 0 : heightRamp * (1 - riverness));
            aDepth.push(depthM);
            aSlope.push(n > 0 ? slopeMax : 0);
            aFlow.push(avFx, avFz);
            vmap[vi] = id;
            return id;
        };
        // Quad-Emission: eine Zelle (i,k) rendert, wenn ihre Spalte nass ist ODER ein 4-Nachbar (Anker-Ring).
        // Steil-Split: überspannt ein Quad > VERT_SPLIT (3·step) vertikal, wird es nicht gestreckt, sondern
        // DECK bis zur Lippe + senkrechter VORHANG (wasserdicht an beide Sheets); der Vorhang trägt
        // aSlope-Maximum → das Wildwasser schäumt den Fall weiß.
        const VERT_SPLIT = step * 3;
        const dupVert = (srcId, nx, ny, nz, slopeOverride) => {
            const id = positions.length / 3;
            positions.push(nx, ny, nz);
            aWave.push(aWave[srcId]);
            aDepth.push(aDepth[srcId]);
            aSlope.push(slopeOverride !== undefined ? slopeOverride : aSlope[srcId]);
            aFlow.push(aFlow[srcId * 2], aFlow[srcId * 2 + 1]);
            return id;
        };
        for (let k = 0; k < dim; k++) {
            for (let i = 0; i < dim; i++) {
                if (!(colWet(i, k) || colWet(i - 1, k) || colWet(i + 1, k) || colWet(i, k - 1) || colWet(i, k + 1)))
                    continue;
                const v00 = addVert(i, k);
                const v10 = addVert(i + 1, k);
                const v01 = addVert(i, k + 1);
                const v11 = addVert(i + 1, k + 1);
                const y00 = positions[v00 * 3 + 1];
                const y10 = positions[v10 * 3 + 1];
                const y01 = positions[v01 * 3 + 1];
                const y11 = positions[v11 * 3 + 1];
                const hi = Math.max(y00, y10, y01, y11);
                const lo = Math.min(y00, y10, y01, y11);
                // Der Split wirkt NUR zwischen NASSEN Säulen (echter Fall) — ein Anker-Quad (eine Ecke trocken)
                // MUSS eintauchen, sonst hebt das Deck den Anker auf Lippen-Höhe (schwebende Ufer-Kanten).
                const anyAnchor = vertIsAnchor[v00] || vertIsAnchor[v10] || vertIsAnchor[v01] || vertIsAnchor[v11];
                if (anyAnchor || hi - lo <= VERT_SPLIT) {
                    // Wicklung → -Y-Normale (BackSide-Oberseite), wie Fläche + Iso.
                    indices.push(v00, v10, v01, v11, v01, v10);
                    continue;
                }
                // dominante Fall-Achse: X (links↔rechts) oder Z (vorn↔hinten).
                const dX = Math.abs((y00 + y01) / 2 - (y10 + y11) / 2);
                const dZ = Math.abs((y00 + y10) / 2 - (y01 + y11) / 2);
                // hiA/hiB = die hohe Kante, loA/loB = die tiefe (A/B = die zwei
                // Vertices der jeweiligen Kante, konsistent gepaart).
                let hiA, hiB, loA, loB;
                if (dX >= dZ) {
                    if ((y00 + y01) / 2 >= (y10 + y11) / 2) {
                        hiA = v00;
                        hiB = v01;
                        loA = v10;
                        loB = v11;
                    } else {
                        hiA = v10;
                        hiB = v11;
                        loA = v00;
                        loB = v01;
                    }
                } else if ((y00 + y10) / 2 >= (y01 + y11) / 2) {
                    hiA = v00;
                    hiB = v10;
                    loA = v01;
                    loB = v11;
                } else {
                    hiA = v01;
                    hiB = v11;
                    loA = v00;
                    loB = v10;
                }
                const lipY = (positions[hiA * 3 + 1] + positions[hiB * 3 + 1]) / 2;
                // DECK: von der hohen Kante horizontal bis über die tiefen Vertices (deren XZ), auf Lippen-Höhe.
                // WICKLUNG exakt wie das Original-Quad (v00,v10,v01 / v11,v01,v10 → -Y-Normale, BackSide-Oberseite),
                // die tiefen Ecken durch ihre Lippen-Dups ersetzt — sonst ny>0-Decks (der W1-Test fängt es).
                const dA = dupVert(loA, positions[loA * 3], lipY, positions[loA * 3 + 2]);
                const dB = dupVert(loB, positions[loB * 3], lipY, positions[loB * 3 + 2]);
                const rep = (v) => (v === loA ? dA : v === loB ? dB : v);
                indices.push(rep(v00), rep(v10), rep(v01), rep(v11), rep(v01), rep(v10));
                // VORHANG: senkrecht von der Lippe auf die tiefen Original-
                // Vertices (teilt deren Position → wasserdicht ans untere Sheet).
                // aSlope = 4 (Cap) → der Shader schäumt den Fall weiss.
                const cA = dupVert(loA, positions[loA * 3], lipY, positions[loA * 3 + 2], 4);
                const cB = dupVert(loB, positions[loB * 3], lipY, positions[loB * 3 + 2], 4);
                const fA = dupVert(loA, positions[loA * 3], positions[loA * 3 + 1], positions[loA * 3 + 2], 4);
                const fB = dupVert(loB, positions[loB * 3], positions[loB * 3 + 1], positions[loB * 3 + 2], 4);
                // beide Wicklungen (der Fall ist von beiden Seiten sichtbar —
                // ein Vorhang hat keine „Unterseite", die der BackSide-Cull
                // verstecken müsste; zwei Dreieck-Paare = double-faced).
                indices.push(cA, fA, cB, fB, cB, fA);
                indices.push(cB, fB, cA, fA, cA, fB);
            }
        }
        if (indices.length === 0) return null;
        return { positions, indices, aFlow, aWave, aDepth, aSlope };
    }

    // V9.72 (Welle C.2) — Iso-Wasser-Mesh disposen. Geometry wird disposed,
    // Material ist welt-global geteilt → NICHT disposen (V9.43-a-Lehre).
    _disposeVoxelChunkWaterIso(key) {
        if (!this.state.voxelChunkWaterIso) return;
        const mesh = this.state.voxelChunkWaterIso.get(key);
        this._chunkSatzAus("wasser", key); // DER SATZ: der Bereich wird frei, der Index legt sich neu
        if (mesh) {
            // V10.0-j.d — geometry.dispose deferred (siehe _queueGeometryDispose).
            this._queueGeometryDispose(mesh.geometry);
        }
        this.state.voxelChunkWaterIso.delete(key);
    }

    // EIN geteiltes Material für alle Voxel-Chunks, lazy beim ersten Build (PBR via
    // `_buildToonNodeMaterial`). NIEMALS disposen — sonst sterben alle Chunks mit; `_disposeVoxelChunk`
    // räumt nur Geometrie.
    _getVoxelChunkMaterial() {
        if (this.state.voxelChunkMaterial) return this.state.voxelChunkMaterial;
        const mat = this._buildToonNodeMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            geomorph: true,
            wegeKarte: true,
            himmelsSicht: true, // die Verdeckung des Himmels-Lichts und die Normale der Höhle (`_buildPbrNodeMaterial`)
            felsImVertex: true, // die Vertex-Farbe IST der Fels-Stoff (`_felsStoff`), der Shader legt nur die feinen Bänke auf
        });
        this.state.voxelChunkMaterial = mat;
        return mat;
    }

    // Wasser-Iso deferred: `_buildVoxelChunkWaterIsoSurface` ist ~78 ms Main-Thread (schwerster Posten im
    // Finalize). Der Chunk finalisiert sofort mit Terrain + Boden + Collision (kein Loch), der Wasser-Iso
    // wird enqueued und ≤budget/Frame gebaut — kein Pile-Up mehrerer Wasser-Chunks in einem Frame.
    _enqueueWaterIso(cx, cz) {
        if (!this.state.pendingWaterIso) this.state.pendingWaterIso = new Set();
        this.state.pendingWaterIso.add(`${cx},${cz}`);
    }

    // Wasser-Sheet OFF-THREAD im Worker. true = Anfrage abgesetzt (Worker bereit · "cells"-Default · 3×3
    // nicht aktiv-fließend [`_waterSheetCaFree`] · Chunk trägt Wasser), sonst false → Aufrufer baut SYNC. Bereit heißt das EINE
    // Prädikat des Fadens (`_voxelFadenTraegt`, B-K2), nie der Ack: der Auftrag reist hinter dem init der Geburt.
    // BUILD-BEFORE-DISPOSE (altes Sheet bleibt bis zur Antwort) + STALE-Schutz (geprunt → weg; State-
    // Bump zwischen Request und Antwort → sync neu über `_buildVoxelChunkWaterIsoSurface`). Aufrufer:
    // Finalize (vor dem CA-Wake) + Streaming-Tick; Carve/Edit/Test bleiben sync.
    _tryWorkerWaterSheet(cx, cz) {
        if (!this._voxelFadenTraegt() || !this._waterSheetCaFree(cx, cz)) return false;
        const key = `${cx},${cz}`;
        const entry = this.state.voxelChunks ? this.state.voxelChunks.get(key) : null;
        if (!entry || !entry.waterCells) return false; // kein Wasser → der Aufrufer baut sync (Map null)
        const genAtRequest = this._voxelStand(cx, cz);
        this._workerBuildWaterSheet(cx, cz)
            .then((data) => {
                if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) return; // gepruned
                if (this._voxelStand(cx, cz) !== genAtRequest) {
                    // Welt-State driftete (Carve/Regen) → die gesendeten Zellen sind stale → sync neu.
                    this._buildVoxelChunkWaterIsoSurface(cx, cz);
                    return;
                }
                if (!data || data.empty) {
                    this._disposeVoxelChunkWaterIso(key);
                    if (this.state.voxelChunkWaterIso) this.state.voxelChunkWaterIso.set(key, null);
                    return;
                }
                this._finalizeWaterSheetMesh(cx, cz, key, data);
            })
            .catch((e) => {
                // ein Worker-Fehler bricht laut beim Namen (K22); das Blatt baut danach der Haupt-Thread nach demselben
                // Gesetz (bit-identischer Spiegel) — kein verlorenes Wasser
                this._stoffBruch("das Wasser-Blatt " + key + " (Worker)", e);
                if (this.state.voxelChunks && this.state.voxelChunks.has(key))
                    this._buildVoxelChunkWaterIsoSurface(cx, cz);
            });
        return true;
    }

    // Der Streaming-Tick-Pfad: Worker (off-thread) ODER sync-Fallback.
    _buildWaterSheetStreaming(cx, cz) {
        if (!this._tryWorkerWaterSheet(cx, cz)) this._buildVoxelChunkWaterIsoSurface(cx, cz);
    }

    _tickPendingWaterIso(maxPerFrame = 4, deadlineMs = Infinity) {
        const queue = this.state.pendingWaterIso;
        if (!queue || queue.size === 0) return 0;
        // Zeit-Budget zusätzlich zum Count-Budget: maxPerFrame deckelt nur die Anzahl (4 große Ozean-Isos =
        // 33 ms). Nach JEDEM Build gegen die Frame-Deadline prüfen (ein Build überschießt höchstens einmal).
        // Deadline aus _loopVoxelStreaming; Default Infinity hält Test-/Drain-Pfade count-deterministisch.
        const _isoT0 = performance.now();
        // Nach Spieler-Distanz priorisieren: nahe Seen zuerst (sonst staut die Queue — jeder Chunk-Build
        // enqueued 4 Nachbarn — und nahe Seen verlieren ihr Iso-Mesh). Chunks weit außerhalb des Sicht-Rings
        // fliegen raus (werden ohnehin gepruned) → die Queue bleibt begrenzt.
        const pm = this.state.playerMesh ? this.state.playerMesh.position : null;
        const span = this._voxelChunkConfig(0).span;
        let keys = [...queue];
        if (pm) {
            const pcx = Math.floor((pm.x + span / 2) / span);
            const pcz = Math.floor((pm.z + span / 2) / span);
            const ring = (this.state.chunkRingRadius || 4) + 2;
            const distOf = (k) => {
                const ci = k.indexOf(",");
                const kx = parseInt(k.slice(0, ci), 10);
                const kz = parseInt(k.slice(ci + 1), 10);
                return Math.max(Math.abs(kx - pcx), Math.abs(kz - pcz));
            };
            // ferne (jenseits Sicht-Ring) verwerfen, Rest sortieren: ERST DIE LÜCKE — ein Chunk ohne aufgelöstes Sheet
            // zeigt sein leeres Seebett (seit V18.530 deckt kein Lade-Nebel die Wasser-Front), eine Auffrischung (der
            // Wasser-Automat, die Nachbarn) behält ihr altes Sheet bis zum Neubau; je Gruppe nah zuerst. Gemessen 05.10.
            // (echte GPU, Gang nach Norden, 5 m/s): bis 10 gebaute Chunks gleichzeitig ohne Wasser, der längste 210
            // Takte — die Auffrischungen fließenden Wassers belegten die Plätze.
            for (const k of keys) if (distOf(k) > ring) queue.delete(k);
            const wi = this.state.voxelChunkWaterIso;
            const luecke = (k) => (wi && wi.has(k) ? 1 : 0);
            keys = [...queue].sort((a, b) => luecke(a) - luecke(b) || distOf(a) - distOf(b));
        }
        // Anti-Starvation: (maxPerFrame−1) Slots nah-zuerst, der LETZTE Slot baut den ÄLTESTEN Eintrag (Set-
        // Insertion-Order = FIFO; ein Re-Add ändert sie nicht) → bounded Wartezeit für jeden Key. Reine
        // Distanz-Priorität + CA-Nachschub naher Keys ließe ferne Ozean-Chunks nie drankommen (Loch-Streifen).
        let built = 0;
        const distBudget = Math.max(1, maxPerFrame - 1);
        for (const key of keys) {
            if (built >= distBudget) break;
            if (built > 0 && performance.now() - _isoT0 > deadlineMs) break; // V18.261 Zeit-Deadline (≥1 garantiert)
            queue.delete(key);
            // Chunk inzwischen weg (gepruned)? Dann nichts bauen.
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            // Streaming-Sheet baut im Worker (CA-frei), sonst sync; auf dem Main bleibt nur Zell-Copy +
            // postMessage, die Zeit-Deadline deckelt weiter.
            this._buildWaterSheetStreaming(cx, cz);
            built++;
        }
        // FIFO-Tail (Anti-Starvation): nur wenn das Count-Budget UND die
        // Zeit-Deadline noch Luft haben (built===0 garantiert immer ≥1 Build).
        if (built < maxPerFrame && (built === 0 || performance.now() - _isoT0 <= deadlineMs)) {
            for (const key of queue) {
                queue.delete(key);
                if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
                const comma = key.indexOf(",");
                const cx = parseInt(key.slice(0, comma), 10);
                const cz = parseInt(key.slice(comma + 1), 10);
                this._buildWaterSheetStreaming(cx, cz);
                built++;
                break;
            }
        }
        return built;
    }

    // Alle ausstehenden Wasser-Iso-Builds sofort abarbeiten (Test-Naht +
    // Edit-Instant-Feedback): wer den Wasser-Mesh DIREKT nach einem Build
    // prüft/braucht, drained die Queue. Im Spiel läuft der per-Frame-Tick.
    _drainPendingWaterIso() {
        const queue = this.state.pendingWaterIso;
        if (!queue || queue.size === 0) return 0;
        let built = 0;
        for (const key of [...queue]) {
            queue.delete(key);
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            this._buildVoxelChunkWaterIsoSurface(cx, cz);
            built++;
        }
        return built;
    }

    // EIN deterministischer Tick des zellulären Wasser-Automaten über `level[idx]` ∈ [0,1] (Füllgrad) +
    // `cells[idx]` (SOLID blockt), zwei erhaltende Pässe: (1) GRAVITÄT top-down in-place (kaskadiert) in
    // die Zelle darunter, soweit Kapazität; (2) LATERAL per Delta-Puffer, jedes Paar (+i, +k) symmetrisch
    // Richtung Mittel (Rate < 0.5 für Stabilität). Pur über die Arrays (headless beweisbar), lokal, nicht
    // persistiert, kein Worker-Mirror. Rückgabe: Zahl bewegter Zellen (active-cell-only).
    _tickWaterCA(level, cells, dim, dimY, rate = 0.25, deltaScratch = null, band = null, cap = null) {
        const SOLID = AnazhRealm.CELL_STATE.SOLID;
        const dimSq = dim * dim;
        const EPS = 1e-4;
        // `moved` = die MAGNITUDE des bewegten Wassers (nicht Zell-Zahl) → der active-cell-Settle
        // greift, wenn die Lache wirklich ruht (Zell-Zahl bliebe bei langsamem Ausgleich ewig hoch).
        let moved = 0;
        // y-Band: der Tick läuft nur über die belegten Zeilen [band.jMin .. band.jMax], semantik-identisch zum
        // Voll-Sweep (Invariante: außerhalb level 0): die Gravitations-Kaskade folgt `gMin` nach unten, das
        // Band wird am Ende neu gemessen. `band = null` = Voll-Sweep (erster Tick nach Seed).
        const jHi = band ? Math.min(dimY - 1, band.jMax) : dimY - 1;
        const jLo = band ? Math.max(0, band.jMin) : 0;
        if (jHi < jLo) {
            if (band) {
                band.jMin = dimY;
                band.jMax = -1;
            }
            return 0;
        }
        // (1) GRAVITÄT — von oben nach unten, damit eine Säule in einem Tick durchkaskadiert.
        // `gMin` = tiefste Zeile, in die Wasser fiel: der Loop folgt der Kaskade unter das
        // Band (break, sobald keine Kaskade tiefer reicht) — exakt wie der Voll-Sweep.
        let gMin = Math.max(1, jLo);
        for (let j = jHi; j >= 1; j--) {
            if (j < gMin) break;
            const baseJ = j * dimSq;
            const belowJ = (j - 1) * dimSq;
            for (let c = 0; c < dimSq; c++) {
                const here = baseJ + c;
                const lv = level[here];
                if (lv <= EPS || cells[here] === SOLID) continue;
                const below = belowJ + c;
                if (cells[below] === SOLID) continue;
                const cap = 1 - level[below];
                if (cap <= EPS) continue;
                const flow = lv < cap ? lv : cap;
                level[here] = lv - flow;
                level[below] += flow;
                moved += flow;
                if (j - 1 < gMin) gMin = j - 1;
            }
        }
        // (2) LATERAL: jedes (+i)- und (+k)-Paar EINMAL, symmetrischer Transfer → exakte Erhaltung. Scratch
        // wird wiederverwendet und NUR im Fenster [rowLo..jHi] genullt — darunter ist er stale vom vorigen
        // Chunk, nie lesen.
        const rowLo = Math.max(0, Math.min(jLo, gMin));
        const winLo = rowLo * dimSq;
        const winHi = (jHi + 1) * dimSq;
        let delta = deltaScratch;
        if (delta && delta.length >= level.length) delta.fill(0, winLo, winHi);
        else delta = new Float64Array(level.length);
        // Receiver-Support: lateral nur in einen GESTÜTZTEN Empfänger (darunter SOLID oder ≥ 0.9 gefüllt; j=0
        // zählt gestützt) — Wasser fällt zuerst. Ohne die Regel diffundiert die oberste Schicht ewig in die
        // Ufer-Luft (Chunk settled nie); so füllt ein Carve Schicht für Schicht von unten.
        const SUPPORT = 0.9;
        // Distanz-Decay: jeder LATERALE Transfer liefert nur CA_FLOW_KEEP (95 %) ab → Wasser dünnt geometrisch
        // mit der Hop-Entfernung (0.95^n), Pooling fern der Quelle stirbt. Gravitation bleibt verlustfrei.
        // Die EINE bewusste Dissipation — ohne sie flutet die geschlossene Ring-Domäne.
        const KEEP = AnazhRealm.CA_FLOW_KEEP;
        // EPS_FLOW ≈ (1−KEEP): mit KEEP<1 bleibt an jeder Quell-Grenze ein Rest-Gefälle (Gleichgewicht
        // KEEP·Quelle) — ohne die Schwelle pumpt der Automat ewig; so ist der Decay-Zustand ein Fixpunkt.
        const EPS_FLOW = (1 - KEEP) * 1.1 + EPS;
        for (let j = rowLo; j <= jHi; j++) {
            const baseJ = j * dimSq;
            for (let k = 0; k < dim; k++) {
                const baseK = k * dim;
                for (let i = 0; i < dim; i++) {
                    const here = baseJ + baseK + i;
                    if (cells[here] === SOLID) continue;
                    const lv = level[here] + delta[here];
                    // +i-Nachbar
                    if (i + 1 < dim) {
                        const nb = here + 1;
                        if (cells[nb] !== SOLID) {
                            const diff = lv - (level[nb] + delta[nb]);
                            if (diff > EPS_FLOW || diff < -EPS_FLOW) {
                                const recv = diff > 0 ? nb : here;
                                const recvBelow = recv - dimSq;
                                // V18.93 — SPIEGEL-KAPPE: kein Zufluss über die Spalten-Kappe
                                // (rim-L bzw. Boden+Skin) — Wasser steigt nie über seinen Spiegel.
                                if (
                                    (!cap || j <= cap[recv % dimSq]) &&
                                    (recvBelow < 0 || cells[recvBelow] === SOLID || level[recvBelow] >= SUPPORT)
                                ) {
                                    const t = diff * rate;
                                    if (t > 0) {
                                        delta[here] -= t;
                                        delta[nb] += t * KEEP;
                                    } else {
                                        delta[here] -= t * KEEP;
                                        delta[nb] += t;
                                    }
                                    moved += t > 0 ? t : -t;
                                }
                            }
                        }
                    }
                    // +k-Nachbar
                    if (k + 1 < dim) {
                        const nb = here + dim;
                        if (cells[nb] !== SOLID) {
                            const diff = lv - (level[nb] + delta[nb]);
                            if (diff > EPS_FLOW || diff < -EPS_FLOW) {
                                const recv = diff > 0 ? nb : here;
                                const recvBelow = recv - dimSq;
                                // V18.93 — SPIEGEL-KAPPE: kein Zufluss über die Spalten-Kappe
                                // (rim-L bzw. Boden+Skin) — Wasser steigt nie über seinen Spiegel.
                                if (
                                    (!cap || j <= cap[recv % dimSq]) &&
                                    (recvBelow < 0 || cells[recvBelow] === SOLID || level[recvBelow] >= SUPPORT)
                                ) {
                                    const t = diff * rate;
                                    if (t > 0) {
                                        delta[here] -= t;
                                        delta[nb] += t * KEEP;
                                    } else {
                                        delta[here] -= t * KEEP;
                                        delta[nb] += t;
                                    }
                                    moved += t > 0 ? t : -t;
                                }
                            }
                        }
                    }
                }
            }
        }
        // Anwenden + das Band aus dem IST neu messen (Zeilen mit Wasser > EPS).
        let nMin = dimY;
        let nMax = -1;
        for (let n = winLo; n < winHi; n++) {
            const v = level[n] + delta[n];
            const c = v < 0 ? 0 : v > 1 ? 1 : v;
            level[n] = c;
            if (c > EPS) {
                const j = (n / dimSq) | 0;
                if (j < nMin) nMin = j;
                if (j > nMax) nMax = j;
            }
        }
        if (band) {
            band.jMin = nMin;
            band.jMax = nMax;
        }
        return moved;
    }

    // Reaktive Wasser-Level-Schicht: `state.waterLevelCells` ("cx,cz" → Float32Array) lebt SEPARAT von
    // den Chunk-Entries (überlebt Carve-Rebuilds), lokal, nicht persistiert, kein Worker-Mirror. Seed aus
    // der statischen Flood; danach autonom (Level + SOLID-Maske).
    _seedWaterLevel(cells) {
        const WATER = AnazhRealm.CELL_STATE.WATER;
        const level = new Float32Array(cells.length);
        for (let i = 0; i < cells.length; i++) if (cells[i] === WATER) level[i] = 1.0;
        return level;
    }

    // ===== DAS HOCH-BECKEN: der Stau-Spiegel (Regel an AnazhRealm.CA_STAU) =====
    // Abgeleitet aus persistierter Wahrheit (worldMeta.voxelEdits + architectures.blockerAABBs): jeder Faden rechnet die Felder
    // (`_stauFelder` bestellt sie), der Spiegel des Kerns trägt sie (gelaende-core `stauSpiegel` in `atlasSpiegel`).

    // Die Stau-Werke der Welt, zu Clustern verschmolzen (ein Damm aus vielen Blöcken/Fill-Kugeln ist EIN
    // Werk). Deterministisch (stabile Listen-Ordnung).
    // DER STAU KOSTET SEINE ÄNDERUNG (w4-b-pflanzen, Lehre 25): gemerkt am Stand dessen, was ein Werk trägt — die Edits (Liste,
    // Länge), die Bauten (die Liste: eine neue Welt; die Hülle jedes Baus, der staut oder staute: `_blockerStampReach` und
    // `removeArchitecture` werfen das Gedächtnis) und die Wahrheit des Wassers unter den Werken (`traegt`: Kacheln, Pegel,
    // Erdbau, Hydrosphäre). Bis hierhin warf jeder neue Eintrag (die Länge der Liste) das Gedächtnis — jeder gepflanzte Baum
    // las alle Bauten neu (gate:worker-dichte --faden am Damm: 29 von 141 Rufen über 1,5 ms über ~3 000 Einträgen, der
    // längste 10,7–29,4 ms über dem Deckel 8 ms).
    _stauWorkClusters() {
        const meta = this.state.worldMeta;
        const edits = meta && Array.isArray(meta.voxelEdits) ? meta.voxelEdits : null;
        const archs = Array.isArray(this.state.architectures) ? this.state.architectures : null;
        const eLen = edits ? edits.length : 0;
        const kacheln = this.state.hydroTiles ? this.state.hydroTiles.size : 0;
        const [pegel, erdbau, hydro] = [this._pegelTafelGilt, this._erdbauStand | 0, this.state.hydrosphere];
        const c = this._stauClusterCache;
        if (
            c &&
            c.edits === edits &&
            c.eLen === eLen &&
            c.archs === archs &&
            c.kacheln === kacheln &&
            c.pegel === pegel &&
            c.erdbau === erdbau &&
            c.hydro === hydro
        )
            return c.clusters;
        const CFG = AnazhRealm.CA_STAU;
        // Die Krone muss über dem lokalen Ruhe-Spiegel liegen (eine Atlas-Probe je Werk); Werke fern jedes
        // Wassers (rim=−Inf) bleiben drin. Die Rim-Frage reist mit der Werk-Basis (botY): Basis unter dem
        // Spiegel ⇒ rim greift, darüber ⇒ trocken-fundiert, bleibt drin.
        const traegt = (w) => {
            const rim = this._atlasWaterLevelAt(
                (w.minX + w.maxX) * 0.5,
                (w.minZ + w.maxZ) * 0.5,
                Number.isFinite(w.botY) ? w.botY : -Infinity
            );
            return !(rim > -Infinity && w.topY <= rim + 0.9);
        };
        const qualified = [];
        for (let i = 0; i < eLen; i++) {
            const e = edits[i];
            if (!e || e.mode !== "fill") continue;
            const r = Number(e.r) || 0;
            if (r * 2 < CFG.MIN_EXTENT) continue;
            const w = {
                minX: e.x - r,
                maxX: e.x + r,
                minZ: e.z - r,
                maxZ: e.z + r,
                topY: (Number(e.y) || 0) + r,
                botY: (Number(e.y) || 0) - r,
            };
            if (traegt(w)) qualified.push(w);
        }
        if (archs) {
            // Stau-Qualifikation: ein Architektur-AABB zählt NUR als Damm, wenn es (a) GEERDET ist (Basis ≤ 1
            // Sim-Zelle = 1,8 m über dem Terrain seiner Spalte) UND (b) GESCHLOSSEN (deckt in BEIDEN Achsen ≥ 1
            // volle Sim-Zelle) und DICHT (`AnazhRealm._stauBox`: kein Wagen, keine Pflanze, keine Brücke mit Durchlass) —
            // schmaler versiegelt keine Spalte; Pfosten, dünne Wände, Stege fallen, ein Haus
            // wird nie zum Damm. Fill-Edits sind Terrain (bleiben). Linse: `gate:wasser-wahrheit` Fixture 4,
            // Stau-Harness `gate:carve`. Geschlossen und geerdet sind je Bau gemerkt (seine Hülle und ihre Länge): ein Takt fragt
            // nur einen neuen Bau (Lehre 25) — bis gk2-damm-faden fragte jeder neue Bau jede Box jedes Baus (die Fahrt nach Osten:
            // bis 76 000 Boxen, 3–6 ms im Haupt-Faden je neuem Bau, 12 ms am Damm).
            const CELL = this._voxelChunkConfig(0).step;
            const je = this._stauBauWerke || (this._stauBauWerke = new WeakMap());
            for (const entry of archs) {
                const huelle = entry && entry.blockerAABBs;
                if (!huelle) continue;
                let m = je.get(entry);
                if (!m || m.huelle !== huelle || m.n !== huelle.length || m.cell !== CELL) {
                    je.set(entry, (m = { huelle, n: huelle.length, cell: CELL, werke: [] }));
                    for (const a of huelle) {
                        if (!AnazhRealm._stauBox(a, CELL)) continue; // (b) geschlossen und dicht
                        const terrY = this._terrainMacroSurfaceY((a.minX + a.maxX) * 0.5, (a.minZ + a.maxZ) * 0.5);
                        if (Number.isFinite(terrY) && Number.isFinite(a.botY) && a.botY > terrY + CELL) continue; // (a) geerdet
                        const box = {
                            minX: a.minX,
                            maxX: a.maxX,
                            minZ: a.minZ,
                            maxZ: a.maxZ,
                            topY: a.topY,
                            botY: a.botY,
                        };
                        m.werke.push(Object.assign({ bauten: [box] }, box)); // der Bau steht nicht in der Dichte: seine Box hält
                    }
                }
                for (const w of m.werke) if (traegt(w)) qualified.push(w);
            }
        }
        const GAP = CFG.CLUSTER_GAP;
        const clusters = [];
        for (const w of qualified) {
            let merged = {
                minX: w.minX,
                maxX: w.maxX,
                minZ: w.minZ,
                maxZ: w.maxZ,
                topY: w.topY,
                bauten: w.bauten || [],
            };
            let changed = true;
            while (changed) {
                changed = false;
                for (let i = clusters.length - 1; i >= 0; i--) {
                    const cl = clusters[i];
                    if (cl.minX - GAP > merged.maxX || merged.minX - GAP > cl.maxX) continue;
                    if (cl.minZ - GAP > merged.maxZ || merged.minZ - GAP > cl.maxZ) continue;
                    merged = {
                        minX: Math.min(cl.minX, merged.minX),
                        maxX: Math.max(cl.maxX, merged.maxX),
                        minZ: Math.min(cl.minZ, merged.minZ),
                        maxZ: Math.max(cl.maxZ, merged.maxZ),
                        topY: Math.max(cl.topY, merged.topY),
                        bauten: cl.bauten.concat(merged.bauten),
                    };
                    clusters.splice(i, 1);
                    changed = true;
                }
            }
            clusters.push(merged);
        }
        for (const cl of clusters)
            cl.key =
                `${Math.round(cl.minX)},${Math.round(cl.minZ)},${Math.round(cl.maxX)},` +
                `${Math.round(cl.maxZ)},${Math.round(cl.topY)}`;
        this._stauClusterCache = { edits, eLen, archs, kacheln, pegel, erdbau, hydro, clusters };
        return clusters;
    }

    // DER STAU IM FADEN (gelaende.K2 (b), Lehre 14): je Takt und Edit fragt der Stamm nur, ob sich ein Werk änderte (die Cluster
    // sind nach Edits, den Hüllen der stauenden Bauten und der Wahrheit des Wassers gemerkt, `_stauWorkClusters`) oder eine
    // Hydro-Kachel kam, und wählt die Werke über Wasser
    // (gelaende-core `stauWerkY`; Werke und Wahl lesen das Gesetz ohne Stau). Kam ein Werk über Wasser, fiel eines oder ein Edit,
    // reist der Auftrag (diese Werke, die Regel `CA_STAU`) über den EINEN Sender des Zustands an jeden Faden, und jeder rechnet
    // die Felder an derselben Stelle seiner Reihe (gelaende-core `stauFelder`, voxel-worker `stauRechnen`). Nur der Voxel-Faden
    // trägt die Rückfrage-Nummer und reicht sie per Transfer zurück (`stau-result` → `_stauAn`); EIN Auftrag ist im Flug, die
    // Edits dahinter sammelt der nächste. Bis gk2-damm-faden rechnete der Haupt-Faden jedes Feld selbst (44–69 ms je Damm-Edit).
    _stauFelder() {
        const h = this.state.hydrosphere;
        const w = this.state.voxelWorker;
        if (!w || this._stauImFlug === w || !(h && h.ready)) return;
        const kacheln = this.state.hydroTiles ? this.state.hydroTiles.size : 0;
        const edits = (this.state.worldMeta && this.state.worldMeta.voxelEdits) || [];
        this._stauRechnet = true;
        let werke;
        try {
            const clusters = this._stauWorkClusters();
            if (this._stauVon === clusters && this._stauKacheln === kacheln) return;
            [this._stauVon, this._stauKacheln] = [clusters, kacheln];
            const L = this._gelaende();
            werke = clusters.filter((cl) => globalThis.__gelaendeCore.stauWerkY(L, cl) > -Infinity);
        } finally {
            this._stauRechnet = false;
        }
        const stand = `${werke.map((cl) => cl.key).join(";")}|${edits.length}|${kacheln}`;
        if (stand === this._stauStand) return;
        this._stauStand = stand;
        if (this._stauHoert !== w) {
            this._stauHoert = w;
            w.addEventListener("message", ({ data: a }) => {
                if (a && (a.type === "stau-result" || (a.type === "error" && a.op === "stau"))) this._stauAn(a);
            });
        }
        this._stauImFlug = w;
        const requestId = this.state.voxelWorkerNextRequestId++;
        this._voxelZustandPost({
            type: "stau",
            werke,
            gesetz: AnazhRealm.CA_STAU,
            welt: this._hydroWelt | 0,
            requestId,
        });
    }

    // DER EMPFANG DES STAUS (`_stauFelder`): die gerechneten Felder des Voxel-Fadens gehen in den Zustand (`waterStau`, der Spiegel
    // des Kerns liest sie über die Lage), die Zellen der Fenster, deren Feld kam, fiel oder neu gerechnet ist, fallen (Neubau,
    // die Flut liest den neuen Spiegel), der Automat wacht. Der Stau einer alten Welt fällt; ein Wurf des Fadens bricht laut.
    // DER STAND DES FENSTERS STEIGT (ci-werk-wasser): jeder Chunk-Bau, den der Faden vor diesen Feldern rechnete, fällt — im Flug
    // (der Stand-Filter `_voxelStand` liest die Generation je Chunk, `_chunkGenKarte`, wie beim Erdbau) und im Cache, nicht nur
    // der gezeichnete Chunk. Bis hierhin trat ein Chunk, dessen Bau beim Empfang im Flug war oder im Cache lag, ohne das
    // Stau-Wasser ein und blieb so — nach dem Reload am Damm der Prüfbühne 1072 statt 1142 nasse Punkte (CI 40441173506), unter
    // 4× Drossel 1047, nach einem Neubau des Fensters 1142 (gate:werk-im-wasser D, die Gegenprobe des Neubaus).
    _stauAn(a) {
        this._stauImFlug = null;
        if (a.type === "error")
            return void this._bruchMelden(`STAU-FADEN: die Felder des Staus kamen nicht — ${a.message}`);
        if (a.welt !== (this._hydroWelt | 0)) return;
        if (a.felder) this.state.waterStau = a.felder;
        const span = this._voxelChunkConfig(0).span;
        const gen = this._chunkGenKarte || (this._chunkGenKarte = new Map());
        const cache = this.state.voxelMeshCache;
        for (const f of a.anders) {
            const [x, z, r] = [
                (f.gx0 + f.w * 0.5) * f.step,
                (f.gz0 + f.h * 0.5) * f.step,
                Math.max(f.w, f.h) * 0.5 * f.step,
            ];
            this._editGenZaehler = (this._editGenZaehler || 0) + 1;
            for (let cx = Math.floor((x - r) / span); cx <= Math.floor((x + r) / span); cx++)
                for (let cz = Math.floor((z - r) / span); cz <= Math.floor((z + r) / span); cz++) {
                    gen.set((cx + 32768) * 65536 + (cz + 32768), this._editGenZaehler);
                    if (cache) for (let lod = 0; lod <= 3; lod++) cache.delete(`${cx},${cz},${lod}`);
                }
            this._remeshVoxelChunksAround(x, z, r, 0);
            this._invalidateWaterCapsAround(x, z, r);
        }
    }

    // Der EINE Invalidations-Eingang nach einer Werk-Änderung (Edit / Architektur-Spawn/-Remove, ein neuer Stau): Kappen +
    // Quell-Markierungen der Region verwerfen + CA wecken — NACH dem Rebuild: der Lazy-Neubau legt das Level auf das Gesetz
    // der neuen Zellen (`_ensureWaterCALevel`).
    _invalidateWaterCapsAround(x, z, r) {
        const cfg = this._voxelChunkConfig(0);
        const R = (Number(r) || 0) + (AnazhRealm.CA_STAU.REACH + 4) * cfg.step + AnazhRealm.CA_STAU.CLUSTER_GAP;
        const minCX = Math.floor((x - R) / cfg.span);
        const maxCX = Math.floor((x + R) / cfg.span);
        const minCZ = Math.floor((z - R) / cfg.span);
        const maxCZ = Math.floor((z + R) / cfg.span);
        for (let cx = minCX; cx <= maxCX; cx++) {
            for (let cz = minCZ; cz <= maxCZ; cz++) {
                const key = `${cx},${cz}`;
                if (this.state.waterCapJ) this.state.waterCapJ.delete(key);
                if (this.state.waterSourceCols) this.state.waterSourceCols.delete(key);
                this._wakeWaterCA(cx, cz);
            }
        }
    }

    // EIN Seed-Eingang der CA-Level-Schicht: seedet aus den AKTUELLEN Zellen, markiert einmalig die
    // Quell-Spalten (Atlas-Wasser), legt das y-Band an (voll → der erste Tick misst).
    _ensureWaterCALevel(cx, cz) {
        const key = `${cx},${cz}`;
        const entry = this.state.voxelChunks ? this.state.voxelChunks.get(key) : null;
        if (!entry || entry.empty || !entry.waterCells || (Number.isFinite(entry.lod) && entry.lod !== 0)) return null;
        if (!this.state.waterLevelCells) this.state.waterLevelCells = new Map();
        if (!this.state.waterCABand) this.state.waterCABand = new Map();
        let lv = this.state.waterLevelCells.get(key);
        if (!lv) {
            lv = this._seedWaterLevel(entry.waterCells);
            this.state.waterLevelCells.set(key, lv);
            // Frischer Seed → das Band VOLL resetten (ein stale Band aus einer früheren
            // Level-Epoche würde das frische Wasser band-unsichtbar machen).
            const cfg = this._voxelChunkConfig(0);
            this.state.waterCABand.set(key, { jMin: 0, jMax: cfg.dimY - 1 });
        } else if (!this.state.waterCABand.has(key)) {
            const cfg = this._voxelChunkConfig(0);
            this.state.waterCABand.set(key, { jMin: 0, jMax: cfg.dimY - 1 });
        }
        // Quell-Spalten (einmalig je Eintrag, 576 Atlas-Probes) = unendliches Reservoir, der Pin füllt ihre
        // WATER-Zellen nach. Dazu die Kappe `waterCapJ` je Spalte (höchste Zeile, in die Wasser ZUFLIESSEN
        // darf). Reine EMPFÄNGER-Regel im Lateral-Pass → erhaltungs-neutral; Decay allein bändigt den
        // hydrostatischen Pool neben der Quelle nicht.
        // DIE RUHE IST DER FIXPUNKT (K37, 13.10.): die Kappe einer Spalte, die das Gesetz flutet, ist ihre oberste
        // Flut-Zelle — erwacht der Automat über ruhendem Wasser (jede Werk-Setzung am Ufer weckt ihn), bewegt er
        // nichts. Bis K37 lag die Kappe dort eine Zeile über der Ruhe (Spiegel + 0,5 m): die Deck-Zelle (4b, eine
        // volle Zelle über dem Spiegel ihrer Nachbarn) floss in die Zeile über dem See und aufs Land, die flachen
        // Ufer-Spalten leerten sich, und das Sheet zeichnete sie 14 m unter dem Spiegel — das weiße Treppen-Band am
        // See der Solitär-Eiche (nach dem Wecken 424 von 1594 Spalten gerissen, Wildwasser 105 → 1944 Vertices).
        // EINE FLÄCHE (F3, Graben am Fluss): eine trockene Spalte nimmt kein Wasser des Automaten — den Raum, den ein Schnitt
        // am Wasser öffnet, flutet das Gesetz selbst (`_buildVoxelChunkWaterCells`: über der geschnittenen Spalte der Fluss-
        // Spiegel quer), und das Level hält mindestens das Gesetz (unten). Bis F3 nahm sie, wo ein Schnitt in der Region lag,
        // im Atlas-Gebiet bis Spiegel + 0,5 m, jenseits Boden + 2 Zellen (die „fließende Haut“): ein Graben 1 m neben dem
        // Fluss der Mess-Wiese flutete die Aue über dem Spiegel (700 Punkte zu 0,25 m², bis 0,76 m über dem Boden), das Sheet
        // zeichnete das Dach des Automaten als zweite, zackige Fläche neben dem Spiegel (414 Punkte bis 0,77 m daneben), und
        // der Automat ruhte erst nach 600 Takten (2 554 Sheet-Bauten). Ein Stau ist Gesetz (`_stauFelder`): die Zellen fluten ihn.
        if (!this.state.waterSourceCols) this.state.waterSourceCols = new Map();
        if (!this.state.waterCapJ) this.state.waterCapJ = new Map();
        if (!this.state.waterSourceCols.has(key) || !this.state.waterCapJ.has(key)) {
            const cfg = this._voxelChunkConfig(0);
            const dim = cfg.dim;
            const dimY = cfg.dimY;
            const dimSq = dim * dim;
            const cells = entry.waterCells;
            const src = new Uint8Array(dimSq);
            const cap = new Int16Array(dimSq);
            const ox = cx * cfg.span;
            const oz = cz * cfg.span;
            const WATER = AnazhRealm.CELL_STATE.WATER;
            for (let k = 0; k < dim; k++) {
                for (let i = 0; i < dim; i++) {
                    const c = i + k * dim;
                    const wx = ox + (i + 0.5) * cfg.step;
                    const wz = oz + (k + 0.5) * cfg.step;
                    if (this._atlasWaterLevelAt(wx, wz, Infinity) > -Infinity) src[c] = 1;
                    let flutJ = -1; // die oberste Flut-Zelle: die Ruhe des Gesetzes in dieser Spalte (Fluss, See, Stau)
                    for (let j = dimY - 1; j >= 0 && flutJ < 0; j--) if (cells[c + j * dimSq] === WATER) flutJ = j;
                    cap[c] = flutJ; // trocken: -1
                }
            }
            // DAS LEVEL HÄLT DAS GESETZ (F3): mit jeder neuen Kappe (nach jedem Schnitt) trägt jede Flut-Zelle ihr Wasser, und
            // über der Kappe steht keins — das Level aus dem Stand vor dem Schnitt (die Deck-Zelle der Fluss-Spalte, über deren
            // Bett jetzt der Graben liegt; der trockene Graben vor der Flut) ist kein Wasser der Welt mehr. Die Ruhe ist der
            // Fixpunkt: der Automat bewegt danach nichts, was das Gesetz trägt. Bis F3 trug die Verdunstung (`CA_EVAP`) die
            // Zungen des Automaten über trockenem Grund ab; seit nur das Gesetz und ein Stau Wasser halten, träfe sie nur
            // Gehaltenes — sie fiel mit der Haut.
            for (let c = 0; c < dimSq; c++)
                for (let j = 0; j < dimY; j++) {
                    const idx = c + j * dimSq;
                    if (j > cap[c]) lv[idx] = 0;
                    else if (cells[idx] === WATER) lv[idx] = 1;
                }
            this.state.waterCABand.set(key, { jMin: 0, jMax: dimY - 1 }); // der erste Takt misst das Band neu
            this.state.waterSourceCols.set(key, src);
            this.state.waterCapJ.set(key, cap);
        }
        return lv;
    }

    // Der active-cell-Kern: ein Chunk tickt NUR, wenn er „aktiv" ist (frisch perturbiert). Der Carve
    // weckt seine Region → das Wasser strömt in den neuen Raum; ein Fluss über die Grenze weckt den
    // Nachbarn (cross-chunk-wake). Settled Chunks fallen raus (kein Voll-Sweep → 30→1100 FPS, §2.3).
    _wakeWaterCA(cx, cz) {
        if (!this.state.waterCAActive) this.state.waterCAActive = new Set();
        this.state.waterCAActive.add(`${cx},${cz}`);
    }

    // T4a-2/3 — EIN Welt-Tick des Wasser-Automaten über die AKTIVEN LOD0-Chunks. Lokal-reaktiv,
    // budgetiert (settled → inaktiv). Der cross-chunk-wake ist möglich, WEIL T1/T2 die Grenze
    // kohärent machten (eine konsistente Nachbar-Zell-Wahrheit — die These des ganzen Bogens).
    _tickWorldWaterCA() {
        const activeSet = this.state.waterCAActive;
        if (!activeSet || activeSet.size === 0 || !this.state.voxelChunks) return 0;
        // V18.292 — deterministischer Tick-Zähler für den Fluss-Re-Mesh-Throttle
        // (frame-basiert, KEINE Wall-Clock → headless deterministisch + sichtbar).
        this.state._caTickCount = (this.state._caTickCount || 0) + 1;
        if (!this.state.waterLevelCells) this.state.waterLevelCells = new Map();
        const cfg = this._voxelChunkConfig(0);
        const dim = cfg.dim,
            dimY = cfg.dimY;
        const need = dim * dim * dimY;
        if (!this.state.waterCAScratch || this.state.waterCAScratch.length < need)
            this.state.waterCAScratch = new Float64Array(need);
        const scratch = this.state.waterCAScratch;
        const SETTLE = 0.25; // bewegte MAGNITUDE < SETTLE → der Chunk ruht, raus aus active (active-cell)
        const dimSq = dim * dim;
        const WATER = AnazhRealm.CELL_STATE.WATER;
        const bandMap = this.state.waterCABand || (this.state.waterCABand = new Map());
        const srcMap = this.state.waterSourceCols;
        const active = [];
        for (const key of [...activeSet]) {
            const entry = this.state.voxelChunks.get(key);
            if (!entry || entry.empty || !entry.waterCells || (Number.isFinite(entry.lod) && entry.lod !== 0)) {
                activeSet.delete(key);
                continue;
            }
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            // W-B — EIN Seed-Eingang (`_ensureWaterCALevel`): Level + Quell-Spalten + y-Band.
            const lv = this._ensureWaterCALevel(cx, cz);
            if (!lv) {
                activeSet.delete(key);
                continue;
            }
            active.push({
                cx,
                cz,
                key,
                level: lv,
                cells: entry.waterCells,
                band: bandMap.get(key),
                cap: this.state.waterCapJ ? this.state.waterCapJ.get(key) : null,
            });
        }
        let total = 0;
        for (const a of active) {
            // Quellen-Pin: Atlas-Wasser-Spalten (See/Fluss/Ozean) sind unendliche Reservoirs — ihre WATER-Zellen
            // werden je Tick zur Flood-Ruhe aufgefüllt (ein See speist den gegrabenen Kanal bis zu dessen Niveau).
            // Die EINE bewusste Nicht-Erhaltung; zählt als Bewegung (Chunk bleibt aktiv, solange er nachspeist).
            // Pin VOR dem Tick.
            const src = srcMap ? srcMap.get(a.key) : null;
            let pinned = 0;
            if (src) {
                const cells = a.cells;
                const level = a.level;
                const band = a.band;
                for (let c = 0; c < dimSq; c++) {
                    if (!src[c]) continue;
                    for (let j = 0; j < dimY; j++) {
                        const idx = c + j * dimSq;
                        if (cells[idx] === WATER && level[idx] < 1) {
                            pinned += 1 - level[idx];
                            level[idx] = 1;
                            if (band) {
                                if (j < band.jMin) band.jMin = j;
                                if (j > band.jMax) band.jMax = j;
                            }
                        }
                    }
                }
            }
            a.moved = pinned + this._tickWaterCA(a.level, a.cells, dim, dimY, 0.25, scratch, a.band, a.cap);
            total += a.moved;
        }
        // cross-chunk-wake: Level über die +x/+z-Grenzen austauschen; ein Transfer weckt den Nachbarn.
        for (const a of active) {
            for (const [dx, dz] of [
                [1, 0],
                [0, 1],
            ]) {
                const nkey = `${a.cx + dx},${a.cz + dz}`;
                const nb = this.state.voxelChunks.get(nkey);
                if (!nb || nb.empty || !nb.waterCells || (Number.isFinite(nb.lod) && nb.lod !== 0)) continue;
                const bLevel = this._ensureWaterCALevel(a.cx + dx, a.cz + dz);
                if (!bLevel) continue;
                const touch = { jMin: dimY, jMax: -1 };
                const xfer = this._exchangeWaterBoundary(
                    a.level,
                    a.cells,
                    bLevel,
                    nb.waterCells,
                    dx,
                    dim,
                    dimY,
                    touch,
                    a.cap,
                    this.state.waterCapJ ? this.state.waterCapJ.get(nkey) : null
                );
                if (xfer > 0.01) {
                    this._wakeWaterCA(a.cx + dx, a.cz + dz);
                    a.moved += xfer;
                    // W-B — beide y-Bänder um die WIRKLICH berührten Zeilen weiten.
                    const nbBand = bandMap.get(nkey);
                    for (const b of [a.band, nbBand]) {
                        if (!b) continue;
                        if (touch.jMin < b.jMin) b.jMin = touch.jMin;
                        if (touch.jMax > b.jMax) b.jMax = touch.jMax;
                    }
                }
            }
            // Isotropie: auch mit INAKTIVEN −x/−z-Nachbarn tauschen (sonst läuft das Grenz-Paar nie, Wasser
            // propagiert nur nach Ost/Süd). Ist der Nachbar aktiv, führt ER das Paar als +x/+z aus (kein Doppel).
            for (const [dx, dz] of [
                [-1, 0],
                [0, -1],
            ]) {
                const wx = a.cx + dx,
                    wz = a.cz + dz;
                const wkey = `${wx},${wz}`;
                if (activeSet.has(wkey)) continue;
                const nb = this.state.voxelChunks.get(wkey);
                if (!nb || nb.empty || !nb.waterCells || (Number.isFinite(nb.lod) && nb.lod !== 0)) continue;
                const wLevel = this._ensureWaterCALevel(wx, wz);
                if (!wLevel) continue;
                // Der Nachbar ist die A-Seite des Paars (sein fernes i/k=dim−1 ↔ unser 0).
                const touch = { jMin: dimY, jMax: -1 };
                const xfer = this._exchangeWaterBoundary(
                    wLevel,
                    nb.waterCells,
                    a.level,
                    a.cells,
                    dx === -1 ? 1 : 0,
                    dim,
                    dimY,
                    touch,
                    this.state.waterCapJ ? this.state.waterCapJ.get(wkey) : null,
                    a.cap
                );
                if (xfer > 0.01) {
                    this._wakeWaterCA(wx, wz);
                    a.moved += xfer;
                    const nbBand = bandMap.get(wkey);
                    for (const b of [a.band, nbBand]) {
                        if (!b) continue;
                        if (touch.jMin < b.jMin) b.jMin = touch.jMin;
                        if (touch.jMax > b.jMax) b.jMax = touch.jMax;
                    }
                }
            }
        }
        // Bewegte Chunks neu rendern (die Entscheidung legt das Dach als Wunsch ab, `_caRoofChanged`), budgetiert
        // über `pendingWaterIso` (4/Frame), nur bei echter Bewegung. Eingereiht wird der Chunk SELBST: sein Bau
        // zeichnet das neue Dach und reiht dann die 8 Nachbarn ein, die es über ±3 Spalten lesen
        // (`_buildVoxelChunkWaterCellSheet`) — nie früher (ein Nachbar vor dem Chunk gebaut zeigte ein Dach, das
        // der Chunk noch nicht zeigt). Nur SUBSTANZIELLE Bewegung (> 0.5) re-meshed live; der Schelf-Trickle
        // bekommt beim Settle EIN finales Mesh (sonst Dauer-Churn).
        if (!this.state.pendingWaterIso) this.state.pendingWaterIso = new Set();
        const enqueueZeichnen = (cx2, cz2) => {
            const rkey = `${cx2},${cz2}`;
            const re = this.state.voxelChunks.get(rkey);
            if (re && re.waterCells) this.state.pendingWaterIso.add(rkey);
        };
        // Re-Mesh nur bei sichtbarer Dach-Änderung: `moved` ist Brutto-Durchfluss (stationärer Fluss > 0.5).
        // Dach-Fingerprint (`_caRoofFingerprint`: oberste nasse Zeile + Füllgrad je Spalte, im y-Band) gegen
        // `entry._caMeshFp`: re-mesh bei max|Δ| > 0.25 (3×3-Glätten ÷9 → ~5 cm im Bild) ODER Σ|Δ| > 1.0
        // (breite Drift; FP schreibt nur beim Überschreiten fort). Geprüft nur alle CA_REMESH_TICK_INTERVAL
        // Ticks, VOR `_caRoofChanged` (mutiert den FP). Das Settle-Final-Mesh bleibt unbedingt.
        const caTick = this.state._caTickCount;
        const REMESH_INT = AnazhRealm.CA_REMESH_TICK_INTERVAL;
        for (const a of active) {
            if (a.moved <= 0.5) continue;
            const e = this.state.voxelChunks.get(a.key);
            const last = e && Number.isFinite(e._caRemeshTick) ? e._caRemeshTick : -Infinity;
            if (caTick - last < REMESH_INT) continue;
            if (this._caRoofChanged(a, dim, dimY)) {
                if (e) e._caRemeshTick = caTick;
                enqueueZeichnen(a.cx, a.cz);
            }
        }
        for (const a of active) {
            if (a.moved < SETTLE) {
                // Der Settle-Final-Mesh teilt den Fluss-Throttle: ein perpetueller Fluss ping-pongt zwischen moved >
                // 0.5 und < SETTLE — ohne Throttle re-meshte dieser Zweig jeden Zyklus. Solange das Intervall nicht um
                // ist, BLEIBT die Region aktiv (kein delete) → der Final-Mesh kommt binnen ≤ INT Frames.
                // DER FIXPUNKT SCHLÄFT (feld.K3): die Drossel hält nur einen Chunk wach, dessen Dach vom gezeichneten abweicht
                // (sein Final-Mesh kommt nach ihr) — wer kein neues Dach trägt, ruht sofort. Bis feld.K3 hielt sie jeden Chunk
                // bis zu INT Takte (am Fluss nach zwei Werk-Setzungen ohne Bewegung 9 Chunks 3 Takte, gate:stand-takt WS).
                const e = this.state.voxelChunks.get(a.key);
                const last = e && Number.isFinite(e._caRemeshTick) ? e._caRemeshTick : -Infinity;
                if (caTick - last < REMESH_INT && this._caRoofChanged(a, dim, dimY, true)) continue;
                activeSet.delete(a.key);
                // das finale RUHE-Mesh — ABER auch hier durchs Dach-Gate
                // (V18.121): ist der FP unverändert, IST der letzte sichtbare
                // Stand schon gezeichnet — nichts zu tun.
                if (this._caRoofChanged(a, dim, dimY)) {
                    if (e) e._caRemeshTick = caTick;
                    enqueueZeichnen(a.cx, a.cz);
                }
            }
        }
        return total;
    }

    // Dach-Fingerprint: je Spalte (dim²) das Live-Dach, das das Zell-Sheet zeichnet (`_caColumnScan`: oberste nicht-feste
    // Zeile mit Pegel > 0,5, j + Füllgrad). Bis F3 zählte er jede Zeile über 0,05 — ein Film, der am Rand eines Grabens um
    // 0,05 pendelte, sprang den Fingerprint um 89 Zeilen und baute das Sheet samt acht Nachbarn neu, ohne dass sich ein
    // Dreieck änderte. Vergleicht gegen `entry._caMeshFp` und schreibt bei Überschreiten (oder force=true, Settle) fort.
    // Scratch wiederverwendet (alloc-frei), band-beschränkt (außerhalb des Bands kein Wasser). `nurPruefen`: die Frage ohne
    // Fortschreiben (der Settle hinter der Drossel).
    _caRoofChanged(a, dim, dimY, nurPruefen) {
        const entry = this.state.voxelChunks ? this.state.voxelChunks.get(a.key) : null;
        if (!entry) return true;
        const dimSq = dim * dim;
        let fp = this.state._caFpScratch;
        if (!fp || fp.length < dimSq) fp = this.state._caFpScratch = new Float32Array(dimSq);
        const jHi = a.band ? Math.min(dimY - 1, a.band.jMax) : dimY - 1;
        const jLo = a.band ? Math.max(0, a.band.jMin) : 0;
        const level = a.level;
        const SOLID = AnazhRealm.CELL_STATE.SOLID;
        for (let c = 0; c < dimSq; c++) {
            let v = 0;
            for (let j = jHi; j >= jLo; j--) {
                const lv = level[j * dimSq + c];
                if (lv > 0.5 && a.cells[j * dimSq + c] !== SOLID) {
                    v = j + lv;
                    break;
                }
            }
            fp[c] = v;
        }
        const old = entry._caMeshFp;
        const neu = !old || old.length !== dimSq;
        let maxAbs = 0;
        let sumAbs = 0;
        for (let c = 0; !neu && c < dimSq; c++) {
            const d = fp[c] - old[c];
            const ad = d < 0 ? -d : d;
            if (ad > maxAbs) maxAbs = ad;
            // Nur signifikante Spalten-Deltas (> 0.12) in die Summe: Quell-Pin-Spalten jittern dauerhaft ~0.05-0.1
            // (unsichtbar) und summierten sich sonst über viele Spalten auf > 1.0 → Re-Mesh jeden Frame für ein
            // unverändertes Bild. Breite Drift triggert weiter; maxAbs (0.25) fängt jede sichtbare Einzel-Spalte.
            if (ad > 0.12) sumAbs += ad;
        }
        const anders = neu || maxAbs > 0.25 || sumAbs > 1.0;
        if (!anders || nurPruefen) return anders;
        if (neu) entry._caMeshFp = new Float32Array(fp.subarray(0, dimSq));
        else old.set(fp.subarray(0, dimSq));
        entry._caDachNeu = this._caDachAus(a.level, a.cells, dim, dimY, entry._caDachNeu);
        entry._caDachOffen = true;
        return true;
    }

    // DAS GEZEICHNETE DACH eines Chunks: je Spalte die oberste nicht-solide Zeile mit Pegel > 0,5 plus ihr Füllgrad
    // (j + frac, −1 = keins) — exakt was das Zell-Sheet als Live-Dach rendert (`_caColumnScan`, derselbe Kern).
    // Die Re-Mesh-Entscheidung (`_caRoofChanged`) legt es als WUNSCH ab (`_caDachNeu`); gezeichnet wird es erst mit
    // dem EIGENEN Bau des Chunks (`_buildVoxelChunkWaterCellSheet` macht es zu `_caDach` und reiht die acht Nachbarn
    // ein). So liest jeder Nachbar immer genau das Dach, das der Chunk gerade zeigt — die Kante steht auf EINER Höhe.
    _caDachAus(level, cells, dim, dimY, out) {
        const dimSq = dim * dim;
        const d = out && out.length === dimSq ? out : new Float64Array(dimSq);
        for (let c = 0; c < dimSq; c++) {
            const sc = this._caColumnScan(cells, level, c, dimSq, dimY);
            d[c] = sc.liveTopJ >= 0 ? sc.liveTopJ + sc.liveFrac : -1;
        }
        return d;
    }

    // Level-Austausch über die gemeinsame Chunk-Grenze (lateral über die Naht, symmetrisch = Erhaltung).
    // dx=1: A.i=dim-1 ↔ B.i=0; dz=1: A.k=dim-1 ↔ B.k=0. Liefert die übertragene Menge. `touch` ({jMin,
    // jMax}) wird auf die WIRKLICH berührten Zeilen geweitet — damit weitet der Aufrufer die y-Bänder
    // BEIDER Chunks (die Union der alten Bänder reicht nicht: externe Level-Writes liegen ggf. außerhalb).
    _exchangeWaterBoundary(aLevel, aCells, bLevel, bCells, dx, dim, dimY, touch = null, aCap = null, bCap = null) {
        const SOLID = AnazhRealm.CELL_STATE.SOLID;
        const dimSq = dim * dim;
        const rate = 0.25;
        let xfer = 0;
        const SUPPORT = 0.9; // W-B — dieselbe Receiver-Support-Regel wie der Lateral-Pass
        const KEEP = AnazhRealm.CA_FLOW_KEEP; // V18.93 — derselbe Distanz-Decay über die Naht
        const EPS_FLOW = (1 - KEEP) * 1.1 + 1e-4; // V18.93 — der Decay-Fixpunkt (s. _tickWaterCA)
        for (let j = 0; j < dimY; j++) {
            const baseJ = j * dimSq;
            for (let s = 0; s < dim; s++) {
                const aIdx = dx === 1 ? baseJ + s * dim + (dim - 1) : baseJ + (dim - 1) * dim + s;
                const bIdx = dx === 1 ? baseJ + s * dim : baseJ + s;
                if (aCells[aIdx] === SOLID || bCells[bIdx] === SOLID) continue;
                const diff = aLevel[aIdx] - bLevel[bIdx];
                if (diff > EPS_FLOW || diff < -EPS_FLOW) {
                    // Empfänger gestützt? (darunter SOLID oder ≥0.9; j=0 = Weltboden)
                    const rcCells = diff > 0 ? bCells : aCells;
                    const rcLevel = diff > 0 ? bLevel : aLevel;
                    const rcIdx = diff > 0 ? bIdx : aIdx;
                    const rcCap = diff > 0 ? bCap : aCap;
                    if (rcCap && j > rcCap[rcIdx % dimSq]) continue; // V18.93 — Spiegel-Kappe
                    const rcBelow = rcIdx - dimSq;
                    if (rcBelow >= 0 && rcCells[rcBelow] !== SOLID && rcLevel[rcBelow] < SUPPORT) continue;
                    const t = diff * rate;
                    if (t > 0) {
                        aLevel[aIdx] -= t;
                        bLevel[bIdx] += t * KEEP;
                    } else {
                        aLevel[aIdx] -= t * KEEP;
                        bLevel[bIdx] += t;
                    }
                    xfer += t > 0 ? t : -t;
                    if (touch) {
                        if (j < touch.jMin) touch.jMin = j;
                        if (j > touch.jMax) touch.jMax = j;
                    }
                }
            }
        }
        return xfer;
    }

    // Der EINE Spalten-Scan-Kern des Zell-Sheets, top-down über EINE Spalte: höchste WATER-Zelle (Flood-
    // Ruhe), höchste nicht-solide Zelle mit Live-Level > 0.5 (nur mit `level`), höchste SOLID-Zelle
    // (Boden-Anker, liegt immer UNTER dem Wasser der Spalte).
    _caColumnScan(cells, level, colBase, dimSq, dimY) {
        const WATER = AnazhRealm.CELL_STATE.WATER;
        const SOLID = AnazhRealm.CELL_STATE.SOLID;
        const wantLive = !!level;
        let floodTopJ = -1,
            liveTopJ = -1,
            liveFrac = 0,
            solidTopJ = -1;
        for (let j = dimY - 1; j >= 0; j--) {
            const idx = colBase + j * dimSq;
            const c = cells[idx];
            if (floodTopJ < 0 && c === WATER) floodTopJ = j;
            if (solidTopJ < 0 && c === SOLID) solidTopJ = j;
            if (wantLive && liveTopJ < 0 && c !== SOLID && level[idx] > 0.5) {
                liveTopJ = j;
                liveFrac = level[idx];
            }
            if (floodTopJ >= 0 && solidTopJ >= 0 && (!wantLive || liveTopJ >= 0)) break;
        }
        return { floodTopJ, liveTopJ, liveFrac, solidTopJ };
    }

    // Welle A — die Gras-Queue synchron leeren (Test-Naht, Spiegel von
    // `_drainPendingWaterIso`): das Gras ist seit Welle A deferred, die Tests
    // brauchen es sofort nach einem Drain/Streaming.
    _drainPendingGrass() {
        const queue = this.state.pendingGrass;
        if (!queue || queue.size === 0) return 0;
        let built = 0;
        for (const key of [...queue]) {
            queue.delete(key);
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            if (this.state.voxelChunkGrass && this.state.voxelChunkGrass.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            this._buildVoxelChunkGrass(cx, cz);
            built++;
        }
        return built;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_wasser_zellen]);

// ===== ATLAS · Wasser/zellen — Außen-Konstanten =====
// Der Saum des gezeichneten Wassers (`_wasserBildAt`): die Vertices eines Wasser-Sheets sind bis 0,3 · 1,8 m = 0,54 m versetzt
// (der Gitter-Jitter in `_computeWaterSheetData`) — ein Punkt bis so nah an der Chunk-Kante kann im Sheet des Nachbarn liegen.
AnazhRealm.WASSER_BILD_RAND = 0.6;

// Distanz-Decay des Wasser-Automaten: jeder LATERALE Transfer liefert nur diesen Anteil ab → Wasser
// dünnt geometrisch mit der Hop-Entfernung (KEEP^n), kein Pooling am LOD-Ring-Damm; der Quellen-Pin
// speist nach, Gravitation bleibt verlustfrei. Näher 1 = weitere Ausbreitung, 0.9 = kurze Zungen.
AnazhRealm.CA_FLOW_KEEP = 0.95;

// Fluss-Re-Mesh-Throttle: ein dauerhaft fließender Chunk re-mesht sein Wasser-Sheet nur jeden N-ten
// Tick (4 = 15 Hz; jeder Frame kostete ~4 ms im Stand) — die sichtbare Strömung trägt der
// Schaum-Shader (aFlow). Gilt NUR dem Dauerfluss: der Settle-Final-Mesh bleibt unbedingt.
AnazhRealm.CA_REMESH_TICK_INTERVAL = 4;

AnazhRealm.CA_STAU = Object.freeze({
    REACH: 16, // Spalten (×1.8 m ≈ 29 m) Fenster-Pad um das Werk — die Spieler-Aufmerksamkeits-Grenze
    WIN_MAX: 72, // max Fenster-Kante in Spalten — der Spill-Scan ist bounded by construction
    CLUSTER_GAP: 4, // m — Werke näher als das verschmelzen zu EINEM Stau-Werk (ein Damm = viele Blöcke)
    MIN_EXTENT: 1.6, // m — schmalere Werke (Baum-Stämme, Deko-Säulen) stauen nichts (Perf-Vorfilter)
});
// DIE BOX, DIE STAUEN KANN (Leser: die Qualifikation (b) in `_stauWorkClusters` und der Cache-Wurf in `_blockerStampReach`):
// geschlossen (in BEIDEN Achsen mindestens eine Sim-Zelle `zelle`) und dicht — wer keine Wasser-Zelle stempelt (`stempelfrei`:
// der Wagen, die Pflanze, die Brücke mit Durchlass), hält auch kein Becken. Bis hier galt der fahrende Wagen als Damm: jede
// Erneuerung seiner Boxen warf den Cluster-Cache, und der Haupt-Faden rechnete je Bild die Werke ALLER Bauten neu (Messort
// stadt, Null-Renderer, je Takt: `_stauFelder` steht 0,42 ms, geht 0,77 ms; vor dem Verkehr 0,002 und 0,12).
AnazhRealm._stauBox = (a, zelle) => !a.stempelfrei && Math.min(a.maxX - a.minX, a.maxZ - a.minZ) >= zelle;
