#!/bin/bash
# wand-summe.sh <zweig> [<zweig> …] — die WACHSTUMS-WAND vor dem Zug, OHNE LLM (Lehre z357, 10.11. 02:02: w27-takt-streu fuhr allein
# und fiel nach 5 min an Prüf +1672 / Spiel +1217). Die Wand urteilt über die SUMME des Zugs (diag-betriebsgesetz.cjs Abschnitt 6): ein
# Linsen-Zweig fährt mit Spiel-Zweigen. Dieses Werkzeug misst je Zweig und für das Bündel in der genannten Reihenfolge gegen origin/main,
# mit dem Gesetz von main selbst (kein Zwilling der Zählung). Letzte Zeile: „BÜNDEL GRÜN …“ oder „BÜNDEL ROT …“ / „BÜNDEL KONFLIKT bei …“.
R=/c/Users/micha/AnazhRealm-profiband; W=/tmp/claude/w4/wand-mess; A="-c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com"
export NODE_PATH="C:/Users/micha/AnazhRealm-profiband/node_modules"
[ $# -ge 1 ] || { echo "Aufruf: wand-summe.sh <zweig> [<zweig> …]"; exit 2; }
git -C $R fetch -q origin "+refs/heads/main:refs/remotes/origin/main" 2>/dev/null
for b in "$@"; do git -C $R fetch -q origin "+refs/heads/$b:refs/remotes/origin/$b" 2>/dev/null || { echo "$b: kein Zweig auf origin"; exit 2; }; done
git -C $R worktree remove --force $W 2>/dev/null; git -C $R worktree add -q --detach $W origin/main || exit 2
cd $W || exit 2; G=$(git rev-parse HEAD)
mess() { node scripts/diag-betriebsgesetz.cjs --grund $G --kopf $1 2>&1 | grep -oE "Wachstum --grund: [^·]+· erlaubt [0-9-]+|WACHSTUMS-WAND \(--grund\): .*" | head -1 | cut -c1-300; }
K=$G
for b in "$@"; do
  if T=$(git merge-tree --write-tree $G origin/$b 2>/dev/null | head -1) && git merge-tree --write-tree $G origin/$b >/dev/null 2>&1; then
    echo "$b $(git rev-parse --short=8 origin/$b): $(mess $(git $A commit-tree $T -p $G -m "wand-summe $b"))"
  else echo "$b $(git rev-parse --short=8 origin/$b): KONFLIKT gegen main"; fi
  if [ -n "$K" ]; then
    if git merge-tree --write-tree $K origin/$b >/dev/null 2>&1; then K=$(git $A commit-tree $(git merge-tree --write-tree $K origin/$b | head -1) -p $K -p origin/$b -m "wand-summe bündel $b"); else echo "BÜNDEL KONFLIKT bei $b"; K=""; fi
  fi
done
[ -n "$K" ] || exit 1
s=$(mess $K); case "$s" in "Wachstum --grund"*) echo "BÜNDEL GRÜN (Grund ${G:0:8}): $s"; exit 0 ;; *) echo "BÜNDEL ROT (Grund ${G:0:8}): $s"; exit 1 ;; esac
