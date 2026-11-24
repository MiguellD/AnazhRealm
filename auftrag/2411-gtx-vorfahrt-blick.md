# Auftrag GTX 1050 — Nachtrag zu `probe-deckel-einlass`, 24.11. 10:58, Koordinator

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

**BEFUND:** GPU-Probe `spiegel-eis` 2adc05ed (Lauf 45368225622, Job 138355737592, gtx1050-desktop): gate:tag-achse:echt „NACHGEGEBEN nach 81 s
(Vorfahrt-Blick gescheitert: 502 https://api.github.com/…/actions/runs/45360586112/jobs)“ → Urteil ROT, Post rot. Ein 502 der GitHub-API ist kein
Vorfahrt-Fall: die Probe gab nach, obwohl niemand Vorfahrt verlangte, und ein Macher-Kopf stand rot ohne jedes Verhalten. Neulauf seit 10:56.

**AUFTRAG (im selben Zweig, am selben Chokepoint — der EINE Lauf mit Deckel und Vorfahrt in gpu-probe.yml):**
1. Der Vorfahrt-Blick trennt „Vorfahrt verlangt“ von „Blick gescheitert“. Ein 5xx oder Netzfehler wird dreimal mit Abstand wiederholt.
2. Bleibt der Blick aus, misst die Probe zu Ende (das GPU-Schloss reiht den echt-Job ohnehin ein, er wartet höchstens einen Deckel) und der Post
   nennt die Zeile „Vorfahrt-Blick gescheitert: <status>“ — laut, nie still.
3. NACHGEGEBEN fällt nur noch nach einem GELESENEN Vorfahrt-Fall.
4. Selbsttest in der bestehenden Familie: Mutante „Blick wirft 502“ → die Probe misst zu Ende; Mutante „echt-Job wartet“ → NACHGEGEBEN.

Kein eigener Zweig, kein zweiter Bericht: die Zeile steht im EINEN Bericht zu `probe-deckel-einlass`.
