#!/bin/bash
# bash pm-datei.sh <betreff-datei> <basis40> <ziel-pfad>=<quelle> [<ziel-pfad>=<quelle> …]
# setzt die Dateien als EINEN Commit auf die Spitze von punkte-maschine (Plumbing, kein Baum) und schiebt ohne force;
# bewegte sich die Spitze, baut es neu (höchstens 5 Versuche). HALT, wenn eine der Ziel-Dateien seit <basis40> anders ist.
set -u
cd /c/Users/micha/AnazhRealm-profiband || exit 2
N="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad"
BETREFF=$1
BASIS=$2
shift 2
PFADE=()
for p in "$@"; do PFADE+=("${p%%=*}"); done
for versuch in 1 2 3 4 5; do
    TIP=$(git ls-remote origin refs/heads/punkte-maschine | cut -c1-40)
    git fetch -q origin "$TIP"
    if ! git diff --quiet "$BASIS" "$TIP" -- "${PFADE[@]}"; then
        echo "HALT: eine Ziel-Datei hat sich seit ${BASIS:0:8} bewegt"
        exit 1
    fi
    export GIT_INDEX_FILE="$N/idx-pm-datei"
    rm -f "$GIT_INDEX_FILE"
    git read-tree "$TIP"
    for p in "$@"; do
        ziel=${p%%=*}
        quelle=${p#*=}
        h=$(git hash-object -w --path="$ziel" "$quelle")
        git update-index --cacheinfo "100644,$h,$ziel"
    done
    TREE=$(git write-tree)
    unset GIT_INDEX_FILE
    C=$(git commit-tree "$TREE" -p "$TIP" -F "$BETREFF")
    if [ "$versuch" = 1 ]; then git diff --stat "$TIP" "$C" | cut -c1-120; fi
    # DER SCHUB URTEILT AM EXIT UND AN DER KETTE (25.11. 05:05): bis dahin las das Skript die letzten zwei Zeilen der Ausgabe — bei
    # einer Ablehnung sind das „hint:“-Zeilen ohne „rejected“, es meldete GESCHOBEN (8cb8ed00 lag nie auf punkte-maschine)
    git push -q origin "$C:refs/heads/punkte-maschine" >/dev/null 2>&1
    RC=$?
    if [ "$RC" != 0 ]; then
        echo "Versuch $versuch: Schub abgelehnt (Exit $RC), die Spitze bewegte sich — neu"
    else
        JETZT=$(git ls-remote origin refs/heads/punkte-maschine | cut -c1-40)
        git fetch -q origin "$JETZT"
        git merge-base --is-ancestor "$C" "$JETZT" || { echo "HALT: Exit 0, aber $C liegt nicht in der Kette der Spitze ${JETZT:0:8}"; exit 4; }
        echo "GESCHOBEN $C auf ${TIP:0:8} · Spitze ${JETZT:0:8} trägt ihn · $(date '+%H:%M:%S')"
        exit 0
    fi
done
echo "HALT: fünf Versuche ohne Schub"
exit 3
