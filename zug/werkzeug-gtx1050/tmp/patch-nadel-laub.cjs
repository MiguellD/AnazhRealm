// patch-nadel-laub.cjs — w28-nadel-laub (Nadel ≡ Laub, EIN Programm der Krone): im Arbeitsbaum ausführen (node <pfad>)
const fs = require("fs");
const ersetze = (datei, alt, neu) => {
    const t = fs.readFileSync(datei, "utf8");
    if (t.split(alt).length !== 2) throw new Error(`${datei}: Anker ${t.split(alt).length - 1}-mal statt einmal: ${alt.slice(0, 80)}`);
    fs.writeFileSync(datei, t.replace(alt, neu));
    console.log("ok", datei, alt.slice(0, 50).replace(/\n/g, " "));
};

// (1) die Umwandlung: eine Krone ohne Jahres-Ecken trägt die STEHENDE Ecke
ersetze(
    "stamm/studio-gestalt.js",
    `        const paar = !!(m.aCenter && m.aCenter.array) + !!(m.aType && m.aType.array);
        if (paar === 1) throw new Error("_foundryBuildMesh: die Ecken reisen nur als Paar (aCenter · aType)");
        const SG = paar ? AnazhRealm._saisonGesetz().typ : null;
        const jahr = !!SG && m.aType.array.some((t) => t === SG.laub || t === SG.bluete);
        if (paar) AnazhRealm._jahrEcken(geo, m.uv && m.uv.array, m.aCenter.array, m.aType.array);
        else if (m.uv && m.uv.array) geo.setAttribute("uv", new T.BufferAttribute(m.uv.array, 2));`,
    `        // DIE KRONE OHNE JAHRES-ECKEN STEHT (w28-nadel-laub): ein Teil der Krone eines Baums (\`baum\`, Laub oder Karte), dem die
        // Schale keine Ecken lässt (die Nadel, der Wedel: ihre Typen liest kein Leser des Wirts), trägt die STEHENDE Ecke
        // (\`JAHR_STEHT\`, die Mitte ist die Ecke selbst) — so baut die Krone der Nadel DENSELBEN Stoff wie die des Laubs
        // (die Signatur \`jahr\`), und die Ankunft übersetzt EIN Programm der Kronen statt zwei. Sie fällt nie (\`_jahrLage\`:
        // jeder Typ außer Laub und Blüte steht) und tönt nie (\`_foundryTreeMaterial\`). Gemessen an 3308689f (GTX 1050, Ankunft
        // an der Genesis): 6 Kronen-Teile ohne Ecken mit 12 384 Ecken — 16 B je Ecke mehr im Grafikspeicher (~0,2 MB), kein Byte
        // mehr auf Platte und Faden (die Ecke entsteht hier).
        const paar = !!(m.aCenter && m.aCenter.array) + !!(m.aType && m.aType.array);
        if (paar === 1) throw new Error("_foundryBuildMesh: die Ecken reisen nur als Paar (aCenter · aType)");
        const steht = !paar && !!baum && (m.kind === "foliage" || m.kind === "foliageTex");
        const SG = paar ? AnazhRealm._saisonGesetz().typ : null;
        const jahr = steht || (!!SG && m.aType.array.some((t) => t === SG.laub || t === SG.bluete));
        if (paar) AnazhRealm._jahrEcken(geo, m.uv && m.uv.array, m.aCenter.array, m.aType.array);
        else if (steht)
            AnazhRealm._jahrEcken(
                geo,
                m.uv && m.uv.array,
                m.position.array,
                new Float32Array(vcount).fill(AnazhRealm.JAHR_STEHT)
            );
        else if (m.uv && m.uv.array) geo.setAttribute("uv", new T.BufferAttribute(m.uv.array, 2));`
);

// (2) der Ton folgt der Ecke: die stehende Ecke tönt nie, jede andere Ecke eines tönenden Stoffs wie bisher
ersetze(
    "stamm/studio-stoff.js",
    `        const _toent = kind === "grass" || jahr === true;
        const laubFarbe0 = _toent && _suF && _suF.uSeasonMul ? vcol.mul(_suF.uSeasonMul) : vcol;`,
    `        const _toent = kind === "grass" || jahr === true;
        // DIE STEHENDE ECKE TÖNT NIE (w28-nadel-laub): die Krone der Nadel trägt den Stoff des Laubs mit der stehenden Ecke
        // (\`JAHR_STEHT\`, \`_foundryBuildMesh\`) — sie trägt den Ton als 1 (\`select\`: exakt uSeasonMul oder 1, kein Mischen), jede
        // andere Ecke eines Jahres-Stoffs tönt wie bisher (die Regel des Stoffs: dessen Ecken Laub oder Blüte tragen)
        const _tonJeEcke =
            jahr === true && kind !== "grass" && _suF && _suF.uSeasonMul
                ? TSL.select(
                      TSL.vertexStage(TSL.attribute("aType", "float")).greaterThan(AnazhRealm.JAHR_STEHT + 0.5),
                      _suF.uSeasonMul,
                      TSL.vec3(1)
                  )
                : null;
        const laubFarbe0 =
            _toent && _suF && _suF.uSeasonMul ? vcol.mul(_tonJeEcke || _suF.uSeasonMul) : vcol;`
);

// (3) die Konstante der stehenden Ecke (bei den Außen-Konstanten der Gestalt)
ersetze(
    "stamm/studio-gestalt.js",
    `_stammZonen(AnazhRealm, [AnazhRealm_studio_gestalt]);`,
    `_stammZonen(AnazhRealm, [AnazhRealm_studio_gestalt]);

// DIE STEHENDE ECKE (w28-nadel-laub, \`_foundryBuildMesh\`): der Typ der Jahres-Ecke einer Krone, der die Schale keine Ecken lässt
// (die Nadel) — kein Typ des Gesetzbuchs (SAISON_GESETZ \`typ\`: Laub 1, Blüte 3, Halm 4; „Rinde 0, Nadel 2 … stehen"): sie steht
// (\`_jahrLage\`: nur Laub und Blüte ziehen sich auf ihre Mitte) und tönt nie (\`_foundryTreeMaterial\`).
AnazhRealm.JAHR_STEHT = -1;`
);
