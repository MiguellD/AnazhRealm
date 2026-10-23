#!/bin/bash
# wartet, bis der echt-Lauf an 435f54f4 auf dem Runner sein Schloss gelöst hat (hook.log: Lauf-Id der Zeile mit dem Kopf, dann "ende <id> ... geloest")
H=/c/actions-runner/hooks/hook.log
while :; do
  ID=$(grep "435f54f48608f5d5e7ce3534b48e64c2faa554ef" $H 2>/dev/null | tail -1 | grep -oE "ci-runner [0-9]+/[0-9]+" | cut -d' ' -f2)
  [ -n "$ID" ] && grep -q "ende  ci-runner $ID .*geloest" $H && { echo "$(date +%T) echt $ID an 435f54f4 durch" | tee -a fortschritt.log; break; }
  sleep 30
done
