#!/bin/bash
# UNTER sh.exe (13.11.): jeder Prozess-Start unter dem installierten bash.exe kostet auf diesem Rechner 1–2,6 s, unter dem
# byte-gleichen sh.exe daneben 30–90 ms (fork-zeit: exec true, Subshell — das Sammeln des Zug-Diensts stand daran 11–18 min je Zug).
# Als sh gerufen schaltet die Zeile nur POSIX ab (volles bash); sonst startet sich das Skript EINMAL unter sh.exe neu.
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# ci.sh <zweig> … — je Zweig die letzten Läufe am Kopf mit Urteil und roten Jobs
cd /c/Users/micha/AnazhRealm-profiband
TOK=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p')
API=https://api.github.com/repos/MiguellD/AnazhRealm
for z in "$@"; do
  sha=$(git ls-remote origin "refs/heads/$z" | cut -c1-40)
  echo "== $z ${sha:0:8}"
  curl -s -H "Authorization: Bearer $TOK" "$API/actions/runs?head_sha=$sha&per_page=20" | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);for(const r of (j.workflow_runs||[]))console.log(r.id+"\t"+r.name+"\t"+r.status+"\t"+(r.conclusion||"-"));})' > /tmp/claude/w4/ci-runs.tmp
  while IFS=$'\t' read -r id name st co; do
    echo "  $name: $st $co"
    # „voll: n/m“ — wie viele Gruppen der VOLLEN Batterie dieser grüne Lauf trug (0/0 = nur der Puls); der Leser ist zug-dienst.sh bereit()
    if [ "$name" = "Code-Check" ] && [ "$co" = success ]; then
      curl -s -H "Authorization: Bearer $TOK" "$API/actions/runs/$id/jobs?per_page=100&filter=latest" | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let v=[];try{v=(JSON.parse(s).jobs||[]).filter(x=>/^voll /.test(x.name));}catch(e){}console.log("    voll: "+v.filter(x=>x.conclusion==="success").length+"/"+v.length);})'
    fi
    if [ "$co" = failure ]; then
      curl -s -H "Authorization: Bearer $TOK" "$API/actions/runs/$id/jobs?per_page=100&filter=latest" | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);const f=(j.jobs||[]).filter(x=>x.conclusion==="failure");console.log("    rot ("+f.length+"/"+(j.jobs||[]).length+"): "+f.map(x=>x.name+" ["+((x.steps||[]).filter(s=>s.conclusion==="failure").map(s=>s.name).join(","))+"]").join(" · "));})'
    fi
  done < /tmp/claude/w4/ci-runs.tmp
done
