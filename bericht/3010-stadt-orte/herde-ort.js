window.__buehne = window.__buehne || (() => {});
async function herdeSzene(r, T, o) {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const H = (x, z) => r.getTerrainHeightAt(x, z);
    const Z = o.phase === "start" ? (window.__herdeHang = { takte: 0 }) : window.__herdeHang;
    const takt = () => {
        pm.set(Z.sx, H(Z.sx, Z.sz) + 0.5, Z.sz);
        r._kreaturStossSchritt(1 / 60);
        r._leibKontakte();
        A.prototype.updateCreatures.call(r, 1 / 60);
        Z.takte++;
    };
    const lebend = () => Z.glieder.filter((c) => s.creatures.includes(c));
    const flieht = (c) => c.userData._motionZustand === "flucht";
    const mitte = (g) => g.reduce((a, c) => a.add(c.position.clone().multiplyScalar(1 / g.length)), new T.Vector3());
    const leibMitte = (c) => {
        const b = new T.Box3().setFromObject(c);
        return [c.position.x, c.position.y + (b.isEmpty() ? 0.5 : Math.min(3, b.max.y - b.min.y) / 2), c.position.z].map((v) => +v.toFixed(2));
    };
    const imZaun = (c) => {
        const g = Z.wiese, cs = Math.cos(g.phi), sn = Math.sin(g.phi), dx = c.position.x - g.cx, dz = c.position.z - g.cz;
        return Math.abs(dx * cs - dz * sn) <= g.ex + 0.01 && Math.abs(dx * sn + dz * cs) <= g.ez + 0.01;
    };
    const pose = () => {
        const g = lebend();
        const m = mitte(g);
        const a = Z.auge;
        const ey = H(a.x, a.z) + A.EGO_AUGE_M;
        return {
            kamera: [a.x, ey, a.z, m.x, m.y + 0.6, m.z].map((v) => +v.toFixed(2)),
            abstand: +Math.hypot(m.x - a.x, m.y + 0.6 - ey, m.z - a.z).toFixed(1),
            punkte: g.map(leibMitte),
            glieder: g.length,
            fliehen: g.filter(flieht).length,
            imZaun: g.filter(imZaun).length,
            takte: Z.takte,
            lokal: ((p) => { const g = Z.wiese, cs = Math.cos(g.phi), sn = Math.sin(g.phi); return p.map((q) => { const dx = q.x - g.cx, dz = q.z - g.cz; return [+(dx * cs - dz * sn).toFixed(1), +(dx * sn + dz * cs).toFixed(1)]; }); })([m, a]),
        };
    };
    if (o.phase !== "start") {
        for (let k = 0; k < o.takte; k++) takt();
        return pose();
    }
    s.renderer.setAnimationLoop(null);
    const plaene = [...((r._ortPlaene && r._ortPlaene.values()) || [])].filter((p) => p && p.version === 2 && p.ort && (p.orte || []).some((q) => q.rolle === "gehege"));
    plaene.sort((a, b) => Math.hypot(a.ort.x - pm.x, a.ort.z - pm.z) - Math.hypot(b.ort.x - pm.x, b.ort.z - pm.z));
    const plan = plaene[0];
    if (!plan) return { fehler: "keine Stadt mit Gehege (Plan v2) — steht die Werkbank am Ort stadt?" };
    const gh = plan.orte.find((q) => q.rolle === "gehege");
    Z.wiese = { cx: plan.ort.x + gh.cx, cz: plan.ort.z + gh.cz, phi: gh.phi, ex: gh.ex, ez: gh.ez };
    Z.auge = { x: plan.ort.x + gh.auge.x, z: plan.ort.z + gh.auge.z };
    window.__buehne();
    r.setGameMode("frieden");
    r.setCameraMode("first");
    // der Spieler an der Aussicht: die Welt um das Gehege steht, das Gehege setzt seine Herde
    pm.set(Z.auge.x, H(Z.auge.x, Z.auge.z) + 0.5, Z.auge.z);
    for (const c of s.creatures.slice()) if (!(c.userData.gehege && Math.hypot(c.userData.gehege.cx - Z.wiese.cx, c.userData.gehege.cz - Z.wiese.cz) < 1)) r.removeCreature(c);
    r._gehegeHerden();
    Z.glieder = s.creatures.filter((c) => c.userData.gehege && Math.hypot(c.userData.gehege.cx - Z.wiese.cx, c.userData.gehege.cz - Z.wiese.cz) < 1);
    if (Z.glieder.length < 3) return { fehler: "das Gehege trägt " + Z.glieder.length + " Tiere (Soll " + gh.herde.n + ")" };
    s.maxCreatures = s.creatures.length;
    // DER SCHUSS HÄLT DIE HERDE (wie `__tiereHalten`): die Aufnahme wartet im Takt der Seite, bis die Welt steht — dort steht
    // jedes Tier an seiner Lage; der eigene Takt oben ruft den Kreatur-Takt am Prototyp vorbei
    r.updateCreatures = function (dt) {
        const fest = this.state.creatures.map((c) => [c, c.position.x, c.position.z]);
        const aus = A.prototype.updateCreatures.call(this, dt);
        for (const [c, x, z] of fest) [c.position.x, c.position.z] = [x, z];
        return aus;
    };
    // die Bedrohung kommt quer zur Aussicht: von der Mitte der Wiese längs ihrer Achse, die nicht zur Aussicht zeigt
    const [ax, az] = [Z.auge.x - Z.wiese.cx, Z.auge.z - Z.wiese.cz];
    const al = Math.hypot(ax, az) || 1;
    const [qx, qz] = [-az / al, ax / al];
    const lang = Math.abs(qx * Math.cos(gh.phi) - qz * Math.sin(gh.phi)) > 0.5 ? gh.ex : gh.ez;
    let d = lang + 40;
    for (; Z.takte < 3600 && !Z.glieder.some(flieht) && d > 0; d -= 1.4 / 60) {
        [Z.sx, Z.sz] = [Z.wiese.cx + qx * d, Z.wiese.cz + qz * d];
        takt();
    }
    if (!Z.glieder.some(flieht)) return Object.assign(pose(), { fehler: "die Herde flieht nicht (der Spieler ging bis " + d.toFixed(0) + " m vor die Mitte)" });
    for (let k = 0; k < 120 && lebend().some((c) => !flieht(c)); k++) takt();
    for (let k = 0; k < 30; k++) takt();
    return Object.assign(pose(), { gehege: { x: +Z.wiese.cx.toFixed(1), z: +Z.wiese.cz.toFixed(1), frei: gh.frei }, wurf: Z.glieder.length, fluchtBei: +d.toFixed(1) });
}

const a = await herdeSzene(r, T, { phase: "start" });
const b = a.fehler ? null : await herdeSzene(r, T, { phase: "weiter", takte: 30 });
const c = b ? await herdeSzene(r, T, { phase: "weiter", takte: 30 }) : null;
const kurz = (q) => q && { abstand: q.abstand, glieder: q.glieder, fliehen: q.fliehen, imZaun: q.imZaun, takte: q.takte, fehler: q.fehler, gehege: q.gehege, fluchtBei: q.fluchtBei, lokal: q.lokal, ex: window.__herdeHang.wiese.ex, ez: window.__herdeHang.wiese.ez };
return { s1: kurz(a), s2: kurz(b), s3: kurz(c) };
