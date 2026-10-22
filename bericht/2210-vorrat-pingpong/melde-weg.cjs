// vorrat-pingpong (Decke, freigegeben: Existenz-Proben): Melde-Felder `out.X = typeof r.Y === "function"` samt ihren Lesern im
// Playtest — sie bewiesen Existenz, nie Konsum (die Suite ruft die Methoden nie). Jede Ersetzung trifft genau einmal.
// Aufruf im Baum: node melde-weg.cjs
const fs = require("fs");
const P = "scripts/playtest/";
const ED = [
    ["feld-nexus.cjs", '        out.hasLlmCallCreature = typeof r.llmCallCreature === "function";\n', ""],
    [
        "feld-nexus.cjs",
        '        check(\n            "Welle 6.H P2E V1: llmCallCreature existiert (die Suite ruft ihn nie)",\n            wave6hP2eV1Results.hasLlmCallCreature\n        );\n',
        "",
    ],
    ["feld-nexus.cjs", '        out.hasRareEventTrigger = typeof r._maybeTriggerCreatureRareEventLlm === "function";\n', ""],
    [
        "feld-nexus.cjs",
        "CREATURE_PROPOSED_OPS Set (>= 10 Ops) + RareEvent-Trigger (die Suite ruft ihn nie) + Takt 600 s",
        "CREATURE_PROPOSED_OPS Set (>= 10 Ops) + Takt 600 s",
    ],
    ["feld-nexus.cjs", "                wave6hP2eV3Results.hasRareEventTrigger &&\n", ""],
    ["feld-nexus.cjs", '        out.hasHandleToolDrop = typeof r._workshopHandleToolDrop === "function";\n', ""],
    ["feld-nexus.cjs", '        out.hasInstallActionBtns = typeof r._workshopInstallActionButtons === "function";\n', ""],
    ["feld-nexus.cjs", '        out.hasInstallDelBtn = typeof r._workshopInstallDeleteButton === "function";\n', ""],
    [
        "feld-nexus.cjs",
        '        check(\n            "V8.05 (V17.91): Tool-Drop, Aktions- und Lösch-Knopf existieren (die Suite fährt sie nicht)",\n            v805Results.hasHandleToolDrop && v805Results.hasInstallActionBtns && v805Results.hasInstallDelBtn\n        );\n',
        "",
    ],
    ["koerper-seele.cjs", '        out.stationLabel = typeof r._stationLabelForDomain === "function";\n', ""],
    ["koerper-seele.cjs", '    check("V17.66 S7: _stationLabelForDomain existiert", res.stationLabel);\n', ""],
    ["netz-p2p.cjs", '        out.w7MethodsPresent = typeof r._p2pDrainIce === "function";\n', ""],
    ["netz-p2p.cjs", '        check("W7 P1: _p2pDrainIce auf der Klasse (die Suite ruft ihn nie)", w7Results.w7MethodsPresent);\n', ""],
    [
        "netz-p2p.cjs",
        '        check(\n            "W16: _p2pFetchVendorBundle auf der Klasse (die Suite ruft ihn nie)",\n            w16Results.methodsPresent\n        );\n',
        "",
    ],
    ["netz-p2p.cjs", '        out.lobbyMethods = typeof r._renderLobbyUI === "function";\n', ""],
    [
        "netz-p2p.cjs",
        '        check(\n            "W7 P4: _renderLobbyUI auf der Klasse (die übrigen Lobby-Methoden fährt das Band)",\n            w7p4Results.lobbyMethods\n        );\n',
        "",
    ],
    ["speicher.cjs", '        out.methods = typeof r._runWorldBuild === "function";\n', ""],
    ["speicher.cjs", '        check("KI-Übersetzer P2: _runWorldBuild existiert (die Suite ruft ihn nie)", transl2Results.methods);\n', ""],
    ["wasser.cjs", '        out.hasBuildMethod = typeof r._buildVoxelChunkWaterIsoSurface === "function";\n', ""],
    ["wasser.cjs", '        out.hasDisposeMethod = typeof r._disposeVoxelChunkWaterIso === "function";\n', ""],
    ["wasser.cjs", '    check("Welle C.2 V9.72: Build + Dispose Methoden existieren", res.hasBuildMethod && res.hasDisposeMethod);\n', ""],
    ["werkstatt-bauen.cjs", '        out.hasRenderUI = typeof r._renderKeybindingsUI === "function";\n', ""],
    ["werkstatt-bauen.cjs", '        check("Welle 6.C3: _renderKeybindingsUI existiert", wave6c3Results.hasRenderUI);\n', ""],
    ["werkstatt-bauen.cjs", '        out.probeMethod = typeof r._workshopProbeJoints === "function";\n', ""],
    ["werkstatt-bauen.cjs", "Gelenk-Probe: Methode + Button + RAF-Konsum", "Gelenk-Probe: Button + RAF-Konsum"],
    ["werkstatt-bauen.cjs", "        res.probeMethod && res.probeBtn && res.probeInRAF\n", "        res.probeBtn && res.probeInRAF\n"],
    ["werkstatt.cjs", '        out.hasShapeDnDInstall = typeof r._workshopInstallShapeDragDrop === "function";\n', ""],
    [
        "werkstatt.cjs",
        '        check(\n            "V8.02 Phase 3: _workshopInstallShapeDragDrop existiert (die Suite fährt ihn nicht)",\n            v802Results.hasShapeDnDInstall\n        );\n',
        "",
    ],
    ["werkstatt.cjs", '        out.hasMaterialRender = typeof r._workshopRenderMaterialPalette === "function";\n', ""],
    ["werkstatt.cjs", '        out.hasColorRender = typeof r._workshopRenderColorPalette === "function";\n', ""],
    [
        "werkstatt.cjs",
        '        check(\n            "V8.03: die Material- und Farb-Palette existieren (die Suite fährt sie nicht)",\n            v803Results.hasMaterialRender && v803Results.hasColorRender\n        );\n',
        "",
    ],
    ["werkstatt.cjs", '        out.helpers = typeof r._loadFeedBookmarks === "function";\n', ""],
    ["werkstatt.cjs", "Lesezeichen: _loadFeedBookmarks (die Suite ruft ihn nie) + Toggle-Roundtrip", "Lesezeichen: Toggle-Roundtrip"],
    ["werkstatt.cjs", "        res.helpers && res.toggleOn && res.persisted && res.toggleOff\n", "        res.toggleOn && res.persisted && res.toggleOff\n"],
    ["werkstatt.cjs", '        out.batchExists = typeof r._socialCommentsBatch === "function";\n', ""],
    ["werkstatt.cjs", "        res.handlerWired && res.batchExists && res.xssWall\n", "        res.handlerWired && res.xssWall\n"],
];
const je = new Map();
for (const [f, a, b] of ED) {
    const t = je.get(f) || fs.readFileSync(P + f, "utf8");
    const n = t.split(a).length - 1;
    if (n !== 1) throw new Error(`${f}: ${n}× „${a.slice(0, 70)}"`);
    je.set(f, t.replace(a, b));
}
for (const [f, t] of je) fs.writeFileSync(P + f, t);
console.log("ersetzt", ED.length, "in", je.size, "Dateien");
