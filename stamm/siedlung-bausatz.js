class AnazhRealm_siedlung_bausatz {
    // ===== ATLAS · Siedlung/bausatz — Bau-Satz · Takt · Raten · Slots · Satz-Faden · Block-Kerne =====
    // ═══ DER BAU-SATZ (Welle 6) ═══
    // Die Draw-Einheit des gesetzten Studio-Baus ist sein STOFF, nie seine Gestalt. Befund (echte GPU, Mess-Wiese
    // −900/−850, `werkbank band`): jede Instanz-Gruppe ist EINE Geometrie (`f:<preset>|<gestalt>|<lod>[|ov]:<teil>`), und
    // WebGPU zieht jede einzeln — das griechische Dorf (jedes Haus trägt seine Parzelle als ov-Prägung: eine Gestalt je
    // Haus, count 1) zeichnete je Haus seine drei L2-Stoffe, 11 Häuser = 33 Befehle (die Band-Klasse „karten", die
    // Häuser sind keine Karten), die Felszacken je Gestalt eine Gruppe aus EINEM Stoff: 15 Gestalten = 15 Befehle im
    // Hauptbild, 14 + 5 in den Kaskaden. Der Bau-Satz legt jede Gruppe einer Satz-Art (`BAU_SATZ`, je Studio-Art) als
    // BEREICH in den Pool-Satz ihres Stoffs (die EINE Pool-Mechanik des Chunk-Satzes): ihre Instanzen in Welt-Lage,
    // byte-gleich gerechnet aus Geometrie × Instanz-Matrix (Normale × Normalen-Matrix, Farbe × Instanz-Farbe, die
    // Instanz-Attribute der Fassade je Vertex). Die Gruppe bleibt die Wahrheit ihrer Slots (Belegen · Freigeben ·
    // Raycast · Gnadenfrist); sie zeichnet nie selbst — jede Mutation ihrer Draw-Wahrheit meldet der EINE Chokepoint
    // `_archMeshBundleTouch`, der Bereich legt sich im nächsten Satz-Takt neu (Kosten an der Änderung).
    // Nicht im Satz: was wandert (Tür-Flügel `leaf.tuer`, Fahrzeug), was die Dither-Blende je Instanz trägt und
    // oft wiederkehrt (Baum, Strauch), die Karte (der EINE Atlas), die Streu (regional), ein Schatten-Zwilling (er lebt
    // auf seiner eigenen Ebene — im Satz stünde er im Hauptbild).
    // DER WURF-SATZ (S3, das Wurf-Gesetz E1): der Schatten-Zwilling einer Satz-Art (die NUR-WURF-Stufe 3 von Haus und
    // Ausstattung, mit dem EINEN Schatten-Stoff, aDeckt 1) liegt im Satz `bauWurf` seines Stoffs — EIN Befehl je Kaskade für
    // jeden Werfer, nie im Hauptbild (SHADOW_TWIN_LAYER, `_chunkSatzPass` wählt dort nie). Vorher warf jedes Haus mit seiner
    // gezeigten Stufe in die Kaskaden (L0 31 660–101 716 Dreiecke je Haus und Kaskade).
    _bauSatzArt(leaf, regionKey, castShadow) {
        if (regionKey != null || !leaf || leaf.tuer || !leaf.mat) return null;
        const m = typeof leaf.leafKey === "string" ? /^f:([^|]+)\|/.exec(leaf.leafKey) : null;
        if (!m) return null;
        const buch = this._foundry && this._foundry.recipes ? this._foundry.recipes : null;
        const rec = buch ? buch[m[1]] : null;
        const name = rec ? AnazhRealm.BAU_SATZ[rec.kind] : null;
        if (!name) return null;
        const wurf = leaf.shadowTwin === true;
        // DER EINE SATZ-STOFF (K43-2): ein gezeigter Bereich zeichnet im Stoff seiner KLASSE (`_satzStoff`: Art · Seh-Klasse ·
        // Seite · Durchsicht · was der Stoff sonst webt), seine Regler (Rauheit · Metall · Deckkraft · Glut) reisen je Ecke
        // (`aRegler`, `aGlut`, `_bauSatzBlock`). Vorher war die Art die uuid des Studio-Stoffs: jede Glut-Stärke ein Satz.
        const satzMat = wurf ? leaf.mat : this._satzStoff(leaf.mat);
        const art = wurf
            ? "bauWurf|" + leaf.mat.uuid + "|S"
            : name + "|" + satzMat.userData.satzSchluessel + (castShadow ? "|w" : "|-");
        const st = this.state;
        if (!st.satzStoffe) st.satzStoffe = new Map();
        if (!st.satzStoffe.has(art))
            st.satzStoffe.set(
                art,
                wurf
                    ? { name: "bauWurf", mat: leaf.mat, wurf: true, nurWurf: true, attr: AnazhRealm.BAU_WURF_ATTR }
                    : { name, mat: satzMat, wurf: !!castShadow }
            );
        return art;
    }

    // DER SATZ-STOFF EINES STUDIO-STOFFS (K43-2): derselbe Bau des Wirts (`_foundryTreeMaterial`) ohne die Regler, die je
    // Ecke reisen — Rauheit, Metall, Emissiv × Stärke, die Deckkraft (ein durchsichtiger bleibt durchsichtig, die Zahl
    // reist). Was den Stoff sonst trägt (Art · Seh-Klasse · Seite · flach · Umgebung · Gewebe · Leucht-Gesetz · Zeitplan ·
    // Klarlack) bleibt seine Identität. Fail-closed: ein Stoff ohne Studio-Herkunft ist ein Bruch.
    _satzStoff(mat) {
        const u = mat && mat.userData;
        if (!u || typeof u.foundryKind !== "string")
            throw new Error(`_satzStoff: der Stoff ${mat && mat.uuid} trägt keine Studio-Herkunft (foundryKind)`);
        const mp = u.foundryMp ? Object.assign({}, u.foundryMp) : {};
        const durch = typeof mp.opacity === "number" && mp.opacity < 1;
        for (const k of ["roughness", "metalness", "emissive", "emissiveIntensity", "opacity"]) delete mp[k];
        if (durch) mp.opacity = 0.5; // die Marke der Durchsicht — die Deckkraft liest der Stoff aus `aRegler.z`
        mp.satzRegler = true; // die Marke des Satz-Stoffs (kein Regler, kein Teil der Stoff-Identität `budgetStoff`)
        return this._foundryTreeMaterial(u.foundryKind, mp, false, null);
    }

    // Die Regler eines Bereichs je Ecke (K43-2): Rauheit · Metall · Deckkraft und Emissiv × Glut-Stärke aus dem Studio-Stoff
    // seiner Gruppe — dieselbe Lesung (`budgetRegler`), mit der der Wirt den Stoff sonst baut.
    static _satzRegler(mat) {
        const u = (mat && mat.userData) || {};
        const R = globalThis.__phytoCore.budgetRegler(u.foundryKind, u.foundryMp || null);
        const e = R.em ? [R.em[0] * R.emI, R.em[1] * R.emI, R.em[2] * R.emI] : [0, 0, 0];
        return { regler: [R.r, R.mt, R.op], glut: e };
    }

    // Die Marke einer geänderten Satz-Gruppe (der Takt legt ihren Bereich neu oder nimmt ihn heraus).
    _bauSatzMarke(key, art) {
        const st = this.state;
        (st.bauSatzSchmutzig || (st.bauSatzSchmutzig = new Map())).set(key, art);
    }

    // Je Render vor dem Index-Takt des Satzes: jede markierte Gruppe legt ihren Bereich (lebt sie) oder verlässt den Satz
    // (leer, entsorgt). DIE KOSTEN AN DER ÄNDERUNG (stadt-takt, Radeon echt, Messort stadt gehend: `_tickBauSatz` 3,08 ms je
    // Takt ab p95; 2323 Marken an 594 Gruppen in 40 s): vorher legte jede Marke den GANZEN Bereich neu — eine Gruppe mit 48
    // Laternen rechnete bei jedem Belegen und Freigeben alle 48 (101 Takte p50 1,1 ms), und der Stufen-Wechsel eines Hauses
    // legte 36k–108k Ecken in EINEM Takt (24 Takte p50 5,9 ms, bis 27,4). Jetzt legt ein stehender Bereich nur die Slots, deren
    // Stempel (Matrix · Farbe · Instanz-Attribute) sich änderte (`_bauSatzSlots`), und ein großer neuer Bereich tritt in Raten
    // ein (`_bauSatzRate`, je Takt höchstens BAU_SATZ_ECKEN_JE_TAKT Ecken, nah zuerst — Lehre 14); solange einer in Raten
    // tritt, wartet jeder Austritt: der alte Stufen-Bereich geht erst, wenn der neue steht. Bis das erste Weltbild steht,
    // gilt kein Deckel (das Bild wartet auf jedes ganze Haus, `_weltbildSteht`); eine Linse, die den Satz auf die Wahrheit
    // seiner Gruppen legt, ruft ihn mit `deckel` Infinity (jede Rate tritt ein, jeder Austritt geht).
    _tickBauSatz(deckel) {
        const st = this.state;
        const sm = st.bauSatzSchmutzig;
        const raten = st.bauSatzRaten;
        if (!(sm && sm.size > 0) && !(raten && raten.size > 0)) return;
        const groups = st.archInstanceGroups;
        const saetze = st.chunkSaetze;
        let budget = deckel != null ? deckel : st._weltbildDa == null ? Infinity : AnazhRealm.BAU_SATZ_ECKEN_JE_TAKT;
        const gehen = this._bauSatzGehen || (this._bauSatzGehen = []);
        gehen.length = 0;
        const faden = this._bauSatzFadenWarte || (this._bauSatzFadenWarte = []);
        faden.length = 0;
        if (sm) {
            for (const [key, art] of sm) {
                const g = groups ? groups.get(key) : null;
                const lebt = !!g && g.satz === art && (g.liveCount || 0) > 0;
                const r = raten ? raten.get(key) : null;
                if (r) {
                    if (lebt && r.art === art && r.g === g && r.geom === g.geom) continue; // die Rate legt weiter
                    this._bauSatzRateFort(r, true);
                }
                const s = saetze ? saetze.get(art) : null;
                const b = s ? s.bloecke.get(key) : null;
                if (!lebt || (b && b.bau && g.liveCount < b.bau.cnt)) gehen.push(key, art);
                else if (this._bauSatzFadenWartet(g)) faden.push(key, art);
                else budget -= this._bauSatzLege(key, art, g, b, budget);
            }
            sm.clear();
        }
        // wartet ein Slot auf seinen Block aus dem Satz-Faden, wartet seine Gruppe — und wie bei den Raten jeder Austritt
        for (let i = 0; i < faden.length; i += 2) this._bauSatzMarke(faden[i], faden[i + 1]);
        if (raten && raten.size > 0) budget = this._bauSatzRaten(budget);
        const warten = (!!raten && raten.size > 0) || faden.length > 0;
        for (let i = 0; i < gehen.length; i += 2) {
            const key = gehen[i],
                art = gehen[i + 1];
            if (warten) {
                this._bauSatzMarke(key, art);
                continue;
            }
            const g = groups ? groups.get(key) : null;
            if (g && g.satz === art && (g.liveCount || 0) > 0)
                this._bauSatzLege(key, art, g, saetze.get(art).bloecke.get(key), Infinity);
            else this._chunkSatzAus(art, key);
        }
    }

    // Legt den Bereich einer lebenden Gruppe: steht er, nur die geänderten Slots; sonst ganz — über dem Deckel in Raten.
    // Rückgabe: die gelegten Ecken (sie zählen gegen den Deckel des Takts).
    // DER SATZ-FADEN (Spike satz-faden): trägt jeder Slot seinen Block aus dem Faden (`_bauSatzFadenPasst`), kopiert der
    // Takt nur noch (`_bauSatzFadenEin`) — die Kopie zählt nicht gegen den Deckel (er misst die Rechnung, ~0,1 µs je Ecke).
    _bauSatzLege(key, art, g, b, budget) {
        if (b && b.bau && this._bauSatzSlots(b, g)) return b.bau.gelegt;
        const N = g.geom.attributes.position.count * g.liveCount;
        const bau = this._bauSatzStand(g);
        if (this._bauSatzFadenPasst(g, bau, 0, bau.cnt)) {
            this._bauSatzFadenEin(key, art, g, bau);
            return 0;
        }
        if (N > budget && N > AnazhRealm.BAU_SATZ_ECKEN_JE_TAKT) {
            this._bauSatzRateNeu(key, art, g, bau);
            return 0;
        }
        const a = g.mesh.instanceMatrix.array;
        const nb = this._chunkSatzEin(art, key, this._bauSatzBlock(g), this._bauSatzChunk(a));
        nb.bau = bau;
        if (g._satzFaden) this._satzFadenZahl().gerechnet += N;
        return N;
    }

    // Der Chunk eines Bereichs (die Nah-fern-Ordnung des Satzes): der seiner ersten Instanz.
    _bauSatzChunk(im) {
        const span = this._voxelChunkConfig().span;
        return Math.floor(im[12] / span) + "," + Math.floor(im[14] / span);
    }

    // ═══ DER SATZ-FADEN (Spike satz-faden, nur die Häuser der Stufe 2) ═══
    // Befund (OMEN 22.10., GTX, Messort stadt gehend, `takt 20 --wandern bahn`): `_tickBauSatz` Spitze 8,6/9,0 ms je Takt —
    // `_chunkSatzEin › _satzPacke` 3,3/3,1 und `_bauSatzBlock › _satzBlock` 3,0/3,0: der Haupt-Faden rechnete jede Ecke
    // zweimal (Welt-Lage, Vertex-Form). Jetzt bestellt das Setzen eines Hauses der Stufe 2 (`_archInstanceAdd`) beim
    // Satz-Faden je Teil den Block seines Slots — der Bau-Ort ist der Slot-Stempel (`_bauSatzStempelIn`), der Faden rechnet
    // mit dem EINEN Bau-Satz-Kern (phyto-core `satzTeilBloecke`) und antwortet per Transfer; der Takt kopiert ihn, solange
    // der Stempel des Slots gleich blieb (`_bauSatzFadenPasst`). Bis zur Antwort wartet die Gruppe (höchstens
    // BAU_SATZ_FADEN_FRIST_MS, `_bauSatzFadenWartet`), danach rechnet der Haupt-Faden wie zuvor (gezählt: verpasst).
    // Vor dem ersten Weltbild bestellt niemand (die Ankunft wartet auf jedes ganze Haus, `_weltbildSteht`).
    _bauSatzFadenBestellen(flat, slots) {
        const k = flat && flat.koerper;
        const st = this.state;
        if (!k || k.lod !== 2 || st._weltbildDa == null || !st.archInstanceGroups) return;
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[k.preset] : null;
        if (!rec || rec.kind !== "haus" || !f.bootUrl) return;
        const GERECHNET = AnazhRealm.BAU_SATZ_FADEN_GERECHNET;
        const frist = performance.now() + AnazhRealm.BAU_SATZ_FADEN_FRIST_MS;
        const teile = [],
            faeden = [];
        let s = null;
        for (let i = 0; i < flat.leaves.length; i++) {
            const lf = flat.leaves[i],
                ref = slots[i];
            const g = ref ? st.archInstanceGroups.get(ref.key) : null;
            if (!g || !g.satz || lf.shadowTwin || lf.tuer || !Array.isArray(lf.quelle)) continue;
            const sts = st.satzStoffe ? st.satzStoffe.get(g.satz) : null;
            if (!sts || sts.attr) continue; // nur der Bau-Satz (BAU_SATZ_ATTR), nie der Wurf-Satz
            s = s || this._chunkSatz(g.satz);
            const { je } = this._bauSatzJe(g, AnazhRealm.BAU_SATZ_ATTR);
            const stp = new Float32Array(19); // der Bau-Ort: Matrix und Farbe (die Instanz-Skalare `je` füllt der Takt)
            this._bauSatzStempelIn(stp, 0, g, ref.slot, []);
            // die Stufen-Stempel der Vorlage (je Ecke dieselbe Zahl, `_foundryBuildGroup`) reisen als Zahl
            const fest = {};
            for (const [name] of AnazhRealm.BAU_SATZ_ATTR) {
                const a = g.geom.attributes[name];
                if (!GERECHNET.includes(name) && a && a.isInstancedBufferAttribute !== true) fest[name] = a.array[0];
            }
            const R = AnazhRealm._satzRegler(g.mesh.material);
            teile.push({
                q: lf.quelle,
                st: stp,
                aus: je.map((x) => x[0]),
                farbe: !!g.mesh.instanceColor,
                fest,
                regler: R.regler,
                glut: R.glut,
            });
            const fd = { st: stp, wartet: true, da: false, frist, bloecke: null };
            ref.faden = fd;
            faeden.push(fd);
            g._satzFaden = true;
        }
        if (!teile.length) return;
        const sf = this._bauSatzFaden();
        const Z = this._satzFadenZahl();
        Z.bestellt++;
        Z.teile += teile.length;
        const reqId = "s" + sf.seq++;
        sf.pending.set(reqId, (antw) => {
            for (let i = 0; i < faeden.length; i++) {
                const t = antw && antw[i];
                faeden[i].wartet = false;
                faeden[i].da = true;
                if (t && t.attrs) faeden[i].bloecke = t;
                else {
                    faeden[i].fehlt = (t && t.fehlt) || "keine Antwort"; // der Grund des Fadens (die Linse nennt ihn)
                    Z.fehlt++;
                }
            }
        });
        const msg = {
            type: "build-asset",
            reqId,
            presetId: k.preset,
            seed: k.seed,
            lod: k.lod,
            ov: this._foundryGestaltOv(k.preset, k.seed, k.ov) || null,
            platte: k.key,
            nurPlatte: typeof window !== "undefined" && window.__anazhLiveBake === false,
            satz: { attr: s.attr.map((a) => [a.name, a.is, a.form, a.gis]), teile },
        };
        if (sf.bereit) sf.w.postMessage(msg);
        else sf.vor.push(msg);
    }

    // Der Satz-Faden: ein eigener Faden aus DEMSELBEN Boot-Blob (Schale, Platte, Studio), geboren beim ersten Haus nach dem
    // ersten Weltbild — er baut nur, was der Satz bestellt, und hält dessen Vorlagen (die Schale, `satzVorlagen`); keine
    // Bestellung wartet hinter einem Körper-Bau des Werks.
    _bauSatzFaden() {
        const f = this._foundry;
        if (f.satz) return f.satz;
        const w = new Worker(f.bootUrl, { name: "satz" });
        const sf = { w, bereit: false, vor: [], pending: new Map(), seq: 1 };
        w.onerror = (ev) =>
            this._stoffBruch("der Satz-Faden fällt — " + ((ev && ev.message) || "Boot-/Laufzeit-Fehler"));
        w.onmessage = (ev) => {
            const m = ev.data;
            if (!m || typeof m !== "object") return;
            if (m.type === "ready" && m.world === "terrain") {
                sf.bereit = true;
                for (const v of sf.vor) w.postMessage(v);
                sf.vor.length = 0;
            } else this._foundryAntwort(f, m); // der EINE Leser der Studio-Fäden (die Blöcke: `asset-satz`)
        };
        f.satz = sf;
        return sf;
    }

    // Die Zähler des Satz-Fadens (die Linse liest sie): Bestellungen, Teile, kopierte und (für Faden-Gruppen) gerechnete
    // Ecken, verpasste Fristen, Teile ohne Block.
    _satzFadenZahl() {
        return (
            this._satzFadenStand ||
            (this._satzFadenStand = { bestellt: 0, teile: 0, kopiert: 0, gerechnet: 0, verpasst: 0, fehlt: 0 })
        );
    }

    // Wartet ein lebender Slot der Gruppe auf seinen Block? Eine verstrichene Frist gibt ihn dem Haupt-Faden (gezählt).
    _bauSatzFadenWartet(g) {
        let t = 0;
        for (let i = 0, n = g.liveCount | 0; i < n; i++) {
            const fd = g.slotRef[i] && g.slotRef[i].faden;
            if (!fd || !fd.wartet) continue;
            if (!t) t = performance.now();
            if (t < fd.frist) return true;
            fd.wartet = false;
            this._satzFadenZahl().verpasst++;
        }
        return false;
    }

    // Tragen die Slots [i0, i1) der Gruppe je einen Block aus dem Faden, gerechnet für genau ihren heutigen Bau-Ort (Matrix und
    // Farbe in `bau.stempel`)? Jedes Satz-Attribut ohne Block ist ein Instanz-Skalar des Slots (`je`, Breite 1, ungepackt).
    _bauSatzFadenPasst(g, bau, i0, i1) {
        if (!g._satzFaden || i1 <= i0) return false;
        const S = bau.stempel,
            K = bau.K,
            iN = bau.geom.index ? bau.geom.index.array.length : -1;
        for (let j = i0; j < i1; j++) {
            const fd = g.slotRef[j] && g.slotRef[j].faden;
            const bl = fd && fd.bloecke;
            if (!bl || bl.n !== bau.n || bl.index.length !== iN) return false;
            for (let c = 0, k = j * K; c < 19; c++, k++) if (fd.st[c] !== S[k]) return false;
        }
        const s = this.state.chunkSaetze.get(g.satz);
        const bl = g.slotRef[i0].faden.bloecke;
        for (const { name, gis, form } of s.attr)
            if (!bl.attrs[name] && !(gis === 1 && !form && bau.je.some((x) => x[0] === name && x[1] === 1)))
                return false;
        return true;
    }

    // Kopiert die Blöcke der Slots [i0, i1) ab `vStart` in den Satz (`set`: dieselbe Array-Art, ein Speicher-Zug); ein
    // Instanz-Skalar des Slots (`je`) füllt seine Ecken mit dem Wert seines heutigen Stempels. Kein Vergleich vor dem
    // Schreiben (K71): ein Bau-Bereich tritt nie am Ort eines stehenden Blocks neu ein — der steht, legt `_bauSatzSlots` die
    // geänderten Slots; elementweise kostete der Vergleich der Float16-Farbe mehr als die Kopie (headless 254 Bereiche
    // 35 ms je Takt).
    _bauSatzFadenSchreib(s, vStart, g, bau, i0, i1) {
        const n = bau.n;
        for (const { name, gis } of s.attr) {
            const ga = s.geom.attributes[name];
            let q = -1;
            if (!g.slotRef[i0].faden.bloecke.attrs[name]) {
                q = 19;
                for (const [nm, is] of bau.je) {
                    if (nm === name) break;
                    q += is;
                }
            }
            for (let j = i0; j < i1; j++) {
                const o = (vStart + (j - i0) * n) * gis;
                if (q < 0) ga.array.set(g.slotRef[j].faden.bloecke.attrs[name], o);
                else ga.array.fill(bau.stempel[j * bau.K + q], o, o + n * gis);
            }
            ga.addUpdateRange(vStart * gis, (i1 - i0) * n * gis);
            ga.needsUpdate = true;
        }
        this._satzFadenZahl().kopiert += (i1 - i0) * n;
    }

    // Der ganze Bereich einer Gruppe aus dem Faden: Lage im Pool, die Blöcke kopiert, der Index aus den Blöcken, dann Bürger
    // (Zellen, Hüllen) — wie die letzte Rate (`_bauSatzRate`), der Block flüchtig mit seiner Quelle (die Linse rechnet nach).
    _bauSatzFadenEin(key, art, g, bau) {
        const s = this._chunkSatz(art);
        if (s.bloecke.has(key)) this._chunkSatzAus(art, key);
        const n = bau.n,
            cnt = bau.cnt,
            N = n * cnt;
        const vStart = this._chunkSatzVAlloc(s, N);
        this._bauSatzFadenSchreib(s, vStart, g, bau, 0, cnt);
        const B = this._satzBlockIndex(g.geom, cnt, (i) => g.slotRef[i].faden.bloecke.index);
        B.attributes = {};
        for (const { name, is } of s.attr) B.attributes[name] = { array: null, itemSize: is, count: N };
        const im = g.mesh.instanceMatrix.array;
        const ic = g.mesh.instanceColor ? g.mesh.instanceColor.array : null;
        B.quelle = [g.geom, im, ic, cnt, AnazhRealm.BAU_SATZ_ATTR, key, AnazhRealm._satzRegler(g.mesh.material)];
        this._chunkSatzBuerger(s, key, B, vStart, N, this._bauSatzChunk(im)).bau = bau;
    }

    // Der Stand eines Bau-Bereichs (`b.bau`): seine Vorlage, sein Stoff, seine Instanzen und je Slot der STEMPEL dessen, was
    // seine Ecken trägt — Matrix (16), Farbe (3), die Instanz-Attribute der Fassade (`je`).
    _bauSatzStand(g) {
        const sts = this.state.satzStoffe ? this.state.satzStoffe.get(g.satz) : null;
        const { je, K } = this._bauSatzJe(g, (sts && sts.attr) || AnazhRealm.BAU_SATZ_ATTR);
        const cnt = g.liveCount | 0;
        const bau = {
            geom: g.geom,
            mat: g.mesh.material,
            n: g.geom.attributes.position.count,
            cnt,
            je,
            K,
            stempel: new Float32Array(Math.max(1, cnt) * K),
            gelegt: 0,
        };
        for (let i = 0; i < cnt; i++) this._bauSatzStempel(bau, g, i);
        return bau;
    }

    // Die Instanz-Attribute der Fassade, die ein Slot-Stempel trägt (`je`), und seine Breite `K` (Matrix 16 · Farbe 3 · `je`).
    _bauSatzJe(g, attr) {
        const je = [];
        let K = 19;
        for (const [name, is] of attr) {
            const q = g.geom.attributes[name];
            if (q && q.isInstancedBufferAttribute === true) {
                je.push([name, is]);
                K += is;
            }
        }
        return { je, K };
    }

    // Stempelt Slot `i` neu; true, wenn sich etwas änderte, das seine Ecken trägt.
    _bauSatzStempel(bau, g, i) {
        return this._bauSatzStempelIn(bau.stempel, i * bau.K, g, i, bau.je);
    }
    // Der Stempel von Slot `i` nach `S` ab `k` (der Stand eines Bereichs, die Bestellung des Satz-Fadens); true, wenn er sich änderte.
    _bauSatzStempelIn(S, k, g, i, je) {
        const im = g.mesh.instanceMatrix.array;
        const ic = g.mesh.instanceColor ? g.mesh.instanceColor.array : null;
        let anders = false;
        for (let j = i * 16, e = j + 16; j < e; j++, k++)
            if (S[k] !== im[j]) {
                S[k] = im[j];
                anders = true;
            }
        for (let c = 0; c < 3; c++, k++) {
            const v = ic ? ic[i * 3 + c] : 1;
            if (S[k] !== v) {
                S[k] = v;
                anders = true;
            }
        }
        for (const [name, is] of je) {
            const A = g.geom.attributes[name].array;
            for (let c = 0; c < is; c++, k++) {
                const v = A[i * is + c];
                if (S[k] !== v) {
                    S[k] = v;
                    anders = true;
                }
            }
        }
        return anders;
    }

    // DER SLOT-ABGLEICH eines stehenden Bereichs: die Größe folgt der Gruppe (`_bauSatzGroesse`), jeder Lauf geänderter Slots
    // legt seine Ecken (`_satzBlockEcken` ab seinem ersten Slot), die Zellen legen sich nur neu, wenn Lage oder Zahl sich
    // ändern (neue Zellen: jeder Pass schreibt sie), sonst folgen die Hüllen der gelegten Slots. false: Vorlage oder Stoff
    // wechselten — der Bereich legt sich ganz.
    _bauSatzSlots(b, g) {
        const bau = b.bau;
        if (bau.geom !== g.geom || bau.mat !== g.mesh.material) return false;
        const s = this.state.chunkSaetze.get(g.satz);
        const c = bau.cnt,
            c2 = g.liveCount | 0;
        const v0 = b.vStart;
        bau.gelegt = 0;
        if (c2 !== c) this._bauSatzGroesse(s, b, c2);
        if (bau.stempel.length < c2 * bau.K) {
            const neu = new Float32Array(Math.ceil(c2 * 1.5) * bau.K);
            neu.set(bau.stempel);
            bau.stempel = neu;
        }
        const sts = this.state.satzStoffe ? this.state.satzStoffe.get(g.satz) : null;
        const attr = (sts && sts.attr) || AnazhRealm.BAU_SATZ_ATTR;
        const regler = attr === AnazhRealm.BAU_SATZ_ATTR ? AnazhRealm._satzRegler(g.mesh.material) : null;
        const im = g.mesh.instanceMatrix.array;
        const ic = g.mesh.instanceColor ? g.mesh.instanceColor.array : null;
        let lauf = -1,
            erst = -1,
            letzt = -1;
        for (let i = 0; i <= c2; i++) {
            if (i < c2 && (this._bauSatzStempel(bau, g, i) || i >= c)) {
                if (lauf < 0) lauf = i;
                continue;
            }
            if (lauf < 0) continue;
            if (this._bauSatzFadenPasst(g, bau, lauf, i))
                this._bauSatzFadenSchreib(s, b.vStart + lauf * bau.n, g, bau, lauf, i);
            else {
                const A = this._satzBlockEcken(g.geom, im, ic, i - lauf, attr, g.key, regler, lauf);
                this._chunkSatzLege(s, b.vStart + lauf * bau.n, A, (i - lauf) * bau.n, false);
                bau.gelegt += (i - lauf) * bau.n;
                if (g._satzFaden) this._satzFadenZahl().gerechnet += (i - lauf) * bau.n;
            }
            if (erst < 0) erst = lauf;
            letzt = i;
            lauf = -1;
        }
        b.geom.quelle = [g.geom, im, ic, c2, attr, g.key, regler];
        if (c2 !== c || b.vStart !== v0) {
            const I = this._satzBlockIndex(g.geom, c2);
            const iAlt = b.iAnzahl;
            this._chunkSatzZellen(b, I.index.array, b.vStart, I.zellen, null);
            s.iSumme += b.iAnzahl - iAlt;
            this._chunkSatzHuelle(s, b);
        } else if (erst >= 0) this._chunkSatzHuelle(s, b, null, erst, letzt);
        return true;
    }

    // Die Größe eines stehenden Bereichs folgt seiner Gruppe: er schrumpft am Ende, wächst am Ende (am Hochwasser oder in
    // einen freien Lauf), sonst zieht er um (die gelegten Ecken kopiert, nie neu gerechnet).
    _bauSatzGroesse(s, b, c2) {
        const bau = b.bau;
        const alt = b.vAnzahl,
            neu = c2 * bau.n;
        if (neu < alt) this._chunkSatzVFrei(s, b.vStart + neu, alt - neu);
        else if (neu > alt) {
            const ende = b.vStart + alt,
                mehr = neu - alt;
            if (ende === s.vEnde) {
                if (ende + mehr > s.vKap)
                    this._chunkSatzGeometrie(s, Math.max(ende + mehr, Math.ceil(s.vKap * 1.5)), s.iKap);
                s.vEnde += mehr;
            } else if (!this._satzFreiAb(s.vFrei, ende, mehr)) {
                const v = this._chunkSatzVAlloc(s, neu);
                for (const { name, gis } of s.attr) {
                    const ga = s.geom.attributes[name];
                    ga.array.copyWithin(v * gis, b.vStart * gis, ende * gis);
                    ga.addUpdateRange(v * gis, alt * gis);
                    ga.needsUpdate = true;
                }
                this._chunkSatzVFrei(s, b.vStart, alt);
                b.vStart = v;
            }
        }
        s.vInhalt += neu - alt;
        b.vAnzahl = neu;
        bau.cnt = c2;
        // der Block ist flüchtig (K69): je Attribut ein schlichter Deskriptor — der neue trägt die Zahl seiner Ecken
        for (const { name } of s.attr) b.geom.attributes[name] = { ...b.geom.attributes[name], count: neu };
        this._chunkSatzViews(s, b);
    }

    // DER EINTRITT IN RATEN (Lehre 14): ein Bereich über dem Deckel nimmt seine Lage im Pool sofort (der Satz verdichtet
    // nicht, solange sie reserviert ist) und legt je Takt höchstens den Rest des Deckels — ganze Slots oder das Fenster
    // eines Slots; erst die letzte Rate macht ihn zum Bürger (Zellen, Hüllen), dann zeichnet er.
    _bauSatzRateNeu(key, art, g, bau) {
        const st = this.state;
        const raten = st.bauSatzRaten || (st.bauSatzRaten = new Map());
        const s = this._chunkSatz(art);
        const n = g.geom.attributes.position.count,
            cnt = g.liveCount | 0;
        const im = g.mesh.instanceMatrix.array;
        s.reserviert = (s.reserviert | 0) + 1;
        raten.set(key, {
            key,
            art,
            g,
            geom: g.geom,
            s,
            n,
            cnt,
            vStart: this._chunkSatzVAlloc(s, n * cnt),
            i: 0,
            v: 0,
            d2: this._spielerD2(im[12], im[14]),
            bau: bau || this._bauSatzStand(g),
        });
    }

    // Die Raten dieses Takts, nah zuerst; Rückgabe: der Rest des Deckels.
    _bauSatzRaten(budget) {
        const reihe = Array.from(this.state.bauSatzRaten.values()).sort((x, y) => x.d2 - y.d2);
        for (const r of reihe) {
            if (budget <= 0) break;
            budget -= this._bauSatzRate(r, budget);
        }
        return budget;
    }

    _bauSatzRate(r, budget) {
        const g = r.g,
            n = r.n;
        const sts = this.state.satzStoffe ? this.state.satzStoffe.get(g.satz) : null;
        const attr = (sts && sts.attr) || AnazhRealm.BAU_SATZ_ATTR;
        const regler = attr === AnazhRealm.BAU_SATZ_ATTR ? AnazhRealm._satzRegler(g.mesh.material) : null;
        const im = g.mesh.instanceMatrix.array;
        const ic = g.mesh.instanceColor ? g.mesh.instanceColor.array : null;
        let gelegt = 0;
        while (r.i < r.cnt && gelegt < budget) {
            const rest = budget - gelegt;
            const ganz = r.v === 0 && rest >= n;
            const k = ganz ? Math.min(r.cnt - r.i, Math.floor(rest / n)) : 1;
            const v1 = ganz ? n : Math.min(n, r.v + rest);
            const A = this._satzBlockEcken(g.geom, im, ic, k, attr, g.key, regler, r.i, r.v, v1);
            const m = k * (v1 - r.v);
            if (g._satzFaden) this._satzFadenZahl().gerechnet += m;
            this._chunkSatzLege(r.s, r.vStart + r.i * n + r.v, A, m, false);
            gelegt += m;
            if (v1 === n) {
                r.i += k;
                r.v = 0;
            } else r.v = v1;
        }
        if (r.i < r.cnt) return gelegt;
        const N = n * r.cnt;
        const B = this._satzBlockIndex(r.geom, r.cnt);
        B.attributes = {};
        for (const { name, is } of r.s.attr) B.attributes[name] = { array: null, itemSize: is, count: N };
        B.quelle = [r.geom, im, ic, r.cnt, attr, r.key, regler];
        this._bauSatzRateFort(r, false);
        if (r.s.bloecke.has(r.key)) this._chunkSatzAus(r.art, r.key);
        this._chunkSatzBuerger(r.s, r.key, B, r.vStart, N, this._bauSatzChunk(im)).bau = r.bau;
        this._bauSatzMarke(r.key, r.art); // der Slot-Abgleich holt nach, was sich während der Raten änderte
        return gelegt;
    }

    // Eine Rate endet: sie verlässt die Schlange, ihre Lage ist nicht mehr reserviert — abgebrochen gibt sie sie frei.
    _bauSatzRateFort(r, frei) {
        this.state.bauSatzRaten.delete(r.key);
        r.s.reserviert--;
        if (frei) this._chunkSatzVFrei(r.s, r.vStart, r.n * r.cnt);
    }

    // Der Bereich einer Gruppe: jede lebende Instanz [0, liveCount) in Welt-Lage (`_satzBlock`, die Attribute des Bau-Satzes).
    _bauSatzBlock(g) {
        const st = this.state.satzStoffe ? this.state.satzStoffe.get(g.satz) : null;
        const attr = (st && st.attr) || AnazhRealm.BAU_SATZ_ATTR;
        return this._satzBlock(
            g.geom,
            g.mesh.instanceMatrix.array,
            g.mesh.instanceColor ? g.mesh.instanceColor.array : null,
            g.liveCount | 0,
            attr,
            g.key,
            attr === AnazhRealm.BAU_SATZ_ATTR ? AnazhRealm._satzRegler(g.mesh.material) : null
        );
    }

    // DER EINE BLOCK-BAUER der Stoff-Sätze (Bau · Streu): `cnt` Instanzen einer Geometrie in Welt-Lage — Position ×
    // Instanz-Matrix, Normale × ihre Normalen-Matrix (normiert), Farbe × Instanz-Farbe (der InstanceNode multipliziert sie
    // sonst in den Stoff), die Instanz-Attribute der Fassade (`LOD_INSTANZ_ATTRIBUTE`) je Vertex, `aWiege` = die Höhe über der
    // Wurzel in Metern (Höhe der Vorlage × Welt-Skala der Instanz — die Länge ihrer ersten Matrix-Spalte: Studio-Skala des
    // Teils × Skala der Pflanze), alle anderen Vertex-Attribute wie sie sind; je Instanz eine Zelle (ihr Lauf im Index).
    // `im` = cnt × 16 Matrix-Werte, `ic` = cnt × 3 Farben oder null. Fail-closed: ein Satz-Attribut ohne Quelle, eine
    // Geometrie ohne Index ist ein lauter Bruch (`wer` nennt den Bereich).
    // `regler` (der Bau-Satz, `_satzRegler`): { regler: [Rauheit, Metall, Deckkraft], glut: [r, g, b] } — je Ecke dieselben
    // Zahlen (`aRegler`, `aGlut`); ein Satz-Attribut der Regler ohne sie ist ein Bruch.
    // DER BLOCK IST FLÜCHTIG (K69): seine Arrays sind Views der EINEN Werkbank (`_satzWerkbank`), der Satz packt sie beim
    // Eintritt und hält nie eine Referenz (`_chunkSatzEin`: `fluechtig`); `quelle` nennt, woraus er entstand (die Linse rechnet
    // ihn daraus nach). Befund (Null-Gang ins Dorf, `_tickBauSatz` 137 ms): der Wechsel eines Hauses auf die Stufe 0 legte
    // 142k Ecken frisch an (~10 MB je Wechsel, dazu die Kopie beim Austritt) — der Heap sprang, die volle Sammlung fiel
    // mitten in den Takt (ein Teil mit 56k Ecken 89–92 ms, sein Nachbar mit 72k Ecken 15 ms).
    _satzBlock(geo, im, ic, cnt, attr, wer, regler) {
        if (!geo.index || !geo.index.array) throw new Error(`_satzBlock(${wer}): kein Index`);
        const b = this._satzBlockIndex(geo, cnt);
        b.attributes = this._satzBlockEcken(geo, im, ic, cnt, attr, wer, regler);
        b.quelle = [geo, im, ic, cnt, attr, wer, regler];
        return b;
    }

    // Die Ecken eines Blocks (`_satzBlock`): die Instanzen [ab, ab + cnt), je Instanz das Fenster ihrer Ecken [v0, v1) —
    // der Bau-Satz legt so je Slot (`_bauSatzSlots`) und einen großen Bereich in Raten (`_bauSatzRate`), mit denselben Kernen.
    _satzBlockEcken(geo, im, ic, cnt, attr, wer, regler, ab = 0, v0 = 0, v1 = -1) {
        const A = geo.attributes;
        const n0 = A.position.count;
        if (v1 < 0) v1 = n0;
        const n = v1 - v0;
        const N = n * cnt;
        const M = this._bauSatzM || (this._bauSatzM = new THREE.Matrix4());
        const NM = this._bauSatzNM || (this._bauSatzNM = new Float64Array(9));
        const attributes = {};
        for (const [name, is] of attr) {
            if (name === "aRegler" || name === "aGlut") {
                const w = regler ? (name === "aRegler" ? regler.regler : regler.glut) : null;
                if (!w) throw new Error(`_satzBlock(${wer}): ${name} ohne die Regler des Stoffs`);
                const out = this._satzWerkbank(name, N * is, Float32Array);
                AnazhRealm._satzKernFuell(out, N, is, w);
                attributes[name] = { array: out, itemSize: is, count: N };
                continue;
            }
            const wiegeAttr = name === "aWiege";
            const q = wiegeAttr ? A.position : A[name];
            if (!q || (!wiegeAttr && q.itemSize !== is))
                throw new Error(`_satzBlock(${wer}): Attribut ${name} fehlt oder passt nicht`);
            const out = this._satzWerkbank(name, N * is, Float32Array);
            const jeInstanz = q.isInstancedBufferAttribute === true;
            const src = jeInstanz || (v0 === 0 && v1 === n0) ? q.array : q.array.subarray(v0 * is, v1 * is);
            // je Rechnung EIN Kern (`_satzKern*`, K69): eine kleine Funktion, eine Schleife, immer dieselben Array-Arten — die
            // Rechnung des Blocks hält ihre optimierte Form. Vorher lag jede Schleife in diesem Rumpf, und der Wechsel eines
            // Hauses auf die Stufe 0 fiel in die unoptimierte Rechnung: im Null-Gang ins Dorf ein Teil mit 56k Ecken 34–92 ms
            // beim ersten und zweiten Bau, beim dritten 7 ms (der Heap wuchs um 7–14 MB, jede Zahl ein Objekt).
            for (let j = 0; j < cnt; j++) {
                const o0 = j * n * is;
                const i = ab + j;
                if (name === "position") AnazhRealm._satzKernLage(out, o0, src, n, M.fromArray(im, i * 16).elements);
                else if (name === "normal")
                    AnazhRealm._satzKernNormale(
                        out,
                        o0,
                        src,
                        n,
                        globalThis.__phytoCore.satzNormalenMatrix(im, i * 16, NM)
                    );
                else if (wiegeAttr) {
                    const e = M.fromArray(im, i * 16).elements;
                    AnazhRealm._satzKernWiege(out, o0, src, n, Math.hypot(e[0], e[1], e[2]));
                } else if (jeInstanz) AnazhRealm._satzKernJe(out, o0, src, n, is, i * is);
                else if (name === "color" && ic)
                    AnazhRealm._satzKernFarbe(out, o0, src, n, ic[i * 3], ic[i * 3 + 1], ic[i * 3 + 2]);
                else out.set(src.subarray(0, n * is), o0);
            }
            attributes[name] = { array: out, itemSize: is, count: N };
        }
        return attributes;
    }

    // Der Index eines Blocks (`_satzBlock`): `cnt` Instanzen hintereinander, je Instanz eine Zelle. `jeSlot` (der Satz-Faden,
    // `_bauSatzFadenEin`): der Index der Instanz i aus ihrem Block statt aus der Vorlage (dieselbe Länge, dieselben Werte).
    _satzBlockIndex(geo, cnt, jeSlot) {
        const n = geo.attributes.position.count;
        const li0 = geo.index.array;
        const iN = li0.length;
        const idx = this._satzWerkbank("#index", iN * cnt, Uint32Array);
        // je Instanz eine Zelle (ihr Lauf im Index): jeder Pass wählt die Instanzen, deren Hülle sein Frustum schneidet.
        // Den Index der Vorlage (Uint16 ODER Uint32) kopiert `set`, die Schleife rechnet nur in Uint32 (K69): las sie beide
        // Breiten, riss der erste große Uint16-Index die optimierte Rechnung (Null-Gang ins Dorf: ein Teil mit 56k Ecken
        // 54–92 ms, sein Nachbar mit 72k Ecken und Uint32-Index 7–15 ms; der Heap wuchs dabei um 7–14 MB).
        const zellen = new Uint32Array(cnt + 1);
        for (let i = 0; i < cnt; i++) {
            const b = i * n,
                o = i * iN;
            idx.set(jeSlot ? jeSlot(i) : li0, o);
            if (b > 0) for (let k = o; k < o + iN; k++) idx[k] += b;
            zellen[i + 1] = o + iN;
        }
        return { attributes: null, index: { array: idx }, zellen, fluechtig: true, quelle: null };
    }

    // DIE EINE WERKBANK der Satz-Blöcke (K69): je Attribut-Name ein Array, das mit dem größten Block wächst (×1,5) und nie
    // schrumpft — ein Block ist ein View ihrer ersten `len` Werte, gültig bis zum nächsten `_satzBlock`.
    _satzWerkbank(name, len, Typ) {
        const W = this._satzWerk || (this._satzWerk = new Map());
        let a = W.get(name);
        if (!a || a.length < len) {
            a = new Typ(Math.max(len, Math.ceil((a ? a.length : 0) * 1.5)));
            W.set(name, a);
        }
        return a.subarray(0, len);
    }

    // DIE KERNE DES BLOCKS (K69, `_satzBlock`): `out` ab `o0`, `src` die Werte der Vorlage, `n` Ecken. Lage, Normale und
    // Farbe leben als EINE Quelle im Bau-Satz-Kern (phyto-core `satzKern*`, Spike satz-faden): der Satz-Faden rechnet die
    // Häuser der Stufe 2 mit denselben Funktionen (`satzTeilBloecke`).
    // Lage: Position × Instanz-Matrix `e` (16 Werte, spaltenweise).
    static _satzKernLage(out, o0, src, n, e) {
        globalThis.__phytoCore.satzKernLage(out, o0, src, n, e);
    }
    // Normale × Normalen-Matrix `e` (9 Werte, spaltenweise), normiert.
    static _satzKernNormale(out, o0, src, n, e) {
        globalThis.__phytoCore.satzKernNormale(out, o0, src, n, e);
    }
    // `aWiege`: die Höhe der Vorlage (Position y) × die Welt-Skala der Instanz.
    static _satzKernWiege(out, o0, src, n, skala) {
        for (let v = 0; v < n; v++) out[o0 + v] = src[v * 3 + 1] * skala;
    }
    // Ein Instanz-Attribut der Fassade (ab `q` in `src`, Breite `is`) je Ecke.
    static _satzKernJe(out, o0, src, n, is, q) {
        for (let v = 0; v < n; v++) for (let c = 0; c < is; c++) out[o0 + v * is + c] = src[q + c];
    }
    // Farbe × Instanz-Farbe.
    static _satzKernFarbe(out, o0, src, n, r, g, b) {
        globalThis.__phytoCore.satzKernFarbe(out, o0, src, n, r, g, b);
    }
    // Dieselben Zahlen `w` (Breite `is`) in jede der `N` Ecken.
    static _satzKernFuell(out, N, is, w) {
        for (let v = 0; v < N; v++) for (let c = 0; c < is; c++) out[v * is + c] = w[c];
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_bausatz]);

// ===== ATLAS · Siedlung/bausatz — Außen-Konstanten =====
// DER BAU-SATZ (Welle 6, `_bauSatzArt`): die Studio-Arten (Rezept-`kind`), deren gesetzte Gestalt im Satz ihres Stoffs
// zeichnet — je Art der Name des Satzes (die Täter-Klasse der Band-Linse, spec/profiband/haushalt.json: `bauSatz` →
// bau, `formationenSatz` → formationen). Ein gesetzter Bau wandert nie (die Tür-Flügel reisen einzeln), und seine
// Gestalt kehrt selten wieder (das Haus trägt seine Parzelle als Prägung, der Fels 16 Gestalten): die Instanz-Gruppe
// zog je Gestalt einen Befehl je Pass. Baum und Strauch (die Dither-Blende je Instanz, viele Wiederkehrer), Tor und
// Fahrzeug (Flügel, Fahrt) zeichnen als Instanz-Gruppe. Die AUSSTATTUNG (Feuerstelle · Marktstand · Brunnen, seit der
// Welle 5 Studio-Gestalt aus fachwerk) ist gesetzter Bau, der zeichnet UND wirft: eine Instanz-Gruppe dieser Art kann
// ihre Instanzen nicht je Pass wählen (die Wahl teilt den Instanz-Puffer, `_instanzWahlArt`) — 170 Feuerstellen warfen
// je Kaskade alle (37 400 Dreiecke an der Mess-Wiese); im Satz wählt jeder Pass seine Zellen nach dem EINEN Gesetz.
AnazhRealm.BAU_SATZ = Object.freeze({
    haus: "bauSatz",
    ausstattung: "bauSatz",
    // K43: das Tor zeichnet im Bau-Satz seines Stoffs (die Flügel der Stufe 0 wandern und bleiben draußen, `leaf.tuer`); sein
    // Wurf-Zwilling (die NUR-WURF-Stufe 3) liegt im Wurf-Satz — EIN Befehl je Kaskade für alle Werfer.
    gate: "bauSatz",
    rock: "formationenSatz",
    boulder: "formationenSatz",
    scree: "formationenSatz",
    crystal: "formationenSatz",
    columns: "formationenSatz",
});
// Die Attribute eines Bau-Satz-Bereichs: dazu DIE REGLER JE ECKE (K43-2, der EINE Satz-Stoff `_satzStoff`) — `aRegler` =
// Rauheit · Metall · Deckkraft (snorm8x4), `aGlut` = Emissiv × Glut-Stärke (float16x4), beide je Bereich aus dem Stoff seiner
// Gruppe (`budgetRegler`). Befund (Radeon, Genesis, 14.10.): 22 Tor-Stoffe der Stufe 1 unterschieden sich nur in diesen
// Zahlen (die Glut-Stärke je Rezept, Rauheit und Metall nach `metal`) — 24 Satz-Befehle im Hauptbild für sieben Bauten.
// DIE VERTEX-FORM (K44, wie der Boden-Satz): die Normale snorm8x4, die Farbe float16x4 — die Regler kosten so keinen Byte
// (60 → 48 B je Vertex; gemessen Genesis Radeon: Bau-Sätze 12,3 MB Inhalt bei 60 B).
// Der Deckel des Bau-Satzes je Takt (`_tickBauSatz`): so viele Ecken legt ein Takt höchstens in Raten (ein Bereich darüber
// tritt in Raten ein) — gemessen Radeon 890M, Messort stadt: ~0,1 µs je Ecke, der Deckel hält den Posten unter 1 ms.
AnazhRealm.BAU_SATZ_ECKEN_JE_TAKT = 8192;
// DER SATZ-FADEN (`_bauSatzFadenBestellen`): so lange wartet eine Gruppe höchstens auf die Blöcke ihrer Slots, danach rechnet
// der Haupt-Faden (verpasst); und die Satz-Attribute, die der Faden aus der Vorlage rechnet — jedes andere reist als Zahl.
AnazhRealm.BAU_SATZ_FADEN_FRIST_MS = 250;
AnazhRealm.BAU_SATZ_FADEN_GERECHNET = Object.freeze(["position", "normal", "color", "aRegler", "aGlut"]);
AnazhRealm.BAU_SATZ_ATTR = Object.freeze([
    Object.freeze(["position", 3]),
    Object.freeze(["normal", 3, "snorm8"]),
    Object.freeze(["color", 3, "half"]),
    Object.freeze(["aLodLevel", 1]),
    Object.freeze(["aH0", 1]),
    Object.freeze(["aH0L", 1]),
    Object.freeze(["aRegler", 3, "snorm8"]),
    Object.freeze(["aGlut", 3, "half"]),
]);
// Die Attribute eines Wurf-Satz-Bereichs (`bauWurf`, S3): was der EINE Schatten-Stoff liest — Welt-Lage, die Atlas-Lage
// (uv; die Stufe 3 trägt 0), die Deckung (aDeckt 1) und die Stufen-Stempel der Dither-Blende (Haus 0 = ungemaskt).
AnazhRealm.BAU_WURF_ATTR = Object.freeze([
    Object.freeze(["position", 3]),
    Object.freeze(["uv", 2]),
    Object.freeze(["aDeckt", 1]),
    Object.freeze(["aLodLevel", 1]),
    Object.freeze(["aH0", 1]),
    Object.freeze(["aH0L", 1]),
]);
