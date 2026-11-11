#!/bin/bash
# radeon-dienst.sh — die Radeon misst, ohne LLM und ohne Ende („Radeon nie leer“ 22.10.; Nachfolger von radeon-nie-leer2.sh):
# sobald die Karte 2 min frei ist (bis 11.11. 5: seit ein Abbruch behält, was er maß, kostet ein früher Start nichts — das Fenster zwischen zwei Zügen ist 15–20 min) (kein GPU-Schloss, keine laufende Messung, kein CI-Job), misst sie am jüngsten main die offenen
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
# DER ORDNER ist das Schloss (atomar mkdir, gpu-schloss.sh) — nie nur besitzer.txt lesen
frei() { [ ! -d "$GS" ] && ! ps -ef | grep -q "[p]unkte.cjs run" && ! ci; }
# verwaist: der Halter (pid= in besitzer.txt) lebt nicht mehr, oder der Ordner steht seit > 2 min ohne Halter (10.11. 21:54: der
# Konto-Wechsel beendete die Messung, ihr Schloss hing 35 min an pid 30944 — CI und Messung hätten daran gewartet)
verwaist() {
    local p
    [ -d "$GS" ] || return 1
    # DAS SCHLOSS EINES LAUFENDEN CI-JOBS IST NIE VERWAIST (12.11.: der Start-Hook des Läufers schreibt „ci-runner <lauf>/<versuch> <job>“
    # OHNE pid — die 2-min-Regel unten löschte es dem laufenden Job weg, 40× im Log seit dem 10.11.; 00:32 fiel daran die Probe
    # 43120264912 von w28-stadt-grammatik mit „das GPU-Schloss hält ‚niemand‘, nicht dieser Job“). Solange ein Runner.Worker lebt,
    # gehört ein ci-runner-Schloss ihm; verwaist ist es erst, wenn kein Job mehr läuft.
    case "$(head -1 "$GS/besitzer.txt" 2>/dev/null)" in ci-runner*) ci && return 1 ;; esac
    p=$(grep -m1 "^pid=" "$GS/besitzer.txt" 2>/dev/null | tr -dc 0-9)
    if [ -z "$p" ]; then [ $(($(date +%s) - $(stat -c %Y "$GS"))) -gt 120 ]; else ! tasklist -FI "PID eq $p" -NH 2>/dev/null | grep -qw "$p"; fi
}
echo "$(date +%H:%M) START radeon-dienst (CI vor Messung, PID $(cat "$S/radeon.pid"))" >>"$L"
miss() { # $1 = Name im Log, Rest = Argumente für punkte.cjs
    local name=$1 K p ab w n g j bis
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
            bis=$(date -u -d "30 seconds ago" +%Y-%m-%dT%H:%M:%SZ)
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
        verwaist && rm -rf "$GS" # das Schloss des eigenen, beendeten Laufs — die Karte gehört jetzt der CI
        # WAS VOR DEM JOB GEMESSEN WAR, BLEIBT (11.11.: die Züge lassen der Karte Fenster von 15–20 min, die volle Fahrt braucht mehr —
        # 06:55 · 12:07 · 12:41 fiel jedes Mal die GANZE Datei, 12:41 mit 14 fertigen Stationen; die Radeon buchte den Tag über nichts):
        # punkte.cjs behalte kappt jeden Eintrag, dessen Lauf nach $bis endete ($bis = der Abbruch − 30 s: der Takt dieser Wache 15 s
        # + 15 s Spiel), und hält den Rest; `--offen` misst beim nächsten Fenster nur, was fehlt
        (cd "$PM/meisterkarte-quelle/punkte" && node punkte.cjs behalte --sha "$K" --geraet radeon --bis "$bis" >"$W/radeon-behalte.out" 2>&1)
        if [ $? = 0 ]; then
            git add -A meisterkarte-quelle/punkte/messung && git $A commit -qm "Messung ${K:0:8} radeon: $name bis zum CI-Job ($(head -1 "$W/radeon-behalte.out" | cut -c1-80), radeon-dienst)" >/dev/null 2>&1
            for j in 1 2 3 4 5; do
                git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"
                git rebase -q origin/punkte-maschine && git push -q origin HEAD:punkte-maschine && break
                git rebase --abort >/dev/null 2>&1
                sleep 20
            done
            echo "$(date +%H:%M) $name ABGEBROCHEN: CI-Job auf der Karte — $(head -1 "$W/radeon-behalte.out" | cut -c1-200)" >>"$L"
        else
            git checkout -q -- meisterkarte-quelle/punkte/messung 2>/dev/null
            git clean -fdq meisterkarte-quelle/punkte/messung 2>/dev/null
            echo "$(date +%H:%M) $name ABGEBROCHEN: CI-Job auf der Karte — nichts vor dem Job gemessen ($(head -1 "$W/radeon-behalte.out" | cut -c1-120))" >>"$L"
        fi
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
    if verwaist; then
        echo "$(date +%H:%M) verwaistes GPU-Schloss gelöst ($(head -1 "$GS/besitzer.txt" 2>/dev/null | tr -d "") · $(grep -m1 "^pid=" "$GS/besitzer.txt" 2>/dev/null), Halter tot)" >>"$L"
        rm -rf "$GS"
    fi
    if frei; then f=$((f + 1)); else
        f=0
        puls radeon "wartet: Karte belegt ($(head -1 "$GS/besitzer.txt" 2>/dev/null || echo CI/Messung))"
    fi
    if [ $f -ge 2 ]; then
        K0=$(git -C $R ls-remote origin refs/heads/main | cut -f1)
        miss "offene Stationen" --offen
        rc=$?
        # DER RICHTER NACH DER LANDUNG (richter.sh der OMEN, B2 Stufe 1): jede Station GRÜN → ROT gegen den gebuchten Stand wird
        # halbiert und nennt ihren Täter in koordination zug/richter.txt — ohne LLM, mit CI-Vorfahrt wie die Messung
        if [ $rc = 0 ]; then
            puls radeon "Richter am ${K0:0:8}"
            RICHTER_MAX=2 bash "$D/richter.sh" radeon --kopf "$K0" >>"$S/richter.out" 2>&1
            echo "$(date +%H:%M) Richter ${K0:0:8}: $(grep -E "TÄTER|KEIN FALL|UNSCHARF|Fälle|FALL" "$S/richter.out" | tail -1 | cut -c1-220)" >>"$L"
        fi
        if [ $rc = 3 ]; then
            puls radeon "nichts offen am ${K0:0:8} — wartet auf einen neuen main-Kopf"
            until [ "$(git -C $R ls-remote origin refs/heads/main | cut -f1)" != "$K0" ]; do sleep 120; done
        fi
        f=0
    elif [ $f -gt 0 ]; then puls radeon "Karte frei seit $f min — misst ab 2"; fi
    sleep 60
done
