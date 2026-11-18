# SOLL der Rechnung „Auge 4" — geschrieben und gepusht VOR auge4.cjs (GTX 1050, 19.11.)

**Entscheid Koordinator 00:50.** Der Zustand Z = ARITHMETISCHES Mittel der Leuchtdichte der Sicht MIT Strahlern („von der Tafel
gewählt, Quelle offen": Licht ist Licht, der Photonenfang ist linear — ob eine Fläche selbst leuchtet oder beschienen ist, weiß die
Netzhaut nicht). k = a ÷ max(Z, L_min), a aus der Eichung dieses Funktionals (Karte an der Mess-Wiese am Mittag auf k·L 0,22),
L_min 0,005 cd/m², K1, keine Kappe, kein Schleier. Es fallen als Stellwerte: das log-Mittel und „ohne Strahler".

**Berichtigtes Soll — eine Klasse fällt:** „Fernes bleibt sichtbar, während die Quelle im Bild steht" gilt in keinem Fall mehr
(Lava „Ufer fern ≥ Luma 8", Herd „Gras 14 m ≥ Luma 8"): das Schwarz hinter dem Feuer bleibt (Entscheid 18.11.). Es bleibt die
Struktur des Hellsten und die Ordnung der Welt. Herd fern: Zeile B gilt, Zeile A fällt.

| # | Zeile | Soll | FÄLLT, wenn |
|---|---|---|---|
| 1 | Herd nah 3 m | der Ring bleibt unter der Schulter | Ring-Gras 0,75–1,75 m: hellster Kanal k·L > 3 |
| 2 | Herd fern 25 m | Lichtkreis hell, Farbton gehalten; nah ↔ fern trennt | Ring-Gras 1,75 m ohne Farbe (Kanäle < 2 Code auseinander) ODER k_fern ÷ k_nah < 2 |
| 3 | Gasse, r1-Sicht | Wände lesbar, nichts über der Schulter | Mondwand < Luma 8 ODER ein Wand-Paar < 2 Code ODER Laternen-Wand / Mondwand hellster Kanal k·L > 3 |
| 4 | Gasse längs | wie 3 | wie 3 |
| 5 | Lava nah 3 m | Struktur des Hellsten, Ordnung der Welt | Decke ↔ Ufer-Saum < 2 Code ODER ein Fleckpaar kehrt seine Ordnung um |
| 6 | Mittag, Mess-Wiese | Karte sRGB ≈ 118 | Karte mehr als 2 Code daneben |
| 7 | Mittag, Sonne bei 25,6° im Bild | die Karte fällt um höchstens 1 EV gegen die Mess-Wiese | k(Sonne im Bild) ÷ k(Mess-Wiese) < 0,5 — mit der Scheibe beim Wert, den sie im HDR-Puffer von main trägt |
| 8 | Vollmond-Wiese 0,1 lx | Boden lesbar, Baumlinie gegen Himmel | Boden < Luma 12 ODER Baumlinie ↔ Himmel < 2 Code |
| 9 | Vollmond-Wiese 0,3 lx | wie 8 | wie 8 |
| 10 | Schwenk 60° vom Feuer weg (nah) | Ziel über L_min: in ≤ 10 s wieder auf 0,3 EV | t = τ · ln(Sprung ÷ 0,3) > 10 s bei τ zum Dunklen 5 s („ungeprüft", gesetzt für den Spike) — d. h. Sprung > 2,22 EV |

**Zeile 7, der Wert der Scheibe (am Code gelesen, origin/main):** `HIMMEL.sonneLeucht` 4 × Farbe (1 / 0,92 / 0,7) → Y 3,68 Einheiten
des Puffers, Winkel 0,53° (`stamm/bild-himmel.js:3478–3479`, gesetzt in :2728). Die Karte steht am Mittag bei 0,22 ÷ k_main
(k_main 0,527 gemessen im Spike 1) = 0,417 Einheiten — die Scheibe trägt also das 8,8-Fache der Karte, nicht das 240 000-Fache der
echten Sonne (1,6·10⁹ cd/m²). Geurteilt wird am Puffer-Wert; die Zahl mit der echten Leuchtdichte steht daneben OHNE Soll: sie ist
die Zahl, die gilt, sobald das Gesetz „EIN Maß cd/m²" die Scheibe erreicht. Reißt eine der beiden: Befund, keine Kappe, kein Ausschluss.
Mein Modell der Wiese trägt einen gleichmäßigen Himmel (kein Hof um die Sonne) — der Hof ist NICHT gerechnet und steht so im Blatt.

**Zusätzlich als Zahl (kein Fall-Grund):** der Zustand gegen das Raster (960 × 540 ↔ 1 920 × 1 080) — das arithmetische Mittel hängt
an wenigen Strahler-Pixeln (Flamme aus 25 m unter 1 Pixel breit); der Sprung des Zustands bei 10° / 30° / 60°; die Schwelle der
Wahrnehmung an der Gasse am Zustand.

**Urteil:** x von 10 Zeilen halten. Fällt eine: Blatt, kein Spike. Tragen alle: GPU-Spike 4 am Zweig `w28-licht-spike`.
Die Schwellen sind gewählt wie in SOLL-AUGE3 und nie Tor einer Linse.
