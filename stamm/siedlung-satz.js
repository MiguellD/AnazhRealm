class AnazhRealm_siedlung_satz {
    // ===== ATLAS · Siedlung/satz — Bau-Satz · Werfer · Kronen · Wege · Fundament · Arch-Instanzen =====
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
                else budget -= this._bauSatzLege(key, art, g, b, budget);
            }
            sm.clear();
        }
        if (raten && raten.size > 0) budget = this._bauSatzRaten(budget);
        const warten = !!raten && raten.size > 0;
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
    _bauSatzLege(key, art, g, b, budget) {
        if (b && b.bau && this._bauSatzSlots(b, g)) return b.bau.gelegt;
        const N = g.geom.attributes.position.count * g.liveCount;
        if (N > budget && N > AnazhRealm.BAU_SATZ_ECKEN_JE_TAKT) {
            this._bauSatzRateNeu(key, art, g);
            return 0;
        }
        const a = g.mesh.instanceMatrix.array;
        const nb = this._chunkSatzEin(art, key, this._bauSatzBlock(g), this._bauSatzChunk(a));
        nb.bau = this._bauSatzStand(g);
        return N;
    }

    // Der Chunk eines Bereichs (die Nah-fern-Ordnung des Satzes): der seiner ersten Instanz.
    _bauSatzChunk(im) {
        const span = this._voxelChunkConfig().span;
        return Math.floor(im[12] / span) + "," + Math.floor(im[14] / span);
    }

    // Der Stand eines Bau-Bereichs (`b.bau`): seine Vorlage, sein Stoff, seine Instanzen und je Slot der STEMPEL dessen, was
    // seine Ecken trägt — Matrix (16), Farbe (3), die Instanz-Attribute der Fassade (`je`).
    _bauSatzStand(g) {
        const sts = this.state.satzStoffe ? this.state.satzStoffe.get(g.satz) : null;
        const attr = (sts && sts.attr) || AnazhRealm.BAU_SATZ_ATTR;
        const je = [];
        let K = 19;
        for (const [name, is] of attr) {
            const q = g.geom.attributes[name];
            if (q && q.isInstancedBufferAttribute === true) {
                je.push([name, is]);
                K += is;
            }
        }
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

    // Stempelt Slot `i` neu; true, wenn sich etwas änderte, das seine Ecken trägt.
    _bauSatzStempel(bau, g, i) {
        const S = bau.stempel;
        const im = g.mesh.instanceMatrix.array;
        const ic = g.mesh.instanceColor ? g.mesh.instanceColor.array : null;
        let k = i * bau.K,
            anders = false;
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
        for (const [name, is] of bau.je) {
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
            const A = this._satzBlockEcken(g.geom, im, ic, i - lauf, attr, g.key, regler, lauf);
            this._chunkSatzLege(s, b.vStart + lauf * bau.n, A, (i - lauf) * bau.n, false);
            bau.gelegt += (i - lauf) * bau.n;
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
    _bauSatzRateNeu(key, art, g) {
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
            bau: this._bauSatzStand(g),
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
        const NM = this._bauSatzNM || (this._bauSatzNM = new THREE.Matrix3());
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
                    AnazhRealm._satzKernNormale(out, o0, src, n, NM.getNormalMatrix(M.fromArray(im, i * 16)).elements);
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

    // Der Index eines Blocks (`_satzBlock`): `cnt` Instanzen hintereinander, je Instanz eine Zelle.
    _satzBlockIndex(geo, cnt) {
        const n = geo.attributes.position.count;
        const li = geo.index.array;
        const iN = li.length;
        const idx = this._satzWerkbank("#index", iN * cnt, Uint32Array);
        // je Instanz eine Zelle (ihr Lauf im Index): jeder Pass wählt die Instanzen, deren Hülle sein Frustum schneidet.
        // Den Index der Vorlage (Uint16 ODER Uint32) kopiert `set`, die Schleife rechnet nur in Uint32 (K69): las sie beide
        // Breiten, riss der erste große Uint16-Index die optimierte Rechnung (Null-Gang ins Dorf: ein Teil mit 56k Ecken
        // 54–92 ms, sein Nachbar mit 72k Ecken und Uint32-Index 7–15 ms; der Heap wuchs dabei um 7–14 MB).
        const zellen = new Uint32Array(cnt + 1);
        for (let i = 0; i < cnt; i++) {
            const b = i * n,
                o = i * iN;
            idx.set(li, o);
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

    // DIE KERNE DES BLOCKS (K69, `_satzBlock`): `out` ab `o0`, `src` die Werte der Vorlage, `n` Ecken.
    // Lage: Position × Instanz-Matrix `e` (16 Werte, spaltenweise).
    static _satzKernLage(out, o0, src, n, e) {
        const e0 = e[0],
            e1 = e[1],
            e2 = e[2],
            e4 = e[4],
            e5 = e[5],
            e6 = e[6],
            e8 = e[8],
            e9 = e[9],
            e10 = e[10],
            e12 = e[12],
            e13 = e[13],
            e14 = e[14];
        for (let k = 0, m = n * 3; k < m; k += 3) {
            const x = src[k],
                y = src[k + 1],
                z = src[k + 2];
            out[o0 + k] = e0 * x + e4 * y + e8 * z + e12;
            out[o0 + k + 1] = e1 * x + e5 * y + e9 * z + e13;
            out[o0 + k + 2] = e2 * x + e6 * y + e10 * z + e14;
        }
    }
    // Normale × Normalen-Matrix `e` (9 Werte, spaltenweise), normiert.
    static _satzKernNormale(out, o0, src, n, e) {
        const e0 = e[0],
            e1 = e[1],
            e2 = e[2],
            e3 = e[3],
            e4 = e[4],
            e5 = e[5],
            e6 = e[6],
            e7 = e[7],
            e8 = e[8];
        for (let k = 0, m = n * 3; k < m; k += 3) {
            const x = src[k],
                y = src[k + 1],
                z = src[k + 2];
            const nx = e0 * x + e3 * y + e6 * z,
                ny = e1 * x + e4 * y + e7 * z,
                nz = e2 * x + e5 * y + e8 * z;
            const l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
            out[o0 + k] = nx / l;
            out[o0 + k + 1] = ny / l;
            out[o0 + k + 2] = nz / l;
        }
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
        for (let k = 0, m = n * 3; k < m; k += 3) {
            out[o0 + k] = src[k] * r;
            out[o0 + k + 1] = src[k + 1] * g;
            out[o0 + k + 2] = src[k + 2] * b;
        }
    }
    // Dieselben Zahlen `w` (Breite `is`) in jede der `N` Ecken.
    static _satzKernFuell(out, N, is, w) {
        for (let v = 0; v < N; v++) for (let c = 0; c < is; c++) out[v * is + c] = w[c];
    }

    // DIE WERFER-HÜLLE eines Region-Bundles (W7): die Welt-AABB seiner WERFENDEN Kinder (castShadow), aus dem Inhalt —
    // je Instanz die Geometrie-Kugel (drehungsfest: Billboards, Wind), je Mesh seine Box, plus `randM`. Einmal je
    // Schatten-Takt (`_shadowFrame`, die Kaskaden-Box und jeder Schatten-Pass lesen dieselbe Hülle); je Kind hält ein
    // Zahlen-Schlüssel (Instanz-/Positions-Version · Zahl · Geometrie · Welt-Lage) seine Box, nur geänderte Kinder
    // rechnen neu. Ohne Bundle-Version: dieselbe Hülle trägt eine schlichte Gruppe. null = wirft nicht.
    // DER STAND DER WERFER (K72): derselbe Gang stempelt, was die Werfer-Wahl je Pass liest — die Folge der sichtbaren
    // Knoten mit Wurf und Kinderzahl und jede neu gerechnete Box; ändert sich etwas, steigt `u._werferStand`. Die Wahl
    // eines Passes (`_werferWahlSteht`) gilt, solange Lage und Stand stehen — sie geht die Kinder nicht in jedem Render.
    _bundleWerferHuelle(bg) {
        const u = bg.userData;
        const takt = this._shadowFrame || 0;
        if (u._werferTakt === takt && u._werferHuelle !== undefined) return u._werferHuelle;
        // DAS REGISTER (E-Bauart): die Hülle STEHT, solange das Bündel nicht neu aufnimmt (seine Version), keines seiner Kinder
        // Puffer oder Sicht meldete (der Halter, `_anazhHaltR`) und jedes statisch ist — kein Gang über die Kinder je Schatten-Takt
        if (u._werferR !== undefined && u._werferV === bg.version && !(bg._anazhHaltR > u._werferR)) {
            u._werferTakt = takt;
            return u._werferHuelle;
        }
        const box = u._werferBox || (u._werferBox = new THREE.Box3());
        box.makeEmpty();
        const spur = this._wfSpur || (this._wfSpur = { h: 0, neu: false, bg: null, beweglich: false });
        spur.h = bg.children.length | 0;
        spur.neu = false;
        spur.bg = bg;
        spur.beweglich = false;
        const r0 = AnazhRealm._regungN;
        for (const c of bg.children) this._werferBoxDazu(box, c);
        u._werferV = bg.version;
        u._werferR = spur.beweglich ? undefined : r0;
        if (spur.neu || u._werferSig !== spur.h || u._werferStand === undefined) {
            u._werferSig = spur.h;
            u._werferStand = (u._werferStand | 0) + 1;
            // die gemerkten Wahlen dieses Bundles gelten nicht mehr — sie halten keinen gegangenen Werfer fest
            if (u._werferJe) u._werferJe.clear();
        }
        u._werferTakt = takt;
        u._werferHuelle = box.isEmpty() ? null : box.expandByScalar(AnazhRealm.SCHATTEN_KASKADE.randM);
        return u._werferHuelle;
    }
    _werferBoxDazu(box, o) {
        // der Zeichner einer Senke (1410-1) wirft mit ihr: ihre Hülle trägt jede Instanz, er ist kein eigener Werfer
        if (!o || o.isInstanzZeichner === true) return;
        const spur = this._wfSpur;
        // das Register: das Bündel hört Sicht und Puffer jedes Kindes; ein Kind mit matrixAutoUpdate hält die Hülle im Gang
        AnazhRealm._regungHalter(o, spur.bg);
        if (o.matrixAutoUpdate !== false) spur.beweglich = true;
        if (o.visible === false) return;
        const g = o.geometry;
        spur.h = Math.imul(
            spur.h ^ (o.id * 4 + (o.castShadow === true ? 2 : 0) + (o.isMesh === true ? 1 : 0)),
            0x9e3779b1
        );
        spur.h = Math.imul(spur.h ^ o.children.length, 0x85ebca6b);
        if (o.isMesh === true && o.castShadow === true && g && g.attributes && g.attributes.position) {
            const im = o.isInstancedMesh === true ? o.instanceMatrix : null;
            AnazhRealm._regungHalter(im || g.attributes.position, spur.bg);
            const mw = o.matrixWorld.elements;
            const ud = o.userData;
            const ver = im ? im.version : g.attributes.position.version;
            const zahl = im ? o.count | 0 : mw[0];
            if (
                ud._wfVer !== ver ||
                ud._wfZahl !== zahl ||
                ud._wfGeo !== g.id ||
                ud._wfX !== mw[12] ||
                ud._wfY !== mw[13] ||
                ud._wfZ !== mw[14]
            ) {
                const b = ud._werferKind || (ud._werferKind = new THREE.Box3());
                b.makeEmpty();
                spur.neu = true;
                if (im) {
                    if (!g.boundingSphere) g.computeBoundingSphere();
                    const bs = g.boundingSphere;
                    const c = bs.center,
                        R = bs.radius;
                    const a = im.array;
                    const n = Math.min(o.count | 0, (a.length / 16) | 0);
                    let x0 = Infinity,
                        y0 = Infinity,
                        z0 = Infinity,
                        x1 = -Infinity,
                        y1 = -Infinity,
                        z1 = -Infinity;
                    // Jede Instanz in [0, count) lebt (die Gruppe ist dicht, `_archGroupFree`).
                    for (let i = 0, k = 0; i < n; i++, k += 16) {
                        const s2 = Math.max(
                            a[k] * a[k] + a[k + 1] * a[k + 1] + a[k + 2] * a[k + 2],
                            a[k + 4] * a[k + 4] + a[k + 5] * a[k + 5] + a[k + 6] * a[k + 6],
                            a[k + 8] * a[k + 8] + a[k + 9] * a[k + 9] + a[k + 10] * a[k + 10]
                        );
                        const r = R * Math.sqrt(s2);
                        const cx = a[k] * c.x + a[k + 4] * c.y + a[k + 8] * c.z + a[k + 12];
                        const cy = a[k + 1] * c.x + a[k + 5] * c.y + a[k + 9] * c.z + a[k + 13];
                        const cz = a[k + 2] * c.x + a[k + 6] * c.y + a[k + 10] * c.z + a[k + 14];
                        if (cx - r < x0) x0 = cx - r;
                        if (cy - r < y0) y0 = cy - r;
                        if (cz - r < z0) z0 = cz - r;
                        if (cx + r > x1) x1 = cx + r;
                        if (cy + r > y1) y1 = cy + r;
                        if (cz + r > z1) z1 = cz + r;
                    }
                    if (x1 >= x0) {
                        b.min.set(x0, y0, z0);
                        b.max.set(x1, y1, z1);
                        b.applyMatrix4(o.matrixWorld);
                    }
                } else {
                    // die Box der Geometrie, wie three die Kugel liest (Bundle-Inhalt ist statisch: einmal je
                    // Geometrie)
                    if (!g.boundingBox) g.computeBoundingBox();
                    b.copy(g.boundingBox).applyMatrix4(o.matrixWorld);
                }
                ud._wfVer = ver;
                ud._wfZahl = zahl;
                ud._wfGeo = g.id;
                ud._wfX = mw[12];
                ud._wfY = mw[13];
                ud._wfZ = mw[14];
            }
            if (!ud._werferKind.isEmpty()) box.union(ud._werferKind);
        }
        const kinder = o.children;
        for (let i = 0; i < kinder.length; i++) this._werferBoxDazu(box, kinder[i]);
    }

    // ═══ DER BERG-SCHATTEN (feld-natives Hi-Z) ═══
    // Verdeckung aus dem EIGENEN Gesetz statt Depth-Pyramide: Sichtlinie Kamera → Kugel-OBERKANTE gegen
    // `_terrainMacroSurfaceY`, drei Azimut-Linien (Mitte ± Radius); nur wenn ALLE drei überragt sind, ist
    // die Region verdeckt. Amortisiert (Verdikt gecacht, Re-Test alle testMs); verdeckte Regionen testen
    // HÄUFIGER (schneller Un-Cull). < minDist nie verdeckt. Headless aus (Hook __anazhBergCull=true).
    _bergSchattenVerdeckt(s) {
        const cam = this.state.camera;
        if (!cam) return false;
        const B = AnazhRealm.BERG_CULL;
        const cx = cam.position.x,
            cy = cam.position.y,
            cz = cam.position.z;
        const dx = s.center.x - cx,
            dz = s.center.z - cz;
        const distXZ = Math.hypot(dx, dz);
        if (!(distXZ > B.minDist)) return false; // nahe Regionen nie verdeckt
        const topY = s.center.y + s.radius;
        const px = -dz / distXZ,
            pz = dx / distXZ; // horizontale Senkrechte zur Sichtlinie
        this._bergCullTests = (this._bergCullTests || 0) + 1; // Linse
        for (let seit = -1; seit <= 1; seit++) {
            let blockiert = false;
            for (let i = 0; i < B.proben; i++) {
                const t = B.tMin + ((B.tMax - B.tMin) * i) / (B.proben - 1);
                const lx = cx + dx * t + px * seit * s.radius * t;
                const lz = cz + dz * t + pz * seit * s.radius * t;
                const ly = cy + (topY - cy) * t; // Sichtlinie zur Oberkante
                if (this._terrainMacroSurfaceY(lx, lz, false) > ly + B.marge) {
                    blockiert = true;
                    break;
                }
            }
            if (!blockiert) return false; // EINE freie Linie → sichtbar
        }
        return true;
    }

    // Pro Frame (aus _loopFrustumCulling): die Bundle-Sichtbarkeit IST das Region-Culling (_projectObject
    // wertet `visible` auch für gecachte Bundles aus). Frustum (jeden Frame) → BERG-SCHATTEN (amortisiert,
    // nur frustum-sichtbare Kugeln, 2-Treffer-Hysterese).
    _archRegionBundleCull() {
        const map = this.state._regionBundles;
        if (!map || map.size === 0) return;
        const fr = this._frustumCache;
        if (!fr) return;
        this._occlProbeFrame = (this._occlProbeFrame || 0) + 1; // der Query-Probe-Takt (④)
        const hook = typeof window !== "undefined" ? window.__anazhBergCull : undefined;
        const bergAktiv =
            hook !== false &&
            (hook === true || !(this.state.renderer && this.state.renderer._isHeadlessNull)) &&
            !!this.state.camera;
        const B = AnazhRealm.BERG_CULL;
        const now = performance.now();
        let budget = B.budgetJeFrame;
        for (const bg of map.values()) {
            const s = bg.userData.cullSphere;
            if (!s) {
                bg.visible = true;
                bg.userData._sichtHaupt = true;
                continue;
            }
            let vis = fr.intersectsSphere(s);
            if (vis && bergAktiv) {
                const u = bg.userData;
                const testMs = u._bergVerdeckt ? B.testMsVerdeckt : B.testMsSichtbar;
                if (budget > 0 && (!u._bergTestAt || now - u._bergTestAt > testMs)) {
                    budget--;
                    u._bergTestAt = now;
                    if (this._bergSchattenVerdeckt(s)) {
                        u._bergTreffer = (u._bergTreffer || 0) + 1;
                        if (u._bergTreffer >= 2) u._bergVerdeckt = true; // Hysterese: 2 Verdikte
                    } else {
                        u._bergTreffer = 0;
                        u._bergVerdeckt = false; // frei → SOFORT sichtbar
                    }
                }
                if (u._bergVerdeckt) {
                    vis = false;
                    this._bergCullVerdeckt = (this._bergCullVerdeckt || 0) + 1; // Linse (Frame-Summen)
                }
            }
            bg.visible = vis;
            if (s && this.state.camera) {
                const cp = this.state.camera.position;
                const kante = Math.hypot(s.center.x - cp.x, s.center.z - cp.z) - s.radius;
                // ④ WALD-VOR-WALD (echtes Depth-Occlusion): der Query-Proxy testet
                // die KOMPLETTE Frame-Tiefe (Bäume + Fern-Schirm) — nativ.
                if (bergAktiv) this._bundleQueryTick(bg, s, kante);
            }
            // Das HAUPT-Urteil (Frustum · Berg · Query) — der Hauptpass liest es, jeder Schatten-Pass wählt selbst
            // (_passSicht).
            bg.userData._sichtHaupt = bg.visible;
        }
    }

    // ═══ WALD-VOR-WALD (natives Depth-Occlusion) ═══
    // Ein unsichtbarer Kugel-Kasten (colorWrite=false, transparent-Liste → nach allem Opaken) trägt
    // occlusionTest (ANY_SAMPLES_PASSED): 0 Fragmente → Region TOTAL verdeckt. Verdikt async (1–2 Frames
    // alt), 2er-Hysterese, Un-Cull sofort, < BERG_CULL.minDist nie. Der Render-Kontext wird am Proxy
    // gefangen (onBeforeRender) → backend.isOccluded(ctx, proxy).
    _bundleQueryTick(bg, s, kante) {
        const st = this.state;
        const u = bg.userData;
        if (kante < AnazhRealm.BERG_CULL.minDist) {
            if (u._occlProxy) u._occlProxy.visible = false;
            u._occlTreffer = 0;
            u._occlVerdeckt = false;
            return;
        }
        // PROBE-TAKT: Queries jeden Frame zwängen den Vendor in QuerySet-Bau/-Destroy + Resolve + Map pro
        // Frame → nur jeder queryTakt-te Frame fragt (dazwischen Proxys unsichtbar = 0 Queries); das Verdikt
        // hält bis zur nächsten Probe (Verdeckung ist zeitlich kohärent).
        this._occlProbeFrame = this._occlProbeFrame === undefined ? 0 : this._occlProbeFrame;
        const probeFenster = this._occlProbeFrame % AnazhRealm.BERG_CULL.queryTakt === 0;
        if (!probeFenster) {
            if (u._occlProxy) u._occlProxy.visible = false;
            if (u._occlVerdeckt) {
                bg.visible = false;
                this._bergCullVerdeckt = (this._bergCullVerdeckt || 0) + 1;
            }
            return;
        }
        let q = u._occlProxy;
        if (!q) {
            if (!this._occlProxyGeo) this._occlProxyGeo = new THREE.BoxGeometry(2, 2, 2);
            if (!this._occlProxyMat) {
                const m = new THREE.MeshBasicMaterial({ transparent: true });
                m.colorWrite = false;
                m.depthWrite = false;
                this._occlProxyMat = m;
            }
            q = new THREE.Mesh(this._occlProxyGeo, this._occlProxyMat);
            q.occlusionTest = true;
            q.userData.inventar = "occl-proxy";
            q.onBeforeRender = (r) => {
                if (r && r._currentRenderContext) this._occlKontext = r._currentRenderContext;
                q.userData._occlGerufen = this._occlProbeFrame; // der Renderer wollte ihn zeichnen (nach dem Culling)
            };
            u._occlProxy = q;
            if (st.scene) st.scene.add(q);
        }
        q.visible = true;
        q.position.set(s.center.x, s.center.y, s.center.z);
        q.scale.setScalar(Math.max(1e-3, s.radius));
        const be = st.renderer && st.renderer.backend;
        const okt = this._occlKontext;
        // DER STUMME STELLVERTRETER (0910-3 A, Gegenprüfung): wollte der Renderer ihn im letzten Probe-Fenster zeichnen, steht
        // er im Abfrage-Feld dieses Renders (`occlusionQueryObjects`, r184 ersetzt es nur bei Zähler > 0 — also bis zum
        // nächsten Probe-Frame). Fehlt er dort `STUMM_FENSTER` Fenster in Folge, steht seine Pipeline nicht oder gilt als
        // gescheitert (r184s Fehler-Bereich um den asynchronen Bau vergiftet sie still mit einem FREMDEN Fehler) — ohne
        // Abfrage gibt es nie wieder ein Verdikt: laut beim Namen, einmal je Welt.
        if (be && okt && q.userData._occlGerufen !== undefined && q.userData._occlGerufen !== this._occlProbeFrame) {
            const d = be.get(okt);
            const begann = !!(d && d.occlusionQueryObjects && d.occlusionQueryObjects.indexOf(q) >= 0);
            u._occlStumm = begann ? 0 : (u._occlStumm || 0) + 1;
            q.userData._occlGerufen = undefined;
            if (u._occlStumm >= AnazhRealm.BERG_CULL.stummFenster && !this._occlStummGemeldet) {
                this._occlStummGemeldet = true;
                this.log(
                    `BERG-CULL STUMM: der Stellvertreter von ${bg.name} begann in ${u._occlStumm} Probe-Fenstern keine ` +
                        "Verdeckungs-Abfrage — seine Pipeline steht nicht oder gilt als gescheitert (die GPU-Wache nennt den " +
                        "Fehler); ohne Abfrage kein Verdikt",
                    "ERROR"
                );
            }
        }
        if (be && okt && typeof be.isOccluded === "function") {
            if (be.isOccluded(okt, q)) {
                u._occlTreffer = (u._occlTreffer || 0) + 1;
                if (u._occlTreffer >= 2) u._occlVerdeckt = true; // Hysterese: 2 Verdikte
            } else {
                u._occlTreffer = 0;
                u._occlVerdeckt = false; // sichtbar → SOFORT zurück
            }
            if (u._occlVerdeckt) {
                bg.visible = false;
                this._bergCullVerdeckt = (this._bergCullVerdeckt || 0) + 1; // dieselbe Linse
            }
        }
    }

    // Proxy-Abbau (der Bundle-Tod räumt sein Query-Objekt — kein Szene-Leck).
    _bundleQueryProxyTod(bg) {
        const q = bg && bg.userData && bg.userData._occlProxy;
        if (!q) return;
        if (q.parent) q.parent.remove(q);
        bg.userData._occlProxy = null;
    }

    // V18.300 — `regionKey` (optional): eine REGION-gekeyte Gruppe trägt nur die
    // Instanzen EINER 256m-Streu-Region → ihre instanz-bewusste Bounding-Sphere ist
    // LOKAL → frustumCulled=true (die Engine cullt sie beim Wegschauen = die Heilung
    // des „kann mich kaum drehen"). Ohne regionKey (placed Architektur) bleibt die
    // Gruppe global + frustumCulled=false (welt-verteilte Instanzen, Group-BBox nutzlos).
    // SUBSYSTEM 5 (Vorlage: `forestGroup.traverse(...o.layers.set(1))`) — die non-breaking
    // Laub-Layer-Trennung: eine Vegetations-Instanz-/Gras-Gruppe bekommt die FOLIAGE_LAYER
    // ZUSÄTZLICH (`enable`, Layer 0 bleibt) → Render + Schatten sind heute byte-identisch (die
    // Haupt-Kamera + der Schatten-Pass sehen sie weiter über Layer 0), aber der künftige
    // reduziert-aufgelöste Laub-Pass kann sie über `pass.setLayers(FOLIAGE_LAYER)` ISOLIERT
    // wählen. Placed Architektur (`p:`-Region-Key ODER global) bleibt Layer-0-only (kein Laub).
    _markFoliageLayer(mesh, regionKey, regional) {
        if (!mesh || !mesh.layers || typeof mesh.layers.enable !== "function") return;
        // Foliage = region-gestreute Vegetation; die platzierte Architektur ist global (Welle B).
        const isFoliage = regional !== false && regionKey != null;
        if (isFoliage) mesh.layers.enable(AnazhRealm.FOLIAGE_LAYER);
    }

    // INSTANZ-FASSADE: das Studio rechnet SSE-Metrik und Billboard-vOcc PER INSTANZ
    // (`min(uLodRef/(aH0*_isy),1)`), die geteilte Quell-Geometrie (fCache) trägt keine Instanz-Werte.
    // Die Fassade TEILT alle Vertex-Buffer (zero-copy) und ersetzt aH0/aH0L/aKarte durch INSTANZIERTE
    // Attribute (je Slot am Slot-Chokepoint gestempelt: Template-Höhe × Instanz-Skala; die Karte Schicht, Rahmen und
    // ±Sichthöhe). EIN Fassade-Objekt je Gruppe, über Grow wiederverwendet; nie geometry.dispose().
    _lodInstanceFacade(srcGeom, capacity) {
        const g2 = new THREE.BufferGeometry();
        if (srcGeom.index) g2.setIndex(srcGeom.index);
        for (const k in srcGeom.attributes) {
            if (AnazhRealm.LOD_INSTANZ_ATTRIBUTE[k]) continue;
            g2.setAttribute(k, srcGeom.attributes[k]);
        }
        const a0 = srcGeom.attributes.aH0;
        const a0L = srcGeom.attributes.aH0L;
        const h0 = a0 && a0.array && a0.array.length ? a0.array[0] : 0;
        const h0L = a0L && a0L.array && a0L.array.length ? a0L.array[0] : h0;
        if (a0) {
            g2.setAttribute("aH0", new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1));
            g2.setAttribute("aH0L", new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1));
        }
        // Die Karte: Atlas-Schicht + Rahmen + Billboard-Verdeckung je Slot in EINEM vec4 (`_lodSlotStamp`).
        for (const k of ["aKarte"]) {
            const n = AnazhRealm.LOD_INSTANZ_ATTRIBUTE[k];
            if (srcGeom.attributes[k])
                g2.setAttribute(k, new THREE.InstancedBufferAttribute(new Float32Array(capacity * n), n));
        }
        g2.boundingSphere = srcGeom.boundingSphere;
        g2.boundingBox = srcGeom.boundingBox;
        // Die Fassade zeichnet, was ihre Quelle zeichnet (der Wurf-Teil des Schatten-Zwillings ist ein drawRange).
        g2.setDrawRange(srcGeom.drawRange.start, srcGeom.drawRange.count);
        g2.userData._lodFacade = true;
        g2.userData._h0Tpl = h0;
        g2.userData._h0LTpl = h0L;
        return g2;
    }
    // Grow-Pfad der Fassade: die Instanz-Arrays auf die neue Kapazität heben (Werte
    // kopieren) — dasselbe Geometrie-Objekt bleibt (die Vertex-Buffer sind geteilt).
    _lodFacadeGrow(geom, newCap) {
        if (!geom || !geom.userData || !geom.userData._lodFacade) return;
        for (const k in AnazhRealm.LOD_INSTANZ_ATTRIBUTE) {
            const a = geom.attributes[k];
            if (!a || !a.isInstancedBufferAttribute) continue;
            const n = a.itemSize;
            const arr = new Float32Array(newCap * n);
            arr.set(a.array.subarray(0, Math.min(a.array.length, newCap * n)));
            geom.setAttribute(k, new THREE.InstancedBufferAttribute(arr, n));
        }
    }
    // DER EINE SLOT-STEMPEL (beide Slot-Chokepoints rufen ihn): Sichthöhe = Template ×
    // Instanz-Skala (exakt das Studio-`aH0*_isy`) + VOLL (`_lodSlotVoll`: die Karte des Verdeckten und der Brücke, die
    // Stufe ohne Partner — das Vorzeichen von aKarte.w bzw. aH0L, die Maske hält) + — trägt das Leaf eine Karte —
    // ihre Atlas-Schicht und ihr Rahmen (der Occlusion-Refresh reicht kein Leaf: Schicht und Rahmen bleiben).
    _lodSlotStamp(g, slot, scale, voll, leaf) {
        const geom = g && g.mesh && g.mesh.geometry;
        if (!geom || !geom.userData || !geom.userData._lodFacade) return;
        g.slotStand = (g.slotStand | 0) + 1; // der Slot-Stand (`_instanzSlotStand`): Sichthöhe und Karte der Wahl
        const s = Number.isFinite(scale) && scale > 0 ? scale : 1;
        const a0 = geom.attributes.aH0;
        if (a0 && a0.isInstancedBufferAttribute && slot < a0.array.length) {
            a0.array[slot] = geom.userData._h0Tpl * s;
            a0.needsUpdate = true;
            const a0L = geom.attributes.aH0L;
            if (a0L && slot < a0L.array.length) {
                // der Halt der 3D-Stufe reist im Vorzeichen der Blatt-Sichthöhe (aH0 liest der Wind, er bleibt positiv)
                a0L.array[slot] = geom.userData._h0LTpl * s * (voll ? -1 : 1);
                a0L.needsUpdate = true;
            }
        }
        // Die Karte: EIN vec4 je Slot (Schicht, Halbbreite, Höhe, ±Sichthöhe). Schicht, Rahmen und Sichthöhe (Vorlage ×
        // Instanz-Skala, wie aH0) stempelt nur ein Ruf mit Karten-Leaf; die Verdeckung trägt das Vorzeichen der Sichthöhe
        // (negativ = verdeckt: die Karte blendet voll) — der Verdeckungs-Refresh ohne Leaf kehrt nur das Vorzeichen.
        const ak = geom.attributes.aKarte;
        if (ak && ak.isInstancedBufferAttribute && slot * 4 < ak.array.length) {
            let h = Math.abs(ak.array[slot * 4 + 3]);
            if (leaf && Number.isFinite(leaf.zelle)) {
                ak.array[slot * 4] = leaf.zelle;
                ak.array[slot * 4 + 1] = leaf.rahmen[0];
                ak.array[slot * 4 + 2] = leaf.rahmen[1];
                h = leaf.sicht * s;
            }
            ak.array[slot * 4 + 3] = voll ? -h : h;
            ak.needsUpdate = true;
        }
        // SUBMIT-WAL — Facade-Attribut-Mutation (auch via _lodSlotOcclusionRefresh,
        // AUSSERHALB des Alloc-Pfads): das Region-Bundle re-recorden, sonst friert
        // der Wert im gecachten Replay ein.
        if (!g.mesh.__arena) this._archMeshBundleTouch(g.mesh); // eine Arena liest Zahl und Puffer im Takt (G1)
    }
    // Occlusion-Wechsel OHNE LOD-Switch (fern-verdeckt ↔ fern-frei): die Verdeckung (Vorzeichen von aKarte.w)
    // der lebenden Slots nachziehen (das Studio schreibt vOcc pro Tick — der Host
    // nur am WECHSEL, derselbe Wert dazwischen).
    _lodSlotOcclusionRefresh(entry) {
        for (const band of [false, true]) {
            const list = band ? entry.instSlotsBand : entry.instSlots;
            if (!Array.isArray(list)) continue;
            for (const ref of list) {
                const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(ref.key);
                if (g) this._lodSlotStamp(g, ref.slot, entry.scale, this._lodSlotVoll(entry, band));
            }
        }
    }
    // Zeichnet die Stufe dieses Eintrags VOLL (kein Distanz-Fade)? Die Karte des verdeckt-demotierten Baums (Studio-vOcc)
    // und die Brücke eines kalten Baums, dessen Wunsch-Stufe noch lädt (`_rebuildArchitectureMesh`); die Primär-Stufe, deren
    // Partner fehlt (`_lodHalt`, K36). Der Band-Partner hält nie: er steht nur neben seiner Primär-Stufe (die 3D-Stufe
    // neben einer verdeckten Karte zeichnete sonst voll mit ihr doppelt) — nur eine Karte im Band trägt Verdeckung und Brücke.
    _lodSlotVoll(entry, band, bandLod = entry._lodBandLevel) {
        const karte = entry._occluded === true || entry._bruecke === true;
        if (band) return karte && bandLod === 2;
        return karte || entry._lodHalt === true;
    }
    _archInstanceGroupFor(name, leafIdx, leaf, regionKey) {
        // W6 — die Karte zeichnet in der EINEN globalen Atlas-Gruppe (leaf.atlasGruppe), gleich welche Art, Gestalt,
        // Streu oder Setzung: die Schicht wählt die Instanz (aKarte.x).
        const atlasGruppe = leaf && typeof leaf.atlasGruppe === "string" ? leaf.atlasGruppe : null;
        // V18.474 — die EINE Fern-Key-Ableitung VOR jedem Keying: Fern-Leaves (Impostor-Quads/L2)
        // kollabieren von der Region auf die SUPER-REGION (s. _archFernRegionKey — Chokepoint, kein zweiter
        // Ableitungs-Ort).
        regionKey = atlasGruppe ? null : this._archFernRegionKey(name, leaf, regionKey);
        // JEDES Leaf ist eine InstancedMesh: EIN Draw je Leaf × Region, gleich wie viele Platzierungen. Der
        // BatchedMesh-Pfad (bis V18.509) fiel: r184-WebGPU kennt kein Multi-Draw, der Batch gibt je INSTANZ
        // einen drawIndexed aus (WebGPUBackend: Schleife über _multiDrawCount) — gemessen 02.10. an der
        // Mess-Wiese 7 339 Draws je Pass für 58 Batches, ×4 mit den Schatten-Kaskaden 29 191 von 29 943
        // GPU-Befehlen eines Frames.
        if (!this.state.archInstanceGroups) this.state.archInstanceGroups = new Map();
        const regional = regionKey != null && this.state.useRegionFoliageCull !== false;
        // Welle B — ein Bau-Schlüssel ist Studio-Geometrie: ruft der platzierte Bau mit leerem Typ (das Leaf trägt
        // eine Studio-Identität), ist der Leaf-Schlüssel selbst die Gruppe (felsbogen und felsturm teilen zacken).
        const basis = atlasGruppe || (name ? name + "#" + leafIdx : String(leafIdx));
        const key = regional ? basis + "@" + regionKey : basis;
        let g = this.state.archInstanceGroups.get(key);
        if (g) return g;
        const capacity = 16;
        // V18.349 — per-Leaf-Override (der opake Kronen-Kern setzt castShadow:false): ein einzelner
        // Leaf darf den Namen-basierten Schatten-Default überstimmen; sonst der LOD-Default via Name.
        const castShadow = leaf.castShadow !== undefined ? !!leaf.castShadow : this._archGroupCastsShadow(name);
        // DER BAU-SATZ (Welle 6): ist das Leaf ein gesetzter Studio-Bau einer Satz-Art, zeichnet die Gruppe nie selbst —
        // ihr Bereich lebt im Satz ihres Stoffs (`_bauSatzArt`, `_tickBauSatz`).
        const satz = this._bauSatzArt(leaf, regionKey, castShadow);
        // AUSLÖSCHUNGS-WELLE (Feld B) — trägt die Quell-Geometrie LOD-Attribute (aH0 =
        // Baum-Stufen · aKarte = die Karte), bekommt die Gruppe die INSTANZ-FASSADE
        // (per-Instanz-Metrik wie das Studio; s. _lodInstanceFacade).
        const wantsFacade =
            leaf.geom && leaf.geom.attributes && (leaf.geom.attributes.aH0 || leaf.geom.attributes.aKarte);
        const groupGeom = wantsFacade ? this._lodInstanceFacade(leaf.geom, capacity) : leaf.geom;
        const mesh = AnazhRealm._instanzMesh(groupGeom, leaf.mat, capacity);
        mesh.castShadow = castShadow;
        mesh.receiveShadow = true;
        // regional → lokale BBox → die Engine cullt beim Umsehen; global → die Instanz-Wahl je Pass (`_instanzWahlPass`).
        mesh.frustumCulled = regional;
        mesh.userData.archInstanceKey = key;
        // der Rang im Bündel (`_buendelKinderReihe`): die Stufe des Leafs, die Atlas-Karte (fern) zuletzt
        mesh.userData.buendelStufe = atlasGruppe ? 9 : Number.isFinite(leaf.stufe) ? leaf.stufe : 0;
        const wahl = satz ? null : this._instanzWahlArt(leaf, castShadow, regional);
        if (wahl) mesh.userData.instanzWahl = wahl;
        // V18.389 — der Schatten-Zwilling verlässt die Ebene 0 (unsichtbar für die Kamera); er wirft auf der Wurf-Ebene
        // SHADOW_TWIN_LAYER, die sein `castShadow` trägt (K72, `_wurfEbene`). Kein FOLIAGE_LAYER (kein Laub-Pass-Mitglied).
        if (leaf.shadowTwin) mesh.layers.disable(0);
        else this._markFoliageLayer(mesh, regionKey, regional); // Subsystem 5: Laub bekommt ZUSÄTZLICH die FOLIAGE_LAYER
        // Auch die REGIONALE InstancedMesh-Gruppe hängt in der Region-BundleGroup; jede Mutation (Alloc/Free/
        // Slot-Stempel/Matrix/Grow) läuft durch die Chokepoints mit _archMeshBundleTouch. Tür-Flügel
        // (leaf.tuer) bleiben DRAUSSEN (per-Frame-Matrizen, _tickTorFluegel). GLOBALE Gruppen ziehen in EIN
        // "@global"-Bundle: der Key matcht das Kugel-Regex nicht → keine cullSphere → immer sichtbar,
        // Submit ≈ 0. Nicht-WebGPU/Kill-Switch → Szene-Pfad.
        // Eine Satz-Gruppe hängt nirgends: sie ist Slot-Wahrheit und Raycast-Ziel, gezeichnet wird ihr Bereich im Satz.
        // Die Wahl-Gruppen (Welle 7: die Pflanzen-Stufen und die EINE Atlas-Gruppe der Karten) ziehen in EIN eigenes
        // "@wahl"-Bundle: ändert der Blick die Wahl, nimmt das Hauptbild nur sie neu auf, nie die übrigen globalen Gruppen.
        const bundle =
            !leaf.tuer && !satz ? this._archRegionBundleFor(regional ? regionKey : wahl ? "@wahl" : "@global") : null;
        if (satz) {
            mesh.frustumCulled = false;
            mesh.userData.bauSatz = satz;
        } else if (bundle) {
            mesh.frustumCulled = false; // der Region-Cull wandert auf die Bundle-Sichtbarkeit
            mesh.matrixAutoUpdate = false; // STATISCH (E-Bauart): die Lage der Gruppe liegt in ihren Instanz-Matrizen
            bundle.add(mesh);
            AnazhRealm._buendelKinderReihe(bundle, this._buendelAuge);
            bundle.needsUpdate = true; // ein Bürger ohne fertige Pipeline: die Erst-Zeichnung nimmt neu auf, wenn sie steht
        } else if (this.state.scene) this.state.scene.add(mesh);
        // slotRef: Slot-Index → die Slot-Marke {key, slot} (der Rückverweis des Umzugs, `_archGroupAlloc`); slotEntry:
        // Slot-Index → Architektur-Eintrag (der Crosshair-Raycast). Leer geboren: count 0, unsichtbar, bis der erste Bewohner kommt.
        AnazhRealm._instanzZahl(mesh, 0);
        g = {
            key,
            mesh,
            geom: groupGeom,
            mat: leaf.mat,
            capacity,
            liveCount: 0,
            slotRef: [],
            slotEntry: [],
            castShadow,
            regional,
            shadowTwin: !!leaf.shadowTwin, // V18.389 — Growth muss die Layer neu setzen
            tuer: leaf.tuer || null, // V18.465 — Tür-Flügel-Scharnier (Template-Raum)
            satz, // Welle 6 — die Satz-Art (null = die Gruppe zeichnet selbst)
            wahl, // Welle 7 — "haupt" | "schatten": die Instanz-Wahl je Pass (null = die Gruppe zeichnet jede Instanz)
            // das Fenster der Blende: der Stufen-Stempel (1 · 2 · 3) oder "karte" (die Einblendung des Billboards)
            wahlStufe: wahl ? (atlasGruppe ? "karte" : leaf.geom.attributes.aLodLevel.array[0]) : 0,
        };
        if (wahl) this._instanzWahlGruppen().add(g);
        // Nur im NEU-Gruppen-Zweig (nicht in _archInstanceGroupGrow → g-Identität
        // bleibt): der Ref-Zähler der Cache-Gruppe steigt um 1, solange eine lebende InstancedMesh-Gruppe ihre
        // geteilte Geometrie hält; _disposeArchInstanceGroup dekrementiert 1:1.
        if (leaf && leaf._srcGroup) {
            g._foundrySrc = leaf._srcGroup;
            leaf._srcGroup._liveRefs = (leaf._srcGroup._liveRefs || 0) + 1;
        }
        this.state.archInstanceGroups.set(key, g);
        this._archGruppenMintMerke(key); // CHURN-LINSE (18.07.) — s. _archGruppenMintMerke
        return g;
    }

    // CHURN-LINSE: die zwei Gruppen-Münz-Chokepoints zählen Mints, der Disposer Tode; ein kleiner Ring
    // merkt die letzten Schlüssel MIT Wiederkehr-Zähler → der Export nennt die KONKRETE Familie, die im
    // Kreis stirbt und wiederaufersteht (Re-Mints kosten Pipeline-Einträge + volle Matrix-Uploads).
    _archGruppenMintMerke(key) {
        this._archGruppenMints = (this._archGruppenMints || 0) + 1;
        let m = this._archGruppenMintMap;
        if (!m) m = this._archGruppenMintMap = new Map();
        m.set(key, (m.get(key) || 0) + 1);
        // Bounded: der Sweep läuft AMORTISIERT (alle 256 Mints, nicht O(size) je Mint), Einmal-Mints fallen
        // zuerst; bei > 6144 Wiederkehrern hält der harte Fallback nur die Top-256.
        if (m.size > 4096 && (this._archGruppenMints & 255) === 0) {
            for (const [k, n] of m) {
                if (n <= 1) m.delete(k);
                if (m.size <= 2048) break;
            }
            if (m.size > 6144) {
                const top = Array.from(m.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 256);
                m.clear();
                for (const [k, n] of top) m.set(k, n);
            }
        }
    }
    // Die Top-Wiederkehrer (Mint-Zahl ≥ 2) — der Export-Leser.
    _archGruppenChurnZensus() {
        const m = this._archGruppenMintMap;
        const top = [];
        if (m) {
            for (const [k, n] of m) if (n >= 2) top.push({ key: k, mints: n });
            top.sort((a, b) => b.mints - a.mints);
        }
        return {
            mints: this._archGruppenMints || 0,
            tode: this._archGruppenDisposes || 0,
            wiederkehrer: top.length,
            top: top.slice(0, 10).map((t) => ({ key: String(t.key).slice(0, 64), mints: t.mints })),
        };
    }

    // Kapazität verdoppeln: neue InstancedMesh, alte Matrizen kopieren.
    _archInstanceGroupGrow(g) {
        const newCap = g.capacity * 2;
        this._lodFacadeGrow(g.geom, newCap); // AUSLÖSCHUNGS-WELLE (Feld B) — Instanz-Attribute mitziehen
        const next = AnazhRealm._instanzMesh(g.geom, g.mat, newCap);
        next.castShadow = g.castShadow !== false; // V18.265 — Schatten-Distanz mitführen
        next.receiveShadow = true;
        next.frustumCulled = g.regional === true; // V18.300 — regionale Gruppen cullen weiter
        next.userData.archInstanceKey = g.key;
        next.userData.buendelStufe = g.mesh.userData.buendelStufe;
        if (g.satz) next.userData.bauSatz = g.satz; // Welle 6 — die Satz-Gruppe bleibt ohne Eltern (der Satz zeichnet)
        if (g.wahl) next.userData.instanzWahl = g.wahl; // Welle 7 — die Instanz-Wahl je Pass reist mit
        // V18.389 — die Layer-Zuordnung des Schatten-Zwillings mitführen (sonst kippt der gewachsene
        // Mesh auf Layer 0 zurück → sichtbar für die Kamera). Nur der Zwilling braucht das; die Laub-
        // Layer bleibt wie im bestehenden Growth-Pfad (unberührt). Den Wurf trägt `castShadow` (oben, K72 `_wurfEbene`).
        if (g.shadowTwin) next.layers.disable(0);
        // Die lebenden Instanzen liegen dicht in [0, liveCount) (`_archGroupFree` verdichtet) — nur sie reisen mit.
        const n = g.liveCount || 0;
        const tmp = this._archTmpCopyM || (this._archTmpCopyM = new THREE.Matrix4());
        for (let i = 0; i < n; i++) {
            g.mesh.getMatrixAt(i, tmp);
            next.setMatrixAt(i, tmp);
        }
        // Beim Wachstum den instanceColor-Buffer (lazy von setColorAt) aller Slots mitkopieren — sonst kippen
        // alle Bäume auf default-Weiß.
        if (g.mesh.instanceColor) {
            const tmpC = this._archTmpCopyColor || (this._archTmpCopyColor = new THREE.Color());
            for (let i = 0; i < n; i++) {
                g.mesh.getColorAt(i, tmpC);
                next.setColorAt(i, tmpC);
            }
            if (next.instanceColor) next.instanceColor.needsUpdate = true;
        }
        AnazhRealm._instanzZahl(next, n);
        next.instanceMatrix.needsUpdate = true;
        // SUBMIT-WAL — parent-bewusster Swap (die scene.remove-Falle): eine regionale
        // Gruppe hängt in ihrer Region-BundleGroup — der gewachsene Mesh bleibt im
        // SELBEN Parent, das Bundle re-recorded (der alte Mesh referenziert tote Buffer).
        const parent = g.mesh.parent;
        if (parent) {
            parent.remove(g.mesh);
            parent.add(next);
            if (parent.isBundleGroup) {
                next.matrixAutoUpdate = false; // STATISCH wie die Gruppe vor ihr (E-Bauart)
                AnazhRealm._buendelKinderReihe(parent, this._buendelAuge);
                parent.needsUpdate = true;
            }
        } else if (!g.satz && this.state.scene) this.state.scene.add(next);
        this._instanzAbschied(g.mesh); // die eigenen Instanz-Puffer verlassen die GPU (geom/mat geteilt → bleiben)
        g.mesh = next;
        g.capacity = newCap;
    }

    // DER EINE SLOT-CHOKEPOINT (Belegen · Freigeben): die lebenden Instanzen einer Gruppe liegen DICHT in
    // [0, liveCount), `mesh.count` IST liveCount — einen freien Slot gibt es nicht, eine leere Hülle zeichnet nicht
    // (count 0, unsichtbar — in keinem Pass, auch nicht in der Gnadenfrist). Befund 05.10. (Radeon 890M, Mess-Wiese,
    // drei Schleifen à 1,2 km): die Free-Liste hielt count am Höchststand, die Null-3×3 lief durch jeden Vertex-Shader
    // — 890 freie Slots mit 1,73 M Dreiecken in 202 Gruppen, 92 leere Hüllen zeichneten 0,99 M Dreiecke ins Hauptbild.
    // Belegen hängt an das Ende; die Rückgabe ist die SLOT-MARKE {key, slot} (`g.slotRef[slot]`, der Rückverweis des
    // Umzugs; `g.slotEntry[slot]` trägt den Architektur-Eintrag für den Raycast, Streu null). Wer eine Marke hält, liest
    // `slot` frisch: Freigeben zieht die letzte Instanz in die Lücke und schreibt ihre Marke um.
    _archGroupAlloc(g, entry) {
        const slot = g.liveCount || 0;
        if (slot >= g.capacity) this._archInstanceGroupGrow(g);
        const ref = { key: g.key, slot };
        g.slotRef[slot] = ref;
        g.slotEntry[slot] = entry || null;
        g.liveCount = slot + 1;
        g.slotStand = (g.slotStand | 0) + 1; // der Slot-Stand (`_instanzSlotStand`): jede Wahl eines Passes wählt neu
        AnazhRealm._instanzZahl(g.mesh, g.liveCount);
        // SUBMIT-WAL — der Aufrufer schreibt gleich Matrix/Farbe in diesen Slot
        // (synchron, vor dem nächsten Render): das Region-Bundle re-recorden.
        if (!g.mesh.__arena) this._archMeshBundleTouch(g.mesh); // eine Arena liest Zahl und Puffer im Takt (G1)
        g._leerSeit = 0; // GNADENFRIST — ein Bewohner kehrt zurück: die Hülle lebt, kein Re-Mint
        return ref;
    }

    // Freigeben = verdichten: die LETZTE lebende Instanz zieht in die Lücke (`_instanzUmzug`: Matrix, Farbe, die
    // Instanz-Attribute der Fassade) und ihre Marke mit; count sinkt. Eine Marke, die in dieser Gruppe nicht (mehr)
    // lebt — doppelt freigegeben, oder ihre Gruppe fiel und wurde neu gemünzt —, gibt nichts frei (false): sie
    // besitzt hier keinen Slot.
    _archGroupFree(g, ref) {
        const slot = ref ? ref.slot : -1;
        if (!(slot >= 0) || g.slotRef[slot] !== ref) return false;
        const letzt = g.liveCount - 1;
        if (slot !== letzt) {
            AnazhRealm._instanzUmzug(g.mesh, letzt, slot);
            const zieht = g.slotRef[letzt];
            zieht.slot = slot;
            g.slotRef[slot] = zieht;
            g.slotEntry[slot] = g.slotEntry[letzt];
        }
        g.slotRef[letzt] = null;
        g.slotEntry[letzt] = null;
        ref.slot = -1;
        g.liveCount = letzt;
        g.slotStand = (g.slotStand | 0) + 1; // der Slot-Stand (`_instanzSlotStand`)
        AnazhRealm._instanzZahl(g.mesh, letzt);
        if (!g.mesh.__arena) this._archMeshBundleTouch(g.mesh); // SUBMIT-WAL — count-/Matrix-Mutation → Bündel neu (eine Arena liest sie im Takt, G1)
        // V12.0-perf.e-fix — boundingSphere invalidieren: InstancedMesh.raycast
        // (Crosshair-Pick) sphere-cullt gegen die gecachte Bounding; ohne Reset
        // verfehlt der Raycast Instanzen, die nach dem letzten Cache dazukamen.
        g.mesh.boundingSphere = null;
        return true;
    }

    // Zwei lebende Slots tauschen ihre Bewohner — Instanz-Größen, Marken (die Halter lesen `slot` frisch) und Einträge.
    _archGroupTausch(g, a, b) {
        // der Tausch der Wahl zählt, um wie viel er die Versionen hebt (der Slot-Stand zieht es ab, `_instanzSlotStand`)
        const im = g.mesh.instanceMatrix;
        const ak = g.mesh.geometry.attributes.aKarte;
        const v = im.version,
            vk = ak ? ak.version : 0;
        AnazhRealm._instanzTausch(g.mesh, a, b);
        g._ordnung = (g._ordnung | 0) + 1; // die Ordnung der Slots (die Wahl eines Passes merkt sie, `_instanzWahlSteht`)
        g._tauschMat = (g._tauschMat | 0) + (im.version - v);
        if (ak) g._tauschKarte = (g._tauschKarte | 0) + (ak.version - vk);
        const ra = g.slotRef[a],
            rb = g.slotRef[b];
        ra.slot = b;
        rb.slot = a;
        g.slotRef[a] = rb;
        g.slotRef[b] = ra;
        const e = g.slotEntry[a];
        g.slotEntry[a] = g.slotEntry[b];
        g.slotEntry[b] = e;
    }

    // DER UMZUG EINER INSTANZ (Verdichten): alles, was je Slot reist, rückt von `von` nach `nach` — die Matrix, die
    // Farbe und die Instanz-Attribute der LOD-Fassade (`LOD_INSTANZ_ATTRIBUTE`, nur wo die Geometrie die Fassade der
    // Gruppe ist; eine geteilte Quell-Geometrie trägt keine Instanz-Werte). Die EINE Liste der Instanz-Größen für jede
    // verdichtende Senke (Instanz-Gruppen · Fundament-Pool). Volle Uploads (needsUpdate ohne Bereich): ein Bereich
    // schnitte die Schreiber desselben Frames ab.
    static _instanzUmzug(mesh, von, nach) {
        const im = mesh.instanceMatrix;
        im.array.copyWithin(nach * 16, von * 16, von * 16 + 16);
        im.needsUpdate = true;
        const ic = mesh.instanceColor;
        if (ic) {
            ic.array.copyWithin(nach * 3, von * 3, von * 3 + 3);
            ic.needsUpdate = true;
        }
        const geo = mesh.geometry;
        if (geo && geo.userData && geo.userData._lodFacade)
            for (const k in AnazhRealm.LOD_INSTANZ_ATTRIBUTE) {
                const a = geo.attributes[k];
                if (!a || !a.isInstancedBufferAttribute) continue;
                const s = a.itemSize;
                a.array.copyWithin(nach * s, von * s, von * s + s);
                a.needsUpdate = true;
            }
    }
    // DER TAUSCH ZWEIER INSTANZEN (die Instanz-Wahl je Pass ordnet ihre Gruppe): dieselbe Liste der Instanz-Größen wie
    // der Umzug, in beide Richtungen.
    static _instanzTausch(mesh, a, b) {
        const tausch = (attr, n) => {
            if (!attr) return;
            const x = attr.array;
            for (let j = 0, ia = a * n, ib = b * n; j < n; j++, ia++, ib++) {
                const t = x[ia];
                x[ia] = x[ib];
                x[ib] = t;
            }
            attr.needsUpdate = true;
        };
        tausch(mesh.instanceMatrix, 16);
        tausch(mesh.instanceColor, 3);
        const geo = mesh.geometry;
        if (geo && geo.userData && geo.userData._lodFacade)
            for (const k in AnazhRealm.LOD_INSTANZ_ATTRIBUTE) {
                const at = geo.attributes[k];
                if (at && at.isInstancedBufferAttribute) tausch(at, at.itemSize);
            }
    }

    // Die EINE Fern-Key-Ableitung: trägt ein Leaf die FERN-Stufe (Impostor `fimp:` · Foundry-L2 `f:…|2|…`
    // · Grammatik `_lod2` · Streu `fscatter:…:2`), mappt sein Region-Key auf die SUPER-REGION (4×4, Marker
    // `s:`) — camera-facing Quads nutzen den Region-Cull kaum. Der platzierte Bau ist global (null-Key, Welle B);
    // BAUM-Streu bleibt global (null-Key). Ein Super-Key ist über Regionen GETEILT: _disposeScatterRegion
    // räumt nur den eigenen `@regX,regZ`-Suffix, die Empty-Dispose (`_archInstanceRemove`) den Rest.
    _archFernRegionKey(name, leaf, regionKey) {
        if (regionKey == null) return regionKey;
        const lk = leaf && typeof leaf.leafKey === "string" ? leaf.leafKey : "";
        const fern =
            lk.startsWith("fimp:") ||
            /^f:[^|]*\|\d+\|2[|:]/.test(lk) ||
            (typeof name === "string" && (name.endsWith("_lod2") || /^fscatter:.*:2$/.test(name)));
        if (!fern) return regionKey;
        const S = AnazhRealm.SCATTER_FERN_SUPERREGION;
        if (!(Number.isFinite(S) && S > 1)) return regionKey; // S=1 = das alte per-Region-Keying (A/B-Hebel der Linse)
        const m = /^(-?\d+),(-?\d+)$/.exec(String(regionKey));
        if (!m) return regionKey; // schon gemappt (s:) oder fremdes Format → unberührt (idempotent)
        return "s:" + Math.floor(Number(m[1]) / S) + "," + Math.floor(Number(m[2]) / S);
    }

    // Die EINE Slot-Farbe (Chokepoint von _archInstanceAdd + _scatterInstanceAdd): Part-Farbe (leaf.tint)
    // × Entry-/Streu-Tint (useInstanceTint); null = kein Farb-Write (Buffer bleibt un-alloziert). Beide
    // MULTIPLIZIEREN auf den colorNode (neutral WEISS); leaf.tint via setHex (sRGB→linear), Tint roh.
    _archSlotColor(leaf, entryTint) {
        const useTint = !!(leaf.mat && leaf.mat.userData && leaf.mat.userData.useInstanceTint);
        const leafTint = leaf.tint;
        if (leafTint === undefined && !useTint) return null;
        const c = this._archTmpSlotColor || (this._archTmpSlotColor = new THREE.Color());
        if (leafTint !== undefined) c.setHex(leafTint);
        else c.setRGB(1, 1, 1);
        if (useTint && entryTint) c.multiply(entryTint);
        return c;
    }

    // ═══ DIE WEGE-KARTE (V18.530): Siedlungs-Wege sind BODEN, kein Bauwerk ═══
    // Befund 04.10. (Blick-Tour 1-nord · 3-markt · 4-west, echte GPU): Straßen, Feldwege, Platz und Äcker lagen als
    // flache Box-Streifen (0,14 m) auf der Gesetz-Höhe — der sichtbare Boden (Surface-Nets, ±0,2 m) schnitt sie:
    // harte Kanten, schwarze Linien zwischen den gekippten Segmenten (die Stirnflächen des nächsten Streifens),
    // Gras stach durch, am Ring-Rand schwebten sie über der Leere. Jetzt trägt der Boden den Weg: eine welt-
    // verankerte Karte um den Spieler (R = getretene Erde, G = Acker), weich gerändert aus dem Kapsel-/Kasten-
    // Abstand, gelesen vom Boden-Shader (`_terrainGeologyAlbedo`: die Pfad-Erde der Boden-Palette, nur auf
    // Begehbarem) und von der Wiese (`_pfadFeldAt`: kein Halm auf dem Weg) — DIESELBEN Bytes sind GPU-Textur
    // und CPU-Leser. Die Formen (Segmente, Plätze, Äcker) bleiben je Siedlung gemerkt; ein Fenster-Umzug malt neu.
    // DIE CLIPMAP (Integration 05.10.): EIN Fenster von 512 m sicherte mit dem Umzug ab 128 m nur ~120 m — zwischen
    // 120 m und der Ring-Kante (194 m) fielen Wege weg und poppten beim Umzug (der alte Pool zeichnete jede Siedlung).
    // Zwei Stufen (`WEGE_KARTE.stufen`): NAH 0,5-m-Texel bis 208 m, FERN 2-m-Texel bis 768 m (der größte Chunk-Ring
    // reicht 540 m); Boden-Shader und CPU-Leser wählen dieselbe Stufe nach derselben Grenze (`_wegeStufeNah`).
    _wegeKarteEnsure() {
        const st = this.state;
        if (st.wegeKarte) return st.wegeKarte;
        if (typeof THREE === "undefined") return null;
        const W = AnazhRealm.WEGE_KARTE;
        const TSL = THREE.TSL;
        // DIE SCHICHTEN EINER KARTE (Karte W2, 16.10.): Wege, Kronen-Streu und Flüsse tragen je Art EINE Array-Textur, die
        // Schicht ist die Stufe (nah 0, fern 1) — jede Stufe trägt dasselbe Raster (nah 512 m / 0,5 m = fern 2048 m / 2 m).
        // Bis 16.10. band jede Stufe eigene Texturen: der Naht-Stoff des Fern-Rings zählte 17 Sampler und linkte auf WebGL2
        // (16 Einheiten) nie, der Rückfall zeichnete keinen Boden (gate:webgl-probe W6). `daten` jeder Stufe ist die Sicht
        // auf ihre Schicht (dieselben Bytes für GPU und CPU-Leser); ein Upload trägt nur die Schicht (`_wegeSchichtHoch`).
        const raster = (texelM) => {
            const n = W.stufen.map((S, si) => Math.round(S.fensterM / texelM[si]));
            if (n.some((x) => x !== n[0]))
                throw new Error(`Wege-Karte: die Stufen tragen verschiedene Raster (${n.join(" ≠ ")}) — EINE Array-Textur trägt eines`); // prettier-ignore
            return n[0];
        };
        const karte = (n, kanaele, format, name) => {
            const tex = new THREE.DataArrayTexture(
                new Uint8Array(n * n * kanaele * W.stufen.length),
                n,
                n,
                W.stufen.length
            );
            tex.format = format;
            tex.type = THREE.UnsignedByteType;
            tex.name = name;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.generateMipmaps = false;
            tex.needsUpdate = true;
            return { tex, schicht: (si) => tex.image.data.subarray(si * n * n * kanaele, (si + 1) * n * n * kanaele) };
        };
        const N = raster(W.stufen.map((S) => S.texelM));
        const kN = raster(AnazhRealm.LAUB_STREU.texelM);
        const wege = karte(N, 2, THREE.RGFormat, "wege-karte");
        const streu = karte(kN, 1, THREE.RedFormat, "kronen-streu");
        const fluesse = karte(N, 1, THREE.RedFormat, "fluss-karte");
        const stufen = W.stufen.map((S, si) => {
            const daten = wege.schicht(si);
            const tex = wege.tex;
            // DIE KRONEN-STREU dieser Stufe: dasselbe Fenster, dieselbe Mitte (also dasselbe UV), eigenes Raster.
            // `summe` ist die Wahrheit (die ungekappte Summe aller Kronen-Beiträge je Texel — eine Krone fällt exakt
            // heraus), `daten` ihr gekapptes Abbild für die Karte, nachgezogen im Schmutz-Rechteck beim Upload.
            const kronen = {
                N: kN,
                summe: new Uint16Array(kN * kN),
                daten: streu.schicht(si),
                tex: streu.tex,
                schmutz: null,
                upload: 0,
            };
            const U = this._uniformHeimatTeilen({
                mitte: TSL.uniform(new THREE.Vector2(0, 0)),
                groesse: TSL.uniform(S.fensterM),
            });
            // DIE FLUSS-KARTE dieser Stufe (K16, die Naht des Wassers): dasselbe Fenster, dasselbe Raster wie die Wege — je Texel
            // der Anteil, den das Wasser eines Flusses deckt (`_flussKarteMalen`, dieselben Segmente und Breiten wie
            // `_fernFlussDeckung`). Der Fern-Ring liest sie je Fragment (`_flussKarteNode`): ein 4–17 m breiter Fluss
            // trägt seine Kante im Bild statt im Kasten-Mittel seiner Masche (6–24 m).
            const fluss = { daten: fluesse.schicht(si), tex: fluesse.tex, hydroN: -1 };
            return { S, N, schicht: si, daten, tex, kronen, fluss, U, mitteX: 0, mitteZ: 0, zentriert: false };
        });
        // `kronen` ist das Register (Schlüssel → [x, z, Radius]), `kronenZellen` sein Raum-Index (`LAUB_STREU.zelleM`-
        // Zellen → die Kronen darin), `kronenRandMax` der größte Laub-Rand im Register (der Umzug fragt um ihn weiter).
        // `raeumen`: die neuen Flächen, deren schon gewachsene Natur der Takt räumt (`_wegeRaeumen`, K52).
        st.wegeKarte = {
            stufen,
            siedlungen: [],
            raeumen: [],
            kronen: new Map(),
            kronenZellen: new Map(),
            kronenRandMax: 0,
        };
        return st.wegeKarte;
    }

    // Der EINE Upload einer Schicht der Wege-Karten: r184 lädt bei `layerUpdates` nur die genannten Schichten hoch, sonst
    // alle — darum nennt JEDER Schreiber seine, sonst trüge ein fremder Upload im selben Bild nur die fremde Schicht.
    _wegeSchichtHoch(tex, schicht) {
        tex.addLayerUpdate(schicht);
        tex.needsUpdate = true;
    }

    // ═══ DIE KRONEN-STREU (Welle 5 Boden): der Waldboden liegt unter den ECHTEN Kronen ═══
    // Befund 05.10. (echte GPU, Mess-Wiese, 207 Bäume gegen das Feld): die Laubstreu folgte dem Kronenlicht-Feld
    // (`_canopyLightAt`, der Platzierungs-Bestand) — die Bäume stehen aber nach `lebendig` (Baum-Streu) und dem
    // Wald-Generator (Bestandsdichte, Kronen-Schüchternheit, Kappen): wo das Feld „geschlossen" sagte (Licht 0,2–0,4)
    // stand im 10-m-Kreis 0,01 Baum, und die Streu lag als braune Steppe in der offenen Wiese. Jetzt malt JEDE
    // stehende Krone (Radius `_kronenRadiusFuer`: `FOREST.crown[art] × Skala`, dieselbe Zahl wie die Kronen-
    // Schüchternheit) eine weiche Scheibe in die Kronen-Karte jeder Wege-Stufe; der Boden-Stoff mischt dort die
    // Laubstreu der Palette (`_wegeBodenFarbe`), die Nah-Wiese lichtet dort ihre Halme. Das Register ist der Bestand:
    // ein Wald-Baum trägt sich ein, wo er als Eintrag entsteht und fällt (`spawnArchitecture` · `removeArchitecture`,
    // `a:<id>` — Pflanzung, Promotion UND der Reload des Zweit-Boots), eine Streu-Baum-Zelle, wo ihre Region sie zeichnet
    // und entsorgt (`s:<schicht>:<zelle>`). NUR diese Haken tragen aus — kein Umzug vergisst eine Krone: bis 06.10.
    // vergaß der Umzug der fernen Stufe alles jenseits ihres Fensters, auch die Eintrags-Kronen, die nur beim Entstehen
    // eintragen; wer > 1 km lief und zurückkam, fand unter jedem Eintrags-Baum (Mess-Wiese: 722 von 789 Kronen) bis zum
    // Reload keine Streu. Der Raum-Index (`kronenZellen`) bindet die Kosten des Umzugs an den Streifen, nie an den Bestand.
    _kronenStreuNeu(schluessel, x, z, radius) {
        const wk = this._wegeKarteEnsure();
        if (!wk || !(radius > 0)) return;
        // Dieselbe Krone zweimal (eine Region baut neu) malt nicht doppelt; eine GEÄNDERTE fällt erst heraus.
        const alt = wk.kronen.get(schluessel);
        if (alt && alt[0] === x && alt[1] === z && alt[2] === radius) return;
        if (alt) this._kronenStreuWeg(schluessel);
        const c = [x, z, radius];
        wk.kronen.set(schluessel, c);
        const zk = AnazhRealm._kronenZelle(x, z);
        let zelle = wk.kronenZellen.get(zk);
        if (!zelle) wk.kronenZellen.set(zk, (zelle = new Map()));
        zelle.set(schluessel, c);
        wk.kronenRandMax = Math.max(wk.kronenRandMax, radius * AnazhRealm.LAUB_STREU.rand);
        for (const stufe of wk.stufen) if (stufe.zentriert) this._kronenStreuMale(stufe, x, z, radius, null, 1);
        // Die erste Krone zentriert die Karte sofort (wie die erste Siedlung), sonst läse der Neubau der Wiese noch 0.
        const pm = this.state.playerMesh;
        if (pm && wk.stufen.some((s) => !s.zentriert)) this._tickWegeKarte(pm.position);
        this._kronenStreuWiese(x, z, radius);
    }

    // Eine Krone fällt (der Baum ist gefällt, abgebaut oder seine Streu-Region entsorgt): ihr Beitrag fällt EXAKT aus
    // jeder zentrierten Stufe (die Summe kennt ihn), die Wiese darunter wächst neu.
    _kronenStreuWeg(schluessel) {
        const wk = this.state.wegeKarte;
        const c = wk && wk.kronen.get(schluessel);
        if (!c) return;
        wk.kronen.delete(schluessel);
        const zk = AnazhRealm._kronenZelle(c[0], c[1]);
        const zelle = wk.kronenZellen.get(zk);
        if (zelle && zelle.delete(schluessel) && zelle.size === 0) wk.kronenZellen.delete(zk);
        for (const stufe of wk.stufen) if (stufe.zentriert) this._kronenStreuMale(stufe, c[0], c[1], c[2], null, -1);
        this._kronenStreuWiese(c[0], c[1], c[2]);
    }

    // Der Schlüssel der Index-Zelle (Kante `LAUB_STREU.zelleM`), in der der Kronen-Mittelpunkt (x, z) liegt.
    static _kronenZelle(x, z) {
        const Z = AnazhRealm.LAUB_STREU.zelleM;
        return Math.floor(x / Z) + "," + Math.floor(z / Z);
    }

    // Nah-Wiese und Nah-Streu lesen das Licht derselben Kronen (`_bodenLichtFeld`): ihre Kacheln, so weit Streu ODER
    // Schatten einer geänderten Krone reichen, fallen und wachsen neu — so weit der WEITERE der beiden Ringe um ihre EINE
    // Mitte (die Kamera, `_tickNahWiese` · `_tickNahStreu`) reicht; weiter weg steht keine Kachel. Bis K70-N1 galt die
    // Reichweite der Wiese (27 m) um den Spieler: die Streu-Kacheln am Ringrand (bis 35 m) behielten das alte Licht.
    _kronenStreuWiese(x, z, radius) {
        const mitte = this.state.camera
            ? this.state.camera.position
            : this.state.playerMesh && this.state.playerMesh.position;
        if (!mitte) return;
        const U = AnazhRealm.UNDERGROWTH;
        const a = radius * Math.max(AnazhRealm.LAUB_STREU.rand, U.kronenSigma * Math.sqrt(U.kronenQMax));
        const reich = (R) => R.radius + R.rand + R.kachel * 1.5;
        if (
            Math.hypot(x - mitte.x, z - mitte.z) - a <
            Math.max(reich(AnazhRealm.NAH_WIESE), reich(AnazhRealm.NAH_STREU))
        )
            this._nahWieseNeuIn(x - a, z - a, x + a, z + a);
    }

    // Der EINE Kronen-Radius eines Wald-Baums: wie der Wald-Generator (phyto-core planForestCell) `FOREST.crown[art] ×
    // Skala`, eine Auto-Art des Buchs ohne Kronen-Eintrag 4 m × Skala; null für alles, was kein Wald-Baum ist.
    _kronenRadiusFuer(type, scale) {
        const s = Number.isFinite(scale) && scale > 0 ? scale : 1;
        const kc = AnazhRealm.FOREST.crown[type];
        if (kc) return kc * s;
        for (const e of this._forestExtraSpecies()) if (e.species === type) return 4.0 * s;
        return null;
    }

    // Eine Krone in EINE Stufe malen: `dichte` bis `kern` × Radius, weich (smoothstep) bis `rand` × Radius; die Kronen
    // SUMMIEREN sich (gekappt) — unter einer einzelnen Krone dringt noch Gras durch, wo Kronen sich schließen, deckt
    // die Streu den ganzen Grund (die Karte kappt bei 1, die Summe darunter nicht). `ausschnitt` [i0, i1, j0, j1] (Texel,
    // inklusive) begrenzt das Malen auf den Streifen, den ein Umzug frisch freilegt; `vorzeichen` −1 nimmt die Krone
    // wieder heraus (dieselben gerundeten Beiträge, also exakt).
    _kronenStreuMale(stufe, x, z, radius, ausschnitt, vorzeichen) {
        const K = AnazhRealm.LAUB_STREU;
        const kr = stufe.kronen;
        const N = kr.N;
        const t = stufe.S.fensterM / N;
        const x0w = stufe.mitteX - stufe.S.fensterM / 2;
        const z0w = stufe.mitteZ - stufe.S.fensterM / 2;
        const aussen = radius * K.rand;
        const innen = radius * K.kern;
        const a = ausschnitt || [0, N - 1, 0, N - 1];
        const i0 = Math.max(a[0], Math.floor((x - aussen - x0w) / t));
        const i1 = Math.min(a[1], Math.ceil((x + aussen - x0w) / t));
        const j0 = Math.max(a[2], Math.floor((z - aussen - z0w) / t));
        const j1 = Math.min(a[3], Math.ceil((z + aussen - z0w) / t));
        if (i1 < i0 || j1 < j0) return;
        const s = kr.summe;
        const D = K.dichte * 255;
        const sg = vorzeichen < 0 ? -1 : 1;
        for (let j = j0; j <= j1; j++) {
            const pz = z0w + (j + 0.5) * t - z;
            for (let i = i0; i <= i1; i++) {
                const px = x0w + (i + 0.5) * t - x;
                let q = (aussen - Math.hypot(px, pz)) / (aussen - innen);
                if (q <= 0) continue;
                q = q >= 1 ? 1 : q * q * (3 - 2 * q);
                s[j * N + i] += sg * Math.round(q * D);
            }
        }
        AnazhRealm._kronenSchmutz(kr, i0, i1, j0, j1);
    }

    // Das Schmutz-Rechteck der Kronen-Karte wächst um [i0, i1] × [j0, j1]; der Upload zieht dort `daten` aus `summe` nach.
    static _kronenSchmutz(kr, i0, i1, j0, j1) {
        const r = kr.schmutz;
        kr.schmutz = r
            ? [Math.min(r[0], i0), Math.max(r[1], i1), Math.min(r[2], j0), Math.max(r[3], j1)]
            : [i0, i1, j0, j1];
    }

    // Der Umzug der Kronen-Karte einer Stufe (Lehre 25: die Kosten tragen, was sich ändert, nie das Register): das
    // Raster VERSCHIEBT sich um den Umzug (die Mitte rastet auf ganze Texel), gemalt wird nur der Streifen, den der
    // Umzug freilegt, aus den Kronen, die ihn berühren. Bis 06.10. leerte jeder Umzug die Karte und malte das ganze
    // Register neu (Mess-Wiese: 1078 Kronen, 230k Texel je Nah-Umzug alle 48 m Weg, synchron im Takt). Voll gemalt wird
    // nur ohne alte Mitte oder bei einem Sprung über das Fenster. Gefragt werden nur die Kronen der Index-Zellen am
    // Streifen (`kronenZellen`, um den größten Laub-Rand erweitert) — das Register bleibt der ganze Bestand.
    _kronenStreuUmzug(stufe, war) {
        const wk = this.state.wegeKarte;
        const kr = stufe.kronen;
        const N = kr.N;
        const t = stufe.S.fensterM / N;
        const hk = stufe.S.fensterM / 2;
        const di = war ? Math.round((stufe.mitteX - war[0]) / t) : N;
        const dj = war ? Math.round((stufe.mitteZ - war[1]) / t) : N;
        const d = kr.summe;
        let streifen;
        if (Math.abs(di) >= N || Math.abs(dj) >= N) {
            d.fill(0);
            streifen = [[0, N - 1, 0, N - 1]];
        } else if (di === 0 && dj === 0) {
            streifen = [];
        } else {
            // neu[j][i] = alt[j + dj][i + di]; die Zeilen-Reihenfolge folgt dem Vorzeichen (nie eine Quelle überschreiben).
            const src0 = Math.max(0, di);
            const dst0 = Math.max(0, -di);
            const len = N - Math.abs(di);
            for (let n = 0; n < N; n++) {
                const j = dj >= 0 ? n : N - 1 - n;
                const sj = j + dj;
                if (sj < 0 || sj >= N) {
                    d.fill(0, j * N, j * N + N);
                    continue;
                }
                d.copyWithin(j * N + dst0, sj * N + src0, sj * N + src0 + len);
                if (di > 0) d.fill(0, j * N + len, j * N + N);
                else if (di < 0) d.fill(0, j * N, j * N + dst0);
            }
            // Die freigelegten Streifen: die Spalten (volle Höhe), dann die Zeilen ohne diese Spalten (keine Ecke doppelt).
            streifen = [];
            const sp = di > 0 ? [N - di, N - 1] : di < 0 ? [0, -di - 1] : null;
            if (sp) streifen.push([sp[0], sp[1], 0, N - 1]);
            const zi0 = di < 0 ? -di : 0;
            const zi1 = di > 0 ? N - di - 1 : N - 1;
            if (dj > 0) streifen.push([zi0, zi1, N - dj, N - 1]);
            else if (dj < 0) streifen.push([zi0, zi1, 0, -dj - 1]);
        }
        if (streifen.length) {
            const x0w = stufe.mitteX - hk;
            const z0w = stufe.mitteZ - hk;
            const rand = AnazhRealm.LAUB_STREU.rand;
            const Z = AnazhRealm.LAUB_STREU.zelleM;
            const R = wk.kronenRandMax;
            // Je Streifen die Index-Zellen, deren Kronen ihn erreichen können (jede Krone liegt in GENAU einer Zelle,
            // die Streifen teilen kein Texel — jede Krone malt jeden Streifen höchstens einmal).
            for (const s of streifen) {
                const zx0 = Math.floor((x0w + s[0] * t - R) / Z);
                const zx1 = Math.floor((x0w + (s[1] + 1) * t + R) / Z);
                const zz0 = Math.floor((z0w + s[2] * t - R) / Z);
                const zz1 = Math.floor((z0w + (s[3] + 1) * t + R) / Z);
                for (let zz = zz0; zz <= zz1; zz++)
                    for (let zx = zx0; zx <= zx1; zx++) {
                        const zelle = wk.kronenZellen.get(zx + "," + zz);
                        if (!zelle) continue;
                        for (const c of zelle.values()) {
                            const aussen = c[2] * rand;
                            if (
                                (c[0] + aussen - x0w) / t >= s[0] &&
                                (c[0] - aussen - x0w) / t <= s[1] + 1 &&
                                (c[1] + aussen - z0w) / t >= s[2] &&
                                (c[1] - aussen - z0w) / t <= s[3] + 1
                            )
                                this._kronenStreuMale(stufe, c[0], c[1], c[2], s, 1);
                        }
                    }
            }
        }
        kr.schmutz = [0, N - 1, 0, N - 1]; // das ganze Abbild zog um
        kr.upload = -Infinity; // nach dem Umzug sofort hochladen
    }

    // Die Kronen-Streu an (x, z) ∈ [0, 1] — bilinear aus DENSELBEN Bytes, die der Boden-Shader liest (dieselbe
    // Stufen-Wahl wie `_wegeFeldAt`). DIE EINE Lese-Stelle für „hier steht Wald": das Kronendach der gepflanzten Bäume
    // (0 offen, 0,6 unter einer Krone, 1 wo Kronen sich schließen) — Boden, Nah-Wiese und Klang lesen sie, nie das
    // Kronenlicht-Feld der Platzierung (`_canopyLightAt` sagt, wo Bäume wachsen DÜRFEN, nicht wo sie stehen).
    _kronenStreuAt(x, z) {
        const wk = this.state.wegeKarte;
        if (!wk) return 0;
        const [nah, fern] = wk.stufen;
        const g = AnazhRealm._wegeStufeNah(nah.N);
        const innen =
            Math.abs((x - nah.mitteX) / nah.S.fensterM) < g && Math.abs((z - nah.mitteZ) / nah.S.fensterM) < g;
        const stufe = innen ? nah : fern;
        if (!stufe.zentriert) return 0;
        const kr = stufe.kronen;
        const N = kr.N;
        const t = stufe.S.fensterM / N;
        const fx = (x - (stufe.mitteX - stufe.S.fensterM / 2)) / t - 0.5;
        const fz = (z - (stufe.mitteZ - stufe.S.fensterM / 2)) / t - 0.5;
        const i = Math.floor(fx);
        const j = Math.floor(fz);
        if (i < 0 || j < 0 || i >= N - 1 || j >= N - 1) return 0;
        const tx = fx - i;
        const tz = fz - j;
        // aus der Summe, gekappt wie die Karte (die `daten` ziehen erst beim gebündelten Upload nach)
        const at = (a, b) => Math.min(255, kr.summe[b * N + a]) / 255;
        return (
            (at(i, j) * (1 - tx) + at(i + 1, j) * tx) * (1 - tz) +
            (at(i, j + 1) * (1 - tx) + at(i + 1, j + 1) * tx) * tz
        );
    }

    // DAS BODENLICHT unter den STEHENDEN Kronen ∈ [0, 1] (1 offen, → 0 geschlossenes Dach) — das Labor-Gesetz
    // (phytogenesis `canopyLight`): je Krone des EINEN Registers (`wegeKarte.kronen`: Mitte, Radius r wie die Kronen-
    // Schüchternheit) die Deckung exp(−q), q = d² / (σ·r)² bis q < qMax, L = exp(−canopyK · Σ Deckung). Gibt den Leser
    // (x, z) → L eines Rechtecks: die Kronen, die es erreichen, sammelt er EINMAL (Lehre 25). Nah-Wiese und Nah-Streu lesen
    // ihn je Kachel; ihre Kacheln wachsen neu, wo eine Krone kommt oder fällt (`_kronenStreuWiese`, bis zur Reichweite des
    // Lichts). Bis K70 lasen beide das Kronenlicht-Feld der Platzierung (`_canopyLightAt`, wo Bäume wachsen DÜRFEN) und die
    // Wiese zusätzlich die Kronen-Karte als Faktor — die Streu-Scheibe (voll bis r, Rand 1,7 r) ist breiter als der Schatten
    // des Labors (an der Kronen-Kante 0,47): am Waldrand der Mess-Wiese dünnte das die offene Wiese auf 0,75 Licht.
    _bodenLichtFeld(x0, z0, x1, z1) {
        const U = AnazhRealm.UNDERGROWTH;
        const wk = this.state.wegeKarte;
        const reichJeR = U.kronenSigma * Math.sqrt(U.kronenQMax);
        const kronen = [];
        if (wk && wk.kronen.size) {
            const R = (wk.kronenRandMax / AnazhRealm.LAUB_STREU.rand) * reichJeR;
            const Z = AnazhRealm.LAUB_STREU.zelleM;
            for (let zz = Math.floor((z0 - R) / Z); zz <= Math.floor((z1 + R) / Z); zz++)
                for (let zx = Math.floor((x0 - R) / Z); zx <= Math.floor((x1 + R) / Z); zx++) {
                    const zelle = wk.kronenZellen.get(zx + "," + zz);
                    if (!zelle) continue;
                    for (const c of zelle.values()) {
                        const reich = c[2] * reichJeR;
                        if (c[0] + reich < x0 || c[0] - reich > x1 || c[1] + reich < z0 || c[1] - reich > z1) continue;
                        const s = U.kronenSigma * c[2];
                        kronen.push(c[0], c[1], 1 / (s * s));
                    }
                }
        }
        return (x, z) => {
            let deckung = 0;
            for (let i = 0; i < kronen.length; i += 3) {
                const dx = x - kronen[i];
                const dz = z - kronen[i + 1];
                const q = (dx * dx + dz * dz) * kronen[i + 2];
                if (q < U.kronenQMax) deckung += Math.exp(-q);
            }
            return Math.exp(-U.canopyK * deckung);
        };
    }

    // Die EINE Ausdehnung einer Form um ihre Achse (Malen und Siedlungs-Hülle): ein gedrehter Kasten reicht bis zur
    // Diagonale — max(ex, ez) beschnitt die Ecken (ein um 45° gedrehtes Quadrat wurde zum Achteck).
    static _wegeFormRadius(f) {
        return f.halb + (f.typ === "kasten" ? Math.hypot(f.ex, f.ez) : 0);
    }

    // Der EINE Abstand eines Punkts zu einer Form (m, innen negativ): der gedrehte Kasten um (ax, az) mit den Halbachsen ex/ez
    // und der Drehung phi (yaw wie der alte Pool), das Segment als Kapsel um seine Mittellinie (`halb`). Leser: der Maler
    // (`_wegeKarteMale`) und die Natur-Wand (`_aufWeg`) — der Boden zeigt den Weg, wo die Natur ihm weicht. Drehung und
    // Länge merkt die Form beim ersten Ruf.
    static _wegeFormAbstand(f, px, pz) {
        if (f.typ === "kasten") {
            if (f._co === undefined) {
                f._co = Math.cos(f.phi || 0);
                f._si = Math.sin(f.phi || 0);
            }
            const rx = px - f.ax;
            const rz = pz - f.az;
            const lx = Math.abs(f._co * rx - f._si * rz) - f.ex;
            const lz = Math.abs(f._si * rx + f._co * rz) - f.ez;
            return Math.hypot(Math.max(lx, 0), Math.max(lz, 0)) + Math.min(Math.max(lx, lz), 0);
        }
        const dx = f.bx - f.ax;
        const dz = f.bz - f.az;
        if (f._ll === undefined) f._ll = dx * dx + dz * dz;
        let h = f._ll > 1e-6 ? ((px - f.ax) * dx + (pz - f.az) * dz) / f._ll : 0;
        h = h < 0 ? 0 : h > 1 ? 1 : h;
        return Math.hypot(px - (f.ax + dx * h), pz - (f.az + dz * h)) - f.halb;
    }

    // Das Gewicht EINER Form am Punkt (0 … 1): voll ab −rand innen, 0 ab +rand außen, dazwischen smoothstep — an der Kante 0,5.
    // Leser: der Maler (`_wegeKarteMale`) und die Linse des Vorplatzes (gate:settlement Teil O) — DIESELBE Zahl.
    static _wegeFormGewicht(f, px, pz, rand) {
        const q = (rand - AnazhRealm._wegeFormAbstand(f, px, pz)) / (2 * rand);
        if (q <= 0) return 0;
        return q >= 1 ? 1 : q * q * (3 - 2 * q);
    }

    // Die Grenze der NAH-Stufe als Bruchteil ihres Fensters (relativ zur Mitte, je Achse): zwei Texel vor dem Rand,
    // damit die bilineare Probe nie den leeren Rand-Texel liest. CPU-Leser und Boden-Shader lesen dieselbe Zahl.
    static _wegeStufeNah(N) {
        return 0.5 - 2 / N;
    }

    // Eine Form in EINE Stufe malen (nur innerhalb des Fensters, der Rand-Texel bleibt 0 — Clamp-to-Edge liest
    // außerhalb nichts). Segment: Kapsel-Abstand zur Mittellinie; Rechteck: gedrehter Kasten-Abstand. Der Rand
    // fällt über ±rand weich (smoothstep; rand = max(randM, randMinM der Stufe) — die ferne Stufe trägt 2-m-Texel,
    // ein schmaler Feldweg zerfiele dort sonst in Punkte), Kanal 0 = Erde, 1 = Acker; überlappende Formen nehmen
    // das Maximum. DIE DECKENDE FORM (`deckt`, der Grund der Häuser): in ihr liest jede bilineare Probe (Shader und
    // `_wegeFeldAt`) volle Erde — der Kasten wächst um die Spanne der Probe (je Welt-Achse ein Texel, in seinen Rahmen
    // gedreht t · (|cos φ| + |sin φ|)) und seinen weichen Rand (½ Texel der Stufe, nie der Feldweg-Boden `randMinM`): der
    // Übergang liegt ganz vor der Wand, wo die Büschel ohnehin ihre Reichweite halten (`erdbauGrund`).
    _wegeKarteMale(stufe, f) {
        if (f.kanal < 0) return; // eine Fläche ohne Boden-Kanal (der Gras-Anger) bleibt Wiese
        const S = stufe.S;
        const N = stufe.N;
        const t = S.texelM;
        let rand;
        if (f.deckt) {
            if (f.typ !== "kasten") throw new Error(`Wege-Karte: nur ein Kasten deckt (Form ${f.typ})`);
            rand = t / 2;
            const w = t * (Math.abs(Math.cos(f.phi || 0)) + Math.abs(Math.sin(f.phi || 0))) + rand;
            f = { ...f, ex: f.ex + w, ez: f.ez + w };
        } else rand = Math.max(f.rand !== undefined ? f.rand : AnazhRealm.WEGE_KARTE.randM, S.randMinM);
        const x0w = stufe.mitteX - S.fensterM / 2;
        const z0w = stufe.mitteZ - S.fensterM / 2;
        const ausdehnung = AnazhRealm._wegeFormRadius(f) + rand;
        const minX = Math.min(f.ax, f.bx) - ausdehnung;
        const maxX = Math.max(f.ax, f.bx) + ausdehnung;
        const minZ = Math.min(f.az, f.bz) - ausdehnung;
        const maxZ = Math.max(f.az, f.bz) + ausdehnung;
        const i0 = Math.max(1, Math.floor((minX - x0w) / t));
        const i1 = Math.min(N - 2, Math.ceil((maxX - x0w) / t));
        const j0 = Math.max(1, Math.floor((minZ - z0w) / t));
        const j1 = Math.min(N - 2, Math.ceil((maxZ - z0w) / t));
        if (i1 < i0 || j1 < j0) return;
        // Der EINE Maler hält die Leer-Marke: jede gemalte Form (Siedlung, Trittfläche, Fenster-Umzug) macht die Stufe
        // nicht-leer, der nächste Umzug lädt sie leer hoch — kein Maler kann die Marke vergessen.
        stufe.wegeLeer = false;
        const daten = stufe.daten;
        for (let j = j0; j <= j1; j++) {
            const pz = z0w + (j + 0.5) * t;
            for (let i = i0; i <= i1; i++) {
                const px = x0w + (i + 0.5) * t;
                const q = AnazhRealm._wegeFormGewicht(f, px, pz, rand);
                if (!(q > 0)) continue;
                const k = (j * N + i) * 2 + f.kanal;
                const v = Math.round(q * 255);
                if (v > daten[k]) daten[k] = v;
            }
        }
    }

    // Jede Stufe folgt dem Spieler (Umzug ab ihrem `umzugM`, Mitte auf ihr Texel-Raster gerastet): leeren, die
    // Formen der Siedlungen im Fenster neu malen (die Hülle je Siedlung verwirft ferne in O(1) — die Kosten binden an
    // die Nähe, nie an die Zahl besuchter Siedlungen), EIN Upload je umgezogener Stufe.
    _tickWegeKarte(playerPos) {
        const wk = this.state.wegeKarte;
        if (!wk || !playerPos) return;
        const jetzt = performance.now();
        const hydroN = this._flussKarteStand();
        for (const stufe of wk.stufen) {
            const S = stufe.S;
            if (!stufe.zentriert || Math.hypot(playerPos.x - stufe.mitteX, playerPos.z - stufe.mitteZ) >= S.umzugM) {
                stufe.fluss.hydroN = -1; // das Fenster zog um: die Flüsse neu
                const war = stufe.zentriert ? [stufe.mitteX, stufe.mitteZ] : null;
                const raster = S.texelM * 16;
                stufe.mitteX = Math.round(playerPos.x / raster) * raster;
                stufe.mitteZ = Math.round(playerPos.z / raster) * raster;
                stufe.zentriert = true;
                this._wegeStufeMalen(stufe);
                if (stufe.U) stufe.U.mitte.value.set(stufe.mitteX, stufe.mitteZ);
                this._kronenStreuUmzug(stufe, war);
            } else if (stufe.grundNeu) {
                // ein Haus legte seinen Grund (S4): die Stufe malt ihre Flächen neu (die Flüsse tragen eigene Bytes)
                this._wegeStufeMalen(stufe);
            }
            stufe.grundNeu = false;
            if (stufe.fluss.hydroN !== hydroN) this._flussKarteMalen(stufe, hydroN);
            // Neu gemalte Kronen gehen gebündelt hoch (höchstens ein Upload je Stufe und `uploadMs`): das Abbild zieht
            // nur im Schmutz-Rechteck aus der Summe nach (gekappt bei 255).
            const kr = stufe.kronen;
            if (kr.schmutz && jetzt - kr.upload >= AnazhRealm.LAUB_STREU.uploadMs) {
                const [i0, i1, j0, j1] = kr.schmutz;
                const N = kr.N;
                for (let j = j0; j <= j1; j++)
                    for (let k = j * N + i0, e = j * N + i1; k <= e; k++) {
                        const v = kr.summe[k];
                        kr.daten[k] = v > 255 ? 255 : v;
                    }
                this._wegeSchichtHoch(kr.tex, stufe.schicht);
                kr.schmutz = null;
                kr.upload = jetzt;
            }
        }
    }

    // Der Stand der Hydrosphäre, den die Fluss-Karte trägt: die Zahl bereiter Regionen (Heimat + Kacheln) — kommt eine
    // Kachel dazu, malt jede Stufe ihre Flüsse neu.
    _flussKarteStand() {
        const st = this.state;
        let n = st.hydrosphere && st.hydrosphere.ready ? 1 : 0;
        if (st.hydroTiles) for (const t of st.hydroTiles.values()) if (t && t.ready) n++;
        return n;
    }

    // Die Flüsse EINER zentrierten Stufe malen (K16, die Naht des Wassers): leeren, jedes Segment der bereiten Regionen
    // (der Kanal `kanal`, je Segment einmal) als Kasten-Filter seines Wassers über die Texel-Kante — der Anteil des Texels,
    // den [−Halbbreite, +Halbbreite] quer zum Segment deckt (dieselbe Breite wie `_fernFlussDeckung`); EIN Upload.
    _flussKarteMalen(stufe, hydroN) {
        const fl = stufe.fluss;
        fl.daten.fill(0);
        fl.hydroN = hydroN;
        const S = stufe.S;
        const N = stufe.N;
        const t = S.texelM;
        const x0w = stufe.mitteX - S.fensterM / 2;
        const z0w = stufe.mitteZ - S.fensterM / 2;
        const st = this.state;
        const regionen = [st.hydrosphere, ...(st.hydroTiles ? st.hydroTiles.values() : [])];
        const daten = fl.daten;
        const KANAL_FELDER = globalThis.__gelaendeCore.KANAL_FELDER;
        for (const h of regionen) {
            if (!h || !h.ready || !h.kanal) continue;
            const seg = h.kanal.seg;
            for (let o = 0; o < seg.length; o += KANAL_FELDER) {
                const ax = seg[o];
                const az = seg[o + 1];
                const bx = seg[o + 2];
                const bz = seg[o + 3];
                const hwA = seg[o + 4];
                const hwB = seg[o + 5];
                const r = Math.max(hwA, hwB) + t;
                const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - r - x0w) / t));
                const i1 = Math.min(N - 1, Math.ceil((Math.max(ax, bx) + r - x0w) / t));
                const j0 = Math.max(0, Math.floor((Math.min(az, bz) - r - z0w) / t));
                const j1 = Math.min(N - 1, Math.ceil((Math.max(az, bz) + r - z0w) / t));
                if (i1 < i0 || j1 < j0) continue;
                const ex = bx - ax;
                const ez = bz - az;
                const len2 = ex * ex + ez * ez || 1;
                for (let j = j0; j <= j1; j++) {
                    const pz = z0w + (j + 0.5) * t;
                    for (let i = i0; i <= i1; i++) {
                        const px = x0w + (i + 0.5) * t;
                        let u = ((px - ax) * ex + (pz - az) * ez) / len2;
                        u = u < 0 ? 0 : u > 1 ? 1 : u;
                        const d = Math.hypot(px - (ax + ex * u), pz - (az + ez * u));
                        const hw = hwA + (hwB - hwA) * u;
                        const c = Math.max(0, Math.min(d + t / 2, hw) - Math.max(d - t / 2, -hw)) / t;
                        if (c <= 0) continue;
                        const v = Math.round(Math.min(1, c) * 255);
                        const k = j * N + i;
                        if (v > daten[k]) daten[k] = v;
                    }
                }
            }
        }
        this._wegeSchichtHoch(fl.tex, stufe.schicht);
    }

    // Der Wasser-Anteil der Fluss-Karte je Fragment (dieselbe Stufen-Wahl und dasselbe UV wie `_wegeBodenFarbe`):
    // { wert, imFenster } — jenseits des Fern-Fensters trägt der Leser seinen Kasten-Anteil (aNass).
    _flussKarteNode(_T) {
        const wk = this._wegeKarteEnsure();
        if (!wk || !wk.stufen[0].U || !wk.stufen[0].fluss)
            throw new Error("Fluss-Karte: der Ring-Stoff braucht die Wege-Karte mit ihrer Fluss-Schicht");
        const [nah, fern] = wk.stufen;
        const xz = _T.positionWorld.xz;
        const relNah = xz.sub(nah.U.mitte).div(nah.U.groesse);
        const relFern = xz.sub(fern.U.mitte).div(fern.U.groesse);
        const innen = _T.step(_T.max(relNah.x.abs(), relNah.y.abs()), _T.float(AnazhRealm._wegeStufeNah(nah.N)));
        const imFenster = _T.step(_T.max(relFern.x.abs(), relFern.y.abs()), _T.float(0.5 - 1 / fern.N));
        const wert = _T.mix(
            _T.texture(fern.fluss.tex, relFern.add(0.5)).depth(_T.int(fern.schicht)).r,
            _T.texture(nah.fluss.tex, relNah.add(0.5)).depth(_T.int(nah.schicht)).r,
            innen
        );
        return { wert, imFenster };
    }

    // Die Wege EINER zentrierten Stufe neu malen — der EINE Neu-Maler für Umzug und Abbau: leeren, die Formen der
    // Siedlungen im Fenster malen (die Hülle verwirft ferne in O(1)), EIN Upload, wenn sich etwas ändert. Eine leere
    // Karte bleibt leer — kein Upload ohne Weg (der Umzug kommt auch für die Kronen). Die Marke setzt allein der Maler
    // (`_wegeKarteMale`): was er seit dem letzten Upload malte, geht leer hoch.
    _wegeStufeMalen(stufe) {
        const S = stufe.S;
        const warLeer = stufe.wegeLeer === true;
        stufe.daten.fill(0);
        stufe.wegeLeer = true;
        const h = S.fensterM / 2 + S.randMinM + AnazhRealm.WEGE_KARTE.randM;
        for (const sd of this.state.wegeKarte.siedlungen) {
            if (sd.x1 < stufe.mitteX - h || sd.x0 > stufe.mitteX + h) continue;
            if (sd.z1 < stufe.mitteZ - h || sd.z0 > stufe.mitteZ + h) continue;
            for (const f of sd.formen) this._wegeKarteMale(stufe, f);
        }
        // DER GRUND DER HÄUSER IST ERDE (S4): jede Box des Körper-Satzes, deren Boden der Grund ist (boden 0: der Turm, das Rund,
        // das Pfahlhaus; der Erdbau `grund`, gelaende-core), malt Kanal 0 DECKEND (`deckt`) — der Halm des Boden-Stoffs liest in
        // der GANZEN Box Erde statt Wiese; wo das Haus seinen Boden zeichnet, fällt der gezeichnete Boden (`erdbauSchnitt`),
        // dort malt keine Box (Radeon kalt: der Neu-Maler 1 → 17 ms, als jede Box malte). Bis 23.10. lag der weiche Rand (±½
        // Texel) AUF der Wand: im Turm des haus_gotisch (2,2 m) las der Boden 0,1–0,3 m vor der Wand 0,39–0,9 Erde, die Wiese
        // schien durch (vegetation.K4, Radeon: 7 290 Boden-Pixel)
        const E = this._erdbauLage();
        if (E && E.gruende)
            for (const g of E.gruende) {
                if (Math.abs(g.cx - stufe.mitteX) > h + 64 || Math.abs(g.cz - stufe.mitteZ) > h + 64) continue;
                for (const b of g.boxen) {
                    if (b[4]) continue;
                    const lx = (b[0] + b[1]) / 2;
                    const lz = (b[2] + b[3]) / 2;
                    const ax = g.cx + lx * g.c + lz * g.s;
                    const az = g.cz - lx * g.s + lz * g.c;
                    const phi = Math.atan2(g.s, g.c);
                    const [ex, ez] = [(b[1] - b[0]) / 2, (b[3] - b[2]) / 2];
                    this._wegeKarteMale(stufe, {
                        typ: "kasten",
                        kanal: 0,
                        ax,
                        az,
                        bx: ax,
                        bz: az,
                        ex,
                        ez,
                        phi,
                        halb: 0,
                        deckt: true,
                    });
                }
            }
        if (!warLeer || !stufe.wegeLeer) this._wegeSchichtHoch(stufe.tex, stufe.schicht);
    }

    // Die getretene Erde an (x, z) ∈ [0, 1] — bilinear aus DENSELBEN Bytes, die der Boden-Shader liest: die
    // NAH-Stufe innerhalb ihrer Grenze (`_wegeStufeNah`), sonst die FERN-Stufe.
    _wegeFeldAt(x, z) {
        const wk = this.state.wegeKarte;
        if (!wk) return 0;
        const [nah, fern] = wk.stufen;
        const g = AnazhRealm._wegeStufeNah(nah.N);
        const innen =
            Math.abs((x - nah.mitteX) / nah.S.fensterM) < g && Math.abs((z - nah.mitteZ) / nah.S.fensterM) < g;
        const stufe = innen ? nah : fern;
        if (!stufe.zentriert) return 0;
        const S = stufe.S;
        const fx = (x - (stufe.mitteX - S.fensterM / 2)) / S.texelM - 0.5;
        const fz = (z - (stufe.mitteZ - S.fensterM / 2)) / S.texelM - 0.5;
        const i = Math.floor(fx);
        const j = Math.floor(fz);
        if (i < 0 || j < 0 || i >= stufe.N - 1 || j >= stufe.N - 1) return 0;
        const tx = fx - i;
        const tz = fz - j;
        const d = stufe.daten;
        const N = stufe.N;
        const at = (a, b) => d[(b * N + a) * 2] / 255;
        return (
            (at(i, j) * (1 - tx) + at(i + 1, j) * tx) * (1 - tz) +
            (at(i, j + 1) * (1 - tx) + at(i + 1, j + 1) * tx) * tz
        );
    }

    // Die Boden-Farbe unter Kronen und Wegen (TSL): die Vertex-Farbe mischt zur Laubstreu der Kronen-Karte, zur
    // getretenen Erde (R) und zum Acker (G) der
    // Wege-Karte, in den Farben der Boden-Palette (dieselbe Pfad-Erde wie der gebackene Ufer-Pfad), nur auf
    // Begehbarem — ein Hang unter dem Weg bleibt Hang. Die Stufe wählt dieselbe Grenze wie `_wegeFeldAt`. Ohne die
    // Karte bricht der Boden-Stoff laut (der Chunk-Boden liest sie immer, kein stiller Boden ohne Weg).
    _wegeBodenFarbe(_T, vc) {
        const wk = this._wegeKarteEnsure();
        if (!wk || !wk.stufen[0].U || !_T.texture || !_T.positionWorld || !_T.normalWorldGeometry)
            throw new Error("Wege-Karte: der Boden-Stoff braucht Karte, Uniforms und TSL (texture/positionWorld)");
        const P = AnazhRealm.BODEN_FARBE;
        const [nah, fern] = wk.stufen;
        const xz = _T.positionWorld.xz;
        const relNah = xz.sub(nah.U.mitte).div(nah.U.groesse);
        const wNah = _T.texture(nah.tex, relNah.add(0.5)).depth(_T.int(nah.schicht));
        const relFern = xz.sub(fern.U.mitte).div(fern.U.groesse);
        const wFern = _T.texture(fern.tex, relFern.add(0.5)).depth(_T.int(fern.schicht));
        const innen = _T.step(_T.max(relNah.x.abs(), relNah.y.abs()), _T.float(AnazhRealm._wegeStufeNah(nah.N)));
        // Jenseits des Fern-Fensters liegt weder Weg noch Streu (K16: der Fern-Ring trägt denselben Stoff bis 8 km — die Karte
        // klemmte ihren Rand-Texel sonst radial über die Ferne). Im Fenster, wo jeder Chunk steht, dieselbe Zahl.
        const imFenster = _T.step(_T.max(relFern.x.abs(), relFern.y.abs()), _T.float(0.5));
        const _wm = _T.mix(wFern, wNah, innen).mul(imFenster);
        const _begehbar = _T.smoothstep(_T.float(0.6), _T.float(0.85), _T.normalWorldGeometry.y); // der Hang selbst, nie die Licht-Normale
        // DIE KRONEN-STREU (`_kronenStreuNeu`): unter den echten Kronen die Laubstreu der Palette (`lit`) — zuerst, die
        // Wege liegen darüber. Dieselbe Stufen-Wahl, dasselbe UV (dasselbe Fenster).
        const kNah = _T.texture(nah.kronen.tex, relNah.add(0.5)).depth(_T.int(nah.schicht)).r;
        const kFern = _T.texture(fern.kronen.tex, relFern.add(0.5)).depth(_T.int(fern.schicht)).r;
        // Der Rand ist keine Scheibe: das Laub liegt in Zungen und Flecken (Rauschen λ ≈ 1,4 m verschiebt die Kante).
        const _laubRausch = this._rauschAtlas()
            .raum(_T.vec3(xz.x.mul(0.7), xz.y.mul(0.7), _T.float(3.3)))
            .mul(0.3);
        const _k = _T
            .smoothstep(_T.float(0.15), _T.float(0.85), _T.mix(kFern, kNah, innen).add(_laubRausch))
            .mul(_begehbar)
            .mul(imFenster)
            .mul(_T.float(1).sub(this._fernKroneOhneWald(_T)));
        const l = P.lit;
        // Unter der Krone liegt die Streu — ihre Albedo, nie ein Schatten: das Labor dunkelt seinen Bestandeskern
        // (`c.multiplyScalar(0.58 + 0.46 · Licht)` in worlds/terrain), die Welt hat die echte Schattenkarte der Kronen
        // (Lehre 21: nie doppelt; bis 06.10. lag die Streu so bei Y 0,065 unter dem Soll 0,08–0,15).
        const mitStreu = _T.mix(vc, _T.vec3(l[0], l[1], l[2]), _k);
        const e = P.dirt;
        const a = P.wet;
        const mitErde = _T.mix(mitStreu, _T.vec3(e[0], e[1], e[2]), _wm.r.mul(_begehbar));
        return _T.mix(mitErde, _T.vec3(a[0], a[1], a[2]), _wm.g.mul(_begehbar));
    }

    // DAS EINE PFAD-FELD der Wiese: der getrampelte Ufer-Pfad (Drainage, im Boden gebacken) ODER der Siedlungs-Weg
    // (die Wege-Karte) — wo einer liegt, wächst kein Halm.
    _pfadFeldAt(x, z, surfY) {
        const a = this._pathFieldAt(x, z, surfY);
        const b = this._wegeFeldAt(x, z);
        return a > b ? a : b;
    }

    // DIE TRITTFLÄCHE (Architektur-Welle 05.10.): um eine Feuerstelle, einen Brunnen, einen Marktstand ist der Boden
    // getreten. Befund (Werkbank, echte GPU, Armlänge): Halme der Nah-Wiese stachen durch Glutbett und Brunnenkranz.
    // Das Gesetzbuch nennt die Fläche (`fx.tritt` des Rezepts: Kreis r oder Kasten ex/ez im Asset-Raum), der Wirt malt
    // sie als Form in die EINE Wege-Karte (Kanal Erde) — der Boden-Shader zeigt getretene Erde, Wiese und Nah-Streu
    // wachsen dort nicht (`_pfadFeldAt`). Einmal je Eintrag, beim ersten Studio-Platz (das Buch ist warm); sie bleibt,
    // solange der Eintrag lebt — der Boden vergisst die Feuerstelle nicht, wenn ihr Mesh die Mesh-Zone verlässt.
    // Die Frage stellt jeder Eintrag EINMAL (Lehre 25): `_trittBox` ist undefined (nie gefragt), false (keine Fläche)
    // oder die Form — jeder weitere Primär-Add (Stufen-Wechsel eines Baums, Hauses, Tors, der Karten-Platzierungen)
    // kostet einen Feld-Vergleich, nie die Preset-Auflösung.
    _trittFlaecheSetzen(entry) {
        if (!entry || entry._trittBox !== undefined || !entry.position) return;
        const preset = this._foundryPresetForEntry(entry);
        const f = this._foundry;
        const rec = preset && f && f.recipes ? f.recipes[preset] : null;
        const t = rec && rec.fx ? rec.fx.tritt : null;
        entry._trittBox = false; // transient (kein Snapshot)
        if (!t || typeof t !== "object") return;
        const s = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        const x = entry.position.x;
        const z = entry.position.z;
        const form =
            t.typ === "kasten" && Number.isFinite(t.ex) && Number.isFinite(t.ez)
                ? {
                      typ: "kasten",
                      kanal: 0,
                      ax: x,
                      az: z,
                      bx: x,
                      bz: z,
                      ex: t.ex * s,
                      ez: t.ez * s,
                      phi: Number.isFinite(entry.rotationY) ? entry.rotationY : 0,
                      halb: 0,
                  }
                : Number.isFinite(t.r)
                  ? { typ: "segment", kanal: 0, ax: x, az: z, bx: x, bz: z, halb: t.r * s }
                  : null;
        if (!form) return;
        const wk = this._wegeKarteEnsure();
        if (!wk) return;
        const r = AnazhRealm._wegeFormRadius(form);
        const box = { x0: x - r, z0: z - r, x1: x + r, z1: z + r, formen: [form] };
        wk.siedlungen.push(box);
        wk.raeumen.push(box); // was schon um die Ausstattung wuchs, räumt der Takt (`_wegeRaeumen`)
        this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1); // die Natur-Wand kennt die neue Fläche (`_aufWeg`)
        entry._trittBox = box; // transient (kein Snapshot): der Restore setzt sie beim ersten Platz neu
        for (const stufe of wk.stufen)
            if (stufe.zentriert) {
                this._wegeKarteMale(stufe, form);
                this._wegeSchichtHoch(stufe.tex, stufe.schicht);
            }
        const pm = this.state.playerMesh;
        if (pm && wk.stufen.some((st) => !st.zentriert)) this._tickWegeKarte(pm.position);
        this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
    }
    // Der Abbau nimmt die Trittfläche mit: die Form fällt aus der Karte, jede zentrierte Stufe malt JETZT neu (der
    // EINE Neu-Maler — bis 06.10. wartete der Abbau auf den Takt, der ohne Weg und Krone früh zurückkehrte: die
    // GPU-Karte zeigte weiter Erde, der CPU-Leser 0), Wiese und Nah-Streu wachsen über der Fläche zurück.
    _trittFlaecheLoesen(entry) {
        const wk = this.state.wegeKarte;
        const box = entry ? entry._trittBox : null;
        if (!box || !wk) return;
        const i = wk.siedlungen.indexOf(box);
        if (i >= 0) wk.siedlungen.splice(i, 1);
        this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1); // die Fläche fällt aus der Natur-Wand (`_aufWeg`)
        entry._trittBox = undefined;
        for (const stufe of wk.stufen) if (stufe.zentriert) this._wegeStufeMalen(stufe);
        this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
    }

    // Die Nah-Wiese UND die Nah-Streu über einer neuen Weg-/Tritt-Fläche neu wachsen lassen: jede Kachel im Rechteck
    // fällt, der nächste Takt baut sie auf dem Pfad-Feld neu (beide lesen `_pfadFeldAt` — bis 05.10. fiel nur die Wiese,
    // die Blume des Waldbodens blieb auf dem neuen Weg stehen).
    _nahWieseNeuIn(x0, z0, x1, z1) {
        this._weltRegt(); // die Kacheln fallen: die Stand-Wache weckt Wiese und Streu
        let n = 0;
        const imRechteck = (key, K) => {
            const [tx, tz] = key.split(",").map(Number);
            return !((tx + 1) * K < x0 || tx * K > x1 || (tz + 1) * K < z0 || tz * K > z1);
        };
        // Die Wiese-Kachel trägt nur Daten (der Sicht-Satz legt sich neu), die Streu-Kachel tritt aus ihren Senken aus. Die
        // Kacheln fallen HIER, unter dem Weckruf oben (kein Rückruf: die Schreiber-Wand deckt nur den eigenen Pfad).
        const nw = this.state.nahWiese;
        if (nw)
            for (const key of [...nw.kacheln.keys()])
                if (imRechteck(key, AnazhRealm.NAH_WIESE.kachel) && this._nahWieseKachelFaellt(key)) n++;
        const ns = this.state.nahStreu;
        if (ns)
            for (const [key, k] of [...ns.kacheln]) {
                if (!imRechteck(key, AnazhRealm.NAH_STREU.kachel)) continue;
                this._nahStreuKachelEntsorgen(k);
                if (ns.kacheln.delete(key)) n++;
            }
        return n;
    }

    // DIE KENNUNG EINES BAU-POOLS (gate:asset-inventory): Name UND Inventar-Stempel eines Instanz-Pools der Bau-Substanz
    // (der Zaun der Siedlungen, das Fundament der Häuser), bei jeder Erzeugung — auch beim Verdoppeln. Die Inventur liest den
    // Stempel (`userData.inventar`), nie den Namen: bis 08.10. trugen beide Pools nur ihren Namen, und kam das Auto-Dorf
    // während der Inventur, stand der Zaun als „UNBEKANNTER Emitter“ rot (CI 37709343976, siedlung-zaun inst×3).
    static _poolKennung(mesh, name) {
        mesh.name = name;
        mesh.userData.inventar = name;
        return mesh;
    }

    // ═══ DER ZAUN-POOL ═══
    // Das Muster der Instanz-Pools: EIN InstancedMesh für die hüfthohen Zaun-Streifen der Siedlungen (1 Draw-Call,
    // per-Instanz-Farbe); Höhe aus `getTerrainHeightAt`, Pitch aus den Endpunkt-Höhen. Kein Snapshot-Feld: die
    // Streifen entstehen je Session deterministisch aus dem Settlement-Export (`_tickAutoSettlement`).
    _stlZaunEnsurePool() {
        const st = this.state;
        if (!st.scene) return null;
        let P = st.stlZaun;
        if (P) return P;
        const mesh = this._kistenPool("siedlung-zaun", 256);
        st.scene.add(mesh);
        P = st.stlZaun = { mesh, cap: 256, top: 0 };
        return P;
    }
    // DIE KISTE DER POOLS (Zaun · Mauer · Vogel): EIN Stoff — EIN Programm, je Pool EIN Draw (das Fundament-Muster: welt-weit,
    // nie gecullt); die Form der Einheit ist der Würfel, oder `geo` (dieselben Attribute: Lage, Normale, UV). Farbe je Instanz
    // (setColorAt); Standard (rau, nicht-metallisch) liest den EINEN Himmel — r184-Lambert liest scene.environment nie diffus,
    // die Wege-Kisten standen im Schatten schwarz.
    _kistenPool(name, cap, geo = this._stlWegeGeo || (this._stlWegeGeo = new THREE.BoxGeometry(1, 1, 1))) {
        let mat = this._stlWegeMat;
        if (!mat) {
            mat = new THREE.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
            mat.userData.naesseFarbe = THREE.TSL.varyingProperty("vec3", "vInstanceColor"); // die Farbe ist die der Instanz
            this._stlWegeMat = this._leuchtStoff(mat, null); // der Licht-Pool (K11) und die Nässe
        }
        const mesh = AnazhRealm._poolKennung(AnazhRealm._instanzMesh(geo, mat, cap), name);
        // instanceColor-Buffer anlegen SOLANGE count == cap (r128: setColorAt
        // alloziert count*3 — nach count=0 wäre der Buffer leer, GEMESSEN).
        mesh.setColorAt(0, this._stlWegeTmpC || (this._stlWegeTmpC = new THREE.Color(1, 1, 1)));
        AnazhRealm._instanzZahl(mesh, 0);
        mesh.frustumCulled = false;
        mesh.receiveShadow = true;
        return mesh;
    }
    // DER MAUER-POOL (siedlung.K2): die Wände, Kronen und Türme der Stadtmauern — dieselbe Kiste, derselbe Stoff wie der Zaun
    // (EIN Programm), EIN Draw; anders als der hüfthohe Zaun wirft die Mauer (`castShadow`, die Wurf-Ebene).
    _stlMauerEnsurePool() {
        const st = this.state;
        if (st.stlMauer) return st.stlMauer;
        if (!this._stlZaunEnsurePool()) return null; // der Zaun-Pool steht vor der Mauer
        const mesh = this._kistenPool("siedlung-mauer", 256);
        mesh.castShadow = true;
        st.scene.add(mesh);
        st.stlMauer = { mesh, cap: 256, top: 0 };
        return st.stlMauer;
    }
    _stlZaunAddStrip(x, y, z, yaw, pitch, sx, sy, sz, farbe) {
        this._stlStreifen(this._stlZaunEnsurePool(), x, y, z, yaw, pitch, sx, sy, sz, farbe);
    }
    // EIN STREIFEN in einen Bau-Pool `P` (Zaun, Mauer): Mitte x/y/z, Gier und Neigung, Maße sx (quer) · sy (hoch) · sz (längs);
    // die Verdopplung trägt Name, Stempel und Wurf des Pools.
    _stlStreifen(P, x, y, z, yaw, pitch, sx, sy, sz, farbe) {
        if (!P) return;
        if (P.top >= P.cap) {
            // Verdopplungs-Wachstum (Matrizen + Farben in einen frischen Pool).
            const bigger = this._kistenPool(P.mesh.name, P.cap * 2);
            bigger.castShadow = P.mesh.castShadow;
            bigger.instanceMatrix.array.set(P.mesh.instanceMatrix.array);
            if (P.mesh.instanceColor) bigger.instanceColor.array.set(P.mesh.instanceColor.array);
            AnazhRealm._instanzZahl(bigger, P.mesh.count);
            this.state.scene.add(bigger);
            this.state.scene.remove(P.mesh);
            this._instanzAbschied(P.mesh);
            P.mesh = bigger;
            P.cap *= 2;
        }
        const slot = P.top++;
        const m = this._stlWegeTmpM || (this._stlWegeTmpM = new THREE.Matrix4());
        const q = this._stlWegeTmpQ || (this._stlWegeTmpQ = new THREE.Quaternion());
        const e = this._stlWegeTmpE || (this._stlWegeTmpE = new THREE.Euler());
        const v = this._stlWegeTmpV || (this._stlWegeTmpV = new THREE.Vector3());
        const s = this._stlWegeTmpS || (this._stlWegeTmpS = new THREE.Vector3());
        const c = this._stlWegeTmpC || (this._stlWegeTmpC = new THREE.Color());
        e.set(pitch, yaw, 0, "YXZ");
        q.setFromEuler(e);
        m.compose(v.set(x, y, z), q, s.set(sx, sy, sz));
        P.mesh.setMatrixAt(slot, m);
        P.mesh.setColorAt(slot, c.setHex(farbe));
        AnazhRealm._instanzZahl(P.mesh, P.top);
        P.mesh.instanceMatrix.needsUpdate = true;
        if (P.mesh.instanceColor) P.mesh.instanceColor.needsUpdate = true;
    }
    // Die Boden-Schichten EINES Settlement-Exports (Straßen · Feldwege · Platz · Äcker) in die Wege-Karte und die
    // Zäune in den Zaun-Pool — verankert am `origin`, je Form Wasser-bewacht (`_nassAt`; Fluss-Querungen
    // bleiben offen, die bruecken-Schicht reist unkonsumiert). `key` = Session-Gedächtnis (kein Doppel-Bau je Boot). `nurWege`:
    // ein neuer Plan desselben Orts (`_ortNeuRechnen`) — Zaun und Mauer stehen schon. Die Formen merken ihren Plan (`plan`).
    _stlWegeBuild(plan, origin, key, nurWege) {
        if (!plan || !origin || !this.state.scene) return 0;
        if (!this._stlWegeKeys) this._stlWegeKeys = new Set(); // Instanz-Feld (die _editSaveTimer-Klasse)
        if (key && this._stlWegeKeys.has(key)) return 0;
        if (key) this._stlWegeKeys.add(key);
        const wk = this._wegeKarteEnsure();
        let n = 0;
        const MAX = 900; // Kappe je Siedlung
        // Die Siedlung merkt ihre Formen samt Hülle (der Fenster-Umzug verwirft ferne Siedlungen in O(1)).
        const box = { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity, formen: [], plan };
        const form = (f) => {
            box.formen.push(f);
            for (const stufe of wk.stufen) if (stufe.zentriert) this._wegeKarteMale(stufe, f);
            const r = AnazhRealm._wegeFormRadius(f);
            box.x0 = Math.min(box.x0, f.ax - r, f.bx - r);
            box.x1 = Math.max(box.x1, f.ax + r, f.bx + r);
            box.z0 = Math.min(box.z0, f.az - r, f.bz - r);
            box.z1 = Math.max(box.z1, f.az + r, f.bz + r);
            n++;
        };
        const strasse = (pts, w) => {
            if (!Array.isArray(pts)) return;
            for (let i = 0; i + 1 < pts.length && n < MAX; i++) {
                const ax = origin.x + pts[i].x;
                const az = origin.z + pts[i].z;
                const bx = origin.x + pts[i + 1].x;
                const bz = origin.z + pts[i + 1].z;
                if (!(Math.hypot(bx - ax, bz - az) > 0.01)) continue;
                if (!this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue; // die Wasser-Wand
                form({ typ: "segment", kanal: 0, ax, az, bx, bz, halb: Math.max(1.2, w || 2.5) / 2 });
            }
        };
        for (const rd of plan.roads || []) strasse(rd.pts, rd.w);
        for (const fw of plan.feldwege || []) strasse(fw.pts, fw.w);
        // Der PLATZ (Anger/Markt) — ein gedrehtes Erd-Rechteck; ein Gras-Anger bleibt Wiese: er malt keinen Boden-Kanal
        // (`kanal` −1), und die Natur-Wand hält sein Inneres frei wie das Gesetzbuch des Dorfs (fachwerk-core: kein Baum
        // tiefer als 1 m im Anger, `sperr` −1 statt des Stamm-Rands).
        const pz = plan.platz;
        if (pz && Number.isFinite(pz.cx) && Number.isFinite(pz.ex) && n < MAX) {
            const wx = origin.x + pz.cx;
            const wz = origin.z + pz.cz;
            const anger = pz.typ === "gras";
            if (this._landAt(wx, wz, 0.2))
                form({
                    typ: "kasten",
                    kanal: anger ? -1 : 0,
                    ax: wx,
                    az: wz,
                    bx: wx,
                    bz: wz,
                    ex: pz.ex,
                    ez: pz.ez,
                    phi: pz.phi || 0,
                    halb: 0,
                    ...(anger ? { sperr: -1 } : {}),
                });
        }
        // DIE VORPLÄTZE (K66, Augen-Runde 15.10.: Gras wuchs über die Türtreppe): vor jedem Eingang liegt getretene Erde bis an den Weg —
        // Grundriss gegen Natur gilt für Treppe und Vorplatz wie für den Weg. Die Fläche ist die Erdbau-Platte des Vorplatzes selbst (fachwerk
        // `ortPlan`, Marke `vorplatz`, im Erdbau der Welt, `_erdbauRoh`) samt dem Saum der Gasse (`vorplatzBoden`) — Akt, Dorf-Zug und
        // Wege-Rebuild aus dem Export lesen dieselbe Platte; bis K66 malte der Wirt eine eigene Fläche von 1,6 m Tiefe, die Platte reichte
        // bis zur Gasse, dazwischen wuchs Wiese. Beim HOF-Haus dazu die Stufe vor der Haustür im Hof (fachwerk `eingangVon`). Die Wiese
        // (`_pfadFeldAt`) und die Natur-Wand (`_aufWeg`) lesen dieselbe Form.
        const FC = globalThis.__fachwerkCore;
        const kasten = (vp) => {
            if (!vp || n >= MAX || !this._landAt(vp.cx, vp.cz, 0.2)) return;
            form({
                typ: "kasten",
                kanal: 0,
                ax: vp.cx,
                az: vp.cz,
                bx: vp.cx,
                bz: vp.cz,
                ex: vp.ex,
                ez: vp.ez,
                phi: vp.phi || 0,
                halb: 0,
            });
        };
        let reich = 0; // so weit reicht der Plan um seinen Ursprung (dieselbe Hülle wie die Ort-Wahl, `_ortWahl`)
        for (const s of plan.slots || []) reich = Math.max(reich, Math.hypot(s.x || 0, s.z || 0) + 16);
        // Der Maler malt weich (±`WEGE_KARTE.randM`, `_wegeFormGewicht`): zwei Formen, die sich nur berühren, tragen an ihrer Naht je
        // die Hälfte — dort wuchs die Wiese mit 54 % ihrer Dichte zwischen Gasse und Stufe (K66, Prüfung 1: Bild tuer2, das Feld
        // fiel auf 0,5; an der Schwelle, wo die Fläche an der Hauswand endet, auf 0,8). Der Boden des Vorplatzes greift darum um den
        // Rand des Malers unter die Schwelle und um sein ganzes Band (2 · randM) über den Saum hinaus in die Gasse (mit einem randM
        // blieben am Akt zwei Häuser bei 0,89 am Rand der Gasse). Ebenso quer: um ein randM über jede Flanke der Platte — sonst trug die
        // Flanke der Stufe das Feld 0,5 und die Wiese stand dort mit der Hälfte ihrer Dichte auf der Platte (K66, Prüfung 3: Bild tuer2,
        // Halme über der Stufe; gate:settlement Teil O misst die ganze Breite).
        const RW = AnazhRealm.WEGE_KARTE.randM;
        for (const p of this._erdbauRoh())
            if (p.vorplatz != null && Math.hypot(p.cx - origin.x, p.cz - origin.z) <= reich) {
                const b = FC.vorplatzBoden(p);
                const sn = Math.sin(b.phi);
                const cs = Math.cos(b.phi);
                kasten({
                    cx: b.cx - (sn * RW) / 2,
                    cz: b.cz - (cs * RW) / 2,
                    phi: b.phi,
                    ex: b.ex + RW,
                    ez: b.ez + 1.5 * RW,
                });
            }
        for (const sl of plan.slots || []) {
            if (!sl.tuer || !FC.eingangVon(sl).hof) continue;
            const st = FC.vorplatzFlaeche(sl, undefined, true);
            if (st)
                kasten({
                    cx: origin.x + st.cx,
                    cz: origin.z + st.cz,
                    phi: st.phi,
                    ex: st.ex + RW,
                    ez: st.ez + RW,
                });
        }
        // Die ÄCKER (felder-Schicht): je OBB ein gedrehtes Acker-Rechteck (Kanal G) — die Layout-Wahrheit des
        // Gesetzbuchs lebt im Boden.
        for (const fd of plan.felder || []) {
            if (n >= MAX) break;
            if (!fd || !Number.isFinite(fd.cx) || !Number.isFinite(fd.ex)) continue;
            const wx = origin.x + fd.cx;
            const wz = origin.z + fd.cz;
            if (!this._landAt(wx, wz, 0.2)) continue;
            form({
                typ: "kasten",
                kanal: 1,
                ax: wx,
                az: wz,
                bx: wx,
                bz: wz,
                ex: fd.ex,
                ez: fd.ez,
                phi: fd.phi || 0,
                halb: 0,
            });
        }
        if (box.formen.length) {
            wk.siedlungen.push(box);
            wk.raeumen.push(box); // was schon auf Weg, Platz und Acker wuchs, räumt der Takt (`_wegeRaeumen`)
            this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1); // die Natur-Wand kennt die neue Fläche (`_aufWeg`)
        }
        for (const stufe of wk.stufen) if (stufe.zentriert) this._wegeSchichtHoch(stufe.tex, stufe.schicht);
        // DIE ERSTE SIEDLUNG zentriert die Karte SOFORT: die Wiese über ihr wächst im selben Takt neu
        // (`_nahWieseNeuIn` → `_tickNahWiese` vor `_tickWegeKarte`) und läse vor dem Zentrieren 0 — Halme im Weg.
        const pm = this.state.playerMesh;
        if (pm && wk.stufen.some((s) => !s.zentriert)) this._tickWegeKarte(pm.position);
        if (box.x0 < box.x1) this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
        if (nurWege) return n;
        // ZÄUNE (fences-Schicht): je Segment ein schmaler hüfthoher Holz-Streifen aus dem Zaun-Pool (sy 0.85)
        // — bewusst KEIN Blocker, das Dorf bleibt durchlässig.
        for (const fz of plan.fences || []) {
            if (n >= MAX) break;
            if (!fz || !Number.isFinite(fz.x0) || !Number.isFinite(fz.x1)) continue;
            const ax = origin.x + fz.x0;
            const az = origin.z + fz.z0;
            const bx = origin.x + fz.x1;
            const bz = origin.z + fz.z1;
            const dx = bx - ax;
            const dz = bz - az;
            const len = Math.hypot(dx, dz);
            if (!(len > 0.4)) continue;
            if (!this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue;
            const y0 = this.getTerrainHeightAt(ax, az);
            const y1 = this.getTerrainHeightAt(bx, bz);
            if (!Number.isFinite(y0) || !Number.isFinite(y1)) continue;
            this._stlZaunAddStrip(
                (ax + bx) / 2,
                (y0 + y1) / 2 + 0.42,
                (az + bz) / 2,
                Math.atan2(dx, dz),
                -Math.atan2(y1 - y0, len),
                0.12,
                0.85,
                len,
                0x6a4e32
            );
            n++;
        }
        return n + this._stlMauerBuild(plan, origin);
    }
    // DIE STADTMAUER (siedlung.K2): die Mauer des Exports (fachwerk `dorfLayout` → exportSettlement `mauer`: Segmente zwischen
    // den Toren, Türme) im Mauer-Pool, in den Maßen des Gesetzbuchs (fachwerk STADTMAUER — dieselben baut das Labor) und den
    // Farben von DEFCOL (stein · ziegel). Der Fuß liest den Boden an beiden Enden und über die Länge: die Wand reicht
    // `STADTMAUER_FUSS_M` unter den tiefsten Punkt unter ihrer Sehne, die Krone folgt dem Hang; der Turm steht auf seiner
    // tiefsten Ecke. Was die Wasser-Wand nimmt, steht nicht. Die Natur weicht der Mauer wie dem Anger (`kanal` −1: kein
    // Boden-Kanal, die Natur-Wand hält die Linie frei). Bis K2 strich der Export die Mauer — die Stadt der Welt stand ohne sie.
    _stlMauerBuild(plan, origin) {
        const M = plan && plan.mauer;
        if (!M || !Array.isArray(M.segs) || !this.state.scene) return 0;
        const FC = globalThis.__fachwerkCore;
        const SM = FC.STADTMAUER;
        const stein = FC.DEFCOL.stein;
        const ziegel = FC.DEFCOL.ziegel;
        const P = this._stlMauerEnsurePool();
        const wk = this._wegeKarteEnsure();
        const FUSS = AnazhRealm.STADTMAUER_FUSS_M;
        const box = { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity, formen: [] };
        const form = (f) => {
            box.formen.push(f);
            const r = AnazhRealm._wegeFormRadius(f);
            box.x0 = Math.min(box.x0, f.ax - r, f.bx - r);
            box.x1 = Math.max(box.x1, f.ax + r, f.bx + r);
            box.z0 = Math.min(box.z0, f.az - r, f.bz - r);
            box.z1 = Math.max(box.z1, f.az + r, f.bz + r);
        };
        let n = 0;
        for (const sg of M.segs) {
            const ax = origin.x + sg.x0;
            const az = origin.z + sg.z0;
            const bx = origin.x + sg.x1;
            const bz = origin.z + sg.z1;
            const dx = bx - ax;
            const dz = bz - az;
            const len = Math.hypot(dx, dz);
            if (!(len > 0.5) || !this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue;
            const y0 = this.getTerrainHeightAt(ax, az);
            const y1 = this.getTerrainHeightAt(bx, bz);
            if (!Number.isFinite(y0) || !Number.isFinite(y1)) continue;
            let tief = 0;
            for (let k = 1; k < 4; k++) {
                const y = this.getTerrainHeightAt(ax + (dx * k) / 4, az + (dz * k) / 4);
                if (Number.isFinite(y)) tief = Math.max(tief, y0 + ((y1 - y0) * k) / 4 - y);
            }
            const fuss = FUSS + tief;
            const mx = (ax + bx) / 2;
            const mz = (az + bz) / 2;
            const my = (y0 + y1) / 2;
            const yaw = Math.atan2(dx, dz);
            const pitch = -Math.atan2(y1 - y0, len);
            const L = len + SM.wand.ueber;
            this._stlStreifen(
                P,
                mx,
                my + (SM.wand.hoch - fuss) / 2,
                mz,
                yaw,
                pitch,
                SM.wand.dick,
                SM.wand.hoch + fuss,
                L,
                stein
            );
            this._stlStreifen(P, mx, my + SM.krone.y, mz, yaw, pitch, SM.krone.dick, SM.krone.hoch, L, stein);
            form({ typ: "segment", kanal: -1, ax, az, bx, bz, halb: SM.krone.dick / 2 });
            n++;
        }
        const tb = SM.turm.breit / 2;
        for (const t of Array.isArray(M.towers) ? M.towers : []) {
            const x = origin.x + t.x;
            const z = origin.z + t.z;
            if (!this._landAt(x, z, 0.2)) continue;
            const y = this.getTerrainHeightAt(x, z);
            if (!Number.isFinite(y)) continue;
            let tief = 0;
            for (const [ex, ez] of [
                [-tb, -tb],
                [tb, -tb],
                [-tb, tb],
                [tb, tb],
            ]) {
                const ye = this.getTerrainHeightAt(x + ex, z + ez);
                if (Number.isFinite(ye)) tief = Math.max(tief, y - ye);
            }
            const fuss = FUSS + tief;
            this._stlStreifen(
                P,
                x,
                y + (SM.turm.hoch - fuss) / 2,
                z,
                0,
                0,
                SM.turm.breit,
                SM.turm.hoch + fuss,
                SM.turm.breit,
                stein
            );
            this._stlStreifen(P, x, y + SM.dach.y, z, 0, 0, SM.dach.breit, SM.dach.hoch, SM.dach.breit, ziegel);
            form({ typ: "kasten", kanal: -1, ax: x, az: z, bx: x, bz: z, ex: tb, ez: tb, phi: 0, halb: 0 });
            n++;
        }
        if (box.formen.length) {
            wk.siedlungen.push(box); // die Natur-Wand liest die Linie (`_aufWeg`); einen Boden-Kanal malt sie nicht
            wk.raeumen.push(box); // was schon in der Linie der Mauer wuchs, räumt der Takt (`_wegeRaeumen`)
            this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1);
        }
        return n;
    }
    // KATALOG-SICHT: der EINE Sicht-Chokepoint aller Picker (Werkstatt-Liste · Rezeptbuch · Omnibox ·
    // Kreatur-Auftrag): donorOnly-Spender und Render-Varianten (grown_*, fels/kristall_var1+)
    // erscheinen nirgends — je Gattung EIN Studio-Eintrag.
    _katalogSichtbar(name, bp) {
        const b = bp || (this.state.blueprints && this.state.blueprints[name]);
        if (!b || b.donorOnly) return false;
        const n = typeof name === "string" && name ? name : b.name || "";
        return !(/^grown_/.test(n) || /^(fels|kristall)_var([1-9]\d*)$/.test(n));
    }
    // DIE REIHE DES KATALOGS (bauen.K1): griffbereit zuerst — die eigenen Werke des Spielers (weder eingebaut noch vom Studio
    // geboren, `_foundryAutoSpecies` ist die Herkunfts-Marke), dann die seiner Hotbar in ihrer
    // Reihe, dann der Rest in seiner Ordnung; jeder Picker liest sie (Werkstatt-Liste · Rezeptbuch). Griffbereit heißt
    // Rang < Hotbar-Länge. Befund 22.10. (echte Eingaben): Eiche, Haus, GT und das eigene Werk lagen 2–22 Mausrad-Rasten tief.
    _katalogRang(name) {
        const b = this.state.blueprints && this.state.blueprints[name];
        const hb = this.state.hotbar || [];
        return b && !b.builtIn && !b._foundryAutoSpecies ? -1 : hb.includes(name) ? hb.indexOf(name) : hb.length;
    }
    _katalogReihe(namen) {
        return namen.slice().sort((a, b) => this._katalogRang(a) - this._katalogRang(b));
    }

    _stlWegeDispose() {
        for (const feld of ["stlZaun", "stlMauer"]) {
            const P = this.state[feld];
            if (P && P.mesh) {
                if (P.mesh.parent) P.mesh.parent.remove(P.mesh);
                this._instanzAbschied(P.mesh);
            }
            this.state[feld] = null;
        }
        // Die Wege-Karte leert sich (die Formen und die Kronen gehören der alten Welt; die neue pflanzt neu); die
        // Texturen bleiben (kein Re-Compile).
        const wk = this.state.wegeKarte;
        if (wk) {
            wk.siedlungen.length = 0;
            wk.kronen.clear();
            wk.kronenZellen.clear();
            wk.kronenRandMax = 0;
            for (const stufe of wk.stufen) {
                stufe.daten.fill(0);
                stufe.zentriert = false;
                this._wegeSchichtHoch(stufe.tex, stufe.schicht);
                stufe.kronen.summe.fill(0);
                stufe.kronen.daten.fill(0);
                stufe.kronen.schmutz = null;
                this._wegeSchichtHoch(stufe.kronen.tex, stufe.schicht);
            }
        }
        if (this._stlWegeKeys) this._stlWegeKeys.clear(); // die Session-Marken fallen mit (Rebuild baut neu)
    }

    _archInstanceAdd(entry, flat, opts) {
        // KEIN FALLBACK: ist der Eintrag eine foundry-bekannte Art (Baum/Fels/Kristall/Blume/Strauch) und der
        // Flat KEIN Studio-Flat (`!flat.foundry`), wird NICHTS platziert — der Eintrag wartet kalt, bis das
        // Studio liefert (Culling-Tick/Refill). Grammatik-Fixturen öffnen die Wand nur unter
        // `__withNoFoundry` (`_foundryEnabled()` false).
        if (
            flat &&
            !flat.foundry &&
            typeof this._foundryEnabled === "function" &&
            this._foundryEnabled() &&
            this._foundryPresetForEntry(entry)
        ) {
            return;
        }
        const ew = this._archEntryWorldMatrix(
            entry,
            this._archTmpEntryM || (this._archTmpEntryM = new THREE.Matrix4())
        );
        const m = this._archTmpLeafM || (this._archTmpLeafM = new THREE.Matrix4());
        // DER HALT AB GEBURT (K36): eine neue Primär-Stufe hält VOLL, bis die Band-Pflege ihren Partner geurteilt hat
        // (`_updateFoundryLodBand` löst ihn nur, wo der Partner steht). Bis K36 blendete sie vom ersten
        // Bild an — und urteilte die schlafende Stufen-Wahl nie über sie, stand die L1 vor der ungebackenen Karte halb
        // durchsichtig (Genesis-Ankunft, echte GPU: 5 Bäume nach 71 Takten).
        if (!(opts && opts.band)) {
            entry._lodHalt = true;
            entry._lodHaltWartet = false;
        }
        const slots = [];
        // instanceColor trägt die Farbe als RGB (0..1); InstancedMesh alloziert mesh.instanceColor LAZY beim
        // ersten setColorAt. OB und WAS geschrieben wird, entscheidet `_archSlotColor`. instanceColor
        // MULTIPLIZIERT die Material-Farbe → neutral ist WEISS (Grau verdunkelte jede tint-lose Instanz).
        const tintColor = this._archTmpTintColor || (this._archTmpTintColor = new THREE.Color());
        if (Number.isFinite(entry.tintH) && Number.isFinite(entry.tintS) && Number.isFinite(entry.tintV)) {
            tintColor.setRGB(entry.tintH, entry.tintS, entry.tintV);
        } else {
            tintColor.setRGB(1, 1, 1);
        }
        // Welle B — der platzierte Bau ist GLOBAL (kein Regions-Schlüssel): er lebt in der Mesh-Zone (Cull-Radius
        // 100–150 m; ein Karten-Ding als Karte bis zum Karten-Horizont), jenseits trägt der Box-Satz im Welt-March; eine
        // 256-m-Region brachte keinen Cull (ihre Kugel R·√½ + 140 m schneidet das Frustum praktisch immer), sie
        // vervielfachte nur die Gruppen je Leaf (@p:).
        for (let i = 0; i < flat.leaves.length; i++) {
            const leaf = flat.leaves[i];
            // Der Leaf-Schluessel ist normal der Array-Index; ein Leaf DARF ihn ueberschreiben
            // (leaf.leafKey) — so bekommt Foundry-Geometrie je Art:Variante:LOD:Teil eine EIGENE
            // InstancedMesh-Gruppe im BESTEHENDEN HISM (Vielfalt + LOD + Instancing, kein Parallelpfad).
            // Trägt das Leaf eine Studio-Identität (f:/fimp:), IST sie die Gruppe — ohne den Bau-Typ (zwei Typen
            // mit derselben Studio-Geometrie zeichnen in EINER Gruppe).
            const studio = typeof leaf.leafKey === "string" && /^(f|fimp):/.test(leaf.leafKey);
            const g = this._archInstanceGroupFor(
                studio ? "" : entry.type,
                leaf.leafKey != null ? leaf.leafKey : i,
                leaf,
                null
            );
            const ref = this._archGroupAlloc(g, entry);
            // DIE FLÜGEL-INSTANZ (1310-4): zeichnen mehrere Flügel in EINER Gruppe, trägt die Marke den Schwenk-Träger ihres
            // Flügels (Scharnier, Lage der Gestalt) — `g.tuer` ist nur der des ersten
            if (leaf.tuer) ref.tuer = leaf.tuer;
            const slot = ref.slot;
            m.multiplyMatrices(ew, leaf.localMatrix);
            g.mesh.setMatrixAt(slot, m);
            // V18.181-merge-Λ Sub 3d / V18.475: die EINE Slot-Farbe (leaf.tint ×
            // Entry-Tint, _archSlotColor) — lazy Allocation des Color-Buffers.
            const slotColor = this._archSlotColor(leaf, tintColor);
            g.mesh.instanceMatrix.needsUpdate = true;
            if (slotColor) {
                g.mesh.setColorAt(slot, slotColor);
                if (g.mesh.instanceColor) g.mesh.instanceColor.needsUpdate = true;
            }
            // boundingSphere invalidieren (V18.358: THREE cacht sie sonst stale → spät platzierte Bauten
            // cullen im Blickfeld; Raycast-Cull, s. _archGroupFree).
            g.mesh.boundingSphere = null;
            // AUSLÖSCHUNGS-WELLE (Feld B) — die per-Instanz-Metrik stempeln (Studio aH0·_isy + vOcc), die Karte ihre Schicht.
            this._lodSlotStamp(
                g,
                slot,
                entry.scale,
                this._lodSlotVoll(entry, !!(opts && opts.band), opts && opts.bandLod),
                leaf
            );
            slots.push(ref);
        }
        // W5.4 — Band-Add: NUR die Band-Felder (transient wie instSlots, nicht im Snapshot); der Primär-Zustand bleibt.
        if (opts && opts.band) {
            entry.instSlotsBand = slots;
            entry._lodBandLevel = Number.isFinite(opts.bandLod) ? opts.bandLod : null;
            return;
        }
        entry.instanced = true;
        entry.instSlots = slots;
        this._cullWecken(entry); // die gezeichnete Stufe wechselt: der Cull urteilt neu (`_cullWache`)
        this._fluegelLeib(entry); // der Tür- und Tor-Flügel trägt seinen Leib aus der Matrix, die er zeichnet (leib.K4)
        // DIE HÜLLE DER STUFE (Welle L, Kollision == Optik): ein Haus kollidiert, wie es gezeichnet ist — die Stufe 0 mit den
        // Solids des Gesetzbuchs (Böden, Tritte, Wände mit Öffnungen), JEDE Stufe dieselben (die fernen tragen die Solids der
        // Stufe 0, `hausSolids`); ein Stufen-Wechsel mit derselben Zeile schreibt die Blocker nicht neu.
        if (flat && flat.foundry && flat.huelle) this._hausHuelleSetzen(entry, flat.huelle);
        // ein Bau ohne Haus-Hülle, dessen Form oben schließt (Marktstand · Brunnen · Tor), trägt seine Decke in den Dach-Pool
        else if (flat && flat.foundry && entry._dachKasten === undefined) this._dachKastenSetzen(entry, flat.leaves);
        // Merker: aus dem Studio (Foundry) platziert → der LOD-Tick (`_switchArchitectureLOD`) serviert die
        // neue Stufe aus der Foundry statt aus `grown_..._lodN`. Transientes Render-Feld (wie
        // `instanced`/`instSlots`) — nicht im Snapshot.
        entry.instFoundry = !!(flat && flat.foundry);
        // Die SERVIERTE Stufe (flat.lod nach der kindStages-Klammer; Impostor-Flat lod:2): der
        // Clamp-Kurzschluss in _switchArchitectureLOD liest sie, damit eine Ein-Stufen-Art (fels [0]) beim
        // Schwellen-Übertritt nicht neu alloziert. Transient (nicht im Snapshot).
        entry._servedLod = flat && flat.foundry && Number.isFinite(flat.lod) ? flat.lod : null;
        // die Trittfläche der Ausstattung (einmal je Eintrag, idempotent) — der Studio-Platz hat das Buch
        if (entry.instFoundry) this._trittFlaecheSetzen(entry);
    }

    // Instanz-Matrizen eines Eintrags neu schreiben — auch der Mount-Follow eines FOUNDRY-Fahrzeugs
    // (instanziert, entry.mesh = null). Flat-Quelle wie `_rebuildArchitectureMesh`: instFoundry →
    // `_foundryFlattenFor` auf der SERVIERTEN Stufe (Cache-Treffer: die Slots stammen aus exakt diesem
    // Flat), sonst der Bauplan-Flat. STEER_VIS.instance = "entry-yaw": nur ew * leaf.localMatrix — die
    // geteilte localMatrix nie mutieren. JEDE ZEICHNENDE STUFE ZIEHT MIT: die Primär-Stufe (`instSlots`) und ihr Partner im
    // Stufen-Band (`instSlotsBand`, die Stufe `_lodBandLevel`). Befund Spielgang 17.10. (Radeon, GT nach 20 m in Third): nur die
    // Primär-Stufe fuhr, der L1-Partner des Bands stand mit 19 Slots am Ort des Aufstiegs — dort zeichnete der Aufbau, am
    // Wagen blendete die L0 im Band aus: in Third verschwand das Fahrzeug.
    _archInstanceUpdate(entry) {
        if (!entry.instanced || !entry.instSlots) return;
        const fPreset = entry.instFoundry && this._foundryEnabled() ? this._foundryPresetForEntry(entry) : null;
        const lod = Number.isFinite(entry._servedLod) ? entry._servedLod : entry._lodLevel;
        this._archInstanzSlotsSetzen(entry, entry.instSlots, fPreset, lod);
        if (entry.instSlotsBand && fPreset && Number.isFinite(entry._lodBandLevel))
            this._archInstanzSlotsSetzen(entry, entry.instSlotsBand, fPreset, entry._lodBandLevel, true);
    }
    // `band`: die Slots des Partners paaren mit dem Flat seiner GEBURT — ohne die Zwillinge, die die Primär-Stufe wirft
    // (`_bandOhneZwilling`, `_updateFoundryLodBand`); der ungefilterte Flat verschöbe jedes Blatt hinter einem Zwilling um eins.
    _archInstanzSlotsSetzen(entry, slots, fPreset, lod, band) {
        let flat = fPreset ? this._foundryFlattenFor(entry, fPreset, lod) : this._archFlattenBlueprint(entry.type);
        if (band && flat)
            flat = this._bandOhneZwilling(flat, this._foundryFlattenFor(entry, fPreset, entry._lodLevel | 0));
        if (!flat || !flat.instanceable) return;
        const ew = this._archEntryWorldMatrix(
            entry,
            this._archTmpEntryM || (this._archTmpEntryM = new THREE.Matrix4())
        );
        const m = this._archTmpLeafM || (this._archTmpLeafM = new THREE.Matrix4());
        let ewU = null; // die ungefederte Lage der Räder (erst beim ersten Rad-Leaf)
        for (let i = 0; i < slots.length && i < flat.leaves.length; i++) {
            const { key, slot } = slots[i];
            const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(key);
            if (!g) continue;
            const lf = flat.leaves[i];
            if (lf.rad && entry._fahr) {
                if (!ewU)
                    ewU = this._archEntryWorldMatrix(
                        entry,
                        this._archTmpRadU || (this._archTmpRadU = new THREE.Matrix4()),
                        true
                    );
                this._archRadMatrix(entry, lf, ewU, m);
            } else m.multiplyMatrices(ew, lf.localMatrix);
            g.mesh.setMatrixAt(slot, m);
            g.mesh.instanceMatrix.needsUpdate = true;
            // SUBMIT-WAL — Matrix-Mutation einer ggf. gebündelten Gruppe (Fahrzeug-
            // Mount-Follow): das Region-Bundle re-recorden (nur während gefahren wird).
            if (!g.mesh.__arena) this._archMeshBundleTouch(g.mesh); // eine Arena liest Zahl und Puffer im Takt (G1)
            // boundingSphere invalidieren (Frustum-/Raycast-Cull, s. _archGroupFree; die V18.358-Lehre:
            // THREE cacht sie sonst stale).
            g.mesh.boundingSphere = null;
        }
    }

    // DAS RAD IM RITT (Welle L, Q13 F-D8 — Befund 06.10.: die Studio-Instanz war starr, 12 Blätter mit unveränderter
    // relativer Matrix — kein Rad rollte oder lenkte, beim Bremsen tauchten die Vorderräder 7,4–11,1 cm in den Boden).
    // Die Matrix eines Rad-Leafs je Schritt: ungefedert (`ewU`: Gelände-Lage ohne Aufbau-Federn) · Welt-Skala · Nabe ·
    // Lenk-Einschlag (vorn, `_rideSteerYaw` = Lenksäule des Kerns) · Drehung π der Gegenseite · Rolle um die Achse
    // (`_fahr.wheelAng` = Weg/radR des Kerns, die Gegenseite dreht im Rad-Raum gegenläufig, rollt also gleich), und das Rad
    // federt einzeln auf seinen Boden (der Aufstandspunkt der Ruhe-Lage gegen `_fahrBoden`, gedeckelt bei ±Rad-Hub
    // vehicle-core FAHR.schritt.radHub × radR) — die Ebene der vier Räder ist eine Ebene, der Boden nicht. Nur das DREHENDE
    // Teil rollt (`rd.dreht`, im Studio der Knoten radDreht); der Bremssattel (R:s) hängt an der Nabe wie im Labor (garage
    // corners: grp lenkt, wheelSpin rollt) — er lenkt und federt mit, rollt aber nie (Gegenprüfung 07.10.: er kreiste mit).
    _archRadMatrix(entry, lf, ewU, out) {
        const rd = lf.rad;
        const fz = entry._fahr;
        const R = this._archTmpRadR || (this._archTmpRadR = new THREE.Matrix4());
        const Q = this._archTmpRadQ || (this._archTmpRadQ = new THREE.Matrix4());
        const lenk = rd.front && Number.isFinite(entry._rideSteerYaw) ? entry._rideSteerYaw : 0;
        const ang = Number.isFinite(fz.wheelAng) ? fz.wheelAng : 0;
        R.makeRotationY(lenk + rd.dreh);
        if (rd.dreht) R.multiply(Q.makeRotationZ(rd.dreh ? ang : -ang));
        R.setPosition(rd.hx, rd.hy, rd.hz);
        out.multiplyMatrices(ewU, rd.welt).multiply(R);
        // das Rad federt einzeln auf seinen Boden: der Aufstandspunkt (unter der Nabe, y 0 im Vorlagen-Raum) gegen den Boden, den
        // das Auge sieht — der Stand-Leser der Sicht um den Boden des Fahr-Schritts (`_standSicht`, wie Huf und Fuß; die Sim
        // bleibt auf dem Gesetz). Bis H5 federte das Rad auf das Gesetz: an der Mess-Wiese p95 4,9 cm neben dem Mesh (K8).
        const P = this._archTmpRadP || (this._archTmpRadP = new THREE.Vector3());
        P.set(rd.hx, 0, rd.hz).applyMatrix4(rd.welt).applyMatrix4(ewU);
        const gesetz = this._fahrBoden(entry)(P.x, P.z);
        const boden = Number.isFinite(gesetz) ? this._standSicht(P.x, P.z, gesetz, false) : gesetz;
        if (Number.isFinite(boden)) {
            // der Federweg je Rad aus dem Fahr-Satz (vehicle-core fahrAufstand: radHub × radR × Skala — derselbe, mit dem die
            // Ebene des Kerns rechnet: was er nicht trägt, hob sie schon; `_fahr` lebt nur mit dem Satz)
            const hub = entry._fahrSatz.auf.hub;
            out.elements[13] += Math.max(-hub, Math.min(hub, boden - P.y));
        }
        return out;
    }

    // Eintrag aus der Registry entfernen (Slots freigeben). Default räumt IMMER BEIDE Slot-Sätze (Primär +
    // Band) → jeder Aufrufer (Cull · Prune · Remove · Rewarm · LOD-Switch) gibt Band-Slots mit frei.
    // `opts.bandOnly` räumt NUR das Band (`_updateFoundryLodBand`); der Primär-Zustand bleibt unberührt.
    _archInstanceRemove(entry, opts) {
        const bandOnly = !!(opts && opts.bandOnly);
        const lists = [];
        if (!bandOnly && entry.instSlots) lists.push(entry.instSlots);
        if (entry.instSlotsBand) lists.push(entry.instSlotsBand);
        if (!lists.length) {
            entry.instSlotsBand = null;
            entry._lodBandLevel = null;
            if (!bandOnly) [(entry.instanced = false), this._cullWecken(entry)];
            return;
        }
        // Gruppen, die nach dem Freigeben LEER sind, GANZ entsorgen (wie _disposeScatterRegion) → keine leeren
        // Gruppen beim Erkunden; Neuaufbau lazy (_archInstanceGroupFor). Welle B: JEDE Gruppe ist reapbar (die
        // geteilte Geometrie geht via _disposeArchInstanceGroup deferred frei; Leer-Bedingung liveCount<=0).
        const geleerte = new Set();
        for (const list of lists)
            for (const ref of list) {
                const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(ref.key);
                if (g) {
                    this._archGroupFree(g, ref);
                    geleerte.add(ref.key);
                }
            }
        entry.instSlotsBand = null;
        entry._lodBandLevel = null;
        if (!bandOnly) {
            this._cullWecken(entry);
            entry.instSlots = null;
            entry.instanced = false;
            entry._bruecke = false; // die Brücke lebt nur mit ihrer Karten-Instanz
            entry._lodHalt = false; // der Halt lebt nur mit seiner Stufe (die Band-Pflege urteilt neu)
            entry._lodHaltWartet = false;
        }
        for (const key of geleerte) {
            // Vollständig leer = liveCount 0 (die EINE Leer-Quelle, count folgt ihr).
            // Durch den EINEN Leer-Chokepoint mit Gnadenfrist (headless sofort).
            this._archGroupLeerDispose(key);
        }
    }

    // Alle Instancing-Gruppen abbauen (Welt-Wechsel/Restore). Geometrie +
    // Material leben im archFlattenCache (geteilt) → NICHT disposen; nur die
    // Instanz-Puffer der Senken verlassen die GPU (_instanzAbschied) + Map leeren.
    _archDisposeAllInstanceGroups() {
        if (this.state.archInstanceGroups) {
            for (const g of this.state.archInstanceGroups.values()) {
                if (g.satz) this._bauSatzMarke(g.key, g.satz); // Welle 6 — die Bereiche verlassen den Satz
                // SUBMIT-WAL — parent-bewusst: regionale InstancedMesh-Gruppen hängen
                // in Region-BundleGroups (scene.remove wäre dort ein No-op = Leck).
                if (g.mesh) this._archBundleSceneRemove(g.mesh);
                if (g.mesh) this._instanzAbschied(g.mesh);
            }
            this.state.archInstanceGroups.clear();
            this._instanzWahlGruppen().clear();
        }
        // T3 — verwaiste (bereits leere) Region-Bundles mit abbauen (Welt-Wechsel/Restore);
        // NACH den Gruppen (die Instanzen-Räumung oben kann Bundles schon leeren+löschen).
        if (this.state._regionBundles) {
            for (const bg of this.state._regionBundles.values()) {
                if (bg.parent) bg.parent.remove(bg);
                this._bundleQueryProxyTod(bg); // ④ — Query-Proxys fallen mit (kein Szene-Leck)
            }
            this.state._regionBundles.clear();
        }
        // DORF-ERLEBNIS — Zaun-Pool + Wege-Karte fallen mit; der settlementCells-Rebuild
        // (`_tickAutoSettlement`) baut sie lazy + deterministisch neu.
        this._stlWegeDispose();
    }

    // Mesh aus Eintrag (re-)bauen: Daten getrennt von Sicht — ein Eintrag in `state.architectures` kann
    // ohne Mesh existieren (gepruned) und später wieder einen bekommen. Gleiches Seed → gleicher Mesh.
    _rebuildArchitectureMesh(entry) {
        if (!this.state.scene || !entry) return null;
        // Instanzierbare Baupläne gehen in die HISM-Registry statt in eine eigene Group (Kollision aus
        // Leaf-AABBs, kein entry.mesh). Foundry-fähige Einträge platzieren ihr ECHTES Studio-Asset, nicht
        // nachgebaut: die Distanz-LOD (`entry._lodLevel`) FÜHRT, die Foundry serviert genau diese Stufe;
        // flat.instanceable → HISM, sonst bleibt der Eintrag KALT, bis der Culling-Tick (`_archIsRendered`
        // = false) ihn nachbaut. Den Klassik-Zweig prüfen Unit-Bänder unter __withNoFoundry.
        const fPreset = this._foundryEnabled() ? this._foundryPresetForEntry(entry) : null;
        if (fPreset) {
            // KALT-Platzierung: ZUERST die Distanz-LOD setzen — `_tickArchitectureLOD` überspringt kalte Einträge;
            // sonst erzwänge jeder ferne Eintrag ein L0-On-Demand-Bake (~170k) statt des vorgebackenen
            // L2-Billboards. Gilt JEDEM kalten Foundry-Eintrag (auch haus_/tor_/fels_var…), sonst klebt er auf
            // seiner Bau-Stufe. Ein-Stufen-Arten (fels [0]) klammert _foundryFlattenFor identisch.
            if (!entry.instanced && !entry.mesh) {
                const dlod = this._foundryLodForEntry(entry);
                if (Number.isFinite(dlod)) entry._lodLevel = dlod;
            }
            const fFlat = this._foundryFlattenFor(entry, fPreset, entry._lodLevel);
            if (fFlat && fFlat.instanceable) {
                entry._bruecke = false;
                this._archInstanceAdd(entry, fFlat);
                return null;
            }
            // DIE BRÜCKE: lädt die Wunsch-Stufe eines kalten Baums noch (die Anfrage ist eben gestellt), steht bis dahin
            // seine gedockte Studio-Karte — VOLL gestempelt (`_lodSlotVoll`), denn diesseits ihres Bands blendete die
            // Stufen-Maske sie aus. Der LOD-Tick wechselt auf die Wunsch-Stufe, sobald sie gedockt ist (er hält die
            // Karte bis dahin). Vorher stand hier nichts: der Kapsel-Satz des Felds war nah und mittel die Gestalt.
            // Eine 3D-Stufe kann keine Brücke sein — die Maske blendet L0/L1 außerhalb ihres Bands aus.
            // DIE BRÜCKE IST NUR BRÜCKE, WENN SIE DA IST (gedockt, `_foundryStufeBereit`): sie bestellt nichts und hebt keinen
            // Rang. Ihr Bedarf-Stempel hob bis 05.10. den kalten Karten-Bake des nahen Baums vor dessen eigene Geometrie,
            // die um Größen schneller ist (gemessen, gate:arch-feld Erst-Boot: die Karte einer Birke in 5 m ging vor elf
            // nahen Körpern in den Worker und hielt ihn 387 Takte; die Eichen-L0 brauchte 5). Den Rang einer Karte setzt,
            // wer sie als GESTALT braucht (die Fernstufe, `_foundryBuildImpostorFlat`).
            if (
                !entry.instanced &&
                entry._lodLevel < 2 &&
                this._foundryPresetIsTree(fPreset) &&
                this._foundryStufeBereit(entry, fPreset, 2)
            ) {
                const karte = this._foundryFlattenFor(entry, fPreset, 2);
                if (karte && karte.instanceable) {
                    entry._bruecke = true;
                    entry._brueckeT = performance.now(); // seit wann die Karte nah trägt (die Nah-Linse nennt die Dauer)
                    entry._lodLevel = 2;
                    this._archInstanceAdd(entry, karte);
                    return null;
                }
            }
            // Kennt die Foundry die Art, ist sie die EINE Quelle: null (lädt) ODER false (Bake-Lücke) → KALT
            // lassen, NIE die Grammatik; Culling-Tick/Refill bauen ihn als Studio, sobald das Asset da ist.
            return null;
        }
        // DIE STUDIO-GESTALT WARTET KALT (Integration 06.10.: die Glut gehört ins Studio): trägt der Bauplan eine
        // studioGestalt-Zeile (Feuerstelle · Marktstand · Ziehbrunnen · die Tore) und ist das Buch noch kalt, zeichnet
        // der Wirt NICHTS — seine Teile sind unsichtbare Substanz (Tags · Blocker · Trigger), nie ein Ersatz-Bild; der
        // Rewarm (`_foundryRewarmColdTrees`) platziert das Studio, sobald das Buch antwortet. Bis 06.10. zeichneten die
        // Wirts-Teile beim Boot (leer:g:glutbrunnen:L0 hielt danach seinen High-Water-count, 2 Befehle).
        if (this._foundryEnabled() && !(this._foundry && this._foundry.recipes)) {
            const gbp = this.state.blueprints && this.state.blueprints[entry.type];
            if (gbp && typeof gbp.studioGestalt === "string") return null;
        }
        const flat = this._archFlattenBlueprint(entry.type);
        // DETERMINISMUS-BOGEN P3 — die Architektur-Kollision ist feld-nativ
        // (`entry.blockerAABBs` aus dem Spawn + `_stepCharacterStructures`); kein
        // lazy Ammo-Collision-Build/Radius mehr.
        if (flat.instanceable) {
            this._archInstanceAdd(entry, flat);
            return null;
        }
        const builders = this._architectureBuilders();
        const builder = builders[entry.type];
        if (!builder) {
            // fail-LAUT: ein Eintrag OHNE Builder (z. B. fahrzeug_<preset> aus einem Save vor der Registrierung)
            // wäre stumm unsichtbar → ratenbegrenztes Konsolen-Wort; bei BEREITEM Buch zusätzlich ein
            // Magenta-Platzhalter, beim kalten Buch bleibt er kalt (der Ingest-Refill baut).
            const now = Date.now();
            if (!this._archKaltWarnAt || now - this._archKaltWarnAt > 10000) {
                this._archKaltWarnAt = now;
                this.log(
                    `ARCHITEKTUR OHNE BUILDER: "${entry.type}" (Buch ${this._foundry && this._foundry.ready ? "BEREIT — unbekannter Typ!" : "kalt — heilt beim Ingest"})`,
                    "WARN"
                );
            }
            if (this._foundry && this._foundry.ready && this._foundry.recipes) {
                const ph = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 0.6, 0.6),
                    new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
                );
                ph.position.set(entry.position.x || 0, (entry.position.y || 0) + 0.3, entry.position.z || 0);
                ph.name = "bau-platzhalter";
                ph.userData.__kaltPlatzhalter = entry.type;
                this.state.scene.add(ph);
                return ph;
            }
            return null;
        }
        const baseY = Number.isFinite(entry.position.y) ? entry.position.y - 0.5 : 0;
        const group = builder(entry.seed);
        group.name = "bau:" + entry.type;
        group.position.set(entry.position.x || 0, baseY, entry.position.z || 0);
        if (Number.isFinite(entry.scale) && entry.scale !== 1) {
            group.scale.setScalar(entry.scale);
        }
        // W-H (V18.179) — die Pro-Instanz-Rotation auch im Nicht-HISM-Pfad
        // (nah gerendert / Edit), damit ein Baum bei Annäherung nicht „einrastet".
        if (Number.isFinite(entry.rotationY) && entry.rotationY !== 0) {
            group.rotation.y = entry.rotationY;
        }
        this.state.scene.add(group);
        entry.mesh = group;
        this._cullWecken(entry);
        return group;
    }

    // Architektur-/Insel-/Chunk-Kollision ist feld-nativ (Dichtefeld + `entry.blockerAABBs` +
    // `_stepCharacterStructures`) — es gibt keine Ammo-Kollisions-Builder.

    // _islandDensityAt: Insel-Dichte-Feld in LOKALEN Koordinaten (Mitte bei (0,0,0)) für dieselbe
    // Surface-Nets-Pipeline wie die Voxel-Chunks. Oberseite: radiale Noise-Höhe mit Rim-Falloff;
    // Unterseite flach, zum Rand verjüngt; außen radial harte Luft (gekapselt, kein Boden-Anker).
    // Iso = `min(topY-ly, ly-botY)` im Innern. Seed-deterministisch (Multi-User-Sync).
    _islandDensityAt(lx, ly, lz, radius, height, noise) {
        const dx = lx;
        const dz = lz;
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        if (distXZ >= radius) return -1;
        const factor = 1 - distXZ / radius;
        if (factor <= 0) return -1;
        // V9.42-b — Höhen-Amplitude skaliert mit `height`-Parameter
        // (Schöpfer-Befund: "Höhenwerte zu beschränkt"). Frequenz-Mix
        // gibt mehr Variation; Basis-Lift ebenso höhen-skaliert.
        const ampScale = Math.max(1, height * 0.35);
        const h1 = noise.noise2D(lx * 0.18, lz * 0.18) * 1.5 * factor * ampScale;
        const h2 = noise.noise2D(lx * 0.45, lz * 0.45) * 0.7 * factor * ampScale;
        const h3 = noise.noise2D(lx * 0.85, lz * 0.85) * 0.35 * factor;
        const topY = Math.max(0, h1 + h2 + h3 + factor * 0.4 * ampScale);
        // Unterseite — sanft verjüngt, flach im Innern.
        const botY = -Math.max(2, height * 0.4) * factor;
        if (ly > topY || ly < botY) return -1;
        return Math.min(topY - ly, ly - botY);
    }

    spawnIslandAt(x, y, z, height = 6, opts = {}) {
        if (!this.state.scene) return null;
        // V9.42-b — Schöpfer-Wahl: Insel-Grösse jetzt bis 48 m Durchmesser
        // (vorher 24, immer gleich gefühlt) + size-Parameter ist DSL-erreichbar.
        const size = Number.isFinite(opts.size) ? Math.max(6, Math.min(48, opts.size)) : 12;
        const seedStr = opts.seed != null ? String(opts.seed) : String(this._bauSame("insel")); // Γ5, nie Math.random
        const noise = new SimplexNoise(seedStr);
        // V9.42-a — Geometrie aus der Surface-Nets-Pipeline. Voxel-Welt-Chunks
        // + Inseln teilen sich `_voxelChunkGeometry` (eine Mesh-Sprache, zwei
        // Anwendungen). Lokales Volumen mit ~1.5-Marge gegen das Iso-Band.
        const radius = size / 2;
        const step = 0.9;
        const margin = 1.5;
        const halfXZ = radius + margin;
        const dimXZ = Math.max(8, Math.ceil((2 * halfXZ) / step));
        // V9.42-b — Höhen-Amplitude wächst mit `height` (siehe _islandDensityAt).
        const ampScale = Math.max(1, height * 0.35);
        const topMax = (1.5 + 0.7) * ampScale + 0.35 + 0.4 * ampScale + margin;
        const botMin = -(Math.max(2, height * 0.4) + margin);
        const dimYNeeded = Math.max(6, Math.ceil((topMax - botMin) / step));
        const islandDensity = (px, py, pz) => this._islandDensityAt(px, py, pz, radius, height, noise);
        const geometry = this._voxelChunkGeometry(
            -halfXZ,
            botMin,
            -halfXZ,
            dimXZ,
            dimYNeeded,
            dimXZ,
            step,
            islandDensity
        );
        // Insel-Farbe per vertexColors (_attachIslandColors) — dieselbe Cel-Sprache wie der Voxel-Boden; das
        // Terrain-ShaderMaterial passt nicht (die Surface-Nets-Geometrie trägt kein aField/uv).
        this._attachIslandColors(geometry);
        // V10.0-g — Insel-Material auf ToonNodeMaterial (WebGPU-kompatibel).
        const material = this._buildToonNodeMaterial({ vertexColors: true, side: THREE.DoubleSide });
        const island = new THREE.Mesh(geometry, material);
        island.position.set(x, y, z);
        island.castShadow = true;
        island.receiveShadow = true;
        island.name = "dsl-insel";
        island.userData.sourceOp = "spawn_island";
        this.state.scene.add(island);
        if (!Array.isArray(this.state.floatingIslands)) this.state.floatingIslands = [];
        this.state.floatingIslands.push(island);
        // DETERMINISMUS-BOGEN (Entscheid #2) — die AABB-Hülle für die feld-native Kollision:
        // der Spieler kann auf einer fliegenden Insel STEHEN (Auflage auf der Oberkante) +
        // wird an ihren Flanken geblockt. Die Hülle kommt exakt aus der gebauten Geometrie.
        geometry.computeBoundingBox();
        const bb = geometry.boundingBox;
        if (bb) {
            island.userData.fieldAABB = {
                minX: x + bb.min.x,
                maxX: x + bb.max.x,
                minZ: z + bb.min.z,
                maxZ: z + bb.max.z,
                topY: y + bb.max.y,
                botY: y + bb.min.y,
            };
        }
        return island;
    }

    // UFOs sind bewusst kollisionsfrei — fliegende Beobachter, kein
    // Hindernis. Sanfte Sinus-Hover-Animation wird im Frustum-Loop
    // angewandt (selber Pfad wie initialer spawnIslands-UFO).
    spawnUfoAt(x, y, z) {
        if (!this.state.scene) return null;
        const geo = new THREE.ConeGeometry(1, 2, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0xc0e8ff });
        const ufo = new THREE.Mesh(geo, mat);
        ufo.position.set(x, y, z);
        ufo.visible = true;
        ufo.name = "dsl-ufo";
        // der Schwebe-Takt aus dem Welt-Strom (Γ5): jeder Peer sieht das UFO im selben Takt
        ufo.userData = { baseY: y, speed: 0.5 + this._samenStrom(this._bauSame("ufo"))() * 0.5, sourceOp: "spawn_ufo" };
        this.state.scene.add(ufo);
        if (!Array.isArray(this.state.ufos)) this.state.ufos = [];
        this.state.ufos.push(ufo);
        return ufo;
    }

    // Mesh disposen, Eintrag bleibt als reine Daten erhalten. Fenster für
    // späteren Wieder-Aufbau wenn der Spieler zurückkehrt.
    _cullArchitectureMesh(entry) {
        if (!entry) return;
        // V12.0-perf.c.2 — instancierter Eintrag: Slots zurück in die Registry
        // (Matrix auf Null-Scale, Free-List). P3: keine Ammo-Kollision mehr freizugeben
        // (die Feld-Kollision lebt in `entry.blockerAABBs`, render-unabhängig).
        if (entry.instanced) {
            this._archInstanceRemove(entry);
            return;
        }
        if (!entry.mesh) return;
        if (this.state.scene) this.state.scene.remove(entry.mesh);
        this._disposeSoulGroup(entry.mesh);
        entry.mesh = null;
        this._cullWecken(entry);
    }

    // Horizontaler Footprint-Radius eines Bauplans (Zentrum bis äußerster solider Part-Rand), VOR dem
    // Spawn aus bp.parts berechnet (entry.blockerAABBs entsteht erst danach) — für die Spawn-Clearance.
    _blueprintFootprintRadius(type, scale = 1) {
        // AUSLÖSCHUNGS-WELLE — Fallback auf die Substanz-Tabelle: die Spawn-Klemme
        // (`_structureSpawnPos`) darf auch über eine reine Daten-Zeile messen
        // (haus_basis als Siedlungs-Footprint-Klasse — der Blueprint ist gefallen).
        const bp =
            (this.state.blueprints && this.state.blueprints[type]) ||
            (AnazhRealm.KIND_SUBSTANCE && AnazhRealm.KIND_SUBSTANCE[type]) ||
            null;
        if (!bp || !Array.isArray(bp.parts)) return 0;
        let r = 0;
        for (const part of bp.parts) {
            if (!part || !part.size || !part.position) continue;
            const reach =
                Math.hypot(part.position.x || 0, part.position.z || 0) +
                Math.max(part.size.x || 0, part.size.z || 0) * 0.5;
            if (reach > r) r = reach;
        }
        return r * (Number.isFinite(scale) && scale > 0 ? scale : 1);
    }

    // Schiebt die Spawn-Position einer GROSSEN Struktur footprint-bewusst aus dem Spieler-Bereich (näher
    // als footprint+Margin → nach außen entlang Spieler→Ziel, bzw. Blickrichtung, wenn ~auf dem Spieler).
    // Kleine Strukturen (footprint < MIN) bleiben (intentional). Y wird am neuen Ort neu bestimmt (gleiche
    // Fußhöhe wie der Spieler → die 0.5-Kalibrierung von spawnArchitecture greift identisch).
    // `ctx.reichweite` (m): die gemessene Reichweite der Gestalt, die gesetzt wird (das Phantom, `_phantomReichweite`) —
    // sonst die Spender-Teile des Bauplans (deterministisch: Worldgen, Programme, Mitspieler urteilen gleich).
    _structureSpawnPos(type, pos, ctx, scale = 1) {
        const pp = ctx && ctx.state && ctx.state.playerMesh ? ctx.state.playerMesh.position : null;
        if (!pp || !pos) return pos;
        const footprint = Number.isFinite(ctx.reichweite)
            ? ctx.reichweite
            : this._blueprintFootprintRadius(type, scale);
        if (footprint < AnazhRealm.STRUCTURE_CLEAR_MIN_FOOTPRINT) return pos; // klein → intentional
        const clearance = footprint + AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN;
        let dx = pos.x - pp.x;
        let dz = pos.z - pp.z;
        let d = Math.hypot(dx, dz);
        // schon weit genug — unberührt; der Mikrometer macht die Klemme idempotent (ein geklemmter Ort liegt sonst um ein ulp
        // innen, und die Wurzel klemmte ihn ein zweites Mal — mit der Fußhöhe des Spielers statt dem Boden des Suchers)
        if (d >= clearance - 1e-6) return pos;
        if (d < 1e-3) {
            // ~auf dem Spieler → vor ihn (die EINE Vorwärts-Richtung)
            const yaw = typeof ctx.state.yaw === "number" ? ctx.state.yaw : ctx.rng ? ctx.rng() * Math.PI * 2 : 0;
            const vorn = this._blickVorn(yaw, 0);
            dx = vorn.x;
            dz = vorn.z;
            d = 1;
        }
        const nx = pp.x + (dx / d) * clearance;
        const nz = pp.z + (dz / d) * clearance;
        // gleiche Fußhöhe über Grund wie der Spieler am neuen Ort bewahren
        const surfPlayer = this.getTerrainHeightAt(pp.x, pp.z);
        const surfNew = this.getTerrainHeightAt(nx, nz);
        const feetOffset = Number.isFinite(surfPlayer) ? pp.y - surfPlayer : 0;
        const ny = Number.isFinite(surfNew) ? surfNew + feetOffset : pos.y;
        return { x: nx, y: ny, z: nz };
    }

    // Restore); centerY wird aus pos.y abgeleitet, mit Boden-Heuristik
    // (pos.y - 0.5 ≈ Spielerfußhöhe falls at_player benutzt wurde).
    // Die Kennung eines Werks aus Art und Same; trägt die Welt sie schon (derselbe Akt zweimal), die nächste freie Folge.
    _werkKennung(type, seed) {
        const basis = "w-" + type + "-" + (seed >>> 0).toString(36);
        const da = (id) => this.state.architectures.some((e) => e.id === id);
        let id = basis;
        for (let k = 2; da(id); k++) id = basis + "~" + k;
        return id;
    }

    spawnArchitecture(type, position, opts = {}) {
        // JEDE ABSAGE DER WURZEL TRÄGT IHREN GRUND (Schau-2, Gegenprüfung Runde 3): `opts.absage(grund)` — der Setz-Op zählt sie,
        // der Satz des Ergebnisses (`_ergebnisSatz`, `SETZ_GRUND`) sagt sie; vorher fiel ein Wurf hier still.
        const nein = (grund) => {
            if (typeof opts.absage === "function") opts.absage(grund);
            return null;
        };
        // FOUNDRY-SPAWN-WAND: Studio-Blueprints (fahrzeug_/haus_/tor_/klinge_*) existieren erst nach get-book
        // → kaltes Buch = LAUTER ERROR statt unsichtbarem Tot-Spawn. Opt-out: Worldgen/silent + Restore
        // (precise+id) — die heilen beim Ingest/Rewarm. Die Restore-id ist auch eine ZAHL (Worldgen-ids,
        // `_loadStateRestoreArchitectures`): die Wand nahm nur Text-ids, jeder Reload mit noch kaltem Buch warf
        // die Studio-Häuser der Welt weg, und der nächste Save schrieb den Verlust fest (gate:persistence K).
        const _fdrySpawnHeal =
            opts.silent === true ||
            (opts.precise === true && ((typeof opts.id === "string" && opts.id) || Number.isFinite(opts.id)));
        if (this._foundryEnabled() && this._foundryNeedsBookForType(type) && !_fdrySpawnHeal) {
            const f = this._foundry;
            if (!f || !f.ready || !f.recipes) {
                this.log(
                    `FOUNDRY KALT: spawnArchitecture("${type}") BLOCKIERT — Buch/Worker fehlt (warte Boot, kein stilles Nichts).`,
                    "ERROR"
                );
                return nein("buch");
            }
            if (!(this.state.blueprints && this.state.blueprints[type])) {
                this.log(
                    `FOUNDRY KALT: spawnArchitecture("${type}") BLOCKIERT — Blueprint fehlt trotz Buch (unbekanntes Preset?).`,
                    "ERROR"
                );
                return nein("unbekannt");
            }
        }
        const builders = this._architectureBuilders();
        if (!builders[type]) {
            if (this._foundryEnabled() && this._foundryNeedsBookForType(type)) {
                const f = this._foundry;
                this.log(
                    `FOUNDRY KALT: spawnArchitecture("${type}") — kein Builder (Buch ${f && f.ready ? "bereit/unbekannt" : "kalt"})`,
                    "ERROR"
                );
                return nein(f && f.ready ? "unbekannt" : "buch");
            }
            this.log(`spawnArchitecture: unbekannter Typ '${type}'`, "ERROR");
            return nein("unbekannt");
        }
        if (!this.state.scene) return nein("buehne");
        // DIE TAT BLEIBT, WO DAS GESETZ NEU SETZT (speicher.K3): ein Wurf des Gesetzes fällt, wo eine Tat ihn nahm (`_tatSperrt`)
        if (opts.ausGesetz === true && position && this._tatSperrt(position.x, position.z)) return nein("tat");
        // Der Same eines Werks ohne eigenen (Bau einer Kreatur, Plattform, Portal) kommt aus dem Welt-Strom seiner Art (Γ5,
        // Lehre 7) — nie Math.random: der Mitspieler und der Reload sähen ein anderes Werk.
        const seed = Number.isFinite(opts.seed) ? opts.seed : this._bauSame("bau:" + type);
        const scale = Number.isFinite(opts.scale) && opts.scale > 0 ? opts.scale : 1;
        // Die EINE Spieler-Klemme an der WURZEL (jeder Spawn-Pfad). Präzisions-Opt-outs: opts.silent
        // (Worldgen-Determinismus), string-id (Multi-User-Sync/confirmBuild, bit-treu), opts.precise
        // (Restore/Tests); kleine Spawns (< 3 m Footprint) sind frei. AUTONOME (Nexus-)Spawns werden IMMER
        // geklemmt, auch mit precise — der Fraktal-Pfad nutzt precise.
        const _playerClamp =
            opts.autonomous === true || (!opts.silent && !opts.precise && !(typeof opts.id === "string" && opts.id));
        if (_playerClamp && position) {
            position = this._structureSpawnPos(type, position, { state: this.state }, scale);
        }
        // DIE WASSER-WAND DER WERKE an der Wurzel (Schau-2 wasser-wahrheit, Gegenprüfung): ein NEUES Werk mit Grundriss-Gesetz
        // (Haus, Tempel, Ausstattung — `_grundrissVon` mit der Art), dessen Ort die Welt wählt (der Satz, der Nexus, ein Programm, die
        // Siedlung, eine Kreatur), steht mit dem ganzen Fundament auf dem Land — geurteilt am Ort NACH der Spieler-Klemme
        // (sie schob ein Haus vom Spieler weg ins Wasser). Ein Werk mit eigener id steht, wo es gewollt oder gespeichert ist:
        // der Bau-Modus und sein Mitspieler (string-id), der Reload (precise + id), die Tor-Vorschau. Befund: der Satz fragte
        // nur die Mitte — „bau mir ein haus am wasser" setzte 11 von 11 Fundamente 0,92–3,68 m tief ins Wasser.
        if (position && opts.id == null && this._werkImWasser(type, position, opts, seed)) {
            this.log(
                `WERK IM WASSER: ${type} bei ${Math.round(position.x)}/${Math.round(position.z)} — sein Fundament stünde im Wasser, kein Bau.`,
                "INFO"
            );
            return nein("wasser");
        }
        // DIE KENNUNG EINES WERKS AUS EINEM AKT ist eine Funktion des Akts (feld.K2): Art und Same reisen mit dem Programm, jeder
        // Peer und jeder Reload nennt es gleich, der Abbau eines Mitspielers trifft es (`remove_architecture`). Bis feld-k2k3 zählte
        // die Seite (`architectureNextId`): „bau mir ein haus" hieß bei A 463, bei B 471 (gate:mp-sync (e)).
        const kennung =
            typeof opts.id === "string" && opts.id
                ? opts.id
                : opts.werk === true && Number.isFinite(opts.seed)
                  ? this._werkKennung(type, opts.seed)
                  : this.state.architectureNextId++;
        const entry = {
            id: kennung,
            type,
            position: { x: position.x || 0, y: position.y || 0, z: position.z || 0 },
            seed,
            scale,
            // W-H (V18.179) — die Pro-Instanz-Yaw (Klon-Killer; default 0 =
            // Bauwerke unberührt, nur Vegetation/Felsen setzen sie).
            rotationY: Number.isFinite(opts.rotationY) ? opts.rotationY : 0,
            mesh: null,
        };
        // Seed-deterministische Pro-Instanz-Tönung aus drei Seed-Bit-Bändern (>>>13, >>>21, >>>5):
        // NEUTRAL-NAHER Jitter (±8 % Luminanz + ±3 % warm/kühl), denn `_archInstanceAdd` multipliziert die
        // Werte als RGB (rohe HSV-Werte = Farbwurf, halb so hell). Nur useInstanceTint-Materialien lesen sie.
        // Bit-treu im Snapshot; explizite opts.tintH/S/V (Restore) führen vor der Seed-Berechnung.
        if (Number.isFinite(opts.tintH)) {
            entry.tintH = Math.max(0, Math.min(1.2, +opts.tintH));
        } else {
            const _tl = 0.92 + (((seed >>> 13) & 0xff) / 255) * 0.16;
            const _tw = (((seed >>> 21) & 0xff) / 255 - 0.5) * 0.06;
            entry.tintH = Math.min(1.08, _tl + _tw);
            entry.tintS = _tl;
            entry.tintV = Math.min(1.08, Math.max(0, _tl - _tw));
        }
        if (Number.isFinite(opts.tintS)) {
            entry.tintS = Math.max(0, Math.min(1.2, +opts.tintS));
        }
        if (Number.isFinite(opts.tintV)) {
            entry.tintV = Math.max(0, Math.min(1.2, +opts.tintV));
        }
        // Perpetuum-Verbot: die HERKUNFT entscheidet den Ertrag — ein GRATIS geborenes Spieler-Werk
        // (schöpfer-Modus ohne Material) erntet 0 (sonst Modus-Wäsche schöpfer→pfad = Material aus dem
        // Nichts). Worldgen/Nexus-Spawns tragen die Marke NICHT.
        if (opts.freeBorn === true) entry.freeBorn = true;
        // DIE MARKE DES WURFS (K10-6): eine Art des Felds (`FELD_WURF`), die das Feld warf (`_enqueueVegetationSpawn`), weicht
        // dem Bau (`_weichtDemBau`); dieselbe Art aus dem Satz, dem Bau-Modus oder der KI ist Bau. Sie reist durch den Save.
        if (opts.feldWurf === true && AnazhRealm.FELD_WURF.includes(type)) entry.feldWurf = true;
        // DIE HERKUNFT DES WERKS (die Wiederkehr): was ein Wort setzte — der Bau-Modus und sein Mitspieler (Text-id), der Satz,
        // die KI, eine Regel des Spielers (`opts.werk`, die Spawn-Ops der DSL ohne das Feld) —, ist Werk und weicht keinem
        // Räumer (`_weichtDemBau`), gleich aus welchem Stoff. Sie reist durch den Save.
        if (opts.werk === true || (typeof opts.id === "string" && opts.id)) entry.werk = true;
        // Der Guss-Stempel reist am Eintrag (Snapshot + P2P): NUR ein non-leeres plain object, tief
        // JSON-kopiert, max 8 KiB (dieselbe Taille-Wand wie _carryUnknown — ein Riesenstempel wäre ein
        // Quota-DoS). _foundryFlattenFor liest ihn als Unikat-ov.
        const praegung = AnazhRealm._stempelVon(opts.studioOv);
        if (praegung) entry.studioOv = praegung;
        // DORF-IN-TERRAIN — der Fundament-Footprint reist am Eintrag (Snapshot + Restore):
        // die halben Ausdehnungen {ex,ez} und der Versatz seiner Mitte zum Haus-Ursprung {ox,oz}
        // (haus-lokal, Welle L — das Hof-Haus reicht 4 m vor seinen Ursprung; ein älterer Stand ohne
        // Versatz liegt mittig), klein und geklemmt; die Podest-TIEFE leitet der Konsument LIVE aus
        // dem Dichte-Feld ab (deterministisch, nie persistiert).
        if (opts.fundament && Number.isFinite(opts.fundament.ex) && Number.isFinite(opts.fundament.ez)) {
            entry.fundament = {
                ex: Math.max(0.5, Math.min(24, +opts.fundament.ex)),
                ez: Math.max(0.5, Math.min(24, +opts.fundament.ez)),
            };
            const fo = opts.fundament;
            if (Number.isFinite(fo.ox) && Number.isFinite(fo.oz) && (fo.ox || fo.oz)) {
                entry.fundament.ox = Math.max(-24, Math.min(24, +fo.ox));
                entry.fundament.oz = Math.max(-24, Math.min(24, +fo.oz));
            }
        }
        // TÜR-ZEILE des Settlement-Exports am Eintrag (Snapshot + Restore): Tür-Rect + Kern-Footprint W/D,
        // haus-lokal. Konsumenten: `_hausBlockerBoxen` (die Kern-Hülle, bis das Studio die Hülle der Stufe liefert) +
        // `_tickHausTueren`.
        if (opts.tuer && Number.isFinite(opts.tuer.w) && Number.isFinite(opts.tuer.W) && Number.isFinite(opts.tuer.D)) {
            try {
                entry.tuer = JSON.parse(JSON.stringify(opts.tuer));
            } catch (_e) {
                /* nicht-serialisierbar → keine Tür-Zeile (fail-closed) */
            }
        }
        // KAMIN-RAUCH (.105): Spitze haus-lokal → userData.rauchQuelle (Invariant: Rauch ⟺ chimney).
        if (
            opts.chimney &&
            Number.isFinite(opts.chimney.x) &&
            Number.isFinite(opts.chimney.y) &&
            Number.isFinite(opts.chimney.z)
        ) {
            const tip = { x: +opts.chimney.x, y: +opts.chimney.y, z: +opts.chimney.z };
            entry.chimney = tip; // Snapshot/Restore (tuer-Muster)
            entry.userData = entry.userData || {};
            entry.userData.rauchQuelle = tip;
        } else if (opts.chimney === null) entry.chimney = null;
        // KAMIN-RAUCH (.108): das Solo-Haus (nicht Settlement-Slot) kennt seine Spitze, wenn sein Haus steht — sie reist mit der
        // Hülle aus dem Foundry-Worker (`__huelle.kamin`, gesetzt in `_hausHuelleSetzen`). Bis B3c baute der Wirt dafür das GANZE
        // Haus im Haupt-Faden (`chimneyTipFromParams` → `massBau`, beim ersten Haus mit den Karten des Labors): die Portal-
        // Vorschau hielt den kalten Boot vor dem ersten Weltbild 1,6–1,9 s (Radeon), jedes Haus der KI 150–160 ms.
        // V18.297 — autonom vom Nexus gespawnt → vom Cap (`_capNexusStructures`) bounded.
        // Die Welt wächst, hortet aber nicht: ist das Limit erreicht, verblasst das Fernste.
        if (opts.autonomous === true) entry.autonomous = true;
        // DIE WELT IST EINE FUNKTION (speicher.K3, Gebot 7): was Saat und Gesetz setzen (`opts.ausGesetz`: Wurf des Felds, Streu,
        // Ort), rechnet jeder Boot neu — der Stand trägt es nie, nur die Tat an ihm (`harvestArchitecture`); die Marke reist nie.
        if (opts.ausGesetz === true) entry._ausGesetz = true;
        // Affordances EINMAL beim Spawn berechnen (nicht pro Frame); Welt-Reaktionen lesen entry.affordances.
        // Bauplan-Edits wirken nur auf NEUE Spawns (Snapshot wie precisionCap).
        const bp = this.state.blueprints && this.state.blueprints[type];
        if (bp) {
            const tags = this.computeCompoundTags(bp); // EINMAL je Spawn: Urteil und Stärke lesen dieselben Tags
            entry.affordances = this.computeBlueprintAffordances(bp, tags);
            // W10 ext. Politur — die Affordance-Stärke wird wie das Profil
            // EINMAL beim Spawn eingefroren (Substanz-Schnappschuss).
            entry.affordanceStrength = this.computeAffordanceStrength(bp, entry.affordances, tags);
            this._werkGesetzSetzen(entry, bp); // das Werk gehorcht der EINEN Statik in der Welt: es steht, stürzt, rollt, fängt Regen
            // Gewachsene Bäume tragen Species + VariantIndex am Eintrag → `_tickArchitectureLOD` wechselt die
            // Stufe per Distanz ohne Identitätsverlust. Der Wald reicht `_lodSpecies` + `_lodVariantIndex`
            // EXPLIZIT herein, ohne Varianten-Geometrie eager zu bauen; `_rebuildArchitectureMesh` wählt die
            // Quelle (Studio; grown nur lazy ohne Studio). Nicht-Bäume unberührt.
            if (typeof opts._lodSpecies === "string" && Number.isFinite(opts._lodVariantIndex)) {
                entry._lodSpecies = opts._lodSpecies;
                entry._lodVariantIndex = opts._lodVariantIndex;
                entry._lodLevel = Number.isFinite(opts._lodLevel) ? opts._lodLevel : 0;
            } else if (bp._isGrown && typeof bp._grownSpecies === "string" && Number.isFinite(bp._variantIndex)) {
                entry._lodSpecies = bp._grownSpecies;
                entry._lodVariantIndex = bp._variantIndex;
                entry._lodLevel = Number.isFinite(bp._lodLevel) ? bp._lodLevel : 0;
                // Jeder grown-Baum ist ein echtes Welt-Ding → seine Cell wird „promoted" markiert; die Scatter-Bitmask
                // schützt den Slot vor späterer Deko (sonst setzte die GPU-Aktivierung eine zweite Instanz).
                if (this._scatterMarkCellPromoted) {
                    this._scatterMarkCellPromoted(position.x, position.z, "tree");
                }
                if (this._scatterRegisterCell) {
                    this._scatterRegisterCell(position.x, position.z, "tree", bp._grownSpecies, bp._variantIndex);
                }
            }
        }
        // DER PLATZ (Leben-Schau 2): wählt die Welt den Ort (dieselbe Weiche wie die Spieler-Klemme), steht ein Wagen auf
        // fahrbarem Grund; ein präziser Ort bleibt bit-treu. DER STAND (W5): er parkt auf der Ebene seiner vier Räder.
        if (_playerClamp && !this._fahrPlatzSuche(entry)) return nein("platz");
        this._fahrzeugStand(entry);
        this.state.architectures.push(entry);
        this._blockerEintritt(entry);
        this._cullWecken(entry, "ein");
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte
        // DER BESTAND DER KRONEN-KARTE: ein Wald-Baum trägt seine Krone ein, wo er als Eintrag entsteht — Pflanzung,
        // Promotion und der Reload des Zweit-Boots gehen alle hier durch (`removeArchitecture` nimmt sie heraus).
        const _krone = this._kronenRadiusFuer(type, entry.scale);
        if (_krone) this._kronenStreuNeu("a:" + entry.id, entry.position.x, entry.position.z, _krone);
        // Blocker-AABBs je Architektur cachen: solide Parts (dichte ≥ 0.3) ergeben `entry.blockerAABBs` für
        // den Cell-Stempel. Kein Type-Whitelist — die Substanz entscheidet (Stamm stempelt, Laub nicht).
        this._populateBlockerAABBs(entry);
        // DER GRUND DES HAUSES (S4) ist Plan-Datum: ein Haus ohne Ort legt ihn beim Setzen, vor dem Bau der Chunks um ihn
        this._hausGrundSetzen(entry);
        // DIE EINE RÄUMUNG an der Wurzel jedes Baus mit Grundriss (Haus, Lichtung, jeder Bau mit Boxen): was die Natur dort
        // schon geworfen hat, weicht (`_grundrissRaeumen`, sie baut das Gitter neu) — Dorf, Genesis-Platz, Tore, Spieler, KI
        // und Probe gleich. Nach den Boxen: sie sind der Grundriss eines Baus ohne Haus-Zeile (K52).
        if (this._grundrissVon(entry)) this._grundrissRaeumen(entry);
        // Voxel-Chunks im Footprint dirty markieren → das Cell-Feld wird mit dem Architektur-Stempel neu
        // gebaut (Damm-Cells SOLID, Wasser-Cells im Stempel überschrieben). Eine Pflanze stempelt nicht
        // (`_stempelSpanne`): ihr Bau lässt die Zellen und den Automaten in Ruhe.
        const stempel = entry.blockerAABBs ? entry.blockerAABBs.filter((a) => !a.stempelfrei) : [];
        if (!opts.silent && stempel.length) {
            const { span: _fpSpan } = this._voxelChunkConfig();
            const footprintKeys = new Set();
            const fussabdruecke = [];
            for (const aabb of stempel) {
                const cxw = (aabb.minX + aabb.maxX) * 0.5;
                const czw = (aabb.minZ + aabb.maxZ) * 0.5;
                const r = Math.max(aabb.maxX - aabb.minX, aabb.maxZ - aabb.minZ) * 0.5;
                fussabdruecke.push({ cx: cxw, cz: czw, r });
                // `skirt=0`: nur die Chunks unter der Architektur-AABB neu bauen, keine Skirt-Nachbarn (Density
                // unverändert → keine Naht-Inkonsistenz) — ~89 % weniger dirty-Chunks, kein Bau-Klick-Spike.
                this._remeshVoxelChunksAround(cxw, czw, r, 0);
                // V18.1 — die Footprint-Chunk-Keys sammeln (gleiches Raster wie
                // `_remeshVoxelChunksAround` mit skirt=0) für den Wasser-Sync unten.
                const minCX = Math.floor((cxw - r) / _fpSpan);
                const maxCX = Math.floor((cxw + r) / _fpSpan);
                const minCZ = Math.floor((czw - r) / _fpSpan);
                const maxCZ = Math.floor((czw + r) / _fpSpan);
                for (let fcx = minCX; fcx <= maxCX; fcx++)
                    for (let fcz = minCZ; fcz <= maxCZ; fcz++) footprintKeys.add(`${fcx},${fcz}`);
            }
            // Verdrängt die Architektur WASSER, muss ihr Footprint SYNCHRON neu meshen: ferne Chunks baut
            // `_rebuildVoxelChunk` async (Worker) → das Wasser stünde sichtbar IN der Struktur, bis der Rebuild
            // kommt. Nur wasser-tragende, schon gestreamte Footprint-Chunks (bounded); ohne Chunk-Map nichts.
            for (const key of this.state.voxelChunks ? footprintKeys : []) {
                const fe = this.state.voxelChunks.get(key);
                if (!fe || !fe.waterCells) continue;
                const comma = key.indexOf(",");
                const fcx = parseInt(key.slice(0, comma), 10);
                const fcz = parseInt(key.slice(comma + 1), 10);
                this._rebuildVoxelChunk(fcx, fcz, null, { forceSync: "fussabdruck" });
                if (this.state.dirtyVoxelChunks) this.state.dirtyVoxelChunks.delete(key);
            }
            // Mutiert eine solide Architektur die Cell-Klassifikation (Wasser strömt um den Damm), antwortet die
            // Welt mit einem kurzen Strömungs-Hauch — nur wo Wasser ist. KEIN Journal-Eintrag je Spawn (Journal-Idempotenz).
            this._playWaterReactionPing(fussabdruecke);
            // V18.129 — eine solide Architektur kann ein DAMM sein: das Wasser staut sich auf. DER AUTOMAT WACHT NUR, WO DIE
            // WELT ABWEICHT (Schau-2 wasser-wahrheit, die Lehre W-W1 der Welle L): nur ein Stempel, der eine Wasser-Zelle
            // überschreibt, ist ein Damm — und er wacht dort, wo der Stempel in die Zellen kommt (`_stampArchitectureSolidCellsInto`,
            // im Neubau des Fußabdrucks oben), nie hier. Bis V18.537 weckte JEDER Bau den Automaten im weiten Stau-Radius —
            // sechs Eichen am Ufer des Flusses −872/−1127 weckten 15 Chunks, der Automat rechnete den fließenden Fluss in
            // ganzen Zellen nach, der Quellen-Pin füllte das Tal: nach 20 s standen 6 von 6 Stämmen 1,9–3,8 m unter Wasser.
        }
        // V2: kein Cap mehr — wir bauen den Mesh nur, wenn der Spieler nahe
        // genug ist. Sonst bleibt der Eintrag „cold" (nur Daten) und der
        // Culling-Tick baut ihn auf, sobald der Spieler herankommt.
        const playerPos = this.state.playerMesh ? this.state.playerMesh.position : null;
        const inRange =
            !playerPos ||
            Math.hypot(entry.position.x - playerPos.x, entry.position.z - playerPos.z) <=
                this.state.architectureCullingRadius;
        if (inRange) this._rebuildArchitectureMesh(entry);
        this.log(
            `Struktur gebaut: ${type} bei (${entry.position.x.toFixed(1)}, ${entry.position.z.toFixed(1)})${scale !== 1 ? ` ×${scale.toFixed(2)}` : ""}${inRange ? "" : " (cold)"}`,
            "DEBUG"
        );
        // Welt-Effekte (awe/hope-Boost, Singing) antworten auf SPIELER-Gesten, nicht auf die eigene Saat:
        // Worldgen (populateChunkVegetation) setzt `silent`. Proximity-Boosts (tickPlayerBoosts) wirken
        // unabhängig davon beim Näherkommen.
        if (!opts.silent) {
            this._applyCompoundWorldEffects(type);
        }
        return entry;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_satz]);

// ===== ATLAS · Siedlung/satz — Außen-Konstanten =====
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
AnazhRealm.KIND_SUBSTANCE = Object.freeze({
    geraet_schwert: {
        label: "Schwert",
        parts: [
            {
                shape: "octahedron",
                material: "eisen",
                color: 10133670,
                position: { x: 0, y: 0.13, z: 0 },
                size: { x: 0.26, y: 0.26, z: 0.26 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "cylinder",
                material: "leder",
                color: 4863270,
                position: { x: 0, y: 0.43000000000000005, z: 0 },
                size: { x: 0.07, y: 0.34, z: 0.07 },
                segments: 8,
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "octahedron",
                material: "eisen",
                color: 10133670,
                position: { x: 0, y: 0.6400000000000001, z: 0 },
                size: { x: 0.46, y: 0.1, z: 0.16 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "bladeProfile",
                material: "eisen",
                color: 13094098,
                position: { x: 0, y: 1.405, z: 0 },
                size: { x: 0.2, y: 1.45, z: 0.06 },
                tipWidth: 0.34,
                fuller: 0.5,
                heightSegments: 16,
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
    },
    geraet_spitzhacke: {
        label: "Spitzhacke",
        parts: [
            {
                shape: "cylinder",
                material: "holz",
                color: 7227944,
                position: { x: 0, y: 0.6867654114030302, z: 0 },
                size: { x: 0.1, y: 1.3735308228060603, z: 0.1 },
                segments: 6,
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "pickHead",
                material: "eisen",
                color: 12173254,
                position: { x: 0, y: 1.4314084202637896, z: 0 },
                size: { x: 0.47407894089054187, y: 0.1929253248590976, z: 0.14 },
                curve: 0.21169302093330772,
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
    },
    fahrzeug_wagen: {
        label: "Wagen",
        parts: [
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 0.85, z: 0 },
                size: { x: 1.2852911676524672, y: 0.35, z: 2.076239578515524 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "spokeWheel",
                material: "eisen",
                spokes: 8,
                position: { x: -0.8540178782735021, y: 0.36, z: 0.8 },
                size: { x: 0.8451017794599757, y: 0.14, z: 0.8451017794599757 },
                rotation: { x: 0, y: 0, z: 1.5707963 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "spokeWheel",
                material: "eisen",
                spokes: 8,
                position: { x: 0.8540178782735021, y: 0.36, z: 0.8 },
                size: { x: 0.8451017794599757, y: 0.14, z: 0.8451017794599757 },
                rotation: { x: 0, y: 0, z: 1.5707963 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "spokeWheel",
                material: "eisen",
                spokes: 8,
                position: { x: -0.8540178782735021, y: 0.36, z: -0.8 },
                size: { x: 0.8451017794599757, y: 0.14, z: 0.8451017794599757 },
                rotation: { x: 0, y: 0, z: 1.5707963 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "spokeWheel",
                material: "eisen",
                spokes: 8,
                position: { x: 0.8540178782735021, y: 0.36, z: -0.8 },
                size: { x: 0.8451017794599757, y: 0.14, z: 0.8451017794599757 },
                rotation: { x: 0, y: 0, z: 1.5707963 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: -0.7235429246483838, y: 1.22, z: 0 },
                size: { x: 0.0988685513578821, y: 0.4, z: 1.927936751478701 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0.7235429246483838, y: 1.22, z: 0 },
                size: { x: 0.0988685513578821, y: 0.4, z: 1.927936751478701 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 1.22, z: 0.97 },
                size: { x: 1.2852911676524672, y: 0.4, z: 0.0988685513578821 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 1.22, z: -0.97 },
                size: { x: 1.2852911676524672, y: 0.4, z: 0.0988685513578821 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: -0.7116815652279184, y: 1.32, z: 0.92 },
                size: { x: 0.12852911676524673, y: 0.62, z: 0.12852911676524673 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0.7116815652279184, y: 1.32, z: 0.92 },
                size: { x: 0.12852911676524673, y: 0.62, z: 0.12852911676524673 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: -0.7116815652279184, y: 1.32, z: -0.92 },
                size: { x: 0.12852911676524673, y: 0.62, z: 0.12852911676524673 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0.7116815652279184, y: 1.32, z: -0.92 },
                size: { x: 0.12852911676524673, y: 0.62, z: 0.12852911676524673 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            // die Achsstöcke tragen das Bett (als Latten von 0,13 m ließen sie es 0,25 m schweben — die Statik ließ es stürzen)
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0, y: 0.49, z: 0.8 },
                size: { x: 1.5818968217261136, y: 0.38, z: 0.14830282703682313 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0, y: 0.49, z: -0.8 },
                size: { x: 1.5818968217261136, y: 0.38, z: 0.14830282703682313 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0, y: 0.62, z: 1.95 },
                size: { x: 0.12852911676524673, y: 0.13, z: 1.7796339244418777 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                color: 5913890,
                position: { x: 0, y: 0.62, z: 2.78 },
                size: { x: 0.9392512378998799, y: 0.11, z: 0.10875540649367031 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
        connections: [
            { type: "sitz", partA: 0, partB: -1 },
            { type: "hafting", partA: 1, partB: 0 },
            { type: "hafting", partA: 2, partB: 0 },
            { type: "hafting", partA: 3, partB: 0 },
            { type: "hafting", partA: 4, partB: 0 },
        ],
    },
    tor_basis: {
        label: "Torbogen",
        parts: [
            {
                shape: "box",
                material: "stein",
                position: { x: -1.7, y: 1.7, z: 0 },
                size: { x: 0.6, y: 3.4, z: 0.7 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 1.7, y: 1.7, z: 0 },
                size: { x: 0.6, y: 3.4, z: 0.7 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 3.65, z: 0 },
                size: { x: 4.2, y: 0.5, z: 0.7 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 0.1, z: 0 },
                size: { x: 4.4, y: 0.2, z: 1.2 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
    },
    haus_basis: {
        label: "Haus",
        parts: [
            {
                shape: "box",
                material: "holz",
                position: { x: -1.925, y: 1.55, z: -2.55 },
                size: { x: 2.55, y: 3.1, z: 0.3 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 1.925, y: 1.55, z: -2.55 },
                size: { x: 2.55, y: 3.1, z: 0.3 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "stein",
                position: { x: 0, y: 1.55, z: 2.55 },
                size: { x: 6.4, y: 3.1, z: 0.3 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: -3.05, y: 1.55, z: 0 },
                size: { x: 0.3, y: 3.1, z: 4.8 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 3.05, y: 1.55, z: 0 },
                size: { x: 0.3, y: 3.1, z: 4.8 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
            {
                shape: "box",
                material: "holz",
                position: { x: 0, y: 3.25, z: 0 },
                size: { x: 6.6, y: 0.3, z: 5.6 },
                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
            },
        ],
    },
});
// WEGE_KARTE (`_wegeKarteEnsure`): die welt-verankerte Clipmap der Siedlungs-Wege um den Spieler, je Stufe ein
// Fenster (Kante `fensterM`, Texel `texelM`), Umzug ab `umzugM` Abstand zur Mitte — gesichert ist fensterM/2 −
// umzugM: NAH 512 m zu 0,5 m (ein 2,5-m-Weg = 5 Texel, die Kante bilinear weich), gesichert 208 m ≥ die Ring-Kante
// 194 m des Standard-Rings; FERN 2048 m zu 2 m, gesichert 768 m ≥ der größte Chunk-Ring (12,5 × 43,2 = 540 m).
// Der Rand fällt über ±max(randM, randMinM) weich (getretene Erde läuft in die Wiese aus; fern ≥ 1 Texel).
AnazhRealm.WEGE_KARTE = Object.freeze({
    stufen: Object.freeze([
        Object.freeze({ name: "nah", fensterM: 512, texelM: 0.5, umzugM: 48, randMinM: 0 }),
        Object.freeze({ name: "fern", fensterM: 2048, texelM: 2, umzugM: 256, randMinM: 2 }),
    ]),
    randM: 0.6,
});
// DIE LAUB-STREU UNTER DEN KRONEN (`_kronenStreuNeu`, Welle 5 Boden): je Wege-Stufe eine R8-Karte im selben Fenster — `texelM` je Stufe
// (nah 1 m, fern 4 m: 512² = 256 KB je Stufe); eine Krone legt `dichte` Laubstreu bis `kern` × Kronen-Radius, weich
// fallend bis `rand` × Radius (die Krone des Studio-Baums reicht über den Schüchternheits-Radius hinaus, das Laub weht
// vor die Traufe), Kronen summieren sich (zwei überlappende decken den Grund); `kroneJeHoehe` = Kronen-Radius je Meter
// Sichthöhe für Streu-Arten ohne Kronen-Eintrag im Wald-Generator; `uploadMs` = höchstens ein Upload je Stufe in diesem
// Takt; `zelleM` = die Kante der Index-Zellen des Kronen-Registers (ein Nah-Umzug fragt ≤ 30 Zellen, ein ferner ≤ 204 —
// um den größten Laub-Rand 21 m erweitert —, nie den Bestand).
AnazhRealm.LAUB_STREU = Object.freeze({
    texelM: Object.freeze([1, 4]),
    dichte: 0.6,
    kern: 1.0,
    rand: 1.7,
    kroneJeHoehe: 0.35,
    uploadMs: 250,
    zelleM: 64,
});
// DIE WÜRFE DES FELDS (K10-6) — die Arten, die das Affinitäts-Feld wirft (`_vegetationSampleSpawn`: der Sieger der Affinität
// je Sample): die Baumarten, der Fels, die Geode und die Feuerstelle des Glut-Felds. Was das Feld wirft, trägt die Marke des
// Wurfs (`feldWurf`, `_enqueueVegetationSpawn`) und weicht dem Bau wie die Natur (`_weichtDemBau`): es sperrt keinem Ort den
// Grund (`_bauFrei`), und der Grundriss eines Baus und der Weg eines Dorfs räumen es (`_naturRaeumen`); dieselbe Art aus dem
// Satz, dem Bau-Modus oder der KI ist Bau. Die Feuerstelle ist keine Art des Terrain-Studios (ihre Gestalt trägt das Fachwerk) —
// bis K10-6 stand sie als Bau: eine im Grundriss des Dorfs der Zelle −4,−4 schob die Ort-Wahl von 80 auf 96 m, je nach
// Lade-Stand der Würfe.
AnazhRealm.FELD_WURF = Object.freeze([
    "baum_eiche",
    "baum_kiefer",
    "baum_birke",
    "baum_erle",
    "baum_buche",
    "baum_tanne",
    "baum_karst",
    "stein_block",
    "kristall_geode",
    "glutbrunnen",
]);
// Die Instanz-Attribute der LOD-Fassade (`_lodInstanceFacade`) mit ihrer Breite: Sichthöhen (aH0/aH0L), Billboard-
// die Karte (aKarte = Atlas-Schicht, Halbbreite, Höhe — template-lokal — und die Sichthöhe, negativ = verdeckt).
AnazhRealm.LOD_INSTANZ_ATTRIBUTE = { aH0: 1, aH0L: 1, aKarte: 4 };
{
    // Die Ökologie der Streu ist das Gesetz des Kerns (phyto-core SCATTER_STRATUM), fail-closed — kein Zahlen-Zwilling hier.
    const _eco = (n) => {
        const s = globalThis.__phytoCore.SCATTER_STRATUM[n];
        if (!s || ![s.floor, s.scaleBase, s.scaleVar, s.slopeMax].every(Number.isFinite))
            throw new Error("phyto-core fehlt: SCATTER_STRATUM." + n + " (die Ökologie der Streu)");
        return s;
    };
    const _ecoTree = _eco("tree");
    const _ecoUnder = _eco("under");
    const _ecoRock = _eco("rock");
    // V18.491.118 — ecology from `__phytoCore.SCATTER_STRATUM`; caps stay Host.
    AnazhRealm.SCATTER = Object.freeze({
        cellM: 3.4, // Plan §3.5 — Baum-Zell-Raster (die Canopy-Schicht)
        regionM: 256, // eine Scatter-Region = 16 Voxel-Chunks (= Bake-Region V18.219)
        promoteM: 64, // < diesem Radius → der Scatter-Baum wird ein ECHTER Bauplan (Touch→Real)
        innerM: 64, // innerhalb: keine Deko-Streu (der promovierte/reale Ring trägt)
        outerM: 384, // äusserer Rand der Deko-Streu (jenseits trägt die Canopy-Shell)
        ringRegions: 1, // ±1 Region = 3×3 (768m²) aktiver Scatter-Ring
        perRegionCap: 1400, // (Legacy — die Baum-Schicht; die layers-Liste trägt jetzt die Caps)
        densityFloor: _ecoTree.floor, // lebendig-Boden für jeden Baum-Scatter
        densityScale: 1.5, // Multiplikator auf die lebendig-getriebene Wahrscheinlichkeit
        slopeMax: _ecoTree.slopeMax, // Steilhänge tragen weniger Scatter (Fels-Zone)
        maxRegionsPerFrame: 1, // bounded: max 1 Region/Frame generieren (Plan §5)
        // Mehrschichtige Dichte: Canopy (Bäume) + Strauch + Kraut + Bodenflora + Fels; Strauch/Kraut/Blume
        // teilen den feineren under-Pass, jeder Pass mit eigenem Zell-Raster + Cap. Region = 256 m ≈ 35 Chunks.
        // Die Streu-Schicht (litter → baum_totholz, eine belaubte Eiche als „Totholz") fiel W1 final.
        layers: Object.freeze([
            // Baum-Schicht: wenige, große, varianz-reiche Bäume (hohes scaleVar → ragende Alte + junge) statt
            // vieler dünner Stacheln; der niedrige cap hält offenes Waldland (Terrain/Fels/Blumen sichtbar).
            Object.freeze({
                name: "tree",
                cellM: 3.4,
                // V18.296 (Schöpfer-Anordnung, 20+ Versionen überfällig: „sehe immernoch
                // hunderte Bäume … wir gehen runter"): cap 300→90 (~2.6 Bäume/Chunk =
                // offenes Waldland, freie Sicht auf Terrain/Fels/Substanz). REVERSIBEL.
                cap: 55, // V18.303 90→55: das Laub war 90 % der GPU-Last (gemessen) + Schöpfer „zu viele Bäume, sonst kaum was"
                floor: _ecoTree.floor,
                scaleBase: _ecoTree.scaleBase,
                scaleVar: _ecoTree.scaleVar,
                slopeMax: _ecoTree.slopeMax,
                kind: "tree",
                promotable: true,
            }),
            // Understory (Strauch+Kraut+Bodenflora): Cap bleibt < treeCap, damit die Bäume die prominente
            // Substanz bleiben — viel Gestrüpp verdeckte sie und kostete FPS.
            Object.freeze({
                name: "under",
                cellM: 2.4,
                cap: 40, // V18.303 70→40 (das Laub = 90 % der GPU-Last); V18.296 250→70
                floor: _ecoUnder.floor,
                scaleBase: _ecoUnder.scaleBase,
                scaleVar: _ecoUnder.scaleVar,
                slopeMax: _ecoUnder.slopeMax,
                kind: "under",
                promotable: false,
            }),
            // FELS: Kiesel + Brocken, wo der Fels durchbricht (rockExposure aus slope+trocken+kahl). Eigener
            // densityScale, hoher slopeMax (Fels mag steil), große Skalen-Varianz. Deko, nicht promotable.
            Object.freeze({
                name: "rock",
                cellM: 2.6,
                cap: 110, // V18.303 350→110: 350 Kiesel/Region = absurd viele Instanzen für winzigen Look-Wert (der größte Instanz-Posten nach den Bäumen)
                floor: _ecoRock.floor,
                scaleBase: _ecoRock.scaleBase,
                scaleVar: _ecoRock.scaleVar,
                slopeMax: _ecoRock.slopeMax,
                densityScale: 1.3,
                kind: "rock",
                promotable: false,
            }),
        ]),
    });
}
// Die Laub-Layer: FOLIAGE_LAYER ist die non-breaking Vorbedingung eines eigenen Laub-Passes: das Laub
// trägt die Layer ZUSÄTZLICH (Layer 0 bleibt → Render/Schatten unverändert), ist so aber für einen
// Laub-Pass (`pass.setLayers(FOLIAGE_LAYER)`) isoliert wählbar. Headless → 1.
AnazhRealm.FOLIAGE_LAYER = 1; // eigene Render-Layer für den reduziert aufgelösten Laub-Pass (Layer 0 bleibt aktiv)
AnazhRealm.BERG_CULL = Object.freeze({
    minDist: 140, // m — nahe Regionen nie verdeckt (Sicherheits-Zone, Pop-frei)
    proben: 5, // Höhen-Proben je Sichtlinie
    tMin: 0.2, // Proben-Fenster entlang der Linie (Kamera 0 → Kugel 1):
    tMax: 0.85, //   nie direkt an Kamera/Kugel (dort deckt minDist bzw. die Kugel selbst)
    marge: 2, // m — das Terrain muss die Linie KLAR überragen (konservativ, nie knapp)
    testMsSichtbar: 400, // Re-Test-Kadenz sichtbarer Regionen (amortisiert)
    testMsVerdeckt: 150, // verdeckte testen HÄUFIGER → schneller Un-Cull hinterm Grat
    budgetJeFrame: 6, // max Berg-Tests je Frame (≤ 6×15 Gesetz-Proben ≈ sub-ms)
    queryTakt: 10, // Occlusion-Query-Probe-Fenster: nur jeder N-te Frame fragt (Dawn-QuerySet-Cliff)
    stummFenster: 6, // so viele Probe-Fenster ohne begonnene Abfrage, dann meldet der Berg-Cull den Stellvertreter laut
});
AnazhRealm.STRUCTURE_CLEAR_MIN_FOOTPRINT = 3.0; // darunter = klein/intentional → nicht schieben
