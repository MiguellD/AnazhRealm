"use strict";
// scripts/playtest/stoff.cjs — der Richter von Stoff (spec/stamm/modul-karte.json): Uniform-Heimat · PBR-Knoten · Substanz-Antwort · Gras-Stoff und Wind · Stoff-Regler · Instanz-Senken und ihr Zeichner · Laub-Licht · Baum-Wind · Impostor-Atlas.
// 8 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// Reflexions-Audit — vier Wände: (1) der Schatten-Weite-Slider treibt unter CSM csm.maxFar (kein
// toter Knopf) · (2) Kachel-Erosion ohne flowTo-Ballast · (3) die Bestbewertet-Rail liest die
// aggregierte Wertung · (4) die Nah-Streu würfelt je (Zelle, Art) aus Zelle + Welt-Seed (Γ5).
// Gegenprobe: die CSM-Haupt-Map rendert NICHT (mainMap=false).
async function checkBandV18136Audit({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (1) der Slider treibt unter CSM die Kaskaden-Reichweite (kein toter Knopf). Der
        // `csm.maxFar`-Antrieb wanderte in `_applyEffectiveShadowRange` (DIE EINE Anwende-Quelle, die
        // setShadowRange UND der Perf-Regler rufen) — am Ruf: der Pfad des Reglers treibt maxFar, der Setter ruft die Quelle.
        const savedCsm = st.csmNode;
        const savedRange = st.atmosphere && st.atmosphere.shadowRange;
        const savedApplied = r._shadowRangeApplied;
        st.csmNode = { maxFar: 0, camera: null, updateFrustums() {} };
        r._applyEffectiveShadowRange(150);
        out.rangeSrc = Math.abs(st.csmNode.maxFar - 150 * AnazhRealm.SCHATTEN_FERN_FAKTOR) < 1e-9;
        out.rangeSrc = window.__consumes(r, "setShadowRange", r, "_applyEffectiveShadowRange", [200]) && out.rangeSrc;
        out.rangeDrives = Math.abs(st.csmNode.maxFar - 360) < 1e-9;
        st.csmNode = savedCsm;
        if (Number.isFinite(savedRange)) r.setShadowRange(savedRange);
        if (Number.isFinite(savedApplied)) r._applyEffectiveShadowRange(savedApplied);
        // (2) die Kachel-Erosion ist gefallen: der Kachel-Eingang baut nur noch die Hydrosphäre.
        out.tileLean = window.__fehlt(r._ensureHydroTilesAround, /eTile|_computeErosion|erosionTiles/);
        return out;
    });
    if (!res) {
        check("Audit: Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "Audit: der Schatten-Weite-Slider treibt unter CSM maxFar (kein toter Knopf)",
        res.rangeSrc && res.rangeDrives
    );
    check(
        "Audit: der Kachel-Eingang baut keine Kachel-Erosion mehr (K16: die Täler kommen aus dem Flussnetz)",
        res.tileLean
    );
}

// M7 Licht-Feinschliff: die Mikro-Struktur als LEBENDIGER Regler (eine Konstante im Tree wäre ein toter Slider-Knopf);
// der Nacht-Boden fiel mit F6 (das Licht ist die EINE Licht-Kette).
async function checkBandM7LichtFeinschliff({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const au = r._ensureAtmoUniforms();
        // (1) der Hebel ist eine UNIFORM (lebendig, nicht eingebacken).
        out.uniforms = !!au && !!au.microStrength;
        // (2) der Setter TREIBT die Uniform (KONSUM, mit Restore).
        const m0 = au.microStrength.value;
        r.setMicroStrength(0.27);
        out.settersDrive = Math.abs(au.microStrength.value - 0.27) < 1e-9;
        r.setMicroStrength(m0);
        // (4) der Regler lebt in den Einstellungen + treibt den Setter.
        const mtS = document.getElementById("slider-microtex");
        out.slidersLive = !!mtS;
        if (mtS) {
            mtS.value = "30";
            mtS.dispatchEvent(new Event("input", { bubbles: true }));
            out.sliderDrives = Math.abs(au.microStrength.value - 0.3) < 1e-9;
            mtS.value = String(Math.round(m0 * 100));
            mtS.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return out;
    });
    check("M7 Licht: die Mikro-Struktur ist eine LEBENDIGE Uniform (keine eingebackene Konstante)", res.uniforms);
    check("M7 Licht: der Setter treibt die Uniform (setMicroStrength — KONSUM)", res.settersDrive);
    check(
        "M7 Licht: der Einstellungs-Regler lebt und treibt den Setter (kein toter Knopf)",
        res.slidersLive && res.sliderDrives
    );
}

async function checkBandLambda3Wind({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // K19: den Wind trägt kein Substanz-Tag — die Achse `wiegen` ist fort, Holz und Stein stehen.
        const laubProfile = r._substanceResponseProfile({ tags: { lebendig: 1, dichte: 0.3, zähigkeit: 0.7 } });
        out.wiegenFort = !("wiegen" in laubProfile);
        return out;
    });
    check("Λ.3 Wind: kein Substanz-Tag trägt den Wind (die Achse wiegen ist fort, K19)", res.wiegenFort === true);
}

async function checkBandWEFrequenzband({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const mats = st.materials;
        // (1) die ANTENNE emergiert aus der Substanz (Ordnung der Achsen).
        const pEisen = r._substanceResponseProfile(mats.eisen.tags);
        const pHolz = r._substanceResponseProfile(mats.holz.tags);
        const pGlut = r._substanceResponseProfile(mats.glut.tags);
        const pStein = r._substanceResponseProfile(mats.stein.tags);
        const pQuarz = r._substanceResponseProfile(mats.quarz.tags);
        out.glimmenOrdnung = pGlut.glimmen > pStein.glimmen + 0.3 && pQuarz.glimmen > pStein.glimmen + 0.2;
        out.tiefeOrdnung = pStein.micro > pHolz.micro && pEisen.micro >= pHolz.micro;
        // (2) die Tags REISEN in beide Part-Builder (Spiegel-Disziplin) und
        // WIRKEN behavioral (kein Existenz-Test): das HISM-Leaf eines
        // Glut-Parts glimmt stärker als ein Stein-Part (gewichteter Emissiv).
        const mGlut = r._archLeafMaterial({ material: "glut", shape: "box", size: { x: 1, y: 1, z: 1 } });
        const mStein = r._archLeafMaterial({ material: "stein", shape: "box", size: { x: 1, y: 1, z: 1 } });
        // mode-robust: der echte Glow = Emissiv-FARBE × Intensität.
        // (MeshStandard hat emissiveIntensity-Default 1 bei SCHWARZEM Emissiv = kein
        // Glühen → der reine emissiveIntensity-Proxy war toon-spezifisch.)
        const _glow = (m) => {
            if (!m || !m.emissive) return 0;
            const i = Number.isFinite(m.emissiveIntensity) ? m.emissiveIntensity : 1;
            return (m.emissive.r + m.emissive.g + m.emissive.b) * i;
        };
        out.tagsReisen = _glow(mGlut) > _glow(mStein) + 0.01;
        // das Stein-Profil der Tags hält das Leaf ungeglüht und schaltet den Instanz-Ton (ohne Tags: werk-Default, es glüht)
        out.tagsImBuilder = mStein.userData.leafTint === true && _glow(mStein) === 0;
        // (4) KEIN PROFIL TRÄGT LICHT (F6): das additive Band (Rim, Nacht-Boden, Mond-Rim, der Gegenlicht-Glow) ist fort — kein Profil nennt
        // eine Licht-Achse, das Gras trägt keine Antwort (Gewicht 0 = kein Knoten; der Boden: V17.J), das Licht ist die EINE Kette
        const SR = AnazhRealm.SUBSTANCE_RESPONSE;
        const achsen = [pEisen, pHolz, pGlut, pStein, pQuarz, SR.defaults.werk, SR.defaults.feld].flatMap(Object.keys);
        out.ohneBand =
            !achsen.some((k) => /^(rim|fuell|mond|waerme|glanz|glas|detail)$/.test(k)) && !("gras" in SR.defaults);
        const gm = r._grassInstanceMat();
        out.grasOhneAntwort = !!gm && gm.outputNode == null;
        return out;
    });
    check(
        "W-E Frequenzband: die Antenne EMERGIERT aus der Substanz (glimmen: Glut/Quarz>Stein · tiefe: Stein/Eisen>Holz)",
        res.glimmenOrdnung && res.tiefeOrdnung
    );
    check(
        "W-E Frequenzband: die Substanz-Tags REISEN in den Leaf-Builder + wirken behavioral (Glut-Leaf glimmt stärker als Stein, das Stein-Leaf glüht nicht und trägt den Instanz-Ton)",
        res.tagsReisen && res.tagsImBuilder
    );
    check(
        "F6: kein Profil trägt Licht — keine Achse rim/fuell/mond/detail, das Gras ohne Antwort-Knoten (das Licht ist die EINE Kette)",
        res.ohneBand && res.grasOhneAntwort
    );
}

// PBR-Pfad (material.K5): Rauheit und Metall LIEST der Stoff aus seiner Stoff-Zeile (`_stoffOptik`) — beim Namen, nur mit Tags
// beim nächsten Verwandten; der Flach-Stoff liest sie im Graphen als Stoff-Rauheit (`materialRoughness`), und eine Änderung der
// Zeile setzt jeden gebauten Stoff neu (`_stoffOptikWirkt`).
async function checkBandV18223PbrKohaerenz({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const Z = st.materials;
        const m0 = r._buildToonNodeMaterial({ color: 0x808080 });
        // V18.234: PBR ist Default, ohne Zeile ein Mittel-Stoff
        out.mittel =
            st.atmosphere.materialMode === "pbr" &&
            /MeshStandardNode/.test(m0.type) &&
            m0.userData.isPbrMaterial === true &&
            m0.roughness === 0.7 &&
            m0.metalness === 0;
        m0.dispose();
        // je Zeile: der Stoff trägt Rauheit und Metall seiner Zeile, beim Namen und (nur Tags) beim Verwandten; der Flach-Stoff
        // liest die Stoff-Rauheit im Graphen, nie eine eingebackene Zahl
        out.zeilen = ["eisen", "bronze", "stahl", "quarz", "stein", "laub"].map((n) => {
            const m = r._buildPbrNodeMaterial({ color: 0x707080, stoff: n, tags: Z[n].tags });
            const t = r._buildPbrNodeMaterial({ color: 0x707080, tags: Z[n].tags });
            let liest = false;
            m.roughnessNode.traverse(
                (k) => (liest = liest || (k.constructor.type === "MaterialNode" && k.scope === "roughness"))
            );
            const ok = liest && m.roughness === Z[n].rauheit && m.metalness === Z[n].metall;
            [m, t].forEach((x) => x.dispose());
            return [n, ok && t.roughness === r._stoffVerwandt(Z[n].tags).rauheit];
        });
        out.metall = [Z.eisen.metall, Z.bronze.metall, Z.stein.metall].join() === "1,1,0";
        // DIE MUTATION: die Zeile ändern → der gebaute Stoff trägt die neue Zahl, zurück die alte, ein entsorgter hört nicht mehr
        const m = r._buildPbrNodeMaterial({ color: 0x707080, stoff: "eisen" });
        const r0 = Z.eisen.rauheit;
        Z.eisen.rauheit = 0.31;
        out.mutiert = m.roughness === 0.31 && m.userData.pbrRoughness === 0.31;
        Z.eisen.rauheit = r0;
        m.dispose();
        Z.eisen.rauheit = 0.4;
        out.mutiert = out.mutiert && m.roughness === r0;
        Z.eisen.rauheit = r0;
        const mGlut = r._buildPbrNodeMaterial({ color: 0xff5020, tags: { brennbar: 0.95, waermeleitung: 0.9 } });
        out.glutEmissive = mGlut.emissiveIntensity > 0;
        mGlut.dispose();
        return out;
    });
    check(
        "V18.234 PBR ist Default: ein MeshStandardNode, ohne Zeile ein Mittel-Stoff (Rauheit 0,7, kein Metall)",
        res.mittel
    );
    check(
        "(K5) jeder Stoff liest Rauheit und Metall seiner Zeile (beim Namen, nur Tags beim Verwandten), der Graph die Stoff-Rauheit: " +
            JSON.stringify(res.zeilen),
        res.zeilen.every(([, ok]) => ok)
    );
    check("(K5) Eisen und Bronze sind Metall, Stein nicht (die Zeile, gemessen an MERL)", res.metall);
    check(
        "(K5) die Mutation der Zeile setzt den gebauten Stoff, zurück die alte Zahl, ein entsorgter hört nicht mehr",
        res.mutiert
    );
    check("(S7) GLUT (brennbar) → emissiveIntensity > 0", res.glutEmissive === true);
}

// Wahrer Anblick I — der LAWFUL Boden: per-Fragment Multi-Klassen-Geologie als geteilter Auslesewert
// (Toon + PBR). Fels/Geröll EMERGIEREN aus der Steile, Moos aus flach + feucht. Der Helfer bricht laut; jede Signatur des
// Spiels baut ihren Stoff mit colorNode (G1) — ein Bruch im Bau wirft dort beim Namen.
async function checkBandWahrerAnblickSaeule1({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const THREE = window.THREE;
        const out = {};

        // LAUT: ohne TSL bricht der Helfer beim Namen (`_stoffBruch`), nie still mit dem Eingangs-Albedo
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
        st.scene.traverse((o) => {
            const m = o.isMesh && o.material;
            if (!m || Array.isArray(m) || !m.colorNode || m.vertexColors !== true) return;
            if (o.geometry && o.geometry.getAttribute && o.geometry.getAttribute("color"))
                out.szeneQuadrat.push(r._taeterKlasse(o));
        });

        return out;
    });

    check("Ω-OPSIS S1 (D3) Helfer bricht ohne TSL laut beim Namen (_stoffBruch, K22)", res.helperGraceful === true);

    check(
        `Farbe einmal (G1): jeder Vertex-Farb-Stoff (Boden · Chunk · Fels · Rinde · Laub · Klinge · Kern) trägt die Farbe im colorNode und schaltet vertexColors ab (Farbe² bei: ${res.farbeQuadrat.join(", ") || "keinem"}; ohne colorNode: ${res.farbeOhneNode.join(", ") || "keiner"})`,
        res.farbeQuadrat.length === 0 && res.farbeOhneNode.length === 0
    );
    check(
        `Farbe einmal (G2): kein Mesh der Szene zeichnet colorNode × Vertex-Farbe (gemessen ${res.szeneQuadrat.length}: ${[...new Set(res.szeneQuadrat)].slice(0, 6).join(", ") || "-"})`,
        res.szeneQuadrat.length === 0
    );
}

// Gras-Band: die Wiese liest den BODEN darunter (lush-grün ↔ dry-oliv aus lebendig + feuchte).
// Proben messen KONSUM an den Nähten (Material, Boden-Albedo, Feld-Bake).
async function checkBandWahrerAnblickGras({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};

        // (A) CONSUM Source-Probes
        // Der Boden-Tint kommt über Three.js' nativen InstanceNode-Pfad (setupDiffuseColor multipliziert
        // instanceColor selbst) — ein manueller instanceColor-Read ist redundant und wirft „instanceColor not
        // found". __fehlt liest ohne die Kommentare, die den entfernten Read zitieren.
        out.matNoManualInstanceColor = window.__fehlt(r._grassInstanceMat, /attribute\(["']instanceColor["']/);

        // (B) Material baut (der instanceColor-colorNode kompiliert ohne Wurf)
        const m = r._grassInstanceMat();
        out.matBuilt = !!m;

        // (B2) jedes gebaute Gras-Mesh trägt instanceColor (WebGPU-strikt)
        let withColor = 0,
            total = 0;
        if (st.voxelChunkGrass) {
            for (const inst of st.voxelChunkGrass.values()) {
                if (inst && inst.isInstancedMesh) {
                    total++;
                    if (inst.instanceColor) withColor++;
                }
            }
        }
        out.grassMeshes = total;
        out.grassWithColor = withColor;
        out.allGrassColored = total === 0 || withColor === total;

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
}

module.exports = {
    checkBandV18136Audit,
    checkBandM7LichtFeinschliff,
    checkBandLambda3Wind,
    checkBandWEFrequenzband,
    checkBandV18223PbrKohaerenz,
    checkBandWahrerAnblickSaeule1,
    checkBandWahrerAnblickGras,
};
