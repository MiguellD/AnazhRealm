# ci-warte.sh <run-id>... — wartet (rate-schonend: 4 min Takt, schläft bis zum Reset bei < 6 Rest) bis alle Läufe stehen
API=https://api.github.com/repos/MiguellD/AnazhRealm/actions/runs
for i in $(seq 1 60); do
  rest=$(curl -s https://api.github.com/rate_limit | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d).rate;console.log(r.remaining+' '+(r.reset-Math.floor(Date.now()/1000)))})")
  set -- $rest "${@}"; n=$1; warte=$2; shift 2
  if [ "$n" -lt 6 ]; then sleep $((warte + 5)); continue; fi
  offen=0; zeile=""
  for id in "$@"; do
    s=$(curl -s $API/$id | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d);console.log((r.head_branch||'?')+' '+(r.head_sha||'').slice(0,8)+' '+r.status+' '+r.conclusion)})")
    zeile="$zeile | $s"; case "$s" in *completed*) ;; *) offen=1;; esac
  done
  [ $offen = 0 ] && break; sleep 240
done
echo "CI$zeile"
