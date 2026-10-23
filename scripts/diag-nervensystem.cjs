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
const { statikServer, starteBrowser, nullRenderer, ROOT } = require("./lib/welt-boot.cjs");
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
const zahl = (z) =>
    +String(z && z.text)
        .split(" / ")[0]
        .replace(/\D/g, "");
const NEUN_SOLL = [
    ["3/3 Baupläne (_kindPolicyVereinen → _foundryAutoRegisterSpecies)", (m) => m.bauplaene === 3 && m.regler === 7],
    ["das Wort (_studioBlueprintForWord)", (m) => m.wort === "stele_meilenstein"],
    ["site am Weg streut nicht (_placePolicyFor)", (m) => m.ort === "weg"],
    [
        "Kosten-Leiste L0–L2 im Budget (_workshopKostenLeiste)",
        (m) => m.kosten.length === 3 && m.kosten.every((z) => z.klasse === "pass"),
    ],
    ["die Werkstatt setzt ihn vor den Spieler", (m) => m.steht === true],
    [
        "L0 · L1 · L2 mit den gezählten Dreiecken",
        (m) => m.lod.length === 3 && m.lod.every((x, s) => x.ist === s && x.tris === zahl(m.kosten[s])),
    ],
    ["er steht nach Speichern + Neuladen", (m) => m.geladen === true],
    ["der Wirt nennt die Art nie", (m) => m.nennt === 0],
];
const neunTaeter = (m) => NEUN_SOLL.filter(([, ok]) => !ok({ kosten: [], lod: [], ...m })).map(([n]) => n);

// die Helfer der Seite (auch nach dem Neuladen)
function seitenHelfer() {
    window.__buch = () =>
        window.__weltDa((x) => x._foundry && x._foundry.ready && x._foundry.recipes && x._foundry.recipes.meilenstein);
    window.__stele = (o) =>
        window.anazhRealm.state.architectures.find(
            (a) => a.type === "stele_meilenstein" && (!o || Math.hypot(a.position.x - o.x, a.position.z - o.z) < o.r)
        );
}

(async () => {
    if (process.argv.includes("--selftest")) {
        const lod = [160, 32, 14].map((tris, ist) => ({ ist, tris }));
        const kosten = lod.map((x) => ({ klasse: "pass", text: x.tris + " / 200" }));
        const gut = {
            bauplaene: 3,
            regler: 7,
            wort: "stele_meilenstein",
            ort: "weg",
            kosten,
            steht: true,
            lod,
            geladen: true,
            nennt: 0,
        };
        const main = { regler: 7, bauplaene: 0, wort: null, ort: "weg", nennt: 0 }; // gemessen an f7dd313c
        check("Selbsttest E: gesund ist grün", !neunTaeter(gut).length, neunTaeter(gut).join(" · "));
        check("Selbsttest E: main nennt den Register-Chokepoint", /_kindPolicyVereinen/.test(neunTaeter(main)[0]));
        process.exit(errs.length ? 1 : 0);
    }
    check(
        "phytogenesis: kein lokales SCALE-Literal",
        fehlt(null, /const SCALE = \{\s*gras: 0\.24/, { datei: "worlds/terrain/phytogenesis.js" }),
        fehlt.wo
    );

    console.log("\n=== TEIL C, E: der lebende Draht (Browser, foundry-ON) ===");
    const PORT = Number(process.env.NERV_PORT || 4406);
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "null", frist: 180000 });
    const page = await browser.newPage();
    await nullRenderer(page, { foundry: true });
    await page.evaluateOnNewDocument(seitenHelfer);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

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
            wort: r._studioBlueprintForWord("meilenstein"),
            ort: r._placeDispatch(pl, {}) === null && pl.siteTag,
        };
        return [c.map((v) => +v.toFixed(4)), e];
    });
    // der Weg des Spielers: B, die Suche, der Meilenstein, „Fertigen", F
    const klick = async (sel) => {
        await (await page.waitForSelector(sel, { visible: true })).click();
    };
    try {
        await page.keyboard.press("KeyB");
        await klick("#workshop-search");
        await klick('#workshop-list .workshop-list-row[data-blueprint="stele_meilenstein"]');
        const leiste = () => {
            const z = [...document.querySelectorAll("#workshop-recipe-panel .h-kosten-zeile")];
            const t = z.map((x) => ({ klasse: x.className.split(" ").pop(), text: x.textContent.slice(2) }));
            return t.length && !t.some((x) => x.text.includes("…")) && t;
        };
        e.kosten = await (await page.waitForFunction(leiste, { timeout: 60000 })).jsonValue();
        await klick("#workshop-action-zone .workshop-fertigen");
        await page.keyboard.press("KeyF");
        // steht er vor dem Spieler, tritt der Spieler 4 · 25 · 50 m zurück: L0 · L1 · L2
        Object.assign(
            e,
            await page.evaluate(async () => {
                const st = window.anazhRealm.state;
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
                    lod.push({ d, ist: w._servedLod, tris: [...geo].reduce((n, g) => n + g.index.count / 3, 0) });
                }
                window.anazhRealm.saveState();
                return { steht, lod, stelle: { x: w.position.x, z: w.position.z, r: 0.01 } };
            })
        );
        await new Promise((ok) => setTimeout(ok, 1500)); // der IDB-Put des Saves landet, bevor der Reload ihn abschneidet
        await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        e.geladen = await page.evaluate(async (o) => {
            await window.__buch();
            const fertig = () => (window.__stele(o) || {}).instFoundry && window.__stele(o).instSlots.length;
            return window.__gebautNach("der Meilenstein nach dem Laden", { fertig }).then(
                () => true,
                (x) => x.message
            );
        }, e.stelle);
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

    check("C: die Welt-Skala liest die Daten (4.16·0.82)", c[0] === 3.4112, String(c[0]));
    check("C: LIVE GEWINNT — scale.eiche ×2 → 8.32·0.82", c[1] === 6.8224, String(c[1]));
    const taeter = neunTaeter(e);
    console.log("E-ZAHL " + JSON.stringify({ ...e, taeter }));
    check(
        "E: das neue Gesetzbuch steht über die Werkstatt in der Welt, ohne eine Zeile im Wirt",
        !taeter.length,
        taeter.join(" · ")
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DAS NERVENSYSTEM LEBT: die Welt liest die Daten des Buchs LIVE, und ein neues Gesetzbuch steht in ihr, ohne dass der Wirt es kennt."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Nervensystem-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
