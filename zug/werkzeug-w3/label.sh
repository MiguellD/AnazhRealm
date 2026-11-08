#!/bin/bash
# label.sh <runner-id> add|del <label> — Läufer-Label für Mess-Fenster (21 omen-gtx1060, 22 radeon-890m)
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git -C /c/Users/micha/AnazhRealm-profiband credential fill | sed -n 's/^password=//p')
U=https://api.github.com/repos/MiguellD/AnazhRealm/actions/runners/$1/labels
if [ "$2" = add ]; then curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" $U -d "{\"labels\":[\"$3\"]}" >/dev/null
else curl -s -X DELETE -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" $U/$3 >/dev/null; fi
curl -s -H "Authorization: Bearer $TOKEN" https://api.github.com/repos/MiguellD/AnazhRealm/actions/runners/$1 | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const r=JSON.parse(d);console.log(new Date().toTimeString().slice(0,5),r.name,r.labels.filter(l=>l.type==="custom").map(l=>l.name).join(","))})'
