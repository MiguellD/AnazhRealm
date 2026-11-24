#!/bin/bash
# bash pm-merge.sh bau <zweig> [<zweig>…]   baut die Merge-Kette auf dem frischen Kopf von punkte-maschine (kein Push), schreibt Kopf und Kette nach pm-merge.stand
# bash pm-merge.sh schub                    schiebt die gebaute Kette, NUR wenn der Remote-Kopf noch die Basis ist (kein force)
# Zwischen bau und schub liegt die Prüfung am gebauten Baum (pm-merge-pruef.sh).
set -u; cd /c/Users/micha/AnazhRealm-profiband || exit 2; export MSYS_NO_PATHCONV=1
S="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad"
if [ "$1" = "bau" ]; then shift
    P=$(git ls-remote origin refs/heads/punkte-maschine | cut -c1-40); git fetch -q origin $P; C=$P; KETTE=""
    for Z in "$@"; do
        H=$(git ls-remote origin refs/heads/$Z | cut -c1-40); [ -n "$H" ] || { echo "HALT: $Z fehlt"; exit 1; }; git fetch -q origin $H
        if git merge-base --is-ancestor $H $C; then echo "$Z ${H:0:8} liegt schon im Kopf"; continue; fi
        OUT=$(git merge-tree --write-tree $C $H); [ "$(echo "$OUT" | wc -l)" = "1" ] || { echo "HALT: Konflikt $Z"; echo "$OUT" | head -6; exit 1; }
        D=$(git diff --name-only $(git merge-base $C $H) $H | tr '\n' ' ')
        C=$(printf 'Merge %s (%s) in punkte-maschine: die Station des gelandeten Machers [skip ci]\n\nDateien: %s\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n' "$Z" "${H:0:8}" "$D" | git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit-tree $OUT -p $C -p $H)
        KETTE="$KETTE $Z@${H:0:8}"; echo "gebaut $Z ${H:0:8} → ${C:0:10} · $D"
    done
    echo "$P $C$KETTE" > "$S/pm-merge.stand"; echo "BASIS $P KOPF $C"
else
    read -r P C KETTE < "$S/pm-merge.stand"
    [ "$P" = "$C" ] && { echo "nichts zu schieben"; exit 0; }
    [ "$(git ls-remote origin refs/heads/punkte-maschine | cut -c1-40)" = "$P" ] || { echo "HALT: punkte-maschine hat sich bewegt — bau neu"; exit 3; }
    git push origin $C:refs/heads/punkte-maschine 2>&1 | tail -1; echo "GESCHOBEN $C ·$KETTE · $(date '+%H:%M:%S')"
fi
