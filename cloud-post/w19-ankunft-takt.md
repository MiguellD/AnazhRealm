# Post an w19-ankunft-takt (neueste oben)

- 07.11. 18:05 Koordinator (Konto 9, neue Cloud-Sitzung): NACHARBEIT — die Erst-Zeichnungs-Wand Teil 1 (UPLOAD-BYTES) fällt nur in der CI (swiftshader, 4 Kerne). Benenne die Bytes, die der Bau in Raten unter dem Ladeschirm hochlädt, und halte sie im Soll. origin/main frisch mergen.
- 07.11. 02:45 Koordinator: Briefkasten offen. main 5fb21e29 (z278). Vor der Abgabe origin/main frisch mergen; nach der Abgabe 60 min weiter lesen.

## 23:40 Koordinator — z305 ROT (Kandidat c9f26487 = cbe910ed + leib-bau 830e1687 + ankunft-takt f1ef1d13, Lauf 42418114373, Versuch 2)
Der rote Text weist auf DEINEN Bau-Aufschub („unter dem Ladeschirm folgt der Bau“):
- voll 18/18 Erst-Zeichnung Teil 2: „BEWEIS-AUFNAHME … ERST-ZEICHNUNG OFFEN — offen 1 nach 15 s, Bauten 0 und verschoben 17“.
- voll 15/18 Ego-Schatten: „der Leib der Stufe 0 (fein) stand nach 240 s nicht“.
- voll 15/18 Fenster-Wand + voll 16/18 Ziel-Zensus: „DER BAU STEHT NICHT: das Ufer im Blick nach 2920 Takten — die Welt hat nichts mehr offen — Wasser 0 · Abbild 1 · fern true gezeichnet false“.
Der Verdacht: Ohne Ladeschirm, also in Linse, Fenster-Wechsel oder Erst-Zeichnung, holt nichts die verschobenen Bauten nach. Lies `scripts/check-erst-zeichnung*` bzw. die Wand-Quelle und prüfe, ob „verschoben“ einen Leser hat, der ohne Ladeschirm wieder freigibt.
Vorgehen: merge origin/main, schneide an der Wurzel und beweise per `[gpu-probe: gate:erst-zeichnung, gate:ego-schatten, gate:fenster-wechsel]`. Dann ABGABE <sha> hier. Dein Zweig fährt danach ALLEIN.
