# Zensus Person — jede Größe, aus der heute ein Bewohner entsteht und sich bewegt

Stand: main b7ed8419 (V18.546.339), gelesen am 18.11.2026. Gelesen in vier parallelen Lesern (Herkunft+Zahl, Gestalt, Tag, Bewegung), jede Zeile mit datei:zeile;
Stichproben an der Quelle nachgeprüft (KL:40-43, KC:5326, T:1615-1635, KC:5533-5545, KC:503-512, FC:9526-9538, SB:3934-3975).
Maschinenlesbar: `zensus.json` (dieselben Zeilen; dieses Blatt ist aus ihr erzeugt). Kürzel: KC = `koerper-core.js` · T = `tetrapoda-core.js` · FC = `fachwerk-core.js` · KL = `stamm/koerper-leib.js` · SB = `stamm/siedlung-bewohner.js` · SV = `stamm/siedlung-verkehr.js` · SO = `stamm/siedlung-ort.js` · SG = `stamm/stoff-gang.js` · KV = `stamm/kreatur-verhalten.js` · KLB = `stamm/kreatur-leben.js` · KF = `stamm/koerper-fahrt.js` · KB = `stamm/koerper-bewegung.js` · D = `stamm/daten.js` · H = `stamm/bild-himmel.js` · DT = `stamm/dirigent-takt.js` · BT = `stamm/bau-teile.js` · HH = `spec/profiband/haushalt.json`.

Herkunft: **samen** (folgt aus dem Samen) · **physik** (folgt aus Physik oder Messung) · **abgeleitet** · **gesetzt** (Konstante) ·
**gesetzt-literatur** (Konstante mit Literatur-Anker) · **fehlt** · **tot** (ohne Welt-Leser).

## Die Zahlen

| Zählung | Wert |
|---|---|
| Größen gesamt | 119 |
| folgt aus Samen oder Physik | 34 (samen 19, physik 15) |
| gesetzt | 68 (davon mit Literatur-Anker 4) |
| abgeleitet · fehlt · tot | 8 · 7 · 2 |
| Bewegungs-Systeme, die eine Lage bewegen | 12 (11 lebend, 1 tot) |
| Pose-Quellen | 9 |
| Ziel- und Tages-Systeme | 6, auf 3 Zeitbasen |
| Stellen, an denen ein Mensch entsteht | 9 |
| Zwillinge (Spieler-Leib ↔ Bewohner-Leib ↔ Tier-Leib) | 10 |
| Größen ohne Welt-Leser | 13 |
| Bytes je Kopf ohne Hülle | ≈ 4 744 (gemessen als Proxy, `spike/zensus-kopf.cjs`: Objekt 4 376 + Ton-Zeile 208 + Satz 160) |
| gleichzeitig lebend, gezählt | Start-Dorf 77 · Metropole 1 083 / 1 092 · stadt-voll 1 094; Deckel ≈ 4 000 weltweit (Ton-Tafel) |

## 1. Herkunft — woraus ein Bewohner entsteht

15 Größen: gesetzt 9 · tot 1 · samen 3 · abgeleitet 1 · fehlt 1.

| id | Größe | Einheit | Wert | Quelle | LESER | Herkunft |
|---|---|---|---|---|---|---|
| h1 | Meldung einer Siedlung | - | jede Siedlung über _dorfErlebnis; ohne key keine Meldung | SO:625 → SB:275-279 | SB:1587 | gesetzt |
| h2 | Start der Liste | m | Spieler ≤ nearM 260 vom Ursprung und jede Hülle in Sicht steht | SO:3611, SB:956-969 | SB:1597-1602 | gesetzt |
| h3 | Köpfe je Haus leuteVon | Köpfe | round(W·D·Geschosse·0,7/(20+20·wohl)), [1,12] | FC:9526-9537 | SB:839, SB:779 | gesetzt |
| h4 | Köpfe je Rolle | Köpfe | scheune/halle/kapelle/speicher/zeughaus 0 · kirche 1 · schmiede/backhaus/torhaus 2 | FC:9526 | FC:9530 | gesetzt |
| h5 | Haushalt hp.leute | Köpfe | nur der Studio-Regler schreibt ihn; alle bauRezept im Spiel haushalt=null | FC:9531, FC:2274, worlds/fachwerk/fachwerk.js:629, FC:4381-4473 | FC:9531 (im Spiel nie gespeist) | tot |
| h6 | Same je Kopf | String | plan.seed:si:k, FNV-1a, Namensraum bewohner | SB:848, BT:1479-1489 | SB:849, SB:890 | samen |
| h7 | Genom | Achsen | 18 + 4 Bau, _rollHumanoidGenome(b.seed) | KL:10-73 | SB:398 (nur Wahl der Gestalt) | samen |
| h8 | Gestalten je Siedlung | Stk | 8, Same plan.seed:gi, Geschlecht im Wechsel | SB:3934, SB:302-304 | SB:302, SB:400-403 | gesetzt |
| h9 | Rolle | Wort | sl.rolle des Hauses, sonst wohnhaus | SB:841 | SB:822, KC:5135 | samen |
| h10 | Beruf | Wort | hof \| markt \| Art des Werk-Orts | SB:874-875 | SB:922 | abgeleitet |
| h11 | Händler | Kopf je Stand | 1, umgewidmeter Bewohner | SB:916-943 | KC:5148 | gesetzt |
| h12 | Fahrer | Köpfe je Wagen | 2 (Person 0 Tag, Person 1 Nacht) | SV:345-366, SV:387, SV:431 | KC:5153-5160 | gesetzt |
| h13 | Wagen je Stadt | Stk | ceil(Häuser/15), nur Städte | FC:4865, FC:4868 | SV:33, SV:359 | gesetzt |
| h14 | Name · Eltern · Kinder | - | kein Feld im Literal | SB:887-899 | - | fehlt |
| h15 | Tracht | Schnitt | plan.kleidung, 9 Epochen-Trachten | SB:297, FC:3623-3631 | SB:363-367 | gesetzt |

## 2. Gestalt — der Leib

27 Größen: gesetzt 9 · samen 14 · gesetzt-literatur 2 · physik 2.

| id | Größe | Einheit | Wert | Quelle | LESER | Herkunft |
|---|---|---|---|---|---|---|
| g1 | height-Dial | Faktor | 0,85–1,15, Default 1 | KC:89-98, KC:77 | KC:2157, KC:2179, KC:5450 | gesetzt |
| g2 | Körperhöhe Spieler | m | 8·0,2125·h = 1,70·h (1,45–1,96) | KC:5077, KC:5433 | KL:153, KL:3510 | gesetzt |
| g3 | Körperhöhe Bewohner kh | m je Kopf-Einheit | 0,215·(1+0,08·(a+b−1)) → 1,58–1,86 m, kein Geschlechts-Term | KL:40-43 | SB:406 → SB:1020, SB:430, SB:1496 | samen |
| g4 | mass (Fett) | 0–1, nicht kg | Default 0,35; Bewohner = Genom-Achse build | KC:99-108, KL:37 | KC:2165 → KC:1308 → FC:9440, KC:3630 | samen |
| g5 | tone | 0–1 | Default 0,5; muscle = 0,65·Achse + 0,35·build | KC:109-118, KL:38 | KC:2158, KC:3631 | samen |
| g6 | age | 0–1 (18–80 J nur Text) | Default 0,15; Bewohner 0,05–0,5, nur je Gestalt | KC:119-128, KL:55 | KC:2158, KC:2165, KC:2167, KC:2185, KC:2205 | samen |
| g7 | gender | 0–1 | gerade Gestalt 0,75–1, ungerade 0–0,25 | KC:129-138, SB:304 | KC:2159-2167, KC:2187, KC:3637, KC:3646 | samen |
| g8 | Haar Länge / Fülle | Faktor | 0,7–1,4 / 0,8–1,3 | KC:139-158, KL:53-54 | KC:397-399, KC:1497 | samen |
| g9 | arms | 0–1 | 0 | KC:159-168 | KC:2182 | gesetzt |
| g10 | kopf headRatio | Kopf-Skala | 0,92–1,16; Spieler und Studio 1 | KL:39, KC:1564-1568 | KC:1570 → KC:2414 | samen |
| g11 | Bau-Achsen Bein/Arm/Schulter/Hals | σ, Kappe ±2,5 | Bein 2,6 %/σ, Arm 2,7 %/σ, Schulter 4,8 %/σ, Hals 0,005 H/σ (QUELLE UNGEPRÜFT KC:1590) | KC:1599-1608, KL:69-72 | KC:2064-2087, SB:1071, SB:1146, SB:429 | samen |
| g12 | Gesicht auge/mund/braue/haaransatz | Faktor | [0,98–1,08] · [0,97–1,06] · ±0,012 · [−0,012–0,008] | KC:4992-4997, KL:58-61 | KC:5004, KC:1499 | samen |
| g13 | Kanon der Gelenke | Anteil von H | Kopf 0,130 · Hüfte 0,530 · Oberschenkel 0,245 · Unterschenkel 0,246 · Oberarm 0,186 · Unterarm 0,146 | KC:2088-2151 | KC:2307, KC:2410 | gesetzt-literatur |
| g14 | Rumpf- und Glied-Profile | cm | je Schnitt; QUELLE UNGEPRÜFT, ANSUR-II-nah | KC:3475-3501 | KC:3625 → FC:9527 | gesetzt |
| g15 | Gelenk-Einheit | m/E | 0,2833 | KC:5433 | KC:5443, worlds koerperstudio.js:416 | gesetzt |
| g16 | Körpermasse | kg | Volumen der Haut · Skala³ · 985 (Start ≈ 89 kg) | KC:5065, KC:5073 | KV:770-788, koerperstudio.js:488 | physik |
| g17 | Größen-Faktor leibGroesse | - | h²·(1+0,25(m−0,35))·(1+0,1(t−0,5)), nur Spieler | KC:5447 | KL:3026 → KF:2949-2950 | gesetzt |
| g18 | Breite/Tiefe je Bewohner | Faktor | 1 ± 0,03; restBau [0,06, 0,03, 0,07, −0,02] | SB:3936-3937 | SB:407-408, SB:1110 | samen |
| g19 | Arm-Anteil der Masse | - | 0,05 (Dempster 1955) | KC:5074 | werkstatt-bauen.js:1026 | gesetzt-literatur |
| g20 | Hautton | 8 Schlüssel | gleichverteilt je Person | KC:757, KL:44 | KC:2013, KL:1518 | samen |
| g21 | Haarfarbe | 12 Farben | Natur-Filter, unabhängig vom Alter | KC:759, KL:17-34, KL:45 | KL:1524-1530 | samen |
| g22 | Frisur | 9 Stile | Gestalt-Samen | KC:1477-1481, KL:52 | KC:1490 | samen |
| g23 | Kleid-Schnitt | top/bottom/shoes | 9 Epochen-Trachten | FC:3623-3631 | SB:364 → KC:213-334 | gesetzt |
| g24 | Kleid-Farbe | 13 → Epoche | Samen je Person, in die Epoche gefaltet | KC:179, SB:365-366 | KC:2016-2018 | samen |
| g25 | Stoff | E, kg/m² | Dicke 0,012–0,05; webe cotton/wool/…; Tuch 0,3 kg/m² | KC:256-330, KC:5086, KC:8474-8509 | FC:9612, FC:9325 | gesetzt |
| g26 | Kollisions-Kapsel | m | Fuß 0,5 · Radius 0,35 · Bewohner-Scheitel 1,8 | KC:5081, SB:3967 | KB:2639, KB:2649, SB:3245 | gesetzt |
| g27 | Tier-Größe und Allometrie | - | Bänder klein 0,6–0,82 (Jungtier/Zwerg) … Gigant; Beinmuskel (size/2,4)^0,67, Schädel ^0,25, Biss m^(2/3) | T:253-260, T:851, T:865, T:3959 | KL:2545 | physik |

## 3. Tag — wohin er zu welcher Stunde gehört

26 Größen: gesetzt 21 · abgeleitet 1 · samen 1 · fehlt 2 · gesetzt-literatur 1.

| id | Größe | Einheit | Wert | Quelle | LESER | Herkunft |
|---|---|---|---|---|---|---|
| t1 | Tageslänge | min echt | 60 (15·4) | D:153-161 | H:2639, SB:2423 | gesetzt |
| t2 | Tageslänge Spanne | min | 1–60, in localStorage, nie im Spielstand | D:146-151 | H:2776-2782 | gesetzt |
| t3 | Spielstunde | s echt | 150 bei 60 min | SB:2422-2424 | SB:2314, SB:2337, SB:2355-2364 | abgeleitet |
| t4 | Uhr beim Start | Tag | 0,5 | dirigent-kern.js:300 | SB:1564 | gesetzt |
| t5 | wach | h | 6,5 ± 0,5 | KC:5127 | KC:5333 | gesetzt |
| t6 | werk | h | 8–17 | KC:5128 | KC:5334-5335 | gesetzt |
| t7 | mittag | h | 12–13 | KC:5129 | KC:5336-5337 | gesetzt |
| t8 | ruhe | h | 22 | KC:5130 | KC:5338 | gesetzt |
| t9 | streuH | h | ±0,5 je Wende | KC:5131, KC:5227 | KC:5330-5332 | samen |
| t10 | morgenPlatzH / besuchH | h | 1 / 0,75 | KC:5132-5133 | KC:5348-5357 | gesetzt |
| t11 | gang (Tempo-Faktor) | × | 1,3; v = 0,34·√(9,81·L)·1,3 | KC:5134, T:1619, T:1629 | SB:1051 | gesetzt |
| t12 | Rollen mit eigenen Stunden | Zahl | 10 | KC:5135-5173 | KC:5222, KC:5296, KC:5328 | gesetzt |
| t13 | versatzH | h | 12 (Nachtrollen) | KC:5157, KC:5168 | KC:5329 | gesetzt |
| t14 | Angebots-Zeilen | Zahl | 11 | KC:5176-5188 | KC:5241-5243 | gesetzt |
| t15 | wegM | m | arbeit 45 · markt 200 · mahl 30 · treff 45 · besuch 45 | KC:5194 | KC:5278 → T:1698 | gesetzt |
| t16 | Regen-Schwelle | 0–1 | 0,3 ± 0,15; liest den globalen Regen am Spieler | KC:5218, SB:2223 | KC:5341-5342, H:2820-2838 | gesetzt |
| t17 | planH | h | 0,002 (0,3 s echt) | SB:3953 | SB:1654, SB:2309 | gesetzt |
| t18 | sprungH | h | 0,25 (37,5 s echt) | SB:3958 | SB:1618 | gesetzt |
| t19 | WELT_UHR_SPRUNG_S | s | 60 | DT:2701 | DT:1760 → SB:1617 | gesetzt |
| t20 | ankunftH / ankunftWenden / wendeH | h / Zahl / h | 3 / 12 / 0,02 | SB:3954-3956 | SB:2356, SB:2362, SB:2407-2414 | gesetzt |
| t21 | ankunftJeTakt | Köpfe je Takt | 8 | SB:3957 | SB:1696-1701 | gesetzt |
| t22 | Alter im Tag | - | tagesPlan hat kein Alter | KC:5326 | - | fehlt |
| t23 | Wochentag und Jahreszeit im Tag | - | Stunde = (timeOfDay mod 1)·24; worldMeta.tag ungelesen | SB:1565, H:2738-2742 | - | fehlt |
| t24 | Schlafplatz | Ort | die Tür des eigenen Hauses, unsichtbar; kein Bett, kein Raum | SB:2225 | SB:2219 | gesetzt |
| t25 | Tier-Ruhetakt und Pegel | s, Pegel | 360; aktiv 1,5 / ruhig 0,6 | T:2117-2131, T:2119 | KLB:2060, T:2151 | gesetzt-literatur |
| t26 | Schritt-dt Mensch / Wagen | s | Bild-delta ≤ 0,1 / 1/60 fest | DT:2699, KB:2623 | SB:1777-1785, DT:1174 | gesetzt |

## 4. Bewegung — wie er sich bewegt

30 Größen: gesetzt 17 · physik 10 · abgeleitet 1 · gesetzt-literatur 1 · tot 1.

| id | Größe | Einheit | Wert | Quelle | LESER | Herkunft |
|---|---|---|---|---|---|---|
| b1 | Gehtempo Spieler | m/s | 1,15 + 0,6·(1−dichte) + 0,25·mag, ×1/√Größe | KC:507, bau-buch.js:2525, bau-buch.js:318-319 | KB:1463 → KC:5844 | gesetzt |
| b2 | Lauftempo Spieler | × | 4,5 (≈ 5,18 m/s bei dichte 1) | KC:510, KF:2960 | KB:1463 | gesetzt |
| b3 | Gehtempo beim Boot | m/s | 1,75 (von computePlayerStats überschrieben) | dirigent-ankunft.js:33 | KF:2882 | gesetzt |
| b4 | Gehtempo Bewohner | m/s | 0,34·√(9,81·beinL)·1,3; beinL der Gestalt × groesse | T:1619, T:1630, KC:5134, SB:1044-1050 | SB:1051, SB:2664, SB:2803-2811 | physik |
| b5 | Aufholen Bewohner | × | bis 2 | SB:3973 | SB:2811 | gesetzt |
| b6 | Tempo Tier | m/s | tempoEinheit(Hüfte) × speedMul [0,6–1,6] × freude 2 | T:223-224, T:249 | KV:3249-3252 | physik |
| b7 | Sprint Tier | m/s | 3,0·√(g·L) | T:1623, T:1634 | KV:469 | physik |
| b8 | Tier Anfahren / Bremsen / Wende | m/s², rad/s | 0,5 g / 0,8 g / 1,1·√(g/L) | T:1624-1626 | T:1646-1656 | physik |
| b9 | Fahrer | m/s | 8,3 | SV:2281 | SV:1582 | gesetzt |
| b10 | Ritt (Holzross) | m/s | Gehtempo × (1 + min(0,6, 0,12·Räder) + 0,15 Beine) | vehicle-core.js:3108-3110 | KF:930-931, KF:1439 | gesetzt |
| b11 | Schrittlänge | m je Doppelschritt | L·(0,78 + 1,89·v̂), Deckel 2L·tan(0,47)/Tastgrad (Mensch) | KC:633-638, T:1336-1344 | T:1418-1441 über KL:486 | physik |
| b12 | Schrittfrequenz | rad/s | ω = 2π·v/λ | T:1443 | KC:6939 | abgeleitet |
| b13 | Tastgrad | - | 0,6 Gehen → 0,39 Laufen, Wechsel bei Fr 0,5 | KC:635-637 | T:1431-1437 | gesetzt-literatur |
| b14 | Sprung Spieler | m/s | jumpPower 2,6; F = 89·(9,81 + v²/0,8) ≈ 1 625 N; h = 0,34 m bei 89 kg (Kommentar KC:503 sagt 0,53) | KC:511, KC:5076, KC:5535-5544 | KB:56-58, KC:5560 | physik |
| b15 | Doppel- / Wandsprung | ×, m/s | 0,9 / 1,0, Abstoß 3 | KC:566-573 | KC:5583-5590 | gesetzt |
| b16 | Hüpfer Tier | m | 0,8 / froh 1,2 | T:250-251 | KLB:1543-1556 | gesetzt |
| b17 | Schwerkraft der Welt | m/s² | −9,81 | D:72 | KC:5903, KL:493 | physik |
| b18 | Schwerkraft im Steuer-Gesetz | m/s² | 9,81 fest (Zwilling von b17) | T:1332 | T:1630, T:1639, T:1663, SB:2731, SB:2802 | gesetzt |
| b19 | Schwimmen horizontal | m/s | 0,85 × Gehtempo; Bremse ≈ 21/s | KC:535, KC:543 | KB:1466, KB:1527 | gesetzt |
| b20 | Schwimmen vertikal | m/s | tauchV / aufV 1,0, hubCap 1,2, Lerp je Schritt | KC:528-534 | KB:232-243 | gesetzt |
| b21 | Kraul-Takt | rad/s | 1,6 / 0,9 (Kommentar sagt Züge/s) | KC:536 | koerper-seele.js:1746 | gesetzt |
| b22 | Klettern | m/s | 0,6; Ausdauer 12/s | KC:574-575 | KC:5886, KC:6599-6601 | gesetzt |
| b23 | Balancieren | m/s | 0,5, quer 0,15 | KC:5402 | KC:6874-6875 | gesetzt |
| b24 | Rutsch | ×, s, m/s | 1,167 / 0,68 / ab 4,5 | KC:582-584 | KC:5810-5830 | gesetzt |
| b25 | Schaukel / Wippe | - | Pendel-DGL, Dämpfung 0,06 / 0,8 | KC:5398, KC:5403 | leibVerbTakt | physik |
| b26 | Pfeil | m/s | √(2E/0,05 kg) × Auszug, E aus dem Bogen | schmiede-core.js:3679, kampf.js:1162-1164 | kampf.js:1237 | physik |
| b27 | Schlag | s | 1,4·√I, 0,25–1,8; Bogen 1,1 rad; kennt keine Armkraft | schmiede-core.js:3639-3645 | kampf.js:36-43, kampf.js:366-385 | gesetzt |
| b28 | Arm-Amplitude im Gang | rad | ±0,4 × sw | KC:7134-7135 | KC:7035 | gesetzt |
| b29 | Stoß-Balance | - | lineares inverses Pendel, Capture-Point | KC:5611-5635 | KB:2611 | physik |
| b30 | Lifting (Schweben) | m/s | LIFTING_DRIFT_PER_SEC 2,0; Literale 0,85 / 2,5 | KB:2617 | KB:249 ohne Aufrufer | tot |

## 5. Zahl — wie viele, was sie kosten, was außerhalb des Schirms geschieht

21 Größen: abgeleitet 5 · samen 1 · physik 3 · gesetzt 8 · fehlt 4.

| id | Größe | Einheit | Wert | Quelle | LESER | Herkunft |
|---|---|---|---|---|---|---|
| z1 | Bewohner je Siedlung | Köpfe | Σ leuteVon über die stehenden Häuser | SB:837-845 | SB:1241 | abgeleitet |
| z2 | Häuser je Ort | Stk | Dorf 8–17 · Rang 24/96 · Wand 500 | FC:3662, FC:3674-3682, FC:3702 | plan.slots | samen |
| z3 | Obergrenze je Ort | Köpfe | 500 × 12 = 6 000 (Rechnung aus z2 und h3) | FC:3682, FC:9526 | - | abgeleitet |
| z4 | Gezählt im Code | Köpfe | Start-Dorf 77 · Metropole 1 083 / 1 092 · stadt-voll 1 094 | SB:1012, KC:5115, HH:322, SB:1610 | - | physik |
| z5 | Globaler Deckel | Zeilen | Ton-Tafel 4 096: je Siedlung 9, je Kopf 1 → ≈ 4 000 Köpfe weltweit | KL:3279 | KL:1572-1584, SB:434 | gesetzt |
| z6 | Deckel je Siedlung | - | keiner; jede Siedlung ≤ 325 m lebt | SB:1589 | - | fehlt |
| z7 | Leiber nah / im Ring | Stk | nahLeiber 4 (nahM 8) · ringLeiber 6 | SB:3943-3947 | SB:1829, SB:1841, SB:1935-1943 | gesetzt |
| z8 | Raten je Takt | Stk | Geburten 2 · Ankünfte 8 · Wege 2 · Gang-Phasen 2 | SB:3941, SB:3957, SB:3959, SB:3951 | SB:1675, SB:1696, SB:1772, SB:1667 | gesetzt |
| z9 | Felder je Kopf | Felder | 87 (73 im Literal + 14 nachgetragen) | SB:887-899 | _tickBewohner | abgeleitet |
| z10 | Bytes Kopf-Objekt | B | 1 489 allein · 4 376 mit orte/genom/bauZu/raumPunkt (Proxy, gemessen) | vision/person/spike/zensus-kopf.cjs | - | physik |
| z11 | Ton-Zeile je Kopf | B | 13 Texel × 16 = 208 | KL:1556-1557 | KL:1590-1592, SB:438 | gesetzt |
| z12 | Satz je Kopf | B | 2 × (64 + 16) = 160 | SG:199-204 | SB:1498-1508 | gesetzt |
| z13 | Summe je Kopf ohne Hülle | B | ≈ 4 744 (z10 + z11 + z12) | spike/zensus-kopf.cjs | - | abgeleitet |
| z14 | Hülle je Kopf | Objekt | THREE.Group ab Geburt, unsichtbar — nicht gemessen | SB:1015-1052 | SB:1673-1691 | fehlt |
| z15 | Vorlagen-Geometrie | MB | ≈ 2,45 je Gestalt → ≈ 19,6 je Siedlung (Kommentar) | SB:3894 | SB:974-998 | gesetzt |
| z16 | Dreiecke je Kopf | Tris | Leib L2 1 695 · Wurf L3 736; Budget 80 000 gegen Ratsche 86 307 | HH:584-586 | gate | physik |
| z17 | ms je Bewohner | ms | kein eigener Messname (Runde creatures DT:1701-1708); Karte: Takt der Bewohner 1,52–1,82 ms an der Stadt | DT:1701-1708, meisterkarte-2.json mensch.menge.rhythmus | perfSense | fehlt |
| z18 | Abschied | m | 260 × 1,25 = 325 → _bewohnerFort (Leiber, Ton-Zeilen, Satz, Liste fort) | SB:3942, SO:3611, SB:3823-3853 | SB:1589-1590 | gesetzt |
| z19 | Ruhige | s | gestaffelt je fernS 0,25 | SB:3991, SB:2022-2033 | SB:1628-1632 | gesetzt |
| z20 | Lage nach Rückkehr oder Sprung | - | _bewohnerAnkunft spielt 3 h nach; hängt an Tageslänge, Regen von jetzt, Wänden, Nachbarn | SB:2352-2400 | SB:1703 | abgeleitet |
| z21 | Speicher je Bewohner | B | 0 (kein Bewohner-Byte) | SB:271-272 | - | fehlt |

## 6. Bewegungs-Systeme, Pose-Quellen, Ziel-Systeme

Lage bewegen (11 lebend):
- Spieler zu Fuß/Luft/Parkour: leibPlan KC:5789 + _stepCharacter KB:839
- Spieler im Wasser: _swimVerticalVelocity KB:228
- Spieler an Geräten: VERB_GESETZ KC:5381-5403
- Stoß-Balance: LIP KC:5611-5635
- Ritt ohne Fahr-Gesetz: KF:921-935
- Fahrzeug (Spieler und Fahrer): _fahrSatz KF:1433, _verkehrSchritt SV:1425
- Bewohner: _bewohnerGehen SB:2787 / _bewohnerSchritt SB:2659
- Tier: steuerSchritt T:1637 + _kreaturWeg KV:1073
- Pfeil: _pfeilBahn kampf.js:1237
- Schwung: _kampfSchwungLage kampf.js:366
- Freier Körper (Kisten, nie Leib): _freiSchritt koerper-frei.js:421
- tot: Lifting: _liftVerticalVelocity KB:249 ohne Aufrufer

Pose-Quellen: P1 leibRigPose KC:7035 + leibGangTakt KC:6930 + gangSchritt T:1410 · P2 Gang-Satz 16 Phasen SG:16 · P3 tierPose + gangWahl + cpgStep T:3163/3043/2994 · P4 Compound-Seelen taktCompound KC:663 · P5 Kraulen koerper-seele.js:1746 · P6 leibLuftPose KC:8088 / leibVerbPose KC:7950 · P7 Sitz KF:526-537 · P8 Kampf-Overlay koerper-seele.js:1776 · P9 Labor koerperstudio.js:3-61 (PD-Federn, Clips).

Ziel- und Tages-Systeme:
- Mensch-Tag: tagesPlan KC:5326 + tagesBindung KC:5269 → zielWahl T:1716
- Mensch-Furcht: _bewohnerWeichen SB:2179
- Tier-Tag: Ethogramm-Pegel T:2117-2153, KLB:2039
- Tier-Ziele: Prioritätskette updateCreatures KV:3283-3379 (ruft zielWahl nie)
- Fauna: Vögel/Schwarm f(spielZeit), Fische integriert, Bestäuber träge (kreatur-fauna.js)
- Fahrer/Wagen: zielN++ SV:946-953

Zeitbasen: Spielstunden = Uhr × Tageslänge (SB:2422) · creatureAnimationTime += delta (KV:3139) · spielZeit (kreatur-fauna.js:43).

Stellen, an denen ein Mensch entsteht: SB:1013 _bewohnerGeburt + SB:1092 _bewohnerLeibAn → KF:6 _buildHumanGroup (Bewohner) · SB:1198 / SG:16 Satz-Instanz (Bewohner der Menge) · KF:2806 applyPlayerSoul → koerper-seele.js:77 (Spieler) · netz-p2p.js:2156 Platzhalter-Kegel eines Mitspielers · netz-p2p.js:2199 _p2pApplyPeerSoul (Mitspieler) · werkstatt-hof.js:1387 Ich-Bühne · werkstatt-vorschau.js:987 Werkstatt-Vorschau · KL:308 Leib-Vorwärmen (unsichtbar) · worlds/begegnung/index.html:143 Gefährten-Glyph (2D).

## 7. Zwillinge

| id | Domäne | die eine Seite | die andere Seite |
|---|---|---|---|
| Z1 | Größen-Gesetz | Tier: Allometrie m^(2/3), ^0,25, Jungtier-Band (T:253-260, T:851, T:865, T:3959) | Mensch: Polynom leibGroesse (KC:5447) und lineare labMorph-Formeln, kein Kind |
| Z2 | Körperhöhe | Spieler: Dial h · 1,70 m (KC:5077) | Bewohner: kh aus zwei Genom-Achsen (KL:43) |
| Z3 | Tempo | Spieler: Material-Tags × 1/√Größe, größer = langsamer (bau-buch.js:308-322) | Bewohner und Tier: √(g·L), größer = schneller (T:1619); Ritt und Fahrer: Konstante (SV:2281) |
| Z4 | Schwere | state.gravity (D:72) | GANG_GESETZ.g = 9,81 fest (T:1332) |
| Z5 | Sprung | leibSprung aus Kraft und Masse (KC:5535) | Studio-Clip sin·0,45 (koerperstudio.js:61); Tier-Hüpfer gesetzt (T:250) |
| Z6 | Gang-Takt | weg-getrieben leibGangTakt (KC:6930) | cpgStep (T:2994); t·cad im Studio (koerperstudio.js:41); Compound und Kraul zeit-getrieben |
| Z7 | Ziel | Mensch tagesPlan + zielWahl (KC:5326, T:1716) | Tier Prioritätskette ohne zielWahl (KV:3283-3379) |
| Z8 | Gestalt je Bewohner | eigenes Genom (SB:398) | getragene Gestalt 1 von 8 (SB:381-402) |
| Z9 | Leib-Höhe an der Kapsel | eigene Höhe 1,58–1,86 m (KL:43) | kopfM 1,8 fest (SB:3967) |
| Z10 | Zeit | Spielstunden (SB:2422) | creatureAnimationTime (KV:3139); spielZeit (kreatur-fauna.js:43) |

## 8. Größen ohne Welt-Leser

| id | Größe | Ort |
|---|---|---|
| O1 | Alter in Jahren | KC:126 (nur Text 18–80 J) |
| O2 | eigenes Genom des Bewohners jenseits der Gestalt-Wahl | SB:398, SB:381-388 |
| O3 | userData._koerperDials-Werte | KF:51 (nur Null-Prüfung studio-bruecke.js:479) |
| O4 | eigener Bau am Tempo (Gestalt-Bein statt eigenes) | SB:1044-1050 |
| O5 | eigene Höhe an der Kapsel | SB:3967 |
| O6 | Textil-Stoffe: webe-Schlüssel ohne Zeile im STOFF_GESETZ | schmiede-core.js:2860, KC:5086 |
| O7 | BEWOHNER.platzAnteil 0,45 | SB:3938 |
| O8 | Wache-Rollen waechter/nachtwaechter und plan.wache | KC:5165-5172, FC:11399, FC:11787 |
| O9 | ZIEL_GESETZ.halbM 60 | T:1697 |
| O10 | worldMeta.tag für den Tag | H:2740 |
| O11 | Lifting und pl.liftingField | KB:2617, KB:249, KF:2571, KF:2588 |
| O12 | Haushalt hp.leute im Spiel | FC:9531 |
| O13 | Regler-Text „Gangtempo = sqrt(Beinlaenge/0.22) x 1.2“ | T:330 |

Nur Prüf-Leser (gewollt): LEIB_SOLL.kanon, MENSCH_SOLL, BAU_SOLL — scripts/diag-mensch-anatomie.cjs (Soll-Tafel, gewollt).

## 9. Befund

1. **Herkunft:** Ein Bewohner entsteht nur aus dem Plan seiner Siedlung. Je stehendem Haus gibt es so viele Köpfe, wie die Wohnfläche
   trägt (`leuteVon` FC:9526–9537, sechs Konstanten). Jeder Kopf hat einen Samen „Plan:Haus:Person“ (SB:848).
   - Das ist deterministisch, ohne Zufall, ohne Speicher-Byte, ohne Namen und ohne Verwandtschaft.
   - Der Haushalts-Zweig `hp.leute` liegt im Spiel tot (FC:9531). Die Köpfe des Bau-Entscheids (4,75, Laslett) erreichen die Welt nicht.
2. **Gestalt:** Alle Menschen-Pfade bauen über EINEN Kern-Aufruf (`bauMensch` + `morphAuf`, FC:9382–9383). Er hat aber kein Alter
   jenseits des Erwachsenen (die Achse `age` 0–1 heißt „18–80 J“ nur im Text, KC:126), kein Kind, kein Erbe und keine
   geschlechtsabhängige Höhe (KL:43).
   - Der Bewohner trägt eine von 8 Gestalten seiner Siedlung. Sein eigenes Genom liest nur die Wahl der Gestalt.
   - Das Tier hat ein Allometrie-Gesetz, der Mensch nicht.
3. **Tag:** Das Soll ist eine reine Funktion der Uhr (`tagesPlan` KC:5326). Die Ist-Lage ist ein Takt-Zustand:
   - Sie wird je Bild integriert (SB:2665).
   - Nach einem Sprung wird sie über 3 h nachgespielt. Das hängt an der Tageslänge des Spielers, am Regen von jetzt und an Nachbarn
     (SB:2352–2400).
   - Sprünge zwischen 0,004 und 0,25 h holen nicht nach.
   - Alter, Haushalt, Wochentag und Jahreszeit formen den Tag nicht.
4. **Bewegung:** Der Schritt kommt aus dem Leib (Froude, gemessene Beinlänge, EIN Löser `gangSchritt` T:1410 für Spieler, Bewohner und
   Tier). Das Tempo aber folgt drei Gesetzen, die sich widersprechen (Z3). Schwimmen, Klettern, Rutschen, Balancieren, Ritt,
   Fahrer, Arm-Schwung und Schlag sind gesetzt.
   - Einen Wurf von Hand gibt es nicht, keinen Sport und kein Muskelmodell.
   - Der Sprung rechnet mit Masse und Welt-Schwere, aber mit geeichter Kraft. Er gibt 0,34 m, der Kommentar sagt 0,53 m.
5. **Zahl:** Die Kosten hängen an der Kopfzahl, nicht am Schirm. Jeder Kopf im Umkreis von 325 m hält:
   - eine Hülle, eine Ton-Zeile und Satz-Platz;
   - ein Objekt mit 87 Feldern — gemessen 1 489 B, mit Unterobjekten 4 376 B; der Leser schätzte ≈ 350 B, die Messung sagt das
     12-fache.
   - Bei 5 · 10⁶ Personen wären das ≈ 24 GB ohne Hülle. Die Welt ist heute ein **Sack** — der Deckel ist die Ton-Tafel mit 4 096 Zeilen.
   - Die Bewohner haben weder ein eigenes ms-Budget noch einen eigenen Messnamen (sie messen mit in „creatures“).
