# 54 Der Linsen-Bestand: was sperrt, was meldet, was wackelt

## Was es den Spieler kostet (Prozess, kein Bild der Klasse)
- Zeit bis zur Landung: `w28-leib-genom` 45805bda (leerer Commit über dem GRÜNEN 3087540f) fiel an der GTX 1050 um 17:53 in
  `gate:kamera-leib:echt` K6 und war nach dem Neulauf um 18:42 GRÜN: 49 min Probe für dasselbe Byte (KO/cloud-post/w28-leib-genom.md:3–7).
- Verlorene Punkte: in 9 Messungen der Punkte-Maschine steht dasselbe ROT „DIE WELT STEHT NICHT nach N Takten: … Fege-Takt nahWiese
  wartet, nahStreu wartet (DER BAU STEHT NICHT: … die Welt hat nichts mehr offen)" — PM/messung/1561bf3a-radeon, 28c74a9f-radeon,
  3fd9a25a-gtx, 6a571e3b-radeon, 77265b04-gtx, 77265b04-radeon, c4010773-radeon, e6f0cf7e-radeon, f52b3a03-radeon (Grep, je Datei
  2–4 Stellen). Getroffen: mensch.K1#1, mensch.K2#2, vegetation.K1#1, profiband.K2#1, profiband.K3#1, wetter.K2#1, physik.K2#2 (Vorlauf).
- Bild: KO/probe-post/w28-leib-genom/45805bda-dorf-0.5.png — die Bühne, an der die Probe urteilt: brauner Boden, weiße Kästen,
  Bewohner als Klötze 6–15 m vor dem Auge, gelbe Halm-Büschel links, unter dem Haus ein schwarz-körniger Schatten. Was die Linsen hier
  sperren, sieht der Spieler nicht; was er sieht (Kästen, Teppich), sperrt keine.

## Was die Quelle sagt
**Wackler 1 — der Deckel zählt einen wartenden Fege-Takt als Stille (die Klasse).**
- Der EINE Deckel `deckel()` SPIEL/scripts/lib/welt-boot.cjs:362–381 zählt einen Gang nur, wenn `_weltOffen()` nichts offen hat (:368–369,
  :375) und wirft nach `max` (1800 in `weltStehtNach` :310) „DER BAU STEHT NICHT … die Welt hat nichts mehr offen".
- `_weltSteht` SPIEL/stamm/dirigent-takt.js:685–706 verneint dagegen auch, solange ein Fege-Takt geht oder wartet (`return !this._standGeht()`
  :705; `_standGeht` :517–524 schreibt „nahWiese wartet"). Zwei Wahrheiten über „offen": `_weltOffen` :531–659 kennt foundry, chunks, stau,
  horizont, wald, karten, blende, spiegel, felder, dorf, leib, wesen, huellen, bau, alter, leiber, leute — KEINEN wartenden Fege-Takt.
- Der Takt wartet auf Wanduhr und Läufer: Nah-Wiese baut nur bis `performance.now() > deadline` (SPIEL/stamm/vegetation-wiese.js:411),
  wartet auf das Buch (:366–368), auf die Studio-Vorlage (:389), vor dem ersten Weltbild auf den Blick der Ankunft und auf kommende
  Kronen (`_nahKachelWartet` :23–26); meldet nur `nw.offen > 0` (:438). Nah-Streu ebenso `ns.offen > 0` (:2177). Die Wache speichert
  es als Wahrheitswert (SPIEL/stamm/dienst.js:1945), die Menge geht verloren.
- Die Geschichte ist dieselbe Klasse in Ameisen: jedes Feld von `_weltOffen` kam nach genau diesem ROT — `leute` (dirigent-takt.js:641–644,
  „DER BAU STEHT NICHT: begegnung … nichts mehr offen"), `wesen` (:617–627), `horizont` (:573–587), `stau` (:570–572), `leiber` (:634–640).
  Der Kommentar am Job nahWiese (dirigent-takt.js:1949–1953) nennt schon „mensch.K1#1 DIE WELT STEHT NICHT nach 765 Takten, nahWiese wartet".
- Ein ECHTES Hängen bleibt benannt: `still > 3600` bei gleichem `_weltOffen` wirft „DIE WELT HÄNGT … offen …" mit `_weltOffenAkte`
  (welt-boot.cjs:371–374).
- 31 Dateien unter scripts/ rufen `__weltStehtNach` (60 Stellen, Grep); jede erbt den Deckel.

**Wackler 2 — „Sicht verdeckt 3,3 %: Leib bewohner ≤ 2,6 m" (Ziel-Plan, GTX 1050, zweimal identisch).**
- Mit Ziel zählte der Leib ZWEIMAL: im Vordergrund (≤ 25 %) und obendrauf in `sicht.deckung` (≤ 2 %) — SPIEL/scripts/lib/ausgabe-aufnahme.cjs:743–746;
  zugleich sagt kamera-nah.cjs:317 „EIN LEIB IST NIE FLÄCHE DER LINSE — AUCH NICHT VOR DEM ZIEL". Das Urteil liest
  `sicht.deckung ≤ 0,02` (SPIEL/scripts/lib/abnahme-urteil.cjs:36, Grund :90–91). Eine Text-/Szene-Frage, kein Spieler-Erlebnis.

**Wackler 3 — K6 Strafe (kamera-leib:echt, GTX 1050).** Das Maß selbst urteilt Verhalten (Bild bewegt ↔ stehend ↔ ohne Leib,
diag-kamera-laub.cjs:249–276, Deckel `STRAFE` :172). Gekippt ist das Einschwingen davor (`__weltStehtNach` :294) mit
„DIE WELT HÄNGT … nach 3757 Takten … nahWiese wartet, nahStreu wartet" (cloud-post/w28-leib-genom.md:5), nachdem die Probe auf das
GPU-Schloss „hand werkbank" wartete (FUND-REGISTER.md:246). K6 hat KEINE Station der Meisterkarte (Grep „strafe" in PM/stationen: 0).

**Wackler 4 — Q12 halten.K4 „treffer-ort" (headless).** Die Bahn ist eine Funktion der Flugzeit (SPIEL/stamm/kampf.js:1236–1244), die
Probe fliegt mit festen Zeiten `pf.born + k/hz` (SPIEL/scripts/lib/kampf-proben.cjs:2696–2703) — die Wanduhr (kampf.js:1145) fällt
heraus. Die Wand wird im selben synchronen Block gesetzt und beschossen (kampf-proben.cjs:2724–2736). ROT lokal GTX 1050 an main fd5df4bf,
„Pfeil trifft den Boden 4–11 m vor der Wand" (FUND-REGISTER.md:229), und in der CI am Kopf 5826b6d5 (voll 10/18, cloud-post/w28-wesen-offen.md:10–15).

**Wackler 5 — mp-sync (f) „leben VERSCHIEDEN".** Kein Linsen-Fehler: Spiel-Wurzel `_bodenKlasseAt` liest den Hang samt Erdbau
(FUND-REGISTER.md:253); die Linse tat ihr Werk. Schnitt liegt (unten).

**Was nicht mehr wackelt:** Kosten an der Wanduhr fielen mit `eichMs` (welt-boot.cjs:270–287; diag-fahr-leben.cjs:337–357 urteilt in
Eichungen). Die Warte-Wand sperrt neue Frist-Schleifen (diag-altlasten.cjs:3151–3155).

## Die EINE begrenzende Entscheidung
**Ein Wartender ist offen.** Es gibt EINE Antwort auf „hat die Welt noch etwas offen": `_weltOffen`. Ein Fege-Takt, der wartet, steht
darin mit der ZAHL dessen, worauf er wartet. Kein Deckel zählt einen Gang als still, solange er wartet; nur ein Warten, dessen Zahl sich
3600 Gänge nicht rührt, fällt — beim Namen (HÄNGT). Kein Soll, keine Schwelle, kein `max` wird bewegt; nichts Neues an Apparat.

## Der Schnitt (die Klasse ganz)
**Stufen** (alle in einer Welle):
1. SPIEL/stamm/dienst.js:1945 `_standMeldet`: `t.offen` trägt die Zahl (Zahl > 0 oder "felder"), nicht `!!offen`.
2. SPIEL/stamm/vegetation-wiese.js:438 und :2177: melden `nw.offen` / `ns.offen` als Zahl. Alle übrigen Melder (Wahrheitswert) bleiben gültig.
3. SPIEL/stamm/dirigent-takt.js:531–659 `_weltOffen`: neues Feld `fege` = Σ `t.offen` (Zahl, "felder" = 1) aller Takte der Stand-Wache
   mit `t.leer < t.runde`; im Start-Objekt :536–553 `fege: 0`.
4. Selbsttest in der bestehenden Familie gate:stand-takt (diag-stand-takt.cjs): ein Takt, der 2 000 Gänge mit sinkender Zahl wartet, steht
   danach → GRÜN; derselbe mit fester Zahl → „DIE WELT HÄNGT … fege" beim Namen; die Mutante (stufe 3 entfernt) → „DER BAU STEHT NICHT … nichts mehr offen".
**Leser-Liste (vor dem Schnitt, Grep `_weltOffen()`):** stamm — dirigent-takt.js:463 (Grund-Kette; `geht` steht vor jedem Feld, Text
unverändert) · :691 (`_weltSteht`; verneinte schon über :705, Verhalten unverändert). scripts, „irgendwas offen" — welt-boot.cjs:368 (der
Deckel: DER Schnitt) · diag-fernwald.cjs:330 · diag-stand-takt.cjs:1325, :2044 · draw-zaehler.cjs:672 · diag-boot-stage.cjs:732 (werden
mit `_weltSteht` gleich). Feld-Leser (.chunks .foundry .wesen .huellen .leute .leiber .blende .wald) — diag-ankunft.cjs:222–247, :1364–1371 ·
diag-chunk-seam.cjs:301 · diag-chunk-satz.cjs:917, :1354 · diag-boot-stage.cjs:134, :767–772 · diag-klang-zensus.cjs:151 ·
diag-schirm-monotonie.cjs:194 · diag-settlement.cjs:728, :763 · diag-werk-im-wasser.cjs:736, :1697, :1705 · playtest/gelaende.cjs:1875 ·
kreatur-proben.cjs:2406, :2426 · diag-fern-ring.cjs:606 — unberührt. `t.offen === "felder"` (dienst.js:1924) bleibt wahr für "felder".
**Kosten-Zeile:** je Takt eine Schleife über die Takte der Stand-Wache (~10 Einträge, dienst.js:1832–1833) in `_weltOffen`; 0 Draw-Calls,
0 Bytes GPU, an Schirm und Änderung gebunden, nie an die Weltgröße. Spiel-Verhalten byte-gleich (nur Linsen lesen `fege`).
**Kriterien der Meisterkarte (Ist ↔ Soll, Station):** mensch.K1#1 radeon (ROT am Deckel in 1561bf3a · 28c74a9f · 77265b04 · f52b3a03 ↔ das
Bild am Dorfplatz urteilt), mensch.K2#2 radeon (dieselben), vegetation.K1#1 gtx (stand.json:4419 0 Punkte; 3fd9a25a ROT am Deckel),
profiband.K2#1 / K3#1 gtx (stand.json:2916, :2962 je 0; 3fd9a25a ROT am Deckel), wetter.K2#1 gtx (77265b04 „Dorf: /umstellen: … STEHT NICHT").
Stationen: PM/stationen/g1.js, g5.js (Zeile je Kriterium nicht gelesen). Erwartet: das ROT am Deckel verschwindet oder wird HÄNGT mit
Zahl — kein Punkt ist zugesagt, die Urteile der Kriterien selbst entscheiden.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Wackler 2: `w28-ziel-plan-wip` **3005322c** (auf `w28-ziel-plan` 0146c309 + main ec281422): Leib mit Ziel nur im Vordergrund
  (ausgabe-aufnahme.cjs, Selbsttest L mit Mutante ROT 14,8 %), abnahme-urteil.cjs meldet „Leib im Vordergrund x %", SCHWELLEN unverändert,
  `npm run check` EXIT 0, playtest:fast 21/0 (Rumpf des Commits). Fehlt: vier Bilder Dorf Mittag main ↔ Zweig, `band --ort dorf`, EIN Abgabe-Kopf.
- Wackler 5: `w28-mp-boden` **f97fe692** (WIP, OMEN): `_terrainSaatY`; gate:mp-sync mit Schnitt 1/1 bzw. 4/4 GRÜN, ohne 3/3 ROT
  (UEBERGABE §4, Nachtrag 21:06). Fehlt: Abgabe auf main.
- Wackler 1: kein Zweig.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- K6 17:53 war „HÄNGT", nicht „STEHT NICHT": `_weltOffen` war 3600 Gänge gleich und nicht leer — welches Feld, schneidet cloud-post ab
  („offen  — k"). Der Schnitt oben heilt K6 NICHT beweisbar; der nächste K6-ROT nennt das Feld samt `_weltOffenAkte`.
- Ob Nah-Wiese unter Last verhungert (deadline schon verbraucht beim Eintritt, vegetation-wiese.js:411) — nicht gemessen; nach dem Schnitt
  würde es HÄNGT „fege" heißen, ein Spiel-Befund.
- „streuLod 1120/1230" (350e6b11, 4d52c7bc) und „archLod 0/80–93" (physik.K2_2 in 8 Roh-Ordnern) gehen ihre Runde, warten nicht — nicht
  in dieser Klasse; archLod bleibt über 8 SHAs gleich, also wohl Spiel. Nicht gelesen.
- Q12: ob `_fieldRaycast`/`_raycastWorldHit` die frisch gesetzte Wand im selben Block sieht — nicht gemessen; meine Rechnung (Auge 1,6 m,
  Ziel 0,6 m über dem Fuß in 17,8 m) ließe den Pfeil HINTER, nicht vor der Wand landen — Widerspruch zum Befund, ungeklärt.
- Welche Linsen per Stufe sperren und welche nur melden (die 18 voll-Stufen, gpu-probe.yml): nicht vollständig gelesen; 137 gate-Skripte
  in package.json, 130 diag-Dateien.
- Station-Zeilen der genannten Kriterien in g1/g5 nicht gelesen. Kein Spiel gestartet, kein Lauf gemessen (nur lesen).

## Rang
- Wackler 1 „Ein Wartender ist offen": Wirkung im Takt **4** (9 Messungen und 7 Kriterien ohne Scheinurteil; jede Probe, die einschwingt,
  31 Dateien) · Aufwand **S** · Risiko: eine Probe, die heute grün „durchzählt", obwohl ein Takt ewig wartet, wird HÄNGT — das ist dann
  ein Spiel-Befund, den bisher der Deckel verdeckte.
- Wackler 2 landen (3005322c): Wirkung **3** (Ziel-Plan an der Ankunft frei) · Aufwand **S** · Risiko: ein Kopf vor der Linse MIT Ziel
  zählt nur noch bis 25 %.
- Wackler 4 Q12: Wirkung **2** · Aufwand **S** · Risiko: ohne Messung an der GTX 1050 rät der Schnitt.
