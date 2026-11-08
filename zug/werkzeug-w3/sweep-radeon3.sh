#!/bin/bash
# Mess-Fenster 1: volle Radeon-Messung aller offenen Stationen am main NACH z323; die Radeon gibt das Label gpu-probe für das Fenster ab
# (die Proben laufen auf der OMEN), danach zurück (trap). Danach Buchung trocken.
W=/tmp/claude/w3
TOK() { printf 'protocol=https\nhost=github.com\n\n' | git -C /c/Users/micha/AnazhRealm-profiband credential fill | sed -n 's/^password=//p'; }
busy() { curl -s -H "Authorization: Bearer $(TOK)" https://api.github.com/repos/MiguellD/AnazhRealm/actions/runners/$1 | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).busy))'; }
for i in $(seq 1 240); do grep -qE "\[z323w\] (GELANDET|FAHRT ROT)" /tmp/claude/fahre-z323w.log 2>/dev/null && break; sleep 30; done
echo "$(date +%H:%M) z323: $(grep -hE '\[z323w\] (GELANDET|FAHRT ROT)' /tmp/claude/fahre-z323w.log | tail -1 | cut -c1-160)"
while ps -ef | grep -v grep | grep -q "punkte.cjs selbsttest"; do sleep 20; done
for i in $(seq 1 60); do [ -f kette-z324.out ] && grep -qE "VORZUG (GRÜN|ROT)|EXIT=|kein Zweig" kette-z324.out && break; sleep 20; done; echo "$(date +%H:%M) z324-Vorzug: $(grep -hE "VORZUG|EXIT=" kette-z324.out 2>/dev/null | tail -1 | cut -c1-120)"
bash $W/label.sh 22 del gpu-probe; trap "bash $W/label.sh 22 add gpu-probe" EXIT
while [ "$(busy 22)" = true ]; do sleep 20; done; echo "$(date +%H:%M) Radeon-Läufer frei"
ruhig=0; for i in $(seq 1 90); do if ps -ef | grep -v grep | grep -qE "playtest|check:statik|npm-cli|run check|punkte.cjs run"; then ruhig=0; else ruhig=$((ruhig+1)); fi; [ $ruhig -ge 3 ] && break; sleep 20; done
S=$(git -C /c/Users/micha/AnazhRealm-profiband ls-remote origin refs/heads/main | cut -f1); echo "$S" > $W/sweep-sha.txt
echo "$(date +%H:%M) Ruhe $ruhig · main ${S:0:8} · Messung startet"
cd $W/pm && git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" && git rebase -q origin/punkte-maschine 2>&1 | tail -1
cd meisterkarte-quelle/punkte && node punkte.cjs run --sha $S --geraet radeon --offen > $W/sweep-radeon-${S:0:8}.log 2>&1
echo "$(date +%H:%M) Lauf Exit $? · $(grep -cE '^  GRÜN' $W/sweep-radeon-${S:0:8}.log) grün · $(grep -cE '^  ROT' $W/sweep-radeon-${S:0:8}.log) rot"
grep -E "PUNKTE|^  ROT" $W/sweep-radeon-${S:0:8}.log | cut -c1-200 | head -40
cd $W/pm && git add -A meisterkarte-quelle/punkte/messung && git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit -qm "Messung ${S:0:8} radeon: alle offenen Stationen in einer Welt

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"; for i in 1 2 3 4; do git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"; git rebase -q origin/punkte-maschine && git push -q origin HEAD:punkte-maschine && { echo gepusht; break; }; sleep 5; done
cd meisterkarte-quelle/punkte && node punkte.cjs buchen --trocken --kopf $S 2>&1 | grep -E "Σ|Rückfall|gehalten" | head -8 | cut -c1-250
