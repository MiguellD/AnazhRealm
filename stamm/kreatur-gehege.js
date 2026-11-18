class AnazhRealm_kreatur_gehege {
    // ===== ATLAS · Kreatur/gehege — Gehege: fester Bestand als Term des EINEN Verzeichnisses · Zeile des Plans · Rand der Hülle =====
    // ═══ DAS GEHEGE (Pflicht F, der Zoo des Prüfplatzes; tetrapoda GEHEGE_GESETZ: ein Term im EINEN Verzeichnis, nie ein zweites
    // Register) ═══ DIE ZEILEN DER WELT: je Gehege des Ort-Plans (fachwerk `genesisLayout` → `plan.gehege`: Gattung, Kopfzahl,
    // Lager, der Rand als Kasten, die Ruhe-Plätze — plan-lokal) die Zeile des Gesetzes in Welt-Koordinaten (gehegeZeile,
    // fail-closed), je Plan einmal. Ohne Plan und wo die Wildnis den Ort nicht trägt (die Prüfbühne: dort fällt auch der Erdbau
    // des Zoos) keine. Bis w28-gehege trug der Plan das Gehege als Fläche, Graben und Ruhe-Plätze — und kein Tier stand darin.
    _gehegeListe() {
        const plan = this._genesisPlan || null;
        const M = this._gehegeMemo;
        if (M && M.plan === plan) return M.zeilen;
        const o = plan && plan.ort;
        const welt = (q) => [o.x + q.x, o.z + q.z];
        const zeile = (g) => {
            const { cx, cz, phi, ex, ez } = g.rand;
            const [c, s] = [Math.cos(phi), Math.sin(phi)];
            const ecke = (u, v) => welt({ x: cx + u * ex * c + v * ez * s, z: cz - u * ex * s + v * ez * c });
            return AnazhRealm._gehegeGesetz().zeile({
                gattung: g.gattung,
                n: g.n,
                lager: welt(g.lager),
                rand: [ecke(-1, -1), ecke(1, -1), ecke(1, 1), ecke(-1, 1)],
                ruhe: g.ruhe.map(welt),
            });
        };
        const zeilen = plan && this._wildnisTraegt(o.x, o.z) ? plan.gehege.map(zeile) : [];
        return (this._gehegeMemo = { plan, zeilen }).zeilen;
    }
    _gehegeZeile(id) {
        return this._gehegeListe().find((Z) => Z.id === id) || null;
    }
    // DIE TIERE DER GEHEGE im Verzeichnis der Region `key` (dort, wo ihr Platz liegt): wie jedes Tier — die Seele ihrer
    // Gattung, die Größe aus ihrer Nummer (`_creatureBodySize`, das EINE Größen-Gesetz: dieselbe in jedem Boot), Alter 0, der
    // Anker an ihrem Ruhe-Platz, der Verband des Geheges — mit dem Term `gehege` (die Nummer der Zeile; er reist im Stand,
    // `_lebenImStand`). DIE ZEILE IST DER BESTAND: je Region und Plan liest das Verzeichnis sie einmal (`R._gehege`: der Plan
    // kommt aus dem Faden, eine Region liest ihn, sobald er steht) und wieder, sobald es ihre Zahl nicht trägt (`R._gehegeN`) —
    // ein Tier, das dort steht, tritt nie zweimal ein; eines, das fiel (der Feld-Akt „aus“), steht beim nächsten Lesen wieder
    // darin (Alter 0, ohne Stand: sein Leib entsteht an seinem Ruhe-Platz, `_gehegeLeiber`); eines, dessen Zeile der Plan nicht
    // mehr trägt, verlässt das Verzeichnis (sein Leib geht, sobald er außer Blick steht, `_ohneTier`). Ohne Plan bleibt, was der
    // Stand trug. Bis hierher trat die Zeile je Sitzung einmal ein: ein gefallenes Tier fehlte bis zum nächsten Laden.
    _gehegeEinsetzen(key, R) {
        const zeilen = this._gehegeListe();
        if (R._gehege === zeilen) {
            let n = 0;
            if (R._gehegeN) for (const t of R.tiere) if (t.gehege) n++;
            if (n === R._gehegeN) return;
        } else if (!this._genesisPlan) return;
        [R._gehege, R._gehegeN] = [zeilen, 0];
        const GG = AnazhRealm._gehegeGesetz();
        let anders = 0;
        for (const t of R.tiere.filter((o) => o.gehege && !zeilen.some((Z) => Z.id === o.gehege))) {
            if (t.leib) [t.leib.userData._bestand, t.leib.userData._ohneTier, t.leib] = [null, true, null];
            anders += R.tiere.splice(R.tiere.indexOf(t), 1).length;
        }
        for (const Z of zeilen) {
            const soul = AnazhRealm.CREATURE_SOUL_NAMES.find((n) => AnazhRealm.TETRAPODA_SOUL_MAP[n] === Z.gattung);
            if (!soul) return AnazhRealm._kernPflichtBruch("tetrapoda:GATTUNGEN." + Z.gattung + " ohne Seele");
            for (const p of GG.tiere(Z, GG.G)) {
                if (this._bestandKey(p.x, p.z) !== key) continue;
                R._gehegeN++;
                const da = R.tiere.find((t) => t.id === p.id);
                if (da) [da.x, da.z] = [p.x, p.z];
                else {
                    const bs = this._creatureBodySize("g" + p.id);
                    R.tiere.push({
                        id: p.id,
                        soul,
                        g: p.g,
                        bs,
                        alterS: 0,
                        x: p.x,
                        z: p.z,
                        v: "g" + Z.id,
                        gehege: Z.id,
                    });
                    anders++;
                }
            }
        }
        if (anders) this._lebenGen = (this._lebenGen || 0) + 1; // die Marke des Lebens im Stand (`_lebenImStand`)
    }
    // Die Tiere des Geheges Z im Verzeichnis (je Platz die Region, in der er liegt).
    _gehegeTiereVon(Z) {
        const GG = AnazhRealm._gehegeGesetz();
        const tiere = [];
        for (const key of new Set(GG.tiere(Z, GG.G).map((p) => this._bestandKey(p.x, p.z))))
            for (const t of this._bestandRegion(key, false).tiere) if (t.gehege === Z.id) tiere.push(t);
        return tiere;
    }
    // DAS GEHEGE IN DER ZEICHNUNG (`_bestandVerkoerpern`): FÄLLIG ist es nach der EINEN Regel des Plans für seine Bühnen (fachwerk
    // GENESIS_ORT.regel.residentM, wie die Werke des Zoos, `_genesisWerke`): der Spieler steht so nah an seinem Rand — gezeichnet
    // hält es um `GEHEGE_HALT` länger. Ein fälliges zeichnet seine Tiere vor jeder Gruppe, gleich ob seine Region nah ist; ein
    // nicht fälliges belegt keinen Platz der Kappe: seine Leiber gehen als Zahl in ihr Tier zurück, sobald kein Blick sie hält
    // (`_bestandAusserBlick` — auch jenseits ihres Pixel-Horizonts), und kehren mit ihrem Stand an ihren Platz wieder.
    _gehegeGruppen(gruppen, p) {
        const zeilen = this._gehegeListe();
        if (!zeilen.length) return;
        const R = globalThis.__fachwerkCore.GENESIS_ORT.regel.residentM;
        const abstand = AnazhRealm._gehegeGesetz().abstand;
        for (const Z of zeilen) {
            const d = abstand(Z.rand, p.x, p.z);
            if (d > R * (1 + AnazhRealm.GEHEGE_HALT)) continue;
            const tiere = this._gehegeTiereVon(Z);
            if (d <= R || tiere.some((t) => t.leib)) gruppen.set("gehege|" + Z.id, { d: -Infinity, gehege: Z, tiere });
        }
    }
    // EIN TAKT DER GEHEGE der Region R (tetrapoda GEHEGE_GESETZ): je Gehege seine Gemeinschaft — das Altern mit raten.alter, der
    // Tod am Hunger mit raten.hunger (das Älteste), der Riss NUR unter seinen Tieren (`_bestandJagd`, bestandRiss) — aus seinem
    // eigenen Strom dieses Takts (`gehege:<Nummer>@<Zeit>`: ein Wurf im Gehege re-rollt nie den wilden Strom der Region). Geboren
    // wird nie (die Zeile ist der Bestand); unter Raten 0 und ohne Beute ändert der Takt nichts.
    _gehegeSchritt(R, tode) {
        const BG = AnazhRealm._bestandGesetz();
        const G = AnazhRealm._gehegeGesetz().G;
        const je = new Map();
        for (const t of R.tiere) if (t.gehege) je.set(t.gehege, (je.get(t.gehege) || []).concat(t));
        const diet = this._bestandDiet();
        for (const [id, tiere] of je) {
            for (const t of tiere) t.alterS += BG.B.taktS * G.raten.alter;
            const rng = this._faunaRng("gehege:" + id + "@" + R.t, true);
            const lebt = () => tiere.filter((t) => R.tiere.includes(t));
            const alt = G.raten.hunger > 0 && rng() < G.raten.hunger && this._bestandAeltester(tiere);
            if (alt) this._bestandStirbt(R, alt, "hunger", tode);
            const { jaeger, gejagt, beuteVon } = this._bestandJagd(lebt(), diet);
            for (const g in diet) {
                const riss = BG.riss(jaeger[g], gejagt[g] / BG.B.beuteVoll, BG.B);
                const opfer = riss > 0 && rng() < riss && this._bestandAeltester(lebt(), g, beuteVon);
                if (opfer) this._bestandStirbt(R, opfer, "jagd", tode, beuteVon.get(opfer));
            }
        }
    }
    // DAS GEHEGE WIRD GEZEICHNET: jeder fehlende Leib entsteht an seinem Ruhe-Platz — nie im Blick diesseits der Nah-Grenze
    // (`ANALOG_NAH_M`, der Leib als Kugel, `_kreaturLeibImBlick`: kein Tier erscheint vor dem Auge, es wartet, bis der Blick
    // geht), höchstens leiberJeTakt je Takt und nur in freien Platz der Kappe; der Verband bindet die gezeichneten Glieder.
    _gehegeLeiber(fehlt, gruppe) {
        const st = this.state;
        const p = st.playerMesh.position;
        let platz = Math.min(st.maxCreatures - st.creatures.length, AnazhRealm.BESTAND_REGION.leiberJeTakt);
        for (const t of fehlt) {
            if (platz <= 0) break;
            const nah = Math.hypot(t.x - p.x, t.z - p.z) <= AnazhRealm.ANALOG_NAH_M;
            if (nah && this._kreaturLeibImBlick(t.x, t.z, t.g, t.bs)) continue;
            const gY = this.getTerrainHeightAt(t.x, t.z);
            const c = this._bestandLeib(t, t.x, (Number.isFinite(gY) ? gY : p.y) + 1, t.z);
            if (!c) break;
            platz--;
        }
        this._kreaturVerbinden(gruppe.map((t) => t.leib).filter(Boolean));
    }
    // DAS GEHEGE EINES LEIBS — DIE GEMEINSCHAFT: das Tier eines Geheges trägt es im Term; jeder andere Leib (der Spieler, ein
    // freies Tier, ein Gefallener) steht in dem Gehege, dessen Rand ihn umschließt — sonst in der Wildnis (null). Jäger und Beute
    // (`_kreaturIstBeute`), das Aas (`_kreaturAasZug`) und das Lesen des Menschen (`_creatureWarinessSpieler`) fragen sie: nie
    // jagt, frisst, flieht oder naht einer durch den Rand (Hagenbeck: den Gast trennt der Graben — der Wolf jagt ihn nicht und
    // weicht ihm nicht ans ferne Ende; nur der Hieb schreckt ihn).
    _gehegeVon(leib) {
        const t = leib.userData && leib.userData._bestand;
        if (t && t.gehege) return t.gehege;
        const zeilen = this._gehegeListe();
        if (!zeilen.length) return null;
        const drin = AnazhRealm._gehegeGesetz().drin;
        for (const Z of zeilen) if (drin(Z.rand, leib.position.x, leib.position.z)) return Z.id;
        return null;
    }
    // DAS REVIER DES GEHEGE-TIERS IST SEIN GEHEGE (`_kreaturRevier`: der Anker bleibt sein Ruhe-Platz): es trägt jeden Ort, an dem
    // sein persönlicher Raum (`_kreaturRaum`) im Rand steht — dorthin zieht es (`_kreaturWanderZiel`), dort ruht es; die Leine
    // (`_creatureCharacterWander`) reicht vom Anker bis zur fernsten Ecke, nie weiter als die seiner Gattung. Bis w28-gehege legte
    // das Revier den Anker in den Lebensraum der Gattung — jenseits des Rands: das Tier drückte den Tag lang an ihn und ruhte nie.
    _gehegeRevierTraegt(creature, x, z) {
        const Z = this._gehegeZeile(creature.userData.wanderAnchor.gehege);
        const aus = this._gehegeAus || (this._gehegeAus = { x: 0, z: 0 });
        return !!Z && !AnazhRealm._gehegeGesetz().rand(Z.rand, x, z, this._kreaturRaum(creature), aus);
    }
    _gehegeLeine(creature, leash) {
        const t = creature.userData._bestand;
        const Z = t && t.gehege ? this._gehegeZeile(t.gehege) : null;
        if (!Z) return leash;
        let fern = 0;
        for (const e of Z.rand) fern = Math.max(fern, Math.hypot(e.x - t.x, e.z - t.z));
        return Math.min(leash, fern);
    }
    // DER RAND DES GEHEGES in der EINEN Hülle (`_kreaturHuellenKontakt`, tetrapoda gehegeRand): jede der drei Achsen des Leibs
    // bleibt diesseits jeder Kante, der ganze Leib rückt zurück, der Halt merkt die Wand (der Umweg geht längs des Rands) — kein
    // Zaun, kein zweiter Weg.
    _gehegeRandKontakt(creature, L, id) {
        const Z = this._gehegeZeile(id);
        if (!Z) return;
        const rand = AnazhRealm._gehegeGesetz().rand;
        const leib = this._kreaturLeib(creature, L, this._gehegeLeib || (this._gehegeLeib = {}));
        const aus = this._gehegeAus || (this._gehegeAus = { x: 0, z: 0 });
        const p = creature.position;
        for (let o = -1; o <= 1; o++) {
            const off = o * leib.halb;
            if (!rand(Z.rand, p.x + leib.fx * off, p.z + leib.fz * off, leib.rad[o + 1], aus)) continue;
            p.x += aus.x;
            p.z += aus.z;
            const n = leib.hoehe / Math.hypot(aus.x, aus.z); // die Wand jenseits, einen Leib weit draußen
            this._kreaturHaltMerken(creature, aus.x, aus.z, p.x - aus.x * n, p.z - aus.z * n);
        }
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_kreatur_gehege]);

// ===== ATLAS · Kreatur/gehege — Außen-Konstanten =====
// DAS GEHEGE HÄLT (`_gehegeGruppen`): gezeichnet bleibt ein Gehege um diesen Anteil über die Grenze seiner Fälligkeit hinaus
// (fachwerk GENESIS_ORT.regel.residentM) — kein Flattern seiner Leiber, wenn der Spieler an der Grenze steht.
AnazhRealm.GEHEGE_HALT = 0.1;
// DAS GEHEGE (tetrapoda GEHEGE_GESETZ + gehegeZeile · gehegeTiere · gehegeRand · gehegeDrin · gehegeAbstand, w28-gehege): der
// Term des Bestands — die Zeile des Plans, der feste Bestand an seinen Ruhe-Plätzen, die Raten, der Rand der Hülle. Fail-closed.
AnazhRealm._gehegeGesetz = function () {
    if (AnazhRealm._gehegeGesetzMemo) return AnazhRealm._gehegeGesetzMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const G = k && k.GEHEGE_GESETZ;
    if (
        G &&
        G.raten &&
        [G.raten.hunger, G.raten.durst, G.raten.alter, G.platzM].every(Number.isFinite) &&
        ["gehegeZeile", "gehegeTiere", "gehegeRand", "gehegeDrin", "gehegeAbstand"].every(
            (f) => typeof k[f] === "function"
        )
    ) {
        AnazhRealm._gehegeGesetzMemo = Object.freeze({
            G,
            zeile: k.gehegeZeile,
            tiere: k.gehegeTiere,
            rand: k.gehegeRand,
            drin: k.gehegeDrin,
            abstand: k.gehegeAbstand,
        });
        return AnazhRealm._gehegeGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("tetrapoda:GEHEGE_GESETZ");
};
