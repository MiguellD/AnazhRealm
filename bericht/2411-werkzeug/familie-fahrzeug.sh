W=/c/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad/w/familie; mkdir -p $W
cd /c/Users/micha/AnazhRealm-acker
for j in vehicle-contract nervensystem-vehicle vehicle-drive gegenstand-stoff garage-labor boot-rettung boot-stage erstarren welt-boot warm-start mp-sync hitch1; do
  case $j in hitch1) c="node scripts/diag-hitch-telemetrie.cjs --teil=1";; *) c="npm run gate:$j";; esac
  $c > $W/$j.log 2>&1; echo "$j EXIT $?"
done
echo ALLE
