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

**Vertrags-Akt 07.10.2026 (Welle L kreatur — das SPRUNG-GESETZ):** `tetrapoda-core.js` neu gemintet
(`1689e8e50ed5…` → `508ac6c14735…`). Geändert sind genau 12 Felder in `PRESETS.<tier>.fx.verhalten` (wolf · fox ·
bear · deer): `aktionen.bound.hop` 3,2 → `true`, `aktionen.pounce.hop` 4,5 → `true`, `sprung { impulsProM }` fiel.
Ohne diese drei Felder ist das kanonische JSON byte-gleich (geprüft). Die Höhe eines Sprungs ist die EINE Quelle
`freude.hopHochM`/`hopBasisM`, der Abflug v0 = √(2·g·h) (Wirt `creatureJump`); der m/s-Abflug der Aktionen war ihr
Zwilling (der frohe Sprung stieg 0,52 statt 1,2 m). Wächter: gate:studio-vertrag (hop nur `true`, kein `sprung`),
gate:altlasten (`impulsProM` auch im Gesetzbuch), gate:kreatur-takt huepfer (Scheitel = Freude-Gesetz).

**Vertrags-Akt 08.10.2026 (Welle LF rudel — DAS TEMPERAMENT DER GATTUNG):** `tetrapoda-core.js` neu gemintet
(`508ac6c14735…` → `052f6bddb264…`, klang- und koerper-core byte-gleich). Geändert sind genau 28 Felder in
`PRESETS.<tier>.fx.verhalten` (wolf · fox · bear · deer): `temperament.signaturen` und `temperament.floor` fielen,
`temperament.gattung` kam; `furcht.boldFromDichte/boldFromHärte/shyFromLebendig` fielen, `furcht.mutGewicht` kam. Ohne
diese Felder ist das kanonische JSON byte-gleich (geprüft). Das Gemüt eines Tiers ist `temperamentDerGattung(dials,
bodySize, gattung)` (Ernährung × Masse; Lehre 8: die Tiere sind tag-gleich). Wächter: gate:studio-vertrag (Gattungs-Zeile
Pflicht, Signaturen und Substanz-Gewichte kehren nicht zurück, Selbsttest), gate:kreatur-takt temperament.

**Vertrags-Akt 08.10.2026 (Welle LF rudel — DER PERSÖNLICHE RAUM):** `tetrapoda-core.js` neu gemintet (`052f6bddb264…` →
`42238c7bdb5e…`, klang- und koerper-core byte-gleich). Geändert sind genau 24 Felder in `PRESETS.<tier>.fx.verhalten`:
`separation.radiusBaseM` → `separation.raumKugel`, `herde.minAbstSq`/`fensterSq` → `herde.fensterRaum`,
`furcht.neugierStoppM` fiel. Ohne diese Felder byte-gleich (geprüft). Der Raum eines Tiers ist seine Körper-Kugel ×
`raumKugel` (Art und Größe), herdeZug zieht nur jenseits des Paar-Raums und liefert das Mittel. Wächter: gate:studio-vertrag
(die alten Felder kehren nicht zurück), gate:kreatur-takt abstand.

**Vertrags-Akt 08.10.2026 (Welle LF rudel — DIE JAGD SCHLIESST SICH):** `tetrapoda-core.js` neu gemintet (`42238c7bdb5e…` →
`195c1576f10a…`, klang- und koerper-core byte-gleich). Geändert sind genau 20 Felder in `PRESETS.<tier>.fx.verhalten`:
`jagd.hetzM`, `jagd.pirschSichtM`, `jagd.beuteMasse` kamen, `jagd.scentProbeM` und `furcht.fleeSpeedBoost` fielen. Ohne
diese Felder byte-gleich (geprüft). Additiv außerhalb der Rezepte: `STEUER_GESETZ.sprint` und `sprintTempo(L)` (der Galopp
der Gestalt). Wächter: gate:studio-vertrag, gate:kreatur-takt jagdkreis und rudel.
