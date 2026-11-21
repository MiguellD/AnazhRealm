class AnazhRealm_feld_brand {
    // ===== ATLAS · Feld/brand — Brand: Bett · Front · Narbe und Asche · Flammen-Bild · Rauch-Fahne · das Gesetz BRAND =====
    // DIE ASCHE an (x, z) ∈ [0, 1] (stoffe.K2#2) — der Kanal G derselben Karte, bilinear aus denselben Bytes, die der Boden-Stoff
    // liest (`_wegeBodenFarbe`): 1 frisch verbrannt, 0 nachgegrünt. Die Nah-Wiese liest sie (auf der Asche steht kein Halm).
    _ascheAt(x, z) {
        return this._bodenDeckeAt(x, z, "asche");
    }

    // DIE NARBE DES BRANDS an (x, z) (stoffe.K2#2) → { m, asche, busch, wald } oder null (kein Brand um den Ort): die verbrannte
    // Fläche ist eine weiche Grenze AUS DEM FELD, nie das 16-m-Raster seiner Zellen. Der Anteil `o` der verbrannten Zellen um den
    // Ort (die vier Zell-Mitten um ihn, smoothstep-bilinear — eine Zerlegung der Eins: im Innern einer Brandfläche 1, auf der
    // Kante einer verbrannten und einer stehenden Zelle 0,5, eine Treppe von Zellen ein glatter Zug) ist der Abstand zum
    // Brand-Rand; das EINE Rauschen (gelaende-core `rauschRaum`, die Schicht aus der Saat der Welt) verschiebt ihn in den Oktaven
    // von `BRAND.narbe`, und die Grenze fällt über `band`: `m` ∈ [0, 1], wie sehr der Ort verbrannte. `asche`, `busch`, `wald`
    // sind die Sukzession der verbrannten Zellen um ihn (ihr gewichtetes Mittel, `_brandZelle`). `zelle(cx, cz)` → null oder die
    // Sukzession der Zelle — der Maler reicht seinen Speicher (`_brandZellen`). `_brandNarbeFn(zelle)` ist dieselbe Narbe als
    // reine Funktion (x, z) für EINEN Gang (der Maler je Texel: die Saat einmal, die Zellen aus dem Speicher — der Schritt des
    // Brands kostet seine Zellen, nie ihre Texel). Bis w3v-brand-bild malte jede Zelle ihr Quadrat: die Asche lag als Platte mit
    // geraden Kanten im 16-m-Raster, die Halme endeten an der Zellkante.
    _brandNarbe(x, z, zelle = this._brandZellen()) {
        return this._brandNarbeFn(zelle)(x, z);
    }
    _brandNarbeFn(zelle) {
        const [cs, N, R, L] = [
            AnazhRealm.LIFE_FIELD.cell,
            AnazhRealm.BRAND.narbe,
            globalThis.__gelaendeCore.rauschRaum,
            this._forestSeedInt() % 251,
        ];
        const S = (t) => t * t * (3 - 2 * t);
        const amp = N.amp.reduce((s, a) => s + a, 0);
        return (x, z) => {
            const u = x / cs - 0.5;
            const v = z / cs - 0.5;
            const i = Math.floor(u);
            const j = Math.floor(v);
            const a = S(u - i);
            const b = S(v - j);
            let [o, as, bu, wa] = [0, 0, 0, 0];
            for (let k = 0; k < 4; k++) {
                const w = (k & 1 ? a : 1 - a) * (k & 2 ? b : 1 - b);
                const c = w > 0 ? zelle(i + (k & 1), j + (k >> 1)) : null;
                const g = c ? (c.front ? w * c.front(x, z) : w) : 0; // die brennende Zelle: so weit ihre Front kam (`_brandFront`)
                if (g > 0) ((o += g), (as += g * c.asche), (bu += g * c.busch), (wa += g * c.wald));
            }
            if (!(o > 0)) return null;
            // das Rauschen wirkt am Rand (4·o·(1 − o)): im Innern einer Brandfläche bleibt sie ganz, fern von ihr ganz frei —
            // gerechnet nur, wo es die Grenze verschieben kann (|Rauschen| ≤ 1, gelaende-core `RAUSCH.skala`)
            const rand = 4 * o * (1 - o);
            let r = 0;
            if (Math.abs(o - 0.5) < N.band / 2 + amp * rand)
                for (let k = 0; k < N.lambda.length; k++)
                    r += N.amp[k] * R(x / N.lambda[k], z / N.lambda[k], L + 7 * k);
            return {
                m: Math.min(1, Math.max(0, (o - 0.5 + r * rand) / N.band + 0.5)),
                asche: as / o,
                busch: bu / o,
                wald: wa / o,
            };
        };
    }

    // Die Sukzession der verbrannten Zelle (cx, cz) → { asche, busch, wald } (die stärkste Asche, der jüngste Busch und Wald
    // ihrer Taten `brand`, `_sukzession`) oder null; `_brandZellen` ist ihr Speicher für EINEN Gang (der Maler, die Wiese).
    _brandZelle(cx, cz) {
        const I = this._tatIndex();
        let c = null;
        for (const a of I.brand.length ? I.je.get(cx + "," + cz) || [] : []) {
            if (a.tat !== "brand") continue;
            const s = this._sukzession(a);
            // die Asche liegt, wo das Bett lag (die Maske ihrer Tat, `_brandBettFn`; `_brandNarbeFn` liest `front`)
            const front = a.bett ? this._brandBettFn(a.bett, cx, cz) : undefined;
            c = c
                ? {
                      asche: Math.max(c.asche, s.asche),
                      busch: Math.min(c.busch, s.busch),
                      wald: Math.min(c.wald, s.wald),
                      front: c.front && front,
                  }
                : { asche: s.asche, busch: s.busch, wald: s.wald, front };
        }
        return c;
    }
    _brandZellen() {
        const [M, bf] = [new Map(), this.state.brandFeld];
        return (cx, cz) => {
            const k = (cx + 32768) * 65536 + cz + 32768;
            let c = M.get(k);
            if (c === undefined) {
                const b = bf && bf.size ? bf.get(cx + "," + cz) : null;
                c = this._brandZelle(cx, cz) || (b && b.t0 !== null ? this._brandFront(b) : null);
                M.set(k, c);
            }
            return c;
        };
    }

    // DIE FRONT EINER BRENNENDEN ZELLE ALS NARBE (w28-brand-bild): wie weit die Ellipse ihres Eintritts (`_brandZuenden`) den Ort zur
    // Uhr des Brands verzehrte — 0 vor der Flamme, über ihre Verweilzeit `tr` auf 1 (der versengte Saum). Bis hier trug nur die
    // ausgebrannte Zelle Asche: die Halme standen grün vor den Flammen, bis das Quadrat auf einmal grau fiel.
    // Der Weg der Front von ihrem Eintritt im Maß ihrer Ellipse → die Funktion (x, z) in m: |v| − ecc·v·ψ, das Minimum über ihre
    // Eintritte (`ein` [x, z, …]: der Rand der Lava zündet auf seiner Länge, `_lavaZuendet`; sonst der EINE Punkt). EIN Ruf je Leser.
    _brandWeg(b, ecc, px, pz) {
        const E = b.ein || [b.ex, b.ez];
        return (x, z) => {
            let m = Infinity;
            for (let i = 0; i < E.length; i += 2)
                m = Math.min(m, Math.hypot(x - E[i], z - E[i + 1]) - ecc * ((x - E[i]) * px + (z - E[i + 1]) * pz));
            return m;
        };
    }
    _brandFront(b) {
        const [k, s, t, px, pz] = [1 / (b.R * (1 - b.ecc)), Math.max(b.tr, 1), this._brandUhr, b.kopf[0], b.kopf[1]];
        const [weg, bett] = [this._brandWeg(b, b.ecc, px, pz), this._brandBettFn(b.bett, b.cx, b.cz)];
        const front = (x, z) => {
            const q = (t - b.t0 - weg(x, z) * k) / s;
            return q <= 0 ? 0 : (q >= 1 ? 1 : q) * (bett ? bett(x, z) : 1);
        };
        return { asche: 1, busch: 0, wald: 0, front };
    }

    // DAS BETT EINER ZELLE ALS FLÄCHE (w28-lava-nachlauf) → null (die ganze Zelle trägt Bett) oder die Funktion (x, z) ∈ [0, 1]:
    // ihre Maske (`_brandStoff` `bett`, in der Tat als Hex-Wort) bilinear zwischen den Punkten ihres Gitters, über die weiche
    // Kante `BRAND.bettKante` — 1 auf dem Brennstoff, 0 auf dem Kies; außerhalb der Zelle gilt ihr Rand. Die EINE Lese-Stelle
    // für Flammen (`_brandBild`), Front (`_brandFront`) und Asche (`_brandZelle`).
    _brandBettFn(bett, cx, cz) {
        if (!bett) return null;
        const [G, cs, K] = [AnazhRealm.BRAND.bettGitter, AnazhRealm.LIFE_FIELD.cell, AnazhRealm.BRAND.bettKante];
        const m =
            typeof bett === "string"
                ? Array.from({ length: G * G }, (_, k) => (parseInt(bett[k >> 2], 16) >> (k & 3)) & 1)
                : bett;
        const an = (i, j) => m[Math.min(G - 1, Math.max(0, j)) * G + Math.min(G - 1, Math.max(0, i))];
        return (x, z) => {
            const [u, v] = [(x / cs - cx) * G - 0.5, (z / cs - cz) * G - 0.5];
            const [i, j] = [Math.floor(u), Math.floor(v)];
            const [a, c] = [u - i, v - j];
            const w =
                (an(i, j) * (1 - a) + an(i + 1, j) * a) * (1 - c) + (an(i, j + 1) * (1 - a) + an(i + 1, j + 1) * a) * c;
            return w <= K[0] ? 0 : w >= K[1] ? 1 : ((q) => q * q * (3 - 2 * q))((w - K[0]) / (K[1] - K[0]));
        };
    }

    // DIE ASCHE FOLGT DER FRONT (w28-brand-bild): je Bild malt der Takt EIN Viertel der Fläche EINER glühenden Zelle (±½ Zelle,
    // reihum) in die Boden-Decke — es kostet, was brennt; die Nah-Wiese darüber baut neu, je Zelle höchstens alle `BRAND.wieseS` s.
    _brandMalen() {
        const [bf, wk] = [this.state.brandFeld, this.state.wegeKarte];
        const G = bf && bf.glueht;
        if (!G || !G.length || !wk) return;
        const n = (bf.malN = ((bf.malN || 0) + 1) % (4 * G.length));
        const [b, v, cs] = [G[n >> 2], n & 3, AnazhRealm.LIFE_FIELD.cell];
        const [x0, z0] = [(b.cx - 0.5 + (v & 1)) * cs, (b.cz - 0.5 + (v >> 1)) * cs];
        const zelle = this._brandZellen();
        for (const stufe of wk.stufen)
            if (stufe.zentriert && this._ascheFlaeche(stufe, x0, z0, x0 + cs, z0 + cs, zelle)) b.wieseNeu = true;
        if (b.wieseNeu && !(this._brandUhr - b.wieseT < AnazhRealm.BRAND.wieseS)) {
            [b.wieseNeu, b.wieseT] = [false, this._brandUhr];
            this._nahRingNeuIn((b.cx - 0.5) * cs, (b.cz - 0.5) * cs, (b.cx + 1.5) * cs, (b.cz + 1.5) * cs);
        }
    }

    // DIE ASCHE MALEN (stoffe.K2#2): die Asche der Zelle (cx, cz) und ihrer Ränder in jeder zentrierten Stufe — der Kanal G
    // jedes Texels ist die Narbe an seiner Mitte mal ihre Asche (`_brandNarbe`); die Narbe einer Zelle reicht bis an die Mitten
    // ihrer Nachbarinnen, gemalt wird die Fläche ±½ Zelle um sie. Wo sich ein Texel ändert, baut die Nah-Wiese darüber neu (auf
    // der Asche steht kein Halm, über die Grenze dünnen sie aus). Rückgabe: ob sich ein Texel änderte.
    _ascheMalen(cx, cz) {
        const zelle = this._brandZellen();
        return this._deckeMalen(cx, cz, (s, x0, z0, x1, z1) => this._ascheFlaeche(s, x0, z0, x1, z1, zelle));
    }

    // Die Fläche [x0, x1) × [z0, z1) in EINE Stufe malen: jedes Texel, dessen Mitte in ihr liegt, trägt die Asche der Narbe an
    // seiner Mitte. Rückgabe: 2, wenn sich ein Texel änderte, sonst 0.
    _ascheFlaeche(stufe, x0, z0, x1, z1, zelle) {
        const [A, narbe] = [stufe.kronen.asche, this._brandNarbeFn(zelle)];
        return this._deckeTexel(stufe, x0, z0, x1, z1, (k, x, z) => {
            const n = narbe(x, z);
            const v = n ? Math.round(n.m * n.asche * 255) : 0;
            if (v === A[k]) return 0;
            A[k] = v;
            return 2;
        });
    }

    // Die Asche EINER zentrierten Stufe ganz neu (nach ihrem Umzug, einer geladenen Welt): leeren, jede Tat `brand` im Fenster
    // malt die vier Flächen zwischen den Zell-Mitten um ihre Zelle, jede Fläche einmal — die Kosten tragen die Aschen, nie die Welt.
    _ascheStufeMalen(stufe) {
        stufe.kronen.asche.fill(0);
        const zelle = this._brandZellen();
        this._deckeStufeMalen(stufe, this._tatIndex().brand, (s, x0, z0, x1, z1) =>
            this._ascheFlaeche(s, x0, z0, x1, z1, zelle)
        );
    }

    // === DER BRAND (stoffe.K2 · feld.K3#2): das Feuer auf dem Feld — die Front läuft nach Rothermel, gerechnet, wo es brennt ===
    // `state.brandFeld`: "cx,cz" (die 16-m-Zelle des Lebens) → die Zellen des Feuers: die brennenden (`t0` die Ankunft der Front,
    // `ende` die Zeit, zu der sie ausgebrannt ist, `glut`, ihr Bett `stoff`, ihr Tempo `R` längs `kopf`) und die, die die Front
    // erreichen wird (`t0` null, `an` ihre Ankunft); jede trägt den Punkt, an dem die Front sie erreicht (`ex`, `ez`), und die
    // Zelle, von der sie kam (`von`).
    // Die Front ist die KÜRZESTE LAUF-ZEIT über die acht Nachbarn (Finney 2002, FARSITE): fängt eine Zelle, trägt sie ihr Tempo
    // je Richtung (`_brandTempo`, die EINE Funktion von Bett, Wind und Hang) als Ankunft in jede Nachbarin (`_brandZuenden`), die
    // früheste gilt — eine Funktion der Spielzeit, gleich für jede Bildrate. Sie fängt, wo die Welt Feuer fängt (das Brennglas,
    // `_tickFocusingAffordances`), hält, wo kein Bett brennt (Fels, Wasser, Asche) und wo die Nässe das Bett erstickt, und
    // hinterlässt die Tat `brand` (die Asche: ihre Narbe senkt lebendig, auf ihr brennt nichts, bis sie heilt). Nicht
    // persistiert (reaktiv wie das Leben-Overlay), die Asche reist als Tat. Leser: `auraAt` (glut) und die Leuchtquellen.

    // Das Bett einer Zelle → { zeile, leb, x, z, y, boden } oder null: die Zeile der Stoff-Tafel unter ihrer Mitte
    // (`_kontaktStoffAt`), wenn sie ein Brennstoff-Bett trägt (ihre Spalte `brenn`), ihr lebendig (die Vegetation samt Narbe,
    // `auraAt`) als Anteil ihrer Last und die Feuchte ihres Bodens (`_feuchteAt`, die Hydrosphäre: am Ufer und in der Niederung,
    // über dem Spiegel, den der Pegel des Regens hebt) — kein Bett auf Asche, über Wasser (das EINE Urteil `_nassAt`) und unter
    // `minStoff`.
    // DAS BETT, WIE DIE FRONT ES ANTRIFFT (stoffe.K2#2): je Brand misst die Welt jede Zelle EINMAL — Stoff, Last, Boden, Höhe und
    // das Gefälle über die Zelle (`gx`, `gz`, das `_brandTempo` liest) —, erreicht sie die Front wieder (eine zweite Nachbarin
    // brennt), liest sie das Gemessene (`_brandBett`, geleert, wenn ein neuer Brand fängt). Die Asche fragt der Index jedes Mal.
    _brandStoff(cx, cz, uhr) {
        const key = cx + "," + cz;
        const je = this._tatIndex().je.get(key);
        if (je && je.some((a) => a.tat === "brand")) return null;
        const M = this._brandBett || (this._brandBett = new Map());
        if (M.has(key)) return M.get(key);
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [x, z] = [(cx + 0.5) * cs, (cz + 0.5) * cs];
        const leb = this.auraAt(x, z, 0, uhr).lebendig;
        let f = null;
        if (leb >= AnazhRealm.BRAND.minStoff && !this._nassAt(x, z)) {
            const [y, h] = [this._voxelSurfaceY(x, z), cs / 2];
            const [gx, gz] = [(this._voxelSurfaceY(x + h, z) - y) / h, (this._voxelSurfaceY(x, z + h) - y) / h];
            // DAS BETT LIEGT, WO DIE ZELLE BRENNSTOFF TRÄGT (w28-lava-nachlauf): die Zelle misst ihr Bett auf einem Gitter von
            // `bettGitter`² Punkten (der Stoff je Punkt auf der Ebene des Gefälles) — `bett` ist seine Maske (null: die ganze
            // Zelle), `anteil` seine Fläche, die Zeile die des häufigsten Brennstoffs. DIE LAST BLEIBT GANZ (`leb`): wo Bett liegt,
            // brennt es mit seiner vollen Last; der Anteil trägt nur FLÄCHE — Flammen und Narbe stehen auf dem Bett
            // (`_brandBettFn`), nie auf dem Kies daneben. Bis w28-lava-zuendet las die Zelle nur ihre Mitte (ein Stein dort nahm
            // einer Wiese von 16 m ihr Bett); w28-lava-zuendet las fünf Punkte und gab den Anteil als LAST ins Gesetz: eine
            // Zelle mit einem Fünftel Gras brannte mit einem Fünftel der Flamme und legte die Asche über ihre ganze Fläche
            // (Mess-Wiese −248/−1080: 25 Flammen, +0 Flammen-Pixel, 94,6 % des Ausschnitts Asche, auch der kahle Kies)
            // DAS FEINE GITTER NUR, WO DAS BETT EINE KANTE HAT: zuerst die fünf Punkte `bettGrob` (Mitte und Viertel, wie
            // w28-lava-zuendet) — tragen alle Brennstoff, liegt das Bett auf der ganzen Zelle, trägt keiner, liegt keins; nur
            // gemischt misst die Zelle ihre Maske. Die Stand-Linse BRAND-ZELLEN (Soll ≤ 64 Einheiten je Zelle und Schritt) nannte
            // 64 Punkte je Zündung mit 4 945 Einheiten bei 16 brennenden Zellen, 16 Punkte mit 2 609.
            const B = AnazhRealm.BRAND;
            const messen = (P) => {
                const [bett, je] = [new Uint8Array(P.length), new Map()];
                P.forEach(([px, pz], k) => {
                    const [dx, dz] = [px * cs, pz * cs];
                    const s = this._stoff(this._kontaktStoffAt(x + dx, z + dz, y + gx * dx + gz * dz));
                    if (s && s.brenn) ((bett[k] = 1), je.set(s, (je.get(s) || 0) + 1));
                });
                return { N: P.length, bett, je, n: bett.reduce((a, b) => a + b, 0) };
            };
            const fein = () =>
                Array.from({ length: B.bettGitter ** 2 }, (_, k) => [
                    ((k % B.bettGitter) + 0.5) / B.bettGitter - 0.5,
                    (Math.floor(k / B.bettGitter) + 0.5) / B.bettGitter - 0.5,
                ]);
            const grob = messen(B.bettGrob);
            const { N, bett, je, n } = grob.n > 0 && grob.n < grob.N ? messen(fein()) : grob;
            const zeile = [...je].sort((a, b) => b[1] - a[1]).map((e) => e[0])[0];
            if (zeile)
                f = {
                    zeile,
                    leb,
                    anteil: n / N,
                    bett: n < N ? bett : null,
                    x,
                    z,
                    y,
                    gx,
                    gz,
                    boden: this._feuchteAt(x, z, y),
                };
        }
        M.set(key, f);
        return f;
    }

    // DIE FEUCHTE DES BETTS AM ORT (stoffe.K2#2) — Wasser je Trocken-Masse des toten Fein-Brennstoffs, EINE Funktion des Bodens
    // (`boden`, die Feuchte der Zelle aus `_brandStoff`) und der EINEN Nässe der Welt (`state.naesse`, wetter.K2): die
    // Luft-Trockene `trocken`; über nassem Boden steht das Bett in gesättigter Luft und nimmt Wasser bis zur Faser-Sättigung
    // `faser` (das Gras am Ufer hält die Front); der Regen legt freies Wasser auf die Faser, bis zu dem, was durchnässte Streu
    // hält (`nass`) — er löscht, wo sie die Erlöschungs-Feuchte des Betts erreicht. Bis stoffe.K2#2 trug die Nässe nur bis zur
    // Faser-Sättigung (0,35) und kein Ort sein eigenes Bett: das Laub fiel im Landregen erst nach 196 s, das Gras am Ufer
    // brannte wie das auf der Kuppe.
    _brandFeuchte(boden) {
        const F = AnazhRealm.BRAND.feuchte;
        return F.trocken + (F.faser - F.trocken) * (boden || 0) + F.nass * (this.state.naesse || 0);
    }

    // DAS TEMPO DER FRONT (stoffe.K2) → { R, ecc, px, pz, tr } oder null (das Bett erstickt): Rothermel 1972 (USDA INT-115) mit
    // Albini 1976 — das Bett aus der Zeile seines Stoffs (σ, Last × lebendig, Tiefe, Heizwert, Erlöschungs-Feuchte `mx`, ρ der
    // Partikel), die Zünd-Wärme Q_ig = c·(T_zünd − T_Luft) + M·(c_w·(100 °C − T_Luft) + L_v) aus derselben Zeile, der des Wassers
    // und der Luft des Temperatur-Felds (`_temperaturAt`); der Wind des EINEN Felds (`_windAt` am Ort zur Uhr des Brands) in der
    // Stärke, die das Gesetz ihm gibt — `sturmMS` bei Böe 1 ist Beaufort (WIND_FELD), also ohne die wandernde Böe und ihre Drift
    // (`_windWob`), die die Front über die Querung einer Zelle (zwei Böen-Perioden) mittelt; die Böe des Zünd-Augenblicks gehalten
    // streute die Köpfe an EINER Pose 0,10–1,14 m/s, ihr Mittel 0,7 statt der Beaufort-Stärke hielt sie bei 0,51 —, in 10 m Höhe
    // (÷ 1,15 auf 20 ft) auf Flammenhöhe (Albini–Baughman 1979 aus der Tiefe des Betts, gedeckelt bei 0,9·I_R), und der Hang (das
    // Gefälle der Oberfläche über die Zelle) addieren als Vektoren zum effektiven φ (BehavePlus). R ist das Tempo der Spitze in
    // m/s längs (px, pz); die Ellipse (Anderson 1983, L/B aus dem effektiven Wind) gibt R(θ) = R·(1 − ecc)/(1 − ecc·cos θ), gegen
    // den Wind das Rückfeuer R·(1 − ecc)/(1 + ecc). tr: die Verweilzeit der Flamme (384/σ min). Die Gleichungen in ihren
    // Einheiten (ft, lb, Btu, min).
    _brandTempo(f, t) {
        const B = AnazhRealm.BRAND;
        const [Z, b] = [f.zeile, f.zeile.brenn];
        const [sig, tiefe, w0] = [b.sigma * 0.3048, b.tiefe / 0.3048, b.last * Math.min(1, f.leb) * 0.204816];
        const beta = w0 / tiefe / (Z.rho * 0.062428);
        const q = beta / (3.348 * sig ** -0.8189);
        const A = 133 * sig ** -0.7913;
        const gam = (sig ** 1.5 / (495 + 0.0594 * sig ** 1.5)) * q ** A * Math.exp(A * (1 - q));
        const M = this._brandFeuchte(f.boden);
        // an der Erlöschungs-Feuchte ist η_M null (Rothermel 1972) — im Gleitkomma blieb das Polynom bei 4·10⁻¹⁶, und das nasse Bett
        // fing mit einem Tempo, das nie ausbrannte (stoffe.K2#2: 3 nasse Zellen am Ufer brannten)
        if (!(M < b.mx)) return null;
        const r = M / b.mx;
        const etaM = 1 - 2.59 * r + 5.11 * r * r - 3.52 * r * r * r;
        const IR = gam * w0 * (1 - B.mineral.gesamt) * b.heiz * 4.2992e-4 * etaM * 0.174 * B.mineral.frei ** -0.19;
        if (!(IR > 0)) return null;
        const [W, luft] = [this._stoff("wasser"), this._temperaturAt(f.y)];
        const Qig = ((Z.tZuend - 273.15 - luft) * Z.c + M * (W.c * (100 - luft) + W.Lv)) * 4.2992e-4;
        const R0 =
            (IR * Math.exp((0.792 + 0.681 * sig ** 0.5) * (beta + 0.1))) /
            (192 + 0.2595 * sig) /
            ((w0 / tiefe) * Math.exp(-138 / sig) * Qig);
        const w = this._windAt(f.x, f.z, t);
        const [C, Bw, E] = [
            7.47 * Math.exp(-0.133 * sig ** 0.55),
            0.02526 * sig ** 0.54,
            0.715 * Math.exp(-3.59e-4 * sig),
        ];
        const u =
            ((w.ms / 1.15 / (w.boe * this._windWob(t))) * 196.85 * 1.83) /
            Math.log((20 + 0.36 * tiefe) / (0.13 * tiefe));
        const phiW = C * Math.min(0.9 * IR, u) ** Bw * q ** -E;
        const [gx, gz] = [f.gx, f.gz];
        const phiS = (5.275 * beta ** -0.3 * (gx * gx + gz * gz)) / (Math.hypot(gx, gz) || 1);
        const [vx, vz] = [phiW * w.x + phiS * gx, phiW * w.z + phiS * gz];
        const phi = Math.hypot(vx, vz);
        const mph = ((phi * q ** E) / C) ** (1 / Bw) / 88;
        const lb = Math.min(B.lbMax, 0.936 * Math.exp(0.2566 * mph) + 0.461 * Math.exp(-0.1548 * mph) - 0.397);
        const ecc = Math.sqrt(Math.max(0, lb * lb - 1)) / lb;
        return { R: R0 * (1 + phi) * 0.00508, ecc, px: phi ? vx / phi : 1, pz: phi ? vz / phi : 0, tr: 23040 / sig };
    }

    // DAS ENTFACHEN IST EIN AKT DER SEITE (feld.K2#2, `_feldAkt`): was eine Seite entzündet (das Brennglas, die Probe), fängt auf jeder
    // Seite zur selben Welt-Zeit — allein sofort (→ die Zelle oder null), mit Mitspielern im Vorlauf (→ true). Bis feld.K2#2 brannte
    // es nur auf der Seite, deren Brennglas zündete.
    _brandEntfachen(x, z) {
        return this._feldAkt({ art: "brand", w: this.state.spielZeit, x, z }, true);
    }

    // Die Zelle unter (x, z) fängt Feuer → die Zelle oder null (sie brennt schon, trägt kein Bett, die Welt ist zu nass). `uhr`
    // (s der Welt-Uhr): der Augenblick des Funkens (ein Feld-Akt zu seinem Stempel, `_feldAktWirkt`) — ohne ihn jetzt.
    _brandFangen(x, z, ein, uhr = this.state.spielZeit) {
        const st = this.state;
        const bf = st.brandFeld || (st.brandFeld = new Map());
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [cx, cz] = [Math.floor(x / cs), Math.floor(z / cs)];
        const n = bf.get(cx + "," + cz);
        if (n && n.t0 !== null) return null;
        // ein neuer Brand misst sein Bett neu, und nichts eines alten wartet: die Aschen, die der erloschene noch trug, liegen
        // zuerst (ohne Feld zündet der Rest nichts mehr) — bis w13-brand-takt fielen sie hier weg
        if (!bf.size) {
            if (this._brandRest) this._brandArbeit(Infinity);
            [this._brandUhr, this._brandBett, this._brandRest, bf.glutBlock] = [uhr, null, null, null];
        }
        return this._brandZuenden(cx, cz, uhr, x, z, ein, uhr);
    }

    // Die Front erreicht die Zelle zur Zeit t am Punkt (ex, ez) ihres Rands (der Herd: am Ort der Tat). Ihr Bett und ihr Tempo
    // tragen die Front weiter, als Welle vom Eintrittspunkt (Huygens): die Zeit bis zu einem Punkt v ist
    // (|v| − ecc·v·ψ) / (R·(1 − ecc)) — die Ellipse mit dem Herd im Brennpunkt —, und jede Nachbarin, die noch nicht brennt,
    // erhält die Ankunft am ersten Punkt ihrer Fläche, den die Welle berührt (das Minimum über Ecken, Kanten-Mitten, den nächsten
    // Punkt und den Eintritt der Achse) — die frühere gewinnt. So läuft die Spitze längs ihrer Achse durch die Zellen, die sie
    // kreuzt, in ihrem Tempo, wie schmal die Ellipse auch ist (an den Mitten gemessen verlor das Gitter der acht Nachbarn 75 %
    // der Spitze). Die Zelle brennt, bis die Spitze sie längs ihres Kopfs durchquert hat (bis an ihre fernste Ecke), und die
    // Flamme ihre Verweilzeit; was langsamer in sie zurückläuft (Flanke, Rückfeuer), trägt die Ankunft ihrer Nachbarinnen, nicht
    // ihr Brennen. Ohne Bett oder Tempo fällt sie aus dem Feld (null).
    _brandZuenden(cx, cz, t, ex, ez, ein = null, uhr = this.state.spielZeit) {
        const bf = this.state.brandFeld;
        const key = cx + "," + cz;
        const f = this._brandStoff(cx, cz, uhr);
        const T = f && this._brandTempo(f, t);
        if (!T || !(T.R > 0)) {
            bf.delete(key);
            return null;
        }
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const k = 1 / (T.R * (1 - T.ecc));
        const weg = this._brandWeg({ ex, ez, ein }, T.ecc, T.px, T.pz);
        const zeit = (x, z) => weg(x, z) * k;
        // die erste Berührung der Fläche [x0, x0 + cs] × [z0, z0 + cs] → [Zeit, x, z]
        const ankunft = (x0, z0) => {
            const [x1, z1] = [x0 + cs, z0 + cs];
            const P = [
                [x0, z0],
                [x1, z0],
                [x0, z1],
                [x1, z1],
                [x0 + cs / 2, z0],
                [x0 + cs / 2, z1],
                [x0, z0 + cs / 2],
                [x1, z0 + cs / 2],
            ];
            P.push([Math.min(x1, Math.max(x0, ex)), Math.min(z1, Math.max(z0, ez))]);
            const sx = T.px ? [(x0 - ex) / T.px, (x1 - ex) / T.px] : [0, 0];
            const sz = T.pz ? [(z0 - ez) / T.pz, (z1 - ez) / T.pz] : [0, 0];
            const s = Math.max(0, Math.min(...sx), Math.min(...sz));
            const [ax, az] = [ex + s * T.px, ez + s * T.pz];
            if (ax >= x0 - 1e-6 && ax <= x1 + 1e-6 && az >= z0 - 1e-6 && az <= z1 + 1e-6) P.push([ax, az]);
            let best = null;
            for (const [x, z] of P) {
                const z0t = zeit(x, z);
                if (!best || z0t < best[0]) best = [z0t, x, z];
            }
            return best;
        };
        const [x0, z0] = [cx * cs, cz * cs];
        // DIE ZELLE BRENNT, BIS IHRE FRONT SIE GANZ VERZEHRTE (w28-brand-bild: die späteste Ankunft der Ellipse an ihren Ecken) — bis
        // hier fiel sie mit dem KOPF, die Flanken hatten erst einen Keil gebrannt (Dorf-Wiese 300 s: 1 Zelle, 7 Flammen → 9, 106)
        const ecken = [x0, x0 + cs].flatMap((x) => [z0, z0 + cs].map((z) => [x, z]));
        const quer = Math.max(...ecken.map(([x, z]) => (x - ex) * T.px + (z - ez) * T.pz));
        const zelle = Object.assign(bf.get(key) || { cx, cz, y: null }, {
            t0: t,
            an: t,
            ende: t + Math.max(quer / T.R, ...ecken.map(([x, z]) => zeit(x, z))) + T.tr,
            glut: 0,
            mx: f.zeile.brenn.mx,
            boden: f.boden,
            y: f.y,
            stoff: f.zeile.name,
            ex,
            ez,
            ein,
            R: T.R,
            kopf: [T.px, T.pz],
            ecc: T.ecc,
            tr: T.tr,
            gx: f.gx,
            gz: f.gz,
            // H·w (kJ/m²): die Wärme des Betts je Fläche — mal dem Tempo die Intensität der Front (Byram), die das Bild liest
            iw: (f.zeile.brenn.heiz / 1000) * f.zeile.brenn.last * Math.min(1, f.leb),
            bett: f.bett, // die Maske ihres Betts (`_brandStoff`): Flammen, Front und Asche stehen auf ihr (`_brandBettFn`)
        });
        bf.set(key, zelle);
        for (const [dx, dz] of AnazhRealm.BRAND.nachbarn) {
            const nk = cx + dx + "," + (cz + dz);
            const n = bf.get(nk);
            if (n && n.t0 !== null) continue;
            const [dt, ax, az] = ankunft(x0 + dx * cs, z0 + dz * cs);
            if (n && n.an <= t + dt) continue;
            const neu = n || { cx: cx + dx, cz: cz + dz, y: null, glut: 0, t0: null };
            bf.set(nk, Object.assign(neu, { an: t + dt, ex: ax, ez: az, mx: zelle.mx, boden: zelle.boden, von: key }));
        }
        return zelle;
    }

    // DER TAKT DES BRANDS: ohne Feuer kein Schritt und keine Arbeit (Ruhe ist Null); sonst je `schrittS` Spielzeit EIN Schritt
    // über die Zellen des Feuers — es kostet, was brennt (Lehre 25), die Welt drumherum nie. DIE ARBEIT EINES SCHRITTS IST GETEILT
    // (stoffe.K2#2): die Aschen und die Zündungen, die er findet (`_brandSchritt`), geht der Takt in seinem Budget je Bild
    // (`BRAND.budgetMs`, mindestens `BRAND.mindestJeBild` Stück), den Rest im nächsten (`_brandArbeit`); der nächste Schritt beginnt
    // erst, wenn der vorige ganz ist, und jede Zelle fängt zur Zeit ihrer Ankunft, nie zur Zeit des Bilds. Bis stoffe.K2#2 ging ein
    // Schritt in einem Bild: 2 000 brennende Zellen kosteten 7,4 ms (headless, Radeon-Laptop), die Aschen eines Schritts zusammen.
    // DER BRAND LEBT, solange sein Feld brennt oder sein Rest Arbeit trägt — die EINE Frage, ob er noch etwas tut (der Takt, die
    // Linsen, die ihn bis zum Ende fahren)
    _brandLebt() {
        const bf = this.state.brandFeld;
        return !!(bf && bf.size) || !!this._brandRest;
    }

    // DER REST NACH DEM ERLÖSCHEN: leert ein Schritt das Feld (der Regen löscht jede Zelle zugleich), trägt sein Rest die Aschen
    // aller gelöschten Zellen — der Takt geht ihn weiter in seinem Budget, bis er ganz ist. Bis w13-brand-takt kehrte er am
    // leeren Feld um: was die Frist des Bilds nicht schrieb, fiel (Mess-Wiese, Regen, CPU zweifach gedrosselt 1 von 9 Aschen,
    // vierfach 2 von 10) — die Asche hing an der Wanduhr.
    _tickBrand() {
        const bf = this.state.brandFeld;
        // die Frage `_brandLebt` ohne ihren Ruf: in Ruhe kostet der Takt nichts (die Stand-Linse zählt jeden Ruf im Takt)
        if (!bf || (!bf.size && !this._brandRest)) return;
        const B = AnazhRealm.BRAND;
        const frist = performance.now() + B.budgetMs;
        // der Schritt fällt, sobald die Uhr ihn erreicht — im Gleitkomma mit einem Hauch (`(a + 1) − a` ist für ~0,1 % der Uhren
        // 0,99999…: bis w3v-brand-bild hing jeder, der die Uhr auf `_brandUhr + schrittS` stellte, an dieser Uhr, und derselbe
        // Herd trug 0 bis 95 Aschen)
        // DER SPRUNG IST GESCHLOSSEN (w28-lava-nachlauf): liegt die Welt-Uhr mehr als `sprungS` vor (ein geladener Stand, der
        // Mitspieler mit späterer Uhr: `_weltUhrNimm`), geht die Uhr des Brands von EREIGNIS zu Ereignis — zum nächsten Schritt,
        // an dem eine wartende Zelle fängt (ihre Ankunft `an`, auf das Raster der Schritte gehoben), und ohne wartende Zelle in
        // EINEM Schritt ans Ziel. Jede Zelle trägt Ankunft und Ende als Zeiten (`_brandZuenden`): dieselben Zellen fangen zur
        // selben Zeit wie Schritt um Schritt, die leeren Schritte dazwischen fallen. Die Kosten tragen die Zellen, die fangen,
        // im Budget je Bild — bis hier ging er `schrittS` um `schrittS` (ein Tag: 3 600 Schritte über alle Zellen des Felds).
        while (this._brandArbeit(frist) && bf.size) {
            const rueck = this.state.spielZeit - this._brandUhr;
            if (rueck < B.schrittS - 1e-9) break;
            let dt = B.schrittS;
            if (rueck > B.sprungS) {
                let an = Infinity;
                for (const z of bf.values()) if (z.t0 === null && z.an < an) an = z.an;
                const naechst = Math.ceil((an - this._brandUhr) / B.schrittS - 1e-9) * B.schrittS;
                dt = Math.min(Math.floor(rueck / B.schrittS + 1e-9) * B.schrittS, Math.max(B.schrittS, naechst));
            }
            this._brandSchritt((this._brandUhr += dt));
        }
        this._brandMalen();
        if (!bf.size && !this._brandRest) this._brandBett = null; // erloschen: das Gemessene fällt
    }

    // Ein Schritt zur Spielzeit t: wo die Feuchte das Bett erstickt (die Feuchte am Ort der Zelle über ihrem `mx`, der Front die
    // ihrer Quelle), erlischt das Feuer; jede brennende Zelle glüht auf (die glühenden lesen Licht, Rauch und Ohr: `glutBlock`) und
    // fällt ausgebrannt als Asche; die Front erreicht die fälligen Zellen in der Folge ihrer Ankunft — die Arbeit (Aschen, Zündungen)
    // liegt danach in `_brandRest`.
    _brandSchritt(t) {
        const bf = this.state.brandFeld;
        const [aschen, faellig, glueht] = [[], [], []];
        for (const [key, z] of bf) {
            const M = this._brandFeuchte(z.boden);
            if (M < z.mx && z.t0 === null) {
                if (z.an <= t) faellig.push(z);
                continue;
            }
            if (M < z.mx && t < z.ende) {
                z.glut = Math.min(1, (t - z.t0) / AnazhRealm.BRAND.aufS);
                if (z.glut > 0) glueht.push(z);
                continue;
            }
            bf.delete(key);
            if (z.t0 !== null) aschen.push(z);
        }
        faellig.sort((a, b) => a.an - b.an);
        // die glühenden je Block von `blockZellen`² Zellen: die Leser fragen nur die Blöcke um ihren Ort (`_brandGlutUm`)
        const G = new Map();
        const K = AnazhRealm.BRAND.blockZellen;
        for (const z of glueht) {
            const k = Math.floor(z.cx / K) + "," + Math.floor(z.cz / K);
            const L = G.get(k);
            if (L) L.push(z);
            else G.set(k, [z]);
        }
        [bf.glutBlock, bf.glueht] = [G, glueht];
        this._brandRest = { t, aschen, faellig, i: 0 };
    }

    // Die glühenden Zellen des letzten Schritts in den Blöcken um (x, z) bis R — `fn(zelle)` je Zelle, die feine Prüfung trägt der
    // Leser (das Licht, der Rauch, das Ohr). Die Kosten tragen die Blöcke um den Ort, nie der ganze Brand (Gebot 7).
    _brandGlutUm(x, z, R, fn) {
        const bf = this.state.brandFeld;
        const G = bf && bf.size ? bf.glutBlock : null;
        if (!G || !G.size) return;
        const K = AnazhRealm.LIFE_FIELD.cell * AnazhRealm.BRAND.blockZellen;
        for (let bz = Math.floor((z - R) / K), z1 = Math.floor((z + R) / K); bz <= z1; bz++)
            for (let bx = Math.floor((x - R) / K), x1 = Math.floor((x + R) / K); bx <= x1; bx++) {
                const L = G.get(bx + "," + bz);
                if (L) for (const b of L) fn(b);
            }
    }

    // Die Arbeit des angefangenen Schritts bis zur Frist (`performance.now`; mindestens `mindestJeBild` Stück): zuerst die Aschen
    // (jede misst den Wuchs ihres Orts mit der Feuchte, die ihr Bett schon trägt — `_tatDauer` liest `w`), dann die Zündungen in
    // der Folge ihrer Ankunft. Rückgabe: ob der Schritt ganz ist.
    _brandArbeit(frist) {
        const R = this._brandRest;
        if (!R) return true;
        const [B, cs, bf] = [AnazhRealm.BRAND, AnazhRealm.LIFE_FIELD.cell, this.state.brandFeld];
        const n = R.aschen.length;
        for (let k = 0; R.i < n + R.faellig.length; R.i++, k++) {
            if (k >= B.mindestJeBild && performance.now() > frist) return false;
            if (R.i < n) {
                const z = R.aschen[R.i];
                const [ax, az] = [(z.cx + 0.5) * cs, (z.cz + 0.5) * cs];
                const w = Math.round(this._wuchsAt(ax, az, z.boden) * 1e3) / 1e3;
                // die Maske des Betts reist mit der Tat (je vier Punkte eine Hex-Ziffer): die Asche liegt nach jedem Laden, wo es lag
                const hex =
                    z.bett &&
                    Array.from({ length: z.bett.length >> 2 }, (_, i) =>
                        (
                            z.bett[4 * i] |
                            (z.bett[4 * i + 1] << 1) |
                            (z.bett[4 * i + 2] << 2) |
                            (z.bett[4 * i + 3] << 3)
                        ).toString(16)
                    ).join("");
                this._tatSchreiben("brand", ax, az, hex ? { w, bett: hex } : { w });
                continue;
            }
            const z = R.faellig[R.i - n];
            if (z.t0 === null && bf.get(z.cx + "," + z.cz) === z) this._brandZuenden(z.cx, z.cz, z.an, z.ex, z.ez);
        }
        this._brandRest = null;
        return true;
    }

    // Der Ort einer glühenden Zelle für ihre Leser (Licht, Rauch): über ihrer Mitte, gemessen beim ersten Lesen.
    _brandOrt(b) {
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [x, z] = [(b.cx + 0.5) * cs, (b.cz + 0.5) * cs];
        const y = (b.y != null ? b.y : this._voxelSurfaceY(x, z) || 0) + 1;
        const phase = (((x * 12.9898 + z * 78.233) % 6.2832) + 6.2832) % 6.2832;
        return (b.ort = { x, y, z, phase, brand: true, id: "brand:" + b.cx + "," + b.cz });
    }

    // DAS BILD DES BRANDS (stoffe.K2#2): jede glühende Zelle um das Auge (`_brandGlutUm` bis `BRAND.bild.weiteM` — dieselben
    // Zellen in demselben Zustand, den Licht, Ohr und Asche lesen) zeichnet ihre FLAMMEN auf ihrer Front und ihren RAUCH als
    // Fahne. DIE FRONT einer Zelle zur Spielzeit t ist die Ellipse ihres Eintritts (`_brandZuenden`: der Brennpunkt am Eintritt,
    // die Spitze längs `kopf`): r(θ) = (t − t0)·R(θ), R(θ) = R·(1 − ecc)/(1 − ecc·cos θ). Die Flammen stehen auf ihr, soweit sie
    // in der Zelle liegt, je eine halbe Länge auseinander; die Länge nach Byram 1959 (L = 0,0775·I^0,46, I = H·w·R(θ) in kW/m aus
    // der Zeile des Betts), geneigt mit dem EINEN Wind (Froude: tan φ = u/√(g·L)), pulsend in Gipfeln und Tälern
    // (`BRAND.bild.puls`), Gestalt und Ton aus dem Flammen-Gesetz des Fachwerks (`FLAMME`, wie die Feuerstelle). DER RAUCH
    // ist eine Linien-Fahne (Morton–Taylor–Turner 1956): je glühende Zelle Ballen im Takt ihrer Glut von ihren Flammen, sie
    // steigen mit der Auftriebs-Geschwindigkeit der Front w = (g·I/(ρ·c·T))^⅓, wachsen mit der Höhe (b = b0 + α·Δz), verdünnen
    // (Deckung ∝ b0/b) und ziehen mit dem Wind. Bis w3v-brand-bild las nur der Kamin-Rauch die Zelle (Kistchen à 0,34 m, 26 für
    // jede Quelle der Welt: ein Faden, durch den die Krone schien), und keine Flamme stand im Bild — nur der Fleck des Lichts.
    _brandBild(dt) {
        const st = this.state;
        const auge = st.camera ? st.camera.position : st.playerMesh && st.playerMesh.position;
        // die Flammen des Bilds aus dem Vorrat der Instanz (je Bild keine neuen Objekte: der Müll trüge die Spitzen)
        const [fl, vorrat] = [
            this._brandFlammen || (this._brandFlammen = []),
            this._flammenVorrat || (this._flammenVorrat = []),
        ];
        // DAS BILD KOSTET, WAS BRENNT (Gebot 7): ohne Feuer im Feld, ohne Flamme des letzten Bilds und ohne Ballen am Himmel geht
        // kein Bild — bis w12-brand-halt rechnete jeder Takt der Welt Flackern, Wind-Merker und Fahne, auch wo nie ein Brand fing
        if (!fl.length && !st.brandRauch.teilchen.length && !(st.brandFeld && st.brandFeld.size)) return;
        fl.length = 0;
        const qu = [];
        const [B, K, t] = [AnazhRealm.BRAND.bild, AnazhRealm.LIFE_FIELD.cell, st.spielZeit];
        // DIE ZUNGE PULST (w28-brand-zunge): eine Flammen-Front brennt nicht als Band gleicher Höhe — sie steht in Gipfeln und
        // Tälern im Abstand ihrer Länge (Finney et al. 2015), und jede Zunge pufft mit f = 1,5/√D Hz über der Tiefe D = R(θ)·tr
        // ihrer Flammen-Zone (Cetegen & Ahmed 1993); die Spitze geht dabei um ± `puls` um die Byram-Länge (Zukoski: die
        // Spanne der Intermittenz). Bis hier atmete sie mit dem Herdfeuer-Licht (± 18 % in 6–10 Hz, acht Phasen): aus der Nähe
        // ein flaches oranges Band. Die Winkel der Front je Abtastung N EINMAL (cos, sin, gemerkt an der Instanz).
        const [puls, uhr] = [B.puls, 9.42 * (this._bildZeit || 0)];
        const tafeln = this._brandWinkel || (this._brandWinkel = new Map());
        const tafel = (N) => {
            if (!tafeln.has(N))
                tafeln.set(
                    N,
                    Array.from({ length: 2 * N + 2 }, (_, i) =>
                        Math[i % 2 ? "sin" : "cos"](Math.PI * ((2 * (i >> 1)) / N - 1))
                    )
                );
            return tafeln.get(N);
        };
        // DIE EINE WIND-UHR DES BRANDS: Front (`_brandTempo`), Flammen und Fahne lesen den Wind zur Welt-Uhr `t` — die Bild-Uhr
        // (A9) trägt nur das Flackern und die Zeit des Shaders, sie wählt nie den Wind. Bis w13-brand-wind zog die Fahne zur
        // Bild-Uhr (der Wanduhr der Seite): nach dem Laden eines Stands (`_weltUhrNimm`) lagen beide Stunden auseinander, und
        // der Rauch wehte in einen anderen Wind als die Front, die ihn trug (der Mäander `windRichtung` bis ±41°). Je Zelle des
        // Felds EINMAL je Bild (seine Form hängt an der Zelle, die Böe wandert über 100 m)
        const WM = new Map();
        const wind = (x, z) => {
            const k = (Math.floor(x / 16) + 32768) * 65536 + Math.floor(z / 16) + 32768;
            let w = WM.get(k);
            if (!w) WM.set(k, (w = this._windAt(x, z, t)));
            return w;
        };
        // die brennenden Zellen im Bild, die nächste zuerst: die Deckel der Flammen und der Fahne fallen fern, nie nah
        const [Z, paare] = [[], this._brandUmVorrat || (this._brandUmVorrat = [])];
        if (auge)
            this._brandGlutUm(auge.x, auge.z, B.weiteM, (b) => {
                const d = Math.hypot((b.cx + 0.5) * K - auge.x, (b.cz + 0.5) * K - auge.z);
                if (!(b.t0 !== null && b.R > 0 && t > b.t0 && d <= B.weiteM)) return;
                const e = paare[Z.length] || (paare[Z.length] = [0, null]);
                e[0] = d;
                e[1] = b;
                Z.push(e);
            });
        Z.sort((u, v) => u[0] - v[0]);
        for (const [d, b] of Z) {
            if (fl.length >= B.flammenMax || qu.length >= B.zellenMax) break;
            const [x0, z0, xc, zc] = [b.cx * K, b.cz * K, (b.cx + 0.5) * K, (b.cz + 0.5) * K];
            const [px, pz] = b.kopf;
            const w = wind(xc, zc);
            const u = w.ms * B.flammenWind;
            const n0 = fl.length;
            // die Front fern gröber abgetastet (die Kosten tragen der Schirm und die Nähe, Gebot 7), eine junge nach ihrem Umfang
            // (höchstens 2π·R·Alter, je Flamme mindestens `abstandMinM`)
            const umfang = Math.ceil((2 * Math.PI * b.R * (t - b.t0)) / B.abstandMinM);
            const N = Math.max(B.winkelMin, Math.min(B.winkel, Math.round((B.winkel * B.nahM) / d), umfang));
            const wt = tafel(N);
            let [s, naechste, vx, vz] = [0, 0, null, null];
            const bett = this._brandBettFn(b.bett, b.cx, b.cz); // die Flamme steht, wo Bett liegt
            const [E, weg] = [b.ein || [b.ex, b.ez], b.ein && this._brandWeg(b, b.ecc, px, pz)]; // je Eintritt seine Ellipse, gezeichnet, wo keine andere sie schon verzehrte
            for (let j = 0; j < E.length; j += 2)
                for (let i = 0; i <= N; i++) {
                    if (!i) [s, naechste, vx, vz] = [0, 0, null, null];
                    const [c, sn] = [wt[2 * i], wt[2 * i + 1]];
                    const Rt = (b.R * (1 - b.ecc)) / (1 - b.ecc * c);
                    const r = (t - b.t0) * Rt;
                    const [x, z] = [E[j] + r * (px * c - pz * sn), E[j + 1] + r * (pz * c + px * sn)];
                    if (weg && weg(x, z) < (t - b.t0) * b.R * (1 - b.ecc) - 0.01) continue;
                    if (vx !== null) s += Math.sqrt((x - vx) * (x - vx) + (z - vz) * (z - vz));
                    [vx, vz] = [x, z];
                    if (s < naechste || x < x0 || x >= x0 + K || z < z0 || z >= z0 + K || (bett && bett(x, z) < 0.5))
                        continue;
                    const lang = 0.0775 * Math.pow(b.iw * Rt, 0.46);
                    naechste = s + Math.max(B.abstandMinM, B.abstand * lang);
                    const phase = (((x * 12.9898 + z * 78.233) % 6.2832) + 6.2832) % 6.2832;
                    const f = vorrat[fl.length] || (vorrat[fl.length] = {});
                    f.x = x;
                    f.y = b.y + b.gx * (x - xc) + b.gz * (z - zc);
                    f.z = z;
                    const takt = (Math.PI * s) / lang - uhr / Math.sqrt(Math.max(0.05, Rt * b.tr)) + Math.sin(phase);
                    f.lang = lang * (1 + puls * Math.sin(takt));
                    f.kipp = Math.atan(u / Math.sqrt(9.81 * lang));
                    f.wx = w.x;
                    f.wz = w.z;
                    f.dreh = phase;
                    f.I = b.iw * Rt;
                    fl.push(f);
                }
            if (fl.length > n0) {
                qu.push({ b, von: n0, bis: fl.length });
                // DAS LICHT STEHT BEI DEN FLAMMEN (w28-brand-bild): 1 m über der stärksten der Zelle — bis hier über der Zell-Mitte
                let k = n0;
                for (let i = n0 + 1; i < fl.length; i++) if (fl[i].I > fl[k].I) k = i;
                const o = b.ort || this._brandOrt(b);
                [o.x, o.y, o.z] = [fl[k].x, fl[k].y + 1, fl[k].z];
            }
        }
        this._brandFlammenZeichnen(fl);
        this._brandRauch(dt, qu, wind);
    }

    // DIE FAHNE DES BRANDS (`_brandBild`): `qu` die glühenden Zellen mit ihren Flammen [von, bis) im Bild. Je Zelle und Sekunde
    // `rauch.jeS` × Glut Ballen an einer ihrer Flammen (der Same ist der Zähler der Fahne, kein Zufall der Bild-Uhr), höchstens
    // `rauch.max` im Himmel (der älteste weicht dem neuen); jeder steigt, wächst, verdünnt und zieht (`_windAt` am Ballen, zur
    // Welt-Uhr wie die Front, die ihn trägt).
    _brandRauch(dt, qu, wind = (x, z) => this._windAt(x, z, this.state.spielZeit)) {
        const st = this.state;
        const R = AnazhRealm.BRAND.bild.rauch;
        const T = st.brandRauch.teilchen;
        const s = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.1) : 0;
        const fl = this._brandFlammen;
        // das Budget der Fahne: `max` Ballen über alle Zellen ihres Lebens lang — trägt ein großer Brand mehr Zellen, als es
        // fasst, steigt je Zelle seltener ein größerer Ballen (bis `kMax`: dieselbe Deckung der Fläche); bis w3v-brand-bild schob
        // jeder neue den ältesten aus dem Himmel, und die Fahne eines großen Brands stieg nie
        const anteil = R.max / (Math.max(1, qu.length) * R.lebenS);
        for (const q of qu) {
            const voll = R.jeS * q.b.glut;
            const rate = Math.min(voll, anteil);
            const k = rate > 0 ? Math.min(R.kMax, Math.sqrt(voll / rate)) : 1;
            q.b.rauchSchuld = (q.b.rauchSchuld || 0) + rate * s;
            for (; q.b.rauchSchuld >= 1; q.b.rauchSchuld--) {
                if (T.length >= R.max) T.shift(); // die ältesten Ballen verwehen, der Fuß der Fahne bleibt dicht
                const h = Math.imul(++st.brandRauch.n, 2654435761) >>> 0;
                const f = fl[q.von + (h % (q.bis - q.von))];
                // der Ballen entsteht ÜBER der Spitze seiner Flamme (sein Fuß an ihr): bis front-brand lag seine Mitte an der
                // Spitze — mit dem Radius `b0` × Länge hüllte er die Flamme ein, die ihn trägt (am Tag ein graues Knäuel)
                const b0 = R.b0 * f.lang * k;
                const y = f.y + f.lang + b0 * R.size;
                T.push({
                    x: f.x,
                    y,
                    z: f.z,
                    y0: y,
                    b0,
                    s: b0,
                    w: Math.min(R.wMax, Math.cbrt((9.81 * f.I * 1000) / (1.2 * 1005 * 300))),
                    a: R.a0,
                    alt: 0,
                });
            }
        }
        for (let k = T.length - 1; k >= 0; k--) {
            const p = T[k];
            const w = wind(p.x, p.z);
            p.y += p.w * s;
            p.x += w.x * w.ms * s;
            p.z += w.z * w.ms * s;
            [p.zx, p.zy, p.zz] = [w.x * w.ms, p.w, w.z * w.ms]; // sein Zug in m/s (`_rauchZeichnen`)
            p.alt += s;
            p.s = p.b0 + R.alpha * (p.y - p.y0);
            p.a = (R.a0 * p.b0) / p.s;
            if (p.a < R.aKill || p.alt > R.lebenS) T.splice(k, 1);
        }
        this._rauchZeichnen(R, T, "brandRauchSatz", R.maxTeilchen, R.steigMs);
    }

    // DIE TAFEL DER ZUNGE (`_brandFlammenZeichnen`) → { daten, n, rMax, luma0, mittel }, gerechnet einmal je Welt: je Höhe h
    // (`bild.flamme.tafel` Zeilen) ihr Ton in RGB — der Planck-Ort ihrer Temperatur (fachwerk `lichtFarbe`, von kelvin[0] an der
    // Wurzel auf kelvin[1] an der Spitze) × (T/T0)⁴ — und ihr Radius r(h) ÷ `rMax` in A (fachwerk `FLAMME.zunge`). `luma0` ist die
    // Luma der heißesten Zeile, `mittel` DAS MITTEL DES LEIBS in ihrem Maß: Luma(Ton) × Dicke über die Fläche der Zunge (ξ quer,
    // h längs, gewichtet mit r(h); der Ton bei h + (1 − h)·`mantel`·ξ², die Dicke (1 − ξ²)^`rand`·(1 − h)^`spitze` — aus
    // denselben Bytes, linear wie der Filter der Tafel). Gemessen 0,17: so wenig ihrer Wurzel trägt die Zunge im Mittel.
    _flammeTafel() {
        if (this._flammeTafelMerk) return this._flammeTafelMerk;
        const FW = globalThis.__fachwerkCore;
        const [B, Z] = [AnazhRealm.BRAND.bild, FW.FLAMME.zunge];
        const BF = B.flamme;
        const rMax = Math.max(...Z.map((p) => p[0]));
        const [N, [K0, K1]] = [BF.tafel, BF.kelvin];
        const daten = new Uint8Array(4 * N);
        for (let i = 0; i < N; i++) {
            const h = i / (N - 1);
            let j = 1;
            while (j < Z.length - 1 && Z[j][1] < h) j++;
            const [a, b] = [Z[j - 1], Z[j]];
            const r = a[0] + ((b[0] - a[0]) * (h - a[1])) / Math.max(1e-6, b[1] - a[1]);
            const K = K0 + (K1 - K0) * h;
            const [c, w] = [FW.lichtFarbe(K), Math.pow(K / K0, 4)];
            for (let k = 0; k < 3; k++) daten[4 * i + k] = Math.round(255 * c[k] * w);
            daten[4 * i + 3] = Math.round((255 * Math.max(0, r)) / rMax);
        }
        const lies = (h, k) => {
            const u = Math.min(N - 1, Math.max(0, h * N - 0.5));
            const i = Math.min(N - 2, Math.floor(u));
            return (daten[4 * i + k] * (1 - (u - i)) + daten[4 * i + 4 + k] * (u - i)) / 255;
        };
        const luma = (h) => 0.2126 * lies(h, 0) + 0.7152 * lies(h, 1) + 0.0722 * lies(h, 2);
        const luma0 = ((c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2])(FW.lichtFarbe(K0));
        const [NH, NX] = [64, 32];
        let [strahl, flaeche] = [0, 0];
        for (let i = 0; i < NH; i++) {
            const h = (i + 0.5) / NH;
            const r = lies(h, 3);
            for (let j = 0; j < NX; j++) {
                const q = Math.pow((j + 0.5) / NX, 2); // ξ²
                strahl += luma(h + (1 - h) * BF.mantel * q) * Math.pow(1 - q, BF.rand) * Math.pow(1 - h, B.spitze) * r;
                flaeche += r;
            }
        }
        return (this._flammeTafelMerk = { daten, n: N, rMax, luma0, mittel: strahl / flaeche / luma0 });
    }

    // DIE OPTIK DER ZUNGE (front-brand) → { quelle, deckung }: die Flamme ist ein DÜNNER STRAHLER, kein Körper. Das Gesetz des
    // Kerns: der leuchtende Leib eines Feuers trägt `FEUER_LEUCHTDICHTE` (15 000 cd/m²) — ein Dreißigstel des schwarzen Körpers
    // seiner Temperatur (`glutLeuchtdichte(LICHT_GESETZ.feuer.kelvin)`: der Ruß ist dünn). `quelle` ist dieser schwarze Körper
    // (cd/m², der Ton der Wurzel), `deckung` die Deckung bei Dicke 1: Leib ÷ Quelle ÷ das Mittel des Leibs (`_flammeTafel`) —
    // die Zunge strahlt je Pixel Quelle × Ton × Deckung und nimmt ihrem Grund nur diese Deckung (Kirchhoff), IM MITTEL IHRES
    // LEIBS steht sie bei der Leuchtdichte des Gesetzes: dieselbe Zahl × Fläche, die `_flammenLicht` als Schein wirft. Bis hier
    // trug nur ihre WURZEL die Leuchtdichte des Gesetzes (der Leib im Mittel 17 %), und sie deckte wie ein schwarzer Körper
    // (1 − e^(−6·Dicke)): über der Wiese im Mittagslicht stand ein dunkleres Band (gate:post-kette (l): 20 % ihrer Pixel
    // dunkler als die Karte, Lichtstärke × 0,24; die Station same.kopplung.kaskade zählte +9 Flammen-Pixel).
    _flammeOptik() {
        const FW = globalThis.__fachwerkCore;
        const quelle = FW.glutLeuchtdichte(FW.LICHT_GESETZ.feuer.kelvin);
        return { quelle, deckung: FW.FEUER_LEUCHTDICHTE / quelle / this._flammeTafel().mittel };
    }

    // Die Flammen des Bilds (`_brandBild`) als EIN Satz. DIE ZUNGE IST DER DREHKÖRPER des Flammen-Gesetzes (fachwerk `FLAMME`),
    // gezeichnet als sein Abbild: je Flamme eine Fläche längs ihrer Achse (Länge, Neigung in den Wind), quer zur Sicht gedreht
    // (`cameraWorldMatrix`; blickt das Auge längs der Achse, steht sie in der Rechten der Kamera), Breite `breite` × Länge × größter
    // Radius. Je Höhe h liest sie die Tafel der Zunge (`bild.flamme.tafel` Texel): ihren Radius r(h) und ihren TON aus der
    // TEMPERATUR — von der Wurzel zur Spitze fällt sie von kelvin[0] auf kelvin[1], die Farbe ist ihr Planck-Ort (fachwerk
    // `lichtFarbe`, dasselbe Gesetz wie das Feuer-Licht), die Strahlung fällt mit (T/T0)⁴ (Stefan–Boltzmann): der Kern gelb-orange,
    // die Spitze dunkel-rot. DIE ZUNGE IST EIN MEDIUM, das strahlt und schluckt: ihre Dicke im Abstand ξ = |x|/r(h) von der Achse ist
    // (1 − ξ²)^`rand` (der Rand weich, ohne Kante), × (1 − h)^spitze; Rand und Dichte zerreißen im Rausch-Gesetz, das mit `zug`
    // Längen je Sekunde steigt (`rausch`: Skala quer, hoch, Hub zur Spitze hin; zwei Lagen des EINEN Rausch-Atlas); die Deckung
    // ist Dicke × `_flammeOptik().deckung` (ein dünner Strahler), gemischt vormultipliert (Quelle × Deckung + Grund × (1 − Deckung)):
    // wie viele Zungen sich auch decken, keine strahlt heller als ihre Quelle, und keine verdunkelt ihren Grund. Der Ton steht im Bild bei `ziel` vor der Tonkurve (÷ Belichtung): die Kurve rollt ihn nie ins
    // Weiß. Gegen Gras und Boden läuft sie über `saumM` aus (`_tiefenSaum`). DER KERN (w28-brand-kern): die Temperatur fällt auch QUER zur Achse — bei ξ liest der Ton die Tafel bei h + (1 − h)·`mantel`·ξ² (die Achse heiß, der Mantel orange bis rot); und der Ton steht VOR dem Auge der Nacht (`_nachtAuge`, bild-kosten).
    _brandFlammenZeichnen(fl) {
        const st = this.state;
        let S = st.brandFlammenSatz;
        if ((!S && !fl.length) || typeof THREE === "undefined" || !st.scene) return;
        const B = AnazhRealm.BRAND.bild;
        const BF = B.flamme;
        const [sq, sh, hub] = BF.rausch;
        const weit = 1 + 1.25 * hub; // so weit weitet das Rauschen den Radius höchstens: die Fläche trägt den Rand ganz
        if (!S) {
            const { daten, n: N, rMax, luma0 } = this._flammeTafel();
            const tafel = new THREE.DataTexture(daten, N, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
            tafel.name = "brand-flamme:tafel";
            tafel.magFilter = tafel.minFilter = THREE.LinearFilter;
            tafel.generateMipmaps = false;
            tafel.needsUpdate = true;
            const geo = new THREE.PlaneGeometry(2, 1);
            geo.translate(0, 0.5, 0);
            const achse = new THREE.InstancedBufferAttribute(new Float32Array(4 * B.flammenMax), 4);
            const phase = new THREE.InstancedBufferAttribute(new Float32Array(B.flammenMax), 1);
            geo.setAttribute("aAchse", achse);
            geo.setAttribute("aFlamme", phase);
            const T = THREE.TSL;
            const mat = new THREE.MeshBasicNodeMaterial({
                transparent: true,
                depthWrite: false,
                premultipliedAlpha: true,
            });
            // die Fläche: längs der Achse (aAchse.xyz = Achse × Länge), quer zu ihr und zur Sicht (halbe Breite aAchse.w × weit)
            const A = T.attribute("aAchse", "vec4");
            const quer = T.cross(A.xyz, T.cameraWorldMatrix.mul(T.vec4(0, 0, 1, 0)).xyz);
            const seite = T.select(
                quer.length().greaterThan(A.xyz.length().mul(0.05)),
                quer.normalize(),
                T.cameraWorldMatrix.mul(T.vec4(1, 0, 0, 0)).xyz
            );
            const g = T.positionGeometry;
            mat.positionNode = A.xyz.mul(g.y).add(seite.mul(g.x.mul(A.w).mul(weit)));
            const uZeit = T.uniform(0);
            const [q, ra, ph] = [T.uv(), this._rauschAtlas(), T.attribute("aFlamme", "float")];
            const [h, x] = [q.y, q.x.mul(2).sub(1).mul(weit)];
            const z = T.texture(tafel, T.vec2(h, 0.5));
            const p = T.vec3(x.mul(sq), h.mul(sh).sub(uZeit.mul(BF.zug)), ph.mul(7.9)).add(T.vec3(ph.mul(31.7), ph.mul(17.3), 0)); // prettier-ignore
            const rausch = ra.raum(p).add(ra.raum(p.mul(2.07)).mul(0.5));
            const r = z.a.mul(T.float(1).add(rausch.mul(h.add(0.25).mul(hub)))).max(1e-3);
            const dicke = T.float(1)
                .sub(x.div(r).pow2())
                .max(0)
                .pow(BF.rand)
                .mul(T.float(1).sub(h).pow(B.spitze))
                .mul(T.float(1).add(rausch.mul(0.5)).max(0));
            const ton = T.texture(tafel, T.vec2(h.add(h.oneMinus().mul(x.div(r).pow2().min(1)).mul(BF.mantel)), 0.5)).rgb; // prettier-ignore
            // DIE ZUNGE IST EIN DÜNNER STRAHLER (`_flammeOptik`, front-brand): ihr Ton steht in der Leuchtdichte ihrer QUELLE
            // (die Tafel trägt die Lichtfarbe auf den hellsten Kanal 1: ÷ die Luma der heißesten Zeile), ihre Deckung ist ihre
            // Dicke × `deckung` — sie strahlt Quelle × Deckung und nimmt dem Grund nur diese Deckung (Kirchhoff)
            const O = this._flammeOptik();
            mat.colorNode = T.vec4(
                this._nachtAuge(ton.mul(O.quelle / __weltLicht.EINHEIT_LX / luma0), true),
                dicke.mul(O.deckung).min(1).mul(this._tiefenSaum(BF.saumM))
            );
            const mesh = AnazhRealm._instanzMesh(geo, mat, B.flammenMax);
            mesh.name = "brand-flammen";
            mesh.userData.inventar = "brand"; // Identitäts-Stempel (gate:asset-inventory: Welt-Substanz)
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            mesh.frustumCulled = false;
            AnazhRealm._instanzZahl(mesh, 0);
            st.scene.add(mesh);
            S = st.brandFlammenSatz = { mesh, achse, phase, uZeit, tafel, rMax };
        }
        S.uZeit.value = this._bildZeit || 0;
        const n = Math.min(fl.length, B.flammenMax);
        const [M, Ac] = [S.mesh.instanceMatrix.array, S.achse.array];
        for (let k = 0; k < n; k++) {
            const f = fl[k];
            // die Achse der Flamme: hoch, um `kipp` in den Wind geneigt, × Länge; die halbe Breite; der Ort in ihrer Matrix (die
            // übrigen Glieder bleiben die der Einheit)
            const [wl, sp, l, o, i] = [Math.hypot(f.wx, f.wz) || 1, Math.sin(f.kipp), f.lang, 16 * k, 4 * k];
            Ac[i] = (sp * f.wx * l) / wl;
            Ac[i + 1] = Math.cos(f.kipp) * l;
            Ac[i + 2] = (sp * f.wz * l) / wl;
            Ac[i + 3] = B.breite * l * S.rMax;
            M[o + 12] = f.x;
            M[o + 13] = f.y;
            M[o + 14] = f.z;
            S.phase.array[k] = f.dreh / 6.2832;
        }
        AnazhRealm._instanzZahl(S.mesh, n);
        if (n > 0) S.mesh.instanceMatrix.needsUpdate = S.achse.needsUpdate = S.phase.needsUpdate = true;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_feld_brand]);

// ===== ATLAS · Feld/brand — Außen-Konstanten =====
// BRAND — das Feuer auf dem Feld (stoffe.K2 · feld.K3#2, `_tickBrand`): der Takt zieht je `schrittS` Spielzeit EINEN Schritt; eine
// Zelle glüht in `aufS` auf, unter `minStoff` lebendig trägt sie kein Bett. Das Bett selbst ist die Zeile seines Stoffs (die
// Spalte `brenn` der Stoff-Tafel, `_brandTempo`); hier steht nur, was kein Stoff trägt: die Feuchte des toten Fein-Brennstoffs
// (`feuchte`, `_brandFeuchte`: luft-trocken an einem klaren Tag 6 %, über nassem Boden bis zur Faser-Sättigung 35 %, Rothermel
// 1972, Anderson 1982; der Regen als freies Wasser bis zu dem, was durchnässte Streu hält, 250 %, Matthews 2006 — im Landregen
// erstickt das Gras nach 6 s, das Laub nach 20 s, im Sturm nach 4 und 12 s), der Mineral-Anteil der Partikel (gesamt, kieselfrei; Rothermel 1972, gleich für jedes Modell), das größte L/B der
// Ellipse (Anderson 1983) und die acht Nachbarn der Front. Glut leuchtet als Feuer (LICHT_GESETZ.feuer, Masse `licht` × Glut)
// und hebt glut in `auraAt`.
AnazhRealm.BRAND = Object.freeze({
    schrittS: 1,
    sprungS: 10, // liegt die Welt-Uhr weiter vor, sprang sie: die Uhr des Brands geht von Ereignis zu Ereignis (`_tickBrand`)
    aufS: 4,
    ascheKorn: 0.3, // so viel vom Korn des Erdreichs zeigt die Asche-Decke (`_terrainGeologyAlbedo`)
    versengt: Object.freeze([0.9, 0.4, 0.2]), // der Ton (× die Farbe des Halms) des versengten Halms im Saum der Narbe (`_nahWieseKachelBueschel`)
    wieseS: 3, // so oft höchstens baut die Nah-Wiese über einer brennenden Zelle neu (`_brandMalen`)
    minStoff: 0.15,
    // zuerst misst die Zelle ihr Bett grob (`_brandStoff`: Mitte und vier Viertel, in Zellen) — nur mit Brennstoff UND Kahlem darin …
    bettGrob: Object.freeze(
        [
            [0, 0],
            [-0.25, -0.25],
            [0.25, -0.25],
            [-0.25, 0.25],
            [0.25, 0.25],
        ].map(Object.freeze)
    ),
    bettGitter: 8, // … misst sie die Maske fein (8² Punkte, 2 m) …
    bettKante: Object.freeze([0.35, 0.65]), // … und über diese Spanne der bilinearen Maske fällt seine Kante (`_brandBettFn`)
    licht: 4,
    budgetMs: 0.25, // so viel Arbeit eines Schritts geht je Bild (`_brandArbeit`) …
    mindestJeBild: 8, // … und mindestens so viele Aschen und Zündungen (ein kleiner Brand geht seinen Schritt in einem Bild)
    blockZellen: 4, // die Leser fragen die glühenden Zellen je Block von 4 × 4 Zellen (64 m, `_brandGlutUm`)
    hoerM: 256, // so weit hört das Ohr den Brand knistern (`_glutAmOhr`)
    // das Bild (`_brandBild`): bis `weiteM` um das Auge, die Front in `winkel` Schritten abgetastet (jenseits von `nahM` je
    // Abstand gröber, nie unter `winkelMin`), je Flamme ein Abstand von
    // `abstand` × ihrer Länge (mindestens `abstandMinM`), höchstens `flammenMax` je Bild aus höchstens `zellenMax` Zellen, die
    // nächsten zuerst (ein Brand von 2 000 Zellen kostet das Bild, nie die Welt); die Spitze der Zunge pulst um ± `puls` ihrer Länge; `flammenWind` der Wind auf Flammenhöhe je Wind
    // in 10 m (Albini–Baughman 1979, offenes Gras); die Zunge `breite` × Länge breit, ihre Deckung
    // fällt zur Spitze mit (1 − h)^spitze; ihr Bild `flamme` (`_brandFlammenZeichnen`): die Temperatur `kelvin` [Wurzel, Spitze], `ziel` ihr Ton vor der
    // Tonkurve, ihr Leib trägt im Mittel die Leuchtdichte des Gesetzes (`_flammeOptik`, fachwerk `FEUER_LEUCHTDICHTE` — dieselbe, die `_flammenLicht` wirft), ihr Fall zum Rand (1 − ξ²)^`rand`, die Tafel der Zunge in `tafel` Texeln, das Rausch-Gesetz `rausch` [Skala quer, hoch, Hub], steigend mit `zug` Längen je
    // Sekunde, der Saum gegen die Tiefe `saumM`. Der Rauch: `jeS` Ballen je Zelle und Sekunde bei voller Glut, höchstens `max` (ein
    // großer Brand je Zelle seltener, bis `kMax` × größer), die Ballen beginnen mit `b0` × Flammen-Länge, wachsen um `alpha` je Meter Steigen, decken anfangs `a0` und fallen unter
    // `aKill` oder nach `lebenS`; Steigen höchstens `wMax` m/s; der Satz (Ballen, Stoff `color`, Radius je Einheit `size`) zeichnet das
    // EINE Rauch-Bild der Welt (`_rauchZeichnen`, RAUCH_BILD), sein Muster steigt mit `steigMs` m/s
    bild: Object.freeze({
        weiteM: 160,
        winkel: 96,
        winkelMin: 4,
        nahM: 12,
        abstand: 0.45,
        abstandMinM: 0.2,
        flammenMax: 384,
        zellenMax: 32,
        puls: 0.35,
        flammenWind: 0.4,
        breite: 0.42,
        spitze: 0.8,
        flamme: Object.freeze({
            kelvin: Object.freeze([3000, 1700]),
            mantel: 1,
            rand: 1.5,
            rausch: Object.freeze([1.6, 2.5, 0.8]),
            tafel: 32,
            zug: 3,
            saumM: 0.15,
        }),
        rauch: Object.freeze({
            jeS: 12,
            max: 600,
            b0: 1.2,
            alpha: 0.16,
            a0: 0.5,
            aKill: 0.08,
            lebenS: 25,
            kMax: 3,
            wMax: 7,
            steigMs: 2.5,
            color: 0x8d8881,
            size: 1,
            maxTeilchen: 600,
            name: "brand-rauch",
            inventar: "brand",
        }),
    }),
    // die Grenze der Narbe (`_brandNarbe`): das Rauschen je Oktave (Wellenlänge m, Hub im Anteil der Zellen am Rand — der Hub
    // verschiebt die Kante um bis zu 4 m, eine halbe Zelle) und die Breite, über die sie fällt (0,18 im Anteil: ~2 m angesengter Saum)
    narbe: Object.freeze({ lambda: Object.freeze([14, 5]), amp: Object.freeze([0.7, 0.25]), band: 0.18 }),
    feuchte: Object.freeze({ trocken: 0.06, faser: 0.35, nass: 2.5 }),
    mineral: Object.freeze({ gesamt: 0.0555, frei: 0.01 }),
    lbMax: 8,
    nachbarn: Object.freeze(
        [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
        ].map(Object.freeze)
    ),
});
