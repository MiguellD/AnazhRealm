#!/bin/bash
# radeon-dienst.sh — die Radeon misst, ohne LLM und ohne Ende („Radeon nie leer“ 22.10.; Nachfolger von radeon-nie-leer2.sh):
# sobald die Karte 5 min frei ist (kein GPU-Schloss, keine laufende Messung, kein CI-Job), misst sie am jüngsten main die offenen
# Stationen (`punkte.cjs run --offen`) und pusht die Mess-Dateien nach punkte-maschine; buche-dienst.sh bucht daraus.
# CI VOR MESSUNG (10.11.: 17:08–17:40 maß sie neben CI-Jobs, ihre ROTs flossen als „echter Fall“ in die Buchung): startet während
# einer Messung ein Runner.Worker-Job, bricht sie ab (taskkill über den Baum) und verwirft ihre Datei.
# Misst ein Lauf 0 Stationen, wartet sie auf einen neuen main-Kopf. Log: /tmp/claude/w4/radeon-nie-leer.log (der Blick liest es).
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
schloss radeon || exit 0
PM=$T/w3/pm
L=$W/radeon-nie-leer.log
GS="${TEMP:-/tmp}/claude/gpu-schloss"
A="-c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com"
ci() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
frei() { [ ! -f "$GS/besitzer.txt" ] && ! ps -ef | grep -q "[p]unkte.cjs run" && ! ci; }
echo "$(date +%H:%M) START radeon-dienst (CI vor Messung, PID $(cat "$S/radeon.pid"))" >>"$L"
miss() { # $1 = Name im Log, Rest = Argumente für punkte.cjs
    local name=$1 K p ab w n g j
    shift
    K=$(git -C $R ls-remote origin refs/heads/main | cut -f1)
    [ -n "$K" ] || return 1
    cd "$PM" || return 1
    # ein Rest im Baum stammt von einem Lauf, den jemand beendete (Konto-Wechsel, CI): eine halbe Messung ist keine — verwerfen
    git checkout -q -- meisterkarte-quelle/punkte/messung 2>/dev/null
    git clean -fdq meisterkarte-quelle/punkte/messung 2>/dev/null
    git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"
    git rebase -q origin/punkte-maschine >/dev/null 2>&1 || git rebase --abort >/dev/null 2>&1
    echo "$(date +%H:%M) $name am ${K:0:8}" >>"$L"
    puls radeon "misst $name am ${K:0:8}"
    cd "$PM/meisterkarte-quelle/punkte" && { timeout 9000 node punkte.cjs run --sha "$K" --geraet radeon "$@" >"$W/radeon-nie-leer-lauf.out" 2>&1 & }
    p=$!
    ab=0
    while kill -0 $p 2>/dev/null; do
        if ci; then
            ab=1
            w=$(cat /proc/$p/winpid 2>/dev/null)
            [ -n "$w" ] && taskkill //T //F //PID "$w" >/dev/null 2>&1
            kill $p 2>/dev/null
            break
        fi
        sleep 15
    done
    wait $p 2>/dev/null
    cd "$PM" || return 1
    if [ $ab = 1 ]; then
        git checkout -q -- meisterkarte-quelle/punkte/messung 2>/dev/null
        git clean -fdq meisterkarte-quelle/punkte/messung 2>/dev/null
        grep -q "^punkte" "$GS/besitzer.txt" 2>/dev/null && rm -f "$GS/besitzer.txt" # das Schloss des eigenen, beendeten Laufs — die Karte gehört jetzt der CI
        echo "$(date +%H:%M) $name ABGEBROCHEN: CI-Job auf der Karte — Messung verworfen" >>"$L"
        return 2
    fi
    n=$(grep -cE "^  (GRÜN|ROT|OFFEN)" "$W/radeon-nie-leer-lauf.out")
    g=$(grep -cE "^  GRÜN" "$W/radeon-nie-leer-lauf.out")
    echo "$(date +%H:%M) $name gemessen ${K:0:8}: $n Stationen, $g GRÜN · $(grep -E "^  (GRÜN|ROT)" "$W/radeon-nie-leer-lauf.out" | cut -c1-60 | tr '\n' ' ' | cut -c1-300)" >>"$L"
    git add -A meisterkarte-quelle/punkte/messung && git $A commit -qm "Messung ${K:0:8} radeon: $name (radeon-dienst, $g GRÜN von $n, ohne CI daneben)" >/dev/null 2>&1
    for j in 1 2 3 4 5; do
        git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"
        git rebase -q origin/punkte-maschine && git push -q origin HEAD:punkte-maschine && {
            echo "$(date +%H:%M) Messung gepusht" >>"$L"
            break
        }
        git rebase --abort >/dev/null 2>&1
        sleep 20
    done
    [ "$n" = 0 ] && return 3
    return 0
}
f=0
while true; do
    if frei; then f=$((f + 1)); else
        f=0
        puls radeon "wartet: Karte belegt ($(head -1 "$GS/besitzer.txt" 2>/dev/null || echo CI/Messung))"
    fi
    if [ $f -ge 5 ]; then
        K0=$(git -C $R ls-remote origin refs/heads/main | cut -f1)
        miss "offene Stationen" --offen
        if [ $? = 3 ]; then
            puls radeon "nichts offen am ${K0:0:8} — wartet auf einen neuen main-Kopf"
            until [ "$(git -C $R ls-remote origin refs/heads/main | cut -f1)" != "$K0" ]; do sleep 120; done
        fi
        f=0
    elif [ $f -gt 0 ]; then puls radeon "Karte frei seit $f min — misst ab 5"; fi
    sleep 60
done
