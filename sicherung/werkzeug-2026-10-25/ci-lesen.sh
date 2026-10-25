#!/bin/bash
# Liegt unter werkzeug/ (nicht im Scratchpad: dort überschrieb ein Integrator am 11.10. die Schwester ci-warte.sh).
# ci-lesen.sh <sha>  -> Läufe + Jobs dieses Kopfes
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p'); export TOKEN SHA="$1"
node -e '
const h={Authorization:"Bearer "+process.env.TOKEN,Accept:"application/vnd.github+json"};
(async()=>{const r=await (await fetch("https://api.github.com/repos/MiguellD/AnazhRealm/actions/runs?head_sha="+process.env.SHA,{headers:h})).json();
for(const run of r.workflow_runs||[]){console.log(run.id,run.name,run.status,run.conclusion||"-",run.display_title.slice(0,60));
const j=await (await fetch(run.jobs_url+"?per_page=50",{headers:h})).json();
for(const x of j.jobs||[]){const d=x.completed_at?((new Date(x.completed_at)-new Date(x.started_at))/60000).toFixed(1)+"min":"";console.log("   ",x.name.slice(0,50),x.status,x.conclusion||"-",d)}}})()'
