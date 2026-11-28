"use strict";
// scripts/lib/stadt-proben.cjs — DIE BREITE DER STADT (siedlung, Staffel Breite: „≥ 12 Bau-Typen aus ≥ 3 Kulturen, je Viertel eine
// Rolle (Hafen, Markt, Friedhof, Burg), aus EINER Grammatik"): der KONSUM-LESER der Stadt-Grammatik (fachwerk STADT_GRAMMATIK), eine
// Seiten-Probe der Settlement-Linse (`node scripts/diag-settlement.cjs --breite [--ort stadt-voll]`). Sie zählt nie den Plan:
// die Stadt des Messorts steht in der Welt (`spawnSettlement` am Anker ihres Worts), GEZÄHLT wird ein Haus, das als Bau der Welt
// an seinem Slot steht UND das ein Gang zu Fuß durch jede Gasse im Bild hat — an jeder Station (je `schrittM` längs jeder Gasse,
// das Auge `augeM` über dem Grund, der Blick beider Richtungen durch die Kamera des Spiels) liegt sein nächster Wand-Punkt im
// Bild, näher als `sichtM`, und kein anderer stehender Grundriss steht in der Sichtlinie. Ebenso die Stücke der Viertel (Stand, Grab).

// ── DIE PROBE IN DER SEITE (r = die Welt, st = ihr Zustand) ──
async function stadtBreite(o) {
    await __weltDa(() => r.constructor._siedlungGesetz());
    const ort = (await (await fetch("spec/profiband/haushalt.json")).json()).messorte.find((m) => m.id === o.ort);
    const [, seed, nH] = ort.gruendung.wort.split(" ").map(Number);
    const [ax, az] = ort.gruendung.anker;
    const S0 = () =>
        [...(r._bewohnerSiedlungen || new Map()).values()].find(
            (q) => q.plan.seed === seed && Math.hypot(q.ox - ax, q.oz - az) < 200
        );
    if (!S0()) await r.spawnSettlement({ seed, nH, position: { x: ax, y: 0, z: az } });
    const S = S0();
    if (!S) throw new Error(`keine Stadt am Messort ${o.ort}`);
    const [plan, ox, oz] = [S.plan, S.ox, S.oz];
    // WAS STEHT: der Bau der Welt mit dem Samen des Slots an seinem Ort; die Stücke nach ihrem Bauplan im Rahmen des Plans
    const jeSame = new Map();
    for (const e of st.architectures)
        if (e && e.position) jeSame.set(e.seed >>> 0, [...(jeSame.get(e.seed >>> 0) || []), e]);
    const steht = plan.slots.filter((sl) =>
        (jeSame.get(sl.seed >>> 0) || []).some(
            (e) => Math.hypot(e.position.x - ox - sl.x, e.position.z - oz - sl.z) < 1
        )
    );
    const stuecke = st.architectures.filter(
        (e) => e && e.position && o.stuecke[e.type] && Math.hypot(e.position.x - ox, e.position.z - oz) < 600
    );
    // DER GANG: je Station das Auge in der Kamera des Spiels, der Blick längs der Gasse und zurück
    const cam = st.camera;
    const [p0, q0, v] = [cam.position.clone(), cam.quaternion.clone(), cam.position.clone()];
    const imBild = (x, y, z) => {
        v.set(x, y, z).project(cam);
        return Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z < 1;
    };
    // die Strecke (ex, ez) → (px, pz) kreuzt den Grundriss b (plan-lokal): die Schnitt-Probe im Rahmen des Grundrisses
    const kreuzt = (b, ex, ez, px, pz) => {
        const [c, s] = [Math.cos(b.phi), Math.sin(b.phi)];
        const lok = (x, z) => [(x - b.cx) * c - (z - b.cz) * s, (x - b.cx) * s + (z - b.cz) * c];
        const [a, e] = [lok(ex, ez), lok(px, pz)];
        let [t0, t1] = [0, 1];
        for (const [k, h] of [
            [0, b.ex],
            [1, b.ez],
        ]) {
            const d = e[k] - a[k];
            if (Math.abs(d) < 1e-9) {
                if (Math.abs(a[k]) > h) return false;
                continue;
            }
            const [u, w] = [(-h - a[k]) / d, (h - a[k]) / d];
            [t0, t1] = [Math.max(t0, Math.min(u, w)), Math.min(t1, Math.max(u, w))];
        }
        return t0 < t1;
    };
    // der nächste Punkt des Grundrisses b zum Auge, 0,3 m vor seiner Wand
    const wandPunkt = (b, ex, ez) => {
        const [c, s] = [Math.cos(b.phi), Math.sin(b.phi)];
        const [lx, lz] = [(ex - b.cx) * c - (ez - b.cz) * s, (ex - b.cx) * s + (ez - b.cz) * c];
        const [qx, qz] = [Math.max(-b.ex, Math.min(b.ex, lx)), Math.max(-b.ez, Math.min(b.ez, lz))];
        const [wx, wz] = [b.cx + qx * c + qz * s, b.cz - qx * s + qz * c];
        const d = Math.hypot(wx - ex, wz - ez) || 1;
        return [wx + ((ex - wx) / d) * 0.3, wz + ((ez - wz) / d) * 0.3, d];
    };
    const [gesehen, stueckGesehen] = [new Set(), new Set()];
    let [stationen, laengeM] = [0, 0];
    for (const rd of plan.roads) {
        const jeK = Math.max(1, Math.round(o.schrittM / 3));
        laengeM += Math.max(0, rd.pts.length - 1) * 3;
        for (let k = 0; k < rd.pts.length; k += jeK) {
            const P = rd.pts[k];
            const [ex, ez] = [P.x, P.z];
            const ey = r.getTerrainHeightAt(ox + ex, oz + ez) + o.augeM;
            const nah = steht.filter((sl) => Math.hypot(sl.obb.cx - ex, sl.obb.cz - ez) < o.sichtM + 20);
            stationen++;
            for (const sinn of [1, -1]) {
                cam.position.set(ox + ex, ey, oz + ez);
                cam.lookAt(ox + ex + Math.cos(P.th) * sinn, ey, oz + ez + Math.sin(P.th) * sinn);
                cam.updateMatrixWorld(true);
                const frei = (px, pz, selbst) => !nah.some((b) => b !== selbst && kreuzt(b.obb, ex, ez, px, pz));
                for (const sl of nah) {
                    if (gesehen.has(sl)) continue;
                    const [wx, wz, d] = wandPunkt(sl.obb, ex, ez);
                    if (d <= o.sichtM && imBild(ox + wx, sl.y + 2, oz + wz) && frei(wx, wz, sl)) gesehen.add(sl);
                }
                for (const e of stuecke) {
                    const [sx, sz] = [e.position.x - ox, e.position.z - oz];
                    if (stueckGesehen.has(e) || Math.hypot(sx - ex, sz - ez) > o.sichtM) continue;
                    if (imBild(e.position.x, e.position.y + 0.5, e.position.z) && frei(sx, sz, null))
                        stueckGesehen.add(e);
                }
            }
        }
    }
    cam.position.copy(p0);
    cam.quaternion.copy(q0);
    cam.updateMatrixWorld(true);
    const zahl = (L, f) => L.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {});
    const R = plan.mauer ? plan.mauer.R : 0;
    const innen = steht.filter((sl) => Math.hypot(sl.obb.cx, sl.obb.cz) < R);
    const G = [...gesehen];
    return {
        ort: o.ort,
        name: plan.name,
        groesse: plan.groesse,
        jahr: plan.jahr,
        slots: plan.slots.length,
        steht: steht.length,
        lauf: { stationen, laengeM, gesehen: G.length },
        typen: zahl(G, (sl) => sl.rolle),
        kulturen: zahl(G, (sl) => sl.kultur),
        viertel: zahl(G, (sl) => sl.viertel || "ohne"),
        lage: plan.lage || null,
        stuecke: Object.fromEntries(
            Object.keys(o.stuecke).map((t) => [
                o.stuecke[t],
                [stuecke.filter((e) => e.type === t).length, [...stueckGesehen].filter((e) => e.type === t).length],
            ])
        ),
        ring: {
            R: +R.toFixed(1),
            innen: innen.length,
            aussen: steht.length - innen.length,
            bebaut: R ? +(innen.reduce((a, sl) => a + 4 * sl.obb.ex * sl.obb.ez, 0) / (Math.PI * R * R)).toFixed(4) : 0,
        },
    };
}

// ── DAS SOLL der Staffel (ihr Text) und der Gang der Probe ──
const BREITE = {
    ort: "stadt-voll",
    schrittM: 9,
    augeM: 1.7,
    sichtM: 60,
    stuecke: { marktstand_dorf: "stand", grabstein_dorf: "grab", brunnen_dorf: "brunnen" },
    typen: 12,
    kulturen: 3,
    kulturAb: 3, // ein Wahrzeichen allein ist keine Kultur der Stadt: sie zählt ab so vielen Häusern im Gang
    // je Viertel seine Rolle im Gang: ein Haus des Viertels im Bild, dazu das Stück, das seine Rolle trägt
    viertel: { markt: "stand", kirchhof: "grab", burg: null, hafen: null },
    // DIE ROLLE FOLGT DER LAGE: das Viertel verlangt die Probe nur, wo der Plan sie tragen kann (`plan.lage`, fachwerk dorfLayout:
    // `wasser` = die Punkte seines Rings mit Wasser) — nennt der Plan die Lage 0, steht die Rolle beim Namen in `breiteOhne`,
    // nie still gestrichen; ein Plan ohne Lage (vor dem Gesetz) trägt keinen Freibrief, und ein Hafen ohne Wasser ist ein Täter
    lage: { hafen: "wasser" },
};
// WAS DER ORT NICHT TRAGEN KANN (mit Grund, je Rolle eine Zeile): die Rollen, deren Lage der Plan mit 0 nennt
function breiteOhne(m, S = BREITE) {
    return Object.entries(S.lage || {})
        .filter(([, l]) => m.lage && m.lage[l] === 0)
        .map(([rolle, l]) => `Viertel ${rolle}: der Ort trägt es nicht (${l} am Ring 0)`);
}
// DAS URTEIL: die Täter beim Namen (leer = GRÜN). `rollen` = die Bau-Typen der Grammatik (fachwerk BAU_NUTZUNG, das Bau-Gesetz, und die
// Rollen des Gesetzes davor): ein Haus im Gang mit einem Typ außerhalb der Tafel oder ohne Viertel kommt nicht aus der EINEN Grammatik.
function breiteUrteil(m, rollen, S = BREITE) {
    const v = [];
    const typen = Object.keys(m.typen);
    const kult = Object.keys(m.kulturen).filter((k) => m.kulturen[k] >= S.kulturAb);
    if (!(m.lauf.gesehen > 0))
        return [`kein Haus im Gang (${m.steht} von ${m.slots} stehen, ${m.lauf.stationen} Stationen)`];
    if (typen.length < S.typen) v.push(`Bau-Typen im Gang ${typen.length} < ${S.typen} [${typen.join(" ")}]`);
    if (kult.length < S.kulturen)
        v.push(
            `Kulturen im Gang (ab ${S.kulturAb} Häusern) ${kult.length} < ${S.kulturen} ${JSON.stringify(m.kulturen)}`
        );
    for (const [rolle, stueck] of Object.entries(S.viertel)) {
        const l = (S.lage || {})[rolle];
        if (l && m.lage && m.lage[l] === 0) {
            if (m.viertel[rolle]) v.push(`Viertel ${rolle}: ${m.viertel[rolle]} Häuser im Gang ohne ${l} am Ring`);
            continue;
        }
        if (!m.viertel[rolle]) v.push(`Viertel ${rolle}: kein Haus im Gang`);
        else if (stueck && !(m.stuecke[stueck] && m.stuecke[stueck][1] > 0))
            v.push(`Viertel ${rolle}: kein ${stueck} im Gang`);
    }
    const fremd = typen.filter((t) => !rollen.includes(t));
    if (fremd.length) v.push(`Bau-Typ außerhalb der Grammatik [${fremd.join(" ")}]`);
    if (m.viertel.ohne) v.push(`${m.viertel.ohne} Häuser im Gang ohne Viertel`);
    return v;
}
// DER SELBSTTEST: der grüne Gang und seine Täter — die Stadt aus lauter Wohnhäusern, zwei Kulturen, kein Grab, kein Herr, ein
// fremder Typ, ein Haus ohne Viertel; und der Gang an main vor der Grammatik (4e2df19b, stadt-voll) beim Namen
function breiteSelbsttest(taeterFaelle, rollen) {
    const gruen = {
        slots: 309,
        steht: 300,
        lauf: { stationen: 600, laengeM: 5400, gesehen: 280 },
        typen: Object.fromEntries("wohnhaus patrizierhaus wohnturm kaufhaus kontor rathaus gasthaus kirche kapelle pfarrhaus burg bergfried torhaus schmiede werkstatt".split(" ").map((t) => [t, 3])), // prettier-ignore
        kulturen: { provenzalisch: 140, italienisch: 130, gotisch: 4, marokkanisch: 4 },
        viertel: { markt: 19, kirchhof: 3, burg: 4, hafen: 6, handwerk: 40, wohnen: 150, vorstadt: 58 },
        stuecke: { stand: [12, 12], grab: [24, 20], brunnen: [5, 5] },
        lage: { wasser: 9 },
    };
    // gemessen am 11.11. headless an main 4e2df19b (dieselbe Probe): 253 von 300 Slots stehen, 103 im Ring (bebaut 0,158)
    const main = {
        slots: 300,
        steht: 253,
        lauf: { stationen: 520, laengeM: 4218, gesehen: 249 },
        typen: { kirche: 1, gasthaus: 1, wohnhaus: 242, schmiede: 1, burg: 1, scheune: 3 },
        kulturen: { barock: 1, provenzalisch: 117, italienisch: 130, gotisch: 1 },
        viertel: { ohne: 249 },
        stuecke: { stand: [1, 1], grab: [0, 0], brunnen: [5, 5] },
    };
    // DIE LAGE TRÄGT DIE ROLLE: die Stadt ohne Wasser und ohne Hafen ist kein Täter, die Rolle steht beim Namen (`breiteOhne`)
    const trocken = { ...gruen, viertel: { ...gruen.viertel }, lage: { wasser: 0 } };
    delete trocken.viertel.hafen;
    const lageFehler =
        breiteUrteil(trocken, rollen).length ||
        !/Viertel hafen: der Ort trägt es nicht/.test(breiteOhne(trocken).join()) ||
        breiteOhne(gruen).length
            ? [
                  `Selbsttest BREITE Lage: die Stadt ohne Wasser richtet [${breiteUrteil(trocken, rollen).join(" · ")}], nennt [${breiteOhne(trocken).join(" · ")}]`,
              ]
            : [];
    return lageFehler.concat(
        taeterFaelle(
            [
                ["lauter Wohnhäuser", (z) => (z.typen = { wohnhaus: 280 }), /Bau-Typen im Gang 1 < 12/],
                ["zwei Kulturen und zwei Wahrzeichen", (z) => (z.kulturen = { provenzalisch: 140, italienisch: 130, gotisch: 1, barock: 1 }), /Kulturen im Gang \(ab 3 Häusern\) 2 < 3/], // prettier-ignore
                ["der Friedhof ohne Grab", (z) => (z.stuecke.grab = [0, 0]), /Viertel kirchhof: kein grab im Gang/],
                ["die Stadt ohne Herrn", (z) => delete z.viertel.burg, /Viertel burg: kein Haus im Gang/],
                ["die Stadt ohne Hafen", (z) => delete z.viertel.hafen, /Viertel hafen: kein Haus im Gang/],
                [
                    "der Hafen ohne Wasser",
                    (z) => (z.lage.wasser = 0),
                    /Viertel hafen: 6 Häuser im Gang ohne wasser am Ring/,
                ],
                [
                    "ein Typ außerhalb der Tafel",
                    (z) => (z.typen.tankstelle = 1),
                    /außerhalb der Grammatik \[tankstelle\]/,
                ],
                ["Häuser ohne Viertel", (z) => (z.viertel.ohne = 7), /7 Häuser im Gang ohne Viertel/],
                ["keins steht im Gang", (z) => (z.lauf.gesehen = 0), /kein Haus im Gang/],
                { name: "main vor der Grammatik", z: main, muss: [/Bau-Typen im Gang 6 < 12/, /Kulturen im Gang .* 2 < 3/, /Viertel markt/, /Viertel hafen/, /249 Häuser im Gang ohne Viertel/] }, // prettier-ignore
            ],
            (z) => breiteUrteil(z, rollen),
            { gruen }
        )
    );
}

// ══ DER STAND DER STADT (stadt-zehntausend, Leiter mensch.stadt.form#2 · groesse#3/#4): die Stadt des Worts steht als UNION
// ihrer Kacheln — ein Haus steht, wo an seinem Slot der Bau der Welt mit seinem Samen steht (die Nähe, der volle Bau) ODER seine
// Hülle an seinem Los im Pool der Ferne (`st.stadtFerne`: der Eintrag der Kachel trägt DENSELBEN Plan, `anH` zeichnet das Haus).
// Täter-Klasse „die Stadt steht nur in ihrem Kern": eine Kachel, deren Plan die Sitzung kennt (`_bewohnerSiedlungen`), an deren
// Losen aber nichts steht — weder Bau noch Hülle ihres Plans (bis stadt-zehntausend trug die gemeldete Kachel die Massen des
// Worts an fremden Losen, Stufe 1). Die Probe treibt den Takt `sek` Sekunden der Wanduhr am Kern und zählt je `jeS`.
async function stadtStand(o) {
    await __weltDa(() => r.constructor._siedlungGesetz() && st.playerMesh);
    const [, seed, nH] = o.wort.split(" ").map(Number);
    // der Anker der Großstadt ist der des Messorts (die Gründung von stadt-voll, wie die Breite); das Wort ist ihr Umfang
    const ort = (await (await fetch("spec/profiband/haushalt.json")).json()).messorte.find((q) => q.id === o.ort);
    const [ax, az] = ort.gruendung.anker;
    window.__anazhAutoSettlement = true; // der Takt der Orte (die Null-Welt ruht ohne ihn)
    st.playerMesh.position.set(ax, st.playerMesh.position.y, az);
    const t0 = performance.now();
    let treib = true;
    (async () => {
        while (treib) {
            __handTakt();
            await sleep(4); // der EINE Schlaf der Seite (welt-boot `WARTEN_SEITE`)
        }
    })();
    await r.spawnSettlement({ seed, nH, position: { x: ax, y: 0, z: az } });
    const stadt = () => r._staedte().find((s) => Math.hypot(s.x - ax, s.z - az) < 400);
    const zaehle = () => {
        const s = stadt();
        if (!s) return null;
        const [B, F] = [r._bewohnerSiedlungen || new Map(), st.stadtFerne];
        const jeSame = new Map();
        for (const e of st.architectures || [])
            if (e && e.position) jeSame.set(e.seed >>> 0, [...(jeSame.get(e.seed >>> 0) || []), e]);
        const m = { soll: s.nH, kacheln: 0, mitPlan: 0, wach: 0, plan: 0, haus: 0, huelle: 0, steht: 0, leer: [], ohneOrt: F && F.ohneOrt ? F.ohneOrt.size : -1, offen: 0, flug: !!(F && F.flug) }; // prettier-ignore
        for (let k = -s.ringe; k <= s.ringe; k++)
            for (let i = -s.ringe; i <= s.ringe; i++) {
                const key = !i && !k ? s.key : s.cx + i + "," + (s.cz + k);
                if (!(i || k) || r._viertelInfo(s.cx + i, s.cz + k)) m.kacheln++;
                const q = B.get(key);
                if (!q && (i || k) && r._zellOrtMemo && !r._zellOrtMemo.M.has(key)) m.offen++; // ihr Ort steht noch aus (Wasser bestellt)
                if (!q || !q.plan || !Array.isArray(q.plan.slots)) continue;
                m.mitPlan++;
                if (!q.gemeldet) m.wach++;
                // der Plan, den die Kachel baut (wie `_stadtFerneTakt`): wach ihr eigener, sonst der Plan v2 ihres Vorrats, sonst
                // der gemeldete; ihre Hülle steht an SEINEN Losen (Stufe 2 an seinem Ursprung)
                const w = r._dorfVorraete && r._dorfVorraete.get(key);
                const P = !q.gemeldet ? q : w && w.da && w.v2 && Array.isArray(w.v2.slots) ? { plan: w.v2, ox: w.x, oz: w.z } : q; // prettier-ignore
                const e = F && F.je.get(key);
                const huelle = e && e.los && e.ox === P.ox && e.oz === P.oz && e.anH.length === P.plan.slots.length ? e.anH : null; // prettier-ignore
                let n = 0;
                P.plan.slots.forEach((sl, j) => {
                    m.plan++;
                    const bau = (jeSame.get(sl.seed >>> 0) || []).some(
                        (x) => Math.hypot(x.position.x - P.ox - sl.x, x.position.z - P.oz - sl.z) < 1
                    );
                    if (bau) m.haus++;
                    else if (huelle && huelle[j]) m.huelle++;
                    else return;
                    n++;
                });
                m.steht += n;
                if (!n) m.leer.push(key);
            }
        return m;
    };
    // die Messung IST das Fenster der Wanduhr (10⁴ in `sek` s): je `jeS` s eine Zählung, ihre Zahl fest — kein Warten auf einen Bau
    const reihe = [];
    for (let i = Math.ceil(o.sek / o.jeS); i > 0; i--) {
        await sleep(o.jeS * 1e3);
        const z = zaehle();
        reihe.push([+((performance.now() - t0) / 1e3).toFixed(1), z ? z.steht : 0]);
    }
    treib = false;
    const m = zaehle() || { fehler: "keine Stadt am Anker" };
    const zehn = reihe.find(([, n]) => n >= 1e4);
    return { wort: o.wort, sek: o.sek, sekIst: +((performance.now() - t0) / 1e3).toFixed(1), ...m, zehntausendS: zehn ? zehn[0] : null, reihe, heapMB: Math.round(performance.memory ? performance.memory.usedJSHeapSize / 1048576 : -1) }; // prettier-ignore
}
const STAND = { wort: "dorf 7 9310", ort: "stadt-voll", sek: 60, jeS: 5 };
// DAS URTEIL: jede Kachel mit Plan, an deren Losen nichts steht, beim Namen (leer = GRÜN); eine Stadt ohne Plan jenseits des Kerns
// ist derselbe Täter (die Ferne bestellte keinen)
function standUrteil(m) {
    if (!m || m.fehler) return [`keine Stadt: ${(m && m.fehler) || "kein Befund"}`];
    const v = [];
    if (m.leer.length)
        v.push(`die Stadt steht nur in ihrem Kern: ${m.leer.length} Kacheln mit Plan ohne Bau und Hülle [${m.leer.slice(0, 8).join(" ")}]`); // prettier-ignore
    if (m.mitPlan <= 9 && m.kacheln > 9) v.push(`die Ferne trägt keinen Plan: ${m.mitPlan} von ${m.kacheln} Kacheln`);
    // DER UMFANG: das Wort steht ganz (Σ nH seiner Kacheln) — halb gebaut heißt halb, mit Zahl
    if (!(m.steht >= m.soll)) v.push(`die Stadt steht mit ${m.steht} von ${m.soll} Häusern (${m.mitPlan} von ${m.kacheln} Kacheln mit Plan)`); // prettier-ignore
    return v;
}
function standSelbsttest(taeterFaelle) {
    const gruen = { soll: 5600, kacheln: 52, mitPlan: 52, wach: 9, plan: 5700, haus: 860, huelle: 4800, steht: 5660, leer: [] }; // prettier-ignore
    return taeterFaelle(
        [
            ["die gemeldete Kachel trägt die Massen des Worts", (z) => (z.leer = ["3,1", "4,1"]), /nur in ihrem Kern: 2 Kacheln .*3,1 4,1/],
            ["die Ferne bestellt keinen Plan", (z) => (z.mitPlan = 9), /die Ferne trägt keinen Plan: 9 von 52/],
            ["die Stadt steht halb", (z) => (z.steht = 2800), /steht mit 2800 von 5600 Häusern/],
            // gemessen headless an main 9a75d61c (dorf 7 9310, 60 s): 2 Kacheln wach, 16 gemeldete ohne Hülle ihres Plans
            { name: "main vor stadt-zehntausend", z: { soll: 9310, kacheln: 145, mitPlan: 22, wach: 2, plan: 1664, haus: 156, huelle: 55, steht: 211, leer: ["2,-1", "4,-1", "3,0", "2,1"] }, muss: [/nur in ihrem Kern: 4 Kacheln/, /steht mit 211 von 9310/] }, // prettier-ignore
        ],
        standUrteil,
        { gruen }
    );
}

module.exports = { stadtBreite, breiteUrteil, breiteOhne, breiteSelbsttest, BREITE, stadtStand, standUrteil, standSelbsttest, STAND }; // prettier-ignore
