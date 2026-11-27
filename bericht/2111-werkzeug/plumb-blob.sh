#!/bin/bash
# plumb-blob.sh <elter40> <msg-datei> <pfad>=<blob40> … — ein Kind von ELTER im Objekt-Speicher von pm-kand, das an jedem genannten
# Pfad den genannten Blob trägt (neu oder ersetzt). Nur Plumbing: kein Index, kein Checkout, der Arbeitsbaum bleibt unberührt
# (27.11.: ein zweiter Hand-Lauf nutzte den Baum, während der erste Kandidat gesetzt wurde). Druckt den neuen Commit.
set -e
cd C:/Users/micha/AnazhRealm-pm-kand
ELTER=$1; MSG=$2; shift 2
setze() { # baum pfad blob → neuer Baum
    local t=$1 p=$2 b=$3
    case "$p" in
    */*)
        local kopf=${p%%/*} rest=${p#*/}
        local sub=$(git ls-tree "$t" | awk -v n="$kopf" -F'\t' '$2==n{split($1,a," ");print a[3]}')
        [ -n "$sub" ] || sub=$(git mktree < /dev/null)
        local neu=$(setze "$sub" "$rest" "$b")
        { git ls-tree "$t" | awk -v n="$kopf" -F'\t' '$2!=n'; printf '040000 tree %s\t%s\n' "$neu" "$kopf"; } | git mktree
        ;;
    *)
        { git ls-tree "$t" | awk -v n="$p" -F'\t' '$2!=n'; printf '100644 blob %s\t%s\n' "$b" "$p"; } | git mktree
        ;;
    esac
}
T=$(git rev-parse "$ELTER^{tree}")
for paar in "$@"; do
    p=${paar%%=*}; b=${paar#*=}
    git cat-file -e "$b" || { echo "BLOB fehlt: $b ($p)" >&2; exit 3; }
    T=$(setze "$T" "$p" "$b")
done
C=$(git commit-tree "$T" -p "$ELTER" -F "$MSG")
echo "$C"
git diff-tree -r --name-status "$ELTER" "$C" >&2
