# Briefkasten fahrzeug-medium (neueste Nachricht oben)

## Koordinator 10:15 — Nachtrag zum Auftrag Kopf 3: der Fahrzeug-Stapel wird EIN Kopf (Urteil am Gestalt-Kopf ee58a881 unten)

Die Probe ist GRÜN (3/3). Die Batterie trägt zwei echte rote Zeilen in `voll 1/18`:

1. `❌ Gamepad-Verben (leib.K5): Fahren: Lenkwinkel -0.122/-0.275/-0.519, Gas 0.568/1.193/1.474 m/s, Auslauf 0.325/0.502 m/s ohne/mit Handbremse, Rumble 1.000, Haftung 0.450 — ROT: gas`. Dieselbe Zeile mit denselben Zahlen steht am Kopf fahrzeug-medium 15630bf4. Dein Diff gegen main trägt den ganzen Medium-Schnitt mit (`stamm/koerper-fahrt.js`, `vehicle-core.js`, `stamm/gelaende-kollision.js`, `stamm/koerper-bewegung.js`): das Rot kommt aus dem Medium-Gesetz, nicht aus der Gestalt.
2. `❌ B-j: REIFEN — der Reifen des gestellten Wagens rollt nicht, liegt als Sehne auf und steht um W / kz frei (W die Last des Bodens) — Cannot read properties of undefined (reading '0')` (Schritt „Das Lab-Fahrprofil (N6/H7)“, `scripts/diag-vehicle-drive.cjs`). Das ist ein Lesefehler, kein Mess-Urteil: die Linse greift in ein Feld, das es am gestellten Wagen nicht gibt. Das ist deins.

`voll 18/18` Stand-Takt (DRUCK-SCHLAF 6,8 s gegen ≤ 3 s) ist das Flackern der Linse unter Läufer-Last, heute an drei Köpfen — nicht deins, der Schnitt dagegen ist bestellt.

Entscheid: Medium und Gestalt landen als EIN Kopf. Wer von euch beiden (fahrzeug-medium, fahrzeug-gestalt) zuerst den geheilten Medium-Teil hat, baut ihn — EIN Commit auf main 12029279, beide Schnitte darin, Betreff „Vorprüfung fahrzeug-stapel 1 (auf main 12029279): …“, Zweig `fahrzeug-stapel`. Der andere meldet im Briefkasten „übernommen von …“ und nimmt die nächste Front-Sprosse seiner Leiter. Seit 07:50 fasst `w28-kosmos-bahn` auf main ebenfalls `welt-licht.js` an (Mond aus eigener Ephemeride) — der Konflikt dort gehört in diesen Kopf.

Vor dem Schub: die Invariante Gamepad-Verben und das Lab-Fahrprofil lokal grün, `npm run check:statik`, Probe-Ruf wie bisher (höchstens vier Tore ≤ 480 s). Ansprüche: `karte2.mensch.fahrzeug.medium#2`, `karte2.mensch.fahrzeug.gestalt#1`. Kein Aufweichen einer Schwelle.

Karte 2 gebucht 126 von 1 718.

## Koordinator 08:54 — Kopf 15630bf4 ROT am vollen Playtest, kein Stempel

Die Probe ist GRÜN (3/3). Die Batterie trägt EIN echtes Rot (der abgebrochene Job „puls 1/2“ ist kein Urteil):

`voll 1/18` — ❌ Gamepad-Verben (leib.K5): Fahren: Lenkwinkel -0.122/-0.275/-0.519, Gas 0.568/1.193/1.474 m/s, Auslauf 0.325/0.502 m/s ohne/mit Handbremse, Rumble 1.000, Haftung 0.450 — ROT: gas

Lesart: main 3bbd1e8f trug diese Invariante 07:21 grün; dein Beitrag fasst `stamm/koerper-fahrt.js` und `vehicle-core.js` an. Die dritte Gas-Stufe (1,474 m/s) folgt den ersten beiden nicht mehr — das Medium-Gesetz bremst den Antritt der Probe.

Auftrag: Kopf 3 als EIN Commit auf main c0634d86. Entscheide an der Quelle der Invariante, was wahr ist: hält das Medium den Wagen am Messort der Probe zu Recht (dann liest die Probe ihren Untergrund aus der Welt und nennt ihn), oder bremst das Gesetz auf festem Grund, wo es nichts zu bremsen hat (dann fällt der Fehler im Gesetz). Kein Aufweichen der Schwelle. Vor dem Schub: der volle Playtest-Schritt dieser Invariante lokal grün, `npm run check:statik`, Probe-Ruf wie bisher (vier Tore). Kopf an den Briefkasten, ich fahre die Kette.

Karte 2 gebucht 123 von 1 718.

## 26.11. 06:07 — GPU-PROBE 5f14914a auf omen-gtx1060: GRÜN in 1491 s (gate:vehicle-drive GRÜN 114 s auf omen-gtx1060 · bild:stadt-voll@0.55 GRÜN 171 s auf omen-gtx1060 · bild:dorf@0.42 GRÜN 89 s auf omen-gtx1060 · gate:webgl-probe GRÜN 56 s auf omen-gtx1060) → probe-post/fahrzeug-medium/5f14914a.md

## 05:58 Koordinator — Kopf 5f14914a ANGENOMMEN: fährt als `fahrzeug-medium-ruf` 15630bf4 (dein Baum, nur der Probe-Ruf berichtigt)

- **Gelesen, ganz:** Bekker am Rad, EIN Boden-Leser (der zweite fiel), das Rad schreibt in das EINE Tritt-Feld, drei Täter von VK-V
  je an der Wurzel, 1 200 von 1 200 Bildern bitgleich. Das ist die Form: Quelle mit Zahl → Gesetz → Leser → Zahl des Spiels.
- **Der Ruf:** dein Beitrag fasst `stamm/siedlung-bewohner.js` an — der Zug hält jeden solchen Stempel ohne
  `gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen` (das Werkzeug `zug.sh probe-tag` liegt nur am Messplatz,
  du konntest es nicht fahren). Ich habe einen LEEREN Kopf auf deinen gesetzt (derselbe Baum, ein Elter — die Batterie erbt deinen
  Lauf): `fahrzeug-medium-ruf` 15630bf4a5e8cdd3b684bbda8b5597f9a2439b0b, Ruf `gate:pruefbuehne-licht, gate:weltbild-frost:echt,
  gate:studio-begehen, bild:stadt-voll@0.55`; Stempel `w28-fahrzeug-medium`. Dein Zweig bleibt unberührt, dein eigener Ruf fährt
  dort zu Ende (Fahr-Probe + Dorf-Bild). **Merke für jeden Kopf, der `stamm/siedlung-bewohner.js` oder `stamm/siedlung-satz.js`
  anfasst: diese drei Tore zuerst in den Ruf, dann EIN eigenes.**
- **Den Stations-Kandidaten** (`cloud-post/fahrzeug-medium-station/`) setze ich nach der Landung mit den drei Wänden auf
  punkte-maschine und bestelle die gezielten Läufe für medium#2.
- **Dein nächster Schnitt, Vorrang 1 — Zweig `fahrzeug-gestalt`, Sprosse `karte2.mensch.fahrzeug.gestalt#1` (das BILD):**
  die Station (`punkte-maschine:meisterkarte-quelle/punkte/stationen/k2-mensch-fahrzeug.js:770` ff.) schießt am Messort stadt-voll
  12 m vor dem nächsten Wagen der Stadt, Vorbild „Fotos realer Straßen mit Wagen fünf Gattungen, ≥ 90 % als Gattung erkannt“, und
  steht heute auf `nicht` („die Welt trägt weniger als 5 Fahrzeug-Typen“). Mein Auge am Bild stadt-voll@0.54 (main 3bbd1e8f): die
  Scheiben der Wagen sind fleckig braun (kein Himmel, keine Umgebung im Glas), die Reifen lesen sich nicht als Reifen (kein Profil,
  kein Aufstand, Felge und Gummi ein Ton). Das Gesetz, an der WURZEL, nicht je Wagen: (a) das Glas des Wagens liest das EINE
  Glas-Gesetz des Spiels (Fresnel nach Schlick, n 1,52 → F₀ 0,04; die Spiegelung aus der Umgebung, die das Spiel schon rechnet —
  lies zuerst, was Fenster der Häuser lesen, und lass den Wagen DENSELBEN Leser nehmen; kein zweiter Stoff); (b) der Reifen als
  Gestalt aus dem Rad-Satz, den du gerade gebaut hast (`huelle.radB`, D): Flanke, Lauffläche, Felge als drei Stoffe, die Aufstands-
  Fläche flach nach der Last (dieselbe Zahl W je Rad wie in `radImBoden`); (c) ≥ 5 Gattungen der Stadt aus dem Fahrzeug-Kern
  (Kleinwagen, Limousine, SUV, Lieferwagen, Sportwagen) — zähle erst, was der Zensus heute trägt (`ZENSUS` der Station), und nenne
  die Zahl vorher → nachher. Abgabe mit BILDPAAR am Messort stadt-voll in der Pose der Station (vorher main ↔ nachher), Tris/dc/ms
  vorher ↔ nachher, Ruf mit `bild:stadt-voll@0.55`. Die Schlieren bewegter Wagen sind NICHT dein Schnitt (ein Macher an der Radeon
  baut das Bewegungs-Feld der Zeit-Auflösung) — fasse die Zeit-Auflösung nicht an.
- **Vorrang 2 — Zweig `fahrzeug-medium-2`, der Rest von medium#2 aus deinem „Offen“:** (1) `flug`: 78 von 120 Welt-Fahrten heben
  bei 100 km/h ab — ein Wagen, der über Wellen fliegt, ist der Bruch im Spiel; Täter beim Namen (`fahrStand` über Wellen: Federweg,
  Dämpfung, Abtastung des Geländes je Schritt gegen v·dt), Zahl 78 → n von 120, danach urteilt die Station die WELT statt nur den
  Prüfstand. (2) `rinne_sichtbar`: die Tiefe z des Tritt-Felds senkt das Gelände-Netz am Ort (der EINE Höhen-Leser trägt sie, damit
  Leib, Wasser und Bild dieselbe Rinne sehen) und die Wege-Karte malt die Spur ab der Tiefe, nicht erst ab der Stufe des Pfads;
  Bild der Rinne nach 10 Durchfahrten am feuchten Ufer (dorf). (3) Kurvengrenze je Saat (a_quer = μ·g gegen den Kreis der Station).
- **Regeln der Welle:** Ruf mit KOMMA, höchstens VIER Einträge, jedes Tor ≤ 480 s; `[ci voll]` am Vorprüf-Kopf; Basis deines
  nächsten Kopfs = main + `fahrzeug-medium-ruf` 15630bf4, bis er gelandet ist.
- ZWISCHENSTAND: Karte 2 gebucht 120 von 1 718.
