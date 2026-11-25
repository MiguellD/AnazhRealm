# Übergabe 25.11.2026, 23:10 — Konto 19 → Nachfolger

Wer übernimmt, liest dieses Blatt GANZ, dann in `LAGE.md` nur den obersten Block „KONTO 19“ (die Zeilen STAND 22:30 bis 23:05). Die Datei LAGE.md hat 880 000 Zeichen; alles darunter ist Chronik.

## 1. Stand in Zahlen

- **Karte 2: 118 von 1 718** (letzte Buchung 22:16). Beansprucht, nicht gebucht: ≈ 39.
- Heute: 108 (18:31) → 118 (22:16), zehn Sprossen in 3 h 45 min — nach 8,5 h mit elf Landungen und null Sprossen.
- main = 2da17e2e (V18.546.425), 18 Landungen heute. **main ist seit z740 (≈ 20:20) ROT** an „Die Kreatur-Linse Teil 3“, Bühne jagdkreis: Rudel-Riss-Quote 113/240 = 0,47 gegen Band 0,2–0,4.
- Budget beim Sichern: Woche ≈ 96 %, Fable 98 %; Reset 01.12. 08:00.

## 2. Die ersten drei Züge

1. **main heilen.** `git ls-remote origin refs/heads/jagd-quote` (GTX 1050; WIP 89183e6c: die Beute wittert mit derselben Fahne wie der Jäger, Quelle Mech 1966; Täter gemessen: witterung-windab hebt die Quote um ≈ 0,10). Trägt der Zweig einen Vorprüf-Kopf mit Rudel-Quote im Band: Satz schreiben, `stempel-kette.sh jagd-quote <kopf40> <satz-datei> w28-jagd-quote`. Sonst: Stand-Blatt `cloud-post/jagd-quote.md` im Zweig lesen und die Bahn zu Ende führen. Das Band bleibt wörtlich.
2. **Die sechs wartenden Köpfe landen.** Nach der Heil-Landung braucht jeder main eingemergt (neue Batterie ≈ 50 min), dann Stempel, bei Landung Anspruch (`zug/anspruch.txt`, nächster #734) und EIN gezielter Lauf bei OMEN (`drei.sh`):

| Zweig | Kopf | Sprosse | Vor dem Stempel |
|---|---|---|---|
| s0-anker | 9d7df00f | (Satz: Scratchpad satz-s0-anker.txt) | nur das geerbte Rot |
| gezeiten | 2f1c74c9 | planet.wasser.gezeiten#1/#2 | Wasser-Wand K12 am Job lesen; Anspruch erst nach grünem Hand-Lauf der echten Station |
| w2-tat-umkreis | 1db981fa | same.kopplung.aufwaerts#1 | Station an der Radeon 2 → 10 von 10 |
| tages-gesetz | 347bdb65 | mensch.menge.rhythmus#2 | Bildpaar im Zweig `cloud-post/tages-gesetz-bild/` SELBST ansehen |
| w2-gipfel-saaten | 1bd69150 | planet.kopplung.gegenwart#2 | Station fragt noch 12 statt 100 Saaten; 40-s-Kappe reißt an der GTX 1050 (≈ 46 s) |
| w2-dach-regen | WIP f84a8f19 ff. | mensch.kopplung.kultur#2 | R5 misst den Sockel selbst (Entscheid gegeben); Station S2 liest den Schneefall des Orts |

3. **Die Stations-Sprossen buchen**, die nicht am Spiel hängen: gesehen#3 (Hand-Lauf Radeon GRÜN; OMENs gezielter Lauf am 2da17e2e eingereiht 23:05 — `heute` lesen) · gegenwart#1 (Rundungs-Grenzfall der Station; Kandidat mit ungerundetem Vergleich und Deckel 60 s unter `bericht/2511-stationen/`, Schub per `pm-datei.sh`, dann OMEN).

## 3. Benannte Täter ohne Macher (Leser-Welle, je eine Macher-Bahn)

- gewalt#1: 240 Gewitter-Ticks zünden 0 Brände (`stamm/feld-brand.js` `_brandEntfachen`).
- getuemmel#1: am Markt klingen P50 6 Stimmen zugleich gegen ≥ 7.
- systeme#1: der Mond hat keine eigene Bahn, 8 Planeten liegen innerhalb 0,022°.
- bahn-klima#2: amp0 37 % gegen ≤ 10 %, amp45 0,759 gegen ≥ 2.
- kohaerenz#1: die Hydrosphäre lebt nur für den eigenen Samen.
- ereignis#2: der Welt-Zeuge hat 24 ↔ 15 Bilder statt je 30. nacht#2: kein Foto-Satz Nachtgassen.
- Ungemessen (gehaltener Probe-Kontext, Fremdlast): ausdauer#1, stimme#1, recht#1, fremde-physik#1, leib#1.
- Gesehen, unvergeben: violette Flecken auf nacktem Boden am Bau-Ort, Gras liest sich als Konfetti (Scratchpad tat/nach.png).

## 4. Cloud

Drei Sitzungen der Welle 3: w2-gipfel-saaten (abgegeben), fluss-fuellung (WIP 0b54d65d), „Knoten der Großstadt“ (verkehr#2; **Zweig dem Koordinator unbekannt, stand nie in der Wache** — der Schöpfer weist sie an, Zweig + Kopf zu nennen). Sie arbeitete in swiftshader: richtig für Mechanik, falsch für Bild und Zeit. Der schnelle Weg bleibt: Kopf mit `[gpu-probe: gate:…]` (Tore ≤ 480 s, die Radeon urteilt in ≈ 8 min) und Bild-Bitten als `cloud-post/<zweig>.md`.

## 5. Reflexion — was diese 30 Stunden gelehrt haben

**Was die Punkte brachte**

1. **Der Weg Landung → Anspruch → EIN gezielter Lauf → Buchung** (12–73 min). Jede der zehn Sprossen kam so. Die volle Runde abzuwarten brachte null.
2. **„Beansprucht, nicht gebucht“ nach dem HALTER lesen.** Ein großer Teil hängt nicht am Spiel: Rundung in der Station (gegenwart#1), ein Literal (gewalt#1), ein Deckel, ein Probe-Kontext. Ein Leser (Opus) mit Hand-Läufen der echten Station sortiert 15 Sprossen in einem Abend in GRÜN · Stations-Fehler · benannter Täter.
3. **Täter-Messung vor jedem Macher** (≤ 15 min, eine Zahl). tat-umkreis: 0 Taten, Ursache `_grundrissVon` gibt null → ein Schnitt, 2 → 10 von 10. jagd-quote: +0,10 an einer Landung.
4. **Richter-Entscheide in EINER Nachricht mit Grund**, sobald der Macher anhält (K12, R5, gegenwart, „die Beute wittert“). Die Macher halten richtig an; die Antwort darf keine Stunde kosten.
5. **Äußere Quelle mit Zahl wird Band** (Mech 1966, Li 2021, Jennings 2018, Benítez-López 2010): die Gesetze bekamen echte Zahlen, die Linsen echte Sollwerte.
6. **Ereignisse statt Hüten:** `cloud-wache.sh` (Ankunft + merge-tree + probe-tag in einem), `stempel-kette.sh` (CI-Warten → Stempel ohne Token), zwei Zahlen am Anfang jedes Turns.
7. **Opus baut, Fable entscheidet** — jeder Agent-Ruf mit `model` und `effort`.

**Was es gekostet hat**

1. **Das Punkte-Loch:** 8,5 h zählte ich Landungen statt Buchungen.
2. **Das Bündel-Rot:** zwei einzeln grüne Köpfe machten main rot; ich las es 75 min später. Folge: sechs Köpfe stehen, kein Stempel seit 22:04. Der größte Verlust des Abends.
3. **62 min Stempel-Stillstand**, weil meine Regel „Probe skipped“ als GRÜN las und ich `zug-nie-leer.wartet` nicht sofort las.
4. **Zwei Macher erbten Fable** (2 h 55 min, 398 Rufe) — der Grund, warum Fable eine Stunde vor der Woche endete.
5. **Werkzeug und Stations-Kandidaten lebten nur im Scratchpad.**
6. **Cloud ohne Rückweg:** eine Sitzung ohne Zweig in der Wache ist unsichtbar.

**Was der Nachfolger anders BAUT (nicht: beachtet)**

- Der Landungs-Warter liest nach jeder Landung die Batterie am neuen main und nennt das Rot beim Namen — oder besser: der Zug urteilt das Bündel.
- `zug.sh probe-tag` kennt die Regel des Zugs (Spiel-Zweig ohne Ruf = ROT).
- Der Leser als feste Bahn: jede Nacht die beanspruchten Sprossen per Hand-Lauf nach Halter sortieren.
- Jede Cloud-Sitzung trägt ihren Zweig-Namen im Brief, und der steht ab der ersten Minute in der Wache.
- LAGE-Zeilen mit `lage-zeile.cjs` (eine Text-Datei, ein Ruf), nie wieder ein Skript je Nachtrag.

## 6. Werkzeug und Orte

- Dauerhaft: `bericht/2511-werkzeug/` (cloud-wache.sh, stempel-kette.sh, gruen-warte.sh, lage-zeile.cjs, lage-block.cjs, pm-datei.sh, stempel.sh, stempel-msg.sh), älter `bericht/2411-werkzeug/` und `bericht/2111-werkzeug/`; Stations-Kandidaten `bericht/2511-stationen/`.
- Am Laptop, solange das Scratchpad lebt: A = `…/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad`, N = `…/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad` (satz-*.txt, anspruch-hand/, tat/).
- Bäume der Arbeiter: AnazhRealm-front-pl, AnazhRealm-gezeiten, AnazhRealm-leben. Nicht anfassen: `.claude/worktrees/koordination`, der pm-Baum des Dienstes.
- Die Dienst-Schleifen (Zug, Runde, buche) laufen weiter; eine grüne Kette landet ohne Token.
