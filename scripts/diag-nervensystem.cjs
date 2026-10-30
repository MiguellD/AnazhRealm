// diag-nervensystem.cjs — DER PIPELINE-BEWEIS (Schöpfer: „ich glaube dir nicht, dass du wirklich
// die Pipeline baust … wenn ich ein neues Asset in der Vorlagedatei erstelle, wird automatisch
// erkannt, wie oft platziert, ein Blueprint mit Reglern erstellt, sowie die LODs?").
// Das Gate beweist GENAU DIESEN Satz:
//   A (Absenz): kein lokales SCALE-Literal mehr im Studio-Wald (phytogenesis).
//   C (LIVE GEWINNT, Browser, foundry-ON, Null-Renderer): die Placement-Daten kommen an (scale.eiche · treeScaleMul), und
//     eine Mutation (scale.eiche ×2) ändert die Welt-Skalen-Matrix SOFORT — AnazhRealm liest die Daten, keinen Spiegel.
//   E (DAS NEUE GESETZBUCH, studios.K5; das neue Rezept im alten Buch: gate:place-policy (a)): ein Kern ohne Zeile im
//     Spiel-Manifest (worlds/neuntes-buch) reist durch den EINEN Kern-Weg; der Spieler setzt ihn über die Werkstatt, die
//     Kosten-Leiste zählt jede Stufe, die Stufen-Wahl serviert genau diese Dreiecke, er übersteht Speichern + Neuladen, und
//     der Wirt nennt die Art nie. --selftest: das Urteil nennt am Stand ohne B7 (main f7dd313c) den Register-Chokepoint.
//   E2 (AUF ALLEN WEGEN): je Weg der Bau-Hash der gezeigten Stufe — Werkstatt · KI-Satz (die Antwort der KI ein fester
//     DSL-Text, das Prompt lehrt das Wort) · Foundry (build-asset L0–L2 = die gezeigten Stufen) · P2P (ein Mitspieler baut das
//     Werk byte-gleich) — und der Atlas nennt die EINE Quelle.
//   S (DER STAMMBAUM, Studio-Vertrag B8): der EINE Katalog Studio → Bereich → Teil (`_stammbaum`) wird ROT, sobald ein Teil ohne
//     Eltern oder als Zwilling auftaucht — je Teil Quelle auf Datei:Zeile und Leser, kein toter Knoten, die Bibliothek der
//     Werkstatt trägt jeden Knoten (auch nach einem Tausch bei gleicher Zahl: der Merker liest den Stand, nie die Zahl), ihr
//     Griff setzt den Meilenstein, das Wort der KI trifft jeden Knoten.
const { statikServer,
    starteBrowser,
    nullRenderer,
    startProc,
    eigenePorte,
    waitFor,
    ROOT,
    hauptLauf,
    sleep,
    wandEnde,
} = require("./lib/welt-boot.cjs");
const { fehlt, text: stammText } = require("./lib/stamm.cjs");
const fs = require("fs");

const lies = (f) => fs.readFileSync(ROOT + "/" + f, "utf8");
const MANIFEST = JSON.parse(lies("cores.manifest.json"));
const NEUN = "worlds/neuntes-buch/stele-core.js";
const server = statikServer({
    seiten: {
        "/cores.manifest.json": JSON.stringify([
            ...MANIFEST,
            { id: "stele", scripts: [NEUN], vertrag: NEUN, ns: "__steleCore" },
        ]),
    },
});
const { errs, check } = require("./lib/welt-boot.cjs").pruefer();

// DAS URTEIL E (rein): je Soll sein Täter; leer = grün.
const NEUN_SOLL = [
    ["3/3 Baupläne (_kindPolicyVereinen → _foundryAutoRegisterSpecies)", (m) => m.bauplaene === 3 && m.regler === 7],
    ["site am Weg streut nicht (_placePolicyFor)", (m) => m.ort === "weg"],
    [
        "Kosten-Leiste L0–L2 im Budget (_workshopKostenLeiste)",
        (m) => m.kosten.length === 3 && m.kosten.every((z) => z.klasse === "pass"),
    ],
    ["die Werkstatt setzt ihn vor den Spieler", (m) => m.steht === true],
    [
        "L0 · L1 · L2 mit den gezählten Dreiecken",
        (m) => m.lod.length === 3 && m.lod.every((x, s) => x.ist === s && x.tris === +(m.kosten[s] || {}).leiste),
    ],
    ["er steht nach Speichern + Neuladen", (m) => m.geladen === true],
    ["der Wirt nennt die Art nie", (m) => m.nennt === 0],
];
const neunTaeter = (m) => NEUN_SOLL.filter(([, ok]) => !ok({ kosten: [], lod: [], ...m })).map(([n]) => n);
// S — DIE RATSCHEN (30.10., beim Namen): die Werke des Wirts ohne Gesetzbuch und die Teile ohne Ziel (der Waldboden: sein Buch
// bringt keine Wirts-Zeile B7, die Streu trägt ihn). Sie fallen nur — ein neuer Name taucht auf (ROT), ein geheilter fällt hier.
const WAISEN =
    "brennkolben damm drehbank esse esse_meister fass kiste ruestung_brustpanzer seelenstein_altar stamm_gefallen start_plattform trank_lebenssaft waterfall webstuhl";
const OHNE_GRIFF = "farn gestruepp schilf strauch stumpf totstamm";
// je Soll sein Schlüssel im Befund (der Selbsttest verdirbt ihn), sein Name und sein Urteil; die Ratschen stehen als Gleichheit
const STAMM_SOLL = [
    ["waisen", "ohne Eltern nur WAISEN", (v) => v === WAISEN],
    ["ohneGriff", "ohne Griff nur OHNE_GRIFF", (v) => v === OHNE_GRIFF],
    ...[
        "zwillinge Zwilling",
        "tot toter Knoten",
        "ohneZeile Quelle ohne Zeile",
        "bibliothek Bibliothek ohne Knoten",
        "wort Wort am Knoten vorbei",
    ].map((z) => [z.split(" ")[0], "kein " + z.slice(z.indexOf(" ") + 1), (v) => !v]),
];
const stammTaeter = (s) => STAMM_SOLL.filter(([k, , ok]) => !ok(s[k])).map(([k, n]) => `S: ${n} (${s[k]})`);
// die Zeile einer Quelle: die Tafel, ein Bereich (ab der Tafel seine `arten`-Zeile, sonst die Zeile, die die Art trägt), ein
// Rezept (ab PRESETS die Zeile seines Schlüssels mit einem Objekt, sonst in der Datei, sonst unter dem Namen seiner Zeile, sonst
// die Zeile, die ihn als Wert nennt) — nie eine Zeile, die die id nur mit einer Zahl nennt (Skala, Budget)
function zeileIn(datei, anker, name) {
    const z = lies(datei).split("\n");
    const suche = (re, von = 0) => z.findIndex((l, i) => i >= von && re.test(l)) + 1;
    const [T, P, art] = [
        suche(/\bSTAMMBAUM\s*[:=]/),
        suche(/\bPRESETS\s*=\s*\{/),
        /^STAMMBAUM\.arten\.(.+)/.exec(anker),
    ];
    if (art) return suche(RegExp(`\\b${art[1]}: "`), T - 1) || suche(RegExp(`kind: "${art[1]}"`));
    const zeile = (a) => RegExp(`(^|[{,\\s])"?${a.replace(/[^\w-]/g, "\\$&")}"?\\s*:\\s*\\{`);
    return anker === "STAMMBAUM"
        ? T
        : [anker, name].reduce((n, a) => n || suche(zeile(a), P - 1) || suche(zeile(a)), 0) ||
              suche(RegExp(`\\b${anker}: "`));
}
// DIE WEGE (rein): je Weg sein Bau-Hash und sein Soll
const WEGE = [
    ["Werkstatt", (m) => m.lod[0].bau, (m) => m.steht === true],
    ["KI-Satz", (m) => m.ki.bau, (m) => m.ki.lehrt && m.ki.bau === m.foundry.ki && m.foundry.ki !== m.foundry.roh],
    ["Foundry", (m) => m.foundry.lod.join(" · "), (m) => m.lod.every((x, s) => x.bau === m.foundry.lod[s])],
    ["P2P", (m) => m.p2p.bau, (m) => m.p2p.bau === m.lod[0].bau && m.p2p.stand === m.werk.stand],
];
const wege = (x, m = { lod: [{}], ki: {}, foundry: { lod: [] }, p2p: {}, werk: {}, ...x }) =>
    WEGE.map(([weg, bau, soll]) => ({ weg, bau: bau(m), ok: !!bau(m) && soll(m) }));

// die Helfer der Seite (auch nach dem Neuladen); der Bau-Hash ist EIN Abdruck (`__abdruck`) über position · normal · index
// je Teil — die gezeigte Stufe eines Werks und eine Foundry-Antwort lesen dieselben Bytes
function seitenHelfer() {
    window.__buch = () =>
        window.__weltDa((x) => x._foundry && x._foundry.ready && x._foundry.recipes && x._foundry.recipes.meilenstein);
    window.__stele = (o) =>
        r.state.architectures.find(
            (a) => a.type === "stele_meilenstein" && (!o || Math.hypot(a.position.x - o.x, a.position.z - o.z) < o.r)
        );
    const geo = (t) => ({
        geometry: { attributes: { position: t.position, normal: t.normal }, index: { array: t.index } },
    });
    const bau = (teile) => window.__abdruck({ traverse: (f) => teile.map(geo).forEach(f) }, true);
    const gezeigt = (w) => w.instSlots.map((x) => r.state.archInstanceGroups.get(x.key).mesh.geometry);
    window.__bauWerk = (w) => bau([...new Set(gezeigt(w))].map((g) => ({ ...g.attributes, index: g.index.array })));
    window.__bauFoundry = async (...a) =>
        bau(((await r._foundryWorkerRequest(...a, null, false, 0)) || []).filter((m) => m.position));
    window.__werkStand = (w) => JSON.stringify([w.id, w.position, w.rotationY, w.seed, w.studioOv]);
}

hauptLauf(async () => {
    if (process.argv.includes("--selftest")) {
        const lod = [160, 32, 14].map((tris, ist) => ({ ist, tris, bau: "b" + ist }));
        const kosten = lod.map((x) => ({ klasse: "pass", leiste: x.tris }));
        const gut = {
            bauplaene: 3,
            regler: 7,
            ort: "weg",
            kosten,
            steht: true,
            lod,
            geladen: true,
            nennt: 0,
            werk: { stand: "s" },
            ki: { bau: "k", lehrt: true },
            foundry: { lod: ["b0", "b1", "b2"], ki: "k", roh: "r" },
            p2p: { bau: "b0", stand: "s" },
        };
        const main = { regler: 7, bauplaene: 0, ort: "weg", nennt: 0 }; // gemessen an f7dd313c
        check("Selbsttest E: gesund ist grün", !neunTaeter(gut).length, neunTaeter(gut).join(" · "));
        check("Selbsttest E: main nennt den Register-Chokepoint", /_kindPolicyVereinen/.test(neunTaeter(main)[0]));
        const rot = (m) => wege({ ...gut, ...m }).flatMap((w) => (w.ok ? [] : [w.weg]));
        const r = [rot({}), rot({ p2p: { bau: "x", stand: "s" } }), rot({ ki: { bau: "k" } })].join("|");
        check(
            "Selbsttest E2: gesund trägt jeden Weg, ein fremder Hash nennt P2P, ein stummes Prompt den KI-Satz",
            r === "|P2P|KI-Satz",
            r
        );
        // S: gesund grün; je Soll ein verdorbener Befund (eine neue Waise, ein geheilter Name, …), der genau sein Soll beim Namen nennt
        const gutS = { waisen: WAISEN, ohneGriff: OHNE_GRIFF };
        const boes = [...STAMM_SOLL.map(([k]) => [k, "x " + gutS[k]]), ["waisen", WAISEN.slice(12)]];
        const stumm = boes.filter(([k, v]) => {
            const t = stammTaeter({ ...gutS, [k]: v });
            return t.length !== 1 || !t[0].startsWith("S: " + STAMM_SOLL.find(([x]) => x === k)[1]);
        });
        check(
            "Selbsttest S: jeder Täter beim Namen",
            !stammTaeter(gutS).length && !stumm.length,
            stumm.join(" · ")
        );
        process.exit(errs.length ? 1 : 0);
    }
    check(
        "phytogenesis: kein lokales SCALE-Literal",
        fehlt(null, /const SCALE = \{\s*gras: 0\.24/, { datei: "worlds/terrain/phytogenesis.js" }),
        fehlt.wo
    );

    console.log("\n=== TEIL C, E: der lebende Draht (Browser, foundry-ON) ===");
    const [PORT, SIGNAL] = await eigenePorte("NERV_PORT", "NERV_SIGNAL_PORT");
    await server.lausche(PORT);
    const signal = await startProc("signaling-server.js", /lauscht/, { ANAZH_SIGNALING_PORT: String(SIGNAL) });
    process.on("exit", () => signal.kill()); // auch beim Absturz
    const browser = await starteBrowser({ art: "null", frist: 240000 });
    const seite = async (k) => {
        const page = await k.newPage();
        await nullRenderer(page);
        await page.evaluateOnNewDocument(seitenHelfer);
        await page.setViewport({ width: 1280, height: 720 });
        await server.zeige(page, 30000);
        return page;
    };
    // der Spieler und sein Mitspieler (eigenes Profil: eigene Platte, eigener Speicher) im Raum über den signaling-Weg
    const [page, peer] = await Promise.all([seite(browser), browser.createBrowserContext().then(seite)]);
    const url = `ws://127.0.0.1:${SIGNAL}`;
    for (const p of [page, peer])
        await p.evaluate(async (u) => (await window.__buch()).initP2PSync("k5", { url: u }), url);
    for (const p of [page, peer]) await waitFor(p, () => r.state.p2p.peers.size > 0, "der Mitspieler");

    // ===== C · E: ein Ort vor der Lichtung (schöpfer, Ego) =====
    const [c, e] = await page.evaluate(async () => {
        const r = await window.__buch();
        const [f, st] = [r._foundry, r.state];
        const sk = r.constructor._studioRenderConfig.placement.scale;
        const c = [r._foundryWorldScaleMatrix("eiche").elements[0]];
        sk.eiche *= 2; // der „Schöpfer editiert das Vorlagefile"-Moment
        c.push(r._foundryWorldScaleMatrix("eiche").elements[0]);
        sk.eiche /= 2;
        const pl = r._placePolicyFor(f.recipes.meilenstein);
        const bp = (i) => (st.blueprints["stele_" + i] || {}).studioGestalt === i;
        const P = (r._genesisPlattform() || st.playerMesh).position;
        for (let x = P.x + 40; !st.frei; x++)
            if (r._landAt(x, P.z, 1) && !r._imGrundriss(x, P.z, 0.8, 12))
                st.frei = { x, y: r._voxelSurfaceY(x, P.z), z: P.z, r: 12 };
        r.setGameMode("schöpfer");
        r.setCameraMode("first");
        st.playerMesh.position.set(st.frei.x, st.frei.y + 1.2, st.frei.z);
        [st.yaw, st.pitch] = [0, -0.45];
        window.__takt = setInterval(() => r._gameLoopTick(performance.now()), 40); // der Loop läuft unter den Eingaben
        const e = {
            regler: (f.paramsByKind.stele || []).length,
            bauplaene: ["meilenstein", "grenzstein", "obelisk"].filter(bp).length,
            ort: r._placeDispatch(pl, {}) === null && pl.siteTag,
        };
        // S — der Stammbaum der lebenden Welt und seine Bibliothek (jeder Knoten ein Element, jeder sichtbare Bauplan EINE Zeile),
        // gerendert nach einem Tausch bei gleicher Zahl: der Merker sah __s, dann fällt __s und __t kommt — ein Merker, der die
        // Zahl statt des Stands liest, liefert den alten Baum, und die Bibliothek zählt eine Zeile zu wenig (30.10., M4-Band)
        const B = r._stammbaum();
        const bps = st.blueprints;
        bps.__s = {};
        r._stammbaum();
        bps.__t = bps.__s;
        delete bps.__s;
        const liste = document.getElementById("workshop-list");
        r._workshopRenderBlueprintList(liste, r._ensureWorkshopState());
        const im = new Set([...liste.querySelectorAll("[data-knoten]")].map((x) => x.dataset.knoten));
        const zeilen = [...liste.querySelectorAll(".workshop-list-row")].map((x) => x.dataset.blueprint);
        const sichtbar = Object.keys(bps).filter((n) => r._katalogSichtbar(n)).length;
        delete bps.__t;
        const baum = B.wurzeln
            .flatMap((w) => [w, ...w.kinder.flatMap((b) => [b, ...b.kinder])])
            .map((k) => [k.id, k.lab, k.quelle, k.ziel, k.konsum]);
        const namen = (l) =>
            l
                .map((x) => x.name || x)
                .sort()
                .join(" ");
        e.stamm = {
            teile: [B.befund.teile, B.befund.mitQuelle],
            waisen: namen(B.befund.ohneEltern),
            zwillinge: namen(B.befund.zwillinge),
            tot: namen(B.befund.tot),
            ohneGriff: namen(B.befund.ohneGriff),
            bibliothek:
                baum.flatMap(([id]) => (im.has(id) ? [] : id)).join(" ") +
                (zeilen.length === new Set(zeilen).size && zeilen.length === sichtbar
                    ? ""
                    : `${zeilen.length} Zeilen ≠ ${sichtbar} nach dem Tausch`),
            wort: B.teile
                .filter((t) => t.rezept && t.ziel && r._studioBlueprintForWord(t.rezept) !== t.ziel)
                .map((t) => t.rezept)
                .join(" "),
            baum,
        };
        return [c.map((v) => +v.toFixed(4)), e];
    });
    // der Weg des Spielers: B, die Suche, der Meilenstein (die Kosten-Leiste), sein Griff in der Bibliothek, F
    const klick = async (sel) => {
        await (await page.waitForSelector(sel, { visible: true })).click();
    };
    try {
        await page.keyboard.press("KeyB");
        await klick("#workshop-search");
        await klick('#workshop-list .workshop-list-row[data-blueprint="stele_meilenstein"]');
        const leiste = () => {
            const z = [...document.querySelectorAll("#workshop-recipe-panel .h-kosten-zeile")];
            const t = z.map((x) => ({ klasse: x.className.split(" ").pop(), ...x.dataset }));
            return t.length && t.every((x) => x.leiste) && t;
        };
        e.kosten = await (await page.waitForFunction(leiste, { timeout: 60000 })).jsonValue();
        await klick("#workshop-search");
        await klick('#workshop-list [data-knoten="rezept:meilenstein"] .stammbaum-griff');
        await page.keyboard.press("KeyF");
        // steht er vor dem Spieler, tritt der Spieler 4 · 25 · 50 m zurück: L0 · L1 · L2
        Object.assign(
            e,
            await page.evaluate(async () => {
                const da = () => window.__stele(st.frei);
                const steht = await window.__gebautNach("der Meilenstein", { fertig: da }).then(
                    () => true,
                    (x) => x.message
                );
                clearInterval(window.__takt);
                const w = window.__stele();
                const lod = [];
                for (const d of [4, 25, 50]) {
                    st.playerMesh.position.set(w.position.x + d, w.position.y + 1.2, w.position.z);
                    const s = lod.length;
                    await window.__gebautNach("die Stufe " + s, {
                        fertig: () => w._servedLod === s && w.instSlots.length,
                    });
                    const geo = new Set(w.instSlots.map((x) => st.archInstanceGroups.get(x.key).mesh.geometry));
                    const tris = [...geo].reduce((n, g) => n + g.index.count / 3, 0);
                    lod.push({ d, ist: w._servedLod, tris, bau: window.__bauWerk(w) });
                }
                r.saveState();
                const werk = { stand: window.__werkStand(w), id: w.id, seed: w.seed, ov: w.studioOv };
                return { steht, lod, werk, stelle: { x: w.position.x, z: w.position.z, r: 0.01 } };
            })
        );
        // P2P: das Werk reiste beim Setzen (`confirmBuild` → `_werkProgramm`), der Mitspieler baut es und zeigt es nah
        e.p2p = await peer.evaluate(async (id) => {
            const takt = async () => r._gameLoopTick(performance.now());
            const w = () => r.state.architectures.find((a) => a.id === id);
            await window.__gebautNach("das Werk beim Mitspieler", { fertig: w, takt });
            r.state.playerMesh.position.copy(w().position).x += 4;
            await window.__gebautNach("seine Stufe 0", {
                fertig: () => w()._servedLod === 0 && w().instSlots.length,
                takt,
            });
            return { bau: window.__bauWerk(w()), stand: window.__werkStand(w()) };
        }, e.werk.id);
        await sleep(1500); // der IDB-Put des Saves landet, bevor der Reload ihn abschneidet
        await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        e.geladen = await page.evaluate(async (o) => {
            await window.__buch();
            const fertig = () => (window.__stele(o) || {}).instFoundry && window.__stele(o).instSlots.length;
            return window.__gebautNach("der Meilenstein nach dem Laden", { fertig }).then(
                () => true,
                (x) => x.message
            );
        }, e.stelle);
        // KI-Satz: der Satz geht an die KI (`maybeAnswerWithLlm`), ihre Antwort ist ein fester DSL-Text (spawn_studio mit Reglern)
        e.ki = await page.evaluate(async (o) => {
            const x = o.x + 6;
            const program = [
                "spawn_studio",
                "obelisk",
                ["at", x, r._voxelSurfaceY(x, o.z), o.z],
                1,
                4711,
                { hoehe: 3.6 },
            ];
            Object.assign(st.llm, { enabled: true, provider: "ollama" }).providerConfig.ollama.endpoint =
                "http://127.0.0.1:9";
            const [netz, ki] = [window.fetch, "http://127.0.0.1:9/"];
            let prompt = "";
            window.fetch = async (u, a) => {
                if (!String(u).startsWith(ki)) return netz(u, a);
                prompt = JSON.parse(a.body).messages[0].content;
                return new Response(
                    JSON.stringify({ message: { content: JSON.stringify({ say: "Er steht.", program }) } })
                );
            };
            r.processChatCommand("Ich wünsche mir am Weg einen hohen Obelisken");
            st.playerMesh.position.x = x + 4;
            const w = () => st.architectures.find((a) => a.type === "stele_obelisk");
            await window.__gebautNach("der Obelisk des Satzes", {
                fertig: () => w() && w()._servedLod === 0 && w().instSlots.length,
            });
            window.fetch = netz;
            return { bau: window.__bauWerk(w()), lehrt: /\bobelisk\b/.test(prompt), seed: w().seed, ov: w().studioOv };
        }, e.stelle);
        // Foundry: build-asset über die Brücke der Welt — die Kette des Werks, der KI-Bau und sein ungeprägter Zwilling
        e.foundry = await page.evaluate(
            async (w, k, F = window.__bauFoundry) => ({
                lod: await Promise.all([0, 1, 2].map((l) => F("meilenstein", w.seed, l, w.ov))),
                ki: await F("obelisk", k.seed, 0, k.ov),
                roh: await F("obelisk", k.seed, 0, null),
            }),
            e.werk,
            e.ki
        );
    } catch (x) {
        e.fehler = String((x && x.message) || x);
    }
    // die Zahl: wie oft der Wirt (Stamm, Seite, Manifest, Kerne, Brücke) die Art nennt
    const wirt = [
        "index.html",
        "cores.manifest.json",
        ...MANIFEST.flatMap((k) => k.scripts.concat(k.bruecke || [])),
    ].map(lies);
    e.nennt = (
        wirt
            .concat(stammText(ROOT))
            .join("\n")
            .match(/stele|meilenstein|grenzstein|obelisk/gi) || []
    ).length;
    await browser.close();
    server.close();
    // der Atlas (`npm run atlas -- --find neuntes`, dazu die Art in jedem Buch): die EINE Quelle
    const atlas = require("child_process").execFileSync(
        process.execPath,
        ["scripts/diag-atlas.cjs", "--find", "neuntes|^stele$"],
        {
            cwd: ROOT,
        }
    );
    e.atlas = [...String(atlas).matchAll(/^ {2}(\S+):\d+ +\w+ {2}→ {2}Gesetzbuch/gm)].map((m) => m[1]).join(" + ");

    // S — jede Quelle auf Datei:Zeile; die Tafel druckt den Baum (Studio › Bereich › Teil [Datei:Zeile] → Ziel · Leser)
    const { baum, ...S } = e.stamm;
    const ohne = [];
    console.log("\n=== S: DER STAMMBAUM DER TEILE ===");
    for (const [id, lab, q, ziel, konsum] of baum) {
        const z = q && q.datei && zeileIn(q.datei, q.anker, lab);
        if (q && q.datei && !z) ohne.push(`${q.datei} ${q.anker}`);
        console.log(
            `  ${id} „${lab}" ${z ? `[${q.datei}:${z}]` : ""} ${ziel ? `→ ${ziel} · ${konsum}` : konsum || ""}`
        );
    }
    S.ohneZeile = ohne.join(" · ");
    const sTaeter = stammTaeter(S);
    console.log("S-ZAHL " + JSON.stringify(S));
    check("S: der Stammbaum", !sTaeter.length, sTaeter.join(" · "));
    check("C: die Welt-Skala liest die Daten (4.16·0.82)", c[0] === 3.4112, String(c[0]));
    check("C: LIVE GEWINNT — scale.eiche ×2 → 8.32·0.82", c[1] === 6.8224, String(c[1]));
    const taeter = neunTaeter(e);
    e.wege = wege(e);
    console.log("E-ZAHL " + JSON.stringify({ ...e, taeter }));
    check(
        "E: das neue Gesetzbuch steht über die Werkstatt in der Welt, ohne eine Zeile im Wirt",
        !taeter.length,
        taeter.join(" · ")
    );
    for (const w of e.wege) console.log(`    ${w.ok ? "✅" : "❌"} ${w.weg}: ${w.bau || "kein Bau"}`);
    console.log(`    ${e.atlas === NEUN ? "✅" : "❌"} Atlas: ${e.atlas || "kein Gesetzbuch"}`);
    const auf = e.wege.filter((w) => w.ok).length + (e.atlas === NEUN);
    check("E2: das neunte Buch auf allen Wegen, der Atlas nennt seine Quelle", auf === 5, `${auf}/5`);

    wandEnde(errs, "DAS NERVENSYSTEM LEBT: die Welt liest die Daten des Buchs LIVE, und ein neues Gesetzbuch steht in ihr, ohne dass der Wirt es kennt.");
});
