# Bericht 1310-8 — der Baum-Preis an der Wiese hat seinen Namen: die Reihe im Bündel

**Status: ZWISCHENSTAND.**

**Urteil:** Der Term ist die **Reihenfolge**, und zwar die der Gruppen IN dem einen `@wahl`-Bündel der Wiese. Bis jetzt
entschied die Ankunft ihrer Assets beim Boot.
- In EINER Sitzung trägt allein diese Folge den Baum-Preis von 3,3 bis 7,3 ms.
- Der Schnitt stellt die Gruppen nach ihrer Stufe, L0 zuerst. Zweig **welle-m-e-baum-wirt a0918e5e** `[ci voll]` ab main 785cca46,
  K24 bleibt.
- Auf dem Zweig fällt gpu-bank an der Wiese von **14,0 auf 12,9 ms** bei gleichem Takt (1721–1732 MHz), das Bild bleibt gleich.

## Der Weg (Halbierung)

- **Methoden:** Zwischen bb554abf und 785cca46 sind 42 Methoden geändert, 12 neu und 4 entfallen (`1310-8/diff.json`,
  `methoden-diff.cjs`). Für die nahen Studio-Bäume zeichnet davon keine anders:
  - `_teilWirft` ist wortgleich mit dem alten Ausdruck;
  - die Wurf-Kosten-Regel gilt nur NUR-WURF-Stufen;
  - Karten-, Impostor- und Grammatik-Methoden zeichnen die nahen Bäume nicht.
- **Bündel-Reihe:** An der Wiese gibt es in A und B nur EIN Bündel (`@wahl`, 49 Gruppen, 48 lose Objekte;
  `reihe-A.txt`, `B/reihe-start.txt`).
- **Plätze:** Alle Laubbäume stehen in A und B an denselben Stellen, dieselbe Signatur je Art (`plaetze-A/B.json`).
- **Folge IM Bündel:** Allein durch Umstellen der Kinder wandert der Preis in EINER Sitzung (Welt B, `B2`, `B3`):

| Folge der 49 Gruppen | Baum-Preis (an − aus) | gpu-bank Bäume an |
|---|---|---|
| Ankunft beim Boot | 5,02 · 5,25 | 13,9–14,3 |
| Folge, die A beim Boot hatte | 5,63 · 5,55 | 14,5–14,8 |
| nach Stufe aufsteigend (L0 zuerst) | **3,46 · 3,33** | **12,3–12,5** |
| nach Stufe absteigend | 7,26 | 16,2 |

- Die nahe Stufe schreibt die Tiefe, hinter der die fernen Stufen ihre Fragmente verwerfen.
- Die Ankunft ist Zufall des Boots. Darum streute der Baum-Preis zwischen den Sitzungen (A 3,8–4,5, B 5,1–5,7) und erschien als
  Mehrpreis von K24: Der Re-Mint der Koniferen änderte ihre Ankunft.

## Der Schnitt

- `_buendelKinderReihe(bundle)` sortiert die Kinder eines Bündels nach `buendelStufe` (die Stufe des Leafs, die Atlas-Karte
  zuletzt), im Gleichstand nach Schlüssel.
- Gerufen wird sie nach jeder Aufnahme in `_archInstanceGroupFor` und nach dem Tausch beim Wachsen der Gruppe.
- Der Flatten gibt jedem Leaf `stufe: lod` mit.
- Das ist dieselbe Klasse wie `_buendelReihe` (1310-1, Lehre 23), eine Ebene tiefer.
- **Linse** `gate:profiband` H7: Sie führt `_buendelKinderReihe` aus dem Stamm über ein Bündel in Ankunftsfolge aus
  (L1 · Karte · L0 · L0 · Zwilling) und prüft beide Aufrufe. Der Selbsttest wird rot ohne den Aufruf, bei verkehrter Reihe
  und ohne die Funktion. Auf main fehlt sie, dort ist die Wand rot beim Namen.

## Gemessen auf dem Zweig (EINE Sitzung, Gesetz gegen Ankunft im Wechsel; `1310-8/C`)

| Reihe | Baum-Preis | gpu-bank Bäume an | Takt |
|---|---|---|---|
| Ankunft (vorher) | 5,01 · 5,04 | 13,87–14,13 | 1721–1725 |
| Gesetz nach Stufe (Schnitt) | 3,86 · 4,01 | 12,76–12,98 | 1721–1732 |

- Das Gesetz sortiert im Gleichstand nach Schlüssel. Die Ankunft lag innerhalb der Stufe zufällig günstiger (3,3–3,5); eine
  Folge nach Abstand innerhalb der Stufe wäre ein weiterer, kleinerer Schritt.
- **Bild:** Wiese, Gier 0, je Reihe zwei Aufnahmen (`C/bild-vergleich.txt`, `wiese-ankunft1.jpg` / `wiese-gesetz1.jpg`).
  Jedes Quer-Paar liegt im Rauschboden; Luma 116,6 in allen vier (ΔLuma 0,02). Der Rauschboden liegt bei MSSIM 0,98, weil Wind
  Gras und Laub bewegt.

**Wände:** Puls ci-lokal 18/18 (`check:statik` lief nach dem Beenden eines stehen gebliebenen save-servers auf 4312 grün),
gate:profiband, gate:foundry-crossfade, gate:pflanzen-nah (23), format:check, lint, playtest:fast 22/0.

## Pflicht-OFFEN Rest

- Die Reihe innerhalb einer Stufe (nach Abstand statt Schlüssel): benannt, nicht geschnitten.
- Der CPU-Nebenbefund der Wiese (+0,5 ms je Bank-Frame ohne Bäume, 1310-5): nicht vermessen.

## Status ZWISCHENSTAND + Übergabe

- Branch welle-m-e-baum-wirt, Kopf a0918e5e, gepusht `[ci voll]`, CI 38473549071 läuft. Arbeitsbaum sauber.
- Werkzeug `p3/k8`: `methoden-diff.cjs`, `kinder.cjs` (zeigen · setzen · ankunft · gesetz), `stufenfolge.cjs`, `plaetze.cjs`,
  `sitzung-b3.sh`, `sitzung-c.sh`.
