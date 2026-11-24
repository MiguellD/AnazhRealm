#!/bin/bash
# landung-dienst.sh — die OMEN misst die Stationen der Karte, ohne LLM und ohne Ende (Nachfolger von p3/n0611/stufe/landung.sh, das als
# Kind der App am 10.11. 21:52 mit dem Konto-Wechsel starb: Station 8 von 32 blieb liegen, das GPU-Schloss hing verwaist an pid 11320).
# DAS GESETZ DER RUNDE (Koordinator 19.11.; Befund: seit dem 17.11. begann dieser Dienst an 25 main-Köpfen eine Liste von 54 Stationen,
#   0 von 25 liefen bis zum Ende, Median 5 — jeder neue main-Kopf brach die Liste ab, die Regel SPRUNG vom 11.11./16.11. ist GEFALLEN):
#   1 EIN Mess-Kopf je Runde in EINER Datei: koordination zug/runde.txt (Kopf, Startzeit, Stand je Gerät; geschrieben nur über
#     zug/dienst/runde.cjs — frischer Stand, eigene Zeile, commit-tree, Push, sonst von vorn: zwei Geräte, kein Merge). Die OMEN fährt
#     ihre ganze Liste an DIESEM Kopf zu Ende, keine Landung löst sie ab; die nächste Runde nimmt den main-Kopf des Moments, in dem
#     beide Geräte durch sind (runde.cjs durch/weiter). So steht nach jeder Runde jede Station als Paar am SELBEN Kopf (Karte 2).
#   2 DIE REIHE FOLGT DER ERWARTETEN ÄNDERUNG (runde.cjs reihe, EINE Quelle für beide Geräte, 21.11.): NUR die Front der Karte 2
#     (--karte vision/meisterkarte-2.json: je Leiter die Sprosse heute, Glieder jede ungebuchte, dahinter nur lückenlos beansprucht) · K1 beansprucht (zug/anspruch.txt)
#     · K2 ohne Urteil · K3 GRÜN | der Schwanz K4 ROT anderes · K5 ROT „Leser fehlt“ · K6 ROT „Umfang nicht erzeugbar“ — die Klasse aus
#     dem jüngsten Urteil über alle Köpfe; darin die älteste Messung zuerst, eine Fahrt ≥ 10 min zuletzt. Die Liste wird beim Eintritt in
#     die Runde EINGEFROREN (Feld liste). Vorn und Schwanz fahren getrennt; bleibt nur der Schwanz und ist main weiter, TRÄGT er (getragen).
#   2a DIE GETEILTE FRONT (Koordinator 22.11.): die Radeon fährt den vorderen Teil dieser Liste vom anderen Ende (umgekehrt) — steht
#     sie noch nicht in zug/runde.txt, baut die Radeon sie selbst aus derselben Funktion (zug/dienst/front.sh front_bauen, 24.11.); was eines der Geräte am Kopf ROT urteilt, misst das andere nicht mehr (runde.cjs offen --anders —
#     hier offen_am und kandidat.sh vor jeder Sitzung; GRÜN und UNGEMESSEN der Radeon überspringen nie).
#   3 DER RICHTER DER RUNDE (richte_runde): nach der Liste nennt runde.cjs faelle jede Station, die am vorigen Mess-Kopf GRÜN und am
#     jetzigen ROT misst; NUR sie wird über die Köpfe dazwischen halbiert (richter.sh --fall <station> <vorher> <kopf>, Täter beim Namen).
#     Die erste Runde (kein voriger Mess-Kopf) richtet gegen die letzte Buchung (richter.sh --kopf, wie bis 19.11.).
#   4a DIE RUNDE SPRANG (Koordinator 22.11. 19:31): antwortet `runde.cjs stand` mit Exit 4 („ANDERE RUNDE“ — der Koordinator hob die
#     Runde, runde.cjs sprung), misst die Liste nichts mehr am alten Kopf: sie endet an der nächsten Stations-Grenze („RUNDE SPRANG auf
#     <kopf8>“ im Log), der nächste Takt liest die neue Runde (stand_ernten, sprang).
#   4 HALT, WEICHEN, NEUSTART setzen an DERSELBEN Station fort: was gepusht ist, trägt einen Eintrag in messung/<kopf8>-gtx.json
#     (runde.cjs offen), der Rest der eingefrorenen Liste folgt in ihrer Reihe — nie von vorn.
#   5 ALARM: ein Gerät ohne Fortschritt > 15 min in der Runde steht beim Namen in zug/erledigt.txt (runde.cjs alarm, je Takt; dieselbe
#     Zeile erst wieder nach 60 min) — die Runde wartet nicht still.
# Je Station EINE Sitzung (kandidat.sh EINZELN=1), Push nach punkte-maschine + eine Zeile mit der ROHEN Zahl je Station nach
# zug/erledigt.txt (ZAHL=1). CI vor Messung und das Schloss entscheidet kandidat.sh über p3/gpu-schloss.sh (gpu_frei, cpu_ruhe,
# Verdrängung durch gpu-lauf.sh); WEICH AN DER GRENZE (12.11.): GPU_LAUF_WEICH_S 600 s, eine gefallene Station stellt sich ans Ende.
# DIE LISTE: die Tafel der Karte 2 (vision/richter-tafel.json, Zeilen „gleich“, karte2_nur), ohne Tafel gtx-nutzen; profiband.* ruhen.
# PLATTE: unter $PLATTE_UNTEN GB frei beginnt keine Station (platte-dienst.sh hält eine laufende an) — beides ist ein ALARM der Runde
#   mit Zahl (runde.cjs alarm --grund: GB frei, Station, Kopf), danach setzt die Runde an derselben Station fort.
# HALT: Datei zustand/landung.halt — eine laufende Liste endet an der nächsten Stations-Grenze, die Schleife endet, die Flagge BLEIBT
#   liegen, bis der Koordinator sie wegnimmt (rm, dann start.sh); start.sh startet die Landung nicht, solange sie liegt.
# DIE REIHE DER ANKUNFT (Koordinator 22.11. 20:41; bis dahin „der Macher hat Vorrang“ 14.11.: die Runde 6 stand 18:29–20:41 bei 5 von
#   247, weil sie vor jeder Hand und dem Dienst-Selbsttest wich): die Runde WEICHT vor keinem Wartenden mehr — eine Fahrt misst ihre
#   Sitzungen zu Ende; an einer Stations-Grenze endet sie nur am CI-Job (kandidat.sh/gpu-lauf.sh, Vorfahrt), am HALT, am SPRUNG der
#   Runde und am getragenen Schwanz. Vor einer Fahrt stellt sie sich an (darf_beginnen): wer schon wartete, als sie ankam, geht vor;
#   wer danach kommt, wartet hinter ihr.
# BUCHUNG JE STATION (19.11.): kandidat.sh pusht jede geurteilte Station an ihrer Grenze („GEPUSHT … 1 Station(en)“) — der Zähler der
#   Runde steigt in der Sitzung, ein HALT oder eine Verdrängung verliert höchstens die eben begonnene Station.
# Beweis: `bash landung-dienst.sh --selbsttest` (Sandkasten mit eigenem origin: main · koordination · punkte-maschine).
# UNTER sh.exe (wie zug-dienst.sh, 13.11.): ein Prozess-Start kostet unter bash.exe 2 358 ms, unter dem byte-gleichen sh.exe 317 ms
# (22.11. 04:08); als sh gerufen schaltet die Zeile nur POSIX ab (volles bash), sonst startet sich das Skript EINMAL unter sh.exe neu.
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
D=$(cd "$(dirname "$0")" && pwd)
if [ -f "$D/gemein.sh" ]; then GEMEIN_SH=$D/gemein.sh; else GEMEIN_SH=$D/../dienst/gemein.sh; fi
. "$GEMEIN_SH"
export KANDIDAT_GEMEIN=$GEMEIN_SH # kandidat.sh liest DIESELBE gemein.sh (baum_wartende), auch als Abschrift einer Mutante im Sandkasten
# die Front der Runde (front_bauen, liste_datei, zahl): EINE Quelle mit der Radeon, installiert neben diesem Skript, im Zweig in ../dienst
if [ -f "$D/front.sh" ]; then . "$D/front.sh"; else . "$D/../dienst/front.sh"; fi
# runde.cjs und richter.sh: installiert neben diesem Skript, im Zweig in ../dienst (EINE Quelle beim Laptop)
RUNDE_CJS=$D/runde.cjs
[ -f "$RUNDE_CJS" ] || RUNDE_CJS=$D/../dienst/runde.cjs
RICHTER=$D/richter.sh
[ -f "$RICHTER" ] || RICHTER=$D/../dienst/richter.sh
GERAET=gtx
export ZAHL=1 # je Station die rohe Zahl in der Zeile, auch bei UNGEMESSEN (Koordinator 10.11. 13:25)
TAKT_S=30
log() { echo "$(date '+%F %T') $*" >>"$L"; }
halt() { [ -f "$S/landung.halt" ] && { log "HALT (landung.halt, seit $(date -r "$S/landung.halt" '+%F %H:%M')) — die Flagge bleibt"; puls landung "GEHALTEN (landung.halt) — steht, bis die Flagge fällt"; exit 3; }; }
sag() { melde la "$1" >>"$L" 2>&1; }
# DER WARTENDE AN DER BAUM-SPERRE (14.11., Koordinator 23:16): eine Mess-Sitzung nimmt erst den Spiel-Baum, dann die GPU (punkte.cjs
#   `baumSperre`) — sie wartet am BAUM, den der Lauf der Landung hält, und stand nie am GPU-Schloss. punkte.cjs legt, solange ein Lauf
#   am Baum wartet, eine Marke `<wer>-<pid>` in `punkte-gtx.wartet/`; eine Marke jünger als eine Minute, die nicht der Landung oder
#   dem Wächter gehört, ist ein Wartender wie der am GPU-Schloss. Die Regel ist EINE mit der Radeon: gemein.sh `baum_wartende`.
export PUNKTE_WER=landung
BAUM_WARTET=${BAUM_WARTET:-/c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess/.claude/worktrees/punkte-gtx.wartet}
warter_echt() { { schloss_wartende omen punkte- | tr ' ' '\n' | grep -v '^CI-Job'; baum_wartende "$BAUM_WARTET" 'landung|dauer'; } | grep . | tr '\n' ' ' | sed 's/ $//'; }
warter() { warter_echt; }
main_kopf() { git -C "$M" fetch -q origin main 2>/dev/null; git -C "$M" rev-parse origin/main; }
abstand() { local n; n=$(git -C "$M" rev-list --count "$1..origin/main" 2>/dev/null); echo "${n:-?}"; } # Commits des Kopfs hinter main (nur Anzeige)
# darf_beginnen — DIE REIHE DER ANKUNFT (22.11.): will die Runde eine Fahrt beginnen und wartet jemand, merkt sie sich, wer VOR ihr
# wartete ($S/landung.vor, beim ersten Takt ihres Wartens); jeder Takt schneidet diese Menge mit den heute Wartenden (wer ging, ist fort —
# auch wenn er später unter demselben Namen wiederkommt, steht er hinter ihr). Ist die Menge leer, beginnt sie; WT = wer noch vor ihr steht.
darf_beginnen() {
    local jetzt vor
    jetzt=$(warter)
    if [ -f "$S/landung.vor" ]; then vor=$(<"$S/landung.vor"); else vor=$jetzt; fi
    WT=$(printf '%s\n' $vor | grep -xF -f <(printf '%s\n' $jetzt) | grep . | tr '\n' ' ' | sed 's/ $//')
    if [ -z "$WT" ]; then rm -f "$S/landung.vor"; return 0; fi
    echo "$WT" >"$S/landung.vor"
    return 1
}
# gepusht <zeilen vorher> <name> — die STATIONEN, die seit Zeile n gepusht sind (kandidat.sh: „<name>-<k> GEPUSHT (Versuch v) <n> Station(en)“;
# eine Zeile ohne Zahl ist eine Station, wie bis 19.11.)
gepusht() { tail -n +$(($1 + 1)) "$KETTE_LOG" 2>/dev/null | grep -E " $2-[0-9]+ GEPUSHT" | awk '{ if (match($0, /GEPUSHT \(Versuch [0-9]+\) [0-9]+ Station/)) { split(substr($0, RSTART, RLENGTH), a, " "); s += a[4] } else s += 1 } END { print s + 0 }'; }
# station_jetzt — die Station als EIN Wort (runde.txt station): aus der jüngsten Zeile der Kette („… STATION <id> beginnt“, „… STATION <id> geurteilt (k/N)“ —
# kandidat.sh je Station mit Uhr, 19.11. 11:07 — oder die erste der laufenden Sitzung aus „Versuch v START (…)“, + wie viele mit ihr)
station_jetzt() { tail -n +$(($1 + 1)) "$KETTE_LOG" 2>/dev/null | awk '/ Versuch [0-9]+ START [(]/ { s = $0; sub(/.* START [(]/, "", s); sub(/[)]$/, "", s); n = split(s, a, ","); z = a[1] (n > 1 ? "+" (n - 1) : "") } / STATION [^ ]+ beginnt$/ { z = $(NF - 1) } / STATION [^ ]+ geurteilt [(]/ { z = $(NF - 2) } END { print z }'; }
# runde <verb> … — zug/dienst/runde.cjs gegen den Klon $RUNDE_REPO (stdout = die Antwort, stderr ins Log)
runde() { node "$RUNDE_CJS" "$@" 2>>"$L"; }
runde_alarm() { runde alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" >>"$L"; }
# DIE LINSE „DER PUSH SCHEITERT STILL“ (Koordinator 19.11. 04:16; Fund an der Radeon, 58 Commits ungepusht seit 16.11.): Messungen der
# OMEN im Mess-Baum, die der Ursprung nicht trägt (runde.cjs ungepusht), > UNGEPUSHT_FRIST_S = EIN Alarm je Stunde mit Zahl und Uhr
UNGEPUSHT_FRIST_S=${UNGEPUSHT_FRIST_S:-900}
ungepusht_pruefen() {
    local r n seit m=$S/omen.ungepusht.alarm
    r=$(node "$RUNDE_CJS" ungepusht "$PM" punkte-maschine "$GERAET" "$S/omen.ungepusht" 2>>"$L")
    n=${r%% *} UNGEPUSHT_TEXT=
    [ "${n:-0}" -gt 0 ] 2>/dev/null || return 0
    seit=${r#* }
    UNGEPUSHT_TEXT="OMEN: $n Messungen ungepusht seit $(date -d "$seit" +%H:%M)"
    [ $(($(date +%s) - $(date -d "$seit" +%s))) -gt "$UNGEPUSHT_FRIST_S" ] || return 0
    [ -f "$m" ] && [ $(($(date +%s) - $(mzeit "$m"))) -lt 3600 ] && return 0
    touch "$m"
    runde alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" --geraet "$GERAET" --grund "$UNGEPUSHT_TEXT" >>"$L"
}
# push_rot_pruefen [bg] — DER PUSH SCHEITERT LAUT (Koordinator 21.11. 01:10; Fund: die GTX-Runde 2 zählte 1 290 von 1 428 am 31ea3847,
# der Ursprung trug keine Mess-Datei, die Kette schrieb GEPUSHT): kandidat.sh legt bei einem gescheiterten Push $S/omen.push-rot (Zeit,
# Kopf, Sitzung, Grund — KANDIDAT_PUSH_ROT), der nächste gelungene löscht sie. Daraus PUSH_ROT_TEXT für den Puls und EIN Alarm je Stunde
# „PUSH ROT <kopf8> <sitzung> <grund>“ (zug/runde.txt + zug/erledigt.txt). Mit „bg“ schreibt der Alarm im Hintergrund (die Wache an der
# Grenze wartet nie auf ihn), seine PID in PUSH_ROT_PID.
push_rot_pruefen() {
    local m=$S/omen.push-rot.alarm
    PUSH_ROT_TEXT=
    [ -f "$S/omen.push-rot" ] || return 0
    PUSH_ROT_TEXT="PUSH ROT $(head -n 1 "$S/omen.push-rot" | cut -d' ' -f2- | cut -c1-200)"
    [ -f "$m" ] && [ $(($(date +%s) - $(mzeit "$m"))) -lt 3600 ] && return 0
    touch "$m"
    if [ "$1" = bg ]; then
        runde_bg alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" --geraet "$GERAET" --grund "$PUSH_ROT_TEXT" &
        PUSH_ROT_PID=$!
    else runde alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" --geraet "$GERAET" --grund "$PUSH_ROT_TEXT" >>"$L"; fi
}
# runde_bg — für die Schreiber im HINTERGRUND: eine EIGENE Datei. node (ein Windows-Prozess) schreibt nicht mit O_APPEND wie MSYS —
# zwei Schreiber in derselben Log-Datei überschrieben im Selbsttest Zeilen des Dienstes (die Radeon verlor so ihre WEICHT-Zeilen)
runde_bg() { node "$RUNDE_CJS" "$@" >>"$L.runde" 2>&1; }
# DIE RUNDE SPRANG (4a; Befund 22.11. seit 18:27: jedes `stand … laeuft` der Fahrt am 6066c757 antwortete „ANDERE RUNDE“, Exit 4 — der
# Koordinator hatte die Runde auf main gehoben —, und die Liste fuhr am alten Kopf weiter, bis landung.halt sie um 19:31 beendete).
# sprang <antwort-datei> <alter-kopf> <was> — die Zeile mit dem neuen Kopf aus der Antwort von runde.cjs („ANDERE RUNDE <n> <kopf>“)
sprang() { log "RUNDE SPRANG auf $(grep "^ANDERE RUNDE" "$1" 2>/dev/null | tail -n 1 | awk '{ print substr($4, 1, 8) }'): stand am ${2:0:8} antwortet ANDERE RUNDE (Exit 4) — $3"; }
# runde_blick <kopf> — der Blick OHNE Schreiben (runde.cjs lies, nur fetch) für die lange Station: `stand` fragt nur nach einem Push;
# hob der Koordinator die Runde, NACHDEM der Stand der letzten Station gefragt hatte, sah es bis zur nächsten Buchung keiner (Selbsttest
# 22.11. 22:28, Fall y unter Last: 7 statt 2 Stationen am alten Kopf). Trägt die Runde einen anderen Kopf, antwortet er wie stand
# („ANDERE RUNDE <n> <kopf>“ nach $L.runde, Exit 4); scheitert der Blick, sagt er nichts — die nächste Buchung fragt ohnehin.
runde_blick() {
    local z
    z=$(node "$RUNDE_CJS" lies "$RUNDE_REPO" "$GERAET" 2>>"$L.runde") || return 0
    [ "$(echo "$z" | awk '{ print $2 }')" = "$1" ] && return 0
    echo "ANDERE RUNDE $(echo "$z" | awk '{ print $1, $2 }')" >>"$L.runde"
    return 4
}
# stand_ernten [warte] — der Stand im Hintergrund (PROG_PID, in liste_fahren) nach seinem Ende: Exit 4 legt die Grenz-Flagge, der Grund
# heißt sprung (bleibt bis zum Ende der Fahrt, nur ein Halt geht vor); `warte` wartet auf ihn (das Ende der Fahrt)
stand_ernten() {
    local rc
    [ -n "$PROG_PID" ] || return 0
    [ "$1" = warte ] || ! kill -0 "$PROG_PID" 2>/dev/null || return 0
    wait "$PROG_PID" 2>/dev/null
    rc=$?
    PROG_PID=
    [ $rc = 4 ] || return 0
    sprang "$L.runde" "$K" "die Liste endet an der nächsten Stations-Grenze, der nächste Takt liest die neue Runde"
    [ "$grund" = halt ] || grund=sprung
    touch "$GRENZE"
}
# DIE FRONT DER RUNDE (24.11.): karte2_nur · liste_quelle · ohne_band · anspruch_datei · karte_datei · liste_datei · zahl und die Kette
# front_bauen stehen in zug/dienst/front.sh (oben gesourct) — EINE Quelle mit der Radeon, die damit die Front der GTX selbst baut, solange
# diese am Kopf noch keine Liste trägt. Die Liste reist als Datei (liste_datei), ohne Tafel gilt gtx-nutzen.
pm_stand() { node "$N/pm-stand.cjs" "$PM" >>"$L" 2>&1; } # der Stand von punkte-maschine; eine jüngere Messung im Baum überlebt
# offen_am <kopf> <liste> → was an diesem Kopf noch keinen Eintrag trägt, in der Mess-Datei des BAUMS (pm-stand.cjs: eine jüngere Messung
# im Baum überlebt) — so zählt nach einem Tod mitten in einer Sitzung, was sie schon fertig maß; es reist mit dem nächsten Push.
# DIE GETEILTE FRONT (22.11.): und ohne ROT der Radeon am selben Kopf (--anders radeon). Ihre Mess-Datei liest offen im selben Baum:
# pm-stand.cjs stellt ihn je Takt (pm_stand vor der Liste und nach jeder Fahrt) und zu Beginn jeder Sitzung (punkte-offen.cjs) auf
# origin/punkte-maschine — der fetch, den der Dienst ohnehin macht; je Station kein Netz-Gang und kein git-Prozess mehr
offen_am() { runde offen "$PM" - "$GERAET" "$1" "$(liste_datei offen "$2")" --anders radeon; }
# DIE TEILE DER RUNDE (Koordinator 19.11. 03:30): Stationen EINER Linse in EINER Sitzung. eichtafel_lesen schreibt die Lauf-Tafel der
# Maschine (punkte.cjs eichtafel: je Lauf seine Stationen und sein Deckel), teile_von packt den Rest der Liste in ihrer Reihe zu Sitzungen
# je Σ Deckel ≤ TEIL_BUDGET_S (FAHRT_MAX_S 1 800 − Boot 60 = 1 740 s, die Teil-Größe der Maschine selbst; runde.cjs teile)
TEIL_BUDGET_S=${TEIL_BUDGET_S:-1740}
eichtafel_lesen() { (cd "$PM/meisterkarte-quelle/punkte" && timeout 900 node punkte.cjs eichtafel --geraet "$GERAET" >"$EICHTAFEL" 2>>"$L"); }
teile_von() { runde teile "$EICHTAFEL" "$(liste_datei teile "$1")" "$TEIL_BUDGET_S"; }
# liste_rot <grund> — STILLES SCHEITERN IST ROT (19.11.): Quelle > 0 und Liste 0, oder ein node der Listen-Kette mit Exit ≠ 0 — die Zeile
# der Runde bleibt unberührt (nie `laeuft 0/0`, nie „durch“), EIN Alarm je Stunde in zug/runde.txt + zug/erledigt.txt, der Puls nennt es
liste_rot() {
    local m=$S/liste-rot.alarm
    log "LISTE ROT: $1"
    puls landung "LISTE ROT: $1 — keine Fahrt"
    [ -f "$m" ] && [ $(($(date +%s) - $(mzeit "$m"))) -lt 3600 ] && return 0
    touch "$m"
    runde alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" --geraet "$GERAET" --grund "LISTE ROT: $1" >>"$L"
}
# grenze_pruefen — je Takt der Fahrt: die Grenz-Flagge (kandidat.sh SPRUNG, gelesen an JEDER Stations-Grenze der Sitzung) legt nur der
# HALT (er bleibt bis zum Ende der Fahrt). Ein Wartender am Schloss oder an der Baum-Sperre legt sie NIE (die Reihe der Ankunft, 22.11.:
# er wartet hinter der Fahrt; den Sprung legt stand_ernten, den getragenen Schwanz die Schleife).
grenze_pruefen() {
    [ "$grund" = halt ] && return 0
    [ -f "$S/landung.halt" ] || return 0
    grund=halt
    touch "$GRENZE"
    log "HALT: landung.halt liegt — die Liste endet an der nächsten Stations-Grenze und setzt dort wieder an"
}
# liste_fahren <K> <NAME> <REST> <r> <BASIS> <GESAMT> — EINE Fahrt über kandidat.sh, je Station eine Sitzung, je gepushte Station der
# Stand in zug/runde.txt; 0 durch · 3 GEHALTEN (landung.halt; BEHALTEN = gepushte Stationen) · 5 DIE RUNDE SPRANG (stand_ernten: der
# Stand antwortete Exit 4).
# Eine Landung ändert hier nichts: die Liste fährt am Kopf der Runde zu Ende (DAS GESETZ DER RUNDE) — nur die Fahrt über den Schwanz
# (SCHWANZ_FAHRT) endet an der nächsten Grenze, sobald main weiter ist (grund getragen, Rückgabe 0: der Rest trägt).
liste_fahren() {
    local K=$1 NAME=$2 REST=$3 r=$4 BASIS=$5 GESAMT=$6 kp t l0 b fb=0 grund= sj sv= TEILE
    GRENZE=${S:?}/landung.grenze
    rm -f "$GRENZE"
    BEHALTEN=0 PROG_PID= ALARM_PID=
    l0=$(wc -l <"$KETTE_LOG" 2>/dev/null || echo 0)
    TEILE=$(teile_von "$REST")
    [ -n "$TEILE" ] || { liste_rot "runde.cjs teile gab für $r Stationen keine Sitzung (Exit $?)"; return 4; }
    log "Runde $RN ${K:0:8}: $r Stationen in $(echo "$TEILE" | tr ';' '\n' | grep -c .) Sitzungen (je Linse EINE, Σ Deckel ≤ $TEIL_BUDGET_S s)"
    KOPF=$K SPRUNG=$GRENZE RUNDE_CJS=$RUNDE_CJS KANDIDAT_PUSH_ROT=$S/omen.push-rot bash "$KANDIDAT" "$NAME" x "$(liste_datei "kandidat-$NAME" "$TEILE")" >>"$L" 2>&1 &
    kp=$!
    t=0
    while kill -0 $kp 2>/dev/null; do
        puls landung "${PUSH_ROT_TEXT:+$PUSH_ROT_TEXT · }Runde $RN misst ${K:0:8} ($((BASIS + fb))/$GESAMT, C: $(frei_gb) GB frei, Abstand zu main $(abstand "$K")): $(tail -n 1 "$KETTE_LOG" 2>/dev/null | cut -c1-150)"
        sleep $TAKT_S
        t=$((t + 1))
        b=$(gepusht "$l0" "$NAME")
        # der Stand je Station und der Alarm im Hintergrund, je EIN Schreiber zugleich: ein Push braucht Sekunden, die Wache an der
        # Grenze (Halt, Macher) darf nie auf ihn warten
        sj=$(station_jetzt "$l0")
        if [ -n "$sj" ] && [ "$sj" != "$sv" ]; then sv=$sj; vor_station "$sj"; fi
        stand_ernten
        # nach dem Sprung kein Stand mehr am alten Kopf (jeder antwortete Exit 4 und sagte „RUNDE SPRANG“ noch einmal); zwischen den
        # Buchungen je vierten Takt der Blick ohne Schreiben (runde_blick)
        if [ "$grund" != sprung ] && ! kill -0 "${PROG_PID:-999999}" 2>/dev/null; then
            if [ "$b" -gt "$fb" ]; then
                fb=$b
                runde_bg stand "$RUNDE_REPO" "$GERAET" "$K" laeuft --erledigt $((BASIS + b)) --gesamt "$GESAMT" --station "$(station_jetzt "$l0")" &
                PROG_PID=$!
            elif [ $((t % 4)) = 2 ]; then
                runde_blick "$K" &
                PROG_PID=$!
            fi
        fi
        if [ $((t % 4)) = 0 ] && ! kill -0 "${ALARM_PID:-999999}" 2>/dev/null; then runde_bg alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" & ALARM_PID=$!; fi
        # der gescheiterte Push der Sitzung (kandidat.sh legt $S/omen.push-rot): im Puls jeden Takt, als Alarm einmal je Stunde
        if ! kill -0 "${ALARM_PID:-999999}" 2>/dev/null; then
            PUSH_ROT_PID=
            push_rot_pruefen bg
            [ -n "$PUSH_ROT_PID" ] && ALARM_PID=$PUSH_ROT_PID
        fi
        grenze_pruefen
        # DER SCHWANZ TRÄGT, SOBALD main WEITER IST (21.11.): je vierten Takt; die Flagge endet die Fahrt an der nächsten Stations-Grenze
        if [ -n "$SCHWANZ_FAHRT" ] && [ -z "$grund" ] && [ $((t % 4)) = 0 ] && main_weiter; then
            grund=getragen
            touch "$GRENZE"
            log "MAIN WEITER (${K:0:8} → $(main_kopf | cut -c1-8)): der Schwanz trägt — die Fahrt endet an der nächsten Stations-Grenze"
        fi
    done
    wait $kp
    stand_ernten warte # der letzte Stand der Fahrt: sprang die Runde während ihrer letzten Station, sagt er es hier
    wait ${ALARM_PID:-} 2>/dev/null # die Schreiber im Hintergrund zuerst: der Stand danach ist der letzte
    rm -f "$GRENZE"
    BEHALTEN=$(gepusht "$l0" "$NAME")
    case "$grund" in
        halt) return 3 ;;
        sprung) return 5 ;;
    esac
    return 0
}
summe() { echo "$3" >"$ST/liste-$2.txt"; ZEILE_NAME="gpu-stufe $2" ZEILE_DIR=$ST node "$N/zeile-da0e.cjs" "$1" "$ST/liste-$2.txt" >>"$L" 2>&1; }
# richte_runde <kopf> <vorher|-> <liste> — 3 DER RICHTER DER RUNDE: nur die Stationen mit frischem ROT (GRÜN am vorigen Mess-Kopf, ROT
# an diesem) werden über die Köpfe dazwischen halbiert; ohne vorigen Mess-Kopf (erste Runde) richtet richter.sh --kopf gegen die Buchung
richte_runde() {
    local K=$1 V=$2 s rp f
    if [ "$V" = - ]; then
        log "RICHTER Runde $RN: kein voriger Mess-Kopf — richter.sh --kopf ${K:0:8} gegen die letzte Buchung"
        bash "$RICHTER" "$GERAET" --kopf "$K" >>"$L" 2>&1 &
    else
        f=$(runde faelle "$RUNDE_REPO" "$GERAET" "$V" "$K" "$(liste_datei faelle "$3")" | tr '\n' ' ')
        log "RICHTER Runde $RN: frisches ROT ${V:0:8} -> ${K:0:8}: ${f:-keins}"
        [ -n "$f" ] || return 0
        (for s in $f; do bash "$RICHTER" "$GERAET" --fall "$s" "$V" "$K"; done) >>"$L" 2>&1 &
    fi
    rp=$!
    while kill -0 $rp 2>/dev/null; do
        puls landung "Richter Runde $RN am ${K:0:8}: $(tail -n 1 "${RICHTER_ZUSTAND:-$S/richter}/richter.log" 2>/dev/null | cut -c21-170)"
        sleep "$TAKT_S"
    done
    wait $rp
}
# platte_zu — unter $PLATTE_UNTEN GB frei beginnt keine Station; das ist ein ALARM der Runde mit Zahl (runde.cjs alarm --grund), nie still
platte_zu() {
    local f
    f=$(frei_gb)
    kleiner "$f" "$PLATTE_UNTEN" || return 1
    puls landung "wartet: C: $f GB frei < $PLATTE_UNTEN GB — keine Messung, Löschen entscheidet der Schöpfer"
    platte_alarm "$f" "$PLATTE_UNTEN" "keine Station beginnt, Löschen entscheidet der Schöpfer"
    return 0
}
# platte_alarm <gb> <schwelle> <text> — EIN Alarm der Runde je Schwelle und Stunde (zustand/platte-<schwelle>.alarm)
PLATTE_WARN=${PLATTE_WARN:-15}
platte_alarm() {
    local m=$S/platte-$2.alarm
    [ -f "$m" ] && [ $(($(date +%s) - $(mzeit "$m"))) -lt 3600 ] && return 0
    touch "$m"
    runde alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" --geraet "$GERAET" --grund "PLATTE $1 GB frei (< $2 GB) — $3" >>"$L"
}
# vor_station — 4 (Koordinator 02:42): VOR jeder Station der freie Platz als Zahl in der Fahrt-Zeile; unter PLATTE_WARN (15) GB ein
# ALARM an den Koordinator, BEVOR die Platten-Wache bei PLATTE_UNTEN (10) hält
vor_station() {
    local f
    f=$(frei_gb)
    log "Station $1 beginnt · C: $f GB frei"
    kleiner "$f" "$PLATTE_WARN" && platte_alarm "$f" "$PLATTE_WARN" "Warnung: die Platten-Wache hält bei $PLATTE_UNTEN GB, Station $1"
    return 0
}
# runde_takt — EIN Blick der Schleife: die Runde lesen (beim ersten Mal aus dem Bestand anlegen), die eigene Liste am Kopf der Runde
# fahren oder fortsetzen, nach ihr der Richter und „durch“; ist die OMEN durch, auf das andere Gerät warten (Alarm, nie still)
runde_takt() {
    local RL B a n r rs GESAMT REST VREST SREST SCHW GETRAGEN RG
    RL=$(runde lies "$RUNDE_REPO" "$GERAET" --voll)
    if [ -z "$RL" ]; then
        puls landung "zug/runde.txt nicht lesbar (fetch koordination?) — nächster Takt"
        return
    fi
    if [ "$RL" = - ]; then # DIE ERSTE RUNDE AUS DEM BESTAND: der jüngste Kopf der main-Linie, an dem die OMEN schon misst
        B=$(runde bestand "$RUNDE_REPO" "$GERAET") || B=$(main_kopf)
        runde anlegen "$RUNDE_REPO" "$B" >>"$L"
        log "RUNDE aus dem Bestand angelegt: Kopf ${B:0:8} (seine Mess-Datei zählt mit)"
        return
    fi
    read -r RN RK RV RZ RLISTE RG <<<"$RL"
    runde_alarm
    ungepusht_pruefen
    push_rot_pruefen
    # DER LISTEN-BRUCH VON 05:53 (Live 06:17: „gtx durch 0/0 am f68dbf09“ gebucht): steht die eigene Zeile „durch“ ohne Station, war es nie
    # eine Messung — zurück auf offen (Notiz in zug/runde.txt), der Neubau folgt in diesem Takt
    if [ "$RZ" = durch ] && [ "$(zahl "$RLISTE")" = 0 ]; then
        runde zurueck "$RUNDE_REPO" "$GERAET" "$RK" "durch 0/0 war ein Listen-Bruch (die Liste reiste als Argument), zurück auf offen" >>"$L"
        log "Runde $RN am ${RK:0:8}: die Zeile stand durch 0/0 ohne Liste — zurück auf offen, die Liste wird neu gebaut"
        RZ=offen RLISTE=-
    fi
    if [ "$RZ" = durch ]; then
        puls landung "${PUSH_ROT_TEXT:+$PUSH_ROT_TEXT · }${UNGEPUSHT_TEXT:+$UNGEPUSHT_TEXT · }Runde $RN am ${RK:0:8}: die OMEN ist durch — $(runde weiter "$RUNDE_REPO" "$(main_kopf)")"
        return
    fi
    if ! darf_beginnen; then
        puls landung "steht an: vor ihr wartet $WT (kam vor ihr, die Reihe der Ankunft) — Runde $RN am ${RK:0:8}, $RZ"
        return
    fi
    pm_stand
    # der Eintritt in die Runde: die Liste wird gebaut und EINGEFROREN — auch, wenn die Zeile eine Liste OHNE Station trägt (`liste |`,
    # der Live-Gang 19.11. 05:52): der erste Takt nach dem Schnitt baut sie selbst neu, die Runde muss nicht neu angelegt werden
    if [ "$RLISTE" = - ] || [ "$(zahl "$RLISTE")" = 0 ]; then
        local ra
        # die Kette Quelle → ohne /band → Reihe: front_bauen (zug/dienst/front.sh), dieselbe, mit der die Radeon die Front selbst baut
        front_bauen "$GERAET" "$MESSUNG_DIR" "$RK" || { liste_rot "Runde $RN am ${RK:0:8}: $FRONT_TEXT"; return; }
        RLISTE=$FRONT
        log "Runde $RN am ${RK:0:8} (Abstand zu main $(abstand "$RK")): $QUELLE $FRONT_QUELLE_N, ohne /band $FRONT_BAND_N — die Liste (vorn K1–K3 | Schwanz K4–K6): $(zahl "${RLISTE%%|*}") | $(zahl "${RLISTE#*|}") Stationen ($(grep "^Reihe $GERAET: " "$L" | tail -n 1 | cut -c1-160); zustand/listen/runde.txt)"
        runde stand "$RUNDE_REPO" "$GERAET" "$RK" laeuft --liste "$(liste_datei runde "$RLISTE")" --gesamt "$(zahl "$RLISTE")" --erledigt 0 --getragen 0 >>"$L" ||
            { ra=$?; [ $ra = 4 ] && { sprang "$L" "$RK" "die Liste wird nicht am alten Kopf eingefroren, der nächste Takt baut sie am neuen"; return; }
              liste_rot "runde.cjs stand schrieb die Liste nicht (Exit $ra)"; return; }
        RG=0
    fi
    GESAMT=$(zahl "$RLISTE")
    # DER SCHWANZ TRÄGT (Koordinator 21.11.; Befund Runde 2 am 31ea3847: 8,0 h für 521 ROT „Umfang nicht erzeugbar“, 0,7 h für 132 ROT
    # „Leser fehlt“ — die Fähigkeit fehlt, das Urteil hängt nicht am Gerät). Die Liste heißt „<K1–K3>|<Schwanz K4 K5 K6>“ (runde.cjs reihe);
    # vorn und Schwanz fahren in GETRENNTEN Fahrten (kein Teil mischt beide), vorn zuerst. Bleibt nur der Schwanz und ist main weiter als
    # der Runden-Kopf, ist die OMEN durch: das rote Urteil des Schwanzes vom früheren Kopf steht (aus ROT bucht nichts), die Zahl steht als
    # „getragen“ in der Zeile. Ist main nicht weiter, misst sie den Schwanz (nie leer) — und endet an der nächsten Stations-Grenze, sobald
    # main weiterzieht. Eine Zeile von vor dem 21.11. (RG „-“: <ungebucht>|<gebucht grün>) kennt keinen Schwanz und fährt wie bisher.
    SCHW=
    if [ "${RG:--}" != - ]; then case "$RLISTE" in *"|"*) SCHW=${RLISTE#*|} ;; esac; fi
    GETRAGEN=0
    REST=$(offen_am "$RK" "$RLISTE") || { liste_rot "runde.cjs offen am ${RK:0:8} scheiterte (Exit $?)"; return; }
    VREST=$(teil_von "$REST" "$SCHW" vorn)
    if [ -n "$VREST" ]; then
        fahre_teil "$VREST" "$(zahl "$REST")" vorn || return
        REST=$(offen_am "$RK" "$RLISTE") || { liste_rot "runde.cjs offen nach der Fahrt am ${RK:0:8} scheiterte (Exit $?)"; return; }
    fi
    SREST=$(teil_von "$REST" "$SCHW" schwanz)
    if [ -n "$SREST" ] && main_weiter; then
        GETRAGEN=$(zahl "$SREST")
    elif [ -n "$SREST" ]; then
        SCHWANZ_FAHRT=1
        fahre_teil "$SREST" "$(zahl "$REST")" schwanz
        rs=$?
        SCHWANZ_FAHRT=
        [ $rs = 0 ] || return
        REST=$(offen_am "$RK" "$RLISTE") || { liste_rot "runde.cjs offen nach der Fahrt am ${RK:0:8} scheiterte (Exit $?)"; return; }
        SREST=$(teil_von "$REST" "$SCHW" schwanz)
        [ -n "$SREST" ] && main_weiter && GETRAGEN=$(zahl "$SREST")
    fi
    [ "$GETRAGEN" != 0 ] && log "Runde $RN am ${RK:0:8}: main ist weiter — der Schwanz TRÄGT: $GETRAGEN Station(en) behalten ihr ROT vom früheren Kopf (K5 Leser fehlt · K6 Umfang nicht erzeugbar), keine Fahrt"
    [ -n "$REST" ] && [ "$(zahl "$REST")" != "$GETRAGEN" ] && log "Runde $RN am ${RK:0:8}: die Liste ist gefahren, ohne Eintrag blieben $(($(zahl "$REST") - GETRAGEN)) (kandidat.sh OFFEN nach 4 Versuchen): ${REST:0:400}"
    # nie ein Null-Bericht (Live 06:17: „0 grün / 0 rot / 0 ungemessen“ ging hinaus) und nie „durch“ ohne Station: LISTE ROT davor
    if [ "$GESAMT" = 0 ]; then liste_rot "Runde $RN am ${RK:0:8}: die Liste trägt 0 Stationen — kein Bericht, kein durch"; return; fi
    summe "$RK" "gtx-${RK:0:8}" "${RLISTE/|/,}"
    richte_runde "$RK" "$RV" "$RLISTE"
    sag "landung Runde $RN am ${RK:0:8}: die OMEN ist durch ($GESAMT Stationen$([ "$GETRAGEN" != 0 ] && echo ", $GETRAGEN getragen")) — $(runde durch "$RUNDE_REPO" "$GERAET" "$RK" "$(main_kopf)" --erledigt $((GESAMT - $(zahl "$REST"))) $([ "${RG:--}" != - ] && echo --getragen "$GETRAGEN"))"
}
# teil_von <liste> <schwanz> <vorn|schwanz> — die Stationen der Liste vor dem Schwanz oder in ihm, in ihrer Reihe (über Dateien: kein argv)
teil_von() {
    mkdir -p "${S:?}/listen"
    printf '%s\n' "$2" | tr ',|' '\n\n' >"$S/listen/schwanz-menge.txt"
    printf '%s\n' "$1" | tr ',|' '\n\n' | awk -v w="$3" 'NR == FNR { if ($0 != "") s[$0] = 1; next } $0 != "" && ((w == "schwanz") == ($0 in s))' "$S/listen/schwanz-menge.txt" - | paste -sd, -
}
main_weiter() { local m; m=$(main_kopf); [ -n "$m" ] && [ "$m" != "$RK" ]; }
# fahre_teil <rest> <offen gesamt> <vorn|schwanz> — EINE Fahrt über einen Teil der Liste (je Linse EINE Sitzung); 0 gefahren, 1 die Runde
# endet in diesem Takt (HALT, SPRUNG oder LISTE ROT — der Stand steht in zug/runde.txt)
fahre_teil() {
    local REST=$1 r NAME B=$(($GESAMT - $2))
    r=$(zahl "$REST")
    NAME=gtx-${RK:0:8}
    [ "$2" != "$GESAMT" ] && NAME=$NAME-w$(date +%H%M%S) # fortgesetzt: eigener Name, damit keine Zeile doppelt heißt
    [ "$3" = schwanz ] && NAME=$NAME-s
    runde stand "$RUNDE_REPO" "$GERAET" "$RK" laeuft --erledigt "$B" --gesamt "$GESAMT" >>"$L"
    [ $? = 4 ] && { sprang "$L" "$RK" "keine Fahrt am alten Kopf, der nächste Takt liest die neue Runde"; return 1; }
    eichtafel_lesen
    sag "landung Runde $RN am ${RK:0:8}: misst $r von $GESAMT Stationen ($([ "$3" = schwanz ] && echo "den Schwanz — main ist nicht weiter" || echo "$3"); $B tragen an diesem Kopf schon einen Eintrag), rohe Zahl je Zeile"
    liste_fahren "$RK" "$NAME" "$REST" "$r" "$B" "$GESAMT"
    case $? in
        3) runde stand "$RUNDE_REPO" "$GERAET" "$RK" halt --erledigt $((B + BEHALTEN)) >>"$L"
           return 1 ;;
        4) return 1 ;; # LISTE ROT (liste_rot hat es beim Namen gemeldet)
        5) return 1 ;; # DIE RUNDE SPRANG (stand_ernten hat es beim Namen gesagt): kein Stand am alten Kopf, der nächste Takt liest die neue
    esac
    pm_stand
    return 0
}

# ── DER SELBSTTEST (trocken, ohne GPU): ein Sandkasten mit eigenem origin (main · koordination · punkte-maschine) und Klon, ein
# Stummel-kandidat.sh (je Station 0,4 s, prüft die Grenz-Flagge vor jeder Station, schreibt „<kopf>:<station>“ als gepusht und die Zeilen
# START/GEPUSHT wie kandidat.sh), der Warter als Datei. runde.cjs, richter.sh (Schein-Messung RICHTER_SCHEIN_ROT_AB) und
# richter-werk.cjs laufen ECHT gegen den Sandkasten. Die Fälle des Gesetzes:
# a  eine Landung nach Station 2 bricht die Runde NICHT ab: 8 von 8 am Kopf der Runde; die nächste Runde nimmt den main des Moments,
#    in dem beide durch sind (vorher = der alte Kopf)
# b  Halt nach Station 3 → Ende an der Grenze, Stand „halt 3/8“; ohne Flagge geht es an Station 4 weiter, keine doppelt. DIE REIHE DER
#    ANKUNFT (22.11.): wartet einer, als die Runde ankommt, steht sie an (keine Fahrt); ist er fort und wartet nur, wer nach ihr kam,
#    fährt sie — ein Macher am Schloss nach Station 2 legt keine Flagge, die Fahrt misst 8 von 8. Mutanten dazu: weicht · hinten-an · blind
# c  Neustart: der Dienst stirbt in Station 4 (kein Push); ein neuer Prozess ohne Gedächtnis setzt an Station 4 fort
# d  frisches ROT: s1 GRÜN am vorigen, ROT am jetzigen Mess-Kopf → NUR s1 wird über die Köpfe dazwischen halbiert, der Täter-Kopf
#    steht in zug/richter.txt; s2 (GRÜN → GRÜN) und s3 (nie GRÜN) nicht
# e  die Reihe der Klassen: K1 beansprucht · K2 ohne Urteil · K3 GRÜN · K4 ROT | Schwanz K5 Leser fehlt · K6 Umfang, aus dem jüngsten Urteil
# w  der Schwanz trägt nur, wenn main weiter ist; zieht main während der Schwanz-Fahrt weiter, endet sie an der Grenze. Mutanten dazu:
#    klassen-blind · schwanz-immer · schwanz-nie
# f  ein Gerät ohne Fortschritt > 15 min: EINE Alarm-Zeile mit Namen, nicht doppelt; unter 15 min keine
# g  die Baum-Sperre (14.11.) · h  die Karte 2 (karte2_nur) · i  halt() lässt die Flagge liegen
# k  je Linse EINE Sitzung (runde.cjs teile), nie je Station eine · l  BEHALTEN je Station: das echte kandidat.sh, eine Sitzung fällt nach
#    2 von 4 — die 2 sind gepusht, nur der Rest fährt neu
# n  die ECHTE Tafel des koordination-Kopfs durch die ganze Kette (kein argv über 30 000 Zeichen, Liste ≥ Quelle − gebucht) ·
#    o  bricht die Listen-Kette, ist es EIN Alarm „LISTE ROT“, die Zeile bleibt · p  „laeuft 0/0 … liste |“ baut sich im ersten Takt neu,
#    mit Notiz in zug/runde.txt. Mutanten dazu: liste-als-argument · leere-liste-laeuft
# r  Grenze und Buchung je STATION in der Sitzung (das echte kandidat.sh): gepusht, während die Sitzung misst; die Flagge beendet sie an
#    der nächsten Stations-Grenze, nie erst nach der Sitzung · s  der Wartende kommt und geht → keine Flagge, kein WEICHT, der Zähler
#    steigt, der Puls nennt ihn nie · t  der Deckel der Sitzung (Uhr, KANDIDAT_DECKEL_S) schneidet an der Grenze, je Station eine Zeile mit Uhr.
#    Mutanten dazu: bucht-am-ende · weicht · deckel-blind · station-stumm
# u  der Push scheitert laut (das echte kandidat.sh, Push über den EINEN Schreiber runde.cjs push-pfade): scheitert er, steht keine
#    GEPUSHT-Zeile, sondern „PUSH ROT <kopf8>: <grund>“, omen.push-rot trägt den Grund, EIN Alarm je Stunde; der nächste gelungene zählt
#    die Stationen der gescheiterten mit. Mutante dazu: push-still
# j  die Platte unter PLATTE_UNTEN: EIN Alarm mit GB, Station und Kopf (Koordinator 19.11. 02:35), nicht doppelt
# y  die Runde springt während der Liste (runde.cjs sprung des Koordinators), nachdem der Stand der Station gefragt hat: der Blick ohne
#    Schreiben (runde_blick) sieht es, Ende an der nächsten Grenze, EINMAL „RUNDE SPRANG auf <kopf8>“, der nächste Takt misst am neuen
#    Kopf. Mutanten dazu: sprung-blind · blick-blind
# z  K1 in der Reihe der Landungen (23.11.): die jüngste Anspruchs-Zeile zuerst, in der Zeile ihre Reihe, „am längsten nicht gemessen“ nur
#    bei Gleichstand. Mutante dazu: zeile-blind · z2  eine beanspruchte Sprosse, die die Karte schon als Punkt trägt, steht nirgends in
#    der Liste (die Front ist die eine Stelle). Mutante dazu: gebucht-zieht
# Mutanten (je eine Regel alt): sprung (der Kopf ist der jüngste main, wie bis 19.11.) · von-vorn (Fortsetzung blind: die ganze Liste) ·
#    volle-liste (der Richter nimmt jede Station der Liste) · tafel-reihe (die Reihe der Tafel) · still (kein Alarm) · blind (kein Warter: die Runde fährt vor dem, der vor ihr kam) ·
#    halt-rm (halt() löscht die Flagge) · nur-schloss · tafel-blind · tafel-alle — alle ROT.
# nur <fall> — das Tor je Fall: ST_NUR=<fall,fall> fährt nur diese (der Sandkasten und die Attrappen immer; „a“ trägt k, „l“ trägt m);
# je gefahrenem Fall eine Zeile „ZEIT <fall> <s> s“. Die Runden-Fälle bauen aufeinander (a b c f · n o p q · s w): allein urteilen nur
# die ohne Vorgänger (d e g h i j l r t u x y z z2). `nur -` schließt die letzte Zeit.
nur() {
    [ -n "$ST_ZF" ] && echo "ZEIT $ST_ZF $((SECONDS - ST_ZT)) s"
    ST_ZF= ST_ZT=$SECONDS
    [ "$1" = - ] && return 1
    [ -z "$ST_NUR" ] || case ",$ST_NUR," in *",$1,"*) ;; *) return 1 ;; esac
    ST_ZF=$1
}
st_lauf() { # $1 = Mutante (leer = echt)
    local X n o k0 k1 k2 k2b j e1 e2 f1 f2 f3 z w v t0 w1 w2
    X=$(mktemp -d)
    S=$X/s L=$X/landung.log KETTE_LOG=$X/kette.log KANDIDAT=$X/kandidat.sh TAKT_S=0.05 MESSUNG_DIR=$X/messung
    RUNDE_REPO=$X/klon RICHTER_REPO=$X/klon RICHTER_ZUSTAND=$X/richter RICHTER_PM=$X/klon
    export RICHTER_REPO RICHTER_ZUSTAND RICHTER_PM
    export RICHTER_SCHEIN_ROT_AB=nie # NIE eine echte Messung im Sandkasten: der Richter urteilt nur über die Schein-Messung (d setzt den Täter)
    mkdir -p "$S" "$MESSUNG_DIR"
    : >"$KETTE_LOG"
    # der Sandkasten: origin mit main (k0 … k2, sechs Commits), koordination (zug/erledigt.txt) und punkte-maschine; der Klon kennt ihn
    local A0="-c user.name=t -c user.email=t@t -c core.autocrlf=false"
    git init -q --bare "$X/o.git"
    git init -q -b main "$X/klon" && git -C "$X/klon" remote add origin "$X/o.git"
    for j in 0 1 2 3 4 5; do git -C "$X/klon" $A0 commit -q --allow-empty -m "main $j"; done
    k0=$(git -C "$X/klon" rev-parse HEAD~5) k1=$(git -C "$X/klon" rev-parse HEAD~2) k2b=$(git -C "$X/klon" rev-parse HEAD~1) k2=$(git -C "$X/klon" rev-parse HEAD)
    git -C "$X/klon" push -q origin main
    git init -q -b koordination "$X/k" && mkdir -p "$X/k/zug" && echo "# erledigt" >"$X/k/zug/erledigt.txt" &&
        git -C "$X/k" add zug && git -C "$X/k" $A0 commit -qm koord && git -C "$X/k" push -q "$X/o.git" koordination
    git init -q -b punkte-maschine "$X/p" && git -C "$X/p" $A0 commit -q --allow-empty -m pm && git -C "$X/p" push -q "$X/o.git" punkte-maschine
    echo "$k0" >"$X/main"
    echo "$k2" >"$X/kopf2"
    cat >"$KANDIDAT" <<'STUMMEL'
#!/bin/bash
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# kandidat.sh-Stummel: $1 Name, $3 die Teile („;“), KOPF; die Grenz-Flagge vor jeder STATION (wie kandidat.sh seit 19.11.: Grenze je
# Station in der Sitzung), je Station 0,4 s; jede geurteilte Station ist sofort gebucht (im „Baum“ gepusht, eine GEPUSHT-Zeile je Station).
# warter_kommt=<i>: in Station i kommt ein Wartender und geht wieder (je 8 s: lang genug für einen Takt unter Last), bevor die Station endet
X=$(dirname "$0"); i=0; t=0
LL=$3; [ "${LL#@}" != "$LL" ] && LL=$(<"${LL#@}") # die Liste reist als Datei, wie an kandidat.sh
IFS=';' read -ra TT <<<"$LL"
for T in "${TT[@]}"; do
    t=$((t + 1))
    echo "$(date +%T) ${KOPF:0:8} $1-$t Versuch 1 START ($T)" >>"$X/kette.log"
    [ -f "$X/nur_erste" ] && { touch "$X/s/landung.halt"; echo "$(date +%T) $1-$t GEPUSHT (Versuch 1) 0 Station(en)" >>"$X/kette.log"; break; } # der große Fall: bis zur ersten Sitzung
    for s in ${T//,/ }; do
        [ -n "$SPRUNG" ] && [ -f "$SPRUNG" ] && { echo "$(date +%T) $1 SPRUNG an der Stations-Grenze vor $s (Teil $t)" >>"$X/kette.log"; exit 0; }
        i=$((i + 1))
        [ -f "$X/tod_in" ] && [ "$(cat "$X/tod_in")" = "$i" ] && { rm -f "$X/tod_in"; sleep 2; kill -9 $PPID; exit 9; }
        [ -f "$X/warter_kommt" ] && [ "$(cat "$X/warter_kommt")" = "$i" ] && { echo macher-kommt-und-geht >"$X/warter"; sleep 8; rm -f "$X/warter"; sleep 8; }
        # main zieht weiter, während s misst: s misst, bis der Dienst die Grenz-Flagge legt (Handschlag statt Uhr — die Prüfung fällt je
        # vierten Takt, ein Takt dauert unter Last ~40 s), höchstens 240 s (die Mutante schwanz-nie legt sie nie)
        [ -f "$X/landung_bei" ] && [ "$(cat "$X/landung_bei")" = "$s" ] && { rm -f "$X/landung_bei"; cp "$X/kopf-bei" "$X/main"; e=$((SECONDS + 240)); while [ ! -f "$SPRUNG" ] && [ $SECONDS -lt $e ]; do sleep 1; done; }
        sleep 0.4
        echo "$KOPF:$s" >>"$X/gepusht"
        echo "$(date +%T) $1-$t GEPUSHT (Versuch 1) 1 Station(en)" >>"$X/kette.log"
        [ -f "$X/warter_nach" ] && [ "$(cat "$X/warter_nach")" = "$i" ] && echo macher-hand >"$X/warter"
        [ -f "$X/halt_nach" ] && [ "$(cat "$X/halt_nach")" = "$i" ] && touch "$X/s/landung.halt"
        [ -f "$X/landung_nach" ] && [ "$(cat "$X/landung_nach")" = "$i" ] && cp "$X/kopf2" "$X/main"
        # sprung_nach=<i> (Fall y): nach Station i hebt der Koordinator die Runde auf sprung_auf (runde.cjs sprung, wie am 22.11.); die
        # Station wartet, bis der Dienst die Grenz-Flagge legt (Handschlag, höchstens 90 s — die Mutante sprung-blind legt sie nie)
        # Der Sprung kommt erst, wenn der Stand DIESER Station geschrieben ist (gelesen am Ursprung, höchstens 60 s): ihn sieht dann nur
        # der Blick zwischen den Buchungen (runde_blick) — die Mutante blick-blind misst bis zur nächsten Buchung am alten Kopf weiter
        [ -f "$X/sprung_nach" ] && [ "$(cat "$X/sprung_nach")" = "$i" ] && { rm -f "$X/sprung_nach"
            e=$((SECONDS + 60)); until git -C "$X/o.git" show koordination:zug/runde.txt 2>/dev/null | grep -q "^gtx laeuft $i/"; do [ $SECONDS -ge $e ] && break; sleep 0.5; done
            cp "$X/sprung_auf" "$X/main"
            node "$RUNDE_CJS" sprung "$X/klon" "$KOPF" "$(cat "$X/sprung_auf")" "der Koordinator hebt die Runde (Fall y)" >>"$X/sprung.log" 2>&1
            e=$((SECONDS + 90)); while [ ! -f "$SPRUNG" ] && [ $SECONDS -lt $e ]; do sleep 1; done; }
    done
done
STUMMEL
    # die Lauf-Tafel: je Station ein Lauf mit Deckel 100 s, s7+s8 ein Zwilling (100 s); das Budget 250 s → Sitzungen zu zwei Läufen
    EICHTAFEL=$X/eich.txt TEIL_BUDGET_S=250
    printf '  s1 · Deckel 100 s\n  s2 · Deckel 100 s\n  s3 · Deckel 100 s\n  s4 · Deckel 100 s\n  s5 · Deckel 100 s\n  s6 · Deckel 100 s\n  s7+s8 · Deckel 100 s\n' >"$EICHTAFEL"
    eichtafel_lesen() { :; }
    # die echten Glieder der Listen-Kette bleiben für den großen Fall (n) erreichbar, bevor die Stummel sie überdecken
    eval "$(declare -f liste_quelle | sed '1s/liste_quelle/liste_quelle_echt/')"
    eval "$(declare -f ohne_band | sed '1s/ohne_band/ohne_band_echt/')"
    eval "$(declare -f offen_am | sed '1s/offen_am/offen_am_echt/')"
    puls() { echo "PULS $*" >>"$L"; }
    geraet_durch() { runde stand "$RUNDE_REPO" "$1" "$2" laeuft --liste x.K1#1 --gesamt 1 >/dev/null; runde durch "$RUNDE_REPO" "$1" "$2" "$3" >/dev/null; } # ein Gerät durch MIT Liste (ohne Liste nie)
    sag() { echo "SAG $*" >>"$L"; }
    warter() { cat "$X/warter" 2>/dev/null; }
    main_kopf() { cat "$X/main"; }
    abstand() { echo 0; }
    pm_stand() { :; }
    karte_datei() { :; } # die Fälle a–w fahren Stummel-Stationen (s1…), keine Sprossen der Karte 2; die Front prüft Fall x
    ungepusht_pruefen() { :; } # die Linse: radeon-dienst.sh --selbsttest Fall p (dieselbe runde.cjs ungepusht)
    frei_gb() { echo 50; }
    kleiner() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a < b) }'; } # wie orte.sh
    summe() { :; }
    liste_quelle() { QUELLE=Stummel; echo s1,s2,s3,s4,s5,s6,s7,s8; }
    ohne_band() { echo "$1"; }
    offen_am() { echo "$2" | tr ',|' '\n\n' | grep . | while read -r s; do grep -qxF "$1:$s" "$X/gepusht" 2>/dev/null || echo "$s"; done | paste -sd, -; }
    am() { grep -c "^$1:" "$X/gepusht" 2>/dev/null; }                       # gepushte Stationen an einem Kopf (sha40)
    eindeutig() { grep "^$1:" "$X/gepusht" 2>/dev/null | sort -u | wc -l; }
    koord() { git -C "$X/klon" fetch -q origin +refs/heads/koordination:refs/t/k && git -C "$X/klon" show "refs/t/k:$1"; }
    feld() { koord zug/runde.txt | grep "^$1 "; }
    nte() { echo "$1" | sed 's/.* liste //; s/ getragen [0-9]*$//' | tr ',|' '\n\n' | grep . | sed -n "$2p"; } # die n-te Station der eingefrorenen Liste
    erst() { tail -n +$(($1 + 1)) "$KETTE_LOG" | sed -n 's/.* Versuch 1 START (\(.*\))$/\1/p' | head -n 1 | cut -d, -f1; } # die erste Station nach Zeile $1 (die erste der Sitzung)
    nach() { date -u -d "@$(($(date -u -d "$1" +%s) + $2 * 60))" +%FT%TZ; }
    case "$1" in
        sprung) runde() { if [ "$1" = lies ]; then node "$RUNDE_CJS" "$@" 2>>"$L" | awk -v m="$(main_kopf)" '{ if (NF >= 2) $2 = m; print }'; else node "$RUNDE_CJS" "$@" 2>>"$L"; fi; } ;;
        von-vorn) offen_am() { echo "$2" | tr '|' ',' | sed 's/,$//'; } ;;
        bild-omen) KANDIDAT_ECHT=$X/kandidat-alt.sh; sed 's|^  node "$RUNDE_CJS" bilder .*$|  :|' "$D/ort/n0611/kandidat.sh" >"$KANDIDAT_ECHT" ;; # die alte Regel: kein Bild wird geprüft
        behalt-gruppe) KANDIDAT_ECHT=$X/kandidat-alt.sh; sed 's|^    rest=$(node "$RUNDE_CJS" offen "$PM" - gtx "$K" "$R" 2>>$L)$|    rest=$R|' "$D/ort/n0611/kandidat.sh" >"$KANDIDAT_ECHT" ;; # die alte Regel: eine gefallene Sitzung verliert alles
        liste-als-argument) liste_datei() { echo "$2"; } ;; # die alte Regel: die Liste reist als EIN Argument
        leere-liste-laeuft) liste_rot() { :; } ;; # die alte Regel: eine leere Liste ist still
        je-station) teile_von() { echo "$1" | tr ',' ';'; } ;; # die alte Regel: je Station eine eigene Sitzung
        bucht-am-ende) KANDIDAT_ECHT=$X/kandidat-alt.sh; sed 's|^  while kill -0 \$LP 2>/dev/null; do$|  while false; do|' "$D/ort/n0611/kandidat.sh" >"$KANDIDAT_ECHT" ;; # die alte Regel: die Sitzung bucht erst an ihrem Ende, die Flagge wirkt nur zwischen Sitzungen
        deckel-blind) KANDIDAT_ECHT=$X/kandidat-alt.sh; sed 's|^DECKEL=.*$|DECKEL=999999|' "$D/ort/n0611/kandidat.sh" >"$KANDIDAT_ECHT" ;; # die alte Regel: die Sitzung kennt keine Uhr, nur Σ Deckel beim Packen
        station-stumm) KANDIDAT_ECHT=$X/kandidat-alt.sh; sed 's|^    for i in ${neu//,/ }; do k=.*$|    :|' "$D/ort/n0611/kandidat.sh" >"$KANDIDAT_ECHT" ;; # die alte Regel: keine Zeile je Station
        push-still) KANDIDAT_ECHT=$X/kandidat-alt.sh; sed 's|^\( *\)if buche \(.*\); then$|\1buche \2; if :; then|' "$D/ort/n0611/kandidat.sh" >"$KANDIDAT_ECHT" ;; # die alte Regel: GEPUSHT steht, ob der Push gelang oder nicht
        weicht) grenze_pruefen() { [ "$grund" = halt ] && return 0; if [ -f "$S/landung.halt" ]; then grund=halt; touch "$GRENZE"; return 0; fi; [ -n "$(warter)" ] && { grund=weicht; touch "$GRENZE"; }; return 0; } ;; # die Regel 14.11.–22.11.: an der Grenze weicht die Fahrt jedem Wartenden
        hinten-an) darf_beginnen() { WT=$(warter); [ -z "$WT" ]; } ;; # die Regel 14.11.–22.11.: keine Fahrt beginnt, solange irgendwer wartet, auch wer nach ihr kam
        volle-liste) richte_runde() { local s; for s in $(echo "$3" | tr ',|' '  '); do bash "$RICHTER" "$GERAET" --fall "$s" "$2" "$1" >>"$L" 2>&1; done; } ;;
        tafel-reihe) runde() { if [ "$1" = reihe ]; then echo "$4|"; else node "$RUNDE_CJS" "$@" 2>>"$L"; fi; } ;;
        still) runde_alarm() { :; }; platte_alarm() { :; } ;; # kein Alarm, weder Fortschritt noch Platte
        blind) warter() { :; } ;;
        halt-rm) halt() { [ -f "$S/landung.halt" ] && { rm -f "$S/landung.halt"; exit 3; }; } ;;
        nur-schloss) baum_wartende() { :; } ;;
        tafel-blind) karte2_nur() { :; } ;;
        klassen-blind) sed 's|^    const klasse = .*$|    const klasse = () => "K2";|' "$RUNDE_CJS" >"$X/runde-alt.cjs"; RUNDE_CJS=$X/runde-alt.cjs ;; # die Regel bis 21.11.: keine Klasse, die Reihe der Tafel
        blick-blind) runde_blick() { return 0; } ;; # die Regel bis 22.11. 22:30: nur der Stand nach einer Buchung fragt die Runde
        sprung-blind) stand_ernten() { :; } ;; # die alte Regel bis 22.11.: der Stand im Hintergrund antwortet ins Leere, Exit 4 liest niemand
        schwanz-immer) main_weiter() { return 0; } ;; # der Schwanz trägt, auch wenn main nicht weiter ist (die Runde misst ihn nie)
        schwanz-nie) main_weiter() { return 1; } ;; # die Regel bis 21.11.: der Schwanz misst an jedem Kopf neu
        front-blind) sed "s|^        ids = ids.filter((id) => F.has(id));$|        ;|" "$RUNDE_CJS" >"$X/runde-alt.cjs"; RUNDE_CJS=$X/runde-alt.cjs ;; # die Regel bis 21.11. 15:45: die ganze Tafel, auch hinter der Front
        zeile-blind) sed 's|^    const vorn = \[\.\.\.k1(je\.K1),|    const vorn = [...ord(je.K1),|' "$RUNDE_CJS" >"$X/runde-alt.cjs"; RUNDE_CJS=$X/runde-alt.cjs ;; # die Regel bis 23.11.: K1 nach „am längsten nicht gemessen“, die jüngste Landung hinten
        gebucht-zieht) sed "s|^        ids = ids.filter((id) => F.has(id));$|        ids = ids.filter((id) => F.has(id) \|\| stelle.has(id));|" "$RUNDE_CJS" >"$X/runde-alt.cjs"; RUNDE_CJS=$X/runde-alt.cjs ;; # ein Anspruch holt jede Sprosse, auch die schon gebuchte
        tafel-alle) karte2_nur() { [ -f "$PM/vision/richter-tafel.json" ] && grep -o '"station":"[^"]*"' "$PM/vision/richter-tafel.json" | cut -d'"' -f4 | awk '!s[$0]++' | paste -sd, -; } ;;
    esac
    # a — eine Landung nach Station 2, ein Macher nach Station 4: die Liste fährt AM KOPF DER RUNDE zu Ende, nie am neuen main
    if nur a; then
    runde_takt # Runde 1 aus dem Bestand (kein Kopf trägt eine Mess-Datei: main k0)
    echo 2 >"$X/landung_nach"
    echo 4 >"$X/warter_nach"
    runde_takt
    rm -f "$X/warter" "$X/warter_nach" "$X/landung_nach"
    runde_takt # main ist jetzt k2
    e1=$(feld gtx)
    geraet_durch radeon "$k0" "$(main_kopf)" >/dev/null # das andere Gerät ist auch durch → die nächste Runde
    z=$(feld runde)
    # die Sitzungen der ersten Fahrt der Runde 1: je Linse EINE (Teile zu je zwei Läufen, s7+s8 ein Zwilling) — nie je Station eine.
    # Nur die erste Fahrt (Name ohne -w): die Fortsetzung nach dem Weichen trägt, was übrig ist — fiel die Flagge unter Last erst vor s8
    # (ein Takt der Schleife ~40 s gegen 6–8 s je Stummel-Station), ist sie legitim eine Einzel-Sitzung und urteilt nicht über teile
    n=$(grep -c " ${k0:0:8} gtx-${k0:0:8}-[0-9]* Versuch 1 START (.*,.*)" "$KETTE_LOG")
    w=$(grep -c " ${k0:0:8} gtx-${k0:0:8}-[0-9]* Versuch 1 START (" "$KETTE_LOG")
    if [ "$w" -ge 1 ] && [ "$w" -le 5 ] && [ "$n" = "$w" ]; then echo "OK k  Linse: die erste Fahrt der Runde 1 packte 8 Stationen in $w Sitzungen, jede mit mehreren Stationen (Zwilling s7+s8 zusammen) — nie je Station eine"
    else echo "ROT k  Linse: die erste Fahrt der Runde 1 in $w Sitzungen (Soll 1–5), davon mit mehreren Stationen $n (Soll alle)"; fi
    if [ "$(am "$k0")" = 8 ] && [ "$(eindeutig "$k0")" = 8 ] && [ "$(am "$k2")" = 0 ] && echo "$e1" | grep -q "^gtx durch 8/8 " && ! grep -q "SPRUNG: main" "$L" &&
        echo "$z" | grep -qx "runde 2 kopf $k2 start [^ ]* vorher $k0"; then
        echo "OK a  Landung nach Station 2 (main ${k0:0:8} → ${k2:0:8}): die Runde fuhr 8 von 8 am Kopf ${k0:0:8} zu Ende, 0 am neuen main; beide durch → Runde 2 am main des Moments, vorher ${k0:0:8}"
    else echo "ROT a  Landung: am Kopf der Runde $(am "$k0") von 8 (eindeutig $(eindeutig "$k0")), am neuen main $(am "$k2") (Soll 0), Zeile „$(echo "$e1" | cut -c1-24)“ (Soll durch 8/8), Runde „$(echo "$z" | cut -c1-40)“"; fi
    fi
    if nur b; then
    # b — Halt nach Station 3 (Runde 2 am k2): Ende an der Grenze, ohne Flagge weiter an derselben Station
    echo 3 >"$X/halt_nach"
    runde_takt
    e1=$(feld gtx)
    n=$(echo "$e1" | sed -n 's/^gtx halt \([0-9]*\)\/8 .*/\1/p')
    w=$([ -f "$S/landung.halt" ] && echo liegt || echo fort)
    rm -f "$S/landung.halt" "$X/halt_nach"
    j=$(wc -l <"$KETTE_LOG")
    runde_takt
    f1=$(erst "$j")
    e2=$(feld gtx)
    if [ -n "$n" ] && [ "$n" -ge 3 ] && [ "$w" = liegt ] && [ "$f1" = "$(nte "$e1" $((n + 1)))" ] && [ "$(am "$k2")" = 8 ] && [ "$(eindeutig "$k2")" = 8 ] && echo "$e2" | grep -q "^gtx durch 8/8 "; then
        echo "OK b  Halt nach Station 3: Ende an der Grenze („halt $n/8“, Flagge liegt), ohne Flagge weiter an Station $((n + 1)) ($f1), 8 von 8, keine doppelt"
    else echo "ROT b  Halt: Zeile „$(echo "$e1" | cut -c1-24)“ (Soll halt ≥3/8), Flagge $w, weiter an „$f1“ (Soll „$(nte "$e1" $((${n:-0} + 1)))“), am Kopf $(am "$k2") (Soll 8, eindeutig $(eindeutig "$k2"))"; fi
    # b — DIE REIHE DER ANKUNFT (Runde 3 am k1, Koordinator 22.11. 20:41): (1) macher-vor wartet, als die Runde ankommt → sie steht an,
    # keine Fahrt, der Puls nennt ihn; (2) macher-vor ist fort, macher-nach kam nach ihr → sie fährt; nach Station 2 kommt noch eine Hand
    # ans Schloss — keine Flagge, die Fahrt misst 8 von 8 in diesem Takt. (3) die Menge der Vorderen je Takt: wer ging, ist fort, auch
    # unter seinem Namen; wer zu den Vorderen dazukam, steht hinter ihr
    local b1 b2 b3 b4 b5 b6
    echo "$k1" >"$X/main"
    geraet_durch radeon "$k2" "$k1" >/dev/null
    echo macher-vor >"$X/warter"
    j=$(wc -l <"$KETTE_LOG")
    w=$(wc -l <"$L")
    runde_takt
    b1=$(tail -n +$((j + 1)) "$KETTE_LOG" | grep -c " START (")
    b2=$(tail -n +$((w + 1)) "$L" | grep -c "^PULS landung steht an: vor ihr wartet macher-vor ")
    echo macher-nach >"$X/warter"
    echo 2 >"$X/warter_nach"
    j=$(wc -l <"$KETTE_LOG")
    runde_takt
    e1=$(feld gtx)
    b3=$(tail -n +$((j + 1)) "$KETTE_LOG" | grep -c " SPRUNG")
    rm -f "$X/warter" "$X/warter_nach" "$S/landung.vor"
    WT=; echo a >"$X/warter"; darf_beginnen; b4=$?:$WT
    echo b >"$X/warter"; darf_beginnen; b5=$?:$([ -f "$S/landung.vor" ] && echo vor-liegt || echo vor-fort)
    echo b >"$X/warter"; darf_beginnen; b6=$?
    echo "b c" >"$X/warter"; darf_beginnen; b6=$b6,$?:$WT
    echo c >"$X/warter"; darf_beginnen; b6=$b6,$?
    rm -f "$X/warter" "$S/landung.vor"
    if [ "$b1" = 0 ] && [ "$b2" -ge 1 ] && echo "$e1" | grep -q "^gtx durch 8/8 " && [ "$(am "$k1")" = 8 ] && [ "$(eindeutig "$k1")" = 8 ] && [ "$b3" = 0 ] &&
        ! grep -q "WEICHT|WEITER: " "$L" && [ "$b4" = 1:a ] && [ "$b5" = 0:vor-fort ] && [ "$b6" = "1,1:b,0" ]; then
        echo "OK b  Reihe der Ankunft: macher-vor wartete, als sie kam → sie stand an (keine Sitzung, Puls nennt ihn); er ging, macher-nach kam nach ihr → sie fuhr, eine Hand nach Station 2 legte keine Flagge: 8 von 8 in einem Takt; Vordere a → b: fährt, b → b c → c: steht, steht (vor ihr b), fährt"
    else echo "ROT b  Reihe der Ankunft: Sitzungen, während macher-vor wartete $b1 (Soll 0), Puls „steht an“ $b2 (Soll ≥ 1), Zeile „$(echo "$e1" | cut -c1-24)“ (Soll durch 8/8), am Kopf $(am "$k1") (Soll 8), SPRUNG $b3 (Soll 0), WEICHT/WEITER im Log $(grep -c "WEICHT|WEITER: " "$L") (Soll 0), a „$b4“ (Soll 1:a), dann b „$b5“ (Soll 0:vor-fort), b · b c · c „$b6“ (Soll 1,1:b,0)"; fi
    fi
    if nur c; then
    # c — Neustart (Runde 4 am k2b): der Dienst stirbt in Station 4 ohne Push, ein neuer Prozess ohne Gedächtnis setzt dort fort
    echo "$k2b" >"$X/main"
    geraet_durch radeon "$k1" "$k2b" >/dev/null
    echo 4 >"$X/tod_in"
    (runde_takt) >/dev/null 2>&1
    e1=$(feld gtx)
    j=$(wc -l <"$KETTE_LOG")
    (unset RN RK RV RZ RLISTE; runde_takt) # sein Gedächtnis ist die Datei
    f1=$(erst "$j")
    if echo "$e1" | grep -q "^gtx laeuft " && [ "$(am "$k2b")" = 8 ] && [ "$(eindeutig "$k2b")" = 8 ] && [ "$f1" = "$(nte "$e1" 4)" ]; then
        echo "OK c  Neustart: der Dienst starb in Station 4 („$(echo "$e1" | cut -c5-16)“), der neue Prozess setzte an Station 4 fort ($f1), 8 von 8, keine doppelt"
    else echo "ROT c  Neustart: Zeile „$(echo "$e1" | cut -c1-24)“, weiter an „$f1“ (Soll „$(nte "$e1" 4)“), am Kopf $(am "$k2b") (Soll 8, eindeutig $(eindeutig "$k2b"))"; fi
    fi
    if nur d; then
    # d — frisches ROT: s1 GRÜN am k0, ROT am k2; s2 GRÜN → GRÜN; s3 nie GRÜN; der Täter (Schein-Messung) ist k1
    mkdir -p "$X/p/meisterkarte-quelle/punkte/messung"
    echo '{"je":{"s1":{"gruen":true,"zeit":"1"},"s2":{"gruen":true,"zeit":"1"},"s3":{"gruen":false,"zeit":"1"}}}' >"$X/p/meisterkarte-quelle/punkte/messung/${k0:0:8}-gtx.json"
    echo '{"je":{"s1":{"gruen":false,"zahl":"0,4 < 1","zeit":"2"},"s2":{"gruen":true,"zeit":"2"},"s3":{"gruen":false,"zeit":"2"}}}' >"$X/p/meisterkarte-quelle/punkte/messung/${k2:0:8}-gtx.json"
    git -C "$X/p" add -A && git -C "$X/p" $A0 commit -qm mess && git -C "$X/p" push -q "$X/o.git" punkte-maschine
    RN=d
    export RICHTER_SCHEIN_ROT_AB=$k1
    richte_runde "$k2" "$k0" "s1,s2,s3|"
    export RICHTER_SCHEIN_ROT_AB=nie
    o=$(koord zug/richter.txt 2>/dev/null)
    if echo "$o" | grep -q "TÄTER s1: ${k1:0:8} .*(gut ${k0:0:8}, schlecht ${k2:0:8}" && ! echo "$o" | grep -qE " (s2|s3)[: ]" && ! grep -qE "START (s2|s3) " "$X/richter/richter.log" 2>/dev/null; then
        echo "OK d  frisches ROT an s1 (GRÜN am ${k0:0:8}, ROT am ${k2:0:8}): NUR s1 über die Köpfe dazwischen halbiert, TÄTER-Kopf ${k1:0:8} in zug/richter.txt; s2, s3 nicht gefahren"
    else echo "ROT d  Richter: richter.txt „$(echo "$o" | tail -n 2 | cut -c1-110 | tr '\n' '|')“, gestartet „$(grep -oE "START [^ ]+" "$X/richter/richter.log" 2>/dev/null | tr '\n' ' ')“ (Soll nur s1, Täter ${k1:0:8})"; fi
    fi
    if nur e; then
    # e — DIE REIHE FOLGT DER ERWARTETEN ÄNDERUNG (21.11.): die Klasse aus dem JÜNGSTEN Urteil über alle Köpfe (am aaaaaaaa: s1 GRÜN,
    # s2 ROT Umfang, s3 ROT Leser fehlt, s4 ROT anderes, s5 UNGEMESSEN; am jüngeren bbbbbbbb: s1 ROT Umfang), ohne eigenes das andere
    # Gerät (s6 GRÜN nur auf der Radeon), s7 beansprucht (zug/anspruch.txt), s8 nie gemessen → K1 s7 · K2 s8 s5 · K3 s6 | K4 s4 · K5 s3 · K6 s2 s1
    # (22.11., so viel wie nötig: K4 — bekanntes ROT ohne Anspruch — steht im Schwanz)
    echo '{"zeit":"2026-11-18T01:00:00Z","je":{"s1":{"gruen":true,"zeit":"2026-11-18T01:00:00Z"},"s2":{"gruen":false,"grund":"S5 · ROT Umfang nicht erzeugbar: die Sitzung trägt 3","zeit":"2026-11-18T01:01:00Z"},"s3":{"gruen":false,"grund":"S2 · ROT Leser fehlt: kein Leser von x","zeit":"2026-11-18T01:02:00Z"},"s4":{"gruen":false,"grund":"ROT: 0,4 verfehlt ≥ 1","zeit":"2026-11-18T01:03:00Z"}},"ungemessen":{"s5":{"gruen":false,"ungemessen":true,"grund":"die Welt der Sitzung trägt nicht mehr","zeit":"2026-11-18T01:04:00Z"}}}' >"$MESSUNG_DIR/aaaaaaaa-gtx.json"
    echo '{"zeit":"2026-11-19T01:00:00Z","je":{"s1":{"gruen":false,"grund":"S6 · ROT Leser fehlt: Umfang nicht erzeugbar (10⁹)","zeit":"2026-11-19T01:00:00Z"}}}' >"$MESSUNG_DIR/bbbbbbbb-gtx.json"
    echo '{"zeit":"2026-11-18T01:00:00Z","je":{"s6":{"gruen":true,"zeit":"2026-11-18T01:00:00Z"}}}' >"$MESSUNG_DIR/aaaaaaaa-radeon.json"
    printf '# zug/anspruch.txt
w29-probe s7,nicht-in-der-liste#1 # Kommentar
' >"$X/anspruch.txt"
    o=$(runde reihe "$MESSUNG_DIR" gtx s1,s2,s3,s4,s5,s6,s7,s8 --anspruch "$X/anspruch.txt")
    if [ "$o" = "s7,s8,s5,s6|s4,s3,s2,s1" ]; then echo "OK e  Reihe der Klassen: K1 beansprucht s7 · K2 ohne Urteil s8 s5 · K3 GRÜN s6 (das andere Gerät) | Schwanz K4 s4 · K5 s3 · K6 s2 s1 (das jüngste Urteil über alle Köpfe) — $o"
    else echo "ROT e  Reihe der Klassen: „$o“ (Soll s7,s8,s5,s6|s4,s3,s2,s1)"; fi
    fi
    if nur f; then
    # f — Alarm (Runde 4 am k2b: die OMEN durch, das andere Gerät ohne Fortschritt seit dem Start der Runde)
    t0=$(feld runde | sed -n 's/^runde .* start \([^ ]*\) .*/\1/p')
    export RUNDE_JETZT=$(nach "$t0" 10)
    runde_alarm
    f1=$(koord zug/erledigt.txt | grep -c "ALARM")
    RUNDE_JETZT=$(nach "$t0" 20)
    runde_takt # die OMEN ist durch und wartet — ihr Takt sieht das andere Gerät
    RUNDE_JETZT=$(nach "$t0" 25)
    runde_alarm
    unset RUNDE_JETZT
    f2=$(koord zug/erledigt.txt | grep -c "RUNDE 4 ALARM radeon: ohne Fortschritt seit 20 min")
    f3=$(koord zug/erledigt.txt | grep -c "ALARM")
    if [ "$f1" = 0 ] && [ "$f2" = 1 ] && [ "$f3" = 1 ]; then echo "OK f  Alarm: nach 10 min keiner, nach 20 min EINE Zeile „RUNDE 4 ALARM radeon: ohne Fortschritt seit 20 min“, nach 25 min nicht doppelt"
    else echo "ROT f  Alarm: nach 10 min $f1 (Soll 0), nach 20 min $f2 (Soll 1), zusammen $f3 (Soll 1)"; fi
    fi
    if nur j; then
    # j — die Platte (Koordinator 02:35, 02:42): vor der Station die Zahl; unter 15 GB eine Warnung, unter 10 GB der Halt — je EIN
    # ALARM mit Zahl, Station und Kopf, nicht doppelt
    PLATTE_UNTEN=10 PLATTE_WARN=15
    frei_gb() { echo 12.5; }
    vor_station s3
    vor_station s4
    w1=$(koord zug/erledigt.txt | grep -c "ALARM gtx: PLATTE 12.5 GB frei (< 15 GB) — Warnung: die Platten-Wache hält bei 10 GB, Station s3")
    w2=$(grep -c "Station s4 beginnt · C: 12.5 GB frei" "$L")
    frei_gb() { echo 9.4; }
    platte_zu
    j=$?
    platte_zu
    f2=$(koord zug/erledigt.txt | grep -c "ALARM gtx: PLATTE 9.4 GB frei (< 10 GB)")
    f3=$(koord zug/erledigt.txt | grep "ALARM gtx: PLATTE 9.4" | grep -c "Kopf ${k2b:0:8}")
    frei_gb() { echo 50; }
    if [ $j = 0 ] && [ "$f2" = 1 ] && [ "$f3" = 1 ] && [ "$w1" = 1 ] && [ "$w2" = 1 ] && ! platte_zu; then echo "OK j  Platte: vor der Station die Zahl („C: 12.5 GB frei“), bei 12,5 GB EINE Warnung (< 15), bei 9,4 GB EIN Halt-Alarm (< 10) mit Station und Kopf ${k2b:0:8}, nicht doppelt; bei 50 GB nichts"
    else echo "ROT j  Platte: Warnung ${w1} (Soll 1), Zahl vor der Station ${w2} (Soll 1), platte_zu $j (Soll 0), Halt-Zeilen ${f2} (Soll 1), mit Kopf ${f3} (Soll 1)"; fi
    fi
    # l — BEHALTEN JE STATION (Koordinator 03:30): das ECHTE kandidat.sh mit Attrappen (punkte-offen.cjs, Schloss, Hook- und Dienst-Log).
    # Die Sitzung „a,b,c,d“ fällt nach 2 Stationen (VERDRÄNGT): gepusht werden a,b, nur der Rest c,d fährt in einer neuen Sitzung, nach „e“
    local KT=$X/kt ke=${KANDIDAT_ECHT:-$D/ort/n0611/kandidat.sh}
    [ -f "$ke" ] || ke=$D/../../p3/n0611/kandidat.sh
    mkdir -p "$KT/n" "$KT/kpm/meisterkarte-quelle/punkte/messung" "$KT/km"
    : >"$KT/hook.log"; : >"$KT/dienst.log"; : >"$KT/n/pm-stand.cjs"; : >"$KT/n/zeile-erledigt.cjs"
    printf 'gpu_frei() { return 0; }\ncpu_ruhe() { :; }\n' >"$KT/schloss.sh"
    cat >"$KT/n/punkte-offen.cjs" <<'ATTRAPPE'
const fs = require("fs"), path = require("path"), a = process.argv.slice(2), was = a[0], K = was === "push-pfade" ? a[4] : a[1], X = process.env.KT_X;
const f = path.join(X, "kpm", "meisterkarte-quelle", "punkte", "messung", K.slice(0, 8) + "-gtx.json");
const lies = () => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : { je: {} });
if (was === "lauf") {
    fs.appendFileSync(path.join(X, "laeufe.log"), process.env.NUR + "\n");
    const m = lies(), vn = path.join(X, "verdr_nach");
    let i = 0;
    for (const s of process.env.NUR.split(",")) {
        // die Fälle r, t: je Station <langsam> ms (eine Sitzung, an deren Grenzen kandidat.sh wacht; lang genug, dass der Wächter jede
        // Grenze auch unter der Last von 20 parallelen Läufen einzeln sieht); grenze_nach=<n> legt die Flagge vor der n-ten
        const ls = path.join(X, "langsam");
        if (fs.existsSync(ls)) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Number(fs.readFileSync(ls, "utf8")) || 4000);
        const gn = path.join(X, "grenze_nach");
        if (fs.existsSync(gn) && Number(fs.readFileSync(gn, "utf8")) === i + 1) fs.writeFileSync(path.join(X, "grenze"), "");
        if (fs.existsSync(vn) && Number(fs.readFileSync(vn, "utf8")) === i) {
            fs.rmSync(vn);
            fs.appendFileSync(path.join(X, "dienst.log"), "x gpu-lauf omen-punkte-gtx-sitzung VERDRÄNGT 1/3\n");
            fs.appendFileSync(path.join(X, "hook.log"), "x ende 1 echt: fertig\n");
            process.exit(0);
        }
        m.je[s] = { gruen: true, zeit: new Date().toISOString() };
        fs.writeFileSync(f, JSON.stringify(m));
        if (s === "a" || s === "b") { const rd = path.join(path.dirname(f), "roh", K.slice(0, 8) + "-gtx"); fs.mkdirSync(rd, { recursive: true }); fs.writeFileSync(path.join(rd, s + "-bild.png"), "PNG " + s); }
        i++;
        // handschlag (r, u): die nächste Station beginnt erst, wenn der Wächter den Push dieser versucht hat (höchstens 60 s) — eine
        // echte Station dauert Minuten, die Attrappe Sekunden; mit fester Uhr zog ein Wächter-Takt (sleep 1 + node offen + zwei node je
        // Push, unter Last länger als 10 s) zwei Stationen in einen Push zusammen (r: „a,b a,b,c“ statt „a a,b“)
        if (fs.existsSync(path.join(X, "handschlag"))) {
            const vz = path.join(X, "versuche.log"), bis = Date.now() + 60000;
            while (Date.now() < bis && (fs.existsSync(vz) ? fs.readFileSync(vz, "utf8").split("\n").filter(Boolean).length : 0) < i) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
        }
    }
} else if (was === "push-pfade") {
    // der EINE Schreiber (runde.cjs push-pfade <baum> <zweig> <geraet> <kopf> <botschaft>); push_rot_n=<n>: die nächsten n Pushes scheitern
    fs.appendFileSync(path.join(X, "versuche.log"), "push\n"); // jeder Versuch zählt für den Handschlag, auch der gescheiterte
    const pr = path.join(X, "push_rot_n"), n = fs.existsSync(pr) ? Number(fs.readFileSync(pr, "utf8")) : 0;
    if (n > 0) {
        fs.writeFileSync(pr, String(n - 1));
        console.log("PUSH SCHEITERT 10x: fatal: Unable to create 'index-punkte-maschine.tmp.lock': File exists.");
        process.exit(1);
    }
    fs.appendFileSync(path.join(X, "push.log"), Object.keys(lies().je).sort().join(",") + "\n");
    console.log("punkte-maschine 0000000 · 1 Datei(en) von gtx");
}
ATTRAPPE
    echo 2 >"$KT/verdr_nach"
    # das Gesetz der Roh-Bilder (6b): a gebucht GRÜN, misst GRÜN (Urteil hält) → Bild in die Ablage; b gebucht ROT, misst GRÜN (Beweis-Bild) → bleibt
    echo '{"je":{"x":{"stationen":[{"id":"a","geraet":"gtx","gruen":true,"sha":"x"},{"id":"b","geraet":"gtx","gruen":false,"sha":"x"}]}}}' >"$KT/kpm/meisterkarte-quelle/punkte/stand.json"
    if nur l; then
    KANDIDAT_ABLAGE=$KT/ablage KT_X=$KT KOPF=$k0 KANDIDAT_N=$KT/n KANDIDAT_PM=$KT/kpm KANDIDAT_M=$KT/km KANDIDAT_H=$KT/hook.log KANDIDAT_D=$KT/dienst.log \
        KANDIDAT_SCHLOSS=$KT/schloss.sh KANDIDAT_SCHLAF=0 KANDIDAT_TAKT=1 KANDIDAT_PUSH_CJS=$KT/n/punkte-offen.cjs KANDIDAT_PUSH_ROT=$KT/push-rot RUNDE_CJS=$RUNDE_CJS bash "$ke" kt x "a,b,c,d;e" >/dev/null 2>&1
    f1=$(paste -sd' ' "$KT/laeufe.log" 2>/dev/null)
    f2=$(head -n 1 "$KT/push.log" 2>/dev/null)
    f3=$(grep -c "kt-1 GEPUSHT (Versuch 1) 2 Station(en) — BEHALTEN je Station, der Rest folgt: c,d" "$KT/n/kette-0711.log" 2>/dev/null)
    if [ "$f1" = "a,b,c,d e c,d" ] && [ "$f2" = "a,b" ] && [ "$f3" = 1 ] && [ "$(tail -n 1 "$KT/push.log")" = "a,b,c,d,e" ]; then
        echo "OK l  BEHALTEN je Station: die Sitzung a,b,c,d fiel nach 2 (VERDRÄNGT) — a,b gepusht, nur c,d fuhr neu (nach e), am Ende a–e"
    else echo "ROT l  BEHALTEN je Station: Sitzungen „$f1“ (Soll „a,b,c,d e c,d“), erster Push „$f2“ (Soll a,b), Zeile BEHALTEN $f3 (Soll 1), letzter Push „$(tail -n 1 "$KT/push.log" 2>/dev/null)“"; fi
    local rd=$KT/kpm/meisterkarte-quelle/punkte/messung/roh/${k0:0:8}-gtx
    if [ -f "$KT/ablage/${k0:0:8}-gtx/a-bild.png" ] && [ ! -f "$rd/a-bild.png" ] && [ -f "$rd/a-bild.png.sha256" ] && [ -f "$rd/b-bild.png" ]; then
        echo "OK m  Roh-Bilder der OMEN: a hält GRÜN — Bild in der Ablage am Gerät, nur a-bild.png.sha256 reist; b wechselt ROT → GRÜN — das Beweis-Bild reist"
    else echo "ROT m  Roh-Bilder: Ablage a $([ -f "$KT/ablage/${k0:0:8}-gtx/a-bild.png" ] && echo ja || echo nein) (Soll ja), im Baum a $([ -f "$rd/a-bild.png" ] && echo ja || echo nein) (Soll nein), Prüfsumme a $([ -f "$rd/a-bild.png.sha256" ] && echo ja || echo nein), b $([ -f "$rd/b-bild.png" ] && echo ja || echo nein) (Soll ja)"; fi
    fi
    if nur r; then
    # r — GRENZE UND BUCHUNG JE STATION IN DER SITZUNG (Koordinator 19.11.; Befund: 252 Stationen in EINER Sitzung, 2 h 20 min nichts
    # gebucht): das ECHTE kandidat.sh, EINE Sitzung „a,b,c,d,e“, je Station 10 s. a ist gepusht, während die Sitzung noch misst; vor b
    # legt der Dienst die Grenz-Flagge — die Sitzung endet an DIESER Grenze (c nie gemessen), b ist gepusht, die Liste endet (SPRUNG)
    local K2=$X/kt2 r1 r2 r3 r4
    mkdir -p "$K2/n" "$K2/kpm/meisterkarte-quelle/punkte/messung" "$K2/km"
    : >"$K2/hook.log"; : >"$K2/dienst.log"; : >"$K2/n/pm-stand.cjs"; : >"$K2/n/zeile-erledigt.cjs"; echo 10000 >"$K2/langsam"; echo 2 >"$K2/grenze_nach"; : >"$K2/handschlag"
    cp "$KT/schloss.sh" "$K2/schloss.sh"; cp "$KT/n/punkte-offen.cjs" "$K2/n/punkte-offen.cjs"
    KANDIDAT_ABLAGE=$K2/ablage KT_X=$K2 KOPF=$k0 KANDIDAT_N=$K2/n KANDIDAT_PM=$K2/kpm KANDIDAT_M=$K2/km KANDIDAT_H=$K2/hook.log KANDIDAT_D=$K2/dienst.log \
        KANDIDAT_SCHLOSS=$K2/schloss.sh KANDIDAT_SCHLAF=0 KANDIDAT_TAKT=1 SPRUNG=$K2/grenze KANDIDAT_PUSH_CJS=$K2/n/punkte-offen.cjs KANDIDAT_PUSH_ROT=$K2/push-rot RUNDE_CJS=$RUNDE_CJS bash "$ke" kt2 x "a,b,c,d,e" >/dev/null 2>&1
    r1=$(paste -sd' ' "$K2/push.log" 2>/dev/null)
    r2=$(node -e 'console.log(Object.keys(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).je).sort().join(","))' "$(cygpath -m "$K2/kpm/meisterkarte-quelle/punkte/messung/${k0:0:8}-gtx.json")" 2>/dev/null)
    r3=$(grep -c "kt2-1 GEPUSHT (Versuch 1) 1 Station(en)" "$K2/n/kette-0711.log" 2>/dev/null)
    r4=$(grep -c "kt2-1 GRENZE: die Grenz-Flagge des Dienstes liegt\|kt2 SPRUNG" "$K2/n/kette-0711.log" 2>/dev/null)
    if [ "$r1" = "a a,b" ] && [ "$r2" = "a,b" ] && [ "$r3" = 2 ] && [ "$r4" = 2 ] && [ "$(wc -l <"$K2/laeufe.log")" = 1 ]; then
        echo "OK r  Grenze und Buchung je Station in der Sitzung: a gepusht, während die Sitzung maß; die Flagge vor b beendete sie an der Grenze nach b (c nie gemessen), Pushes „$r1“, die Liste endete"
    else echo "ROT r  je Station: Pushes „$r1“ (Soll „a a,b“), gemessen „$r2“ (Soll a,b), GEPUSHT-Zeilen je Station $r3 (Soll 2), GRENZE+SPRUNG $r4 (Soll 2), Sitzungen $(wc -l <"$K2/laeufe.log" 2>/dev/null) (Soll 1)"; fi
    fi
    if nur t; then
    # t — DER DECKEL DER SITZUNG + EINE ZEILE JE STATION (Koordinator 11:07; Befund: Sitzung 1 am f68dbf09 lief von 08:11:40 an Stunden
    # weiter, Σ Deckel der Eich-Tafel 1 610 s gegen 2–3 min je Station, und die Kette schrieb seit START keine Zeile): das ECHTE
    # kandidat.sh, EINE Sitzung „a,b,c,d“, je Station 10 s, Deckel 15 s — an der ersten Grenze nach 15 s (nach b) endet sie, der Rest c,d
    # fährt SOFORT als neue Sitzung (kein Versuch, kein SPRUNG), je geurteilte Station EINE Zeile mit Uhr
    local K3=$X/kt3 t1 t2 t3 t4
    mkdir -p "$K3/n" "$K3/kpm/meisterkarte-quelle/punkte/messung" "$K3/km"
    : >"$K3/hook.log"; : >"$K3/dienst.log"; : >"$K3/n/pm-stand.cjs"; : >"$K3/n/zeile-erledigt.cjs"; echo 10000 >"$K3/langsam"
    cp "$KT/schloss.sh" "$K3/schloss.sh"; cp "$KT/n/punkte-offen.cjs" "$K3/n/punkte-offen.cjs"
    KANDIDAT_ABLAGE=$K3/ablage KT_X=$K3 KOPF=$k0 KANDIDAT_N=$K3/n KANDIDAT_PM=$K3/kpm KANDIDAT_M=$K3/km KANDIDAT_H=$K3/hook.log KANDIDAT_D=$K3/dienst.log \
        KANDIDAT_SCHLOSS=$K3/schloss.sh KANDIDAT_SCHLAF=0 KANDIDAT_TAKT=1 KANDIDAT_DECKEL_S=15 SPRUNG=$K3/grenze KANDIDAT_PUSH_CJS=$K3/n/punkte-offen.cjs KANDIDAT_PUSH_ROT=$K3/push-rot RUNDE_CJS=$RUNDE_CJS bash "$ke" kt3 x "a,b,c,d" >/dev/null 2>&1
    t1=$(paste -sd' ' "$K3/laeufe.log" 2>/dev/null)
    t2=$(node -e 'console.log(Object.keys(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).je).sort().join(","))' "$(cygpath -m "$K3/kpm/meisterkarte-quelle/punkte/messung/${k0:0:8}-gtx.json")" 2>/dev/null)
    t3=$(grep -cE "^[0-9]{2}:[0-9]{2}:[0-9]{2} kt3-1 STATION [a-d] geurteilt \([0-9]/[0-9]\)$" "$K3/n/kette-0711.log" 2>/dev/null)
    t4=$(grep -c "kt3-1 DECKEL: der Deckel der Sitzung (15 s" "$K3/n/kette-0711.log" 2>/dev/null)
    if echo "$t1" | grep -qE "^a,b,c,d [b-d]" && [ "$t2" = "a,b,c,d" ] && [ "$t3" -ge 4 ] && [ "$t4" -ge 1 ] && ! grep -q "SPRUNG\|OFFEN nach" "$K3/n/kette-0711.log"; then
        echo "OK t  Deckel der Sitzung: die Sitzung a,b,c,d endete an der ersten Grenze nach 15 s, der Rest c,d fuhr sofort neu (Sitzungen „$t1“), gemessen $t2; $t3 Zeilen „STATION … geurteilt (k/N)“ mit Uhr"
    else echo "ROT t  Deckel/Zeile je Station: Sitzungen „$t1“ (Soll „a,b,c,d“ und der Rest nach dem Schnitt), gemessen „$t2“ (Soll a,b,c,d), Stations-Zeilen mit Uhr $t3 (Soll ≥ 4), DECKEL-Zeilen $t4 (Soll ≥ 1)"; fi
    fi
    if nur u; then
    feld runde | grep -q . || runde_takt >/dev/null 2>&1 # allein gefahren (ST_NUR=u): die Runde, in die der Alarm schreibt, aus dem Bestand
    # u — DER PUSH SCHEITERT LAUT (Koordinator 21.11. 01:10; Fund: die GTX-Runde 2 zählte 1 290 von 1 428 am 31ea3847, der Ursprung trug
    # keine Mess-Datei — eine verwaiste Index-Sperre ließ jeden `punkte-offen.cjs push` scheitern, die Kette schrieb trotzdem GEPUSHT): das
    # ECHTE kandidat.sh, EINE Sitzung „a,b,c“, je Station 3 s, der Push über den EINEN Schreiber (push-pfade, Attrappe). u1: jeder Push
    # scheitert — keine GEPUSHT-Zeile, „PUSH ROT <kopf8>: <grund>“ in der Kette, omen.push-rot trägt den Grund, push_rot_pruefen hebt
    # daraus EINEN Alarm „PUSH ROT“ in zug/erledigt.txt (zweimal gerufen, einmal geschrieben). u2: die ersten zwei Pushes scheitern — der
    # nächste gelungene zählt ihre Stationen mit (Σ GEPUSHT = 3, nie mehr), omen.push-rot fällt mit ihm. Mutante dazu: push-still
    local K4=$X/kt4 K5=$X/kt5 KK u1 u2 u3 u4 u5 u6
    for KK in "$K4" "$K5"; do
        mkdir -p "$KK/n" "$KK/kpm/meisterkarte-quelle/punkte/messung" "$KK/km"
        : >"$KK/hook.log"; : >"$KK/dienst.log"; : >"$KK/n/pm-stand.cjs"; : >"$KK/n/zeile-erledigt.cjs"; echo 3000 >"$KK/langsam"; : >"$KK/handschlag"
        cp "$KT/schloss.sh" "$KK/schloss.sh"; cp "$KT/n/punkte-offen.cjs" "$KK/n/punkte-offen.cjs"
    done
    echo 99 >"$K4/push_rot_n"
    echo 2 >"$K5/push_rot_n"
    for KK in "$K4" "$K5"; do
        KANDIDAT_ABLAGE=$KK/ablage KT_X=$KK KOPF=$k0 KANDIDAT_N=$KK/n KANDIDAT_PM=$KK/kpm KANDIDAT_M=$KK/km KANDIDAT_H=$KK/hook.log KANDIDAT_D=$KK/dienst.log \
            KANDIDAT_SCHLOSS=$KK/schloss.sh KANDIDAT_SCHLAF=0 KANDIDAT_TAKT=1 KANDIDAT_PUSH_CJS=$KK/n/punkte-offen.cjs KANDIDAT_PUSH_ROT=$KK/push-rot RUNDE_CJS=$RUNDE_CJS bash "$ke" ku x "a,b,c" >/dev/null 2>&1
    done
    u1=$(grep -c "ku-1 GEPUSHT" "$K4/n/kette-0711.log" 2>/dev/null)
    u2=$(grep -c "ku-1 PUSH ROT ${k0:0:8}: PUSH SCHEITERT 10x: fatal: Unable to create" "$K4/n/kette-0711.log" 2>/dev/null)
    u3=$(grep -c "${k0:0:8} ku-1 PUSH SCHEITERT 10x: .*index-punkte-maschine.tmp.lock" "$K4/push-rot" 2>/dev/null)
    cp "$K4/push-rot" "$S/omen.push-rot" 2>/dev/null
    push_rot_pruefen
    push_rot_pruefen
    u4=$(koord zug/erledigt.txt | grep -c "ALARM gtx: PUSH ROT ${k0:0:8} ku-1 PUSH SCHEITERT")
    rm -f "$S/omen.push-rot" "$S/omen.push-rot.alarm"
    u5=$(sed -n 's/.* ku-1 GEPUSHT (Versuch [0-9]*) \([0-9]*\) Station.*/\1/p' "$K5/n/kette-0711.log" 2>/dev/null | awk '{ s += $1 } END { print s + 0 }')
    u6=$(grep -c "ku-1 PUSH ROT" "$K5/n/kette-0711.log" 2>/dev/null)
    if [ "$u1" = 0 ] && [ "${u2:-0}" -ge 1 ] && [ "$u3" = 1 ] && [ "$u4" = 1 ] && [ "$u5" = 3 ] && [ "$u6" = 2 ] && [ ! -f "$K5/push-rot" ]; then
        echo "OK u  Push laut: scheitert jeder Push, steht keine GEPUSHT-Zeile, aber $u2× „PUSH ROT“ mit Grund in der Kette, omen.push-rot trägt ihn, EIN Alarm „PUSH ROT“; scheitern zwei, zählt der nächste gelungene Σ $u5 Stationen und die Datei fällt"
    else echo "ROT u  Push laut: GEPUSHT-Zeilen bei jedem Push gescheitert $u1 (Soll 0), PUSH ROT-Zeilen $u2 (Soll ≥ 1), Grund in omen.push-rot $u3 (Soll 1), Alarm-Zeilen $u4 (Soll 1); zwei gescheitert: Σ GEPUSHT $u5 (Soll 3), PUSH ROT $u6 (Soll 2), Datei danach $([ -f "$K5/push-rot" ] && echo da || echo weg) (Soll weg)"; fi
    fi
    if nur g; then
    # g — die Baum-Sperre (14.11.)
    BAUM_WARTET=$X/wartet
    mkdir -p "$BAUM_WARTET"
    schloss_wartende() { :; }
    local w0 w1 w2
    w0=$(warter_echt)
    touch "$BAUM_WARTET/landung-22" "$BAUM_WARTET/dauer-44"
    touch -d '5 minutes ago' "$BAUM_WARTET/macher-33"
    w1=$(warter_echt)
    touch "$BAUM_WARTET/macher-11"
    w2=$(warter_echt)
    if [ -z "$w0" ] && [ -z "$w1" ] && [ "$w2" = "Baum-Sperre:macher-11" ]; then echo "OK g  Baum-Sperre: die frische Marke eines Machers ist ein Wartender ($w2); die der Landung, des Wächters und eine 5 min alte zählen nicht"
    else echo "ROT g  Baum-Sperre: leer „$w0“ (Soll leer), nur Landung · Wächter · alte Marke „$w1“ (Soll leer), mit frischem Macher „$w2“ (Soll Baum-Sperre:macher-11)"; fi
    fi
    if nur h; then
    # h — die Karte 2
    PM=$X/pm
    local h0 h1
    h0=$(karte2_nur)
    mkdir -p "$PM/vision"
    echo '{"lesart":"x","zeilen":[{"station":"a.K1#1","richter":"gleich"},{"station":"b.K2#2","richter":"fehlt"},{"station":"a.K1#1","richter":"gleich"}]}' >"$PM/vision/richter-tafel.json"
    h1=$(karte2_nur)
    if [ -z "$h0" ] && [ "$h1" = "a.K1#1" ]; then echo "OK h  Karte 2: ohne Tafel leer, mit Tafel ihre Stationen mit einer Zeile gleich, je einmal ($h1 — b.K2#2 „fehlt“ fährt nicht)"
    else echo "ROT h  Karte 2: ohne Tafel „$h0“ (Soll leer), mit Tafel „$h1“ (Soll a.K1#1)"; fi
    fi
    if nur i; then
    # i — halt(): die Flagge bleibt
    touch "$S/landung.halt"
    (halt) >/dev/null 2>&1
    j=$?
    if [ $j = 3 ] && [ -f "$S/landung.halt" ]; then echo "OK i  halt(): Exit 3, landung.halt liegt weiter"
    else echo "ROT i  halt(): Exit $j (Soll 3), Flagge $([ -f "$S/landung.halt" ] && echo liegt || echo FORT)"; fi
    fi
    if nur n; then
    # n — DIE ECHTE TAFEL (Koordinator 19.11. 05:54/05:58): die Tafel des koordination-Kopfs (vision/richter-tafel.json — sie wächst, der
    # Fall wächst mit) läuft durch die ganze Kette bis zur ersten Sitzung: Quelle → ohne /band → Reihe → runde.txt → offen → Teile →
    # kandidat. Kein node-Aufruf trägt mehr als 30 000 Zeichen in argv (die Windows-Grenze 32 767); die Liste ≥ Quelle − gebucht.
    local tf=$X/pmn/vision/richter-tafel.json quelle lz nz f4 f5
    mkdir -p "$X/pmn/vision" "$X/pmn/meisterkarte-quelle/punkte/messung" "$X/messung-n"
    git -C "$D/../.." show HEAD:vision/richter-tafel.json >"$tf" 2>/dev/null
    PM=$X/pmn MESSUNG_DIR=$X/messung-n ST=$D/ort/n0611/stufe
    quelle=$(karte2_nur | tr ',' '\n' | grep -c .)
    karte2_nur | tr ',' '\n' | grep . | sed 's/^/  /; s/$/ · Deckel 1 s/' >"$EICHTAFEL" # jede Station ein Lauf von 1 s: die Zeichen-Grenze schneidet
    node() { local a n=0; for a; do n=$((n + ${#a})); done; [ $n -gt 30000 ] && echo "$n ${2:-$1}" >>"$X/argv-lang"; command node "$@"; }
    liste_quelle() { liste_quelle_echt "$@"; }
    ohne_band() { ohne_band_echt "$@"; }
    offen_am() { offen_am_echt "$@"; }
    rm -f "$S/landung.halt" "$S/liste-rot.alarm"
    touch "$X/nur_erste"
    geraet_durch radeon "$k2b" "$k1" >/dev/null # die Runde 5 am k1: die gtx-Zeile beginnt leer
    echo "$k1" >"$X/main"
    j=$(wc -l <"$KETTE_LOG")
    runde_takt
    e1=$(feld gtx)
    lz=$(echo "$e1" | sed 's/.* liste //; s/ getragen [0-9]*$//' | tr ',|' '\n\n' | grep -c .)
    nz=$(tail -n +$((j + 1)) "$KETTE_LOG" | grep -c " Versuch 1 START (.*,.*)")
    rm -f "$X/nur_erste" "$S/landung.halt"
    unset -f node
    if [ "$quelle" -ge 1000 ] && [ "$lz" -ge "$quelle" ] && [ "$nz" -ge 1 ] && [ ! -s "$X/argv-lang" ] && echo "$e1" | grep -q "^gtx halt "; then
        echo "OK n  die echte Tafel: Quelle $quelle Stationen (gebucht 0) → Liste $lz in zug/runde.txt, die erste Sitzung fuhr; kein node-Aufruf über 30 000 Zeichen"
    else echo "ROT n  die echte Tafel: Quelle $quelle (Soll ≥ 1 000), Liste $lz (Soll ≥ Quelle), erste Sitzung $nz (Soll ≥ 1), argv über 30 000: $(head -c 120 "$X/argv-lang" 2>/dev/null | tr '\n' ' '), Zeile „$(echo "$e1" | cut -c1-30)“"; fi
    fi
    if nur o; then
    # o — STILLES SCHEITERN IST ROT: die Kette bricht (ohne /band Exit 1, nichts) → EIN Alarm „LISTE ROT“, die Zeile bleibt (nie laeuft 0/0)
    geraet_durch gtx "$k1" "$k2"
    geraet_durch radeon "$k1" "$k2" >/dev/null # Runde 6 am k2
    echo "$k2" >"$X/main"
    ohne_band() { return 1; }
    runde_takt
    f4=$(koord zug/erledigt.txt | grep -c "ALARM gtx: LISTE ROT")
    e1=$(feld gtx)
    if [ "$f4" -ge 1 ] && echo "$e1" | grep -q "^gtx offen 0/0 .* liste -$"; then echo "OK o  Listen-Kette bricht: EIN Alarm „LISTE ROT …“ beim Namen, die Zeile bleibt offen (kein laeuft 0/0, kein durch)"
    else echo "ROT o  Listen-Kette bricht: Alarm-Zeilen $f4 (Soll ≥ 1), Zeile „$(echo "$e1" | cut -c1-60)“ (Soll offen 0/0 … liste -)"; fi
    fi
    if nur p; then
    # p — DER LISTEN-BRUCH VON 05:53: die gtx-Zeile steht „laeuft 0/0 … liste |“ — der erste Takt baut die Liste selbst neu, die Runde
    # bleibt, und zug/runde.txt trägt eine Notiz, die es sagt (die leere Fahrt gilt nicht als gemessen)
    liste_quelle() { QUELLE=Stummel; echo s1,s2,s3,s4,s5,s6,s7,s8; }
    ohne_band() { echo "$1"; }
    offen_am() { echo "$2" | tr ',|' '\n\n' | grep . | while read -r s; do grep -qxF "$1:$s" "$X/gepusht" 2>/dev/null || echo "$s"; done | paste -sd, -; }
    git -C "$X/klon" fetch -q origin +refs/heads/koordination:refs/t/k
    koord zug/runde.txt | sed "s/^gtx .*/gtx laeuft 0\/0 station - fortschritt 2026-11-19T04:53:00Z alarm - liste |/" >"$X/rt.txt"
    local bb bl tt cc ix
    ix=$(cygpath -m "$X/idx") # git (Windows) braucht die Laufwerks-Form im GIT_INDEX_FILE
    bb=$(git -C "$X/klon" rev-parse refs/t/k) bl=$(git -C "$X/klon" hash-object -w --no-filters "$X/rt.txt")
    rm -f "$ix"
    GIT_INDEX_FILE=$ix git -C "$X/klon" read-tree "$bb"
    GIT_INDEX_FILE=$ix git -C "$X/klon" update-index --cacheinfo "100644,$bl,zug/runde.txt"
    tt=$(GIT_INDEX_FILE=$ix git -C "$X/klon" write-tree)
    cc=$(git -C "$X/klon" $A0 commit-tree "$tt" -p "$bb" -m bruch) && git -C "$X/klon" push -q origin "$cc:refs/heads/koordination"
    touch "$X/nur_erste"
    runde_takt
    rm -f "$X/nur_erste" "$S/landung.halt"
    e1=$(feld gtx)
    f5=$(koord zug/runde.txt | grep -c "^notiz .* gtx neu gebaut nach Listen-Bruch: vorher laeuft 0/0 liste |")
    if [ "$(echo "$e1" | sed 's/.* liste //; s/ getragen [0-9]*$//' | tr ',|' '\n\n' | grep -c .)" = 8 ] && [ "$f5" = 1 ] && koord zug/runde.txt | grep -q "^runde 6 "; then
        echo "OK p  Listen-Bruch „laeuft 0/0 … liste |“: der erste Takt baute die Liste neu (8 Stationen), dieselbe Runde 6, die Notiz steht in zug/runde.txt"
    else echo "ROT p  Listen-Bruch: Zeile „$(echo "$e1" | cut -c1-40) … $(echo "$e1" | sed "s/.* liste //" | cut -c1-60)“ (Soll Liste mit 8), Notiz $f5 (Soll 1), Runde $(koord zug/runde.txt | grep -c '^runde 6 ') (Soll 6)"; fi
    fi
    if nur q; then
    # q — „gtx durch 0/0 … liste |“ (Live 06:17, am f68dbf09 gebucht): runde.cjs schreibt „durch“ ohne Station nie (Exit 5); steht die
    # Zeile doch so, setzt der erste Takt sie selbst zurück auf offen (Notiz „… zurück auf offen“) und baut die Liste neu — kein Null-Bericht
    local f6 f7 rq
    git -C "$X/klon" fetch -q origin +refs/heads/koordination:refs/t/k
    koord zug/runde.txt | sed "s/^gtx .*/gtx durch 0\/0 station - fortschritt 2026-11-19T05:17:00Z alarm - liste |/" >"$X/rt.txt"
    bb=$(git -C "$X/klon" rev-parse refs/t/k) bl=$(git -C "$X/klon" hash-object -w --no-filters "$X/rt.txt")
    rm -f "$ix"
    GIT_INDEX_FILE=$ix git -C "$X/klon" read-tree "$bb"
    GIT_INDEX_FILE=$ix git -C "$X/klon" update-index --cacheinfo "100644,$bl,zug/runde.txt"
    tt=$(GIT_INDEX_FILE=$ix git -C "$X/klon" write-tree)
    cc=$(git -C "$X/klon" $A0 commit-tree "$tt" -p "$bb" -m durch-null) && git -C "$X/klon" push -q origin "$cc:refs/heads/koordination"
    runde durch "$RUNDE_REPO" gtx "$(koord zug/runde.txt | sed -n 's/^runde [0-9]* kopf \([0-9a-f]*\) .*/\1/p')" "$k0" >/dev/null 2>&1
    rq=$?
    j=$(wc -l <"$KETTE_LOG")
    touch "$X/nur_erste"
    runde_takt
    rm -f "$X/nur_erste" "$S/landung.halt"
    e1=$(feld gtx)
    f6=$(koord zug/runde.txt | grep -c "^notiz .* gtx durch 0/0 war ein Listen-Bruch .* zurück auf offen")
    f7=$(tail -n +$((j + 1)) "$KETTE_LOG" | grep -c "GEPUSHT (Versuch 1) 0 Station" )
    if [ "$rq" = 5 ] && [ "$f6" = 1 ] && [ "$(echo "$e1" | sed 's/.* liste //; s/ getragen [0-9]*$//' | tr ',|' '\n\n' | grep -c .)" = 8 ]; then
        echo "OK q  „durch 0/0 … liste |“: runde.cjs durch ohne Station verweigert (Exit 5); der erste Takt setzte die Zeile zurück auf offen (Notiz) und baute die Liste neu (8)"
    else echo "ROT q  durch 0/0: runde durch ohne Station Exit $rq (Soll 5), Notiz $f6 (Soll 1), Zeile „$(echo "$e1" | cut -c1-40) … $(echo "$e1" | sed 's/.* liste //' | cut -c1-60)“ (Soll Liste mit 8)"; fi
    fi
    if nur s; then
    # s — DER WARTENDE KOMMT UND GEHT → DER ZÄHLER STEIGT (Koordinator 19.11.; Befund 08:35–10:33: omen-los-main wartete 10 min, die
    # Flagge lag 2 h, der Puls nannte ihn noch; seit der Reihe der Ankunft 22.11. legt er nie eine): Runde 7 an einem neuen Kopf, in
    # Station 3 kommt ein Macher ans Schloss und geht wieder, bevor die Station endet — keine Flagge, kein WEICHT, in DIESEM Takt 8 von 8,
    # „laeuft k/8“ steigt in zug/runde.txt, kein Puls nennt ihn. Mutante weicht (die Fahrt weicht an der Grenze) → ROT
    local k3 s0 s1 s2 s3
    git -C "$X/klon" $A0 commit -q --allow-empty -m "main 6" && git -C "$X/klon" push -q origin main
    k3=$(git -C "$X/klon" rev-parse HEAD)
    geraet_durch gtx "$k2" "$k3"
    geraet_durch radeon "$k2" "$k3" >/dev/null # Runde 7 am k3
    echo "$k3" >"$X/main"
    lauf_zahl() { git -C "$X/klon" fetch -q origin +refs/heads/koordination:refs/t/k && git -C "$X/klon" log -p --format= refs/t/k -- zug/runde.txt | grep -c "^+gtx laeuft [1-7]/8 "; }
    s0=$(lauf_zahl)
    echo 3 >"$X/warter_kommt"
    j=$(wc -l <"$L")
    runde_takt
    rm -f "$X/warter_kommt" "$X/warter"
    e1=$(feld gtx)
    s1=$(lauf_zahl)
    s2=$(tail -n +$((j + 1)) "$L" | grep -c "WEICHT\|WEITER: \|ABGEBROCHEN")
    s3=$(tail -n +$((j + 1)) "$L" | grep "^PULS" | grep -c "macher-kommt-und-geht")
    if echo "$e1" | grep -q "^gtx durch 8/8 " && [ "$(am "$k3")" = 8 ] && [ "$(eindeutig "$k3")" = 8 ] && [ "$s1" -gt "$s0" ] && [ "$s2" = 0 ] && [ "$s3" = 0 ]; then
        echo "OK s  Wartender kommt und geht in Station 3: keine Flagge, kein WEICHT, dieselbe Sitzung maß 8 von 8 in einem Takt, der Zähler stieg ($((s1 - s0))× laeuft k/8), kein Puls nannte ihn"
    else echo "ROT s  kommt und geht: Zeile „$(echo "$e1" | cut -c1-24)“ (Soll durch 8/8), am Kopf $(am "$k3") (Soll 8), Zähler-Stände $s0 → $s1 (Soll mehr), WEICHT/WEITER/ABGEBROCHEN $s2 (Soll 0), Puls mit dem Wartenden $s3 (Soll 0)"; fi
    fi
    if nur w; then
    # w — DER SCHWANZ TRÄGT NUR, WENN main WEITER IST (21.11.): die Liste aus den Mess-Dateien von e heißt „s7,s8,s5,s6|s4,s3,s2,s1“ (ohne
    # Anspruch ist s7 K2). w1 Runde 8, main = Kopf: vorn 4 und der Schwanz 4 fahren, 8/8, getragen 0, kein Teil mischt vorn und Schwanz.
    # w2 Runde 9, main ist weiter: vorn 4 fahren, der Schwanz trägt (getragen 4, keine Fahrt). w3 Runde 10, main = Kopf, während s4 (die
    # erste Schwanz-Station, K4 seit dem 22.11.) misst, zieht main weiter: die Fahrt endet an der Grenze nach s4, s3 s2 s1 tragen (getragen 3).
    # Mutanten: schwanz-immer (w1 trägt) · schwanz-nie (w2, w3 messen alles) · klassen-blind (die Liste ohne Klassen)
    local k4 k5 k6 w0 x1 x2 x3 xl xm
    if [ -z "$k3" ]; then # allein (ST_NUR=e,w): die Runde am Bestand anlegen, die GTX ist an ihrem Kopf durch — wie nach s
        runde_takt >/dev/null 2>&1
        k3=$(feld runde | sed -n 's/^runde [0-9]* kopf \([0-9a-f]*\) .*/\1/p')
        geraet_durch gtx "$k3" "$k3"
    fi
    MESSUNG_DIR=$X/messung # die Mess-Dateien von e (der Fall n stellte MESSUNG_DIR auf seine leere messung-n; ohne sie las w die Tafel-Reihe ohne Klassen)
    for j in 7 8 9; do git -C "$X/klon" $A0 commit -q --allow-empty -m "main $j"; done
    git -C "$X/klon" push -q origin main
    k4=$(git -C "$X/klon" rev-parse HEAD~2) k5=$(git -C "$X/klon" rev-parse HEAD~1) k6=$(git -C "$X/klon" rev-parse HEAD)
    geraet_durch radeon "$k3" "$k4" >/dev/null # Runde 8 am k4 (die GTX ist an k3 durch)
    echo "$k4" >"$X/main"
    j=$(wc -l <"$KETTE_LOG")
    runde_takt
    x1=$(feld gtx)
    xl=$(echo "$x1" | sed 's/.* liste \([^ ]*\).*/\1/')
    # kein Teil mischt: jede Sitzung am k4 trägt nur vorn oder nur Schwanz
    xm=$(tail -n +$((j + 1)) "$KETTE_LOG" | sed -n "s/.* ${k4:0:8} .* Versuch 1 START (\(.*\))$/\1/p" | while read -r t; do v=0 h=0; for s in ${t//,/ }; do case ",${xl#*|}," in *",$s,"*) h=1 ;; *) v=1 ;; esac; done; [ $v = 1 ] && [ $h = 1 ] && echo "$t"; done)
    geraet_durch radeon "$k4" "$k5" >/dev/null # Runde 9 am k5
    echo "$k6" >"$X/main"                       # main ist weiter als der Kopf der Runde
    runde_takt
    x2=$(feld gtx)
    w0=$(am "$k5")
    geraet_durch radeon "$k5" "$k6" >/dev/null # Runde 10 am k6, main = k6
    echo "$k5" >"$X/kopf-bei"
    echo s4 >"$X/landung_bei"
    runde_takt
    rm -f "$X/landung_bei"
    x3=$(feld gtx)
    if [ "$xl" = "s7,s8,s5,s6|s4,s3,s2,s1" ] && echo "$x1" | grep -q "^gtx durch 8/8 .* getragen 0$" && [ "$(am "$k4")" = 8 ] && [ -z "$xm" ] &&
        echo "$x2" | grep -q "^gtx durch 4/8 .* getragen 4$" && [ "$w0" = 4 ] && ! grep -q "^$k5:s[1234]$" "$X/gepusht" &&
        echo "$x3" | grep -q "^gtx durch 5/8 .* getragen 3$" && [ "$(am "$k6")" = 5 ] && grep -q "^$k6:s4$" "$X/gepusht" && grep -q "MAIN WEITER (${k6:0:8}" "$L"; then
        echo "OK w  Schwanz trägt nur bei main weiter: main = Kopf → vorn 4 + Schwanz 4 gemessen (8/8, kein Teil mischt); main weiter → vorn 4, der Schwanz trägt (4/8, getragen 4); main zieht während s4 weiter → Ende an der Grenze (5/8, getragen 3)"
    else echo "ROT w  Schwanz: Liste „$xl“ (Soll s7,s8,s5,s6|s4,s3,s2,s1), main = Kopf „$(echo "$x1" | cut -c1-16) … $(echo "$x1" | grep -o 'getragen.*')“ am Kopf $(am "$k4") (Soll 8/8 getragen 0, 8), gemischt „$xm“, main weiter „$(echo "$x2" | cut -c1-16) … $(echo "$x2" | grep -o 'getragen.*')“ am Kopf $w0 (Soll 4/8 getragen 4, 4), main zieht weiter „$(echo "$x3" | cut -c1-16) … $(echo "$x3" | grep -o 'getragen.*')“ am Kopf $(am "$k6") (Soll 5/8 getragen 3, 5)"; fi
    fi
    if nur x; then
    # x — DIE FRONT DER KARTE 2 (Koordinator 21.11. 15:45, runde.cjs reihe --karte): Leiter a (heute 1: a#1 gebucht, Front a#2 ROT,
    # dahinter a#3 GRÜN), Glieder-Leiter b (heuteSprossen 1, 3), Leiter c (heute 1, Front c#2, dahinter c#3)
    echo "{\"gruppen\":[{\"kriterien\":[{\"id\":\"a\",\"heute\":1,\"sprossen\":[{\"nr\":1},{\"nr\":2},{\"nr\":3}]},{\"id\":\"b\",\"zaehlung\":\"glieder\",\"heuteSprossen\":[1,3],\"sprossen\":[{\"nr\":1},{\"nr\":2},{\"nr\":3},{\"nr\":4}]},{\"id\":\"c\",\"heute\":1,\"sprossen\":[{\"nr\":1},{\"nr\":2},{\"nr\":3}]}]}]}" >"$X/karte.json"
    echo "{\"zeit\":\"2026-11-20T01:00:00Z\",\"je\":{\"karte2.a#2\":{\"gruen\":false,\"grund\":\"ROT: 0,4 verfehlt\",\"zeit\":\"2026-11-20T01:00:00Z\"},\"karte2.a#3\":{\"gruen\":true,\"zeit\":\"2026-11-20T01:00:00Z\"}}}" >"$MESSUNG_DIR/cccccccc-gtx.json"
    XL=karte2.a#1,karte2.a#2,karte2.a#3,karte2.b#1,karte2.b#2,karte2.b#3,karte2.b#4,karte2.c#1,karte2.c#2,karte2.c#3
    : >"$X/anspruch-x.txt"
    x1=$(runde reihe "$MESSUNG_DIR" gtx "$XL" --karte "$X/karte.json" --anspruch "$X/anspruch-x.txt")
    echo "w29-drei karte2.c#3" >"$X/anspruch-x.txt"
    x2=$(runde reihe "$MESSUNG_DIR" gtx "$XL" --karte "$X/karte.json" --anspruch "$X/anspruch-x.txt")
    echo "w29-zwei karte2.c#2,karte2.c#3" >"$X/anspruch-x.txt"
    x3=$(runde reihe "$MESSUNG_DIR" gtx "$XL" --karte "$X/karte.json" --anspruch "$X/anspruch-x.txt")
    : >"$X/karte-leer.json"
    runde reihe "$MESSUNG_DIR" gtx "$XL" --karte "$X/karte-leer.json" >/dev/null
    x4=$?
    # die rote Front a#2 (K4, ROT anderes) steht seit 22.11. im Schwanz („so viel wie nötig“)
    if [ "$x1" = "karte2.b#2,karte2.b#4,karte2.c#2|karte2.a#2" ] && [ "$x2" = "$x1" ] && [ "$x3" = "karte2.c#2,karte2.c#3,karte2.b#2,karte2.b#4|karte2.a#2" ] && [ "$x4" = 6 ]; then
        echo "OK x  Front der Karte 2: die grüne a#3 hinter der roten Front a#2 steht nicht in der Liste; Glieder-Leiter b: jede ungebuchte (b#2, b#4) steht drin; Anspruch auf c#3 ohne gebuchte c#2 tritt nicht ein, mit Anspruch auf c#2+c#3 treten beide als K1 ein; Karte unlesbar → Exit 6 — $x3"
    else echo "ROT x  Front: ohne Anspruch „$x1“ (Soll karte2.b#2,karte2.b#4,karte2.c#2|karte2.a#2), Anspruch c#3 „$x2“ (Soll gleich), Anspruch c#2+c#3 „$x3“ (Soll karte2.c#2,karte2.c#3,karte2.b#2,karte2.b#4|karte2.a#2), leere Karte Exit $x4 (Soll 6)"; fi
    fi
    if nur y; then
    # y — DIE RUNDE SPRINGT WÄHREND DER LISTE (Koordinator 22.11. 19:31; Befund seit 18:27: `stand … laeuft` antwortete „ANDERE RUNDE“,
    # Exit 4, und die Liste fuhr am alten Kopf weiter): eine eigene Runde am frischen Kopf y1; nach Station 2 hebt der Koordinator sie auf
    # y2 (runde.cjs sprung) — die Liste endet an der nächsten Stations-Grenze mit „RUNDE SPRANG auf <y2>“, 2 Stationen am y1, keine mehr;
    # der nächste Takt misst die ganze Liste am y2. Der Sprung fällt NACH dem Stand der Station 2 (der Stummel wartet darauf): ihn sieht
    # nur der Blick zwischen den Buchungen. Mutanten dazu: sprung-blind (Exit 4 liest niemand) · blick-blind (nur der Stand fragt)
    local y1 y2 yl
    git -C "$X/klon" $A0 commit -q --allow-empty -m "main y1" && y1=$(git -C "$X/klon" rev-parse HEAD)
    git -C "$X/klon" $A0 commit -q --allow-empty -m "main y2" && y2=$(git -C "$X/klon" rev-parse HEAD)
    git -C "$X/klon" push -q origin main
    yl=$(runde lies "$RUNDE_REPO" "$GERAET")
    if [ "$yl" = - ]; then runde anlegen "$RUNDE_REPO" "$y1" >/dev/null; else runde sprung "$RUNDE_REPO" "$(echo "$yl" | cut -d' ' -f2)" "$y1" "Fall y: die eigene Runde" >/dev/null; fi
    echo "$y1" >"$X/main"
    echo "$y2" >"$X/sprung_auf"
    echo 2 >"$X/sprung_nach"
    rm -f "$S/landung.halt" "$X/warter"
    j=$(wc -l <"$L")
    runde_takt
    w1=$(am "$y1")
    w2=$(tail -n +$((j + 1)) "$L" | grep -c "RUNDE SPRANG auf ${y2:0:8}: stand am ${y1:0:8} antwortet ANDERE RUNDE (Exit 4)")
    runde_takt
    w=$(am "$y2")
    if [ "$w1" = 2 ] && [ "$w2" = 1 ] && [ "$w" = 8 ] && [ "$(eindeutig "$y2")" = 8 ]; then
        echo "OK y  Sprung des Koordinators nach Station 2 (${y1:0:8} → ${y2:0:8}): die Liste endete an der nächsten Grenze („RUNDE SPRANG auf ${y2:0:8}“), 2 am alten Kopf, keine mehr; der nächste Takt maß 8 von 8 am neuen"
    else echo "ROT y  Sprung: am alten Kopf $w1 (Soll 2), Zeile „RUNDE SPRANG auf ${y2:0:8}“ $w2× (Soll 1), am neuen Kopf $w (Soll 8, eindeutig $(eindeutig "$y2"))"; fi
    fi
    if nur z; then
    # z — K1 IN DER REIHE DER LANDUNGEN (Koordinator 23.11. 03:50; Runde 9 am ddaf883d: bevoelkerung#1 der jüngsten Landung auf Platz 23
    # von 23 K1): drei Anspruchs-Zeilen alt · mitte · neu, z5 in alt UND mitte (die jüngere zählt); zuletzt gemessen z4 (23.11.) > z2 > z5
    # > z3 > z1 (19.11.) — die alte Reihe hätte z1,z3,z5,z2,z4. Soll: neu z4,z2 · mitte z5 · alt z3,z1 · dann K2 z6. Mutante: zeile-blind
    local zz
    echo '{"zeit":"2026-11-19T01:00:00Z","je":{"z1":{"gruen":true,"zeit":"2026-11-19T01:00:00Z"},"z3":{"gruen":false,"grund":"ROT: 0,4 verfehlt","zeit":"2026-11-20T01:00:00Z"},"z5":{"gruen":true,"zeit":"2026-11-21T01:00:00Z"},"z2":{"gruen":false,"grund":"S2 · ROT Leser fehlt: kein Leser","zeit":"2026-11-22T01:00:00Z"},"z4":{"gruen":true,"zeit":"2026-11-23T01:00:00Z"}}}' >"$MESSUNG_DIR/dddddddd-gtx.json"
    printf '# zug/anspruch.txt\nw29-alt z3,z1,z5\nw29-mitte z5 # Kommentar\n\nw29-neu z4,z2\n' >"$X/anspruch-z.txt"
    zz=$(runde reihe "$MESSUNG_DIR" gtx z1,z2,z3,z4,z5,z6 --anspruch "$X/anspruch-z.txt")
    if [ "$zz" = "z4,z2,z5,z3,z1,z6|" ]; then echo "OK z  K1 in der Reihe der Landungen: die jüngste Anspruchs-Zeile zuerst (z4,z2), in der Zeile ihre Reihe, z5 aus der jüngeren Zeile, dann alt (z3,z1) — nie „zuletzt gemessen hinten“ — $zz"
    else echo "ROT z  K1-Reihe: „$zz“ (Soll z4,z2,z5,z3,z1,z6|)"; fi
    fi
    if nur z2; then
    # z2 — DIE GEBUCHTE ANSPRUCHS-SPROSSE FÄLLT (Koordinator 23.11. 03:50; am 23.11. trugen 7 von 34 Anspruchs-Einträgen schon den Punkt,
    # z. B. same.physik.feuer#1): Leiter g heute 2 (g#1, g#2 gebucht, Front g#3), Glieder-Leiter h (heuteSprossen 2); beansprucht g#1, g#2,
    # h#2 (gebucht) und h#3 (offen) → nur h#3 ist K1, die gebuchten stehen nirgends in der Liste. Mutante: gebucht-zieht
    local zg
    echo '{"gruppen":[{"kriterien":[{"id":"g","heute":2,"sprossen":[{"nr":1},{"nr":2},{"nr":3},{"nr":4}]},{"id":"h","zaehlung":"glieder","heuteSprossen":[2],"sprossen":[{"nr":1},{"nr":2},{"nr":3}]}]}]}' >"$X/karte-z2.json"
    printf 'w29-gebucht karte2.g#1,karte2.g#2,karte2.h#2\nw29-offen karte2.h#3\n' >"$X/anspruch-z2.txt"
    zg=$(runde reihe "$MESSUNG_DIR" gtx karte2.g#1,karte2.g#2,karte2.g#3,karte2.g#4,karte2.h#1,karte2.h#2,karte2.h#3 --karte "$X/karte-z2.json" --anspruch "$X/anspruch-z2.txt")
    if [ "$zg" = "karte2.h#3,karte2.g#3,karte2.h#1|" ]; then echo "OK z2 die gebuchte Anspruchs-Sprosse fällt: g#1, g#2, h#2 tragen den Punkt und stehen nirgends, K1 nur die offene h#3, dann die Front g#3 · h#1 — $zg"
    else echo "ROT z2 gebuchte Anspruchs-Sprosse: „$zg“ (Soll karte2.h#3,karte2.g#3,karte2.h#1|)"; fi
    fi
    nur -
    command rm -rf "$X"
}
MUTANTEN=${ST_MUTANTEN-"sprung-blind blick-blind front-blind zeile-blind gebucht-zieht klassen-blind schwanz-immer schwanz-nie bucht-am-ende weicht hinten-an deckel-blind station-stumm push-still liste-als-argument leere-liste-laeuft je-station behalt-gruppe bild-omen sprung von-vorn volle-liste tafel-reihe still blind halt-rm nur-schloss tafel-blind tafel-alle"}
# DIE FANG-TAFEL (EINE Stelle, 22.11.): je Mutante die Fälle, an denen sie ROT fallen MUSS — sie fährt nur diese (ST_NUR), nicht alle 24
# (front-blind fuhr 33 min für ein Urteil an x). Ohne Eintrag fährt eine Mutante alle Fälle.
FANG="sprung-blind:y blick-blind:y front-blind:x zeile-blind:z gebucht-zieht:z2 klassen-blind:e schwanz-immer:e,w schwanz-nie:e,w weicht:a,b hinten-an:a,b blind:a,b"
fang() { local p; for p in $FANG; do [ "${p%%:*}" = "$1" ] && { echo "${p#*:}"; return; }; done; }
selbsttest() {
    local O m r rot=0 mr=0 mz=0 ok
    O=$(mktemp -d)
    # der echte Lauf ALLEIN zuerst (19.11.: die Fälle r, s, t urteilen über Uhr und Takt — neben 19 parallelen Mutanten verpasste der
    # Wächter Grenzen von 10 s, 12:11–12:55), danach die Mutanten parallel (sie brauchen nur ein ROT)
    # ST_ECHT=0: nur die Mutanten; ST_NUR=<fälle>: nur diese Fälle (je Fall eine ZEIT-Zeile), auch in den Mutanten
    if [ "${ST_ECHT:-1}" = 0 ]; then : >"$O/echt"; else (st_lauf "" >"$O/echt" 2>&1); fi
    for m in $MUTANTEN; do (ST_NUR=${ST_NUR:-$(fang "$m")}; st_lauf "$m" >"$O/$m" 2>&1) & done
    wait
    grep -E "^(OK|ROT|ZEIT)" "$O/echt" | sed 's/^/  /'
    grep -q "^ROT" "$O/echt" && rot=1
    ok=$(grep -c "^OK" "$O/echt")
    [ -n "$ST_NUR" ] || [ "${ST_ECHT:-1}" = 0 ] || [ "$ok" = 27 ] || rot=1
    for m in $MUTANTEN; do
        mz=$((mz + 1))
        r=$(grep "^ROT" "$O/$m" | cut -c1-140)
        if [ -n "$r" ]; then mr=$((mr + 1)); echo "  Mutante „$m“ ROT an: $(echo "$r" | cut -c5-100 | tr '\n' '|' | sed 's/|$//;s/|/ · /g')"; else echo "  Mutante „$m“ bleibt GRÜN"; fi
    done
    rm -rf "$O"
    if [ $rot = 0 ] && [ $mr = $mz ]; then echo "landung-dienst SELBSTTEST GRÜN: ${ST_NUR:+nur }$ok Fälle grün (${ST_NUR:-a–z2}), $mr/$mz Mutanten ROT"; return 0; fi
    echo "landung-dienst SELBSTTEST ROT: $ok von 27 Fällen OK, $mr/$mz Mutanten ROT"
    return 1
}
[ "$1" = --selbsttest ] && { selbsttest; exit $?; }

. "$D/orte.sh"
KANDIDAT=$N/kandidat.sh
KETTE_LOG=$N/kette-0711.log
RUNDE_REPO=$M                                    # der Klon, der origin kennt (koordination · punkte-maschine · main)
MESSUNG_DIR=$PM/meisterkarte-quelle/punkte/messung # die Reihe liest die Mess-Dateien beider Geräte hier
EICHTAFEL=$ST/eichtafel-gtx.txt                    # die Lauf-Tafel der Maschine je Fahrt (eichtafel_lesen)
schloss landung || exit 0
L=$ST/landung.log
log "START landung-dienst (PID $(cat "$S/landung.pid"), MSYS $$) — das Gesetz der Runde, zug/runde.txt"
while :; do
    halt
    if platte_zu; then
        sleep 120
        continue
    fi
    runde_takt
    sleep 60
done
