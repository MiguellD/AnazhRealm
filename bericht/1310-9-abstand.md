# Bericht 1310-9 — in der Stufe zeichnet vorn zuerst

**Status: ZWISCHENSTAND.**

**Urteil:** Die Reihe im Bündel ordnet innerhalb einer Stufe nach dem Abstand der nächsten Instanz zum Auge, nicht mehr nach dem
Schlüssel. Neu gestellt wird nur beim Anker-Wechsel (Auge 16 m weiter) und bei jeder Aufnahme, also nie je Frame.
- An der Wiese fällt gpu-bank in EINER Sitzung bei gleichem Takt von **12,5 auf 11,8 ms**, der Baum-Preis von 3,7–3,8 auf
  3,0–3,1 ms.
- Mit 1310-8 zusammen: 14,0 → 11,8 ms.
- Zweig **welle-m-e-baum-wirt 4b0fd232** `[ci voll]` (auf a0918e5e).

## Der Schnitt

- `_buendelKinderReihe(bundle, auge)`: Trägt der Ruf das Auge, sortiert er innerhalb einer Stufe nach dem kleinsten Abstand
  einer Instanz der Gruppe (Instanz-Matrix, x/z). Im Gleichstand und ohne Auge entscheidet der Schlüssel.
- `_buendelAnkerPruefen(pos)`, gerufen am Kopf von `_tickArchitectureLOD`:
  - je Frame nur ein Abstandsvergleich;
  - erst wenn das Auge `BUENDEL_ANKER_M` (16 m) vom letzten Anker steht, stellt jedes Region-Bündel seine Reihe neu und nimmt
    EINMAL neu auf (Gebot 7).
- Aufnahmen und das Wachsen der Gruppe stellen mit dem aktuellen Anker; Stufen-Wechsel laufen über die Aufnahme.
- **Linse** `gate:profiband` H7:
  - die Reihe nach Abstand (L0 bei 40 m · L1 bei 1 m · L0 bei 50 m und 3 m → die L0 mit der 3-m-Instanz zuerst);
  - der Anker: erster Ruf stellt, 10 m stellt nicht (keine Neuaufnahme), 20 m stellt;
  - der Ruf im Takt.

  Der Selbsttest wird rot ohne Abstand, mit einem Anker je Frame und ohne Ruf.

## Gemessen (EINE Sitzung, Wiese, Gier 0; je Schalter gpu-bank 12 × 3 an/aus; `1310-9/`)

| Reihe innerhalb der Stufe | Baum-Preis | gpu-bank Bäume an | Takt |
|---|---|---|---|
| Schlüssel (a0918e5e) | 3,71 · 3,80 | 12,43–12,52 | 1730–1732 |
| Abstand zum Auge (4b0fd232) | 3,06 · 3,00 · 3,04 | 11,66–11,88 | 1716–1740 |

Ohne Bäume liegen beide Reihen gleich (8,67–8,79 ms).

**Wände** (`1310-9/waende.txt`): lint, format:check, gate:profiband (H7 mit Abstand und Anker), gate:foundry-crossfade,
gate:pflanzen-nah (23), Puls ci-lokal 18/18, playtest:fast 22/0.

## Pflicht-OFFEN Rest

- Der CPU-Nebenbefund der Wiese (+0,5 ms je Bank-Frame ohne Bäume, 1310-5): nicht vermessen.

## Status ZWISCHENSTAND + Übergabe

- Branch welle-m-e-baum-wirt, Kopf 4b0fd232, gepusht `[ci voll]`. CI 38474954929 läuft (dazu 38473549071 an a0918e5e).
  Arbeitsbaum sauber.
- Werkzeug `p3/k8`: `kinder.cjs` (… · schluessel · abstand), `sitzung-d.sh`, `patch-abstand.cjs`.
