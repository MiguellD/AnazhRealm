# 2210 radeon-beweise — drei Radeon-Messungen am Kopf integ-probe

**Gerät:** Radeon 890M (`[linse-gpu] amd/rdna-3`), echtes Fenster 1920×1080, rAF-Loop, CDP-Eingabe, GPU-Schloss je Lauf.
**Kopf:** gemessen an f3865c80 (V18.546.61) und e86600bd (V18.546.62). Zwischen beiden ändert sich im Spiel nur die
VERSION (`git diff f3865c80 e86600bd -- stamm *.js`: 1 Zeile `stamm/dirigent-kern.js`), die Zahlen gelten also für beide.
**fps an der Mess-Wiese in derselben Sitzung:** Bild-Median 8,9–16,2 ms (62–112 fps), über der Schwelle von 40 fps.
**Rohdaten:** Ordner `bericht/2210-radeon-beweise/` (Skripte unter `skripte/`).

## speicher.K1 — Tab-Tod auf dem Pfad des Spielers: Urteil 1 (vorher 0)
- **Staffel 1:** an einem Gerät ist der Stand ≤ 10 s alt, 0 korrupt, 0 halbe Welten.
- **Messung:** `skripte/echt-k1.cjs 20 kopf3`.
  - Host :7904 ist ein Statik-Server ohne save-server, also `isSaveServerHost` false.
  - W bleibt gedrückt (CDP). Alle 1,5 s ein Graben (`carveVoxelSphere`) und ein Fels-Block, wo das Setzen des Spielers ihn trägt (`_setzUrteil`, ohne Material).
  - 20 harte Tode per `taskkill /F /T`, danach Neustart mit demselben Profil:
    - 10 am Schreib-Haken: 4 mitten im IDB-put (die Transaktion kommt nie an), 3 nach `complete`, 3 nach `localStorage.setItem`;
    - 10 zu zufälliger Zeit (6–18 s).
- **Zahl:**
  - Alter des Stands: max **1,58 s** (IDB-put 1,47–1,51 · Platz 1,47–1,58 · fest 0–0,003 · zufällig 0–0,73).
  - **0 korrupt, 0 halbe Welten, 0 über 10 s.** Welt-ID 20/20 gleich.
  - Am Ende stehen 75 Blöcke und 141 Edits.
  - Das Beweisbild `echt-k1-kopf3.png` (Third, Ausgabe-Pfad) zeigt den Spieler im neu geladenen Stand, mit Graben-Rand neben ihm. Die Blöcke stehen 6 m rechts, außerhalb des Bildes.
- **Befund zum Skript des Machers:** Lauf 1 (`echt-k1-kopf.json`) zeigte 11 von 20 „halben Welten“.
  - Ursache: die Blöcke kamen über `spawnArchitecture` an der Natur-Wand vorbei.
  - Fels-Blöcke auf der Genesis-Lichtung und auf Dorfwegen räumt das Laden („Grundriss: 4 Natur-Stücke … geräumt“, `k1-log-log-z1.txt`, `_grundrissRaeumen`).
  - Das Setzen des Spielers lehnt dort ab (`_setzUrteil` → `natur`/`weg`). Ab Lauf 3 baut das Skript nur, wo der Spieler bauen kann.
  - Ein zweiter Mess-Fehler ist geheilt: `Number(null) <= 10` zählte ein fehlendes Alter als gültig.
- **Für die 2 fehlt:** die GTX.

## speicher.K2 — Speichern kostet keinen Frame: Urteil 1 (vorher 0 nach R6)
- **Staffel 1:** ≤ 0,3 ms je Bild (p95) in frischer Welt, auf dem Pfad des Spielers.
- **Messung:** derselbe Lauf. Eine Hülle um `saveState` misst die Haupt-Faden-ms, ein rAF-Zähler die Bilder.
- **Zahl:**
  - je Bild p95 **0**, p99 0,1, Mittel 0,107 ms (24 640 Bilder, 413 Rufe);
  - je Ruf p50 8,7, p95 14,4, max **19,3 ms**.
- **Für die 2 fehlt:**
  - ein Ruf über 16,7 ms ist selbst ein Hänger;
  - 2 h mit 10 000 Edits und die GTX sind ungemessen.

## leib.K1 — Taste bis Bild, Radeon-Hälfte von Staffel 2: alle fünf Verben im Soll, Urteil bleibt 1
- **Staffel 2:** jedes Verb, beide Geräte, p95 ≤ 50 ms.
- **Messung:** `werkbank latenz --proben 50 --sicht ego,third --verb gehen,wechsel,springen,einsteigen,hieb`, in EINEM Ruf, Wiese, Kopf e86600bd plus der Schnitt unten.
- **Zahl, p95 Ego/Third:**
  - gehen 42,5 / 35,7
  - wechsel 25,8 / 23,6
  - springen 31,2 / 27,0
  - einsteigen 27,6 / 25,6 (der GT ist gezeichnet, die Linse bricht sonst laut)
  - hieb 22,7 / 30,7 ms
  - 0 von 500 Proben fehlen. Roh: `latenz-schnitt-voll.json`.
- **Gegenprobe:** gehen allein, frische Sitzung: Ego 42,9/42,2, Third 43,4/43,9 (`gehen-2.txt`, `gehen-3.txt`).
- **Warum die 1 bleibt:** an der GTX fehlt der Hieb, also schwingen. Gemessen sind dort gehen, wechsel, springen und einsteigen (`bericht/2110-gtx-messschuld-3.md`).
- **Werkzeug-Bruch, geschnitten** (Zweig `radeon-beweise` 60d189a9):
  - Am Kopf blieben der GT und das Tier samt Klinge in jeder folgenden Probe stehen.
  - Im vollen Ruf fehlten deshalb third/einsteigen 50/50 und third/hieb 11/50. Der Hieb traf den Wagen (`abbau`, p95 588 ms; `latenz-kopf-voll.json`).
  - Nach dem Schnitt fällt die Bühne beim Verbwechsel: 0 von 500 fehlen.
- **Offen, halten.K2:** der Hit-Stop im Ego-Hieb zählt am Kopf 1 Bild (Third 9). Das war schon vor dem Schnitt so, das Urteil der Linse steht deshalb ROT.

## gelaende.K5 — die Boden-Höhe je Rolle, Radeon-Hälfte am Kopf: Urteil 2 → 1
- **Staffel 2:** alle Rollen an Mess-Wiese und 25°-Hang ≤ 3 cm, Feinform ≤ 5 cm, beide Geräte.
- **Messung:** `diag-koerper-stand --k8` mit gesetzter Sicht (`k8-sicht.diff`, Mess-Kopien `skripte/diag-k8-*.cjs`), je EXIT=0.
- **Zahl, Ego (Third gleich bis auf den Fuß):**

  | Ort | fein | streu | huf | rad |
  |---|---|---|---|---|
  | Wiese | 1,1 | 0,5 | 2,1 | 0,2 |
  | Hang 24,4° | 4,3 | 2,7 | **3,2** | 2,4 |

- **Urteil:** der Huf am Hang reißt 3 cm in beiden Sichten.
  - Die Linse ist seit k8-huf strenger: je Größen-Band misst sie das schlechteste Tier, hier den Gigant.
  - Die alte 2 stand auf der milderen Messung.
  - Die Streu am Hang stieg von 0,8 auf 2,7 cm.
- **Staffel 1 hält:** das Rad auf der Wiese, 0,2 cm in beiden Sichten.
- **Roh:** `k8-ego.log`, `k8-third.log`, `k8-*.json`.

**Punkte:** speicher.K1 0 → 1, speicher.K2 0 → 1, gelaende.K5 2 → 1, leib.K1 hält 1, macht **+1**.
