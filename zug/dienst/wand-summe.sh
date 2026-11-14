#!/bin/bash
# UNTER sh.exe (13.11.): jeder Prozess-Start unter dem installierten bash.exe kostet auf diesem Rechner 1–2,6 s, unter dem
# byte-gleichen sh.exe daneben 30–90 ms (fork-zeit: exec true, Subshell — das Sammeln des Zug-Diensts stand daran 11–18 min je Zug).
# Als sh gerufen schaltet die Zeile nur POSIX ab (volles bash); sonst startet sich das Skript EINMAL unter sh.exe neu.
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# wand-summe.sh <zweig> [<zweig> …] — die WACHSTUMS-WAND vor dem Zug, OHNE LLM (Lehre z357, 10.11. 02:02: w27-takt-streu fuhr allein
# und fiel nach 5 min an Prüf +1672 / Spiel +1217). Die Wand urteilt über die SUMME des Zugs (diag-betriebsgesetz.cjs Abschnitt 6): ein
# Linsen-Zweig fährt mit Spiel-Zweigen. Dieses Werkzeug misst je Zweig und für das Bündel in der genannten Reihenfolge gegen origin/main,
# mit dem Gesetz des gemessenen Stands (kein Zwilling der Zählung, siehe `mess`). Letzte Zeile: „BÜNDEL GRÜN …“ oder „BÜNDEL ROT …“ / „BÜNDEL KONFLIKT bei …“.
R=/c/Users/micha/AnazhRealm-profiband; W=/tmp/claude/w4/wand-mess-$$; A="-c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com"
export NODE_PATH="C:/Users/micha/AnazhRealm-profiband/node_modules"
# 10.11. 19:05: ein Baum JE LAUF — zwei gleichzeitige Läufe (Kette und Koordinator) teilten wand-mess, zogen sich den Baum weg und
# meldeten „KONFLIKT gegen main" ohne SHA für w27-takt-gc, das sauber mergt
# DER STEHENDE BAUM (14.11.): WAND_BAUM=<pfad> nennt den Baum EINES Rufers (der Zug-Dienst: ein Schloss, eine Instanz). Er wird nur
# umgestellt (checkout --detach), nie neu ausgecheckt und nie entfernt. Ohne WAND_BAUM bleibt der Baum je Lauf. Gemessen 14.11.
# je Ruf (ein Zweig, 141 s): fetch 23 · worktree add 4 · checkout 13 · node 99 s — davon die Wand 6 97 s, fast ganz der Wochen-Stand
# (7 Tage Diff), der je Sammlung für jeden Kandidaten derselbe ist; der Checkout ist nicht die Last.
if [ -n "$WAND_BAUM" ]; then W=$WAND_BAUM; else trap 'git -C $R worktree remove --force $W 2>/dev/null' EXIT; fi
# --nur-buendel: ohne die Zeile je Zweig — der Zug-Dienst fragt je Kandidat nur das Urteil des Bündels (je Zweig eine Messung von
# ~70 s gespart; 11.11.: das Sammeln eines Zugs aus acht Bereiten dauerte so über zehn Minuten)
NB=""; [ "$1" = "--nur-buendel" ] && { NB=1; shift; }
[ $# -ge 1 ] || { echo "Aufruf: wand-summe.sh [--nur-buendel] <zweig> [<zweig> …]"; exit 2; }
git -C $R fetch -q origin "+refs/heads/main:refs/remotes/origin/main" 2>/dev/null
for b in "$@"; do git -C $R fetch -q origin "+refs/heads/$b:refs/remotes/origin/$b" 2>/dev/null || { echo "$b: kein Zweig auf origin"; exit 2; }; done
if [ -n "$WAND_BAUM" ] && git -C $W rev-parse -q --verify HEAD >/dev/null 2>&1; then
  git -C $W checkout -q -f --detach origin/main && git -C $W clean -fdq || exit 2
else git -C $R worktree remove --force $W 2>/dev/null; [ -n "$WAND_BAUM" ] && rm -rf "$W" && git -C $R worktree prune; git -C $R worktree add -q --detach $W origin/main || exit 2; fi
cd $W || exit 2; G=$(git rev-parse HEAD)
# Das Urteil fällt mit dem Gesetz des GEMESSENEN STANDS selbst — wie am Kandidaten (zug.cjs ruft das Skript im Zug-Baum). Bis 11.11.
# maß die Vorprüfung mit dem Gesetz von main: einem Zug, der das Gesetz ändert (w28-wand-zug: der Zug trägt sich selbst, dazu der
# Überschuss der Woche), sagte sie das ALTE Urteil voraus. Beide Wortlaute gelten: alt „Wachstum --grund: …“, neu „… · Zug: …“.
mess() {
  git checkout -q --detach $1 2>/dev/null || { echo "WACHSTUMS-WAND (Vorprüfung): der Stand ${1:0:8} lässt sich nicht auschecken"; return; }
  local a; a=$(node scripts/diag-betriebsgesetz.cjs --grund tag 2>&1)
  echo "$a" | grep -oE "WACHSTUMS-WAND \([^)]*\): .*" | head -1 | cut -c1-300 | grep . && return
  echo "$a" | grep -oE "(Zug|Wachstum --grund): Prüf [^·]+· erlaubt [0-9-]+" | head -1 | grep . && return
  # DAS GESETZ FIEL AN EINER ANDEREN WAND (14.11.: w28-stadt-grammatik a9f6f6bc + main ffb005db — „DECKE (Datei): diag-settlement.cjs
  # trägt 4021 Zeilen“; die Vorprüfung sagte „keine Messung“ und hielt den Zweig wortlos draußen): ihr Text IST das Urteil
  echo "$a" | grep -E "❌" | head -1 | cut -c1-300
}
K=$G
for b in "$@"; do
  if [ -n "$NB" ]; then :
  elif T=$(git merge-tree --write-tree $G origin/$b 2>/dev/null | head -1) && git merge-tree --write-tree $G origin/$b >/dev/null 2>&1; then
    echo "$b $(git rev-parse --short=8 origin/$b): $(mess $(git $A commit-tree $T -p $G -m "wand-summe $b"))"
  else echo "$b $(git rev-parse --short=8 origin/$b): KONFLIKT gegen main"; fi
  if [ -n "$K" ]; then
    if git merge-tree --write-tree $K origin/$b >/dev/null 2>&1; then K=$(git $A commit-tree $(git merge-tree --write-tree $K origin/$b | head -1) -p $K -p origin/$b -m "wand-summe bündel $b"); else echo "BÜNDEL KONFLIKT bei $b"; K=""; fi
  fi
done
[ -n "$K" ] || exit 1
s=$(mess $K); case "$s" in "Wachstum --grund"*|"Zug: "*) echo "BÜNDEL GRÜN (Grund ${G:0:8}): $s"; exit 0 ;; *) echo "BÜNDEL ROT (Grund ${G:0:8}): ${s:-keine Messung (das Gesetz des Stands sprach nicht)}"; exit 1 ;; esac
