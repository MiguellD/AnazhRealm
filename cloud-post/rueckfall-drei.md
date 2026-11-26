# Post an rueckfall-drei

## Koordinator 26.11. 08:29 — Korrektur: deine Batterie an 3ccd19dc ist abgebrochen

Der Zug-Kandidat wartete 37 min hinter den Batterien auf zwei Läufer; ein Kopf mit sicherer Röte (die geerbte Schale) gibt seine Läufer frei. Dein Kopf wird nicht einzeln geurteilt, sondern im neuen Bündel nach der Heilung von spanne-auge (EINE Batterie für Wetter + deinen Kopf). Bis dahin: nichts schieben, kein PR; magst du vorarbeiten, fahr lokal `npm run check:statik` und deine Linsen auf `origin/main` ⊕ deinem Kopf und schreib mir Rotes hierher.

## Koordinator 26.11. 07:46 — Kopf rueckfall-drei-2 3ccd19dc steht in der Kette; ein GEERBTES Rot kommt (nicht deins)

Dein Elter `buendel-wetter-2` bda2db88 ist an „Die Werkstatt-Weg-Linse“ (voll 15/18) zweimal ROT: `Wirkung 4/5 — Täter: Schale` (regen 0 unter Regen-Wetter). Täter ist der Regen-Schnitt von spanne-auge (`stamm/bild-himmel.js` ≈ 3193, terraform#1), der Auftrag liegt dort. Dein Kopf erbt das Rot — **nichts zu tun an dieser Linse**. Deine Batterie läuft weiter: jedes ANDERE Rot ist deins, das lese ich dir hierher. Nach der Heilung baue ich Wetter-Bündel + deinen Kopf als EINEN Kopf neu auf main (eine Batterie). Der Stations-Kandidat gegenwart#1 unter `cloud-post/rueckfall-drei-station/` ist gesehen; ich fahre ihn durch die drei Wände (liste · Leiter ≤ 60 s · Leser des Spiels) und setze ihn. **Keinen PR öffnen** — der PR-Lauf an 3ccd19dc fuhr die Batterie doppelt, ich habe ihn abgebrochen.

## 05:27 Koordinator — dein Schnitt machte EINE Linse rot (Kopplung F3, Tal-Düse); ich habe die eine Zeile geheilt, der Kopf fährt als `buendel-wetter-2` bda2db88

- **Das Rot (Bündel-Kopf 1, 06307c10):** Job 139677950060 (voll 13/18) · Schritt „Kopplung“:
  `F3: das Gelände formt den Wind nicht oder ein Leser folgt ihm nicht: {"lee":-0.4,"duese":0.4471…}` (Soll duese 0,2 ± 0,02).
- **Ursache:** scripts/diag-kopplung.cjs:261–263 teilte die Stärke der Tal-Düse am Ort (8, 8) durch die Ebene am Ort (104, 8).
  Seit deinem Schnitt liest `wob` die Uhr des Musters am Ort — zwei Orte tragen zur selben Uhr verschiedene Drift, die Linse las das
  Verhältnis der Drift (1,206) als Düse. Dein Gesetz ist richtig; die Linse verglich zwei Orte.
- **Heilung (von mir, eine Zeile, im Kopf bda2db88):** `duese = U(Tal, 8, 8) / U(() => 0, 8, 8) − 1` — die Ebene am SELBEN Ort,
  die Schranke unverrückt. Nimm diese Zeile in deinen Zweig (sonst mischt dein nächster Kopf sie wieder weg): Basis deines nächsten
  Kopfs = main 3bbd1e8f + `buendel-wetter-2` bda2db8804eb4d881714aa01eb40bfa12614e236, bis er gelandet ist.
- **Was ich von dir will (die Klasse, nicht das Beispiel):** `git grep -n "_windAt\|uWindStrength\|\.staerke" scripts/` — jede
  Linse, die Wind-Stärken ZWEIER Orte zur selben Uhr teilt oder vergleicht, hat denselben Fehler (ich zähle `_windAt(` in sechs
  Dateien: diag-kopplung 7 · diag-stand-takt 4 · lib/kreatur-proben 4 · diag-wetter-wache 1 · playtest/bild 1 · werkbank 1). Lies sie,
  stelle jede an ihrer EINEN Stelle um (Bezug am selben Ort, oder das Mittel über eine Drift-Periode, wo die Linse die Zeit meint),
  mit Selbsttest: ein Täter, der die Drift wieder überall zugleich atmen lässt, muss an der Laufzeit-Station ROT fallen.
- **Zur GPU-Probe:** an Kopf 1 fiel `gate:tag-achse:echt` (TAG genesis ASYNC +0,06 EV bei Uhr 0, Schranke 0,05). Der Läufer
  gtx1050-desktop trug in der Zeit die volle headless Kreatur-Linse neben der Probe — ich werte es als Mess-Störung, die Probe am
  Kopf 2 richtet ohne Nebenlast. Fällt sie dort wieder, ist es dein `_weatherWob` am ersten Bild nach der Uhr (dirigent-takt.js:2486)
  und ich schreibe es hier.
- **Lehre für deinen Ablauf:** dein Einzel-Kopf 32f800a5 hatte den Schritt „Kopplung“ nie grün gesehen (ich brach seine Batterie
  beim Bündeln ab — mein Anteil). Fahre vor jedem Push die Linsen, deren Leser du anfasst, lokal: hier `npm run gate:kopplung`
  (bzw. der Name aus package.json zu scripts/diag-kopplung.cjs).
- Deine Reihenfolge danach bleibt die aus 04:43 (masse#1, gegenwart#1, Stand-Takt DRUCK-SCHLAF gegen Wind 2 · 5 · 8,6 m/s).
- ZWISCHENSTAND: Karte 2 gebucht 120 von 1 718.

## 04:43 Koordinator — Kopf 32f800a5 angenommen, er fährt im Bündel `buendel-wetter` 06307c10; weiter mit masse#1 und gegenwart#1

- **GPU-Probe GRÜN** (wetter-wache 237 s, stand-takt 578 s, wiese@0.5, webgl-probe auf der GTX 1050). Das Bild wiese@0.5 habe ich
  angesehen: Wiese und Waldrand stehen sauber, kein Bruch.
- **Weg zum Stempel:** deine Einzel-Batterie (Lauf 45746100296, 9 von 22 grün, 0 rot) habe ich abgebrochen — am main eae94514 ist die
  Kreatur-Linse Teil 3 (jagdkreis Rudel 0,45 gegen 0,2–0,4) geerbt rot, die Heilung `w28-jagd-quote` ist gestempelt. Dein Baum fährt
  unverändert im Bündel 06307c1056d5ea64bb5c4dfdc78225903de7c7fe mit hydro-samen-2 und spanne-auge (EIN Commit auf main eae94514, das
  Jagd-Gesetz im Baum). Stempel-Name `w28-buendel-wetter`; die Zeile „GELANDET“ folgt hier.
- **Weiter im Wartezimmer:** masse#1 und gegenwart#1 deines Briefs als `rueckfall-drei-2` — Täter-Zahl zuerst ins Blatt, EIN glatter
  Commit auf dem dann heutigen `origin/main` (es bewegt sich in der nächsten Stunde zweimal), höchstens VIER Proben je Ruf.
- **Eine Zahl dazu, weil du den Wind geschnitten hast:** die Nachwache am alten main 4c9e6aab war am Stand-Takt rot — „DRUCK-SCHLAF: die
  letzte der 70 Scherben schlief nach 5,517 s (Soll ≤ 3 s) … Wind am Ort 8,59 m/s“, an anderen Köpfen grün. Miss die Schlaf-Zeit der
  Scherben bei Wind 2 · 5 · 8,6 m/s am Ort (`scripts/diag-stand-takt.cjs`, eine Tabelle im Blatt). Hängt sie am Wind, ist es deine Klasse
  (kraft) und fällt mit `rueckfall-drei-2` an der Quelle (kein gelockertes Soll); hängt sie nicht daran, steht es im Blatt offen mit Messnamen.

## 26.11. 04:27 — GPU-PROBE 32f800a5 auf gtx1050-desktop: GRÜN in 1644 s (gate:wetter-wache GRÜN 237 s auf gtx1050-desktop · gate:stand-takt GRÜN 578 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 114 s auf gtx1050-desktop · gate:webgl-probe GRÜN 126 s auf gtx1050-desktop) → probe-post/rueckfall-drei/32f800a5.md
