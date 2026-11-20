class AnazhRealm_studio_wort {
    // ===== ATLAS · Studio/wort — Der Stammbaum der Teile (Studio → Bereich → Teil) · der Wort-Katalog des Co-Schöpfers · der Abruf der Welt-KI je Satz · Werk-Verb · Pflanz-Abstand =====
    // DER STAMMBAUM (Studio-Vertrag B8, studios.K5): der EINE Katalog der Teile, aus den Gesetzbüchern abgeleitet, nie von Hand
    // gepflegt — Studio → Bereich → Teil. Je Kern seine Tafel aus dem Umschlag (`f.stammbaum`: der Name des Studios, je Art der
    // Name ihres Bereichs, die Vertrags-Datei, die Rezepte in der Reihe des Buchs), je Rezept ein Teil samt seinem ZIEL, dem
    // Werk-Ziel, das ihn in die Welt legt. Die Regel des Ziels steht NUR hier, der Wort-Katalog der KI (`_studioWortKatalog`) und
    // die Werkstatt-Bibliothek (`_workshopRenderBlueprintList`) lesen sie: eine Art mit Präfix über ihr Präfix (ein Tor-Wort fällt
    // nie auf das welt_-Portal derselben Gestalt — ein echtes Tor mit Trigger, kein Bauwerk), eine Art mit Werk-Verb (KIND_POLICY
    // `werk`: die Gattung, der Körper, der Klang) als ihr eigenes Werk-Ziel, sonst der Bauplan, der ihre Gestalt trägt (die
    // Ausstattung: feuerstelle → glutbrunnen), sonst der erste Bauplan ihrer Studio-Art (`_foundryPresetForEntry`: der Fels). Die
    // sichtbaren Baupläne ohne Rezept hängen, woher sie kommen: die eigenen des Spielers in der Werkstatt, die Tore in die Welten
    // im Ultiversum (`portalMeta` aus `WORLD_REGISTRY`), die übrigen des Wirts nach ihrer Rolle — ohne Gestalt aus einem Buch sind
    // sie die WAISEN. Je Knoten die Quelle (`datei` · `anker`; die Zeile löst gate:nervensystem S) und je Teil sein Leser
    // (`konsum`): `werk` (der Bauplan des Ziels) · `wesen` · `praegung` · `streu` (die Nah-Streu, ein Name der Streu
    // `STREU_NAMEN`) · `welt` (das Platz-Gesetz führt in den Wald- oder Siedlungs-Kanal); null ist ein toter Knoten. Ein
    // Zwilling steht beim Namen: ein Rezept unter einer schon vergebenen id (die Brücke nimmt es nicht) oder ein zweiter
    // eingebauter Träger einer Gestalt neben ihrem Ziel. Gemerkt je Buch, Tafel und dem Stand, den der Baum liest.
    // { wurzeln: [Studio → Bereich → Teil], teile, teilVon: Rezept → Teil, zielVon: Ziel → Teil, befund }
    _stammbaum() {
        const bps = this.state.blueprints || {};
        const f = this._foundry;
        const recipes = f && f.recipes ? f.recipes : {};
        const tafel = (f && f.stammbaum) || null;
        // DER STAND des Merkers: je Bauplan sein Name und jedes Feld, das seinen Platz im Baum setzt — nie ihre Zahl (bis 30.10.
        // lieferte ein Tausch bei gleicher Zahl, ein Werk fällt und ein anderes kommt, den alten Baum, und die Bibliothek brach
        // an der Zeile des neuen; die Teil-Edits zählen nicht, der Baum liest keine Teile). Flach in der Reihe des Speichers und
        // Feld für Feld verglichen: ein Treffer liest nur (je Wort des Prompts einer; ein Stand als String mit sortierten Namen
        // kostete 115 µs je Treffer und hob das Prompt von 4,4 auf 19,6 ms), sortiert wird nur beim Neubau
        const stand = [];
        for (const n of Object.keys(bps)) {
            const b = bps[n] || {};
            const welt = b.portalMeta ? "@" + b.portalMeta.world : null;
            stand.push(
                n,
                b.label,
                b.role,
                b.builtIn,
                b.donorOnly,
                welt,
                b.studioGestalt,
                b._formClass,
                b._foundryAutoSpecies
            );
        }
        const cfg = AnazhRealm._studioRenderConfig || null;
        const alt = this._stammbaumMerker;
        if (
            alt &&
            alt.recipes === recipes &&
            alt.tafel === tafel &&
            alt.cfg === cfg &&
            alt.stand.length === stand.length &&
            alt.stand.every((v, i) => v === stand[i])
        )
            return alt;
        const namen = Object.keys(bps).sort();
        const KP = AnazhRealm.KIND_POLICY;
        const istTor = (n) => !bps[n] || bps[n].role === "portal";
        const sichtbar = (n) => !!(n && bps[n] && this._katalogSichtbar(n, bps[n]));
        const nachArt = {};
        for (const n of namen) {
            if (istTor(n) || bps[n]._foundryAutoSpecies) continue;
            const pr = this._foundryPresetForEntry({ type: n });
            if (pr && !nachArt[pr]) nachArt[pr] = n;
        }
        // die Leser der Welt ohne Bauplan: die Nah-Streu (ihre Boden-Arten) und die Namen der Streu
        const streu = new Set(Object.values(AnazhRealm.STREU_NAMEN));
        for (const a of (cfg && this._nahStreuArten()) || []) streu.add(a.id);
        const teile = [];
        const teilVon = new Map();
        const zielVon = new Map();
        const teil = (id, kern, datei) => {
            const rec = recipes[id];
            const pol = KP[rec.kind];
            const werk = (pol && pol.werk) || null;
            // ein Werk des Grunds hat kein Ziel einer Hand: der Ort setzt es (`_werkDesGrunds`), die Welt ist sein Leser
            const grund = this._werkDesGrunds(null, null, rec);
            let ziel = null;
            if (grund) ziel = null;
            else if (pol && pol.prefix) ziel = bps[pol.prefix + id] ? pol.prefix + id : null;
            else if (werk) ziel = id;
            else
                ziel =
                    namen.find((n) => !istTor(n) && bps[n].studioGestalt === id && !bps[n]._foundryAutoSpecies) ||
                    nachArt[id] ||
                    null;
            const kanal = this._placeDispatch(this._placePolicyFor(rec));
            const t = {
                id: "rezept:" + id,
                ebene: "teil",
                rezept: id,
                art: rec.kind,
                kern,
                lab:
                    (sichtbar(ziel) && bps[ziel].label) ||
                    this._t(...AnazhRealm._buchWort(`gestalt.${id.replace(/_/g, "-")}`, rec.lab)),
                ziel,
                werk,
                sichtbar: sichtbar(ziel),
                konsum:
                    werk ||
                    (ziel
                        ? "werk"
                        : grund
                          ? "welt"
                          : streu.has(id)
                            ? "streu"
                            : kanal === "forest" || kanal === "settlement"
                              ? "welt"
                              : null),
                quelle: { datei, anker: id },
            };
            if (grund) t.grund = true;
            teile.push(t);
            teilVon.set(id, t);
            if (ziel && !zielVon.has(ziel)) zielVon.set(ziel, t);
            return t;
        };
        // je Kern ein Studio, je Art ein Bereich — in der Reihe des Buchs; ein Rezept ohne Kern-Tafel hängt unter einer
        // namenlosen Wurzel (ein Teil ohne Eltern, die Linse nennt es)
        const wurzeln = [];
        const studio = (kern, lab, datei, arten) => {
            const s = {
                id: "kern:" + kern,
                ebene: "studio",
                kern,
                lab,
                quelle: { datei, anker: "STAMMBAUM" },
                kinder: [],
            };
            const je = new Map();
            s.bereich = (art) => {
                if (!je.has(art)) {
                    const b = {
                        id: "art:" + kern + ":" + art,
                        ebene: "bereich",
                        art,
                        kern,
                        // der Name, den das Gesetzbuch der Art gibt, gelesen aus der Tafel (`art.<art>`, DE = das Buch)
                        lab:
                            arten && typeof arten[art] === "string"
                                ? this._t(...AnazhRealm._buchWort(`art.${art}`, arten[art]))
                                : null,
                        quelle: { datei, anker: "STAMMBAUM.arten." + art },
                        kinder: [],
                    };
                    je.set(art, b);
                    s.kinder.push(b);
                }
                return je.get(art);
            };
            wurzeln.push(s);
            return s;
        };
        const getafelt = new Set();
        for (const k of (tafel && tafel.kerne) || []) {
            const name = k.studio ? this._t(...AnazhRealm._buchWort(`studio.${k.kern}`, k.studio)) : null;
            const s = studio(k.kern, name, k.datei || null, k.arten);
            for (const id of k.rezepte || [])
                if (recipes[id] && !getafelt.has(id)) {
                    getafelt.add(id);
                    s.bereich(recipes[id].kind).kinder.push(teil(id, k.kern, k.datei || null));
                }
        }
        const ohneTafel = Object.keys(recipes).filter((id) => !getafelt.has(id) && recipes[id] && recipes[id].kind);
        if (ohneTafel.length) {
            const s = studio("?", null, null, null);
            for (const id of ohneTafel) s.bereich(recipes[id].kind).kinder.push(teil(id, null, null));
        }
        // die sichtbaren Baupläne, die kein Rezept trägt: die eigenen (Werkstatt), die Tore in die Welten (Ultiversum),
        // die des Wirts (nach Rolle); ein eingebauter Träger einer Gestalt neben ihrem Ziel ist ein Zwilling
        const zwillinge = ((tafel && tafel.zwillinge) || []).map((z) => ({
            art: "rezept",
            name: z.id,
            grund: `das Rezept „${z.id}" steht in ${z.traeger} und ${z.kern}`,
        }));
        const werkstatt = {
            id: "werkstatt",
            ebene: "studio",
            lab: this._t("werk.baum.werkstatt"),
            quelle: null,
            kinder: [],
        };
        const ultiversum = {
            id: "ultiversum",
            ebene: "studio",
            lab: this._t("werk.baum.ultiversum"),
            quelle: null,
            kinder: [],
        };
        const wirt = {
            id: "wirt",
            ebene: "studio",
            lab: this._t("werk.baum.ohne-gesetzbuch"),
            quelle: null,
            kinder: [],
        };
        const ast = (w, id, lab) => {
            let b = w.kinder.find((x) => x.id === id);
            if (!b) w.kinder.push((b = { id, ebene: "bereich", lab, quelle: null, kinder: [] }));
            return b;
        };
        for (const n of namen) {
            const bp = bps[n];
            if (!sichtbar(n) || zielVon.has(n)) continue;
            const gestalt = this._foundryPresetForEntry({ type: n });
            const t = {
                id: "bauplan:" + n,
                ebene: "teil",
                rezept: null,
                lab: bp.label || n,
                ziel: n,
                werk: null,
                sichtbar: true,
                konsum: "werk",
                gestalt: gestalt && teilVon.has(gestalt) ? gestalt : null,
                quelle: { datei: null, anker: n },
            };
            if (bp.role === "portal" && bp.portalMeta) {
                t.welt = bp.portalMeta.world || null;
                ast(ultiversum, "ultiversum:tore", this._t("werk.baum.tore")).kinder.push(t);
            } else if (!bp.builtIn && !bp._foundryAutoSpecies) {
                t.eigen = true;
                ast(werkstatt, "werkstatt:eigen", this._t("werk.baum.eigene-werke")).kinder.push(t);
            } else {
                // die deklarierte Rolle (Daten), nie die errechnete: `_displayRole` baut für die emergente Rolle Gestalt
                // (`_makePartGeometry`) — der Baum liegt auf dem Prompt-Pfad der KI
                const rolle = bp.role || AnazhRealm.DEFAULT_BLUEPRINT_ROLE;
                t.waise = !t.gestalt;
                const rollenName = AnazhRealm._tafelName(AnazhRealm.BLUEPRINT_ROLE_LABELS, rolle);
                ast(wirt, "wirt:" + rolle, rollenName).kinder.push(t);
                if (t.gestalt)
                    zwillinge.push({
                        art: "traeger",
                        name: n,
                        grund: `„${n}" trägt die Gestalt „${t.gestalt}" neben ihrem Ziel „${teilVon.get(t.gestalt).ziel}"`,
                    });
            }
            teile.push(t);
            zielVon.set(n, t);
        }
        if (werkstatt.kinder.length) wurzeln.unshift(werkstatt);
        if (ultiversum.kinder.length) wurzeln.push(ultiversum);
        if (wirt.kinder.length) wurzeln.push(wirt);
        // DER BEFUND (die Zahlen der Linse): Teile · mit Gesetz-Quelle (ihr Werk baut ein Buch) · ohne Eltern (ein Rezept ohne
        // Kern-Tafel, ein namenloses Studio oder ein namenloser Bereich, ein Werk des Wirts ohne Buch) · Zwillinge · tot (kein
        // Leser) · ohne Griff (kein Ziel, die Bibliothek legt es nicht in die Welt)
        const ohneEltern = [];
        for (const w of wurzeln)
            for (const b of w.kinder)
                for (const t of b.kinder)
                    if (t.waise)
                        ohneEltern.push({ name: t.ziel, grund: `„${t.ziel}" (${b.lab}) trägt kein Gesetzbuch` });
                    else if (t.rezept && (!w.lab || !b.lab))
                        ohneEltern.push({
                            name: t.rezept,
                            grund: `das Rezept „${t.rezept}" hängt ohne ${!w.lab ? "Studio" : "Bereich"} (Art ${t.art}, Kern ${t.kern || "?"})`,
                        });
        const befund = {
            teile: teile.length,
            mitQuelle: teile.filter((t) => t.rezept || t.gestalt).length,
            ohneEltern,
            zwillinge,
            tot: teile.filter((t) => !t.konsum).map((t) => t.rezept || t.ziel),
            // ein Werk des Grunds (`grund`) hat seinen Griff im Ort, der es setzt
            ohneGriff: teile.filter((t) => !t.ziel && !t.grund).map((t) => t.rezept),
        };
        this._stammbaumMerker = {
            recipes,
            tafel,
            cfg,
            stand,
            wurzeln,
            teile,
            teilVon,
            zielVon,
            befund,
        };
        return this._stammbaumMerker;
    }

    // DER WORT-KATALOG (Welle L Folge, L-Wortschatz): ein Wort des Co-Schöpfers („eiche", „birken", „fachwerkhaus",
    // „häuser", „wagen") löst über den EINEN Rezept-Katalog auf — die Studio-Arten des Buchs, ihre Bauplan-Träger, das
    // Art-Gesetz (`KIND_POLICY`) und die Studios (`WORLD_REGISTRY`) —, nie über eine Hand-Liste (die Brücke STUDIO_WORT
    // kannte neun Wörter, „bau mir ein fachwerkhaus" war unbekannt). Gefragt werden das Wort, seine Stämme (-en/-n/-e/-s/-er,
    // der Plural-Umlaut: Häuser → Haus) und als Kompositum der Anfang eines Werk-Namens („fels" → Felsformation, ≥ 4
    // Buchstaben, das erste in Katalog-Reihenfolge). null = unbekannt (kein Raten). `genau`: ohne den Kompositum-Anfang — der
    // Abruf der Welt-KI (`_kiAbruf`) liest jedes Wort eines Satzes, dort hieße „große" sonst Großschwert, „langen" Langschwert.
    _studioBlueprintForWord(word, genau = false) {
        if (typeof word !== "string" || !word.trim()) return null;
        const K = this._studioWortKatalog();
        const w = AnazhRealm._wortFalten(word);
        const kandidaten = [w];
        for (const suf of ["en", "n", "e", "s", "er"])
            if (w.length > suf.length + 2 && w.endsWith(suf)) kandidaten.push(w.slice(0, -suf.length));
        for (const k of kandidaten.slice()) {
            const ohne = k.replace(/aeu/g, "au").replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");
            if (ohne !== k) kandidaten.push(ohne);
        }
        for (const stufe of K.stufen) for (const t of kandidaten) if (stufe.has(t)) return stufe.get(t);
        for (const t of genau ? [] : kandidaten) {
            if (t.length < 4) continue;
            for (const s of [1, 3])
                for (const [name, ziel] of K.stufen[s]) if (name.length > t.length && name.startsWith(t)) return ziel;
        }
        return null;
    }

    // Der Katalog der Wörter, gestuft (die frühere Stufe gewinnt; in einer Stufe das erste in Katalog-Reihenfolge, ein
    // Art- oder Studio-Wort mit zwei Arten fällt als mehrdeutig weg):
    //   (1) Bauplan-Namen, die Rezept-ids mit ihrem Träger, der Name hinter einem Art-Präfix (`baum_eiche` → „eiche", auch
    //       bei kaltem Buch);
    //   (2) die Namen der Werke: das Kopf-Wort des Rezept-`lab` und des Träger-Labels (vor „·"/„—": „Feuerstelle",
    //       „Ziehbrunnen", „Alemannisch", „Kristall-Geode") — nie ein Art-Wort aus (3) („Lyra-Tor" → „lyra", „tor"
    //       benennt die Art);
    //   (3) die Art-Wörter des Art-Gesetzes: der Präfix-Stamm („baum", „haus", „fahrzeug") und der Stamm des Spenders,
    //       der kein eigener Bauplan ist („fahrzeug_wagen" → „wagen") → das erste Werk der Art;
    //   (4) die Studio-Namen, deren Kompositum-Kopf ein Art-Wort ist („Fachwerkhaus" → das erste Haus).
    // Der Träger eines Rezepts ist das Ziel seines Teils im EINEN Stammbaum (`_stammbaum`, die Regel steht dort): Satz → Wort →
    // Knoten → Ziel → Stempel; ein zweiter Katalog entsteht nicht. Eine Art mit Werk-Verb (die Gattung, der Körper, der Klang)
    // hat keinen Bauplan — ihr Rezept ist sein eigenes Werk-Ziel (KI K2: vorher war „Wolf", „Lofi", „Mensch" kein Wort der
    // Welt). Gemerkt je Stammbaum, Buch und Bauplan-Zahl. { stufen: [Map Wort → Werk-Ziel] ×4, artVon: Werk-Ziel → Art, woerter }.
    _studioWortKatalog() {
        const bps = this.state.blueprints || {};
        const f = this._foundry;
        const recipes = f && f.recipes ? f.recipes : {};
        const ids = Object.keys(recipes);
        // der Stand der Baupläne (Namen, Rolle, Name im Katalog) ist der des Baums: ein neuer Baum, ein neuer Katalog
        const baum = this._stammbaum();
        const alt = this._wortKatalogMerker;
        if (alt && alt.baum === baum && alt.recipes === recipes && alt.nRez === ids.length) return alt;
        // ein Werk des Grunds ist kein Wort (`_werkDesGrunds`: der Ort setzt es) — weder sein Bauplan noch der Name hinter dem Präfix
        const namen = Object.keys(bps)
            .filter((n) => !this._werkDesGrunds(n, bps[n]))
            .sort();
        const KP = AnazhRealm.KIND_POLICY;
        const falte = AnazhRealm._wortFalten;
        // die Wörter eines Etiketts sind seine Nomen und Namen (groß geschrieben): „Dojo mit Pergola" gab der Welt das Wort
        // „mit" (ki.K5: jeder Satz mit „mit" nannte die Arena)
        const kopf = (label) =>
            String(label || "")
                .split(/\s[·—(]|\s-\s/)[0]
                .split(/[^A-Za-zÄÖÜäöüß]+/)
                .filter((x) => x.length >= 3 && x[0] !== x[0].toLowerCase())
                .map(falte);
        const istTor = (n) => !bps[n] || bps[n].role === "portal";
        // die Wörter der DSL sprechen die Quell-Sprache des Gesetzes (de), nie die Sprache des Spielers
        const label = (t) => (bps[t] ? AnazhRealm._etikettQuelle(bps[t]) : recipes[t] && recipes[t].lab);
        // der Träger je Rezept ist das Ziel seines Teils im EINEN Stammbaum (`_stammbaum` trägt die Regel)
        const traeger = {};
        const artVon = {};
        for (const id of ids) {
            const t = baum.teilVon.has(id) ? baum.teilVon.get(id).ziel : null;
            if (!t) continue;
            traeger[id] = t;
            if (!artVon[t]) artVon[t] = recipes[id].kind;
        }
        const stufen = [new Map(), new Map(), new Map(), new Map()];
        const setze = (s, wort, ziel) => {
            if (wort && ziel && !stufen[s].has(wort)) stufen[s].set(wort, ziel);
        };
        // Die sagbaren Wörter (Prompt und Absage): [Wort, Nennung] — Art- und Studio-Wörter zuerst, dann die Werke.
        const gross = (w) => w.charAt(0).toUpperCase() + w.slice(1);
        const nennWoerter = [];
        const werkWoerter = [];
        // (1)
        for (const n of namen) setze(0, n, n);
        for (const id of ids)
            if (traeger[id]) {
                setze(0, falte(id), traeger[id]);
                const lab = String(label(traeger[id]) || id).split(/\s[·—(]/)[0];
                werkWoerter.push([falte(id), lab]);
            }
        for (const k of Object.keys(KP)) {
            const px = KP[k].prefix;
            if (!px) continue;
            for (const n of namen)
                if (n.startsWith(px) && !istTor(n)) {
                    setze(0, n.slice(px.length), n);
                    if (!artVon[n]) artVon[n] = k;
                }
        }
        // (3) und (4): ein Wort, das zwei Arten benennt, fällt (Spender „tor_basis"/„haus_basis" → „basis"). Die Art-Wörter
        // stehen VOR den Namen der Werke fest: (2) nimmt keines davon (unten).
        const eindeutig = (s, paare) => {
            const arten = new Map();
            for (const [w, t] of paare) {
                if (!arten.has(w)) arten.set(w, new Set());
                arten.get(w).add(artVon[t]);
            }
            for (const [w, t] of paare)
                if (arten.get(w).size === 1 && !stufen[s].has(w)) {
                    setze(s, w, t);
                    nennWoerter.push([w, gross(w)]);
                }
        };
        const erstes = {};
        for (const id of ids) if (traeger[id] && !erstes[recipes[id].kind]) erstes[recipes[id].kind] = traeger[id];
        const artPaare = [];
        for (const k of Object.keys(KP)) {
            const px = KP[k].prefix;
            const ziel = erstes[k] || (px ? namen.find((n) => n.startsWith(px) && !istTor(n)) : null);
            if (!ziel) continue;
            if (px) artPaare.push([px.replace(/_+$/, ""), ziel]);
            const sp = KP[k].donor;
            if (typeof sp === "string" && !bps[sp]) artPaare.push([sp.split("_").pop(), ziel]);
        }
        eindeutig(2, artPaare);
        // (2) Ein Art-Wort benennt seine Art, nie das Werk, dessen Label es als Grundwort trägt: „Lyra-Tor" ist ein Tor —
        // „lyra" führt zu ihm, „tor" bleibt das erste Werk der Art (w4-tore-teile2: das Label nahm „tor" dem Drachentor,
        // der Satz „stell ein drachentor auf" verlor seine Absicht; gate:nervensystem S „Wort am Knoten vorbei").
        for (const id of ids) {
            const t = traeger[id];
            if (t) for (const w of [...kopf(recipes[id].lab), ...kopf(label(t))]) if (!stufen[2].has(w)) setze(1, w, t);
        }
        // (4) Ein Studio-Name, dessen Kopf (der letzte Teil des Kompositums) ein Art-Wort ist, ist ein Werk dieser Art:
        // „Fachwerkhaus" ist ein Haus. „Anatomie", „Porta", „Phytogenesis" benennen keine Art und bleiben stumm.
        const studioPaare = [];
        for (const wdef of Object.values(AnazhRealm.WORLD_REGISTRY))
            for (const w of kopf(wdef && wdef.label))
                for (const [art, ziel] of stufen[2])
                    if (w.length > art.length && w.endsWith(art)) studioPaare.push([w, ziel]);
        eindeutig(3, studioPaare);
        const woerter = [...nennWoerter, ...werkWoerter];
        this._wortKatalogMerker = { baum, recipes, nRez: ids.length, stufen, artVon, woerter };
        return this._wortKatalogMerker;
    }

    // Die lebenden Wörter, gruppiert je Art (KI-Prompt und die Absage eines unbekannten Worts): aus dem EINEN Wort-Katalog —
    // nie ein Wort, das die Welt nicht bauen kann. `nennen` = wie der Spieler sie liest („Fachwerkhaus", „Eiche"), sonst die
    // Wörter des Programms („fachwerkhaus", „eiche"). DIE KOMPAKTE FORM (ki.K5, 06.11.): der Vertrag trägt je Gruppe
    // `KI_WOERTER_JE_GRUPPE` Wörter und keinen Regler — die übrigen Wörter und die Regler, die ein Satz nennt, ruft `_kiAbruf` je
    // Satz ab. Bis ki.K5 trug diese Zeile jede Regler-
    // Zeile jeder Art (2 812 von 5 532 Token des Vertrags, `"id" min–max Name` Ziffer um Ziffer): qwen3:4b an 4 CPU-Kernen
    // rechnete je Token der Antwort 305 statt ~200 ms und kopierte die Zeilen als Rauschen in jedes Werk.
    _studioWordsForPrompt(nennen = false) {
        const { GRUPPE, listen } = this._studioWortListen(nennen);
        return Object.entries(listen)
            .map(([a, ws]) => `${GRUPPE[a]}: ${ws.join(", ")}${ws.ganz > ws.length ? " …" : ""}`)
            .join(" · ");
    }

    // Die gezeigten Wörter je Art (`nennen` 5, sonst `KI_WOERTER_JE_GRUPPE`): { GRUPPE, listen: {art: [wort …] (.ganz: alle)} }
    // — gelesen vom Vertrag (`_studioWordsForPrompt`) und vom Abruf (`_kiAbruf`: er nennt nur, was hier fehlt)
    _studioWortListen(nennen = false) {
        const { GRUPPE, gruppen: paare } = this._studioWortGruppen();
        const kappe = nennen ? 5 : AnazhRealm.KI_WOERTER_JE_GRUPPE;
        const listen = {};
        for (const a of Object.keys(GRUPPE)) {
            const alle = [...new Set((paare[a] || []).map(([w, nennung]) => (nennen ? nennung : w)))];
            if (alle.length) listen[a] = Object.assign(alle.slice(0, kappe), { ganz: alle.length });
        }
        return { GRUPPE, listen };
    }

    // EINE Regler-Zeile der Welt-KI: `id Name` und der Bereich, wenn er nicht 0–1 ist (der Vertrag nennt 0–1 als Regel).
    // Leser: der Abruf je Satz (`_kiAbruf`) und seine Linse (diag-praegung-welt K2 „prompt").
    _kiReglerZeile(d) {
        return `${d.id} ${d.lab}${d.min === 0 && d.max === 1 ? "" : ` ${d.min}–${d.max}`}`;
    }

    // DER ABRUF JE SATZ (ki.K5, 06.11.; Tool-Retrieval über die EINE Regler-Tafel PARAMS_BY_KIND): die Regler, die der Satz beim
    // NAMEN nennt — sein Name (`lab`, gefaltet wie jedes Wort der Welt: `_wortFalten`, Stämme -en/-e/-s/-er/-es/-em, Umlaut; ein
    // Teil genügt: „dach" → Dachneigung, „blüten" → Blüten-Zahl) oder genau seine id („turm"). Gesucht wird in den Arten, die der
    // Satz nennt (ein Wort des Katalogs, genau — `_studioBlueprintForWord(w, true)` —, oder der Kopf einer Gruppe: „musik");
    // nennt er keine, in den Arten ohne Ort (KIND_POLICY `werk` "praegung"), dann mit Stamm ≥ 6 („mach mich größer" → „groess",
    // die Gestalt des Spielers; in allen Arten hätte „höher springen" die Federrate des Wagens gerufen, mit Stamm 5 rief „färbe
    // den himmel" die Farbe der Musik: 2,4 s Prefill je Satz für eine falsche Zeile, ki.K5 07.11.). Leser: der Kontext der Welt-KI
    // (`zeile`, hinter dem Prompt-Cache: nur die genannten Zeilen kosten Prefill) und ihre Antwort-Form (`regler`: ein
    // Regler-Objekt trägt GENAU diese Schlüssel, ohne Treffer gibt es keines — „bau mir ein haus" kann keinen Regler mehr
    // schreiben). { regler: {art: [Zeile …]}, zeile } — `zeile` nennt dazu die Werk-Wörter des Satzes in der Form des Programms.
    _kiAbruf(satz) {
        const PBK = (this._foundry && this._foundry.paramsByKind) || {};
        const K = this._studioWortKatalog();
        const { GRUPPE } = this._studioWortGruppen();
        const ohneUmlaut = (w) => w.replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");
        const woerter = (t) =>
            AnazhRealm._wortFalten(t)
                .split(/[^a-z]+/)
                .filter((w) => w.length >= 3);
        const stamm = (w) => [
            w,
            ...["en", "es", "em", "er", "e", "n", "s"].filter((s) => w.endsWith(s)).map((s) => w.slice(0, -s.length)),
        ];
        const artVon = (w) => {
            const z = this._studioBlueprintForWord(w, true);
            return z ? K.artVon[z] : null;
        };
        const kopf = {};
        for (const [art, lab] of Object.entries(GRUPPE)) kopf[ohneUmlaut(woerter(lab)[0] || "")] = art;
        // erst der Kopf einer Gruppe („tiere" sind die Tiere, nie das Tier-Tor, dessen Werk-Name „tier" ist), dann das Wort
        const genannt = new Set();
        const werkWort = new Set();
        const werkName = new Set();
        for (const w of woerter(satz)) {
            const gruppe = stamm(ohneUmlaut(w))
                .map((s) => kopf[s])
                .find(Boolean);
            const art = gruppe || artVon(w);
            if (!art || !GRUPPE[art]) continue;
            genannt.add(art);
            werkWort.add(w);
            if (!gruppe) werkName.add(w);
        }
        const ohneArt = !genannt.size;
        const eigen = woerter(satz)
            .filter((w) => !werkWort.has(w))
            .flatMap((w) => stamm(w).map(ohneUmlaut))
            .filter((s) => s.length >= (ohneArt ? 6 : 4));
        const genau = new Set(woerter(satz));
        // ein Teil des Namens („dach" in Dachneigung) oder ein gemeinsamer Anfang ≥ 6 (das Partizip: „verwitterte" ↔ Verwitterung)
        const anfang = (a, b) => {
            let i = 0;
            while (i < a.length && a[i] === b[i]) i++;
            return i;
        };
        const regler = {};
        const KP = AnazhRealm.KIND_POLICY;
        const arten = ohneArt ? Object.keys(GRUPPE).filter((a) => KP[a] && KP[a].werk === "praegung") : genannt;
        for (const art of arten)
            for (const d of Array.isArray(PBK[art]) ? PBK[art] : []) {
                const namen = String(d.lab)
                    .split(/[^A-Za-zÄÖÜäöüß]+/)
                    .filter(Boolean)
                    .map((n) => AnazhRealm._wortFalten(n));
                const trifft =
                    genau.has(AnazhRealm._wortFalten(d.id)) ||
                    namen.some(
                        (n) =>
                            genau.has(n) ||
                            (n.length >= 4 &&
                                eigen.some((s) => ohneUmlaut(n).includes(s) || anfang(s, ohneUmlaut(n)) >= 6))
                    );
                if (trifft) (regler[art] = regler[art] || []).push(d);
            }
        // die Werk-Namen des Satzes (Bauplan und Werk, nie ein Art-Wort: „tiere" meint die Wesen) in der Form des Programms
        // („holzhütte" → holzhuette), die der Vertrag nicht zeigt (er nennt
        // je Gruppe `KI_WOERTER_JE_GRUPPE`): ohne sie schrieb qwen3:4b für „eine kleine holzhütte" das erste Haus; ein gezeigtes
        // Wort zu wiederholen kostete den Satz ~0,5 s Prefill
        const sagbar = new Set(Object.values(this._studioWortGruppen().ziele).flat());
        const gezeigt = new Set(Object.values(this._studioWortListen().listen).flat());
        const werk = [
            ...new Set(
                [...werkName]
                    .map((w) =>
                        stamm(AnazhRealm._wortFalten(w))
                            .flatMap((x) => [x, x.replace(/aeu/g, "au").replace(/ae/g, "a")])
                            .find((x) => sagbar.has(x) && (K.stufen[0].has(x) || K.stufen[1].has(x)))
                    )
                    .filter((w) => w && !gezeigt.has(w))
            ),
        ];
        const zeile = Object.entries(regler)
            .map(([art, ds]) => `${GRUPPE[art]}: ${ds.map((d) => this._kiReglerZeile(d)).join("; ")}`)
            .join(" · ");
        return {
            regler,
            zeile: [
                werk.length && `Wörter des Satzes: ${werk.join(", ")}.`,
                zeile && `Regler, die der Satz nennt: ${zeile}.`,
            ]
                .filter(Boolean)
                .join("\n"),
        };
    }

    // Die lebenden Wörter je benannter Art aus dem EINEN Wort-Katalog: { GRUPPE: {art: Name}, gruppen: {art: [[wort, nennung], …]} }
    // — der Prompt nennt sie, die Antwort-Form der Welt-KI (`_kiAntwortSchema`) erlaubt GENAU sie, je Art mit ihren Reglern.
    _studioWortGruppen() {
        const K = this._studioWortKatalog();
        // die Gruppen sind die Bereiche des EINEN Stammbaums (`_stammbaum`): je Art der Name, den ihr Gesetzbuch ihr gibt (B8) —
        // der Wirt nennt keine Art, auch das neunte Buch steht unter seinem eigenen Namen im Prompt (studios.K5; bis 30.10.
        // trug der Wirt hier eine Hand-Liste von zwölf Arten-Namen neben den Büchern)
        const GRUPPE = {};
        for (const w of this._stammbaum().wurzeln)
            for (const b of w.kinder) if (b.art && b.lab && !GRUPPE[b.art]) GRUPPE[b.art] = b.lab;
        const gruppen = {};
        for (const [w, nennung] of K.woerter) {
            const ziel = this._studioBlueprintForWord(w);
            const art = ziel && K.artVon[ziel];
            if (GRUPPE[art]) (gruppen[art] = gruppen[art] || []).push([w, nennung]);
        }
        // `ziele`: JEDES Wort, das der Katalog genau auflöst (alle Stufen, die frühere gewinnt — „hirsch" ist sagbar über
        // das Werk), je Art seines Werk-Ziels
        const ziele = {};
        const gesehen = new Set();
        for (const stufe of K.stufen)
            for (const [w, ziel] of stufe) {
                if (gesehen.has(w)) continue;
                gesehen.add(w);
                const art = K.artVon[ziel];
                if (GRUPPE[art]) (ziele[art] = ziele[art] || []).push(w);
            }
        return { GRUPPE, gruppen, ziele };
    }

    // Das Werk-Verb eines Werk-Ziels (`_studioBlueprintForWord`): "wesen" · "praegung" (KIND_POLICY `werk` der Art eines
    // Rezepts ohne Bauplan) oder null — ein Bauplan wird gebaut oder wächst.
    _studioWerkVerb(name) {
        if (this.state.blueprints && this.state.blueprints[name]) return null;
        const rec = this._foundry && this._foundry.recipes ? this._foundry.recipes[name] : null;
        const pol = rec && AnazhRealm.KIND_POLICY[rec.kind];
        return (pol && pol.werk) || null;
    }

    // Der Pflanz-Abstand je Bauplan: Bäume/Stein eng (ein Hain), Häuser/Tore/Fahrzeuge
    // mit Luft (Kind aus dem Rezeptbuch über das Preset).
    _studioSpawnAbstand(name) {
        const f = this._foundry;
        // der EINE Entry-Resolver (studioGestalt eingeschlossen: die Ausstattung löst über ihren Bauplan auf)
        const preset = this._foundryPresetForEntry({ type: name });
        const rec = preset && f && f.recipes ? f.recipes[preset] : null;
        const kind = rec ? rec.kind : name.startsWith("baum_") ? "tree" : null;
        if (kind === "haus" || kind === "gate" || kind === "vehicle") return 9;
        if (kind === "ausstattung") return 4;
        return 2.5;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_studio_wort]);

// ===== ATLAS · Studio/wort — Außen-Konstanten =====
// Die Faltung eines Worts für den Wort-Katalog (`_studioWortKatalog`): klein, Umlaute ausgeschrieben, ß → ss, Leer- und
// Bindestriche → „_" (die Form der Bauplan-Namen und Rezept-ids).
AnazhRealm._wortFalten = function (wort) {
    return String(wort == null ? "" : wort)
        .trim()
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[\s-]+/g, "_");
};
