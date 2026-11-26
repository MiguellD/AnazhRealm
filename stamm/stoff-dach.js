class AnazhRealm_stoff_dach {
    // ===== ATLAS · Stoff/dach — Der Körper mit Decke: Dach-Pool · offener Himmel · Raum-Licht und sein Sonnen-Takt · das Auge unter Dach =====
    // DIE HIMMELS-SICHT DES REGENS am Welt-Ort `p`: 1 unter offenem Himmel, 0 unter einer Decke des Dach-Pools — je Platz die
    // Decke eines Baus (Mitte xz, Gier cos/sin; halbe Kanten, Oberkante y), ein Ort darunter und im Grundriss der Decke liegt
    // unter ihr. Leser: die Nässe der Stoffe (`_naesseHimmel`, je Fragment) und die Schliere des Regens (`_ensureRainSystem`,
    // je Schliere: unter der Decke fällt kein Regen — bis dahin fiel er durch jedes Dach, gate:naesse:echt sah ihn am Haus des
    // Dorfs auf der Trasse: 27 Regen-Punkte innen).
    // DIE PLÄTZE SIND EINE SCHLEIFE (w28-baum-programm, wie der Licht-Pool `_lichtPoolTerm`): die Decken laufen über `T.Loop` je
    // Platz, ihre Werte wählt der Zähler (`_jePlatz`: dieselben Uniforms, EIN Schreiber `_dachTakt`) — dieselbe Rechnung in derselben
    // Reihenfolge (das Maximum beginnt bei 0), nur nicht ausgeschrieben: acht Plätze standen in jedem beleuchteten Programm.
    // Die Schleife steht im Zweig der Hülle (`If`), wie zuvor die Plätze: draußen zahlt kein Fragment sie.
    _offenerHimmel(T, p) {
        const U = this._ensureAtmoUniforms();
        // DIE HÜLLE DES POOLS (naesse-kosten): die Plätze prüft nur ein Ort im Kasten um alle Decken und unter ihrer höchsten
        // Oberkante (`dachHuelle`/`dachOben`, `_dachTakt`) — draußen steht er unter offenem Himmel, ohne Decke ist der Kasten leer.
        // Gemessen GTX in EINER Welt (Wiese Ego, Regen 10 min, gpu-bank): der Pool kostete jedes nasse Fragment +0,54 ms je Bild,
        // auch ohne ein Dach im Umkreis; das Gesetz selbst +0,05
        const H = U.dachHuelle;
        const drin = p.x
            .greaterThanEqual(H.x)
            .and(p.x.lessThanEqual(H.z))
            .and(p.z.greaterThanEqual(H.y))
            .and(p.z.lessThanEqual(H.w))
            .and(p.y.lessThanEqual(U.dachOben));
        return T.Fn(() => {
            const offen = T.float(1).toVar();
            T.If(drin, () => {
                const unter = T.float(0).toVar();
                T.Loop(U.dachLage.length, ({ i: k }) => {
                    const [L, M] = AnazhRealm._jePlatz(T, [U.dachLage, U.dachMass], k);
                    const d = p.xz.sub(L.xy);
                    const lx = d.x.mul(L.z).sub(d.y.mul(L.w)).abs();
                    const lz = d.x.mul(L.w).add(d.y.mul(L.z)).abs();
                    unter.assign(unter.max(T.step(lx, M.x).mul(T.step(lz, M.y)).mul(T.step(p.y, M.z))));
                });
                offen.assign(T.float(1).sub(unter));
            });
            return offen;
        })();
    }

    // DER SCHATTEN DER HÄUSER (Karte 2 planet.kopplung.stadtklima#1 — „Schatten kühlt, die Pfütze trocknet im Schatten später“):
    // liegt der Welt-Ort `p` im Schatten eines Körpers des Dach-Pools? Der Strahl von `p` zur Sonne `s` (Einheitsvektor) gegen den
    // Kasten jeder Decke (Grundriss Mitte xz, Gier cos/sin, halbe Kanten; vom Boden bis zur Oberkante): im Grundriss das Stück
    // [tE, tX] des waagrechten Wegs, das im gedrehten Rechteck liegt (zwei Platten), und der Strahl steht am Eintritt noch unter
    // der Oberkante (er steigt mit tan β). 1 im Schatten, 0 sonst; die Sonne unter dem Horizont wirft keinen. EINE Formel über
    // einer Algebra (k · add · sub · mul · div · min · max · sqrt · step(a, b) = b ≥ a): die Zahlen auf der CPU (`_hausSchatten`,
    // die Nässe am Ort `_naesseAm`, die Station), die TSL-Knoten im Stoff (`_naesseOrtKnoten`) — dieselben Decken (`_deckenVon`).
    static _hausSchattenGesetz(A, px, py, pz, sx, sy, sz, L, M) {
        const dx = A.sub(px, L[0]);
        const dz = A.sub(pz, L[1]);
        const lx = A.sub(A.mul(dx, L[2]), A.mul(dz, L[3]));
        const lz = A.add(A.mul(dx, L[3]), A.mul(dz, L[2]));
        const h = A.max(A.sqrt(A.add(A.mul(sx, sx), A.mul(sz, sz))), A.k(1e-4));
        const ux = A.div(A.sub(A.mul(sx, L[2]), A.mul(sz, L[3])), h);
        const uz = A.div(A.add(A.mul(sx, L[3]), A.mul(sz, L[2])), h);
        const platte = (l, u, e) => {
            const v = A.add(u, A.mul(A.sub(A.mul(A.step(A.k(0), u), A.k(2)), A.k(1)), A.k(1e-6)));
            const a = A.div(A.sub(A.mul(e, A.k(-1)), l), v);
            const b = A.div(A.sub(e, l), v);
            return [A.min(a, b), A.max(a, b)];
        };
        const [x0, x1] = platte(lx, ux, M[0]);
        const [z0, z1] = platte(lz, uz, M[1]);
        const tE = A.max(A.max(x0, z0), A.k(0));
        const tX = A.min(x1, z1);
        const hoch = A.add(py, A.mul(tE, A.div(sy, h)));
        return A.mul(A.mul(A.step(tE, tX), A.step(hoch, M[2])), A.mul(A.step(A.k(0), sy), A.step(A.k(1e-6), M[0])));
    }
    // DIE SONNE DES SCHATTENS (je Takt der Nässe, EIN Schreiber): die Richtung zur Sonne (`_sonnenRichtung`, die des Lichts), der
    // Anteil der Trocken-Rate im vollen Schatten `q1` und die Hülle des Schattens — der Kasten des Pools (`dachHuelle`), gestreckt
    // gegen die Sonne um den längsten Wurf (die höchste Oberkante über dem Auge + `NAESSE.wurfUnterM`, × cot β, höchstens
    // `NAESSE.wurfM`); unter dem Horizont leer.
    _schattenTakt(q1) {
        const U = this._ensureAtmoUniforms();
        const s = this._sonnenRichtung();
        U.schattenSonne.value.set(s.x, s.y, s.z, q1);
        const H = U.dachHuelle.value;
        const auge = this._lodAuge();
        if (!(s.y > 0) || H.x > H.z || !auge) return U.schattenHuelle.value.set(1, 1, -1, -1);
        const N = AnazhRealm.NAESSE;
        const h = Math.max(1e-4, Math.hypot(s.x, s.z));
        const lang = Math.min(N.wurfM, (Math.max(0, U.dachOben.value - (auge.y || 0)) + N.wurfUnterM) * (h / s.y));
        const [wx, wz] = [(-s.x / h) * lang, (-s.z / h) * lang];
        U.schattenHuelle.value.set(
            H.x + Math.min(0, wx),
            H.y + Math.min(0, wz),
            H.z + Math.max(0, wx),
            H.w + Math.max(0, wz)
        );
    }
    // DER SCHATTEN DER HÄUSER AM ORT (x, y, z) auf der CPU (wind-boee-haus — die Welt ist eine Funktion des Orts, nie des Auges):
    // die Decken der Bauten, die der Strahl zur Sonne (`schattenSonne`, EIN Schreiber `_schattenTakt`) bis zum längsten Wurf
    // `NAESSE.wurfM` kreuzt — gefragt im Blocker-Netz Zelle um Zelle den Strahl entlang (`_blockerUmPlatz`), die Decken aus
    // `_deckenVon`. Bis hier las sie den Dach-Pool um das Auge (64 m): stand das Auge weiter weg, trocknete die Pfütze am Haus wie in
    // der Sonne, und der Reifen des Verkehrs griff dort trocken (Station stadtklima#1 an der Wiese: Haus 351 m, Schatten ÷ Sonne 0).
    // Der Stoff liest dieselben Decken über den Pool, solange sie in seinem Bild stehen. Gemerkt: dieselbe Frage am selben Stand.
    _hausSchatten(x, y, z) {
        const U = this.state.atmoUniforms;
        if (!U || !U.schattenSonne) return 0;
        const s = U.schattenSonne.value;
        if (!(s.y > 0)) return 0;
        const netz = this._blockerNetz();
        const W = this._dachWahl;
        const m = this._schattenMerk || (this._schattenMerk = { x: NaN });
        if (
            m.x === x &&
            m.y === y &&
            m.z === z &&
            m.sx === s.x &&
            m.sy === s.y &&
            m.sz === s.z &&
            m.netz === netz &&
            m.W === W
        )
            return m.v;
        const R = AnazhRealm.BLOCKER_ZELLE;
        const h = Math.max(1e-4, Math.hypot(s.x, s.z));
        const nah = this._schattenNah || (this._schattenNah = []);
        nah.length = 0;
        for (let t = 0; t <= AnazhRealm.NAESSE.wurfM + R; t += 2 * R)
            this._blockerUmPlatz(x + (s.x / h) * t, z + (s.z / h) * t, R, nah);
        const Z = AnazhRealm.SCHATTEN_ZAHLEN;
        let v = 0;
        for (let i = 0; i < nah.length && !v; i++)
            if (nah[i]._hausHuelle || nah[i]._dachKasten)
                for (const D of this._deckenVon(nah[i]))
                    if (AnazhRealm._hausSchattenGesetz(Z, x, y, z, s.x, s.y, s.z, D.L, D.M)) v = 1;
        nah.length = 0;
        Object.assign(m, { x, y, z, sx: s.x, sy: s.y, sz: s.z, netz, W, v });
        return v;
    }
    // DIE NÄSSE AM ORT (stadtklima#1): der Film der Welt trocknet je Ort mit seiner Rate — die Welt trägt ihren Trocken-Weg
    // (`_naesseWeg`: 1 − Film, solange er steht, danach weiter mit der Rate des Wetters, EIN Schreiber `_naesseTakt`), der Ort den
    // Anteil seiner Rate (`_trockenAnteil`: im Schatten der Häuser trägt die Sonne nur ihr Himmelslicht). Film am Ort = max(Film der
    // Welt, 1 − Weg × Anteil) — in der Sonne genau der Film der Welt. `weg` optional (die Station fragt die Zeit, bis er trocken ist).
    _naesseAm(x, y, z, weg) {
        const st = this.state;
        const n = Number.isFinite(st.naesse) ? st.naesse : 0;
        const w = Number.isFinite(weg) ? weg : Number.isFinite(this._naesseWeg) ? this._naesseWeg : 1 - n;
        const U = st.atmoUniforms;
        const q1 = U && U.schattenSonne ? U.schattenSonne.value.w : 1;
        const q = 1 - this._hausSchatten(x, y, z) * (1 - q1);
        const ort = Math.min(1, Math.max(0, 1 - w * q));
        return Number.isFinite(weg) ? ort : Math.max(n, ort);
    }
    // der Anteil der Trocken-Rate im vollen Schatten (je Wetter-Feld `wf`): die Luft trägt das Wasser nach Sonne, Wind und Luft ab
    // (`_trockenRate`, Penman: der Strahlungs-Term und der Term der Luft) — im Schatten fällt vom Strahlungs-Term der direkte Teil,
    // es bleibt das Himmelslicht (`NAESSE.diffus`); Wind und Luft trocknen wie in der Sonne.
    static _trockenAnteil(wf) {
        const N = AnazhRealm.NAESSE;
        const sonne = N.sonne * Math.max(0, wf.sun);
        const rest = N.wind * Math.max(0, wf.wind) + N.luft;
        return (sonne * N.diffus + rest) / (sonne + rest);
    }
    // DIE NÄSSE AM ORT IM STOFF (EIN Knoten je Seite): dieselbe Rechnung wie `_naesseAm` am Welt-Ort des Fragments — die Plätze laufen
    // nur, solange der Schatten noch nass ist (der Weg × der Anteil des Schattens < 1) und das Fragment in der Hülle des Schattens
    // liegt (`schattenHuelle`, `_dachTakt`: der Kasten der Plätze, gestreckt um ihren Wurf).
    _naesseOrtKnoten(T) {
        if (this._naesseOrtK) return this._naesseOrtK;
        const U = this._ensureAtmoUniforms();
        const p = T.positionWorld;
        const S = U.schattenSonne;
        const H = U.schattenHuelle;
        const A = {
            k: (n) => T.float(n),
            add: (a, b) => a.add(b),
            sub: (a, b) => a.sub(b),
            mul: (a, b) => a.mul(b),
            div: (a, b) => a.div(b),
            min: T.min,
            max: T.max,
            sqrt: T.sqrt,
            step: (a, b) => T.step(a, b),
        };
        const drin = p.x
            .greaterThanEqual(H.x)
            .and(p.x.lessThanEqual(H.z))
            .and(p.z.greaterThanEqual(H.y))
            .and(p.z.lessThanEqual(H.w))
            .and(U.naesseWeg.mul(S.w).lessThan(1));
        this._naesseOrtK = T.Fn(() => {
            const film = U.naesse.toVar();
            T.If(drin, () => {
                const im = T.float(0).toVar();
                T.Loop(U.dachLage.length, ({ i: k }) => {
                    const [L, M] = AnazhRealm._jePlatz(T, [U.dachLage, U.dachMass], k);
                    im.assign(im.max(AnazhRealm._hausSchattenGesetz(A, p.x, p.y, p.z, S.x, S.y, S.z, [L.x, L.y, L.z, L.w], [M.x, M.y, M.z]))); // prettier-ignore
                });
                const q = T.float(1).sub(im.mul(T.float(1).sub(S.w)));
                film.assign(T.max(film, T.float(1).sub(U.naesseWeg.mul(q)).clamp(0, 1)));
            });
            return film;
        })().toVar();
        this._naesseOrtK.global = true;
        return this._naesseOrtK;
    }

    // DER HIMMEL IM RAUM am Welt-Ort `p` (w28-innenlicht, der EINE Leser im Stoff: die Umgebung `_spiegelUmgebung`): 1 unter
    // offenem Himmel, unter einer Decke des Dach-Pools das Raum-Licht ihres Körpers (`dachMass.w`, fachwerk `raumLicht`: der
    // mittlere Tageslicht-Quotient — Öffnungsfläche × Himmels-Anteil × Durchlass / (Raum-Oberfläche × (1 − R²))). Bis hier nahm
    // der Bau dem Raum keinen Himmel: die Bestrahlung zog nur den Grat des Geländes ab, jeder Raum stand im vollen Himmel von
    // außen (GTX, Start-Dorf, Mittag: ohne Himmel der Umgebung Median 0,000 in 6 von 6 Räumen — er war ihr einziges Licht —,
    // und die Belichtung blieb die von draußen). Der Ort ist der des Fragments, um `RAUM.kanteM` längs seiner Normale gehoben:
    // die Außenseite der Wand liegt im Grundriss der Decke und sieht doch den Himmel. Unter zwei Decken trägt die hellere.
    // Dieselbe Hülle und dieselbe Schleife wie `_offenerHimmel` (draußen zahlt kein Fragment die Plätze); EIN Knoten je Seite
    // (wie `_naesseHimmel`): Bestrahlung und Spiegelung eines Stoffs lesen dieselbe Variable.
    _raumHimmel(T) {
        if (this._raumHimmelK) return this._raumHimmelK;
        const U = this._ensureAtmoUniforms();
        const H = U.dachHuelle;
        const p = T.positionWorld.add(T.normalWorld.mul(AnazhRealm.RAUM.kanteM));
        const drin = p.x
            .greaterThanEqual(H.x)
            .and(p.x.lessThanEqual(H.z))
            .and(p.z.greaterThanEqual(H.y))
            .and(p.z.lessThanEqual(H.w))
            .and(p.y.lessThanEqual(U.dachOben));
        this._raumHimmelK = T.Fn(() => {
            const anteil = T.float(1).toVar();
            T.If(drin, () => {
                const raum = T.float(-1).toVar();
                T.Loop(U.dachLage.length, ({ i: k }) => {
                    const [L, M] = AnazhRealm._jePlatz(T, [U.dachLage, U.dachMass], k);
                    const d = p.xz.sub(L.xy);
                    const lx = d.x.mul(L.z).sub(d.y.mul(L.w)).abs();
                    const lz = d.x.mul(L.w).add(d.y.mul(L.z)).abs();
                    const unter = T.step(lx, M.x).mul(T.step(lz, M.y)).mul(T.step(p.y, M.z));
                    raum.assign(raum.max(T.mix(T.float(-1), M.w, unter)));
                });
                anteil.assign(T.select(raum.greaterThanEqual(0), raum, T.float(1)));
            });
            return anteil;
        })().toVar();
        // EINMAL je Programm: r184 baut Bestrahlung und Spiegelung der Umgebung in je einem eigenen Cache (`CacheNode`) — ohne das
        // Wort `global` stand die Schleife des Dach-Pools zweimal im Text jedes beleuchteten Programms
        this._raumHimmelK.global = true;
        return this._raumHimmelK;
    }

    // DAS RAUM-LICHT AM AUGE (je Takt, einmal auf der CPU): dieselbe Regel wie `_raumHimmel` am Ort des Auges — die Zahl der
    // helleren Decke über ihm, null unter offenem Himmel. Leser: die Kamera (`_raumBlendeTakt`, bild-himmel).
    _raumAmAuge() {
        const st = this.state;
        const U = st.atmoUniforms;
        const e = st.camera && st.camera.matrixWorld.elements;
        if (!e || !U || !U.dachLage) return null;
        const [x, y, z] = [e[12], e[13], e[14]];
        const H = U.dachHuelle.value;
        if (x < H.x || x > H.z || z < H.y || z > H.w || y > U.dachOben.value) return null;
        let raum = null;
        const P = (this._dachWahl && this._dachWahl.platz) || [];
        this._raumFeldAmAuge = 0;
        U.dachLage.forEach((L, i) => {
            const [l, m] = [L.value, U.dachMass[i].value];
            const [dx, dz] = [x - l.x, z - l.y];
            if (Math.abs(dx * l.z - dz * l.w) <= m.x && Math.abs(dx * l.w + dz * l.z) <= m.y && y <= m.z) {
                if (!(m.w <= raum)) this._raumFeldAmAuge = P[i] ? P[i].feld : 0; // das Feld des Messers (fachwerk `raumSonne` Zahl 5) der helleren Decke
                raum = Math.max(raum == null ? 0 : raum, m.w);
            }
        });
        return raum;
    }

    // DER RÜCKSTRAHL DER SONNE IM RAUM (je Takt, EIN Schreiber der vierten Zahl von `dachMass`): das Raum-Licht eines Platzes ist
    // D (der Himmel, fachwerk `raumLicht`) + q × Σ Seite × max(0, n_Seite · Sonne) (fachwerk `raumSonne`: die vier Seiten des
    // Körpers, hier in die Welt gedreht) — q = E der Sonne senkrecht gegen E des Himmels waagrecht, `s` die Richtung zur Sonne.
    // Der EINE Umgebungs-Term (`_raumHimmel`) und die Kamera (`_raumAmAuge`) lesen die Summe; der Raum lebt mit der Uhr.
    // Ein Kasten ohne Haus-Hülle bleibt 1. Leser der Summe je Platz: die Linse (`_dachWahl.platz[i].licht`).
    _raumSonneTakt(q, s, g) {
        const U = this.state.atmoUniforms;
        const P = this._dachWahl && this._dachWahl.platz;
        if (!U || !U.dachMass || !P) return;
        P.forEach((d, i) => {
            // der Kasten ohne Haus-Hülle ist kein Raum (1); sonst sieht die Öffnung oben den Himmel, unten den Boden (g)
            let licht = d.sonne ? d.raum * (1 + g) : d.raum;
            if (d.sonne && q > 0 && s) {
                const [sx, sz] = [s.x * d.co - s.z * d.si, s.x * d.si + s.z * d.co];
                const S = d.sonne;
                licht +=
                    q *
                    (S[0] * Math.max(0, sx) +
                        S[1] * Math.max(0, -sx) +
                        S[2] * Math.max(0, sz) +
                        S[3] * Math.max(0, -sz));
            }
            d.licht = Math.min(1, licht);
            U.dachMass[i].value.w = d.licht;
        });
    }

    // DIE DECKE ÜBER DEM AUGE (je Takt, einmal auf der CPU — Lehre 14): dieselbe Regel wie `_offenerHimmel`, am Ort des Auges aus
    // den Werten des Dach-Pools (EIN Schreiber `_dachTakt`). Leser: der Rückstrahl (`_rueckstrahlZeichne`) — steht das Auge
    // unter einer Decke, trägt keine Umgebung den Boden des offenen Himmels. Bis dahin fragte jedes Fragment des Boden-Stoffs
    // den Pool ein zweites Mal (8 Plätze ausgeschrieben): die Prüfbühne S0 zählte 101 063 Zeichen WGSL > 100 000.
    _augeUnterDach() {
        const st = this.state;
        const U = st.atmoUniforms;
        const e = st.camera && st.camera.matrixWorld.elements;
        if (!e || !U || !U.dachLage) return false;
        const [x, y, z] = [e[12], e[13], e[14]];
        const H = U.dachHuelle.value;
        if (x < H.x || x > H.z || z < H.y || z > H.w || y > U.dachOben.value) return false;
        return U.dachLage.some((L, i) => {
            const [l, m] = [L.value, U.dachMass[i].value];
            const [dx, dz] = [x - l.x, z - l.y];
            return Math.abs(dx * l.z - dz * l.w) <= m.x && Math.abs(dx * l.w + dz * l.z) <= m.y && y <= m.z;
        });
    }

    // DER DACH-POOL (EIN Schreiber, aus `_naesseTakt`): die Decken der Bauten, die dem Auge am nächsten stehen (im
    // `dachUmkreisM`, die nächsten `NAESSE.dachPlaetze`), neu gewählt nach `dachSchrittM` Weg des Auges, einem neuen Stand der
    // Grundrisse oder einer neuen Decke (`_dachKastenSetzen`). Die Decken eines Hauses trägt seine Hülle (`__huelle.decken`,
    // fachwerk `deckenZeile`: je Körper mit Raum sein Grundriss bis zur Traufe, haus-lokal über `position.y − 0,5` wie die
    // Kollision) — jede ein Platz; die eines Baus ohne Haus-Hülle sein Kasten (`_dachKasten`). Ein leerer Platz hat die Kanten 0.
    // DAS GESETZBUCH NENNT SEINE DECKEN (w18-innen-licht, siedlung.K1#2): bis hier riet der Pool sie aus den Solids (die höchste
    // Box mit der halben Fläche der größten, 0,5 m über der Hülle) — das Gesetzbuch teilt jedes Obergeschoss am Treppenloch, und
    // der Anbau trägt keine Solid-Box: 11 der 18 Häuser des Start-Dorfs hatten die Diele des Erdgeschosses als Decke, jeder
    // Anbau keine; ihr Inneres stand unter offenem Himmel, der Regen fiel hinein, und der Rückstrahl (schatten.K4) legte den
    // gemessenen Dielenboden unter jede Fläche des Raums (haus_schwarzwald 16036, swiftshader, Innen-Blick 0,0062 → 0,0137).
    _dachTakt() {
        const st = this.state;
        const N = AnazhRealm.NAESSE;
        const auge = this._lodAuge(); // das EINE Auge der Stufen
        const stand = this._grundrissStand();
        const w = this._dachWahl;
        if (!auge || (w && w.stand === stand && Math.hypot(auge.x - w.x, auge.z - w.z) < N.dachSchrittM)) return;
        this._dachWahl = { stand, x: auge.x, z: auge.z };
        const decken = [];
        for (const e of st.architectures || []) {
            if (!(e._hausHuelle || e._dachKasten) || !e.position) continue;
            if (Math.hypot(e.position.x - auge.x, e.position.z - auge.z) > N.dachUmkreisM) continue;
            // je Platz eine eigene Zeile (der Rückstrahl schreibt ihr Licht, `_raumSonneTakt`), die Decke selbst aus `_deckenVon`
            for (const D of this._deckenVon(e)) decken.push({ ...D, d: Math.hypot(D.x - auge.x, D.z - auge.z) });
        }
        decken.sort((a, b) => a.d - b.d);
        const U = this._ensureAtmoUniforms();
        // DER DECKEL DES POOLS BEIM NAMEN (w28-innenlicht): eine Decke im Umkreis ohne Platz steht mit ihrem Raum im vollen
        // Himmel — die Wahl nennt sie (Leser: die Linse siedlung.K1 am Markt, `_dachWahl.raus`)
        this._dachWahl.im = decken.slice(0, U.dachLage.length).map((d) => d.name);
        this._dachWahl.platz = decken.slice(0, U.dachLage.length);
        this._dachWahl.raus = decken.slice(U.dachLage.length).map((d) => `${d.name} (${d.d.toFixed(1)} m)`);
        // … und steht das Auge unter einer Decke ohne Platz, ist ihr Raum still hell: der Bruch nennt sie (einmal je Decke)
        for (const d of decken.slice(U.dachLage.length)) {
            const [dx, dz] = [auge.x - d.x, auge.z - d.z];
            if (Math.abs(dx * d.co - dz * d.si) > d.ex || Math.abs(dx * d.si + dz * d.co) > d.ez) continue;
            this._raumOhnePlatz = this._raumOhnePlatz || new Set();
            if (this._raumOhnePlatz.has(d.name)) continue;
            this._raumOhnePlatz.add(d.name);
            this._bruchMelden(
                `RAUM-LICHT ohne Platz: ${d.name} steht über dem Auge, der Dach-Pool trägt nur ${U.dachLage.length}`
            );
        }
        // die Hülle des Pools: der achsparallele Kasten um alle gewählten Decken (je Decke ihr gedrehter Grundriss) und die höchste
        // Oberkante — leer (min > max) ohne Decke; `_naesseHimmel` prüft die Plätze nur darin
        const h = [Infinity, Infinity, -Infinity, -Infinity, -1e6];
        for (let i = 0; i < U.dachLage.length; i++) {
            const d = decken[i];
            U.dachLage[i].value.set(d ? d.x : 0, d ? d.z : 0, d ? d.co : 1, d ? d.si : 0);
            U.dachMass[i].value.set(d ? d.ex : 0, d ? d.ez : 0, d ? d.y : -1e6, d ? d.raum : 1);
            if (!d) continue;
            const hx = Math.abs(d.co) * d.ex + Math.abs(d.si) * d.ez;
            const hz = Math.abs(d.si) * d.ex + Math.abs(d.co) * d.ez;
            h[0] = Math.min(h[0], d.x - hx);
            h[1] = Math.min(h[1], d.z - hz);
            h[2] = Math.max(h[2], d.x + hx);
            h[3] = Math.max(h[3], d.z + hz);
            h[4] = Math.max(h[4], d.y);
        }
        if (h[0] > h[2]) h.splice(0, 4, 1, 1, -1, -1);
        U.dachHuelle.value.set(h[0], h[1], h[2], h[3]);
        U.dachOben.value = h[4];
    }

    // DIE DECKEN EINES BAUS (EINE Quelle, wind-boee-haus): je Decke der Hülle (fachwerk `deckenZeile` [x0, x1, z0, z1, y, raum,
    // …sonne], haus-lokal) oder sein Kasten (`_dachKasten`) als Welt-Zeile — Mitte, Gier, halbe Kanten, Oberkante, dazu `L`/`M`
    // für `_hausSchattenGesetz`. Leser: der Dach-Pool (`_dachTakt`, der Stoff am Auge) und der Schatten am Ort (`_hausSchatten`,
    // die Nässe am Ort für Station, Wagen und Verkehr). Gemerkt am Eintrag, bis Hülle, Kasten, Lage, Gier oder Skala wechseln.
    _deckenVon(e) {
        const hu = e._hausHuelle;
        const kasten = !hu && e._dachKasten;
        if (!(hu || kasten) || !e.position) return [];
        const k = hu ? (Number.isFinite(e._hausHuelleSkala) ? e._hausHuelleSkala : 1) : kasten.k;
        const ry = Number.isFinite(e.rotationY) ? e.rotationY : 0;
        const { x: px, y: py, z: pz } = e.position;
        const m = e._deckenMerk;
        if (
            m &&
            m.hu === hu &&
            m.kasten === kasten &&
            m.k === k &&
            m.ry === ry &&
            m.x === px &&
            m.y === py &&
            m.z === pz
        )
            return m.decken;
        const [co, si] = [Math.cos(ry), Math.sin(ry)];
        // je Decke [x0, x1, z0, z1, y] haus-lokal; der Kasten als dieselbe Zeile (seine Mitte, halbe Kanten, Oberkante)
        const zeilen = hu
            ? hu.decken || []
            : [
                  [
                      kasten.c[0] - kasten.h[0],
                      kasten.c[0] + kasten.h[0],
                      kasten.c[2] - kasten.h[2],
                      kasten.c[2] + kasten.h[2],
                      kasten.c[1] + kasten.h[1],
                  ],
              ];
        const fuss = py + (hu ? -0.5 : kasten.dy);
        const decken = [];
        for (const [j, [x0, x1, z0, z1, y, raum, ...sonne]] of zeilen.entries()) {
            // DAS RAUM-LICHT DER DECKE (w28-innenlicht): die sechste Zahl der Zeile des Gesetzbuchs (fachwerk `raumLicht`);
            // der Kasten ohne Haus-Hülle (Marktstand, Brunnen, Tor) ist eine offene Halle, kein Raum: 1. Eine Hülle ohne die
            // Zahl ist ein Bruch beim Namen — ihr Raum stünde still im vollen Himmel.
            if (hu && !Number.isFinite(raum) && !e._raumLichtBruch) {
                e._raumLichtBruch = true;
                this._bruchMelden(`RAUM-LICHT fehlt: ${e.type || e.kind || "bau"} Decke ${j} trägt keine sechste Zahl`);
            }
            const [cx, cz] = [(x0 + x1) / 2, (z0 + z1) / 2];
            const x = px + (cx * co + cz * si) * k;
            const z = pz + (cz * co - cx * si) * k;
            const [ex, ez, oben] = [((x1 - x0) / 2) * k, ((z1 - z0) / 2) * k, fuss + y * k];
            decken.push({
                x,
                z,
                co,
                si,
                ex,
                ez,
                y: oben,
                raum: Number.isFinite(raum) ? raum : 1,
                sonne: sonne.length >= 4 ? sonne : null,
                feld: Number.isFinite(sonne[4]) ? sonne[4] : 0,
                name: `${e.type || e.kind || "bau"}@${Math.round(px)},${Math.round(pz)}#${j}`,
                L: [x, z, co, si],
                M: [ex, ez, oben],
            });
        }
        e._deckenMerk = { hu, kasten, k, ry, x: px, y: py, z: pz, decken };
        return decken;
    }

    // DIE DECKE OHNE HAUS-HÜLLE (wetter.K2, beim Platz der Studio-Gestalt `_archInstanceAdd`): ein Bau der `NAESSE.dachArten`
    // (Marktstand · Brunnen · Tor) trägt keine Hülle mit Decke, seine Form schließt oben über ihrem Grundriss (die Plane, das
    // Schindeldach, das Gewölbe) — seine Decke ist der Kasten der gezeichneten Teile im Raum des Eintrags (`leaf.localMatrix` ×
    // Geometrie-Kasten, die Welt-Matrix `_archEntryWorldMatrix`: Skala und 0,5 m unter der Lage), einmal je Eintrag (null: ohne Dach).
    _dachKastenSetzen(entry, leaves) {
        const preset = this._foundryPresetForEntry(entry);
        const rec = preset && this._foundry && this._foundry.recipes ? this._foundry.recipes[preset] : null;
        const arten = AnazhRealm.NAESSE.dachArten;
        if (!rec) return; // das Buch ist kalt: der nächste Platz fragt wieder
        if (!(arten.includes(preset) || arten.includes(rec.kind))) {
            entry._dachKasten = null; // kein Dach: nie wieder gefragt
            return;
        }
        const b = new THREE.Box3();
        const t = new THREE.Box3();
        for (const lf of leaves || []) {
            const g = lf && lf.geom;
            if (!g || !g.attributes || !g.attributes.position) continue;
            if (!g.boundingBox) g.computeBoundingBox();
            t.copy(g.boundingBox);
            if (lf.localMatrix) t.applyMatrix4(lf.localMatrix);
            b.union(t);
        }
        if (b.isEmpty()) return;
        const k = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        const c = b.getCenter(new THREE.Vector3());
        const h = b.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        entry._dachKasten = { c: c.toArray(), h: h.toArray(), k, dy: -0.5 };
        this._dachWahl = null;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_stoff_dach]);

// ===== ATLAS · Stoff/dach — Außen-Konstanten =====
// DER RAUM IM LICHT (w28-innenlicht, `_raumHimmel`, `_raumAmAuge`, `_raumBlendeTakt`): `kanteM` hebt den Ort des Fragments längs
// seiner Normale (die Außenseite der Wand liegt bis zu ihrer Dicke im Grundriss der Decke); die Blende der Kamera folgt dem Raum
// am Auge mit τ = `blendeS` in Blenden-Stufen (das Auge braucht seine Zeit — die Belichtung springt an der Schwelle nicht), ein
// Sprung des Auges über `sprungM` in einem Takt (das Wort, die Sonde, die Ankunft) nimmt sie ohne Übergang.
AnazhRealm.RAUM = Object.freeze({ kanteM: 0.3, blendeS: 0.8, blendeHellS: 0.3, sprungM: 3 });
// DIE ZAHLEN-ALGEBRA DES SCHATTENS DER HÄUSER (`_hausSchattenGesetz` auf der CPU; der Stoff rechnet dieselbe Formel über TSL)
AnazhRealm.SCHATTEN_ZAHLEN = Object.freeze({
    k: (n) => n,
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    mul: (a, b) => a * b,
    div: (a, b) => a / b,
    min: Math.min,
    max: Math.max,
    sqrt: Math.sqrt,
    step: (a, b) => (b >= a ? 1 : 0),
});
