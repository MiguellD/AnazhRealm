#!/bin/bash
# wache-k10.sh — endet beim ersten Ereignis: GitHub Actions wieder operational · neue Zeile in koordination zug/erledigt.txt ·
# neue Abgabe auf w26-*/w27-* · Ruhe-Läufer zeit-lauer2 meldet RUHE oder ein Ergebnis. Höchstens 4 h.
R=/c/Users/micha/AnazhRealm-profiband; S=/tmp/claude/w3/abgabe.seen; touch $S
E0=$(git -C $R show origin/koordination:zug/erledigt.txt 2>/dev/null | wc -l)
Z0=$(grep -c . /tmp/claude/w3/zeit-lauer2.out 2>/dev/null)
for i in $(seq 1 120); do
  a=$(curl -s https://www.githubstatus.com/api/v2/components.json | node -e 'try{const j=JSON.parse(require("fs").readFileSync(0));const c=j.components.find(c=>c.name==="Actions");console.log(c?c.status:"?")}catch(e){console.log("?")}')
  [ -z "$A0" ] && A0=$a; [ "$a" != "$A0" ] && [ "$a" != "?" ] && { echo "$(date +%H:%M) ACTIONS $A0 → $a"; exit 0; }
  for f in /tmp/claude/fahre-z3[5-9][0-9]w.log; do [ -f "$f" ] || continue; l=$(grep -E "GELANDET|FAHRT ROT" "$f" | tail -1); [ -z "$l" ] && continue; grep -qxF "$l" /tmp/claude/w3/zugende.seen && continue; echo "$l" >> /tmp/claude/w3/zugende.seen; echo "ZUG $(basename $f .log): ${l:0:300}"; exit 0; done
  git -C $R fetch -q origin "+refs/heads/koordination:refs/remotes/origin/koordination" 2>/dev/null
  E=$(git -C $R show origin/koordination:zug/erledigt.txt 2>/dev/null | wc -l)
  [ "$E" -gt "$E0" ] && { echo "$(date +%H:%M) ERLEDIGT: $(git -C $R show origin/koordination:zug/erledigt.txt | tail -$((E-E0)) | tr '\n' ' ' | cut -c1-300)"; exit 0; }
  grep -qE "RUHE|gepusht|12 h ohne" /tmp/claude/w3/zeit-lauer2.out 2>/dev/null && [ "$(grep -c . /tmp/claude/w3/zeit-lauer2.out)" != "$Z0" ] && grep -q "RUHE" /tmp/claude/w3/zeit-lauer2.out && ! grep -q "RUHE" /tmp/claude/w4/zeit-ruhe.seen 2>/dev/null && { echo RUHE > /tmp/claude/w4/zeit-ruhe.seen; echo "$(date +%H:%M) RADEON misst in Ruhe: $(grep RUHE /tmp/claude/w3/zeit-lauer2.out | tail -1)"; exit 0; }
  while read sha ref; do b=${ref#refs/heads/}; grep -q "^$b $sha$" $S && continue
    git -C $R fetch -q origin "+$ref:refs/remotes/origin/$b" 2>/dev/null; t=$(git -C $R log -1 --format=%s $sha 2>/dev/null); echo "$b $sha" >> $S
    case "$t" in Abgabe*) echo "$(date +%H:%M) ABGABE $b ${sha:0:8} ${t:0:200}"; exit 0 ;; esac
  done < <(git -C $R ls-remote origin 'refs/heads/w26-*' 'refs/heads/w27-*' 2>/dev/null)
  sleep 120
done; echo "4 h ohne Ereignis (Actions: $a)"
