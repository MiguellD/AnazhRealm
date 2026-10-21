# Bericht 2110 GTX-Messschuld 2: licht.K2 S1 und leib.K2 (M28) am integ-Kopf 1011d41d

**Status: ZWISCHENSTAND.** Gemessen von einem frischen Messer; sein Entwurf wörtlich unten. Rohdaten auf der OMEN in `p3/n2110/messschuld2/`.

---


## licht.K2 Staffel 1 — Kugel-Bilanz, Mess-Wiese, klar, Uhr 0,5
- **Ist (18-%-Kugel, Kappe oben N·up ≥ 0,94, ~1450 px):** in der Welt (A, Scheiben-Schatten) Verhältnis **5,01**, Schatten-Anteil **0,1995**; gegen den unverdeckten Himmel (B/C, dieselbe Sonnen-Kugel) **4,89** und **0,2045**. Soll 5–12,5 und 0,08–0,20.
- **Urteil: AN DER GRENZE, nicht grün.** In-situ liegen beide Werte knapp innen. Die Scheibe verdeckt aber Himmel: C misst unter ihr 0,0757 statt 0,0776 (−2,5 %). Bereinigt liegen beide um gut 2 % außerhalb (4,89 < 5; 0,2045 > 0,20): zu viel Himmel gegen die Sonne.
- **Rohdaten:** `kugel.json` (Schüsse A/B/C, Profile je N·S), `antwort.txt`, `licht-lauf.log`, Probe `kugel.js` (werkbank eval), Bilder `kugel-voll.jpg`, `kugel-reihe.png` (A), `kugel-reihe-B.png`.
- **Bild angesehen:** Rechts zwei Kugeln in der Sonne (Grau mittelgrau, Weiß hell), links zwei im Scheiben-Schatten, der auch sichtbar auf dem Gras liegt. Kontrollen: A = B an den Sonnen-Kugeln (0,3795 = 0,3795, ungeschattet); A = C an der Schatten-Kugel (0,0757 = 0,0757, Sonne voll weg).
- **Weg:** `r._buildToonNodeMaterial({ color })`, das EINE Stoff-Programm (Substanz-Kern der Flach-Farb-Werke), Albedo 0,18 aus `albedo-tafel.json` `karte.albedo`, Weiß 0,80. Bühne wie `werkbank bild` (sunny/Sommer, `setTimeOfDay(0.5,"human")`), Schuss `__ausgabeAufnahme(1920,1080,1,{satz:"messung"})`.
- **Annahmen (offen benannt):**
  - Geometrie: Kugeln R 0,5 m auf dem Boden, vier in einer Reihe längs des Sonnen-Azimuts; Scheibe R 0,8 m, 6 m zur Sonne, derselbe Stoff.
  - Pose: Sonne bei 74,2° Höhe; Auge 5,5 m quer und 6 m hoch, FOV 50.
  - Linearisierung: Belichtung 0,9925, PBR Neutral. sRGB → inverse Neutral (Offset aus dem kleinsten Kanal, Schulter über den größten; die Entsättigung nicht invertiert) ÷ Belichtung. Bloom und TRAA nicht herausgerechnet.
- **Ehrlich offen:**
  - Lauf 1–3 (`lauf1..3/`) ungültig: erst ein Projektions-Fehler, dann standen alle Kugeln im Baum-Schatten (A = C). Seit Lauf 4 sucht die Probe per Werfer-Strahl einen freien Ort (−315,3/−1056,1).
  - Die Weiß-Kugel liegt in der Sonne auf sRGB 244, in der Schulter; W/G dort 4,74, im reinen Himmel 3,61, nominal 4,44. Ein albedo-freier Anteil der Stoff-Antwort (Rim/Luft) oder der Toe der Kurve hebt das Grau im Schatten. Das Weiß zählt darum nicht.
  - „Himmel-Azimut ≥ 1,2" ist ungemessen (kein senkrechtes Paar). Nur ein Gerät, eine Stunde, ein Wetter.

## leib.K2 (M28) — Fuß-Kontakt K8
- **Hang 24,4° (−526/−853), Fuß p95:** Ego (first, k8-sicht.diff) **3,1 cm** (Median −0,4); Third (`setCameraMode("third")` an derselben Stelle) **3,1 cm** (Median −0,4). Soll ≤ 3. **Urteil: ROT, knapp, beide Sichten.**
- **Zur Sicht:** Der Kopf fährt K8 ohne Patch in **first**, nicht in Third. Darum lief Third mit Patch; die Standard-Zeile (first) ist dieselbe: 3,1.
- **Beifund Mess-Wiese (eben):** Fuß p95 3,4–3,5 cm in allen drei Läufen, also auch über 3. Das Gate bleibt grün über die Ratsche.
- **Rohdaten:** `k8-ego.log`, `k8-third.log`, `k8-standard-first.log`, `k8-wiederholung-first.log` (versehentlich zweimal first: 3,4/3,1, deckungsgleich), Patch `k8-patch.cjs`. Der Baum wurde je Lauf zurückgesetzt, `git status --porcelain` leer.
- **Stufen: OFFEN, nicht gebaut.** K8 kennt keine Treppe. Ein Stufen-Werkzeug (Treppe aus dem Bau-Gesetz, Gehen hinauf, Fuß-Abstand je Schritt) passte nach der Licht-Probe nicht mehr in ≤ 30 min. Messname `leib.K2 fuss-stufen`.

Station: GPU-Schloss omen-2110-m2 nur um die 4 Boots, gelöst. Eigene Prozesse beendet, der save-server 4312 per stopp.ps1. Spielstände in `stand/` und `lauf1..4/stand/` beiseite. Kein Push.

## Nachtrag 21.10. ~20:45: licht.K2 Staffel 1 mit n = 3 gültigen Läufen
- In-situ dreimal bit-gleich Verhältnis **5,0132**, Schatten-Anteil **0,1995**, also **3/3 im Band** 5–12,5 / 0,08–0,20. Lauf 4 an 1011d41d, Läufe 5 und 6 an 97d8ee94 (`serie3.log`, `lauf5/kugel.json`, `lauf6/kugel.json`).
- Gültigkeit je Lauf: A/B Sonnen-Kugel 1,000, A/C Schatten-Kugel 1,000, Projektion ~1450 px. Bild von Lauf 6 selbst gesehen, gleich Lauf 4.
- Ehrlich: Der Wert liegt an der unteren Kante. Ohne Scheiben-Verdeckung (B/C) liegen 4,89 / 0,2045 je ~2 % außerhalb, weil die Scheibe 2,5 % Himmel verdeckt.
