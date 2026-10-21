// M16 Speicher K1 — der Tab-Tod auf dem Browser-Pfad (Host ohne save-server: isSaveServerHost nur :4312, hier :7960).
// Je Zyklus: Boot mit demselben Profil, geladene Pose lesen, gehen (W gehalten), dann den Browser-Prozess hart töten —
// an einem Schreib-Haken (zwischen den Schreibern von saveState) oder zu einer zufälligen Zeit. Danach: welcher Stand
// kam zurück (Quelle der Rettungs-Kette), wie alt (Zeit seines Schreibens bis zum Tod), korrupt, halb (neue Welt-ID).
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { oeffne, taste, klick, warte } = require("./spiel.cjs");
const S = __dirname;
const PROFIL = path.join(S, "profil-tabtod");
const N = Number(process.argv[2] || 20);
const OUT = path.join(S, "roh", "m16-tabtod.json");

function haken() {
    // läuft vor jedem Skript der Seite: jeder Schreib-Aufruf mit Zeit und Pose des geschriebenen Stands
    const log = (window.__schreibLog = []);
    const pose = (v) => {
        if (typeof v !== "string") return null;
        const i = v.indexOf('"playerPosition":{');
        if (i < 0) return null;
        const m = /"x":(-?[\d.e+-]+),"y":(-?[\d.e+-]+),"z":(-?[\d.e+-]+)/.exec(v.slice(i, i + 200));
        return m ? [+m[1], +m[3]] : null;
    };
    const set = Storage.prototype.setItem;
    let n = 0;
    Storage.prototype.setItem = function (k, v) {
        const r = set.call(this, k, v);
        n++;
        const e = { n, t: Date.now(), art: "ls", k: String(k).slice(0, 60), len: String(v).length, pose: pose(v) };
        log.push(e);
        if (log.length > 400) log.splice(0, 200);
        console.log("__W__ " + JSON.stringify(e));
        if (window.__killBei && window.__killBei(e)) {
            console.log("__KILL__ " + JSON.stringify(e));
            const dl = performance.now() + 8000;
            while (performance.now() < dl); // der Faden steht zwischen zwei Schreibern, bis der Prozess stirbt
        }
        return r;
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, k) {
        const req = put.apply(this, arguments);
        const e = { n: ++n, t: Date.now(), art: "idb", k: String((v && v.worldId) || k || this.name).slice(0, 60), pose: pose(v && v.json) };
        log.push(e);
        req.addEventListener("success", () => (e.ok = Date.now()));
        console.log("__W__ " + JSON.stringify(e));
        if (window.__killBei && window.__killBei(e)) {
            console.log("__KILL__ " + JSON.stringify(e));
            const dl = performance.now() + 8000;
            while (performance.now() < dl);
        }
        return req;
    };
}

(async () => {
    const zyklen = [];
    let vorher = null; // der Zyklus davor: Schreib-Log + Todeszeit
    const alle = []; // jeder Schreiber aller Zyklen
    for (let z = 0; z <= N; z++) {
        const konsole = [];
        const wlog = [];
        const o = await oeffne({ profil: PROFIL, neu: z === 0, vorDoc: [haken] });
        o.page.on("console", (m) => {
            const t = m.text();
            if (t.startsWith("__W__ ")) { try { wlog.push(JSON.parse(t.slice(6))); } catch (_e) {} return; }
            if (/Welt aus|korrupt|ließ sich nicht|Spielerposition geladen|frische Welt|createNewWorld|Neue Welt/i.test(t)) konsole.push(t.slice(0, 240));
        });
        // die geladene Lage: Welt-ID, Pose, Edits — VOR jeder Bewegung
        const geladen = await o.page.evaluate(() => {
            const r = window.anazhRealm, st = r.state, p = st.playerMesh.position;
            return {
                worldId: st.worldMeta && st.worldMeta.worldId,
                pose: [p.x, p.z],
                edits: Object.keys((st.worldMeta && st.worldMeta.voxelEdits) || {}).length,
                welten: (r.worldsIndexLoad ? r.worldsIndexLoad() : []).length,
            };
        });
        const zeile = { z, bootMs: o.bootMs, geladen, konsole: [], fehler: o.fehler.slice(0, 5) };
        if (vorher) {
            // welcher geschriebene Stand kam zurück? die nächste Pose im Schreib-Log des Zyklus davor
            let best = null;
            for (const e of alle) {
                if (!e.pose || /.bak$/.test(e.k)) continue; // die .bak-Kopie trägt einen alten Stand, ihr Zeitpunkt ist nicht sein Alter
                const d = Math.hypot(e.pose[0] - geladen.pose[0], e.pose[1] - geladen.pose[1]);
                if (!best || d < best.d || (d === best.d && e.t > best.e.t)) best = { d, e };
            }
            zeile.vorTod = vorher.art;
            zeile.gleicheWelt = geladen.worldId === vorher.worldId;
            zeile.treffer = best && { d: +best.d.toFixed(3), art: best.e.art, k: best.e.k, n: best.e.n };
            zeile.alterS = best && best.d < 0.05 ? +((vorher.tTod - best.e.t) / 1000).toFixed(2) : null;
            // Lage beim Tod (zuletzt gelesene Pose) gegen die geladene: Weg-Verlust in m
            zeile.wegVerlustM = vorher.poseTod ? +Math.hypot(vorher.poseTod[0] - geladen.pose[0], vorher.poseTod[1] - geladen.pose[1]).toFixed(2) : null;
        }
        // Zeiger fangen (Klick), gehen, töten
        const art = z % 2 === 0 ? "haken" : "zufall";
        const welcherHaken = ["bak", "platz", "versionen", "idb", "index"][Math.floor(z / 2) % 5];
        await klick(o.cdp);
        await warte(500);
        await taste(o.cdp, "w", "keyDown");
        let tTod = null;
        const killNode = () => {
            if (tTod) return;
            tTod = Date.now();
            try { execSync(`taskkill /F /T /PID ${o.browser.process().pid}`, { stdio: "ignore" }); } catch (_e) {}
        };
        const getot = new Promise((res) => {
            o.page.on("console", (m) => {
                if (m.text().startsWith("__KILL__")) {
                    killNode();
                    zeile.killPunkt = m.text().slice(9, 200);
                    res();
                }
            });
        });
        const dauer = 6000 + Math.random() * 30000;
        // die Pose fortlaufend mitlesen (für den Weg-Verlust)
        let poseTod = null;
        const lese = setInterval(async () => {
            try {
                poseTod = await o.page.evaluate(() => [window.anazhRealm.state.playerMesh.position.x, window.anazhRealm.state.playerMesh.position.z]);
            } catch (_e) {}
        }, 200);
        if (art === "haken" && z < N) {
            // den Haken scharf schalten: nach `dauer` beim nächsten Schreiber dieser Art
            await warte(dauer);
            await o.page.evaluate((h) => {
                window.__killBei = (e) =>
                    h === "bak" ? e.art === "ls" && /\.bak$/.test(e.k)
                    : h === "platz" ? e.art === "ls" && /^anazhRealmState_/.test(e.k) && !/\.bak$/.test(e.k)
                    : h === "versionen" ? e.art === "ls" && e.k === "anazhRealmVersions"
                    : h === "idb" ? e.art === "idb"
                    : e.art === "ls" && e.k === "anazhRealmWorlds";
            }, welcherHaken);
            zeile.haken = welcherHaken;
            await Promise.race([getot, warte(25000)]);
            if (!tTod) { zeile.hakenVerfehlt = true; killNode(); }
        } else if (z < N) {
            await warte(dauer);
            killNode();
        }
        clearInterval(lese);
        if (z === N) {
            try { await o.browser.close(); } catch (_e) {}
        }
        zeile.konsole = konsole;
        zeile.art = z < N ? art : "ende";
        zeile.dauerS = +(dauer / 1000).toFixed(1);
        alle.push(...wlog); vorher = { tTod: tTod || Date.now(), art: zeile.art + (zeile.haken ? ":" + zeile.haken : ""), worldId: geladen.worldId, poseTod };
        zyklen.push(zeile);
        fs.writeFileSync(OUT, JSON.stringify(zyklen, null, 1));
        console.log(`z${z} ${zeile.vorTod || "-"} welt=${zeile.gleicheWelt} alter=${zeile.alterS} weg=${zeile.wegVerlustM} treffer=${JSON.stringify(zeile.treffer)} boot=${o.bootMs}`);
        await warte(1500);
    }
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    process.exit(1);
});
