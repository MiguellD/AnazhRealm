#!/bin/bash
# Selbsttest der bash-Hooks (job-start.sh / job-ende.sh) ohne GitHub: spielt die Faelle der OMEN-Vorlage (S1a-d, S2-S11) mit
# gesetzten GITHUB_*-Variablen durch, an einer Kopie mit Test-Schloss, Test-Log und kurzer Frist (das echte Schloss bleibt
# unberuehrt). Aufruf wie der Runner: bash /c/actions-runner/hooks/selbsttest.sh -> Exit 0 = gruen.
H=/c/actions-runner/hooks
T="$(cygpath -u "$TEMP")/radeon-runner-selbsttest-sh"
rm -rf "$T" && mkdir -p "$T/work"
SCH="$T/gpu-schloss"
for n in job-start job-ende; do
    sed -e "s|^SCHLOSS=.*|SCHLOSS='$SCH'|" -e "s|^LOG=.*|LOG='$T/hook.log'|" -e "s|^WERK=.*|WERK='$T/work'|" \
        -e 's|^FRIST_S=.*|FRIST_S=20|' -e 's|^TAKT_S=.*|TAKT_S=2|' "$H/$n.sh" >"$T/$n.sh"
done
fehler=()
lauf() { # <hook> [VAR=wert ...] -> Exit-Code des Hooks, so gestartet wie vom Runner
    local hook="$1"
    shift
    env GITHUB_REPOSITORY=MiguellD/AnazhRealm GITHUB_EVENT_NAME=push GITHUB_ACTOR=MiguellD GITHUB_RUN_ID=111 \
        GITHUB_RUN_ATTEMPT=1 GITHUB_JOB=gpu GITHUB_WORKSPACE="$(cygpath -w "$T/work/AnazhRealm/AnazhRealm")" "$@" \
        bash --noprofile --norc -e -o pipefail "$T/$hook.sh" >/dev/null 2>&1
}
besitzer() { tr -d '\r\n' <"$SCH/besitzer.txt" 2>/dev/null; }
# S1: pull_request, workflow_dispatch, fremder Actor, fremdes Repo -> abgewiesen, ohne Schloss; S8: schedule nimmt und loest
lauf job-start GITHUB_EVENT_NAME=pull_request; [ $? = 1 ] || fehler+=("S1a pull_request nicht abgewiesen")
lauf job-start GITHUB_EVENT_NAME=workflow_dispatch; [ $? = 1 ] || fehler+=("S1d workflow_dispatch nicht abgewiesen")
lauf job-start GITHUB_EVENT_NAME=schedule GITHUB_RUN_ID=333; [ $? = 0 ] || fehler+=("S8 schedule nicht angenommen")
lauf job-ende GITHUB_EVENT_NAME=schedule GITHUB_RUN_ID=333
[ -e "$SCH" ] && fehler+=("S8 Schloss des Nachtlaufs nicht geloest")
lauf job-start GITHUB_ACTOR=fremd; [ $? = 1 ] || fehler+=("S1b fremder Actor nicht abgewiesen")
lauf job-start GITHUB_REPOSITORY=fremd/AnazhRealm; [ $? = 1 ] || fehler+=("S1c fremdes Repo nicht abgewiesen")
[ -e "$SCH" ] && fehler+=("S1 Schloss nach Abweisung vorhanden")
# S2: push nimmt das Schloss, besitzer.txt traegt den Job; S3: das Ende eines ANDEREN Jobs loest nicht; S4: das eigene loest
lauf job-start; [ $? = 0 ] || fehler+=("S2 push nicht angenommen")
[ "$(besitzer)" = "ci-runner 111/1 gpu" ] || fehler+=("S2 besitzer.txt falsch: '$(besitzer)'")
lauf job-ende GITHUB_RUN_ID=222
[ -e "$SCH" ] || fehler+=("S3 fremder Ende-Hook loeste das Schloss")
lauf job-ende
[ -e "$SCH" ] && fehler+=("S4 eigener Ende-Hook loeste nicht")
# S5: eine Karte haelt das Schloss (gpu-lauf.sh schreibt "<name> <zeit>" mit Zeilenende) -> der Start wartet, wird nach der
# Frist ROT, das Schloss bleibt der Karte
mkdir "$SCH" && echo "punkte-radeon 2026-10-23T12:00:00+02:00" >"$SCH/besitzer.txt"
lauf job-start; [ $? = 1 ] || fehler+=("S5 wartete nicht / nicht ROT nach Frist")
[ "$(besitzer)" = "punkte-radeon 2026-10-23T12:00:00+02:00" ] || fehler+=("S5 fremdes Schloss veraendert")
# S6: ein verwaistes ci-runner-Schloss wird uebernommen
printf '%s' "ci-runner 99/1 alt" >"$SCH/besitzer.txt"
lauf job-start
{ [ $? = 0 ] && [ "$(besitzer)" = "ci-runner 111/1 gpu" ]; } || fehler+=("S6 verwaistes Schloss nicht uebernommen")
lauf job-ende
# S7: wird das Schloss frei, waehrend der Start wartet, nimmt er es
mkdir "$SCH" && echo "punkte-radeon x" >"$SCH/besitzer.txt"
(sleep 5 && rm -rf "$SCH") &
lauf job-start; [ $? = 0 ] || fehler+=("S7 nahm das frei gewordene Schloss nicht")
wait
lauf job-ende
# S9: hook.log exklusiv gesperrt (ein Leser haelt ihn) -> der Start nimmt das Schloss trotzdem, die Notiz landet in der
# Datei des Laufs
touch "$T/hook.log"
powershell -NoProfile -Command "\$f = [System.IO.File]::Open('$(cygpath -w "$T/hook.log")', 'Open', 'Read', 'None'); Start-Sleep -Seconds 8; \$f.Close()" &
sleep 3
lauf job-start; c9=$?
{ [ $c9 = 0 ] && [ -s "$T/hook.log.111" ]; } || fehler+=("S9 gesperrtes hook.log brach den Start (Exit $c9)")
wait
lauf job-ende
# S10: ein fremdes Schloss schweigt seit 61 min (die 60-min-Regel von gpu-lauf.sh) -> beim Namen geloest und genommen
mkdir "$SCH" && echo "karte-tot x" >"$SCH/besitzer.txt" && touch -d "61 minutes ago" "$SCH/besitzer.txt" "$SCH"
lauf job-start; c10=$?
{ [ $c10 = 0 ] && grep -q "verwaistes Schloss 'karte-tot x' geloest - es schweigt seit 61 min" "$T/hook.log"; } ||
    fehler+=("S10 schweigendes Schloss nicht beim Namen geloest (Exit $c10)")
lauf job-ende
# S11: ein Abbruch des Hooks (hier die Abweisung) raeumt zuerst den Arbeitsordner - nie urteilt ein alter Baum
mkdir -p "$T/work/AnazhRealm/AnazhRealm/scripts" && echo '{"version":"alt"}' >"$T/work/AnazhRealm/AnazhRealm/package.json"
lauf job-start GITHUB_EVENT_NAME=pull_request; c11=$?
{ [ $c11 = 1 ] && [ -z "$(ls -A "$T/work/AnazhRealm/AnazhRealm")" ]; } || fehler+=("S11 der Abbruch raeumte den Arbeitsordner nicht")
cat "$T/hook.log"
if [ ${#fehler[@]} -gt 0 ]; then
    echo "SELBSTTEST ROT:"
    printf ' - %s\n' "${fehler[@]}"
    exit 1
fi
echo "SELBSTTEST GRUEN (S1a-d, S2-S11)"
rm -rf "$T"
exit 0
