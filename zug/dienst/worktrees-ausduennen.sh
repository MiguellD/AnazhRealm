#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# worktrees-ausduennen.sh [--trocken] [--alter <h>] — Ordnung auf dem Laptop (Schöpfer 10.11. 22:50: „zu viele worktrees, schwer die
# Übersicht zu halten“; gezählt 392, dazu je Baum ein fsmonitor-Dämon — git wurde minutenlang zäh).
# Entfernt NUR, was nichts verliert, und sagt je Baum warum er bleibt:
#   · der Baum liegt unter .claude/worktrees/ oder %TEMP%/claude/ (nie ein Geschwister-Ordner wie AnazhRealm-zug)
#   · er steht nicht auf der Bleibe-Liste der Maschine (koordination, koord-dienst, koord-zeile, punkte-*, pm, vorzug, mess-session)
#   · sein Kopf wurde seit <h> Stunden nicht bewegt (Standard 48)
#   · sein Kopf steht auf origin (`git branch -r --contains`): kein Commit lebt nur hier
#   · `git worktree remove` OHNE --force nimmt ihn: git selbst weist jeden Baum mit geänderten oder unverfolgten Dateien ab
# Zweige werden nie gelöscht. Jede Entfernung steht mit Pfad und Kopf im Log — `git worktree add <pfad> <kopf>` holt ihn zurück.
# Läuft mit niedriger Priorität (die Radeon misst nebenher). Log: /tmp/claude/dienst/worktrees-ausduennen.log
R=/c/Users/micha/AnazhRealm-profiband
L=/tmp/claude/dienst/worktrees-ausduennen.log
trocken=""
alter=48
while [ $# -gt 0 ]; do
    case "$1" in
        --trocken) trocken=1 ;;
        --alter) alter=$2; shift ;;
    esac
    shift
done
mkdir -p /tmp/claude/dienst
jetzt=$(date +%s)
weg=0; bleibt=0; n=0
echo "$(date '+%Y-%m-%d %H:%M') START${trocken:+ (trocken)} · älter als $alter h" >>"$L"
git -C $R worktree prune 2>/dev/null
git -C $R worktree list --porcelain | awk '/^worktree /{p=substr($0,10)} /^HEAD /{h=$2} /^$/{print h, p}' >/tmp/claude/dienst/worktrees.liste
while read -r kopf pfad; do
    n=$((n + 1))
    case "$pfad" in
        */.claude/worktrees/* | */Temp/claude/*) ;;
        *) continue ;; # Haupt-Baum und Geschwister-Ordner bleiben unberührt und ungezählt
    esac
    name=$(basename "$pfad")
    case "$name" in koordination | koord-dienst | koord-zeile | punkte-* | pm | vorzug | mess-session | wand-mess-*)
        bleibt=$((bleibt + 1)); continue ;;
    esac
    u=$(cygpath -u "$pfad")
    gd=$(git -C "$u" rev-parse --git-dir 2>/dev/null) || { bleibt=$((bleibt + 1)); echo "bleibt $pfad: kein lesbarer Baum" >>"$L"; continue; }
    t=$(stat -c %Y "$gd/HEAD" 2>/dev/null || echo "$jetzt")
    if [ $(((jetzt - t) / 3600)) -lt "$alter" ]; then bleibt=$((bleibt + 1)); continue; fi
    # schneller Weg zuerst: der Kopf liegt in main; sonst irgendein Zweig auf origin, der ihn enthält
    if ! git -C $R merge-base --is-ancestor "$kopf" origin/main 2>/dev/null && [ -z "$(git -C $R for-each-ref --count=1 --contains "$kopf" refs/remotes/origin 2>/dev/null)" ]; then
        bleibt=$((bleibt + 1)); echo "bleibt $pfad: Kopf ${kopf:0:8} steht nicht auf origin" >>"$L"; continue
    fi
    if [ -n "$trocken" ]; then weg=$((weg + 1)); echo "ginge $pfad ${kopf:0:8}" >>"$L"; continue; fi
    if nice -n 19 git -C $R worktree remove "$u" 2>/tmp/claude/dienst/worktree-rm.err; then
        weg=$((weg + 1)); echo "entfernt $pfad $kopf" >>"$L"
    else
        bleibt=$((bleibt + 1)); echo "bleibt $pfad: $(head -1 /tmp/claude/dienst/worktree-rm.err | cut -c1-120)" >>"$L"
    fi
done </tmp/claude/dienst/worktrees.liste
git -C $R worktree prune 2>/dev/null
echo "$(date '+%Y-%m-%d %H:%M') ENDE${trocken:+ (trocken)}: $n Bäume gesehen · ${trocken:+ginge }$weg entfernt · $bleibt bleiben · jetzt $(git -C $R worktree list | wc -l)" | tee -a "$L"
