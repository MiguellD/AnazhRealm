# Auftrag OMEN (GTX 1060) — auge-der-art 3, 24.11. 10:45, Koordinator

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

**BEFUND:** `auge-der-art` 380dc644ef86c126fe41a4160c060711ebaabe90 — Code-Check GRÜN (21 von 22 Jobs, Lauf 45340636521), die GPU-Probe ROT
allein am Zeit-Deckel (gate:kreatur-takt 1 134 s > 960 s auf der GTX 1050; das Tor braucht keine GPU und misst in der Cloud 2 275 s in drei
Teilen). Dein Handlauf an der 1060: Teil 1/3 zweimal GRÜN (580 s, 563 s), kein ganzes Urteil. ABER: `git merge-tree --write-tree origin/main
380dc644` = KONFLIKT gegen main f18576b6 — so landet der Kopf nicht.

**AUFTRAG (VOR scherbe-liegt — eine Macher-Landung mit Sprossen schlägt einen Richter):**
1. `git fetch origin main` (der Zug mit `w28-wind-saison` und `w28-mensch-nah` fährt; nimm den Kopf, der dann steht), `git merge origin/main` in
   `auge-der-art` (Merge-Commit, kein Rebase, kein Force-Push). Beide Seiten bleiben ganz; GOLDEN nur neu prägen, wo der Merge es verlangt, mit Byte-Beweis.
2. Pflicht vor dem Push, alle GRÜN: `npm run check:statik` · `npm run format:check` · `npm run lint` · `node scripts/stamm-umzug.cjs --nach-karte` ·
   gate:betriebsgesetz · gate:kreatur-leben · probe-tag · `git merge-tree --write-tree origin/main HEAD` exit 0. Nur CPU; die GTX-Liste misst weiter.
3. Proben-Marken: gate:kreatur-leben und bild:wiese@0.5. gate:kreatur-takt gehört NICHT in die GPU-Probe (kein GPU-Tor, über dem Deckel). Verlangt
   `PROBE_PFLICHT` (zug.cjs) es trotzdem: warte auf `probe-deckel-einlass` der GTX 1050 (EIN Deckel `PROBE_DECKEL_S` 480, der Einlass weist Tore
   über dem Deckel ab), merge main danach noch einmal und pushe dann. Kein Sonderweg am Deckel vorbei.
4. Betreff: „Vorprüfung auge-der-art 3 (auf main <kopf8>): Entdeckung ≠ Alarm — … [gpu-probe: …] [ci voll]“. Der Stempel-Satz (Geschnitten ·
   Gemessen · Offen mit den Zahlen: Hirsch-Flucht 3,4 km → 372 m, Wolf ruht 0,600, Rudel 16 von 60) steht im Post `cloud-post/auge-der-art.md`.
5. EIN Bericht an „Radeon Koordinator Effizienz“ mit dem neuen Kopf (40 Zeichen) und dem exit der Merge-Probe; ich stemple.

**REGEL, bestätigt:** ein Handlauf hält die Liste höchstens 20 min (deine Vorgabe WARTE 180 + MAX 1020 gilt). Die 86 min ohne GTX-Station
(09:14–10:40) gingen auf MEINEN Auftrag zum Handlauf eines Tors, das keine GPU braucht — solche Tore fahren nie mehr von Hand auf einer Karte.

Danach unverändert: scherbe-liegt → ci-post-erbt → der EINE pm-Commit.
