#!/bin/bash
# UNTER sh.exe (13.11.): jeder Prozess-Start unter dem installierten bash.exe kostet auf diesem Rechner 1–2,6 s, unter dem
# byte-gleichen sh.exe daneben 30–90 ms (fork-zeit: exec true, Subshell — das Sammeln des Zug-Diensts stand daran 11–18 min je Zug).
# Als sh gerufen schaltet die Zeile nur POSIX ab (volles bash); sonst startet sich das Skript EINMAL unter sh.exe neu.
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# ci.sh <zweig> … — je Zweig die letzten Läufe am Kopf mit Urteil und roten Jobs
cd /c/Users/micha/AnazhRealm-profiband
TOK=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p')
API=https://api.github.com/repos/MiguellD/AnazhRealm
# JE AUFRUF EINE EIGENE LAUF-LISTE (20.11.): bis hierher schrieb jeder Rufer dieselbe Datei ci-runs.tmp. Fragte ein Arbeiter oder ein
# Warter, während der Zug-Dienst las, bekam der Dienst fremde oder leere Zeilen — vor z632 standen w28-los-huelle-2 und
# w28-kern-sprossen-heil-2 so mit grüner Probe als „GPU-Probe nicht GRÜN (GPU-Probe zug-vorab-statik …)“ im Wartezimmer.
CT=/tmp/claude/w4/ci-runs.$$.tmp
trap 'rm -f "$CT"' EXIT
# „    voll: n/m“ eines Laufs — wie viele Gruppen der VOLLEN Batterie er grün trug (0/0 = nur der Puls)
voll_zahl() {
  curl -s -H "Authorization: Bearer $TOK" "$API/actions/runs/$1/jobs?per_page=100&filter=latest" | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let v=[];try{v=(JSON.parse(s).jobs||[]).filter(x=>/^voll /.test(x.name));}catch(e){}console.log("    voll: "+v.filter(x=>x.conclusion==="success").length+"/"+v.length);})'
}
for z in "$@"; do
  sha=$(git ls-remote origin "refs/heads/$z" | cut -c1-40)
  echo "== $z ${sha:0:8}"
  curl -s -H "Authorization: Bearer $TOK" "$API/actions/runs?head_sha=$sha&per_page=20" | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);for(const r of (j.workflow_runs||[]))console.log(r.id+"\t"+r.name+"\t"+r.status+"\t"+(r.conclusion||"-"));})' > "$CT"
  while IFS=$'\t' read -r id name st co; do
    # EIN WACKLER OHNE TÄTER HÄLT KEINEN ZWEIG VOR DEM ZUG (15.11.: w28-wand-acht b8700e9e, ein Zweig nur aus diag-betriebsgesetz.cjs, fiel
    # an „Die Fahr-Linse des Lebens“ und ging heim — der Zug selbst lässt denselben Schritt seit 08.11. ohne Neulauf landen). Ist am
    # Kopf JEDER rote Schritt des Code-Checks einer der EINEN Liste (zug.cjs WACKEL_RE), gilt der Lauf als grün und seine Gruppe als
    # gefahren; die Zeile nennt den Wackler. Leser: zug-dienst.sh bereit().
    if [ "$name" = "Code-Check" ] && [ "$co" = failure ]; then
      curl -s -H "Authorization: Bearer $TOK" "$API/actions/runs/$id/jobs?per_page=100&filter=latest" | node -e '
const { rotSchritte, WACKEL_RE } = require(process.cwd() + "/artifacts/profiband/werkzeug/zug.cjs");
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let jobs=[];try{jobs=JSON.parse(s).jobs||[];}catch(e){}
const f=jobs.filter(x=>x.conclusion==="failure");const w=f.length>0&&jobs.every(x=>x.conclusion==="success"||x.conclusion==="skipped"||x.conclusion==="failure")&&f.every(x=>rotSchritte(x).every(n=>WACKEL_RE.test(n)));
if(w){const v=jobs.filter(x=>/^voll /.test(x.name));console.log("  Code-Check: completed success (Wackler ohne Täter: "+f.map(x=>x.name+"/"+rotSchritte(x).join("+")).join(", ").slice(0,200)+")");console.log("    voll: "+v.filter(x=>x.conclusion==="success"||f.includes(x)).length+"/"+v.length);}
else{console.log("  Code-Check: completed failure");console.log("    rot ("+f.length+"/"+jobs.length+"): "+f.map(x=>x.name+" ["+((x.steps||[]).filter(s=>s.conclusion==="failure").map(s=>s.name).join(","))+"]").join(" · "));}})'
      continue
    fi
    echo "  $name: $st $co"
    # „voll: n/m“ — wie viele Gruppen der VOLLEN Batterie dieser grüne Lauf trug (0/0 = nur der Puls); der Leser ist zug-dienst.sh bereit()
    if [ "$name" = "Code-Check" ] && [ "$co" = success ]; then
      vz=$(voll_zahl "$id")
      # DER KOPF IST SEIN INHALT (18.11., scripts/ci-kopf.cjs `kopfKette` — derselbe Richter wie der Job `kopf` der check.yml, EINE
      # Regel für CI und Dienst): ein Stempel ohne Inhalt (EIN Elter, derselbe Baum) auf einem geprüften Kopf fährt die volle
      # Batterie nicht selbst, sein grüner Lauf trägt „voll: 0/n“. Dann gilt das Urteil des leeren Vorfahren; ohne diese Zeile
      # stieß der Dienst für jeden solchen Stempel die Batterie neu an (e840849a und 4717fc65 um 16:01, je 15 min und 18 Plätze).
      # Trägt der Haupt-Baum die Kette noch nicht oder trug kein Vorfahr die Batterie, bleibt „voll: 0/n“ stehen wie bisher.
      # DER POST ZÄHLT NICHT (24.11., ci-post-erbt): der Inhalt eines Kopfs ist sein Wurzel-Baum OHNE den Eintrag cloud-post — der
      # Bericht, den der Dienst über eine Vorprüfung schreibt, nahm ihr sonst das Urteil, und der Stempel darüber fuhr die Batterie
      # neu. Trägt der Haupt-Baum `kopfKetteLokal`, baut SIE die Kette (git ls-tree, derselbe Inhalt wie kopfKetteLesen im Job
      # `kopf`); sonst der alte Bau aus Baum-SHAs. Kein stiller Rückfall: „geerbt“ nennt den Bau, der urteilte, und bricht der
      # Richter, steht „kette: ROT“ mit seinem Satz da (bis hierher schluckte 2>/dev/null den Bruch, und der Kopf erbte still nichts).
      erbe= kz=
      case "$vz" in *"voll: 0/"*)
        kk=$(node -e '
const { execFileSync } = require("child_process");
const a = process.argv[1];
let K = null; try { K = require(process.cwd() + "/scripts/ci-kopf.cjs"); } catch (e) {}
try {
if (K && K.kopfKetteLokal) console.log("inhalt " + K.kopfKette(a, K.kopfKetteLokal(a)).slice(1).join(" "));
else if (K && K.kopfKette) { const g = (...x) => execFileSync("git", x, { encoding: "utf8" }).trim(); const c = {};
for (let s = a, n = 0; s && n <= K.KETTE; n++) { const z = g("rev-list", "--parents", "-n", "1", s).split(" "); c[z[0]] = { sha: z[0], tree: { sha: g("rev-parse", z[0] + "^{tree}") }, parents: z.slice(1).map((sha) => ({ sha })) }; s = z.length === 2 ? z[1] : null; }
console.log("baum " + K.kopfKette(a, c).slice(1).join(" ")); }
else console.log("keiner");
} catch (e) { console.log("rot " + String((e && e.message) || e).split("\n")[0].slice(0, 160)); }' "$sha" 2>/dev/null </dev/null)
        bau=${kk%% *} kette=
        case "$bau" in
        inhalt) bt="kopfKetteLokal, der Wurzel-Baum ohne cloud-post"; kette=${kk#inhalt} ;;
        baum) bt="der alte Bau aus Baum-SHAs, der Haupt-Baum trägt kopfKetteLokal nicht"; kette=${kk#baum} ;;
        rot) kz="    kette: ROT — ${kk#rot }" ;;
        keiner) kz="    kette: ROT — scripts/ci-kopf.cjs des Haupt-Baums trägt keine kopfKette" ;;
        *) kz="    kette: ROT — der Richter antwortete nicht (${kk:-leer})" ;;
        esac
        for v in $kette; do
          for rid in $(curl -s -H "Authorization: Bearer $TOK" "$API/actions/workflows/check.yml/runs?head_sha=$v&per_page=20" | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let r=[];try{r=JSON.parse(s).workflow_runs||[];}catch(e){}console.log(r.filter(x=>x.conclusion==="success"&&["push","schedule","workflow_dispatch"].includes(x.event)).map(x=>x.id).join(" "));})'); do
            ez=$(voll_zahl "$rid")
            if echo "$ez" | grep -qE "^    voll: ([1-9][0-9]*)/\1$"; then
              vz=$ez
              erbe="    geerbt: vom leeren Vorfahr ${v:0:8} (Lauf $rid) — der Kopf ist sein Inhalt (Bau: $bt)"
              break 2
            fi
          done
        done ;;
      esac
      echo "$vz"
      [ -n "$erbe" ] && echo "$erbe"
      [ -n "$kz" ] && echo "$kz"
    fi
    if [ "$co" = failure ]; then
      curl -s -H "Authorization: Bearer $TOK" "$API/actions/runs/$id/jobs?per_page=100&filter=latest" | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);const f=(j.jobs||[]).filter(x=>x.conclusion==="failure");console.log("    rot ("+f.length+"/"+(j.jobs||[]).length+"): "+f.map(x=>x.name+" ["+((x.steps||[]).filter(s=>s.conclusion==="failure").map(s=>s.name).join(","))+"]").join(" · "));})'
    fi
  done < "$CT"
done
