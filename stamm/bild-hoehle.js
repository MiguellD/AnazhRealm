class AnazhRealm_bild_hoehle {
    // ===== ATLAS · Bild/hoehle — Höhlen-Sicht: Knoten und Portale · Horizont · Riss und Rand · die Sicht unter Tage · ihr Licht und ihr Rechteck am Schirm =====
    // ═══ DIE HÖHLEN-SICHT (Welle 7) ═══
    // Befund (echte GPU, Mess-Wiese −900/−850, Gitter-Probe): 68 % der Boden-Kanten trennen Fels von HÖHLEN-Luft (Luft unter
    // der obersten festen Ecke ihrer Spalte, `_voxelHoehlenGraph`), 16–52 m tief, und der Boden-Satz zeichnete sie in JEDEM
    // Pass mit — von der Wiese aus sieht man sie nie, eine Tiefen-Grenze risse an Mündungen, Überhängen und Klippen Löcher.
    // Die Sicht folgt der Luft: ein Strahl aus der Himmels-Luft betritt die Höhlen-Luft nur durch eine MÜNDUNG und wandert
    // von Zelle zu Zelle nur durch ein PORTAL (im Chunk über eine Teil-Grenze, über die Chunk-Kante durch die Rand-Bänder).
    // Je Pass läuft das Schirm-Rechteck jeder Mündung durch die Portale (Schnitt je Portal, Vereinigung je Zelle — die
    // klassische Portal-Sicht); eine Zelle, die ein Rechteck erreicht, zeichnet. Steht das Auge in einer Zelle (perspektivisch,
    // in ihrer Luft-Box), läuft ihr ganzes Bild. Die Kaskade (orthogonal, das Licht) läuft dieselbe Rechnung im Licht-Raum:
    // die Schatten-Karte trägt je Strahl die ERSTE Fläche vom Licht, und die liegt in Himmels-Luft oder hinter einer Mündung —
    // jede andere Höhlen-Fläche ändert die Karte nie. Die Kosten folgen dem Bild: je Pass die Mündungen und die erreichten
    // Zellen, nie die Weltgröße.

    // Die Knoten eines Boden-Bereichs aus dem Höhlen-Graph seines Chunks (Boxen in Welt-Lage, um den Saum geweitet); sein
    // Horizont entsteht beim ersten Lesen (`_hoehlenHorizont`).
    _hoehlenKnoten(s, b, H) {
        if (!s.hoehle)
            s.hoehle = {
                stempel: 0,
                muendungen: new Set(),
                stapel: [],
                rect: new Float64Array(6),
                besucht: null,
                kacheln: null, // die Licht-Kacheln der Kaskade (`_hoehlenSichtLicht`)
                sichtHaupt: null, // die Zellen, die das letzte Hauptbild erreichte (die Empfänger der Kaskaden)
                sichtGen: 0, // zählt jede neue Menge `sichtHaupt` — eine Kaskade, die andere Empfänger las, wählt neu
                voll: false, // trug die letzte perspektivische Sicht jede Mündung im Bild mit ihrer Sperre?
                // die Generation des Bodens: jeder Ein- und Austritt eines Boden-Bereichs und jeder Geomorph-Schreiber legt den
                // Horizont neu — eine gemerkte Sperre gilt nur dem Boden, den sie gemessen hat (`_hoehlenSperre`)
                boden: 0,
            };
        s.hoehle.boden++;
        const saum = AnazhRealm.HOEHLEN_SAUM.schritte * H.step + AnazhRealm.HOEHLEN_SAUM.m;
        const box = (A, o, weit) => {
            if (!(A[o] <= A[o + 3])) return null;
            const bx = new THREE.Box3(
                new THREE.Vector3(A[o], A[o + 1], A[o + 2]),
                new THREE.Vector3(A[o + 3], A[o + 4], A[o + 5])
            );
            return weit ? bx.expandByScalar(saum) : bx;
        };
        const knoten = [];
        for (let z = 0; z < H.n; z++)
            knoten.push({
                bereich: b,
                id: z,
                luft: box(H.knoten, z * 6, true),
                // die Mündungen der Zelle (je Fach eine Box, um den Saum geweitet) mit ihrer Horizont-Sperre je Auge
                tore: [],
                seiten: [0, 1, 2, 3].map((sd) => box(H.seiten, z * 24 + sd * 6, false)),
                // je Seite die offene Rand-Box (der Nachbar-Chunk fehlt, `_hoehlenRand`), sonst null
                raender: [null, null, null, null],
                nb: [],
                zelle: null,
                sicht: 0,
                rect: new Float64Array(4),
                z: 0,
                // der letzte Lauf aus der Zelle in diesem Pass (Stempel, Rechteck, Tiefe) — derselbe läuft nie zweimal
                lauf: 0,
                gelaufen: new Float64Array(5),
            });
        for (let o = 0; o < H.muend.length; o += 7)
            knoten[H.muend[o]].tore.push({
                box: box(H.muend, o + 1, true),
                sperre: -Infinity,
                auge: [NaN, NaN, NaN],
                boden: -1,
            });
        for (let o = 0; o < H.kanten.length; o += 8) {
            const a = knoten[H.kanten[o]];
            const c = knoten[H.kanten[o + 1]];
            const p = this._hoehlenPortal(box(H.kanten, o + 2, true));
            a.nb.push({ zu: c, p });
            c.nb.push({ zu: a, p });
        }
        // `starts`/`startHuelle`: die Knoten mit Mündung oder offenem Rand und die Hülle ihrer Boxen (`_hoehlenRand`)
        b.hoehle = { knoten, step: H.step, rand: H.rand, horizont: null, starts: [], startHuelle: null };
    }

    _hoehlenPortal(box) {
        return { box, rect: new Float64Array(6), st: 0, auf: false };
    }

    // DER HORIZONT eines Boden-Bereichs (lazy, `_hoehlenHorizontProbe`): je Zelle eines Rasters von `HOEHLEN_HORIZONT_M`
    // über seiner Fläche eine UNTERE Schranke des gezeichneten Himmels-Bodens. Die Quelle ist die Boden-Karte des Chunks
    // (`_bodenKarteAusMesh`: die oberste nicht-steile Fläche des fertigen Meshs, Punkte im Abstand step/Teilung) — das
    // Minimum ihrer Punkte in der Zelle und einen Punkt-Abstand darum, minus die Hang-Schranke (eine nicht-steile Fläche,
    // |n_y| ≥ 0,3, fällt zwischen zwei Punkten um höchstens tan(acos 0,3) · Abstand · √½) und den größten Abstieg, den der
    // Geomorph einem Vertex dieser Zelle gibt (der Vertex-Shader zeichnet zwischen Position und Morph-Ziel). Ein Punkt ohne
    // Boden (Wand, Höhle, außerhalb) macht die Zelle offen (−∞). Ein Geomorph-Schreiber legt den Horizont neu
    // (`_chunkSatzMarke`).
    _hoehlenHorizont(s, b) {
        const span = this._voxelChunkConfig(0).span;
        const R = AnazhRealm.HOEHLEN_HORIZONT_M;
        const n = Math.round(span / R);
        const h = new Float32Array(n * n).fill(-Infinity);
        const ent = this.state.voxelChunks ? this.state.voxelChunks.get(b.chunkKey) : null;
        const map = ent && ent.surfMap;
        if (!map) return h;
        const cfg = this._voxelChunkConfig(ent.lod || 0);
        const T = AnazhRealm.BODEN_KARTE_TEILUNG;
        const a = cfg.step / T;
        const M = T * (cfg.dim + 3) + 1;
        const ox = b.cx * span - cfg.step,
            oz = b.cz * span - cfg.step;
        // der Geomorph-Abstieg je Raster-Zelle (und ihre Nachbarn)
        const morph = new Float32Array(n * n);
        const A = s.geom.attributes;
        const P = A.position.array,
            Z = A.aMorphTarget.array;
        // der Abstieg zum Ziel ganz (K51-2): das Stufen-Gewicht folgt dem Auge, jedes Ziel kann ganz gezeichnet werden
        for (let v = b.vStart; v < b.vStart + b.vAnzahl; v++) {
            const ab = P[v * 3 + 1] - Z[v * 3 + 1];
            if (!(ab > 0)) continue;
            const I = Math.floor((P[v * 3] - b.cx * span) / R),
                K = Math.floor((P[v * 3 + 2] - b.cz * span) / R);
            for (let k = K - 1; k <= K + 1; k++)
                for (let i = I - 1; i <= I + 1; i++)
                    if (i >= 0 && k >= 0 && i < n && k < n && ab > morph[i + k * n]) morph[i + k * n] = ab;
        }
        const hang = Math.tan(Math.acos(0.3)) * a * Math.SQRT1_2;
        for (let K = 0; K < n; K++)
            for (let I = 0; I < n; I++) {
                const xa = b.cx * span + I * R,
                    za = b.cz * span + K * R;
                const i0 = Math.floor((xa - ox) / a) - 1,
                    i1 = Math.ceil((xa + R - ox) / a) + 1,
                    k0 = Math.floor((za - oz) / a) - 1,
                    k1 = Math.ceil((za + R - oz) / a) + 1;
                let mn = Infinity;
                for (let k = k0; k <= k1 && mn > -Infinity; k++)
                    for (let i = i0; i <= i1; i++) {
                        const v = i >= 0 && k >= 0 && i < M && k < M ? map[i + k * M] : NaN;
                        if (!(v >= -Infinity)) {
                            mn = -Infinity;
                            break;
                        }
                        if (v < mn) mn = v;
                    }
                h[I + K * n] = mn - hang - morph[I + K * n];
            }
        return h;
    }

    // Die Rand-Portale zu den Nachbar-Chunks im Satz. Gleiche Stufe: derselbe Welt-Punkt auf der gemeinsamen Kante liegt in
    // beiden Gittern (`rand` des Graphs, gleiche Indizes) — jedes Paar Höhlen-Punkt ↔ Höhlen-Punkt verknüpft seine zwei Zellen,
    // das Portal ist die Box dieser Punkte (um den Saum geweitet). Eine Höhlen-Komponente, die die Kante kreuzt, trägt dort
    // einen Gitter-Punkt (ein 6-Pfad wechselt die Ebene nur über einen Punkt auf ihr). An einer LOD-Naht (verschiedene
    // Schritte) teilen die Gitter nicht jeden Punkt: dort schneidet die Rand-Band-Box einer Zelle die der Nachbar-Zelle,
    // beide um den gröberen Saum geweitet. Danach legen der Bereich und seine Nachbarn ihre offenen Ränder neu.
    _hoehlenVerknuepfe(s, b) {
        const R = AnazhRealm.HOEHLEN_SAUM;
        const x = new THREE.Box3(),
            y = new THREE.Box3();
        const span = this._voxelChunkConfig(0).span;
        const oy = (this.state.terrainBaseHeight || 0) - this._voxelChunkConfig(0).floorDrop;
        for (let seite = 0; seite < 4; seite++) {
            const n = this._hoehlenNachbar(s, b, seite);
            if (!n) continue;
            const gegen = seite ^ 1;
            const knA = b.hoehle.knoten,
                knB = n.hoehle.knoten;
            const verbinde = (a, c, box) => {
                const p = this._hoehlenPortal(box);
                a.nb.push({ zu: c, p });
                c.nb.push({ zu: a, p });
            };
            if (b.hoehle.step === n.hoehle.step) {
                const step = b.hoehle.step;
                const saum = R.schritte * step + R.m;
                // die Gegen-Kante des Nachbarn: (j, u) → Zelle
                const gegenueber = new Map();
                const rn = n.hoehle.rand;
                for (let o = 0; o < rn.length; o += 4)
                    if (rn[o] === gegen) gegenueber.set(rn[o + 1] * 65536 + rn[o + 2], rn[o + 3]);
                const paare = new Map();
                const ra = b.hoehle.rand;
                // die Welt-Lage der Kante und der Gitter-Ursprung (Pad: ein Schritt vor der Chunk-Kante)
                const ox = b.cx * span - step,
                    oz = b.cz * span - step;
                const kante =
                    seite === 0
                        ? b.cx * span
                        : seite === 1
                          ? (b.cx + 1) * span
                          : seite === 2
                            ? b.cz * span
                            : (b.cz + 1) * span;
                for (let o = 0; o < ra.length; o += 4) {
                    if (ra[o] !== seite) continue;
                    const zc = gegenueber.get(ra[o + 1] * 65536 + ra[o + 2]);
                    if (zc === undefined) continue;
                    const za = ra[o + 3];
                    const key = za * 65536 + zc;
                    let bx = paare.get(key);
                    if (!bx) paare.set(key, (bx = new THREE.Box3()));
                    const wy = oy + ra[o + 1] * step;
                    if (seite < 2) bx.expandByPoint(x.min.set(kante, wy, oz + ra[o + 2] * step));
                    else bx.expandByPoint(x.min.set(ox + ra[o + 2] * step, wy, kante));
                }
                for (const [key, bx] of paare) {
                    const a = knA[Math.floor(key / 65536)],
                        c = knB[key % 65536];
                    if (a && c) verbinde(a, c, bx.expandByScalar(saum));
                }
                continue;
            }
            const saum = R.schritte * Math.max(b.hoehle.step, n.hoehle.step) + R.m;
            for (const a of knA) {
                const sa = a.seiten[seite];
                if (!sa) continue;
                x.copy(sa).expandByScalar(saum);
                for (const c of knB) {
                    const sc = c.seiten[gegen];
                    if (!sc) continue;
                    y.copy(sc).expandByScalar(saum);
                    if (x.intersectsBox(y)) verbinde(a, c, x.clone().intersect(y));
                }
            }
            this._hoehlenRiss(b, n, seite, saum, span, oy, verbinde);
        }
        this._hoehlenRandUm(s, b);
    }

    // DER RISS DER LOD-NAHT: das gröbere Gitter verliert eine Höhle, die schmaler ist als sein Schritt — wo ein Höhlen-Punkt des
    // feinen Rands (`rand` des Graphs) keinen Höhlen-Punkt des groben Rands binnen dessen Schritt hat, endet die feine Luft an
    // der Naht ohne Wand: ein Strahl aus ihr läuft in den ungezeichneten Fels des Nachbarn und trifft dort jede seiner
    // Höhlen-Flächen von hinten. Der Riss ist ein Portal der feinen Zelle zu jeder Zelle des groben Bereichs außer der
    // versiegelten (Zelle 0 zeichnet nie, `_voxelHoehlenGraph`), seine Box die Riss-Punkte um den Saum geweitet. Bis hierher
    // endete die Sicht an der Naht: der Blick hinaus am Genesis-Ort (2,−4 Stufe 0 neben 3,−4 Stufe 1, das Höhlen-Feld folgt
    // dem Erdbau) sah die Höhle 3,−4#41 durch den Riss als Loch (gate:hoehlen-sicht).
    _hoehlenRiss(b, n, seite, saum, span, oy, verbinde) {
        const [F, C, sF] = b.hoehle.step < n.hoehle.step ? [b, n, seite] : [n, b, seite ^ 1];
        const sC = sF ^ 1;
        const fS = F.hoehle.step,
            cS = C.hoehle.step;
        // der Ursprung längs der Kante (Pad: ein Schritt vor der Chunk-Kante) — beide Gitter teilen die Kante und `oy`
        const lF = (sF < 2 ? F.cz * span : F.cx * span) - fS,
            lC = (sC < 2 ? C.cz * span : C.cx * span) - cS;
        const grob = new Set();
        const rc = C.hoehle.rand;
        for (let o = 0; o < rc.length; o += 4) if (rc[o] === sC) grob.add(rc[o + 1] * 65536 + rc[o + 2]);
        const kante =
            sF === 0 ? F.cx * span : sF === 1 ? (F.cx + 1) * span : sF === 2 ? F.cz * span : (F.cz + 1) * span;
        const risse = new Map(); // feine Zelle → Box ihrer Riss-Punkte
        const v = new THREE.Vector3();
        const rf = F.hoehle.rand;
        for (let o = 0; o < rf.length; o += 4) {
            if (rf[o] !== sF) continue;
            const wy = oy + rf[o + 1] * fS,
                wl = lF + rf[o + 2] * fS;
            // gedeckt: ein grober Höhlen-Punkt binnen eines groben Schritts (je Achse)
            const jg = (wy - oy) / cS,
                ug = (wl - lC) / cS;
            let gedeckt = false;
            for (let j = Math.ceil(jg - 1); j <= Math.floor(jg + 1) && !gedeckt; j++)
                for (let u = Math.ceil(ug - 1); u <= Math.floor(ug + 1) && !gedeckt; u++)
                    gedeckt = grob.has(j * 65536 + u);
            if (gedeckt) continue;
            let bx = risse.get(rf[o + 3]);
            if (!bx) risse.set(rf[o + 3], (bx = new THREE.Box3()));
            bx.expandByPoint(sF < 2 ? v.set(kante, wy, wl) : v.set(wl, wy, kante));
        }
        const knF = F.hoehle.knoten;
        for (const [zf, bx] of risse) {
            const a = knF[zf];
            if (!a) continue;
            bx.expandByScalar(saum);
            for (const c of C.hoehle.knoten) if (c.id !== 0) verbinde(a, c, bx.clone());
        }
    }

    // Der Nachbar-Bereich eines Boden-Bereichs an einer Seite (0 −x · 1 +x · 2 −z · 3 +z), sofern er einen Höhlen-Graph trägt.
    _hoehlenNachbar(s, b, seite) {
        const n = s.bloecke.get(
            b.cx + (seite === 0 ? -1 : seite === 1 ? 1 : 0) + "," + (b.cz + (seite === 2 ? -1 : seite === 3 ? 1 : 0))
        );
        return n && n.hoehle ? n : null;
    }

    // Der Bereich und seine vier Nachbarn legen ihre offenen Ränder neu.
    _hoehlenRandUm(s, b) {
        this._hoehlenRand(s, b);
        for (let seite = 0; seite < 4; seite++) {
            const n = this._hoehlenNachbar(s, b, seite);
            if (n) this._hoehlenRand(s, n);
        }
    }

    // DER OFFENE RAND: fehlt der Nachbar-Chunk einer Seite (der Ring endet dort), liegt die Höhlen-Luft im Rand-Band offen —
    // der Ring schneidet die Höhle auf, und ein Strahl von draußen (das Licht, eine Kamera jenseits des Rings) tritt dort ein.
    // Die Rand-Box (um den Saum geweitet) wirkt wie eine Mündung; ein Knoten mit Mündung oder offenem Rand ist ein Start.
    // Je Bereich die Starts und die Hülle aller ihrer Boxen (Mündungen und Ränder): ein Pass, dessen Gesetz die Hülle nicht
    // trifft, prüft keinen dieser Starts (Welle C — vorher prüfte jeder Pass jede Mündung des Rings).
    // Ein Rand, der sich öffnet oder schließt, hebt den Stand des Satzes (jede Wahl liest neu) — nur dann (w24-fahrt-takt: der Strom
    // der Fahrt legte bei jedem Ein- und Austritt die Ränder des Bereichs und seiner vier Nachbarn neu, je Nachbar fiel der Stand,
    // auch an Seiten, an denen nichts offen lag — je Fall wählte jeder Pass den ganzen Satz neu).
    _hoehlenRand(s, b) {
        if (!b || !b.hoehle) return;
        const R = AnazhRealm.HOEHLEN_SAUM;
        const saum = R.schritte * b.hoehle.step + R.m;
        const fehlt = [0, 1, 2, 3].map((seite) => !this._hoehlenNachbar(s, b, seite));
        const starts = [];
        const huelle = new THREE.Box3();
        let anders = false;
        for (const kn of b.hoehle.knoten) {
            let offen = kn.tore.length > 0;
            for (const tor of kn.tore) huelle.union(tor.box);
            for (let seite = 0; seite < 4; seite++) {
                const sb = fehlt[seite] ? kn.seiten[seite] : null;
                const alt = kn.raender[seite];
                kn.raender[seite] = sb ? sb.clone().expandByScalar(saum) : null;
                if (!alt !== !kn.raender[seite] || (alt && !alt.equals(kn.raender[seite]))) anders = true;
                if (sb) {
                    offen = true;
                    huelle.union(kn.raender[seite]);
                }
            }
            if (offen) {
                s.hoehle.muendungen.add(kn);
                starts.push(kn);
            } else s.hoehle.muendungen.delete(kn);
        }
        const H = b.hoehle;
        anders ||= !H.starts || !this._satzListeGleich(H.starts, starts);
        anders ||= !H.startHuelle !== !starts.length || (starts.length > 0 && !H.startHuelle.equals(huelle));
        H.starts = starts;
        H.startHuelle = starts.length > 0 ? huelle : null;
        if (anders) s.stand++;
    }

    // Der Austritt eines Boden-Bereichs: seine Starts fallen, die Nachbar-Zellen vergessen ihre Rand-Portale zu ihm, und seine
    // Nachbarn liegen an dieser Seite nun offen.
    _hoehlenLoese(s, b) {
        s.hoehle.boden++;
        for (const kn of b.hoehle.knoten) {
            s.hoehle.muendungen.delete(kn);
            for (const e of kn.nb) if (e.zu.bereich !== b) e.zu.nb = e.zu.nb.filter((f) => f.zu.bereich !== b);
        }
        b.hoehle = null;
        for (let seite = 0; seite < 4; seite++) {
            const n = this._hoehlenNachbar(s, b, seite);
            if (n) this._hoehlenRand(s, n);
        }
    }

    // DIE HORIZONT-SPERRE einer Mündung (perspektivisch): der größte waagerechte Abstand d vom Auge, an dem JEDER Strahl zur
    // Box unter dem gezeichneten Boden läuft — ein Bogen um das Auge (Abstand d, über den Winkel-Keil ihrer Grundfläche)
    // trägt überall Boden, der höher liegt als jeder Strahl zur Box dort sein kann (die Gerade vom Auge zum höchsten Punkt
    // der Box, über den kürzesten bzw. längsten Weg); −∞, wenn kein Bogen sperrt. Unter dem Boden liegt Fels oder Höhlen-Luft:
    // ein Strahl aus Himmels-Luft kommt an einer Sperre nur durch eine Höhle vorbei, und hinter der fernsten Sperre läuft er
    // aus einer Höhle, deren Ausgang weiter weg liegt (`_hoehlenHinaus`). Der Boden ist die untere Schranke
    // `_hoehlenHorizont`; ein ungeladener Ort hat keinen Boden (−∞). Der Bogen wird je Raster-Zelle abgetastet, jeder Punkt
    // liest das Minimum seiner 3 × 3 Zellen (ein Bogen-Stück zwischen zwei Punkten liegt in ihnen). Gemerkt je Auge — für
    // jedes Auge im Würfel ±`HOEHLEN_AUGE_M` um das geprüfte (die Probe hebt das Auge und weitet die Box um ihn; die 3 × 3
    // Zellen tragen die Verschiebung): das Auge der Spiel-Kamera atmet im Stand um Millimeter, und jede Probe neu wäre
    // Arbeit ohne Änderung. Und je BODEN (`H.boden`): ein neuer Horizont — ein Chunk tritt ein oder aus (der Spieler gräbt,
    // der Ring wandert), ein Geomorph senkt den Rand — erreicht jede gemerkte Sperre; ohne das sperrte im Stand ein
    // gegrabener Hang die Mündung dahinter, bis das Auge 0,25 m ginge.
    _hoehlenSperre(s, tor, ex, ey, ez) {
        if (this._hoehlenAugeGleich(s.hoehle, tor, ex, ey, ez)) return tor.sperre;
        const t = AnazhRealm.HOEHLEN_AUGE_M;
        tor.boden = s.hoehle.boden;
        tor.auge[0] = ex;
        tor.auge[1] = ey;
        tor.auge[2] = ez;
        const box = this._hoehlenProbenBox || (this._hoehlenProbenBox = new THREE.Box3());
        tor.sperre = this._hoehlenHorizontProbe(s, box.copy(tor.box).expandByScalar(t), ex, ey + t, ez);
        return tor.sperre;
    }

    _hoehlenAugeGleich(H, tor, ex, ey, ez) {
        const t = AnazhRealm.HOEHLEN_AUGE_M;
        return (
            tor.boden === H.boden &&
            Math.abs(tor.auge[0] - ex) <= t &&
            Math.abs(tor.auge[1] - ey) <= t &&
            Math.abs(tor.auge[2] - ez) <= t
        );
    }

    // Der Boden an der Raster-Zelle (I, K) der Welt (`HOEHLEN_HORIZONT_M`): die untere Schranke ihres Bereichs, −∞ ohne.
    _hoehlenBodenZelle(s, I, K, c) {
        const n = c.n;
        const kx = Math.floor(I / n),
            kz = Math.floor(K / n);
        if (kx !== c.kx || kz !== c.kz) {
            c.kx = kx;
            c.kz = kz;
            const b = s.bloecke.get(kx + "," + kz);
            c.h = b && b.hoehle ? b.hoehle.horizont || (b.hoehle.horizont = this._hoehlenHorizont(s, b)) : null;
        }
        return c.h ? c.h[I - kx * n + (K - kz * n) * n] : -Infinity;
    }

    _hoehlenHorizontProbe(s, box, ex, ey, ez) {
        // der nächste und der fernste Punkt der Grundfläche
        const nx = Math.max(box.min.x - ex, 0, ex - box.max.x),
            nz = Math.max(box.min.z - ez, 0, ez - box.max.z);
        const dMin = Math.hypot(nx, nz);
        if (dMin < 2) return -Infinity;
        const dMax = this._hoehlenWeit(box, ex, ez);
        // der Winkel-Keil der Grundfläche um die Richtung zu ihrer Mitte
        const mitte = Math.atan2((box.min.z + box.max.z) / 2 - ez, (box.min.x + box.max.x) / 2 - ex);
        let w0 = Infinity,
            w1 = -Infinity;
        for (let c = 0; c < 4; c++) {
            let w = Math.atan2((c & 2 ? box.max.z : box.min.z) - ez, (c & 1 ? box.max.x : box.min.x) - ex) - mitte;
            if (w > Math.PI) w -= 2 * Math.PI;
            if (w < -Math.PI) w += 2 * Math.PI;
            if (w < w0) w0 = w;
            if (w > w1) w1 = w;
        }
        const hoch = box.max.y - ey;
        const dRef = hoch >= 0 ? dMin : dMax;
        const R = AnazhRealm.HOEHLEN_HORIZONT_M;
        const c = this._hoehlenBodenCache || (this._hoehlenBodenCache = { n: 0, kx: NaN, kz: NaN, h: null });
        c.n = Math.round(this._voxelChunkConfig(0).span / R);
        c.kx = NaN;
        // die Bögen von der Box zum Auge: der erste, der sperrt, ist die fernste Sperre
        const bogen = this._hoehlenBoegen || (this._hoehlenBoegen = []);
        bogen.length = 0;
        for (let d = 2; d < dMin; d += Math.max(R, 0.04 * d)) bogen.push(d);
        for (let j = bogen.length - 1; j >= 0; j--) {
            const d = bogen[j];
            const grenze = ey + (hoch * d) / dRef; // kein Strahl liegt dort höher
            const schritte = Math.max(1, Math.ceil(((w1 - w0) * d) / R));
            let frei = false;
            for (let q = 0; q <= schritte && !frei; q++) {
                const w = mitte + w0 + ((w1 - w0) * q) / schritte;
                const I = Math.floor((ex + d * Math.cos(w)) / R),
                    K = Math.floor((ez + d * Math.sin(w)) / R);
                for (let k = K - 1; k <= K + 1 && !frei; k++)
                    for (let i = I - 1; i <= I + 1; i++)
                        if (!(this._hoehlenBodenZelle(s, i, k, c) >= grenze)) {
                            frei = true;
                            break;
                        }
            }
            if (!frei) return d;
        }
        return -Infinity;
    }

    // Der fernste waagerechte Abstand vom Auge zur Grundfläche einer Box.
    _hoehlenWeit(box, ex, ez) {
        return Math.hypot(
            Math.max(Math.abs(box.min.x - ex), Math.abs(box.max.x - ex)),
            Math.max(Math.abs(box.min.z - ez), Math.abs(box.max.z - ez))
        );
    }

    // DIE HÖHLEN-SICHT eines Passes (aus `_chunkSatzPass`, mit der Matrix der Pass-Kamera in `S.m`): jede Zelle, die zeichnen
    // muss, trägt den Stempel dieses Passes (`_chunkSatzAbschnitt` liest ihn). Die Kaskade (orthogonal, das Licht) wählt
    // anders (`_hoehlenSichtLicht`). PERSPEKTIVISCH läuft ein Strahl vom Auge fort: je Zelle trägt der Lauf neben dem
    // Schirm-Rechteck die Tiefe, die der Strahl dort mindestens hat (NDC-z, monoton in der Blick-Tiefe) — ein Portal ganz davor
    // ist zu. Starts sind (1) die Zellen um das Auge (in ihrer Luft-Box) mit dem ganzen Bild, (2) jede Mündung im Bild, die der
    // Horizont nicht sperrt (`_hoehlenSperre`), (3) jeder offene Rand — tritt das Auge von draußen ein, läuft er durch die
    // Portale, sonst zeichnet nur seine Zelle (der Rand-Saum des Netzes ragt über die Kante). Der Lauf geht (4) durch die
    // Portale und (5) aus jeder erreichten Zelle hinaus zu den gesperrten Mündungen dahinter (`_hoehlenHinaus`) — die Sperre
    // gilt nur Strahlen, die bis zu ihr in Himmels-Luft laufen; einer, der in einer Höhle beginnt oder durch sie hindurch
    // läuft, kommt an ihr vorbei. Das Hauptbild merkt seine erreichten Zellen (`sichtHaupt`, die Empfänger der Kaskaden).
    // `L`: die Lage, in der der Satz dieses Passes wählt (das Hauptbild in der Lage des Auges, `_chunkSatzPass`).
    _hoehlenSicht(s, kamera, S, haupt, L = S.lage) {
        if (!kamera || kamera.isPerspectiveCamera !== true) return this._hoehlenSichtLicht(s, S, kamera);
        const H = s.hoehle;
        const st = ++H.stempel;
        const m = S.m.elements;
        H.stapel.length = 0;
        const besucht = (H.besucht = haupt ? [] : null);
        const rc = H.rect;
        const span = this._voxelChunkConfig(0).span;
        const e = kamera.matrixWorld.elements;
        const ex = e[12],
            ey = e[13],
            ez = e[14];
        // (1) das Auge in einer Zelle
        const v = this._hoehlenAuge || (this._hoehlenAuge = new THREE.Vector3());
        v.set(ex, ey, ez);
        const cx = Math.floor(ex / span),
            cz = Math.floor(ez / span);
        for (let dx = -1; dx <= 1; dx++)
            for (let dz = -1; dz <= 1; dz++) {
                const b = s.bloecke.get(cx + dx + "," + (cz + dz));
                if (!b || !b.hoehle) continue;
                for (const kn of b.hoehle.knoten)
                    if (kn.luft && kn.luft.containsPoint(v)) this._hoehlenBesuch(H, kn, -1, -1, 1, 1, -Infinity);
            }
        // Die Bereiche mit Starts im Bild: das EINE Gesetz der Pass-Wahl gegen die Hülle ihrer Mündungen und Ränder — ein
        // Bereich daneben (hinter dem Auge, jenseits der fernen Ebene) prüft keinen seiner Starts (Welle C: vorher jeder Pass
        // jede Mündung des Rings, je acht Ecken).
        const imBild = H.imBild || (H.imBild = []);
        imBild.length = 0;
        for (const b of s.ordnung) {
            const bh = b.hoehle;
            if (bh && bh.startHuelle && this._passTrifftBox(L, bh.startHuelle, 0)) imBild.push(bh);
        }
        // (2) die Mündungen im Bild: eine frische Horizont-Probe kostet — je Pass höchstens `HOEHLEN_HORIZONT_PROBEN`, die
        // nächsten zuerst; eine Mündung ohne frische Probe gilt als offen (mehr zeichnen, nie ein Loch). Eine gesperrte
        // wartet auf einen Ausgang (`hinter`, (5)).
        const offen = H.offen || (H.offen = []);
        const hinter = H.hinter || (H.hinter = []);
        offen.length = 0;
        hinter.length = 0;
        for (const bh of imBild)
            for (const kn of bh.starts)
                for (const tor of kn.tore) {
                    if (!this._hoehlenRect(tor.box, m, rc)) continue;
                    tor.st = st;
                    tor.r0 = rc[0];
                    tor.r1 = rc[1];
                    tor.r2 = rc[2];
                    tor.r3 = rc[3];
                    tor.r4 = rc[4];
                    tor.r5 = rc[5];
                    tor.kn = kn;
                    tor.weit = this._hoehlenWeit(tor.box, ex, ez);
                    if (this._hoehlenAugeGleich(H, tor, ex, ey, ez)) {
                        if (tor.sperre === -Infinity) this._hoehlenBesuch(H, kn, rc[0], rc[1], rc[2], rc[3], rc[4]);
                        else hinter.push(tor);
                        continue;
                    }
                    const bx = tor.box;
                    tor.d = Math.hypot((bx.min.x + bx.max.x) / 2 - ex, (bx.min.z + bx.max.z) / 2 - ez);
                    offen.push(tor);
                }
        offen.sort((p, q) => p.d - q.d);
        for (let i = 0; i < offen.length; i++) {
            const tor = offen[i];
            if (i < AnazhRealm.HOEHLEN_HORIZONT_PROBEN && this._hoehlenSperre(s, tor, ex, ey, ez) > -Infinity)
                hinter.push(tor);
            else this._hoehlenBesuch(H, tor.kn, tor.r0, tor.r1, tor.r2, tor.r3, tor.r4);
        }
        // jede Mündung im Bild trägt ihre Sperre (keine wartet auf eine Probe): die Sicht steht, bis die Lage sich ändert
        H.voll = offen.length <= AnazhRealm.HOEHLEN_HORIZONT_PROBEN;
        // die gesperrten nach ihrer Sperre: ein Ausgang liest nur die, deren Sperre vor ihm liegt (`_hoehlenAusgang`)
        hinter.sort((p, q) => p.sperre - q.sperre);
        for (const bh of imBild)
            for (const kn of bh.starts) {
                // (3) der offene Rand: von draußen durch die Portale, von drinnen nur seine Zelle
                const b = kn.bereich;
                for (let seite = 0; seite < 4; seite++) {
                    const rb = kn.raender[seite];
                    if (!rb || !this._hoehlenRect(rb, m, rc)) continue;
                    const draussen =
                        seite === 0
                            ? ex < b.cx * span
                            : seite === 1
                              ? ex > (b.cx + 1) * span
                              : seite === 2
                                ? ez < b.cz * span
                                : ez > (b.cz + 1) * span;
                    if (draussen) this._hoehlenBesuch(H, kn, rc[0], rc[1], rc[2], rc[3], rc[4]);
                    else this._hoehlenMarke(H, kn);
                }
            }
        // (4) durch die Portale: das Rechteck schrumpft je Portal, die Tiefe wächst; (5) hinaus durch die Ausgänge der Zelle
        while (H.stapel.length > 0) {
            const kn = H.stapel.pop();
            const r = kn.rect;
            const z = kn.z;
            // eine Zelle liegt oft mehrfach im Stapel (jeder Besuch, der ihr Rechteck weitet, legt sie neu): ein Lauf mit
            // demselben Rechteck und derselben Tiefe wie ihr letzter in diesem Pass bringt nichts Neues
            const g = kn.gelaufen;
            if (kn.lauf === st && g[0] === r[0] && g[1] === r[1] && g[2] === r[2] && g[3] === r[3] && g[4] === z)
                continue;
            kn.lauf = st;
            g[0] = r[0];
            g[1] = r[1];
            g[2] = r[2];
            g[3] = r[3];
            g[4] = z;
            for (const ed of kn.nb) {
                const p = ed.p;
                if (p.st !== st) {
                    p.st = st;
                    p.auf = this._hoehlenRect(p.box, m, p.rect);
                }
                if (!p.auf) continue;
                const q = p.rect;
                if (q[5] < z) continue;
                const x0 = r[0] > q[0] ? r[0] : q[0],
                    y0 = r[1] > q[1] ? r[1] : q[1],
                    x1 = r[2] < q[2] ? r[2] : q[2],
                    y1 = r[3] < q[3] ? r[3] : q[3];
                if (x0 <= x1 && y0 <= y1) this._hoehlenBesuch(H, ed.zu, x0, y0, x1, y1, q[4] > z ? q[4] : z);
            }
            if (hinter.length > 0) this._hoehlenHinaus(H, kn, m, st, ex, ez);
        }
        // die Empfänger der Kaskaden: die erreichten Zellen, deren Dreiecke das Hauptbild zeichnet (das EINE Gesetz der
        // Pass-Wahl, wie `_chunkSatzAbschnitt` sie wählt) — in der Lage des WEGS (`S.lage`, w24-fahrt-takt): die Empfänger
        // halten über die Strecke des Auges, der Lauf durch die Portale bleibt am Auge; eine neue Menge zählt `sichtGen`
        if (besucht) {
            const neu = besucht.filter(
                (kn) => kn.zelle && !kn.zelle.huelle.isEmpty() && this._passTrifftBox(S.lage, kn.zelle.huelle, 0)
            );
            if (!H.sichtHaupt || !this._satzListeGleich(H.sichtHaupt, neu)) {
                H.sichtHaupt = neu;
                H.sichtGen++;
            }
        }
    }

    // HINAUS (5): ein Strahl, der eine erreichte Zelle durch ihre Luft quert, tritt durch eine ihrer Mündungen (oder einen
    // offenen Rand) wieder in Himmels-Luft — das Auge stand in der Höhle, an ihrer Mündung, oder der Strahl lief unter einem
    // Überhang, durch einen Tunnel. Jeder Ausgang im Bild ist ein Fenster (sein Rechteck ∩ das der Zelle, nicht näher als
    // beide), und hinter ihm erreicht der Strahl jede gesperrte Mündung, deren fernste Sperre vor dem Ausgang liegt
    // (`_hoehlenSperre`, gemessen vom geprüften Auge: der Würfel `HOEHLEN_AUGE_M` verschiebt sie um höchstens 2 × seine Kante).
    _hoehlenHinaus(H, kn, m, st, ex, ez) {
        for (const tor of kn.tore)
            if (tor.st === st) this._hoehlenAusgang(H, kn, tor.r0, tor.r1, tor.r2, tor.r3, tor.r4, tor.weit);
        const q = H.rect;
        for (let seite = 0; seite < 4; seite++) {
            const rb = kn.raender[seite];
            if (rb && this._hoehlenRect(rb, m, q))
                this._hoehlenAusgang(H, kn, q[0], q[1], q[2], q[3], q[4], this._hoehlenWeit(rb, ex, ez));
        }
    }

    _hoehlenAusgang(H, kn, x0, y0, x1, y1, z0, weit) {
        const r = kn.rect;
        if (r[0] > x0) x0 = r[0];
        if (r[1] > y0) y0 = r[1];
        if (r[2] < x1) x1 = r[2];
        if (r[3] < y1) y1 = r[3];
        if (x0 > x1 || y0 > y1) return;
        if (kn.z > z0) z0 = kn.z;
        const bis = weit + 2 * AnazhRealm.HOEHLEN_AUGE_M;
        // `hinter` liegt nach der Sperre geordnet (`_hoehlenSicht`): ab der ersten jenseits des Ausgangs keine mehr
        const h = H.hinter;
        for (let i = 0; i < h.length; i++) {
            const tor = h[i];
            if (tor.sperre > bis) break;
            if (tor.r5 < z0) continue;
            const a0 = x0 > tor.r0 ? x0 : tor.r0,
                b0 = y0 > tor.r1 ? y0 : tor.r1,
                a1 = x1 < tor.r2 ? x1 : tor.r2,
                b1 = y1 < tor.r3 ? y1 : tor.r3;
            if (a0 <= a1 && b0 <= b1) this._hoehlenBesuch(H, tor.kn, a0, b0, a1, b1, tor.r4 > z0 ? tor.r4 : z0);
        }
    }

    // Eine Zelle erreicht ein Rechteck mit einer Tiefe: neu (Stempel) oder mehr als bisher (größeres Rechteck oder eine
    // kleinere Tiefe, die weiter trägt) → vereinigen und weiterlaufen.
    _hoehlenBesuch(H, kn, x0, y0, x1, y1, z) {
        const r = kn.rect;
        if (kn.sicht === H.stempel) {
            const naeher = z < kn.z;
            if (!naeher && r[0] <= x0 && r[1] <= y0 && r[2] >= x1 && r[3] >= y1) return;
            if (x0 < r[0]) r[0] = x0;
            if (y0 < r[1]) r[1] = y0;
            if (x1 > r[2]) r[2] = x1;
            if (y1 > r[3]) r[3] = y1;
            if (naeher) kn.z = z;
        } else {
            kn.sicht = H.stempel;
            r[0] = x0;
            r[1] = y0;
            r[2] = x1;
            r[3] = y1;
            kn.z = z;
            if (H.besucht) H.besucht.push(kn);
        }
        H.stapel.push(kn);
    }

    // Eine Zelle zeichnet in diesem Pass, ohne dass ein Strahl durch sie weiterläuft (ein leeres Rechteck und eine Tiefe, die
    // nichts trägt: jeder echte Besuch danach ist mehr).
    _hoehlenMarke(H, kn) {
        if (kn.sicht === H.stempel) return;
        kn.sicht = H.stempel;
        kn.rect[0] = 1;
        kn.rect[1] = 1;
        kn.rect[2] = -1;
        kn.rect[3] = -1;
        kn.z = Infinity;
        if (H.besucht) H.besucht.push(kn);
    }

    // DIE HÖHLEN-SICHT DER KASKADE (orthogonal, das Licht): die Karte muss nur für die EMPFÄNGER stimmen, die das Bild zeigt —
    // für jeden muss die erste Fläche auf seinem Weg zum Licht in der Karte stehen. Dieser Weg kann durch Fels laufen, ohne
    // eine Fläche zu kreuzen: der Ring schneidet das Gelände auf, eine LOD-Naht im Höhlen-Netz klafft, die Nah-Ebene der
    // Kaskade kappt — dann wirft jede Höhlen-Fläche auf dem Weg (gemessen 06.10., Abend, Kamera in der Halle 38 m tief: ein
    // versiegelter Hohlraum warf durch die Naht −23/−24 einen Schatten-Strich, den ein Lauf durch Luft-Portale verlor). Darum
    // ohne Luft-Annahme: eine Höhlen-Zelle zeichnet, wenn ihr Licht-Rechteck das eines Empfängers schneidet und sie dem Licht
    // so nah kommt wie dessen tiefster Punkt. Empfänger sind die Zellen des Hauptbilds (`sichtHaupt`, ihre Hülle) und — für
    // die Empfänger in Himmels-Luft, deren Weg zum Licht Höhlen-Luft nur durch eine Mündung betritt (darüber liegt nur
    // Himmels-Luft oder Fels unter einer Himmels-Fläche, die immer zeichnet) — jede Mündung. Ortsfeste Kacheln von
    // `HOEHLEN_LICHT_KACHEL_M` quer zum Licht tragen je Kachel die tiefste Empfänger-Tiefe; eine Zelle liest die Kacheln
    // unter ihrer Box. Die Kosten folgen der Karte (Welle C — vorher je Kaskaden-Pass jede Mündung des Rings und jede
    // Höhlen-Zelle der Box, acht Ecken je Box, auch an der Oberfläche ohne jede Höhle im Bild): ein Empfänger zählt nur, wenn
    // das EINE Gesetz der Pass-Wahl seinen BEREICH in diesem Pass trifft (Box der Kaskade und Licht-Kapsel gegen ihre
    // Scheibe — die Empfänger einer Mündung liegen auf ihrem Weg vom Licht fort, ein Empfänger des Hauptbilds liest die Karte
    // nur in seiner Scheibe): die Zellen des Hauptbilds über die Hülle ihres Bereichs, die Mündungen über die Hülle der
    // Mündungs-Boxen ihres Bereichs — je Bereich EINE Prüfung, nie je Empfänger; OHNE Empfänger
    // wirft keine Höhlen-Zelle (Frühausstieg), und ein Bereich, dessen Licht-Rechteck keine Kachel eines Empfängers schneidet
    // oder der dem Licht nicht so nah kommt wie der tiefste, prüft keine seiner Zellen. Die Lage einer Box im Licht-Raum
    // hängt nur an der DREHUNG des Lichts und an der Box selbst: jede Box (Mündung, Zelle, Bereich) trägt ihr Licht-Rechteck
    // mit den sechs Zahlen, aus denen es fiel, bis das Licht sich über den Halt hinaus dreht (`H.lichtGen`, die Stufen der Sonne
    // unten) oder SIE sich ändert — dreht die Kamera, wandert die Kaskade nur quer zum Licht, und keine Ecke wird neu gerechnet
    // (OMEN-Urteil 06.10., Drehen: ~1 800 Boxen je Frame). Bis w4-e-takt fiel jedes Rechteck mit jeder Stufe der Sonne und mit
    // jedem Stand des Satzes (`s.stand`: eine neue Ordnung, ein Chunk, der seine Stufe tauscht) — im Gang rechnete die Kaskade so
    // jede Box des Rings neu (Radeon 31.10., Mess-Wiese Ego gehend, `werkbank takt`: `_hoehlenSichtLicht` 2,1 ms je Bild-Takt im
    // Mittel, ab p95 4,7 ms, davon `lage` 2,75 gegen 0,33 ms in der Mitte — der größte Spitzen-Täter des Gangs).
    _hoehlenSichtLicht(s, S, kamera) {
        const H = s.hoehle;
        const st = ++H.stempel;
        H.besucht = null;
        if (!kamera || !kamera.matrixWorldInverse)
            throw new Error("_hoehlenSichtLicht: eine Kaskade ohne Kamera — die Licht-Kacheln brauchen ihre Drehung");
        // die Lage einer Box im Licht-Raum: nur die DREHUNG der Licht-Kamera (u, v quer zum Licht, d entlang) — die Kacheln
        // stehen ortsfest, während die Kaskaden-Box mit dem atmenden Auge wandert (sonst kippte die Wahl am Rand je Frame)
        // die Drehung des Lichts gegen die gemerkte; gerechnet wird mit der gemerkten. DIE STUFEN DER SONNE (w4-e-takt): eine
        // Kaskade mit Box (`P.fit`), die an einem NEUEN Anker wählt (`P.neu`, `_passWahlLage`), hält ihre Rechtecke nach dem EINEN
        // Gesetz des Halts, wie ihre Lage (`_passLageHaelt`): die Drehung seit der gemerkten, mal dem längsten Licht-Weg seit ihr,
        // unter dem halben Licht-Rand (`P.licht`, der Rand, mit dem jedes Rechteck gegen die Kacheln prüft) — Werfer und Empfänger
        // liegen im selben gemerkten Licht-Raum; die Wahl am Anker hält danach höchstens den anderen halben Rand, zusammen
        // höchstens den ganzen. Wählt sie mitten in einer gehaltenen Lage (ein neuer Stand des Satzes), gilt die Rundung: die Hälfte
        // des Rands trägt dort schon der Abstand zum Anker. Bis hierher fiel jedes Rechteck mit jeder Stufe der Sonne (die Drehung
        // „bis auf die Rundung", 1e-7): im Gang rechnete die Kaskade bei jeder Stufe jede Box des Rings neu (Radeon 31.10.,
        // Mess-Wiese Ego gehend, 3,5 s: 19 Licht-Generationen, 13 649 von 14 448 Rechtecken aus unveränderten Boxen). Ohne Box
        // (eine andere Ortho-Kamera) gilt die Rundung (eine neu gelegte Kaskaden-Box legt ihre Kamera aus Ort + Richtung neu an).
        const ek = kamera.matrixWorldInverse.elements;
        const e = H.lichtE || (H.lichtE = new Float64Array(16));
        const P0 = S.lage,
            fit = P0 && P0.neu === true && P0.licht > 0 ? P0.fit : null;
        let gedreht = !H.lichtGen;
        if (!gedreht && fit) {
            H.lichtWeg = Math.max(H.lichtWeg || 0, fit.weg || 0);
            let spur = 0;
            for (let i = 0; i < 11; i++) if (i % 4 !== 3) spur += e[i] * ek[i];
            const dreh = Math.acos(Math.max(-1, Math.min(1, (spur - 1) / 2)));
            gedreht = !this._wahlHaelt(dreh, H.lichtWeg, P0.licht);
        } else if (!gedreht)
            for (let i = 0; i < 11; i++) if (i % 4 !== 3 && !(Math.abs(e[i] - ek[i]) <= 1e-7)) gedreht = true;
        if (gedreht) {
            e.set(ek);
            H.lichtGen = (H.lichtGen || 0) + 1;
            H.lichtWeg = fit ? fit.weg || 0 : 0;
        }
        const lg = H.lichtGen;
        // das Licht-Rechteck einer Box, gemerkt an ihrem Halter (Mündung, Zelle, Bereich) mit der Box, aus der es fiel
        const lage = (h, box) => {
            const mn = box.min,
                mx = box.max,
                B = h.lrBox;
            if (
                h.lrGen === lg &&
                B !== undefined &&
                B[0] === mn.x &&
                B[1] === mn.y &&
                B[2] === mn.z &&
                B[3] === mx.x &&
                B[4] === mx.y &&
                B[5] === mx.z
            )
                return h.lr;
            const L = h.lr || (h.lr = new Float64Array(6));
            this._hoehlenLichtLage(box, e, L);
            const N = B || (h.lrBox = new Float64Array(6));
            N[0] = mn.x;
            N[1] = mn.y;
            N[2] = mn.z;
            N[3] = mx.x;
            N[4] = mx.y;
            N[5] = mx.z;
            h.lrGen = lg;
            return L;
        };
        const T = AnazhRealm.HOEHLEN_LICHT_KACHEL_M;
        const K = H.kacheln || (H.kacheln = new Map());
        K.clear();
        const P = S.lage;
        // der Licht-Rand des Passes (`lichtRandTexel`): die Wahl hält über die Stufen der Sonne — ein Werfer, der nach einer
        // Drehung bis zum Rand wirft, wirft schon jetzt (sein Rechteck und seine Nähe um den Rand geweitet)
        const m = P.licht;
        // die Kachel-Spanne aller Empfänger (i0, j0, i1, j1) und ihre tiefste Tiefe
        const E = H.empfSpanne || (H.empfSpanne = new Float64Array(5));
        E[0] = E[1] = Infinity;
        E[2] = E[3] = E[4] = -Infinity;
        const empfang = (kn, h, box) => {
            if (!box) return;
            kn.sicht = st;
            const L = lage(h, box);
            const tief = L[5];
            const i0 = Math.floor(L[0] / T),
                i1 = Math.floor(L[3] / T),
                j0 = Math.floor(L[1] / T),
                j1 = Math.floor(L[4] / T);
            for (let j = j0; j <= j1; j++)
                for (let i = i0; i <= i1; i++) {
                    const key = (i + 32768) * 65536 + (j + 32768);
                    const w = K.get(key);
                    if (w === undefined || tief > w) K.set(key, tief);
                }
            if (i0 < E[0]) E[0] = i0;
            if (j0 < E[1]) E[1] = j0;
            if (i1 > E[2]) E[2] = i1;
            if (j1 > E[3]) E[3] = j1;
            if (tief > E[4]) E[4] = tief;
        };
        // die Zellen des Hauptbilds: je Bereich EINE Prüfung seiner Hülle (gemerkt an diesem Stempel)
        if (H.sichtHaupt)
            for (const kn of H.sichtHaupt) {
                const b = kn.bereich;
                if (!b.hoehle || !b.huelle) continue;
                if (b._empfSt !== st) {
                    b._empfSt = st;
                    b._empfJa = this._passTrifftBox(P, b.huelle, 0);
                }
                if (b._empfJa) empfang(kn, kn.zelle, kn.zelle.huelle);
            }
        for (const b of s.ordnung) {
            const bh = b.hoehle;
            if (!bh || !bh.startHuelle || !this._passTrifftBox(P, bh.startHuelle, 0)) continue;
            for (const kn of bh.starts) for (const tor of kn.tore) empfang(kn, tor, tor.box);
        }
        if (K.size === 0) return;
        // die Werfer-Kandidaten: die Zellen, die das EINE Gesetz der Pass-Wahl in diesem Pass trifft (Box der Kaskade und
        // Licht-Kapsel gegen ihre Scheibe — `_chunkSatzAbschnitt` wählt dieselben)
        for (const b of s.ordnung) {
            if (!b.hoehle || !b.huelle || b.huelle.isEmpty() || !this._passTrifftBox(P, b.huelle, 0)) continue;
            const L = lage(b, b.huelle);
            if (
                L[2] - m > E[4] ||
                Math.floor((L[3] + m) / T) < E[0] ||
                Math.floor((L[0] - m) / T) > E[2] ||
                Math.floor((L[4] + m) / T) < E[1] ||
                Math.floor((L[1] - m) / T) > E[3]
            )
                continue;
            for (const kn of b.hoehle.knoten) {
                const z = kn.zelle;
                if (!z || kn.sicht === st || z.huelle.isEmpty() || !this._passTrifftBox(P, z.huelle, 0)) continue;
                const Z = lage(z, z.huelle);
                const nah = Z[2] - m;
                let wirft = false;
                for (let j = Math.floor((Z[1] - m) / T); j <= Math.floor((Z[4] + m) / T) && !wirft; j++)
                    for (let i = Math.floor((Z[0] - m) / T); i <= Math.floor((Z[3] + m) / T); i++) {
                        const w = K.get((i + 32768) * 65536 + (j + 32768));
                        if (w !== undefined && w >= nah) {
                            wirft = true;
                            break;
                        }
                    }
                if (wirft) kn.sicht = st;
            }
        }
    }

    // Die Lage einer Box im Licht-Raum (`e` = die Elemente der matrixWorldInverse der Kaskade, nur ihre DREHUNG): u, v quer
    // zum Licht in out[0], out[1] (Minimum) und out[3], out[4] (Maximum), die Tiefe d entlang des Lichts in out[2] (nah)
    // und out[5] (fern) — acht Ecken.
    _hoehlenLichtLage(box, e, L) {
        L[0] = L[1] = L[2] = Infinity;
        L[3] = L[4] = L[5] = -Infinity;
        for (let c = 0; c < 8; c++) {
            const x = c & 1 ? box.max.x : box.min.x,
                y = c & 2 ? box.max.y : box.min.y,
                z = c & 4 ? box.max.z : box.min.z;
            const u = e[0] * x + e[4] * y + e[8] * z,
                v = e[1] * x + e[5] * y + e[9] * z,
                d = -(e[2] * x + e[6] * y + e[10] * z);
            if (u < L[0]) L[0] = u;
            if (u > L[3]) L[3] = u;
            if (v < L[1]) L[1] = v;
            if (v > L[4]) L[4] = v;
            if (d < L[2]) L[2] = d;
            if (d > L[5]) L[5] = d;
        }
        return L;
    }

    // Das Schirm-Rechteck einer Box unter der Pass-Matrix `m` (NDC, auf [−1, 1] geklemmt) in `out[0…3]`, ihre nahe und ferne
    // Tiefe (NDC-z) in `out[4]`, `out[5]`; false, wenn die Box hinter dem Auge oder neben dem Bild liegt. Eine Box, die die
    // Augen-Ebene kreuzt, zählt mit ihrem Teil VOR dem Auge (an der Ebene w = ε geschnitten — ihre Schnitt-Punkte liegen
    // weit draußen, das Klemmen trägt sie; ihre nahe Tiefe ist −∞): der Strahl durch ein Portal trifft es vor dem Auge, sein
    // Schirm-Punkt ist die Projektion dieses Treffers.
    _hoehlenRect(box, m, out) {
        const E = 1e-4;
        const C = this._hoehlenEcken || (this._hoehlenEcken = new Float64Array(24));
        let x0 = Infinity,
            y0 = Infinity,
            x1 = -Infinity,
            y1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity,
            vorn = 0;
        const nimm = (cx, cy, w) => {
            const px = cx / w,
                py = cy / w;
            if (px < x0) x0 = px;
            if (px > x1) x1 = px;
            if (py < y0) y0 = py;
            if (py > y1) y1 = py;
        };
        for (let c = 0; c < 8; c++) {
            const x = c & 1 ? box.max.x : box.min.x,
                y = c & 2 ? box.max.y : box.min.y,
                z = c & 4 ? box.max.z : box.min.z;
            const cx = m[0] * x + m[4] * y + m[8] * z + m[12],
                cy = m[1] * x + m[5] * y + m[9] * z + m[13],
                cz = m[2] * x + m[6] * y + m[10] * z + m[14],
                w = m[3] * x + m[7] * y + m[11] * z + m[15];
            C[c * 3] = cx;
            C[c * 3 + 1] = cy;
            C[c * 3 + 2] = w;
            if (w > E) {
                vorn++;
                nimm(cx, cy, w);
                const pz = cz / w;
                if (pz < z0) z0 = pz;
                if (pz > z1) z1 = pz;
            }
        }
        if (vorn === 0) return false;
        if (vorn < 8) {
            z0 = -Infinity;
            // die zwölf Kanten (Ecken, die sich in einem Bit unterscheiden), die die Ebene w = ε kreuzen
            for (let a = 0; a < 8; a++)
                for (let bit = 1; bit < 8; bit <<= 1) {
                    if (a & bit) continue;
                    const b = a | bit;
                    const wa = C[a * 3 + 2],
                        wb = C[b * 3 + 2];
                    if (wa > E === wb > E) continue;
                    const t = (E - wa) / (wb - wa);
                    nimm(C[a * 3] + t * (C[b * 3] - C[a * 3]), C[a * 3 + 1] + t * (C[b * 3 + 1] - C[a * 3 + 1]), E);
                }
        }
        if (x0 < -1) x0 = -1;
        if (y0 < -1) y0 = -1;
        if (x1 > 1) x1 = 1;
        if (y1 > 1) y1 = 1;
        if (x0 > x1 || y0 > y1) return false;
        out[0] = x0;
        out[1] = y0;
        out[2] = x1;
        out[3] = y1;
        out[4] = z0;
        out[5] = z1;
        return true;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bild_hoehle]);

// ===== ATLAS · Bild/hoehle — Außen-Konstanten =====
// DIE HÖHLEN-SICHT (Welle 7, `_hoehlenSicht`): der Saum jeder Mündungs-, Portal-, Rand- und Luft-Box — `schritte` Gitter-
// Schritte (die Fläche zwischen zwei Luft-Punkten liegt bis 1,5 Schritte neben ihnen: Surface-Nets-Vertex in der Zelle,
// Glättung λ 0,5) plus `m` Meter (der Geomorph zieht Rand-Vertices auf den gröberen Nachbarn, wie der Hüllen-Saum `randM`).
AnazhRealm.HOEHLEN_SAUM = Object.freeze({ schritte: 1.5, m: 2 });
// DER HORIZONT der Höhlen-Sicht (`_hoehlenHorizont`): die Raster-Zelle der unteren Boden-Schranke je Chunk (m) — der Schritt
// des LOD-0-Gitters; die Horizont-Probe einer Mündung tastet ihre Bögen in halben Zellen ab.
AnazhRealm.HOEHLEN_HORIZONT_M = 1.8;
// Frische Horizont-Proben je Hauptbild (`_hoehlenSicht`, die nächsten Mündungen zuerst): die Kosten folgen dem bewegten Auge,
// nie der Zahl der Mündungen — eine Mündung ohne frische Probe zeichnet.
AnazhRealm.HOEHLEN_HORIZONT_PROBEN = 8;
// Der Würfel um das geprüfte Auge, in dem eine Horizont-Probe gilt (m, `_hoehlenSperre`): weit unter der Raster-Zelle
// (die 3 × 3 Zellen der Probe tragen die waagerechte Verschiebung), weit über dem Atmen der stehenden Kamera.
AnazhRealm.HOEHLEN_AUGE_M = 0.25;
// DIE KASKADE der Höhlen-Sicht (`_hoehlenSichtLicht`): die Kante einer ortsfesten Licht-Kachel quer zum Licht (m), die je
// Kachel die tiefste Empfänger-Tiefe trägt.
AnazhRealm.HOEHLEN_LICHT_KACHEL_M = 4;
