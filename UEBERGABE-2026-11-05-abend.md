# Übergabe 05.11. abends (Konto-Woche bei 96 % um 22:00; wird bis 98 % fortgeschrieben)

**Gebucht 206/330** am Kopf f5db8d90 (z235) (Artifact https://claude.ai/artifact/Un9gX5VgRzYy77kzKUGeM2 v40). main = f5db8d90 bzw. neuer — `git ls-remote origin main`.
Heute: 198 → 206. Zuletzt material.K1#1 an der Radeon 13/13, nach der Landung von w12-kronen-albedo.

Werkzeuge:
- Buchung: `BUCHE_KOPF=<sha40> bash artifacts/profiband/werkzeug/buche.sh`, danach das Artifact neu veröffentlichen.
- Züge: `cd /tmp/claude/w3 && bash zug-schlange6.sh <vor> "<id>:<zweige>"` (EINE Instanz je Zug).
- Radeon: `bash /tmp/claude/w3/radeon-punkte.sh <sha40> --nur "<id,id>"`. Nur Radeon-IDs angeben, sonst Exit 2. Die Datei aus pm nach koordination kopieren.
- Farm: `bash /tmp/claude/w3/farm-lauf.sh <sha40>`.
- OMEN per RC „Koordinator Meldung“.

Log: /tmp/claude/w3/offen-w6.txt Einträge 119–164.

## Züge
- **z235 GELANDET** f5db8d90: w12-unterwasser, w12-kronen-albedo (mit w12-albedo-tafel), w12-takt-band (K06-Wurzel, Bild je Frame im Null-Renderer Wiese Ego 13,9/17,9 → 4,0/6,3 ms).
- **z236 ROT** (voll 9/18 Werk im Wasser):
  - Rote Zeile: „R: das Wasser am Seerand ändert sich mit dem Dorf — nasse Punkte 6397 → 6396, gezeichnete Spalten 7345 → 7249“.
  - Täter ist w12-brand-halt (siedlung-ort.js +195 aus brand-bild); tuch-grob bestand das Gate in z234. Die Post steht in cloud-post/w12-brand-halt.md.
  - **z238** = w12-tuch-grob allein hinter z237.
  - **z239** = w12-brand-halt 0d1b2396 (main f5db8d90 gemergt) hinter z238: lokal werk-im-wasser 2× GRÜN (R 6594 → 6594, 7477 → 7477), das CI-Rot (−96 Spalten, 1,3 % > 1 %) ist nicht nachgestellt; Verdacht `_brandBild(delta)` je Takt (stamm/dirigent-takt.js:253) vor dem Chunk-Neubau am Seerand. Fällt z239 wieder: R auf dem CI-Läufer je Chunk zählen gegen main allein.
  - Der lokale Brand-Champion kann über seinen Zweig fortsetzen. Zu brand-halt die Angaben von vorher:
  - w12-brand-halt bringt w12-brand-bild endlich nach main. Der Zweig war in z232 an einem Konflikt in diag-stand-takt gefallen.
  - Der Herd ist deterministisch, stoffe.K2#2/K5#2 headless GRÜN am Zweig. Die Bilder habe ich gesehen: Der Rauch ist jetzt eine Fahne statt einer Kugelkette.
  - Nach der Landung: Farm, dann buchen (+2).
- **z233-Jagd (OMEN), beendet**:
  - **Täter w12-pegel-lauf 43584419**: Kreaturen-Obergrenze, „setzte 10 von 10 — der Fehl-Grund griff nicht“. Die Post steht in cloud-post/w12-pegel-lauf.md, der Zweig fährt erst nach der Heilung.
  - dorf-probe ist unschuldig.
  - **z237 hinter z236**: w12-dorf-probe 4adff50e, w12-proben-tempo-spiel e47e2714, w12-riesenhalm c1667e94. Die letzten beiden hat die Jagd nicht mehr gefahren, der Zug urteilt.
- **z234 ROT** war Wackeln: Fenster-Wand E Lauf, am Ufer kein Wasser gezeichnet (wie z225, FUND). Die Zweige fuhren in z235/z236 weiter.

## Ausstehende Messungen
- **streaming.K1#1/K2#1** (gebucht, nur gehalten; die nächste Farm misst sie ROT = −2):
  - Champion w12-dorf-strom e7756259, nichts geheilt.
  - Bäume: 572 von 578 unfertigen Bäumen fehlt der Wald-Plan (`_waldPlanSteht` false).
  - Häuser: Der Dorf-Vorlauf bemisst sich nach Strecke (Vorbereitung bei 269 m, nur ein Export zur Zeit).
  - Ohne Dorf ist K2#1 GRÜN.
  - Die Proben und der Befund liegen in koordination `bericht/0511-dorf-strom/`. Die Verdächtigen stehen in der Commit-Message von e7756259.
- **leib.K3#2 ROT** an der Radeon f5db8d90: Der Sicht-Abfall unter Wasser misst 0 /m (L auf 0,5/1,5/2,5 m gleich 0,1788), der Leib-Kontrast 0,01.
  - Die Probe zog 6430 m vom Sitzungs-Ort, der Ring fiel 4 → 0. Wahrscheinlich steht die Kamera in einer Welt ohne geladenes Wasser.
  - Das ist zuerst eine Frage der Probe, dann des Spiels.
  - **Probe-Zweig w12-unterwasser-probe 45e044c3** (nicht gemergt):
    - Die 40 Takte der Probe laufen über `__werkTakt` statt über die eigene, voreilende Uhr. Die Höhle steigt damit von 0,03 auf 0,14 und liegt im Band.
    - Am See zeigt der Schuss weiter den alten Blick über dem Wasser (L 0,1764 auf allen Tiefen), obwohl Medium und Kamera richtig stehen.
    - Verdacht: TRAA (`st._traaR`/`_traaReprojektion`) behält das Bild über `neubeginn()` (scripts/lib/ausgabe-aufnahme.cjs) hinweg.
    - Die Diagnose-Schüsse `diag-ohne-flaeche`/`diag-ueber` müssen vor dem Merge fallen.
  - Auch die GTX misst leib.K3#2 ROT, mit demselben Muster.
- material.K3#2 ROT: Karte zu L1 bei Birke 0,939 und Fichte 1,12–1,17 (Soll 0,95–1,05).
- material.K1#2/K3#2 bleiben auf der GTX ohne Urteil: Welt 81 s und Labor laufen parallel, das reißt die Frist von 84 s (FUND).
- profiband.K2 GTX am f5db8d90 ROT: Belegung wiese-ego-steht 33,32 (bbca6407 13,27), genesis-ego 108,3 (Läufe streuen 36,7–108 je Kopf, 1 Lauf je Kopf) — takt-band ist auf der GTX nicht als Gewinn messbar; für E braucht es ≥ 4 Läufe je Seite (ABAB).

## Stationen in koordination
- Heute gemergt: g2-proben, kontakt, pegel, dorf-probe, albedo, unterwasser, kronen (Nadel-Band 0,08–0,15), laub-kante (nennt den Verdecker), brand-halt (Kommentare).
- **streaming.K1#1/K2#1 sind headless ROT seit der dorf-probe-Station 834b272a.** Die Fahrt läuft mit `ort: "dorf"`, die Orte wachsen während der Fahrt (Bäume 1135 statt 708). NICHT proben-tempo: Meine Rücknahme 456ec1fd traf das falsche Commit. Die nächste Farm misst sie ROT, also zuerst heilen (FUND-REGISTER).
- **w12-proben-tempo2** 174365e5 (nicht gemergt):
  - Die Leihe ohne Bild leert jetzt `sammelMs`. fahrzeug.K2 fährt mit der Leine (+23 % Spiel-s), die Streaming-Abdrücke bleiben byte-gleich.
  - Es gibt KEINE Punkte: fahrzeug.K2 (~290 s) und tiere.K5 (≥ 126 s) tragen ihren Deckel durch die Spiel-Takte.
  - Strecke oder Spielzeit zu kürzen wäre ein Schnitt am Urteil, also Sache des Schöpfers.

## Cloud (Start 05.11. ~19:00, WIP stündlich gepusht — vom gepushten Stand integrieren)
| Sitzung | Zweig | Auftrag (Briefkasten cloud-post/…) |
|---|---|---|
| w12-klang-lage | w12-klang-lage | klang.K5#2 `_umweltLage` (w12-klang-takt.md) |
| w12-takt-k06 | w12-takt-band | GELANDET in z235 |
| w12-menue-layout | w12-menue | 16 px ohne Abschneiden + Linse (w12-menue.md) |
| w12-verkehr-richter | w12-verkehr | Richter zählt 20 Wagen/Abstand/Sitz, GRÜN aus PFLICHT-OFFEN raus (w12-verkehr.md) |
| w12-ankunft-b | w12-ankunft-faden | Summe UND t(Kontrolle) fallen (w12-ankunft-faden.md) |
| w12-fahrzeug-heil | w11-fahrzeug | 7 rote Linsen aus z225 (w12-fahrzeug-decke.md) |
| w12-buehne-lack | w12-studio-buehne | Lack spiegelt den Himmel (w12-studio-buehne.md) |

Jede sichtbare Abgabe braucht vor dem Zug ein Radeon-Bild (Vorprüfung).

## Offen / Funde (FUND-REGISTER.md)
- **lod.K1#1 / PFLICHT A laub-kante**: Der Fehler liegt in der Gestalt, nicht im Karten-Gesetz. Karte → L1-Gestalt an derselben Pose:

  | Art | Karte | L1-Gestalt |
  |---|---|---|
  | Strauch | 0,47 | 0,40 |
  | Birke | 0,34 | 0,39 |
  | Eiche | 0,25 | 0,27 |

  Soll ist ≤ 0,22. Grün nur über eine neue Kronen-Gestalt (L0) dieser drei Arten.
- **Brand**: Front und Flammen lesen die Welt-Uhr, Fahne und Gras die Bild-Uhr (zwei Winde nach dem Laden eines Stands). Die Deckung liegt mit 0,91 knapp über der Schwelle 0,9.
- LLM-Stationen per Ollama.
- Fenster-Wand: Wackeln des Wassers am Ufer.
- Grundstellung setzt den Regler (`perfSense`/`loadScale`) nie zurück.
- `foundry-core.js:2544`: Die Nadel der L2 hat eine feste Fichten-Farbe.
- OMEN: HP-Dienst apphelpercap (Entscheidung des Schöpfers).
- Die STATIK-Kette misst wie der CI-Push die SUMME: Ein Zweig, der Spiel-Code streicht, fährt nie mit spec-schweren Zweigen.
