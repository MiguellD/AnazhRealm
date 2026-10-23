#!/bin/bash
# GPU-Schloss der OMEN fuer Mess-Serien (dieselbe Konvention wie der Runner-Hook C:\actions-runner\hooks\job-start.ps1):
# atomar mkdir, darin besitzer.txt (ohne BOM); loesen nur mit dem eigenen Namen. Einbinden: . /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
# schloss_nehmen <name>  wartet (15 s Takt), bis das Schloss frei ist — ein CI-Job auf omen-gpu laeuft dann zu Ende
# schloss_loesen <name>  loest nur, wenn Zeile 1 von besitzer.txt <name> traegt (und ein erneutes Lesen dasselbe zeigt)
# 23.10. (Pruefer des Radeon-Runners): besitzer.txt traegt in Zeile 2 `pid=<Windows-PID>` des haltenden Prozesses; ein Halter,
# dessen pid nicht lebt, ist sofort verwaist (der Runner-Hook liest dasselbe). tasklist mit -FI (unter MSYS2_ARG_CONV_EXCL war //FI blind).
GPU_SCHLOSS=/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss
# VORFAHRT (16.10.): wartet ein CI-Job (letzte Zeile von hooks/hook.log „… wartet auf Schloss …"), nimmt keine OMEN-Serie das
# Schloss — eine Serie, die in einer Schleife sofort wieder nimmt, hungerte den Job sonst aus
GPU_HOOK_LOG=/c/actions-runner/hooks/hook.log
ci_wartet() { tail -n 1 "$GPU_HOOK_LOG" 2>/dev/null | grep -q "wartet auf Schloss"; }
schloss_erster() { head -n 1 "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null | tr -d '\r'; }
pid_lebt() { tasklist -FI "PID eq $1" -NH 2>/dev/null | grep -q " $1 "; }
# ein Halter mit pid, die nicht lebt: nach erneutem Lesen desselben Besitzers geloest
schloss_verwaist() { local wer p; wer=$(schloss_erster); p=$(grep -m1 "^pid=" "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null | tr -dc 0-9)
  [ -n "$wer" ] && [ -n "$p" ] && ! pid_lebt "$p" && [ "$(schloss_erster)" = "$wer" ] && { rm -rf "$GPU_SCHLOSS"; echo "$(date +%T) verwaistes Schloss '$wer' geloest - pid $p lebt nicht" >&2; }; return 0; }
schloss_nehmen() { local n="$1" w=0; mkdir -p "$(dirname "$GPU_SCHLOSS")"
  until ! ci_wartet && mkdir "$GPU_SCHLOSS" 2>/dev/null; do schloss_verwaist; [ $w = 0 ] && echo "$(date +%T) GPU-Schloss haelt '$(schloss_erster)' - warte" >&2; w=1; sleep 15; done
  printf '%s\npid=%s\n' "$n" "$(cat /proc/$$/winpid 2>/dev/null)" > "$GPU_SCHLOSS/besitzer.txt"; ci_ruhe; }
# CI-Ruhe (16.10.): nach dem Ende eines CI-Jobs räumt der Runner noch auf (Chrome, Upload) — ein Boot, der sofort startet, misst
# dessen CPU-Last mit (bündel4-direkt A2/A3: p95 7,5/7,1 statt 5,3–5,8). Mit dem Schloss in der Hand 180 s nach dem letzten „ende“.
ci_ruhe() { local z t e; z=$(grep " ende " "$GPU_HOOK_LOG" 2>/dev/null | tail -n 1 | cut -c1-19); [ -z "$z" ] && return 0
  t=$(date -d "$z" +%s 2>/dev/null) || return 0; e=$(( 180 - ($(date +%s) - t) ))
  [ $e -gt 0 ] && { echo "$(date +%T) CI-Ruhe: letzter CI-Job vor $(( 180 - e )) s zu Ende - warte $e s" >&2; sleep $e; }; return 0; }
schloss_loesen() { local n="$1"; [ "$(schloss_erster)" = "$n" ] && [ "$(schloss_erster)" = "$n" ] && rm -rf "$GPU_SCHLOSS"; return 0; }
# CPU-RUHE FÜR DIE CI (18.10., Ego-Rot 39102311056/1 fiel mit Rebase + npm ci eines OMEN-Arbeiters zusammen): schwere CPU-Arbeit
# OHNE GPU-Schloss (npm ci, check, playtest, rebase, Auswertungen) wartet, solange ein CI-Job das Schloss hält oder auf es wartet.
cpu_ruhe() { local w=0; while { [ -d "$GPU_SCHLOSS" ] && grep -q "^ci-runner" "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null; } || ci_wartet; do
  [ $w = 0 ] && echo "$(date +%T) CPU-Ruhe: CI-Job '$(cat "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null)' laeuft - warte" >&2; w=1; sleep 15; done; return 0; }
