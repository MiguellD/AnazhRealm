# Der Mensch: Geist, Alltag, Lebenslauf

## Die Vision hier

Jenseits der Gegenwart heißt: jede der Milliarden Personen eines Planeten ist ein ganzer Mensch, kein Statist mit Laufweg — und jede ist es *zufällig angetroffen*, nicht nur die, die ein Autor ausgewählt hat. Sie hat Bedürfnisse, die ihren Tag treiben, ein Werk, das man sie mit den Händen tun sieht und das den Stoff ändert, Absichten, die über Jahre reichen (ein Haus bauen, eine Werkstatt eröffnen, fortziehen), ein Gedächtnis, das Jahrzehnte trägt, und ein Netz aus Eltern, Kindern, Partnern, Freunden und Feinden, das über Generationen weiterläuft. Wer durch die Zeit reist, trifft das Kind von heute fünfzig Jahre später als Großvater an derselben Werkbank, und dessen Enkelin hat sein Kinn und sein Haus geerbt. Wer will, schlüpft in irgendeines dieser Leben und lebt seinen Tag weiter — die Welt hält stand. Und auf fremden Planeten leben Gesellschaften anderer Evolutionen mit anderer Tageslänge, anderer Lebensspanne, anderer Familie. Kein Spiel der Gegenwart hält beides zugleich: die Tiefe eines einzelnen Lebens und die Masse eines Planeten (10^9 Leben über 10^4 Jahre) — hier fällt beides aus EINEM Samen, fern umsonst, nah wahr. Spricht man eine Person an, antwortet sie aus ihrem gelebten Leben, nicht aus einem Dialog-Baum, und was sie sagt, stimmt mit der Welt überein.

**Der Preis P0 (gilt in JEDER Sprosse, zusätzlich zur Spalte „Preis"):** Bild p95 ≤ 33 ms am Standardgerät (Radeon-890M-/GTX-1060-Klasse), Ankunft ≤ 5 s kalt, null Download über das Skript hinaus, und der Spielstand wächst nur mit *berührten* Personen (≤ 1 KB je berührter, 0 Byte je unberührter). Eine Sprosse, die P0 bricht, gilt nicht — auch wenn Umfang und Tiefe stehen.

**Der Prüfer-Satz (für jeden Richter mit „Prüfer"):** ein fester, blinder Satz — 10 Menschen ohne Projektwissen ODER ein eingefrorenes Prüf-Modell, das auf einem Anker-Satz von 200 menschlich gewerteten Fällen ≥ 0,8 Übereinstimmung hält. Der Satz wird nur vom Schöpfer getauscht; ohne ihn sind die Prüfer-Richter offene Fragen, keine Punkte.

## Das Beste der Gegenwart

- **Dwarf Fortress** (Bay 12): erzeugt vor dem Spiel Jahrhunderte Geschichte mit „historischen Figuren", die heiraten, Kinder bekommen, Berufe ausüben und sterben; alles in Legends lesbar ([Wiki: Historical figure](https://dwarffortresswiki.org/index.php/Historical_figure)). Grenze: nur die historischen Figuren tragen Lebenslauf, der Rest wird erst beim Besuch erfunden; kein 3D-Leib, kein Alltag in Echtzeit, die Weltgeneration dauert Minuten.
- **Crusader Kings III** (Paradox 2020): 22 418 Figuren am ersten Tag des Starts 1066, Dynastien, Erbe, Ehe, Charakterzüge, *Lebensziele* über Jahrhunderte ([mein-mmo](https://mein-mmo.de/en/game-on-steam-starts-with-22418-game-characters-but-a-one-legged-one-eyed-drunkard-will-live-longer-than-all-others,1213025)). Grenze: nur der Adel, kein Alltag, keine Straße, die Figuren existieren als Porträt und Datensatz — aber man kann in den Erben schlüpfen (der Perspektivwechsel, den L7 misst).
- **Generative Agents / „Smallville"** (Park et al., Stanford 2023): 25 Agenten mit Erinnerungs-Strom, Reflexion und Tagesplan, zwei simulierte Tage; glaubhafter beurteilt als menschliche Rollenspieler ([Stanford HAI](https://hai.stanford.edu/news/computational-agents-exhibit-believable-humanlike-behavior), [arXiv 2304.03442](https://huggingface.co/papers/2304.03442)). Nachfolger skalieren die Zahl, nicht den Preis: **Project Sid** (Altera 2024, ~1 000 Agenten in Minecraft, arXiv 2411.00114) und **AgentSociety** (2025, > 10 000 Agenten, arXiv 2502.08691) — jede Entscheidung ein Modell-Aufruf, Kosten linear in Personen × Zeit, auf Rechenzentren. Für 10^9 Personen unbezahlbar; das ist die Wand, die der Same umgehen muss.
- **Kingdom Come: Deliverance II** (Warhorse 2025): etwa 2 400 NPCs mit Tagesablauf, KI-LOD (MEISTERKARTE.md:445). **Red Dead Redemption 2**: 1 200 Darsteller, 500 000 Dialogzeilen, Routinen von Hand (MEISTERKARTE.md:446). Grenze: Hand-Inhalt — Fleiß, nicht Same; kein Lebenslauf, keine Generation.
- **Shadows of Doubt** (ColePowered): Hunderte Bürger je Spielstand mit Name, Job, Wohnung, Beziehungen, 4–10 Wegen am Tag, prozedural (MEISTERKARTE.md:447). **The Sims 4**: sieben Lebensphasen, Altern, Vererbung des Aussehens, Lebensziele — aber ein Haushalt im Blick, nicht eine Stadt.
- **Die Wirklichkeit** — Zeitbudget-Erhebungen (American Time Use Survey) kodieren den Alltag in 17 Hauptkategorien mit etwa 400 Einzeltätigkeiten ([BLS ATUS](https://www.bls.gov/tus/tables/a3-2023.htm)); ISCO-08 kennt 436 Berufsgattungen; Sterbetafeln, Heiratsalter, Haushaltsgrößen sind für viele Epochen belegt (historische Demographie); Freundes-Netze zeigen kleine Welt (Pfadlänge ~4–7). Das ist der Maßstab, gegen den Stichproben urteilen.

## Der Same

**Das Leben als Funktion f(Same, Zeit), nie als Simulationsschritt.** Jede Person ist ein Punkt in einem deterministischen Stammbaum: ihr Same leitet sich aus den Samen der Eltern ab (Name, Genom, Charakter, Geburtsjahr), ihr Lebenslauf ist eine Folge von Ereignissen, die aus diesem Samen und dem Zustand der Welt zu jedem Zeitpunkt *abfragbar* ist, ihr Tag ist eine Funktion der Uhr aus Rolle × Bedürfnis × Ort, ihr Werk eine Funktion aus Stoff × Werkzeug × Bedarf, und ihr Gedächtnis ist die Projektion dieser Ereignisse plus der wenigen tatsächlich gespielten Begegnungen. Simuliert wird nur, was der Spieler berührt; alles andere wird bei Bedarf *ausgewertet*.

Fremde Branchen haben das gelöst: die **Mikrosimulation der Demographie** schreibt Millionen synthetische Lebensläufe aus Übergangswahrscheinlichkeiten; die **Populationsgenetik** (Koaleszenz) rechnet Stammbäume nur für die beobachteten Individuen — „fern umsonst, nah wahr"; die **Kryptographie** (abgeleitete Schlüssel, Hash-Bäume) zeigt, wie aus EINEM Wurzel-Samen jeder Zweig ohne Speicher reproduzierbar ist. Der Same misst sich daran, dass **die Zahl der unterscheidbaren Leben, Berufe und Geschichten mit den Saaten wächst, während das Skript nicht wächst** — Bytes je neuer Beruf, je neuer Kultur des Tags gegen null. Das ist der Gegen-Richter zu jedem Fleiß-Punkt.

## Die Leitern

Gemeinsam für alle Sprossen: P0 gilt (s. o.); „Umfang" heißt die Bevölkerung, aus der die Stichprobe *zufällig* gezogen wird — nicht die Zahl im Bild (die misst das Blatt „Millionen").

### L1 Bedürfnis und Tag — lebt eine zufällig angetroffene Person einen Tag, der statistisch wie ein echter Tag aussieht

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | 1 Siedlung, ~10^2 | 6 Akte, feste Uhrzeiten ±0,5 h, Ortswahl nach 5 statischen Bedürfnissen (Werk, Markt, Mahl, Treff, Besuch) | P0 | Zeitraffer 24 h: Anteil Soll-Orte getroffen ≥ 0,9; Bild Schmiede 10 Uhr besetzt / 2 Uhr leer | HEUTE |
| 1 | 10^3, 1 Stadt | ≥ 12 Akte, Wochentag ≠ Feiertag, Kind/Alter anders als Erwachsene | P0 | Zeitraffer 7 Tage: Verteilung der Akte je Stunde gegen ATUS-Profil, Abweichung ≤ 20 % je Hauptkategorie | |
| 2 | 10^4 | Bedürfnisse als *Pegel* (Hunger, Schlaf, Geselligkeit, Pflicht) lassen den Tag vom Plan abweichen; 17 Hauptkategorien | P0 | 100 zufällig gefolgte Personen: Anteil plausibler Tage (Prüfer-Satz) ≥ 0,9; Abweichung vom Vortag bei ≥ 0,3 der Personen, jede vom Prüfer begründbar | |
| 3 | 10^5, Großstadt | ~100 Tätigkeiten, Haushalt teilt Pflichten | P0 | Bildpaar Straße 7:45 Uhr gegen Foto einer Berufsverkehrs-Szene (Prüfer wählt das Spielbild nicht zuverlässiger als 0,65 heraus); Haushalts-Stichprobe: Pflichten-Verteilung ≤ 15 % gegen Statistik | |
| 4 | 10^6 | ~400 Tätigkeiten (ATUS-Tiefe), Lebensphase und Kultur färben den Tag | P0 | 1 000 zufällige Saaten × Personen: Anteil plausibler Tage ≥ 0,95; Zeitbudget je Kategorie ≤ 10 % gegen Statistik der Epoche | |
| 5 | 10^7, Metropole jenseits Tokio | Schichtarbeit, Nachtleben, Pendeln über 50 km, Saison | P0; Kosten an Schirm, nicht an 10^7 | Wiederkehr nach 1 h Abwesenheit: Person am erwarteten Ort ±2 m in ≥ 0,99 von 10^4 Stichproben; Nachtbild gegen Foto: Fenster-Belegung je Uhrzeit ≤ 15 % | |
| 6 | 10^9, Planet × Epochen | Tag je Epoche und Kultur (Bauer 1300, Arbeiter 1900, Büro 2020, Nomaden, Fischer) | P0 | Zeitreise 5 Epochen × 5 Kulturen: Zeitbudget je Kategorie ≤ 10 % gegen historische Quellen; Plausibel-Anteil ≥ 0,95 | |
| 7 | 10^9+ je Welt, fremde Planeten | Tag einer anderen Evolution: Tageslänge, Schlafbedarf, Klima, Sinne geben einen anderen Rhythmus | P0 | N = 100 zufällige Welten: Tag-Rhythmus folgt der Tageslänge des Planeten (Korrelation ≥ 0,9); Prüfer-Satz nennt ≥ 0,9 der Tage „in sich stimmig"; Skript-Bytes je neuer Welt = 0 | |

### L2 Werk aus Stoff — sieht man eine zufällig angetroffene Person ihr Werk tun, und ändert es die Welt

Misst die Kraft, Arbeit aus Stoff × Werkzeug × Bedarf zu erzeugen — nicht eine Liste gebauter Berufe. Umfang = Zahl der unterscheidbaren Berufe, die in N Saaten *auftauchen*.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | 8 Rollen am Werk (Schmiede, Gasthaus, Kirche, Fahrer, Nachtfahrer, Wache, Nachtwache, Feld) | steht zur Werkzeit am Werk, eine Haltung je Akt | P0 | Zählung: Rollen mit besetztem Werk zur Werkzeit | HEUTE |
| 1 | 10 Berufe | Handbewegung mit Werkzeug | P0 | Bildpaar je Beruf ohne Beschriftung: Prüfer-Satz benennt den Beruf ≥ 0,8 | |
| 2 | 30 | die Arbeit ändert Stoff (Eisen glüht, Brot im Ofen, Feld gepflügt) | P0 | Vorher/Nachher-Bild nach 2 Spielstunden: Werkstück sichtbar verändert in ≥ 0,9 der Berufe | |
| 3 | 10^2 | Ketten (Bauer → Müller → Bäcker), das Werkstück wandert; Lehrling neben Meister | P0 | Ware einer Kette am nächsten Glied wiedergefunden ≥ 0,9; Benennungs-Quote ≥ 0,8 | |
| 4 | ~436 (ISCO-Tiefe) einer Epoche | Können wächst mit Jahren | P0 | 100 zufällige Werktätige: Benennungs-Quote ≥ 0,8; Werkstück je Stunde Meister ÷ Lehrling ≥ 1,5, sichtbar am Stapel | |
| 5 | 10^3 über Epochen | Berufe entstehen und verschwinden mit Technik (Köhler, Telegrafist, Programmiererin) | P0 | Zeitreise 5 Epochen, 1 000 Stichproben: anachronistische Berufe ≤ 0,01; ≥ 0,2 der benannten Berufe stehen in keiner Liste des Codes (sie fielen aus Stoff × Technik) | |
| 6 | 10^4+ über Planeten × Kulturen × fremde Evolutionen | Berufe fremder Gesellschaften folgen deren Stoff, Technik, Leib | P0; Skript-Bytes je neuer Beruf → 0 | N zufällige Welten: Anteil Berufe, die zu Stoff, Technik und Klima ihres Orts passen ≥ 0,95 (Prüfer-Satz); Zahl unterscheidbarer Berufe wächst mit N ohne Skript-Wachstum | |

### L3 Gedächtnis und Gespräch — erinnert und spricht eine zufällig angesprochene Person wahr

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | Bewohner ohne Wort; Kreaturen ≤ 30 Erinnerungen an den Spieler, die 8 bedeutsamsten im Gespräch | Kopf-Zuwendung, Ausweichen, Furcht-Abstand | P0 | Begegnungs-Probe 3 m: Zuwendung ≤ 0,5 s, Berührung 0, Abstand nach Gewalt > ohne | HEUTE |
| 1 | 10 Personen sprechen | Antwort zitiert ≥ 2 wahre Fakten ihres Lebens (Rolle, Haus, Stunde) | P0; Antwort ≤ 3 s | Faktentreue gegen die Welt ≥ 0,95; Bezug auf vorige Begegnung ja/nein | |
| 2 | jede Person im Blick | erinnert jede Begegnung mit dem Spieler über Sitzungen | P0; ≤ 3 s | Rückkehr in neuer Sitzung: Anteil, der die letzte Begegnung korrekt nennt ≥ 0,95 | |
| 3 | 10^4 | Erinnerung der Lebensereignisse (Lehre, Heirat, Verlust) | P0; ≤ 3 s | 100 zufällige Personen befragt: widerspruchsfrei zu dem, was der Spieler in der Welt nachprüfen kann (Grab, Haus, Verwandte) ≥ 0,95; Erfindungs-Quote ≤ 0,02 | |
| 4 | 10^5 | Gerücht und Wissen wandern (eine Tat des Spielers spricht sich herum, verfälscht mit Abstand) | P0; fern 0 ms | Tat am Markt → Anteil Befragter in 1 km, die sie nach 1 Spieltag kennen, im Band einer Diffusions-Erwartung; Verfälschung steigt messbar mit Abstand | |
| 5 | 10^6 | Charakter und Stimmung färben die Rede; jede Person anders | P0; ≤ 3 s | Blindtest: Prüfer-Satz unterscheidet 2 Personen gleicher Rolle an ihren Antworten ≥ 0,9; Glaubhaftigkeit ≥ menschlicher Rollenspieler (Smallville-Maß) | |
| 6 | 10^9, jede befragbar, über Epochen | Jahrzehnte, Geschichten der Großeltern, Sprache der Epoche | P0; ≤ 3 s, kein Modell-Download, Kosten je Satz am Gerät | Zeitreise: Person 1300 und 2020 befragt — anachronistische Fakten ≤ 0,01, Faktentreue ≥ 0,95 über 1 000 Stichproben | |

### L4 Netz — Freundschaft, Feindschaft, Ruf: steht eine zufällige Person in einem wahren sozialen Netz

Synchron, die Gesellschaft *jetzt*. Die Abstammung (diachron) misst L5.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | Haus mit n Bewohnern ohne Bindung | — | — | — | unter der Leiter |
| 1 | 10^2 | Haushalt als Familie; Besuch folgt dem Netz | P0 | Besuche: Anteil zu Verwandten/Freunden ≥ 0,6 (Zufall: Anteil der Bekannten an allen) | |
| 2 | 10^3 | Freundschaft, Feindschaft, Rivalität, Liebe — sichtbar an Gruß, Meiden, Streit | P0 | Bild Markt: Prüfer-Satz sagt aus Gesten allein Freund/Feind/fremd voraus ≥ 0,7 (Zufall 0,33) | |
| 3 | 10^4 | Ruf: Taten (auch des Spielers) ändern, wie das Netz jemanden behandelt | P0 | nach Tat: Anteil Bekannter des Opfers, die den Täter meiden, > Anteil Fremder (Unterschied ≥ 0,3) | |
| 4 | 10^6 | Netz-Statistik einer echten Gesellschaft | P0; fern 0 ms | 1 000 Paare, vom Spieler per Frage „kennst du jemanden, der X kennt?" durchwandert: Pfadlänge ~4–7; Antwort bei Wiederholung gleich | |
| 5 | 10^9, Planet × Kulturen | Clan, Stamm, Zunft, Heiratsregeln je Kultur | P0 | N Saaten × 5 Kulturen: Heiratsregeln (Endogamie, Mitgift, Wohnfolge) im Anteil ≥ 0,9 konsistent zur Kultur-Perspektive | |

### L5 Abstammung, Lebenslauf, Generationen — altert, erbt und stirbt eine Bevölkerung wahr, und findet die Zeitreise dieselben Familien

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | Alter als fester Regler des Genoms, nah 8 Gestalten je Siedlung | Alter färbt den Leib, ändert sich nie; keine Eltern | — | — | unter der Leiter |
| 1 | 10^2 | Bevölkerungspyramide nach Epoche; Kinder sehen den Eltern ähnlich | P0 | Zensus gegen Sterbetafel ≤ 15 %; Bildpaar Familie vor dem Haus: Prüfer-Satz ordnet Kinder den Eltern zu ≥ 0,7 (Zufall 1/n) | |
| 2 | 10^3 | Lebensphasen ändern Tag und Leib (Kind spielt, Alter geht langsamer) | P0 | Ganggeschwindigkeit je Altersgruppe gegen Messdaten ≤ 15 %; Kinder-Tag ≠ Erwachsenen-Tag (L1) | |
| 3 | 10^4 | Zeitsprung 10 Jahre: dieselbe Person ist gealtert, hat geheiratet oder ist gestorben; Hochzeit, Begräbnis als Ereignis | P0; Sprung ≤ 5 s | Prüfer-Satz erkennt dieselbe Person nach 10 Jahren ≥ 0,9 (Fremde: ≤ 0,1); Heiraten und Sterbefälle je 1 000 im Band der Epoche | |
| 4 | 10^5 | Erbe: Haus, Werkstatt, Beruf, Name gehen an Kinder | P0; Sprung ≤ 5 s | Sprung 50 Jahre: Anteil Häuser mit Nachfahren der früheren Bewohner im Band der Epoche; Beruf des Vaters → Kind ≥ Erwartung | |
| 5 | 10^7 | Migration verschiebt Familien über Städte; Ahnen über 30 Generationen erfragbar | P0 | beliebige Person: Ahnenreihe 30 Generationen erfragt, zweite Frage (auch nach Neustart) liefert dieselbe; Ahnen-Kollaps im Band der Populationsgenetik | |
| 6 | 10^9 über 10^4 Jahre | Zeitreise durch die Menschenzeit trifft lebendige Ahnenketten | P0; Sprung ≤ 5 s | 1 000 Sprünge an zufällige Jahre: plausible Pyramiden ≥ 0,95; die Enkelin des getroffenen Kindes ist auffindbar und ähnelt ihm (Prüfer-Satz ≥ 0,7) | |
| 7 | fremde Evolutionen | andere Lebensspanne, Fortpflanzung, Familienform (Brut, Kaste, Teilung) | P0 | N zufällige Welten: Pyramide folgt der Lebensspanne der Art; Prüfer-Satz nennt ≥ 0,9 der Familienformen „in sich stimmig"; Skript-Bytes je neuer Form = 0 | |

### L6 Absicht und Charakter — verfolgt eine zufällige Person eigene Ziele über Jahre (neu)

Was den Menschen vom Uhrwerk trennt: der Tag (L1) ist Pflicht; hier wird gemessen, ob Personen *wollen* und ob daraus Geschichten fallen, die niemand geschrieben hat.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | — | keine Ziele, keine Charakterzüge, die das Handeln ändern | — | — | unter der Leiter |
| 1 | 10^2 | Charakterzüge (fleißig, gesellig, ängstlich) ändern den Tag sichtbar | P0 | Prüfer-Satz ordnet 20 Personen nach 1 Spieltag Beobachtung ihrem Zug zu ≥ 0,6 (Zufall 1/k) | |
| 2 | 10^3 | Ziele über Monate (sparen, werben, ein Werk lernen), sichtbar im Fortschritt | P0 | 100 zufällige Personen nach Ziel befragt, 1 Spieljahr später nachgeprüft: Fortschritt in der Welt sichtbar bei ≥ 0,5 | |
| 3 | 10^4 | Ziele über Jahre ändern die Welt: Haus gebaut, Werkstatt eröffnet, fortgezogen | P0; Sprung ≤ 5 s | Zeitsprung 10 Jahre: Anteil erklärter Ziele, die als Bau/Umzug/Werkstatt in der Welt stehen, im Band einer Erwartung ≥ 0,3; jede Änderung auf eine Person rückführbar | |
| 4 | 10^6 | Ziele kreuzen sich (Rivalen um ein Haus, Allianz, Verrat) | P0 | 100 zufällige Saaten: Prüfer-Satz nennt ≥ 0,5 der aus Chronik und Befragung gezogenen Geschichten „erzählenswert und folgerichtig" | |
| 5 | 10^9, Epochen | Lebensentwürfe je Epoche und Kultur | P0 | Zeitreise 5 Epochen: anachronistische Ziele ≤ 0,01; Verteilung der Lebensentwürfe im Band historischer Quellen | |

### L7 Jedes Leben spielbar — kann der Spieler in eine zufällige Person schlüpfen und ihr Leben weiterführen (neu)

„Jede erdenkliche Perspektive" heißt auch: die Perspektive jedes Menschen. Misst, ob die Welt hält, wenn der Spieler die Seite wechselt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | der eine Spieler-Leib | Bewohner sind nicht betretbar | — | — | unter der Leiter |
| 1 | jede Person im Blick | übernehmen: Leib, Ort, Gang bleiben; Bild springt nicht | P0; Wechsel ≤ 1 s | 100 Wechsel: Bild-Sprung (Pixel-Differenz vor/nach außer Kamera) ≤ Schwelle, Leib identisch | |
| 2 | 10^4 | die übernommene Person kennt man: Haus, Werk, Leute erkennen sie als sich | P0 | Nachbarn grüßen sie mit ihrem Namen ≥ 0,9; ihr Werk ist ihres (Werkstatt öffnet) | |
| 3 | 10^6 | loslassen: die Person lebt ihren Tag weiter mit dem, was der Spieler getan hat | P0 | nach 1 Spieltag gespielt + loslassen: die Person erinnert es (L3) und ihr Tag folgt den neuen Umständen ≥ 0,9 | |
| 4 | 10^9, Epochen, fremde Welten | jede Person jeder Epoche und Welt betretbar, auch andere Evolutionen | P0; Wechsel ≤ 5 s über Welten | 1 000 zufällige Wechsel quer durch Zeit und Welten: Erfolgsquote ≥ 0,99, P0 gehalten | |

### L8 Kopplung — wie stark ändert die Welt die Leben, und die Leben die Welt

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | Tat des Spielers in der Nähe | Gewalt → Furcht → größerer Abstand | P0 | Abstand nach Gewalt > ohne (gemessen 1,95 vs 1,34 m) | HEUTE |
| 1 | 1 Siedlung | Wetter ändert den Tag (Regen → drinnen) | P0 | Bildpaar Markt Sonne/Regen: Anteil draußen sinkt ≥ 0,3 | |
| 2 | 10^3 | Missernte, Brand → Not, Umzug, Trauer | P0 | nach Ereignis: Befragte, die es erinnern ≥ 0,8; Tag der Betroffenen geändert | |
| 3 | 10^5 | Leben formen die Welt: Familien bauen an, Wege werden Straßen, Häuser verfallen nach Auszug | P0 | Zeitsprung 20 Jahre: Bauten folgen Familiengröße (Korrelation ≥ 0,5); verlassene Häuser verfallen sichtbar, bewohnte nicht | |
| 4 | 10^7 | Vulkan, Seuche, Krieg verschieben Generationen und Erinnerung | P0; Sprung ≤ 5 s | Ausbruch: Flucht-Strom, Gedenken nach 50 Jahren, Pyramide mit Delle der Kohorte — alle drei messbar | |
| 5 | Planet, Äonen | Geschichte als Summe von Leben: Dynastien, Bewegungen, Erfindungen aus Personen | P0 | N Saaten: historische Wendepunkte, die auf benennbare Personen zurückgehen ≥ 0,8; zwei Saaten mit gleichem Planeten, anderen Personen → andere Geschichte | |

## Stand heute

- **Tag als Funktion der Uhr:** `koerper-core.js:5057` `tagesPlan(same, rolle, stunde, orte)` liefert sechs Akte (schlaf · morgen · besuch · arbeit · mittag · abend); `TAGES_GESETZ` `koerper-core.js:4919` (wach 6,5 · Werk 8–17 · Ruhe 22, Streuung ±0,5 h) mit acht Rollen-Abweichungen `koerper-core.js:4928–4943` (Schmiede, Kirche, Gasthaus, Fahrer, Nachtfahrer, Wächter, Nachtwächter; die Fassung vor der Gegenlese nannte sechs). Bedürfnisse gibt es als *statische* Ortswahl: `tagesBindung` `koerper-core.js:5016` wählt je Bedürfnis (arbeit · markt · mahl · treff · besuch) einen Ort nach Angebot `:4947` und Wegmaß `:4965` über die Ziel-Kette des tetrapoda-Kerns — kein Pegel, kein Hunger, der den Tag verschiebt. Haltung je Akt `:4972`. Gemessen (alte Karte Menschen K2): Soll-Orte 81/81 ≥ 0,9, Wiederkehr nach 1 h max 1,2 m an GTX.
- **Bevölkerung und Leib:** `stamm/siedlung-bewohner.js:218–224` — je Haus `leuteVon` Personen. Nah tragen sie **8 Gestalten je Siedlung** (`BEWOHNER.gestalten = 8`, `siedlung-bewohner.js:3484`; Alter aus dem Genom der Gestalt, `:253–259`), fern ist jeder sein eigener Punkt im Leib-Raum (`:239`). Folge: Familienähnlichkeit (L5·1) ist nah heute *unmöglich*, nicht nur unbebaut — zwei Nachbarn teilen eine Gestalt.
- **Berufe:** Rollen im Fachwerk-Plan (`fachwerk-core.js:3672–3704`); „Arbeit" heißt am Werk stehen mit der Haltung `pwalk`, kein Werkstück ändert sich.
- **Gedächtnis:** nur Kreaturen gegenüber dem Spieler — Kappe 30, Abruf der 8 bedeutsamsten nach Gewicht + Frische, Antwort per Schema an eine Erinnerung gezwungen (`stamm/feld-nexus.js:1281–1312`, belegt). Das gemessene Modell war ein lokales `qwen3:4b-instruct` (Kommentar `:1285`) — Gigabytes, also gegen P0. Bewohner: Begegnung ohne Modell gemessen (Zuwendung 0,267 s, Berührung 0, Abstand 1,95 vs 1,34 m; MEISTERKARTE.md:455).
- **Verwandtschaft, Ehe, Geburt, Erbe, Altern, Tod, Ziele von Menschen, Perspektivwechsel:** nichts (Grep verwandt/eltern/heirat/lebenslauf/vererb in `stamm/` und Kernen: kein Menschen-Code; „Stammbaum" trifft nur die Werkstatt-Bibliothek). **Aber:** Bauten altern bereits mit Zeit und Nässe (`stamm/siedlung-satz.js:858–860` `_werkAlter`) — ein Ansatz für L8·3, noch ohne Kopplung an Bewohner.
- **Umfang:** Test-Stadt 35 Häuser, 118 Bewohner (14.11.).

**Einordnung:** HEUTE stehen L1·0, L2·0, L3·0, L8·0 — je die unterste Sprosse; L4–L7 stehen unter der Leiter. Von 54 Sprossen 4.

## Abhängigkeiten

- **Der Mensch: Leib, Gesicht, Kleidung** — L5·1 braucht nah ein Genom je Person (nicht 8 Gestalten) und Vererbung; L5·3 ein alterndes Gesicht.
- **Millionen: Bevölkerung, Masse und Strom** — dieses Blatt misst die Tiefe der zufällig angetroffenen Person, jenes die Menge im Bild.
- **Siedlung und Stadt** · **Architektur und Innenräume** — Haushalt braucht Wohnungen; Erbe (L5·4) Häuser als Besitz; L6·3 Bauten aus Absicht.
- **Arbeit, Technik und Handel** — L2 teilt den Berufs-Raum; dort Ware und Ökonomie, hier Handlung und Können.
- **Kultur, Sprache, Glaube** · **Macht, Recht, Konflikt** — Heiratsregeln, Ruf, Sprache der Rede (L3·6, L4·5).
- **Menschenzeit** · **Tiefe Zeit** · **Fremde Welten und Evolution** — Zeitbudgets, Sterbetafeln, Berufe je Epoche; Tag und Familie anderer Arten (L1·7, L5·7).
- **Erschaffen mit der KI** — das Gesprächsmodell; „null Download" eines Sprachmodells.
- **Spieler-Perspektive / Kamera** — L7 teilt den Leib-Wechsel.
- **Kopplung, Kaskade, Katastrophe** · **Spur und Verfall** — L8 ist die Person-Seite.
- **Sport, Spiel, Bewegungskönnen** — Freizeit-Akte (L1·2 ff.).
- **Ankunft, Geräte** — jeder Zeitsprung ≤ 5 s.

## Was die alte Karte hier misst

Bereich 9 „Menschen und Bewohner" (MEISTERKARTE.md:438–462, 8/10) und KI K3:
- **K1 Besiedlung und Skala** → Umfang-Spalte von L1·0/·1 (die Masse im Bild gehört zu „Millionen").
- **K2 Tagesablauf: Rolle × Uhr × Ort** → L1·0 (HEUTE).
- **K3 Wege und Raum** → Voraussetzung für L1, gehört zu Netze/Verkehr.
- **K4 Körper, Vielfalt, Kosten von 50** → Leib-Blatt; hier P0.
- **K5 Begegnung, Gespräch, Gedächtnis** → L3·0 (HEUTE) und L3·1.
- **KI K3 / Hebel H2** (MEISTERKARTE.md:760, `stamm/feld-nexus.js:1116`) → L3·1/·2.
Die alte Karte gab hier 8 von 10; die neue gibt 4 von 54. Nicht die Arbeit wurde kleiner, der Maßstab wurde der der Vision.

## Zweifel

- **Gespräch und P0:** L3·5/·6 setzen ein Sprachmodell voraus; ein entferntes Modell bricht „null Download" nicht, aber Preis und Offline-Treue; ein lokales kostet Gigabytes (heute gemessen mit qwen3:4b). Ob Rede für 10^9 Personen aus Grammatik + Lebens-Graph erzeugbar ist, ist offen — L3·6 kann am Preis scheitern.
- **Prüfer-Satz:** viele Richter brauchen ein Urteil. Ohne festen, blinden Satz bleibt R6 verletzt; ein Modell-Prüfer kann das Modell, das spricht, schonen.
- **Statistik als Wahrheit:** für fremde Welten (L1·7, L2·6, L5·7) gibt es keine Referenz — dort misst nur Stimmigkeit, nicht Wahrheit.
- **Lazy Abstammung gegen Kopplung:** ein nur bei Bedarf ausgewerteter Stammbaum und Leben, die die Welt formen (L6·3, L8·3), widersprechen sich teilweise — wer gebaut hat, muss vorwärts existiert haben. Die tiefste offene Frage dieses Blatts.
- Die Schwellen (0,9 / 15 % / 0,7) sind gesetzt, nicht hergeleitet.

## Gegenlese — was sich änderte und was strittig bleibt

- **Gehoben:** L1 und L5 tragen je eine 7. Sprosse für fremde Evolutionen (andere Tageslänge, Lebensspanne, Familienform); L2·6 und L1·7 tragen die Same-Probe „Skript-Bytes je neuer Form → 0" — die Vision verlangt Planeten, nicht nur die Erde.
- **Fleiß → Fähigkeit:** L2 zählt nicht mehr gebaute Berufe, sondern Berufe, die aus Stoff × Technik *auftauchen* (L2·5: ≥ 0,2 der benannten stehen in keiner Liste des Codes).
- **Richter auf Ergebnis:** „Ahnenreihe lazy erzeugt, bit-gleich" und „Verwandtschafts-Grad abfragbar ≤ 1 ms" schrieben Bauweise bzw. eine innere Schnittstelle vor — jetzt fragt der Spieler und prüft die Wiederholung; Bildvergleiche nennen eine Unterscheidbarkeits-Quote.
- **Preis:** P0 (33 ms · 5 s · 0 Download · Spielstand nur je berührter Person) gilt in jeder Sprosse; zuvor trugen viele nur „≤ 33 ms" oder gar nur die Antwortzeit.
- **Zusammengelegt:** der Stammbaum stand in L4·6 und L5·6 doppelt, die Kohorten-Delle in L5·5 und L6·4 — L4 misst jetzt das synchrone Netz (Freund, Feind, Ruf), L5 die ganze Abstammung, die Delle nur L8·4.
- **Neu:** L6 Absicht und Charakter (Ziele über Jahre, Geschichten ohne Autor) und L7 Jedes Leben spielbar (in jede Person schlüpfen) — beide fehlten.
- **Stand berichtigt:** acht statt sechs Rollen; Bedürfnisse existieren als statische Ortswahl; nah nur 8 Gestalten je Siedlung — Familienähnlichkeit ist heute strukturell gesperrt; Bauten altern schon (`_werkAlter`).
- **Strittig:** ob L7 in dieses Blatt oder ins Spieler-/Kamera-Blatt gehört; ob ein Prüfer-Modell als Richter je zulässig ist; ob L3·6 unter P0 überhaupt erreichbar ist.
