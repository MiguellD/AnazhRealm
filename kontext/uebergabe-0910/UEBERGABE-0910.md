# ÜBERGABE 09.10.2026 — Kontowechsel nach dem Wochenlimit, ohne Verlust

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md und das Gedächtnis (MEMORY.md → uebergabe-stand.md, dirigieren.md,
werkzeug-lehren.md). Am 08.10. abends stoppte das Wochenlimit des alten Kontos alle Agenten mitten in der Arbeit. Alles
Halbfertige ist als „Zwischenstand-Sicherung … UNGEPRUEFT" committet und gepusht, jedes Prüf-Ergebnis liegt als Datei,
jeder Zweig steht auf GitHub (per `git ls-remote` geprüft). Es laufen keine Prozesse mehr.

## 1. Stand der Linie (per `git ls-remote origin`, 09.10.)

| Ort | Kopf | Bedeutung |
|---|---|---|
| `main` | **76c9624d = V18.536** | V18.535 (Welle K + L ganz, host-vram, wasser, Weltbild-Frost, CI in 3 Gruppen) + impuls + werkstatt + v1-ankunft + Frost 4–6 + nexus. OMEN-ABAB gegen V18.535: CPU p50/p95 voll 6,3/9,3 → 4,7/7,0 ms, Frame p95 25,0 → 20,9, Hänger 2 → 0. |
| `integ-probe` (Worktree `C:\Users\micha\AnazhRealm-integ`) | 76c9624d (= main) | sauber; die Stufe B (welle-m-boosts) war begonnen, aber nichts gemergt |
| `welle-m-boosts` (OMEN) | **cce9da43** | trägt `welle-m-brennglas` 3da7e286; BEIDE gegengeprüft **merge-reif: ja**; CPU p50 voll 4,8 → 4,0 ms gegen V18.536 |
| `welle-lf-rudel` (Worktree `.claude/worktrees/vigorous-nash-lf-rudel`) | **3c021731** | Nachbesserung Runde 1 fertig (Merge main V18.536, EIN Leib-Löser `_leibKontakte`, EINE Masse `_leibMasse`), CI grün — **Gegenprüfung Runde 2 fehlt** (starb am Limit) |
| `welle-lf-kampf` | — | noch nicht begonnen; startet auf dem rudel-Kopf |
| `studio-s3-wiese-gestalten` (Worktree `…/vigorous-nash-s3-wiese-gestalten`) | **dea510de** (WIP) | Runde 1 rot (`studios/s3-pruef1-wiese-gestalten.md`: vehicle V = 16 bei 8 Lacken → 40 Zwillinge), Nachbesserung halb (WIP-Commit) |
| `studio-s3-kreatur` (Worktree `…/vigorous-nash-s3-kreatur`) | **32594824** (WIP) | Runde 1 rot (`studios/s3-pruef1-kreatur.md`: Spike-Soll IoU < 0,9 verfehlt, Golden trotz Halt-Regel geprägt), Nachbesserung halb (WIP-Commit, darunter 00381bd1 „gate:kreatur-kosten W DECKUNG") |
| S3 pflanzen · haus · tor-fahrzeug-klinge | — | nicht begonnen (Skript `workflows/studio-s3-kosten.js`, Punkt 14 Wagen-Tiefe ergänzt) |
| `welle-m-schatten` (OMEN, Auftrag 0710-12) | **nur auf dem OMEN-PC** | NICHT auf origin — die OMEN-Sitzung endete am Limit; siehe §4 |
| `koordination` | wandert (09.10.: a5163c80) | Datei-Kanal zum OMEN (`auftrag/` Koordinator, `bericht/` OMEN, `kontext/`) |
| `welle-bundle-abschied` | 61901588 | alter Zweig, NICHT in main — nur zur Sicherheit gepusht; ungeprüft, vermutlich überholt |

## 2. Was fertig ist (diese Sitzung, 07.–08.10.)
- V18.534 → V18.535 → V18.536 auf main (je CI + voller Playtest + OMEN-ABAB „nicht langsamer").
- Hotfix Weltbild-Frost (3rd-Person + Tab fror das Bild auf WebGPU ein) — auf main, Klasse in 6 Runden ganz.
- Leben-Schau (sichtbar, vier Themen) → `artifacts/profiband/leben-schau/` (Befunde + Bilder); daraus Welle L Folge:
  werkstatt + v1-ankunft auf main, rudel in Prüfung, kampf offen.
- OMEN als Mess- UND Werkplatz: host-vram, fahren-2, Impuls-Klasse, Nexus (Dorf-Blick, Mess-Halt, Blocker-Netz),
  Brennglas-Takt, Boosts — Aufträge/Berichte 0710-1..12 auf `koordination`.

## 3. Fortsetzung — EIN Befehl, dann die Koordinator-Schritte
```
Workflow({ scriptPath: "C:\\Users\\micha\\AnazhRealm-profiband\\artifacts\\profiband\\workflows\\fortsetzung-0910.js" })
```
Drei Stränge parallel (Trockenlauf grün, „alles reif" wie „alles rot"):
- **Integration:** Integrator merget welle-m-boosts in integ-probe → wartet auf rudel → merget rudel (falls merge-reif) →
  volle Batterie + voller Playtest → Versions-Commit **V18.537** (Kandidat im Ergebnis).
- **Leben:** rudel Gegenprüfung Runde 2 (+ bis zu 2 Nachbesserungen) → kampf auf dem rudel-Kopf (+ Prüf-Schleife).
- **S3:** wiese-gestalten und kreatur Nachbesserung fortsetzen (je Prüfung, 1 Extra-Runde) → bei wiese merge-reif die Kette
  pflanzen → haus → tor-fahrzeug-klinge über `studio-s3-kosten.js` (args.basis = wiese-Kopf, args.nur) inkl. Bilanz.

**Danach (Koordinator):**
1. OMEN-ABAB V18.537 gegen main 76c9624d (Vorlage: `koordination` auftrag/0710-9-omen-abab-v18536.md) → bei „nicht langsamer"
   `git push origin <V18.537>:refs/heads/main` (Fast-Forward; SHA per ls-remote).
2. kampf → integ-probe → V18.538; S3-Familien nach der Bilanz seriell integrieren (render-config/manifest EINMAL am Ende neu
   prägen, Ratsche aus EINER Serie — Plan `studios/s3-plan.md` §4–§6).
3. Benannte offene Punkte (unten) einzeln an Familien/OMEN geben.

**Wache auf Teil-Ergebnisse** (ein Workflow meldet erst am Ende): `artifacts/profiband/werkzeug/journal-wache.cjs` per Monitor
auf `<transcriptDir>/journal.jsonl` des laufenden Workflows (nur EINE Wache je Journal — sonst doppelte Meldungen).

## 4. OMEN (Messplatz UND Werkplatz, GTX 1060)
- Neue Remote-Sitzung auf dem OMEN in `C:\Users\micha\Desktop\AnazhRealm-OMEN` starten; sie liest zuerst ihr Gedächtnis +
  `UEBERGABE-OMEN-*.md` dort und **`git show origin/koordination:auftrag/0910-omen-uebergabe.md`** (die neue Übergabe für ihn).
- Erreichen: `ListAgents` → die Zeile „Remote control … Remote Control" (Name/ID wechselt je Sitzung) → SendMessage.
- **Sofort für den OMEN:** seine Arbeit an 0710-12 (Branch `welle-m-schatten`, normalBias 1,0 m → kein Werfer unter ~1 m wirft
  einen sichtbaren Schatten) liegt nur lokal in seinem Mess-Klon — sichten, als WIP committen, pushen, dann fortsetzen.
- Der OMEN kann keine CI-Logs lesen und keine Reruns auslösen (kein Token) — das macht der Koordinator per API.

## 5. Benannt offen (mit Zahl und Grund)
- Pflicht-OFFEN E — das Profi-Band auf jedem Standardgerät: VRAM ~122 MB gegen 118 (Host-Ziele 90,9 MB), Genesis-Band rot.
- Tiere bewegen sich im Frame-Takt; seit sie den Spieler stoßen, hängt seine Lage minimal an der Bildrate (0,004 m/150 Schritte).
- Nächste CPU-Spitze: `_loopAutoSave` (max 11,9 ms an der Wiese); render-Wanduhr trägt den CPU-Zustand (benannt in omen-messfolge).
- Kreatur: Grobstufen-Schatten schräg IoU 0,71–0,83 (Vorderlauf-Lappen fehlt); Hinterbeine am Querhang 10–13° (Soll ≤ 10);
  Tier-Mitte an der Fundament-Kante 16–25 % der Dorf-Frames.
- Wiese: Halm-Kontrast Armlänge 6,60 (Soll 10; Basis schon 7,65). Wagen-Tiefe GT/Supersport (0,89 m gegen ~1,1 m) → S3 Punkt 14.
- GPU-Churn-Linse kippt auf langsamen CI-Läufern über „Bauten 147 → 146" (Täter-Buch steht, Täter noch ungenannt).
- **Schöpfer-Ding:** KI-Schlüssel — der am 07.10. genannte war bei ollama.com „Unauthorized" (Anbieter unklar);
  Drehbuch-Schritt 18 (echter LLM-Lauf) bleibt offen. Lokales Ollama: nur das Tray-Programm, kein Server auf 11434.
  Schlüssel gibt der Schöpfer selbst unter Einstellungen → Begleiter ein (nie ein Agent).

## 6. Gelernte Regeln (alle auch im Gedächtnis)
- SHAs nur per `git ls-remote` (der lokale origin/-Zeiger im Haupt-Klon ist veraltet).
- Voller Playtest JE MERGE (nicht in der CI); die 50-Gate-Batterie einmal je Version.
- GPU-Schloss mit `besitzer.txt`, nur das eigene lösen.
- Workflows mit `parallel()` melden erst am Ende → Journal-Wache; Nachbesserungen sofort als Agent-Tool-Agent.
- NIE SendMessage an Workflow-Agenten; NIE git stash; Regex/Escape nur mit dem Edit-Werkzeug (auch in Workflow-Skripten:
  keine unmaskierten Backticks in Template-Literalen — Trockenlauf vor jedem Start).
- Familien-Zweige auf alter Basis erzeugen beim Merge stille Zwillinge → vor der Integration main in den Zweig mergen.

## 7. Pflicht-OFFEN
A · B · C · E (`docs/PFLICHT-OFFEN.md`). Status: ZWISCHENSTAND.
