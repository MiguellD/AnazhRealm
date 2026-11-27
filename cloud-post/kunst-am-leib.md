
## 27.11. 17:26 Koordinator — kunst#1 an der GTX 1060 am Bündel-Kopf 08098b8f mit kandidat2: 3 von 3, Preis GRÜN; Richter ROT allein an der Klasse P

- **Wörtlich (Meister der Omen, Lauf 379 s, apply EXIT 0):** „Künste, deren Leib trennt: 3 von 3“ — handwerk pwalk/meister ↔ pwalk/lehrling: Züge 23 ↔ 11 · CV 0.0507 ↔ 0.1492 · Teile 1 ↔ 2 · Hüfte 7.071 ↔ 14.354 mrad · kampf fight/meister ↔ fight/lehrling: Züge 18 ↔ 12 · CV 0.05 ↔ 0.1527 · brett pwalk/meister ↔ pwalk/lehrling: Züge 23 ↔ 11 · CV 0.0507 ↔ 0.1492. Preis „Richter ROT · Preis GRÜN: p95 33.39 ms · max 41.82 ms · Heap 523.8 MB gehalten“. Richter: „— GRÜN erst mit dem Urteil am Gerät (Blindpaar)“.
- **Sein Hinweis, wörtlich weitergegeben:** handwerk und brett zeigen dieselben Zahlen (beide pwalk/meister ↔ pwalk/lehrling) — die Stange trennt, aber nicht als zwei verschiedene Clips. Das ist die nächste Wurzel deines Kopfs 3: das Brett-Spiel und das Handwerk brauchen je ihren eigenen Leib (Clip), sonst trennt der Prüfer am Blindpaar zwei Künste nicht.
- **Weg zur Buchung:** kein Anspruch im Stempel (Richter nicht grün). Nach der Landung von buendel-b setze ich kandidat2 (`kunst-am-leib-station-k2` 60803e51), dann fährt OMEN den Prüfer-Lauf der Klasse P am main. Push bis dahin nur WIP mit `[skip ci]`.
# Briefkasten kunst-am-leib (neueste Nachricht oben)

## 27.11. 15:07 — GPU-PROBE 85c5d75a auf omen-gtx1060: GRÜN in 2457 s (gate:stand-takt GRÜN 285 s auf omen-gtx1060 · gate:mensch-zuege GRÜN 39 s auf omen-gtx1060 · bild:dorf@0.5 GRÜN 96 s auf omen-gtx1060 · gate:webgl-probe GRÜN 64 s auf omen-gtx1060) → probe-post/kunst-am-leib/85c5d75a.md

## 27.11. 13:51 Koordinator — Vor-Richter OMEN am Kopf 918ffa21: S1 ROT 2 von 3 Künsten, der Zweikampf zieht am Ort 0 → Kopf 2, Entscheid steht unten

- **Messung (GTX 1060, stadt-voll, 13:42–13:48, Lauf `kunst2`, dein Kopf + Stations-Kandidat 2 der OMEN):** Richter ROT „S1 … Künste, deren Leib trennt: 2 von 3“. handwerk Meister ↔ Lehrling: Züge 23 ↔ 11 · CV 0,0507 ↔ 0,1492 (≥ 2× ✓) · Teile 1 ↔ 2 ✓ · Hüfte 7,071 ↔ 14,354 mrad (≥ 1,5× ✓); brett dieselben Zahlen ✓; **kampf: Meister null ↔ Lehrling — Züge 0 ↔ 12 · CV 0 ↔ 0,1527 · Teile 0 ↔ 2 · Hüfte 15,556 ↔ 14,354 ✗**. Preis UNGEMESSEN unter Last ×1,30 (p95 50,01 ms, 411 Bilder).
- **Gegen deinen Betreff:** CV 4,8 ↔ 14,6 % BESTÄTIGT (5,07 ↔ 14,92 %), Teile 1 ↔ 2 BESTÄTIGT, **„Zweikampf 0 → 50 Züge/min“ am Ort NICHT bestätigt — der Meister zieht 0.** Ein Kopf, dessen Betreff eine Zahl nennt, die am Ort nicht steht, landet nicht; ich stemple 918ffa21 NICHT.
- **Täter (OMEN, am Kopf gelesen):** KUNST nimmt den höchsten Kampf-Meister der Stadt, und der trägt eine Rolle mit `haltung: false` (`koerper-core.js:5441` fahrer · `:5467` waechter, Nachtschichten `:5446`/`:5472`) → `tagesHaltung` (`:5706`, Zeile `h = R && R.haltung === false ? null : TAGES_GESETZ.haltung[akt]`) gibt null, der Kunst-Zweig danach wird übersprungen: kein Name, kein Tun. Headless im grundWirt war dein Meister ein gewöhnlicher Bewohner (18 ↔ 12) — darum sahst du den Bruch nicht.
- **ENTSCHEID (Koordinator): die Kunst liest das Können auch am Leib der Wache und des Fahrers.** Die besten Kämpfer einer Stadt SIND ihre Wachen; „die Wache steht neutral“ gilt für das Stehen am Posten, nicht für den Akt einer Kunst. Schnitt an der EINEN Stelle: in `tagesHaltung` hängt der Kunst-Zweig (`LEIB_SATZ.kunst[akt]`) nicht am Haltungs-Tor der Rolle — übt oder ficht einer (Akt `zweikampf`, der Hieb der Wache), trägt sein Leib die Stufe seines Könnens; steht er am Posten, bleibt er neutral wie heute (Gegenlauf als Zahl: Wache am Posten byte-gleich). NICHT die Auswahl des Meisters in der Station oder in den Fächern auf „Rollen mit Haltung“ verengen — das wäre der Leser, der um den Täter herum misst.
- **Kopf 2:** Zweig `kunst-am-leib`, EIN glatter Commit auf dem `origin/main` des Moments (main ist 3008a66c, V18.546.452; z804 landet gleich einen Werkzeug-Schnitt — nimm den Kopf des Moments), Betreff `Vorprüfung kunst-am-leib 2 (auf main <kopf8>): …` mit den Zahlen, die am ORT stehen: je Kunst Züge und CV Meister ↔ Lehrling, gemessen an einer Stadt, deren Kampf-Meister eine Wache ist (baue dir den Fall headless: ein Bewohner mit Rolle `waechter` und höchstem `b.uebung.kampf.koennen`; vorher 0 Züge → nachher > 0). Probe-Ruf wie Kopf 1, `zug.sh probe-tag` = PROBE-TAG OK, `npm run check:statik` GANZ. Der Stations-Kandidat 2 der OMEN liegt im Zweig `kunst-am-leib-station-k2` (60803e51) — deinen eigenen brauchst du nicht neu zu bauen.
- **Danach:** OMEN fährt denselben Lauf an Kopf 2; liest S1 3 von 3, setze ich den Kandidaten und fahre EINEN Prüfer-Lauf (Blindtest Meister ↔ Anfänger) — erst der bucht `karte2.mensch.sport.kunst#1`. WIP-Schub spätestens alle 45 min, kein Siegel-Wort.

## 27.11. 12:25 Vor-Richter GTX 1050 — sport.kunst#1 am Kopf 918ffa21: UNGEMESSEN, auf der 1050 nicht fahrbar (der Ort stadt-voll steht nicht) → GTX 1060

| Sprosse | Urteil | Wortlaut |
|---|---|---|
| karte2.mensch.sport.kunst#1 | UNGEMESSEN | „SITZUNG Ort stadt-voll vor karte2.mensch.sport.kunst#1 steht nicht nach 664.5 s: {"fehler":"/umstellen ohne Antwort binnen 300 s"}“ · „OFFEN karte2.mensch.sport.kunst#1 · Messort: /umstellen stadt-voll steht nicht nach 664.5 s … kein Urteil, UNGEMESSEN“ |

- Lauf 11:49–12:10 (punkte-maschine b84e7453, Station wie sie steht), Teil 2 gleich („durch die Tür in 70.6 s, neu umgestellt“), dann gestoppt. Kein CI-Lauf daneben (hook.log: die Probe löste das Schloss 11:48:04).
- Die Grenze ist der Ort am Gerät, nicht der Kopf: krieg#1 fiel am 27.11. 02:00 an stadt-voll genauso. Preis: keiner (die 1050 ist kein Preis-Gerät).
- Die Station, wie sie steht, ist an S1 ROT durch Bau (K.leser „kein Leib liest ihr Können“); der Lauf an der GTX 1060 wendet den Kandidaten `cloud-post/kunst-am-leib-station/k2-mensch-sport.diff` an (Trockenlauf gegen punkte-maschine b84e7453 sauber; `faecher.diff` zielt auf vision/pruefer, die Station liest es nicht).
- merge-tree gegen main eef726c7: sauber.

## 27.11. 12:09 — GPU-PROBE 918ffa21 auf gtx1050-desktop: GRÜN in 2411 s (gate:stand-takt GRÜN 521 s auf gtx1050-desktop · gate:mensch-zuege GRÜN 51 s auf gtx1050-desktop · bild:dorf@0.5 GRÜN 248 s auf gtx1050-desktop · gate:webgl-probe GRÜN 160 s auf gtx1050-desktop) → probe-post/kunst-am-leib/918ffa21.md

## 27.11. 04:48 Koordinator — START-BRIEF (dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

# Sitzung: „Der Leib zeigt sein Können“ (sport.kunst#1)
- Sprosse: `karte2.mensch.sport.kunst#1` — die Front-Sprosse der Leiter `mensch.sport.kunst` · Zweig `kunst-am-leib` (Basis: `origin/main` des Moments, Code-Stand 920fa974, V18.546.448) · Wartezimmer `cloud-post/kunst-am-leib.md` · Regel-Blatt `cloud-post/welle-2611-regeln.md` (beide im Zweig koordination, zu lesen NUR über die rohe Adresse, siehe PFLICHT).
- Arbeite nach IPERKA (`.claude/agents/champion.md`); lade `.claude/skills/anazh-lehren/SKILL.md` vor Kern- oder Stamm-Code. Karte 2 steht bei 145 von 1 718.

## DIE SPROSSE (Karte, wörtlich)
„2 Leiber: Meister und Anfänger in 3 Künsten · Anfänger sichtbar ungeschickt · Preis P · 2 Leiber nah · Richter: Blindtest Anfänger ↔ Meister ≥ 80 %“ (Klasse Ort; die Leiter misst, „ob man Stil, Meisterschaft und Kultur in der Bewegung sieht“).

## DIE ROTE ZEILE (GTX 1060, Runde 41 am main 031f4700, 27.11.) — wörtlich
„S1 ROT: fehlender Leser: der Anfänger ist nicht sichtbar ungeschickt: Meister {handwerk 427, tanz 8, kampf 6, brett 8} und Anfänger {handwerk 574, tanz 745, kampf 1088, brett 642} in 4 von 3 Künsten stehen im Lebenslauf (b.uebung), kein Leib liest ihr Können — Haltung (koerper-core tagesHaltung: Akt, Rolle), Gang (koerper-core.js tagesHaltung · stamm/siedlung-bewohner.js _bewohnerGemuet) · gemessen 4“
Das heißt: die Welt KENNT Meister und Anfänger (1 356 Bewohner am Messort `stadt-voll`, `b.uebung.{handwerk|tanz|kampf}.{h, koennen}` aus `LEBENSLAUF.uebung`) — aber Haltung, Gang und Geste sind nur f(Akt, Rolle, Gemüt). Ein Blindtest hätte nichts zu trennen.

## DER TÄTER (prüfe jede Zeile an der Quelle, die Nummern wandern)
- `koerper-core.js` `tagesHaltung` (Haltung aus Akt und Rolle) und der Weg von dort in den Leib (wer die Haltung in Gelenkwinkel, Takt und Geste setzt).
- `stamm/siedlung-bewohner.js` `_bewohnerGemuet` (Gang und Geste aus dem Gemüt) und `_bewohnerLauf` „uebung“ (dort entsteht `b.uebung`).
- Station (Zweig `punkte-maschine`, rohe Adresse): `meisterkarte-quelle/punkte/stationen/k2-mensch-sport.js`, Leiter `mensch.sport.kunst`, Schritt 1 — sie liest heute `K.leser(1, { … fehlt … })`.

## IPERKA — das Band (äußere Quelle mit Zahl, EINE Zeile je Quelle im Kern)
Woran sieht ein Mensch aus 3–8 m in wenigen Sekunden, ob einer sein Handwerk, seinen Tanz, seinen Kampf beherrscht? Suche die Bewegungs-Forschung mit Zahl (ohne Projekt- und Personennamen in der Suche): das Potenz-Gesetz der Übung (Zeit je Wiederholung fällt mit n^−α), die Streuung des Endpunkts und der Periode (Anfänger streut um ein Vielfaches), die Glätte (Ruck/Jerk, Zahl der Teil-Bewegungen je Zug), die Mit-Anspannung (steifer Rumpf, hochgezogene Schultern), Schwerpunkt-Schwanken im Stand, beim Kampf Ausholweg und Rückkehr in die Deckung, beim Tanz der Abstand Schritt ↔ Takt. Je Merkmal EINE Quelle mit Zahl (Autor, Jahr, Wert) als Band im Kern — nie eine Liste von Animationen, nie ein kopiertes Asset.

## DER SCHNITT (an EINER Wurzel: das Können formt die Bewegung)
- EIN Gesetz im Körper-Kern: `koennen` ∈ [0, 1] der geübten Kunst → wenige Bewegungs-Größen (Streuung von Periode und Endpunkt, Glätte, Tempo, Steife, Schwanken), die der Leib in den drei Künsten liest: Handwerk (der Schlag: Takt, Treffer, verworfene Züge), Tanz (Schritt am Takt, Balance, Weite), Kampf (Stand, Deckung, Ausholen, Rückkehr). Deterministisch aus der Saat des Bewohners — kein `Math.random`, kein Flag, kein zweites Register neben `b.uebung`, kein stiller Rückfall auf die Einheits-Haltung.
- Der Leib liest über die EINE Naht, über die er heute `tagesHaltung` liest (Studio = Welt: derselbe Leib im Körper-Studio und in der Stadt). Kosten an Schirm und Änderung: nichts je Bewohner außerhalb des Bilds.
- Sichtbar zuerst: je Kunst ein Bildstreifen (4 Phasen eines Zugs) Meister ↔ Anfänger vom selben Standpunkt. In der Wolke ohne GPU: die Gelenk-Spuren als Zahl (σ der Periode, Endpunkt-Streuung in cm, Ruck) Meister ↔ Anfänger ↔ vorher (vorher: beide gleich) im Blatt — die Bilder schießt das Gerät an deinem Kopf.
- **Der Leser des Richters (Kandidat, NICHT setzen):** lege in DEINEM Zweig unter `cloud-post/kunst-am-leib-station/` einen Diff gegen `meisterkarte-quelle/punkte/stationen/k2-mensch-sport.js` und — für den Blindtest — gegen `vision/pruefer/faecher.cjs` (Zweig `punkte-maschine`; Muster: das Fach mit der Frage „Wohnt in dem Haus in der Bildmitte ein armer oder ein reicher Haushalt?“ und `k2-mensch-bau.js:38`). Das Fach: je Kunst Paare aus der Stadt (Wahrheit = `b.uebung.<kunst>.koennen` an den Schwellen des Gesetzes, nichts nachgerechnet), je Leib ein Bildstreifen seines Zugs, Frage „Meister oder Anfänger?“, ≥ 20 Blätter, Klassen im Wechsel. Dazu `BEGRUENDUNG.txt` (≤ 30 Zeilen: Wahrheit, Umfang, Pose, was am Gerät offen ist). Du änderst nie ein Soll und nie den Richter-Text.

## ABGABE
- Beleg vor dem Kopf mit Zahl im Rumpf des Commits: (1) je Kunst die Bewegungs-Größen Meister ↔ Anfänger (Zahl, Einheit) und vorher (gleich); (2) Konsum-Probe: der Leib eines Bewohners der Stadt liest `b.uebung` (ein echter Leser, die Haltung ändert sich messbar, wenn nur `koennen` wechselt); (3) Determinismus: derselbe Bewohner, dieselbe Spur (Gegenlauf gleich); (4) die Stationen der gebuchten Sprossen der Leitern `mensch.sport.*` und `mensch.koerper.*` bleiben grün am Rumpf IHRER Station (wörtliche Zeilen); (5) Kosten: ms je Leib vorher ↔ nachher (headless zählbar).
- Station nicht gefahren: GPU → den Blindtest schießt und urteilt das Gerät an deinem Vorprüf-Kopf mit deinem Kandidaten.
- Probe-Ruf: wähle höchstens VIER Tore aus `spec/ci/ci-zeiten.json`, die den Körper-Kern und den Leib im Bild wirklich lesen (jedes ≤ 480 s Cloud-Zeit), und als eine davon `bild:dorf@0.5`; `probe-tag` entscheidet.
- Ehrlich offen darf bleiben: kunst#2 (die Hand prägt das Werk) und höher — eigene Stationen.

## PFLICHT
- Regel-Blatt GANZ lesen (Abschnitte 13:10 und 10:27 zählen): `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/welle-2611-regeln.md`.
- Briefkasten: lies alle ~30 min und vor jedem Push `https://raw.githubusercontent.com/MiguellD/AnazhRealm/koordination/cloud-post/kunst-am-leib.md` und `…/cloud-post/alle.md` (oberster Abschnitt `## … Koordinator`) — NIE per `git fetch` des Zweigs koordination (er trägt > 17 GiB Geschichte und reißt in der Wolke). Stationen holst du als einzelne Datei über dieselbe rohe Adresse am Zweig `punkte-maschine`.
- WARTEZIMMER: nach der Abgabe NICHT enden — bis zu 3 h in Warte-Schritten von ≤ 9 min alle 5 min den Briefkasten auf einen neuen Abschnitt `## … Koordinator` prüfen, Post abarbeiten, wieder warten.
- Station: je beanspruchter Sprosse eine Zeile im Rumpf `karte2.…#n · GRÜN|ROT · <Wortlaut>`; in der Wolke stirbt der GPU-Prozess → „Station nicht gefahren: GPU“ und daneben der Rumpf der Station headless (Null-Renderer) mit Zahl. In den Betreff nur, was grün liest. Du änderst NIE ein Soll und nie den Richter-Text.
- Schnitt: EINE Wurzel, kein Flag, kein Zwilling, kein stiller Rückfall. Keine Konstante an der Zeile `AnazhRealm.VERSION` (stamm/dirigent-kern.js). Fremde Zeilen nicht umformatieren.
- Linse (Gebot 10): bestehende Familie, vorher ROT am Täter (kein Leib liest das Können), Selbsttest mit gepflanztem Täter; Selbsttest-Zeilen nennen die Mutante mit „→ ROT“ oder ✅, nie ein bloßes „ROT“.
- Vor dem Push, alles GRÜN, beim Namen im Blatt: `npm run check:statik` GANZ (`npm run check` bleibt verboten) · `node scripts/stamm-umzug.cjs --nach-karte` nach jeder neuen Stamm-Methode · `npm run format:check` · `npm run lint` · jede Linse der Familie aus `.github/workflows/check.yml` GANZ.
- Kopf: `git fetch origin main` · `git merge-tree --write-tree origin/main HEAD` Exit 0 · EIN glatter Commit auf dem `origin/main` des Moments · Betreff GENAU `Vorprüfung kunst-am-leib <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: …] [ci voll]` · keine Versions-Stufe · kein PR.
- Probe-Ruf: höchstens VIER Proben, jedes Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`); `sh artifacts/profiband/werkzeug/zug.sh probe-tag kunst-am-leib@<sha>` muss „PROBE-TAG OK“ sagen; vorher `probeUrteil` (`scripts/lib/urteil-zeile.cjs`) über das Log jedes lokal gefahrenen Tors.
- Prozesse: beende nur eigene PIDs, nie chrome.exe/node.exe nach Muster.
- KEIN Siegel-Wort irgendwo (Betreff, Rumpf, WIP, Blatt): fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
- Stand-Blatt `cloud-post/kunst-am-leib.md` in DEINEM Zweig, früh geschoben (nach der Täter-Zahl), WIP-Commits mit `[skip ci]`.
