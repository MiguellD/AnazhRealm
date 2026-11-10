#!/bin/bash
# kandidat.sh <name> <alt-sha40> <liste,komma> — Koordinator 07.11.: den Zug-Kandidaten (neuer integ-probe-Kopf != alt) nach SEINEM echt-Ende
# auf der OMEN messen (--nur Liste, ohne "keine Station auf gtx"), Teile <= 9 direkt hintereinander; ein verdrängter Teil wird nicht gepusht
# TEIL_N=<n> (10.11.): Scheiben-Größe ohne EINZELN, Vorgabe 9.
# und nach dem nächsten echt-Ende neu gefahren (<= 4 Versuche). KOPF=<sha40> misst einen festen Kopf ohne Warten, EINZELN=1 je Station eine Sitzung.
N=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n0611; cd $N; L=$N/kette-0711.log; NAME=$1; ALT=$2; LISTE=$3
M=/c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess; PM=/c/Users/micha/Desktop/AnazhRealm-OMEN/n0611-pm
H=/c/actions-runner/hooks/hook.log; D=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/messplatz/dienst.log
ROH=$PM/meisterkarte-quelle/punkte/messung/roh
sperre_lebt() { local p; p=$(cat $M/.claude/worktrees/punkte-gtx.sperre/pid 2>/dev/null | tr -dc 0-9); [ -n "$p" ] && tasklist -FI "PID eq $p" -NH 2>/dev/null | grep -qw "$p"; }  # nur eine Sperre, deren Halter lebt (23:19–23:31 stand die Kette vor einer toten)
frei() { sperre_lebt && return 1; . /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh; gpu_frei; }  # 10.11. 23:10: nie IN der Baum-Sperre eines fremden punkte-Laufs warten (Richter-Schritt) — dessen Verdrängung zählte sonst als die eigene;  # 10.11. (Auftrag gpu-stufe K10): die EINE Schloss-Quelle entscheidet und bricht ein verwaistes Schloss mit; das eigene frei() von vorher wartete vor toten Haltern
enden() { grep -acE " ende .* (echt|probe):" $H; }
verdr() { grep -ac "omen-punkte-gtx-sitzung VERDR" $D; }
if [ -n "$KOPF" ]; then K=$KOPF; echo "$(date '+%T') $NAME fester Kopf ${K:0:8}" >> $L; else
echo "$(date '+%T') $NAME wartet auf neuen integ-probe-Kopf (alt ${ALT:0:8})" >> $L
while :; do git -C $M fetch -q origin integ-probe 2>/dev/null; K=$(git -C $M rev-parse FETCH_HEAD); [ "$K" != "$ALT" ] && break; sleep 60; done
echo "$(date '+%T') $NAME Kandidat $K - wartet auf sein echt-Ende" >> $L
until awk -v k="$K" 'index($0,"Schloss genommen (refs/heads/integ-probe " k){g=1} g && / ende .* echt:/{e=1} END{exit !e}' $H; do
  sleep 30; git -C $M fetch -q origin integ-probe 2>/dev/null; K2=$(git -C $M rev-parse FETCH_HEAD)
  [ "$K2" != "$K" ] && { echo "$(date '+%T') $NAME Kopf wechselt ${K:0:8} -> ${K2:0:8}" >> $L; K=$K2; }
done
echo "$(date '+%T') $NAME echt-Ende von ${K:0:8} da" >> $L
fi
git -C $PM fetch -q origin +refs/heads/punkte-maschine:refs/omen/dauer-pm && git -C $PM checkout -q --detach --force refs/omen/dauer-pm
OK=(); for s in ${LISTE//,/ }; do
  if (cd $PM && node meisterkarte-quelle/punkte/punkte.cjs run --sha $K --geraet gtx --nur "$s" --trocken 2>&1 | grep -q "keine Station"); then echo "$(date '+%T') $NAME $s: keine Station auf gtx - weg" >> $L; else OK+=("$s"); fi
done
teil() { local name=$1 R=$2 v=1 erst=1
  while [ $v -le 4 ]; do
    if [ $erst = 0 ]; then local e0=$(enden); echo "$(date '+%T') $name Versuch $v wartet auf das Ende eines echt-Jobs" >> $L; until [ $(enden) -gt $e0 ]; do sleep 20; done; fi
    erst=0; until frei; do sleep 10; done; local d0=$(verdr)
    echo "$(date '+%T') ${K:0:8} $name Versuch $v START ($R)" >> $L
    TEIL=$name-v$v NUR=$R node punkte-offen.cjs lauf $K >> $L 2>&1
    rm -rf $N/punkte-sitzung-$name-v$v; cp -r $ROH/${K:0:8}-gtx/sitzung $N/punkte-sitzung-$name-v$v 2>/dev/null
    if [ $(verdr) -gt $d0 ]; then echo "$(date '+%T') $name Versuch $v VERDRÄNGT - nicht gepusht, neu" >> $L; v=$((v+1)); continue; fi
    # CPU-RUHE (10.11., Koordinator 07:30: nie neben einem echt-/Probe-Job): Push und Zeile warten, solange ein CI-Job das Schloss hält oder wartet
    . /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh; cpu_ruhe 2>> $L
    TEIL=$name-v$v NUR=$R node punkte-offen.cjs push $K >> $L 2>&1; echo "$(date '+%T') $name GEPUSHT (Versuch $v)" >> $L; node $N/zeile-erledigt.cjs $K $name "$R" >> $L 2>&1; return 0
  done; echo "$(date '+%T') $name AUFGEGEBEN" >> $L; }
G=${EINZELN:+1}; G=${G:-${TEIL_N:-9}}; i=0; while [ $i -lt ${#OK[@]} ]; do T=$(IFS=,; echo "${OK[*]:$i:$G}"); teil $NAME-$((i/G+1)) "$T"; i=$((i+G)); done
echo "$(date '+%T') $NAME ENDE ${K:0:8}" >> $L
