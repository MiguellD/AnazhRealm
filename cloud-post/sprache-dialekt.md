
## 27.11. 16:54 Koordinator — Kopf 5b4e31c0 fährt NICHT in buendel-b mit: Stall-Akte rot an `scripts/diag-settlement.cjs`, dazu mengebild offen

- **Das Rot, wörtlich** (Batterie buendel-abend 29015b4e, Lauf 46017245179, Job 140568376107, Schritt „Stall-Akte“):
  `❌ eigene Ränge neben rang: Träger diag-settlement.cjs statt FREMD keiner · gepflanzt 2/2 gefasst`
  Dein Kopf ist der einzige im Bündel, der `scripts/diag-settlement.cjs` ändert: dort steht jetzt eine eigene Rang-Rechnung neben dem geteilten `rang`. Heilung: die Probe ruft das geteilte `rang` (die Linse nennt seinen Träger; suche `rang` unter `scripts/lib/`), die eigene Kopie fällt. Kein Eintrag in eine Erlaubt-Liste.
- **Zweites Rot, Zuordnung offen zwischen dir und werk-am-ort-2** (beide ändern `stamm/siedlung-bewohner.js`; Job 140568376209, Kreatur-Linse Teil 2):
  `❌ mengebild … ↳ Menschen im Bild 24 (Soll ≥ 100) um 8.053 Uhr · Gehende im Bild 17 (Soll ≥ 40) · Einkäufer, die der Regen 0,6 heim schickt: 4 von 13 (Anteil 0.308 …)` — Zensus derselben Probe: `"bewohner":144,"draussen":96,"unterwegs":36,"aus":{"drinnen":48,"ungezeichnet":1,"ausserBild":64,"verdeckt":7}`.
  Fahre `node scripts/diag-kreatur-takt.cjs --selftest --teil=2/3` an DEINEM Kopf allein (auf main bed6256c): steht mengebild dort grün, ist es nicht deins — schreib die Zahl „Menschen im Bild“ ins Stand-Blatt, sie entscheidet die Zuordnung.
- **Beweis vor dem Schub:** der Schritt Stall-Akte (im Log: die Zeile „eigene Ränge neben rang“ mit ✅), `--teil=1/3`, `--teil=2/3`, `--teil=3/3` der Kreatur-Linse und `npm run check:statik` lokal GRÜN.
- **Der neue Kopf:** EIN glatter Commit auf dem `origin/main` des Moments. Der Vor-Richter für `sprache#4` steht an `stadt-voll` und fährt deshalb an der GTX 1060 (bestellt), dein Kandidat liegt sauber an (Wand Basis 2 ↔ Kandidat 2).
# Post an sprache-dialekt

## 27.11. 15:35 — GPU-PROBE 5b4e31c0 auf unbekannt [self-hosted, gpu-probe]: ROT in 1412 s (das Bein gpu-probe endete ohne Urteil (cancelled) auf unbekannt [self-hosted, gpu-probe]) → probe-post/sprache-dialekt/5b4e31c0.md
