"use strict";
// scripts/playtest/dienst.cjs — der Richter von Dienst (spec/stamm/modul-karte.json): Log · Journal · Melder · Takt-Budgets · Entsorgung · die Dienste, die jeder ruft.
// 1 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const path = require("path");
const stammLib = require("../lib/stamm.cjs");
const { safeEvaluate } = require("../playtest.cjs");
const SKRIPTE = path.join(__dirname, "..");

// W3 UI-Puls: dirty(raum) → EINE rAF-gebündelte Render-Insel pro Raum. Das Organ `_uiDirty` dedupt
// (Set + ein rAF) → Doppel-Render/Stale durch hand-verdrahtete Render-Aufrufe strukturell unmöglich.
async function checkBandW3UiPuls(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        // (1) das Organ + die Registry existieren.
        out.organExists = typeof r._uiDirty === "function" && typeof r._uiRoomRegistry === "function";
        const reg = r._uiRoomRegistry();
        out.registryRooms = !!reg && !!reg.ich && !!reg.hof;
        // (3) DEDUP: zwei dirty-Rufe in einem Frame → EIN Puls (Set dedupt).
        r._uiPulseQueued = false;
        r._uiDirtyRooms = new Set();
        r._uiDirty("hof");
        r._uiDirty("hof");
        r._uiDirty("hof");
        out.dedup = r._uiPulseQueued === true && r._uiDirtyRooms.size === 1;
        // (4) Migration: Grep-Wand am Quelltext (s. unten).
        // (5) INSEL-ISOLATION: ein werfender Raum-Render killt den Puls nicht (try/catch, ERROR beim Namen des Raums).
        out.islandIsolated = /try \{[\s\S]*?room\.render\(\)[\s\S]*?catch/.test(window.__codeOf(r._uiDirty));
        // (6) der ON-OPEN-Render im Hof-Hook (so darf die Insel isOpen-skippen).
        out.hofOnOpen = /_renderCreatureListUI\(\)/.test(window.__codeOf(r._hofHandleDrawerChange));
        out.hofSkipsWhenClosed = !!reg.hof.isOpen && typeof reg.hof.isOpen === "function";
        return out;
    });
    // (4b) die GREP-WAND am Quelltext (außerhalb der Sandbox lesbar): die 11
    // Mechanik-Sites sind migriert, die direkte Aufruf-Krankheit ist tot.
    let srcOk = false;
    let migratedCount = 0;
    try {
        const src = stammLib.text(path.join(SKRIPTE, ".."));
        migratedCount = (src.match(/_uiDirty\("hof"\)/g) || []).length;
        const directMechanic = (
            src.match(/if \(typeof this\._renderCreatureListUI === "function"\) this\._renderCreatureListUI\(\);/g) ||
            []
        ).length;
        srcOk = migratedCount >= 10 && directMechanic === 0;
    } catch (_e) {
        srcOk = false;
    }
    check(
        "W3 UI-Puls: das EINE Organ (_uiDirty + _uiRoomRegistry mit ich/hof) existiert",
        res.organExists && res.registryRooms
    );
    check(
        "W3 UI-Puls: DEDUP — drei dirty-Rufe in einem Frame → EIN Puls, EIN Raum (Set dedupt; die Boost-Doppel-Krankheit strukturell tot)",
        res.dedup
    );
    check(
        `W3 UI-Puls: die Hof-Mechanik-Pfade routen durch den Puls (${migratedCount} Sites) + kein direkter _renderCreatureListUI-Mechanik-Aufruf mehr (Grep-Wand)`,
        srcOk
    );
    check(
        "W3 UI-Puls: die Render-Insel ist isoliert (try/catch — ein werfender Raum killt nicht den Puls) + der Hof rendert On-Open (isOpen-Skip sicher)",
        res.islandIsolated && res.hofOnOpen && res.hofSkipsWhenClosed
    );
}

module.exports = {
    checkBandW3UiPuls,
};
