#!/bin/bash
# zeit-lauer.sh — wartet auf Ruhe (fremde Kerne < Schwelle der Radeon, zweimal hintereinander) und misst dann die Zeit-Stationen
# am aktuellen main. Grund 09.11.: die Claude-App trägt 2–4 fremde Kerne = +7–13 % an ankunft (Eichung 231bcdd4); neben ihr
# urteilt keine Zeit-Station. Läuft bis zu 12 h.
cd /tmp/claude/w3/pm/meisterkarte-quelle/punkte
L="haar.K2#1,leib.K1#1,lod.K5#1,mensch.K4#1,studios.K4#1,studios.K4#2,tiere.K5#1,tore.K1#1,vegetation.K3#1,ankunft.K1#1,ankunft.K3#1,ankunft.K4#1,ankunft.K5#1,profiband.K1#1,profiband.K2#1,profiband.K2#2,profiband.K3#1,profiband.K3#2,profiband.K5#1,mensch.K5#1"
ruhig=0
for i in $(seq 1 720); do
  # keine andere Punkte-Messung neben uns
  if [ "$(ps -ef | grep 'punkte.cjs run' | grep -v grep | wc -l)" != 0 ]; then sleep 60; continue; fi
  k=$(timeout 60 node punkte.cjs fremdlast --sek 20 2>/dev/null | sed -n 's/.*dichtestes 10-s-Fenster \([0-9,]*\) Kerne.*/\1/p' | tr , .)
  if [ -n "$k" ] && awk -v k="$k" 'BEGIN{exit !(k < 0.5)}'; then ruhig=$((ruhig+1)); else ruhig=0; fi
  echo "$(date +%H:%M) fremd ${k:-?} Kerne · ruhig $ruhig"
  [ $ruhig -ge 2 ] && break
  sleep 40
done
[ $ruhig -ge 2 ] || { echo "12 h ohne Ruhe"; exit 1; }
cd /tmp/claude/w3/pm && git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" && git rebase -q origin/punkte-maschine 2>&1 | tail -1
S=$(git -C /c/Users/micha/AnazhRealm-profiband ls-remote origin refs/heads/main | cut -f1)
cd meisterkarte-quelle/punkte; echo "$(date +%H:%M) RUHE — misst ${S:0:8}: $L"
node punkte.cjs run --sha $S --geraet radeon --nur $L 2>&1 | grep -E "^  (GRÜN|ROT|OFFEN)" | cut -c1-200
cd /tmp/claude/w3/pm && git add -A meisterkarte-quelle/punkte/messung && git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit -qm "Messung ${S:0:8} radeon: die Zeit-Stationen in Ruhe (zeit-lauer)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"; for i in 1 2 3; do git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"; git rebase -q origin/punkte-maschine && git push -q origin HEAD:punkte-maschine && { echo gepusht; break; }; sleep 4; done
cd meisterkarte-quelle/punkte && node punkte.cjs buchen --trocken --kopf $S > /tmp/claude/w3/buche-trocken-zeit2.txt 2>&1; grep -E "^Kopf|^  RÜCKFALL" /tmp/claude/w3/buche-trocken-zeit.txt | cut -c1-200
