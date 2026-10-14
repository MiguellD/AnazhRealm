# UEBERGABE K56 wiese-nah (Welle 95)

Basis: integ-probe 51cc19af. Worktree .claude/worktrees/wiese-nah, Ports 8920-8929 (werkbank --port 8922), Scratch %TEMP%\claude\wiese-nah.

## Stand
- [x] Soll + Budget: Halm-Deckung des Bodens im Ego-Nahbild (Zeilen >= 0,58 H, Differenz Bild mit/ohne Nah-Wiese) >= 0,45;
      synthetisch (T) L1 >= 0,85, L2 >= 0,55 unter 20 Grad; Kosten nahWiese <= Haushalt 4 Befehle / 80k und nicht teurer als vorher.
- [x] Hebel gemessen: Luecke (Boden ohne Halm) 32,3 % des Bildes gegen Kronen <= 18 % -> Gras-Gesetz.
- [x] Schnitt im Studio (foundry-core deriveParamsPlant + emitGrass): Bueschel deckt seine Raster-Zelle (TEPPICH_REICH 0,7),
      Halm breiter (L1 2,6 / L2 6,0) und laenger (lerp 0,55..2,0), L1 3 Segmente, 0,8 der Labor-Zahl, Rispe L1 4x1 bei 1,6.
- [x] Goldens neu gemuenzt (128, nur gras-s1/s2-L1/L2 + manifest + render-config), asset-contract GRUEN, grass[1] 862/1000.
- [x] Linse (T) Teppich in gate:pflanzen-nah: vorher ROT (L1 0,425/0,504, L2 0,322/0,415), nachher GRUEN (0,901/0,954, 0,586/0,702).
- [x] profiband S29: krank = doppelte Wiese (das Samen-Maximum trug nach K56 nicht mehr ueber die Ratsche).
- [x] Bilder: k56-neu-paar.png (-278/-1038 Blick -z), k56-alt-paar.png (-915,96/-818,54 Blick +x), oben vorher, unten nachher.
- [x] Zahlen (saubere Paare, gleiche Einschwing-Folge): neu 0,230 -> 0,487, alt 0,195 -> 0,478; nahWiese Dreiecke neu 74 108 -> 72 624, alt 79 228 -> 77 744, Befehle 4 -> 4;
      Band Mess-Wiese (headless Radeon) nahWiese 64 504 -> 64 724, Gesamt 338k -> 338k.
- [x] Zweig-CI [ci voll]: 9a5ace9a Lauf 38556750297 rot nur geerbt voll 2/11 (S0-Kante, integ-probe c8196cd1 heilt); Merge 76d990f3 Lauf 38557639728 13/13 gruen

## Offen (geerbt, nicht K56)
- Ratsche wiese-radeon-ego nahWiese 57 046 ist schon an der Basis ROT (64 504 live), baum Befehle 31 > 24 ebenso; der Zensus
  zensus-wiese.json (10.10.) zaehlt L1 29 / L2 239 Bueschel, live jetzt 40 / 323 (die weitere Sicht-Kugel des Bueschels).
- Die Koniferen-Karten (Tanne/Fichte L1) bleiben gross und kantig: der zweite Hebel, nicht genommen.
- Der Rand der Nah-Wiese (14 m) liest nach K56 als Stufe: dichter Teppich gegen die hellere Boden-Funktion dahinter.
