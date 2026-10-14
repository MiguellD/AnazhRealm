class AnazhRealm_Z20b {
    // ===== ATLAS §20b · SPAWN-ÖKOLOGIE — Block Studio =====
    // DIE KÖRPER-IDENTITÄT (V18.527): ein Foundry-Körper ist (Art, Gestalt, Stufe) und — geprägt — sein ov-Hash.
    // Keine Saison: jeder Körper ist Golden-Sommer gebacken (die Transport-Schale nagelt season "summer"), das Jahr
    // trägt die Uniform `uSeasonMul` (`_tickSeason`). Cache-Schlüssel, Platten-Schlüssel und leafKey-Stamm sind
    // DIESER eine String — ein Saison-Wechsel baut nichts neu.
    _foundryKoerperKey(preset, gestalt, lod, ov) {
        return preset + "|" + gestalt + "|" + lod + (ov ? "|ov:" + this._studioOvHash(ov) : "");
    }
    // Die Karte eines (Art, Gestalt[, ov]): Record-Schlüssel "fimp:" + dieser String.
    _foundryKartenKey(preset, gestalt, ov) {
        return preset + "|" + gestalt + (ov ? "|ov:" + this._studioOvHash(ov) : "");
    }
    // `wo` = der Rang in der Worker-Schlange (`_foundryAuftrag`): die Position des Bestellers ({x,z}, d² wird beim
    // Senden frisch gemessen) · eine Zahl (d², 0 = sofort: Hand, Werkstatt) · nichts = Vorrat (Bibliothek, Ofen, Bäcker).
    _foundryRequest(presetId, seed, lod, ov, wo) {
        const f = this._foundry;
        if (!f) return Promise.resolve(null);
        // Die Gestalt des Orts (K20): die Solitär-Gestalt einer Baum-Art reist mit ihrer Prägung (`_foundryGestaltOv`).
        ov = this._foundryGestaltOv(presetId, seed, ov);
        // Regler-Kanal: ein nicht-leeres ov formt den Körper; sein Hash trennt den Schlüssel (geprägt und ungeprägt
        // vergiften sich nie). Die Werkstatt-Vorschau (wo === 0) umgeht die Platte KOMPLETT — ein Unikat je Regler-Stand.
        const hasOv = !!(ov && typeof ov === "object" && Object.keys(ov).length);
        // Ship-Pfad-Hook (spec/pack/v0/CONTRACT.md): `window.__anazhLiveBake === false` → NUR die Platte (die
        // Transport-Schale baut nie, Miss = null). Default: Platte zuerst, Studio beim Miss (beides im Worker).
        const nurPlatte = typeof window !== "undefined" && window.__anazhLiveBake === false;
        // Der Platten-Schlüssel reist mit JEDEM Welt-Körper — ob eine Platte lebt, entscheidet die Schale (cfg.platte,
        // Quota). Ein geprägter Körper (Ofen-Mensch, Tier mit Reglern, gestempelter Eintrag) trägt seinen ov-Hash und
        // trifft beim nächsten Boot die Platte; nur die Werkstatt-Vorschau und die Hand (wo === 0 mit ov) sind Unikate.
        const platte = hasOv && wo === 0 ? null : this._foundryKoerperKey(presetId, seed, lod, hasOv ? ov : null);
        if (nurPlatte && !platte) return Promise.resolve(null);
        if (!f.ready || !f.worker) {
            // Fail-LAUT: das kalte Buch benennt den null-Pfad mit einem ratenbegrenzten Konsolen-Wort (max
            // 1×/10 s); das Verhalten bleibt (Aufrufer deferrieren + heilen beim Ingest).
            const now = Date.now();
            if (!this._foundryKaltWarnAt || now - this._foundryKaltWarnAt > 10000) {
                this._foundryKaltWarnAt = now;
                this.log(`FOUNDRY KALT: build-asset(${presetId}) ohne Buch/Worker → null (heilt beim Ingest)`, "WARN");
            }
            return Promise.resolve(null);
        }
        // DER INGEST-TAKT: jedes Ergebnis passiert _foundryIngestTakt; der Loop-Tick gibt je Frame nur wenige frei —
        // sonst laufen Burst-Konversionen (_foundryBuildGroup) als Microtasks in EINER LongTask. Misses und headless
        // passieren sofort; Konsumenten tragen null-bis-fertig.
        return this._foundryWorkerRequest(presetId, seed, lod, hasOv ? ov : null, platte, nurPlatte, wo)
            .then((meshes) => (nurPlatte && !(meshes && meshes.length) ? null : meshes))
            .then((ergebnis) => this._foundryIngestTakt(ergebnis));
    }
    // Der Takt-Wächter: hält ein Request-Ergebnis zurück, bis der Loop-Tick es
    // freigibt (die Konversion des Aufrufers folgt als Microtask im selben Frame).
    _foundryIngestTakt(x) {
        if (x == null) return Promise.resolve(x); // Miss/Timeout: sofort — nulls stauen nie
        const r = this.state.renderer;
        if (!r || r._isHeadlessNull) return Promise.resolve(x); // headless byte-schnell (Gates)
        const q = this._foundryIngestQueue || (this._foundryIngestQueue = []);
        this._foundryIngestMaxQ = Math.max(this._foundryIngestMaxQ || 0, q.length + 1); // Linse
        return new Promise((res) => q.push(() => res(x)));
    }
    // Freigabe-Tick (EIN Aufruf je Frame), sekunden-normalisiert: n = round(INGEST_RATE_PER_S·dt),
    // gedeckelt durch INGEST_BURST_CAP — die Welt lädt mit der Wanduhr, nicht mit der Framerate. Über
    // Budget halbe Rate (der Stau schrumpft immer, kein LongTask). Ohne dt (Gate/Test): 3 unter / 1 über
    // Budget (gate:leistungs-vertrag).
    _tickFoundryIngest(dtSec) {
        const q = this._foundryIngestQueue;
        if (!q || !q.length) return;
        let n;
        if (!Number.isFinite(dtSec)) {
            n = this.state._frameOverBudget ? 1 : 3; // Gate/Test-Pfad: byte-alte Frame-Semantik
        } else {
            const rate = this.state._frameOverBudget
                ? AnazhRealm.INGEST_RATE_PER_S * 0.5
                : AnazhRealm.INGEST_RATE_PER_S;
            const dt = Math.min(0.25, Math.max(0.001, dtSec));
            n = Math.max(1, Math.min(AnazhRealm.INGEST_BURST_CAP, Math.round(rate * dt)));
        }
        for (let i = 0; i < n && q.length; i++) {
            const frei = q.shift();
            this._foundryIngestFrei = (this._foundryIngestFrei || 0) + 1; // Linse (freigegeben gesamt)
            // die Freigabe erfüllt nur ein Versprechen (`res(x)` wirft nie); der Bau des Aufrufers läuft danach in SEINER
            // Kette, deren Fang laut bricht (K22: kein toter catch um die Freigabe)
            frei();
        }
    }
    // DIE EINE FOUNDRY-FRIST: der Worker arbeitet seine Aufträge FIFO ab — die Uhr eines Auftrags läuft erst,
    // wenn kein FRÜHER gesendeter mehr offen ist (vorher wartet er in der Schlange, nicht im Bau). Befund
    // 01.10.: die Uhr ab Senden ließ Impostor-Karten in der belebten Welt ablaufen, bevor der Worker sie
    // anfasste (strauch|16: 45 s Ablauf im Betrieb, 0,6 s bei freiem Worker) — drei Abläufe, und die Art
    // stand terminal ohne Fernstufe. Nie verklemmt: der älteste offene Auftrag hat immer eine laufende Uhr. FIFO gilt
    // je FADEN (`_foundryBahn`): eine Karte im Bäcker hält die Uhr eines Körpers im Werk nie an, und umgekehrt.
    // DER ABGELAUFENE BLEIBT IM FADEN: der Besteller bekommt null (seine Wiederhol-Disziplin läuft), aber der Worker baut
    // ihn weiter — als GEIST hält er seinen Platz und die Uhr der Späteren seines Fadens an, bis seine späte Antwort kommt
    // (höchstens GEIST_FACHE × die Frist, dann fällt er: nie verklemmt). Bis 05.10. startete die Uhr des Wiederholers,
    // während der Bäcker den Abgelaufenen noch buk (gate:arch-feld, CPU-Raster unter Fremdlast: Weide und Eiche je 3
    // Versuche, die Karte der fernen Eiche kam in Takt 3281; der dritte Ablauf macht eine Zelle für immer gescheitert).
    _foundryFrist(f, reqId, dauerMs, beiAblauf) {
        const nr = (id) => Number(String(id).replace(/^\D+/, ""));
        const meine = nr(reqId);
        const bahn = this._foundryBahn(reqId);
        let start = null;
        const pruefe = () => {
            if (!f.pending.has(reqId)) return; // beantwortet
            let vorMir = false;
            for (const k of f.pending.keys()) {
                if (nr(k) < meine && this._foundryBahn(k) === bahn) {
                    vorMir = true;
                    break;
                }
            }
            const jetzt = performance.now();
            if (vorMir) start = null;
            else if (start === null) start = jetzt;
            if (start !== null && jetzt - start > dauerMs) {
                const geist = () => {};
                f.pending.set(reqId, geist); // die späte Antwort löst den Geist ein (`_foundryAntwort`)
                setTimeout(() => {
                    if (f.pending.get(reqId) === geist) {
                        f.pending.delete(reqId);
                        this._foundryPumpe(f);
                    }
                }, dauerMs * AnazhRealm.FOUNDRY_GEIST_FACH);
                beiAblauf();
                return;
            }
            setTimeout(pruefe, 1000);
        };
        setTimeout(pruefe, 1000);
    }
    _foundryWorkerRequest(presetId, seed, lod, ov, platte, nurPlatte, wo) {
        const f = this._foundry;
        if (!f || !f.ready || !f.worker) return Promise.resolve(null);
        // W-A1 — msg.ov reist NUR, wenn wirklich Overrides da sind (die Bruecke reicht ov ausschliesslich an
        // Zweit-Kern-buildInstance durch). `platte` (der Schlüssel) und `nurPlatte` liest die Transport-Schale
        // und nimmt sie heraus, bevor das Studio die Anfrage sieht; die Saison setzt NUR die Schale (Sommer).
        const msg = { type: "build-asset", presetId, seed, lod };
        if (ov && typeof ov === "object" && Object.keys(ov).length) msg.ov = ov;
        if (platte) msg.platte = platte;
        if (nurPlatte) msg.nurPlatte = true;
        // 45 s ARBEITS-Zeit (die EINE Frist, `_foundryFrist`): ein Koniferen-lod0-Asset hat ~170k Verts; die
        // Wartezeit in der Schlange zählt nicht mit. fail-LAUT (V18.462): das Timeout ist vom kalten Buch
        // unterscheidbar — der Aufrufer sieht sonst beide als null.
        return this._foundryAuftrag(
            f,
            "r",
            msg,
            wo,
            45000,
            `FOUNDRY TIMEOUT: build-asset(${presetId}) nach 45 s Arbeit ohne Reply → null`
        );
    }
    // DER VORRAT AUF DER PLATTE (V18.527): ein Körper, den noch kein Leser braucht (Garage-Fahrzeuge vor dem ersten Spawn),
    // wärmt NUR die Platte — die Transport-Schale baut, schreibt und antwortet leer; der Haupt-Thread baut keine Gruppe
    // ohne Leser (bis V18.526 lief jeder Vorrats-Körper je Boot durch `_foundryBuildGroup`). Liegt er schon auf der Platte
    // oder gibt es keine (Null-Renderer, Quota), antwortet die Schale sofort leer. true = gewärmt, null = Timeout.
    _foundryVorrat(presetId, seed, lod) {
        const f = this._foundry;
        if (!f || !f.ready || !f.worker) return Promise.resolve(null);
        const msg = {
            type: "build-asset",
            presetId,
            seed,
            lod,
            platte: this._foundryKoerperKey(presetId, seed, lod),
            vorrat: true,
        };
        return this._foundryAuftrag(
            f,
            "r",
            msg,
            null,
            45000,
            `FOUNDRY TIMEOUT: Vorrat(${presetId}) nach 45 s Arbeit ohne Reply → null`
        ).then((m) => (m ? true : null));
    }
    // DIE EINE WORKER-SCHLANGE: der Foundry-Worker arbeitet FIFO, ein Bau dauert 0,1–25 s. Vorher ging jede Anfrage
    // sofort per postMessage hinein — eine nahe Eiche-L0 wartete hinter JEDEM früher gestellten Vorrats- und
    // Fernauftrag (gemessen 03.10.: beim Boot 241 Aufträge im Worker, die nahe Eiche-L0 kam nach 9,0 s, die Tanne nach
    // 9,4 s; gate:arch-feld: 17 offene Aufträge, Eiche in 10 m und Haus in 27 m 800 Takte ohne Mesh). Jetzt hält der
    // Host die Schlange: höchstens FOUNDRY_IM_FLUG Aufträge je Studio-Faden (Werk · Bäcker, `_foundryPumpe`; so viele,
    // dass er ohne Rundlauf-Lücke arbeitet:
    // der Vorrat läuft so schnell leer wie FIFO), der nächste geht NAH zuerst (d² zum Spieler,
    // beim Senden frisch gemessen; Vorrat = ∞, unter Gleichen FIFO) — und nie verhungert: ist der älteste Wartende
    // älter als FOUNDRY_ALTER_MS, wechselt die Wahl ab (der Älteste, dann der Nächste). Die Request-Nummer entsteht
    // beim SENDEN: die EINE Frist (`_foundryFrist`) bleibt eine Arbeits-Uhr in Worker-Reihenfolge.
    _foundryAuftrag(f, praefix, msg, wo, fristMs, ablaufWort) {
        return new Promise((resolve) => {
            const q = f.warte || (f.warte = []);
            q.push({ praefix, msg, wo, fristMs, ablaufWort, resolve, t: performance.now() });
            this._foundryPumpe(f);
        });
    }
    _foundryAuftragD2(wo) {
        if (typeof wo === "number") return Number.isFinite(wo) ? wo : Infinity;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!wo || !pm || !Number.isFinite(wo.x) || !Number.isFinite(wo.z)) return Infinity;
        const dx = wo.x - pm.x,
            dz = wo.z - pm.z;
        return dx * dx + dz * dz;
    }
    // Die BAHN eines Auftrags (Präfix der Request-Nummer bzw. Nachrichten-Art): die Karte geht in den Bäcker-Faden
    // (`_foundryBaecker`), alles andere — Körper, Vorrat, Siedlung — ins Werk.
    _foundryBahn(reqIdOderMsg) {
        if (typeof reqIdOderMsg === "string") return reqIdOderMsg.startsWith("imp") ? "baecker" : "werk";
        return reqIdOderMsg && reqIdOderMsg.type === "bake-impostor" ? "baecker" : "werk";
    }
    // Die Pumpe speist ZWEI Fäden aus der EINEN Schlange: je Faden höchstens FOUNDRY_IM_FLUG im Flug, die Wahl unter den
    // Wartenden, deren Faden Platz hat — nah zuerst, nie verhungert (die Alters-Wache wie bisher). Der Bäcker wird beim
    // ersten Karten-Auftrag geboren; bis er bereit ist, wartet die Karte, die Geometrie fließt.
    _foundryPumpe(f) {
        const q = f && f.warte;
        if (!q || !f.worker) return;
        let werkFrei = 0,
            baeckerFrei = 0;
        const plaetze = () => {
            let b = 0;
            for (const k of f.pending.keys()) if (this._foundryBahn(k) === "baecker") b++;
            werkFrei = AnazhRealm.FOUNDRY_IM_FLUG - (f.pending.size - b);
            baeckerFrei = f.baecker && f.baeckerBereit ? AnazhRealm.FOUNDRY_IM_FLUG - b : 0;
        };
        const frei = (a) => (this._foundryBahn(a.msg) === "baecker" ? baeckerFrei : werkFrei) > 0;
        for (plaetze(); q.length; plaetze()) {
            if (!f.baecker && q.some((a) => this._foundryBahn(a.msg) === "baecker")) this._foundryBaecker(f);
            let i = -1;
            for (let k = 0; k < q.length; k++)
                if (frei(q[k])) {
                    i = k;
                    break;
                }
            if (i < 0) return; // kein Wartender, dessen Faden Platz hat
            let aeltester = false;
            if (performance.now() - q[i].t > AnazhRealm.FOUNDRY_ALTER_MS) aeltester = f.warteZug = !f.warteZug;
            if (!aeltester) {
                let best = this._foundryAuftragD2(q[i].wo);
                for (let k = i + 1; k < q.length; k++) {
                    if (!frei(q[k])) continue;
                    const d2 = this._foundryAuftragD2(q[k].wo);
                    if (d2 < best) {
                        best = d2;
                        i = k;
                    }
                }
            }
            const a = q.splice(i, 1)[0];
            const reqId = a.praefix + f.reqSeq++;
            const ziel = this._foundryBahn(a.msg) === "baecker" ? f.baecker : f.worker;
            f.pending.set(reqId, a.resolve);
            try {
                ziel.postMessage(Object.assign({ reqId }, a.msg));
            } catch (_e) {
                f.pending.delete(reqId);
                a.resolve(null);
                continue;
            }
            this._foundryFrist(f, reqId, a.fristMs, () => {
                this.log(a.ablaufWort, "WARN");
                a.resolve(null);
                this._foundryPumpe(f);
            });
        }
    }
    // Ein Besteller, dessen Schlüssel schon wartet (der Boot-Vorrat fragte ihn zuerst), hebt dessen Rang auf seine
    // Nähe — sonst wartete der nahe Bau mit Vorrats-Rang hinter dem ganzen Vorrat.
    _foundryNaeher(f, presetId, seed, lod, wo) {
        const q = f && f.warte;
        if (!q || !q.length) return;
        const d2 = this._foundryAuftragD2(wo);
        for (const a of q) {
            const m = a.msg;
            if (
                m.type !== "build-asset" ||
                m.ov ||
                m.vorrat ||
                m.presetId !== presetId ||
                m.seed !== seed ||
                m.lod !== lod
            )
                continue;
            if (d2 < this._foundryAuftragD2(a.wo)) a.wo = wo;
            return;
        }
    }
    // Fernstufe EINES (Preset,Seed) beim Studio-Bäcker anfragen (Kanal "bake-impostor" → phytogenesis
    // `bakeImpostorAtlas`, kein Nachbau). Resolvt mit payload oder null (Fehler/Timeout — der Tick-
    // Aufrufer trägt den Retry). Dasselbe pending-Routing wie build-asset, reqIds mit Präfix "imp".
    _foundryBakeImpostorRequest(presetId, seed, ov, fmt, bedarfD2) {
        const f = this._foundry;
        if (!f || !f.ready || !f.worker || !fmt) return Promise.resolve(null);
        ov = this._foundryGestaltOv(presetId, seed, ov); // die Gestalt des Orts (K20) samt der Prägung des Bestellers
        // Die Prägung reist ADDITIV in den Bake (msg.ov nur wenn non-null): Bake-Subjekt ist die geprägte
        // Gestalt. Ohne ov byte-identisch. __-Schlüssel bleiben Steuer-Passagiere (der Kern konsumiert sie).
        // Die Karte ist Golden-Sommer (die Schale nagelt die Saison); das Jahr färbt der Karten-Stoff (uSeasonMul).
        const msg = { type: "bake-impostor", presetId, seed, fmt };
        if (ov && typeof ov === "object") msg.ov = ov;
        // KARTEN AUF DIE PLATTE (V18.527, W6): die Karte trägt ihren Platten-Schlüssel (`karte|` + Karten-Schlüssel,
        // geprägt mit ov-Hash, + Schicht-Format) — die Schale liest zuerst, kodiert und schreibt jeden frischen Bake; ein
        // Zweit-Boot bäckt keine Karte neu. Der Ship-Pfad (`__anazhLiveBake === false`) liest NUR die Platte.
        msg.platte =
            "karte|" + this._foundryKartenKey(presetId, seed, ov && typeof ov === "object" ? ov : null) + "|" + fmt;
        if (typeof window !== "undefined" && window.__anazhLiveBake === false) msg.nurPlatte = true;
        // Durch DIE EINE WORKER-SCHLANGE im Rang ihres nächsten Wartenden (`z._bedarfD2`, d² zum Spieler; ohne Bedarf
        // Vorrats-Rang). Bis 04.10. reiste jede Karte mit Vorrats-Rang: beim Boot an der Mess-Wiese wartete sie 11 s
        // hinter 150 Geometrie-Aufträgen, die Bäume, die sie brauchten, standen so lange als Kapsel-Klumpen. EINE Uhr
        // (IMPOSTOR_BAKE_TIMEOUT_MS ARBEITS-Zeit, `_foundryFrist`): der pending-Eintrag darf nie ewig leben; null → die
        // Retry-Disziplin des Tick.
        const frist = AnazhRealm.IMPOSTOR_BAKE_TIMEOUT_MS;
        return this._foundryAuftrag(
            f,
            "imp",
            msg,
            Number.isFinite(bedarfD2) ? bedarfD2 : null,
            frist,
            `FOUNDRY TIMEOUT: bake-impostor(${presetId}) nach ${Math.round(frist / 1000)} s Arbeit ohne Reply → null`
        );
    }
    // L2 — die Fernstufe: den STUDIO-Baecker (bakeImpostorAtlas) im iframe anwerfen; er liefert den
    // 8-Winkel-Billboard-Atlas (Albedo + Normal) + Rahmen. AnazhRealm platziert das Billboard — kein
    // eigener Baecker, der Studio-Edit fliesst mit (der Schoepfer-Weg).
    _foundryPresetFor(species) {
        const map = {
            // Baeume
            baum_eiche: "eiche",
            baum_fichte: "fichte",
            baum_tanne: "tanne",
            baum_birke: "birke",
            baum_weide: "weide",
            baum_mammut: "mammut",
            baum_kiefer: "fichte",
            // Wald-Nischen (_forestCellDarts) auf Vorlagen-Arten: baum_erle → weide. Buche und Karst-Baum sind seit 04.10.
            // eigene Studio-Arten (die Aliase auf Mammut und belaubte Eiche fielen), die Mammut-Nische des Wald-Generators
            // heißt baum_mammut. Stehendes Totholz hat in der Welt keinen Erzeuger (der Alias baum_totholz → eiche fiel
            // 05.10. mit der Grammatik-Art); die Studio-Art totholz pflanzt der Labor-Wald.
            baum_erle: "weide",
            baum_buche: "buche",
            baum_karst: "karst",
            // Restliche Wald-Nischen (`_scatterSpeciesForLayer`) auf die nächste Studio-Art: Zypresse (schlanke
            // Konifere) → tanne, Palme (Einzelstamm mit Krone) → weide.
            baum_zypresse: "tanne",
            baum_palme: "weide",
            // Fels: ALLE 6 Vorlagen-Stein-Rezepte (emitRock), nach Charakter verteilt — vorher
            // fielen sediment/zacken/geroell durch (nur findling/basalt genutzt = Rueckzug).
            // findling = runder Findling:
            noiserock: "findling",
            findling: "findling",
            // basalt = Saeulen:
            stein_block: "basalt",
            stein: "basalt",
            // sediment = Schichtfels (geschichtet):
            fels: "sediment",
            fels_var: "sediment",
            schichtfels: "sediment",
            sediment: "sediment",
            // zacken = Felszacken (schroffe Tuerme/Boegen):
            felsturm: "zacken",
            felszacken: "zacken",
            felsbogen: "zacken",
            zacken: "zacken",
            // geroell = Geroellhalde (Schutt/Talus/Kiesel):
            geroell: "geroell",
            talus: "geroell",
            felsbrocken: "geroell",
            kiesel: "geroell",
            // Kristall (emitCrystals)
            kristall_geode: "kristalle",
            geode: "kristalle",
            kristall: "kristalle",
            kristalle: "kristalle",
            kristall_var: "kristalle",
            // Blume (emitFlower) + Strauch — die Bodenflora der Streu-Regionen (blume_gross); die Arten-Namen des gefallenen
            // Klein-Vegetations-Zwillings (Tulpe · Klee · Mohn) fielen mit ihm (Waldboden 04.10.).
            blume_gross: "blume",
            blume: "blume",
            // Straeucher -> Vorlagen-strauch (LOD haelt die Perf: lod2 ~16k Verts; die Distanz-
            // LOD-Wahl gibt dem fernen Busch die leichte Stufe, instanziert).
            busch_hazel: "strauch",
            busch: "strauch",
            // Das Kraut-Stratum feuchter Senken (`_scatterSpeciesForLayer` moisture>0.55) ist der Studio-Farn (Waldboden
            // 04.10., integriert 05.10.): der Alias auf den Strauch fiel wie Buche, Karst-Baum und Totholz.
            farn_busch: "farn",
        };
        if (map[species]) return map[species];
        // Generische Regel hinter der Tabelle: `baum_<preset>`/`<preset>` mit Preset im LIVE-Rezeptbuch
        // (`f.recipes`) löst ohne Tabellen-Edit auf; die Tabelle trägt nur historische Namen (baum_kiefer …).
        const f = this._foundry;
        if (f && f.recipes && typeof species === "string") {
            // N1 (M8): der Praefix-Strip laeuft ueber die KIND_POLICY-Tabelle — jede Domaene
            // loest `<prefix><id>` ueber das LIVE-Buch (praefix-freie Built-ins bleiben
            // unberuehrt: "wagen" steht in keinem Buch -> null -> ihr Part-Pfad haelt).
            let bare = species;
            const KP = AnazhRealm.KIND_POLICY;
            for (const k in KP) {
                const px = KP[k].prefix;
                if (px && species.startsWith(px)) {
                    bare = species.slice(px.length);
                    break;
                }
            }
            if (Object.prototype.hasOwnProperty.call(f.recipes, bare)) return bare;
        }
        return null;
    }
    // DER WORT-KATALOG (Welle L Folge, L-Wortschatz): ein Wort des Co-Schöpfers („eiche", „birken", „fachwerkhaus",
    // „häuser", „wagen") löst über den EINEN Rezept-Katalog auf — die Studio-Arten des Buchs, ihre Bauplan-Träger, das
    // Art-Gesetz (`KIND_POLICY`) und die Studios (`WORLD_REGISTRY`) —, nie über eine Hand-Liste (die Brücke STUDIO_WORT
    // kannte neun Wörter, „bau mir ein fachwerkhaus" war unbekannt). Gefragt werden das Wort, seine Stämme (-en/-n/-e/-s/-er,
    // der Plural-Umlaut: Häuser → Haus) und als Kompositum der Anfang eines Werk-Namens („fels" → Felsformation, ≥ 4
    // Buchstaben, das erste in Katalog-Reihenfolge). null = unbekannt (kein Raten).
    _studioBlueprintForWord(word) {
        if (typeof word !== "string" || !word.trim()) return null;
        const K = this._studioWortKatalog();
        const w = AnazhRealm._wortFalten(word);
        const kandidaten = [w];
        for (const suf of ["en", "n", "e", "s", "er"])
            if (w.length > suf.length + 2 && w.endsWith(suf)) kandidaten.push(w.slice(0, -suf.length));
        for (const k of kandidaten.slice()) {
            const ohne = k.replace(/aeu/g, "au").replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");
            if (ohne !== k) kandidaten.push(ohne);
        }
        for (const stufe of K.stufen) for (const t of kandidaten) if (stufe.has(t)) return stufe.get(t);
        for (const t of kandidaten) {
            if (t.length < 4) continue;
            for (const s of [1, 3])
                for (const [name, ziel] of K.stufen[s]) if (name.length > t.length && name.startsWith(t)) return ziel;
        }
        return null;
    }

    // Der Katalog der Wörter, gestuft (die frühere Stufe gewinnt; in einer Stufe das erste in Katalog-Reihenfolge, ein
    // Art- oder Studio-Wort mit zwei Arten fällt als mehrdeutig weg):
    //   (1) Bauplan-Namen, die Rezept-ids mit ihrem Träger, der Name hinter einem Art-Präfix (`baum_eiche` → „eiche", auch
    //       bei kaltem Buch);
    //   (2) die Namen der Werke: das Kopf-Wort des Rezept-`lab` und des Träger-Labels (vor „·"/„—": „Feuerstelle",
    //       „Ziehbrunnen", „Alemannisch", „Kristall-Geode");
    //   (3) die Art-Wörter des Art-Gesetzes: der Präfix-Stamm („baum", „haus", „fahrzeug") und der Stamm des Spenders,
    //       der kein eigener Bauplan ist („fahrzeug_wagen" → „wagen") → das erste Werk der Art;
    //   (4) die Studio-Namen, deren Kompositum-Kopf ein Art-Wort ist („Fachwerkhaus" → das erste Haus).
    // Der Träger eines Rezepts: eine Art MIT Präfix nur über ihr Präfix — ein Tor-Wort fällt nie auf das welt_-Portal
    // derselben Gestalt (ein echtes Tor mit Trigger, kein Bauwerk); sonst der Bauplan, der seine Gestalt trägt (die
    // Ausstattung: feuerstelle → glutbrunnen), sonst der erste Bauplan seiner Studio-Art (`_foundryPresetForEntry`: der
    // Fels). Gemerkt je Buch und Bauplan-Zahl. { stufen: [Map Wort → Bauplan] ×4, artVon: Bauplan → Art, woerter }.
    _studioWortKatalog() {
        const bps = this.state.blueprints || {};
        const f = this._foundry;
        const recipes = f && f.recipes ? f.recipes : {};
        const ids = Object.keys(recipes);
        const namen = Object.keys(bps).sort();
        const alt = this._wortKatalogMerker;
        if (alt && alt.recipes === recipes && alt.nRez === ids.length && alt.nBp === namen.length) return alt;
        const KP = AnazhRealm.KIND_POLICY;
        const falte = AnazhRealm._wortFalten;
        const kopf = (label) =>
            String(label || "")
                .split(/\s[·—(]|\s-\s/)[0]
                .split(/[^A-Za-zÄÖÜäöüß]+/)
                .filter((x) => x.length >= 3)
                .map(falte);
        const istTor = (n) => !bps[n] || bps[n].role === "portal";
        const nachArt = {};
        for (const n of namen) {
            if (istTor(n) || bps[n]._foundryAutoSpecies) continue;
            const pr = this._foundryPresetForEntry({ type: n });
            if (pr && !nachArt[pr]) nachArt[pr] = n;
        }
        const traeger = {};
        const artVon = {};
        for (const id of ids) {
            const rec = recipes[id];
            const pol = rec && KP[rec.kind];
            let t = null;
            if (pol && pol.prefix) t = bps[pol.prefix + id] ? pol.prefix + id : null;
            else if (rec)
                t =
                    namen.find((n) => !istTor(n) && bps[n].studioGestalt === id && !bps[n]._foundryAutoSpecies) ||
                    nachArt[id] ||
                    null;
            if (!t) continue;
            traeger[id] = t;
            if (!artVon[t]) artVon[t] = rec.kind;
        }
        const stufen = [new Map(), new Map(), new Map(), new Map()];
        const setze = (s, wort, ziel) => {
            if (wort && ziel && !stufen[s].has(wort)) stufen[s].set(wort, ziel);
        };
        // Die sagbaren Wörter (Prompt und Absage): [Wort, Nennung] — Art- und Studio-Wörter zuerst, dann die Werke.
        const gross = (w) => w.charAt(0).toUpperCase() + w.slice(1);
        const nennWoerter = [];
        const werkWoerter = [];
        // (1)
        for (const n of namen) setze(0, n, n);
        for (const id of ids)
            if (traeger[id]) {
                setze(0, falte(id), traeger[id]);
                const lab = String(bps[traeger[id]].label || id).split(/\s[·—(]/)[0];
                werkWoerter.push([falte(id), lab]);
            }
        for (const k of Object.keys(KP)) {
            const px = KP[k].prefix;
            if (!px) continue;
            for (const n of namen)
                if (n.startsWith(px) && !istTor(n)) {
                    setze(0, n.slice(px.length), n);
                    if (!artVon[n]) artVon[n] = k;
                }
        }
        // (2)
        for (const id of ids) {
            const t = traeger[id];
            if (t) for (const w of [...kopf(recipes[id].lab), ...kopf(bps[t].label)]) setze(1, w, t);
        }
        // (3) und (4): ein Wort, das zwei Arten benennt, fällt (Spender „tor_basis"/„haus_basis" → „basis").
        const eindeutig = (s, paare) => {
            const arten = new Map();
            for (const [w, t] of paare) {
                if (!arten.has(w)) arten.set(w, new Set());
                arten.get(w).add(artVon[t]);
            }
            for (const [w, t] of paare)
                if (arten.get(w).size === 1 && !stufen[s].has(w)) {
                    setze(s, w, t);
                    nennWoerter.push([w, gross(w)]);
                }
        };
        const erstes = {};
        for (const id of ids) if (traeger[id] && !erstes[recipes[id].kind]) erstes[recipes[id].kind] = traeger[id];
        const artPaare = [];
        for (const k of Object.keys(KP)) {
            const px = KP[k].prefix;
            const ziel = erstes[k] || (px ? namen.find((n) => n.startsWith(px) && !istTor(n)) : null);
            if (!ziel) continue;
            if (px) artPaare.push([px.replace(/_+$/, ""), ziel]);
            const sp = KP[k].donor;
            if (typeof sp === "string" && !bps[sp]) artPaare.push([sp.split("_").pop(), ziel]);
        }
        eindeutig(2, artPaare);
        // (4) Ein Studio-Name, dessen Kopf (der letzte Teil des Kompositums) ein Art-Wort ist, ist ein Werk dieser Art:
        // „Fachwerkhaus" ist ein Haus. „Anatomie", „Porta", „Phytogenesis" benennen keine Art und bleiben stumm.
        const studioPaare = [];
        for (const wdef of Object.values(AnazhRealm.WORLD_REGISTRY || {}))
            for (const w of kopf(wdef && wdef.label))
                for (const [art, ziel] of stufen[2])
                    if (w.length > art.length && w.endsWith(art)) studioPaare.push([w, ziel]);
        eindeutig(3, studioPaare);
        const woerter = [...nennWoerter, ...werkWoerter];
        this._wortKatalogMerker = { recipes, nRez: ids.length, nBp: namen.length, stufen, artVon, woerter };
        return this._wortKatalogMerker;
    }

    // Die lebenden Wörter, gruppiert je Art (KI-Prompt und die Absage eines unbekannten Worts): aus dem EINEN Wort-Katalog —
    // nie ein Wort, das die Welt nicht bauen kann. `nennen` = wie der Spieler sie liest („Fachwerkhaus", „Eiche"), sonst
    // die Wörter des Programms („fachwerkhaus", „eiche").
    _studioWordsForPrompt(nennen = false) {
        const K = this._studioWortKatalog();
        const GRUPPE = {
            tree: "Bäume",
            rock: "Stein",
            haus: "Häuser",
            gate: "Tore",
            vehicle: "Fahrzeuge",
            ausstattung: "Ausstattung",
        };
        const gruppen = {};
        for (const [w, nennung] of K.woerter) {
            const ziel = this._studioBlueprintForWord(w);
            const art = ziel && K.artVon[ziel];
            if (!GRUPPE[art]) continue;
            const nenn = nennen ? nennung : w;
            const g = (gruppen[art] = gruppen[art] || []);
            if (!g.includes(nenn)) g.push(nenn);
        }
        const kappe = nennen ? 5 : 8;
        return Object.keys(GRUPPE)
            .filter((a) => gruppen[a] && gruppen[a].length)
            .map(
                (a) => `${GRUPPE[a]}: ${gruppen[a].slice(0, kappe).join(", ")}${gruppen[a].length > kappe ? " …" : ""}`
            )
            .join(" · ");
    }

    // Der Pflanz-Abstand je Bauplan: Bäume/Stein eng (ein Hain), Häuser/Tore/Fahrzeuge
    // mit Luft (Kind aus dem Rezeptbuch über das Preset).
    _studioSpawnAbstand(name) {
        const f = this._foundry;
        // der EINE Entry-Resolver (studioGestalt eingeschlossen: die Ausstattung löst über ihren Bauplan auf)
        const preset = this._foundryPresetForEntry({ type: name });
        const rec = preset && f && f.recipes ? f.recipes[preset] : null;
        const kind = rec ? rec.kind : name.startsWith("baum_") ? "tree" : null;
        if (kind === "haus" || kind === "gate" || kind === "vehicle") return 9;
        if (kind === "ausstattung") return 4;
        return 2.5;
    }

    // Foundry-Preset EINES Eintrags — die EINE Auflösung für den Platzier-Pfad. Gewachsene Bäume (Typ
    // `grown_<art>_v<idx>`, nicht im Map) lösen über `entry._lodSpecies` (= `baum_eiche` …); Fels/
    // Kristall/Blume ohne LOD-Spezies über den direkten Typ.
    _foundryPresetForEntry(entry) {
        if (!entry) return null;
        if (typeof entry._lodSpecies === "string") {
            const p = this._foundryPresetFor(entry._lodSpecies);
            if (p) return p;
        }
        if (typeof entry.type === "string") {
            const p = this._foundryPresetFor(entry.type);
            if (p) return p;
            // Fallback: grown-Präfix + Variante/LOD abstreifen (`grown_baum_eiche_v0[_lodN]` → `baum_eiche`),
            // sonst verfehlt der Preset-Map-Lookup den Eintrag und die Foundry serviert nichts.
            const m = entry.type.match(/^grown_(baum_[a-z]+)/);
            if (m) {
                const gp = this._foundryPresetFor(m[1]);
                if (gp) return gp;
            }
            // Formations-Varianten (`kristall_var7`/`fels_var3`) verfehlen den exakten Lookup → Suffix abstreifen:
            // Kristall → das EINE Rezept `kristalle`; Fels nach Form-Klasse (brocken→findling · geroell→geroell ·
            // nadel→zacken · stapel→sediment, sonst sediment); Instanz-Variation: `_foundryVariantFor(seed, preset)`.
            const vm = entry.type.match(/^(kristall|fels)_var\d+$/);
            if (vm) {
                if (vm[1] === "kristall") return "kristalle";
                const bp = this.state.blueprints && this.state.blueprints[entry.type];
                const fc = bp && bp._formClass;
                return (
                    { brocken: "findling", geroell: "geroell", nadel: "zacken", stapel: "sediment" }[fc] || "sediment"
                );
            }
            // Gestalt-Wechsel als DATEN: trägt der Bauplan eine `studioGestalt`-Zeile (welt_portal → "geisttor")
            // und steht sie im LIVE-Buch, serviert das Studio die Render-Schicht; die Parts bleiben unsichtbare
            // Substanz (Tags · blockerAABBs · Portal-Trigger). Generisch, kein welt_-Literal. Unbekannte Gestalt/
            // Foundry aus → null → Part-Pfad; kaltes Buch → null, und der Eintrag wartet kalt (`_rebuildArchitectureMesh`).
            if (typeof this._foundryEnabled === "function" && this._foundryEnabled()) {
                const gbp = this.state.blueprints && this.state.blueprints[entry.type];
                if (gbp && typeof gbp.studioGestalt === "string") {
                    const gf = this._foundry;
                    if (gf && gf.recipes && Object.prototype.hasOwnProperty.call(gf.recipes, gbp.studioGestalt)) {
                        return gbp.studioGestalt;
                    }
                }
            }
        }
        return null;
    }
    // Impostort das Preset (Fernstufe = Billboard statt L2-Geometrie)? Daten in zwei Schichten: (a) das
    // Studio klassifiziert (`PRESETS[id].kind` via `f.recipes`), (b) KIND_POLICY-Zeile `impostor: true`
    // sagt, welche kind-Klasse (tree, shrub, gate, vehicle; sonst fail-closed keine Karte). Vor dem Ingest
    // Fallback auf die bekannten Baum-Presets (die Liste wächst bewusst nicht).
    _foundryPresetIsTree(preset) {
        const f = this._foundry;
        const rec = f && f.recipes && f.recipes[preset];
        if (rec && typeof rec.kind === "string") {
            const pol = AnazhRealm.KIND_POLICY[rec.kind];
            return !!(pol && pol.impostor === true);
        }
        return (
            preset === "eiche" ||
            preset === "fichte" ||
            preset === "tanne" ||
            preset === "birke" ||
            preset === "weide" ||
            preset === "mammut" ||
            preset === "strauch"
        );
    }
    // Stufen-Klammer je Art (`PORTAL_RENDER_CONFIG.lod.kindStages`): größte deklarierte Stufe ≤ Wunsch,
    // sonst die kleinste; ohne Deklaration der Wunsch (wie die Distanz-Klammer in _foundryFlattenFor).
    // Die deklarierten Stufen einer Art (kindStages ihres Rezept-kinds) oder null.
    _foundryKindStages(preset) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[preset] : null;
        const cfg = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const st = rec && cfg && cfg.kindStages ? cfg.kindStages[rec.kind] : null;
        return Array.isArray(st) && st.length ? st : null;
    }
    // Eine NUR-WURF-Stufe (B2 Stufe 3, S3 haus: `nurWurf`) wird nie gezeigt — sie wirft für die Art (B2c `schatten`) und
    // trägt die Fernform. Die Klammer überspringt sie: kein Distanz-Wunsch serviert sie als Anzeige.
    _foundryDeclaredStage(preset, wish) {
        const st = this._foundryKindStages(preset);
        if (!st) return wish;
        let sv = null;
        for (let i = 0; i < st.length; i++) {
            if (this._foundryNurWurf(preset, st[i])) continue;
            if (sv === null || st[i] <= wish) sv = st[i];
        }
        return sv === null ? AnazhRealm._kernPflichtBruch("phyto:lod.kindStages (" + preset + ": nur nurWurf)") : sv;
    }
    // Die NUR-WURF-Stufe einer Art mit Fernform "huelle" — sie trägt die Liste (`__fern`). Fehlt sie, bricht die Art.
    _foundryFernStufe(preset) {
        const st = this._foundryKindStages(preset) || [];
        for (const s of st) if (this._foundryNurWurf(preset, s)) return s;
        return AnazhRealm._kernPflichtBruch("phyto:lod.budget (" + preset + ": fernform huelle ohne nurWurf-Stufe)");
    }
    // Ist die Stufe einer Art eine NUR-WURF-Stufe (B2c `lod.budget[kind][stufe].nurWurf`)? Der EINE Leser.
    _foundryNurWurf(preset, stufe) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[preset] : null;
        return rec ? AnazhRealm._budgetNurWurf(rec.kind, stufe) : false;
    }
    static _budgetNurWurf(kind, stufe) {
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const art = L && L.budget ? L.budget[kind] : null;
        return !!(art && art[stufe] && art[stufe].nurWurf === true);
    }
    // DAS BUDGET je Art × Stufe (Studio-Vertrag B2c, `PORTAL_RENDER_CONFIG.lod.budget`, live): der EINE Host-Leser des
    // Wurfs. `schatten` = die Stufe, deren Gestalt wirft (die eigene, eine andere = Schatten-Zwilling, false = keine).
    // Fail-closed (KERN-PFLICHT): ein Buch ohne Budget, eine Art ohne Budget, eine Budget-Art ohne die gelieferte
    // Stufe, ein Wurf auf eine nicht gelieferte Stufe. Seit W8 trägt JEDE Art mit Gestalt ihr Budget (foundry-core und
    // die sechs Zweit-Kerne, gemergt am Ingest) — die Wirt-Stufen-Tafel für Arten ohne Zeile ist gefallen.
    _foundryBudgetZeile(preset, stufe) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[preset] : null;
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        if (!rec || !L || !L.budget) return AnazhRealm._kernPflichtBruch("phyto:lod.budget (" + preset + ")");
        const art = L.budget[rec.kind];
        if (!art) return AnazhRealm._kernPflichtBruch("phyto:lod.budget." + rec.kind);
        const z = art[stufe];
        const w = z ? z.schatten : undefined;
        // Ein Zwilling (w ≠ stufe) muss selbst werfen — sonst kreiste der Zwillings-Zug (B2c-Validator: dieselbe Regel).
        if (!(w === false || (Number.isInteger(w) && art[w] && (w === stufe || art[w].schatten === w))))
            return AnazhRealm._kernPflichtBruch("phyto:lod.budget." + rec.kind + "[" + stufe + "].schatten");
        return z;
    }
    // DIE STUFEN-GRENZEN DES GESETZBUCHS (K43, B2c `ab` + `hyst`): trägt die Art einer gesetzten Studio-Architektur an ihren
    // gezeigten Stufen `ab` (Meter × Welt-Skala des Eintrags), wählt der LOD-Takt nach IHNEN statt nach den Wirts-Distanzen
    // (LOD_DISTANCES) — das Tor beginnt seine Stufe 1 dort, wo sein Kern es sagt. → { erste, grenzen: [{ stufe, ab }], h } oder
    // null (die Art nennt keine Grenze). Am Eintrag gemerkt (die Art eines Eintrags wechselt nie).
    _archStufenGrenzen(entry) {
        if (entry._stufenGrenzen !== undefined) return entry._stufenGrenzen;
        const preset = this._foundryEnabled() ? this._foundryPresetForEntry(entry) : null;
        const f = this._foundry;
        const rec = preset && f && f.recipes ? f.recipes[preset] : null;
        if (!rec) return null; // das Buch lädt: noch kein Urteil, der nächste Takt fragt neu
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const art = L && L.budget ? L.budget[rec.kind] : null;
        const st = this._foundryKindStages(preset) || [];
        const grenzen = [];
        for (const s of st)
            if (art && art[s] && Number.isFinite(art[s].ab) && art[s].nurWurf !== true)
                grenzen.push({ stufe: s, ab: art[s].ab });
        entry._stufenGrenzen = grenzen.length
            ? {
                  erste: st[0],
                  grenzen,
                  h: Number.isFinite(art.hyst)
                      ? art.hyst
                      : AnazhRealm._kernPflichtBruch("phyto:lod.budget." + rec.kind + ".hyst"),
              }
            : null;
        return entry._stufenGrenzen;
    }
    // Die Stufe nach den Grenzen des Gesetzbuchs: wer eine Stufe trägt, hält sie bis (1 − h)·ab, wer davor steht, kommt ab
    // (1 + h)·ab hinein; ohne Zustand (Spawn) die Grenze selbst. `s` = die Welt-Skala des Eintrags.
    static _stufeNachGrenzen(d, cur, G, s) {
        let st = G.erste;
        for (const g of G.grenzen) {
            const ab = g.ab * s;
            const schwelle = !Number.isFinite(cur) ? ab : cur >= g.stufe ? ab * (1 - G.h) : ab * (1 + G.h);
            if (d > schwelle) st = g.stufe;
        }
        return st;
    }
    // Ist die Stufe der Zwilling einer anderen Stufe ihrer Art (B2c `schatten`: Baum L0 → L1)? Dann wirft sie über die
    // Zwillings-Leaves (`_foundryFlattenFor`: EIN Werfer je Gestalt), nie über ihre Teile.
    _foundryWurfQuelle(preset, lod) {
        const st = this._foundryKindStages(preset);
        if (!st) return false;
        for (const s of st) if (s !== lod && this._foundryBudgetZeile(preset, s).schatten === lod) return true;
        return false;
    }
    // DIE FERNFORM einer Art (B2c `lod.budget[kind].fernform`): "karte" · "gesetz" · "boden" · "huelle" — was die Art
    // jenseits der Nah-Grenze IST (`_streuFernBahn`). Der Zellen-Chokepoint (`_scatterMaterializeCell`) liest sie VOR jedem
    // Mesh-Zug. Fail-closed: eine gestreute Art ohne gültige Fernform ist ein KERN-PFLICHT-Bruch, nie ein stilles L0.
    // "huelle" (S3, N5): die Liste der Stufe 3 des Gesetzbuchs (Beipack `__fern`, der Leser `_huelleVon`) — der gesetzte Bau
    // zeichnet sie im Welt-March (`_archFoundryZiegel`); ein Leser, der sie nicht trägt, bricht (KERN-PFLICHT).
    _foundryFernForm(preset) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[preset] : null;
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const art = rec && L && L.budget ? L.budget[rec.kind] : null;
        const fern = art ? art.fernform : null;
        if (fern === "gesetz" || fern === "boden" || fern === "karte" || fern === "huelle") return fern;
        return AnazhRealm._kernPflichtBruch("phyto:lod.budget." + (rec ? rec.kind : preset) + ".fernform");
    }
    // DIE EINE HÜLLEN-FORM (docs/studio-vertrag.md N5, S3): `{ stufe, teile: [{ art: "box" | "keil" | "kapsel", c, h | a, b,
    // r, first ("+x" · "-x" · "+z" · "-z", der Keil), walm (0..1), farbe (linear), rolle: "fest" | "sicht" | "wurf" | "beide" }] }`,
    // asset-lokal. Der EINE Leser: die Teile EINER Rolle — "fest" die Kollision, "sicht" das Fernbild, "beide" zählt für
    // beide; "wurf" liest hier niemand (das Teil wirft nur: die NUR-WURF-Stufe ist die ganze Liste, das Tor 1110-9) —, fail-closed geprüft (eine kaputte Hülle ist ein KERN-PFLICHT-Bruch mit Quelle, nie still leer). null: keine
    // Hülle.
    static _huelleVon(h, rolle, quelle) {
        if (!h) return null;
        const bruch = (was) => AnazhRealm._kernPflichtBruch((quelle || "huelle") + " (Hüllen-Form: " + was + ")");
        if (!Array.isArray(h.teile)) return bruch("teile");
        const v3 = (v) =>
            Array.isArray(v) &&
            v.length === 3 &&
            Number.isFinite(v[0]) &&
            Number.isFinite(v[1]) &&
            Number.isFinite(v[2]);
        const out = [];
        for (const t of h.teile) {
            if (!t || !(t.rolle === "fest" || t.rolle === "sicht" || t.rolle === "wurf" || t.rolle === "beide"))
                return bruch("rolle");
            if (t.art === "box" || t.art === "keil") {
                if (!v3(t.c) || !v3(t.h)) return bruch(t.art + " c/h");
                if (t.art === "keil" && AnazhRealm.HUELLE_KEIL_TYP[t.first] == null) return bruch("keil first");
                if (t.walm != null && !(t.walm >= 0 && t.walm <= 1)) return bruch("keil walm");
            } else if (t.art === "kapsel") {
                if (!v3(t.a) || !v3(t.b) || !(t.r > 0)) return bruch("kapsel a/b/r");
            } else return bruch("art " + t.art);
            if (t.rolle !== rolle && t.rolle !== "beide") continue;
            if (rolle === "sicht" && !v3(t.farbe)) return bruch("farbe");
            out.push(t);
        }
        return out;
    }
    // Die Teile einer Hülle als Welt-March-Defs (`_weltKapselHolen`): Kasten, Keil (Typ 2..5 = First +z · −z · +x · −x, der
    // Walm im Bruchteil), Kapsel — die Farbe linear wie jedes Mesh.
    static _huelleMarchDefs(teile) {
        const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
        const F = (a) => ({ r: a[0], g: a[1], b: a[2] });
        return teile.map((t) =>
            t.art === "kapsel"
                ? { a: V(t.a), b: V(t.b), r: t.r, farbe: F(t.farbe) }
                : t.art === "keil"
                  ? {
                        prism: true,
                        keilTyp: AnazhRealm.HUELLE_KEIL_TYP[t.first],
                        walm: t.walm || 0,
                        c: V(t.c),
                        h: V(t.h),
                        farbe: F(t.farbe),
                    }
                  : { box: true, c: V(t.c), h: V(t.h), farbe: F(t.farbe) }
        );
    }
    // DIE EINE NAH-GRENZE der Streu-Fernform (Schöpfer-Wort 30.09.: „AAA nah, nicht Kapseln"): die Fernform einer Art
    // (gesetz · boden) gilt mit Fern-Wunsch erst ab `ANALOG_NAH_M` — diesseits trägt ihr Studio-Mesh (die Stufen-Klammer
    // serviert die Art, Fels sein L0, die Blume ihre L2, Gras seine Stufe). null = die Mesh-Bahn, auch für "karte" (Baum, Strauch).
    // Leser: der Zellen-Chokepoint (`_scatterMaterializeCell`), der Bahnwechsel des LOD-Ticks und die Gestalt-Gleichheit
    // — EINE Grenze für Tier, Bau und Streu, kein zweites Maß (W1 las bis 05.10. Welt-d1 + Hysterese, 29,4 m).
    _streuFernBahn(preset, lod, dist) {
        if (!(lod >= 2) || !(dist >= AnazhRealm.ANALOG_NAH_M)) return null;
        const fern = this._foundryFernForm(preset);
        return fern === "karte" ? null : fern;
    }

    // Die ZELLE einer (Art, Gestalt[, ov]) im EINEN Karten-Atlas (`_impostorAtlas`): null = die Geometrie für den
    // Rahmen lädt (Null-Renderer), false = gescheitert (der Aufrufer serviert Geometrie), sonst die Zelle. Mit echtem
    // Renderer entsteht sie rahmenlos und reiht ihren Bake sofort ein — Rahmen und Pixel liefert die Schicht; keine
    // Körper-Stufe wird für die Karte gezogen.
    _foundryEnsureImpostorRecord(preset, variant, ov) {
        const at = this._impostorAtlas();
        if (!at) return null;
        // BÄCKER-OV (V18.478) — ein GEPRÄGTES Entry (ov) trägt seine eigene Zelle: Schlüssel und Bake tragen den
        // ov-Hash (die EINE _studioOvHash-Quelle). Keine Saison: die Karte ist Golden-Sommer, das Jahr färbt der Stoff.
        const ovK = ov && typeof ov === "object" ? ov : null;
        const key = "fimp:" + this._foundryKartenKey(preset, variant, ovK);
        const da = at.zellen.get(key);
        if (da) return da.gescheitert ? false : da;
        const rendR = this.state && this.state.renderer;
        if (rendR && !rendR._isHeadlessNull) {
            this._scatterRefillPending = true;
            return this._impostorZelleNeu(at, key, preset, variant, ovK);
        }
        // Der Null-Renderer bäckt nie: der Rahmen der Zelle kommt aus der L1-Geometrie (fehlt sie: EINMAL anfordern)
        // bzw. der deklarierten Stufe der Art (Tor gate=[0] aus L0) — Höhe box.max.y (Anker Stammbasis), Breite der
        // radiale Vertex-Scan, Formel in phyto-core (__phytoCore.scanRadialXZ / impostorFrame, wie der Studio-Bäcker).
        const bakeLod = this._foundryDeclaredStage(preset, 1);
        const gkey = this._foundryKoerperKey(preset, variant, bakeLod, ovK);
        const group = this._foundryCacheGet(gkey);
        if (group === undefined) {
            const f = this._ensureAssetFoundry();
            if (!f) return null;
            if (!f.requested) f.requested = new Set();
            if (!f.requested.has(gkey)) {
                f.requested.add(gkey);
                this._foundryRequest(preset, variant, bakeLod, ov || undefined).then((meshes) => {
                    if (meshes) {
                        this._foundryCacheSet(gkey, this._foundryBuildGroup(meshes, { lod: bakeLod, preset }));
                        this._scatterRefillPending = true;
                        // Im Ankunfts-Moment die Zelle anlegen (Cache-Hit → Rahmen) — sonst entsteht sie erst beim
                        // nächsten zufälligen Leser.
                        this._foundryEnsureImpostorRecord(preset, variant, ov || undefined);
                    } else {
                        f.requested.delete(gkey); // Timeout: nicht dauerhaft doomen
                    }
                    this._foundryRewarmColdTrees();
                });
            }
            return null; // die Geometrie lädt (der Aufrufer lässt L2 kalt)
        }
        const z = this._impostorZelleNeu(at, key, preset, variant, ovK);
        if (group === null || !group.children || !group.children.some((c) => c.geometry && c.material)) {
            z.gescheitert = true; // Foundry kann das nicht → Aufrufer nimmt Geometrie
            return false;
        }
        const box = new THREE.Box3().setFromObject(group);
        let rad2 = 0.25;
        const core = globalThis.__phytoCore;
        group.traverse((o) => {
            if (o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position)
                rad2 = core.scanRadialXZ(o.geometry.attributes.position.array, rad2);
        });
        z.frame = core.impostorFrame(Math.max(1, box.max.y), Math.sqrt(rad2));
        this._scatterRefillPending = true;
        return z;
    }
    // L2 — die Studio-Karte als HISM-Flat: das Einheits-Quad des Atlas mit dem EINEN Karten-Material, Schicht und
    // Rahmen der Zelle reisen je Instanz. Gecacht auf der Zelle. null solange der Rahmen lädt, false bei Fehler oder —
    // mit echtem Renderer — bis die Schicht gebacken ist (der Aufrufer serviert Geometrie, die Stufen-Klammer).
    _foundryBuildImpostorFlat(entry, preset) {
        const variant = this._foundryGestaltFor(entry, preset);
        if (variant == null) return null; // Buch kalt — L2 kalt, der Tick baut nach
        // Ein geprägtes Entry zieht seine ov-Zelle; ist sie noch nicht da (null), fällt der Pfad auf GEOMETRIE (nie
        // kalt, nie die ungeprägte Karte). Ungeprägt: ovE null.
        const ovE = this._artifactStudioOv(entry);
        const z = this._foundryEnsureImpostorRecord(preset, variant, ovE || undefined);
        if (z === null) return ovE ? false : null; // geprägt+backend → Geometrie · sonst L2 kalt
        if (!z) return false;
        // Bedarf-Stempel für den Bäcker (nah zuerst): die kleinste Distanz² eines wartenden Eintrags zum Spieler.
        if (!z.gebacken && entry && entry.position) {
            const pp = this.state.playerMesh && this.state.playerMesh.position;
            if (pp) {
                const bx = entry.position.x - pp.x,
                    bz = entry.position.z - pp.z;
                const d2 = bx * bx + bz * bz;
                if (!(z._bedarfD2 <= d2)) z._bedarfD2 = d2;
            }
        }
        // Mit echtem Renderer trägt die Karte erst gebacken: bis dahin liefert der Flatten für die Baum-Fernstufe NICHTS
        // (false), nie Geometrie — nah trägt die Wunsch-Stufe, fern wartet der Baum (ein Karten-Ding hat keinen Satz).
        // Headless/Null-Renderer trägt der Rahmen aus der L1-Geometrie (dort bäckt nie einer).
        const rendB = this.state && this.state.renderer;
        if (!z.gebacken && rendB && !rendB._isHeadlessNull) return false;
        if (z._flat) return z._flat;
        // Die Karte blendet nach DERSELBEN Sichthöhe wie ihre 3D-Stufen (das Studio: die Karten-Instanz trägt bh, die
        // Sichthöhe des echten Baums): die Höhe der Höhen-Stufe aus dem Höhen-Buch, je Slot × Instanz-Skala gestempelt
        // (|aKarte.w|) — nie die Rahmen-Höhe des Bakes (sie wich bis ~2 % + Bake-Rand ab). Unbekannt: die Karte wartet.
        const hz = this._foundryBaumHoehe(preset, entry);
        if (hz == null) return null;
        // PARITÄT: der Rahmen ist TEMPLATE-lokal → dieselbe Template→Welt-Übersetzung wie die 3D-Stufen
        // (localMatrix), sonst wäre der ferne Baum ⅓ so groß wie sein nahes Pendant (LOD-Pop beim Übergang).
        const leaf = this._impostorLeaf(z, this._foundryWorldScaleMatrix(preset), hz);
        if (!leaf) return false;
        z._flat = { instanceable: true, reason: "foundry-impostor", foundry: true, lod: 2, leaves: [leaf] };
        return z._flat;
    }
    // Vorlagen-Rinden-Normalmap (`makeBarkNormal`, byte-treu portiert): Hauptfissuren + Querrisse +
    // Knubbel → Höhenfeld → Normalmap. EINE gecachte Textur für alle Rinden; mulberry32(99) wie im Studio.
    _foundryBarkNormalTexture() {
        if (this._foundryBarkNormal !== undefined) return this._foundryBarkNormal;
        this._foundryBarkNormal = null;
        if (typeof document === "undefined" || typeof THREE === "undefined") return null;
        try {
            const N = 512;
            const c = document.createElement("canvas");
            c.width = c.height = N;
            const x = c.getContext("2d");
            if (!x) return null;
            const img = x.createImageData(N, N);
            const h = new Float32Array(N * N);
            const mk = (a) =>
                function () {
                    a |= 0;
                    a = (a + 0x6d2b79f5) | 0;
                    let t = Math.imul(a ^ (a >>> 15), 1 | a);
                    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
                    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                };
            const s = mk(99);
            for (let i = 0; i < 300; i++) {
                const cx = s() * N,
                    w = 1 + s() * 3.5,
                    dep = 0.6 + s() * 0.7; // vertikale Hauptfissuren
                for (let y = 0; y < N; y++) {
                    const wob = Math.sin(y * 0.05 + i) * 4 + Math.sin(y * 0.013 + i * 2.1) * 7;
                    const px = Math.floor(cx + wob);
                    for (let d = -w; d <= w; d++) {
                        const xx = (((px + d) % N) + N) % N;
                        h[y * N + xx] -= Math.exp(-(d * d) / (w * w)) * dep;
                    }
                }
            }
            for (let i = 0; i < 95; i++) {
                const cy = s() * N,
                    len = N * (0.2 + s() * 0.5),
                    x0 = s() * N,
                    w = 0.8 + s() * 2.0,
                    dep = 0.5 + s() * 0.6; // horizontale Querrisse -> Platten
                for (let t = 0; t < len; t++) {
                    const wob = Math.sin(t * 0.06 + i) * 3;
                    const yy = Math.floor(cy + wob),
                        xx = ((Math.floor(x0 + t) % N) + N) % N;
                    for (let d = -w; d <= w; d++) {
                        const y2 = (((yy + d) % N) + N) % N;
                        h[y2 * N + xx] -= Math.exp(-(d * d) / (w * w)) * dep;
                    }
                }
            }
            for (let i = 0; i < 1500; i++) {
                const px = Math.floor(s() * N),
                    py = Math.floor(s() * N),
                    r = 2 + s() * 5,
                    amp = (s() - 0.5) * 0.55; // Knubbel/Rauheit
                for (let dy = -r; dy <= r; dy++)
                    for (let dx = -r; dx <= r; dx++) {
                        const xx = (((px + dx) % N) + N) % N,
                            yy = (((py + dy) % N) + N) % N;
                        h[yy * N + xx] += Math.exp(-(dx * dx + dy * dy) / (r * r)) * amp;
                    }
            }
            for (let i = 0; i < h.length; i++) h[i] += (s() - 0.5) * 0.18;
            const G = 6.5;
            for (let y = 0; y < N; y++)
                for (let xx = 0; xx < N; xx++) {
                    const dx = (h[y * N + ((xx + 1) % N)] - h[y * N + ((xx - 1 + N) % N)]) * G;
                    const dy = (h[((y + 1) % N) * N + xx] - h[((y - 1 + N) % N) * N + xx]) * G;
                    const l = Math.sqrt(dx * dx + dy * dy + 1);
                    const p = (y * N + xx) * 4;
                    img.data[p] = ((dx / l) * 0.5 + 0.5) * 255;
                    img.data[p + 1] = ((dy / l) * 0.5 + 0.5) * 255;
                    img.data[p + 2] = (1 / l) * 255;
                    img.data[p + 3] = 255;
                }
            x.putImageData(img, 0, 0);
            const tex = new THREE.CanvasTexture(c);
            tex.name = "rinde-normal";
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(2, 7);
            tex.needsUpdate = true;
            this._foundryBarkNormal = tex;
        } catch (_e) {
            throw this._stoffBruch("die Rinden-Normale (Vorlagen-Textur)", _e);
        }
        return this._foundryBarkNormal;
    }
    // ═══ DER FLÄCHEN-SPLAT (die EINE Splat-Wurzel aller drei Bäcker) ═══
    // Rastert DREIECKE statt Vertices (ein Vertex-Splat lässt die meisten Oberflächen-Voxel leer → Matsch
    // im March): je Dreieck ~2 Proben je Voxel-Fläche (goldene 2D-Folge, kein Math.random), Farbe
    // barycentrisch; das Proben-Budget skaliert proportional über die Gesamt-Fläche. Indexlose Soups =
    // (i, i+1, i+2); Riesen-Meshes tasten im Schritt ab und wichten hoch. randArt: "klemm" (Default) |
    // "skip" (Teil-Box-Bakes: Proben außerhalb fallen).
    _feldFlaechenSplat(daten, d, bbMin, sx, sy, sz, geo, col, mc, m, sollProben, randArt) {
        const pos = geo && geo.attributes && geo.attributes.position;
        if (!pos || pos.count < 3) return;
        const idx = geo.index || null;
        const triN = Math.floor((idx ? idx.count : pos.count) / 3);
        if (triN < 1) return;
        const A = this._ffsA || (this._ffsA = new THREE.Vector3());
        const B = this._ffsB || (this._ffsB = new THREE.Vector3());
        const C = this._ffsC || (this._ffsC = new THREE.Vector3());
        const kx = d / sx;
        const ky = d / sy;
        const kz = d / sz;
        const schrittT = triN > 40000 ? Math.ceil(triN / 40000) : 1;
        // Pass 1: Gesamt-Fläche in Voxel² (der Proportional-Faktor braucht sie).
        let gesamtFl = 0;
        for (let t = 0; t < triN; t += schrittT) {
            const i0 = idx ? idx.getX(t * 3) : t * 3;
            const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
            const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
            A.fromBufferAttribute(pos, i0);
            B.fromBufferAttribute(pos, i1);
            C.fromBufferAttribute(pos, i2);
            if (m) {
                A.applyMatrix4(m);
                B.applyMatrix4(m);
                C.applyMatrix4(m);
            }
            const ux = (B.x - A.x) * kx;
            const uy = (B.y - A.y) * ky;
            const uz = (B.z - A.z) * kz;
            const wx = (C.x - A.x) * kx;
            const wy = (C.y - A.y) * ky;
            const wz = (C.z - A.z) * kz;
            const cxp = uy * wz - uz * wy;
            const cyp = uz * wx - ux * wz;
            const czp = ux * wy - uy * wx;
            gesamtFl += Math.sqrt(cxp * cxp + cyp * cyp + czp * czp) * 0.5 * schrittT;
        }
        if (!(gesamtFl > 0)) return;
        const f = Math.min(2.5, (sollProben || d * d * 24) / gesamtFl);
        // Pass 2: säen.
        for (let t = 0; t < triN; t += schrittT) {
            const i0 = idx ? idx.getX(t * 3) : t * 3;
            const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
            const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
            A.fromBufferAttribute(pos, i0);
            B.fromBufferAttribute(pos, i1);
            C.fromBufferAttribute(pos, i2);
            if (m) {
                A.applyMatrix4(m);
                B.applyMatrix4(m);
                C.applyMatrix4(m);
            }
            const ax = (A.x - bbMin.x) * kx;
            const ay = (A.y - bbMin.y) * ky;
            const az = (A.z - bbMin.z) * kz;
            const bx = (B.x - bbMin.x) * kx;
            const by = (B.y - bbMin.y) * ky;
            const bz = (B.z - bbMin.z) * kz;
            const cx = (C.x - bbMin.x) * kx;
            const cy = (C.y - bbMin.y) * ky;
            const cz = (C.z - bbMin.z) * kz;
            const ux = bx - ax;
            const uy = by - ay;
            const uz = bz - az;
            const wx = cx - ax;
            const wy = cy - ay;
            const wz = cz - az;
            const cxp = uy * wz - uz * wy;
            const cyp = uz * wx - ux * wz;
            const czp = ux * wy - uy * wx;
            const fl = Math.sqrt(cxp * cxp + cyp * cyp + czp * czp) * 0.5 * schrittT;
            const n = Math.min(128, Math.max(1, Math.round(fl * f)));
            let c0r = 0.55,
                c0g = 0.5,
                c0b = 0.45,
                c1r = 0.55,
                c1g = 0.5,
                c1b = 0.45,
                c2r = 0.55,
                c2g = 0.5,
                c2b = 0.45;
            if (col) {
                c0r = col.getX(i0);
                c0g = col.getY(i0);
                c0b = col.getZ(i0);
                c1r = col.getX(i1);
                c1g = col.getY(i1);
                c1b = col.getZ(i1);
                c2r = col.getX(i2);
                c2g = col.getY(i2);
                c2b = col.getZ(i2);
            } else if (mc) {
                c0r = c1r = c2r = mc.r;
                c0g = c1g = c2g = mc.g;
                c0b = c1b = c2b = mc.b;
            }
            for (let s2 = 0; s2 < n; s2++) {
                let u = ((s2 + 0.5) * 0.7548776662) % 1;
                let w2 = ((s2 + 0.5) * 0.5698402909) % 1;
                if (u + w2 > 1) {
                    u = 1 - u;
                    w2 = 1 - w2;
                }
                const q0 = 1 - u - w2;
                const px = ax * q0 + bx * u + cx * w2;
                const py = ay * q0 + by * u + cy * w2;
                const pz = az * q0 + bz * u + cz * w2;
                if (randArt === "skip" && (px < 0 || px >= d || py < 0 || py >= d || pz < 0 || pz >= d)) continue;
                const vx = Math.min(d - 1, Math.max(0, px | 0));
                const vy = Math.min(d - 1, Math.max(0, py | 0));
                const vz = Math.min(d - 1, Math.max(0, pz | 0));
                const oI = (vz * d * d + vy * d + vx) * 4;
                // Gekoppelte Akkumulation: rgb UND alpha wachsen im selben 90er-Schritt und stoppen zusammen am
                // Alpha-Deckel → rgb/alpha ist auf jeder Füllstufe exakt die Albedo (sonst sättigt rgb gegen Weiß).
                if (daten[oI + 3] < 255) {
                    daten[oI] = Math.min(255, daten[oI] + (c0r * q0 + c1r * u + c2r * w2) * 90);
                    daten[oI + 1] = Math.min(255, daten[oI + 1] + (c0g * q0 + c1g * u + c2g * w2) * 90);
                    daten[oI + 2] = Math.min(255, daten[oI + 2] + (c0b * q0 + c1b * u + c2b * w2) * 90);
                    daten[oI + 3] = Math.min(255, daten[oI + 3] + 90);
                }
            }
        }
    }

    // Die WELT-PLATZIERUNGS-MATRIX eines Eintrags aus seiner Transform allein
    // (position mit −0.5-baseY wie _rebuildArchitectureMesh · rotationY · scale)
    // — so kann eine DEDUP-Instanz platziert werden, OHNE ihr Mesh zu bauen.
    _archWeltMatrix(entry) {
        const p = entry.position || { x: 0, y: 0, z: 0 };
        const baseY = Number.isFinite(p.y) ? p.y - 0.5 : 0;
        const s = Number.isFinite(entry.scale) ? entry.scale : 1;
        const q = new THREE.Quaternion().setFromAxisAngle(
            this._archUp || (this._archUp = new THREE.Vector3(0, 1, 0)),
            entry.rotationY || 0
        );
        return new THREE.Matrix4().compose(new THREE.Vector3(p.x || 0, baseY, p.z || 0), q, new THREE.Vector3(s, s, s));
    }

    // ═══ DIE ARCH-BAHN: Bau = BOX-SATZ ═══
    // Key `aarch:type:variant` (mit studioOv `…:ov:<hash>`, ohne ov byte-alt), Dedup über gleiche Vorlage.
    // Payload = die Hülle des Gesetzbuchs (Studio-Dinge mit fernform "huelle", `_archFoundryZiegel`), sonst _archBoxFit
    // (bis 24 AABB-Boxen im Vorlagen-Raum).
    // Voxel-Bricks fail-closed; das Mesh ist nur unsichtbarer Interaktions-Körper. Bake getaktet.
    _archZiegelFern(entry) {
        const st = this.state;
        if (st.renderer && st.renderer._isHeadlessNull) return false;
        // Ein Karten-Ding hat keinen Satz: fern IST es seine Karte (`_archKartenPreset`, B2c `fernform`).
        if (this._archKartenPreset(entry)) {
            this._archZiegelTod(entry);
            return false;
        }
        if (entry._ziegelSlot) {
            // Der Slot zeichnet, außer in der Mesh-Zone über dem stehenden Mesh — dieselbe Regel wie der Culling-Tick.
            // Vorher schaltete dieser Ruf jeden Takt AN und der Culling-Tick gleich wieder AUS (je Takt jede Seite der
            // Mesh-Zone schmutzig) — der Schwund begann so jeden Takt von vorn und endete nie (gemessen 04.10.: 197
            // Sätze dauerhaft „schwindend").
            this._weltFeldAktiv(entry._ziegelSlot, !(entry._ziegelNah && this._archIsRendered(entry)));
            return false;
        }
        if (entry._ziegelGebacken) return false; // endgültig aufgegeben (8 Versuche / Erschöpfung)
        const wm = this._weltMarchEnsure();
        const ov =
            entry.studioOv && typeof entry.studioOv === "object" && !Array.isArray(entry.studioOv)
                ? entry.studioOv
                : null;
        const ovH = ov ? `:ov:${this._studioOvHash(ov)}` : "";
        // Foundry-Naht: ein gesetztes Studio-Ding ohne Karte (Fels, Kristall) passt aus der Foundry-Flat, NIE aus
        // einem temporär gebauten Async-Mesh (leer → nach 8 Versuchen ausgebrannt → für immer unsichtbar). „Lädt
        // noch" verbrennt weder Versuch noch Bake-Takt.
        const fPreset = this._archFoundryPreset(entry);
        if (fPreset) return this._archFoundryZiegel(entry, fPreset, ovH);
        const key = `aarch:${entry.type}:${entry._lodVariantIndex || 0}${ovH}`;
        if (!(wm && wm.kapselCache.has(key)) && !this._weltBakeErlaubt(this._archZiegelD2(entry))) return false; // Fit-Takt
        const M = this._archWeltMatrix(entry);
        let fitWar = "hit";
        const einblenden = entry._ziegelNah === undefined; // fern entstanden (nie in der Mesh-Zone): die Geburt blendet ein
        const handle = this._weltKapselSpawn(
            key,
            M,
            () => {
                // Ein Bau ohne Studio-Vorlage (der Grammatik-Bau): die Vorlage EINMAL bauen + LOKAL passen (relativ zu M⁻¹).
                // Das Studio-Haus trägt seine Fernform selbst (die Hülle des Gesetzbuchs, oben `_archFoundryZiegel`).
                const hatte = this._archIsRendered(entry);
                if (!hatte) this._rebuildArchitectureMesh(entry); // temporärer Bau NUR für den Erst-Fit
                const inv = M.clone().invert();
                const defs = entry.mesh ? this._archBoxFit(entry.mesh, inv) : null;
                if (!hatte && this._archIsRendered(entry)) this._cullArchitectureMesh(entry);
                fitWar = defs && defs.length ? "gepasst" : "leer";
                return defs;
            },
            einblenden
        );
        if (handle) {
            entry._ziegelGebacken = true; // genau EIN Eintrag je Bau
            entry._ziegelSlot = handle;
            return true;
        }
        if (fitWar === "leer") {
            // ASYNC-Foundry: der temporäre Bau war beim ersten Tick noch leer —
            // begrenzt wiederversuchen statt den Einmal-Schuss verbrennen.
            entry._ziegelVersuche = (entry._ziegelVersuche || 0) + 1;
            if (entry._ziegelVersuche >= 8) entry._ziegelGebacken = true;
            return true;
        }
        entry._ziegelGebacken = true; // Erschöpfung (Kapsel-Liste voll) — kein Rückweg
        return true;
    }

    // Welche Foundry-Vorlage trägt diesen gesetzten Bau? null = kein Studio-Ding (S3 haus: auch das Haus ist eines — seine
    // Fernform ist die Hülle des Gesetzbuchs, `_archFoundryZiegel`). Ohne Rezeptbuch zählt die Vorlage trotzdem: der Eintrag wartet
    // auf die Flat (nie Rückfall auf einen Temporär-Mesh-Fit). Die Vorlage liest der EINE Leser
    // `_foundryPresetForEntry` (Basis-Art `_lodSpecies`, grown-Präfix): `entry.type` allein verfehlte die
    // Wald-Varianten (`grown_busch_hazel_v2`) — sie fielen in den Temporär-Bau-Fit, der für Foundry-
    // INSTANZEN nie passt (kein entry.mesh): je Versuch Slots belegen + freigeben, die Region-Bundles nahmen
    // in allen Pässen neu auf (gemessen 04.10., echte GPU, Mess-Wiese: Hasel bei 125 m, 9 Bau/Cull in 4 s).
    _archFoundryPreset(entry) {
        const typ = entry && typeof entry.type === "string" ? entry.type : "";
        if (!typ || !this._foundryEnabled()) return null;
        return this._foundryPresetForEntry(entry) || null;
    }

    // Ist dieser gesetzte Eintrag ein KARTEN-DING — ist seine Fernform die Studio-Karte? Die EINE Quelle ist das
    // Gesetzbuch (B2c `lod.budget[kind].fernform`, der Leser `_foundryFernForm`): "karte" tragen Baum und Strauch;
    // Tor und Fahrzeug tragen "gesetz" (porta-core, vehicle-core: jenseits der Nah-Grenze der Box-Satz) — bis zur
    // Integration 05.10. las diese Frage KIND_POLICY.impostor (kalt eine feste Namensliste), und Tor wie Fahrzeug
    // verschwanden jenseits des Karten-Horizonts. Ein Karten-Ding trägt fern seine Karte und nie einen Analog-Satz
    // (`tickArchitectureCulling`, `_archZiegelFern`). Das Preset oder null; ohne Buch kein Urteil (null).
    // Der Culling-Scan fragt JEDEN Eintrag je Frame: die Antwort steht am Eintrag, gültig solange Typ und Buch dieselben
    // sind (das Buch wechselt einmal, kalt → geladen; der Typ nur auf dem Grammatik-Stufen-Weg) — transient, nie im
    // Snapshot.
    _archKartenPreset(entry) {
        if (!this._foundryEnabled()) return null;
        const buch = (this._foundry && this._foundry.recipes) || null;
        if (!buch) return null;
        if (entry._kartenBuch === buch && entry._kartenTyp === entry.type) return entry._kartenPreset;
        const preset = this._foundryPresetForEntry(entry);
        // Eine Art ohne Budget-Zeile (Klang) trägt keine Fernform — kein Karten-Ding; jede mit Budget fragt den Leser
        // (fail-closed: ein Budget ohne Fernform bricht laut).
        const rec = preset ? buch[preset] : null;
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const mitBudget = !!(rec && L && L.budget && L.budget[rec.kind]);
        entry._kartenPreset = mitBudget && this._foundryFernForm(preset) === "karte" ? preset : null;
        entry._kartenBuch = buch;
        entry._kartenTyp = entry.type;
        return entry._kartenPreset;
    }

    // DER KARTEN-HORIZONT eines Karten-Dings (m): jedes zieht seinen eigenen Rand in [outerM − Saum, outerM] aus seinem
    // Samen — der gesetzte Wald dünnt über den Saum aus, kein Ring poppt, und keine Karte dithert. Befund Integration
    // 05.10.: der Horizont-Schwund der Welle (eine Distanz-Blende 352–384 m in der Karten-Maske, für JEDE Karte des
    // Atlas) ließ jeden Baum, der im Band STAND, dauerhaft halb durchsichtig — am Grat der Mess-Wiese Geister, und die
    // ganze Streu dort mit. Die Streu hat ihren eigenen Rand (`_scatterRegion`, outerM ab dem Erzeugungs-Ort).
    _archKartenHorizont(entry) {
        const u = this._pcg2d(entry.seed >>> 0, AnazhRealm.KARTEN_HORIZONT_SALZ) / 4294967296;
        return AnazhRealm.SCATTER.outerM - AnazhRealm.KARTEN_HORIZONT_SAUM_M * u;
    }

    // Foundry-Fit eines gesetzten Studio-Dings ohne Karte (Fels, Kristall): der Box-Satz (_archBoxFit) über eine
    // transiente Gruppe aus den Flat-Leaves (nie in der Szene). Karten-Dinge erreichen ihn nie (`_archZiegelFern`).
    // Flat lädt noch → warten OHNE Versuch/Bake-Takt; `false` → aufgegeben. Gestempelt (ovH): eigener Satz.
    // DIE FERNFORM "huelle" (S3, N5): der Satz IST die Liste der NUR-WURF-Stufe des Gesetzbuchs (Beipack `__fern`, der Leser
    // `_huelleVon`) — kein Fit im Wirt; fehlt die Liste, bricht die Art (KERN-PFLICHT), nie ein Box-Fit-Rückfall.
    _archFoundryZiegel(entry, preset, ovH) {
        const wm = this._weltMarchEnsure();
        if (!wm) return false;
        const variant = this._foundryGestaltFor(entry, preset);
        if (variant == null) return false; // Buch kalt — der nächste Tick fragt wieder, nichts verbrannt
        const huelle = this._foundryFernForm(preset) === "huelle";
        const stufe = huelle ? this._foundryFernStufe(preset) : 1;
        const key = `aarch:${entry.type}:f${variant}${ovH}`;
        let bf = null;
        if (!wm.kapselCache.has(key)) {
            bf = this._foundryFlattenFor(entry, preset, stufe);
            if (bf === false) {
                entry._ziegelGebacken = true;
                return true;
            }
            if (!bf || !bf.instanceable || !Array.isArray(bf.leaves) || !bf.leaves.length || bf.lod === 2) return false; // lädt noch — der nächste Tick fragt wieder, nichts verbrannt
            if (huelle && !bf.fern)
                return AnazhRealm._kernPflichtBruch("fachwerk:__fern (" + preset + ", Stufe " + stufe + ")");
            if (!this._weltBakeErlaubt(this._archZiegelD2(entry))) return false; // Fit-Takt (Treffer sind frei)
        }
        const einblenden = entry._ziegelNah === undefined; // fern entstanden (nie in der Mesh-Zone): die Geburt blendet ein
        const handle = this._weltKapselSpawn(
            key,
            this._archWeltMatrix(entry),
            () => {
                if (huelle)
                    return AnazhRealm._huelleMarchDefs(
                        AnazhRealm._huelleVon(bf.fern, "sicht", "fachwerk:__fern (" + preset + ")")
                    );
                const g = new THREE.Group();
                for (const lf of bf.leaves) {
                    if (!lf || !lf.geom) continue;
                    const m = new THREE.Mesh(lf.geom, lf.mat);
                    m.matrixAutoUpdate = false;
                    if (lf.localMatrix) m.matrix.copy(lf.localMatrix);
                    g.add(m);
                }
                return this._archBoxFit(g, new THREE.Matrix4());
            },
            einblenden
        );
        if (handle) {
            entry._ziegelGebacken = true;
            entry._ziegelSlot = handle;
            return true;
        }
        // Fit leer ODER Kapsel-Liste voll: begrenzt wiederversuchen (die Flat war da).
        entry._ziegelVersuche = (entry._ziegelVersuche || 0) + 1;
        if (entry._ziegelVersuche >= 8) entry._ziegelGebacken = true;
        return true;
    }

    // DER BOX-FIT: je Kind-Mesh eine Box (lokale AABB im Vorlagen-Raum) mit
    // Material-/Vertex-Mittel-Farbe; Instanz-Kinder fassen ihre ganze
    // Population in EINE Box (erste Ordnung). Die 24 größten tragen.
    _archBoxFit(gruppe, wurzelInv) {
        if (!gruppe || typeof THREE === "undefined") return null;
        gruppe.updateMatrixWorld(true);
        const v = this._abfV || (this._abfV = new THREE.Vector3());
        const mL = new THREE.Matrix4();
        const mI = new THREE.Matrix4();
        const kand = [];
        gruppe.traverse((o) => {
            if (!o.isMesh && !o.isInstancedMesh) return;
            const g = o.geometry;
            const pos = g && g.attributes && g.attributes.position;
            if (!pos || !pos.count) return;
            const col = g.attributes.color || null;
            const mc = !col && o.material && o.material.color ? o.material.color : null;
            const bb = new THREE.Box3();
            bb.makeEmpty();
            let fr = 0,
                fg = 0,
                fb = 0,
                fn = 0;
            const schritt = pos.count > 2000 ? Math.ceil(pos.count / 2000) : 1;
            const proj = (m) => {
                for (let i = 0; i < pos.count; i += schritt) {
                    bb.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(m));
                    if (col) {
                        fr += col.getX(i);
                        fg += col.getY(i);
                        fb += col.getZ(i);
                        fn++;
                    } else if (mc) {
                        fr += mc.r;
                        fg += mc.g;
                        fb += mc.b;
                        fn++;
                    }
                }
            };
            if (o.isInstancedMesh) {
                const n = Math.max(1, o.count | 0);
                for (let k2 = 0; k2 < n; k2++) {
                    o.getMatrixAt(k2, mI);
                    mI.premultiply(o.matrixWorld).premultiply(wurzelInv);
                    proj(mI);
                }
            } else {
                mL.multiplyMatrices(wurzelInv, o.matrixWorld);
                proj(mL);
            }
            if (bb.isEmpty()) return;
            const c = bb.getCenter(new THREE.Vector3());
            const h = bb.getSize(new THREE.Vector3()).multiplyScalar(0.5);
            kand.push({
                box: true,
                c,
                h,
                farbe: fn ? { r: fr / fn, g: fg / fn, b: fb / fn } : null,
                vol: Math.max(1e-6, h.x) * Math.max(1e-6, h.y) * Math.max(1e-6, h.z),
            });
        });
        if (!kand.length) return null;
        kand.sort((p2, q2) => q2.vol - p2.vol);
        return kand.slice(0, 24);
    }

    // Das Feld stirbt mit seinem Eintrag (der Slot wird frei — kein Atlas-Leck).
    _archZiegelTod(entry) {
        if (!entry) return;
        if (!entry._ziegelSlot) return;
        this._weltFeldFrei(entry._ziegelSlot);
        entry._ziegelSlot = null;
    }

    // (Die Oktanten-Zerlegung der Voxel-Ära fiel mit dem Schöpfer-Wort
    // „analog!" — der Bau ist sein Box-Satz, _archBoxFit ist die Naht.)

    // Gestalt-Kapsel-Fit der Gesetz-Streu (Fels, Blume): je Teil eine Kapsel im Vorlagen-Raum (größte Ausdehnung =
    // Achse, Neben-Halbachsen = Radius, Material-/Vertex-Farbe), kompakte Teile als Ellipsoid; die 6 volumen-größten
    // Teile tragen die Gestalt. (Der Baum-Satz aus Grammatik-Kegeln und Kronen-Lappen fiel 05.10.: ein Baum ist fern
    // seine Karte, `_archKartenPreset`.)
    _gestaltKapselFit(teile) {
        const v = this._bkfV || (this._bkfV = new THREE.Vector3());
        const kand = [];
        for (const lf of teile) {
            if (!lf || !lf.geom || !lf.geom.attributes || !lf.geom.attributes.position) continue;
            const pos = lf.geom.attributes.position;
            const col = lf.geom.attributes.color || null;
            const mc = !col && lf.mat && lf.mat.color ? lf.mat.color : null;
            const bb = new THREE.Box3();
            bb.makeEmpty();
            let fr = 0,
                fg = 0,
                fb = 0,
                fn = 0;
            const schritt = pos.count > 2000 ? Math.ceil(pos.count / 2000) : 1;
            for (let i = 0; i < pos.count; i += schritt) {
                v.fromBufferAttribute(pos, i);
                if (lf.localMatrix) v.applyMatrix4(lf.localMatrix);
                bb.expandByPoint(v);
                if (col) {
                    fr += col.getX(i);
                    fg += col.getY(i);
                    fb += col.getZ(i);
                    fn++;
                } else if (mc) {
                    fr += mc.r;
                    fg += mc.g;
                    fb += mc.b;
                    fn++;
                }
            }
            if (bb.isEmpty()) continue;
            const c = bb.getCenter(new THREE.Vector3());
            const h = bb.getSize(new THREE.Vector3()).multiplyScalar(0.5);
            const farbe = fn ? { r: fr / fn, g: fg / fn, b: fb / fn } : null;
            const vol = h.x * h.y * h.z;
            const hmin = Math.min(h.x, h.y, h.z);
            const hmax = Math.max(h.x, h.y, h.z);
            // Kompakt (ein Stein, ein Blütenkopf): Ellipsoid statt AABB-Kapsel
            if (hmin > 1e-6 && hmax / hmin <= 2.2) {
                kand.push({
                    ellipsoid: true,
                    c,
                    h: new THREE.Vector3(Math.max(0.01, h.x), Math.max(0.01, h.y), Math.max(0.01, h.z)),
                    farbe,
                    vol,
                });
                continue;
            }
            let ax = "x";
            if (h.y > h[ax]) ax = "y";
            if (h.z > h[ax]) ax = "z";
            const nb = ["x", "y", "z"].filter((kk) => kk !== ax);
            const r = Math.max(0.02, (h[nb[0]] + h[nb[1]]) * 0.5);
            const lang = Math.max(0, h[ax] - r);
            const a = c.clone();
            a[ax] -= lang;
            const b = c.clone();
            b[ax] += lang;
            kand.push({
                a,
                b,
                r,
                farbe,
                vol,
            });
        }
        if (!kand.length) return null;
        kand.sort((p, q) => q.vol - p.vol);
        return kand.slice(0, 6);
    }

    // (Der GLIED-BÄCKER der Voxel-Ära fiel mit dem Schöpfer-Wort „analog!" —
    // die Kreatur-Glieder sind Kapsel-GESETZE, _gliedKapselFit ist die Naht.)

    // DIE GLIEDER DER GESTALT — EINE Quelle für Fern-Bild UND Treffer (Welle L 06.10.): jedes Mesh gehört seinem
    // nächsten artikulierten Anker (die Gruppen, die _animateTierBaum rotiert; die Tier-Haut zerfällt je dominantem
    // Bone), Mini-Gruppen verschmelzen in den Eltern-Anker, Deckel 12 je Tier. Die Grobstufe (`_gelenk.fern`) zählt NIE
    // (Doppel-Körper). Liefert { gruppen: Map(Anker → {meshes, verts}), wurzel, gattung } oder null.
    _kreaturGliederGruppen(cr) {
        const tb = cr.userData && cr.userData._tierBaum;
        const anker = new Set();
        if (tb && tb.teile) for (const k in tb.teile) if (tb.teile[k] && tb.teile[k].isObject3D) anker.add(tb.teile[k]);
        const wurzel = (tb && tb.wrap) || cr;
        anker.add(wurzel);
        const gruppen = new Map();
        const ankerVon = (start) => {
            let a = start;
            while (a && a !== cr && !anker.has(a)) a = a.parent;
            return a && anker.has(a) ? a : wurzel;
        };
        const zuGruppe = (schluessel, o, n) => {
            let g = gruppen.get(schluessel);
            if (!g) gruppen.set(schluessel, (g = { meshes: [], verts: 0 }));
            g.meshes.push(o);
            g.verts += n;
        };
        // jede Lage der Zerlegung liest die RUHE der Gestalt (`_gestaltRuhe`), nie den laufenden Rahmen des Tiers
        const ruhe = this._gestaltRuhe(cr);
        cr.traverse((o) => {
            if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
            const grob = cr.userData._gelenk ? cr.userData._gelenk.fern : null;
            for (let p = o; grob && p && p !== cr; p = p.parent) if (p === grob) return; // die Grobstufe wäre der Doppel-Körper
            // Das Fell ist kein Leib (K28): die Glieder (Treffer, Biss, Fern-Bild) passen auf Haut und starre Teile — die
            // Schalen und Strähnen über ihnen trügen ihre Länge in jedes Volumen (der Biss reichte um das Kopf-Fell weiter).
            const kl = o.userData && o.userData.__klasse;
            if (typeof kl === "string" && (kl === "fellSchale" || kl.indexOf("straehne") === 0)) return;
            // Die Tier-Haut (V18.497) ist EIN SkinnedMesh über alle Glieder: je Vertex zählt der dominante
            // Bone (skinIndex[0] trägt das größte Gewicht) — die Haut zerfällt in Glied-Stücke, deren
            // matrixWorld (Bone · boneInverse · bindMatrix) den Bind-Raum starr an die LAUFENDE Pose hängt.
            const si = o.isSkinnedMesh && o.skeleton ? o.geometry.attributes.skinIndex : null;
            if (si) {
                const pa = o.geometry.attributes.position;
                // Die Farbe reist mit dem Stück: die Tier-Haut trägt ihre Albedo als Vertex-Farbe (Material weiß,
                // colorNode) — ein Stück nur aus Positionen fiel im Fit auf das Material-Weiß (gemessen 04.10. an
                // der Mess-Wiese: alle Glieder von Fuchs, Reh und Bär 255,255,255 — die weiße Wurst am Boden).
                const ca = o.geometry.attributes.color || null;
                const proBone = new Map();
                for (let i = 0; i < pa.count; i++) {
                    const b = si.getX(i);
                    let l = proBone.get(b);
                    if (!l) proBone.set(b, (l = []));
                    l.push(i);
                }
                for (const [b, liste] of proBone) {
                    const bone = o.skeleton.bones[b];
                    const inv = o.skeleton.boneInverses[b];
                    if (!bone || !inv) continue;
                    const arr = new Float32Array(liste.length * 3);
                    const farr = ca ? new Float32Array(liste.length * 3) : null;
                    for (let n = 0; n < liste.length; n++) {
                        arr[n * 3] = pa.getX(liste[n]);
                        arr[n * 3 + 1] = pa.getY(liste[n]);
                        arr[n * 3 + 2] = pa.getZ(liste[n]);
                        if (farr) {
                            farr[n * 3] = ca.getX(liste[n]);
                            farr[n * 3 + 1] = ca.getY(liste[n]);
                            farr[n * 3 + 2] = ca.getZ(liste[n]);
                        }
                    }
                    const attribute = { position: new THREE.BufferAttribute(arr, 3) };
                    if (farr) attribute.color = new THREE.BufferAttribute(farr, 3);
                    const stueck = {
                        geometry: { attributes: attribute },
                        material: o.material,
                        matrixWorld: new THREE.Matrix4().multiplyMatrices(ruhe(bone), inv).multiply(o.bindMatrix),
                    };
                    zuGruppe(ankerVon(bone), stueck, liste.length);
                }
                return;
            }
            zuGruppe(
                ankerVon(o.parent),
                { geometry: o.geometry, material: o.material, matrixWorld: ruhe(o) },
                o.geometry.attributes.position.count
            );
        });
        if (gruppen.size === 0) return null;
        const zielVon = (a) => {
            let p = a === wurzel ? null : a.parent;
            while (p && p !== cr && !anker.has(p)) p = p.parent;
            return p && p !== cr && anker.has(p) ? p : wurzel;
        };
        const merge = (von, nach) => {
            const g = gruppen.get(von);
            let z = gruppen.get(nach);
            if (!z) gruppen.set(nach, (z = { meshes: [], verts: 0 }));
            z.meshes.push(...g.meshes);
            z.verts += g.verts;
            gruppen.delete(von);
        };
        for (const [a, g] of [...gruppen]) if (a !== wurzel && g.verts < 300 && gruppen.has(a)) merge(a, zielVon(a));
        while (gruppen.size > 12) {
            let kleinster = null;
            for (const [a, g] of gruppen)
                if (a !== wurzel && (!kleinster || g.verts < gruppen.get(kleinster).verts)) kleinster = a;
            if (!kleinster) break;
            merge(kleinster, zielVon(kleinster));
        }
        for (const [a, g] of gruppen) g.ruhe = ruhe(a);
        return { gruppen, wurzel, gattung: this._kreaturGattung(cr) };
    }

    // DIE RUHE DER GESTALT (K07): die Welt-Matrix jedes Knotens der Gestalt, wie die Gattung RUHT — jedes benannte Glied in
    // der Lage seiner Vorlage (der Ofen-Guss, den nie ein Gang bewegt: `_tierBaum.ruhe`), der Leib im Ursprung mit Größe 1,
    // alles andere in seiner eigenen Lage. Zerlegung und Kapsel-Passung (Treffer-Volumen, Fern-Bild) lesen sie, nie den
    // laufenden Rahmen: vorher passte der Fit am ERSTEN Tier seiner Gattung, wo und wie es gerade stand — mitten im Schritt
    // (verschmolzene Glieder trugen ihren Winkel, der Rumpf des Wolfs 0,18 Lab-Einheiten), an seiner Welt-Lage, in seiner
    // Größe —, und welches Tier zuerst kam, entschied die Bake-Uhr (performance.now). Der Biss liest diese Kapseln
    // (_kreaturMaul): der Jagd-Kreislauf schwankte bei gleichem Code von Lauf zu Lauf (gate:kreatur-takt gestalt). Die
    // laufende Pose bleibt unberührt — die Ruhe wird gerechnet, nie gestellt.
    _gestaltRuhe(cr) {
        const tb = cr.userData && cr.userData._tierBaum;
        const R = tb ? tb.ruhe : null;
        if (tb && !R) throw new Error("Gestalt ohne Ruhe: _tierBaum.ruhe fehlt (der EINE Bau ist _buildCreatureGroup)");
        const memo = new Map();
        const eins = new THREE.Matrix4();
        const welt = (n) => {
            if (!n || n === cr) return eins;
            let m = memo.get(n);
            if (m) return m;
            const v = R && n.name && tb.teile[n.name] === n && R[n.name] ? R[n.name] : n;
            m = new THREE.Matrix4().compose(v.position, v.quaternion, v.scale).premultiply(welt(n.parent));
            memo.set(n, m);
            return m;
        };
        return welt;
    }

    // DIE GATTUNG eines Tiers — Dedup Gattung×Glied (PFLICHT-OFFEN A): EINE kanonische Quelle für Fern-Satz, Treffer-
    // Volumen und Vorbacken (_tickTrefferGliederVorbacken) — gattung/recipe/preset, sonst TETRAPODA_SOUL_MAP[soul],
    // sonst soul.
    _kreaturGattung(cr) {
        const ud = (cr && cr.userData) || {};
        const soul = ud.soul || "wesen";
        return (
            ud.gattung ||
            ud.recipe ||
            ud.preset ||
            (AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[soul]) ||
            soul
        );
    }

    // Die Glied-Kapsel im Anker-Raum, EINMAL je Gattung × Glied gepasst (der Schlüssel des Fern-Satzes): das Fern-Bild
    // (_kreaturGliederBacken) und das Treffer-Volumen (_kreaturTrefferGlieder) lesen DIESELBE Passung — die Gruppe der
    // Zerlegung (_kreaturGliederGruppen) trägt ihre Stücke und ihren Anker in der Ruhe der Gestalt (`_gestaltRuhe`).
    _gliedKapselMemo(key, gruppe) {
        const memo = this._gliedKapseln || (this._gliedKapseln = new Map());
        if (memo.has(key)) return memo.get(key);
        const k = this._gliedKapselFit(gruppe.meshes, new THREE.Matrix4().copy(gruppe.ruhe).invert());
        memo.set(key, k);
        return k;
    }

    // Der Fern-Satz einer Kreatur: je Glied EINE Kapsel im Welt-March (Ganz oder gar nicht: reicht der Atlas nicht,
    // fällt das ganze Tier).
    _kreaturGliederBacken(cr, einblenden) {
        const G = this._kreaturGliederGruppen(cr);
        if (!G) return null;
        // Analog-Import: das Glied wird KAPSEL (Achse + Radius + Farbe aus dem Skelett-Raum, ~32 Byte statt
        // 128 KB Brick), DEDUP je Gattung + Glied; jede Instanz posiert sie per eigener Knochen-Matrix. Der
        // March digitalisiert am Schirm; Voxel-Glieder-Bricks gibt es nicht mehr (kein Parallelpfad).
        const glieder = [];
        for (const [a, g] of G.gruppen) {
            a.updateMatrixWorld(true);
            const key = `kapsel:${G.gattung}:${a.name || "wurzel"}`;
            const handle = this._weltKapselSpawn(key, a.matrixWorld, () => this._gliedKapselMemo(key, g), einblenden);
            if (!handle) {
                for (const gl of glieder) this._weltFeldFrei(gl.handle);
                return null; // Erschöpfung: ganz oder gar nicht — kein halber Wolf
            }
            glieder.push({ teil: a, handle });
        }
        return glieder.length ? glieder : null;
    }

    // DAS TREFFER-VOLUMEN eines Tiers (Welle L 06.10., Befund K-D3): seine Glieder-Kapseln — dieselbe Passung wie
    // das Fern-Bild (_gliedKapselMemo), jede mit der Zone ihres Glieds (tetrapoda trefferZone). Die senkrechte Säule
    // 0,1 L…1,4 L war gattungs- und höhenblind (Hirsch L 0,64 flach 1 Treffer aus 10, hangab 2 aus 8). Die Glied-Liste
    // je Gattung entsteht EINMAL (die Gruppen-Bildung zerlegt die Haut je Bone — vorgebacken,
    // _tickTrefferGliederVorbacken); jedes weitere Tier löst nur die Namen an SEINEN Teilen auf. Die laufende Pose
    // trägt jeder Test über die Welt-Matrix des Ankers.
    _kreaturTrefferGlieder(cr) {
        const u = cr && cr.userData;
        if (!u) return null;
        if (u._trefferGlieder !== undefined) return u._trefferGlieder;
        // KERN-PFLICHT (Welle L): ohne tetrapoda trefferZone gibt es kein Treffer-Volumen — ein lauter BRUCH wie im
        // Treffer-Urteil (_kampfUrteil), nie ein still je Tier gespeichertes null (jedes Wesen wäre unverwundbar).
        const tc = globalThis.__tetrapodaCore;
        if (!tc || typeof tc.trefferZone !== "function") AnazhRealm._kernPflichtBruch("tetrapoda:trefferZone");
        const tb = u._tierBaum;
        if (!tb) return (u._trefferGlieder = null); // kein Studio-Leib (nur _buildCreatureGroup baut einen): keine Gestalt
        const gattung = this._kreaturGattung(cr);
        const namenMemo = this._trefferGliedNamen || (this._trefferGliedNamen = new Map());
        let namen = namenMemo.get(gattung);
        if (!namen) {
            const G = this._kreaturGliederGruppen(cr);
            if (!G) return (u._trefferGlieder = null);
            namen = [];
            for (const [a, g] of G.gruppen) {
                const name = a === G.wurzel ? "" : a.name;
                const key = `kapsel:${G.gattung}:${a.name || "wurzel"}`;
                if (this._gliedKapselMemo(key, g)) namen.push({ name, key });
            }
            namenMemo.set(gattung, namen);
        }
        const liste = [];
        for (const nm of namen) {
            const anker = nm.name ? tb.teile && tb.teile[nm.name] : tb.wrap || cr;
            const k = this._gliedKapseln && this._gliedKapseln.get(nm.key);
            if (!anker || !k) continue;
            liste.push({ anker, a: k.a, b: k.b, r: k.r, zone: tc.trefferZone(nm.name || "wolf") });
        }
        u._trefferGlieder = liste.length ? liste : null;
        return u._trefferGlieder;
    }

    // DIE TREFFER-GLIEDER VORGEBACKEN (Welle L, Lehre 14): die Glied-Liste einer Gattung entstand beim ERSTEN Treffer —
    // der Hieb zerlegte die Haut synchron (_kreaturGliederGruppen: 28–32 Tsd. Vertices je Gattung in 57–83 Bone-Stücke
    // kopiert, dazu bis 12 Kapsel-Fits). Steht ein Tier einer noch kalten Gattung in der Welt, bäckt der Frame sie vor:
    // das NÄCHSTE solche Tier zuerst, EINE Gattung je Erlaubnis der EINEN Bake-Uhr (_weltBakeErlaubt — derselbe Takt wie
    // der Fern-Satz, der dieselbe Zerlegung je Tier trägt); der Treffer liest danach nur das Memo.
    _tickTrefferGliederVorbacken() {
        const namen = this._trefferGliedNamen;
        let naechstes = null;
        let naechstD2 = Infinity;
        for (const cr of this.state.creatures || []) {
            const u = cr && cr.userData;
            if (!u || !u._tierBaum || u._trefferGlieder !== undefined) continue;
            if (namen && namen.has(this._kreaturGattung(cr))) continue;
            const d2 = this._spielerD2(cr.position.x, cr.position.z);
            if (d2 < naechstD2) {
                naechstD2 = d2;
                naechstes = cr;
            }
        }
        if (naechstes && this._weltBakeErlaubt(naechstD2)) this._kreaturTrefferGlieder(naechstes);
    }

    // DAS GROB-TOR DES TREFFERS (Integration Welle L, Gesetz #0): kann eine Strecke, die waagrecht höchstens `spanne` um
    // (x, z) liegt, das Tier überhaupt erreichen? Es liest den EINEN Leib des Tiers (_kreaturLeib.reichweite — dieselbe
    // Größe, mit der das Tier gegen Hüllen und Wagen löst), nie ein eigenes Körpermaß; Klinge und Pfeil fragen HIER, bevor
    // die Gestalt (_kreaturGliedTreffer) richtet. Vorher schätzte jeder Treffer-Pfad den Leib selbst als 2 × Skala — ein
    // dritter Leib neben dem kreatur-Leib und der Gestalt.
    _trefferErreichbar(cr, x, z, spanne) {
        const leib = this._kreaturLeib(cr, 0, this._trefferLeib || (this._trefferLeib = {}));
        const r = spanne + leib.reichweite;
        const dx = cr.position.x - x;
        const dz = cr.position.z - z;
        return dx * dx + dz * dz <= r * r;
    }

    // DER TREFFER gegen die Gestalt: kleinste Distanz einer Strecke (die Klinge, der Pfeil-Flug) zu jeder Glied-Kapsel
    // des Tiers. Trifft sie (Abstand ≤ Strecken-Radius + Glied-Radius), liefert er das tiefste Glied: seine Zone
    // (der Rumpf teilt sich am Kopf — die Hälfte zum Kopf ist Brust, die andere Bauch) und den Strecken-Parameter s
    // des Kontakts (der Hebel der Klinge, der Ort im Flug). null = vorbei.
    // `flaeche` (Welle LF, Posten 2): ein Punkt der Haut (das Ziel unter dem Fadenkreuz) gehört dem Glied, auf dessen Fläche er
    // liegt — die Wahl nach |Abstand − Glied-Radius|, nie nach der Tiefe (die dicke Rumpf-Kapsel reicht in den Hals: der Kopf
    // eines Hirschs wäre Bauch).
    _kreaturGliedTreffer(cr, ax, ay, az, bx, by, bz, radius, flaeche = false) {
        const gl = this._kreaturTrefferGlieder(cr);
        if (!gl) return null;
        cr.updateMatrixWorld(true);
        const v = this._trefferVek || (this._trefferVek = [new THREE.Vector3(), new THREE.Vector3()]);
        let best = null;
        let bestTiefe = Infinity;
        for (const g of gl) {
            const pa = v[0].copy(g.a).applyMatrix4(g.anker.matrixWorld);
            const pb = v[1].copy(g.b).applyMatrix4(g.anker.matrixWorld);
            const rg = g.r * g.anker.matrixWorld.getMaxScaleOnAxis();
            const rr = radius + rg;
            const d2 = this._segSegDistSq(ax, ay, az, bx, by, bz, pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
            if (d2 > rr * rr) continue;
            const tiefe = flaeche ? Math.abs(Math.sqrt(d2) - rg) : Math.sqrt(d2) - rr;
            if (tiefe >= bestTiefe) continue;
            bestTiefe = tiefe;
            const st = this._segSegST;
            let zone = g.zone;
            if (zone === "rumpf") {
                // Brust oder Bauch: der Kontakt auf der Rumpf-Achse, gemessen am Kopf (die Hälfte zum Kopf ist Brust).
                const kopf = cr.userData._tierBaum.teile && cr.userData._tierBaum.teile.headGroup;
                let brust = true;
                if (kopf) {
                    const k = this._trefferKopf || (this._trefferKopf = new THREE.Vector3());
                    kopf.getWorldPosition(k);
                    const t = st.t;
                    const cx = pa.x + (pb.x - pa.x) * t,
                        cy = pa.y + (pb.y - pa.y) * t,
                        cz = pa.z + (pb.z - pa.z) * t;
                    const mx = (pa.x + pb.x) / 2,
                        my = (pa.y + pb.y) / 2,
                        mz = (pa.z + pb.z) / 2;
                    brust =
                        (cx - k.x) * (cx - k.x) + (cy - k.y) * (cy - k.y) + (cz - k.z) * (cz - k.z) <=
                        (mx - k.x) * (mx - k.x) + (my - k.y) * (my - k.y) + (mz - k.z) * (mz - k.z);
                }
                zone = brust ? "brust" : "bauch";
            }
            best = { zone, s: st.s };
        }
        return best;
    }

    // Kapsel-Fit: Glied-Meshes im Knochen-LOKALEN Raum → EINE Kapsel entlang der größten Ausdehnung
    // (Radius = Mittel der Neben-Halbachsen), Farbe = Mittel der Vertex-/Material-Farben je Teil, nach Fläche
    // gewogen. Mehr Kapseln je Glied wären eine Verfeinerung DERSELBEN Bahn, nie ein neues System.
    _gliedKapselFit(meshes, wurzelInv) {
        if (!meshes || !meshes.length || typeof THREE === "undefined") return null;
        const v = new THREE.Vector3();
        const mL = new THREE.Matrix4();
        const bb = new THREE.Box3();
        const bbT = new THREE.Box3();
        const gr = new THREE.Vector3();
        bb.makeEmpty();
        // Die Farbe ist das Mittel, das man von fern SIEHT: je Teil sein Vertex-Mittel, gewogen mit der Hüll-Fläche des
        // Teils — nicht je Vertex (Augäpfel und Zähne tragen viele Vertices auf wenig Fläche; das Reh-Haupt lag
        // vertex-gemittelt bei 86,70,58 statt am Fell).
        let fr = 0,
            fg = 0,
            fb = 0,
            fw = 0;
        for (const o of meshes) {
            mL.multiplyMatrices(wurzelInv, o.matrixWorld);
            const pos = o.geometry.attributes.position;
            const col = o.geometry.attributes.color || null;
            const mc = !col && o.material && o.material.color ? o.material.color : null;
            const schritt = pos.count > 4000 ? Math.ceil(pos.count / 4000) : 1;
            bbT.makeEmpty();
            let tr = 0,
                tg = 0,
                tb = 0,
                tn = 0;
            for (let i = 0; i < pos.count; i += schritt) {
                v.fromBufferAttribute(pos, i).applyMatrix4(mL);
                bb.expandByPoint(v);
                bbT.expandByPoint(v);
                if (col) {
                    tr += col.getX(i);
                    tg += col.getY(i);
                    tb += col.getZ(i);
                    tn++;
                } else if (mc) {
                    tr += mc.r;
                    tg += mc.g;
                    tb += mc.b;
                    tn++;
                }
            }
            if (!tn || bbT.isEmpty()) continue;
            bbT.getSize(gr);
            const flaeche = Math.max(1e-6, 2 * (gr.x * gr.y + gr.y * gr.z + gr.z * gr.x));
            fr += (tr / tn) * flaeche;
            fg += (tg / tn) * flaeche;
            fb += (tb / tn) * flaeche;
            fw += flaeche;
        }
        if (bb.isEmpty()) return null;
        const c = bb.getCenter(new THREE.Vector3());
        const h = bb.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        let ax = "x";
        if (h.y > h[ax]) ax = "y";
        if (h.z > h[ax]) ax = "z";
        const nb = ["x", "y", "z"].filter((kk) => kk !== ax);
        const r = Math.max(0.01, (h[nb[0]] + h[nb[1]]) * 0.5);
        const lang = Math.max(0, h[ax] - r);
        const a = c.clone();
        a[ax] -= lang;
        const b = c.clone();
        b[ax] += lang;
        return { a, b, r, farbe: fw > 0 ? { r: fr / fw, g: fg / fw, b: fb / fw } : null };
    }

    // Das per-Ziegel-March-Material ist GEFALLEN (DER EINE WELT-MARCH): der
    // Feld-Pass marcht ALLE Felder aus Atlas+Liste in EINEM Draw — ein
    // Material je Ziegel wäre der Zwilling, den wir abgeschafft haben.

    // `wiegen` (true, optional): der Stoff einer weichen Boden-Art der Nah-Streu — er wiegt im EINEN Wind mit der Höhe über
    // der Wurzel in Metern aus dem Satz-Attribut `aWiege` (`_satzBlock`), also für jede Studio-Skala derselbe Stoff.
    _foundryTreeMaterial(kind, mp, wiegen, baum) {
        if (!this._foundryMats) this._foundryMats = {};
        const T = THREE;
        const TSL = T.TSL;
        // Material-Regler: reist `mp` mit (roughness/metalness/flatShading/env/side/Glut), baut AnazhRealm EXAKT
        // dieses Material; ohne `mp` die Baum-Defaults — die Zahlen und die Look-Familie (FELL_LOOK/HAUT_LOOK/HAAR_LOOK,
        // der Ton-Anker mp.color steht im Key) liest der Wirt aus DERSELBEN Quelle wie der Schlüssel (phyto-core
        // `budgetRegler`); Laub/Gras sind immer beidseitig.
        const R = globalThis.__phytoCore.budgetRegler(kind, mp);
        const isBark = R.rinde;
        const rough = R.r,
            metal = R.mt,
            flat = R.fl,
            env = R.env,
            sideDouble = R.doppelt,
            emis = R.em,
            emisI = R.emI,
            klasseLook = R.look;
        // Build-Zeit-Gate der Studio-Dither-Blende (Default an; Maske + CPU-Doppel-Mitgliedschaft schalten
        // zusammen am foundryCrossfade-Flag). Das Flag steht im Key: ein Live-Toggle trifft nur NEU gebaute
        // Gruppen; Material und Attribut-Stempel (`_foundryBuildGroup`) entstehen im selben Pass → konsistent. Der wiegende
        // Stoff der Nah-Streu blendet nie (ihr Stufen-Wechsel ist die Armlänge, ihre Stempel tragen 0): sein Satz trägt
        // keine Stempel (`STREU_SATZ_ATTR`).
        const xfade = !!(this.state && this.state.foundryCrossfade === true) && wiegen !== true;
        // DER SCHLÜSSEL IST DIE EINE MATERIAL-IDENTITÄT (phyto-core `budgetStoff`, W8): Art · Regler · SEITE · Gewebe ·
        // Glut · Fell-/Haut-Ton — dieselbe, mit der das Budget-Gesetz am Studio-Ausgang Stoffe zählt und faltet (die
        // Seite fehlte: ein beidseitiger Stoff teilte das Material eines einseitigen gleicher Regler, first-wins).
        // Dazu die Wirts-Zustände, die kein Studio-Stoff sind: die Dither-Blende und das Wiegen der Nah-Streu.
        const key =
            globalThis.__phytoCore.budgetStoff(kind, mp) +
            (xfade ? "|xf" : "") +
            (wiegen === true ? "|wiegt" : "") +
            (baum ? "|wind:" + baum.ht.toFixed(2) + "/" + baum.delta.toFixed(4) + "/" + baum.an : "");
        if (this._foundryMats[key]) return this._foundryMats[key];
        let mat;
        // HAUT-VOLLENDUNG (19.07.): die Lab-Haut trägt CLEARCOAT (matSkin
        // 0.12/0.6) — skin/haut minten als Physical-Material (der Standard
        // trägt keinen Lack); die Zahlen kommen NUR aus dem Kern-Gesetz.
        const _hautL =
            (kind === "skin" || kind === "haut") && typeof globalThis !== "undefined" && globalThis.__koerperCore
                ? globalThis.__koerperCore.HAUT_LOOK
                : null;
        // DER KLARLACK (W5 Gegenstände): die Haut des Körperstudios (HAUT_LOOK) ODER der Stoff selbst (Fahrzeug-Lack,
        // Klingen-Stahl — `budgetRegler` cc/ccr aus dem Gesetzbuch); ohne Klarlack der Standard. Gemessen (Integration W5,
        // echte GPU, Ausgabe-Pfad, Gesicht auf 0,75 m): die Haut hebt sich im Median 41,3 -> 42,9 (+4 %, zwei gleiche
        // Schüsse 0,2 auseinander); er trägt nur die Menschen-Haut (skin/haut — kein Tier-Stoff), keinen Befehl mehr.
        const ccSoll =
            _hautL && Number.isFinite(_hautL.clearcoat)
                ? {
                      cc: _hautL.clearcoat,
                      ccr: Number.isFinite(_hautL.clearcoatRoughness) ? _hautL.clearcoatRoughness : 0.5,
                  }
                : R.cc > 0
                  ? { cc: R.cc, ccr: R.ccr }
                  : null;
        // Die Physical-Klasse lebt in der Node-Bibliothek des Renderers (r184 — die Bootstrap-Brücke reicht sie nicht als
        // THREE-Symbol: die Probe `typeof T.MeshPhysicalNodeMaterial` fiel IMMER auf den Standard, die Haut trug nie ihren
        // Klarlack). Der Null-Renderer zeichnet nichts und trägt keine Bibliothek.
        const rendM = this.state && this.state.renderer;
        const MatK =
            ccSoll && rendM && !rendM._isHeadlessNull
                ? rendM.library.getMaterialNodeClass("MeshPhysicalMaterial")
                : T.MeshStandardNodeMaterial;
        mat = new MatK({
            roughness: rough,
            metalness: metal,
            flatShading: flat,
            side: sideDouble ? T.DoubleSide : T.FrontSide,
        });
        if (MatK !== T.MeshStandardNodeMaterial) {
            mat.clearcoat = ccSoll.cc;
            mat.clearcoatRoughness = ccSoll.ccr;
        }
        // DIE DURCHSICHT (W5): ein durchsichtiger Stoff (Scheibe, Fenster, Glimm-Scheibe) zeichnet transparent mit der
        // Deckkraft seines Gesetzbuchs und schreibt keine Tiefe (was hinter ihm liegt, bleibt sichtbar); einen Schatten
        // wirft er nicht (`_foundryBuildMesh`: das Licht geht durch ihn). Eine dünne Scheibe zeichnet beide
        // Seiten in EINEM Zug: r184 zieht einen doppelseitig-transparenten Stoff sonst zweimal (Rück-, dann Vorderseite)
        // — gemessen +1 Befehl je Wagen über den Budget-Deckel vehicle draws 12.
        if (R.op < 1) {
            mat.transparent = true;
            mat.opacity = R.op;
            mat.depthWrite = false;
            mat.forceSinglePass = true;
        }
        if (env !== 1) mat.envMapIntensity = env;
        if (emis) {
            mat.emissive = new T.Color(emis[0], emis[1], emis[2]);
            mat.emissiveIntensity = emisI;
        }
        // Tint-Kontinuität L0/L1↔L2: das Studio tintet NUR das Laub, multiplikativ, aus dem Positions-Hash
        // (foundry-core.js) — gleich über alle Stufen, sonst springt die Kronenfarbe beim Stufen-Wechsel. Das
        // Flag lässt `_scatterInstanceAdd` denselben Tint auf die 3D-Krone legen; Rinde bleibt untintet. Nur
        // das Flag, NIE attribute("instanceColor") — der native InstanceNode-Auto-Multiply trägt ihn.
        if (kind === "foliage" || kind === "foliageTex") mat.userData.useInstanceTint = true;
        // Vorlagen-Farben leben als VERTEX-COLORS: auf WebGPU/NodeMaterial MUSS colorNode = attribute("color")
        // sie lesen — `vertexColors:true` wirkt hier NICHT (sonst weißes Laub, schwarze Koniferen).
        // `_foundryBuildGroup` garantiert das color-Attribut.
        const vcol = TSL.attribute("color", "vec3");
        // DAS LEUCHT-GESETZ (Architektur-Welle 05.10.): ein Stoff, dessen Gesetzbuch `leucht` stempelt (fachwerk
        // `feuer`: Glut, Flamme, Herdfeuer), leuchtet in seiner Vertex-Farbe × leucht — heiße Mitte, kühler Rand,
        // gelbe Flammen-Wurzel, rote Spitze — statt einer Farbe für jede Fläche (das Labor webt dasselbe in r128).
        if (mp && typeof mp.leucht === "number" && mp.leucht > 0) mat.emissiveNode = vcol.mul(mp.leucht);
        // DIE SAISON IST EINE FARBE (V18.527): Laub und Gras sind Golden-Sommer gebacken — ihre Albedo × uSeasonMul
        // (das Studio-Gesetz: der Laub-Shader multipliziert mix(1, uSeasonMul, vSeasW), vSeasW = 1 auf Laub und
        // Blüte). Rinde, Fels, Kristall bleiben ungetönt.
        const _suF =
            kind === "foliage" || kind === "foliageTex" || kind === "grass" ? this._ensureSeasonUniforms() : null;
        const laubFarbe0 = _suF && _suF.uSeasonMul ? vcol.mul(_suF.uSeasonMul) : vcol;
        // DIE BLATT-UNTERSEITE (phyto-core BLATT_UNTERSEITE, 05.10.): ist die gesehene Seite nach unten gewandt
        // (normalWorld ist doppelseitig gespiegelt), trägt das Laub die hellere, mattere Unterseite — dieselben Zahlen
        // wie der Laub-Shader des Labors. Laub und Blüte, nie Gras.
        const _BU = kind === "foliage" || kind === "foliageTex" ? globalThis.__phytoCore.BLATT_UNTERSEITE : null;
        const laubFarbe = _BU
            ? TSL.mix(
                  laubFarbe0,
                  TSL.mix(laubFarbe0, TSL.vec3(laubFarbe0.dot(TSL.vec3(0.2126, 0.7152, 0.0722))), _BU.grau).mul(
                      _BU.hell
                  ),
                  TSL.float(0.5).sub(TSL.normalWorld.y.mul(_BU.steil)).clamp(0.0, 1.0)
              )
            : laubFarbe0;
        if (isBark) {
            // KEIN Normal-Override auf Vegetations-Stämmen: r184-NodeMaterial-Tangenten (UV-Derivate) kippen auf
            // gestreckten Tube-UVs die Normale → der Stamm liest schwarz. Die Rinde lebt über Albedo (Studio-
            // Vertex-Farben) + Roughness 0.93; `_foundryBarkNormalTexture` bleibt für einen tangenten-echten Pfad.
            mat.colorNode = TSL.vec4(vcol, 1.0);
        } else if (kind === "foliageTex") {
            // Blatt-Atlas: Alpha schneidet die Blattform aus (kein solides Quad), RGB × Vertex-Farbe (die
            // Vorlagen-Blattfarbe faerbt den Atlas). Es ist DER EINE Atlas, auf den die Studio-Karten routen
            // (phyto-core `bakeLeafAtlasBild`): Zelle 0 Baum-Zweig (`BLATT_ATLAS_BREIT`), 1 Weiden-Zweig (Trauer-Strähne,
            // `BLATT_ATLAS_WEIDE`), 2 Großblatt-Zweig (Strauch, `BLATT_ATLAS_GROSS`), 3 Nadel-Zweiglein (`BLATT_ATLAS_NADEL`) — dieselbe Textur wie
            // der Grammatik-Pfad (`_ensureFoliageClusterAtlas`), keine zweite.
            const atl = this._blattAtlasProbe(TSL);
            if (atl) {
                // Die Blattform schneidet die ALPHA von colorNode aus, nie `opacityNode`: der r184-Schattenpass
                // liest colorNode.a · map.a · maskShadowNode (`Renderer._getShadowNodes`), opacityNode nie — die
                // Nadel-Karten warfen volle Rechtecke. Die Atlas-Farbe: der EINE Leser (`_blattAtlasProbe`).
                mat.colorNode = TSL.vec4(atl.rgb.mul(laubFarbe), atl.a);
                mat.alphaTest = mp && typeof mp.alphaTest === "number" && mp.alphaTest > 0 ? mp.alphaTest : 0.5;
                mat.transparent = false;
            } else {
                // Nur headless (kein document): kein Stoff zeichnet — mit document liefert der Atlas oder bricht.
                mat.colorNode = TSL.vec4(laubFarbe, 1.0);
            }
        } else if (kind === "schatten") {
            // DER SCHATTEN-STOFF (S3, das EINE Wurf-Gesetz E1): der Schatten-Teil einer Stufe zeichnet nur in den Kaskaden
            // (SHADOW_TWIN_LAYER) — seine Alpha ist max(aDeckt, Atlas-Alpha): das Gerüst deckt ganz (aDeckt 1), die Karte
            // schneidet ihre Blattform aus dem EINEN Atlas (aDeckt 0). Die Alpha lebt in colorNode, nie in opacityNode:
            // der r184-Schattenpass liest colorNode.a · map.a · maskShadowNode (Lehre 26). EIN Programm für jeden
            // statischen Wurf (Baum-Teil, die Haus-Stufe 3 mit aDeckt 1).
            const atl = this._blattAtlasProbe(TSL);
            const deckt = TSL.attribute("aDeckt", "float");
            mat.colorNode = TSL.vec4(TSL.vec3(0.0), atl ? TSL.max(deckt, atl.a) : deckt);
            mat.alphaTest = 0.5;
            mat.transparent = false;
        } else if (klasseLook) {
            // Haut + Fell: Shader-Gesetze der Labs (koerperstudio matSkin: SSS-Fresnel-Saum · tetrapoda matFur:
            // Fell-Rim + Gold-Sheen + Spitzen-Rim/-Spec) reisen als DATEN (FELL_LOOK/HAUT_LOOK/HAAR_LOOK, Kern-
            // Zahlen = die EINZIGE Quelle) und werden hier als emissive-Additive gewoben (wie das Lab-GLSL).
            // Strähnen-Achse: der Bäcker trägt sie als Farbverlauf (__streuGeo: Wurzel = Ton×0.12); die Luminanz-
            // Ratio zum Ton-Anker (mp.color) gewinnt vStrandY zurück. Ohne Kern-LOOK/TSL-Symbole: byte-alt.
            mat.colorNode = TSL.vec4(vcol, 1.0);
            try {
                const tkC = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
                const kkC = typeof globalThis !== "undefined" ? globalThis.__koerperCore : null;
                const schale = kind === "fellSchale";
                const strand = kind === "hair" || kind.indexOf("straehne") === 0 || schale;
                const L =
                    kind === "skin" || kind === "haut"
                        ? kkC && kkC.HAUT_LOOK
                        : kind === "hair"
                          ? kkC && kkC.HAAR_LOOK
                          : kind === "fell"
                            ? tkC && tkC.FELL_LOOK && tkC.FELL_LOOK.koerper
                            : tkC && tkC.FELL_LOOK && tkC.FELL_LOOK.straehne;
                if (L) {
                    const ndv = TSL.normalView.normalize().dot(TSL.positionViewDirection).clamp(-1.0, 1.0);
                    const rim = TSL.float(1.0).sub(ndv.abs()).clamp(0.0, 1.0);
                    let add = null;
                    const term = (farbe, knoten) => {
                        const t = TSL.vec3(farbe[0], farbe[1], farbe[2]).mul(knoten);
                        add = add ? add.add(t) : t;
                    };
                    if (strand) {
                        const tonA = mp && Array.isArray(mp.color) && mp.color.length === 3 ? mp.color : null;
                        const tonL = tonA
                            ? Math.max(1e-4, 0.2126 * tonA[0] + 0.7152 * tonA[1] + 0.0722 * tonA[2])
                            : null;
                        const wA = Number.isFinite(L.wurzelAnker) ? L.wurzelAnker : 0.12;
                        // DAS SCHALEN-FELL (V18.497): die Schale t (aSchale.x) IST die Strähnen-Achse. Die Haar-
                        // Maske liest die Wurzel (aWurzel, Bind-Raum — sie läuft mit jeder Pose mit): das Raster
                        // folgt der Gesetz-Dichte (aSchale.z = √Median Strähnen je Fläche), je Zelle eine Locke
                        // mit gewürfeltem Zentrum, deren Radius mit der lokalen Dichte (aSchale.y) wächst und zur
                        // Spitze zuläuft; sie endet bei 55–100 % der Fell-Länge. Die inneren zwei Schalen decken
                        // (Unterwolle), wo das Gesetz Fell trägt. Farbe Wurzel → Spitze = Ton × FELL_SCHALE.
                        const aS = schale ? TSL.attribute("aSchale", "vec3") : null;
                        if (schale) {
                            const t = aS.x;
                            const p = TSL.attribute("aWurzel", "vec3").mul(aS.z);
                            const zelle = TSL.floor(p);
                            const h1 = TSL.fract(TSL.sin(zelle.dot(TSL.vec3(12.9898, 78.233, 37.719))).mul(43758.5453));
                            const h2 = TSL.fract(
                                TSL.sin(zelle.dot(TSL.vec3(39.3468, 11.1351, 83.1559))).mul(24634.6345)
                            );
                            const mitte = TSL.vec3(h1, h2, TSL.fract(h1.add(h2).mul(7.123)))
                                .sub(0.5)
                                .mul(0.4);
                            const dist = TSL.fract(p).sub(0.5).sub(mitte).length();
                            const radius = aS.y
                                .sqrt()
                                .mul(0.62)
                                .mul(TSL.float(1.0).sub(t.mul(0.75)));
                            const haar = TSL.step(dist, radius).mul(TSL.step(t, h1.mul(0.45).add(0.55)));
                            const wolle = TSL.step(t, 0.34).mul(TSL.step(0.05, aS.y));
                            // Der Ausschnitt lebt in colorNode.a wie jeder Ausschnitt (Lehre 26: der r184-Schattenpass liest
                            // colorNode.a, nie opacityNode) — kein Stoff schneidet über opacityNode, auch keiner, der heute
                            // nicht wirft. Die Kopf-Schalen (K28) tragen dasselbe Raster: Leib und Kopf EIN Stoff.
                            mat.alphaTest = 0.5;
                            const FS = AnazhRealm.FELL_SCHALE;
                            mat.colorNode = TSL.vec4(
                                vcol.mul(TSL.mix(TSL.float(FS.wurzel), TSL.float(FS.spitze), t)),
                                TSL.max(haar, wolle)
                            );
                        }
                        const sT = schale
                            ? aS.x
                            : tonL !== null
                              ? vcol
                                    .dot(TSL.vec3(0.2126, 0.7152, 0.0722))
                                    .div(tonL)
                                    .sub(wA)
                                    .div(Math.max(1e-3, 1 - wA))
                                    .clamp(0.0, 1.0)
                              : TSL.float(1.0);
                        if (Number.isFinite(L.tipRimPow) && Array.isArray(L.tipRimFarbe))
                            term(L.tipRimFarbe, rim.pow(L.tipRimPow).mul(sT));
                        if (Number.isFinite(L.specPow) && Array.isArray(L.specFarbe))
                            term(L.specFarbe, ndv.max(0.0).pow(L.specPow).mul(sT).mul(L.specAmt));
                    } else {
                        if (Number.isFinite(L.sssPow) && Array.isArray(L.sssFarbe))
                            term(L.sssFarbe, rim.pow(L.sssPow).mul(L.sssAmt));
                        if (Number.isFinite(L.rimPow) && Array.isArray(L.rimFarbe))
                            term(L.rimFarbe, rim.pow(L.rimPow).mul(L.rimAmt));
                        if (Number.isFinite(L.sheenPow) && Array.isArray(L.sheenFarbe))
                            term(L.sheenFarbe, ndv.max(0.0).pow(L.sheenPow).mul(L.sheenAmt));
                        // microFur-Sparkle (matFur: hash-Raster, Schwelle, Rim³): das Bäcker-Merge trägt kein garantiertes
                        // uv — das Raster des Bind-Raums (positionGeometry × dichte) ersetzt es; es klebt an der
                        // geskinnten Haut (V18.497), statt über die bewegten Beine zu schwimmen.
                        const mf = L.microFur;
                        if (mf && Array.isArray(mf.farbe)) {
                            const cell = TSL.floor(TSL.positionGeometry.xz.mul(mf.dichte));
                            const hsh = TSL.fract(TSL.sin(cell.dot(TSL.vec2(12.9898, 78.233))).mul(43758.5453));
                            term(mf.farbe, rim.pow(3.0).mul(TSL.step(mf.schwelle, hsh)).mul(mf.amt));
                        }
                    }
                    if (add) mat.emissiveNode = add;
                    // Wrap-Licht des Lab-Fells: ·(0.5 + 0.5·max(NdotV,0)) NACH allen Additiven — die matFur-Ordnung
                    // (outputNode multipliziert den fertigen Output inkl. emissive-Terme).
                    if (Number.isFinite(L.wrap)) {
                        const w = ndv
                            .max(0.0)
                            .mul(L.wrap)
                            .add(1.0 - L.wrap);
                        mat.outputNode = TSL.vec4(TSL.output.rgb.mul(w), TSL.output.a);
                    }
                    // Atem-Noise-Displacement der Labs (matFur/matSkin: snoise(pos·freq + t·k)·amp; hier mx_noise, gleiche
                    // Rausch-Klasse) auf fell und skin. Die Tier-Haut (fell) ist seit V18.497 geskinnt: r184
                    // setupPosition fährt das Skinning VOR dem positionNode (Vendor gelesen) — sie atmet gebogen.
                    // Die haut-Hülle des Menschen bleibt still.
                    const at = L.atem;
                    if (at && (kind === "fell" || kind === "skin")) {
                        mat.positionNode = TSL.positionLocal.add(
                            TSL.normalLocal.mul(
                                TSL.mx_noise_float(TSL.positionLocal.mul(at.freq).add(TSL.time.mul(at.t))).mul(at.amp)
                            )
                        );
                    }
                }
            } catch (_eL) {
                throw this._stoffBruch("die Look-Addition (Haut · Fell · Haar)", _eL);
            }
        } else if (mp && mp.webe) {
            // Stoff-Webung (Studio-getCloth): feine Mikro-Struktur moduliert die Stoff-Farbe (Strick grob, Denim/
            // Baumwolle fein, Leder/Gummi glatt-marmoriert) — additiv, nur wenn die Gesetz-Zeile Webung trägt.
            const wf =
                mp.webe === "knit"
                    ? 90.0
                    : mp.webe === "wool"
                      ? 70.0
                      : mp.webe === "denim"
                        ? 160.0
                        : mp.webe === "cotton"
                          ? 140.0
                          : 24.0;
            const wa =
                mp.webe === "knit"
                    ? 0.1
                    : mp.webe === "wool"
                      ? 0.08
                      : mp.webe === "leather"
                        ? 0.05
                        : mp.webe === "rubber"
                          ? 0.03
                          : 0.06;
            const wn = TSL.mx_noise_float(TSL.positionLocal.mul(wf)).mul(wa).add(1.0);
            mat.colorNode = TSL.vec4(vcol.mul(wn), 1.0);
        } else {
            // Fels/Kristall/Blume/Laub: die Vertex-Farbe (Laub/Gras × uSeasonMul), die Regler (rough/metal/flat/
            // env) sind schon oben aus `mp` gesetzt → Kristall glaenzt facettiert, Fels bleibt matt.
            mat.colorNode = TSL.vec4(laubFarbe, 1.0);
        }
        // Studio-Dither-Blende auf den Foundry-3D-Stufen: Fade-out L0 + Fade-in L1 (Laub überlappend, Rinde
        // exakte Partition); die Maske faltet in die Alpha (TSL statt discard, alphaTest cullt). Formeln = die
        // EINE Quelle `__phytoCore.lodCrossfadeMask` (via `_lodCrossfadeMaskNode`); xfade aus = Material
        // unverändert. Die Klassen-Look-Familie (Kreatur/Mensch, aLodLevel=0 → Maske = Identität) bleibt
        // maskenfrei — sonst nur tote Attribut-Reads + Warnungen auf ungestempelten Geometrien.
        if (xfade && !klasseLook) {
            const _keepX = this._lodCrossfadeMaskNode(TSL, {
                foliage: kind === "foliage" || kind === "foliageTex" || kind === "grass",
            });
            {
                // DER KANAL der Maske: der r184-Schattenpass liest colorNode.a, nie opacityNode — nur eine Maske in der
                // Farbe gilt auch dort. Die Instanz-Wahl liest Marke und Kanal (`_instanzFensterGilt`): ein Fenster
                // ohne die Maske des Passes schnitte ein Loch.
                let kanal = null;
                if (mat.opacityNode) {
                    mat.opacityNode = mat.opacityNode.mul(_keepX);
                    kanal = "deckung";
                } else if (mat.colorNode && mat.colorNode.rgb !== undefined && mat.colorNode.a !== undefined) {
                    mat.colorNode = TSL.vec4(mat.colorNode.rgb, mat.colorNode.a.mul(_keepX));
                    kanal = "farbe";
                } else
                    throw this._blendeBruch(
                        `der Stoff „${kind}" trägt keinen Kanal für die Maske (Deckung oder Farbe mit Alpha)`
                    );
                // die Schwelle trennt die Maske (0 | 1), nie die Deckkraft des Stoffs: eine Scheibe (Deckkraft 0,42 < 0,5)
                // fiel bis K11 ganz unter die Schwelle — kein Fenster, keine Wagen-Scheibe zeichnete, das Fenster-Licht
                // der Nacht (`_leuchtStoff`) blieb unsichtbar
                if (!(mat.alphaTest > 0)) mat.alphaTest = 0.5 * R.op;
                mat.userData = mat.userData || {};
                mat.userData.foundryCrossfade = true;
                mat.userData.foundryCrossfadeKanal = kanal;
            }
        }
        // DIE DURCHSICHT: jeder Pflanzen-Stoff (Rinde · Stiel · Laub · Blatt-Karte; nie Gras, nie die Klassen-Look-Familie
        // der Kreaturen und Menschen) wird zwischen Auge und Spieler und in der Nah-Kugel um das Auge durchsichtig
        // (`_kameraDurchsichtNode` seiner Art: der wiegende Stoff der Nah-Streu ist Boden, sonst Rinde oder Laub) — im
        // maskNode, den nur der Bild-Pass liest; der Schatten-Pass liest seinen eigenen maskShadowNode (immer behalten).
        if (!klasseLook && (isBark || kind === "foliage" || kind === "foliageTex")) {
            const _durch = this._kameraDurchsichtNode(TSL, wiegen === true ? "boden" : isBark ? "rinde" : "laub");
            mat.maskNode = _durch;
            mat.maskShadowNode = TSL.bool(true);
        }
        // Die Nah-Wiese wiegt (V18.508): das Studio-Gras liest dieselbe Böen-Welle wie die Streu
        // (`_windSwayOffset`, Gleichtakt) mit der Halm-Höhe in Metern (Vorlage × Studio-Skala `gras`), und
        // der Spieler biegt die Halme (uBend). Gemessen W7 (WGSL der Senke): r184 rechnet den Versatz VOR der
        // Instanzierung — Phase und Biegung lesen den Vorlagen-Raum, der Versatz dreht und skaliert mit der Instanz.
        if (kind === "grass") {
            if (!this.state.windUniforms && typeof this._grassInstanceMat === "function") this._grassInstanceMat();
            const _sk = this._foundryWorldScaleMatrix("gras").elements[0];
            const _sway = this._windSwayOffset(TSL, { ampX: 1.5, hoehe: TSL.positionGeometry.y.mul(_sk) });
            mat.positionNode = TSL.positionLocal.add(_sway);
        } else if (wiegen === true) {
            // DIE NAH-STREU WIEGT (Integration 05.10.): die weichen Boden-Arten (Farn · Schilf · Gestrüpp · Blume)
            // lesen dieselbe Böen-Welle wie Gras und Baum aus der EINEN Quelle (`_windSwayOffset`: uWindTime ·
            // uWindDir · Böe · uBend) mit der Höhe über der Wurzel in Metern (Vorlage × Welt-Skala der Pflanze — der
            // Satz trägt sie je Vertex als `aWiege`, seine Positionen liegen in Welt-Lage: Phase und Biegung lesen die
            // Welt, der Versatz liegt in Welt-Richtung). Jeder Teil einer Pflanze trägt denselben Versatz — Rute und
            // Laub, Stiel und Blüte bleiben verbunden; der Charakter (ampX 1,2) ist der des gefallenen
            // Klein-Vegetations-Zwillings.
            if (!this.state.windUniforms) this._grassInstanceMat();
            const _sway = this._windSwayOffset(TSL, { ampX: 1.2, hoehe: TSL.attribute("aWiege", "float") });
            mat.positionNode = TSL.positionLocal.add(_sway);
        }
        // das Leuchtquellen-Gesetz: der Licht-Pool und der Zeitplan des Gesetzbuchs (`mp.licht`) im Leuchten (K11)
        this._leuchtStoff(mat, mp);
        mat.userData = mat.userData || {};
        mat.userData.foundryKind = kind;
        mat.userData.foundryMp = mp || null; // die Regler reisen mit: die Nah-Streu baut denselben Stoff wiegend
        // Observer-Diät auch für die Masken-Familie: ihr Graph hängt an Vertex-Farben + Stempel-Attributen
        // (aLodLevel/aH0/aH0L — equals sieht Attribut-Versionen), geteilten LOD-Uniforms (renderGroup) und dem
        // statischen Blatt-Atlas. Kein stiller Rückfall: ein Stoff, der nicht baut, wirft laut (bis K11 fing ein Fang jeden
        // Fehler und baute einen Standard-Stoff ohne Knoten — ohne Pool, ohne Maske, ohne Wind).
        this._materialObserverDiaet(mat);
        this._foundryMats[key] = mat;
        // der Wurf-Teil (kind "schatten") trägt denselben Wind wie das Bild seiner Stufe; der Wurf eines Baus steht (an 0)
        if (xfade && !wiegen && (isBark || kind === "foliage" || kind === "foliageTex" || kind === "schatten"))
            this._baumWindStoff(mat, kind, baum);
        if (kind === "foliage" || kind === "foliageTex") this._laubLichtStoff(mat, kind === "foliageTex");
        return mat;
    }
    // DAS WURF-RECHT EINES GELIEFERTEN TEILS (der EINE Leser: `_foundryBuildMesh`; gate:regler-wirkt liest ihn aus der
    // Quelle). Die Fell-Schalen werfen keinen Schatten (die Haut darunter wirft ihn — sechs Schalen wären sechs Ränder).
    // Eine LICHTQUELLE wirft nie (Seh-Klasse glut, vom Gesetzbuch gestempelt: Glutbett und Flamme der Feuerstelle, das
    // Herdfeuer, die Leucht-Linien der Tore) — dieselbe Regel wie `_archTeilLeuchtet` für die Wirts-Teile. Ein
    // DURCHSICHTIGER Stoff (Scheibe, Fenster, Brunnen-Wasser; Deckkraft < 1 aus dem Gesetzbuch) wirft auch keinen: das
    // Licht geht durch ihn, und r184 zieht einen doppelseitig-durchsichtigen Werfer im Schattenpass zweimal (der
    // Schatten-Stoff trägt kein forceSinglePass) — gemessen am GT k0 9 -> 7 Befehle, am Brunnen 2 -> 1 (Integration W5).
    static _teilWirft(m) {
        return (
            m.kind !== "fellSchale" &&
            !(m.mat && m.mat.seh === "glut") &&
            !(m.mat && typeof m.mat.opacity === "number" && m.mat.opacity < 1)
        );
    }
    // DIE KOSTEN-REGEL DES WURFS (1110-9, docs/studio-vertrag.md N5): geworfen wird von der billigeren Stufe — wirft eine
    // gezeigte Stufe über ihre NUR-WURF-Stufe, nimmt der Wirt deren Zwilling nur, wo er WENIGER Dreiecke in die Kaskaden
    // trägt als die werfenden Teile der Stufe selbst; sonst wirft die Stufe selbst. `eigen` und `zwilling` = Dreiecke der
    // werfenden Teile (`_teilWirft`). Gemessen am Regler-Rand: kathedrale orders=9 trägt eine Stufe 3 von 20 308 gegen eine
    // werfende L0 von 16 652 — der Zwilling wäre dort teurer als das, was er ersetzt (gate:regler-wirkt WURF).
    static _wurfVonBilligerer(eigen, zwilling) {
        return zwilling < eigen ? "zwilling" : "selbst";
    }
    // Die Dreiecke einer Geometrie (indiziert oder nicht).
    static _geomDreiecke(g) {
        if (!g || !g.attributes || !g.attributes.position) return 0;
        return Math.floor((g.index ? g.index.count : g.attributes.position.count) / 3);
    }
}
