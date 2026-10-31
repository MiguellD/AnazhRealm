//# allFunctionsCalledOnLoad
class AnazhRealm_studio_stoff {
    // ===== ATLAS · Studio/stoff — Foundry-Stoff · EIN Graph je Signatur · Stoff-Wert · Krone · Haut · Durchsicht · Leucht-Gesetz · die Stufen-Maske =====
    // Das per-Ziegel-March-Material ist GEFALLEN (DER EINE WELT-MARCH): der
    // Feld-Pass marcht ALLE Felder aus Atlas+Liste in EINEM Draw — ein
    // Material je Ziegel wäre der Zwilling, den wir abgeschafft haben.

    // DER STOFF-WERT (1310-18): ein Wert, der je Stoff variiert, reist als Verweis auf den Stoff des ZEICHNENDEN OBJEKTS
    // (`material.<pfad>`, je Objekt in dessen Bindegruppe geschrieben), nie als Konstante im Graphen — Stoffe gleicher
    // Signatur teilen so EIN Programm. Der Verweis geht über das Objekt, nicht über den zeichnenden Stoff: der r184-
    // Schattenpass zeichnet mit seinem EIGENEN Stoff (die Knoten des Werfers hängen darin, Lehre 26), das Objekt trägt den
    // Werfer-Stoff in jedem Pass. Der Wert steht beim Bau fest — die Observer-Diät sieht keine spätere Änderung.
    _stoffWert(TSL, pfad, typ) {
        return TSL.reference("material." + pfad, typ || "float");
    }

    // EIN GRAPH JE SIGNATUR (1310-18): r184 schlüsselt ein Programm nach der IDENTITÄT seiner Knoten (der Knoten-Schlüssel endet
    // in `customCacheKey` = Knoten-id) — frisch gebaute Knoten hießen ein Programm je Stoff. Der erste Stoff einer Signatur legt
    // die Knoten seiner `plaetze` ab, jeder weitere zeichnet mit DENSELBEN; was nur ihn unterscheidet, liest der Graph als
    // Stoff-Wert (`_stoffWert`). Weichen die belegten Plätze ab, fehlt der Signatur eine Eingabe des Baus: das bricht laut beim
    // Namen, nie still mit fremdem Graphen. Leser: der Studio-Stoff (`_foundryTreeMaterial`) und der Werk-Stoff
    // (`_buildPbrNodeMaterial`, material.K5).
    _graphTeilen(mat, sig, plaetze) {
        const G = this._geteilteGraphen || (this._geteilteGraphen = new Map());
        const g = G.get(sig);
        if (!g) return void G.set(sig, Object.fromEntries(plaetze.map((p) => [p, mat[p] || null])));
        const ab = plaetze.filter((p) => !mat[p] !== !g[p]);
        if (ab.length)
            throw this._stoffBruch(
                `der geteilte Graph „${sig}"`,
                new Error("die Signatur verfehlt eine Eingabe des Baus — abweichende Knoten-Plätze: " + ab.join(" · "))
            );
        for (const p of plaetze) mat[p] = g[p];
    }

    // `wiegen` (true, optional): der Stoff einer weichen Boden-Art der Nah-Streu — er wiegt im EINEN Wind mit der Höhe über
    // der Wurzel in Metern aus dem Satz-Attribut `aWiege` (`_satzBlock`), also für jede Studio-Skala derselbe Stoff.
    // `mp.satzRegler` (true): der EINE Satz-Stoff des Bau-Satzes (`_satzStoff`, K43-2) — Rauheit, Metall und Deckkraft liest er
    // je Ecke aus `aRegler`, das Emissiv × Glut-Stärke aus `aGlut` (`_satzBlock`); `mp` trägt diese Regler dann nicht.
    // `krone` (true, optional; K68-N1): das Klingen-Laub gehört zu einer Krone (Baum, Strauch: foundry-core `emitTreeRezept`
    // legt die Normale der Krone darüber), auch ohne `baum` — der wiegende Stoff der Nah-Streu erbt sie vom Stoff der Art
    // (`userData.krone`); die Karte (foliageTex) ist immer Krone.
    // `ecken` (optional): WAS DIE GESTALT JE ECKE TRÄGT und ihr Stoff liest — EIN benanntes Feld, nie ein Wahrheitswert an
    // einer Stelle (zwei Zweige hängten je einen sechsten an, der Mensch den Ton, das Laub das Jahr: der Aufrufer des einen
    // gäbe dem anderen still seine Bedeutung). `ecken.ton` (mensch.K4): der Ton je Ecke (`aTon`) — der Stoff färbt nach der
    // Palette des zeichnenden Leibs (`_tonFaktor`). `ecken.jahr` (vegetation.K5): die Jahres-Ecken (`_jahrEcken`) — ihr Laub
    // fällt im Winter auf seine Mitte (`_jahrLage`); der wiegende Stoff der Nah-Streu erbt es vom Stoff der Art
    // (`userData.jahr`). Fail-closed: ein anderes Wort an dieser Stelle bricht laut beim Namen.
    _foundryTreeMaterial(kind, mp, wiegen, baum, krone, ecken) {
        if (
            ecken != null &&
            (typeof ecken !== "object" ||
                Object.entries(ecken).some(([k, v]) => (k !== "ton" && k !== "jahr") || typeof v !== "boolean"))
        )
            throw this._stoffBruch(
                `die Ecken der Gestalt (${kind}): ein Feld { ton, jahr } aus Wahrheitswerten, nie ` +
                    (typeof ecken === "object"
                        ? "{ " +
                          Object.entries(ecken)
                              .map(([k, v]) => k + ": " + (v && typeof v === "object" ? "Objekt" : String(v)))
                              .join(", ") +
                          " }"
                        : String(ecken))
            );
        const ton = !!ecken && ecken.ton === true;
        const jahr = !!ecken && ecken.jahr === true;
        const satz = !!(mp && mp.satzRegler === true);
        if (!this._foundryMats) this._foundryMats = {};
        const T = THREE;
        const TSL = T.TSL;
        // Material-Regler: reist `mp` mit (roughness/metalness/flatShading/env/side/Glut), baut AnazhRealm EXAKT
        // dieses Material; ohne `mp` die Baum-Defaults — die Zahlen und die Look-Familie (FELL_LOOK/HAUT_LOOK/HAAR_LOOK,
        // der Ton-Anker mp.color steht im Key) liest der Wirt aus DERSELBEN Quelle wie der Schlüssel (phyto-core
        // `budgetRegler`); Laub/Gras sind immer beidseitig.
        const R = globalThis.__phytoCore.budgetRegler(kind, mp);
        const isBark = R.rinde;
        const rough = R.r,
            metal = R.mt,
            flat = R.fl,
            env = R.env,
            sideDouble = R.doppelt,
            emis = R.em,
            emisI = R.emI,
            klasseLook = R.look;
        // Die Studio-Dither-Blende ist Gesetz des Stoffs, nie des Schalters (lod.K5): jeder Foundry-Stoff trägt die Maske,
        // jeder Körper die Stempel (`_foundryBuildGroup`); zur Laufzeit schaltet sie `uLodMaskOn` (A/B), die
        // CPU-Doppel-Mitgliedschaft `foundryCrossfade`. Bis lod-stufen las der Bau den Schalter: ein Körper, gebaut, während
        // eine Linse ihn ausschaltete, trug Stoff ohne Maske und keine Stempel — der Cache hielt beides über die Linse hinaus
        // (die Stufen-Linse: `_satzBlock(streuNah:stumpf…)` „Attribut aLodLevel fehlt", der Satz verlangt die Stempel immer).
        // Der wiegende Stoff der Nah-Streu blendet nie (ihr Stufen-Wechsel ist die Armlänge, ihre Stempel tragen 0): sein Satz
        // trägt keine Stempel (`STREU_SATZ_ATTR`). Der Stoff des Menschen (`ton`) blendet nie: sein Guss steht auf dem Null-Stempel
        // (die Maske wäre die Identität), und ihre drei Stempel sprengten neben dem Ton den Deckel der Vertex-Puffer (WebGPU 8: Lage ·
        // Knochen · Gewichte · Normale · Farbe · Ton · aH0L · aLodLevel · aH0 = 9) — das Gerät sagte 8 Programme ab, Auge und
        // Kleid zeichneten nie (mensch.K4, 30.10.); ohne Maske liest er 6 Puffer. Der STEIN-Stoff (`mp.stein`, w4-genesis-tore)
        // blendet nie: ein Bau steht auf dem Null-Stempel, und sein Satz trägt statt der drei Stempel das uv seiner Lage im Verband
        // (`BAU_STEIN_ATTR`: Lage · Normale · Farbe · Regler · Glut · uv = 6) — mit den Stempeln waren es 9, das Gerät sagte ab.
        const xfade = wiegen !== true && ton !== true && !(mp && typeof mp.stein === "string");
        // DER SCHLÜSSEL IST DIE EINE MATERIAL-IDENTITÄT (phyto-core `budgetStoff`, W8): Art · Regler · SEITE · Gewebe ·
        // Glut · Fell-/Haut-Ton — dieselbe, mit der das Budget-Gesetz am Studio-Ausgang Stoffe zählt und faltet (die
        // Seite fehlte: ein beidseitiger Stoff teilte das Material eines einseitigen gleicher Regler, first-wins).
        // Dazu die Wirts-Zustände, die kein Studio-Stoff sind: die Dither-Blende und das Wiegen der Nah-Streu.
        // DIE KRONE (K68-N1): Karte immer, Klinge am Baum und Strauch — sie lichtet flip-frei (`_laubStoffNormale`)
        const _krone = kind === "foliageTex" || (kind === "foliage" && (!!baum || krone === true));
        const key =
            globalThis.__phytoCore.budgetStoff(kind, mp) +
            (xfade ? "|xf" : "") +
            (wiegen === true ? "|wiegt" : "") +
            (baum ? "|wind:" + baum.ht.toFixed(2) + "/" + baum.delta.toFixed(4) + "/" + baum.an : "") +
            (satz === true ? "|satz" : "") +
            (_krone ? "|krone" : "") +
            (ton ? "|ton" : "") +
            (jahr ? "|jahr" : "");
        if (this._foundryMats[key]) return this._foundryMats[key];
        let mat;
        // HAUT-VOLLENDUNG (19.07.): die Lab-Haut trägt CLEARCOAT (matSkin
        // 0.12/0.6) — skin/haut minten als Physical-Material (der Standard
        // trägt keinen Lack); die Zahlen kommen NUR aus dem Kern-Gesetz.
        const _hautL =
            (kind === "skin" || kind === "haut") && typeof globalThis !== "undefined" && globalThis.__koerperCore
                ? globalThis.__koerperCore.HAUT_LOOK
                : null;
        // DER KLARLACK (W5 Gegenstände): die Haut des Körperstudios (HAUT_LOOK) ODER der Stoff selbst (Fahrzeug-Lack,
        // Klingen-Stahl — `budgetRegler` cc/ccr aus dem Gesetzbuch); ohne Klarlack der Standard. Gemessen (Integration W5,
        // echte GPU, Ausgabe-Pfad, Gesicht auf 0,75 m): die Haut hebt sich im Median 41,3 -> 42,9 (+4 %, zwei gleiche
        // Schüsse 0,2 auseinander); er trägt nur die Menschen-Haut (skin/haut — kein Tier-Stoff), keinen Befehl mehr.
        const ccSoll =
            _hautL && Number.isFinite(_hautL.clearcoat)
                ? {
                      cc: _hautL.clearcoat,
                      ccr: Number.isFinite(_hautL.clearcoatRoughness) ? _hautL.clearcoatRoughness : 0.5,
                  }
                : R.cc > 0
                  ? { cc: R.cc, ccr: R.ccr }
                  : null;
        // Die Physical-Klasse lebt in der Node-Bibliothek des Renderers (r184 — die Bootstrap-Brücke reicht sie nicht als
        // THREE-Symbol: die Probe `typeof T.MeshPhysicalNodeMaterial` fiel IMMER auf den Standard, die Haut trug nie ihren
        // Klarlack). Der Null-Renderer zeichnet nichts und trägt keine Bibliothek — gefragt wird die Bibliothek selbst, nie
        // die Flagge (eine Linse lüftet `_isHeadlessNull` am Null-Renderer, gate:leistungs-vertrag: die Lieferung brach).
        const rendM = this.state && this.state.renderer;
        const MatK =
            ccSoll && rendM && rendM.library
                ? rendM.library.getMaterialNodeClass("MeshPhysicalMaterial")
                : T.MeshStandardNodeMaterial;
        mat = new MatK({
            roughness: rough,
            metalness: metal,
            flatShading: flat,
            side: sideDouble ? T.DoubleSide : T.FrontSide,
        });
        if (MatK !== T.MeshStandardNodeMaterial) {
            mat.clearcoat = ccSoll.cc;
            mat.clearcoatRoughness = ccSoll.ccr;
        }
        // DIE DURCHSICHT (W5): ein durchsichtiger Stoff (Scheibe, Fenster, Glimm-Scheibe) zeichnet transparent mit der
        // Deckkraft seines Gesetzbuchs; einen Schatten wirft er nicht (`_foundryBuildMesh`: das Licht geht durch ihn). Er
        // SCHREIBT SEINE TIEFE (material.K4): der Spiegel-Pass liest die Scheibe aus der Tiefe des Bilds (Lage und Normale,
        // `_spiegelPass`) — ohne sie stand dort der Raum dahinter, und das Fenster spiegelte, was hinter ihm liegt. Was hinter
        // ihm liegt, zeichnet vor ihm (Opakes zuerst, Durchsichtiges von hinten) und bleibt sichtbar. Eine dünne Scheibe
        // zeichnet beide Seiten in EINEM Zug: r184 zieht einen doppelseitig-transparenten Stoff sonst zweimal (Rück-, dann
        // Vorderseite) — gemessen +1 Befehl je Wagen über den Budget-Deckel vehicle draws 12.
        if (R.op < 1) {
            mat.transparent = true;
            mat.opacity = R.op;
            mat.forceSinglePass = true;
        }
        if (env !== 1) mat.envMapIntensity = env;
        if (emis) {
            mat.emissive = new T.Color(emis[0], emis[1], emis[2]);
            mat.emissiveIntensity = emisI;
        }
        // Tint-Kontinuität L0/L1↔L2: das Studio tintet NUR das Laub, multiplikativ, aus dem Positions-Hash
        // (foundry-core.js) — gleich über alle Stufen, sonst springt die Kronenfarbe beim Stufen-Wechsel. Das
        // Flag lässt `_scatterInstanceAdd` denselben Tint auf die 3D-Krone legen; Rinde bleibt untintet. Nur
        // das Flag, NIE attribute("instanceColor") — der native InstanceNode-Auto-Multiply trägt ihn.
        if (kind === "foliage" || kind === "foliageTex") mat.userData.useInstanceTint = true;
        if (_krone) mat.userData.krone = true;
        if (jahr === true) mat.userData.jahr = true; // das Laub fällt (`_jahrLage`; der Baum-Wind webt es in seinen Knoten)
        // DIE WERTE JE STOFF (1310-18): was nur diesen Stoff unterscheidet (das Leucht-Maß, der Ton-Anker der Strähnen-Achse),
        // liest der Graph als Stoff-Wert (`_stoffWert`), nie als eingefaltete Konstante — sonst trüge jeder Stoff seinen
        // eigenen Graphen und r184 baute je Stoff ein Programm.
        const _tonA = mp && Array.isArray(mp.color) && mp.color.length === 3 ? mp.color : null;
        mat.userData.stoffWerte = {
            leucht: mp && typeof mp.leucht === "number" && mp.leucht > 0 ? mp.leucht : 0,
            tonL: _tonA ? Math.max(1e-4, 0.2126 * _tonA[0] + 0.7152 * _tonA[1] + 0.0722 * _tonA[2]) : 1,
        };
        // Vorlagen-Farben leben als VERTEX-COLORS: auf WebGPU/NodeMaterial MUSS colorNode = attribute("color")
        // sie lesen — `vertexColors:true` wirkt hier NICHT (sonst weißes Laub, schwarze Koniferen).
        // `_foundryBuildGroup` garantiert das color-Attribut.
        const vcolRoh = TSL.attribute("color", "vec3");
        // DIE FARBE FOLGT DEM SAMEN (mensch.K4): trägt die Gestalt den Ton je Ecke, ist ihre Farbe die Vorlage × das Verhältnis
        // der Palette des zeichnenden Leibs zu der seiner Gestalt (`_tonFaktor`), je Ecke im Vertex-Takt — der Leib eines
        // Bewohners zeigt seine Farben im Stoff seiner Gestalt; ohne eigene Palette (der Spieler) ist das Verhältnis 1. Die
        // Strähnen-Achse unten liest die Vorlage (`vcolRoh`).
        const vcol = ton === true ? TSL.varying(vcolRoh.mul(this._tonFaktor(TSL)), "vTonFarbe") : vcolRoh;
        // DAS LEUCHT-GESETZ (Architektur-Welle 05.10.): ein Stoff, dessen Gesetzbuch `leucht` stempelt (fachwerk
        // `feuer`: Glut, Flamme, Herdfeuer), leuchtet in seiner Vertex-Farbe × leucht — heiße Mitte, kühler Rand,
        // gelbe Flammen-Wurzel, rote Spitze — statt einer Farbe für jede Fläche (das Labor webt dasselbe in r128).
        if (mp && typeof mp.leucht === "number" && mp.leucht > 0)
            mat.emissiveNode = vcol.mul(this._stoffWert(TSL, "userData.stoffWerte.leucht"));
        // DIE FARBE DES JAHRS (V18.527): Laub und Gras sind Golden-Sommer gebacken — ihre Albedo × uSeasonMul
        // (das Studio-Gesetz: der Laub-Shader multipliziert mix(1, uSeasonMul, vSeasW), vSeasW = 1 auf Laub und
        // Blüte). Rinde, Fels, Kristall bleiben ungetönt. Die Gestalt des Jahrs trägt die Lage (`jahr`, `_jahrLage`).
        const _suF =
            kind === "foliage" || kind === "foliageTex" || kind === "grass" ? this._ensureSeasonUniforms() : null;
        const laubFarbe0 = _suF && _suF.uSeasonMul ? vcol.mul(_suF.uSeasonMul) : vcol;
        // DIE BLATT-UNTERSEITE (phyto-core BLATT_UNTERSEITE, 05.10.): die gesehene Fläche nach unten gewandt → die hellere,
        // mattere Unterseite (`_laubUnterseite`, K68-N1: die Fläche, nie die Licht-Normale). Laub und Blüte, nie Gras.
        const laubFarbe =
            kind === "foliage" || kind === "foliageTex" ? this._laubUnterseite(TSL, laubFarbe0) : laubFarbe0;
        // DIE NORMALE DER KRONE (K68-N1): die Studio-Krone (foundry-core `emitTreeRezept`: jede Karte, jede Klinge und Nadel
        // eines Baums und Strauchs) trägt die Normale der Krone und lichtet flip-frei (`_laubStoffNormale`). Die Karte
        // (foliageTex) ist immer Krone; das Klingen-Laub (foliage) ist es am Baum und Strauch (`_krone`: die Wind-Daten der
        // Art oder der Stoff, von dem die Nah-Streu erbt) — Farn, Blüte, Schilf und Gestrüpp tragen ihre eigene Fläche, deren
        // Wicklung frei ist: sie lesen die Seite (r184 faceDirection), sonst läge jeder zweite Wedel im Dunkel.
        if (_krone) this._laubStoffNormale(TSL, mat);
        if (isBark) {
            // KEIN Normal-Override auf Vegetations-Stämmen: r184-NodeMaterial-Tangenten (UV-Derivate) kippen auf
            // gestreckten Tube-UVs die Normale → der Stamm liest schwarz. Die Rinde lebt über Albedo (Studio-
            // Vertex-Farben) + Roughness 0.93. Ihr Spiegel der Studio-Rinden-Normale (`_foundryBarkNormalTexture`) hatte
            // keinen Leser und fiel mit K60-2; die Normale lebt im Studio (foundry-core `makeBarkNormal`).
            mat.colorNode = TSL.vec4(vcol, 1.0);
        } else if (kind === "foliageTex") {
            // Blatt-Atlas: Alpha schneidet die Blattform aus (kein solides Quad), RGB × Vertex-Farbe (die
            // Vorlagen-Blattfarbe faerbt den Atlas). Es ist DER EINE Atlas, auf den die Studio-Karten routen
            // (phyto-core `bakeLeafAtlasBild`): Zelle 0 Baum-Zweig (`BLATT_ATLAS_BREIT`), 1 Weiden-Zweig (Trauer-Strähne,
            // `BLATT_ATLAS_WEIDE`), 2 Großblatt-Zweig (Strauch, `BLATT_ATLAS_GROSS`), 3 Nadel-Zweiglein (`BLATT_ATLAS_NADEL`) — dieselbe Textur wie
            // der Grammatik-Pfad (`_ensureFoliageClusterAtlas`), keine zweite.
            const atl = this._blattAtlasProbe(TSL);
            if (atl) {
                // Die Blattform schneidet die ALPHA von colorNode aus, nie `opacityNode`: der r184-Schattenpass
                // liest colorNode.a · map.a · maskShadowNode (`Renderer._getShadowNodes`), opacityNode nie — die
                // Nadel-Karten warfen volle Rechtecke. Die Atlas-Farbe: der EINE Leser (`_blattAtlasProbe`); die Deckung
                // trägt den Versatz des Laubs (A3, `_laubVersatz`), Bild und Schatten schneiden an der Zahl des Stoffs.
                mat.colorNode = TSL.vec4(atl.rgb.mul(laubFarbe), atl.a);
                mat.alphaTest = mp && typeof mp.alphaTest === "number" && mp.alphaTest > 0 ? mp.alphaTest : 0.5;
                mat.transparent = false;
            } else {
                // Nur headless (kein document): kein Stoff zeichnet — mit document liefert der Atlas oder bricht.
                mat.colorNode = TSL.vec4(laubFarbe, 1.0);
            }
        } else if (kind === "schatten") {
            // DER SCHATTEN-STOFF (S3, das EINE Wurf-Gesetz E1): der Schatten-Teil einer Stufe zeichnet nur in den Kaskaden
            // (SHADOW_TWIN_LAYER) — seine Alpha ist max(aDeckt, Atlas-Alpha): das Gerüst deckt ganz (aDeckt 1), die Karte
            // schneidet ihre Blattform aus dem EINEN Atlas (aDeckt 0). Die Alpha lebt in colorNode, nie in opacityNode:
            // der r184-Schattenpass liest colorNode.a · map.a · maskShadowNode (Lehre 26). EIN Programm für jeden
            // statischen Wurf (Baum-Teil, die Haus-Stufe 3 mit aDeckt 1).
            const atl = this._blattAtlasProbe(TSL);
            const deckt = TSL.attribute("aDeckt", "float");
            mat.colorNode = TSL.vec4(TSL.vec3(0.0), atl ? TSL.max(deckt, atl.a) : deckt);
            mat.alphaTest = 0.5;
            mat.transparent = false;
        } else if (klasseLook) {
            // Haut + Fell: Shader-Gesetze der Labs (koerperstudio matSkin: SSS-Fresnel-Saum · tetrapoda matFur:
            // Fell-Rim + Gold-Sheen + Spitzen-Rim/-Spec) reisen als DATEN (FELL_LOOK/HAUT_LOOK/HAAR_LOOK, Kern-
            // Zahlen = die EINZIGE Quelle) und werden hier als emissive-Additive gewoben (wie das Lab-GLSL).
            // Strähnen-Achse: der Bäcker trägt sie als Farbverlauf (__streuGeo: Wurzel = Ton×0.12); die Luminanz-
            // Ratio zum Ton-Anker (mp.color) gewinnt vStrandY zurück. Ohne Kern-LOOK/TSL-Symbole: byte-alt.
            mat.colorNode = TSL.vec4(vcol, 1.0);
            try {
                const tkC = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
                const kkC = typeof globalThis !== "undefined" ? globalThis.__koerperCore : null;
                const schale = kind === "fellSchale";
                const strand = kind === "hair" || kind.indexOf("straehne") === 0 || schale;
                const L =
                    kind === "skin" || kind === "haut"
                        ? kkC && kkC.HAUT_LOOK
                        : kind === "hair"
                          ? kkC && kkC.HAAR_LOOK
                          : kind === "fell"
                            ? tkC && tkC.FELL_LOOK && tkC.FELL_LOOK.koerper
                            : tkC && tkC.FELL_LOOK && tkC.FELL_LOOK.straehne;
                if (L) {
                    const ndv = TSL.normalView.normalize().dot(TSL.positionViewDirection).clamp(-1.0, 1.0);
                    const rim = TSL.float(1.0).sub(ndv.abs()).clamp(0.0, 1.0);
                    let add = null;
                    const term = (farbe, knoten) => {
                        const t = TSL.vec3(farbe[0], farbe[1], farbe[2]).mul(knoten);
                        add = add ? add.add(t) : t;
                    };
                    if (strand) {
                        // der Ton-Anker (seine Luminanz) ist ein Stoff-Wert: jeder Fell-/Haar-Ton zeichnet im Programm seiner Art
                        const tonL = _tonA ? this._stoffWert(TSL, "userData.stoffWerte.tonL") : null;
                        const wA = Number.isFinite(L.wurzelAnker) ? L.wurzelAnker : 0.12;
                        // DAS SCHALEN-FELL (V18.497): die Schale t (aSchale.x) IST die Strähnen-Achse. Die Haar-
                        // Maske liest die Wurzel (aWurzel, Bind-Raum — sie läuft mit jeder Pose mit): das Raster
                        // folgt der Gesetz-Dichte (aSchale.z = √Median Strähnen je Fläche), je Zelle eine Locke
                        // mit gewürfeltem Zentrum, deren Radius mit der lokalen Dichte (aSchale.y) wächst und zur
                        // Spitze zuläuft; sie endet bei 55–100 % der Fell-Länge. Die inneren zwei Schalen decken
                        // (Unterwolle), wo das Gesetz Fell trägt. Farbe Wurzel → Spitze = Ton × FELL_SCHALE.
                        const aS = schale ? TSL.attribute("aSchale", "vec3") : null;
                        if (schale) {
                            // Die Zahlen des Rasters sind DATEN des Gesetzbuchs (tetrapoda FELL_SCHALE, K45) — das Labor
                            // liest dieselben (worlds/tetrapoda, GLSL); fehlen sie, bricht der Stoff laut (_stoffBruch).
                            const FS = tkC.FELL_SCHALE;
                            const t = aS.x;
                            const p = TSL.attribute("aWurzel", "vec3").mul(aS.z);
                            const zelle = TSL.floor(p);
                            const hA = FS.hashA,
                                hB = FS.hashB;
                            const h1 = TSL.fract(TSL.sin(zelle.dot(TSL.vec3(hA[0], hA[1], hA[2]))).mul(hA[3]));
                            const h2 = TSL.fract(TSL.sin(zelle.dot(TSL.vec3(hB[0], hB[1], hB[2]))).mul(hB[3]));
                            const mitte = TSL.vec3(h1, h2, TSL.fract(h1.add(h2).mul(FS.hashC)))
                                .sub(0.5)
                                .mul(FS.mitte);
                            // der Strich: die Locke längs des Kamms (Lage − Wurzel quer zur Normale) gestreckt, flächentreu
                            const q = TSL.fract(p).sub(0.5).sub(mitte);
                            const kv = TSL.positionGeometry.sub(TSL.attribute("aWurzel", "vec3"));
                            const kq = kv.sub(TSL.normalGeometry.mul(kv.dot(TSL.normalGeometry)));
                            const ql = q.dot(kq.div(kq.length().max(1e-6)));
                            const dist = q.dot(q).sub(ql.mul(ql)).mul(FS.strich).add(ql.mul(ql).div(FS.strich)).sqrt();
                            const radius = aS.y
                                .sqrt()
                                .mul(FS.radius)
                                .mul(TSL.float(1.0).sub(t.mul(FS.zulauf)));
                            const haar = TSL.step(dist, radius).mul(TSL.step(t, h1.mul(FS.endeSpanne).add(FS.ende)));
                            const wolle = TSL.step(t, FS.wolle).mul(TSL.step(FS.wolleAb, aS.y));
                            // Der Ausschnitt lebt in colorNode.a wie jeder Ausschnitt (Lehre 26: der r184-Schattenpass liest
                            // colorNode.a, nie opacityNode) — kein Stoff schneidet über opacityNode, auch keiner, der heute
                            // nicht wirft. Die Kopf-Schalen (K28) tragen dasselbe Raster: Leib und Kopf EIN Stoff.
                            mat.alphaTest = 0.5;
                            mat.colorNode = TSL.vec4(
                                vcol.mul(TSL.mix(TSL.float(FS.wurzel), TSL.float(FS.spitze), t)),
                                TSL.max(haar, wolle)
                            );
                        }
                        const sT = schale
                            ? aS.x
                            : tonL !== null
                              ? vcolRoh
                                    .dot(TSL.vec3(0.2126, 0.7152, 0.0722))
                                    .div(tonL)
                                    .sub(wA)
                                    .div(Math.max(1e-3, 1 - wA))
                                    .clamp(0.0, 1.0)
                              : TSL.float(1.0);
                        if (Number.isFinite(L.tipRimPow) && Array.isArray(L.tipRimFarbe))
                            term(L.tipRimFarbe, rim.pow(L.tipRimPow).mul(sT));
                        if (Number.isFinite(L.specPow) && Array.isArray(L.specFarbe))
                            term(L.specFarbe, ndv.max(0.0).pow(L.specPow).mul(sT).mul(L.specAmt));
                    } else {
                        if (Number.isFinite(L.sssPow) && Array.isArray(L.sssFarbe))
                            term(L.sssFarbe, rim.pow(L.sssPow).mul(L.sssAmt));
                        if (Number.isFinite(L.rimPow) && Array.isArray(L.rimFarbe))
                            term(L.rimFarbe, rim.pow(L.rimPow).mul(L.rimAmt));
                        if (Number.isFinite(L.sheenPow) && Array.isArray(L.sheenFarbe))
                            term(L.sheenFarbe, ndv.max(0.0).pow(L.sheenPow).mul(L.sheenAmt));
                        // microFur-Sparkle (matFur: hash-Raster, Schwelle, Rim³): das Bäcker-Merge trägt kein garantiertes
                        // uv — das Raster des Bind-Raums (positionGeometry × dichte) ersetzt es; es klebt an der
                        // geskinnten Haut (V18.497), statt über die bewegten Beine zu schwimmen.
                        const mf = L.microFur;
                        if (mf && Array.isArray(mf.farbe)) {
                            const cell = TSL.floor(TSL.positionGeometry.xz.mul(mf.dichte));
                            const hsh = TSL.fract(TSL.sin(cell.dot(TSL.vec2(12.9898, 78.233))).mul(43758.5453));
                            term(mf.farbe, rim.pow(3.0).mul(TSL.step(mf.schwelle, hsh)).mul(mf.amt));
                        }
                    }
                    if (add) mat.emissiveNode = add;
                    // Wrap-Licht des Lab-Fells: ·(0.5 + 0.5·max(NdotV,0)) NACH allen Additiven — die matFur-Ordnung
                    // (outputNode multipliziert den fertigen Output inkl. emissive-Terme).
                    if (Number.isFinite(L.wrap)) {
                        const w = ndv
                            .max(0.0)
                            .mul(L.wrap)
                            .add(1.0 - L.wrap);
                        mat.outputNode = TSL.vec4(TSL.output.rgb.mul(w), TSL.output.a);
                    }
                    // Atem-Noise-Displacement der Labs (matFur/matSkin: snoise(pos·freq + t·k)·amp; hier mx_noise, gleiche
                    // Rausch-Klasse) auf fell und skin. Die Tier-Haut (fell) ist seit V18.497 geskinnt: r184
                    // setupPosition fährt das Skinning VOR dem positionNode (Vendor gelesen) — sie atmet gebogen.
                    // Die haut-Hülle des Menschen bleibt still.
                    const at = L.atem;
                    if (at && (kind === "fell" || kind === "skin")) {
                        mat.positionNode = TSL.positionLocal.add(
                            TSL.normalLocal.mul(
                                TSL.mx_noise_float(TSL.positionLocal.mul(at.freq).add(TSL.time.mul(at.t))).mul(at.amp)
                            )
                        );
                    }
                }
            } catch (_eL) {
                throw this._stoffBruch("die Look-Addition (Haut · Fell · Haar)", _eL);
            }
        } else if (mp && mp.webe) {
            // Stoff-Webung (Studio-getCloth): feine Mikro-Struktur moduliert die Stoff-Farbe (Strick grob, Denim/
            // Baumwolle fein, Leder/Gummi glatt-marmoriert) — additiv, nur wenn die Gesetz-Zeile Webung trägt. Frequenz und
            // Tiefe sind die EINE Webungs-Tafel des Kerns (koerper-core WEBE, das Labor liest dieselbe), fail-closed (K2).
            const webe = AnazhRealm.Gesetz("koerper:WEBE." + mp.webe);
            if (!Array.isArray(webe)) throw this._stoffBruch("die Webung " + mp.webe + " fehlt in koerper:WEBE");
            const [wf, wa] = webe;
            const wn = TSL.mx_noise_float(TSL.positionLocal.mul(wf)).mul(wa).add(1.0);
            mat.colorNode = TSL.vec4(vcol.mul(wn), 1.0);
        } else if (R.ub) {
            // DAS UNBELEUCHTETE IST LICHT (w4-genesis-tore): ein Stoff ohne Licht-Antwort im Labor (MeshBasic: das Filigran, der
            // Bogen-Saum und die Licht-Scheibe der Tore) leuchtet in seiner Farbe (das Leucht-Gesetz oben, `leucht` 1) und wirft
            // kein Licht zurück — schwarz, wie im Labor, wo kein Licht auf ihn wirkt. Bis hier zeichnete die Welt ihn matt
            // beleuchtet (Rauheit 0,7): das glühende Filigran stand als olives Messing im Schatten.
            mat.colorNode = TSL.vec4(0.0, 0.0, 0.0, 1.0);
        } else if (mp && typeof mp.stein === "string") {
            // DAS STEIN-GESETZ (porta STEIN_GESETZ, w4-genesis-tore): Fuge, Kante, Bruchton und Mikro-Relief aus der Lage im
            // Verband (`_steinStoff`, das uv der Teile); die Zahlen liest der Stoff aus dem Gesetzbuch (fail-closed wie die Webung).
            const G = AnazhRealm.Gesetz("porta:STEIN_GESETZ." + mp.stein);
            if (!G || !(G.fuge > 0) || !(G.fase > 0) || !(G.ton >= 0) || !(G.fugeTon > 0))
                throw this._stoffBruch("das Stein-Gesetz " + mp.stein + " fehlt in porta:STEIN_GESETZ");
            const rauh = satz ? TSL.attribute("aRegler", "vec3").x : TSL.float(rough);
            this._steinStoff(TSL, mat, vcol, G, TSL.smoothstep(0.3, 0.6, rauh));
            mat.userData.stein = mp.stein; // der Bau-Satz trägt das uv seiner Ecken (`BAU_STEIN_ATTR`)
        } else {
            // Fels/Kristall/Blume/Laub: die Vertex-Farbe (Laub/Gras × uSeasonMul), die Regler (rough/metal/flat/
            // env) sind schon oben aus `mp` gesetzt → Kristall glaenzt facettiert, Fels bleibt matt.
            mat.colorNode = TSL.vec4(laubFarbe, 1.0);
        }
        // DIE REGLER JE ECKE (K43-2, der EINE Satz-Stoff): Rauheit · Metall · Deckkraft aus `aRegler`, das Emissiv × Glut-Stärke
        // aus `aGlut` — vor der Blende (sie multipliziert die Deckung) und vor dem Leucht-Gesetz (es addiert den Licht-Pool
        // auf das Emissiv; ein Stoff des Leucht-Gesetzes `leucht` behält sein Emissiv aus der Farbe).
        if (satz === true) {
            const rg = TSL.attribute("aRegler", "vec3");
            mat.roughnessNode = rg.x;
            mat.metalnessNode = rg.y;
            // die Deckkraft lebt in colorNode.a wie jeder Ausschnitt (Lehre 26: nie opacityNode), die Marke 0,5 trägt nichts bei
            if (R.op < 1) {
                mat.opacity = 1;
                mat.colorNode = TSL.vec4(mat.colorNode.rgb, mat.colorNode.a.mul(rg.z));
            }
            if (!(mp && typeof mp.leucht === "number" && mp.leucht > 0))
                mat.emissiveNode = TSL.attribute("aGlut", "vec3");
            mat.userData = mat.userData || {};
            mat.userData.satzSchluessel = key;
        }
        // DER HALM (w4-wiese-nah, phyto-core HALM_GESETZ): Querschnitt, Adern und Narbe je Pixel des Schirms, fern die Wiese als
        // DACH (licht.K1: die Normale des Dachs, Rauheit 1) — EIN Gesetz (`_halmStoff`), hinter dem Satz-Regler (er gilt jeder
        // Wiese, die Cuticula liest dessen Rauheit); das direkte Licht im Laub-Licht mit der Narbe (unten). Mit der Klinge allein
        // lichtete der doppelseitige Halm wie eine Wand: die Nah-Wiese hob die Stunde 0,33 über den Mittag (Mess-Wiese Ego,
        // swiftshader: +0,37 EV), das Dach mit der Rauheit der Klinge (0,7) spiegelte die Abendsonne (+0,32 EV).
        if (kind === "grass") this._halmStoff(TSL, mat);
        // DAS MIKRO-RELIEF DER FACETTE (material.K2, `_mikroGestalt`): der facettierte Studio-Stein (Fels, Kristall: kind
        // „unknown" mit flatShading) kippt seine Facetten in den Oktaven am Schirm, gewogen mit seiner Rauheit (glatt ≤ 0,3 nichts,
        // matt ≥ 0,6 ganz) — im Satz die Rauheit je Ecke, sonst die des Stoffs
        if (flat && kind === "unknown") {
            const rauh = satz ? TSL.attribute("aRegler", "vec3").x : TSL.float(rough);
            this._mikroGestalt(TSL, mat, true, TSL.smoothstep(0.3, 0.6, rauh));
        }
        // Studio-Dither-Blende auf den Foundry-3D-Stufen: Fade-out L0 + Fade-in L1 (Laub überlappend, Rinde
        // exakte Partition); die Maske faltet in die Alpha (TSL statt discard, alphaTest cullt). Formeln = die
        // EINE Quelle `__phytoCore.lodCrossfadeMask` (via `_lodCrossfadeMaskNode`); xfade aus = Material
        // unverändert. Die Klassen-Look-Familie (Kreatur/Mensch, aLodLevel=0 → Maske = Identität) bleibt
        // maskenfrei — sonst nur tote Attribut-Reads + Warnungen auf ungestempelten Geometrien.
        if (xfade && !klasseLook) {
            const _keepX = this._lodCrossfadeMaskNode(TSL, {
                foliage: kind === "foliage" || kind === "foliageTex" || kind === "grass",
            });
            {
                // DER KANAL der Maske: der r184-Schattenpass liest colorNode.a, nie opacityNode — nur eine Maske in der
                // Farbe gilt auch dort. Die Instanz-Wahl liest Marke und Kanal (`_instanzFensterGilt`): ein Fenster
                // ohne die Maske des Passes schnitte ein Loch.
                let kanal = null;
                if (mat.opacityNode) {
                    mat.opacityNode = mat.opacityNode.mul(_keepX);
                    kanal = "deckung";
                } else if (mat.colorNode && mat.colorNode.rgb !== undefined && mat.colorNode.a !== undefined) {
                    mat.colorNode = TSL.vec4(mat.colorNode.rgb, mat.colorNode.a.mul(_keepX));
                    kanal = "farbe";
                } else
                    throw this._blendeBruch(
                        `der Stoff „${kind}" trägt keinen Kanal für die Maske (Deckung oder Farbe mit Alpha)`
                    );
                // die Schwelle trennt die Maske (0 | 1), nie die Deckkraft des Stoffs: eine Scheibe (Deckkraft 0,42 < 0,5)
                // fiel bis K11 ganz unter die Schwelle — kein Fenster, keine Wagen-Scheibe zeichnete, das Fenster-Licht
                // der Nacht (`_leuchtStoff`) blieb unsichtbar
                // (der Satz-Stoff liest die Deckkraft je Ecke: seine Schwelle liegt unter jeder Deckkraft eines Stoffs, 1/255)
                if (!(mat.alphaTest > 0)) mat.alphaTest = satz === true && R.op < 1 ? 1 / 255 : 0.5 * R.op;
                mat.userData = mat.userData || {};
                mat.userData.foundryCrossfade = true;
                mat.userData.foundryCrossfadeKanal = kanal;
            }
        }
        // DIE DURCHSICHT: jeder Pflanzen-Stoff (Rinde · Stiel · Laub · Blatt-Karte; nie Gras, nie die Klassen-Look-Familie
        // der Kreaturen und Menschen) wird zwischen Auge und Spieler und in der Nah-Kugel um das Auge durchsichtig
        // (`_kameraDurchsichtNode` seiner Art: der wiegende Stoff der Nah-Streu ist Boden, sonst Rinde oder Laub) — im
        // maskNode, den nur der Bild-Pass liest; der Schatten-Pass liest seinen eigenen maskShadowNode (immer behalten).
        if (!klasseLook && (isBark || kind === "foliage" || kind === "foliageTex")) {
            const _durch = this._kameraDurchsichtNode(TSL, wiegen === true ? "boden" : isBark ? "rinde" : "laub");
            mat.maskNode = _durch;
            mat.maskShadowNode = TSL.bool(true);
        }
        // Die Nah-Wiese wiegt (V18.508): das Studio-Gras liest dieselbe Böen-Welle wie die Streu
        // (`_windSwayOffset`, Gleichtakt) mit der Halm-Höhe in Metern (Vorlage × Studio-Skala `gras`), und
        // der Spieler biegt die Halme (uBend). Gemessen W7 (WGSL der Senke): r184 rechnet den Versatz VOR der
        // Instanzierung — Phase und Biegung lesen den Vorlagen-Raum, der Versatz dreht und skaliert mit der Instanz.
        if (kind === "grass") {
            this._windUniformsEnsure();
            const _sk = this._foundryWorldScaleMatrix("gras").elements[0];
            const _sway = this._windSwayOffset(TSL, { ampX: 1.5, hoehe: TSL.positionGeometry.y.mul(_sk) });
            mat.positionNode = TSL.positionLocal.add(_sway);
        } else if (wiegen === true) {
            // DIE NAH-STREU WIEGT (Integration 05.10.): die weichen Boden-Arten (Farn · Schilf · Gestrüpp · Blume)
            // lesen dieselbe Böen-Welle wie Gras und Baum aus der EINEN Quelle (`_windSwayOffset`: uWindTime ·
            // uWindDir · Böe · uBend) mit der Höhe über der Wurzel in Metern (Vorlage × Welt-Skala der Pflanze — der
            // Satz trägt sie je Vertex als `aWiege`, seine Positionen liegen in Welt-Lage: Phase und Biegung lesen die
            // Welt, der Versatz liegt in Welt-Richtung). Jeder Teil einer Pflanze trägt denselben Versatz — Rute und
            // Laub, Stiel und Blüte bleiben verbunden; der Charakter (ampX 1,2) ist der des gefallenen
            // Klein-Vegetations-Zwillings.
            this._windUniformsEnsure();
            const _sway = this._windSwayOffset(TSL, { ampX: 1.2, hoehe: TSL.attribute("aWiege", "float") });
            mat.positionNode = (jahr === true ? this._jahrLage(TSL) : TSL.positionLocal).add(_sway);
        }
        // DAS JAHR OHNE BAUM-WIND (die Blende aus): sonst webt `_baumWindStoff` die Lage des Jahrs in den Wind-Knoten
        const _baumWind = xfade && (isBark || kind === "foliage" || kind === "foliageTex" || kind === "schatten");
        if (jahr === true && !mat.positionNode && !_baumWind) mat.positionNode = this._jahrLage(TSL);
        // EIN GRAPH JE SIGNATUR (1310-18, `_graphTeilen`; 1310-17: 43 Foundry-Stoffe, 43 Bauten). Die Signatur nennt jede
        // Eingabe, an der der Bau oben verzweigt (Art · Rinde · Look-Klasse · Leucht · Gewebe · Ton-Anker der Strähne · Blende ·
        // Wiegen) — die Werte je Stoff liest der Graph als Stoff-Wert, die Regler (Rauheit, Metall, Leuchtfarbe, Deckkraft,
        // Schwelle) liest r184 als Stoff-Referenz. Der Satz-Stoff (K43-2) ist eine Eingabe: er liest Rauheit und Metall je Ecke
        // (`aRegler`), das Emissiv aus `aGlut` und, durchsichtig, die Deckkraft in colorNode.a.
        const _sig = [
            kind,
            isBark ? "rinde" : "",
            klasseLook ? "look" : "",
            mat.userData.stoffWerte.leucht > 0 ? "leucht" : "",
            mp && mp.webe && !isBark && !klasseLook && kind !== "foliageTex" && kind !== "schatten"
                ? "webe:" + mp.webe
                : "",
            _tonA && klasseLook ? "ton" : "",
            xfade ? "xf" : "",
            wiegen === true ? "wiegt" : "",
            satz === true ? (R.op < 1 ? "satz:durch" : "satz") : "",
            ton ? "aTon" : "", // die Farbe je Ecke nach der Palette des Leibs (`vcol`): ohne Blende teilte sie sonst einen Graphen
            jahr === true ? "jahr" : "",
            // das Unbeleuchtete (schwarz, nur Leuchten) und der Stein (Fuge, Kante, Ton aus dem uv) bauen eigene Graphen
            R.ub ? "ub" : "",
            mp && typeof mp.stein === "string" && !R.ub ? "stein:" + mp.stein : "",
        ].join("|");
        this._graphTeilen(mat, _sig, [
            "colorNode",
            "emissiveNode",
            "opacityNode",
            "outputNode",
            "positionNode",
            "maskNode",
            "maskShadowNode",
            "roughnessNode",
            "metalnessNode",
        ]);
        mat.userData.foundrySignatur = _sig;
        mat.userData.foundryKind = kind; // die Art vor dem Leuchten: die Nässe liest ihre Poren (`_naesseImStoff`)
        // das Leuchtquellen-Gesetz: der Licht-Pool und der Zeitplan des Gesetzbuchs (`mp.licht`) im Leuchten (K11)
        this._leuchtStoff(mat, mp);
        mat.userData.foundryMp = mp || null; // die Regler reisen mit: die Nah-Streu baut denselben Stoff wiegend
        // Kein stiller Rückfall: ein Stoff, der nicht baut, wirft laut (bis K11 fing ein Fang jeden Fehler und baute einen
        // Standard-Stoff ohne Knoten — ohne Pool, ohne Maske, ohne Wind).
        this._foundryMats[key] = mat;
        // der Wurf-Teil (kind "schatten") trägt denselben Wind wie das Bild seiner Stufe; der Wurf eines Baus steht (an 0)
        if (xfade && !wiegen && (isBark || kind === "foliage" || kind === "foliageTex" || kind === "schatten"))
            this._baumWindStoff(mat, kind, baum);
        if (kind === "foliage" || kind === "foliageTex") this._laubLichtStoff(mat, kind === "foliageTex");
        else if (kind === "grass") this._laubLichtStoff(mat, false, TSL.uv().y);
        return mat;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_studio_stoff]);
