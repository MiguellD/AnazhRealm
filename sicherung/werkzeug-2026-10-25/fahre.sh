#!/bin/bash
# fahre.sh <id> <zweig[@sha]>... — fährt EINEN Merge-Zug ohne Koordinator, vom Bau bis zur Punkte-Messung (23.10.: ein Zug kostete
# den Koordinator ~15 Weck-Runden mit vollem Kontext; jede Stufe hier wartet ohne LLM):
#   1 bau gegen origin/main → +integ-zug (die CPU-Batterie)        2 urteil bis GRUEN (zug.sh gibt EINEN Neulauf, dann ROT)
#   3 Kandidat → integ-probe (echt auf der Radeon, Label echt-gpu)  4 ABAB-Zeile in koordination zug/warteschlange.txt; der
#     Messplatz-Dienst der OMEN fährt sie, sein Urteil steht in zug/abab.txt (ein Werkzeug-Kandidat braucht keins)
#   5 landen (Fast-Forward, nur bei nicht-langsamer)                6 Punkte: GTX-Zeile in die Warteschlange, headless + Radeon hier,
#     die Mess-Dateien nach punkte-maschine; gebucht wird, wenn die GTX-Messung steht (buchen --kopf).
# Ein ROT hält den Zug an und nennt sich in der letzten Zeile: FAHRT ROT <stufe>: <grund>. Exit 0 gelandet · 1 ROT · 2 Aufruf.
# Umgebung: ZELLEN (ABAB-Zellen, Standard w-ego,g-third,d-ego,stadt,fahrt) · FAHRT_OHNE_PUNKTE=1 (Stufe 6 aus).
W=$(cd "$(dirname "$0")" && pwd)
ID="$1"
shift
if [ -z "$ID" ] || [ $# -eq 0 ]; then
    echo "Aufruf: fahre.sh <id> <zweig[@sha]>..."
    exit 2
fi
KOORD=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination
KZ=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koord-zeile
PUNKTE=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination
export ZUG_PUNKTE="$(cygpath -m "$PUNKTE")"  # die Punkte-Maschine lebt seit 921c6f6e in koordination
ZUGWT=/c/Users/micha/AnazhRealm-zug
ZELLEN=${ZELLEN:-w-ego,d-ego,stadt}
CO="Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
say() { echo "$(date '+%H:%M:%S') [$ID] $*"; }
rot() {
    say "FAHRT ROT $1: $2"
    exit 1
}
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p')
export TOKEN

# der jüngste echt-Job eines integ-probe-Laufs am SHA → fehlt | laeuft | gruen | rot
echt_stand() {
    node -e '
const [sha, token] = process.argv.slice(1);
const api = "https://api.github.com/repos/MiguellD/AnazhRealm/actions";
const h = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" };
(async () => {
    const runs = ((await (await fetch(api + "/runs?head_sha=" + sha + "&per_page=20", { headers: h })).json()).workflow_runs || [])
        .filter((r) => r.head_branch === "integ-probe").sort((a, b) => b.id - a.id);
    for (const r of runs) {
        const jobs = (await (await fetch(api + "/runs/" + r.id + "/jobs?per_page=100", { headers: h })).json()).jobs || [];
        const j = jobs.filter((x) => /^echt/.test(x.name)).sort((a, b) => b.id - a.id)[0];
        if (!j) continue;
        if (j.status !== "completed") return console.log("laeuft");
        if (j.conclusion === "skipped") continue;
        return console.log(j.conclusion === "success" ? "gruen" : "rot");
    }
    console.log(runs.length ? "laeuft" : "fehlt");
})().catch(() => console.log("fehlt"));' "$1" "$TOKEN"
}
# eine Zeile an koordination zug/warteschlange.txt (nur anhängen; dieselbe id nie zweimal)
# koordination per fetch + merge (der Mess-Baum trägt während einer laufenden Messung ungestagte Dateien: pull --rebase
# scheiterte dort still, der Push danach auch) und gebucht wird am AKTUELLEN main, nie am eigenen Landepunkt (24.10.: fahre z13
# buchte nach 4 h am alten Kopf 18a84649 und überschrieb die Buchung am neuen Kopf 056330d8)
koord_holen() { git -C "$PUNKTE" fetch -q origin koordination && git -C "$PUNKTE" merge -q --no-edit FETCH_HEAD; }
koord_zeile() {
    # in einem EIGENEN, sauberen Baum (detached): der koordination-Baum trägt während einer Punkte-Messung ungestagte
    # Mess-Dateien — pull --rebase scheiterte dort still und reset --hard warf die laufende Messung weg (24.10.)
    local zid="${1%% *}" i
    [ -e "$KZ/.git" ] || git -C "$KOORD" worktree add -q --detach "$KZ" origin/koordination 2>/dev/null
    for i in 1 2 3 4 5; do
        git -C "$KZ" fetch -q origin koordination && git -C "$KZ" checkout -q --detach --force FETCH_HEAD || { sleep 5; continue; }
        grep -q "^$zid " "$KZ/zug/warteschlange.txt" && return 0
        printf '%s\n' "$1" >>"$KZ/zug/warteschlange.txt"
        git -C "$KZ" add zug/warteschlange.txt
        git -C "$KZ" commit -q -m "zug/warteschlange: $zid (fahre $ID)" -m "$CO"
        git -C "$KZ" push -q origin HEAD:koordination 2>/dev/null && return 0
        sleep 5
    done
    return 1
}
abab_zeile() {
    git -C "$KOORD" fetch -q origin koordination 2>/dev/null
    git -C "$KOORD" show origin/koordination:zug/abab.txt 2>/dev/null | grep "^$1 " | tail -1
}
erledigt() {
    git -C "$KOORD" fetch -q origin koordination 2>/dev/null
    git -C "$KOORD" show origin/koordination:zug/erledigt.txt 2>/dev/null | grep "^$1 " | tail -1
}

BASIS=$(git ls-remote https://github.com/MiguellD/AnazhRealm.git refs/heads/main | cut -f1)
if [ -n "$FAHRT_KANDIDAT" ]; then
    # Wiederaufnahme an einem Kandidaten, dessen CI und echt schon grün sind (23.10.: das ABAB von z9 war wegen des
    # Instruments leer) — nur noch ABAB, landen und Punkte
    K=$(git -C "$ZUGWT" rev-parse "$FAHRT_KANDIDAT") || rot kandidat "$FAHRT_KANDIDAT unbekannt"
    WERKZEUG=0
    [ "$(echt_stand "$K")" = gruen ] || rot echt "Wiederaufnahme ohne grünen echt-Job an ${K:0:8}"
    say "Wiederaufnahme am Kandidaten $K (Basis main ${BASIS:0:8})"
else
# 1 bau
say "bau gegen main ${BASIS:0:8}: $*"
# direkt nach integ-probe: dort laufen CPU-Batterie und echt im SELBEN Lauf parallel (echt braucht nur den Kopf-Richter) —
# vorher erst integ-zug, dann integ-probe: ~12 + ~15 min hintereinander
out=$(bash "$W/zug.sh" bau --basis origin/main "$@" --push +integ-probe 2>&1)
echo "$out" | grep -E "^(drin|gefallen|schon drin|KANDIDAT|KEIN|PUSH|aufgefrischt)" | sed "s/^/  /"
K=$(echo "$out" | sed -n 's/^KANDIDAT \([0-9a-f]\{40\}\) .*/\1/p')
[ -n "$K" ] || rot bau "kein Kandidat ($(echo "$out" | tail -1))"
echo "$out" | grep -q "^PUSH ${K:0:8}" || rot bau "Push nach integ-probe abgewiesen"
WERKZEUG=0
echo "$out" | grep -q "Werkzeug (kein ABAB)" && WERKZEUG=1
say "Kandidat $K (Werkzeug=$WERKZEUG)"

# 2 urteil (CPU-Batterie auf integ-probe; echt läuft daneben)
for i in $(seq 1 60); do
    u=$(bash "$W/zug.sh" urteil "$K" 2>&1)
    rc=$?
    [ $rc = 0 ] && break
    [ $rc = 1 ] && rot urteil "$(echo "$u" | tail -1) — zug.sh teile $K halbiert"
    sleep 120
done
[ $rc = 0 ] || rot urteil "nach 120 min nicht GRUEN: $(echo "$u" | tail -1)"
say "urteil GRUEN"

# 3 echt (im selben Lauf, meist schon grün, wenn die Batterie es ist)
for i in $(seq 1 60); do
    e=$(echt_stand "$K")
    [ "$e" = gruen ] && break
    [ "$e" = rot ] && rot echt "der echt-Job an ${K:0:8} ist rot"
    sleep 90
done
[ "$e" = gruen ] || rot echt "nach 90 min kein grüner echt-Job ($e)"
say "echt GRUEN"
fi

# 4 ABAB über den Messplatz-Dienst
if [ -n "$FAHRT_ABAB_GLEICH" ]; then
    # ein Neubau, der sich vom schon gemessenen Kandidaten nur im Werkzeug unterscheidet: landen übernimmt dessen Urteil
    say "kein neues ABAB: das Urteil von ${FAHRT_ABAB_GLEICH:0:8} gilt (Werkzeug-Diff, zug.sh landen)"
elif [ $WERKZEUG = 0 ]; then
    koord_zeile "$ID-abab 1 abab A=$BASIS B=$K zellen=$ZELLEN" || rot abab "Zeile nicht in die Warteschlange"
    say "ABAB-Zeile $ID-abab steht in der Warteschlange"
fi

# 5 landen — NACHWACHE (23.10.): gelandet wird bei grüner Batterie und grünem echt; das ABAB der GTX urteilt danach über main,
# ein LANGSAMER meldet der Fahrer als NACHWACHE ROT (Revert des Zuges). Ohne FAHRT_NACHWACHE=0 wartet nichts auf die GTX.
NW=--nachwache
[ "${FAHRT_NACHWACHE:-1}" = 0 ] && NW=
l=$(bash "$W/zug.sh" landen "$K" $NW 2>&1)
rc=$?
[ $rc = 0 ] || rot landen "$(echo "$l" | tail -1)"
say "$(echo "$l" | tail -1)"

# 6 Punkte am gelandeten Kopf — läuft neben der Nachwache
[ "${FAHRT_OHNE_PUNKTE:-0}" = 1 ] && exit 0
if [ -n "$NW" ] && [ $WERKZEUG = 0 ]; then
    (
        for i in $(seq 1 180); do
            z=$(abab_zeile "$K")
            [ -n "$z" ] && break
            sleep 120
        done
        case "$z" in
            *nicht-langsamer*) say "NACHWACHE GRUEN: $z" ;;
            "") say "NACHWACHE OFFEN: nach 6 h kein ABAB-Urteil für ${K:0:8}" ;;
            *) say "NACHWACHE ROT: $z — am selben Tag lokal bisektieren und an der Wurzel heilen (Heil-Zug mit ABAB-Zeile), sonst den Zug ${K:0:8} per Revert zurücknehmen" ;;
        esac
    ) &
    WACHE=$!
fi
koord_zeile "$ID-punkte 2 punkte sha=$K geraet=gtx" && say "GTX-Punkte $ID-punkte stehen in der Warteschlange"
for g in headless radeon; do
    p=$(bash "$W/zug.sh" punkte "$K" --geraet $g 2>&1)
    say "$(echo "$p" | grep '^PUNKTE' | tail -1)"
done
git -C "$PUNKTE" add meisterkarte-quelle/punkte/messung
git -C "$PUNKTE" commit -q -m "Punkte-Maschine: headless + Radeon am Kopf ${K:0:8} (fahre $ID)" -m "$CO" &&
    { koord_holen && git -C "$PUNKTE" push -q origin HEAD:koordination; }
for i in $(seq 1 120); do
    [ -n "$(erledigt "$ID-punkte")" ] && break
    sleep 120
done
say "GTX: $(erledigt "$ID-punkte")"
koord_holen
KOPF=$(git ls-remote origin refs/heads/main | cut -c1-40)
b=$(node "$PUNKTE/meisterkarte-quelle/punkte/punkte.cjs" buchen --kopf "$KOPF" 2>&1 | tail -1)
say "buchen: $b"
(cd "$PUNKTE" && node meisterkarte-quelle/gen.cjs build >/dev/null 2>&1 && node meisterkarte-quelle/gen.cjs check 2>&1 | grep -m1 Summe | sed "s/^/  /")
git -C "$PUNKTE" add -A meisterkarte-quelle MEISTERKARTE.md meisterkarte.json 2>/dev/null
git -C "$PUNKTE" commit -q -m "Punkte-Maschine: Buchung am Kopf ${KOPF:0:8} (fahre $ID) — $b" -m "$CO" && { koord_holen; git -C "$PUNKTE" push -q origin HEAD:koordination; }
[ -n "$WACHE" ] && wait "$WACHE"
say "FAHRT GELANDET ${K:0:8}"
exit 0
