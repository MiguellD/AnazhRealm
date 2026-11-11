# Die frei-sonde der GTX 1050 — die echte Zahl der Ankunft ohne DevTools

Chrome startet als nackter Prozess (kein Puppeteer, keine DevTools-Sitzung), frisches Profil je Lauf, die Seite meldet per POST.
Im Spiel-Baum rufen (Dateien dieses Ordners nebeneinander an einen Ort außerhalb des Baums legen, z. B. `.git/werkzeug/`):

```bash
FREI_ECHT=1 node <ort>/frei-sonde.cjs
FREI_ZERLEGE=1 FREI_JSON=<ort>/lauf.json node <ort>/frei-sonde.cjs
node <ort>/echt-lesen.cjs <ort>/lauf.json
```

Zeile 1 druckt `WELTBILD@ · ready@ · BUCH offen ab Navigation` am echten Renderer der Karte (Adapter in der Zeile).
Zeile 2 schreibt dazu die Zerlegung: Lücken-Terme des Spiels mit Täter (`_lueckeTaeter`), lange Aufgaben des Haupt-Fadens,
Nachrichten je Faden, Bauten je Foundry-Faden, Pipelines der GPU. Zeile 3 liest sie; `bau-lesen.cjs` (Foundry-Arbeit je Art),
`pipe-lesen.cjs` (Pipelines), `post-lesen.cjs <json> <faden>`, `karte-lesen.cjs`, `summe-lesen.cjs` (mit `FREI_INIT=<tiefe>`,
`FREI_INIT_VON/BIS`: das Ruf-Profil des Prototyps) lesen Teile.

Programme: `FREI_SHADER=1` merkt je Pipeline Länge und Kennung von Vertex- und Fragment-Text und die Texte der Standard-Stoffe;
`shader-lesen.cjs` (gemeinsamer Kern, Paare), `shader-kern.cjs` (Bindungen, Abtastungen, das ähnlichste Paar ganz), `pipe-schlange.cjs`
(Belegung der Übersetzer-Schlange), `programm-lesen.cjs` mit `FREI_EINGRIFF=eingriff/programm-log.js` (Knoten-Bau je Stoff mit den
Gliedern seiner Arena, daneben seine Pipeline).

Weitere Schalter: ohne `FREI_ECHT` der Null-Renderer wie das Tor (`BÜHNE im Takt`). `FREI_PROFIL=<ordner>` hält das Profil über
zwei Läufe (Zweit-Boot), `FREI_PLATTE=leer|atlas|alles` fegt davor die Foundry-Platte im Faden (`blob`: die CSP-Probe).
`FREI_EINGRIFF=<datei.js>` lädt einen Eingriff zum Messen (Rumpf einer Funktion, `P` = der Prototyp; Beispiele in `eingriff/`),
`FREI_OHNE=<glied,glied>` lässt Glieder bis zum Weltbild ruhen, `FREI_TRACE=<datei>` schreibt Chromes Start-Spur.
Das ganze Bild (w28-bild-ganz): `FREI_EINGRIFF=eingriff/bild-luecke.js` zählt je Bild VON AUSSEN, wer in der Welt-Szene zeichnen
wollte (ein Ruf der Erst-Zeichnung mit Zug-Parametern) und nicht zeichnete (kein Zug des Backends; Bündel, die ohne einen Bürger
versiegelten, eingeschlossen) — `luecke-lesen.cjs` nennt die Fehlenden am ersten Weltbild beim Namen, ihren ersten Zug danach und
das erste ganze Bild. `eingriff/karte-bild.js` legt dazu drei Bilder der Leinwand ab (im Task des Weltbilds, beim ersten Zug der
Karten, 3 s danach: `<lauf>-weltbild.jpg` …) und den Stand der Atlas-Gruppe (`karte-bild-lesen.cjs`); beide hintereinander in EINE
Datei gelegt, laufen sie zusammen. `FREI_NACH=<ms>` lässt das Spiel so lange nach dem Bild weiterlaufen. `gc-zweit-ab.sh <name>
<A> <B> [runden] [erste Runde]` fährt zwei Stände im Wechsel, je kalt und als Zweit-Boot.
Der Kern nach Bausteinen (w28-baum-programm): `baustein/<name>.js` nimmt je EINEN Baustein aus jedem Stoff (kaskaden, sonnensicht,
wuerfel, pool, luft, naesse, umgebung — Messung, kein Schnitt); mit `FREI_SHADER=1` und `eingriff/programm-log.js` davor nennt
`baustein-lesen.cjs <stand.json> <fall.json> …` je Programm-Familie den Fragment-Text in KB und den Unterschied.
`gc-zweit.sh` und `gc-sonde.sh` sind die Läufer der GTX 1050 (Schloss und Hook-Log dieses Geräts stehen darin — anpassen).
Der Port ist 4417. Ein Lauf dauert 25–55 s.
