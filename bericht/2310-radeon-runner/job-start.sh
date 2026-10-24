#!/bin/bash
# Radeon-Runner (Labels echt-gpu, radeon-gpu), Job-Start-Hook (ACTIONS_RUNNER_HOOK_JOB_STARTED in C:\actions-runner\.env).
# bash statt PowerShell: Windows PowerShell faehrt auf diesem Laptop keine Skript-Dateien (Ausfuehrungsrichtlinie Restricted,
# erster Lauf 39935664101: der .ps1-Hook brach nach 0,4 s mit Exit 1, ohne eine Zeile zu laufen). Die Logik ist die der
# OMEN-Vorlage (koordination bericht/2210-runner-hook/job-start.ps1), das Schloss dasselbe wie in gpu-lauf.sh (bash).
# 1) Vertrauens-Wand: nur Repo MiguellD/AnazhRealm, nur Ereignis push oder schedule, nur Actor MiguellD. Sonst ROT - und ROT
#    BEENDET den eigenen Runner.Worker: ein Exit 1 des Hooks faerbt den Job nur, danach liefen alle always()/!cancelled()-
#    Schritte und die pre-Schritte fremder Actions weiter (Runner v2.338.0 StepsRunner, OMEN-Lauf 39807843752; Pruefung 23.10.).
# 2) Schloss: wartet, bis das GPU-Schloss frei ist, und nimmt es als "ci-runner <run-id>/<attempt> <job>" (atomar mkdir,
#    darin besitzer.txt). Verwaist und beim Namen geloest (nach erneutem Lesen desselben Besitzers): ein ci-runner-Schloss beim
#    Start (ein einziger Runner auf der Maschine), ein Halter, dessen pid= nicht mehr lebt (gpu-lauf.sh schreibt sie), ein
#    Schloss, dessen besitzer.txt seit 60 min unveraendert steht (die Regel von gpu-lauf.sh). Hoechstens 25 min Warten, dann ROT
#    mit Namen: der Job-Deckel ist 45 min (timeout-minutes, er zaehlt ab Job-Start, der Hook ist Schritt 2), der Plan der Schritte
#    hoechstens 20 min (gate:ci-deckung, die Waage) - eine laengere Frist schluege nie, der Deckel kappte vorher ohne Namen.
# 3) ROT heisst ROT: jeder Abbruch raeumt zuerst den Arbeitsordner (nie urteilt ein Schritt ueber den Baum des vorigen
#    Laufs), nennt den Grund und beendet den Worker; die Notiz scheitert nie (sonst die eigene Datei des Laufs).
# Die Konstanten stehen fest (kein Umgebungs-Schalter: ein Workflow koennte ihn setzen); der Selbsttest ersetzt sie in einer Kopie.
set +e
SCHLOSS='/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss'
LOG='/c/actions-runner/hooks/hook.log'
WERK='/c/actions-runner/_work'
FRIST_S=1500
TAKT_S=15
SCHWEIGT_S=3600
ICH="ci-runner $GITHUB_RUN_ID/$GITHUB_RUN_ATTEMPT $GITHUB_JOB"
toete_worker() { taskkill -F -IM Runner.Worker.exe >/dev/null 2>&1; }

notiz() {
    local z
    z="$(date '+%Y-%m-%d %H:%M:%S') start $ICH: $1"
    { printf '%s\r\n' "$z" >>"$LOG"; } 2>/dev/null || { printf '%s\r\n' "$z" >>"$LOG.$GITHUB_RUN_ID"; } 2>/dev/null
}
besitzer() { tr -d '\r\n' 2>/dev/null <"$SCHLOSS/besitzer.txt"; }
loese_wenn() { [ "$(besitzer)" = "$1" ] && rm -rf "$SCHLOSS"; }
lebt() { tasklist -FI "PID eq $1" -NH 2>/dev/null | grep -qw "$1"; }
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
    notiz "ROT: $grund - Worker beendet, kein weiterer Schritt"
    echo "Radeon-Runner: ROT - $grund"
    toete_worker
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
    wer=$(besitzer)
    jetzt=$(date +%s)
    seit=$(stat -c %Y "$SCHLOSS/besitzer.txt" 2>/dev/null || stat -c %Y "$SCHLOSS" 2>/dev/null)
    pid=$(printf '%s' "$wer" | sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p')
    grund=""
    case "$wer" in "ci-runner "*) grund="ci-runner-Schloss beim Start" ;; esac
    [ -z "$grund" ] && [ -n "$pid" ] && ! lebt "$pid" && grund="Halter pid=$pid lebt nicht"
    [ -z "$grund" ] && [ -n "$seit" ] && [ $((jetzt - seit)) -gt "$SCHWEIGT_S" ] &&
        grund="es schweigt seit $(((jetzt - seit) / 60)) min"
    if [ -n "$grund" ]; then
        notiz "verwaistes Schloss '$wer' geloest - $grund"
        loese_wenn "$wer"
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
