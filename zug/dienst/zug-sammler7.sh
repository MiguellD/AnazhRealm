#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# zug-sammler4.sh <id> <max-min> <zweig>... — wie zug-sammler3, dazu DER PULS URTEILT (30.10. 05:05: die volle Batterie fährt nur
# der Zug; der ci-waechter bricht Zweig-Läufe nach grünem Puls ab, gewertet werden NUR die Jobs „puls …“). Wie zug-sammler2, dazu WACKLER BLOCKIEREN NICHT (30.10.: z78 ließ 4 von 6 Zweigen an
# Kreatur-Linse, Ghost ohne Anker und Prägung-Welt liegen, der Koordinator stieß die Neuläufe von Hand an): ein gefallener Code-Check
# im ersten Versuch bekommt EINEN Neulauf der gefallenen Jobs (wie zug.sh beim Urteil) und zählt bis dahin als laufend.
# wartet (begrenzt), bis die CI am Kopf jedes Zweigs fertig ist, nimmt die grünen und am
# aktuellen main UND untereinander (Paar-Probe) konfliktfreien Zweige und fährt fahre.sh <id> damit. Endet selbst (Monitor-Ablauf tötet Git-Bash-Kinder nicht).
ID=$1; MAX=$2; shift 2
# zug-sammler5 (31.10. 17:15) = zug-sammler4 + DIE VORZUG-PROBE: z107 fuhr 90 min CI für einen Bruch, den 3 min zeigen (w4-mensch-kopf: der
# Mensch-Ofen lieferte die L2-Gestalt nie, __weltDa hing). Vor fahre.sh fährt `npm run playtest:fast` (headless, kein GPU-Schloss) am
# Merge-Kandidaten im eigenen Baum w3/vorzug; fällt er, je Zweig einzeln gegen main — wer fällt, bleibt mit Grund für den nächsten Zug.
cd /c/Users/micha/AnazhRealm-profiband; L="$(cygpath -u "$TEMP")/claude"
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p')
ci() { node -e '
const H={Authorization:"Bearer "+process.env.TOKEN,"User-Agent":"k",Accept:"application/vnd.github+json"},R="https://api.github.com/repos/MiguellD/AnazhRealm/actions";
(async()=>{const r=(((await (await fetch(R+"/runs?head_sha="+process.argv[1]+"&per_page=5",{headers:H})).json()).workflow_runs)||[]).filter(x=>x.name==="Code-Check")[0];
if(!r)return console.log("keine");
const p=(((await (await fetch(R+"/runs/"+r.id+"/jobs?per_page=100",{headers:H})).json()).jobs)||[]).filter(j=>/^puls /.test(j.name));
if(!p.length||p.some(j=>j.status!=="completed"))return console.log("laeuft");
if(p.every(j=>j.conclusion==="success"))return console.log("success");
if(r.run_attempt===1&&r.status==="completed"){const q=await fetch(R+"/runs/"+r.id+"/rerun-failed-jobs",{method:"POST",headers:H});return console.log(q.status===201?"laeuft":"failure")}
console.log(r.status==="completed"?"failure":"laeuft")})()' "$1"; }
export TOKEN
t0=$(date +%s)
while true; do
    R=$(git ls-remote origin); M=$(echo "$R" | awk '$2=="refs/heads/main"{print $1}'); git fetch -q origin "$M" 2>/dev/null
    gruen=""; offen=0; bericht=""
    for n in "$@"; do
        # „!zweig“ fährt ohne CI-Pflicht (30.10.: w4-siedlung-teilen — sein Puls fällt an der Wachstums-Wand, die w3w-studios im selben Zug bezahlt)
        zwang=0; case $n in "!"*) n=${n#!}; zwang=1;; esac
        s=$(echo "$R" | awk -v r="refs/heads/$n" '$2==r{print $1}'); [ -z "$s" ] && continue
        c=$(ci $s); [ -z "$c" ] && c=laeuft; [ $zwang = 1 ] && c=success;   # 04.11. z203: eine leere API-Antwort liess w9-gruss still fallen git fetch -q origin "+refs/heads/$n:refs/remotes/origin/$n" 2>/dev/null
        mt=$(git merge-tree --write-tree $M $s >/dev/null 2>&1 && echo frei || echo konflikt)
        bericht="$bericht $n=${c}/${mt}"
        [ "$c" = "laeuft" ] && offen=$((offen+1))
        [ "$c" = "success" ] && gruen="$gruen $n@$s"   # 30.10.: zug.cjs merged je Zweig und löst die Klassen a–g selbst — „konflikt“ ist nur Hinweis
    done
    el=$(( ($(date +%s) - t0) / 60 ))
    echo "$(date +%H:%M) [$ID] $bericht" >> "$L/zug-sammler-$ID.log"
    { [ $offen -eq 0 ] || [ $el -ge $MAX ]; } && break
    sleep 300
done
# DIE PAAR-PROBE (29.10.: spike-ci-konsum und w3v-leib-menge waren je für sich frei gegen main, zusammen nicht — fahre wäre erst
# im Bau gefallen): die Grünen werden in Aufruf-Reihe aufeinander gemergt; wer am Zwischenstand kollidiert, bleibt für den nächsten Zug.
C=$M; drin=""
for z in $gruen; do
    s=${z#*@}; T=$(git merge-tree --write-tree $C $s 2>/dev/null); rc=$?
    if [ $rc = 0 ]; then C=$(git commit-tree $(echo "$T" | head -1) -p $C -p $s -m paar); drin="$drin $z"
    else drin="$drin $z"; echo "$(date +%H:%M) [$ID] PAAR-HINWEIS ${z%@*} am Zwischenstand ($(echo "$T" | sed -n 2,4p | tr -s "[:space:]" " " | cut -c1-200)) — zug.cjs entscheidet (Klassen a–g, sonst fällt nur er)" | tee -a "$L/zug-sammler-$ID.log"; fi
done
gruen=$drin
[ -z "$gruen" ] && { echo "$ID: kein grüner Zweig"; exit 0; }
VZ=/tmp/claude/w3/vorzug
[ -d "$VZ" ] || { git worktree add -f --detach "$VZ" "$M" >/dev/null 2>&1; cmd //c "mklink /J $(cygpath -w "$VZ")\node_modules C:\Users\micha\AnazhRealm-profiband\node_modules" >/dev/null 2>&1; }
probe() { # <commit> <name> → Exit des playtest:fast am Commit (Log w3/vorzug-<ID>-<name>.log)
    git -C "$VZ" checkout -q --detach -f "$1" || return 9
    (cd "$VZ" && PLAYTEST_PORT=4586 timeout 900 npm run playtest:fast) > "/tmp/claude/w3/vorzug-$ID-$2.log" 2>&1
}
paarKette() { # <zweig@sha …> → Merge-Kandidat auf main (die Paar-Probe), auf stdout
    local c=$M z s T
    for z in "$@"; do s=${z#*@}; T=$(git merge-tree --write-tree $c $s 2>/dev/null) && c=$(git commit-tree $(echo "$T" | head -1) -p $c -p $s -m paar); done
    echo $c
}
statik() { # <commit> <name> → Exit von npm run check:statik am Commit (~2 min; Deckel, CI-Deckung, Atome, Prettier — die Wände des Puls 1/2)
    git -C "$VZ" checkout -q --detach -f "$1" || return 9
    (cd "$VZ" && timeout 1200 npm run check:statik) > "/tmp/claude/w3/statik-$ID-$2.log" 2>&1
}
# zug-sammler6 (04.11.): DIE STATIK-PROBE vor dem Zug. z173 z185 z186 z189 fielen am Puls 1/2 Statik (Deckel, Frist, Waage) erst nach
# 30–40 min CI; lokal sagt es dasselbe Urteil in 2 min. Fällt der Kandidat aller, packt die Probe gierig: Zweig für Zweig auf die Kette,
# wer die Wand reißt (allein oder erst in Summe), bleibt mit Grund für den nächsten Zug.
if statik "$(paarKette $gruen)" alle; then echo "$(date +%H:%M) [$ID] STATIK GRÜN am Kandidaten aller" | tee -a "$L/zug-sammler-$ID.log"
else
    echo "$(date +%H:%M) [$ID] STATIK ROT am Kandidaten aller — gierig packen" | tee -a "$L/zug-sammler-$ID.log"
    bleibt=""
    for z in $gruen; do
        n=${z%@*}
        if statik "$(paarKette $bleibt $z)" "$n"; then bleibt="$bleibt $z"
        else echo "$(date +%H:%M) [$ID] STATIK FÄLLT $n: $(grep -E "❌|ROT|VERLETZ" "/tmp/claude/w3/statik-$ID-$n.log" | head -2 | tr -s '[:space:]' ' ' | cut -c1-220)" | tee -a "$L/zug-sammler-$ID.log"; fi
    done
    gruen=$bleibt
fi
[ -z "$gruen" ] && { echo "$ID: kein Zweig hält die Statik-Probe"; exit 0; }
K=$(paarKette $gruen)
if probe "$K" alle; then echo "$(date +%H:%M) [$ID] VORZUG GRÜN: playtest:fast am Kandidaten aller$gruen" | tee -a "$L/zug-sammler-$ID.log"
else
    echo "$(date +%H:%M) [$ID] VORZUG ROT am Kandidaten aller — je Zweig einzeln" | tee -a "$L/zug-sammler-$ID.log"
    bleibt=""
    for z in $gruen; do
        n=${z%@*}
        if probe "$(paarKette $z)" "$n"; then bleibt="$bleibt $z"
        else echo "$(date +%H:%M) [$ID] VORZUG FÄLLT $n: $(grep -E "❌|ABSTURZ|timed out|Error" "/tmp/claude/w3/vorzug-$ID-$n.log" | head -2 | tr -s '[:space:]' ' ' | cut -c1-220)" | tee -a "$L/zug-sammler-$ID.log"; fi
    done
    gruen=$bleibt
fi
[ -z "$gruen" ] && { echo "$ID: kein Zweig hält die Vorzug-Probe"; exit 0; }
echo "FAHRE $ID:$gruen"
FAHRT_OHNE_PUNKTE=1 sh artifacts/profiband/werkzeug/fahre.sh $ID $gruen > "$L/fahre-$ID.log" 2>&1
echo "$ID EXIT=$?"; grep -E "drin|gefallen|KANDIDAT|FAHRT|GELANDET" "$L/fahre-$ID.log" | cut -c1-160
exit 0
