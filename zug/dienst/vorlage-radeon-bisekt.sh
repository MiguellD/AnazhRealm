#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# radeon-bisekt.sh <gut> <schlecht> <stationen> — OHNE LLM, Messung statt Vermutung (10.11. 19:30): halbiert die Erst-Eltern-Kette von
# main zwischen dem letzten GRÜN und dem ersten ROT einer nur auf der Radeon messbaren Station, bis der erste rote Commit beim Namen
# steht. CI vor Messung (bricht ab und wartet, wenn ein Runner.Worker startet). Die Mess-Dateien alter Köpfe werden verworfen
# (nie gebucht). Log: /tmp/claude/w4/radeon-bisekt.log
R=/c/Users/micha/AnazhRealm-profiband; PM=/tmp/claude/w3/pm; L=/tmp/claude/w4/radeon-bisekt.log; S="${TEMP:-/tmp}/claude/gpu-schloss"
G=$1; B=$2; ST=$3
ci() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
frei() { [ ! -f "$S/besitzer.txt" ] && ! ps -ef | grep -q "[p]unkte.cjs run\|[k]opplung-bisekt" && ! ci; }
miss() { # $1 = sha → GRÜN | ROT | ABBRUCH
  while ! frei; do sleep 30; done
  cd $PM/meisterkarte-quelle/punkte && { timeout 1800 node punkte.cjs run --sha $1 --geraet radeon --nur "$ST" > /tmp/claude/w4/radeon-bisekt-lauf.out 2>&1 & }
  local p=$! ab=0; while kill -0 $p 2>/dev/null; do if ci; then ab=1; w=$(cat /proc/$p/winpid 2>/dev/null); [ -n "$w" ] && taskkill //T //F //PID $w >/dev/null 2>&1; kill $p 2>/dev/null; break; fi; sleep 10; done
  wait $p 2>/dev/null; cd $PM && git checkout -q -- meisterkarte-quelle/punkte/messung 2>/dev/null; git clean -fq meisterkarte-quelle/punkte/messung 2>/dev/null
  [ $ab = 1 ] && { echo ABBRUCH; return; }
  n=$(grep -cE "^  (GRÜN|ROT)" /tmp/claude/w4/radeon-bisekt-lauf.out); r=$(grep -cE "^  ROT" /tmp/claude/w4/radeon-bisekt-lauf.out)
  [ "$n" -gt 0 ] && [ "$r" = 0 ] && echo GRÜN || { [ "$r" -gt 0 ] && echo ROT || echo OFFEN; }
}
mapfile -t K < <(git -C $R rev-list --first-parent --reverse $G..$B)
echo "$(date +%H:%M) START $ST · gut ${G:0:8} · schlecht ${B:0:8} · ${#K[@]} Commits dazwischen" >> $L
w=$(miss $G); while [ "$w" = ABBRUCH ]; do w=$(miss $G); done
echo "$(date +%H:%M) ${G:0:8} (gut?) → $w · $(grep -E "^  (GRÜN|ROT)" /tmp/claude/w4/radeon-bisekt-lauf.out | cut -c1-90 | tr '\n' ' ')" >> $L
[ "$w" = GRÜN ] || { echo "$(date +%H:%M) ABBRUCH: am guten Kopf nicht GRÜN — kein Rückfall dieser Kette, Gerät oder Station" >> $L; exit 1; }
lo=-1; hi=$(( ${#K[@]} - 1 ))   # K[hi] = B gilt als ROT (am 2d5f4146 gemessen)
while [ $(( hi - lo )) -gt 1 ]; do
  m=$(( (lo + hi) / 2 )); w=$(miss ${K[$m]}); while [ "$w" = ABBRUCH ]; do w=$(miss ${K[$m]}); done
  echo "$(date +%H:%M) ${K[$m]:0:8} → $w · $(git -C $R log -1 --format=%s ${K[$m]} | cut -c1-80)" >> $L
  case $w in GRÜN) lo=$m ;; ROT) hi=$m ;; *) echo "$(date +%H:%M) OFFEN an ${K[$m]:0:8} — Halbierung endet unscharf" >> $L; break ;; esac
done
echo "$(date +%H:%M) TÄTER $ST: ${K[$hi]:0:8} $(git -C $R log -1 --format=%s ${K[$hi]} | cut -c1-140)" >> $L
