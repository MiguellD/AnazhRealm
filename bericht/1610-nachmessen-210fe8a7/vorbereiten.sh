#!/bin/bash
# 1610-Nachmessen, Vorbereitung in der Pause der a9e-Serie: Worktree abab-p210 (integ-probe 210fe8a7 = d5deed14 + F1 + G1 + W1 + B2, LF), node_modules
# als Junction auf abab-b542.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$R/p3/k1510a9e/fortschritt.log; O=$R/p3/k1610n/vorbereiten.out
n0=$(grep -c "exit=" $L)
until [ "$(grep -c "exit=" $L)" -gt "$n0" ]; do sleep 3; done
echo "$(date +%T) Pause erkannt" > $O
cd $R/abab-pd5d && git fetch -q origin >> $O 2>&1
echo "integ-probe $(git rev-parse --short refs/remotes/origin/integ-probe) main $(git rev-parse --short refs/remotes/origin/main)" >> $O
[ -d $R/abab-p210 ] || git -c core.autocrlf=false worktree add -q --detach $R/abab-p210 210fe8a7 >> $O 2>&1
[ -e $R/abab-p210/node_modules ] || cmd //c mklink //J "C:\Users\micha\Desktop\AnazhRealm-OMEN\abab-p210\node_modules" "C:\Users\micha\Desktop\AnazhRealm-OMEN\abab-b542\node_modules" >> $O 2>&1
git diff --stat d5deed14 210fe8a7 -- package.json package-lock.json >> $O 2>&1
git diff --stat d5deed14 210fe8a7 | tail -1 >> $O
git log --oneline --first-parent d5deed14..210fe8a7 >> $O
echo "$(date +%T) fertig" >> $O
