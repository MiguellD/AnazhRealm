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

    // DIE MASSE DES BRANDS (same.physik.reaktion#1, front-brand) → { holz, brannte, asche, rauch } in kg zur Uhr t: HOLZ BRENNT ZU
    // ASCHE UND RAUCH, DIE MASSE BLEIBT. `holz` ist das Bett der Zelle, wie die Front es antraf (`kg`, `_brandZuenden`: Last ×
    // lebendig × die Fläche ihres Betts); `brannte`, was ihre Front erreichte — der Anteil ihres Betts in derselben Ellipse, die
    // Narbe und Flammen lesen (`_brandWeg`, auf `masseGitter`² Punkten, gewichtet mit der Maske, `_brandBettFn`): ausgebrannt
    // das ganze Holz, vom Regen gelöscht der Teil hinter der Front. Davon bleibt der Mineral-Anteil des Gesetzes als ASCHE am
    // Boden (`BRAND.mineral.gesamt`, Rothermels S_T — derselbe, der die Reaktion mindert; die Tat `brand` trägt sie,
    // `_brandArbeit`), der Rest steigt als RAUCH — im Bild tragen ihn die Ballen: `_brandStrom` misst ihn an der Front,
    // `_brandRauch` gibt ihn weiter. Bis front-brand war die Asche eine Decke ohne Masse und der Rauch eine Zahl von Ballen je
    // Sekunde (gate:stand-takt --narbe N8: die optische Masse eines Ballens wuchs im Steigen × 1,58, volle ↔ halbe Last × 1,41).
    _brandMasse(b, t = this._brandUhr) {
        const [B, cs] = [AnazhRealm.BRAND, AnazhRealm.LIFE_FIELD.cell];
        let teil = 1; // ausgebrannt: das ganze Holz (die Kosten trägt nur die Zelle, die noch brennt)
        if (t < b.ende) {
            const [N, bett, weg] = [
                B.masseGitter,
                this._brandBettFn(b.bett, b.cx, b.cz),
                this._brandWeg(b, b.ecc, b.kopf[0], b.kopf[1]),
            ];
            const reich = (t - b.t0) * b.R * (1 - b.ecc); // so weit lief die Front im Maß ihrer Ellipse
            let [u, n] = [0, 0];
            for (let k = 0; k < N * N; k++) {
                const [x, z] = [(b.cx + ((k % N) + 0.5) / N) * cs, (b.cz + (Math.floor(k / N) + 0.5) / N) * cs];
                const g = bett ? bett(x, z) : 1;
                n += g;
                if (weg(x, z) <= reich) u += g;
            }
            teil = n > 0 ? u / n : 0;
        }
        const brannte = b.kg * teil;
        const asche = brannte * B.mineral.gesamt;
        return { holz: b.kg, brannte, asche, rauch: brannte - asche };
    }

    // DER STROM DER FRONT (front-brand, same.physik.reaktion#1) → kg Holz je Sekunde, die die Front der Zelle zur Uhr t verzehrt:
    // die Fläche, die ihre Ellipsen im Bett der Zelle je Sekunde überstreichen — ∫ R(θ)·r(θ) dθ in `masseWinkel` Strahlen (je
    // Eintritt seine Ellipse, wo keine andere sie schon verzehrte, gewogen mit der Maske des Betts wie im Buch `_brandMasse`) —
    // mal die Masse je m² Bett. ER HÄNGT NIE AM BILD: bis hier zählte ihn `_brandBild` in den Winkeln, mit denen es die Front
    // für das Auge abtastet, und `_brandRauch` gab ihn im Takt des Bilds weiter — 100 m vom Brand trug die Fahne 78 % ihres
    // Rauchs, bei einem Bild von 250 ms 38 % (gate:stand-takt --narbe N8-BILD).
    _brandStrom(b, t) {
        const [N, K, G] = [AnazhRealm.BRAND.masseWinkel, AnazhRealm.LIFE_FIELD.cell, AnazhRealm.BRAND.masseGitter];
        const tau = t - b.t0;
        if (!(tau > 0 && b.R > 0)) return 0;
        const [x0, z0, [px, pz]] = [b.cx * K, b.cz * K, b.kopf];
        const bett = this._brandBettFn(b.bett, b.cx, b.cz);
        if (bett && !(b.bettM2 > 0)) {
            let n = 0;
            for (let k = 0; k < G * G; k++)
                n += bett((b.cx + ((k % G) + 0.5) / G) * K, (b.cz + (Math.floor(k / G) + 0.5) / G) * K);
            b.bettM2 = (n / (G * G)) * K * K; // die Fläche ihres Betts im Maß der Maske
        }
        const m2 = bett ? b.bettM2 : K * K;
        if (!(m2 > 0)) return 0;
        const [E, weg, reich] = [
            b.ein || [b.ex, b.ez],
            b.ein && this._brandWeg(b, b.ecc, px, pz),
            tau * b.R * (1 - b.ecc),
        ];
        let flaeche = 0;
        for (let j = 0; j < E.length; j += 2)
            for (let i = 0; i < N; i++) {
                const w = Math.PI * ((2 * i + 1) / N - 1);
                const [c, sn] = [Math.cos(w), Math.sin(w)];
                const Rt = (b.R * (1 - b.ecc)) / (1 - b.ecc * c);
                const [x, z] = [E[j] + tau * Rt * (px * c - pz * sn), E[j + 1] + tau * Rt * (pz * c + px * sn)];
                if (x < x0 || x >= x0 + K || z < z0 || z >= z0 + K || (weg && weg(x, z) < reich - 0.01)) continue;
                flaeche += tau * Rt * Rt * (bett ? bett(x, z) : 1);
            }
        return ((b.kg / m2) * flaeche * 2 * Math.PI) / N;
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
    // reihum) in die Boden-Decke — es kostet, was brennt; die Nah-Wiese über den geänderten Vierteln baut neu, je Zelle höchstens
    // alle `BRAND.wieseS` s.
    _brandMalen() {
        const [bf, wk] = [this.state.brandFeld, this.state.wegeKarte];
        const G = bf && bf.glueht;
        if (!G || !G.length || !wk) return;
        const n = (bf.malN = ((bf.malN || 0) + 1) % (4 * G.length));
        const [b, v, cs] = [G[n >> 2], n & 3, AnazhRealm.LIFE_FIELD.cell];
        const [x0, z0] = [(b.cx - 0.5 + (v & 1)) * cs, (b.cz - 0.5 + (v >> 1)) * cs];
        const zelle = this._brandZellen();
        let neu = false;
        for (const stufe of wk.stufen)
            if (stufe.zentriert && this._ascheFlaeche(stufe, x0, z0, x0 + cs, z0 + cs, zelle)) neu = true;
        // DIE WIESE BAUT NEU, WO DIE ASCHE SICH ÄNDERTE (front-brand): `wieseNeu` ist das Rechteck der Viertel, deren Texel sich
        // seit dem letzten Neubau der Zelle änderten — nur seine Kacheln fallen. Bis hier fiel mit jedem geänderten Viertel die
        // ganze Fläche ±½ Zelle (32 m: 100 Kacheln der Nah-Streu und 36 der Nah-Wiese je Neubau, gate:stand-takt BRAND-ZELLEN).
        if (neu) {
            const W = b.wieseNeu;
            b.wieseNeu = W
                ? [Math.min(W[0], x0), Math.min(W[1], z0), Math.max(W[2], x0 + cs), Math.max(W[3], z0 + cs)]
                : [x0, z0, x0 + cs, z0 + cs];
        }
        if (b.wieseNeu && !(this._brandUhr - b.wieseT < AnazhRealm.BRAND.wieseS)) {
            const W = b.wieseNeu;
            [b.wieseNeu, b.wieseT] = [null, this._brandUhr];
            this._nahRingNeuIn(W[0], W[1], W[2], W[3]);
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
        const I = this._tatIndex();
        const je = I.je.get(key);
        // auf der Asche brennt nichts, bis ihr Boden heilt (`_tatBoden`); im jungen Wald danach trägt das Bett, was wächst
        if (je && je.some((a) => a.tat === "brand" && this._weltStunde(uhr) < a.h + I.boden.get(a))) return null;
        const M = this._brandBett || (this._brandBett = new Map());
        if (M.has(key)) return M.get(key);
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [x, z] = [(cx + 0.5) * cs, (cz + 0.5) * cs];
        const leb = this.auraAt(x, z, 0, uhr).lebendig;
        let f = null;
        if (leb >= AnazhRealm.BRAND.minStoff && !this._nassAt(x, z)) {
            // DAS GEFÄLLE DES BETTS LIEST DIE EINE 2D-HÖHE DER WELT (front-brand, `_terrainMacroSurfaceY`: das Gelände-Gesetzbuch,
            // auf jeder Seite dieselbe Zahl) — die Höhe `y`, auf der das Bett liegt, bleibt die der Säule (`_voxelSurfaceY`: Höhle,
            // Edit). Bis hier marschierte jede Zündung für Höhe und Gefälle DREIMAL durch ihre Säule (je Marsch 17 Dichte-Proben,
            // 57 Einheiten der Stand-Linse): mit ihren fünf Bett-Punkten 450 Einheiten je Zündung, zwei Zündungen in einem Schritt
            // mit 16 Zellen 1 099 (gate:stand-takt BRAND-ZELLEN, Soll 64 je Zelle).
            const [y, h, y0] = [this._voxelSurfaceY(x, z), cs / 2, this._terrainMacroSurfaceY(x, z)];
            const [gx, gz] = [
                (this._terrainMacroSurfaceY(x + h, z) - y0) / h,
                (this._terrainMacroSurfaceY(x, z + h) - y0) / h,
            ];
            if (!Number.isFinite(gx + gz))
                this._bruchMelden("BRAND-GEFÄLLE: die 2D-Höhe trägt an " + x + "/" + z + " keine Zahl");
            // der Hang des Betts ist der seiner Ebene: das Grün des Gesetzes je Bett-Punkt (`_kontaktStoffAt` → `_bodenGruenUnter`)
            // liest ihn, statt die Normale des Felds je Punkt zu messen (fahrt-weltzeit: 81 statt 40 Einheiten je Punkt)
            const hang = Math.hypot(gx, gz);
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
                    const s = this._stoff(this._kontaktStoffAt(x + dx, z + dz, y + gx * dx + gz * dz, hang));
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
    // (÷ 1,15 auf 20 ft) auf Flammenhöhe (Albini–Baughman 1979 aus der Tiefe des Betts, ohne Wind-Grenze), und der Hang (das
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
        const phiW = C * u ** Bw * q ** -E;
        const [gx, gz] = [f.gx, f.gz];
        const phiS = (5.275 * beta ** -0.3 * (gx * gx + gz * gz)) / (Math.hypot(gx, gz) || 1);
        const [vx, vz] = [phiW * w.x + phiS * gx, phiW * w.z + phiS * gz];
        const phi = Math.hypot(vx, vz);
        const mph = ((phi * q ** E) / C) ** (1 / Bw) / 88;
        const lb = Math.min(B.lbMax, 0.936 * Math.exp(0.2566 * mph) + 0.461 * Math.exp(-0.1548 * mph) - 0.397);
        const ecc = Math.sqrt(Math.max(0, lb * lb - 1)) / lb;
        // DIE SPITZE LÄUFT NIE SCHNELLER ALS IHR WIND (Andrews, Cruz & Rothermel 2013, Int. J. Wildland Fire 22: 959–969, die
        // Schlüsse: „neither the original nor the improved revised wind limit be imposed … modelled rate of spread not exceed the
        // effective midflame wind speed"): R ≤ U_eff (ft/min, mph × 88), wo er weht — die Spitze ohne Wind trägt ihr R0. Bis
        // brand-feld deckelte die Wind-Grenze Rothermels (U ≤ 0,9·I_R) den Wind des Betts: das volle Gras der Mess-Wiese (Zeile
        // gras = Modell 1, 0,17 kg/m², σ 11 483) lief bei 15 m/s in 10 m 2,65 m/s, die Herd-Zelle −248/−1080 (ein Drittel Bett,
        // Anteil 0,34) ab 4 m/s nie schneller als 0,28 m/s — ohne sie voll 4,68 m/s (281 m/min), der Herd 0,33 · 0,73 · 1,33 m/s
        // bei 4 · 6 · 8,1 m/s, im Band der Grasbrände, gegen das Andrews 2013 (Abb. 7) Modell 1 ohne Grenze stellt:
        // McArthur 1969, Cheney et al. 1998 und Gould 2005 messen 100–390 m/min bei 30–55 km/h in 10 m, die Grenzen deckeln bei 115–160
        const R = Math.min(R0 * (1 + phi), Math.max(R0, mph * 88));
        return { R: R * 0.00508, ecc, px: phi ? vx / phi : 1, pz: phi ? vz / phi : 0, tr: 23040 / sig };
    }

    // DAS ENTFACHEN IST EIN AKT DER SEITE (feld.K2#2, `_feldAkt`): was eine Seite entzündet (das Brennglas, die Probe), fängt auf jeder
    // Seite zur selben Welt-Zeit — allein sofort (→ die Zelle oder null), mit Mitspielern im Vorlauf (→ true). Bis feld.K2#2 brannte
    // es nur auf der Seite, deren Brennglas zündete.
    _brandEntfachen(x, z) {
        return this._feldAkt({ art: "brand", w: this.state.spielZeit, x, z }, true);
    }

    // Die Zelle unter (x, z) fängt Feuer → die Zelle oder null (sie brennt schon, trägt kein Bett, die Welt ist zu nass). `uhr`
    // (s der Welt-Uhr): der Augenblick des Funkens (ein Feld-Akt zu seinem Stempel, `_feldAktWirkt`) — ohne ihn jetzt.
    // DER FUNKE AN EINER LADUNG (same.physik.reaktion#2): berührt er die Hülle eines Baus, dessen Stoff q trägt, setzt der mit
    // der Tat um (`_ladungZuenden` → `_tickDruck`: der Rufer mag sein Werk gleich abräumen, das Brennglas) — auch auf einer
    // Zelle, die schon brennt oder kein Bett trägt (dann → true: nichts fing, eine Ladung setzte um).
    _brandFangen(x, z, ein, uhr = this.state.spielZeit) {
        const st = this.state;
        const bf = st.brandFeld || (st.brandFeld = new Map());
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [cx, cz] = [Math.floor(x / cs), Math.floor(z / cs)];
        const n = bf.get(cx + "," + cz);
        if (n && n.t0 !== null) {
            if (this._ladungZuenden(cx, cz, uhr, x, z, null)) this._tickDruck();
            return null;
        }
        // ein neuer Brand misst sein Bett neu, und nichts eines alten wartet: die Aschen, die der erloschene noch trug, liegen
        // zuerst (ohne Feld zündet der Rest nichts mehr) — bis w13-brand-takt fielen sie hier weg
        if (!bf.size) {
            if (this._brandRest) this._brandArbeit(Infinity);
            [this._brandUhr, this._brandBett, this._brandRest, bf.glutBlock] = [uhr, null, null, null];
        }
        const zelle = this._brandZuenden(cx, cz, uhr, x, z, ein, uhr);
        this._tickDruck();
        return zelle;
    }

    // Die Front erreicht die Zelle zur Zeit t am Punkt (ex, ez) ihres Rands (der Herd: am Ort der Tat). Ihr Bett und ihr Tempo
    // tragen die Front weiter, als Welle vom Eintrittspunkt (Huygens): die Zeit bis zu einem Punkt v ist
    // (|v| − ecc·v·ψ) / (R·(1 − ecc)) — die Ellipse mit dem Herd im Brennpunkt —, und jede Nachbarin, die noch nicht brennt,
    // erhält die Ankunft am ersten Punkt ihrer Fläche, den die Welle berührt (das Minimum über Ecken, Kanten-Mitten, den nächsten
    // Punkt und den Eintritt der Achse) — die frühere gewinnt. So läuft die Spitze längs ihrer Achse durch die Zellen, die sie
    // kreuzt, in ihrem Tempo, wie schmal die Ellipse auch ist (an den Mitten gemessen verlor das Gitter der acht Nachbarn 75 %
    // der Spitze). Die Zelle brennt, bis die Spitze sie längs ihres Kopfs durchquert hat (bis an ihre fernste Ecke), und die
    // Flamme ihre Verweilzeit; was langsamer in sie zurückläuft (Flanke, Rückfeuer), trägt die Ankunft ihrer Nachbarinnen, nicht
    // ihr Brennen. Ohne Bett oder Tempo fällt sie aus dem Feld (null). DIE LADUNGEN DER ZELLE (same.physik.reaktion#2,
    // `_ladungZuenden`) tragen die Frist, zu der die Front ihren Ort erreicht; ohne Bett setzt nur die Ladung am Eintrittspunkt
    // um (→ true statt null).
    _brandZuenden(cx, cz, t, ex, ez, ein = null, uhr = this.state.spielZeit) {
        const bf = this.state.brandFeld;
        const key = cx + "," + cz;
        const f = this._brandStoff(cx, cz, uhr);
        const T = f && this._brandTempo(f, t);
        if (!T || !(T.R > 0)) {
            bf.delete(key);
            return this._ladungZuenden(cx, cz, t, ex, ez, null) ? true : null;
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
        const last = f.zeile.brenn.last * Math.min(1, f.leb);
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
            // DIE LAST DES BETTS, wie die Front es antrifft (`w` kg/m² trocken: die Last der Zeile × lebendig): sie trägt die Wärme
            // je Fläche H·w (`iw` kJ/m² — mal dem Tempo die Intensität der Front nach Byram, die das Bild liest) und DIE MASSE DER
            // ZELLE (`kg`: × die Fläche ihres Betts — das Holz, das zu Asche und Rauch brennt, `_brandMasse`)
            w: last,
            iw: (f.zeile.brenn.heiz / 1000) * last,
            kg: last * f.anteil * cs * cs,
            bett: f.bett, // die Maske ihres Betts (`_brandStoff`): Flammen, Front und Asche stehen auf ihr (`_brandBettFn`)
        });
        bf.set(key, zelle);
        this._ladungZuenden(cx, cz, t, ex, ez, zeit);
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
                // DIE ASCHE HAT MASSE (`_brandMasse`): der Mineral-Anteil dessen, was in der Zelle brannte, in kg (auf das Gramm)
                const kg = Math.round(this._brandMasse(z, R.t).asche * 1e3) / 1e3;
                this._tatSchreiben("brand", ax, az, hex ? { w, kg, bett: hex } : { w, kg });
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

    // DER BOGEN DER FRONT EINER ZELLE (brand-feld) → [die Tafel ihrer Einheits-Front, gemerkt je Zelle; ∫ ds/a für `weit`]: die
    // Ellipse r(θ) = (1 − e)/(1 − e·cos θ) um ihren Brennpunkt (die Spitze bei x = 1; die Front ist sie × τ·R) in `bogenTafel`
    // Stücken ihrer EXZENTRISCHEN Anomalie E (x = c + a·cos E, y = b·sin E, a = 1/(1 + e), c = e·a, b = a·√(1 − e²): dicht an
    // den Spitzen, wo sie sich krümmt; die Spitze ist E = 0, das Stück M/2). Je Ecke i: `x`, `y`, `r` = |(x, y)|, `L` die
    // Byram-Länge aus R(θ) = R·r(θ), `s` ihr Bogen ab der Ferse, `a` der
    // Abstand ihrer Flammen nach dem Gesetz — max(`abstandMinM`, `abstand` × L), er hängt an θ,
    // nie an der Uhr —, `phi` ∫ ds/max(a, weit) ab der Spitze (je m der Einheit; die Front zählt × τ·R), `kreis` je `bogenBlock`
    // Stücke [Mitte x, y, Radius] für den Schnitt mit der Zelle.
    _brandBogen(b, weit) {
        const B = AnazhRealm.BRAND.bild;
        const [M, Q, e] = [B.bogenTafel, B.bogenBlock, b.ecc];
        const integriere = (T, w, phi) => {
            const [S, A] = [T.s, T.a];
            phi[M / 2] = 0;
            for (let i = M / 2; i < M; i++)
                phi[i + 1] = phi[i] + ((S[i + 1] - S[i]) * (1 / Math.max(A[i], w) + 1 / Math.max(A[i + 1], w))) / 2;
            for (let i = M / 2; i > 0; i--)
                phi[i - 1] = phi[i] - ((S[i] - S[i - 1]) * (1 / Math.max(A[i], w) + 1 / Math.max(A[i - 1], w))) / 2;
            return phi;
        };
        const W = this._brandBoegen || (this._brandBoegen = new WeakMap());
        let T = W.get(b);
        if (!T || T.bild !== B || T.e !== e || T.R !== b.R || T.iw !== b.iw) {
            // die Tafel entsteht, wenn die Zelle ins Bild tritt, und rechnet in ihren Feldern neu, wenn sie neu zündet (R, ecc,
            // iw) — ohne Feld-Literale: sie läuft selten, also kalt, und im Stoß, wenn ein Ring Zellen zugleich ins Bild tritt
            if (!T || T.bild !== B) {
                T = { bild: B, kreis: new Float64Array(3 * Math.ceil(M / Q)) };
                for (const k of ["x", "y", "r", "L", "s", "a", "phi"]) T[k] = new Float64Array(M + 1);
                W.set(b, T);
            }
            [T.e, T.R, T.iw, T.aMin, T.phiWeit] = [e, b.R, b.iw, Infinity, undefined];
            const ha = 1 / (1 + e);
            const hb = Math.sqrt(1 - e * e) * ha;
            const c = 0.0775 * Math.pow(b.iw * b.R, 0.46); // die Byram-Länge bei r = 1, die Spitze
            const { x: X, y: Y, r: Rr, L, s: S, a: A, kreis } = T;
            for (let i = 0; i <= M; i++) {
                const E = Math.PI * ((2 * i) / M - 1); // von der Ferse (E = −π) über die Spitze (0) zurück
                X[i] = e * ha + ha * Math.cos(E);
                Y[i] = hb * Math.sin(E);
                Rr[i] = Math.hypot(X[i], Y[i]); // r(θ): R(θ) = R·r
                L[i] = c * Math.pow(Rr[i], 0.46); // die Byram-Länge dort
                S[i] = i ? S[i - 1] + Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]) : 0;
                A[i] = Math.max(B.abstandMinM, B.abstand * L[i]);
                if (A[i] < T.aMin) T.aMin = A[i];
            }
            for (let q = 0; q < M; q += Q) {
                const qe = q + Q < M ? q + Q : M;
                let x0 = Infinity;
                let x1 = -Infinity;
                let y0 = Infinity;
                let y1 = -Infinity;
                for (let i = q; i <= qe; i++) {
                    if (X[i] < x0) x0 = X[i];
                    if (X[i] > x1) x1 = X[i];
                    if (Y[i] < y0) y0 = Y[i];
                    if (Y[i] > y1) y1 = Y[i];
                }
                // der Kreis um die Ecken des Blocks, um den Bogen eines Stücks über seine Sehne geweitet
                const k = 3 * (q / Q);
                kreis[k] = (x0 + x1) / 2;
                kreis[k + 1] = (y0 + y1) / 2;
                kreis[k + 2] = Math.hypot(x1 - x0, y1 - y0) / 2 + (S[qe] - S[q]) / Q;
            }
            integriere(T, 0, T.phi);
        }
        if (!(weit > T.aMin)) return [T, T.phi];
        // das Budget weitet in Stufen von `weitStufe` (aufgerundet: nie mehr Flammen als das Budget): Φ rechnet neu, wenn Auge
        // oder Budget eine Stufe gehen — nicht je Bild, und die Flammen kriechen nicht mit jedem Schritt des Auges
        const w = T.aMin * Math.pow(1 + B.weitStufe, Math.ceil(Math.log(weit / T.aMin) / Math.log(1 + B.weitStufe)));
        if (T.phiWeit !== w) [T.phiWeit, T.phiW] = [w, integriere(T, w, T.phiW || new Float64Array(M + 1))];
        return [T, T.phiW];
    }

    // DER GANG DER FRONT EINER ZELLE (brand-feld) zur Uhr t: die Ellipse jedes ihrer Eintritte (`ein`, sonst der EINE Punkt) nach
    // ihrem Bogen — die Einheits-Front der Zelle (`_brandBogen`) × τ·R, nur die Blöcke, deren Kreis die Zelle schneidet. Ohne
    // `stell` → ℓ in m: die Länge ihrer Front, die in der Zelle, auf ihrem Bett (≥ ½) und unverzehrt (`_brandWeg`) liegt. Mit
    // `stell(x, z, s, Rt, lang)` → die Zahl ihrer Flammen: sie stehen, wo die FLAMMEN-ZAHL Φ = τ·R·∫ ds/a ab der Spitze eine ganze
    // Zahl trifft — je Flamme der Abstand ihres Gesetzes (a, mindestens `weit`, das Budget des Bilds), die Spitze trägt die
    // Flamme 0 und steht mit ihr still, wächst die Front, treten neue an der Ferse dazu; die Naht dort hält ≥ a (die zweite
    // Flanke endet ½ Flamme früher). `s` der Bogen ab der Spitze in m (der Takt der Zunge), `stell` → false bricht ab.
    _brandFrontGang(b, t, weit, stell) {
        const [K, B] = [AnazhRealm.LIFE_FIELD.cell, AnazhRealm.BRAND.bild];
        const tau = t - b.t0;
        if (!(tau > 0 && b.R > 0)) return 0;
        const [T, phi] = this._brandBogen(b, weit);
        const [x0, z0, [px, pz], TR, M, Q] = [b.cx * K, b.cz * K, b.kopf, tau * b.R, B.bogenTafel, B.bogenBlock];
        // die Maske des Betts und der verzehrte Weg je Zelle einmal (die Tafel trägt sie, solange Bett und Eintritte bleiben)
        if (T.bettVon !== b.bett) [T.bettVon, T.bett] = [b.bett, this._brandBettFn(b.bett, b.cx, b.cz)];
        if (T.einVon !== b.ein || T.kopfVon !== b.kopf)
            [T.einVon, T.kopfVon, T.weg] = [b.ein, b.kopf, b.ein && this._brandWeg(b, b.ecc, px, pz)];
        const [E, bett, weg, reich] = [b.ein || [b.ex, b.ez], T.bett, T.weg, TR * (1 - b.ecc)];
        const drin = (x, z) => x >= x0 && x < x0 + K && z >= z0 && z < z0 + K;
        const sicht = (x, z) => drin(x, z) && !(bett && bett(x, z) < 0.5) && !(weg && weg(x, z) < reich - 0.01);
        const H = TR * phi[M]; // die Flammen einer Flanke von der Spitze zur Ferse
        const [Tx, Ty, Tr, TL, Ts, kreis] = [T.x, T.y, T.r, T.L, T.s, T.kreis];
        // der heiße Gang ohne Feld-Literale und ohne Winkel-Funktion je Flamme (die Tafel trägt Ort, r und Länge je Ecke, das
        // Stück dazwischen ist 1/`bogenTafel` der Front — die Sehne liegt auf dem Bogen): er läuft je Bild über jede Zelle im Bild
        let aus = 0;
        for (let j = 0; j < E.length; j += 2) {
            const ex = E[j];
            const ez = E[j + 1];
            for (let q = 0; q < M; q += Q) {
                const qe = q + Q < M ? q + Q : M;
                // ein Block ohne ganze Zahl Φ trägt keine Flamme (fern, wo das Budget den Abstand weitet, fast jeder)
                let k = Math.ceil(TR * phi[q]);
                if (stell && k >= TR * phi[qe]) continue;
                const k3 = 3 * (q / Q);
                const mx = ex + TR * (px * kreis[k3] - pz * kreis[k3 + 1]);
                const mz = ez + TR * (pz * kreis[k3] + px * kreis[k3 + 1]);
                const dx = Math.max(x0 - mx, 0, mx - x0 - K);
                const dz = Math.max(z0 - mz, 0, mz - z0 - K);
                const rk = TR * kreis[k3 + 2];
                if (dx * dx + dz * dz > rk * rk) continue;
                for (let i = q; i < qe; i++) {
                    if (!stell) {
                        const x = ex + TR * (px * Tx[i] - pz * Ty[i]);
                        const z = ez + TR * (pz * Tx[i] + px * Ty[i]);
                        if (sicht(x, z)) aus += TR * (Ts[i + 1] - Ts[i]);
                        continue;
                    }
                    const f1 = TR * phi[i + 1];
                    if (k >= f1) continue; // k läuft mit: die nächste ganze Zahl Φ ab diesem Stück
                    const f0 = TR * phi[i];
                    for (; k < f1; k++) {
                        if (k < 0 && -k > H - 0.5) continue;
                        const v = (k - f0) / (f1 - f0);
                        const lx = Tx[i] + (Tx[i + 1] - Tx[i]) * v;
                        const ly = Ty[i] + (Ty[i + 1] - Ty[i]) * v;
                        const x = ex + TR * (px * lx - pz * ly);
                        const z = ez + TR * (pz * lx + px * ly);
                        if (!sicht(x, z)) continue;
                        const Rt = b.R * (Tr[i] + (Tr[i + 1] - Tr[i]) * v); // R(θ) = R·r(θ) der Einheits-Front
                        const s = TR * (Ts[i] + (Ts[i + 1] - Ts[i]) * v - Ts[M / 2]);
                        aus++;
                        if (stell(x, z, s, Rt, TL[i] + (TL[i + 1] - TL[i]) * v) === false) return aus;
                    }
                }
            }
        }
        return aus;
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
        const auge = this._lodAuge(); // das EINE Auge der Stufen
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
        // ein flaches oranges Band.
        const [puls, uhr] = [B.puls, 9.42 * (this._bildZeit || 0)];
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
        // DIE FLAMMEN SIND DIE FRONT DES FELDS (brand-feld): jede Zelle geht die Ellipse jedes ihrer Eintritte nach ihrer BOGENLÄNGE
        // ab (`_brandFrontGang`) und trägt eine Flamme je Abstand ihres Gesetzes — `abstand` × ihre Byram-Länge, mindestens
        // `abstandMinM` —, wo die Front in der Zelle, auf ihrem Bett und unverzehrt liegt: so viele Flammen, wie die Front lang
        // ist. DAS BUDGET IST EIN WINKEL: trägt die Front aller Zellen im Bild mehr als `flammenMax` (die Schranke Σ Eintritte ×
        // min(Umfang, 4 Kanten) ÷ `abstandMinM`), misst der Gang ihre Längen ℓ in der Zelle, und der Abstand wächst je Zelle mit
        // ihrem Abstand zum Auge, ψ·d, ψ = Σ ℓ/d ÷ `flammenMax` — der Winkel der Front, den das Auge sieht, gleich auf das Budget
        // verteilt: nah fein, fern grob, jede Zelle mit Front trägt Flammen und Rauch. Bis brand-feld zählte das AUGE die Flammen:
        // je Ellipse N = 96·12 m ÷ d Winkel, mindestens 4 — die Herd-Zelle der Narbe trug 25 Flammen 0,42 m auseinander, fern fiel
        // die Front eines großen Herds auf 4 Punkte je Ellipse
        const fern = (d) => Math.max(d, K / 2); // das Auge in der Zelle sieht ihre Front im Mittel ½ Zelle fern
        let [psi, schranke, gemessen] = [0, 0, Z.length];
        for (const [, b] of Z) {
            const p = (t - b.t0) * b.R * (1 - b.ecc);
            const [a, c] = [p / (1 - b.ecc * b.ecc), p / Math.sqrt(1 - b.ecc * b.ecc)];
            const umfang = Math.PI * (3 * (a + c) - Math.sqrt((3 * a + c) * (a + 3 * c))); // Ramanujan
            schranke += (((b.ein ? b.ein.length : 2) / 2) * Math.min(umfang, 4 * K)) / B.abstandMinM;
            if (schranke > B.flammenMax) break;
        }
        const laenge = this._brandLaengen || (this._brandLaengen = []);
        if (schranke > B.flammenMax) {
            // ℓ je Zelle einmal je `schrittS` der Welt-Uhr, gemessen zur Mitte der Spanne, die es trägt (die Kosten trägt die
            // Änderung, Gebot 7, wie der Strom der Fahne), die Sekunden der Zellen versetzt (je Bild messen wenige, nie alle
            // zugleich) — je Bild wiegt nur der Abstand zum Auge neu
            const S = AnazhRealm.BRAND.schrittS;
            let n = 0;
            for (gemessen = 0; gemessen < Z.length && n < B.zellenMax; gemessen++) {
                const b = Z[gemessen][1];
                if (!(t >= b.laengeVon && t < b.laengeVon + S)) {
                    const fase = (S * ((((b.cx * 7 + b.cz * 13) % 16) + 16) % 16)) / 16; // die Sekunde der Zelle beginnt versetzt
                    const von = Math.floor((t - fase) / S) * S + fase;
                    [b.laenge, b.laengeVon] = [this._brandFrontGang(b, (t + von + S) / 2, 0, null), von];
                }
                if ((laenge[gemessen] = b.laenge) > 0) (n++, (psi += b.laenge / fern(Z[gemessen][0])));
            }
            psi /= B.flammenMax;
        }
        for (let iz = 0; iz < gemessen; iz++) {
            if (fl.length >= B.flammenMax || qu.length >= B.zellenMax) break;
            if (psi > 0 && !(laenge[iz] > 0)) continue;
            const [d, b] = Z[iz];
            const [xc, zc] = [(b.cx + 0.5) * K, (b.cz + 0.5) * K];
            const w = wind(xc, zc);
            const u = w.ms * B.flammenWind;
            const n0 = fl.length;
            this._brandFrontGang(b, t, psi * fern(d), (x, z, s, Rt, lang) => {
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
                return fl.length < B.flammenMax;
            });
            if (fl.length > n0) {
                // `holz`: was die Front der Zelle seit ihrem letzten Bild verzehrte (kg) — ihr Rauch. Ihr Strom (`_brandStrom`, kg/s),
                // gemessen einmal je `schrittS` der Welt-Uhr zur Mitte dieser Sekunde (die Kosten trägt die Änderung, Gebot 7), mal
                // die Spanne an der Uhr der WELT, die die Front treibt — nie am Takt des Bilds. Tritt die Zelle neu ins Bild, zählt
                // die letzte Sekunde (höchstens seit ihrem Zünden) mit dem Strom zu deren Mitte: Rauch von früher bringt sie nicht mit.
                const S = AnazhRealm.BRAND.schrittS;
                if (!(t < b.stromBis)) [b.strom, b.stromBis] = [this._brandStrom(b, t + S / 2), t + S];
                const neu = !(t - b.rauchT <= S);
                const seit = neu ? Math.max(b.t0, t - S) : b.rauchT;
                qu.push({
                    b,
                    von: n0,
                    bis: fl.length,
                    holz: (neu ? this._brandStrom(b, (seit + t) / 2) : b.strom) * (t - seit),
                });
                b.rauchT = t;
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

    // DIE FAHNE DES BRANDS (`_brandBild`): `qu` die glühenden Zellen mit ihren Flammen [von, bis) im Bild und dem Holz, das ihre
    // Front seit ihrem letzten Bild verzehrte (`holz` kg). Je Zelle und Sekunde `rauch.jeS` × Glut Ballen an einer ihrer Flammen (der Same ist
    // der Zähler der Fahne, kein Zufall der Bild-Uhr), höchstens `rauch.max` im Himmel (der älteste weicht dem neuen); jeder
    // steigt, wächst, verdünnt und zieht (`_windAt` am Ballen, zur Welt-Uhr wie die Front, die ihn trägt, in seiner Höhe über
    // dem Fuß seiner Flamme: `_rauchWindAt`).
    // DER BALLEN TRÄGT DIE MASSE SEINES RAUCHS (same.physik.reaktion#1, `_brandMasse`): was die Front seit dem letzten verzehrte,
    // ohne die Asche (`m` kg). Sichtbar ist sein Schwebstoff (`BRAND.partikel`: `jeKg` kg je kg verbranntem Holz, mit dem
    // Auslösch-Querschnitt `km` m² je kg): die optische Dicke über seine Fläche ist km × Schwebstoff — im Maß des Rauch-Bilds
    // (`_rauchStoff`: τ im Kern, die Dicke (1 − ρ²)^profil) steht im Kern τ = `tr2` ÷ r², tr2 = km × Schwebstoff × (profil + 1)
    // ÷ π. Seine Deckung ist 1 − e^(−τ) (Beer-Lambert) und fällt im Wachsen mit 1 ÷ r²: der Ballen verdünnt, er verliert und
    // erfindet keinen Rauch. Ein frischer Ballen deckt höchstens `a0` — trägt er mehr, ist er größer (dieselbe Masse über
    // mehr Fläche) — und mindestens die Geburt (`aGeburt`) — trägt er weniger, ist er kleiner (dieselbe Masse über weniger
    // Fläche): DER RAUCH STEIGT, WENN ER ENTSTEHT. Bis front-stoff wartete ein Ballen unter der Geburt auf den nächsten, und
    // seine Masse mit ihm: mit der Flammen-Länge × `kMax` als Maß schob ein Herd aus 25 Zellen seinen Rauch ~4 s vor sich her,
    // ein Herd aus 3 Zellen ~0,5 s, im Gleichtakt aller Zellen (same.physik.reaktion#1 an der Radeon 5b36f69a: τ·A je kg Holz
    // im Fenster von 6 s 72,6 · 79,4 · 76,1 · 66,2 m² über 1 · 3 · 9 · 25 Zellen — rauch_prop_abw_pct 10,018). DER TAKT JE ZELLE
    // beginnt an ihrer eigenen Phase (der Hash ihrer Lage): Zellen, die zugleich fingen, stoßen ihre Ballen nie im Gleichtakt
    // aus. Bis front-brand deckte jeder Ballen jeder Last anfangs `a0` und
    // verdünnte mit b0 ÷ s: ein dünnes Bett rauchte wie ein dichtes, und im Steigen wuchs der Rauch.
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
        const [B, W] = [AnazhRealm.BRAND, AnazhRealm.RAUCH_BILD];
        const [optik, tau0] = [(B.partikel.km * B.partikel.jeKg * (W.profil + 1)) / Math.PI, -Math.log(1 - R.a0)];
        // geboren wird ein Ballen zwischen Tod und Kappe (das geometrische Mittel von `aKill` und `a0`): an der Schwelle
        // selbst verdünnte ihn sein erstes Bild unter die Sicht — er stürbe, ehe ihn ein Auge sah, und sein Rauch mit ihm
        const aGeburt = Math.sqrt(R.aKill * R.a0);
        const tauG = -Math.log(1 - aGeburt);
        for (const q of qu) {
            const b = q.b;
            const voll = R.jeS * b.glut;
            const rate = Math.min(voll, anteil);
            const k = rate > 0 ? Math.min(R.kMax, Math.sqrt(voll / rate)) : 1;
            // DIE SCHULD DER MASSE (`rauchKg`): das Holz, das die Front seit dem letzten Ballen verzehrte (`holz` je Bild, gezählt an
            // der Uhr der Welt). Der nächste Ballen nimmt sie ganz mit. Der Takt der Ballen beginnt an der Phase der Zelle.
            b.rauchKg = (b.rauchKg || 0) + q.holz;
            if (b.rauchSchuld === undefined)
                b.rauchSchuld = ((Math.imul(b.cx, 73856093) ^ Math.imul(b.cz, 19349663)) >>> 0) / 4294967296;
            b.rauchSchuld += rate * s;
            for (; b.rauchSchuld >= 1; b.rauchSchuld--) {
                const holz = b.rauchKg / Math.floor(b.rauchSchuld); // die Schuld teilt sich auf die Ballen dieses Bilds
                const [m, tr2] = [holz * (1 - B.mineral.gesamt), holz * optik];
                if (!(tr2 > 0)) continue; // kein Holz, kein Rauch
                const h = Math.imul(++st.brandRauch.n, 2654435761) >>> 0;
                const f = fl[q.von + (h % (q.bis - q.von))];
                // der Ballen entsteht ÜBER der Spitze seiner Flamme (sein Fuß an ihr): bis front-brand lag seine Mitte an der
                // Spitze — mit dem Radius `b0` × Länge hüllte er die Flamme ein, die ihn trägt (am Tag ein graues Knäuel). Seine
                // Größe hält die Deckung zwischen der Geburt und der Kappe
                const b0 = Math.min(
                    Math.max(R.b0 * f.lang * k, Math.sqrt(tr2 / tau0) / R.size),
                    Math.sqrt(tr2 / tauG) / R.size
                );
                const a = 1 - Math.exp(-tr2 / (R.size * b0) ** 2);
                b.rauchKg -= holz;
                if (T.length >= R.max) T.shift(); // die ältesten Ballen verwehen, der Fuß der Fahne bleibt dicht
                const y = f.y + f.lang + b0 * R.size;
                T.push({
                    x: f.x,
                    y,
                    z: f.z,
                    y0: y,
                    g: f.y, // der Fuß seiner Flamme: die Höhe über Grund, in der der Wind ihn trägt (`_rauchWindAt`)
                    b0,
                    s: b0,
                    w: Math.min(R.wMax, Math.cbrt((9.81 * f.I * 1000) / (1.2 * 1005 * 300))),
                    m,
                    tr2,
                    a,
                    alt: 0,
                });
            }
        }
        const RW = this._brandRauchWind || (this._brandRauchWind = {});
        for (let k = T.length - 1; k >= 0; k--) {
            const p = T[k];
            const w = this._rauchWindAt(p.x, p.z, st.spielZeit, p.y - p.g, wind(p.x, p.z), RW); // der Wind in seiner Höhe
            p.y += p.w * s;
            p.x += w.x * w.ms * s;
            p.z += w.z * w.ms * s;
            [p.zx, p.zy, p.zz] = [w.x * w.ms, p.w, w.z * w.ms]; // sein Zug in m/s (`_rauchZeichnen`)
            p.alt += s;
            p.s = p.b0 + R.alpha * (p.y - p.y0);
            p.a = 1 - Math.exp(-p.tr2 / (R.size * p.s) ** 2);
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

    // ═══ DIE DRUCKWELLE (same.physik.reaktion#2) ═══
    // EIN STOFF, DESSEN ZEILE q TRÄGT, SETZT IM FEUER SCHLAGARTIG UM (schmiede `STOFF_GESETZ`, die Spalte q in J/kg): seine Masse
    // mal q ist die Energie der Welle. Ihr Gesetz steht im Kern neben der Trag-Spannung (`druckwelle`: Überdruck, Impuls, Dauer
    // und Ankunft je Abstand; `plattenLast`: die Platte unter ihr); hier stehen der Auslöser (`_ladungZuenden`: das Feuer
    // erreicht die Ladung), der EINE Schreiber (`_druckWelle`) und sein Takt (`_tickDruck`: jeder Körper wird zu SEINER Ankunft
    // getroffen, die Front läuft). Die Leser sind die, die es gab: das Werk bricht über den EINEN Einsturz (`_werkBricht`,
    // still: die Welle nennt ihn), der freie Körper, das Tier, der Spieler und der Wagen tragen den Stoß des EINEN Impuls-Gesetzes
    // (`_stossAuf`, durch den Schwerpunkt), das Ohr hört den Knall (`_substanzKlang`). Bis hier brannte jedes Fass wie das Gras
    // daneben: der Stamm trug 0 Treffer „druck", die Spalte σ_B der Stoff-Zeile hatte keinen Leser.

    // DIE LADUNG EINES BAUS: seine Teile aus einem Stoff, dessen Zeile q trägt — je Bauplan gemerkt (die Teile selbst; Volumen,
    // ρ und q liest `_ladungJ` beim Umsatz). Wer eine trägt, steht im Verzeichnis unter „ladung" (`_blockerNamen`): der
    // Auslöser fragt nur sie. Das Verzeichnis fragt nur, OB ein Teil q trägt — es baut keine Gestalt (das Volumen einer Form
    // ist ihr Netz, `_teilVolumen`; die Stoff-Wand nannte den Weg vom Netz der Blocker zum Netz-Bau beim Namen).
    _ladungTeile(entry) {
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        if (!bp || !Array.isArray(bp.parts)) return AnazhRealm.DRUCK.keine;
        const memo = this._ladungMemo || (this._ladungMemo = new WeakMap());
        let T = memo.get(bp);
        if (!T) {
            T = [];
            const M = this.state.materials || {};
            for (const p of bp.parts) {
                const z = p && M[p.material] ? this._stoff(p.material) : null;
                if (z && z.q > 0) T.push(p);
            }
            if (!T.length) T = AnazhRealm.DRUCK.keine;
            memo.set(bp, T);
        }
        return T;
    }

    // DIE ENERGIE EINER LADUNG (J): Σ über ihre Teile Volumen × Skala³ × ρ × q — beide Zahlen aus der Zeile des Stoffs (`_stoff`).
    _ladungJ(entry) {
        const s = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        let j = 0;
        for (const p of this._ladungTeile(entry)) {
            const z = this._stoff(p.material);
            if (z && z.q > 0 && z.rho > 0) j += this._teilVolumen(p) * s * s * s * z.rho * z.q;
        }
        return j;
    }

    // DAS FEUER ERREICHT EINE LADUNG: fängt die Zelle (cx, cz) zur Zeit t am Punkt (ex, ez), trägt jede Ladung auf ihr die Frist,
    // zu der die Front ihren Ort erreicht (`zeit(x, z)` s nach t: die Ellipse der Zelle, `_brandZuenden`); die Ladung, deren
    // Hülle der Funke selbst berührt (bis `DRUCK.funkeM`), setzt zur Zeit t um — auch auf einer Zelle ohne Bett (`zeit` null:
    // dort erreicht das Feuer sonst keine). Die frühere Frist gewinnt. → die Zahl der neuen Fristen. Ohne Ladung in der Welt
    // kostet die Frage einen Blick ins Verzeichnis (`_blockerUmPlatz` mit Namen).
    _ladungZuenden(cx, cz, t, ex, ez, zeit) {
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const L = this._ladungAus || (this._ladungAus = []);
        L.length = 0;
        this._blockerUmPlatz((cx + 0.5) * cs, (cz + 0.5) * cs, cs / 2, L, "ladung");
        let n = 0;
        for (const e of L) {
            if (!e.position) continue;
            const [x, z] = [e.position.x, e.position.z];
            const amFunken = Math.hypot(x - ex, z - ez) <= (e._blockerReach || 0) + AnazhRealm.DRUCK.funkeM;
            if (!amFunken && !(zeit && Math.floor(x / cs) === cx && Math.floor(z / cs) === cz)) continue;
            const frist = amFunken ? t : t + zeit(x, z);
            if (e._ladungFrist != null && e._ladungFrist <= frist) continue;
            e._ladungFrist = frist;
            (this._druckFristen || (this._druckFristen = [])).push({
                t: frist,
                ladung: e,
                zelle: amFunken ? null : cx + "," + cz,
            });
            n++;
        }
        L.length = 0;
        return n;
    }

    // DIE LADUNG SETZT UM (ihre Frist ist da): sie verlässt die Welt ohne Stimme, ihre Energie ist die Welle an ihrem Ort
    // (`_druckWelle`, zur Zeit der Frist; die Welle nennt sie im Journal, wenn sie verklungen ist — `_druckEnde`). Nichts
    // geschieht, wenn eine frühere Frist sie schon umsetzte, das Werk die Welt vorher verließ, die Zelle erlosch, bevor ihre
    // Front die Ladung erreichte (der Regen), oder die Ladung die Zelle vorher verließ (eine andere Welle stieß sie fort).
    _ladungUmsatz(f) {
        const e = f.ladung;
        if (e._ladungFrist !== f.t) return;
        e._ladungFrist = null;
        if (!this.state.architectures.includes(e)) return;
        if (f.zelle) {
            const z = this.state.brandFeld && this.state.brandFeld.get(f.zelle);
            if (!z || z.t0 === null) return;
            const cs = AnazhRealm.LIFE_FIELD.cell;
            if (Math.floor(e.position.x / cs) + "," + Math.floor(e.position.z / cs) !== f.zelle) return;
        }
        const energieJ = this._ladungJ(e);
        if (!(energieJ > 0)) return;
        const K = e._frei;
        const b = e.blockerAABBs && e.blockerAABBs[0];
        const ort = K
            ? { x: K.p[0], y: K.p[1], z: K.p[2] }
            : { x: e.position.x, y: b ? (b.botY + b.topY) / 2 : e.position.y, z: e.position.z };
        const bp = this.state.blueprints[e.type];
        const name = AnazhRealm._namensKopf((bp && bp.label) || e.type);
        this.removeArchitecture(e, { still: true });
        this._druckWelle(ort, energieJ, f.t, { name, type: e.type, id: e.id });
        if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
    }

    // DIE LUFT DER WELLE: die Dichte des Fahr-Kerns (vehicle `FAHR.luft.rho`, der Wind an der Flanke liest dieselbe) und die
    // Schallgeschwindigkeit des Klang-Kerns (klang `FAHRT_OHR.c`, der Doppler liest dieselbe) — der Ruhedruck folgt im Gesetz.
    _druckLuft() {
        if (this._druckLuftMemo) return this._druckLuftMemo;
        const V = globalThis.__vehicleCore;
        const rho = V && V.FAHR && V.FAHR.luft ? V.FAHR.luft.rho : NaN;
        const c = AnazhRealm._umweltGesetz().kern.FAHRT_OHR.c;
        if (!(rho > 0) || !(c > 0)) AnazhRealm._kernPflichtBruch("vehicle:FAHR.luft.rho · klang:FAHRT_OHR.c");
        return (this._druckLuftMemo = Object.freeze({ rho, c }));
    }

    // DER EINE SCHREIBER DER DRUCKWELLE: die Energie `energieJ` setzt am Ort `ort` zur Welt-Zeit `uhr` um. Das Gesetz gibt je
    // Abstand Überdruck, Impuls, Dauer und Ankunft; getroffen wird, was im Radius der Welle steht (`druckRadius`: bis ihr
    // Überdruck unter das Ende des Gesetzes fällt) — jeder Körper zu SEINER Ankunft (`_tickDruck`), nie alle im Bild der
    // Zündung: ein freier Körper, ein Werk, dessen Form seine Teile sind (`_werkAusTeilen`), ein Wagen, jedes Tier, der
    // Spieler; das Ohr hört sie auch jenseits ihres Radius (der Kern des Klangs urteilt, ob sie noch hörbar ist). Gewachsenes
    // und Studio-Werke stehen (ihr Stoff trägt keine Platte, die das Gesetz bricht). Die Kosten trägt die Zündung einmal: je
    // Eintrag im Radius ein Blick auf seinen Bauplan (gemerkt), je getroffenem Körper EINE Frist. `wer` ({ name, type, id }): was
    // umsetzte — die Welle nennt es im Journal mit dem, was sie brach, sobald ihre letzte Frist fiel (`_druckEnde`: EIN Satz je
    // Welle, nie einer je Werk). → die Welle { energieJ, radius, treffer, offen, werke, teile }.
    _druckWelle(ort, energieJ, uhr = this.state.spielZeit, wer = null) {
        const SG = globalThis.__schmiedeCore.STOFF_GESETZ;
        const luft = this._druckLuft();
        const radius = SG.druckRadius(energieJ, luft);
        if (!(radius > 0)) return null;
        const st = this.state;
        const F = this._druckFristen || (this._druckFristen = []);
        // das Bild der Welle (`_tickHalmWelle` → `_halmWelle`: der Halm liest sie im Wind-Term): W^(1/3) und die Welt-Zeit, zu
        // der ihr letzter Halm steht — Ankunft und Dauer an ihrem Radius + die Ruhe des Halms (`_halmZahlen`)
        const rand = SG.druckwelle(energieJ, radius, luft);
        const welle = {
            x: ort.x,
            y: ort.y,
            z: ort.z,
            energieJ,
            uhr,
            radius,
            luft,
            wer,
            treffer: 0,
            offen: 0,
            werke: 0,
            teile: 0,
            scherben: 0, // die freien Körper, in die ihre Platten bisher fielen (`_druckWerk`)
            fein: 0, // davon die über dem Kreuz ihrer Platte: der Vorrat der Welle (`DRUCK.scherbenFein`)
            verzug: 0,
            w3: Math.cbrt(rand.W),
            bildEnde: uhr + rand.ankunft + rand.dauer + this._halmZahlen().ruhe,
        };
        (this._druckWellen || (this._druckWellen = [])).push(welle);
        const frist = (art, q, x, y, z) => {
            const [dx, dz] = [x - ort.x, z - ort.z];
            const d = Math.hypot(dx, dz);
            const w = SG.druckwelle(energieJ, Math.hypot(d, y - ort.y), luft);
            F.push({ t: uhr + w.ankunft, art, q, w, nx: d > 1e-6 ? dx / d : 1, nz: d > 1e-6 ? dz / d : 0, welle });
            welle.offen++;
            if (art !== "ohr") welle.treffer++;
        };
        const B = this._druckAus || (this._druckAus = []);
        B.length = 0;
        this._blockerUmPlatz(ort.x, ort.z, radius, B);
        const memo = this._druckArtMemo || (this._druckArtMemo = new WeakMap());
        for (const e of B) {
            if (!e.position) continue;
            const K = e._frei;
            let art = "frei";
            if (!K) {
                const bp = st.blueprints[e.type];
                if (!bp) continue;
                art = memo.get(bp);
                if (art === undefined) memo.set(bp, (art = this._druckArt(e, bp)));
                if (art === "sonst") art = this._fahrStossSatz(e) ? "wagen" : null;
                if (!art) continue;
            }
            const [x, y, z] = K ? [K.p[0], K.p[1], K.p[2]] : [e.position.x, e.position.y, e.position.z];
            if (Math.hypot(x - ort.x, z - ort.z) > radius + (e._blockerReach || 0)) continue;
            frist(art, e, x, y, z);
        }
        B.length = 0;
        for (const c of st.creatures || []) {
            if (!c || !c.position || Math.hypot(c.position.x - ort.x, c.position.z - ort.z) > radius) continue;
            frist("leib", c, c.position.x, c.position.y, c.position.z);
        }
        const pm = st.playerMesh;
        if (pm && pm.position) {
            const p = pm.position;
            if (Math.hypot(p.x - ort.x, p.z - ort.z) <= radius) frist("leib", pm, p.x, p.y, p.z);
            frist("ohr", null, p.x, p.y, p.z);
        }
        welle.staub = this._druckStaub(welle); // der Staub, den sie aus der Asche hebt (die Saat ihrer Ballen)
        if (!welle.offen) this._druckEnde(welle);
        return welle;
    }

    // DAS KORN DER ASCHE (m): was vom Halm bleibt — sein Mineral-Anteil (`BRAND.mineral.gesamt`) in der Dichte der Asche (die
    // Zeilen gras und asche des Stoff-Gesetzes), in jeder Richtung gleich geschrumpft: d · ∛(Anteil · ρ_gras ÷ ρ_asche), d die
    // Dicke des Halms (seine Körnung, 4 ÷ σ des Betts): 0,348 mm → 0,111 mm — zwischen feinem Sand und Schluff, wo die Asche
    // des Waldbrands im Median liegt (Gabet & Bookter 2011). Keine eigene Zahl, kein Merker: wer eine der Zeilen ändert,
    // ändert das Korn.
    _ascheKorn() {
        const [halm, z] = [this._stoff("gras"), globalThis.__schmiedeCore.STOFF_GESETZ.zeile("asche")];
        const d = halm.koernung * Math.cbrt((AnazhRealm.BRAND.mineral.gesamt * halm.rho) / z.rho);
        if (!(d > 0)) AnazhRealm._kernPflichtBruch("STOFF-TAFEL gras.koernung · schmiede:STOFF_GESETZ asche.rho");
        return d;
    }

    // DER STAUB DER WELLE (druckwelle-bild, `_druckWelle` ruft): wo die Welle die Asche-Decke löst (schmiede `staubLast`: ihr
    // Überdruck trägt σ_B der Zeile asche — an diesem Radius endet der Staub) und ihr Wind das Korn trägt, hebt es sich. Die
    // Grasnarbe hält (Faser), die Krume rollt (ihr Korn sinkt schneller, als der Wind es trägt): Staub gibt die NARBE DES
    // BRANDS. Gelesen wird nur, wo eine Zelle brannte oder brennt (`_brandZellen`, sie und ihre acht Nachbarinnen: die Narbe
    // reicht bis an deren Mitten): je Punkt des Rasters `staub.rasterM` die Narbe an ihrer Quelle (`_brandNarbeFn`: Anteil ×
    // Asche — nie die gemalte Karte, die der Front nachläuft) und das Gesetz an seinem Abstand. Der Punkt gibt die Masse
    // seiner Fläche als EINEN Ballen — last × Decke × Raster², höchstens die Asche eines vollen Betts (seine Last × der
    // Mineral-Anteil) —, um den Luft-Weg seines Korns versetzt, geboren, wenn der Puls über ihm verklungen ist (Ankunft +
    // Dauer). Sein Radius ist die Wolke seines Korns, mindestens der Kreis seiner Fläche (Raster² ÷ π: er steht für seinen
    // Flecken, die Säule über dem Boden stimmt); deckt er frisch unter `aKill`, wird er nicht gesät. Höchstens `staub.max`
    // Ballen je Welle: darüber fällt die Ferne in Flecken des doppelten Rasters zusammen (die Masse bleibt, der ferne Ballen
    // steht für den größeren Flecken und zeichnet ihn höher, als sein Schleier liegt). Die Kosten trägt die Zündung einmal: je
    // Zelle im Radius ein Blick in den Speicher, je Punkt einer Narbe die Narbe, je Ballen der gezeichnete Boden. → die Zahl
    // der gesäten Ballen (`druckStaub.saat`, nach ihrer Zeit; `_druckBild` gebiert).
    _druckStaub(welle) {
        const [SG, D, cs, S] = [
            globalThis.__schmiedeCore.STOFF_GESETZ,
            AnazhRealm.DRUCK.staub,
            AnazhRealm.LIFE_FIELD.cell,
            this.state.druckStaub,
        ];
        const z = SG.zeile("asche");
        const rand = SG.druckRadius(welle.energieJ, welle.luft, z.sigB);
        if (!(rand > 0)) return 0;
        const zelle = this._brandZellen();
        const [c0, c1] = [(v) => Math.floor((v - rand) / cs), (v) => Math.floor((v + rand) / cs)];
        const narben = [];
        for (let cz = c0(welle.z); cz <= c1(welle.z); cz++)
            for (let cx = c0(welle.x); cx <= c1(welle.x); cx++) {
                let nah = false;
                for (let k = 0; k < 9 && !nah; k++) nah = !!zelle(cx + (k % 3) - 1, cz + Math.floor(k / 3) - 1);
                if (nah) narben.push(cx, cz);
            }
        if (!narben.length) return 0;
        const [narbe, korn, g, bett] = [
            this._brandNarbeFn(zelle),
            this._ascheKorn(),
            D.rasterM,
            this._stoff("gras").brenn,
        ];
        const [vorrat, rMin, optik] = [
            bett.last * AnazhRealm.BRAND.mineral.gesamt,
            g / Math.sqrt(Math.PI),
            (AnazhRealm.RAUCH_BILD.profil + 1) / Math.PI,
        ];
        let neu = [];
        for (let n = 0; n < narben.length; n += 2) {
            const [x0, z0] = [narben[n] * cs, narben[n + 1] * cs];
            for (let j = Math.ceil(z0 / g - 0.5); (j + 0.5) * g < z0 + cs; j++)
                for (let i = Math.ceil(x0 / g - 0.5); (i + 0.5) * g < x0 + cs; i++) {
                    const [x, zz] = [(i + 0.5) * g, (j + 0.5) * g];
                    const d = Math.hypot(x - welle.x, zz - welle.z);
                    if (d > rand) continue;
                    const na = narbe(x, zz);
                    const decke = na ? na.m * na.asche : 0;
                    if (!(decke > 0)) continue;
                    const w = SG.druckwelle(welle.energieJ, d, welle.luft);
                    const s = SG.staubLast(w, z, korn, welle.luft);
                    if (!s) continue;
                    const m = Math.min(s.last, vorrat) * decke * g * g;
                    const tr2 = s.km * m * optik;
                    if (1 - Math.exp(-tr2 / (D.size * Math.max(s.wolke, rMin)) ** 2) < D.aKill) continue; // unter der Sicht: er trüge kein Bild
                    const ab = d > 1e-6 ? (w.weg * s.tempo) / (w.wind * d) : 0; // der Weg seines Korns im Puls, je Meter Abstand
                    neu.push({
                        t: welle.uhr + w.ankunft + w.dauer,
                        d,
                        x: x + (x - welle.x) * ab,
                        z: zz + (zz - welle.z) * ab,
                        m,
                        tr2,
                        b: s.wolke,
                        sink: s.sinken,
                        fl: g * g,
                        i,
                        j,
                    });
                }
        }
        // ÜBER DEM DECKEL FÄLLT DIE FERNE ZUSAMMEN, NIE WEG: die fernsten Ballen fallen in Flecken des doppelten Rasters (Stufe
        // um Stufe, bis der Deckel hält) — Masse, Säule und Schwerpunkt bleiben, die nahen stehen fein (dort trägt die Wolke am
        // höchsten und am längsten). `behalte`: so viele der nächsten bleiben, wie der Deckel mit den Flecken der übrigen trägt.
        neu.sort((a, b) => a.d - b.d);
        for (let stufe = 1; neu.length > D.max; stufe++) {
            const fasse = (ab) => {
                const [M, teil] = [new Map(), 2 ** stufe];
                for (let k = ab; k < neu.length; k++) {
                    const q = neu[k];
                    const key = (Math.floor(q.i / teil) + 32768) * 65536 + Math.floor(q.j / teil) + 32768;
                    const a = M.get(key);
                    if (!a) M.set(key, { ...q });
                    else {
                        const [u, v] = [a.m / (a.m + q.m), q.m / (a.m + q.m)];
                        for (const e of ["t", "x", "z", "b", "sink"]) a[e] = a[e] * u + q[e] * v;
                        [a.m, a.tr2, a.fl] = [a.m + q.m, a.tr2 + q.tr2, a.fl + q.fl];
                    }
                }
                return neu.slice(0, ab).concat([...M.values()]);
            };
            let [behalte, zu] = [0, D.max];
            if (fasse(0).length <= D.max)
                while (behalte < zu)
                    ((m) => (fasse(m).length <= D.max ? (behalte = m) : (zu = m - 1)))((behalte + zu + 1) >> 1);
            neu = fasse(behalte);
            for (const q of neu) q.d = Math.hypot(q.x - welle.x, q.z - welle.z);
            neu.sort((a, b) => a.d - b.d);
        }
        // DER BALLEN STEHT AUF DEM GEZEICHNETEN BODEN (`_bodenSichtAt`, Lehre 22: was auf dem Boden steht, liest das Mesh — die
        // Spalte des Gesetzes, `_voxelSurfaceY`, kostete je Ballen 44 Einheiten, 16 902 für die 384 einer Welle; gate:stand-takt
        // DRUCK-SOLL); wo kein Boden gezeichnet ist (fern, ungebaut), trägt der Staub kein Bild und wird nicht gesät.
        const saat = [];
        for (const q of neu) {
            q.boden = this._bodenSichtAt(q.x, q.z);
            if (q.boden === null) continue;
            q.r = Math.max(q.b, Math.sqrt(q.fl / Math.PI)); // die Wolke seines Korns, mindestens der Kreis seiner Fläche
            saat.push(q);
        }
        if (saat.length) (S.saat.push(...saat), S.saat.sort((a, b) => a.t - b.t));
        return saat.length;
    }

    // DAS BILD DES STAUBS (je Bild, nach `_brandBild`): ohne Saat und ohne Ballen kein Schritt (Ruhe ist Null). Es geht auf der
    // WELT-Uhr wie der Halm unter der Welle (das Standbild der Bühne hält beide an). Fällige Saat wird Ballen: seine Wolke
    // steht auf dem Boden (ihre Mitte einen Wolken-Radius darüber). Er zieht mit dem Wind am Ort, wächst um `alpha` je Meter
    // Zug (die Zahl der Fahne: so mischt die Luft ein) und sinkt mit dem Sink-Tempo seines Korns — die Säule seines Staubs
    // leert sich in den Boden: nach t steht noch der Anteil 1 − sinken · t ÷ (2 · Wolke) in der Luft, ihre Mitte sinkt mit.
    // Seine Deckung ist die des Rauch-Bilds (τ im Kern = `tr2` × Anteil ÷ r², 1 − e^(−τ); `tr2` = km × Masse × (profil + 1)
    // ÷ π): er verdünnt im Wachsen und im Sinken, er erfindet keinen Staub; unter `aKill` endet er — sein Korn liegt wieder.
    // Gezeichnet im EINEN Rauch-Bild (`_rauchZeichnen`, der Satz `druckStaubSatz` in der Albedo der Asche des Bodens,
    // `BODEN_FARBE.asche`; sein Muster zieht mit dem Sink-Tempo durch die Ballen).
    _druckBild() {
        const st = this.state;
        const S = st.druckStaub;
        const T = S.teilchen;
        if (!S.saat.length && !T.length) return;
        const [D, R, jetzt] = [AnazhRealm.DRUCK.staub, AnazhRealm.BRAND.bild.rauch, st.spielZeit];
        const s = S.uhr === null ? 0 : Math.min(Math.max(0, jetzt - S.uhr), 0.1);
        S.uhr = jetzt;
        let k = 0;
        for (; k < S.saat.length && S.saat[k].t <= jetzt; k++) {
            const q = S.saat[k];
            if (T.length >= D.max) T.shift();
            S.sink = q.sink;
            T.push({
                x: q.x,
                y: q.boden + q.b,
                z: q.z,
                boden: q.boden,
                b: q.b,
                s: q.r,
                m: q.m,
                tr2: q.tr2,
                sink: q.sink,
                a: 0,
                alt: 0,
            });
        }
        if (k) S.saat.splice(0, k);
        for (let i = T.length - 1; i >= 0; i--) {
            const p = T[i];
            const w = this._rauchWindAt(p.x, p.z, jetzt, p.y - p.boden); // der Wind in seiner Höhe über dem Boden
            const zug = w.ms * s;
            p.x += w.x * zug;
            p.z += w.z * zug;
            p.s += R.alpha * zug;
            p.alt += s;
            const rest = 1 - (p.sink * p.alt) / (2 * p.b); // der Anteil seiner Säule, der noch in der Luft steht
            p.y = p.boden + p.b * Math.max(0, rest);
            [p.zx, p.zy, p.zz] = [w.x * w.ms, -p.sink / 2, w.z * w.ms]; // sein Zug in m/s (`_rauchZeichnen`)
            p.a = rest > 0 ? 1 - Math.exp((-p.tr2 * rest) / (D.size * p.s) ** 2) : 0;
            if (p.a < D.aKill) T.splice(i, 1);
        }
        if (typeof THREE === "undefined") return; // ohne Bühne kein Bild (`_rauchZeichnen` zeichnete nichts)
        if (!this._staubSatzG) {
            const c = AnazhRealm.BODEN_FARBE.asche;
            this._staubSatzG = Object.freeze({
                size: D.size,
                a0: R.a0,
                aKill: D.aKill,
                color: new THREE.Color().setRGB(c[0], c[1], c[2]),
                name: "druck-staub",
                inventar: "druck",
            });
        }
        this._rauchZeichnen(this._staubSatzG, T, "druckStaubSatz", D.max, S.sink);
        if (!T.length && !S.saat.length) S.uhr = null;
    }

    // DIE WELLE IST VERKLUNGEN (ihre letzte Frist fiel): setzte eine Ladung um (`wer`), nennt das Journal sie EINMAL — mit den
    // Teilen und Werken, die die Welle brach. Im ersten Lauf (GTX 1050, ein Fass vor 78 Probe-Fenstern) schrieb jedes der 52
    // gebrochenen Werke seinen eigenen Satz.
    _druckEnde(welle) {
        const wer = welle.wer;
        if (!wer) return;
        // die Zeile der Tafel steht AM Ruf (die Wand der Erinnerung liest sie dort, gate:v1-pfad FEIND: ein Name reist als Wert
        // seiner Zeile, nie in einem fertigen Text, den eine Variable trägt)
        this.journalAppend(
            "loss",
            welle.teile
                ? ["journal.ladung-bruch", { name: wer.name, teile: welle.teile, werke: welle.werke }]
                : ["journal.ladung", { name: wer.name }],
            {
                type: wer.type,
                id: wer.id,
                energieJ: Math.round(welle.energieJ),
                treffer: welle.treffer,
                werke: welle.werke,
                teile: welle.teile,
            }
        );
    }

    // Was ein Bau unter der Welle ist (je Bauplan gemerkt): „werk" (seine Form sind seine Teile: die Platten brechen), „sonst"
    // (ein Studio-Werk — steht; trägt es einen Fahr-Satz, ist es ein Wagen und wird gestoßen) oder null (Gewachsenes steht).
    _druckArt(e, bp) {
        if (this._istNatur(e)) return null;
        return this._werkAusTeilen(e, bp) ? "werk" : "sonst";
    }

    // DER TAKT DER WELLE: ohne Frist kein Schritt (Ruhe ist Null). Fällig ist, was die Welt-Uhr erreicht hat, in der Folge
    // seiner Zeit — eine Ladung setzt um (`_ladungUmsatz`), ein Körper wird getroffen (`_druckTrifft`); was ein Umsatz an
    // Fristen schreibt, die schon fällig sind (der Körper an der Ladung), fällt im selben Takt.
    // DAS BILD TRÄGT EIN BUDGET IN BRÜCHEN (`DRUCK.bruecheJeBild`), nie in Millisekunden: je Bild fallen Fristen in der Folge
    // ihrer Ankunft, bis so viele Werke getroffen sind (jedes fragt sein Bruch-Gesetz, ob es steht oder bricht; mindestens
    // `DRUCK.mindestJeBild` Fristen), der Rest im nächsten Bild — jede mit den Zahlen des Gesetzes an IHREM Ort; nur ihr
    // Augenblick wartet (`welle.verzug`: der größte Rückstand einer Frist hinter ihrer Ankunft, s Spielzeit). Die Kosten trägt
    // der Einsturz (7,1–7,8 ms je Werk an der GTX 1050; ein Stoß, ein Leib, ein Ohr sind Mikrosekunden). DER RÜCKSTAND HAT EINE
    // GRENZE: über das Budget hinaus fällt je Bild der Anteil der fälligen Fristen, den die älteste schon gewartet hat
    // (Rückstand ÷ `DRUCK.verzugS`) — nach verzugS alles Fällige. EINE LADUNG WARTET NIE: ihr Umsatz fällt im Takt ihrer Frist
    // (wer sie zündet, darf sie danach aus der Welt nehmen — das Brennglas). Vorher fiel jede fällige Frist im selben Bild: ein
    // Fass vor 78 Probe-Fenstern hielt ein Bild 595 ms (GTX 1050, 52 brechende Werke); mit dem Budget allein fiel der letzte
    // Bruch 2,6 s nach seiner Ankunft, und die Bilder der Welle trug zu 48 % der Löser der Scherben, zu 6 % dieser Takt (Profil w9).
    // DIE WANDUHR ENTSCHIED, WAS DIE WELT IST (scherbe-liegt, DRUCK-BUDGET-WANDUHR): bis hier fielen Fristen, bis
    // `performance.now()` 4 ms über dem Anfang des Takts stand — welches Bild ein Fenster brach, hing am Läufer, die Scherben
    // kamen in anderen Schritten zur Welt und schliefen anders (Stand-Takt DRUCK-SCHLAF an ort-ausstattung 4 rot in 2 von 3
    // Versuchen an gleichen Bytes). Das Budget in Brüchen hält das Bild der langsamsten Karte (7,1–7,8 ms je Einsturz > 4 ms:
    // dort trug das alte Budget einen Bruch je Bild) und macht dieselbe Folge der Bilder zur selben Welt auf jedem Gerät.
    _tickDruck() {
        const F = this._druckFristen;
        if (!F || !F.length) return;
        const jetzt = this.state.spielZeit;
        const D = AnazhRealm.DRUCK;
        let brueche = D.bruecheJeBild;
        for (;;) {
            F.sort((a, b) => a.t - b.t);
            let k = 0;
            while (k < F.length && F[k].t <= jetzt) k++;
            if (!k) return;
            const soll = Math.max(D.mindestJeBild, Math.ceil((k * (jetzt - F[0].t)) / D.verzugS));
            // was ein Umsatz schreibt, hängt hinten an (`_druckWelle`): die fälligen Fristen 0…k−1 stehen fest; was wartet,
            // rückt in seiner Folge nach vorn
            let rest = 0;
            for (let i = 0; i < k; i++) {
                const f = F[i];
                if (f.ladung) this._ladungUmsatz(f);
                else if (i < soll || brueche > 0) {
                    if (f.art === "werk") brueche--;
                    f.welle.verzug = Math.max(f.welle.verzug, jetzt - f.t);
                    this._druckTrifft(f);
                    if (--f.welle.offen === 0) this._druckEnde(f.welle);
                } else F[rest++] = f;
            }
            F.splice(rest, k - rest);
            if (rest) return;
        }
    }

    // DIE WELLE TRIFFT (die Frist eines Körpers ist da): das Ohr hört den Knall mit dem Überdruck und der Dauer an seinem Ort,
    // das Werk bricht (`_druckWerk`), jeder andere Körper trägt den Stoß (`_druckStoss`). Wer die Welt seit der Zündung
    // verließ, wird nicht getroffen.
    _druckTrifft(f) {
        const { art, q, w } = f;
        if (art === "ohr") return void this._substanzKlang("knall", { dp: w.dp, dauer: w.dauer });
        const st = this.state;
        if (art === "leib" ? q !== st.playerMesh && !st.creatures.includes(q) : !st.architectures.includes(q)) return;
        if (art === "werk") return void this._druckWerk(q, f.welle);
        this._druckStoss(q, w.impuls, f.nx, f.nz);
    }

    // DER STOSS DER WELLE: ihr Impuls je Fläche (Pa·s) mal der Schattenfläche des Körpers quer zu ihr (`_druckFlaeche`), durch
    // seine Masse — dv längs der Welle durch den SCHWERPUNKT (sie umfließt den Körper: kein Hebel; `_stossAuf` mit `mitte`).
    // Unter `DRUCK.stossMin` ruht er. → dv in m/s (0: kein Teilnehmer des Impuls-Gesetzes oder zu schwach).
    _druckStoss(q, impuls, nx, nz) {
        const K = this._stossKoerper(q, this._druckK || (this._druckK = {}));
        if (!K) return 0;
        const m = K.art === "frei" ? q._frei.m : K.m;
        const dv = (impuls * this._druckFlaeche(K, nx, nz)) / m;
        if (!(dv >= AnazhRealm.DRUCK.stossMin)) return 0;
        this._stossAuf(K, nx, nz, dv, true);
        return dv;
    }

    // DIE SCHATTENFLÄCHE EINES KÖRPERS quer zur Welle (nx, nz), m²: der freie Körper sein Kasten (Σ Fläche × |Achse · n|; die
    // Walze Mantel und Deckel), das Tier die Kapsel seines Rumpfs (`_kreaturLeib`: π r² von vorn, dazu 4·r·halb quer), der
    // Spieler seine Wand-Kapsel (`_spielerKapsel`), der Wagen der Kasten seiner Hülle.
    _druckFlaeche(K, nx, nz) {
        const q = K.q;
        if (K.art === "frei") {
            const B = q._frei;
            const a = (k) => Math.abs(nx * B.R[k] + nz * B.R[6 + k]);
            if (B.kiste) return 4 * (B.hy * B.hz * a(0) + B.hx * B.hz * a(1) + B.hx * B.hy * a(2));
            const c = Math.min(1, a(1));
            return 4 * B.r * B.hy * Math.sqrt(1 - c * c) + Math.PI * B.r * B.r * c;
        }
        if (K.art === "spieler") {
            const k = this._spielerKapsel(this._druckKapsel || (this._druckKapsel = {}));
            return 2 * k.r * (k.y1 - k.y0);
        }
        if (K.art === "tier") {
            const L = this._kreaturLeib(q, 0, this._druckLeib || (this._druckLeib = {}));
            const laengs = Math.min(1, Math.abs(nx * L.fx + nz * L.fz));
            return Math.PI * L.radius * L.radius + 4 * L.radius * L.halb * Math.sqrt(1 - laengs * laengs);
        }
        let A = 0;
        for (const b of q.blockerAABBs || [])
            A = Math.max(A, (b.topY - b.botY) * (Math.abs(nx) * (b.maxZ - b.minZ) + Math.abs(nz) * (b.maxX - b.minX)));
        return A;
    }

    // DIE LAST EINES TEILS UNTER DER WELLE → { last, w, cos } oder null (keine Platte: nur der Quader trägt das Platten-Gesetz;
    // ein Teil ohne Zeile). Der Quader ist die Platte seiner zwei großen Maße, dick sein kleinstes; die Welle am Ort seiner
    // Mitte (`druckwelle`), ihr Überdruck mal |cos| des Winkels zwischen ihr und dem Lot der Platte (frei stehend umfließt die
    // Welle sie: nur der Anteil längs des Lots lastet), `last` = σ ÷ σ_B aus der Zeile des Stoffs (`_stoff`: σ_B, E und ρ —
    // schmiede `plattenLast`); ab 1 bricht sie. Leser: `_druckWerk` und die Linse (gate:gegenstand-stoff `--gesetz`).
    _druckTeilLast(p, e, welle) {
        if (!p || p.shape !== "box" || !p.size) return null;
        const z = p.material ? this._stoff(p.material, "das Teil aus „" + p.material + "“ trägt keine Platte") : null;
        if (!z) return null;
        const SG = globalThis.__schmiedeCore.STOFF_GESETZ;
        const s = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
        const ry = Number.isFinite(e.rotationY) ? e.rotationY : 0;
        const [c, sn] = [Math.cos(ry), Math.sin(ry)];
        const S = [p.size.x * s, p.size.y * s, p.size.z * s];
        const d = S.indexOf(Math.min(...S));
        const lot = new THREE.Vector3(d === 0 ? 1 : 0, d === 1 ? 1 : 0, d === 2 ? 1 : 0);
        const r = p.rotation;
        if (r) lot.applyEuler(new THREE.Euler(r.x || 0, r.y || 0, r.z || 0, "XYZ"));
        const q = p.position || {};
        const [lx, ly, lz] = [(q.x || 0) * s, (q.y || 0) * s, (q.z || 0) * s];
        // die Mitte des Teils in der Welt: die Gier des Werks, sein Fuß ein halber Meter unter `position.y` (`_freiKoerperSetzen`)
        const dx = e.position.x + lx * c + lz * sn - welle.x;
        const dy = e.position.y - 0.5 + ly - welle.y;
        const dz = e.position.z - lx * sn + lz * c - welle.z;
        const R = Math.hypot(dx, dy, dz);
        const w = SG.druckwelle(welle.energieJ, R, welle.luft || this._druckLuft());
        if (!w) return null;
        const [nx, nz] = [lot.x * c + lot.z * sn, -lot.x * sn + lot.z * c];
        const cos = R > 1e-6 ? Math.abs(dx * nx + dy * lot.y + dz * nz) / R : 1;
        const [lang, kurz] = S.filter((_, k) => k !== d).sort((a, b) => b - a);
        return { last: SG.plattenLast(z, lang, kurz, S[d], w.dp * cos, w.dauer), w, cos };
    }

    // DAS WERK UNTER DER WELLE: je Teil die Last seiner Platte (`_druckTeilLast`). Was bricht, zerfällt nach SEINEM Bruch-Gesetz
    // (schmiede `plattenBruch`: der Riss ist die Energie — an der Bruch-Grenze das Kreuz der Mittellinien, vier Stücke; unter
    // mehr Last ein feineres Gitter, die Mitte fein, der Rand grob) in Scherben in seiner Ebene und fällt aus dem Werk — über
    // den EINEN Einsturz (`_werkBricht`, still — die Welle nennt ihn: der Rest steht als Werk weiter und urteilt neu, jede
    // Scherbe ist ein freier Körper) —, und jede Scherbe trägt den Stoß der Welle an ihrem Ort. Bis druckwelle-bild fiel jede
    // Platte in vier gleiche Stücke, die in 6 m wie die an ihrer Grenze in 28 m.
    // DIE WELLE TRÄGT EINEN VORRAT FEINER SCHERBEN (jede ist ein freier Körper des Lösers): das Kreuz trägt jede Platte, wie
    // zuvor; darüber je Platte höchstens `DRUCK.scherbenAchse` Stücke je Achse und je Welle `DRUCK.scherbenFein` Scherben über
    // dem Kreuz (`welle.fein`). Die Fristen fallen in der Reihe ihrer Ankunft: die nahe Scheibe zerspringt fein, ist der Vorrat
    // verbraucht, fällt die ferne gröber, zuletzt in ihr Kreuz — eine Welle kostet den Löser höchstens `scherbenFein` Körper
    // mehr als zuvor, wie viele Werke auch in ihrem Radius stehen. → die Zahl der gebrochenen Teile.
    _druckWerk(e, welle) {
        const g = e._gesetz;
        const bp = (g && g.plan) || this.state.blueprints[e.type];
        if (!bp || !Array.isArray(bp.parts)) return 0;
        const SG = globalThis.__schmiedeCore.STOFF_GESETZ;
        const D = AnazhRealm.DRUCK;
        const teile = bp.parts.slice();
        const frei = [];
        let gebrochen = 0;
        bp.parts.forEach((p, i) => {
            const l = this._druckTeilLast(p, e, welle);
            if (!l || !(l.last >= 1)) return;
            const S = [p.size.x, p.size.y, p.size.z];
            const d = S.indexOf(Math.min(...S));
            const [a, b] = [0, 1, 2].filter((k) => k !== d);
            const B = SG.plattenBruch(
                Math.max(S[a], S[b]),
                Math.min(S[a], S[b]),
                S[d],
                l.last,
                D.scherbenAchse,
                4 + D.scherbenFein - welle.fein
            );
            if (!B) return;
            gebrochen++;
            const [ua, ub] = S[a] >= S[b] ? [B.lang, B.kurz] : [B.kurz, B.lang];
            const n = (ua.length - 1) * (ub.length - 1);
            welle.scherben += n;
            welle.fein += n - 4;
            const r = p.rotation;
            const dreh = r ? new THREE.Euler(r.x || 0, r.y || 0, r.z || 0, "XYZ") : null;
            const q = p.position || {};
            for (let u = 0; u + 1 < ua.length; u++)
                for (let v = 0; v + 1 < ub.length; v++) {
                    const o = new THREE.Vector3();
                    o.setComponent(a, (0.5 * (ua[u] + ua[u + 1]) - 0.5) * S[a]);
                    o.setComponent(b, (0.5 * (ub[v] + ub[v + 1]) - 0.5) * S[b]);
                    if (dreh) o.applyEuler(dreh);
                    const gr = S.slice();
                    gr[a] = (ua[u + 1] - ua[u]) * S[a];
                    gr[b] = (ub[v + 1] - ub[v]) * S[b];
                    const t = JSON.parse(JSON.stringify(p));
                    t.size = { x: gr[0], y: gr[1], z: gr[2] };
                    t.position = { x: (q.x || 0) + o.x, y: (q.y || 0) + o.y, z: (q.z || 0) + o.z };
                    if (u || v) frei.push(teile.push(t) - 1);
                    else frei.push(((teile[i] = t), i));
                }
        });
        if (!gebrochen) return 0;
        const plan = { ...bp, parts: teile }; // der Plan des Einsturzes: eine Kopie mit den geteilten Platten (`_werkBricht` liest label, parts, connections)
        const truemmer = this._werkBricht(e, plan, frei, true) || [];
        welle.werke++;
        welle.teile += gebrochen;
        for (const t of truemmer) {
            const K = t && t._frei;
            if (!K) continue;
            const [dx, dz] = [K.p[0] - welle.x, K.p[2] - welle.z];
            const d = Math.hypot(dx, dz);
            const w = SG.druckwelle(welle.energieJ, Math.hypot(d, K.p[1] - welle.y), welle.luft);
            this._druckStoss(t, w.impuls, d > 1e-6 ? dx / d : 1, d > 1e-6 ? dz / d : 0);
        }
        return gebrochen;
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
    // das Bild (`_brandBild`): bis `weiteM` um das Auge, die Front nach ihrem Bogen gegangen (`_brandFrontGang`: die
    // Einheits-Front in `bogenTafel` Stücken, je `bogenBlock` ein Kreis gegen die Zelle; das Budget weitet ihren Abstand in Stufen
    // von `weitStufe`), je Flamme im Mittel ein Abstand von
    // `abstand` × ihrer Länge (mindestens `abstandMinM`), höchstens `flammenMax` je Bild aus höchstens `zellenMax` Zellen, die
    // nächsten zuerst (ein Brand von 2 000 Zellen kostet das Bild, nie die Welt); die Spitze der Zunge pulst um ± `puls` ihrer Länge; `flammenWind` der Wind auf Flammenhöhe je Wind
    // in 10 m (Albini–Baughman 1979, offenes Gras); die Zunge `breite` × Länge breit, ihre Deckung
    // fällt zur Spitze mit (1 − h)^spitze; ihr Bild `flamme` (`_brandFlammenZeichnen`): die Temperatur `kelvin` [Wurzel, Spitze], `ziel` ihr Ton vor der
    // Tonkurve, ihr Leib trägt im Mittel die Leuchtdichte des Gesetzes (`_flammeOptik`, fachwerk `FEUER_LEUCHTDICHTE` — dieselbe, die `_flammenLicht` wirft), ihr Fall zum Rand (1 − ξ²)^`rand`, die Tafel der Zunge in `tafel` Texeln, das Rausch-Gesetz `rausch` [Skala quer, hoch, Hub], steigend mit `zug` Längen je
    // Sekunde, der Saum gegen die Tiefe `saumM`. Der Rauch: `jeS` Ballen je Zelle und Sekunde bei voller Glut, höchstens `max` (ein
    // großer Brand je Zelle seltener, bis `kMax` × größer), die Ballen beginnen mit `b0` × Flammen-Länge, wachsen um `alpha` je Meter Steigen, decken nach ihrer Masse (`_brandRauch`: frisch höchstens `a0`) und fallen unter
    // `aKill` oder nach `lebenS`; Steigen höchstens `wMax` m/s; der Satz (Ballen, Stoff `color`, Radius je Einheit `size`) zeichnet das
    // EINE Rauch-Bild der Welt (`_rauchZeichnen`, RAUCH_BILD), sein Muster steigt mit `steigMs` m/s
    bild: Object.freeze({
        weiteM: 160,
        bogenTafel: 256,
        bogenBlock: 8,
        weitStufe: 0.05,
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
    // DIE MASSE (`_brandMasse`, same.physik.reaktion#1): das Gitter je Zelle, auf dem das Buch den verzehrten Anteil ihres Betts
    // misst (32² Punkte, ½ m); der Schwebstoff des Rauchs — `jeKg` kg je kg verbranntem trockenem Brennstoff (Andreae & Merlet
    // 2001, Global Biogeochem. Cycles 15: Savanne und Grasland, Gesamt-Schwebstoff 8,3 g/kg) mit dem Auslösch-Querschnitt
    // `km` m²/kg (Mulholland & Croarkin 2000, Fire and Materials 24: 8,7 m²/g für Rauch flammender Verbrennung)
    // `masseWinkel` die Strahlen, in denen `_brandStrom` die Front abtastet (bei der größten Exzentrizität, lbMax 8 → 0,992,
    // auf 0,1 % genau)
    masseGitter: 32,
    masseWinkel: 96,
    partikel: Object.freeze({ jeKg: 0.0083, km: 8700 }),
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

// DIE DRUCKWELLE IM WIRT (same.physik.reaktion#2, `_druckWelle`): das Gesetz und seine Zahlen stehen im Kern (schmiede
// `STOFF_GESETZ.DRUCK`); hier nur, was kein Stoff trägt — `funkeM`: so nah an der Hülle einer Ladung muss der Funke selbst
// liegen, damit sie ohne Front umsetzt (die Länge einer Flamme in der Hand); `stossMin`: ein Stoß unter diesem Tempo (m/s)
// bewegt nichts Sichtbares und fällt; `scherbenAchse` und `scherbenFein`: so fein trägt der Löser der freien Körper den
// Bruch — je Platte höchstens so viele Stücke je Achse, je Welle so viele Scherben über dem Kreuz ihrer Platten (sechs
// Platten ganz fein, je zwölf über dem Kreuz; `_druckWerk` — das Gitter selbst ist Gesetz, schmiede `plattenBruch`).
// GEMESSEN (GTX 1050, Mess-Wiese, die erste Detonation einer frischen Welt, ganze Bilder bis zum Abschluss der GPU, zwei
// Paare Kreuz ↔ fein, vier Scheiben in 6–28 m: 16 ↔ 48 Scherben): die Geburt 0,53 ms je Scherbe über dem Kreuz (die
// sechzehn einer Platte in einem Bild 16–18 ms gegen 9–11 ms); der Löser 0,1 ms je wacher Scherbe und Bild im Flug
// (+3,2 ms je Bild), im Bild des Bruchs bis 20 ms gegen 7,7 ms; das ganze Bild im Bruch (7 Bilder) im Median 93 → 105 ms,
// im Flug (52 Bilder) 65 → 68 ms, danach 54 → 55 ms, bis die Scherben schlafen (Ruhe dieser Messung 56–68 ms); `bruecheJeBild`
// und `mindestJeBild`: so viele Werke trifft ein Bild (`_tickDruck`; das frühere Budget von 4 ms trug an der GTX 1050 genau
// einen Einsturz), und mindestens so viele Fristen;
// `verzugS`: so lange wartet eine fällige Frist höchstens auf dieses Budget (dann fällt sie mit allem, was fällig ist);
// `bildWellen`: so viele Wellen zugleich liest der Halm im Bild (`_halmWelle`, die Slots des Wind-Satzes) — die jüngsten.
// `staub` (`_druckStaub`, `_druckBild`): das Raster `rasterM`, in dem die Welle die Narbe des Brands nach Asche fragt (je Punkt
// ein Ballen: bei 2 m deckt der Kreis seiner Fläche, 1,13 m, die Wolke des Korns bis 3 m ans Fass), höchstens `max` Ballen je
// Welle und im Bild; `aKill`: darunter trägt ein Ballen kein Bild — der Schleier der Asche ist dünn (über dem Boden deckt er
// 1,6–4,2 %, im Ballen 5–12 %), das Auge sieht ihn im Streifblick durch viele: 1 % zählt noch; `size`: Radius je Einheit
// des Satzes. GEMESSEN (GTX 1050, eine Narbe von 3 × 3 Zellen, 383 Ballen im Bild, ein Zustand der Welt mit ↔ ohne Satz):
// +3,5 ms je Bild am Scheitel (41,3 · 41,5 ↔ 37,7 · 38,1 ms) — Füllung; der Halm liest die Welle ohne messbaren Preis
// (Front in 15 m, vier Reihen: 40,8 · 40,0 mit ↔ 40,5 · 40,2 ms ohne).
AnazhRealm.DRUCK = Object.freeze({
    funkeM: 0.5,
    stossMin: 0.05,
    scherbenAchse: 4,
    scherbenFein: 72,
    bruecheJeBild: 1,
    mindestJeBild: 1,
    verzugS: 0.25,
    bildWellen: 4,
    staub: Object.freeze({ rasterM: 2, max: 384, aKill: 0.01, size: 1 }),
    keine: Object.freeze([]),
});
