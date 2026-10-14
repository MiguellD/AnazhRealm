# Bericht 1410 — die GTX-Ratschen neu am Kopf (Bündel V18.546, integ-probe dc3e5ac7)

**Status: ZWISCHENSTAND.**

**Ergebnis:** Sechs GTX-Ratschen sind neu gemintet, je Ort × Sicht aus 4 Läufen: Wiese am K55-Ort −278/−1038,
Genesis an der Ring-Mitte 0/0, Dorf; jeweils Ego und Third.
- **Zweig gtx-ratschen-1410**, ab integ-probe dc3e5ac7:
  - 7d720cf7: der Mint kappt die Gesamt-Zeile;
  - **704fc303** [ci voll]: die sechs Ratschen;
  - davor 6 WIP-Commits je Ratsche, [skip ci].
- `gate:profiband` lokal grün. Die Band-Wand steht, H2b hält für alle 12 Ratschen, Selbsttest 40/40. CI 38567269108 an 704fc303 GRÜN 13/13 (puls 2/2, voll 11/11, darin die Gelände-Linse).
- **Ein Werkzeug-Fehler, an der Wurzel geschnitten** (7d720cf7):
  - Der Mint zog jede Zeile je Lauf auf ihr eigenes Minimum. Die Summe der Erzeuger-Minima lag dann unter dem Minimum der
    Gesamt-Zeile: vramMB 96,3 gegen 96,2 (wiese × third), 98,9 gegen 98,8 (genesis × ego).
  - H2b nannte beide rot, eine solche Gesamt-Zeile feuert nie.
  - `ratscheNachziehen` kappt jetzt Befehle, Dreiecke und vramMB auf die Summe ihrer Zeilen und nennt die Kappe beim
    Namen.
  - Selbsttest S32 neu. S10 erwartete bisher eine Gesamt-Zeile über ihren Zeilen (12 gegen 7 + 3); er hält jetzt die
    Kappe.

## Die Ratschen (Gesamt: Befehle / Dreiecke / VRAM MB; Version 18.546.0, 4 Läufe)

| Ort | Ego | Third |
|---|---|---|
| Wiese (K55, −278/−1038) | 75 / 286 558 / 94,4 | 85 / 323 944 / 96,2 |
| Genesis (0/0) | 157 / 465 813 / 98,8 | 191 / 589 150 / 104,3 |
| Dorf | 104 / 344 577 / 97,2 | 111 / 406 223 / 98,5 |

- **Profi-Band:** Alle sechs liegen im Band, ≤ 208 Befehle, ≤ 680k Dreiecke, ≤ 118 MB. Die größte Zeile ist Genesis
  Third mit 191 Befehlen (0,92×).
- **Gehoben gegen die alten V18.545-Ratschen** (jede Zeile steht in `mint2-*.txt`):
  - baum in k0 und k1 an jedem Ort (Nadelwald seit K16 und K20);
  - bau.k0 an Genesis 26 → 33 Befehle und 33 200 → 58 656 Dreiecke: die Tore `f:gt`, `f:drachentor` und `f:maurentor`
    werfen in Kaskade 0;
  - streu.k0 (die Nah-Streu wirft);
  - formationen.k0/k1;
  - nahWiese.haupt an der Wiese, 57k → 66k.
- **Gesenkt** u. a.: die Leib-Zeile (einzelstuecke, welle-m-e-leib), boden.haupt an der Wiese (70 379 → 55 698), VRAM
  (TAAU, Boden-Satz: Wiese Ego 112,4 → 94,4 MB).

## Frames je Lauf (Regler voll: fps / Frame p95 / CPU-Takt p95 / Band-GPU ms; Dorf trägt nur das Band)

| Ort × Sicht | Serie 1 erst | Serie 1 zweit | Serie 2 erst | Serie 2 zweit |
|---|---|---|---|---|
| Wiese Ego | 101,3 / 16,7 / 6,4 / 10,46 | 99,8 / 16,7 / 6,0 / 10,85 | 98,8 / 16,7 / 6,7 / 10,03 | 99,5 / 16,7 / 6,3 / 10,43 |
| Wiese Third | 92,5 / 16,7 / 7,4 / 10,39 | 100,6 / 16,7 / 6,0 / 9,83 | 97,1 / 16,7 / 6,4 / 10,42 | 100,4 / 16,7 / 6,2 / 10,80 |
| Genesis Ego | 97,3 / 16,8 / 7,5 / 9,88 | 99,2 / 16,7 / 7,2 / 9,63 | 94,5 / 16,7 / 8,9 / 10,30 | 97,9 / 16,7 / 7,0 / 10,43 |
| Genesis Third | 79,7 / 16,8 / 8,3 / 11,83 | 79,9 / 16,8 / 8,0 / 12,26 | 79,4 / 16,8 / 9,6 / 11,83 | 80,0 / 16,8 / 7,7 / 11,48 |
| Dorf Ego | – / – / – / 14,58 | – / – / – / 14,55 | – / – / – / 14,36 | – / – / – / 13,35 |
| Dorf Third | – / – / – / 12,80 | – / – / – / 12,83 | – / – / – / 13,18 | – / – / – / 13,57 |

Frame p95 hält überall (≤ 16,8 ms). Der CPU-Takt p95 liegt bei 6,0–9,6 ms über dem Band von 5,8 ms. Das ist der offene
Term aus der letzten ABAB.

## Die Messung

- **Seite:** `abab-p551` = 51cc19af. Die ausgelieferte Seite ist byte-gleich mit dc3e5ac7, denn dc3e5ac7 ändert nur
  `scripts/diag-pruefbuehne.cjs` und `scripts/lib/draw-zaehler.cjs`.
  - Fingerabdruck `fa9ba603…` vor und nach jedem der 24 Läufe, nie rot.
- **Instrument:** `abab-i551b` (omen-messfolge 51cc19af) mit drei lokalen Teilen:
  - der Draw-Zähler d6e4b259, also derselbe wie im Kopf;
  - der Haushalt-Patch der Orte: Wiese aus mess-wiese 54c78ff3, Genesis 0/0 mit Blick −10/0;
  - der Mint-Fix 7d720cf7. Die sechs Ratschen sind mit ihm aus denselben 24 Läufen neu gemintet.
- **Ablauf:** Je Ort × Sicht zwei Serien aus Erst- und Zweit-Boot (`--serie`, das Profil hält die Platte), vor jedem
  Erst-Boot fällt der Spielstand beiseite.
- **Linse:** sauber außer an den alten Ratschen („ratsche"/„weit"). Die Stufen-Wand blieb in allen 24 Läufen ohne Rot,
  der Draw-Zähler liest die Senken richtig.
- **Rohdaten** `p3/k1410d`: 24 Boot-JSON, `mint-*.txt` (erster Mint), `mint2-*.txt` (mit Kappe), `fortschritt.log`,
  `serie.sh`, `gate-profiband2.txt`.

## Was mit den Ratschen zusammen gehört

- **Wiese:** Die Ratschen gelten für den K55-Ort. Der Haushalt am Kopf sagt noch −900/−850, die Ratsche nennt nur `ort:
  wiese`. Darum gehören gtx-ratschen-1410 und mess-wiese 54c78ff3 in denselben Merge. Ohne K55 misst die Band-Linse
  −900/−850 gegen Werte von −278/−1038.
- **Genesis:** Ebenso misst der Haushalt am Kopf noch mit `spieler` 36/0. Der Eintrag Genesis 0/0 mit Blick −10/0 (K43-2)
  gehört mit in den Haushalt.
- **Radeon:** Die Radeon-Ratschen sind nicht Teil dieses Auftrags. H2b ist grün, sie liegen höchstens eine Version zurück.

## Nachtrag zur CI von d6e4b259

- **voll 1/11 (Gelände-Linse):** lokal an welle-m-e-instanz d6e4b259 GRÜN (`gate:gelaende-realismus` EXIT 0 in 70 s: Selbsttest, alle Natur-Zahlen im Korridor, drei Saaten, gebauter Boden grün; `p3/k1410d/gelaende-realismus.txt`). Die CI-Röte war ein Ausreißer des Läufers, kein Code. puls 1/2 war das Siegel-Wort in meiner Commit-Message (dc3e5ac7 trägt die saubere).

## Pflicht-OFFEN Rest

- **E (Profi-Band):**
  - Die GTX-Ratschen stehen am Kopf.
  - Der CPU-Takt p95 reißt das Band an allen gemessenen Orten (6,0–9,6 ms > 5,8).
  - Benannt sind der Render-Objekt-Pfad (+0,6 ms je Frame), `_projectObject` und `_fassade`. Offen.

## Status ZWISCHENSTAND + Übergabe

- **Zweig** gtx-ratschen-1410: 704fc303 [ci voll], zu mergen mit mess-wiese 54c78ff3 und dem Genesis-Eintrag 0/0.
- **Messbäume:**
  - `abab-p551`;
  - `abab-i551b`: Instrument mit lokalem Draw-Zähler, Mint-Fix und Orte-Patch;
  - `gtx-ratschen-1410`: Worktree des Zweigs.
