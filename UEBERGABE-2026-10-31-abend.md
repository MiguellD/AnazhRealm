# ÜBERGABE 31.10.2026 abends (Konto 5, Notbremse bei 98 % — die Woche dieses Kontos läuft bis 05.11. 18:00)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Dieser Zettel ist der Stand der Maschine, nicht ihre Chronik (die ist `git log`).
Pflicht-OFFEN: A, B, C, E und F (F gesetzt 31.10., der Prüfplatz; Plan `bericht/pruefplatz/plan.md`, Briefe `bericht/pruefplatz/briefe/`).

## Stand
- **Meisterkarte:** gebucht **160/330** (buche-schleife am Kopf b4bcf19c). Die Takte z111–z114 brachten 0 grün: sie messen nur offene
  Kriterien, und Stationen ≥ 90 s reißen jeden Deckel. Punkte kommen erst, wenn echte Arbeit landet (unten die Zweige).
- **main = 808464ca** (V18.546.150, z114: w4-laub-karte, A laub-kante). Davor f0dab43d (z113: Pflicht F in main) und 8809ec6d (z112).
- **z115 fährt** (ohne LLM, `w3/kette-z115.sh`, Liste `w3/z115.zweige`, Ausgang `/tmp/claude/fahre-z115.log`):
  - w4-ankunft-5 d1327b97 (B): ankunft-5 + ankunft-3 + rundblick auf main. Bild der Kontrolle mit Tor-Ornament, Kronen und Fugen; am
    Radeon-Paar selbst angesehen. K2 13,57 → 0,11 %, aber Weltbild 11,59 → 12,54 s (n = 1); die GTX ist nicht gemessen.
  - w4-mess-platz 6868a95d: der EINE Halter `__halten` mit sieben Schaltern; Δ zweier gleicher Schüsse an S2 von 0,58 % auf 0
    (24 von 24 Paaren). Die Station dazu steht in koordination (a-spawn mit Rausch-Linse, Merge 5e0bd777).
  - w4-bewohner-wache 737704a7: die Kopf-Klasse `bewohner`, Wache-Rollen im Kern additiv. Der neuere Kopf **5ad555ed** fährt erst im
    nächsten Zug.
- **z115 fuhr nur mit w4-bewohner-wache 5ad555ed** (Kandidat b895650c): ankunft-5 und mess-platz fielen an Konflikten mit z112/z114.
  Beide habe ich selbst geheilt und gepusht:
  - w4-ankunft-5 **b1e98273**: die Baum-Karten-Linse (diag-foundry-crossfade) ohne den Streck `_ankunftsFerne`. Er fiel mit
    ankunft-3, k ≡ 1; Selbsttest, altlasten und betriebsgesetz grün, scripts −115.
  - w4-mess-platz **78a62ae9**: die EINE Uhr der Bühne aus himmel-uhr, der Pool zu seinem Fixpunkt aus mess; 8 Stücke in 4 Dateien,
    Bühnen-Selbsttest grün, scripts −352.
- **z116 wartet auf die Landung von z115** (`w3/kette-z116.sh`, Liste `w3/z116.zweige`, liest sie nach der Landung). Er trägt
  w4-ankunft-5, w4-mess-platz und w4-gras-l2 e47e5242 (A, Cloud). Das Bild von gras-l2 habe ich auf der Radeon angesehen, Wiese Ego
  und Third main↔Zweig (`w3/gras-l2-bild-out/`): die Kante bei 15 m fällt, die Wiese reicht bis an die Bäume. Die Ferne ist etwas
  fleckig, und die Dreiecke steigen; das ABAB nach der Landung urteilt E.
- **koordination ad55c327:** w4-stationen-schnell-b-koord a0ff6bd4 ist gemergt (fünf Stationen ohne kalten Ring, die Linse DER ORT IM
  DECKEL). Selbsttest 122/122 ohne (3c), die Fahrt-Wand hält an gtx und radeon. Die Stationen a (über 90 s) stehen noch aus.
- **OMEN:** takt-z114a/-b und z114-abab sind eingereiht; nach jeder Landung reiht takt-nach.sh den Takt am neuen main ein.

## Cloud — 17 Sitzungen liefen um 22:17
Alle bekamen um 22:18 die Anweisung: Stand sofort als „WIP <zweig>: … [skip ci]“ pushen, danach je Schritt, abgabereif als „Abgabe …“.
Jeder WIP-Commit nennt im Rumpf, was offen ist. **Einsammeln:** `git ls-remote origin 'refs/heads/w4-*'`, dann je Zweig `git log -3`.
- Ein WIP-Zweig wird fortgesetzt: neue Cloud-Sitzung per `start_session` (target cloud, fresh), mit Zweig, Brief und der Offen-Zeile.
- Eine Nachricht weckt keine ruhende Sitzung.

| Sitzung | Zweig |
|---|---|
| Ort-Gesetz des Prüfplatzes bauen | w4-genesis-ort-gesetz |
| A: die Tore des Prüfplatzes | w4-tore-teile |
| A: Bewohner-Köpfe und Haar im Bild | w4-bewohner-wache |
| A: der Zoo mit fester Zahl | w4-gehege |
| Ninja-Park und Spielplatz: EIN Körper-Gesetz | w4-koerper-park |
| Arena der Schmiede in die Welt | w4-arena-welt |
| Pflicht C zum Fall bringen | w4-verkehr-c2 |
| Stadt-Takt per Simulations-Stufen | w4-stadt-takt3 |
| A: Gras der Stufe L2 am Studio | w4-gras-l2 |
| A: die Baum-Karte auf Zukunftsniveau (laub-kante) | w4-laub-karte (Folge) |
| B: Pflanzen aus dem Haupt-Faden | w4-b-pflanzen |
| B: Boden aus dem Haupt-Faden | w4-b-boden2 |
| B: Code erst nach dem ersten Bild | w4-b-code |
| E: statische Draws in Render-Bündel | w4-e-buendel |
| e-vram auf main nachziehen | w4-e-vram |
| Stationen über 90 s schnell machen | w4-stationen-schnell-a (+ -koord, in koordination mergen) |
| Stationen über 45 s schnell machen | w4-stationen-schnell-b (+ -koord) |

## Der kritische Pfad von F — zuerst
1. **w4-studios-heim (ee845822) heimholen.** Er liegt seit 31.10. 12:15 neben main, 45 Commits zurück. Ein Probe-Merge um 22:35 zeigte
   35 Dateien mit rund 100 Stücken, alle in scripts/: diag-profiband 8, omen-messfolge 7, werkbank 5, abnahme-urteil 3
   (`standLeser` gegen a-spawn), ci-zeiten 3, betriebsgesetz 2 und weitere. Welle b des Plans (ort-gesetz, tore, ort-name) wartet auf
   ihn im main. Er braucht einen eigenen Arbeiter mit vollem Budget: main mergen, wo main anders löste, gilt main; Re-Mint
   gates.json; Zug. Der Worktree `w3/studios-heim3` (Zweig w4-studios-heim3, sauber) kann der Ort sein.
2. **ort-name (0a)** in der Cloud, Brief `bericht/pruefplatz/briefe/ort-name.md`. Er ist klein, byte-gleich, die A-Seite des Platz-ABAB.
   Er wurde nie gestartet.
3. **ort-wirt (0c)** lokal, Brief `ort-wirt.md`, sobald ort-gesetz im main ist. mess Teil 2 wartet auf w4-genesis-ort-wirt.
4. **grund lokal neu starten**, Brief `grund.md` (Ports 4670–4679). Der champion der Welle a baute nichts: er hielt den
   Rundblick für seinen Auftrag. Der erste Satz des neuen Prompts sagt, dass der Rundblick in main ist.
5. **strecke** in der Cloud, Brief `strecke.md`. Er wurde um 21:55 nicht neu gestartet; der Fahrer gehört C.

## B — was der heim-champion an der Radeon fand (für den nächsten Schnitt)
- Der Haupt-Faden ist bis zum Bild 11,8 von 12,5 s belegt (main 8,7 s, dort 2,8 s leer).
- 63 Knoten-Bauten kosten zusammen 3 626 ms; die Schatten-Formen von ShadowMaterial kaskade0/1 bauen weiter doppelt.
- Bis ≤ 5 s fehlen 7,5 s.
- `diag-boot-stage.cjs:76` soll vor seinen Schüssen `window.__halten(window.__halteQuellen)` rufen (Übergabe von mess an ankunft).
- Offen: eine Linse für die Klasse „ein Stoff liest uv ohne die Marke `liestUv`“; die Linse deckt bisher nur den Stein.

## Lehre dieses Abends
16 Cloud-Sitzungen zugleich verbrauchten ab 22:00 etwa 25–40 % der Woche je Stunde (63 % um 21:35 → 79 % um 22:17). Eine Welle ist
nur so breit, wie das Restbudget ihre Laufzeit trägt: Sitzungen × ~1,5–2 %/h × Stunden ≤ Rest bis 98 %. Sonst endet die ganze Welle
halb gebaut. WIP-Pushes ab Start sichern den Stand.
