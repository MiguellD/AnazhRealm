// runde.cjs — DAS GESETZ DER RUNDE (Koordinator 19.11.). Befund: seit dem 17.11. begann der Landungs-Dienst der OMEN an 25 main-Koepfen
// eine Liste von 54 Stationen, 0 von 25 liefen bis zum Ende (Median 5) — jeder neue main-Kopf brach die Liste ab (SPRUNG). Jetzt:
//   1 EIN Mess-Kopf je Runde in EINER Datei (zug/runde.txt im Zweig koordination): Kopf, Startzeit, Stand je Geraet. Jedes Geraet
//     faehrt seine ganze Liste an DIESEM Kopf zu Ende; die naechste Runde nimmt den main-Kopf des Moments, in dem alle Geraete durch
//     sind — so steht nach jeder Runde jede Station als Paar am SELBEN Kopf (die Karte 2 bucht daraus).
//   2 die Reihe folgt der erwarteten Aenderung (Koordinator 21.11., `reihe`): K1 beansprucht (juengste Anspruchs-Zeile zuerst, 23.11.) · K2 ohne Urteil · K3 GRUEN (K4 ROT anderes: seit 22.11. Schwanz)
//     | der SCHWANZ K5 ROT „Leser fehlt" · K6 ROT „Umfang nicht erzeugbar". Bleibt einem Geraet nur der Schwanz und ist main weiter als
//     der Runden-Kopf, TRAEGT sein rotes Urteil vom frueheren Kopf (Feld getragen).
//   2a DIE GETEILTE FRONT (Koordinator 22.11.; Runde 4: die GTX 21 von 246 nach 3,5 h, die Radeon „wartet 0/0“): beide Geraete teilen
//     EINE Front. Das zweite Geraet tritt ein, sobald das erste am Kopf eine Liste traegt (bis dahin wartet: kein Alarm) — seine Liste
//     ist der vordere Teil der Liste des ersten in UMGEKEHRTER Reihe, ohne Schwanz (`reihe --erst`). Eine Station ist fuer ein Geraet
//     offen, solange es am Kopf keinen Eintrag traegt UND das andere sie am Kopf nicht URTEILTE (`offen --anders`, seit 23.11. GRUEN
//     wie ROT: JEDE STATION EINMAL, die Buchung hebt mit EINEM Geraet); UNGEMESSEN des anderen ueberspringt nie (die zweite Chance).
//   3 frisches ROT an einer am vorigen Mess-Kopf gruenen Station: NUR diese Station wird ueber die Koepfe dazwischen halbiert
//     (`faelle` nennt sie, richter.sh --fall halbiert und nennt den Taeter-Kopf).
//   4 Halt, Weichen, Neustart: der Stand je Geraet steht in der Datei, die Liste ist eingefroren — es geht an derselben Station weiter.
//   5 ein Geraet ohne Fortschritt > 15 min in der Runde ist ALARM beim Namen (eine Zeile nach zug/erledigt.txt), nie stilles Warten.
// ZWEI GERAETE, EINE DATEI, KEIN MERGE: jedes Schreiben liest den frischen Stand von origin/koordination, ersetzt dort genau die eigene
// Zeile (oder oeffnet die Runde), baut den Commit mit commit-tree AUF diesem Stand und pusht; lehnt der Push ab (ein anderer schrieb
// dazwischen), beginnt es von vorn am neuen Stand. Es gibt nie einen Merge und nie einen Konflikt — dieselbe Klempnerei wie
// n0611/stufe/melde.cjs und richter-werk.cjs post.
// Verben (repo = ein Klon mit origin; Zeiten UTC):
//   lies <repo> <geraet> [--voll]           → "<n> <kopf40> <vorher40|-> <zustand> <liste>" oder "-" (keine Runde); --voll haengt
//                                           <getragen|-> an („-": eine Zeile von vor dem 21.11. — ihre Liste kennt keinen Schwanz)
//   anlegen <repo> <kopf40>                 die erste Runde aus dem Bestand (nur, wenn die Datei keine traegt)
//   stand <repo> <geraet> <kopf40> <zustand> [--erledigt n] [--gesamt n] [--station id] [--liste L] [--getragen n]   die eigene Zeile
//   durch <repo> <geraet> <kopf40> <main40> [--erledigt n] [--getragen n]  die eigene Liste ist durch (getragen: Schwanz-Stationen, deren
//                                           rotes Urteil vom frueheren Kopf steht); sind alle durch und main weiter: die naechste Runde
//   weiter <repo> <main40>                  sind alle durch und main weiter als der Kopf: die naechste Runde
//   zurueck <repo> <geraet> <kopf40> <grund>  eine Zeile ohne Station (durch/laeuft 0/0, liste |) zurück auf offen, mit Notiz
//   sprung <repo> <kopf40> <main40> <grund>   der Koordinator hebt die Runde auf main, gleich wie die Geraete stehen (auch ohne Liste);
//                                           Notiz und zug/erledigt.txt nennen Stand je Geraet und Grund (22.11.)
//   alarm <repo> <melder> [--geraet g --grund text]   jedes Geraet > RUNDE_ALARM_MIN ohne Fortschritt (oder: der genannte Grund,
//                                           sofort, z. B. die Platte): Feld alarm + EINE Zeile zug/erledigt.txt
//   reihe <messung-dir> <geraet> <liste> [--karte <json>] [--anspruch <datei>] [--erst <geraet> [--kopf <sha>]]
//                                           --karte: nur die Front der Karte 2 (je Leiter Sprosse heute, Glieder jede ungebuchte)
//                                           → "<K1–K3,..>|<Schwanz K4 K5 K6,..>" (stderr: die Klassen mit Zahl); mit --erst ist <liste>
//                                           der vordere Teil der Liste des ersten Geraets → dieselbe in UMGEKEHRTER Reihe + "|" (ohne
//                                           Schwanz), Exit 7 + "gesetz-leer", wenn sie keine Station traegt
//   offen <git-dir> <ref> <geraet> <kopf> <liste> [--anders <geraet2>]   → die Stationen der Liste ohne Eintrag in
//                                           messung/<kopf8>-<geraet>.json am ref; mit --anders auch ohne ROT von <geraet2> am selben Kopf
//                                           (dessen Mess-Datei am selben ref; stderr: die Zahl der uebersprungenen)
//   faelle <repo> <geraet> <vorher> <kopf> <liste>  → je Zeile eine Station: GRUEN am vorher, ROT am kopf (dieses Geraet)
//   paare <repo> [anzahl]                   Paare am selben Kopf aus den Mess-Dateien von punkte-maschine (je Kopf + Summe)
//   push-pfade <baum> <zweig> <geraet> <kopf|-> <botschaft>   die eigenen Geräte-Pfade nach <zweig>, OHNE Rebase (commit-tree, Retry)
//   ungepusht <baum> <zweig> <geraet> <seit-datei>            → "<n> <seit>": Messungen des Geräts, die der Ursprung nicht trägt
//   bestand <repo> <geraet>                 → der juengste Kopf der main-Linie, an dem das Geraet eine Mess-Datei traegt
//   selbsttest                              die Reihe an einer Attrappe der Mess-Dateien (ohne Gerät, ohne git): der WIDERSPRUCH DER
//                                           GERÄTE steht vorn, die Mutante ohne die Regel stellt ihn in den Schwanz (ROT am Täter)
"use strict";
const fs = require("fs"), cp = require("child_process"), os = require("os"), path = require("path");
const ZWEIG = process.env.RUNDE_ZWEIG || "koordination";
const DATEI = process.env.RUNDE_DATEI || "zug/runde.txt";
const ERLEDIGT = process.env.RUNDE_ERLEDIGT || "zug/erledigt.txt";
const PM_ZWEIG = process.env.RUNDE_PM_ZWEIG || "punkte-maschine";
const MDIR = "meisterkarte-quelle/punkte/messung";
const GERAETE = (process.env.RUNDE_GERAETE || "gtx radeon").split(/\s+/).filter(Boolean);
const ALARM_MIN = Number(process.env.RUNDE_ALARM_MIN || 15), WIEDER_MIN = Number(process.env.RUNDE_ALARM_WIEDER_MIN || 60);
const LANG_MIN = Number(process.env.REIHE_LANG_MIN || 10);
// die Mutante des Selbsttests (reihe ohne den WIDERSPRUCH DER GERÄTE): nur `selbsttest` setzt sie
const WIDERSPRUCH_AUS = process.env.RUNDE_MUTANTE === "widerspruch-aus";
const WER = { GIT_AUTHOR_NAME: "MiguellD", GIT_AUTHOR_EMAIL: "87209049+MiguellD@users.noreply.github.com",
    GIT_COMMITTER_NAME: "MiguellD", GIT_COMMITTER_EMAIL: "87209049+MiguellD@users.noreply.github.com" };
const jetzt = () => (process.env.RUNDE_JETZT ? new Date(process.env.RUNDE_JETZT) : new Date());
const iso = (d) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
const k8 = (s) => String(s || "-").slice(0, 8);
const schlaf = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const gitIn = (repo) => (a, o = {}) => cp.execFileSync("git", a, { cwd: repo, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], maxBuffer: 256e6, ...o }).trim();
const zeigIn = (repo) => (ref, pfad) => { try { return cp.execFileSync("git", ["show", ref + ":" + pfad], { cwd: repo, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 256e6 }).toString("utf8"); } catch { return null; } };
// DIE LISTE REIST ALS DATEI (Koordinator 19.11. 05:54; Fund beim Live-Gang: die gefaltete Tafel trägt 1 428 Stationen, als EIN Argument
// ≈ 50 000 Zeichen über der Windows-Grenze 32 767 — „node: Argument list too long“, die Runde stand `laeuft 0/0 … liste |`). Jedes
// Listen-Argument darf „@<datei>“ sein (Komma, „|“ oder eine Station je Zeile); der Dienst reicht seine Listen nur noch so.
const listenText = (s) => (String(s || "").startsWith("@") ? fs.readFileSync(String(s).slice(1), "utf8") : String(s || ""));
// GESETZ_LEER — die Liste, die das Gesetz der Liste (reihe --erst) ganz leerte: keine Station, und doch eine Liste (die Zeile darf
// „durch“ stehen, ohne als Listen-Bruch zu gelten); liste() zählt sie nie als Station
const GESETZ_LEER = "gesetz-leer";
const liste = (s) => listenText(s).split(/[,|\s]+/).map((x) => x.trim()).filter((x) => x && x !== "-" && x !== GESETZ_LEER);
const traegtListe = (e) => liste(e.liste).length > 0 || String(e.liste || "").replace(/\s+/g, "") === GESETZ_LEER;

// ── DIE DATEI ──
const KOPF = [
    "# zug/runde.txt — DAS GESETZ DER RUNDE (Koordinator 19.11.): EIN Mess-Kopf je Runde. Jedes Geraet faehrt seine ganze Liste an",
    "# DIESEM Kopf zu Ende (keine Landung loest sie ab); die naechste Runde nimmt den main-Kopf des Moments, in dem alle Geraete durch",
    "# sind. Geschrieben NUR von zug/dienst/runde.cjs (frischer Stand von origin/koordination, die eine Zeile ersetzt, commit-tree,",
    "# Push — lehnt er ab, von vorn; nie ein Merge). Von Hand nichts aendern. Je Runde und je Geraet EINE Zeile:",
    "# runde <n> kopf <sha40> start <iso> vorher <sha40|->",
    "# <geraet> <offen|wartet|laeuft|halt|weicht|durch> <erledigt>/<gesamt> station <id|-> fortschritt <iso> alarm <iso|-> liste <K1–K3,..>|<Schwanz,..> getragen <n>",
    "# DIE RUNDE FOLGT DER AENDERUNG (21.11.): die Liste ist NUR die Front der Karte 2 (je Leiter die Sprosse heute, Glieder jede ungebuchte). K1 beansprucht (zug/anspruch.txt) · K2 ohne Urteil · K3 GRUEN | Schwanz: K4 ROT anderes (22.11.: so viel wie noetig) ·",
    "# K5 ROT Leser fehlt · K6 ROT Umfang nicht erzeugbar. Bleibt nur der Schwanz und ist main weiter, traegt sein ROT vom frueheren Kopf",
    "# (getragen). DIE GETEILTE FRONT (22.11.): das zweite Geraet wartet (wartet: kein Alarm) nur, bis das erste am Kopf eine Liste traegt, und",
    "# faehrt dann deren vorderen Teil in UMGEKEHRTER Reihe; keines misst, was das andere am Kopf urteilte (GRUEN wie ROT, 23.11.; UNGEMESSEN zaehlt nicht).",
    "# Eine Zeile ohne „getragen“ stammt von vor dem 21.11.: ihre Liste heisst <ungebucht>|<gebucht gruen> und kennt keinen Schwanz.",
    "# notiz <iso> <text> — was die Runde wissen muss, z. B. eine Zeile, die nach einem Listen-Bruch neu gebaut wurde (fällt mit der Runde)",
];
function lies(text) {
    const r = { runde: null, g: {}, notizen: [] };
    for (const l of String(text || "").split(/\r?\n/)) {
        if (!l.trim() || l.startsWith("#")) continue;
        const w = l.trim().split(/\s+/);
        if (w[0] === "notiz") r.notizen.push(l.trim());
        else if (w[0] === "runde") r.runde = { n: Number(w[1]), kopf: w[3], start: w[5], vorher: w[7] || "-" };
        else if (GERAETE.includes(w[0])) {
            const [e, s] = String(w[2] || "0/0").split("/");
            // getragen (21.11.): die Zahl der Schwanz-Stationen, deren ROT vom frueheren Kopf steht — und die Marke der Liste „vorn|Schwanz“;
            // fehlt das Feld, ist es eine Zeile von vor dem 21.11. (null: <ungebucht>|<gebucht gruen>, kein Schwanz)
            r.g[w[0]] = { zustand: w[1], erledigt: Number(e) || 0, gesamt: Number(s) || 0, station: w[4] || "-", fortschritt: w[6] || "-", alarm: w[8] || "-", liste: w[10] || "-",
                getragen: w[11] === "getragen" ? Number(w[12]) || 0 : null };
        }
    }
    return r;
}
const leer = (zeit) => ({ zustand: "offen", erledigt: 0, gesamt: 0, station: "-", fortschritt: zeit, alarm: "-", liste: "-", getragen: null });
function text(r) {
    const z = [...KOPF];
    if (r.runde) {
        z.push(["runde", r.runde.n, "kopf", r.runde.kopf, "start", r.runde.start, "vorher", r.runde.vorher || "-"].join(" "));
        for (const g of GERAETE) {
            const e = r.g[g] || leer(r.runde.start);
            z.push([g, e.zustand, e.erledigt + "/" + e.gesamt, "station", e.station || "-", "fortschritt", e.fortschritt || "-", "alarm", e.alarm || "-", "liste", e.liste || "-", ...(e.getragen === null || e.getragen === undefined ? [] : ["getragen", e.getragen])].join(" "));
        }
        z.push(...(r.notizen || []));
    }
    return z.join("\n") + "\n";
}
// aendere <repo> <botschaft> <f> — EIN Schreiben: f(r) aendert r am frischen Stand (Rueckgabe false: nichts zu schreiben, sonst
// optional { zeile } = eine Zeile fuer zug/erledigt.txt im selben Commit). Lehnt der Push ab, beginnt es am neuen Stand von vorn.
function aendere(repo, botschaft, f) {
    const git = gitIn(repo), zeig = zeigIn(repo);
    const IDX = path.join(os.tmpdir(), "runde-index-" + process.pid + ".tmp"), env = { ...process.env, ...WER, GIT_INDEX_FILE: IDX };
    let fehler = "";
    for (let v = 1; v <= 10; v++) {
        try {
            git(["fetch", "-q", "origin", "+refs/heads/" + ZWEIG + ":refs/runde/koord"]);
            const basis = git(["rev-parse", "refs/runde/koord"]);
            const alt = zeig(basis, DATEI) || "";
            const r = lies(alt);
            const aus = f(r);
            if (aus === false) return { r, geschrieben: false };
            const neu = text(r);
            if (neu === alt && !(aus && aus.zeile)) return { r, geschrieben: false };
            fs.rmSync(IDX, { force: true });
            git(["read-tree", basis], { env });
            git(["update-index", "--add", "--cacheinfo", "100644," + git(["hash-object", "-w", "--no-filters", "--stdin"], { input: neu }) + "," + DATEI], { env });
            if (aus && aus.zeile) {
                let e = zeig(basis, ERLEDIGT) || "";
                const nl = e.includes("\r\n") ? "\r\n" : "\n";
                if (e && !e.endsWith("\n")) e += nl;
                const d = jetzt(), zw = (n) => String(n).padStart(2, "0");
                const stempel = d.getFullYear() + "-" + zw(d.getMonth() + 1) + "-" + zw(d.getDate()) + " " + zw(d.getHours()) + ":" + zw(d.getMinutes());
                git(["update-index", "--add", "--cacheinfo", "100644," + git(["hash-object", "-w", "--no-filters", "--stdin"], { input: e + stempel + " " + aus.zeile + nl }) + "," + ERLEDIGT], { env });
            }
            const c = git(["commit-tree", git(["write-tree"], { env }), "-p", basis, "-F", "-"], { env,
                input: botschaft.slice(0, 72) + " [skip ci]\n\n" + (aus && aus.zeile ? aus.zeile.slice(0, 400) + "\n\n" : "") + "Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n" });
            git(["push", "-q", "origin", c + ":refs/heads/" + ZWEIG]);
            fs.rmSync(IDX, { force: true });
            process.stderr.write("koordination " + c.slice(0, 8) + " " + botschaft.slice(0, 80) + "\n");
            return { r, geschrieben: true, commit: c };
        } catch (e) {
            fehler = String(e.message).split("\n")[0].slice(0, 200);
            // JEDER gescheiterte Versuch steht SOFORT im Protokoll (Koordinator 07:07: ein wiederholender Lauf darf von außen nie wie ein
            // arbeitender aussehen — der Rettungs-Lauf an der Radeon stand 05:59–07:03 ohne eine Zeile)
            process.stderr.write(new Date().toISOString() + " runde.cjs " + was + " Versuch " + v + "/10 gescheitert: " + fehler + "\n");
            schlaf(1000 + Math.floor(Math.random() * 4000) * Math.min(v, 4));
        }
    }
    fs.rmSync(IDX, { force: true });
    process.stderr.write("RUNDE: Schreiben scheiterte 10x (" + fehler + ")\n");
    process.exit(1);
}
// „durch“ zählt nur mit einer Liste (19.11. 06:17: „gtx durch 0/0 … liste |“ nach dem Listen-Bruch hätte sonst die nächste Runde geöffnet)
const alleDurch = (r) => GERAETE.every((g) => r.g[g] && r.g[g].zustand === "durch" && traegtListe(r.g[g]));
function oeffne(r, main) { // die naechste Runde am main-Kopf des Moments
    const z = iso(jetzt());
    r.runde = { n: (r.runde ? r.runde.n : 0) + 1, kopf: main, start: z, vorher: r.runde ? r.runde.kopf : "-" };
    for (const g of GERAETE) r.g[g] = leer(z);
    r.notizen = [];
}

// ── DIE MESS-DATEIEN ── ein Urteil je Station: GRUEN, ROT oder keins (ungemessen; ein juengeres UNGEMESSEN schlaegt den aelteren Lauf)
// EIN START IST NIE EIN URTEIL (21.11.; 31ea3847: GTX 162, Radeon 79 Einträge „Start: spawn ENAMETOOLONG“ unter m.je, das Gesetz (2)
// der Reihe warf sie als „ROT am Vor-Kopf ohne Berührung“ aus jeder nächsten Runde): ein Eintrag „Start: …“ unter m.je stammt vom Läufer
// vor dem 21.11. — er liest sich wie punkte.cjs startOffen ihn ablegt: UNGEMESSEN mit `offen` 1, nie GRÜN oder ROT
const startFehler = (v) => !!v && !v.ungemessen && /^Start: /.test(String(v.grund || ""));
function urteil(m, s) {
    const v = ((m && m.je) || {})[s], u = ((m && m.ungemessen) || {})[s];
    if (!v || v.ungemessen || startFehler(v)) return null;
    if (u && String(u.zeit || "") >= String(v.zeit || "")) return null;
    return v.gruen ? "GRUEN" : "ROT";
}
// EIN EINTRAG, DEN DER APPARAT NIE ERREICHTE, IST KEINE MESSUNG (Koordinator 21.11.; die Radeon hieß am 31ea3847 „durch 1428/1428“ mit
// 219 Urteilen und 1 212 ungemessenen Stationen — das Verb `offen` zählte jeden Eintrag unter `ungemessen` als gemessen, die Liste war
// leer, die Runde „durch“): der EINE Schreiber der Mess-Datei (punkte.cjs `eintragen`) zählt an einem Eintrag „— offen, UNGEMESSEN“
// oder „Läufer starb“ ohne die laufende Probe das Feld `offen` (seine Versuche an diesem Kopf). Solange es unter OFFEN_MAX steht,
// bleibt die Station in der Liste und fährt in der nächsten Fahrt nach; mit OFFEN_MAX Versuchen steht sie beim Grund (die Runde
// endet, nie eine Schleife). Ein Eintrag ohne das Feld — beim Namen der Station (Frist, Grund-Stellung, Täter-Ort, Urteils-Zeile)
// oder aus der Zeit vor dem Feld — steht wie bisher.
const OFFEN_MAX = 3;
const apparatOffen = (u) => !!u && u.offen >= 1 && u.offen < OFFEN_MAX;
const hatEintrag = (m, s) => {
    const u = ((m && m.ungemessen) || {})[s], v = ((m && m.je) || {})[s];
    if (startFehler(v)) return !!(u && String(u.zeit || "") >= String(v.zeit || "") && !apparatOffen(u));
    return !!(v || (u && !apparatOffen(u)));
};

const [was, ...arg] = process.argv.slice(2);
const opt = (n) => { const i = arg.indexOf("--" + n); return i < 0 ? null : arg[i + 1]; };
if (was === "lies") {
    const [repo, g] = arg;
    if (!process.env.RUNDE_OHNE_FETCH) gitIn(repo)(["fetch", "-q", "origin", "+refs/heads/" + ZWEIG + ":refs/runde/koord"]);
    const r = lies(zeigIn(repo)("refs/runde/koord", DATEI));
    if (!r.runde) { console.log("-"); process.exit(0); }
    const e = r.g[g] || leer(r.runde.start);
    console.log([r.runde.n, r.runde.kopf, r.runde.vorher || "-", e.zustand, e.liste || "-", ...(arg.includes("--voll") ? [e.getragen === null ? "-" : e.getragen] : [])].join(" "));
} else if (was === "anlegen") {
    const [repo, kopf] = arg;
    if (!/^[0-9a-f]{40}$/.test(String(kopf))) { console.error("anlegen: <kopf40> fehlt"); process.exit(2); }
    const { r } = aendere(repo, "Runde 1 am " + k8(kopf) + ": aus dem Bestand angelegt", (r) => { if (r.runde) return false; oeffne(r, kopf); return {}; });
    console.log("runde " + r.runde.n + " " + r.runde.kopf);
} else if (was === "stand") {
    const [repo, g, kopf, zustand] = arg;
    let anders = false;
    // STILLES SCHEITERN (19.11. 05:54, `laeuft 0/0 … liste |`): eine Liste ohne Station wird nie geschrieben — ROT beim Namen, Exit 5
    if (opt("liste") !== null && !traegtListe({ liste: listenText(opt("liste")) })) { console.log("LEERE LISTE — die Zeile " + g + " bleibt, wie sie ist"); process.exit(5); }
    const { r } = aendere(repo, "Runde " + g + ": " + zustand + (opt("erledigt") ? " " + opt("erledigt") + "/" + (opt("gesamt") || "?") : "") + " am " + k8(kopf), (r) => {
        if (!r.runde || r.runde.kopf !== kopf) { anders = true; return false; }
        const e = r.g[g] || leer(r.runde.start), z = iso(jetzt());
        const vor = e.erledigt, vorG = e.gesamt;
        const vorZ = e.zustand;
        e.zustand = zustand;
        if (opt("erledigt") !== null) e.erledigt = Number(opt("erledigt"));
        if (opt("gesamt") !== null) e.gesamt = Number(opt("gesamt"));
        if (opt("station") !== null) e.station = opt("station") || "-";
        if (opt("liste") !== null) {
            // DER LISTEN-BRUCH (19.11. 05:53, `laeuft 0/0 … liste |`): trug die Zeile eine Liste OHNE Station, während sie schon lief, ist
            // die leere Fahrt keine Messung — die Runde sagt es selbst in einer Notiz, sobald die Zeile ihre Liste neu bekommt
            if (vorZ !== "offen" && e.liste !== "-" && !liste(e.liste).length)
                (r.notizen = r.notizen || []).push("notiz " + z + " " + g + " neu gebaut nach Listen-Bruch: vorher " + vorZ + " " + vor + "/" + vorG + " liste " + e.liste + " seit " + e.fortschritt + " — die leere Fahrt gilt nicht als gemessen");
            e.liste = listenText(opt("liste")).replace(/\s+/g, "") || "-";
        }
        if (opt("getragen") !== null) e.getragen = Number(opt("getragen")) || 0;
        // FORTSCHRITT: eine Station mehr, der Beginn der Liste (auch nach dem Warten), das Ende — nie das blosse Halten oder Weichen
        if (e.erledigt > vor || (zustand === "laeuft" && (vorZ === "offen" || vorZ === "wartet")) || zustand === "durch") { e.fortschritt = z; e.alarm = "-"; }
        r.g[g] = e;
        return {};
    });
    if (anders) { console.log("ANDERE RUNDE " + (r.runde ? r.runde.n + " " + r.runde.kopf : "-")); process.exit(4); }
    console.log("ok");
} else if (was === "durch" || was === "weiter") {
    const [repo, g, kopf, main] = was === "durch" ? arg : [arg[0], null, null, arg[1]];
    let anders = false, leerDurch = false;
    const { r } = aendere(repo, was === "durch" ? "Runde " + g + ": durch am " + k8(kopf) : "Runde weiter: main " + k8(main), (r) => {
        if (!r.runde) return false;
        let neu = false;
        if (g) {
            if (r.runde.kopf !== kopf) { anders = true; return false; }
            const e = r.g[g] || leer(r.runde.start);
            if (!traegtListe(e)) { leerDurch = true; return false; } // nie „durch“ ohne Liste (LISTE ROT beim Rufer)
            if (e.zustand !== "durch") { e.zustand = "durch"; e.station = "-"; e.fortschritt = iso(jetzt()); e.alarm = "-"; r.g[g] = e; neu = true; }
            if (opt("erledigt") !== null && e.erledigt !== Number(opt("erledigt"))) { e.erledigt = Number(opt("erledigt")); neu = true; } // der Endstand: was am Kopf einen Eintrag trägt
            if (opt("getragen") !== null && e.getragen !== Number(opt("getragen"))) { e.getragen = Number(opt("getragen")) || 0; neu = true; } // der Schwanz, dessen ROT vom früheren Kopf steht
        }
        if (alleDurch(r) && /^[0-9a-f]{40}$/.test(String(main)) && main !== r.runde.kopf) { oeffne(r, main); neu = true; }
        return neu ? {} : false;
    });
    if (anders) { console.log("ANDERE RUNDE " + r.runde.n + " " + r.runde.kopf); process.exit(4); }
    if (leerDurch) { console.log("LEERE LISTE — " + g + " wird nie „durch“ ohne Station (die Zeile bleibt)"); process.exit(5); }
    if (!r.runde) { console.log("-"); process.exit(0); }
    console.log(alleDurch(r) ? "ALLE DURCH runde " + r.runde.n + " " + r.runde.kopf + " (main nicht weiter)" : "runde " + r.runde.n + " " + r.runde.kopf + " " + GERAETE.map((x) => x + "=" + ((r.g[x] || {}).zustand || "offen")).join(" "));
} else if (was === "sprung") {
    // sprung <repo> <kopf40> <main40> <grund> — DER SPRUNG DES KOORDINATORS (22.11.): die Runde am <kopf40> endet, die naechste oeffnet
    // am <main40>, gleich in welchem Zustand die Geraete stehen (auch ohne Liste — dort verweigert „durch“). Fuer den Fall, dass der
    // Wert HINTER dem Runden-Kopf liegt (Ansprueche gelandeter Zuege, ein Schnitt am Mess-Apparat). Die Notiz und die Zeile in
    // zug/erledigt.txt nennen den Stand je Geraet und den Grund; Urteile des alten Kopfs bleiben als Mess-Datei stehen.
    const [repo, kopf, main, grund] = arg;
    if (!/^[0-9a-f]{40}$/.test(String(kopf)) || !/^[0-9a-f]{40}$/.test(String(main)) || !String(grund || "").trim()) { console.error("sprung: <repo> <kopf40> <main40> <grund> — alle vier, der Grund nie leer"); process.exit(2); }
    let tat = "";
    aendere(repo, "Runde SPRUNG " + k8(kopf) + " → " + k8(main), (r) => {
        if (!r.runde || r.runde.kopf !== kopf) { tat = "ANDERE RUNDE " + (r.runde ? r.runde.n + " " + r.runde.kopf : "-"); return false; }
        if (main === kopf) { tat = "main ist nicht weiter"; return false; }
        const n = r.runde.n, g1 = String(grund).replace(/\s+/g, " ").trim();
        const stand = GERAETE.map((g) => { const e = r.g[g] || leer(r.runde.start); return g + " " + e.zustand + " " + e.erledigt + "/" + e.gesamt; }).join(", ");
        oeffne(r, main);
        r.notizen.push("notiz " + iso(jetzt()) + " Runde " + n + " am " + k8(kopf) + " sprang auf " + k8(main) + " (" + stand + "): " + g1);
        tat = "runde " + r.runde.n + " " + r.runde.kopf;
        return { zeile: "RUNDE " + n + " SPRUNG am " + k8(kopf) + " → Runde " + (n + 1) + " am " + k8(main) + " (" + stand + "): " + g1 };
    });
    console.log(tat);
    if (/^ANDERE|^main/.test(tat)) process.exit(4);
} else if (was === "zurueck") {
    // zurueck <repo> <geraet> <kopf40> <grund> — eine Zeile, die OHNE Station „durch“ oder „laeuft“ steht (der Listen-Bruch 19.11. 05:53:
    // „gtx durch 0/0 am f68dbf09“), zurück auf offen; die Notiz-Zeile nennt den Grund. Eine Zeile MIT Liste fasst das Verb nie an.
    const [repo, g, kopf, grund] = arg;
    let tat = "";
    aendere(repo, "Runde " + g + ": zurück auf offen am " + k8(kopf), (r) => {
        if (!r.runde || r.runde.kopf !== kopf) { tat = "ANDERE RUNDE"; return false; }
        const e = r.g[g] || leer(r.runde.start);
        if (traegtListe(e)) { tat = "hat eine Liste — unverändert"; return false; }
        if (e.zustand === "offen") { tat = "schon offen"; return false; }
        const z = iso(jetzt());
        (r.notizen = r.notizen || []).push("notiz " + z + " " + g + " " + (grund || "zurück auf offen") + " (vorher " + e.zustand + " " + e.erledigt + "/" + e.gesamt + " liste " + e.liste + ")");
        r.g[g] = leer(z);
        tat = "zurück auf offen";
        return {};
    });
    console.log(g + ": " + tat);
} else if (was === "alarm") {
    const [repo, melder] = arg;
    const zeilen = [];
    aendere(repo, "Runde ALARM", (r) => {
        zeilen.length = 0;
        if (!r.runde) return false;
        const t = jetzt().getTime();
        // DER GRUND-ALARM (Koordinator 19.11. 02:35): ein Halt mit Grund (Platte unter PLATTE_UNTEN) ist derselbe Alarm wie „ohne
        // Fortschritt“, sofort und mit Zahl — nie ein stilles Stehen; gegen Wiederholung sperrt der Rufer je Grund (platte_alarm)
        if (opt("grund") !== null) {
            const g = opt("geraet"), e = r.g[g] || leer(r.runde.start);
            e.alarm = iso(jetzt());
            r.g[g] = e;
            zeilen.push("RUNDE " + r.runde.n + " ALARM " + g + ": " + opt("grund") + " — " + e.zustand + " " + e.erledigt + "/" + e.gesamt + ", Station " + e.station + ", Kopf " + k8(r.runde.kopf) + "; die Runde setzt an derselben Station fort — gesehen von " + (melder || "?"));
            return { zeile: zeilen.join(" · ") };
        }
        for (const g of GERAETE) {
            const e = r.g[g] || leer(r.runde.start);
            // WARTET NACH DEM GESETZ (22.11., die geteilte Front): das zweite Gerät, das auf die Liste des ersten am Kopf wartet, steht
            // nicht still — kein Alarm
            if (e.zustand === "durch" || e.zustand === "wartet") continue;
            const seit = Date.parse(e.fortschritt === "-" ? r.runde.start : e.fortschritt), min = Math.floor((t - seit) / 60000);
            if (!(min > ALARM_MIN)) continue;
            if (e.alarm !== "-" && t - Date.parse(e.alarm) < WIEDER_MIN * 60000) continue;
            e.alarm = iso(jetzt());
            r.g[g] = e;
            zeilen.push("RUNDE " + r.runde.n + " ALARM " + g + ": ohne Fortschritt seit " + min + " min (" + e.zustand + ", " + e.erledigt + "/" + e.gesamt + ", Station " + e.station + ", Kopf " + k8(r.runde.kopf) + ") — gesehen von " + (melder || "?"));
        }
        return zeilen.length ? { zeile: zeilen.join(" · ") } : false;
    });
    for (const z of zeilen) console.log(z);
} else if (was === "reihe") {
    // 2 DIE REIHE FOLGT DER ERWARTETEN ÄNDERUNG (Koordinator 21.11.; Befund am 31ea3847: die GTX brauchte 32 h für 1 428 Stationen, 8,0 h
    // davon für 521 ROT „Umfang nicht erzeugbar“ und 0,7 h für 132 ROT „Leser fehlt“ — Urteile, die am Gerät nicht hängen und sich ohne
    // die fehlende Fähigkeit nie ändern; 34 GRÜN kosteten 1,1 h). EINE Quelle für beide Geräte. Jede Station bekommt eine Klasse aus
    // ihrem JÜNGSTEN Eintrag über ALLE Köpfe (dieses Gerät; trägt es keinen, das andere) — nie nur aus dem Vor-Kopf, sonst käme eine
    // getragene Station in der nächsten Runde als „ohne Urteil“ zurück:
    //   K1 beansprucht (--anspruch <datei>: zug/anspruch.txt, je Zeile „<zweig> <id,id,…>“, # Kommentar; fehlt sie: leer)
    //   K2 ohne Urteil (nie gemessen, neu in der Tafel, jüngster Eintrag UNGEMESSEN) · K3 jüngstes Urteil GRÜN · K4 ROT, anderes (seit 22.11. im SCHWANZ, zuerst)
    //   K5 ROT „Leser fehlt“ · K6 ROT „Umfang nicht erzeugbar“ — der SCHWANZ (die Fähigkeit fehlt; „Leser fehlt: Umfang nicht erzeugbar“
    //   ist K6: zuerst wird nach dem Umfang gefragt)
    // Innerhalb einer Klasse die Reihe von n0611/stufe/reihe.cjs (12.11.): wer am längsten ohne Messung auf diesem Gerät ist zuerst, wessen
    // letzte Fahrt LANG_MIN oder länger lief zuletzt. Ausgabe „<K1–K3>|<K5 K6>“ — die Grenze reist in der eingefrorenen Liste mit, die
    // Dienste fahren vorn und Schwanz in getrennten Fahrten (kein Teil mischt beide).
    // DAS ZWEITE GERÄT — DIE GETEILTE FRONT (Koordinator 22.11.; Befund Runde 4 am 6066c757: die GTX 21 von 246 nach 3,5 h, 6 von 21
    // Urteilen GRÜN, die Radeon stand die ganze Zeit „wartet 0/0“ — das Gesetz vom 21.11. ließ sie erst nach dem vorderen Teil der GTX
    // ein und nur an deren GRÜN; die nie beurteilten Sprossen vorn sind die Punkte, und sie maß sie nicht). Mit --erst <geraet> ist
    // <liste> der vordere Teil (vor dem „|“) der eingefrorenen Liste des ersten Geräts am Kopf: das zweite fährt sie in UMGEKEHRTER
    // Reihe, ohne Schwanz — beide Geräte arbeiten von zwei Enden auf EINE Front zu; was das andere am Kopf ROT urteilt, fällt in
    // `offen --anders` (die eine Regel für beide). Keine Mess-Datei des ersten ist nötig; trägt der vordere Teil keine Station:
    // GESETZ_LEER (Exit 7) — durch ohne Fahrt.
    const [dir, g, l] = arg;
    let ids = liste(l);
    if (opt("erst")) {
        const um = ids.slice().reverse();
        process.stderr.write("Gesetz der Liste " + g + (opt("kopf") ? " am " + k8(opt("kopf")) : "") + ": der vordere Teil von " + opt("erst") + " " + ids.length + " → " + um.length + " in umgekehrter Reihe\n");
        if (!um.length) { console.log(GESETZ_LEER); process.exit(7); }
        console.log(um.join(",") + "|");
        process.exit(0);
    }
    const anders = g === "gtx" ? "radeon" : "gtx";
    const juengst = { gtx: {}, radeon: {} }, letzt = {};
    let dateien = [];
    try { dateien = fs.readdirSync(dir).filter((f) => /^[0-9a-f]{8}-(gtx|radeon)\.json$/.test(f)); } catch { /* ohne Baum: alle ohne Urteil */ }
    const drinIds = new Set(ids);
    for (const f of dateien) {
        let m;
        try { m = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { continue; }
        const gg = f.slice(9, -5), J = juengst[gg];
        for (const [o, ung] of [[m.je || {}, false], [m.ungemessen || {}, true]])
            for (const [id, e] of Object.entries(o)) {
                if (!drinIds.has(id)) continue;
                const z = String((e && e.zeit) || m.zeit || ""), u = ung || !e || !!e.ungemessen || startFehler(e);
                // ein jüngeres UNGEMESSEN schlägt den älteren Lauf, bei gleicher Zeit auch (wie urteil())
                if (!J[id] || z > J[id].z || (z === J[id].z && u)) J[id] = { z, u, e };
                if (gg === g && (!letzt[id] || z > letzt[id].z)) letzt[id] = { z, min: Number(e && e.minuten) || 0 };
            }
    }
    const anspruch = new Set(), jeZweig = new Map(), stelle = new Map();
    if (opt("anspruch")) {
        let t = "";
        try { t = fs.readFileSync(opt("anspruch"), "utf8"); } catch { /* fehlt die Datei: leer */ }
        // „#“ beginnt einen Kommentar nur am Anfang eines Worts — die Stationen tragen ihn im Namen („…#2“); EIN Anspruch je Zweig.
        // Die STELLE je Sprosse (23.11.): ihre jüngste Zeile n (die Datei wächst nach unten) und ihr Platz p in ihr — K1 ordnet danach
        t.split(/\r?\n/).forEach((z, n) => { const w = z.trim().split(/\s+/), k = w.findIndex((x) => x.startsWith("#")), v = k < 0 ? w : w.slice(0, k); if (v.length >= 2) { if (!jeZweig.has(v[0])) jeZweig.set(v[0], new Set()); v.slice(1).join(",").split(",").filter(Boolean).forEach((id, p) => { jeZweig.get(v[0]).add(id); stelle.set(id, { n, p }); }); } });
    }
    // 0 DIE FRONT DER KARTE 2 (Koordinator 21.11. 15:45; vision/buche-2.cjs zählt je Leiter nur die lückenlose Folge von unten, bei
    // „glieder“ jede Sprosse für sich): mit --karte <vision/meisterkarte-2.json> steht in der Liste NUR, was beim nächsten Buchen zählen
    // kann — je Leiter die Sprosse am Index heute, bei Glieder-Leitern jede nicht in heuteSprossen. Eine Sprosse HINTER der Front tritt
    // nur ein, wenn EIN Anspruch (ein Zweig in zug/anspruch.txt) sie nennt und jede ungebuchte Sprosse unter ihr mit (dann K1); sonst
    // tritt sie erst ein, wenn ihre Leiter bis zu ihr gebucht ist. Station = "karte2." + id + "#" + nr. Ohne --karte: die ganze Liste,
    // jeder Anspruch K1. Unlesbare Karte: Exit 6 beim Namen (nie still die ganze Tafel).
    const front = (k) => {
        const F = new Set(), K1 = new Set();
        let hinter = 0;
        for (const L of k.gruppen.flatMap((gr) => gr.kriterien || [])) {
            const sp = (L.sprossen || []).map((x) => "karte2." + L.id + "#" + x.nr);
            if (L.zaehlung === "glieder") { const da = new Set((L.heuteSprossen || []).map((nr) => "karte2." + L.id + "#" + nr)); for (const id of sp) if (!da.has(id)) F.add(id); continue; }
            const h = Number(L.heute) || 0;
            if (h >= sp.length) continue;
            F.add(sp[h]);
            hinter += sp.length - h - 1;
            for (const A of jeZweig.values()) for (let i = h; i < sp.length && A.has(sp[i]); i++) { F.add(sp[i]); K1.add(sp[i]); }
        }
        return { F, K1, hinter };
    };
    if (opt("karte")) {
        let k;
        try { k = JSON.parse(fs.readFileSync(opt("karte"), "utf8")); if (!Array.isArray(k.gruppen)) throw new Error("ohne gruppen"); } catch (e) { console.error("reihe: die Front ohne lesbare Karte (--karte " + opt("karte") + "): " + String(e.message).slice(0, 120)); process.exit(6); }
        const { F, K1, hinter } = front(k), vor = ids.length;
        ids = ids.filter((id) => F.has(id));
        for (const id of K1) anspruch.add(id);
        // eine beanspruchte Sprosse IN der Front (auch Glieder) ist K1, eine dahinter nur über die lückenlose Folge oben
        for (const A of jeZweig.values()) for (const id of A) if (F.has(id)) anspruch.add(id);
        process.stderr.write("Front der Karte 2: " + F.size + " Sprossen (" + hinter + " dahinter) · von der Liste " + vor + " → " + ids.length + "\n");
    } else for (const A of jeZweig.values()) for (const id of A) anspruch.add(id);
    const SCHWANZ = { K5: /Leser fehlt/, K6: /Umfang nicht erzeugbar/ };
    // DER WIDERSPRUCH DER GERÄTE (24.11.; Befund an der Front am 1feab29c: erleben.sinne.signale#1 und same.physik.tragen#1 standen
    // seit 20.11. mit GTX ROT am 31ea3847 im SCHWANZ, die Radeon urteilte am 21.11. am c445936d GRÜN — die Karte bucht erst an beiden
    // Geräten, und kein Lauf fragte die GTX je wieder): ein ROT dieses Geräts, dem das ANDERE Gerät danach GRÜN widersprach, ist kein
    // bekanntes ROT, sondern ein Urteil, das am heutigen Kopf fehlt — K2 (vorn), nie K4. Leser: die Reihe beider Dienste (radeon-dienst.sh,
    // landung-dienst.sh); Selbsttest: `node runde.cjs selbsttest` (die Mutante ohne diese Regel stellt den Fall in den Schwanz).
    const widerspruch = (id) => { const x = juengst[g][id], y = juengst[anders][id]; return !WIDERSPRUCH_AUS && !!x && !x.u && !x.e.gruen && !!y && !y.u && !!y.e.gruen && y.z > x.z; };
    const klasse = (id) => { if (anspruch.has(id)) return "K1"; const x = juengst[g][id] || juengst[anders][id]; if (!x || x.u) return "K2"; if (x.e.gruen) return "K3"; if (widerspruch(id)) return "K2"; const t = String(x.e.grund || x.e.zahl || ""); return SCHWANZ.K6.test(t) ? "K6" : SCHWANZ.K5.test(t) ? "K5" : "K4"; };
    const lang = (id) => (letzt[id] && letzt[id].min >= LANG_MIN ? 1 : 0);
    const ord = (xs) => xs.map((id, i) => ({ id, i })).sort((a, b) => lang(a.id) - lang(b.id) || ((letzt[a.id] || {}).z || "").localeCompare((letzt[b.id] || {}).z || "") || a.i - b.i).map((x) => x.id);
    const je = { K1: [], K2: [], K3: [], K4: [], K5: [], K6: [] };
    for (const id of ids) je[klasse(id)].push(id);
    // SO VIEL WIE NÖTIG (Koordinator 22.11., Wort des Schöpfers: „so viel messen wie nötig, nicht wie möglich“; Bilanz der 12 h davor:
    // Stations-Zeit GTX 21 min gegen 1 340 min Karten-Zeit der CI, und in der Liste der Runde 4 standen 56 von 179 Stationen vorn als
    // Wiederholung eines bekannten ROT): K4 — ROT aus anderem Grund, von keiner Landung beansprucht — steht im SCHWANZ, vor K5 und K6.
    // Vorn bleibt, was ein Urteil braucht: K1 beansprucht · K2 nie beurteilt · K3 GRÜN und ungebucht (der Preis fehlt oder ist offen).
    // K1 IN DER REIHE DER LANDUNGEN (Koordinator 23.11. 03:50; Befund Runde 9 am ddaf883d: die jüngste Landung z682 beanspruchte
    // mensch.menge.bevoelkerung#1, die Reihe stellte sie auf Platz 23 von 23 K1, ≈ 75 min hinter 21 älteren Sprossen — sie war die
    // zuletzt gemessene): K1 ordnet nach der STELLE, die jüngste Anspruchs-Zeile zuerst, in einer Zeile deren Reihe; ord („am längsten
    // nicht gemessen“) entscheidet nur bei Gleichstand. Eine Sprosse, die die Karte schon als Punkt trägt (heute ≥ Nummer), steht nie in
    // K1: sie liegt nicht in der Front (oben ids.filter, die eine Stelle) — am 23.11. 7 von 34 Anspruchs-Einträgen.
    const k1 = (xs) => ord(xs).map((id, i) => ({ id, i, s: stelle.get(id) })).sort((a, b) => b.s.n - a.s.n || a.s.p - b.s.p || a.i - b.i).map((x) => x.id);
    const vorn = [...k1(je.K1), ...ord(je.K2), ...ord(je.K3)], schwanz = [...ord(je.K4), ...ord(je.K5), ...ord(je.K6)];
    process.stderr.write("Reihe " + g + ": " + Object.entries(je).map(([k, v]) => k + " " + v.length).join(" · ") + " → vorn " + vorn.length + " | Schwanz " + schwanz.length + "\n");
    console.log(vorn.join(",") + "|" + schwanz.join(","));
} else if (was === "kappe") {
    // kappe <liste|@datei> <zeichen> → der Anfang der Liste, Komma-getrennt höchstens <zeichen> Zeichen (mindestens eine Station): der Teil,
    // der als `--nur` an punkte.cjs reisen darf (radeon-dienst.sh); der Rest fährt in der nächsten Fahrt derselben Runde
    const [l, zm] = arg;
    const ids = liste(l), max = Number(zm || 8000), aus = [];
    let n = 0;
    for (const id of ids) { if (aus.length && n + id.length + 1 > max) break; aus.push(id); n += id.length + 1; }
    console.log(aus.join(","));
} else if (was === "teile") {
    // DIE WURZEL DER FAHRT-ZEIT (Koordinator 19.11. 03:30): Stationen EINER Linse fahren in EINER Sitzung. Bis hier fuhr die OMEN je Station
    // eine eigene Sitzung (kandidat.sh EINZELN=1): am b7ed8419 42 Stationen in 247 min START→GEPUSHT, im Mittel 5,9 min je Station —
    // davon ≥ 252 s je Sitzung Boot, Welt, CPU-Ruhe und Push (247 min − Σ Deckel 4 219 s der 36 Läufe, verteilt auf 42 Sitzungen).
    // Jetzt: die Läufe der Maschine (`punkte.cjs eichtafel --geraet <g>`: je Zeile die Stationen EINES Laufs, Zwillinge mit „+“, und sein
    // Deckel) werden in der Reihe der Liste (die Klassen der Reihe, K1 zuerst) zu Teilen gepackt, je Teil Σ Deckel ≤ <budget> (Vorgabe FAHRT_MAX_S −
    // Boot = 1 740 s, die Teil-Größe der Maschine selbst); ein Lauf wird nie geteilt; ein Lauf über dem Budget ist ein eigener Teil.
    // Eine Station ohne Zeile in der Tafel fährt allein (ihr Fehler trifft nur sie). Aufruf: teile <eichtafel-datei> <liste> [budget]
    // → "a,b;c;d,e" (";" trennt Teile, Reihe der Liste); stderr: Teile, Läufe, Σ Deckel.
    const [datei, l, b, zm] = arg;
    const budget = Number(b || 1740);
    // je Teil höchstens <zeichen> (Vorgabe 8 000) Zeichen Stationsnamen: der Teil reist als `--nur a,b,c` (punkte.cjs) und NUR (Umgebung)
    // — er bleibt so immer weit unter der Windows-Grenze, gleich wie viele kurze Läufe in das Deckel-Budget passen
    const zeichen = Number(zm || 8000);
    const lauf = {};
    for (const z of String(fs.existsSync(datei) ? fs.readFileSync(datei, "utf8") : "").split(/\r?\n/)) {
        const m = z.match(/^\s+(\S+) · Deckel (\d+) s/);
        if (m) for (const id of m[1].split("+")) lauf[id] = { ids: m[1].split("+"), d: Number(m[2]) };
    }
    const ids = liste(String(l || "").replace("|", ","));
    const drin = new Set(ids), gesehen = new Set(), teile = [], allein = [];
    let cur = [], sum = 0, laeufe = 0, summe = 0;
    for (const id of ids) {
        const L = lauf[id];
        if (!L) { allein.push(id); if (cur.length) { teile.push(cur); cur = []; sum = 0; } teile.push([id]); continue; }
        const k = L.ids.join("+");
        if (gesehen.has(k)) continue;
        gesehen.add(k);
        const glieder = L.ids.filter((x) => drin.has(x));
        if (cur.length && (sum + L.d > budget || cur.concat(glieder).join(",").length > zeichen)) { teile.push(cur); cur = []; sum = 0; }
        cur.push(...glieder);
        sum += L.d; laeufe++; summe += L.d;
    }
    if (cur.length) teile.push(cur);
    process.stderr.write("Teile: " + ids.length + " Stationen in " + laeufe + " Läufen (Σ Deckel " + summe + " s) → " + teile.length + " Sitzungen je ≤ " + budget + " s" + (allein.length ? " · ohne Lauf in der Tafel, je allein: " + allein.join(" ") : "") + "\n");
    console.log(teile.map((t) => t.join(",")).join(";"));
} else if (was === "offen") {
    const [dir, ref, g, kopf, l] = arg;
    // ref „-“: die Mess-Datei im Arbeitsbaum (kandidat.sh nach einer gefallenen Sitzung: was sie fertig maß, steht dort; an der OMEN
    // stellt pm-stand.cjs den Baum je Takt des Dienstes und zu Beginn jeder Sitzung auf origin/punkte-maschine)
    const lade = (gg) => {
        const rel = MDIR + "/" + k8(kopf) + "-" + gg + ".json";
        try { return JSON.parse((ref === "-" ? (() => { try { return fs.readFileSync(path.join(dir, rel), "utf8"); } catch { return null; } })() : zeigIn(dir)(ref, rel)) || "null"); } catch { return null; }
    };
    const m = lade(g) || {};
    // DIE GETEILTE FRONT (Koordinator 22.11.): mit --anders <geraet2> ist eine Station nur offen, wenn das andere Gerät sie am SELBEN Kopf
    // nicht URTEILTE — GRÜN oder ROT in der Lesart von urteil() (kein UNGEMESSEN, kein Start-Fehler, kein jüngeres UNGEMESSEN darüber).
    // JEDE STATION EINMAL (Koordinator 23.11., Schöpfer: „wir messen soviel wie nötig, nicht wie möglich“; die Buchung hebt seit 18.11.
    // mit EINEM Gerät, buche-2 Z7 — das GRÜN des zweiten war ein Paar, das keine Sprosse hebt): bis heute übersprang nur ROT, das zweite
    // Gerät maß jedes GRÜN des ersten nach. UNGEMESSEN überspringt nie (die zweite Chance am anderen Gerät); fehlt seine Mess-Datei,
    // überspringt nichts. Seine Datei liest offen am selben Ort wie die eigene (ref oder Baum) — kein eigener Netz-Gang.
    const ANDERS = opt("anders"), ma = ANDERS ? lade(ANDERS) : null;
    const urteilAnders = (s) => !!ma && /^(GRUEN|ROT)$/.test(urteil(ma, s) || "");
    const ids = liste(String(l || "").replace("|", ","));
    const ueber = ids.filter((s) => !hatEintrag(m, s) && urteilAnders(s)).length;
    process.stderr.write("an " + k8(kopf) + " " + g + " schon gemessen: " + (ids.filter((s) => hatEintrag(m, s)).length) + " von " + ids.length +
        (ANDERS ? " · übersprungen, geurteilt auf " + ANDERS + " am Kopf: " + ueber + (ma ? "" : " (ohne dessen Mess-Datei)") : "") + "\n");
    console.log(ids.filter((s) => !hatEintrag(m, s) && !urteilAnders(s)).join(","));
} else if (was === "faelle") {
    const [repo, g, vorher, kopf, l] = arg;
    const git = gitIn(repo), zeig = zeigIn(repo);
    if (!process.env.RUNDE_OHNE_FETCH) git(["fetch", "-q", "origin", "+refs/heads/" + PM_ZWEIG + ":refs/runde/pm"]);
    const lade = (k) => { try { return JSON.parse(zeig("refs/runde/pm", MDIR + "/" + k8(k) + "-" + g + ".json") || "null"); } catch { return null; } };
    const mv = lade(vorher), mk = lade(kopf);
    const f = liste(String(l || "").replace("|", ",")).filter((s) => urteil(mv, s) === "GRUEN" && urteil(mk, s) === "ROT");
    process.stderr.write("frisches ROT " + g + " " + k8(vorher) + " -> " + k8(kopf) + ": " + (f.join(", ") || "keins") + (mv ? "" : " (keine Mess-Datei am vorigen Kopf)") + "\n");
    for (const s of f) console.log(s);
} else if (was === "paare") {
    const [repo, n] = arg;
    const git = gitIn(repo), zeig = zeigIn(repo);
    if (!process.env.RUNDE_OHNE_FETCH) git(["fetch", "-q", "origin", "+refs/heads/" + PM_ZWEIG + ":refs/runde/pm"]);
    const namen = git(["ls-tree", "--name-only", "refs/runde/pm", MDIR + "/"]).split("\n").map((x) => path.basename(x));
    const k = (geraet) => new Set(namen.filter((x) => x.endsWith("-" + geraet + ".json")).map((x) => x.slice(0, 8)));
    const kg = k("gtx"), kr = k("radeon"), beide = [...kg].filter((x) => kr.has(x));
    const zeilen = [];
    let sp = 0, sg = 0;
    for (const kopf of beide) {
        const a = JSON.parse(zeig("refs/runde/pm", MDIR + "/" + kopf + "-gtx.json") || "{}"), b = JSON.parse(zeig("refs/runde/pm", MDIR + "/" + kopf + "-radeon.json") || "{}");
        const ids = Object.keys(a.je || {}).filter((s) => urteil(a, s) && urteil(b, s));
        const gr = ids.filter((s) => urteil(a, s) === "GRUEN" && urteil(b, s) === "GRUEN").length;
        zeilen.push({ kopf, zeit: String(a.zeit || "") > String(b.zeit || "") ? String(a.zeit || "") : String(b.zeit || ""), p: ids.length, g: gr, ga: Object.keys(a.je || {}).length, ra: Object.keys(b.je || {}).length });
        sp += ids.length; sg += gr;
    }
    zeilen.sort((x, y) => y.zeit.localeCompare(x.zeit));
    for (const z of zeilen.slice(0, Number(n || 30))) console.log(z.kopf + " " + z.zeit.slice(0, 16) + "  Paare " + z.p + " (beide GRUEN " + z.g + ") · gtx " + z.ga + " · radeon " + z.ra);
    console.log("SUMME: " + kg.size + " Koepfe mit gtx-Datei, " + kr.size + " mit radeon-Datei, " + beide.length + " mit beiden · Stations-Paare am selben Kopf " + sp + ", davon beide GRUEN " + sg);
} else if (was === "bilder") {
    // DAS GESETZ DER ROH-BILDER (Koordinator 19.11. 02:50; Befund 17,4 GB Roh-Bilder in messung/roh, ~0,6 GB je Tag): ein Roh-BILD geht nur
    // nach git, wenn das Urteil der Station gegen den gebuchten Stand (stand.json im Baum) WECHSELT (neues GRÜN = Beweis-Bild, frisches
    // ROT = Täter-Bild) oder der Auftrag es bestellt (ROH_BILD=1). Hält das Urteil (oder trägt die Station keins), bleibt das Bild am Gerät:
    // es zieht nach <ablage>/<kopf8>-<geraet>/… um (aus dem Baum, damit `git clean` es nie löscht), nach git geht nur <bild>.sha256
    // (Prüfsumme, Größe, Station, Urteil). Gelöscht wird nichts. Aufruf: bilder <pm-baum> <geraet> <kopf> <ablage>
    const [pm, g, kopf, ablage] = arg;
    // die Wurzeln müssen absolut sein und der Baum muss den Mess-Ordner tragen: ein leerer <pm> löste sonst RELATIV zum Arbeitsordner
    // des Rufers auf, und das Umziehen träfe Bilder eines fremden Baums (Lösch-Liste 19.11.)
    if (!pm || !path.isAbsolute(pm) || !fs.existsSync(path.join(pm, MDIR)) || !ablage || !path.isAbsolute(ablage) || !/^(gtx|radeon)$/.test(String(g))) {
        console.error("bilder: <pm-baum> und <ablage> absolut, der Baum mit " + MDIR + ", <geraet> gtx|radeon — nichts angefasst (" + [pm, g, ablage].join(" · ") + ")");
        process.exit(2);
    }
    const P = path.join(pm, MDIR), rd = path.join(P, "roh", k8(kopf) + "-" + g);
    const json = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
    const m = json(path.join(P, k8(kopf) + "-" + g + ".json")) || {}, stand = json(path.join(pm, "meisterkarte-quelle/punkte/stand.json")) || {};
    const gebucht = (id) => { const z = [...Object.values(stand.je || {}), ...Object.values(stand.pflichtJe || {})].flatMap((e) => e.stationen || []).find((x) => x.id === id && x.geraet === g && !x.ungemessen); return z ? (z.gruen ? "GRUEN" : "ROT") : null; };
    const ids = [...new Set([...Object.keys(m.je || {}), ...Object.keys(m.ungemessen || {})])].sort((a, b) => b.length - a.length);
    const bilder = [];
    const lauf = (d) => { let e = []; try { e = fs.readdirSync(d, { withFileTypes: true }); } catch { return; } for (const x of e) { const f = path.join(d, x.name); if (x.isDirectory()) lauf(f); else if (/\.(png|jpe?g|webp)$/i.test(x.name)) bilder.push(f); } };
    lauf(rd);
    let ein = 0, halt = 0, bytes = 0;
    for (const f of bilder) {
        const rel = path.relative(rd, f), base = path.basename(f);
        const sid = ids.find((id) => { const p = id.replace(/#/g, "_"); return base.startsWith(p + "-") || base.startsWith(p + "."); }) || null;
        const jetztU = sid ? urteil(m, sid) : null, vorU = sid ? gebucht(sid) : null;
        if (process.env.ROH_BILD === "1" || (jetztU && jetztU !== vorU)) { ein++; console.log("EIN " + rel + " (" + (sid || "?") + ": " + (vorU || "nie gebucht") + " → " + jetztU + ")"); continue; }
        const b = fs.readFileSync(f), sum = require("crypto").createHash("sha256").update(b).digest("hex");
        fs.writeFileSync(f + ".sha256", sum + " " + b.length + " " + (sid || "-") + " " + (jetztU || "ohne-Urteil") + " gebucht " + (vorU || "-") + "\n");
        const ziel = path.join(ablage, k8(kopf) + "-" + g, rel);
        fs.mkdirSync(path.dirname(ziel), { recursive: true });
        try { fs.renameSync(f, ziel); } catch { fs.copyFileSync(f, ziel); fs.rmSync(f); }
        halt++; bytes += b.length;
    }
    process.stderr.write("Roh-Bilder " + k8(kopf) + " " + g + ": " + ein + " nach git (Urteil wechselt), " + halt + " am Gerät (" + (bytes / 1e6).toFixed(1) + " MB, nur Prüfsumme nach git)\n");
} else if (was === "ablage") {
    // die Ablage am Gerät zählen (nie löschen, bis der Schöpfer das Halte-Wort gibt): je Station die jüngsten 3 Köpfe, was jenseits liegt
    const [ablage] = arg;
    const je = {};
    let koepfe = [];
    try { koepfe = fs.readdirSync(ablage).map((k) => ({ k, t: fs.statSync(path.join(ablage, k)).mtimeMs })).sort((a, b) => b.t - a.t); } catch { /* keine Ablage */ }
    let ordner = 0, bytes = 0;
    const groesse = (d) => { let s = 0; for (const x of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, x.name); s += x.isDirectory() ? groesse(f) : fs.statSync(f).size; } return s; };
    for (const { k } of koepfe) {
        const st = {};
        for (const x of fs.readdirSync(path.join(ablage, k), { withFileTypes: true })) { const s = x.name.replace(/-.*$/, ""); (st[s] = st[s] || []).push(path.join(ablage, k, x.name)); }
        for (const [s, fs_] of Object.entries(st)) { je[s] = (je[s] || 0) + 1; if (je[s] > 3) { ordner++; for (const f of fs_) bytes += fs.statSync(f).isDirectory() ? groesse(f) : fs.statSync(f).size; } }
    }
    console.log("Roh-Bilder am Gerät jenseits der 3 Köpfe: " + ordner + " Station×Kopf, " + (bytes / 1e9).toFixed(2) + " GB (nicht gelöscht)");
} else if (was === "push-pfade" || was === "ungepusht") {
    // DER PUSH OHNE REBASE (Koordinator 19.11. 04:16; Fund an der Radeon: ihr Mess-Baum stand 58 Commits vor und 2 402 hinter
    // origin/punkte-maschine, `pushe()` rebaste, der erste Konflikt in der GETEILTEN Datei messung/referenz-MiguellD.json, seither
    // „cannot rebase: You have unstaged changes“ 260-mal still in radeon.out, und der Blick sagte „RADEON ok“). Jetzt wie die Runde:
    // den Ursprungs-Kopf frisch holen, NUR die eigenen Geräte-Pfade aus dem Arbeitsbaum in dessen Baum setzen, commit-tree, Push, bei
    // Ablehnung von vorn — Arbeitsbaum-Zustand und fremde Dateien spielen keine Rolle.
    // Die eigenen Pfade eines Geräts (EINE Quelle, eigenePfade): messung/<kopf8>-<g>.json, messung/roh/<kopf8>-<g>/** (ohne Sitzungs-
    // Ordner sitzung-*), messung/referenz-<g>.json (je GERÄT, nie je Rechner), vision/richter/*.<kopf8>-<g>.json. Kein Pfad trägt ein
    // anderes Gerät — zwei Geräte schreiben nie dieselbe Datei.
    //   push-pfade <baum> <zweig> <geraet> <kopf|*|-> <botschaft>   („*“: alle Köpfe des Geräts — ein früherer Push scheiterte; „-“: alle
    //       Köpfe, aber nur Pfade, die der Ursprung NICHT trägt — die Rettung eines Baums aus der Zeit des Rebase-Pushs)
    //   ungepusht <baum> <zweig> <geraet> <seit-datei>            → "<n> <seit-iso|->": Mess-Dateien und Akten des Geräts, die vom Ursprung
    //       abweichen, + eigene Commits vor dem Ursprung; die seit-Datei merkt, seit wann n > 0 (fällt bei 0)
    const [baum, zweig, g] = arg;
    // die Wurzel muss ein absoluter Git-Baum sein: ein leeres <baum> liefe sonst im Arbeitsordner des Rufers (Lösch-Liste 19.11.)
    if (!baum || !path.isAbsolute(baum) || !fs.existsSync(path.join(baum, ".git")) || !/^(gtx|radeon)$/.test(String(g))) { console.error(was + ": <baum> absolut mit .git, <geraet> gtx|radeon — nichts getan (" + baum + " · " + g + ")"); process.exit(2); }
    const git = gitIn(baum);
    git(["fetch", "-q", "origin", "+refs/heads/" + zweig + ":refs/runde/push-" + zweig]);
    const ref = "refs/runde/push-" + zweig;
    const eigen = (rel, kopf) => {
        const k = kopf && kopf !== "-" && kopf !== "*" ? k8(kopf) : "[0-9a-f]{8}";
        const r = new RegExp("^(" + MDIR.replace(/\//g, "\\/") + "\\/(" + k + "-" + g + "\\.json|referenz-" + g + "\\.json|roh\\/" + k + "-" + g + "\\/(?!sitzung-)[^/]+)|vision\\/richter\\/[^/]+\\." + k + "-" + g + "\\.json)$");
        return r.test(rel);
    };
    const liste = [];
    const lauf = (d) => { let e = []; try { e = fs.readdirSync(path.join(baum, d), { withFileTypes: true }); } catch { return; } for (const x of e) { const rel = d + "/" + x.name; if (x.isDirectory()) lauf(rel); else liste.push(rel); } };
    lauf(MDIR);
    lauf("vision/richter");
    // DIE KOSTEN (Koordinator 05:58: an der Radeon brauchte `ungepusht` 72 s — je Datei ein git-Prozess): EIN `ls-tree` des Ursprungs und
    // EIN `hash-object --stdin-paths` für alle eigenen Pfade; die Historie (Commits vor dem Ursprung) zählt nicht mehr — der Vergleich
    // der Geräte-Pfade (Datei im Baum ↔ Ursprung) trägt dieselbe Aussage, ein alter Commit ist eine Datei, die vom Ursprung abweicht
    const amUrsprung = new Map();
    for (const z of git(["ls-tree", "-r", ref, "--", MDIR, "vision/richter"]).split("\n")) { const m = z.match(/^\d+ blob ([0-9a-f]{40})\t(.+)$/); if (m) amUrsprung.set(m[2], m[1]); }
    const blobAm = (rel) => amUrsprung.get(rel) || "";
    const hashe = (rels, schreiben) => (rels.length ? git(["hash-object", "--no-filters", ...(schreiben ? ["-w"] : []), "--stdin-paths"], { input: rels.map((rel) => path.join(baum, rel)).join("\n") + "\n" }).split(/\r?\n/) : []);
    if (was === "ungepusht") {
        const nur = (rel) => eigen(rel, "-") && !/\/roh\//.test(rel) && !/referenz-/.test(rel); // die Messungen selbst: Mess-Dateien und Akten
        // nur Messungen der letzten 48 h: eine Datei, die seit Tagen ungepusht liegt (n0611-pm trägt messung/0ab95ff4-gtx.json vom 10.11.,
        // am WIP-Kopf eines Zweigs, 0 Urteile), ist kein stiller Push von heute — sie zählt nicht und wird nicht einmal gehasht
        const alt = Date.now() - 48 * 3600e3, kand = liste.filter((rel) => nur(rel)), jung = kand.filter((rel) => fs.statSync(path.join(baum, rel)).mtimeMs > alt);
        const b = hashe(jung, false), ab = jung.filter((rel, i) => b[i] !== blobAm(rel));
        if (kand.length > jung.length) process.stderr.write("eigene Mess-Dateien älter als 48 h (nicht geprüft): " + (kand.length - jung.length) + "\n");
        if (ab.length) process.stderr.write("ungepusht: " + ab.slice(0, 20).join(" ") + (ab.length > 20 ? " …" : "") + "\n");
        const n = ab.length, sd = arg[3];
        let seit = "-";
        if (n > 0) { try { seit = fs.readFileSync(sd, "utf8").trim(); } catch { seit = iso(jetzt()); fs.writeFileSync(sd, seit + "\n"); } }
        else fs.rmSync(sd, { force: true });
        console.log(n + " " + seit);
        process.exit(0);
    }
    const [, , , kopf, botschaft] = arg;
    // kopf „-“ (die Rettung): nur Pfade, die der Ursprung NICHT trägt — eine dort schon liegende Datei wird nie überschrieben
    const mein = liste.filter((rel) => eigen(rel, kopf) && (kopf !== "-" || !blobAm(rel)));
    const IDX = path.join(os.tmpdir(), "runde-push-" + process.pid + ".tmp"), env = { ...process.env, ...WER, GIT_INDEX_FILE: IDX };
    let fehler = "";
    const versuche = Number(process.env.RUNDE_PUSH_VERSUCHE || 10);
    const blobs = hashe(mein, true);
    for (let v = 1; v <= versuche; v++) {
        try {
            if (v > 1) {
                git(["fetch", "-q", "origin", "+refs/heads/" + zweig + ":" + ref]);
                amUrsprung.clear();
                for (const z of git(["ls-tree", "-r", ref, "--", MDIR, "vision/richter"]).split("\n")) { const m = z.match(/^\d+ blob ([0-9a-f]{40})\t(.+)$/); if (m) amUrsprung.set(m[2], m[1]); }
            }
            const basis = git(["rev-parse", ref]);
            fs.rmSync(IDX, { force: true });
            git(["read-tree", basis], { env });
            const neu = mein.map((rel, i) => [rel, blobs[i]]).filter(([rel, b]) => b && b !== blobAm(rel));
            const n = neu.length;
            if (n) git(["update-index", "--index-info"], { env, input: neu.map(([rel, b]) => "100644 blob " + b + "\t" + rel).join("\n") + "\n" });
            if (!n) { fs.rmSync(IDX, { force: true }); console.log("unverändert (" + mein.length + " eigene Pfade wie am Ursprung)"); process.exit(0); }
            const c = git(["commit-tree", git(["write-tree"], { env }), "-p", basis, "-F", "-"], { env, input: String(botschaft || "Messung " + g).slice(0, 200) + "\n\n" + n + " Datei(en) des Geräts " + g + " (runde.cjs push-pfade, ohne Rebase)\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n" });
            git(["push", "-q", "origin", c + ":refs/heads/" + zweig]);
            fs.rmSync(IDX, { force: true });
            git(["update-ref", ref, c]);
            console.log("punkte-maschine " + c.slice(0, 9) + " · " + n + " Datei(en) von " + g);
            process.exit(0);
        } catch (e) {
            fehler = String(e.message).split("\n")[0].slice(0, 200);
            process.stderr.write(new Date().toISOString() + " runde.cjs push-pfade Versuch " + v + "/" + versuche + " gescheitert: " + fehler + "\n");
            schlaf(1000 + Math.floor(Math.random() * 4000) * Math.min(v, 4));
        }
    }
    fs.rmSync(IDX, { force: true });
    console.log("PUSH SCHEITERT " + versuche + "x: " + fehler);
    process.exit(1);
} else if (was === "bestand") {
    const [repo, g] = arg;
    const git = gitIn(repo);
    git(["fetch", "-q", "origin", "+refs/heads/main:refs/runde/main", "+refs/heads/" + PM_ZWEIG + ":refs/runde/pm"]);
    const da = new Set(git(["ls-tree", "--name-only", "refs/runde/pm", MDIR + "/"]).split("\n").map((x) => path.basename(x)).filter((x) => x.endsWith("-" + g + ".json")).map((x) => x.slice(0, 8)));
    const k = git(["rev-list", "--first-parent", "-n", "300", "refs/runde/main"]).split(/\s+/).find((c) => da.has(c.slice(0, 8)));
    if (!k) { console.error("bestand: kein Kopf der main-Linie traegt messung/<kopf8>-" + g + ".json"); process.exit(1); }
    console.log(k);
} else if (was === "selbsttest") {
    // DER WIDERSPRUCH DER GERÄTE an einer Attrappe: w.a#1 GTX ROT 20.11., Radeon GRÜN 21.11. (der Fall signale#1) → vorn · w.b#1 GTX ROT
    // nach dem GRÜN der Radeon → Schwanz (das jüngere ROT gilt) · w.c#1 ROT an beiden → Schwanz · w.d#1 ROT ohne zweites Gerät → Schwanz.
    // Dieselbe Reihe mit der Mutante (RUNDE_MUTANTE=widerspruch-aus) muss w.a#1 in den Schwanz stellen — sonst prüft der Fall nichts
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "runde-selbst-"));
    const e = (gruen, zeit) => ({ gruen, zeit, grund: gruen ? "GRÜN" : "ROT: S1 x 0 gegen Soll ≥ 1 ✗" });
    fs.writeFileSync(path.join(tmp, "aaaaaaaa-gtx.json"), JSON.stringify({ je: { "w.a#1": e(false, "2026-11-20T18:00:00Z"), "w.b#1": e(false, "2026-11-22T10:00:00Z"), "w.c#1": e(false, "2026-11-20T10:00:00Z"), "w.d#1": e(false, "2026-11-20T10:00:00Z") } }));
    fs.writeFileSync(path.join(tmp, "bbbbbbbb-radeon.json"), JSON.stringify({ je: { "w.a#1": e(true, "2026-11-21T23:30:00Z"), "w.b#1": e(true, "2026-11-21T23:30:00Z"), "w.c#1": e(false, "2026-11-21T23:30:00Z") } }));
    const reihe = (env) => {
        const r = cp.spawnSync(process.execPath, [__filename, "reihe", tmp, "gtx", "w.a#1,w.b#1,w.c#1,w.d#1"], { encoding: "utf8", env: { ...process.env, ...env }, windowsHide: true });
        const [vorn, schwanz] = String(r.stdout || "").trim().split("|");
        return { vorn: liste(vorn), schwanz: liste(schwanz) };
    };
    const jetztR = reihe({ RUNDE_MUTANTE: "" }), mut = reihe({ RUNDE_MUTANTE: "widerspruch-aus" });
    fs.rmSync(tmp, { recursive: true, force: true });
    const ok = jetztR.vorn.join(",") === "w.a#1" && jetztR.schwanz.length === 3 && mut.vorn.length === 0 && mut.schwanz.includes("w.a#1");
    console.log((ok ? "GRÜN" : "ROT") + " WIDERSPRUCH DER GERÄTE: vorn " + (jetztR.vorn.join(",") || "-") + " · Schwanz " + (jetztR.schwanz.join(",") || "-") +
        " · Mutante ohne die Regel: vorn " + (mut.vorn.join(",") || "-") + " · Schwanz " + (mut.schwanz.join(",") || "-"));
    process.exit(ok ? 0 : 1);
} else {
    console.log("runde.cjs lies|anlegen|stand|durch|weiter|alarm|reihe|offen|faelle|paare|bestand|selbsttest — siehe Kopf der Datei");
    process.exit(2);
}
