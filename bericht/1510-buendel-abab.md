# Bericht 1510 Bündel-ABAB — integ-probe e8a370ad gegen main 0bbee8fc

B = e8a370ad: K10-6 + K64 Tore fern + K38-N2 Werkstatt-Vorschau + K63 Soll-Tafel + K60 Ankunft. Code-gleich mit
a19ca615, das nur Doku ergänzt.

**Status: ZWISCHENSTAND.** Die GTX-Kalt-Zeile ist nachgetragen, siehe unten: B ist kalt +3,9 s langsamer, der Täter ist
die Streu auf dem Haupt-Faden.

**Urteil (OMEN GTX, Regler voll, freie Tiere; EIN Instrument `abab-pe8a` = B-Kopf):**

- **e8a370ad ist stehend und gehend an Wiese, Genesis und Dorf NICHT LANGSAMER im Band.**
  - Frame p95 gleich überall: 16,7–16,8 stehend, 25,0–25,1 eingeschwungen gehend.
  - CPU-Takt p95 an allen vier Steh-Orten gleich (Δ −0,0 … +0,1 ms).
  - Befehle gleich.
- **K60 trägt die Ankunft am Ort.** Der Stand direkt nach dem Umstellen:

  | Ort | Frame p95 A → B | CPU-Takt p95 A → B |
  |---|---|---|
  | Wiese | 25,0 → 16,7 | 24,8 → 5,6 |
  | Dorf | 33,4 → 16,8 | 31,9 → 7,7 |

  Auch das Einströmen gehend ist leichter: CPU p95 −1,5 an der Wiese, −1,4 am Dorfweg.
- **K64 trägt die Tore.** Genesis Third hat −65k Dreiecke und −1,9 MB VRAM, Genesis Ego −18k.
- **Benannt, kein Band-Riss: Genesis Ego liefert weniger Frames.**
  - fps 78,5 → 73,6 in beiden B-Boots (73,7 · 73,5 gegen 78,7 · 78,3).
  - Der GPU-Durchsatz im Loop steigt 12,7 → 13,7 ms (p50) und 15,5 → 16,6 (p95).
  - Die gestempelten Pässe sind gleich: haupt 1,13 / 1,14, TRAA 0,68, post 0,67, k0 0,21.
  - Die Band-Bank misst B billiger (14,41 → 13,16, zweigipflig).
  - Genesis Third und die Wiese zeigen es nicht.
  - Ein Verbraucher außerhalb der Stempel kostet nur im Ego-Blick der Ring-Mitte. Er fällt in den Ego-Blick −x auf die vier
    Vorschauen (K38-N2) und zehn Tore auf 11 m (K64). Die Zerlegung läuft dort auf B UND auf A (`p3/k1510z`, Posten gegen
    Posten) und nennt ihn.
- **Benannt: VRAM** Wiese Ego +0,8 MB (2σ 0,1), Wiese Third +0,5, Dorf Third +1,6. Genesis dagegen −0,5 / −1,9 (K64).

## Stehend (je Kombi A1 B1 A2 B2)

| Ort × Sicht | fps A → B | Frame p95 A → B | CPU-Takt p50 A → B (je Boot) | CPU-Takt p95 voll A → B (Δ, 2σ) | gpu-bank Gier 0 / −0,88 ms | Band-GPU ms | Befehle · Dreiecke · VRAM |
|---|---|---|---|---|---|---|---|
| Wiese Ego | 96,4 → 99,0 | 16,7 → 16,7 | 4,0 / 3,8 → 3,5 / 3,9 | 5,3 → 5,3 (0,0, 0,5) | 8,42 → 8,36 / 9,31 → 9,56 | 10,88 → 10,22 | 75 → 74 · 280k · 93,8 → **94,6** MB |
| Wiese Third | 90,8 → 90,2 | 16,8 → 16,8 | 4,6 / 5,0 → 4,5 / 4,8 | 6,7 → 6,7 (0,0, 1,4) | 9,20 → 9,41 / 9,50 → 9,48 | 10,75 → 10,74 | 85 → 86 · 316k · 95,5 → 96,0 MB |
| Genesis Ego | **78,5 → 73,6** | 16,8 → 16,8 | 4,0 / 4,0 → 3,8 / 3,9 | 5,5 → 5,6 (+0,1, 0,4) | – | 14,41 → 13,16 ¹ | 106 · 352k → 334k · 104,6 → 104,1 MB |
| Genesis Third | 74,9 → 74,1 | 16,8 → 16,8 | 4,9 / 4,8 → 4,7 / 4,7 | 6,6 → 6,7 (+0,1, 0,5) | – | 13,85 → 14,79 ¹ | 140 · **460k → 394k** · 106,4 → **104,5** MB |
| Dorf Ego ² | – | – | – | – | – | 13,34 → 15,07 ¹ | 100 · 354k → 350k · 98,7 → 97,3 MB |
| Dorf Third ² | – | – | – | – | – | 13,56 → 13,52 | 105 · 408k → 407k · 99,4 → **101,0** MB |

- **¹ Die Band-Bank springt zweigipflig** (12,8 … 16,0 ms), auf beiden Seiten. In EINER Welt bewiesen: 1410-k59-abab.
  - Dorf Ego B1 16,01 ms ist der höchste Wert der Serie und hält das Band (≤ 16,7). B2 liegt bei 14,12.
- **² Dorf:** Die Messfolge misst dort nur das Band, der Dorf-Zug läuft. Beide Seiten tragen K10-6 und damit dasselbe Dorf.
- **Genesis Ego, Lauf voll je Boot:**

  | | A1 | A2 | B1 | B2 |
  |---|---|---|---|---|
  | fps | 78,7 | 78,3 | 73,7 | 73,5 |
  | GPU-Durchsatz p50 / p95 ms | 12,7 / 15,3 | 12,7 / 15,6 | 13,7 / 16,6 | 13,7 / 16,5 |
  | GPU-Verzug p50 ms | 16,6 | 16,7 | 18,1 | 18,2 |
  | Leine ausgesetzt % | 34,2 | 34,5 | 38,4 | 38,6 |

  Genesis Third (13,3 / 13,2 → 13,3 / 13,5) und die Wiese (Ego 10,3 / 10,2 → 9,5 / 10,3) sind gleich.

## Gehend (4 m/s, je 4 Sitzungen A B · B A · A B · B A; „gehen 1" = Einströmen, „gehen 2" = eingeschwungen)

- **Wiese:** wie boden3, 0 → −60 m längs −z und zurück.
- **Dorfweg:** vom Zell-Ort −841/−861 längs 0,690/0,723 durch die Mitte des Dorfs (beide Seiten dasselbe Dorf), 0 → 60 m
  und zurück.

| Ort · Lauf | A main 0bbee8fc (je Sitzung) | B e8a370ad (je Sitzung) | Δ B − A (Mittel) |
|---|---|---|---|
| Wiese · Stand nach dem Umstellen · Frame / CPU p95 | 33,2 · 16,8 · 25,1 · 25,1 / 28,1 · 17,8 · 27,0 · 26,3 | **16,7 ×4** / 5,5 · 5,0 · 6,1 · 5,6 | −8,4 / **−19,3** |
| Wiese · gehen 1 · Frame p95 / CPU p50 / CPU p95 | 25,0–25,1 / 10,6 / 21,7 · 19,3 · 22,6 · 22,4 | 25,0 ×4 / 10,6 / 20,4 · 19,9 · 19,3 · 20,3 | −0,1 / 0,0 / −1,5 |
| Wiese · gehen 2 · Frame p95 / CPU p50 / CPU p95 | 25,0 ×4 / 10,7 / 15,8 · 14,6 · 16,5 · 15,1 | 25,0 ×4 / 10,9 / 15,4 · 14,9 · 18,5 · 15,2 | 0,0 / +0,2 / +0,5 ³ |
| Dorfweg · Stand nach dem Umstellen · Frame / CPU p95 | 33,3 · 25,1 · 41,6 · 33,4 / 28,2 · 27,9 · 39,0 · 32,5 | **16,8–16,9** / 8,6 · 7,6 · 6,8 · 7,9 | −16,5 / **−24,2** |
| Dorfweg · gehen 1 · Frame p95 / CPU p50 / CPU p95 | 41,6 ×4 / 12,4 / 36,7 · 32,7 · 34,1 · 34,4 | 41,6 · 41,6 · 33,4 · 41,6 / 12,6 / 32,7 · 33,6 · 30,8 · 35,3 | −2,0 / +0,2 / −1,4 |
| Dorfweg · gehen 2 · Frame p95 / CPU p50 / CPU p95 | 25,1 ×4 / 11,5 / 19,8 · 19,6 · 18,8 · 18,3 | 25,1 ×4 / 11,6 / 18,7 · 19,8 · 19,0 · 18,9 | 0,0 / +0,1 / 0,0 |

- **³ Wiese gehen 2:** B s3 trägt 18,5 als einzelne Sitzung. Der Median ist gleich: A 15,5, B 15,3.
- **Der Einström-Riss am Dorfweg** (41,6 > 33) steht auf beiden Seiten, auf B in drei von vier Sitzungen. Er ist der
  Preis jedes Dorfwegs (1510-k10-abab Gegenprobe) und gehört zu K69.
- **Befehle · Dreiecke gehend:** am Dorfweg 95 · 480–488k auf beiden Seiten, VRAM beim Einströmen 117–122 MB auf beiden.
- **Geher:** in jeder Sitzung 4 Wege.

## Nachtrag: die GTX-Kalt-Zeile (Frozen B; 15.10. 12:22–12:28, je Seite 3 Boots A B · B A · A B)

- **Ablauf:**
  - `diag-boot-stage --kalt --echt`, leeres Wegwerf-Profil (IDB leer), Fenster 1920×1080, Holz voll.
  - EIN Instrument: das Skript des B-Kopfs, sein Statik-Server liefert den Baum der Seite aus (`kalt.cjs`).
- **Urteil: B ist kalt LANGSAMER.**
  - t(Weltbild) = t(Kontrolle): A 25,4 · 25,9 · 26,1 s gegen B 29,2 · 29,6 · 30,3 s. Median +3,9 s.
  - Auf der Radeon meldete K60 22 → 18,5 s. Die GTX zeigt das Gegenteil.

| | A1 | A2 | A3 | B1 | B2 | B3 |
|---|---|---|---|---|---|---|
| t(Weltbild) s | 25,41 | 25,91 | 26,07 | 29,24 | 29,58 | 30,33 |
| Buch der Studios da s | 6,6 | 9,3 | 8,8 | 8,8 | 8,9 | 6,2 |
| Haupt-Faden blockiert bis zum Bild s (Langaufgaben) | 19,0 | 19,3 | 18,0 | 25,7 | 25,8 | 26,4 |
| davon **Streu** s | **2,58** | **2,69** | **2,55** | **6,19** | **5,89** | **6,16** |
| davon Boden · Bauten · Gruppen-Bau s | 0,10 · 0,17 · 0,17 | 0,48 · 0,20 · 0,18 | 0,29 · 0,24 · 0,16 | 0,63 · 0,29 · 0,17 | 0,65 · 0,27 · 0,18 | 0,31 · 0,29 · 0,18 |
| Erst-Bau der Zeichnung s | 3,29 | 3,08 | 2,94 | 2,92 | 3,02 | 2,97 |

- **Der Täter:** Die Streu auf dem Haupt-Faden vor dem ersten Bild steigt 2,6 → 6,1 s (+3,5 s).
  - Das Weltbild von B wartet auf mehr: auf die Pflanz-Schlange (K60, „Weltbild zählt die Pflanz-Schlange") und auf den
    Horizont. Die Zeitleiste von B nennt ab 1 s „der Horizont wächst (0 … 22 %)" und von 17 bis 28 s „der Horizont wird
    gemalt". A kennt diesen Term nicht.
  - Das Bild von B ist damit voller, aber es kommt später, und der Haupt-Faden trägt die Streu dafür synchron.
  - Der Erst-Bau der Zeichnung ist gleich (≈ 3,0 s).
- **Für B (Pflicht-OFFEN):** Ein Hebel wäre, die Streu des ersten Bilds aus dem Haupt-Faden zu nehmen (Lehre 14) oder die
  Pflanz-Schlange erst NACH dem ersten Bild zu zählen. Benannt, nicht geschnitten.
- **Rohdaten:** `kalt/A1..B3.json|txt`, der verworfene erste Versuch in `kalt/verworfen/`.

## Wachen

- **Seiten-Wache** nie rot. Kein Boot lief neu.
- **Wetter-, Welt-Akt-, Ort- und Fenster-Wache** grün.
- **Exit=1 nur am Band-Urteil:** BAND-LINSE gegen die alten GTX-Ratschen, am Dorf mit 5–6 roten Klassen auf beiden
  Seiten. Die Ratschen präge ich nach dem FF an a19ca615 neu.
- **Kalt-Zeile, erster Versuch verworfen:** Der Root des Statik-Servers im Wrapper hatte eine andere Schreibweise. Darum
  gab es 403 auf jede Datei, und die Seite lud nie (`kalt/verworfen/`). Korrigiert in `kalt.cjs`, Neulauf nach der
  Zerlegung.

## Rohdaten

- **Pfad:** `bericht/1510-buendel-abab/`.
- **Inhalt:**
  - 24 Boot-JSONs, Auswertungen je Kombi (Etiketten korrigiert), `fortschritt.log`;
  - die Skripte `serie.sh`, `stehen.sh`, `gehen.sh`, `gehen-dorf.sh`, `kalt.sh`, `kalt.cjs`;
  - `gehen-s1..s4/` (Wiese), `gehen-d1..d4/` (Dorfweg) mit `gehen-wiese-tafel.txt` und `gehen-dorf-tafel.txt`.
- **Auswertung:** stehend `node p3/k1410c/auswertung.cjs <dir> <kombi>`, gehend `node p3/k1410k/auswertung.cjs <dir>`.

## Pflicht-OFFEN Rest

- **B (Ankunft kalt ≤ 5 s):** Die GTX-Kalt-Zeile steht am Kopf a19ca615 bei 29,2–30,3 s (main vorher 25,4–26,1 s). Die
  Streu auf dem Haupt-Faden trägt +3,5 s davon.
- **E:** CPU-Takt p95 B gegen 5,8:

  | Ort × Sicht | p95 | gegen 5,8 |
  |---|---|---|
  | Wiese Ego | 5,3 | hält |
  | Wiese Third | 6,7 | +0,9 |
  | Genesis Ego | 5,6 | hält |
  | Genesis Third | 6,7 | +0,9 |

- **Genesis Ego:** GPU-Durchsatz +1,0 ms. Benannt, Täter offen bis zur Zerlegung.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit dieser Messung.
- **Messbäume:** `abab-p0bb` (A, main 0bbee8fc), `abab-pe8a` (B und Instrument). Alle mit node_modules als Junction auf
  `abab-b542`.
- **Werkzeug:** `p3/k1510b`.
- **Die OMEN fährt jetzt:**
  1. die Zerlegung an a19ca615 (`p3/k1510z`: Wiese und Genesis × Ego/Third, dazu Genesis Ego auf A, dazu das CPU-Profil
     Genesis Third für K71);
  2. die Kalt-Zeile;
  3. die sechs GTX-Ratschen.
