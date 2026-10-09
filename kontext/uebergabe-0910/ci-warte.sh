#!/bin/sh
# Wartet auf den CI-Lauf eines Commits (Kopf des Branchs) und druckt Job- und Schritt-Status.
SHA="$1"
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p')
API=https://api.github.com/repos/MiguellD/AnazhRealm
for i in $(seq 1 110); do
  RUN=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/actions/runs?head_sha=$SHA&per_page=5" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);const r=(j.workflow_runs||[])[0];console.log(r?r.id+" "+r.status+" "+r.conclusion:"-");})')
  case "$RUN" in *" completed "*) break;; esac
  sleep 60
done
echo "RUN $RUN"
ID=${RUN%% *}
# Je Job (auch jede Gruppe der playtest-Matrix, „playtest 1/3" …) seine Dauer; die Schritte einer anderen Gruppe
# („skipped") stehen nicht in der Liste.
curl -s -H "Authorization: Bearer $TOKEN" "$API/actions/runs/$ID/jobs?per_page=100" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);const min=(a,b)=>a&&b?Math.round((new Date(b)-new Date(a))/600)/100+" min":"";for(const job of j.jobs||[]){console.log("JOB",job.name,job.status,job.conclusion,min(job.started_at,job.completed_at));for(const s of job.steps||[]){if(s.conclusion==="skipped")continue;console.log("   ",s.number,(s.conclusion||s.status),s.name.slice(0,80), s.started_at&&s.completed_at? Math.round((new Date(s.completed_at)-new Date(s.started_at))/1000)+"s":"");}}})'
