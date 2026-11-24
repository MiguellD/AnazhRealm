#!/bin/bash
# bash gruen-warte.sh <name>:<sha40> … — wartet, bis der ERSTE Kopf ein Urteil hat, und endet dann mit EINER Zeile je Kopf.
# URTEIL heißt: Code-Check UND GPU-Probe completed/success (GRÜN) oder eines von beiden completed/failure (ROT).
# „cancelled“ ist KEIN Urteil (der Vorfahrt-Wächter bricht ab und stößt neu an) — ci-warte2.cjs endete daran zu früh.
S="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad"
cd /c/Users/micha/AnazhRealm-profiband || exit 2
export MSYS_NO_PATHCONV=1
ENDE=$(($(date +%s) + 3 * 3600))
while [ "$(date +%s)" -lt "$ENDE" ]; do
    FERTIG=""
    ZEILEN=""
    for p in "$@"; do
        n="${p%%:*}"; h="${p##*:}"
        R=$(node "$S/ci/ci-rot.cjs" "$h" 2>/dev/null | grep -E '^[0-9]{8,} ')
        CC=$(echo "$R" | grep ' Code-Check ' | head -1 | awk '{print $3}')
        GP=$(echo "$R" | grep ' GPU-Probe ' | head -1 | awk '{print $5}')
        U="läuft"
        case "$CC/$GP" in
            completed/success/completed/success) U="GRÜN" ;;
            *completed/failure*) U="ROT" ;;
        esac
        ZEILEN="$ZEILEN$n ${h:0:8} $U (Code-Check ${CC:-?} · GPU-Probe ${GP:-?})"$'\n'
        [ "$U" != "läuft" ] && FERTIG="ja"
    done
    if [ -n "$FERTIG" ]; then
        date '+%H:%M:%S'
        printf '%s' "$ZEILEN"
        exit 0
    fi
    sleep 120
done
date '+%H:%M:%S'; echo "ENDE ohne Urteil"; printf '%s' "$ZEILEN"
