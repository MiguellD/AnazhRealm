#!/bin/bash
# wiederholt gpu-lauf (Exit 75 = Vorrang/blockiert), bis die gehaltene Welt lief
SP=/c/Users/micha/AppData/Local/Temp/claude/a2d6fda3d89c432f/fbfd5778-401f-4a17-bf73-0367303d8996/scratchpad/stern
OUT="$1"
cd /c/Users/micha/AnazhRealm-probe || exit 2
for n in $(seq 1 40); do
    GPU_LAUF_WARTE_S=1800 GPU_LAUF_MAX_S=1700 bash /c/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/gpu-lauf.sh stern-sicht-diag bash $SP/halte.sh "$OUT"
    e=$?
    echo "VERSUCH $n EXIT=$e"
    [ "$e" != 75 ] && break
    sleep 30
done
