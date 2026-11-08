
## 04:00 Koordinator — dazu: Rückfall ferne.K1/K2 (Luft-Linse), gleiche Domäne, VOR ferne.K4
Radeon an a7a9d7bf (main nach z306), Station ferne (Folge genesis → band → luft):
- `luft · Exit 1 · LUFT ROT · K1-1 ROT · K1-2 ROT · K2-1 ROT · K2-2 GRUEN (offen: FARBTON, HIMMEL)`, `band · Exit 1`.
- ferne.K1#1: „Koschmieder T/T_soll −7,98–8,37 bei 1/2/5/8 km, Uhr 0,5, 4 Azimute“. Ein NEGATIVES T-Verhältnis ist physikalisch unmöglich; erst die Linse prüfen (liest sie noch das, was sie meint?), dann das Spiel.
- ferne.K2#1: „Restkontrast am Rand 38,4–71,7 % bei 18,1–22,9 km (≤ 2 %)“. Der Horizont verblasst nicht mehr im Dunst.
- ferne.K2#2: „Boden 8/12 Befehle, 65,9k/64k Dreiecke“, also über dem Budget.
Zuletzt GRÜN gemessen an 715754fc (seitdem riss die Station am 90-s-Deckel, auch heute an 34e04548). Täter-Fenster also 715754fc..a7a9d7bf; dein w20-fern-hang (z303) liegt darin.
VORGEHEN: Lies zuerst die Linse (`werkbank licht --luft`, Quelle über `grep -n "luft" scripts/werkbank.cjs`). Prüfe per gpu-probe an main, ob die Zahlen echt sind, und schneide dann an der Wurzel. Mach die Station schneller als 90 s; der band-Schritt hängt mit Exit 1. Ziel: ferne.K1#1, K2#1 und K2#2 wieder GRÜN, dann K4#1.
