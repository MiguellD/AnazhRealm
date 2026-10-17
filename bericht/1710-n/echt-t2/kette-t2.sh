#!/bin/bash
# echt T2: erst main 1215d560 je zwei Laeufe (ist er schon rot, ist es der Platz), dann git bisect run 25f53923..1215d560.
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/n1710-t2
D=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1710
cd "$WT" || exit 2
git -c core.autocrlf=false checkout -q --detach 1215d560
bash "$D/bisect-t2.sh"; ec=$?
echo "$(date +%T) Gegenprobe main 1215d560: rc=$ec" >> "$D/bisect-t2.log"
if [ $ec -ne 0 ]; then echo "$(date +%T) MAIN NICHT GUT - keine Bisektion" >> "$D/bisect-t2.log"; exit 3; fi
git -c core.autocrlf=false bisect start 25f53923 1215d560 >> "$D/bisect-t2.log" 2>&1
git -c core.autocrlf=false bisect run bash "$D/bisect-t2.sh" >> "$D/bisect-t2.log" 2>&1
echo "$(date +%T) bisect run rc=$?" >> "$D/bisect-t2.log"
git bisect log > "$D/bisect-t2-gitlog.txt" 2>&1
echo "KETTE ENDE" >> "$D/bisect-t2.log"
