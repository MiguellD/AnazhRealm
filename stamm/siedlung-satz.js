//# allFunctionsCalledOnLoad
class AnazhRealm_siedlung_satz {
    // ===== ATLAS · Siedlung/satz — Bau-Satz · Satz-Kern · Bau setzen · Fundament · Katalog · Arten-Substanz · Inseln =====
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
                    : {
                          name,
                          mat: satzMat,
                          wurf: !!castShadow,
                          // der Stein-Stoff liest seine Lage im Verband aus dem uv (`_steinStoff`): sein Satz trägt es mit
                          attr: satzMat.userData.stein ? AnazhRealm.BAU_STEIN_ATTR : undefined,
                      }
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
        const regler = attr !== AnazhRealm.BAU_WURF_ATTR ? AnazhRealm._satzRegler(g.mesh.material) : null;
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
        const regler = attr !== AnazhRealm.BAU_WURF_ATTR ? AnazhRealm._satzRegler(g.mesh.material) : null;
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
            attr !== AnazhRealm.BAU_WURF_ATTR ? AnazhRealm._satzRegler(g.mesh.material) : null
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
            // die Sicht eines verschränkten Puffers (die Jahres-Ecken, `_jahrEcken`) liest dicht (`_sichtDicht`)
            const qa = q.isInterleavedBufferAttribute ? AnazhRealm._sichtDicht(q) : q.array;
            const src = jeInstanz || (v0 === 0 && v1 === n0) ? qa : qa.subarray(v0 * is, v1 * is);
            // je Rechnung EIN Kern (`_satzKern*`, K69): eine kleine Funktion, eine Schleife, immer dieselben Array-Arten — die
            // Rechnung des Blocks hält ihre optimierte Form. Vorher lag jede Schleife in diesem Rumpf, und der Wechsel eines
            // Hauses auf die Stufe 0 fiel in die unoptimierte Rechnung: im Null-Gang ins Dorf ein Teil mit 56k Ecken 34–92 ms
            // beim ersten und zweiten Bau, beim dritten 7 ms (der Heap wuchs um 7–14 MB, jede Zahl ein Objekt).
            for (let j = 0; j < cnt; j++) {
                const o0 = j * n * is;
                const i = ab + j;
                // die Mitte eines Blatts (`aCenter`, das Jahr) ist eine Lage wie die Ecke
                if (name === "position" || name === "aCenter")
                    AnazhRealm._satzKernLage(out, o0, src, n, M.fromArray(im, i * 16).elements);
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

    // DIE DICHTE SICHT eines verschränkten Puffers (die Jahres-Ecken, `_jahrEcken`): je Ecke die Werte der Sicht hintereinander,
    // wie ein eigenes Attribut sie trüge — einmal gerechnet und am Attribut gehalten, solange sein Puffer derselbe ist (die
    // Gestalt ändert ihre Ecken nie; ein GPU-Abschied hebt nur die Version).
    static _sichtDicht(q) {
        if (q.__dicht && q.__dichtVon === q.data.array) return q.__dicht;
        const n = q.count,
            is = q.itemSize,
            s = q.data.stride,
            o = q.offset,
            a = q.data.array;
        const d = new Float32Array(n * is);
        for (let i = 0; i < n; i++) for (let c = 0; c < is; c++) d[i * is + c] = a[i * s + o + c];
        q.__dicht = d;
        q.__dichtVon = a;
        return d;
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
            this._freiKoerperSetzen(entry, bp); // ein freier Bauplan (Kiste, Fass) ist ein Starrkörper des Lösers (physik.K3)
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
        if (_krone) this._kronenStreuNeu("a:" + entry.id, entry.position.x, entry.position.z, _krone, NaN, entry);
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
// Die Attribute eines Stein-Satz-Bereichs (w4-genesis-tore): Lage · Normale · Farbe · Regler · Glut und das uv der Ecken — die Lage
// im Verband des Stein-Gesetzes (porta STEIN_GESETZ, `_steinStoff`: u = Stein + Weg, v = seine Länge). Die drei Stempel der Blende
// fehlen: ein Bau steht auf dem Null-Stempel, der Stein-Stoff blendet nie (`_foundryTreeMaterial`) — mit ihnen trüge der Satz 9
// Vertex-Puffer (WebGPU 8, das Gerät sagte das Programm ab). Das uv in 32 Bit: die Nummer des Steins reicht bis 4096, die Fuge liest
// ihren Bruchteil (16 Bit trügen dort 4 Einheiten). Jede Bau-Satz-Form außer dem Wurf trägt die Regler je Ecke.
AnazhRealm.BAU_STEIN_ATTR = Object.freeze([
    ...AnazhRealm.BAU_SATZ_ATTR.filter(([n]) => n !== "aLodLevel" && n !== "aH0" && n !== "aH0L"),
    Object.freeze(["uv", 2]),
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
AnazhRealm.STRUCTURE_CLEAR_MIN_FOOTPRINT = 3.0; // darunter = klein/intentional → nicht schieben
