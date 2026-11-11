# R6 nach Konsum — w28-r6-konsum (11.11., Blockaden B2 + B6)

**Geschnitten.** Eine Station veraltet nur, wenn ihr Lauf den geänderten Code ausführte oder las. Der Zeuge
`meisterkarte-quelle/punkte/konsum-zeuge.cjs` fährt in jedem node-Prozess des Laufs (aufgebaut auf r6-konsum-koord e389a9b7),
`fahreGruppe` faltet seinen Konsum in den Eintrag der Messung (`konsumDesLaufs`, `konsumFalten`), `frischUrteil` legt ihn gegen den
Diff seit der Messung (`konsumTreffer`). Je Skript EIN Bit je Funktion des Parsers; der Kopf-Code eines geladenen Skripts zählt immer.

| Seite | wer | Körnung |
| --- | --- | --- |
| Knoten (Linsen-Bibliotheken, save-server, Werkbank) | jede Station, jedes Gerät, jede Probe der Sitzung (Fenster je Probe) | Funktion |
| Seite (Spiel-Dateien) | headless ohne Zeit-Urteil: 140 von 388 Hälften (36 %) | Funktion |
| Seite | Zeit-Stationen und Proben der Sitzung: 248 von 388 Hälften (64 %) | der Glob `pfad` wie bisher (`konsumSeite` false) |

Ohne Konsum-Menge (ältere Messung, hart getöteter Prozess, ein Kind ohne Zeugen) urteilt eine Hälfte wie bisher nach Linse und
Glob; die Buchung zählt sie beim Namen (`R6 nach Konsum: n von m Hälften · ohne Konsum-Menge k: …`).

## Gemessen: veraltet je Landung (eine frische Messung am Vorgänger, geurteilt an der Landung)

Heute, alle 388 Hälften: 388 · 388 · 388 · 388 · 315 (an vier Landungen jede über die Linsen-Hülle; `vorher.cjs`).
headless mit Zeugen an 900c28e6 (79 Läufe, 128 Einträge, 119 mit Konsum-Menge, 11 ungemessen) und an b269f840 (135 Einträge,
132 mit Konsum-Menge, 3 ohne — „6 Prozess(e) ohne Ende“ beim Namen —, 4 ungemessen):

| Landung | heute | nach Konsum | die Täter |
| --- | --- | --- | --- |
| 900c28e6 → 6aa7a5a6 (gemessen) | 119/119 | 118/119 | foundry-core.js 111 (Kopf-Tafel `PORTAL_RENDER_CONFIG`), phyto-core.js 108 (Wald-Plan) |
| 6aa7a5a6 → 2d5f4146 | 119/119 | ≤ 37/119 | koerper-core.js 37; abnahme-urteil.cjs traf keine (die geänderten Zeilen führte keine aus) |
| 2d5f4146 → 5b9c6427 | 119/119 | ≤ 119/119 | `starteBrowser`, `linsenGpu` (welt-boot.cjs, software-gpu.cjs): jeder Lauf startet durch sie |
| 5b9c6427 → b269f840 | 119/119 | ≤ 119/119 | welt-boot.cjs 115, `messort` (welt-orte.cjs) 90, haushalt.json 84 |
| b269f840 → 4e2df19b (gemessen) | 71/132 | 128/132 | index.html 124, stamm/gelaende-boden.js 123, vegetation-wiese.js 118 — der Glob war für 57 blind |

„≤“ (Landung 2–4): aus der Messung an 900c28e6 auf den Vorgänger übertragen (eine Funktion gleichen Texts trägt ihr Bit, eine geänderte zählt
als ausgeführt). **Das Urteil der Zahl:** vier der fünf Landungen ändern Code, den fast jede Station ausführt (Kern-Tafeln, Welt-Bau,
Browser-Start, Boden); dort ist „alle alt“ wahr. Wo eine Landung schmal ist (die zweite), fällt die Zahl auf ein Drittel.

## Kosten

- Zeit-Station physik.K3#2, ABAB ohne ↔ mit Knoten-Zeugen: 96,5 · 96,7 s ↔ 96,4 · 94,6 s, das Maß 0,6 ms in allen vier Läufen.
- V8 Precise Coverage in der Seite: Zähl-Modus Faktor 2,5 auf ruf-lastigem Code, Binär-Modus +15 % dort — darum trägt eine
  Zeit-Station und die Welt der Sitzung die Seite nie.
- Die Nahme je Probe der Sitzung an der echten Werkbank (Software-Renderer, Last 10–15): 84–439 ms.
- Der Abdruck: 3 KB je Lauf (72 Abdrücke 213 KB für 128 Einträge, 76 Abdrücke 222 KB für 135; Zwillinge und das Boot der Sitzung
  über `konsumTafel` geteilt).
- Selbsttest 222/222 in 284,7–286,7 s (vorher 187/187 in 282,6 s auf demselben Rechner).

## Offen (mit Zahl)

1. Die Seite der Karten-Proben und der Zeit-Stationen urteilt weiter nach dem Glob: 248 von 388 Hälften (64 %). Der Weg in der
   Sitzung (Coverage erst nach den Zeit-Proben, Neustart je Probe) braucht ein ABAB auf der Karte.
2. Kein Karten-Lauf trägt heute eine Konsum-Menge (0 von 239): sie entsteht mit der ersten Messung am Kopf dieses Zweigs.
3. 35 von 119 headless-Stationen verloren Ziele ohne Nahme (ein Faden endete vor ihr; bei 6 zählt die ganze Seite, ≥ 50 Skripte):
   deren Skripte zählen ganz. 24 lesen den Stamm als Text (`scripts/lib/stamm.cjs` `text`): jede Stamm-Änderung trifft sie.
4. Ganz gelesene Tafeln treffen jeden Leser: spec/profiband/haushalt.json (3 von 39 Landungen), index.html (1 von 39).
5. Kopf-Code zählt für jeden Lader — auch eine neue Export-Zeile, eine neue Funktion auf Skript-Ebene.

## `beruehrt --basis <sha> --kopf <sha> [--json]`

Je Gerät `<gerät> berührt n von m (nach Konsum a, nach Linse und Glob b) · nur=id,id` — die Hälften, deren Messung an der Basis
frisch gilt und am Kopf nicht mehr; daneben `offen an der Basis` (keine frische Messung, kein Urteil). An b269f840 → 4e2df19b
heute: berührt 16 (Radeon, nach Linse und Glob), offen 370 von 388 (die Buchung hängt in der Gegenwart). Zwei volle Frische-Urteile: 7 min 18 s im Teil-Klon.
