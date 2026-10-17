// kristall-welt.cjs — warum fehlen die Kristalle an bd74a171 (E1-Serie 17.10.: Genesis Ego 26 → 2 Zellen, Wiese 0–18 → 0)?
// In EINER laufenden Werkbank: umstellen + Lauf wie die Mess-Folge, dann je Welt die Kette Einträge → Stufe → Asset → Bruch
// für kristall_var* (Rezept `kristalle`) und fels_var* (Gegenprobe), Rezept-Art, Cache-Schlüssel, die Atlas-Wartenden (B3a),
// das Bruch-Buch; ein zweiter Blick nach 60 s weiteren Takten.
//   node kristall-welt.cjs --ort genesis --sicht ego --datei <pfad>
"use strict";
const http = require("http");
const fs = require("fs");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const ORT = opt("--ort", "genesis"),
    SICHT = opt("--sicht", "ego"),
    DATEI = opt("--datei", `kristall-${ORT}-${SICHT}.json`),
    PORT = Number(opt("--port", 4490));
function R(weg, nutzlast) {
    return new Promise((res, rej) => {
        const body = JSON.stringify(nutzlast || {});
        const req = http.request(
            { host: "127.0.0.1", port: PORT, path: weg, method: "POST", headers: { "Content-Type": "application/json" } },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch (_e) {
                        res({ roh: d.slice(0, 400) });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(1800000, () => req.destroy(new Error(`${weg}: Frist`)));
        req.end(body);
    });
}
const BLICK = `
const st = r.state, f = r._foundry, p = st.playerMesh.position;
const R = Number.isFinite(st.architectureCullingRadius) ? st.architectureCullingRadius : 150;
const d = (e) => Math.round(Math.hypot(e.position.x - p.x, e.position.z - p.z));
const alle = (st.architectures || []).filter((e) => e && e.type);
const grp = (re) => {
    const l = alle.filter((e) => re.test(e.type));
    const nah = l.filter((e) => e.position && d(e) <= R);
    const zaehl = {};
    for (const e of nah) { const k = (r._archIsRendered(e) ? "gezeichnet" : "ungezeichnet") + ":" + r._foundryPresetForEntry(e); zaehl[k] = (zaehl[k] || 0) + 1; }
    return { gesamt: l.length, nah: nah.length, zaehl,
        beispiele: nah.filter((e) => !r._archIsRendered(e)).slice(0, 5).concat(nah.filter((e) => r._archIsRendered(e)).slice(0, 2)).map((e) => {
            const o = { t: e.type, d: d(e), preset: r._foundryPresetForEntry(e), lod: r._foundryLodForEntry(e), mesh: !!e.mesh, inst: !!e.instanced };
            for (const k of Object.keys(e)) if (/foundry|kalt|warte|lod|stufe|satz|_studio|gestalt|fehl|bruch/i.test(k)) { const v = e[k]; o[k] = v == null || typeof v !== "object" ? v : Array.isArray(v) ? "arr" + v.length : "obj"; }
            return o;
        }) };
};
const out = { version: AnazhRealm.VERSION, spieler: [Math.round(p.x), Math.round(p.z)], R };
out.kristall = grp(/^kristall/);
out.felsVar = grp(/^fels_var/);
out.rezept = f && f.recipes ? { kristalle: f.recipes.kristalle ? f.recipes.kristalle.kind : null, zacken: f.recipes.zacken ? f.recipes.zacken.kind : null } : null;
const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
out.budget = L && L.budget ? { crystal: L.budget.crystal ? Object.keys(L.budget.crystal) : null, rock: L.budget.rock ? Object.keys(L.budget.rock) : null } : null;
out.atlas = f ? { blattAtlas: f.blattAtlas, nachAtlas: f.nachAtlas ? f.nachAtlas.length : "fehlt", wirt: f.wirt, buchWartet: !!f.buch } : null;
out.cache = f ? [...f.cache.keys()].filter((k) => /^(kristalle|zacken)\\|/.test(k)).map((k) => { const v = f.cache.get(k); return k + "=" + (v === null ? "null" : v && v.children ? "kinder " + v.children.length + " [" + v.children.map((c) => c.userData && (c.userData.foundryKind || c.userData.kind) || c.name || "?").slice(0, 6).join(",") + "]" : typeof v); }) : null;
out.pending = f && f.pending ? f.pending.size : null;
out.bruch = r._bruchBuch ? [...r._bruchBuch.entries()].map(([t, e]) => String(t).slice(0, 220) + " ×" + e.n) : [];
out.bp = Object.keys(st.blueprints || {}).filter((k) => /kristall/.test(k)).map((k) => k + (st.blueprints[k].donorOnly ? "(donor)" : ""));
return out;`;
(async () => {
    const aus = { ort: ORT, sicht: SICHT, start: new Date().toISOString() };
    const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
    aus.fenster = await R("/fenster", { w: 1920, h: 1080 });
    aus.umstellen = await R("/umstellen", { ort: ORT, sicht: SICHT });
    log(`umstellen ${ORT}/${SICHT}: ${JSON.stringify(aus.umstellen).slice(0, 160)}`);
    aus.buehne = await R("/eval", { code: "return window.__buehne();" });
    aus.lauf = await R("/lauf", { sek: 15, ein: 20, ruhe: 300, regler: "voll", tiere: "frei" });
    log(`lauf fps ${aus.lauf && (aus.lauf.ergebnis || aus.lauf).fps}`);
    aus.blick1 = await R("/eval", { code: BLICK });
    log("blick1 " + JSON.stringify(aus.blick1).slice(0, 1500));
    aus.takte = await R("/eval", { code: "for (let i = 0; i < 600; i++) { window.__wetterHalten && window.__wetterHalten(); r._gameLoopTick(performance.now()); await new Promise((q) => setTimeout(q, 50)); } return 600;" });
    aus.blick2 = await R("/eval", { code: BLICK });
    log("blick2 " + JSON.stringify(aus.blick2).slice(0, 1500));
    fs.writeFileSync(DATEI, JSON.stringify(aus, null, 1));
})().catch((e) => {
    console.error("kristall-welt FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
