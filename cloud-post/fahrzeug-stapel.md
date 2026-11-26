# fahrzeug-stapel — Stand-Blatt (ZWISCHENSTAND)

Sprossen: `karte2.mensch.fahrzeug.medium#2` und `karte2.mensch.fahrzeug.gestalt#1` — EIN Kopf nach dem Entscheid des Koordinators
(Post 10:15 an fahrzeug-medium und fahrzeug-gestalt: „Medium und Gestalt landen als EIN Kopf“). Beide Zweige hat derselbe Macher
gebaut; den Stapel baut fahrzeug-medium, das den geheilten Medium-Teil zuerst trug (Kopf 3, f85ad928). **fahrzeug-gestalt:
übernommen von fahrzeug-medium in `fahrzeug-stapel`.**

Basis: main c814741e (der Auftrag nannte 12029279; main zog derweil w28-auge-farbe und w28-bruecke-quert nach — Rebase UNTER den
einen Commit ohne Konflikt, auch in `stamm/studio-stoff.js`, das auge-farbe und die Gestalt beide anfassen; Gegenprobe unten).

## Im Kopf

- **Der Medium-Schnitt** — der Baum von `fahrzeug-medium` Kopf 3 (f85ad928, Elter main 12029279): das Rad liest den Boden unter ihm
  (Bekker, μ trocken/nass der Stoff-Zeile, Rollwiderstand, Einsinken, die Spur im EINEN Tritt-Feld), die Station, der Stations-
  Kandidat `cloud-post/fahrzeug-medium-station/`. Täter, Schnitte und Zahlen: `cloud-post/fahrzeug-medium.md`.
- **Die Gamepad-Bühne** (Kopf 3): die Gas-Probe des Gamepads (leib.K5) stand im vollen Lauf auf Laub (μ 0,45, weich); der Reifen-Kreis
  deckelte das volle Gas bei μ·g (1,474 m/s in 20 Takten = 4,42 m/s²), das Verhältnis 0,81 maß den Boden. Die Probe liest ihren Grund
  aus der Welt (der EINE Leser `_kontaktStoffAt` → `_stoff`), sucht den festen Ort ihres Wagens und nennt ihn (Teilprüfung `buehne`).
- **Der Gestalt-Schnitt** — der Diff von `fahrzeug-gestalt` db966969 gegen seine Basis (1bfc158): das EINE Gesetz der Scheibe
  (`welt-licht.js` `scheibe`, Fresnel nach Schlick, F₀ aus der Zeile glas, Hausfenster und Wagenglas derselbe Leser), der Reifen als
  Gestalt (Lauffläche · Flanke · Felge, der Aufstand als Sehne, dz = W / kz). Täter, Schnitte und Zahlen: `cloud-post/fahrzeug-gestalt.md`.
- **Die Linse B-j las ein Feld, das es am gestellten Wagen nicht gibt** (`scripts/diag-vehicle-drive.cjs`): der Flat stellt jedes
  Rad-Blatt je Ecke als eigene Instanz (`stamm/studio-gestalt.js` `_foundryFlattenFor`, DIE RÄDER: `rad = { ecke, hx, hy, hz, … }`),
  die Linse las `rad.raeder[0].hy` — die Vorlage vor dem Flat. Am Kopf ee58a881 (Batterie `voll 1/18`) und lokal am Stapel ohne den
  Schnitt: „Cannot read properties of undefined (reading '0')“. Jetzt liest sie `rad.hy` der Ecke.
- **`welt-licht.js` mit w28-kosmos-bahn** (Mond aus eigener Ephemeride, auf main seit c0634d86): der Schnitt der Scheibe (`durchsicht`,
  `scheibe`) und der Mond liegen in getrennten Stellen der Datei; der Diff der Gestalt setzt sich mit drei Wegen ohne Konflikt auf main.
- `spec/stamm/modul-karte.json`: `_trittZahl` (Medium) und `_bewohnerZeigt` (main) vereint; `stamm-umzug --nach-karte` 0 Abweichungen.

## Gemessen (lokal, main c814741e + dieser Baum)

| Zahl | vorher | nachher |
|---|---|---|
| Voller Playtest (`node scripts/playtest.cjs`) | Kopf 15630bf4 / ee58a881: ❌ Gamepad-Verben „ROT: gas“ (Laub μ 0,45: Gas 0,568 / 1,193 / 1,474 m/s, Verhältnis 0,81) | 3 710 ✅, 0 ❌ in 2 min 42 s — „Bühne stein μ 0,800 (Reifen-Kreis ÷ Motor 0,768), Gas 0,570 / 1,203 / 2,058 m/s“ (Verhältnis 0,585), Auslauf 0,324 / 0,711 m/s; ebenso auf 12029279 und c3631992 |
| Lab-Fahrprofil (`npm run gate:vehicle-drive`) | ❌ B-j „Cannot read properties of undefined (reading '0')“ | GRÜN in 1 min 52 s — B-j: 1 Reifen-Blatt, rollt 0, Sehne 0,110 m, frei 12,64 mm gegen W / kz 12,63 mm (W 3 286 N), Aufstand −0,09 mm |
| `npm run check:statik` | — | 0 (8 min 44 s auf c3631992; c814741e brachte nur Dateien außerhalb dieses Baums) |
| `gate:studio-begehen` (probeUrteil) | — | GRÜN (5 min 1 s auf c3631992) |

## Offen (Grund, Messname)

- Die Offen-Listen der beiden Blätter bleiben ganz stehen: `cloud-post/fahrzeug-medium.md` (rinne_sichtbar, flug, Kurvengrenze — der
  Zweig fahrzeug-medium-2 trägt flug und Kurvengrenze als eigenen Kopf —, f_r je Rad, Reifen im Bild) und `cloud-post/fahrzeug-gestalt.md`
  (Durchlass des Wagenglases 53,6 % gegen FMVSS 205 ≥ 70 %, die Bühne der Studios ohne das Gesetz der Scheibe, das BILDPAAR in der
  Stations-Pose, der Bausch der Flanke, die Zahlen von Rhyne).
- Die Tore des Rufs, die nur der Messplatz urteilt: `gate:weltbild-frost:echt` braucht den Browser mit Bildschirm (ohne: Absturz nach 0,3 s;
  unter xvfb mit swiftshader nach 15 min ohne Urteil), `gate:tag-achse:echt` die GPU. `gate:pruefbuehne-licht` steht lokal unter
  swiftshader ROT an S0 Himmel und S0 Bild (Umgebung 2,733e-8 gegen das Gesetz 3,108e-8), dieselben zwei ⛔-Zeilen byte-gleich am reinen
  main a954d698 — das geerbte Rot seit w28-kosmos-bahn (Koordinator 10:27, Heiler `nachthimmel-einig`), nicht dieser Baum; nicht angefasst.

## Kopf

- Kopf: Vorprüfung fahrzeug-stapel 1 (auf main c814741e), EIN Commit, Zweig `fahrzeug-stapel`, kein PR (Regel-Blatt 10:27).
- Probe-Ruf `[gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, gate:tag-achse:echt]` — die vier
  Pflicht-Tore seiner Dateien (Bewohner: `stamm/siedlung-bewohner.js`; Tag-Achse: `welt-licht.js`), wie am Ruf-Kopf ee58a881.
- Beanspruchte Sprossen: `karte2.mensch.fahrzeug.medium#2`, `karte2.mensch.fahrzeug.gestalt#1`.
- Karte 2 gebucht 126 von 1 718 · Status ZWISCHENSTAND.
