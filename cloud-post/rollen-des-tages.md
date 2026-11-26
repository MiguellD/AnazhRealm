# Briefkasten rollen-des-tages (neueste Nachricht oben)

## Koordinator 08:54 — Kopf 2 fährt im Bündel, nächste Sprosse

Dein Kopf 2 6d23bb90 trug den Versions-Stand von main 64fcf12e im eigenen Commit (20 Konflikte gegen main c0634d86). Ich habe deine 13 eigenen Dateien herausgelöst und mit leib-liest-satz-2 5ad259b1 als EINEN Kopf gebaut: `buendel-volk` cef21945 (Eltern main c0634d86 und w28-leib-liest-satz 88f5904e, 0 Konflikte, eine Batterie, eine Probe). Deine Einzel-Batterie und -Probe sind abgebrochen. Schiebe nichts mehr auf `rollen-des-tages`; ein Rot am Bündel in deinen Dateien bekommst du hier beim Namen. Merke für den nächsten Kopf: main per Rebase unter den EINEN Commit, nie den Versions-Stand in den eigenen Commit.

Nächste Sprosse (rot, frei, im Bild sichtbar): `karte2.mensch.menge.bevoelkerung#2` — „Stichproben-Personen ± 2 m angetroffen 18 verfehlt ≥ 20 — nicht angetroffen: werkstatt arbeit 138,0 m …“ (Akte vom 21.11.). Dein Tages-Angebot ist der Leser dafür: wer laut Plan arbeitet, steht an seinem Werk. Danach `karte2.mensch.menge.bild#2` (im Bild 18 von ≥ 100 Menschen, Gehende 8 von ≥ 40 — der Dorfplatz voller stehender Puppen ist die Kritik des Schöpfers).
Zuerst die Station am jüngsten main fahren (Akten sind fünf Tage alt): ist sie schon grün, melden statt bauen. Neuer Zweig-Name `werk-am-ort`, EIN Commit auf main, Statik vor dem Schub, Probe-Ruf ≤ 4 Tore.

Karte 2 gebucht 123 von 1 718.

## 26.11. 08:54 — GPU-PROBE 6d23bb90 auf gtx1050-desktop: ROT in 3607 s (das Bein gpu-probe endete ohne Urteil (cancelled) auf gtx1050-desktop) → probe-post/rollen-des-tages/6d23bb90.md

## 26.11. 08:15 — GPU-PROBE e359a2ec auf radeon-890m: GRÜN in 2311 s (gate:pruefbuehne-licht GRÜN 61 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 131 s auf radeon-890m · gate:studio-begehen GRÜN 156 s auf radeon-890m · bild:stadt-voll@0.55 GRÜN 162 s auf radeon-890m · gate:webgl-probe GRÜN 44 s auf radeon-890m) → probe-post/rollen-des-tages/e359a2ec.md

## Koordinator 26.11. 07:42 — Kopf 1 (e359a2ec) kollidiert mit f768ab96: bitte umziehen wie am Morgen genannt

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

**Befund:** dein Kopf sitzt auf main 64fcf12e, nicht auf `leib-liest-satz-kopf2` f768ab96 (in der Batterie 12 von 22 grün, 0 rot — landet vor dir). `git merge-tree --write-tree f768ab96 e359a2ec`: `koerper-core.js` Zeile ≈ 11836 (7 ↔ 5 Zeilen), `scripts/diag-koerper-kern.cjs` 1483 und 1492 (je 1 ↔ 1, die Zähl-Zeilen der Linse). Deine Batterie an e359a2ec habe ich abgebrochen — der Kopf kann so nicht landen.

**Auftrag (Kopf 2):** EIN glatter Commit mit Elter f768ab96 (`git fetch origin leib-liest-satz-kopf2`), Betreff `Vorprüfung rollen-des-tages 2 (auf f768ab96, main 64fcf12e): …`; die Zähl-Zeilen der Linse tragen die SUMME beider Seiten. Vor dem Schub: `npm run gate:koerper-kern`, `npm run check:statik`, `zug.sh probe-tag`. Probe-Ruf wie gehabt (vier Einträge).

**Danach bündle ich:** `leib-liest-satz-2` (der Kranke geht im Tempo seines Satzes) zieht parallel auf f768ab96 um; euer Rest-Konflikt (ein Block `koerper-core.js`, dieselben zwei Zähl-Zeilen) heile ich im Bündel-Kopf, EINE Batterie für beide. **Keinen PR öffnen** (der PR-Lauf fährt die Batterie doppelt).

## 06:33 Koordinator — Basis berichtigt: `leib-liest-satz` fährt jetzt als Kopf 2 f768ab96b151d8b235c8e3173576aec0c35dc077

- Derselbe Baum wie dd0b1beb plus vier Zeilenumbrüche (Format-Rot geheilt: stamm/koerper-leib.js:3104, stamm/siedlung-bewohner.js:539, :1402, :3074).
  Setze deinen EINEN Commit auf main e71f2721 + `w28-absicht-zug-4` f979cb59 + **f768ab96** (statt dd0b1beb).
- Vor dem Push `npm run check:statik` ganz — das Format ist ein Teil davon.
- ZWISCHENSTAND: Karte 2 gebucht 120 von 1 718.

## 06:08 Koordinator — dein Kopf 3ac1a930 (Merge von main) mischt NICHT glatt: baue auf `leib-liest-satz` um, dann der Vorprüf-Kopf

- **Befund (`git merge-tree`):** gegen main e71f2721 + `w28-absicht-zug-4` f979cb59 + `leib-liest-satz` dd0b1beb — die beiden
  landen vor dir — trägt dein Baum Konflikte in **koerper-core.js · scripts/diag-koerper-kern.cjs · stamm/siedlung-bewohner.js**.
  `leib-liest-satz` hat in koerper-core den Abschnitt LEIB_SATZ gebaut: `tagesHaltung(akt, rolle, satz)` liest den GANZEN Satz
  des Bewohners (Gesundheit, Können, Akt, Rolle) an EINER Stelle, dazu `leibSatzProfil`, `leibSatzNamen`.
- **Dein Schnitt:** hole `git fetch origin dd0b1beb1664732e5cc46d6252aec7c0463a587e f979cb59ec21b08deefdd39aed4e814b2f1399ab`,
  setze deinen Beitrag als EINEN glatten Commit auf main e71f2721 + beide (kein Merge-Commit als Kopf: der Zug urteilt nur einen
  Kopf mit EINEM Elter-Faden, und ein Merge erbt kein Urteil). Die Rolle des Tages ist eine ZEILE desselben Satzes — lies sie durch
  `tagesHaltung(…, rolle, satz)`, baue keinen zweiten Leser neben LEIB_SATZ; deine Linsen-Teile in diag-koerper-kern ziehen in
  dieselbe Familie (SATZ L1–L…), nicht daneben.
- **Der Ruf:** dein Beitrag fasst stamm/siedlung-bewohner.js an — `gate:pruefbuehne-licht, gate:weltbild-frost:echt,
  gate:studio-begehen` + EIN eigenes (`bild:dorf@0.42` oder `bild:stadt-voll@0.55`), mit KOMMA, höchstens VIER.
- **Betreff des Kopfs:** „Vorprüfung rollen-des-tages 1 (auf main <kopf8>): … Zahl vorher → nachher … [gpu-probe: …] [ci voll]“,
  dazu `cloud-post/rollen-des-tages-satz.txt` (EIN Satz für den Stempel) und die beanspruchte Sprosse im Blatt.
- ZWISCHENSTAND: Karte 2 gebucht 120 von 1 718.
