class AnazhRealm_studio_glieder {
    // ===== ATLAS · Studio/glieder — Die Glieder der Gestalt · Kapsel-Fit · Zerlegung und Ruhe · Gattung · Glied-Vorrat · Treffer-Volumen =====
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
                const ta = o.geometry.attributes.aTon || null; // der Ton je Ecke reist mit (mensch.K4, `_gliedKapselFit`)
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
                    const tarr = ta ? new Float32Array(liste.length) : null;
                    for (let n = 0; n < liste.length; n++) {
                        arr[n * 3] = pa.getX(liste[n]);
                        arr[n * 3 + 1] = pa.getY(liste[n]);
                        arr[n * 3 + 2] = pa.getZ(liste[n]);
                        if (farr) {
                            farr[n * 3] = ca.getX(liste[n]);
                            farr[n * 3 + 1] = ca.getY(liste[n]);
                            farr[n * 3 + 2] = ca.getZ(liste[n]);
                        }
                        if (tarr) tarr[n] = ta.getX(liste[n]);
                    }
                    const attribute = { position: new THREE.BufferAttribute(arr, 3) };
                    if (farr) attribute.color = new THREE.BufferAttribute(farr, 3);
                    if (tarr) attribute.aTon = new THREE.BufferAttribute(tarr, 1);
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
    // Volumen und Glied-Vorrat (_gliederBestellen) — gattung/recipe/preset, sonst TETRAPODA_SOUL_MAP[soul], sonst soul.
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
    // fällt das ganze Tier). Die Glieder liest er aus dem EINEN Namen-Memo der Gattung (`_gattungGlieder`): nur der Vorrat
    // zerlegt die Gestalt, einmal je Gattung — vorher zerlegte jeder Leib seine Haut neu (am Messort stadt jeder Bewohner,
    // der in den Fern-Kreis trat: `_kreaturGliederGruppen` 1,75 ms je Takt ab p95, Radeon echt).
    _kreaturGliederBacken(cr, einblenden) {
        const namen = this._gattungGlieder(cr);
        if (!namen) return null;
        // Analog-Import: das Glied wird KAPSEL (Achse + Radius + Farbe aus dem Skelett-Raum, ~32 Byte statt
        // 128 KB Brick), DEDUP je Gattung + Glied; jede Instanz posiert sie per eigener Knochen-Matrix. Der
        // March digitalisiert am Schirm; Voxel-Glieder-Bricks gibt es nicht mehr (kein Parallelpfad).
        const tb = cr.userData._tierBaum;
        const glieder = [];
        for (const nm of namen) {
            const a = nm.name ? tb && tb.teile && tb.teile[nm.name] : (tb && tb.wrap) || cr;
            if (!a) {
                for (const gl of glieder) this._weltFeldFrei(gl.handle);
                return null;
            }
            a.updateMatrixWorld(true);
            const key = nm.key;
            const handle = this._weltKapselSpawn(key, a.matrixWorld, () => this._gliedKapseln.get(key), einblenden);
            if (!handle) {
                for (const gl of glieder) this._weltFeldFrei(gl.handle);
                return null; // Erschöpfung: ganz oder gar nicht — kein halber Wolf
            }
            // DIE FARBE DES BEWOHNERS FERN (mensch.K4): die Kapsel ist die seiner Gestalt, ihre Farbe die seine (`_tonFeldFarbe`)
            const zeilen = cr.userData.__tonZeilen;
            if (zeilen) this._weltFeldFarbe(handle, this._tonFeldFarbe(this._gliedKapseln.get(key), zeilen));
            glieder.push({ teil: a, name: nm.name, handle });
        }
        return glieder.length ? glieder : null;
    }

    // DIE GLIEDER EINER GATTUNG (das EINE Namen-Memo `_trefferGliedNamen`, Fern-Satz und Treffer lesen es): je Glied der
    // Name seines Ankers ("" = die Wurzel) und der Schlüssel seiner Kapsel; jedes Tier löst nur die Namen an SEINEN Teilen
    // auf. Der Takt LIEST nur (Lehre 14): die Geburt hat den Vorrat bestellt (`spawnCreatureAt`); ist die Gattung noch kalt,
    // bestellt der Ruf ihn, zählt sich (`_gliederKalt`) und bekommt null — der Leib trägt bis dahin seinen Satz. Bis dorf-takt-z13
    // zerlegte der erste Leser die Gestalt im Takt: ein Fuchs, den das Bestands-Gesetz fern gebar, kostete die GTX im Dorf
    // `_gattungGlieder` 0,07–0,10 ms je Takt ab p95 (der Zug 13 hob den CPU-Takt 4,72 → 4,97 ms).
    _gattungGlieder(cr) {
        const namen = this._trefferGliedNamen && this._trefferGliedNamen.get(this._kreaturGattung(cr));
        if (namen) return namen;
        this._gliederKalt = (this._gliederKalt | 0) + 1;
        this._gliederBestellen(cr);
        return null;
    }

    // DER BAU DER GLIEDER (nur der Glied-Vorrat ruft ihn): die Zerlegung des Leibs (`_kreaturGliederGruppen`) und je Glied die
    // Passung (`_gliedKapselMemo`) — die Ruhe der Gestalt macht sie unabhängig davon, welches Tier zuerst kam. null: keine
    // Gestalt (nie gemerkt — ein Leib ohne Teile wird beim nächsten kalten Ruf neu bestellt).
    _gattungGliederBacken(cr) {
        const gattung = this._kreaturGattung(cr);
        const memo = this._trefferGliedNamen || (this._trefferGliedNamen = new Map());
        if (memo.has(gattung)) return memo.get(gattung);
        const G = this._kreaturGliederGruppen(cr);
        if (!G) return null;
        const namen = [];
        for (const [a, g] of G.gruppen) {
            const key = `kapsel:${G.gattung}:${a.name || "wurzel"}`;
            this._gliedKapselMemo(key, g);
            namen.push({ name: a === G.wurzel ? "" : a.name, key });
        }
        memo.set(gattung, namen);
        return namen;
    }

    // DER GLIED-VORRAT (Lehre 14 und 25): eine kalte Gattung wird im LEERLAUF des Haupt-Fadens gebaut (`_imLeerlauf`), EINE je
    // Fenster, die dem Spieler nächste zuerst, nie im Takt. `leib` ist ein Tier der Gattung oder der Name einer Seele — dann
    // baut der Vorrat einen Probe-Leib aus dem EINEN Bau (`_buildCreatureGroup`) und gibt ihn zurück. Der Ofen-Vorrat bestellt
    // so jede Gattung des Lebensraums, bevor ein Tier entsteht (`_ofenPrefetchKreaturen`); jede Geburt bestellt ihre Gattung
    // (`spawnCreatureAt` — lange bevor das Tier in Hieb-Reichweite kommt), jeder kalte Ruf eines Lesers den Rest.
    // Liefert das Versprechen der Glied-Namen.
    _gliederBestellen(leib) {
        const g = typeof leib === "string" ? AnazhRealm.TETRAPODA_SOUL_MAP[leib] : this._kreaturGattung(leib);
        const memo = this._trefferGliedNamen;
        if (memo && memo.has(g)) return Promise.resolve(memo.get(g));
        const Q = this._gliederAuftraege || (this._gliederAuftraege = new Map());
        let a = Q.get(g);
        if (!a) {
            Q.set(g, (a = { leib }));
            a.da = new Promise((fertig) => (a.fertig = fertig));
            if (Q.size === 1) this._imLeerlauf(() => this._gliederVorratTick(), 1000);
        }
        return a.da;
    }
    _gliederVorratTick() {
        const Q = this._gliederAuftraege;
        let [g, a, naechst] = [null, null, Infinity];
        for (const [k, x] of Q) {
            const d2 = typeof x.leib === "string" ? Infinity : this._spielerD2(x.leib.position.x, x.leib.position.z);
            if (!a || d2 < naechst) [g, a, naechst] = [k, x, d2];
        }
        if (!a) return;
        Q.delete(g);
        const seele = typeof a.leib === "string";
        let probe = null;
        try {
            // ohne Gestalt (der Bau meldet es laut, fail-closed) gibt es nichts zu zerlegen
            if (seele && (probe = this._buildCreatureGroup(a.leib)))
                Object.assign(probe.userData, { soul: a.leib, gattung: g });
            const leib = seele ? probe : a.leib;
            a.fertig(leib ? this._gattungGliederBacken(leib) : null);
        } finally {
            if (probe) this._disposeSoulGroup(probe);
            if (Q.size) this._imLeerlauf(() => this._gliederVorratTick(), 1000);
        }
    }

    // DAS TREFFER-VOLUMEN eines Tiers (Welle L 06.10., Befund K-D3): seine Glieder-Kapseln — dieselbe Passung wie
    // das Fern-Bild (_gliedKapselMemo), jede mit der Zone ihres Glieds (tetrapoda trefferZone). Die senkrechte Säule
    // 0,1 L…1,4 L war gattungs- und höhenblind (Hirsch L 0,64 flach 1 Treffer aus 10, hangab 2 aus 8). Die Glied-Liste
    // je Gattung entsteht EINMAL im Glied-Vorrat (`_gliederBestellen`, im Leerlauf, bestellt mit der Geburt); jedes Tier löst
    // nur die Namen an SEINEN Teilen auf. Ein Ruf gegen eine noch kalte Gattung bricht LAUT (`_bruchMelden`), nie still: bis
    // treffer-kalt übersprang jeder Leser das Tier, es war bis zur Frist des Leerlaufs unverwundbar und biss nicht. Die
    // laufende Pose trägt jeder Test über die Welt-Matrix des Ankers.
    _kreaturTrefferGlieder(cr) {
        const u = cr && cr.userData;
        if (!u) return null;
        // wer die Glieder eines RUHENDEN Leibs bekommt (K59), bekommt sie frisch: seine Wurzel hält den Szenen-Gang aus dem
        // Skelett, die Anker-Matrizen stünden sonst, wo die Ruhe begann (jeder Leser — Biss, Maul, Treffer, Tod)
        if (u._ruht === true) this._leibMatrix(cr);
        if (u._trefferGlieder !== undefined) return u._trefferGlieder;
        // KERN-PFLICHT (Welle L): ohne tetrapoda trefferZone gibt es kein Treffer-Volumen — ein lauter BRUCH wie im
        // Treffer-Urteil (_kampfUrteil), nie ein still je Tier gespeichertes null (jedes Wesen wäre unverwundbar).
        const tc = globalThis.__tetrapodaCore;
        if (!tc || typeof tc.trefferZone !== "function") AnazhRealm._kernPflichtBruch("tetrapoda:trefferZone");
        const tb = u._tierBaum;
        if (!tb) return (u._trefferGlieder = null); // kein Studio-Leib (nur _buildCreatureGroup baut einen): keine Gestalt
        const namen = this._gattungGlieder(cr);
        if (!namen) {
            this._bruchMelden(
                `TREFFER: die Gattung „${this._kreaturGattung(cr)}“ ist kalt — der Leib ist nicht treffbar`
            );
            return null; // bestellt, nie je Tier gespeichert
        }
        const liste = [];
        for (const nm of namen) {
            const anker = this._gliedAnker(cr, nm.name);
            const k = this._gliedKapseln && this._gliedKapseln.get(nm.key);
            if (!anker || !k) continue;
            liste.push({ anker, teil: nm.name, a: k.a, b: k.b, r: k.r, zone: tc.trefferZone(nm.name || "wolf") });
        }
        u._trefferGlieder = liste.length ? liste : null;
        return u._trefferGlieder;
    }

    // Der Anker eines Glieds der Gestalt: das benannte Teil des Studio-Leibs, die Wurzel ("") die Hülle. Der Treffer
    // (_kreaturTrefferGlieder) und der steckende Pfeil (_pfeilInsTier) fragen hier; null ohne Studio-Leib oder Teil.
    _gliedAnker(cr, teil) {
        const tb = cr && cr.userData && cr.userData._tierBaum;
        if (!tb) return null;
        return teil ? (tb.teile && tb.teile[teil]) || null : tb.wrap || cr;
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
    // des Kontakts (der Hebel der Klinge, der Ort im Flug) und `ein`, den Strecken-Parameter, an dem sie in dieses Glied
    // eintritt (der Strahl des Fadenkreuzes: der Punkt auf der Haut, _pickCreatureAtCrosshair), dazu `anker` und `teil` des
    // Glieds (der Pfeil steckt dort, _pfeilStecken). null = vorbei.
    // `flaeche` (Welle LF, Posten 2): ein Punkt der Haut (das Ziel unter dem Fadenkreuz) gehört dem Glied, auf dessen Fläche er
    // liegt — die Wahl nach |Abstand − Glied-Radius|, nie nach der Tiefe (die dicke Rumpf-Kapsel reicht in den Hals: der Kopf
    // eines Hirschs wäre Bauch).
    _kreaturGliedTreffer(cr, ax, ay, az, bx, by, bz, radius, flaeche = false) {
        const gl = this._kreaturTrefferGlieder(cr);
        if (!gl) return null;
        this._leibMatrix(cr);
        const v = this._trefferVek || (this._trefferVek = [new THREE.Vector3(), new THREE.Vector3()]);
        let best = null;
        let bestTiefe = Infinity;
        const lang = Math.hypot(bx - ax, by - ay, bz - az);
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
            const ein = lang > 1e-9 ? Math.max(0, st.s - Math.sqrt(Math.max(0, rr * rr - d2)) / lang) : 0;
            best = { zone, s: st.s, ein, anker: g.anker, teil: g.teil };
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
        // DIE TÖNE DER FARBE (mensch.K4): trägt jedes Teil den Ton je Ecke (der Mensch, koerper `menschTon`), steht je Ton sein
        // Anteil am Mittel — ein Bewohner färbt sein Glied fern mit seiner Palette (`_tonFeldFarbe`), wie nah seine Ecken
        const mitTon = meshes.every((o) => !!o.geometry.attributes.aTon);
        const toene = mitTon ? new Map() : null;
        for (const o of meshes) {
            mL.multiplyMatrices(wurzelInv, o.matrixWorld);
            const pos = o.geometry.attributes.position;
            const col = o.geometry.attributes.color || null;
            const ton = mitTon ? o.geometry.attributes.aTon : null;
            const mc = !col && o.material && o.material.color ? o.material.color : null;
            const schritt = pos.count > 4000 ? Math.ceil(pos.count / 4000) : 1;
            bbT.makeEmpty();
            let tr = 0,
                tg = 0,
                tb = 0,
                tn = 0;
            const jeTon = ton ? new Map() : null;
            for (let i = 0; i < pos.count; i += schritt) {
                v.fromBufferAttribute(pos, i).applyMatrix4(mL);
                bb.expandByPoint(v);
                bbT.expandByPoint(v);
                let cr, cg, cb;
                if (col) [cr, cg, cb] = [col.getX(i), col.getY(i), col.getZ(i)];
                else if (mc) [cr, cg, cb] = [mc.r, mc.g, mc.b];
                else continue;
                tr += cr;
                tg += cg;
                tb += cb;
                tn++;
                if (jeTon) {
                    const t = Math.round(ton.getX(i));
                    const s = jeTon.get(t) || jeTon.set(t, [0, 0, 0]).get(t);
                    s[0] += cr;
                    s[1] += cg;
                    s[2] += cb;
                }
            }
            if (!tn || bbT.isEmpty()) continue;
            bbT.getSize(gr);
            const flaeche = Math.max(1e-6, 2 * (gr.x * gr.y + gr.y * gr.z + gr.z * gr.x));
            fr += (tr / tn) * flaeche;
            fg += (tg / tn) * flaeche;
            fb += (tb / tn) * flaeche;
            fw += flaeche;
            if (jeTon)
                for (const [t, s] of jeTon) {
                    const z = toene.get(t) || toene.set(t, [0, 0, 0]).get(t);
                    for (let k = 0; k < 3; k++) z[k] += (s[k] / tn) * flaeche;
                }
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
        return {
            a,
            b,
            r,
            farbe: fw > 0 ? { r: fr / fw, g: fg / fw, b: fb / fw } : null,
            toene: toene && fw > 0 ? [...toene].map(([t, s]) => [t, s[0] / fw, s[1] / fw, s[2] / fw]) : null,
        };
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_studio_glieder]);
