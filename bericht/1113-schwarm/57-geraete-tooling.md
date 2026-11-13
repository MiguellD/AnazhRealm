# 57 Geräte und Werkzeug: bash.exe, Werkbank-Absturz, 243 Arbeitsbäume

## Was es den Spieler kostet (kein Bild gesehen; Werkzeug)
- **Zug-Zeit:** Sammeln je Zug unter bash.exe 18 min 25 s → 126 s unter sh.exe (FUND-REGISTER.md:232); `start.sh --blick` 106,8 → 18,0 s (FUND:235). Rest-Zahler: die GPU-Läufer der CI auf dem Laptop (`shell: bash`) und `werkzeug/gpu-lauf.sh`. Ihre Kosten sind nicht gemessen.
- **Verlorene Messung:** Radeon-Fahrt 18:53–19:01 am 36f9d45a: 123 Stationen „Werkbank startet nicht (Exit 3221226505)“, leeres Log, 0 min je Station (FUND:252). Die Buchung hätte 221 → 177 gebucht. Seit pm 191f0684 zählen sie als UNGEMESSEN (FUND:254), gehen aber trotzdem als Fahrt verloren. Derselbe Tod traf den Halter am 11.11. um 05:47 (71 Stationen, punkte.cjs:2493).
- **Gefahr bei der Sicherung:** `notbremse.sh` ohne `--trocken` hätte 22 alte Bäume als WIP gesichert und gepusht, darunter ~90 000 Löschungen (UEBERGABE-2026-11-13.md:91). Weil sie nicht gefahren ist, ist nichts zerbrochen.

## Was die Quelle sagt
**Ursache 1: bash.exe 1–2,6 s je Prozess-Start**
- Gemessen: `C:\Program Files\Git\usr\bin\bash.exe` braucht für exec true 1048–2636 ms. Das byte-gleiche `sh.exe` daneben braucht 47–92 ms, eine Kopie namens bash.exe im Scratch 29–79 ms. OMEN und GTX 1050 haben das Problem nicht (FUND:232). Die Kopie gleichen Namens ist schnell, also hängt es am Pfad und nicht am Namen.
- Heute von mir ausgeschlossen, alles gelesen ohne Admin:
  - AppCompat-Layer: kein Eintrag für Git unter HKCU/HKLM `AppCompatFlags\Layers`. `Compatibility Assistant\Store` nennt nur die Setup-Dateien `Downloads\Git-2.54.0-64-bit.exe` und `GitHubDesktopSetup-x64 (1).exe`.
  - IFEO bzw. Exploit Protection: weder für bash.exe noch für sh.exe gibt es einen Schlüssel.
  - Smart App Control: `CI\Policy VerifiedAndReputablePolicyState` = 0, also aus.
  - Alternate Data Streams: beide Dateien haben nur `:$DATA` mit 2 455 808 Bytes.
- Stand der Schnitte: alle 27 `.sh` in `zug/dienst/**` außer `werkzeug/gpu-lauf.sh` beginnen mit `case "$BASH" … exec /usr/bin/sh "$0"` (z. B. zug-dienst.sh:24, werkzeug/notbremse.sh:3). gpu-lauf.sh:1–30 fehlt die Zeile, und das Skript hat 20 `$(…)`/Pipe-Glieder.
- Die CI-Läufer: check.yml:1224 (`[self-hosted, radeon-gpu …]`) mit `defaults.run.shell: bash` in :1235 und :1244. gpu-probe.yml:103 mit :116. Auf Windows ruft das das langsame bash.exe auf.

**Ursache 2: Werkbank stirbt mit Exit 3221226505 = 0xC0000409 und leerem Log**
- Halter: punkte.cjs:2361–2364 startet `node scripts/werkbank.cjs start --echt …` mit `NODE_OPTIONS=--require gpu-zeuge.cjs` (ZEUGE_DATEI punkte.cjs:875). stdout und stderr gehen in die Log-Datei.
- Die erste Zeile der Werkbank ist `WERKBANK bereit` (werkbank.cjs:2939). Sie kommt erst, wenn Browser und Steuer-Port stehen. Ein leeres Log heißt also nur: der Prozess starb vor diesem Punkt. Es heißt nicht, dass der Start sofort scheiterte.
- Der Baum der Messung (`baumAmSha`, punkte.cjs:1866–1880) bindet `node_modules` als Junction an den Haupt-Klon.
- Heute von mir ausgeschlossen:
  - Speicher-Erschöpfung: das System-Protokoll hat am 13.11. 18:40–19:05 und am 11.11. 05:35–05:55 kein Ereignis von Resource-Exhaustion oder Kernel-Memory.
  - npm-Tausch unter der Junction: `node_modules/.package-lock.json` stammt vom 25.10. 18:25.
  - WER: das Anwendungsprotokoll hat im Fenster keinen Application Error (FUND:252).
  - Im System-Protokoll stehen im Fenster nur UPnP-Rauschen (HttpService 113/114, den ganzen Tag 50–292 je Stunde) und BITS-Starttyp-Wechsel um 18:55 und 18:58.
- Gegenprobe: am selben Kopf startet die Werkbank in einem anderen Baum um 19:11 in 5 s, im selben Baum um 19:52 wieder (FUND:247, :252). Die Ursache ist also eine Umgebung, die 8 min hielt, und nicht der Code.

**Ursache 3: 22 alte Bäume mit Massen-Änderungen**
- Heute an drei Klassen gemessen mit `git diff --name-status` (fsmonitor aus). Jede Änderung ist eine Löschung, kein M und kein Zeilenende:
  - `Temp/claude/mess-session`: 722 D
  - `w3/w12-g2-proben`: 47 D
  - `w3/w6-musik-pm`: 29 726 D
- Im Baum bleiben nur unverfolgte Dateien, mess-session z. B. 297 Stück. Ihr letzter Zugriff war am 07.11. 23:49.
- Windows-Speicheroptimierung ist AN: `StorageSense\Parameters\StoragePolicy` 01 = 1 und 04 = 1 (Temp-Dateien löschen), 2048 = 0 (bei wenig Platz). Last-Access wird geführt (`DisableLastAccess = 2`).
- 142 der 243 Bäume liegen unter `%TEMP%`. Ebenfalls dort liegen die Punkte-Maschine (`Temp/claude/w3/pm`) und der Zustand des Dienstes (gemein.sh:7–9).
- Die lebende pm hat heute 37 M und 6 D aus ihrer eigenen Messung, nicht verweht.
- Warum die Bäume bleiben: `worktrees-ausduennen.sh:50` entfernt ohne `--force`, git weist geänderte Bäume ab. Log Zeile 647: w6-musik-pm „contains modified or untracked files“. Letzter Lauf am 11.11. 00:15: 394 gesehen, 217 entfernt, 179 übrig. Heute sind es 243, also +64 in 2,5 Tagen.
- Die Notbremse sichert jeden Baum mit `GEAEND > 0` per `git add -u` (notbremse.sh:15–21). Das heißt: Löschungen werden committet und gepusht.

## Die EINE begrenzende Entscheidung
Ein Baum, in dem nur Löschungen stehen (VERWEHT), ist kein Zwischenstand und kein Arbeitsplatz. Ein Prädikat `verweht` in `zug/dienst/gemein.sh` entscheidet das für Notbremse und Ausdünnen gemeinsam.
- bash.exe und die Werkbank bekommen keine eigene Jagd.
- bash.exe: die Zahler wechseln auf sh.exe.
- Werkbank: der nächste stumme Tod soll seinen Namen selbst schreiben.

## Der Schnitt
**Stufen (die Klasse ganz):**
1. `gemein.sh`: `verweht <baum>` ist wahr, wenn `git -c core.fsmonitor=false diff --name-only --diff-filter=d` leer ist und `--diff-filter=D` nicht leer.
2. `werkzeug/notbremse.sh:15`: ein verwehter Baum wird nie gesichert. Die Zeile lautet `VERWEHT <br> @ <kopf>: <n> Löschungen (Windows räumt %TEMP%)`.
3. `worktrees-ausduennen.sh:50`: verweht, 0 unverfolgte Dateien und auf einem Zweig (der Zweig hält den Commit, Zweige werden nie gelöscht) bedeutet `git worktree remove --force`. Mit unverfolgten Dateien bleibt der Baum stehen und wird mit Zahl benannt.
4. `werkzeug/gpu-lauf.sh:2`: die sh.exe-Zeile wie in notbremse.sh:3.
5. In SPIEL: check.yml:1235 und :1244 sowie gpu-probe.yml:116 bekommen `shell: C:/PROGRA~1/Git/usr/bin/sh.exe --noprofile --norc -eo pipefail {0}`. Das gilt nur für Jobs auf `self-hosted`. Linux-Jobs bleiben `bash`.
6. punkte.cjs:2363: NODE_OPTIONS bekommt `--report-on-fatalerror --report-directory=<log>.bericht` dazu.

**Leser-Liste:**
- notbremse.sh: Aufruf von Hand nach `werkzeug/notbremse.md:7`.
- worktrees-ausduennen.sh: von Hand. Liest Log :15 und die Bleibe-Liste :38.
- gpu-lauf.sh: jeder lokale GPU-Arbeiter (UEBERGABE §2.8).
- check.yml/gpu-probe.yml: die Läufer radeon-gpu, omen-gpu und gtx1050-gpu (sh.exe ist dort byte-gleich, FUND:232).
- punkte.cjs:2373–2374: `SITZUNG ABSTURZ` liest das Log. Der Bericht kommt daneben, das Urteil bleibt UNGEMESSEN.

**Kosten-Zeile:** kein Byte im Spiel, kein Schirm, Tris/dc/ms unverändert. Die CI-Datei ändert nur die Shell der GPU-Jobs.

**Kriterien der Meisterkarte:** keines direkt. Die Wirkung läuft über die Buchung (Fahrten mit 123 bzw. 71 ungemessenen Stationen) und über die Zug-Zeit. Ob die Domäne `profiband` (0 Punkte, UEBERGABE:54) ein Kriterium für CI-Takt trägt, habe ich nicht gelesen.

**Station und Probe je Stufe:**
- Stufen 1–3: `notbremse.sh --trocken` vorher 22 „WÜRDE“ → nachher 22 „VERWEHT“. `worktrees-ausduennen.sh --trocken` vorher 0 → nachher n „ginge“.
- Stufe 5: Dauer des echt-Jobs radeon vorher ↔ nachher (Zug-Log).

## Was schon liegt
- sh.exe-Wellen 29ae66a9 und 11a2485f in `koordination` (61 Dateien, Einbau 163 s, FUND:235).
- pm 191f0684: stummer Tod gilt als UNGEMESSEN (punkte.cjs:2367–2374, Selbsttest punkte.cjs:7700).
- Für das Prädikat `verweht`, die CI-Shell und den Report-Schalter gibt es noch keinen Zweig. Bis zur Landung fehlt: Stufen 1–4 in `koordination` (kein Zug nötig), Stufe 6 in `punkte-maschine` (Push nur auf SELBSTTEST GRÜN), Stufe 5 als Zweig `w28-…` über den Zug.

## Ehrlich offen
- **bash.exe:** Die Wurzel in Windows bleibt UNBENANNT. Vier Pfad-Mechanismen habe ich ausgeschlossen (siehe oben). Am wahrscheinlichsten ist ein Zustand, der am Bild-Pfad hängt und ohne Admin unsichtbar ist: die Prefetch-Spur `C:\Windows\Prefetch\BASH.EXE-<pfad-hash>.pf` oder Defender-Verhaltens-Spuren je Pfad. Die EINE Probe ist eine Klick-Datei mit `dir C:\Windows\Prefetch\BASH.EXE-*.pf SH.EXE-*.pf` (Größe und Datum). Das ist eine Vermutung und nicht gemessen.
- **Werkbank 0xC0000409:** UNBENANNT. Speicher, npm-Tausch und WER sind ausgeschlossen. Am 11.11. um 05:44–05:50 stehen 7 Ereignisse `mtkwecx` (WLAN-Treiber) im Protokoll, am 13.11. keine, also keine Korrelation. Die EINE Probe ist Stufe 6: Liegt beim nächsten Tod ein Node-Bericht vor, ist es ein V8/Node-Fatal mit Stapel. Liegt keiner vor, ist es ein natives `__fastfail` außerhalb von Node, und dann folgt WER-LocalDumps per Klick-Datei (HKLM, Admin).
- **Verweht:** Belegt ist, dass nur D steht (3 von 22 gelesen). Nicht belegt ist, dass die Speicheroptimierung der Täter ist. Sie ist an und löscht Temp-Dateien. Die Überlebenden sind jünger zugegriffen (07.11.), aber ein Lösch-Ereignis habe ich nicht gefunden. Die 19 übrigen Bäume habe ich nicht einzeln gelesen.
- **Risiko:** pm und `/tmp/claude/dienst` liegen im selben `%TEMP%`. Heute ist die pm nicht verweht (6 D aus eigener Messung). Ein Umzug aus %TEMP% wäre ein Geräte-Eingriff, den nur der Schöpfer anordnet. Für die Speicheroptimierung gilt: nur als Klick-Datei, er klickt.
- Nicht gelesen: welt-boot `startePuppeteer`, `scripts/werkbank.cjs` vor :2860, die Kosten der CI-Jobs unter bash.exe in Minuten.

## Rang
1. **Prädikat verweht (Stufen 1–3):** Wirkung 3 (die nächste Notbremse pusht keine 90 000 Löschungen, das Ausdünnen nimmt ≥ 22 Bäume) · Aufwand S · Risiko: `--force` löscht unverfolgte Dateien, deshalb 0 unverfolgte als Bedingung.
2. **CI-Shell + gpu-lauf auf sh.exe (Stufen 4–5):** Wirkung 2 (Takt jedes GPU-Jobs am Laptop, nicht gemessen) · Aufwand S · Risiko: POSIX-Modus kann eine Bash-Zeile im `run:` brechen. Für gpu-lauf entschärft das `set +o posix` aus dem Kopf. Im Workflow gilt `-eo pipefail` ohne posix-Schalter, also vorher prüfen, ob `run:`-Zeilen `[[`/`<(` nutzen.
3. **Report-Schalter (Stufe 6):** Wirkung 2 (benennt die Wurzel beim nächsten Tod) · Aufwand S · Risiko: Der Bericht wird nur bei einem Node-Fatal geschrieben. Bei nativem fastfail bleibt das Log leer.
