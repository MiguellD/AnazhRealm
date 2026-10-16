#!/bin/bash
# 1510-a9e-abab, Vorbereitung in der Pause der k69d8-Serie: Worktrees abab-pa9e (integ-probe a9e21f17) und abab-pffe (ffe0e956), LF,
# node_modules als Junction auf abab-b542, Vergleich der package-lock mit 49824a19.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$R/p3/k1510k69d8/fortschritt.log; O=$R/p3/k1510a9e/vorbereiten.out
n0=$(grep -c " ende" $L)
until [ "$(grep -c " ende" $L)" -gt "$n0" ]; do sleep 3; done
echo "$(date +%T) Pause erkannt" > $O
cd $R/abab-p015 && git fetch -q origin >> $O 2>&1
echo "integ-probe $(git rev-parse --short refs/remotes/origin/integ-probe) main $(git rev-parse --short refs/remotes/origin/main)" >> $O
for p in "pa9e a9e21f17" "pffe ffe0e956"; do set -- $p
  [ -d $R/abab-$1 ] || git -c core.autocrlf=false worktree add -q --detach $R/abab-$1 $2 >> $O 2>&1
  [ -e $R/abab-$1/node_modules ] || cmd //c mklink //J "C:\Users\micha\Desktop\AnazhRealm-OMEN\abab-$1\node_modules" "C:\Users\micha\Desktop\AnazhRealm-OMEN\abab-b542\node_modules" >> $O 2>&1
done
git diff --stat 49824a19 a9e21f17 -- package.json package-lock.json >> $O 2>&1
git diff --stat 49824a19 a9e21f17 | tail -1 >> $O
git log --oneline --first-parent 49824a19..a9e21f17 | head -20 >> $O
git merge-base --is-ancestor 307e1bb7 a9e21f17 && echo "a9e21f17 TRAEGT messfolge-ruhe 307e1bb7" >> $O || echo "a9e21f17 OHNE messfolge-ruhe" >> $O
echo "$(date +%T) fertig" >> $O
