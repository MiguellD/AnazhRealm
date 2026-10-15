class AnazhRealm_Z11b {
    // ===== ATLAS §11b · VOXEL-MESHER/WASSER — Block Gelaende =====
    // Solid-Klassifikation der Architektur-Parts, UNIVERSELL: jede solide Substanz blockiert Wasser
    // (der `damm` ist eine Anwendung). Pro Part — Holz-Stamm blockiert, Laub-Krone nicht. dichte ≥ 0.3
    // schließt Laub/Federn (0.1), Glut (0.25) aus; Holz (0.4), Stein, Metall, Kristall, Erde bleiben.
    // Der Cell-Stempel (`_stampArchitectureSolidCellsInto`) iteriert `state.architectures` direkt.
    static get BLOCKER_DENSITY_MIN() {
        return 0.3;
    }

    // Ist die Part-Substanz fest genug, um Wasser zu blockieren? Ohne Material-Eintrag NICHT solide
    // (lieber nichts blockieren als versehentlich alles).
    _isPartSolid(part) {
        if (!part || typeof part.material !== "string") return false;
        const mat = this.state.materials && this.state.materials[part.material];
        if (!mat || !mat.tags) return false;
        const dichte = mat.tags.dichte;
        return Number.isFinite(dichte) && dichte >= AnazhRealm.BLOCKER_DENSITY_MIN;
    }

    // Welt-AABB eines Parts als EXAKTE Ecken-Hülle: die 8 Ecken der orientierten Box (part.rotation als
    // Euler XYZ wie `sub.rotation.set(x,y,z)` PLUS entry.rotationY) transformieren, achsen-parallel
    // umhüllen. Nie max(sx,sz)-Quadrat: dünne Wände würden Quadrate (Tür-Lücken zu), rotierte Parts
    // ragten hinaus. Der EINE Chokepoint für Spieler-Kapsel · Raycast · Wasser-Stempel.
    _blockerComputePartAABB(entry, part, mul = 1) {
        if (!part || !part.size || !part.position) return null;
        // V13.13.1 — `entry.scale` exakt wie `_rebuildArchitectureMesh` anwenden
        // (groupOrigin + part.position·scale, Größe part.size·scale — der
        // „Wasser-Schatten zur Struktur"-Befund, diag-scale-stamp). `mul`: die Welt-Skala des Studio-Werks
        // (`_studioWeltSkala`), mit der es gezeichnet wird.
        const scale = (Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1) * (mul > 0 ? mul : 1);
        const hx = ((part.size.x || 1) / 2) * scale;
        const hy = ((part.size.y || 1) / 2) * scale;
        const hz = ((part.size.z || 1) / 2) * scale;
        const px = (part.position.x || 0) * scale;
        const py = (part.position.y || 0) * scale;
        const pz = (part.position.z || 0) * scale;
        // Part-Euler (XYZ, Spiegel von THREE.Euler 'XYZ' — die Mesh-Wahrheit).
        const pr = part.rotation || null;
        const ax = pr ? pr.x || 0 : 0;
        const ay = pr ? pr.y || 0 : 0;
        const az = pr ? pr.z || 0 : 0;
        const a = Math.cos(ax),
            b = Math.sin(ax),
            c = Math.cos(ay),
            d = Math.sin(ay),
            e = Math.cos(az),
            f = Math.sin(az);
        const ae = a * e,
            af = a * f,
            be = b * e,
            bf = b * f;
        const m11 = c * e,
            m12 = -c * f,
            m13 = d,
            m21 = af + be * d,
            m22 = ae - bf * d,
            m23 = -b * c,
            m31 = bf - ae * d,
            m32 = be + af * d,
            m33 = a * c;
        // Entry-Gier (W-H V18.179): x' = x·cos + z·sin, z' = −x·sin + z·cos.
        const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
        const rc = Math.cos(ry),
            rs = Math.sin(ry);
        const ox = entry.position.x,
            oy = entry.position.y - 0.5,
            oz = entry.position.z;
        let minX = Infinity,
            maxX = -Infinity,
            minZ = Infinity,
            maxZ = -Infinity,
            topY = -Infinity,
            botY = Infinity;
        for (let k = 0; k < 8; k++) {
            const lx = k & 1 ? hx : -hx;
            const ly = k & 2 ? hy : -hy;
            const lz = k & 4 ? hz : -hz;
            // Part-Rotation → Part-Offset → Entry-Gier → Entry-Ursprung.
            const qx = m11 * lx + m12 * ly + m13 * lz + px;
            const qy = m21 * lx + m22 * ly + m23 * lz + py;
            const qz = m31 * lx + m32 * ly + m33 * lz + pz;
            const wx = ox + qx * rc + qz * rs;
            const wz = oz - qx * rs + qz * rc;
            const wy = oy + qy;
            if (wx < minX) minX = wx;
            if (wx > maxX) maxX = wx;
            if (wz < minZ) minZ = wz;
            if (wz > maxZ) maxZ = wz;
            if (wy > topY) topY = wy;
            if (wy < botY) botY = wy;
        }
        // DIE GEDREHTE BOX (D5, Welle L — dieselbe Form wie die Haus-Hülle `_hausObb`): ein Teil, das nur um die Hoch-Achse
        // dreht, ist in der Ebene ein Rechteck mit der Gier Eintrag + Teil; quer zu den Welt-Achsen trägt es seine `obb`, und
        // Kapsel, Tier-Leib, Wagen-Hülle, Strahl und Zellen-Stempel lösen in ihrem Rahmen (die Welt-AABB bleibt Vorfilter).
        // Vorher stand jedes gedrehte Teil als seine Welt-AABB (eine 34° gedrehte Mauer aus einem Teil 12 × 0,8 m: die Hülle
        // eines Wagens hielt 2,36 m vor ihr; der geparkte Wagen, der gedrehte Fels, das Tor ebenso). Achsparallele Teile
        // bleiben byte-alt.
        if (ax === 0 && az === 0) {
            const gier = ry + ay;
            if (Math.abs(Math.sin(2 * gier)) > 1e-9) {
                return {
                    minX,
                    maxX,
                    minZ,
                    maxZ,
                    topY,
                    botY,
                    obb: {
                        cx: ox + px * rc + pz * rs,
                        cz: oz - px * rs + pz * rc,
                        c: Math.cos(gier),
                        s: Math.sin(gier),
                        hx,
                        hz,
                    },
                };
            }
        }
        return { minX, maxX, minZ, maxZ, topY, botY };
    }

    // Die Welt-Skala eines Studio-Werks: dieselbe, mit der es gezeichnet wird (`_foundryWorldScaleMatrix` seines Presets) —
    // JEDES Werk, das das Studio zeichnet (Leben-Schau 2, 09.10.: bis dahin nur die Bäume; Fels 0,34–0,42, Kristall 0,15 und
    // Blume 0,27 kollidierten in Vorlagen-Größe), 1 für alles, was das Studio nicht zeichnet.
    _studioWeltSkala(entry) {
        if (!entry || !this._foundryEnabled()) return 1;
        const pr = this._foundryPresetForEntry(entry);
        if (!pr) return 1;
        const k = this._foundryWorldScaleMatrix(pr).elements[0];
        return Number.isFinite(k) && k > 0 ? k : 1;
    }

    // Schreibt `entry.blockerAABBs` (nur solide Parts, `_isPartSolid`) — Spawn, Restore und Dismount-
    // Refresh laufen hier durch. Leser: Cell-Stempel (`_stampArchitectureSolidCellsInto`), Kapsel,
    // Raycast (über die Nachbarschaft `_blockerNetz`, gestempelt in `_blockerStampReach`).
    // DAS GEFÄHRT STEHT IM WASSER (Karte K02): was man reitet (`affordances.moveable`) bewegt sich — seine Hülle (der Fahrzeug-
    // und der Teile-Zweig) stempelt wie die Pflanze keine Wasser-Zelle (`stempelfrei`, `_stempelSpanne`), das Wasser fließt um
    // es, wie der Körper es liest. Bis hierhin wurde der geparkte GT in der Furt (0,74 m Wasser), sobald sein Chunk neu entstand,
    // ein Damm: sein Stempel verdrängte Wasser, der Automat wachte (15 Chunks) und rechnete das Wasser am Wagen in 4 s auf 0,14 m.
    _populateBlockerAABBs(entry) {
        const gefaehrt = !!(entry.affordances && entry.affordances.moveable);
        // Tor-Gestalt (studioGestalt-Zeile ODER Katalog-Typ tor_*): die Kollision deckt die SICHTBARE
        // Studio-Form (Pfosten + Bogen aus deriveGate/deriveFrame, Öffnung FREI), nicht die Substanz-Parts.
        // Die Gestalt-ZEILE entscheidet (deterministisch am Spawn, Lockstep), nie der Buch-Lade-Stand.
        const torBoxes = this._torBlockerAABBs(entry);
        if (torBoxes && torBoxes.length) {
            entry.blockerAABBs = torBoxes;
            this._blockerStampReach(entry);
            return;
        }
        // HAUS (Welle L, Kollision == Optik): die Solids des Gesetzbuchs, die JEDE Studio-Stufe trägt (`_hausHuelleSetzen`),
        // gedreht wie das Haus (OBB); bis die erste Stufe liefert, die Kern-Hülle aus der Tür-Zeile mit Tür-Lücke. Vorher
        // vier EG-Riegel als achsparallele Welt-AABB: gedrehte Häuser 18–35 % begehbar, Kletterwand statt Treppe, der Fuß
        // 0,50 m unter der Diele (Leben-Prüfung N-D2 bis N-D4), das Solo-Haus stieß an `haus_basis` (3,09 m in der Wand).
        const hausBoxes = this._hausBlockerBoxen(entry);
        if (hausBoxes) {
            const fuH = this._archFundamentBox(entry);
            if (fuH) hausBoxes.push(fuH);
            if (hausBoxes.length) {
                entry.blockerAABBs = hausBoxes;
                this._blockerStampReach(entry);
                return;
            }
        }
        // Fahrzeug-Gestalt: die Kollision deckt die SICHTBARE Studio-Form (exportDrive.huelle: Unterkörper
        // + Greenhouse + Räder). Fail-closed: kein Kern/keine Gestalt → generischer Parts-Pfad.
        const fzgParts = this._fahrzeugBlockerParts(entry);
        if (fzgParts) {
            const fzgBoxes = [];
            for (const part of fzgParts) {
                const aabb = this._blockerComputePartAABB(entry, part);
                if (!aabb) continue;
                if (gefaehrt) aabb.stempelfrei = true;
                fzgBoxes.push(aabb);
            }
            if (fzgBoxes.length) {
                entry.blockerAABBs = fzgBoxes;
                this._blockerStampReach(entry);
                return;
            }
        }
        // FELS-/KRISTALL-HÜLLE (18.07.) — vierter Gesetz-Zweig (die Tor-Klasse): JEDES Werk, das das Studio als Fels
        // zeichnet, deckt die GEMESSENE Studio-Hülle in seiner Welt-Skala statt der Substanz-Parts (Leben-Schau 2: der
        // Felsturm stieß als 4,4 × 16,8-m-Eisenmast, gezeichnet stand ein 1,4 × 0,8-m-Zacken). Fail-closed: das Studio
        // zeichnet ihn nicht → Parts-Pfad (die Parts SIND dann das Bild).
        const felsParts = this._felsBlockerParts(entry);
        if (felsParts) {
            const felsBoxes = [];
            const kFels = this._studioWeltSkala(entry);
            for (const part of felsParts) {
                const aabb = this._blockerComputePartAABB(entry, part, kFels);
                if (!aabb) continue;
                // DER FELS IST NATUR (PHYTO_PRESETS, `_istNatur`; Integration V18.540, K02a × K02b): seine Hülle in der
                // Welt-Skala stempelt wie die Pflanze keine Wasser-Zelle — der Körper stößt an sie, das Wasser fließt um sie.
                // Am vereinigten Baum stempelte die eine Hüllen-Box zweier Felsbögen an der Furt Wasser-Zellen (der Bogen samt
                // Öffnung als Säule): ein Damm, den es nicht gibt, 2 Weckrufe des Automaten, 15 Chunks wach.
                aabb.stempelfrei = true;
                felsBoxes.push(aabb);
            }
            if (felsBoxes.length) {
                entry.blockerAABBs = felsBoxes;
                this._blockerStampReach(entry);
                return;
            }
        }
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        // DER GEFÜHLTE BAUM IST DER GEZEICHNETE (K20): zeichnet das Studio einen Baum oder Strauch, trägt das Skelett seiner
        // Gestalt die Kollision (`_baumGestaltTeile`), nie der Bauplan der Art (ein zweites Individuum: 40 Nadelbäume
        // ragten 0,55–2,14 m über ihr Bild, der Solitär trug keinen FREISTAND, sein Stamm stand 2,2× dünner als gezeichnet).
        const baumTeile = this._baumGestaltTeile(entry);
        if (baumTeile === null) return; // die Gestalt wartet — die Hülle folgt ihr (`_foundryGestaltFor`)
        const teile = baumTeile || (bp && bp.parts);
        if (!Array.isArray(teile) || teile.length === 0) return;
        const solidAABBs = [];
        // DIE STAMM-HÜLLE IM WELTMASS (Leben-Schau 07.10., L-Kamera / V-D1): der Studio-Baum steht in der Welt × seiner
        // Welt-Skala (`_foundryWorldScaleMatrix`, 3,4–4,0), sein Stamm-Blocker stand im Vorlagen-Maß — 0,19 m halbe Breite
        // und 0,6 m hoch an einer Kiefer, deren Stamm 13 m hoch steht: der Spieler lief durch den Stamm, die 3rd-Kamera
        // stand in ihm (0,53 m von der Achse). Kollision == Optik: die Teile tragen dieselbe Skala wie die Gestalt — jedes
        // Studio-Werk, nicht nur der Baum (Leben-Schau 2: die Blume 0,27 stand 2,1 m über ihrem Bild).
        const kWelt = this._studioWeltSkala(entry);
        const scD = (Number.isFinite(entry.scale) ? entry.scale : 1) * kWelt;
        // Die Hülle einer PFLANZE (Natur, die nicht Fels ist — der Fels hat seinen Zweig oben): der Körper stößt an sie, der
        // Strahl der 3rd-Kamera geht durch sie (`_fieldRaycast` `durchPflanzen`), die Pflanze wird durchsichtig.
        const pflanze = this._istNatur(entry);
        for (const part of teile) {
            if (!this._isPartSolid(part)) continue;
            const aabb = this._blockerComputePartAABB(entry, part, kWelt);
            if (!aabb) continue;
            if (pflanze) aabb.pflanze = true;
            if (pflanze || gefaehrt) aabb.stempelfrei = true; // keine Wasser-Zelle (`_stempelSpanne`)
            // Welle L (Q5): ein STAMM (Zylinder-Teil) trägt seine Dicke — was dünner ist als die Stufe eines Rades (der
            // Hasel-Trieb, der Ast), überrollt die Hülle des Wagens (`_fahrHuelleKontakt`); die Kapsel liest das Feld nie.
            if (part.shape === "cylinder" && part.size)
                aabb.dick = Math.min(Math.abs(part.size.x) || 0, Math.abs(part.size.z) || 0) * scD;
            solidAABBs.push(aabb);
        }
        // Das FUNDAMENT ist Blocker-Wahrheit: der Sockel vom tiefsten Footprint-Punkt bis zur Haus-Basis
        // ist SOLID (Kapsel, Cell-Stempel, Wasser urteilen gleich — nicht unters Haus am Hang). Gedreht trägt es seine
        // `obb` (Kapsel, Strahl und Zellen-Stempel im Rahmen des Podests), die Welt-AABB bleibt Vorfilter.
        const fu = this._archFundamentBox(entry);
        if (fu) solidAABBs.push(fu);
        if (solidAABBs.length === 0) return;
        entry.blockerAABBs = solidAABBs;
        this._blockerStampReach(entry);
    }

    // Die Hülle am Eintrag (Beipack `__huelle` des fachwerk-Asset in der EINEN Hüllen-Form N5, haus-lokal, je Solid-Box ein Teil
    // mit rolle "fest" — S3 haus: der Parser ist `_huelleVon`, derselbe wie der Fernform): JEDE Stufe trägt die
    // Solids des Gesetzbuchs (die der Stufe 0) — die Welt kollidiert in jeder Ferne, wie das Haus nah gezeichnet ist. Vorher
    // trug die Fernstufe ihre Bounding-Box: beim Hof-Haus 8,2 m vor den Solids, die Tür von vorn unerreichbar (die Stufe 0
    // kommt erst unter 8,6 m Mittelabstand). Ein Stufen-Wechsel mit derselben Zeile schreibt die Blocker nicht neu.
    _hausHuelleSetzen(entry, huelle) {
        if (!entry || !huelle) return;
        const alt = entry._hausHuelle;
        if (alt === huelle) return;
        const fest = AnazhRealm._huelleVon(huelle, "fest", "fachwerk:__huelle");
        if (!fest || !fest.length) return;
        entry._hausHuelle = huelle;
        if (alt && JSON.stringify(alt.teile) === JSON.stringify(huelle.teile)) return;
        const pr = this._foundryPresetForEntry(entry);
        const ws = pr ? this._foundryWorldScaleMatrix(pr) : null;
        entry._hausHuelleSkala = ws && ws.elements ? ws.elements[0] || 1 : 1;
        this._populateBlockerAABBs(entry);
        // mit der Hülle kennt das Haus seinen Grundriss (`_grundrissVon`): was dort wuchs, weicht (`_grundrissRaeumen`)
        if (entry.position && this.state.architectures && this.state.architectures.includes(entry))
            this._grundrissRaeumen(entry);
    }

    // Die Blocker-Boxen eines Hauses: je Hüllen-Box eine GEDREHTE Box (obb: Mitte, Gier, Halb-Maße — das Labor-overlap-
    // Gesetz) mit ihrer Welt-AABB als Vorfilter; ohne Studio-Hülle die Kern-Hülle aus der Tür-Zeile (`_hausKernHuelle`).
    // null: kein Haus.
    _hausBlockerBoxen(entry) {
        const hu = entry && entry._hausHuelle;
        const t = entry && entry.tuer;
        let boxen = null;
        let k = 1;
        const fest = hu ? AnazhRealm._huelleVon(hu, "fest", "fachwerk:__huelle") : null;
        if (fest && fest.length) {
            boxen = [];
            for (const q of fest)
                if (q.art === "box")
                    boxen.push(
                        q.c[0] - q.h[0],
                        q.c[1] - q.h[1],
                        q.c[2] - q.h[2],
                        q.c[0] + q.h[0],
                        q.c[1] + q.h[1],
                        q.c[2] + q.h[2]
                    );
            k = Number.isFinite(entry._hausHuelleSkala) ? entry._hausHuelleSkala : 1;
        } else if (t && Number.isFinite(t.W) && Number.isFinite(t.D) && t.W > 1.5 && t.D > 1.5) {
            boxen = this._hausKernHuelle(t);
        } else return null;
        const out = [];
        for (let i = 0; i + 5 < boxen.length; i += 6) {
            const b = this._hausObb(
                entry,
                boxen[i],
                boxen[i + 1],
                boxen[i + 2],
                boxen[i + 3],
                boxen[i + 4],
                boxen[i + 5],
                k
            );
            if (b) out.push(b);
        }
        return out.length ? out : null;
    }

    // DIE KERN-HÜLLE vor der ersten Studio-Stufe: die Tür-Zeile des Gesetzbuchs (Export: Tür-Rechteck, Kern-W/D, Hintertür)
    // — vier EG-Wände mit Haus- und Hintertür-Lücke, Sturz darüber, und die Diele als Sockel bis zur Schwelle; haus-lokal
    // [x0,y0,z0,x1,y1,z1]…. Vorher eine geschlossene Box W × D (die Tür zu, bis das Studio lieferte).
    _hausKernHuelle(t) {
        const H = 3.1;
        const dick = 0.35;
        const W2 = t.W / 2;
        const D2 = t.D / 2;
        const out = [];
        const box = (x0, y0, z0, x1, y1, z1) => {
            if (x1 - x0 > 0.05 && y1 - y0 > 0.05 && z1 - z0 > 0.02) out.push(x0, y0, z0, x1, y1, z1);
        };
        if (Number.isFinite(t.y) && t.y > 0.05) box(-W2, 0, -D2, W2, t.y, D2); // die Diele bis zur Schwelle
        const wandX = (zF, l) => {
            const z0 = zF - dick / 2;
            const z1 = zF + dick / 2;
            if (!l) return box(-W2, 0, z0, W2, H, z1);
            const g0 = Math.max(-W2, l.x - l.w / 2 - 0.15);
            const g1 = Math.min(W2, l.x + l.w / 2 + 0.15);
            box(-W2, 0, z0, g0, H, z1);
            box(g1, 0, z0, W2, H, z1);
            box(g0, (Number.isFinite(l.y) ? l.y : 0.55) + (Number.isFinite(l.h) ? l.h : 2.05) + 0.1, z0, g1, H, z1);
        };
        wandX(t.z, Number.isFinite(t.x) && Number.isFinite(t.w) ? t : null); // die Front mit der Haustür
        const hi = t.hinten;
        wandX(-t.z, hi && Number.isFinite(hi.x) && Number.isFinite(hi.w) ? { x: hi.x, w: hi.w, y: t.y, h: t.h } : null);
        box(-W2 - dick / 2, 0, -D2, -W2 + dick / 2, H, D2);
        box(W2 - dick / 2, 0, -D2, W2 + dick / 2, H, D2);
        return out;
    }

    // Eine haus-lokale Box → die GEDREHTE Blocker-Box der Welt: T(x, y−0,5, z) · R_y(rotationY) · S(scale·k) — dieselbe
    // Matrix wie die Instanz (`_archEntryWorldMatrix`). Felder: die Welt-AABB (minX…botY, der Vorfilter jedes Lesers)
    // und `obb` { cx, cz, c, s, hx, hz } — lokal = (Δx·c − Δz·s, Δx·s + Δz·c). Entartete Boxen (Breite ≤ 0) fallen.
    _hausObb(entry, x0, y0, z0, x1, y1, z1, k) {
        const sc = (Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1) * (k || 1);
        const hx = ((x1 - x0) / 2) * sc;
        const hz = ((z1 - z0) / 2) * sc;
        if (!(hx > 1e-4) || !(hz > 1e-4) || !(y1 > y0)) return null;
        const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
        const c = Math.cos(ry);
        const sn = Math.sin(ry);
        const lx = ((x0 + x1) / 2) * sc;
        const lz = ((z0 + z1) / 2) * sc;
        const cx = entry.position.x + lx * c + lz * sn;
        const cz = entry.position.z - lx * sn + lz * c;
        const oy = entry.position.y - 0.5;
        const ex = hx * Math.abs(c) + hz * Math.abs(sn);
        const ez = hx * Math.abs(sn) + hz * Math.abs(c);
        return {
            minX: cx - ex,
            maxX: cx + ex,
            minZ: cz - ez,
            maxZ: cz + ez,
            topY: oy + y1 * sc,
            botY: oy + y0 * sc,
            obb: { cx, cz, c, s: sn, hx, hz },
        };
    }

    // Die EINE Fundament-Geometrie (Blocker UND Render-Podest): aus entry.fundament {ex,ez} um seine Mitte
    // {ox,oz} (haus-lokal) + LIVE-Terrain-Ecken. null ohne fundament-Feld oder auf ebenem Land (Podest < 0.25 m).
    // Tiefe stets aus dem Dichte-Feld, nie persistiert (deterministisch).
    _archFundamentBox(entry) {
        const f = entry && entry.fundament;
        if (!f || !Number.isFinite(f.ex) || !Number.isFinite(f.ez)) return null;
        if (typeof this.getTerrainHeightAt !== "function") return null;
        const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
        const rc = Math.cos(ry);
        const rs = Math.sin(ry);
        const lox = Number.isFinite(f.ox) ? f.ox : 0;
        const loz = Number.isFinite(f.oz) ? f.oz : 0;
        const ox = (entry.position.x || 0) + lox * rc + loz * rs;
        const oz = (entry.position.z || 0) - lox * rs + loz * rc;
        // Marge FUNDAMENT_SOCKEL_M: der Sockel steht sichtbar unter der Schwelle hervor
        // (Sockel-Look) und deckt die Fachwerk-Traufkante; die Wasser-Wand fragt dieselbe Fläche (`_fundamentLand`).
        const ex = f.ex + AnazhRealm.FUNDAMENT_SOCKEL_M;
        const ez = f.ez + AnazhRealm.FUNDAMENT_SOCKEL_M;
        let hMin = Infinity;
        let halfX = 0;
        let halfZ = 0;
        for (let k = 0; k < 4; k++) {
            const lx = k & 1 ? ex : -ex;
            const lz = k & 2 ? ez : -ez;
            const cxw = lx * rc + lz * rs;
            const czw = -lx * rs + lz * rc;
            if (Math.abs(cxw) > halfX) halfX = Math.abs(cxw);
            if (Math.abs(czw) > halfZ) halfZ = Math.abs(czw);
            const h = this.getTerrainHeightAt(ox + cxw, oz + czw);
            if (Number.isFinite(h) && h < hMin) hMin = h;
        }
        if (!Number.isFinite(hMin)) return null;
        // Oberkante knapp unter der Haus-Basis (entry.y − 0.5 = Bauplan-Boden,
        // s. _archEntryWorldMatrix baseY) — 5 cm Überlapp gegen Licht-Spalte;
        // Unterkante 0.6 m UNTER der tiefsten Ecke (im Fels versiegelt).
        const top = (Number.isFinite(entry.position.y) ? entry.position.y : 0) - 0.45;
        const bot = hMin - 0.6;
        if (!(top - bot > 0.25)) return null; // eben → kein Podest
        // AABB-Felder = Vorfilter und Spanne des Zell-Stempels (konservativ, rotations-überdeckt);
        // ex/ez/ry/x/z = Render-Leser (das GEDREHTE dichte Podest), obb = Kapsel, Strahl und die Zellen des Stempels.
        return {
            minX: ox - halfX,
            maxX: ox + halfX,
            minZ: oz - halfZ,
            maxZ: oz + halfZ,
            topY: top,
            botY: bot,
            ex,
            ez,
            ry,
            x: ox,
            z: oz,
            // DIE GEDREHTE BOX (Welle L, Kollision == Optik): Kapsel und Strahl lösen im Rahmen des gezeichneten Podests
            // (`_resolveCapsuleVsAABB`, `_segmentAABB`) und der Zell-Stempel stempelt nur die Zellen, die sie berührt (Karte
            // K02) — die Welt-AABB bleibt ihr Vorfilter. Vorher trug die rotations-überdeckende AABB die Ecken eines gedrehten
            // Hauses als Podest in der Luft.
            obb: { cx: ox, cz: oz, c: rc, s: rs, hx: ex, hz: ez },
        };
    }

    // Horizontale REICHWEITE der Blocker-Hülle (max. Abstand einer AABB-Kante vom Entry-Ursprung). Die
    // Nah-Culls der Leser (Kapsel 60 m · Raycast 80 m) addieren sie — sonst verliert ein großes Bauwerk
    // die Kollision seiner Randparts.
    _blockerStampReach(entry) {
        if (!entry || !entry.blockerAABBs) return;
        this._blockerFugen(entry.blockerAABBs);
        let r = 0;
        for (const b of entry.blockerAABBs) {
            r = Math.max(
                r,
                Math.abs(b.minX - entry.position.x),
                Math.abs(b.maxX - entry.position.x),
                Math.abs(b.minZ - entry.position.z),
                Math.abs(b.maxZ - entry.position.z)
            );
        }
        entry._blockerReach = r;
        this._blockerNetzSetzen(entry);
    }

    // DIE FUGE (K24-N1): die Oberkante einer Box, auf der eine Box DESSELBEN Werks sitzt — sie beginnt höchstens
    // PLAYER_GROUND_SNAP über ihr, steigt über sie, deckt ihre Mitte, und der Rand daneben ist schmaler als der Wand-Radius
    // der Kapsel —, ist keine Fläche: die Fuge zweier Stamm-Abschnitte, zweier Fels-Lagen, der Pfosten unter dem Bogen. Sie
    // trägt keinen Leib (`gedeckt`; die Auflage der Kapsel `_resolveCapsuleVsAABB` und die des Tiers `_kreaturAuflage`
    // übergehen sie). Eine Treppe bleibt Treppe: die nächste Stufe deckt nie die Mitte der vorigen. Gedrehte Boxen messen im
    // Rahmen der deckenden (`obb`). Vorher stand jeder Leib, der einen Baum berührte, auf der ersten Stamm-Fuge in der Box
    // darüber (gate:koerper-stand K4: das Tier stieg an einer Tanne 0,6 m je Takt, jede der 2803 Fugen trug).
    _blockerFugen(boxes) {
        const R = AnazhRealm.PLAYER_WALL_RADIUS;
        const SNAP = AnazhRealm.PLAYER_GROUND_SNAP;
        const E = this._fugenEcken || (this._fugenEcken = new Float64Array(10));
        // die vier Ecken und die Mitte der Grundfläche (gedreht: aus der obb)
        const ecken = (a) => {
            const ob = a.obb;
            if (ob) {
                for (let i = 0; i < 4; i++) {
                    const lx = i & 1 ? ob.hx : -ob.hx;
                    const lz = i & 2 ? ob.hz : -ob.hz;
                    E[2 * i] = ob.cx + lx * ob.c + lz * ob.s;
                    E[2 * i + 1] = ob.cz - lx * ob.s + lz * ob.c;
                }
                E[8] = ob.cx;
                E[9] = ob.cz;
                return;
            }
            E[0] = E[4] = a.minX;
            E[2] = E[6] = a.maxX;
            E[1] = E[3] = a.minZ;
            E[5] = E[7] = a.maxZ;
            E[8] = (a.minX + a.maxX) / 2;
            E[9] = (a.minZ + a.maxZ) / 2;
        };
        // liegt (x, z) in der Grundfläche von b, um `rand` erweitert?
        const innen = (b, x, z, rand) => {
            const ob = b.obb;
            if (!ob) return x >= b.minX - rand && x <= b.maxX + rand && z >= b.minZ - rand && z <= b.maxZ + rand;
            const dx = x - ob.cx;
            const dz = z - ob.cz;
            return Math.abs(dx * ob.c - dz * ob.s) <= ob.hx + rand && Math.abs(dx * ob.s + dz * ob.c) <= ob.hz + rand;
        };
        for (const a of boxes) {
            let gedeckt = false;
            let eckenDa = false;
            for (const b of boxes) {
                if (b === a || !(b.botY <= a.topY + SNAP) || !(b.topY > a.topY)) continue;
                if (!eckenDa) {
                    ecken(a);
                    eckenDa = true;
                }
                if (!innen(b, E[8], E[9], 0)) continue;
                if (
                    innen(b, E[0], E[1], R) &&
                    innen(b, E[2], E[3], R) &&
                    innen(b, E[4], E[5], R) &&
                    innen(b, E[6], E[7], R)
                ) {
                    gedeckt = true;
                    break;
                }
            }
            a.gedeckt = gedeckt;
        }
    }

    // DIE NACHBARSCHAFT DER BLOCKER (0710-7): ein Gitter aus Zellen (AnazhRealm.BLOCKER_ZELLE m) über die Hülle jedes Eintrags
    // im Bestand (`state.architectures`) — je Zelle die Einträge, deren Blocker-Boxen sie überdecken; wer mehr als
    // BLOCKER_ZELLEN_MAX Zellen überdeckte oder keine endliche Hülle trägt, steht in der Riesen-Zelle (jede Frage liest sie).
    // Gestempelt, wo sich der Bestand ändert: beim Eintritt (`spawnArchitecture` → `_blockerEintritt`), bei jedem Schreiben
    // der Boxen (`_blockerStampReach`), beim Austritt (`removeArchitecture`, `_evictArchitecture` → `_blockerAustritt`); ein
    // neues Array (eine neue Welt, der geleerte Bestand) baut das Netz in seiner Ordnung neu — nie je Leser. `_blockerSeq`
    // ist die Ordnung des Bestands (Eintritt aufsteigend = die Ordnung des Arrays): ein Leser entscheidet Gleichstände wie die
    // Schleife über das Array. Leser: der Struktur-Strahl (`_fieldRaycast`) und der Struktur-Löser von Kapsel und Wagen-Hülle
    // (`_stepCharacterStructures` über `_blockerNahe`). DER ZWEITE SCHLÜSSEL, der PLATZ: jeder Eintrag des Bestands (auch
    // ohne Boxen) steht in den Zellen von Position ± Reichweite (`plaetze`); wandert seine Position nach dem Eintritt (das
    // gerittene Werk, `_blockerBewegt`), fragt man ihn direkt (`beweger`). Leser: der Tier-Leib (`_kreaturHuellenKontakt`
    // über `_blockerUmPlatz`), ebenso der Brennglas-Takt, die Resonanz der Boosts und das Lofi-Pad. DAS VERZEICHNIS
    // (0710-10): je Name die Einträge, die ihn tragen — jeder Schlüssel ihrer Affordanzen (`entry.affordances`, beim Spawn
    // eingefroren, nachgezogen von `setBlueprintAsPortal`) und „rauch" (ein Kamin: `userData.rauchQuelle` oder `chimney`),
    // gestempelt mit den Zellen; `_blockerMit(name)` gibt sie in der Ordnung des Bestands. Leser: die Affordanz-Takte und der
    // Dorf-Rauch. Die WARMEN Einträge (`warm`, Hitze > 0) führt der Brennglas-Takt — erwärmt wird nur dort; jeder Stempel
    // trägt einen warmen Eintrag ein (ein Wiedereintritt). Das alte Bucket-Grid (`state.blockerIndex`, V9.65) trug die
    // Hydrosphäre und fiel mit ihr.
    _blockerNetz() {
        const liste = this.state.architectures;
        const alt = this._blockerNetzStand;
        if (alt && alt.liste === liste) return alt;
        const N = (this._blockerNetzStand = {
            liste,
            zellen: new Map(),
            plaetze: new Map(),
            beweger: new Set(),
            verzeichnis: new Map(),
            verzeichnisListe: new Map(),
            warm: alt ? alt.warm : new Set(),
            seq: alt ? alt.seq : 0,
            gen: alt ? alt.gen + 1 : 1,
            // der Zähler der Fragen läuft über jeden Neubau weiter (wie die Ordnung): die Einträge tragen die Marken der alten
            // Fragen (`_blockerFrage`) — ein Zähler ab 0 träfe eine alte Marke, die Frage überginge den Eintrag
            frage: alt ? alt.frage : 0,
        });
        if (Array.isArray(liste))
            for (const e of liste) {
                if (!e) continue;
                e._blockerGen = N.gen;
                e._blockerSeq = ++N.seq;
                this._blockerNetzSetzen(e);
            }
        return N;
    }

    // Eintritt in den Bestand (nach dem push): die Ordnung und die Zellen.
    _blockerEintritt(entry) {
        const N = this._blockerNetz();
        entry._blockerGen = N.gen;
        entry._blockerSeq = ++N.seq;
        this._blockerNetzSetzen(entry);
    }

    // Austritt aus dem Bestand (nach dem splice): die Zellen geben ihn frei.
    _blockerAustritt(entry) {
        this._blockerNetzLoesen(entry);
        if (this._blockerNetzStand) this._blockerNetzStand.beweger.delete(entry);
        entry._blockerGen = 0;
    }

    // Ein Eintrag, dessen Position nach dem Eintritt wandert (das gerittene Werk folgt seinem Reiter in x/z, `_rittSchritt`):
    // sein Platz steht nicht mehr, wo er gestempelt wurde — die Frage nach Plätzen prüft ihn direkt, bis er den Bestand verlässt.
    _blockerBewegt(entry) {
        const N = this._blockerNetz();
        if (entry._blockerGen === N.gen) N.beweger.add(entry);
    }

    // Die Zellen eines Eintrags aus der Hülle seiner Boxen (die alten vorher gelöst; außerhalb des Bestands keine).
    _blockerNetzSetzen(entry) {
        const N = this._blockerNetz();
        this._blockerNetzLoesen(entry);
        if (entry._blockerGen !== N.gen) return;
        entry._blockerZellenGen = N.gen;
        if (entry.heatBuildup > 0) N.warm.add(entry); // ein warmer Eintrag tritt (wieder) ein: der Brennglas-Takt kühlt ihn
        const pos = entry.position;
        if (pos) {
            const rr = entry._blockerReach || 0;
            entry._blockerPlatz = this._blockerZellenEin(
                N.plaetze,
                entry,
                pos.x - rr,
                pos.x + rr,
                pos.z - rr,
                pos.z + rr
            );
        }
        const namen = this._blockerNamen(entry);
        if (namen.length) {
            for (const n of namen) {
                let menge = N.verzeichnis.get(n);
                if (!menge) N.verzeichnis.set(n, (menge = new Set()));
                menge.add(entry);
                N.verzeichnisListe.delete(n);
            }
            entry._blockerNamenListe = namen;
        }
        const boxes = entry.blockerAABBs;
        if (!boxes || !boxes.length) return;
        let x0 = Infinity,
            x1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            if (b.minX < x0) x0 = b.minX;
            if (b.maxX > x1) x1 = b.maxX;
            if (b.minZ < z0) z0 = b.minZ;
            if (b.maxZ > z1) z1 = b.maxZ;
        }
        entry._blockerHuelle =
            Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(z0) && Number.isFinite(z1)
                ? [x0, x1, z0, z1]
                : null;
        entry._blockerZellen = this._blockerZellenEin(N.zellen, entry, x0, x1, z0, z1);
    }

    // Trägt einen Eintrag in die Zellen von `karte` über das Rechteck x0..x1 · z0..z1 ein — zu groß (mehr als
    // BLOCKER_ZELLEN_MAX Zellen) oder nicht endlich: die Riesen-Zelle — und gibt die Schlüssel.
    _blockerZellenEin(karte, entry, x0, x1, z0, z1) {
        const Z = AnazhRealm.BLOCKER_ZELLE;
        const keys = [];
        if (Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(z0) && Number.isFinite(z1)) {
            const ix0 = Math.floor(x0 / Z),
                ix1 = Math.floor(x1 / Z),
                iz0 = Math.floor(z0 / Z),
                iz1 = Math.floor(z1 / Z);
            if ((ix1 - ix0 + 1) * (iz1 - iz0 + 1) <= AnazhRealm.BLOCKER_ZELLEN_MAX)
                for (let ix = ix0; ix <= ix1; ix++) for (let iz = iz0; iz <= iz1; iz++) keys.push(ix * 2097152 + iz);
        }
        if (!keys.length) keys.push(AnazhRealm.BLOCKER_RIESE);
        for (let i = 0; i < keys.length; i++) {
            let zelle = karte.get(keys[i]);
            if (!zelle) karte.set(keys[i], (zelle = []));
            zelle.push(entry);
        }
        return keys;
    }

    _blockerZellenAus(karte, entry, keys) {
        for (let i = 0; i < keys.length; i++) {
            const zelle = karte.get(keys[i]);
            if (!zelle) continue;
            const j = zelle.indexOf(entry);
            if (j < 0) continue;
            zelle[j] = zelle[zelle.length - 1];
            zelle.pop();
            if (!zelle.length) karte.delete(keys[i]);
        }
    }

    // DIE FRAGE NACH PLÄTZEN (Leser: der Tier-Leib): die Einträge des Bestands, deren Platz (Position ± Reichweite) das Quadrat
    // x/z ± `weite` berührt — aus den Platz-Zellen und der Riesen-Zelle —, dazu jeder Beweger, in der Ordnung des Bestands nach
    // `out`. Ein Obermenge: die Probe je Eintrag stellt der Leser. Eine nicht endliche Frage erreicht jeden Eintrag. Mit `name`
    // (K54) nur die Einträge, die ihn im VERZEICHNIS tragen — die Frage der Affordanz-Takte um den Spieler: der Takt kostet die
    // Nähe, nie den Bestand der Welt.
    _blockerUmPlatz(x, z, weite, out, name) {
        const N = this._blockerNetz();
        const menge = name ? N.verzeichnis.get(name) : null;
        if (name && !(menge && menge.size)) return out;
        const frage = ++N.frage;
        const n0 = out.length;
        if (!(Number.isFinite(weite) && Number.isFinite(x) && Number.isFinite(z))) {
            for (const e of N.liste) if (e && (!menge || menge.has(e))) out.push(e);
            return out;
        }
        const Z = AnazhRealm.BLOCKER_ZELLE;
        const ix0 = Math.floor((x - weite) / Z),
            iz0 = Math.floor((z - weite) / Z);
        const nx = Math.floor((x + weite) / Z) - ix0 + 1;
        const nZellen = nx * (Math.floor((z + weite) / Z) - iz0 + 1);
        for (let c = -1; c < nZellen; c++) {
            const zelle = N.plaetze.get(
                c < 0 ? AnazhRealm.BLOCKER_RIESE : (ix0 + (c % nx)) * 2097152 + iz0 + Math.floor(c / nx)
            );
            if (!zelle) continue;
            for (let i = 0; i < zelle.length; i++) {
                const e = zelle[i];
                if (e._blockerFrage === frage || (menge && !menge.has(e))) continue;
                e._blockerFrage = frage;
                out.push(e);
            }
        }
        for (const e of N.beweger)
            if (e._blockerFrage !== frage && (!menge || menge.has(e))) {
                e._blockerFrage = frage;
                out.push(e);
            }
        if (out.length - n0 > 1) out.sort(AnazhRealm._nachBestand);
        return out;
    }

    // DIE FRAGE DER NÄHE (Leser: der Struktur-Löser `_stepCharacterStructures`): die Einträge des Bestands hinter `nachSeq`,
    // deren Hülle (`_blockerHuelle`) den Punkt x/z auf `reich` erreicht — aus den Zellen um ihn und der Riesen-Zelle, in der
    // Ordnung des Bestands nach `out`. Eine nicht endliche Frage (Reichweite oder Punkt) erreicht jeden Eintrag.
    _blockerNahe(x, z, reich, nachSeq, out) {
        const N = this._blockerNetz();
        const frage = ++N.frage;
        if (!(Number.isFinite(reich) && Number.isFinite(x) && Number.isFinite(z))) {
            for (const e of N.liste) if (e && e._blockerSeq > nachSeq) out.push(e);
            return out;
        }
        const Z = AnazhRealm.BLOCKER_ZELLE;
        const ix0 = Math.floor((x - reich) / Z),
            iz0 = Math.floor((z - reich) / Z);
        const nx = Math.floor((x + reich) / Z) - ix0 + 1;
        const nZellen = nx * (Math.floor((z + reich) / Z) - iz0 + 1);
        const n0 = out.length;
        for (let c = -1; c < nZellen; c++) {
            const zelle = N.zellen.get(
                c < 0 ? AnazhRealm.BLOCKER_RIESE : (ix0 + (c % nx)) * 2097152 + iz0 + Math.floor(c / nx)
            );
            if (!zelle) continue;
            for (let i = 0; i < zelle.length; i++) {
                const e = zelle[i];
                if (e._blockerFrage === frage) continue;
                e._blockerFrage = frage;
                if (!(e._blockerSeq > nachSeq)) continue;
                const h = e._blockerHuelle;
                if (h && (x < h[0] - reich || x > h[1] + reich || z < h[2] - reich || z > h[3] + reich)) continue;
                out.push(e);
            }
        }
        if (out.length - n0 > 1) out.sort(AnazhRealm._nachBestand);
        return out;
    }

    _blockerNetzLoesen(entry) {
        const N = this._blockerNetzStand;
        const gilt = !!N && entry._blockerZellenGen === N.gen;
        if (entry._blockerZellen) {
            if (gilt) this._blockerZellenAus(N.zellen, entry, entry._blockerZellen);
            entry._blockerZellen = null;
        }
        if (entry._blockerPlatz) {
            if (gilt) this._blockerZellenAus(N.plaetze, entry, entry._blockerPlatz);
            entry._blockerPlatz = null;
        }
        if (entry._blockerNamenListe) {
            if (gilt)
                for (const n of entry._blockerNamenListe) {
                    const menge = N.verzeichnis.get(n);
                    if (menge && menge.delete(entry)) N.verzeichnisListe.delete(n);
                }
            entry._blockerNamenListe = null;
        }
    }

    // Die Namen eines Eintrags im Verzeichnis: jeder wahre Schlüssel seiner Affordanzen, „rauch", wenn er einen Kamin trägt,
    // „glut", wenn er eine Brenn-Fläche trägt (`_glutFlaeche`; Leser: der Klang), und „licht", wenn er eine Leuchtquelle ist
    // (`_lichtDatum`; Leser: der Licht-Takt `_leuchtTakt`).
    _blockerNamen(entry) {
        const out = [];
        const a = entry.affordances;
        if (a && typeof a === "object") for (const k in a) if (a[k]) out.push(k);
        if ((entry.userData && entry.userData.rauchQuelle) || entry.chimney) out.push("rauch");
        if (this._glutFlaeche(entry) > 0) out.push("glut");
        if (this._lichtDatum(entry)) out.push("licht");
        return out;
    }

    // Die Einträge des Bestands, die `name` tragen, in seiner Ordnung — dieselbe Liste wie
    // `state.architectures.filter((e) => e.affordances && e.affordances[name])` (für „rauch": jeder Kamin). Die Liste lebt, bis
    // sich der Name regt; der Leser ändert sie nie.
    _blockerMit(name) {
        const N = this._blockerNetz();
        let liste = N.verzeichnisListe.get(name);
        if (!liste) {
            const menge = N.verzeichnis.get(name);
            liste = menge ? Array.from(menge) : [];
            if (liste.length > 1) liste.sort(AnazhRealm._nachBestand);
            N.verzeichnisListe.set(name, liste);
        }
        return liste;
    }

    // Das Tor-Gesetz eines Eintrags: reine porta-Zahlen (Dial-Satz p · membranUniforms mu ·
    // MEMBRAN_GESETZ), wenn der Bauplan eine gate-Gestalt trägt — via studioGestalt-Zeile (welt_portal →
    // geisttor) oder KIND_POLICY.gate.prefix (tor_drachentor → drachentor). EINE Quelle: porta-core
    // (main-seitig geladen, index.html); memoisiert je Gestalt. null ohne Tor/Kern (headless → Alt-Pfad).
    _torGesetzFor(entry) {
        if (!entry || typeof entry.type !== "string") return null;
        const core = typeof globalThis !== "undefined" ? globalThis.__portaCore : null;
        if (!core || !core.PRESETS || typeof core.membranUniforms !== "function") return null;
        let gestalt = null;
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        // Domänen-Wand: die studioGestalt-Zeile zählt nur für PORTAL-Blueprints — ein gleichnamiges Preset
        // einer anderen Domäne darf keinem Haus still eine Tor-Hülle geben. tor_* läuft über den Präfix.
        if (bp && typeof bp.studioGestalt === "string" && bp.role === "portal") gestalt = bp.studioGestalt;
        if (!gestalt) {
            const pol = AnazhRealm.KIND_POLICY.gate;
            if (pol && pol.prefix && entry.type.indexOf(pol.prefix) === 0) {
                gestalt = entry.type.slice(pol.prefix.length);
            }
        }
        const pre = gestalt ? core.PRESETS[gestalt] : null;
        if (!pre || pre.kind !== "gate") return null;
        if (!this._torGesetzMemo) this._torGesetzMemo = new Map();
        let g = this._torGesetzMemo.get(gestalt);
        if (!g) {
            const p = core.gateParams(pre);
            g = { gestalt, p, mu: core.membranUniforms(p), gesetz: core.MEMBRAN_GESETZ };
            // V18.491.87 — porta messen Host-Leser: Stich/Schub/Dicke/Streckung am Rezept (fail-soft).
            if (typeof core.messen === "function") {
                try {
                    g.messen = core.messen(p);
                } catch (_) {}
            }
            this._torGesetzMemo.set(gestalt, g);
        }
        return g;
    }

    // Das Fahrzeug-Gesetz eines Eintrags (Muster `_torGesetzFor`): reine vehicle-Zahlen (exportDrive:
    // sitz + huelle + Fahrwerte) aus dem SYNCHRON geladenen Kern (Lockstep-fest, nie der async Buch-
    // Stand), via studioGestalt-Zeile oder KIND_POLICY.vehicle.prefix. Domänen-Wand: pre.kind ===
    // "vehicle". Memoisiert je Gestalt; null ohne Fahrzeug/Kern (fail-closed → Donor-Pfad).
    _fahrzeugGesetzFor(entry) {
        if (!entry || typeof entry.type !== "string") return null;
        const core = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
        if (!core || !core.PRESETS || typeof core.exportDrive !== "function") return null;
        let gestalt = null;
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        if (bp && typeof bp.studioGestalt === "string") gestalt = bp.studioGestalt;
        if (!gestalt) {
            const pol = AnazhRealm.KIND_POLICY.vehicle;
            if (pol && pol.prefix && entry.type.indexOf(pol.prefix) === 0) {
                gestalt = entry.type.slice(pol.prefix.length);
            }
        }
        const pre = gestalt ? core.PRESETS[gestalt] : null;
        if (!pre || pre.kind !== "vehicle") return null;
        if (!this._fahrzeugGesetzMemo) this._fahrzeugGesetzMemo = new Map();
        let g = this._fahrzeugGesetzMemo.get(gestalt);
        if (!g) {
            // s+fx ist exakt der Brücken-Merge (phytogenesis fahrprofil-Münze) —
            // der Kern mergt DEFAULT_P+BASE_P intern davor: EINE Merge-Ordnung.
            const P = Object.assign({}, pre.s, pre.fx);
            g = { gestalt, drive: core.exportDrive(P) };
            // V18.491.88 — vehicle LEHREN/messen Host-Leser (fail-soft; exportDrive unverändert).
            if (typeof core.evalLehren === "function") {
                try {
                    g.lehren = core.evalLehren(P);
                } catch (_) {}
            }
            if (typeof core.messen === "function") {
                try {
                    g.messen = core.messen(P);
                } catch (_) {}
            }
            this._fahrzeugGesetzMemo.set(gestalt, g);
        }
        return g;
    }

    // Fahrzeug-Kollisions-Hülle aus exportDrive.huelle: Unterkörper (nose..tail × ±bw × yFloor..yBelt)
    // + Greenhouse (cowl..back × ±cw × yBelt..yRoof) + 4 Rad-Boxen an fAx/rAx — als PSEUDO-Parts durch
    // `_blockerComputePartAABB` (Skala + Gier gratis, kein zweiter Mathe-Pfad). null → Donor-Parts.
    _fahrzeugBlockerParts(entry) {
        const fzg = this._fahrzeugGesetzFor(entry);
        const h = fzg && fzg.drive ? fzg.drive.huelle : null;
        if (!h || !Number.isFinite(h.noseX) || !Number.isFinite(h.tailX)) return null;
        const teile = [
            {
                position: { x: (h.noseX + h.tailX) / 2, y: (h.yFloor + h.yBelt) / 2, z: 0 },
                size: { x: h.noseX - h.tailX, y: h.yBelt - h.yFloor, z: h.bw * 2 },
            },
            {
                position: { x: (h.cowlX + h.backX) / 2, y: (h.yBelt + h.yRoof) / 2, z: 0 },
                size: { x: Math.max(0.4, h.cowlX - h.backX), y: h.yRoof - h.yBelt, z: h.cw * 2 },
            },
        ];
        for (const ax of [h.fAx, h.rAx]) {
            for (const sz of [-1, 1]) {
                teile.push({
                    position: { x: ax, y: h.radR, z: (sz * h.spur) / 2 },
                    size: { x: h.radR * 2, y: h.radR * 2, z: 0.26 },
                });
            }
        }
        return teile;
    }

    // Fels-/Kristall-Hülle: JEDES Werk, das das Studio als Fels zeichnet (sein Preset ist ein Fels-Rezept mit gemessener
    // Hülle: die Streu-Formationen fels_var*/kristall_var*, Felsturm, Felsbogen, Steinblock, Kiesel, Felsbrocken, Geode …),
    // kollidiert mit der gemessenen Studio-Hülle (fx.huelle der Tafel, synchron via __terrainCore.PHYTO_PRESETS) statt mit
    // Substanz-Parts. Bis zur Leben-Schau 2 nur die *_var-Klasse: Felsbogen und Felsturm behielten ihre Spender-Parts (ein
    // Stein-Bogen 8,4 × 8 m, ein Eisen-Mast 4,4 × 16,8 m) — gezeichnet wird aber der Zacken des Studios, ohne Bogen.
    // Nur, wo das Studio zeichnet (ohne Foundry sind die Parts das Bild).
    _felsBlockerParts(entry) {
        if (!entry || typeof entry.type !== "string" || !this._foundryEnabled()) return null;
        const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
        const tab = tc && tc.PHYTO_PRESETS;
        if (!tab) return null;
        const preset = this._foundryPresetForEntry(entry);
        const rec = preset ? tab[preset] : null;
        if (!rec || rec.kind !== "rock") return null;
        // DIE HÜLLE SEINER GESTALT (Leben-Schau 2): das Studio zeichnet je Samen EINE von V Gestalten (`_foundryVariantFor`),
        // die Tafel trägt je Gestalt ihre gemessene Hülle [x0, x1, y1, z0, z1] im Vorlagen-Raum. V liest der Blocker aus dem
        // Kern (synchron am Spawn, Lockstep) — für die Fels-Arten dieselbe Zahl, die das Buch dem Bild gibt. Eine Fels-Art ohne
        // Zeile für ihre Gestalt ist ein Vertragsbruch (laut), nie ein stiller Rückfall auf die Spender-Parts.
        const H = rec.fx && rec.fx.huellen;
        const g = this._foundryVariantFor(entry.seed, preset, AnazhRealm._studioGestaltenKern(preset));
        const h = Array.isArray(H) && Number.isInteger(g) ? H[g - 1] : null;
        if (!Array.isArray(h) || h.length !== 5 || !h.every(Number.isFinite))
            return AnazhRealm._kernPflichtBruch("terrain:PHYTO_PRESETS." + preset + ".fx.huellen[" + g + "]");
        const [x0, x1, y1, z0, z1] = h;
        return [
            {
                position: { x: (x0 + x1) / 2, y: y1 / 2, z: (z0 + z1) / 2 },
                size: { x: x1 - x0, y: y1, z: z1 - z0 },
            },
        ];
    }

    // DER GEFÜHLTE BAUM DER GESTALT (K20): zeichnet das Studio einen Baum oder Strauch (Rezept-Art tree/shrub), wächst sein
    // gefühlter Leib aus DERSELBEN Gestalt wie das Bild — die Gestalt des Eintrags (`_foundryGestaltFor`, V synchron aus dem
    // Kern wie beim Fels), die Prägung des Orts samt Besteller (`_foundryGestaltOv`: der Solitär trägt FREISTAND), das
    // Skelett, wie der Worker es baut (`_growTreeBlueprintRich` mit `gestalt`, L0). Gemerkt je Art, Gestalt und Prägung (je
    // Art höchstens V+1 Gestalten). Rückgabe: die Teile · false = kein Studio-Baum (der Bauplan ist das Bild) · null = die
    // Gestalt wartet auf ihren Ort (`entry._huelleWartet`; `_foundryGestaltFor` setzt die Hülle, sobald sie steht).
    _baumGestaltTeile(entry) {
        if (!entry || typeof entry.type !== "string" || !this._foundryEnabled()) return false;
        const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
        const tab = tc && tc.PHYTO_PRESETS;
        if (!tab) return false;
        const preset = this._foundryPresetForEntry(entry);
        const rec = preset ? tab[preset] : null;
        if (!rec || (rec.kind !== "tree" && rec.kind !== "shrub")) return false;
        entry._huelleWartet = false; // die eigene Frage löst die Hülle nicht erneut aus
        entry._huelleG = null;
        const g = this._foundryGestaltFor(entry, preset, AnazhRealm._studioGestaltenKern(preset));
        if (!Number.isInteger(g)) {
            entry._huelleWartet = true;
            return null;
        }
        entry._huelleG = g;
        const ov = this._foundryGestaltOv(preset, g, entry.studioOv);
        const k = preset + "|" + g + "|" + (ov ? JSON.stringify(ov) : "");
        if (!this._baumGestaltMerk) this._baumGestaltMerk = new Map();
        let teile = this._baumGestaltMerk.get(k);
        if (teile === undefined) {
            // der Welt-Name, unter dem die Art ihre Rezept-Zeile trägt (wie `_foundryPresetForEntry` sie fand)
            const art = [entry._lodSpecies, entry.type, (entry.type.match(/^grown_(baum_[a-z]+)/) || [])[1]].find(
                (s) => typeof s === "string" && this._foundryPresetFor(s) === preset
            );
            teile = art ? this._growTreeBlueprintRich(art, null, { lod: 0, gestalt: { g, ov } }) : null;
            this._lastTreeSkeleton = null;
            if (!Array.isArray(teile) || !teile.length)
                return AnazhRealm._kernPflichtBruch("terrain:skelettDerGestalt(" + k + ")");
            this._baumGestaltMerk.set(k, teile);
        }
        return teile;
    }

    // Tor-Kollisions-Hülle aus dem Gesetz: Pfosten (beidseitig, jambW·Ordnungen) + Bogen-Schultern
    // (über der Kämpferlinie, mittig frei) + Krone — als PSEUDO-Parts durch `_blockerComputePartAABB`.
    // Die Öffnung (Spannweite 2·M bis zur Bogenkurve) bleibt FREI: man geht hindurch.
    _torBlockerAABBs(entry) {
        const tor = this._torGesetzFor(entry);
        if (!tor) return null;
        const mu = tor.mu;
        if (!mu || !Number.isFinite(mu.apexY)) return null;
        // DIE MASSE AUS DEM BILD (Leben-Schau 2, gate:kollision-bild): Pfosten-Außenkante, Tiefe und Krone der gezeichneten
        // Gestalt trägt das Gesetzbuch als gemintete Daten (`__portaCore.TOR_HUELLE`, je Seite [pfostenX, pfostenZ, obenX,
        // obenZ] + Oberkante, gemessen an buildInstance LOD 0 — gate:porta-contract hält die Mint-Treue) — die Öffnung (±rimAx
        // bis zur Bogenkurve) und die Schultern bleiben das Gesetz. Bis dahin schätzte der Wirt sie aus dem Gesetz (der
        // Drachentor-Pfosten stand 0,57 m neben seinem Bild, die Ruine 0,99 m innerhalb), danach baute er die Gestalt beim
        // ersten Spawn jeder Gestalt synchron auf dem Haupt-Thread nach (Gegenprüfung 10.10.: 15–50 ms je Gestalt, 231–244 ms
        // für die sieben, am Genesis-Ring, an jedem Restore mit Toren, am ersten Setzen in der Werkstatt). Jetzt eine Lesung.
        const hm = AnazhRealm.Gesetz("porta:TOR_HUELLE." + tor.gestalt, null);
        const zeileOk = (z) => Array.isArray(z) && z.length === 4 && z.every(Number.isFinite);
        if (!hm || !Array.isArray(hm.seiten) || !hm.seiten.every(zeileOk) || !Number.isFinite(hm.oberkante))
            return AnazhRealm._kernPflichtBruch("porta:TOR_HUELLE." + tor.gestalt);
        const rise = Math.max(0.05, mu.apexY - mu.springY);
        const schulterB = mu.rimAx * 0.45;
        const schulterY0 = mu.springY + rise * 0.3;
        const box = (x0, x1, y0, y1, hz) =>
            x1 - x0 > 0.02 && y1 - y0 > 0.02 && hz > 0.01
                ? {
                      position: { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: 0 },
                      size: { x: x1 - x0, y: y1 - y0, z: 2 * hz },
                  }
                : null;
        const pseudo = [];
        [-1, 1].forEach((sx, k) => {
            const [pfostenX, pfostenZ, obenX, obenZ] = hm.seiten[k];
            const spiegel = (b) =>
                b ? Object.assign(b, { position: Object.assign(b.position, { x: sx * b.position.x }) }) : null;
            // Pfosten — von der Öffnungskante (rimAx) bis zur gezeichneten Außenkante, bis zur Kämpferlinie
            pseudo.push(spiegel(box(mu.rimAx, pfostenX, 0, mu.springY, pfostenZ)));
            // über der Kämpferlinie bis zum Scheitel: der Rahmen bis zur Außenkante oben, die Schulter über der Öffnung
            pseudo.push(spiegel(box(mu.rimAx, obenX, mu.springY, mu.apexY, obenZ)));
            pseudo.push(spiegel(box(mu.rimAx - schulterB, mu.rimAx, schulterY0, mu.apexY, obenZ)));
            // die Krone über dem Scheitel bis zur gezeichneten Oberkante, die Hälfte dieser Seite
            pseudo.push(spiegel(box(0, obenX, mu.apexY, hm.oberkante, obenZ)));
        });
        const boxes = [];
        for (const part of pseudo) {
            const aabb = this._blockerComputePartAABB(entry, part);
            if (aabb) boxes.push(aabb);
        }
        return boxes;
    }

    // Nächstes Fluss-Segment an (x,z), wenn der Punkt im Kanal liegt (dist ≤ halbe Breite + Tiefe / bankNeigung, die
    // Krone der Bank — jenseits der Krone trägt der Fluss kein Wasser). Liefert Flow-Richtung (normiert), Bett-Tiefe
    // `depth` und centerness des nächsten Segments, dazu die Wasser-Oberfläche `surfaceY`: der Spiegel der Segmente
    // (`_hydroRiverSpiegel`, linear zwischen ihren Enden — stromab nie steigend, quer waagrecht), gemittelt mit einem
    // Gewicht, das zur Krone stetig auf 0 fällt — ein breiter Fluss überdeckt in der Biegung mehrere Segmente, das
    // nächste allein gäbe dort eine Stufe. O(1) über `riverBuckets`. Worker bit-identisch (speist die Zellen).
    _hydroRiverAt(x, z) {
        const h = this._hydroFor(x, z); // A3 (V18.132): Heimat ODER Kachel
        if (!h || !h.ready || !h.riverBuckets) return null;
        const bs = h.bucketSize;
        const bd = h.bucketsDim;
        const bi = Math.floor((x - h.originX) / bs);
        const bj = Math.floor((z - h.originZ) / bs);
        if (bi < 0 || bj < 0 || bi >= bd || bj >= bd) return null;
        const list = h.riverBuckets[bj * bd + bi];
        if (!list) return null;
        const HC = AnazhRealm.HYDROSPHERE;
        let bestD = Infinity;
        let dirX = 0;
        let dirZ = 0;
        let depth = 0;
        let bestHalfW = 1;
        let gSumme = 0;
        let sSumme = 0;
        let ufer = 0;
        for (let s = 0; s < list.length; s++) {
            const seg = list[s];
            const ex = seg.bx - seg.ax;
            const ez = seg.bz - seg.az;
            const len2 = ex * ex + ez * ez || 1;
            let t = ((x - seg.ax) * ex + (z - seg.az) * ez) / len2;
            if (t < 0) t = 0;
            else if (t > 1) t = 1;
            const px = seg.ax + ex * t;
            const pz = seg.az + ez * t;
            const dist = Math.hypot(x - px, z - pz);
            const halfW = seg.hwA + (seg.hwB - seg.hwA) * t;
            const D = seg.dA + (seg.dB - seg.dA) * t;
            const krone = halfW + D / HC.bankNeigung;
            if (dist > krone) continue;
            const g = (1 - dist / krone) * (1 - dist / krone) + 1e-6;
            gSumme += g;
            sSumme += g * (seg.sA + (seg.sB - seg.sA) * t);
            // Die Kronen-Blende: 1 bis zur Kanal-Kante, smoothstep auf 0 an der Krone (das Maximum der Segmente).
            const u = dist <= halfW ? 0 : (dist - halfW) / (krone - halfW);
            const uS = 1 - u * u * (3 - 2 * u);
            if (uS > ufer) ufer = uS;
            if (dist < bestD) {
                bestD = dist;
                const len = Math.sqrt(len2);
                dirX = ex / len;
                dirZ = ez / len;
                depth = D;
                bestHalfW = halfW;
            }
        }
        if (bestD === Infinity) return null;
        return {
            flowX: dirX,
            flowZ: dirZ,
            depth,
            surfaceY: sSumme / gSumme,
            // Zentrums-Nähe [0..1] (1 Mittellinie, 0 Kanal-Kante): die Strömung trägt nur im Kanal.
            centerness: Math.max(0, 1 - bestD / Math.max(bestHalfW, 1)),
            // Die Kronen-Blende [0..1]: die Ufer-Bänder (Strand, Schlick, Pfad, Höhen-Feuchte) über diesem Spiegel
            // laufen mit ihr zur Krone aus — dort endet der Spiegel, der Bezug springt auf den Meeresspiegel.
            ufer,
        };
    }

    // DER SPIEGEL QUER (Gegenprüfung 07.10., Runde 3): der Spiegel des nächsten Fluss-Segments an (x, z), auch jenseits der
    // Krone — der Fluss-Spiegel liegt quer waagrecht (`_hydroRiverSpiegel`). Nur das Wasser-Sheet liest ihn, für Rand-Vertices
    // jenseits der Krone (dort taucht das Sheet unter den Boden; das Mittel oder ein Extrem der Nachbar-Dächer setzte das Ende
    // eines steilen Laufs zu tief oder zu hoch). −Infinity ohne Segment im Bucket. Worker bit-identisch (`hydroSpiegelQuer`).
    _hydroSpiegelQuer(x, z) {
        const h = this._hydroFor(x, z);
        if (!h || !h.ready || !h.riverBuckets) return -Infinity;
        const bs = h.bucketSize;
        const bd = h.bucketsDim;
        const bi = Math.floor((x - h.originX) / bs);
        const bj = Math.floor((z - h.originZ) / bs);
        if (bi < 0 || bj < 0 || bi >= bd || bj >= bd) return -Infinity;
        const list = h.riverBuckets[bj * bd + bi];
        if (!list) return -Infinity;
        let bestD = Infinity;
        let spiegel = -Infinity;
        for (let s = 0; s < list.length; s++) {
            const seg = list[s];
            const ex = seg.bx - seg.ax;
            const ez = seg.bz - seg.az;
            const len2 = ex * ex + ez * ez || 1;
            let t = ((x - seg.ax) * ex + (z - seg.az) * ez) / len2;
            if (t < 0) t = 0;
            else if (t > 1) t = 1;
            const dist = Math.hypot(x - (seg.ax + ex * t), z - (seg.az + ez * t));
            if (dist < bestD) {
                bestD = dist;
                spiegel = seg.sA + (seg.sB - seg.sA) * t;
            }
        }
        return spiegel;
    }

    // Phase 1 — Surface-Sampling: Region-Raster mit `_terrainMacroSurfaceY` OHNE Detail-Oktave
    // (`includeDetail=false`): die aliast bei 16-m-Abtastung (±4 m, λ~22 m) und übertrifft das Makro-
    // Gefälle je Zelle — die Drainage folgte dem Rauschen. Keine 3D-Roughness/Höhlen; 3 Noise-Calls je
    // Zelle. `state.hydrosphere` ist während des Baus null (kein Carve-Zirkel).
    _hydroInit(origin = null) {
        const H = AnazhRealm.HYDROSPHERE;
        const base = this.state.terrainBaseHeight || 0;
        let waterLevel = this.state.waterLevel;
        if (typeof waterLevel !== "number" || !Number.isFinite(waterLevel)) {
            waterLevel = base - globalThis.__gelaendeCore.GRUND.meerUnterBasis;
        }
        const size = H.regionSize;
        const cell = H.cell;
        const dim = Math.max(8, Math.round(size / cell));
        // A3 (V18.132) — parametrisierter Ursprung: ohne `origin` die Heimat-
        // Region (bit-identisch zu immer); mit `origin` eine ferne KACHEL
        // (seed-deterministisch — f(seed, Kachel-Koordinate), nie Spieler-Pfad).
        const originX = origin && Number.isFinite(origin.x) ? origin.x : -size / 2;
        const originZ = origin && Number.isFinite(origin.z) ? origin.z : -size / 2;
        const n = dim * dim;
        const raw = new Float64Array(n);
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const s = this._terrainMacroSurfaceY(originX + (i + 0.5) * cell, originZ + (j + 0.5) * cell, false);
                raw[j * dim + i] = Number.isFinite(s) ? s : base - 52;
            }
        }
        const surf = this._hydroBlur(raw, dim);
        return {
            base,
            waterLevel,
            size,
            cell,
            dim,
            originX,
            originZ,
            surf,
            isOcean: null,
            filled: null,
            lakeOf: null,
        };
    }

    // 3×3-Box-Blur übers Höhen-Raster (Rand-clamp; Ränder sind ohnehin Priority-Flood-Auslässe) —
    // Schutz gegen Aliasing-Reste der ridged-Oktave.
    _hydroBlur(src, dim) {
        const out = new Float64Array(dim * dim);
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                let sum = 0;
                let cnt = 0;
                for (let dj = -1; dj <= 1; dj++) {
                    for (let di = -1; di <= 1; di++) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                        sum += src[ni + nj * dim];
                        cnt++;
                    }
                }
                out[i + j * dim] = sum / cnt;
            }
        }
        return out;
    }

    // Phase 1.5 — Ozean-Maske: Ozean = die mit dem Region-RAND verbundene Komponente der Zellen unter
    // Meeresspiegel; eine Binnen-Mulde darunter ist ein abflussloses Becken (See). Sonst wäre jede
    // Senke ein Auslass und der Abfluss versickerte, statt sich zu Flüssen zu sammeln.
    _hydroMarkOcean(ctx) {
        const { dim, surf, waterLevel } = ctx;
        const n = dim * dim;
        const isOcean = new Uint8Array(n);
        const stack = [];
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const border = i === 0 || j === 0 || i === dim - 1 || j === dim - 1;
                if (!border) continue;
                const idx = i + j * dim;
                if (surf[idx] <= waterLevel && !isOcean[idx]) {
                    isOcean[idx] = 1;
                    stack.push(idx);
                }
            }
        }
        const NB = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];
        while (stack.length) {
            const c = stack.pop();
            const ci = c % dim;
            const cj = (c / dim) | 0;
            for (let k = 0; k < 8; k++) {
                const ni = ci + NB[k][0];
                const nj = cj + NB[k][1];
                if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                const nidx = ni + nj * dim;
                if (!isOcean[nidx] && surf[nidx] <= waterLevel) {
                    isOcean[nidx] = 1;
                    stack.push(nidx);
                }
            }
        }
        ctx.isOcean = isOcean;
    }

    // Phase 2 — Depression-Filling (Priority-Flood + ε, Barnes et al. 2014): Min-Heap mit Rand- +
    // Ozean-Zellen seeden, tiefste poppen, Nachbarn auf max(Höhe, Pop-Füllhöhe + ε) füllen. ε gibt jeder
    // Zelle Gefälle (D8 auch auf See-Flächen) und einen echt-tieferen Nachbarn. filled > surf = Seen.
    _hydroPriorityFlood(ctx) {
        const { dim, surf, isOcean, waterLevel } = ctx;
        const EPS = AnazhRealm.HYDROSPHERE.fillEpsilon;
        const n = dim * dim;
        const filled = new Float64Array(n);
        const visited = new Uint8Array(n);
        // Binärer Min-Heap in parallelen Arrays (Priorität + Zell-Index). Gleichstand nach Index →
        // deterministischer Pop (sonst hinge filled an der Heap-Reihenfolge).
        const hp = [];
        const hv = [];
        const less = (a, b) => hp[a] < hp[b] || (hp[a] === hp[b] && hv[a] < hv[b]);
        const swap = (a, b) => {
            const tp = hp[a];
            hp[a] = hp[b];
            hp[b] = tp;
            const tv = hv[a];
            hv[a] = hv[b];
            hv[b] = tv;
        };
        const push = (p, v) => {
            hp.push(p);
            hv.push(v);
            let c = hp.length - 1;
            while (c > 0) {
                const par = (c - 1) >> 1;
                if (!less(c, par)) break;
                swap(c, par);
                c = par;
            }
        };
        const pop = () => {
            const top = hv[0];
            const lastP = hp.pop();
            const lastV = hv.pop();
            if (hp.length) {
                hp[0] = lastP;
                hv[0] = lastV;
                let c = 0;
                for (;;) {
                    const l = c * 2 + 1;
                    const r = l + 1;
                    let s = c;
                    if (l < hp.length && less(l, s)) s = l;
                    if (r < hp.length && less(r, s)) s = r;
                    if (s === c) break;
                    swap(s, c);
                    c = s;
                }
            }
            return top;
        };
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const idx = i + j * dim;
                const border = i === 0 || j === 0 || i === dim - 1 || j === dim - 1;
                const sea = isOcean[idx] === 1;
                if (border || sea) {
                    // Ozean-Zellen werden auf den flachen Meeresspiegel
                    // geseedet; eine Rand-Land-Zelle auf ihre echte Höhe.
                    filled[idx] = sea ? waterLevel : surf[idx];
                    visited[idx] = 1;
                    push(filled[idx], idx);
                }
            }
        }
        const NB = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];
        while (hp.length) {
            const c = pop();
            const ci = c % dim;
            const cj = (c / dim) | 0;
            for (let k = 0; k < 8; k++) {
                const ni = ci + NB[k][0];
                const nj = cj + NB[k][1];
                if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                const nidx = ni + nj * dim;
                if (visited[nidx]) continue;
                filled[nidx] = Math.max(surf[nidx], filled[c] + EPS);
                visited[nidx] = 1;
                push(filled[nidx], nidx);
            }
        }
        ctx.filled = filled;
    }

    // Phase 5a — Seen: Komponenten der aufgefüllten Zellen (filled > surf, über Meereshöhe). Je See:
    // Füll-Level (≈ Überlauf-Höhe), Boden, Rand-Höhe, Bounding-Box, Zell-Indizes (für die See-Plane).
    _hydroExtractLakes(ctx) {
        const { dim, surf, filled, isOcean } = ctx;
        const n = dim * dim;
        const TOL = 0.02;
        const lakeOf = new Int32Array(n).fill(-1);
        const lakes = [];
        // ein See ist eine aufgefüllte Zelle (filled > surf), die NICHT
        // Ozean ist — ein abflussloses Becken, das das Priority-Flood füllte
        // (auch eines unter Meereshöhe — wie das Tote Meer).
        const isLakeCell = (idx) => !isOcean[idx] && filled[idx] > surf[idx] + TOL;
        const NB = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];
        for (let start = 0; start < n; start++) {
            if (lakeOf[start] >= 0 || !isLakeCell(start)) continue;
            const id = lakes.length;
            const cells = [];
            const stack = [start];
            lakeOf[start] = id;
            let floorY = Infinity;
            let level = Infinity;
            let minX = Infinity;
            let minZ = Infinity;
            let maxX = -Infinity;
            let maxZ = -Infinity;
            while (stack.length) {
                const c = stack.pop();
                cells.push(c);
                if (surf[c] < floorY) floorY = surf[c];
                if (filled[c] < level) level = filled[c];
                const ci = c % dim;
                const cj = (c / dim) | 0;
                const wx = ctx.originX + (ci + 0.5) * ctx.cell;
                const wz = ctx.originZ + (cj + 0.5) * ctx.cell;
                if (wx < minX) minX = wx;
                if (wx > maxX) maxX = wx;
                if (wz < minZ) minZ = wz;
                if (wz > maxZ) maxZ = wz;
                for (let k = 0; k < 8; k++) {
                    const ni = ci + NB[k][0];
                    const nj = cj + NB[k][1];
                    if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                    const nidx = ni + nj * dim;
                    if (lakeOf[nidx] < 0 && isLakeCell(nidx)) {
                        lakeOf[nidx] = id;
                        stack.push(nidx);
                    }
                }
            }
            // Mikro-Senken (< minLakeCells) sind keine Seen: gefüllt bleibt die Drainage korrekt, aber sie
            // werden nicht gelistet + lakeOf zurückgesetzt (Fluss darf hindurch) — sonst hunderte Geister-Seen.
            if (cells.length < AnazhRealm.HYDROSPHERE.minLakeCells) {
                for (let ci2 = 0; ci2 < cells.length; ci2++) lakeOf[cells[ci2]] = -1;
                continue;
            }
            // Rand-Höhe: kleinste Füllhöhe der Nicht-See-Nachbarn ringsum.
            // Der See füllt bis zu seinem Überlauf — level ≈ rimY.
            let rimY = Infinity;
            for (let ci2 = 0; ci2 < cells.length; ci2++) {
                const c = cells[ci2];
                const ci = c % dim;
                const cj = (c / dim) | 0;
                for (let k = 0; k < 8; k++) {
                    const ni = ci + NB[k][0];
                    const nj = cj + NB[k][1];
                    if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                    const nidx = ni + nj * dim;
                    // nur der Nicht-See-, Nicht-Ozean-Rand zählt — der
                    // Überlauf läuft über Land zum Abfluss, nicht in den Ozean.
                    if (lakeOf[nidx] !== id && !isOcean[nidx] && filled[nidx] < rimY) {
                        rimY = filled[nidx];
                    }
                }
            }
            lakes.push({
                id,
                level,
                floorY,
                rimY: Number.isFinite(rimY) ? rimY : level,
                cells,
                bbox: { minX, minZ, maxX, maxZ },
            });
        }
        ctx.lakeOf = lakeOf;
        return lakes;
    }

    // Phase 5b — DIE FLÜSSE SIND DAS NETZ DES GESETZES (K16): die Läufe der Ebenen 0 und 1 aus gelaende-core
    // (`flussLaeufe`) — dasselbe Netz, das die Täler schneidet; die Hydrosphäre rechnet kein zweites (bis K16 eine D8-
    // Akkumulation auf der geglätteten Makro-Fläche: ihr Kanal fräste den gebauten Boden quer durch Hänge und Ebenen, 3,94
    // Senken > 1 m je km² und 1 Dorfplatz gegen 0,26 und 6 ohne ihn). Je Glied die Punkte seiner BAHN (der Mäander des
    // Gesetzes, `bahn`: Abstand ≤ Zelle auf dem Bogen; ein geteilter Unterlauf trägt dieselben Punkte); `y` die Sohle des
    // Gesetzes am Ort der Sehne (stromab streng fallend), die Richtung die der Bahn, die Breite aus dem Einzugsgebiet (Kern
    // `flussBreite`), an der Quelle das Rinnsal (W-F5: quellBett + quellWeitung je Meter Bogen). Ein Lauf endet am Meer, am
    // See (`mouth` "see", `seeY` sein Spiegel), als Zufluss auf der Bahn seines Hauptlaufs ("zufluss") oder am Rand der Kachel.
    _hydroNetzFluesse(ctx) {
        const { dim, cell, originX, originZ, size, filled, lakeOf, isOcean } = ctx;
        const HC = AnazhRealm.HYDROSPHERE;
        const G = globalThis.__gelaendeCore;
        const laeufe = G.flussLaeufe(this._gelaende(), originX, originZ, originX + size, originZ + size, cell);
        const zelle = (x, z) => {
            const i = Math.floor((x - originX) / cell);
            const j = Math.floor((z - originZ) / cell);
            return i >= 0 && j >= 0 && i < dim && j < dim ? i + j * dim : -1;
        };
        const rivers = [];
        for (const lf of laeufe) {
            let lauf = lf.quelle ? 0 : Infinity;
            let points = [];
            let mouth = null;
            let seeY = NaN;
            const abschluss = (m) => {
                if (points.length >= 2) {
                    const rv = { points, mouth: m };
                    if (m === "see" && Number.isFinite(seeY)) rv.seeY = seeY;
                    if (lf.term) rv.term = lf.term; // der Lauf eines Terms (die Klamm `rinne`): Gesetz des Erbguts, kein Wurf des Feldes
                    rivers.push(rv);
                }
                points = [];
            };
            for (let g = 0; g < lf.glieder.length && !mouth; g++) {
                const gl = lf.glieder[g];
                const B = gl.bahn;
                const voll = G.flussBreite(gl.A);
                const bis = g === lf.glieder.length - 1 ? B.length : B.length - 1;
                for (let m = 0; m < bis; m++) {
                    const { t, x, z } = B[m];
                    const idx = zelle(x, z);
                    if (idx < 0) {
                        abschluss("border");
                        continue;
                    }
                    if (isOcean[idx]) {
                        mouth = "sea";
                        break;
                    }
                    if (lakeOf[idx] >= 0) {
                        mouth = "see";
                        seeY = filled[idx];
                        break;
                    }
                    const s = lauf + B[m].s;
                    const quelle = Math.min(1, (HC.quellBett + HC.quellWeitung * s) / voll);
                    points.push({
                        x,
                        z,
                        y: gl.ba + (gl.bb - gl.ba) * t,
                        width: voll * quelle,
                        quelle,
                        flowX: B[m].fx,
                        flowZ: B[m].fz,
                        inLake: false,
                    });
                }
                lauf += B[B.length - 1].s;
            }
            const ende = { meer: "sea", see: "see", muendung: "zufluss" };
            abschluss(mouth || ende[lf.ende] || "border");
        }
        return rivers;
    }

    // Phase 5c-Vorbereitung: jeder Fluss-Punkt bekommt `voxelY` = `_voxelSurfaceY` an seiner Position.
    // Geroutet wird auf der glatten Makro-Surface, gerendert + nach Wasserfällen gesucht auf der
    // echten; `state.hydrosphere` ist noch null → un-gecarvte Surface (kein Zirkel).
    _hydroSampleRiverSurfaces(rivers) {
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            for (let k = 0; k < pts.length; k++) {
                const p = pts[k];
                if (p.inLake) {
                    // V9.46 — im See ist die Wasser-Oberfläche der Füllstand
                    // (`p.y`), NICHT die gecarvte Bett-Surface — sonst meldete
                    // der Wasserfall-Scan einen Sturz am flachen See-Boden.
                    p.voxelY = p.y;
                    continue;
                }
                const v = this._voxelSurfaceY(p.x, p.z);
                p.voxelY = Number.isFinite(v) ? v : p.y;
            }
        }
    }

    // DER FLUSS-SPIEGEL (Welle L, Q7-Gestalt, W-F1/F2/F3): je Fluss-Punkt der Spiegel `S` — stromab nie steigend,
    // quer waagrecht; das Bett folgt ihm (`_hydrosphereCarveAt`). Ziel je Punkt: das tiefste Ufer seines Querschnitts
    // (die ungecarvte Voxel-Fläche in der Mitte und an beiden Kanal-Kanten, halbe Breite + Bank-Rampe) minus dem
    // Freibord-Anteil der Bett-Tiefe; die Folge ist die monotone Ausgleichs-Kurve (PAVA, kleinste Quadrate) je Reach
    // zwischen zwei Seen — der Kanal schneidet Buckel und überbrückt Senken, beides so wenig wie möglich. Ein Reach endet
    // nie unter dem See, in den er mündet (oder dem Meer), und beginnt nie über dem See, aus dem er kommt. Geteilte
    // Unterläufe (zwei Quellen, ein Fluss) tragen EIN S: die längsten Flüsse zuerst, ein Zufluss endet am Spiegel seiner
    // Mündung. Bis V18.531 war der Spiegel die Makro-Höhe des Orts plus ein Buckel (14,3 % der Lauf-Schritte stiegen,
    // der Querschnitt wölbte sich 1,55 m). Läuft im Bau (`_hydroComputing`: die Ufer sind ungecarvt).
    _hydroRiverSpiegel(ctx, rivers) {
        const HC = AnazhRealm.HYDROSPHERE;
        const schluessel = (p) => p.x + "," + p.z;
        const S = new Map();
        const ziel = (p) => {
            const D = AnazhRealm._flussTiefe(p);
            const rand = p.width * 0.5 + D / HC.bankNeigung;
            let tief = Number.isFinite(p.voxelY) ? p.voxelY : p.y;
            for (let sg = -1; sg <= 1; sg += 2) {
                const v = this._voxelSurfaceY(p.x - p.flowZ * rand * sg, p.z + p.flowX * rand * sg);
                if (Number.isFinite(v) && v < tief) tief = v;
            }
            return tief - HC.spiegelFreibord * D;
        };
        // PAVA (pool adjacent violators): benachbarte Verletzer verschmelzen zu ihrem Mittel, bis die Folge nicht steigt.
        const pava = (t) => {
            const summe = [];
            const zahl = [];
            for (let i = 0; i < t.length; i++) {
                summe.push(t[i]);
                zahl.push(1);
                let n = summe.length;
                while (n > 1 && summe[n - 2] / zahl[n - 2] < summe[n - 1] / zahl[n - 1]) {
                    summe[n - 2] += summe[n - 1];
                    zahl[n - 2] += zahl[n - 1];
                    summe.pop();
                    zahl.pop();
                    n--;
                }
            }
            const aus = [];
            for (let b = 0; b < summe.length; b++) for (let i = 0; i < zahl[b]; i++) aus.push(summe[b] / zahl[b]);
            return aus;
        };
        const reihe = rivers.slice().sort((a, b) => b.points.length - a.points.length);
        // (1) die Ausgleichs-Kurve je Reach, mit den Schranken der Seen und der Mündung.
        const reaches = [];
        const deckel = new Map();
        for (const rv of reihe) {
            const P = rv.points;
            let k = 0;
            while (k < P.length) {
                if (P[k].inLake || S.has(schluessel(P[k]))) {
                    k++;
                    continue;
                }
                let e = k;
                while (e < P.length && !P[e].inLake && !S.has(schluessel(P[e]))) e++;
                const t = [];
                for (let i = k; i < e; i++) {
                    const p = P[i];
                    t.push(ziel(p));
                    // Die HEBUNG ist gedeckelt: der Kanal überbrückt eine Senke höchstens um eine Bett-Tiefe über ihrem
                    // Grund — tiefer (eine Schlucht) fällt der Fluss hinein und schneidet stromab.
                    const D = AnazhRealm._flussTiefe(p);
                    const mitte = Number.isFinite(p.voxelY) ? p.voxelY : p.y;
                    deckel.set(schluessel(p), mitte + (1 - HC.spiegelFreibord) * D);
                }
                const f = pava(t);
                for (let i = k; i < e; i++) S.set(schluessel(P[i]), f[i - k]);
                reaches.push({ rv, k, e });
                k = e;
            }
        }
        // (2) der Deckel, dann stromab nie steigend: in Fluss-Reihenfolge (die Füllhöhe y fällt entlang des Flusses
        // strikt) gibt jeder Punkt sein Minimum an den nächsten weiter — über Zusammenflüsse, nie in einen See.
        const naechster = new Map();
        const punkte = new Map();
        for (const rv of rivers) {
            const P = rv.points;
            for (let i = 0; i < P.length; i++) {
                if (P[i].inLake) continue;
                punkte.set(schluessel(P[i]), P[i]);
                if (i + 1 < P.length && !P[i + 1].inLake) naechster.set(schluessel(P[i]), schluessel(P[i + 1]));
            }
        }
        for (const [key, d] of deckel) if (S.get(key) > d) S.set(key, d);
        const nachHoehe = [...punkte.keys()].sort((a, b) => punkte.get(b).y - punkte.get(a).y);
        for (const key of nachHoehe) {
            const n = naechster.get(key);
            if (n !== undefined && S.get(n) > S.get(key)) S.set(n, S.get(key));
        }
        // (3) die Schranken: nie unter dem See, in den der Reach mündet (oder dem Meer), nie über dem See, aus dem er
        // kommt (eine Konstante wahrt die Monotonie).
        for (const { rv, k, e } of reaches) {
            const P = rv.points;
            const oben = k > 0 && P[k - 1].inLake ? P[k - 1].y : Infinity;
            let unten = -Infinity;
            if (e < P.length) unten = P[e].inLake ? P[e].y : S.get(schluessel(P[e]));
            else if (rv.mouth === "sea") unten = ctx.waterLevel;
            else if (rv.mouth === "see" && Number.isFinite(rv.seeY)) unten = rv.seeY;
            for (let i = k; i < e; i++) {
                const key = schluessel(P[i]);
                S.set(key, Math.min(oben, Math.max(unten, S.get(key))));
            }
            // Der Abfluss beginnt bündig mit seinem See (sonst schnitte der Kanal den Becken-Rand auf den tieferen Lauf
            // und das See-Wasser stünde als Wand darüber); die Stufe liegt im ersten Segment.
            if (Number.isFinite(oben)) S.set(schluessel(P[k]), oben);
        }
        // (4) DIE FRÄSE DES BREITEREN (K16, W-F5): die Ufer eines Zuflusses liest `ziel` ungefräst — liegt er im Kanal oder
        // auf der Böschung eines BREITEREN Flusses, schneidet dessen Fräse den Boden unter ihn, und sein Wasser stand darüber
        // (am Ursprung 0,5–2,9 m tief statt des Rinnsals; im Kanal des Stamms hob es dessen Spiegel bis 0,71 m). Je Segment
        // des breiteren (die breitesten zuerst — ihr Spiegel steht dann fest) trägt jeder schmalere Punkt eines anderen Laufs
        // in seiner Reichweite höchstens die Kanal-Fläche des Segments (die Gestalt von `_hydrosphereCarveAt`) minus seinem
        // Freibord, nie weniger als den Spiegel des breiteren. Danach wieder stromab nie steigend.
        {
            const sN = HC.bankNeigung;
            const sK = HC.bankKruemmung;
            const fuss = HC.bankRundung;
            const zelle = (x, z) =>
                Math.round((x - ctx.originX) / ctx.cell - 0.5) + "," + Math.round((z - ctx.originZ) / ctx.cell - 0.5);
            const raster = new Map();
            for (const [key, p] of punkte) {
                const zk = zelle(p.x, p.z);
                if (!raster.has(zk)) raster.set(zk, []);
                raster.get(zk).push(key);
            }
            const stromab = (kp, kz, n) => {
                for (let k = naechster.get(kp), g = 0; k !== undefined && g < n; k = naechster.get(k), g++)
                    if (k === kz) return true;
                return false;
            };
            const segmente = [...naechster.entries()].sort(
                (a, b) => (punkte.get(b[0]).width || 0) - (punkte.get(a[0]).width || 0)
            );
            let gekappt = false;
            for (const [ka, kb] of segmente) {
                const a = punkte.get(ka);
                const b = punkte.get(kb);
                if (!b) continue;
                const hwA = a.width * 0.5;
                const hwB = b.width * 0.5;
                const dA = AnazhRealm._flussTiefe(a);
                const dB = AnazhRealm._flussTiefe(b);
                const weit = Math.max(hwA + dA / sN, hwB + dB / sN) + HC.dammBreite + HC.bankWeite;
                const nZ = Math.ceil(weit / ctx.cell) + 1;
                const ia = Math.round((a.x - ctx.originX) / ctx.cell - 0.5);
                const ja = Math.round((a.z - ctx.originZ) / ctx.cell - 0.5);
                const ex = b.x - a.x;
                const ez = b.z - a.z;
                const len2 = ex * ex + ez * ez || 1;
                for (let dj = -nZ; dj <= nZ; dj++)
                    for (let di = -nZ; di <= nZ; di++) {
                        const liste = raster.get(ia + di + "," + (ja + dj));
                        if (!liste) continue;
                        for (const kp of liste) {
                            if (kp === ka || kp === kb) continue;
                            const p = punkte.get(kp);
                            let t = ((p.x - a.x) * ex + (p.z - a.z) * ez) / len2;
                            t = t < 0 ? 0 : t > 1 ? 1 : t;
                            const halfW = hwA + (hwB - hwA) * t;
                            if (!(p.width * 0.5 < halfW)) continue;
                            const D = dA + (dB - dA) * t;
                            const dK = halfW + D / sN;
                            const dist = Math.hypot(p.x - (a.x + ex * t), p.z - (a.z + ez * t));
                            if (dist >= dK + HC.dammBreite + HC.bankWeite) continue;
                            const spiegel = S.get(ka) + (S.get(kb) - S.get(ka)) * t;
                            if (!(S.get(kp) > spiegel)) continue;
                            if (stromab(kp, ka, nZ + 2)) continue; // der eigene Lauf mündet hier
                            const B = spiegel - (1 - HC.spiegelFreibord) * D;
                            const u0 = dist - halfW;
                            let flaeche =
                                u0 <= -fuss
                                    ? B
                                    : u0 < fuss
                                      ? B + (sN * (u0 + fuss) * (u0 + fuss)) / (4 * fuss)
                                      : B + sN * u0;
                            if (dist > dK) flaeche += sK * (dist - dK) * (dist - dK);
                            const grenze = Math.max(spiegel, flaeche - HC.spiegelFreibord * AnazhRealm._flussTiefe(p));
                            if (S.get(kp) > grenze) {
                                S.set(kp, grenze);
                                gekappt = true;
                            }
                        }
                    }
            }
            if (gekappt)
                for (const key of nachHoehe) {
                    const n = naechster.get(key);
                    if (n !== undefined && S.get(n) > S.get(key)) S.set(n, S.get(key));
                }
        }
        for (const rv of rivers) for (const p of rv.points) p.S = p.inLake ? p.y : S.get(schluessel(p));
    }

    // Phase 5c — Wasserfälle: Fluss-Läufe, deren SPIEGEL (`S`) steil fällt (Steigung > waterfallSlope, in Summe ≥
    // waterfallMinDrop) = ein Sturz; aufeinanderfolgende steile Segmente verschmelzen zu EINEM. Jedes Segment zählt
    // EINMAL: zwei Quellen teilen ihren Unterlauf, und der Sturz darin gehört beiden (bis V18.531 19 Einträge an 13 Orten,
    // W-F4).
    _hydroExtractWaterfalls(ctx, rivers) {
        const HC = AnazhRealm.HYDROSPHERE;
        const waterfalls = [];
        const yOf = (p) => (Number.isFinite(p.S) ? p.S : p.y);
        const gesehen = new Set();
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            let runStart = -1; // Index des oberen Punkts des steilen Laufs
            const flush = (lowerK) => {
                if (runStart < 0) return;
                const a = pts[runStart];
                const b = pts[lowerK];
                const topY = yOf(a);
                const bottomY = yOf(b);
                if (topY - bottomY >= HC.waterfallMinDrop) {
                    waterfalls.push({
                        x: (a.x + b.x) / 2,
                        z: (a.z + b.z) / 2,
                        topY,
                        bottomY,
                        width: a.width,
                        flowX: a.flowX || b.flowX,
                        flowZ: a.flowZ || b.flowZ,
                        riverIndex: ri,
                    });
                }
                runStart = -1;
            };
            for (let k = 0; k + 1 < pts.length; k++) {
                const a = pts[k];
                const b = pts[k + 1];
                // V9.46 — eine See-Durchquerung ist flach (Wasser-Oberfläche),
                // kein Wasserfall; ein laufender steiler Lauf endet an ihr. Ein schon gezähltes Segment (geteilter
                // Unterlauf) beendet den Lauf ebenso.
                const seg = a.x + "," + a.z;
                if (a.inLake || b.inLake || gesehen.has(seg)) {
                    flush(k);
                    continue;
                }
                gesehen.add(seg);
                const drop = yOf(a) - yOf(b);
                const horiz = Math.hypot(b.x - a.x, b.z - a.z) || ctx.cell;
                const steep = drop > 0 && drop / horiz > HC.waterfallSlope;
                if (steep) {
                    if (runStart < 0) runStart = k;
                } else {
                    flush(k); // k ist der untere Punkt des letzten steilen Segments
                }
            }
            flush(pts.length - 1);
        }
        return waterfalls;
    }

    // Carve-Index für `_hydrosphereCarveAt` + `_hydrosphereLakeAt`: (1) Fluss-Bucket-Grid (jedes Segment
    // in alle Buckets seiner um die Kanal-Reichweite erweiterten BBox; eine Abfrage liest einen Bucket),
    // (2) See-Raster `lakeBedCell`, `lakeW`, `lakeNear` (Early-Out). Pure Daten — kein
    // `_terrainDensityAt`, kein Zirkel.
    _hydroBuildCarveIndex(ctx, rivers, lakes) {
        const HC = AnazhRealm.HYDROSPHERE;
        const { dim, originX, originZ, size, waterLevel } = ctx;
        // --- Fluss-Bucket-Grid ---
        const bucketSize = HC.carveBucketSize;
        const bucketsDim = Math.max(1, Math.ceil(size / bucketSize));
        const riverBuckets = new Array(bucketsDim * bucketsDim);
        const addSeg = (seg) => {
            // die Reichweite des Kanals: Krone (halbe Breite + Tiefe / Neigung) + die Krone des Damms + die Böschung dahinter
            const reach =
                Math.max(seg.hwA, seg.hwB) + Math.max(seg.dA, seg.dB) / HC.bankNeigung + HC.dammBreite + HC.bankWeite;
            let bi0 = Math.floor((Math.min(seg.ax, seg.bx) - reach - originX) / bucketSize);
            let bi1 = Math.floor((Math.max(seg.ax, seg.bx) + reach - originX) / bucketSize);
            let bj0 = Math.floor((Math.min(seg.az, seg.bz) - reach - originZ) / bucketSize);
            let bj1 = Math.floor((Math.max(seg.az, seg.bz) + reach - originZ) / bucketSize);
            if (bi0 < 0) bi0 = 0;
            if (bj0 < 0) bj0 = 0;
            if (bi1 >= bucketsDim) bi1 = bucketsDim - 1;
            if (bj1 >= bucketsDim) bj1 = bucketsDim - 1;
            for (let bj = bj0; bj <= bj1; bj++) {
                for (let bi = bi0; bi <= bi1; bi++) {
                    const k = bj * bucketsDim + bi;
                    if (!riverBuckets[k]) riverBuckets[k] = [];
                    riverBuckets[k].push(seg);
                }
            }
        };
        // Ein geteilter Unterlauf ist EIN Segment (zwei Quellen, ein Fluss — die Buckets trugen ihn je Quelle).
        const segGesehen = new Set();
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            for (let k = 0; k + 1 < pts.length; k++) {
                const a = pts[k];
                const b = pts[k + 1];
                // V9.46 — eine See-Durchquerung NICHT carven: das Becken-Bett
                // ist schon von `_hydrosphereLakeAt` flach gesculptet; ein
                // Fluss-Carve grübe sonst eine Rinne in den flachen See-Boden.
                if (a.inLake || b.inLake) continue;
                const segKey = a.x + "," + a.z;
                if (segGesehen.has(segKey)) continue;
                segGesehen.add(segKey);
                addSeg({
                    ax: a.x,
                    az: a.z,
                    bx: b.x,
                    bz: b.z,
                    hwA: a.width * 0.5,
                    hwB: b.width * 0.5,
                    dA: AnazhRealm._flussTiefe(a),
                    dB: AnazhRealm._flussTiefe(b),
                    // der Spiegel an beiden Enden (`_hydroRiverSpiegel`): Fluss-Fläche und Bett lesen ihn linear
                    sA: a.S,
                    sB: b.S,
                });
            }
        }
        // --- See-Becken-Raster ---
        // `lakeBedCell` = flache Bett-Höhe `bedY` (2 Ringe propagiert für saubere bilineare Ufer-Ecken);
        // `lakeW` = Becken-Zugehörigkeit 0/1 (daraus rampt die Ufer-Mischung); `lakeNear` = 1-Ring-Maske.
        // `bedY` ∈ [waterLevel+0.5, level−1.2]: über dem Meer (Meeres-Plane verdeckt), unter dem Spiegel.
        // Seen ≤ waterLevel+2 werden nicht gesculptet — das Meer deckt sie (keine zwei Wasser-Ebenen).
        const n = dim * dim;
        const lakeBedCell = new Float32Array(n);
        const lakeW = new Float32Array(n);
        const lakeNear = new Uint8Array(n);
        for (let li = 0; li < lakes.length; li++) {
            const lake = lakes[li];
            if (lake.level <= waterLevel + 2.0) continue; // faktisch Meeresspiegel
            let bedY = lake.level - HC.carveLakeBedDepth;
            const minBed = waterLevel + 0.5;
            const maxBed = lake.level - 1.2;
            if (bedY < minBed) bedY = minBed;
            if (bedY > maxBed) bedY = maxBed;
            const cells = lake.cells || [];
            for (let c = 0; c < cells.length; c++) {
                const idx = cells[c];
                const ci = idx % dim;
                const cj = (idx / dim) | 0;
                lakeW[idx] = 1;
                for (let dj = -2; dj <= 2; dj++) {
                    for (let di = -2; di <= 2; di++) {
                        const ni = ci + di;
                        const nj = cj + dj;
                        if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                        const nidx = ni + nj * dim;
                        lakeBedCell[nidx] = bedY; // bedY auf 2 Ringe propagiert
                        if (di >= -1 && di <= 1 && dj >= -1 && dj <= 1) lakeNear[nidx] = 1;
                    }
                }
            }
        }
        return { riverBuckets, bucketSize, bucketsDim, lakeBedCell, lakeW, lakeNear };
    }

    // === Die Hydrosphäre wird sichtbar ===
    // Läuft NACH dem Setzen von `state.hydrosphere` (Carve aktiv): je gestreamtem Chunk die Wasser-Cells
    // (LOD 0) neu bauen + das Iso-Wasser meshen; trockene Chunks verlieren Cells + Iso. EIN Material
    // (`_ensureHydroSurfaceMaterial`) für alles Iso-Wasser, gespeist von `_applyDayNightToScene`.
    _buildHydrosphereMeshes() {
        if (!this.state.scene || typeof THREE === "undefined") return;
        const hydro = this.state.hydrosphere;
        if (!hydro || !hydro.ready) return;
        this._disposeHydrosphereMeshes(); // idempotenter Rebuild
        const meshes = [];
        // Keine Wasserfall-Plane: steile Läufe trägt das Wildwasser (aSlope-Schaum) + die Steilkanten-Form im
        // Zell-Sheet (das Wasserfall-Material ohne Leser fiel mit der Welle L).
        this.state.hydrosphereMeshes = meshes;
        // V9.75 — schon gestreamte Voxel-Chunks bekommen ihr Iso-Mesh neu
        // gebaut, damit Chunks aus der Pre-Hydrosphäre-Phase (vor dem Atlas)
        // die Lake/Fluss-Wahrheit aus `_waterLevelAt` jetzt sehen. ZWEI PHASEN (die Wasser-Naht): erst die Zellen
        // ALLER Chunks, dann die Sheets — ein Sheet liest die Zellen seiner Nachbarn; im Wechsel gebaut las der
        // frühere Chunk die alten Zellen des späteren, und niemand baute ihn danach neu (Kante auf zwei Höhen).
        if (this.state.voxelChunks) {
            const neu = [];
            for (const key of this.state.voxelChunks.keys()) {
                const ci = key.indexOf(",");
                const cx = Number(key.slice(0, ci));
                const cz = Number(key.slice(ci + 1));
                const entry = this.state.voxelChunks.get(key);
                if (entry && entry.mesh) {
                    // Trocken-Gate auch hier: Hochland-Chunks ohne Wasser sparen den 71k-Cell-Density-Pass (erst mit
                    // fertigem Atlas ist das Gate verlässlich).
                    if (this._voxelChunkHasAnyWater(cx, cz)) {
                        // Wasser-Cells IMMER in LOD 0 — naht-freie Wasser-Oberfläche über LOD-Grenzen hinweg.
                        const lod0Cfg = this._voxelChunkConfig(0);
                        const base = this.state.terrainBaseHeight || 0;
                        entry.waterCells = this._buildVoxelChunkWaterCells(
                            cx * lod0Cfg.span,
                            base - lod0Cfg.floorDrop,
                            cz * lod0Cfg.span,
                            lod0Cfg.step,
                            null,
                            0
                        );
                        neu.push([cx, cz]);
                    } else {
                        entry.waterCells = null;
                        this._disposeVoxelChunkWaterIso(`${cx},${cz}`);
                    }
                }
            }
            for (const [cx, cz] of neu) this._buildVoxelChunkWaterIsoSurface(cx, cz);
            // die Wasser-Zellen der Chunks sind neu: die Welt und ihr Boden regen sich — die Stand-Wache weckt die Fege-
            // Takte, auch im Stand (der Wasser-Automat selbst läuft auf seiner eigenen Uhr)
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

    // Der Spiegel am Körper (die Wahrheit ohne Gestalt) — nur `_koerperWasser` ruft ihn. Wo ein Chunk geladen ist, ist es das
    // GEZEICHNETE Wasser (`_wasserBildAt`: das Sheet, auch der Küsten-Aquifer, das Live-Dach des Automaten, das flache Ufer)
    // unter der DECKE (D11), gelesen an der Zelle des Körpers (die erste nicht-feste über seinem Grund): ist sie geflutet,
    // trägt sie das Wasser bis zum Spiegel, solange keine FEST-Zelle dazwischen liegt; sonst trägt es den Körper nur unter
    // offenem Himmel — liegt die oberste Fläche des Gesetzes (`_voxelSurfaceY`) mehr als eine Zelle über seinem Grund, steht
    // er unter Fels (eine Höhle unter oder neben dem Wasser): trocken, auch wo der Rand eines Sheets unter das Gelände in die
    // Höhle taucht (am See der Mess-Wiese lag die Anker-Kante in einer 16 m hohen Höhle 15 m über ihrem Boden). Ein Bau-Stempel
    // (Stamm, Pfeiler) ist kein Fels: das Gesetz kennt ihn nicht, das Sheet läuft durch ihn wie das Wasser um ihn.
    // Ohne Chunk (die Ferne, die niemand sieht) der Spiegel des Gesetzes über seinem Grund.
    _koerperWasserSpiegel(x, z, grundY) {
        const endlich = Number.isFinite(grundY);
        const bild = this._wasserBildAt(x, z);
        if (bild === undefined) return this._atlasWaterLevelAt(x, z, endlich ? grundY : -Infinity);
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

    // DIE EINE SZENEN-TIEFE: Wasser (bis V18.529 der Modul-Knoten der linearen Tiefe) und Feld-Pass (ein zweiter
    // `viewportDepthTexture()`) zogen zwei Kopien derselben Szenen-Tiefe (gemessen 04.10.: zwei „szene:tiefenkopie" am
    // Szene-Ziel) — beide Leser lesen diesen EINEN Knoten. DAS TIEFEN-ABBILD (0710-1 P2, Runde 2, Frage 1): beide Leser
    // schreiben selbst Tiefe (Wasser `depthWrite`, der March seine Fragment-Tiefe), also braucht ihr Lesen eine Kopie im
    // Pass-Bruch — r184 kennt keinen nur-lesend angehängten Tiefen-Anhang. Aber keiner braucht sie Pixel für Pixel: das
    // Wasser rechnet den optischen Weg zum Grund (weiche Ufer), der March bricht an der Szenen-Tiefe ab (dahinter verwürfe
    // ihn der Tiefentest). Die volle Kopie (depth24plus, 7,9 MB bei 1080p) wird ein Abbild in halber BREITE, je Texel die
    // FERNSTE Tiefe seines waagrechten Pixel-Paars (r32float, 4,0 MB): der March läuft am Rand höchstens einen Pixel weiter
    // (der Test verwirft), das Wasser liest an der Kante eines Gegenstands im Wasser den Grund dahinter, nie den Gegenstand.
    // DIE ZEILE BLEIBT GANZ (Integration Welle L wasser × K host-vram, 08.10.): das Paar liegt in EINER Zeile — der Grund
    // entfernt sich mit der Bild-Zeile, nie innerhalb einer; das 2×2-Maximum las die Hälfte der Pixel eine Zeile weiter, und
    // das Wasser der Welle L (der Durchlass und das Ufer-Band aus dem optischen Weg) zeigte das: über hellem Grund 6 Stufen
    // dunkler als mit r184s Tiefe, am Pfahl 7 von 38 Kanten-Pixeln bis 14 Luma (gate:post-kette (e)/(f)); mit dem Paar 0
    // und 0. Gezeichnet im Pass-Bruch des Hauptbilds (`_tiefenAbbild`); der WebGL2-Rückfall und der Null-Renderer behalten
    // r184s Viewport-Tiefe.
    // DER WERT IST EIN SKALAR: r184s Viewport-Tiefe ist ein Knoten auf einer Tiefen-Textur (Typ float); das Abbild ist eine
    // r32float-Farbtextur, ihr Knoten liefert vec4 (d, 0, 0, 1). Roh weitergereicht, rechnete das Wasser seinen optischen Weg
    // als vec4 — der Durchlass (Beer-Lambert) weitete `vec3(wK)` und die Luma-Gewichte auf vec4 mit 1,0 und zählte die vierte
    // Komponente mit (gemessen 07.10., GTX 1060, Nord-Ufer: das Becken türkis statt grau, 99/131/116 → 114/166/147). Die
    // Leser bekommen `.x`; `_szeneTiefeKnoten` bleibt der Textur-Knoten (Zug, Zerleg-Linse, gate:post-kette).
    _szeneTiefe() {
        if (this._szeneTiefeWert) return this._szeneTiefeWert;
        const rend = this.state.renderer;
        const T = THREE.TSL;
        if (!rend || rend._isHeadlessNull || !rend.backend || rend.backend.isWebGPUBackend !== true) {
            this._szeneTiefeKnoten = T.viewportDepthTexture();
            this._szeneTiefeKnoten.defaultFramebuffer.name = "szene:tiefenkopie";
            this._szeneTiefeWert = this._szeneTiefeKnoten;
            return this._szeneTiefeWert;
        }
        const abbild = new THREE.DataTexture(new Float32Array(1), 1, 1, THREE.RedFormat, THREE.FloatType);
        abbild.name = "szene:tiefenabbild";
        // ein Ziel ohne hochgeladene Daten: r184 legt es an, gezeichnet wird es im Pass-Bruch
        abbild.isRenderTargetTexture = true;
        abbild.minFilter = THREE.NearestFilter;
        abbild.magFilter = THREE.NearestFilter;
        abbild.generateMipmaps = false;
        // JEDES PIXEL LIEST DAS PAAR, DAS ES ENTHÄLT (Gegenprüfung 0710-3): ganzzahlig, x / 2, y ganz. Vorher las `screenUV` mit
        // Nearest bei uv = (x + 0,5)/W eine Textur der Breite ceil(W/2) — bei UNGERADER Leinwand traf jedes ungerade x der
        // rechten Hälfte (ungerade Höhe: der unteren) den Nachbar-Block (x+1, x+2): neben einem Gegenstand vor dem Wasser las
        // das Wasser den Gegenstand, ein heller Saum von 1 px (Radeon, TRAA, 1921×1081: 57–85 von ~290 Kanten-Pixeln +8 Luma;
        // gate:post-kette (f), 321×241: 11 von 31 bis 45,5), der March verlor 1 px eines fernen Körpers.
        const knoten = T.texture(abbild).load(T.ivec2(T.screenCoordinate.xy).div(T.ivec2(2, 1)));
        // je Render EINMAL, ausgelöst vom ersten Leser, der zeichnet (wie r184s Viewport-Tiefe)
        knoten.updateBeforeType = "render";
        knoten.updateBefore = (frame) => this._tiefenAbbild(frame, abbild);
        this._szeneTiefeKnoten = knoten;
        this._szeneTiefeWert = knoten.x;
        return this._szeneTiefeWert;
    }

    // DER ZUG DES TIEFEN-ABBILDS: im Hauptbild (Post-Kette oder Direktpfad — die Szene mit der Spiel-Kamera) bricht r184s
    // eigener Weg den Pass (`backend.copyFramebufferToTexture`: Pass beenden, auf demselben Encoder kopieren, mit `load` neu
    // beginnen); kopiert wird in eine 1×1-Attrappe der Szenen-Tiefe, und genau diese eine Encoder-Kopie wird zum Abbild-Pass
    // (ein Vollbild-Dreieck lädt je Pixel des Abbilds das waagrechte Paar der Szenen-Tiefe und schreibt sein Maximum). So
    // bleibt der Bruch
    // r184s Choreographie (gate:vendor-anker pinnt sie), und die Tiefe des Hauptbilds steht im Abbild, bevor der erste
    // Leser zeichnet.
    _tiefenAbbild(frame, abbild) {
        const st = this.state;
        const rend = frame.renderer;
        if (frame.scene !== st.scene || frame.camera !== st.camera) return;
        const ctx = rend._currentRenderContext;
        if (!ctx || !ctx.depthTexture) return;
        const be = rend.backend;
        const quelle = be.get(ctx.depthTexture).texture;
        if (!quelle) return;
        const w = Math.max(1, Math.ceil(quelle.width / 2)),
            h = Math.max(1, quelle.height);
        if (abbild.image.width !== w || abbild.image.height !== h) {
            abbild.image = { data: null, width: w, height: h };
            abbild.needsUpdate = true;
        }
        rend._textures.updateTexture(abbild);
        const ziel = be.get(abbild).texture;
        let A = this._tiefenAbbildGpu;
        if (!A) {
            const modul = be.device.createShaderModule({
                label: "szene:tiefenabbild",
                code:
                    "@group(0) @binding(0) var tiefe: texture_depth_2d;\n" +
                    "@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {\n" +
                    "    let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));\n" +
                    "    return vec4f(p * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), 0.0, 1.0);\n" +
                    "}\n" +
                    "@fragment fn fs(@builtin(position) p: vec4f) -> @location(0) vec4f {\n" +
                    "    let q = vec2i(textureDimensions(tiefe)) - vec2i(1, 1);\n" +
                    "    let b = vec2i(i32(p.x) * 2, i32(p.y));\n" +
                    "    var d = 0.0;\n" +
                    "    for (var i = 0; i < 2; i++) { d = max(d, textureLoad(tiefe, min(b + vec2i(i, 0), q), 0)); }\n" +
                    "    return vec4f(d, 0.0, 0.0, 1.0);\n" +
                    "}\n",
            });
            // die 1×1-Attrappe der Szenen-Tiefe: r184 kopiert im Pass-Bruch in sie, die Kopie wird zum Abbild-Pass
            const bruch = new THREE.DepthTexture(1, 1);
            bruch.name = "szene:tiefenabbild:bruch";
            A = this._tiefenAbbildGpu = {
                pipe: be.device.createRenderPipeline({
                    label: "szene:tiefenabbild",
                    layout: "auto",
                    vertex: { module: modul, entryPoint: "vs" },
                    fragment: { module: modul, entryPoint: "fs", targets: [{ format: "r32float" }] },
                    primitive: { topology: "triangle-list" },
                }),
                attrappe: bruch,
                rechteck: new THREE.Vector4(0, 0, 1, 1),
                quelle: null,
                ziel: null,
            };
        }
        if (A.quelle !== quelle || A.ziel !== ziel) {
            A.gruppe = be.device.createBindGroup({
                layout: A.pipe.getBindGroupLayout(0),
                entries: [{ binding: 0, resource: quelle.createView({ aspect: "depth-only" }) }],
            });
            A.ansicht = ziel.createView();
            A.quelle = quelle;
            A.ziel = ziel;
        }
        A.attrappe.type = quelle.format === "depth32float" ? THREE.FloatType : THREE.UnsignedIntType;
        rend._textures.updateTexture(A.attrappe);
        A.attrappeGpu = be.get(A.attrappe).texture;
        // die Marke für den Ziel-Zensus: die Kopie hierher findet nie statt, der Haken zeichnet sie ins Abbild
        if (A.attrappeGpu) A.attrappeGpu.__umleitung = "szene:tiefenabbild";
        // DER HAKEN AN DER ENCODER-KOPIE liegt EINMAL (Gegenprüfung 0710-3: vorher je Frame ein- und ausgehängt — jede
        // Zuweisung an `GPUCommandEncoder.prototype` verwirft, was der Motor über die Methode aller Aufrufer annahm); scharf
        // ist er nur für die Dauer des EINEN Bruchs (`A.scharf`, try/finally), jede andere Kopie fährt r184 unverändert.
        if (!A.haken) {
            const E = GPUCommandEncoder.prototype;
            const kopieRoh = E.copyTextureToTexture;
            E.copyTextureToTexture = function (von, nach, groesse) {
                if (!A.scharf || !nach || nach.texture !== A.attrappeGpu)
                    return kopieRoh.call(this, von, nach, groesse);
                const pass = this.beginRenderPass({
                    label: "szene:tiefenabbild",
                    colorAttachments: [
                        { view: A.ansicht, loadOp: "clear", storeOp: "store", clearValue: [1, 0, 0, 1] },
                    ],
                });
                pass.setPipeline(A.pipe);
                pass.setBindGroup(0, A.gruppe);
                pass.draw(3);
                pass.end();
                return undefined;
            };
            A.haken = true;
        }
        A.scharf = true;
        try {
            be.copyFramebufferToTexture(A.attrappe, ctx, A.rechteck);
        } finally {
            A.scharf = false;
        }
    }

    // DER TAUSCH DES TIEFEN-KNOTENS: die Leser der Szenen-Tiefe (der EINE Knoten `_szeneTiefe` — auf WebGPU das
    // Tiefen-Abbild, im Rückfall r184s ViewportDepthTextureNode) sind das Wasser (weiche Ufer) und der Feld-Pass (die
    // Tiefen-Grenze des Marchs). Wechselt der KNOTEN selbst (eine Linse tauscht `_szeneTiefeKnoten`/`_szeneTiefeWert` für
    // ein A/B in EINER Welt: gate:post-kette (e), die Werkbank), ändert sich der Shader-Graph beider Leser: das Wasser-
    // Material wird frisch gebaut (die Uniform-Werte reisen mit), der Feld-Pass fällt und baut sich im nächsten
    // Fern-Ring-Takt neu. Ein Größenwechsel braucht das nie — die neu angelegte TEXTUR desselben Knotens trägt die Diät
    // (Vorher-Textur-Wächter, `_diaetVorTextur`); der resize-Handler baute hier bis 0910-3 A einen Zwilling davon.
    _tiefenKnotenTausch() {
        const st = this.state;
        if (st.feldPass) this._feldPassDispose();
        const alt = st.hydroSurfaceMaterial;
        if (!alt) return 0;
        const altU = st.hydroSurfaceUniforms || {};
        st.hydroSurfaceMaterial = null;
        const neu = this._ensureHydroSurfaceMaterial();
        if (!neu) {
            st.hydroSurfaceMaterial = alt;
            return 0;
        }
        const neuU = st.hydroSurfaceUniforms || {};
        for (const k of Object.keys(altU)) {
            const a = altU[k],
                n = neuU[k];
            if (!a || !n || a === n || a.value == null) continue;
            if (n.value && typeof n.value.copy === "function") n.value.copy(a.value);
            else n.value = a.value;
        }
        // Szene (inkl. Bundles) UND die Chunk-Wasser-Ablage — ein gerade ausgehängtes Mesh nähme sonst das
        // entsorgte Material wieder mit in die Welt.
        let umgehaengt = 0;
        const haenge = (o) => {
            if (!o || o.material !== alt) return;
            o.material = neu;
            umgehaengt++;
            if (o.parent && o.parent.isBundleGroup) o.parent.needsUpdate = true;
        };
        st.scene.traverse(haenge);
        if (st.voxelChunkWaterIso) for (const m of st.voxelChunkWaterIso.values()) haenge(m);
        alt.dispose();
        return umgehaengt;
    }

    // Der EINE Wasser-Shader für alle Iso-Wasser-Meshes (Ozean + See + Fluss): `aWave` ∈ [0,1]
    // (Ozean-Anteil, skaliert die Wellen; weich 0 am Ufer → kein Küsten-Riss), `aFlow` (Gefälle-
    // Tangente, die Strömung trägt das Bild stromab). Sonne/Licht/Fog speist `_applyDayNightToScene`.
    // DER WASSER-KÖRPER (K16, die Naht des Wassers): was die optisch tiefe Wassersäule zurückstreut, R∞ = 0,33 · b_b / (a + b_b)
    // je Kanal (Gordon 1975; a = die Absorption wK des Gesetzes, b_b = seine Rückstreuung `koerperStreu`, 1/m) — EINE Formel
    // für den Wasser-Stoff und jeden Fern-Leser (Ring, Feld-Pass). Bis K16 trug die Ferne ein eigenes Fern-Blau
    // (`FERN_FARBE.wasser`, 0x265273): der Fluss im Ring 4,8× heller als der gebaute (Luma 0,255 gegen 0,053).
    static _wasserKoerper(WG) {
        return WG.wK.map((k) => (0.33 * WG.koerperStreu) / (k + WG.koerperStreu));
    }

    // DER BLICK DES WASSERS (K16, EIN Baustein für den Wasser-Stoff und den Fern-Ring): was die Fläche mit der Normale `n`
    // dem Auge `viewDir` zurückwirft, über dem Grund mit dem Durchlass `T` — der Körper im Licht des Orts (R∞ × E/π), soweit
    // er den Grund deckt (1 − T) und nicht gespiegelt wird (1 − F); der Himmel × F; der Glanz. Liefert { eigen, fres }.
    _wasserBlick(TSL, WG, o) {
        const { float, vec3, normalize, reflect, max, dot, pow, clamp, texture, equirectUV } = TSL;
        // Schlick-Fresnel (WASSER_GESETZ): fres = f0 + f1·(1−n·v)^f2 — EIN Fresnel für Spiegel UND Durchlass.
        const ndvW = clamp(dot(o.n, o.viewDir), 0.0, 1.0);
        const fres = float(WG.fresnel[0]).add(
            float(WG.fresnel[1]).mul(pow(float(1.0).sub(ndvW), float(WG.fresnel[2])))
        );
        // DER SPIEGEL IST DER HIMMEL: die EINE Himmels-Umgebung (`_himmelUmgebungTex`, dieselbe Textur, aus der PMREM
        // die IBL jedes PBR-Stoffs filtert) in Richtung des gespiegelten Strahls — Strahlung in Himmels-Einheiten,
        // nie unter den Horizont (Kräusel-Normalen), Mip 0 (glatt; an der Azimut-Naht griffe die Ableitung die
        // gröbste Stufe). Bis V18.530 spiegelte das Wasser die Zenit-Tönung × die SONNEN-Stärke (uLight 7,4): der
        // Spiegel lag 3–5× über dem Himmel, den er spiegelt — weiß wie Eis (Blick-Tour 07, Helligkeit 188).
        const _R = reflect(o.viewDir.negate(), o.n);
        const _Rh = normalize(vec3(_R.x, max(_R.y, float(0.02)), _R.z));
        const himmel = texture(this._himmelUmgebungTex(), equirectUV(_Rh)).level(float(0)).rgb;
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
        return { eigen, fres };
    }

    _ensureHydroSurfaceMaterial() {
        if (this.state.hydroSurfaceMaterial) return this.state.hydroSurfaceMaterial;
        if (typeof THREE === "undefined") return null;
        // MeshBasicNodeMaterial (TSL), NUR WebGPU (kein WebGL-Fallback — ohne WebGPU zeigt sich der Banner).
        // Wellen-Displacement, Tangenten-Kreuzprodukt-Normale, Schaum aus dem Gesetz, Blinn-Phong-Spec, Fresnel-
        // Alpha (die Luft: scene.fogNode); Attribute aFlow (vec2), aWave, aDepth, aSlope (float). Live-Uniforms in
        // state.hydroSurfaceUniforms (Schlüssel ohne u-Präfix, TSL-Konvention), mutiert von
        // _loopSkyboxZeit (time) + _dayNightApplyWaterMaterials (sunDir, light).
        const TSL = THREE.TSL;
        const {
            uniform,
            attribute,
            vec2,
            vec3,
            vec4,
            float,
            mat3,
            positionLocal,
            modelWorldMatrix,
            modelNormalMatrix,
            cameraPosition,
            dot,
            length,
            mix,
            smoothstep,
            clamp,
            fract,
            floor,
            max,
            pow,
            normalize,
            cross,
            reflect,
            select: cond,
            Fn,
            uint,
            int,
            abs,
            // V13.5 (Schicht 3) — Tiefenpuffer-Knoten für die pro-Pixel-Uferlinie.
            linearDepth,
            depth,
            cameraNear,
            cameraFar,
            exp,
            texture,
            equirectUV,
        } = TSL;
        void mat3; // potenzielle Alternative zu modelNormalMatrix

        // Das Studio-Gesetz WASSER_GESETZ (lebt NUR in foundry-core/__terrainCore; dieselben Zahlen injiziert das
        // Studio-GLSL): Beer-Lambert-Absorption wK (1/m) · Schlick-Fresnel · Sonnen-Glanz · Schaum. Der Leser ist
        // fail-closed, keine Kopie hier.
        const WG =
            AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
        // Die Live-Uniforms (uniform-Knoten mit .value-Setter). Die Strömung des Bilds ist die des Gesetzes
        // (`wellen.adv`, m/s im Kern — dieselbe Zeile, die das Studio-Bach-Bild trägt): Strähnen, Kräusel und Glitzer
        // reiten DASSELBE Wasser (bis V18.531 1,5 · 0,5 · 0,9 m/s, drei Literale).
        const uTime = uniform(0.0);
        const uFlowSpeed = uniform(WG.wellen.adv);
        // DIE FLUSS-PHASE (Flowmap mit Rücksetzung, Vlachos/Portal 2): jede advektierte Lage wandert höchstens eine Phase
        // weit (v · P Meter) und kehrt dann zurück; zwei Lagen, um eine halbe Phase versetzt, die Dreiecks-Blende
        // versteckt die Rücksetzung. Bis V18.531 war der Versatz `uTime · v` — mit der Spielzeit unbegrenzt, und wo die
        // Strömung quer zum Fluss ausblendet, wuchs sein Gefälle mit: frisch weich, nach Minuten Höhenlinien-Bänder, nach
        // einer Stunde Rauschen (das weiße Zebra, gate:wasser-leben B2).
        const uFlowPeriod = uniform(AnazhRealm.WASSER_WELLE.phase);
        const phaseA = fract(uTime.div(uFlowPeriod));
        const phaseB = fract(uTime.div(uFlowPeriod).add(0.5));
        const phaseBlend = abs(phaseA.mul(2.0).sub(1.0)); // 0 → Lage A allein, 1 → Lage B allein (A kehrt zurück)
        const flussWegA = phaseA.mul(uFlowPeriod).mul(uFlowSpeed); // Meter stromab, beschränkt
        const flussWegB = phaseB.mul(uFlowPeriod).mul(uFlowSpeed);
        const LAGE_B = vec2(17.3, 31.7); // die zweite Lage liest ein anderes Stück desselben Rauschens
        // DER WASSER-KÖRPER: was die optisch tiefe Wassersäule zurückstreut — R∞ = 0,33 · b_b / (a + b_b) je Kanal
        // (Gordon 1975; a = die Absorption wK des Gesetzes, b_b = seine Rückstreuung `koerperStreu`, 1/m): 0,005/0,016/
        // 0,025, ein dunkles Blaugrün, im Licht des Orts 3–4× dunkler als die Wiese. Bis 05.10. stand hier das tiefe
        // Anzeige-Blau des Studios (exp(−wK·tief), als sRGB-Absicht dekodiert 0,0003/0,027/0,107): aus 45 m ein
        // leuchtendes Königsblau. Schaum: weiß, eine diffuse Fläche.
        const koerperAlbedo = vec3(...AnazhRealm._wasserKoerper(WG));
        const uFoam = uniform(new THREE.Color().setRGB(WG.schaum.farbe[0], WG.schaum.farbe[1], WG.schaum.farbe[2]));
        // Das Licht des Orts (Schreiber `_dayNightApplyWaterMaterials`): uIrr = E/π einer waagrechten Fläche (Sonne
        // + Himmels-Umgebung + Hemi + Ambient — dieselbe Bilanz wie die Belichtung, `_waagrechtIrradianz`), der
        // Glanz in der Rayleigh-Sonnenfarbe (uSunCol × uLight = die Sonne selbst).
        const uIrr = uniform(new THREE.Color(1, 1, 1));
        const uSunCol = uniform(new THREE.Color(1, 0.96, 0.85));
        const uSunDir = uniform(new THREE.Vector3(1, 1, 1).normalize());
        const uLight = uniform(1.0);
        // uEmotion ist der Kopplungs-Haken (0 = neutral). Die Regler initialisiert der persistierte Atmosphäre-
        // Wert (Settings-Slider, überlebt Reload), sonst Default.
        const atmoW = this.state.atmosphere || {};
        const uEmotion = uniform(0.0);
        // Mindest-Wasser-Dicke (Meter optischer Weg): Fragmente darunter fallen per alphaTest (der 16-m-Atlas-
        // Spiegel blutet minimal über Voxel-Grate → flaches Blatt); tiefes Wasser bleibt. Default 0 (der
        // Durchlass macht dünnes Wasser schon durchsichtig), live über setWaterCull.
        const initMinDepth =
            this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterCull)
                ? this.state.atmosphere.waterCull
                : 0.0025;
        const uMinDepth = uniform(initMinDepth);
        // V18.14 — die MAKRO-bewusste Schaum-Tiefe (M1): der Schaum schäumt nur, wo die
        // ECHTE Wassertiefe `aDepth` < uDepthFoam (die echte Uferlinie), NICHT den ganzen
        // flachen Fluss (gemessen median 1.31 m). In METERN (nicht Lineardepth), Slider.
        const uDepthFoam = uniform(Number.isFinite(atmoW.waterDepthFoam) ? atmoW.waterDepthFoam : 1.2);
        // V18.17 (Phase 3 sichtbar) — der See-Wellen-FLOOR: auch See/Fluss (aWave=0) bekommen
        // diesen Anteil der Wellen-Amplitude → SICHTBARES sanftes Kräuseln (Default 0.2 statt der
        // zu subtilen 0.06; 0 = flach, 1 = wie Ozean). Ein persistierter Slider-Wert wird respektiert.
        const uLakeRipple = uniform(Number.isFinite(atmoW.waterLakeRipple) ? atmoW.waterLakeRipple : 0.2);
        // DER WIND BEWEGT DAS WASSER (W-R3): die Wind-Zeile des Gesetzes (WASSER_GESETZ.wind, Amplitude × (w0 + w1·Wind))
        // skaliert Kräuselung, Dünung und Glitzer — `uWind` ist der Wind des Wetters (0 ruhig … 1 Sturm, Schreiber
        // `_dayNightApplyWaterMaterials`). Bis V18.531 las die Welt die Zeile nicht: Sturm und Sonne zeigten denselben See.
        const uWind = uniform(0.06);
        const windF = float(WG.wind[0]).add(uWind.mul(WG.wind[1]));

        // 2D-Hash + Value-Noise. Der Hash ist pcg2d (Jarzynski & Olano 2020, derselbe wie `_pcg2d`) auf dem ganzzahligen
        // Gitterpunkt: nur u32-Multiplikation, Addition, Xor und Shift — auf jedem Adapter bit-gleich. Bis K40 war er
        // fract(sin(dot(p, ·)) · 43758): WGSL lässt sin außerhalb ±π beliebig ungenau, das Gitter wächst mit Welt-Ort und
        // Wasser-Uhr (die Kräusel-Lage driftet uTime · 0,02) — auf dem Radeon zerfiel die Stromschnelle nach einer Stunde
        // zum Zebra (Kanten-Dichte 1,436 × der bei 60 s, swiftshader rechnete sin genau: 1,027).
        const PCG_A = uint(1664525);
        const PCG_C = uint(1013904223);
        const hash2 = Fn(([p]) => {
            const x0 = uint(int(p.x)).mul(PCG_A).add(PCG_C);
            const y0 = uint(int(p.y)).mul(PCG_A).add(PCG_C);
            const x1 = x0.add(y0.mul(PCG_A));
            const y1 = y0.add(x1.mul(PCG_A));
            const x2 = x1.bitXor(x1.shiftRight(uint(16)));
            const y2 = y1.bitXor(y1.shiftRight(uint(16)));
            const x3 = x2.add(y2.mul(PCG_A));
            const x4 = x3.bitXor(x3.shiftRight(uint(16)));
            return float(x4).mul(1.0 / 4294967296.0);
        });
        const vnoise = Fn(([p]) => {
            const i = floor(p);
            const f = fract(p);
            const u = f.mul(f).mul(float(3.0).sub(f.mul(2.0)));
            return mix(
                mix(hash2(i), hash2(i.add(vec2(1.0, 0.0))), u.x),
                mix(hash2(i.add(vec2(0.0, 1.0))), hash2(i.add(vec2(1.0, 1.0))), u.x),
                u.y
            );
        });

        // Organische Dünung: drei DEKORRELIERTE value-noise-Oktaven mit eigener Drift-Richtung → runde,
        // ungerichtete Hügel. Nie Gerstner/Sinus: `dot(xz, dir)` gibt per Konstruktion parallele Kämme
        // (Raster/Chevron). smoothstep-Interpolation → stetige Ableitungen, glatte Normale (kein Speckle).
        // `aWaveV` skaliert die Amplitude. Shader-only (Sheet-Daten unberührt, kein Worker-Mirror).
        const oceanSwell = Fn(([xz]) => {
            const t = uTime;
            const w1 = vnoise(xz.mul(0.05).add(vec2(t.mul(0.06), t.mul(0.04)))).sub(0.5);
            const w2 = vnoise(xz.mul(0.12).add(vec2(t.mul(-0.05), t.mul(0.07)))).sub(0.5);
            const w3 = vnoise(xz.mul(0.23).add(vec2(t.mul(0.08), t.mul(-0.06)))).sub(0.5);
            const D = AnazhRealm.WASSER_WELLE.duenung;
            const h = w1.mul(D[0]).add(w2.mul(D[1])).add(w3.mul(D[2]));
            return vec3(float(0.0), h, float(0.0));
        });

        // === VERTEX-STAGE: Gerstner-Wellen-Displacement + Tangenten-Normale.
        // Per-Vertex-Attribute aFlow/aWave (+ aDepth, aSlope unten). aWave gated die
        // Wellen-Amplitude (Ozean voll, See/Fluss still) → kein Riss am Ufer.
        const aFlowV = attribute("aFlow", "vec2");
        const aWaveV = attribute("aWave", "float");
        // V18.14 — der MAKRO-Kontext: die echte Wassertiefe (L−Bett) pro Vertex.
        const aDepthV = attribute("aDepth", "float");
        // aSlope = |∇top| der Wasser-Oberfläche je Vertex (vom Zell-Sheet aus den geglätteten Spalten-
        // Dächern; Lippen/Vorhänge hoch) — treibt das Wildwasser (steile Läufe schäumen weiß).
        const aSlopeV = attribute("aSlope", "float");

        const p = positionLocal;
        // Welt-verankert: mesh.position = (0,0,0), positionLocal.xz = Welt-xz. Offene SEE (`aWaveV`) trägt
        // `oceanSwell`; See + Fluss eine organische, advektierte Mehr-Oktav-Noise-Kräuselung (keine Sinus-
        // Kämme, kein fixes Gitter → keine parallelen Linien/6-Ecke an Konfluenzen); der Fluss driftet
        // stromab (flowMix·flowDir), der See steht. Amplitude `uLakeRipple`, tiefenskaliert. Shader-only.
        const flowMag = aFlowV.length();
        // Weite flowMix-Rampe (0.03–0.30): ein kleiner aFlow-Versatz am Bett-Naht-Rand gibt keine harte
        // Kräuselungs-Kante (sonst bliebe die Chunk-Naht im Fluss sichtbar).
        const flowMix = smoothstep(float(0.03), float(0.3), flowMag); // 0 still (See/Ozean) → 1 Fluss
        const flowDir = aFlowV.div(flowMag.max(float(0.0001)));
        // Kräusel-Amplitude = Floor 0.3 + weite aDepth-Rampe (0.4→4.0 m): aDepth springt an Bett-Nähten
        // minimal — eine harte Rampe machte daraus eine sichtbare Linie. Shader-only.
        const rippleAmt = uLakeRipple
            .mul(float(0.3).add(smoothstep(float(0.4), float(4.0), aDepthV).mul(float(0.7))))
            .mul(windF);
        // EINE Displace-Quelle (Ozean-Gerstner + organische Kräuselung) für alle 3 Normal-Samples.
        const surfDisp = Fn(([xz]) => {
            // Offene See: organische Dünung, nur wo aWaveV hoch — ×(1−flowMix), weil auch Binnenwasser
            // aWaveV > 0 trägt; fließende Flüsse bekommen nur die advektierte Kräuselung, die Mündung blendet
            // weich. Der Rest-Moiré im steilen Lauf-Kern kommt von der Fresnel-Lesart (s. `fres`-Block).
            const ocean = oceanSwell(xz).mul(aWaveV).mul(float(1.0).sub(flowMix)).mul(windF);
            // See + Fluss: organische, advektierte Kräuselung (stromab in Flüssen, still in Seen) — zwei Lagen der
            // Fluss-Phase, je höchstens eine Phase weit getragen.
            // Kräusel-Oktaven klar UNTER der Mesh-Nyquist (~1,8-m-Raster → 3,6 m): 0.07 ≈ 14 m, 0.12 ≈ 8 m,
            // Hoch-Oktave leiser (0.4); die Amplitude 2.2·rippleAmt bleibt. Das Kern-Muster steiler Läufe ist
            // nicht die Amplitude, sondern die Fresnel-Lesart der Steilflächen-Normale (s. `fres`-Block).
            // Gilt für See UND Fluss; der Ozean trägt `oceanSwell`.
            const K = AnazhRealm.WASSER_WELLE;
            const kraeuselLage = (weg, versatz) => {
                const q = xz.sub(flowDir.mul(weg.mul(flowMix))).add(versatz);
                return vnoise(q.mul(float(0.07)).add(uTime.mul(float(0.02)))).add(
                    vnoise(q.mul(float(0.12))).mul(float(K.oktave))
                );
            };
            const rippleH = mix(kraeuselLage(flussWegA, vec2(0.0, 0.0)), kraeuselLage(flussWegB, LAGE_B), phaseBlend)
                .sub(float(K.mitte))
                .mul(float(K.kraeusel));
            const ripple = vec3(float(0.0), rippleH.mul(rippleAmt), float(0.0));
            return ocean.add(ripple);
        });
        const disp = surfDisp(p.xz);
        const pd = p.add(disp);
        const vWave = disp.y;

        // Normale aus Tangenten-Kreuzprodukt (3 Samples: pd, px, pz) — alle durch surfDisp,
        // damit die stromab-Welle die Normale (Sonnen-Glitzer) korrekt trägt.
        // Bei ruhiger See (aWaveV=0, rippleAmt klein) degeneriert das Kreuzprodukt sauber zu (0, 1, 0).
        const e = float(1.4);
        const pxBase = vec3(p.x.add(e), p.y, p.z);
        const pzBase = vec3(p.x, p.y, p.z.add(e));
        const pxPos = pxBase.add(surfDisp(vec2(p.x.add(e), p.z)));
        const pzPos = pzBase.add(surfDisp(vec2(p.x, p.z.add(e))));
        const nrmRaw = normalize(cross(pzPos.sub(pd), pxPos.sub(pd)));
        // n.y < 0 → flip (sicherer Up-Vektor) via cond-Knoten.
        const nrmFlipped = cond(nrmRaw.y.lessThan(0.0), nrmRaw.mul(-1.0), nrmRaw);

        // World-Position des displaced Vertex (für Lighting + Fog).
        const wp = modelWorldMatrix.mul(vec4(pd, 1.0));
        const vWorldPos = wp.xyz;
        // World-Raum-Normale via modelNormalMatrix (mat3 inverse-transpose).
        // Bei Wasser-Mesh (nur Translation, keine Skalierung) identisch zu
        // mat3(modelMatrix) — die V8.44-Lehre.
        const vNormalWorld = normalize(modelNormalMatrix.mul(nrmFlipped));

        // === FRAGMENT-STAGE: Wasserfarbe + Foam + Spec + Fresnel-Alpha (die Luft: scene.fogNode).
        const xz = vWorldPos.xz;
        // Normale nach oben gezwungen (cond-flip wie Vertex-Pfad).
        const nUpRaw = normalize(vNormalWorld);
        const n = cond(nUpRaw.y.lessThan(0.0), nUpRaw.mul(-1.0), nUpRaw);

        // === DER OPTISCHE WEG (Meter, pro Pixel) ===
        // Der Tiefenpuffer (Terrain dahinter, `_szeneTiefe`) minus dieses Fragment als Sicht-Tiefe in METERN
        // (`linearDepth` ist [0,1] über cameraNear…cameraFar), auf den Sicht-Strahl gestreckt (Strahl-Länge ÷
        // Sicht-Tiefe des Fragments): der Weg des Lichts vom Grund durchs Wasser ins Auge — ~0 an der Uferlinie, die
        // weiche Kante folgt dem Terrain, egal wie grob das Mesh. Bis V18.530 las das Ufer die [0,1]-Tiefe roh gegen
        // Viewport-Regler (Saum 0,0305, Schaum ×12): die Luft hob cameraFar auf 8500 m → der Saum war 259 m breit (die
        // Seen standen bei Alpha 0,4 statt durchscheinend), der Ufer-Schaum 3 km (Blick-Tour 07: weiß wie Eis).
        const sceneLin = linearDepth(this._szeneTiefe());
        const fragLin = linearDepth(depth);
        const _tiefeM = cameraFar.sub(cameraNear);
        const _fragTiefeM = fragLin.mul(_tiefeM).add(cameraNear).max(float(1e-3));
        const wegM = max(sceneLin.sub(fragLin), float(0.0))
            .mul(_tiefeM)
            .mul(length(cameraPosition.sub(vWorldPos)).div(_fragTiefeM));
        const waveT = clamp(vWave.mul(0.5).add(0.5), 0.0, 1.0);
        // DER DURCHLASS (Beer-Lambert, WASSER_GESETZ.wK je Kanal): der Weg vom Grund zum Auge plus der Weg des
        // Lichts vom Spiegel zum Grund (die Säulen-Tiefe aDepth) — am Ufer scheint der Grund durch (T → 1), im
        // Tiefen deckt der Wasser-Körper (T → 0; 1 m grün 0,14).
        const durchlass = exp(vec3(WG.wK[0], WG.wK[1], WG.wK[2]).mul(wegM.add(aDepthV)).negate());
        const T = dot(durchlass, vec3(0.2126, 0.7152, 0.0722));

        // DER SCHAUM IST DAS GESETZ: WASSER_GESETZ.schaum kennt das Ufer und den Kamm, das Studio schäumt nur dort —
        // hier die Ufer-Linie aus dem optischen Weg (unten), der Ozean-Kamm (aWave) und das Wildwasser am Steil-Lauf
        // (aSlope). Bis V18.531 lag ein Strähnen-Schaum ohne Gesetz über jedem Fluss (Schwelle 0,44 unter dem Rausch-
        // Mittel: ~60 % der Fläche bis 0,7 gedeckt, gate:wasser-leben B1) und ein Ufer-Band aus dem Attribut `aShore`,
        // das jeder Schreiber mit 0 füllte (je Pixel zwei Rauschen und ein Sinus für ×0).
        const fmag = length(aFlowV);
        const fdir = aFlowV.div(max(fmag, float(0.0001)));
        // Die Fluss-Phase im Bild: je Lage der Weg stromab × der örtliche Strömungs-Anteil fmag (0 im See). Das Muster
        // lebt STABIL in Welt-XZ und wird nur verschoben — nie `dot(xz, fdir)`: |xz| ist ein Hebelarm, eine kleine
        // Drehung in Kurven springt den Noise-Input (Zickzack-Moiré).
        const strom = (weg, versatz) => xz.sub(fdir.mul(weg.mul(fmag))).add(versatz);
        const advA = strom(flussWegA, vec2(0.0, 0.0));
        const advB = strom(flussWegB, LAGE_B);
        // Die Wildwasser-Strähnen (0.11 ≈ 9 m, unter der Mesh-Nyquist ~3,6 m), zwei Lagen der Phase.
        const riverS1 = mix(vnoise(advA.mul(0.11)), vnoise(advB.mul(0.11)), phaseBlend);
        // V9.49-c — Ozean-Schaumkämme (Gerstner-Crests tragen Gischt, aWave-gated); `riverness` (0 See … 1 Fluss, die
        // taperende aFlow-Rampe 0.04→0.5) blendet sie in der Mündung aus.
        const crest = smoothstep(0.62, 1.0, waveT).mul(aWaveV);
        const riverness = smoothstep(float(0.04), float(0.5), fmag);
        const foam = crest.mul(0.6).mul(float(1.0).sub(riverness));

        // Uferlinien-Schaum aus der Tiefe: ein heller Saum genau am Wasser-Rand, pro Pixel terrain-folgend.
        // Glitzer glatt (0.8 + 0.2·noise) — stärkere Speckel-Varianz machte das Band als distinkte Textur lesbar.
        const shoreSparkle = float(0.8).add(vnoise(xz.mul(0.5).add(uTime.mul(0.2))).mul(0.2));
        // Der Schaum-Saum sitzt an der Uferlinie UND ist auf echte flache Tiefe gegated (`realShallow`:
        // aDepth < uDepthFoam m) → nur die echte Kante schäumt, nicht der ganze flache Fluss.
        const realShallow = float(1.0).sub(smoothstep(float(0.0), uDepthFoam, aDepthV));
        // Das Ufer-Band des Schaums: der optische Weg unter dem Ufer-Maß des Gesetzes (WASSER_GESETZ.schaum.ufer,
        // 0,26 m), weiche Rampe, Spitze 0,3.
        const foamShore = float(1.0).sub(smoothstep(float(0.0), float(WG.schaum.ufer), wegM));
        const depthFoam = foamShore.mul(realShallow).mul(shoreSparkle).mul(0.3);
        // Detail-Fade mit der Kamera-Distanz (70 → 200 m): die hochfrequenten Schaum-Strähnen + Schimmer-
        // Noise aliasen ab ~100 m zu Moiré. Basis-/Tiefen-Farbe und Sonnen-Glitzern bleiben. Render-only.
        const camDist = length(cameraPosition.sub(vWorldPos));
        // V18.373 — der Fade greift früher (70→45 m): das hochfrequente Kräuselungs-/Schaum-Detail
        // beruhigt sich schon im Mittelfeld (das konzentrische Fluss-Moiré) statt erst fern.
        const detailFade = float(1.0).sub(smoothstep(float(45.0), float(190.0), camDist));
        // Wildwasser: steile Wasser-Oberfläche (aSlope ab 1.2, Vorhang ~4 voll) schäumt weiß — nah als
        // Strähnen (riverS1) auf klarem Wasser (Basis 0.25, kein Vollverputz), fern flach-weiß (das Makro-
        // Feature bleibt, nur das Mikro-Detail fadet). Moderate Hänge bleiben klares Wasser.
        const whitewater = smoothstep(float(1.2), float(3.2), aSlopeV).mul(
            float(0.25).add(riverS1.mul(0.75).mul(detailFade))
        );
        // V14-Emotions-Haken: uEmotion > 0 hebt den Schaum des GESETZES an (die Welt atmet im Wasser: Ufer, Kamm, Wildwasser
        // schäumen bis doppelt), nie Schaum, wo das Gesetz keinen hat; 0 = das Bild des Gesetzes. Bis K16 legte die Stimmung
        // + 0,25 · uEmotion über JEDES Wasser — der ruhige Fluss trug bei der Boot-Stimmung 0,9 ein Schaum-Grau (Makro 300 m
        // Luma 0,387 gegen den Ring 0,106), das der Blick des Wassers (`_wasserBlick`) nicht kennt.
        const foamD = clamp(max(max(foam, depthFoam).mul(detailFade), whitewater).mul(uEmotion.add(1.0)), 0.0, 1.0);

        // Flow-ausgerichtete Mikro-Kräuselung der NORMALE (Fragment-Stage): das Sonnen-Glitzern wandert
        // stromab. Bewusst KEIN Vertex-Displacement (Narben-Wand: kein Querschnitt, keine Naht).
        // Advektiertes Mehr-Oktav-Noise statt `sin(dot(xz,fdir))` (parallele Glitzer-Linien), dieselben zwei Lagen
        // der Fluss-Phase; Amplitude ∝ `fmag` (0 im See) × `detailFade`.
        // Flow-Kräuselung über der Mesh-Nyquist (~2 m): 0.14 ≈ 7 m, 0.32 ≈ 3 m, Amplitude 0.2, `detailFade`
        // 45 m — glättet Fragment-Aliasing auf ruhigem/Rand-Wasser. Das Kern-Muster steiler Läufe sitzt
        // nicht hier, sondern an der Fresnel/Steilflächen-Normale (s. `fres`-Block). Shader-only.
        const glitzerLage = (q) => vnoise(q.mul(0.14)).add(vnoise(q.mul(0.32).add(11.3)).mul(0.35));
        const flowRipple = mix(glitzerLage(advA), glitzerLage(advB), phaseBlend)
            .sub(0.675)
            .mul(0.2)
            .mul(fmag)
            .mul(windF)
            .mul(detailFade);
        const nFlow = normalize(n.add(vec3(fdir.x.mul(flowRipple), float(0.0), fdir.y.mul(flowRipple))));
        const viewDir = normalize(cameraPosition.sub(vWorldPos));
        const { eigen, fres } = this._wasserBlick(TSL, WG, {
            n: nFlow,
            viewDir,
            T,
            koerper: koerperAlbedo,
            irr: uIrr,
            sunCol: uSunCol,
            sunDir: uSunDir,
            light: uLight,
        });
        const fw = foamD.mul(0.7);
        // DIE DECKUNG (Standard-Blending: Bild = C·α + Grund·(1−α)): der Grund kommt mit T·(1−F)·(1−fw) durch, also
        // α = 1 − T·(1−F)·(1−fw) und C = (fw·Schaum + (1−fw)·eigen) / α — am Ufer scheint der Grund (α → F),
        // im Tiefen deckt der dunkle Körper, unter flachem Winkel der Himmel (F → 1). α ≥ F ≥ 0,02: kein Pol.
        const alpha = float(1.0).sub(T.mul(float(1.0).sub(fres)).mul(float(1.0).sub(fw)));
        const farbe = mix(eigen, uFoam.mul(uIrr), fw).div(max(alpha, float(1e-3)));

        // Die Luft legt der EINE Luft-Knoten auf (`scene.fogNode`, mat.fog) — kein eigener Wasser-Nebel.

        // Dünnes Wand-Bluten pro Pixel cullen: optischer Weg < uMinDepth (m) → Alpha 0, das Fragment fällt per
        // mat.alphaTest weg. Bei uMinDepth = 0 unverändert; tiefes Wasser bleibt.
        const alphaCulled = cond(wegM.lessThan(uMinDepth), float(0.0), alpha);

        const mat = new THREE.MeshBasicNodeMaterial();
        mat.positionNode = pd;
        mat.colorNode = vec4(farbe, alphaCulled);
        mat.transparent = true;
        // V13.9 — Cull-Schwelle: Fragmente mit Alpha≈0 (oben gecullt) werden verworfen. 0.0001 liegt weit unter
        // dem minimalen echten Wasser-Alpha (F ≥ 0,02), discardet also NUR die gecullten.
        mat.alphaTest = 0.0001;
        // V9.49-c — depthWrite an: das vereinte Wasser-Mesh schreibt Tiefe,
        // also kann nichts mehr durch eine andere Wasserfläche scheinen.
        mat.depthWrite = true;
        // V9.49-f — polygonOffset: an streifender Schnitt-Linie (flaches
        // Wasser ⟂ sanft geneigtes Terrain) wäre sonst Flimmern → Wasser
        // minimal in Tiefe schieben, opakes Terrain gewinnt Gleichstände.
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = 1;
        mat.polygonOffsetUnits = 1;
        // Wasser ist eine einseitige FLÄCHE: die Iso-Wicklung zeigt nach INNEN → BackSide zeigt die
        // Oberseite von oben, von unten wird sie gecullt (kein Wasser unter der Karte). Den Unterwasser-
        // Blick trägt der Voll-Bild-Tint (playerEyesUnderwater), nicht das Mesh.
        mat.side = THREE.BackSide;

        this.state.hydroSurfaceUniforms = {
            time: uTime,
            flowSpeed: uFlowSpeed,
            flowPeriod: uFlowPeriod,
            foam: uFoam,
            sunDir: uSunDir,
            irr: uIrr,
            sunCol: uSunCol,
            light: uLight,
            // emotion ist der V14-Haken.
            emotion: uEmotion,
            minDepth: uMinDepth,
            depthFoam: uDepthFoam,
            lakeRipple: uLakeRipple,
            wind: uWind,
        };
        // UNIFORM-HEIMAT: alle Takt-Uniforms des Wassers sind geteilt — je Render EIN Upload statt eines Vergleichs je Objekt
        this._uniformHeimatTeilen(this.state.hydroSurfaceUniforms);
        this.state.hydroSurfaceMaterial = mat;
        return mat;
    }
}
