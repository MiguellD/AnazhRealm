_stammZonen(AnazhRealm, [
    AnazhRealm_Z02a,
    AnazhRealm_Z02b,
    AnazhRealm_Z03a,
    AnazhRealm_Z03b,
    AnazhRealm_Z04,
    AnazhRealm_Z05a,
    AnazhRealm_Z05b,
    AnazhRealm_Z06a,
    AnazhRealm_Z06b,
    AnazhRealm_Z06c,
    AnazhRealm_Z07,
    AnazhRealm_Z08,
    AnazhRealm_Z09,
    AnazhRealm_Z10,
    AnazhRealm_Z11a,
    AnazhRealm_Z11b,
    AnazhRealm_Z11c,
    AnazhRealm_Z11d,
    AnazhRealm_Z12,
    AnazhRealm_Z13a,
    AnazhRealm_Z13b,
    AnazhRealm_Z13c,
    AnazhRealm_Z14,
    AnazhRealm_Z15a,
    AnazhRealm_Z15b,
    AnazhRealm_Z15c,
    AnazhRealm_Z16,
    AnazhRealm_Z17a,
    AnazhRealm_Z17b,
    AnazhRealm_Z17c,
    AnazhRealm_Z18,
    AnazhRealm_Z19,
    AnazhRealm_Z20a,
    AnazhRealm_Z20b,
    AnazhRealm_Z20c,
    AnazhRealm_Z20d,
    AnazhRealm_Z21,
    AnazhRealm_Z22,
    AnazhRealm_Z23a,
    AnazhRealm_Z23b,
    AnazhRealm_Z24,
    AnazhRealm_Z25a,
    AnazhRealm_Z25b,
    AnazhRealm_Z25c,
]);

// ===== ATLAS §26 · AUSSEN-KONSTANTEN — VERSION · Tag-Schlüssel · Signatur-Tabellen · frozen Welt-Daten =====
// Welle 4 Phase 1 — Material-Tag-Achsen. Zehn Felder aus Konzept §2.2,
// kondensiert. Alle Werte 0..1. MATERIAL_TAG_DEFAULTS startet jeden Tag
// auf 0, damit `_defaultMaterials` nur die positiven Felder setzen muss.
// Welle 6.D Etappe 1 — Stat-Ableitung aus Tag-Profil. Sechs Spieler-Stats
// (HP-Max, Damage, Speed, JumpPower, Stamina-Max, Präzision) + zwei Resistenzen
// (MagicResist, HeatResist). Jede Formel nimmt das `tags`-Objekt und gibt
// eine Zahl zurück. Konstanten sind so gewählt, dass Mensch sich nahe an
// den heutigen Default-Werten (speed=6, jumpPower=12) bewegt, Phönix
// schneller+höher aber fragiler, Drache zäher aber langsamer.
//
// Wenn Du diese Werte tunen willst: dieselben Formeln bleiben, nur die
// Multiplikatoren ändern. Test-Setup (Welle 6.D Diskrimination) prüft die
// Verhältnisse, nicht die absoluten Zahlen.
//
// V9.86 — die einzige Versions-Quelle. Vorher (V7.82-Stand) war der String
// hardcoded in `log()` und der Init-Message — verlässlich versions-falsch
// nach jedem Bump. Jetzt: eine Klassen-Konstante, von beiden Stellen
// gelesen. Bei Version-Bumps nur HIER editieren + parallel zu
// `package.json`/`index.html` mitziehen (Doku-Disziplin).
// V18.491.88 — vehicle LEHREN Host-Leser/Chat (Spiegel porta-messen); iframe-Crossfade = Redesign later.
AnazhRealm.VERSION = "18.546.3";
