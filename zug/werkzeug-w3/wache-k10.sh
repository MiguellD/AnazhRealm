#!/bin/bash
# wache-k10.sh — endet beim ersten Ereignis: GitHub Actions wieder operational · neue Zeile in koordination zug/erledigt.txt ·
# neue Abgabe auf w26-*/w27-* · Ruhe-Läufer zeit-lauer4 meldet RUHE oder ein Ergebnis. Höchstens 4 h.
R=/c/Users/micha/AnazhRealm-profiband; S=/tmp/claude/w3/abgabe.seen; touch $S
TOK=$(printf "protocol=https
host=github.com

" | git -C $R credential fill 2>/dev/null | sed -n "s/^password=//p")
# DER LEERLAUF-ALARM (Schöpfer 09.11. 22:30: „wenn ein Gerät 15 min nicht ausgelastet ist, sollte dich das alarmieren“): je Gerät der Beweis
# der Arbeit — OMEN: Läufer-Job oder eine GTX-Mess-Datei auf punkte-maschine in 20 min; Radeon: Läufer-Job, lokale Messung oder GPU-Schloss;
# GTX 1050: Läufer-Job oder ein offener Auftrag in zug/sitzung.txt. 8 freie Runden (16 min) = Ereignis LEERLAUF
IO=0; IR=0; I3=0
E0=$(git -C $R show origin/koordination:zug/erledigt.txt 2>/dev/null | wc -l)
Z0=$(grep -c . /tmp/claude/w3/zeit-lauer4.out 2>/dev/null)
for i in $(seq 1 120); do
  a=$(curl -s https://www.githubstatus.com/api/v2/components.json | node -e 'try{const j=JSON.parse(require("fs").readFileSync(0));const c=j.components.find(c=>c.name==="Actions");console.log(c?c.status:"?")}catch(e){console.log("?")}')
  rb=$(curl -s -H "Authorization: Bearer $TOK" https://api.github.com/repos/MiguellD/AnazhRealm/actions/runners | node -e "try{const j=JSON.parse(require(\"fs\").readFileSync(0));const b=(n)=>((j.runners||[]).find(r=>r.name===n)||{}).busy?1:0;console.log(b(\"omen-gtx1060\")+\" \"+b(\"radeon-890m\")+\" \"+b(\"gtx1050-desktop\"))}catch(e){console.log(\"1 1 1\")}")
  set -- $rb
  git -C $R fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" 2>/dev/null
  og=$(git -C $R log -1 --since="20 minutes ago" --format=%h origin/punkte-maschine -- "meisterkarte-quelle/punkte/messung/*-gtx.json" 2>/dev/null)
  rl=$(ps -ef | grep -E "punkte.cjs run --sha .* --geraet (radeon|headless --farm laptop)|werkbank.cjs" | grep -v grep | wc -l); [ -d /tmp/claude/gpu-schloss ] && rl=1
  g3=$(git -C $R show origin/koordination:zug/sitzung.txt 2>/dev/null | grep -E " START geraet=gtx1050" | awk "{print $3}" | while read i; do git -C $R show origin/koordination:zug/erledigt.txt | grep -qE "^[0-9-]+ [0-9:]+ $i |^$i " || echo $i; done | head -1)
  [ "  [ -z "$A0" ] && A0=$a;" = 1 ] || [ -n "$og" ] && IO=0 || IO=$((IO+1)); [ "$2" = 1 ] || [ "$rl" != 0 ] && IR=0 || IR=$((IR+1)); [ "$3" = 1 ] || [ -n "$g3" ] && I3=0 || I3=$((I3+1))
  for g in "OMEN:$IO" "RADEON:$IR" "GTX1050:$I3"; do n=${g#*:}; [ "$n" -ge 8 ] && { echo "$(date +%H:%M) LEERLAUF ${g%%:*} seit $((n*2)) min — kein Job, keine Messung, kein Auftrag"; exit 0; }; done
  [ -z "$A0" ] && A0=$a; [ "$a" != "$A0" ] && [ "$a" != "?" ] && { echo "$(date +%H:%M) ACTIONS $A0 → $a"; exit 0; }
  for f in /tmp/claude/fahre-z3[5-9][0-9]w.log; do [ -f "$f" ] || continue; l=$(grep -E "GELANDET|FAHRT ROT" "$f" | tail -1); [ -z "$l" ] && continue; grep -qxF "$l" /tmp/claude/w3/zugende.seen && continue; echo "$l" >> /tmp/claude/w3/zugende.seen; echo "ZUG $(basename $f .log): ${l:0:300}"; exit 0; done
  git -C $R fetch -q origin "+refs/heads/koordination:refs/remotes/origin/koordination" 2>/dev/null
  E=$(git -C $R show origin/koordination:zug/erledigt.txt 2>/dev/null | wc -l)
  [ "$E" -gt "$E0" ] && { echo "$(date +%H:%M) ERLEDIGT: $(git -C $R show origin/koordination:zug/erledigt.txt | tail -$((E-E0)) | tr '\n' ' ' | cut -c1-300)"; exit 0; }
  grep -qE "RUHE|gepusht|12 h ohne" /tmp/claude/w3/zeit-lauer4.out 2>/dev/null && [ "$(grep -c . /tmp/claude/w3/zeit-lauer4.out)" != "$Z0" ] && grep -q "RUHE" /tmp/claude/w3/zeit-lauer4.out && ! grep -q "RUHE" /tmp/claude/w4/zeit-ruhe.seen 2>/dev/null && { echo RUHE > /tmp/claude/w4/zeit-ruhe.seen; echo "$(date +%H:%M) RADEON misst in Ruhe: $(grep RUHE /tmp/claude/w3/zeit-lauer4.out | tail -1)"; exit 0; }
  while read sha ref; do b=${ref#refs/heads/}; grep -q "^$b $sha$" $S && continue
    git -C $R fetch -q origin "+$ref:refs/remotes/origin/$b" 2>/dev/null; t=$(git -C $R log -1 --format=%s $sha 2>/dev/null); echo "$b $sha" >> $S
    case "$t" in Abgabe*) echo "$(date +%H:%M) ABGABE $b ${sha:0:8} ${t:0:200}"; exit 0 ;; esac
  done < <(git -C $R ls-remote origin 'refs/heads/w26-*' 'refs/heads/w27-*' 2>/dev/null)
  for f in /tmp/claude/w4/radeon-bild-da0e.out /tmp/claude/w3/farm-nur-da0e.out; do [ -f "$f" ] || continue; grep -qE "^ENDE|GEPUSHT|keine Mess-Datei|KONFLIKT" "$f" && ! grep -qxF "$f" /tmp/claude/w4/mess-ende.seen 2>/dev/null && { echo "$f" >> /tmp/claude/w4/mess-ende.seen; echo "$(date +%H:%M) MESSUNG ENDE $(basename $f): $(grep -E "GRÜN|ROT|OFFEN|GEPUSHT" "$f" | tr "
" " " | cut -c1-400)"; exit 0; }; done
  sleep 120
done; echo "4 h ohne Ereignis (Actions: $a)"
