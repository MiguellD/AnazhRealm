#!/bin/bash
# UNTER sh.exe (13.11.): jeder Prozess-Start unter dem installierten bash.exe kostet auf diesem Rechner 1–2,6 s, unter dem
# byte-gleichen sh.exe daneben 30–90 ms (fork-zeit: exec true, Subshell — das Sammeln des Zug-Diensts stand daran 11–18 min je Zug).
# Als sh gerufen schaltet die Zeile nur POSIX ab (volles bash); sonst startet sich das Skript EINMAL unter sh.exe neu.
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# heim.sh <zweig> <sha> — EIN ROTER ZWEIG-CHECK GEHT SOFORT HEIM, ohne LLM. Der Zug-Dienst hält eine Abgabe mit rotem Code-Check
# zu Recht draußen — aber bis 11.11. erfuhr es der Macher nie: w28-blatt-atlas-kalt lag fünf Stunden an einem Format-Umbruch,
# w28-putz-wand zweieinhalb an EINER Zeile der Quelltext-Wand, während der Koordinator-Laptop aus war. Jetzt schreibt der Dienst
# den roten Text (rot-text.cjs --sha) je Kopf EINMAL oben in cloud-post/<zweig>.md des Zweigs `koordination` — dort liest jeder
# Macher seine Post (Cloud, OMEN, GTX 1050). Ohne Arbeitsbaum: ein eigener Index, EIN Commit auf origin/koordination.
# HEIM_PROBE=1 druckt nur, was es schriebe. Läuft der Check noch oder ist er grün, tut es nichts; ein Fehler (Netz, Wettlauf beim
# Push) lässt die Marke weg — die nächste Runde des Diensts versucht es wieder.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
b=$1 sha=$2
M="$W/heim-$b-${sha:0:8}"
[ -n "$b" ] && [ -n "$sha" ] || { echo "Aufruf: heim.sh <zweig> <sha>"; exit 2; }
[ -e "$M" ] && exit 0
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git -C $R credential fill 2>/dev/null | sed -n 's/^password=//p')
t=$(TOKEN=$TOKEN node "$D/rot-text.cjs" --sha "$sha" 2>&1) || exit 1
echo "$t" | grep -q "^ROT " || exit 0
git -C $R fetch -q origin "+refs/heads/koordination:refs/remotes/origin/koordination" || exit 1
alt=$(git -C $R show "origin/koordination:cloud-post/$b.md" 2>/dev/null)
kopf=$(echo "$alt" | head -1)
case "$kopf" in "# "*) rest=$(echo "$alt" | tail -n +2) ;; *) kopf="# Post an $b" rest="$alt" ;; esac
{
    echo "$kopf"
    echo
    echo "## $(date '+%d.%m. %H:%M') — CODE-CHECK ROT am Kopf ${sha:0:8} (Zug-Dienst, ohne LLM)"
    echo
    echo "Der Zweig fährt in keinem Zug, solange sein eigener Check rot ist. Der rote Text:"
    echo
    echo '```'
    echo "$t" | head -24 | cut -c1-400
    echo '```'
    echo
    echo "Heilen, den Schritt lokal fahren (\`npm run check\`), neu abgeben (EIN Kopf, Betreff \`Abgabe $b: …\`)."
    echo "$rest"
} >"$W/heim.tmp"
[ -n "$HEIM_PROBE" ] && { head -16 "$W/heim.tmp"; exit 0; }
X=$(cygpath -w "$W/heim.index" 2>/dev/null || echo "$W/heim.index")
rm -f "$W/heim.index"
blob=$(git -C $R hash-object -w "$W/heim.tmp") &&
    GIT_INDEX_FILE="$X" git -C $R read-tree origin/koordination &&
    GIT_INDEX_FILE="$X" git -C $R update-index --add --cacheinfo "100644,$blob,cloud-post/$b.md" &&
    baum=$(GIT_INDEX_FILE="$X" git -C $R write-tree) &&
    c=$(git -C $R -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit-tree "$baum" -p origin/koordination -m "cloud-post $b: Code-Check ROT am Kopf ${sha:0:8} (Zug-Dienst) [skip ci]") &&
    git -C $R push -q origin "$c:refs/heads/koordination" &&
    : >"$M" &&
    echo "$(date +%H:%M) $b ${sha:0:8}: roter Check heim (cloud-post/$b.md)" >>"$W/zug-nie-leer.log"
