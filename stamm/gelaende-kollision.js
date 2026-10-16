class AnazhRealm_gelaende_kollision {
    // ===== ATLAS · Gelaende/kollision — Blocker-Netz · Bau-Hüllen · Teil-AABB =====
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
}
_stammZonen(AnazhRealm, [AnazhRealm_gelaende_kollision]);

// ===== ATLAS · Gelaende/kollision — Außen-Konstanten =====
// DIE NACHBARSCHAFT DER BLOCKER (`_blockerNetz`): die Kante einer Zelle (Meter, eine Zweier-Potenz — die Zelle eines Punkts ist
// exakt `Math.floor(x / 8)`), die Zahl der Zellen, über der ein Eintrag in der Riesen-Zelle steht, und deren Schlüssel (keine
// ganze Zahl, nie der Schlüssel einer Zelle).
AnazhRealm.BLOCKER_ZELLE = 8;
AnazhRealm.BLOCKER_ZELLEN_MAX = 1024;
AnazhRealm.BLOCKER_RIESE = -0.5;
AnazhRealm._nachBestand = (a, b) => a._blockerSeq - b._blockerSeq;
