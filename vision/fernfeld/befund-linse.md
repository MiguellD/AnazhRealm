# Befund Linse — wer lebte in 360 Zeilen und schoss in 1080? (14.11., main 68d24688)

Quelle gelesen NUR im Lese-Baum `lese-main` (= main 68d24688). Kein Spiel, keine GPU gestartet. ZWISCHENSTAND — wird ergaenzt.

## 0. Der Mechanismus an der Quelle (die Wurzel)

1. `scripts/werkbank.cjs:469` — mit `--echt` startet der Browser mit `defaultViewport 1920x1080`; ohne `--echt` `null`.
2. `scripts/werkbank.cjs:523` — `if (!ECHT) await page.setViewport({ width: 640, height: 360 })`: JEDE Werkbank ohne `--echt`
   lebt (boot, `umstellen`, jeder Takt) in einem Zeichenpuffer 640x360.
3. `scripts/werkbank.cjs:2108–2119` — `/bild`: mit `b.klasse` (und `--ort` setzt `b.klasse` IMMER, :2104) Leinwand 1920x1080,
   sonst `max(Fenster, --w/--h)`; `setViewport` auf diese Groesse, Schuss, danach zurueck auf das Fenster der Sitzung.
4. Das Spiel hoert den Wechsel: `stamm/dirigent-ankunft.js:618–631` (resize → `renderer.setSize`, `_schirmMessen()`,
   `_stufenSchirm()`): die SCHWELLEN (Baum thresh01/12, Epoche `_baumEpoche`) folgen dem neuen Schirm sofort.
5. Die WAHL je Ding folgt nicht: sie faellt nur im Takt (`_gameLoopTick` → `stamm/dirigent-takt.js:107–108` und die
   `_tick*LOD`-Gaenge; die Masken-Uniform `uLodD0` schreibt der Takt, `stamm/dirigent-takt.js:2457`; das Feld der Leiber
   `_feldGrenzen` `stamm/vegetation-streu.js:1864` liest die Hoehe erst, wenn ein Leib im Takt gefragt wird).
6. Der Schuss tickt nicht, wenn die Welt „steht": `scripts/lib/ausgabe-aufnahme.cjs:338` „steht sie schon, schiesst die Buehne
   ohne Takt" (`_weltSteht`, `stamm/dirigent-takt.js:765–786`, prueft Regung/Bau/Karte/Offen/Anker — NIE den Schirm).
   `__loopBild` (`scripts/lib/welt-boot.cjs:113–116`) rendert nur (`nodeFrame.update` + `_loopRender`), kein Takt.
   → Nach `umstellen` (die Welt steht) zeichnet `/bild` die Stufen-WAHL eines 360-Zeilen-Schirms in den 1080-Puffer.

Faktor: Brennweite `_brennweite(z) = z / (2·tan(KAM_FOV_GRAD/2))`, `KAM_FOV_GRAD = 75` (`stamm/koerper-fahrt.js:3146`):
f(1080) = 703,8 px, f(360) = 234,6 px — Faktor 3,0 in jeder Pixel-Schwelle. Beispiel Leib (`LOD_SCHIRM.leib`,
`stamm/vegetation-streu.js:2884`, `_feldGrenzen` :1870–1873): Mengen-Stufe ab 1,8·f/64 = 19,8 m (1080) gegen 6,6 m (360) —
ein Bewohner in 6,6 m steht im 1080-Bild 1,8·703,8/6,6 = 192 px hoch als Mengen-Leib (der Fund 120–190 px Klumpen).
