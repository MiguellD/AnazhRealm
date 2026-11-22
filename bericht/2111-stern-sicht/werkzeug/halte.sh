#!/bin/bash
# halte.sh <ausgabe> — EINE Welt (echt, Radeon) aus dem Probe-Baum, Genesis Ego; hält, bis <ausgabe>/STOP existiert (höchstens 1500 s)
OUT="$1"; mkdir -p "$OUT"; rm -f "$OUT/STOP" "$OUT/BEREIT"
cd /c/Users/micha/AnazhRealm-probe || exit 2
PORT=4371 node save-server.js >"$OUT/server.log" 2>&1 &
SPID=$!
for i in $(seq 1 30); do curl -s -o /dev/null http://localhost:4371/ && break; sleep 1; done
node scripts/werkbank.cjs start --echt --seite http://localhost:4371 --port 4495 --ort genesis >"$OUT/werkbank.log" 2>&1 &
WPID=$!
ende() { node scripts/werkbank.cjs stop --port 4495 >/dev/null 2>&1; sleep 3; kill $WPID $SPID 2>/dev/null; }
trap ende EXIT
for i in $(seq 1 300); do node scripts/werkbank.cjs status --port 4495 >/dev/null 2>&1 && break; sleep 2; done
node scripts/werkbank.cjs umstellen --ort genesis --sicht ego --port 4495 >"$OUT/umstellen.log" 2>&1
echo BEREIT; touch "$OUT/BEREIT"
for i in $(seq 1 750); do [ -f "$OUT/STOP" ] && break; sleep 2; done
echo ENDE
