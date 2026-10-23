#!/bin/bash
# Radeon-Runner (Labels echt-gpu, radeon-gpu), Job-Ende-Hook (ACTIONS_RUNNER_HOOK_JOB_COMPLETED in C:\actions-runner\.env).
# Loest das GPU-Schloss NUR, wenn besitzer.txt genau diesen Job nennt (nie ein fremdes Schloss, auch nicht nach einem
# abgewiesenen Job). Ein Fehler hier faerbt den Job nicht (Exit immer 0); die Notiz scheitert nie (wie im Start-Hook).
set +e
SCHLOSS='/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss'
LOG='/c/actions-runner/hooks/hook.log'
ICH="ci-runner $GITHUB_RUN_ID/$GITHUB_RUN_ATTEMPT $GITHUB_JOB"

notiz() {
    local z
    z="$(date '+%Y-%m-%d %H:%M:%S') ende  $ICH: $1"
    { printf '%s\r\n' "$z" >>"$LOG"; } 2>/dev/null || { printf '%s\r\n' "$z" >>"$LOG.$GITHUB_RUN_ID"; } 2>/dev/null
}
wer=$(tr -d '\r\n' <"$SCHLOSS/besitzer.txt" 2>/dev/null)
if [ "$wer" = "$ICH" ]; then
    rm -rf "$SCHLOSS"
    notiz 'Schloss geloest'
    echo "Radeon-Runner: GPU-Schloss geloest."
else
    notiz "Schloss nicht meins ('$wer') - bleibt"
fi
exit 0
