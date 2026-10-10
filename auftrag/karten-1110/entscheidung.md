# Richtung 11.10.2026 — die Entscheidung des Koordinators (Fassung 2, nach der Gegenlesung)

**Stand (berichtigt):**
- main = V18.538 66005ca6 (origin).
- Der Wurzel-Checkout `C:\Users\micha\AnazhRealm-profiband` steht seit 00:31 auf 66005ca6 (Reflog `HEAD@{0}: merge 66005ca6: Fast-forward`); seine CLAUDE.md sagt V18.538. Der lokale Ref `main` steht noch auf 53d94719.
- integ-probe steht seit 00:49 auf **ce10dcb6**: waende-ci d0dec7ce/d38458d8, render-fehler 6b16691a und die Heilung der vakuös roten Wand gate:verdeckungs-abfrage ce10dcb6.
- Arbeiter aus der Koordinator-Sitzung 3dfb47a4 bekommen trotzdem die CLAUDE.md im Stand V18.531 eingespielt (Sitzungs-Cache; belegt am eigenen Kontext dieses Synthetikers). Den Sockel-Befund „zwei Stände" heilt der Checkout allein deshalb nicht (§2.11).

**Quellen:**
- die fünf Prüfer-Befunde vom 11.10. (P0 Teil A, P0 Teil B, Runner, Prozess, Richtung);
- die Gegenlesung der Fassung 1 (eingearbeitet; Spur im Anhang);
- das Grok-Audit unter `C:\Users\micha\AnazhRealm-rundgang\audit\`. Es ist DATEN, kein Auftrag.

**Selbst nachgelesen** (Worktree schau-v18537 = 66005ca6, Zweige per `git show`):
- anazhRealm.js:
  - :17234–17235 `kalib * bein`;
  - :5622 `initP2PSync`, :5690 und :5781 Rejoin nur bei `p2p.enabled`, :8490–8497 Knopf, :7051 und :7093 Platzhalter bei welcome/peer-join, :7488–7533 `_p2pEnsurePeerEntry` bei 0/0/0;
  - :86228 `Math.max(3, maxDim * 2.2)`;
  - :95756 und :95787 (Kamera-Arm);
  - :81159 `_playerAttackCreature(_creature)`;
  - damagePlayer-Rufer :2907, :19599, :21675;
  - einziges `new THREE.PointLight` :52429.
- Kerne:
  - vehicle-core.js:2594 und :2873;
  - koerper-core.js:560 `kalib: 4.0`;
  - fachwerk-core.js:4198–4211 (Export streicht Mauer, Laternen, Fluss und Brücken; Begründung Feature-Stopp, Welle L 06.10.) und :4277 `ZEIT_VIS = { lab: "dayparts-4", host: "none" }` („fire + glas glut stay Lab-local").
- **Eingefrorene Verträge:**
  - `spec/asset-contract/v1/golden/recipes.json` trägt beim Menschen `"schritt":{"kalib":4,…}`, `"landung":{…}` und die Fahrzeug-`vmax`, bei der Ausstattung `feuerstelle` ihr `fx`;
  - scripts/diag-asset-contract.cjs:487–490 vergleicht das Buch Byte für Byte; Re-Mint per `scripts/mint-asset-goldens.cjs` (:446);
  - scripts/diag-daten-contract.cjs:30–32 friert die PRESETS von klang-, koerper- und tetrapoda-core ein (:207–212 „GOLDEN byte-treu").
- **Prüfbühne** f25d5808: anazhRealm.js:27374 lässt nur die Term-Arten wildnis, insel, rampe und bucht durch. spec/pruefbuehne/stationen.json trägt s0-atrium, s2-hang30, s5-furt, s5-kolk und meer; welt.json `architectures: []`. Die Hindernis-Station S4 ist im Plan eine Saat per `spawn_blueprint` (artifacts/profiband/pruefbuehne/plan.md:117), kein Erbgut-Term.
- **fahr-bahn** b898406f: tmp-fahr-bahn-debug.cjs ist diag-fahr-bahn.cjs plus 28 Debug-Zeilen. Diese Zeilen sind Haken an `_wandGleiten` und `_fahrHuelleKontakt` und zählen `pendingVegSpawns` im Umkreis von 12 m um den Wagen.
- **CI:** .github/workflows/check.yml:3–5 (`push: branches: ["**"]`) und :12–14 (`cancel-in-progress: true`); :88–96 fährt die Band-Wand gate:profiband GPU-frei, `werkbank band` läuft in keiner CI.
- **Memory:** prozess-freigabe.md (Vollmacht 11.10., 00:18), studio-zuerst.md, uebergabe-stand.md (kampf-Gelb 10.10. ~09:30), dirigieren.md (08.10., 09.10., 10.10.), selbst-organisieren.md (07.10.).
- Bild auge/1010/05-gt-am-sockel-fest.jpg und der Befund auge/1010/befund.md.

---

## §0 Fünf Sätze

1. Das Audit trifft die Symptome fast aller 13 P0, liegt aber bei acht in Ursache, Messwert oder Heilung daneben. MP-01 ist am Spielpfad bis auf den Platzhalter im Weltursprung widerlegt. Darum misst jede Karte zuerst mit ihrer eigenen Linse am Spielpfad; der Runner bleibt Referenz.
2. Der Prozess ändert die Mechanik, nicht die GOLDENE DEFINITION:
   - Kontext-Deckel 250 k, höchstens drei schwere Arbeiter, 250 M gewichtete Token am Tag;
   - WIP-Push alle 45 min mit `[skip ci]`;
   - Prüftiefe nach Risiko, mit Nachbesserungs-Schleife und nie ohne Prüfer;
   - gemergt wird nur bei grüner Zweig-CI;
   - jede neue Gesetzes-Zeile in einem eingefrorenen Buch ist ein deklarierter Re-Mint.
3. Zuerst schließen die offenen Zweige: V18.539 mit lf-kampf; V18.540 mit Körper-Bild, Wasser, Prüfbühne und Ego-Schatten; V18.541 mit S3-Haus, den v1-Teilen aus fahr-bahn und den Kampf-Resten. Danach bekommt das Gelände sein Gesetzbuch, und der Ort wird im Fachwerk-Studio auf diesem Gelände geplant und einmal exportiert. Parallel fallen die P0 in Klassen (Kamera-Leib, Gang, Licht), und der OMEN trägt E.
4. Die r184-Studio-Bühne des Audits wartet: Sie ändert keine Höhe und würde heute einen dritten Look-Pfad bauen. Die Gelände-Zahlen der rohen Makro-Fläche tragen kein Urteil, bis K09 sie am gebauten Boden nachmisst.
5. Die Vollmacht vom 11.10. trägt den Prozess; Karten, Puls und den Umbau der Lehren setzt der Koordinator offen selbst. Nur der Schöpfer setzt:
   - die Frozen-Zeilen, mit frischem Beweis aus dem Ausgabe-Pfad statt aaa8–aaa10 und einem Kriterium für E;
   - jede Ausweitung des Feature-Stopps (Tempo, steckende Pfeile, Fallschaden, Mauer, Landformen);
   - den Text von GOLDENER DEFINITION und BETRIEBSGESETZ;
   - die Altwelten.

---

## §1 Was am Audit stimmt, was nicht

### 1.1 Die 13 P0 — Urteil, wahre Engstelle, Zweig

| ID | Audit sagt | Urteil | Wahre Engstelle (Beleg) | Zweig | Wohin |
|---|---|---|---|---|---|
| KA-01 | Schwert trifft nicht; Ursache Waffen-Pfad/Verschleiß (bericht.md Kap. 56.5) | **teilweise.** Symptom bestätigt: 2/12 Treffer bei wear 1,0, messung true, swingStart true (audit/daten/runner/schwach.json). Die Audit-Ursache widerlegen die eigenen Daten. Horizont 0/8 ist eine Design-Lücke (die Klinge folgt dem Blick). | (a) :81159 verwirft das Tier unter dem Fadenkreuz; (b) Drehpunkt pm.y + 1,2 m ohne Schulter (:81282); (c) eine statische Kapsel je Frame (:81234, :81292); (d) Verb-Tor bis 6 m (:82265) gegen eine Klinge von 1,3–2,5 m | welle-lf-kampf 7ccab2f4: (a) c138bd30 (`_kampfZielMerken`, `_playerAttackCreature(ziel)`); (b) c138bd30 (echte Schulter); (c) c138bd30 + c8183798 (Teilschritte, Pose = Treffer-Volumen); (d) 664f205f. 972127d8 ist die Treffer-Energie (T16). | K01 (a)–(d); Klick-Pfad-Matrix, Horizont und kampf-Gelb: K13 |
| KA-05 | Pfeile verschwinden | **bestätigt** | `_tickPfeile` :81838–81847 despawnt bei Tier und Wand; das Studio steckt (schmiede.js:1446 `stickArrow`, Pool 40) | keiner (lf liefert die Gestalt, f7595de9) | §5.2 S2 (trägt keinen v1-Schritt) |
| WE-05 | keine Kamera-Kollision, 41/40 von 50 Posen | **teilweise.** Der Arm existiert (`_loopCamera` :95768–95825, Pflanzen bewusst durchsichtig). Die Zahl ist überzählt (AABB statt OBB :34061–34075, Pflanzen-Boxen ohne `durchPflanzen`, Kopf statt Blickziel; Bild pose-01 ohne Fels). Sicher ROT: unterBoden 9/50 (w1) und Laub vor der Linse (pose-00). | Strahl ohne Radius, Rückzug 0,85 × Treffer (:95787), Boden-Deckel Füße − 0,2 m (:95756) statt sichtbarer Boden (Lehre 22) | schau2-kamera-laub 217d3ea9 (WIP, ungeprüft, nur Laub) | K06 |
| NP-03 | Ninja-Kamera ohne Kollision | **bestätigt:** 9/48, Bild pose-14 | koerperstudio.js:1926–1927: nur der Höhen-Deckel camG | keiner | K06 |
| WE-16 | Feuer ohne Licht | **bestätigt als Absenz:** außer dem Portal gibt es kein Punktlicht. Die Luminanz-Zahl des Runners trägt nicht (Bühne nicht eingefroren, lumOhne w2 0,487 > lumMit). | einziges PointLight :52429 (Portal); das Glut-Wissen lebt nur im Klang-Takt (`_umweltGlutSweep` :10011 aus `_umweltKlangTick` :9952, braucht einen AudioContext); fachwerk-core.js:4277 hält Feuer- und Fensterglut Lab-lokal | keiner | K11 |
| WE-17 | kein Fallschaden | **bestätigt als Absenz** | damagePlayer :46816 hat nur die Rufer dsl, gegenwehr und jagd; die Landung :94515–94519 speist nur den Kamera-Dip | keiner | §5.2 S3 (neue Spielregel) |
| FZ-01 | Auto fährt unter Wasser weiter | **bestätigt** (v 3 s nach Kontakt 4,94/4,91 m/s). Die Tiefe 90,3 m ist ein Linsenfehler: `_atlasWaterLevelAt(x,z,−Infinity)` :33728 statt `_koerperWasser` :35799. | vehicle-core.js:2831 fahrKraefte ohne Wasser-Term; anazhRealm.js:94926 reicht keine Tiefe | schau2-wasser-wahrheit c5e8fa44 (fb52f533, e162430b, 557e3c17) | K02 |
| GA-01 | vmax 16 m/s, kein Sprung | **bestätigt** (das Gesetz widerspricht sich: fahrStand hebt bei v²/R > g ab, :2740–2745; der Garage-Hügel braucht 16,6 m/s > vmax). Die Heilung ist neues Tempo, also neues Verhalten. | carPhys :2386–2394, dragK aus vmax :2594, Deckel :2873, VMAX_REF :2425 | keiner (fahr-bahn koppelt den Klang an vmax) | §5.2 S1; die v1-Teile aus fahr-bahn: K12 |
| AN-01 | Fußgleiten 130 %; Anker walkPhase :58496/:58517; Maßnahme Weg-Phase + IK | **Symptom bestätigt, Anker und Maßnahme falsch.** Weg-Phase (:17210), IK (:17253) und Fuß-Lock (:17408) existieren schon. | Schrittlänge kalib 4,0 × Bein ≈ 3,4 m (:17234–17235, koerper-core.js:560): bei 1,15 m/s 0,34 Schritte/s, der Lock löst an der Reichweite (:17440–17443). Mensch, Tiere und Körperstudio gehen drei Modelle. | keiner | K07 |
| TON-01 | die Fußkontakt-Flanke greift nie | **Symptom bestätigt, Ursache widerlegt:** 6 s × 1,06 rad/s / π = 2 Halbzyklen = 2 Töne | dieselbe Schrittlänge | keiner | K07 |
| MP-01 | Peer 93 m daneben, Mesh im Ursprung | **Am Spielpfad bis auf den Platzhalter widerlegt.** Alle Spiel-Rufer setzen `enabled` (Knopf :8490–8497, Boot :92361–92368); :6887, :8465 und :42268 rufen nur bei `enabled` bzw. wasConnected. Die 93,18 m stammen aus dem nackten Aufruf der Runner (Artefakt). **Bestätigt:** Nach welcome/peer-join (:7051, :7093) steht der Platzhalter sichtbar bei 0/0/0, bis die erste Position kommt (:7488–7533). Die Tür kennt die Absicht nicht: ein nackter Aufruf plant keinen Rejoin (:5781). In der CI läuft keine Mehrspieler-Wand. | `_p2pEnsurePeerEntry` :7488; `initP2PSync` :5622 gegen `_p2pScheduleReconnect` :5781 | keiner | K04 (Prio 3) |
| NP-01 | Tunnel unpassierbar | **bestätigt, dazu ein zweiter Fehler:** Treppe 1 (z 27,0) liegt 0,7 m unter dem Dach und schiebt den Läufer 1,85 m | koerperstudio.js:1691–1698 (Tunnel in einer 1,7-m-Lücke) | keiner | D1 (Studio-Hülle, nicht der Welt-Pfad) |
| WS-01 | Vorschau unsichtbar oder zu klein | **teilweise:** „unsichtbar" widerlegt (21/21), „zu klein" bestätigt (Füllgrad 0,059–0,157) | :86228, :86543, FOV 45° (:85439) | keiner | K05 |

### 1.2 Die übrigen Teile des Audits

| Teil | Urteil | Beleg |
|---|---|---|
| Runner als Abnahme-Werkzeug | **Zwilling in der Maschine, Ergänzung in den Fragen.** Start-Literal statt Start-Rezept; dc/tris aus renderer.info; vramMB 9/9 null; Licht nicht reproduzierbar; 33 leere `catch`; Wildnis-Suchen fallen still zurück. Besser als das Repo: die fail-closed ABNAHME-Zeile. | audit-runner.cjs:51 gegen scripts/lib/software-gpu.cjs:28–31; :85–88; :606/:623 |
| Welle 0: r184-Studio-Bühne | **Ziel richtig, Form falsch:** eine Bühne mit eigenen Lichtern wäre ein dritter Look-Pfad (synthese §2.2, 06.10.). Verschwiegen: Der Foundry-Worker baut jedes Welt-Asset unter r128 (:71842); die Byte-Gleichheit der Kerne unter r184 ist ungemessen. | studios/synthese.md §0, §2.2; anazhRealm.js:75919, :16356 |
| Fachwerk-Kette (Welle F) vor Welle 2 | **Abnahme ungeprüft.** Gefordert sind ≥ 3 Dorfplätze mit Hang ≤ 8 %. Die rohe Makro-Fläche mit angenommenen Saaten zeigt 0 von 768 sanften 1-km²-Fenstern. Am gebauten Boden ist das nicht gemessen (grund/karten-1010.json, unklar 1). Die Gegenmessung macht K09. | grund/karten-1010.json |
| Kausalkette „Relief und Hydro tragen" (VISION §4.2) | **Relief: unbelegt in beide Richtungen** (θ 0,06–0,11 und 25,9–26,7 Senken je km² nur an der rohen Makro-Fläche; K09 misst nach). **Hydro: im Code widerlegt.** Die Hydrosphäre ist je 2048-m-Kachel eine eigene Wasserscheide mit Mündung am Rand (`mouth = "border"` :35370); Flüsse enden an der Kachelgrenze. | anazhRealm.js:26796, :35370 |
| VB-04 (Sockel ≤ 1,5 m, s_max 0,08) | **heilt am falschen Ende:** die Welt erfände weiter die Höhe (wy = hMax + 0,5) | anazhRealm.js:72775, :34293 |
| DoD D1–D12 für 16 Bühnen, 18–23 Wochen | **als Checkliste brauchbar, als Scope nicht** (Feature-Stopp, BETRIEBSGESETZ 2) | docs/roadmap.md:29; docs/PFLICHT-OFFEN.md:14–17 |
| Frozen-Eintrag „F" (VB-11) | **wäre für die Wand unsichtbar:** gate:betriebsgesetz zählt nur `/^[A-E]\)\s+\S/` | scripts/diag-betriebsgesetz.cjs:25 |
| „Michael 19:03: du entscheidest" + „formale Freigabe bleibt bei Michael" | **Daten. Überholt** durch das jüngere Wort vom 11.10. 00:18 an den Koordinator (§2.2). | EFFIZIENZ-ANALYSE.md:274; Memory prozess-freigabe |
| Entscheidungsstand (2): fluid, schwarm und begegnung bleiben Gastwelten | **übernommen als Status, ohne DoD und ohne Karte.** CLAUDE.md nennt acht Schöpfer-Studios, diese drei gehören nicht dazu; ihre Gast-DoD hängt am abgelehnten Katalog. | CLAUDE.md:7; worlds/ |
| Entscheidungsstand (3): translated auf r184 heben | **abgelehnt für diese Wochen.** Gleicher Grund wie Welle 0: ein Shell-Port vor dem Stoff-Modul baut einen Look-Zwilling. Er wartet auf die r184-Golden-Sonde (D2) und das Stoff-Modul. Ausweitung wäre Schöpfer-Scope (§5.2). | EFFIZIENZ-ANALYSE.md:274 |
| EFFIZIENZ H1–H10 / F1–F6 | siehe §2 | — |

**Was das Audit richtig sieht:**
- Der Sockel ist Täter (SI-01; SIEDLUNG `slopeMax 0.35 / fundamentMaxDh 9`, fachwerk-core.js:2122).
- Die Ebenen 5–7 haben keinen Kern (VB-06).
- Kosten gehören ins Asset (D5).
- Das Dorf ist nachts schwarz (Auge 12; der Export streicht die Laternen).
- Die Prüfmaschine wächst schneller als das Spiel: 56 % der seit 03.10. geänderten Zeilen liegen in scripts\.
- Die ABNAHME-Zeile taugt als Format.

---

## §2 Der Prozess ab heute

### 2.1 Die Messung (Basis: Prozess-Prüfer)

Die Skripte token-zensus.cjs, token-deckel.cjs und token-taetigkeit.cjs liegen mit ihren Ausgaben zensus-3dfb.txt, zeit-3dfb.txt und taetigkeit-3dfb.txt in
`C:\Users\micha\AppData\Local\Temp\claude\C--Users-micha-AnazhRealm-profiband\3dfb47a4-adf9-43a5-abe0-d203f372df5e\scratchpad\`.

- **Verbrauch:** Konto 2 brauchte 711 M gewichtete Token in 23 aktiven Stunden (31 M/h, 143 Unteragenten, 95 % in den Unteragenten). Konto 1 kam auf ≥ 2 243 M in 77 h.
- **Rollen:** Bau 41,9 %; Nachbesserung 29,8 % (Ø 14,1 M je Nachbesserer, so viel wie ein Bau-Agent); Prüfer 12,4 % (Ø 2,3 M); Vermessung 11,0 %.
- **Kontext:** 52 % der Kontext-Last liegen in Durchgängen über 400 k, der größte Lauf erreichte 967 k. Ein simulierter Deckel bei 250 k spart 44 %.
- **Sockel:** Median 62 070 Token je Arbeiter. Wer aus Sitzung 3dfb47a4 startet, trägt die eingespielte CLAUDE.md V18.531 neben der Worktree-Kopie.
- **WIP-Zweige** (`git show --stat`):
  - kamera-laub 217d3ea9: 162 Zeilen Spiel gegen 1 901 Zeilen Skripte, davon 782 Zeilen Erkundung (`x-erkunde-hang` 57, `x-erkunde-kamera` 98, `x-kamera-variante` 627).
  - fahr-bahn b898406f: 525 Zeilen Spiel gegen 1 832 Zeilen Skripte. tmp-fahr-bahn-debug.cjs (930) ist eine Kopie von diag-fahr-bahn.cjs (902) plus 28 Debug-Zeilen. Diese 28 Zeilen sind die offene Täter-Hypothese des abgerissenen Arbeiters; sie wandert in die Übergabe von K12, die Datei selbst fällt.

Der Verbrauch hängt an der Betriebsstunde und an der Breite, nicht an der Aufgabe. Die Hebel sind Deckel, Breite und Nachbesserung.

### 2.2 Die Vollmacht vom 11.10. — wie sie gilt

**Wortlaut** (Memory prozess-freigabe, Sitzung 3dfb47a4, 11.10. 00:18): „du entscheidest champ, du dein eigener Meister, Lehrer und Schüler".
- Umfang laut Notiz: Aufgabenkarten vor dem Code, PR/Squash-Rhythmus, „lokal betroffene Gates, CI ist der Richter", neue Linsen in bestehende Suiten, CLAUDE.md-Umbau (Inhalt bleibt, Ort wechselt), Bibliotheken nach Spike.
- Zusatz der Notiz: Frozen-Liste und Feature-Stopp „Vollmacht gilt auch hier, aber jede Änderung offen benennen".

**Auflösung, entweder selbst setzen oder fragen, nie beides:**

| Gegenstand | Wer | Grund |
|---|---|---|
| Karten vor Code (F1), Puls statt Voll-Batterie (F3), Linsen in bestehende Suiten (F4 als Praxis), Squash (F2) und Bibliotheken (F6), Umbau der **Lehren** und der champion.md-Prozesszeilen (F5) | **Koordinator setzt offen selbst.** Jeder Commit nennt „Vollmacht 11.10." und steht in der Übergabe; der Schöpfer kann ihn kippen. | Diese Punkte nennt die Vollmacht wörtlich. Die Lehren sind Prozess-Wissen, nicht die bindenden Abschnitte. |
| Text der GOLDENEN DEFINITION und des BETRIEBSGESETZES, darunter der F4-Zusatz zu Gebot 10 | **Schöpfer** (§5.3) | CLAUDE.md markiert beide Abschnitte als „bindend"; die Vollmacht selbst sagt „die GOLDENE DEFINITION bleibt unangetastet". |
| Neue Frozen-Zeilen und das Fallen von A–C | **Schöpfer** (§5.1) | CLAUDE.md:65: „Neue Einträge setzt NUR der Schöpfer." Gesetzestext schlägt eine Memory-Paraphrase. |
| Feature-Stopp | **Anwenden: Koordinator.** Die Regel von roadmap §0.v1 lautet „nur, was einen der fünf Schritte oder den FPS-Boden trägt"; jede Karte nennt ihren Schritt. **Ausweiten: Schöpfer** (§5.2). | BETRIEBSGESETZ 4: „der Schöpfer entscheidet Scope und Ship". |
| „du entscheidest" 19:03 (Audit) gegen 10.10. (Studio zuerst) gegen 11.10. (Vollmacht) | **aufgelöst:** Das jüngste Wort an den Koordinator gilt. Gelände vor Bühne; die r184-Bühne wartet auf das Stoff-Modul. | EFFIZIENZ-ANALYSE.md:274 nennt die formale Freigabe noch „bei Michael"; das Wort vom 11.10. kam danach. |

Damit gilt: Der Kartenkopf (§4) bricht kein geltendes Gesetz.
- Lehre 26 bekommt ihren neuen Halbsatz als eigenen Commit in integ-probe vor V18.539 (§2.11); jede Karte startet auf V18.539 oder später.
- Lehre 19 („nach jedem Push die CI lesen") bleibt wörtlich: Die CI liest der Koordinator, und gemergt wird nur bei grüner Zweig-CI (§2.8).

### 2.3 Übernommen — mit Anpassung an die GOLDENE DEFINITION

| Hebel | Was gilt ab heute | Anpassung an die GOLDENE DEFINITION |
|---|---|---|
| **H7 Kontext-Deckel** | Bei etwa 250 k Kontext: WIP-Commit, Übergabe in die Rückgabe, enden. Ein frischer Arbeiter übernimmt. Eine Nachbesserung ist ein NEUER Arbeiter mit Befund + Diff. | Die Übergabe nennt Linse, Zahl mit Rohdatei und Bild-Stand (Gebot 9). Ein WIP-Kopf merget nie (kein halber Schnitt als Zwilling). |
| **H10 Breite** | Höchstens 3 schwere Arbeiter auf dieser Maschine (§2.5), 1 Werkpaket auf dem OMEN. Vermessung höchstens 4 Agenten je Frage, Rückgabe sind Karten. Eine zweite Karte auf einer belegten Atlas-Zone wird abgewiesen. | Gebot 9; dirigieren.md: 7 schwere Arbeiter bei 79 % CPU verdoppelten die Zeit-Linsen. |
| **H3 Karte vor Code (F1)** | Eine Karte hat höchstens 25 Zeilen und liegt in `koordination/auftrag/`, nie im Code-Repo. Inhalt: Chokepoint, die Klasse mit den bekannten Fällen, die Linse vorher ROT mit Täter, Zahl vorher → Ziel, Bild-Szene, Konsum-Leser, v1-Schritt, Dateigrenze, Kosten-Soll (Token + CI + Laufzeit-Kosten), Risiko-Stufe und Re-Mint-Akt (falls ein Buch sich ändert). Abgenickt wird sie vom Koordinator. | Gebot 5 (Konsum-Leser), „der Beweis ist das BILD" (Bild-Szene). **Die Fall-Liste ersetzt die Nachbesserungs-Schleife NICHT** (§2.6): Ecken tiefer Klassen sind nicht vorhersehbar (dirigieren.md 10.10.: Prüfbühne Geburt → Nexus → Laden-Spread; Wasser Hain → Satz-Haus → Restore; kampf Kosten → Leichnam über P2P). |
| **H4 Puls (F3)** | Puls je Schnitt: `node --check`, eslint auf die geänderten Dateien, die Gates, die die Karte für ihre berührten Methoden nennt, und die Karten-Linse; jede Ausgabe endet mit `EXIT=n`. Familien fahren nur ihre Gates und playtest:fast. Der Integrator fährt je Merge den vollen Playtest. Die CI richtet die ganze Batterie, und gemergt wird nur bei grüner Zweig-CI. Kein Massen-Umbau der 153 Gates. | G5: Puls ersetzt nie Bild und Spielpfad. `npm run puls` mit maschineller Zone→Gate-Karte kommt erst, wenn eine Karte eine Wand verfehlt hat, die ihr Puls hätte fahren müssen (D4). |
| **H5 Kürze, ohne Squash** | Commit-Rumpf in drei Sätzen (geschnitten · gemessen mit Zahl und Rohdatei · offen), höchstens 600 Zeichen. Serien-Commits bleiben. | DER TON; Lehre 15. |
| **H2 Diät (F5)** | Der Stand-Abschnitt fällt (die Wahrheit sind PFLICHT-OFFEN und git log). Die Lehren 19–27 wandern als Skill `gpu-render-lehren` nach `.claude/skills/` (Inhalt bleibt, Ort wechselt). „Kerne (10)" wird zu „8 Manifest-Einträge, 9 Kern-Dateien (foundry-core.js ist das zweite Skript von phyto)". GOLDENE DEFINITION und BETRIEBSGESETZ bleiben wörtlich. | Unter der Vollmacht, nach V18.539 (§2.11). |
| **H9, angepasst** | EINE Szenen-Liste aus dem Ausgabe-Pfad an den Prüfbühnen-Stationen, je Version vom OMEN auf echter GPU, nie als CI-Wand; gemeldet werden Zahlen und nur die abweichenden Bilder. Dazu die ABNAHME-Zeile als Format (D3, nach K03). | Lehren 5, 17, 20; `bild:vergleich` fällt als Zwilling von look-golden. |
| **F4 als Praxis** | Eine neue Linse ist vorher ROT am Täter, sitzt in einer bestehenden Familie, hat einen Selbsttest, kostet ≤ 3 min CI und nennt ihren Konsum-Leser. | Erfüllt Gebot 10 enger; der Text-Zusatz zu Gebot 10 ist Schöpfer-Sache (§5.3). |
| **F4-Gegenstück: nur der Einzelfall VIS** | Das VIS-Band in diag-perf-parity.cjs (:85–89, :240, :419–423) zählt Emitter-Ursprünge im Nebelradius: Existenz statt Konsum, fällt mit jeder Bündelung. Es fällt als R1-Karte mit Prüfer. Vorbedingung: die vier roten Nächte von playtest-full lesen und belegen, dass VIS dort der einzige Täter ist. Der CI-Richter des Bands bleibt die GPU-freie Projektion gate:profiband (check.yml:88–96). | **Keine allgemeine Regel:** `werkbank band` läuft in keiner CI. Eine Wand fiele sonst zugunsten eines Richters, den keine Maschine fährt (dirigieren.md 09.10.: „Wände ohne Workflow sind Wachsamkeit"). |

### 2.4 Abgelehnt — mit Grund

- **2-Wochen-Umbau als Programm (EFFIZIENZ §6):** champion.md verbietet einen Plan als Lieferung; dazu kommen der Feature-Stopp und das Budget neben elf offenen Zweigen.
- **H1, die Monolith-Zerlegung jetzt:**
  - sieben Zweige sitzen auf dem Stamm;
  - 71 Skripte lesen anazhRealm.js als Text;
  - Zone §11 hat 8 529 Zeilen (≈ 120 k Token je Lesung).
  H1 kommt erst am Nullpunkt aller Zweige, Zone für Zone, mit Hash-Beweis über die 2 526 Methoden.
- **H8 / F6, Bibliotheken:** Sie widersprechen dem Studio-Prinzip (CLAUDE.md:7–8), dem bit-gleichen Lockstep und Lehre 18. Regel: ein Spike im Studio erst, wenn eine Klasse zwei Chokepoint-Schnitte überlebt hat; ein Ersatz nur mit dem Abschied des Eigenbaus im selben Commit.
- **F2, Squash je PR:** Er zerstört Bisect (der OMEN bisectete am 08.10. einen Bruch über drei Merges) und widerspricht Lehre 15.
- **Runner ins Repo, `bild:vergleich`, Filmstreifen per Wanduhr:** An ihre Stelle tritt eine Bildfolge in festen Sim-Schritten, bei der der Loop je Schuss ruht (Lehre 17).
- **Kleines Modell für Bau und Prüfung:** Der Maßstab ist Weltklasse. Ein kleineres Modell nur für Wache, CI-Log und Zensus.
- **R0 ohne Gegenprüfung (Fassung 1):** fällt. Jede Stufe hat einen Prüfer (§2.6).
- **Die Fall-Liste als Ersatz der Nachbesserungs-Schleife (Fassung 1):** fällt (§2.3 H3, §2.6).

### 2.4a Re-Mint als Klasse (neu, aus der Gegenlesung)

Jede Gesetzes-Zeile, die ein eingefrorenes Buch ändert, ist ein **deklarierter Vertrags-Akt** nach Lehre 11. Betroffen sind:
- das Rezept-Buch `spec/asset-contract/v1/golden/recipes.json` (gate:asset-contract);
- die Kern-PRESETS von klang, koerper und tetrapoda (gate:daten-contract);
- die Mesh-Goldens der Studios (gate:fachwerk-, porta-, schmiede-, vehicle-contract).

Ablauf im selben Commit:
1. Vorher sind die Wände grün.
2. Nach dem Schnitt sind sie ROT beim Namen.
3. Re-Mint per `scripts/mint-asset-goldens.cjs` bzw. per Neu-Einfrieren wie e070796c.
4. Der Commit trägt die Pfadliste des Diffs. Sie muss genau die neuen, geänderten oder gestrichenen Schlüssel nennen, sonst nichts.
5. Der Prüfer liest diesen Diff.

Die Karte nennt ihre Akte vorab. Betroffen sind K06, K07, K11, K12 und K13 (und K10, K08 als Mesh-Akte).

### 2.5 Budget-Regel

- **Tagesdeckel: 250 M gewichtete Token** (Cache-Lesen 0,1 · Cache-Schreiben 1,25 · Ausgabe 5).
  - Herleitung: Konto 1 trug ≥ 2 243 M je Woche, also ≥ 320 M je Tag; 80 % davon ergeben 256 M.
  - Konto 2 verbrauchte am 09./10.10. 711 M in 23 h, das 2,8-Fache.
  - Die erste Woche eicht den Wert; eine Änderung erfolgt offen und mit Zahl.
- **Ampel:**
  - ab 150 M (60 %) keine neue Bau-Karte, nur Prüfer, Integrator und WIP;
  - ab 250 M bis 00:00 nur WIP-Sicherung.
- **Kosten-Soll je Karte** (inklusive Prüfer und Nachbesserung): R1 ≤ 10 M · R2 ≤ 20 M · R3 ≤ 35 M; tiefe Klassen +10 M.
  - Wer sein Soll erreicht: WIP, Übergabe, der Koordinator entscheidet.
  - Die 13 Karten aus §4 summieren sich auf ≤ 0,33 G. Mit dem gemessenen Überlauf (Nachbesserung 29,8 %, lange Läufe) rechne ich mit bis zu 1,0 G in drei Wochen; der Tagesdeckel ist Decke, nicht Ziel.
- **Messung:** token-zensus.cjs wandert nach `artifacts/profiband/werkzeug/` und läuft nächtlich; die Zahl steht in der Übergabe-Memory.
- **Schwer** ist, wer eine Welt bootet (werkbank, playtest, Batterie) oder den Stamm schreibt.
  - **Höchstens 3 schwere gleichzeitig auf dieser Maschine.**
  - Platz 1 = Integrator und Stamm-Kette seriell; Platz 2 und 3 = Klassen-Karten.
  - Dazu kommen das Auge (offen, ohne GPU-Schloss) und höchstens 2 leichte (Prüfer-Lesung, Zensus).
  - Der OMEN trägt 1 Werkpaket plus Messauftrag.

### 2.6 Prüftiefe nach Risiko — mit Schleife, nie ohne Prüfer

| Stufe | Wann | Prüfung | Nachbesserungs-Runden (automatisch) |
|---|---|---|---|
| R0 | nur Linse oder Skript, kein Spiel-Code, **kein Abbau einer CI-Wand** | 1 leichter Diff-Prüfer mit **Vakuum-Probe**: Wird die Linse am benannten Täter ROT (Selbsttest echt, nicht gestubbt)? Misst sie den Spielpfad? Hält die Exit-Zeile? | 1 |
| R1 | eine Atlas-Zone im Stamm, kein Kern, kein Speicher, kein P2P; oder der Abbau einer CI-Wand | 1 Prüfer: Karte + Diff + Karten-Linse + Bild | 1 |
| R2 | Kern unter Byte-Beweis/Re-Mint, Worker, Lockstep/P2P, Speicher-Format, Render-Kosten | 1 Prüfer + Byte-Beweis + OMEN-ABAB in der Version | 2 |
| R3 | Paradigma oder mehrere Zonen bzw. Kerne | Soll-Bild + Budget vor dem Code (Lehre 18); 2 unabhängige Prüfer im ersten Durchgang (Mechanik / Bild + Kosten) | 3 |

**Die Schleife:**
- Findet ein Prüfer eine weitere Ecke DERSELBEN Klasse, ist das die nächste Runde. Sie läuft als neuer Arbeiter mit Befund + Diff, und die Ecke wird ein benannter Fall der Karte.
- Ab der zweiten Runde prüft der Prüfer am geänderten Punkt **und** an jedem benannten Fall (dirigieren.md 07.10.).
- Karten tiefer Klassen (K02 Wasser, K03 Prüfbühne, K13 Kampf) bekommen eine Runde mehr als ihre Stufe.

**Erschöpfte Schleife:**
- Die Karte bleibt offen, es gibt keinen Merge.
- Die Rückgabe nennt den Rest mit Messnamen und Rohdatei.
- Der Koordinator entscheidet: eine neue Karte für die Ecke (die Klasse bleibt ganz offen, kein Teil-Merge als „5 %") oder das offene, benannte Fallen der Klasse.
- Ein Merge mit bekanntem Bruch ist ausgeschlossen (fail-soft).

### 2.7 WIP-Pflicht gegen das Wochenlimit

- **Wann:** alle 45 min Arbeitszeit und nach jedem grünen Teilschritt.
- **Wie:** Betreff `WIP <Karte>: <Stand> [skip ci]`, danach `git push`. `[skip ci]` hält check.yml (push auf `**`, cancel-in-progress) von halben Ständen fern; Gruppen bis 33 min (dirigieren.md 10.10.) laufen sonst je WIP und werden Rauschen.
  - Der Rumpf ist die Übergabe, höchstens 15 Zeilen: Stand · nächster Schritt · Linse vorher/jetzt mit Zahl und Rohdatei · berührte Methoden · offene Täter-Hypothese · offene Fragen.
  - Ein WIP-Commit besteht `node --check`.
  - Ein WIP-Kopf merget nie. Der letzte Push einer Karte trägt KEIN `[skip ci]`; erst er erzeugt die Zweig-CI, die vor dem Merge grün sein muss.
- **Bei etwa 250 k Kontext oder der Ampel 150 M:** WIP, Übergabe in die Rückgabe, enden.
- **Erkundungs- und Debug-Skripte** (`x-*`, `tmp-*`) leben im eigenen Scratch, nie im Commit. Ihre Hypothese steht in der Übergabe.
- **Nie `git stash`.**
- **Neustart:** Ein abgerissener Arbeiter startet neu aus seinem letzten WIP-Rumpf, nie aus dem Transkript; keine SendMessage an Workflow-Agenten.
- **Koordinator:** Er schreibt die Übergabe-Memory bei jedem Strom-Wechsel neu.

### 2.8 Merge-Rhythmus

1. Karten-Zweig: Der letzte Push ohne `[skip ci]` erzeugt die Zweig-CI.
2. Prüfer nach Stufe (§2.6).
3. **Zweig-CI grün** am Nicht-WIP-Kopf. Der Koordinator liest sie (Lehre 19), der Arbeiter wartet nicht. Ist eine Gruppe rot, geht der Befund an den Arbeiter; der Merge wartet.
4. integ-probe: Der Integrator fährt je Merge den vollen Playtest („Alle Invarianten OK") und die Gates der Konflikt-Zonen (dirigieren.md 08.10.).
5. **Höchstens eine Version am Tag:** abends der Versions-Commit, CI 5/5.
6. Nachts die OMEN-ABAB gegen main.
7. Morgens der main-FF, nur bei „nicht langsamer" (Frame p50/p95 unter Regler voll, CPU-Takt p95, gpu-bank, Band).
8. Danach eine Spieler-Runde im Auge, als eigene Blick-Sonde; sie ist kein Merge-Tor.

Der Wurzel-Checkout und der lokale Ref `main` ziehen bei jedem FF mit. Nie zwei Versionen gleichzeitig im Flug.

### 2.9 Was der OMEN trägt

- **Zeit-Richter:** ABAB je Version gegen main auf der GTX 1060. Auf der Radeon wird keine Zeit gemessen: Jede ms-Schwelle einer Karte richtet der OMEN in der Version; die Radeon zählt nur (Befehle, Programme, Strahlen je Frame).
- **Werkpakete, immer eines**, je als Karte mit Risiko-Stufe und unabhängigem Prüfer (selbst-organisieren.md 07.10.): O1 → O2 → O3 → O4 (§4.2).
- **Dazu:**
  - Bisect bei jedem Merge-Bruch;
  - ab D3 die Szenen-Liste je Version;
  - für K09 und K10 Wiese und Genesis vorher und nachher; ein neuer Messort ist ein deklarierter Akt.

### 2.10 Was der Runner wird

- **Ort:** Er bleibt Audit-Daten außerhalb des Repos. Seine 24 Szenen sind der Fragen-Katalog, keine Abnahme.
- **Fragen als Proben** in der vorhandenen Familien-Linse, am Spielpfad, mit Selbsttest, ≤ 3 min CI:

  | Frage | Familien-Linse |
  |---|---|
  | FZ-01 | gate:werk-im-wasser (Zweig) bzw. diag-fahr-leben |
  | KA-01 | diag-kampf-gefuehl Probe (F), Klick-Pfad |
  | AN-01, TI-07 | gate:tier-gang (EINE Metrik, EINE Schwelle) |
  | WS-01 | gate:v1-pfad V-D3 |
  | WE-05, NP-03 | diag-kamera-laub |
  | MP-01 | gate:mp-sync über Knopf und Boot, nie über den nackten Aufruf |

- **Übernommen:** die ABNAHME-Zeile als EIN Ergebnis-Format in `scripts/lib/abnahme-urteil.cjs`. Ein null-Wert ergibt ROT, die Schwelle ist ein Datum `{feld, op, wert}`, dazu das Feld `seitenfehler`; Selbsttest ≤ 5 s in `npm run check`. Gebaut wird sie in D3, zusammen mit ihrem ersten Leser (der Szenen-Liste), nicht vorher.
- **Nicht übernommen:** Start-Literal, renderer.info-Zahlen, vramMB, Wildnis-Suchen, Instanz-Patch von `_loopCamera`, ins Bild gebranntes Etikett, Wanduhr-Filmstreifen.

### 2.11 Koordinator-Schnitte heute

1. **Stand-Heilung:**
   - Der Wurzel-Checkout steht schon auf 66005ca6.
   - Neu: Kartenkopf 1 verlangt, CLAUDE.md aus dem eigenen Worktree mit Read zu lesen, weil Sitzung 3dfb47a4 den Stand V18.531 einspielt.
   - Die nächste Koordinator-Sitzung startet frisch aus dem Wurzel-Checkout.
   - Der lokale Ref `main` (53d94719) zieht auf origin/main.
2. **Unter der Vollmacht, je ein Commit in integ-probe vor V18.539:**
   - Lehre 26, der Halbsatz „vor dem Push läuft JEDER CI-Schritt lokal, nie eine Auswahl" wird zu: „lokal läuft der Puls der berührten Methoden + playtest:fast; der Integrator fährt den vollen Playtest je Merge; die CI richtet die Batterie, gemergt wird nur bei grüner Zweig-CI".
   - champion.md:18 bekommt den Satz „Die Karte des Koordinators (≤ 25 Zeilen, koordination/auftrag/) ist Auftrag, kein Plan-Doc." und eine `tools`-Frontmatter (Bash, PowerShell, Read, Edit, Write, Grep, Glob, Monitor).
   - F5 (Diät) folgt nach V18.539 auf Platz 1.
3. **Workflow-Vorlagen:**
   - Kartenkopf (§4) hinein;
   - Breite ≤ 3;
   - Runden-Deckel je Stufe (§2.6) statt der festen Drei-Runden-Schleife;
   - WIP mit `[skip ci]`;
   - Merge nur bei grüner Zweig-CI.
4. **token-zensus.cjs** nach `artifacts/profiband/werkzeug/`, mit einem nächtlichen Lauf.
5. **VIS-Band:** als R1-Karte mit Prüfer, nach dem Lesen der vier roten Nächte (§2.3).

---

## §3 Die Richtung — die EINE Reihenfolge (11.–31.10.)

### 3.1 Drei Plätze, nie mehr

- **Platz 1 — Integrator und Stamm-Kette, seriell:** K01 → (Integrationen V18.540/541) → K03 → K09 → K10. Diese Karten teilen `_terrainMacroSurfaceY`, den Worker und die Siedlung; sie laufen nie parallel.
- **Platz 2 — Klassen:** K02 → K08 → K06 → K07.
- **Platz 3 — Klassen:** K05 → K13 → K12 → K04 → K11.
- **OMEN:** O1 → O2 → O3 → O4, dazu ABAB je Version und der Beweis-Satz A–C (A1).
- **Auge (Koordinator):** A1 — der Beweis-Satz A–C am neuen main (§5.1), danach die Spieler-Runde je Version.

Zonen-Prüfung der Paarungen:
- K02 (fahr/wasser) neben K05 (werkstatt), K08 (Haus-LOD) neben K13 (kampf), K06 (Kamera-Arm) neben K04 (p2p): je disjunkt.
- K07 (Gang + `_schrittKlangTick`) neben K11 (Glut-Verzeichnis, `_umweltGlutSweep`): verschiedene Methoden derselben Klang-Zone, also seriell mergen.
- K10 startet erst, wenn K11 gemergt ist, denn K11 liefert den Leser der Laternen.

### 3.2 Versions-Fahrplan (was der Spieler sieht)

| Version | Inhalt | Sichtbar im Spiel | ca. |
|---|---|---|---|
| V18.539 | integ-probe ce10dcb6 (waende-ci, render-fehler) + genesis-band + lf-kampf (K01) + Lehre-26-Commit | Der Hieb trifft das Tier unter dem Fadenkreuz; der Pfeil hat die Gestalt der Schmiede. | 12.–13.10. |
| V18.540 | K02 (koerper-bild + wasser-wahrheit), K03 (Prüfbühne), ego-schatten (EINE Ego-Regel), K05 | Der GT steht im Wasser an der Gürtellinie; die Ich-Sicht im Berg zeigt Fels (Auge 11); die Waffe füllt die Vorschau. | 15.–16.10. |
| V18.541 | K08 (S3-Haus + Türblatt), K13 (Kampf-Klasse), K12 (Fahr-Bahn) | Häuser kosten weniger, Türblätter sitzen in der Fassade; ein Hieb in Horizont-Blick trifft den Wolfsrumpf; der Vorschau-GT steht auf fahrbarem Grund, kommt rückwärts frei, Tacho und Motor klingen. | 18.–19.10. |
| V18.542 | K09 (gelaende-core), K06 (Kamera-Leib), K04 (P2P-Tür) | Das Gelände bleibt byte-gleich; die Linse steht nie mehr im Fels oder unter dem Boden; der Mitspieler erscheint nie im Ursprung. | 21.–22.10. |
| V18.543 | K07 (Gang-Gesetz), K11 (Leuchtquellen) | Der Fuß steht beim Gehen, jeder Schritt klingt; Feuer und Fenster leuchten nachts. | 24.–25.10. |
| V18.544 | K10 (Ort auf dem Gelände) | Kein grauer Sockel, die Tür ist zu Fuß erreichbar, der GT fährt durchs Dorf, Laternen leuchten nachts, Studio-Dorf = Welt-Dorf. | 29.–31.10. |

### 3.3 Die offenen Zweige — zuerst, einschmelzen, verwerfen

| Zweig | Kopf | Entscheid |
|---|---|---|
| integ-probe | ce10dcb6 | Basis von V18.539 (render-fehler 6b16691a schon gemergt) |
| welle-m-genesis-band | ee39087f | V18.539 (Auflage: gate:portal-membran nicht doppelt) |
| welle-lf-kampf | 7ccab2f4 | V18.539 (29 Commits); kampf-Gelb aus seiner R4-Prüfung → K13 |
| schau2-koerper-bild | a775157a | Prüfung 2, danach V18.540 (K02) |
| schau2-wasser-wahrheit | c5e8fa44 | Nachbesserung zu Ende, danach V18.540 (K02) |
| pruefbuehne | f25d5808 | ganz nach V18.540 (K03). Kein Split: Weltgrenze und Boot-Rettung (e6b40be4 … f25d5808) sitzen auf den Erbgut-Commits (c9cde24b … 17984bf5). |
| welle-m-ego-schatten | 0097998b | Integrator nach unabhängiger R2-Prüfung, V18.540. In `_applyEgoSicht` gilt EINE Regel: die Ebenen-Regel; das gehaltene Gerät bleibt auf Ebene 0, lfs `_egoVerborgen` (lf anazhRealm.js:96231) fällt. |
| studio-s3-haus | 7e182557 | K08, V18.541; danach S3-Tor als O2 |
| schau2-kamera-laub | 217d3ea9 | geht in K06 auf; die drei x-Skripte (782 Zeilen) erreichen main nie |
| schau2-fahr-bahn | b898406f | die v1-Teile gehen in K12 auf (Platz, Befreiung, Tacho, Klang, Hilfe-Tasten); tmp-fahr-bahn-debug.cjs fällt, seine Hypothese steht in der K12-Übergabe; den Tempo-Teil gibt es nur auf Schöpfer-Wort (S1) |

### 3.4 Nicht in diesen Wochen — offen benannt

- **Welle-0-Shell-Port (r184-Studio-Bühne)** und **translated auf r184:** Sie warten auf Stoff (`_foundryTreeMaterial` :75919) und Himmel (`_ensureSkyEnvironment` :16356) als Modul außerhalb des Stamms. Davor kommt nur die r184-Golden-Sonde (D2).
- **G2 Landformen T1/T2/T5:** Feature-Stopp-Ausweitung, Schöpfer-Wort (§5.2). Dazu die Altwelten (§5.4). Die Zahl für das Wort liefert K09 (Gegenmessung am gebauten Boden).
- **Weitere Audit-Teile:** Welle 2 (Klima/Biom), VB-07 (Holz → Balken), die Wellen 3–5, die 16 Bühnen D1–D12; Gastwelten ohne DoD.
- **H1 Monolith:** erst am Nullpunkt aller Zweige.
- **Auf Schöpfer-Wort (§5.2):** S1 Tempo aus Leistung, S2 steckende Pfeile, S3 Fallschaden, Mauer und Siedlungs-Fluss.
- **Benannte Bild-Befunde mit Ort:**
  - freistehende Türblätter (Auge 05) → K08;
  - „keine Krone steht im Haus" (leben-schau-2/befund.md:223) → K10;
  - Markt ohne Ware und Bewohner (Auge 04) → NACH-V1 laut Auge-Befund, Ausweitung nur auf Schöpfer-Wort;
  - „setze zeit 22:30" versteht die Welt nicht (Auge 12, nur „setze uhrzeit mittag") → offen benannt, Messname „DSL-Zeit-Satz", keine Karte in diesen Wochen, weil er keinen der fünf Schritte bricht (die Uhr ist über das Wort stellbar);
  - die weiße Masse (Auge 08–10) → O4.

### 3.5 Warum Gelände vor Bühne

Die Reihenfolge stützt sich auf gemessene und gelesene Welt-Tatsachen, nicht auf die θ- und Senken-Zahlen der rohen Makro-Fläche:
- **Die Klage ist geometrisch:**
  - Der Studio-Plan ist 2D (`dorfBodenY = 0`, fachwerk.js:234–250).
  - Der Export trägt kein y (fachwerk-core.js:4111–4220).
  - Die Welt setzt jedes Haus auf hMax + 0,5 (:72775) über einen Sockel (:34293): Median 2,72 m, Türen 0 von 2, GT 5,2 m in 8 s (Auge 05).
  - Ein r184-Renderer ändert keinen y-Wert.
- **An `_terrainMacroSurfaceY` laufen drei Ströme zusammen:** das Erbgut der Prüfbühne, die Landformen und der ERDBAU des Plans. Die Höhe lebt dreifach: im Stamm :27273, im voxel-worker :581 und in feld-wgsl. Ohne Kern wächst jeder Term dreifach.
- **Der Export braucht die Höhe im Foundry-Worker,** der nur Manifest-Kerne lädt; das ctx-Muster von `planForestCell` (phyto-core.js:2152) ist dort das Vorbild.
- **Die Bühne in Audit-Form** baut einen dritten Look-Pfad gegen eine schon begründete Entscheidung (synthese §2.2).

### 3.6 Danach-Karten (in dieser Reihenfolge, sobald ein Platz frei ist)

- **D1 — NP-01 Park:**
  - Schnitt: Tunnel und Dach nach z 28,2–31,0; alles ab der Treppe verschiebt sich starr um +5,2 m.
  - Linse gate:ninja-tunnel: statische Schürzen aus parkBoxes und der Kollisionsregel (koerperstudio.js:1885–1898) plus Geister-Lauf; vorher ROT mit Halt 20,95 und Schub 1,85 m.
  - Abnahme: ohne Wandkontakt bis zur Treppe; NP-02 bleibt grün. R1.
- **D2 — r184-Golden-Sonde:** v1 und v3–v6 unter vendor r184 bauen und gegen r128 hashen. Bei Gleichheit lädt der Worker r184 (three-r128 und die 11 Labor-Bibliotheken verlassen ihn); sonst je Kern ein benannter Re-Mint-Akt. R2, 1 Tag.
- **D3 — Szenen-Liste (H9) + ABNAHME-Zeile:**
  - nach K03, auf dem OMEN je Version;
  - 10 Szenen an Prüfbühnen-Stationen, Tiere gehalten, Bild + Luminanz/Kanten/Δ gegen main;
  - `scripts/lib/abnahme-urteil.cjs` mit Selbsttest (der vakuöse und der null-Fall sind ROT).
  - Linse vorher ROT: Belichtung −1 EV ergibt 10/10 ROT. R0 mit Vakuum-Prüfer.
- **D4 — `npm run puls` mit Zone→Gate-Karte:** nur, wenn eine Karte eine Wand verfehlt hat, die ihr Puls hätte fahren müssen.

---

## §4 Die Karten

13 Karten statt 12: K13 hebt die benannten Kampf-Reste (kampf-Gelb, Horizont) aus dem stillen Fall, K12 die v1-Teile aus fahr-bahn.
Die OMEN-Pakete stehen als O1–O4 in §4.2.

### Kartenkopf (steht vor JEDER Karte im Arbeiter-Prompt)

1. „Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend." Lies CLAUDE.md aus DEINEM Worktree mit Read; der eingespielte Stand kann älter sein. Du läufst als `champion`.
2. Worktree, Branch und Ports setzt der Koordinator. Das GPU-Schloss (`mkdir %TEMP%\claude\gpu-schloss` + besitzer.txt) gilt nur um den einzelnen echten Lauf; gelöst wird es nur, wenn besitzer.txt deinen Namen trägt. Zeit (ms) misst nur der OMEN; du zählst.
3. **Ablauf:** Linse ROT zeigen (Exit-Zeile, Täter beim Namen) → Schnitt → Puls → Linse GRÜN → playtest:fast → Bild der Karten-Szene aus dem Ausgabe-Pfad (`scripts/lib/ausgabe-aufnahme.cjs`, Bühne `__buehne`) → letzter Push OHNE `[skip ci]` → enden. Auf die CI wartest du nicht; sie liest der Koordinator, gemergt wird nur bei grüner Zweig-CI.
4. **Re-Mint:** Ändert dein Schnitt ein eingefrorenes Buch (recipes.json, Kern-PRESETS, Mesh-Goldens), ist das der deklarierte Akt deiner Karte (§2.4a): Wände vorher grün, nachher ROT beim Namen, Re-Mint im selben Commit, die Pfadliste des Diffs im Commit.
5. **WIP** alle 45 min und nach jedem grünen Teilschritt: Betreff „WIP <Karte>: … [skip ci]", Rumpf = Übergabe ≤ 15 Zeilen. Bei etwa 250 k Kontext: WIP + Übergabe in die Rückgabe, enden.
6. **Verboten:** `git stash`; spawn_task und Aufgaben-Chips (was offen bleibt, gehört in die Rückgabe); `x-*`/`tmp-*` committen; Siegel-Wörter; SendMessage an Workflow-Agenten.
7. Jede Zahl steht mit Rohdatei-Pfad, jedes „grün" mit `EXIT=$?`. Eine neue Linse geht in eine bestehende Familie, mit Selbsttest, ≤ 3 min CI (Laufzeit vorher/nachher im Commit), und nennt ihren Konsum-Leser.
8. Der Commit-Rumpf hat drei Sätze (geschnitten · gemessen · offen), höchstens 600 Zeichen. Die Rückgabe enthält: Geschnitten · Gemessen (Zahl) · Pflicht-OFFEN Rest · Status ZWISCHENSTAND + Übergabe.
9. Findet dein Prüfer eine weitere Ecke derselben Klasse, ist das deine nächste Runde (§2.6). Ist der Runden-Deckel erreicht, bleibt die Karte offen, und der Rest steht mit Messnamen in der Rückgabe.

### 4.1 Karten auf dieser Maschine

### K01 — Integration V18.539: der Hieb trifft (KA-01 a–d)
- **Prio** 1 · **Risiko** R2 · **Platz** 1 (Integrator) · **v1-Schritt** 5 (benutzen) · **Kosten-Soll** ≤ 20 M
- **Basis:** integ-probe ce10dcb6 (V18.538 + waende-ci + render-fehler 6b16691a + Wand-Heilung ce10dcb6)
- **Ziel:** V18.539 = ce10dcb6 + welle-m-genesis-band ee39087f + welle-lf-kampf 7ccab2f4 + der Lehre-26-Commit (§2.11) auf main. Der Spieler sieht: der Hieb trifft das Tier unter dem Fadenkreuz.
- **Engstelle:**
  - main anazhRealm.js:81159 `_playerAttackCreature(_creature)` verwirft das Ziel;
  - lf heilt (a) und (b) in c138bd30, (c) in c138bd30 + c8183798, (d) in 664f205f; 972127d8 trägt die Treffer-Energie;
  - Konfliktzone `_applyEgoSicht`: ego-schatten bleibt draußen.
- **Linse vorher ROT:** die Zweig-Linsen T16–T18 in gate:kampf-gefuehl (Energie, Reichweite, Pose; je vorher ROT auf dem Zweig) am Kopf ce10dcb6 nach dem Merge-Versuch ohne lf. Referenz: Runner KA-01_waffen-pfad 2/12. „Ziel verworfen" misst erst die Klick-Pfad-Matrix in K13 (offen benannt, kein K01-Beweis).
- **Abnahme:**
  - Zweig-CI grün je Merge;
  - voller Playtest „Alle Invarianten OK" je Merge;
  - CI 5/5 am Versions-Commit;
  - OMEN-ABAB gegen 66005ca6 „nicht langsamer" (Frame p50/p95 unter Regler voll; CPU-Takt p95 frei ≤ 10,9 ms);
  - Auflage genesis-band: gate:portal-membran nicht doppelt;
  - Bild aus dem Ausgabe-Pfad: 3rd, Klinge im Wolf.
- **Grenzen:** nur Merge-Auflösungen, kein neuer Spiel-Code. ego-schatten und kamera-laub nicht. Die kampf-Gelb-Liste geht unverändert an K13.

### K02 — Wasser-Fahrt und Körper-Bild zu Ende (FZ-01, Auge 11)
- **Prio** 1 · **Risiko** R2, tiefe Klasse (3 Runden) · **Platz** 2 · **v1-Schritt** 2 und 5 · **Kosten-Soll** ≤ 30 M
- **Basis:** zuerst schau2-koerper-bild a775157a (Prüfung 2), danach schau2-wasser-wahrheit c5e8fa44, beide (Basis 7dd944e6) auf V18.539 gehoben.
- **Ziel:** Der GT verliert ab der Ansaugung den Vortrieb und steht an der Gürtellinie still. Die Ich-Sicht im Berg zeigt Fels statt grauer Luft.
- **Engstelle:**
  - vehicle-core.js:2831 fahrKraefte ohne Wasser-Term;
  - anazhRealm.js:94926 reicht keine Tiefe;
  - `_fahrTiefe(fz) = _koerperWasser(fz.x, fz.z, fz.y)` (:35799) über die Naht `_werkBoden` (9b6fa181).
- **Linse vorher ROT:** gate:werk-im-wasser F (Furt −935/−1070, Zweig) am Kopf V18.539: 11,9 m/s 1 s nach dem Eintauchen, Täter „fahrKraefte ohne Wasser-Term". Die Probe R-FZ-01 liest `_koerperWasser` am Fahr-Zustand statt `_atlasWaterLevelAt(x,z,−Infinity)` (:33728).
- **Abnahme:**
  - Vortrieb 0 ab der Ansaugung (GT yBelt 0,72 m);
  - v ≤ 0,5 m/s spätestens 3 s, nachdem das Wasser die Ansaugung erreicht;
  - die Unterkante sinkt nie unter yRoof; die Verfolger-Kamera ist 0 Frames unter dem Spiegel;
  - Byte-Beweis vehicle-core erneut auf V18.539 (Zweig: 390 185 Werte, 0 abweichend), recipes.json unverändert (FAHR steht nicht im Buch) oder ein deklarierter Re-Mint;
  - trockene Höhlen-Böden 0 (vorher 1 804);
  - Aussteigen in 1,5 m Wasser führt zum Schwimmen;
  - Seitenbild: Wagen bis zur Gürtellinie im Wasser; koerper-bild-Linse grün; Bild der Ich-Sicht im Berg (Stelle auge/1010/11).
- **Grenzen:** kein Neubau. „Kein Abschlepp-Weg" bleibt offen benannt. Die Rest-Nachbesserung kommt aus dem letzten Prüfbefund des Zweigs.

### K03 — Prüfbühne zu Ende + die Hindernis-Saat S4
- **Prio** 1 · **Risiko** R2, tiefe Klasse (3 Runden) · **Platz** 1 · **v1-Schritt** Prüfgrund für 2/5 · **Kosten-Soll** ≤ 30 M
- **Basis:** pruefbuehne f25d5808 (Basis 7dd944e6, 16 Commits), ganz auf V18.539 gehoben.
- **Ziel:** eine geborene Welt aus dem Welt-Motor mit den Stationen s0-atrium, s2-hang30, s5-furt, s5-kolk und meer, der EINEN Tür `_weltBetreten` und der Rettungs-Kette — dazu die Hindernis-Station S4 als Saat (artifacts/profiband/pruefbuehne/plan.md:117).
- **Engstelle:**
  - der Erbgut-Term-Auswerter in `_terrainMacroSurfaceY` (die Empfänger-Wand f25d5808 anazhRealm.js:27374 lässt nur wildnis, insel, rampe und bucht durch);
  - `_weltBetreten`;
  - die Snapshot-Tür für architectures und Baupläne (welt.json `architectures: []`).
- **Linse vorher ROT:**
  - gate:pruefbuehne (106d19d4: 18 von 20 Nexus-Würfen), gate:weltgrenze (67e4d76b: 11 von 13 Wegen), gate:boot-rettung (fc58098f) — je vorher ROT bewiesen; am gehobenen Kopf erneut;
  - neu: die S4-Probe. An 0|−170 stehen 0 von 6 Körpern (Würfel 2 m, Säule 0,6 × 3 m, Mauer 10 × 2 × 0,4 m, Gasse 1,2 m, Hausrumpf 45°, Engpass 2 m). Täter „welt.json trägt keine Saat".
- **Schnitt S4:** die Saat als Snapshot-Daten (architectures + Baupläne, Teile box/cylinder × stein) über die normale Snapshot-Tür.
  - Trägt die Tür sie nicht (der Nexus-Halt 617e2235 oder die Feld-Wand hält sie fest), ist der Saat-Code im Main der benannte Schnitt der Karte; der Prüfer prüft ihn.
  - **Nie eine neue Erbgut-Term-Art** (die bräuchte Main, Worker und WGSL).
- **Abnahme:**
  - gate:worker-dichte (4f5c018f) maxDiff 0 für LOD 0–3; diag-worker-watersheet maxDiff 0;
  - Wildnis byte-gleich (SHA-256 der Makro-Höhe 64×64 vor/nach, Verfahren c9cde24b);
  - kein Nexus-Wurf auf der Bühne;
  - gate:boot-rettung 9 Speicher-Formen grün;
  - die 6 S4-Körper je ≤ 0,1 m an ihrer Spec;
  - je Station ein Bild aus dem Ausgabe-Pfad.
- **Grenzen:**
  - keine Feuerstelle als Station (K11 setzt ihr Feuer selbst);
  - kein Gelände-Kern (K09);
  - kein Runner-Code;
  - die ABNAHME-Zeile kommt in D3;
  - die Band-Messorte bleiben in spec/profiband/haushalt.json.

### K04 — EINE P2P-Tür + Mehrspieler-Wand in der CI (MP-01, Platzhalter)
- **Prio** 3 · **Risiko** R2 (P2P) · **Platz** 3 · **v1-Schritt** 5 (teilen) · **Kosten-Soll** ≤ 20 M; Linse ≤ 3 min CI; CPU-Takt unverändert (OMEN)
- **Basis:** main V18.541 (nach K03, denn pruefbuehne verlegt den localStorage-Stempel im Gast-Import :5611)
- **Ziel:**
  - Der Mitspieler erscheint nie im Weltursprung.
  - Die Tür trägt die Absicht selbst, also läuft der Rejoin auch nach einem gescheiterten Erst-Aufbau.
  - Eine Mehrspieler-Wand läuft in der CI.
- **Engstelle:**
  - `_p2pEnsurePeerEntry` :7488–7533 legt das Mesh bei welcome/peer-join (:7051, :7093) sichtbar bei 0/0/0 an;
  - `initP2PSync` :5622 setzt `p2p.enabled` nie; `_p2pScheduleReconnect` :5781 und der close-Zweig :5690 planen nur bei `enabled`;
  - die Hand-Setzer: Knopf :8496, Boot :92363.
- **Schnitt:**
  - Die Absicht gehört an den EINGANG der Tür: `initP2PSync` setzt `p2p.enabled = true` als erste Zeile, nicht erst bei Erfolg. Der Transport bleibt `connected` (:5671).
  - Aus geht es nur über den Knopf (`enabled = false` + `shutdownP2PSync`). Der Raumwechsel ruft shutdown + init, und die Absicht bleibt.
  - Die Hand-Setzer vor dem Aufruf fallen (Knopf, Boot, die drei Smokes); persistiert wird weiter nur über `p2pPersist` (:5416) und den Gast-Import.
  - Das Peer-Mesh startet `visible = false`; die erste Position (`_p2pMsgPos` oder Lockstep-Saat) macht es sichtbar.
- **Linse vorher ROT:** gate:mp-sync mit signaling-server und zwei echten Seiten über den **Knopf** (`#p2p`-Toggle) und über den **Boot** (host/guest); nie der nackte Aufruf als Spielpfad. B bewegt sich über die Eingabe (`_stepCharacter`).
  - (a) Platzhalter-Frames am Ursprung nach peer-join; erwartet > 0, Täter `_p2pEnsurePeerEntry`.
  - (b) Tür-Probe: Server beim ersten Aufbau 3 s aus, dann an; der nackte Aufruf plant keinen Rejoin, Täter `_p2pScheduleReconnect` :5781 liest `enabled`, das `initP2PSync` nie setzt.
  - Zeigt (a) 0 Frames, steht das mit Zahl im Commit, und der Sichtbarkeits-Schnitt fällt offen.
  - Selbsttest: die alte Tür wieder eingesetzt ergibt (b) ROT.
- **Abnahme:**
  - 0 Frames mit dem Peer am Ursprung;
  - Abstand ±0,3 m nach Eingabe-Bewegung;
  - Latenz ≤ 150 ms lokal (in der CI nur berichtet);
  - Rejoin ≤ 31 s nach Server-Ausfall, auch beim nackten Aufruf;
  - ein zweiter Knopf-Klick während des Aufbaus startet kein zweites Init (der Knopf liest „an");
  - Absenz der Hand-Setzer;
  - die Lockstep-Smokes grün;
  - Wand in der CI ≤ 3 min;
  - Bild: Tab 1 sieht Tab 2 an dessen Ort.
- **Grenzen:** Empfang (`_p2pMsgPos` :7214–7258) und Relay bleiben unberührt; kein Latenz-Ping-Protokoll; der verdeckte Tab (rAF ruht, Purge nach 10 s, :8054) bleibt offen benannt.

### K05 — Werkstatt-Rahmen aus dem Kamerawinkel (WS-01)
- **Prio** 2 · **Risiko** R1 · **Platz** 3 · **v1-Schritt** 3 (bauen) · **Kosten-Soll** ≤ 10 M; Probe ≤ 1 min CI
- **Basis:** main V18.539
- **Ziel:** Jede Waffe und jeder Bauplan füllt die Vorschau.
- **Engstelle:** anazhRealm.js:86228 `Math.max(3, maxDim * 2.2)`; :86543 absolute Zoom-Grenze 1,5 m; FOV 45° (:85439). Bauplan- und Rezept-Vorschau teilen diese Stelle.
- **Schnitt:**
  - dist = R / sin(½·min(vFOV, hFOV)) / 0,65, mit R = Radius der Hüllkugel und dem Seitenverhältnis vom Canvas;
  - der 3-m-Mindestwert fällt, es bleibt dist ≥ 4·near;
  - Zoom-Grenzen 0,5·R bis 30·R.
- **Linse vorher ROT:** Probe in gate:v1-pfad V-D3. Für alle Rezepte und Baupläne muss die projizierte Box3 (größere Kante geteilt durch die Bildkante) in [0,5; 0,9] liegen. Vorher Min 0,059 (Runner WS-01, reproduzierbar), Täter „`_workshopCenterPreviewOn` 3-m-Mindestabstand".
- **Abnahme:** alle 21 Waffen ≥ 0,5, keine > 0,9; die Sichtbarkeit in V-D3 bleibt ≥ 0,99; Bild: Beil und Kriegsbogen füllen die Vorschau.
- **Grenzen:** Die Lage der Waffe (flach statt zur Kamera gedreht) bleibt offen benannt.

### K06 — Kamera-Leib (WE-05 + NP-03 + FZ-07)
- **Prio** 2 · **Risiko** R2 (Re-Mint koerper-core) · **Platz** 2 · **v1-Schritt** 2 · **Kosten-Soll** ≤ 20 M; Linse ≤ 3 min CI; ≤ 5 Strahlen je Frame (Zähler); CPU-Takt p95 im OMEN-ABAB nicht höher
- **Basis:** schau2-kamera-laub 217d3ea9 (WIP, ungeprüft, Basis 7dd944e6). Zuerst prüft ein unabhängiger Prüfer die WIP (trägt die Nah-Kugel der Durchsicht? Läuft gate:kamera-laub mit Selbsttest?). Danach wird sie auf V18.541 gehoben.
- **Ziel:** Die Linse steht nie im Fels, nie unter dem sichtbaren Boden und nie hinter einer Park-Box. Laub bleibt Durchsicht.
- **Engstelle:**
  - anazhRealm.js:95768–95825 `_loopCamera`: Strahl ohne Radius, Rückzug 0,85 (:95787), Boden-Deckel Füße − 0,2 m (:95756);
  - koerperstudio.js:1926–1927 camG.
- **Schnitt:**
  - Kamera-Kugel r 0,3 m. `_fieldRaycast` bekommt die Option `radius`: Boxen und OBB werden um r aufgeblasen, das Gelände prüfen Mittelstrahl + 4 Eckstrahlen.
  - Der Arm hält absolut r vor dem Treffer.
  - Der Boden-Deckel liest `_chunkSurfaceAt` + r.
  - Das Studio prüft die Strecke Blickziel → Kamera gegen parkBoxes; camG fällt.
  - EINE additive Zeile koerper-core `fx.bewegung.kamera {armRadiusM 0.3, armRuhe}`; KAMERA_ARM_RUHE (:103861) fällt.
- **Re-Mint (deklariert):** recipes.json beim Menschen bekommt `fx.bewegung.kamera` (gate:asset-contract), die PRESETS von koerper-core einen neuen Abdruck (gate:daten-contract). Der Diff ist genau dieser Schlüssel.
- **Linse vorher ROT:** die korrigierte R-CAM in diag-kamera-laub.
  - Gemessen wird gegen die exakte Gestalt (OBB wie `_segmentAABB`, ohne Pflanzen-Box), mit `durchPflanzen` wie im Spiel, Ursprung Blickziel T, Boden `_chunkSurfaceAt`.
  - 50 feste Posen: 40 an der Mess-Wiese (Bäume, Fels, Häuser) und 10 an s2-hang30. **Keine Abhängigkeit von S4.**
  - Täter je Pose beim Namen.
  - Erwartet ROT mindestens in unterBoden (Runner w1: 9/50); NP-03 9/48.
- **Abnahme:**
  - 0/50 zu Fuß, 0/50 im Verfolger-Ritt (FZ-07);
  - NP-03 0/48, NP-02 grün;
  - Kamera-Sprünge > 2 m nicht häufiger als vorher;
  - Bild-Paare pose-00/pose-01 und NP-03 pose-14 aus dem Ausgabe-Pfad;
  - diag-kamera-laub (630 Z.) + lib/kamera-nah.cjs (480 Z.) ≤ 3 min CI.
- **Grenzen:** Die x-Skripte erreichen main nie; der Verfolger fällt mit.

### K07 — EIN Gang-Gesetz für Zwei- und Vierbeiner (AN-01 + TON-01 + AN-02)
- **Prio** 2 · **Risiko** R3 (zwei Kerne + Stamm + Studio; 3 Runden) · **Platz** 2 · **v1-Schritt** 2 · **Kosten-Soll** ≤ 35 M; CPU-Takt p95 im OMEN-ABAB ≤ +0,1 ms
- **Basis:** main V18.542
- **Ziel:** Der Fuß steht in der Standphase, jeder Schritt klingt, Tier und Mensch gehen nach EINEM Gesetz.
- **Engstelle:**
  - anazhRealm.js:17234–17235 `_gaitSchrittLen` (kalib × Bein ≈ 3,4 m) und koerper-core.js:560 `schritt.kalib 4.0`;
  - tetrapoda GANG_GESETZ gangSchritt/gangFuss (laut Prüfer Z. 1300–1350);
  - koerperstudio.js:1833–1837 (drittes Modell);
  - der Peer-Zweibeiner :7788–7798;
  - `_schrittKlangTick` :10362.
- **Soll-Bild vorab (Lehre 18):** 1,34 m/s → etwa 1,8 Schritte/s, Schrittweite 0,6–0,7 m; 6 m/s → etwa 3 Schritte/s; Tastgrad Gehen etwa 0,6, Laufen etwa 0,35. Das Grundtempo 6 m/s bleibt (offen benannt: übermenschlich).
- **Schnitt:**
  - gangSchritt/gangFuss bekommen die Gesetzes-Zeile als optionalen Parameter (die tetrapoda-PRESETS bleiben byte-gleich).
  - Die Zweibeiner-Zeile kommt in koerper-core `fx.bewegung.gang`; `_gaitTick` liest Λ(v, Hüfthöhe).
  - kalib fällt physisch.
  - Die Tiere bekommen den weltfesten Fuß-Anker.
  - Das Körperstudio liest dasselbe Gesetz.
  - Der Peer bekommt Bein-IK auf das Ziel des Gesetzes.
- **Re-Mint (deklariert):** recipes.json beim Menschen: `schritt.kalib` fällt, `fx.bewegung.gang` kommt (gate:asset-contract). Neuer koerper-Abdruck (gate:daten-contract). tetrapoda-Abdruck unverändert (Beweis).
- **Linse vorher ROT:** gate:tier-gang, erweitert auf den Spieler-Leib.
  - Derselbe Aufsetz-Punkt, EINE Schwelle; Modus pfad, W 3 s, Shift 3 s.
  - Dazu eine Kadenz-Probe und der Zähler `state._schrittKlang.schritte` gegen 2·v·t/Λ.
  - Vorher: 0,34 Schritte/s und 2 Töne in 6 s (aus :17210–17235 gerechnet, Täter `_gaitSchrittLen` kalib); Runner-Referenz 130,5/132,3 %; Tiere 9–23 % (TI-07).
  - Selbsttest: Gang-Gesetz gestubbt ergibt ROT.
- **Abnahme:**
  - Gleiten < 5 % beim Gehen und Laufen für Mensch, Wolf, Fuchs und Bär (die Schwelle von gate:tier-gang sinkt von 0,2 auf 0,05, als Ratsche);
  - Kadenz bei 1,15 m/s ≥ 1,5 Schritte/s;
  - Töne = Schrittfrequenz × Zeit ± 15 % bei 1,15 und 5,16 m/s;
  - 0 Lock-Löser im Stand-Fenster;
  - Absenz `kalib` = 0 außerhalb der Re-Mint-Spur;
  - Bildfolge aus 6 Bildern in festen Sim-Schritten an s0-atrium.
- **Grenzen:** Material-Ton je Boden nur als Probe; kein Runner-Zwilling TI-07.

### K08 — S3-Haus zu Ende + Türblatt (Pflicht-OFFEN E; Voraussetzung für K10)
- **Prio** 2 · **Risiko** R2 (Kern-Akt fachwerk v6) · **Platz** 2 · **v1-Schritt** FPS-Boden + 2 · **Kosten-Soll** ≤ 20 M
- **Basis:** studio-s3-haus 7e182557 (Basis 736e1e8f), auf V18.540 gehoben
- **Ziel:** Der Fernkörper des Hauses kommt aus dem Gesetzbuch (NUR-WURF-Stufe 3, ee37daf7); Host-Leser (26916013) und Dorf-Linse werden unabhängig geprüft. Neu: das Türblatt sitzt in der Fassade (Auge 05).
- **Engstelle:**
  - fachwerk-core Haus-LOD-Kette und Wurf-Satz `bauWurf`;
  - Messort dorf in spec/profiband/haushalt.json; ratsche-dorf.json;
  - für das Türblatt die Stelle, die die Probe benennt (Studio-Mesh oder Welt-Satz).
- **Linse vorher ROT:**
  - gate:haus-fern am Kopf main: L0 wirft im Median 74 344 Dreiecke je Haus, L2 wirft nichts;
  - Türblatt-Probe: Abstand Türblatt ↔ Fassaden-Ebene je Tür am Mess-Dorf für L0/L1/L2, Soll ≤ 0,05 m, vorher > 0 (Auge 05, zu beziffern), Täter beim Namen.
- **Abnahme (Zahlen aus ee37daf7 nachmessen):**
  - Stufe 3 wirft 42–96 Dreiecke (Median 60) in 1 Draw;
  - Mess-Wiese 485k–489k → 460k–471k Dreiecke;
  - Dorf 102 → 93 Befehle; bau 24 Befehle / 81k → 15 / 50k; Pipelines gleich;
  - v6-Goldens auch in der Linux-CI byte-gleich (DIVERGENZ-BYTES leer);
  - der Prüfer urteilt über die offen gesenkte Schwelle (Wurf ≥ 0,87 statt 0,92, Umriss ≥ 0,84 statt 0,92) gegen das Bild;
  - Türblatt ≤ 0,05 m an jeder Tür, oder der Täter ist der Welt-Satz und geht benannt an K10.
- **Grenzen:** S3-Tor ist O2. Kein Ortgang-Versuch über den Commit hinaus.

### K09 — gelaende-core: das Gelände bekommt sein Gesetzbuch (G1) + Gegenmessung am gebauten Boden
- **Prio** 1 · **Risiko** R2 (Byte-Beweis trägt) · **Platz** 1 · **v1-Schritt** Wurzel für 2/3 · **Kosten-Soll** ≤ 25 M; Boot-Zeit ±5 % und Chunk-Bau-Takt ±5 % (OMEN)
- **Basis:** main V18.541 (mit dem Erbgut aus K03)
- **Ziel:** EINE Quelle der Höhe für Stamm, Worker und Studio; der Worker-Spiegel stirbt. Dazu die Zahl, die G2 und die Audit-Abnahme der Welle F trägt.
- **Engstelle:**
  - anazhRealm.js:27273–27450 `_terrainMacroSurfaceY`;
  - voxel-worker.js:581 `terrainMacroSurfaceY` (Marker „bit-identisch" an :590/:620/:649);
  - feld-wgsl.js:47 WGSL_MAKRO (bleibt Seh-Spiegel, Eingaben aus dem Kern).
- **Schnitt:**
  - `gelaende-core.js` als reine Funktion f(x, z, saat, terme) → h und Masken, mit der Erbgut-Normalform als Eingang;
  - cores.manifest.json 8 → 9 Einträge und GESETZ_KERNE `'gelaende'`;
  - Stamm und voxel-worker laden EINEN Kern mit `?v=`; die Worker-Kopie samt Hilfen fällt physisch.
  - gate:studio-vertrag muss den neuen Eintrag tragen (Vertrag v1.2) oder ihn als reinen Funktions-Kern deklarieren; das prüft der erste Schritt.
- **Linse vorher ROT:** Absenz-Grep auf die Worker-Kopie (3 Marker an der Makro-Höhe; Manifest ohne Gelände-Kern).
- **Gegenmessung (Probe, keine Wand):** am gebauten Boden (`_chunkSurfaceAt`) der Welt warme-hain mit ihrem echten Seed und an der Prüfbühnen-Wildnis messen: θ, Senken je km², sanfte 1-km²-Fenster (Hang ≤ 8 %, Höhenspanne ≤ 3 m), neben der rohen Makro-Zahl. Rohdatei nach `artifacts/profiband/grund/`.
- **Abnahme:**
  - gate:worker-dichte maxDiff 0 (LOD 0–3); diag-worker-watersheet maxDiff 0;
  - SHA-256 der Makro-Höhe 64×64 vorher = nachher für drei Welt-Saaten und das Prüfbühnen-Erbgut;
  - gate:dritter-spiegel grün; alle Goldens unverändert;
  - Wiese und Genesis im Band unverändert (OMEN);
  - die Gegenmessung steht mit Zahl in der Rückgabe.
- **Grenzen:** keine Formänderung (G2 auf Schöpfer-Wort), kein ERDBAU (K10). Stamm seriell, je Schnitt `node --check` + eslint.

### K10 — Der Ort auf dem Gelände: Plan v2 + ERDBAU (G3)
- **Prio** 1 · **Risiko** R3 (3 Runden) · **Platz** 1 · **v1-Schritt** 2, 3, 5 · **Kosten-Soll** ≤ 35 M
- **Budget (Lehre 18, vorab):**
  - Dorf-Messort ≤ 93 Befehle (Stand nach K08), Dreiecke ≤ Stand nach K08 + 5 %;
  - Chunk-Bau-Takt p95 ≤ +10 % und Plan-Export im Worker ≤ 50 ms je Ort (OMEN);
  - Wiese und Genesis nicht schlechter.
- **Basis:** main nach K08, K09 und K11
- **Ziel:** Das Fachwerk-Studio plant das Dorf in 2.5D auf derselben Gelände-Funktion; exportSettlement liefert EINEN Plan mit Höhe, Wegen und Laternen; die Welt importiert. Sockel, hMax-Suche und Ersatz-Orte fallen.
- **Engstelle:**
  - fachwerk-core.js:4111 exportSettlement (kein y; :4198–4211 streicht Mauer, Laternen, Fluss und Brücken); :2329 dorfLayout ohne h(p); :2122 SIEDLUNG;
  - fachwerk.js:234–250 `dorfBodenY = 0`;
  - anazhRealm.js:72692 `_spawnSettlementSlot`, :72775 wy = hMax + 0,5, :34293 `_archFundamentBox`, :72935 `_siedlungsAnker` (Kamerakegel), :73237 `_autoSettlementSiteOk`.
- **Soll-Bild vorab:** das Studio-Dorf auf Weltgrund an einer Hang-Zelle; ein Spike mit echtem Renderer, nah und fern.
- **Schnitt:**
  - exportSettlement rechnet an der Welt-Zelle über gelaende-core (ctx-Muster wie `planForestCell`, phyto-core.js:2152).
  - Plan v2 trägt: Plattform- und Trassen-Splats mit absolutem y; einen Wege-Graph mit Gradiente und Brücken-Etikett, wo der Weg Welt-Wasser kreuzt; je Slot den Hang-Typ (Plattform / Hanghaus / Stelzen; terrasse und pilotis gibt es schon); `laternen[]` (der Leser ist K11).
  - gelaende-core wertet die Splats als ERDBAU-Term aus.
  - Es fallen `_archFundamentBox`, der Podest-Pool, die hMax-Suche, die Ersatz-Orte und fundamentMaxDh; der Deko-Fluss des Labs fällt; Mauer und Siedlungs-Fluss bleiben gestrichen (§5.2).
  - Die Streu-Bäume halten die Plan-Flächen frei („keine Krone steht im Haus").
- **Re-Mint (deklariert):** fachwerk-core v6 (Mesh-Goldens gate:fachwerk-contract, recipes.json falls SIEDLUNG im Buch steht).
- **Linse vorher ROT:** gate:settlement erweitert.
  - Sockel-Median 2,72 m; Türen erreichbar 0/2; GT auf dem Dorfweg 5,2 m in 8 s (auge/1010/05);
  - Ersatz-Versätze > 0; Plan-Hash Studio ≠ Welt;
  - Kronen in Haus-Grundrissen > 0 (zu beziffern);
  - Dorf-Lichter nachts 0 (Auge 12).
- **Abnahme:**
  - Sockel 0, Absenz `_archFundamentBox` = 0;
  - alle Türen zu Fuß erreichbar (Stufe ≤ 0,4 m);
  - GT 8 s Vollgas ≥ 60 m auf dem Dorfweg;
  - Ersatz-Versätze 0; Plan-Hash Studio = Welt;
  - 0 Kronen in Grundrissen;
  - Dorf-Lichter nachts = Laternenzahl des Plans;
  - Bild-Paar aus dem Ausgabe-Pfad an der Stelle von Auge 03/05 (Tag und Nacht);
  - das Budget oben;
  - Altwelten: die Linse zählt Spieler-Bauten in ERDBAU-Flächen. Ist die Zahl > 0, gibt es keinen Merge, bevor der Schöpfer §5.4 entschieden hat.
- **Grenzen:** keine Landformen (G2), keine Mauer, kein Siedlungs-Fluss, kein Markt-Inhalt.

### K11 — EIN Leuchtquellen-Gesetz: Feuer, Glut, Portal, Fenster (WE-16)
- **Prio** 2 · **Risiko** R2 (Render-Kosten + Re-Mint) · **Platz** 3 · **v1-Schritt** 2 (sehen bei Nacht) · **Kosten-Soll** ≤ 20 M; gpu-bank Δ ≤ +1,0 ms an Wiese (Tag) und Dorf (Nacht) im OMEN-ABAB, sonst Pool 2 statt 4 (offen benannt); Programme und Pipelines nach dem Boot konstant (werkbank zaehlen)
- **Basis:** main V18.542
- **Ziel:** Brennende Glut und Feuerstellen beleuchten nachts ihre Umgebung, auch bei „Klang: AUS". Fenster glühen nach dem Tageszeit-Gesetz. Der Leser für die Laternen aus K10 steht.
- **Engstelle:**
  - anazhRealm.js:52408–52449 (`_tickPortalLicht`, einziges PointLight :52429);
  - :10011 `_umweltGlutSweep` (Glut-Wissen nur im Klang-Takt :9952); :60511 glutbrunnen; `_blockerNamen` :34613;
  - fachwerk-core.js:3383 ff. Feuerstelle und :4277 `ZEIT_VIS host "none"` („fire + glas glut stay Lab-local"); fachwerk.js:605 Lab-Licht (0xff7a35, 1,6, 9, 2).
- **Schnitt:**
  - EIN Emitter-Datum je Quelle aus dem Kern (Farbe als sRGB-Absicht, Lichtstrom, Reichweite, Zeitplan): eine additive Zeile `fx.licht` an der Ausstattung feuerstelle; das Lab-Literal fachwerk.js:605 liest sie; ZEIT_VIS wird host-konsumiert für Feuer- und Fensterglut.
  - EIN Verzeichnis: `_blockerNamen` nennt „glut" für jeden Eintrag mit `_glutFlaeche > 0`.
  - EIN Punktlicht-Pool mit fester Zahl ab Boot (N = 4, kein Programm-Neubau beim Wechsel) an den nächsten Quellen. Intensität ∝ Fläche × Flackern 6–10 Hz aus der Wind-Uhr; castShadow false.
  - Das Portal-Licht wird Bürger des Pools; es bleibt genau 1 Konstruktions-Stelle für Punktlichter.
  - Der Klang liest das Verzeichnis, der Rundlauf-Sweep fällt.
  - Laternen lesen dasselbe Emitter-Datum über `laternen[]` des Plans (die Quelle liefert K10).
- **Re-Mint (deklariert):** recipes.json, Ausstattung feuerstelle `fx.licht` (gate:asset-contract); Mesh-Goldens fachwerk unverändert (Beweis).
- **Linse vorher ROT:** Probe auf eingefrorener Nachtbühne (Tageszeit, Wetter, Belichtung eingeschwungen; Lehre 17) an s0-atrium. Die Feuerstelle setzt die Linse selbst über den Spiel-Pfad (`spawn_studio`/DSL „feuerstelle"). Dazu eine Variante „Klang aus".
  - Vorher: 0 Punktlichter ≤ 10 m (Täter „kein Licht-Leser der Glut", :52429 einzige Konstruktion); Luminanz aus 2 m eigene Zahl.
  - Die Runner-Zahl 0,017 ist keine Referenz.
- **Abnahme:**
  - Luminanz aus 2 m ≥ 0,15 und ≥ 1 Punktlicht ≤ 10 m, auch bei Klang aus;
  - die Figur 2,3 m neben dem Feuer sichtbar beleuchtet (Bild);
  - Fenster am Mess-Dorf nachts emissiv, am Tag nicht;
  - gate:klang-zensus grün;
  - die Kosten oben.
- **Grenzen:** keine Funken und kein Rauch (SI-05); keine Mauer.

### K12 — Fahr-Bahn: Platz, Befreiung, Tacho, Klang (Schau-2 #6, Auge 06; die v1-Teile aus b898406f)
- **Prio** 2 · **Risiko** R2 (Re-Mint klang-core, Byte-Beweis vehicle-core) · **Platz** 3 · **v1-Schritt** 5 (benutzen) · **Kosten-Soll** ≤ 20 M; diag-fahr-bahn als Probe ≤ 3 min CI; CPU-Takt p95 im OMEN-ABAB nicht höher
- **Basis:** schau2-fahr-bahn b898406f (WIP, ungeprüft, Basis 7dd944e6), auf main nach K02 gehoben
- **Ziel:** Der Vorschau-GT steht auf fahrbarem Grund, der Wagen kommt nach einem Stoß und rückwärts frei, Tacho und Fahr-Klang laufen.
- **Engstelle und Inhalt, alles benannt:**
  - vehicle-core `fahrPlatz` + `FAHR.platz`, `rueckAntrieb` 0,4 → 1, `lowF` in fahrKraefte (Byte-Beweis + Begründung; ändert auch die Probefahrt);
  - im Stamm `_fahrPlatzSuche`, `_fahrPlatzFrei`, `_fahrStandFrei`, `_fahrGelaendeWand`, `_fahrHuelleBau`, `_fahrAnzeige` (Tacho), `_fahrTastenZeile` + `FAHR_TASTEN`, `_fahrtKlangTick`;
  - klang-core FAHRT (+133, additiv); index.html +58 (Hilfe-Tasten).
- **Übergabe des abgerissenen Arbeiters (erste Probe):** Die 28 Debug-Zeilen aus tmp-fahr-bahn-debug.cjs prüfen drei Verdachte auf den Täter des Steckenbleibens: Stopps in `_wandGleiten`, die Schub-Quelle in `_fahrHuelleKontakt` und `pendingVegSpawns` ≤ 12 m um den Wagen (wachsen Büsche und Bäume nach der Platzwahl in den Wagen?). Die Probe beantwortet das mit Zahl, bevor geschnitten wird.
- **Re-Mint (deklariert):** klang-core FAHRT, neuer Abdruck (gate:daten-contract). vehicle recipes.json byte-gleich (FAHR steht nicht im Buch) oder ein deklarierter Akt.
- **Linse vorher ROT:** Probe in diag-fahr-leben (diag-fahr-bahn geht darin auf, keine zweite Familien-Linse):
  - Vorschau-GT am Garage-Tor: Neigung und Fels-/Busch-Berührung (Schau-2 #6: 40° am Fels);
  - rückwärts aus dem Stand 0,1 m in 2,5 s (Auge 06);
  - Befreiung nach Stoß an Busch/Stamm;
  - Tacho fehlt.
- **Abnahme:**
  - Vorschau-GT an 10 Toren auf Grund mit Neigung ≤ 15° und ohne Berührung;
  - rückwärts ≥ 3 m in 2,5 s;
  - nach dem Stoß frei ≤ 2 s;
  - Tacho = |vlong|·FAHR.kmh = die Zahl der Probefahrt;
  - Fahr-Klang-Drehzahl über 0…vmax;
  - gate:fahr-leben S1 Welt == Labor grün;
  - gate:klang-zensus grün;
  - tmp-fahr-bahn-debug.cjs nie auf main.
- **Grenzen:** **kein Tempo-Umbau** (S1, Schöpfer-Wort); kein Wasser-Code (K02); der GT am Haus-Sockel (Auge 05) ist K10.

### K13 — Kampf-Klasse nach V18.539: Klick-Pfad, Horizont, kampf-Gelb
- **Prio** 2 · **Risiko** R2, tiefe Klasse (3 Runden) · **Platz** 3 · **v1-Schritt** 5 · **Kosten-Soll** ≤ 30 M; Probe (F) ≤ 3 min CI
- **Basis:** main V18.539
- **Ziel:** Der Hieb trifft auch im Horizont-Blick den Wolfsrumpf, und die fünf gelben Befunde der R4-Prüfung von welle-lf-kampf fallen in derselben Welle.
- **Engstelle:**
  - tryMouseBreak (lf anazhRealm.js:82957 ff.) mit der Ziel-Wahl des Hiebs; `_pickCreatureAtCrosshair`; `_kampfZielMerken`;
  - kampf-Gelb (uebergabe-stand.md, 10.10. ~09:30): T15-Flackern in gate:kampf-gefuehl; Räum-Zwilling `_refreshCreatureTaskAura` / `_refreshCreatureCarryingVisual`; Last-Rückgabe ungemessen; Feld-Leichnam ohne Bild; Jagd-Peilung am Funktions-Argument.
- **Linse vorher ROT:** Probe (F) in diag-kampf-gefuehl über den KLICK-Pfad (tryMouseBreak, nie `_beginPlayerSwing()` direkt).
  - Matrix: 8 Waffen × {0,9 m; 1,3 m; Reichweite − 0,2 m} × {Rumpf, Horizont} × {3rd, 1st} gegen einen gehaltenen Wolf; Täter je Fall beim Namen (kein Ziel / zu weit / Sweep vorbei).
  - Erwartet Rumpf grün, Horizont ROT mit Täter „kein Ziel unter dem Fadenkreuz".
  - Dazu je gelber Befund seine Probe: T15 in 20 Läufen deterministisch, EINE Räum-Methode (Absenz der zweiten), Last-Rückgabe mit Zahl, Leichnam im Bild, Peilung liest den Zustand.
- **Schnitt Horizont:** Findet `_pickCreatureAtCrosshair` kein Tier, wählt EINE Ziel-Wahl das nächste lebende Tier mit Leib in Klingen-Reichweite und Richtung im Schwung-Sektor (Gier ±arcHalfRad, Neigung bis 35° unter dem Fadenkreuz). Kegel-Zeile `ARENA.schwung.zielKegelUntenRad 0.61` additiv in schmiede-core; das Arena-Lab liest dieselbe Zeile. Byte-Beweis gate:schmiede-contract + gate:asset-contract (ARENA steht heute nicht in recipes.json); ändert sich etwas, ist es ein deklarierter Re-Mint.
- **Abnahme:**
  - alle 96 Fälle Schaden > 0;
  - ein Tier hinter dem Rücken bleibt heil (dot ≤ 0);
  - T15–T18 grün in 20 von 20 Läufen;
  - die gelben Befunde je mit Zahl oder Bild;
  - Bild-Paar aus dem Ausgabe-Pfad: 3rd, Horizont-Blick, Klinge im Wolf.
- **Grenzen:** keine steckenden Pfeile (S2), kein Fallschaden (S3).

### 4.2 OMEN-Karten (je mit Risiko-Stufe und unabhängigem Prüfer hier; Prüfer leicht: Diff + Rohdateien + Linsen-Vakuum)

- **O1 — 0910-7, die Takt-Regression** · R2 · Basis main (Auftrag koordination 537a3e15)
  - Ziel: CPU-Takt p95 unter Regler frei 5,8 → 10,9 ms (V18.538) heilen.
  - Täter-Kandidaten (Bericht 0910-6): `_tickArchitectureLOD`, `_lodTreeVisHeight`, `_foundrySichtHoehe`, `_chunkSatzPass`, `_hoehlenSicht`. Wurzel nach Lehre 25 (billige Filter zuerst).
  - Linse vorher ROT: `werkbank takt` je Subsystem, ABAB 7dd944e6 ↔ 66005ca6, Täter beim Namen.
  - Abnahme: p95 ≤ 5,8 ms im ABAB; Bild und Band unverändert.
- **O2 — S3-Tor** · R2 (porta-core Kern-Akt, deklarierter Re-Mint gate:porta-contract) · Basis main nach K08
  - Ziel: Tor-L0 32,2 MB → L0 ≤ 60 000 Dreiecke, L1 neu.
  - Linse vorher ROT: die Haus-fern-Linse auf porta übertragen.
  - Abnahme: Band an Wiese und Genesis nicht schlechter; Bild-Paar.
- **O3 — Genesis-Rest** · R2 · Basis main nach V18.539 (genesis-band drin)
  - Ziel: 231 / 2 315k / 142,1 MB → ≤ 208 / 680k / 118 MB.
  - Linse vorher ROT: `werkbank band` an Genesis, Täter-Klasse je Pass.
  - Abnahme: im Band, ABAB nicht langsamer.
- **O4 — die weiße Masse** · R1 · Basis main
  - Ziel: `bodenSatz` im Wald nah blass, fern oliv — zwei Farben derselben Stelle (auge/1010/befund.md, Bilder 08–10).
  - Linse vorher ROT: `werkbank albedo` / `diag-albedo-zensus` nah gegen fern am selben Ort, Täter beim Namen.
  - Abnahme: Δ nah ↔ fern im Rausch-Band; Bild 08 nachher oliv.

---

## §5 Nur der Schöpfer — mit Wortvorschlag

### 5.1 Die Frozen-Liste (BETRIEBSGESETZ 2; CLAUDE.md:65)

**Lage:**
- A–C stehen auf „CODE steht". Ihre Bild-Beweise aaa8–aaa10 stammen aber aus einem linearen, ungetonten Render-Target, das „log" (CLAUDE.md:140, Lehre 5); keiner kommt aus dem Ausgabe-Pfad.
- A trägt einen benannten Rest: die Kopf-Zeile des Fell-Gesetzes, „benannt, nicht gegossen" (PFLICHT-OFFEN.md:14).
- Der Wortlaut von A–C beschreibt das Analog-Paradigma, das das Wort vom 30.09. („AAA, nicht Kapseln") ersetzt hat.
- Neue Zeilen brauchen die Buchstaben A–E (scripts/diag-betriebsgesetz.cjs:25).

**Was der Koordinator liefert, bevor du entscheidest (A1, Auge, nach V18.539):** den Beweis-Satz A–C am neuen main.
- Herkunft: `scripts/lib/ausgabe-aufnahme.cjs` unter `__buehne` (Mittag · Sonne · Sommer, Tiere gehalten).
- A: Wolf auf Armlänge mit Tris je Stufe, Fell ↔ Haut, dazu die Pixelgröße der Kopf-Strähne (2,8 mm).
- B: Eiche bei 2,6 m / 15 m / jenseits 64 m.
- C: Haus d0–d1 und die Mesh-Zone (0 ungebaut).
- Zahlen aus `werkbank zaehlen`, JSON mit Pose und Bühnen-Stand.

**Wortvorschlag:** „A–C gelten in der AAA-Lesart vom 30.09.
- B und C fallen mit dem Beweis-Satz A1 im selben Commit.
- A fällt mit A1, wenn die Kopf-Zeile des Fell-Gesetzes gegossen ist, oder sie fällt FINAL, weil sie unter dem Pixel liegt (Messname: px je Strähne an Armlänge).
- Neu:
  - A) DER ORT AUF DEM GELÄNDE — EIN Gelände-Kern für Stamm, Worker und Studio; das Dorf wird im Fachwerk-Studio auf diesem Gelände geplant und als EIN Plan mit Höhe, Wegen und Laternen exportiert: Sockel-Median 2,72 → 0 m, Türen erreichbar 0/2 → alle, GT auf dem Dorfweg 5,2 m/8 s → ≥ 60 m, Plan-Hash Studio = Welt, Dorf-Lichter nachts 0 → Laternenzahl des Plans.
  - B) DER PFAD OHNE BRUCH — die Messnamen und Vorher-Zahlen der eigenen Linsen:
    - Kadenz beim Gehen 0,34 → ≥ 1,5 Schritte/s, Gleiten < 5 % (gate:tier-gang);
    - Kamera unter dem sichtbaren Boden → 0/50 (R-CAM, Vorher-Zahl aus K06);
    - Wasser-Fahrt 11,9 → ≤ 0,5 m/s (gate:werk-im-wasser);
    - Werkstatt-Füllgrad 0,059 → ≥ 0,5 (V-D3);
    - Punktlichter am Feuer 0 → ≥ 1, Luminanz ≥ 0,15 (K11-Linse);
    - Hieb im Horizont-Blick 0/48 → 48/48 (Probe F);
    - Mitspieler-Platzhalter am Ursprung → 0 Frames (gate:mp-sync).
- E bleibt, mit Kriterium (unten)."

**Kriterium für E (fehlt heute):**
- Wortvorschlag: „E fällt, wenn an beiden Messplätzen — Radeon 890M (iGPU) und GTX 1060 (alte dGPU) — an den Messorten Wiese UND Genesis (spec/profiband/haushalt.json) im ABAB unter Regler voll gilt: Frame p95 ≤ 33 ms, ≤ 208 Befehle, ≤ 680k Dreiecke, ≤ 118 MB VRAM, CPU-Takt p95 ≤ 5,8 ms."
- Ob weitere „Standardgeräte" zählen (ein Telefon? ein Mac?), setzt nur der Schöpfer; „Richter ist nicht mein Rechner".

### 5.2 Der Feature-Stopp (docs/roadmap.md:29) — nur die Ausweitung

**Angewendet** habe ich die Regel selbst, offen benannt (§2.2):
- **Laternen und Fensterlicht sind drin:** Sie tragen Schritt 2 (sehen) bei Nacht; das Dorf ist nachts schwarz (Auge 12), das Studio hat sie (21 Laternen, Bild 14).
  - Damit widerspreche ich dem Export-Kommentar fachwerk-core.js:4198–4211 (Welle L, 06.10.) für die Laternen und löse den Widerspruch der Fassung 1 (Ort-Plan 10.10. mit Laternen gegen die Vorlage an dich).
- **Brücken nur als Wege-Etikett,** wo ein Weg Welt-Wasser kreuzt (Schritt 5, fahren).
- **Mauer und Siedlungs-Fluss bleiben draußen.**
- Du kannst das kippen.

**Ausweitung, nur du:**
- **S1 Tempo aus Leistung (GA-01 + FZ-02 + GA-03):**
  - Inhalt: GT ≥ 55 m/s und Luftphase am Garage-Hügel sind neues Verhalten.
  - Kosten: 3,4-fache Streaming-Last gegen E.
  - Wortvorschlag: „Ja, nach E."
  - Bei Ja ist die Karte vorbereitet:
    - carPhys mit Leistung P, cw und A; F = min(μN, P/v); der Deckel :2873 fällt; VMAX_REF fällt; Re-Mint vehicle recipes (`vmax`, `topSpeedMul` stehen in recipes.json);
    - zuerst die Streaming-Probe bei 55 m/s: 0 ungebaute Chunks im Cull-Radius, CPU-Takt p95 ≤ +0,5 ms und Frame p95 unter Regler voll ≤ 33 ms auf dem OMEN;
    - hält das Streaming nicht, kommt der Streaming-Schnitt vor dem Tempo.
- **S2 steckende Pfeile (KA-05):**
  - Wortvorschlag: „Ja — es ist Konsum des Studio-Gesetzes `stickArrow` (schmiede.js:1446), Lab = Welt."
  - Karte vorbereitet:
    - EIN InstancedMesh-Pool (40, aus ARENA, Lab-Literal liest die Zeile);
    - am Tier im Anker-Raum des Glieds;
    - ≤ +1 Befehl Bild-Pass;
    - offen ist der Speicher-Snapshot steckender Pfeile.
- **S3 Fallschaden (WE-17):**
  - Wortvorschlag: „Nach v1."
  - Karte vorbereitet:
    - EIN Lande-Ereignis in `_stepCharacter` (:94515–94519), Gesetz additiv neben koerper-core `landung` (schadenAbM 3,5, todAbM 22), Re-Mint recipes.json + daten-contract;
    - nie aus `_landImpactPending` lesen (Treffer-Juice :81513, Parkour :94894 schreiben mit).
- **Mauer und Siedlungs-Fluss, G2 Landformen (mit §5.4), Welle 2 Klima/Biom, der Katalog der 16 Bühnen (18–23 Wochen), translated auf r184, Markt-Inhalt:**
  - Wortvorschlag: „Nach v1; G2 in v1 nur, wenn K09 am gebauten Boden < 3 sanfte Dorfplätze je Welt misst und die Altwelten umziehen."

### 5.3 Text der bindenden Abschnitte (GOLDENE DEFINITION, BETRIEBSGESETZ)

- **F4-Zusatz zu Gebot 10, Wortvorschlag:** „… baue die LINSE, die den Täter beim NAMEN nennt — vorher ROT am Täter, in einer bestehenden Familie, mit Selbsttest, ≤ 3 min CI und benanntem Konsum-Leser."
- Sonst nichts.
- Die Lehren (F3, F5, Lehre 7 nach K09: „der Worker lädt den Gelände-Kern; bit-identisch bleibt nur der WGSL-Seh-Spiegel") und champion.md (F1) setzt der Koordinator unter der Vollmacht (§2.2, §2.11). Willst du auch sie selbst setzen, genügt ein Wort, und sie wandern hierher.

### 5.4 Die Altwelten

ERDBAU (K10) und erst recht neue Landformen verschieben den Boden unter gespeicherten Bauten.
- Wortvorschlag: „Alte Welten ziehen um: ihre Bauten werden auf das neue Gelände geerdet."
- Die Gegenoption (den alten Wildnis-Term je Welt einfrieren) wäre ein Zwilling auf Daten-Ebene.
- K10 merget nicht, solange die Linse Spieler-Bauten in ERDBAU-Flächen zählt und dein Wort fehlt.

### 5.5 Zur Eichung (kein Tor)

Welches Wochenlimit trägt das Konto, und zählt der OMEN darauf? Der Tagesdeckel 250 M ist ein Startwert aus Konto 1.

---

## Anhang — die Gegenlesung, eingearbeitet (nichts still gestrichen)

| Befund der Gegenlesung | Fassung 1 | Fassung 2 |
|---|---|---|
| K07/K06 brauchen einen undeklarierten Re-Mint (recipes.json `kalib:4`, fx.bewegung) | „gate:asset-contract byte-gleich", „gate:daten-contract prüfen" | §2.4a Re-Mint als Klasse; K06, K07, K11, K12, K13 und K10 deklarieren ihre Akte; auch daten-contract (koerper, klang) |
| K03 verspricht Stationen als Erbgut-Daten, die die Empfänger-Wand verwirft; K06 und K11 hängen daran | Erbgut-Terme „Hindernis-Reihe" und „Feuerstelle" | K03: S4 als Snapshot-Saat, nie neue Term-Art; K06 misst an Wiese + s2-hang30; K11 setzt sein Feuer selbst |
| K04 misst den Nicht-Spielpfad; 93,18 m ist ein Artefakt; die Absicht wird falsch geschnitten (Rejoin stirbt) | „nur `initP2PSync(raum)`", enabled bei Erfolg | K04 über Knopf und Boot; Platzhalter-Frames; enabled am Eingang; Prio 3; §1.1 MP-01 berichtigt |
| zweierlei Maß bei den Gelände-Zahlen | §1.2 „widerlegt", §3.4 „Gegenmessung nötig" | §1.2 „unbelegt" (Hydro im Code widerlegt); §3.5 stützt sich auf Welt-Tatsachen; Gegenmessung in K09 |
| §5.1: A–C mit aaa8–aaa10 fallen lassen; B zitiert die Runner-Zahl 0,017 | so vorgeschlagen | frischer Beweis-Satz A1 aus dem Ausgabe-Pfad; A-Rest benannt; neue Zeile B mit Zahlen eigener Linsen; Kriterium für E |
| Kopf und §2.10.1 überholt (Checkout 00:31, integ-probe ce10dcb6); Sitzung spielt V18.531 ein | Checkout „auf 2b60988b" vorziehen | Kopf berichtigt; Kartenkopf 1 (Read aus dem Worktree); frische Sitzung (§2.11) |
| „1 712 Zeilen reine Erkundung" — tmp ist diag + 28 Debug-Zeilen mit offener Hypothese | Datei fällt, Hypothese nicht genannt | §2.1 berichtigt; Hypothese als erste Probe in K12 |
| Kleinkram: 972127d8 ist die Energie; (a) heilt c138bd30; T16–T18 prüfen nicht „Ziel verworfen"; Manifest 8 Einträge, 9 Dateien | Zuordnung (a)–(d) zu vier Commits; „gemessene 8" | §1.1/K01 berichtigt; Klick-Pfad-Matrix in K13; „8 Manifest-Einträge, 9 Kern-Dateien" (§2.3 H2) |
| Vollmacht vom 11.10. fehlt; F1/F3/F4/F5 zugleich gesetzt und gefragt | §5.3 alles an den Schöpfer, Kartenkopf setzt ab heute | §2.2 Auflösung: Prozess und Lehren setzt der Koordinator, Gesetzestext und Scope der Schöpfer |
| keine Merge-Bedingung „Zweig-CI grün"; Lehre 19 fällt faktisch | „nicht auf die CI warten" | §2.8 Schritt 3; der Koordinator liest die CI; Lehre 19 bleibt |
| keine Regel bei erschöpfter Runde | — | §2.6 „Erschöpfte Schleife" |
| fahr-bahn-Platzsuche fiele still | K12 „bleiben: Tacho, FAHRT, rueckAntrieb/lowF" | K12 nennt jedes Stück einzeln, Prio 2 und unabhängig vom Tempo |
| kampf-Gelb fehlt | — | K13 |
| KA-01-Rest hängt an einer Matrix, die nie gemessen wird | §3.6.1 Bedingung | K13 misst die Matrix als Linse |
| OMEN-Pakete ohne Karte, Risiko und Prüfer | Liste in §2.8 | §4.2 O1–O4 mit Stufe und Prüfer |
| Kosten-Soll fehlt (K10, K12, K04) | Budget ohne Zahl | Kosten-Soll je Karte; K10-Budget mit Zahlen; S1 mit Streaming-, Takt- und Frame-Schwelle |
| Kriterium für E fehlt | — | §5.1 Wortvorschlag |
| Gastwelten und translated weder übernommen noch abgelehnt | — | §1.2: Gastwelten als Status übernommen, translated abgelehnt für diese Wochen |
| WIP-Push fährt die volle CI | — | §2.7 `[skip ci]`, letzter Push ohne |
| Bild-Befunde ohne Karte; Laternen-Widerspruch | — | Türblatt → K08, Krone → K10; Laternen nach der Regel angewendet (§5.2) |
| R0 ohne Gegenprüfung baut ein Prüfnetz ab | R0 „keine Gegenprüfung" | R0 mit Vakuum-Prüfer; Wand-Abbau nie R0 |
| Fall-Liste statt Runden-Schleife | „Drei-Runden-Schleife fällt" | Schleife bleibt mit Deckel je Stufe; tiefe Klassen +1 Runde |
| Kartenkopf bricht Lehre 19/26, die zugleich vorgelegt werden | beides | Vollmacht-Commit Lehre 26 vor V18.539; Lehre 19 erfüllt (§2.2, §2.8) |
| K12 macht die v1-Teile zur Geisel des Tempos | Tempo + Streaming-Tor in K12 | Split: K12 Fahr-Bahn (v1), Tempo S1 auf Schöpfer-Wort |
| F4-Gegenstück als allgemeine Regel | Regel | nur der VIS-Einzelfall mit Vorbedingung und Prüfer |

---

Geschnitten: am Code nichts (Synthese). Entschieden sind: die Auflösung der Vollmacht; die Reihenfolge (Zweige → gelaende-core → Ort auf dem Gelände, P0 in Klassen parallel, E und A–C-Beweis auf OMEN und Auge); der Prozess (Deckel 250 k, ≤ 3 schwere Arbeiter, 250 M/Tag, WIP mit `[skip ci]`, Prüftiefe R0–R3 mit Schleife, Merge nur bei grüner Zweig-CI, Re-Mint als Klasse); 13 Karten + 4 OMEN-Karten.
Gemessen: 13 P0 gegengelesen, 8 mit falscher Ursache, falschem Messwert oder falscher Heilung, MP-01 am Spielpfad bis auf den Platzhalter widerlegt; 7 Karten deklarieren einen Re-Mint-Akt (K06, K07, K08, K10, K11, K12, K13 nach Byte-Beweis; recipes.json trägt `kalib`, `landung`, `vmax`, `feuerstelle.fx`); 11 offene Zweige, integ-probe ce10dcb6; Konto 2: 711 M gewichtete Token in 23 h, das 2,8-Fache des Tagesdeckels.
Pflicht-OFFEN Rest: A, B, C, E (4) — docs/PFLICHT-OFFEN.md
Status: ZWISCHENSTAND

---

## §6 Entschieden mit der Vollmacht des Schöpfers (11.10., „du entscheidest champ, du dein eigener Meister“ + „fahre selbstständig fort“)

Der Schöpfer hat nach dieser Synthese die Vollmacht ausdrücklich auf alles gelegt. Damit entscheidet der Koordinator die Punkte aus §5
selbst — offen benannt, jeder kippbar durch ein Wort des Schöpfers:

1. **Frozen-Liste (§5.1):** angenommen wie vorgeschlagen. Ausgeführt im Commit nach dem Beweis-Satz A1 (Auge, Ausgabe-Pfad, nach V18.539):
   B und C fallen, A fällt mit gegossener Kopf-Zeile oder FINAL unter dem Pixel; neu A) DER ORT AUF DEM GELÄNDE, B) DER PFAD OHNE BRUCH
   (Zahlen wie §5.1); E erhält das Kriterium (beide Messplätze Radeon 890M + GTX 1060, Wiese UND Genesis, Regler voll: Frame p95
   ≤ 33 ms, ≤ 208 Befehle, ≤ 680k Dreiecke, ≤ 118 MB, CPU-Takt p95 ≤ 5,8 ms). Weitere Standardgeräte (Telefon, Mac): offen benannt.
2. **Feature-Stopp (§5.2):** S1 Tempo aus Leistung — ja, nach E. S2 steckende Pfeile — ja (Konsum von `stickArrow`). S3 Fallschaden —
   nach v1. Laternen und Fensterlicht — drin (K11/K10). Brücken als Wege-Etikett — drin. Mauer und Siedlungs-Fluss — nach K10.
   **G2 Landformen — in v1, nach K09** (Wort des Schöpfers vom 10.10.: „das Gelände selbst ist noch nicht genial — flache Talkessel,
   Schluchten“; die Zahlen der Forschung tragen es, K09 misst sie am gebauten Boden nach und setzt den Soll-Korridor).
   Klima/Biom, 16 Bühnen, translated r184, Markt-Inhalt — nach v1.
3. **Bindender Text (§5.3):** der F4-Zusatz zu Gebot 10 ist gesetzt (Verschärfung, keine Lockerung) — Zweig vollmacht-1110 596aca4b,
   Stufe vor kampf in V18.539, zusammen mit Lehre 26 und champion.md:18. Sonst bleibt der Text wörtlich.
4. **Altwelten (§5.4):** alte Welten ziehen um, ihre Bauten werden auf das neue Gelände geerdet; kein eingefrorener Alt-Term.
5. **Budget (Klarstellung des Schöpfers 11.10.):** der Tagesdeckel ist KEIN Warte-Tor. Die Grenze ist das Wochenlimit (Reset 17.10.);
   gemessen wird Effizienz (sichtbarer Fortschritt je Token). Liegt der Verbrauch vor dem Wochen-Anteil, wird billiger gearbeitet
   (kleinere Kontexte, weniger Vermessung, eher Prüfer als Nachbesserer) — nie stillgestanden. Die Ampel aus §2.5 gilt sinngemäß:
   keine neue Vermessung ab 60 % des Tagesanteils, Bau-Karten laufen weiter.
6. **Monolith (H1, Frage des Schöpfers „neu bauen?“):** kein Neubau von null — Neubau je Domäne von innen. Die Modul-Zielkarte
   (Gelände · Wasser · Render · Vegetation · Siedlung · Kreatur · Körper · Fahrzeug · Kampf · Klang · P2P · Werkstatt · Speicher, je mit
   fester Schnittstelle) wird vorgezogen; jede Karte, die eine Zone anfasst, zieht sie als Modul heraus (K09 gelaende-core ist die erste).
7. **CI in zwei Stufen (Schöpfer 11.10.: „der war früher unter 2 min, das wäre wieder genial“, Karte K14 Fassung 2):** jeder Push
   fährt den Puls (≤ 2 min: Syntax, eslint, Format geänderter Dateien, statische Wände, Byte-Verträge < 30 s, playtest:fast); die volle
   Batterie (≤ 12 min durch Breite) läuft auf integ-probe und main, nachts, auf Abruf und bei `[ci voll]`. §2.8 Schritt 3 heißt damit:
   R0/R1 brauchen den grünen Puls, R2/R3 tragen am letzten Push `[ci voll]` und brauchen die volle Batterie grün.
