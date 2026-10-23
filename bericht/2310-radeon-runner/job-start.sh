#!/bin/bash
# Radeon-Runner (Labels echt-gpu, radeon-gpu), Job-Start-Hook (ACTIONS_RUNNER_HOOK_JOB_STARTED in C:\actions-runner\.env).
# bash statt PowerShell: Windows PowerShell faehrt auf diesem Laptop keine Skript-Dateien (Ausfuehrungsrichtlinie Restricted,
# erster Lauf 39935664101: der .ps1-Hook brach nach 0,4 s mit Exit 1, ohne eine Zeile zu laufen). Die Logik ist die der
# OMEN-Vorlage (koordination bericht/2210-runner-hook/job-start.ps1), das Schloss dasselbe wie in gpu-lauf.sh (bash).
# 1) Vertrauens-Wand: nur Repo MiguellD/AnazhRealm, nur Ereignis push oder schedule, nur Actor MiguellD - sonst endet der
#    Job, bevor ein Schritt laeuft (zweite Wand neben der Fork-Freigabe; das Repo ist oeffentlich).
# 2) Schloss: wartet, bis das GPU-Schloss frei ist, und nimmt es als "ci-runner <run-id>/<attempt> <job>" (atomar mkdir,
#    darin besitzer.txt). Ein ci-runner-Schloss beim Start ist verwaist (ein einziger Runner auf der Maschine) und wird
#    geloest; ein fremdes Schloss, dessen besitzer.txt seit 60 min unveraendert steht (die Regel von gpu-lauf.sh: kein Befehl
#    darf so lange), ist verwaist und wird beim Namen geloest. Hoechstens 120 min Warten, dann ROT mit Namen.
# 3) ROT heisst ROT: jeder Abbruch raeumt zuerst den Arbeitsordner (nie urteilt ein Schritt ueber den Baum des vorigen
#    Laufs) und nennt den Grund; die Notiz scheitert nie (sonst die eigene Datei des Laufs).
# Die Konstanten stehen fest (kein Umgebungs-Schalter: ein Workflow koennte ihn setzen); der Selbsttest ersetzt sie in einer Kopie.
set +e
SCHLOSS='/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss'
LOG='/c/actions-runner/hooks/hook.log'
WERK='/c/actions-runner/_work'
FRIST_S=7200
TAKT_S=15
SCHWEIGT_S=3600
ICH="ci-runner $GITHUB_RUN_ID/$GITHUB_RUN_ATTEMPT $GITHUB_JOB"

notiz() {
    local z
    z="$(date '+%Y-%m-%d %H:%M:%S') start $ICH: $1"
    { printf '%s\r\n' "$z" >>"$LOG"; } 2>/dev/null || { printf '%s\r\n' "$z" >>"$LOG.$GITHUB_RUN_ID"; } 2>/dev/null
}
rot() {
    local grund="$1" ws=""
    [ -n "$GITHUB_WORKSPACE" ] && ws=$(cygpath -u "$GITHUB_WORKSPACE" 2>/dev/null)
    if [ -n "$ws" ] && [ -d "$ws" ]; then
        case "${ws,,}/" in
            "${WERK,,}"/*)
                find "$ws" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null
                grund="$grund - Arbeitsordner geraeumt ($GITHUB_WORKSPACE)"
                ;;
        esac
    fi
    notiz "ROT: $grund"
    echo "Radeon-Runner: ROT - $grund"
    exit 1
}

if [ "$GITHUB_REPOSITORY" != "MiguellD/AnazhRealm" ] || [ "$GITHUB_ACTOR" != "MiguellD" ] ||
    { [ "$GITHUB_EVENT_NAME" != "push" ] && [ "$GITHUB_EVENT_NAME" != "schedule" ]; }; then
    rot "ABGEWIESEN repo=$GITHUB_REPOSITORY ereignis=$GITHUB_EVENT_NAME actor=$GITHUB_ACTOR ref=$GITHUB_REF (nur push oder schedule von MiguellD auf MiguellD/AnazhRealm)"
fi

mkdir -p "$(dirname "$SCHLOSS")" 2>/dev/null
t0=$(date +%s)
gemeldet=0
while :; do
    if mkdir "$SCHLOSS" 2>/dev/null; then
        printf '%s' "$ICH" >"$SCHLOSS/besitzer.txt"
        notiz "Schloss genommen ($GITHUB_REF $GITHUB_SHA ws=$GITHUB_WORKSPACE)"
        echo "Radeon-Runner: GPU-Schloss genommen als '$ICH'."
        exit 0
    fi
    wer=$(tr -d '\r\n' <"$SCHLOSS/besitzer.txt" 2>/dev/null)
    case "$wer" in
        "ci-runner "*)
            notiz "verwaistes Schloss '$wer' geloest"
            rm -rf "$SCHLOSS"
            continue
            ;;
    esac
    jetzt=$(date +%s)
    seit=$(stat -c %Y "$SCHLOSS/besitzer.txt" 2>/dev/null || stat -c %Y "$SCHLOSS" 2>/dev/null)
    if [ -n "$seit" ] && [ $((jetzt - seit)) -gt "$SCHWEIGT_S" ]; then
        notiz "verwaistes Schloss '$wer' geloest - es schweigt seit $(((jetzt - seit) / 60)) min"
        rm -rf "$SCHLOSS"
        continue
    fi
    if [ "$gemeldet" = 0 ]; then
        notiz "wartet auf Schloss von '$wer'"
        echo "Radeon-Runner: GPU-Schloss haelt '$wer' - warte (max. $((FRIST_S / 60)) min)."
        gemeldet=1
    fi
    [ $((jetzt - t0)) -gt "$FRIST_S" ] && rot "$((FRIST_S / 60)) min gewartet, Schloss haelt '$wer'"
    sleep "$TAKT_S"
done
