#!/bin/bash
# buche-dienst.sh — bucht ohne LLM und ohne Ende nach JEDER neuen Mess-Scheibe am JÜNGSTEN main-Kopf (ein Push auf
# punkte-maschine, der messung/<kopf8>-*.json berührt — OMEN, Radeon oder Farm). Nachfolger von buche-je-scheibe.sh, das nach 8 h
# still endete. Die Wand von buche.sh bleibt: fällt die Summe, wird nichts gebucht (ein echter Fall braucht BUCHE_FALL=1 von Hand).
# Log: /tmp/claude/w4/buche-je-scheibe.log — jede Zeile nennt Kopf, Scheibe und das Wort der Buchung.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
schloss buche || exit 0
L=$W/buche-je-scheibe.log
echo "$(date +%H:%M) START buche-dienst (folgt main, PID $(cat "$S/buche.pid"))" >>"$L"
alt=""
while true; do
    git -C $R fetch -q origin "+refs/heads/main:refs/remotes/origin/main" "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" 2>/dev/null
    K=$(git -C $R rev-parse origin/main)
    k8=${K:0:8}
    neu=$(git -C $R log -1 --format=%H origin/punkte-maschine -- "meisterkarte-quelle/punkte/messung/${k8}-*.json" 2>/dev/null)
    if [ -n "$neu" ] && [ "$K:$neu" != "$alt" ]; then
        puls buche "bucht am $k8 (Scheibe ${neu:0:8})"
        out=$(cd $R && BUCHE_KOPF=$K timeout 900 bash "$WZ/buche.sh" 2>&1)
        wort=$(echo "$out" | grep -E 'GEBUCHT|fällt|ROT:|verlieren' | head -3 | tr '\n' ' ' | cut -c1-400)
        echo "$(date +%H:%M) Kopf $k8 · Scheibe ${neu:0:8}: $wort" >>"$L"
        alt="$K:$neu"
        puls buche "zuletzt $k8 · ${wort:0:120}"
    else puls buche "wartet auf eine neue Scheibe am $k8${wort:+ · zuletzt ${wort:0:100}}"; fi
    sleep 300
done
