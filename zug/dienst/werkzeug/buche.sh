#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# [BUCHE_KOPF=<sha>] buche.sh [--warte <auftrag-id>] — bucht die Meisterkarte am aktuellen main-Kopf (oder am festen Kopf BUCHE_KOPF, wenn der Zug schon weiter ist) aus allen Mess-Dateien (Punkte-Maschine).
# Mit --warte wartet es, bis <auftrag-id> in koordination zug/erledigt.txt steht (z. B. die GTX-Punkte eines Mess-Takts).
# buche.sh --selbsttest: das Holen mit Seite und die Push-Wand an einer Fixtur (ohne Netz, fasst den Buchungs-Baum nicht an).
# Schritte: Baum koordination holen · punkte.cjs buchen --kopf <main> · meta.js (kopf, version, integ, titel) · gen build ·
# ansicht · commit · push koordination UND punkte-maschine (die OMEN misst aus punkte-maschine). Das Artifact veröffentlicht
# der Koordinator (gleicher Pfad meisterkarte.html). Lehre 24.10.: 8 h 53 min ohne Buchung, die 80 lief 32 s hinter Zug 24.
set -u
KO=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination
CO="Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
say() { echo "$(date +%H:%M:%S) [buche] $*"; }
PAUSE=10
# DER BAUM HOLT BEIDE SEITEN AN EINER STELLE, MIT SEITE — Anfang UND Push rufen dieselbe Funktion. Zwei Schritte statt Oktopus
# (10.11. 22:28: die OMEN pusht dieselbe Mess-Datei getrennt nach koordination und punkte-maschine; traf die Buchung zwischen beide
# Pushes, fiel der Oktopus an „both added“ und ließ den Baum im Konflikt stehen). Die Messung gehört punkte-maschine: gegen
# koordination gewinnt der Baum (er trägt den zuletzt gemergten Stand von punkte-maschine und die Karten-Dateien, die jede Buchung
# neu erzeugt), gegen punkte-maschine gewinnt ihre Seite. 15.11.: bis heute trug nur der zweite Merge eine Seite und die Push-Schleife
# gar keine — am 14.11. 23:47 fiel sie dreimal an 68d24688-gtx.json (Baum: Fassung 23:36 aus punkte-maschine, koordination: Fassung
# 23:46), der Baum blieb 4 Commits vor dem Ursprung und fiel 54 Läufe in 11 h am selben Streit; die ROT-Zeile nannte dabei die ersten
# drei Zeilen des Status (M FUND-REGISTER.md …), nie die Datei im Streit. Ein Streit steht beim Namen (STREIT … — Seite …); ein
# Merge, der auch mit Seite fällt (ändern ↔ löschen), wird zurückgenommen — der Baum bleibt nie im Konflikt — und endet ROT.
hole() {
    local s ref e w
    git -C "$KO" fetch -q origin +refs/heads/koordination:refs/remotes/origin/koordination +refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine || { say "ROT: fetch scheitert"; return 1; }
    for s in "ours origin/koordination" "theirs origin/punkte-maschine"; do
        ref=${s#* }
        e=$(git -C "$KO" merge -q --no-edit "$ref" 2>&1) && continue
        w=$(git -C "$KO" diff --name-only --diff-filter=U | head -5 | tr '\n' ' ')
        git -C "$KO" merge --abort 2>/dev/null
        [ -n "$w" ] || { say "ROT: der Baum merget $ref nicht ($(printf '%s\n' "$e" | grep -m1 . | cut -c1-200))"; return 1; }
        say "STREIT mit $ref an $w— Seite ${s% *}"
        e=$(git -C "$KO" merge -q --no-edit -X "${s% *}" "$ref" 2>&1) && continue
        w=$(git -C "$KO" diff --name-only --diff-filter=U | head -5 | tr '\n' ' ')
        git -C "$KO" merge --abort 2>/dev/null
        say "ROT: der Baum merget $ref auch mit Seite ${s% *} nicht ($w$(printf '%s\n' "$e" | grep -m1 . | cut -c1-200))"
        return 1
    done
}
# EINE BUCHUNG IST ERST GEBUCHT, WENN SIE AM URSPRUNG STEHT (15.11.: die Schleife fiel am 14.11. 23:47 dreimal, lief still durch, und
# die Zeile darunter meldete „GEBUCHT 223“ — der stille Fallback IST der Bruch). Sie holt beide Seiten wie der Anfang (punkte-maschine
# wandert mit jeder Scheibe weiter; bis heute holte die Schleife nur koordination). Fällt der Push dreimal, endet die Buchung ROT beim
# Namen; ihr Commit bleibt im Baum und reist mit der nächsten Scheibe.
veroeffentliche() {
    local i e
    for i in 1 2 3; do
        if hole; then
            e=$(git -C "$KO" push -q origin HEAD:koordination 2>&1) && e=$(git -C "$KO" push -q origin HEAD:refs/heads/punkte-maschine 2>&1) && return 0
        else e="das Holen fiel"; fi
        sleep "$PAUSE"
    done
    say "ROT: die Buchung $1 steht nur im Baum — der Push fiel dreimal ($(printf '%s\n' "$e" | grep -m1 -E '!|error|fatal|remote:|fiel' | cut -c1-200))"
    return 1
}
# --selbsttest (≤ 20 s, ohne Netz; Leser: start.sh --selbsttest): der Täter vom 14.11. als Fixtur. Die Messung x.json steht im Baum
# in der Fassung v1 (aus punkte-maschine gemergt), koordination und punkte-maschine tragen v2 als getrennte Commits.
# (1) der Merge OHNE Seite fällt — vorher ROT am Täter · (2) hole endet grün, nennt den STREIT beim Namen, der Baum trägt v2 und
# keinen offenen Merge · (3) ein Ursprung, der den Push abweist, endet ROT „steht nur im Baum“ statt GEBUCHT · (4) Gegenprobe: ohne
# Abweisung trägt der Ursprung den Kopf des Baums in beiden Zweigen.
selbsttest() {
    local t o q a f=meisterkarte-quelle/punkte/messung/x.json
    t=/tmp/claude/dienst/selbsttest-buche && rm -rf "$t" && mkdir -p "$t" && o=$t/origin.git && q=$t/quelle || return 1
    g() { git -c user.name=selbsttest -c user.email=selbsttest@invalid -c commit.gpgsign=false -c core.autocrlf=false "$@"; }
    schreibe() { g -C "$q" checkout -q "$1" && echo "$2" >"$q/$f" && g -C "$q" add -A && g -C "$q" commit -q -m "$1 $2" && g -C "$q" push -q origin "$1"; }
    rot() { echo "buche.sh SELBSTTEST ROT: $1"; rm -rf "$t"; return 1; }
    g init -q --bare "$o" && g init -q "$q" && g -C "$q" remote add origin "$o" && mkdir -p "$q/${f%/*}" && echo v0 >"$q/$f" &&
        g -C "$q" add -A && g -C "$q" commit -q -m basis && g -C "$q" branch -M koordination && g -C "$q" branch punkte-maschine &&
        g -C "$q" push -q origin koordination punkte-maschine || { rot "Fixtur (Ursprung)"; return 1; }
    KO=$t/ko
    PAUSE=0
    g clone -q -b koordination "$o" "$KO" && g -C "$KO" config user.name selbsttest && g -C "$KO" config user.email selbsttest@invalid && g -C "$KO" config core.autocrlf false &&
        schreibe punkte-maschine v1 && g -C "$KO" fetch -q origin && g -C "$KO" merge -q --no-edit origin/punkte-maschine &&
        schreibe punkte-maschine v2 && schreibe koordination v2 && g -C "$KO" fetch -q origin || { rot "Fixtur (Baum)"; return 1; }
    g -C "$KO" merge -q --no-edit origin/koordination >/dev/null 2>&1 && { rot "(1) der Merge ohne Seite fiel NICHT — die Fixtur trägt den Täter nicht"; return 1; }
    g -C "$KO" merge --abort
    a=$(hole) || { rot "(2) hole endet rot: $a"; return 1; }
    [ "$(cat "$KO/$f")" = v2 ] && [ ! -e "$KO/.git/MERGE_HEAD" ] && [ -z "$(g -C "$KO" status --short)" ] || { rot "(2) der Baum trägt nicht v2 oder steht im Merge"; return 1; }
    echo "$a" | grep -q "STREIT mit origin/koordination an $f" || { rot "(2) der STREIT steht nicht beim Namen: $a"; return 1; }
    mkdir -p "$o/hooks" && printf '#!/bin/sh\nexit 1\n' >"$o/hooks/pre-receive" && chmod +x "$o/hooks/pre-receive"
    echo karte >"$KO/karte.txt" && g -C "$KO" add -A && g -C "$KO" commit -q -m buchung || { rot "Fixtur (Buchung)"; return 1; }
    a=$(veroeffentliche 1/330) && { rot "(3) der abgewiesene Push endet grün"; return 1; }
    echo "$a" | grep -q "ROT: die Buchung 1/330 steht nur im Baum" || { rot "(3) das ROT nennt die Buchung nicht: $a"; return 1; }
    rm -f "$o/hooks/pre-receive"
    a=$(veroeffentliche 1/330) || { rot "(4) der Push fällt ohne Abweisung: $a"; return 1; }
    [ "$(g -C "$o" rev-parse koordination)" = "$(g -C "$KO" rev-parse HEAD)" ] && [ "$(g -C "$o" rev-parse punkte-maschine)" = "$(g -C "$KO" rev-parse HEAD)" ] || { rot "(4) der Ursprung trägt den Kopf des Baums nicht"; return 1; }
    rm -rf "$t"
    echo "buche.sh SELBSTTEST GRÜN (hole mit Seite, Streit beim Namen, Push-Wand)"
}
[ "${1:-}" = "--selbsttest" ] && { selbsttest; exit $?; }
if [ "${1:-}" = "--warte" ]; then
    ID=$2
    for i in $(seq 1 360); do
        git -C "$KO" fetch -q origin koordination 2>/dev/null
        git -C "$KO" show FETCH_HEAD:zug/erledigt.txt 2>/dev/null | grep -q "^$ID " && break
        sleep 60
    done
    say "erledigt: $(git -C "$KO" show FETCH_HEAD:zug/erledigt.txt | grep "^$ID " | tail -1 | cut -c1-160)"
fi
hole || exit 1
# DER MESS-KOPF (Luft holen, Rang 1): gebucht wird am Kopf, an dem der Takt gemessen hat (zug/mess-kopf.txt, erste Zeile „<sha40> <takt>“),
# nie am wandernden main — ohne Datei gilt main
MK=$(head -1 "$KO/zug/mess-kopf.txt" 2>/dev/null | grep -oE "^[0-9a-f]{40}")
KOPF=${BUCHE_KOPF:-${MK:-$(git -C "$KO" ls-remote origin refs/heads/main | cut -c1-40)}}
V=$(git -C "$KO" show "$KOPF:package.json" | sed -n 's/.*"version": *"\([0-9.]*\)".*/\1/p' | head -1)
# DIE EINHEIT IST DAS KRITERIUM (Kurs Konto 13, Schnitt 3 — 13.11.: die Wand „die Summe fällt“ stand hier seit dem 27.10. und sperrte am
# 13.11. mit zwei frischen ROT, schatten.K3#1 und K4#1, jede Buchung, auch jeden Gewinn derselben Fahrt). Geurteilt wird je Kriterium in
# punkte.cjs (die Ratsche + buchBilanz): der Gewinn wird gebucht, der Fall steht beim Namen ROT, keiner sperrt den anderen. Nur der
# MASSEN-FALL (Alarm des Apparats, z. B. eine sterbende Werkbank) bucht nichts: `buchen` endet dann mit Exit ≠ 0 und nennt jeden Fall;
# BUCHE_FALL=1 bucht ihn von Hand.
b=$(cd "$KO" && node meisterkarte-quelle/punkte/punkte.cjs buchen --kopf "$KOPF" ${BUCHE_FALL:+--fall} 2>&1); rc=$?
say "buchen: $(printf '%s\n' "$b" | tail -1)"
say "$(printf '%s\n' "$b" | grep -m1 '^BILANZ' | cut -c1-1500)"
# DIE WAND DER BUCHUNG (31.10. 20:31: buchen warf an der Fahrt-Wand, und buche.sh baute, committete und pushte trotzdem — der stille
# Fallback IST der Bruch): eine gescheiterte Buchung veröffentlicht nichts
[ "$rc" = 0 ] || { say "ROT: buchen Exit $rc — nichts veröffentlicht: $(printf '%s\n' "$b" | grep -m2 . | tr '\n' ' ' | cut -c1-300)"; exit 1; }
(cd "$KO/meisterkarte-quelle" && node -e '
const fs=require("fs");const f="src/meta.js";let t=fs.readFileSync(f,"utf8");const [k,v]=process.argv.slice(1);
t=t.replace(/kopf: "[0-9a-f]{8}",\n  version: "V[0-9.]+",\n  integ: "[0-9a-f]{8}",/,`kopf: "${k}",\n  version: "V${v}",\n  integ: "${k}",`);
t=t.replace(/Kopf main [0-9a-f]{8} \(V[0-9.]+\)/,`Kopf main ${k} (V${v})`);
const h=new Date(),iso=h.toISOString().slice(0,10),de=iso.slice(8,10)+"."+iso.slice(5,7)+"."+iso.slice(0,4);
t=t.replace(/stand: "[0-9]{4}-[0-9]{2}-[0-9]{2}"/,`stand: "${iso}"`).replace(/Stand [0-9]{2}[.][0-9]{2}[.][0-9]{4}, Kopf main/,`Stand ${de}, Kopf main`);fs.writeFileSync(f,t);' "${KOPF:0:8}" "$V")
# gen.cjs endet ROT bei Inhalts-Mängeln (z. B. Hebel-Tafel über der Staffel) und schreibt die Dateien trotzdem: die Ansicht baut immer
# (25.10.: `gen build && ansicht` liess die Seite seit 24.10. 23:51 auf 76 stehen, gebucht waren 86 und 92)
(cd "$KO/meisterkarte-quelle" && { node gen.cjs build > "$TEMP/claude/buche-gen.log" 2>&1 || say "gen ROT: $(grep -c '^ - ' "$TEMP/claude/buche-gen.log") Inhalts-Mängel (buche-gen.log)"; } && node ansicht.cjs 2>&1 | tail -1)
S=$(cd "$KO/meisterkarte-quelle" && node gen.cjs check 2>&1 | grep -m1 '^Summe' | cut -d' ' -f2)
# die Wand: die Seite trägt die gebuchte Summe, sonst wird nichts veröffentlicht
grep -q "Summe ${S%%/*}/330\|>${S%%/*}<\|${S%%/*}/330" "$KO/meisterkarte.html" || { say "ROT: meisterkarte.html trägt die Summe $S nicht"; exit 1; }
# der Kurs der Woche (Messplatz-Blick, Tab KURS) liest zug/budget.txt: jede Buchung schreibt ihre Summe selbst (26.10.: die Kurve
# stand von 01:45 bis 19:30 still, weil die Zeile von Hand kam)
printf '%s karte=%s (gebucht am %s, buche.sh)\n' "$(date +%Y-%m-%dT%H:%M)" "${S%%/*}" "${KOPF:0:8}" >> "$KO/zug/budget.txt"
git -C "$KO" add -A meisterkarte-quelle MEISTERKARTE.md meisterkarte.json meisterkarte.html zug/budget.txt 2>/dev/null
git -C "$KO" commit -q -m "Meisterkarte $S am Kopf ${KOPF:0:8} (V$V): Buchung aus allen Mess-Dateien (buche.sh)" -m "$CO" || say "nichts zu committen"
veroeffentliche "$S" || exit 1
say "GEBUCHT $S am Kopf ${KOPF:0:8} — Artifact: meisterkarte.html veröffentlichen"
