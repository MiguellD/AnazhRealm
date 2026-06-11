// Ω5 (V18.140, taille-spec §5) — DAS PERPETUUM-VERBOT als Messung: der
// Transformations-Graph (Materie→Werk [Bauen/Mach-Tor] · Werk→Materie [Abbau]
// · Werk→Plan [ablesen, frei] · Plan→Werk [fertigen, zahlt] · Modus-Wechsel)
// wird headless gewalkt: KEIN Zyklus über SPIELER-WERKE ist netto-positiv.
// (Die WELT selbst — Worldgen-Bäume/Flora — ist die legitime Quelle, wie in
// Minecraft: Quellen sind kein Zyklus.) Gezielte Zyklen zuerst:
//   Z1 pfad: bauen (zahlt k·V) → abbauen (erntet ≤ k·V·yieldMult) → netto ≤ 0
//   Z2 die MODUS-WÄSCHE: schöpfer baut GRATIS → pfad erntet → netto ＞ 0?
//      (der benannte Riss-5-Kandidat — Heilung: freeBorn erntet zu 0)
//   Z3 Werk → ablesen (frei) → fertigen (zahlt) → kein Gewinn-Pfad
//   Z4 Random-Walk: N zufällige bau/ernte/modus-Schritte → Bilanz ≤ 0
// Exit 1, wenn ein Spieler-Werk-Zyklus netto-positiv ist.
//   node scripts/diag-ledger-cycles.cjs

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    let fail = false;
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 15000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.blueprints ||
                    !window.anazhRealm.state.scene) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });

        const res = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            // ── das Mess-Werk: ein reiner Stein-Block (Kosten deterministisch).
            r.state.blueprints["_ledger_werk"] = {
                name: "_ledger_werk",
                label: "Ledger-Werk",
                builtIn: false,
                parts: [
                    {
                        shape: "box",
                        material: "stein",
                        position: { x: 0, y: 0.75, z: 0 },
                        size: { x: 1.5, y: 1.5, z: 1.5 },
                        rotation: { x: 0, y: 0, z: 0 },
                        opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                    },
                ],
                connections: [],
            };
            const cost = r.computeBuildCost("_ledger_werk");
            out.buildCost = { ...cost };
            // das ECHTE Slot-Inventar (tryConsumeBuildCost zieht aus den Slots,
            // der Abbau-Striker bucht via addMaterialToInventory ein).
            const stein = () => {
                let n = 0;
                for (const sl of r.state.player.inventory || []) {
                    if (sl && sl.kind === "material" && sl.material === "stein") n += sl.count || 0;
                }
                return n;
            };
            const give = (n) => {
                const arr = r.state.player.inventory;
                for (let i = 0; i < arr.length; i++) arr[i] = null;
                if (n > 0) arr[0] = { kind: "material", material: "stein", count: n };
            };
            const bookLoot = (loot) => {
                if (!loot || !loot.materials) return;
                for (const [mat, n] of Object.entries(loot.materials)) {
                    if (n > 0) r.addMaterialToInventory(mat, n);
                }
            };
            const spawnAt = { x: 3, y: 2, z: 3 };
            const mode = (m) => r.setGameMode(m);
            const savedMode = r.getGameMode();
            const savedInv = JSON.parse(JSON.stringify(r.state.player.inventory || []));

            // ── Z1: pfad bauen → pfad abbauen (bestes Werkzeug-fit angenommen:
            // wir ernten DIREKT mit yieldMult=1 — die OBERE Schranke).
            mode("pfad");
            give(1000);
            const gate = r._makeCostGate("_ledger_werk");
            const paid = 1000 - stein();
            let entry = gate.ok ? r.spawnArchitecture("_ledger_werk", spawnAt, { freeBorn: gate.free === true }) : null;
            let loot = entry ? r.harvestArchitecture(entry, "player", 1) : null;
            bookLoot(loot);
            const gained = loot && loot.materials ? loot.materials["stein"] || 0 : 0;
            out.z1 = { paid, gained, net: gained - paid, ok: gained - paid <= 0 };

            // ── Z2: die MODUS-WÄSCHE — schöpfer baut gratis → pfad erntet.
            mode("schöpfer");
            give(0);
            const gateS = r._makeCostGate("_ledger_werk");
            const paidS = 0 - stein();
            entry = gateS.ok ? r.spawnArchitecture("_ledger_werk", spawnAt, { freeBorn: gateS.free === true }) : null;
            mode("pfad");
            loot = entry ? r.harvestArchitecture(entry, "player", 1) : null;
            bookLoot(loot);
            const gainedS = stein();
            out.z2_modusWaesche = { paid: paidS, gained: gainedS, net: gainedS - paidS, ok: gainedS - paidS <= 0 };

            // ── Z2b: der RELOAD-Pfad der Wäsche — überlebt freeBorn den Snapshot?
            mode("schöpfer");
            const gateS2 = r._makeCostGate("_ledger_werk");
            const e2 = r.spawnArchitecture("_ledger_werk", { x: 6, y: 2, z: 6 }, { freeBorn: gateS2.free === true });
            const snap = r.buildStateSnapshot();
            const snapped = (snap.architectures || []).find((a) => a.id === e2.id);
            out.z2b_persist = { freeBornInSnapshot: !!(snapped && snapped.freeBorn === true) };
            if (e2) r.removeArchitecture(e2);

            // ── Z3: Werk → ablesen (frei) → fertigen (zahlt): das Ablesen
            // erzeugt INFORMATION (einen Plan), nie Materie. fertigeBlueprint
            // DELEGIERT an die vier Mach-Akte — JEDER trägt das _makeCostGate
            // (Source-Probe über alle Delegaten).
            // forgeBlueprint/forgeAvatar zahlen TRANSITIV über den EINEN
            // Werk-Kern _forgeMaterialAndFreeze (der das Gate trägt).
            const delegates = ["forgeBlueprint", "forgeArmor", "forgeAvatar", "brewConsumable"];
            const gateSrc = /_makeCostGate|_forgeMaterialAndFreeze/;
            out.z3 = {
                fertigenZahlt:
                    delegates.every((fn) => typeof r[fn] === "function" && gateSrc.test(r[fn].toString())) &&
                    /_makeCostGate/.test(r._forgeMaterialAndFreeze.toString()),
            };

            // ── Z4: Random-Walk (deterministisch geseedet): N Schritte
            // bauen/ernten/modus über NUR Spieler-Werke; die Bilanz (Materie-
            // Endstand − Start − Welt-Einnahmen) darf nie positiv sein.
            let s = 12345;
            const rng = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
            give(500);
            const start = 500;
            const live = [];
            let worstNet = -Infinity;
            for (let i = 0; i < 60; i++) {
                const act = rng();
                if (act < 0.3) {
                    mode(rng() < 0.5 ? "schöpfer" : "pfad");
                } else if (act < 0.65) {
                    const g = r._makeCostGate("_ledger_werk");
                    if (g.ok) {
                        const e = r.spawnArchitecture(
                            "_ledger_werk",
                            { x: 10 + live.length * 3, y: 2, z: 10 },
                            { freeBorn: g.free === true }
                        );
                        if (e) live.push(e);
                    }
                } else if (live.length) {
                    const e = live.pop();
                    bookLoot(r.harvestArchitecture(e, "player", rng()));
                }
                const net = stein() - start;
                if (net > worstNet) worstNet = net;
            }
            for (const e of live) r.removeArchitecture(e);
            out.z4_randomWalk = { worstNet, ok: worstNet <= 0 };

            // ── der benannte S-Entscheid (nicht heimlich gebaut): Werkzeuge
            // kennen keine Abnutzung — ∞-Katalysatoren (Source-Beweis: kein
            // durability/wear-Feld im Tool-Satz).
            out.toolsInfiniteCatalysts = !/durability|abnutzung|wear/i.test(
                JSON.stringify(r.constructor.TOOL_KNOWN_KEYS)
            );

            // restore
            mode(savedMode);
            r.state.player.inventory = savedInv;
            delete r.state.blueprints["_ledger_werk"];
            return out;
        });

        console.log("── Ω5 LEDGER-ZYKLEN (kein Spieler-Werk-Zyklus netto-positiv) ──");
        console.log(JSON.stringify(res, null, 2));
        const bad = [];
        if (!res.z1.ok) bad.push(`Z1 pfad-Zyklus netto +${res.z1.net}`);
        if (!res.z2_modusWaesche.ok) bad.push(`Z2 MODUS-WÄSCHE netto +${res.z2_modusWaesche.net} (schöpfer→pfad)`);
        if (!res.z2b_persist.freeBornInSnapshot)
            bad.push("Z2b freeBorn überlebt den Snapshot NICHT (Wäsche über Reload)");
        if (!res.z3.fertigenZahlt) bad.push("Z3 fertigen zahlt nicht");
        if (!res.z4_randomWalk.ok) bad.push(`Z4 Random-Walk netto +${res.z4_randomWalk.worstNet}`);
        if (bad.length) {
            console.log("\n── PERPETUUM-RISSE ──");
            for (const b of bad) console.log("  • " + b);
            fail = true;
        } else {
            console.log("\n── KEIN ZYKLUS NETTO-POSITIV — das Ledger-Gesetz hält. ──");
            console.log("(Benannt, S-Entscheid offen: Werkzeuge sind ∞-Katalysatoren — kein Verschleiß.)");
        }
    } catch (e) {
        console.error("DIAG-FEHLER:", e.message);
        fail = true;
    } finally {
        await browser.close();
        server.kill();
    }
    process.exit(fail ? 1 : 0);
})();
