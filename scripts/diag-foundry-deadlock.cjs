// diag-foundry-deadlock.cjs — P4-BEWEIS: die Deadlock-Heilung. Unter erzwungenem ÜBER-Budget
// konvergieren die NAHEN Foundry-Bäume von KALT zu platziert (instFoundry) — vorher (bakeBudget=0
// über Budget) blieben sie ewig kalt = die kahle Nähe. Der Worker (P3a) bäckt off-thread, deshalb
// darf über Budget gebacken werden. Misst die Konvergenz mit einer Zahl.
//   node scripts/diag-foundry-deadlock.cjs

const { statikServer, hauptLauf, nullSeite } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.DEADLOCK_PORT || 4581);
const server = statikServer();

hauptLauf(async () => {
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 180000 }); // die Foundry baut auch ohne Bild (die echte Pipeline)
    await server.zeige(page, 30000);
    await page.evaluate(async () => {
        await window.__weltDa((r) => r.state && r.state.blueprints);
    });

    const S = await page.evaluate(async () => {
        const out = { ready: false, coldBefore: 0, foundryBefore: 0, foundryAfter: 0, ticks: 0, err: null };
        const isTree = (e) =>
            e && e.position && !!r._foundryPresetForEntry(e);
        try {
            // Foundry-Worker hochfahren + warten.
            const f = r._ensureAssetFoundry();
            await window.__weltDa(() => !(f && !f.ready));
            out.ready = !!(f && f.ready);
            if (!out.ready) {
                out.err = "Worker nicht ready";
                return out;
            }

            // Die Welt streamen lassen, damit Baum-Architekturen entstehen (als KALTE Foundry-Einträge).
            for (let i = 0; i < 120; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch {}
                await sleep(0);
            }

            const archs = () => (Array.isArray(r.state.architectures) ? r.state.architectures : []);
            // Die Nähe ist der Cull-Radius, den `_foundryRewarmColdTrees` liest; jenseits trägt die Fernform, dort
            // bleibt ein Baum kalt (kein Deadlock).
            const pm = r.state.playerMesh.position;
            const radSq = (r.state.architectureCullingRadius || 200) ** 2;
            const nah = (e) => (e.position.x - pm.x) ** 2 + (e.position.z - pm.z) ** 2 <= radSq;
            const kalt = (e) => isTree(e) && !e.instanced && !e.mesh;
            const cold = () => archs().filter((e) => kalt(e) && nah(e)).length;
            const foundry = () => archs().filter((e) => isTree(e) && e.instFoundry && (e.instanced || e.mesh)).length;
            // DIE VORAUSSETZUNG BAUEN: seit der EINEN Nah-Grenze (121856c) ist die Nähe nach dem Warm-up schon
            // konvergiert (die 8 kalten stehen bei 150-168 m). Der
            // Spieler tritt an den nächsten kalten Baum heran (20 m davor, wie im Gehen) — die Bäume, die dabei in den
            // Radius kommen, sind die kalte Nähe, die unter Last konvergieren muss.
            out.coldFern = archs().filter((e) => kalt(e) && !nah(e)).length;
            if (cold() === 0) {
                let ziel = null,
                    zd = Infinity;
                for (const e of archs()) {
                    if (!kalt(e)) continue;
                    const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
                    if (d < zd) ((zd = d), (ziel = e));
                }
                if (ziel) {
                    const k = Math.max(0, zd - 20) / zd;
                    pm.x += (ziel.position.x - pm.x) * k;
                    pm.z += (ziel.position.z - pm.z) * k;
                    out.schritt = Math.round(zd - 20);
                }
            }
            // Ist die Welt ganz konvergiert (der CI-Runner backt im Warm-up jeden Baum, auch jenseits des Radius), entsteht
            // die kalte Nähe wie im Spiel nach einer
            // Räumung: die nächsten Foundry-Bäume verlieren Platz UND Körper über die EINE Räumungs-Naht
            // _foundryCacheEvict — sie sind nicht gedockt und müssen unter Über-Budget neu BACKEN (der Deadlock-Pfad).
            if (cold() === 0) {
                const fc = r._foundry;
                const platziert = archs()
                    .filter((e) => isTree(e) && nah(e) && e.instFoundry && (e.instanced || e.mesh))
                    .sort(
                        (a, b) =>
                            (a.position.x - pm.x) ** 2 +
                            (a.position.z - pm.z) ** 2 -
                            ((b.position.x - pm.x) ** 2 + (b.position.z - pm.z) ** 2)
                    )
                    .slice(0, 8);
                const arten = new Set(platziert.map((e) => r._foundryPresetForEntry(e)));
                for (const e of platziert) {
                    if (e.instanced) r._archInstanceRemove(e);
                    else if (e.mesh) r._cullArchitectureMesh(e);
                    e.instFoundry = false;
                }
                for (const k of [...fc.cache.keys()]) if (arten.has(k.split("|")[0])) r._foundryCacheEvict(k);
                out.gekuehlt = platziert.length;
            }
            out.coldBefore = cold();
            out.foundryBefore = foundry();

            // JETZT: ÜBER-Budget erzwingen + den Konvert-Tick pumpen. Vor der Heilung (bakeBudget=0) würde KEIN kalter
            // Baum konvergieren; mit der Heilung (bakeBudget=2) konvergieren sie. Der Takt unter Dauer-Last ist BEIDES,
            // was das Spiel dann trägt: die Schlange des Walds mit dem Boden der Welt-Substanz (`_dispatchFrameJobs`:
            // prio 1 bekommt über Budget `FRAME_SCHED_SUBSTANZ_FLOOR_MS`) und der Rewarm — seit K69 wartet die Gestalt
            // eines Baums auf den Plan seines Walds (`_ortGestaltSame`), ein Pumpen nur des Rewarms ließ 8 von 8 kalt.
            const A = window.AnazhRealm || r.constructor;
            for (let i = 0; i < 400; i++) {
                r.state._frameOverBudget = true; // Dauer-Last simulieren
                r.state._frameChunksBuilt = false; // das terrain-first-Gate offen halten
                try {
                    r._tickWaldPlan(A.FRAME_SCHED_SUBSTANZ_FLOOR_MS);
                    r._foundryRewarmColdTrees();
                } catch (e) {
                    // ein Wurf im Takt ist ROT beim Namen, nie still verschluckt
                    out.err = out.err || "Takt " + i + ": " + ((e && e.message) || String(e));
                }
                await sleep(0); // dem Worker die Message-Runde geben
                out.ticks++;
            }
            out.foundryAfter = foundry();
            out.coldAfter = cold();
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        return out;
    });

    await browser.close();
    server.close();

    console.log("=== P4 — DEADLOCK-HEILUNG (Konvergenz der Nähe unter ÜBER-Budget) ===");
    console.log(`  Worker ready: ${S.ready}`);
    if (S.schritt != null)
        console.log(
            `  Voraussetzung: die Nähe war konvergiert, ${S.coldFern} kalte Bäume jenseits des Radius — der Spieler trat ${S.schritt} m heran`
        );
    if (S.gekuehlt != null)
        console.log(`  Voraussetzung: die Welt war ganz konvergiert — ${S.gekuehlt} nahe Bäume geräumt (Platz + Körper)`);
    console.log(`  Baum-Einträge kalt im Radius (vorher): ${S.coldBefore} · schon foundry-platziert: ${S.foundryBefore}`);
    console.log(
        `  nach ${S.ticks} Konvert-Ticks @ over-budget: foundry-platziert = ${S.foundryAfter} · kalt im Radius = ${S.coldAfter}`
    );
    if (S.err) console.log(`  Fehler: ${S.err}`);

    const converged = S.foundryAfter - S.foundryBefore;
    // Nicht vakuös: ohne kalte Nähe gibt es nichts zu beweisen (die Voraussetzung baut der Lauf oben).
    const ok = S.ready && !S.err && S.coldBefore > 0 && converged > 0;
    if (!ok) {
        console.error(
            S.err
                ? `\n❌ ROT — der Takt warf: ${S.err}`
                : S.coldBefore > 0
                ? `\n❌ ROT — unter Über-Budget konvergierte NICHTS (Δ=${converged}) → der Deadlock lebt.`
                : `\n❌ ROT — keine kalte Nähe (auch nach dem Heran-Treten) → die Linse wäre vakuös.`
        );
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — unter Dauer-Über-Budget konvergierten +${converged} Nah-Bäume von KALT zu Foundry (vorher: bakeBudget=0 → 0). Der Deadlock ist geheilt.`
    );
    process.exit(0);
});
