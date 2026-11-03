# w5-kontakt a085a06c — Blick der GTX 1060 (OMEN, 03.11.) · schatten.K3 · schatten.K2

**Urteil: ROT.** An der GTX ist keine Kontakt-Verdeckung zu messen. Am Fuß ist das Band sogar **heller** als der freie Boden (1,063): ein Halo, keine
Verdeckung. schatten.K2 wird schlechter: 4,64 → **6,68 %** max. Kosten +1,8 ms GPU an der Wiese, davon 0,37–0,45 ms im eigenen Pass.

## Zahlen (Station g3 NEUN wörtlich, punkte-maschine 6444b257, Ort dorf, Teil B 640 × 360, Adapter nvidia/pascal)

| Kriterium | vorher main 5fba36ea | nachher a085a06c | Soll |
|---|---|---|---|
| schatten.K3 Fuß band/frei | 1,000 / 1,000 | **1,063 / 1,040** | band 0,4–0,7 ✗ |
| schatten.K3 Sockel band/frei | 1,000 / 1,000 | **0,997 / 1,000** | band 0,4–0,7 ✗ |
| schatten.K2 unerklärt max / Mittel | 4,64 % / 3,89 % | **6,68 % / 5,66 %** | ≤ 0,5 % ✗ (schlechter) |
| schatten.K5 (Wache) | 0,768 | 0,794 | — |

Das gate:post-kette (k) des Zweigs (swiftshader: Fuß 0,532, Sockel 0,388) erscheint am GPU-Frame nicht.

## Kosten an der GTX

| | main (3 Boots) | a085a06c (2 Boots) | Δ |
|---|---|---|---|
| gpu-bank Wiese | 16,15 · 16,43 · 16,57 | 18,19 · 18,27 | **+1,8 ms** |
| gpu-bank Dorf | 14,43 · 13,70 · 14,01 | 14,96 · 15,53 | **+1,2 ms** |
| Pass `kontakt:verdeckung` | — | 0,45 (Wiese) · 0,37 (Dorf) | |
| lauf Wiese fps | 57,6 · 53,0 · 52,8 | 51,5 · 47,2 | −5 fps |

Der Pass selbst kostet ≤ 0,45 ms. Das übrige ~1,4 ms trägt das Lesen im aoNode von Boden und Halm, also jedes Gras-Fragment.

## Bilder

- `kontakt-schatten-K3.jpg`: die Pose der Station (Sonne aus): Haus-Block links, Körper rechts. **Am Fuß stehen die Halme bis über
  das Band 2–18 cm**: die Station misst dort Gras, nicht Boden. Eine Verdeckung des Bodens am Fuß ist in beiden Bildern nicht zu sehen.
- `kontakt-schatten-K2-maske.jpg`: das Bild mit den meisten unerklärten Pixeln im Gang (rot). Im Zweig liegt dichteres Rot über der ganzen
  Wiese und im Busch links.
- `kontakt-wiese-third.jpg`, `kontakt-dorf-ego.jpg`: in Third und Ego dunkelt der Zweig das Gras im Halbschatten tief ab (mehr Tiefe in den
  Büscheln). Am Spieler-Fuß sehe ich keinen Kontakt. Eine Doppelkontur sehe ich nicht. Im Schatten unter den Kronen wirkt das Gras schwerer und dunkler.

## Das Auge: wo es falsch aussieht

1. **Fuß-Band 1,063 > 1: ein heller Saum statt einer Verdeckung.** Das ist ein Halo-Bild der halben Auflösung (GTAO 720 × 405 nach dem Bild,
   `_kontaktPassZeichne`), das am Fuß eher aufhellt als verdeckt. Oder es ist das indirekte Licht allein: die Station misst ohne Sonne, und das aoNode
   wirkt laut Zweig nur aufs indirekte Licht.
2. **schatten.K2 schlechter (+2,0 Punkte max).** Es gibt zwei Kandidaten aus diesem Zweig: die Blende `_ditherIGN` am Welt-Raster der Kaskade (ohne
   Rotation) und das zeitliche Rauschen der GTAO halber Auflösung im Gang. Die Station trennt das nicht (beide Gänge tragen GTAO, nur die
   Schatten-Intensität wechselt). Eher ist es also die Blende der Kaskade. Beim Namen: `_ditherIGN` am Welt-Raster der Kaskade (`stamm/bild-schatten.js:346`,
   `:1024`) mit dem Ursprung aus `_kaskadeFit` (`:282`) im Zweig.
3. FUND für die Station: am Ort dorf bedeckt Gras das Kontaktband. Fuß und Sockel brauchen eine gemähte oder ebene Bodenstelle, sonst misst K3 Halme.

## Belege

`p3/n0311/w5/aus/a085a06c/` (neun.json, Kosten, bilder/), `aus2/a085a06c-1338/` (Kosten 2. Boot), main `aus/5fba36ea/`,
`aus2/5fba36ea-1332|1343/`. Läufe unter `p3/gpu-lauf.sh`. Nichts gebucht.
