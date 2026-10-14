class AnazhRealm_Z25b {
    // ===== ATLAS §25b · HUD/EINSTELLUNGEN — Block Koerper =====
    // ===== DIE HÜLLE DES GERITTENEN WAGENS (Welle L, Q5 — Befund 06.10.: im Sattel kollidierte die Reiter-Kapsel r 0,35
    // am Ursprung — der Bug stak 1,97–2,32 m im Fichtenstamm, 2,17 m in der Hauswand, 1,83 m in der Plattform, ein Bär
    // ganz im Wagen). Der Körper des Gesetz-Fahrzeugs ist seine Hülle: ein Rechteck längs der Fahrt (Bug bis Heck, ±halbe
    // Karosserie-Breite), das Band von der Rad-Ebene + Stufe (radR/2, vehicle-core FAHR.schritt.stufeRad) bis zum Dach.
    // Studio-Fahrzeug: exportDrive.huelle; Teile-Werk: seine Hülle (die halbe Spanne längs, die halbe Breite quer). null:
    // kein Fahr-Gesetz (dann trägt die Reiter-Kapsel). ZWEI ROLLEN, EINE FORM (D5): fahrend kollidiert der Wagen als DIESES
    // gedrehte Rechteck; als Hindernis für andere (Spieler-Kapsel, Wesen, ein zweiter Wagen) steht er als seine Teil-Boxen
    // (`_populateBlockerAABBs`, im Ritt bis 0,5 m / 0,1 rad nachgezogen), jede eine gedrehte Box (`obb` aus
    // `_blockerComputePartAABB`), gegen die jeder Löser im Rahmen der Box rechnet — auch `_resolveHuelleVsAABB`.
    _fahrHuelle(entry) {
        if (!entry || !entry._fahr || !entry._fahrSatz || !Number.isFinite(entry._fahr.y)) return null;
        return this._fahrHuelleBau(entry, entry._fahrSatz);
    }
    // DER UMRISS eines Wagens im Fahrt-Rahmen (m): Bug, Heck, halbe Breite, Dach — ein Studio-Wagen aus dem Gesetz seiner
    // Hülle (vehicle-core exportDrive.huelle × Größe), sonst aus der Gestalt des Bauplans. Leser: die Hülle des Ritts und des
    // Platzes (`_fahrHuelleBau`) und die Natur-Wand (`_imWagen`: kein Wurf der Natur in einem Wagen).
    _fahrUmriss(entry) {
        const sc = Number.isFinite(entry.scale) ? entry.scale : 1;
        const fzg = entry._fahrAchseX ? this._fahrzeugGesetzFor(entry) : null;
        const h = fzg && fzg.drive ? fzg.drive.huelle : null;
        if (h && Number.isFinite(h.noseX) && Number.isFinite(h.tailX) && Number.isFinite(h.bw) && h.noseX > h.tailX)
            return {
                bug: h.noseX * sc,
                heck: h.tailX * sc,
                hw: h.bw * sc,
                dach: (Number.isFinite(h.yRoof) ? h.yRoof : 1.3) * sc,
            };
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        const ext = bp ? this._compoundVisualExtent(bp) : null;
        const halb = Number.isFinite(entry._rideHalfLen) ? entry._rideHalfLen : 1;
        return {
            bug: halb,
            heck: -halb,
            hw: ext ? Math.max(0.3, (Math.min(ext.dx, ext.dz) * sc) / 2) : 0.6,
            dach: ext && Number.isFinite(ext.dy) ? Math.max(0.6, ext.dy * sc) : 1.5,
        };
    }

    // Die Hülle aus dem Gesetz (je Eintrag einmal, `mountArchitecture` setzt sie frisch): der Ritt liest sie über
    // `_fahrHuelle`, der Platz eines Wagens, den die Welt hinstellt (`_fahrPlatzFrei`), schon vor der ersten Fahrt.
    _fahrHuelleBau(entry, G) {
        if (entry._fahrHuelleKette) return entry._fahrHuelleKette;
        const { bug, heck, hw, dach } = this._fahrUmriss(entry);
        // die Stufe aus dem Kern (FAHR.schritt.stufeRad × radR des Fahr-Satzes; radR ist Pflicht des Satzes)
        const stufe = AnazhRealm._fahrSchrittGesetz().S.stufeRad * G.radR;
        // Der UMRISS (Fahrt-Rahmen: längs l, quer q, Außen-Normale nl/nq): die vier Ecken, Bug- und Heck-Mitte und je
        // Flanke drei Punkte — wo das Gelände dort steil über die Ebene + Stufe ragt, steht eine Wand.
        const umriss = [];
        const s2 = Math.SQRT1_2;
        for (const [l, nl] of [
            [bug, 1],
            [heck, -1],
        ]) {
            umriss.push({ l, q: 0, nl, nq: 0 });
            umriss.push({ l, q: hw, nl: nl * s2, nq: s2 });
            umriss.push({ l, q: -hw, nl: nl * s2, nq: -s2 });
        }
        for (const t of [0.25, 0.5, 0.75])
            for (const sq of [-1, 1]) umriss.push({ l: heck + (bug - heck) * t, q: sq * hw, nl: 0, nq: sq });
        entry._fahrHuelleKette = {
            bug,
            heck,
            mitte: (bug + heck) / 2,
            hl: (bug - heck) / 2,
            hw,
            dach,
            stufe,
            umriss,
            // der Rahmen dieses Schritts (`_fahrHuelleKontakt` setzt ihn): Bug-Achse, Quer-Achse, Band, Schübe
            fX: 0,
            fZ: 1,
            qX: 1,
            qZ: 0,
            unten: 0,
            oben: 0,
            schub: [],
            schubQuelle: [], // der Gegner je Schub (Bauwerk, Wagen, Leib; null = starr)
            quelle: null,
            eigen: entry.id, // die eigenen Boxen löst die Hülle nie
        };
        return entry._fahrHuelleKette;
    }

    // DIE HÜLLE GEGEN EINE BOX (der Körper-Fall des EINEN Struktur-Lösers `_stepCharacterStructures`, wie die Kapsel
    // `_resolveCapsuleVsAABB`): das Rechteck der Hülle (Mitte an pos + Bug-Achse · mitte) gegen die Box, getrennt auf
    // den vier Achsen (die zwei der Box, Bug, Quer); überlappt die Box das Band der Hülle, schiebt der kürzeste Weg den
    // Wagen heraus (pos mutiert, der Schub reist in h.schub für die Fahrt). DIE GEDREHTE BOX (D5, Welle L — die Haus-Hülle
    // `_hausObb`): ihre Achsen und Halb-Maße sind die der `obb`, die Welt-AABB bleibt
    // der Vorfilter der Leser. Vorher löste die Hülle gegen die Welt-AABB (eine 34° gedrehte Wand 12 × 0,8 m: der Wagen
    // hielt 2,36 m vor der Wand).
    _resolveHuelleVsAABB(box, pos, h) {
        if (!(box.topY > h.unten && box.botY < h.oben)) return;
        const ob = box.obb;
        // die Achsen der Box in der Welt (lokal x → (c, −s), lokal z → (s, c); `_hausObb`) und ihre Halb-Maße
        const b1x = ob ? ob.c : 1;
        const b1z = ob ? -ob.s : 0;
        const b2x = ob ? ob.s : 0;
        const b2z = ob ? ob.c : 1;
        const ex = ob ? ob.hx : (box.maxX - box.minX) * 0.5;
        const ez = ob ? ob.hz : (box.maxZ - box.minZ) * 0.5;
        const cx = pos.x + h.fX * h.mitte - (ob ? ob.cx : (box.minX + box.maxX) * 0.5);
        const cz = pos.z + h.fZ * h.mitte - (ob ? ob.cz : (box.minZ + box.maxZ) * 0.5);
        let best = Infinity;
        let ax = 0;
        let az = 0;
        for (let i = 0; i < 4; i++) {
            const ux = i === 0 ? b1x : i === 1 ? b2x : i === 2 ? h.fX : h.qX;
            const uz = i === 0 ? b1z : i === 1 ? b2z : i === 2 ? h.fZ : h.qZ;
            const rO = h.hl * Math.abs(h.fX * ux + h.fZ * uz) + h.hw * Math.abs(h.qX * ux + h.qZ * uz);
            const rA = ex * Math.abs(b1x * ux + b1z * uz) + ez * Math.abs(b2x * ux + b2z * uz);
            const d = cx * ux + cz * uz;
            const ov = rO + rA - Math.abs(d);
            if (ov <= 0) return; // getrennt
            if (ov < best) {
                best = ov;
                ax = d >= 0 ? ux : -ux;
                az = d >= 0 ? uz : -uz;
            }
        }
        pos.x += ax * best;
        pos.z += az * best;
        h.schub.push(ax * best, az * best);
        if (h.schubQuelle) h.schubQuelle.push(h.quelle || null);
    }

    // DAS GLEITEN AN DER WAND (PM_ClipVelocity, Quake/Source) — DIE Schleife des EINEN Kontakt-Lösers für beide Körper: die
    // Kapsel (`_stepCharacter` 5b) und die Hülle des Wagens (`_fahrHuelleKontakt`; vorher eine Kopie, Gegenprüfung 07.10.).
    // `wand(nx, nz, vx, vz)` meldet am Kandidaten den Kontakt-Punkt {x, y, z} oder null; je Kontaktebene fällt die
    // Normal-Komponente der Geschwindigkeit (n = horizontale Spur der `_fieldGradient`-Außennormale am Kontakt-Punkt), bis
    // SLIDE_CLIP_PLANES Ebenen, jede Iteration am NEUEN Kandidaten; |∇| ≈ 0 oder rein vertikale Normale → fail-closed
    // Voll-Stopp (nie eindringen). Schreibt {x, z, vx, vz} in `aus`.
    _wandGleiten(x0, z0, vx, vz, dt, wand, aus) {
        let nx = x0 + vx * dt;
        let nz = z0 + vz * dt;
        let w = vx !== 0 || vz !== 0 ? wand(nx, nz, vx, vz) : null;
        if (w) {
            const nrm = this._kopplungClipN || (this._kopplungClipN = {});
            let frei = false;
            for (let pl = 0; pl < AnazhRealm.SLIDE_CLIP_PLANES; pl++) {
                this._fieldGradient(w.x, w.y, w.z, nrm);
                const nh = Math.hypot(nrm.x, nrm.z);
                if (!(nrm.mag > 1e-6) || !(nh > 1e-4) || !Number.isFinite(nh)) break; // NaN-Wand
                const nhx = nrm.x / nh;
                const nhz = nrm.z / nh;
                const into = vx * nhx + vz * nhz;
                if (into >= -1e-9) break; // keine Bewegung mehr IN die Ebene → festgefahren
                vx -= nhx * into; // PM_ClipVelocity: die Ebenen-Normal-Komponente fällt
                vz -= nhz * into;
                nx = x0 + vx * dt;
                nz = z0 + vz * dt;
                w = wand(nx, nz, vx, vz);
                if (!w) {
                    frei = true;
                    break;
                }
            }
            if (!frei) {
                nx = x0; // fail-closed: der Voll-Stopp vor der Wand (nie eindringen)
                nz = z0;
                vx = 0;
                vz = 0;
            }
        }
        aus.x = nx;
        aus.z = nz;
        aus.vx = vx;
        aus.vz = vz;
        return aus;
    }

    // DER KONTAKT DER HÜLLE im EINEN Kontakt-Löser (`_stepCharacter` ruft ihn für den gerittenen Gesetz-Wagen statt der
    // Kapsel-Schritte 5b · 6 · 7): (1) GELÄNDE — ragt das Feld an einem Umriss-Punkt steil über Ebene + Stufe (oder auf
    // Brust-Höhe), gleitet der Wagen an der Wand (`_wandGleiten`, dieselbe Schleife wie die Kapsel; sonst steht er); (2) BAUWERKE + INSELN — das Rechteck gegen die Blocker-AABBs im EINEN Struktur-Löser
    // (`_stepCharacterStructures`/`_stepCharacterIslands` mit der Hülle als Körper; ein Stamm dünner als die Rad-Stufe
    // wird überrollt — der Hasel-Trieb hält keinen Wagen, der Kiefern-Stamm schon); (3) KREATUREN — das Rechteck gegen
    // den Leib eines Wesens (`_kreaturLeib`, D2: derselbe Leib, mit dem das Tier gegen jede Hülle löst). Was die Hülle
    // schiebt, nimmt der Fahrt die Normal-Komponente. Liefert {x, z, vx, vz}.
    // DIE WAND DES GELÄNDES an einem Punkt (px, pz) der Hülle über der Ebene `yE` ihrer Räder — EINE Regel für den Kontakt
    // der Hülle (`_fahrHuelleKontakt`) und den Platz eines Wagens (`_fahrStandFrei`): Feld über Ebene + Rad-Stufe ist eine
    // Wand, wenn seine Fläche steiler steht als die Ebenen-Klammer des Kerns (ein Hang, den die Räder nehmen, hebt den Wagen —
    // er hält ihn nicht) und, in Fahrt (wx, wz ≠ 0), dem Wagen zugewandt ist; Feld auf Brust-Höhe ist immer eine Wand.
    // Liefert den Kontakt-Punkt {x, y, z} oder null.
    _fahrGelaendeWand(px, pz, yE, k, wx, wz) {
        const ctx = this._terrainColumnContext(px, pz);
        const yS = yE + k.stufe + 0.02;
        if (this._fieldSolid(px, yS, pz, ctx)) {
            const n = this._fahrHuelleN || (this._fahrHuelleN = {});
            this._fieldGradient(px, yS, pz, n);
            const steilY = Math.cos(AnazhRealm._fahrSchrittGesetz().S.ebeneMax); // die Ebenen-Klammer des Kerns
            if (!(n.mag > 1e-6) || (n.y < steilY && ((wx === 0 && wz === 0) || n.x * wx + n.z * wz < 0)))
                return { x: px, z: pz, y: yS };
        }
        const brust = Math.min(k.dach, 1.2);
        if (this._fieldSolid(px, yE + brust, pz, ctx)) return { x: px, z: pz, y: yE + brust };
        return null;
    }

    _fahrHuelleKontakt(entry, k, x0, z0, vx, vz, dt, meldet = true) {
        const fz = entry._fahr;
        const ry = Number.isFinite(entry._rideYaw) ? entry._rideYaw : 0;
        const fX = Math.sin(ry);
        const fZ = Math.cos(ry);
        const qX = Math.cos(ry);
        const qZ = -Math.sin(ry);
        const tS = Math.tan(fz.steig || 0);
        const tW = Math.tan(fz.wank || 0);
        // die Ebene der Räder um die Lage, an der der Fahr-Schritt sie stellte (die Lage vor diesem Schritt: x0/z0)
        const ebene = (px, pz) => {
            const dx = px - x0;
            const dz = pz - z0;
            return fz.y + tS * (dx * fX + dz * fZ) + tW * (dx * qX + dz * qZ);
        };
        // (1) GELÄNDE: die führenden Umriss-Punkte gegen das Feld. Eine WAND ist Feld über Ebene + Stufe, dessen Fläche
        // steiler steht als die Ebenen-Klammer (ein Hang, den die Räder nehmen, hebt den Wagen — er hält ihn nicht) UND dem
        // Wagen zugewandt ist, oder Feld auf Brust-Höhe. Zeigt die Fläche in die Fahrt, ist sie die Rückseite einer Kuppe
        // (Leben-Schau 07.10., Spaltkante −904/−975: der Rand fällt zum 23-m-Spalt, seine Fläche zeigt mit n·Fahrt 0,97 nach
        // vorn — die Gleit-Schleife fand keine Bewegung in die Ebene und stoppte den Wagen aus 11,44 m/s in EINEM Schritt,
        // Gas danach 0,00 m); die Vertikale des Kerns trägt ihn über die Kante, er fällt.
        const wandAm = (ox, oz, wx, wz) => {
            for (const p of k.umriss) {
                const nx = p.nl * fX + p.nq * qX;
                const nz = p.nl * fZ + p.nq * qZ;
                if (nx * wx + nz * wz <= 0) continue; // nur, wohin die Hülle fährt
                const px = ox + p.l * fX + p.q * qX;
                const pz = oz + p.l * fZ + p.q * qZ;
                const w = this._fahrGelaendeWand(px, pz, ebene(px, pz), k, wx, wz);
                if (w) return w;
            }
            return null;
        };
        // das Gleiten an der Wand ist DIE Schleife des Kontakt-Lösers (`_wandGleiten`, wie die Kapsel in Schritt 5b)
        const gl = this._wandGleiten(x0, z0, vx, vz, dt, wandAm, this._fahrHuelleGl || (this._fahrHuelleGl = {}));
        const nx = gl.x;
        const nz = gl.z;
        vx = gl.vx;
        vz = gl.vz;
        // (2) BAUWERKE + INSELN — der Rahmen dieses Schritts an die Hülle; zwei Durchgänge (eine Ecke zwischen zwei Boxen).
        k.fX = fX;
        k.fZ = fZ;
        k.qX = qX;
        k.qZ = qZ;
        k.unten = fz.y + k.stufe;
        k.oben = fz.y + k.dach;
        k.schub.length = 0;
        k.schubQuelle.length = 0;
        const pos = this._fahrHuellePos || (this._fahrHuellePos = { x: 0, z: 0 });
        pos.x = nx;
        pos.z = nz;
        for (let pass = 0; pass < 2; pass++) {
            this._stepCharacterStructures(pos, 0, 0, 0, k);
            this._stepCharacterIslands(pos, 0, 0, 0, k);
        }
        // DER SCHUB JE SCHRITT IST BEGRENZT (Hangfuß-Falle, Leben-Schau 07.10.: die flache Box eines Glutbrunnens lag unter
        // dem Band der Hülle, bis der Wagen am Hangfuß absank — dann löste der Löser die ganze Überlappung auf einmal und
        // versetzte ihn in EINEM Schritt 0,97 m quer): eine Box nimmt zurück, was der Wagen in DIESEM Schritt in sie hinein
        // fuhr, und entdringt darüber hinaus höchstens eine Rad-Stufe je Schritt (die Stufe der Vertikale, `k.stufe`) — eine
        // tiefe Überlappung löst sich über Schritte, nie als Satz (die Entdringungs-Grenze der Physik-Engines).
        {
            const bx = pos.x - nx;
            const bz = pos.z - nz;
            const bd = Math.hypot(bx, bz);
            if (bd > 1e-9) {
                const hinein = Math.max(0, -((nx - x0) * bx + (nz - z0) * bz) / bd);
                const kappe = hinein + k.stufe;
                if (bd > kappe) {
                    pos.x = nx + (bx * kappe) / bd;
                    pos.z = nz + (bz * kappe) / bd;
                }
            }
        }
        // (3) KREATUREN — das Rechteck gegen den LEIB eines Wesens (D2, Welle L): `_kreaturLeib`, die EINE Größe je Tier, mit
        // der das Tier selbst gegen jede Hülle löst (`_kreaturHuellenKontakt`) — drei Achsen längs seiner Gier (−halb · 0 ·
        // +halb), je Achse sein Radius, die Höhe vom Fuß bis zum Kopf; das Band der Hülle zählt wie eine Box für das Tier
        // (über der Stufe seines Fußes, unter seinem Kopf). Je Achse der nächste Punkt des Rechtecks; liegt die Achse im
        // Rechteck, der kürzeste Weg hinaus. Vorher ein ZWEITER Leib: der Kreis VERHALTEN.separation × bodySize um die
        // Mitte (beim Bären 0,64 m gegen den Leib-Radius 0,19 m — der Wagen hielt 0,46 m vor der Flanke).
        // Der Spieler zu Fuß ist ein Leib wie ein Tier (0710-4): eine Achse, seine Kapsel r PLAYER_WALL_RADIUS, vom Fuß bis
        // über den Kopf — ein rutschender Wagen schiebt ihn nicht durch, er stößt ihn (der eigene, gerittene Wagen nie).
        const wesen = this.state.creatures;
        const pmK = this.state.playerMesh;
        const spielerLeib =
            pmK &&
            pmK.position &&
            !(this.state.player && this.state.player.mountedArch != null) &&
            Math.abs(pmK.position.x - pos.x) <= 12 &&
            Math.abs(pmK.position.z - pos.z) <= 12;
        if ((wesen && wesen.length) || spielerLeib) {
            const leib = this._fahrLeib || (this._fahrLeib = {});
            const stufeTier = AnazhRealm.PLAYER_STEP_UP;
            const koerper = this._fahrLeibKoerper || (this._fahrLeibKoerper = []);
            koerper.length = 0;
            if (wesen) for (const cr of wesen) koerper.push(cr);
            if (spielerLeib) koerper.push(pmK);
            for (const cr of koerper) {
                if (!cr || !cr.position) continue;
                if (Math.abs(cr.position.x - pos.x) > 12 || Math.abs(cr.position.z - pos.z) > 12) continue;
                if (cr === pmK) {
                    const fd = AnazhRealm.PLAYER_FOOT_OFFSET;
                    leib.radius = AnazhRealm.PLAYER_WALL_RADIUS;
                    leib.halb = 0;
                    leib.hoehe = 2 * fd + stufeTier;
                    leib.fx = 0;
                    leib.fz = 1;
                    leib.fuss = cr.position.y - fd;
                } else {
                    this._kreaturLeib(cr, 0, leib);
                    leib.fuss = cr.position.y;
                }
                if (k.oben <= leib.fuss + stufeTier || k.unten >= leib.fuss + leib.hoehe) continue;
                const rc = leib.radius;
                for (let o = leib.halb > 0 ? -1 : 0; o <= (leib.halb > 0 ? 1 : 0); o++) {
                    const dx = cr.position.x + leib.fx * o * leib.halb - (pos.x + fX * k.mitte);
                    const dz = cr.position.z + leib.fz * o * leib.halb - (pos.z + fZ * k.mitte);
                    const l = dx * fX + dz * fZ;
                    const q = dx * qX + dz * qZ;
                    const cl = Math.max(-k.hl, Math.min(k.hl, l));
                    const cq = Math.max(-k.hw, Math.min(k.hw, q));
                    const d = Math.hypot(l - cl, q - cq);
                    let sl = 0;
                    let sq = 0;
                    if (d > 1e-6) {
                        if (d >= rc) continue;
                        sl = (-(l - cl) / d) * (rc - d);
                        sq = (-(q - cq) / d) * (rc - d);
                    } else if (k.hl - Math.abs(l) < k.hw - Math.abs(q)) {
                        sl = -(l >= 0 ? 1 : -1) * (k.hl - Math.abs(l) + rc);
                    } else {
                        sq = -(q >= 0 ? 1 : -1) * (k.hw - Math.abs(q) + rc);
                    }
                    let sx = sl * fX + sq * qX;
                    let sz = sl * fZ + sq * qZ;
                    // Ein Wesen schiebt keinen Wagen: der Schub nimmt höchstens zurück, was der Wagen in DIESEM Schritt auf
                    // das Wesen zu fuhr (läuft es selbst in den stehenden Wagen, bleibt der Wagen stehen — das Ausweichen
                    // ist Sache des Wesens).
                    const sd = Math.hypot(sx, sz);
                    if (sd > 1e-9) {
                        const hin = -((pos.x - x0) * sx + (pos.z - z0) * sz) / sd;
                        const kappe = Math.max(0, Math.min(sd, hin));
                        sx *= kappe / sd;
                        sz *= kappe / sd;
                    }
                    pos.x += sx;
                    pos.z += sz;
                    k.schub.push(sx, sz);
                    k.schubQuelle.push(cr);
                }
            }
        }
        // KEIN SCHUB INS GELÄNDE (Befund 07.10., Fahr-Linse S4: ein beim Remesh auf den Wagen gestreuter Felsbogen schob ihn
        // 3,3 m in den Hang — 2,43 m unter dem Boden, und die Wand-Regel der Vertikale hielt ihn dort für immer): trifft die
        // geschobene Lage eine Wand in Schub-Richtung, bleibt die Hülle am Kandidaten (fail-closed, nie eindringen); der
        // Schub nimmt der Fahrt trotzdem die Komponente in die Berührung.
        const schubX = pos.x - nx;
        const schubZ = pos.z - nz;
        if ((schubX !== 0 || schubZ !== 0) && wandAm(pos.x, pos.z, schubX, schubZ)) {
            pos.x = nx;
            pos.z = nz;
        }
        // DER STOSS (das EINE Impuls-Gesetz, AnazhRealm.STOSS — 0710-2): je Gegner EIN Stoß längs der Summe seiner Schübe
        // (ein Baum trägt 44 Boxen, er stößt einmal). Ein starrer Gegner (Bauwerk, Fels, Baum, Insel) wirft den Wagen mit
        // seiner Stoß-Zahl zurück; ein Wagen und ein Leib bekommen ihren Impuls nach Masse (Kern und Leib), der Wagen behält,
        // was ihm bleibt. Vorher nahm die Hülle der Fahrt nur die Komponente in die Berührung — ein Stopp ohne Folge.
        const ST = AnazhRealm.STOSS;
        const mW = this._fahrMasse(entry._fahrSatz);
        const gegner = this._fahrStossGegner || (this._fahrStossGegner = new Map());
        gegner.clear();
        for (let i = 0; i < k.schub.length; i += 2) {
            const q = k.schubQuelle[i >> 1] || null;
            let g = gegner.get(q);
            if (!g) gegner.set(q, (g = { x: 0, z: 0 }));
            g.x += k.schub[i];
            g.z += k.schub[i + 1];
        }
        let dvEigen = 0;
        let aufprall = 0;
        let stossTags = null;
        for (const [q, g] of gegner) {
            const d = Math.hypot(g.x, g.z);
            if (!(d > 1e-9)) continue;
            const nx = g.x / d; // vom Gegner zum Wagen
            const nz = g.z / d;
            // der Gegner in der Sprache des Gesetzes (`_stossKoerper`: Tier · Spieler zu Fuß · Wagen); keiner davon = starr
            const G =
                q && q !== entry
                    ? this._stossKoerper(q, this._fahrStossGegnerK || (this._fahrStossGegnerK = {}))
                    : null;
            const leib = !!(G && G.art !== "wagen");
            // die RELATIVE Geschwindigkeit längs der Normalen: gleitet der Gegner schon schneller fort, als der Wagen
            // nachkommt, stößt nichts (Befund gate:fahr-leben L5: der Bär rutschte nach dem ersten Stoß fort, die Hülle
            // berührte ihn weiter, und jeder Schritt stieß ihn erneut mit der vollen Fahrt — 7,92 → 1,71 m/s)
            const hinein = -((vx - (G ? G.vx : 0)) * nx + (vz - (G ? G.vz : 0)) * nz);
            if (!(hinein > 0)) continue;
            const mG = G ? G.m : Infinity;
            const e = leib ? ST.stossZahl.leib : G ? ST.stossZahl.wagen : ST.stossZahl.starr;
            // ohne Masse des eigenen Wagens (ein Werk ohne Fahr-Satz) nimmt die Berührung nur die Komponente
            const J = mW > 0 ? AnazhRealm._stossImpuls(mW, mG, hinein, e) : 0;
            const dv = mW > 0 ? J / mW : hinein;
            vx += nx * dv;
            vz += nz * dv;
            if (G) this._stossAuf(G, -nx, -nz, J / mG);
            dvEigen = Math.max(dvEigen, dv);
            if (hinein > aufprall) {
                aufprall = hinein;
                stossTags =
                    leib && G.art === "tier"
                        ? this.computeCreatureCompoundTags(q)
                        : q && q.type && this.state.blueprints && this.state.blueprints[q.type]
                          ? this.computeCompoundTags(this.state.blueprints[q.type])
                          : null;
            }
        }
        if (meldet && aufprall >= ST.ereignisMs) this._stossEreignis(stossTags, dvEigen);
        return { x: pos.x, z: pos.z, vx, vz };
    }

    // DER FAHR-SATZ EINES GESTOSSENEN (das EINE Impuls-Gesetz): ein Werk mit Fahr-Gesetz (Studio-Wagen, Kern-Profil) trägt
    // seine Masse im Fahr-Satz; alles andere ist starr.
    _fahrStossSatz(entry) {
        if (!entry || !entry.position) return null;
        const prof = this._vehicleProfile(entry);
        const G = prof ? this._fahrSatz(entry, prof) : null;
        return G && G.m > 0 ? G : null;
    }

    // DER GESTOSSENE WAGEN (das EINE Impuls-Gesetz): ein geparkter Wagen bekommt seinen Impuls als Fahrt im eigenen Rahmen
    // (vlong/vlat des Kerns) und rutscht im Nachlauf mit der Handbremse (`_fahrNachlauf`), bis er steht.
    // DIE GESCHWINDIGKEIT EINES ANDEREN WAGENS (m/s, Welt-XZ) aus seinem Fahr-Zustand (die Umkehr von _fahrWagenStoss);
    // ein Wagen ohne Fahr-Zustand steht.
    _fahrWagenGeschw(entry) {
        const fz = entry && entry._fahr;
        if (!fz || !Number.isFinite(fz.yaw) || !Number.isFinite(fz.vlong) || !Number.isFinite(fz.vlat)) return null;
        const cy = Math.cos(fz.yaw);
        const sy = Math.sin(fz.yaw);
        return { x: fz.vlong * cy - fz.vlat * sy, z: -fz.vlong * sy - fz.vlat * cy };
    }
    _fahrWagenStoss(entry, G, dvx, dvz) {
        const pl = this.state.player;
        if (pl && pl.mountedArch === entry.id) return;
        const { vc } = AnazhRealm._fahrSchrittGesetz();
        let fz = entry._fahr;
        if (!fz || !Number.isFinite(fz.y)) {
            const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
            const fahrt = entry._fahrAchseX ? ry + Math.PI / 2 : ry; // die Umkehr von _rittGier
            fz = entry._fahr = vc.fahrZustand(entry.position.x, entry.position.z, fahrt - Math.PI / 2);
            vc.fahrStand(fz, G, this._fahrBoden(entry), 0);
            if (!Number.isFinite(fz.y)) return;
        }
        // DIE HAFTUNG DER BREMSE (0710-4): ein abgestellter Wagen steht mit Handbremse — sie nimmt je Sim-Schritt bis zu
        // handDecel · dt eines Stoßes auf (der Kern: G.handDecel), erst der Rest bewegt ihn. Vorher fuhr der Wagen jeden
        // Stoß im selben Schritt, bevor die Bremse griff: ein Spieler, der mit W gegen einen geparkten GT drückte, schob ihn
        // 0,27 m in 4 s (gate:fahr-leben L6).
        const dv = Math.hypot(dvx, dvz);
        const haft = (Number.isFinite(G.handDecel) ? G.handDecel : 0) * AnazhRealm.FIXED_DT;
        if (!(dv > haft)) return;
        const rest = (dv - haft) / dv;
        dvx *= rest;
        dvz *= rest;
        const cy = Math.cos(fz.yaw);
        const sy = Math.sin(fz.yaw);
        fz.vlong += dvx * cy - dvz * sy;
        fz.vlat += -dvx * sy - dvz * cy;
        entry._fahrSatz = G;
        (this._fahrLos || (this._fahrLos = new Set())).add(entry);
    }

    // DAS STOSS-EREIGNIS (das EINE Impuls-Gesetz): ein Aufprall erreicht Kamera und Klang — der Kamera-Ruck über den EINEN
    // Landungs-Dip (_landImpactPending, wie der Treffer) mit dem Sprung der eigenen Fahrt (am leichten Tier klein, am Fels
    // voll), der Klang über das Gesetz klang:SUBSTANZ.treffer (die Substanz des Gegners färbt ihn; stumm ohne Symphonie).
    _stossEreignis(tags, dv) {
        const G = AnazhRealm._arenaGesetz().gefuehl;
        const e = Math.max(0, Math.min(1, dv / AnazhRealm.STOSS.ruckRefMs));
        this.state._landImpactPending = Math.max(
            this.state._landImpactPending || 0,
            G.dipMin + (G.dipMax - G.dipMin) * e
        );
        this._substanzKlang("treffer", tags || {});
    }

    // ===== DER FELD-NATIVE KAPSEL-CHARACTER-CONTROLLER =====
    // Treibt den Spieler aus dem Dichtefeld (`_field*`-Helfer) — deterministisch, kein BVH-Build, ein
    // gecarvter Tunnel ist sofort begehbar. Die Bewegungs-LOGIK bleibt EINE Quelle:
    // `_loopPlayerMovement` schreibt die horizontale Intent-Velocity in `state.playerVel`, dieser
    // Controller liest sie und integriert vertikal/Kollision selbst (vy lebt in `_fieldVy`).
    _stepCharacter(delta, currentTime) {
        const s = this.state;
        const mesh = s.playerMesh;
        if (!mesh || !s.playerVel) return;
        const dt = Math.min(0.1, Math.max(0.0001, delta));
        const footDrop = AnazhRealm.PLAYER_FOOT_OFFSET; // Füße = position.y − footDrop (Box-Unterkante)

        // 1. Velocity lesen: horizontal = die Intent-Velocity aus `_loopPlayerMovement`
        //    (feld-eigen in `state.playerVel`). vy = feld-eigen (`_fieldVy`); ein frischer
        //    Sprung (handleJump schrieb playerVel.y = jumpPower) wird übernommen.
        const vBody = s.playerVel;
        let vx = vBody.x();
        let vz = vBody.z();
        const bvy = vBody.y();
        if (bvy > s._fieldVy + 0.5) s._fieldVy = bvy; // frischer Sprung-Impuls
        let vy = s._fieldVy;

        // 3. WASSER — die EINE Wasser-Wahrheit am Körper (`_koerperWasser`: der Spiegel, den das Auge sieht, über dem
        //    Grund unter dem Körper). Der Körper liegt nach seiner GESTALT im Wasser: er SCHWIMMT, sobald die Säule über
        //    dem Grund seine Brustkorb-Linie übersteigt (`_schwimmBrustM`, koerper-core) — der Auftrieb hält dann die
        //    Wasserlinie am Brustkorb; flacher WATET er (geerdet, der Fuß im Wasser, der Schritt platscht). Schwimmen ist
        //    ein eigener Zustand: nicht Luft (Beschleunigung, Landung) und nie vom Boden-Snap gegriffen.
        const feet0 = mesh.position.y - footDrop;
        const brustM = AnazhRealm._schwimmBrustM();
        const grund0 = this._fieldSurfaceBelow(
            mesh.position.x,
            feet0 + AnazhRealm.PLAYER_STEP_UP,
            mesh.position.z,
            AnazhRealm.PLAYER_STEP_UP + AnazhRealm.HYDROSPHERE.carveLakeBedDepth + brustM
        );
        // Ohne Grund in Reichweite (tiefes Wasser, eine hohe Höhlen-Halle) urteilt die Wahrheit an den Füßen — die Decke
        // (D11) gilt auch dort.
        const waterY = this._koerperWasser(mesh.position.x, mesh.position.z, grund0 !== null ? grund0 : feet0);
        const schwimmt = waterY > feet0 && (waterY - feet0 > brustM || grund0 === null || waterY - grund0 > brustM);
        s.playerUnderwater = schwimmt;
        s.playerEyesUnderwater = schwimmt && mesh.position.y + 1.6 < waterY;

        // 4. Vertikale Integration. Im Wasser: Schwimm-Auftrieb (dieselbe reine Funktion) zur Brustkorb-Linie;
        //    an Land: Schwerkraft, gecappt (Anti-Tunneling, wie der Ammo-Fall-Cap −25).
        if (schwimmt) {
            // SCHWIMM-HEIMAT — Drag + Ausdauer aus dem koerperstudio-Gesetzbuch:
            // aktive Züge (Shift-Tauchen / Space-Auftauchen) zehren ausdauerProS;
            // erschöpft (stamina 0) trägt NUR der Auftrieb den Körper zur
            // Oberfläche (kein Ertrinken — die Züge versiegen, das Wasser hebt).
            const SG = AnazhRealm._schwimmGesetz();
            let dive = !!s.keys["shift"];
            let rise = !!s.keys[" "];
            const pl = s.player;
            if (pl && (dive || rise)) {
                if (pl.stamina > 0) pl.stamina = Math.max(0, pl.stamina - SG.ausdauerProS * dt);
                if (pl.stamina <= 0) {
                    dive = false;
                    rise = false;
                }
            }
            // Die Tiefe unter der Wasserlinie des Körpers: Füße am Spiegel − Brustkorb-Linie. Das Wasser bremst die
            // Horizontale nur ohne Zug (`_loopPlayerMovement`, schwimmen.drag) — bis V18.531 bremste es JEDEN Schritt
            // auch den Zug (Kraulen 0,141 m/s = 14 % des Gesetzes).
            vy = this._swimVerticalVelocity(vy, waterY - brustM - feet0, dive, rise);
        } else if (s._parkourKletter > 0) {
            // PARKOUR — der Griff hält: KLETTERN ersetzt die Schwerkraft (Input-
            // seitig gegated: W + frische Wand + Ausdauer; der Steig-Wert reist
            // im koerperstudio-Gesetzbuch). Wand weg → nächster Frame fällt.
            vy = s._parkourKletter;
        } else {
            vy += (s.gravity || -9.81) * dt;
            if (vy < -25) vy = -25;
        }
        // IM SATTEL führt das Gefährt die Vertikale (Welle L, Q1 F-D10): der Reiter sitzt — kein Fall, kein Boden-Snap
        // (Schritt 8); den Sitz setzt `_rittSchritt` im selben Sim-Schritt aus der Ebene der Räder. Vorher fiel die
        // Kapsel je Schritt frei und galt in 421 von 421 Frames als „in der Luft" (0,425 m über dem Haft-Band).
        const geritten = !!(s.player && s.player.mountedArch !== null && s.player.mountedArch !== undefined);
        if (geritten) vy = 0;

        // 4b. STRÖMUNG — die EINE Kopplung jedes Körpers im Wasser (Spieler, Boot, Tier): er bewegt sich RELATIV zum
        // Wasser, das Wasser trägt ihn mit (`_waterFlowAt`, EINE Quelle): v_Welt = v_eigen + Strömung. Gate: der
        // Schwimmer oder das gerittene schwimmende Gefährt (`_afloat`, von `_tickMountedMovement` gestempelt); Land-Läufer
        // und Watende nie. Der Körper integriert v_Welt (Wand-Klip und Kollision inbegriffen), `playerVel` behält das
        // Eigene. Bis V18.531 zwei Gesetze: der Spieler mit Schlupf (v += (Strom − v)·0,3 je Schritt, ruhend ~0,56 ×
        // Strömung), das Tier additiv.
        let stromX = 0;
        let stromZ = 0;
        {
            const rideEntry = this._mountedEntry;
            const afloat = !!(
                rideEntry &&
                s.player &&
                rideEntry.id === s.player.mountedArch &&
                rideEntry._afloat === true
            );
            if (schwimmt || afloat) {
                const fl = this._waterFlowAt(mesh.position.x, mesh.position.z);
                if (fl) {
                    stromX = fl.x;
                    stromZ = fl.z;
                    vx += stromX;
                    vz += stromZ;
                }
            }
        }

        // 5. Position vorintegrieren (world units, scaleFactor = 1).
        let nx = mesh.position.x + vx * dt;
        let ny = mesh.position.y + vy * dt;
        let nz = mesh.position.z + vz * dt;

        const feetY = ny - footDrop;
        const headY = ny + footDrop;

        // 5a. IM SATTEL EINES GESETZ-WAGENS ist seine HÜLLE der Körper (Welle L, Q5): ihr Kontakt (Gelände · Bauwerke ·
        // Inseln · Kreaturen) ersetzt die Kapsel-Schritte 5b · 6 · 7 — vorher hielt die Reiter-Kapsel r 0,35 am Ursprung,
        // und der Bug fuhr 1,97–2,32 m in den Stamm.
        const fahrE =
            geritten && this._mountedEntry && this._mountedEntry.id === s.player.mountedArch
                ? this._mountedEntry
                : null;
        const fahrHuelle = fahrE ? this._fahrHuelle(fahrE) : null;
        if (fahrHuelle) {
            const hk = this._fahrHuelleKontakt(fahrE, fahrHuelle, mesh.position.x, mesh.position.z, vx, vz, dt);
            nx = hk.x;
            nz = hk.z;
            vx = hk.vx;
            vz = hk.vz;
        }

        // 5b. GLEITEN STATT VOLLSTOPP (PM_ClipVelocity, Quake/Source): vor einer nicht erklimmbaren Wand
        // (Terrain im Körperband feetY+STEP_UP..feetY+1.5, unter Augenhöhe → Tunnel-Decken zählen nicht)
        // wird v je Kontaktebene geclippt, v −= n·(v·n), bis SLIDE_CLIP_PLANES Ebenen (jede Iteration am NEUEN
        // Kandidaten); n = horizontale Spur der `_fieldGradient`-Außennormale. |∇| ≈ 0 oder rein vertikale
        // Normale → fail-closed Voll-Stopp (nie Eindringen). Läuft VOR der Struktur-/Kugel-Auflösung. Die Schleife ist
        // DIE des Kontakt-Lösers (`_wandGleiten`, dieselbe für die Hülle des Wagens).
        if (!fahrHuelle && (vx !== 0 || vz !== 0)) {
            const wallLine = feetY + AnazhRealm.PLAYER_STEP_UP + 0.05;
            // Wand-Probe am Kandidaten: (a) Band-Probe feetY+STEP_UP..feetY+1.5 (findet
            // Ledges/Wand-Köpfe im Körperband), (b) Solid-Probe auf Rumpf-Höhe feetY+1.1
            // (fängt die HOHE Wand, deren Kopf über dem Band liegt — dort startet die
            // Band-Probe im Soliden und sieht innerhalb des Bandes keine Kante). Liefert
            // den Kontakt-Punkt (Probe-Höhe für den Gradienten) oder null (frei).
            const pt = this._kopplungWandP || (this._kopplungWandP = { x: 0, y: 0, z: 0 });
            const wallAt = (px, pz) => {
                let y = null;
                const sB = this._fieldSurfaceBelow(px, feetY + 1.5, pz, 1.5 - AnazhRealm.PLAYER_STEP_UP);
                if (sB !== null && sB > wallLine) y = Math.min(sB, feetY + 1.1);
                else if (this._fieldSolid(px, feetY + 1.1, pz)) y = feetY + 1.1;
                if (y === null) return null;
                pt.x = px;
                pt.y = y;
                pt.z = pz;
                return pt;
            };
            const gl = this._wandGleiten(
                mesh.position.x,
                mesh.position.z,
                vx,
                vz,
                dt,
                wallAt,
                this._kopplungGl || (this._kopplungGl = {})
            );
            nx = gl.x;
            nz = gl.z;
            vx = gl.vx;
            vz = gl.vz;
        }

        // 6. STRUKTUR-KOLLISION (feld-native, kein Ammo): die Kapsel gegen die soliden
        //    Part-AABBs naher Bauwerke (`entry.blockerAABBs` — dichte ≥ 0.3, EINE Quelle mit
        //    dem Wasser-Blocker). Wände BLOCKEN horizontal (mutiert nx/nz = gleiten), Dächer/
        //    Plattformen (die Start-Plattform!) TRAGEN → der Spieler steht drauf statt durch
        //    sie zu fallen. Liefert die höchste begehbare Auflage-Oberkante im Snap-Band.
        const structPos = { x: nx, z: nz };
        const schubWagen = this._spielerSchubQuellen || (this._spielerSchubQuellen = []);
        schubWagen.length = 0;
        const structTop = fahrHuelle
            ? -Infinity
            : this._stepCharacterStructures(structPos, feetY, headY, AnazhRealm.PLAYER_WALL_RADIUS, null, schubWagen);
        // DER SPIELER AN EINEM WAGEN (0710-4): schob ein Wagen den Spieler aus seiner Hülle, stoßen sie längs der
        // Schub-Richtung (vom Wagen zum Spieler) — der Wagen bekommt seinen Impuls (er rutscht im Nachlauf), der Spieler
        // seinen (er prallt ab). Vorher hielt die Box den Spieler ohne Folge für den Wagen.
        // Die Geschwindigkeit dieses Schritts ist die lokale (vx, vz): das Paar liest und schreibt sie über playerVel.
        for (let w = 0; w < schubWagen.length; w += 3) {
            const sd = Math.hypot(schubWagen[w + 1], schubWagen[w + 2]);
            if (!(sd > 1e-9) || !this._fahrStossSatz(schubWagen[w])) continue;
            vBody.setValue(vx, vBody.y(), vz);
            this._stossPaar(schubWagen[w], mesh, schubWagen[w + 1] / sd, schubWagen[w + 2] / sd);
            vx = vBody.x();
            vz = vBody.z();
        }
        // Fliegende Inseln teilen die EINE Kapsel-vs-AABB-Quelle (Entscheid #2 — die AABB-Hülle):
        // der Spieler steht auf der Insel-Oberkante + wird an ihren Flanken geschoben.
        const islandTop = fahrHuelle
            ? -Infinity
            : this._stepCharacterIslands(structPos, feetY, headY, AnazhRealm.PLAYER_WALL_RADIUS);
        nx = structPos.x;
        nz = structPos.z;
        // Die höhere der beiden begehbaren Auflagen (Bauwerk ODER Insel) trägt den Spieler.
        const supTop = Math.max(structTop, islandTop);

        // 7. TERRAIN-WAND-KOLLISION — nur HORIZONTAL, und VOR dem Boden-Snap (so wird der Spieler
        //    erst aus der Wand geschoben, bevor Schritt 8 vertikal entscheidet → der Anti-Clip
        //    feuert nicht beim bloßen Wand-Berühren). Die Wand-Kugeln beginnen ERST über der
        //    Stufe-hoch-Linie (feetY + STEP_UP): Stufen ≤ STEP_UP fängt der Snap, nur echte Wände
        //    blocken (kein Hängenbleiben am Riser). Die obere Kugel klemmt den Aufstieg an Decken.
        const wR = AnazhRealm.PLAYER_WALL_RADIUS;
        const baseWallY = feetY + AnazhRealm.PLAYER_STEP_UP + wR;
        const p = { x: 0, y: 0, z: 0 };
        const wallYs = fahrHuelle ? [] : [baseWallY, baseWallY + 0.6]; // Rumpf · Schulter/Kopf (die Hülle trug 5a)
        for (let k = 0; k < wallYs.length; k++) {
            p.x = nx;
            p.y = wallYs[k];
            p.z = nz;
            const oy = p.y;
            if (this._fieldResolveSphere(p, wR, null)) {
                nx = p.x; // nur die horizontale Korrektur übernehmen (an Wänden gleiten)
                nz = p.z;
                if (k === wallYs.length - 1 && p.y < oy - 0.001 && vy > 0) vy = 0; // Decke
            }
        }

        // 8. BODEN (vertikal). Die Probe startet bei feetY+STEP_UP. ZWEI Pfade:
        let grounded = false;
        let groundNormalY = 1.0;
        let traegerStruktur = false; // trägt ein Bauwerk/eine Insel (supTop) statt des Geländes?
        const probeStart = feetY + AnazhRealm.PLAYER_STEP_UP;
        const buriedDeep = !geritten && this._fieldSolid(nx, probeStart, nz); // Füße > STEP_UP tief im Soliden?
        if (geritten) {
            // der Reiter sitzt auf dem Gefährt (auch im Flug des Wagens: er fliegt mit ihm, nie für sich — die Vertikale
            // trägt der Fahr-Schritt; gate:fahr-leben T misst die Lage selbst: Sitz und Aufstand, nie dieses Flag)
            grounded = true;
        } else if (buriedDeep) {
            // 8a. ANTI-CLIP: stecken die Füße TIEF im Terrain, scannt die Probe AUFWÄRTS zur Oberkante (30 m,
            // nur im seltenen Penetrations-Fall) und setzt den Spieler BEDINGUNGSLOS hoch — er darf NIE im
            // Soliden stecken (sonst Clip durch den Boden auf eine Höhlen-Schicht).
            const top = this._fieldSurfaceBelow(nx, probeStart, nz, 30);
            if (top !== null) {
                ny = top + footDrop;
                if (vy < 0) vy = 0;
                grounded = true;
                groundNormalY = this._fieldGradient(nx, top, nz, {}).y;
            }
        } else {
            let terrSurf = this._fieldSurfaceBelow(
                nx,
                probeStart,
                nz,
                footDrop + AnazhRealm.PLAYER_STEP_UP + AnazhRealm.PLAYER_GROUND_SNAP + 4
            );
            // 8b. Kein Forward-Block: das Gleiten an Wänden übernimmt Schritt 5b (PM_ClipVelocity).
            // 8c. BODEN-SNAP — die effektive Oberfläche = die HÖHERE aus Terrain UND Struktur.
            const effSurf = Math.max(terrSurf === null ? -Infinity : terrSurf, supTop);
            const wasGrounded = s._fieldWasGrounded === true;
            if (vy <= 0.5) {
                if (effSurf > -Infinity) {
                    const restY = effSurf + footDrop;
                    const gap = ny - restY; // > 0: Oberfläche UNTER den Füßen (Luft/bergab) · ≤ 0: AUF/ÜBER
                    // ZWEI getrennte Fälle (sonst zieht die Haftung den Fallenden wie ein Magnet an):
                    //  (a) AT/ÜBER den Füßen [−STEP_UP .. 0] → Landung ODER Stufe-hoch: rauf-snappen.
                    //      Der Fall landet NATÜRLICH (Füße erreichen den Boden), KEIN Vorab-Sog.
                    //  (b) knapp UNTER den Füßen (0 .. GROUND_SNAP] → Boden-Haftung bergab, NUR wenn
                    //      vorher geerdet (sanft bergab); im Fall NICHT → kein Magnet. Größerer gap
                    //      (Kamm/Klippe) → kein Snap → natürlicher Sprung-Bogen.
                    // Der Schwimmer haftet nie bergab (das Wasser trägt ihn — bis V18.531 zog die Haftung jeden, der
                    // vom Ufer hineinging, Schritt für Schritt am Grund entlang, bis 4,68 m unter den Spiegel).
                    const catchOrStep = gap <= 0 && gap >= -AnazhRealm.PLAYER_STEP_UP;
                    const gentleDownhill = gap > 0 && gap <= AnazhRealm.PLAYER_GROUND_SNAP && wasGrounded && !schwimmt;
                    if (catchOrStep || gentleDownhill) {
                        if (s.isInAir && vy < -AnazhRealm.LAND_DIP_MIN_SPEED) {
                            s._landImpactPending = Math.max(s._landImpactPending || 0, -vy);
                        }
                        ny = restY;
                        vy = 0;
                        grounded = true;
                        if (supTop >= (terrSurf === null ? -Infinity : terrSurf)) {
                            groundNormalY = 1.0; // Struktur-/Insel-Auflage: eben per Definition
                            traegerStruktur = true;
                        } else {
                            const gN = this._kopplungSlideN || (this._kopplungSlideN = {});
                            this._fieldGradient(nx, terrSurf, nz, gN);
                            groundNormalY = gN.y;
                            // STEILHANG: Gravitation entlang der Ebene. Auf zu steilem Grund (ny < hang.maxSlopeY — dieselbe
                            // Schwelle wie onSteepSlope, aus dem fail-closed Steilhang-Gesetz) rutscht der Körper:
                            // g_t = g − n·(g·n) hat horizontal n.xz·n.y·|g| (bergab per Konstruktion); vertikal führt der
                            // Boden-Snap. NaN-Wand: |∇| ≈ 0 → `_fieldGradient` liefert (0,1,0) → kein Term.
                            // Keine Brems-Kurve auf Steilhang → der Rutsch beschleunigt physikalisch.
                            const hangMaxSlopeY = AnazhRealm._bewegungsBlock("hang", ["maxSlopeY", "malus"]).maxSlopeY;
                            if (gN.mag > 1e-6 && gN.y > 1e-4 && gN.y < hangMaxSlopeY) {
                                const gMag = -(s.gravity || -9.81);
                                vx += gN.x * gN.y * gMag * dt;
                                vz += gN.z * gN.y * gMag * dt;
                            }
                        }
                    }
                }
            }
        }

        // 9. Killplane (wie der Ammo-Pfad): tief unter dem Welt-Boden → auf die Oberfläche.
        const killPlaneY =
            s.worldMeta && s.worldMeta.voxelTerrain ? (s.terrainBaseHeight || 0) - 88 : (s.minHeight || -50) - 30;
        if (ny < killPlaneY) {
            const above = this.findSurfaceAbove(nx, ny, nz);
            ny = above + 0.5 + footDrop;
            vy = 0;
            grounded = false;
        }

        // 10. Ergebnis schreiben: Mesh-Position + die feld-eigene Velocity (vx/vy/vz) +
        //    vy in `_fieldVy`. Die Grounded-Wahrheit in den State (die EINEN Leser:
        //    isPlayerGrounded-Cache, Slope-Penalty, handleJump-Coyote). Kein Ammo-Body.
        mesh.position.set(nx, ny, nz);
        s._fieldVy = vy;
        // Das Eigene bleibt (die Strömung trug den Rest, 4b).
        s.playerVel.setValue(vx - stromX, vy, vz - stromZ);

        s.groundNormalY = grounded ? groundNormalY : 1.0;
        s.onSteepSlope =
            grounded && groundNormalY < AnazhRealm._bewegungsBlock("hang", ["maxSlopeY", "malus"]).maxSlopeY;
        s._groundedCache = grounded;
        s._groundedCachedAt = performance.now();
        s._fieldWasGrounded = grounded; // für die Boden-Haftung im nächsten Frame (kein Magnet im Fall)
        // DER TRÄGER dieses Schritts — die Sicht-Schicht liest ihn (`_gaitBodenY` → `_standSicht`): die Fläche unter den
        // Füßen (Gelände, in der Höhle ihr Boden) bzw. das Bauwerk; in der Luft keiner (die Fuß-IK ruht).
        s._kapselTraegerY = grounded ? ny - footDrop : NaN;
        s._kapselStruktur = grounded && traegerStruktur;
        if (grounded) {
            s.lastGroundedTime = currentTime;
            s.isInAir = false;
            // PARKOUR — die Landung füllt die Luft-Sprünge auf (EIN Erdungs-Ort).
            if (s._airJumps) s._airJumps = 0;
            s.isJumping = false;
        } else {
            // Der Schwimmer ist nicht in der Luft: er beschleunigt wie zu Fuß (bis V18.531 mit dem Luft-Wert 4,5 statt
            // 14), und der Übergang Luft → Wasser ist eine Landung (der Eintauch-Klang „wasser", der Schritt-Takt liest
            // isInAir).
            s.isInAir = !schwimmt;
        }
    }

    // DETERMINISMUS-BOGEN P3 — Ammo ist RAUS, die Feld-Physik ist die EINZIGE Physik
    // (kein A/B mehr). `state.fieldPhysics` bleibt als stehendes true-Flag (die Leser
    // im Schritt-/Raycast-Pfad lesen es), der frühere Ammo-Rückweg ist entfallen.
    setFieldPhysics() {
        const s = this.state;
        s.fieldPhysics = true;
        this.log("Feld-Physik (Determinismus-Controller) — die einzige Physik (Ammo ist raus).", "INFO");
        return true;
    }

    // Feld-native Struktur-Kollision: löst die Kapsel-Achse (pos.x/z, vertikal feetY..headY) gegen die
    // soliden Part-AABBs naher Bauwerke (`entry.blockerAABBs`, dichte ≥ 0.3 — DIESELBE Quelle wie der
    // Wasser-Blocker, Tür-Lücke/Glas begehbar). AUFLAGE trägt (liefert die höchste), WAND schiebt
    // horizontal heraus. Mutiert pos.x/z; O(nahe Bauwerke × Parts).
    // `huelle` (Welle L, Q5): der Körper ist die Hülle eines gerittenen Gesetz-Wagens (`_fahrHuelle`) statt der Kapsel —
    // dieselbe Bauwerks-Schleife, die Box gegen das Rechteck (`_resolveHuelleVsAABB`); ein Stamm dünner als die Rad-Stufe
    // (`box.dick`) wird überrollt. Die Hülle trägt keine Auflage (−Infinity).
    _stepCharacterStructures(pos, feetY, headY, radius, huelle, quellen) {
        const arches = this.state.architectures;
        if (!arches || !arches.length) return -Infinity;
        let supportTop = -Infinity;
        // Das GERITTENE Gefährt blockt seinen Reiter nicht — er sitzt per Definition in dessen
        // blockerAABBs und würde sonst beim Aufsteigen herausgedrückt.
        const riddenId = this.state.player ? this.state.player.mountedArch : null;
        // DIE NACHBARSCHAFT (0710-7): eine Box wirkt nur, wenn der Körper ihre Hülle erreicht — die Kapsel ihren Radius weit
        // (Auflage und Wand verlangen die Position in der Hülle ± radius), die Hülle des Wagens |mitte| + hl + hw weit (sonst
        // trennt eine Achse ihr Rechteck von der Box). Gelöst werden nur die Einträge der Nachbarschaft (`_blockerNahe`),
        // deren Hülle diese Reichweite um die Position berührt, in der Ordnung des Bestands; schiebt ein Eintrag den Körper,
        // fragt der Löser die Nachbarschaft der neuen Stelle hinter ihm nach. So sieht jede Box die Position, die sie in der
        // Schleife über das Array sah, und ein ausgelassener Eintrag hätte mit ihr nichts bewirkt: der Löser ist byte-gleich
        // (gate:blocker-netz, Kapsel und Hülle). Vorher löste jeder Schritt jede Box im 60-m-Umkreis (Wiese: 12 034).
        const reich = (huelle ? Math.abs(huelle.mitte) + huelle.hl + huelle.hw : radius) + 1e-6;
        const nah = this._blockerNahListe || (this._blockerNahListe = []);
        nah.length = 0;
        this._blockerNahe(pos.x, pos.z, reich, -Infinity, nah);
        for (let a = 0; a < nah.length; a++) {
            const e = nah[a];
            if (!e.blockerAABBs || !e.position) continue;
            if (riddenId !== null && riddenId !== undefined && e.id === riddenId) continue;
            // grobe XZ-Distanz — nur nahe Bauwerke berühren den Spieler.
            // V18.464: + gestempelte Blocker-Reichweite (_blockerReach) — der
            // Zentrums-Cull verlor bei großen/skalierten Bauwerken die Rand-Parts.
            const cullR = 60 + (e._blockerReach || 0);
            if (Math.abs(e.position.x - pos.x) > cullR || Math.abs(e.position.z - pos.z) > cullR) continue;
            if (huelle && huelle.eigen === e.id) continue; // ein rutschender Wagen löst nie gegen sich selbst
            const boxes = e.blockerAABBs;
            if (huelle) huelle.quelle = e; // der Gegner jedes Schubs (das EINE Impuls-Gesetz)
            const vorX = pos.x;
            const vorZ = pos.z;
            for (let b = 0; b < boxes.length; b++) {
                if (huelle) {
                    if (!(boxes[b].dick < huelle.stufe)) this._resolveHuelleVsAABB(boxes[b], pos, huelle);
                } else supportTop = this._resolveCapsuleVsAABB(boxes[b], pos, feetY, headY, radius, supportTop);
            }
            if (pos.x !== vorX || pos.z !== vorZ) {
                // der Schub dieses Bauwerks (der Spieler-Pfad sammelt ihn: ein Wagen bekommt seinen Impuls, 0710-4)
                if (quellen) quellen.push(e, pos.x - vorX, pos.z - vorZ);
                // der Schub trug den Körper an eine neue Stelle: deren Nachbarschaft, hinter diesem Eintrag
                nah.length = 0;
                this._blockerNahe(pos.x, pos.z, reich, e._blockerSeq, nah);
                a = -1;
            }
        }
        return supportTop;
    }

    // Feld-native Insel-Kollision: eine AABB-Hülle pro Insel (`island.userData.fieldAABB`, aus der
    // Geometrie) — Stehen auf der Oberkante + Blocken an den Flanken, dieselbe Quelle wie Bauwerke
    // (`_resolveCapsuleVsAABB`).
    _stepCharacterIslands(pos, feetY, headY, radius, huelle) {
        const isls = this.state.floatingIslands;
        if (!isls || !isls.length) return -Infinity;
        let supportTop = -Infinity;
        for (let i = 0; i < isls.length; i++) {
            const box = isls[i] && isls[i].userData ? isls[i].userData.fieldAABB : null;
            if (!box) continue;
            const mx = (box.minX + box.maxX) * 0.5,
                mz = (box.minZ + box.maxZ) * 0.5;
            if (Math.abs(mx - pos.x) > 80 || Math.abs(mz - pos.z) > 80) continue; // grobes XZ-Cull
            if (huelle) {
                huelle.quelle = null; // eine Insel ist starr
                this._resolveHuelleVsAABB(box, pos, huelle);
            } else supportTop = this._resolveCapsuleVsAABB(box, pos, feetY, headY, radius, supportTop);
        }
        return supportTop;
    }

    // Die EINE Quelle für „Kapsel gegen eine AABB": (1) AUFLAGE — liegt die Box-Oberkante im
    // Haft-Band [feetY − SNAP .. feetY + STEP] über dem Fuß-Fußabdruck → Kandidat zum Draufstehen
    // (gibt die höchste als neuen supportTop). (2) WAND — eine Box, deren Oberkante über der
    // Stufe-hoch-Linie liegt + vertikal mit dem Körper überlappt, schiebt die Achse horizontal
    // heraus (gleiten). Mutiert pos.x/z. Bauwerke + Inseln teilen diese Mathematik.
    _resolveCapsuleVsAABB(box, pos, feetY, headY, radius, supportTop, kontakt = null) {
        const STEP = AnazhRealm.PLAYER_STEP_UP;
        const SNAP = AnazhRealm.PLAYER_GROUND_SNAP;
        const bodyLo = feetY + STEP;
        // DIE GEDREHTE BOX (Haus-Hülle, Welle L): der Vorfilter ist ihre Welt-AABB, die Lösung geschieht im Box-Rahmen —
        // die Achse lokal, dieselbe Auflage-/Wand-Mathematik gegen die lokalen Halb-Maße, der Schub zurück in die Welt.
        // Vorher las die Kapsel den gedrehten Riegel als achsparallele Welt-AABB (sie stand mitten im Raum).
        const ob = box.obb;
        if (ob) {
            if (
                pos.x < box.minX - radius ||
                pos.x > box.maxX + radius ||
                pos.z < box.minZ - radius ||
                pos.z > box.maxZ + radius
            )
                return supportTop;
            const dx = pos.x - ob.cx;
            const dz = pos.z - ob.cz;
            const lp = this._obbLokal || (this._obbLokal = { x: 0, z: 0 });
            lp.x = dx * ob.c - dz * ob.s;
            lp.z = dx * ob.s + dz * ob.c;
            const lb = this._obbBox || (this._obbBox = { minX: 0, maxX: 0, minZ: 0, maxZ: 0, topY: 0, botY: 0 });
            lb.minX = -ob.hx;
            lb.maxX = ob.hx;
            lb.minZ = -ob.hz;
            lb.maxZ = ob.hz;
            lb.topY = box.topY;
            lb.botY = box.botY;
            lb.gedeckt = box.gedeckt === true;
            const ax = lp.x;
            const az = lp.z;
            // Der Kontakt der lokalen Lösung landet im lokalen Empfänger und reist gedreht zu SEINEM Körper zurück (D5): ein
            // Tier (`kontakt`, _kreaturHuellenKontakt) schreibt nie die Parkour-Wand des Spielers — vorher fiel `kontakt` hier
            // heraus, jedes Tier an einem gedrehten Haus schrieb state._wandKontakt* im Rahmen der Box.
            const lk = this._obbKontakt || (this._obbKontakt = { nx: 0, nz: 0 });
            lk.nx = 0;
            lk.nz = 0;
            const st = this._resolveCapsuleVsAABB(lb, lp, feetY, headY, radius, supportTop, lk);
            const px = lp.x - ax;
            const pz = lp.z - az;
            if (px !== 0 || pz !== 0) {
                pos.x += px * ob.c + pz * ob.s;
                pos.z += -px * ob.s + pz * ob.c;
            }
            if (lk.nx !== 0 || lk.nz !== 0)
                this._wandKontaktSetzen(kontakt, lk.nx * ob.c + lk.nz * ob.s, -lk.nx * ob.s + lk.nz * ob.c);
            return st;
        }
        // die FUGE trägt nie (`gedeckt`, `_blockerFugen`): auf ihr sitzt eine Box desselben Werks
        if (
            box.gedeckt !== true &&
            pos.x >= box.minX - radius &&
            pos.x <= box.maxX + radius &&
            pos.z >= box.minZ - radius &&
            pos.z <= box.maxZ + radius &&
            box.topY <= feetY + STEP &&
            box.topY >= feetY - SNAP &&
            box.topY > supportTop
        ) {
            supportTop = box.topY;
        }
        if (box.topY > bodyLo && box.botY < headY) {
            const cx = Math.max(box.minX, Math.min(pos.x, box.maxX));
            const cz = Math.max(box.minZ, Math.min(pos.z, box.maxZ));
            const dx = pos.x - cx;
            const dz = pos.z - cz;
            const d2 = dx * dx + dz * dz;
            if (d2 < radius * radius) {
                if (d2 > 1e-8) {
                    const d = Math.sqrt(d2);
                    const push = radius - d;
                    pos.x += (dx / d) * push;
                    pos.z += (dz / d) * push;
                    // PARKOUR — die WAND-WAHRHEIT fällt am EINEN Kapsel-Chokepoint
                    // gratis ab: der horizontale Push IST der Kontakt (Normale =
                    // Push-Richtung, von der Wand weg). Die Parkour-Leser
                    // (Wandsprung/Klettern) lesen sie mit kurzem Verfall.
                    this._wandKontaktSetzen(kontakt, dx / d, dz / d);
                } else {
                    // Achse genau in der Box → zur nächsten Seite hinausschieben
                    const toMinX = pos.x - box.minX + radius;
                    const toMaxX = box.maxX - pos.x + radius;
                    const toMinZ = pos.z - box.minZ + radius;
                    const toMaxZ = box.maxZ - pos.z + radius;
                    const m = Math.min(toMinX, toMaxX, toMinZ, toMaxZ);
                    if (m === toMinX) pos.x = box.minX - radius;
                    else if (m === toMaxX) pos.x = box.maxX + radius;
                    else if (m === toMinZ) pos.z = box.minZ - radius;
                    else pos.z = box.maxZ + radius;
                }
            }
        }
        return supportTop;
    }

    // DIE WAND-WAHRHEIT hat EINEN Schreiber: der Kapsel-Löser meldet die Normale (von der Wand weg, Welt-Rahmen) an den
    // Körper, der ihn rief — ein Tier an seinen eigenen Empfänger (`kontakt`, _kreaturHuellenKontakt), der Spieler an die
    // Parkour-Wand (state._wandKontakt*, Wandsprung/Klettern lesen sie mit kurzem Verfall).
    _wandKontaktSetzen(kontakt, nx, nz) {
        if (kontakt) {
            kontakt.nx = nx;
            kontakt.nz = nz;
            return;
        }
        this.state._wandKontaktNx = nx;
        this.state._wandKontaktNz = nz;
        this.state._wandKontaktAt = performance.now() / 1000;
    }

    // Der waagrechte Abstand² eines Punkts zu einer Blocker-Box — im Rahmen der GEDREHTEN Box (`obb`, die Haus-Hülle und
    // das Podest), sonst gegen die Welt-AABB; 0 im Inneren. Der Innen-Test und der Reichweiten-Filter des Tier-Leibs lesen
    // ihn (D5): die Welt-AABB einer gedrehten Box ist größer als die Box — ein Tier in ihren Ecken galt als „innen" und ging
    // frei durch die Wand.
    _boxAbstand2(box, x, z) {
        const ob = box.obb;
        let ix;
        let iz;
        if (ob) {
            const dx = x - ob.cx;
            const dz = z - ob.cz;
            const lx = dx * ob.c - dz * ob.s;
            const lz = dx * ob.s + dz * ob.c;
            ix = lx - Math.max(-ob.hx, Math.min(lx, ob.hx));
            iz = lz - Math.max(-ob.hz, Math.min(lz, ob.hz));
        } else {
            ix = x - Math.max(box.minX, Math.min(x, box.maxX));
            iz = z - Math.max(box.minZ, Math.min(z, box.maxZ));
        }
        return ix * ix + iz * iz;
    }

    _loopPlayerMovement(currentTime, dtOverride) {
        // ### Spielerbewegung ###
        // `dtOverride` (FIXED_DT im Sim-Schritt) macht die Bewegung zur reinen Funktion von (Input, dt);
        // ohne Override dt aus der Wall-Clock. Die horizontale Intent-Velocity lebt in `state.playerVel`,
        // `_stepCharacter` integriert. Unter Wasser ist Shift die Tauch-Geste, an Land Sprint.
        let currentSpeed =
            this.state.keys["shift"] && !this.state.playerUnderwater ? this.state.sprintSpeed : this.state.speed;
        // Wasser bremst: das Tempo kommt aus dem Schwimm-Gesetz (speedMul, Kraul relativ zum Gehen; der Leser ist
        // fail-closed — das Literal 0,55 neben dem Gesetz 0,85 fiel, W-K3).
        if (this.state.playerUnderwater) currentSpeed *= AnazhRealm._schwimmGesetz().speedMul;

        this.state.forward.set(Math.sin(this.state.yaw), 0, Math.cos(this.state.yaw));
        this.state.right.set(Math.cos(this.state.yaw), 0, -Math.sin(this.state.yaw));
        this.state.moveDirection.set(0, 0, 0);
        if (this.state.keys["w"]) this.state.moveDirection.addScaledVector(this.state.forward, 1);
        if (this.state.keys["s"]) this.state.moveDirection.addScaledVector(this.state.forward, -1);
        // Bewusst NICHT „intuitiv" invertieren: `state.right` ist die arithmetische Richtung
        // (cos yaw, 0, −sin yaw) = player-anatomisch LINKS. A → +state.right, D → −state.right.
        if (this.state.keys["a"]) this.state.moveDirection.addScaledVector(this.state.right, 1);
        if (this.state.keys["d"]) this.state.moveDirection.addScaledVector(this.state.right, -1);

        if (this.state.playerVel) {
            // Auf zu steilem Hang (onSteepSlope via isPlayerGrounded) wird der Bewegungs-Input gedrosselt
            // (fx.bewegung.hang.malus): 0 nähme jede Kontrolle, 1 erlaubte Wand-Klettern; der Malus lässt
            // seitliches Rauslenken zu. hang.maxSlopeY lesen die Steilhang-Leser direkt (kein State-Seed).
            const slopePenalty = this.state.onSteepSlope
                ? AnazhRealm._bewegungsBlock("hang", ["maxSlopeY", "malus"]).malus
                : 1.0;
            // Bewegungs-Feel: Beschleunigungs-/Brems-KURVEN statt Sofort-Velocity + Luftkontrolle (in der Luft
            // greift der Input schwächer, Momentum bleibt). exp-Lerp 1−e^(−k·dt) ist framerate-unabhängig; die
            // k-Werte wohnen im Gesetzbuch (fx.bewegung.luft). Der Sim-Schritt reicht FIXED_DT als `dtOverride`.
            const nowDt = Number.isFinite(dtOverride)
                ? Math.min(0.1, Math.max(0.001, dtOverride))
                : Math.min(0.1, Math.max(0.001, currentTime - (this.state._lastMoveT || currentTime)));
            if (!Number.isFinite(dtOverride)) this.state._lastMoveT = currentTime;
            // Im SATTEL führt das Gefährt die Kurven: sein Substanz-Profil ersetzt die Fuß-k-Werte (topSpeedMul,
            // kAcc ∝ 1/Masse, niedriges kBrake = rollt aus) — dieselben exp-Kurven, nur andere Konstanten.
            const ride =
                this.state.player &&
                this.state.player.mountedArch !== null &&
                this.state.player.mountedArch !== undefined
                    ? this._mountedVehicleProfile()
                    : null;
            // A5/N6.4 — je Profil-Größe EIN Lese-Ort (die Hoists speisen BEIDE
            // Zweige: den richtungs-folgenden Ritt UND den Lenk-Pfad unten).
            const rideTop = ride ? ride.topSpeedMul : 1;
            const rideKAcc = ride ? ride.kAcc : null;
            const rideKBrake = ride ? ride.kBrake : null;
            // VMAX-Anker: ein Studio-Fahrzeug fährt seine eigene Kern-Wahrheit vmax (m/s aus carPhys/
            // exportDrive), nicht Spieler-Tempo × Mul; im Sattel sprintet niemand. Ohne vmax (Kreatur-Ritt/
            // kaltes Buch) topSpeedMul-relativ.
            const rideVmax = ride && Number.isFinite(ride.vmax) && ride.vmax > 0 ? ride.vmax : null;
            if (rideVmax !== null) currentSpeed = rideVmax;
            else currentSpeed *= rideTop;
            // Trägt das gerittene Werk ein Fahr-Gesetz (fahrprofil.lenkung + zweispur, vehicle-core), fährt es den EINEN
            // Fahr-Schritt des Kerns (`_fahrSatz`, Welle L Q13): W/S = Gas/Bremse, A/D = Lenkung, Shift = Handbremse — dasselbe
            // Gesetz wie die Probefahrt. Ohne Fahr-Gesetz der richtungs-folgende Ritt (Kreatur, Bein-Werk).
            const fahrG = ride && this._mountedEntry ? this._fahrSatz(this._mountedEntry, ride) : null;
            // ═══ PARKOUR — RUTSCH + KLETTERN ═══
            // Nur mit dem koerperstudio-Gesetz (_parkourGesetz null → nichts) und nie im Sattel/Wasser.
            // RUTSCH: Taste C am Boden über Mindest-Fahrt → slideDauerSec Gleiten in Start-Richtung
            // (slideTempoMul, linear auf Geh-Tempo; Kamera duckt über den EINEN Dip-Kanal); Luft/Ende löst.
            const parkG = !ride && !this.state.playerUnderwater ? AnazhRealm._parkourGesetz() : null;
            let slide = this.state._parkourSlide || null;
            if (slide && (currentTime >= slide.bis || this.state.isInAir || !parkG)) {
                slide = this.state._parkourSlide = null;
            }
            if (parkG) {
                const cFresh = !!this.state.keys["c"] && !this.state._cWasDown;
                this.state._cWasDown = !!this.state.keys["c"];
                if (!slide && cFresh && !this.state.isInAir) {
                    const v0 = this.state.playerVel;
                    const sp0 = Math.hypot(v0.x(), v0.z());
                    // ZWILLINGS-ABSCHIED (18.07.): die Rutsch-Zeile ist Wand-geprüft
                    // (_parkourGesetz ganz-oder-gar-nicht) — die Ternary-Literale sind tot.
                    if (sp0 > parkG.slideMinTempo) {
                        const dauer = parkG.slideDauerSec;
                        slide = this.state._parkourSlide = {
                            bis: currentTime + dauer,
                            dauer,
                            dx: v0.x() / sp0,
                            dz: v0.z() / sp0,
                            v0: sp0 * parkG.slideTempoMul,
                        };
                        this.state._landImpactPending = Math.max(this.state._landImpactPending || 0, 1.2);
                    }
                }
            } else if (this.state._cWasDown) {
                this.state._cWasDown = false;
            }
            if (fahrG) {
                // DER EINE FAHR-SCHRITT (Welle L, Q13 — Befund 06.10.: der Stamm integrierte eine zweite Kopie des
                // Zweispur-Modells, Längs-Antrieb als exp-Lerp, ohne Vertikale, ohne Quer-Hangabtrieb, ohne Reibkreis
                // längs). Die Lage setzte der EINE Kontakt-Löser (`_stepCharacter`) zu Beginn des Sim-Schritts; was er der
                // Fahrt nahm (eine Wand, das Wasser), kehrt in den Körperrahmen zurück. Dann: Stand (Ebene der Räder,
                // ballistische Vertikale, Federn) an DIESER Lage, Kräfte → die Geschwindigkeit, die der Kontakt-Löser im
                // nächsten Schritt fährt — dieselbe Folge wie die Probefahrt (Kräfte, Lage, Stand).
                const { vc } = AnazhRealm._fahrSchrittGesetz();
                const ent = this._mountedEntry;
                const pmF = this.state.playerMesh.position;
                const v = this.state.playerVel;
                const z =
                    ent._fahr ||
                    (ent._fahr = vc.fahrZustand(
                        pmF.x,
                        pmF.z,
                        (Number.isFinite(ent._rideYaw) ? ent._rideYaw : this.state.yaw) - Math.PI / 2
                    ));
                z.x = pmF.x;
                z.z = pmF.z;
                const cyF = Math.cos(z.yaw);
                const syF = Math.sin(z.yaw);
                z.vlong = v.x() * cyF - v.z() * syF;
                z.vlat = -v.x() * syF - v.z() * cyF;
                vc.fahrStand(z, fahrG, this._fahrBoden(ent), nowDt);
                const keys = this.state.keys;
                const FT = AnazhRealm.FAHR_TASTEN; // die EINE Tafel der Fahr-Tasten (Hilfe und Tacho nennen sie)
                vc.fahrKraefte(
                    z,
                    {
                        throttle: keys[FT.gas.tasten[0]] ? 1 : 0,
                        brake: keys[FT.bremse.tasten[0]] ? 1 : 0,
                        steer: (keys[FT.lenken.tasten[0]] ? 1 : 0) - (keys[FT.lenken.tasten[1]] ? 1 : 0),
                        hand: !!keys[FT.handbremse.tasten[0]],
                        tiefe: this._fahrTiefe(z), // das Wasser am Wagen (Schau-2: Widerstand, Ansaugung)
                    },
                    fahrG,
                    nowDt
                );
                const cy2 = Math.cos(z.yaw);
                const sy2 = Math.sin(z.yaw);
                this.state.playerVel.setValue(z.vlong * cy2 - z.vlat * sy2, v.y(), -z.vlong * sy2 - z.vlat * cy2);
                // Die Gier ans Gefährt (Fahrt-Richtung (sin, cos) = Bug); der Lenk-Einschlag fürs Bild.
                ent._rideYaw = z.yaw + Math.PI / 2;
                ent._rideSteerYaw = z.steer;
            } else if (slide) {
                // PARKOUR — der RUTSCH führt: Richtung eingefroren, Tempo klingt
                // linear vom Boost auf das Geh-Tempo aus (WASD ruht — wer rutscht,
                // lenkt mit dem Körper, nicht mit den Füßen).
                const rest = Math.max(0, (slide.bis - currentTime) / Math.max(0.001, slide.dauer));
                const spZiel = this.state.speed + Math.max(0, slide.v0 - this.state.speed) * rest;
                const vSl = this.state.playerVel;
                this.state.playerVel.setValue(slide.dx * spZiel, vSl.y(), slide.dz * spZiel);
            } else if (this.state.moveDirection.length() > 0) {
                this.state.moveDirection.normalize();
                const v = this.state.playerVel;
                // ZENSUS 17.07. — die vier C5-Gefühls-Hebel wohnen im koerper-
                // studio-Gesetzbuch (fx.bewegung.luft, _bewegungsBlock fail-soft
                // byte-gleich: Boden kAcc / Luft kAccLuft).
                const LG = AnazhRealm._bewegungsBlock("luft", ["kAcc", "kAccLuft", "kBrake", "kBrakeLuft"]);
                const kAcc = rideKAcc !== null ? rideKAcc : this.state.isInAir ? LG.kAccLuft : LG.kAcc;
                const f = 1 - Math.exp(-kAcc * nowDt);
                const tx = this.state.moveDirection.x * currentSpeed * slopePenalty;
                const tz = this.state.moveDirection.z * currentSpeed * slopePenalty;
                this.state.playerVel.setValue(v.x() + (tx - v.x()) * f, v.y(), v.z() + (tz - v.z()) * f);
            } else if (!this.state.onSteepSlope) {
                // Brems-Kurve statt Hard-Stop: in der Luft bleibt das Momentum (ballistischer Bogen), am Boden ein
                // kurzer, spürbarer Schlitter (Masse statt masselosem Stopp); im Sattel rollt das Gefährt aus (sein
                // kBrake). kBrake/kBrakeLuft wohnen im Gesetzbuch (fx.bewegung.luft).
                const v = this.state.playerVel;
                const LG = AnazhRealm._bewegungsBlock("luft", ["kAcc", "kAccLuft", "kBrake", "kBrakeLuft"]);
                // Ohne Zug bremst das WASSER (schwimmen.drag: was je Sim-Schritt bleibt) — der Zug selbst läuft frei.
                const kBrake =
                    rideKBrake !== null
                        ? rideKBrake
                        : this.state.playerUnderwater
                          ? -Math.log(AnazhRealm._schwimmGesetz().drag) / AnazhRealm.FIXED_DT
                          : this.state.isInAir
                            ? LG.kBrakeLuft
                            : LG.kBrake;
                const fb = 1 - Math.exp(-kBrake * nowDt);
                this.state.playerVel.setValue(v.x() * (1 - fb), v.y(), v.z() * (1 - fb));
            }

            // JUMP-BUFFER: ein Space-Tipp kurz VOR der Landung wird gemerkt (sprung.bufferSec, Gesetzbuch
            // fx.bewegung.sprung) und feuert beim Aufsetzen. Der Sprung läuft durch handleJump — EINE Quelle
            // (Coyote + Slope-Gate + Decken-Klemme); ein Inline-Sprung umginge die Klemme.
            const spaceFresh = !!this.state.keys[" "] && !this.state._spaceWasDown;
            if (spaceFresh) this.state._jumpPressedAt = currentTime;
            this.state._spaceWasDown = !!this.state.keys[" "];
            const buffered =
                currentTime - (this.state._jumpPressedAt || -Infinity) <=
                AnazhRealm._bewegungsBlock("sprung", ["coyoteSec", "bufferSec"]).bufferSec;
            if ((this.state.keys[" "] || buffered) && !this.state.isJumping) {
                this.handleJump(currentTime);
                if (this.state.isJumping) this.state._jumpPressedAt = -Infinity;
            } else if (spaceFresh && this.state.isJumping) {
                // PARKOUR — der FRISCHE Druck in der Luft: Wand-/Doppelsprung
                // (No-op ohne Studio-Gesetz/Kontakt/Kontingent — byte-alt).
                if (this._parkourLuftsprung()) this.state._jumpPressedAt = -Infinity;
            }
            // PARKOUR — KLETTERN: W gegen die frische Wand (der Kontakt bleibt frisch, solange man hineindrückt)
            // zehrt Ausdauer und trägt den Körper — der Step liest _parkourKletter als Steig-vy statt
            // Schwerkraft. Erschöpft/W los/Wand weg → Fall. Frische-Fenster = kontaktFrischeSec (parkour-Gesetz).
            let kletterV = 0;
            if (
                parkG &&
                this.state.keys["w"] &&
                !slide &&
                Number.isFinite(this.state._wandKontaktAt) &&
                currentTime - this.state._wandKontaktAt < parkG.kontaktFrischeSec
            ) {
                const plK = this.state.player;
                if (plK && plK.stamina > 0) {
                    kletterV = Number.isFinite(parkG.kletterV) ? parkG.kletterV : 3.2;
                    // ZWILLINGS-ABSCHIED (19.07.): der 12er-Ternary-Zwilling fiel —
                    // kletterAusdauerProS steht in der Gültigkeits-Wand von _parkourGesetz.
                    plK.stamina = Math.max(0, plK.stamina - parkG.kletterAusdauerProS * nowDt);
                    this.state.isInAir = true;
                }
            }
            this.state._parkourKletter = kletterV;
        }
    }

    // ===== DETERMINISTISCHER INPUT-REPLAY =====
    // Die Spieler-Simulation ist eine REINE Funktion (Position × Dichtefeld × Input × dt) — kein
    // Float-Drift, kein Math.random, keine ungemessene Zeit: derselbe Start + dieselbe Input-Folge ⇒
    // bit-identisches Ergebnis. Die bit-Gleichheit zweier Läufe IST der Beweis; Lockstep-MP baut darauf.

    // Hält den Input dieses Frames fest (im Loop nach `_loopPlayerMovement`). Genau die
    // Größen, die Bewegung + Feld-Schritt deterministisch treiben: die WASD/Shift/Space-Tasten,
    // der Blick-Yaw und das Zeit-Delta.
    _replayCaptureFrame(delta) {
        const rec = this.state._replayRec;
        if (!rec) return;
        if (rec.frames.length >= AnazhRealm.REPLAY_MAX_FRAMES) {
            this.state._replayRec = null; // Sicherheits-Cap gegen unbegrenztes Wachstum
            return;
        }
        const k = this.state.keys || {};
        rec.frames.push({
            dt: delta,
            yaw: this.state.yaw,
            w: !!k["w"],
            a: !!k["a"],
            s: !!k["s"],
            d: !!k["d"],
            shift: !!k["shift"],
            space: !!k[" "],
        });
    }

    // Beginnt eine Aufnahme: friert den Start-Zustand ein (Position + die feld-eigene
    // Velocity + `_fieldVy` + Yaw) und öffnet den Frame-Puffer.
    startReplayRecording() {
        const s = this.state,
            pm = s.playerMesh;
        if (!pm || !s.playerVel) return false;
        s._replayRec = {
            start: this._replaySnapshotState(),
            frames: [],
        };
        return true;
    }

    stopReplayRecording() {
        const rec = this.state._replayRec;
        this.state._replayRec = null;
        return rec;
    }

    // Der vollständige deterministische Zustand des Spieler-Schritts.
    _replaySnapshotState() {
        const s = this.state,
            pm = s.playerMesh;
        return {
            x: pm.position.x,
            y: pm.position.y,
            z: pm.position.z,
            vx: s.playerVel.x(),
            vy: s.playerVel.y(),
            vz: s.playerVel.z(),
            fieldVy: s._fieldVy || 0,
            yaw: s.yaw,
        };
    }

    // Spielt eine Aufnahme DETERMINISTISCH ab: setzt den Start zurück und füttert jede
    // Input-Frame durch DENSELBEN Pfad wie der Loop (`_stepCharacter` dann
    // `_loopPlayerMovement`, in der Loop-Reihenfolge). Gibt den End-Zustand zurück.
    // Reiner Replay (keine Welt-Mutation außer dem Spieler) → mehrfach aufrufbar.
    replayRun(rec) {
        if (!rec || !Array.isArray(rec.frames)) return null;
        const s = this.state,
            pm = s.playerMesh;
        if (!pm || !s.playerVel) return null;
        // Start restaurieren.
        pm.position.set(rec.start.x, rec.start.y, rec.start.z);
        s.playerVel.setValue(rec.start.vx, rec.start.vy, rec.start.vz);
        s._fieldVy = rec.start.fieldVy;
        s.yaw = rec.start.yaw;
        // Die Bewegungs-/Erdungs-Hilfszustände auf einen sauberen Start setzen, damit
        // zwei Replays vom selben Start wirklich bit-gleich laufen (kein Carry-over).
        const savedKeys = s.keys;
        const savedLastMove = s._lastMoveT;
        const savedWasGrounded = s._fieldWasGrounded;
        s._fieldWasGrounded = false;
        let t = 0;
        s._lastMoveT = 0;
        for (let i = 0; i < rec.frames.length; i++) {
            const f = rec.frames[i];
            s.keys = { w: f.w, a: f.a, s: f.s, d: f.d, shift: f.shift, " ": f.space };
            s.yaw = f.yaw;
            t += f.dt;
            // Loop-Reihenfolge: erst der Feld-Schritt (integriert die Velocity des
            // Vorframes + Kollision), dann die Bewegung (setzt die neue Intent-Velocity).
            this._stepCharacter(f.dt, t);
            this._loopPlayerMovement(t);
            this._rittSchritt(f.dt);
        }
        const end = this._replaySnapshotState();
        s.keys = savedKeys;
        s._lastMoveT = savedLastMove;
        s._fieldWasGrounded = savedWasGrounded;
        return end;
    }

    _loopSelfAnalysis(currentTime) {
        // ### Selbstanalyse + Nexus-Evolution-Trigger ###
        // `selfAwarenessAnalyze` macht den FPS-/Tunneling-/Boden-Check, `evolveNexus` queued ein
        // DSL-Programm in den `nexusEvolutionQueue` (Zeit-Schwelle 5 s).
        if (currentTime - this.state.lastSelfAnalysis >= 5.0) {
            this.selfAwarenessAnalyze();
            // Wirk-Tropf: langsame Grund-Regeneration gegen permanente Verarmung (die echte Regeneration ist
            // die Wertung); atmet mit der Balance (ruhig → voll, gekippt → 40 %).
            if (this.state.nexusWirk === undefined) this.state.nexusWirk = AnazhRealm.NEXUS_WIRK.start;
            this.state.nexusWirk = Math.min(
                AnazhRealm.NEXUS_WIRK.max,
                this.state.nexusWirk + AnazhRealm.NEXUS_WIRK.idleRegenPer5s * (0.4 + 0.6 * this._emotionBalanceFactor())
            );
            // V18.112 — E4-KRISTALL+E5: am selben Takt prüft der Nexus, ob eine
            // wiederholt bewährte Geste zum GESETZ kristallisiert (cooldown-
            // gegated; läuft durch die Queue → zahlt am Wirk-Tor wie alles).
            if (typeof this._crystallizeGestureRule === "function") this._crystallizeGestureRule(currentTime);
            // E3 (gigant-plan §5 — Mana-Symmetrie): MANA regeneriert am SELBEN
            // 5-s-Takt — schneller, wo der Spieler magie-leitend IST (statTags)
            // ODER auf magie-leitendem Feld steht (auraAt — das Feld speist).
            {
                const p = this.state.player;
                if (p) {
                    const tags = p.statTags || {};
                    const lead = Math.max(0, Math.min(1, tags.magieleitung || 0));
                    let fieldLead = 0;
                    const pm = this.state.playerMesh && this.state.playerMesh.position;
                    if (pm && typeof this.auraAt === "function") {
                        const a = this.auraAt(pm.x, pm.z);
                        fieldLead = Math.max(0, Math.min(1, (a && a.magieleitung) || 0));
                    }
                    p.manaMax = Math.round(40 + 80 * lead);
                    if (typeof p.mana !== "number") p.mana = p.manaMax;
                    p.mana = Math.min(p.manaMax, p.mana + 2 + 6 * (0.4 * lead + 0.6 * fieldLead));
                }
            }
            // Kein Physik-Selbstheil hier: der EINE fps-Regler ist der Perf-Regelkreis — Physik-Resets heilen
            // keinen render-gebundenen fps-Drop.
            this.journalTick(currentTime);
            // Welle 3 F — Welt-Info nur alle 5 s aktualisieren (gleicher
            // Takt wie selfAwareness; DOM-Cost ist gering aber nicht null).
            this.updateWorldInfo();
        }
        // Der Nexus atmet mit der Last: Basis-Intervall 24 s; ist der Frame über Budget (`_frameOverBudget`,
        // derselbe Zeit-Zustand wie Laub-/Ring-Regler), streckt es sich ×2 (gedeckelt) — still, nie tot.
        // Auch die Registrierung wartet auf die Bühne; nexusLastEvolution ist der Boot-Stempel → kein Burst.
        if (this.nexus && this._buehneSteht()) {
            const evoInterval = this.state.nexusEvolutionInterval * (this.state._frameOverBudget ? 2.0 : 1.0);
            if (currentTime - this.state.nexusLastEvolution >= evoInterval) {
                this.evolveNexus(currentTime);
            }
        }
    }

    _loopWeatherAndGrowth(delta) {
        // ### Kreaturen und Wetter ### — das Wachsen der Tiere (updateGrowth, ×1,01 je 5-%-Würfel, V7.66) ist gefallen:
        // die Größe ist die Achse bodySize aus der Identität (Leben-Prüfung R-D2: ×1,05 in Minuten, der Reload setzte
        // zurück).
        const _ct = performance.now();
        this.updateCreatures(delta);
        this._perfSenseLap("creatures", _ct);
        this.state.weatherEffectTime += delta;
        // Kontinuierlicher Böen-Drift (Math.random-frei): deterministische layered-sine-Modulation auf
        // weatherEffectTime (~±18 % um die Wort-Basis). `_weatherWob` ist ein Instanz-Feld (nicht
        // serialisiert); Wetter berührt den Fixed-Step nicht → Sim/Replay unberührt.
        {
            const wt = this.state.weatherEffectTime;
            const gust = Math.sin(wt * 0.19) * 0.6 + Math.sin(wt * 0.47 + 1.3) * 0.3 + Math.sin(wt * 1.13 + 3.7) * 0.1;
            this._weatherWob = 1 + 0.18 * gust; // ~[0.82, 1.18]
        }
        // Auto-Zug: zieht das Wort, das die Welt sich wünscht (`wetterWunsch` — Nexus, seine Gesetze, die Emotion, die
        // Wesen schreiben nie selbst), sonst eines aus dem Vokabular (nie zweimal dasselbe Wort), und geht sanft über die
        // Transition. Takt `WETTER_ZUG_SEK` (120 s): mit der 45-s-Transition STEHT das Wetter ~75 s. Steht das Wort des
        // Spielers (`wetterWort`), ruht der Zug. Wartet auf die Bühne (nur der Wechsel-Tick; weatherEffectTime
        // akkumuliert weiter → danach EIN weicher Zug). Headless sofort.
        if (
            !this.state.wetterWort &&
            this.state.weatherEffectTime >= AnazhRealm.WETTER_ZUG_SEK &&
            this._buehneSteht()
        ) {
            const wunsch = this.state.wetterWunsch;
            this.state.wetterWunsch = null;
            let next;
            if (wunsch && wunsch.wort in AnazhRealm.WEATHER_INTENSITY) next = wunsch.wort;
            else {
                const words = Object.keys(AnazhRealm.WEATHER_INTENSITY).filter((w) => w !== this.state.weather);
                // Deterministische Wort-Wahl (Math.random-frei): Index aus layered sines der Wall-Clock. Das Wort
                // lesen Symphonie/Journal/wet-Frage; der Wechsel ist reine Optik/Klang → Fixed-Step/Replay unberührt.
                const wc = performance.now() / 1000 + this.state.weatherEffectTime;
                const pick = Math.sin(wc * 0.131) + Math.sin(wc * 0.373 + 1.7) + Math.sin(wc * 0.911 + 4.2); // [-3,3]
                let idx = Math.floor(((pick + 3) / 6) * words.length);
                if (idx < 0) idx = 0;
                if (idx >= words.length) idx = words.length - 1;
                next = words[idx];
            }
            if (next !== this.state.weather) {
                this._setWeather(next, "auto-zug");
                this.log(`Das Wetter zieht zu ${next}${wunsch ? ` (Wunsch: ${wunsch.quelle})` : ""}`, "INFO");
            } else this.log(`Das Wetter bleibt ${next} (Wunsch: ${wunsch.quelle})`, "INFO");
            this.state.weatherEffectTime = 0;
        }
    }

    // FRAME-BUDGET-POOL: EINE Quelle für „wie viel ms hat dieser Frame für aufschiebbare Arbeit".
    // Produktion misst die Wall-Clock (`_synthSpent=null`); ein Diag setzt `_synthSpent=0` →
    // synthetisches Kosten-Modell (job.run ruft addSynthetic), hardware-unabhängig prüfbar.
    _makeFrameBudget(totalMs) {
        return {
            totalMs: Number.isFinite(totalMs) ? totalMs : 8,
            _startT: 0,
            _synthSpent: null, // null = echte Wall-Clock; Zahl = synthetisch (Diag)
            startFrame() {
                this._startT = performance.now();
                if (this._synthSpent !== null) this._synthSpent = 0;
            },
            spentMs() {
                return this._synthSpent !== null ? this._synthSpent : performance.now() - this._startT;
            },
            remainingMs() {
                return this.totalMs - this.spentMs();
            },
            addSynthetic(ms) {
                if (this._synthSpent !== null) this._synthSpent += ms;
            },
        };
    }

    // Reiner Prioritäts-Dispatcher (Job-System, single-thread). jobs: [{name, prio, run(ms)}].
    // prio 0 = HEILIG (Streaming): läuft immer ungedrosselt (Infinity); prio > 0 nur solange Budget
    // bleibt, sonst nächster Frame. Setzt KEIN State (der Aufrufer liest budget.remainingMs() für
    // `_frameOverBudget`); gibt die gelaufenen Job-Namen zurück.
    _dispatchFrameJobs(jobs, budget) {
        const ran = [];
        const sorted = jobs.slice().sort((a, b) => (a.prio || 0) - (b.prio || 0));
        // EXISTENZ-BODEN: auf render-gebundener Maschine ist remainingMs dauerhaft ≤ 0 — ohne Boden wüchsen
        // pendingWaterIso/Scatter/Grass monoton (Heap-Leck, Wasser ohne Oberfläche). Welt-SUBSTANZ (prio 1)
        // bekommt JEDEN Frame einen Zeit-Boden, Deko (prio ≥ 2) jeden 4. Frame einen kleinen — die Queues
        // MÜSSEN abfließen, der Regler atmet nur darüber.
        this._schedFrameNo = (this._schedFrameNo || 0) + 1;
        for (const job of sorted) {
            if (!job || typeof job.run !== "function") continue;
            const prio = job.prio || 0;
            const sacred = prio === 0;
            let ms = budget.remainingMs();
            if (!sacred && ms <= 0) {
                if (prio === 1) ms = AnazhRealm.FRAME_SCHED_SUBSTANZ_FLOOR_MS;
                else if (this._schedFrameNo % 4 === 0) ms = AnazhRealm.FRAME_SCHED_DEKO_FLOOR_MS;
                else continue;
            }
            try {
                job.run(sacred ? Infinity : ms);
                ran.push(job.name);
            } catch (e) {
                this._loopErrorBoundary(e);
            }
        }
        return ran;
    }

    // Deferrable-Budget (ms): Frame-Ziel (throttleMs) minus gemessene Pflicht-Kosten (Physik/Render/
    // Culling/Kreaturen aus dem perfSense). Headless → Infinity; Floor `FRAME_SCHED_MIN_MS`.
    _deferrableBudgetMs() {
        const st = this.state;
        if (st.renderer && st.renderer._isHeadlessNull) return Infinity;
        const throttleMs = Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : AnazhRealm.PERF_TARGET_MS;
        const sense = st.perfSense;
        if (!sense || !sense.phase) return Math.max(AnazhRealm.FRAME_SCHED_MIN_MS, throttleMs - 8);
        const p = sense.phase;
        const mandatory = (p.physics || 0) + (p.render || 0) + (p.archCulling || 0) + (p.creatures || 0);
        return Math.max(AnazhRealm.FRAME_SCHED_MIN_MS, throttleMs - mandatory);
    }

    // DIE TERRAIN-ZUERST-REGEL (EINE Stelle, Leser: der Deko-Job und `_foundryRewarmColdTrees`): baute dieser Takt
    // Terrain, wartet die Deko — nie länger als bis zum Existenz-Boden des Dispatchers (jeder 4. Takt, wie das leere
    // Budget), dann trägt sie ihren Boden-Anteil. Bis K40 wartete sie, solange der Strom Chunks lieferte: auf dem Radeon
    // baute jeder von 160 Takten nach einem Umzug Terrain, die Nah-Wiese lief 0-mal und 925 Büschel blieben am alten Ort.
    _dekoWartet() {
        return !!this.state._frameChunksBuilt && (this._schedFrameNo || 0) % 4 !== 0;
    }

    // Deferrable-Job-Registry (die Prioritäts-Ordnung als Daten). Terrain vor Deko: der Stream-Job (prio 0) setzt
    // `_frameChunksBuilt`, der Scatter-Deko-Job (prio 2) fragt `_dekoWartet`.
    _buildDeferrableJobs(playerPos) {
        const st = this.state;
        return [
            {
                name: "stream",
                prio: 0, // HEILIG — Terrain/Bewegung wird NIE vom Render-/Deko-Druck verhungert
                run: () => {
                    st._frameChunksBuilt = !!this._tickVoxelChunkStreaming(playerPos);
                },
            },
            {
                name: "waterIso",
                prio: 1, // Welt-Substanz (kein throttle-bares Deko), aber nach dem Terrain
                run: (ms) => {
                    const base =
                        st.atmosphere && Number.isFinite(st.atmosphere.waterIsoBudgetMs)
                            ? st.atmosphere.waterIsoBudgetMs
                            : 7;
                    // Wasser hält mit dem Terrain Schritt bis an die Ring-Kante: JEDER Rückstau zieht kräftig nach —
                    // sonst bleibt eine mitwandernde Wasser-Front hinter dem Terrain zurück (`waterK < builtK`).
                    // Der Worker trägt die CA-freie ferne See off-thread; die Zeit-Deadline schützt vor dem Freeze,
                    // Restlücken deckt der Fern-Ring (Loch-Deckel, Wasser flach auf dem Spiegel).
                    const backlog = st.pendingWaterIso && st.pendingWaterIso.size > 0;
                    const cap = backlog ? Math.max(base, 22) : base;
                    const dl = Math.min(Number.isFinite(ms) ? ms : Infinity, cap);
                    const _wt = performance.now();
                    this._tickPendingWaterIso(backlog ? 32 : 4, dl);
                    this._perfSenseLap("waterIso", _wt);
                },
            },
            {
                name: "scatterDeco",
                prio: 2, // reine Optik — wartet, wenn das Terrain diesen Frame baute oder das Budget leer ist
                run: (ms) => {
                    if (this._dekoWartet()) return; // erst der Boden, dann der Wald — nie verhungert
                    // Scatter mit `_perfSenseLap`-Tap (phase.scatter in perfSense + Flugschreiber — neue welt-formende
                    // Last wird attribuiert). Das ms-Budget fließt durch: der Region-Bau läuft in ≤SCATTER_SLICE_MS-
                    // Scheiben statt atomar (~54 ms), damit die Deko den Ring-Kopfraum-Timer nicht resetet.
                    // Headless: budget=Infinity → One-Shot; im Takt mit Terrain-Bau trägt die Deko nur ihren Boden.
                    const msDeko = st._frameChunksBuilt ? Math.min(ms, AnazhRealm.FRAME_SCHED_DEKO_FLOOR_MS) : ms;
                    const _dl = Number.isFinite(msDeko)
                        ? performance.now() + Math.min(msDeko, AnazhRealm.SCATTER_SLICE_MS)
                        : undefined;
                    const _sct = performance.now();
                    this._tickScatterStreaming(playerPos, _dl);
                    this._tickPendingGrass(1);
                    this._tickScatterRegrow(performance.now());
                    this._tickNahWiese(_dl);
                    this._tickNahStreu(_dl);
                    this._perfSenseLap("scatter", _sct);
                    const nowTiles = performance.now();
                    const lastTileCheck = this._lastHydroTileCheck ?? -Infinity;
                    if (nowTiles - lastTileCheck > 1000 && playerPos) {
                        this._lastHydroTileCheck = nowTiles;
                        const ringR = (st.chunkRingRadius || 4) + 0.5;
                        const reach = ringR * this._voxelChunkConfig(0).span + 300;
                        this._ensureHydroTilesAround(playerPos.x, playerPos.z, reach);
                    }
                },
            },
        ];
    }

    // ═══ DIE STAND-WACHE (Welle K, Lehre 25, Gebot 7) ═══
    // Befund 07.10. (OMEN, GTX 1060, Mess-Wiese, Regler voll, der Spieler STEHT): `_loopVoxelStreaming` kostete 3,27 ms je
    // Frame, `tickArchitectureCulling` · `_tickArchitectureLOD` · `_lodTreeVisHeight` · noise2D standen im Selbstzeit-Top.
    // Gezählt an der Mess-Wiese (Radeon, eingeschwungen, Stand): je Frame gingen die Fege-Takte ~6 000 Blatt-Rufe — Ring 83,
    // Stufen-Wahl 1 710, Cull 3 512, Streu 480, Nah-Streu 138, Nah-Wiese 6, Saum 384 (~6 000 noise2D) — und änderten nichts.
    // DAS GESETZ: ein Fege-Takt (ein Gang über die Nachbarschaft — Ring, Einträge, Zellen, Kacheln, Saum-Punkte) fragt vor
    // dem Gang `_standRuht(name, runde, ort, art)` und meldet danach `_standMeldet(name, besucht, gewirkt, offen)`. Er
    // schläft, sobald er unter seinem Stempel und an SEINEM Ort einen vollen Gang (`runde` Einheiten) ohne Wirkung und ohne
    // Offenes ging. Was ihn weckt, ist genau, was seine Urteile lesen:
    //   · der Stempel (`_standStempel`) — die Welt-Regung (`_weltRegt`: jede Mengen-Änderung — Chunk, Bau, Streu-Region und
    //     ihre Zellen, Ernte, Kacheln; gate:stand-takt SCHREIBER verlangt den Weckruf auf jedem Pfad jedes Schreibers), die
    //     Foundry-Ankunft, die Antwort und das Buch des Studios, die Wahrnehmung und die LOD-Distanzen, die Regler
    //     (Wahrnehmungs-Faktor, lodRef, Ring, Cull-Radius), der
    //     Wasserspiegel; die BODEN-Takte (Ring, Saum) lesen nur ihren Boden-Stempel (`_standStempelBoden`: die Chunk-Menge,
    //     die Ring-Regler, der Wasserspiegel);
    //   · die BAU-Takte (Stufen-Wahl, Cull) lesen einander: wirkt einer (eine Stufe, ein Mesh), gehen beide (`_bauRegt`);
    //     die Wirkung der Streu, der Kacheln, des Saums weckt niemanden sonst — sie geht nur selbst noch einmal;
    //   · der Ort: der Ring die Spieler-Zelle, der Saum die Anker-Generation des Fern-Rings, Stufen-Wahlen und Kacheln Spieler
    //     oder Auge auf STAND_RAND_M, der Cull (Urteile ab 100 m) auf STAND_RAND_FERN_M — so kostet Gehen nur, was es ändert.
    // Offenes (ein Asset lädt, ein Budget ist leer) hält nur den eigenen Takt wach. Die Zeit weckt nie: Takte mit eigener Uhr
    // (Nachwuchs, Jahreszeit, Regen, Wasser-Automat, Karten-Bäcker, Dirty-Chunks) stehen nicht unter der Wache.
    // Die Wand: gate:stand-takt (Ruhe 0, Treue, Wecken, Gehen, Strom; der Bruch fällt rot).
    // `boden`: die Chunk-Menge regt sich — das weckt auch die Boden-Takte.
    // `stufe` (K51-5): ein Chunk tauschte nur seine Stufe (`_rebuildVoxelChunk`) — die Menge steht, es regt sich nur die
    // Boden-Karte, die die Karten-Takte (Nah-Wiese, Nah-Streu: `_bodenSichtAt`) lesen; Stufen-Wahl, Cull, Streu, Ring und
    // Saum lesen sie nicht (gehend an der Mess-Wiese weckte jeder Wechsel alle Fege-Takte samt Sichthöhen).
    _weltRegt(boden, stufe) {
        if (stufe === true) {
            this._karteRegung = (this._karteRegung | 0) + 1;
            return;
        }
        this._weltRegung = (this._weltRegung | 0) + 1;
        if (boden) this._bodenRegung = (this._bodenRegung | 0) + 1;
    }

    // Der EINE Stempel der Wache: wächst, sobald eine ortsfreie Eingabe der Fege-Takte sich ändert.
    _standStempel() {
        const st = this.state;
        const W = this._standWache || (this._standWache = { stempel: 0, v: [], takte: new Map() });
        const v = W.v;
        let i = 0,
            neu = false;
        const setze = (x) => {
            if (!Object.is(v[i], x)) {
                v[i] = x;
                neu = true;
            }
            i++;
        };
        setze(this._weltRegung | 0);
        setze(st._foliageDensityScale); // der EINE Regler: Wahrnehmungs-Faktor der Stufen-Wahl und Verdeckungs-Schwelle
        setze(st.lodRef);
        setze(st.chunkRingRadius);
        setze(st._activeRingRadius); // der Boot-Ring wächst bis zum Ziel (`_voxelChunkConfig`)
        setze(st.architectureCullingRadius);
        const f = this._foundry;
        setze(f ? f.ankunft | 0 : -1);
        // was die Takte ortsfrei vom Studio lesen, liest der Stempel selbst (kein Schreiber kann den Weckruf vergessen): die
        // Antwort des Studios, das Buch (Rezepte, Vorlagen), die Wahrnehmung (Stufen-Klammer, Budget, Sichtweite) und die
        // LOD-Distanzen, die `_foundryIngestRenderConfig` (oder wer auch immer) in die EINE LOD-Quelle schreibt
        setze(!!(f && f.ready));
        setze(f ? f.recipes : null);
        setze(AnazhRealm._studioRenderConfig);
        const D = AnazhRealm.LOD_DISTANCES;
        setze(D.thresh01);
        setze(D.thresh12);
        setze(D.hysteresis);
        setze(D.fade);
        setze(D.fade0);
        setze(st.waterLevel);
        setze(st.foundryCrossfade === true);
        setze(!!(st.atmosphere && st.atmosphere.treeLOD === false));
        setze(st.useOcclusionDemotion !== false);
        setze(st.voxelTerrainActive === true);
        if (neu) W.stempel++;
        return W.stempel;
    }

    // Der Stempel der BODEN-Takte: der Ring liest Chunk-Menge, Ring-Regler und Spieler-Zelle, der Saum Chunk-Menge,
    // Wasserspiegel und Anker — die Wirkung der anderen Fege-Takte (eine Stufe, ein Bau, eine Kachel) weckt sie nicht. Beim
    // Gehen gehen sie nur, wo die Zelle oder der Anker wechselt oder ein Chunk kommt und geht.
    _standStempelBoden() {
        const st = this.state;
        const W = this._standWache || (this._standWache = { stempel: 0, v: [], takte: new Map() });
        const b = W.boden || (W.boden = { stempel: 0, v: [] });
        const jetzt = [
            this._bodenRegung | 0,
            st.chunkRingRadius,
            st._activeRingRadius,
            st.waterLevel,
            st.voxelTerrainActive === true,
        ];
        if (jetzt.some((x, i) => !Object.is(b.v[i], x))) {
            b.v = jetzt;
            b.stempel++;
        }
        return b.stempel;
    }

    // Schläft der Fege-Takt `name`? Ja, wenn er unter dem jetzigen Stempel (`boden`: dem der Boden-Takte) und an seinem Ort
    // `runde` Einheiten ohne Wirkung ging. `ort`: ein Wert, den der Takt liest (die Spieler-Zelle, die Anker-Generation —
    // neu, sobald er anders ist), oder `{ pos, rand }`: ein Anker, neu, sobald `pos` mehr als `rand` Meter von ihm weg ist
    // (ein Zittern der Physik um Millimeter weckt nichts).
    _standRuht(name, runde, ort, art) {
        const s = art === "boden" ? this._standStempelBoden() : this._standStempel();
        const W = this._standWache;
        let t = W.takte.get(name);
        if (!t) {
            t = {
                stempel: s,
                ort: undefined,
                anker: null,
                bau: art === "bau",
                bauRegung: -1,
                karte: art === "karte",
                karteRegung: -1,
                leer: 0,
                ruht: 0,
                arbeit: 0,
            };
            W.takte.set(name, t);
        }
        let neu = t.stempel !== s;
        // DIE BAU-TAKTE (Stufen-Wahl und Cull) lesen einander: eine neue Stufe, ein gebautes oder geräumtes Mesh weckt beide —
        // nie die Streu, die Kacheln oder den Boden, die ihre Urteile nicht lesen.
        if (t.bau && t.bauRegung !== (this._bauRegung | 0)) {
            t.bauRegung = this._bauRegung | 0;
            neu = true;
        }
        // DIE KARTEN-TAKTE (`karte`) lesen die Boden-Karte: ein Stufen-Wechsel (`_weltRegt(true, true)`) weckt nur sie
        if (t.karte && t.karteRegung !== (this._karteRegung | 0)) {
            t.karteRegung = this._karteRegung | 0;
            neu = true;
        }
        if (ort !== null && typeof ort === "object") {
            const p = ort.pos;
            const a = t.anker;
            if (p && (!a || (p.x - a.x) ** 2 + (p.y - a.y) ** 2 + (p.z - a.z) ** 2 > ort.rand * ort.rand)) {
                t.anker = { x: p.x, y: p.y, z: p.z };
                neu = true;
            }
        } else if (!Object.is(t.ort, ort)) {
            t.ort = ort;
            neu = true;
        }
        if (neu) {
            t.stempel = s;
            t.leer = 0;
        }
        if (t.leer >= Math.max(1, runde | 0)) {
            t.ruht++;
            return true;
        }
        return false;
    }

    // Der Gang ist gegangen: `besucht` Einheiten, `gewirkt` = er änderte die Welt (er geht noch einmal; ein Bau-Takt weckt
    // den anderen), `offen` = er wartet auf etwas (hält sich selbst wach).
    _standMeldet(name, besucht, gewirkt, offen) {
        const t = this._standWache ? this._standWache.takte.get(name) : null;
        if (!t) return;
        t.arbeit += besucht;
        if (gewirkt) {
            t.leer = 0;
            if (t.bau) this._bauRegt();
        } else if (offen) t.leer = 0;
        else t.leer += besucht;
    }

    // Ein Bau-Eintrag änderte Stufe oder Gestalt (ein Bau-Takt wirkte, ein Studio-Asset dockte an): die Bau-Takte gehen.
    _bauRegt() {
        this._bauRegung = (this._bauRegung | 0) + 1;
    }

    // Dispatcher-Lauf (Verteil-Schicht, KEIN zweiter Regler): die fixen günstigen Ticks (vegSpawns/
    // archLOD/canopy/waterCA/dirtyChunks) laufen immer, die budgetierten durch `_dispatchFrameJobs`.
    // `_frameOverBudget` ist die FOLGE des Schedulers (Budget leer).
    _runFrameScheduler(playerPos) {
        const st = this.state;
        this._ensureFarWaterSheet(); // V18.381 — steady-state No-op (Anker-Hysterese), Rebuild budget-gegated
        const B = st._frameBudget || (st._frameBudget = this._makeFrameBudget());
        B.totalMs = this._deferrableBudgetMs();
        B.startFrame();
        st._frameChunksBuilt = false;
        this._dispatchFrameJobs(this._buildDeferrableJobs(playerPos), B);
        // die fixen, NICHT budget-gegateten Ticks (UNGATED Welt-Substanz + billige Ticks)
        this._tickPendingVegSpawns(4);
        const auge = this._lodAuge(); // das EINE Auge der Stufen (Maske und Wahl messen vom selben Ort)
        this._tickArchitectureLOD(5, auge);
        // DER KARTEN-BÄCKER (einer in Flug, Kanal "bake-impostor" zum Studio-Bäcker, die Platte liefert gebackene
        // Karten sofort; lazy beim ersten L2-Bedarf enqueued; headless No-op) läuft hier, ungegatet wie sein eigenes
        // Gesetz („EAGER, netto last-senkend"). Bis 04.10. hing er im Deko-Job (prio 2: nur ohne Chunk-Bau im Frame,
        // unter Last jeden 4. Frame) — beim Boot an der Mess-Wiese standen 60 s lang 10 von 11 Karten ungebacken in der
        // Schlange, und jeder Baum, der seine Karte brauchte, blieb als Kapsel-Klumpen stehen (141 Sätze < 64 m).
        this._tickImpostorBake();
        this._tickTrefferGliederVorbacken(); // die Treffer-Glieder einer kalten Gattung, im Takt der EINEN Bake-Uhr
        this._tickScatterLod(auge, 4, 160); // V18.464 — der Fernwald folgt der LIVE-Distanz (baum-D1), vom Auge (K36)
        this._tickFernRing(playerPos); // STUFE 2 (das-feld-zeichnet §2) — der Horizont-Tick (headless-default No-op)
        this._tickWegeKarte(playerPos); // Wege-, Kronen- und Fluss-Karte folgen dem Spieler
        this._wegeRaeumen(); // die neuen Flächen eines Dorfs räumen die Natur, die schon auf ihnen stand (K52)
        this._tickSeason(performance.now()); // JAHRESZEIT: die langsame Jahres-Uhr (Foundry-Phaenologie)
        this._tickRain(performance.now()); // WETTER: sichtbarer Regen bei rainy/stormy
        this._tickCanopyStreaming();
        this._tickWorldWaterCA();
        this._tickDirtyVoxelChunks(playerPos);
        // `_frameOverBudget` als FOLGE des leeren Budgets (zusätzliches Signal; der Regler setzt
        // es am Frame-Ende weiter aus frameMs — die volle Vereinheitlichung kommt mit dem Default-an).
        if (B.remainingMs() <= 0) st._frameOverBudget = true;
    }

    _loopVoxelStreaming() {
        // Der Frame-Budget-Scheduler dirigiert die deferrable Streaming-Arbeit: Streaming heilig [prio 0],
        // Wasser [prio 1], Deko [prio 2]; Terrain zuerst über `_dekoWartet` (nie verhungert). EIN Pfad.
        return this._runFrameScheduler(this.state.playerMesh.position);
    }

    _loopSkyboxZeit(currentTime) {
        // time-Uniform lebt in state.skyboxUniforms; Existenz-Probe, weil createGalaxySkybox bei
        // Vendor-Bruch früh returnen kann.
        if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) {
            this.state.skyboxUniforms.time.value = currentTime;
        }
    }

    _loopAutoSave(currentTime) {
        // ### Speichern ###
        if (currentTime - this.state.lastSaveUpdate >= this.state.saveInterval) {
            this.saveState();
            this.state.lastSaveUpdate = currentTime;
        }
        if (
            !this.state.isServerSaveInFlight &&
            currentTime - this.state.lastServerSaveUpdate >= this.state.serverSaveInterval
        ) {
            this.state.isServerSaveInFlight = true;
            this.saveToProjectFolder({ fallbackToDownload: false }).finally(() => {
                this.state.isServerSaveInFlight = false;
            });
            this.state.lastServerSaveUpdate = currentTime;
        }
    }

    // DIE EGO-SICHT AM CHOKEPOINT: der EINE Schreiber der 1st/3rd-Person-Avatar-Sicht (Kopf-Part + _creatureSkin-Wrap;
    // 3rd sieht das Auge den Leib, 1st nicht — die Kamera sitzt im Leib). Aufrufer: Avatar-Guss (applyPlayerSoul),
    // Modus-Schalter (setCameraMode) und _loopCamera (idempotenter Halter, je Frame vor dem Render) — lebte die Regel nur
    // im per-Frame-Tick, zeigte jeder Render davor den Kopf von innen.
    // DER EINE EBENEN-SCHALTER (0910-5): im 1st verlässt der Leib die Ebene 0 der Haupt-Kamera und liegt auf
    // SHADOW_TWIN_LAYER — die Kaskaden sehen ihn GANZ (wie den Kronen-Zwilling), das Auge nie. Bis 0910-5 schaltete die
    // Regel `visible` und nahm mit der Haut den Wurf: in der Ego-Sicht, dem Standard-Blick, warf der Spieler keinen Schatten
    // (Lehre 26: unsichtbar für die Haupt-Kamera heißt Ebene, nie Transparenz). `visible` bleibt unberührt — die Stufen-Regel
    // (`_gelenkStufe`) behält ihr Wort. Ebenen erbt kein Kind: die Regel geht jeden Knoten, verschiebt nur, was auf
    // Ebene 0 liegt, und merkt dessen Maske (`_maskeVorEgo`); 3rd gibt genau sie zurück — ein Knoten, der schon nur in den
    // Kaskaden lebt (ein Zwilling), bleibt, wie er ist. Das Gerät in der Hand (`_gehalten`, _refreshHeldMesh) ist keine
    // Haut: es bleibt auf Ebene 0, das Auge sieht es, es wirft. Es hängt am Handgelenk IN der Hülle (Welle LF 09.10., K-L4:
    // eine verborgene Hülle nahm es mit, Bild ks01) — r184 projiziert die Kinder jedes Knotens ohne Ebenen-Test, so zeichnet
    // es unter Knochen auf Ebene 2 (gate:vendor-anker). Je Aufruf über den Baum (rund hundert Knoten): eine neue Haut
    // (Seelen-Wechsel, Kleid) oder ein neues Gerät gilt sofort.
    _applyEgoSicht() {
        const player = this.state.playerMesh;
        if (!player) return;
        const third = this.state.cameraMode === "third";
        const zwilling = 1 << AnazhRealm.SHADOW_TWIN_LAYER;
        const leib = (o) => {
            const u = o.userData;
            if (u._gehalten) return;
            const m = o.layers.mask;
            if (third) {
                if (u._maskeVorEgo !== undefined) {
                    o.layers.mask = u._maskeVorEgo;
                    u._maskeVorEgo = undefined;
                }
            } else if (m & 1) {
                u._maskeVorEgo = m;
                o.layers.mask = (m & ~1) | zwilling;
            }
            for (const k of o.children) leib(k);
        };
        const headPart = player.userData && player.userData.parts && player.userData.parts.head;
        if (headPart) leib(headPart);
        for (const ch of player.children) {
            if (ch && ch.userData && ch.userData._creatureSkin) leib(ch);
        }
    }

    // DIE BLICK-WAHRHEIT (Welle L 06.10., Befunde K-D14 + V-D4): EINE Vorwärts-Richtung aus Gier und Neigung,
    // (sin yaw · cos pitch, sin pitch, cos yaw · cos pitch) — yaw 0 blickt nach +z. Sie lesen die Ego-Kamera, der
    // Pfeil, das Bau-Phantom, jede „vor dir"-Position der DSL und das Dorf-Ausrichten (Neigung 0 = waagrecht vorn).
    // Vorher rechnete jeder Leser seine eigene: die Kamera ohne cos(pitch) (Blick bei Pitch −90° nur −45°), „vor dir"
    // mit −(sin, cos) (die Birken standen HINTER dir, cos −0,96…−1,00). Die Neigung bleibt eine Haaresbreite unter
    // ±90° (lookAt braucht eine waagrechte Spur der Gier).
    _blickVorn(yaw, pitch, out) {
        const g = Math.PI / 2 - 1e-3;
        const p = Math.max(-g, Math.min(g, Number.isFinite(pitch) ? pitch : 0));
        const y = Number.isFinite(yaw) ? yaw : 0;
        const o = out || {};
        const cp = Math.cos(p);
        o.x = Math.sin(y) * cp;
        o.y = Math.sin(p);
        o.z = Math.cos(y) * cp;
        return o;
    }

    // Die Gier, die in die Richtung (dx, dz) blickt — die Umkehrung von _blickVorn (Dorf-Ausrichten).
    _blickGierZu(dx, dz) {
        return Math.atan2(dx, dz);
    }

    // DER STRAHL DES FADENKREUZES (Gegenprüfung Runde 2): jede Probe durch die Bildmitte — Bau-Pick, Welt-Treffer (Pfeil ·
    // Graben · Aufschütten), Bau-Phantom, Kreatur-Pick, Streu-Pick, Brennglas, Blick-Ziel, Klingen-Achse — nimmt DIESEN
    // Strahl: die Richtung der Kamera, der Anfang dort, wo er die Ebene des Ziels (`_kamZielSetzen`: 3rd die Brust) kreuzt.
    // Was davor liegt, zwischen Auge und Spieler, ist durchsichtig (`_durchsichtGewicht`) und wird nie getroffen — ab der
    // Kamera trafen die Strahlen in 3rd die durchsichtige Pflanze HINTER dem Spieler (12 Bäume × 8 Richtungen: Bau-Pick 76,
    // Welt-Treffer 67 von 96): der Pfeil flog nach hinten, Graben und Phantom landeten hinter ihm, ein Klick fällte den
    // unsichtbaren Baum. Im 1st ist das Ziel das Auge, der Strahl beginnt an der Kamera. Rückgabe { o, d } (wiederverwendet;
    // o der Anfang, d die Einheits-Richtung) oder null ohne Kamera.
    _fadenkreuzStrahl() {
        const cam = this.state.camera;
        if (!cam || typeof cam.getWorldDirection !== "function") return null;
        const F = this._fkStrahl || (this._fkStrahl = { o: new THREE.Vector3(), d: new THREE.Vector3() });
        cam.getWorldDirection(F.d);
        const c = cam.position;
        F.o.copy(c);
        const z = this.state._kamZiel;
        // das Ziel gilt nur der Kamera-Stellung, für die `_kamZielSetzen` es schrieb (eine Sonde, die die Kamera selbst
        // stellt, hat keines)
        if (z && Math.abs(z.ex - c.x) + Math.abs(z.ey - c.y) + Math.abs(z.ez - c.z) < 1e-6) {
            // die Ebene durch das Ziel, senkrecht zum Sicht-Strahl Auge → Ziel: s = |Z − C|² / ((Z − C) · d)
            const zx = z.x - c.x;
            const zy = z.y - c.y;
            const zz = z.z - c.z;
            const L2 = zx * zx + zy * zy + zz * zz;
            const k = zx * F.d.x + zy * F.d.y + zz * F.d.z;
            if (L2 > 1e-8 && k > 1e-6) F.o.addScaledVector(F.d, L2 / k);
        }
        return F;
    }

    // DER FADENKREUZ-PUNKT: wo der Strahl des Fadenkreuzes (`_fadenkreuzStrahl`) zuerst trifft — ein Tier (_pickCreatureAtCrosshair)
    // oder die Welt (Gelände und Bauten, _raycastWorldHit) —, sonst der Punkt in maxDist auf dem Strahl. Der Pfeil zielt darauf:
    // aus der Mündung an der Schulter kreuzt er das Fadenkreuz am Ziel. DAS TIER ZUERST (Welle LF, Posten 4): vorher zählte nur
    // die Welt — der Pfeil zielte auf das Gelände HINTER dem Tier und flog aus der tieferen Mündung bei 13 m 0,4 m unter dem
    // Punkt des Fadenkreuzes durch, zwischen den Läufen unter dem Bauch hindurch.
    _blickZiel(maxDist) {
        const F = this._fadenkreuzStrahl();
        if (!F) {
            const pm = this.state.playerMesh;
            const v = this._blickVorn(this.state.yaw, this.state.pitch);
            const o = pm ? pm.position : { x: 0, y: 0, z: 0 };
            return { x: o.x + v.x * maxDist, y: o.y + 1.6 + v.y * maxDist, z: o.z + v.z * maxDist };
        }
        const hit = this._raycastWorldHit(maxDist);
        const ox = F.o.x,
            oy = F.o.y,
            oz = F.o.z;
        const tier = this._pickCreatureAtCrosshair();
        const pt = tier && tier.point;
        const dT = pt ? Math.hypot(pt.x - ox, pt.y - oy, pt.z - oz) : Infinity;
        const dW = hit && hit.hit ? Math.hypot(hit.x - ox, hit.y - oy, hit.z - oz) : Infinity;
        if (dT <= maxDist && dT < dW) return { x: pt.x, y: pt.y, z: pt.z };
        if (hit && hit.hit) return { x: hit.x, y: hit.y, z: hit.z };
        return { x: ox + F.d.x * maxDist, y: oy + F.d.y * maxDist, z: oz + F.d.z * maxDist };
    }

    // DAS ZIEL DER KAMERA (`uKamZiel` und `state._kamZiel`, Leben-Schau 07.10. L-Kamera): wohin das Auge blickt — 3rd der
    // Blickpunkt (die Brust, zu Fuß um die Schulter versetzt), mit dem Radius, bis zu dem eine Pflanze um den Sicht-Strahl durchsichtig wird (zu Fuß KAMERA_DURCHSICHT.fussM,
    // im Ritt rittM: der Wagen ist breiter als der Leib); 1st das Auge selbst (die Strecke ist leer). Dazu die NAH-KUGEL um
    // das Auge (`uKamNah`, Leben-Schau 2, 09.10.): `nahLaub`, `nahRinde`, `nahBoden` je Stoff-Art (`_kameraDurchsichtNode`)
    // — in 3rd hält der Schreiber jede Kugel samt Saum vor der Ebene des Ziels (der Stamm vor dem Spieler steht, der Strahl
    // des Fadenkreuzes beginnt auf ihr und trifft nie Durchsichtiges; Infinity heißt: bis an diese Ebene), −Saum heißt:
    // nichts fällt. Die Durchsicht (`_durchsichtGewicht`) und der Strahl des Fadenkreuzes (`_fadenkreuzStrahl`) lesen
    // dasselbe Ziel. Der EINE Schreiber ist `_loopCamera`, je Bild nach dem Setzen der Kamera.
    _kamZielSetzen(x, y, z, r, nahLaub, nahRinde, nahBoden) {
        const k =
            this.state._kamZiel ||
            (this.state._kamZiel = { ex: 0, ey: 0, ez: 0, x: 0, y: 0, z: 0, r: 0, nl: 0, nr: 0, nb: 0 });
        // das Auge, für das das Ziel gilt: die eben gesetzte Spieler-Kamera — eine Sonde, die die Kamera selbst stellt, hat
        // kein Ziel (ihr Strahl beginnt an ihr, ihr Bild schneidet nur die Strecke des Spielers)
        const c = this.state.camera.position;
        const S = AnazhRealm.KAMERA_DURCHSICHT.saumM;
        const L = Math.hypot(x - c.x, y - c.y, z - c.z);
        const deckel = L > 1e-4 ? L - S : Infinity; // in 3rd endet die Kugel samt Saum vor der Ebene des Ziels
        const radius = (n) => {
            const v = typeof n === "number" && !Number.isNaN(n) ? Math.min(n, deckel) : -S;
            return Number.isFinite(v) ? Math.max(-S, v) : -S;
        };
        const nl = radius(nahLaub);
        const nr = radius(nahRinde);
        const nb = radius(nahBoden);
        k.ex = c.x;
        k.ey = c.y;
        k.ez = c.z;
        k.x = x;
        k.y = y;
        k.z = z;
        k.r = r;
        k.nl = nl;
        k.nr = nr;
        k.nb = nb;
        const lu = this.state.lodUniforms;
        if (lu && lu.uKamZiel) lu.uKamZiel.value.set(x, y, z, r);
        if (lu && lu.uKamAuge) lu.uKamAuge.value.set(c.x, c.y, c.z);
        if (lu && lu.uKamNah) lu.uKamNah.value.set(nl, nr, nb);
    }

    _loopCamera(currentTime) {
        // ### Kamera ###
        // V9.44-f — player/camera kamen vorher aus der Bewegungs-Sektion
        // (gemeinsame Loop-locals); jetzt aus this.state neu gelesen.
        const player = this.state.playerMesh;
        const camera = this.state.camera;
        // DIE KAMERA-FÜHRUNG eines Studios (`kameraFuehren`): solange eine steht, setzt SIE die Kamera — der Spieler bleibt,
        // wo er ist, die Welt streamt um ihn wie immer.
        if (this._kameraFuehrung && player && camera) {
            this._kameraFuehrung(camera, currentTime, player.position);
            return;
        }
        if (player && camera) {
            // Spieler-Mesh in Yaw-Richtung drehen, damit die Seele in
            // Bewegungsrichtung schaut — wichtig für asymmetrische Formen
            // (Drache hat lange Z-Achse) und Vorbereitung für V2-Glieder.
            player.rotation.y = this.state.yaw;
            // Fahrer sitzt in der Kabine: die Studio-Karosserien (huelle) sind geschlossen, der Gesetz-Sitz
            // (0.475 m) liegt unter dem Dach → beim Gesetz-Fahrzeug-Ritt ist der Avatar unsichtbar
            // (render-only; Physik/Sitz-Anker unberührt). Die Chase-Cam gilt JEDEM gesetz-gelenkten Ritt, die
            // Kabine nur der geschlossenen Karosserie (offenes Eigenwerk: Reiter sichtbar). Idempotent je
            // Frame; der Abstieg stellt die Sichtbarkeit im selben Chokepoint wieder her.
            const _fahrRitt = (() => {
                const p = this.state.player;
                if (!p || p.mountedArch === null || p.mountedArch === undefined) return null;
                const ent = this._mountedEntry;
                if (!ent) return null;
                const prof = this._vehicleProfile(ent);
                if (!prof || !prof.lenkung) return null;
                const fzg = this._fahrzeugGesetzFor(ent);
                return { ent, kam: prof.kamera || null, kabine: !!(fzg && fzg.drive && fzg.drive.huelle) };
            })();
            // Im 1st-Person verlässt der Leib (Kopf und Haut, ohne das Gerät in der Hand) die Ebene 0 der Haupt-Kamera und
            // wirft weiter in den Kaskaden; die Regel wohnt in _applyEgoSicht (EINE Quelle, der Ebenen-Schalter).
            player.visible = !(_fahrRitt && _fahrRitt.kabine);
            this._applyEgoSicht();
            if (this.state.cameraMode === "third") {
                // Orbit-Kamera hinter + über dem Spieler: Pitch hebt/senkt vertikal, Distanz konstant, Look-At auf
                // die Brust. Pitch-Vorzeichen gegenüber 1st bewusst invertiert (3rd: Maus hoch = Kamera höher).
                // Beim Gesetz-Fahrzeug-Ritt die Studio-CHASE-CAM: hinter dem Wagen (Kern-Azimut-Ease auf die Gier,
                // feste Kern-Elevation/-Distanz, Blick auf blickHoehe); Boden-Clamp + Kollision unten gelten gleich.
                let camX, camZ, camY;
                if (_fahrRitt && _fahrRitt.kam) {
                    const ent = _fahrRitt.ent;
                    const K = _fahrRitt.kam;
                    const yawF = Number.isFinite(ent._rideYaw) ? ent._rideYaw : this.state.yaw;
                    let az = Number.isFinite(ent._kamYaw) ? ent._kamYaw : yawF;
                    let d = yawF - az;
                    while (d > Math.PI) d -= 2 * Math.PI;
                    while (d < -Math.PI) d += 2 * Math.PI;
                    const kDt = Math.min(0.1, Math.max(0.001, currentTime - (ent._kamT || currentTime)));
                    ent._kamT = currentTime;
                    az += d * (1 - Math.pow(K.azEase, kDt));
                    ent._kamYaw = az;
                    const ce = Math.cos(K.el);
                    const se = Math.sin(K.el);
                    camX = ent.position.x - Math.sin(az) * ce * K.dist;
                    camZ = ent.position.z - Math.cos(az) * ce * K.dist;
                    camY = ent.position.y + K.blickHoehe + se * K.dist;
                } else {
                    const dist = this.state.cameraThirdDistance;
                    const height = this.state.cameraThirdHeight;
                    const cosPitch = Math.cos(this.state.pitch);
                    camX = player.position.x - Math.sin(this.state.yaw) * dist * cosPitch;
                    camZ = player.position.z - Math.cos(this.state.yaw) * dist * cosPitch;
                    camY = player.position.y + height - Math.sin(this.state.pitch) * dist;
                }
                // DIE KAMERA HAT EINEN LEIB (K06, WE-05/FZ-07): eine Kugel vom Radius `fx.bewegung.kamera.armRadiusM`
                // (koerper-core). Sie steht nie unter dem SICHTBAREN Boden: der Deckel liest die Boden-Karte des gezeichneten
                // Mesh (`_standSicht` ohne Träger) + r, an der Wunsch-Stelle und an der Stelle nach dem Arm — solange die Karte
                // im STAND_SICHT_BAND über den Füßen oder der Kamera liegt (darüber trägt sie die Oberkante der Säule: Höhle,
                // Überhang); auf einem Bau dessen Oberkante, ohne Karte der Träger. Das Gesetz fragt nur der Wurf (die Kugel
                // hält r vor jeder Fläche): der Deckel tastet nie das Feld (Prüfung 1: der Stand-Leser der Füße las am 30°-Hang
                // je Bild das Gesetz unter der Kamera). Vorher die Füße − 0,2 m, das Gesetz statt des Bildes (Lehre 22: der
                // Boden des Mesh liegt bis 0,6 m über ihm): R-CAM unterBoden 9 von 50.
                const KAM = AnazhRealm._bewegungsBlock("kamera", ["armRadiusM", "armRuhe"]);
                const kr = KAM.armRadiusM;
                const fussY = player.position.y - AnazhRealm.PLAYER_FOOT_OFFSET;
                const aufBau = this.state._kapselStruktur === true;
                const boden = (x, z, y) => {
                    if (aufBau) return fussY + kr;
                    const k = this._standSicht(x, z, NaN, false);
                    if (!Number.isFinite(k)) return fussY + kr;
                    return k - Math.max(fussY, y) <= AnazhRealm.STAND_SICHT_BAND ? k + kr : -Infinity;
                };
                const minCamY = boden(camX, camZ, camY);
                if (camY < minCamY) camY = minCamY;
                // Pitch-Wunsch-Höhe (nach Boden-Deckel, VOR der Kollision) als State spiegeln: der Playtest prüft die
                // Pitch-Inversion daran deterministisch (die Kollision hängt von der Umgebung ab), den Deckel an `_kamBodenY`.
                this.state._cameraDesiredY = camY;
                this.state._kamBodenY = minCamY;
                // Kamera-Kollision: der Wurf der Kugel vom Blickziel zur Wunsch-Position (`_fieldRaycast` mit `radius`: Boxen
                // und gedrehte Boxen um r aufgeblasen, das Gelände Mittelstrahl + Ring der Kugel an ihrer Stelle) — der Arm
                // hält absolut r vor dem ersten Treffer (vorher 0,85 × Treffer: an einem 1-m-Arm 0,15 m vor dem Fels, in Ecken
                // streifte die Linse die Wand). EINE PFLANZE HÄLT SIE NIE (Leben-Schau 07.10. L-Kamera, Gegenprüfung Runde 1): der Wurf geht
                // `durchPflanzen`, und was von einer Pflanze zwischen Auge und Spieler liegt, wird durchsichtig
                // (`_kameraDurchsichtNode`). Die Kronen-Hülle (5167fd85) hielt die Verfolger-Kamera in 641 von 2400 Fahr-Proben
                // unter 3 m (am Wagendach, 137 Sprünge > 2 m) und die Kamera zu Fuß in 43 % der Proben in Baumnähe auf dem
                // 2-m-Minimum — ein Wald ist für eine Kamera mit 9,6 m Arm nie frei.
                const bx = player.position.x;
                const by = player.position.y + 1.0;
                const bz = player.position.z;
                // DIE SCHULTER (Gegenprüfung Runde 1: das Fadenkreuz stand in 3rd auf dem Kopf der Figur): zu Fuß blickt die
                // Kamera über die rechte Schulter — Auge und Blickziel stehen KAMERA_SCHULTER_M rechts (Bildschirm-rechts
                // = (−cos Gier, 0, sin Gier)), die Figur steht links der Bildmitte, das Fadenkreuz trifft daneben die Welt.
                // Steht rechts eine Wand, rückt die Schulter vor ihr ein: die Bauten um r aufgeblasen (der Wurf ohne
                // Gelände-Strahl), der Fels als Feld-Punkt am Rand der Kugel (bis zu 5 Proben, Bisektion) — die Strahlen des
                // Frames gehören dem Arm. Der Ritt blickt auf die Kabine (der Wagen).
                let sx = 0;
                let sz = 0;
                if (!_fahrRitt) {
                    const S = AnazhRealm.KAMERA_SCHULTER_M;
                    const rx = -Math.cos(this.state.yaw);
                    const rz = Math.sin(this.state.yaw);
                    const fest = (s) => this._fieldSolid(bx + rx * (s + kr), by, bz + rz * (s + kr));
                    let s =
                        S *
                        this._fieldRaycast(bx, by, bz, bx + rx * S, by, bz + rz * S, {
                            durchPflanzen: true,
                            radius: kr,
                            gelaende: false,
                        }).t;
                    if (fest(s)) {
                        let lo = 0;
                        let hi = s;
                        if (fest(0)) hi = 0;
                        else
                            for (let i = 0; i < 3; i++) {
                                const mid = (lo + hi) / 2;
                                if (fest(mid)) hi = mid;
                                else lo = mid;
                            }
                        s = lo;
                    }
                    sx = rx * s;
                    sz = rz * s;
                }
                const tx = bx + sx;
                const ty = by;
                const tz = bz + sz;
                camX += sx;
                camZ += sz;
                // DER GLEITENDE ARM: ein Hindernis zieht die Kamera sofort heran (sie steht nie in Boden oder Bau), frei
                // fährt sie gleitend hinaus — der Rest 1 − Ruhe^dt je Bild, im Ritt die Ruhe des Kern-Gesetzes
                // (`kamera.posEase`, mit der die Probefahrt-Kamera ihrer Stelle folgt), zu Fuß `fx.bewegung.kamera.armRuhe`.
                // Der Wurf kostet den Mittelstrahl und frei 4 Proben des Rings (berührt er, die Bisektion) — diag-kamera-laub zählt
                // die Feld-Proben je 3rd-Bild.
                const wurf = this._fieldRaycast(tx, ty, tz, camX, camY, camZ, { durchPflanzen: true, radius: kr });
                const t = wurf.t;
                const armDt = Math.min(0.1, Math.max(0.0001, currentTime - (this.state._kamArmT || currentTime)));
                this.state._kamArmT = currentTime;
                let arm = this.state._kamArm;
                if (!(arm >= 0) || t <= arm) arm = t;
                else {
                    const ruhe =
                        _fahrRitt && _fahrRitt.kam && _fahrRitt.kam.posEase > 0 ? _fahrRitt.kam.posEase : KAM.armRuhe;
                    arm += (t - arm) * (1 - Math.pow(ruhe, armDt));
                }
                this.state._kamArm = arm;
                const kx = tx + (camX - tx) * arm;
                const kz = tz + (camZ - tz) * arm;
                const ky = ty + (camY - ty) * arm;
                camera.position.set(kx, Math.max(ky, boden(kx, kz, ky)), kz);
                camera.lookAt(tx, ty, tz);
                const KD = AnazhRealm.KAMERA_DURCHSICHT;
                // Das Ziel ist der Blickpunkt T (Integration V18.536, Gelb 1 der dritten v1-Gegenprüfung): die Ebene des
                // Fadenkreuz-Strahls steht senkrecht zum Blick und der Strahl beginnt bei jedem Arm an T. Mit der Brust B als
                // Ziel stand die Ebene senkrecht zu B − Kamera, der Strahl begann 0,36/Arm Meter hinter T (Arm 0,5 m vor einer
                // Hauswand: 0,52–0,78 m tot, eine Kreatur dort in 1 von 5 verfehlt). Die Brust liegt höchstens
                // KAMERA_SCHULTER_M (0,6 m) neben T, innerhalb des Durchsicht-Radius `fussM` (0,9 m). DER FREIRAUM DER KAMERA
                // (Leben-Schau 2, 09.10.): Laub und Rinde fallen bis an die Ebene des Ziels — die Kamera schwebt frei, kein
                // Leib steht an ihr, und in der Krone (die Eiche am Ufer, die Weide über dem Wagen) füllte das Laub zwischen
                // Linse und Figur das Bild; die Boden-Streu (Blume, Farn, Gestrüpp) nur in der Nähe der Linse (bodenM, im
                // Ritt bodenRittM), die Wiese zwischen Kamera und Figur bleibt.
                this._kamZielSetzen(
                    tx,
                    ty,
                    tz,
                    _fahrRitt ? KD.rittM : KD.fussM,
                    Infinity,
                    Infinity,
                    _fahrRitt ? KD.bodenRittM : KD.bodenM
                );
            } else {
                // View-Height-Smoothing (à la Source `SmoothViewOnStairs`): Füße/Kollision rasten hart auf den Boden,
                // das AUGE gleitet gedämpft nach → der Körper federt Stufen/Buckel ab. Nur am Boden glätten; in der
                // Luft exakt tracken (ballistische Kurve 1:1), bei großem Versatz (Fall/Teleport) snappen.
                const camDt = Math.min(0.1, Math.max(0.0001, currentTime - (this.state._camSmoothT || currentTime)));
                this.state._camSmoothT = currentTime;
                const bodyY = player.position.y;
                let smoothBodyY = this.state._smoothBodyY;
                let landDip = this.state._landDip || 0;
                const pendingImpact = this.state._landImpactPending || 0;
                // LANDUNG zuerst: der Dip absorbiert den Aufprall (∝ Tempo, gedeckelt); die Glättung
                // snappt auf die Füße (sonst hebt ihr Lag das Auge genau so viel an, wie der Dip es
                // senkt → sie fechten, der Dip verpufft, gemessen).
                if (pendingImpact > 0) {
                    smoothBodyY = bodyY;
                    const kick = -Math.min(AnazhRealm.LAND_DIP_MAX, pendingImpact * AnazhRealm.LAND_DIP_SCALE);
                    if (kick < landDip) landDip = kick;
                    this.state._landImpactPending = 0;
                } else if (
                    typeof smoothBodyY !== "number" ||
                    this.state.isInAir ||
                    Math.abs(bodyY - smoothBodyY) > AnazhRealm.CAMERA_STEP_MAX_LAG
                ) {
                    smoothBodyY = bodyY; // erster Frame / Luft (Flugkurve 1:1) / großer Versatz → snap
                } else {
                    // Tiefpass: das Auge folgt dem Fuß gedämpft → das Höhen-Zittern des rauen
                    // Terrains wird geglättet (der Körper gleicht aus). Ein leichter Lag IST die Dämpfung.
                    smoothBodyY += (bodyY - smoothBodyY) * (1 - Math.exp(-AnazhRealm.CAMERA_SMOOTH_K * camDt));
                }
                this.state._smoothBodyY = smoothBodyY;
                landDip += (0 - landDip) * (1 - Math.exp(-AnazhRealm.LAND_DIP_RECOVER_K * camDt));
                if (landDip > -0.001) landDip = 0;
                this.state._landDip = landDip;
                // Kamera-Clip-Wand: das Ego-Auge sitzt 1.6 m über dem Body-Zentrum (Box-halfExtent 0.5; nicht das
                // Lab-eyeY 1.62) — die Decken-Probe klemmt es unter eine niedrige Decke (0.12 m Marge), sonst sieht
                // man den Fels von innen. Die Seitenwände hält die Physik-Box.
                let eyeY = smoothBodyY + AnazhRealm.EGO_AUGE_M + landDip;
                const headroomFP = this._ceilingHeadroom();
                if (Number.isFinite(headroomFP)) {
                    eyeY = Math.min(eyeY, player.position.y + 0.55 + headroomFP - 0.12);
                }
                camera.position.set(player.position.x, eyeY, player.position.z);
                const blick = this._blickVorn(
                    this.state.yaw,
                    this.state.pitch,
                    this._egoBlick || (this._egoBlick = {})
                );
                camera.lookAt(player.position.x + blick.x, eyeY + blick.y, player.position.z + blick.z);
                this.state._kamArm = undefined; // der Arm der 3rd-Kamera beginnt beim Wechsel frei
                // das Ziel ist das Auge: zwischen Auge und Ziel liegt nichts, der Strahl des Fadenkreuzes beginnt am Auge; die
                // Nah-Kugel nimmt Laub und Boden-Streu (KAMERA_DURCHSICHT.ichM — ein Strauch, eine Krone, durch die der Leib
                // geht), die Rinde, an der der Leib steht, bleibt ganz
                const KD1 = AnazhRealm.KAMERA_DURCHSICHT;
                this._kamZielSetzen(player.position.x, eyeY, player.position.z, 0, KD1.ichM, -KD1.saumM, KD1.ichM);
            }
            this._lodAugeGesetzt(); // das Rig setzte das Auge der Stufen (K36): die Maske und die Wahl messen von hier
            if (currentTime - this.state.lastCameraLog >= this.state.cameraLogInterval) {
                this.log(
                    `Kamera: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`,
                    "DEBUG"
                );
            }
        }
    }
}
