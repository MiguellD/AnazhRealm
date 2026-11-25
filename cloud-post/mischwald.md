# Bahn mischwald — der Mischwald nach der Ertragstafel (Sprosse karte2.leben.pflanzen.lebenslauf#1)

ZWISCHENSTAND · Karte 2: 108 von 1 718 gebucht (gate:betriebsgesetz am Kopf; diese Sprosse bucht der Richter, nicht die Bahn).

## Was die Station liest (wörtlich, `k2-leben.js` aus `punkte-maschine` 33ad82bf, Z. 684–858)

- **Leser:** `[LL_ID]` mit `LL_ID = "leben.pflanzen.lebenslauf"`, `mess` (sek 20, `pfad: PFAD_WALD.concat(["stamm/feld-leben.js", "stamm/bild-himmel.js"])`), das Auge `u: { auge: { ort: "wiese" } }` — „Ego im Wald am Rand der Mess-Wiese“.
- **Messfunktion (S1):** im Kreis `lokalM: 150` um den Spieler über `st.architectures`:
  `if (/gefallen|totholz/.test(e.type)) totholz++; else if (/^baum_/.test(art(e._lodSpecies || e.type))) lok.push(e.scale);`
  dann `hist` über `klassen: [0.55, 0.8, 1.05, 1.3, 1.55, 2.0]`. Die Werte lauten
  `{ baeumeLokal: w.lok, reverseJ: w.hist[0] >= w.hist[1] && w.hist[1] >= w.hist[2] ? 1 : 0, totholz: w.totholz, staemmeJeHa: Math.round((w.lok / (Math.PI * 150 * 150)) * 10000) }`.
- **Soll:** `[ohneZahl(LL_ID, 1, "Höhenhistogramm aus dem Bild gegen Ertragstafel", "hoehenAbstand")]` — `rel: "gegen"`, hält NIE (kein Wert `hoehenAbstand` im Roh). Der Vorschlag `unklar` lautet: „Kolmogorow-Smirnow-Abstand Höhenhistogramm ↔ Ertragstafel ≤ 0,15“. Der Täter: „phyto-core.js forestTreeSize (reverse-J als statischer Parameter)“. `gruen`: `{ hoehenAbstand: 0.1, baeumeLokal: 300, reverseJ: 1 }`.
- **Umfang:** S1 von 6. S2–S6 (Bildreihe über Jahre, Ertragstafel-Verhältnisse 150/50, Rückkehr, 1 000 Pflanzen, Chronosequenz) lesen die Uhr `_baumAlter`. Die Bahn berührt sie nicht.
- **Kandidat:** `cloud-post/mischwald-station/lebenslauf-s1.js`. Er misst `hoehenAbstand` (KS Dach ↔ Normalwald der Tafel) und `reinekeSteigung`. Die Station ist unverändert; `ohneZahl` fällt nur, wenn der Richter es entscheidet.

## Geschnitten

EIN Gesetz in `phyto-core.js`, `FOREST_ERTRAG`:

- **Flecken und Alter:** Der Wald ist ein Mosaik gleichaltriger Flecken (`forestFleckPhase`, Voronoi, Kante 40 m). Jede Art durchläuft darin ihre Ertragstafel, WBR 86 Tab. 3 (Niedersachsen), Bestandesmittelhöhen: A = A₀ + u·(A_end − A₀), s = h(A)/hoeheM (`forestErtragKurve`, `forestErtragGroesse`).
- **Würfe:** `forestTreeSize` behält seine Würfe, die rng-Folge des Darts bleibt heilig.
- **Stammzahl:** Sie folgt der Selbst-Ausdünnung, die der Wald schon trägt (Matérn III, `forestDachFenster`).
- **Totholz:** Wer heute nicht im Dach steht, vor τ = 7,5 a (`forestVorher`) aber stand, STEHT in `forestStehende` als `baum_totholz` mit s = R(A−τ). Das ist eine Folge des Gesetzes, kein Würfel.
- **τ:** 45 a Zerfall (Buche 30–60 a) × 1/(1+5) aus stehend : liegend = 1 : 5 (Commarmot et al. 2013, Uholka-Inventur, WSL).

Die Leser dieses Gesetzes:

- **Haupt-Faden** `_forestCellDarts` und **Wald-Faden** `waldDarts`: derselbe Ruf. gate:worker-dichte Teil W: 243 und 567 Zellen, 0 abweichend.
- **Ferne:** `forestKronenDeckung` je Art und Phase, Leser `FERN_KRONEN` im voxel-worker (die Art reist mit). Der Kamm liest `forestStehende`.
- **Labor:** `worlds/terrain/phytogenesis.js` ruft den Kern. Der stille Inline-Zwilling fiel, ohne Kern bricht das Labor beim Namen.
- **Gestalt:** Das Totholz steht als Studio-Art `totholz` (studio-bruecke, generische Regel `baum_<preset>`).

Die Linse steht in der bestehenden Familie gate:phyto-core (`scripts/diag-phyto-tree.cjs`, in check:statik, +4 s):

- **Tafel:** je Art hoeheM = foundry PRESETS, r steigt, die Größe liegt in `groesse`.
- **Höhe:** Jeder Dach-Baum trägt byte-genau die Größe seiner Tafel in der Phase seines Flecks.
- **Reineke:** Die Steigung liegt im Band −1,605 ± 10 %, auf zwei geschlossenen Beständen von je 52 ha.
- **Totholz:** Es steht.
- **Mutante „kein Tod“:** Steigung 0,004, ROT an `forestStehende`.

gate:pflanzen-nah H liest die Altbestands-Höhen aus derselben Tafel.

## Gemessen (vorher e1a54023 → nachher, gleiche Bedingungen)

Ort: der Bestand um die Mess-Wiese −280,4/−1045,6. Quelle: die Darts des Wald-Fadens, swiftshader-Welt; Fenster 480 × 480 m (23 ha) bzw. 1 ha.

| Maß | vorher | nachher | Soll / Quelle |
|---|---|---|---|
| Höhen-KS des Dachs ↔ Normalwald der Tafel, 23 ha | 0,293 | **0,051** | ≤ 0,15 (Vorschlag der Station) |
| dasselbe im Kreis 150 m der Station (Kandidat) | 0,293 | **0,142** | ≤ 0,15 |
| Reineke-Steigung log N ↔ log Dq über die Phasen der Flecken, Dach, 23 ha | ohne Bezug (Dq 30–32 cm in jeder Phase) | **−1,454** (D ∝ s) · −1,471 (BHD aus Krone/H/D) | −1,605 ± 10 % = −1,766 … −1,445 (Reineke 1933) |
| dasselbe mit Unterstand | ohne Bezug | −0,85 | (der Unterstand ist eine jüngere Kohorte) |
| Reineke, Linse, geschlossener Bestand Laub / Nadel (52 ha) | — | **−1,658 / −1,720** (r² 0,998) | Band |
| Totholz-Anteil der stehenden Stämme, 23 ha | 0 % | **10,7 %** (471) | Uholka 30 von 465/ha = 6,5 % |
| mittlere Bruchhöhe des Totholz | — | **5,1 m** | Uholka 5,25 m |
| Stämme je ha, 23 ha | 194 | 171 | — |
| Golden-Bäume (gate:asset-contract) | 128/128 | **128/128 byte-gleich** | eingefroren |

Im Spiel gezählt (Werkbank-Welt, Ego 30 m östlich im Bestand bei −182,3/−1026,0, `st.architectures` binnen 30 m — der Haupt-Faden pflanzt, was das Gesetz sagt):

- Bäume 108 → 98, Totholz **0 → 32**.
- Die stehenden Dinge im 23-ha-Fenster (Bäume + Totholz): 4 634 → 4 583 (−1,1 %).

Kosten am Schirm, Bildpaar: **in diesem Container nicht messbar**.

- **Ursache:** WebGPU auf swiftshader stirbt hier beim ersten Gerät (`OperationError: A valid external Instance reference no longer exists`). Das gilt vorher wie nachher gleich, auch im nackten Test ohne Welt, mit Puppeteers Chrome und mit Chromium 1243.
- **Folge:** Die Werkbank-Welt kommt nie zum ersten Weltbild, `zaehlen` und `bild` werfen. Die Logs liegen unter `mischwald-bild/vorher-log.txt` und `mischwald-bild/nachher-log.txt`.
- **Ersatz:** Die GPU-Probe im Kopf (`bild:wiese`, `gate:fernwald`) bringt Bild und Urteil an echter GPU. Tris und Zeichen-Rufe vorher ↔ nachher stehen offen (unten).

Gates nachher, auf main e1a54023 (EXIT explizit):

- 0: gate:phyto-core, gate:constitution, gate:pflanzen-nah, gate:worker-dichte, gate:fernwald, gate:asset-contract.
- Nach dem Merge von main 804ca10c: `npm run check:statik` grün.
  - Schritte 1–47 im ersten Lauf (16:27–16:34). Sein einziges Rot war die WACHSTUMS-WAND: `origin/integ-probe` fehlte dem Klon, `git merge-base`.
  - Nach `git fetch origin integ-probe` liefen die Schritte 48–53 derselben Kette mit EXIT=0 (betriebsgesetz: Prüf +1 623 / Spiel +1 568 Atome, erlaubt 25 568).

## Ehrlich offen (mit Grund und Messnamen)

- **Die Reineke-Steigung entsteht, das Gesetz setzt sie nicht.** Matérn III mit isometrischer Krone (T = Krone·s, D ∝ s) geht gesättigt gegen −2. Die −1,6 liegt in der Teilsättigung: in der Welt −1,454 (Bandkante), auf den Linsen-Beständen −1,66/−1,72. Die Wurzel wäre die Allometrie Krone ∝ D^0,8. Die Gestalt skaliert aber gleichmäßig, die Goldens sind eingefroren. Messname: gate:phyto-core „Bestand …“.
- **Totholz 10,7 % gegen Uholka 6,5 %.** Mein Mosaik trägt alle Phasen gleich (Normalwald); Uholka ist ein Altbestand. Der Anteil entsteht aus τ und der Ausdünnung. Eine Quelle für den Normalwald fehlt.
- **Die Gestalt liest den Tod nur als Art (halb, 1 von 3).** Der Totstamm ist die Studio-Gestalt `totholz` (Bruch 42–68 %, P.totBruch). Er liest nicht die Jahre seit dem Tod: kein Zerfall, kein Ast-Bruch über die Zeit, kein Fall nach Jahren. Liegendes Totholz aus dem Fall fehlt. Die Gestalt `totholz` trägt BHD₁ 0,851 m (gate:pflanzen-nah „Stamm jeder Stufe“) gegen lebend 0,31–0,38 m. Ein Totstamm ist damit 2,2–2,7× dicker als der Baum, der starb (Messname: pflanzen-nah „Stamm jeder Stufe“).
- **Gewählte Größen ohne Quelle:** die Flecken-Kante 40 m (GEWÄHLT). Alle Arten eines Flecks teilen die Phase u, nicht das Alter. Die Spanne der Verjüngung im Fleck fiel mangels Quelle für natürliche Flecken. Die Bonität ist die Klasse, deren Tafel-Ende die Mitte der Natur-Spanne trägt (nordstern §4.5); die Tanne hat hoeheM im Alter 100, Weide und Karst tragen die Form der untersten Klasse.
- **Außerhalb der Tafel:** der Mammut (eigener Wurf, WBR führt Seqg nur unter Fichte). Eine Nadel-AUTO-Art wüchse auf der Buchen-Tafel („sonstige Laubbäume“ → Buche).
- **Unterstand:** Er stirbt unsichtbar (kein Totholz aus `forestSchicht`), Seneszenz ist nicht modelliert.
- **Bildpaar, Tris und Zeichen-Rufe am Messort, vorher ↔ nachher: offen.** swiftshader-WebGPU ist in diesem Container tot (oben). Das Gesetz kostet am Schirm nur Instanzen: Totholz ersetzt Lebende, das Fenster trägt −1,1 % stehende Dinge, binnen 30 m am Hotspot +20 %. An echter GPU ungemessen. Die GPU-Probe im Kopf: `[gpu-probe: bild:wiese, gate:fernwald]`.
- **zug.cjs fehlt:** `artifacts/profiband/werkzeug/zug.cjs` steht in keinem lesbaren Zweig (main, integ-probe, zug-a, zug-b, koordination, punkte-maschine; .gitignore führt darin nur den Messplatz-Blick). PROBE_PFLICHT und `zug.sh probe-tag` liefen darum nicht; die Proben wählte ich nach den Pfaden.
- **Fremde Datei, nicht meine Bahn:** In `stamm/vegetation-wiese.js:3400` spricht ein Kommentar noch von „forestTreeSize Überhälter bis 1,95“ (Nah-Wiese, Bahn eines anderen Arbeiters).

## Quellen (an der Quelle geprüft)

- Reineke 1933, J. Agric. Res. 46: 627–638 (−1,605); die Neubewertung: Pretzsch & Biber, „A re-evaluation of Reineke's rule and stand density index“: https://portal.fis.tum.de/en/publications/a-re-evaluation-of-reinekes-rule-and-stand-density-index/
- WBR 86, Tab. 3 Bestandesmittelhöhen (Niedersachsen): https://www.strassenbau.niedersachsen.de/download/44269/6.2_Anlage_3_Ertragstafeln_-_Bestandesmittelhoehen.pdf
- Commarmot et al. 2013, Inventory of the largest primeval beech forest in Europe (Uholka): https://www.slf.ch/fileadmin/user_upload/WSL/Mitarbeitende/hobi/Inventory_Report_2013.pdf
- Blaschke et al. 2012, LWF aktuell 86 (Totholz): https://lfl.bayern.de/mam/cms04/biodiversitaet/dateien/a86_totholz.pdf
