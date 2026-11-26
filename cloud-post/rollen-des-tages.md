# Briefkasten rollen-des-tages (neueste Nachricht oben)

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
