# Abgabe-Blatt Welle `los-huelle` — ZWISCHENSTAND (OMEN GTX 1060, 19.11.)

**Kopf nach den GPU-Toren:** `los-huelle` **cd6daea07** (Merge main dabd69bb ohne Konflikt, `windowSash` byte-gleich md5 9e4ce40e, Goldens unberührt). Kette: ba77e188c → dc180bd81 (Marken an 12/12 Bau-Stellen, `oeffnungsZensus` 21/21 Öffnungs-Klassen · 37 Klassen · 218 Mass-Bauten) → 4e4580135 (Labor-Zwilling gefallen) → cd6daea07. Ich stempele nicht.

**Zahl für die Abgabe:** Brandwand-Paare 120 → 139, 0 Körper im Körper.

## GPU-Seite am cd6daea07 (ein Bündel, 10:28–10:53, Roh: p3/n1911/los-huelle/tore-cd6daea0/)

| Wand | Urteil | Zahl |
|---|---|---|
| gate:welt-boot | GRÜN | Exit 0, 10:28:29–10:29:58 |
| gate:studio-begehen | GRÜN | Exit 0, –10:32:15 |
| gate:settlement (ganz, mit Teil O) | GRÜN | 153 ✅ · 0 ❌, –10:37:27 |
| gate:haus-welt | **ROT — ABSTURZ, nicht nachgefahren** | Exit 2 nach 16 min, Teil 1/2; Teil 2/2 lief dadurch NICHT |

**Täter gate:haus-welt, soweit die Stall-Akte ihn nennt:** Seite #3 (Teil 1/2), `evaluate(proben)` kehrt 900,0 s nicht zurück → `Runtime.callFunctionOn timed out`. Urteil der Akte: „AWAIT — der Haupt-Thread lebt (Puls vor 0,9 s), ein Versprechen der Seite kehrt nie zurück; zuletzt kein Stempel“; Welt 3405 Takte, Renderer 4 % CPU, GPU 1 % — keine Last-Röte. Konsole derselben Seite: „BEWOHNER: der Ort −44,2/−44,7 … erreicht keinen Weg frei“ (Serie), „ORT: der Plan ‚Villaalto‘ findet binnen 128 m um −129/−94 keinen Ort, der jedes Haus trocken trägt“. **Nicht bewiesen:** ob die Welle der Täter ist — an main dabd69bb habe ich das Tor nicht gefahren, die Welle fasst `scripts/diag-haus-welt.cjs` nicht an. Welche Probe in `proben` wartet, nennt die Akte nicht (kein Stempel).

## Bilder (koordination bericht/1911-los-huelle/, a0c247d64 + 28c172824)

- Sieben b-Paare alt f68dbf09 ↔ neu: b01a, b01b, b02, b07, b09, b10, b15.
- Haus-Paare (Pose folgt dem Haus per Same): g1a/b/c Same 397058, g2a/b/c Same 74231, g0 Gang Hauptstraße.
- Ankunft: a0 Genesis, **Start-Dorf-Paar a1 (Augenhöhe 55 m vor der Mitte) + a2 (45 m oben)** alt dabd69bb ↔ neu cd6daea07.
- **Der EINE gpu-probe-Ort für den Stempel: Stadt-Gasse** am Haus Same 74231 (Pose g2a: 5 m vor der Tür-Wand, 2 m neben ihrer Mitte, Augenhöhe; Gang g2c). Dort zeigt die Welle sich im Bild; am Genesis-Ort zeigt sie nichts (siehe Befund).

## Soll ↔ Ist

Gehalten:
- Gassen-Gänge frei 31/31 · 25/25 · 24/24 Punkte, alt wie neu; kleinste Gasse 4,49 → 4,96 m.
- Lose = stehende Häuser je Kachel (9/9 Kacheln, Welt-Seite). Node-Nachrechnung auf dem Gelände trifft die Welt je Same 0,00 m.
- Labor ↔ Welt 0 · 0 an 7/18, 7/60, 7/4750 (der Labor-Zwilling fiel: worlds/fachwerk/fachwerk.js:226 und :756 lesen `FC.koerperHuelle`, zweite Box :232 entfernt).
- Laternen 3 × 3: Wand 952 → 939, Mast 962 → 972, Summe **1 914 → 1 911**; 0 von 5 146 m Gasse dunkel.
- Mutanten ROT: lm2 5/5 · lm3 5/5 · rm1 6/6 · rm2 4/4; Linsen-Mutant ×8.

Gefallene Zeilen, beim Namen:
- **„≤ 120“ überlappende Grundrisse** — fiel mit Grund: 120 ↔ 139 sind Brandwand-Berührungen (Schrumpf 0,01 m → 0 ↔ 0; Plan-Seite 126 → 154, Tiefe ≤ 0,019 m), jedes Paar in grundriss-klasse.log.
- **„165 von 165 am alten Ort“** — fiel: Mitte 165 → 165 Häuser, aber nicht am alten Ort (Lose rücken); Kacheln 3,2 165→171 · 2,1 170→171 · 4,1 121→125 · 3,0 174→173 · 2,2 149→154 · 4,2 154→156 · 2,0 140→141 · 4,0 160→153; Plan eben +5 (1472 → 1477, fachwerk-core.js:5600/:10195).
- **S2 an vier Heimat-Häusern** — fällt: W/D gleich 15/17 an heimat 0,−5 und 12/14 an heimat 3,−6 (Stempel anders `W`: 2 + 2), sonst je Dorf n/n; Typ + Rolle überall gleich (vergleich-2.log „S2/S3 main ↔ neu“). Ort ≤ 0,01 m dort 2–9 je Dorf, Versatz Median 0,02–1,26 m, max 134,59 m (heimat 4,−7, dort 24 → 23 Häuser).
- **Tür-Mutant ×4 vakuös** (vakuoese-zeilen.md): meine Probe s4.cjs zählte „Tür an der Gasse 0/174“ auf beiden Seiten (Stufe 0,4 m gegen Sockel 0,55 m); geheilt über `tuer.y` + 0,05 → 174/174. gate:settlement Teil A an main: keine vakuöse Zeile.
- **rm2 Grundfall b** unmutiert rot unter Last („Warter: behalten 12, Soll 5–11“) — Ursache ungemessen, Punkt 4 des Schneiders.

Befunde:
- **Genesis 0 ↔ 0 Häuser im Kegel** — Gesetz, kein Mangel der Welle: das Start-Dorf (`start`, Same 4014218534, 190 m vom Genesis-Ort) liegt bewusst außerhalb des Ankunfts-Kegels.
- **Das 18. Haus am `start`:** Los #8, Same 680407, haus_schwarzwald, Rolle Scheune, hinter seinem Hof Los #7 Same 724672 (fachwerk-core.js:5671–5694). An main fallen alle 5 Stände an der Wand-Probe, am Kopf rückt der Hof 4,4 m und der erste Stand hält → 17 → 18 Häuser, im Kegel 13 von 17 → 15 von 18. Gemeinsame 17: Median 0,39 m, Max 85,40 m (Same 431794 skandinavisch wandert aus der Vorstadt 74,0/−0,6 in die Mauer −5,5/−31,6).
- Welt-Name: Zufalls-Slug je frischer Welt (stamm/speicher-welten.js:155–158), nicht an die Hülle gebunden.

## Die 44 Stationen der Karte 2 mit Pose an einer Siedlung (EINMAL nach der Landung neu messen; stationen-karte2.md)

mensch.bau.{bedarf, huelle, innen, bauen} · mensch.fahrzeug.{gestalt, maschine} · mensch.geist.{tag, gespraech, netz, generationen, absicht, innenleben} · mensch.leib.{verschieden, gesicht, tracht, stoff, ausdruck, spur} · mensch.macht.{grenze, wehrbau, stand, krieg, megastadt} · mensch.menge.{bild, seuche} · mensch.nahrung.{flur, erdbau} · mensch.netz.{gestalt, verkehr} · mensch.stadt.{groesse, form, breite, habitat, messlatte} · mensch.wirtschaft.{stoffstrom, markt, technik, energie} · mensch.zeit.{erleben, erde} · mensch.zukunft.{technik, medien, maschinenwesen, leib}

## Ehrlich offen

1. gate:haus-welt ROT (Absturz, Täter nicht bewiesen, Teil 2/2 ungefahren) — dein Urteil.
2. +11 Häuser und die Laternen-Verschiebung auf echtem Gelände je Kachel OHNE Ursache je Kachel (nur die Summe und der Plan-Grund +5 sind erklärt).
3. Haus Same 431794 wandert 85,40 m — die Ursache ist auf ebenem Grund nur eine Deutung.
4. Heimat −1,−5: 1/21 wie main.
5. Bäume auf Siedlungs-Grund am Wald-Stand (Täter Lichtmesser/Wald, nicht diese Welle).
6. `npm run check` ganz am Kopf habe ich NICHT gefahren; am Kopf grün gefahren: gate:settlement Selbsttest + Teil A, fachwerk-contract, haus-fern, check:statik, studio-vertrag.
