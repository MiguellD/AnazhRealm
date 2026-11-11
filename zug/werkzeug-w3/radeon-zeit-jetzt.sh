#!/bin/bash
# radeon-zeit-jetzt.sh — die Zeit-Stationen SOFORT (fremdUrteil: GRÜN trotz Last zählt, nur ROT unter Last ist UNGEMESSEN), dann die
# headless-Zeit-Stationen auf dem Laptop (die Farm zählt ihre eigenen Dienste als fremd), Mess-Datei nach punkte-maschine
cd /tmp/claude/w3/pm && git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" && git rebase -q origin/punkte-maschine 2>&1 | tail -1
S=$(git -C /c/Users/micha/AnazhRealm-profiband ls-remote origin refs/heads/main | cut -f1)
cd meisterkarte-quelle/punkte; echo "$(date +%H:%M) ZEIT radeon ${S:0:8}"
node punkte.cjs run --sha $S --geraet radeon --nur leib.K1#1,tore.K1#1,ankunft.K1#1,ankunft.K3#1,ankunft.K5#1,profiband.K1#1,profiband.K2#1,profiband.K2#2,profiband.K3#1,profiband.K3#2,profiband.K5#1,mensch.K5#1 2>&1 | grep -E "^  (GRÜN|ROT|OFFEN)" | cut -c1-260
echo "$(date +%H:%M) ZEIT headless (laptop) ${S:0:8}"
node punkte.cjs run --sha $S --geraet headless --farm laptop --nur stoffe.K2#2,physik.K3#2,mensch.K4#2,ki.K5#1,tore.K5#1,streaming.K1#1,streaming.K2#1,streaming.K5#1,streaming.K5#2 2>&1 | grep -E "^  (GRÜN|ROT|OFFEN)" | cut -c1-260
cd /tmp/claude/w3/pm && git add -A meisterkarte-quelle/punkte/messung && git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit -qm "Messung ${S:0:8} radeon + headless (laptop): die Zeit-Stationen sofort, GRÜN trotz Last

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"; for i in 1 2 3 4 5; do git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"; git rebase -q origin/punkte-maschine && git push -q origin HEAD:punkte-maschine && { echo "$(date +%H:%M) gepusht"; break; }; sleep 5; done
echo ENDE
