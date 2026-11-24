# Vorprüfung ci-post-erbt — der Kopf ist sein Inhalt, der Post zählt nicht

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 77 von 1 718. Diese Abgabe ist Apparat: sie bucht keine Sprosse.

**Geschnitten:** Der Inhalt eines Kopfs ist sein Wurzel-Baum ohne den Eintrag `cloud-post` (`scripts/ci-kopf.cjs` `inhaltVon`).
`kopfKette` vergleicht diesen Inhalt statt der Baum-SHA. `kopfKetteLesen` liest ihn je Glied aus `/git/trees/<baum>`,
`kopfKetteLokal` aus `git ls-tree` für den Zug-Dienst. `probeErbe` erbt über dieselbe Kette. In `check.yml` läuft ein Push,
dessen Kopf genau eine Datei unter `cloud-post/` anlegt oder ändert und nichts löscht, in der eigenen Gruppe `…-post`. Er
bricht die Batterie des Zweigs nie ab. Die Dienst-Quelle `zug/dienst/ci.sh` (Zweig `koordination` db222f087) ruft
`kopfKetteLokal`. Ihre Zeile „geerbt“ nennt den Bau, der urteilte; bricht der Richter, steht „kette: ROT“ da.

**Gemessen (vorher, klang-leib am 24.11.):** Drei Köpfe mit demselben Code, nur `cloud-post/klang-leib.md` verschieden
(402c95d2a, b57aeb3ca, 77abe2313), alle mit `[ci voll]`:

- Der eine Code-Stand startete 3 Batterien (#7611, #7612, #7613).
- 2 davon brachen durch Post-Pushes ab. #7611 hatte 18 von 18 Gruppen am Laufen und warf 72 Job-Minuten weg.
- Erst #7613 trug das Urteil (204 Job-Minuten).

**Nachher:** Die Läufe dieses Zweigs zeigen es: der Bericht hier ist ein Post-Glied über der Vorprüfung.

**Ehrlich offen:**

- Die Installation des Dienstes an der Radeon (Koordinator).
- Bis main `kopfKetteLokal` trägt, urteilt der Dienst mit dem alten Bau, und die Zeile „geerbt“ sagt das.
