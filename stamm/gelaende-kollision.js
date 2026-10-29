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
                    stoff: part.material,
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
        return { minX, maxX, minZ, maxZ, topY, botY, stoff: part.material };
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
        // DER KAMIN DES GEBAUTEN HAUSES (B3c): kennt der Eintrag seine Spitze noch nicht (das Solo-Haus: Vorschau, KI, Werkstatt —
        // der Slot des Dorfs bringt sie aus dem Export), liest er sie aus der Hülle (`kamin` [x, y, z] haus-lokal, null = kein
        // Kamin) und tritt mit „rauch" ins Verzeichnis; das Nein reist wie jede Spitze durch den Save (`chimney: null`).
        if (entry.chimney === undefined && huelle.kamin !== undefined) {
            const k = huelle.kamin;
            if (Array.isArray(k) && Number.isFinite(k[0]) && Number.isFinite(k[1]) && Number.isFinite(k[2])) {
                entry.chimney = { x: k[0], y: k[1], z: k[2] };
                entry.userData = entry.userData || {};
                entry.userData.rauchQuelle = entry.chimney;
            } else entry.chimney = null;
            this._blockerNetzSetzen(entry);
        }
        // DIE TÜR DES GEBAUTEN HAUSES (bauen.K5): ebenso die Tür-Zeile (`tuer`, haus-lokal, null = keine Haustür) — mit ihr
        // öffnet der Tür-Takt (`_tickHausTueren`) die Tür des Solo-Hauses dem Spieler wie die des Dorfs, und nach dem Reload
        // trägt die Kern-Hülle die Tür-Lücke, bis die Studio-Hülle liefert; sie reist durch den Save.
        if (entry.tuer === undefined && huelle.tuer !== undefined) entry.tuer = huelle.tuer;
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

    // DAS GESETZTE HAUS IST EIN SLOT SEINES PLANS (S4 · bauen.K2): ein Haus ohne Ort (gesetzt vom Spieler, der KI, der Vorschau
    // am Tor, einer Probe) fragt beim Setzen (`spawnArchitecture`) sein Gesetzbuch nach seinem Slot (Kanal "slot-plan", fachwerk
    // `slotPlan`: Mass-Bau, Tür, Grundfläche und Grund-Datum mit der Gestalt und dem Stempel, aus denen der Worker es baut —
    // dieselbe Slot-Zeile wie der Export des Dorfs) und legt als Ein-Slot-Ort den Erdbau seines Plans v2 (fachwerk `ortPlan` im
    // Ort-Faden, `_ortWahlImFaden` an genau seinem Ort): die Platte der Grundfläche, den Grund samt Keller und den Vorplatz vor
    // der Tür — byte-derselbe Erdbau wie der Dorf-Slot derselben Gestalt, auf dem Boden seines Fußes (Position − 0,5, `sl.y`;
    // die Gasse eines Dorfs fehlt ihm). Ein Haus auf dem Erdbau eines Orts trägt ihn schon. Bis bauen.K2 legte er nur den Grund
    // (`grundPlan`): der Vorplatz entstand nur im Dorf, am Hang endete die Türtreppe im Gefälle. Der Slot rechnet im Faden als
    // Kopf (die Bahn ohne Arbeit), nie im Haupt-Faden: dort malte sein erster Ruf die Karten des Studios (1,18 s). Bis S4-N2
    // las er die Hülle des GEBAUTEN Hauses: das Vorschau-Haus am Tor (gesetzt bei 2,1 s, Radeon kalt) legte ihn bei 8,2 s und
    // warf 6 schon gebaute Chunks am Spawn neu. Ein Haus, das vor dem Buch gesetzt wurde (der Reload mit kaltem Buch), fragt,
    // sobald das Buch steht (`_foundryIngestBook`); ein gelegter Erdbau reist im Save. Ein Haus in Welt-Skala ≠ 1 fällt laut:
    // der Plan rechnet in den Metern des Gesetzbuchs.
    // EIN GRUND-DATUM (bauen.K2 Staffel 2): nur ein Haus, dessen Grund sein Ort schon trägt (der Slot eines Dorfs, ein Grund mit
    // der Mitte auf dem Haus), legt keinen — jedes andere legt seinen, auch auf der Gasse, dem Platz oder dem Vorplatz eines
    // Orts. Bis hier legte ein Haus auf irgendeinem Erdbau keinen (`_ortFrei`): auf der Gasse blieb sein Keller Erde, der Gang
    // die Treppe hinab endete auf der Diele (gate:haus-welt W11, Fuß −0,01 m statt −2,28 m im Keller).
    _hausGrundSetzen(entry) {
        const pos = entry && entry.position;
        const art = pos ? this._grundrissGesetz(entry.type) : null;
        const offen = this._grundOffen || (this._grundOffen = new Set());
        if (!art || art.rec.kind !== "haus" || offen.has(entry)) return false;
        const E = this._erdbauLage();
        const Z = globalThis.__gelaendeCore.ERDBAU.zelleM;
        const da = E && E.grundZellen.get((Math.floor(pos.x / Z) + 32768) * 65536 + (Math.floor(pos.z / Z) + 32768));
        if (da && da.some((i) => Math.abs(E.gruende[i].cx - pos.x) < 0.05 && Math.abs(E.gruende[i].cz - pos.z) < 0.05))
            return false;
        const key = `haus:${Math.round(pos.x * 100)},${Math.round(pos.z * 100)}`;
        const wm = this.state.worldMeta;
        const gestalt = this._foundryGestaltFor(entry, art.preset);
        const f = this._foundry;
        if ((wm && wm.erdbau && wm.erdbau[key]) || gestalt == null || !f || !f.ready || !f.worker) return false;
        if (this._foundryWorldScaleMatrix(art.preset).elements[0] !== 1) {
            this.log(
                `HAUS: „${entry.type}" steht in Welt-Skala ≠ 1 — sein Slot rechnet in Gesetzbuch-Metern (fail-closed)`,
                "ERROR"
            );
            return false;
        }
        const phi = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
        const msg = { type: "slot-plan", presetId: art.preset, seed: gestalt, phi };
        const ov = this._artifactStudioOv(entry);
        if (ov) msg.ov = ov;
        offen.add(entry);
        const wort = "FOUNDRY TIMEOUT: slot-plan(" + art.preset + ") nach 45 s Arbeit ohne Reply → null";
        const steht = () => this.state.architectures.includes(entry);
        return this._foundryAuftrag(f, "grd-", msg, this._foundryRang(0, true), 45000, wort)
            .then((sl) => {
                if (!sl || !steht()) return null;
                const plan = { seed: gestalt, name: entry.type, slots: [Object.assign(sl, { y: pos.y - 0.5 })] };
                return this._ortWahlImFaden(plan, { x: pos.x, z: pos.z }, null, true);
            })
            .then((v2) => {
                offen.delete(entry);
                if (!v2 || !steht()) return false;
                if (v2.wasserSlots)
                    this.log(
                        `HAUS: das Wasser nimmt den Slot von „${entry.type}" — sein Plan legt keinen Grund`,
                        "WARN"
                    );
                return this._erdbauSetzen(key, v2.erdbau);
            })
            .catch((e) => {
                offen.delete(entry);
                this.log(`HAUS: der Plan von „${entry.type}" fiel im Ort-Faden — ${e && e.message}`, "ERROR");
                return false;
            });
    }

    // DIE FREMD-SLOTS UM DEN ORT o (bauen.K2 Staffel 2): je gesetztem Haus, dessen Platte bis R an o reicht, die Platte seines
    // Grundrisses samt Saum aus seinem EIGENEN Erdbau (`haus:`, `_hausGrundSetzen` — EIN Grund-Datum, es reist im Save und
    // zum Gast), in der Reihe des Erdbaus. Leser: die Ort-Wahl (`_ortWahlImFaden` → fachwerk `ortPlan` ctx.fest).
    _ortFest(o, R) {
        const E = (this.state.worldMeta && this.state.worldMeta.erdbau) || {};
        const out = [];
        for (const k of Object.keys(E)) {
            const p =
                k.startsWith("haus:") &&
                Array.isArray(E[k]) &&
                E[k].find((q) => q.art === "platte" && q.vorplatz == null);
            if (p && Math.hypot(p.cx - o.x, p.cz - o.z) <= R + p.ex + p.ez)
                out.push({ cx: p.cx, cz: p.cz, phi: p.phi, ex: p.ex, ez: p.ez });
        }
        return out;
    }
    // DER FREMD-SLOT WIRKT (bauen.K2 Staffel 2): legt oder nimmt die Welt den Erdbau eines gesetzten Hauses (`haus:`), plant jeder
    // Ort neu, der Welt ist und dessen Weg seine Platte betritt (fachwerk `festWeg`) oder um sie lief (`fest` seines Plans) — nie
    // jeder Ort, in dessen Radius es steht (Gebot 7: die Kosten an der Änderung). Legt sie einen Ort, plant er neu, wenn ein Weg
    // seines Plans ein Haus seines Ortsradius betritt (seine Wahl rechnete vor ihm: der Vorrat) oder der gelegte Erdbau nicht
    // der seines Plans ist (die Wiederkehr nach dem Reload). Ortsradius: die Slots + 16 m wie die Ort-Wahl. Leser:
    // `_erdbauSetzen`, `_erdbauGrundFaellt`, `_ortWahl`.
    _ortFremdPruefen(key, splats) {
        const [P, E, FC] = [
            this._ortPlaene,
            this.state.worldMeta && this.state.worldMeta.erdbau,
            globalThis.__fachwerkCore,
        ];
        const reich = (v) => Math.max(0, ...v.slots.map((s) => Math.hypot(s.x || 0, s.z || 0) + 16));
        const p = key.startsWith("haus:") && splats && splats.find((q) => q.art === "platte" && q.vorplatz == null);
        if (p && E && E[key]) this._ortKernAkt(p, reich); // das gesetzte Haus wird Kern eines Rings (siedlung.K4 Staffel 2)
        for (const [k, v] of P && E ? P : [])
            if (E[k] && (p ? k : key) === k) {
                const um = (f) => FC.festWeg(v, f) || (v.fest || []).some((g) => g.cx === f.cx && g.cz === f.cz);
                const alt = v.fest && E[k] !== v.erdbau && JSON.stringify(E[k]) !== JSON.stringify(v.erdbau);
                if (p ? um(p) : alt || this._ortFest(v.ort, reich(v)).some((f) => FC.festWeg(v, f)))
                    this._ortNeuPlanen(k);
            }
    }
    // DIE GASSE WEICHT DEM GESETZTEN HAUS (bauen.K2 Staffel 2): der Ort `key`, der Welt ist (sein Erdbau liegt), rechnet seinen
    // Plan v2 neu — derselbe Plan (seine Slots tragen ihren Boden `y`, seine Wege den Lauf des Exports `lauf`), dieselbe Wahl
    // im Ort-Faden an genau seinem Ort mit den Fremd-Slots seines Umkreises, die Höhe ohne seinen eigenen Erdbau (`ohne`: wie
    // bei seiner Wahl, bevor er lag). Weicht ein Weg, wird der neue Plan an derselben Stelle Welt: sein Erdbau an seinem Platz
    // in der Reihe (es wirken die Splats, die gingen und kamen, `_erdbauWirkt`), das Objekt des Plans selbst (Erlebnis, Zug,
    // Vorrat und Bewohner halten es), die Formen der Wege-Karte (`_stlWegeBuild` an der Stelle der alten) und das Netz der
    // Bewohner. Je Ort ein Lauf zur Zeit (`_ortNeuOffen`, die Linse wartet auf ihn), ein weiterer Wunsch rechnet danach.
    // DER ORT WÄCHST (siedlung.K4 Staffel 2) auf demselben Weg: `neu` ist der Export seines neuen Jahrs (statt seines eigenen
    // Plans), `vorTausch(alt, v2)` nimmt vor dem Tausch, was der neue Plan nicht trägt (`_ortWaechst`); true = der Plan ist Welt.
    _ortNeuPlanen(key, neu, vorTausch) {
        const q = this._ortNeuOffen || (this._ortNeuOffen = new Map());
        const lauf = (q.get(key) || Promise.resolve())
            .then(() => this._ortNeuRechnen(key, neu, vorTausch))
            .catch((e) => this.log(`ORT: ${key} rechnet nicht neu — ${e && e.message}`, "ERROR"));
        q.set(key, lauf);
        lauf.then(() => q.get(key) === lauf && q.delete(key));
        return lauf;
    }
    async _ortNeuRechnen(key, wuchs, vorTausch) {
        const [alt, wm] = [this._ortPlaene.get(key), this.state.worldMeta];
        const liegt = alt && wm.erdbau[key];
        if (!liegt) return false;
        // der Plan ohne seine Ausgabe: ohne Erdbau und Fremd-Slots, die Wege ohne Profil (die Wahl rechnet sie neu)
        const ohne = (o, weg) => (weg.forEach((k) => delete o[k]), o);
        const plan = wuchs || ohne(Object.assign({}, alt), ["version", "erdbau", "fest", "wasserSlots"]);
        if (!wuchs) plan.roads = alt.roads.map((rd) => ohne(Object.assign({}, rd), ["ys", "bruecken"]));
        let ab = 0; // die Stelle seines Erdbaus in der Reihe (`_erdbauRoh`)
        for (const k of Object.keys(wm.erdbau)) {
            if (k === key) break;
            if (Array.isArray(wm.erdbau[k])) ab += wm.erdbau[k].length;
        }
        const neu = await this._ortWahlImFaden(plan, { x: alt.ort.x, z: alt.ort.z }, null, true, [
            ab,
            ab + liegt.length,
        ]);
        if (!neu || this._ortPlaene.get(key) !== alt || wm.erdbau[key] !== liegt) return false;
        if (vorTausch) vorTausch(alt, neu);
        const sig = (l) => new Set(l.map((p) => JSON.stringify(p)));
        const [a, b] = [sig(liegt), sig(neu.erdbau)];
        const wirkt = liegt
            .filter((p) => !b.has(JSON.stringify(p)))
            .concat(neu.erdbau.filter((p) => !a.has(JSON.stringify(p))));
        for (const k of Object.keys(alt)) if (!(k in neu)) delete alt[k];
        Object.assign(alt, neu);
        wm.erdbau[key] = neu.erdbau; // an seinem Platz in der Reihe der Orte
        if (!wirkt.length) return !!wuchs;
        this._erdbauWirkt(wirkt, this._erdbauAmWasser(globalThis.__gelaendeCore.erdbauNormal(wirkt)));
        const wk = this.state.wegeKarte;
        const statt = wk ? wk.siedlungen.findIndex((x) => x.plan === alt) : -1;
        if (statt >= 0) {
            const [b0] = wk.siedlungen.splice(statt, 1);
            this._grundrissFaellt(b0.x0, b0.z0, b0.x1, b0.z1); // die alte Fläche fällt aus der Natur-Wand
            this._stlWegeBuild(alt, alt.ort, null, true);
            for (const st of wk.stufen) if (st.zentriert) this._wegeStufeMalen(st); // der EINE Neu-Maler
            this._nahWieseNeuIn(b0.x0, b0.z0, b0.x1, b0.z1);
        }
        for (const S of (this._bewohnerSiedlungen || new Map()).values())
            if (S.plan === alt) S.netz = S.netzGrund = null;
        return true;
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
        // eine geschlossene Box (beide Achsen ≥ eine Zelle) kann stauen: die Werke des Staus (`_stauWorkClusters`) lesen die
        // Hülle neu — nach dem Reload bekommt der Damm sie erst nach seinem Eintrag (die Liste und ihre Länge stehen da schon)
        const zelle = this._voxelChunkConfig(0).step;
        if (entry.blockerAABBs.some((b) => Math.min(b.maxX - b.minX, b.maxZ - b.minZ) >= zelle))
            this._stauClusterCache = null;
    }

    // DIE FUGE (K24-N1): die Oberkante einer Box, auf der eine Box DESSELBEN Werks sitzt — sie beginnt höchstens
    // PLAYER_GROUND_SNAP über ihr, steigt über sie, deckt ihre Mitte, und der Rand daneben ist schmaler als der Wand-Radius
    // der Kapsel —, ist keine Fläche: die Fuge zweier Stamm-Abschnitte, zweier Fels-Lagen, der Pfosten unter dem Bogen. Sie
    // trägt keinen Leib (`gedeckt`; die Auflage der Kapsel `_resolveCapsuleVsAABB` und die des Tiers `_kreaturAuflage`
    // übergehen sie). Eine Treppe bleibt Treppe: die nächste Stufe deckt nie die Mitte der vorigen. Gedrehte Boxen messen im
    // Rahmen der deckenden (`obb`). Vorher stand jeder Leib, der einen Baum berührte, auf der ersten Stamm-Fuge in der Box
    // darüber (gate:koerper-stand K4: das Tier stieg an einer Tanne 0,6 m je Takt, jede der 2803 Fugen trug).
    // DER STAB (siedlung.K1): eine Box, deren Grundfläche schmaler ist als ein Fuß (`PLAYER_STAB`), trägt ebenso keinen
    // Leib — Brüstung, Geländer, Türblatt bleiben Wand. Vorher stieg die Kapsel auf jeder Treppe neben der Schacht-Brüstung
    // auf deren Holm (Hub 0,56–0,59 m in einem Schritt, gate:haus-welt W10).
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
            const ob = a.obb;
            let gedeckt =
                (ob ? 2 * Math.min(ob.hx, ob.hz) : Math.min(a.maxX - a.minX, a.maxZ - a.minZ)) < AnazhRealm.PLAYER_STAB;
            let eckenDa = false;
            for (const b of gedeckt ? [] : boxes) {
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
        this._blockerWacheMelden(entry._blockerHuelle);
        this._blockerNetzLoesen(entry);
        if (this._blockerNetzStand) this._blockerNetzStand.beweger.delete(entry);
        entry._blockerGen = 0;
    }

    // Ein Eintrag, dessen Position nach dem Eintritt wandert (das gerittene Werk folgt seinem Reiter in x/z, `_rittSchritt`):
    // sein Platz steht nicht mehr, wo er gestempelt wurde — die Frage nach Plätzen prüft ihn direkt, bis er den Bestand verlässt.
    _blockerBewegt(entry) {
        const N = this._blockerNetz();
        if (entry._blockerGen === N.gen) N.beweger.add(entry);
        this._cullWecken(entry); // der Cull fragt ihn je Gang (er schläft nie mehr, `tickArchitectureCulling`)
    }

    // Die Zellen eines Eintrags aus der Hülle seiner Boxen (die alten vorher gelöst; außerhalb des Bestands keine).
    _blockerNetzSetzen(entry) {
        const N = this._blockerNetz();
        this._blockerWacheMelden(entry._blockerHuelle);
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
        const fh = entry._fluegelHuelle; // der Kreis, den die Flügel beim Schwenk überstreichen (`_fluegelLeib`)
        if (fh) [x0, x1, z0, z1] = [Math.min(x0, fh[0]), Math.max(x1, fh[1]), Math.min(z0, fh[2]), Math.max(z1, fh[3])];
        entry._blockerHuelle =
            Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(z0) && Number.isFinite(z1)
                ? [x0, x1, z0, z1]
                : null;
        entry._blockerZellen = this._blockerZellenEin(N.zellen, entry, x0, x1, z0, z1);
        this._blockerWacheMelden(entry._blockerHuelle);
    }

    // DER LEIB DES FLÜGELS (leib.K4): ein Tür- oder Tor-Flügel zeichnet als eigene Instanz (das Blatt mit Scharnier `tuer`, auch
    // als Instanz eines anderen, `_foundryFluegelInstanz`), die sich ums Scharnier dreht (`_tickTorFluegel`), und trug keine
    // Blocker-Box — die Kamera-Kugel ging durch das offene Blatt (gate:kamera-leib K4 am haus_alemannisch: Bau-Pixel im
    // Nahbereich in 5 Proben). Seine Kollision ist dieselbe Gestalt, die gezeichnet wird: die Hülle seiner Geometrie im Rahmen
    // des geschlossenen Blatts (um die gebackene Offen-Pose `tuer.offen` ums Scharnier zurück, dort liegt es achsparallel),
    // gesetzt mit der GEZEICHNETEN Instanz-Matrix als gedrehte Box (`obb`, die Form der Haus-Hülle). Gerufen, wo die Slots
    // entstehen (`entry.instSlots`, dort sammelt er die Flügel, `entry._fluegel`, die Hülle je Blatt und den Kreis, den es beim
    // Schwenk überstreicht — liegt der außerhalb der gestempelten Hülle, stempelt das Netz den Eintrag neu), und `gedreht` nach
    // jedem Schwenk (`_tickTorFluegel`).
    _fluegelLeib(entry, gedreht) {
        const T = THREE;
        const slots = entry.instSlots;
        const neu = !gedreht || entry._fluegelSlots !== slots;
        if (neu) {
            const groups = this.state.archInstanceGroups;
            const fl = [];
            for (const s of slots || []) {
                const g = groups && groups.get(s.key);
                const t = s.tuer || (g && g.tuer);
                if (g && t) fl.push({ g, ref: s, tuer: t });
            }
            entry._fluegelSlots = slots;
            entry._fluegel = fl.length ? fl : AnazhRealm.KEIN_FLUEGEL;
        }
        entry._fluegelBoxen = AnazhRealm.KEIN_FLUEGEL;
        if (!entry._fluegel.length) return;
        const m = this._fluegelM || (this._fluegelM = new T.Matrix4());
        const out = [];
        let fh = [Infinity, -Infinity, Infinity, -Infinity];
        for (const f of entry._fluegel) {
            const t = f.tuer;
            if (f.g.shadowTwin || !(f.ref.slot >= 0)) continue;
            if (!f.kasten) {
                const zu = new T.Matrix4()
                    .makeRotationY(-(Number.isFinite(t.offen) ? t.offen : 0))
                    .setPosition(t.hx || 0, 0, t.zf || 0)
                    .multiply(new T.Matrix4().makeTranslation(-(t.hx || 0), 0, -(t.zf || 0)));
                if (t.basis) zu.multiply(t.basis);
                const pos = f.g.mesh.geometry.attributes.position;
                const v = new T.Vector3();
                f.kasten = new T.Box3();
                for (let i = 0; i < pos.count; i++)
                    f.kasten.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(zu));
                f.zurueck = zu.invert();
            }
            f.g.mesh.getMatrixAt(f.ref.slot, m).multiply(f.zurueck);
            const e = m.elements;
            const k = f.kasten;
            const sx = Math.hypot(e[0], e[1], e[2]);
            const sz = Math.hypot(e[8], e[9], e[10]);
            const c = e[0] / sx;
            const s = -e[2] / sx;
            const hx = ((k.max.x - k.min.x) / 2) * sx;
            const hz = ((k.max.z - k.min.z) / 2) * sz;
            const hy = ((k.max.y - k.min.y) / 2) * Math.hypot(e[4], e[5], e[6]);
            const mx = (k.min.x + k.max.x) / 2;
            const my = (k.min.y + k.max.y) / 2;
            const mz = (k.min.z + k.max.z) / 2;
            const cx = e[0] * mx + e[4] * my + e[8] * mz + e[12];
            const cy = e[1] * mx + e[5] * my + e[9] * mz + e[13];
            const cz = e[2] * mx + e[6] * my + e[10] * mz + e[14];
            if (!(hx > 1e-4 && hz > 1e-4 && hy > 1e-4 && Number.isFinite(cx + cy + cz))) continue;
            const ex = hx * Math.abs(c) + hz * Math.abs(s);
            const ez = hx * Math.abs(s) + hz * Math.abs(c);
            out.push({
                minX: cx - ex,
                maxX: cx + ex,
                minZ: cz - ez,
                maxZ: cz + ez,
                topY: cy + hy,
                botY: cy - hy,
                obb: { cx, cz, c, s, hx, hz },
            });
            if (!neu) continue;
            // das Scharnier in der Welt und der Radius des Blatts um es (die Ecken des geschlossenen Rahmens)
            const ax = e[0] * (t.hx || 0) + e[8] * (t.zf || 0) + e[12];
            const az = e[2] * (t.hx || 0) + e[10] * (t.zf || 0) + e[14];
            const rho =
                sx *
                Math.max(
                    ...[k.min.x, k.max.x].flatMap((x) =>
                        [k.min.z, k.max.z].map((z) => Math.hypot(x - (t.hx || 0), z - (t.zf || 0)))
                    )
                );
            fh = [
                Math.min(fh[0], ax - rho),
                Math.max(fh[1], ax + rho),
                Math.min(fh[2], az - rho),
                Math.max(fh[3], az + rho),
            ];
        }
        if (out.length) entry._fluegelBoxen = out;
        if (!neu || !out.length) return;
        const h = entry._blockerHuelle;
        entry._fluegelHuelle = fh;
        if (!(h && fh[0] >= h[0] && fh[1] <= h[1] && fh[2] >= h[2] && fh[3] <= h[3])) this._blockerNetzSetzen(entry);
    }

    // Die Flügel-Boxen eines Eintrags, solange die Slots stehen, die sie zeichneten (ein Stufen-Wechsel oder Cull nimmt sie)
    _fluegelBoxenVon(e) {
        return (e._fluegelSlots === e.instSlots && e._fluegelBoxen) || AnazhRealm.KEIN_FLUEGEL;
    }

    // DIE WACHE DES NETZES (mensch.K3): wer sich merkt, was er im Netz las (die Wege der Bewohner einer Siedlung), stellt
    // eine Wache über sein Rechteck { x0, x1, z0, z1, stand } in `_blockerWachen`; jede Hülle, die dort ein- oder austritt
    // oder neu gestempelt wird (die Studio-Hülle nach der Kern-Hülle, das Haus des Spielers, der gefällte Baum), zählt ihren
    // Stand hoch — vor dem Stempel die alte Hülle, danach die neue. Der Leser vergleicht den Stand, nie den Bestand; DAS BUCH
    // der Wache (`wechsel`, die letzten 256) trägt je Stand die Hülle, die ihn zählte — ein Leser urteilt nur neu, was sie
    // berührt (`_bewohnerWechsel`, Lehre 25).
    _blockerWacheMelden(h) {
        const W = this._blockerWachen;
        if (!W || !W.size || !h) return;
        for (const w of W)
            if (h[1] >= w.x0 && h[0] <= w.x1 && h[3] >= w.z0 && h[2] <= w.z1) {
                w.stand++;
                const L = w.wechsel || (w.wechsel = []);
                if (L.push(h) > 256) L.shift();
            }
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

    // DIE AUFLAGE AM PUNKT: die Oberkante eines Baus, die einen Fuß bei (x, z) in der Höhe y trägt — dieselbe Regel wie Kapsel
    // und Tier: eine ungedeckte Oberkante im Band [y − unten, y + PLAYER_STEP_UP] über dem Punkt, die höchste trägt (−Infinity
    // ohne sie); `aus.stoff` nennt ihren Stoff. Leser: der Stoff unter dem Körper (`_kontaktStoffAt`) und der Fuß auf dem Bau
    // (`_standSicht`: jeder Fuß auf SEINER Stufe).
    _auflageAt(x, z, y, aus, unten = AnazhRealm.PLAYER_GROUND_SNAP) {
        const nah = this._blockerNahe(x, z, 0, -Infinity, []);
        let top = -Infinity;
        for (const e of nah)
            for (const b of e.blockerAABBs || [])
                if (
                    b.gedeckt !== true &&
                    b.topY >= y - unten &&
                    b.topY <= y + AnazhRealm.PLAYER_STEP_UP &&
                    b.topY > top &&
                    !(this._boxAbstand2(b, x, z) > 0)
                ) {
                    top = b.topY;
                    if (aus) aus.stoff = b.stoff || this._werkStoff(e);
                }
        return top;
    }

    // DER STOFF UNTER DEM KÖRPER (stoffe.K1): die Zeile der Stoff-Tafel, die einen Fuß, eine Pfote oder einen gleitenden Leib bei
    // (x, z) in der Höhe y trägt. Die Auflage eines Baus (`_auflageAt`) trägt den Stoff ihres Teils (`stoff`, aus
    // `_blockerComputePartAABB`; eine Box ohne Teil, die Hülle des Hauses und des Tors, den Stoff ihres Werks, `_werkStoff`);
    // sonst das Eis des gefrorenen Spiegels (`_eisAt`), das Laub des Waldbodens unter dem Kronendach (die EINE Wald-Lese-Stelle
    // `_kronenStreuAt` ≥ ½), die Wiese, wo die Boden-Karte Gras zeichnet (der Grün-Kanal des EINEN Lesers `_bodenSichtAt` ≥ ½),
    // darunter der Stoff des Felds (`_terrainMaterialAt`). Leser: der Schritt-Klang (`_schrittMaterialAt`) und die Reibung des
    // gestoßenen Leibs (`_kreaturStossSchritt`).
    _kontaktStoffAt(x, z, y) {
        const aus = this._kontaktAus || (this._kontaktAus = { stoff: null });
        if (this._auflageAt(x, z, y, aus) > -Infinity) return aus.stoff;
        if (this._eisAt(x, z, y + 0.02, 0.05) !== null) return "eis";
        const lava = this._lavaAt(x, z); // die Decke der Lava (stoffe.K3-2): glühend Glut, erstarrt Stein
        if (lava) return lava.erstarrt ? "stein" : "glut";
        if (this._kronenStreuAt(x, z) >= 0.5) return "laub";
        const grund = {};
        if (this._bodenSichtAt(x, z, grund) !== null && grund.gruen >= 0.5) return "gras";
        return this._terrainMaterialAt(x, z, y);
    }

    // Der Stoff eines Werks: der Stoff seines größten festen Teils (Volumen der Gestalt, `_teilVolumen`; ohne festes Teil sein
    // größtes), gemerkt am Eintrag. Leser: die Auflage ohne Teil (`_kontaktStoffAt`) und der kühlende Brennfleck (`_brennWaerme`).
    _werkStoff(e) {
        if (e._werkStoff !== undefined) return e._werkStoff;
        const bp = this.state.blueprints && this.state.blueprints[e.type];
        const je = {};
        const teile = ((bp && bp.parts) || []).filter((p) => typeof p.material === "string");
        const fest = teile.filter((p) => this._isPartSolid(p));
        for (const p of fest.length ? fest : teile) je[p.material] = (je[p.material] || 0) + this._teilVolumen(p);
        const best = Object.keys(je).sort((a, b) => je[b] - je[a])[0];
        if (!best) this._bruchMelden("STOFF-ZEILE fehlt: das Werk „" + e.type + "“ trägt keinen Stoff");
        return (e._werkStoff = best || null);
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
    // (main-seitig geladen, index.html); memoisiert je Gestalt und Stempel. null ohne Tor/Kern (headless → Alt-Pfad).
    // DAS GESETZ LIEST DEN STEMPEL (KI K2): der Dial-Satz ist `gateParams(Rezept, Stempel)` wie im Bau des Kerns — die Membran
    // (energy, swirl, fractal …) und die Kollision des geprägten Tors folgen seinem Stempel; vorher las sie das Rezept allein,
    // acht Membran-Regler wirkten in keiner Welt und ein geprägtes Tor stieß mit der Hülle des ungeprägten.
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
        const ov = this._artifactStudioOv(entry);
        const key = ov ? gestalt + "|ov:" + this._studioOvHash(ov) : gestalt;
        let g = this._torGesetzMemo.get(key);
        if (!g) {
            const p = core.gateParams(pre, ov);
            g = { gestalt, key, p, mu: core.membranUniforms(p), gesetz: core.MEMBRAN_GESETZ };
            // V18.491.87 — porta messen Host-Leser: Stich/Schub/Dicke/Streckung am Rezept (fail-soft).
            if (typeof core.messen === "function") {
                try {
                    g.messen = core.messen(p);
                } catch (_) {}
            }
            this._torGesetzMemo.set(key, g);
        }
        return g;
    }

    // Das Fahrzeug-Gesetz eines Eintrags (Muster `_torGesetzFor`): reine vehicle-Zahlen (exportDrive:
    // sitz + huelle + Fahrwerte) aus dem SYNCHRON geladenen Kern (Lockstep-fest, nie der async Buch-
    // Stand), via studioGestalt-Zeile oder KIND_POLICY.vehicle.prefix. Domänen-Wand: pre.kind ===
    // "vehicle". Memoisiert je Gestalt und Stempel; null ohne Fahrzeug/Kern (fail-closed → Donor-Pfad). Der Stempel tritt
    // hinter s+fx wie im Bau des Kerns (KI K2): Griff, Feder und Hülle des geprägten Wagens fahren, wie er gebaut ist.
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
        const ov = this._artifactStudioOv(entry);
        const key = ov ? gestalt + "|ov:" + this._studioOvHash(ov) : gestalt;
        let g = this._fahrzeugGesetzMemo.get(key);
        if (!g) {
            // s+fx+Stempel ist exakt der Merge des Baus (vehicle-core buildInstance) —
            // der Kern mergt DEFAULT_P+BASE_P intern davor: EINE Merge-Ordnung.
            const P = Object.assign({}, pre.s, pre.fx, ov);
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
            this._fahrzeugGesetzMemo.set(key, g);
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
// Die Flügel-Boxen eines Eintrags ohne gezeichneten Flügel (`_fluegelBoxenVon`): eine Liste, die nie wächst.
AnazhRealm.KEIN_FLUEGEL = Object.freeze([]);
AnazhRealm._nachBestand = (a, b) => a._blockerSeq - b._blockerSeq;
