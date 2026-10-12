# Übergabe 1110-9 Tor-Wurf (welle-m-e-torwurf), NOTBREMSE 12.10. (Woche 96 %)

- **Branch:** welle-m-e-torwurf. Kopf **52ac16d8** `[ci voll]` (per ls-remote). Gemergt auf main bb554abf, Arbeitsbaum
  sauber.
  - Die CI 38245061535 lief zur NOTBREMSE.
  - Bericht `bericht/1110-9-torwurf.md` (koord 9d4d15aa), angenommen als ehrlicher Zwischenstand.
- **Was steht:**
  - Die NUR-WURF-Stufe 3 der Tore und die Kosten-Regel `_wurfVonBilligerer` (generisch, N5).
  - gate:regler-wirkt WURF.
  - Genesis: Befehle 201 → 169, Dreiecke 946k → 720k, CPU-Takt p95 −0,5 ms.
  - 19 Wände und der volle Playtest sind grün; gate:tor-fern läuft in CI-Gruppe 9.
- **Begonnen und offen: das +1,24 ms GPU je Frame im Band** an der Genesis (−2,3 fps unter Regler voll) bei gpu-bank
  −0,10 ms.
  - Gemessen ist ein Toggle in EINER Sitzung: B, Instrument abab-i543, Ort genesis, `band --ort genesis` je 10 s, Grundstand
    und Schalter im Wechsel. Rohdaten `1110-9/torwurf/toggle/`.

    | Schalter | Grundstand (ms) | mit Schalter (ms) | Δ |
    |---|---|---|---|
    | Zwillings-Stoff schlicht (ohne Atlas-Alpha, Maske, Wind), 5 Gruppen | 20,28 · 20,37 · 20,30 | 21,35 · 21,26 · 21,42 | +1,0 … +1,1 |
    | Fernform-March der Tore aus (7 Felder, Hülle um `_weltFeldAktiv`) | 20,53 · 19,87 · 20,47 | 20,97 · 21,28 · 20,89 | +0,4 … +1,4 |
    | Tor-Zwilling ganz weg (Befehle 172 → 167) | 20,13 | 21,36 | +1,2 |

  - **Befund:** Jeder Eingriff macht das folgende Band teurer, auch das Entfernen des Zwillings. Der Grundstand selbst
    hält 20,1–20,5 ms.
  - Die Toggle-Methode trennt hier also nicht. Kandidat für das Artefakt: Ein Eingriff erzwingt die Neuaufnahme der Bündel
    bzw. neue Pipelines, und das Band misst die Erst-Zeichnung mit.
  - Damit sind beide Kandidaten (Fernform-March, Schatten-Stoff des Zwillings) NICHT belegt und NICHT entlastet. Der Täter
    ist ohne Namen.
- **Nächster Schritt:**
  1. Das Band-Delta per ABAB der Boots zerlegen: zwei Builds von B, einer mit `fernform` der Tore „gesetz“ statt „huelle“,
     einer ohne den Zwilling (`schatten: 0` in der Tor-Zeile). Je 3 Boots an der Genesis, Band GPU je Frame plus gpu-bank.
     Alternativ in der Sitzung je Schalter erst ein Aufwärm-Band verwerfen, dann messen.
  2. Den Täter beim Namen, wenn klein, schneiden.
  3. Karte (2): 13 Stoff-Züge je Tor.
  4. (3) Dorf-VRAM.
- **Offene Linse:**
  - Das Band misst nach jedem Eingriff ein Aufwärm-Delta. Eine Linse, die das Erst-Zeichnen vom Dauer-Zeichnen trennt,
    fehlt; das Werkzeug ist `p3/tor/toggle` auf dem OMEN, Kopie unter `1110-9/torwurf/toggle/`.
  - Aus dem Bericht stehen offen:
    - Schatten in EINER Welt 11 m 0,93 (Flügel) und 30 m 0,73–0,80 (Selbst-Wurf der Hülle, `einzugM` 0);
    - das Fernform-Paar jenseits des Cull-Radius (bei 170 m stand der Ring in A nicht: `__anazhAutoSettlement = false` hält
      auch `_tickGenesisOrt` an);
    - die Kosten-Regel zählt nur Dreiecke (kathedrale und geisttor werfen meist aus Stufe 0).
- **Worktrees auf dem OMEN** (bleiben):
  - welle-m-e-torwurf;
  - abab-b543 (bb554abf, LF) und abab-i543 (Instrument, Genesis-Variante uncommitted wie in 1110-10);
  - abab543 (Rohdaten 1110-12).
