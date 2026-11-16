# Vorrat 11-mensch-macht-kultur — Fehl-Zettel (Kopf e4eeee08, gelesen, nicht gemessen)

**A 0 · T 0 · F 0 · R 3 · B 13** — 16 von 16 Leitern gelesen (Ziel-Sprosse überall 1); gelesen ehrlich etwa 70 %: je Leiter die tragenden
Stellen im Code und die alten Stationen siedlung.K2 (g5.js:3776/3833), siedlung.K4 (g5.js:4236/4290) und haar.K4 (g2.js:6119), halten.K1 nur aus dem Eingang.

## Die fünf billigsten Sprossen

1. **mensch.macht.wehrbau 1 (R, Bau S, ~15 min je Gerät).** Der Ring mit Toren und Türmen steht und folgt dem Hang (siedlung-wege.js:1738-1766),
   und siedlung.K2#2 schießt ihn schon mittags und in der Dämmerung an beiden Geräten. Es fehlt nur ein Block MAUER im Urteil: gebaute Segmente gegen
   Soll (Geschlossenheit) und Fußunterkante gegen Boden an 5 Stützen (Spalt), in derselben Sitzungs-Probe.
2. **mensch.macht.stand 1 (R, Bau S).** Die Wohnfläche ist schon ungleich (WOHLSTANDS-GESETZ fachwerk-core.js:3278, je Person 20 + 20·wohl m²,
   :8832-8847) — der Gini liest sich aus den Plan-Zeilen der stehenden Stadt. Schwer ist nur „arm/reich erkannt ≥ 80 %“ am Bild; Heap am Dorf ist die Preis-Gefahr.
3. **mensch.kultur.sprache 1 (B, Bau S, ~5 min).** ORTSNAME zieht aus festen Silbenlisten je Region (fachwerk-core.js:3306-3317), der Spieler sieht
   den Namen nie, Personennamen gibt es nicht. Eine Silben-Grammatik aus dem Welt-Samen an derselben Stelle trägt Orts- und Personennamen und den Richter (100 Namen, 2 Saaten).
4. **mensch.macht.recht 1 (B, Bau S).** Der Regelbruch existiert schon: Zeugen erinnern den Schlag des Spielers (siedlung-bewohner.js:2105) —
   die Wache weicht nur wie jeder. Ein Akt „antworten“ für Rolle waechter in _bewohnerZeuge plus Blickkegel statt Radius trüge die Sprosse.
5. **mensch.kultur.glaube 1 (B, Bau S).** Die Kirche ist heute ein Abend-Treff (koerper-core.js:5150), es fehlen Ritus-Stunde und Festtag. Ein
   Bedürfnis ritus im TAGES_GESETZ (:5106) mit Tag-Rhythmus aus der Uhr; der Richter zählt Bewohner im Kultbau.

## Funde über das Paket hinaus

- **Kultur ist Salz und Pfeffer:** die Epoche/Region eines Orts ist ein Hash seines Zell-Samens („jede dritte Siedlung … die übrigen würfelt der
  Same“, stamm/siedlung-ort.js:1955-1961). Ein niederfrequentes Kulturfeld an `fachwerk:siedlungsEpoche` ist der EINE Bau unter diffusion 1,
  grenze 1 (Grenze = Kulturkante), sprache 1/2 (Namen je Kulturraum), verstaendigung 1 (Gruß-Form je Kultur) und gestalt 2 — fünf Leitern an einem Chokepoint.
- **Die Wache ist der zweite Knoten:** recht 1 (Antwort), megastadt 1 (Streife aus der Wache) und krieg 1 (der zweite Bewaffnete) setzen alle an
  der Rolle waechter (koerper-core.js:5138) an — erst recht 1 bauen, dann trägt sie zwei weitere.
- **Beleg stimmt nicht mehr:** recht nennt koerper-core.js:4942 (dort jetzt `_flaechenNormalen`, die Wache steht :5134-5139); wissen nennt
  fachwerk-core.js:8105 (dort jetzt Hüllen-Rezepte). stand sagt „Rollen ohne Stand“ — der Stand ist als stetiger Wohlstand da (:3278, :8835).
- **wehrbau-Falle:** ein Segment über Wasser fällt (`_landAt`, siedlung-wege.js:1738) — eine Stadt am Fluss trägt einen offenen Ring; der Richter
  muss Tore von Wasserlücken trennen oder die Pose an einer Stadt ohne Fluss wählen.
- **Gasthaus als Ankerpunkt:** strassenleben 1 und erzaehlkunst 1 setzen am Angebot gasthaus (koerper-core.js:5149) an; die Gäste kommen heute schon nach ihrem Tagesplan.
