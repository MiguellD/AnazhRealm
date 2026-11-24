# Wurzel SLOT-BILANZ (gate:foundry-crossfade Teil b) — gelesen an sport-regeln a620781b, CI-Log Job 138549526443 (c0e41d18)

Befund am Läufer: Σ liveCount 273 → 273 GRÜN, je Gruppe dicht GRÜN, aber slotEntry 2 in „impostor#fimp:atlas“ + „impostor#fimp:atlas#S“
(instSlots false, instSlotsBand false, removeLief true). Die Baseline trug die zwei Slots schon: der Rest ist EINE Platzierung der Karte
(Atlas-Leaf + sein Wurf-Zwilling, stoff-karte.js:607/:631), nie ein Leck des Sweeps.

Kette: diag-foundry-crossfade.cjs:542 `before = balance()` → :543 `r._rebuildArchitectureMesh(entry)` („Erst-Platzierung“). Ist der
Proben-Baum dann SCHON platziert, legt `_rebuildArchitectureMesh` (siedlung-instanz.js:925) über `_archInstanceAdd` (:945 → :626) einen
zweiten Satz an und überschreibt `entry.instSlots` (:728) ohne Freigabe — der erste Satz verwaist mit slotEntry = entry; Sweep und
Remove räumen nur den zweiten. Wer platzierte vorher: der Nah-Gang des Cull-Takts (vegetation-baum.js:3054 `_kappeOffen(uhr() - jetztN,
ARCH_PLATZ_MS)` → :3056 `_rebuildArchitectureMesh`), gekappt an der WANDUHR (`ARCH_PLATZ_MS = 4`, vegetation-baum.js:3400) — ob der
Baum in den Wärme-Takten vor der Baseline fällt, entscheidet die Geschwindigkeit des Läufers. Dasselbe Muster wie DRUCK-BUDGET-WANDUHR.

Andere Rufer ohne Wache: siedlung-ort.js:1238 (Hand-Dichte, `nearest.e` ohne instanced-Prüfung). Mit Wache: studio-gestalt.js:959.
Schnitt (Vorschlag, ungemessen): `_rebuildArchitectureMesh` räumt einen platzierten Eintrag zuerst (`if (entry.instanced)
this._archInstanceRemove(entry)`), oder die Probe räumt vor der Baseline; Linse: `res.vorPlatz = entry.instanced` vor :543.
