# Übergabe E-Bauart (OMEN, Schneider) — Stand 21.10. 02:55

- Zweig `e-bauart` (Baum n2110-ebauart, Basis 6b7dfd1d). A-Seite n2110-ea 6b7dfd1d (sauber). node_modules in beiden.
- KOORDINATOR 21.10.: Basis 6b7dfd1d für Messungen UNGÜLTIG (integ-CI 39514723735 rot: Ring wächst nach umstellen nicht).
  Nur bauen. Auf Heil-SHA warten, dann e-bauart heben (merge --no-ff/rebase, CRLF prüfen), n2110-ea auf denselben SHA,
  dann Spike + Beweis. Der Spike (p3/n2110/ebauart/spike.sh) wurde VOR seinem Boot gestoppt — keine Zahl an 6b7dfd1d.
- Gebaut (stamm/bild-kosten.js, Diät-Scheibe): DAS REGISTER DER REGUNG — `_regungN`/`_regt`, `_regungMelder` (needsUpdate-
  Setter BufferAttribute+InterleavedBuffer, eingehängt in `_configureRenderer` EINE Zeile), `_diaetStand` (Stand je
  Render-Objekt), `_diaetRuhig` (das Tor), `_diaetStoffBlick` (Stoff-Vergleich je Stoff+Render), `_diaetProgrammMelder`
  (Texturen + freie Uniforms je Programm im Gang), `_diaetWert/_diaetZahl`; `_diaetVorTextur(ro)`/`_diaetFreiAnders(ro,k)`
  messen den Verbrauch am Programm-Stempel; `_diaetStoffVerpasst` meldet den Stoff.
- Wände: vendor-anker grün + Selbsttest (Mock-Schreiber über den Setter `puffer`, Manipulation `ohneMeldung`);
  kamera-treue grün auf GTX und swiftshader (CI=true): ÄNDERUNG-Kontrolle = gemuteter Melder 0,963/0,966 < 0,98,
  EINMAL liest jetzt `position` (das Tor sieht nur gelesene Attribute). Logs p3/n2110/ebauart/kamera-treue-*.log.
- Linse: scripts/lib/diaet-linse.cjs zählt pruefVoll/gemeldet/staendig/neu/ohneMeldung (Haken an `_diaetVorTextur`),
  Urteil „RUHE: N Prüfungen ohne Meldung je Frame (Namen)“, Selbsttest grün.
- OFFEN: DECKE scripts +~750 Atome (diag-betriebsgesetz --grund 6b7dfd1d) — Plan: kamera-treue STAND auf den Zähler der
  Diät-Linse (`__diaetZaehler`) umstellen (Linse ersetzt Linse), abkuerzung→ohneMeldung; dann check, playtest:fast,
  ci-lokal ganz, `_passSicht` prüfen; spec/stamm/modul-karte.json (diag-atlas --check) für die neuen Statiken.
- Werkzeuge: cdp-profil.cjs (rohes Profil), profil-zerlegen.cjs (netto je Ziel), spike-zaehler.js, spike-bank.js, stopp.ps1.
- Lehre: Bash-Heredoc verliert `\\` → Patch-Dateien mit dem Write-Werkzeug schreiben.

## Nachtrag 02:55
- Kopf e-bauart a7e8a818 = Merge integ-probe bbc97d8b (V18.546.39, Konflikt-Vorlauf auf Koordinator-Wort; index.html: Versions-
  Stufe + Tag stamm/bild-diaet.js). Vorher 7ed77b17: die Diät zog nach stamm/bild-diaet.js (R2 DECKE), EIN Zähler
  (__diaetZaehler) für Werkbank-Linse und gate:kamera-treue STAND, diaetUrteil für beide; scripts −82 Atome (Grund 6b7dfd1d).
- Koordinator: GEMESSEN erst am Heil-SHA (Ring-Heilung b-blick); dann e-bauart heben, n2110-ea auf denselben SHA.
- Bereit liegen: spike2.sh A|B (Instrument B), abab.sh (A=n2110-ea, B=n2110-ebauart, Instrument A), auswertung.cjs,
  m12-belegung.cjs (puppeteer aus n2110-ea), cdp-profil.cjs + profil-zerlegen.cjs, blick-genesis.js + blick-speichern.cjs,
  ci-lokal-ruhe.cjs (cpu_ruhe je Schritt). ci-lokal noch NICHT ganz gelaufen (Lauf 1 für den Merge abgebrochen).
- _passSicht: nur gelesen (Wahl je Gruppe und Pass hält schon über Stempel, Welle C); Schnitt erst nach dem Spike.

## Nachtrag 03:35 (Kopf a4992f02)
- Statisch/Beweglich: BEWEGLICH = matrixAutoUpdate-Kette; STATISCH = Kette ohne (Bündel der Welt + Gruppen: siedlung-bauten
  _archRegionBundleFor, siedlung-satz Einzug + Wachsen), meldet über updateMatrix-Haken (_regungMelder). Tor: Statisches liest
  die Stempel seiner Kette (_anazhKette), Bewegliches vergleicht 16 Zahlen.
- _passSicht liest das Register: siedlung-satz _bundleWerferHuelle steht über bg.version + _anazhHaltR (Halter: Puffer +
  Sicht der Kinder, _instanzZahl meldet die Sicht) + Statik. _instanzWahlPass/_chunkSatzPass: eigene Stempel (Welle C), offen.
- Tafeln (soll/albedo) zurück auf bbc97d8b (Umzug-Nebenwirkung); spec ändert nur modul-karte.json.
- ci-lokal NUR='^(puls|kopf|voll)' läuft (p3/n2110/ebauart/ci4); echt-Schritte am Heil-SHA.
- Am Heil-SHA: merge --no-ff in e-bauart, n2110-ea checkout --detach <sha> (CRLF prüfen), Wände, spike2.sh A und B,
  dann abab.sh (ABAB VOR ci-lokal/CI: keine CPU-Last daneben), Blick (blick-genesis.js), auswertung.cjs, Bericht ebauart.md.

## Nachtrag 05:55 (Kopf 27c384f5, Basis 57a9f2ab)
- Spike (spike/A, spike/B): Linse A RUHE 84,47 Prüfungen ohne Meldung (ROT), B 8,03 voll / 0 ohne Meldung.
- ABAB 4+4 fertig (abab/auswertung.md): g-third steht p95 A 5,78 / B 5,88 (Δ +0,10 ± 0,41), Belegung p95 9,65/9,63;
  Profil Prüfung netto 0,530 -> 0,393 (t -9,2), Replay 1,221 -> 1,133 (t -7,4), Gang +0,073 (Programm-Melder), _diaetRefresh
  -0,044 (n.s.); w-ego gleich. Ziel ≤5,8 4/4 verfehlt (B 2/4, A 3/4).
- Blick blick/genesis-third-B.jpg (gesehen: Plattform, Spieler, Tore + Membran, Haus, Bäume, Schatten — nichts fehlt).
- ci-ganz.sh läuft (ci5: puls|kopf|voll; ci5e: echt mit CI_KLASSE=gpu LINSE_GPU=karte unter dem Schloss).
- Danach: leerer Kopf-Commit [ci voll] (drei Sätze), Push, Zweig-CI lesen (curl), Bericht ebauart.md.

## Nachtrag 12:43 — PAUSE 3 (Koordinator: echt an aff61247 rot)
- ci-lokal ganz an D ff37b2a5 (ci-ganz.sh, Ordner ci5) Start 11:38:06, gestoppt 12:42:13 (stopp-ganz.ps1 + stopp-ci.ps1, Rest 0).
- Erreicht: 70/160 Schritte (puls · kopf · voll bis voll/14 „S4 Impostor eager“), alle EXIT=0 außer kopf (EXIT=1, lokal erwartet:
  GitHub-API head_sha=undefined). Schritt 71 (gate:nervensystem) lief beim Stopp, ohne Urteil. echt (ci5e) NICHT begonnen.
- Gegen echt-Job 39584063009 (12:22:24–12:40:35): Schritt 65 Boot-Foliage-Ring (voll/9, 19 s, swiftshader) lief 12:22:09–12:22:28,
  also 4 s Überlappung mit dem Job-Anfang; danach wartete cpu_ruhe 12:22:28–12:40:37; Schritte 66–70 erst nach Job-Ende.
- GPU-Schloss nie genommen (frei). WARTEN auf „WEITER“; danach ci-ganz.sh neu (ci5 wird gelöscht).

## Nachtrag 15:25 — KURSWECHSEL, Schluss
- ci-weiter (ci5b, ab 71) gestoppt 15:17 bei 100/160, alle EXIT=0. Lokal danach (waende-kurs.log): check · playtest:fast 21/21 ·
  kamera-treue · gate:weltbild-frost:echt (Schloss omen-2110-e, nvidia/pascal) je EXIT=0.
- Kopf abc5a0d7 [ci voll] (leer, drei Sätze) gepusht auf origin e-bauart; die Zweig-CI liest der Koordinator. Bericht ebauart.md fertig.
