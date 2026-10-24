#!/bin/bash
# Radeon-Runner (Labels echt-gpu, radeon-gpu), Job-Ende-Hook (ACTIONS_RUNNER_HOOK_JOB_COMPLETED in C:\actions-runner\.env).
# Loest das GPU-Schloss NUR, wenn besitzer.txt genau diesen Job nennt (nie ein fremdes Schloss, auch nicht nach einem
# abgewiesenen Job), und raeumt IMMER den Arbeitsordner des Jobs: lief der Start-Hook einmal nicht (Richtlinie, fehlende Shell),
# urteilen die !cancelled()-Schritte des naechsten Laufs sonst ueber den Baum dieses Laufs (OMEN 22.10.: 57 min ueber einem
# alten Baum). checkout holt ihn neu, npm ci loescht node_modules ohnehin, Chrome liegt in ~/.cache/puppeteer.
# Ein Fehler hier faerbt den Job nicht (Exit immer 0); die Notiz scheitert nie (wie im Start-Hook).
set +e
SCHLOSS='/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss'
LOG='/c/actions-runner/hooks/hook.log'
WERK='/c/actions-runner/_work'
ICH="ci-runner $GITHUB_RUN_ID/$GITHUB_RUN_ATTEMPT $GITHUB_JOB"

notiz() {
    local z
    z="$(date '+%Y-%m-%d %H:%M:%S') ende  $ICH: $1"
    { printf '%s\r\n' "$z" >>"$LOG"; } 2>/dev/null || { printf '%s\r\n' "$z" >>"$LOG.$GITHUB_RUN_ID"; } 2>/dev/null
}
wer=$(tr -d '\r\n' 2>/dev/null <"$SCHLOSS/besitzer.txt")
if [ "$wer" = "$ICH" ]; then
    rm -rf "$SCHLOSS"
    notiz 'Schloss geloest'
    echo "Radeon-Runner: GPU-Schloss geloest."
else
    notiz "Schloss nicht meins ('$wer') - bleibt"
fi
ws=""
[ -n "$GITHUB_WORKSPACE" ] && ws=$(cygpath -u "$GITHUB_WORKSPACE" 2>/dev/null)
if [ -n "$ws" ] && [ -d "$ws" ]; then
    case "${ws,,}/" in
        "${WERK,,}"/*)
            find "$ws" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null
            notiz "Arbeitsordner geraeumt ($GITHUB_WORKSPACE)"
            ;;
    esac
fi
exit 0
