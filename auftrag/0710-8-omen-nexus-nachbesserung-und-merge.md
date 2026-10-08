# Auftrag 0710-8 an den OMEN — Nachbesserung welle-m-nexus + Merge mit integ-probe

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Die unabhängige Gegenprüfung von welle-m-nexus 91c44f0f:
Blocker-Netz in 9 Fällen / 7 400 Orakel-Proben 0 Abweichungen (Ritt, Absteigen, Haus-Hülle, verschobenes/gedrehtes Haus,
Riesen-Bau über 988 Zellen, Peer-Spawn, Nexus-Kappe, Abriss, Reload; Strahlen bis 500 m, Zellgrenzen, Kapsel 9,5 m), Löser-Rufe
je Körper 1 130–1 650 → 41–46; Mess-Halt im Spiel inaktiv (Nexus setzt sein Dorf weiter), 72 DSL-Ops beurteilt; Mitspieler-Dorf
gehört dem Mitspieler. **merge-reif: nein** — zwei rote Punkte (je eine Zeile) + Auflagen.

**ROT**
1. `anazhRealm.js:32999` `_blockerNetz`: beim Neubau startet der Zähler mit `frage: 0`, die Einträge behalten ihre alte
   `_blockerFrage` → konstruiert: neues Array mit denselben Einträgen, Zähler bis zur alten Marke → Orakel trifft die Eichen-Box bei
   t = 0,9496, das Netz verfehlt sie. Heute im Spiel nicht erreichbar (einziger Array-Tausch :43791 baut frische Einträge), aber
   die Runde „Neues Array" (`scripts/diag-blocker-netz.cjs:469`) ist nur zufällig grün. Fix: `frage: alt ? alt.frage : 0` wie `seq`;
   die Runde so bauen, dass sie den Fall trifft (vorher rot).
2. `anazhRealm.js:70632–70633` `_spielerVerlangt` kennt nur `human` und `llm:*` — drei Spieler-Wege fallen heraus: Fähigkeit per
   Taste (`ability:`, :23475/:43897), „wirke …" (`capability:`, :49823), Verzehr (`consume:`, :16765) → 0 rad statt Drehung. Nach dem
   eigenen Kommentar („sein Chat, seine Werkzeuge") gehören sie dazu; C7 um diese drei Quellen erweitern.

**GELB → bitte mitnehmen**
- Eine Wand gegen künftige Schreiber der Boxen: die Quell-Prüfung (Q, diag-blocker-netz.cjs:558–580) sieht nur push/splice/pop/
  shift/unshift — nicht `entry.blockerAABBs =` außerhalb `_populateBlockerAABBs`, direkt geänderte Box-Felder, sort/reverse/fill.
  AST-basiert wie die Schreiber-Wand von streaming (`scripts/lib/stand-linse.cjs` `schreiberWand`) — jeder Schreiber stempelt über
  `_blockerStampReach`. Und `gate:blocker-netz --selftest` (heute keiner).
- **gate:fernwald Selbsttest 1 (CI-Wackler, auch auf main):** `scripts/diag-fernwald.cjs:379–380` tauscht `_archKartenPreset`, weckt
  aber die Stand-Wache nicht — ruht der Cull 30/30 Takte, bleibt „der alte Weg" wirkungslos (reproduziert: „ruhte 30 von 30 · A
  1570/1570"). Der Tausch weckt die Welt (`_weltRegt`) bzw. der Selbsttest verlangt Arbeit des Culls.

**MERGE mit integ-probe** (V18.536 in Arbeit: impuls + werkstatt + v1-ankunft, Kopf `git fetch origin integ-probe`): merge
origin/integ-probe in welle-m-nexus und löse die 7 Stellen nach Semantik — du kennst deinen Code am besten:
- **Absicht:** integ-probe trägt einen Flag-Zwilling `orientieren: !/^remote/` (integ ~:2229) mit `eigen` (~:71752, :71768) — dort
  dreht ein Nexus-Dorf noch. Nach dem Merge gilt NUR `verlangt` + `_spielerVerlangt`, auch für den Chat-Satz „… steht vor dir".
- **Dorf-Mitte:** der Ersatz-Ort aus integ-probe (`_slotErsatzVersaetze` ~:71419) setzt Häuser neben Anker + Slot → die Summe
  `mx += origin.x + slot.x` (dein ~:70616) muss die tatsächlich gesetzten Orte summieren; dieselbe Korrektur steht doppelt (integ
  über `anchor.mitte`, du über `res.mitte`) — nur EINE bleibt.
- **`_fieldRaycast`:** die Netz-Schleife übernimmt den Sprung `durchPflanzen && bx.pflanze` (integ ~:32581), das Orakel im Gate liest
  den Parameter `o`.
- **`_stepCharacterStructures`:** vereinen aus `huelle.eigen` (integ ~:93148), `huelle.quelle`, `quellen.push` und der Nachfrage beim
  Netz; `x0/z0` und `vorX/vorZ` werden ein Paar; das Löser-Orakel braucht den `eigen`-Sprung.
- **Stiller Zwilling ohne Git-Konflikt:** integ-probe cf490b85 überschreibt in `scripts/diag-idle-gpu-churn.cjs:258` `r.dslEval` unter
  der Bühne — fällt zugunsten von `_messHalt` + `__weltaktSpion`.
- Der Tier-Leib (Nähe-Liste je Tier aus dem ganzen Bestand) — dein offener Punkt — gern in dieser Runde über dieselbe Nachbarschaft.
**Danach:** Gates (blocker-netz, weltakt-wache, settlement C7, fernwald, fahr-leben, ankunft, werkstatt-weg, npm run check inkl.
ci-deckung), voller playtest einmal, Push, CI (Reruns über mich). Bericht `bericht/0710-8-…md` + Kopf.
