#!/bin/bash
# farm-lauf.sh <sha40> — die headless Farm (punkte-farm.yml auf GitHub) für jede Station ohne frische Messung am SHA (--offen),
# im Worktree wege-tritt auf punkte-maschine; danach die Mess-Datei nach punkte-maschine (bis 6 Versuche gegen die OMEN-Commits)
S="$1"; s8="${S:0:8}"
cd /tmp/claude/w3/wege-tritt || exit 1
G="git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com"
git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" "+refs/heads/koordination:refs/remotes/origin/koordination" || exit 2
git checkout -q -B punkte-lauf origin/punkte-maschine || exit 3
$G merge -q --no-edit origin/koordination || { git merge --abort; echo "KONFLIKT koordination → punkte-lauf"; exit 4; }
# die Farm holt den Punkte-Baum über den Namen dieses Zweigs (Eingabe KOORD): er muss auf GitHub stehen
git push -q -f origin HEAD:refs/heads/punkte-lauf || exit 7
echo "FARM $s8 START $(date +%H:%M)"
node meisterkarte-quelle/punkte/punkte.cjs run --sha "$S" --geraet headless --offen 2>&1 | grep -E "^(  )?(GRÜN|ROT |SITZUNG|FARM|Farm|Punkte-Maschine)|→ |Exit" | tail -n 40
f="meisterkarte-quelle/punkte/messung/$s8-headless.json"
[ -f "$f" ] || { echo "keine Mess-Datei $f"; exit 5; }
g=$(node -e 'const j=require("./'"$f"'");const e=Object.values(j.je||{});console.log(e.filter(x=>x.gruen).length+" grün / "+e.filter(x=>!x.gruen).length+" rot")')
git add "$f" && $G commit -q -m "Punkte-Messung $s8 headless: $g (Farm --offen)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
for v in 1 2 3 4 5 6; do
  git push -q origin HEAD:punkte-maschine 2>/dev/null && { echo "GEPUSHT punkte-maschine $(git rev-parse --short HEAD): $g"; exit 0; }
  git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" && $G merge -q --no-edit origin/punkte-maschine
  sleep 3
done
echo "ROT: push nach 6 Versuchen gescheitert"; exit 6
