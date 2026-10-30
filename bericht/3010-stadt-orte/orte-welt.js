// w4-stadt-orte — DIE ORTE IN DER WELT (werkbank eval, r = Welt, T = THREE): an der Stadt der Grundstellung `stadt` (Plan v2
// mit Orten) je Ort mit Rolle (1) was auf seiner Fläche steht (Natur, Würfe des Felds, Tiere aus Würfen), (2) die Natur-Wand
// und die Geburt auf einem Raster seiner Fläche, (3) die Engstelle des Nexus: jeder Ort, den der Nexus dort wählt (`at`), und
// 2000 Würfe `far_player` 180–380 m um einen Spieler am Rand des Orts, (4) das Gehege: seine Herde (gesetzt, im Zaun) nach
// 20 s Kreatur-Takt mit dem Spieler, der quer zur Aussicht auf die Mitte zugeht.
const st = r.state;
const FC = globalThis.__fachwerkCore;
const pm = st.playerMesh.position;
const plaene = [...((r._ortPlaene && r._ortPlaene.values()) || [])].filter((p) => p && p.version === 2 && Array.isArray(p.orte) && p.ort);
plaene.sort((a, b) => Math.hypot(a.ort.x - pm.x, a.ort.z - pm.z) - Math.hypot(b.ort.x - pm.x, b.ort.z - pm.z));
const plan = plaene[0];
if (!plan) return { fehler: "keine Stadt mit Orten (Plan v2) in der Welt", plaene: (r._ortPlaene && r._ortPlaene.size) || 0 };
const O = plan.ort;
const aus = { stadt: { x: +O.x.toFixed(1), z: +O.z.toFixed(1), slots: plan.slots.length, orte: plan.orte.map((o) => o.rolle), fehlen: plan.orteFehlen || null, imWasser: plan.orteImWasser || null }, je: {} };
const welt = (f) => Object.assign({}, f, { cx: O.x + f.cx, cz: O.z + f.cz });
const drin = (F, x, z) => F.some((f) => { const c = Math.cos(f.phi), s = Math.sin(f.phi), dx = x - f.cx, dz = z - f.cz; return Math.abs(dx * c - dz * s) <= f.ex && Math.abs(dx * s + dz * c) <= f.ez; });
const ctx = (quelle) => ({ source: quelle, log: [], programId: "probe:orte", rng: Math.random, state: st, startTime: 0, orte: new Map() });
for (const o of plan.orte) {
    const F = FC.ortFlaechen(o, 0).map(welt);
    const Z = (aus.je[o.rolle] = {});
    // (1) was auf der Fläche steht
    const auf = (st.architectures || []).filter((e) => e && e.position && drin(F, e.position.x, e.position.z));
    Z.natur = auf.filter((e) => r._istNatur(e)).length;
    Z.wuerfe = auf.filter((e) => e.feldWurf === true).length;
    Z.bauten = auf.filter((e) => !r._weichtDemBau(e)).map((e) => e.type);
    Z.tiereAusWurf = st.creatures.filter((c) => c.userData.feldWurf && drin(F, c.position.x, c.position.z)).length;
    // (2) die Natur-Wand und die Geburt je 4 m über der Fläche
    let n = 0, wand = 0, geburt = 0, rolle = 0;
    for (const f of F) {
        const c = Math.cos(f.phi), s = Math.sin(f.phi);
        for (let lx = -f.ex + 1; lx <= f.ex - 1; lx += 4)
            for (let lz = -f.ez + 1; lz <= f.ez - 1; lz += 4) {
                const x = f.cx + lx * c + lz * s, z = f.cz - lx * s + lz * c;
                n++;
                if (r._naturWand("baum_eiche", { x, y: 0, z }, {})) wand++;
                if (!r._kreaturGrundFrei(x, z)) geburt++;
                if (r._ortRolleAt(x, z) === o.rolle) rolle++;
            }
    }
    Z.raster = { punkte: n, naturWandHaelt: wand, geburtHaelt: geburt, rolleGelesen: rolle };
    // (3) DIE ENGSTELLE: der Nexus wählt einen Ort auf der Fläche
    let at = 0, atNein = 0, grund = null;
    for (let k = 0; k < 50; k++) {
        const f = F[k % F.length];
        const c = Math.cos(f.phi), s = Math.sin(f.phi);
        const lx = (((k * 7) % 11) / 10 - 0.5) * 1.6 * f.ex, lz = (((k * 3) % 7) / 6 - 0.5) * 1.6 * f.ez;
        const x = f.cx + lx * c + lz * s, z = f.cz - lx * s + lz * c;
        at++;
        try {
            r.dslEvalPos(["at", x, r.getTerrainHeightAt(x, z), z], ctx("nexus"));
        } catch (e) {
            if (e && e.dslKeinOrt) { atNein++; grund = grund || e.dslKeinOrt.grund; }
        }
    }
    Z.nexusAt = { versuche: at, abgewiesen: atNein, grund };
    // ein Akt des Spielers setzt überall (die Rolle verbietet nur den Würfen des Felds)
    let akt = 0;
    try { r.dslEvalPos(["at", F[0].cx, 0, F[0].cz], ctx("human")); akt = 1; } catch (_e) {}
    Z.aktDesSpielers = akt;
}
// (3b) 2000 Würfe des Nexus an far_player 180–380 m um einen Spieler am Rand der Stadt zwischen den Orten
{
    const m = plan.orte.map((o) => (o.rolle === "rundkurs" ? { x: O.x + (o.achse.ax + o.achse.bx) / 2, z: O.z + (o.achse.az + o.achse.bz) / 2 } : { x: O.x + o.cx, z: O.z + o.cz }));
    const mx = m.reduce((s, q) => s + q.x, 0) / m.length, mz = m.reduce((s, q) => s + q.z, 0) / m.length;
    const sp = { x: pm.x, z: pm.z };
    // der Spieler 280 m vor der Mitte der Orte, von der Stadt fort (die Schale 180–380 m trifft sie)
    const d = Math.hypot(mx - O.x, mz - O.z) || 1;
    pm.x = mx + 280 * ((mx - O.x) / d);
    pm.z = mz + 280 * ((mz - O.z) / d);
    let ok = 0, nein = 0, rolle = 0, aufOrt = 0, wild = 0;
    for (let k = 0; k < 2000; k++) {
        try {
            const p = r.dslEvalPos(["far_player", 180, 380], ctx("nexus"));
            ok++;
            if (r._ortRolleAt(p.x, p.z)) aufOrt++;
        } catch (e) {
            nein++;
            const g = (e && e.dslKeinOrt && e.dslKeinOrt.grund) || "";
            if (/Ort mit Rolle/.test(g)) rolle++;
            else if (/Wildnis/.test(g)) wild++;
        }
    }
    pm.x = sp.x;
    pm.z = sp.z;
    aus.nexusFern = { wuerfe: 2000, angenommen: ok, davonAufOrt: aufOrt, abgewiesenRolle: rolle, abgewiesenWildnis: wild, abgewiesenSonst: nein - rolle - wild };
}
// (4) DAS GEHEGE: die Herde
const gh = plan.orte.find((o) => o.rolle === "gehege");
if (gh) {
    const W = { cx: O.x + gh.cx, cz: O.z + gh.cz, phi: gh.phi, ex: gh.ex, ez: gh.ez };
    const auge = { x: O.x + gh.auge.x, z: O.z + gh.auge.z };
    pm.set(auge.x, r.getTerrainHeightAt(auge.x, auge.z) + 0.5, auge.z);
    r._gehegeHerden();
    const herde = () => st.creatures.filter((c) => c.userData.gehege && Math.hypot(c.userData.gehege.cx - W.cx, c.userData.gehege.cz - W.cz) < 1);
    const imZaun = (c) => { const cs = Math.cos(W.phi), sn = Math.sin(W.phi), dx = c.position.x - W.cx, dz = c.position.z - W.cz; return Math.abs(dx * cs - dz * sn) <= W.ex + 0.01 && Math.abs(dx * sn + dz * cs) <= W.ez + 0.01; };
    const h0 = herde();
    const G = { gesetzt: h0.length, soll: gh.herde.n, seele: h0[0] ? h0[0].userData.soul : null, verband: new Set(h0.map((c) => c.userData.verband)).size };
    // 20 s Kreatur-Takt: der Spieler geht quer zur Aussicht auf die Mitte zu (die Herde flieht längs der Wiese)
    const [ax, az] = [auge.x - W.cx, auge.z - W.cz];
    const al = Math.hypot(ax, az) || 1;
    const [qx, qz] = [-az / al, ax / al];
    let flucht = 0, ausZaun = 0, maxWeg = 0;
    const start = new Map(h0.map((c) => [c, [c.position.x, c.position.z]]));
    for (let k = 0; k < 1800; k++) {
        const d = Math.max(4, 75 - (k / 60) * 1.4 * 2);
        pm.set(W.cx + qx * d, r.getTerrainHeightAt(W.cx + qx * d, W.cz + qz * d) + 0.5, W.cz + qz * d);
        r._kreaturStossSchritt(1 / 60);
        r._leibKontakte();
        r.constructor.prototype.updateCreatures.call(r, 1 / 60);
        for (const c of herde()) {
            if (c.userData._motionZustand === "flucht") flucht = Math.max(flucht, herde().filter((x) => x.userData._motionZustand === "flucht").length);
            if (!imZaun(c)) ausZaun++;
            const s0 = start.get(c);
            if (s0) maxWeg = Math.max(maxWeg, Math.hypot(c.position.x - s0[0], c.position.z - s0[1]));
        }
    }
    const h1 = herde();
    Object.assign(G, { nach30s: h1.length, imZaun: h1.filter(imZaun).length, ausZaunTakte: ausZaun, fliehenMax: flucht, wegMaxM: +maxWeg.toFixed(1) });
    aus.gehege = G;
}
return aus;
