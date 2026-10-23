#!/bin/bash
# wartet, bis der echt-Lauf an 3528f2d0 auf dem Runner sein Schloss gelöst hat (hook.log: Lauf-Id der Zeile mit dem Kopf, dann "ende <id> ... geloest")
H=/c/actions-runner/hooks/hook.log
while :; do
  ID=$(grep "3528f2d0f4426d7d06e39685d92c1e9491674f97" $H 2>/dev/null | tail -1 | grep -oE "ci-runner [0-9]+/[0-9]+" | cut -d' ' -f2)
  [ -n "$ID" ] && grep -q "ende  ci-runner $ID .*geloest" $H && { echo "$(date +%T) echt $ID an 3528f2d0 durch" | tee -a fortschritt.log; break; }
  sleep 30
done
