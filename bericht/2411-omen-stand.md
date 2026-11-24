# OMEN-Stand 24.11. 15:50 (vor dem Konto-Wechsel)

## NACHTRAG 17:55 — sport-regeln 4 GESCHOBEN 26f27214 (grün-reif ja lokal, CI läuft)

- **Kette:** a620781b Merge main eba9bf8f ohne Konflikt → 443d3bab Druck-Schnitt (eigener Commit, Bytes = claude/scherbe-liegt
  cd0aa9fb, ohne CI-Lauf geschoben) → 26f27214 Kopf ohne Inhalt, Probe-Namen wie an c0e41d18, [ci voll].
- **Zahl:** DRUCK-SCHLAF an c0e41d18 am Läufer 6,717 s ↔ GTX 1,217 · 1,233 s (Soll ≤ 3). Linse v2 (drei Böcke unter stehender
  Uhr): altes Gesetz ROT „DRUCK-WANDUHR … 3 Brüche über dem Gesetz“, Schnitt GRÜN 0. Selbsttest 223 GRÜN. Lokal GRÜN: format · lint ·
  nach-karte · betriebsgesetz · check:statik 509 s · Uhr-Tafel --quelle/--selftest; Anatomie-Selbsttest an der Frist abgebrochen (bis BA3 grün).
- **Bild-Zeit Stand-Takt-Szene** main eba9bf8f (trägt ort-ausstattung) ↔ main 499f8b57, GTX, Mess-Kopie: Σ 1 144,1 ↔ 1 144,7 ms
  über 96 ↔ 95 Bilder, p50 7,85 ↔ 7,72 ms, p95 46,58 ↔ 42,26 ms.
- **Sprosse:** same.physik.reaktion#2 (`_tickDruck` an der Uhr der Welt). Beansprucht erst nach dem Urteil der echten Station am Kopf.
- **SLOT-BILANZ-Wurzel:** bericht/2411-slot-bilanz-wurzel-omen.md. Der Nah-Gang (`ARCH_PLATZ_MS` 4, Wanduhr) legt den Proben-Baum
  vor der Baseline, `_rebuildArchitectureMesh` legt ihn ein zweites Mal ohne Freigabe; 2 Waisen im Atlas, Σ 273 → 273.
- **10 von 10 lokal:** 2 von 10 am Schnitt (h2 v1, h3 v2). Der Rest folgt in einem eigenen Handlauf.
- **Weiter:** pm-leser-welle2 (22 Sprossen, die Lesung läuft).

## NACHTRAG 16:27 (neue OMEN-Sitzung „Meister der Omen“ — SendMessage an DIESEN Namen; „Omen Meister“ ist die alte Sitzung)

- **Neustart der OMEN 16:02** (Konto-Wechsel): landung · platte · puls waren tot, die Mess-Sitzung der Runde 22 auch. 16:14
  `start.sh` (installiert 70bce02a), alle drei leben; die Runde misst a8dd22b5 weiter (16:25 bei 32/239). Runner GTX 1060 lebt seit 16:03.
- **sport-regeln 3: STEMPLE c0e41d1868b14dc5b3210d814fc0bd330bdca1fc, NICHT cf3bff66.** Die GPU-Probe an cf3bff66 wurde vom
  Einlass ABGEWIESEN (mein Ruf lautete „wie am Kopf 998254be“ statt Probe-Namen; 54d43e20). c0e41d18 ist ein Commit OHNE Inhalt
  (Baum 29444137 = cf3bff66): die Code-Batterie erbt von cf3bff66, die Probe fährt die vier Namen von 998254be
  (gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, bild:stadt-voll@0.773). grün-reif: ja, sobald die Probe grün ist.
- **scherbe-liegt läuft:** Messung DRUCK-BUDGET-WANDUHR an main 499f8b57 (Mess-Kopie der Linse: Bild je Treffer, Budget 4 ↔ 0),
  Handlauf an der Stations-Grenze. Schnitt im Scratch bereit: `_tickDruck` zählt Brüche je Bild (`DRUCK.bruecheJeBild` 1) statt
  `performance.now()` + 4 ms; `spec/uhr/geraetezeit.json` verliert `_tickDruck:2`. Die Zahl folgt als Kopf mit grün-reif ja/nein.

## Köpfe je Zweig

| Zweig | Kopf | Baum | grün-reif |
|---|---|---|---|
| sport-regeln | `cf3bff6630b0d071e2df0adea129b5c0f6d42d1f` (Vorprüfung sport-regeln 3 auf main 499f8b57, [ci voll]) | n1911-los | ja |
| ort-ausstattung | `7c517dc573b56dbe3179ee2e57d724ed6be7f8aa` (Vorprüfung 5, vom Koordinator geschoben; zuletzt OMEN 4612f450) | n1011-hg | — (nicht anfassen ohne Fetch) |
| scherbe-liegt-wip | `59c79bda` (WIP auf main 5ef0404b: koerper-frei.js, diag-stand-takt.cjs, lib/stand-linse.cjs) | n1911-main | nein |
| koordination FUND-REGISTER [apparat golden] | e1a5288c | Klon AnazhRealm-mess | — |

## Grün (sport-regeln 3, lokal, Stationsgrenze 15:46)

- Kreatur-Linse Teil 1 46/46 Täter, exit 0 (608 s).
- format, lint, nach-karte und statik je exit 0. Rohdaten p3/n2411/wechsel/sr3f*.txt.
- gate:koerper-kern Selbsttest: 41 Täter rot (E6 eng, E7 ohneWeg).
- daten-contract, mensch-zuege und betriebsgesetz grün.
- Merge-Probe main 499f8b57: exit 0, 0 Konflikte.
- Ursache von Täter 1: koerper-core.js (998254be):5780 Brett `tischM 0.8` < stamm/siedlung-bewohner.js:2011 `tuerFreiM 0,9`. Schnitt an koerper-core.js:5809 `SPIEL_GESETZ.feld.standM 1.2`.
- Täter 2: koerper-core.js:5366 `wegeMax 10` und `tagesGaenge`, dazu `traegt` in spielProgramm (:5990).
- Täter 3: stamm/siedlung-bewohner.js:2840 `gangTempo` geliehen.
- Offen und ehrlich: Probe bewohner 355 s statt 248 s, Ursache ungemessen.

## Nächster Schritt

scherbe-liegt (auftrag/2411-wackler-vorrang.md, fc34e1ef):
- DRUCK-SCHLAF urteilt in Schritten der Sim statt Wanduhr, an scripts/diag-stand-takt.cjs ~3782: `while (st.spielZeit - tW < 10 && wachN() > 0) bild();`. Die Grenze ist n Schritte aus FREI.ruheS / FIXED_DT.
- Beide Mutanten in Schritten weiter ROT.
- Beweis 10 von 10 lokal.
- EINE Zahl: Bild-Zeit der Stand-Takt-Szene, ort-ausstattung-Kopf gegen main.
- Eigener kleiner Zweig mit [ci voll].

## Reihenfolge danach

1. scherbe-liegt
2. golden-je-rezept (Entscheid 15:50: EIN Golden je Rezept statt manifest.json/recipes.json/haeuser.json; die Linsen lesen das Verzeichnis; Beweis: zwei Zweige prägen je ein anderes Rezept neu und mischen ohne Konflikt)
3. dienst-frist:
   - gpu-schloss.sh:64–66 `cpu_ruhe` bekommt eine Frist und eine laute Zeile.
   - gpu-schloss.sh:20 `ci_wartet` liest den Job-Zustand.
   - landung-dienst.sh:58 halt() schreibt GEHALTEN plus die Waisen-Regel (platte-dienst.sh:27, start.sh:92).
   - Je Zeile ein Selbsttest-Fall. Installieren nur über start.sh, nie während ein Zug läuft.
4. ci-post-erbt
5. pm-Commit (HAKEN gelaende.K2)
6. R4 neu einreihen

## Zug

Ein Zug läuft: landung.puls 15:48:29, „Runde 22 misst a8dd22b5 (21/239, C: 25.7 GB frei)“. puls.puls: belegt ci-runner 45415704478/1. Mess-Dienst und Zug laufen weiter, nichts angehalten.

ZWISCHENSTAND · Karte 2 gebucht 83 von 1 718
