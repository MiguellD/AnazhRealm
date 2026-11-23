#!/bin/bash
# GPU-Schloss der OMEN fuer Mess-Serien (dieselbe Konvention wie der Runner-Hook C:\actions-runner\hooks\job-start.ps1):
# atomar mkdir, darin besitzer.txt (ohne BOM); loesen nur mit dem eigenen Namen. Einbinden: . /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
# schloss_nehmen <name>  wartet (15 s Takt), bis das Schloss frei ist, kein CI-Job laeuft oder wartet und die CI-Ruhe vorbei ist
# schloss_loesen <name>  loest nur, wenn Zeile 1 von besitzer.txt <name> traegt (und ein erneutes Lesen dasselbe zeigt)
# 23.10. (Pruefer des Radeon-Runners): besitzer.txt traegt in Zeile 2 `pid=<Windows-PID>` des haltenden Prozesses; ein Halter,
# dessen pid nicht lebt, ist sofort verwaist (der Runner-Hook liest dasselbe). tasklist mit -FI (unter MSYS2_ARG_CONV_EXCL war //FI blind).
# DER ORT (19.11., Koordinator): EINE Quelle zug/dienst/schloss-ort.cjs (installiert neben dem Dienst, p3/dienst-omen/) — dieselbe Regel
# für gpu-lauf.sh (bindet dieses Skript ein) und schloss-puls.cjs. Bis zur Umstellung (Ort-Datei <home>/.gpu-schloss-ort, nur auf das
# Wort des Koordinators) ist es genau der bisherige Ordner C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss — nie aus $TEMP gerechnet,
# ein Lauf mit eigenem TEMP sieht dasselbe Schloss. Nennt die Quelle keinen Ort, endet das Einbinden laut (kein stiller Rückfall).
# Bis 19.11. stand hier der Pfad fest, unversioniert (diese Datei lebte nur in p3/).
GPU_SCHLOSS_W=$(node "${GPU_SCHLOSS_ORT_CJS:-/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/dienst-omen/schloss-ort.cjs}") && [ -n "$GPU_SCHLOSS_W" ] ||
  { echo "gpu-schloss.sh: ROT — schloss-ort.cjs nennt keinen Ort des GPU-Schlosses" >&2; return 1 2>/dev/null || exit 1; }
# die Laufwerks-Form /c/… von Hand, nie `cygpath -u`: das macht aus …\AppData\Local\Temp „/tmp“ — und /tmp hängt am TEMP des Prozesses
GPU_SCHLOSS=$(printf '%s' "$GPU_SCHLOSS_W" | sed 's|\\|/|g; s|^\([A-Za-z]\):|/\L\1|')
# VORFAHRT (16.10.): wartet ein CI-Job (letzte Zeile von hooks/hook.log „… wartet auf Schloss …"), nimmt keine OMEN-Serie das
# Schloss — eine Serie, die in einer Schleife sofort wieder nimmt, hungerte den Job sonst aus
GPU_HOOK_LOG=/c/actions-runner/hooks/hook.log
# DIE SCHLANGE (23.11., Koordinator 16:03, pm-runde-in-der-schlange; Befund: die Runde 12 stand 10:19–13:38 ohne Sitzung — sie fragte
# alle 10 s, ob die Karte frei ist, jede Hand wartete IN gpu-lauf.sh und nahm sie zuerst): EINE Reihe der Ankunft für jeden, der Baum
# oder Karte will — dieselbe Ablage wie die gerechte Schlange am Spiel-Baum (punkte.cjs baumSperre, 16.11.): je Wartendem eine Datei
# `<wer>-<pid>` (pid = die Windows-PID des Halters), Inhalt die Zeit der Ankunft (ISO), aufgefrischt ≤ 120 s. Die älteste lebende Ankunft
# nimmt zuerst; ein Platz ohne Auffrischung oder mit toter pid fällt. Die CI behält ihre Vorfahrt (gpu-lauf.sh versuch).
GPU_SCHLANGE=${GPU_LAUF_SCHLANGE:-/c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess/.claude/worktrees/punkte-gtx.wartet}
# schlange_ms <datei> — die Ankunft eines Platzes in ms (leer, wenn unlesbar)
schlange_ms() { local z; z=$(head -n 1 "$1" 2>/dev/null | tr -d '\r'); [ -n "$z" ] && date -d "$z" +%s%3N 2>/dev/null; }
# schlange_vor <ich> <ankunft-ms> — ein lebender Platz VOR <ich> (sein Name; leer: <ich> ist vorn). Älter heißt: frühere Ankunft, bei
# gleicher der kleinere Name (wie aelterWartet in punkte.cjs); was nicht lebt, räumt der Leser (keine Auffrischung seit 120 s, pid tot)
schlange_vor() { local ich=$1 m=$2 f n p t
  for f in "$GPU_SCHLANGE"/*; do
    [ -f "$f" ] || continue; n=${f##*/}; [ "$n" = "$ich" ] && continue
    p=${n##*-}; case "$p" in '' | *[!0-9]*) continue ;; esac
    [ $(( $(date +%s) - $(stat -c %Y "$f" 2>/dev/null || echo 0) )) -gt 120 ] && { rm -f "$f"; continue; }
    t=$(schlange_ms "$f"); [ -n "$t" ] || continue
    { [ "$t" -lt "$m" ] || { [ "$t" = "$m" ] && [[ "$n" < "$ich" ]]; }; } || continue
    pid_lebt "$p" || { rm -f "$f"; continue; }
    echo "$n"; return 0
  done; return 0; }
ci_wartet() { tail -n 1 "$GPU_HOOK_LOG" 2>/dev/null | grep -q "wartet auf Schloss"; }
ci_worker() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
schloss_erster() { head -n 1 "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null | tr -d '\r'; }
pid_lebt() { tasklist -FI "PID eq $1" -NH 2>/dev/null | grep -q " $1 "; }
# ein Halter mit pid, die nicht lebt: nach erneutem Lesen desselben Besitzers geloest
schloss_vor_neustart() { local boot=$(( $(date +%s) - $(cut -d. -f1 /proc/uptime) )); [ -f "$GPU_SCHLOSS/besitzer.txt" ] && [ "$(stat -c %Y "$GPU_SCHLOSS/besitzer.txt")" -lt "$boot" ]; }
# EIN LÄUFER FÄHRT EINEN JOB ZUR ZEIT (10.11., Auftrag gpu-stufe K10; dieselbe Regel wie koordination werkzeug/gpu-schloss.sh
# gs_verwaist_grund): hält „ci-runner A“ das Schloss und nennt die jüngste „start ci-runner …“-Zeile von hook.log einen ANDEREN Job B,
# ist A tot (sein Ende-Hook lief nicht; B wartet in seinem Start-Hook). gs_hook_lauf: der Job, den hook.log fahren sieht
gs_hook_lauf() { grep -a " start ci-runner " "$GPU_HOOK_LOG" 2>/dev/null | tail -n 1 | tr -d '\r' | sed -n 's/^[0-9-]* [0-9:]* start \(ci-runner [^:]*\): .*/\1/p'; }
# DER WARTENDE BRICHT ES (10.11., Gebot 10): die OMEN stand 28 min an „omen-punkte-gtx-sitzung pid=17752“ (sein Baum starb mit dem
# Hintergrund-Lauf der Sitzung), weil der Treiber davor auf „kein Schloss-Ordner“ wartete und nie hierher fragte. Gelöst wird nach
# erneutem Lesen desselben Besitzers; GPU_VERWAIST nennt den Gelösten, GPU_VERWAIST_LOG (wenn gesetzt) bekommt die Zeile auch
gs_verwaist_zeile() { echo "$(date +%T) VERWAIST: $1" >&2; [ -n "$GPU_VERWAIST_LOG" ] && echo "$(date '+%F %T') VERWAIST: $1" >> "$GPU_VERWAIST_LOG"; return 0; }
schloss_verwaist() { local wer p g= l; [ -d "$GPU_SCHLOSS" ] || return 0; wer=$(schloss_erster); p=$(grep -m1 "^pid=" "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null | tr -dc 0-9)
  if schloss_vor_neustart; then g="aelter als der Systemstart"
  elif [ "${wer#ci-runner }" != "$wer" ] && l=$(gs_hook_lauf) && [ -n "$l" ] && [ "$l" != "$wer" ]; then g="der Läufer fährt '$l'"
  elif [ -n "$wer" ] && [ -n "$p" ] && ! pid_lebt "$p"; then g="pid $p lebt nicht"; fi
  [ -n "$g" ] && [ "$(schloss_erster)" = "$wer" ] && { rm -rf "$GPU_SCHLOSS"; GPU_VERWAIST="'$wer' ($g)"; gs_verwaist_zeile "Halter $GPU_VERWAIST tot — Schloss gelöst"; }; return 0; }
# gs_uebernimm <versuch> <name> [args…]: löst schloss_verwaist ein Schloss, versucht der Wartende sofort selbst (Vorfahrt lässt es dem Hook)
gs_uebernimm() { GPU_VERWAIST=; schloss_verwaist; [ -n "$GPU_VERWAIST" ] || return 1; local w=$GPU_VERWAIST; GPU_VERWAIST=; "$@" || return 1
  gs_verwaist_zeile "Halter $w tot — Schloss übernommen von '$2'"; }
# FREI FÜR EINEN NEUEN LAUF (10.11.): die Treiber der Sitzung (Bisekt, ABAB, Zug-Serien) fragen nur noch hier — sie brechen ein
# verwaistes Schloss mit, statt vor einem toten Halter zu warten; frei heißt: kein CI-Job läuft oder wartet, kein Schloss, CI-Ruhe vorbei
gpu_frei() { schloss_verwaist; ! ci_worker && ! ci_wartet && [ ! -d "$GPU_SCHLOSS" ] && [ "$(ci_ruhe_rest)" -le 0 ]; }
schloss_versuch() { ! ci_wartet && ! ci_worker && [ "$(ci_ruhe_rest)" -le 0 ] && mkdir "$GPU_SCHLOSS" 2>/dev/null; }
schloss_nehmen() { local n="$1" w=0; mkdir -p "$(dirname "$GPU_SCHLOSS")"
  until schloss_versuch; do gs_uebernimm schloss_versuch "$n" && break
    [ $w = 0 ] && echo "$(date +%T) GPU-Schloss: warte ('$(schloss_erster)' haelt es, ein CI-Job laeuft oder wartet, oder CI-Ruhe $(ci_ruhe_rest) s)" >&2; w=1; sleep 15; done
  printf '%s\npid=%s\n' "$n" "$(cat /proc/$$/winpid 2>/dev/null)" > "$GPU_SCHLOSS/besitzer.txt"; }
# CI-Ruhe (16.10.): nach dem Ende eines CI-Jobs räumt der Runner noch auf (Chrome, Upload) — ein Boot, der sofort startet, misst
# dessen CPU-Last mit (bündel4-direkt A2/A3: p95 7,5/7,1 statt 5,3–5,8): 180 s nach dem letzten „ende“.
# 25.10.: die Ruhe ist eine Bedingung VOR dem Schloss, nie ein Schlaf mit ihm. In der Umstellungs-Nacht las `date -d` die lokale
# Zeile „02:53:56“ (die Stunde gab es zweimal) als MEZ: 62 min „Ruhe“ mit dem Schloss in der Hand, der echt-Job 40147260413/2 wartete
# 55 min. Gemessen an der mtime von hook.log (Epoche, eindeutig), wenn seine letzte Zeile das „ende“ ist, sonst an der Zeile; geklemmt auf 0–180 s.
ci_ruhe_rest() { local z t e; z=$(tail -n 1 "$GPU_HOOK_LOG" 2>/dev/null)
  case "$z" in
    *" ende "*) t=$(stat -c %Y "$GPU_HOOK_LOG" 2>/dev/null) || { echo 0; return; } ;;
    *) z=$(grep " ende " "$GPU_HOOK_LOG" 2>/dev/null | tail -n 1 | cut -c1-19); [ -n "$z" ] && t=$(date -d "$z" +%s 2>/dev/null) || { echo 0; return; } ;;
  esac
  e=$(( 180 - ($(date +%s) - t) )); [ $e -lt 0 ] && e=0; [ $e -gt 180 ] && e=180; echo $e; }
ci_ruhe() { local e; e=$(ci_ruhe_rest); [ "$e" -gt 0 ] && { echo "$(date +%T) CI-Ruhe: letzter CI-Job vor $(( 180 - e )) s zu Ende - warte $e s" >&2; sleep $e; }; return 0; }
schloss_loesen() { local n="$1"; [ "$(schloss_erster)" = "$n" ] && [ "$(schloss_erster)" = "$n" ] && rm -rf "$GPU_SCHLOSS"; return 0; }
# CPU-RUHE FÜR DIE CI (18.10., Ego-Rot 39102311056/1 fiel mit Rebase + npm ci eines OMEN-Arbeiters zusammen): schwere CPU-Arbeit
# OHNE GPU-Schloss (npm ci, check, playtest, rebase, Auswertungen) wartet, solange ein CI-Job das Schloss hält oder auf es wartet.
cpu_ruhe() { local w=0; while { [ -d "$GPU_SCHLOSS" ] && grep -q "^ci-runner" "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null; } || ci_wartet; do
  [ $w = 0 ] && echo "$(date +%T) CPU-Ruhe: CI-Job '$(cat "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null)' laeuft - warte" >&2; w=1; sleep 15; done; return 0; }
