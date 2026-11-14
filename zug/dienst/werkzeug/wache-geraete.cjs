#!/usr/bin/env node
// wache-geraete.cjs — DER STILLSTAND-ALARM DER DREI GERÄTE (10.11., Schöpfer: „die OMEN stand 28 min an einem verwaisten GPU-Schloss,
// nach 15 min solltest du so etwas bemerken“). Die Vorgänger-Regel in wache-k10.sh war dreifach blind:
//   1. „Läufer busy“ galt als Arbeit — ein Job, der im Start-Hook 25 min auf ein verwaistes Schloss wartet, meldet busy.
//   2. Die Zähler lebten im Prozess — die Wache endet bei JEDEM Ereignis, also stand jeder Zähler nach jedem Neustart auf 0 und
//      erreichte in einer Stunde mit Ereignissen nie die 16 min.
//   3. Ein offener Auftrag (START ohne erledigt-Zeile) und das bloße Dasein des Schloss-Ordners galten als Arbeit, ohne Frist.
// DAS GESETZ: der Beweis der Arbeit ist FORTSCHRITT, nie Belegung. Je Gerät EIN Lebenszeichen-Abdruck (letzte Mess-Datei auf
// punkte-maschine · erledigt-Zeilen seiner Aufträge · Köpfe der Zweige seiner offenen Aufträge · GPU-PROBE-Urteil · Job-Nummer
// mit Zahl der beendeten Schritte · lokal: Schloss-Halter und Größe der Mess-Ausgaben). Der Abdruck steht mit seiner Uhrzeit in
// einer DATEI (wache-stand/<GERÄT>.json) — ein Neustart der Wache setzt nichts zurück. 16 min derselbe Abdruck = Ereignis, beim
// Namen: STILLSTAND (Job im Schritt X · Schloss hält Y · Auftrag Z offen) oder LEERLAUF (nichts von allem). Nach der Meldung
// zählt die Frist neu, die Stille-Dauer läuft weiter. Ein lokales Schloss „ci-runner <Lauf>/<n>“, dessen Lauf zu Ende ist,
// heißt sofort VERWAIST. Antwortet die Actions-API 5 Runden nicht, meldet die Wache sich selbst BLIND — nie still. Trägt der Puls eines
// Geräts bei freiem Schloss zwei Runden dieselben `welten` (oder gehalten mehr als zwei), heißt es WELT NEBEN DEM SCHLOSS (14.11., weltUrteil).
// Aufruf: TOK=<token> node wache-geraete.cjs  (eine Zeile je Ereignis, sonst nichts) · --blick (Stand je Gerät) · --selbsttest
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const R = "C:/Users/micha/AnazhRealm-profiband";
const TEMP = "C:/Users/micha/AppData/Local/Temp/claude";
const D = process.env.WACHE_STAND || TEMP + "/w4/wache-stand";
const FRIST = 960;
const GERAETE = [
    { name: "OMEN", laeufer: "omen-gtx1060", sitz: "omen", mess: "gtx" },
    { name: "RADEON", laeufer: "radeon-890m", sitz: "radeon", mess: "radeon", lokal: true },
    { name: "GTX1050", laeufer: "gtx1050-desktop", sitz: "gtx1050", mess: "gtx1050" },
];
const hhmm = (s) => new Date(s * 1000).toTimeString().slice(0, 5);

// DAS URTEIL (rein): alt = { sig, seit, ab } aus der Datei · zeichen = Abdruck jetzt · lage = { job, schritt, schrittSeit, schloss, auftrag }
function urteil(name, alt, zeichen, lage, jetzt) {
    if (!alt || alt.sig !== zeichen) return { stand: { sig: zeichen, seit: jetzt, ab: jetzt }, meldung: null };
    if (jetzt - alt.seit < FRIST) return { stand: alt, meldung: null };
    const min = Math.round((jetzt - (alt.ab || alt.seit)) / 60);
    const was = lage.job
        ? `Job „${lage.job}“ steht im Schritt „${lage.schritt}“ seit ${hhmm(lage.schrittSeit)}`
        : lage.schloss
          ? `das GPU-Schloss hält „${lage.schloss}“, kein Fortschritt`
          : lage.auftrag
            ? `Auftrag ${lage.auftrag} offen, kein Lebenszeichen (Mess-Datei, erledigt-Zeile, Push)`
            : null;
    return {
        stand: { sig: zeichen, seit: jetzt, ab: alt.ab || alt.seit },
        meldung: was ? `STILLSTAND ${name} seit ${min} min — ${was}` : `LEERLAUF ${name} seit ${min} min — kein Job, keine Messung, kein Auftrag`,
    };
}
// DIE WELT NEBEN DEM SCHLOSS (14.11.: OMEN 10:58–15:16, `werkbank start --port 4793 --ort dorf` verwaist neben dem Schloss, niemand sah sie, jede
// Millisekunde der Karte im Fenster entwertet). Der Puls (schloss-puls.cjs) trägt `welten` = die lauschenden Welt-Ports, je Welt gefaltet. Verdacht:
// das Schloss ist FREI und eine Welt lauscht — oder es ist gehalten und mehr als zwei lauschen (ein Paar main ↔ Kandidat gehört dem Halter).
// Ereignis erst, wenn zwei VERSCHIEDENE Pulse (t wächst) in Folge dieselben `welten` tragen; danach erneut je FRIST. Die Wache beendet nie
// etwas, sie nennt Gerät, Ports und Dauer. alt = { key, seit, t, n, gemeldet } · puls = puls.json (frisch) oder null → { stand, meldung }
function weltUrteil(name, alt, puls, jetzt) {
    if (!puls || !Array.isArray(puls.welten) || !puls.welten.length) return { stand: null, meldung: null }; // altes puls.json ohne `welten`: still
    const frei = !!puls.frei, w = puls.welten;
    if (!(frei || w.length > 2)) return { stand: null, meldung: null };
    const key = w.join(",");
    const st = alt && alt.key === key ? { ...alt } : { key, seit: puls.t, t: puls.t, n: 1, gemeldet: 0 };
    if (alt && alt.key === key && puls.t > alt.t) { st.n++; st.t = puls.t; }
    if (st.n < 2 || jetzt - (st.gemeldet || 0) < FRIST) return { stand: st, meldung: null };
    st.gemeldet = jetzt;
    const min = Math.max(0, Math.round((jetzt - st.seit) / 60));
    return { stand: st, meldung: `WELT NEBEN DEM SCHLOSS ${name}: Port${w.length > 1 ? "s" : ""} ${w.join(" · ")} seit ${min} min — ${frei ? "das GPU-Schloss ist frei" : `das Schloss hält „${(puls.halter && puls.halter.wer) || "?"}“, ${w.length} Welten (erlaubt: zwei)`}; die Wache beendet nichts` };
}
// die Aufträge je Gerät aus zug/sitzung.txt (START geraet=<g>) und zug/erledigt.txt; Zwischenzeilen schließen nicht
function auftraege(sitzung, erledigt) {
    const start = {};
    for (const z of sitzung.split("\n")) {
        const m = z.match(/^(\d{4}-\d\d-\d\d \d\d:\d\d)\S* (\S+) START geraet=(\S+)/);
        if (m) start[m[2]] = { ab: m[1], g: m[3] };
    }
    const je = {};
    for (const id of Object.keys(start)) (je[start[id].g] = je[start[id].g] || { ids: [], offen: [], zeilen: 0 }).ids.push(id);
    const zu = {};
    for (const z of erledigt.split("\n")) {
        const m = z.match(/^(\d{4}-\d\d-\d\d \d\d:\d\d)\S* (\S+) (.*)$/);
        if (!m || !start[m[2]]) continue;
        je[start[m[2]].g].zeilen++;
        if (!/Zwischenstand|Scheibe \d+\/\d+/.test(m[3]) && m[1] >= start[m[2]].ab) zu[m[2]] = true;
    }
    for (const id of Object.keys(start)) if (!zu[id]) je[start[id].g].offen.push(id);
    return je;
}
const lies = (n) => { try { return JSON.parse(fs.readFileSync(path.join(D, n + ".json"), "utf8")); } catch (_e) { return null; } };
const schreib = (n, o) => { fs.mkdirSync(D, { recursive: true }); fs.writeFileSync(path.join(D, n + ".json"), JSON.stringify(o)); };

const A = "https://api.github.com/repos/MiguellD/AnazhRealm/actions";
async function api(u) {
    const r = await fetch(A + u, { headers: { Authorization: "Bearer " + process.env.TOK, "User-Agent": "wache-k10", Accept: "application/vnd.github+json" } });
    if (!r.ok) throw new Error(`Actions-API ${u.split("?")[0]} antwortet ${r.status}`);
    return r.json();
}
const git = (...a) => { try { return execFileSync("git", ["-C", R, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 60000 }).trim(); } catch (_e) { return ""; } };
// der laufende Job je Läufer: Nummer, Name, Zahl der beendeten Schritte, der laufende Schritt mit seiner Startzeit
async function jobs() {
    const aus = {};
    for (const lauf of (await api("/runs?status=in_progress&per_page=50")).workflow_runs || [])
        for (const j of (await api(`/runs/${lauf.id}/jobs?per_page=100`)).jobs || []) {
            if (j.status !== "in_progress" || !j.runner_name) continue;
            const an = (j.steps || []).find((s) => s.status === "in_progress");
            aus[j.runner_name] = {
                id: j.id,
                name: `${lauf.name} · ${j.name} (${lauf.head_branch})`,
                fertig: (j.steps || []).filter((s) => s.status === "completed").length,
                schritt: an ? an.name : "vor dem ersten Schritt (Start-Hook)",
                seit: Math.floor(Date.parse((an && an.started_at) || j.started_at) / 1000),
            };
        }
    return aus;
}
// lokal (Radeon): der Schloss-Ordner mit seinen Haltern und die Größe der Mess-Ausgaben
function lokal() {
    const d = TEMP + "/gpu-schloss", o = { schloss: "", halter: "", seit: 0, aus: 0 };
    try {
        o.seit = Math.floor(fs.statSync(d).birthtimeMs / 1000);
        const z1 = (f) => { try { return fs.readFileSync(f, "utf8").split("\n")[0].trim(); } catch (_e) { return ""; } };
        o.schloss = z1(d + "/besitzer.txt") || "?";
        o.halter = [o.schloss, ...fs.readdirSync(d).filter((n) => n.startsWith("platz.")).map((n) => z1(`${d}/${n}/besitzer.txt`))].join("|");
    } catch (_e) { /* kein Schloss */ }
    // 10.11.: die Punkte-Sitzung der Radeon (nach-landung2 → nach-landung-lauf.out, Hand-Läufe → *-lauf*.out) schreibt ihre Stationen
    // in eine Lauf-Ausgabe und pusht die Mess-Datei erst am Ende — ihr Wachsen IST der Fortschritt, sonst meldete die Wache falschen STILLSTAND
    try { for (const n of fs.readdirSync(TEMP + "/w4")) if (/^radeon-.*\.out$|lauf.*\.out$/.test(n)) o.aus += fs.statSync(`${TEMP}/w4/${n}`).size; } catch (_e) { /* keine Ausgaben */ }
    return o;
}

async function runde(blick) {
    const jetzt = Math.floor(Date.now() / 1000), zeilen = [];
    let fehler = "", laeufer = [], js = {};
    try {
        execFileSync("git", ["-C", R, "fetch", "-q", "origin", "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine", "+refs/heads/koordination:refs/remotes/origin/koordination"], { stdio: "ignore", timeout: 90000 });
    } catch (_e) { fehler = "git fetch (punkte-maschine, koordination) scheitert"; }
    try {
        laeufer = (await api("/runners")).runners || [];
        if (laeufer.some((r) => r.busy)) js = await jobs();
    } catch (e) { fehler = e.message; }
    const blind = lies("_blind") || { n: 0 };
    if (fehler) {
        blind.n++;
        if (blind.n >= 5 || blick) { zeilen.push(`WACHE BLIND seit ${blind.n} Runden — ${fehler}`); if (!blick) blind.n = 0; }
        schreib("_blind", blind);
        return zeilen;
    }
    schreib("_blind", { n: 0 });
    const je = auftraege(git("show", "origin/koordination:zug/sitzung.txt"), git("show", "origin/koordination:zug/erledigt.txt"));
    const koepfe = git("ls-remote", "origin", "refs/heads/w2[5-9]-*", "refs/heads/heim*").split("\n");
    // DER PULS DES SCHLOSSES ist das Lebenszeichen der FERNEN Geräte (14.11. 10:58: „STILLSTAND OMEN seit 17 min“, während sie Proben fuhr,
    // Bilder schoss und antwortete — sie pusht nicht je Lauf, und die Wache kannte nur Mess-Datei, erledigt-Zeile und Zweig-Kopf). Der Halter
    // samt `regt` (zuletzt CPU verbraucht, schloss-puls.cjs) steht im Abdruck: ein Lauf, der rechnet, ist Fortschritt; ein Halter, der nur
    // wartet, regt sich nicht — sein Abdruck steht, und nach der Frist heißt er beim Namen STILLSTAND (belegt ≠ Arbeit bleibt das Gesetz).
    // Eigener Namensraum refs/wache-puls (EIN Schreiber je Ref, wie der Blick in refs/blick-puls); ein Puls älter als 5 min zählt nicht.
    try { execFileSync("git", ["-C", R, "fetch", "-q", "--no-tags", "--no-write-fetch-head", "origin", "+refs/puls/*:refs/wache-puls/*"], { stdio: "ignore", timeout: 60000 }); } catch (_e) { /* ohne Puls urteilen die übrigen Zeichen */ }
    const pulsFern = (sitz) => {
        try {
            const p = JSON.parse(execFileSync("git", ["-C", R, "cat-file", "blob", `refs/wache-puls/${sitz}:puls.json`], { encoding: "utf8", timeout: 8000, stdio: ["ignore", "pipe", "ignore"] }));
            return p && jetzt - p.t <= 300 ? p : null;
        } catch (_e) { return null; }
    };
    for (const g of GERAETE) {
        const puls = pulsFern(g.sitz); // jedes Gerät: die Welten; der Halter nur der fernen (die Radeon liest ihr Schloss selbst)
        const a = je[g.sitz] || { ids: [], offen: [], zeilen: 0 }, j = js[g.laeufer], l = g.lokal ? lokal() : null, h = g.lokal || !puls ? null : puls.halter || null;
        const zweige = koepfe.filter((z) => a.offen.some((id) => z.includes(id))).map((z) => z.slice(0, 8)).join(",");
        const zeichen = [
            "m=" + git("log", "-1", "--format=%h", "origin/punkte-maschine", "--", `meisterkarte-quelle/punkte/messung/*-${g.mess}.json`),
            "e=" + a.zeilen,
            "z=" + zweige,
            "p=" + git("log", "-1", "--format=%h", "--author=gpu-probe", "--grep=" + g.laeufer, "origin/koordination"),
            "j=" + (j ? j.id + ":" + j.fertig : ""),
            l ? "s=" + l.halter + " a=" + l.aus : "",
            h ? "h=" + h.wer + "@" + h.seit + ":" + (h.regt ?? h.seit) : "",
        ].join(" ");
        const lage = { job: j && j.name, schritt: j && j.schritt, schrittSeit: j && j.seit, schloss: l ? l.schloss : h ? h.wer : null, auftrag: a.offen.join(", ") };
        const alt = lies(g.name), u = urteil(g.name, alt, zeichen, lage, jetzt);
        // das verwaiste lokale Schloss: „ci-runner <Lauf>/<n>“, der Lauf ist zu Ende, das Schloss liegt noch (3 min Frist für den Ende-Hook)
        const m = l && l.schloss.match(/^ci-runner (\d+)\//);
        if (m && jetzt - l.seit > 180 && (alt || {}).verwaist !== l.schloss) {
            const lauf = await api("/runs/" + m[1]).catch(() => null);
            if (lauf && lauf.status === "completed") { u.stand.verwaist = l.schloss; zeilen.push(`VERWAIST ${g.name} — das GPU-Schloss „${l.schloss}“ liegt seit ${hhmm(l.seit)}, der Lauf ${m[1]} endete ${lauf.conclusion} um ${hhmm(Date.parse(lauf.updated_at) / 1000)}`); }
        } else if (alt && alt.verwaist) u.stand.verwaist = alt.verwaist;
        const wu = weltUrteil(g.name, alt && alt.welt, puls, jetzt);
        if (wu.stand) u.stand.welt = wu.stand; else delete u.stand.welt; // urteil reicht bei gleichem Abdruck `alt` selbst weiter
        if (blick) zeilen.push(`${g.name}: still seit ${Math.round((jetzt - (u.stand.ab || jetzt)) / 60)} min · ${lage.job ? "Job " + lage.job + " / " + lage.schritt + " seit " + hhmm(lage.schrittSeit) : "kein Job"} · ${lage.schloss ? "Schloss " + lage.schloss : "Schloss —"} · Auftrag ${lage.auftrag || "—"} · Welten ${puls && Array.isArray(puls.welten) ? puls.welten.join(" ") || "—" : "? (Puls ohne welten)"} · ${zeichen}`);
        else { schreib(g.name, u.stand); if (u.meldung) zeilen.push(u.meldung); if (wu.meldung) zeilen.push(wu.meldung); }
    }
    return zeilen;
}

function selbsttest() {
    const t0 = 1000000, rot = [], prue = (n, ok) => { if (!ok) rot.push(n); };
    const busy = { job: "gpu-probe · probe (w27-x)", schritt: "Set up runner", schrittSeit: t0 };
    const s0 = { sig: "j=7:0", seit: t0, ab: t0 };
    // 1 DER TÄTER: Läufer busy, derselbe Job im selben Schritt, 17 min — die alte Regel (busy = Arbeit) schwieg, die neue nennt Job und Schritt
    const u1 = urteil("OMEN", s0, "j=7:0", busy, t0 + 1020);
    prue("1 busy ohne Fortschritt 17 min ⇒ STILLSTAND mit Job und Schritt", /^STILLSTAND OMEN seit 17 min — Job „gpu-probe · probe \(w27-x\)“ steht im Schritt „Set up runner“/.test(u1.meldung || ""));
    prue("2 Schritt rückt vor ⇒ still, Frist neu", urteil("OMEN", s0, "j=7:1", busy, t0 + 1020).meldung === null && urteil("OMEN", s0, "j=7:1", busy, t0 + 1020).stand.seit === t0 + 1020);
    prue("3 15 min ⇒ noch still", urteil("OMEN", s0, "j=7:0", busy, t0 + 900).meldung === null);
    prue("4 nichts von allem 17 min ⇒ LEERLAUF", /^LEERLAUF GTX1050 seit 17 min/.test(urteil("GTX1050", { sig: "x", seit: t0, ab: t0 }, "x", {}, t0 + 1020).meldung || ""));
    prue("5 offener Auftrag ohne Lebenszeichen ⇒ STILLSTAND beim Auftrag", /STILLSTAND OMEN seit 17 min — Auftrag gpu-stufe offen/.test(urteil("OMEN", { sig: "x", seit: t0, ab: t0 }, "x", { auftrag: "gpu-stufe" }, t0 + 1020).meldung || ""));
    prue("6 Schloss hält ohne Fortschritt ⇒ STILLSTAND beim Halter", /das GPU-Schloss hält „ci-runner 9\/1 probe“/.test(urteil("RADEON", { sig: "x", seit: t0, ab: t0 }, "x", { schloss: "ci-runner 9/1 probe" }, t0 + 1020).meldung || ""));
    // 7 nach der Meldung zählt die Frist neu, die Stille läuft weiter: 5 min später still, 16 min später „seit 33 min“
    prue("7 Frist neu, Stille läuft weiter", urteil("OMEN", u1.stand, "j=7:0", busy, t0 + 1320).meldung === null && /seit 33 min/.test(urteil("OMEN", u1.stand, "j=7:0", busy, t0 + 1980).meldung || ""));
    // 8 DER NEUSTART: der Stand überlebt den Prozess (die alte Wache zählte nach jedem Ereignis ab 0)
    const d = path.join(require("os").tmpdir(), "wache-selbsttest-" + process.pid);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, "OMEN.json"), JSON.stringify(s0));
    const wieder = JSON.parse(fs.readFileSync(path.join(d, "OMEN.json"), "utf8"));
    prue("8 Stand aus der Datei ⇒ der Neustart setzt nichts zurück", /^STILLSTAND/.test(urteil("OMEN", wieder, "j=7:0", busy, t0 + 1020).meldung || ""));
    fs.rmSync(d, { recursive: true, force: true });
    // 9 Aufträge: START ohne schließende Zeile ist offen, eine Zwischenzeile schließt nicht, eine schließende Zeile schließt
    const sitz = "2026-11-10 00:22:00 gpu-stufe START geraet=omen x\n2026-11-09 21:40:00 gtx-zeit START geraet=omen y\n2026-11-09 21:40:00 ort-pose START geraet=gtx1050 z";
    const erl = "2026-11-09 22:38 gtx-zeit 0 grün\n2026-11-10 00:30 gpu-stufe Zwischenstand Schritt 1\n2026-11-09 21:00 ort-pose alt, vor dem START";
    const je = auftraege(sitz, erl);
    prue("9 Aufträge je Gerät (offen, Zwischenzeile, schließende Zeile, Zeile vor dem START)", je.omen.offen.join() === "gpu-stufe" && je.omen.zeilen === 2 && je.gtx1050.offen.join() === "ort-pose");
    // 10–14 DIE WELT NEBEN DEM SCHLOSS (OMEN 14.11.: 4792/4793 verwaist neben dem freien Schloss); zwei Runden = zwei Pulse mit wachsendem t
    const zweiRunden = (p1, p2) => { const r1 = weltUrteil("OMEN", null, p1, t0); return { r1, r2: weltUrteil("OMEN", r1.stand, p2, t0 + 60) }; };
    const frei = (t, welten) => ({ t, frei: true, halter: null, welten });
    const geh = (t, welten) => ({ t, frei: false, halter: { wer: "punkte-gtx pid=7" }, welten });
    const a = zweiRunden(frei(t0 - 1800, ["4792/4793"]), frei(t0 + 30, ["4792/4793"]));
    prue("10 frei + Port lauscht zwei Runden ⇒ WELT NEBEN DEM SCHLOSS mit Gerät, Port, Dauer", a.r1.meldung === null && /^WELT NEBEN DEM SCHLOSS OMEN: Port 4792\/4793 seit 31 min — das GPU-Schloss ist frei/.test(a.r2.meldung || ""));
    prue("11 frei + eine Runde ⇒ still (auch derselbe Puls zweimal gelesen zählt einmal)", a.r1.meldung === null && weltUrteil("OMEN", a.r1.stand, frei(t0 - 1800, ["4792/4793"]), t0 + 60).meldung === null);
    prue("12 gehalten + zwei Welten (main ↔ Kandidat) ⇒ still", zweiRunden(geh(t0, ["4489/4490", "4792/4793"]), geh(t0 + 30, ["4489/4490", "4792/4793"])).r2.meldung === null);
    prue("13 gehalten + drei Welten ⇒ Ereignis mit Halter", /^WELT NEBEN DEM SCHLOSS OMEN: Ports 4489\/4490 · 4548 · 4792\/4793 seit 1 min — das Schloss hält „punkte-gtx pid=7“, 3 Welten/.test(zweiRunden(geh(t0, ["4489/4490", "4548", "4792/4793"]), geh(t0 + 30, ["4489/4490", "4548", "4792/4793"])).r2.meldung || ""));
    const altPuls = { v: 1, geraet: "omen", t: t0, frei: true, halter: null, warten: 0, wartende: [] };
    let e14 = "kein Absturz";
    try { const x = weltUrteil("OMEN", weltUrteil("OMEN", null, altPuls, t0).stand, { ...altPuls, t: t0 + 30 }, t0 + 60); if (x.meldung || x.stand) e14 = "meldet"; if (weltUrteil("OMEN", null, null, t0).meldung) e14 = "meldet ohne Puls"; } catch (e) { e14 = "Absturz " + e.message; }
    prue("14 altes puls.json ohne `welten` (alter Dienst) ⇒ still, kein Absturz — " + e14, e14 === "kein Absturz");
    console.log(rot.length ? `SELBSTTEST ROT ${rot.length}/14: ${rot.join(" · ")}` : "SELBSTTEST GRÜN 14/14 (wache-geraete: Fortschritt statt Belegung, Stand in der Datei, Welt neben dem Schloss)");
    process.exit(rot.length ? 1 : 0);
}

if (process.argv.includes("--selbsttest")) selbsttest();
else runde(process.argv.includes("--blick")).then((z) => { if (z.length) console.log(z.join(" ║ ")); }, (e) => { console.log("WACHE-FEHLER wache-geraete.cjs: " + (e && e.stack ? e.stack.split("\n").slice(0, 2).join(" ") : e)); });
