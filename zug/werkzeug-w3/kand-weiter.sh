#!/bin/bash
# kand-weiter.sh <zid> <sha40> — führt einen Kandidaten auf integ-probe ohne fahre.sh zu Ende: wartet auf seinen CI-Lauf,
# fährt rote Jobs, die NUR an Wackel-Wänden fielen, bis 2× neu, landet dann per zug.sh landen (echt grün, ff) und schreibt
# „[<zid>w] GELANDET|FAHRT ROT …“ nach /tmp/claude/fahre-<zid>w.log (darauf wartet die nächste Schlange).
Z="$1"; K="$2"; O=/tmp/claude/fahre-${Z}w.log
WACKEL='Stand-Takt|Fenster-Wand|Fahr-Linse des Lebens|Kreatur-Linse|Mehrspieler-Wand|Erst-Zeichnungs-Wand|Ziel-Zensus|Frost-Wand|Satz-Wand'
say() { echo "$(date +%H:%M:%S) [${Z}w] $*" >> "$O"; }
TOK=$(printf "protocol=https\nhost=github.com\n\n" | git -C /c/Users/micha/AnazhRealm-profiband credential fill | sed -n 's/^password=//p')
api() { curl -s -m 30 -H "Authorization: Bearer $TOK" -H "Accept: application/vnd.github+json" "$@"; }
B=https://api.github.com/repos/MiguellD/AnazhRealm
RUN=""
until [ -n "$RUN" ]; do RUN=$(api "$B/actions/runs?head_sha=$K&per_page=5" | node -e 'const j=JSON.parse(require("fs").readFileSync(0));const r=(j.workflow_runs||[]).find(r=>r.head_branch==="integ-probe");console.log(r?r.id:"")'); [ -z "$RUN" ] && sleep 30; done
fertig() { until [ "$(api "$B/actions/runs/$RUN" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0)).status)')" = completed ]; do sleep 30; done; }
rote() { api "$B/actions/runs/$RUN/jobs?filter=latest&per_page=100" | node -e 'const j=JSON.parse(require("fs").readFileSync(0));const r=[];for(const x of j.jobs||[])if(x.conclusion==="failure")r.push(x.name+": "+((x.steps||[]).filter(s=>s.conclusion==="failure"&&!/^URTEIL|^Urteil/.test(s.name)).map(s=>s.name).join(" | ")||"(ohne Schritt)"));console.log(r.join("\n"))'; }
fertig
for v in 1 2; do
    ROT=$(rote); [ -z "$ROT" ] && break
    if echo "$ROT" | grep -qvE "$WACKEL"; then say "FAHRT ROT (kein Wackler): $(echo "$ROT" | tr '\n' ';' | cut -c1-500)"; exit 1; fi
    say "nur Wackler rot ($(echo "$ROT" | tr '\n' ';' | cut -c1-300)) — Neulauf $v/2, Lauf $RUN"
    api -X POST "$B/actions/runs/$RUN/rerun-failed-jobs" > /dev/null; sleep 60; fertig
done
ROT=$(rote); [ -n "$ROT" ] && { say "FAHRT ROT nach Neuläufen: $(echo "$ROT" | tr '\n' ';' | cut -c1-500)"; exit 1; }
l=$(cd /c/Users/micha/AnazhRealm-profiband && bash artifacts/profiband/werkzeug/zug.sh landen "$K" --nachwache 2>&1 | tail -1)
case "$l" in GELANDET*) say "GELANDET ${K:0:8} — $l" ;; *) say "FAHRT ROT beim Landen: $l"; exit 1 ;; esac
