// diag-pipeline-constitution.cjs — P8: DIE VERFASSUNG DER PIPELINE (Struktur ersetzt Ermahnung).
// Statisch (kein Browser), im `check`-Gate: die GESETZE der „Neues Kleid"-Pipeline sind hier als
// prüfbare STRUKTUR verankert, nicht als Kommentar-Ermahnung. Jede Regel prüft die ABWESENHEIT ihres
// Anti-Musters; die Anwesenheit des erzwingenden Baus beweisen die Verhaltens-Bänder (D3). Kommentar-Bereinigung (V18.267: der Code
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
const stripComments = require("./lib/stamm.cjs").ohneKommentare;

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

const stammLib = require("./lib/stamm.cjs");
const anazhRoh = stammLib.text(ROOT);
const anazhNC = stripComments(anazhRoh);
// Das Innere einer Methode am Kopf: der EINE Rumpf-Schneider (scripts/lib/stamm.cjs), "" ohne Definition.
const innen = (kopf) => (stammLib.rumpf(anazhNC, kopf) || "{}").slice(1, -1);
const foundryNC = stripComments(read("foundry-core.js"));
const pkg = read("package.json");

console.log("=== P8 — DIE VERFASSUNG DER PIPELINE (Struktur, nicht Ermahnung) ===");


// GESETZ 2 (P6) — EIN WUCHS: der Studio-Generator delegiert an die geteilte Quelle, KEIN Parallel-Wuchs.
console.log("\nGesetz 2 — EIN Wuchs (foundry-core liest den geteilten phyto-core):");
law(
    "KEIN Inline-Parallel-Wuchs (die `grow(pos,dir,radius,length,depth)`-Rekursion ist geschnitten)",
    false,
    /function grow\(pos, ?dir, ?radius, ?length, ?depth/.test(foundryNC),
    "der ~275-Zeilen-Inline-Bau lebt wieder"
);

// GESETZ 3 (P5 → BÄCKER-VEREINIGUNG) — DER STUDIO-BÄCKER IST DIE FERNSTUFE: der Stamm konsumiert
// den Kanal "bake-impostor" (phytogenesis `__replyBakeImpostor`), der Welt-RTT-Nachbau ist
// GESCHNITTEN (kein zweiter Bäcker); kein GL-Bake-iframe.
console.log("\nGesetz 3 — der Studio-Bäcker ist die Fernstufe (kein Nachbau, kein Bake-iframe):");
law(
    "der Welt-RTT-Nachbau bleibt geschnitten (kein `_bakeImpostorAtlasRTT`/`_impostorBlitPixels`/`_impostorDilate`/`_foundryBakeLeaves`)",
    false,
    /_bakeImpostorAtlasRTT|_impostorBlitPixels|_impostorDilate|_foundryBakeLeaves/.test(anazhNC),
    "der RTT-Nachbau ist zurück"
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
    "gate:luft-sicht",
])
    law(`\`${g}\` verdrahtet`, true, pkg.includes('"' + g + '"'));

// GESETZ 6 („Drähte statt Kopien", 08.07.) — KEINE LOGIK-KOPIE IM MONOLITHEN: der Wald-Plan (Nische/Größe) und
// der Impostor-Rahmen (Studio v36) leben EINMAL in phyto-core; jeder Refactor, der die Formel zurückkopiert, wird hier rot.
console.log("\nGesetz 6 — Drähte statt Kopien (keine Formel-Kopie im Monolithen):");
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
law(
    "KEINE Rahmen-Formel-Kopie im Monolithen (`totalH * 0.51`)",
    false,
    /totalH \* 0\.51/.test(anazhNC),
    "die v36-Rahmenformel lebt wieder als Kopie im Monolithen"
);
// W1 (Paritäts-Vollendung, 08.07.) — DIE EINE STREU-DICHTE-QUELLE: `_effectiveFoliageDensity` ist der Chokepoint; Bau
// (`_scatterPass`) und Nach-Dünnen (`_tickFoliageThin`) rechnen die Dichte nie selbst (die V18.427-Klasse strukturell zu).
console.log("\nGesetz 7 (W1) — kein eigener Dichte-Rechner + die geheilte Render-Metrik:");
law("kein eigener Dichte-Rechner in `_scatterPass`", false, /_foliageDensityScale/.test(innen("_scatterPass")));
law("kein eigener Dichte-Rechner in `_tickFoliageThin`", false, /_foliageDensityScale/.test(innen("_tickFoliageThin")));
// W1 — DIE GEHEILTE RENDER-METRIK BLEIBT GEHEILT (die V18.427-Klasse strukturell): im r184-WebGPU-Info
// ist `render.calls` ein LEBENSZEIT-Zähler — der EINE Tap liest `drawCalls ?? calls`; KEIN Leser im
// Monolithen darf `render.calls` nackt lesen (nur als `??`-Fallback hinter drawCalls). EINE Ausnahme liest ihn als
// das, was er ist: die Kehraus-Marke (W6, `_gpuKehrausMarke`) — r184s `attributeCall` trägt je Attribut den
// Lebenszeit-Zähler seines letzten Zeichnens, der Kehraus vergleicht dagegen (nie als Frame-Metrik).
{
    const nakedCalls = (anazhNC.match(/render\.calls/g) || []).length;
    const fallbackCalls = (anazhNC.match(/drawCalls[^;]{0,160}render\.calls/g) || []).length;
    const kehrausZaehler = (anazhNC.match(/_gpuKehrausMarke\([^)]*\) \{[^}]{0,160}render\.calls/g) || []).length;
    law(
        "kein nackter `render.calls`-Read im Monolithen (nur als drawCalls-??-Fallback und als der EINE Kehraus-Zähler)",
        true,
        kehrausZaehler <= 1 && (nakedCalls === 0 || fallbackCalls + kehrausZaehler >= nakedCalls)
    );
}

// N1 (Nervensystem-Plan, M8: TABELLE VOR IF) — kein kind-if-Zweig im Auto-Register-Chokepoint; eine neue Domaene ist
// eine Policy-Zeile (die Wirkung beweist gate:place-policy). Ein `if (rec.kind === ...)`-Zweig wird hier rot.
{
    const _autoBody = innen(/_foundryAutoRegisterSpecies\([^)]*\) \{/);
    law(
        "N1/M8: kein kind-String-Vergleich im Auto-Register-Chokepoint",
        true,
        _autoBody.length > 0 && !/kind\s*[!=]==?\s*"/.test(_autoBody)
    );
}

// N2 (Nervensystem-Plan, Phase beta: „Runtime = Validator") — DAS CORE-MANIFEST IST DIE EINE KERN-QUELLE: die
// Worker-Kern-Liste lebt als DATEN in cores.manifest.json (den manifest-getriebenen Boot und Stempel beweist gate:fluss
// W4/W5 am echten Faden); die Bruecke liest die ns-Kerne GENERISCH — KEIN Kern-spezifisches ns-Literal (self.__vehicleCore).
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
        "N2: die Bruecke traegt KEIN Kern-spezifisches ns-Literal mehr (self.__vehicleCore)",
        false,
        /self\.__vehicleCore/.test(stripComments(read("foundry-bruecke.js")) + stripComments(read("worlds/terrain/phytogenesis.js"))),
        "ein Kern-spezifischer ns-Zugriff ist zurueck in der Bruecke"
    );
}

// N4 (Nervensystem-Plan Phase γ, „Instance-Straße") — die Absenzen der Straße: keine zweite Reply→Geometrie-Konversion
// neben der EINEN Naht (`_foundryBuildMesh`), kein eigener mp-Leser im Stamm (die Regler liest phyto-core `budgetRegler`),
// der Mesh-Gras-Pfad bleibt tot, und `_foundryPresetIsTree` kennt kein tree|shrub-kind-Literal (die Policy-Zeile führt).
console.log("\nGesetz N4 — die Instance-Straße (keine zweite Naht · kein mp-Zwilling · Gras tot · Impostor als Daten):");
{
    const rawConv = (anazhNC.match(/new T\.BufferAttribute\(m\.position\.array/g) || []).length;
    law("N4.1: keine zweite Reply→Geometrie-Konversion neben der EINEN Naht", true, rawConv <= 1, `${rawConv} Konversionen`);
    law(
        "N4.2: kein eigener mp-Leser im Stamm (kein Zwilling von budgetRegler)",
        false,
        /typeof mp\.(roughness|metalness|envMapIntensity)\b/.test(anazhNC),
        "der Stamm liest das Reply-Material wieder selbst"
    );
    law(
        'N7.4: der Mesh-Gras-Konsum ist tot (kein `sg === "leer"`-Leser, keine Existenz-Gabel im Bauer)',
        false,
        /sg === "leer"/.test(anazhNC) || /if \(!grassStudio\) \{/.test(anazhNC),
        "der Mesh-Gras-Pfad ist zurückgekehrt"
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
    const treeBody = innen(/_foundryPresetIsTree\([^)]*\) \{/);
    law(
        "N4.4: kein tree|shrub-kind-Literal in `_foundryPresetIsTree`",
        true,
        treeBody.length > 0 && !/"tree"|"shrub"/.test(treeBody)
    );
}

// N5 (Nervensystem-Plan Phase δ, „Gesetze andocken") — DIE EINE PLACE-AUFLÖSUNG `_placePolicyFor` (ihre Wirkung beweist
// gate:place-policy): die Wald-Nischen-Quelle greift nie direkt auf placeExtra, und außer der Auflösung liest kein Glied
// `.placeExtra` (die KIND_POLICY-Zeilen `placeExtra:` sind Daten, keine Reads).
console.log("\nGesetz N5 — die Place-Auflösung (kein placeExtra-Griff außerhalb der Auflösung):");
{
    const extrasBody = innen(/_forestExtraSpecies\([^)]*\) \{/);
    law(
        "N5: kein direkter placeExtra-Griff in der Wald-Nischen-Quelle",
        false,
        /placeExtra/.test(extrasBody),
        "die Nischen-Quelle greift wieder direkt auf placeExtra"
    );
    const policyBody = innen(/_placePolicyFor\([^)]*\) \{/);
    const fremd = (anazhNC.match(/\.placeExtra/g) || []).length - (policyBody.match(/\.placeExtra/g) || []).length;
    law("N5: außer `_placePolicyFor` liest kein Glied `.placeExtra`", true, fremd === 0, `${fremd} fremde Leser`);
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
