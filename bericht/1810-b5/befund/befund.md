# B5 Befund (Finder, OMEN GTX 1060 + i7-8750H) — die Studio-Lieferungen vor dem ersten Weltbild

Baum `n1810-b5` = integ-probe f45ee994, Instrument nur für die Messung (zurückgenommen, `git status` leer). Rohpfade relativ zu `p3/n1810/b5/`: Tafeln `zahlen.md`, `roh/*.txt|md`, je Lauf `roh/<lauf>.{json,log,png,cpuprofile}`. Instrument: `lieferung-patch.cjs` (Auftrag → Senden → Ankunft → Satz je Lieferung, Lücken je Probe), `faden-patch.cjs` (Stempel im Faden: Eingang · Studio · fertig), `blick-patch.cjs` (Haupt-Faden im/außer Blick, Gegenproben), dazu `p3/n1710/b4/profil-patch.cjs` byte-gleich. 26 echte Läufe (`fortschritt.log`), Schloss je Lauf.

## IST (Anker)
- Tor: `_weltbildLuecken` stamm/dirigent-ankunft.js:971 (leib :1010 · bauten :1030 · dorf :1036–1048 · streu :1095 · karten :1105), EIN Schreiber `_weltbildSteht` :843.
- Schlange: `_foundryAuftrag` stamm/studio-bruecke.js:952, Rang `_foundryAuftragD2` :959 (d² + außer Blick 1e12, ohne Ort ∞), Pumpe :977 (`darf` :987: außer Blick/ortlos nur in eine LEERE Bahn), 12 im Flug je Faden (:3148) in FIFO-Fäden, 3 Fäden (w0 „buch" + 2 Helfer, :172).
- Platte: `_foundrySchale` :488, Stempel = SHA-256 über Manifest + Kerne + Brücke (:536), sie fängt NUR build-asset (:693ff). Blatt-Atlas (malt w0 nach dem Buch, Fracht :670), Siedlungs-Export (`_foundryRequestSettlement` siedlung-ort.js:1229) und Karten (`_tickKarteWelt` stoff-instanz.js:413) laufen je Boot live.
- Leib: `_leibBereit` stamm/koerper-leib.js:1392 wartet auf BEIDE Vorlagen (L0 + L1, `_ofenSpielerVorlagen` :1337/:1381), bestellt beim Buch (studio-bruecke.js:214).
- Lade-Takt: ein Bild je LADE_BILD_MS 500 (dirigent-takt.js:1573), Karte 1 Bake je Bild (KARTE_WELT_MS 4, stoff-instanz.js:3151).

## Der kritische Pfad (11 Kalt-Läufe K0–K3 · P1a–P4a · B1–B3, `zahlen.md`; Median, Spannweite)
- **t(Weltbild) 16,58 s (16,08–17,04) · t(Leib) 10,46 s (9,77–11,56).** Zuletzt fallen Boden 15,14 → Horizont 16,58 (Haupt-Faden); parallel die Lieferungen: bauten = karten 16,07 (15,43–16,53) und streu 16,25 (15,86–16,67) — alle Ketten enden binnen 1 s.
- **Leib:** w0 Buch 2,71 → Blatt-Atlas 4,25 → mensch L0 Studio-Bau 4,43 s (3,78–5,53) → an 9,19 → Seele 10,34 → 10,46. Die L1 lag bei 4,23. Hinter L0 warten in w0 in allen 11 Läufen die 5 Tore in 11 m (geisttor · drachentor · maschine · kathedrale · ruine) bis 8,6–11,0 s (`roh/w0-kopf.txt`).
- **bauten (:1030) = das Start-Dorf:** „gegründet" ab dem Buch 2,7, Export erst 4,44 gesendet (`_autoSettlementSpawnCell` siedlung-ort.js:2414) (w1, FIFO), Studio-Lauf 3,4–5,4 s (`roh/dorf-export.txt`), an 9,26 → Plan/Ort-Wahl → Lücke dorf 11,19 → 33 Haus-Aufträge > 60 m ab 9,8–11,7 (`roh/dorf-haeuser.txt`, je Haus L2 + Wurf-L3) → letzte Ankunft 15,32 → bauten 16,07. Gegenprobe ohne Start-Dorf (E1–E3, Genesis-Ort bleibt): **Weltbild 13,99 (13,46–14,18) = −2,6 s**, Boden 12,54 (−2,6 s), Faden-Σ 22,6 → 13,9 s. Das Bild zeigt vom Dorf ein Haus-Fragment im Tor-Spalt (`roh/B1-mitte-x4.png` ↔ `E1-mitte-x4.png`) und seine Lichtung: 10,2–11,3 % der Pixel (Lauf-Rauschen 1,4–2,1 %, `roh/bild-diff.txt`). Ohne ganzen Ort (D1–D3, auch ohne Tore): 12,90 s.
- **streu (:1095):** 7 ortlose Aufträge — Nah-Wiese gras L1/L2 (`_tickNahWiese` vegetation-wiese.js:165) und Gesetz-Fit blume/geroell L0 (`_streuGesetzFit` dienst.js:696), beide `_foundryFlattenFor({ seed })` ohne Ort (Stapel `roh/B1.json` lf.stapel) — tragen Rang ∞ und warten 8,49 s (5,22–10,09) auf eine leere Bahn.
- **karten (:1105):** letzte L1 an 15,24 (14,55–15,80), gebacken 1 je Lade-Bild (19 Bilder à 630–720 ms, 25 Bakes = 1,39 s Haupt-Faden, `roh/blick-teilung.md`).
- **Was das Bild nicht zeigt, belegt die Fäden:** Faden-Arbeit vor dem Bild Σ 22,6 s (20,8–26,4) + Export; davon Leib-L0 4,4 s (Ego), 29–31 Wurf-Stufen L3 3,7 s, Karten-L1 außer Blick 2,7 s (`roh/bedarf-kalt.txt`). Häuser warten im Faden 0,43–0,67 s (Median), Faden fertig → Haupt-Faden 0,2–0,5 s (max 1,1 s), Ankunft → Satz 0,4–0,7 s (`roh/auswertung-alle.txt`).

## Haupt-Faden je Lieferung (CPU-Profil 0,5 ms, `roh/profil-kalt.md`, `roh/baum-kalt-9.txt`, `roh/erst-bau.txt`)
- Bis zum Bild 16,4 s belegt, idle+program 1,9 s; **t(Weltbild) folgt der Haupt-Faden-Summe 1:1** (zweit 12,0 ↔ 12,0 s, ohne Start-Dorf 14,0 ↔ 14,0 s).
- Der Satz selbst ist billig (Gruppen-Bau 0,2–0,35 s, Ofen 0,1 s); teuer ist der Erst-Bau der gelieferten Stoffe im Lade-Bild: 50 Programme 3,31 s, darin der Diät-Gang je neuem Programm `_diaetGang` 1,50 s Selbstzeit (die `for … in`-Zeile bild-kosten.js:3575; B4 maß nach `Object.keys` 1 482 → 9 ms) · Karten 1,39 s · Sichthöhe 0,79 s · Hülle 0,81 s.
- Außer Blick vor dem Bild nur ≈ 1,0 s (Pflanzung 0,43 · Boden-Chunks 0,35 · Sichthöhe 0,18). Das Start-Dorf kostet den Haupt-Faden +2,6 s (B 16,6 ↔ E 14,0 s, `roh/profil-B.md`, `roh/profil-E.md`), der ganze Ort +3,4 s, davon `_diaetGang` +0,78 s (`roh/profil-diff-ohne-ort.md`).

## Die Platte (`roh/tafel-platte.md`, `zahlen.md`)
- **Zweit-Boot trifft:** 107–109 von 108–110 Lieferungen von der Platte → Weltbild 11,98 (11,82–12,14), Leib 6,49 (6,32–6,75) (P2b–P4b, Spielstand gelöscht).
- **Die Versions-Stufe trifft auch:** `bump-version 18.546.90` → 107–110 von 108–111 → 12,81 (12,56–13,12), Leib 7,29 (+0,8 s HTTP-/Code-Cache). Der `?v=` macht NICHT kalt — kalt macht nur ein geänderter Kern, die Brücke oder das Manifest. PFLICHT-OFFEN B („IDB geleert, wie nach jedem Versions-Update") trifft nicht zu.
- Nie auf der Platte: Blatt-Atlas (warm w0 bis 4,50 → der L0-Treffer kommt erst 5,13), Dorf-Export (warm 2,6 s), Karten. Nebenbefund P1 (Profil MIT Spielstand): der Boot gießt die gespeicherten Tiere synchron im init (`_restoreCreatureFromSnapshot` → `bakeTierInstance`) 3,1 s (`roh/P1c-fenster-1.9-6.2s.txt`).

## WURZEL
EIN Chokepoint: **die EINE Worker-Schlange** (`_foundryAuftrag`/`_foundryPumpe`/`_foundryAuftragD2`, studio-bruecke.js:952–1040). Klasse **„Lieferung ohne Bild-Rang"**: sie ordnet nach Abstand und Kegel, nie nach dem Bedarf des ersten Bilds — die Köpfe der Ankunfts-Ketten (Dorf-Export, Leib) laufen spät und im geteilten FIFO, ortloser Bedarf einer Lücke im Blick steht auf ∞, und Detail, das das Bild nicht zeigt, belegt vor ihm 10,8 von 22,6 s Faden-Arbeit.

## Der Schnitt (Stamm, EIN Wurf)
1. **Rang = Bild-Bedarf** (`_foundryAuftragD2`): 0 für die Köpfe — Start-Dorf-Export und Leib-Grobstufe gehen beim Buch (`_foundryIngestBook` :214, für das Dorf über `_autoSettlementSpawnCell`) in eine Bahn ohne Wartende dahinter (w0 malt bis ~4,2 s den Atlas: die Köpfe gehen in die Helfer); ein ortloser Auftrag erbt den Ort seines Lesers (Nah-Wiese → Spieler, Gesetz-Fit → `tf` der Zelle) und ist im Blick, nie ∞.
2. **Detail nach dem Bild** über das EINE Ereignis `_weltbildKommt` (koerper-bewegung.js:1830, wie Vorrat und Ofen-Vorrat): Leib-L0, Wurf-Stufe, Karten-L1 außer Blick. Das Tor liest denselben Bedarf: „leib" steht mit der Grobstufe L1 (L0 tauscht danach), „bauten" zählt die Ankunfts-Stufe ohne ihren Wurf-Zwilling.
3. **Was stirbt:** Rang ∞ ortloser Bild-Aufträge · das Warten der Ankunfts-Stufe auf ihre Wurf-Stufe vor dem Bild (`if (fw === null) return null`, studio-gestalt.js:851) · das Warten des Leibs auf L0 (`_leibBereit` über `steht` beider Vorlagen) · der Export hinter fremden Aufträgen im FIFO. Kein zweiter Ankunfts-Pfad, `_weltbildSteht` bleibt der EINE Schreiber; kein Zug blockiert den Haupt-Faden (der B4-Bruch).
4. **Ziel (zu messen):** Leib kalt 10,46 → ≈ 5 s (L1 an 4,23 + 1–2 Lade-Bilder); bauten 16,07 → ≈ 12 s; Weltbild kalt Richtung E-Niveau 14,0 s.

## Der Beweis-Plan
- GTX `diag-boot-stage --kalt --echt` ≥ 4 je Seite ABAB mit demselben Instrument (die drei Patches + profil-patch), Auswertung `auswertung-b5.cjs`, `zahlen-b5.cjs`, `bedarf.cjs`, `faden-bahn.cjs`: t(Weltbild), t(Leib), Dorf-Kette, Warte der ortlosen Aufträge (→ 0), Faden-Σ vor dem Bild (→ ≤ 12 s).
- „Ohne halbes Weltbild": `bild-diff.cjs` vorher ↔ nachher im Rauschen (≤ 2,1 %), Blick auf das Dorf-Haus im Tor-Spalt und die Tore; ein Third-Bild für den Grobstufen-Leib; der Wurf kommt im Nachlauf (`_rundumDa`). Zweit-Boot und Versions-Stufe je 3 nicht langsamer.
- Lauf-ABAB „nicht langsamer" (Wiese + Genesis Ego, stehend + gehend), `npm run check`, `npm run playtest:fast`, voller Playtest (Stamm-Schnitt), gate:ankunft L2a.
- Linse: ein ortloser Auftrag, auf den eine Lücke im Blick wartet, ist vor dem Bild ROT beim Namen (die Stapel-Probe des Instruments, Familie gate:ankunft).

## Was ehrlich offen bleibt
- B ≤ 5 s fällt mit B5 nicht: selbst mit allen Lieferungen in Millisekunden (Zweit-Boot) steht das Bild bei 12,0 s — der Haupt-Faden trägt Boden-Ring (Ring 1 → 2 von 4,0 bis 10,6–13,5 s, `roh/ring.txt`), Horizont (+0,8–1,5 s), Erst-Bau 2,4–3,3 s (die `_diaetGang`-Zeile 1,0–1,5 s) und die Karten (1 je Lade-Bild).
- Kalt bleibt die Faden-Arbeit des Bilds (≈ 12 s ohne Detail) live; „ausgeliefert" (Pack-Pfad spec/pack/v0 §v1.5) ist nicht gebaut. Atlas, Export, Karten nie auf der Platte.
- Die Ziel-Zahlen sind Ableitungen aus E/D und den Ketten, nicht gemessen; was die 1,7 s zwischen Buch und Dorf-Export hält (Ort-Wahl?), ist ungemessen; ob die Grobstufe den Leib in Third trägt, prüft der Schneider am Bild. Radeon ungemessen.
