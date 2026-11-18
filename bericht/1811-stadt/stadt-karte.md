# Stadt-Karte — vom EINEN Samen bis zum Schirm, gelesen gegen Gebot 7 (gelesen am d3ddb51c)

Gelesen: fachwerk-core.js (SIEDLUNG, Rang, STADT_FUNKTION, viertelWort, GROESSE_*), stamm/siedlung-ort.js (Wirt, Takt, Konstanten),
stamm/dienst.js (WELT_MARCH, Satz-Horizont), stamm/studio-bruecke.js (Fern-Hülle), stamm/siedlung-bewohner.js, stamm/siedlung-bauten.js,
stamm/dirigent-kern.js (Licht), stamm/feld-leben.js + stamm/feld-dsl.js (Wort, DSL), spec/profiband/haushalt.json, Zweig w28-stadt-netz
(Commit-Texte, Symbole), koordination vision/blatt/16-stadt.md, bericht/1115-stadt-gross, LAGE.md, Mess-Dateien der Karte 2.
Gemessen (CPU, Laptop, Node, je ein Lauf, kalt, unter fremder Last): exportSettlement + ortPlan je Größe, viertelWort bis 10⁶, das
Rang-Netz der Saat `anazh-realm-seed` 20,5 × 20,5 km. NICHT gemessen: GPU, Spiel, CPU-Profil je Station. Ungelesen: vision/blatt/15-menge.md,
die Quelle der Probe `stadtFormSeite`, die Lage des Genesis-Orts der Standard-Welt (unten: Ursprung angenommen).

## 0 Die frische Zahl (Koordinator, OMEN GTX 1060, main d3ddb51c, Messort stadt-voll, bericht/1711-haus-stoff, 18.11.)
326 Häuser im Plan (309 + 17, Radius 401 m), 326 mit Bild, 192 im Satz am Markt, Rest Fernform · 1 211 Leiber (1 097 draußen) · Frame
p50 16,68 · p95 33,31 · p99 41,67 ms · GPU 11,8 ms · CPU-Takt p95 28,73 ms · VRAM 176 MB · 345 Befehle · 524 433 Dreiecke · 1 149 Bau-Gruppen.
Die 1 641 trug eine andere Bühne: das Wort „dorf 7 4750“ von Hand, 3 × 3 Kacheln wach (Abgabe a16016c4fe; dieselbe Bühne 1 829 Häuser,
stamm/dienst.js:726) — kein Messort in spec/profiband/haushalt.json (stadt = „dorf 7 120“ :295, stadt-voll = „dorf 7 300“ :332).
Urteil: GPU 11,8 ms gegen CPU p95 28,7 ms — die Stadt ist bei 326 Häusern am Prozessor gebunden, nicht an Karte oder Liste.

## 1 Die Kette, Station für Station (N = Häuser)
| Station | Datei:Zeile | wächst mit | Größe/Decke |
|---|---|---|---|
| Rang-Netz der Welt | fachwerk-core.js:3410–3426, :3477–3549 | Funktion (Hash je Zelle, Memo je Saat) | Stufe 2 = Raster 16 × 16 Zellen (4 km), Pareto 96…500 |
| Größe | fachwerk-core.js:3448–3455 | Funktion | `Math.min(GROESSE_WAND, …)` — kein Ort der Welt über 500 |
| Stadt über der Wand | fachwerk-core.js:3561–3602 | Funktion, O(1) je Viertel | 10⁶ Häuser: 22 Ringe, 2 025 Viertel, 46 km, alle Worte 34 ms (gemessen) |
| Plan DORF + Export | fachwerk-core.js:3888, :9241 | Liste je Viertel, superlinear | 36 · 90 · 220 · 500 Häuser: 0,54 · 1,03 · 4,05 · 10,8 s; 93 · 201 · 463 · 885 KB (1,8–2,5 KB je Haus) |
| ortPlan (Gelände flach) | fachwerk-core.js:9770 | Liste | 81 · 55 · 90 · 221 ms (500 → 490 Lose) |
| Gedächtnis des Worts | stamm/siedlung-ort.js:1218–1284 | EIN Eintrag je Stadt (`stadt`) | Funktion — gut |
| Städte / Viertel | stamm/siedlung-ort.js:1430–1509 | Liste der Gedächtnisse (Memo) | O(Städte) je Frage, nie O(N) |
| Zell-Info | stamm/siedlung-ort.js:1385–1417 | Funktion | — |
| Erwachen / Zug | stamm/siedlung-ort.js:2674–2803, :3556–3581 | Liste je Viertel | EIN Export zur Zeit (:2705, :2760); perTick 2, taktMs 8; 130 Häuser 37–41 s (b0f25c2db4) |
| Bestand `state.architectures` | stamm/gelaende-kollision.js:709–735 | EIN Eintrag je Haus, Laterne | Gitter für Kollision (Funktion des Orts), Verzeichnis „licht“ als Liste |
| Mesh-Zone | stamm/dirigent-regler.js:2119 | Fläche × Dichte | 150 m |
| Satz (Welt-March) | stamm/dienst.js:725–748, :2301–2323 | EIN Satz + EIN Feld je Haus bis „Kilometer“ | Kapseln 8 192, Felder 4 096 |
| Fern-Hülle | stamm/studio-bruecke.js:3011–3029 | 3,3 Teile je Haus (vorher 9,2) | 8 192 / 3,3 ≈ 2 480 Häuser im Horizont |
| Pixel-Horizont | stamm/dienst.js:742–746 | Funktion des Schirms | `pxJeM · √(Ansicht/16)`; Laterne, Leib ~170 m |
| Ferne jenseits der wachen Zellen | — | NICHTS | kein Bild der Stadt; grep „skyline|fern-stadt“ in stamm: 0 Treffer |
| Leiber | stamm/siedlung-bewohner.js:1550–1700, :3885–3918 | Liste je Siedlung in 325 m (nearM 260 × 1,25, :1585) | stadt-voll 1 211 Leiber = 3,7 je Haus |
| Wege-Karte | stamm/siedlung-wege.js:2249–2262 | Fenster am Auge 512 / 2 048 m | Funktion — gut |
| Wegenetz der Welt | stamm/siedlung-ort.js:3505–3516 | Paare von Orten | Feldweg ≤ 720 m |
| Licht-Verzeichnis | stamm/dirigent-kern.js:1763–1790 | JEDE Quelle „licht“ der Welt je Bild | LICHT_POOL 4 Plätze (stamm/stoff-material.js:3770), die Suche aber linear |

## 2 Die Decken auf dem Weg 1 641 → 10⁴ → 10⁵ → 10⁶
1. ABSENZ zuerst (heute): jenseits der wachen Zellen (nearM 260 + vorlaufM 160, stamm/siedlung-ort.js:3557–3561) trägt main von der Stadt
   kein Pixel. Bei 10⁴ (25 Viertel, 5,1 km) stehen 3 × 3, der Rest fehlt; bei 10⁶ fehlen 2 016 von 2 025.
2. Kapsel-Liste 8 192 (stamm/dienst.js:2306): 3 × 3 Kacheln 6 779, 14 Kacheln füllen sie (a16016c4fe); voll heißt warten, der Fernste weicht
   (stamm/dienst.js:732–741) — die Ferne verschwindet still in der Reihenfolge des Abstands.
3. Feld-Liste 4 096 (stamm/dienst.js:2302): stadt-voll 4 089 von 4 096 (koordination LAGE.md:417) — Haus, Laterne und Glieder der Leiber teilen sie.
4. Zeit je Viertel: Export 10,8 s CPU für 500 Häuser (gemessen), dazu der Zug ~3,3 Häuser/s → ein volles Viertel ~2,5 min; der Schritt
   1 024 m (fachwerk-core.js:3556) ist im Gehen (4 m/s) 256 s, im Fahren (50 km/h) 74 s — im Fahren reißt es.
5. Wand 500 (fachwerk-core.js:3430): je Plan; die Welt selbst trägt nie mehr (fachwerk-core.js:3454) — über 500 nur das Wort.
6. CPU-Takt: bei 326 Häusern p95 28,7 ms (Abschnitt 0) — reißt vor jeder Liste, sobald Leiber mitwachsen.

## 3 Der CPU-Takt je Bild (Stationen, ohne Profil — Anteile UNGEMESSEN)
- Leiber: `_tickBewohner` je Bild (stamm/dirigent-takt.js:1702) geht je Siedlung in 325 m jeden wachen Kopf (stamm/siedlung-bewohner.js:1669),
  Ausweichen, Ankunft, Plan (gestaffelt, :1644: vor der Staffel 6,3 ms Spitze an 1 094 Köpfen), Wagen im Raster (:1630). WÄCHST mit den Leibern,
  also mit N × Leute je Haus. Der Kandidat Nr. 1 für 28,7 ms.
- Stufen der Bauten: `_tickArchitectureLOD` (stamm/siedlung-bauten.js:139) geht nur die WACHEN Einträge (:162–170) — wächst mit Bewegung, nicht mit N.
- Bau-Gruppen: 1 149 Gruppen, je Leaf eine InstancedMesh (stamm/siedlung-instanz.js:452–490), Bau-Satz bündelt (stamm/siedlung-satz.js:9);
  die Szenen-Traversal des Renderers wächst mit der Zahl der Gruppen (Haus-Arten × Leaves), nicht mit Instanzen.
- Licht: `_leuchtQuellen` (stamm/dirigent-kern.js:1777) geht JEDE Quelle „licht“ der Welt je Bild — linear in Laternen (500 Häuser → 597).
- Leib-Felder: `_weltLeibTakt` (stamm/dienst.js:808) — Glieder der Menschen im Feld, wächst mit Leibern im 170-m-Horizont.
- Bestands-Schleifen O(N) außerhalb des Bilds: stamm/siedlung-satz.js:959 (am Tageswechsel), stamm/kreatur-leben.js:1504 (Suche nach Stoff).

## 4 Der Spieler
- Die Standard-Saat (`anazh-realm-seed`, Rückfall stamm/siedlung-ort.js:1391) trägt auf 20,5 × 20,5 km 40 Städte, 33 Großstädte, 21 Metropolen,
  9 an der Wand 500 (gemessen, ohne Bau-Filter :1406, ohne Grund- und Wasser-Wahl). Vom Ursprung (angenommen = Ankunft): Stadt 35 Häuser 1,4 km,
  Großstadt 51 Häuser 1,7 km, Metropole 500 Häuser 3,0 km (Zelle −3,11). Weg: Feldwege nur zwischen Orten ≤ 720 m (stamm/siedlung-ort.js:3506) —
  ob eine Kette bis dorthin reicht: ungemessen. Eine Netz-Stadt über 500 trägt die Welt nie.
- Das Wort: `dorf [samen] [häuser] [jahr N|epoche]` (stamm/feld-leben.js:1190). „stadt/grossstadt/metropole“ sind KEINE Worte: „dorf 7 metropole“
  antwortet „Keine Epoche“ (EPOCHEN trägt sie nicht; die größte Klasse ohne Zahl ist `moderne` → stadt, 36 Häuser). Über 500 → Kern + Viertel
  (stamm/siedlung-ort.js:1219).
- Die KI: `spawn_village` (stamm/feld-dsl.js:1092) trägt keine Zahl → Stufe 0 → 8–17 Häuser (fachwerk-core.js:3450). Der Satz-Pfad gründet nie eine Stadt.
- Die große Stadt lebt an Messorten stadt (91 Häuser) und stadt-voll (295–326) — beide EIN Plan unter der Wand; die Netz-Stadt hat keinen Messort.

## 5 Karte 2
- vision/blatt/16-stadt.md L1: 1 Weiler HEUTE · 2 Marktstadt „Umfang erreicht, P nie gemessen“ · 3 Kleinstadt (1 000) bis 8 leer; L2.1 Zipf HEUTE
  (Spanne nur 6–500 Häuser); L3.1 HEUTE. L1.4 verlangt Flug mit 100 m/s, L1.5 Skyline aus 20 km — beides heute Absenz.
- `breite.siedlung#1`: UNGEMESSEN an 08a8397b (GTX), 105c9bd3 und 389a6496 (Radeon), Täter „FC.kachelNetz is not a function“.
  Befund: `kachelNetz` lebt NUR im Zweig w28-stadt-netz (fachwerk-core.js:3516 dort; f23138ba64, 16.11.), 22 Commits vor, 516 hinter main,
  nie gelandet — die Probe misst einen Kern, den main nicht trägt.
- Derselbe Zweig trägt die gemessene Ferne: 15 × 15 Kacheln (42 750 Häuser, 3,84 km) im Bild, Kapsel-Liste 3 721 von 8 192, p95 25,0 ms nach
  der Erholung des Reglers, VRAM 167 MB, 57 Befehle (koordination bericht/1115-stadt-gross/LIES.md); Satz endet bei 300 m (3266c01fe2).

## 6 Der Vorschlag
DER CHOKEPOINT: `viertelWort` → `kachelMassen` (w28-stadt-netz) als die EINE Quelle der Stadt jenseits des Nah-Rings, auf main gehoben. Jede
Kachel, die nicht wach ist, zeichnet sich aus ihrem Wort (Same, Zahl, Erbe) als Massen ihrer Blöcke an den Straßen von `kachelNetz` in EINEM
Pool-Draw; jenseits ihres Pixel-Horizonts (derselbe `_satzHorizont`, angewandt je Kachel statt je Haus) fällt die Kachel auf ihre Blöcke
(36 je Kachel, koordination erwachen/omen-2026-11-15.md:14), sodass der Pool mit Kacheln im Bild wächst, nie mit N. Ein Eintrag je Haus
(Bestand, Satz, Feld, Leib) lebt nur im Nah-Ring: Satz ≤ 300 m, Mesh ≤ 150 m.
Begründung: die Funktion ist schon gemessen (42 750 Häuser bei p95 25 ms, Liste −45 %); main misst sie nicht, die Station ist ROT am fehlenden Symbol.
Leser, die umziehen: `_viertelInfo` (stamm/siedlung-ort.js:1466) liefert die Kachel an den Ferne-Pool; `_huelleFern` und der Satz-Horizont
(stamm/dienst.js:742) gelten nur noch im Nah-Ring; die Wege-Karte nimmt die Gassen ferner Kacheln (3de2b281ee).
Listen, die fallen: Satz + Feld je Stadt-Haus jenseits 300 m; der Export eines Viertels, bevor der Spieler naht (die Massen tragen die Ferne).
In den Spieler-Pfad (kürzester Weg): die oberste Rang-Stufe der Welt öffnet ihren Schwanz über die Wand in `stadt` (fachwerk-core.js:3453–3454
und `_staedte` liest die Sieger des Rangs neben den Gedächtnissen, stamm/siedlung-ort.js:1430) — dann steht die Metropole 3,0 km vom Ursprung
als Netz-Stadt am echten Pfad; dazu ein Zahl-Argument für `spawn_village` (stamm/feld-dsl.js:1092), damit der Satz der KI eine Stadt gründet.
Was er NICHT löst: den CPU-Takt der Leiber (28,7 ms p95 bei 326 Häusern — eigener Schnitt am Leib-Takt, Abschnitt 3); die Zeit je Viertel
beim Erwachen (10,8 s Export + Zug) im Fahren; den Wechsel Massen → Häuser beim Erwachen (andere Lose, 3de2b281ee); die lineare Licht-Suche;
den Merge eines 516 Commits alten Zweigs; die Begehbarkeit innen.
