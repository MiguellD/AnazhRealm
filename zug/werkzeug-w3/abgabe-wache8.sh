#!/bin/bash
# abgabe-wache8.sh (Welle w13, 06.11.) — EINE Instanz (Token-Ablöse); endet beim ERSTEN neuen Abgabe-Commit (damit der Koordinator geweckt
# wird) oder nach ~28 min; jede Meldung auch in w3/abgabe.log. WIP-Pushes werden nur still als gesehen gemerkt.
cd /c/Users/micha/AnazhRealm-profiband
S="$(cygpath -u "$TEMP")/claude/w3/abgabe.seen"; touch "$S"
T="$(cygpath -u "$TEMP")/claude/w3/abgabe.token"; ICH="$-$(date +%s%N)"; echo "$ICH" > "$T"; LOG="$(cygpath -u "$TEMP")/claude/w3/abgabe.log"
meld() { echo "$*"; echo "$(date +%H:%M) $*" >> "$LOG"; }
N="w18-innen-licht w18-kamera-haus w15-fern-hang w16-wald-innen w19-ankunft-takt w19-tier-kreis w19-tier-kreis-pm w19-fahrt-ziel w19-saum-lai w19-gang-hitch w20-haar-arm w20-lack-spiegel w20-leib-takt w20-boee-bild w20-modul-teil w20-fern-hang w20-innen-regen w20-wald-kosten w15-ki-strom-2 w21-wiese-fern w21-laub-jahr-fern w21-laub-unten w21-leib-bau"
for runde in 1 2 3 4 5 6 7 8 9 10 11 12; do
    R=$(git ls-remote origin 2>/dev/null)
    neu=0
    for n in $N; do for b in $n $n-pm; do
        [ "$(cat "$T" 2>/dev/null)" = "$ICH" ] || exit 0
        sha=$(echo "$R" | awk -v r="refs/heads/$b" '$2==r{print $1}')
        [ -z "$sha" ] && continue
        grep -q "^$b $sha$" "$S" && continue
        git fetch -q origin "+refs/heads/$b:refs/remotes/origin/$b" 2>/dev/null
        subj=$(git log -1 --format=%s "$sha" 2>/dev/null)
        [ -z "$subj" ] && continue
        echo "$b $sha" >> "$S"
        case "$subj" in Abgabe*|*" Abgabe"*|*Abgabe:*) meld "ABGABE $b ${sha:0:8} $(echo "$subj" | cut -c1-150)"; neu=1;;
            *) echo "$(date +%H:%M) wip $b ${sha:0:8} $(echo "$subj" | cut -c1-100)" >> "$LOG";; esac
    done; done
    [ $neu = 1 ] && exit 0
    [ $runde -lt 12 ] && sleep 150
done
echo "STILL nach ~27 min: $(grep -c ' wip w14-' "$LOG" 2>/dev/null) WIP-Zeilen bisher"
exit 0
