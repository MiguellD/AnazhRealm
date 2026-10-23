#!/bin/bash
# Selbsttest der bash-Hooks (job-start.sh / job-ende.sh) ohne GitHub: spielt die Faelle der OMEN-Vorlage (S1-S11) und die der
# Pruefung vom 23.10. (S12-S16) mit gesetzten GITHUB_*-Variablen durch, an einer Kopie mit Test-Schloss, Test-Log, kurzer Frist
# und einer Worker-Attrappe (das echte Schloss und der echte Worker bleiben unberuehrt). Exit 0 = gruen.
# Aufruf: bash /c/actions-runner/hooks/selbsttest.sh
H=/c/actions-runner/hooks
T="$(cygpath -u "$TEMP")/radeon-runner-selbsttest-sh"
rm -rf "$T" && mkdir -p "$T/work"
SCH="$T/gpu-schloss"
TOT="$T/worker-beendet"
for n in job-start job-ende; do
    sed -e "s|^SCHLOSS=.*|SCHLOSS='$SCH'|" -e "s|^LOG=.*|LOG='$T/hook.log'|" -e "s|^WERK=.*|WERK='$T/work'|" \
        -e 's|^FRIST_S=.*|FRIST_S=20|' -e 's|^TAKT_S=.*|TAKT_S=2|' \
        -e "s|^toete_worker() {.*|toete_worker() { touch '$TOT'; }|" "$H/$n.sh" >"$T/$n.sh"
done
fehler=()
WS="$T/work/AnazhRealm/AnazhRealm"
lauf() { # <hook> [VAR=wert ...] -> Exit-Code des Hooks, so gestartet wie vom Runner
    local hook="$1"
    shift
    rm -f "$TOT"
    env GITHUB_REPOSITORY=MiguellD/AnazhRealm GITHUB_EVENT_NAME=push GITHUB_ACTOR=MiguellD GITHUB_RUN_ID=111 \
        GITHUB_RUN_ATTEMPT=1 GITHUB_JOB=gpu GITHUB_WORKSPACE="$(cygpath -w "$WS")" "$@" \
        bash --noprofile --norc -e -o pipefail "$T/$hook.sh" >/dev/null 2>&1
}
besitzer() { tr -d '\r\n' 2>/dev/null <"$SCH/besitzer.txt"; }
baum() { mkdir -p "$WS/scripts" && echo '{"version":"alt"}' >"$WS/package.json"; }
# S1: pull_request, workflow_dispatch, fremder Actor, fremdes Repo -> abgewiesen, ohne Schloss, und der Worker endet (S12);
# S8: schedule nimmt und loest
lauf job-start GITHUB_EVENT_NAME=pull_request
{ [ $? = 1 ] && [ -e "$TOT" ]; } || fehler+=("S1a/S12 pull_request nicht abgewiesen oder Worker lebt weiter")
lauf job-start GITHUB_EVENT_NAME=workflow_dispatch
{ [ $? = 1 ] && [ -e "$TOT" ]; } || fehler+=("S1d/S12 workflow_dispatch nicht abgewiesen oder Worker lebt weiter")
lauf job-start GITHUB_EVENT_NAME=schedule GITHUB_RUN_ID=333; [ $? = 0 ] || fehler+=("S8 schedule nicht angenommen")
lauf job-ende GITHUB_EVENT_NAME=schedule GITHUB_RUN_ID=333
[ -e "$SCH" ] && fehler+=("S8 Schloss des Nachtlaufs nicht geloest")
lauf job-start GITHUB_ACTOR=fremd
{ [ $? = 1 ] && [ -e "$TOT" ]; } || fehler+=("S1b/S12 fremder Actor nicht abgewiesen oder Worker lebt weiter")
lauf job-start GITHUB_REPOSITORY=fremd/AnazhRealm; [ $? = 1 ] || fehler+=("S1c fremdes Repo nicht abgewiesen")
[ -e "$SCH" ] && fehler+=("S1 Schloss nach Abweisung vorhanden")
# S2: push nimmt das Schloss, besitzer.txt traegt den Job, der Worker lebt; S3: das Ende eines ANDEREN Jobs loest nicht;
# S4: das eigene loest
lauf job-start
{ [ $? = 0 ] && [ ! -e "$TOT" ]; } || fehler+=("S2 push nicht angenommen oder Worker beendet")
[ "$(besitzer)" = "ci-runner 111/1 gpu" ] || fehler+=("S2 besitzer.txt falsch: '$(besitzer)'")
lauf job-ende GITHUB_RUN_ID=222
[ -e "$SCH" ] || fehler+=("S3 fremder Ende-Hook loeste das Schloss")
lauf job-ende
[ -e "$SCH" ] && fehler+=("S4 eigener Ende-Hook loeste nicht")
# S5: eine lebende Karte haelt das Schloss (gpu-lauf.sh schreibt "<name> <zeit> pid=<lebend>") -> der Start wartet, wird nach
# der Frist ROT samt Worker-Ende, das Schloss bleibt der Karte
LEBT="punkte-radeon 2026-10-23T12:00:00+02:00 pid=$(cat /proc/$$/winpid)"
mkdir "$SCH" && echo "$LEBT" >"$SCH/besitzer.txt"
lauf job-start
{ [ $? = 1 ] && [ -e "$TOT" ]; } || fehler+=("S5 wartete nicht / nicht ROT nach Frist / Worker lebt weiter")
[ "$(besitzer)" = "$LEBT" ] || fehler+=("S5 fremdes Schloss veraendert")
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
# S10: ein fremdes Schloss ohne pid schweigt seit 61 min -> beim Namen geloest und genommen; S10b: seit 59 min -> es bleibt
mkdir "$SCH" && echo "karte-tot x" >"$SCH/besitzer.txt" && touch -d "61 minutes ago" "$SCH/besitzer.txt" "$SCH"
lauf job-start; c10=$?
{ [ $c10 = 0 ] && grep -q "verwaistes Schloss 'karte-tot x' geloest - es schweigt seit 61 min" "$T/hook.log"; } ||
    fehler+=("S10 schweigendes Schloss nicht beim Namen geloest (Exit $c10)")
lauf job-ende
mkdir "$SCH" && echo "karte-still x" >"$SCH/besitzer.txt" && touch -d "59 minutes ago" "$SCH/besitzer.txt" "$SCH"
lauf job-start; c10b=$?
{ [ $c10b = 1 ] && [ "$(besitzer)" = "karte-still x" ]; } || fehler+=("S10b ein 59-min-Schloss wurde geloest (Exit $c10b)")
rm -rf "$SCH"
# S11: ein Abbruch des Hooks (hier die Abweisung) raeumt zuerst den Arbeitsordner - nie urteilt ein alter Baum
baum
lauf job-start GITHUB_EVENT_NAME=pull_request; c11=$?
{ [ $c11 = 1 ] && [ -z "$(ls -A "$WS")" ]; } || fehler+=("S11 der Abbruch raeumte den Arbeitsordner nicht")
# S13: ein Halter, dessen pid nicht mehr lebt (gpu-lauf nach hartem Kill), wird sofort geloest
mkdir "$SCH" && echo "karte-hart 2026 pid=999999" >"$SCH/besitzer.txt"
lauf job-start; c13=$?
{ [ $c13 = 0 ] && grep -q "verwaistes Schloss 'karte-hart 2026 pid=999999' geloest - Halter pid=999999 lebt nicht" "$T/hook.log"; } ||
    fehler+=("S13 Schloss eines toten Halters nicht geloest (Exit $c13)")
# S14: das Ende raeumt den Arbeitsordner IMMER (auch nach einem gruenen Lauf)
baum
lauf job-ende
[ -z "$(ls -A "$WS")" ] || fehler+=("S14 das Ende raeumte den Arbeitsordner nicht")
# S15: die Frist des echten Hooks liegt unter Job-Deckel minus Plan (45 - 20 min = 1500 s), sonst kappt der Deckel ohne Namen
frist=$(sed -n 's/^FRIST_S=\([0-9]*\)$/\1/p' "$H/job-start.sh")
{ [ -n "$frist" ] && [ "$frist" -le 1500 ]; } || fehler+=("S15 Frist ${frist:-?} s ueber 1500 s (Deckel 45 min - Plan 20 min)")
# S16: der echte Hook beendet den Worker mit einem Befehl, den taskkill annimmt (die Attrappe ersetzt ihn nur im Test)
grep -q "^toete_worker() { taskkill -F -IM Runner.Worker.exe" "$H/job-start.sh" || fehler+=("S16 toete_worker im echten Hook fehlt")
taskkill -F -IM keiner-heisst-so.exe 2>&1 | grep -qiE "nicht gefunden|not found" || fehler+=("S16 taskkill -F -IM wird nicht verstanden")
cat "$T/hook.log"
if [ ${#fehler[@]} -gt 0 ]; then
    echo "SELBSTTEST ROT:"
    printf ' - %s\n' "${fehler[@]}"
    exit 1
fi
echo "SELBSTTEST GRUEN (S1-S16)"
rm -rf "$T"
exit 0
