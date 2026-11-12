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
# WEICH (12.11., Koordinator; dasselbe Gesetz wie zug/dienst/radeon-dienst.sh `ci_wartet`): GPU_LAUF_WEICH_S=<s> (Vorgabe 0 = wie
# bisher sofort) — ein CI-Job, der noch im Start-Hook AM SCHLOSS wartet, hat die Karte nicht: der Lauf misst zu Ende und gibt sie an
# seiner Grenze frei; erst nach WEICH s ohne Ende fällt er wie oben. Der Hook wartet 25 min (job-start.ps1 $frist), die Mess-Liste
# setzt 600 s (kandidat.sh): an 3552f058 fiel gelaende.K2#2 viermal, nach 1796 · 224 · 1464 · 542 s (p3/messplatz/dienst.log), und
# jede Station der Liste davor lief ~180 s — mit 600 s misst jede gewöhnliche Station zu Ende, ein Job wartet höchstens 10 min.
# QUELLE: koordination zug/dienst-omen/ort/gpu-lauf.sh, installiert von p3/dienst-omen/start.sh (Hand-Änderung = ROT).
. "${GPU_LAUF_SCHLOSS_SH:-/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh}"
# nur für den Selbsttest: ein eigenes Schloss und ein eigenes Hook-Log (und eine andere Schloss-Quelle, GPU_LAUF_SCHLOSS_SH)
GPU_SCHLOSS=${GPU_LAUF_SCHLOSS:-$GPU_SCHLOSS}; GPU_HOOK_LOG=${GPU_LAUF_HOOKLOG:-$GPU_HOOK_LOG}
NAME="omen-${1:?name}"; shift
WARTE=${GPU_LAUF_WARTE_S:-2700}; MAX=${GPU_LAUF_MAX_S:-3600}; T0=$(date +%s); TOT=$(( T0 + WARTE + MAX ))
VMAX=${GPU_LAUF_VERDRAENGT_MAX:-3}; VERDR=0; WEICH=${GPU_LAUF_WEICH_S:-0}; DLOG=${GPU_LAUF_DLOG:-/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/messplatz/dienst.log}
[ -f "$DLOG" ] && GPU_VERWAIST_LOG=$DLOG   # die VERWAIST-Zeile (10.11.) steht auch im Dienst-Log, neben VERDRÄNGT
worker() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
versuch() { ! worker && ! ci_wartet && [ "$(ci_ruhe_rest)" -le 0 ] && mkdir "$GPU_SCHLOSS" 2>/dev/null; }
nimm() { # $1 spätester Zeitpunkt (s) — wartet auf das Schloss und das Ende der CI-Ruhe (VOR dem Schloss, 25.10.), nimmt es, Herzschlag;
  # ein verwaistes Schloss bricht der Wartende selbst und übernimmt es sofort (gs_uebernimm, 10.11.)
  until versuch; do
    gs_uebernimm versuch "$NAME" && break
    [ $(date +%s) -ge "$1" ] && { echo "SCHLOSS BLOCKIERT von '$(schloss_erster)' nach $(( $(date +%s) - T0 )) s Warten" >&2; exit 75; }
    sleep 15
  done
  printf '%s\npid=%s\n' "$NAME" "$(cat /proc/$$/winpid 2>/dev/null)" > "$GPU_SCHLOSS/besitzer.txt"
  # DIE MELDUNG (30.10.) — dasselbe Protokoll wie die kanonische artifacts/profiband/werkzeug/gpu-lauf.sh: punkte.cjs wartet auf genau
  # „gpu-lauf: Schloss …“ (und liest „SCHLOSS BLOCKIERT …“ beim Exit 75). Ohne die Zeile starb der stille Warter der Mess-Sitzung nach
  # 600 s („schwieg“), obwohl das Schloss stand — takt25b/p/h am 6b3da705 je 0 gemessen; die alte Fehlzeile „gpu-lauf: Schloss nach …
  # nicht frei“ hätte der Warter sogar als genommen gelesen.
  echo "gpu-lauf: Schloss $NAME nach $(( $(date +%s) - T0 )) s" >&2
  # der Herzschlag ohne Ausgabe-Kanal (11.11.: sein `sleep 300` hielt die Leitung einer Kette `gpu-lauf … | uhr > log` nach dem Lauf bis zu 5 min offen)
  ( while sleep 300; do [ "$(schloss_erster)" = "$NAME" ] && touch "$GPU_SCHLOSS/besitzer.txt"; done ) >/dev/null 2>&1 & HERZ=$!
}
trap 'kill $HERZ 2>/dev/null; schloss_loesen "$NAME"' EXIT
nimm $(( T0 + WARTE ))
while :; do
  TS=$(( $(date +%s) - 1 )); W0=
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
    if [ $VERDR -lt $VMAX ] && ci_wartet; then
      if [ -z "$W0" ]; then
        W0=$(date +%s)
        if [ "$WEICH" -gt 0 ]; then
          echo "gpu-lauf: WEICHT - ein CI-Job wartet im Start-Hook; der Lauf misst zu Ende (hoechstens $WEICH s), die Karte geht an seiner Grenze frei" >&2
          [ -f "$DLOG" ] && echo "$(date '+%F %T') gpu-lauf $NAME WEICHT: ein CI-Job wartet nach $(( W0 - TS )) s Lauf - misst zu Ende, hoechstens $WEICH s" >> "$DLOG"
        fi
      fi
      [ $(( $(date +%s) - W0 )) -ge "$WEICH" ] && { V=1; break; }
    else W0=; fi
    sleep 2
  done
  if [ -z "$V" ]; then
    wait $KIND; E=$?
    [ -n "$W0" ] && [ -f "$DLOG" ] && echo "$(date '+%F %T') gpu-lauf $NAME ENDETE AN DER GRENZE: der CI-Job wartete $(( $(date +%s) - W0 )) s, der Lauf ist ganz (Exit $E)" >> "$DLOG"
    exit $E
  fi
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
