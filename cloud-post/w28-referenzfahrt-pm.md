# w28-referenzfahrt-pm — Fallen am Fremd-Last-Code, gesehen von der OMEN (11.11. abends)

Stand der Maschine: punkte-maschine 8998f8ba, Zeilen von `meisterkarte-quelle/punkte/punkte.cjs` an diesem Stand. Belege: die Stationen der
OMEN vom 11.11. 22:27–22:58 (Roh-Dateien lokal in `p3/n1011/pw/ms3/`, `k5-3c8dce79-2258.json`) und die Zählprobe der git-Abfrage der App.

1. **Ein ausgebliebenes Ereignis trägt kein Maß — das schwerste ROT fällt als UNGEMESSEN.** `massVon` (Z. 1336) nimmt nur endliche
   Werte. siedlung.K5#1 an 3c8dce79 (22:58, 1,72 Kerne fremd): „nH 12 erstes Haus nach 408.6 ms (Soll 500) · nH 300 erstes Haus nach — (kein
   Haus, Bau-Hash null)" → im Maß steht nur nH 12, das hält → Z. 1368 „kein Maß reißt (1 gemessen): das ROT liegt in einer Bedingung ohne
   Zahl" → UNGEMESSEN. Einseitig gelesen: ein Ereignis, das bis zum Deckel nicht kam, hat den Wert ≥ Deckel; ROT, sobald Deckel ÷ f über
   dem Soll liegt — nie „ohne Zahl".
2. **Die Referenz misst CPU, die App liegt auch auf der GPU.** Claude.exe `--type=gpu-process` 9–13 CPU-s je Station (≈ 0,3 Kern) ist der
   Compositor der App auf DERSELBEN GTX 1060 wie die WebGPU der Welt; dwm.exe (Diener, Z. 1063) 16,5 CPU-s in 40 s steigt mit ihm. „Ein
   Faden + alle Kerne" sieht diese GPU-Konkurrenz nicht — für GPU-gebundene Maße (p95 je Bild, profiband.*) gehört ein kurzer fester
   GPU-Satz (≤ 0,5 s, im Chrome des Halters) in die Referenzfahrt, sonst erklärt f sie nicht.
3. **Welches f für welches Maß.** Die Welt rechnet selbst ~6 Kerne (eigenS 246,8 CPU-s in 40 s an K5#1) auf 6 physischen Kernen mit HT: ein
   fremder Faden landet auf dem Zwilling eines Welt-Fadens. Haupt-Faden-Maße (Takt, p95) → Ein-Faden-f; Bau- und Worker-Maße (erstes
   Haus, Ring, Ankunft) → Alle-Kerne-f; im Zweifel das größere (einseitig: nie ein falsches ROT).
4. **Wärme und Turbo sind kein Fremder, aber ein f.** i7-8750H boostet einzeln bis 4,1 GHz, unter Dauerlast tiefer; die Fahrt „nachher"
   (nach einer schweren Station) ist wärmer als „vorher". Die Ruhe-Referenz des Geräts kalt UND warm aufnehmen, am Netzteil.
5. **Die Ruhe-Referenz trägt ein Datum.** Die OMEN ist nur „geeicht nach Radeon" (Z. 1044, die `vorschrift` Z. 1046 lief nie); Leerlauf
   10.11. mit App 0,56/0,63 Kerne, mit HP-Dienst 2,74/3,54. Nach dem Windows-Update 11.11. rechnete OmenCap.exe ~1 Kern von 16:03 bis zum
   Halt 22:42 (36–42 CPU-s je Station). Eine Ruhe-Referenz entsteht nie in so einer Phase (Indexer, Defender, Hersteller nach Updates).
6. **FREMD_GERAET kennt OmenCap.exe nicht** (Z. 1067). Nach Regel (1) Hersteller-Grund-Last wie AppHelperCap und OMEN Command Center, in der
   Liste aber fremd — die Stationen 22:37 und 22:42 fielen mit „OmenCap.exe 36,1 / 41,8 CPU-s".
7. **Der Zeuge sieht kurze Prozesse nur halb.** Takt 2 s (Z. 1027), ein git.exe der App lebt 0,3 s (rev-parse) bis einige s (voller diff
   gegen die Basis, `-c core.fsmonitor=` aus): wer zwischen zwei Takten entsteht und stirbt, fehlt ganz. git.exe 16–23 CPU-s je Station ist
   eine Untergrenze. `kurzName` schneidet vor dem Unterbefehl ab („git.exe -c core.quotepath=false -c safe.directory=* -c core.fsmonitor=
   -c branch.autoSetup") — Unterbefehl und Baum fehlen im Bericht.
8. **Das dichteste 10-s-Fenster liegt über der ganzen Spanne** (Z. 1315–1324; in der Sitzung samt Fahrt und Warten): ein Stoß beim Anfahren
   verwirft eine ruhige Messung — und ein Stoß mitten in der Station kann zwischen zwei 1,5-s-Fahrten liegen. Die App fragt je beschriebenem
   Baum etwa einmal je Minute ab (0,35 Aufrufe/s über 3–4 Bäume), mäßig stoßweise (dichtestes Fenster 1,72 gegen Mittel 1,48 Kerne).
   Vorschlag: f = max(f vorher, f nachher); liegt die Spitze des Zeugen IN der Station klar über beiden → unscharf, nicht ROT.
9. **Mess-Werkzeug daneben belastet den Zeugen.** Er wartet höchstens drei Takte (Z. 1271), sonst blind → jedes ROT UNGEMESSEN. Eine zweite
   Get-CimInstance-Schleife daneben (meine Zählprobe 22:52, 75 s) beschäftigt denselben WMI-Wirt (wmiprvse, Diener) und lag im Fenster der
   Station 22:53:08. Wer misst, zählt nie mit CIM daneben.
10. **Eine Sitzungs-Probe, die weit fährt, misst den Ring mit.** „SITZUNG DER ORT IM DECKEL … siedlung.K5#1 1 798 m (Ring 4 → −1)": ihre Zeit
    trägt den Aufbau am neuen Ort — ein f darf das nicht „erklären", es ist eine andere Größe.
11. **Die acht Zeit-Stationen ohne Maß** (`ohneMass`, Z. 1018–1021): „Last verlängert nur" gilt für Dauern; ein Bild-, Lücken- oder
    Anteil-Maß kann sich unter Last im ERGEBNIS ändern (ein Bild unfertiger, mehr Lücken-Bilder) — dort ist f kein Teiler. Sie brauchen in
    (3) eine eigene Zeile.
12. **Die Dienste des Messplatzes sind fremd.** Landungs-Dienst, puls (`schloss-puls.cjs`, git push), platte-wache und die Warter der Ketten
    starten über WMI, nie im eigenen Baum des Läufers — klein, nie null. Die Ruhe-Referenz des Messplatzes ist die mit allen Diensten an.
