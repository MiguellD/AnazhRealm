# Bericht 2210 vorrat-pingpong: EIN Vorrat je Zelle — die Welt am Dorf steht wieder (Kopf da6203ef [ci voll])

**Geschnitten** (Zweig `vorrat-pingpong` ab origin/integ-zug 01ba2bf3)
- **Wurzel:** `stamm/siedlung-ort.js` `_dorfBereiten` / `_tickAutoSettlement` (siedlung.K5). Der EINE Vorrat `_dorfVorrat` ist jetzt **EIN Vorrat je Zelle**, `_dorfVorraete` (Map Zelle → {fertig, da, x, z}).
  - Eine vorbereitete Zelle wird übersprungen (`V.has(key)`). Es fliegt weiterhin EIN Export zur Zeit (`fliegt`).
  - Das Erwachen der Zelle (`_autoSettlementSpawnCell`) oder ein Bruch (`_ortWahlWartet`, leerer Export) gibt den Vorrat frei.
  - Ein fertiger Vorrat, dessen Zelle jenseits des doppelten Vorlauf-Rings hinter dem Spieler zurückbleibt, fällt.
  - Kein zweiter Weg daneben. `_dorfOffen` ist nicht berührt (das ist die Karte echt-haenger).
- **Linse** `gate:settlement` C-K5b (Familie Siedlung, Teil C neben C-K5):
  - Am Messort `dorf` (spec/profiband/haushalt.json) nach dem Auto-Dorf von Teil O läuft der Zug je Gang einen Takt, bis 20 Gänge nichts unterwegs ist und kein Export beginnt. Danach folgen 150 Gänge Ruhe.
  - Gezählt werden die Exporte je Zelle (der Same nennt sie), in Gängen, nie an der Wanduhr.
  - Urteil: ≥ 2 Zellen bereiten sich vor, jede mit ≤ 1 Export; in der Ruhe 0 Exporte und kein Foundry-Auftrag offen.
  - **Selbsttest:** EIN Vorrat zur Zeit (jeder neue verdrängt die übrigen, das alte Überspringen) muss ROT werden, mit den Zellen beim Namen.
  - Dazu nimmt C-K5 die Map (`_dorfVorraete`).
- **Decke** gegen origin/integ-zug: scripts −2, Prüf −2 (Spiel +195). Bezahlt mit:
  - 19 Melde-Feldern reiner Existenz im Playtest samt ihren `check`s (Gebot 5: Konsum statt Existenz).
  - 15 Existenz-Hüllen um Stamm-Methoden.
  - 12 toten Bezeichnern (eslint no-unused-vars) und zwei datierten Chronik-Wendungen.

**Gemessen**
- **Linse:**

  | | Exporte je Zelle | Ruhe | offen |
  |---|---|---|---|
  | alter Stamm 01ba2bf3 | −3,−5: 5 | 4 + 4 | 1 → ROT |
  | neuer Stamm | −3,−5 / −5,−3 / −3,−3: je 1 | 0 | 0 → GRÜN |
  | Selbsttest | −3,−5: 29, −5,−3: 28 | | ROT beim Namen |

- **GTX Dorf −4,−4 Ego, 8 Uhr, Dorf-Zug an** (`lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei`). A = 01ba2bf3, B = vorrat-pingpong (Stamm = Kopf), Werkbank aus B, Folge A1 B1 A2 B2:

  | Boot | fps | CPU-Takt p50 / **p95** | Belegung p95 | außer Takt p95 | `--ruhe 300` | Dreiecke |
  |---|---|---|---|---|---|---|
  | A1 | 75,7 | 5,2 / **9,6** | 13,22 | 1,38 | nie ruhig, 300,1 s, foundry 1 | 438k |
  | B1 | 75,1 | 5,1 / **6,7** | 9,62 | 0,98 | **ruhig nach 3 s**, foundry 0 | 424k |
  | A2 | 69,8 | 8,0 / **13,7** | 17,35 | 2,73 | nie ruhig, foundry 1 | 440k |
  | B2 | 61,3 | 7,5 / **12,8** | 17,20 | 2,29 | **ruhig nach 3 s**, foundry 0 | 424k |

  - Das zweite Paar lief unter Fremdlast. Ab 17:45 bereitete ein CI-Job „echt“ auf dem Runner seinen Lauf vor (Runner.Worker seit 17:45:51, ohne Schloss im Vorlauf); beide Seiten sind gehoben.
  - B ist in beiden Paaren besser. Die Ruhe entscheidet 2/2 gegen 2/2.
  - Die Szene fällt auf den Stand vor siedlung-k5 zurück (424k gegen 421k an e3dd2b67).
- **Prüfungen:** `npm run check` EXIT 0, `playtest:fast` 21 ✅ 0 ❌.

**Offen**
- CI des Kopfs da6203ef ist zu lesen.
- Das ABAB am integ-Kopf mit echt-haenger + vorrat-pingpong kommt mit n = 4 an Wiese und Genesis (gpu-bank) plus Dorf.
- Lehre für die Station: Eine Mess-Serie wartet nur auf die Vorfahrt der CI am Schloss, nicht auf ihren Vorlauf (Checkout, Abhängigkeiten). Das trifft die Karte abab-stufe.

Roh: OMEN `p3/n2210/vp/`, `p3/n2210/kb/settlement-*.out`; hier `bericht/2210-vorrat-pingpong/`.

**Status ZWISCHENSTAND + Übergabe:**
- vorrat-pingpong da6203ef ist gepusht.
- Am Dorf steht die Welt wieder, CPU-Takt p95 9,6 → 6,7 im sauberen Paar.
