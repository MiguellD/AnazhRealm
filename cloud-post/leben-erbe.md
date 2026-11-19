# leben-erbe — Leben-Kern Stufe 3 EPOCHE · Stufe 4 STAND (ZWISCHENSTAND)

Der Spieler sieht von dieser Stufe nichts, bis der Leser sie konsumiert: kein Leser der Seite ruft heute `_gauBis` oder
`_gauGeht` (stamm/kreatur-erbe.js:272, :307), die Epoche und der Stand leben im Gau-Faden und in der Stand-Datei und sind
headless gemessen — nie im echten Spiel gesehen.

**Kopf:** `8b41530fe972ab658e00d19dc4101d9fd01058d4` (Zweig `leben-erbe`, gelesen mit `git ls-remote`; Basis 8d6e5a9f). Die
Zahlen unten sind der Linsen-Lauf an diesem Kopf (`node scripts/diag-kreatur-leben.cjs --gau`, Wolke: Intel Xeon @ 2,30 GHz,
4 logische Kerne), wo nicht anders genannt. Exit der Linse 1: die URTEILS-WACHE zählt 4 ROTE Zeilen (G2 · Ep2 · Ep5 · St3).

## Geschnitten

- `leben-core.js:353` — die Epoche `EPOCHE = { jahre: 40 }`, nur intern; gelesen allein über `epoche(takt).takte`
  (`leben-core.js:51`, der Kopf-Kommentar).
- `leben-core.js:1304` — `EPOCHE_TAKTE` = 1050 (wirft, wenn 40 Jahre kein ganzer Takt-Schritt sind); `leben-core.js:1306`
  `epoche(takt)`: k = max(0, floor(t÷P) − 1), Anfang k·P; `leben-core.js:1311` die Saat je Epoche; `leben-core.js:1314`
  `gauEpoche(F, saat, takt)` = der Gau am Anfang seiner Epoche mit der Saat der Epoche; `leben-core.js:1533` beide im Bestand.
- `leben-core.js:722` — `anfang` und `gauAnfang` (`leben-core.js:1290`) an einem Takt t0: Gründer-Kennung und erster Wurf ab t0;
  t0 = 0 ist byte-gleich zur Basis (G1 · G3 · Ep5 B4-Lauf gleich).
- `voxel-worker.js:684` `gauAuftrag` — DER EINE WEG DES LAUFS (`voxel-worker.js:749`, `voxel-worker.js:762`): ein Stand (Akt,
  am Schirm über `lesen`, aus der Stand-Datei) läuft stetig; eine Funktion läuft nur im Anfang ihrer Epoche weiter, sonst neu ab
  `gauEpoche(tErst)` mit tErst = min(Auftrag, erster Akt) (`voxel-worker.js:754`). Der Satz „ein später Akt / ein unbesuchter
  Gau rechnet ab Takt 0" ist an dieser Stelle gefallen — kein Flag, kein zweiter Weg.
- `voxel-worker.js:485` — der Halt `GAU_HALT` 4; `voxel-worker.js:497` `gauVerdraengt` (mit Akten gepackt, sonst vergessen);
  `voxel-worker.js:513` `gauRaum` (der am längsten nicht am Schirm, dann der am längsten nicht gefragte); `voxel-worker.js:491`
  `gauGeht` (Auftrag `gau-geht`).
- `voxel-worker.js:555` `gauStaende` und `voxel-worker.js:575` `gauStaendeSetzen` (Aufträge `gau-staende` ·
  `gau-staende-setzen`, Weiche `voxel-worker.js:433` · `voxel-worker.js:436`): die Stände als Text der Stand-Datei; nur für die
  Welt des Fadens (`voxel-worker.js:596`).
- Die Stand-Datei-Naht an EINER Stelle, `stamm/speicher-laden.js:110`: `_gauStandImStand` (`stamm/speicher-laden.js:118`) ·
  `_gauStandHolen` (`stamm/speicher-laden.js:127`) · `_gauStandAusStand` (`stamm/speicher-laden.js:155`, gerufen in der
  Lade-Kette `stamm/speicher-laden.js:646`); die Zeile `gauStand` der Stand-Tafel `stamm/speicher-welten.js:1341`; das Holen im
  Speichern `stamm/dienst.js:1767`; die Wand-Texte `stamm/daten.js:1746` (`speicher.weist.gau` · `speicher.weist.gau-alt`).
- `spec/stamm/modul-karte.json` — die drei Namen der Naht unter „Speicher/laden"; `spec/uhr/geraetezeit.json` — die Leser der
  Gerätezeit `gauAuftrag` · `gauStaende` · `gauStaendeSetzen`.
- Die Linse, der `--gau`-Block `scripts/diag-kreatur-leben.cjs:2434` bis `scripts/diag-kreatur-leben.cjs:3005`: die Zeilen
  Ep1–Ep5 · St1–St4 (`scripts/diag-kreatur-leben.cjs:2991` bis :2999), sechs Täter-Selbsttests (Ep1 · Ep2 · Ep3 · Ep4 · St1 ·
  St3), je ROT beim Namen; die Laufzeit des Blocks `scripts/diag-kreatur-leben.cjs:3005`.

## Die Soll-Zeilen

| Zeile | Soll | Ist | Urteil |
| --- | --- | --- | --- |
| Ep1 | Gleichgewicht W1–W3 bei 100 und 1 000 Jahren, ≥ 3 Saaten | 3 Saaten, je Welt-Alter die 20 jungen Jahre seiner Epoche (Takt 2100–2625 · 26250–26775, je 5 Takte, 104 · 105 Proben): 100 J W1 3 von 3 (Wolf am Ende 61 68 66) · W2 3,83 (3,75 3,87 3,88) · W3 261 (266,9 258,4 257,8); 1 000 J W1 3 von 3 (Wolf 48 63 58) · W2 4,04 (4,01 3,98 4,13) · W3 247,7 (249,5 251,5 242,2); Bänder von B4: W2 2–8 · W3 180–390 | GRÜN |
| Ep2 | Aufholen (40–80 J) ≤ 4 s, Urteil am Gerät, langsame Kern-Klasse | das längste Aufholen 2099 Takte = 80 J: 6,95 · 7,71 · 7,67 s = 86,9 · 96,4 · 95,9 ms je Jahres-Schritt (4 Kerne; über 5 Läufe 6,59–7,71 s); an EINEM Kern (`taskset -c 1`) 7,15 · 8,59 · 7,62 s = 89,4 · 107,5 · 95,3 ms je Jahr; 11 Neustarts in 651 Aufträgen, jeder am Anfang seiner Epoche | ROT (Richtwert der Wolke; das Urteil fällt am Gerät — bei ~90 ms je Jahr müsste der langsame Kern des Geräts 1,8-mal schneller rechnen als die Wolke) |
| Ep3 | Stand bei t byte-gleich, gefragt bei t−10 · t−1000 · nie, in zwei Prozessen | Takt 2625, Saat 1: t−10 `45133be9a19f86e9` · t−1000 `45133be9a19f86e9` · nie gefragt (zweiter Prozess, 1575 Takte ab 1050) `45133be9a19f86e9`, 819 896 Bytes | GRÜN |
| Ep4 | die Naht am Grenz-Takt als ZAHL, Median · Max über ≥ 3 Saaten | Takt 2100, Funktion gegen den stetigen Lauf: Köpfe anders (Kennung) 27 888 · 28 019 von 15 069 · 15 072 · Köpfe je Revier Σ\|Δ\| 5 567 · 5 604 · Herden anders 2 198 · 2 199 von 2 198 · 2 199 (Kopfzahl anders 1 857 · 1 869) · Rudel anders 20 · 22, Rudel-Zahl 10 · 10 → 10 · 12; in der Epoche stetig (Takt 2101) dreimal wahr | GRÜN (als Zahl, ungeglättet: die Naht ersetzt jeden Kopf) |
| Ep5 | B4-Lauf gleich, Stand-Abdruck `eab4d269` | B4-Lauf gleich in beiden Booten (Wolf 27 42 43 39 53 59 67 52 56 58, Σ K 33 989); Abdruck am Takt 160 `cc6dcb55` · `cc6dcb55`, mit Akt `b952cf2a` (Soll `54670176`) | ROT am Abdruck, mit Grund: die Basis 8d6e5a9f gibt in dieser Wolke denselben `cc6dcb55` — der Abdruck ist maschinen-gebunden, die Stufe verschiebt ihn nicht; das Urteil fällt am Gerät |
| St1 | speichern → laden byte-gleich am Takt und 20 Takte später | der Stand-Gau (Saat 1, über den Grenz-Takt 2100 stetig) am Takt 2625 in der Zeile `gauStand` (2 Stand-Gaue): geladen = ungespeichert wahr · 20 Takte später wahr · 0 Takte aufgeholt | GRÜN |
| St2 | Laden bei 100 J ≤ 0,5 s ohne Aufholen | 73,2 ms (Zeile lesen, 2 Stände in den Faden, Entpacken 35 ms), 0 Takte aufgeholt (4 Kerne; über 5 Läufe 40,4–73,2 ms); an EINEM Kern 211,2 ms (Entpacken 77,8 ms); das Holen aus dem Faden 27,6 ms | GRÜN (Richtwert; das Urteil fällt am Gerät) |
| St3 | ≤ 4 Gaue im Faden, der fünfte verdrängt; Faden-Speicher bei 4 und 12 Gauen | Halt: nach 4 Gauen 4 Läufe · 4 Felder · 0 gepackt, nach 12 Gauen 4 Läufe · 4 Felder · 4 gepackte Stände 2,63 MB; wieder: Gau 1 (am Schirm) im Faden, Gau 3 (verdrängt, mit Akt) aus dem gepackten Stand (entpackt 24,7 ms, gleich), Gau 4 (Funktion) vergessen, neu ab Takt 0 (gleich). Haufen 58,2 MB → 130,5 MB (Soll ≤ 70,8), nach dem Wieder-Besuch 131,1 MB | ROT — der Halt hält, der Haufen nicht: Täter das Netz des Gelände-Kerns (`gelaende-core.js:506`, `netzZaehler` Knoten 55 551 → 154 149, gemerkt je Welt ohne Grenze); der Wieder-Besuch ohne neue Fläche +0,6 MB |
| St4 | gepackte Größe je Gau; Datei mit 1 und 4 Gauen; alter Stand lädt laut | je Gau 0,65–0,82 MB (100 J 0,82 MB); Zeile `gauStand` mit 1 Gau 1,09 MB (100 J), mit 1 · 4 · 6 Gauen 0,88 · 3,51 · 5,27 MB (Takt 1); ein alter Stand ohne Gau-Teil: der Gau mit Akten wird Funktion, WARN 1, Wände `speicher.weist.gau-alt` 1 · `speicher.weist.gau` 1 | GRÜN |

Laufzeit des `--gau`-Blocks 154,4 s (Boot 1 mit Bühne 21 s · Saaten 71,1 s · St3 17,9 s · Täter 15,7 s · Boot 2 28,5 s) —
Soll ≤ 180 s; an EINEM Kern 216,3 s. `npm run check:statik` Exit 0, `npm run playtest:fast` 21 ✅ · 0 ❌.

## Eigene Setzungen (beim Namen)

- **P = 40 Jahre = 1050 Takte** (TJ = 26,25 Takte je Jahr), der erste Sprung am Takt 2P = 2100; das Aufholen einer Funktion
  liegt damit zwischen 40 und 80 Jahren.
- **Die Saat je Epoche:** k = 0 trägt die Saat der Welt (Takt 0 bleibt byte-gleich), sonst `mix(saat ^ imul(k, 0x27d4eb2d))`.
- **tErst** = min(Auftrags-Takt, erster Akt-Takt): ein Gau mit spätem Akt beginnt am Anfang der Epoche seines ersten Akts.
- **`GAU_HALT` = 4;** verdrängt wird der am längsten nicht am Schirm (nie gelesen = 0), bei Gleichstand der am längsten nicht
  gefragte. Ein verdrängter Stand MIT Akten reist gepackt; ein Stand OHNE Akt (nur am Schirm oder aus der Datei) wird vergessen
  und ist wieder Funktion seiner Epoche.
- **Das Pack-Format v1:** u32 Kopf-Länge · JSON-Kopf · Float64 D · Int32 I; die Zeile `gauStand` = `{ v: 1, staende: [{ key,
  gx, gz, takt, text }] }`, text = Base64 der Bytes; die Zeile antwortet nur für die Welt des Fadens (Saat | Welt der Regionen).
- **Das Holen vorweg:** `saveState` holt die Stand-Gaue per `queueMicrotask` (`stamm/dienst.js:1767`) — das Holen bricht nie
  das Speichern und fällt in keinen catch eines Rufers; die Zeile liest den zuletzt geholten Stand (Marke `_gauStandGen`).
- **Die Naht in „Speicher/laden"** statt „Speicher/welten" (`stamm/speicher-welten.js` steht auf der DECKE 4000 Zeilen).
- **Ep1-Fenster:** je Welt-Alter die jungen 20 Jahre seiner Epoche (40–60 Jahre nach ihrem Anfang), W1 am Welt-Alter und am
  Ende des Fensters; bei 1 000 Jahren (genau 25P) liegt das Fenster daher bei 1 000–1 020 Jahren.
- **St3-Schranke:** Haufen nach 12 Gauen ≤ Haufen nach 4 + gepackte Bytes + 10 MB.

## Funde (Dateien, die nicht meine sind)

1. **Der Leser fehlt** (stamm/kreatur-erbe.js, Leser-Schneider): `_gauBis` hat keinen Rufer, `_gauGeht` (:272) keinen; ein Gau
   wird nur über `lesen` „am Schirm" — ohne den Leser greift die Verdrängung nur nach der Frage-Zeit. Der Kommentar
   stamm/kreatur-erbe.js:131 („ein Gau ohne Akte … wird im Faden ab Takt 0 gerechnet") ist seit D3 falsch.
2. **St3-Täter, das Netz des Gelände-Kerns** (`gelaende-core.js:506`, `netzNeu`): `NETZE` hält höchstens 6 Welten, aber
   `knoten` und `zellen` je Welt wachsen ohne Grenze mit der besuchten Fläche, ~9 MB je neuem Gau im Gau-Faden (und im
   Haupt-Faden mit dem Weg des Spielers). Der Schnitt gehört in den Kern: eine Grenze des Netzes je Fläche oder ein Freigeben
   nach dem Feld-Bau (`gauFeldBauen` würde es rufen).
3. **G2 ROT in der Wolke** (vor dieser Stufe da, Teil des Lesers): Haupt-Faden je Ruf 3,88 ms (zweites Boot 1,31 ms), Soll
   ≤ 1 ms.
4. `stamm/speicher-welten.js` steht auf genau 4000 Zeilen — die nächste Zeile dort braucht den Modul-Schnitt (Lehre 12).
5. Das Holen läuft eine Speicherung nach: im sofortigen Speichern (nicht im Takt) trägt die Zeile `gauStand` den Stand des
   vorigen Holens.
6. localStorage-Kontingent: 0,8 MB je Stand-Gau; 4 Gaue sind 3,5 MB in der Stand-Datei.
7. Ein gepackter Stand mit Akten, viel später wieder besucht, holt ohne Grenze auf (er ist Stand, keine Funktion).
8. Ein später Akt VOR dem Takt eines geladenen Stands wirft laut (der Stand kennt die Zeit vor sich nicht).
9. `performance.memory` ist im Faden null — St3 misst den Haufen über CDP (`Runtime.getHeapUsage`).
10. G5 im Teil der Linse, der nicht meiner ist, rechnet noch „ab Takt 0" je Jahres-Zahl (`O.jahre`).

## Ungemessen

- Ep2, St2 und der Ep5-Abdruck am Gerät (Radeon 890M, GTX 1060) — nur die Wolke ist gemessen.
- Das echte Spiel: die Stufe ist headless; ohne Leser (Fund 1) sieht kein Auge sie.
- Der Haupt-Faden-Speicher über eine lange Sitzung (Fund 2 dort).

## Nachmessen am Gerät (Ep2 · St2)

Die Linse am Kopf, die Zahlen als Datei (die Zeilen Ep2 und St2 tragen das Urteil):

```bash
node scripts/diag-kreatur-leben.cjs --gau --aus gau-geraet.txt
```

Gebunden an EINEN Kern der langsamen Kern-Klasse (Linux, Kern-Nummer aus `lscpu -e`):

```bash
taskset -c 7 node scripts/diag-kreatur-leben.cjs --gau --aus gau-geraet-kern.txt
```

Windows (PowerShell; die Maske wählt den Kern, 0x80 = Kern 7 — ein E-Kern bzw. der langsamste der Klasse):

```bash
cmd /c "start /affinity 0x80 /wait /b node scripts/diag-kreatur-leben.cjs --gau --aus gau-geraet-kern.txt"
```

Ep2 ist GRÜN, wenn das längste Aufholen (80 Jahre) ≤ 4 s steht; St2, wenn das Laden ≤ 500 ms bei 0 Takten Aufholen steht.
