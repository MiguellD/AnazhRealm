#!/bin/bash
# 1510-a9e-abab (neuer B-Kopf d5deed14), Vorbereitung in der Pause der Boot-Fenster-Probe: Worktree abab-pd5d (LF), node_modules
# als Junction auf abab-b542, Vergleich mit 015a3f74.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$R/p3/k1510ge/fortschritt.log; O=$R/p3/k1510a9e/vorbereiten2.out
n0=$(grep -c " ende" $L)
until [ "$(grep -c " ende" $L)" -gt "$n0" ]; do sleep 3; done
echo "$(date +%T) Pause erkannt" > $O
cd $R/abab-pa9e && git fetch -q origin >> $O 2>&1
echo "integ-probe $(git rev-parse --short refs/remotes/origin/integ-probe) main $(git rev-parse --short refs/remotes/origin/main)" >> $O
[ -d $R/abab-pd5d ] || git -c core.autocrlf=false worktree add -q --detach $R/abab-pd5d d5deed14 >> $O 2>&1
[ -e $R/abab-pd5d/node_modules ] || cmd //c mklink //J "C:\Users\micha\Desktop\AnazhRealm-OMEN\abab-pd5d\node_modules" "C:\Users\micha\Desktop\AnazhRealm-OMEN\abab-b542\node_modules" >> $O 2>&1
git diff --stat 015a3f74 d5deed14 -- package.json package-lock.json >> $O 2>&1
git diff --stat 015a3f74 d5deed14 | tail -1 >> $O
git log --oneline --first-parent a9e21f17..d5deed14 >> $O
echo "$(date +%T) fertig" >> $O
