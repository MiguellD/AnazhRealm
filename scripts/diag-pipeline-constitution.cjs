// diag-pipeline-constitution.cjs — P8: DIE VERFASSUNG DER PIPELINE (Struktur ersetzt Ermahnung).
// Statisch (kein Browser), im `check`-Gate: die GESETZE der „Neues Kleid"-Pipeline sind hier als
// prüfbare STRUKTUR verankert, nicht als Kommentar-Ermahnung. Jede Regel prüft die ANWESENHEIT des
// erzwingenden Baus UND die ABWESENHEIT ihres Anti-Musters. Kommentar-Bereinigung (V18.267: der Code
// darf das Wort tragen, der Code darf es nicht) — die geprüften Anti-Muster (Inline-Wuchs, iframe.src,
// geschnittene Methoden) leben, wenn überhaupt, nur noch in Kommentaren, die der Strip entfernt. Ein
// Refactor, der ein Gesetz still bricht (Nachbau, iframe, Parallel-Wuchs), macht diese Linse rot.
// Vollständig: `docs/neues-kleid-verfassung.md`.
//   node scripts/diag-pipeline-constitution.cjs
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
// NUR Kommentare raus (Strings BLEIBEN). Ein naives String-Strippen über den 85k-Zeilen-Monolithen ist
// unzuverlässig (ein Regex-/Template-Literal mit Anführungszeichen frisst echten Code) — die Kommentar-
// Bereinigung reicht: die geprüften Muster tragen kein String-Literal, das eine Regel vortäuschen könnte,
// und die Anti-Muster (Inline-Wuchs, iframe.src, geschnittene Methoden) leben NUR noch in Kommentaren,
// wenn überhaupt (die entfernt der Strip). Ein echter Code-Verstoß bleibt sichtbar.
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

let pass = 0,
    fail = 0;
// present=true → die Struktur MUSS da sein (cond true); present=false → das Anti-Muster MUSS weg sein (cond false).
const law = (name, present, cond, detail) => {
    const ok = present ? cond : !cond;
    if (ok) {
        pass++;
        console.log(`  ✅ ${name}`);
    } else {
        fail++;
        console.error(`  ❌ ${name}${detail ? " — " + detail : ""}`);
    }
};

const anazhNC = stripComments(read("anazhRealm.js"));
const foundryNC = stripComments(read("foundry-core.js"));
const pkg = read("package.json");

console.log("=== P8 — DIE VERFASSUNG DER PIPELINE (Struktur, nicht Ermahnung) ===");

// GESETZ 1 (P4) — DIE FOUNDRY IST DIE EINE BAUM-QUELLE: der Chokepoint `_buildVariantLODs` gibt bei
// lebender Foundry null (kein Aufrufer kann einen Nachbau setzen); der Scatter unterdrückt den
// Grammatik-Render für Baum-Schichten, wenn die Foundry lebt.
console.log("\nGesetz 1 — die Foundry ist die EINE Baum-Quelle (Chokepoint + Scatter-Gate):");
law(
    "der Chokepoint prüft `_foundryPresetFor(species)` (in `_buildVariantLODs`)",
    true,
    /_foundryPresetFor\(species\)/.test(anazhNC)
);
law(
    // V18.464 (Linse wandert mit, Lehre 6): die Unterdrückung lebt seit der
    // Zellen-Chokepoint-Extraktion (_scatterMaterializeCell) als `return null`
    // statt `continue` — dasselbe Gesetz, neuer Träger.
    'der Scatter unterdrückt den Baum-Grammatik-Nachbau bei lebender Foundry (`layer.kind === "tree" && _foundryEnabled() → return null` im Zellen-Chokepoint)',
    true,
    /layer\.kind === "tree" && this\._foundryEnabled\(\)\)\s*return null/.test(anazhNC)
);

// GESETZ 2 (P6) — EIN WUCHS: der Studio-Generator delegiert an die geteilte Quelle, KEIN Parallel-Wuchs.
console.log("\nGesetz 2 — EIN Wuchs (foundry-core liest den geteilten phyto-core):");
law("`growTreeNodes` delegiert an `__core.growSkeleton`", true, /__core\.growSkeleton/.test(foundryNC));
law(
    "KEIN Inline-Parallel-Wuchs (die `grow(pos,dir,radius,length,depth)`-Rekursion ist geschnitten)",
    false,
    /function grow\(pos, ?dir, ?radius, ?length, ?depth/.test(foundryNC),
    "der ~275-Zeilen-Inline-Bau lebt wieder"
);

// GESETZ 3 (P5) — DER IMPOSTOR BACKT AUF DEM EINEN HAUPT-RENDERER: kein GL-Bake-iframe; der RTT liest die Foundry-Leaves.
console.log("\nGesetz 3 — der Impostor backt auf dem EINEN Haupt-Renderer (kein Bake-iframe):");
law(
    "`_bakeImpostorAtlasRTT` liest bei der `foundry`-Flagge die LOD1-Bake-Leaves",
    true,
    /if \(rec\.foundry\)/.test(anazhNC) && /_foundryBakeLeaves/.test(anazhNC)
);
law(
    "KEIN asset-foundry-Bake-iframe (kein `iframe.src = …asset-foundry`)",
    false,
    /iframe\.src\s*=\s*[^;]*asset-foundry/.test(anazhNC),
    "ein Bake-iframe wird wieder erzeugt"
);
law(
    "die drei iframe-Impostor-Methoden bleiben geschnitten",
    false,
    /_foundryEnsureBakeIframe|_foundryRequestImpostor|_foundryBuildImpostorRecord/.test(anazhNC),
    "eine iframe-Impostor-Methode ist zurück"
);

// GESETZ 4 (P1/P7) — DIE ASSET-VERTRÄGE: Pflanzen v1 eingefroren + gate-bewacht.
// (v2 Kreatur-Skin FIEL mit KONVERGENZ III V18.456 — die Kreatur ist der
// tetrapoda-Baum, kein gebackenes Skin-Asset mehr; v3+ zählen weiter.)
console.log("\nGesetz 4 — die Asset-Verträge sind eingefroren + gate-bewacht:");
law("Vertrag v1 (Pflanzen) existiert", true, fs.existsSync(path.join(ROOT, "spec/asset-contract/v1/CONTRACT.md")));
law(
    "Vertrag v2 (Kreatur-Skin) ist GEFALLEN (KONVERGENZ III — der Baum trägt)",
    false,
    fs.existsSync(path.join(ROOT, "spec/asset-contract/v2/CONTRACT.md"))
);
law("`gate:asset-contract` verdrahtet", true, /"gate:asset-contract"\s*:/.test(pkg));

// GESETZ 5 (P0–P8) — JEDE REGEL HAT IHRE LINSE: die Pipeline-Gates existieren im package.json.
console.log("\nGesetz 5 — jede Regel hat ihre Linse (die Gates existieren):");
for (const g of [
    "gate:foundry-warm",
    "gate:foundry-deadlock",
    "gate:portal-boot",
    "gate:foundry-impostor",
    "gate:boot-fog-ring",
])
    law(`\`${g}\` verdrahtet`, true, pkg.includes('"' + g + '"'));

// GESETZ 6 („Drähte statt Kopien", 08.07.) — KEINE LOGIK-KOPIE IM MONOLITHEN: was auch im
// Studio-/Vorlagen-Kern steht, darf in anazhRealm.js nur als DRAHT existieren. Der Wald-Plan
// (Poisson/Nische/Größe) + der Impostor-Rahmen (Studio v36) leben EINMAL in phyto-core; der
// Monolith delegiert. Jeder Refactor, der die Formel zurückkopiert, wird hier rot.
console.log("\nGesetz 6 — Drähte statt Kopien (Wald-Plan + Rahmen leben in der Quelle):");
const phytoNC = stripComments(read("phyto-core.js"));
law("phyto-core trägt den Wald-Plan (`planForestCell`)", true, /function planForestCell\(/.test(phytoNC));
law(
    "phyto-core trägt den Impostor-Rahmen (`impostorFrame` + `scanRadialXZ`)",
    true,
    /function impostorFrame\(/.test(phytoNC) && /function scanRadialXZ\(/.test(phytoNC)
);
law(
    "der Monolith DELEGIERT den Wald-Plan (ctx-Draht zu `planForestCell`)",
    true,
    /core\.planForestCell\(cx, cz, seedInt/.test(anazhNC)
);
law(
    "KEINE Nischen-Formel-Kopie im Monolithen (die wF/wT/wE-Gewichte sind umgezogen)",
    false,
    /const wF = \(ss\(0\.4, 0\.8, clim\)/.test(anazhNC),
    "die Arten-Nische lebt wieder im Monolithen"
);
law(
    "KEINE Größen-Formel-Kopie im Monolithen (reverse-J `0.55 + 1.45·ue^1.45`)",
    false,
    /0\.55 \+ 1\.45 \* Math\.pow\(ue/.test(anazhNC),
    "die reverse-J-Größe lebt wieder im Monolithen"
);
law("der Monolith DELEGIERT den Rahmen (`core.impostorFrame(`)", true, /core\.impostorFrame\(/.test(anazhNC));
law(
    "KEINE Rahmen-Formel-Kopie im Monolithen (`totalH * 0.51`)",
    false,
    /totalH \* 0\.51/.test(anazhNC),
    "die v36-Rahmenformel lebt wieder als Kopie im Monolithen"
);
const phytogenNC = stripComments(read("worlds/terrain/phytogenesis.js"));
law(
    "das Studio liest DENSELBEN Rahmen (`__phytoCore.impostorFrame` in bakeImpostorAtlas)",
    true,
    /__phytoCore\.impostorFrame\(/.test(phytogenNC)
);
law(
    "der Bäcker-Spec lebt als Daten in foundry-core (`impostor: { views:`)",
    true,
    /impostor:\s*\{\s*views:/.test(foundryNC)
);
// LOD-WURZEL (08.07., V9.56-i — das Gesetz wandert mit dem Code): der Halm-Draht ist
// STUFEN-parameterisiert (`_grassStudioGeometry(stage)`, die Stufe aus den Vertrags-Daten
// `kindStages.grass` via `_grassKindStages`); der Defer-Draht bleibt die Kopie-Bau-Wand.
law(
    "DER GRAS-SCHNITT: der Halm ist das Studio-Asset (`_grassStudioGeometry(stage)` + kindStages-Draht + Defer im Bauer)",
    true,
    /_grassStudioGeometry\(/.test(anazhNC) &&
        /_grassKindStages\(\)/.test(anazhNC) &&
        /this\._enqueueGrass\(cx, cz\);\s*return;/.test(anazhNC)
);
// LOD-WURZEL (08.07.) — die Stufen-Wahrheit je Art lebt als VERTRAGS-DATEN in foundry-core
// (kindStages), der Studio-Wald liest sie SELBST (near/far-Kacheln), AnazhRealm clampt seine
// Distanz-Wahl darauf (kein Empfänger erfindet Stufen, die das Studio nicht vorsieht).
law(
    "die Stufen-Wahrheit je Art lebt als Daten (`kindStages:` in foundry-core)",
    true,
    /kindStages:\s*\{/.test(foundryNC)
);
law(
    "der Studio-Wald liest kindStages SELBST (near/far-Kacheln)",
    true,
    /kindStages/.test(phytogenNC) && /tileStage/.test(phytogenNC)
);
law(
    "AnazhRealm clampt auf die deklarierten Stufen (`kindStages` im Flatten-Chokepoint)",
    true,
    /kindStages\[_rec\.kind\]/.test(anazhNC)
);
// W1 (Paritäts-Vollendung, 08.07.) — DIE EINE STREU-DICHTE-QUELLE: `_effectiveFoliageDensity`
// ist der Chokepoint (Studio-Regime → 1, sonst Regler); Bau (`_scatterPass`), Buchhaltung
// (`builtDensity` in `_scatterRegion`) und Nach-Dünnen (`_tickFoliageThin`) LESEN ihn — kein
// Leser rechnet die Dichte selbst (die V18.427-Rebuild-Endlosschleifen-Klasse strukturell zu).
console.log("\nGesetz 7 (W1) — EINE Streu-Dichte-Quelle + die geheilte Render-Metrik:");
law(
    "der Dichte-Chokepoint existiert (`_effectiveFoliageDensity()`)",
    true,
    /_effectiveFoliageDensity\(\)\s*\{/.test(anazhNC)
);
{
    const _fnBody = (name) => {
        const m = anazhNC.match(new RegExp(name + "\\([^)]*\\) \\{"));
        if (!m) return "";
        let i = anazhNC.indexOf(m[0]) + m[0].length,
            depth = 1,
            out = "";
        while (i < anazhNC.length && depth > 0) {
            const ch = anazhNC[i++];
            if (ch === "{") depth++;
            else if (ch === "}") depth--;
            if (depth > 0) out += ch;
        }
        return out;
    };
    const passBody = _fnBody("_scatterPass");
    const thinBody = _fnBody("_tickFoliageThin");
    law(
        "der Scatter-Bau liest die EINE Quelle (kein eigener Dichte-Rechner in `_scatterPass`)",
        true,
        /_effectiveFoliageDensity\(\)/.test(passBody) && !/_foliageDensityScale/.test(passBody)
    );
    law(
        "das Nach-Dünnen liest die EINE Quelle + trägt das Foundry-Gate (`_tickFoliageThin`)",
        true,
        /_effectiveFoliageDensity\(\)/.test(thinBody) &&
            /_foundryEnabled/.test(thinBody) &&
            !/_foliageDensityScale/.test(thinBody)
    );
}
// W1 — DIE GEHEILTE RENDER-METRIK BLEIBT GEHEILT (die V18.427-Klasse strukturell): im r184-WebGPU-Info
// ist `render.calls` ein LEBENSZEIT-Zähler — der EINE Tap liest `drawCalls ?? calls`; KEIN Leser im
// Monolithen darf `render.calls` nackt lesen (nur als `??`-Fallback hinter drawCalls).
{
    const nakedCalls = (anazhNC.match(/render\.calls/g) || []).length;
    const fallbackCalls = (anazhNC.match(/drawCalls[^;]{0,160}render\.calls/g) || []).length;
    law(
        "kein nackter `render.calls`-Read im Monolithen (nur als drawCalls-??-Fallback)",
        true,
        nakedCalls === 0 || fallbackCalls >= nakedCalls
    );
}

// N1 (Nervensystem-Plan, M8: TABELLE VOR IF) — der Auto-Register-Chokepoint laeuft die
// KIND_POLICY-Tabelle: eine neue Domaene ist eine Policy-Zeile, KEIN kind-if-Zweig im Stamm.
// Ein Refactor, der einen `if (rec.kind === ...)`-Zweig zurueckbringt, wird hier rot.
{
    const _autoBody = (() => {
        const m = anazhNC.match(/_foundryAutoRegisterSpecies\(book\) \{/);
        if (!m) return "";
        let i = anazhNC.indexOf(m[0]) + m[0].length,
            depth = 1,
            out = "";
        while (i < anazhNC.length && depth > 0) {
            const ch = anazhNC[i++];
            if (ch === "{") depth++;
            else if (ch === "}") depth--;
            if (depth > 0) out += ch;
        }
        return out;
    })();
    law(
        "N1/M8: KIND_POLICY existiert (tree + vehicle als Tabellen-Zeilen)",
        true,
        /KIND_POLICY = Object\.freeze/.test(anazhNC) &&
            /tree:\s*Object\.freeze/.test(anazhNC) &&
            /vehicle:\s*Object\.freeze/.test(anazhNC)
    );
    law(
        "N1/M8: der Auto-Register-Chokepoint laeuft die Tabelle (kein kind-String-Vergleich im Body)",
        true,
        _autoBody.length > 0 && /KIND_POLICY/.test(_autoBody) && !/kind\s*[!=]==?\s*"/.test(_autoBody)
    );
}

// N2 (Nervensystem-Plan, Phase beta: „Runtime = Validator") — DAS CORE-MANIFEST IST DIE EINE
// KERN-QUELLE: die Worker-Kern-Liste lebt als DATEN in cores.manifest.json (der Worker-Boot
// `_ensureAssetFoundry` + der IDB-Stempel `_foundryIdbInit` + der Vertrags-Validator lesen sie);
// die Bruecke liest die ns-Kerne GENERISCH aus self.__anazhCores — KEIN Kern-spezifisches
// ns-Literal (self.__vehicleCore) mehr in der Bruecke. Ein dritter Kern ist eine Manifest-Zeile.
{
    let manifestOk = false;
    try {
        const mf = JSON.parse(read("cores.manifest.json"));
        manifestOk =
            Array.isArray(mf) &&
            mf.length >= 1 &&
            mf.every((c) => c && typeof c.id === "string" && Array.isArray(c.scripts) && c.scripts.length >= 1);
    } catch (_e) {}
    law("N2: cores.manifest.json existiert + ist ein gueltiger Kern-Satz", true, manifestOk);
    law(
        "N2: der Worker-Boot liest das Manifest (cores.manifest.json in _ensureAssetFoundry)",
        true,
        /fetch\("cores\.manifest\.json" \+ v\)/.test(anazhNC) && /self\.__anazhCores=/.test(anazhNC)
    );
    law(
        "N2: der IDB-Stempel hasht manifest-getrieben (cores.manifest.json in _foundryIdbInit)",
        true,
        /fetch\("cores\.manifest\.json\?v=" \+ V\)/.test(anazhNC)
    );
    law(
        "N2: die Bruecke traegt KEIN Kern-spezifisches ns-Literal mehr (self.__vehicleCore)",
        false,
        /self\.__vehicleCore/.test(phytogenNC),
        "ein Kern-spezifischer ns-Zugriff ist zurueck in der Bruecke"
    );
}

// N4 (Nervensystem-Plan Phase γ, „Instance-Straße") — DIE EINE MESH→GROUP-NAHT + DAS REPLY-
// MATERIAL FÜHRT + DIE TUFT-WAND + IMPOSTOR-POLITIK ALS DATEN. Vier Gesetze, jedes als Struktur:
// N4.1 der Worker-Reply wird EXAKT EINMAL zu THREE-Geometrie (in `_foundryBuildGroup`) — jeder
//      `_foundryRequest(...).then((meshes)`-Leser routet durch diese eine Naht (kein zweiter
//      Bau-Pfad kann still entstehen; die IDB-Persistenz in `_foundryRequest` selbst speichert
//      den Reply UNVERÄNDERT, sie baut nicht → zählt nicht als Leser).
// N4.2 wo `m.mat` reist, FÜHRT es — die kind-Defaults (Rinde 0.93 · Laub 0.62 · Gras 0.7/0.18)
//      sind reiner Fallback für mat-lose Alt-Replies (jeder heutige Reply trägt mat, V18.418).
// N4.3 die W6-Leer-Wand steht: im Studio-Regime ist die Resolved-Leere „leer" (NIE der
//      Alt-Tuft-Nachbau = Fail-Open); der Bauer verbucht „leer" VOR dem Tuft-Fallback. Der
//      Tuft-SCHNITT ist N7.3-gebunden (die Gras-Bänder üben den foundry-off-Pfad) — bis dahin
//      wacht diese Wand + die Zensus-Klasse in gate:asset-inventory.
// N4.4 die Impostor-Entscheidung ist eine POLICY-ZEILE (`impostor: true` — tree + shrub), kein
//      kind-Literal in `_foundryPresetIsTree`; vehicle/rock/flower/grass impostorn fail-closed nicht.
console.log("\nGesetz N4 — die Instance-Straße (eine Naht · mp führt · Tuft-Wand · Impostor als Daten):");
{
    const _fnBodyN4 = (re) => {
        const m = anazhNC.match(re);
        if (!m) return "";
        let i = anazhNC.indexOf(m[0]) + m[0].length,
            depth = 1,
            out = "";
        while (i < anazhNC.length && depth > 0) {
            const ch = anazhNC[i++];
            if (ch === "{") depth++;
            else if (ch === "}") depth--;
            if (depth > 0) out += ch;
        }
        return out;
    };
    // N4.1a — die Roh-Reply→Geometrie-Konversion existiert genau EINMAL (die eine Naht):
    const rawConv = (anazhNC.match(/new T\.BufferAttribute\(m\.position\.array/g) || []).length;
    law("N4.1: die Reply→Geometrie-Konversion lebt genau EINMAL (`_foundryBuildGroup`)", true, rawConv === 1);
    // N4.1b — jeder `_foundryRequest`-Aufrufer mit meshes-Handler routet durch die Naht:
    {
        let sites = 0,
            routed = 0;
        let idx = -1;
        while ((idx = anazhNC.indexOf("this._foundryRequest(", idx + 1)) !== -1) {
            const win = anazhNC.slice(idx, idx + 700);
            if (!/\.then\(\(meshes\)/.test(win)) continue; // kein Reply-Leser (gibt es heute nicht)
            sites++;
            // DIE EINE PIPE (V18.458): der Kreatur-Ofen ist das zweite legitime Tor —
            // _ofenAssembleAsset routet durch DIESELBE Mesh-Konversion
            // (_foundryBuildMesh; N4.1a zählt weiterhin GENAU EINE Roh-Naht).
            if (/_foundryBuildGroup\(meshes|_ofenAssembleAsset\(meshes/.test(win)) routed++;
        }
        law(
            `N4.1: jeder Reply-Leser routet durch die EINE Naht (${routed}/${sites} Sites, erwartet ≥5)`,
            true,
            sites >= 5 && routed === sites
        );
    }
    // N4.2 — die Naht reicht das Reply-Material herein + mp FÜHRT (kind-Defaults nur Fallback):
    law(
        "N4.2: die Naht reicht das Reply-Material herein (`m.mat` an `_foundryTreeMaterial`)",
        true,
        /_foundryTreeMaterial\(m\.kind \|\| "bark", m\.mat \|\| null\)/.test(anazhNC)
    );
    law(
        "N4.2: mp FÜHRT — rough/metal/env lesen das Reply-Material zuerst, kind-Literale nur ohne mp",
        true,
        /mp && typeof mp\.roughness === "number" \? mp\.roughness :/.test(anazhNC) &&
            /mp && typeof mp\.metalness === "number" \? mp\.metalness :/.test(anazhNC) &&
            /mp && typeof mp\.envMapIntensity === "number" \? mp\.envMapIntensity :/.test(anazhNC)
    );
    // N4.3/N7.4 — die Wiese IST Studio-definiert: das Resolved-Leer-Verdikt ist bedingungslos,
    // ohne Studio wird die Zelle bewusst gras-los verbucht, der Alt-Tuft-Bauer ist GESCHNITTEN
    // (das P4-Gesetz „wenn kein Gras da ist, ist es so" — kein Nachbau, keine Rückkehr):
    law(
        'N4.3: der Gras-Bauer verbucht „leer" als Studio-Antwort (`sg === "leer"` lebt)',
        true,
        /sg === "leer"/.test(anazhNC)
    );
    law(
        "N7.4: ohne Studio-Pipeline wird die Gras-Zelle bewusst gras-los verbucht (Existenz-Gabel)",
        true,
        /if \(!grassStudio\) \{/.test(anazhNC)
    );
    law(
        "N7.4: der Alt-Tuft-Bauer ist geschnitten (kein _grassBladeTuftGeometry im Code)",
        false,
        /_grassBladeTuftGeometry/.test(anazhNC),
        "der Tuft-Nachbau ist zurückgekehrt"
    );
    law(
        "N7.4: der Gras-Thin-Tick ist geschnitten (die Wiese dünnt NIE — V18.422 bedingungslos)",
        false,
        /_tickGrassThin/.test(anazhNC),
        "das Gras-Nach-Dünnen ist zurückgekehrt"
    );
    // N4.4 — die Impostor-Politik ist eine Daten-Zeile, kein kind-Literal:
    law(
        "N4.4: KIND_POLICY trägt die Impostor-Politik (tree + shrub `impostor: true`)",
        true,
        /tree:\s*Object\.freeze\(\{[^}]*impostor:\s*true/.test(anazhNC) &&
            /shrub:\s*Object\.freeze\(\{[^}]*impostor:\s*true/.test(anazhNC)
    );
    law(
        "N4.4: vehicle trägt KEINE Impostor-Zeile (Fernstufe bleibt Geometrie/Grade)",
        false,
        /vehicle:\s*Object\.freeze\(\{[^}]*impostor/.test(anazhNC),
        "die vehicle-Policy-Zeile impostort plötzlich"
    );
    {
        const treeBody = _fnBodyN4(/_foundryPresetIsTree\(preset\) \{/);
        law(
            "N4.4: `_foundryPresetIsTree` liest die Policy-Tabelle, kein tree|shrub-kind-Literal im Body",
            true,
            treeBody.length > 0 && /KIND_POLICY\[rec\.kind\]/.test(treeBody) && !/"tree"|"shrub"/.test(treeBody)
        );
    }
}

// N5 (Nervensystem-Plan Phase δ, „Gesetze andocken") — DIE EINE PLACE-AUFLÖSUNG: wie eine
// Buch-Art in die Welt kommt, entscheidet `_placePolicyFor` (Rezept-fx.place führt, sonst die
// placeExtra-Ableitung) + der Dispatch-Chokepoint `_placeDispatch`. Die Wald-Nischen-Quelle
// (`_forestExtraSpecies`) LIEST diese Auflösung — kein direkter placeExtra-Griff mehr außerhalb
// der Auflösung (der `.placeExtra`-Property-READ lebt genau EINMAL, in `_placePolicyFor`; die
// KIND_POLICY-Tabellen-ZEILEN `placeExtra:` sind Daten, keine Reads). Fail-closed: unbekannte
// modes fallen über die PLACE_MODES-Tabelle auf "none".
console.log("\nGesetz N5 — die Place-Auflösung (eine Quelle · Dispatch-Chokepoint · kein placeExtra-Griff):");
{
    const _fnBodyN5 = (re) => {
        const m = anazhNC.match(re);
        if (!m) return "";
        let i = anazhNC.indexOf(m[0]) + m[0].length,
            depth = 1,
            out = "";
        while (i < anazhNC.length && depth > 0) {
            const ch = anazhNC[i++];
            if (ch === "{") depth++;
            else if (ch === "}") depth--;
            if (depth > 0) out += ch;
        }
        return out;
    };
    const extrasBody = _fnBodyN5(/_forestExtraSpecies\(\) \{/);
    law(
        "N5: die Wald-Nischen-Quelle liest die EINE Auflösung (`_placePolicyFor` + `_placeDispatch` in `_forestExtraSpecies`)",
        true,
        extrasBody.length > 0 && /_placePolicyFor\(/.test(extrasBody) && /_placeDispatch\(/.test(extrasBody)
    );
    law(
        "N5: kein direkter placeExtra-Griff in der Wald-Nischen-Quelle",
        false,
        /placeExtra/.test(extrasBody),
        "die Nischen-Quelle greift wieder direkt auf placeExtra"
    );
    const policyBody = _fnBodyN5(/_placePolicyFor\(rec, kindPolicy\) \{/);
    law(
        "N5: der `.placeExtra`-READ lebt genau EINMAL — in `_placePolicyFor` (die Ableitung)",
        true,
        (anazhNC.match(/\.placeExtra/g) || []).length === 1 && /\.placeExtra === "forest"/.test(policyBody)
    );
    law(
        'N5: die Auflösung fällt fail-closed über die PLACE_MODES-Tabelle (unbekannter mode → "none")',
        true,
        /PLACE_MODES = Object\.freeze\(\{ none: 1, hand: 1, scatter: 1, forest: 1, site: 1, settlement: 1 \}\)/.test(
            anazhNC
        ) && /PLACE_MODES\[src\.mode\] === 1 \? src\.mode : "none"/.test(anazhNC)
    );
    law("N5: `gate:place-policy` verdrahtet", true, /"gate:place-policy"\s*:/.test(pkg));
}

console.log(`\n${pass} Gesetze gehalten, ${fail} verletzt.`);
if (fail) {
    console.error(
        "\n❌ ROT — die Pipeline-Verfassung ist verletzt: ein Gesetz (eine Quelle · ein Wuchs · ein Bake-Pfad · die Vertraege) wurde still gebrochen. Die Struktur traegt die Disziplin — heile die Wurzel, nicht diese Linse."
    );
    process.exit(1);
}
console.log(
    "\n✅ GRÜN — die Pipeline-Verfassung steht: eine Baum-Quelle · ein Wuchs · ein Bake-Pfad · zwei eingefrorene Verträge, jede Regel als Struktur (Chokepoint/Schnitt/Gate) verankert, nicht als Ermahnung."
);
process.exit(0);
