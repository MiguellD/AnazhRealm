class AnazhRealm_siedlung_ort {
    // ===== ATLAS · Siedlung/ort — Siedlungs-Plan · Bau-Frei · Dorf-Erlebnis · Fahr-Platz =====
    // DAS LAND EINES WERKS (Schau-2 wasser-wahrheit): der Boden an (x, z) liegt mehr als `marge` über dem Wasser — dem
    // gezeichneten (`_nassAt`: was das Auge sieht, samt Live-Dach und Ufer) UND dem des Gesetzes, aus dem das Bild wird
    // (`_atlasWaterLevelAt` über dem Boden der Spalte: ein Chunk, dessen Sheet ein Wasser noch nicht zeichnet, trägt es
    // schon — am See −1080/−1135 zeichnete der Fern-Chunk den 8 m tiefen See noch nicht, der Wald pflanzte Erlen auf
    // seinen Grund). Eine Höhle, ein Loch (kein Boden) ist kein Land. Leser: jedes Werk, das gesetzt wird — der Hain und
    // der Satz („am Wasser"), die Natur-Wand (Wald, Unterholz, Streu, Hof-Baum, Bau-Phantom), die Siedlung samt Fundament,
    // Wege, Zäune, Brunnen, Stände, der Ort des Dorfs und der Spawn. Billige Beweise zuerst (Lehre 25): kein Wasser des
    // Gesetzes in der Spalte, oder Fels über seinem Spiegel + Marge — Land ohne Spalten-Scan.
    _landAt(x, z, marge = 0) {
        if (this._nassAt(x, z, marge)) return false;
        const oben = this._atlasWaterLevelAt(x, z, -1e9);
        if (!(oben > -Infinity)) return true;
        if (this._felsUeber(x, z, oben + marge)) return true;
        const boden = this._voxelSurfaceY(x, z);
        if (boden === null || !Number.isFinite(boden)) return false;
        return !(boden < this._atlasWaterLevelAt(x, z, boden) + marge);
    }

    // DAS LAND EINES FUNDAMENTS (Schau-2 wasser-wahrheit, Gegenprüfung): steht der Grundriss `fp` {ex, ez, ox, oz} (bau-lokal)
    // eines Werks am Ort (x, z) mit der Drehung `ry` samt dem Vorplatz seiner Haustür (`tuer`) ganz auf dem Land? Jeder
    // Punkt des EINEN Fundament-Rasters (`_fundamentRaster`) fragt das Land eines Werks (`_landAt`, 20 cm über dem Spiegel);
    // ohne Grundriss urteilt der Ort selbst. Der Ursprung zuerst (der billige Beweis: die meisten Würfe im Wasser fallen dort).
    // Leser: die Siedlung (`_spawnSettlementSlot`, Grundriss aus dem Export) und die Wand jedes Werks (`_werkImWasser`).
    // Befund: nur die Siedlung fragte das ganze Fundament — „bau mir ein haus am wasser" stellte an 11 von 11 Uferorten ein
    // Haus, dessen Fundament 6–67 von 81 Raster-Punkten bis 0,92–3,68 m tief im Wasser stand (der Satz fragte die Mitte).
    _fundamentLand(x, z, ry, fp, tuer, saum = 0) {
        if (!this._landAt(x, z, AnazhRealm.WERK_LAND_M)) return false;
        if (!fp) return true;
        const c = Math.cos(ry || 0);
        const s = Math.sin(ry || 0);
        // DER GRUND SAMT SAUM (K10): ein Haus eines Orts steht auf der Platte seines Erdbaus — dem Grundriss samt dem Saum des
        // Orts-Gesetzes (fachwerk `ORT_GESETZ.saumM`, `ortPlan`); das Land fragt dieselbe Fläche, die der Erdbau formt, im
        // halben Meter (gate:werk-im-wasser Z misst ≤ 1 m). Ein Werk ohne Ort (der Satz, der Tempel) trägt keinen Saum.
        const raster = saum > 0 ? { ex: fp.ex + saum, ez: fp.ez + saum, ox: fp.ox, oz: fp.oz } : fp;
        for (const [lx, lz] of AnazhRealm._fundamentRaster(raster, tuer, 0.5))
            if (!this._landAt(x + lx * c + lz * s, z - lx * s + lz * c, AnazhRealm.WERK_LAND_M)) return false;
        return true;
    }
    // DER ORT AUF DEM GELÄNDE (K10): der Export des Studios (2D) wird am Anker zum Plan v2 — dieselbe Formel, die das Studio
    // rechnet (fachwerk `ortPlan`), über DIESELBE Gelände-Funktion (`_terrainMacroSurfaceY`, das Gesetz samt dem Erdbau früherer
    // Orte); sein Erdbau liegt, bevor das erste Haus steht. Ein Plan, der schon v2 ist, bleibt. Leser: der Akt
    // (`spawnSettlement` über `_ortWahl`), der Export (`_spawnSettlementFromExport`) und das Auto-Dorf
    // (`_tickAutoSettlement`); die Slot-Quelle liest `slot.y`.
    // DIE ORT-WAHL (K10, Leiter mensch.netz.verkehr: „Häuser im Fluss-Bett heilen am Plan"): der Anker ist der Wunsch; der Plan steht am
    // nächsten Ort der Ringe um ihn (`ORT_WAHL`: je `schrittM` ein Ring bis zur halben Siedlungs-Zelle, auf jedem Ring Orte im
    // Abstand ≤ `schrittM`), an dem er JEDES Haus trägt (Ort-Faden `ortTraegt`, am Wirt `_ortTraegtWirt`: jede Platte samt Saum und Vorplatz liegt auf dem
    // Boden des Plans, `WERK_LAND_M` über dem Wasser des Gesetzes — das Urteil der Wasser-Wand jedes Werks, `_fundamentLand` —,
    // kein Haus in einem Bau, `_bauFrei`, keins auf dem Spieler). Bis K10-6 stand das Auto-Dorf der Welt am Wunsch: vier
    // Platten lagen 0,6 m unter dem Spiegel des Flusses, die Wand warf die Häuser (12/16); die Ringe bis 72 m fanden keinen
    // Ort (der Fluss läuft 18 m neben dem Anker, das Dorf misst 65 m Radius, der nächste trockene Ort liegt 80 m weit). Der
    // Anker folgt dem Ort des Plans (`origin` x, z und seine Mitte). Ohne trockenen Ort bleibt der Wunsch, laut.
    // DER ORT WIRD WELT: der Plan v2 aus dem Gedächtnis des Orts (`_ortPlaene`, die Wahl `_ortWahl` im Ort-Faden) — `legen`
    // legt seinen Erdbau (`_erdbauSetzen` je Schlüssel einmal), der Anker `origin` (x, z und seine Mitte) rückt an seinen Ort.
    // Ein Plan, der schon v2 ist, bleibt. Ohne Wahl wirft der Ruf laut: die Wahl rechnet im Faden, wer sie braucht, wartet
    // auf `_ortWahl` (der Akt, der Vorlauf, der Prüfstand).
    _ortPlanSetzen(plan, origin, legen = true) {
        if (plan && plan.version === 2) return plan;
        const key = AnazhRealm._ortSchluessel(plan, origin);
        const v2 = this._ortPlaene && this._ortPlaene.get(key);
        if (!v2)
            throw new Error(
                `ORT: der Plan „${plan.name || "?"}" hat an ${key} keine Wahl — der Rufer wartet auf _ortWahl`
            );
        if (legen) this._erdbauSetzen(key, v2.erdbau);
        const dx = v2.ort.x - origin.x;
        const dz = v2.ort.z - origin.z;
        origin.x = v2.ort.x;
        origin.z = v2.ort.z;
        if (origin.mitte) origin.mitte = { x: origin.mitte.x + dx, z: origin.mitte.z + dz };
        return v2;
    }

    _tickHausTueren(currentTime) {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !Array.isArray(st.architectures)) return;
        // `currentTime` sind SEKUNDEN (der Loop: `t / 1000`) — der Scan jede Sekunde. Bis 0710-11 stand hier `> 1000`: die
        // Liste baute sich nur alle 1 000 s neu, ein Haus, das danach in die Nähe kam oder beim Scan noch kein Mesh trug, öffnete
        // seine Tür bis zu ~17 min nicht (gate:brennglas-takt (H)).
        if (!this._hausTuerScanT || currentTime - this._hausTuerScanT > 1) {
            this._hausTuerScanT = currentTime; // Instanz-Felder (die _editSaveTimer-Klasse: nicht serialisiert)
            const nah = [];
            const p = pm.position;
            // die Plätze um den Spieler (`_blockerUmPlatz`, in der Ordnung des Bestands) — vorher jeder Eintrag je Scan
            const kand = this._hausTuerKand || (this._hausTuerKand = []);
            kand.length = 0;
            this._blockerUmPlatz(p.x, p.z, 40 + 1e-6, kand);
            for (const e of kand) {
                if (!e || !e.tuer || !e.position || !e.instSlots) continue;
                const dx = e.position.x - p.x;
                const dz = e.position.z - p.z;
                if (dx * dx + dz * dz < 1600) nah.push(e); // 40 m
            }
            this._hausTuerNah = nah;
        }
        const nah = this._hausTuerNah;
        if (!nah || !nah.length) return;
        const gz = AnazhRealm._tuerOffenRad();
        for (const e of nah) {
            if (!e.instSlots) continue; // zwischenzeitlich geculled
            const d = Math.hypot(e.position.x - pm.position.x, e.position.z - pm.position.z);
            // Reichweite = halbe Kern-Diagonale + Schwelle: die Tür beginnt sich
            // ~5 m vor der Wand zu öffnen und steht offen, wenn man sie erreicht.
            const reach = Math.max(e.tuer.W || 6, e.tuer.D || 6) * 0.5 + 1.2;
            const act = Math.max(0, Math.min(1, 1 - (d - reach) / 5));
            const rec =
                e._tuerRec ||
                (e._tuerRec = {
                    tor: { gestalt: this._foundryPresetForEntry(e) || "haus" },
                    _fluegelStart: gz, // Start = gebackene Offen-Pose (weiches Erst-Schliessen)
                });
            this._tickTorFluegel(rec, e, act);
        }
    }

    // DER PLATZ, DEN DIE WELT WÄHLT (Leben-Schau 2, fahr-bahn — Befund: der Vorschau-GT am Garage-Tor stand 38° steil und
    // 40° gewankt auf dem Felsblock, W 3 s brachte 0,08 m; der Ort lag 8 m radial hinter dem Tor, ohne Neigungs- und Fels-
    // Probe). Ein Wagen, den die Welt hinstellt (`spawnArchitecture` ohne präzisen Ort: die Vorschau, „bau mir einen gt",
    // der Nexus), steht auf fahrbarem Grund (`_fahrPlatzFrei`); ist der gewünschte Ort keiner, wandert er zum nächsten in
    // Ringen um ihn (vehicle-core FAHR.platz: Schritt und Radius; je Ring der Umfang in Schritten, ab der Fahrt-Richtung —
    // deterministisch, jeder Peer gleich). Ein präziser Ort (Wiederherstellen, Mitspieler, das Phantom, die Linsen) bleibt
    // bit-treu. Trägt kein Ort im Radius, stellt die Welt den Wagen nicht hin (false; die Wurzel sagt „platz", das Log nennt
    // den Grund) — nie still auf den Fels. → true, wenn der Wagen steht (oder kein Studio-Wagen ist). Die Suche selbst ist
    // ein Weg in Schritten (`_fahrPlatzWege`): die Wurzel geht ihn ganz, die Vorschau im Takt (`_ensurePortalPreview`).
    _fahrPlatzSuche(entry) {
        const weg = this._fahrPlatzWege(entry);
        let r = weg.next();
        while (!r.done) r = weg.next();
        return r.value;
    }

    // Der Weg der Platz-Suche: je Ort ein Schritt (yield), am Ende true (der Wagen steht dort, Lage und Gier am Eintrag) oder
    // false (kein Platz im Radius).
    *_fahrPlatzWege(entry) {
        const fzg = this._fahrzeugGesetzFor(entry);
        if (!fzg || !fzg.drive || !fzg.drive.huelle) return true;
        entry._fahrAchseX = true; // Studio-Wagen: Bug +x (die Aufstandspunkte lesen das Gesetz)
        const prof = this._vehicleProfile(entry);
        const G = prof ? this._fahrSatz(entry, prof) : null;
        if (!G) return true;
        const P = AnazhRealm._fahrPlatzGesetz().P;
        const k = this._fahrHuelleBau(entry, G);
        const ry = (Number.isFinite(entry.rotationY) ? entry.rotationY : 0) + Math.PI / 2;
        const x0 = entry.position.x;
        const z0 = entry.position.z;
        const grund = this._fahrPlatzFrei(entry, G, k, x0, z0, ry);
        if (!grund) return true;
        for (let r = 0; r <= P.suchRadiusM + 1e-9; r += P.suchSchrittM) {
            const n = r === 0 ? 1 : Math.max(8, Math.round((2 * Math.PI * r) / P.suchSchrittM));
            for (let i = 0; i < n; i++) {
                yield r;
                const a = ry + (i / n) * 2 * Math.PI;
                const x = x0 + Math.sin(a) * r;
                const z = z0 + Math.cos(a) * r;
                for (let j = r === 0 ? 1 : 0; j < P.richtungen; j++) {
                    const rj = ry + (j / P.richtungen) * 2 * Math.PI;
                    const g = this._fahrPlatzFrei(entry, G, k, x, z, rj);
                    // zu steil ist der Grund, nicht die Richtung: die Fallinie der Ebene trägt keine Drehung weiter
                    if (g === "steil") break;
                    if (g) continue;
                    entry.position.x = x;
                    entry.position.z = z;
                    entry.rotationY = rj - Math.PI / 2; // Studio-Wagen: Template-Gier = Fahrt − π/2
                    this._blockerBewegt(entry); // im Bestand meldet er den neuen Platz (vor dem Eintritt: nichts zu melden)
                    this.log(
                        `Fahr-Platz: ${entry.type} steht ${r} m weiter auf fahrbarem Grund (dort: ${grund}).`,
                        "INFO"
                    );
                    return true;
                }
            }
        }
        this.log(
            `Fahr-Platz: kein fahrbarer Grund im Umkreis von ${P.suchRadiusM} m um (${x0.toFixed(1)}, ${z0.toFixed(1)}) — die Welt stellt ${entry.type} nicht hin (dort: ${grund}).`,
            "WARN"
        );
        return false;
    }

    // Steht der Wagen bei (x, z) in Fahrt-Richtung `ry` frei, und hat er eine BAHN? null = ja, sonst der Grund beim Namen:
    // der Stand dort (`_fahrStandFrei`) und derselbe Stand je Wagenlänge bis bahnLaengen Wagenlängen vor und hinter ihm
    // (vehicle-core FAHR.platz) — die Stände liegen Hülle an Hülle, die Bahn trägt keine Lücke; er fährt in beide Richtungen
    // los, ohne sofort anzustoßen. Bis w13-wagen-ki trug die Bahn EINE Wagenlänge (GT 4,6 m): der Wagen der KI stand mit einer
    // Eiche 4,8 m vor dem Bug, W hielt 120 s, er fuhr 4,78–4,82 m und stand (diag-werkstatt-weg L-Verben, ki · Third · Wagen,
    // main a4dc2a45 rot in 2 von 5 Läufen). Die billige Probe zuerst (Lehre 25): die Ebene der Räder an jedem Stand
    // (vehicle-core fahrPlatz), erst dann die Welt des Wirts.
    _fahrPlatzFrei(entry, G, k, x, z, ry) {
        const { vc, P } = AnazhRealm._fahrPlatzGesetz();
        const L = k.bug - k.heck;
        const fX = Math.sin(ry);
        const fZ = Math.cos(ry);
        const boden = this._werkBoden(entry);
        const wo = (s) => (s === 0 ? "" : ` ${s > 0 ? "vor" : "hinter"} ihm`);
        const staende = [0];
        for (let n = 1; n <= P.bahnLaengen; n++) staende.push(n, -n);
        const ebenen = [];
        for (const s of staende) {
            const pl = vc.fahrPlatz(G, boden, x + fX * L * s, z + fZ * L * s, ry - Math.PI / 2);
            if (!pl.ok) return pl.grund + wo(s);
            ebenen.push(pl.eb);
        }
        for (let i = 0; i < staende.length; i++) {
            const s = staende[i];
            const g = this._fahrStandFrei(entry, k, x + fX * L * s, z + fZ * L * s, ry, ebenen[i]);
            if (g) return g + wo(s);
        }
        return null;
    }

    // Der STAND bei (x, z) auf der Ebene `eb` seiner Räder (vehicle-core fahrPlatz auf dem Boden des Werks, `_werkBoden` —
    // derselbe, auf dem `_fahrzeugStand` ihn danach abstellt und der Ritt ihn fährt; `_fahrPlatzFrei` fragt sie) in der Welt
    // des Wirts: E steigt ein (kein Tor reicht mit seiner E-Reichweite an einen Platz, von dem aus der Spieler
    // einsteigt — sonst betritt E das Tor: „bau mir einen gt" stand 5,3 m vor welt_portal), die Hülle steht auf dem Land
    // eines Werks (`_landAt`: die Mitte, dann die vier Ecken), keine Wand des Geländes unter der Hülle (5 × 3 Punkte — der
    // Fels, der in den Wagen ragt), keine Box eines Baus, Baums oder Wagens im Band der Hülle (der EINE Struktur-Löser mit der
    // Hülle als Körper, wie im Ritt), der Spieler nicht unter dem Wagen. Die Wand ist die des Kontakts (`_fahrGelaendeWand`
    // ohne Fahrt-Richtung: jede steile Fläche zählt). Die billigen Proben zuerst (Lehre 25).
    _fahrStandFrei(entry, k, x, z, ry, eb) {
        const torFrei = AnazhRealm.PORTAL_REACH_M + AnazhRealm.MOUNT_RANGE_M;
        for (const t of this._blockerMit("isPortal"))
            if (t.position && (t.position.x - x) ** 2 + (t.position.z - z) ** 2 < torFrei * torFrei) return "tor";
        const fX = Math.sin(ry);
        const fZ = Math.cos(ry);
        const qX = Math.cos(ry);
        const qZ = -Math.sin(ry);
        if (!this._landAt(x, z)) return "wasser";
        for (const l of [k.bug, k.heck])
            for (const q of [-k.hw, k.hw]) if (!this._landAt(x + l * fX + q * qX, z + l * fZ + q * qZ)) return "wasser";
        const tS = Math.tan(eb.steig);
        const tW = Math.tan(eb.wank);
        for (let i = 0; i <= 4; i++) {
            const l = k.heck + ((k.bug - k.heck) * i) / 4;
            for (const q of [-k.hw, 0, k.hw]) {
                const px = x + l * fX + q * qX;
                const pz = z + l * fZ + q * qZ;
                if (this._fahrGelaendeWand(px, pz, eb.y + tS * l + tW * q, k, 0, 0)) return "fels";
            }
        }
        const pm = this.state.playerMesh;
        if (pm && pm.position) {
            const dx = pm.position.x - (x + fX * k.mitte);
            const dz = pm.position.z - (z + fZ * k.mitte);
            const rS = AnazhRealm.PLAYER_WALL_RADIUS;
            if (Math.abs(dx * fX + dz * fZ) < k.hl + rS && Math.abs(dx * qX + dz * qZ) < k.hw + rS) return "spieler";
        }
        // die Hülle steht, wie der Wagen dort parkt (`_fahrzeugStand`: die Ebene seiner Räder, Nick = −Steigung)
        this._fahrHuelleStellen(k, fX, fZ, -eb.steig, eb.wank, eb.y + k.stufe, eb.y + k.dach);
        const pos = this._fahrPlatzPos || (this._fahrPlatzPos = { x: 0, z: 0 });
        pos.x = x;
        pos.z = z;
        this._stepCharacterStructures(pos, 0, 0, 0, k);
        return k.schub.length ? "bau" : null;
    }
    // Siedlung als DATEN anfragen: der Worker rechnet exportSettlement und liefert reine Slot-Daten (kein
    // Mesh, kein Cache — ein deliberater Akt). Fail-closed: kein Worker/nicht ready → null. Dieselbe
    // pending-Map wie die Assets.
    // DIE TRASSE LIEST DAS GELÄNDE (siedlung.K3): `dp.ort` {x, z}, der Ort, an dem der Plan liegen wird, holt vor dem Export das
    // Höhen-Raster seines Rahmens (fachwerk `trasseRahmen`) aus dem Ort-Faden (`ort-raster`, gelaende-core `hoehenRaster`,
    // Lehre 14) als `dp.hoehe` — die Gassen des Exports folgen dem Grund dort (fachwerk `dorfLayout`). Ohne Ort (der Akt, dessen
    // Anker erst der Plan nennt; der Wege-Bau eines Alt-Saves) liegt der Plan auf ebenem Grund. Steht der Ort-Faden noch nicht, ist der
    // Export null wie bei kalter Foundry (der nächste Takt fragt neu; ein Wurf im Faden meldet sein `_bruchMelden`).
    _foundryRequestSettlement(dp, kopf) {
        const f = this._ensureAssetFoundry();
        if (!f || !f.ready || !f.worker) return Promise.resolve(null);
        const d = Object.assign({}, dp || {});
        const ort = d.ort;
        delete d.ort;
        // DAS KLIMA IST EIN EINGANG DES PLANS (haus-gestalt, fachwerk `REGION_KLIMA`): der Kanal liest kein Klima selbst — wer ein Dorf
        // OHNE WORT bestellt, legt das Klima seines Orts in den Auftrag (`_zellEingang`: die Zelle des Dorf-Zugs, ihr Gedächtnis), und
        // wer den Plan nachrechnet, rechnet mit demselben Eingang denselben Plan (gate:settlement Teil O: der Plan-Hash Studio = Welt).
        // Der Plan eines Worts (der Satz „dorf 7 300“, sein Gedächtnis „d:…“ und die Kacheln seiner Stadt) trägt keins: er ist eine
        // Funktion des Worts allein, derselbe an jedem Ort, für jeden, der ihn teilt.
        // DAS WASSER DES RASTERS (die Stadt-Grammatik liest es, fachwerk `dorfLayout`): der Faden nennt je Zelle im Umkreis des
        // Plans (fachwerk `wasserReich`: der Ring der Stadt samt Vorstadt, 0 für das Dorf), ob dort das Wasser des Gesetzes steht (`nass`, das Urteil der Ort-Wahl) — seine Kacheln
        // liegen, bevor er urteilt (`_ensureHydroTilesAround`, wie die Ort-Wahl)
        const nassR = ort ? globalThis.__fachwerkCore.wasserReich(d.nH) : 0; // 0: das Dorf liest kein Wasser
        const wasser =
            nassR > 0 && this._ensureHydroTilesAround(ort.x, ort.z, nassR)
                ? Promise.all([...this._hydroBestellt.values()].map((e) => e.zusage))
                : Promise.resolve();
        const raster = ort
            ? wasser
                  .then(() =>
                      this._nebenAuftrag("ort", {
                          type: "ort-raster",
                          x: ort.x,
                          z: ort.z,
                          rahmen: globalThis.__fachwerkCore.trasseRahmen(d.nH),
                          nass: nassR > 0 ? { W: AnazhRealm.ORT_WAHL, M: AnazhRealm.WERK_LAND_M, r: nassR } : undefined,
                      })
                  )
                  .then(
                      (r) => r.raster,
                      (e) => (
                          this.log(
                              `SIEDLUNG: der Export wartet auf das Höhen-Raster — ${(e && e.message) || e}`,
                              "INFO"
                          ),
                          false
                      )
                  )
            : Promise.resolve(null);
        // Durch DIE EINE WORKER-SCHLANGE, sofort dran (ein deliberater Akt, reine Daten). Dieselbe EINE Frist (45 s
        // Arbeit): ohne Uhr hielte ein verlorener Export die FIFO-Uhr aller späteren Aufträge an.
        return raster.then((hoehe) => {
            if (hoehe === false) return null;
            if (hoehe) d.hoehe = hoehe;
            return this._foundryAuftrag(
                f,
                "stl-",
                { type: "export-settlement", dp: d },
                this._foundryRang(0, kopf), // das Start-Dorf ist ein Kopf der Ankunft (`_startDorfAmBuch`, die Bahn ohne Arbeit)
                45000,
                "FOUNDRY TIMEOUT: export-settlement nach 45 s Arbeit ohne Reply → null"
            );
        });
    }
    // DIE EINE SLOT-QUELLE: `_spawnSettlementFromExport` (der Akt) und `_tickAutoSettlement`
    // (über Ticks) heben jeden Slot hier. Blueprint-Name aus KIND_POLICY über den kind des LIVE-Rezepts
    // (prefix + kultur, kein "haus_"-Literal); die Spalten-Probe `_nassAt` über dem ganzen Fundament vor JEDEM Spawn; fehlender Blueprint/
    // fremde Kultur → Slot fällt GESCHLOSSEN aus. Γ5: aller Zufall lebt im Export, hier nur lesen +
    // platzieren (spawnArchitecture silent). Rückgabe true = platziert.
    // DIE BAU-WAND (Integration Welle L, Stufe kampf-maus): ein Haus landet nie IN einem bestehenden Bau, und vor seiner
    // Haustür bleibt der Zugang frei. Geprüft werden der Grundriss (haus-lokal Mitte {ox, oz}, halbe Maße {ex, ez}, Gier ry
    // um den Slot-Ort x/z) und der Vorplatz der Tür (1,2 m vor der Front −z, Türbreite) gegen die Hülle jedes Baus, der
    // nicht weicht (Natur und Würfe des Felds weichen dem Haus: `_weichtDemBau`, `_grundrissRaeumen`) — die Boxen über dem Boden des Hauses (Oberkante über
    // bodenY + Stufe), gedreht im Rahmen ihrer obb; ein Haus ohne gestempelte Hülle mit seinem Grundriss. Berührung ist kein
    // Überlapp (die Reihenhäuser einer Siedlung teilen ihre Wand). Seit „vor dir" vorn liegt (_blickVorn), gründet der
    // Chat-Akt „dorf" sein Dorf vor dem Spieler — an der Start-Plattform stand ein Haus 3,6 m tief in ihr (die Treppe
    // versperrt), ein zweites mit der Haustür an ihrer Wand (gate:haus-welt W1/W3/W7). Gibt false, wenn ein Bau im Weg ist.
    // `nur`: die Wand gegen DIESEN Bau allein, ob er weicht oder nicht (die Räumung, `_naturRaeumen`: trifft der Wurf den Bau?).
    _bauFrei(x, z, ry, fp, tuer, bodenY, nur) {
        const c = Math.cos(ry);
        const s = Math.sin(ry);
        const T = 0.05;
        const flaeche = (lx, lz, hx, hz) => ({ cx: x + lx * c + lz * s, cz: z - lx * s + lz * c, hx, hz, c, s });
        const flaechen = [flaeche(fp.ox, fp.oz, Math.max(0, fp.ex - T), Math.max(0, fp.ez - T))];
        if (tuer && Number.isFinite(tuer.x) && Number.isFinite(tuer.z) && Number.isFinite(tuer.w))
            flaechen.push(flaeche(tuer.x, tuer.z - 0.6, tuer.w / 2, 0.6 - T));
        const R = Math.hypot(fp.ex, fp.ez) + Math.hypot(fp.ox, fp.oz) + 2;
        // DIE FLÄCHEN DES GENESIS-ORTS sperren jedes Haus (der Plan der Welt, `_genesisFlaeche`): kein Haus steht auf Kern, Ring,
        // Allee, Wiese, Ufer oder einer Bühne, keins reicht in den Freiraum der Tore — bis zum Plan sperrte die Lichtung einer
        // Stein-Scheibe samt dem Ring der Tore (seit K52 stand kein Haus zwischen den Toren)
        // (`_bauFreiAn`: an wem die Wand fiel — der Bau im Weg oder „genesis", die Fläche des Genesis-Orts; die Zeile der Gründung nennt ihn)
        this._bauFreiAn = null;
        if (!nur && this._genesisFlaeche(x, z, R)) return ((this._bauFreiAn = "genesis"), false);
        const STEP = AnazhRealm.PLAYER_STEP_UP;
        const b2 = this._bauFreiBox || (this._bauFreiBox = { cx: 0, cz: 0, hx: 0, hz: 0, c: 1, s: 0 });
        const trifft = () => {
            for (const a of flaechen) if (this._rechteckeSchneiden(a, b2)) return true;
            return false;
        };
        // die Nähe aus dem Platz-Netz (`_blockerUmPlatz`: Ort ± Reichweite, eine Obermenge), nie der ganze Bestand — bis
        // stadt-erwachen fragte jede Laterne des Erwachens jeden Bau der Welt (nH 300: 104 × ~2 000)
        const nahe = this._bauFreiNahe || (this._bauFreiNahe = []);
        nahe.length = 0;
        for (const e of nur ? [nur] : this._blockerUmPlatz(x, z, R + 8, nahe)) {
            if (!e || !e.position) continue;
            const r = R + (e._blockerReach || 0) + 8;
            if (Math.abs(e.position.x - x) > r || Math.abs(e.position.z - z) > r) continue;
            if (!nur && this._weichtDemBau(e)) continue; // Natur und die Würfe des Felds weichen dem Haus (`_naturRaeumen`)
            const boxen = e.blockerAABBs;
            if (boxen && boxen.length) {
                for (const b of boxen) {
                    if (!(b.topY > bodenY + STEP)) continue;
                    const ob = b.obb;
                    if (ob) {
                        b2.cx = ob.cx;
                        b2.cz = ob.cz;
                        b2.hx = ob.hx;
                        b2.hz = ob.hz;
                        b2.c = ob.c;
                        b2.s = ob.s;
                    } else {
                        b2.cx = (b.minX + b.maxX) / 2;
                        b2.cz = (b.minZ + b.maxZ) / 2;
                        b2.hx = (b.maxX - b.minX) / 2;
                        b2.hz = (b.maxZ - b.minZ) / 2;
                        b2.c = 1;
                        b2.s = 0;
                    }
                    if (trifft()) return ((this._bauFreiAn = e), false);
                }
                continue;
            }
            // ein Werk ohne Boxen und Grundriss (der gepflanzte Baum, die Wiederkehr) sperrt seinen Fuß, wie die Natur-Wand ihn hält
            // (0,8 m, `_naturWand`) — es weicht keinem Haus, also steht keins auf ihm
            const g = this._grundrissVon(e) || (e.werk === true ? { ex: 0.8, ez: 0.8, ox: 0, oz: 0 } : null);
            if (!g) continue;
            const ery = Number.isFinite(e.rotationY) ? e.rotationY : 0;
            b2.c = Math.cos(ery);
            b2.s = Math.sin(ery);
            b2.cx = e.position.x + g.ox * b2.c + g.oz * b2.s;
            b2.cz = e.position.z - g.ox * b2.s + g.oz * b2.c;
            b2.hx = g.ex;
            b2.hz = g.ez;
            if (trifft()) return ((this._bauFreiAn = e), false);
        }
        return true;
    }

    // Die Bau-Wand für einen runden Bau des Dorfs (Brunnen, Laterne, Marktstand): das Quadrat in seinem Fußabdruck-Kreis
    // (Radius aus dem Bauplan) — ein Nachbar, der den Kreis nur streift, sperrt nicht. Den Häusern seines eigenen Plans weicht
    // die Ausstattung im Plan (fachwerk `brunnenWeicht`, S4-N4), nie hier.
    _bauFreiRund(type, x, z, bodenY) {
        const R = Math.max(0.5, (this._blueprintFootprintRadius(type, 1) || 0) * Math.SQRT1_2);
        return this._bauFrei(x, z, 0, { ex: R, ez: R, ox: 0, oz: 0 }, null, bodenY);
    }

    // Schneiden sich zwei gedrehte Rechtecke der Ebene? Je Rechteck Mitte {cx, cz}, halbe Maße {hx, hz} und die Drehung
    // {c, s} im Rahmen der Hülle (lokal → Welt: x = cx + lx·c + lz·s, z = cz − lx·s + lz·c; dieselbe wie `box.obb`).
    // Trennende Achsen: die vier Kanten-Richtungen; Berührung zählt nicht.
    _rechteckeSchneiden(a, b) {
        const dx = b.cx - a.cx;
        const dz = b.cz - a.cz;
        for (let i = 0; i < 4; i++) {
            const R = i < 2 ? a : b;
            const nx = i % 2 === 0 ? R.c : R.s;
            const nz = i % 2 === 0 ? -R.s : R.c;
            const ra = a.hx * Math.abs(a.c * nx - a.s * nz) + a.hz * Math.abs(a.s * nx + a.c * nz);
            const rb = b.hx * Math.abs(b.c * nx - b.s * nz) + b.hz * Math.abs(b.s * nx + b.c * nz);
            if (Math.abs(dx * nx + dz * nz) >= ra + rb) return false;
        }
        return true;
    }

    // DAS EINE RASTER EINES FUNDAMENTS (bau-lokal, [lx, lz, flaeche]): die Fläche des Grundrisses `fp` {ex, ez, ox, oz} in
    // Schritten ≤ 2 m samt ihren Kanten (flaeche true) und der Vorplatz der Haustür `tuer` (0,25 m und 1 m vor der Front −z,
    // je drei Punkte über die Türbreite; flaeche false). Integration Welle L: vier Ecken und die Mitte ließen den Buckel
    // zwischen sich durch — an einer Kuppe der Front lag die Haustür 2,9 m unter dem Gelände (gate:haus-welt W1). Leser: die
    // Höhe der Siedlung (`_spawnSettlementSlot`) und das Land jedes Fundaments (`_fundamentLand`).
    // `schritt` (m, Vorgabe 2): die Höhe misst Buckel in 2 m, das Land misst die Wasserlinie in 1 m (werk-ufer: zwischen
    // den 2-m-Punkten lag die Linie 0,85 m tief im Grundriss, das Haus am Gleithang stand 0,27 m im Wasser — Z misst ≤ 1 m).
    static _fundamentRaster(fp, tuer, schritt = 2) {
        const out = [];
        if (!fp || !Number.isFinite(fp.ex) || !Number.isFinite(fp.ez) || !(fp.ex > 0) || !(fp.ez > 0)) return out;
        const ox = Number.isFinite(fp.ox) ? fp.ox : 0;
        const oz = Number.isFinite(fp.oz) ? fp.oz : 0;
        const deckel = Math.ceil(24 / schritt);
        const nx = Math.min(deckel, Math.max(1, Math.ceil((2 * fp.ex) / schritt)));
        const nz = Math.min(deckel, Math.max(1, Math.ceil((2 * fp.ez) / schritt)));
        for (let i = 0; i <= nx; i++)
            for (let j = 0; j <= nz; j++)
                out.push([ox + fp.ex * ((2 * i) / nx - 1), oz + fp.ez * ((2 * j) / nz - 1), true]);
        if (tuer && Number.isFinite(tuer.x) && Number.isFinite(tuer.z) && Number.isFinite(tuer.w))
            for (let i = -1; i <= 1; i++) {
                out.push([tuer.x + (i * tuer.w) / 2, tuer.z - 0.25, false]);
                out.push([tuer.x + (i * tuer.w) / 2, tuer.z - 1, false]);
            }
        return out;
    }

    _spawnSettlementSlot(slot, origin, f, so) {
        if (!slot || typeof slot.kultur !== "string" || !origin) return false;
        // DER BODEN DES PLANS (K10): der Slot trägt seine Höhe `y` aus dem Plan v2 (fachwerk `ortPlan`, `_ortPlanSetzen`) — die
        // Welt erfindet keine Höhe mehr: die hMax-Suche über das Raster, das Podest, die Klippen-Wand und die Ersatz-Orte fielen,
        // der Erdbau des Orts trägt das Haus. Ein Slot ohne y fällt geschlossen und laut.
        const wx = origin.x + slot.x;
        const wz = origin.z + slot.z;
        // DER GRUND FÄLLT MIT DEM SLOT (S4): der Erdbau des Orts trägt den Grund jedes Hauses seines Plans (`ortPlan`); fällt
        // der Slot geschlossen, fällt sein Grund wie beim Abbau (`_erdbauGrundFaellt`) — die Platte des Plans bleibt. Bis S4-N3
        // blieb er: am Start-Dorf schnitt der Grund des Alpenchalets, das am Brunnen des eigenen Plans fällt (Bau-Wand), ein
        // Loch ins Leere (53,7/108,4, gate:haus-welt W9 Waise).
        // DAS LOS FÄLLT BEIM NAMEN (w28-stadt-grammatik): die Wand, an der es fällt, reist in die Bilanz des Zugs (`so.gefallen`,
        // `_dorfZugSchritt`) und in die Zeile der Gründung. Bis hier zählte die Zeile nur („3 Slots übersprungen"): an der Stadt
        // „dorf 7 30" fielen Bergfried #771582 und Kapelle #899220 der Burg samt einem Wohnhaus — die Stadt stand ohne ihren
        // Bergfried, und keine Zeile nannte, warum (gate:kreatur-takt zielplan „Rollen ohne Ziel-Ort").
        const ohne = () => {
            const k = so && so.gefallen ? so.gefallen.findIndex((g) => g.si === so.si) : -1;
            if (k >= 0) so.gefallen.splice(k, 1);
        };
        const zu = (wand) => {
            ohne();
            if (so && so.gefallen)
                so.gefallen.push({
                    si: so.si,
                    rolle: typeof slot.rolle === "string" ? slot.rolle : "wohnhaus",
                    seed: slot.seed >>> 0,
                    wand,
                });
            this._erdbauGrundFaellt({ position: { x: wx, z: wz } });
            return false;
        };
        // ohne Boden fällt das Los beim Namen in die Bilanz (`so.gefallen`), nicht nur ins Log: bis haus-dach las die Probe es als „fiel still“
        if (!Number.isFinite(slot.y)) {
            this.log(
                `SIEDLUNG: der Slot „${slot.kultur}" trägt keinen Boden y — der Plan v2 fehlt (fail-closed)`,
                "ERROR"
            );
            return zu("kein Boden y");
        }
        const name = this._slotBauplan(slot, f);
        if (!name) return zu("kein Bauplan"); // fail-closed
        const ry = slot.phi || 0;
        const tu = slot.tuer;
        const fp = this._grundrissVon(slot);
        // DIE WASSER-WAND über dem ganzen Grundriss und dem Vorplatz der Tür (`_fundamentLand`, die EINE Probe mit der Wand
        // jedes Werks) und DIE BAU-WAND (kein Haus IN einem bestehenden Bau, keine Haustür an dessen Wand, `_bauFrei`): der
        // Slot fällt an seinem Ort geschlossen — der Plan ist das Dorf, die Welt rückt kein Haus.
        if (!this._fundamentLand(wx, wz, ry, fp, tu, (fp && fp.saum) || 0)) return zu("Wasser-Wand");
        if (!this._bauFrei(wx, wz, ry, fp || { ex: 0.5, ez: 0.5, ox: 0, oz: 0 }, tu, slot.y)) {
            const an = this._bauFreiAn;
            return zu(
                "Bau-Wand an " +
                    (an === "genesis" ? "einer Fläche des Genesis-Orts" : an ? `${an.type} #${an.seed >>> 0}` : "?")
            );
        }
        // DIE WANDLATERNEN DES HAUSES (K66-2): die Laternen des Plans mit seinem Slot (`so.plan`, `so.si`) hängen an seiner
        // Wand — ihre Wasser- und Bau-Wand fragt VOR dem Haus (das eigene Haus sperrt sie nie), sie stehen NACH ihm. Bis
        // K66-2 Nachbesserung hob der Dorf-Akt sie vor den Häusern: die Laterne sperrte ihr eigenes Haus (Auto-Dorf 13/16).
        const wand = [];
        if (so && so.plan && Array.isArray(so.plan.laternen))
            so.plan.laternen.forEach((l, k) => {
                if (!l || !l.wand || l.slot !== so.si) return;
                const ort = this._dorfLaterneOrt(l, origin);
                if (ort) wand.push([l, ort, k]);
            });
        const wy = slot.y + 0.5; // der Bauplan-Boden liegt 0,5 m unter dem Ursprung (`_archEntryWorldMatrix` baseY)
        // AUSLÖSCHUNGS-WELLE — `autonomous` reist durch (spawn_village vom Nexus →
        // die Häuser zählen in den Nexus-Cap, die V18.297-Hort-Lehre).
        const entry = this.spawnArchitecture(
            name,
            { x: wx, y: wy, z: wz },
            {
                seed: slot.seed >>> 0,
                rotationY: slot.phi || 0,
                silent: true,
                autonomous: !!(so && so.autonomous),
                ausGesetz: true, // der Bau eines Orts kehrt aus dessen Gedächtnis wieder (speicher.K3), der Stand trägt ihn nie
                // das Fundament des Hauses eines Orts (die obb des Exports; ein fremder Export ohne obb trägt keins)
                fundament: fp && fp.saum ? { ex: fp.ex, ez: fp.ez, ox: fp.ox, oz: fp.oz } : null,
                // DORF-ERLEBNIS — die Tür-Zeile des Exports (Blocker-Tür-Lücke +
                // Flügel-Reichweite; alte Exporte ohne Feld → undefined, byte-alt).
                tuer: slot.tuer || undefined,
                // KAMIN-RAUCH (.105): Spitze haus-lokal (exportSettlement) — rauchQuelle; null ist das Nein des Exports
                // (kein Kamin: der Host baut das Haus nicht nach), ein Alt-Export ohne Feld bleibt undefined
                chimney: slot.chimney,
                // Das Slot-Rezept (exportSettlement ov) reist als Guss-Stempel: die Optik baut aus DERSELBEN Wahrheit
                // wie Blocker/ext (ov überstimmt den Kultur-Default). Alt-Exporte ohne ov: must-ignore.
                studioOv: slot.ov && typeof slot.ov === "object" ? slot.ov : undefined,
            }
        );
        if (entry) ohne(); // (der Zug, der wiederkehrt: das Los steht jetzt)
        if (entry) for (const [l, ort, k] of wand) this._dorfLaterneSetzen(so.plan, l, ort, k, so);
        // DIE STÜCKE AM HAUS (ort-ausstattung, `_hausStueckSetzen`): das Schild seiner Rolle steht MIT ihm
        if (entry && so && so.plan)
            for (const Z of this._ortStuecke(so.plan))
                for (const [q, k] of Z.amHaus)
                    if (q.slot === so.si) this._hausStueckSetzen(so.plan, Z, q, k, origin, so);
        return entry || zu("die Wurzel"); // das gesetzte Haus (die Dorf-Mitte summiert, wo es steht)
    }
    // DER ORT EINER LATERNE DES PLANS (K10 × K11 × K66-2): die Studio-Gestalt (Bauplan `laterne_dorf` bzw. mit `wand` die
    // Wandlaterne `wandlaterne_dorf`, ihr Licht LICHT_GESETZ.wandlaterne) am Anker, hinter Wasser- und Bau-Wand — die
    // Wandlaterne hängt vor der Wand, die Bau-Wand prüft nur ihren Kopf (der Rund-Fußabdruck reichte in die eigene Wand).
    // Null, wo sie nicht stehen darf. Leser: `_spawnSettlementErlebnis` (der Mast) und `_spawnSettlementSlot` (die Wand).
    _dorfLaterneOrt(l, origin) {
        if (!l || !Number.isFinite(l.x) || !Number.isFinite(l.z)) return null;
        const typ = l.wand ? "wandlaterne_dorf" : "laterne_dorf";
        if (!this.state.blueprints || !this.state.blueprints[typ]) return null;
        const wx = origin.x + l.x;
        const wz = origin.z + l.z;
        if (!this._landAt(wx, wz, 0.2)) return null;
        const wy = this.getTerrainHeightAt(wx, wz);
        if (!Number.isFinite(wy)) return null;
        const frei = l.wand
            ? this._bauFrei(wx, wz, 0, { ex: 0.1, ez: 0.1, ox: 0, oz: 0 }, null, wy)
            : this._bauFreiRund(typ, wx, wz, wy);
        return frei ? { typ, x: wx, y: wy + 0.5, z: wz } : null; // die Bau-Wand: nie in einem Bau
    }
    // Die Laterne des Plans steht: Same je Siedlung und Nummer `k`, gedreht nach ihrem Plan (`th`).
    _dorfLaterneSetzen(plan, l, ort, k, so) {
        return this.spawnArchitecture(
            ort.typ,
            { x: ort.x, y: ort.y, z: ort.z },
            {
                seed: this._ausstattungSame(plan, "laterne", k),
                rotationY: Number.isFinite(l.th) ? -l.th : 0,
                silent: true,
                autonomous: !!(so && so.autonomous),
                ausGesetz: true,
            }
        );
    }
    // DER SAME EINES STÜCKS DER AUSSTATTUNG (Laterne · Brunnen · Stand · Hof-Baum): je Siedlung, Art und Nummer `k` im Plan
    // (`ORT_AUSSTATTUNG`) — der Leser ist das Erlebnis (`_dorfErlebnis`, `_dorfLaterneSetzen`) und sein Abbau
    // (`_ortAusstattungFaellt`)
    _ausstattungSame(plan, art, k) {
        return ((plan.seed >>> 0 || 1) + AnazhRealm.ORT_AUSSTATTUNG[art].ab + k * 7919) >>> 0;
    }
    // DIE STÜCKE EINES PLANS (ORT_AUSSTATTUNG): je Art mit Bauplan, den die Welt kennt, {art, bauplan, kappe, gier, liste,
    // amHaus} — die Liste ihrer Schicht im Plan, in `gegenstaende` die Einträge ihrer Art; was einen `slot` trägt (fachwerk
    // `ortAusstattung`: das Schild an der Tür-Wand), hängt an seinem Haus und steht in `amHaus` ([Stück, Nummer k in seiner
    // Art]), nie in `liste`. Leser: das Erlebnis (`_dorfErlebnis`), der Slot (`_spawnSettlementSlot`), der Vorrat
    // (`_dorfVorbacken`) und der Abbau (`_ortAusstattungFaellt`).
    _ortStuecke(plan) {
        const [A, bp] = [AnazhRealm.ORT_AUSSTATTUNG, this.state.blueprints || {}];
        return Object.keys(A)
            .filter((art) => A[art].bauplan && bp[A[art].bauplan])
            .map((art) => {
                const Z = A[art];
                const alle = Array.isArray(plan[Z.schicht]) ? plan[Z.schicht] : [];
                const eigen = Z.schicht === "gegenstaende" ? alle.filter((q) => q && q.art === art) : alle;
                const amHaus = eigen.map((q, k) => [q, k]).filter(([q]) => q && Number.isInteger(q.slot));
                const liste = amHaus.length ? eigen.filter((q) => !q || !Number.isInteger(q.slot)) : eigen;
                return { art, bauplan: Z.bauplan, kappe: Z.kappe, gier: Z.gier, liste, amHaus };
            });
    }
    // DAS STÜCK AM HAUS (ort-ausstattung): ein Stück `q` des Plans mit `slot` hängt an der Wand seines Hauses — sein Stand ist im
    // Kern gegen die Massen des Hauses, seine Fenster, seine Wandlaterne und jeden fremden Grund geprüft (`ortAusstattung`); die
    // Welt setzt es auf den Boden des Hauses (der Slot des Plans, wie das Haus 0,5 m über ihm), gedreht nach `gier`, in der
    // Gestalt seines Rezepts (`q.gestalt` als `__gestalt`: das Wort des Schilds). Same je Siedlung, Art und Nummer `k`; was
    // schon steht, steht. Leser: `_spawnSettlementSlot` (mit dem Haus) und `_dorfErlebnis` (am stehenden Haus nach dem Wachstum).
    _hausStueckSetzen(plan, Z, q, k, origin, so) {
        const sl = (plan.slots || [])[q.slot];
        if (!sl || !Number.isFinite(sl.y) || !Number.isFinite(q.x) || !Number.isFinite(q.z)) return null;
        const [wx, wz, same] = [origin.x + q.x, origin.z + q.z, this._ausstattungSame(plan, Z.art, k)];
        if (this._dorfSteht(wx, wz, same)) return null;
        return this.spawnArchitecture(
            Z.bauplan,
            { x: wx, y: sl.y + 0.5, z: wz },
            {
                seed: same,
                ...(Z.gier ? { rotationY: Z.gier(q, plan) } : null),
                ...(Number.isInteger(q.gestalt) ? { studioOv: { __gestalt: q.gestalt } } : null),
                silent: true,
                autonomous: !!(so && so.autonomous),
                ausGesetz: true,
            }
        );
    }
    // DIE AUSSTATTUNG FÄLLT (siedlung.K4 Staffel 2): jede Laterne, jeder Brunnen, Stand und Hof-Baum des Plans `plan` (ihre
    // Samen, in seiner Welt am Ort) — der Plan seines neuen Jahrs stellt sie neu (`_dorfErlebnis`): ihre Nummern wechseln mit ihm.
    // Die Wandlaterne hängt an ihrem Haus und steht nur mit ihm (`_spawnSettlementSlot`): sie fällt nur an einem Haus aus `weg`
    // ({x, z, r}: die gefallenen Häuser, r ihre Reichweite). Ebenso das Stück am Haus (`amHaus`, das Schild) — und wo der Plan
    // `neu` es nicht in derselben Gestalt am selben Ort mit demselben Samen trägt (das Jahr wechselt den Ausleger zur Tafel):
    // dann stellt es `_dorfErlebnis` am stehenden Haus neu.
    _ortAusstattungFaellt(plan, weg, neu) {
        const [A, S, o, w] = [AnazhRealm.ORT_AUSSTATTUNG, new Set(), plan.ort, plan.welt];
        const [haus, traegt] = [new Set(["wandlaterne_dorf"]), new Set()];
        for (const art in A)
            for (let k = 0; k < (A[art].kappe || (plan.laternen || []).length); k++)
                S.add(this._ausstattungSame(plan, art, k));
        // (beide Pläne stehen an genau seinem Ort, `_ortNeuRechnen`)
        const kennung = (P, Z, q, k) =>
            `${this._ausstattungSame(P, Z.art, k)}:${q.gestalt | 0}@${Math.round((o.x + q.x) * 20)},${Math.round((o.z + q.z) * 20)}`;
        const steht = new Map(); // je Same eines Stücks am Haus des alten Plans seine Kennung (Same, Gestalt, Ort)
        for (const Z of this._ortStuecke(plan))
            for (const [q, k] of Z.amHaus) {
                const same = this._ausstattungSame(plan, Z.art, k);
                S.add(same);
                haus.add(Z.bauplan);
                steht.set(same, kennung(plan, Z, q, k));
            }
        for (const Z of neu ? this._ortStuecke(neu) : [])
            for (const [q, k] of Z.amHaus) traegt.add(kennung(neu, Z, q, k));
        for (const e of this.state.architectures.slice()) {
            const p = e && e._ausGesetz && S.has(e.seed >>> 0) && e.position;
            if (!p || p.x < o.x + w.x0 || p.x > o.x + w.x1 || p.z < o.z + w.z0 || p.z > o.z + w.z1) continue;
            const amHaus = haus.has(e.type);
            const bleibt = amHaus && !weg.some((h) => Math.hypot(h.x - p.x, h.z - p.z) <= h.r);
            const gleich = e.type === "wandlaterne_dorf" || !neu || traegt.has(steht.get(e.seed >>> 0));
            if (!bleibt || !gleich) this.removeArchitecture(e, { still: true });
        }
    }
    // ═══ DORF-ERLEBNIS: der EINE Hebe-Chokepoint für die Nicht-Haus-Schichten des Exports ═══
    // Wege/Feldwege/Platz → Wege-Pool (`_stlWegeBuild`, dieselbe Höhen-Quelle wie die Häuser); Brunnen
    // über `spawnArchitecture` (Bauplan `brunnen_dorf`). Aufrufer: `spawnSettlement` ·
    // `_autoSettlementSpawnCell` · die Wiederkehr nach dem Reload (`_tickAutoSettlement`: der Stand trägt keinen Bau eines Orts).
    // Konsum: fences/felder/trees/staende/brunnen/laternen (die Studio-Gestalt `laterne_dorf`, ihr Licht das Datum ihres
    // Rezepts); unkonsumiert (export-stripped): mauer/fluss. Die Schichten gehen in EINEM Zug (der Akt, der Wege-Neubau).
    _spawnSettlementErlebnis(plan, origin, so) {
        for (const g = this._dorfErlebnis(plan, origin, so); !g.next().done;);
    }
    // DAS ERLEBNIS IN RATEN (stadt-erwachen, Lehre 14): die Schichten des Plans als Gang — je Schritt EINE Rate: die Bewohner
    // und die Wege, je `AUTO_SETTLEMENT.laternenJeTakt` Laternen, die Ausstattung (Brunnen, Stände, Hof-Bäume); dieselbe Folge
    // und dieselben Samen in Raten (der Dorf-Zug des Erwachens, `_dorfErwachen`) wie in einem Zug.
    *_dorfErlebnis(plan, origin, so) {
        if (!plan || !origin) return;
        this._bewohnerMelden(plan, origin, so && so.key ? so.key : null); // die Bewohner des Plans (`_tickBewohner`)
        yield* this._stlWegeRaten(plan, origin, so && so.key ? so.key : null); // die Wege in Raten des Gangs (w28-stadt-netz)
        // DIE BRÜCKEN DER GASSEN (fahrzeug.K2): das Brücken-Etikett des Plans v2 (fachwerk `ortPlan`: je Gasse über Welt-Wasser
        // die Widerlager [wa, wb] und die Höhen `ys` ihres Wegs) trägt eine Jochbrücke (`_brueckenLegen`)
        const spannen = [];
        for (const rd of plan.roads || [])
            for (const [wa, wb] of rd.bruecken || []) {
                const [A, B, ys] = [rd.pts[wa], rd.pts[wb], rd.ys || []];
                if (A && B && Number.isFinite(ys[wa]) && Number.isFinite(ys[wb]))
                    spannen.push({
                        a: { x: origin.x + A.x, z: origin.z + A.z, y: ys[wa] },
                        b: { x: origin.x + B.x, z: origin.z + B.z, y: ys[wb] },
                    });
            }
        if (spannen.length && so && so.key) this._brueckenLegen(spannen, "dorf:" + so.key);
        this._wegenetzAnschluss(so && so.key); // die Feldwege zu den Nachbarn, deren Plan steht (fahrzeug.K2)
        yield;
        // DIE LATERNEN (K10 × K11): jede Laterne des Plans steht als Studio-Gestalt (Bauplan `laterne_dorf`, fachwerk
        // AUSSTATTUNG `laterne`) — der Leib und das Licht EINER Quelle: das Verzeichnis „licht" stempelt den Eintrag aus dem
        // Datum seines Rezepts (`_lichtDatumDerGestalt`), der Licht-Takt liest ihn wie jede Feuerstelle. Keine Kappe: das
        // Gesetz des Plans setzt die Zahl (je Platz eine, je 25 m Weg eine); Wasser- und Bau-Wand wie der Brunnen. Die Laterne
        // des Plans mit `wand` (K66-2) ist die Wandlaterne: sie hängt an der Wand ihres Hauses und steht MIT ihm
        // (`_spawnSettlementSlot`), nie hier.
        if (Array.isArray(plan.laternen)) {
            let k = 0;
            let j = 0;
            for (const l of plan.laternen) {
                if (!l || l.wand) continue;
                const belegt =
                    Number.isFinite(l.x) &&
                    this._dorfBelegt(origin.x + l.x, origin.z + l.z, this._ausstattungSame(plan, "laterne", k));
                const ort = belegt ? null : this._dorfLaterneOrt(l, origin);
                if (belegt) k++;
                else if (ort) this._dorfLaterneSetzen(plan, l, ort, k++, so);
                if (++j % AnazhRealm.AUTO_SETTLEMENT.laternenJeTakt === 0) yield;
            }
            if (j % AnazhRealm.AUTO_SETTLEMENT.laternenJeTakt) yield;
        }
        if (!Array.isArray(plan.brunnen) || !this.state.blueprints || !this.state.blueprints.brunnen_dorf) return;
        const AU = AnazhRealm.ORT_AUSSTATTUNG;
        // DIE STÜCKE DES PLANS (`_ortStuecke`, ORT_AUSSTATTUNG): der Brunnen, der Marktstand und die Gegenstände der Viertel
        // (fachwerk STADT_GRAMMATIK, `gegenstaende`: das Grab des Friedhofs) — EINE Schleife über die EINE Tafel: je Art ihr
        // Bauplan, ihre Kappe, der Same je Stück, die Wasser-Wand (EINE Quelle) und die Bau-Wand (nie in einem Bau); der Zähler
        // der Art zählt, was steht. Bis zur Stadt-Grammatik je Art eine eigene Schleife (Brunnen, Stand) — eine dritte Art
        // wäre ihre dritte Kopie gewesen.
        let stueck = 0;
        for (const Z of this._ortStuecke(plan)) {
            let n = 0;
            for (const q of Z.liste) {
                if (n >= Z.kappe) break;
                if (!q || !Number.isFinite(q.x) || !Number.isFinite(q.z)) continue;
                const wx = origin.x + q.x;
                const wz = origin.z + q.z;
                const same = this._ausstattungSame(plan, Z.art, n); // deterministisch je Siedlung+Platz
                if (this._dorfBelegt(wx, wz, same) && ++n) continue;
                if (!this._landAt(wx, wz, 0.2)) continue;
                const wy = this.getTerrainHeightAt(wx, wz);
                if (!Number.isFinite(wy)) continue;
                if (!this._bauFreiRund(Z.bauplan, wx, wz, wy)) continue;
                const entry = this.spawnArchitecture(
                    Z.bauplan,
                    { x: wx, y: wy + 0.5, z: wz },
                    {
                        seed: same,
                        ...(Z.gier ? { rotationY: Z.gier(q, plan) } : null),
                        silent: true,
                        autonomous: !!(so && so.autonomous),
                        ausGesetz: true,
                    }
                );
                if (entry) n++;
                if (++stueck % AnazhRealm.AUTO_SETTLEMENT.laternenJeTakt === 0) yield; // die Stücke gehen in Raten wie die Laternen
            }
            // das Stück am Haus, dessen Haus schon steht (der Ort wuchs, das Jahr wechselte seine Gestalt): es hängt sich an; am
            // kommenden Haus setzt es der Slot (`_spawnSettlementSlot`)
            for (const [q, k] of Z.amHaus) {
                const sl = (plan.slots || [])[q.slot];
                if (!sl || !this._dorfSteht(origin.x + sl.x, origin.z + sl.z, sl.seed >>> 0)) continue;
                this._hausStueckSetzen(plan, Z, q, k, origin, so);
                if (++stueck % AnazhRealm.AUTO_SETTLEMENT.laternenJeTakt === 0) yield;
            }
        }
        // Hof-Bäume der Siedlung: die Export-Plätze ({x,z,h}) heben als Studio-Bäume durch spawnArchitecture;
        // h skaliert auf die Export-Höhe (eiche fx.height 6.2). Kappe 12 (Architektur-LOD/Instanzen-Budget),
        // Wasser-Wand, deterministisch je Siedlung + Platz.
        const baumArten = ["baum_eiche", "baum_birke"];
        let t = 0;
        for (const b of Array.isArray(plan.trees) ? plan.trees : []) {
            if (t >= AU.baum.kappe) break;
            if (!b || !Number.isFinite(b.x) || !Number.isFinite(b.z)) continue;
            const wx = origin.x + b.x;
            const wz = origin.z + b.z;
            const seedT = this._ausstattungSame(plan, "baum", t);
            if (this._dorfBelegt(wx, wz, seedT) && ++t) continue;
            if (!this._landAt(wx, wz, 0.2)) continue;
            const wy = this.getTerrainHeightAt(wx, wz);
            if (!Number.isFinite(wy)) continue;
            const art = baumArten[seedT % baumArten.length];
            if (!this._hofBaumTraegt(wx, wz, wy, seedT)) continue;
            // der Hof-Baum geht durch DENSELBEN Grundriss-Chokepoint wie jeder Wurf der Natur (`_naturSetzen`)
            const entry = this._naturSetzen(
                art,
                { x: wx, y: wy, z: wz },
                {
                    seed: seedT,
                    scale: Math.max(0.35, Math.min(0.8, (Number.isFinite(b.h) ? b.h : 3.4) / 6.2)),
                    rotationY: ((seedT >>> 3) % 628) / 100,
                    silent: true,
                    autonomous: !!(so && so.autonomous),
                    ausGesetz: true,
                }
            );
            if (entry) t++;
        }
        yield;
    }

    // DER AKT HEBT ÜBER DEN ZUG (siedlung.K5): die Slots des Plans v2 in seiner Folge (vom Platz nach außen), je Schritt des
    // Zugs (`_dorfZugSchritt`) ein Bild — das erste zeigt das erste Haus. Bis K5
    // hob der Akt alle Slots in EINER Aufgabe (nH 120: 123 Häuser, 410 ms bis zum ersten Bild). Rückgabe: Promise der Bilanz.
    async _spawnSettlementFromExport(plan, origin, so) {
        if (!plan || !Array.isArray(plan.slots) || !origin) return { placed: 0, skipped: 0, mitte: null };
        const welt = this.state; // der Zug baut nur in der Welt seines Akts (`_dorfWeltGing`)
        plan = this._ortPlanSetzen(plan, origin); // der Ort auf dem Gelände (K10): jeder Slot trägt seinen Boden
        // DIE EINE REIHE (`_dorfZug`): der Schirm zuerst, darin das nächste — bis siedlung-k5-nah hob der Akt in der Slot-Folge
        const q = Object.assign(this._dorfZug(plan, origin, null), { so: { autonomous: !!(so && so.autonomous) } });
        let placed = 0;
        let skipped = 0;
        let mx = 0;
        let mz = 0;
        const haeuser = [];
        const abgelehnt = [];
        for (;;) {
            // das gesetzte Haus (`_spawnSettlementSlot`): am Anker + seinem Slot, auf dem Boden des Plans (K10), mit seinen
            // Wandlaternen (K66-2: `plan` + `si`)
            for (const haus of this._dorfZugSchritt(q)) {
                if (haus) {
                    placed++;
                    haeuser.push(haus);
                    mx += haus.position.x;
                    mz += haus.position.z;
                } else skipped++;
            }
            if (q.idx >= plan.slots.length) {
                this._dorfRateMessen(q);
                break;
            }
            // DER AKT ENDET (los-huelle): steht der Spieler im Grund JEDES offenen Slots, hebt der Akt sie nicht und wartet nicht —
            // bis hier wartete sein Zug, bis der Spieler ginge, und ein Spieler, der stand, hielt das Versprechen des Akts ewig offen
            // (gate:haus-welt W7, der zweite Akt am Anker des ersten: 900 s, an main dabd69bb wie am Kopf, sobald der Spieler in einem
            // Los des zweiten Plans stand). Die Slots fallen BEIM NAMEN in die Rückgabe (`abgelehnt`), der Rufer liest sie; der
            // Takt-Zug einer Zelle (`_tickAutoSettlement`) wartet weiter, bis der Spieler geht — er ist kein Versprechen.
            if (q.spielerSperrt) {
                for (; q.idx < plan.slots.length; q.idx++) {
                    const sl = plan.slots[q.reihe[q.idx]];
                    abgelehnt.push(
                        `${sl.kultur || "?"}@${Math.round(origin.x + sl.x)}/${Math.round(origin.z + sl.z)}: der Spieler steht im Grund`
                    );
                    skipped++;
                }
                this.log(
                    `SIEDLUNG: ${abgelehnt.length} Lose am Anker ${Math.round(origin.x)}/${Math.round(origin.z)} abgelehnt — der Spieler steht in ihrem Grund (${abgelehnt.slice(0, 3).join(" · ")})`,
                    "WARN"
                );
                break;
            }
            await new Promise((weiter) => requestAnimationFrame(weiter)); // der nächste Schritt nach dem Bild, das ihn zeigt
            if (this.state !== welt) break;
        }
        // die Mitte der gesetzten Häuser — dorthin schaut, wer das Dorf verlangt hat (`_nachDorfOrientieren`)
        const mitte = placed ? { x: mx / placed, z: mz / placed } : null;
        return {
            placed,
            skipped,
            gefallen: (q.plan.gefallen || []).slice(),
            name: plan.name || null,
            groesse: plan.groesse || null,
            mitte,
            haeuser,
            abgelehnt,
        };
    }

    // DIE POSE DES ORTS (w27-ort-pose): wo ein Auge die Siedlung `S` (`_bewohnerSiedlungen`) sieht — auf ihrem Platz, wo die
    // Menge steht und keine Wand nah ist, der Blick die lange Achse des Platzes entlang auf den nächsten Bau des Plans (erst
    // 20° neben der Achse, dann 45°, dann rundum; die Mitte des Baus ab 12 m), zu dem die Sichtlinie frei ist: kein anderer
    // Grundriss (`obb`), Baum, Stand oder Brunnen quer in ihr, keine Spur eines Wagens (w27-ort-pose-voll: erst der Stand aus
    // der Spur, dann der Kegel). Aus dem Plan, den die Welt trägt — nie eine Zahl in der Spec (die
    // Spec nennt die Regel, `ortPose`; bis hier stand die Probe an Koordinaten: das Dorf bestand die Abnahme ohne ein Haus im Bild).
    // { x, z, gier, ziel: {x, z} } — ohne Siedlung, ohne Platz, ohne freien Bau bricht sie beim Namen (die Probe stünde
    // sonst an einem Ort, den keiner gerechnet hat).
    _ortPose(nahe, regel = "platz") {
        // die Siedlung ist die nächste binnen 200 m: die gegründete an ihrem Anker (die Ort-Wahl rückt ihn um Bruchteile
        // eines mm), das Dorf des Zugs vor seinem Zell-Ort (`_siedlungsAnker`)
        let [S, dMin] = [null, 200];
        for (const q of (this._bewohnerSiedlungen || new Map()).values()) {
            const d = Math.hypot(q.ox - nahe[0], q.oz - nahe[1]);
            if (d < dMin) [S, dMin] = [q, d];
        }
        const p = S && S.plan;
        const pz = p && p.platz;
        if (!pz || !Number.isFinite(pz.cx))
            throw new Error(
                `_ortPose: ${S ? "die Siedlung trägt keinen Platz im Plan" : "keine Siedlung binnen 200 m"} um ${nahe.join(" ")}`
            );
        // DIE SPUR MUSS STEHEN (w27-ort-pose-voll): die Spur der Wagen trägt erst der Verkehr der Siedlung (`_verkehrAnlegen`, er
        // entsteht mit ihrer Liste, wenn der Spieler naht, `_bewohnerWerkTakt`) — vor ihm nennt `_verkehrAufSpur` jeden Punkt
        // frei, und der Stand war still die Mitte des Platzes (an der vollen Stadt in der Spur; die Werkbank fragte vom Anlauf
        // und bekam ihn, erst ihr zweiter Gang sah die Spur). Eine städtische Siedlung ohne ihn bricht beim Namen: wer die Pose
        // will, wartet, bis die Stadt steht. Ein Dorf fährt keinen Verkehr und rechnet wie bisher
        // DER BRUCH, DER VERGEHT, TRÄGT DIE MARKE `warten` (w28-stadt-grammatik): das Gesetz selbst sagt, welcher Bruch der Pose mit
        // dem Takt der Welt endet (der Verkehr entsteht, ein Wagen fährt an einen Stand) — der Frager wartet genau auf sie
        // (Werkbank `umstellen`), jeder Bruch ohne Marke gilt sofort. Bis hier las der Frager den Wortlaut der Meldung
        if (p.staedtisch && !S.verkehr)
            throw Object.assign(
                new Error(
                    `_ortPose: der Verkehr der Siedlung steht noch nicht (um ${nahe.join(" ")}): die Spur der Wagen ist ungerechnet`
                ),
                { warten: true }
            );
        const [c, s] = [Math.cos(pz.phi || 0), Math.sin(pz.phi || 0)];
        const u = pz.ex >= pz.ez ? [c, -s] : [s, c];
        // ERST DER STAND (w27-ort-pose-voll): der Punkt der langen Achse, der der Mitte des Platzes am nächsten liegt (je 0,25 m,
        // erst diesseits, dann jenseits) und nicht in der Spur eines Wagens — das EINE Gesetz der Straße (`_verkehrAufSpur`, mit
        // dem Raum, den ein stehender Bewohner hält). An der vollen Stadt lag die Mitte in ihr: der Spieler hielt die Wagen an,
        // eine Limousine stand 3,5 m vor dem Auge („Vordergrund 28.5 % näher als 8 m: fahrzeug_limousine 18.6 %"). Liegt die
        // Mitte frei (dorf, stadt), ist sie der Stand; liegt die ganze Achse in der Spur, bricht der Stand beim Namen
        // WO DIE MENGE STEHT (w28-stadt-grammatik): die Suche beginnt am Punkt der Achse neben der dichtesten Stelle des Markts
        // — dieselbe Liste, aus der der Wirt die Stände der Menge würfelt (fachwerk `platzAnziehung`, `_bewohnerListe`
        // marktStand); ohne Stand im Plan an der Mitte wie bisher. Bis hier stand das Auge an der Mitte des Platzes, die Menge
        // gleichverteilt über sein Rechteck: an stadt-voll der Nächste 9 m fern („kein bewohner im Bild", GPU-Probe 04e55908)
        const FK = globalThis.__fachwerkCore;
        if (!FK || typeof FK.platzAnziehung !== "function")
            return AnazhRealm._kernPflichtBruch("fachwerk:platzAnziehung");
        const dicht = FK.platzAnziehung(p).dichte;
        const a0 = dicht ? (dicht.x - pz.cx) * u[0] + (dicht.z - pz.cz) * u[1] : 0;
        let M = null;
        for (let i = 0; !M && i <= 8 * Math.max(pz.ex, pz.ez); i++) {
            const a = a0 + ((i + 1) >> 1) * (i & 1 ? 0.25 : -0.25);
            const q = { x: S.ox + pz.cx + u[0] * a, z: S.oz + pz.cz + u[1] * a };
            if (!this._verkehrAufSpur(S, q.x, q.z)) M = q;
        }
        if (!M)
            throw new Error(
                `_ortPose: die lange Achse des Platzes ${(S.ox + pz.cx).toFixed(1)} ${(S.oz + pz.cz).toFixed(1)} liegt ganz in der Spur eines Wagens`
            );
        // die Bauten des Plans nach ihrem Abstand vom Stand: der erste, zu dem die Sichtlinie frei ist, ist der nächste
        const bau = (p.slots || [])
            .filter((q) => q && q.obb)
            .map((q) => ({ x: S.ox + q.obb.cx, z: S.oz + q.obb.cz, r: Math.min(q.obb.ex, q.obb.ez), obb: q.obb }))
            .map((b) => Object.assign(b, { d: Math.hypot(b.x - M.x, b.z - M.z) }))
            .sort((a, b) => a.d - b.d);
        // DIE REGEL „trasse" (w28-verkehr-bild, Leiter mensch.netz.verkehr: der Verkehr im Bild): je Wagen in Fahrt der Punkt seiner Route
        // `trasseM` voraus; der dem Auge (dem Spieler, sonst dem Stand) nächste trägt den Stand — der erste Punkt quer zur Route
        // außer jeder Spur, `trasseRandM` vor jedem Grundriss (näher füllte die Fassade den Vordergrund: 24–36 % näher als 8 m) und 1,5 m neben jedem Baum, Stand, Brunnen und jeder Laterne des
        // Plans —, der Blick zurück auf den Wagen, `trasseNick` gehoben (das Ziel liegt über den Dächern, die ihm entgegenfahren:
        // GPU-Probe 28fe4dcf „Blickziel verdeckt von fahrzeug_limousine in 21,11 m"): er fährt dem Auge entgegen, sein Fahrer am
        // Steuer. Die Kegel sahen nie über
        // eine Fahrbahn: „kein fahrzeug im Bild" 3/3
        const voraus = (w) => {
            const [F, s] = [w.F, w.F.s + AnazhRealm.VERKEHR.trasseM];
            let i = Math.min(F.i, F.pts.length - 2);
            while (i + 2 < F.pts.length && F.bogen[i + 1] < s) i++;
            const [a, b] = [F.pts[i], F.pts[i + 1]];
            const t = Math.max(0, Math.min(1, (s - F.bogen[i]) / (F.bogen[i + 1] - F.bogen[i] || 1)));
            return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, dx: b.x - a.x, dz: b.z - a.z };
        };
        const [A, V] = [(this.state.playerMesh || { position: M }).position, AnazhRealm.VERKEHR];
        const kandidaten = regel !== "trasse" || !S.verkehr ? [] : S.verkehr.wagen.filter((w) => w.zustand === "faehrt" && w.F && w.entry && w.F.pts.length > 1).map((w) => [w, voraus(w)]).sort(([, a], [, b]) => Math.hypot(a.x - A.x, a.z - A.z) - Math.hypot(b.x - A.x, b.z - A.z)); // prettier-ignore
        const imBau = (q, r) => bau.some(({ x, z, obb: o }) => { const [c, s, dx, dz] = [Math.cos(o.phi || 0), Math.sin(o.phi || 0), q.x - x, q.z - z]; return Math.abs(dx * c - dz * s) < o.ex + r && Math.abs(dx * s + dz * c) < o.ez + r; }); // prettier-ignore
        // DER STAND AUSSER DEM MARKT (w28-stadt-grammatik): der Platz samt dem Rand, an dem die Menge steht (`BEWOHNER.platzRandM`,
        // `_bewohnerListe` platzStand), trägt keinen Stand, und die Sichtlinie zum Wagen quert ihn nicht — der Messort verspricht
        // „am Weg neben der Trasse“, und bis hier stand das Auge der Stadt am Markt im Gedränge (bild:stadt@0.5 GTX 1060: Leib
        // ≤ 8 m 2,3–3,6 % des Bilds, main 0,0 %). Die Pose wartet auf ihren Stand (`warten`): das Gesetz darf wählen
        const amMarkt = (q) => {
            const [dx, dz, rand] = [q.x - S.ox - pz.cx, q.z - S.oz - pz.cz, AnazhRealm.BEWOHNER.platzRandM];
            return Math.abs(dx * c - dz * s) < pz.ex + rand && Math.abs(dx * s + dz * c) < pz.ez + rand;
        };
        const steht = (q) =>
            [...(p.trees || []), ...(p.staende || []), ...(p.brunnen || []), ...(p.laternen || [])].some(
                (t) => Math.hypot(S.ox + t.x - q.x, S.oz + t.z - q.z) < 1.5
            ) ||
            imBau(q, V.trasseRandM) ||
            amMarkt(q) ||
            this._blockerUmPlatz(q.x, q.z, 5, []).some((b) => this._istNatur(b)); // prettier-ignore — der wilde Baum (Laub baum_eiche 19,8 % näher als 2 m)
        // die Sichtlinie zum Wagen quert keinen Grundriss (je 5 % ihrer Länge): die Route bog hinter ein Haus (Werkbank stadt: „Blickziel
        // verdeckt von bauSatz in 5,89 m")
        const frei = (q, e) => [...Array(19)].every((_, i) => { const m = { x: q.x + ((e.x - q.x) * (i + 1)) / 20, z: q.z + ((e.z - q.z) * (i + 1)) / 20 }; return !imBau(m, 0) && !amMarkt(m); }); // prettier-ignore
        // und in der Stadt: ein Grundriss binnen 25 m des Wagens (am Rand fuhr er auf dem Feldweg in den Wald — GPU-Probe 668486db
        // „kein bauSatz im Bild")
        const inStadt = (e) => bau.some((b) => Math.hypot(b.x - e.x, b.z - e.z) < 25);
        // ER FÄHRT DEM AUGE ENTGEGEN (w28-stadt-grammatik): die Route vom Wagen bis zum Punkt voraus ist gerade — ihre Sehne misst
        // mindestens 0,9 der Bogenlänge `trasseM`. In der Schleife einer Wende und in der Kurve liegt der Punkt voraus quer zum
        // Wagen, und er zog bis zum Bild aus dem Blick (bild:stadt@0.5 am Stand 55c820a6: der Stand am Torplatz, das Ziel 12,9 m
        // statt 30 m fern, der Wagen am linken Bildrand angeschnitten). Auf der Geraden bleibt er bis zum Auge in der Bildmitte
        const gerade = (e, a) => Math.hypot(a.x - e.x, a.z - e.z) >= 0.9 * V.trasseM;
        for (const [W, a] of kandidaten.filter(([w, a]) => inStadt(w.entry.position) && gerade(w.entry.position, a)))
            for (let o = 2; o <= 12; o += 0.25) {
                const [e, l] = [W.entry.position, Math.hypot(a.dx, a.dz) || 1];
                for (const q of [1, -1].map((v) => ({ x: a.x + (a.dz / l) * o * v, z: a.z - (a.dx / l) * o * v })))
                    if (!this._verkehrAufSpur(S, q.x, q.z) && !steht(q) && frei(q, e))
                        return { x: q.x, z: q.z, gier: this._blickGierZu(e.x - q.x, e.z - q.z), nick: V.trasseNick, ziel: { x: e.x, z: e.z }, wagen: W.nr }; // prettier-ignore
            }
        if (regel === "trasse")
            throw Object.assign(
                new Error(
                    `_ortPose: kein Stand an der Trasse (${kandidaten.length} Wagen in Fahrt von ${S.verkehr ? S.verkehr.wagen.length : 0})`
                ),
                { warten: true }
            ); // der nächste Takt fährt die Wagen weiter
        // DIE REGEL „zeichen" (ort-ausstattung, Leitern mensch.kultur.schrift · bildkunst: der Ort weist sich aus): der Sonderbau
        // nächst dem Stand, dessen Tür-Wand im Plan ein Schild trägt (`gegenstaende` art schild mit `slot`, sein Hauszeichen, wo
        // die Rolle eines hat) — das Auge steht je `ZEICHEN_POSE.abstandM` vor der Mitte der Stücke auf der Normalen ihrer Wand
        // (von der Mitte des Grundrisses durch die Stücke), außer jeder Spur, jedem Grundriss, Baum, Stand, Brunnen, jeder Laterne
        // und dem Markt (`steht`), die Sichtlinie quert keinen fremden Grundriss; der Blick auf die Stücke. Aus dem Plan, nie eine
        // Zahl der Spec; ohne freies Schild bricht sie beim Namen
        if (regel === "zeichen") {
            const G = p.gegenstaende || [];
            const tafeln = G.filter((q) => q && q.art === "schild" && Number.isInteger(q.slot) && p.slots[q.slot]?.obb)
                .map((q) => {
                    const z = G.find((w) => w && w.art === "relief" && w.slot === q.slot);
                    const m = z ? { x: (q.x + z.x) / 2, z: (q.z + z.z) / 2 } : { x: q.x, z: q.z };
                    return { slot: q.slot, x: S.ox + m.x, z: S.oz + m.z, o: p.slots[q.slot].obb, zeichen: !!z };
                })
                .sort(
                    (a, b) =>
                        b.zeichen - a.zeichen || Math.hypot(a.x - M.x, a.z - M.z) - Math.hypot(b.x - M.x, b.z - M.z)
                );
            const inObb = (m, { x, z, obb: o }) => { const [c, s, dx, dz] = [Math.cos(o.phi || 0), Math.sin(o.phi || 0), m.x - x, m.z - z]; return Math.abs(dx * c - dz * s) < o.ex && Math.abs(dx * s + dz * c) < o.ez; }; // prettier-ignore
            const quert = (q, e, eigen) => [...Array(19)].some((_, i) => { const t = (i + 1) / 20, m = { x: q.x + (e.x - q.x) * t, z: q.z + (e.z - q.z) * t }; return bau.some((b) => b.obb !== eigen && inObb(m, b)); }); // prettier-ignore
            for (const T of tafeln) {
                const [nx, nz] = [T.x - S.ox - T.o.cx, T.z - S.oz - T.o.cz];
                const l = Math.hypot(nx, nz) || 1;
                for (const a of AnazhRealm.ZEICHEN_POSE.abstandM) {
                    const q = { x: T.x + (nx / l) * a, z: T.z + (nz / l) * a };
                    if (this._verkehrAufSpur(S, q.x, q.z) || steht(q) || quert(q, T, T.o)) continue;
                    return {
                        x: q.x,
                        z: q.z,
                        gier: this._blickGierZu(T.x - q.x, T.z - q.z),
                        ziel: { x: T.x, z: T.z },
                        slot: T.slot,
                    };
                }
            }
            throw new Error(
                `_ortPose: kein Schild mit freiem Stand vor seiner Wand (${tafeln.length} Schilde der Siedlung ${S.key || "?"})`
            );
        }
        // die Bäume, Stände und Brunnen des Plans (ein Marktstand 8 m vor dem Auge verdeckte das Gasthaus der Stadt) und DER
        // BESTAND DER WELT um den Platz, soweit er Natur ist (`_istNatur`): der wilde Wurf steht in keinem Plan. Er ist erst
        // gebaut, wenn der Spieler am Platz steht: die Probe fragt den Blick dort ein zweites Mal. Die Hindernisse sind Kreise
        // im Grundriss (2,5 m) — was niedrig vor dem Fuß des Ziels steht, sieht erst die Abnahme
        const stuecke = [...(p.trees || []), ...(p.staende || []), ...(p.brunnen || [])];
        const wild = this._blockerUmPlatz(M.x, M.z, 80, []).filter((e) => this._istNatur(e));
        const hinder = stuecke
            .map((t) => ({ x: S.ox + t.x, z: S.oz + t.z, r: 2.5 }))
            .concat(wild.map((e) => ({ x: e.position.x, z: e.position.z, r: 2.5 })));
        // DIE SICHTLINIE IST EIN STRAHL IM RAUM (w28-stadt-grammatik): das Auge steht `EGO_AUGE_M` über dem Boden des Stands
        // und blickt waagrecht (die Pose trägt keine Neigung) auf die Fassade. Ihn verstellt JEDER Grundriss, den er quert — als
        // Rechteck, wie er steht (bis hier ein Kreis mit der kleineren Halbachse: die lange Wand eines Nachbarn ragte in den
        // Strahl, „Blickziel verdeckt von bauSatz in 24.17 m“, gpu-probe b61450be), und DAS GELÄNDE, das ihn überragt: die
        // Höhe der Welt (`getTerrainHeightAt`, der Gelände-Kern samt Erdbau) längs des Strahls bleibt `SICHT_GELAENDE_M` unter
        // ihm — bis zur Fassade, deren Fuß sonst über dem Auge läge
        const augeY = this.getTerrainHeightAt(M.x, M.z) + AnazhRealm.EGO_AUGE_M;
        const querBau = (b, dx, dz) =>
            bau.some((h) => {
                if (h === b) return false;
                // der Strahl M + t·(dx, dz), t ∈ (0, 1), im Rahmen des Rechtecks: Platten-Schnitt je Achse
                const [c, s] = [Math.cos(h.obb.phi || 0), Math.sin(h.obb.phi || 0)];
                const [u0, v0] = [(M.x - h.x) * c - (M.z - h.z) * s, (M.x - h.x) * s + (M.z - h.z) * c];
                const [du, dv] = [dx * c - dz * s, dx * s + dz * c];
                let [t0, t1] = [0, 1];
                for (const [p0, dp, e] of [
                    [u0, du, h.obb.ex],
                    [v0, dv, h.obb.ez],
                ]) {
                    if (Math.abs(dp) < 1e-9) {
                        if (Math.abs(p0) >= e) return false;
                        continue;
                    }
                    const [a, z] = [(-e - p0) / dp, (e - p0) / dp];
                    [t0, t1] = [Math.max(t0, Math.min(a, z)), Math.min(t1, Math.max(a, z))];
                }
                return t0 < t1;
            });
        const querGelaende = (d, dx, dz) => {
            for (let w = AnazhRealm.SICHT_SCHRITT_M; w <= d; w += AnazhRealm.SICHT_SCHRITT_M)
                if (
                    this.getTerrainHeightAt(M.x + (dx * w) / d, M.z + (dz * w) / d) >
                    augeY - AnazhRealm.SICHT_GELAENDE_M
                )
                    return true;
            return false;
        };
        let best = null;
        const fiel = { stueck: 0, bau: 0, gelaende: 0, spur: 0 };
        // der Kegel um die Achse weitet sich, bis ein Bau frei steht (20° · 45° · rundum): am Dorf der Zelle −4,−4 liegt
        // binnen 20° nur das Gasthaus, und seine Sichtlinie ist verstellt. DANN DER KEGEL (w27-ort-pose-voll): zuerst nur
        // Sichtlinien, die keine Spur kreuzen (`_verkehrFahrbahnM` ohne Rand, je halben Meter) — ein Wagen in ihr steht vor dem
        // Ziel; an der vollen Stadt hält vom Stand auf der Achse nur das Wohnhaus Süd beides frei. Kreuzt jede eine Spur (die
        // Stadt: ihr Platz liegt zwischen den Gassen, „kein Bau mit freier Sichtlinie" bei 91 Bauten), gilt der Kegel ohne sie
        for (const [kegel, spurfrei] of [0.94, 0.7, 0, 0.94, 0.7, 0].map((k, i) => [k, i < 3])) {
            for (const b of bau) {
                if (best) break;
                const [dx, dz] = [b.x - M.x, b.z - M.z];
                const d = b.d;
                if (d < 12 || Math.abs(dx * u[0] + dz * u[1]) < kegel * d) continue;
                const quer = (h) => {
                    const t = ((h.x - M.x) * dx + (h.z - M.z) * dz) / (d * d);
                    return t > 0 && t < 1 && Math.hypot(M.x + dx * t - h.x, M.z + dz * t - h.z) < h.r;
                };
                if (hinder.some(quer) && ++fiel.stueck) continue;
                // DAS ZIEL IST DIE FASSADE: der Punkt, an dem die Sichtlinie in den Grundriss tritt — die Mitte liegt hinter
                // der Wand, und die Abnahme nennt sie verdeckt (Mutant „Ziel = Mitte" auf pascal: dorf „verdeckt von bauSatz in
                // 5.82 m", stadt „verdeckt von an Punkt 1 Gelände in 20.37 m")
                const [bc, bs] = [Math.cos(b.obb.phi || 0), Math.sin(b.obb.phi || 0)];
                const k = Math.min(b.obb.ex / Math.abs(dx * bc - dz * bs), b.obb.ez / Math.abs(dx * bs + dz * bc));
                const ziel = { x: b.x - dx * k, z: b.z - dz * k };
                const [zx, zz, zd] = [ziel.x - M.x, ziel.z - M.z, d * (1 - k)];
                if (querBau(b, zx, zz) && ++fiel.bau) continue;
                if (querGelaende(zd, zx, zz) && ++fiel.gelaende) continue;
                if (spurfrei && this._verkehrFahrbahnM(S, M, [ziel], 0) && ++fiel.spur) continue;
                best = { d, ziel };
            }
        }
        // KEIN KANDIDAT IST EIN BRUCH BEIM NAMEN: welcher Ort, wie viele Bauten, woran jeder Gang fiel (über alle sechs Kegel)
        if (!best)
            throw new Error(
                `_ortPose: kein Bau mit freier Sichtlinie vom Stand ${M.x.toFixed(1)} ${M.z.toFixed(1)} der Siedlung ${S.key || "?"} ` +
                    `(${bau.length} Bauten, ${hinder.length} Stücke und Natur; gefallen an Stück ${fiel.stueck} · Bau ${fiel.bau} · ` +
                    `Gelände ${fiel.gelaende} · Spur ${fiel.spur})`
            );
        return { x: M.x, z: M.z, gier: this._blickGierZu(best.ziel.x - M.x, best.ziel.z - M.z), ziel: best.ziel };
    }

    // DAS DORF VOR DIR (Leben-Schau 07.10.: „dorf 7 18" umringte den Spieler — die Mitte 16 m bei cos +0,56, die drei
    // nächsten Häuser HINTER ihm, cos −1,00 / −0,48 / −0,12): der Anker kam aus der Klemme `_structureSpawnPos` mit dem
    // geschätzten Fußabdruck „haus_basis × 3", der Plan des Studios reichte weiter. Jetzt misst der Akt den Plan selbst
    // (Slot-Orte + obb-Reichweite) und legt ihn in den BLICKKEGEL: die Achse ist die EINE Vorwärts-Richtung (`_blickVorn`;
    // mit verlangtem Ort die Richtung zu ihm), die Mitte der Häuser liegt auf ihr, und der Plan rückt genau so weit vor, dass
    // jedes Haus mit seiner Reichweite `STRUCTURE_PLAYER_CLEAR_MARGIN` vor dem Spieler und im Bildwinkel der Welt-Kamera
    // steht — so nah wie möglich, nie um ihn. Ein verlangter Ort, dessen Häuser den Spieler nicht
    // berühren, bleibt, wie er ist. Gibt den Plan-Ursprung (der Bezug der Slot-Orte), die Mitte und den Radius zurück.
    // `blick` {gier, tanH} (das Programm eines Sprechers, „baue dorf hier"): der Sprecher steht am verlangten Ort und blickt
    // mit SEINER Gier durch SEINEN Bildwinkel — der Anker hängt dann an keinem Zustand des ausführenden Peers (Spieler,
    // Blick, Fenster), jeder baut dasselbe Dorf an derselben Stelle (Gegenprüfung Runde 1: ~60 m Versatz).
    _siedlungsAnker(plan, wunsch, blick) {
        const pm = this.state.playerMesh;
        const haeuser = [];
        let cx = 0;
        let cz = 0;
        for (const s of plan.slots || []) {
            if (!s || !Number.isFinite(s.x) || !Number.isFinite(s.z)) continue;
            const o = s.obb;
            haeuser.push([s.x, s.z, o && Number.isFinite(o.ex) && Number.isFinite(o.ez) ? Math.hypot(o.ex, o.ez) : 6]);
            cx += s.x;
            cz += s.z;
        }
        if (haeuser.length) {
            cx /= haeuser.length;
            cz /= haeuser.length;
        }
        let R = 0;
        for (const [x, z, reich] of haeuser) R = Math.max(R, Math.hypot(x - cx, z - cz) + reich);
        const ergebnis = (x, z, y) => {
            const h = this.getTerrainHeightAt(x, z);
            return { x, y: Number.isFinite(h) ? h : y, z, radius: R, mitte: { x: x + cx, z: z + cz } };
        };
        const sprecher = blick && wunsch && Number.isFinite(blick.gier);
        if (!pm && !sprecher) return ergebnis(wunsch.x, wunsch.z, wunsch.y);
        // der Blickende: der Sprecher am verlangten Ort (sein Programm trägt den Blick) oder der eigene Spieler
        const p = sprecher ? wunsch : pm.position;
        const M = AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN;
        let vx;
        let vz;
        if (wunsch && !sprecher) {
            const dx = wunsch.x + cx - p.x;
            const dz = wunsch.z + cz - p.z;
            const d = Math.hypot(dx, dz);
            if (d >= R + M) return ergebnis(wunsch.x, wunsch.z, wunsch.y); // der Ort berührt den Spieler nicht
            if (d > 1e-3) {
                vx = dx / d;
                vz = dz / d;
            }
        }
        if (vx === undefined) {
            const vorn = this._blickVorn(sprecher ? blick.gier : this.state.yaw, 0);
            const l = Math.hypot(vorn.x, vorn.z) || 1;
            vx = vorn.x / l;
            vz = vorn.z / l;
        }
        // Der Bildwinkel (horizontal, aus fov und Seitenverhältnis) — der des Sprechers, sonst der Welt-Kamera; vom
        // Blickenden aus gemessen (die 3rd-Kamera steht hinter ihm und sieht weiter).
        const cam = this.state.camera;
        const fov = cam && Number.isFinite(cam.fov) ? cam.fov : 75;
        const asp = cam && Number.isFinite(cam.aspect) && cam.aspect > 0 ? cam.aspect : 16 / 9;
        const tanH = sprecher && blick.tanH > 0 ? blick.tanH : Math.tan((fov * Math.PI) / 360) * asp;
        // je Haus: vorn f (längs der Achse) und quer q (um die Mitte); die Mitte rückt um t vor, bis f + t − Reichweite
        // ≥ max(M, |q| / tanH) für jedes Haus gilt.
        let t = 0;
        for (const [x, z, reich] of haeuser) {
            const f = (x - cx) * vx + (z - cz) * vz;
            const q = (x - cx) * vz - (z - cz) * vx;
            t = Math.max(t, Math.max(M, Math.abs(q) / tanH) - f + reich);
        }
        return ergebnis(p.x + vx * t - cx, p.z + vz * t - cz, p.y);
    }
    // spawnSettlement (unten) — der Siedlungs-Akt (Chat „dorf [seed] [n]", DSL `spawn_village` je Quelle, Gate): Samen
    // Γ5-treu aus dem Welt-Seed-Stream (Suffix ":stadt", nie Math.random), Export vom Worker, Platzierung
    // am ANKER, den der Plan selbst misst (`_siedlungsAnker`): vor dem Spieler, nie um ihn. Async — der Rückweg
    // meldet ins Chat-Log.

    // WER VERLANGT? Die DSL-Quelle eines Akts (`ctx.source`): der Spieler selbst — „human" (sein Chat, der Befehl „dorf"),
    // seine Werkzeuge (`AnazhRealm.SPIELER_QUELLEN`: die Fähigkeit per Taste „ability:<name>", das Wirken „capability:<key>",
    // der Verzehr „consume:<bauplan>") — und der Begleiter, der seinen Satz ausführt („llm:<name>"); Nexus, Welt-Regeln,
    // Resonanz und Mitspieler („remote-…") handeln für die Welt, nicht für ihn.
    _spielerVerlangt(quelle) {
        if (quelle === "human") return true;
        if (typeof quelle !== "string") return false;
        for (const vor of AnazhRealm.SPIELER_QUELLEN) if (quelle.startsWith(vor)) return true;
        return false;
    }

    // Nach einem Dorf-Spawn: hat der SPIELER das Dorf verlangt (`verlangt`, die Quelle des Akts), schaut er auf die Mitte
    // DIESES Dorfs (`res.mitte`, die gesetzten Häuser; ohne sie der Anker) — ein Nexus- oder Welt-Dorf lässt seinen Blick
    // stehen (OMEN 0710-6, Boot 4B: ein Nexus-Dorf drehte die Gier mitten im Lauf auf −2,745; und der Blick zielte auf den
    // Schwerpunkt ALLER Häuser der Welt, gate:settlement C7). Dazu die Bauten-Zeile und das nächste Haus sofort gemesht.
    _nachDorfOrientieren(res, verlangt) {
        try {
            const list = (this.state && this.state.architectures) || [];
            // die Häuser DIESES Dorfs: die eben gesetzten (`res.haeuser`, ihre Mitte `res.mitte`) — nie die Mitte aller Häuser
            // der Welt (ein Auto-Dorf 300 m weiter drehte den Blick vom neuen Dorf weg), nie ein Kreis um den Anker (er fing die
            // Häuser eines Nachbar-Dorfs mit); ohne gesetztes Haus kein Blick
            const houses = (res && res.haeuser) || [];
            const pm = this.state && this.state.playerMesh;
            const ziel = res && res.mitte;
            if (pm && ziel && this._spielerVerlangt(verlangt)) {
                const dx = ziel.x - pm.position.x;
                const dz = ziel.z - pm.position.z;
                if (Math.hypot(dx, dz) > 0.5) {
                    // der Blick zum Dorf (die Umkehrung der EINEN Vorwärts-Richtung)
                    this.state.yaw = this._blickGierZu(dx, dz);
                }
            }
            const nHaus = houses.length;
            let nZiegel = 0;
            let nearest = null;
            for (const e of houses) {
                if (e._ziegelSlot) nZiegel++;
                if (!pm) continue;
                const d = Math.hypot(e.position.x - pm.position.x, e.position.z - pm.position.z);
                if (!nearest || d < nearest.d) nearest = { d, e };
            }
            const zeile = nearest
                ? `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} nah=${nearest.e.type} @${Math.round(nearest.e.position.x)}/${Math.round(nearest.e.position.y)}/${Math.round(nearest.e.position.z)} d=${Math.round(nearest.d)}m`
                : `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} placed=${res && res.placed}`;
            // Die Zählung ist Entwickler-Telemetrie: sie geht ins Log, nie in den Spieler-Chat (Befund V-D8: „Bauten
            // n=330 haus=21 ziegel=10 nah=… d=10m" nach jeder Dorf-Gründung).
            this.log(zeile, "INFO");
            // Hand-Dichte: nächstes haus_ sofort meshen (nicht auf Cull-Budget warten)
            if (nearest && nearest.e && typeof this._rebuildArchitectureMesh === "function") {
                try {
                    this._rebuildArchitectureMesh(nearest.e);
                    if (nearest.e.mesh) nearest.e.mesh.visible = true;
                    this._archZiegelFern?.(nearest.e);
                } catch (_r) {
                    this._stoffBruch("das Dorf-Haus (Neubau nach der Orientierung)", _r);
                }
            }
        } catch (_e) {
            this._stoffBruch("die Dorf-Orientierung", _e);
        }
    }

    // DAS DORF IM FLUG (stand-treue): ein Akt — Chat, Feld, Nexus — ist offen vom Auftrag bis zum letzten Haus (Export, Ort-Wahl
    // im Faden, Zug über die Bilder); `_weltOffen` zählt ihn (`_dorfOffen`). Vorher „stand" die Welt während der Ort-Wahl, und
    // die Häuser des Nexus kamen in die Runde der Stufen-Wahl (CI 39767254768: archLod 2288 → 2294 mit den Tätern).
    // Der Zähler gehört der Welt des Akts: ein Akt, dessen Welt ging (`_dorfAkt`), zählt in der nächsten nichts herunter.
    spawnSettlement(opts) {
        this._dorfImFlug = (this._dorfImFlug | 0) + 1;
        const welt = this.state;
        const ende = () => {
            if (this.state === welt) this._dorfImFlug--;
        };
        const akt = this._dorfAkt(opts);
        akt.then(ende, ende);
        return akt;
    }
    // Was das Dorf noch baut: die Akte im Flug, das Wachstum eines Orts (`_ortWaechst` im Flug, seine Züge in
    // `_ortWachsHaeuser`) und die Häuser des Zugs im Takt (und sein Gang, `_dorfErlebnis`) samt dem Export ihrer Zelle
    // (`_tickAutoSettlement`)
    // — der Zug nur, solange sein Takt lebt (`_dorfTaktLebt`, dasselbe Urteil wie der Term „dorf" des ersten Weltbilds): ein Ort
    // ohne Dorf-Zug hält ihn an, und ein Zug, den kein Takt baut, hielt die Welt ewig offen (CI 39780312347: „Dorf offen 18").
    _dorfOffen() {
        const lebt = this._dorfTaktLebt();
        const [q, H] = [lebt && this._autoSettlementQueue, lebt && this._ortWachsHaeuser];
        const zug =
            q && q.plan && Array.isArray(q.plan.slots) ? Math.max(0, q.plan.slots.length - q.idx) + !!q.gang : 0;
        return (
            (this._dorfImFlug | 0) +
            zug +
            (this._autoSettlementPendingKey ? 1 : 0) +
            (this._ortWachsFlug ? 1 : 0) +
            (H ? H.size : 0)
        );
    }
    // DIE WELT DES AKTS: ein Dorf gehört der Welt, in der es geworfen wurde. Der Welt-Wechsel tauscht den Zustand in der Seite
    // (`_weltAbschied`: `this.state` ist danach die Ziel-Welt) — ein Akt, der über ihn hinweg wartet (Buch, Export, Ort-Wahl,
    // der Zug über die Bilder), schrieb sein Gedächtnis (`settlementCells`) und seine Häuser in die NÄCHSTE Welt (gate:pruefbuehne
    // 04.11.: die Zelle eines Wildnis-Dorfs „d:…" lag auf der Bühne, Zensus dorfZellen 1). Nach jedem Warten fragt er seine Welt;
    // ging sie, fällt er mit ihr.
    _dorfWeltGing(welt, wo) {
        if (this.state === welt) return false;
        this.log(`SIEDLUNG: die Welt des Akts ging (${wo}) — das Dorf fällt mit ihr, nie in die nächste.`, "INFO");
        return true;
    }
    async _dorfAkt(opts) {
        const welt = this.state;
        const o = opts && typeof opts === "object" ? opts : {};
        let seed = Number.isFinite(o.seed) ? Number(o.seed) : NaN;
        if (!Number.isFinite(seed)) seed = this._bauSame("stadt");
        // ZENSUS-REST V18.488 — der Stamm defaultet nie: ohne o.nH führt der Kern-Default (fachwerk DORF: DP.nH, ohne Zahl die
        // Klasse der Epoche, sonst 18 — die EINE Wahrheit). DIE EINE KLEMME ist die des Kerns (DORF 4…500, siedlung.K2): bis K2
        // klemmte der Stamm hier zusätzlich bei 120, die Metropole des Rang-Gesetzes stand dem Satz nie offen.
        let nH = Number.isFinite(o.nH) ? Number(o.nH) : undefined;
        // Ein VERLANGTER Ort, den es nicht gibt, wird nie der Spieler-Ort (V-k5-Klasse): ohne `position` gründet der
        // Akt beim Spieler (Chat „dorf"), mit `position` nur dort — eine leere oder unendliche ist eine laute Absage.
        if ("position" in o && !(o.position && Number.isFinite(o.position.x) && Number.isFinite(o.position.z))) {
            this.log("Siedlung ohne Ort: der verlangte Ort fehlt — keine Gründung (nie still beim Spieler).", "ERROR");
            this._chatEcho?.(["chat.befehl.dorf.ort-fehlt"]);
            return null;
        }
        // FOUNDRY-WARM — Dorf braucht export-settlement. Kaltes Buch → LAUT blockieren
        // (kein WARN-Nichts). Autonome Worldgen-Zellen warten schon auf Channel-Live.
        // Die Größe aus dem Siedlungs-Gesetz (`nHAusGesetz`, der DSL-Akt `spawn_village`) wartet auf das Buch — auch der
        // autonome Akt (das Gesetz kommt im Buch, `_foundryIngestSiedlung`).
        if (!o.autonomous || o.nHAusGesetz) {
            const warm = await this._foundryAwaitBook(45000);
            if (this._dorfWeltGing(welt, "Buch")) return null;
            if (!warm.ok) {
                const msg = `FOUNDRY KALT: Siedlung/Dorf-Spawn BLOCKIERT (${warm.reason}; ready=${warm.ready} recipes=${warm.recipes}) — kein stilles Nichts.`;
                this.log(msg, "ERROR");
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
        }
        // DAS JAHR DES AKTS (siedlung.K4, „dorf 7 300 jahr 1560", `spawn_village` mit Jahr): es wählt die Epoche seiner
        // Zeitachse (fachwerk `epocheImJahr`) — der Ort steht am Ende ihrer Spanne, die Zahl ist die Größe seiner Gegenwart
        if (Number.isFinite(o.jahr)) o.epoche = AnazhRealm.Gesetz("fachwerk:epocheImJahr")(o.jahr);
        // eine verlangte Epoche ohne Zahl nimmt die Größe ihrer Klasse (fachwerk DORF, EPOCHEN.groesse), nie die des Dorfs
        if (o.nHAusGesetz && nH === undefined && !o.epoche) {
            const SG = AnazhRealm._siedlungGesetz();
            if (!SG) {
                this.log("SIEDLUNGS-GESETZ FEHLT im Buch: Dorf-Spawn BLOCKIERT (keine Größe ohne Gesetz).", "ERROR");
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
            nH = AnazhRealm.Gesetz("fachwerk:siedlungsGroesse")(SG, seed, 0);
        }
        // DIE STADT ÜBER DER WAND (w28-stadt-funktion · w28-stadt-netz): das Wort gründet die MITTE seiner Stadt — die Kachel (0, 0)
        // ihres Netzes (fachwerk `viertelWort`, `kachelNetz`: der Same des Worts, so viele Häuser, wie eine Kachel trägt) —, und
        // sein Gedächtnis trägt die Zahl der Stadt (`stadt`): aus ihr sind die Zellen um die Mitte ihre Kacheln (`_viertelInfo`),
        // sie erwachen beim Nahen wie jede Zelle der Welt, ihre Straßen treffen sich an den Kanten. Bis w28-stadt-funktion klemmte
        // der Kern die Zahl still an die Wand („dorf 7 1000" stand mit 490 Losen).
        const SF = AnazhRealm.Gesetz("fachwerk:STADT_FUNKTION");
        const stadt = SF && nH > SF.voll ? nH : undefined;
        const kachel = stadt ? { samen: seed, nH: stadt, i: 0, k: 0 } : undefined;
        if (stadt) nH = AnazhRealm.Gesetz("fachwerk:viertelWort")(seed, stadt, 0, 0, o.epoche).nH;
        const dp = { seed, nH, epoche: o.epoche, budget: o.budget, ...(kachel ? { kachel } : null) };
        return this._foundryRequestSettlement(dp).then(async (plan) => {
            if (this._dorfWeltGing(welt, "Export")) return null;
            if (!plan) {
                this.log(
                    "FOUNDRY KALT: Siedlung — export-settlement leer/aus — Spawn BLOCKIERT (kein stilles Nichts).",
                    "ERROR"
                );
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
            // der Ort aus dem Plan selbst: das Dorf liegt vor dem Spieler, nie um ihn (`_siedlungsAnker`)
            const anchor = this._siedlungsAnker(plan, o.position || null, o.blick || null);
            // EINE ZELLE, EIN SPRECHER (w28-stadt-netz): im Reich einer Stadt des Worts — ihrer Mitte oder einer ihrer Kacheln
            // (`_viertelInfo` mit dem Ort des Akts, die Summe beider `siedlungsReich`) — gründet kein Wort eines anderen. Bis hier
            // hielt die Stadt nur die Zellen des Rangs fern: die Welt gründete selbst ein Dorf mit `d:`-Schlüssel 371 m vom Anker
            // der Stadt, im Radius ihrer Häuser (Brandau, alpin 1081 in mediterran 1238, OMEN 15.11.).
            const SGa = AnazhRealm._siedlungGesetz();
            const imReich =
                SGa &&
                this._viertelInfo(Math.floor(anchor.x / SGa.cellM), Math.floor(anchor.z / SGa.cellM), {
                    x: anchor.x,
                    z: anchor.z,
                    nH: stadt || nH || plan.slots.length,
                }) === null;
            if (imReich) {
                this.log(
                    `SIEDLUNG: der Ort des Worts (Same ${seed}) liegt im Reich einer Stadt — eine Zelle, ein Sprecher: keine Gründung.`,
                    "INFO"
                );
                if (this._spielerVerlangt(o.verlangt)) this._chatEcho?.(["chat.befehl.dorf.kein-grund"]);
                return null;
            }
            // DER ORT AUF DEM GELÄNDE (K10): der Plan v2 am Anker — Höhen, Wege, Laternen und der Erdbau, den die Welt trägt;
            // die Ort-Wahl rechnet im Ort-Faden (`_ortWahl`, Lehre 14), der Akt wartet auf sie. Seine Gassen folgen dem Grund
            // am Ort, an dem er steht (`_ortMitTrasse`, siedlung.K3): der Plan ohne Raster nennt nur den Anker.
            // DER FREIE ORT IST DER DES SPRECHERS (gate:ankunft D9): trägt das Programm seinen Blick („baue dorf hier"), hält die
            // Wahl SEINEN Stand frei (`frei` der Ort-Wahl), nie den Spieler des ausführenden Peers — sonst wies der Sprecher-Peer
            // die Orte um sich ab, der Mitspieler nicht, und dasselbe Programm stand 29,83 m daneben.
            const frei = o.blick && o.position ? { x: o.position.x, z: o.position.z } : undefined;
            let b = await this._ortMitTrasse(dp, anchor, frei);
            // DER ANKER MISST DEN PLAN, DER STEHT (w28-stadt-grammatik): der Plan v2 legt seine Trasse um Wasser und Hang und trägt
            // andere Lose als der flache Plan, an dem der Anker maß — „dorf 7 18" am Genesis-Ort: 25 Lose flach, alle vorn; der Plan
            // v2 am selben Ursprung 28 Lose, sechs bis 28 m HINTER dem Spieler (gate:ankunft D9: 1 Haus hinten, 2 außer Bild). Wo
            // der Anker aus dem Blick kommt (kein verlangter Ort, oder der Blick eines Sprechers), misst er den Plan v2 nach und
            // fragt ihn am gemessenen Ursprung neu — höchstens zweimal: der Plan folgt dem Grund, auf dem er liegt
            for (let gang = 0; gang < 2 && b && b.plan && (!o.position || o.blick); gang++) {
                if (this._dorfWeltGing(welt, "Ort-Wahl")) return null;
                const a2 = this._siedlungsAnker(b.plan, o.position || null, o.blick || null);
                const [vx, vz] = [a2.x - b.ort.x, a2.z - b.ort.z];
                if (Math.hypot(vx, vz) < 1) break;
                Object.assign(anchor, a2);
                b = await this._ortMitTrasse(dp, anchor, frei);
            }
            if (this._dorfWeltGing(welt, "Ort-Wahl") || !b || !b.plan) return null;
            anchor.mitte &&= { x: anchor.mitte.x + b.ort.x - anchor.x, z: anchor.mitte.z + b.ort.z - anchor.z };
            Object.assign(anchor, { x: b.ort.x, z: b.ort.z });
            const ort = AnazhRealm._ortSchluessel(b.plan, anchor); // der Schlüssel seines Erdbaus (`_ortPlanSetzen`)
            plan = this._ortPlanSetzen(b.plan, anchor);
            const res = await this._spawnSettlementFromExport(plan, anchor, { autonomous: !!o.autonomous });
            if (this._dorfWeltGing(welt, "Zug")) return null;
            // DORF-ERLEBNIS — Wege/Platz/Brunnen + das Rebuild-Gedächtnis („d:<seed>"
            // im selben settlementCells-Pfad: die Wege-Streifen überleben den Reload).
            const wmD = this._weltMetaDa();
            if (!wmD.settlementCells || typeof wmD.settlementCells !== "object") wmD.settlementCells = {};
            // der Wege-Schlüssel trägt den ORT: zwei Siedlungen mit demselben Samen bauen je ihre Wege (vorher gewann die
            // erste, die Stadt `dorf 7 120` neben `dorf 7 18` stand ohne einen Weg — Leben-Prüfung S-W1)
            const dKey = "d:" + seed + "@" + Math.round(anchor.x) + "," + Math.round(anchor.z);
            // das Gedächtnis trägt den Akt, aus dem der Ort wiederkehrt (speicher.K3): Epoche, Budget, wer ihn rief, sein Erdbau,
            // der Ort seiner Trasse (wx/wz, siedlung.K3: die Wiederkehr fragt den Export dort, wo seine Gassen lagen)
            if (!wmD.settlementCells[dKey])
                wmD.settlementCells[dKey] = JSON.parse(
                    JSON.stringify({
                        seed,
                        nH,
                        stadt,
                        x: anchor.x,
                        z: anchor.z,
                        wx: b.ort.x,
                        wz: b.ort.z,
                        ort,
                        epoche: o.epoche,
                        budget: o.budget,
                        autonomous: o.autonomous || undefined,
                        wachs: this._ortWachsAnfang(plan),
                    })
                );
            if (stadt) this._stadtGegruendet(dKey);
            this._spawnSettlementErlebnis(plan, anchor, { key: dKey, autonomous: !!o.autonomous });
            // Zwei Kanäle (V-D8): das Log trägt Same, Größe und Slots; wer das Dorf verlangt hat (`_spielerVerlangt`,
            // die Quelle des Akts), hört den Satz der Welt und schaut auf SEIN Dorf — Nexus, Welt-Regeln und Mitspieler handeln
            // für die Welt: kein Satz an den Empfänger, kein Blick.
            this.log(
                `Siedlung „${res.name || "?"}" (${res.groesse || "?"}, Seed ${seed}): ${res.placed} Häuser platziert, ${res.skipped} Slots übersprungen${(res.gefallen || []).length ? ` (${res.gefallen.map((g) => `Los ${g.si} ${g.rolle} #${g.seed}: ${g.wand}`).join(" · ")})` : ""}; Mitte ${Math.round(anchor.radius || 0)} m Radius.`,
                "INFO"
            );
            if (this._spielerVerlangt(o.verlangt))
                this._chatEcho?.(
                    res.placed > 0
                        ? [
                              res.placed === 1 ? "chat.befehl.dorf.steht-eins" : "chat.befehl.dorf.steht",
                              {
                                  name: res.name || ["chat.befehl.dorf.name-leer"],
                                  n: res.placed,
                              },
                          ]
                        : ["chat.befehl.dorf.kein-grund"]
                );
            // Konsum: Blick (nur für den, der das Dorf verlangt hat) + Locator automatisch
            this._nachDorfOrientieren(res, o.verlangt);
            return res;
        });
    }
    // DER BAU-SAME (Γ5): zieht aus dem Welt-Seed-Stream (Suffix ":<art>", FNV-1a — das _worldRuleSeed-Muster); je Art zählt
    // ein Akt-Zähler hoch → jeder neue Bau derselben Welt ein ANDERER, aber deterministischer Same. Die Siedlung trägt die
    // Art "stadt". Leser: `spawnSettlement` (Chat `dorf`), jeder Chat-Satz mit Same (`baue … hier`, Fraktal, der
    // Studio-Hain — der Same reist im Programm), der Strom jedes Programms ohne eigenen Seed (`dslCtx`), der Standard-Same
    // der Wurzel `spawnArchitecture` (Bau einer Kreatur, Plattform, Portal), der Würfel der Werkstatt, die Komposition des
    // Nexus. Der Zähler ist Welt-Gedächtnis (`worldMeta.bauSame`, reist im
    // Snapshot und zum Gast): als Sitzungs-Feld begann er nach jedem Reload neu, und derselbe Satz am selben Ort stellte einen
    // deckungsgleichen zweiten Hain.
    // DER BLICK (`blick`): der Same, den der nächste Akt ziehen WIRD, ohne ihn zu ziehen — der Zähler bleibt. Ein Vorbau (der
    // Geist eines Hotbar-Bauplans, `_geistVorbau`) ist kein Akt: er zog bis z140 je Hotbar-Art den nächsten Samen in den Bau-Modus,
    // der Zähler im Welt-Gedächtnis lief im Stehen, und der nächste Wagen der Welt stand in einer anderen Gestalt (Lack Metall
    // 0,7 → 0, material.K4 „zu wenig Pixel" an Radeon und GTX).
    _bauSame(art, blick = false) {
        const wm = this._weltMetaDa();
        const z = wm.bauSame && typeof wm.bauSame === "object" ? wm.bauSame : (wm.bauSame = {});
        const n = (Number(z[art]) || 0) + 1;
        if (!blick) z[art] = n;
        // der EINE Text-Hash (Welle SAMEN: FNV-1a, samen-core `samenHash`)
        return globalThis.__samenCore.samenHash(`${AnazhRealm._saatVon(wm)}:${art}:${n}`) || 1;
    }
    // Der Strom EINES Samens (LCG, [0, 1)): was ein Akt würfelt — Streuung, Drehung, Größe — ist eine Funktion seines Samens,
    // auf jedem Peer und nach jedem Reload dieselbe. Das EINE LCG der Welt: Leser `_streamRng` (der Strom eines Namens),
    // `dslCtx` (der Programm-Strom), `_dslSpawnStudioItems` und die Nexus-Komposition.
    // Das LCG selbst steht im Samen-Baum (`__samenCore.samenStrom`): Seite und Faden lesen dieselbe Funktion.
    _samenStrom(same) {
        return globalThis.__samenCore.samenStrom(same);
    }
    // DER SAME EINES WERKS (Gegenprüfung 08.10.): EIN Same je Bauplan — der Wurf der Werkstatt (`_grownSeed` · `_rockSeedBase`
    // · `_crystalSeedBase`), sonst sein Name (ein Studio-Rezept ohne Bauplan: seine id) —, gehasht in die Gestalt-Wahl
    // (`_foundryVariantFor`). Leser: die Werkstatt-Vorschau (Bauplan und Rezept), die Hand, das Phantom UND das Setzen
    // (`confirmBuild`): was die Vorschau zeigt, zeigt das Phantom, und genau das steht. Befund: vier Kopien des Hashes, und
    // das Setzen würfelte den Samen aus Math.random — die Eiche des Phantoms (Gestalt 2) stand als Gestalt 1.
    // JEDES SETZEN EIN NEUES WERK (Integration V18.536, Auflage 1 der zweiten Werkstatt-Gegenprüfung): trägt der Bauplan
    // keinen Wurf der Werkstatt, zieht der Bau-Modus (`bm`) je Setzen den nächsten Samen des Welt-Stroms seiner Art
    // (`_bauSame("bau:" + name)`, derselbe Strom wie der Standard-Same der Wurzel) — Phantom, Setzen und Nachricht an den
    // Mitspieler lesen ihn, nach dem Setzen zieht das nächste Phantom neu. Befund: jedes Setzen derselben Eiche stand als
    // dieselbe Gestalt mit derselben Tönung (vorher wählte Math.random zwischen zwei Gestalten und streute ±8 %). Ohne
    // `bm` (Hand) zeigt der Name das Werk der Art; ein Wurf der Werkstatt steht genau so, wie gewürfelt.
    // DER SAME DES NÄCHSTEN SETZENS JE ART (`bm.setzSame[art]`, bauen.K1): Phantom, Werkstatt-Vorschau und Kosten-Leiste lesen
    // ihn für jede Zeile — ein Platz für alle Arten zog bei jedem Zeilen-Wechsel (Eiche → Fels → Eiche) den nächsten Samen des
    // Welt-Stroms, die Eiche zeigte eine neue Gestalt ohne Karte (gate:s4-impostor-workshop B), der Strom lief ohne Setzen.
    // `blick` (der Vorbau): der Same, den das Phantom zeigen WIRD — gemerkt oder der nächste des Stroms —, ohne zu merken oder
    // zu ziehen (`_bauSame` mit Blick).
    _werkSame(bp, name, bm, blick = false) {
        const wurf = bp ? bp._grownSeed || bp._rockSeedBase || bp._crystalSeedBase : null;
        const art = name != null ? name : bp && bp.name;
        if (wurf == null && bm) {
            const je = bm.setzSame || (blick ? {} : (bm.setzSame = {}));
            if (blick) return je[art] || this._bauSame("bau:" + art, true);
            return je[art] || (je[art] = this._bauSame("bau:" + art));
        }
        const s = String(wurf != null ? wurf : art);
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (Math.imul(h, 131) + s.charCodeAt(i)) >>> 0;
        return h;
    }
    // ═══ WORLDGEN-AUTO-DÖRFER (der Worldgen-Konsument des "settlement"-Kanals) ═══
    // Γ5: je Welt-Zelle (SIEDLUNG.cellM) entscheidet FNV-1a(worldSeed:dorf:cx,cz) Existenz (1 von
    // `rarity`), Seed, Größe, Anker; Wände: flach · über Wasser · spawnClearM (sonst FindSite).
    // Export async über den Foundry-Worker, Häuser budgetiert (nur `!_frameOverBudget`) über
    // `_spawnSettlementSlot`; `worldMeta.settlementCells` markiert bei Export-ANKUNFT (nie Doppel-Dorf).
    // Der Ort hält den Zug an (Haken `__anazhAutoSettlement = false`, `_dorfTaktLebt`). Unten: Zelle → {seed, nH, Anker} | null.
    // DAS RANG-GESETZ (siedlung.K2): Existenz, Anker, Stufe, Größe und Verdrängung rechnet der Kern (fachwerk `siedlungsZelle`:
    // je Raster der Stufe die Stadt seines Siegers, Pareto-Größe, kein Ort in der Reichweite eines höheren); der Wirt reicht
    // den Zell-Hash (FNV-1a über „<Welt-Same>:dorf:cx,cz") und hält das Gedächtnis je Welt-Same. `mehrM`: so viel weiter als
    // ein Dorf reicht der Ort (die Spawn-Klar-Wand und das Erwachen zählen ab seinem Rand). Bis K2 würfelte die Zelle hier
    // 8–17 Häuser — die Welt trug nur Dörfer.
    // DAS KLIMA DES ORTS für den Plan (haus-gestalt, fachwerk `REGION_KLIMA`): Winter- und Sommer-Mittel am Meer in °C aus dem
    // Ort-Gesetz der Welt (gelaende-core `ortGesetz(teil).klimaHeute`: die Heimat −4 / 18, am Ziel der Reise Heimat + Δ). Leser: der
    // Export (`_foundryRequestSettlement`) und die Massen der Stadt-Kacheln (`kachelMassen`) — die Region jedes Dorfs liegt im Klima.
    // Dazu die Wasser-Spende relativ zur Heimat (haus-stoff, fachwerk `sockelImWasser`: `ortGesetz(teil).spendeVerh`, die Heimat 1):
    // der Sockel jedes Baus steht über dem Spritzwasser des Orts.
    _siedlungKlima() {
        const o = this._gelaende().ort,
            k = o.klimaHeute;
        return { winter: k.winter, sommer: k.sommer, spendeVerh: o.spendeVerh };
    }
    _autoSettlementCellInfo(cx, cz) {
        // ZENSUS 17.07. — Existenz/Raster/Größe sind fachwerk-Gesetz (SIEDLUNG); kaltes Buch → keine Zelle.
        const A = AnazhRealm._siedlungGesetz();
        if (!A) return null;
        const v = this._viertelInfo(cx, cz); // die Zelle als Viertel einer Stadt des Worts (w28-stadt-funktion)
        if (v) return v;
        const ws = AnazhRealm._saatJe(this);
        if (!this._siedlungZellMemo || this._siedlungZellMemo.ws !== ws) this._siedlungZellMemo = { ws, M: new Map() }; // Instanz-Feld (die _editSaveTimer-Klasse)
        const hash = (x, z) => {
            const s = `${ws}:dorf:${x},${z}`;
            let h = 2166136261 >>> 0;
            for (let i = 0; i < s.length; i++) {
                h ^= s.charCodeAt(i);
                h = Math.imul(h, 16777619) >>> 0;
            }
            return h;
        };
        const z = AnazhRealm.Gesetz("fachwerk:siedlungsZelle")(A, cx, cz, hash, this._siedlungZellMemo.M);
        if (!z) return null;
        // DER MENSCH BAUT, WO ER LEBT (Reise, w28-reise-ort: `ortGesetz(teil).siedlung.bau`, die Heimat 1): vor seiner Zeit und im
        // Dauer-Frost trägt keine Zelle ein Dorf — ihr Rang aus ihrem Samen gegen den Anteil des Orts
        if (((z.seed >>> 12) & 0xffff) / 65536 >= this._gelaende().ort.siedlung.bau) return null;
        if (this._viertelInfo(cx, cz, z) === null) return null; // im Reich des Kerns oder eines Viertels einer Stadt des Worts
        return {
            key: cx + "," + cz,
            seed: z.seed >>> 0 || 1,
            nH: z.nH,
            stufe: z.stufe,
            mehrM: this._siedlungMehrM(z.nH),
            x: z.x,
            z: z.z,
        };
    }
    // So viel weiter als das größte Dorf reicht ein Ort mit nH Häusern (fachwerk `siedlungsReich`; 0 für jedes Dorf): um so viel
    // früher erwacht er, um so viel weiter hält er sich vom Genesis-Ort, um so viel weiter baut der Reload seine Schichten.
    _siedlungMehrM(nH) {
        const A = AnazhRealm._siedlungGesetz();
        if (!A || !Number.isFinite(nH)) return 0;
        const reich = AnazhRealm.Gesetz("fachwerk:siedlungsReich");
        return Math.max(0, reich(A, nH) - reich(A, A.nHMin + A.nHSpan - 1));
    }
    // DIE STÄDTE DER WELT (w28-stadt-funktion): jedes Gedächtnis eines Worts, das die Zahl einer Stadt trägt (`stadt`, mehr Häuser
    // als ein Viertel fasst — `_dorfAkt`) — {key, seed, nH, epoche, x, z, cx, cz, ringe}: ihr Kern steht am Anker des Worts, ihre
    // Viertel in den Zellen um ihn (`_viertelInfo`). Gemerkt am Gedächtnis der Welt und der Zahl seiner Einträge. Kein eigener
    // Stand: die Stadt reist als das Gedächtnis ihres Kerns.
    _staedte() {
        const cells = (this.state.worldMeta || {}).settlementCells;
        const [S, SF] = [AnazhRealm._siedlungGesetz(), AnazhRealm.Gesetz("fachwerk:STADT_FUNKTION")];
        if (!cells || typeof cells !== "object" || !S || !SF) return AnazhRealm.STAND_LEER;
        const n = Object.keys(cells).length;
        const M = this._staedteMemo; // Instanz-Feld (die _editSaveTimer-Klasse)
        if (M && M.cells === cells && M.n === n && M.voll === SF.voll) return M.liste;
        const ringe = AnazhRealm.Gesetz("fachwerk:stadtRinge");
        const liste = [];
        for (const key in cells) {
            const c = cells[key];
            if (!c || !(c.stadt > SF.voll) || !Number.isFinite(c.x) || !Number.isFinite(c.z)) continue;
            const [cx, cz] = [Math.floor(c.x / S.cellM), Math.floor(c.z / S.cellM)];
            liste.push({
                key,
                seed: c.seed,
                nH: c.stadt,
                epoche: c.epoche,
                x: c.x,
                z: c.z,
                cx,
                cz,
                ringe: ringe(c.stadt),
            });
        }
        this._staedteMemo = { cells, n, voll: SF.voll, liste };
        return liste;
    }
    // DIE ZELLE ALS VIERTEL (w28-stadt-funktion): liegt die Zelle im Raster einer Stadt des Worts (`_staedte`: ganze Schritte
    // `STADT_FUNKTION.schritt` von der Zelle ihres Kerns, in ihren Ringen) und trägt die Stadt dort ein Viertel (fachwerk
    // `viertelWort`), ist sie dieses Viertel — {key, seed, nH, x, z, mehrM, stadt, epoche, erbe}, sein Anker der der Stadt, um
    // ganze Schritte versetzt; sonst undefined (dort gilt das Rang-Gesetz). MIT `rang` (der Ort des Rang-Gesetzes in der Zelle,
    // {x, z, nH}): null, wenn er im Reich des Kerns oder eines Viertels steht (die Summe beider `siedlungsReich`, wie der Rang
    // verdrängt) — sonst undefined: die Dörfer der Welt zwischen den Vierteln bleiben. Eine reine Funktion des Gedächtnisses der
    // Stadt, gemerkt mit ihm (`_staedteMemo.je`): das Viertel reist nicht (`_ortReistNicht`), es erwacht, wird bereitet und
    // kehrt wieder wie jede Zelle der Welt (`_tickAutoSettlement`). Leser: `_autoSettlementCellInfo`, `_zellZeit`.
    _viertelInfo(cx, cz, rang) {
        const staedte = this._staedte();
        if (!staedte.length) return undefined;
        const M = this._staedteMemo.je || (this._staedteMemo.je = new Map());
        const mk = cx + "," + cz + (rang ? "|" + rang.nH : "");
        if (M.has(mk)) return M.get(mk);
        const [S, SF] = [AnazhRealm._siedlungGesetz(), AnazhRealm.Gesetz("fachwerk:STADT_FUNKTION")];
        const [wort, reich] = [AnazhRealm.Gesetz("fachwerk:viertelWort"), AnazhRealm.Gesetz("fachwerk:siedlungsReich")];
        const m = SF.schritt * S.cellM;
        let aus;
        for (const s of staedte) {
            if (rang) {
                // die höchstens neun Plätze des Rasters um den Ort: der Kern (0, 0) mit der Wand, die Viertel mit ihrer Zahl
                const [i0, k0] = [Math.round((rang.x - s.x) / m), Math.round((rang.z - s.z) / m)];
                for (let i = i0 - 1; i <= i0 + 1 && aus === undefined; i++)
                    for (let k = k0 - 1; k <= k0 + 1 && aus === undefined; k++) {
                        const w = Math.max(Math.abs(i), Math.abs(k)) <= s.ringe && wort(s.seed, s.nH, i, k, s.epoche);
                        const d = Math.hypot(s.x + i * m - rang.x, s.z + k * m - rang.z);
                        if (w && d < reich(S, w.nH) + reich(S, rang.nH)) aus = null;
                    }
            } else {
                const [dx, dz] = [cx - s.cx, cz - s.cz];
                const drin = Math.max(Math.abs(dx), Math.abs(dz)) <= s.ringe * SF.schritt;
                if (!drin || (!dx && !dz) || dx % SF.schritt || dz % SF.schritt) continue;
                const w = wort(s.seed, s.nH, dx / SF.schritt, dz / SF.schritt, s.epoche); // die Stadt des Worts: ihr Plan ohne Klima (`_foundryRequestSettlement`)
                if (w)
                    aus = {
                        key: cx + "," + cz,
                        seed: w.seed,
                        nH: w.nH,
                        stufe: 0,
                        mehrM: this._siedlungMehrM(w.nH),
                        x: s.x + dx * S.cellM,
                        z: s.z + dz * S.cellM,
                        stadt: s.key,
                        epoche: w.epoche,
                        erbe: w.erbe,
                        kachel: { samen: s.seed, nH: s.nH, i: dx / SF.schritt, k: dz / SF.schritt },
                        fest: true, // die Kachel steht an ihrem Platz im Raster: die Ort-Wahl rückt sie nie (die Naht hielte nicht)
                    };
            }
            if (aus !== undefined) break;
        }
        M.set(mk, aus);
        return aus;
    }
    // DER EINGANG EINER ZELLE (haus-gestalt): ihre Zeit (`_zellZeit`), dazu das Klima ihres Orts, wenn kein Wort sie plant — das Viertel
    // einer Stadt des Worts (`kachel`) trägt keins. Leser: der Export der Zelle (`_dorfBereiten`) und ihres Gedächtnisses (`_ortDp`).
    _zellEingang(key, seed) {
        const z = this._zellZeit(key, seed);
        return z.kachel ? z : Object.assign(z, { klima: this._siedlungKlima() });
    }
    // DIE ZEIT EINER ZELLE: das Viertel einer Stadt trägt die Epoche und das Erbe seiner Stadt (`_viertelInfo`: Region, Jahr und
    // Spanne ihres Kerns), jede andere Zelle die Legende ihres Samens (`_siedlungEpoche`). Leser: der Export der Zelle
    // (`_dorfBereiten`) und ihres Gedächtnisses (`_ortDp`).
    _zellZeit(key, seed) {
        const m = /^(-?\d+),(-?\d+)$/.exec(key);
        const v = m && this._viertelInfo(+m[1], +m[2]);
        return v && v.seed === seed
            ? { epoche: v.epoche, erbe: v.erbe, kachel: v.kachel }
            : { epoche: this._siedlungEpoche(seed) };
    }
    // EINE STADT IST GEGRÜNDET (`_dorfAkt`): die Zellen um ihren Kern sind ab jetzt ihre Viertel — was die Welt je Saat über sie
    // gemerkt hat (die Orte der Zellen, ihr Reich, die Nachbarn des Wegenetzes, die verworfenen Zellen in ihrem Reich), fällt und
    // wird beim nächsten Fragen aus dem Gedächtnis der Stadt neu gerechnet.
    _stadtGegruendet(key) {
        this._staedteMemo = this._zellOrtMemo = this._ortReichMemo = this._wegenetzMemo = null;
        const s = this._staedte().find((q) => q.key === key);
        const SF = AnazhRealm.Gesetz("fachwerk:STADT_FUNKTION");
        const R = s ? s.ringe * SF.schritt + (SF.schritt >> 1) : -1;
        for (const k of this._autoSettlementRejected || AnazhRealm.STAND_LEER) {
            const [x, z] = k.split(",").map(Number);
            if (s && Math.max(Math.abs(x - s.cx), Math.abs(z - s.cz)) <= R) this._autoSettlementRejected.delete(k);
        }
        if (s)
            this.log(
                `STADT „${key}": ${s.nH} Häuser in ${s.ringe} Ring(en) von Kacheln um die Mitte — sie erwachen beim Nahen.`,
                "INFO"
            );
    }
    // DER ORT EINER ZELLE NACH DEM GESETZ (Schlüssel „cx,cz“ oder „start“): die Zelle (`_autoSettlementCellInfo`) an der Stelle,
    // an der sie siedelt (`_autoSettlementFindSite`: der Anker, sonst die Probe-Ringe; das Start-Dorf `_autoSettlementStartInfo`)
    // — {key, x, z, nH} oder null (kein Ort: Hash, verdrängt, keine Stelle trägt ihn). Eine reine Funktion der Welt-Saat, gemerkt
    // je Saat; vor dem Plan des Genesis-Orts (die Spawn-Klar-Wand misst an ihm) und bei kaltem Buch steht keiner, und nichts wird
    // gemerkt. Leser: das Wegenetz (`_wegenetzNachbarn`, offen mit ihm) und die Geburt (`_imReichEinesOrts`, offen: der Anker)
    // — bis tiere.K1#2 lebte die Frage im Wegenetz allein.
    _zellOrt(k) {
        const ws = AnazhRealm._saatJe(this);
        if (!this._zellOrtMemo || this._zellOrtMemo.ws !== ws) this._zellOrtMemo = { ws, M: new Map() };
        const M = this._zellOrtMemo.M;
        if (M.has(k)) return M.get(k);
        if (
            !AnazhRealm._siedlungGesetz() ||
            !this._genesisMitte() ||
            (k === "start" && !this._genesisPlan && this._gelaende().ort.siedlung.platz)
        )
            return null;
        const m = /^(-?\d+),(-?\d+)$/.exec(k);
        // der Kern einer Stadt des Worts (`_staedte`) ist ein Ort des Netzes: er steht, wo sein Gedächtnis ihn trägt
        const kern = !m && k !== "start" && this._staedte().find((s) => s.key === k);
        if (kern) {
            const o = { key: k, x: kern.x, z: kern.z, nH: AnazhRealm.Gesetz("fachwerk:STADT_NETZ").jeKachel, stadt: k };
            M.set(k, o);
            return o;
        }
        const i =
            k === "start" ? this._autoSettlementStartInfo() : m ? this._autoSettlementCellInfo(+m[1], +m[2]) : null;
        // DIE WAHRHEIT VOR DEM URTEIL (wie `_autoSettlementZelle`): die Stelle fragt das Wasser um die Probe-Ringe — fehlt eine
        // Hydro-Kachel, ist sie bestellt, und der Ort ist offen (undefined, nichts gemerkt)
        const um = Math.max(...AnazhRealm.AUTO_SETTLEMENT.siteProbeR) * AnazhRealm._siedlungGesetz().cellM;
        if (i && k !== "start" && this._ensureHydroTilesAround(i.x, i.z, um)) return undefined;
        const s = i && (k === "start" ? i : this._autoSettlementFindSite(i));
        const o = s ? { key: k, x: s.x, z: s.z, nH: i.nH, ...(i.stadt ? { stadt: i.stadt } : null) } : null; // `stadt`: das Viertel nennt seine Stadt (`_wegenetzNachbarn`)
        M.set(k, o);
        return o;
    }
    // DAS REICH EINES KOMMENDEN ORTS (tiere.K1#2, Herde am Hang): liegt (x, z) in der Reichweite eines Orts des Gesetzes
    // (`_zellOrt`; das Start-Dorf ab seinem Gedächtnis), dessen Hülle in dieser Sitzung noch nicht steht? Steht sie (`_stlWegeKeys`), urteilt sie selbst
    // (`wegeKarte.siedlungen`). Das Reich ist das des Gesetzes (fachwerk `siedlungsReich`: kern + jeWurzel·√nH um den Ort —
    // dieselbe Scheibe, mit der der Rang verdrängt), sein Ort der gewählte, sobald es ihn gibt (das Gedächtnis der Zelle
    // `settlementCells`, ihr Vorrat `_dorfBereiten`), davor die Stelle des Gesetzes; eine verworfene Zelle trägt keinen. Vor dem
    // Genesis-Ort und bei kaltem Buch steht kein Ort (`_zellOrt`). Bis hier kannte die Geburt nur die Hüllen erwachter Orte:
    // GTX a4dc2a45 warf die Herde am Hang 98 m vom Ort des Dorfs −2,−4 (Reich 112 m), sein Erdbau trug danach den Hang um
    // 1,7–5,4 m ab — zwei der fünf Leiber standen hinter der Böschung (3 von 5 sichtbar bei 43 m).
    _imReichEinesOrts(x, z) {
        const S = AnazhRealm._siedlungGesetz();
        if (!S || !this._genesisMitte()) return false;
        const reich = AnazhRealm.Gesetz("fachwerk:siedlungsReich");
        const st = this.state;
        const cells = (st.worldMeta && st.worldMeta.settlementCells) || {};
        const steht = this._stlWegeKeys;
        const weg = this._autoSettlementRejected;
        const V = this._dorfVorraete;
        const R = AnazhRealm.ORT_REICH_ZELLEN;
        // der Ort einer Zelle liegt in ihr ± der weitesten Probe der Stelle: k Zellen fort mindestens (k − ¾ − Probe) Zellen weit —
        // ein Reich, das weiter reicht als R Zellen fragen, bricht laut
        const grenze = (R + 0.25 - Math.max(...AnazhRealm.AUTO_SETTLEMENT.siteProbeR)) * S.cellM;
        const ws = AnazhRealm._saatJe(this);
        if (!this._ortReichMemo || this._ortReichMemo.ws !== ws) this._ortReichMemo = { ws, M: new Map() };
        const M = this._ortReichMemo.M;
        // je Zelle [Ort x, z, Reich, Schlüssel] oder null, gemerkt an der Zahl der Zelle (der Schlüssel nur, wo ein Ort steht);
        // ist die Stelle offen (ihr Wasser fehlt), gilt bis dahin der Anker des Gesetzes, ungemerkt
        const zelle = (cx, cz) => {
            const n = cx * 1048576 + cz;
            if (M.has(n)) return M.get(n);
            const o = this._zellOrt(cx + "," + cz);
            const q = o === undefined ? this._autoSettlementCellInfo(cx, cz) : o;
            const a = q ? [q.x, q.z, reich(S, q.nH), cx + "," + cz] : null;
            if (a && a[2] > grenze)
                throw new Error(
                    `das Reich des Orts ${a[3]} (${a[2].toFixed(0)} m) reicht über ${R} Zellen (ORT_REICH_ZELLEN)`
                );
            if (o !== undefined) M.set(n, a);
            return a;
        };
        const drin = (ox, oz, r) => (x - ox) * (x - ox) + (z - oz) * (z - oz) <= r * r;
        // der gewählte Ort, sobald es ihn gibt: das Gedächtnis der Zelle, ihr Vorrat — sonst die Stelle des Gesetzes
        const ort = (k, ox, oz, r) => {
            if ((steht && steht.has(k)) || (weg && weg.has(k))) return false;
            const c = cells[k];
            const v = V && V.get(k);
            if (c && Number.isFinite(c.x)) return drin(c.x, c.z, r);
            if (v && v.da) return drin(v.x, v.z, r);
            return drin(ox, oz, r);
        };
        const cx0 = Math.floor(x / S.cellM);
        const cz0 = Math.floor(z / S.cellM);
        for (let dz = -R; dz <= R; dz++)
            for (let dx = -R; dx <= R; dx++) {
                const a = zelle(cx0 + dx, cz0 + dz);
                if (a && ort(a[3], a[0], a[1], a[2])) return true;
            }
        // das Start-Dorf ab seinem Gedächtnis (reserviert am Buch, `_startDorfBestellen`): seine Stelle fragt die Geburt nie selbst —
        // früh gefragt merkte sie eine andere als die, an der es steht (gate:kreatur-takt bewohner: 5 Leiber statt 4)
        const s0 = cells.start;
        return !!s0 && Number.isFinite(s0.nH) && ort("start", s0.x, s0.z, reich(S, s0.nH));
    }
    // Site-Wände am Anker (die Slot-Wände prüft `_spawnSettlementSlot` je Haus zusätzlich). `noSpawnClear`
    // öffnet NUR dem Start-Dorf die Spawn-Klar-Wand; Wasser und Hang bleiben für jede Site dieselbe Wand. DIE STEIL-WAND IST DIE
    // BÖSCHUNG DES ERDBAUS (siedlung.K3): ein Ort steht am Hang, solange er flacher liegt als die Böschung, mit der sein Erdbau den
    // Grund schließt (gelaende-core `ERDBAU.boeschung`, 0,6) — steiler schließen die Kegel nie, die Böschung eines Hauses hangauf
    // begräbt die Tür des nächsten (Mess-Dorf −4,−4 am Anker, Neigung 0,81: zwei Scheunen mit 6,1 und 4,7 m Absatz). Die Trasse
    // lenkt seine Gassen (fachwerk `trasseLenk`), der Erdbau seiner Platten trägt jedes Haus (`ortPlan`; Node, 55 Zellen um den
    // Ursprung: zwischen 0,35 und 0,46 hielten alle 13 Gassen ≤ 12 % und jede Tür). Bis siedlung-k3-hang wies eine eigene Zahl
    // (`SIEDLUNG.slopeMax` 0,35) jeden Ort steiler als 0,35 ab.
    // DER GENESIS-ORT (EINE Quelle, Pflicht F): die Mitte des Plans der Welt (`worldMeta.genesisOrt`, gesetzt, wenn der Plan aus
    // dem Faden kommt, `_genesisPlanAn`; er reist mit der Welt) — dort kommt der Spieler an, um sie stehen die Tore, um sie bleibt
    // die Warmup-Welt dorffrei, von ihr aus liegt der Wunsch des Start-Viertels. null, bevor der Plan einer neuen Welt steht:
    // wer sie dann fragt, wartet (kein Dorf vor dem Ort). Bis zum Plan war sie die Mitte einer Stein-Scheibe, ohne sie der
    // Ursprung der Welt.
    _genesisMitte() {
        const g = this.state.worldMeta && this.state.worldMeta.genesisOrt;
        return g && Number.isFinite(g.x) && Number.isFinite(g.z) ? { x: g.x, z: g.z } : null;
    }

    // `mehrM` (siedlung.K2): so viel weiter als ein Dorf reicht der Ort — die Spawn-Klar-Wand zählt ab seinem Rand.
    _autoSettlementSiteOk(x, z, noSpawnClear, mehrM = 0) {
        // Der Dorf-Ort ist ein Wurf des Feldes (Auto-Dorf, Start-Dorf): wo die Wildnis nicht trägt, steht keins.
        if (!this._wildnisTraegt(x, z)) return false;
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (spawnClearM)
        if (!noSpawnClear) {
            const g = this._genesisMitte();
            if (!g || Math.hypot(x - g.x, z - g.z) < A.spawnClearM + mehrM) return false; // die Warmup-Welt bleibt dorffrei
        }
        if (!this._landAt(x, z, 0.2)) return false; // die Wasser-Wand (EINE Quelle)
        const SG = AnazhRealm._siedlungGesetz();
        if (!SG || this._slopeAt(x, z) > globalThis.__gelaendeCore.ERDBAU.boeschung) return false;
        return this._ortNaehrt(x, z, SG, mehrM);
    }
    // DER HOF-BAUM WÄCHST, WO DAS KLIMA DES ORTS IHN TRÄGT (Reise, w28-reise-ort: gelaende-core `ortBaum`, die Heimat 1): sein Rang
    // aus seinem Samen `seedT` gegen den Baum des Orts an seinem Platz (Laubholz; der Wald des Klimas, am Wasser die Oase) — in der
    // Wüste steht er nur im Band am Ufer, im Eis nie. Bis w28-reise-ort stand er an jedem Ort (Eiche und Birke im Sand). Leser: die
    // Schicht des Dorfs (`_dorfErlebnis`) und die Linse (gate:worker-dichte K7, der Baum der Wüste).
    _hofBaumTraegt(wx, wz, wy, seedT) {
        const W = this._gelaende().ort.wuchs;
        const traegt = globalThis.__gelaendeCore.ortBaum(W, W.wald < 1 ? this._ortNass(wx, wz, wy) : 0, false);
        return ((seedT >>> 8) & 0xffff) / 65536 < traegt;
    }
    // DER GRUND NÄHRT DAS DORF (Reise, w28-reise-ort: gelaende-core `ortKraut` ≥ `ORT_SIEDLUNG.naehrt`): irgendwo in seinem Reich
    // (die Mitte, je 8 Punkte auf der Hälfte und am Rand des größten Dorfs, fachwerk `siedlungsReich`, + `mehrM`) trägt der Grund
    // die Krautschicht — in der Wüste steht das Dorf am Wasser (die Oase), in der Heimat überall (die Krautschicht des Klimas
    // trägt allein: keine Frage an den Boden).
    _ortNaehrt(x, z, SG, mehrM) {
        const K = globalThis.__gelaendeCore;
        const W = this._gelaende().ort.wuchs;
        const soll = K.ORT_SIEDLUNG.naehrt;
        if (W.decke >= soll) return true;
        if (!(W.oase >= soll)) return false;
        const R = AnazhRealm.Gesetz("fachwerk:siedlungsReich")(SG, SG.nHMin + SG.nHSpan - 1) + (mehrM || 0);
        for (const r of [0, R / 2, R])
            for (let k = 0; k < (r ? 8 : 1); k++) {
                const px = x + Math.cos((k / 8) * 2 * Math.PI) * r;
                const pz = z + Math.sin((k / 8) * 2 * Math.PI) * r;
                const y = this.getTerrainHeightAt(px, pz);
                if (Number.isFinite(y) && K.ortKraut(W, this._ortNass(px, pz, y)) >= soll) return true;
            }
        return false;
    }
    // Site-Suche: der trockene, tragende Fleck NAHE des Ankers statt Tod an einem Punkt (am Ufer, über der Böschung).
    // Γ5 aus dem Zell-Seed: Anker zuerst, dann je Probe-Ring
    // 4 Proben (Phase aus Seed, Ring 2 um 45° verdreht) durch `_autoSettlementSiteOk`. null = kein Dorf.
    _autoSettlementFindSite(info) {
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (siteProbeR)
        const mehr = info.mehrM || 0; // die Stadt reicht weiter als das Dorf (siedlung.K2)
        if (this._autoSettlementSiteOk(info.x, info.z, false, mehr)) return { x: info.x, z: info.z };
        if (info.fest) return null; // die Kachel einer Stadt steht an ihrem Platz im Raster oder gar nicht (w28-stadt-netz)
        const phase = (((info.seed >>> 4) & 0xff) / 255) * 2 * Math.PI;
        for (let ri = 0; ri < A.siteProbeR.length; ri++) {
            // ZENSUS 17.07. — das Zell-Raster ist fachwerk-Gesetz (SIEDLUNG.cellM).
            const SG = AnazhRealm._siedlungGesetz();
            if (!SG) return null;
            const rad = A.siteProbeR[ri] * SG.cellM;
            for (let i = 0; i < 4; i++) {
                const a = phase + (i / 4) * 2 * Math.PI + ri * (Math.PI / 4);
                const px = info.x + Math.cos(a) * rad;
                const pz = info.z + Math.sin(a) * rad;
                if (this._autoSettlementSiteOk(px, pz, false, mehr)) return { x: px, z: pz };
            }
        }
        return null;
    }
    // DIE WELTEN DER TORE (Pflicht F): die Ziel-Welten der eingebauten Portal-Baupläne (ihre id der Welt-Tafel) und je Welt ihr
    // Bauplan, gemerkt je Bauplan-Tafel — die Welten, deren Tor der Genesis-Ort trägt (fachwerk `genesisLayout` wirft laut, fehlt
    // eine oder hat eine keinen Slot). Leser: die Bestellung des Plans (`_genesisPlanBestellen`), der Wirt (`_genesisWerke`).
    _genesisTorTypen() {
        const bps = this.state.blueprints || {};
        if (this._genesisTorTafel && this._genesisTorTafel.bps === bps) return this._genesisTorTafel.typen;
        // die Welt eines Portals ist die Zeile der Welt-Tafel, deren Ziel sein `portalMeta.world` nennt (die id der Slot-Tafel)
        const idVon = new Map(Object.values(AnazhRealm.WORLD_REGISTRY).map((w) => [w.world, w.id]));
        const typen = new Map();
        for (const n of Object.keys(bps)) {
            const b = bps[n];
            const id = b && b.builtIn && b.role === "portal" && b.portalMeta ? idVon.get(b.portalMeta.world) : null;
            if (id) typen.set(id, n);
        }
        this._genesisTorTafel = { bps, typen };
        return typen;
    }
    _genesisWelten() {
        return [...this._genesisTorTypen().keys()];
    }
    // DER ORT DER VORSCHAU hinter einem Tor des Genesis-Orts: die Zeile `vorschau` seines Tors im Plan (auf dem Weg hinter ihm),
    // `blick` von der Mitte hinaus — wo ein Wagen dann steht, entscheidet das Platz-Gesetz (`_fahrPlatzSuche`). Leser:
    // `_ensurePortalPreview` und die Fahr-Linse (gate:fahr-leben P: an jedem Tor). → { x, y, z, blick } oder null (kein Plan,
    // kein Tor mit Vorschau, kein Boden). Bis zum Plan stand die Vorschau 8 m radial hinter einem Tor des Rings.
    _portalVorschauOrt(portal) {
        const P = this._genesisPlan;
        if (!P || !portal) return null;
        let welt = null;
        for (const [w, n] of this._genesisTorTypen()) if (n === portal.type) welt = w;
        const t = welt ? P.tore.find((q) => q.welt === welt && q.vorschau) : null;
        if (!t) return null;
        const x = P.ort.x + t.vorschau.x;
        const z = P.ort.z + t.vorschau.z;
        const y = this.getTerrainHeightAt(x, z);
        if (!Number.isFinite(y)) return null;
        return { x, y: y + 0.5, z, blick: t.vorschau.blick };
    }

    // PORTAL-PREVIEW: EIN Preview je Studio-Tor (am Ort seiner Zeile im Plan, `_portalVorschauOrt`), sichtbar vorm iframe.
    // Doppelt idempotent (worldMeta.portalPreview<Key> + Existenz-Probe auf id); Foundry kalt → Skip + EIN
    // Await-Book je worldKey, nächster Tick retry. Typen: fachwerk→haus_alemannisch, garage→fahrzeug_gt,
    // schmiede→esse, portale→tor_drachentor (spawnArchitecture silent/autonomous).
    _ensurePortalPreview(worldKey, type, id) {
        if (typeof worldKey !== "string" || !worldKey || typeof type !== "string" || !type) return;
        if (typeof id !== "string" || !id) return;
        const st = this.state;
        const wm = st.worldMeta;
        const metaKey = "portalPreview" + worldKey.charAt(0).toUpperCase() + worldKey.slice(1);
        const fertig = (this._portalPreviewFertig = this._portalPreviewFertig || Object.create(null));
        const awaiting = (this._portalPreviewAwaiting = this._portalPreviewAwaiting || Object.create(null));
        if (!wm || wm[metaKey] || fertig[worldKey]) return;
        const arches = st.architectures || [];
        for (const e of arches) {
            if (e && e.id === id) {
                fertig[worldKey] = true;
                wm[metaKey] = true;
                return;
            }
        }
        const portalType = "welt_" + worldKey;
        let portal = null;
        for (const e of arches) {
            if (e && e.type === portalType && e.position) {
                portal = e;
                break;
            }
        }
        if (!portal) return;
        const f = this._foundry;
        const bpOk = !!(st.blueprints && st.blueprints[type]);
        if (!f || !f.ready || !f.recipes || !bpOk) {
            if (awaiting[worldKey]) return;
            awaiting[worldKey] = true;
            Promise.resolve(this._foundryAwaitBook(8000))
                .then((warm) => {
                    awaiting[worldKey] = false;
                    if (warm && warm.ok) this._ensurePortalPreview(worldKey, type, id);
                })
                .catch((e) => {
                    awaiting[worldKey] = false;
                    this._stoffBruch("die Portal-Vorschau " + worldKey, e);
                });
            return;
        }
        const ort = this._portalVorschauOrt(portal);
        if (!ort) return;
        // Deterministische Seeds: fachwerk 49177 · garage 49178 · schmiede 49179 · portale 49180.
        const seed =
            worldKey === "fachwerk"
                ? 49177
                : worldKey === "garage"
                  ? 49178
                  : worldKey === "schmiede"
                    ? 49179
                    : worldKey === "portale"
                      ? 49180
                      : 49170;
        const opts = { silent: true, autonomous: true, id, seed };
        // Der Vorschau-Wagen schaut vom Ring hinaus in die Welt (Studio-Wagen: Template-Gier = Fahrt − π/2); wo er steht,
        // entscheidet das Platz-Gesetz (`_fahrPlatzSuche` in spawnArchitecture: der nächste fahrbare Grund mit Bahn).
        if (worldKey === "garage") opts.rotationY = ort.blick - Math.PI / 2;
        // Nur fachwerk/haus_*: die Vorschau trägt ihre Prägung (studioOv: Stil, Verband, Geschosse, Maße, Dach) — der
        // Bau des Gesetzbuchs liest sie, fremde Schlüssel ignoriert er. Der Stempel gewinnt: ein Eintrag ohne studioOv
        // bleibt; ov nur bei Neu-Spawn.
        // Die Maße (Breite · Tiefe · Dachneigung · Geschosse) sind das fränkische Preset des Gesetzbuchs (fachwerk PRESETS
        // fraenkisch.s), kein Zahlen-Zwilling (K2); Stil, Verband, Gaube und Flügel wählt die Vorschau.
        if (worldKey === "fachwerk" && type.startsWith("haus_")) {
            const PRE =
                AnazhRealm.Gesetz("fachwerk:PRESETS.fraenkisch.s") || AnazhRealm._kernPflichtBruch("fachwerk:PRESETS");
            opts.studioOv = Object.freeze(
                Object.assign({}, PRE, { stil: "alt", brace: "andreas", gaube: true, fluegel: true, fluegelSide: 1 })
            );
        }
        // DER PLATZ DES VORSCHAU-WAGENS IM TAKT: die Suche des Platz-Gesetzes (`_fahrPlatzWege`) läuft vor dem Bau, je Takt
        // höchstens FAHR_PLATZ_JE_TAKT Orte (die Ring-Suche kostete am Garage-Tor bis 0,66 s in EINEM Takt); der Wagen entsteht
        // dort, wo sie endet — die Wurzel prüft den Ort dann in einem Schritt. Kein Platz: dieses Tor bleibt ohne Vorschau.
        if (this._fahrzeugGesetzFor({ type })) {
            const wege = (this._vorschauPlatzWege = this._vorschauPlatzWege || Object.create(null));
            let job = wege[worldKey];
            if (!job) {
                const probe = { type, position: { x: ort.x, y: ort.y, z: ort.z }, rotationY: opts.rotationY, scale: 1 };
                job = wege[worldKey] = { probe, weg: this._fahrPlatzWege(probe), ende: null };
            }
            for (let i = 0; i < AnazhRealm.FAHR_PLATZ_JE_TAKT && job.ende === null; i++) {
                const r = job.weg.next();
                if (r.done) job.ende = r.value;
            }
            if (job.ende === null) return;
            delete wege[worldKey];
            if (!job.ende) {
                fertig[worldKey] = true;
                return;
            }
            ort.x = job.probe.position.x;
            ort.z = job.probe.position.z;
            opts.rotationY = job.probe.rotationY;
        }
        // die Absage der Wurzel beim Namen: findet das Platz-Gesetz keinen fahrbaren Grund, steht dieses Tor ohne Vorschau —
        // einmal (die Suche liefe sonst in jedem Takt neu)
        let absage = null;
        opts.absage = (g) => (absage = g);
        const entry = this.spawnArchitecture(type, { x: ort.x, y: ort.y, z: ort.z }, opts);
        if (entry) {
            wm[metaKey] = true;
            fertig[worldKey] = true;
            this.log(`Portal-Preview ${worldKey}: ${type} hinter ${portalType}.`, "INFO");
        } else if (absage === "platz") fertig[worldKey] = true;
    }

    // DIE VORSCHAUEN DES GENESIS-ORTS (Pflicht F): je Tor mit der Zeile `vorschau` im Plan steht sein Bauplan hinter ihm, erst
    // wenn der Spieler ≤ `nahM` vor dem Tor steht (`_ensurePortalPreview`); bei kalter Foundry EIN Await-Book. Bis zum Plan trug
    // der Wirt die vier als eigene Tafel und stellte sie ab 22 m.
    _genesisVorschau(plan, playerPos) {
        let nah = false;
        for (const t of plan.tore) {
            const v = t.vorschau;
            if (!v) continue;
            const dx = plan.ort.x + t.x - playerPos.x;
            const dz = plan.ort.z + t.z - playerPos.z;
            if (dx * dx + dz * dz > v.nahM * v.nahM) continue;
            nah = true;
            this._ensurePortalPreview(t.welt, v.typ, "portal-preview-" + t.welt);
        }
        if (!nah) return;
        const f = this._foundry;
        if ((f && f.ready) || this._portalApproachAwaiting) return;
        this._portalApproachAwaiting = true;
        Promise.resolve(this._foundryAwaitBook(8000))
            .then(() => {
                this._portalApproachAwaiting = false;
            })
            .catch((e) => {
                this._portalApproachAwaiting = false;
                this._stoffBruch("das Studio-Buch vor dem Portal (Foundry-Boot)", e);
            });
    }

    // DAS START-VIERTEL (Pflicht F): EINMAL je Welt ein Start-Dorf am Wunsch des Plans (`viertel`: hinter dem Lyra-Tor, außerhalb
    // des Ankunftskegels) — der Wunsch selbst, sonst der erste Ort der Ringe um ihn (`startRingeM`, 8 Richtungen, die Phase aus
    // der Saat „:startdorf"), den `_autoSettlementSiteOk` trägt (die Spawn-Klar-Wand offen); die Ort-Wahl rückt den Plan des Dorfs
    // danach an den Ort, der jedes Haus trägt. Ohne Plan kein Start-Dorf (es wartet auf den Ort). Bis zum Plan suchte sie Radien
    // 110–170 m um die Mitte, das Dorf fiel in jeden Blick der Ankunft.
    // DER FREMDE ORT (Reise, w28-reise-ort: `ortGesetz(teil).siedlung`): ohne Prüfplatz steht das Start-Dorf nahe der Ankunft
    // (`_genesisMitte`), auf den Ringen am Rand seines Reichs (1, 1,5 und 2 × fachwerk `siedlungsReich`: die Ankunft bleibt frei) —
    // wo der Grund es nährt (`_autoSettlementSiteOk` → `_ortNaehrt`: in der Wüste am Wasser) und der Mensch baut (`siedlung.bau`,
    // der Rang aus seiner Saat: auf dem Eis und vor seiner Zeit keins). In der Heimat wartet es auf den Plan wie bisher.
    _autoSettlementStartInfo() {
        // ZENSUS 17.07. — die Dorf-Größe ist fachwerk-Gesetz (SIEDLUNG.nHMin/nHSpan); kaltes Buch → kein Start-Dorf.
        const S = AnazhRealm._siedlungGesetz();
        const P = this._genesisPlan;
        const SO = this._gelaende().ort.siedlung;
        const M = this._genesisMitte();
        if (!S || (!P && (SO.platz || !M))) return null;
        const wm = this.state.worldMeta || {};
        const s = `${AnazhRealm._saatVon(wm)}:startdorf`;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        if (((h >>> 12) & 0xffff) / 65536 >= SO.bau) return null;
        const phase = (((h >>> 8) & 0xff) / 255) * 2 * Math.PI;
        const W = P ? { x: P.ort.x + P.viertel.x, z: P.ort.z + P.viertel.z } : { x: M.x, z: M.z };
        const orte = P ? [W] : [];
        const reich = P ? 0 : AnazhRealm.Gesetz("fachwerk:siedlungsReich")(S, S.nHMin + S.nHSpan - 1);
        for (const r of P ? AnazhRealm.AUTO_SETTLEMENT.startRingeM : [reich, 1.5 * reich, 2 * reich])
            for (let i = 0; i < 8; i++) {
                const a = phase + (i / 8) * 2 * Math.PI;
                orte.push({ x: W.x + Math.cos(a) * r, z: W.z + Math.sin(a) * r });
            }
        for (const o of orte)
            if (this._autoSettlementSiteOk(o.x, o.z, true))
                return {
                    key: "start",
                    seed: h >>> 0 || 1,
                    nH: AnazhRealm.Gesetz("fachwerk:siedlungsGroesse")(S, h, 0),
                    x: o.x,
                    z: o.z,
                };
        return null;
    }
    // Auto-Dörfer laufen NUR, wenn das LIVE-Buch ein Rezept trägt, dessen Place-Auflösung über
    // `_placeDispatch` auf "settlement" fällt. Gecacht auf Buch-Identität (wie _forestExtraSpecies).
    _autoSettlementChannelLive() {
        const f = this._foundry;
        const book = f && f.ready && f.recipes;
        if (!book) return false;
        if (this._autoStlChannelBook === book && this._autoStlChannelCache != null) return this._autoStlChannelCache;
        let live = false;
        for (const id in book) {
            if (this._placeDispatch(this._placePolicyFor(book[id]), { id }) === "settlement") {
                live = true;
                break;
            }
        }
        this._autoStlChannelCache = live;
        this._autoStlChannelBook = book;
        return live;
    }
    // Epochen-Legende: jede dritte Siedlung trägt seed-deterministisch eine Epoche der fachwerk-EPOCHEN-
    // Tafel (DP.epoche fixiert Region + Zeit), die übrigen würfelt der Same (Region-Historie). Reine
    // Funktion des Zell-Seeds → der Wege-Rebuild trifft dieselbe Epoche. Das Gesetz ist fachwerk `siedlungsEpoche` (siedlung.K2:
    // der Zensus des Rang-Gesetzes liest dieselbe Legende); fail-closed bei kaltem Kern (`AnazhRealm.Gesetz` bricht laut).
    _siedlungEpoche(seed) {
        return AnazhRealm.Gesetz("fachwerk:siedlungsEpoche")(seed);
    }
    // Eine Dorf-Zelle heben (Gate/Test und Tick teilen den Pfad): reserviert bei Export-ANKUNFT
    // (`worldMeta.settlementCells[key]`), Slots in die budgetierte Queue. Kein Export → nichts markiert.
    _autoSettlementSpawnCell(cx, cz, info) {
        const st = this.state;
        const i2 = info || this._autoSettlementCellInfo(cx, cz);
        if (!i2) return Promise.resolve(null);
        const wm = this._weltMetaDa();
        if (!wm.settlementCells || typeof wm.settlementCells !== "object") wm.settlementCells = {};
        const key = i2.key || cx + "," + cz; // Zell-Infos tragen cx,cz — das Start-Dorf trägt "start"
        const q = this._autoSettlementQueue;
        if (wm.settlementCells[key] || this._autoSettlementPendingKey || (q && q.gang)) return Promise.resolve(null);
        // der Plan und seine Ort-Wahl rechnen, solange die Zelle naht (`_dorfBereiten`) — so lange gilt der Export als
        // unterwegs (der Zug beginnt keine zweite Zelle, die Messung schwingt nicht ein)
        this._autoSettlementPendingKey = key;
        return this._dorfBereiten(key, i2).then((b) => {
            if (this._dorfWeltGing(st, "Zelle " + key)) return null; // die Zelle und ihr Zug gehören der Welt, die sie rief
            this._autoSettlementPendingKey = null;
            this._dorfVorraete.delete(key); // die Zelle ist erwacht: ihr Vorrat ist verbraucht
            if (!b) return null; // fail-closed (Foundry kalt)
            // DER ORT WIRD WELT: die Wahl steht im Gedächtnis des Orts (`_ortPlaene`), der Anker rückt an den Ort des Plans;
            // sein Erdbau und seine Schichten gehen als Gang des Zugs (`_dorfErwachen`) vor dem ersten Haus
            const anchor = Object.assign({}, b.anker);
            const ort = AnazhRealm._ortSchluessel(b.plan, anchor);
            const v2 = this._ortPlanSetzen(b.plan, anchor, false);
            // Die Reservierung IST das Gedächtnis des Orts {seed, nH, x, z, wx, wz, ort}: aus ihm kehrt er nach jedem Reload
            // wieder (`_tickAutoSettlement`) — Häuser, Erdbau (Schlüssel `ort`) und Schichten trägt der Stand nie (speicher.K3);
            // wx/wz der Ort der Trasse (siedlung.K3): die Wiederkehr fragt den Export dort, wo seine Gassen lagen.
            // Alle Leser fragen nur Existenz (truthy).
            wm.settlementCells[key] = {
                seed: i2.seed,
                nH: i2.nH,
                x: anchor.x,
                z: anchor.z,
                wx: b.anker.x,
                wz: b.anker.z,
                ort,
                wachs: this._ortWachsAnfang(v2),
            };
            this._autoSettlementQueue = this._dorfZug(
                v2,
                anchor,
                key,
                this._dorfErwachen(v2, anchor, ort, key, b.wasser)
            );
            return v2;
        }, this._ortWahlWartet(key));
    }
    // DAS ERWACHEN IN RATEN (stadt-erwachen, Lehre 14): der Gang des Zugs einer Zelle, je Takt EIN Schritt — EIN Schritt legt
    // den Erdbau (`_erdbauSetzen` unter dem Schlüssel des Orts `ort`, mit dem Wasser-Urteil `w` des Vorlaufs), einer normt die
    // Welt mit ihm (`_erdbauLage`); dann liegt der Grund (`yield true`), und die Schichten (`_dorfErlebnis`) gehen in den Takten
    // zwischen den Häusern (`_dorfZugSchritt`). Bis stadt-erwachen trug der Rückruf des Erwachens alles: nH 300 192 ms synchron,
    // das Bild 461–469 ms (GTX 22.10.).
    // DAS NÄCHSTE HAUS ZUERST (stadt-erwachen-2, Lehre 25): bis hier gingen das Urteil (3 Raten), der Erdbau und ALLE Schichten
    // (Wege, 4 Laternen-Raten, Ausstattung) vor dem ersten Haus — nH 300 hob das nächste im Takt 13, an der GTX gezeichnet nach
    // 4,67–4,82 s (vorher 0,65 s). Ohne Vorlauf (Teleport, Start-Dorf) fällt das Urteil hier, in Raten vor dem Eintrag.
    *_dorfErwachen(v2, anchor, ort, key, w, so) {
        while (!this._dorfWasserSchritt(w)) yield;
        this._erdbauSetzen(ort, v2.erdbau, w.nass, true);
        if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
        yield;
        this._erdbauLage(); // die Normalform der Welt mit dem neuen Ort (ihr erster Leser zahlte sie)
        yield true;
        yield* this._dorfErlebnis(v2, { x: anchor.x, z: anchor.z }, Object.assign({ key }, so));
    }
    // Der Grund eines Vorrats, der nie erwachte (der Spieler ging, `_tickAutoSettlement`), fällt mit ihm — der Ort liegt
    // nur als Welt, wenn er erwacht; kehrt der Spieler zurück, legt der neue Vorrat ihn wieder.
    _dorfVorratGrundFaellt(w) {
        const wm = this.state.worldMeta;
        const splats = w.grund && wm && wm.erdbau ? wm.erdbau[w.ort] : null;
        if (!Array.isArray(splats)) return false;
        const ohne = [];
        let i = 0;
        for (const k of Object.keys(wm.erdbau)) {
            const l = wm.erdbau[k];
            if (!Array.isArray(l)) continue;
            if (k === w.ort) for (let j = 0; j < l.length; j++) ohne.push(i + j);
            i += l.length;
        }
        delete wm.erdbau[w.ort];
        this._erdbauWirkt(splats, w.wasser.nass, { erdbauOhne: ohne });
        w.grund = false;
        return true;
    }
    // DAS WASSER-URTEIL DES ERDBAUS IM VORLAUF (Lehre 14: im Idle vorgebacken): ändert der Erdbau des Plans v2 (seine Splats
    // `erdbau`) den Grund an gezeichnetem Wasser (`_erdbauAmWasser` VOR dem Eintrag)? Ein Gang in Raten — die Normalform, dann je
    // Rate `AUTO_SETTLEMENT.wasserZellenJeTakt` Zellen —, den der Takt im Vorlauf-Ring treibt (`_tickAutoSettlement`) und
    // der Gang des Erwachens zu Ende geht, falls die Zelle ohne Vorlauf erwacht. Rückgabe { gang, nass } (nass: undefined offen).
    _dorfWasserUrteil(erdbau) {
        const realm = this;
        const gang = (function* () {
            const E = erdbau ? globalThis.__gelaendeCore.erdbauNormal(erdbau) : null;
            yield;
            const n = AnazhRealm.AUTO_SETTLEMENT.wasserZellenJeTakt;
            for (let ab = 0; E && ab < E.zellen.size; ab += n) {
                const nass = realm._erdbauAmWasser(E, ab, n);
                yield;
                if (nass) return true;
            }
            return false;
        })();
        return { gang, nass: undefined };
    }
    // EINE Rate des Urteils `w` (`_dorfWasserUrteil`); true, sobald es steht
    _dorfWasserSchritt(w) {
        if (w.nass === undefined) {
            const s = w.gang.next();
            if (s.done) w.nass = s.value;
        }
        return w.nass !== undefined;
    }
    // OHNE ORT-WAHL (der Ort-Faden steht noch nicht: der Sandbox-Weg holt die Quelle des Voxel-Fadens, `_nebenFaden`) fragt der
    // nächste Takt neu — ein Wurf des Fadens meldet sich dort laut beim Namen (`_bruchMelden`). Der Rückruf der Zell-Kette und
    // des Vorlaufs.
    _ortWahlWartet(key) {
        return (e) => {
            if (this._autoSettlementPendingKey === key) this._autoSettlementPendingKey = null;
            if (this._dorfVorraete) this._dorfVorraete.delete(key);
            this.log(`ORT: die Zelle ${key} wartet auf die Ort-Wahl — ${(e && e.message) || e}`, "INFO");
            return null;
        };
    }
    // DAS DORF IM VORLAUF (siedlung.K5): der Export und die Ort-Wahl einer Zelle rechnen, sobald sie in den Vorlauf-Ring
    // tritt (`AUTO_SETTLEMENT.vorlaufM` vor `nearM`), im Foundry- und im Ort-Faden — ihr Erdbau liegt erst, wenn sie
    // erwacht (`_autoSettlementSpawnCell`). Bis K5 begann beides beim Erwachen: der Export baut jedes Haus zur Probe (der
    // Mass-Bau misst die Welt-Box, die das Layout braucht), das erste Haus der Zelle wartete mit nH (Export nH 12 0,29 s,
    // nH 300 2,0 s). EIN Vorrat JE ZELLE (`_dorfVorraete`, Karte vorrat-pingpong): ein Ruf mit demselben Schlüssel nimmt ihn, das
    // Erwachen der Zelle verbraucht ihn. Mit EINEM Vorrat zur Zeit lösten zwei Zellen im Vorlauf-Ring einander ab, jede fertige
    // rechnete im nächsten Takt neu (Messort dorf, −3,−5 ↔ −5,−3: die Welt stand nie). Rückgabe: Promise {plan, anker} | null.
    _dorfBereiten(key, i2) {
        const M = this._dorfVorraete || (this._dorfVorraete = new Map());
        if (M.has(key)) return M.get(key).fertig;
        const v = { da: false, x: i2.x, z: i2.z, mehrM: i2.mehrM || 0, nH: i2.nH }; // nH: sein Reich vor dem Plan (`_ortInArbeit`)
        // DER ORT DER WELT IST EINE FUNKTION (Lehre 7): der Wunsch ist der Ort der Zelle, die Ort-Wahl fragt keinen Spieler
        // (`frei` null) — wer ihn berührt, wartet im Zug (`_dorfZugSchritt`). Bis stadt-erwachen rückte das Dorf vor den
        // Spieler (`_siedlungsAnker`), sobald er im Vorlauf in seiner Reichweite stand: nH 300 reicht 422 m, der Vorlauf
        // beginnt bei 420 m — der Anker folgte seinem Schritt (GTX 22.10.: −835,27 ≠ −835,10 zwischen zwei Boots).
        const dp = { seed: i2.seed, nH: i2.nH, ...this._zellEingang(key, i2.seed) }; // die Epochen-Legende (V18.488), im Viertel die Zeit seiner Stadt
        v.fertig = this._ortMitTrasse(dp, i2, null, key === "start", !!i2.fest).then((b) => {
            if (!b || !b.plan) {
                if (M.get(key) === v) M.delete(key); // der nächste Takt fragt neu — eine Trasse ohne Ruhe trägt kein Dorf
                if (b && this._autoSettlementRejected) this._autoSettlementRejected.add(key);
                return null;
            }
            const anker = { x: b.ort.x, y: 0, z: b.ort.z };
            const v2 = this._ortPlaene.get(AnazhRealm._ortSchluessel(b.plan, anker));
            v.wasser = this._dorfWasserUrteil(v2 ? v2.erdbau : null);
            v.v2 = v2;
            v.ort = AnazhRealm._ortSchluessel(b.plan, anker);
            // der Vorrat steht am Ort der Wahl (die Trasse rückt ihn bis 128 m): jeder Abstand des Takts misst ab hier
            [v.x, v.z] = [anker.x, anker.z];
            v.da = true;
            return { plan: b.plan, anker, wasser: v.wasser };
        });
        M.set(key, v);
        return v.fertig;
    }
    // DIE TRASSE AM ORT DES PLANS (siedlung.K3): der Export liest das Höhen-Raster um `ort` (`_foundryRequestSettlement`), die
    // Ort-Wahl (`_ortWahl`, ohne Erdbau) rückt den Plan bis 128 m an den nächsten Ort, der jedes Haus trägt — dort folgten seine
    // Gassen dem Grund des Wunschs (Node, vier Saaten: Gefälle p95 am Ort des Rasters 5,7–9,3 %, 16 m daneben bis 23,7 %).
    // Rückt die Wahl, rechnet der Export am gewählten Ort neu (sein Mass-Bau kommt aus dem Gedächtnis des Studios), bis die Wahl
    // am Ort ihres Rasters bleibt (56 Zellen um den Mess-Ort dorf: 37 im ersten Lauf, 15 im zweiten, 4 im dritten oder vierten).
    // Rückgabe: Promise { plan, ort } — der Plan v2 steht unter `_ortSchluessel(plan, ort)` —, null bei kalter Foundry; bleibt die
    // Wahl in `ORT_WAHL.trasseRunden` Läufen nicht, ist `plan` null, laut: kein Plan auf fremdem Grund.
    async _ortMitTrasse(dp, wunsch, frei, kopf, fest) {
        const mass = (this._ortTrasseMass = { runden: 0, versatzM: [] });
        let ort = { x: wunsch.x, z: wunsch.z };
        // die Wahl ist unberührt, wenn es jede ihrer Runden war (`_ortWahlUnberuehrt`, `_ortReistNicht`)
        let unberuehrt = true;
        for (; mass.runden < AnazhRealm.ORT_WAHL.trasseRunden;) {
            const plan = await this._foundryRequestSettlement(Object.assign({}, dp, { ort }), kopf);
            if (!plan || !Array.isArray(plan.slots)) return null;
            mass.runden++;
            const o = { x: ort.x, z: ort.z };
            // DER ORT, DER SCHON WELT IST (sein Erdbau liegt, `worldMeta.erdbau`: der zweite Akt am Anker des ersten), trägt kein
            // zweites Dorf aus dem Gedächtnis: die Wahl rechnet neu, und der Wirt weist jeden Ort ab, an dem ein Haus des
            // ersten steht (`_ortTraegtWirt`). Bis siedlung-k3-heil hob der Akt den stehenden Plan ein zweites Mal — sein Zug
            // wartete ohne Ende auf den Slot unter dem Spieler (gate:haus-welt W7: 900 s), jeder abgewiesene Slot nähme dem
            // stehenden Haus den Grund (`_erdbauGrundFaellt`).
            const wm = this.state.worldMeta;
            if (wm && wm.erdbau && wm.erdbau[AnazhRealm._ortSchluessel(plan, ort)] && this._ortPlaene)
                this._ortPlaene.delete(AnazhRealm._ortSchluessel(plan, ort));
            await this._ortWahl(plan, o, false, frei, fest); // `fest`: die Kachel einer Stadt steht an ihrem Platz (die Wahl rückt sie nie)
            const U = this._ortWahlUnberuehrt;
            const v2 = this._ortPlaene.get(AnazhRealm._ortSchluessel(plan, ort));
            unberuehrt = unberuehrt && !!U && U.has(v2);
            if (o.x === ort.x && o.z === ort.z) {
                if (!unberuehrt && U) U.delete(v2);
                return { plan, ort };
            }
            mass.versatzM.push(+Math.hypot(o.x - ort.x, o.z - ort.z).toFixed(1));
            this._ortPlaene.delete(AnazhRealm._ortSchluessel(plan, ort)); // ihr Plan v2 wird nie Welt
            ort = o;
        }
        this.log(
            `ORT: die Trasse des Plans (Same ${dp.seed}) bleibt nach ${mass.runden} Läufen nicht an ihrem Ort ` +
                `(${mass.versatzM.join(" · ")} m) — kein Plan auf fremdem Grund`,
            "WARN"
        );
        return { plan: null, ort };
    }
    // DAS ERSTE HAUS STEHT SOFORT (siedlung.K5, Lehre 14: im Idle vorgebacken): ist der Vorrat einer Zelle bereit, bestellt der Takt
    // die Studio-Stufen der `AUTO_SETTLEMENT.vorbackHaeuser` Häuser, die der Zug zuerst hebt, am Auge ihres Erwachens (der Ring
    // `nah` auf dem Weg vom Spieler zum Anker) — in der Mesh-Zone die Stufe, die die Kette dort wählt (`_foundryLodForEntry` am
    // Auge), dahinter die Fernform des Gesetzbuchs — über DENSELBEN Chokepoint wie das gesetzte Haus (`_foundryFlattenFor`).
    // Bis hier bestellte erst das gesetzte Haus, nach dem Erdbau, und der Faden trug fremde Aufträge: das erste Haus stand nach
    // 148–518 ms (nH 12, Hülle) bzw. 474–800 ms (nH 300, Mesh; Radeon, Station dorf), vorgebacken nach 42–59 bzw. 119–294 ms.
    // DIE REIHE DES ZUGS (sk5-haus): vorgebacken wird, was der Zug zuerst hebt — seine Reihe (`_dorfZug`: die Mitte im Schirm, dann
    // nah) am Auge des Erwachens, mit dem Blick von JETZT, neu je `AUTO_SETTLEMENT.vorbackNeuM` Weg, bis die Zelle erwacht; nie
    // eine eigene nach dem Abstand zum Auge. Bis sk5-haus lagen gebacken die vier nächsten (nH 300, gate:settlement C-K5: 13,7–23,6 m außer
    // Schirm), der Zug hob das Haus 117,7 m in der Mitte des Schirms — das erste Haus wartete 11 Takte auf die Foundry-Schlange.
    // Rückgabe: ob jede Stufe steht (der Takt fragt bis zum Erwachen neu).
    _dorfVorbacken(w, p) {
        const f = this._foundry;
        if (!w.v2 || !f || !f.recipes) return false;
        const A = AnazhRealm.AUTO_SETTLEMENT;
        if (!w.vorback || Math.hypot(p.x - w.vorbackBei.x, p.z - w.vorbackBei.z) >= A.vorbackNeuM) {
            w.vorbackBei = { x: p.x, z: p.z };
            const o = w.v2.ort;
            const d = Math.hypot(p.x - o.x, p.z - o.z) || 1;
            const k = (A.nearM + (w.mehrM || 0)) / d;
            const auge = { x: o.x + (p.x - o.x) * k, z: o.z + (p.z - o.z) * k };
            const d2 = (e) => (e.position.x - auge.x) ** 2 + (e.position.z - auge.z) ** 2;
            const haeuser = [];
            const reihe = this._dorfZug(w.v2, o, null, null, auge).reihe;
            for (const si of reihe) {
                const sl = w.v2.slots[si];
                const type = this._slotBauplan(sl, f);
                const position = { x: o.x + sl.x, y: sl.y + 0.5, z: o.z + sl.z };
                if (type)
                    haeuser.push({ type, seed: sl.seed >>> 0, position, studioOv: AnazhRealm._stempelVon(sl.ov) });
                if (haeuser.length >= A.vorbackHaeuser) break;
            }
            const R = this.state.architectureCullingRadius;
            [w.vorback, w.vorbau] = [[], []];
            const je = new Set();
            const bestelle = (e, preset, lod, L = w.vorback) => {
                const k = preset + ":" + e.seed + ":" + lod + ":" + JSON.stringify(e.studioOv || null);
                if (!je.has(k)) (je.add(k), L.push([e, preset, lod]));
            };
            for (const e of haeuser) {
                const preset = this._foundryPresetForEntry(e);
                const fern = d2(e) > R * R;
                if (preset)
                    bestelle(e, preset, fern ? this._foundryFernStufe(preset) : this._foundryLodForEntry(e, auge));
            }
            // JEDE GESTALT DES ORTS IN DER STUFE IHRES BEDARFS (w13-dorf-strom): dahinter bestellt der Vorrat für jedes Haus des
            // Plans (in der Reihe des Zugs) und jedes Stück seiner Ausstattung, das das Erwachen hebt (Laternen an Mast und Wand,
            // Brunnen, Stände: `_dorfErlebnis`, `_spawnSettlementSlot`, ihre Samen `_ausstattungSame`), die Stufe, die es braucht,
            // wenn die Bahn es in die Mesh-Zone holt — am Auge `R` vor ihm auf dem Weg zum Spieler (der Ort seines Eintritts) —,
            // und nur, wenn sie es dorthin holt (`_bedarfZeit` endlich: im Stand und seitab keine; ein Horizont von 30 s holte die
            // Häuser von −4,−4 im Sprint zu spät, 1 von 4 Fahrten GT 120 Lücken-Bilder). Die Foundry rangiert jede nach der Zeit
            // bis Bedarf. Bis w13-dorf-strom backte der Vorrat vier Häuser in der Fernform, die Mesh-Stufe bestellte erst
            // der Vorlauf der Bahn (3 s vor der Zone): im GT standen die Häuser von −5,−3 erst 10,3–11,7 s nach dem Erwachen,
            // 81–139 m vor dem Spieler, die Marktstände von −4,−4 traten ungezeichnet in 150 m ein.
            const bedarf = (e) => {
                const preset =
                    this._bedarfZeit(e.position.x, e.position.z, R) < Infinity && this._foundryPresetForEntry(e);
                if (!preset) return;
                const dh = Math.hypot(p.x - e.position.x, p.z - e.position.z) || 1;
                const k2 = Math.min(1, R / dh);
                const ein = {
                    x: e.position.x + (p.x - e.position.x) * k2,
                    z: e.position.z + (p.z - e.position.z) * k2,
                };
                bestelle(e, preset, this._foundryLodForEntry(e, ein), w.vorbau);
            };
            for (const si of reihe) {
                const sl = w.v2.slots[si];
                const type = this._slotBauplan(sl, f);
                if (type)
                    bedarf({
                        type,
                        seed: sl.seed >>> 0,
                        position: { x: o.x + sl.x, y: sl.y + 0.5, z: o.z + sl.z },
                        studioOv: AnazhRealm._stempelVon(sl.ov),
                    });
            }
            const [plan, bp] = [w.v2, this.state.blueprints || {}];
            const stuecke = [];
            let mast = 0;
            (plan.laternen || []).forEach((l, k) => {
                if (l) stuecke.push([l.wand ? "wandlaterne_dorf" : "laterne_dorf", l, l.wand ? k : mast++, "laterne"]);
            });
            for (const Z of this._ortStuecke(plan)) {
                Z.liste.slice(0, Z.kappe).forEach((q, k) => stuecke.push([Z.bauplan, q, k, Z.art]));
                for (const [q, k] of Z.amHaus) stuecke.push([Z.bauplan, q, k, Z.art]);
            }
            for (const [type, q, k, art] of stuecke)
                if (bp[type] && q && Number.isFinite(q.x) && Number.isFinite(q.z))
                    bedarf({
                        type,
                        seed: this._ausstattungSame(plan, art, k),
                        position: { x: o.x + q.x, y: 0, z: o.z + q.z },
                        ...(Number.isInteger(q.gestalt) ? { studioOv: { __gestalt: q.gestalt } } : null),
                    });
        }
        // bis jede Stufe steht: ein Flat setzt sich erst aus seinen Teilen zusammen (der Schatten-Zwilling bestellt sich dabei);
        // was steht, fragt der Takt nicht mehr (Lehre 25). Vorgebacken heißt: die Stufen am Auge des Erwachens stehen — die
        // Stufen des Bedarfs (`vorbau`) gehen daneben, die Foundry rangiert sie nach der Zeit bis Bedarf.
        const offen = ([e, preset, lod]) => this._foundryFlattenFor(e, preset, lod) === null;
        [w.vorback, w.vorbau] = [w.vorback.filter(offen), w.vorbau.filter(offen)];
        return !w.vorback.length;
    }
    // Der Bauplan eines Slots: das Präfix seiner Studio-Art (KIND_POLICY) vor seiner Kultur, wenn die Welt ihn kennt — sonst null.
    // Leser: die Slot-Quelle (`_spawnSettlementSlot`) und der Vorrat (`_dorfVorbacken`).
    _slotBauplan(slot, f) {
        const rec = f && f.recipes ? f.recipes[slot.kultur] : null;
        const pol = rec && AnazhRealm.KIND_POLICY[rec.kind];
        const name = pol && pol.prefix ? pol.prefix + slot.kultur : null;
        return name && this.state.blueprints[name] ? name : null;
    }
    // DER RANG DES ZUGS (siedlung.K5): die Häuser eines Plans heben in der Reihe ihres Abstands zum Spieler (`reihe`, das
    // nächste zuerst, gleich weit die Slot-Folge) — bis K5 in der Slot-Folge des Layouts, die vom Kern des Dorfs nach außen
    // wächst: wer am Rand ankam, sah das Dorf hinten beginnen. `idx` zählt die gehobenen.
    // DER SCHIRM ZUERST (siedlung-k5-nah, Gebot 7): die Häuser, die der Schirm beim Erwachen zeigt (`_imErstenBlick` ohne
    // Rand, der Grundriss als Radius), heben vor jedem außer Schirm — in beiden Hälften das nächste zuerst. Bis hier hob der
    // Abstand allein: Radeon nH 300 (Station dorf, M36) hob das nächste Haus 19,6 m neben dem Spieler bei 81° außer Blick
    // nach 60 ms, das erste im Schirm erst im fünften Zug-Schritt (über dem Budget je 8 Bilder einer), gezeichnet nach 553 ms.
    // DIE MITTE IM SCHIRM ZUERST (siedlung-k5-erstes-haus): drei Hälften, in jeder das nächste zuerst — das Haus, dessen Mitte
    // der Schirm zeigt (`_imErstenBlick` am Punkt), dann das, dessen Grundriss den Bildwinkel nur streift, dann jedes außer
    // Schirm. Bis hier galt die Scheibe des Grundrisses allein: am Plan der Trasse (siedlung-k3-heil) hob der Zug an der Radeon
    // (M36 nH 300, über dem Budget ein Haus im ersten Schritt) zuerst eins 11,3 m neben dem Spieler bei 70° (Mitte außer
    // Blick), das erste im Kegel im 20. Takt — gezeichnet nach 954 ms (vorher 134 ms).
    // Der Akt (`_spawnSettlementFromExport`) und der Zug nach dem Reload (`_dorfZugOffen`) heben in DERSELBEN Reihe, der Vorrat
    // backt sie vor (`_dorfVorbacken`).
    // EIN SCHRITT DES ZUGS `q`: die nächsten Slots seiner Reihe bis zur EINEN Frist der Bau-Arbeit (`_bauFrist("dorf")`, vor
    // jedem Haus gefragt), mindestens EIN Haus je Schritt (die Takt-Garantie jedes Bauers); unter dem Ladeschirm ist sie die
    // Frist des Lade-Frames (K60-2: die Häuser der Ankunft gehören ins erste Weltbild, Term „dorf"), je Slot mit seinen
    // Wandlaternen (K66-2). Ihn fahren der Takt (`_tickAutoSettlement`, der Bauer „dorf" am Tor, `TAKT_BAUER`) und der Akt
    // (`_spawnSettlementFromExport`). Rückgabe: je gehobenem Slot das Haus oder false.
    // DER ZUG IST EIN BAUER DER EINEN FRIST (w28-stadt-netz): bis hier bremste ihn `_frameOverBudget` (über dem Budget ein Haus
    // je 8 Takte), darunter trug er `perTick` 2 Häuser bis zu einer eigenen ms-Kappe (`taktMs` 8) — eine Uhr neben der Frist.
    // Die Netz-Stadt zeichnet leicht, das Budget riss nie, und der Zug hob ungebremst: GTX, Gang 4 m/s durch drei Kacheln,
    // 203 Schritte zu 44 ms (2,9 Häuser je Bild), das Bild während des Zugs 158–167 ms in der Mitte.
    // DER GANG ZUERST (stadt-erwachen): trägt der Zug den Gang seines Erlebnisses (`q.gang`, `_dorfErlebnis`), geht der Schritt
    // dessen Raten bis zur selben Frist (mindestens eine) und kein Haus. DER SPIELER IM GRUND: die
    // Ort-Wahl der Welt fragt ihn nie (Lehre 7) — ein Slot, dessen Grundriss samt `STRUCTURE_PLAYER_CLEAR_MARGIN` ihn berührt,
    // rückt ans Ende der Reihe; berührt ihn jeder offene, wartet der Zug, bis er geht.
    _dorfZugSchritt(q) {
        const f = this._foundry;
        const neu = [];
        // DAS NÄCHSTE HAUS ZUERST (stadt-erwachen-2): bis der Grund liegt (`yield true` des Gangs) geht der Gang allein; danach
        // trägt ein Takt die Häuser, der nächste Raten des Gangs (die Schichten), im Wechsel — der Takt, der den Grund
        // legte, hebt schon das nächste Haus; ohne offenes Haus geht der Gang jeden Takt
        const frei = !!q.frei;
        // die Uhr des Zugs (`_dorfRateMessen`): ab seinem ersten Schritt; ohne Frist (Null-Renderer, ruhender Loop, Ladeschirm) misst er nicht
        if (q.t0 === undefined) q.t0 = performance.now();
        if (!q.ohneUhr && (this._bauFristOhneEnde() || this._ladeTakt())) q.ohneUhr = true;
        if (q.gang && (!frei || q.gangDran || q.idx >= q.plan.slots.length)) {
            q.gangDran = false;
            for (let n = 0; q.gang && (performance.now() < this._bauFrist("dorf") || n === 0); n++) {
                const s = q.gang.next();
                if (s.done) q.gang = null;
                else if (s.value === true) {
                    q.frei = true;
                    break;
                }
            }
            if (frei || !q.frei) return neu;
        }
        q.gangDran = !!q.gang;
        const pm = this.state.playerMesh;
        const M = AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN;
        q.spielerSperrt = false;
        let warten = 0;
        for (
            ;
            q.idx < q.plan.slots.length &&
            warten < q.plan.slots.length - q.idx &&
            (performance.now() < this._bauFrist("dorf") || neu.length === 0);
        ) {
            const sl = q.plan.slots[q.reihe[q.idx]];
            const fp = this._grundrissVon(sl);
            const p = pm && pm.position;
            // der Zug, der wiederkehrt (`q.wieder`), hebt das Haus, das schon stand, als der Spieler kam — auch um ihn
            if (
                fp &&
                p &&
                !q.wieder &&
                Math.hypot(p.x - q.origin.x - sl.x, p.z - q.origin.z - sl.z) < Math.hypot(fp.ex, fp.ez) + M
            ) {
                q.reihe.push(q.reihe.splice(q.idx, 1)[0]);
                q.gewartet = true; // er wartet auf den Spieler: seine Uhr misst keine Rate (`_dorfRateMessen`)
                warten++;
                continue;
            }
            const si = q.reihe[q.idx++];
            // (die gefallenen Lose wohnen am Plan, `plan.gefallen`: die Zeile der Gründung und gate:kreatur-takt zielplan lesen sie —
            // nicht aufzählbar: der Plan bleibt byte-gleich mit dem des Gesetzbuchs, gate:settlement O „Plan-Hash Studio = Welt")
            if (!q.plan.gefallen) Object.defineProperty(q.plan, "gefallen", { value: [], enumerable: false });
            const so = Object.assign({ plan: q.plan, si, gefallen: q.plan.gefallen }, q.so);
            neu.push(this._spawnSettlementSlot(sl, q.origin, f, so));
        }
        // JEDER offene Slot wartet auf den Spieler (er steht in ihrem Grund): der Schritt hob nichts — der Akt liest es
        // (`_spawnSettlementFromExport`), der Takt-Zug wartet weiter, bis er geht
        q.spielerSperrt = neu.length === 0 && q.idx < q.plan.slots.length && warten >= q.plan.slots.length - q.idx;
        return neu;
    }
    // DIE GEMESSENE RATE DES ZUGS (w28-stadt-netz): Häuser je Sekunde der Wanduhr vom ersten Schritt eines Zugs bis zu seinem
    // letzten — samt dem, was ein Haus nach sich zieht (Grund, Wege, Schichten: der Gang geht in derselben Frist). Gemittelt
    // über die Züge (je zur Hälfte); ein Zug ohne Frist (Null-Renderer, ruhender Loop, Ladeschirm), ein kleiner (unter 8
    // Häusern) und einer, der auf den Spieler in seinem Grund wartete, misst nicht. Leser: der Vorlauf der Orte (`_dorfBauZeit`).
    _dorfRateMessen(q) {
        const n = q.plan.slots.length;
        const s = (performance.now() - q.t0) / 1000;
        if (q.ohneUhr || q.gewartet || !(n >= 8) || !(s > 0)) return;
        this._dorfRate = this._dorfRate ? (this._dorfRate + n / s) / 2 : n / s; // Instanz-Feld (die _editSaveTimer-Klasse)
    }
    // DIE ERWARTETE BAU-ZEIT eines Orts mit `nH` Häusern in s: seine Häuser und der Rest des offenen Zugs durch die gemessene
    // Rate (`_dorfRateMessen`) — ohne Messung 0 (der Vorlauf der Bahn gilt, `_autoSettlementZelle`).
    _dorfBauZeit(nH) {
        const R = this._dorfRate;
        if (!(R > 0)) return 0;
        const q = this._autoSettlementQueue;
        return ((q && q.plan ? q.plan.slots.length - q.idx : 0) + nH) / R;
    }
    // `auge` (der Vorrat, `_dorfVorbacken`): die Reihe, wie sie der Spieler am Ring des Erwachens sieht — der Blick ist
    // verschiebe-gleich (`_imErstenBlick` misst vom Auge der Kamera), das Haus rückt um das, was dem Auge zum Spieler fehlt.
    _dorfZug(plan, origin, cellKey, gang, auge) {
        const pm = this.state.playerMesh;
        const p = auge || (pm ? pm.position : origin);
        const [vx, vz] = pm && auge ? [pm.position.x - auge.x, pm.position.z - auge.z] : [0, 0];
        const aus = AnazhRealm.ERSTER_BLICK.ausserD2;
        const rang = plan.slots.map((s) => {
            const x = origin.x + s.x;
            const z = origin.z + s.z;
            const d2 = (x - p.x) ** 2 + (z - p.z) ** 2;
            if (!pm || !Number.isFinite(d2)) return d2;
            if (this._imErstenBlick(x + vx, z + vz, 0, true)) return d2;
            const fp = this._grundrissVon(s);
            return this._imErstenBlick(x + vx, z + vz, fp ? Math.hypot(fp.ex, fp.ez) : 0, true)
                ? d2 + aus
                : d2 + 2 * aus;
        });
        const reihe = plan.slots.map((_s, i) => i).sort((a, b) => rang[a] - rang[b] || a - b);
        return { plan, origin: { x: origin.x, z: origin.z }, idx: 0, reihe, cellKey, gang: gang || null };
    }
    // Der Worldgen-Konsument des "settlement"-Kanals (N5.7-AUTO: Dörfer entstehen von selbst — seed-deterministische Zellen,
    // Site-Wände, Häuser in Raten) ist der Bauer „dorf" am Tor des Takts (`TAKT_BAUER`, `_runFrameScheduler`).
    // DER GENESIS-ORT VOR JEDEM BUDGET (Existenz vor Framerate, Lehre 13): der Ring der Kern-Portale (einmalig je Welt,
    // Schöpfer 17.07.) und die Portal-Vorschauen (GT, Haus, Esse, Tor; nur bei Tor-Nähe, frühes Await-Book) stehen in
    // ihrem eigenen Takt (1×/s), nie hinter den Dorf-Akten. Bis 06.10. lagen sie im Siedlungs-Takt hinter
    // `_frameOverBudget` (und der Siedlungs-Takt im Deko-Job, der bei leerem Budget wartet): auf der echten GPU (Radeon
    // 890M, frische Welt) war das Budget in 160 von 160 Proben über 40 s überschritten — kein Ring, kein GT am Ring, der
    // v1-Schritt 6 ohne Wagen. Unter dem Haken des Orts ruht er wie der Siedlungs-Takt (`_dorfTaktLebt`).
    _tickGenesisOrt(currentTime) {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !this._dorfTaktLebt()) return;
        // 1×/s der Welt-Uhr (w28-welt-uhr): bis hier stand `< 1000` gegen Sekunden — der Ort setzte seine ersten Elemente und
        // dann ~17 min nichts, und kam der Plan aus dem Faden nach dem ersten Takt, stand er ~17 min gar nicht (wie die Tür, 0710-11)
        if (this._genesisOrtT !== undefined && currentTime - this._genesisOrtT < 1) return;
        this._genesisOrtT = currentTime; // Instanz-Feld (die _editSaveTimer-Klasse: nicht serialisiert)
        this._genesisOrt(pm.position);
    }
    // DER GENESIS-ORT, EIN Glied (Pflicht F, der Prüfplatz): was der Ort je Takt setzt — der Spiel-Takt (`_tickGenesisOrt`) und
    // das Instrument (haushalt.json genesis `ortTakt`, werkbank `__ortSchritt`) rufen dasselbe Glied. Der Wirt LIEST nur den Plan
    // der Welt (`_genesisPlan`, aus dem Faden): je Element EIN Eintrag mit eigener id, idempotent über die Existenz-Probe, in der
    // Folge der Ankunft (`_genesisWerke`), höchstens `GENESIS_JE_TAKT` neue Einträge je Takt (Lehre 25); die Vorschauen erst vor
    // ihrem Tor (`_genesisVorschau`). Stehen alle Tore, trägt `worldMeta.genesisOrt.steht` es (die Prüfbühne der Werkbank wartet
    // darauf). DIE ABSAGE DER WURZEL ist laut und gezählt: ein Element, dessen Bau die Wurzel absagt (ihr Grund, `SETZ_GRUND`: die
    // Tat des Spielers, das Wasser, ein unbekannter Bauplan), steht nicht, zählt nie als Tor und meldet sich beim Namen über den
    // EINEN Melder; `_genesisAbsagen` (id → Grund) ist der Zähler. Bis hierher buchte der Wirt eine Absage still als fertig und
    // als stehendes Tor und meldete danach „die 10 Tore stehen". Bis zum Plan stellte der Wirt einen Ring der Kern-Portale aus der
    // Reihenfolge der Baupläne (R 11, Sehne 6,9 m) um eine Stein-Scheibe und die Vorschauen aus einer eigenen Tafel.
    _genesisOrt(playerPos) {
        const plan = this._genesisPlan;
        if (!plan || !playerPos) return;
        // DER BELAG: jede Fläche des Plans mit ihrem Belag (fachwerk `zonen` · `belag`: das Kopfstein des Stein-Gesetzes, der Rasen
        // des Gras-Gesetzes, die getretene Erde) geht EINMAL in die EINE Wege-Karte (`_stlWegeBuild`, Schlüssel „genesis") — der
        // Boden zeichnet sie, die Wiese, die Streu und die Natur-Wand lesen dieselben Bytes. Bis hierher baute der Wirt den Kern als
        // 2-cm-Straße und die Terrasse aus Gesetz-Konstanten, jede Fläche als Erde, die Rasen-Keile ohne Leser: der Platz lag braun.
        this._stlWegeBuild({ zonen: plan.zonen }, plan.ort, "genesis");
        this._genesisVorschau(plan, playerPos);
        const fertig = this._genesisWerkeFertig || (this._genesisWerkeFertig = new Set());
        const abgesagt = this._genesisAbsagen || (this._genesisAbsagen = new Map());
        let budget = AnazhRealm.GENESIS_JE_TAKT;
        let tore = 0;
        let toreDa = 0;
        for (const w of this._genesisWerke(plan, playerPos)) {
            if (w.art === "tor") tore++;
            if (abgesagt.has(w.id)) continue;
            if (fertig.has(w.id)) {
                if (w.art === "tor") toreDa++;
                continue;
            }
            if (budget <= 0) break;
            const z = this._genesisWerkSetzen(w, plan);
            if (z === "warte") continue;
            if (z !== "steht" && z !== "gesetzt") {
                abgesagt.set(w.id, z);
                this._bruchMelden(
                    `GENESIS-ORT: ${w.id} (${w.typ}) steht nicht — die Wurzel sagte ab: ${z} (${AnazhRealm._tIn("de", AnazhRealm.SETZ_GRUND[z] || AnazhRealm.SETZ_GRUND.unbenannt)}); ${abgesagt.size} Elemente des Plans abgesagt`
                );
                continue;
            }
            fertig.add(w.id);
            if (w.art === "tor") toreDa++;
            if (z === "gesetzt") budget--;
        }
        const g = this.state.worldMeta && this.state.worldMeta.genesisOrt;
        if (g && !g.steht && tore === plan.tore.length && toreDa === tore) {
            g.steht = true;
            this.log(`GENESIS-ORT: die ${tore} Tore stehen auf ihren Slots.`, "INFO");
        }
    }
    // DIE ELEMENTE DES PLANS, die jetzt fällig sind, in der Folge der Ankunft (die Lade-Reihenfolge des Prüfplatzes): S1 (vor
    // der Kontrolle, ≤ `residentM` um die Mitte) die Tore, die Kern-Werke (die Laternen von Kern und Wache, die Bänke — alle
    // außerhalb des Ankunftskegels) und die Allee; S2 nach der Kontrolle (`_weltbildDa`) der Brunnen, die Laternen von Terrasse
    // und Wiese, der Fels, der Arten-Saum und das Bootshaus; die Bühnen fern (Zoo, Arena, Spielplatz) erst, wenn der Spieler ≤
    // `residentM` vor ihrem Rand steht. Wo die Wildnis nicht trägt (die Prüfbühne, `_wildnisTraegt`), stehen nur Tore und
    // Kern-Werke. Je Element { id, art, phase, typ, x, z, gier, seed, dy (über dem Grund: spawnArchitecture setzt den Bau 0,5 m
    // unter den gereichten Ort) }; die Liste je Plan gemerkt (`_genesisWerkListe`).
    _genesisWerke(plan, p) {
        const L =
            this._genesisWerkListe && this._genesisWerkListe.plan === plan
                ? this._genesisWerkListe
                : this._genesisWerkListeBauen(plan);
        const R = globalThis.__fachwerkCore.GENESIS_ORT.regel.residentM;
        const o = plan.ort;
        const nah = (p.x - o.x) ** 2 + (p.z - o.z) ** 2 <= R * R;
        const kontrolle = !!this.state._weltbildDa;
        return L.werke.filter((w) => {
            // ein Werk des Grunds steht, solange sein Grund im Feld liegt (der Erdbau des Orts, immer): ohne es klaffte der
            // geschnittene Boden ohne Mauer (gate:haus-welt W9 Waise: der Grund ohne Bau)
            if (w.phase === "grund") return true;
            if (w.phase === "S1") return nah;
            if (w.phase === "S2") return nah && kontrolle;
            const q = L.buehnen[w.phase];
            return Math.hypot(p.x - q.x, p.z - q.z) - q.r <= R;
        });
    }
    _genesisWerkListeBauen(plan) {
        const FC = globalThis.__fachwerkCore;
        const o = plan.ort;
        const typen = this._genesisTorTypen();
        const werke = [];
        const w = (art, phase, typ, q, n, mehr) =>
            werke.push(
                Object.assign(
                    {
                        id: `genesis:${art}:${n}`,
                        art,
                        phase,
                        typ,
                        x: o.x + q.x,
                        z: o.z + q.z,
                        gier: q.gier || 0,
                        seed: q.seed,
                        dy: 0.5,
                    },
                    mehr || null
                )
            );
        for (const t of plan.tore) {
            const typ = typen.get(t.welt);
            if (!typ) throw new Error(`GENESIS-ORT: die Welt ${t.welt} des Slots ${t.k} trägt keinen Portal-Bauplan`);
            w("tor", "S1", typ, t, t.k, { dy: 0 });
        }
        const PHASE = { kern: "S1", wache: "S1", terrasse: "S2", wiese: "S2", zoo: "zoo" };
        plan.ausstattung.forEach((q, i) => {
            if (q.art === "laterne") w("laterne", PHASE[q.rolle], "laterne_dorf", q, i);
            else if (q.art === "bank") w("bank", "S1", "bank_sitzbank", q, i);
            else if (q.art === "brunnen") w("brunnen", "S2", "brunnen_dorf", q, i);
        });
        // die Bäume je Zeile in der Art ihres Gesetzbuchs (phyto `forestLabToHost`): die Allee steht im ersten Bild (S0, als Karte)
        // DER BAUM DES PLANS WÄCHST, WO DAS KLIMA DES ORTS IHN TRÄGT (Reise, Welle 3: die Tafel `ortGesetz(teil).wuchs`, die Heimat 1):
        // sein Rang aus seinem Samen gegen den Wald-Anteil des Orts × den Anteil seines Holzes (Nadel- oder Laubholz, `STREU_NADEL`)
        // — in der Wüste, im Eis und vor seiner Zeit steht er nicht; in der Heimat jeder.
        const WO = this._gelaende().ort.wuchs;
        plan.baeume.forEach((b, i) => {
            const gier = ((b.seed >>> 3) % 628) / 100;
            const typ = globalThis.__phytoCore.forestLabToHost(b.art);
            // gelaende-core `ortBaum` (w28-reise-ort): derselbe Baum des Orts wie der Hof-Baum, am Wasser die Oase
            const [bx, bz] = [o.x + b.x, o.z + b.z];
            const by = WO.wald < 1 ? this.getTerrainHeightAt(bx, bz) : NaN;
            const nass = Number.isFinite(by) ? this._ortNass(bx, bz, by) : 0;
            const traegt = globalThis.__gelaendeCore.ortBaum(WO, nass, AnazhRealm.STREU_NADEL.includes(typ));
            if (((b.seed >>> 8) & 0xffff) / 65536 >= traegt) return;
            w("baum", b.zeile === "allee" ? "S1" : "S2", typ, Object.assign({}, b, { gier }), i, { dy: 0 });
        });
        plan.haeuser.forEach((h, i) => w("haus", "S2", "haus_" + h.kultur, Object.assign({}, h, { gier: h.phi }), i));
        plan.formationen.forEach((f, i) => w("fels", "S2", "felsbogen", f, i, { dy: 0 }));
        // DER GRABEN DES GEHEGES (w28-graben-koerper): sein Körper ist das Werk des Plans (`graben.werk`, Bauplan der Zeile B7) um
        // die Mitte des Rands auf dem Grund des Zoos — sein Grund (S4: das Feld hohl, der gezeichnete Boden geschnitten) liegt im
        // Erdbau des Orts, und mit ihm steht es (Phase `grund`). Bis hier zeichnete der Boden die Trassen des Plans als Mulde.
        plan.gehege.forEach((g, i) =>
            w(
                "graben",
                "grund",
                FC.WERKE[g.graben.werk].kind + "_" + g.graben.werk,
                { x: g.rand.cx, z: g.rand.cz, seed: g.graben.seed },
                i
            )
        );
        // DIE BÜHNEN DER BREITE: der Spielplatz mit den Werken, die sein Gesetzbuch für ihn trägt (fachwerk WERKE `siteTag`
        // spielplatz, der Plan nennt sie: `spielplatzGeraete`; Bauplan `<kind>_<art>`), und den Bänken der Eltern. Die Arena bleibt
        // Fläche, bis ein Gesetzbuch ihren Hof trägt — nie eine Ersatz-Box.
        const SP = plan.spielplatz;
        SP.geraete.forEach((g, i) => w("geraet", "spielplatz", FC.WERKE[g.art].kind + "_" + g.art, g, i));
        SP.baenke.forEach((b, i) => w("spielbank", "spielplatz", "bank_sitzbank", b, i));
        const A = plan.arena;
        const Z = FC.GENESIS_ORT.zoo;
        const zr = plan.gehege[0].rand;
        const buehnen = {
            zoo: { x: o.x + zr.cx, z: o.z + zr.cz - zr.ez - Z.gehege.z0, r: Z.flaecheR },
            arena: { x: o.x + A.x, z: o.z + A.z, r: Math.hypot(A.ex, A.ez) },
            spielplatz: { x: o.x + SP.x, z: o.z + SP.z, r: SP.r },
        };
        // auf der Prüfbühne (die Wildnis trägt nicht) nur Tore, Kern-Werke und die Werke des Grunds (ihr Erdbau liegt auch dort)
        const wildnis = this._wildnisTraegt(o.x, o.z);
        const liste = wildnis
            ? werke
            : werke.filter(
                  (x) =>
                      x.art === "tor" ||
                      x.phase === "grund" ||
                      ((x.art === "laterne" || x.art === "bank") && x.phase === "S1")
              );
        return (this._genesisWerkListe = { plan, werke: liste, buehnen, wildnis });
    }
    // EIN ELEMENT DES PLANS STEHT (der EINE Bau `spawnArchitecture`, mit seiner id und als Werk: es weicht keinem Bau und keiner
    // Fläche des Plans, `_weichtDemBau`; eine Tat, die seinen Ort nahm, hält, `ausGesetz`): "steht" (die id ist da), "gesetzt",
    // "warte" (der Bauplan kommt erst mit dem Buch, der Grund reift) oder der Grund, mit dem die Wurzel absagte (`SETZ_GRUND`). DER UMZUG EINER ÄLTEREN FORM
    // (`_genesisUmzug`): vor dem ersten Tor fällt, was die ältere Form innerhalb des Ring-Wegs trug — ein Tor desselben Bauplans
    // neben seinem Slot (das Tor des Plans steht auf dem Slot) und eine Vorschau samt ihrem Stempel (sie steht neu, wenn der
    // Spieler vor ihr Tor tritt).
    _genesisWerkSetzen(w, plan) {
        const st = this.state;
        if ((st.architectures || []).some((e) => e && e.id === w.id)) return "steht";
        if (!st.blueprints || !st.blueprints[w.typ]) return "warte";
        const y = this.getTerrainHeightAt(w.x, w.z);
        if (!Number.isFinite(y)) return "warte";
        if (w.art === "tor") this._genesisUmzug(w, plan);
        let absage = null;
        const e = this.spawnArchitecture(
            w.typ,
            { x: w.x, y: y + w.dy, z: w.z },
            {
                id: w.id,
                seed: w.seed,
                rotationY: w.gier,
                silent: true,
                werk: true,
                ausGesetz: true,
                studioOv: w.ov,
                absage: (g) => (absage = g),
            }
        );
        if (e) return "gesetzt";
        return absage === "buch" ? "warte" : absage || "unbenannt";
    }
    _genesisUmzug(w, plan) {
        const o = plan.ort;
        const R2 = globalThis.__fachwerkCore.GENESIS_ORT.ring.r1 ** 2;
        const wm = this.state.worldMeta || {};
        for (const e of (this.state.architectures || []).slice()) {
            if (!e || !e.position || e.id === w.id) continue;
            if ((e.position.x - o.x) ** 2 + (e.position.z - o.z) ** 2 > R2) continue;
            const vorschau = typeof e.id === "string" && e.id.startsWith("portal-preview-");
            if (e.type !== w.typ && !vorschau) continue;
            this.removeArchitecture(e, { still: true });
            if (vorschau) {
                const welt = e.id.slice("portal-preview-".length);
                delete wm["portalPreview" + welt.charAt(0).toUpperCase() + welt.slice(1)];
                if (this._portalPreviewFertig) delete this._portalPreviewFertig[welt];
            }
            this._genesisUmgezogen = (this._genesisUmgezogen | 0) + 1;
            this.log(
                `GENESIS-ORT: ${e.type} der älteren Form fällt am Ring (Umzug ${this._genesisUmgezogen}).`,
                "INFO"
            );
        }
    }
    // DIE FLÄCHE DES GENESIS-ORTS an (x, z) (Pflicht F): der Name der erklärten Fläche des Plans, die dort gilt (fachwerk
    // `genesisZoneTraegt` in der Folge der Zonen — nie der Gürtel, nie ein anderer Ort: dort wirft das Feld), mit `reich` > 0 auch
    // der Freiraum samt Reichweite (über dem Rund der Tore steht keine Krone, in ihn reicht kein Haus) — oder null. Je Zelle des
    // Zonen-Gitters fragt sie nur die Zonen, deren Hülle dort liegt (Lehre 25: die Streu fragt je Zelle). Leser: die Natur-Wand
    // (`_imGrundriss`) und die Bau-Wand (`_bauFrei`). Bis zum Plan war es die Lichtung einer Stein-Scheibe samt Ring.
    _genesisFlaeche(x, z, reich = 0) {
        const P = this._genesisPlan;
        if (!P) return null;
        const FC = globalThis.__fachwerkCore;
        const lx = x - P.ort.x;
        const lz = z - P.ort.z;
        if (reich > 0 && lx * lx + lz * lz < (FC.GENESIS_ORT.freiraum.r + reich) ** 2) return "freiraum";
        const gi = this._genesisZonenGitter(P);
        const l = gi.zellen.get(AnazhRealm._grundrissSchluessel(Math.floor(lx / gi.m), Math.floor(lz / gi.m)));
        if (!l) return null;
        for (let i = l.length - 1; i >= 0; i--) {
            const q = P.zonen[l[i]];
            if (FC.genesisZoneTraegt(q, lx, lz)) return q.art === "feld" || q.art === "ort" ? null : q.name;
        }
        return null;
    }
    _genesisZonenGitter(P) {
        if (this._genesisGitter && this._genesisGitter.plan === P) return this._genesisGitter;
        const m = AnazhRealm.GRUNDRISS_ZELLE;
        const zellen = new Map();
        P.zonen.forEach((q, i) => {
            const h = q.huelle;
            for (let gx = Math.floor(h[0] / m); gx <= Math.floor(h[2] / m); gx++)
                for (let gz = Math.floor(h[1] / m); gz <= Math.floor(h[3] / m); gz++) {
                    const k = AnazhRealm._grundrissSchluessel(gx, gz);
                    const l = zellen.get(k);
                    if (l) l.push(i);
                    else zellen.set(k, [i]);
                }
        });
        return (this._genesisGitter = { plan: P, m, zellen });
    }

    // DER DORF-TAKT LEBT, wo der Ort ihn nicht anhält: der Hook `__anazhAutoSettlement = false` (der Zustand des Messorts,
    // haushalt.json `dorfZug`) — EIN Urteil für den Siedlungs-Takt, den Genesis-Ort und das erste Weltbild (Term „dorf",
    // `_weltbildLuecken`): ein Dorf, das kein Takt baut, hält kein Bild. Der Bau am Ort ist Simulation, nie Bild: bis
    // w12-dorf-probe ruhte der Zug auch, wenn nur der Null-Renderer stand — jede headless Probe am Messort dorf (dorfZug
    // true) urteilte eine leere Welt (0 Häuser nach 9000 Takten; mit Renderer 16, derselbe Bau-Hash).
    _dorfTaktLebt() {
        return (typeof window !== "undefined" ? window.__anazhAutoSettlement : undefined) !== false;
    }

    // DAS START-DORF IST FÄLLIG (EIN Urteil für den Takt und das erste Weltbild, K60-4): einmalig je Welt, solange es weder
    // steht (`settlementCells.start`) noch hoffnungslos ist, und nur nahe des Genesis-Orts (kein Fern-Spawn hinter dem Rücken).
    _startDorfFaellig(playerPos) {
        const wm = this.state.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        if ((cells && cells.start) || this._autoSettlementStartHopeless) return false;
        const gM = this._genesisMitte();
        const n = AnazhRealm.AUTO_SETTLEMENT.nearM;
        return !!gM && (playerPos.x - gM.x) ** 2 + (playerPos.z - gM.z) ** 2 <= n * n;
    }

    // DAS START-DORF BESTELLEN (EIN Weg für das Buch und den Takt, B5): ist es fällig, geht sein Export hinaus — nur nahe des
    // Genesis-Orts (kein Fern-Spawn hinter dem Rücken), fail-closed + session-gemerkt (eine Welt ohne Fleck urteilt immer
    // gleich). Der Kopf der Dorf-Kette wartet auf das Buch (`_startDorfAmBuch`): Befund B5 (OMEN 18.10., GTX kalt) — der Takt
    // im Leerlauf des Streamings bestellte ihn 1,7 s nach dem Buch, die Kette (Export 3,4–5,4 s, Ort-Wahl, 33 Häuser) hielt
    // „bauten" bis 16,07 s. true = bestellt.
    _startDorfBestellen(p) {
        if (!p || !this._dorfTaktLebt() || this._autoSettlementQueue || this._autoSettlementPendingKey) return false;
        if (!this._autoSettlementChannelLive() || !this._startDorfFaellig(p)) return false;
        const si = this._autoSettlementStartInfo();
        if (!si) {
            this._autoSettlementStartHopeless = true; // Instanz-Feld (die _editSaveTimer-Klasse)
            return false;
        }
        this._autoSettlementSpawnCell(0, 0, si);
        return true;
    }
    // DAS START-DORF WARTET AUF DAS BUCH (B5; K22: das Buch ist ein EREIGNIS, der Ingest ruft keinen Leser): EIN Wecker an
    // `buchDa`, angemeldet mit der Geburt der Foundry (`init`) vor jedem anderen Wartenden — der Export geht als erster Auftrag
    // nach dem Leib in die Bahn ohne Arbeit (`_foundryRang(0, kopf)`). Den Rest fängt der Takt (`_tickAutoSettlement`).
    _startDorfAmBuch() {
        const f = this._foundry;
        if (!f || !f.buchDa) return;
        this._foundryWecker(f.buchDa, "start-dorf", () => {
            const pm = this.state.playerMesh;
            try {
                if (pm) this._startDorfBestellen(pm.position);
            } catch (e) {
                this._stoffBruch("das Start-Dorf (Export nach dem Buch)", e);
            }
        });
    }

    _tickAutoSettlement(playerPos) {
        const st = this.state;
        if (!playerPos || !this._dorfTaktLebt()) return;
        this._stadtFerneTakt(playerPos); // die Kacheln der Stadt, die nicht stehen, tragen ihre Massen
        // DER ORT LIEGT VOR SEINEM WALD (w28-ort-vor-wald): der Vorlauf (`_dorfVorlauf`: die Vorräte, ihr Wasser, ihr Grund und der
        // nächste fällige Ort) geht in JEDEM Takt vor dem Akt — ein Zug, ein Export unterwegs, die Wiederkehr hielten ihn an
        const reihe = this._dorfVorlauf(playerPos);
        // (a) DIE MATERIALISIERUNG IN RATEN zuerst: ein angekommener Export baut seine
        // Häuser über Takte verteilt — erst fertig wachsen, dann die nächste Zelle.
        // EXISTENZ VOR FRAMERATE (Lehre 13, Leben-Prüfung N-D9): der Takt ist ein Bauer der EINEN Frist (`TAKT_BAUER.dorf`),
        // sein Schritt hebt mindestens EIN Haus (`_dorfZugSchritt`) — nach der Frist wartet er am Tor wie jeder Bauer, und sein
        // Hunger gibt ihm den Vortritt (`_bauPflichtGang`). Bis w28-stadt-netz lief er im Deko-Job hinter `_frameOverBudget`
        // (je 8 Takte ein Haus), davor kehrte er über dem Budget um (60 von 60 Proben: das Start-Dorf entstand nie).
        const q = this._autoSettlementQueue;
        if (q && q.plan) {
            this._dorfZugSchritt(q);
            if (!q.gang && q.idx >= q.plan.slots.length) {
                this._dorfRateMessen(q);
                this._autoSettlementQueue = null;
                this.log(
                    `Siedlung „${q.plan.name || "?"}" gewachsen (Zelle ${q.cellKey}, ${q.plan.slots.length} Slots).`,
                    "INFO"
                );
                // nach dem Wachstum (`_ortWaechst`) stellen sich die Bewohner aus dem neuen Plan auf: ihre Liste ist seine Funktion
                const S = q.waechst && this._bewohnerSiedlungen && this._bewohnerSiedlungen.get(q.cellKey);
                if (S) this._bewohnerFort(S);
            }
            return;
        }
        // ein Erwachen zur Zeit; ohne Kanal (M8) oder Gesetz (`reihe` null) kein Akt
        if (this._autoSettlementPendingKey || !reihe) return;
        const wm = st.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        // DER ORT KEHRT WIEDER (speicher.K3, Lehre 7): eine Zelle mit Gedächtnis {seed, nH, x, z} steht je Sitzung, sobald
        // der Spieler naht, aus DEMSELBEN Export an ihrem gemerkten Ort wieder auf (die Wahl fest) — ihr Gang legt den Erdbau,
        // die Wege und die Schichten, ihr Zug hebt jedes Haus, das nicht steht. Der Stand trägt keinen Bau und keinen Erdbau
        // eines Orts: bis speicher-k3 trug er jeden (30 min Spiel: 7 Orte des Nexus, 140 kB Erdbau). Alt-Saves mit Wert 1 →
        // nichts. EIN Roundtrip zur Zeit, nur nahe Zellen; sein Zug tritt nur in einen leeren Takt (sonst kehrt er später wieder).
        const wk = !this._stlWegePending && this._dorfWiederkehrZelle(playerPos);
        if (wk) {
            const [k, c] = wk;
            this._stlWegePending = true; // Instanz-Feld (die _editSaveTimer-Klasse)
            const anker = { x: c.x, z: c.z };
            const wieder = (plan2) =>
                plan2 &&
                this._ortWahl(plan2, { x: c.x, z: c.z }, false, null, true).then((v2) => {
                    const E = this.state.worldMeta.erdbau || {};
                    const ort =
                        c.ort ||
                        Object.keys(E).find((e) => e.startsWith(`ort:${c.seed >>> 0}:`)) ||
                        AnazhRealm._ortSchluessel(plan2, anker);
                    const so = { autonomous: !!c.autonomous };
                    if (this._autoSettlementQueue || this._autoSettlementPendingKey) return;
                    const w = this._dorfWasserUrteil(v2.erdbau);
                    const gang = this._dorfErwachen(v2, anker, ort, k, w, so);
                    this._autoSettlementQueue = Object.assign(
                        this._dorfZug(this._dorfZugOffen(v2, anker), anker, k, gang),
                        {
                            so,
                            wieder: true,
                        }
                    );
                });
            this._foundryRequestSettlement(this._ortDp(k, c), k === "start")
                .then(wieder)
                .catch(this._ortWahlWartet(k))
                .then(() => (this._stlWegePending = false));
            return; // EIN Dorf-Akt pro Tick
        }
        if (this._ortWachstumTakt(playerPos)) return; // EIN Dorf-Akt pro Tick
        // Start-Dorf zuerst (einmalig je Welt) — bestellt schon sein Wecker am Buch (`_startDorfAmBuch`), der Takt fängt den Rest
        if (this._startDorfBestellen(playerPos)) return; // EIN Dorf-Akt pro Tick
        for (const [, cx, cz] of reihe) if (this._autoSettlementZelle(cx, cz, playerPos, cells, true)) return; // EIN Dorf-Akt pro Tick
    }
    // DER VORLAUF DER ORTE (`_tickAutoSettlement`, w28-ort-vor-wald): je Takt vor jedem Akt die Vorräte (`_dorfBereiten`) — EINE Rate
    // ihres Wasser-Urteils oder EIN Grund (der Grund liegt im Vorlauf, w12-dorf-strom) — und EIN fälliger Ort, der seinen Vorrat
    // beginnt (`_autoSettlementZelle` ohne Erwachen). Jeder Export fliegt, sobald sein Ort fällig ist: der Faden des Walds wartet auf
    // jeden Ort in Arbeit, der seinen Chunk erreicht (`_ortInArbeit`). Bis w28-ort-vor-wald flog EIN Export zur Zeit, und der Vorlauf
    // stand hinter dem Zug, dem Export des Erwachens, der Wiederkehr, dem Wachstum und dem Start-Dorf still (GTX 1050, Sprung an die
    // Mess-Wiese: die Orte 2–5 legten ihren Grund 33–60 s nach dem Sprung, 264 Bäume des Walds fielen im Laub-Rand im Saum).
    // → die Reihe der Zellen um den Spieler (nach dem EINEN Rang) für den Akt, null ohne Kanal (M8) oder Gesetz.
    _dorfVorlauf(playerPos) {
        if (!this._autoSettlementChannelLive()) return null; // der Dispatch-Kanal entscheidet (M8)
        if (!this._autoSettlementRejected) this._autoSettlementRejected = new Set(); // Instanz-Feld (die _editSaveTimer-Klasse)
        // ZENSUS 17.07. — DASSELBE Zell-Raster wie die Zell-Wahrheit
        // (_autoSettlementCellInfo): SIEDLUNG.cellM, das fachwerk-Gesetz.
        const SGz = AnazhRealm._siedlungGesetz();
        if (!SGz) return null;
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (nearM, der Vorlauf)
        const wm = this.state.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        const cellM = SGz.cellM;
        const pcx = Math.floor(playerPos.x / cellM);
        const pcz = Math.floor(playerPos.z / cellM);
        // die Vorräte (`_dorfBereiten`): ein fertiger, dessen Ort hinter dem Spieler zurückbleibt (jenseits des Rings seiner Sicht
        // um `vorlaufM` und außer der doppelten Zeit seines Vorlaufs, `_autoSettlementZelle` — die Trasse rückt den Anker bis
        // 128 m), fällt; kehrt er zurück, bereitet er sich neu vor
        const V = this._dorfVorraete || (this._dorfVorraete = new Map());
        let rate = 1; // je Takt EINE Rate des Wasser-Urteils eines bereiten Vorrats (`_dorfWasserUrteil`)
        for (const [k, w] of V) {
            const sicht = A.nearM + w.mehrM + A.vorlaufM;
            if (
                w.da &&
                (w.x - playerPos.x) ** 2 + (w.z - playerPos.z) ** 2 > (sicht + A.vorlaufM) ** 2 &&
                !(this._bedarfZeit(w.x, w.z, sicht) <= 2 * (A.bereitS + (this._dorfRate ? A.bauZeitMaxS : 0)))
            ) {
                this._dorfVorratGrundFaellt(w);
                V.delete(k);
            } else if (w.da && rate && w.wasser.nass === undefined) {
                this._dorfWasserSchritt(w.wasser);
                rate = 0;
            } else if (w.da && rate && !w.grund && w.v2) {
                // DER GRUND LIEGT IM VORLAUF (w12-dorf-strom): der Erdbau ist Funktion des Orts, nie seines Erwachens — er
                // liegt, sobald das Wasser-Urteil des Vorrats steht, und der Wald um den Ort plant am künftigen Grund, bevor
                // seine Bäume in den Kegel treten (`_forestDartsFallen` fällt hier, im Vorlauf-Ring). Das Erwachen findet ihn
                // liegend (`_erdbauSetzen` legt keinen Schlüssel zweimal). Bis w12-dorf-strom legte erst das Erwachen ihn:
                // 576 von 578 Bäumen, die unfertig in den Kegel traten, verloren ihren Plan in diesem Bild (Fahrt-Probe dorf).
                this._erdbauSetzen(w.ort, w.v2.erdbau, w.wasser.nass, true);
                w.grund = true;
                rate = 0;
            }
            if (w.da && V.has(k)) w.vorgebacken = this._dorfVorbacken(w, playerPos);
        }
        // DIE ZELLEN NACH DER ZEIT BIS BEDARF (w13-dorf-strom): die Ringe um den Spieler reichen so weit, wie der Vorlauf eines
        // Orts im Tempo der Bahn trägt (im Stand zwei Zellen, je `cellM` Weg in `bereitS` eine mehr), die Zellen in der Reihe
        // des EINEN Rangs (`_spielerD2` am Ort der Zelle) — der Ort, den die Bahn zuerst braucht, beginnt seinen Vorrat und tut
        // den Akt des Takts. Bis w13-dorf-strom gingen Ring 1 und Ring 2 in der Reihe des Rasters, und im Ring 2 erwachte nur die Stadt.
        const [vx, vz] = this._bedarfTempo();
        const ringe = 2 + Math.ceil((Math.hypot(vx, vz) * (A.bereitS + (this._dorfRate ? A.bauZeitMaxS : 0))) / cellM);
        const reihe = [];
        for (let dz = -ringe; dz <= ringe; dz++)
            for (let dx = -ringe; dx <= ringe; dx++) {
                const key = pcx + dx + "," + (pcz + dz);
                if ((cells && cells[key]) || this._autoSettlementRejected.has(key)) continue;
                const info = this._autoSettlementCellInfo(pcx + dx, pcz + dz);
                reihe.push([info ? this._spielerD2(info.x, info.z) : 0, pcx + dx, pcz + dz]);
            }
        reihe.sort((a, b) => a[0] - b[0]);
        for (const [, cx, cz] of reihe) if (this._autoSettlementZelle(cx, cz, playerPos, cells, false)) break; // EIN Vorrat je Takt
        return reihe;
    }
    // DER ORT IN ARBEIT (w28-ort-vor-wald, das EINE Urteil des Dorf-Zugs für den Wald): ein Ort, dessen Grund noch nicht liegt — ein
    // Vorrat (`_dorfVorraete`) vor seinem Grund oder die Zelle des Zugs vor ihrem Erdbau (`_dorfErwachen`, das Erwachen ohne
    // Vorlauf) —, dessen Rand samt Saum (fachwerk `siedlungsReich` über die Häuser des Plans + phyto-core `bestand.saum`, wie
    // `_ortRandSetzen` und `_saumRaeumen`; vor dem Plan die Häuser der Zelle und die Trasse, die den Anker bis 128 m rückt) den
    // Kasten x0…x1 · z0…z1 erreicht → sein Schlüssel, sonst null. Leser: der Pflanz-Gang des Walds (`_forestPlantChunk`: der Chunk
    // wartet, bis der Grund liegt — sonst räumte ihn der Saum nach dem Bild, `_saumRaeumen`).
    // IN ARBEIT IST NUR, WAS EIN TAKT BAUT: ruht der Dorf-Takt (`_dorfTaktLebt`, das EINE Urteil des Siedlungs-Takts, des
    // Genesis-Orts, des ersten Weltbilds und von `_dorfOffen`: der Messort ohne Dorf-Zug), legt kein Vorrat und kein Zug seinen
    // Grund — der Wald pflanzt. Bis hier wartete er auf die Vorräte des Boots, die der ruhende Takt nie weiterführt (Zug z653,
    // OMEN gate:tag-achse:echt an genesis: 25 Karten im Pflanz-Warten, die Welt stand nach 8 579 Takten nicht, dorf 0).
    _ortInArbeit(x0, z0, x1, z1) {
        if (!this._dorfTaktLebt()) return null;
        const V = this._dorfVorraete;
        const q = this._autoSettlementQueue;
        if (!(V && V.size) && !(q && q.plan)) return null;
        const S = AnazhRealm._siedlungGesetz();
        if (!S) return null;
        const reich = AnazhRealm.Gesetz("fachwerk:siedlungsReich");
        const saum = globalThis.__phytoCore.FOREST_PACK.bestand.saum;
        const W = AnazhRealm.ORT_WAHL;
        const wm = this.state.worldMeta || {};
        const E = wm.erdbau && typeof wm.erdbau === "object" ? wm.erdbau : {};
        const um = (x, z, r) => {
            const dx = Math.max(x0 - x, 0, x - x1);
            const dz = Math.max(z0 - z, 0, z - z1);
            return dx * dx + dz * dz <= (r + saum) * (r + saum);
        };
        for (const [k, w] of V || []) {
            if (w.grund || (w.ort && E[w.ort])) continue;
            const r = w.da && w.v2 ? reich(S, w.v2.slots.length) : reich(S, w.nH) + W.schrittM * W.ringe;
            // ein Vorrat ohne Größe ist ein Bruch beim Namen — der Wald wartet auf ihn, nie still an seinem Saum vorbei
            if (!(r >= 0)) {
                this._bruchMelden(`ORT IN ARBEIT: der Vorrat ${k} trägt keine Größe (nH ${w.nH})`);
                return k;
            }
            if (um(w.x, w.z, r)) return k;
        }
        const c = q && q.plan && wm.settlementCells && wm.settlementCells[q.cellKey];
        if (c && c.ort && !E[c.ort] && um(c.x, c.z, reich(S, q.plan.slots.length))) return q.cellKey;
        return null;
    }
    // DAS GEDÄCHTNIS DES WACHSTUMS (siedlung.K4 Staffel 2): ein Ort mit Chronik beginnt im Jahr seines Plans, ohne Kraft, zur Uhr
    // der Welt; ohne Chronik (keine Zeitachse) wächst er nicht
    _ortWachsAnfang(plan) {
        return plan && plan.chronik
            ? { jahr: plan.jahr + plan.spanne, kraft: 0, uhr: this.state.spielZeit }
            : undefined;
    }
    // DER ORT WÄCHST IN SPIELZEIT (siedlung.K4 Staffel 2): je `SIEDLUNG_WACHS.taktS` s der Welt-Uhr rechnet jeder Ort mit Chronik,
    // der in dieser Sitzung steht (seine Wege, `_stlWegeKeys`) und dessen Rand der Spieler auf `nearM` naht, das Gesetz seines
    // Wachstums bis zur Uhr (fachwerk `wachstum`: die Kraft seiner Bewohner, ihre Furcht aus seinen Akten nach dem EINEN
    // Furcht-Gesetz) — sein Gedächtnis (`wachs`) geht mit; trägt das Jahr ein Los, das sein Plan nicht trägt, wird er am neuen Jahr
    // Welt (`_ortWaechst`). Ein ferner Ort holt nach, wenn der Spieler naht (das Gesetz ist taktfrei). EIN Ort zur Zeit; der Zug
    // seiner neuen Häuser tritt in den nächsten freien Takt. Jeder nahe Ort rechnet jeden Takt — seine Uhr (`wachs.uhr`) sagt,
    // ob er ihn schon rechnete; bis w3w verschluckte ein Nachbar, der wuchs, den Takt jedes Orts nach ihm. Rückgabe true = der
    // Takt tat seinen Dorf-Akt.
    _ortWachstumTakt(p) {
        if (this._ortWachsFlug || this._autoSettlementQueue) return false; // ein Zug zur Zeit: keiner fällt halb gebaut
        const H = this._ortWachsHaeuser;
        if (H && H.size) {
            const [k, q] = H.entries().next().value;
            H.delete(k);
            this._autoSettlementQueue = q;
            return true;
        }
        const [st, tS] = [this.state, AnazhRealm.SIEDLUNG_WACHS.taktS];
        const takt = Math.floor(st.spielZeit / tS);
        if (takt === this._ortWachsTakt) return false;
        const [cells, FC, FG] = [
            (st.worldMeta || {}).settlementCells || {},
            globalThis.__fachwerkCore,
            AnazhRealm._furchtGesetz(),
        ];
        for (const k in cells) {
            const c = cells[k];
            const alt =
                c &&
                c.wachs &&
                Math.floor(c.wachs.uhr / tS) < takt &&
                this._stlWegeKeys &&
                this._stlWegeKeys.has(k) &&
                this._ortPlaene.get(c.ort);
            const nah = AnazhRealm.AUTO_SETTLEMENT.nearM + this._siedlungMehrM(c && c.nH);
            if (!alt || !alt.chronik || (c.x - p.x) ** 2 + (c.z - p.z) ** 2 > nah * nah) continue;
            const furcht = (a) => FG.furchtErinnert(a, FG.F);
            const Z = FC.wachstum(alt.chronik, c.wachs, c.akten || [], st.spielZeit, furcht, FG.F.fluchtJeFurcht);
            c.wachs = { jahr: Z.jahr, kraft: Z.kraft, uhr: Z.uhr };
            if (Z.jahr === alt.jahr + alt.spanne) continue;
            this._ortWachsFlug = this._ortWaechst(k, c, alt)
                .catch((e) => this._stoffBruch(`das Wachstum von „${alt.name || k}"`, e))
                .finally(() => (this._ortWachsFlug = null));
            return true;
        }
        this._ortWachsTakt = takt; // Instanz-Feld (die _editSaveTimer-Klasse): jeder nahe Ort rechnete diesen Takt
        return false;
    }
    // DER ORT WIRD AM NEUEN JAHR WELT (siedlung.K4 Staffel 2): der Export am Jahr seines Gedächtnisses (`_ortDp`) wird an genau
    // seinem Ort gewählt (`_ortNeuPlanen`: derselbe Weg, auf dem seine Gasse einem gesetzten Haus weicht — Erdbau, das Objekt des
    // Plans, Wege, das Netz der Bewohner). Vor dem Tausch fällt jedes Haus, dessen Slot der neue Plan nicht trägt (Same, Kultur,
    // Ort: das Los wird neu bebaut), und die Ausstattung des alten (ihre Nummern wechseln); danach steht die Mauer neu, wenn sie
    // wechselt (der Ring des Schnitts wächst, nach MAUER_BIS fällt er), und der Zug hebt die neuen Häuser und die Ausstattung
    // (`_dorfZugOffen`, `_dorfErlebnis`: was steht, bleibt); ist er durch, stellen sich die Bewohner neu auf (`_tickAutoSettlement`).
    async _ortWaechst(k, c, alt) {
        const plan = await this._foundryRequestSettlement(this._ortDp(k, c));
        if (!plan) return false;
        const mauer = JSON.stringify(alt.mauer || null);
        const id = (s) => `${s.seed >>> 0}:${s.kultur}@${Math.round(s.x * 20)},${Math.round(s.z * 20)}`;
        const vorTausch = (a, neu) => {
            const [traegt, weg] = [new Set(neu.slots.map(id)), []];
            for (const s of a.slots) {
                const e = !traegt.has(id(s)) && this._dorfHaus(a.ort.x + s.x, a.ort.z + s.z, s.seed >>> 0);
                const fp = e && this._grundrissVon(s);
                if (e) weg.push({ x: e.position.x, z: e.position.z, r: (fp ? Math.hypot(fp.ex, fp.ez) : 4) + 1.5 });
                if (e) this.removeArchitecture(e, { still: true });
            }
            this._ortAusstattungFaellt(a, weg, neu);
        };
        if (!(await this._ortNeuPlanen(c.ort, plan, vorTausch))) return false;
        if (JSON.stringify(alt.mauer || null) !== mauer) this._stlMauerNeu(alt);
        const so = { key: k, autonomous: !!c.autonomous };
        const gang = this._dorfErlebnis(alt, { x: alt.ort.x, z: alt.ort.z }, so);
        const q = this._dorfZug(this._dorfZugOffen(alt, alt.ort), alt.ort, k, gang);
        (this._ortWachsHaeuser || (this._ortWachsHaeuser = new Map())).set(
            k,
            Object.assign(q, { so, wieder: true, waechst: true })
        );
        if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
        this.log(
            `Siedlung „${alt.name || "?"}" (${k}) wächst ins Jahr ${c.wachs.jahr}: ${alt.slots.length} Slots.`,
            "INFO"
        );
        return true;
    }
    // DIE MAUER WÄCHST MIT (siedlung.K4 Staffel 2, `_ortWaechst`): wechselt die Mauer des Plans `plan` mit seinem Jahr (der Ring
    // des Schnitts wächst mit der Stadt, nach MAUER_BIS fällt er), fallen ihre Streifen (Maß 0, der Pool behält die Plätze) und
    // ihre Linie in der Wege-Karte, und die Mauer seines Plans steht neu
    _stlMauerNeu(plan) {
        const [wk, P] = [this._wegeKarteEnsure(), this.state.stlMauer];
        const null4 = this._stlMauerNull || (this._stlMauerNull = new THREE.Matrix4().makeScale(0, 0, 0));
        for (let i = wk.siedlungen.length - 1; i >= 0; i--) {
            const b = wk.siedlungen[i];
            if (b.mauerVon !== plan) continue;
            wk.siedlungen.splice(i, 1);
            if (wk.raeumen.includes(b)) wk.raeumen.splice(wk.raeumen.indexOf(b), 1);
            for (let k = b.streifen[0]; P && k < b.streifen[1]; k++) P.mesh.setMatrixAt(k, null4);
            if (P) P.mesh.instanceMatrix.needsUpdate = true;
            this._grundrissFaellt(b.x0, b.z0, b.x1, b.z1);
        }
        return this._stlMauerBuild(plan, plan.ort);
    }
    // DER AKT EINES ORTS AUS SEINEM GEDÄCHTNIS (speicher.K3): sein Same, seine Zahl, seine Epoche (der Akt eines Satzes oder des
    // Nexus trägt seine eigene, die Zelle ihre Legende), sein Budget, das Jahr seines Wachstums (`wachs`, siedlung.K4 Staffel 2) und
    // der Grund seiner Trasse (siedlung.K3: der Export liest das Raster, wo seine Gassen lagen; ein Ort ohne wx/wz stammt von vor
    // der Trasse und lag eben), dazu der Kern seines Rings (`kern`). Leser: die Wiederkehr (`_tickAutoSettlement`) und das
    // Wachstum (`_ortWaechst`).
    _ortDp(k, c) {
        const akt = k.startsWith("d:");
        // die Kachel trägt die Zeit ihrer Stadt und nennt sich (`kachel`); die Mitte einer Stadt des Worts ist ihre Kachel (0, 0)
        const zeit = akt
            ? { epoche: c.epoche, ...(c.stadt ? { kachel: { samen: c.seed, nH: c.stadt, i: 0, k: 0 } } : null) }
            : this._zellEingang(k, c.seed);
        return {
            seed: c.seed,
            nH: c.nH,
            ...zeit,
            budget: akt ? c.budget : undefined,
            jahr: c.wachs ? c.wachs.jahr : undefined,
            kern: c.kern,
            ort: Number.isFinite(c.wx) && Number.isFinite(c.wz) ? { x: c.wx, z: c.wz } : undefined,
        };
    }
    // DER ORT OHNE ÄNDERUNG IST EINE FUNKTION (speicher.K3, Gebot 7: die Datei wächst mit den Änderungen, nie mit dem Weg): das
    // Gedächtnis `c` einer Zelle der Welt `k` ("cx,cz") reist nicht, wenn es nur trägt, was ihr Gesetz ihr gibt — Same und Zahl
    // der Zelle (`_autoSettlementCellInfo`) und den Anker einer UNBERÜHRTEN Wahl (`_ortWahlUnberuehrt`: kein Spieler, kein
    // Fremd-Slot, kein Kandidat vom Wirt abgewiesen, in jeder Runde der Trasse — dann wählt jedes Erwachen denselben Ort, in
    // jeder Folge der Orte), kein Wachstum, keine Akte —, wenn seither nichts Reisendes in das Reich der Wahl kam (ein Bau des
    // Stands `bauten`, ein Erdbau außer dem der Orte, ein Edit, eine Tat: Plan + 16 m + die Ringe der Wahl + die Probe der Zelle,
    // um Wunsch und Anker) und wenn der Spieler nicht im Vorlauf des Orts steht (die Ankunft wartet auf den Ort, der wiederkehrt).
    // Er erwacht beim nächsten Nahen wie beim ersten. Ohne Wahl in der Sitzung (ein Ort, der aus dem Stand wiederkam) oder bei
    // kaltem Buch reist er. Leser: die Stand-Zeile worldMeta.
    _ortReistNicht(k, c, bauten) {
        if (!/^-?\d+,-?\d+$/.test(k) || !c || typeof c !== "object") return false;
        for (const f in c)
            if (c[f] !== undefined && !["seed", "nH", "x", "z", "wx", "wz", "ort"].includes(f)) return false;
        const [cx, cz] = k.split(",").map(Number);
        const [info, SG] = [this._autoSettlementCellInfo(cx, cz), AnazhRealm._siedlungGesetz()];
        const v2 = this._ortPlaene && this._ortPlaene.get(c.ort);
        const U = this._ortWahlUnberuehrt;
        if (!info || !SG || !v2 || !Array.isArray(v2.slots) || !U || !U.has(v2)) return false;
        if (info.seed !== c.seed || info.nH !== c.nH) return false;
        if (!(c.x === c.wx && c.z === c.wz && c.ort === AnazhRealm._ortSchluessel(c, c))) return false;
        const [A, W, wm] = [AnazhRealm.AUTO_SETTLEMENT, AnazhRealm.ORT_WAHL, this.state.worldMeta || {}];
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const vor = A.nearM + info.mehrM + A.vorlaufM;
        if (pm && (pm.x - c.x) ** 2 + (pm.z - c.z) ** 2 <= vor * vor) return false;
        let reich = 0;
        for (const s of v2.slots) reich = Math.max(reich, Math.hypot(s.x || 0, s.z || 0) + 16);
        const R = reich + W.ringe * W.schrittM + SG.cellM * Math.max(...A.siteProbeR);
        const [x0, x1] = [Math.min(c.x, info.x) - R, Math.max(c.x, info.x) + R];
        const [z0, z1] = [Math.min(c.z, info.z) - R, Math.max(c.z, info.z) + R];
        const drin = (x, z) => x >= x0 && x <= x1 && z >= z0 && z <= z1;
        for (const e of bauten || AnazhRealm.STAND_LEER)
            if (e && e.position && drin(e.position.x, e.position.z)) return false;
        for (const key in wm.erdbau || {})
            if (!key.startsWith("ort:") && [].concat(wm.erdbau[key] || []).some((p) => p && drin(p.cx, p.cz)))
                return false;
        for (const a of wm.taten || AnazhRealm.STAND_LEER) if (a && drin(a.x, a.z)) return false;
        return !this._voxelEditsImKasten(x0, x1, z0, z1).length;
    }
    // DAS HAUS WIRD KERN EINES RINGS (siedlung.K4 Staffel 2): legt ein gesetztes Haus seinen Grund (die Platte p, `haus:`) im Reich
    // eines wachsenden Orts (`reich`: seine Slots + 16 m wie die Ort-Wahl), trägt dessen Gedächtnis die Akte `kern` — die Platte
    // im Rahmen des Orts und das Jahr seines Plans, der steht: die Lose danach wachsen um das Haus (fachwerk `ringUm`), die
    // Wiederkehr und jedes Wachstum lesen sie (`_ortDp`). Ein Ort trägt EINEN Kern. Leser: `_ortFremdPruefen`.
    _ortKernAkt(p, reich) {
        const cells = (this.state.worldMeta || {}).settlementCells || {};
        for (const k in cells) {
            const c = cells[k];
            const v = c && c.wachs && !c.kern && this._ortPlaene && this._ortPlaene.get(c.ort);
            if (v && v.chronik && Math.hypot(p.cx - c.x, p.cz - c.z) <= reich(v))
                c.kern = { x: p.cx - c.x, z: p.cz - c.z, phi: p.phi, ex: p.ex, ez: p.ez, ab: v.jahr + v.spanne };
        }
    }
    // DIE ZELLE, DIE WIEDERKEHRT: der erste Ort des Gedächtnisses (in der Folge seiner Gründung), der nahe dem Spieler steht und
    // in dieser Sitzung noch nicht wiederkam (`_stlWegeKeys`: seine Wege) — [Schlüssel, Gedächtnis] oder null. Leser: der Takt
    // (`_tickAutoSettlement`) und das erste Weltbild (der Term „dorf").
    _dorfWiederkehrZelle(p) {
        const wm = this.state.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        for (const k in cells || {}) {
            const c = cells[k];
            if (!c || typeof c !== "object" || !Number.isFinite(c.x) || !Number.isFinite(c.seed)) continue;
            if (this._stlWegeKeys && this._stlWegeKeys.has(k)) continue;
            const nahW = AnazhRealm.AUTO_SETTLEMENT.nearM + this._siedlungMehrM(c.nH); // die Stadt ab ihrem Rand (siedlung.K2)
            if ((c.x - p.x) ** 2 + (c.z - p.z) ** 2 <= nahW * nahW) return [k, c];
        }
        return null;
    }
    // DER ORT DES WORTS VERDRÄNGT WIE DER RANG (siedlung, die Breite der Stadt): das Rang-Gesetz der Zellen (fachwerk
    // `siedlungsZelle`: ein Ort steht nur, wo kein höherer, der steht, in Reichweite liegt — die Summe beider `siedlungsReich`)
    // gilt auch gegen die Stadt, die ein Wort gründete („dorf 7 300", Schlüssel `d:`): in ihrem Reich erwacht keine kleinere
    // Zelle. Bis hier kannte die Zelle nur Zellen — am Messort stadt-voll (Radeon, 11.11.) erwachte das Dorf der Zelle 26 m
    // neben dem Markt der Metropole, seine Ort-Wahl fand zwischen ihren Häusern Platz auf Markt und Gasse (die Bau-Wand kennt
    // nur Bauten), und sein Zug wartete ohne Ende auf die zwei Slots unter dem Spieler („Dorf offen 2", die Welt stand nie).
    _wortOrtVerdraengt(info) {
        const [S, reich] = [AnazhRealm._siedlungGesetz(), AnazhRealm.Gesetz("fachwerk:siedlungsReich")];
        for (const q of (this._bewohnerSiedlungen || new Map()).values()) {
            const n = q.plan.slots.length;
            if (!String(q.key).startsWith("d:") || n <= info.nH || info.stadt === q.key) continue; // das Viertel steht im Reich SEINES Kerns
            if (Math.hypot(q.ox - info.x, q.oz - info.z) < reich(S, info.nH) + reich(S, n)) return true;
        }
        return false;
    }
    // EINE ZELLE IM TAKT (`_tickAutoSettlement`): verworfen, im Vorlauf bereitet (`erwachen` false, der Vorlauf `_dorfVorlauf`) oder
    // erwacht (`erwachen` true, der Akt) — true, wenn der Takt dabei seinen EINEN Vorrat bzw. Dorf-Akt getan hat.
    // DER ORT MISST AM ORT, SEIN VORLAUF IST ZEIT (w13-dorf-strom): jeder Abstand gilt dem Ort, an dem die Zelle stehen wird —
    // dem Anker ihres Vorrats, sobald die Wahl steht (`_dorfBereiten`), davor der Stelle, die sie trägt
    // (`_autoSettlementFindSite`), nie dem Zellpunkt. Sie erwacht, sobald die Bahn ihren Ring `nah` binnen des Vorlaufs der Bahn
    // erreicht (`BEDARF.vorlaufS`), und bereitet sich vor (Export, Wahl, Wasser-Urteil, Grund), sobald die Bahn den Ring ihrer
    // Sicht (`vorlaufM` vor `nah`: so weit plant der Wald um den Ort, bevor er in den Kegel tritt) binnen `bereitS` erreicht
    // (`_bedarfZeit`) — im Stand sind es die Ringe selbst. Bis w13-dorf-strom maß der Takt am Zellpunkt in festen Strecken, im
    // Ring 2 erwachte nur die Stadt: in der Fahrt-Probe erwachte das Dorf −4,−4 (Zellpunkt 141 m hinter dem Anker) 124 m vor
    // dem Anker, die Orte im GT legten ihren Grund 269–301 m vor dem Anker — der Wald fiel im Kegel, 45–134 Bäume je Ort traten
    // ohne Gestalt ein.
    _autoSettlementZelle(cx, cz, playerPos, cells, erwachen) {
        const A = AnazhRealm.AUTO_SETTLEMENT;
        const key = cx + "," + cz;
        if ((cells && cells[key]) || this._autoSettlementRejected.has(key)) return false;
        const info = this._autoSettlementCellInfo(cx, cz);
        if (!info) {
            this._autoSettlementRejected.add(key); // Zelle trägt kein Dorf (Hash, verdrängt)
            return false;
        }
        if (this._wortOrtVerdraengt(info)) {
            this._autoSettlementRejected.add(key); // im Reich einer größeren Stadt des Worts (das Rang-Gesetz)
            return false;
        }
        const nah = A.nearM + info.mehrM; // die Stadt erwacht an ihrem Rand, das Dorf bei nearM (`mehrM` 0)
        const sicht = nah + A.vorlaufM;
        // DER VORLAUF IST DIE BAU-ZEIT (w28-stadt-netz): die Zelle erwacht, sobald die Bahn ihren Ring binnen der Zeit erreicht,
        // die ihr Zug brauchen wird (`_dorfBauZeit`: ihre Häuser durch die GEMESSENE Rate des Zugs, hinter dem offenen Zug) —
        // mindestens der Vorlauf der Bahn; um dieselbe Zeit früher bereitet sie sich vor. Bis hier galt `BEDARF.vorlaufS` (3 s)
        // für jeden Ort: der Zug einer Kachel (190 Häuser unter der EINEN Frist, GTX 5–9 Häuser/s) endete im Gang 49–68 m
        // HINTER ihrer Kante.
        const bau = Math.max(AnazhRealm.BEDARF.vorlaufS, Math.min(A.bauZeitMaxS, this._dorfBauZeit(info.nH)));
        const bereit = A.bereitS + bau - AnazhRealm.BEDARF.vorlaufS;
        const imRing = (x, z, r, T) =>
            (x - playerPos.x) ** 2 + (z - playerPos.z) ** 2 <= r * r || this._bedarfZeit(x, z, r) <= T;
        const w = this._dorfVorraete && this._dorfVorraete.get(key);
        // OHNE VORRAT FRAGT DER TAKT DIE STELLE NUR, WENN EIN AKT MÖGLICH IST: sie liegt höchstens `siteProbeR` Zellen neben dem
        // Zellpunkt (`um`) — erwachen kann die Zelle, wenn die Bahn diesen Ring um `nah` binnen ihres Vorlaufs erreicht, bereiten,
        // wenn sie den Ring der Sicht binnen `bereitS` erreicht (jeder Export fliegt, w28-ort-vor-wald). DIE WAHRHEIT VOR DEM URTEIL (wie der
        // Chunk-Bau, `_hydroSteht`): die Wasser-Wand der Stelle (`_landAt`) liest die Hydro-Kacheln um die Probe-Ringe — fehlt
        // eine, ist sie bestellt, und die Zelle wartet (kein Urteil, kein Verwerfen). Ein Takt, der am Zellpunkt maß, fragte die
        // Stelle erst im Ring; am Ort gemessen urteilte sie über die halb geladene Welt (gate:settlement C-K3: am Hang-Ort fiel
        // nach dem Sprung jede Zelle als „Wasser").
        const um = Math.max(...A.siteProbeR) * AnazhRealm._siedlungGesetz().cellM;
        let i3 = info;
        if (!w) {
            if (erwachen ? !imRing(info.x, info.z, nah + um, bau) : !imRing(info.x, info.z, sicht + um, bereit))
                return false;
            if (this._ensureHydroTilesAround(info.x, info.z, um)) return false;
            const site = this._autoSettlementFindSite(info); // Anker zuerst, dann die Probe-Ringe
            if (!site) {
                this._autoSettlementRejected.add(key); // die ganze Zelle untauglich (Wasser/steil/Spawn-nah)
                return false;
            }
            if (site.x !== info.x || site.z !== info.z) i3 = Object.assign({}, info, { x: site.x, z: site.z });
        }
        const ort = w || i3;
        if (erwachen) {
            if (!imRing(ort.x, ort.z, nah, bau)) return false;
            this._autoSettlementSpawnCell(cx, cz, i3);
        } else if (!w && imRing(ort.x, ort.z, sicht, bereit))
            this._dorfBereiten(key, i3).catch(this._ortWahlWartet(key));
        else return false;
        return true;
    }

    // DER ORT KEHRT WIEDER (speicher.K3, Lehre 7): der Stand trägt je Ort nur sein Gedächtnis (`settlementCells`), nie seine
    // Häuser und seinen Erdbau — der Zug der Wiederkehr hebt jeden Slot des Plans v2 `plan` (am Anker `c`), dessen Haus (sein
    // Same an seiner Mitte) nicht steht; was dort sonst steht, urteilt die Bau-Wand des Slots, eine Tat sperrt ihn
    // (`_tatSperrt`: ein abgebautes Haus kehrt nie zurück, sein Grund fällt mit dem Slot). Ein Reload mitten im Zug ist
    // derselbe Fall. Rückgabe: der Plan des offenen Zugs, seine Wandlaternen an ihren Slots.
    _dorfZugOffen(plan, c) {
        // liegt sein Grund schon (ein Zug, der in der Sitzung fiel, ein älterer Stand), trägt er die Höhe des Slots
        const gruende = this._erdbauRoh().filter((g) => g && g.art === "grund");
        const neu = new Map();
        const slots = [];
        (plan.slots || []).forEach((sl, i) => {
            const [x, z] = [c.x + sl.x, c.z + sl.z];
            if (this._dorfSteht(x, z, sl.seed >>> 0)) return;
            const g = gruende.find((q) => Math.abs(q.cx - x) < 0.05 && Math.abs(q.cz - z) < 0.05);
            neu.set(i, slots.length);
            slots.push(g ? Object.assign({}, sl, { y: g.y }) : sl);
        });
        // die Wandlaternen hängen an ihrem Slot im offenen Zug (die Reihe des Exports bleibt: ihr Same je Nummer)
        const laternen = (plan.laternen || []).map((l) =>
            l && l.wand ? Object.assign({}, l, { slot: neu.has(l.slot) ? neu.get(l.slot) : -1 }) : l
        );
        return Object.assign({}, plan, { slots, laternen });
    }
    // Der Bau eines Orts (sein Same `same`) an (x, z), oder undefined. Der Zug, der wiederkehrt, hebt nur, was nicht steht; das
    // Wachstum nimmt, was sein neuer Plan nicht trägt (`_ortWaechst`).
    _dorfHaus(x, z, same) {
        return this.state.architectures.find(
            (e) => e && e.seed === same && Math.abs(e.position.x - x) < 0.05 && Math.abs(e.position.z - z) < 0.05
        );
    }
    _dorfSteht(x, z, same) {
        return !!this._dorfHaus(x, z, same);
    }
    // Ist der Platz eines Stücks des Orts belegt — es steht schon, oder eine Tat nahm es? Er zählt dann als gesetzt: der Same
    // der folgenden Stücke bleibt der seiner ersten Gründung.
    _dorfBelegt(x, z, same) {
        return this._dorfSteht(x, z, same) || this._tatSperrt(x, z);
    }

    // DER STAND DER GRUNDRISSE FÄLLT AM ORT (K51-5, Lehre 25): ein neuer oder gefallener Grundriss (Bau, Lichtung, Fläche eines
    // Dorfs, Trittfläche) im Kasten x0…x1 · z0…z1 legt das Gitter neu an und nimmt der Gestalt des Orts (`_ortGestaltSame`)
    // nur die Antworten, die er ändern kann: ein Baum fragt die Natur-Wand für jeden Nachbarn bis ±4 Wald-Zellen
    // (`_forestStehtFrei`) samt dessen Krone — die Reichweite `ORT_SAME_REICH`. Bis K51-4 fiel jede Antwort der Welt mit
    // (Mess-Wiese gehend, Null-Renderer, 15 s: 14 Fälle, 10 772 `_forestStehtFrei`, 288 311 Sichthöhen). Ohne Kasten fällt alles.
    _grundrissFaellt(x0, z0, x1, z1) {
        const amOrt = [x0, z0, x1, z1].every(Number.isFinite);
        if (amOrt)
            this._grundrissAmOrt(x0, z0, x1, z1); // das Gitter legt nur den Kasten neu (`_grundrissAmOrt`)
        else this._grundrissGitter = null;
        if (!this._ortSame) return;
        if (!amOrt) {
            this._ortSame = null;
            this._ortSameGen = (this._ortSameGen | 0) + 1; // die Bereitschaft wartender Einträge fragt neu (`_bereitStand`)
            return;
        }
        const R = AnazhRealm.ORT_SAME_REICH;
        this._ortSameFaellt(x0 - R, z0 - R, x1 + R, z1 + R);
    }
    // Die Gestalt des Orts fällt in den Eimern, die der Kasten x0…x1 · z0…z1 (m) berührt — der EINE Räumer ihres Gedächtnisses
    // für jeden, der ihre Eingaben am Ort ändert: den Grundriss (`_grundrissFaellt`) und den Wald (`_forestDartsFallen`).
    _ortSameFaellt(x0, z0, x1, z1) {
        const M = this._ortSame;
        if (!M) return;
        const B = AnazhRealm.ORT_SAME_EIMER;
        for (let bx = Math.floor(x0 / B); bx <= Math.floor(x1 / B); bx++)
            for (let bz = Math.floor(z0 / B); bz <= Math.floor(z1 / B); bz++) {
                const ek = bx + "," + bz;
                const eimer = M.get(ek);
                if (!eimer) continue;
                this._ortSameN -= eimer.size;
                M.delete(ek);
                this._ortSameGen = (this._ortSameGen | 0) + 1; // die Gestalt am Ort kann wechseln (`_bereitStand`)
            }
    }

    // Weicht der Eintrag dem Bau? Die Natur (`_istNatur`) und jeder Wurf des Felds (die Marke `feldWurf`, die nur der Wurf
    // trägt: `_enqueueVegetationSpawn` → `spawnArchitecture`, eine Art aus `FELD_WURF`; die Feuerstelle des Glut-Felds ist Bau
    // ihrer Gestalt nach — Kollision, Grundriss, Trittfläche —, aber ein Wurf). Was weicht, sperrt keinem Ort den Grund
    // (`_bauFrei`) und fällt im Grundriss eines Baus und auf dem Weg eines Dorfs (`_naturRaeumen`). Bis K10-6 wich der Wurf nur,
    // wenn er NACH dem Bau kam: eine Feuerstelle im Grundriss des Orts 80 m weit schob die Ort-Wahl im Spiel auf 96 m. Es
    // entscheidet die HERKUNFT, nie die Art: bis K10-6 Nachbesserung 2 wich auch die Feuerstelle des Satzes und des Bau-Modus
    // jedem späteren Bau (gate:settlement Teil O „das Werk derselben Art"). Bis zur Wiederkehr wich auch das Werk eines Worts
    // aus dem Stoff der Natur (ein stein_block ist basalt): auf der Lichtung beim Satz erlaubt, beim Reload geräumt
    // (gate:persistence Teil W 0/2). Das Werk (`werk`, die Herkunft an der Wurzel `spawnArchitecture`) weicht nie.
    // Ein Tier weicht nach SEINER Herkunft: der Wurf des Felds (`userData.feldWurf`, `_kreaturWurf`), nie das gerufene Tier.
    _weichtDemBau(e) {
        if (!e || e.werk === true) return false;
        if (e.userData && e.userData.kind === "creature") return e.userData.feldWurf === true;
        return e.feldWurf === true || this._istNatur(e);
    }

    // ═══ DAS WEGENETZ DER WELT (fahrzeug.K2) ═══ Bis hier lag jedes Wege-Netz in seinem Dorf (`_bewohnerNetz`, 120–230 m), zwischen
    // den Orten stand der Wald: der Fahrer der Bündel-ABAB fuhr querfeldein, blieb im Wald hängen und setzte zurück (Anteil
    // 8–12 m/s 0,32–0,72), eine Route auf Wegen fuhr niemand. Jetzt verbindet ein Feldweg je zwei benachbarte Orte — wer
    // benachbart ist, sagt das Gesetz der Zellen (`_wegenetzNachbarn`), wie er läuft, das Gesetzbuch (fachwerk `wegZwischen`),
    // gelegt wird er, wenn beide Pläne stehen (`_wegenetzLegen`), über den Hebel der Dörfer (`_stlWegeBuild`: Boden, Natur-Wand).

    // DER GRUND EINES WEGE-NETZES (die Lage allein): das Wege-Netz des Plans aus dem Gesetzbuch (fachwerk `wegeNetz`: je Punkt
    // der Straßen und Feldwege ein Knoten, Folge und Kreuzung (`BEWOHNER.kreuzM`) seine Kanten, die Nähte, die es für die Breite
    // des Wagens (`WEGENETZ.halbM`) bis `WEGENETZ.nahtM` zu EINEM Netz schließen) am Ursprung (ox, oz) in der Welt —
    // {knoten, kanten: je Knoten die Paare j, Länge, naehte [[i, j]]}. Leser: das Netz der Bewohner (`_bewohnerNetz`), das
    // Wegenetz (`_wegenetzAnschluss` legt die Nähte als Feldweg) und die Route (`_wegenetzRoute`).
    _wegeNetzGrund(plan, ox, oz) {
        const W = AnazhRealm.WEGENETZ;
        const G = AnazhRealm.Gesetz("fachwerk:wegeNetz")(plan, AnazhRealm.BEWOHNER.kreuzM, W.halbM, W.nahtM);
        G.knoten = G.knoten.map((q) => ({ x: ox + q.x, z: oz + q.z, w: q.w, klasse: q.klasse }));
        return G;
    }

    // DIE NACHBARN EINES ORTS (Schlüssel der Zelle „cx,cz“ oder „start“) im Wegenetz: das Gesetz der Zellen nennt die Orte
    // (`_autoSettlementCellInfo` samt der Stelle, an der die Zelle siedelt, `_autoSettlementFindSite`; das Start-Dorf
    // `_autoSettlementStartInfo`) — benachbart sind zwei, die näher als `WEGENETZ.maxM` liegen und zwischen denen kein dritter
    // näher an beiden liegt (der Graph der relativen Nachbarschaft: jeder Ort hängt am Netz, kein Weg läuft an einem Ort
    // vorbei zum übernächsten). Eine reine Funktion der Welt-Saat, gemerkt je Saat — offen (undefined, nichts gemerkt), solange
    // ein Ort der Frage offen ist (`_zellOrt`: seine Stelle wartet auf ihr Wasser, die Frage bestellt es). Bis w19-fahrt-ziel-2
    // merkte sie den offenen wie keinen Ort, die halbe Nachbarschaft für immer: am Gate (frische Welt) sind die sechs Orte der
    // Route bei der ersten Frage offen, f69173b0 merkte jeden ohne Nachbarn; ihr Wasser steht nach 2,1 s, mit ihm trägt jeder
    // 3–4 Nachbarn und die Route 8 Feldwege.
    _wegenetzNachbarn(key) {
        const SG = AnazhRealm._siedlungGesetz();
        if (!SG) return [];
        const ws = AnazhRealm._saatJe(this);
        if (!this._wegenetzMemo || this._wegenetzMemo.ws !== ws) this._wegenetzMemo = { ws, nachbarn: new Map() };
        const M = this._wegenetzMemo;
        if (M.nachbarn.has(key)) return M.nachbarn.get(key);
        const ort = (k) => this._zellOrt(k);
        const a = ort(key);
        if (a === undefined) return undefined;
        const aus = [];
        if (a) {
            const W = AnazhRealm.WEGENETZ;
            // DIE KACHELN EINER STADT BRAUCHEN KEINEN FELDWEG (w28-stadt-netz): zwei Orte derselben Stadt (`stadt`, `_zellOrt`: die
            // Mitte und ihre Kacheln) sind nie Nachbarn des Wegenetzes — ihre Straßen treffen sich an der Kante selbst (fachwerk
            // `kachelNetz`). Für alles andere zählen sie wie jeder Ort: die Stadt hängt über ihre Rand-Kacheln an den Dörfern der
            // Welt, und eine Kachel auf halbem Weg trennt zwei Dörfer wie jeder Dritte.
            const R = Math.ceil(W.maxM / SG.cellM) + 1;
            const cx = Math.floor(a.x / SG.cellM);
            const cz = Math.floor(a.z / SG.cellM);
            const orte = [ort("start")];
            for (const s of this._staedte()) orte.push(ort(s.key)); // die Mitte jeder Stadt des Worts ist ein Ort des Netzes
            for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) orte.push(ort(cx + dx + "," + (cz + dz)));
            if (orte.includes(undefined)) return undefined;
            const d = (p, q) => Math.hypot(p.x - q.x, p.z - q.z);
            for (const b of orte) {
                if (!b || b.key === key || d(a, b) > W.maxM || (a.stadt && b.stadt === a.stadt)) continue;
                const ab = d(a, b);
                if (!orte.some((c) => c && c.key !== key && c.key !== b.key && Math.max(d(a, c), d(b, c)) < ab))
                    aus.push(b.key);
            }
        }
        M.nachbarn.set(key, aus);
        return aus;
    }

    // DER ORT HÄNGT SICH ANS NETZ: steht sein Plan (`_dorfErlebnis`), legt er die Nähte seines Netzes als Feldweg und den
    // Feldweg zu jedem Nachbarn, dessen Plan schon steht — der zweite Ort eines Paars legt ihn, gleich in welcher Folge sie erwachen (die Welt ist eine Funktion).
    _wegenetzAnschluss(key) {
        const B = this._bewohnerSiedlungen;
        if (!key || !B || !B.has(key)) return;
        const S = B.get(key);
        const G = S.netzGrund || (S.netzGrund = this._wegeNetzGrund(S.plan, S.ox, S.oz));
        const lok = (i) => ({ x: G.knoten[i].x - S.ox, z: G.knoten[i].z - S.oz });
        const feldwege = G.naehte.map(([i, j]) => ({ pts: [lok(i), lok(j)], w: AnazhRealm.WEGENETZ.breiteM }));
        if (feldwege.length) this._stlWegeBuild({ feldwege }, { x: S.ox, z: S.oz }, "netz:" + key); // die Nähte seines Netzes
        // ist die Nachbarschaft offen, wartet der Anschluss auf das bestellte Wasser und fragt neu (wie `_ortWahlImFaden`)
        const legen = (runde) => {
            if (this._bewohnerSiedlungen !== B || B.get(key) !== S) return; // der Ort ging, ehe sein Wasser kam
            const nb = this._wegenetzNachbarn(key);
            if (nb) {
                for (const n of nb) if (B.has(n)) this._wegenetzLegen(key, n);
            } else if (runde < 8) {
                Promise.all([...this._hydroBestellt.values()].map((e) => e.zusage)).then(() => legen(runde + 1));
            } else this._bruchMelden(`WEGENETZ: die Nachbarschaft von ${key} bleibt offen — ihr Wasser kam nicht`);
        };
        legen(0);
    }

    // DER FELDWEG ZWISCHEN ZWEI ORTEN: er setzt an ihren Feldwegen an (die Flucht der Straße: an einem Punkt mitten in der
    // Gasse bog die Route rechtwinklig ab, der Fahrer kroch um 12 Ecken mit 2–5 m/s); das Raster liegt um das Paar ihrer
    // Punkte, das sich am nächsten kommt, das Höhen-Raster (gelaende-core `hoehenRaster`) und den Lauf über ihm von den
    // Feldwegen des einen Orts zu denen des anderen (fachwerk `wegZwischen`: der günstigste über den Grund) rechnet der Ort-Faden (`ort-weg`,
    // Lehre 14). Gelegt als Feldweg des Wege-Hebels (`_stlWegeBuild`, Schlüssel „netz:a|b“: der Boden malt ihn, die Natur-Wand
    // hält ihn frei, was schon auf ihm stand, räumt der Takt) und gemerkt als Kante des Netzes (`_wegenetzKanten`). Trägt der
    // Grund keinen Weg, sagt es das Log beim Namen der Orte.
    _wegenetzLegen(ka, kb) {
        const paar = ka < kb ? ka + "|" + kb : kb + "|" + ka;
        const K = this._wegenetzKanten || (this._wegenetzKanten = new Map());
        if (K.has(paar)) return K.get(paar).fertig;
        const W = AnazhRealm.WEGENETZ;
        const B = this._bewohnerSiedlungen;
        // der Anschluss eines Orts: jeder Punkt seiner Feldwege (sie verlassen das Dorf in der Flucht seiner Straßen; nur an
        // ihrem Ende lief der Weg am Dorf −1,−5 70 m neben ihm zurück — die Haarnadel, an der der Fahrer festsaß), ohne Feldweg
        // jeder Punkt seiner Wege
        const anschluss = (S) => {
            const fw = (S.plan.feldwege || []).flatMap((f) => f.pts || []).filter(Boolean);
            const G = S.netzGrund || (S.netzGrund = this._wegeNetzGrund(S.plan, S.ox, S.oz));
            return fw.length ? fw.map((q) => ({ x: S.ox + q.x, z: S.oz + q.z })) : G.knoten;
        };
        const naechster = (P, p) =>
            P.reduce((a, q) => ((q.x - p.x) ** 2 + (q.z - p.z) ** 2 < (a.x - p.x) ** 2 + (a.z - p.z) ** 2 ? q : a));
        const [Sa, Sb] = [B.get(ka), B.get(kb)];
        const [Aa, Ab] = [anschluss(Sa), anschluss(Sb)];
        const pa = naechster(Aa, { x: Sb.ox, z: Sb.oz });
        const pb = naechster(Ab, pa);
        const mx = (pa.x + pb.x) / 2;
        const mz = (pa.z + pb.z) / 2;
        const lang = Math.hypot(pb.x - pa.x, pb.z - pa.z);
        const m = Math.ceil((lang / 2 + Math.max(W.randM, lang * W.randAnteil)) / W.schrittM);
        const kante = { a: ka, b: kb, pts: null };
        kante.fertig = this._nebenAuftrag("ort", {
            type: "ort-weg",
            x: mx,
            z: mz,
            rahmen: { x0: -m * W.schrittM, z0: -m * W.schrittM, d: W.schrittM, n: 2 * m + 1 },
            a: Aa.map((q) => ({ x: q.x - mx, z: q.z - mz })),
            b: Ab.map((q) => ({ x: q.x - mx, z: q.z - mz })),
            W: AnazhRealm.ORT_WAHL, // das Urteil über das Wasser (`ortNass` im Faden): wie bei der Wahl des Orts
            M: AnazhRealm.WERK_LAND_M,
            wegHalbM: W.breiteM / 2,
            // was dem Weg in beiden Orten im Weg steht (fachwerk `planSperren`), in den Koordinaten des Rasters
            sperren: [Sa, Sb].flatMap((S) =>
                AnazhRealm.Gesetz("fachwerk:planSperren")(S.plan, S.ox - mx, S.oz - mz, W.halbM)
            ),
        }).then(
            (antwort) => {
                const lok = antwort.pts;
                if (!lok) {
                    this.log(
                        `WEGENETZ: zwischen ${ka} und ${kb} (${lang.toFixed(0)} m) trägt der Grund keinen Weg`,
                        "INFO"
                    );
                    return null;
                }
                this._stlWegeBuild({ feldwege: [{ pts: lok, w: W.breiteM }] }, { x: mx, z: mz }, "netz:" + paar);
                const welt = lok.map((q) => ({ x: q.x + mx, z: q.z + mz }));
                // wo er Wasser quert, trägt ihn die Brücke (fachwerk `brueckenAmWeg`: je Punkt das Wasser und die Höhe aus dem
                // Faden), und über dem Wasser läuft er auf ihrer Achse (`wegUeberBruecken`) — die Kante des Netzes, die der Fahrer fährt
                const sp =
                    antwort.nass && antwort.ys
                        ? AnazhRealm.Gesetz("fachwerk:brueckenAmWeg")(welt, antwort.nass, antwort.ys)
                        : [];
                kante.pts = AnazhRealm.Gesetz("fachwerk:wegUeberBruecken")(
                    welt,
                    sp.map((s) => [s.wa, s.wb])
                );
                if (sp.length) this._brueckenLegen(sp, "netz:" + paar);
                this._markSteinSetzen(kante.pts, antwort.nass, Sa, Sb, paar);
                return kante;
            },
            (e) => {
                K.delete(paar); // der nächste Anschluss fragt neu
                this.log(`WEGENETZ: der Weg zwischen ${ka} und ${kb} fehlt — ${(e && e.message) || e}`, "INFO");
                return null;
            }
        );
        K.set(paar, kante);
        return kante.fertig;
    }

    // DER MARKSTEIN AM FELDWEG (ort-ausstattung, Leiter mensch.macht.grenze): wo der Weg zwischen den Orten Sa und Sb das Reich
    // des einen verlässt (fachwerk `grenzeAmWeg`: die Nähe nach dem Reich, `siedlungsReich` über die Häuser des Plans), steht neben
    // ihm der Stein (`markstein_dorf`, seine Gestalt im Wort `__gestalt`, die Stirnen längs des Wegs) — aus dem Gesetz
    // (`ausGesetz`: jeder Boot setzt ihn neu), je Paar einmal je Sitzung, auf dem Grund (der Fuß `grundM` in ihm), der Same aus
    // dem Paar. Der Weg ist der Feldweg des Paars `pts` (Welt; `nass` je Punkt das Wasser aus dem Faden), dann die Nähte beider
    // Netze (`_wegeNetzGrund`), dann ihre Straßen und Feldwege — die Straße eines Orts reicht über sein Reich hinaus: am Paar
    // −1,−5|0,−5 lief die des einen 240 m bis vor die Mitte des anderen, der Feldweg des Paars lag ganz in dessen Reich, die
    // Grenze auf der Straße. Bis hier stand zwischen zwei Orten kein Zeichen: die Grenze war nirgends zu sehen. Trägt der Weg
    // keinen Stein, sagt es das Log beim Namen des Paars. Rückgabe: das Werk.
    _markSteinSetzen(pts, nass, Sa, Sb, paar) {
        const typ = "markstein_dorf";
        if (!pts || !this.state.blueprints || !this.state.blueprints[typ]) return null;
        const K = this._grenzSchluessel || (this._grenzSchluessel = new Set());
        if (K.has(paar)) return null;
        K.add(paar);
        const [SG, reich] = [AnazhRealm._siedlungGesetz(), AnazhRealm.Gesetz("fachwerk:siedlungsReich")];
        const ort = (S) => ({ x: S.ox, z: S.oz, r: reich(SG, S.plan.slots.length) });
        const seed = Math.floor(this._rollGenome("grenze:" + paar, "markstein").axis("stein") * 4294967296) >>> 0;
        const halbM = AnazhRealm.WEGENETZ.breiteM / 2;
        const wege = [{ pts, halbM, nass }];
        for (const S of [Sa, Sb]) {
            const G = S.netzGrund || (S.netzGrund = this._wegeNetzGrund(S.plan, S.ox, S.oz));
            for (const [i, j] of G.naehte) wege.push({ pts: [G.knoten[i], G.knoten[j]], halbM });
            for (const w of (S.plan.roads || []).concat(S.plan.feldwege || []))
                wege.push({
                    pts: (w.pts || []).map((q) => ({ x: S.ox + q.x, z: S.oz + q.z })),
                    halbM: (w.w || 2 * halbM) / 2,
                });
        }
        const grenze = AnazhRealm.Gesetz("fachwerk:grenzeAmWeg");
        let g = null;
        for (let n = 0; n < wege.length && !g; n++)
            g = grenze(wege[n].pts, ort(Sa), ort(Sb), wege[n].halbM, seed, wege[n].nass || null);
        const y = g ? this.getTerrainHeightAt(g.x, g.z) : NaN;
        if (!g || !Number.isFinite(y) || !this._landAt(g.x, g.z, 0.2)) {
            this.log(
                `GRENZE: am Weg ${paar} steht kein Stein — ${g ? "seine Stelle trägt kein Land" : "der Weg kreuzt kein Reich"}`,
                "INFO"
            );
            return null;
        }
        return this.spawnArchitecture(
            typ,
            { x: g.x, y: y + 0.5, z: g.z },
            {
                seed,
                rotationY: g.th,
                studioOv: { __gestalt: g.gestalt },
                silent: true,
                precise: true,
                ausGesetz: true,
            }
        );
    }

    // DIE BRÜCKE LIEGT (fahrzeug.K2): je Spanne {a, b} ({x, z, y} der Widerlager in der Welt) die Jochfelder des Gesetzes (fachwerk
    // `brueckenFelder`) als Werke der Welt — der Bauplan der Wirts-Zeile B7 des Buchs (`bruecke_jochfeld`: Trittfläche, Geländer,
    // Joch, Durchlass), aus dem Gesetz (`ausGesetz`: der Stand trägt sie nie, jeder Boot legt sie neu), der Same je Spanne und
    // Feld aus dem Schlüssel (die Gasse eines Orts „dorf:…“, der Feldweg eines Paars „netz:…“), je Schlüssel einmal je Sitzung.
    // Bis hier querte jeder Weg das Wasser als Furt: das Brücken-Etikett des Plans reiste unkonsumiert, der Feldweg kannte keins.
    // Rückgabe: die Zahl der gelegten Felder.
    _brueckenLegen(spannen, schluessel) {
        const typ = "bruecke_jochfeld";
        if (!spannen || !spannen.length || !this.state.blueprints || !this.state.blueprints[typ]) return 0;
        const K = this._brueckenSchluessel || (this._brueckenSchluessel = new Set());
        if (K.has(schluessel)) return 0;
        K.add(schluessel);
        const felder = AnazhRealm.Gesetz("fachwerk:brueckenFelder");
        const same = this._rollGenome(schluessel, "bruecke");
        let n = 0;
        spannen.forEach((sp, si) =>
            felder(sp.a, sp.b).forEach((f, fi) => {
                const e = this.spawnArchitecture(
                    typ,
                    { x: f.x, y: f.y + 0.5, z: f.z },
                    {
                        seed: Math.floor(same.axis(si + ":" + fi) * 4294967296) >>> 0,
                        rotationY: f.phi,
                        silent: true,
                        precise: true,
                        ausGesetz: true,
                    }
                );
                if (e) n++;
            })
        );
        return n;
    }

    // DIE ROUTE ÜBER DAS NETZ: vom Knoten, der dem ersten Punkt von `ueber` (Welt x/z) am nächsten liegt, durch die übrigen der
    // Reihe nach — je Bein der kürzeste Weg zum erreichbaren Knoten, der dem Punkt am nächsten liegt, über die Wege-Netze der Orte
    // (`_wegeNetzGrund`) und die gelegten Feldwege zwischen ihnen (je Ende an dem Knoten, an dem es beginnt). Rückgabe: die
    // Punkte der Route ([{x, z}]) oder null (ein Bein kommt nicht vom Fleck). Leser: der Fahrer (`fahrerSetzen`), die Linse.
    _wegenetzRoute(ueber) {
        const knoten = [];
        const kanten = [];
        const kante = (i, j) => {
            const w = Math.hypot(knoten[i].x - knoten[j].x, knoten[i].z - knoten[j].z);
            kanten[i].push(j, w);
            kanten[j].push(i, w);
        };
        // die Netze der Orte; wo zwei Orte sich berühren, verbindet sie jedes Knotenpaar näher als `kreuzM` (die Kreuzung, wie
        // im Netz eines Orts, fachwerk `wegeNetz`: am Rand von −1,−5 und 0,−5 lagen Feldweg und Straße 0,45 m nebeneinander,
        // unverbunden — die Route lief 30 m zurück und wieder vor)
        const kreuzM = AnazhRealm.BEWOHNER.kreuzM;
        const fach = new Map();
        for (const S of (this._bewohnerSiedlungen || new Map()).values()) {
            const G = S.netzGrund || (S.netzGrund = this._wegeNetzGrund(S.plan, S.ox, S.oz));
            const o = knoten.length;
            for (let i = 0; i < G.knoten.length; i++) {
                const q = G.knoten[i];
                knoten.push(q);
                kanten.push(G.kanten[i].map((v, k) => (k % 2 ? v : v + o)));
                const [fx, fz] = [Math.floor(q.x / kreuzM), Math.floor(q.z / kreuzM)];
                for (let dx = -1; dx <= 1; dx++)
                    for (let dz = -1; dz <= 1; dz++)
                        for (const j of fach.get(fx + dx + "," + (fz + dz)) || [])
                            if (j < o && (knoten[j].x - q.x) ** 2 + (knoten[j].z - q.z) ** 2 < kreuzM * kreuzM)
                                kante(j, knoten.length - 1);
                const f = fx + "," + fz;
                if (!fach.has(f)) fach.set(f, []);
                fach.get(f).push(knoten.length - 1);
            }
        }
        const naechster = (p, bis) => {
            let best = -1;
            let bd = bis * bis;
            for (let i = 0; i < knoten.length; i++) {
                const d = (knoten[i].x - p.x) ** 2 + (knoten[i].z - p.z) ** 2;
                if (d < bd) [best, bd] = [i, d];
            }
            return best;
        };
        for (const k of (this._wegenetzKanten || new Map()).values()) {
            if (!k.pts) continue;
            const [a, b] = [naechster(k.pts[0], 1), naechster(k.pts[k.pts.length - 1], 1)];
            let vor = a;
            for (let i = 1; i + 1 < k.pts.length; i++) {
                knoten.push({ x: k.pts[i].x, z: k.pts[i].z, klasse: "feldweg" });
                kanten.push([]);
                if (vor >= 0) kante(vor, knoten.length - 1);
                vor = knoten.length - 1;
            }
            if (vor >= 0 && b >= 0) kante(vor, b);
        }
        const zug = [];
        // DER ZUGANG DES ANFANGS (das Einrasten der Routen-Planer mit Zugangskosten, OSRM · Valhalla): jeder Knoten bis
        // `WEGENETZ.zugangM` hinter dem nächsten ist eine Quelle, sein Abstand zum ersten Punkt ihr Anfang — die Route beginnt am
        // Weg, der am kürzesten trägt, nie am nächsten Knoten. Bis hier begann sie dort: 78 m von der Mess-Wiese auf einem
        // Feldweg nach Westen, 30 m später die Kehre über die spitze Gabel zurück nach Osten (R 6,5 m, 145°) — der Fahrer stand
        // 600 Takte in ihr.
        const n0 = naechster(ueber[0], Infinity);
        const zugang =
            n0 < 0
                ? []
                : knoten.flatMap((q, i) => {
                      const d = Math.hypot(q.x - ueber[0].x, q.z - ueber[0].z);
                      const d0 = Math.hypot(knoten[n0].x - ueber[0].x, knoten[n0].z - ueber[0].z);
                      return d <= d0 + AnazhRealm.WEGENETZ.zugangM ? [[i, d]] : [];
                  });
        for (let u = 0, s = n0; u + 1 < ueber.length; u++) {
            if (s < 0) return null;
            const dist = new Float64Array(knoten.length).fill(Infinity);
            const von = new Int32Array(knoten.length).fill(-1);
            const offen = [];
            for (const [i, d] of u ? [[s, 0]] : zugang) {
                dist[i] = d;
                offen.push(i);
            }
            while (offen.length) {
                let bi = 0;
                for (let i = 1; i < offen.length; i++) if (dist[offen[i]] < dist[offen[bi]]) bi = i;
                const i = offen[bi];
                offen[bi] = offen[offen.length - 1];
                offen.pop();
                for (let e = 0; e < kanten[i].length; e += 2) {
                    const j = kanten[i][e];
                    const nd = dist[i] + kanten[i][e + 1];
                    if (nd < dist[j]) {
                        if (dist[j] === Infinity) offen.push(j);
                        dist[j] = nd;
                        von[j] = i;
                    }
                }
            }
            // das Ziel des Beins: der erreichte Knoten, der dem Punkt am nächsten liegt
            let t = -1;
            for (let i = 0; i < knoten.length; i++)
                if (
                    dist[i] < Infinity &&
                    (t < 0 ||
                        (knoten[i].x - ueber[u + 1].x) ** 2 + (knoten[i].z - ueber[u + 1].z) ** 2 <
                            (knoten[t].x - ueber[u + 1].x) ** 2 + (knoten[t].z - ueber[u + 1].z) ** 2)
                )
                    t = i;
            if (von[t] < 0) return null;
            const bein = [];
            for (let i = t; i >= 0; i = von[i]) bein.push(i);
            bein.reverse();
            for (const i of zug.length ? bein.slice(1) : bein) {
                // eine Kehre auf demselben Weg (das Bein läuft zurück, woher das vorige kam) fällt aus der Route
                if (zug.length > 1 && zug[zug.length - 2] === i) zug.pop();
                else zug.push(i);
            }
            s = t;
        }
        // je Punkt das Entwurfs-Tempo seiner Wegeklasse (`WEGENETZ.entwurfKmh`, m/s): das Tempo, das der Weg trägt — der Fahrer
        // fährt nie schneller, und an ihm misst sich seine Fahrt (fahrzeug.K2)
        return zug.map((i) => {
            const vz = AnazhRealm.WEGENETZ.entwurfKmh[knoten[i].klasse] / 3.6;
            if (!(vz > 0)) throw new Error("WEGENETZ: der Knoten trägt keine Wegeklasse (" + knoten[i].klasse + ")");
            return { x: knoten[i].x, z: knoten[i].z, vz };
        });
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_ort]);

// ===== ATLAS · Siedlung/ort — Außen-Konstanten =====
// DAS WEGENETZ DER WELT (fahrzeug.K2): maxM = so weit liegen zwei Orte höchstens auseinander, die ein Feldweg verbindet ·
// breiteM = seine Breite · schrittM = die Teilung des Rasters, über dem sein Lauf dem Grund folgt (fachwerk `wegZwischen`) ·
// randM / randAnteil = so weit (mindestens / je Länge) reicht das Raster seitlich über die Luftlinie (der Saumpfad weicht) ·
// halbM = die halbe Breite des Wagens, für die eine Naht im Netz eines Orts frei sein muss · nahtM = so weit schließt eine Naht
// eine Lücke (fachwerk `wegeNetz`; die Lücken der Straßen eines Dorfs: 18–41 m) · zugangM = so weit hinter dem nächsten Knoten
// sucht der Anfang einer Route seinen Zugang zum Netz (`_wegenetzRoute`) · entwurfKmh = das Entwurfs-Tempo je Wegeklasse (fachwerk
// `WEGE_KLASSE`; RASt 06: Ortsdurchfahrt 50, Wohnstraße 30, Gasse 20–30 km/h; DWA-A 904, ländlicher Wegebau: Feldweg 30–40 km/h) —
// das Tempo, das der Weg trägt: der Fahrer fährt höchstens so schnell, und die Fahrt misst sich daran (fahrzeug.K2: ≥ 80 % der
// Takte über 0,8 × min(vmax, Entwurfs-Tempo)).
AnazhRealm.WEGENETZ = Object.freeze({
    maxM: 720,
    breiteM: 3.4,
    schrittM: 4,
    randM: 60,
    randAnteil: 0.35,
    halbM: 1.2,
    nahtM: 48,
    zugangM: 60,
    entwurfKmh: Object.freeze({ ortsdurchfahrt: 50, wohnstrasse: 30, gasse: 25, feldweg: 40 }),
});
// DAS LAND EINES WERKS (m über dem Wasser des Gesetzes, `_fundamentLand` → `_landAt`): so hoch liegt jeder Punkt eines
// Fundaments samt Saum und Vorplatz über dem Spiegel — die Wand jedes Werks und die Ort-Wahl (`ortTraegt` im Ort-Faden) urteilen gleich.
AnazhRealm.WERK_LAND_M = 0.2;
// DIE AUSSTATTUNG EINES ORTS (`_ausstattungSame`): je Art der Versatz ihres Samens und ihre Kappe (Brunnen: der Kernel-Brunnen und je
// 8 Häuser einer; Stände: Markt-Plätze; Hof-Bäume: das Architektur-LOD/Instanzen-Budget; die Laterne zählt die Liste des Plans)
// DIE STÜCKE (`_ortStuecke`, `_dorfErlebnis`): eine Art mit `bauplan` steht aus der Schicht `schicht` des Plans (in
// `gegenstaende` die Einträge ihrer Art), gedreht nach `gier(q, plan)` — der Stand nach seinem Plan (`th`: die Reihen des
// Markts der Stadt), sonst zur Mitte des Platzes (die Front −z des Gesetzbuch-Stands, dieselbe Regel wie das Labor-Dorf); das
// Grab in der Flucht seines Friedhofs. Kappen: der Markt der Stadt trägt bis 12 Stände (das Dorf 2–3), der Friedhof 36 Gräber.
AnazhRealm.ORT_AUSSTATTUNG = Object.freeze({
    laterne: Object.freeze({ ab: 97 }),
    brunnen: Object.freeze({ ab: 0, kappe: 5, bauplan: "brunnen_dorf", schicht: "brunnen" }),
    stand: Object.freeze({
        ab: 53,
        kappe: 12,
        bauplan: "marktstand_dorf",
        schicht: "staende",
        gier: (st, plan) => {
            const pz = plan.platz;
            if (Number.isFinite(st.th)) return st.th;
            return pz && Number.isFinite(pz.cx) ? Math.atan2(-(pz.cx - st.x), -(pz.cz - st.z)) : 0;
        },
    }),
    baum: Object.freeze({ ab: 31, kappe: 12 }),
    grabstein: Object.freeze({
        ab: 71,
        kappe: 36,
        bauplan: "grabstein_dorf",
        schicht: "gegenstaende",
        gier: (q) => q.th || 0,
    }),
    // DAS SCHILD (ort-ausstattung, fachwerk `ortAusstattung`): je Sonderbau eines an seiner Tür-Wand, ein Stück am Haus (`slot`),
    // gedreht wie die Wandlaterne (+x der Gestalt zur Wand nach `th`); keine Kappe über die Häuser hinaus — es steht mit seinem Haus
    schild: Object.freeze({
        ab: 113,
        bauplan: "schild_dorf",
        schicht: "gegenstaende",
        gier: (q) => (Number.isFinite(q.th) ? -q.th : 0),
    }),
    // DAS HAUSZEICHEN (ort-ausstattung, fachwerk `ortAusstattung`): je Rolle des Orts EIN Bild ihres Gewerbes an der Tür-Wand
    // ihres ersten Baus, der es trägt — ein Stück am Haus wie das Schild (`slot`, +x zur Wand nach `th`)
    relief: Object.freeze({
        ab: 127,
        bauplan: "relief_dorf",
        schicht: "gegenstaende",
        gier: (q) => (Number.isFinite(q.th) ? -q.th : 0),
    }),
    // DAS MARKTKREUZ (ort-ausstattung, fachwerk `ortAusstattung`): der Markt trägt EINES ab dem Jahr seines Rechts, frei am Platz
    denkmal: Object.freeze({
        ab: 137,
        kappe: 1,
        bauplan: "denkmal_dorf",
        schicht: "gegenstaende",
        gier: (q) => q.th || 0,
    }),
});
// DAS WACHSTUM DER ORTE IN DER WELT (siedlung.K4 Staffel 2, `_ortWachstumTakt`): je so viele s der Welt-Uhr rechnet ein naher
// Ort sein Gesetz (fachwerk `wachstum`, taktfrei: ein seltenerer Takt holt nach) und zeigt, was gewachsen ist
AnazhRealm.SIEDLUNG_WACHS = Object.freeze({ taktS: 300 });
// DAS REICH EINES KOMMENDEN ORTS (`_imReichEinesOrts`): so viele Zellen um die eigene fragt die Geburt. Der Anker einer Zelle
// liegt in ihrer Mitte ± ¼ Zelle (fachwerk `siedlungsZelle`), ihre Stelle bis zur weitesten Probe daneben (`siteProbeR` 0,3 Zelle)
// — eine Zelle k Zellen fort trägt ihren Ort mindestens (k − 1,05) × 256 m weit, die nächste jenseits von 3 also ≥ 755 m; die
// größte Stadt (GROESSE_WAND 500 Häuser) reicht 30 + 22·√500 = 522 m. Ein Reich über der Grenze bricht laut.
AnazhRealm.ORT_REICH_ZELLEN = 3;
AnazhRealm.AUTO_SETTLEMENT = Object.freeze({
    nearM: 260,
    // der Ring der Sicht vor `nearM` (siedlung.K5, `_autoSettlementZelle`): so weit vor dem Erwachen plant der Wald um den Ort —
    // sein Grund liegt, bevor der Wald dort plant (Fahrt-Probe w13-dorf-strom: der Grund ≥ 398 m vor dem Anker kostet keinen
    // Baum im Kegel, 269–301 m 45–134 Bäume)
    vorlaufM: 160,
    // DER VORLAUF IST ZEIT (w13-dorf-strom, `_bedarfZeit`): so viele Sekunden vor dem Ring der Sicht bereitet sich ein Ort vor
    // (Export, Ort-Wahl, Wasser-Urteil, Grund) — der Export wartete im GT hinter der Foundry bis 8,3 s (Cloud, Fahrt-Probe dorf)
    bereitS: 10,
    // DER VORLAUF IST DIE BAU-ZEIT (w28-stadt-netz, `_dorfBauZeit`): weiter voraus als so viele Sekunden weckt die gemessene Rate
    // des Zugs keinen Ort (die gerade Bahn trägt darüber keine Aussage, und der Takt fragte sonst jede Zelle bis zum Horizont)
    bauZeitMaxS: 30,
    spawnClearM: 320,
    siteProbeR: Object.freeze([0.15, 0.3]),
    startRingeM: Object.freeze([24, 48, 72]),
    // so viele Häuser des Vorrats bestellen ihre Studio-Stufen vor dem Erwachen (`_dorfVorbacken`)
    vorbackHaeuser: 4,
    // so viel Weg des Spielers, und der Vorrat liest die Reihe des Zugs neu (`_dorfVorbacken`, sk5-haus)
    vorbackNeuM: 8,
    // die Laternen je Rate des Erlebnis-Gangs (`_dorfErlebnis`, stadt-erwachen)
    laternenJeTakt: 32,
    // die Zellen des Erdbaus je Rate seines Wasser-Urteils (`_dorfErwachen`, stadt-erwachen)
    wasserZellenJeTakt: 200,
});
// DER EINE SIEDLUNGS-GESETZ-LESER (Zensus 17.07.): das Memo setzt der Buch-Ingest (`_foundryIngestSiedlung`, validiert
// ganz-oder-gar-nicht); kaltes Buch → null: ohne Gesetz entsteht kein Dorf (fail-closed, die Leser prüfen), nie ein
// Ersatz-Gesetz.
AnazhRealm._siedlungGesetz = function () {
    return AnazhRealm._siedlungGesetzMemo || null;
};
// Max Foundry-Baum-Bauten je Frame (kein 300-Burst-Main-Thread-Spike). Klein halten — jeder
// Bau lädt bis ~170k Verts als WebGPU-Buffer hoch; der per-Frame-Drain (_tickFoliageGrowth,
// budget-gegated) tropft sie rein, wenn der Frame Luft hat. Tunable (Schöpfer-GPU balanciert).
AnazhRealm.FOUNDRY_BUILD_PER_TICK = 4;
// Der EINE Platz-Leser (Leben-Schau 2, fahr-bahn): das Platz-Gesetz eines Wagens, den die Welt hinstellt (vehicle-core
// fahrPlatz + FAHR.platz: Anfahrt-Anteil, Such-Schritt, Such-Radius). Fail-closed: ein Kern ohne Platz-Gesetz bricht laut,
// nie stellt die Welt einen Wagen still ungeprüft hin. Memo je Kern-Objekt.
AnazhRealm._fahrPlatzGesetz = function () {
    const vc = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
    const memo = AnazhRealm._fahrPlatzMemo;
    if (memo && memo.vc === vc) return memo;
    const P = vc && vc.FAHR && vc.FAHR.platz;
    if (
        P &&
        typeof vc.fahrPlatz === "function" &&
        typeof vc.fahrPlatzGrenze === "function" &&
        ["anfahrAnteil", "bahnLaengen", "suchRadiusM", "suchSchrittM", "richtungen"].every((k) =>
            Number.isFinite(P[k])
        ) &&
        P.suchSchrittM > 0 &&
        P.richtungen >= 1
    ) {
        AnazhRealm._fahrPlatzMemo = { vc, P };
        return AnazhRealm._fahrPlatzMemo;
    }
    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.platz/fahrPlatz");
};
// DER GENESIS-ORT IM TAKT (Pflicht F, `_genesisOrt`): so viele neue Elemente des Plans je Takt (1×/s) — die zehn Tore und
// zwei Kern-Werke stehen im ersten (Lehre 25: kein Takt baut den ganzen Platz).
AnazhRealm.GENESIS_JE_TAKT = 12;
// DAS GEDÄCHTNIS DER GESTALT DES ORTS (K51-5, `_ortGestaltSame`): Eimer in Metern und die Reichweite eines Grundrisses — ein
// Baum fragt die Natur-Wand für Nachbarn bis ±4 Wald-Zellen (5 × 12 m bis zur fernsten Ecke) samt deren Krone (≤ 36 m,
// `KRONE_MAX_M`: die größte Krone eines Darts; auch die Reichweite, in der ein Erdbau Darts fällt, `_forestDartsFallen`)
AnazhRealm.KRONE_MAX_M = 36;
AnazhRealm.ORT_SAME_EIMER = 48;
// DER PLATZ DES VORSCHAU-WAGENS im Takt (`_ensurePortalPreview`): so viele Orte der Platz-Suche (`_fahrPlatzWege`) je Takt —
// je Ort eine Ebene der Räder (4 Proben des Bodens, ~0,13 ms), an einem tragenden Ort die Bahn und die Welt.
AnazhRealm.FAHR_PLATZ_JE_TAKT = 6;
// Offener Flügel-Winkel der Welt-Tore (Nähe öffnet): wohnt NUR im porta-Gesetzbuch
// (__portaCore.TUER_GESETZ.offen — Shell UND Welt lesen die EINE Quelle); Leser fail-closed nach dem
// _sprintMulGesetz-Muster (Gesetz() memoisiert je Pfad).
AnazhRealm._tuerOffenRad = function () {
    const o = AnazhRealm.Gesetz("porta:TUER_GESETZ.offen", null);
    if (Number.isFinite(o) && o > 0) return o;
    return AnazhRealm._kernPflichtBruch("porta:TUER_GESETZ.offen");
};
// Die Fern-Pose der Tor-Flügel (K43-2): der Anteil von `offen`, in dem die Flügel jenseits der Tür-Nähe stehen — die Stufe 1
// trägt ihn im Körper (porta-core `baueStufe`), die Stufe 0 öffnet von ihm (`_tickTorFluegel`). Fail-closed.
AnazhRealm._tuerFernAnteil = function () {
    const f = AnazhRealm.Gesetz("porta:TUER_GESETZ.fern", null);
    if (Number.isFinite(f) && f >= 0 && f <= 1) return f;
    return AnazhRealm._kernPflichtBruch("porta:TUER_GESETZ.fern");
};
// DIE WELT-AKTE DER DSL (0710-7): jeder Op, der die Welt, ihre Wesen oder den Spieler verändert — Bauten und Spawns, der
// Boden und seine Sichtbarkeit, Zeit und Himmel, die Würfel auf Größe/Tempo/Farbe/Stimmung der Tiere, die Werte und die
// Ausrüstung des Spielers, das Feld. Unter dem Halt einer Messung (`_messHalt`) verweigert `dslEval` jeden von ihnen; das Wetter hält sein eigener
// Schreiber (`_setWeather`). Nicht hier: Definitionen (define_* · set_*_role · register_tool …), Erzählung (say ·
// record_narrative) und Kontrollfluss — sie verändern keine gemessene Welt. gate:weltakt-wache hält den Pool des Nexus
// (`dslComposeAtomic`) in dieser Liste.
// DIE QUELLEN DES SPIELERS (`_spielerVerlangt`, neben „human"): der Begleiter, der seinen Satz ausführt, und seine Werkzeuge —
// die Fähigkeit per Taste, das Wirken, der Verzehr (gate:settlement C7).
AnazhRealm.SPIELER_QUELLEN = Object.freeze(["llm:", "ability:", "capability:", "consume:"]);

// Große Strukturen werden footprint-bewusst aus dem Spieler-Bereich geschoben (sonst Remesh seines
// Chunks + Überlappung → Fall durch den Boden); kleine, intentional platzierte bleiben unangetastet.
AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN = 3.5; // m über den Footprint hinaus
// Der Satz der Welt, wenn ein Dorf nicht entstehen kann, weil das Studio-Buch noch nicht da ist (V-D8: das Log nennt den
// Grund mit Worker-Zustand, der Spieler hört Worte).
AnazhRealm.SIEDLUNG_KALT_SATZ = Object.freeze(["chat.befehl.dorf.kalt"]); // eine Zeile der Tafel, keine aufgelöste
// DIE SICHTLINIE DER POSE (`_ortPose`): je `SICHT_SCHRITT_M` fragt sie die Höhe der Welt längs des Strahls, und das Gelände
// bleibt `SICHT_GELAENDE_M` unter ihm — das Maß, um das der gebaute Boden vom Gesetz abweicht (Surface-Nets ±0,2 m, Lehre 22)
AnazhRealm.SICHT_SCHRITT_M = 0.5;
AnazhRealm.SICHT_GELAENDE_M = 0.25;
// DER STAND VOR DEM SCHILD (`_ortPose` „zeichen"): die Abstände vor der Wand, der erste freie gilt — 8 m zuerst (näher als 8 m
// füllte eine Fassade 24–36 % des Bilds als Vordergrund, die Regel „trasse"), dann nach und nach weiter weg und wieder näher
AnazhRealm.ZEICHEN_POSE = Object.freeze({ abstandM: Object.freeze([8, 7, 9, 6, 10, 5, 11, 12]) });
