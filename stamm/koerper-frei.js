class AnazhRealm_koerper_frei {
    // ===== ATLAS · Koerper/frei — Der freie Körper · der EINE Löser · Kisten, Fässer und die Trümmer des Einsturzes =====
    // ═══ DER FREIE KÖRPER (physik.K3): EIN Löser für Starrkörper im festen Sim-Schritt ═══
    // Ein Werk, dessen Bauplan `frei` trägt (EIN Teil: Box oder Zylinder — Kiste, Fass), ist ein freier Starrkörper: Lage des
    // Schwerpunkts, Drehung (Quaternion), Geschwindigkeit und Drall, Masse und Trägheit aus der Gestalt mal ρ seiner Zeile
    // (`_stoffRho`). Gesetzt über die EINE Wurzel jedes Werks (`spawnArchitecture`), gezeichnet über die Pose des Werks
    // (`_werkPoseZeigen`, die Instanz-Matrix `_archEntryWorldMatrix`), gestoßen über das EINE Impuls-Gesetz. Der Wagen-Kern und
    // der Leib-Löser tragen keinen Starrkörper, den man verallgemeinern könnte: der Fahr-Schritt (vehicle-core `fahrStand`) ist
    // eine Ebene der vier Räder ohne Drall, der Leib-Löser (`_leibKontakte`) löst Strecken in der Ebene. Vorher gab es in der
    // Welt keinen freien Körper: was fiel, fiel als ½ g t² ohne Boden-Kontakt, was kippte, kippte als Pendel um eine Kante
    // (`_werkSturzSchritt`), nichts stapelte, nichts warf ein Wagen um.
    // Die Gestalt: der Zylinder ist rund (size.x = ⌀, seine Achse die Hoch-Achse des Teils), jede andere Form trägt die Kiste
    // ihrer Größe (die Trümmer eines Werks: Kugel, Keil, Kegel stoßen als ihre Hülle). Die Lage trägt der Eintrag: `drehung`
    // (die Quaternion [w, x, y, z] des Stands oder des Bruchs, `_werkBricht`), sonst die Gier; `ruht` (der Stand) legt ihn
    // schlafend hin, wie er lag.
    _freiKoerperSetzen(entry, bp) {
        const teil = bp && bp.frei === true && Array.isArray(bp.parts) && bp.parts.length === 1 ? bp.parts[0] : null;
        if (!teil) return null;
        const kiste = teil.shape !== "cylinder";
        const F = AnazhRealm.FREI;
        const s = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        const sz = teil.size || {};
        const tp0 = teil.position || {};
        const hx = ((sz.x || 1) / 2) * s;
        const hy = ((sz.y || sz.x || 1) / 2) * s;
        const hz = ((sz.z || sz.x || 1) / 2) * s;
        const r = hx; // der Zylinder: size.x = ⌀ (`_makePartGeometry`), seine Achse die Hoch-Achse des Teils
        if (tp0.x || tp0.z) return null; // der Schwerpunkt über dem Ursprung des Plans
        // MASSE UND TRÄGHEIT der Gestalt (um den Schwerpunkt, Hauptachsen = Achsen des Teils): der volle Körper minus seinen
        // Hohlraum (`wand`: die Stärke der Wand in m, ohne sie voll) — je mal ρ der Stoff-Zeile
        const rho = this._stoffRho(teil.material);
        const w = Number.isFinite(teil.wand) && teil.wand > 0 ? teil.wand * s : 0;
        const koerper = (ax, ay, az) => {
            if (!(ax > 0 && ay > 0 && az > 0)) return [0, 0, 0, 0];
            const mk = (kiste ? 8 * ax * ay * az : 2 * Math.PI * ax * ax * ay) * rho;
            const quer = (mk * (3 * ax * ax + 4 * ay * ay)) / 12;
            return kiste
                ? [mk, (mk * (ay * ay + az * az)) / 3, (mk * (ax * ax + az * az)) / 3, (mk * (ax * ax + ay * ay)) / 3]
                : [mk, quer, (mk * ax * ax) / 2, quer];
        };
        const voll = koerper(hx, hy, hz);
        const hohl = w ? koerper(hx - w, hy - w, hz - w) : [0, 0, 0, 0];
        const [m, ...I] = voll.map((x, i) => x - hohl[i]);
        if (!(m > 0)) return null;
        // DIE PUNKTE DER GESTALT (im Rahmen des Schwerpunkts): die Kiste ihre 8 Ecken und 12 Kanten-Mitten, das Fass je Rand
        // FREI.rundPunkte Punkte — sie berühren Boden, Bau und den anderen Körper
        const pk = kiste ? this._freiKistenPunkte(hx, hy, hz) : [];
        if (!kiste)
            for (let i = 0; i < F.rundPunkte; i++) {
                const a = (2 * Math.PI * i) / F.rundPunkte;
                pk.push(r * Math.cos(a), hy, r * Math.sin(a), r * Math.cos(a), -hy, r * Math.sin(a));
            }
        const um = { x: 0, y: tp0.y || 0, z: 0 };
        const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
        // die Gier des Eintrags wandert in die Drehung des Körpers (die Pose dreht um den Schwerpunkt im Rahmen des Plans)
        entry.rotationY = 0;
        const d = entry.drehung;
        const dl = Array.isArray(d) && d.length === 4 && d.every(Number.isFinite) ? Math.hypot(...d) : 0;
        delete entry.drehung;
        this._werkGesetzAus(entry); // die Statik des Werks (Sturz, Rollen) trägt ihn nicht: er gehorcht dem Löser
        entry._gesetz = { pose: { q: new THREE.Quaternion(), um, sinken: 0 } };
        const K = (entry._frei = {
            e: entry,
            id: (this._freiZaehler = (this._freiZaehler || 0) + 1),
            kiste,
            hx,
            hy,
            hz,
            halb: [hx, hy, hz],
            r,
            s,
            stoff: teil.material,
            m,
            invM: 1 / m,
            invI: I.map((x) => 1 / x),
            pk: Float64Array.from(pk),
            pw: new Float64Array(pk.length),
            kasten: new Float64Array(6),
            ebene: new Float64Array((pk.length / 3) * 4), // je Punkt die Ebene des Bodens dieses Schritts (y, n)
            rad: kiste ? Math.hypot(hx, hy, hz) : Math.hypot(r, hy),
            // die Vektoren des Körpers sind Float64Array (EINE Form je Feld: der Gang liest sie je Kontakt)
            p: Float64Array.of(entry.position.x, entry.position.y - 0.5 + um.y * s, entry.position.z),
            p0: new Float64Array(3),
            q:
                dl > 0.5
                    ? Float64Array.from(d, (x) => x / dl)
                    : Float64Array.of(Math.cos(ry / 2), 0, Math.sin(ry / 2), 0),
            v: new Float64Array(3),
            w: new Float64Array(3),
            tempo: 0,
            weg: 0,
            R: new Float64Array(9),
            Iw: new Float64Array(9),
            bauten: [],
            nachbarn: [],
            boden: 0,
            welt: false,
            schlaf: entry.ruht === true,
            ruhe: 0,
            stempel: null,
        });
        delete entry.ruht;
        (this._freiImTakt || (this._freiImTakt = new Set())).add(entry);
        this._freiLage(K);
        this._freiZeigen(K);
        K.stempel = null; // die Wurzel stempelt die Teile des Plans danach: der erste Schritt stempelt die Hülle neu
        return K;
    }

    // Die Lage im Takt: die Dreh-Matrix aus der Quaternion (`_freiDreh`), die Welt-Trägheit (R · I⁻¹ · Rᵀ) und die Punkte der
    // Gestalt in der Welt.
    _freiLage(K) {
        this._freiDreh(K);
        const R = K.R;
        const a = K.invI[0];
        const b = K.invI[1];
        const c = K.invI[2];
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                K.Iw[i * 3 + j] =
                    R[i * 3] * a * R[j * 3] + R[i * 3 + 1] * b * R[j * 3 + 1] + R[i * 3 + 2] * c * R[j * 3 + 2];
        const pk = K.pk;
        const pw = K.pw;
        const p = K.p;
        for (let i = 0; i < pk.length; i += 3)
            for (let k = 0; k < 3; k++)
                pw[i + k] = p[k] + R[k * 3] * pk[i] + R[k * 3 + 1] * pk[i + 1] + R[k * 3 + 2] * pk[i + 2];
        this._freiKasten(K);
    }
    // die achsen-parallele Hülle der Punkte (die Paar-Suche verwirft, was sich nicht nähert, bevor sie die Flächen fragt)
    _freiKasten(K) {
        const pw = K.pw;
        const H = K.kasten;
        H[0] = H[1] = H[2] = Infinity;
        H[3] = H[4] = H[5] = -Infinity;
        for (let i = 0; i < pw.length; i += 3)
            for (let k = 0; k < 3; k++) {
                const x = pw[i + k];
                if (x < H[k]) H[k] = x;
                if (x > H[k + 3]) H[k + 3] = x;
            }
    }
    // nähern sich zwei Hüllen bis auf `rand`?
    _freiKastenNah(A, B, rand) {
        const a = A.kasten;
        const b = B.kasten;
        return (
            a[0] <= b[3] + rand &&
            b[0] <= a[3] + rand &&
            a[1] <= b[4] + rand &&
            b[1] <= a[4] + rand &&
            a[2] <= b[5] + rand &&
            b[2] <= a[5] + rand
        );
    }
    // die Dreh-Matrix allein (jeder Teil-Schritt: die Anker der Kontakte drehen mit dem Körper)
    _freiDreh(K) {
        const w = K.q[0];
        const x = K.q[1];
        const y = K.q[2];
        const z = K.q[3];
        const R = K.R;
        R[0] = 1 - 2 * (y * y + z * z);
        R[1] = 2 * (x * y - w * z);
        R[2] = 2 * (x * z + w * y);
        R[3] = 2 * (x * y + w * z);
        R[4] = 1 - 2 * (x * x + z * z);
        R[5] = 2 * (y * z - w * x);
        R[6] = 2 * (x * z - w * y);
        R[7] = 2 * (y * z + w * x);
        R[8] = 1 - 2 * (x * x + y * y);
    }
    // die Punkte einer Kiste im Rahmen ihres Schwerpunkts: ihre 8 Ecken und 12 Kanten-Mitten
    _freiKistenPunkte(hx, hy, hz) {
        const pk = [];
        for (let i = 0; i < 27; i++) {
            const a0 = (i % 3) - 1;
            const a1 = (((i / 3) | 0) % 3) - 1;
            const a2 = ((i / 9) | 0) - 1;
            if (Math.abs(a0) + Math.abs(a1) + Math.abs(a2) >= 2) pk.push(a0 * hx, a1 * hy, a2 * hz);
        }
        return Float64Array.from(pk);
    }

    // DER PUNKT IM KÖRPER: ragt (x, y, z) in die Gestalt (oder liegt er näher als `rand` vor genau einer ihrer Flächen), die
    // Tiefe (negativ: der Spalt) und die Außen-Normale der nächsten Fläche nach `out`; sonst false.
    _freiInnen(K, x, y, z, rand, out) {
        const R = K.R;
        const dx = x - K.p[0];
        const dy = y - K.p[1];
        const dz = z - K.p[2];
        const lx = R[0] * dx + R[3] * dy + R[6] * dz;
        const ly = R[1] * dx + R[4] * dy + R[7] * dz;
        const lz = R[2] * dx + R[5] * dy + R[8] * dz;
        let n0 = 0;
        let n1 = 0;
        let n2 = 0;
        if (K.kiste) {
            const k = this._freiFlaeche(K.hx - Math.abs(lx), K.hy - Math.abs(ly), K.hz - Math.abs(lz), rand, out);
            if (k < 0) return false;
            if (k === 0) n0 = lx < 0 ? -1 : 1;
            else if (k === 1) n1 = ly < 0 ? -1 : 1;
            else n2 = lz < 0 ? -1 : 1;
        } else {
            const rho = Math.sqrt(lx * lx + lz * lz);
            const dr = K.r - rho;
            const da = K.hy - Math.abs(ly);
            if (dr < 0 && da < 0) return false;
            const rund = da >= 0 && (dr < 0 || dr < da);
            out.tiefe = rund ? dr : da;
            if (!(out.tiefe > -rand)) return false;
            if (!rund) n1 = ly < 0 ? -1 : 1;
            else if (rho > 1e-9) {
                n0 = lx / rho;
                n2 = lz / rho;
            } else n0 = 1;
        }
        out.nx = R[0] * n0 + R[1] * n1 + R[2] * n2;
        out.ny = R[3] * n0 + R[4] * n1 + R[5] * n2;
        out.nz = R[6] * n0 + R[7] * n1 + R[8] * n2;
        return true;
    }
    // die nächste Fläche einer Box aus den Abständen zu ihren drei Flächen-Paaren: innen die kleinste, genau eine negativ ihr
    // Spalt (≤ rand), sonst −1; die Tiefe nach `out`
    _freiFlaeche(d0, d1, d2, rand, out) {
        const neg = (d0 < 0) + (d1 < 0) + (d2 < 0);
        if (neg > 1) return -1;
        const k = neg ? (d0 < 0 ? 0 : d1 < 0 ? 1 : 2) : d0 <= d1 && d0 <= d2 ? 0 : d1 <= d2 ? 1 : 2;
        out.tiefe = k === 0 ? d0 : k === 1 ? d1 : d2;
        return out.tiefe > -rand ? k : -1;
    }

    // DIE UMWELT DES KÖRPERS je Sim-Schritt — derselbe Boden und dieselben Bauten wie Leib und Wagen: EINE Ebene des Grunds je
    // Körper (`_freiGrund`: die Höhe des Gesetzes unter ihm, `_koerperBodenUnter` ab seiner Höhe, an seiner Mitte und vier Punkten
    // seines Umrisses, die Ebene durch sie; ihr Stoff `_kontaktStoffAt` und seine Reibung) — je Punkt ihr Abstand —, die Boxen der
    // Bauten in Reichweite (`_blockerNahe`) als ruhende Kisten (`_freiStatisch`) außer den freien Körpern (sie stoßen als Körper)
    // und dem gerittenen Wagen (er stößt über seine Hülle, `_fahrHuelleKontakt`). DAS GEDÄCHTNIS (Gebot 7: die Kosten folgen der
    // Änderung, nie der Zahl): Grund und Bauten gelten, bis der Körper FREI.umweltM weiter steht, die Welt edits
    // (`_editGenZaehler`) oder ein Bau eintritt (die Folge des Blocker-Netzes); ein Abbau und ein Edit wecken, was dort ruht
    // (`_freiWeckenIn`). Vorher fragte je Schritt jeder Punkt nahe dem Grund das Gesetz und jeder Körper das Netz (samt der 99
    // anderen Körper, sortiert): 100 wache Kisten 5,8 ms je Schritt allein dafür (Null-Renderer, die Mess-Wiese). `K.weg`: so weit
    // reicht sein Kontakt in diesem Schritt (sein Tempo mal dt und der Spalt) — die Kontakte gelten den ganzen Schritt (spekulativ:
    // ein Spalt darf sich schließen, nie mehr).
    _freiUmwelt(K, dt) {
        const F = AnazhRealm.FREI;
        const p = K.p;
        const pw = K.pw;
        const eb = K.ebene;
        const weg = (K.weg = K.tempo * dt + F.spalt);
        const gr = this._freiGrund(K);
        const n0 = -gr.b / gr.l;
        const n1 = 1 / gr.l;
        const n2 = -gr.c / gr.l;
        for (let i = 0, j = 0; i < pw.length; i += 3, j += 4) {
            const g = gr.a + gr.b * (pw[i] - gr.x) + gr.c * (pw[i + 2] - gr.z);
            if ((pw[i + 1] - g) * n1 > weg) {
                eb[j] = NaN;
                continue;
            }
            eb[j] = g;
            eb[j + 1] = n0;
            eb[j + 2] = n1;
            eb[j + 3] = n2;
        }
        K.boden = gr.a + gr.b * (p[0] - gr.x) + gr.c * (p[2] - gr.z);
        K.muBoden = gr.mu;
        // die Bauten: gemerkt mit FREI.umweltM Rand, neu nach Weg oder Eintritt eines Baus
        const N = this._blockerNetz();
        const B = K.bautenVon || (K.bautenVon = { x: NaN, z: NaN, y: NaN, seq: -1, gen: -1 });
        const um = F.umweltM;
        const neu =
            B.gen !== N.gen || Math.abs(p[0] - B.x) > um || Math.abs(p[2] - B.z) > um || Math.abs(p[1] - B.y) > um;
        // neu gefragt nach Weg oder neuem Netz; sonst nur, wer seither eintrat (die Folge des Netzes, `_blockerNahe` nachSeq)
        if (neu || B.seq !== N.seq) {
            const seit = neu ? -Infinity : B.seq;
            if (neu) Object.assign(B, { x: p[0], y: p[1], z: p[2], gen: N.gen });
            B.seq = N.seq;
            const r = K.rad + 2 * um;
            const nah = this._blockerNahe(B.x, B.z, r, seit, this._freiNah || (this._freiNah = []));
            const reitet = this.state.player && this.state.player.mountedArch;
            if (neu) K.bauten.length = 0;
            for (const e of nah)
                if (!e._frei && !(reitet != null && e.id === reitet))
                    for (const b of e.blockerAABBs || [])
                        if (b.topY > B.y - r && b.botY < B.y + r) K.bauten.push(this._freiStatisch(b, e));
            nah.length = 0;
        }
    }

    // DER GRUND DES KÖRPERS (gemerkt, `_freiUmwelt`): die Ebene g = a + b·(x − x₀) + c·(z − z₀) durch die Höhe des Gesetzes unter
    // seiner Mitte und vier Punkten seines Umrisses (± seiner Hülle, längs x und z), ab seiner Höhe; ihr Stoff und die Reibung
    // beider (μ des Bodens; die des Körpers aus seiner Zeile). Neu, sobald er FREI.umweltM weiter oder höher steht oder die Welt
    // edits — wer fällt, behält ihn: der erste Grund unter seiner alten Höhe ist der erste unter jeder tieferen über ihm.
    _freiGrund(K) {
        const F = AnazhRealm.FREI;
        const p = K.p;
        const marke = this._editGenZaehler | 0;
        const gr = K.grund;
        if (
            gr &&
            gr.marke === marke &&
            Math.abs(p[0] - gr.x) <= F.umweltM &&
            Math.abs(p[2] - gr.z) <= F.umweltM &&
            p[1] - gr.y <= F.umweltM
        )
            return gr;
        const r = Math.max(0.1, K.rad * 0.7);
        const h = (dx, dz) => this._koerperBodenUnter(p[0] + dx, p[1], p[2] + dz);
        const [g0, gx0, gx1, gz0, gz1] = [h(0, 0), h(-r, 0), h(r, 0), h(0, -r), h(0, r)];
        const fest = (v, w) => (Number.isFinite(v) ? v : w);
        const a = fest(g0, -Infinity);
        // die Neigung aus den Paaren (ein Paar ohne Grund: flach)
        const b = Number.isFinite(gx0) && Number.isFinite(gx1) ? (gx1 - gx0) / (2 * r) : 0;
        const c = Number.isFinite(gz0) && Number.isFinite(gz1) ? (gz1 - gz0) / (2 * r) : 0;
        const st = Number.isFinite(a)
            ? this._stoff(this._kontaktStoffAt(p[0], p[2], a), "der Boden unter dem freien Körper reibt nicht")
            : null;
        const z = this._stoff(K.stoff, "der freie Körper aus „" + K.stoff + "“ reibt nicht");
        K.mu = z && z.mu > 0 ? z.mu : 0;
        return (K.grund = {
            x: p[0],
            y: p[1],
            z: p[2],
            marke,
            a,
            b,
            c,
            l: Math.sqrt(b * b + 1 + c * c),
            mu: st && st.mu > 0 ? st.mu : 0,
        });
    }

    // EIN ABBAU ODER EDIT WECKT, WAS DORT RUHT: jeder schlafende freie Körper, dessen Hülle den Kasten [x0, x1] × [z0, z1] (± 0,1 m)
    // berührt, wacht auf und fragt seinen Grund neu — die Kiste auf dem abgebauten Pfosten fällt, der Trümmer über dem Loch auch.
    _freiWeckenIn(x0, x1, z0, z1) {
        if (!this._freiImTakt) return;
        for (const e of this._freiImTakt) {
            const K = e._frei;
            const k = K.kasten;
            if (k[0] > x1 + 0.1 || k[3] < x0 - 0.1 || k[2] > z1 + 0.1 || k[5] < z0 - 0.1) continue;
            this._freiWecken(K);
            K.grund = null;
            if (K.bautenVon) K.bautenVon.seq = -1;
        }
    }

    // DIE BOX EINES BAUS ALS RUHENDE KISTE (auch gedreht, `obb`): derselbe Kisten-Kontakt wie Körper an Körper (`_freiPaarKisten`,
    // beide Seiten — vorher stießen nur die Punkte des Körpers an die Box: ein Balken, quer über einen Pfosten gefallen, fiel durch
    // ihn), Masse unendlich, schlafend wie die Welt. Gemerkt je Box, neu, sobald die Box anders steht.
    _freiStatisch(b, e) {
        const M = this._freiStatischM || (this._freiStatischM = new WeakMap());
        const ob = b.obb;
        let S = M.get(b);
        if (
            S &&
            S.m0 === b.minX &&
            S.m1 === b.maxX &&
            S.m2 === b.botY &&
            S.m3 === b.topY &&
            S.m4 === b.minZ &&
            S.m5 === b.maxZ &&
            S.m6 === (ob ? ob.cx + ob.cz + ob.c : 0)
        )
            return S;
        const c = ob ? ob.c : 1;
        const s = ob ? ob.s : 0;
        const hx = ob ? ob.hx : (b.maxX - b.minX) / 2;
        const hy = (b.topY - b.botY) / 2;
        const hz = ob ? ob.hz : (b.maxZ - b.minZ) / 2;
        const bs = this._stoff(b.stoff || this._werkStoff(e), "die Box reibt nicht");
        S = {
            id: (this._freiZaehler = (this._freiZaehler || 0) + 1),
            statisch: true,
            schlaf: true,
            kiste: true,
            hx,
            hy,
            hz,
            halb: [hx, hy, hz],
            rad: Math.sqrt(hx * hx + hy * hy + hz * hz),
            p: Float64Array.of(
                ob ? ob.cx : (b.minX + b.maxX) / 2,
                (b.topY + b.botY) / 2,
                ob ? ob.cz : (b.minZ + b.maxZ) / 2
            ),
            p0: new Float64Array(3),
            v: new Float64Array(3),
            w: new Float64Array(3),
            R: Float64Array.of(c, 0, s, 0, 1, 0, -s, 0, c),
            mu: bs && bs.mu > 0 ? bs.mu : 0,
            m0: b.minX,
            m1: b.maxX,
            m2: b.botY,
            m3: b.topY,
            m4: b.minZ,
            m5: b.maxZ,
            m6: ob ? ob.cx + ob.cz + ob.c : 0,
        };
        const pk = this._freiKistenPunkte(hx, hy, hz);
        S.pw = new Float64Array(pk.length);
        for (let i = 0; i < pk.length; i += 3)
            for (let k = 0; k < 3; k++)
                S.pw[i + k] = S.p[k] + S.R[k * 3] * pk[i] + S.R[k * 3 + 1] * pk[i + 1] + S.R[k * 3 + 2] * pk[i + 2];
        S.kasten = new Float64Array(6);
        this._freiKasten(S);
        M.set(b, S);
        return S;
    }

    // DER SCHRITT DES LÖSERS (aus `_stepFixedSim`, dt = FIXED_DT) — der weiche Schritt der Besten (Box2D v3 „soft step", Catto
    // 2024): die Kontakte EINMAL je Schritt aus der Lage seines Beginns (Boden-Ebenen und Bauten aus `_freiUmwelt`, Körper an
    // Körper), spekulativ bis zu ihrem Weg; dann FREI.teile Teil-Schritte, je Teil-Schritt die Schwere der Welt (`state.gravity`,
    // ein Wort des Spielers ändert sie), der Warmstart, ein Gang mit der weichen Feder des Kontakts (FREI.hertz, FREI.daempfung;
    // die Durchdringung drückt sie mit höchstens FREI.schubMs heraus — kein getrennter Lage-Impuls mehr), die Lage (die Anker
    // drehen mit, die Trennung des Punkts folgt seinem Weg), ein Gang ohne Feder (die Entspannung: kein Schub fliegt weg), dann
    // die Stoß-Zahl des starren Paars (STOSS.stossZahl.starr) über FREI.prallMs; Reibung nach Coulomb (μ = √(μ₁ μ₂) der
    // Stoff-Zeilen), der Rollwiderstand des Fahr-Gesetzes (vehicle:FAHR.rollDecel) am Boden. Ein Körper, der FREI.ruheS ruhig
    // liegt und dessen Nachbarn ruhen, schläft — der Schlaf kostet nichts: ruht jeder Körper, rechnet der Löser nichts, bis ein
    // Stoß, ein Wort oder ein bewegter Nachbar ihn weckt. Vorher trug jeder der 4 Teil-Schritte seine eigene Kontakt-Suche und
    // 8 + 8 Gänge (Geschwindigkeit und Lage): 100 wache Kisten 24 ms je Schritt (Node, flacher Boden, der Haufen der Bank).
    _freiSchritt(dt) {
        const B = this._freiImTakt;
        if (!B || !B.size || !(dt > 0)) return;
        const F = AnazhRealm.FREI;
        const L = this._freiListe || (this._freiListe = []);
        L.length = 0;
        let wach = 0;
        for (const e of B) {
            L.push(e._frei);
            if (!e._frei.schlaf) wach++;
        }
        if (!wach) return;
        for (const K of L) {
            const v = K.v;
            const w = K.w;
            K.tempo = Math.max(
                Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]),
                Math.sqrt(w[0] * w[0] + w[1] * w[1] + w[2] * w[2]) * K.rad
            );
            K.sx = K.kasten[0] - K.tempo * dt;
        }
        // die Paare: Hüllen in Reichweite (Sweep-and-Prune längs x, dann die Kästen), einer wach; ein bewegter weckt den schlafenden
        const P = this._freiPaare || (this._freiPaare = []);
        P.length = 0;
        const S = this._freiSweepOrdnung(L);
        for (let si = 0; si < S.length; si++) {
            const A = S[si];
            const bisX = A.kasten[3] + A.tempo * dt + F.spalt;
            for (let sj = si + 1; sj < S.length; sj++) {
                const C = S[sj];
                if (C.sx > bisX) break;
                if (A.schlaf && C.schlaf) continue;
                const r = (A.tempo + C.tempo) * dt + F.spalt;
                const a = A.kasten;
                const c = C.kasten;
                if (a[1] > c[4] + r || c[1] > a[4] + r || a[2] > c[5] + r || c[2] > a[5] + r || c[0] > a[3] + r)
                    continue;
                if (A.schlaf && C.tempo > F.ruheMs) this._freiWecken(A);
                if (C.schlaf && A.tempo > F.ruheMs) this._freiWecken(C);
                P.push(A, C);
            }
        }
        const W = this._freiWach || (this._freiWach = []);
        W.length = 0;
        for (const K of L)
            if (!K.schlaf) {
                W.push(K);
                K.nachbarn.length = 0;
                K.welt = false;
                this._freiUmwelt(K, dt); // die Lage trägt er seit dem Ende seines letzten Schritts (oder der Geburt, dem Stoß)
                K.p0[0] = K.p[0];
                K.p0[1] = K.p[1];
                K.p0[2] = K.p[2];
            }
        const X = this._freiKoerperPacken(W);
        // DIE KONTAKTE des Schritts: der Boden (je Punkt der Abstand zur Ebene des Gesetzes unter ihm), die Bauten, die Paare
        const o = this._freiInnenAus || (this._freiInnenAus = {});
        let n = 0;
        for (const K of W) {
            const pw = K.pw;
            const eb = K.ebene;
            const muB = Math.sqrt(K.muBoden * K.mu);
            const n0 = n;
            for (let i = 0, j = 0; i < pw.length; i += 3, j += 4)
                if (eb[j] === eb[j]) {
                    const tiefe = (eb[j] - pw[i + 1]) * eb[j + 2];
                    if (tiefe > -K.weg)
                        n = this._freiKontakt(
                            n,
                            K,
                            null,
                            pw[i],
                            pw[i + 1],
                            pw[i + 2],
                            eb[j + 1],
                            eb[j + 2],
                            eb[j + 3],
                            tiefe,
                            muB,
                            this._freiSchluessel(K, null) + i / 3
                        );
                }
            n = this._freiVier(n0, n);
            for (const Z of K.bauten) {
                if (!this._freiKastenNah(K, Z, K.weg)) continue;
                const m0 = n;
                const mu = Math.sqrt(Z.mu * K.mu);
                n = K.kiste
                    ? this._freiPaarKisten(n, K, Z, mu, K.weg)
                    : this._freiPaar(this._freiPaar(n, K, Z, mu, o, K.weg), Z, K, mu, o, K.weg);
                n = this._freiVier(m0, n);
            }
        }
        for (let k = 0; k < P.length; k += 2) {
            const A = P[k];
            const Z = P[k + 1];
            const rand = F.spaltKoerper + (A.tempo + Z.tempo) * dt;
            if (!this._freiKastenNah(A, Z, rand)) continue;
            const mu = Math.sqrt(A.mu * Z.mu);
            const n0 = n;
            if (A.kiste && Z.kiste) n = this._freiVier(n0, this._freiPaarKisten(n, A, Z, mu, rand));
            else {
                n = this._freiVier(n0, this._freiPaar(n, A, Z, mu, o, rand));
                n = this._freiVier(n, this._freiPaar(n, Z, A, mu, o, rand));
            }
        }
        // vorbereiten (Hebel, Tangenten, wirksame Massen, die Feder, das Tempo vor dem Stoß), der Warmstart aus dem vorigen Schritt
        const h = dt / F.teile;
        const weich = this._freiWeich(h, F);
        const alt = this._freiWarm || (this._freiWarm = new Map());
        const CS = AnazhRealm.FREI_KONTAKT;
        for (const K of W) X[K.slot + 26] = K.welt ? 1 : 0;
        for (let k = 0; k < n; k++) this._freiKontaktBereit(k * CS, X, weich, alt);
        const g = Number.isFinite(this.state.gravity) ? this.state.gravity : -9.81;
        const invH = 1 / h;
        const G = this._freiG;
        for (let t = 0; t < F.teile; t++) {
            this._freiZiehen(X, W.length, h, g, true);
            this._freiGang(G, n, X, invH, true, F.schubMs, true);
            for (let it = 0; it < F.gaenge; it++) this._freiGang(G, n, X, invH, true, F.schubMs, false);
            this._freiZiehen(X, W.length, h, g, false);
            this._freiGang(G, n, X, invH, false, F.schubMs, false);
        }
        // der Prall: wer schneller als FREI.prallMs aufschlug und getragen wurde, springt mit der Stoß-Zahl des Starren zurück
        const prall = this._freiPrall || (this._freiPrall = {});
        prall.ab = F.prallMs;
        prall.e = AnazhRealm.STOSS.stossZahl.starr;
        this._freiGang(G, n, X, invH, false, F.schubMs, false, prall);
        // zurück aus dem Puffer: Bewegung und Lage in die Körper
        for (const K of W) {
            const x = K.slot;
            for (let d = 0; d < 3; d++) {
                K.v[d] = X[x + d];
                K.w[d] = X[x + 3 + d];
                K.p[d] = X[x + 6 + d];
            }
            for (let d = 0; d < 4; d++) K.q[d] = X[x + 12 + d];
        }
        // der Warmstart des nächsten Schritts (die Zelle wandert mit, kein Müll)
        const neu = this._freiWarmNeu || (this._freiWarmNeu = new Map());
        neu.clear();
        for (let k = 0, c = 0; k < n; k++, c += CS) {
            if (!(G[c + 48] > 0)) continue;
            const w = alt.get(G[c + 74]) || new Float64Array(3);
            w[0] = G[c + 48];
            w[1] = G[c + 49];
            w[2] = G[c + 50];
            neu.set(G[c + 74], w);
        }
        this._freiWarm = neu;
        this._freiWarmNeu = alt;
        // die Ruhe: ruhig ist, wessen Punkte langsamer als FREI.ruheMs gehen; er schläft nach FREI.ruheS, ruhen seine Nachbarn
        for (const K of W) {
            const v = K.v;
            const w = K.w;
            const tempo = Math.max(
                Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]),
                Math.sqrt(w[0] * w[0] + w[1] * w[1] + w[2] * w[2]) * K.rad
            );
            K.ruhe = tempo < F.ruheMs ? K.ruhe + dt : 0;
        }
        for (const K of W) {
            let still = K.ruhe >= F.ruheS;
            for (let j = 0; still && j < K.nachbarn.length; j++)
                still = K.nachbarn[j].schlaf || K.nachbarn[j].ruhe >= F.ruheS;
            if (still) {
                K.schlaf = true;
                K.v[0] = K.v[1] = K.v[2] = K.w[0] = K.w[1] = K.w[2] = 0;
            }
        }
        for (const K of W) {
            this._freiLage(K);
            this._freiZeigen(K);
        }
    }

    // DIE ORDNUNG DES SWEEPS längs x (Sweep-and-Prune): die Reihe des vorigen Schritts lebt weiter, wer ging, fällt, wer kam,
    // tritt hinten an, dann Einfügen — die Körper wandern je Schritt wenig, die Reihe ist fast geordnet (kein Sortieren je Schritt).
    _freiSweepOrdnung(L) {
        const S = this._freiSweep || (this._freiSweep = []);
        const gen = (this._freiSweepGen = (this._freiSweepGen | 0) + 1);
        for (const K of L) K.sweepGen = gen;
        let m = 0;
        for (let i = 0; i < S.length; i++) if (S[i].sweepGen === gen) ((S[m++] = S[i]), (S[i].sweepGen = -gen));
        S.length = m;
        for (const K of L) if (K.sweepGen === gen) S.push(K);
        for (let i = 1; i < S.length; i++) {
            const K = S[i];
            let j = i - 1;
            while (j >= 0 && S[j].sx > K.sx) S[j + 1] = S[j--];
            S[j + 1] = K;
        }
        return S;
    }

    // DIE FEDER DES KONTAKTS je Teil-Schritt h (Box2D v3 `b2MakeSoft`): ω = 2π·Hertz, Dämpfung ζ — die Rate, mit der die
    // Durchdringung schließt, und die Skalen des Impulses; der starre Gegner (Welt, Bau, schlafender Körper) mit doppelter Hertz.
    _freiWeich(h, F) {
        const W = this._freiWeichZ || (this._freiWeichZ = new Float64Array(7));
        if (W[6] === h) return W;
        for (let k = 0; k < 2; k++) {
            const om = 2 * Math.PI * F.hertz * (k ? 2 : 1);
            const a1 = 2 * F.daempfung + h * om;
            const a2 = h * om * a1;
            const a3 = 1 / (1 + a2);
            W[k * 3] = om / a1;
            W[k * 3 + 1] = a2 * a3;
            W[k * 3 + 2] = a3;
        }
        W[6] = h;
        return W;
    }

    // KÖRPER AN KÖRPER: die Punkte von A in der Gestalt von B; die Normale zeigt aus B heraus. Schläft der Besitzer der Punkte
    // (oder ruht er als Bau), trägt der wache Partner den Kontakt (dieselbe Berührung, die Normale umgekehrt) — sonst verlöre die
    // wache Kiste auf der schlafenden die Hälfte ihrer Stütze.
    _freiPaar(n, A, B, mu, o, rand) {
        const dx = A.p[0] - B.p[0];
        const dy = A.p[1] - B.p[1];
        const dz = A.p[2] - B.p[2];
        const r = A.rad + B.rad + rand;
        if (dx * dx + dy * dy + dz * dz > r * r) return n;
        const pw = A.pw;
        const n1 = n;
        for (let i = 0; i < pw.length; i += 3) {
            if (!this._freiInnen(B, pw[i], pw[i + 1], pw[i + 2], rand, o)) continue;
            const key = this._freiSchluessel(A, B) + i / 3;
            if (A.schlaf)
                n = this._freiKontakt(n, B, A, pw[i], pw[i + 1], pw[i + 2], -o.nx, -o.ny, -o.nz, o.tiefe, mu, key);
            else n = this._freiKontakt(n, A, B, pw[i], pw[i + 1], pw[i + 2], o.nx, o.ny, o.nz, o.tiefe, mu, key);
        }
        if (n > n1) this._freiNachbarn(A, B);
        return n;
    }
    // DER SCHLÜSSEL des Warmstarts eines Punkts: Besitzer der Punkte, Gegner (0: der Boden), der Punkt — je 12, 12 und 6 Bit,
    // eine kleine ganze Zahl (eine Zahl über 2³¹ ist im Map ein Objekt je Kontakt und Schritt); gleiche Reste mod 4095 zweier
    // Körper im selben Schritt teilten einen Warmstart, ein Schritt mit falschem Startwert, kein Bruch.
    _freiSchluessel(A, B) {
        return ((A.id % 4095) + 1) * 262144 + (B ? (B.id % 4095) + 1 : 0) * 64;
    }
    _freiNachbarn(A, B) {
        if (!A.statisch && !B.statisch) {
            if (!A.nachbarn.includes(B)) A.nachbarn.push(B);
            if (!B.nachbarn.includes(A)) B.nachbarn.push(A);
        }
    }

    // KISTE AN KISTE: EINE Normale je Paar — die Fläche kleinster Überlappung unter den sechs Flächen-Normalen beider (SAT) ist
    // die Referenz (ihre Kiste Y), die Fläche der anderen (X), die ihr am meisten entgegensieht, die Gegen-Fläche. Kontakte: die
    // Punkte von X quer in den Grenzen der Referenz, ihre Tiefe unter deren Ebene; die Punkte von Y quer in den Grenzen der
    // Gegen-Fläche, ihre Tiefe längs der Normalen bis zu deren Ebene. Vorher nahm jeder Punkt seine nächste Fläche (an der Kante
    // die Seite: die fallende Kiste wurde waagerecht weggestoßen, der Stapel fiel), danach je Seite ihre eigene Fläche (zwei
    // Normalen: 0,1° Neigung aus dem slop schoben die obere Kiste 1 mm/s seitwärts, der Stapel wanderte). Auch die Box eines Baus
    // ist eine Kiste (`_freiStatisch`).
    _freiPaarKisten(n, A, B, mu, rand) {
        const d0 = A.p[0] - B.p[0];
        const d1 = A.p[1] - B.p[1];
        const d2 = A.p[2] - B.p[2];
        let best = Infinity;
        let ref = 0;
        for (let a = 0; a < 6; a++) {
            const R = a < 3 ? A.R : B.R;
            const u0 = R[a % 3];
            const u1 = R[3 + (a % 3)];
            const u2 = R[6 + (a % 3)];
            // die halben Breiten beider Schatten längs u, weniger der Abstand der Mitten
            const P = A.R;
            const Q = B.R;
            const ov =
                A.hx * Math.abs(P[0] * u0 + P[3] * u1 + P[6] * u2) +
                A.hy * Math.abs(P[1] * u0 + P[4] * u1 + P[7] * u2) +
                A.hz * Math.abs(P[2] * u0 + P[5] * u1 + P[8] * u2) +
                B.hx * Math.abs(Q[0] * u0 + Q[3] * u1 + Q[6] * u2) +
                B.hy * Math.abs(Q[1] * u0 + Q[4] * u1 + Q[7] * u2) +
                B.hz * Math.abs(Q[2] * u0 + Q[5] * u1 + Q[8] * u2) -
                Math.abs(d0 * u0 + d1 * u1 + d2 * u2);
            if (!(ov > -rand)) return n; // eine trennende Achse: kein Kontakt
            if (ov < best - 1e-9) {
                best = ov;
                ref = a;
            }
        }
        // Y trägt die Referenz, n zeigt aus ihr heraus zu X
        const refA = ref < 3;
        const Y = refA ? A : B;
        const X = refA ? B : A;
        const sd = refA ? -1 : 1;
        const k = ref % 3;
        const RY = Y.R;
        const RX = X.R;
        const sg = sd * (d0 * RY[k] + d1 * RY[3 + k] + d2 * RY[6 + k]) < 0 ? -1 : 1;
        const n0 = sg * RY[k];
        const n1 = sg * RY[3 + k];
        const n2 = sg * RY[6 + k];
        const ebeneY = Y.p[0] * n0 + Y.p[1] * n1 + Y.p[2] * n2 + Y.halb[k];
        // die Gegen-Fläche: die Achse von X, die n am nächsten liegt; ihre Außen-Normale m sieht n entgegen
        let j = 0;
        let jd = 0;
        for (let a = 0; a < 3; a++) {
            const da = RX[a] * n0 + RX[3 + a] * n1 + RX[6 + a] * n2;
            if (Math.abs(da) > Math.abs(jd)) {
                j = a;
                jd = da;
            }
        }
        const ms = jd > 0 ? -1 : 1;
        const m0 = ms * RX[j];
        const m1 = ms * RX[3 + j];
        const m2 = ms * RX[6 + j];
        const ebeneX = X.p[0] * m0 + X.p[1] * m1 + X.p[2] * m2 + X.halb[j];
        const nm = n0 * m0 + n1 * m1 + n2 * m2; // < 0
        const vorher = n;
        for (let seite = 0; seite < 2; seite++) {
            // seite 0: die Punkte von X in den Grenzen der Referenz (Y, ohne Achse k); seite 1: die von Y in denen der Gegen-Fläche
            const Q = seite ? Y : X;
            const G = seite ? X : Y;
            const ohne = seite ? j : k;
            const RG = G.R;
            const hG = G.halb;
            const pw = Q.pw;
            const kopf = this._freiSchluessel(Q, G);
            for (let i = 0; i < pw.length; i += 3) {
                const x = pw[i];
                const y = pw[i + 1];
                const z = pw[i + 2];
                const tiefe = seite ? (ebeneX - (x * m0 + y * m1 + z * m2)) / -nm : ebeneY - (x * n0 + y * n1 + z * n2);
                if (!(tiefe > -rand)) continue;
                const e0 = x - G.p[0];
                const e1 = y - G.p[1];
                const e2 = z - G.p[2];
                let quer = true;
                for (let a = 0; a < 3 && quer; a++)
                    if (a !== ohne && Math.abs(RG[a] * e0 + RG[3 + a] * e1 + RG[6 + a] * e2) > hG[a]) quer = false;
                if (!quer) continue;
                if (X.schlaf) n = this._freiKontakt(n, Y, X, x, y, z, -n0, -n1, -n2, tiefe, mu, kopf + i / 3);
                else n = this._freiKontakt(n, X, Y, x, y, z, n0, n1, n2, tiefe, mu, kopf + i / 3);
            }
        }
        if (n > vorher) this._freiNachbarn(X, Y);
        return n;
    }

    // DIE VIER (die Mannigfaltigkeit einer Berührung): von ihren Kontakten [n0 … n) im Puffer bleiben höchstens vier — der
    // tiefste, der weiteste von ihm, der mit ihnen das größte Dreieck spannt, und der jenseits ihrer Kante am weitesten; die
    // Fläche trägt wie mit allen, die Gänge kosten ein Viertel (das stehende Fass trug 16 Rand-Punkte am Boden).
    _freiVier(n0, n) {
        if (n - n0 <= 4) return n;
        const G = this._freiG;
        const CS = AnazhRealm.FREI_KONTAKT;
        // die Wahl je Index (nichts wandert, bis die vier feststehen); der Anker r_a des Kontakts k liegt ab k·CS + 65
        let b = n0;
        for (let k = n0 + 1; k < n; k++) if (G[k * CS + 75] > G[b * CS + 75]) b = k;
        const i0 = b;
        const p0 = G[i0 * CS + 65];
        const p1 = G[i0 * CS + 66];
        const p2 = G[i0 * CS + 67];
        let best = -1;
        for (let k = n0; k < n; k++) {
            const c = k * CS + 65;
            const d = (G[c] - p0) ** 2 + (G[c + 1] - p1) ** 2 + (G[c + 2] - p2) ** 2;
            if (k !== i0 && d > best) {
                best = d;
                b = k;
            }
        }
        const i1 = b;
        const u0 = G[i1 * CS + 65] - p0;
        const u1 = G[i1 * CS + 66] - p1;
        const u2 = G[i1 * CS + 67] - p2;
        // die Normale des Dreiecks p, q, r (unnormiert): ihr Betrag ist die doppelte Fläche, ihr Vorzeichen längs m die Seite
        best = -1;
        let m0 = 0;
        let m1 = 0;
        let m2 = 0;
        for (let k = n0; k < n; k++) {
            if (k === i0 || k === i1) continue;
            const c = k * CS + 65;
            const v0 = G[c] - p0;
            const v1 = G[c + 1] - p1;
            const v2 = G[c + 2] - p2;
            const x = u1 * v2 - u2 * v1;
            const y = u2 * v0 - u0 * v2;
            const z = u0 * v1 - u1 * v0;
            const a = x * x + y * y + z * z;
            if (a > best) {
                best = a;
                b = k;
                m0 = x;
                m1 = y;
                m2 = z;
            }
        }
        const i2 = b;
        best = Infinity;
        for (let k = n0; k < n; k++) {
            if (k === i0 || k === i1 || k === i2) continue;
            const c = k * CS + 65;
            const v0 = G[c] - p0;
            const v1 = G[c + 1] - p1;
            const v2 = G[c + 2] - p2;
            const a = (u1 * v2 - u2 * v1) * m0 + (u2 * v0 - u0 * v2) * m1 + (u0 * v1 - u1 * v0) * m2;
            if (a < best) {
                best = a;
                b = k;
            }
        }
        if (!(best < 0)) {
            best = -1;
            const s0 = G[i2 * CS + 65];
            const s1 = G[i2 * CS + 66];
            const s2 = G[i2 * CS + 67];
            for (let k = n0; k < n; k++) {
                if (k === i0 || k === i1 || k === i2) continue;
                const c = k * CS + 65;
                const d = (G[c] - s0) ** 2 + (G[c + 1] - s1) ** 2 + (G[c + 2] - s2) ** 2;
                if (d > best) {
                    best = d;
                    b = k;
                }
            }
        }
        // die vier nach vorn: über einen Zwischen-Puffer (sie liegen irgendwo in [n0, n))
        const T = this._freiVierT || (this._freiVierT = new Float64Array(4 * CS));
        T.set(G.subarray(i0 * CS, i0 * CS + CS), 0);
        T.set(G.subarray(i1 * CS, i1 * CS + CS), CS);
        T.set(G.subarray(i2 * CS, i2 * CS + CS), 2 * CS);
        T.set(G.subarray(b * CS, b * CS + CS), 3 * CS);
        G.set(T, n0 * CS);
        return n0 + 4;
    }

    // der Puffer der Kontakte trägt n Kontakte (er wächst, was er trug, bleibt)
    _freiPlatz(n) {
        const CS = AnazhRealm.FREI_KONTAKT;
        const G = this._freiG;
        if (G && G.length >= n * CS) return;
        const neu = new Float64Array(Math.max(64, n * 2) * CS);
        if (G) neu.set(G);
        this._freiG = neu;
    }

    _freiWecken(K) {
        K.schlaf = false;
        K.ruhe = 0;
    }

    // EIN KONTAKT in den Puffer (`_freiG`, je Kontakt FREI_KONTAKT Zahlen, er wächst und lebt weiter): Körper a (wach, sein Platz im
    // Körper-Puffer), Gegner b (null: Welt; ein schlafender Gegner und die Box eines Baus halten still wie die Welt), Punkt, Normale
    // (aus b heraus zu a hin), Tiefe, μ, Schlüssel des Warmstarts.
    _freiKontakt(n, a, b, x, y, z, nx, ny, nz, tiefe, mu, key) {
        const CS = AnazhRealm.FREI_KONTAKT;
        this._freiPlatz(n + 1);
        const G = this._freiG;
        const c = n * CS;
        const bw = !!b && !b.schlaf;
        G[c] = nx;
        G[c + 1] = ny;
        G[c + 2] = nz;
        G[c + 55] = mu;
        G[c + 58] = a.slot;
        G[c + 59] = bw ? b.slot : -1;
        G[c + 65] = x - a.p[0];
        G[c + 66] = y - a.p[1];
        G[c + 67] = z - a.p[2];
        G[c + 71] = b ? x - b.p[0] : 0;
        G[c + 72] = b ? y - b.p[1] : 0;
        G[c + 73] = b ? z - b.p[2] : 0;
        G[c + 74] = key;
        G[c + 75] = tiefe;
        if (!b || b.statisch) a.welt = true;
        return n + 1;
    }

    // DER KONTAKT BEREIT (einmal je Schritt, im Puffer ab c): Tangenten zur Normalen, je Richtung d die Jacobi-Zeile (d, r_a×d,
    // I_a⁻¹(r_a×d), r_b×d, I_b⁻¹(r_b×d)) und ihre wirksame Masse, die Anker im Rahmen ihres Körpers (sie drehen mit ihm), die
    // Trennung am Beginn (−Tiefe), das Tempo längs der Normalen vor jedem Stoß (der Prall liest es), die Feder (`_freiWeich`: der
    // starre Gegner mit doppelter Hertz), die inversen Massen und der Warmstart des vorigen Schritts (`alt`, nach Schlüssel).
    _freiKontaktBereit(c, X, weich, alt) {
        const G = this._freiG;
        const a = G[c + 58] | 0;
        const b = G[c + 59] | 0;
        const n0 = G[c];
        const n1 = G[c + 1];
        const n2 = G[c + 2];
        const quer = Math.abs(n0) > 0.57;
        const tl = Math.sqrt(quer ? n0 * n0 + n1 * n1 : n1 * n1 + n2 * n2);
        const t0 = quer ? n1 / tl : 0;
        const t1 = quer ? -n0 / tl : n2 / tl;
        const t2 = quer ? 0 : -n1 / tl;
        G[c + 15] = t0;
        G[c + 16] = t1;
        G[c + 17] = t2;
        G[c + 30] = n1 * t2 - n2 * t1;
        G[c + 31] = n2 * t0 - n0 * t2;
        G[c + 32] = n0 * t1 - n1 * t0;
        for (let d = 0, o = c; d < 3; d++, o += 15) {
            let k = 0;
            for (let seite = 0; seite < 2; seite++) {
                const K = seite ? b : a;
                const q = o + 3 + seite * 6;
                if (K < 0) {
                    G[q] = G[q + 1] = G[q + 2] = G[q + 3] = G[q + 4] = G[q + 5] = 0;
                    continue;
                }
                const r = c + (seite ? 71 : 65);
                const x = G[r + 1] * G[o + 2] - G[r + 2] * G[o + 1];
                const y = G[r + 2] * G[o] - G[r] * G[o + 2];
                const z = G[r] * G[o + 1] - G[r + 1] * G[o];
                const I = K + 28;
                G[q] = x;
                G[q + 1] = y;
                G[q + 2] = z;
                G[q + 3] = X[I] * x + X[I + 1] * y + X[I + 2] * z;
                G[q + 4] = X[I + 3] * x + X[I + 4] * y + X[I + 5] * z;
                G[q + 5] = X[I + 6] * x + X[I + 7] * y + X[I + 8] * z;
                k += X[K + 27] + x * G[q + 3] + y * G[q + 4] + z * G[q + 5];
            }
            G[c + 45 + d] = 1 / k;
        }
        // die Anker im Rahmen: Rᵀ · r
        for (let seite = 0; seite < 2; seite++) {
            const K = seite ? b : a;
            if (K < 0) continue;
            const r = c + (seite ? 71 : 65);
            const L = c + (seite ? 68 : 62);
            const R = K + 16;
            G[L] = X[R] * G[r] + X[R + 3] * G[r + 1] + X[R + 6] * G[r + 2];
            G[L + 1] = X[R + 1] * G[r] + X[R + 4] * G[r + 1] + X[R + 7] * G[r + 2];
            G[L + 2] = X[R + 2] * G[r] + X[R + 5] * G[r + 1] + X[R + 8] * G[r + 2];
        }
        G[c + 51] = -G[c + 75];
        let vn =
            X[a] * n0 + X[a + 1] * n1 + X[a + 2] * n2 + X[a + 3] * G[c + 3] + X[a + 4] * G[c + 4] + X[a + 5] * G[c + 5];
        if (b >= 0)
            vn -=
                X[b] * n0 +
                X[b + 1] * n1 +
                X[b + 2] * n2 +
                X[b + 3] * G[c + 9] +
                X[b + 4] * G[c + 10] +
                X[b + 5] * G[c + 11];
        G[c + 57] = vn;
        const w = b >= 0 ? 0 : 3;
        G[c + 52] = weich[w];
        G[c + 53] = weich[w + 1];
        G[c + 54] = weich[w + 2];
        G[c + 56] = 0;
        G[c + 60] = X[a + 27];
        G[c + 61] = b >= 0 ? X[b + 27] : 0;
        const l = alt.get(G[c + 74]);
        G[c + 48] = l ? l[0] : 0;
        G[c + 49] = l ? l[1] : 0;
        G[c + 50] = l ? l[2] : 0;
    }

    // DIE PACKUNG der wachen Körper (EIN Puffer, kein Objekt je Körper im Gang): je Körper FREI_KOERPER Zahlen — v, ω, Lage, Lage
    // am Beginn, Quaternion, Dreh-Matrix (0–24), der Rollwiderstand je Drehung und ob er die Welt berührt (25, 26), die inverse
    // Masse und die Welt-Trägheit⁻¹ (27–36); sein Platz (`slot`) steht in jedem seiner Kontakte. Je Kontakt FREI_KONTAKT Zahlen
    // (`_freiKontakt`, `_freiKontaktBereit`): die Jacobi-Zeilen der Normalen und der zwei Tangenten (je 15), die wirksamen Massen
    // (45), die Impulse (48), Trennung, Feder, μ, der größte Normal-Impuls und das Tempo vor dem Stoß (51–57), die Plätze seiner
    // Körper (58, 59; −1: Welt), ihre inversen Massen (60, 61), die Anker (62–73: r_a im Rahmen und in der Welt, dasselbe für b),
    // der Schlüssel des Warmstarts (74) und die Tiefe (75).
    _freiKoerperPacken(W) {
        const KS = AnazhRealm.FREI_KOERPER;
        if (!this._freiX || this._freiX.length < W.length * KS) this._freiX = new Float64Array(W.length * KS * 2);
        const X = this._freiX;
        const roll = AnazhRealm._fahrSchrittGesetz().vc.FAHR.rollDecel;
        for (let i = 0, x = 0; i < W.length; i++, x += KS) {
            const K = W[i];
            K.slot = x;
            X.set(K.v, x);
            X.set(K.w, x + 3);
            X.set(K.p, x + 6);
            X.set(K.p, x + 9);
            X.set(K.q, x + 12);
            X.set(K.R, x + 16);
            X[x + 25] = roll / K.rad;
            X[x + 26] = 0;
            X[x + 27] = K.invM;
            X.set(K.Iw, x + 28);
        }
        return X;
    }

    // DER GANG über alle Kontakte im Puffer: je Kontakt die Normale (λ ≥ 0, akkumuliert) — die Trennung jetzt aus dem Weg
    // beider Anker seit dem Beginn des Schritts; ein Spalt darf sich in diesem Teil-Schritt schließen, eine Durchdringung drückt
    // die Feder heraus (`mitFeder`, mit höchstens `schub`; die Entspannung ohne sie) —, dann die Reibung der zwei Tangenten im
    // Kegel |λt| ≤ μ λn. `warm`: statt zu lösen gibt der Gang die gesammelten Impulse noch einmal (der Warmstart jedes
    // Teil-Schritts). `prall` (e): der Stoß des Aufpralls nach den Teil-Schritten. Die Bewegung beider Körper lebt je Kontakt in
    // Variablen (einmal gelesen, einmal geschrieben): vorher las und schrieb jede der drei Richtungen sie neu, 109 ns je Kontakt.
    _freiGang(G, n, X, invH, mitFeder, schub, warm, prall) {
        const CS = AnazhRealm.FREI_KONTAKT;
        for (let k = 0, c = 0; k < n; k++, c += CS) {
            const a = G[c + 58] | 0; // die Lage im Körper-Puffer als ganze Zahl (ein Index aus Float64 kostet je Zugriff)
            const b = G[c + 59] | 0;
            const mb = b >= 0;
            let ziel = 0;
            let ms = 1;
            let is = 0;
            if (prall !== undefined) {
                if (G[c + 57] > -prall.ab || !(G[c + 56] > 0)) continue;
                ziel = prall.e * G[c + 57];
            } else if (!warm) {
                const r0 = G[c + 62];
                const r1 = G[c + 63];
                const r2 = G[c + 64];
                let s =
                    G[c + 51] +
                    (X[a + 6] - X[a + 9] + X[a + 16] * r0 + X[a + 17] * r1 + X[a + 18] * r2 - G[c + 65]) * G[c] +
                    (X[a + 7] - X[a + 10] + X[a + 19] * r0 + X[a + 20] * r1 + X[a + 21] * r2 - G[c + 66]) * G[c + 1] +
                    (X[a + 8] - X[a + 11] + X[a + 22] * r0 + X[a + 23] * r1 + X[a + 24] * r2 - G[c + 67]) * G[c + 2];
                if (mb) {
                    const q0 = G[c + 68];
                    const q1 = G[c + 69];
                    const q2 = G[c + 70];
                    s -=
                        (X[b + 6] - X[b + 9] + X[b + 16] * q0 + X[b + 17] * q1 + X[b + 18] * q2 - G[c + 71]) * G[c] +
                        (X[b + 7] - X[b + 10] + X[b + 19] * q0 + X[b + 20] * q1 + X[b + 21] * q2 - G[c + 72]) *
                            G[c + 1] +
                        (X[b + 8] - X[b + 11] + X[b + 22] * q0 + X[b + 23] * q1 + X[b + 24] * q2 - G[c + 73]) *
                            G[c + 2];
                }
                if (s > 0) ziel = s * invH;
                else if (mitFeder) {
                    ziel = Math.max(G[c + 52] * s, -schub);
                    ms = G[c + 53];
                    is = G[c + 54];
                }
            }
            const ia = G[c + 60];
            const ib = G[c + 61];
            let v0 = X[a];
            let v1 = X[a + 1];
            let v2 = X[a + 2];
            let w0 = X[a + 3];
            let w1 = X[a + 4];
            let w2 = X[a + 5];
            let u0 = 0;
            let u1 = 0;
            let u2 = 0;
            let x0 = 0;
            let x1 = 0;
            let x2 = 0;
            if (mb) {
                u0 = X[b];
                u1 = X[b + 1];
                u2 = X[b + 2];
                x0 = X[b + 3];
                x1 = X[b + 4];
                x2 = X[b + 5];
            }
            const dMax = prall !== undefined ? 1 : 3;
            for (let d = 0, o = c; d < dMax; d++, o += 15) {
                const li = c + 48 + d;
                let dl = G[li];
                if (!warm) {
                    const vel =
                        (v0 - u0) * G[o] +
                        (v1 - u1) * G[o + 1] +
                        (v2 - u2) * G[o + 2] +
                        w0 * G[o + 3] +
                        w1 * G[o + 4] +
                        w2 * G[o + 5] -
                        x0 * G[o + 9] -
                        x1 * G[o + 10] -
                        x2 * G[o + 11];
                    let neu;
                    if (d === 0) {
                        neu = Math.max(0, G[li] - G[c + 45] * ms * (vel + ziel) - is * G[li]);
                        if (neu > G[c + 56]) G[c + 56] = neu;
                    } else {
                        const max = G[c + 55] * G[c + 48];
                        neu = Math.max(-max, Math.min(max, G[li] - vel * G[c + 45 + d]));
                    }
                    dl = neu - G[li];
                    G[li] = neu;
                }
                if (dl === 0) continue;
                const pa = dl * ia;
                v0 += G[o] * pa;
                v1 += G[o + 1] * pa;
                v2 += G[o + 2] * pa;
                w0 += G[o + 6] * dl;
                w1 += G[o + 7] * dl;
                w2 += G[o + 8] * dl;
                const pb = dl * ib;
                u0 -= G[o] * pb;
                u1 -= G[o + 1] * pb;
                u2 -= G[o + 2] * pb;
                x0 -= G[o + 12] * dl;
                x1 -= G[o + 13] * dl;
                x2 -= G[o + 14] * dl;
            }
            X[a] = v0;
            X[a + 1] = v1;
            X[a + 2] = v2;
            X[a + 3] = w0;
            X[a + 4] = w1;
            X[a + 5] = w2;
            if (mb) {
                X[b] = u0;
                X[b + 1] = u1;
                X[b + 2] = u2;
                X[b + 3] = x0;
                X[b + 4] = x1;
                X[b + 5] = x2;
            }
        }
    }

    // DIE LAGE im Puffer (jeder Teil-Schritt): x += v·h, die Drehung q += ½ ω ⊗ q · h (normiert, die Dreh-Matrix neu), der
    // Rollwiderstand des Fahr-Gesetzes am Boden; `g` die Schwere davor (`vor`) — die Geschwindigkeit des Teil-Schritts.
    _freiZiehen(X, m, h, g, vor) {
        const KS = AnazhRealm.FREI_KOERPER;
        for (let x = 0; x < m * KS; x += KS) {
            if (vor) {
                X[x + 1] += g * h;
                continue;
            }
            X[x + 6] += X[x] * h;
            X[x + 7] += X[x + 1] * h;
            X[x + 8] += X[x + 2] * h;
            const wx = X[x + 3];
            const wy = X[x + 4];
            const wz = X[x + 5];
            const qw = X[x + 12];
            const qx = X[x + 13];
            const qy = X[x + 14];
            const qz = X[x + 15];
            let w = qw + 0.5 * h * (-wx * qx - wy * qy - wz * qz);
            let a = qx + 0.5 * h * (wx * qw + wy * qz - wz * qy);
            let b = qy + 0.5 * h * (wy * qw + wz * qx - wx * qz);
            let c = qz + 0.5 * h * (wz * qw + wx * qy - wy * qx);
            const ql = 1 / Math.sqrt(w * w + a * a + b * b + c * c);
            w *= ql;
            a *= ql;
            b *= ql;
            c *= ql;
            X[x + 12] = w;
            X[x + 13] = a;
            X[x + 14] = b;
            X[x + 15] = c;
            X[x + 16] = 1 - 2 * (b * b + c * c);
            X[x + 17] = 2 * (a * b - w * c);
            X[x + 18] = 2 * (a * c + w * b);
            X[x + 19] = 2 * (a * b + w * c);
            X[x + 20] = 1 - 2 * (a * a + c * c);
            X[x + 21] = 2 * (b * c - w * a);
            X[x + 22] = 2 * (a * c - w * b);
            X[x + 23] = 2 * (b * c + w * a);
            X[x + 24] = 1 - 2 * (a * a + b * b);
            const wm = Math.sqrt(wx * wx + wy * wy + wz * wz);
            if (X[x + 26] && wm > 0) {
                const f = Math.max(0, wm - X[x + 25] * h) / wm;
                X[x + 3] *= f;
                X[x + 4] *= f;
                X[x + 5] *= f;
            }
        }
    }

    // DAS BILD UND DIE HÜLLE: der Eintrag steht, wo der Löser den Körper hält (Schwerpunkt minus Plan-Lage), die Pose des Werks
    // trägt die Drehung (`_werkPoseZeigen`); seine Blocker-Box ist die Hülle der Punkte in der Welt (Kapsel, Tier und Strahl
    // lösen gegen sie), neu gestempelt, sobald er seine überstrichene Hülle verlässt oder einschläft.
    _freiZeigen(K) {
        const e = K.e;
        // still seit dem letzten Bild (unter 0,1 mm und 0,01°): nichts zu zeigen, nichts zu stempeln
        const z = K.gezeigt || (K.gezeigt = new Float64Array(7).fill(NaN));
        const ruhig =
            Math.abs(K.p[0] - z[0]) + Math.abs(K.p[1] - z[1]) + Math.abs(K.p[2] - z[2]) < 1e-4 &&
            Math.abs(K.q[0] * z[3] + K.q[1] * z[4] + K.q[2] * z[5] + K.q[3] * z[6]) > 1 - 1e-8;
        if (ruhig && !K.schlaf && K.stempel) return;
        z.set(K.p);
        z.set(K.q, 3);
        const um = e._gesetz.pose.um;
        e.position.x = K.p[0] - um.x * K.s;
        e.position.y = K.p[1] + 0.5 - um.y * K.s;
        e.position.z = K.p[2] - um.z * K.s;
        e._gesetz.pose.q.set(K.q[1], K.q[2], K.q[3], K.q[0]);
        this._werkPoseZeigen(e);
        // die Hülle der Punkte; die stehende Kiste ist eine gedrehte Box (`obb`, die Form der Haus-Hülle): Kapsel, Tier und Wagen
        // lösen in ihrem Rahmen
        const k = K.kasten;
        const R = K.R;
        const auf = !K.kiste
            ? -1
            : Math.abs(R[3]) > 0.9998
              ? 0
              : Math.abs(R[4]) > 0.9998
                ? 1
                : Math.abs(R[5]) > 0.9998
                  ? 2
                  : -1;
        const box = { minX: k[0], maxX: k[3], minZ: k[2], maxZ: k[5], topY: k[4], botY: k[1] };
        if (auf >= 0) {
            const [a, b] = [(auf + 1) % 3, (auf + 2) % 3];
            box.obb = { cx: K.p[0], cz: K.p[2], c: R[a], s: -R[6 + a], hx: K.halb[a], hz: K.halb[b] };
        }
        box.stoff = K.stoff;
        box.stempelfrei = true; // er wandert: er staut kein Wasser
        e.blockerAABBs = [box];
        // DER STEMPEL WANDERT MIT: das Netz trägt den Körper in der überstrichenen Hülle (`_streichHuelle`, FREI.huelleM um seine
        // Box beim Stempel) — bis er sie verlässt oder einschläft, folgt nur die Box (Kapsel, Tier und Strahl lesen sie), das Netz
        // bleibt; vorher stempelte er je 2 cm neu: im fallenden Trümmerfeld je Schritt jeden Körper (100 Kisten: 1,1 → 0,8 ms je
        // Schritt, Null-Renderer)
        const H = AnazhRealm.FREI.huelleM;
        const sp = K.stempel;
        if (sp && !K.schlaf && Math.abs(sp[0] - K.p[0]) < H && Math.abs(sp[2] - K.p[2]) < H) return;
        e._streichHuelle = K.schlaf ? null : [k[0] - H, k[3] + H, k[2] - H, k[5] + H];
        K.stempel = K.p.slice();
        this._blockerBewegt(e);
        this._blockerStampReach(e);
    }

    // DIE HÖHE DES STOSSES: die Mitte des Bands [unten, oben] (die Hülle des Wagens, die Kapsel des Spielers), soweit es die Box
    // des Körpers überlappt — dort greift der nächste Stoß (`_freiStoss`).
    _freiStossHoehe(e, unten, oben) {
        const b = e.blockerAABBs && e.blockerAABBs[0];
        e._freiStossY = b ? (Math.max(unten, b.botY) + Math.min(oben, b.topY)) / 2 : NaN;
    }

    // DER TREFFER als Teilnehmer des Impuls-Gesetzes (`_stossKoerper`): die wirksame Masse des Körpers am Punkt in der Höhe des
    // Stoßes (`_freiStossHoehe`) quer zur Lotrechten, 1 / (1/m + h²·(I⁻¹ₓₓ + I⁻¹zz)/2), und das Tempo dieses Punkts (v + ω × h·ŷ) —
    // so stößt das Gesetz den Punkt, den es trifft, genau einmal: maß es den Schwerpunkt, der über ihm getroffen langsamer geht,
    // stieß die Hülle Schritt um Schritt nach (ein Fass flog mit 14,9 m/s vor einem Wagen mit 6 m/s).
    _freiTreffer(e, o) {
        const K = e._frei;
        const h = (Number.isFinite(e._freiStossY) ? e._freiStossY : K.p[1]) - K.p[1];
        this._freiLage(K);
        o.m = 1 / (K.invM + (h * h * (K.Iw[0] + K.Iw[8])) / 2);
        o.vx = K.v[0] - K.w[2] * h;
        o.vz = K.v[2] + K.w[0] * h;
        return o;
    }

    // DER STOSS DES IMPULS-GESETZES am freien Körper (`_stossAuf`, Art „frei"): das Gesetz gibt dem Punkt, an dem die Hülle des
    // Wagens den Körper berührt, die Geschwindigkeit dv längs (nx, nz) — die Mitte des Bands, in dem Hülle und Körper sich
    // überlappen (`e._freiStossY`, `_fahrHuelleKontakt`; ohne Hülle seine Mitte), auf der dem Wagen zugewandten Seite. Der Impuls trägt Masse UND Trägheit des Körpers
    // (j = dv / (1/m + (r×n)·I⁻¹(r×n))): über dem Schwerpunkt getroffen, kippt er.
    _freiStoss(e, nx, nz, dv) {
        const K = e._frei;
        if (!K || !(dv > 0)) return;
        this._freiWecken(K);
        this._freiLage(K);
        let best = -Infinity;
        let px = K.p[0];
        let pz = K.p[2];
        for (let i = 0; i < K.pw.length; i += 3) {
            const d = -(K.pw[i] - K.p[0]) * nx - (K.pw[i + 2] - K.p[2]) * nz;
            if (d > best) [best, px, pz] = [d, K.pw[i], K.pw[i + 2]];
        }
        const y = Number.isFinite(e._freiStossY) ? e._freiStossY : K.p[1];
        e._freiStossY = NaN;
        // der Hebel r und r × n, die wirksame Masse 1 / (1/m + (r×n)·I⁻¹(r×n)), der Impuls j = dv · sie: v += n j/m, ω += I⁻¹(r×n) j
        const [r0, r1, r2] = [px - K.p[0], y - K.p[1], pz - K.p[2]];
        const [c0, c1, c2] = [r1 * nz, r2 * nx - r0 * nz, -r1 * nx];
        const I = K.Iw;
        const i0 = I[0] * c0 + I[1] * c1 + I[2] * c2;
        const i1 = I[3] * c0 + I[4] * c1 + I[5] * c2;
        const i2 = I[6] * c0 + I[7] * c1 + I[8] * c2;
        const j = dv / (K.invM + c0 * i0 + c1 * i1 + c2 * i2);
        K.v[0] += nx * j * K.invM;
        K.v[2] += nz * j * K.invM;
        K.w[0] += i0 * j;
        K.w[1] += i1 * j;
        K.w[2] += i2 * j;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_koerper_frei]);

// ===== ATLAS · Koerper/frei — Außen-Konstanten =====
// DER LÖSER DER FREIEN KÖRPER (physik.K3, `_freiSchritt`, der weiche Schritt): Teil-Schritte je Sim-Schritt (240 Hz) und Gänge
// mit Feder je Teil-Schritt; die Feder des Kontakts (Hertz, Dämpfung ζ; der starre Gegner mit doppelter Hertz — Box2D v3: 30 Hz,
// ζ 10) und das höchste Tempo, mit dem sie eine Durchdringung herausdrückt (m/s); der Spalt (m), ab dem ein Punkt vor einer
// Fläche schon ein Kontakt ist (Boden und Bau; Körper an Körper enger — ein weiter Spalt hielt die Kiste über der Seite der
// unteren), dazu sein Weg im Schritt; ab prallMs Aufprall prallt der Körper mit der Stoß-Zahl des Starren; ruhig unter ruheMs
// (jeder Punkt), nach ruheS schläft er; ein Fass trägt je Rand rundPunkte Punkte; die Hülle stempelt neu nach huelleM Weg (dazwischen folgt sie an Ort und Stelle); Grund und
// Bauten gelten umweltM (m) Weg (`_freiUmwelt`).
// Die Kosten (Node, flacher Boden, die Bank: 100 Kisten in 25 Säulen fallen, stoßen, ruhen): vorher (4 × Kontakt-Suche,
// 8 + 8 Gänge je Teil-Schritt) 24 ms je Schritt wach; der Schlaf kostet nichts (ruht jeder, rechnet der Löser nicht).
// Die Packung des Lösers (`_freiKoerperPacken`, `_freiKontakt`): Zahlen je wachem Körper und je Kontakt im Puffer.
AnazhRealm.FREI_KONTAKT = 76;
// die Marke eines Baus ohne freien Körper (die Stand-Tafel, `architectures`): vier leere Plätze der Drehung
AnazhRealm.FREI_OHNE_DREHUNG = Object.freeze([null, null, null, null]);
AnazhRealm.FREI_KOERPER = 40;
AnazhRealm.FREI = Object.freeze({
    teile: 4,
    gaenge: 1,
    hertz: 30,
    daempfung: 10,
    schubMs: 3,
    spalt: 0.02,
    spaltKoerper: 0.005,
    prallMs: 0.5,
    ruheMs: 0.05,
    ruheS: 0.3,
    rundPunkte: 16,
    huelleM: 0.5,
    umweltM: 0.3,
});
