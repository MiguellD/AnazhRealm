#!/bin/bash
# K59 takt-kreatur: EINE Werkbank-Sitzung am Arbeitsbaum (Ports 7900 save-server, 7902 werkbank / 7901 Seite), unter dem GPU-Schloss.
# ./sitzung.sh start <ort> <sicht> | ./sitzung.sh stop
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k59; WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/takt-kreatur; D=$H/log; mkdir -p $D
. /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
export WERKBANK_PORT=7902; W="node $WT/scripts/werkbank.cjs"
toete() { powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? { \$_.CommandLine -match 'takt-kreatur' -and \$_.CommandLine -match 'save-server|werkbank' } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; }
if [ "$1" = stop ]; then $W stop > /dev/null 2>&1; sleep 2; toete; schloss_loesen "omen-k59"; echo gestoppt; exit 0; fi
schloss_nehmen "omen-k59"
$W stop > /dev/null 2>&1; sleep 1; toete; sleep 1
mkdir -p $D/stand; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/ 2>/dev/null
(cd $WT && PORT=7900 node $WT/save-server.js > $D/server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:7900/ && break; sleep 1; done
(cd $WT && node $WT/scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7900 > $D/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/werkbank.log 2>/dev/null && break; sleep 5; done
tail -1 $D/werkbank.log
$W fenster 1920 1080 > /dev/null
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W umstellen --ort ${2:-genesis} --sicht ${3:-third}
echo "sitzung steht"
