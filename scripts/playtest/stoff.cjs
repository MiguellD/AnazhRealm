"use strict";
// scripts/playtest/stoff.cjs — der Richter von Stoff (spec/stamm/modul-karte.json): Uniform-Heimat · PBR-Knoten · Substanz-Antwort · Gras-Stoff und Wind · Stoff-Regler · Instanz-Senken und ihr Zeichner · Laub-Licht · Baum-Wind · Impostor-Atlas.
// 8 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// Reflexions-Audit — vier Wände: (1) der Schatten-Weite-Slider treibt unter CSM csm.maxFar (kein
// toter Knopf) · (2) Kachel-Erosion ohne flowTo-Ballast · (3) die Bestbewertet-Rail liest die
// aggregierte Wertung · (4) die Nah-Streu würfelt je (Zelle, Art) aus Zelle + Welt-Seed (Γ5, Waldboden 04.10.).
// Gegenprobe: die CSM-Haupt-Map rendert NICHT (mainMap=false).
async function checkBandV18136Audit(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        // (1) der Slider treibt unter CSM die Kaskaden-Reichweite (kein toter Knopf). V18.352 — der
        // `csm.maxFar`-Antrieb wanderte in `_applyEffectiveShadowRange` (DIE EINE Anwende-Quelle, die
        // setShadowRange UND der Perf-Regler rufen); die Sonde folgt dem Refactor (V9.56-i).
        out.rangeSrc =
            /csm\.maxFar/.test(window.__codeOf(r._applyEffectiveShadowRange)) &&
            /_applyEffectiveShadowRange/.test(window.__codeOf(r.setShadowRange));
        const savedCsm = r.state.csmNode;
        const savedRange = r.state.atmosphere && r.state.atmosphere.shadowRange;
        r.state.csmNode = { maxFar: 0, camera: null, updateFrustums() {} };
        r.setShadowRange(200);
        out.rangeDrives = Math.abs(r.state.csmNode.maxFar - 360) < 1e-9;
        r.state.csmNode = savedCsm;
        if (Number.isFinite(savedRange)) r.setShadowRange(savedRange);
        // (2) die Kachel-Erosion ist gefallen (K16): der Kachel-Eingang baut nur noch die Hydrosphäre.
        out.tileLean = !/eTile|_computeErosion|erosionTiles/.test(window.__codeOf(r._ensureHydroTilesAround));
        return out;
    });
    if (!res) {
        check("V18.136 Audit: Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "V18.136 Audit: der Schatten-Weite-Slider treibt unter CSM maxFar (kein toter Knopf)",
        res.rangeSrc && res.rangeDrives
    );
    check(
        "V18.136 Audit: der Kachel-Eingang baut keine Kachel-Erosion mehr (K16: die Täler kommen aus dem Flussnetz)",
        res.tileLean
    );
}

// M7 Licht-Feinschliff: der Terrain-NACHT-BODEN als Füll-Licht (Mittag per Konstruktion ≈ gleich)
// + die Mikro-Struktur als LEBENDIGER Regler (eine Konstante im Tree wäre ein toter Slider-Knopf).
async function checkBandM7LichtFeinschliff(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const au = r._ensureAtmoUniforms();
        // (1) beide Hebel sind UNIFORMS (lebendig, nicht eingebacken).
        out.uniforms = !!au && !!au.microStrength && !!au.terrainNightFloor;
        // (2) die Setter TREIBEN die Uniforms (KONSUM, mit Restore).
        const m0 = au.microStrength.value;
        const n0 = au.terrainNightFloor.value;
        r.setMicroStrength(0.27);
        r.setTerrainNightFloor(0.21);
        out.settersDrive =
            Math.abs(au.microStrength.value - 0.27) < 1e-9 && Math.abs(au.terrainNightFloor.value - 0.21) < 1e-9;
        r.setMicroStrength(m0);
        r.setTerrainNightFloor(n0);
        // (4) die Regler leben in den Einstellungen + treiben die Setter.
        const mtS = document.getElementById("slider-microtex");
        const nfS = document.getElementById("slider-nightfloor");
        out.slidersLive = !!mtS && !!nfS;
        if (mtS) {
            mtS.value = "30";
            mtS.dispatchEvent(new Event("input", { bubbles: true }));
            out.sliderDrives = Math.abs(au.microStrength.value - 0.3) < 1e-9;
            mtS.value = String(Math.round(m0 * 100));
            mtS.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return out;
    });
    check(
        "M7 Licht: Mikro-Struktur + Nacht-Boden sind LEBENDIGE Uniforms (keine eingebackenen Konstanten)",
        res.uniforms
    );
    check(
        "M7 Licht: die Setter treiben die Uniforms (setMicroStrength/setTerrainNightFloor — KONSUM)",
        res.settersDrive
    );
    check(
        "M7 Licht: die Einstellungs-Regler leben und treiben die Setter (kein toter Knopf)",
        res.slidersLive && res.sliderDrives
    );
}

async function checkBandLambda3Wind(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        // K19: den Wind trägt kein Substanz-Tag — die Achse `wiegen` ist fort, Holz und Stein stehen.
        const laubProfile = r._substanceResponseProfile({ tags: { lebendig: 1, dichte: 0.3, zähigkeit: 0.7 } });
        out.wiegenFort = !("wiegen" in laubProfile);
        return out;
    });
    check("Λ.3 Wind: kein Substanz-Tag trägt den Wind (die Achse wiegen ist fort, K19)", res.wiegenFort === true);
}

async function checkBandLambda6Detail(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const laubProfile = r._substanceResponseProfile({ tags: { lebendig: 1, dichte: 0.3 } });
        const glasProfile = r._substanceResponseProfile({ tags: { transparent: 1, magieleitung: 0.8 } });
        const steinProfile = r._substanceResponseProfile({ tags: { lebendig: 0, dichte: 1, härte: 1 } });
        out.laubDetail = laubProfile.detail;
        out.glasDetail = glasProfile.detail;
        out.steinDetailNull = steinProfile.detail;
        return out;
    });
    check(
        `Λ.6 Detail: laub-Profil.detail > 0.4 (GEMESSEN ${res.laubDetail && res.laubDetail.toFixed(3)})`,
        Number.isFinite(res.laubDetail) && res.laubDetail > 0.4
    );
    check(
        `Λ.6 Detail: glas-Profil.detail > 0.4 (GEMESSEN ${res.glasDetail && res.glasDetail.toFixed(3)})`,
        Number.isFinite(res.glasDetail) && res.glasDetail > 0.4
    );
    check("Λ.6 Detail: stein-Profil.detail === 0 (kein Translucency auf Stein)", res.steinDetailNull === 0);
}

async function checkBandWEFrequenzband(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const mats = r.state.materials;
        // (1) die ANTENNE emergiert aus der Substanz (Ordnung der Achsen).
        const pEisen = r._substanceResponseProfile(mats.eisen.tags);
        const pHolz = r._substanceResponseProfile(mats.holz.tags);
        const pGlut = r._substanceResponseProfile(mats.glut.tags);
        const pStein = r._substanceResponseProfile(mats.stein.tags);
        const pQuarz = r._substanceResponseProfile(mats.quarz.tags);
        out.glanzOrdnung = pEisen.glanz > pHolz.glanz + 0.2;
        out.glimmenOrdnung = pGlut.glimmen > pStein.glimmen + 0.3 && pQuarz.glimmen > pStein.glimmen + 0.2;
        out.waermeOrdnung = pHolz.waerme > pEisen.waerme + 0.3;
        out.glasOrdnung = pQuarz.glas > 0.8 && pStein.glas < 0.1;
        // (2) die Tags REISEN in beide Part-Builder (Spiegel-Disziplin) und
        // WIRKEN behavioral (V17.31, kein Existenz-Test): das HISM-Leaf eines
        // Glut-Parts glimmt stärker als ein Stein-Part (gewichteter Emissiv).
        const mGlut = r._archLeafMaterial({ material: "glut", shape: "box", size: { x: 1, y: 1, z: 1 } });
        const mStein = r._archLeafMaterial({ material: "stein", shape: "box", size: { x: 1, y: 1, z: 1 } });
        // V18.234 — mode-robust: der echte Glow = Emissiv-FARBE × Intensität.
        // (MeshStandard hat emissiveIntensity-Default 1 bei SCHWARZEM Emissiv = kein
        // Glühen → der reine emissiveIntensity-Proxy war toon-spezifisch.)
        const _glow = (m) => {
            if (!m || !m.emissive) return 0;
            const i = Number.isFinite(m.emissiveIntensity) ? m.emissiveIntensity : 1;
            return (m.emissive.r + m.emissive.g + m.emissive.b) * i;
        };
        out.tagsReisen = _glow(mGlut) > _glow(mStein) + 0.01;
        out.tagsImBuilder =
            /matOpts\.tags = partMatDef\.tags/.test(window.__codeOf(r._buildFromBlueprint)) &&
            /matOpts\.tags = partMatDef\.tags/.test(window.__codeOf(r._archLeafMaterial));
        // (4) das Band trifft ALLE Ebenen: das Werk-Profil bestellt fuell+mond,
        // das Gras ist angedockt (Source + outputNode-KONSUM).
        const SR = r.constructor.SUBSTANCE_RESPONSE;
        out.werkAmBand = SR.defaults.werk.fuell > 0 && SR.defaults.werk.mond > 0;
        out.grasDocked = /_applySubstanceResponse/.test(window.__codeOf(r._grassInstanceMat));
        const gm = r._grassInstanceMat();
        out.grasOutput = !!gm && gm.outputNode != null;
        // (6) R-013 Schöpfer-Wort: Standard 0.06/0.06 als EINE Quelle + der
        // Restore migriert den alten auto-gebackenen 0.12-Default.
        out.defaults = Math.abs(SR.nightFloor - 0.06) < 1e-9 && Math.abs(SR.moonRim - 0.06) < 1e-9;
        out.restoreMigriert = /setTerrainNightFloor\(Math\.abs/.test(
            window.__codeOf(r._loadStateRestoreSoulAndAtmosphere)
        );
        return out;
    });
    check(
        "W-E Frequenzband: die Antenne EMERGIERT aus der Substanz (glanz: Eisen>Holz · glimmen: Glut/Quarz>Stein · waerme: Holz>Eisen · glas: Quarz)",
        res.glanzOrdnung && res.glimmenOrdnung && res.waermeOrdnung && res.glasOrdnung
    );
    check(
        "W-E Frequenzband: die Substanz-Tags REISEN in beide Part-Builder (Spiegel) + wirken behavioral (Glut-Leaf glimmt stärker als Stein)",
        res.tagsReisen && res.tagsImBuilder
    );
    check(
        "W-E Frequenzband: das Band trifft ALLE Ebenen — Werk-Familie am fuell/mond-Band + Gras angedockt (outputNode-KONSUM)",
        res.werkAmBand && res.grasDocked && res.grasOutput
    );
    check(
        "W-E R-013: nightFloor/moonRim-Standard 0.06 (Schöpfer-Wort, EINE Quelle) + Restore migriert den gebackenen 0.12-Default",
        res.defaults && res.restoreMigriert
    );
}

// PBR-Pfad: roughness + metalness werden aus Material-Tags HERGELEITET (Physik, keine Gefühls-
// Patches). Proben: Builder existiert, Dispatch wirkt, Roughness/Metalness folgen den Tags.
async function checkBandV18223PbrKohaerenz(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};
        out.pbrBuilderExists = typeof r._buildPbrNodeMaterial === "function";
        out.modeFlagDefault = r.state.atmosphere && r.state.atmosphere.materialMode === "pbr"; // V18.234 — PBR ist Default

        // Build a PBR material directly
        if (out.pbrBuilderExists) {
            // Default-Material (kein opts.tags) → roughness 0.7, metalness 0
            const mDefault = r._buildPbrNodeMaterial({ color: 0x808080 });
            out.defaultMatBuilt = !!mDefault;
            if (mDefault) {
                out.defaultIsMeshStandard =
                    mDefault.isMeshStandardMaterial === true || /MeshStandardNode/.test(mDefault.type || "");
                out.defaultUserDataPbr = mDefault.userData && mDefault.userData.isPbrMaterial === true;
                out.defaultRoughness = mDefault.userData && mDefault.userData.pbrRoughness;
                out.defaultMetalness = mDefault.userData && mDefault.userData.pbrMetalness;
                out.defaultIsDielectric = Math.abs(mDefault.userData.pbrMetalness) < 1e-9;
                out.defaultRoughnessMid = mDefault.userData.pbrRoughness > 0.5 && mDefault.userData.pbrRoughness < 0.9;
                if (typeof mDefault.dispose === "function") mDefault.dispose();
            }

            // EISEN-Material (dichte 0.9, magieleitung 0.85) → metallisch + glatt
            const mEisen = r._buildPbrNodeMaterial({ color: 0x707080, tags: { dichte: 0.9, magieleitung: 0.85 } });
            if (mEisen) {
                out.eisenMetalnessHigh = mEisen.userData.pbrMetalness >= 0.7;
                out.eisenRoughnessLow = mEisen.userData.pbrRoughness <= 0.4;
                if (typeof mEisen.dispose === "function") mEisen.dispose();
            }

            // LAUB-Material (lebendig 0.95) → rauh, kein Metall
            const mLaub = r._buildPbrNodeMaterial({ color: 0x4a8a3a, tags: { lebendig: 0.95 } });
            if (mLaub) {
                out.laubRoughnessHigh = mLaub.userData.pbrRoughness >= 0.85;
                out.laubMetalnessZero = Math.abs(mLaub.userData.pbrMetalness) < 1e-9;
                if (typeof mLaub.dispose === "function") mLaub.dispose();
            }

            // STEIN-Material (dichte 0.85, kein Metall) → rauh, kein Metall
            const mStein = r._buildPbrNodeMaterial({ color: 0x6e6e6e, tags: { dichte: 0.85 } });
            if (mStein) {
                out.steinDielectric = Math.abs(mStein.userData.pbrMetalness) < 1e-9;
                out.steinRoughnessHigh = mStein.userData.pbrRoughness >= 0.8;
                if (typeof mStein.dispose === "function") mStein.dispose();
            }

            // GLUT-Material (brennbar 0.95) → emissiv-glühend. V18.234 — das PBR-Emissiv
            // folgt der glimmen-Achse (waermeleitung·brennbar, wie Toon) → realistische Glut.
            const mGlut = r._buildPbrNodeMaterial({ color: 0xff5020, tags: { brennbar: 0.95, waermeleitung: 0.9 } });
            if (mGlut) {
                out.glutEmissive = mGlut.emissiveIntensity > 0;
                out.glutRoughnessLow = mGlut.userData.pbrRoughness <= 0.5;
                if (typeof mGlut.dispose === "function") mGlut.dispose();
            }
        }

        // Dispatch-Behavior: Mode auf "pbr" setzen + Toon-Builder rufen → PBR-Material
        const savedMode = r.state.atmosphere && r.state.atmosphere.materialMode;
        try {
            r.state.atmosphere.materialMode = "pbr";
            const m = r._buildToonNodeMaterial({ color: 0x808080 });
            out.dispatchYieldsPbr = m && m.userData && m.userData.isPbrMaterial === true;
            if (m && typeof m.dispose === "function") m.dispose();
        } finally {
            if (r.state.atmosphere) r.state.atmosphere.materialMode = savedMode;
        }

        // V18.234 — Default-Mode ist jetzt "pbr" → der Dispatch liefert ein PBR-Material.
        const mDef = r._buildToonNodeMaterial({ color: 0x808080 });
        out.defaultIsPbr = !!(mDef && mDef.userData && mDef.userData.isPbrMaterial === true);
        if (mDef && typeof mDef.dispose === "function") mDef.dispose();

        // Version
        out.versionStr = A.VERSION;
        const partsV = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor18223 = partsV[0] > 18 || (partsV[0] === 18 && partsV[1] >= 223);
        return out;
    });

    check("V18.223 (Q1) _buildPbrNodeMaterial Helper existiert", res.pbrBuilderExists === true);
    check(
        "V18.223/234 (Q2) atmosphere.materialMode Default `pbr` (physik-Licht, keine halben Sachen)",
        res.modeFlagDefault === true
    );

    check("V18.223 (P1) Default-PBR-Material wird gebaut", res.defaultMatBuilt === true);
    check("V18.223 (P2) Default-PBR-Material ist MeshStandardNodeMaterial", res.defaultIsMeshStandard === true);
    check("V18.223 (P3) userData.isPbrMaterial=true (Diagnose-Marker)", res.defaultUserDataPbr === true);
    check(
        `V18.223 (P4) Default ist dielektrisch (metalness=0, gemessen ${res.defaultMetalness})`,
        res.defaultIsDielectric === true
    );
    check(
        `V18.223 (P5) Default roughness im Mittel (0.5..0.9, gemessen ${res.defaultRoughness})`,
        res.defaultRoughnessMid === true
    );

    check("V18.223 (S1) EISEN (dichte+magie) → metalness ≥ 0.7 (PHYSIK)", res.eisenMetalnessHigh === true);
    check("V18.223 (S2) EISEN → roughness ≤ 0.4 (glatt, glänzend)", res.eisenRoughnessLow === true);
    check("V18.223 (S3) LAUB (lebendig) → roughness ≥ 0.85 (rauh)", res.laubRoughnessHigh === true);
    check("V18.223 (S4) LAUB → metalness=0 (kein Metall)", res.laubMetalnessZero === true);
    check("V18.223 (S5) STEIN (dichte ohne Metall) → dielektrisch", res.steinDielectric === true);
    check("V18.223 (S6) STEIN → roughness ≥ 0.8 (matt)", res.steinRoughnessHigh === true);
    check("V18.223 (S7) GLUT (brennbar) → emissiveIntensity > 0", res.glutEmissive === true);
    check("V18.223 (S8) GLUT → roughness ≤ 0.5 (glatt-warm)", res.glutRoughnessLow === true);

    check("V18.223 (D1) Dispatch: mode=pbr → _buildToonNodeMaterial liefert PBR", res.dispatchYieldsPbr === true);
    check(
        "V18.223/234 (D2) Default-Mode: _buildToonNodeMaterial-Dispatch liefert PBR (Default pbr)",
        res.defaultIsPbr === true
    );

    check(`V18.223 (V1) VERSION floor ≥ 18.223.0 (gemessen ${res.versionStr})`, res.versionFloor18223 === true);
}

// Wahrer Anblick I — der LAWFUL Boden: per-Fragment Multi-Klassen-Geologie als geteilter Auslesewert
// (Toon + PBR). Fels/Geröll EMERGIEREN aus der Steile, Moos aus flach + feucht. KONSUM: beide
// Builder rufen den Helfer, die Uniforms treiben, der colorNode ist gesetzt (auch PBR).
async function checkBandWahrerAnblickSaeule1(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const THREE = window.THREE;
        const out = {};

        // (A) Helfer + gesetzmäßige Konfiguration
        out.helperExists = typeof r._terrainGeologyAlbedo === "function";
        const G = A.TERRAIN_GEOLOGY;
        out.configFrozen = !!G && Object.isFrozen(G);
        out.slopeOrderRock = !!G && G.rockLo < G.rockHi;
        out.slopeOrderScree = !!G && G.schuttGitter > 0 && G.schuttGitter <= 2 * 3.6;
        out.screeBeforeRock = !!G && G.schuttKandidat < G.rockLo;
        // Der Fels-Ton ist das Gesetz (K17, gelaende-core `felsBasis` über `FELS_STOFF`), kein Tint der Geologie mehr.
        const FS = A.FELS_STOFF;
        out.tintsAreRgb =
            !!G &&
            !("rockTint" in G) &&
            !!FS &&
            Array.isArray(FS.basis.basis) &&
            FS.basis.basis.length === 3 &&
            Array.isArray(FS.mittel) &&
            FS.mittel.length === 3 &&
            Array.isArray(G.mossTint) &&
            G.mossTint.length === 3;
        out.mossMaxBounded = !!G && G.mossMax > 0 && G.mossMax <= 1;


        // (C) Uniforms TREIBEN (V18.65) — nach ensure existieren geoRock/geoMoss
        r._ensureAtmoUniforms();
        const au = r.state.atmoUniforms;
        out.geoRockUniform = !!(au && au.geoRock && Number.isFinite(au.geoRock.value));
        out.geoMossUniform = !!(au && au.geoMoss && Number.isFinite(au.geoMoss.value));
        out.geoRockDefault1 = !!(au && au.geoRock && Math.abs(au.geoRock.value - 1) < 1e-9);
        out.geoMossDefault1 = !!(au && au.geoMoss && Math.abs(au.geoMoss.value - 1) < 1e-9);

        // (D) Behavioral — der Helfer baut einen Node-Graph ohne zu werfen
        {
            const zD = window.__stoffZeuge(r);
            try {
                const node = r._terrainGeologyAlbedo(
                    THREE.TSL,
                    THREE.TSL.attribute("color", "vec3"),
                    THREE.TSL.positionWorld
                );
                out.helperReturnsNode = !!node && typeof node === "object";
            } finally {
                out.helperNoThrow = zD.zu().length === 0; // der Zeuge zählt jeden Stoff-Bruch des Baus (K22)
            }
        }
        // LAUT (K22): ohne TSL bricht der Helfer beim Namen (`_stoffBruch`), nie still mit dem Eingangs-Albedo
        {
            const logAlt = r.log;
            r.log = () => {};
            try {
                r._terrainGeologyAlbedo(null, "ALBEDO_SENTINEL", null);
                out.helperGraceful = false;
            } catch (e) {
                out.helperGraceful = !!(e && e.stoff === true);
            } finally {
                r.log = logAlt;
            }
        }

        // (E) Toon-Terrain trägt den colorNode (kein Fehler in der Geologie-Schicht)
        const savedMode = r.state.atmosphere && r.state.atmosphere.materialMode;
        const zE = window.__stoffZeuge(r);
        let mToon = null;
        try {
            mToon = r._buildToonNodeMaterial({ vertexColors: true, side: THREE.DoubleSide });
        } finally {
            out.toonTerrainNoGeoError = zE.zu().length === 0; // der Zeuge zählt jeden Stoff-Bruch des Baus (K22)
        }
        out.toonTerrainColorNode = !!(mToon && mToon.colorNode);
        if (mToon && typeof mToon.dispose === "function") mToon.dispose();

        // (F) PBR-Terrain trägt JETZT denselben Geologie-colorNode (die geheilte Lücke)
        try {
            r.state.atmosphere.materialMode = "pbr";
            const zF = window.__stoffZeuge(r);
            let mPbr = null;
            try {
                mPbr = r._buildToonNodeMaterial({ vertexColors: true, side: THREE.DoubleSide });
            } finally {
                out.pbrTerrainNoGeoError = zF.zu().length === 0; // der Zeuge zählt jeden Stoff-Bruch des Baus (K22)
            }
            out.pbrTerrainIsPbr = !!(mPbr && mPbr.userData && mPbr.userData.isPbrMaterial);
            out.pbrTerrainColorNode = !!(mPbr && mPbr.colorNode);
            if (mPbr && typeof mPbr.dispose === "function") mPbr.dispose();
        } finally {
            if (r.state.atmosphere) r.state.atmosphere.materialMode = savedMode;
        }

        // (G) DIE VERTEX-FARBE EINMAL (Klasse „Albedo = Farbe²", r184 setupDiffuseColor: colorNode × Vertex-Farbe,
        // solange vertexColors an ist): jeder Stoff des Vertex-Farb-Zweigs, dessen colorNode die Vertex-Farbe trägt,
        // schaltet vertexColors ab — je Signatur des Spiels gebaut (die Mess-Wiese trägt Fels und Grammatik-Baum nicht),
        // dazu der Zensus der laufenden Szene (Stoff mit colorNode + vertexColors an + color-Attribut).
        const sigs = {
            boden: { vertexColors: true, side: THREE.DoubleSide },
            fels: { vertexColors: true, vertexColorAlbedo: true, color: 0x8a8a8a },
            rinde: { vertexColors: true, pflanzenStoff: true, bark: true, side: THREE.DoubleSide },
            laub: {
                vertexColors: true,
                useInstanceTint: true,
                pflanzenStoff: true,
                foliageLeaf: true,
                side: THREE.DoubleSide,
            },
            klinge: {
                vertexColors: true,
                useInstanceTint: true,
                pflanzenStoff: true,
                foliageLeaf: true,
                foliageBlade: true,
                side: THREE.DoubleSide,
            },
            kern: { vertexColors: true, useInstanceTint: true, pflanzenStoff: true },
        };
        out.farbeQuadrat = [];
        out.farbeOhneNode = [];
        for (const [name, o] of Object.entries(sigs)) {
            const m = r._buildToonNodeMaterial(o);
            if (!m || !m.colorNode) out.farbeOhneNode.push(name);
            else if (m.vertexColors === true) out.farbeQuadrat.push(name);
            if (m) m.dispose();
        }
        const chunkMat = r._getVoxelChunkMaterial();
        if (chunkMat && chunkMat.colorNode && chunkMat.vertexColors === true) out.farbeQuadrat.push("chunk-boden");
        out.szeneQuadrat = [];
        r.state.scene.traverse((o) => {
            const m = o.isMesh && o.material;
            if (!m || Array.isArray(m) || !m.colorNode || m.vertexColors !== true) return;
            if (o.geometry && o.geometry.getAttribute && o.geometry.getAttribute("color"))
                out.szeneQuadrat.push(r._taeterKlasse(o));
        });

        // (G) Version
        out.versionStr = A.VERSION;
        const partsV = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor = partsV[0] > 18 || (partsV[0] === 18 && partsV[1] >= 226);
        return out;
    });

    check("Ω-OPSIS S1 (A1) _terrainGeologyAlbedo Helfer existiert", res.helperExists === true);
    check("Ω-OPSIS S1 (A2) TERRAIN_GEOLOGY ist frozen", res.configFrozen === true);
    check("Ω-OPSIS S1 (A3) Fels-Schwellen geordnet (rockLo < rockHi)", res.slopeOrderRock === true);
    check(
        "Ω-OPSIS S1 (A4) Schutt-Gitter des Gesetzes trägt das Schicht-Band (0 < schuttGitter ≤ 7,2 m)",
        res.slopeOrderScree === true
    );
    check("Ω-OPSIS S1 (A5) Schutt-Kandidat beginnt vor Fels (schuttKandidat < rockLo)", res.screeBeforeRock === true);
    check(
        "Ω-OPSIS S1 (A6) Fels-Stoff (Basis + Mittel) und mossTint sind RGB-Tripel, kein rockTint-Zwilling",
        res.tintsAreRgb === true
    );
    check("Ω-OPSIS S1 (A7) mossMax ∈ (0,1] (kein voller Teppich)", res.mossMaxBounded === true);


    check("Ω-OPSIS S1 (C1) geoRock-Uniform existiert + endlich", res.geoRockUniform === true);
    check("Ω-OPSIS S1 (C2) geoMoss-Uniform existiert + endlich", res.geoMossUniform === true);
    check("Ω-OPSIS S1 (C3) geoRock default 1 (volle Säule)", res.geoRockDefault1 === true);
    check("Ω-OPSIS S1 (C4) geoMoss default 1 (volle Säule)", res.geoMossDefault1 === true);

    check("Ω-OPSIS S1 (D1) Helfer baut Node-Graph (kein Wurf)", res.helperReturnsNode === true);
    check("Ω-OPSIS S1 (D2) Helfer wirft keinen Fehler (Marker leer)", res.helperNoThrow === true);
    check("Ω-OPSIS S1 (D3) Helfer bricht ohne TSL laut beim Namen (_stoffBruch, K22)", res.helperGraceful === true);

    check("Ω-OPSIS S1 (E1) Toon-Terrain setzt colorNode", res.toonTerrainColorNode === true);
    check("Ω-OPSIS S1 (E2) Toon-Terrain: kein Geologie-Fehler", res.toonTerrainNoGeoError === true);

    check("Ω-OPSIS S1 (F1) PBR-Terrain ist PBR-Material", res.pbrTerrainIsPbr === true);
    check("Ω-OPSIS S1 (F2) PBR-Terrain trägt Geologie-colorNode (geheilte Lücke)", res.pbrTerrainColorNode === true);
    check("Ω-OPSIS S1 (F3) PBR-Terrain: kein Geologie-Fehler", res.pbrTerrainNoGeoError === true);
    check(
        `Farbe einmal (G1): jeder Vertex-Farb-Stoff (Boden · Chunk · Fels · Rinde · Laub · Klinge · Kern) trägt die Farbe im colorNode und schaltet vertexColors ab (Farbe² bei: ${res.farbeQuadrat.join(", ") || "keinem"}; ohne colorNode: ${res.farbeOhneNode.join(", ") || "keiner"})`,
        res.farbeQuadrat.length === 0 && res.farbeOhneNode.length === 0
    );
    check(
        `Farbe einmal (G2): kein Mesh der Szene zeichnet colorNode × Vertex-Farbe (gemessen ${res.szeneQuadrat.length}: ${[...new Set(res.szeneQuadrat)].slice(0, 6).join(", ") || "-"})`,
        res.szeneQuadrat.length === 0
    );

    check(`Ω-OPSIS S1 (V1) VERSION floor ≥ 18.226.0 (gemessen ${res.versionStr})`, res.versionFloor === true);
}

// Gras-Band: die Wiese liest den BODEN darunter (lush-grün ↔ dry-oliv aus lebendig + feuchte).
// Proben messen KONSUM an den Nähten (Material, Boden-Albedo, Feld-Bake).
async function checkBandWahrerAnblickGras(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // (A) CONSUM Source-Probes
        const matSrc = window.__codeOf(r._grassInstanceMat);
        // Der Boden-Tint kommt über Three.js' nativen InstanceNode-Pfad (setupDiffuseColor multipliziert
        // instanceColor selbst) — ein manueller instanceColor-Read ist redundant und wirft „instanceColor not
        // found". __codeOf strippt Kommentare, die den entfernten Read zitieren.
        const matCode = window.__codeOf(matSrc);
        out.matNoManualInstanceColor = !/attribute\(["']instanceColor["']/.test(matCode);

        // (B) Material baut (der instanceColor-colorNode kompiliert ohne Wurf)
        const m = r._grassInstanceMat();
        out.matBuilt = !!m;

        // (B2) jedes gebaute Gras-Mesh trägt instanceColor (WebGPU-strikt)
        let withColor = 0,
            total = 0;
        if (r.state.voxelChunkGrass) {
            for (const inst of r.state.voxelChunkGrass.values()) {
                if (inst && inst.isInstancedMesh) {
                    total++;
                    if (inst.instanceColor) withColor++;
                }
            }
        }
        out.grassMeshes = total;
        out.grassWithColor = withColor;
        out.allGrassColored = total === 0 || withColor === total;

        out.versionStr = A.VERSION;
        const pv = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor = pv[0] > 18 || (pv[0] === 18 && pv[1] >= 228);
        return out;
    });

    check(
        "Ω-OPSIS S2-Gras (A1, V18.267): Gras-Material OHNE manuelles attribute(instanceColor) — Boden-Tint via nativem Auto-Multiply (kein Konsolen-Fehler)",
        res.matNoManualInstanceColor === true
    );
    check("Ω-OPSIS S2-Gras (B1) Gras-Material baut (instanceColor-colorNode kompiliert)", res.matBuilt === true);
    check(
        `Ω-OPSIS S2-Gras (B2) alle gebauten Gras-Meshes tragen instanceColor (${res.grassWithColor}/${res.grassMeshes})`,
        res.allGrassColored === true
    );
    check(`Ω-OPSIS S2-Gras (V1) VERSION floor ≥ 18.228.0 (gemessen ${res.versionStr})`, res.versionFloor === true);
}

module.exports = {
    checkBandV18136Audit, checkBandM7LichtFeinschliff, checkBandLambda3Wind, checkBandLambda6Detail,
    checkBandWEFrequenzband, checkBandV18223PbrKohaerenz, checkBandWahrerAnblickSaeule1, checkBandWahrerAnblickGras,
};
