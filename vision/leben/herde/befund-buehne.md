**Befund Prüfbühne Tier-Bewegung** (gelesen im Baum C:\Users\micha\AnazhRealm-probe2, Zweig leben-leser, Kopf a946501198)

**(1) Wo ein Tier oder eine Gruppe isoliert vor der Kamera steht**
- **worlds/tetrapoda (das Labor):** der einzige Ort mit EINEM Tier im Bild. Es gibt nur ein Tier (`leib` und `wolf` sind einzelne Variablen, tetrapoda.js:4,17). Die Gattungs-Knöpfe sind wolf/fox/bear/deer (index.html:50), die Stimmungs-Knöpfe idle/joy/hunt/flee/alert/showcase (index.html:54–59). Ein Tempo-Regler v̂ geht von 0 bis 4 (tetrapoda.js:197). Die Kamera, das Licht und der Boden folgen dem Tier (tetrapoda.js:45–48).
  - Der Boden ist kein Weltgrund: `boden:()=>0`, `kipp:()=>{0,0}` (tetrapoda.js:18), dazu eine dunkle Kreisscheibe mit 20 m Radius (tetrapoda.js:189) vor dem Hintergrund 0x080604 (tetrapoda.js:185).
  - Äsen lässt sich nicht wählen: die Stimmungs-Tafel `STIMMUNG` kennt nur idle/joy/jagd/alert (tetrapoda.js:27). Die Zeile `tag` mit „grasen“ (tetrapoda-core.js:111,121) fehlt. Der Knopf „flee“ trägt keine Aktion, nur das Profil MOTION.flee (tetrapoda-core.js:73) bei Hand-Tempo.
  - Eine Gruppe gibt es dort nicht.
- **worlds/koerperstudio:** ein Zweibeiner (Mensch), kein Vierbeiner (koerperstudio.js:15–23).
- **worlds/schwarm und worlds/begegnung:** 2D-Canvas-Engines ohne Three.js und ohne AnazhRealm-Code (schwarm/index.html:7–9, begegnung/index.html:6–9). Sie zeigen keine Tiere.
- **Prüfbühne der Welt:** spec/pruefbuehne/stationen.json hat die Stationen s0-atrium, s2-hang30, s4-hindernisse, s5-furt, s5-kolk, s6-klamm und meer. Keine davon ist eine Tier- oder Herden-Station. s2-hang30 hat zwar eine feste Kamera A (Zeilen 12–26), wird aber nur headless von der Probe `querhang` gelesen.
- **`werkbank bild`:** hält die Tiere vor jedem Schuss fest, ohne Bedingung (`__halten(["tiere"])`, werkbank.cjs:972–975). Ein Bild zeigt deshalb nie ein Tier in Bewegung.
- **`werkbank lauf --tiere n`:** stellt n Tiere einzeln in einen Ring 15–60 m um den Spieler, mit zufälliger Seele und ohne Verband (ausgabe-aufnahme.cjs:401–416). Geurteilt wird nur, ob alle stehen (werkbank.cjs:4007). Das ist eine Kostenbühne.
- **`werkbank lauf --wandern kreis`:** zählt Tiere mit ≥ 200 px bei 1280×720 (zerlege-linse.cjs:492–554). Die Zahl wird nur gedruckt (`console.log("KREIS …")`, werkbank.cjs:4001), sie hat keine Schwelle.
- **`gate:kreatur-takt` mit der Bühne `herde`:** fünf scheue Hirsche (Seele „wesen“) aus dem echten Wurf `_kreaturWurf` (kreatur-proben.cjs:926–990). Das ist die einzige isolierte GRUPPE.
  - Sie läuft headless; mit `--werkbank <port>` läuft sie im sichtbaren Fenster (diag-kreatur-takt.cjs:3–4).
  - Die Probe schießt kein Bild: diag-kreatur-takt.cjs enthält kein png, Bild oder screenshot.
  - Die Kamera steht in Augenhöhe 1,6 m am Spieler, der 140 m vor der Herde steht (kreatur-proben.cjs:224–230, 993–994).

**(2) Was die Linsen über Bewegungs-QUALITÄT urteilen**
- **gate:tier-gang** (diag-tier-gang.cjs):
  - Stand-Schlupf ≤ 0,05 (Weg des Fußes durch Weg des Leibs, ohne Einheit; :30, :706)
  - Gangart nach Fußfolge bei v̂ 0,3 · 0,74 · 1,2 · 3,5 (:562–563)
  - Tastgrad-Bänder: 0,6–0,7 · 0,4–0,6 · 0,25–0,35 (:564)
  - Abstand der Phasen Labor gegen Welt ≤ 0,05 Zyklen (:674)
  - Kreuz-Probe Stimmung × Tempo (:570)
  - Mondschwere 1,62 m/s² (:693)
  - Satz-Gang (:697)
  - Beim Menschen dazu: Kadenz ≥ 1,5 Schritte/s, Töne ± 15 %, Becken Hub/Tiefe ≤ 0,07/0,08 bzw. 0,12/0,25 Beinlängen (:31–36)
  - Tiere je Lauf: EINES, gespawnt mit y = 0 (:91–99), headless mit Null-Renderer (:640–641).
- **querhang** (kreatur-proben.cjs:3141–3165): Bein-Lot ≤ 10° und Stand-Schlupf ≤ 0,05 für Wolf und Hirsch, an einem Welt-Hang von 20–30° und an der Rampe s2 mit 30°.
- **ferngang** (:3130–3139): Anteil der Gleit-Takte ≤ 5 % bei 45–60 m und 70–90 m. Gleiten heißt: die Hüft-Winkel halten 24 Takte lang innerhalb 0,02 rad (:2168–2170).
- **herde** (:2880–2916):
  - Wandern: Anteil der Glieder im Fenster ≥ 0,9
  - Flucht: Anteil ≥ 0,8
  - Engstes Paar ≥ 0,5 Paar-Räume
  - Ausrichtung Φ ≥ 0,8 über ≥ 60 Takte
  - Alarm-Kette: letzter Flüchter ≤ 1 s nach dem ersten
  - Fluchtweg ≥ 30 m
  - Abweichung der Bewegung je nach Blick < 1e-6 m
- **abstand** (:3028–3046): keine Durchdringung; Abstand zum nächsten Nachbarn p50 ≥ 1 und p10 ≥ 0,85 Körper-Kugeln.
- **gate:tier-anatomie:** misst nur die Ruhe-Pose (Gestalt, Fell, Kahl-Anteil ≤ 0,02; diag-tier-anatomie.cjs:1–26), nichts in Bewegung.
- **Soll-Tafel:** spec/abnahme/soll-tafel.json hat Klassen bis „fell“ und „haar“ (Strich-Kohärenz, :3108–3145). Eine Klasse für Tier-Bewegung oder Herde fehlt.

**Was KEINE Zeile urteilt:**
- Ruck im Gangwechsel: kein Treffer für ruck/jerk in diag-tier-gang.cjs und kreatur-proben.cjs.
- Fuß-Schlupf beim Laufen am Hang: querhang misst den Stand quer und längs der Höhenlinie, keinen Trab oder Galopp am Hang.
- Kopf am Boden beim Äsen (headX 0,95 ist ein Stellwert, keine Linsen-Zeile).
- Herden-Abstand als Bild.
- Zahl der Tiere im Blick (KREIS druckt nur).
- Silhouette bei 30/60/100 m.
- Bewegung im echten GPU-Bild überhaupt.

**(3) Gleicher Code oder Zwilling?**
- Die POSE kommt aus EINER Quelle: das Labor ruft `K.tierPose(wirt, …)` (tetrapoda.js:38), die Welt ruft `core.tierPose(this._tierWirt(), …)` (stamm/koerper-leib.js:2391). gate:tier-gang vergleicht die Phasen beider (≤ 0,05 Zyklen).
- Der Wirt ist aber verschieden:
  - Labor: Boden 0 und Kippung 0, keine Stimmung „tag“, Zustand null.
  - Welt: `_kreaturFussBoden` und `_gaitSohlenKipp` (koerper-leib.js:2402–2403) sowie `_motionStudioProfile` mit Zustand (:2388).
  - Das Labor fährt keinen Verband (`_kreaturVerbandZug` lebt nur im Stamm).
- In der Welt bewegen sich nur die 4 nächsten Tiere als voller Leib (`KREATUR_SATZ.nahLeiber: 4`, kreatur-leben.js:3891). Alle anderen gehen im SATZ:
  - 32 gebackene Phasen je Band schritt/trab/galopp (:3885–3895), gebacken auf der Ebene der Lage (:3089–3091).
  - Der Back-Leib geht mit `emotions null` (:3190), es gibt also keine Grasen-Pose.
  - Der Stand ist die Neutral-Pose (:3196).
- Die Zeichnungs-Kappe liegt bei `maxCreatures: 20` (dirigent-kern.js:280). Neue Gruppen werden nur „fern und außer Blick“ gezeichnet (kreatur-leben.js:2628–2632, 2669–2676).
- Der Gau-Leser (Commit 3440aa6900) meldet selbst: „Headless gemessen … Offen: Linsen L3/L4, Bild und Kosten im Spiel, gate:kreatur-takt … ungefahren“.

**(4) Was fehlt für 4–12 Hirsche eines Verbands vor fester Kamera durch Stehen → Äsen → Ziehen → Flucht mit Kontaktbogen**
- **Keine Station mit Tier:** stationen.json hat keine. Die Herden-Probe wirft 5 Tiere (`_kreaturWurf … 7`, kreatur-proben.cjs:996). Der Kern deckelt den Wurf eines Hirsch-Verbands auf 3–7 (tetrapoda-core.js:282). 8–12 Tiere in EINEM Verband gibt das Gesetz nicht her.
- **Nur 4 Leiber nah:** von 4–12 Hirschen sind höchstens 4 voller Leib, der Rest ist Satz ohne Äsen und ohne Hang-IK (siehe 3).
- **Kein Ablauf über die Zustände:** kein Befehl fährt Stehen → Äsen → Ziehen → Flucht in Folge. Die Herden-Probe kennt die Läufe wander/flucht/fremd/blick (:1068); Äsen erzwingt sie nicht. Das Äsen hängt am Tages-Budget (tetrapoda-core.js:2105–2127). Im Labor ist Äsen nicht wählbar.
- **Kein Schuss in Bewegung:** `werkbank bild` hält jedes Tier fest (werkbank.cjs:975). Die Herden-Probe hat keinen Bild-Ausgang. Einen Befehl für eine Bildfolge aus fester Kamera über die Zeit (Kontaktbogen) gibt es in werkbank.cjs nicht.
- **Kamera nur am Spieler:** die Probe setzt die Kamera an den Spieler (kreatur-proben.cjs:224–230). Eine feste Kamera relativ zur Herde (wie `kamera.A` von s2-hang30) liest keine Tier-Probe.
- **Kein Urteil am Bild:** keine Zeile urteilt Tiere im Bild, Silhouette in 30/60/100 m, Ruck im Gangwechsel oder Kopf-am-Boden beim Äsen. Damit trägt kein Gate das Wort „Bewegung A-Niveau“.

**Ungelesen:** die Bühnen schwarm/abstand/tiersatz im Detail (kreatur-proben.cjs:1120, 1619, 2561), der Leib von `tierPose` jenseits der Zeile 3222 und stamm/kreatur-erbe.js.