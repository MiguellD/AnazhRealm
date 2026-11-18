# Stab-Wechsel 18.11. — Blatt des Koordinators (Konto 14 → 15)

Stand 18.11. 02:35 · main 21f279f5 (V18.546.330) · Karte 2: **35 von 1 718, Kern 9** · Woche 79 %, Fable 94 % (Reset 21.11. 21:00 UTC).
Was sich danach bewegt, steht im Block „STAB-WECHSEL 18.11." oben in `LAGE.md`. Die Blätter der Geräte und Schneider liegen neben
diesem Blatt (`uebergabe/1811-omen.md`, `uebergabe/1811-gtx1050.md`, `uebergabe/1811/*.md`). `S\` = Scratch der Koordinator-Sitzung
am Laptop (kann verfallen; was zählt, liegt hier im Zweig).

## 1. Das Wichtigste, in dieser Reihenfolge

1. **Der Zähler steht, weil Sprossen im Spiel nicht wahr sind — nicht, weil Messungen fehlen.** Die Rechnung der fehlenden Hälften
   (543 Akten, `haelften.md`): alle 143 fehlenden Hälften zusammen heben die Karte um **3 Punkte**. Der Apparat ist nicht der Engpass.
   Die Karte bewegt nur ein Schnitt, der eine Sprosse wahr macht UND ihre Station im selben Paket mitbringt.
2. **Die Einheit der Arbeit ist die Landung, nicht der Auftrag.** Die Netz-Stadt (42 750 Häuser) lag zwei Tage ungelandet, weil ich
   „die Abgabe steht" sagte und die Landung nie prüfte; ihr Kopf trug das Wort „Abgabe" nicht, also sah der Zug sie nie. Am 18.11.
   lagen 15 Familien gebaut und nie gelandet neben main (`bericht/1811-bergung.md`).
3. **Richter für „gelandet" wie für „verloren" ist der INHALT in main** — nie Zweig-Name, Zug-Zeile oder Abgabe-Text. Ich habe am
   selben Tag beide Fehler gemacht (Stadt als gelandet gemeldet; drei Ankunft-Abgaben als verloren gemeldet, die als Squash 2ac706fac
   in main standen). Probe: `git log origin/main -S'<unverwechselbare hinzugefügte Zeile>'`.
4. **Eine Kennzahl ist nicht das Ziel.** Ein Tag ging an den Kaltstart ≤ 5 s (Pflicht B), der Zähler fiel von 36 auf 35. Wort des
   Schöpfers: 1 717 Punkte ohne den Kaltstart schlagen 50 Punkte mit. Vor jedem Kopf: wie viele Sprossen macht er wahr, sieht es ein
   Spieler? B bleibt seine Zeile, bekommt aber keinen zweiten Schneider hintereinander.
5. **Der Opus-Schwarm, der selbst einzieht, ist die tragende Form:** ein Planer (Pakete mit disjunkten Datei-Listen) → Schnitt →
   gegnerischer Prüfer je Paket → EIN Einzieher, der committet, Tore fährt und EINEN WIP-Zweig pusht; alles in EINEM Baum, die
   Schneider rufen kein schreibendes git. Kein Stau ungelandeter Zweige, kaum CPU am Laptop, kein Fable-Verbrauch außer Blick und Stempel.
6. **Das Auge fängt, was die Zahl durchlässt.** Runde 2 der Haus-Stoffe war in jeder Zahl sauber; der Putz liest im Bild als
   Bretter. Jede sichtbare Abgabe geht durch das Bildpaar (Tag/Nacht × nah/fern), bevor sie gestempelt wird.

## 2. Was ich übersehen habe, wo Zeit verloren ging (Schätzungen als Schätzung)

- **Netz-Stadt, zwei Tage** aus jeder Liste gefallen; der Schöpfer fand sie selbst. Dazu 14 weitere Familien, 21 Familien noch ungeurteilt.
- **Fragen, die meine waren, blieben als Frage an den Schöpfer liegen** — die Familie ferne-ton hing Wochen an „welches Maß setzt du".
  Entschieden am 18.11. in einem Satz. Liegt ein Zweig an einer Frage, entscheide ich am selben Tag oder er fällt offen.
- **Gebaut und nicht gelesen:** die Wirt-Wache lief in 0 von 54 Preis-Stationen (alte Köpfe tragen `/wirt` nicht); 115 Bau-Zeilen
  stehen bei 0 % Konsum, bis `bauRezept` sie liest. Ein Werkzeug ohne Leser ist nicht gebaut.
- **Drei ROT am Spiel ohne Schneider** (kollektiv#1, tiere.verhalten#1, physik.verformung#1) — gemessen, benannt, nicht geschnitten.
- **Stations-Fehler als Spiel-Rot gelesen und umgekehrt** (breite.siedlung#1, bevoelkerung#1, tiere.masse#1): vor dem Schneider
  steht die Triage Station · Soll · Spiel, mit Datei und Zeile.
- **Fehlalarm zu drei Abgaben:** etwa eine Stunde über zwei Geräte, aus einer Zug-Zeile statt aus dem Inhalt.
- **Ein Boot nennt an der Vsync-Stufe keinen Täter:** stadt-voll fiel auf 25 oder 33 ms in beiden Fassungen; ein ABBA aus einem
  Boot war Zufall. Preis-Urteile an dieser Stelle brauchen ≥ 3 Boots je Seite oder den CPU-Takt statt des Frame-p95.
- **Mein eigener Kontext:** Logs, lange Blätter und Bash-Läufe mit 60-s-Abbruch haben Fable gekostet, das dem Blick fehlte. Zwei
  Kontext-Schnitte haben je einen Faden gekostet.
- **Das Gedächtnis:** 18 Einträge „ZUERST LESEN" — also ist keiner zuerst. Die Ordnung 102 → 22 stand seit dem 15.11. aus.
- **Lieferung an die Geräte ist nie bestätigt** (Remote Control meldet nichts zurück): ein Auftrag gilt erst mit der Antwort des Geräts.

## 3. Wie der Koordinator das Ganze hält, ohne dass es den Kontext füllt

Drei Schichten, jede mit festem Ort:

- **Kopf (≤ 40 Zeilen, EINE Seite):** der Block oben in `LAGE.md` — Zähler · je Linie EINE Zeile (Zweig, Kopf, EINE Zahl, nächster
  Schritt, wer) · was auf Blick oder Stempel wartet · offene Entscheide. Acht Linien × vier Fakten: das ist das ganze Bild.
- **Wahrheit aus Werkzeug, nie aus Erinnerung:** `messplatz-blick.cjs --kurz` (Karte 2, WARTEND, UNGELANDET), `git ls-remote`,
  die Inhalts-Probe. Grenzen (Kontowechsel, Kontext-Schnitt, Ende eines Arbeiters) sind die Orte, an denen Arbeit verloren geht —
  dort urteilt ein Werkzeug, nicht ich.
- **Tiefe bleibt, wo sie entsteht:** Blätter mit Pfad, Arbeiter melden ≤ 10 Zeilen. Ich öffne nur, was ein Entscheid braucht:
  ein Bildpaar, eine Zahl gegen ihre Basis, eine Inhalts-Probe. Nie Logs, nie ganze Diffs.

Der Takt je Runde, drei Fragen: **Was landet heute? Was macht eine Sprosse wahr? Was liegt ungelandet?** Die Intuition kommt aus dem
eigenen Blick ins Spiel (einmal am Tag die vier Posen), nicht aus Blättern. Ein Entscheid wird dort geschrieben, wo er wirkt
(Brief, Betreff, LAGE-Zeile), nicht im Gedächtnis.

## 4. Die Linien (Kopf per `git ls-remote` am 18.11. 02:27)

| Linie | Zweig · Kopf | Zustand | Nächster Schritt |
|---|---|---|---|
| Stadt | vorrat11-stadt-netz daf573540 (aus w28-stadt-netz f23138ba) | WIP, Abgabe-Entwurf liegt | Blick auf die Bilder + K1-Zahlen → Stempel `w28-stadt-netz`; danach OMEN 5×5 und 15×15; dann K2 (Eintrag nur im Leib-Ring, 1 829 → ≤ 279), K3, K4, K5 und w28-weg-koerper als Neubau |
| Haus-Stoffe | w28-haus-stoff 41dd9e32b (OMEN) | Abgabe frei mit Putz-Bedingung | OMEN stempelt selbst; landet NACH der Stadt (beide besitzen fachwerk-core.js) |
| Bau-Gesetz | vorrat12-bau-rezept 06f0241a7 | WIP, Kopf 1 `bauRezept` | Byte-Beweis 32 × 16, Bildpaar Dorf → Stempel `w28-bau-rezept`; landet nach Stadt und Haus-Stoffen; Köpfe 2–7 nacheinander |
| Licht | w28-strahler 494851b2c (GTX 1050) | WIP, Zielbild angenommen | Blick auf die Bildpaare → Abgabe; dann Tonkurve unter dem Knie → ferne-ton (Maß: Ferne = Mittel der Strahldichte der nahen Wiese) |
| Mensch | vorrat9-mensch 4ea27bf1b | WIP | Stempel `w28-zugang-zeilen` |
| Register | vorrat10-register de4c0ba29 | WIP | OMEN fährt die Runden-Kette → Stempel `w28-halter-register` |
| Ankunft | vorrat8-ankunft a3ca7ec67 | WIP, Abgabe-Entwurf liegt | Blick, Tore, Stempel; danach geht der Platz an Sprossen |
| Kern-Sprossen | vorrat13-kern-sprossen (Schwarm, noch nicht gepusht) | läuft | Blatt `kern-sprossen.md` lesen, WIP ansehen, Stempel `w28-kern-sprossen`; Stations-Bedarf an den Vorarbeiter |
| Maschine | punkte-maschine = koordination e7fbce775 | Vorarbeiter 13 | bevoelkerung#1: erst die Zahl „draußen je Uhr", dann Orte je Stunde; drei Spiel-Rot auf Datei:Zeile |

**Wartet auf Blick oder Stempel des Koordinators:** Stadt · Ankunft · Bau · Mensch · Register · Kern-Sprossen · Strahler.
Stempeln heißt: eigener Blick, Tore, Commit mit dem Wort „Abgabe" und `[ci voll]` — sonst sieht der Zug den Kopf nicht.

## 5. Entscheide, die stehen (nicht neu aufrollen)

- Bergung nach Rang: Netz-Stadt → weg-koerper (Neubau) · Licht-Kette strahler → Tonkurve → ferne-ton · Register liest reise-raeumt
  und heap-zensus · auf freien Platz: studio-seiten, rasen-schnitt, reibellipse (die Invariante misst gegen die Ellipse), seiten-stille
  · Altlast nur als Neubau: w4-gehege, w4-stadt-orte, w4-e-buendel · fallen offen: w28-heap-haus (867445c0), w28-fruehbild, w28-baum-schirm.
- Strahler: EIN Gesetz Leuchtdichte × Fläche; Temperatur wo sie Zustand ist, sonst EIN Datum `leucht` je Lampe; beide durch dieselbe
  EINE Funktion; Nahfeld-Richter = Flächen-Integral bei 10/40/60 m ≤ 15 %.
- Haus-Stoffe: Sockel am Verband angenommen, nicht am Ton; die Tonkurve gehört der Licht-Kette.
- Stadt: Prinzip STREICHEN + INDEX (Eintrag nur im Leib-Ring bis 325 m, die Ferne aus derselben Hausliste); verworfen FELD, STROM,
  reiner INDEX, „Teppich".
- bevoelkerung#1: die Wache Σ Soll ≥ 20 bleibt. tiere.masse#1: Soll-Frage offen (Sprosse will 10, das Gesetz gibt Rudel 3–7).

## 6. Offen ohne Schneider

Spiel-Rot: kollektiv#1 (38 Zeugen, Furcht 0 → 1, Abstand bleibt 11,11 m) · tiere.verhalten#1 · physik.verformung#1 · tiere.wanderung#1.
Funde: Haus-Hülle vor dem Boden (stamm/siedlung-instanz.js:898) · schatten.K3#1 (stamm/bild-schatten.js:1426) · ferner Fahrer bei
LOD 2 · Herde am Hang (tetrapoda-core.js:46) · CPU-Takt der Bewohner in der Stadt (`_tickBewohner`, stamm/siedlung-bewohner.js:1669)
· lineare Laternen-Suche (`_leuchtQuellen`, stamm/dirigent-kern.js:1777) · STILMODE klemmt die griechische Dachneigung
(fachwerk-core.js:183) · stiller catch am Flügel (fachwerk-core.js:1755, fail-soft). Bergung: 21 Familien ungeurteilt.

## 7. Aufräumen der Alt-Zweige (Wort des Schöpfers 18.11.: „Ja, die 35 löschen")

Gelöscht sind 33 Zweige, deren hinzugefügte Zeilen zu ≥ 85 % wörtlich in main stehen (Liste mit Kopf-SHA:
`bericht/1811-geloeschte-zweige.md`); jeder Kopf bleibt am Ursprung unter `refs/archiv/1811/<zweig>` erreichbar. Stehen blieben
`zug-b` (Kopf seit der Messung bewegt) und `zug-a` (Schwester-Zweig des Zugs). Am Ursprung liegen danach 1 146 Zweige; für alle
übrigen gilt weiter: niemand löscht ohne sein Wort.

## 8. Werkzeuge, erprobt — Befehl · Zweck · Falle

- `messplatz-blick.cjs --kurz` · der Blick: Karte 2, WARTEND, UNGELANDET · UNGELANDET rechnet höchstens einmal je Stunde.
- `punkte.cjs run --sha <Kopf> --geraet <radeon|gtx> --nur <station>` · schließt eine Hälfte · gebucht wird nur ein Paar am SELBEN Kopf.
- `vision/buche-2.cjs --akten <…> --trocken` · sagt vor der Fahrt, was eine Messung bewegt · erst rechnen, dann fahren.
- `ungelandet.cjs --tage 7` · Anteil der hinzugefügten Zeilen eines Zweigs, der wörtlich in main steht · umgeschriebener Alt-Code zeigt zu wenig.
- `git log origin/main -S'<Zeile>'` · die Landungs-Probe · Squash-Landungen tragen einen anderen Namen.
- werkbank `--echt` · echte GPU, echtes Bild · ohne `--echt` 360 Zeilen; GPU-Schloss in Stücken ≤ 15 min; nie zwei Messungen zugleich.
- Workflow „kern-sprossen" (Planer → Schnitt → Prüfer → Einzieher) · Schwarm, der selbst einzieht · gesperrte und geteilte Dateien im Plan nennen.
- koordination ohne Arbeitsbaum schreiben (eigener Index, `read-tree` → `update-index --cacheinfo` → `commit-tree` → push) · nie im Baum des Vorarbeiters.
- git aus PowerShell · schnell · das Bash-Werkzeug bricht Log-Greps nach 60 s ab; PowerShell 5.1 verstümmelt UTF-8 in Pipes.
- Gebaut, noch ohne Leser: Wirt-Wache (0 von 54), `--drossel n`, `bau-zeilen.json` (115 Zeilen, 0 % Konsum).

## 9. Die ersten 30 Minuten des nächsten Kontos

1. `git fetch`; den Block oben in `LAGE.md` und dieses Blatt lesen — sonst nichts.
2. Den Blick fahren; WARTEND und UNGELANDET gegen die Tabelle in Abschnitt 4 halten (`git ls-remote` je Zweig).
3. Die Geräte ansprechen und auf ihre Antwort warten (eine Zeile Echo); ihre Blätter lesen.
4. Stempeln, was auf den Blick wartet, in der Lande-Reihenfolge Stadt → Haus-Stoffe → Bau.
5. Erst dann Neues: der nächste Kern-Sprossen-Schwarm über die S1 der Leitern, die bei 0 stehen.

## 10. Mut — die Schnitte mit dem größten Hebel

- **Der Mensch als Funktion:** Plan f(Same, t), ein Leib nur im nahen Ring — dasselbe Prinzip wie die Stadt-Einträge. Ohne das endet
  die Bevölkerungs-Leiter (10² … 10¹⁰) bei Sprosse 1.
- **`bauRezept` als EIN Gesetz** aus Nutzung · Bauweise · Rahmen · Haushalt: 115 Zeilen werden Häuser, ohne ein Draw mehr.
- **Schnitt + Station + Buchung als EIN Paket:** die Sprosse zählt am Tag, an dem sie wahr wird.
- **Der Schwarm im Dauertakt:** 1 718 Sprossen in 30 Tagen sind 57 am Tag; heute sind es null bis eine. Das schließt keine einzelne
  Sitzung, nur zwei bis drei selbst einziehende Schwärme je Tag über die untersten Sprossen der Leitern — und ein Koordinator, der
  nur blickt, entscheidet und stempelt.
