class AnazhRealm_bild_erst {
    // ===== ATLAS · Bild/erst — Die Erst-Zeichnung · Knoten-Bau in Raten · das Vorwärm-Gesetz · die Absage einer Pipeline =====
    // DER STAND DER ERST-ZEICHNUNG (der EINE Ort in `_configureRenderer`): je Render-Aufruf die Bau-Zeit, die Zähler für
    // Flugschreiber und Hänger-Linse (Knoten-Bauten · verschobene Erst-Zeichnungen · asynchrone Pipelines · bereit
    // gewordene) und je offener Pipeline die Bundles, die ohne ihren Bürger versiegelt wurden.
    _erstZeichnungStand() {
        if (!this._erstZeichnung)
            this._erstZeichnung = {
                aufruf: -1,
                aufrufMs: 0,
                deckel: AnazhRealm.ERST_BAU_MS, // die Bau-Zeit je Render-Aufruf am Stück (eine Bühne unter dem Ladeschirm: LADE_TAKT_MS)
                ladeSchuld: false, // unter dem Ladeschirm wartete ein Bau auf die nächste Aufgabe — das nächste Bild ist fällig
                ladeGuthaben: 0, // so lange hielt die GPU-Leine das Bild der offenen Schuld: so lange baut das fällige (`_knotenRate`)
                bauN: 0, // die Knoten-Bauten der Erst-Zeichnung und ihre Zeit — am Stück wie in Raten (`_knotenRate`), EIN Zähler
                bauMs: 0,
                verschoben: 0,
                einmalOffen: 0, // Renders außerhalb der Welt-Szene, deren Pipeline unter dem Ladeschirm noch im Bau stand (PSO-Vorbau)
                pflichtTakt: null, // der Takt, in dem der Bau in Raten sein Pflicht-Stück ging (`_knotenRate`, `_taktZeit`)
                imFlug: new Map(), // Bau-Schlüssel → der laufende Bau in Raten (`_knotenRate`): EINER je Schlüssel
                pipeAsync: 0,
                bereitN: 0,
                absagenN: 0,
                wartetN: 0, // Draws, die nicht zeichnen konnten (ihre Pipeline stand nicht) — der Zähler jedes Backends
                wartetAuf: null, // die Pipeline des letzten wartenden Draws (die Beweis-Aufnahme nennt sie)
                neubauN: 0,
                neu: [],
                bau: null, // { p, label } — das Geräte-Versprechen des eben angelegten Baus
                offen: new Map(),
                namen: new WeakMap(), // Pipeline → ihr Label `renderPipeline_<Stoff>_<id>`
                abgesagt: new WeakSet(),
                aufnehmen: new WeakSet(), // Bundles, versiegelt ohne einen Bürger — ihr Siegel setzt die Marke (`_renderBundle`)
                gezeichnet: new WeakMap(), // Objekt → die Pässe (Render-Kontext|Pass-Kennung), in denen es schon zeichnete
                vorgebaut: new WeakMap(), // Objekt → die Pässe, in denen das Vorwärm-Gesetz sein Programm ohne Draw baute
                // DAS VORWÄRM-GESETZ (`_vorwaermPass`): die Objekte der Welt-Szene, denen in einer Familie ihrer Pässe das Programm
                // fehlt (Reihe = Round-Robin), je Objekt die fehlenden Familien, die Familie jedes gesehenen Passes (k → auge |
                // wurf), je Pass das Bild seines letzten Gangs, die Zähler (gebaut ohne Draw, die Rufe, verweigert)
                vorwaerm: new Set(),
                vorwaermFehlt: new WeakMap(),
                vorwaermGang: new Map(),
                vorwaermN: 0,
                vorwaermRufe: 0,
                vorwaermVerweigert: 0,
                ohneDraw: new WeakSet(), // Objekte, die ein Pass der Welt ohne Draw fand (die Arena ohne Instanz im Pass, der Gast)
                vorwaermHalt: new Map(), // die leere Senke einer kommenden Stufe → ihre Gruppe: sie hält, bis ihre Arena steht
                vorwaermArten: new Map(), // Art (Streu oder Bau) → die Art, deren Stufen vorwärmen (null: sie stehen) (`_vorwaermStufen`)
                leer: new Set(),
            };
        return this._erstZeichnung;
    }
    // ═══ DAS VORWÄRM-GESETZ (w25-pipeline-vorwaermen — UE5 PSO Precaching: jede Pipeline, die je gezeichnet werden kann, entsteht
    // VOR ihrem ersten Bild) ═══
    // Ein Programm entsteht je Objekt × Familie seiner Pässe: das Auge (der Pass der Spiel-Kamera) und der Wurf (die Kaskaden des
    // Richtlichts: ein Schatten-Stoff je Licht mit dem EINEN Grund, `_schattenGrund` — alle Kaskaden teilen den Knoten-Bau, die
    // Pipeline trägt der Cache). Bis hier entstand es, wo das Objekt ZUERST zeichnete: im Bild, das es zeigte — der eigene Leib
    // beim ersten Wechsel auf Third (GTX vorher 53b2fc7a, Gehen: „haupt spieler" 513 ms), der Wagen, als die Kaskade ihn traf
    // („k0 arena f:gt:L0" 100 ms) oder die Kamera hinter ihm stand („haupt arena leer:f:gt:L0" 283 ms in der Fahrt Third). Jetzt:
    //   WAS — die Schlüssel kommender Stufen kennt die Erst-Zeichnung selbst, keine Liste von Hand: jedes Objekt, das in einer
    //   Familie zeichnete (oder ohne Draw ankam: die Arena ohne Instanz im Pass, der Gast der Bedienung, die geborene Arena),
    //   wartet in jeder anderen, in die es gehört (`_vorwaermGehoert`: das Auge über die Ebenen samt der Ego-Maske `_maskeVorEgo`,
    //   der Wurf über `castShadow` und die Wurf-Ebene) — dazu die kommende Gestalt der Hotbar als Arena ihrer Teile
    //   (`_vorwaermStufen`): Art × Stufe × Stoff, wie die Welt sie setzt.
    //   WO — im ersten Pass seiner Familie je Bild (`_vorwaermPass`, nach dem Opaken, nie in einer Bündel-Aufnahme), durch die
    //   Render-Funktion des Passes (der Schatten-Stoff des Wurfs wie im Bild), ohne Zug (`onBeforeRender` ruht: kein Auftrag,
    //   keine Wahl) und ohne Draw — die Erst-Zeichnung baut wie jede Erst-Zeichnung (`_knotenRate`, die Pipeline asynchron).
    //   WANN — `_vorwaermZeit`: nie unter dem Ladeschirm (die Ankunft trägt nichts davon), nie unter kienspan (CPU-Raster), im
    //   ruhenden Loop ganz (die Werkbank, das Umstellen), im Spiel im LEERLAUF: die Eingabe ruht, die GPU-Leine ist lose und
    //   das Auge steht (`_augeRuht`) — kein Bild einer Bewegung trägt einen Vorbau.
    // Gemessen (gpu-probe, kalter Boot, Genesis: Gehen · Fahrt Ego · Fahrt Third, Knoten-Bauten im Fenster): Radeon main 0ad23b8a →
    // 2b2734e0 Fahrt Third 12 (536 ms) → 0, Fahrt Ego max-Schritt 38,3 → 22,9 ms, die Arena des gesetzten GT baut nicht mehr im Bild;
    // GTX 001597fe → ac1ccd56 Gehen 8 (872 ms) → 5 (276 ms), Third 8 (468 ms) → 1 (11 ms); die Ankunft unverändert (Radeon 13,1 →
    // 11,9 s, GTX 17,8 → 17,5–18,6 s). DER PROGRAMM-KATALOG (w26, Atlas §3) weitet es: der Punkt des Feuers ist eine Familie, die
    // Bühne der Karte wärmt je Form ihrer Stufe vor (`_karteBuehneVorwaermen`), die kommenden Stufen gelten je Art (nie je Region),
    // und was am Gerät vorbei zeichnet oder rechnet, steht im Katalog der Roh-Programme (`_rohKatalog`). Ein Leerlauf, der nicht
    // reicht, lässt den Rest der Reihe dem ersten Bild.
    // Ein Objekt, das seine Pässe nie erreicht (die Render-Funktion des Wurfs übergeht es), fällt nach VORWAERM_VERSUCHE Rufen
    // ohne Antwort aus der Familie (`vorwaermVerweigert`, laut im Flugschreiber); eines, das die Szene verließ, fällt still.
    // Die Familie eines Passes der Welt-Szene: der Wurf (ein Schatten-Stoff über einer Ortho-Kamera: die Kaskaden), der Punkt (ein
    // Schatten-Stoff über der 90°-Kamera einer Würfel-Seite: der Wurf des Feuers, `_lichtWurf` — w26: sein Stoff misst die Weite
    // statt der Tiefe, ein eigenes Programm je Werfer; Radeon vorher „Point Light Shadow - Face 1 bauSatz" 7,5 ms im Gehen), das
    // Auge (die Spiel-Kamera in das Ziel des Szenen-Passes der Post-Kette — ohne Kette auf den Schirm); jeder andere Pass (ein
    // Spiegel, eine Tiefen-Probe) baut nichts vor und zählt nichts
    _vorwaermFamilie(scene, camera) {
        const st = this.state;
        if (scene !== st.scene) return null;
        const u = scene.overrideMaterial;
        if (u)
            return u.isShadowPassMaterial === true ? (camera.isOrthographicCamera === true ? "wurf" : "punkt") : null;
        if (camera !== st.camera) return null;
        const sp = st.scenePass;
        return !sp || st.postProcessingFailed || st.renderer.getRenderTarget() === sp.renderTarget ? "auge" : null;
    }
    // Gehört `o` in die Familie? ohne Kamera die Regel der Familie, mit ihr die Ebenen ihres Passes
    _vorwaermGehoert(o, fam, camera) {
        if (fam === "auge") {
            const m = (o.layers.mask | (o.userData._maskeVorEgo | 0)) >>> 0;
            return camera ? (m & camera.layers.mask) !== 0 : (m & 1) !== 0;
        }
        return o.castShadow === true && (!camera || (o.layers.mask & camera.layers.mask) !== 0);
    }
    // Ein Objekt tritt ins Gesetz: seine fehlenden Familien (eine, in der es schon steht, fehlt nie)
    _vorwaermMerken(o) {
        if (!o || !o.isMesh) return;
        const E = this._erstZeichnungStand();
        let f = E.vorwaermFehlt.get(o);
        if (f === undefined) {
            f = new Set();
            for (const fam of AnazhRealm.VORWAERM_FAMILIEN) if (this._vorwaermGehoert(o, fam, null)) f.add(fam);
            const p = E.gezeichnet.get(o);
            if (p) for (const k of p) f.delete(E.vorwaermGang.has(k) ? E.vorwaermGang.get(k).fam : null);
            E.vorwaermFehlt.set(o, f);
        }
        if (f.size) E.vorwaerm.add(o);
        // eine geborene Arena nennt ihre Art: deren übrige Stufen wärmen vor (`_vorwaermStufen`, im Leerlauf) — EINMAL je Art, in
        // der Region der ersten Arena: das Programm einer Stufe kennt keine Region (Stoff × Form × Pass), die Hüllen der nächsten
        // Region bauten nichts Neues (Gebot 7: die Kosten folgen dem, was fehlt, nie der Welt — bis w26 je Art × Region, jede neue
        // Region der Fahrt legte ihre Hüllen an, und der erste Leerlauf danach legte sie alle zugleich)
        const g0 = o.isGeometrieArena === true && o.glieder[0];
        const art = g0 && AnazhRealm._vorwaermArtVon(g0.userData.archInstanceKey);
        if (art) {
            const k = AnazhRealm._vorwaermArtSchluessel(art);
            if (!E.vorwaermArten.has(k)) E.vorwaermArten.set(k, art);
        }
    }
    // In einer Familie steht es (gezeichnet oder ohne Draw gebaut); `neu` = die erste Zeichnung: die übrigen wärmen vor
    _vorwaermFertig(o, scene, camera, neu = false) {
        const E = this._erstZeichnung;
        const fam = this._vorwaermFamilie(scene, camera);
        if (!E || fam === null) return;
        if (neu) this._vorwaermMerken(o);
        const f = E.vorwaermFehlt.get(o);
        if (f && f.delete(fam) && this._vorwaermObjekt === o) {
            E.vorwaermN++;
            this._vorwaermErgebnis = "gebaut";
        }
        if (f && f.size === 0) this._vorwaermFrei(o);
        else if (f && !AnazhRealm.VORWAERM_HALT.some((h) => f.has(h))) this._vorwaermFrei(o, false);
    }
    // Es steht in jeder Familie (oder fällt aus dem Gesetz): es verlässt die Reihe — die Hüllen der kommenden Stufen
    // (`_vorwaermStufen`) hielten bis hier, jetzt räumt der Leer-Chokepoint sie (`_archGroupLeerDispose`); `ganz` false: es steht in
    // jeder Familie, die hält (VORWAERM_HALT — der Punkt wirft nur in der Nacht am Feuer: seine Hüllen hielten sonst den Tag über),
    // und wartet in der Reihe auf den Rest
    _vorwaermFrei(o, ganz = true) {
        const E = this._erstZeichnung;
        if (ganz) E.vorwaerm.delete(o);
        for (const m of o.glieder || [])
            if (E.vorwaermHalt.has(m)) (this._archGroupLeerDispose(E.vorwaermHalt.get(m)), E.vorwaermHalt.delete(m));
    }
    // DIE ZEIT DES VORWÄRMENS (das WANN oben)
    _vorwaermZeit() {
        const st = this.state;
        const ruht = this._loopRuht();
        return AnazhRealm._vorwaermUrteil(
            st._holzProfil,
            !!st._weltbildDa,
            this._ladeTakt(),
            ruht,
            !ruht && this._eingabeRuht(),
            !ruht && this._gpuLeineStraff(),
            !ruht && this._augeRuht()
        );
    }
    // STEHT DAS AUGE? Die Spiel-Kamera legte seit dem letzten Bild weniger als VORWAERM_RUHE_MS zurück (je Bild einmal gemessen):
    // wer geht, fährt oder fällt, zeichnet ein Bild der Bewegung — dort baut kein Vorbau
    _augeRuht() {
        const cam = this.state.camera;
        const N = this.state.renderer && this.state.renderer._nodes;
        if (!cam || !N) return false;
        const bild = N.nodeFrame.frameId;
        const R = this._augeRuhe || (this._augeRuhe = { bild: -1, x: NaN, y: 0, z: 0, t: 0, ruht: false });
        if (R.bild === bild) return R.ruht;
        const p = cam.getWorldPosition(this._augeRuheV || (this._augeRuheV = new THREE.Vector3()));
        const t = performance.now();
        const dt = Math.max(1, t - R.t) / 1000;
        R.ruht = Math.hypot(p.x - R.x, p.y - R.y, p.z - R.z) / dt < AnazhRealm.VORWAERM_RUHE_MS;
        [R.bild, R.x, R.y, R.z, R.t] = [bild, p.x, p.y, p.z, t];
        return R.ruht;
    }
    // DER GANG DES GESETZES IM PASS (der Haken an r184 `_renderObjects`, `_configureRenderer`): EINMAL je Pass und Bild, im ersten
    // Pass jeder Familie, bis zur EINEN Frist der Bau-Arbeit (`_bauFrist`), höchstens VORWAERM_JE_PASS Objekte geprüft (Gebot 7:
    // die Kosten folgen dem, was fehlt, nie der Welt) — wer geprüft wurde und noch fehlt, geht ans Ende der Reihe.
    _vorwaermPass(rend, camera, scene, lightsNode, passId) {
        const E = this._erstZeichnung;
        if (!E || rend._currentRenderBundle !== null) return;
        const fam = this._vorwaermFamilie(scene, camera);
        if (fam === null) return;
        const ctx = rend._currentRenderContext;
        const k = passId == null ? ctx.id : ctx.id + "|" + passId;
        const bild = rend._nodes.nodeFrame.frameId;
        const g = E.vorwaermGang.get(k);
        if (g && g.bild === bild) return;
        E.vorwaermGang.set(k, { bild, fam });
        // der erste Pass der Familie in diesem Bild (die Kaskaden teilen den Bau: der erste trägt ihn)
        const F = this._vorwaermBild || (this._vorwaermBild = { bild: -1, fam: new Set() });
        if (F.bild !== bild) [F.bild, F.fam] = [bild, new Set()];
        if (F.fam.has(fam)) return;
        F.fam.add(fam);
        if (E.vorwaerm.size === 0 || !this._vorwaermZeit()) return;
        const frist = this._bauFrist("vorwaermen", true);
        const fn = rend._currentRenderObjectFunction;
        const clip = ctx.clippingContext;
        // geprüft zählt nur, wer in diese Familie gehört (sonst verhungerte die zweite hinter der ersten); der Gang endet nach
        // einer Runde über die Reihe
        let [n, runde] = [0, E.vorwaerm.size];
        for (const o of E.vorwaerm) {
            if (n >= AnazhRealm.VORWAERM_JE_PASS || runde-- <= 0 || performance.now() >= frist) break;
            const f = E.vorwaermFehlt.get(o);
            let w = o;
            while (w.parent) w = w.parent;
            if (!f || f.size === 0 || w !== scene) {
                this._vorwaermFrei(o);
                continue;
            }
            if (!f.has(fam)) continue;
            n++;
            E.vorwaerm.delete(o);
            E.vorwaerm.add(o); // ans Ende der Reihe
            if (!this._vorwaermGehoert(o, fam, camera)) {
                f.delete(fam);
                continue;
            }
            // die Form der Arena steht noch nicht (ihr Lager baut im Takt): sie wartet
            if (o.isGeometrieArena === true && o.geometry.index === null) continue;
            this._vorwaermRuf(rend, fn, o, scene, camera, lightsNode, clip, passId);
            if (this._vorwaermErgebnis === null || this._vorwaermErgebnis === "gerufen") {
                // die Render-Funktion des Passes übergab es nie der Erst-Zeichnung (oder sie baute nichts): nach
                // VORWAERM_VERSUCHE Rufen fällt die Familie — laut gezählt
                const v = (o.__vorwaermVersuch = (o.__vorwaermVersuch | 0) + 1);
                if (v >= AnazhRealm.VORWAERM_VERSUCHE) {
                    f.delete(fam);
                    E.vorwaermVerweigert++;
                }
            }
            if (f.size === 0) this._vorwaermFrei(o);
        }
    }
    // EIN RUF: das Objekt geht durch die Render-Funktion seines Passes, ohne Zug (sein `onBeforeRender` und `onBeforeShadow`
    // schrieben Aufträge und Wahl eines Bilds, das es nicht zeichnet) — die Erst-Zeichnung erkennt es (`_vorwaermObjekt`) und baut
    // ohne Draw; ein Wurf meldet sich laut, das Objekt fällt aus dem Gesetz
    _vorwaermRuf(rend, fn, o, scene, camera, lightsNode, clip, passId) {
        const E = this._erstZeichnung;
        const LEER = AnazhRealm._vorwaermLeer || (AnazhRealm._vorwaermLeer = () => {});
        const ZUG = ["onBeforeRender", "onAfterRender", "onBeforeShadow", "onAfterShadow"];
        const eigen = ZUG.map((n) => (Object.prototype.hasOwnProperty.call(o, n) ? o[n] : undefined));
        for (const n of ZUG) o[n] = LEER;
        [this._vorwaermObjekt, this._vorwaermErgebnis] = [o, null];
        E.vorwaermRufe++;
        try {
            const m = o.material;
            if (Array.isArray(m)) {
                for (const gr of o.geometry.groups) {
                    const s = m[gr.materialIndex];
                    if (s && s.visible !== false)
                        fn.call(rend, o, scene, camera, o.geometry, s, gr, lightsNode, clip, passId);
                }
            } else if (m && m.visible !== false)
                fn.call(rend, o, scene, camera, o.geometry, m, null, lightsNode, clip, passId);
        } catch (e) {
            this._vorwaermFrei(o);
            this._bruchMelden(`VORWÄRMEN: ${this._taeterKlasse(o)} warf im Pass (${(e && e.message) || e})`);
        } finally {
            this._vorwaermObjekt = null;
            ZUG.forEach((n, i) => (eigen[i] === undefined ? delete o[n] : (o[n] = eigen[i])));
        }
    }
    // DIE KOMMENDEN STUFEN (Art × Stufe × Stoff, wie die Welt sie setzt — keine Liste von Hand): steht eine Art in einer Stufe in
    // der Welt (ihre Arena wird geboren, `_vorwaermMerken`) oder liegt sie in der Hotbar (`_vorwaermArten`: gesetzt zeichnet sie
    // als Arena ihrer Teile, nie als der Geist der Auswahl), wartet jede ihrer Stufen (VORWAERM_STUFEN, die Foundry serviert die
    // deklarierte, `_foundryServierStufe`) auf ihre Gruppen — sie entstehen leer (`_vorwaermStufen`) in der Form, in der die Welt
    // sie setzt: die Streu regional (`fscatter:<art>:<gestalt>:<stufe>`, die Region der Arena, die sie rief), der gesetzte Bau
    // global (sein Studio-Schlüssel); ihre Arenen treten ins Gesetz (`_arenaKommt`), die leeren Hüllen halten, bis ihre Arena in
    // jeder Familie steht (`vorwaermHalt` → `_vorwaermFrei`). Knoten-Bau und Pipeline bleiben ihrem Schlüssel
    // (`_renderObjekteLoesen`): die Blume, die in L0 tritt, und der gesetzte Wagen finden sie vor. Ein Baum wächst aus dem Wald
    // (seine Stufen und seine Karte trägt der Stufen-Vorlauf). GTX vorher (53b2fc7a), im Fenster gebaut: „haupt arena
    // fscatter:blume:L2" 294 ms im Gehen, „haupt arena f:gt:L0" 244 ms und „fscatter:blume:L0" 87 ms in der ersten Fahrt.
    // Die Art einer Gruppe aus ihrem Schlüssel (`_archInstanceGroupFor`, gelesen wie `_instanzKlasse`); null: keine Studio-Art
    static _vorwaermArtSchluessel(art) {
        return (art.streu ? "streu:" : "bau:") + art.preset;
    }
    static _vorwaermArtVon(key) {
        const s = String(key);
        const st = /^fscatter:([^:#]+):[^:#]+:\d#[^@]*(?:@(.+))?$/.exec(s);
        if (st) return { preset: st[1], streu: true, region: st[2] == null ? null : st[2] };
        const f = /^f:([^|:]+)\|/.exec(s);
        return f ? { preset: f[1], streu: false, region: null } : null;
    }
    // die gemerkten Arten im Leerlauf (`_vorbauBedienung`): je Takt jede, deren Stufen noch nicht stehen — dazu die Hotbar: was
    // sie setzen kann, zeichnet gesetzt als Arena seiner Teile, nie als der Geist der Auswahl (`_geistVorbau`, ein Mesh)
    _vorwaermArten() {
        const st = this.state;
        const A = this._erstZeichnungStand().vorwaermArten;
        for (const name of Array.isArray(st.hotbar) ? st.hotbar : []) {
            const bp = name && st.blueprints && st.blueprints[name];
            const preset = bp && this._isPlaceableBlueprint(bp) ? this._foundryPresetForEntry({ type: name }) : null;
            const art = preset && { preset, streu: false, region: null };
            if (art && !A.has(AnazhRealm._vorwaermArtSchluessel(art)))
                A.set(AnazhRealm._vorwaermArtSchluessel(art), art);
        }
        for (const [k, art] of A) if (this._vorwaermStufen(art)) A.set(k, null);
    }
    // die Stufen EINER Art als leere Gruppen; true: jede steht (oder die Art hat keine Studio-Gestalt, ist ein Baum)
    _vorwaermStufen(art) {
        const R = this.state.renderer;
        if (!art || !R || R._isHeadlessNull || this.state._holzProfil === "kienspan") return true; // dort wärmt nichts vor
        const { preset, streu, region } = art;
        if (!this._foundryEnabled() || this._foundryPresetIsTree(preset)) return true;
        // die Gestalt des Samens 0 (ihre Stoffe teilen das Programm jeder Gestalt der Art, `_graphTeilen`); der Rang in der
        // Foundry-Schlange ist der Ort des Spielers (`wo`) — als ortloser Vorrat stand sie hinter jedem Auftrag der Welt (lokal:
        // die L0 des GT nach dem Stand der Welt noch nicht geliefert)
        const pm = this.state.playerMesh;
        const e = { seed: 0, wo: pm ? pm.position : undefined };
        const E = this._erstZeichnungStand();
        const weiss = this._vorwaermWeiss || (this._vorwaermWeiss = new THREE.Color(1, 1, 1)); // der neutrale Tint des Platzes
        let steht = true;
        for (const lod of AnazhRealm.VORWAERM_STUFEN) {
            const flat = this._foundryFlattenFor(e, preset, lod);
            if (flat === null) steht = false;
            if (!flat || !Array.isArray(flat.leaves)) continue;
            const name = streu ? `fscatter:${preset}:${this._foundryGestaltFor(e, preset)}:${flat.lod}` : "";
            flat.leaves.forEach((leaf, i) => {
                const studio = !streu && typeof leaf.leafKey === "string" && /^(f|fimp):/.test(leaf.leafKey);
                const g = this._archInstanceGroupFor(name, studio ? leaf.leafKey : i, leaf, streu ? region : null);
                // die Farbe des Platzes, wie die Welt sie schreibt (`_archSlotColor` in `_archInstanceAdd`): sie trägt die Instanz-
                // Farbe der Arena (`instanzFarbe`) und mit ihr das Programm — ohne sie baute der gesetzte GT seine Arena neu
                // (GTX ac1ccd56: „haupt arena f:gt:L0" 174 ms nach vorgewärmter Hülle; die Gestalten 1 und 6 tragen gleiche Stoffe)
                const farbe = !g.mesh.instanceColor && this._archSlotColor(leaf, weiss);
                if (farbe) g.mesh.setColorAt(0, farbe);
                if ((g.liveCount || 0) === 0 && !E.vorwaermHalt.has(g.mesh)) E.vorwaermHalt.set(g.mesh, g.key);
            });
        }
        return steht;
    }
    // DAS URTEIL DER ZEIT (rein, die Linse gate:kamera-treue (k) fährt es): baut das Vorwärm-Gesetz jetzt? Headless kalt 01.11.: ein
    // Vorbau unter dem Ladeschirm hielt 169 ms Haupt-Faden vor dem Bild (darum nie dort); GTX vorher (53b2fc7a): der Vorbau in der
    // Fahrt hielt Bilder (darum nie mit bewegtem Auge).
    static _vorwaermUrteil(holz, bild, lade, ruht, eingabe, leine, auge) {
        if (holz === "kienspan" || !bild || lade) return false;
        return !!ruht || (!!eingabe && !leine && !!auge);
    }
    // DER KNOTEN-BAU IN RATEN (profiband.K2): r184 baut den Knoten-Graphen eines Render-Objekts am Stück (`NodeBuilder.build`:
    // prebuild, je Stufe setup · analyze · generate jede Shader-Stufe fragment · vertex · compute, buildCode) — 60–100 ms je
    // Stoff (Radeon, Genesis Ego im Stand: das Vorwärmen der Leiber, 11 Bauten Σ 825 ms, je Bild einer, Belegung p95 113,6 ms).
    // Hier geht derselbe Gang Schritt für Schritt (eine Shader-Stufe einer Stufe) im Pass des Render-Objekts — der Bau liest MRT,
    // Ziel und contextNode des Renderers, die nur dort gelten (darum nie buildAsync daneben) —, bis zur EINEN Frist der Bau-Arbeit
    // (`_bauFrist`), auch IM Schritt: zwischen zwei Fluss-Knoten einer Shader-Stufe fragt er sie (der erste Knoten immer; `R.k` ist
    // der nächste, der Vendor setzt je Knoten nur Bau- und Shader-Stufe — headless Erst-Boot: eine Stufe trug bis 90 ms am Stück);
    // der fertige Bau tritt wie im Vendor in den Bau-Cache, ein Zwilling gleichen
    // Schlüssels übernimmt ihn, ein werfender Schritt meldet sich laut und der Vendor baut am Stück. true = der Bau steht.
    // EIN BAU JE SCHLÜSSEL IM FLUG (w4-knoten-wurzel): der laufende Bau eines Schlüssels steht in `E.imFlug`, jedes Render-Objekt
    // desselben Schlüssels geht DENSELBEN Bau weiter — bis hier legte jedes, das im selben Bild kam, seinen eigenen an (die Teile
    // eines Geists, die Kaskaden eines Satzes: Radeon kalt V18.546.159 im Vorbau 48 Zwillings-Bauten, bis neun je Schlüssel).
    _knotenRate(N, ro, E) {
        const d = N.get(ro);
        // DIE FRIST IST DIE EINE DER BAU-ARBEIT (`_bauFrist`, w19-gang-hitch): im Spiel geteilt mit jedem Bauer des Takts (Strom,
        // Planer, Pflanzung, Hüllen, Karte …), unter dem Ladeschirm die der Zeichnung (`_ladeFrist(true)`: die ganze Frist des
        // Lade-Frames samt dem Guthaben der gehaltenen Leine). Bis hier trug der Bau in Raten eine zweite Uhr daneben (`rateFrist`:
        // ERST_BAU_MS ab seinem ersten Schritt, unter dem Ladeschirm das Guthaben).
        // DIE BAU-ZEIT FOLGT DER WANDUHR, NIE DER BILDRATE (w19-ankunft-takt; das Zeit-Budget je Bild der Precache-Lader, Unreals
        // PSO-Precache `BatchTime`, hier wie der Ingest mit `INGEST_RATE_PER_S`): hielt die GPU-Leine das fällige Bild, während die
        // Schuld der Erst-Zeichnung offen war (`ladeGuthaben`, `_ladeBildFaellig`), baut es ab seinem ersten Schritt die gehaltene
        // Zeit, höchstens die Frist EINES Lade-Frames (LADE_TAKT_MS — keine Aufgabe trägt mehr Bau als der Lade-Frame); ohne
        // gespannte Leine bleibt es der Rest der EINEN Frist. Bis hier baute es nur diesen Rest, den die Leser des Takts oft schon
        // verbraucht hatten (bis −127 ms), und das Bild kam nur bei freier Leine: swiftshader, 4 Kerne, CPU ×4 — 11 Lade-Bilder in
        // 15 s, 7 Knoten-Bauten bis zur Messung (main am Stück 27); Boden-Satz und 9 Geometrie-Arenen zeichneten nie, ihre Puffer
        // (Teil-Uploads je 14–118 KB, ~5,5 MB) luden nie hoch: die Erst-Zeichnungs-Wand Teil 1 zählte 0,7 statt > 1 MB (CI z287:
        // 0,2 · 0,2 · 0,7 MB, main 4,8 MB).
        const frist = this._bauFrist("knoten", true);
        const t0 = performance.now();
        // SEIN PFLICHT-STÜCK (w19-gang-hitch, Nacharbeit — jeder Leser der Frist geht mindestens eins): der erste Ruf des Takts baut
        // einen Schritt auch nach der Frist, jeder weitere wartet — bis hier wartete jeder, und ein Takt, dessen Bauer vor dem Bild
        // die Frist leerten, baute keinen Knoten (Wiese, Gehen: 0 von 6 Rufen); die Alterung gibt ihm dazu seinen Vortritt
        if (t0 >= frist && E.pflichtTakt === this._taktZeit) return false;
        E.pflichtTakt = this._taktZeit;
        const key = N.getForRenderCacheKey(ro);
        let s = N.nodeBuilderCache.get(key);
        // ein Bau, den ein Zwilling vollendete, dessen Eintrag mit seinem letzten Leser fiel (`usedTimes`), tritt wieder ein
        if (s === undefined && d.rate && d.rate.s) N.nodeBuilderCache.set(key, (s = d.rate.s));
        const bild = N.nodeFrame.frameId;
        try {
            let R = null;
            if (s !== undefined) E.imFlug.delete(key);
            else if (!(R = d.rate || E.imFlug.get(key))) {
                // ein Bau, den seit KNOTEN_FLUG_BILDER kein Leser weiterging (sein Objekt fiel im Bau), verlässt den Flug
                if (E.imFlug.size >= 32)
                    for (const [k, x] of E.imFlug)
                        if (bild - x.bild > AnazhRealm.KNOTEN_FLUG_BILDER) E.imFlug.delete(k);
                E.imFlug.set(
                    key,
                    (R = { b: N._createNodeBuilder(ro, ro.material), i: -1, k: 0, bild, s: null, ms: 0 })
                );
            }
            if (R) [d.rate, R.bild] = [R, bild];
            const b = R && R.b;
            let arbeit = !!R && R.i < 0 && (b.prebuild(), (R.i = 0), true);
            // DER GANG GEHT BIS ZUR FRIST, NIE EINEN SCHRITT JE AUFRUF (w19-ankunft-takt): bis hier kehrte jeder Aufruf nach EINER
            // Shader-Stufe zurück — ein Bau brauchte mindestens zehn Bilder, gleich wie viel Frist blieb, und unter dem Ladeschirm
            // kommt das Bild nur bei freier GPU-Leine (swiftshader, CPU ×4: je Aufgabe ein Schritt je Objekt, bis zu 13 Bauten zugleich
            // im Flug, kaum einer fertig; 2 Kerne, CPU ×6 mit Guthaben, ohne diesen Gang: 6 Knoten-Bauten, 0,9 MB). Der erste Schritt
            // geht immer (nie verhungert); jeder weitere, solange die EINE Frist trägt (`_bauFrist`), ein Schritt darüber endet wie
            // bisher. Ein begonnener Schritt geht mindestens EINEN Knoten: der Gang der Position (`flowNodeFromShaderStage`) steht am
            // Anfang der Stufe (`R.k` 0) — ein Schritt ohne Knoten ginge ihn beim nächsten Ruf ein zweites Mal.
            const ueber = () => performance.now() >= frist;
            for (const [STUFE, SHADER] = AnazhRealm.KNOTEN_GANG; R && R.i < 9 && !(arbeit && ueber());) {
                const stufe = STUFE[(R.i / 3) | 0];
                const shader = SHADER[R.i % 3];
                b.setBuildStage(stufe);
                if (R.k === 0 && R.i % 3 === 0 && b.context.position && b.context.position.isNode)
                    b.flowNodeFromShaderStage("vertex", b.context.position);
                b.setShaderStage(shader);
                // eine leere Shader-Stufe geht im selben Schritt mit; die volle bis zur Frist, je Knoten gefragt
                const [F, k0] = [b.flowNodes[shader], R.k];
                for (; R.k < F.length && (R.k === k0 || !ueber()); R.k++) {
                    if (stufe === "generate") b.flowNode(F[R.k]);
                    else F[R.k].build(b);
                    arbeit = true;
                }
                if (R.k >= F.length) [R.i, R.k] = [R.i + 1, 0];
            }
            if (arbeit && ueber()) return ((R.ms += performance.now() - t0), false);
            if (R) {
                b.setBuildStage(null);
                b.setShaderStage(null);
                b.buildCode();
                b.buildUpdateNodes();
                N.nodeBuilderCache.set(key, (s = R.s = N._createNodeBuilderState(b)));
                E.imFlug.delete(key);
                // DER FERTIGE BAU ZÄHLT AM EINEN ZÄHLER der Erst-Zeichnung (`bauN`, `bauMs` = Σ seiner Schritte), wie ein Bau am
                // Stück: bis hier zählte der Bau in Raten nur in einem eigenen Paar (`rateN`/`rateMs`, ohne Leser) — seit der Bau
                // unter dem Ladeschirm in Raten geht (w19-ankunft-takt), las der Flugschreiber (`erstBauN`) und die Erst-Zeichnungs-
                // Wand (Konsum im Boot) 0 Knoten-Bauten bei 714 verschobenen (swiftshader, Teil 1)
                E.bauN++;
                E.bauMs += R.ms + performance.now() - t0;
            }
        } catch (e) {
            d.rate = undefined;
            E.imFlug.delete(key);
            this._bruchMelden(`KNOTEN-RATE: ein Schritt warf (${(e && e.message) || e}) — der Vendor baut am Stück`);
            return (N.getForRender(ro), true);
        }
        [d.rate, d.nodeBuilderState] = [undefined, s];
        s.usedTimes++;
        return true;
    }

    // DIE ABSAGE EINER PIPELINE (Welle K): r184 verschluckt die Absage von createRenderPipelineAsync (`catch(e){}`,
    // vendor/three.webgpu.min.js 6:590437), und ein Fehler-Scope sieht asynchrone Fehler nach Spezifikation nie — ein Stoff,
    // dessen Pipeline scheitert, bliebe STILL für immer unsichtbar (der synchrone Bau meldete denselben Fehler laut). Der EINE
    // Abgriff am Gerät (wie der writeBuffer-Abgriff, nach init): das Original-Versprechen geht unverändert an r184 zurück,
    // seine Absage meldet sich als `PIPELINE-ABSAGE <label>: <message>` (das Label nennt den Stoff:
    // `renderPipeline_<Stoff>_<id>`, 6:589557) über den EINEN Melder der GPU-Wache (`_gpuWacheMeldung`: ERROR beim Namen,
    // gezählt in `_gpuWache` — eine Absage ist eine Validierung wie jede andere, Integration V18.535), und die Erst-Zeichnung
    // trägt die Pipeline aus ihrer Warteschlange aus (`_erstWartet` hält das Versprechen ihres Baus). Gerufen wird je Aufruf
    // der Prototyp — Linsen hängen sich dort ein.
    _erstAbsageWache(renderer) {
        const be = renderer.backend;
        const dev = be && be.isWebGPUBackend === true ? be.device : null;
        if (!dev || dev.__anazhAbsage || typeof dev.createRenderPipelineAsync !== "function") return;
        const E = this._erstZeichnungStand();
        const welt = this;
        dev.createRenderPipelineAsync = function (desc) {
            const p = Object.getPrototypeOf(this).createRenderPipelineAsync.call(this, desc);
            const label = (desc && desc.label) || "renderPipeline_(ohne Label)";
            E.bau = { p, label };
            p.catch((e) => {
                E.absagenN++;
                welt._gpuWacheMeldung("pipeline", `PIPELINE-ABSAGE ${label}: ${(e && e.message) || e}`);
            });
            return p;
        };
        dev.__anazhAbsage = true;
    }

    // DER KATALOG DER ROH-PROGRAMME (w26-programm-katalog, Atlas §3 — UE PSO-Precache: kein Programm entsteht am Zug): was die Welt
    // am Gerät vorbei zeichnet oder rechnet (`ROH_PROGRAMME`: das Tiefen-Abbild des Hauptbilds, die Wahl der GPU, der Rechner der
    // Karten-Ablage), entsteht beim Anschluss des Geräts asynchron, Sekunden vor seinem ersten Leser. Bis hier baute der erste Lauf es synchron
    // (`createRenderPipeline`/`createComputePipeline`) — das Tiefen-Abbild im ersten Bild, das Wasser zeigte: der GPU-Prozess
    // übersetzte vor dem nächsten Bild (gemeldet in w25-pipeline-vorwaermen). Eine Absage meldet sich laut wie jede Pipeline.
    _rohKatalog(renderer) {
        const be = renderer.backend;
        const dev = be && be.isWebGPUBackend === true ? be.device : null;
        if (!dev || (this._rohProgramme && this._rohProgramme.dev === dev)) return;
        const K = (this._rohProgramme = { dev, steht: new Map() });
        for (const [name, bau] of Object.entries(AnazhRealm.ROH_PROGRAMME))
            bau(dev, name).then(
                (x) => K.steht.set(name, x),
                (e) => this._gpuWacheMeldung("pipeline", `PIPELINE-ABSAGE ${name}: ${(e && e.message) || e}`)
            );
    }
    // Das Programm `name` aus dem Katalog — null, solange es entsteht: sein Pass ruht (vor dem Weltbild wartet er wie jede
    // Erst-Zeichnung, danach ist es die Lücke des Katalogs, ROT beim Namen)
    _rohProgramm(name) {
        const K = this._rohProgramme;
        const x = (K && K.steht.get(name)) || null;
        if (!x && this.state._weltbildDa)
            this._bruchMelden(`KATALOG-LÜCKE ${name}: das Programm stand nicht, als sein Pass kam — der Pass ruht`);
        return x;
    }

    // DER EINMAL-RENDER IM PSO-VORBAU (w16-lade-atem): `fn` zeichnet einen Einmal-Render (eine Tafel, die Umgebung, den Boden des
    // Rückstrahls); true, wenn jede seiner Pipelines stand und er ganz zeichnete. Wartete er auf Pipelines (`einmalOffen`), läuft
    // `fn` erst wieder, wenn jede von ihnen steht (`E.offen` trägt sie bis dahin) — bis hier malte jeder Takt ihn neu, ohne Bild
    // (PMREM samt seiner Filter-Pässe je Takt). `schluessel`: der Render (sein Quad, der PMREM-Generator).
    // NACH DEM BILD GILT DER VORBAU WEITER (w25-ankunft-block): in jedem Takt des laufenden Loops entsteht die Pipeline eines
    // Einmal-Renders asynchron (`_einmalVorbau`) — sein Leser hält den alten Stand, bis sie steht (Spiegel, Horizont-Karte,
    // Tafeln, Umgebung, Rückstrahl). Bis hier baute der erste Lauf eines Passes, der nach dem Bild begann, seine Pipeline synchron
    // im GPU-Prozess: Radeon kalt der Spiegel 0,4 s nach dem Bild (73 k Zeichen WGSL), die Horizont-Karte nach 2,5 s — der rAF
    // stand 1,3–2,2 s bei freiem Haupt-Faden, das Halten der W-Taste kam erst 1,7–2,4 s nach dem Bild.
    _einmalRender(schluessel, fn) {
        const E = this._erstZeichnungStand();
        const W = E.einmalWarte || (E.einmalWarte = new WeakMap());
        const w = W.get(schluessel);
        // außerhalb des Vorbaus (ein Leser außerhalb des Takts, der ruhende Loop) zeichnet er ganz, worauf er auch wartete
        if (!this._einmalVorbau()) {
            W.delete(schluessel);
            fn();
            return true;
        }
        if (w) {
            for (const p of w) if (E.offen.has(p)) return false;
            W.delete(schluessel);
        }
        const vorbau = E.einmalOffen;
        const vorSammel = E.einmalSammel;
        const sammel = (E.einmalSammel = new Set());
        try {
            fn();
        } finally {
            E.einmalSammel = vorSammel || null;
        }
        if (E.einmalOffen === vorbau) return true;
        if (sammel.size) W.set(schluessel, sammel);
        return false;
    }

    // DIE EINE WARTESCHLANGE der Erst-Zeichnung: ein Bürger, der nicht zeichnen kann, meldet sich hier an — auf jedem Weg
    // (Erstbau, Neubau, fremde Szene); `bg` ist das Bundle, dessen Aufnahme ohne ihn versiegelt (null: ein direkter Draw,
    // er versucht es im nächsten Aufruf selbst).
    // (1) Er wartet auf seine PIPELINE (`pipe`): bereit ist sie, sobald r184 die fertige GPU-Pipeline in seinen Zustand
    //     schreibt — `h.pipeline=await d.createRenderPipelineAsync(A)` (vendor/three.webgpu.min.js 6:590389), genau das Feld,
    //     das `isReady` liest (6:221094). Ein Setter an diesem Feld nimmt im SELBEN Moment jedes Bundle neu auf, das ohne
    //     einen ihrer Bürger versiegelt wurde (die Zuweisung läuft nach einem await, nie mitten in einer Aufnahme). Das
    //     Vendor-Versprechen wartet danach noch auf `popErrorScope` (6:590447) — auf der Spielseite > 5 s, auf Windows-
    //     swiftshader nie aufgelöst (gemessen 07.10.: ein Bundle-Bürger mit fertiger Pipeline 120 s ohne Neuaufnahme); an
    //     ihm hängt nichts.
    // (2) Er wartet nur auf seinen KNOTEN-BAU (`pipe` null: der Aufruf hat sein Bau-Budget verbraucht): das Bundle nimmt
    //     nach der laufenden Aufnahme neu auf — r184 versiegelt an ihrem Ende (`u.version=s.version`, 6:413962) und schluckte
    //     eine Marke von mittendrin; die Marke setzt das Siegel selbst (`_renderBundle`, die Draw-Wahrheit), so nimmt auch
    //     das nächste Bild im selben Task neu auf.
    // Eine Pipeline, deren Bau scheitert, meldet sich laut (`_erstAbsageWache`) und fällt aus der Warteschlange; ihr Bürger
    // zählt weiter als wartender Draw — die Beweis-Aufnahme nennt ihn beim Namen und bricht ab. Auch im Bündel: es nimmt nach
    // jeder Aufnahme neu auf wie in (2), statt ohne ihn zu versiegeln und still abzuspielen (mensch.K4, 30.10.: 8 abgesagte
    // Stoffe im Bündel des Leibs — Auge und Kleid fehlten im Bild, die Beweis-Aufnahme stand grün).
    // Der WebGL2-Rückfall kennt keine Bundles, und sein `_completeCompile` ersetzt das Datenobjekt der Pipeline (vendor
    // 6:513930 über Backend.set 6:457928) — ein Setter am alten Objekt feuerte nie, die Schlange wüchse die ganze Sitzung:
    // dort zählt der wartende Draw nur (`wartetN`), er versucht es im nächsten Aufruf selbst.
    _erstWartet(be, pipe, bg) {
        const E = this._erstZeichnung;
        if (!pipe) {
            if (bg !== null) E.aufnehmen.add(bg);
            return;
        }
        E.wartetN++;
        E.wartetAuf = pipe;
        const bau = E.bau;
        E.bau = null;
        if (be.isWebGPUBackend !== true) return;
        if (E.abgesagt.has(pipe)) return this._erstWartet(be, null, bg);
        let bundles = E.offen.get(pipe);
        if (bundles === undefined) {
            const h = be.get(pipe);
            let wert = h.pipeline;
            const warten = (bundles = new Set());
            E.offen.set(pipe, warten);
            if (bau !== null) {
                E.namen.set(pipe, bau.label);
                bau.p.catch(() => {
                    E.abgesagt.add(pipe);
                    E.offen.delete(pipe);
                    for (const b of warten) b.needsUpdate = true;
                });
            }
            Object.defineProperty(h, "pipeline", {
                configurable: true,
                enumerable: true,
                get: () => wert,
                set: (v) => {
                    wert = v;
                    if (v === undefined || v === null) return;
                    Object.defineProperty(h, "pipeline", {
                        value: v,
                        writable: true,
                        configurable: true,
                        enumerable: true,
                    });
                    E.offen.delete(pipe);
                    E.bereitN++;
                    for (const b of warten) b.needsUpdate = true;
                },
            });
        }
        if (bg !== null) bundles.add(bg);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bild_erst]);

// ===== ATLAS · Bild/erst — Außen-Konstanten =====
// DIE ERST-ZEICHNUNG (`_configureRenderer`): je Render-Aufruf der Welt-Szene baut der erste Erst-Bau immer, jeder weitere nur,
// solange der Aufruf unter dieser Zeit (ms) baute — ein Frame trägt so höchstens einen schweren Knoten-Bau je Pass. Im laufenden
// Spiel nach dem Weltbild baut der Knoten-Bau in Raten unter der EINEN Frist der Bau-Arbeit (`_knotenRate` → `_bauFrist`,
// BAU_FRIST_MS; der Gang r184 `NodeBuilder.build`: KNOTEN_GANG).
AnazhRealm.ERST_BAU_MS = 4;
// EIN BAU JE SCHLÜSSEL IM FLUG (`_knotenRate`): so viele Bilder darf ein Bau in Raten ohne Leser stehen, bevor er den Flug
// verlässt (sein Objekt fiel mitten im Bau; ein Leser desselben Schlüssels legt ihn dann neu an)
AnazhRealm.KNOTEN_FLUG_BILDER = 600;
// DAS VORWÄRM-GESETZ (`_vorwaermPass`): die Familien der Pässe (das Auge der Spiel-Kamera, der Wurf der Kaskaden, der Punkt des
// Feuers); so viele Objekte
// prüft ein Pass je Bild höchstens; so viele Rufe ohne Antwort der Erst-Zeichnung, bis eine Familie für ein Objekt fällt; unter
// diesem Tempo des Auges (m/s) steht es — Leerlauf (`_augeRuht`)
AnazhRealm.VORWAERM_FAMILIEN = Object.freeze(["auge", "wurf", "punkt"]);
AnazhRealm.VORWAERM_HALT = Object.freeze(["auge", "wurf"]); // die Familien, auf die die Hüllen kommender Stufen warten
AnazhRealm.VORWAERM_JE_PASS = 48;
AnazhRealm.VORWAERM_VERSUCHE = 3;
AnazhRealm.VORWAERM_RUHE_MS = 0.3;
// die kommenden Stufen jeder Art (`_vorwaermStufen`): die Foundry serviert je Art die deklarierte (`_foundryServierStufe`)
AnazhRealm.VORWAERM_STUFEN = Object.freeze([0, 1, 2]);
// DER KATALOG DER ROH-PROGRAMME (`_rohKatalog`): je Name der Bau seiner Programme am Gerät (asynchron; das WGSL lebt bei seinem
// Pass) — das Versprechen trägt, was der Leser braucht (`_rohProgramm`)
AnazhRealm.ROH_PROGRAMME = Object.freeze({
    "szene:tiefenabbild": (dev, label) => {
        const module = dev.createShaderModule({ label, code: AnazhRealm.TIEFEN_ABBILD_WGSL });
        return dev
            .createRenderPipelineAsync({
                label,
                layout: "auto",
                vertex: { module, entryPoint: "vs" },
                fragment: { module, entryPoint: "fs", targets: [{ format: "r32float" }] },
                primitive: { topology: "triangle-list" },
            })
            .then((p) => ({ p, gruppe: p.getBindGroupLayout(0) }));
    },
    "pass-wahl": (dev, label) => {
        const lay = dev.createBindGroupLayout({
            label,
            entries: ["uniform", "read-only-storage", "read-only-storage", "storage", "storage"].map((type, i) => ({
                binding: i,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type, hasDynamicOffset: i === 1 },
            })),
        });
        const module = dev.createShaderModule({ label, code: AnazhRealm.PASS_WAHL_WGSL });
        const layout = dev.createPipelineLayout({ bindGroupLayouts: [lay] });
        return dev
            .createComputePipelineAsync({ label, layout, compute: { module, entryPoint: "wahl" } })
            .then((p) => ({ p, gruppe: lay }));
    },
    // die GPU-Ablage der Karte (`_karteAblage`): neun Einstiege EINES Moduls an EINER Bindung (nur mit BC, `_impostorAtlasFormat`)
    "karte-rechner": (dev, label) => {
        if (!dev.features.has("texture-compression-bc")) return new Promise(() => {});
        const S = (b, t) => Object.assign({ binding: b, visibility: GPUShaderStage.COMPUTE }, t);
        const puffer = (b) => S(b, { buffer: { type: "storage" } });
        const tex = (b) => S(b, { texture: { sampleType: "float" } });
        const layout = dev.createBindGroupLayout({
            label,
            entries: [
                S(0, { buffer: { type: "uniform", hasDynamicOffset: true } }),
                tex(1),
                tex(2),
                tex(3),
                ...[4, 5, 6, 7, 8, 9, 10].map(puffer),
                S(11, { buffer: { type: "uniform" } }), // der Saum der Karte (`_karteSaumVon`), je Bake
                puffer(12), // die Tiefe je Texel (w4-laub-karte): Summe und Zahl der deckenden je Stufe der Normale
            ],
        });
        const module = dev.createShaderModule({ label, code: AnazhRealm.KARTE_RECHNER_WGSL });
        const pl = dev.createPipelineLayout({ bindGroupLayouts: [layout] });
        const namen = ["stufe0", "summeK", "glaette", "saumK", "grenzeK", "bc1", "normalK", "bc5", "sicht"];
        const bau = (n) =>
            dev.createComputePipelineAsync({ label: "karte-" + n, layout: pl, compute: { module, entryPoint: n } });
        return Promise.all(namen.map(bau)).then((p) => ({
            layout,
            pipes: Object.fromEntries(namen.map((n, i) => [n, p[i]])),
        }));
    },
});
AnazhRealm.KNOTEN_GANG = Object.freeze([
    Object.freeze(["setup", "analyze", "generate"]),
    Object.freeze(["fragment", "vertex", "compute"]),
]);
