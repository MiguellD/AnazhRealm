# 0911 — karteNadel: EIN Knoten je Atlas (w27-karte-nadel 18d6d1a7, GTX 1050, auf da0e790f)

Zeiten auf der GTX 1050 sind Vergleich, nie Urteil. Die Bild-Probe fuhr mit der Proben-Abgabe w27-stadt-bild (436bdf73) nur
für den Lauf überlagert (werkbank.cjs, haushalt.json): Ohne sie kommt bild:stadt-voll nie bis zur Kamera.

## Geschnitten

- **Täter: `stamm/stoff-karte.js` `_karteNadel`.** Wuchs der Karten-Atlas über 32 Schichten, legte er eine NEUE `uniformArray`
  „karteNadel“ (und „karteJahr“) an. Die Albedo der Karte (`stoff-material.js:1260/1263`, beim Stoff-Bau) hielt den alten Knoten, das
  Laub-Licht (`_laubLichtStoff`, `setupLightingModel` je Programm-Bau) holte den neuen. Im Programm standen zwei Deklarationen
  (32 und 64). WGSL meldete „redeclaration of karteNadelStruct“, und die Pipeline der Karte sagte ab.
- **Schnitt:** EIN Knoten je Atlas ab Geburt. Nadel und Jahr wachsen IN ihrem Knoten (r184 liest die Länge je Programm-Bau,
  `UniformArrayNode.setup`), so wie die Atlas-Texturen nur ihren Wert tauschen. Kein zweiter Knoten, kein try/catch.
- **Linse (Familie Bruch-Melder/GPU-Wache):** Die Wache der Reihen in `_laubLichtStoff` zählt je Programm-Bau der Karte die Knoten je
  Name. Bei zwei Knoten meldet `_bruchMelden` „KARTE: 2 Knoten „karteNadel“ in EINEM Programm“, und zwar vor der GPU.
  `gate:foundry-impostor` C5 lässt die Nadel über ihre Länge wachsen (Soll: schweigt) und injiziert einen zweiten Knoten (Soll: genau 1 Meldung).

| Messung (GTX 1050) | vorher (stamm da0e790f) | nachher (w27-karte-nadel) |
|---|---|---|
| gate:foundry-impostor C5 (bc + rgba8) | ROT: Wache der Reihen 2 Meldungen „2 Knoten karteNadel“ | GRÜN (EXIT 0, 64 s) |
| bild:stadt-voll@0.5 umstellen | Exit 0 (353 s) | Exit 0 (353 s) |
| bild:stadt-voll@0.5 bild | ERST-ZEICHNUNG OFFEN nach 120 s, PIPELINE-ABSAGE MeshStandardNodeMaterial_171/_226 | Urteil nach 3 s |
| GPU-Wache am Ort | 2 Meldungen (WGSL redeclaration, Pipeline-Absage) | keine |
| gate:welt-boot | — | GRÜN (EXIT 0, 46 s) |
| gate:betriebsgesetz | — | GRÜN, scripts −7 Atome (Linse gegengebucht: Kurzformen der Auswertung, Wind-Fälle) |

## Ehrlich offen

- bild:stadt-voll bleibt ABNAHME ROT, jetzt aus einem anderen Grund: „Ziel Blickziel verdeckt von Rinde baum_kiefer in 45,17 m“.
  An der Pose der Spec (Markt, Blick 60 m nach Osten) steht eine Kiefer im Ziel. Das ist eine Entscheidung über Pose oder Ziel.
- Dass der Atlas am Ort über 32 wächst, ist durch das Vorher bewiesen (die Redeklaration entsteht nur beim Wachsen). Die Zahl der
  Schichten am Ort ist nicht gemessen.

Bilder (Schirm des Spiels nach 1 s Loop, OHNE Abnahme): `0911-karte-nadel-schirm-vorher.png` (da0e790f + Proben-Abgabe),
`0911-karte-nadel-schirm-nachher.png`. Die PNGs folgen, sobald die GTX 1050 angemeldet ist. Der Zweig liegt auf GitHub als
`w27-karte-nadel` 62109c75 (Baum byte-gleich 18d6d1a7: 135c666e), er fährt in z355.
