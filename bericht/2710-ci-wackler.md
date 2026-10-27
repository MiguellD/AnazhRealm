# Karte ci-wackler-zensus — die CI-Wackler beim Namen (27.10.)

## Abgabe (≤ 12 Zeilen)

Zwischenstand, Spiel `ci-wackler-zensus` caa1b446 (CI 40532297546), Koord `ci-wackler-zensus-koord`.
- Zensus: 307 Läufe, 367 Versuche, **56 Wackler-Fälle in 18 Schritten**; 29 davon lagen vor schon gelandeten Schnitten (Kamera-Leib 12, Werkstatt-Weg 6, Kopf 5, Portal 3, Werk im Wasser 3).
- **WebGL2-Rückfall (5)**: Täter `scripts/diag-webgl-probe.cjs:89` (60 Takte nach 6 s Schlaf; der Fern-Faden hatte unter Last noch nicht geantwortet). Schnitt: `__weltDa` bis cursor > 0. 2 Kerne × 3, swiftshader: vorher 3/3 ROT (cursor 0), nachher 3/3 GRÜN (cursor 512–3072).
- **Stand-Takt (3)**: Täter im Spiel `stamm/dirigent-takt.js` `_weltOffen` ohne Horizont (Welt „steht“, während Fern-Scheiben fliegen; danach geht die Saum-Wache). Schnitt: `o.horizont`, dazu in `diag-stand-takt.cjs` `bisRuhe` und fünf feste 600/2000-Fenster über `__gebautNach`. Last: vorher 0/3 (311–314 s), nachher 7/9 GRÜN (273–334 s). **Halb**: offen sind TREUE-TÄTER deckWache (1/9) und RUHE-TAT (1/9).
- **Mehrspieler-Wand (3)**: Täter `scripts/diag-mp-sync.cjs:922` `sturmSprung(1)` (A landete im Zug von B; im Kern `wetterAt` über 2000 Züge blind in 10,6–12,2 %). Schnitt: `sturmSprung(3)`, blind in 0, Abstand ≥ 2 Züge. Last: vorher 0/3, nachher 1/3. **Offen**: beide Seiten fallen vorher an „A kennt B ohne Leitung“ (180 s protocolTimeout), Täter im Netz-Code nicht gefunden.
- **Punkte-Maschine BAHNEN**: `punkte.cjs`: `bis` wartet am lebenden Lauf, der Stub auf Tür oder Partner („X“, wenn er nie stand), der Plan-Deckel 3600 s ist nur noch Wächter. Last: vorher 3/3 ROT (61/66), nachher 3/3 GRÜN (66/66).
- Wände: apparat · welt-boot · atlas --check · stamm:lint · check · mp-sync · webgl-probe (`[linse-gpu] webgl2/SwiftShader`) · stand-takt, je EXIT=0; main 9fa32207 gemergt; Decke scripts −4 Atome.

## Der Zensus (aus der API, nicht aus Erinnerung)

Quelle: `GET /repos/MiguellD/AnazhRealm/actions/workflows/check.yml/runs` seit 24.10. 13:50 UTC (3 Tage, Zeiten in UTC), je Lauf jeder Versuch
(`/runs/{id}/attempts/{n}/jobs`): **307 Läufe, 367 Versuche, 90 SHAs mit mehr als einem Versuch**. Ein Wackler ist ein Schritt, der
an einem SHA im Versuch n rot war und im nächsten Versuch desselben SHA (Neulauf oder Folge-Lauf), der ihn wieder fuhr, grün.
**56 Wackler-Fälle in 18 Schritten.** Die Fehler-Zeile stammt aus dem Job-Log des roten Versuchs (`/jobs/{id}/logs`).

| Fälle | Schritt | Gruppen | Zweige (Auswahl) | Fehler-Zeile | Stand |
|---:|---|---|---|---|---|
| 12 | Kamera-Leib-Linse (K06) | voll 13, 14, 18 | integ-probe, avatar-stand, fzk3-drift, tk1-herde, sk2-zipf2, bau-faden, ek-schleife | `diag-kamera-laub.cjs ABSTURZ: TimeoutError: Navigation timeout of 60000 ms` / Deckel | geschnitten (ci-kamera-leib, main 6b2a8ac9): alle 12 Fälle vor dem Schnitt |
| 6 | Werkstatt-Weg-Linse | voll 18 | temperatur-eine-quelle, gelaende-k5-huf, tiere-k1-s2, fahrzeug-k1-reifen | `L-Werkstatt jeder Weg … in ≤ 3 Schritten` | geschnitten (werkstatt-weg-ereignis, 25.10. 02:36 UTC); letzter Fall 25.10. 00:35 UTC |
| 5 | Ein Urteil je Kopf (kopf) | kopf | claude/*, bewohner-gesetz | 4× `der Kopf trägt ein rotes Urteil: Lauf …` (Folge-Rot eines anderen Laufs), 1× `502` der API | Folge-Rot zählt beim Täter; der 502 geschnitten (ci-kopf-502, 26.10.) |
| 5 | **WebGL2-Rückfall** | voll 15, 17, 18 | integ-probe, ek-schleife | `W4: der Fern-Ring verfeinert nicht (da=true, cursor=0)` | **hier geschnitten** — alle 5 am 27.10. |
| 3 | **Mehrspieler-Wand** | voll 13, 16, 17 | integ-probe, ek-schleife | 2× vor mp-wackler ((d) 0 Takte, (b) Rejoin); 1× nach ihm: `(e)(f) Selbsttest … zug gleich` | **hier geschnitten** (der Uhr-Selbsttest) |
| 3 | Der Körper steht, wo das Auge ihn sieht | voll 10, 11 | linsen-anker, avatar-stand, integ-probe | `K8 fein hang: p95 16,5–31,4 cm (Soll ≤ 5)` | OFFEN, gleichauf mit Platz 2 (letzter Fall 26.10. 11:55 UTC) |
| 3 | Portal-Konformanz | voll 14, 15 | tk1-herde, integ-probe, pruef-kurz-c | `ABSTURZ: K8 werk: die Garage reicht kein Werk in die Welt` | geschnitten (ci-portal-konformanz, main a3981e72): alle 3 vor dem Schnitt |
| 3 | **Stand-Takt (Welle K)** | voll 5, 13 | sk2-zipf2, mk2-mikro, integ-probe | `STUFE: 2 Stufen-Wechsel ohne Form-Änderung wecken deckWache (4992 Einheiten)` · `GEHEN: der Saum geht ohne neuen Anker (3712)` · `FIXPUNKT: … deckWache (_fernRingDeckWache) ohne Eingabe noch 6528 Einheiten in 51 von 150 Takten` | **hier geschnitten** — 9fa32207 (main heute) darunter |
| 3 | Werk im Wasser | voll 1, 11, 13 | integ-probe, ek-schleife, mp-wackler | `D: der Stausee des Damms #2 … bildet sich nach dem Reload nicht neu — 1072 statt 1142` | geschnitten (16ab2c23, main 4f662516): alle 3 vor dem Schnitt, seitdem 0 |
| 2 | Ankunfts-Linse | voll 1 | integ-probe, siedlung-k3-heil | `L2a das erste Bild ist der Ladeschirm, er weicht dem Weltbild …` | seit 25.10. 03:46 UTC nicht mehr gesehen |
| 2 | Fahr-Linse des Lebens | voll 8 | integ-probe | `S3 Querhang: … Quer-Abdrift talwärts 0.28 m` | seit 25.10. 10:40 UTC nicht mehr gesehen |
| 2 | Prägung-Welt | voll 10, 12 | integ-probe, fk1-ton | `BAU-HASH A ↔ B byte-gleich, der Stempel wirkt — A=9c183437 B=515787a7 ohne=515787a7` · `B: Stempel und Same reisen tief gleich` | OFFEN |
| 2 | Kreatur-Linse Teil 1 | voll 4, 7 | integ-probe | `bewohner … leer: kirche gotisch #613181: 0 von 1` | OFFEN |
| 1 | Persistenz-Härtung Teil 2 | voll 12 | oekologie-k1-kaskade | `pageerror: Cannot read properties of null (reading 'getSupportedExtensions')` | OFFEN |
| 1 | Persistenz-Härtung Teil 1 | voll 8 | mk2-mikro | `(D) jeder Stand des Speicher-Fadens ist die volle Serialisierung: architectures` | OFFEN |
| 1 | Welt-Wache | voll 8 | mensch-k3-wege | `TypeError: Cannot read properties of null (reading 'toFixed')` | OFFEN |
| 1 | Frost-Wand auf der Karte | echt | integ-probe | `T2 die Bild-Probe erkennt das stehende Bild — 100.00 % der Blöcke bewegt` | OFFEN (GPU) |
| 1 | Ego-Schatten | voll 18 | tk1-herde | (Job-Ende, keine Zeile) | OFFEN |

Von den Kandidaten des Koordinators: Stand-Takt (3) und Mehrspieler-Wand (3) sind Top 3; Prägung-Welt (2) und Persistenz Teil 1 (1)
liegen darunter; Werk im Wasser kam seit 16ab2c23 nicht mehr vor.

**Die Top 3 der lebenden Wackler** (die schon geschnittenen ausgenommen): WebGL2-Rückfall 5, Stand-Takt 3, Mehrspieler-Wand 3.
Gleichauf mit 3 steht „Der Körper steht“ (K8 fein hang). Gewählt sind Stand-Takt und Mehrspieler-Wand, weil beide am 27.10. auf
frischen Köpfen fielen; der Körper fiel zuletzt am 26.10. Er bleibt OFFEN, mit Name.

## Die Schnitte

Last-Nachbau auf dem Laptop: je Batch 3 Läufe parallel, jeder Prozess samt Chrome auf die logischen Kerne 0,1 gepinnt (PowerShell `ProcessorAffinity = 3` direkt nach dem Start; Chrome erbt die Maske, geprüft: 25 von 25 Chrome-Prozessen mit Maske 3). Vorher = main 9fa32207, nachher = der Zweig, nacheinander unter derselben Last.

| Schritt | vorher | nachher | Fehler vorher |
|---|---|---|---|
| WebGL2-Rückfall (`LINSE_GPU=software`) | 3/3 ROT, 31 s | 3/3 GRÜN, 31 s | `W4: … cursor=0` (die CI-Zeile) |
| Stand-Takt | 3/3 ROT, 311–314 s | 3/3 · 2/3 · 2/3 GRÜN, 273–334 s | TREUE deckWache · ORT Erdbau heilt nicht · STROM verhungert · NACHSCHUB |
| Mehrspieler-Wand | 3/3 ROT | 1/3 GRÜN | `A kennt B … keine Leitung (Waiting failed)`, vor dem Selbsttest (e)(f) |
| punkte.cjs selbsttest | 3/3 ROT 61/66, 749–753 s | 3/3 GRÜN 66/66, 1001 s | die fünf BAHNEN-Fälle |

1. **Der Horizont im Faden** (`_weltOffen`, Spiel): `o.horizont` = Scheiben und Edit-Aufträge des Fern-Rings im Flug + Antworten vor dem Einhängen + Ring nicht ganz. Erst wenn das 0 ist, „steht“ die Welt. Die drei CI-Fälle (STUFE 4992, GEHEN 3712, FIXPUNKT 6528 Einheiten der deckWache) sind genau die erste Runde der Saum-Wache, die nach dem späten letzten Scheiben-Einhängen begann. Der Grund steht beim Namen in `_weltStandTakt` („Horizont offen n“).
2. **Das EINE Warten der Stand-Linse**: `bisDa` ist eine Hülle über `__gebautNach` (welt-boot): gezählt werden nur Takte ohne Offenes, ein Offenes ohne Bau-Ereignis wirft „DIE WELT HÄNGT“ und landet als `LAUF-FEHLER` beim Namen. Darüber laufen `bisRuhe` (jetzt: still 30 Takte UND nichts offen), die Wald-Gestalt, das Haus im Bau-Satz, der Erdbau unter dem Spieler, der Spieler-Chunk am fremden Ort samt Wald und der Nachschub.
3. **W4 der WebGL-Probe**: wartet per `__weltDa` auf die erste eingehängte Scheibe; ein stummer Faden steht in der Stall-Akte (`__weltDaWartet`).
4. **Der Uhr-Selbsttest der Mehrspieler-Wand**: `sturmSprung(3)`. Zahl aus dem Kern (`phyto-core wetterAt`, 3 Orte × 2000 Züge): alt 212/243/225 blind, neu 0, Abstand min 2 Züge.
5. **BAHNEN** (Koord): siehe Abgabe.

## Ehrlich offen
- Stand-Takt unter 2 Kernen × 3: `TREUE-TÄTER: deckWache an Stelle 6527 von 6528 nicht gesehen` (1/9, Verdacht: das Fern-Wasser legt nasse Punkte still neu, `_fernRingWasserNeu`, ungeprüft) und `RUHE-TAT: 47 Einheiten für 10 geschriebene` (1/9).
- Mehrspieler-Wand unter 2 Kernen × 3: A kennt B 180 s lang ohne Leitung (`rtcPeers` ohne Eintrag bei Eintrag mit Leib). In den 3 Tagen CI sah ich das nie beim Namen; ein Fall (a5f3f0c7) endete mit `ABSTURZ: Waiting failed`.
- Gleichauf mit Platz 2/3: „Der Körper steht“ (K8 fein hang p95 16–31 cm, 3 Fälle bis 26.10.) — nicht angefasst.
- Prägung-Welt (2), Kreatur-Linse Teil 1 (2) und die Einzelfälle: nicht angefasst.
- Der Zensus selbst lebt als Werkzeug im Scratch, nicht in `scripts/` (die Decke). Die Richter-Tafel `node scripts/ci-zeiten.cjs --tafel` zählt Wackler nur innerhalb eines Laufs (Versuche), nicht über Folge-Läufe am selben SHA.
