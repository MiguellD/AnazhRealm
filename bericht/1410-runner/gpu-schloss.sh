#!/bin/bash
# GPU-Schloss der OMEN fuer Mess-Serien (dieselbe Konvention wie der Runner-Hook C:\actions-runner\hooks\job-start.ps1):
# atomar mkdir, darin besitzer.txt (ohne BOM); loesen nur mit dem eigenen Namen. Einbinden: . /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
# schloss_nehmen <name>  wartet (15 s Takt), bis das Schloss frei ist — ein CI-Job auf omen-gpu laeuft dann zu Ende
# schloss_loesen <name>  loest nur, wenn besitzer.txt <name> traegt
GPU_SCHLOSS=/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss
schloss_nehmen() { local n="$1" w=0; mkdir -p "$(dirname "$GPU_SCHLOSS")"
  until mkdir "$GPU_SCHLOSS" 2>/dev/null; do [ $w = 0 ] && echo "$(date +%T) GPU-Schloss haelt '$(cat "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null)' - warte" >&2; w=1; sleep 15; done
  printf '%s' "$n" > "$GPU_SCHLOSS/besitzer.txt"; }
schloss_loesen() { local n="$1"; [ "$(cat "$GPU_SCHLOSS/besitzer.txt" 2>/dev/null)" = "$n" ] && rm -rf "$GPU_SCHLOSS"; return 0; }
