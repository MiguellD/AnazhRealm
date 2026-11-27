# Stand-Blatt pegel-nach-brand — ZWISCHENSTAND

Sprosse: `karte2.same.kopplung.stoerung#3` (Richter: Tierdichte −50 % sofort, Rückkehr 3–10 a; Pegel-Spitze ≥ 1,3 ×).
Basis: origin/main 7e73426e (V18.546.453).

## 27.11. 12:58 — Täter-Zahl (headless, Rumpf S3 der Station, null-Renderer, Kopf 7e73426e)
- `pegelSpitzeFaktor` **1** — Flusstiefe 0,758 m → 0,758 m an den 8 Flusspunkten 249–275 m vom Brand-Block (7 × 7 Zellen à 16 m, 49 Taten „brand“, 1,25 ha), Wetter sunny, 2 Regen-Stempel, Pegel-Zustand gereist.
- Täter: `stamm/wasser-hydro.js:287` `_pegelZustand` → `gelaende-core.js:1787` `pegelLauf` / `:1902` `pegelTafel`: die Tafel ist eine Funktion von (Höhe y, Lag-Klasse j) allein — kein Glied liest die Taten „brand“, der Abflussbeiwert des Regens ist die Konstante 0,3 der Wiese (`PEGEL.regen`).
- Plan: der verbrannte Anteil des Einzugsgebiets je Knoten des Flussnetzes (Taten „brand“ über `knotenFluss` stromab geführt, gerechnet je Änderung der Taten) hebt den Abflussbeiwert; die Erholung folgt der Uhr der Narbe.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 13:10 — Schnitt im Kern steht, der Befund der Krone
- Geschnitten: gelaende-core `pegelBrand` (die Taten „brand“, gewogen mit ihrer Asche, stromab durch das Knoten-Netz: Ebene 2 → `knotenFluss` → Mündung `aus.von` → Ebene 1/0; je Knoten b = Fläche/Einzugsgebiet, m = 1 + b·(0,56/0,3 − 1)), `laufQ` (EIN Abfluss je Klasse, m-fach der Regen), `pegelTafel(…, brand)` (je verbranntem Knoten seine Reihe), `KANAL_FELDER` 11 → 12 (Feld 11: der Knoten des Glieds), die Leser `flussAm` · `spiegelQuer` · `flussRand` und `pegelKlassen.knoten` (die Marke des Chunks); stamm/wasser-hydro.js `_pegelTafel` liest die Taten, `_pegelMarkeVon` die Paare.
- Gemessen (headless, Mess-Bach der Station, 8 Punkte, Knoten der Ebene 1): Brandfläche 81 Zellen → m 1,112 · 2 601 Zellen → 1,867/1,487 · 10 201 Zellen → 1,867 an allen 8; `pegelBrand` 0,3–1,7 ms. Erholung an der Uhr der Asche: m 1,867 (0 a) → 1,855 (0,5 a) → 1,477 (1 a) → 1,001 (2 a).
- BEFUND: der Mess-Bach steht beim Boot bordvoll (Hub 0,20 m = Krone, F₄ 0,40) und jeder Regen sättigt an der Krone (`pegelHubVon` deckelt bei `krone` 0,2 m: q über 0,00055 m/d trägt die Aue, „nicht gerechnet“; der Regen der Wiese führt 0,072 m/d je Stärke 1 = 80 × die Spende). Die Tiefe am Bach bleibt darum 0,758 → 0,758 m auch mit m 1,867 — die Station liest 1 ×, bis die Aue den Überschuss trägt.
- Unter der Krone (leichter Regen ρ 0,002–0,004, 1 800 s Kalender) hebt der Brand die Tiefe: 0,548 → 0,638 m (×1,164) · 0,578 → 0,678 m (×1,17) · 0,478 → 0,538 m (×1,13). Die Tiefe folgt Manning q^0,6, der Brand multipliziert nur den Regen-Anteil: unter der Krone ist ×1,3 in der Tiefe mathematisch unerreichbar (b = 1 → höchstens ×1,21 an der Krone). Die Pegel-Spitze ≥ 1,3 × verlangt die Aue (Hub über der Krone) — sie bleibt offen an `gelaende-core.js pegelHubVon` (krone).

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 13:40 — Gegenlauf und Linse
- Gegenlauf ohne Brand, main 7e73426e ↔ Zweig, byte-gleich: Tafel 304478915ec09a1b · Marken ed0a3cba23ca39b1 (169 Chunks, 77 mit Wasser) · Spiegel 98dae146d090ddb6 (400 Punkte) · Quer/Rand 1aab84a5b5e487a3 (100).
- Linse in der Familie `scripts/diag-wetter-wache.cjs` (Teil A „Abfluss nach Brand“, Leser `brandAbflussRot`): am main 7e73426e ROT (Tiefe 0,658 → 0,658 m, ×1,000), am Zweig GRÜN (0,658 → 0,744 m, ×1,131); gepflanzt am lebenden Kern (`pegelBrand` → null) → ROT an (A) BRAND; Gegenlauf 0,658 m byte-gleich; Selbsttest drei Täter je genau einmal ROT; Lauf 58 s.
- Offen: die Aue (Pegel-Spitze ≥ 1,3 ×) · das Tier flieht nicht (`_kreaturNahrung`, stamm/kreatur-leben.js — eine andere Bahn) · die Seen lesen den Brand nicht (`waterLauf`).

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. 14:30 — Vorprüfung 1 (auf main 7e73426e)
- Statik ganz grün (die Wachstums-Wand gegen origin/integ-probe: Prüf +1 516 / Spiel +1 165 Atome) · format:check grün · lint 0 Fehler · stamm-umzug --nach-karte 0 Abweichungen · `pegelBrand`/`BRAND_ABFLUSS` in studio-vertrag §9.
- Kandidat der Station unter `cloud-post/pegel-nach-brand-station/`: die Spitze im Regen statt im trockenen Wetter; Soll und Richter unverändert, die Sprosse bleibt damit ROT (×1,13–1,16 < 1,3).
- `zug.sh probe-tag` steht in keinem lesbaren Zweig dieses Containers (wie mischwald und spanne-auge melden); die Tore nach den Pfaden: gate:webgl-probe, bild:dorf@0.5, gate:worker-dichte (Kanal 12 Felder), gate:wetter-wache (die Linse).

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.
