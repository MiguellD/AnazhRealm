# Bericht 1810 B5 — Zwischenstand (Schneider pausiert für F6)

**Status: ZWISCHENSTAND.** Der Schnitt steht; es fehlen die Lauf-ABAB, die Zweit-Boot-Prüfung und ein zweiter echt-Lauf am finalen Kopf.
- **Zweig:** `b5-lieferung`, Paket B4+B5, Code-Kopf **7306712e**, WIP-Kopf **5c2a0247** (gepusht, `[skip ci]`).
- **A-Seite:** integ ab97f0a8 (Baum 9b3acc1d).

## Geschnitten
- **EIN Rang-Datensatz je Auftrag/Zug** (`_foundryRang`).
  - Derselbe Datensatz in Schlange, Flug und Wächter. `_foundryNaeher(rang, wo)` hebt ihn dort, wo der Zug steht (Befund 1 des
    B4-Prüfers). `_foundryWahl` liest ihn.
  - Bild-Rang der Bahn in `_foundryPumpe`: Ein Kopf (`rang.kopf`) geht in eine Bahn ohne Arbeit.
  - Köpfe beim Buch (`_buchKoepfe`): die Leib-Stufe des Bilds und der Start-Dorf-Export (`_startDorfBestellen`).
- **Leib:** Ego ohne Gerät bestellt vor dem Bild nur L1; L0 kommt nach `_weltbildKommt` (`_leibFeinTausch`).
- **Ortlose Leser:** Die Nah-Wiese hat jetzt `wo` = Auge, der Gesetz-Fit `wo` = Platz. Die fluss-linse reicht den Rang durch (Befund 2).
- **Linsen:** gate:ankunft L2a (Köpfe, Bild-Rang, Bahn-Rang), gate:takt T5 (Anhänger am Wächter), je mit Selbsttest. scripts/ netto −2.
- **Benannt gelassen:**
  - Wurf-Stufe nach dem Bild, „bauten" ohne Wurf-Zwilling, Karten-L1 außer Blick.
  - 3rd-Ankunft und Gerät in der Hand bestellen L0 weiter vor dem Bild. Die Grobstufe hat keinen Griff und ist 3 m vor dem Gesicht
    sichtbar gröber.

## Gemessen (GTX)
- Am Code-Kopf 7306712e sind alle Wände grün (Puls 17/17), die echt-Batterie auf dem CI-Weg 21/21 grün.
- Serie 3 gegen ab97f0a8, kalt 6+6:

| Größe | A ab97f0a8 | B 7306712e |
|---|---|---|
| t(Weltbild) | 16,62 s | 16,40 s |
| t(Leib) | 10,92 s | **6,12 s** |
| Dorf-Export gesendet | 4,39 s | 2,66 s |
| Warten der Streu-Aufträge | 7,91 s | **0,00 s** |

- Zweit-Boot 6+6: Weltbild 11,78 → 11,97 s. Das wird gegen die Zerlegung des Haupt-Fadens geprüft, offen.
- Rohdaten auf der OMEN: `p3/n1810/b5/schnitt/` (kalt, zahlen.md, bild, fortschritt.log).

## Offen
- Bild A, Lauf-ABAB stehend und gehend (Wiese + Genesis), die Zerlegung der ~12 s Haupt-Faden warm.
- `gate:analog-nah` Selbsttest S am Paket-Kopf auf der GTX.
- Die echt-Batterie ein zweites Mal am finalen Kopf.
- Der letzte Commit `[ci voll]`.
- Weiter nach F6.
