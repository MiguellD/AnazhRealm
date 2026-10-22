# Bericht 2210 Tiere K3 GTX-Hälfte: gate:tier-gang + Querhang + das Gang-Bild aus 10 m, Kopf integ-probe e5003509 (V18.546.59), kein A/B

**Urteil: Die GTX-Hälfte steht.** Tastgrad im Band in Welt und Labor, der Querhang hält, das Bild zeigt alle vier Tiere im Schritt mit den Stand-Füßen am Boden.

1. **`TIER_GANG_PORT=4449 npm run gate:tier-gang` — EXIT=0, GRÜN** („jede Gattung setzt ihre Pfoten (Schlupf ≤ 0.05) in Schritt, Trab und Galopp …").
   - **Tastgrad Welt** (v̂ 0,3 / 0,74 Schritt · 1,2 Trab · 3,5 Galopp):
     - Wolf 0,67 / 0,64 · 0,50 · 0,28
     - Fuchs 0,67 / 0,64 · 0,48 · **0,25**
     - Bär 0,68 / 0,65 · 0,52 · 0,29
     - Wesen 0,68 / 0,66 · 0,52 · 0,30
   - **Labor:** Schritt 0,64–0,66, Trab 0,50, Galopp 0,29–0,32. **Welt gegen Labor ≤ 0,03 Zyklus** (Fuchs Galopp 0,03, Wolf 0,01, Bär 0,02, Hirsch 0,00).
   - Schlupf unter Last (30 fps, Leiter) 0,002–0,004.
   - Gegen die REF: Schritt ≥ 0,6 hält (0,64–0,68), Trab 0,4–0,5 hält (0,48–0,52 auf der Kante), Galopp < 0,4 hält (0,25–0,30).
2. **Querhang** (der Leib misst am Hang der Welt: `npm run gate:kreatur-takt`, Teil querhang) — EXIT=0, GRÜN:
   - Hang 20,8°: Wolf Leib rollt 19,5°, Bein-Lot 7,5°, Sohle −1,1…+0,3 cm, **Schlupf 0,024**; Hirsch Leib 20,7°, Lot 7,7°, Sohle −1,6…+0,4 cm, **Schlupf 0,024**.
   - Rampe s2-hang30 (29,9°): Wolf Lot 7,5°, Schlupf 0,026; Hirsch Lot 7,7°, Schlupf 0,021 (Soll Lot ≤ 10°, Schlupf ≤ 0,05).
   - Die ❌-Zeilen im Log sind die Selbsttest-Täter (querhang, querhang-gleiten), die feuern müssen.
3. **Das Bild** (`werkbank start --echt` · `umstellen --ort genesis` · `gang-buehne.js` · `bild 2.4 91.2 14 2.4 89.6 24 --w 1280 --h 720 --wahl 0 --ziel gang`, EXIT=0): `gtx-k3-schritt-10m.png`, Ausschnitt 2× `gtx-k3-ausschnitt-2x.png`.
   - Wolf, Fuchs, Bär und Hirsch gehen im Schritt (v̂ 0,5; v 1,24 / 0,98 / 1,37 / 1,50 m/s) nebeneinander im Profil.
   - Je Tier stehen drei Füße am Boden, kein Fuß schwebt oder taucht sichtbar ein.
   - Die Szene gleicht dem Radeon-Bild Bild für Bild (Bäume, Blumen, GT am Rand); die Gang-Phase je Tier ist an diesem Schuss eine andere.

Benannt offen (nicht diese Messung, laut Auftrag): Galopp-Takt Wolf 3,98 Hz (Natur ~3); der Fuchs galoppiert genau an der Kante 0,25 (hier gemessen: 0,25).

Roh: OMEN `p3/n2210/tg/`; hier `bericht/2210-tier-gang-gtx/` (tier-gang.log, kreatur-takt.log, die PNGs, buehne.txt, lauf.sh).

Status ZWISCHENSTAND + Übergabe: Tiere K3 GTX-Hälfte gemessen. Station frei.
