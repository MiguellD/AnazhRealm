#!/bin/bash
# gpu-lauf.sh der OMEN für die Punkte-Maschine (koordination meisterkarte-quelle/punkte/punkte.cjs, PUNKTE_GPU_LAUF=<dieser Pfad>):
#   gpu-lauf.sh <name> <exe> [args…]
# Nimmt DASSELBE Schloss wie der Runner-Hook (p3/gpu-schloss.sh: mkdir $TEMP/claude/gpu-schloss, besitzer.txt Zeile 1 der Name, Zeile 2
# pid=<Windows-PID> dieses Laufs) mit Vorfahrt für einen wartenden oder laufenden CI-Job (Runner.Worker); keine Nachtruhe mehr (27.10., Schöpfer: „wir sind Maschinen, keine Pause“ —
# den nächtlichen echt-Job schützt die Vorfahrt wie jeden echt-Job am Tag).
# Ein Halter, dessen pid nicht lebt, ist verwaist (schloss_verwaist). Exit 75, wenn das Schloss nach GPU_LAUF_WARTE_S (Vorgabe 2700) nicht
# frei wird. Der Befehl läuft mit dem Deckel GPU_LAUF_MAX_S: am Deckel fällt der GANZE Prozessbaum (taskkill -F -T; 23.10.: Git-Bash-
# `timeout` tötete nur das direkte Kind, Chrome zeichnete weiter), Exit 124. Ein Herzschlag frischt besitzer.txt alle 5 min auf.
# VERDRÄNGUNG (24.10., der echt-Job läuft wieder auf der OMEN): wartet ein CI-Job auf das Schloss, während der Befehl läuft, fällt der Lauf
# samt seinen Waisen (p3/gpu-verdraengt.ps1), das Schloss geht an den Job, danach startet der Befehl von vorn — der Hook ROTet nach 25 min,
# eine Station läuft bis 45 min (profiband.K4#1), und ein Abbruch mit Exit wäre in punkte.cjs eine ROT-Zeile. Höchstens
# GPU_LAUF_VERDRAENGT_MAX (3) Mal; alles zusammen bleibt in WARTE + MAX (der Deckel von punkte.cjs liegt dahinter).
. /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
# nur für den Selbsttest: ein eigenes Schloss und ein eigenes Hook-Log
GPU_SCHLOSS=${GPU_LAUF_SCHLOSS:-$GPU_SCHLOSS}; GPU_HOOK_LOG=${GPU_LAUF_HOOKLOG:-$GPU_HOOK_LOG}
NAME="omen-${1:?name}"; shift
WARTE=${GPU_LAUF_WARTE_S:-2700}; MAX=${GPU_LAUF_MAX_S:-3600}; T0=$(date +%s); TOT=$(( T0 + WARTE + MAX ))
VMAX=${GPU_LAUF_VERDRAENGT_MAX:-3}; VERDR=0; DLOG=${GPU_LAUF_DLOG:-/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/messplatz/dienst.log}
worker() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
nimm() { # $1 spätester Zeitpunkt (s) — wartet auf das Schloss und das Ende der CI-Ruhe (VOR dem Schloss, 25.10.), nimmt es, Herzschlag
  until ! worker && ! ci_wartet && [ "$(ci_ruhe_rest)" -le 0 ] && mkdir "$GPU_SCHLOSS" 2>/dev/null; do
    schloss_verwaist
    [ $(date +%s) -ge "$1" ] && { echo "SCHLOSS BLOCKIERT von '$(schloss_erster)' nach $(( $(date +%s) - T0 )) s Warten" >&2; exit 75; }
    sleep 15
  done
  printf '%s\npid=%s\n' "$NAME" "$(cat /proc/$$/winpid 2>/dev/null)" > "$GPU_SCHLOSS/besitzer.txt"
  # DIE MELDUNG (30.10.) — dasselbe Protokoll wie die kanonische artifacts/profiband/werkzeug/gpu-lauf.sh: punkte.cjs wartet auf genau
  # „gpu-lauf: Schloss …“ (und liest „SCHLOSS BLOCKIERT …“ beim Exit 75). Ohne die Zeile starb der stille Warter der Mess-Sitzung nach
  # 600 s („schwieg“), obwohl das Schloss stand — takt25b/p/h am 6b3da705 je 0 gemessen; die alte Fehlzeile „gpu-lauf: Schloss nach …
  # nicht frei“ hätte der Warter sogar als genommen gelesen.
  echo "gpu-lauf: Schloss $NAME nach $(( $(date +%s) - T0 )) s" >&2
  ( while sleep 300; do [ "$(schloss_erster)" = "$NAME" ] && touch "$GPU_SCHLOSS/besitzer.txt"; done ) & HERZ=$!
}
trap 'kill $HERZ 2>/dev/null; schloss_loesen "$NAME"' EXIT
nimm $(( T0 + WARTE ))
while :; do
  TS=$(( $(date +%s) - 1 ))
  "$@" & KIND=$!
  WK=$(cat /proc/$KIND/winpid 2>/dev/null)
  ENDE=$(( $(date +%s) + MAX )); [ $ENDE -gt $TOT ] && ENDE=$TOT
  V=
  while kill -0 $KIND 2>/dev/null; do
    if [ $(date +%s) -ge $ENDE ]; then
      echo "gpu-lauf: Deckel $(( ENDE - TS )) s - der Prozessbaum ab pid $WK faellt" >&2
      [ -n "$WK" ] && taskkill -F -T -PID "$WK" > /dev/null 2>&1
      kill -9 $KIND 2>/dev/null; wait $KIND 2>/dev/null
      exit 124
    fi
    [ $VERDR -lt $VMAX ] && ci_wartet && { V=1; break; }
    sleep 2
  done
  [ -z "$V" ] && { wait $KIND; exit $?; }
  VERDR=$(( VERDR + 1 ))
  echo "gpu-lauf: VERDRAENGT $VERDR/$VMAX nach $(( $(date +%s) - TS )) s - ein CI-Job wartet; der Lauf faellt samt Waisen, Neustart nach dem Job" >&2
  [ -f "$DLOG" ] && echo "$(date '+%F %T') gpu-lauf $NAME VERDRÄNGT $VERDR/$VMAX nach $(( $(date +%s) - TS )) s von einem CI-Job - Neustart nach dem Job" >> "$DLOG"
  [ -n "$WK" ] && taskkill -F -T -PID "$WK" > /dev/null 2>&1
  kill -9 $KIND 2>/dev/null; wait $KIND 2>/dev/null
  powershell -NoProfile -ExecutionPolicy Bypass -File "$(cygpath -w /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-verdraengt.ps1)" $TS "${GPU_LAUF_VERDR_NUR:-}" >&2
  kill $HERZ 2>/dev/null; schloss_loesen "$NAME"
  sleep 20   # der Hook greift in seinem 15-s-Takt zu; danach hält worker() bis zum Job-Ende fern
  nimm $(( TOT - 60 ))
done
