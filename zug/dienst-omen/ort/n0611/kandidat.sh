#!/bin/bash
# kandidat.sh <name> <alt-sha40> <liste,komma> — Koordinator 07.11.: den Zug-Kandidaten (neuer integ-probe-Kopf != alt) nach SEINEM echt-Ende
# auf der OMEN messen (--nur Liste, ohne "keine Station auf gtx"), Teile <= 9 direkt hintereinander; ein verdrängter Teil wird nicht gepusht
# TEIL_N=<n> (10.11.): Scheiben-Größe ohne EINZELN, Vorgabe 9.
# und stellt sich ans Ende der Liste (<= 4 Versuche, 12.11.). KOPF=<sha40> misst einen festen Kopf ohne Warten, EINZELN=1 je Station eine Sitzung.
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
# EINE STATION WIRD NIE VOR DEN ANDEREN AUFGEGEBEN (12.11., Koordinator): an 3552f058 fiel gelaende.K2#2 als neunte von 31 viermal
# einem CI-Job (12:03–14:15), die Liste stand 2 h 11 min und endete am Sprung — 22 Stationen dahinter fuhren nie. Jetzt:
#   WEICH   GPU_LAUF_WEICH_S (600): wartet ein CI-Job im Start-Hook am Schloss, misst die laufende Station zu Ende und gibt die Karte
#           an ihrer Grenze frei (gpu-lauf.sh); erst eine Station, die 600 s danach noch läuft, fällt.
#   ANS ENDE  ein gefallener Teil wird nicht gepusht und stellt sich hinten an — die Liste fährt mit dem nächsten weiter, sobald die
#           Karte frei ist; je Teil höchstens VERSUCHE (4), danach steht er beim Namen OFFEN im Log (der Rest der Liste ist gemessen).
export GPU_LAUF_WEICH_S=${GPU_LAUF_WEICH_S:-600}
VERSUCHE=${VERSUCHE:-4}
teil() { local name=$1 R=$2 v=$3   # EIN Versuch: 0 gepusht · 1 verdrängt (nicht gepusht)
  until frei; do sleep 10; done; local d0=$(verdr)
  echo "$(date '+%T') ${K:0:8} $name Versuch $v START ($R)" >> $L
  TEIL=$name-v$v NUR=$R node punkte-offen.cjs lauf $K >> $L 2>&1
  rm -rf $N/punkte-sitzung-$name-v$v; cp -r $ROH/${K:0:8}-gtx/sitzung $N/punkte-sitzung-$name-v$v 2>/dev/null
  [ $(verdr) -gt $d0 ] && return 1
  # CPU-RUHE (10.11., Koordinator 07:30: nie neben einem echt-/Probe-Job): Push und Zeile warten, solange ein CI-Job das Schloss hält oder wartet
  . /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh; cpu_ruhe 2>> $L
  TEIL=$name-v$v NUR=$R node punkte-offen.cjs push $K >> $L 2>&1; echo "$(date '+%T') $name GEPUSHT (Versuch $v)" >> $L; node $N/zeile-erledigt.cjs $K $name "$R" >> $L 2>&1; return 0; }
# SPRUNG=<datei> (11.11., Koordinator 14:33): liegt die Datei, endet die Liste VOR der nächsten Station — der Landungs-Dienst legt sie,
# sobald main weiter ist (die GTX misst den jüngsten Kopf, nie stundenlang einen überholten); die laufende Station fährt zu Ende.
G=${EINZELN:+1}; G=${G:-${TEIL_N:-9}}; Q=(); i=0
while [ $i -lt ${#OK[@]} ]; do Q+=("$((i/G+1))|1|$(IFS=,; echo "${OK[*]:$i:$G}")"); i=$((i+G)); done   # je Teil: Nummer|Versuch|Stationen
GANZ=${#Q[@]}; DA=0; OFFEN=
while [ ${#Q[@]} -gt 0 ]; do
  [ -n "$SPRUNG" ] && [ -f "$SPRUNG" ] && { echo "$(date '+%T') $NAME SPRUNG: main ist weiter - die Liste endet nach $DA von $GANZ Teilen (${#Q[@]} nicht gefahren)" >> $L; break; }
  IFS='|' read -r nr v T <<< "${Q[0]}"; Q=("${Q[@]:1}")
  if teil $NAME-$nr "$T" $v; then DA=$((DA+1)); continue; fi
  if [ $v -lt $VERSUCHE ]; then
    echo "$(date '+%T') $NAME-$nr Versuch $v VERDRÄNGT - nicht gepusht, stellt sich ans Ende der Liste (${#Q[@]} davor)" >> $L; Q+=("$nr|$((v+1))|$T")
  else
    echo "$(date '+%T') $NAME-$nr Versuch $v VERDRÄNGT - OFFEN nach $VERSUCHE Versuchen ($T): der Lauf überdauert $GPU_LAUF_WEICH_S s neben einem wartenden CI-Job" >> $L; OFFEN="$OFFEN $T"
  fi
  # der Job, der verdrängte, fährt erst zu Ende (sein Ende steht in hook.log): die nächste Station beginnt nie in seine Ruhe
  e0=$(enden); w=0; until [ $(enden) -gt $e0 ] || { [ $w -ge 6 ] && frei; }; do sleep 20; w=$((w+1)); done
done
[ -n "$OFFEN" ] && echo "$(date '+%T') $NAME OFFEN nach $VERSUCHE Versuchen:$OFFEN" >> $L
echo "$(date '+%T') $NAME ENDE ${K:0:8}" >> $L
