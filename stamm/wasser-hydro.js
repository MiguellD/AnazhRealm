//# allFunctionsCalledOnLoad
class AnazhRealm_wasser_hydro {
    // ===== ATLAS · Wasser/hydro — Hydrosphäre · Flüsse · Seen · Wasserfälle · Pegel · die Wasser-Wahrheit =====
    // DIE KLETTERWAND (Prüfung 2 K02a, gate:fall-waechter „Wolf läuft in die Wand"): steht ein Leib mit der Wurzel bei (x, z)
    // auf dem Grund g und blickt längs (dx, dz), liegen Stirn und Heck eine halbe Länge `hl` vor und hinter ihr — ihr Boden
    // das Gesetz am Punkt ab g (`_koerperBodenUnter`, wie die Sicht unter Fels die vier Proben der Lage liest). Steht die
    // Stirn höher über dem Heck, als der Leib nicken kann (2 · hl · tan GANG_DECKEL_RAD — darüber hebt ihn der Deckel), ist
    // dort kein Gang, nur Wand. Sie gilt UNTER FELS (`_kreaturUnterFels`); unter freiem Himmel bleibt eine Klippe, wie sie
    // war (`_koerperSchritt`). Vorher stieg der laufende Wolf die gekrümmte Höhlenwand hinauf, bis seine Stirn 1,40 m über
    // dem Heck lag, und der Nick-Deckel hob ihn 1,00 m über seinen Grund.
    _kreaturKletterwand(x, z, g, dx, dz, hl) {
        const vorn = this._koerperBodenUnter(x + dx * hl, g, z + dz * hl);
        const heck = this._koerperBodenUnter(x - dx * hl, g, z - dz * hl);
        return vorn - heck > 2 * hl * Math.tan(AnazhRealm.GANG_DECKEL_RAD);
    }

    // UNTER FELS steht ein Leib auf dem Grund g bei (x, z), wenn über ihm Fels hängt — in 2,5 bis 13 m Höhe (fünf
    // Dichte-Proben: die Höhle trägt ≥ 2,4 m Luft, `STAND_SICHT_BAND`; ein Überhang ebenso). Ein Spalt im Gesetz, den das
    // 1,8-m-Netz nicht zeichnet, ist offen zum Himmel: dort nicht (gate:kreatur-takt, der Wolf jagte den Sprinter durch
    // einen 2,7 m tiefen Spalt und blieb sonst darin). Leser: die Kletterwand des Tier-Schritts (`_creatureGroundY`).
    _kreaturUnterFels(x, g, z) {
        if (!Number.isFinite(g)) return false;
        for (const h of [2.5, 4, 6, 9, 13]) if (this._fieldSolid(x, g + h, z)) return true;
        return false;
    }

    // DER GANG BIS ZUR WAND: welcher Teil t ∈ [0, 1] eines Schritts von (x0, z0, g0) nach (x1, z1, g1) trägt die Stirn
    // (längs dx, dz) noch unter dem Deckel, und sein Grund g — {t: 1, g: g1}, wenn sein Ende es tut, sonst vier Halbierungen
    // über den Schritt, jede mit ihrem Schritt-Boden (`_koerperSchritt`; ein Dach ist Wand). Der Leib hält dort, wo die Stirn
    // die Wand erreicht, nie einen ganzen Cache-Schritt (0,5 m) davor oder dahinter. Kosten nur an der Wand.
    _kreaturGangBis(x0, z0, g0, x1, z1, g1, dx, dz, hl) {
        if (!this._kreaturKletterwand(x1, z1, g1, dx, dz, hl)) return { t: 1, g: g1 };
        let lo = 0;
        let gLo = g0;
        let hi = 1;
        for (let k = 0; k < 4; k++) {
            const t = (lo + hi) / 2;
            const x = x0 + (x1 - x0) * t;
            const z = z0 + (z1 - z0) * t;
            const g = this._koerperSchritt(x0, z0, g0, x, z);
            if (g === null || this._kreaturKletterwand(x, z, g, dx, dz, hl)) hi = t;
            else {
                lo = t;
                gLo = g;
            }
        }
        return { t: lo, g: gLo };
    }

    // DER BEZUG DER UFER-BÄNDER (der Boden-Farbe, Bank und Schilf; gelaende-core `wasserSpiegel`): MAX aus Ozean (`waterLevel`,
    // Default überall), See-Becken (`lake.level`) und Fluss-Bett-Profil. KEINE Wasser-Probe: „ist hier Wasser / wie tief"
    // fragt jeder Leser die EINE Wahrheit (`_nassAt` · `_koerperWasser`); bis Schau-2 (09.10.) urteilte über diesen Bezug
    // eine Zwillings-Probe des Lands, blind für das gezeichnete Wasser. `aus` (optional) bekommt die beiden Bezüge der
    // Ufer-Bänder getrennt: `see` (Meer/See), `fluss` (der Fluss-Spiegel oder null) und `ufer` (seine Kronen-Blende). Ein
    // Ufer-Band (Strand, Schlick, Pfad, Höhen-Feuchte) ist das Maximum aus dem Band über `see` und dem Band über `fluss`
    // × `ufer` — stetig über die Krone, wo der Fluss-Spiegel endet (bis Welle L lasen die Bänder das Maximum der Spiegel:
    // an der Krone sprang der Bezug auf den Meeresspiegel, die Bank trug ein Rauten-Schachbrett).
    _waterLevelAt(x, z, aus) {
        return globalThis.__gelaendeCore.wasserSpiegel(this._gelaende(), x, z, aus);
    }

    // Wasser-Spiegel für die Voxel-Cell-Klassifikation (gelaende-core `atlasSpiegel`; ohne den Schatten der 3×3-Dilatation von
    // `_waterLevelAt`): Atlas-Ozean/-See → voller Spiegel, beliebige Tiefe; Fluss → Bett-Profil; Atlas-
    // LAND neben einem Körper (3×3) → dessen Spiegel, wenn `terrainTopY < rim` (Mulde bis zum Terrain
    // gefüllt, keine Ufer-Wand), sonst trocken. `terrainTopY` reicht der Aufrufer (Density-Grid bzw.
    // `_voxelSurfaceY`); Rückgabe -Infinity = „hier nie Wasser".
    // `aus` (optional) bekommt den Spiegel der Wasser-KÖRPER ohne den Fluss: `aus.koerper` (Meer, See; −Infinity = keiner).
    _atlasWaterLevelAt(x, z, terrainTopY, aus) {
        return globalThis.__gelaendeCore.atlasSpiegel(this._gelaende(), x, z, terrainTopY, aus);
    }

    // DER PEGEL DER WELT (stoffe.K3-2, wetter.K3, gelaende-core `pegelTafel`): der Hub jedes Sees und Flusses über seinem
    // Ruhe-Spiegel je Höhe, aus der Schmelze am Tag der Saison auf dem Feld dieser Naht und dem Regen des Wetter-Felds
    // (`_weatherFieldFor`, über den Übergang des Worts) — gerechnet je Tag der Welt (die Schmelze ist ein Tagesmittel) und je
    // Stempel des Regens (`pegelRegen`, auf die Stufe des Hubs quantisiert), je Feld und Meer, nie je Bild. `_pegelGilt` ist die
    // Tafel, die die Welt trägt: der Spiegel des Kerns liest sie über die Lage (`L.pegel`) im Main und im Faden (`pegel` im
    // Stand), bit-gleich; `_pegelTakt` zieht sie nach — gerufen vom Takt der Saison und vom Takt der Nässe (`_naesseTakt`), der
    // schläft, solange das Wetter-Feld steht (`_regenRuht`).
    _pegelTafel() {
        const K = globalThis.__gelaendeCore;
        const L = this._gelaende();
        const n = K.TEMPERATUR.jahrTage;
        const tag = Math.floor(this.state.seasonPhase * n) / n;
        const regen = K.pegelRegen(L, this._weatherFieldFor().rain);
        const c = this._pegelStand;
        if (c && c.tag === tag && c.regen === regen && c.feld === this._temperaturFeld && c.wl === L.waterLevel)
            return c.tafel;
        const tafel = K.pegelTafel(L, tag, (y, tr) => this._temperaturFeld(y, tr), regen);
        this._pegelStand = { tag, regen, feld: this._temperaturFeld, wl: L.waterLevel, tafel };
        return tafel;
    }
    _pegelGilt() {
        if (this._pegelTafelGilt === undefined) this._pegelTafelGilt = this._pegelTafel();
        return this._pegelTafelGilt;
    }

    // Die Marke des Pegels am Chunk (cx, cz) — sein Platten-Schlüssel und die Probe seines Auftrags: der Hub der Tafel über den
    // Höhen, die sein Wasser tragen kann (die Makro-Höhe seiner Mitte ± PEGEL_RAND_M); "" wo nichts steigt (der Schlüssel bleibt).
    _pegelMarke(cx, cz) {
        const T = this._pegelGilt();
        if (!T) return "";
        if (!this._pegelMarken || this._pegelMarken.T !== T) this._pegelMarken = { T, je: new Map() };
        const key = cx + "," + cz;
        const je = this._pegelMarken.je;
        if (je.has(key)) return je.get(key);
        const { span } = this._voxelChunkConfig();
        const y = this._terrainMacroSurfaceY((cx + 0.5) * span, (cz + 0.5) * span, false);
        const R = AnazhRealm.PEGEL_RAND_M;
        const i0 = Math.max(0, Math.floor((y - R - T.y0) / T.dy));
        const i1 = Math.min(T.hub.length - 1, Math.ceil((y + R - T.y0) / T.dy));
        let h = 0;
        for (let i = i0; i <= i1; i++) if (T.hub[i] > 0) h = (Math.imul(h ^ i, 31) + Math.round(T.hub[i] * 100)) | 0;
        const marke = h ? (h >>> 0).toString(36) : "";
        je.set(key, marke);
        return marke;
    }

    // DER TAKT DES PEGELS (stoffe.K3-2, gerufen vom Takt der Saison mit der Schneegrenze und vom Takt der Nässe): ändert der
    // neue Tag oder der neue Stempel des Regens den Hub an einer
    // Höhe, trägt die Welt die neue Tafel — der Faden bekommt sie als Änderung (`_voxelZustandPost`), neu gebaut werden genau die
    // gezeichneten Chunks, deren Wasser-Zellen die Höhen treffen, an denen der Hub wechselt (± eine Stufe der Tafel), und die
    // Netze im Vorrat, deren Wasser sie trifft, fallen. Es kostet, was der Hub überstreicht (Gebot 7): kein Chunk ohne Wasser,
    // kein Wasser anderer Höhe.
    _pegelTakt() {
        const alt = this._pegelTafelGilt;
        if (alt === undefined) return;
        const neu = this._pegelTafel();
        if (neu === alt) return;
        this._pegelTafelGilt = neu;
        const K = globalThis.__gelaendeCore;
        const T = neu || alt;
        let [lo, hi] = [Infinity, -Infinity];
        for (let i = 0; i < T.hub.length; i++) {
            const y = T.y0 + i * T.dy;
            if (K.pegelHub({ pegel: alt }, y) === K.pegelHub({ pegel: neu }, y)) continue;
            [lo, hi] = [Math.min(lo, y - T.dy), Math.max(hi, y + T.dy)];
        }
        if (!(lo <= hi)) return;
        this._voxelZustandPost({ type: "state-update", delta: { pegel: neu } });
        const st = this.state;
        const { dim, dimY, step, floorDrop } = this._voxelChunkConfig(0);
        const oy = (st.terrainBaseHeight || 0) - floorDrop;
        const WATER = AnazhRealm.CELL_STATE.WATER;
        // trifft das Wasser des Eintrags `e` (ein gezeichneter Chunk, ein Netz im Vorrat) das Band? — die Höhen seiner Zellen, je
        // Eintrag gemerkt (ein Neubau trägt einen neuen Eintrag)
        const trifft = (e) => {
            const w = e && e.waterCells;
            if (!w || !w.length) return false;
            if (!e._wasserY) {
                let [a, b] = [dimY, -1];
                for (let j = 0; j < dimY; j++)
                    for (let q = j * dim * dim, z = q + dim * dim; q < z; q++)
                        if (w[q] === WATER) {
                            [a, b] = [Math.min(a, j), j];
                            break;
                        }
                e._wasserY = b < 0 ? [Infinity, -Infinity] : [oy + a * step, oy + (b + 1) * step];
            }
            return e._wasserY[1] >= lo && e._wasserY[0] <= hi;
        };
        if (st.voxelChunks && st.voxelChunks.size) {
            if (!st.dirtyVoxelChunks) st.dirtyVoxelChunks = new Set();
            for (const [key, ch] of st.voxelChunks) if (trifft(ch)) st.dirtyVoxelChunks.add(key);
        }
        if (st.voxelMeshCache) for (const [key, m] of st.voxelMeshCache) if (trifft(m)) st.voxelMeshCache.delete(key);
    }

    // ═══ KOPPLUNG (1) — DIE EINE STRÖMUNGS-QUELLE ═══
    // Strömungs-Geschwindigkeit (m/s) aus dem kanonischen Fluss-Flow von `_hydroRiverAt` für jeden Leser: Körper
    // (`_stepCharacter` · Kreaturen in `updateCreatures` · Boot via `_afloat`) und Klang (der Fluss am Ohr). Betrag = die
    // Strömung des Gesetzes (WASSER_GESETZ.wellen.adv, dieselbe Zeile, die das Wasser-Bild und der Studio-Bach tragen
    // und an der die Fluss-Stimme geeicht ist) × centerness (die Bank-Rampe schiebt nie). Bis V18.531 schob der Körper
    // mit 3,2 m/s (Host-Literal), das Bild floss mit 1,5/0,5/0,9 m/s. Reine Funktion der Welt-Position (Lockstep
    // bit-treu); degenerierte Richtung (See) → null.
    _waterFlowAt(x, z) {
        const rv = this._hydroRiverAt(x, z);
        if (!rv) return null;
        const m = Math.hypot(rv.flowX, rv.flowZ);
        if (!(m > 1e-6) || !Number.isFinite(m)) return null;
        const center = Number.isFinite(rv.centerness) ? Math.max(0, Math.min(1, rv.centerness)) : 0;
        if (center <= 0) return null;
        const WG =
            AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
        const speed = WG.wellen.adv * center;
        return { x: (rv.flowX / m) * speed, z: (rv.flowZ / m) * speed };
    }

    // DER FELS-BEWEIS (Welle L, R2): liegt `_voxelSurfaceY(x, z)` sicher über `hoehe`? Der Scan läuft von oben über sein
    // Gitter und nimmt den ERSTEN Fels — ist ein Gitterpunkt über `hoehe` Fels, liegt die Oberfläche dort oder höher.
    // Dichte-Proben an genau diesen Gitterpunkten (dieselbe Subtraktions-Kette, derselbe Spalten-Kontext, dieselbe Dichte
    // `_fieldDensityAt` samt Edits) statt des Scans: (1) der höchste Punkt unter der Makro-Höhe (surf —
    // dort ist Fels, wo keine Höhle ist), sonst der tiefste über `hoehe`; (2) ist der tiefste über `hoehe` Luft und der
    // darunter Fels, liegt die Oberfläche auf der Kante dazwischen (die Interpolation des Scans, bitgleich) — oder höher,
    // falls darüber noch Fels hängt. false = unbewiesen, der Scan entscheidet. Die Wasser-Suche (`_findNearestWaterPoint`)
    // fragte je Probe den vollen Scan: trocken 351/1330/8037 Spalten für 40/80/200 m. `gate:v1-pfad` (R2) misst das Urteil
    // gegen den vollen Scan.
    _felsUeber(x, z, hoehe) {
        if (!Number.isFinite(hoehe)) return false;
        const ctx = this._terrainColumnContextIn(x, z, this._felsScratch || (this._felsScratch = {}));
        if (!Number.isFinite(ctx.surf)) return false;
        const cfg = this._voxelChunkConfig();
        const floorY = ctx.base - cfg.floorDrop;
        const top = floorY + cfg.dimY * cfg.step - 8;
        const bottom = floorY + 12;
        const skipAbove = Math.max(ctx.surf + 12 + 4 * cfg.step, this._voxelEditsFillTop() + 2);
        const band = ctx.surf;
        let unterBand = null,
            tiefster = null;
        for (let y = top; y >= bottom && y > hoehe; y -= 1.2) {
            tiefster = y;
            if (unterBand === null && y <= band) unterBand = y;
        }
        if (tiefster === null) return false;
        // (1) ein Gitterpunkt über `hoehe` ist Fels (über `skipAbove` sieht der Scan nur Luft)
        if (unterBand !== null && unterBand <= skipAbove && this._fieldDensityAt(x, unterBand, z, ctx) > 0) return true;
        if (unterBand === tiefster) return false; // dieselbe Probe — Luft, der Scan entscheidet
        if (tiefster > skipAbove) return false;
        const dOben = this._fieldDensityAt(x, tiefster, z, ctx);
        if (dOben > 0) return true;
        // (2) die Kante unter dem tiefsten Punkt über `hoehe`
        const unten = tiefster - 1.2;
        if (unten < bottom) return false;
        const dUnten = this._fieldDensityAt(x, unten, z, ctx);
        if (!(dUnten > 0)) return false;
        const t = dUnten - dOben > 1e-9 ? dUnten / (dUnten - dOben) : 0;
        return unten + 1.2 * Math.min(1, Math.max(0, t)) > hoehe;
    }

    // Boden-Cache je Kreatur: der Boden unter dem Körper (`_koerperBodenUnter`) nur neu scannen, wenn sie sich > 0.5 m
    // bewegt hat UND Frame-Budget frei ist — sonst Cache; eine frische Kreatur scannt einmal ohne Budget (ein
    // Makro-Schätzwert hob sie in der Höhle aufs Dach, und von dort fand der Scan nur noch das Dach). Der Scan-Aufwand pro
    // Frame ist unabhängig von der Kreatur-Zahl. EINE Quelle für Settle + `_creatureWaterContextAt` (kein Doppel-Scan); der
    // liefert { inWater, depthBelow, submerged, distToShore (Cap 12 m), shoreDir (XZ-Einheit Richtung Ufer | null) }.
    // DIE FELS-WAND DES TIERS (Leben-Schau 2, CI 38009273564): ein Schritt (kein Versetzen — weiter als 2 m vom letzten
    // Boden trägt die Säule, Ruf und Portal) liest den Boden als Schritt vom letzten Grund (`_koerperSchritt`): ging der
    // Leib in die Wand, steht er wieder, wo er zuletzt Boden las, sein Lauf hält, und die Ebene durch diesen Ort quer zum
    // Schritt hält ihn (`_wandHalt`, im Hüllen-Kontakt jedes Tier-Schritts). Jeder neue Boden blickt eine Cache-Weite
    // (0,5 m) längs der Gier voraus — liegt dort Wand, hält die Ebene den Leib davor, bevor er hinein geht (EINE
    // Dichte-Probe je Neu-Scan, die Wand-Regel nur, wo sie Fels trifft). Vorher trug der Fels-Fall die Oberkante der
    // Säule: der Wolf stand auf dem Dach der Höhle.
    // DIE KLETTERWAND (Prüfung 2 K02a): Wand ist auch, wo die Stirn des Leibs höher über seinem Heck steht, als er nicken
    // kann (`_kreaturKletterwand`) — der Schritt endet dort, wo die Stirn sie erreicht (`_kreaturGangBis`), und der Blick
    // voraus (`_kreaturBlickVoraus`) setzt die Ebene an denselben Ort: nach jedem neuen Grund, und wo der Grund ohne Blick
    // gesetzt wurde (Ruf, Stoß), die Gier sich dreht oder der Leib anläuft, auch am gecachten Ort. Die Regel gilt dem GANG
    // (der Leib läuft, `_steuer.v` > 0) UNTER FELS (`_kreaturUnterFels`) — ein Stoß, eine Hülle, die ihn schiebt, tragen ihn
    // wie zuvor (der Stoß hat seine 45°-Wand, `_kreaturStossSchritt`), eine Klippe unter freiem Himmel bleibt, wie sie war.
    // Vorher hielt nur ein Dach, und der Blick
    // fehlte nach dem Stoß: der laufende Wolf stieg die gekrümmte Höhlenwand 1 m hinauf und sprang beim nächsten Grund 0,5 m
    // zurück, unter CPU-Last hob ihn der Nick-Deckel 1,00 m über seinen Grund.
    _creatureGroundY(creature) {
        const cx = creature.position.x;
        const cz = creature.position.z;
        const ud = creature.userData;
        let schritt = false;
        if (ud.cachedGroundY !== undefined) {
            const dx = cx - ud.cachedGroundX;
            const dz = cz - ud.cachedGroundZ;
            const d2 = dx * dx + dz * dz;
            if (d2 < 0.25) {
                // < 0.5 m bewegt → Cache; läuft der Leib und fehlt sein Blick als Gang, oder drehte sich die Gier → er blickt
                // vom Ort des Grunds
                if (
                    this._creatureGroundBudget > 0 &&
                    Number.isFinite(ud.cachedGroundY) &&
                    ud._steuer &&
                    ud._steuer.v > 0 &&
                    (!ud._wandBlickGang || !(Math.abs((creature.rotation.y || 0) - ud._wandBlickGier) <= 0.25))
                ) {
                    this._creatureGroundBudget--;
                    this._kreaturBlickVoraus(creature, ud.cachedGroundX, ud.cachedGroundZ, ud.cachedGroundY);
                }
                return ud.cachedGroundY;
            }
            schritt = d2 < 4 && Number.isFinite(ud.cachedGroundY);
        }
        if (this._creatureGroundBudget > 0 || ud.cachedGroundY === undefined) {
            if (this._creatureGroundBudget > 0) this._creatureGroundBudget--;
            let gY = schritt
                ? this._koerperSchritt(
                      ud.cachedGroundX,
                      ud.cachedGroundZ,
                      ud.cachedGroundY,
                      cx,
                      cz,
                      this._kreaturLeib(creature, 0, this._kreaturSchrittLeib || (this._kreaturSchrittLeib = {})).hoehe
                  )
                : this._koerperBodenUnter(cx, creature.position.y - (ud._hopH || 0), cz);
            const hl = this._kreaturHalbLaenge(creature);
            if (schritt) {
                const x0 = ud.cachedGroundX;
                const z0 = ud.cachedGroundZ;
                const g0 = ud.cachedGroundY;
                const n = Math.hypot(cx - x0, cz - z0);
                const nx = (cx - x0) / n;
                const nz = (cz - z0) / n;
                const gang = !!(ud._steuer && ud._steuer.v > 0);
                const w =
                    gY === null
                        ? { t: 0, g: g0 }
                        : gang && this._kreaturUnterFels(x0, g0, z0)
                          ? this._kreaturGangBis(x0, z0, g0, cx, cz, gY, nx, nz, hl)
                          : { t: 1, g: gY };
                if (w.t < 1) {
                    // die Wand: der Leib steht, wo seine Stirn sie erreicht (oder wo er zuletzt Boden las), sein Lauf hält
                    const hx = x0 + (cx - x0) * w.t;
                    const hz = z0 + (cz - z0) * w.t;
                    ud._wandHalt = { x: hx, z: hz, nx, nz };
                    ud._wandBlickGier = creature.rotation.y || 0;
                    ud._wandBlickGang = gang;
                    creature.position.x = hx;
                    creature.position.z = hz;
                    if (ud._steuer) ud._steuer.v = 0;
                    ud.cachedGroundY = w.g;
                    ud.cachedGroundX = hx;
                    ud.cachedGroundZ = hz;
                    return w.g;
                }
            }
            ud.cachedGroundY = gY;
            ud.cachedGroundX = cx;
            ud.cachedGroundZ = cz;
            this._kreaturBlickVoraus(creature, cx, cz, gY);
            return gY;
        }
        // Budget erschöpft: der leicht veraltete Cache (imperzeptibel, < 1 Frame) — eine frische Kreatur scannte oben. Der
        // Makro-Schätzwert dahinter war unerreichbar und las die Oberkante der Säule (das Dach); er fiel (Leben-Schau 2).
        return ud.cachedGroundY;
    }

    // DER BLICK VORAUS des Tier-Schritts (`_creatureGroundY`): vom Grund g bei (x, z) eine Cache-Weite (0,5 m) längs der
    // Gier — liegt dort ein Dach über dem Weg (`_koerperSchritt` null) oder erreicht die Stirn eine Kletterwand
    // (`_kreaturGangBis`), hält die Ebene `_wandHalt` den Leib dort, wo es beginnt. Erst die Filter: Fels eine Stufe über dem
    // Grund dort, oder (im Gang unter Fels) die Kletterwand am nächsten Stand — erst dann der Schritt-Boden dort. Gier und
    // Gang des Blicks stehen in `_wandBlickGier` und `_wandBlickGang` (ein Ruf, ein Stoß löscht sie).
    _kreaturBlickVoraus(creature, x, z, g) {
        const ud = creature.userData;
        const gier = creature.rotation.y || 0;
        const gang = !!(ud._steuer && ud._steuer.v > 0);
        ud._wandBlickGier = gier;
        ud._wandBlickGang = gang;
        ud._wandHalt = null;
        if (!Number.isFinite(g)) return;
        const hl = this._kreaturHalbLaenge(creature);
        const vx = Math.sin(gier);
        const vz = Math.cos(gier);
        const ax = x + vx * 0.5;
        const az = z + vz * 0.5;
        const kletter = gang && this._kreaturUnterFels(x, g, z);
        if (
            !this._fieldSolid(ax, g + AnazhRealm.PLAYER_STEP_UP, az) &&
            !(kletter && this._kreaturKletterwand(ax, az, g, vx, vz, hl))
        )
            return;
        const gA = this._koerperSchritt(x, z, g, ax, az);
        const t = gA === null ? 0 : kletter ? this._kreaturGangBis(x, z, g, ax, az, gA, vx, vz, hl).t : 1;
        if (t < 1) ud._wandHalt = { x: x + vx * 0.5 * t, z: z + vz * 0.5 * t, nx: vx, nz: vz };
    }

    _creatureWaterContextAt(creature, surfaceY) {
        const x = creature.position.x;
        const z = creature.position.z;
        const cy = creature.position.y;
        // V17.113 — `surfaceY` kommt jetzt aus `_creatureGroundY` (gecacht) statt
        // einem eigenen `_voxelSurfaceY`-Scan → kein Doppel-Scan pro Kreatur. Das Wasser ist die EINE Wahrheit am Körper
        // (`_koerperWasser` über diesem Grund — dieselbe, die Lage und Schwimmen des Tiers trägt); bis zur Gegenprüfung las
        // die Ufer-Scheu das 3×3-gedehnte `_waterLevelAt`.
        const surfY = surfaceY === null || !Number.isFinite(surfaceY) ? cy : surfaceY;
        const waterY = this._koerperWasser(x, z, surfY);
        const depthBelow = waterY - surfY;
        const inWater = depthBelow > 0;
        const submerged = cy < waterY - 0.1;
        if (!inWater) {
            return { inWater: false, depthBelow, submerged, distToShore: 0, shoreDir: null };
        }
        // Nächste Land-Cell in 4 Himmelsrichtungen, 3-m-Schritte bis 12 m (≤16 Proben). Kürzeste Richtung
        // gewinnt, Gleichstand bevorzugt die zuerst geprüfte — harmlos, jede führt aus dem Wasser.
        const STEP = 3;
        const MAX = 12;
        let bestDist = Infinity;
        let bestDx = 0;
        let bestDz = 0;
        // dx/dz-Paare inline statt Array-Iteration (eine Allokation gespart).
        for (let d = 0; d < 4; d++) {
            const dx = d === 0 ? 1 : d === 1 ? -1 : 0;
            const dz = d === 2 ? 1 : d === 3 ? -1 : 0;
            for (let step = STEP; step <= MAX; step += STEP) {
                const lx = x + dx * step;
                const lz = z + dz * step;
                const lb = this._voxelSurfaceY(lx, lz);
                if (lb !== null && Number.isFinite(lb) && !this._nassAt(lx, lz, 0.1, lb)) {
                    if (step < bestDist) {
                        bestDist = step;
                        bestDx = dx;
                        bestDz = dz;
                    }
                    break;
                }
            }
        }
        if (!Number.isFinite(bestDist)) {
            return { inWater: true, depthBelow, submerged, distToShore: Infinity, shoreDir: null };
        }
        const shoreDir = new THREE.Vector3(bestDx, 0, bestDz);
        // bestDx/bestDz ist immer entweder ±1 oder 0 (Kardinal-Richtung) —
        // Länge ist genau 1, normalize() wäre tautologisch, hier explizit
        // für Code-Klarheit: Caller darf nicht über Magnitude überraschen.
        return { inWater: true, depthBelow, submerged, distToShore: bestDist, shoreDir };
    }

    // Nächstes Fluss-Segment an (x,z), wenn der Punkt im Kanal liegt (dist ≤ halbe Breite + Tiefe / bankNeigung, die
    // Krone der Bank — jenseits der Krone trägt der Fluss kein Wasser). Liefert Flow-Richtung (normiert), Bett-Tiefe
    // `depth` und centerness des nächsten Segments, dazu die Wasser-Oberfläche `surfaceY`: der Spiegel der Segmente
    // (`_hydroRiverSpiegel`, linear zwischen ihren Enden — stromab nie steigend, quer waagrecht), gemittelt mit einem
    // Gewicht, das zur Krone stetig auf 0 fällt — ein breiter Fluss überdeckt in der Biegung mehrere Segmente, das
    // nächste allein gäbe dort eine Stufe. O(1) über den Kanal (`kanal`); das Gesetz des Kerns (gelaende-core `flussAm`).
    _hydroRiverAt(x, z) {
        return globalThis.__gelaendeCore.flussAm(this._gelaende(), x, z);
    }

    // DER SPIEGEL QUER (Gegenprüfung 07.10., Runde 3): der Spiegel des nächsten Fluss-Segments an (x, z), auch jenseits der
    // Krone — der Fluss-Spiegel liegt quer waagrecht (`_hydroRiverSpiegel`). Nur das Wasser-Sheet liest ihn, für Rand-Vertices
    // jenseits der Krone (dort taucht das Sheet unter den Boden; das Mittel oder ein Extrem der Nachbar-Dächer setzte das Ende
    // eines steilen Laufs zu tief oder zu hoch). −Infinity ohne Segment im Bucket (gelaende-core `spiegelQuer`).
    _hydroSpiegelQuer(x, z) {
        return globalThis.__gelaendeCore.spiegelQuer(this._gelaende(), x, z);
    }

    // === Die Hydrosphäre wird sichtbar ===
    // Läuft NACH dem Setzen von `state.hydrosphere` (Carve aktiv): jeder gestreamte Chunk baut neu (Zellen und Iso-Wasser
    // aus dem Faden). EIN Material (`_ensureHydroSurfaceMaterial`) für alles Iso-Wasser, gespeist von `_applyDayNightToScene`.
    _buildHydrosphereMeshes() {
        if (!this.state.scene || typeof THREE === "undefined") return;
        const hydro = this.state.hydrosphere;
        if (!hydro || !hydro.ready) return;
        this._disposeHydrosphereMeshes(); // idempotenter Rebuild
        const meshes = [];
        // Keine Wasserfall-Plane: steile Läufe trägt das Wildwasser (aSlope-Schaum) + die Steilkanten-Form im
        // Zell-Sheet (das Wasserfall-Material ohne Leser fiel mit der Welle L).
        this.state.hydrosphereMeshes = meshes;
        // V9.75 — schon gestreamte Voxel-Chunks (der Welt-Regen: sie tragen Stoff und Zellen der alten Welt) baut der Faden
        // neu — ihr Stoff und ihre Zellen entstehen dort, nie im Haupt-Faden (Lehre 14, Karte hydro-faden: bis dahin baute
        // dieser Pass je Chunk die 71k-Zell-Dichte synchron neu); der Neubau-Takt baut sie nah zuerst ein, ihre Sheets folgen.
        if (this.state.voxelChunks && this.state.voxelChunks.size) {
            if (!this.state.dirtyVoxelChunks) this.state.dirtyVoxelChunks = new Set();
            for (const key of this.state.voxelChunks.keys()) this.state.dirtyVoxelChunks.add(key);
            this._weltRegt(true);
        }
        this.log(
            `V9.75: Hydrosphäre gerendert — Iso-Wasser (${hydro.waterfalls.length} Fall-Läufe im CA-Wildwasser)`,
            "INFO"
        );
    }

    // Räumt alle gerenderten Hydrosphären-Meshes (Geometrie disposen, aus der
    // Scene nehmen). Die Materialien sind welt-global geteilt — NICHT disposen
    // (V9.43-a-Lehre: ein geteiltes Material disposen bricht jedes andere
    // Wasser-Mesh). Idempotent.
    _disposeHydrosphereMeshes() {
        if (!Array.isArray(this.state.hydrosphereMeshes)) {
            this.state.hydrosphereMeshes = [];
            return;
        }
        for (const m of this.state.hydrosphereMeshes) {
            if (this.state.scene) this.state.scene.remove(m);
            // V10.0-j.f — Defer (WebGPU Submit-Race-frei).
            if (m.geometry) this._queueDispose(m.geometry);
        }
        this.state.hydrosphereMeshes = [];
    }

    // DIE EINE WASSER-WAHRHEIT AM KÖRPER (Welle L, Q6): der Spiegel an (x, z), den das Auge sieht — das GEZEICHNETE Wasser
    // (`_koerperWasserSpiegel` über `_wasserBildAt`: die Dreiecke des Sheets, die der Renderer bekommt, mit dem Live-Dach des
    // Automaten und dem flachen Ufer der Deck-Zelle) über dem Grund des Körpers. Spieler, Kreatur, Mitspieler, Schritt-Klang,
    // Klang-Nässe, Tier-Scheu, Trink-Ziel und die Pflanzen am Boden (Nah-Streu, Nah-Wiese) lesen nur sie. Bis V18.531 trug der
    // Spieler das Dach der obersten Wasser-ZELLE (1,8-m-Raster: in Ruhe 0,47 m über dem See), das Tier den rohen Spiegel, der
    // Mitspieler den Meeresspiegel; bis zur Gegenprüfung (Runde 4) las der Körper den Spiegel des Gesetzes an seinem Punkt,
    // die Welt zeichnete ihn auf dem 1,8-m-Gitter — am Bach der Mess-Wiese 64 m Breite Wasser, in dem der Körper trocken stand
    // (Runde 3 umgekehrt: 177 m, die die Welt nicht zeichnete). Rückgabe: Spiegel (m) oder −Infinity (kein Wasser).
    // DIE DECKE (D11, Gegenprüfung 07.10.): eine geflutete Zelle des Körpers trägt das gezeichnete Wasser, solange keine
    // FEST-Zelle dazwischen liegt; sonst trägt es ihn nur unter offenem Himmel (`_koerperWasserSpiegel`) — unter Fels steht er
    // trocken. Bis 8f09227d las der Körper den Spiegel ohne Decke: in trockenen Höhlen unter und neben dem See der Mess-Wiese
    // 3511 von 3511 Proben „nass".
    // DIE GESTALT (D10): mit `gestalt` (`{ linie }` — die Wasserlinie über der Unterkante des Körpers; Infinity = sie trägt
    // nie) schreibt die Wahrheit die LAGE hinein: `gestalt.lage = { tiefe, schwimmt, unterkante }` — der Körper schwimmt,
    // sobald die Säule über seinem Grund die Linie übersteigt (seine Unterkante liegt dann auf Spiegel − Linie), sonst steht er
    // auf dem Grund (er watet; dichter als Wasser sinkt er). Leser: das Gefährt (`_fahrBoden`, `_rittSchritt`).
    // DIE OBERGRENZE (Gelände K4): `grundY` −Infinity fragt den höchsten Spiegel über jedem Grund an (x, z) — der billige
    // Beweis der Spalten-Probe (`_nassAt`) liest ihn hier, nie an der Wahrheit vorbei.
    _koerperWasser(x, z, grundY, gestalt) {
        const spiegel = this._koerperWasserSpiegel(x, z, grundY);
        if (gestalt) {
            const tiefe = Number.isFinite(grundY) && spiegel > grundY ? spiegel - grundY : 0;
            const schwimmt = tiefe > gestalt.linie;
            const L = gestalt.lage || (gestalt.lage = {});
            L.tiefe = tiefe;
            L.schwimmt = schwimmt;
            L.unterkante = schwimmt ? spiegel - gestalt.linie : grundY;
        }
        return spiegel;
    }

    // DAS EIS (stoffe.K3): die feste Phase der EINEN Wasser-Wahrheit — der Spiegel am Körper (`_koerperWasser` über jedem
    // Grund) trägt als Fläche, wo das Bild tragendes Eis zeigt: über der Linie `voll` des Gesetzes (`_eisLinien`) an der
    // Säule unter ihm (`_eisLinieBei`, dieselbe Deckung wie der Stoff, `_eisDeckung`; der Gefrierpunkt und die Trägheit aus den
    // Zeilen wasser und eis der Stoff-Tafel, stoffe.K1, `_wasserStoff`). Rückgabe: der Grund unter `y0` binnen
    // `maxDist` (wie `_fieldSurfaceBelow`; ohne `y0` von oben), sonst null. Kein zweites Wasser: dieselbe Fläche, die das Auge
    // sieht und durch die der Körper taucht, solange sie offen ist.
    // DIE BILLIGEN FILTER ZUERST (Lehre 25): unter der tiefsten tragenden Linie der Welt (`traegtAb`, die flachste Säule)
    // trägt kein Wasser — im Sommer und an jedem Ort unter ihr zahlt der Leser einen Vergleich; dann die Obergrenze der
    // Wahrheit (`_koerperWasser`), und nur, wo die Linie von der Säule abhängt, der Grund: der, den der Leser schon las
    // (`grund`: die Karte des Stands, der Fels unter dem Körper, die Oberkante der Säule), sonst `_voxelSurfaceY`. Leser:
    // der Grund jedes Körpers (`_koerperGrund`, `_koerperBodenUnter`), der Stand der Sicht (`_standSicht`), der Schritt-Klang.
    _eisAt(x, z, y0, maxDist, grund) {
        const E = this._eisLinien();
        const mitRef = Number.isFinite(y0);
        if (!(E.traegtAb < Infinity) || (mitRef && !(y0 >= E.traegtAb))) return null;
        const spiegel = this._koerperWasser(x, z, -Infinity);
        if (!(spiegel >= E.traegtAb) || (mitRef && !(spiegel <= y0 && y0 - spiegel <= maxDist))) return null;
        if (spiegel >= E.voll[3]) return spiegel;
        const g = Number.isFinite(grund) ? grund : this._voxelSurfaceY(x, z);
        return g !== null && spiegel >= this._eisLinieBei(E.voll, spiegel - g) ? spiegel : null;
    }

    // Die Linie (`_eisLinien`: je Knoten der Säule eine Höhe) an der Säule `tiefe` — logarithmisch zwischen den Knoten
    // (`EIS.saeule`, ein Teich und ein tiefer See liegen Faktoren auseinander), geklemmt an die Enden.
    _eisLinieBei(linie, tiefe) {
        const S = globalThis.__gelaendeCore.EIS.saeule;
        const t = Math.max(0, Math.min(3, (3 * Math.log(Math.max(tiefe, S[0]) / S[0])) / Math.log(S[1] / S[0])));
        const i = Math.min(2, Math.floor(t));
        return linie[i] + (linie[i + 1] - linie[i]) * (t - i);
    }

    // DIE DECKUNG DES EISES (EIN Baustein für den Wasser-Stoff und den Fern-Ring): 0 offenes Wasser … 1 tragendes Eis an der
    // Welt-Höhe `y` über der Säule `tiefe` — zwischen den Linien des Gesetzes (`U.eisNull`: das Eis beginnt, `U.eisVoll`: es
    // trägt; je Knoten der Säule, interpoliert wie `_eisLinieBei`) wächst es stetig: das dünne Eis klar, das tragende deckend.
    _eisDeckung(TSL, U, y, tiefe) {
        const { float, vec4, clamp, abs, max, log, dot } = TSL;
        const S = globalThis.__gelaendeCore.EIS.saeule;
        const t = clamp(log(max(tiefe, float(S[0])).div(S[0])).mul(3 / Math.log(S[1] / S[0])), 0.0, 3.0);
        const w = max(float(1.0).sub(abs(vec4(t).sub(vec4(0.0, 1.0, 2.0, 3.0)))), vec4(0.0));
        const y0 = dot(U.eisNull, w);
        const a = clamp(y.sub(y0).div(max(dot(U.eisVoll, w).sub(y0), float(1e-3))), 0.0, 1.0);
        return a.mul(a).mul(float(3.0).sub(a.mul(2.0)));
    }

    // Der Spiegel am Körper (die Wahrheit ohne Gestalt) — nur `_koerperWasser` ruft ihn. Wo ein Chunk geladen ist, ist es das
    // GEZEICHNETE Wasser (`_wasserBildAt`: das Sheet, auch der Küsten-Aquifer, das Live-Dach des Automaten, das flache Ufer)
    // unter der DECKE (D11), gelesen an der Zelle des Körpers (die erste nicht-feste über seinem Grund): ist sie geflutet,
    // trägt sie das Wasser bis zum Spiegel, solange keine FEST-Zelle dazwischen liegt; sonst trägt es den Körper nur unter
    // offenem Himmel — liegt die oberste Fläche des Gesetzes (`_voxelSurfaceY`) mehr als eine Zelle über seinem Grund, steht
    // er unter Fels (eine Höhle unter oder neben dem Wasser): trocken, auch wo der Rand eines Sheets unter das Gelände in die
    // Höhle taucht (am See der Mess-Wiese lag die Anker-Kante in einer 16 m hohen Höhle 15 m über ihrem Boden). Ein Bau-Stempel
    // (Stamm, Pfeiler) ist kein Fels: das Gesetz kennt ihn nicht, das Sheet läuft durch ihn wie das Wasser um ihn.
    // Ohne Chunk (die Ferne, die niemand sieht) der Spiegel des Gesetzes über seinem Grund — unter jedem Grund (−Infinity)
    // samt Rand und voller Fluss-Breite.
    _koerperWasserSpiegel(x, z, grundY) {
        const endlich = Number.isFinite(grundY);
        const bild = this._wasserBildAt(x, z);
        if (bild === undefined)
            return this._atlasWaterLevelAt(x, z, endlich ? grundY : grundY === -Infinity ? -1e9 : -Infinity);
        if (bild === null) return -Infinity;
        if (!endlich || !(bild > grundY)) return bild;
        const { dim, dimY, step, span, floorDrop } = this._voxelChunkConfig(0);
        const cx = Math.floor(x / span);
        const cz = Math.floor(z / span);
        const entry = this.state.voxelChunks.get(`${cx},${cz}`);
        const cells = entry ? entry.waterCells : null;
        if (!cells) return bild;
        const oy = (this.state.terrainBaseHeight || 0) - floorDrop;
        const dq = dim * dim;
        const b = Math.floor((x - cx * span) / step) + Math.floor((z - cz * span) / step) * dim;
        const ZS = AnazhRealm.CELL_STATE;
        let jK = Math.max(0, Math.min(dimY - 1, Math.floor((grundY - oy) / step)));
        for (let n = 0; n < 2 && jK + 1 < dimY && cells[b + jK * dq] === ZS.SOLID; n++) jK++;
        if (cells[b + jK * dq] === ZS.WATER) {
            for (let j = jK + 1; j < dimY && oy + j * step < bild; j++)
                if (cells[b + j * dq] === ZS.SOLID) return -Infinity;
            return bild;
        }
        const oben = this._voxelSurfaceY(x, z);
        return oben !== null && grundY < oben - step ? -Infinity : bild;
    }

    // DER BLICK DES WASSERS (K16, EIN Baustein für den Wasser-Stoff und den Fern-Ring): was die Fläche mit der Normale `n`
    // dem Auge `viewDir` zurückwirft, über dem Grund mit dem Durchlass `T` — der Körper im Licht des Orts (R∞ × E/π), soweit
    // er den Grund deckt (1 − T) und nicht gespiegelt wird (1 − F); der Himmel × F; der Glanz. Liefert { eigen, fres }.
    // DAS EIS (stoffe.K3): die Deckung `o.eis` (`_eisDeckung`) legt über das Wasser die gefrorene Fläche — deckend, ihr Körper
    // der Schnee der Boden-Palette im Licht des Orts, der Himmel nach demselben Fresnel (n Eis 1,31 ≈ n Wasser 1,33); wo sie
    // deckt, trägt dieselbe Fläche den Körper (`_eisAt`).
    _wasserBlick(TSL, WG, o) {
        const { float, vec2, vec3, vec4, normalize, reflect, max, dot, pow, clamp, texture, step, mix } = TSL;
        const HG =
            AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
        // Schlick-Fresnel (WASSER_GESETZ): fres = f0 + f1·(1−n·v)^f2 — EIN Fresnel für Spiegel UND Durchlass.
        const ndvW = clamp(dot(o.n, o.viewDir), 0.0, 1.0);
        const fres = float(WG.fresnel[0]).add(
            float(WG.fresnel[1]).mul(pow(float(1.0).sub(ndvW), float(WG.fresnel[2])))
        );
        // DER SPIEGEL DER WELT (D10, A1): was der gespiegelte Strahl trifft — Ufer, Hang, Krone, Haus, Wolke, sonst der Himmel
        // (`_spiegelPass`, 1/teil Auflösung: zuerst das gezeichnete Bild, jenseits des Schirms das Spiegel-Feld des Gesetzes,
        // dahinter die Himmels-Sicht der Kuppel) — der Welt-Punkt `o.ort` reprojiziert in die Ansicht, aus der der Pass rechnete,
        // die Kräusel-Normale versetzt den Abgriff. Der Pass deckt jedes Wasser-Pixel ganz (vorab multipliziert, Deckung `w`).
        const S = this._spiegelLeser();
        const clip = S.vp.mul(vec4(o.ort, 1.0));
        const sw = max(clip.w, float(1e-4));
        const suv = vec2(clip.x.div(sw).mul(0.5).add(0.5), float(0.5).sub(clip.y.div(sw).mul(0.5))).add(
            o.n.xz.mul(0.03)
        );
        const sp = texture(S.rt.texture, suv).level(float(0));
        const drin = step(0.0, suv.x)
            .mul(step(suv.x, 1.0))
            .mul(step(0.0, suv.y))
            .mul(step(suv.y, 1.0))
            .mul(step(0.0, clip.w));
        const deckt = drin.mul(S.an);
        const w = clamp(sp.a, 0.0, 1.0).mul(deckt);
        // DER HIMMEL, WO DER PASS NICHT DECKT (jenseits des Felds, das ferne Wasser, der Fern-Ring, vor dem ersten Lauf, am
        // Ufer-Saum): die Atmosphäre der Himmels-Sicht (`himmelFarbe`, die Tafel der Kuppel) in Richtung des gespiegelten Strahls,
        // nie unter den Horizont, an dem die Wolken enden (`hor[0]`, Kräusel-Normalen). Jenseits des Felds (368 m) liegt der
        // Strahl aus Augenhöhe unter `hor[0]`: dort IST die Himmels-Sicht die Atmosphäre allein, die Wolke ist null
        // (`_himmelSicht`). Die Wolke rechnet der Pass in 1/teil, nie das Wasser je Pixel (A1-n1, `werkbank zerlegen` gehend,
        // Radeon: Wasser mit Pass 2,95 ms mit zwei fbm im Wasser-Stoff, auch ungenommen, gegen 1,48–2,32 ohne, die Basis vor
        // A1 2,67–2,91). Bis A1 die Umgebung von 128 × 64
        // (`_himmelUmgebungTex`, die Quelle der IBL): ein Verlauf ohne Wolke über dem ganzen See (A0). Bis V18.530 spiegelte das
        // Wasser die Zenit-Tönung × die SONNEN-Stärke (uLight 7,4): 3–5× über dem Himmel, weiß wie Eis (Blick-Tour 07).
        const _R = reflect(o.viewDir.negate(), o.n);
        const _Rh = normalize(vec3(_R.x, max(_R.y, float(HG.hor[0])), _R.z));
        const himmel = sp.rgb.mul(deckt).add(this._atmoLutBau().himmelFarbe(_Rh).mul(float(1).sub(w)));
        // W10 — der Sonnen-Glitzer der Vorlage: reflect-basiert, Exponent/Gewinn aus dem Gesetz, die Sonne selbst
        // (Rayleigh-Farbe sunCol × ihre Stärke light).
        const spec = pow(max(dot(reflect(normalize(o.sunDir).negate(), o.n), o.viewDir), 0.0), float(WG.spec[0]));
        const glanz = o.sunCol.mul(spec).mul(WG.spec[1]).mul(o.light);
        const eigen = o.koerper
            .mul(o.irr)
            .mul(float(1.0).sub(o.T))
            .mul(float(1.0).sub(fres))
            .add(himmel.mul(fres))
            .add(glanz);
        const eis = o.eis;
        return {
            eigen: mix(eigen, mix(vec3(...AnazhRealm.BODEN_FARBE.schnee).mul(o.irr), himmel, fres), eis),
            fres: mix(fres, float(1.0), eis),
        };
    }

    // DER BODEN UNTER EINEM WERK (Leben-Schau 2, 09.10.): der Boden des Körpers (`_koerperBodenUnter`) ab der Höhe des
    // Werks — der Ebene seiner Räder im Fahr-Zustand, sonst seiner Basis (y − 0,5). Bis dahin las jeder Fahr- und Ritt-Leser
    // die Oberkante der Säule: unter einem Überhang oder in einer Höhle lag der Boden über dem Werk (der Wagen fiel im
    // Spaltgrund durch die Welt, ein in der Höhle gesetzter Wagen sprang aufs Dach). Je Werk EINE Funktion.
    _werkBoden(entry) {
        if (entry._werkBodenFn) return entry._werkBodenFn;
        entry._werkBodenFn = (x, z) => {
            const fz = entry._fahr;
            const ref =
                fz && Number.isFinite(fz.y)
                    ? fz.y
                    : entry.position && Number.isFinite(entry.position.y)
                      ? entry.position.y - 0.5
                      : NaN;
            return this._koerperBodenUnter(x, ref, z);
        };
        return entry._werkBodenFn;
    }

    // Steht an (x, z) Wasser? Der Boden liegt mehr als `marge` (m, Vorgabe −5 cm) unter der EINEN Wasser-Wahrheit am Körper
    // (`_koerperWasser` über diesem Boden: See, Fluss bis zur Krone, Rand, Aquifer, Decke); eine Höhle, ein Loch (Surface
    // null) trägt kein Wasser. DAS EINE URTEIL „ist hier Wasser" (Gelände K4) für jeden Leser, der kein Maß braucht: die
    // Nässe des Klangs (Hör-Ring, Wasser-Hauch, Schritt), das Medium der Kamera und des Mitspielers, das Trink-Ziel und die
    // Ufer-Suche der Tiere, das LAND jedes Werks (`_landAt`) und die Natur — die Nah-Wiese und die Nah-Streu reichen ihren
    // gezeichneten Boden (`boden`, `_bodenSichtAt`), sonst gilt die Spalte des Gesetzes (`_voxelSurfaceY`).
    // DER BILLIGE BEWEIS ZUERST (Lehre 25): die Obergrenze der Wahrheit (`_koerperWasser` unter jedem Grund) — ist dort kein
    // Wasser, ist die Spalte trocken ohne Scan; ist ein Gitterpunkt über ihr + Marge Fels (`_felsUeber`), liegt der Boden
    // darüber. Bis K4 las die Probe die Obergrenze selbst (`_wasserBildAt`, `_atlasWaterLevelAt`): ein See, den die
    // Wahrheit an 50 Zufalls-Punkten trug, blieb für Klang, Trink-Ziel, Natur-Wand und Land an 50 von 50 trocken (K12 M).
    _nassAt(x, z, marge = -0.05, boden) {
        if (boden === undefined) {
            const oben = this._koerperWasser(x, z, -Infinity);
            if (!(oben > -Infinity) || this._felsUeber(x, z, oben + marge)) return false;
            boden = this._voxelSurfaceY(x, z);
        }
        return boden !== null && Number.isFinite(boden) && boden < this._koerperWasser(x, z, boden) + marge;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_wasser_hydro]);

// ===== ATLAS · Wasser/hydro — Außen-Konstanten =====
// Die Kerne sind PFLICHT (index.html lädt alle Gesetzbücher, _kernPflichtWand meldet den Ausfall):
// ein unlesbares Gesetz ist ein lauter BRUCH, nie eine stille Ersatz-Welt. Keine Zahlen-Zwillinge im
// Stamm — die Zwillings-Absenz-Wand (gate:studio-vertrag) hält sie draußen.
// DIE BETT-TIEFE eines Fluss-Punkts: das Gesetz des Gelände-Kerns (`flussTiefe`, Karte hydro-faden — dort rechnet die
// Hydrosphäre im Faden) mit dem Gesetz dieser Welt (`HYDROSPHERE`). Leser im Stamm: die Linsen der Wasser-Wahrheit.
AnazhRealm._flussTiefe = function (p) {
    return globalThis.__gelaendeCore.flussTiefe(AnazhRealm.HYDROSPHERE, p);
};
// DER RAND DER PEGEL-MARKE (`_pegelMarke`): so weit über und unter der Makro-Höhe seiner Mitte kann das Wasser eines Chunks stehen
// (die Kante von 43,2 m an einem Hang, ein See über seinem Becken).
AnazhRealm.PEGEL_RAND_M = 40;
