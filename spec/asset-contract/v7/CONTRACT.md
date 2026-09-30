# ASSET-VERTRAG v7 — DATEN-VERTRAG der MESHFREI-Kerne (Studio-Vertrag §8)

**Domänen:** `klang` (klang-core.js, `__klangCore`) · `koerper` (koerper-core.js,
`__koerperCore`) · `kreatur` (tetrapoda-core.js, `__tetrapodaCore`).

Anders als v1–v6 friert v7 keine GEOMETRIE ein, sondern die **reinen DATEN** der
components-only-Kerne (Studio-Vertrag §8: `MESHFREI = 1`, kein `buildInstance` —
der Host bleibt der OFEN, die Labs liefern Parameter):

- **Fingerabdruck:** `sha256(JSON.stringify({ PRESETS, PARAMS }))` je Kern —
  das kanonische JSON des Namensraums, geladen in einem frischen Node-vm.
- **Golden:** `golden/daten.json` — EINGEFROREN (Taille-Disziplin: gemintet NUR
  wenn die Datei fehlt; NIE regenerieren). Ein Edit an den Genre-/Gestalt-/
  Bewegungs-Daten eines Kerns wird ROT und ist ein bewusster Schöpfer-Akt
  (Golden löschen + neu minten + Wellen-Bericht).
- **Schema (der Wächter `gate:daten-contract`):** B1-Namensraum + kind je
  Domäne · `fx.place {mode:"none"}` · `fx.klang` (bpm > 0 · scale = Halbtöne
  0..11 == `SCALES[scaleFor(darkness)]`, die EINE Lab-Formel · dna-Achsen in
  [0,1]) · `fx.motion` (presets: je Profil endliche Zahlen/Zahl-Listen) ·
  s-Dials innerhalb der B4-Bänder · JSON-Klonbarkeit (die Taille).
- **Selbst-Test:** injizierte Verletzungen (bpm 0 · dna 7 · String im
  motion-Profil · korruptes Golden) werden erkannt — die Linse ist nicht vakuös.

Konsumenten: `fx.klang` → `_klangStudioPreset`/`_lofiChordDurationMs`
(anazhRealm.js, EIN Audio-System); `fx.motion` → benannter Andock-Punkt
`_animateCompoundMotion`/Rig (Konsum = Folge-Schritt, s. Vertrag §8.2).
