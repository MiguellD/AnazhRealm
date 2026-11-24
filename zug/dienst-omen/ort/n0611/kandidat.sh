#!/bin/bash
# UNTER sh.exe (wie zug-dienst.sh): gerufen als `bash kandidat.sh` startet es sich EINMAL unter sh.exe neu (Prozess-Start 317 ms statt 2 358 ms)
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# kandidat.sh <name> <alt-sha40> <liste> — Koordinator 07.11.: den Zug-Kandidaten (neuer integ-probe-Kopf != alt) nach SEINEM echt-Ende
# auf der OMEN messen (--nur Liste, ohne "keine Station auf gtx"), Teile <= 9 direkt hintereinander; ein verdrängter Teil stellt sich
# ans Ende der Liste (<= 4 Versuche, 12.11.). KOPF=<sha40> misst einen festen Kopf ohne Warten. TEIL_N=<n> (10.11.): Scheiben-Größe,
# Vorgabe 9; EINZELN=1 je Station eine Sitzung (seit 19.11. nicht mehr der Weg des Landungs-Dienstes).
# DIE TEILE DER RUNDE (Koordinator 19.11. 03:30, „Stationen EINER Linse fahren in EINER Sitzung“): trägt die Liste „;“, sind ihre Teile
# schon geschnitten (zug/dienst/runde.cjs teile: die Läufe der Maschine, Zwillinge nie geteilt, je Teil Σ Deckel ≤ 1 740 s, Reihe
# ungebucht zuerst) — je Teil EINE Sitzung `run --nur a,b,c`, die Prüfung „keine Station auf gtx“ je Station entfällt (die Teile kommen
# aus der Lauf-Tafel der Maschine selbst; eine Station ohne Lauf fährt allein).
# BEHALTEN JE STATION, NICHT JE TEIL (19.11.): fällt eine Sitzung (VERDRÄNGT von einem CI-Job — gpu-lauf.sh WEICH 600 s, eine Sitzung
# mit vielen Stationen dauert länger), wird gepusht, was sie bis dahin FERTIG maß (die Stationen des Teils mit Eintrag in der
# Mess-Datei des Baums, runde.cjs offen … -), und nur der REST des Teils stellt sich ans Ende — in einer neuen Sitzung, nichts von vorn.
# Bis hier fiel der ganze Teil (mit EINZELN=1 je Station eine Sitzung war das dieselbe Regel).
# Orte über die Umgebung (der Selbsttest in landung-dienst.sh fährt dieses Skript mit Attrappen): KANDIDAT_N · _M · _PM · _H · _D ·
# _SCHLOSS (gpu-schloss.sh) · _SCHLAF (s) · RUNDE_CJS · KANDIDAT_GEMEIN (gemein.sh: landung-dienst.sh nennt die, die es selbst las).
# DER WARTENDE AM BAUM ist EINE Regel mit landung-dienst.sh und radeon-dienst.sh: gemein.sh `baum_wartende` (ko-hand-lauf 24.11.; bis
# hier ein eigenes find mit denselben Ausnahmen) — gemein.sh installiert in p3/dienst-omen/, im Zweig in zug/dienst/; fehlt sie, ROT.
GEMEIN=${KANDIDAT_GEMEIN:-$(cd "$(dirname "$0")" && pwd)/../dienst-omen/gemein.sh}
[ -f "$GEMEIN" ] || GEMEIN=$(cd "$(dirname "$0")" && pwd)/../../../dienst/gemein.sh
[ -f "$GEMEIN" ] || { echo "ROT kandidat.sh: gemein.sh fehlt (baum_wartende, KANDIDAT_GEMEIN) — $GEMEIN"; exit 2; }
O=/c/Users/micha/Desktop/AnazhRealm-OMEN
N=${KANDIDAT_N:-$O/p3/n0611}; cd $N; L=$N/kette-0711.log; NAME=$1; ALT=$2; LISTE=$3
# 19.11.: die Liste reist als DATEI („@<datei>“, landung-dienst.sh liste_datei) — 1 428 Stationen als Argument rissen die Windows-Grenze;
# in argv und Umgebung (NUR, --nur) reist danach nur EIN Teil (runde.cjs teile: ≤ 1 740 s Deckel, ≤ 8 000 Zeichen)
[ "${LISTE#@}" != "$LISTE" ] && LISTE=$(<"${LISTE#@}")
M=${KANDIDAT_M:-$O/AnazhRealm-mess}; PM=${KANDIDAT_PM:-$O/n0611-pm}
H=${KANDIDAT_H:-/c/actions-runner/hooks/hook.log}; D=${KANDIDAT_D:-$O/p3/messplatz/dienst.log}
SCHLOSS=${KANDIDAT_SCHLOSS:-$O/p3/gpu-schloss.sh}; SCHLAF=${KANDIDAT_SCHLAF:-20}
RUNDE_CJS=${RUNDE_CJS:-$O/p3/dienst-omen/runde.cjs}
BILD_ABLAGE=${KANDIDAT_ABLAGE:-$N/roh-bilder} # die Roh-Bilder mit gehaltenem Urteil bleiben hier am Gerät (nie gelöscht)
ROH=$PM/meisterkarte-quelle/punkte/messung/roh
sperre_lebt() { local p; p=$(cat $M/.claude/worktrees/punkte-gtx.sperre/pid 2>/dev/null | tr -dc 0-9); [ -n "$p" ] && tasklist -FI "PID eq $p" -NH 2>/dev/null | grep -qw "$p"; }  # nur eine Sperre, deren Halter lebt (23:19–23:31 stand die Kette vor einer toten)
baum_wartet() { [ -n "$(. "$GEMEIN" && baum_wartende "$M/.claude/worktrees/punkte-gtx.wartet" 'landung|dauer')" ]; }  # 14.11.: ein Macher wartet an der Baum-Sperre (Marke von punkte.cjs, jünger als 1 min) — die nächste Station beginnt nicht vor ihm
frei() { sperre_lebt && return 1; baum_wartet && return 1; . $SCHLOSS; gpu_frei; }  # 10.11. 23:10: nie IN der Baum-Sperre eines fremden punkte-Laufs warten (Richter-Schritt) — dessen Verdrängung zählte sonst als die eigene;  # 10.11. (Auftrag gpu-stufe K10): die EINE Schloss-Quelle entscheidet und bricht ein verwaistes Schloss mit; das eigene frei() von vorher wartete vor toten Haltern
enden() { grep -acE " ende .* (echt|probe):" $H; }
verdr() { grep -ac "omen-punkte-gtx-sitzung VERDR" $D; }
zahl() { echo "$1" | tr ',' '\n' | grep -c .; }
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
node $N/pm-stand.cjs $PM >> $L 2>&1   # der Stand von punkte-maschine; eine jüngere Messung im Baum überlebt (pm-stand.cjs, 14.11.)
# EINE STATION WIRD NIE VOR DEN ANDEREN AUFGEGEBEN (12.11., Koordinator): an 3552f058 fiel gelaende.K2#2 als neunte von 31 viermal
# einem CI-Job (12:03–14:15), die Liste stand 2 h 11 min und endete am Sprung — 22 Stationen dahinter fuhren nie. Jetzt:
#   WEICH   GPU_LAUF_WEICH_S (600): wartet ein CI-Job im Start-Hook am Schloss, misst die laufende Sitzung zu Ende und gibt die Karte
#           an ihrer Grenze frei (gpu-lauf.sh); erst eine Sitzung, die 600 s danach noch läuft, fällt.
#   ANS ENDE  vom gefallenen Teil stellt sich der REST hinten an (oben: BEHALTEN JE STATION) — die Liste fährt mit dem nächsten weiter,
#           sobald die Karte frei ist; je Teil höchstens VERSUCHE (4), danach steht er beim Namen OFFEN im Log.
export GPU_LAUF_WEICH_S=${GPU_LAUF_WEICH_S:-600}
export PUNKTE_REFERENZ_NAME=gtx # die Referenz-Ablage je GERÄT (messung/referenz-gtx.json), nie je Rechner — kein Pfad, den zwei Schreiber teilen
VERSUCHE=${VERSUCHE:-4}
# GRENZE UND BUCHUNG JE STATION IN DER SITZUNG (Koordinator 19.11.; Befund 10:30: die Runde 1 am f68dbf09 stand 2 h 20 min bei 0/1428 —
# EINE Sitzung `punkte-offen.cjs lauf` mit 252 Stationen, darin punkte.cjs mit 16 Fortsetzungen je eigenem Griff ans Schloss; 163 Urteile
# + 89 UNGEMESSEN lagen nur im Baum, gepusht wurde erst nach dem Ende der GANZEN Sitzung, die Grenz-Flagge las diese Kette nur zwischen
# zwei Sitzungen). Jetzt wacht teil() WÄHREND der Sitzung (Takt KANDIDAT_TAKT s) über die Mess-Datei des Baums — punkte.cjs schreibt sie
# je Lauf (melde) —, und jede neu geurteilte Station ist eine STATIONS-GRENZE (KANDIDAT_TAKT: ganze Sekunden, Vorgabe 5):
#   BUCHUNG  sie wird sofort nach punkte-maschine gepusht (der EINE Schreiber, unten bei buche) und steht erst nach Exit 0 als
#            „GEPUSHT (Versuch v) <n> Station(en)“ in der Kette — der Zähler der Runde steigt je Station, nie erst am Ende der Sitzung.
#   GRENZE   liegt dort die Grenz-Flagge des Dienstes (SPRUNG: WEICHT/HALT) oder wartet ein CI-Job im Start-Hook, endet die Sitzung an
#            DIESER Grenze: der Baum des Laufs fällt über die EIGENE Start-PID (taskkill -T, wie gpu-lauf.sh bei der Verdrängung), die
#            gerade begonnene Station ist das Einzige, was verloren geht; was geurteilt ist, ist gepusht. Ein Lauf, den gpu-lauf.sh
#            VERDRÄNGT (er fing die Sitzung nach dem Job von vorn an), fällt ebenso sofort — der Rest stellt sich hinten an.
# Ein Teil, der Stationen buchte, verbraucht keinen Versuch (die VERSUCHE zählen nur Sitzungen ohne eine einzige Station).
TAKT=${KANDIDAT_TAKT:-5}
DECKEL=${KANDIDAT_DECKEL_S:-1740} # die Uhr der Sitzung (= TEIL_BUDGET_S des Dienstes): an der ersten Stations-Grenze danach endet sie
# ohne <liste> <a> <b> — die Stationen der Liste, die weder in a noch in b stehen (alles mit Komma)
ohne() { echo "$1" | tr ',' '\n' | grep . | grep -vxF -f <(echo "$2,$3" | tr ',' '\n' | grep .) | paste -sd, -; }
# grenze_grund — warum die Sitzung an dieser Stations-Grenze endet (leer: sie misst weiter)
grenze_grund() {
  [ -n "$SPRUNG" ] && [ -f "$SPRUNG" ] && { echo "die Grenz-Flagge des Dienstes liegt"; return; }
  ( . $SCHLOSS; type ci_wartet >/dev/null 2>&1 && ci_wartet ) && echo "ein CI-Job wartet im Start-Hook"; return 0; }
# halte_an — der Lauf fällt samt seinem Baum (Chrome, gpu-lauf.sh) über die eigene Start-PID; ein Schloss, dessen Halter so fiel, löst
# schloss_verwaist sofort (pid lebt nicht) — nie ein fremdes
halte_an() {
  [ -n "$WK" ] && taskkill -F -T -PID "$WK" > /dev/null 2>&1
  kill -9 $LP 2>/dev/null; wait $LP 2>/dev/null
  ( . $SCHLOSS; type schloss_verwaist >/dev/null 2>&1 && schloss_verwaist ) 2>> $L; return 0; }
# buche <name> <versuch> <stationen> — DER EINE SCHREIBER (Koordinator 21.11. 01:10; Fund: die GTX-Runde 2 zählte 1 290 von 1 428
# Stationen am 31ea3847, der Ursprung trug KEINE Mess-Datei — seit 19.11. 14:57:02 lag die verwaiste Index-Sperre
# gtx-dauer/index-punkte-maschine.tmp.lock eines git, das beim Dienst-Tausch fiel; jeder `punkte-offen.cjs push` scheiterte an read-tree
# (736 Versuche in gtx-dauer/dauer.log), und die Kette schrieb trotzdem GEPUSHT). Jetzt wie die Radeon: `runde.cjs push-pfade` — der
# frische Ursprungs-Kopf, NUR die eigenen Geräte-Pfade des Kopfs (Mess-Datei, referenz-gtx, Roh ohne sitzung-*, Akten), ein Index je
# Prozess, commit-tree, Push, bei Ablehnung von vorn. Exit 0 = gepusht (Rückgabe 0); sonst „PUSH ROT <kopf8>: <grund>“ in der Kette
# und in $PUSH_ROT (Zeit, Kopf, Sitzung, Grund — landung-dienst.sh hebt daraus den Alarm), Rückgabe 1, nie still. Die Stationen eines
# gescheiterten Pushs (PUSH_OFFEN) zählt die nächste GEPUSHT-Zeile mit: der Zähler der Runde nennt nur, was der Ursprung trägt.
PUSH_CJS=${KANDIDAT_PUSH_CJS:-$RUNDE_CJS}
PUSH_ROT=${KANDIDAT_PUSH_ROT:-$N/omen.push-rot}
PUSH_OFFEN=
buche() { local name=$1 v=$2 B=$3 o rc
  # CPU-RUHE (10.11., Koordinator 07:30: nie neben einem echt-/Probe-Job): der Push wartet, solange ein CI-Job das Schloss hält oder wartet
  . $SCHLOSS; cpu_ruhe 2>> $L
  # DAS GESETZ DER ROH-BILDER (19.11.): ein Bild, dessen Station ihr Urteil gegen stand.json hält, zieht in die Ablage am Gerät (nur seine
  # Prüfsumme reist); ein Beweis- oder Täter-Bild (Urteil wechselt) bleibt im Baum und reist mit
  node "$RUNDE_CJS" bilder "$PM" gtx "$K" "$BILD_ABLAGE" >> $L 2>&1
  o=$(node "$PUSH_CJS" push-pfade "$(cygpath -m "$PM")" punkte-maschine gtx "$K" "OMEN GTX: messung ${K:0:8} $name-v$v, $(zahl "$B") Station(en) (kandidat.sh)" 2>> $L)
  rc=$?
  [ -n "$o" ] && echo "$o" >> $L
  if [ "$rc" = 0 ]; then rm -f "$PUSH_ROT"; return 0; fi
  o=${o:-runde.cjs push-pfade Exit $rc ohne Zeile}
  echo "$(date '+%T') $name PUSH ROT ${K:0:8}: $o — die Messung bleibt im Baum, nichts verworfen" >> $L
  echo "$(date -Iseconds) ${K:0:8} $name $o" > "$PUSH_ROT"
  PUSH_OFFEN=${PUSH_OFFEN:+$PUSH_OFFEN,}$B
  return 1; }
# teil <name> <stationen> <versuch> — EINE Sitzung: 0 ganz gepusht · 1 gefallen (VERDRÄNGT oder ein CI-Job an einer Grenze; gepusht ist,
# was sie fertig maß; REST_TEIL = der Rest) · 2 an der Grenz-Flagge des Dienstes beendet (REST_TEIL = der Rest); TEIL_GEBUCHT = Zahl
teil() { local name=$1 R=$2 v=$3 rest n neu g i grund= B=
  until frei; do sleep 10; done; local d0=$(verdr)
  echo "$(date '+%T') ${K:0:8} $name Versuch $v START ($R)" >> $L
  TEIL=$name-v$v NUR=$R node punkte-offen.cjs lauf $K >> $L 2>&1 & LP=$!
  WK=$(cat /proc/$LP/winpid 2>/dev/null)
  local s=0 k=0 t0=$(date +%s) wv= w AUS=$N/punkte-offen-${K:0:8}-$name-v$v.out
  while kill -0 $LP 2>/dev/null; do
    sleep 1
    s=$((s + 1))
    kill -0 $LP 2>/dev/null || break
    [ $((s % TAKT)) = 0 ] || continue
    # die erste Station einer (Fortsetzungs-)Sitzung nennt punkte.cjs beim Beginn („SITZUNG die Welt vor <id>“): eine Zeile mit Uhr
    w=$(tail -c 20000 "$AUS" 2>/dev/null | sed -n 's/^  SITZUNG die Welt vor \([^:]*\): .*/\1/p' | tail -n 1)
    [ -n "$w" ] && [ "$w" != "$wv" ] && { wv=$w; echo "$(date '+%T') $name STATION $w beginnt" >> $L; }
    [ $(verdr) -gt $d0 ] && { grund="VERDRÄNGT von einem CI-Job"; halte_an; break; }
    rest=$(node "$RUNDE_CJS" offen "$PM" - gtx "$K" "$R" 2>/dev/null) || continue
    neu=$(ohne "$R" "$rest" "$B")
    [ -n "$neu" ] || continue
    # EINE STATIONS-GRENZE: eine Station ist geurteilt, die nächste hat eben begonnen — je Station EINE Zeile mit Uhr (der Puls liest sie)
    for i in ${neu//,/ }; do k=$((k + 1)); echo "$(date '+%T') $name STATION $i geurteilt ($k/$(zahl "$R"))" >> $L; done
    g=$(grenze_grund)
    # DER DECKEL DER SITZUNG (Koordinator 11:07): runde.cjs teile packt nach Σ Deckel der Eich-Tafel (je Lauf 40–90 s), ein Lauf dauert in
    # der Sitzung 2–3 min, und punkte.cjs öffnet nach jeder gerissenen Fahrt eine Fortsetzung ohne Ende — die Uhr der Sitzung schneidet sie
    [ -z "$g" ] && [ $(( $(date +%s) - t0 )) -ge "$DECKEL" ] && g="der Deckel der Sitzung ($DECKEL s, seit $(date -d @$t0 '+%T'))"
    if [ -n "$g" ] && [ "${g#der Deckel}" != "$g" ]; then grund=$g; halte_an; echo "$(date '+%T') $name DECKEL: $g — die Sitzung endet an der Station nach $k von $(zahl "$R"), der Rest folgt sofort in einer neuen" >> $L; break; fi
    [ -n "$g" ] && { grund=$g; halte_an; echo "$(date '+%T') $name GRENZE: $g — die Sitzung endet an der Station nach $(zahl "${B:+$B,}$neu") von $(zahl "$R")" >> $L; break; }
    B=${B:+$B,}$neu
    if buche $name $v "$neu"; then
      echo "$(date '+%T') $name GEPUSHT (Versuch $v) $(zahl "${PUSH_OFFEN:+$PUSH_OFFEN,}$neu") Station(en) — gebucht an der Stations-Grenze: ${PUSH_OFFEN:+$PUSH_OFFEN,}$neu" >> $L
      PUSH_OFFEN=
    fi
  done
  wait $LP 2>/dev/null
  # der Roh-Ordner DIESER Sitzung (14.11.: jede Sitzung schreibt in ihren eigenen `sitzung-<kennung>`, der jüngste Name ist der letzte)
  SO=$(ls -d $ROH/${K:0:8}-gtx/sitzung-* 2>/dev/null | tail -n 1); rm -rf "${N:?}/punkte-sitzung-${name:?}-v$v"; [ -n "$SO" ] && cp -r "$SO" "$N/punkte-sitzung-$name-v$v" 2>/dev/null
  REST_TEIL=
  if [ -n "$grund" ] || [ $(verdr) -gt $d0 ]; then
    rest=$(node "$RUNDE_CJS" offen "$PM" - gtx "$K" "$R" 2>>$L)
    REST_TEIL=$rest
  fi
  neu=$(ohne "$R" "$REST_TEIL" "$B")
  # die Stationen, die erst nach der letzten Grenze geurteilt wurden (die Sitzung endete dazwischen): auch ihre Zeile mit Uhr
  if [ -n "$neu" ]; then
    for i in ${neu//,/ }; do k=$((k + 1)); echo "$(date '+%T') $name STATION $i geurteilt ($k/$(zahl "$R"))" >> $L; done
  fi
  TEIL_GEBUCHT=$(zahl "${B:+$B,}$neu")
  [ "$TEIL_GEBUCHT" = 0 ] && return 1   # nichts fertig gemessen
  # der Schluss-Push (push-pfade trägt alle eigenen Pfade des Kopfs, auch die Roh-Ausgaben einer jüngeren Messung im Baum)
  if buche $name $v "$neu"; then
    echo "$(date '+%T') $name GEPUSHT (Versuch $v) $(zahl "${PUSH_OFFEN:+$PUSH_OFFEN,}$neu") Station(en)${REST_TEIL:+ — BEHALTEN je Station, der Rest folgt: $REST_TEIL}" >> $L
    PUSH_OFFEN=
  fi
  node $N/zeile-erledigt.cjs $K $name "$(ohne "$R" "$REST_TEIL")" >> $L 2>&1
  [ -n "$REST_TEIL" ] || return 0
  [ -n "$SPRUNG" ] && [ -f "$SPRUNG" ] && [ "${grund#die Grenz-Flagge}" != "$grund" ] && return 2
  [ "${grund#der Deckel}" != "$grund" ] && return 3
  return 1; }
# SPRUNG=<datei> (die Grenz-Flagge des Dienstes): liegt die Datei, endet die laufende Sitzung an ihrer nächsten Stations-Grenze (teil,
# Exit 2) und die Liste vor der nächsten Sitzung (Halt, Weichen); der Rest folgt im nächsten Takt des Dienstes an derselben Station.
Q=()
if [[ "$LISTE" == *";"* ]]; then
  i=0; IFS=';' read -ra TT <<< "$LISTE"; for T in "${TT[@]}"; do [ -n "$T" ] && { i=$((i+1)); Q+=("$i|1|$T|0"); }; done   # je Teil: Nummer|Versuch|Stationen|Sitzungen ohne Station
else
  OK=(); for s in ${LISTE//,/ }; do
    if (cd $PM && node meisterkarte-quelle/punkte/punkte.cjs run --sha $K --geraet gtx --nur "$s" --trocken 2>&1 | grep -q "keine Station"); then echo "$(date '+%T') $NAME $s: keine Station auf gtx - weg" >> $L; else OK+=("$s"); fi
  done
  G=${EINZELN:+1}; G=${G:-${TEIL_N:-9}}; i=0
  while [ $i -lt ${#OK[@]} ]; do Q+=("$((i/G+1))|1|$(IFS=,; echo "${OK[*]:$i:$G}")|0"); i=$((i+G)); done
fi
GANZ=${#Q[@]}; DA=0; OFFEN=
while [ ${#Q[@]} -gt 0 ]; do
  [ -n "$SPRUNG" ] && [ -f "$SPRUNG" ] && { echo "$(date '+%T') $NAME SPRUNG: die Grenz-Flagge des Dienstes liegt (WEICHT oder HALT - der Grund steht in stufe/landung.log; seit dem Gesetz der Runde 19.11. nie eine Landung) - die Liste endet nach $DA von $GANZ Teilen (${#Q[@]} nicht gefahren)" >> $L; break; }
  IFS='|' read -r nr v T f <<< "${Q[0]}"; Q=("${Q[@]:1}")
  # DIE GETEILTE FRONT (Koordinator 22.11.): vor jeder Sitzung fällt aus dem Teil, was die Radeon an DIESEM Kopf ROT urteilte (runde.cjs
  # offen --anders radeon; ihre Mess-Datei im Baum, wie ihn pm-stand.cjs zu Beginn der vorigen Sitzung von origin holte — ein node je
  # Sitzung, kein Netz-Gang). In der Sitzung fragen die Grenzen weiter nur nach dem EIGENEN Eintrag (was diese Sitzung fertig maß).
  T2=$(node "$RUNDE_CJS" offen "$PM" - gtx "$K" "$T" --anders radeon 2>>$L) && [ "$(zahl "$T2")" != "$(zahl "$T")" ] && {
    echo "$(date '+%T') $NAME-$nr: $(( $(zahl "$T") - $(zahl "$T2") )) Station(en) fallen aus dem Teil — ROT auf der Radeon (oder schon gemessen) am ${K:0:8}" >> $L; T=$T2; }
  [ -n "$T" ] || { DA=$((DA+1)); continue; }
  TEIL_GEBUCHT=0
  teil $NAME-$nr "$T" $v; rc=$?
  [ $rc = 0 ] && { DA=$((DA+1)); continue; }
  T=${REST_TEIL:-$T}
  [ "$TEIL_GEBUCHT" -gt 0 ] && f=0 || f=$((f+1))
  # an der Grenz-Flagge beendet: der Rest bleibt vorn, die Liste endet oben (SPRUNG) — kein Versuch, kein Warten auf einen CI-Job
  [ $rc = 2 ] && { Q=("$nr|$((v+1))|$T|$f" "${Q[@]}"); continue; }
  # am Deckel der Sitzung geschnitten: der Rest fährt SOFORT als nächste Sitzung (vorn, in seiner Reihe), kein Versuch, kein Warten
  [ $rc = 3 ] && { Q=("$nr|$((v+1))|$T|$f" "${Q[@]}"); continue; }
  if [ $f -lt $VERSUCHE ]; then
    echo "$(date '+%T') $NAME-$nr Versuch $v VERDRÄNGT - der Rest ($(zahl "$T") Station(en)) stellt sich ans Ende der Liste (${#Q[@]} davor)" >> $L; Q+=("$nr|$((v+1))|$T|$f")
  else
    echo "$(date '+%T') $NAME-$nr Versuch $v VERDRÄNGT - OFFEN nach $VERSUCHE Versuchen ($T): der Lauf überdauert $GPU_LAUF_WEICH_S s neben einem wartenden CI-Job" >> $L; OFFEN="$OFFEN $T"
  fi
  # der Job, der verdrängte, fährt erst zu Ende (sein Ende steht in hook.log): die nächste Sitzung beginnt nie in seine Ruhe
  e0=$(enden); w=0; until [ $(enden) -gt $e0 ] || { [ $w -ge 6 ] && frei; }; do sleep $SCHLAF; w=$((w+1)); done
done
[ -n "$OFFEN" ] && echo "$(date '+%T') $NAME OFFEN nach $VERSUCHE Versuchen:$OFFEN" >> $L
echo "$(date '+%T') $NAME ENDE ${K:0:8}" >> $L
