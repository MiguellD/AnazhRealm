# Lesen (h): Studios gegen die Welt — main 18058dba

**Feld** (Zeilen): fachwerk-core.js 12442 · worlds/fachwerk/fachwerk.js 1134 · stamm/siedlung-ort.js · stamm/siedlung-satz.js ·
stamm/studio-gestalt.js · stamm/siedlung-wege.js · stamm/bau-vorlagen.js 2123 · stamm/bau-teile.js 3066 · stamm/bau-buch.js 3014 ·
stamm/werkstatt-bauen.js 3766 · stamm/studio-stoff.js 891 · foundry-bruecke.js 1052 · foundry-core.js 10344 · cores.manifest.json 66 ·
worlds/huelle/huelle.js 2481. Kurz geprüft, bauen KEIN Gebäude: garage.js 758 (Fahrzeug), skeleton.js 122 (nur Handschlag),
neuntes-buch/stele-core.js 380 (Stele, Fixture außerhalb des Manifests, Kopf Z.1–8), foundry-core.js (Pflanzen-Kern, Kopf Z.1–6).
Bauteile außerhalb des Hauses bauen nur portale (porta-core, Tore) und schmiede (schmiede-core, Arena) — nicht Teil dieses Blatts.

**Kurzbefund.** Studio und Welt rufen DIESELBE Haus-Fabrik `HAUS` (fachwerk-core.js:168), und das Dorf der Welt wächst wirklich aus
EINEM Samen: `DORF` würfelt Kultur, Maße, Geschosse, Keller, Anbau aus seinem Strom und reicht den vollen Vektor als `slot.ov` bis in
`buildInstance`. Aber nur 28 der 51 Kern-Parameter erreicht die Welt, davon 10 direkt aus dem Samen-Strom, 12 nur als fester
Kultur-Wert, 19 Maße der Fabrik (Geschosshöhen, Holzquerschnitte, Überstände, Tür) setzt NIEMAND — sie sind in jedem Haus der Welt
gleich. Die Ferne der Stadt umgeht den Kern ganz (`hausMasse`: eigene Geschosshöhe 2,7 m, nur Kasten + Satteldach), und der Weg
Studio → Welt verliert Figur, Stil, Dachtyp, Bogen, Grundriss und Farbe (nur die 21 Zahlen-Regler reisen).
Das Raumprogramm (`bauProgramm`, Leute → Haus) läuft nur im Studio; die Welt rechnet umgekehrt (Haus → Leute, `leuteVon`).

## (1) DIE ZWEI WEGE

**Studio-Weg (Editor, Stufe „voll live“)**
1. Kultur-Wahl `pK` → `applyKultur` → `bauRezept({bauweise}, null, SEED)` → Regler + Wahl-Felder + `tintM(col)` — worlds/fachwerk/fachwerk.js:32–43
2. Haushalt-Regler `leute`/`wohl` → `applyMeta` → `bauRezept({nutzung:'wohnhaus',los},{personen,wohl},SEED)` → nur W, D, storeys,
   annexN, balcony, grundriss zurück in die Regler — fachwerk.js:626–632 (keller/turm/leute des Programms fallen hier weg)
3. Regler-Tafel RW aus `FC.PARAMS_BY_KIND.haus` (21 Zeilen) — fachwerk.js:805, 841
4. `readParams` = 21 Zahlen + brace/grundriss/stil/dachTyp/bogenTyp + terrain (Checkbox) + seed — fachwerk.js:819–824
5. `buildHouse` → **`HAUS(THREE,mat,params)` direkt**, `build({gelaende:false})`, die Parzelle (`gelaende`) daneben — fachwerk.js:721
   (kein `buildInstance`, kein Bake, kein `stapelBau` über 11 Geschosse)
6. Kosten-Leiste: `FC.buildInstance(id,SEED,s,ov)` mit ov = NUR die 21 Regler — fachwerk.js:848
7. Übergabe an die Welt (`werk`): `{kind:'haus', preset, seed:SEED, ov:21 Regler}` — fachwerk.js:1134–1143

**Welt-Weg (Dorf / Stadt-Kachel)**
1. `exportSettlement(dp)` → `DORF({seed,nH,epoche,erbe})` — fachwerk-core.js:9722, 9733
2. je Los: `bauRezept({bauweise:kn},null,hs)` + Würfe des Plan-Stroms (W, wohl, storeys, keller, annexN, arm, balcony, grundriss) —
   fachwerk-core.js:4435–4449; Rollen über `BAU_NUTZUNG.mass` (2182–2201), Kirche (4462), Burg (4473–4474), Viertel (4376–4401)
3. `massBauExport(hp)` → `massBau` → `stapelBau(MASSNUR)` (Hülle, Tür, Kamin, Grund) — 9659–9668, 5834–5853
4. Layout + `reihenSnap` + `brandwand` (schreibt `hp.brandwand`) — 9825–9833; Ton der Lage `stadtTonAn` → `hp.col` — 9847–9855
5. `hausSlot` → `hausZeile`: `ov: JSON.parse(JSON.stringify(hp))` (der VOLLE Vektor) — 5908–5932
6. Wirt: `_spawnSettlementSlot` → `_slotBauplan` (`haus_<kultur>`) → `spawnArchitecture(…, {studioOv: slot.ov})` — stamm/siedlung-ort.js:450, 488, 517–536, 2294–2298
7. Stempel `_stempelVon` (JSON ≤ 8192 Zeichen) → `entry.studioOv` — stamm/siedlung-bauten.js:3437–3447, siedlung-satz.js:1377–1378
8. Gestalt: `_foundryGestaltFor` → `_foundryVariantFor` (1..V aus Ort+Same) — stamm/studio-gestalt.js:967–1002, 1222
9. Worker: `buildInstance(presetId, seed, lod, msg.ov)` — foundry-bruecke.js:882–893
10. Kern: `hausParams(pre, ov)` (PARAMS-Defaults → Rezept s/fx → ov) — fachwerk-core.js:5814–5828; **`ov.seed` überstimmt das
    Gestalt-Argument** (6330) → Stufe 0 `stufe0Bau` = `HAUS`/`stapelBau` + `bakeLOD` (6140–6147, 6230); Stufe 1/2 `massBau`+`fragFuer`
    (6241–6242); Stufe 3 `planBau` (6239, 5879)
11. Ferne der Stadt (nicht wache Kachel / jenseits Nah-Ring): `kachelMassen` bzw. `planMassen` → `hausMasse` → InstancedMesh-Kiste +
    Dach — fachwerk-core.js:4074–4137; stamm/siedlung-wege.js:2050–2063, 2223–2257

## (2) DIE PARAMETER DES KERNS

Spalte „Welt“: Q = Quelle. **S** = Samen-Strom des Plans (`DORF` rnd / `_bauweiseWurf`), **K** = fester Wert der Kultur-Tafel (die
Kultur zieht der Samen aus dem Pool, der Wert selbst ist je Kultur fest), **R** = Rollen-/Lage-Gesetz (BAU_NUTZUNG, Kirche, Burg,
Layout), **F** = fest, **—** = nie gesetzt (Default). Studio „ja“ = Regler/Wahl in fachwerk.js:819–824.

| Parameter | Default (Datei:Zeile) | Studio setzt? | Welt setzt? (Datei:Zeile, Q) | Urteil |
|---|---|---|---|---|
| W | 9 (core:5731; HAUS 171) | ja, Regler | 2208 Wurf ± 1,1; 4437/4439 Ring+wohl; 4491–4493 Stadt-Form; S | FOLGT |
| D | 7 (5732) | ja | 2209; 4493; S | FOLGT |
| storeys | 2 (5733) | ja | 2210; 4441–4445; 4456; S | FOLGT |
| pitchDeg | 50 (5737) | ja | 2207 Kultur ± 2,5°; 2230 Grenzneigung; S | FOLGT |
| bend | 0 (5734) | ja | — (kein Setzer in KULTUR/DORF/BAU_NUTZUNG) | GESETZT (Default) |
| terrAsym | 0 (5735) | ja | — | GESETZT (Default) |
| doppel | 0 (5736) | ja | — (die Welt nimmt `brandwand`, s. (4)) | GESETZT (Default) |
| hip | 0 (5738) | ja | 2211 `k.hip`, 2 Kulturen; K | GESETZT (Kultur) |
| roofCurve | 0 (5739) | ja | 2211 `k.curve`, 2 Kulturen; K | GESETZT (Kultur) |
| treppgiebel | 0 (5740) | ja | 2212, 2 Kulturen; K | GESETZT (Kultur) |
| kuppel | 0 (5741) | ja | 2212 (barock 2152); Kirche 4461; K/R | GESETZT |
| annexN | 0 (5742) | ja (+applyMeta 630) | 4446 rnd<0,25; BAU_NUTZUNG; S/R | FOLGT |
| balcony | 0 (5743) | ja | 4448 wohl+rnd; S | FOLGT |
| portikus | 0 (5744) | ja | 2212, 1 Kultur; zunfthaus 2189; K/R | GESETZT |
| arkade | 0 (5745) | ja | gasthaus/rathaus/kontor 2184–2188; Kirche roemisch 4461; R | GESETZT (Rolle) |
| turm | 0 (5746) | ja | rathaus 2186; Kirche 4461; Burg 4474; R | GESETZT (Rolle) |
| zinnen | 0 (5747) | ja | rathaus/bergfried/torhaus 2186–2193; Burg 4474; R | GESETZT (Rolle) |
| veranda | 0 (5748) | ja | viktorianisch 2140; gerberei 2198; K/R | GESETZT |
| vorkragung | 0 (5749) | ja | kaufhaus/werkstatt bei stil 'alt' 2187, 2195; R | GESETZT (Rolle) |
| pilotis | 0 (5750) | ja | 2213 `k.pilotis?1:0` — keine Kultur trägt es → immer 0 | GESETZT (tot in der Welt) |
| terrasse | 0 (5751) | ja | pueblo 2145; K | GESETZT (Kultur) |
| brace | 'andreas' (HAUS 173) | ja, `pB` | 2211 `k.brace` (32 Kulturen); K | GESETZT (Kultur) |
| stil | 'alt' (HAUS 188) | ja, `pStil` | 2211; Moderne glas/klinker rnd 4456; Halle 4459; K/S | GESETZT, Moderne FOLGT |
| dachTyp | 'sattel' (2214) | ja, `pDachTyp` | 2214 (0 Kulturen tragen ihn); Turm 'flach' 4457; K/R | GESETZT |
| bogenTyp | 'none' (2214) | ja, `pBogenTyp` | 2214, 4 Kulturen; K | GESETZT (Kultur) |
| grundriss | 'I' (2214; HAUS 510) | ja, `pG` (+applyMeta 631) | 4449 rnd I/L; Rollen 'I'; S/R | FOLGT |
| col | DEFCOL (2162) | via Kultur `tintM` (40) | 2215 Kultur; `stadtTonAn` 9854; K/R | GESETZT, Lage FOLGT |
| seed | 3 (HAUS 177; LAB_SEED 5770) | ja, SEED | 4436 `hs`; reist in ov, überstimmt Gestalt 6330; S | FOLGT |
| terrain | 0 im Kern (5815) | ja, Checkbox (821) | 4436 `p.terrain=0`; F | GESETZT (fest 0) |
| keller | an (HAUS 212) | nein (applyMeta verwirft) | 4446 rnd<0,35; S | FOLGT |
| arm | — (Daten) | nein | 4447 wohl<0,72; liest `stufe0Param` 6138; S | FOLGT |
| brandwand | — (Daten) | nein | `brandwand(...)` 9828; R (Layout) | GESETZT (Lage) |
| wing | 1 (HAUS 175) | nein | — (nur Fallback-Grundriss 510) | GESETZT |
| jetty | 0 (HAUS 171) | nein | — ; **kein Leser** in HAUS | TOT |
| foundH | 0,55 (HAUS 178) | nein | — | GESETZT |
| egH | 2,55 (178) | nein | — | GESETZT |
| ogH | 2,35 (178) | nein | — | GESETZT |
| post | 0,16 (179) | nein | — | GESETZT |
| sill | 0,18 (179) | nein | — | GESETZT |
| raehm | 0,16 (179) | nein | — | GESETZT |
| balkenB | 0,15 (179) | nein | — | GESETZT |
| balkenH | 0,21 (179) | nein | — | GESETZT |
| spar | 0,10 (180) | nein | — | GESETZT |
| sparH | 0,15 (180) | nein | — | GESETZT |
| pfetteB | 0,14 (180) | nein | — | GESETZT |
| pfetteH | 0,18 (180) | nein | — | GESETZT |
| bayMax | 1,7 (181) | nein | — | GESETZT |
| ovEave | 0,42 (181) | nein | — | GESETZT |
| ovRake | 0,32 (181) | nein | — | GESETZT |
| doorW | 1,1 (181) | nein | — | GESETZT |
| doorH | 2,05 (181) | nein | — | GESETZT |

Beleg „nie gesetzt“ der 19 Fabrik-Maße: außer der Default-Zeile HAUS 170–182 kein `egH:`/`foundH:`/`ovEave:` … in fachwerk-core.js,
stamm/*.js oder fachwerk.js (Grep über alle drei). Die Kultur-Tafel KULTUR (2121–2154) trägt nur pitch/W/D/st/brace/stil/col und
vereinzelt hip, curve, treppgiebel, kuppel, portikus, veranda, terrasse, bogenTyp, grundriss.

## (3) WO DIE WELT DEN KERN UMGEHT

1. **Die Masse der fernen Stadt (Zwilling der Haus-Höhe).** `hausMasse`: Traufe = storeys × `geschossM` 2,7 + `sockelM` 0,5,
   First = tan(pitch)·D/2, flach ohne First — fachwerk-core.js:4072, 4119–4120. Der Kern baut mit foundH 0,55 / egH 2,55 / ogH 2,35
   (HAUS 178, Ebenen 214). hip, roofCurve, kuppel, turm, zinnen, grundriss (L/U/Hof), annexN, terrasse, bend, vorkragung liest
   `hausMasse` nicht. Leser im Bild: stamm/siedlung-wege.js:2237–2247 (Kiste + Dach je Haus, Wirt-Konstante `STADT_FERNE.sockelM`
   2,5 / `ueberM` 0,5, siedlung-wege.js:2975–2986). Dritte Höhen-Konstante im Kern: `PROXYHAUS` sh 2,75 (4542).
2. **Die Lose der fernen Kachel (Zwilling des Layouts).** `kachelMassen` nimmt die Häuser von `DORF`, setzt sie aber auf eigene
   Kandidaten an den Block-Kanten des Netzes (`einzugM`, `platzM`, `eckeM`) und klemmt W/D auf den Platz — fachwerk-core.js:4085–4113;
   der Wirt sagt es selbst: „die Häuser der Stufe 2 stehen auf demselben Netz an anderen Losen“ (siedlung-wege.js:2021–2022).
   Beim Erwachen springt jedes Haus von seinem Kachel-Platz auf sein `dorfLayout`-Los.
3. **Die Substanz jedes Hauses (fester Kasten).** `haus_basis`: 6,4 × 4,8 × 3,1 m aus sechs Boxen — stamm/siedlung-satz.js:1890–1936;
   Spender jedes `haus_<kultur>` (KIND_POLICY stamm/studio-bruecke.js:3768–3770, Klon 556–562). Leser: `_structureSpawnPos`
   (Abstand zum Spieler, siedlung-satz.js:716–721) und das Phantom des Bau-Modus (werkstatt-bauen.js:628). Seed-unabhängig — der
   Kern kennt die echte Hülle (`massBau.ext`, core 5842).
4. **Die Substanz der Dorf-Ausstattung (Maße von Hand kopiert).** `brunnen_dorf`, `marktstand_dorf`, `laterne_dorf`,
   `wandlaterne_dorf`, `grabstein_dorf` tragen Box/Zylinder-Teile „in ihren Maßen“ (Kranz Ø 1,84, Pfosten ±1,05, Tisch 2,0 × 0,9 …)
   — stamm/bau-vorlagen.js:1064–1262; die Gestalt baut der Kern (`studioGestalt`, z. B. 1074, 1137). Die Bau-Wand runder Bauten
   liest den Radius aus DIESEN Teilen (`_bauFreiRund`, stamm/siedlung-ort.js:402–404), nicht aus der Gestalt des Kerns.
5. **Studio-seitig: der Editor umgeht den Vertrag.** Stufe „voll live“ ruft `HAUS` direkt (fachwerk.js:721): ohne `stufe0Param`
   (Möbel aus ab 6 Geschossen, core 6138), ohne `stapelBau` über 11 Geschosse (core 6141), ohne Bake; die Welt sieht immer
   `buildInstance`. Was der Schöpfer im Editor sieht, ist bei storeys 12 ein anderer Bau als in der Welt.
6. **Studio-seitig: das Labor-Dorf.** `buildDorf`/`promoteBauen` (fachwerk.js:99–104, 213) bauen eigene Streaming-Stufen; der
   Abgleich zum Export ist ein fail-closed Positions-Vergleich (fachwerk.js:184–192), kein gemeinsamer Bau-Pfad.

## (4) DETAILS, DIE NICHT TRAGEN

**Der Kern kann es, die Welt ruft es nie**
- **Raumprogramm** `bauProgramm` (core 2245–2276): läuft nur mit `haushalt` (2229); alle acht `bauRezept`-Rufe der Welt geben `null` als Haushalt
  (4381, 4382, 4398, 4436, 4450, 4462, 4468, 4473; Grep stamm: 0 Rufe). Nur das Studio ruft es (fachwerk.js:629). Die Welt rechnet
  umgekehrt: `leuteVon` leitet die Leute aus W·D·storeys ab (core 9527–9537, Leser stamm/siedlung-bewohner.js:779, 839).
- **Hof** `hofFuer` (core 3513–3560: Holzstapel bei Armut/Alter, Beete, Wäscheleine, Efeu vor 1800, Kisten am Gasthaus, Tränktrog
  der Schmiede): Kopf (a) „reist NICHT in buildInstance“ (core 44–47); Grep stamm/foundry-bruecke: 0 Leser. `baujahr` und `arm`
  erreichen das Bild nur hier — in der Welt also nie.
- **Parzelle** `gelaende` (HAUS 1488): die Welt baut `build({gelaende:false})` (core 6145) und zwingt `terrain:0` (5815; Kopf (c) 50–52).
- **bend, terrAsym, doppel, pilotis**: die Welt setzt sie nie (Tabelle); das ganze Verformungs-Feld samt Sehnen-Schritt
  (`__sehne`, core 6339–6348) läuft in Dorf und Stadt nur mit bend 0. Erreichbar nur über ein vom Spieler gesetztes Studio-Werk.
- **Figur, Stil, Dachtyp, Bogen, Grundriss, Farbe des Studios**: `werk` reicht nur die 21 Zahlen (fachwerk.js:1139–1143); die Welt
  füllt sie aus `PRESETS[k].fx` am LAB_SEED 3 (core 5795–5804, 5818). Wer im Studio `pB`/`pStil`/`pDachTyp` umstellt, sieht in der
  Welt die Figur der Kultur. Ebenso misst die Kosten-Leiste ein anderes Haus als der Editor zeigt (fachwerk.js:848).
- **Haushalt-Ergebnis im Studio**: `applyMeta` übernimmt nur W, D, storeys, annexN, balcony, grundriss (fachwerk.js:630–631);
  `keller`, `turm`, `leute`, `programm` aus `bauProgramm` (2271–2274) verfallen.

**Gerufen, aber ohne Leser bis zum Bild**
- `jetty` (HAUS 171): Default ohne einen einzigen Leser (P.jetty 0× im HAUS-Leib 168–1810).
- `PROXYHAUS` (core 4542, exportiert 12399): einziger Leser `proxyGroup`, in fachwerk.js:52 und :59 zweimal definiert und nie gerufen.
- `wohl`, `programm`, `leute`, `viertel`, `turmbau`, `sektor`, `mark`, `parent` reisen im `slot.ov` (5923) in den Worker, aber `HAUS`
  liest keinen davon (Liste der P-Schlüssel HAUS 168–1810: kein wohl/turmbau/sektor/mark/viertel); `wohl` wirkt nur über W (4439).
- Die Gestalt-Zahl des Dorf-Hauses (`_foundryVariantFor`, studio-gestalt.js:999) erreicht den Bau nicht: `ov.seed` aus `DORF`
  überstimmt sie in `buildInstance` (core 6330).
- 19 Fabrik-Maße (Tabelle): gerufen in jedem Haus, aber konstant — kein Samen, keine Kultur, keine Epoche ändert Geschosshöhe,
  Holzquerschnitt, Dachüberstand oder Türmaß. Im Nah-Bild sichtbar, aber nicht „gewachsen“.
- In der Ferne der Stadt sind alle Dach-/Grundriss-Details (hip, kuppel, turm, zinnen, L/U/Hof, Anbau) unsichtbar: `hausMasse`
  (4119–4120) kennt nur Kiste + Satteldach.
- Die Mass-Probe Studio = Welt `gate:studio-huelle H9` vergleicht nur die Box-Maße (huelle.js:1659, Urteil 2 % des Halbmessers):
  Figur, Stil, Dachtyp, Bogen, Farbe gehen durch, ohne dass sie Rot sieht.

Kern-Parameter 51 · davon von der Welt gesetzt 28 · davon aus dem Samen 10 (weitere 12 fest je Kultur, die der Samen wählt) · Umgehungen 6 (4 der Welt, 2 des Studios)
