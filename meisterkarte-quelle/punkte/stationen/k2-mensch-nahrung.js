// DIE RICHTER-STATIONEN DER PERSPEKTIVE nahrung (Meisterkarte 2, Kapitel mensch; die Fabrik ist k2-mensch.js, ihr Kopf das Gesetz):
// je Leiter EINE Probe am Messort dorf, die jede Sprosse mit derselben Messung an ihrem Umfang misst. Gemessen wird am ERGEBNIS der
// Welt: die gemalten Äcker der Pläne (`_wegeBelagAt` Kanal acker) und ihr Bild aus der Pose am Feldweg, die Pflanzen der Nah-Streu und
// Nah-Wiese im Acker, ein gebundenes Tier über dem Hang gegen ein ungebundenes, die gezeichneten Wasser-Flächen am Acker (der Leser
// von gelaende.K2#1), die Bewohner nach dem Gesetz des Tags (`_bewohnerSoll`), die Pflanze, die der Spieler pflückt, und ihr Nachwuchs
// in geraffter Welt-Zeit. Was die Welt nicht trägt, urteilt die Probe beim Namen: „Umfang nicht erzeugbar“ mit dem gemessenen Umfang,
// „fehlender Leser“ mit der Stelle im Spiel-Baum. Die Seiten-Funktionen sehen nichts aus diesem Modul (sie reisen als Text).
"use strict";

const PROBE = "[linse-gpu] amd/rdna-3 (Probe)";
const SIEDLUNG = ["stamm/siedlung-bewohner.js", "stamm/siedlung-wege.js", "fachwerk-core.js", "koerper-core.js"];

// DER ZENSUS DER SIEDLUNG (jede Leiter der Perspektive): warten, bis die Siedlung am Messort ihre Bewohner trägt und nichts mehr offen
// ist (`__gebautNach`, wie g2 dorfZaehlung), dann je Plan die Äcker (Welt-OBB, Anteil gemalt innen und im Ring 2,5 m außen), die
// Rollen der Häuser, die Bewohner mit Beruf und Rolle, ihr Ziel um 10 und 12:30 Uhr nach dem Gesetz des Tags, Stände, Wagen, Tiere
const ZENSUS = async (r, T, arg) => {
    const s = r.state;
    const pm = s.playerMesh.position;
    const offen = () => {
        const o = typeof r._weltOffen === "function" ? r._weltOffen() : {};
        return !o.leute && !o.leiber;
    };
    const alle = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.plan);
    await window.__gebautNach("die Siedlung am Messort (Zensus nahrung)", {
        fertig: () => alle().some((S) => Array.isArray(S.liste) && S.liste.length > 0) && offen(),
    });
    const SL = alle().sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z));
    if (!SL.length) throw new Error("keine Siedlung mit Plan am Messort");
    const plus = (o, k) => (o[k] = (o[k] || 0) + 1);
    const acker = (x, z) => {
        const a = {};
        r._wegeBelagAt(x, z, a);
        return a.acker || 0;
    };
    const Z = {
        siedlungen: SL.length, bewohner: 0, berufe: {}, rollen: {}, slotRollen: {}, haeuser: 0, wagen: 0, fahrer: 0, staende: 0,
        maerkte: 0, feldwege: 0, felder: [], jahre: [], feld10: 0, mahl: 0, mahlMitte: null, garten: null, kreaturen: 0, zahm: 0,
        jaeger: 0, hirten: 0, spieler: { x: pm.x, z: pm.z }, nah: { ox: SL[0].ox, oz: SL[0].oz, name: SL[0].plan.name || null },
    };
    let mx = 0;
    let mz = 0;
    for (const S of SL) {
        const P = S.plan;
        if (Number.isFinite(P.jahr)) Z.jahre.push(P.jahr);
        for (const sl of P.slots || []) {
            Z.haeuser++;
            const ro = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            plus(Z.slotRollen, ro);
            if (!Z.garten && /garten|gewaechs|glas|treib|farm/i.test(ro)) Z.garten = { x: S.ox + sl.x, z: S.oz + sl.z, rolle: ro };
        }
        for (const b of Array.isArray(S.liste) ? S.liste : []) {
            Z.bewohner++;
            const wer = String(b.beruf) + " " + String(b.rolle);
            plus(Z.berufe, String(b.beruf));
            plus(Z.rollen, String(b.rolle));
            if (/jag|fisch|hirt/i.test(wer)) Z.jaeger++;
            if (/hirt/i.test(wer)) Z.hirten++;
            if (b.wagen) Z.fahrer++;
            const z10 = r._bewohnerSoll(b, 10);
            const z12 = r._bewohnerSoll(b, 12.5);
            if (b.beruf === "feld" && z10 && !z10.drinnen && z10.ziel) Z.feld10++;
            if (z12 && z12.akt === "mittag" && !z12.drinnen && z12.ziel) {
                Z.mahl++;
                mx += z12.ziel.x;
                mz += z12.ziel.z;
            }
        }
        Z.wagen += S.verkehr && Array.isArray(S.verkehr.wagen) ? S.verkehr.wagen.length : 0;
        const st = (P.staende || []).length;
        Z.staende += st;
        if (st > 0) Z.maerkte++;
        Z.feldwege += (P.feldwege || []).length;
        for (const fd of P.felder || []) {
            if (!fd || !Number.isFinite(fd.cx) || !Number.isFinite(fd.ex)) continue;
            const x = S.ox + fd.cx;
            const z = S.oz + fd.cz;
            const c = Math.cos(fd.phi || 0);
            const sn = Math.sin(fd.phi || 0);
            const pt = (u, v) => [x + u * c - v * sn, z + u * sn + v * c];
            let i = 0, ni = 0, a = 0, na = 0;
            for (let p = -2; p <= 2; p++)
                for (let q = -2; q <= 2; q++) {
                    const w = pt((p / 2.5) * fd.ex, (q / 2.5) * fd.ez);
                    ni++;
                    if (acker(w[0], w[1]) >= 0.5) i++;
                }
            for (const t of [-1, -0.5, 0, 0.5, 1])
                for (const uv of [[fd.ex + 2.5, t * fd.ez], [-(fd.ex + 2.5), t * fd.ez], [t * fd.ex, fd.ez + 2.5], [t * fd.ex, -(fd.ez + 2.5)]]) {
                    const w = pt(uv[0], uv[1]);
                    na++;
                    if (acker(w[0], w[1]) >= 0.5) a++;
                }
            Z.felder.push({ x: +x.toFixed(2), z: +z.toFixed(2), phi: fd.phi || 0, ex: fd.ex, ez: fd.ez, m2: +(4 * fd.ex * fd.ez).toFixed(1), gemalt: +(i / ni).toFixed(3), rand: +(a / na).toFixed(3) });
        }
    }
    if (Z.mahl) Z.mahlMitte = { x: mx / Z.mahl, z: mz / Z.mahl };
    const C = s.creatures || [];
    Z.kreaturen = C.length;
    Z.zahm = C.filter((c) => c && c.userData && (c.userData.bond || 0) >= 0.5).length;
    return Z;
};

// S1 der Flur: je Feldweg-Ende des nächsten Plans die Pose (Auge 1,7 m über dem Anfang des Feldwegs, Blick auf den Acker, die Kamera
// mit dem Sichtfeld des Spiels `KAM_FOV_GRAD`, 16:9) — ein Acker zählt, wenn er als FLÄCHE gemalt ist (innen ≥ 0,6 der Proben acker
// ≥ 0,5, im Ring 2,5 m außen ≤ 0,2: er hat eine Kante) und seine gemalten Zellen frei von Gelände und Grundriss ≥ 0,5 % des Bilds decken.
// Der Spieler steht danach an der besten Pose (dort schneidet die Sitzung den Preis)
const FLUR_BLICK = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const S = [...(r._bewohnerSiedlungen || new Map()).values()]
        .filter((x) => x && x.plan)
        .sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z))[0];
    if (!S) throw new Error("keine Siedlung am Messort");
    const P = S.plan;
    const h = (x, z) => r.getTerrainHeightAt(x, z);
    const acker = (x, z) => {
        const a = {};
        r._wegeBelagAt(x, z, a);
        return a.acker || 0;
    };
    const F = (P.felder || [])
        .filter((fd) => fd && Number.isFinite(fd.cx) && Number.isFinite(fd.ex))
        .map((fd) => ({ x: S.ox + fd.cx, z: S.oz + fd.cz, c: Math.cos(fd.phi || 0), s: Math.sin(fd.phi || 0), ex: fd.ex, ez: fd.ez }));
    const pt = (f, u, v) => [f.x + u * f.c - v * f.s, f.z + u * f.s + v * f.c];
    const flaeche = (f) => {
        let i = 0, ni = 0, a = 0, na = 0;
        for (let p = -2; p <= 2; p++)
            for (let q = -2; q <= 2; q++) {
                const w = pt(f, (p / 2.5) * f.ex, (q / 2.5) * f.ez);
                ni++;
                if (acker(w[0], w[1]) >= 0.5) i++;
            }
        for (const t of [-1, -0.5, 0, 0.5, 1])
            for (const uv of [[f.ex + 2.5, t * f.ez], [-(f.ex + 2.5), t * f.ez], [t * f.ex, f.ez + 2.5], [t * f.ex, -(f.ez + 2.5)]]) {
                const w = pt(f, uv[0], uv[1]);
                na++;
                if (acker(w[0], w[1]) >= 0.5) a++;
            }
        return { innen: i / ni, rand: a / na };
    };
    const cam = new T.PerspectiveCamera(Number.isFinite(A.KAM_FOV_GRAD) ? A.KAM_FOV_GRAD : 60, 16 / 9, 0.1, 2000);
    const frei = (ax, ay, az, bx, by, bz) => {
        for (let k = 1; k < 24; k++) {
            const t = k / 24;
            const x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t;
            if (h(x, z) > y + 0.05) return false;
            // nur ein Grundriss, der steht, verdeckt (pm-front-f1; GTX 31ea3847 „4 Äcker als Fläche gemalt, bestes Bild 0,00 %“):
            // `_imGrundriss` nennt auch „weg“ und „lichtung“ (stamm/vegetation-baum.js) — flacher Grund, das Auge stand auf dem Feldweg,
            // und jeder Strahl galt als verdeckt. Es sperren „haus“ und „bau“ wie in k2-mensch-geist.js
            const g = typeof r._imGrundriss === "function" ? r._imGrundriss(x, z) : false;
            if (g === "haus" || g === "bau") return false;
        }
        return true;
    };
    const v = new T.Vector3(), vu = new T.Vector3(), vv = new T.Vector3();
    const imBild = (e, f) => {
        cam.position.set(e.x, e.y, e.z);
        cam.lookAt(f.x, h(f.x, f.z), f.z);
        cam.updateMatrixWorld(true);
        const N = 8, du = (2 * f.ex) / N, dv = (2 * f.ez) / N;
        let anteil = 0;
        for (let p = 0; p < N; p++)
            for (let q = 0; q < N; q++) {
                const u = -f.ex + (p + 0.5) * du, w = -f.ez + (q + 0.5) * dv;
                const m = pt(f, u, w);
                const y = h(m[0], m[1]) + 0.05;
                if (acker(m[0], m[1]) < 0.5) continue;
                v.set(m[0], y, m[1]).project(cam);
                if (!(Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z > -1 && v.z < 1)) continue;
                if (!frei(e.x, e.y, e.z, m[0], y, m[1])) continue;
                const m1 = pt(f, u + du, w), m2 = pt(f, u, w + dv);
                vu.set(m1[0], h(m1[0], m1[1]) + 0.05, m1[1]).project(cam);
                vv.set(m2[0], h(m2[0], m2[1]) + 0.05, m2[1]).project(cam);
                anteil += Math.abs((vu.x - v.x) * (vv.y - v.y) - (vu.y - v.y) * (vv.x - v.x)) / 4;
            }
        return anteil;
    };
    const flaechen = F.map(flaeche);
    const gemalt = flaechen.filter((q) => q.innen >= 0.6 && q.rand <= 0.2).length;
    let best = null;
    for (const fw of P.feldwege || []) {
        const p0 = fw && fw.pts && fw.pts[0];
        if (!p0) continue;
        const ex = S.ox + p0.x, ez = S.oz + p0.z;
        const e = { x: ex, y: h(ex, ez) + 1.7, z: ez };
        let n = 0, top = null;
        F.forEach((f, i) => {
            if (Math.hypot(f.x - ex, f.z - ez) > 45) return;
            const q = flaechen[i];
            if (!(q.innen >= 0.6 && q.rand <= 0.2)) return;
            const a = imBild(e, f);
            if (a >= 0.005) n++;
            if (!top || a > top.a) top = { a, f };
        });
        if (top && (!best || n > best.n || (n === best.n && top.a > best.top.a))) best = { n, e, top };
    }
    const aus = { felder: F.length, gemalt, feldwege: (P.feldwege || []).length, imBild: best ? best.n : 0, anteil: best ? +best.top.a.toFixed(4) : 0, pose: null };
    if (best) {
        const f = best.top.f, e = best.e;
        aus.pose = { px: +e.x.toFixed(2), py: +e.y.toFixed(2), pz: +e.z.toFixed(2), lx: +f.x.toFixed(2), ly: +h(f.x, f.z).toFixed(2), lz: +f.z.toFixed(2) };
        // DER SPIELER AN DER POSE: Stand am Feldweg-Ende, die Gier auf den Acker (die Kopfrichtung der Kamera gemessen, wie dorfZaehlung)
        pm.set(e.x, h(e.x, e.z) + A.PLAYER_FOOT_OFFSET, e.z);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm);
        const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
        const kopf = async () => {
            await window.__seitenTakt();
            await window.__seitenTakt();
            const d = s.camera.getWorldDirection(new T.Vector3());
            return Math.atan2(d.x, d.z);
        };
        const ziel = Math.atan2(f.x - e.x, f.z - e.z);
        for (let it = 0; it < 2; it++) {
            const h0 = await kopf();
            const y0 = s.yaw;
            s.yaw = y0 + 0.1;
            const h1 = await kopf();
            const sg = Math.sign(wrap(h1 - h0)) || 1;
            s.yaw = y0 + sg * wrap(ziel - h0);
        }
    }
    return aus;
};

// DER STAND IM ACKER (frucht): der Spieler 3 m vor der Kante des gemalten Ackers, die Kacheln der Nah-Streu über Acker und Ring
// stehen (`zustand` „steht“); gezählt werden die Pflanzen der Nah-Streu (ohne Stein und Totholz, ohne Geerntetes) und die Büschel der
// Nah-Wiese IM Acker, als Kontrolle dieselben im Ring 2–8 m außen (sie zeigt, dass die Streu dort baut)
const FRUCHT = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const f = arg.feld;
    if (!f) throw new Error("kein gemalter Acker am Messort");
    const c = Math.cos(f.phi || 0), sn = Math.sin(f.phi || 0);
    const lokal = (x, z) => {
        const dx = x - f.x, dz = z - f.z;
        return [dx * c + dz * sn, -dx * sn + dz * c];
    };
    const abstand = (x, z) => {
        const l = lokal(x, z);
        return Math.max(Math.abs(l[0]) - f.ex, Math.abs(l[1]) - f.ez);
    };
    const ex = f.x - sn * (f.ez + 3), ez = f.z + c * (f.ez + 3);
    pm.set(ex, r.getTerrainHeightAt(ex, ez) + A.PLAYER_FOOT_OFFSET, ez);
    if (s._fixedSimPos) s._fixedSimPos.copy(pm);
    const K = A.NAH_STREU.kachel;
    const proben = [];
    for (let p = -1; p <= 1; p++) for (let q = -1; q <= 1; q++) proben.push([f.x + p * f.ex * c - q * f.ez * sn, f.z + p * f.ex * sn + q * f.ez * c]);
    const steht = () =>
        proben.every((w) => {
            const k = s.nahStreu && s.nahStreu.kacheln.get(Math.floor(w[0] / K) + "," + Math.floor(w[1] / K));
            return !!(k && k.zustand === "steht");
        });
    let takte = 0;
    for (; takte < 150 && !steht(); takte++) await window.__seitenTakt();
    if (!steht()) throw new Error("die Nah-Streu über dem Acker steht nicht nach " + takte + " Takten");
    const arten = r._nahStreuArten() || [];
    let innen = 0, ring = 0, wiInnen = 0, wiRing = 0;
    const kinds = {};
    for (const [key, k] of s.nahStreu.kacheln) {
        if (!k || k.zustand !== "steht" || !Array.isArray(k.items)) continue;
        const alt = r._geerntetIn(key);
        for (const it of k.items) {
            const art = arten[it.art];
            if (!art || alt.has(it.id) || art.kind === "rock" || art.kind === "deadwood") continue;
            const d = abstand(it.x, it.z);
            if (d <= 0) {
                innen++;
                kinds[art.id] = (kinds[art.id] || 0) + 1;
            } else if (d >= 2 && d <= 8) ring++;
        }
    }
    const nw = s.nahWiese;
    for (const k of nw && nw.kacheln ? nw.kacheln.values() : [])
        for (const b of (k && k.bueschel) || []) {
            const d = abstand(b.x, b.z);
            if (d <= 0) wiInnen++;
            else if (d >= 2 && d <= 8) wiRing++;
        }
    return { innen, ring, wiInnen, wiRing, kinds, takte, pose: { px: +ex.toFixed(2), py: "+1.7", pz: +ez.toFixed(2), lx: f.x, ly: "+0.3", lz: f.z } };
};

// DAS GEBUNDENE TIER ÜBER DEM HANG (tier S1): ein Hang von 10–30° nahe dem Spieler mit ≥ 3 m Anstieg über 16 m (Land, frei von
// Grundrissen); zwei Tiere der Seele „wesen“ neben dem Spieler — das eine bindet die Geste des Spielers (`assignCreatureTask`
// follow_player, NICHT still: der Bond der Geste), das andere bleibt ungebunden (der Gegenlauf). Der Spieler geht 1,4 m/s bergauf,
// der Takt des Spiels je 1/30 s (`_gameLoopTick`, der Loop der Seite ruht solange); gemessen der waagrechte Abstand des gebundenen
// Tiers nach 2 s Anlauf (p95), der Anstieg und der Abstand des ungebundenen am Ende. Dazu der Bestand: Tiere, zahme (bond ≥ 0,5)
const TIER = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const h = (x, z) => r.getTerrainHeightAt(x, z);
    const C0 = (s.creatures || []).slice();
    const aus = { wild: C0.length, zahm: C0.filter((c) => c && c.userData && (c.userData.bond || 0) >= 0.5).length };
    const P0 = { x: pm.x, z: pm.z };
    let hang = null;
    for (let ring = 1; ring <= 30 && !hang; ring++)
        for (let q = 0, n = ring * 8; q < n && !hang; q++) {
            const a = (q / n) * Math.PI * 2;
            const x = P0.x + Math.cos(a) * ring * 4, z = P0.z + Math.sin(a) * ring * 4;
            const gx = (h(x + 1, z) - h(x - 1, z)) / 2, gz = (h(x, z + 1) - h(x, z - 1)) / 2;
            const g = Math.hypot(gx, gz);
            const w = (Math.atan(g) * 180) / Math.PI;
            if (!(w >= 10 && w <= 30)) continue;
            const ux = gx / g, uz = gz / g;
            let ok = h(x + ux * 16, z + uz * 16) - h(x, z) >= 3;
            for (let t = -3; t <= 18 && ok; t += 1.5)
                for (const o of [-3, 0, 3]) {
                    const px = x + ux * t - uz * o, pz = z + uz * t + ux * o;
                    if (!r._landAt(px, pz) || (typeof r._imGrundriss === "function" && r._imGrundriss(px, pz))) ok = false;
                }
            if (ok) hang = { x, z, ux, uz, grad: +w.toFixed(1) };
        }
    if (!hang) throw new Error("kein Hang von 10–30° mit ≥ 3 m Anstieg über 16 m nahe dem Spieler");
    aus.hangGrad = hang.grad;
    const stelle = (o) => {
        const x = hang.x - hang.uz * o - hang.ux * 2, z = hang.z + hang.ux * o - hang.uz * 2;
        const c = r.spawnCreatureAt(x, h(x, z) + 0.3, z, "happy", "wesen", { precise: true, bodySize: 1 });
        if (!c) throw new Error("kein Tier gesetzt (spawnCreatureAt wesen)");
        return c;
    };
    window.__loop(false);
    try {
        pm.set(hang.x, h(hang.x, hang.z) + A.PLAYER_FOOT_OFFSET, hang.z);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm);
        const gebunden = stelle(1.5);
        const frei = stelle(-1.5);
        r.assignCreatureTask(gebunden, "follow_player");
        aus.bond0 = +(gebunden.userData.bond || 0).toFixed(4);
        const y0 = h(hang.x, hang.z);
        const ab = [];
        let uhr = performance.now();
        let weg = 0;
        for (let k = 0; k < 390; k++) {
            if (k >= 30) weg = Math.min(16, weg + 1.4 / 30);
            const x = hang.x + hang.ux * weg, z = hang.z + hang.uz * weg;
            pm.set(x, h(x, z) + A.PLAYER_FOOT_OFFSET, z);
            r._gameLoopTick((uhr += 1000 / 30));
            if (k >= 60) ab.push(Math.hypot(gebunden.position.x - pm.x, gebunden.position.z - pm.z));
            if (k % 15 === 14) await window.sleep();
        }
        ab.sort((a, b) => a - b);
        aus.p95 = ab.length ? +ab[Math.min(ab.length - 1, Math.floor(0.95 * ab.length))].toFixed(2) : null;
        aus.hub = +(h(pm.x, pm.z) - y0).toFixed(2);
        aus.frei = +Math.hypot(frei.position.x - pm.x, frei.position.z - pm.z).toFixed(2);
        aus.bond1 = +(gebunden.userData.bond || 0).toFixed(4);
        aus.folgt = gebunden.userData.task ? gebunden.userData.task.name : null;
        // „bindet sich“: die Geste hob den Bond, das Tier folgt — und steht näher als das ungebundene (der Gegenlauf im Umfang)
        aus.n = aus.bond1 > 0 && aus.folgt === "follow_player" && aus.frei > aus.p95 ? 1 : 0;
    } finally {
        window.__loop(true);
    }
    return aus;
};

// DAS WASSER AM ACKER (erdbau, der Leser von gelaende.K2#1 — proben-welt wasserGraben): je gemaltem Acker auf einem Raster über
// Acker und 3 m Ring die gezeichneten Wasser-Flächen (`_wasserNetz` × `_wasserNetzHoehe`, die oberste je Netz) über dem Boden der
// Sicht + 0,1 m; „Bach nahe“, wo dasselbe Wasser auf dem Kreis 30 m um den Acker liegt; der Wuchs des Orts (`_wuchsAt`) bewässert
// gegen unbewässert
const WASSER = async (r, T, arg) => {
    const span = r._voxelChunkConfig(0).span;
    const flaechen = (x, z) => {
        const ys = [];
        for (let dz = -1; dz <= 1; dz++)
            for (let dx = -1; dx <= 1; dx++) {
                const n = r._wasserNetz(Math.floor(x / span) + dx, Math.floor(z / span) + dz);
                const y = n ? r.constructor._wasserNetzHoehe(n, x, z) : null;
                if (y !== null) ys.push(y);
            }
        return ys;
    };
    const nass = (x, z) => {
        const g = r._bodenSichtAt(x, z) ?? r._voxelSurfaceY(x, z);
        return flaechen(x, z).some((y) => y > g + 0.1);
    };
    const F = (arg.felder || []).filter((f) => f.gemalt >= 0.6 && f.rand <= 0.2);
    let bew = 0, ohneBach = 0, wB = 0, nB = 0, wU = 0, nU = 0;
    for (const f of F) {
        const c = Math.cos(f.phi), sn = Math.sin(f.phi);
        const pt = (u, v) => [f.x + u * c - v * sn, f.z + u * sn + v * c];
        let w = 0;
        for (let p = -3; p <= 3; p++)
            for (let q = -2; q <= 2; q++) {
                const a = pt((p / 3.5) * (f.ex + 3), (q / 2.5) * (f.ez + 3));
                if (nass(a[0], a[1])) w++;
            }
        let bach = 0;
        for (let k = 0; k < 24; k++) {
            const a = (k / 24) * Math.PI * 2;
            if (nass(f.x + Math.cos(a) * 30, f.z + Math.sin(a) * 30)) bach++;
        }
        const wu = typeof r._wuchsAt === "function" ? r._wuchsAt(f.x, f.z) : null;
        if (w > 0) {
            bew++;
            if (!bach) ohneBach++;
            if (Number.isFinite(wu)) (wB += wu), nB++;
        } else if (Number.isFinite(wu)) (wU += wu), nU++;
    }
    return { aecker: F.length, bewaessert: bew, grabenOhneBach: ohneBach, gruenDelta: nB && nU ? +(wB / nB - wU / nU).toFixed(4) : null };
};

// DIE HAND DES SPIELERS (hand S1): die nächste pflückbare Pflanze der Nah-Streu (ihre Art gibt eine Ernte, sie steht im Block
// einer Senke ihrer Kachel) — gepflückt über den Weg des Klicks (`_harvestScatterPick`); gemessen: fort aus jedem Block, die Ernte im
// Inventar, die Tat der Welt und ihre Dauer (`_tatIndex().dauer`), dann die Welt-Uhr gerafft (spielZeit) um die halbe Dauer — die
// Pflanze darf NICHT stehen (Gegenlauf) — und über die Dauer hinaus: sie steht wieder (der Takt des Spiels heilt und baut die
// Kachel). Dazu der Boden der Äcker vor ↔ nach der gerafften Zeit um 10 Uhr (ändert die Arbeit ihn?)
const HAND = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const ns = s.nahStreu;
    const arten = typeof r._nahStreuArten === "function" ? r._nahStreuArten() : null;
    if (!ns || !ns.kacheln || !arten) throw new Error("keine Nah-Streu am Spieler");
    r.setTimeOfDay(10 / 24, "regler");
    const acker = (x, z) => {
        const a = {};
        r._wegeBelagAt(x, z, a);
        return (a.acker || 0) + (a.erde || 0);
    };
    const F = (arg.felder || []).filter((f) => f.gemalt >= 0.6);
    const boden = () =>
        F.map((f) => {
            const c = Math.cos(f.phi), sn = Math.sin(f.phi);
            const L = [];
            for (let p = -2; p <= 2; p++) for (let q = -2; q <= 2; q++) L.push(acker(f.x + (p / 2.5) * f.ex * c - (q / 2.5) * f.ez * sn, f.z + (p / 2.5) * f.ex * sn + (q / 2.5) * f.ez * c));
            return L;
        });
    const boden0 = boden();
    const steht = (key, id) => {
        const k = ns.kacheln.get(key);
        if (!k || !k.senken) return false;
        for (const sk of k.senken) {
            const S = ns.senken.get(sk);
            const b = S && S.bloecke ? S.bloecke.get(key) : null;
            if (b && b.ids && b.ids.indexOf(id) >= 0) return true;
        }
        return false;
    };
    let best = null;
    for (const [key, k] of ns.kacheln) {
        if (!k || k.zustand !== "steht" || !Array.isArray(k.items) || !k.senken) continue;
        const alt = r._geerntetIn(key);
        for (const it of k.items) {
            const art = arten[it.art];
            if (!art || !art.ernte || alt.has(it.id)) continue;
            const sk = [...k.senken].find((x) => {
                const S = ns.senken.get(x);
                const b = S && S.bloecke ? S.bloecke.get(key) : null;
                return !!(S && S.ernte && b && b.ids && b.ids.indexOf(it.id) >= 0);
            });
            if (sk == null) continue;
            const d = Math.hypot(it.x - pm.x, it.z - pm.z);
            if (!best || d < best.d) best = { key, id: it.id, senke: sk, d, art: art.id, ernte: ns.senken.get(sk).ernte };
        }
    }
    if (!best) throw new Error("keine pflückbare Pflanze der Nah-Streu am Spieler");
    const inv = () => {
        let n = 0;
        for (const x of (s.player && s.player.inventory) || []) if (x && x.kind === "material" && x.material === best.ernte) n += x.count || 0;
        return n;
    };
    const vor = steht(best.key, best.id);
    const inv0 = inv();
    if (!r._harvestScatterPick({ key: best.key, senke: best.senke, id: best.id, name: best.art })) throw new Error("das Pflücken nahm die Pflanze nicht (_harvestScatterPick)");
    const weg = vor && !steht(best.key, best.id);
    const ernte = inv() - inv0;
    const tat = (s.worldMeta.taten || []).slice().reverse().find((a) => a && a.tat === "ernten" && a.kachel === best.key && a.id === best.id);
    if (!tat) throw new Error("das Pflücken schrieb keine Tat der Welt");
    const dauer = r._tatIndex().dauer.get(tat);
    if (!(dauer > 0)) throw new Error("die Tat der Ernte trägt keine Dauer");
    const raffe = (stunden) => (s.spielZeit += (stunden * r._kalender().tagS) / 24);
    const takte = async (n, bis) => {
        for (let i = 0; i < n; i++) {
            await window.__seitenTakt();
            if (bis && bis()) return i + 1;
        }
        return n;
    };
    raffe(dauer * 0.5);
    await takte(20);
    const frueh = steht(best.key, best.id);
    raffe(dauer * 0.5 + 0.05);
    const tz = await takte(150, () => steht(best.key, best.id));
    const zurueck = steht(best.key, best.id);
    const boden1 = boden();
    let geaendert = 0;
    boden0.forEach((L, i) => {
        const d = L.reduce((a, x, j) => a + Math.abs(x - boden1[i][j]), 0) / Math.max(1, L.length);
        if (d > 0.05) geaendert++;
    });
    return { art: best.art, ernteStoff: best.ernte, d: +best.d.toFixed(2), weg: weg ? 1 : 0, ernte, dauerH: +dauer.toFixed(3), frueh: frueh ? 1 : 0, zurueck: zurueck ? 1 : 0, takte: tz, aecker: F.length, bodenGeaendert: geaendert };
};

// der Rumpf jeder Leiter: der Ruf einer Seiten-Funktion mit der Frist der Probe (in messe als Text — die Fabrik reicht nur H und K)
module.exports = (F) => [
    // ───────── DIE FLUR: die gemalten Äcker der Pläne, ihr Bild am Dorfrand, ihre Fläche je Umfang ─────────
    F.leiter("mensch.nahrung.flur", {
        sek: 45,
        mutiert: true,
        pfad: [...SIEDLUNG, "stamm/dirigent-takt.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            const flaechen = () => z().felder.filter((f) => f.gemalt >= 0.6 && f.rand <= 0.2);
            const km2 = () => flaechen().reduce((a, f) => a + f.m2, 0) / 1e6;
            const luft = () => ({ px: z().nah.ox, py: "+150", pz: z().nah.oz + 80, lx: z().nah.ox, ly: "+0", lz: z().nah.oz });
            H.zeile("Flur: " + (Z ? Z.felder.length + " Äcker im Plan, gemalt als Fläche " + flaechen().length + ", " + km2().toFixed(5) + " km²" : "kein Zensus (" + zf + ")"));
            await K.schritt(2, async () => {
                const a = km2();
                if (a < 0.5) return K.nicht(2, { n: +a.toFixed(6), fehlt: "die Flur eines Dorfs ≈ 1 km²: " + flaechen().length + " gemalte Äcker decken " + a.toFixed(5) + " km² (fachwerk-core dorfLayout: 1–2 Äcker je Feldweg-Ende, 12–21 × 8–15 m)" });
                const b = await K.bild(2, luft());
                K.auge(2, { bild: b.datei, pose: "Luftbild 150 m über der Mitte des Dorfs, 80 m südlich", mass: "Flur " + a.toFixed(3) + " km², " + flaechen().length + " Äcker" });
            });
            await K.schritt(3, async () => {
                const n = flaechen().length;
                if (n < 1000) return K.nicht(3, { n, fehlt: "10³ Parzellen auf 10² km²: die Welt am Messort trägt " + n + " gemalte Äcker (" + z().siedlungen + " Siedlung(en)), 8 Saaten trägt die Sitzung nicht" });
                const b = await K.bild(3, luft());
                K.auge(3, { bild: b.datei, pose: "Luftbild 150 m über der Mitte des Dorfs", mass: n + " Parzellen" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: 1, fehlt: "16 Saaten je Region 10⁴ km²: die Sitzung trägt EINE Saat; Weide als Nutzung trägt kein Plan (" + Object.keys(z().slotRollen).join("/") + ")" }));
            await K.schritt(5, async () => K.nicht(5, { n: +km2().toFixed(6), fehlt: "Nutzflächen eines Kontinents (10⁶ km²) je Klimazone: die gemalte Flur am Messort deckt " + km2().toFixed(5) + " km²" }));
            await K.schritt(6, async () => K.nicht(6, { n: flaechen().length, fehlt: "10⁹ Parzellen eines Planeten für 100 Zufallslandungen: " + flaechen().length + " gemalte Äcker am Messort" }));
            await K.schritt(7, async () => K.nicht(7, { n: 1, fehlt: "64 Welten mit fremden Agrarformen: die Sitzung trägt eine Welt, ihr Acker ist ein gemaltes Rechteck" }));
            // S1 zuletzt: der Spieler endet an ihrer Pose (der Preis der Sitzung)
            await K.schritt(1, async () => {
                const B = await ruf("FLUR_BLICK");
                const n = flaechen().length;
                K.zahl(1, {
                    n,
                    werte: { imBild: B.imBild },
                    beleg: B.felder + " Äcker im Plan, " + B.gemalt + " als Fläche gemalt, " + B.feldwege + " Feldwege; bestes Bild " + (B.anteil * 100).toFixed(2) + " % an Pose " + JSON.stringify(B.pose),
                    taeter: B.imBild >= 1 ? null : n ? "kein gemalter Acker frei im Bild vom Feldweg-Ende (Gelände/Grundriss verdeckt oder ≥ 45 m fern)" : "kein Acker als Fläche gemalt (stamm/siedlung-wege.js felder-Schicht: _landAt oder ortKraut verweigert)",
                });
            });
        },
        seite: { ZENSUS, FLUR_BLICK },
        sprossen: {
            1: { umfang: { soll: 1, wort: "gemalte Äcker am Feldweg-Ende" }, masse: [{ key: "imBild", wort: "Äcker als Fläche im Bild am Dorfrand", soll: 1, richtung: "≥" }] },
            2: { auge: { pose: "Luftbild 150 m über der Mitte des Dorfs, 80 m südlich", vorbild: "die reale Flur eines Dorfs ≈ 1 km² (Gewannflur Mitteleuropa, Luftbild/Kataster): Feldgrößen-Verteilung KS ≤ 0,25, Blindurteil ≤ 65 %" }, erwartet: "nicht", fehlt: "die Flur am Messort deckt ≪ 1 km² (1–2 Äcker je Feldweg-Ende)" },
            3: { auge: { pose: "Luftbild 150 m über der Mitte des Dorfs", vorbild: "20 Satellitenbilder realer Agrarlandschaft (10² km², 10³ Parzellen) an 8 Saaten, Blindurteil ≤ 65 %" }, erwartet: "nicht", fehlt: "10³ Parzellen: die Welt am Messort trägt eine Handvoll Äcker" },
            4: { umfang: { soll: 16, wort: "Saaten je Region 10⁴ km²" }, masse: [{ key: "r", wort: "Acker/Weide/Wald über Abstand (r)", soll: 0.8, richtung: "≥" }, { key: "anteil", wort: "Saaten mit r ≥ 0,8", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "16 Saaten und Weide als Nutzung" },
            5: { umfang: { soll: 1e6, wort: "km² Kontinent" }, masse: [{ key: "fao", wort: "Abweichung Nutzfläche je Klimazone gegen FAO", soll: 0.25, richtung: "≤" }], erwartet: "nicht", fehlt: "ein Kontinent mit Nutzflächen je Klimazone" },
            6: { auge: { pose: "100 Zufallslandungen, Ego 1,7 m", vorbild: "Fotos realer Kulturlandschaft je Landungsort: plausibel ≥ 90 %" }, erwartet: "nicht", fehlt: "10⁹ Parzellen eines Planeten" },
            7: { auge: { pose: "Luftbild je Welt, 150 m", vorbild: "Panel „bewirtschaftet“ ≥ 70 % an 64 Welten, Lagerente (Thünen) r ≥ 0,7" }, erwartet: "nicht", fehlt: "64 Welten mit fremden Agrarformen" },
        },
        proben: {
            1: [{ name: "ATTRAPPE: die Äcker im Plan, keiner gemalt oder frei im Bild — ROT am Bild", j: { leiter: "mensch.nahrung.flur", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 3, werte: { imBild: 0 } } } }, gruen: false, zahl: /ROT an Äcker als Fläche im Bild am Dorfrand 0 / }],
        },
    }),

    // ───────── DIE FRUCHT: was auf dem gemalten Acker steht ─────────
    F.leiter("mensch.nahrung.frucht", {
        sek: 45,
        mutiert: true,
        pfad: [...SIEDLUNG, "stamm/vegetation-wiese.js", "stamm/feld-leben.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            let R = null, rf = "";
            const feld = () => {
                const sp = z().spieler;
                return z().felder.filter((f) => f.gemalt >= 0.6 && f.rand <= 0.2).sort((a, b) => Math.hypot(a.x - sp.x, a.z - sp.z) - Math.hypot(b.x - sp.x, b.z - sp.z))[0] || null;
            };
            try {
                R = await ruf("FRUCHT", { feld: feld() });
                H.zeile("Acker: " + R.innen + " Pflanzen + " + R.wiInnen + " Büschel innen, Kontrolle im Ring " + R.ring + " + " + R.wiRing + " (" + R.takte + " Takte)");
            } catch (e) {
                rf = String((e && e.message) || e).slice(0, 200);
            }
            const r = () => {
                if (!R) throw new Error("kein Stand im Acker: " + rf);
                if (!(R.ring + R.wiRing > 0)) throw new Error("die Kontrolle im Ring trägt keine Pflanze — die Streu baute dort nicht");
                return R;
            };
            const kultur = () => r().innen + r().wiInnen;
            const artText = () => Object.entries(r().kinds).map(([k, v]) => k + " " + v).join(", ") || "keine";
            await K.schritt(2, async () => K.nicht(2, { n: kultur(), fehlt: "eine Kulturart über ein Spieljahr: im Acker stehen " + kultur() + " Pflanzen (Arten: " + artText() + ") — der Takt räumt jeden Wuchs vom Acker, das Boden-Gesetz trägt keine Kulturart" }));
            await K.schritt(3, async () => K.nicht(3, { n: 1, fehlt: "32 Saaten × 4 Klimazonen mit ihren Pflanzen: die Sitzung trägt eine Saat und eine Zone, " + z().felder.length + " Äcker ohne Kulturart" }));
            await K.schritt(4, async () => K.nicht(4, { n: z().felder.length, fehlt: "10³ Felder mit eigenem Schicksal (Ertrag, Dürre): die Welt am Messort trägt " + z().felder.length + " Äcker ohne Ertrag" }));
            await K.schritt(5, async () => K.nicht(5, { n: 0, fehlt: "Domestikation über 10⁴ Jahre (Ähre −9000…2020): " + kultur() + " Pflanzen im Acker, keine Kulturart, keine Ähre — kein Jahr Domestikation" }));
            await K.schritt(6, async () => K.nicht(6, { n: 1, fehlt: "64 Welten mit gezüchteter Art: die Sitzung trägt eine Welt ohne Kulturform" }));
            // S1 zuletzt: der Spieler steht am Rand des Ackers
            await K.schritt(1, async () => {
                if (kultur() < 1) return K.nicht(1, { n: 0, fehlt: "eine Kulturpflanze auf einem Acker: der gemalte Acker trägt 0 Pflanzen (Kontrolle im Ring " + (r().ring + r().wiRing) + ") — siedlung-wege räumt jeden Wuchs vom Acker" });
                const b = await K.bild(1, r().pose);
                K.auge(1, { bild: b.datei, pose: "3 m vor der Kante des nächsten Ackers, Ego 1,7 m, Blick auf seine Mitte", mass: kultur() + " Pflanzen im Acker (" + artText() + ")" });
            });
        },
        seite: { ZENSUS, FRUCHT },
        sprossen: {
            1: { auge: { pose: "3 m vor der Kante des nächsten Ackers, Ego 1,7 m, Blick auf seine Mitte", vorbild: "Foto eines realen Getreideackers in Reihen (Weizen, BBCH 30–60): Reihen im Bildspektrum ≥ 3σ, Blindurteil ≤ 65 %" }, erwartet: "nicht", fehlt: "keine Kulturpflanze auf dem Acker" },
            2: { umfang: { soll: 1, wort: "Kulturart über 1 Spieljahr" }, masse: [{ key: "bbch", wort: "Abweichung Höhe und Farbe gegen BBCH-Kurve", soll: 0.15, richtung: "≤" }], erwartet: "nicht", fehlt: "keine Kulturart" },
            3: { auge: { pose: "Ego 1,7 m am Acker je Saat und Zone", vorbild: "Fotos der Kulturpflanzen je Klimazone (Reis, Weizen, Mais, Hirse): Bild ↔ Klima ≥ 80 % an 32 Saaten × 4 Zonen" }, erwartet: "nicht", fehlt: "32 Saaten und Kulturpflanzen je Zone" },
            4: { umfang: { soll: 1000, wort: "Felder mit eigenem Schicksal" }, masse: [{ key: "ertrag", wort: "Ertrag bei Dürre (relativ)", von: -0.7, bis: -0.3, herkunft: "„Ertrag −30…−70 %“: das Band als Anteil, −0,7 bis −0,3" }, { key: "gelb", wort: "Feld gelb im Bildpaar (ja = 1)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "10³ Felder mit Ertrag" },
            5: { umfang: { soll: 1e4, wort: "Jahre Domestikation" }, masse: [{ key: "aehre", wort: "Abweichung Ährengröße −9000/−2000/1900/2020 archäobotanisch", soll: 0.3, richtung: "≤" }], erwartet: "nicht", fehlt: "keine Ähre, keine Domestikation" },
            6: { auge: { pose: "Ego 1,7 m am Acker je Welt", vorbild: "Panel: gezüchtete Art erkannt ≥ 80 % an 64 Welten, Merkmal wandert" }, erwartet: "nicht", fehlt: "64 Welten mit Kulturformen" },
        },
        proben: {
            2: [{ name: "ATTRAPPE: eine Art steht, ihr Wuchs folgt keiner BBCH-Kurve — ROT an der Abweichung", j: { leiter: "mensch.nahrung.frucht", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 1, werte: { bbch: 0.4 } } } }, gruen: false, zahl: /ROT an Abweichung Höhe und Farbe gegen BBCH-Kurve 0\.4 / }],
        },
    }),

    // ───────── DAS TIER: Bindung, Jagd, Herde ─────────
    F.leiter("mensch.nahrung.tier", {
        sek: 50,
        mutiert: true,
        pfad: [...SIEDLUNG, "stamm/kreatur-*.js", "stamm/feld-sprache.js", "scripts/werkbank.cjs"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            const wer = () => "Bewohner " + z().bewohner + " (Berufe " + Object.keys(z().berufe).join("/") + "), Tiere " + z().kreaturen + ", zahm " + z().zahm;
            await K.schritt(2, async () => K.nicht(2, { n: z().jaeger, fehlt: "Bewohner, die jagen und fischen (8 Saaten): " + z().jaeger + " Jäger/Fischer unter " + wer() }));
            await K.schritt(3, async () => K.nicht(3, { n: z().hirten, fehlt: "10² Tiere in einer Herde mit Hirte: " + z().hirten + " Hirten — " + wer() }));
            await K.schritt(4, async () => K.nicht(4, { n: z().zahm, fehlt: "10³ Haustiere aus der Wildfauna (32 Saaten): " + z().zahm + " zahme Tiere (bond ≥ 0,5)" }));
            await K.schritt(5, async () => K.nicht(5, { n: z().jaeger, fehlt: "Fischerei und Aquakultur mit Bestand und Fang: kein Fischer, kein Fang — " + wer() }));
            await K.schritt(6, async () => K.nicht(6, { n: z().hirten, fehlt: "Wanderhirten über 10⁴ km²: " + z().hirten + " Hirten, keine Herde" }));
            await K.schritt(7, async () => K.nicht(7, { n: 1, fehlt: "64 Welten mit Nutztieren und Zähmungs-Drift: die Sitzung trägt eine Welt, " + z().zahm + " zahme Tiere" }));
            // S1 zuletzt: der Spieler endet oben am Hang
            await K.schritt(1, async () => {
                const t = await ruf("TIER");
                K.zahl(1, {
                    n: t.n,
                    werte: { p95: t.p95, hub: t.hub },
                    beleg: "Hang " + t.hangGrad + "°, bond " + t.bond0 + " → " + t.bond1 + ", Aufgabe " + t.folgt + ", Gegenlauf: das ungebundene Tier " + t.frei + " m; Bestand " + t.wild + " Tiere, " + t.zahm + " zahm",
                    taeter: !(t.bond1 > 0 && t.folgt === "follow_player") ? "die Geste bindet nicht (stamm/kreatur-verhalten.js assignCreatureTask follow_player)" : !(t.frei > t.p95) ? "das ungebundene Tier steht ebenso nah — die Nähe misst keine Bindung" : !(t.p95 <= 5) ? "das gebundene Tier fällt über dem Hang zurück (stamm/kreatur-verhalten.js updateCreatures, Folgen)" : null,
                });
            });
        },
        seite: { ZENSUS, TIER },
        sprossen: {
            1: { umfang: { soll: 1, wort: "an den Spieler gebundenes Tier" }, masse: [{ key: "p95", wort: "Abstand p95 zum Spieler über den Hang (m)", soll: 5, richtung: "≤" }, { key: "hub", wort: "Anstieg des Wegs über den Hang (m)", soll: 0, richtung: ">" }] },
            2: { umfang: { soll: 1, wort: "jagende oder fischende Bewohner (je Saat, 8 Saaten)" }, masse: [{ key: "jagdJeTag", wort: "Jagden je Tag", soll: 1, richtung: "≥" }, { key: "wildDelta", wort: "Änderung des Wildbestands", soll: 0, richtung: "<" }], erwartet: "nicht", fehlt: "kein Bewohner jagt oder fischt" },
            3: { umfang: { soll: 100, wort: "Tiere in einer Herde mit Hirte" }, masse: [{ key: "gras", wort: "Rückgang der Grasdeckung nach 30 Tagen (Anteil)", soll: 0.2, richtung: "≥" }, { key: "viehpfad", wort: "Viehpfad im Boden (getretene Fläche, m²)", soll: 0, richtung: ">" }], erwartet: "nicht", fehlt: "keine Herde, kein Hirte" },
            4: { umfang: { soll: 1000, wort: "Haustiere aus der Wildfauna" }, masse: [{ key: "haustier", wort: "Saaten mit Haustier", soll: 0.8, richtung: "≥" }, { key: "gestalt", wort: "Gestalt-Distanz Haustier ↔ Wildform im Soll (Anteil)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "keine Haustiere" },
            5: { umfang: { soll: 1, wort: "Fischerei mit Bestand und Fang" }, masse: [{ key: "kollaps", wort: "Bestandsrückgang bei Übernutzung (Anteil)", soll: 0.5, richtung: "≥" }], erwartet: "nicht", fehlt: "keine Fischerei" },
            6: { umfang: { soll: 1, wort: "Herde mit Wanderhirte über 10⁴ km²" }, masse: [{ key: "hoehenlinie", wort: "Herden auf der Weide-Höhenlinie", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "keine Wanderhirten" },
            7: { umfang: { soll: 64, wort: "Welten mit Nutztieren" }, masse: [{ key: "drift", wort: "Welten mit Zähmungs-Drift", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "64 Welten" },
        },
        proben: {
            1: [
                { name: "ATTRAPPE: das ungebundene Tier steht ebenso nah — kein gebundenes Tier im Umfang", j: { leiter: "mensch.nahrung.tier", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 0, werte: { p95: 3, hub: 4 } } } }, gruen: false, zahl: /ROT an Umfang 0 < 1 an den Spieler gebundenes Tier/ },
                { name: "ATTRAPPE: die Ebene statt des Hangs (der Weg steigt nicht, er fällt 0,4 m)", j: { leiter: "mensch.nahrung.tier", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { p95: 3, hub: -0.4 } } } }, gruen: false, zahl: /ROT an Anstieg des Wegs über den Hang \(m\) -0\.4 / },
            ],
        },
    }),

    // ───────── DER ERDBAU: Wasser am Acker (derselbe Leser wie gelaende.K2#1, die Bewohner statt des Spielers) ─────────
    F.leiter("mensch.nahrung.erdbau", {
        sek: 45,
        pfad: [...SIEDLUNG, "stamm/gelaende-*.js", "stamm/wasser-*.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            const bau = (re) => Object.entries(z().slotRollen).filter(([k]) => re.test(k)).reduce((a, [, v]) => a + v, 0);
            const rollen = () => Object.keys(z().slotRollen).join("/");
            await K.schritt(3, async () => {
                const n = bau(/terras|teich|damm|muehl|wehr/i);
                if (n < 1) return K.nicht(3, { n, fehlt: "Terrasse, Mühlteich, Damm: kein Erdbau der Bewohner im Plan (Rollen " + rollen() + ")" });
                const b = await K.bild(3, { px: z().nah.ox, py: "+60", pz: z().nah.oz + 60, lx: z().nah.ox, ly: "+0", lz: z().nah.oz });
                K.auge(3, { bild: b.datei, pose: "60 m über der Mitte des Dorfs, 60 m südlich", mass: n + " Erdbauten" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: bau(/polder|deich|kanal|pumpe/i), fehlt: "Polder, Deich und Kanal über 10³ km²: keiner im Plan (Rollen " + rollen() + ")" }));
            await K.schritt(5, async () => K.nicht(5, { n: bau(/talsperre|stau|tagebau/i), fehlt: "Talsperre oder Tagebau (10⁸ m³): keiner im Plan" }));
            await K.schritt(6, async () => K.nicht(6, { n: bau(/terras|teich|damm|polder|deich|kanal|tagebau/i), fehlt: "planetare Umformung über 1000 Jahre: die Bewohner formen kein Land, die Sitzung rafft Stunden" }));
            await K.schritt(7, async () => K.nicht(7, { n: 1, fehlt: "64 Welten mit Terraforming: die Sitzung trägt eine Welt" }));
            await K.schritt(2, async () => {
                const w = await ruf("WASSER", { felder: z().felder });
                H.zeile("Wasser am Acker: " + w.bewaessert + " von " + w.aecker + " gemalten Äckern, ohne Bach " + w.grabenOhneBach + ", Wuchs Δ " + w.gruenDelta);
                if (w.bewaessert < 1) return K.nicht(2, { n: 0, fehlt: "Bewohner bewässern: an " + w.aecker + " gemalten Äckern liegt keine gezeichnete Wasser-Fläche (der Leser von gelaende.K2#1) — kein Graben der Bewohner" });
                K.zahl(2, { n: w.bewaessert, werte: { gruenDelta: w.gruenDelta, grabenOhneBach: w.grabenOhneBach }, beleg: w.aecker + " Äcker, bewässert " + w.bewaessert, taeter: w.grabenOhneBach > 0 ? "Wasser am Acker ohne Bach im Umkreis 30 m" : null });
            });
        },
        seite: { ZENSUS, WASSER },
        bestehend: { 1: "gelaende.K2#1" },
        sprossen: {
            2: { umfang: { soll: 1, wort: "Acker, den Bewohner bewässern" }, masse: [{ key: "gruenDelta", wort: "Wuchs bewässert − unbewässert", soll: 0, richtung: ">" }, { key: "grabenOhneBach", wort: "Gräben an Äckern ohne Bach", soll: 0, richtung: "≤" }], erwartet: "nicht", fehlt: "kein Bewohner bewässert" },
            3: { auge: { pose: "60 m über der Mitte des Dorfs, 60 m südlich", vorbild: "Luftbild realer Reisterrassen und Mühlteiche (Banaue, Schwarzwald): Blindurteil ≤ 65 %, Terrassen über der Hang-Schwelle ≥ 80 %" }, erwartet: "nicht", fehlt: "kein Erdbau der Bewohner" },
            4: { umfang: { soll: 1, wort: "Polder mit Deich, Kanal und Pumpe (10³ km²)" }, masse: [{ key: "polderVoll", wort: "Polder voll nach Pumpe aus (ja = 1)", soll: 1, richtung: "≥" }, { key: "bruchRelief", wort: "Flut des Deichbruchs folgt dem Gefälle (ja = 1)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "kein Polder" },
            5: { umfang: { soll: 1, wort: "Talsperre oder Tagebau (≥ 10⁸ m³)" }, masse: [{ key: "seeFlaeche", wort: "Abweichung Stauseefläche", soll: 0.1, richtung: "≤" }, { key: "aue", wort: "Aue stromab geändert (Fläche, m²)", soll: 0, richtung: ">" }], erwartet: "nicht", fehlt: "keine Talsperre" },
            6: { auge: { pose: "Orbit über der Welt, Jahr 0 und 1000", vorbild: "Satellitenbild der Erde mit Umformung (Polder, Terrassen, Tagebaue): ≥ 1 % Land umgeformt, plausibel ≥ 90 %" }, erwartet: "nicht", fehlt: "1000 Jahre Umformung" },
            7: { umfang: { soll: 64, wort: "Welten mit Terraforming" }, masse: [{ key: "r", wort: "Terrassenhöhe ↔ 1/g (r)", soll: 0, richtung: ">" }], erwartet: "nicht", fehlt: "64 Welten" },
        },
        proben: {
            2: [{ name: "ATTRAPPE: Wasser am Acker ohne Bach — ein gemalter Graben, kein Fluss speist ihn", j: { leiter: "mensch.nahrung.erdbau", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 2, werte: { gruenDelta: 0.05, grabenOhneBach: 1 } } } }, gruen: false, zahl: /ROT an Gräben an Äckern ohne Bach 1 / }],
        },
    }),

    // ───────── DER STROM DER NAHRUNG: Ernte → Vorrat → Mahl → Markt ─────────
    F.leiter("mensch.nahrung.strom", {
        sek: 40,
        pfad: [...SIEDLUNG, "stamm/siedlung-verkehr.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            await K.schritt(2, async () => {
                const n = z().mahl;
                if (n < 100) return K.nicht(2, { n, fehlt: "10² Bewohner beim Mahl: um 12:30 Uhr essen " + n + " draußen (" + z().bewohner + " Bewohner) — und kein Korb trägt Speise vom Feld zum Teller" });
                const m = z().mahlMitte;
                const b = await K.bild(2, { px: m.x + 8, py: "+1.7", pz: m.z + 8, lx: m.x, ly: "+1.0", lz: m.z });
                K.auge(2, { bild: b.datei, pose: "8 m diagonal vor der Mitte des Mahls um 12:30 Uhr, Ego 1,7 m", mass: n + " beim Mahl" });
            });
            await K.schritt(3, async () => K.nicht(3, { n: z().maerkte, fehlt: "10 Orte mit Markt, Preis und Wagen: " + z().maerkte + " Markt mit " + z().staende + " Ständen, " + z().wagen + " Wagen — kein Preis" }));
            await K.schritt(4, async () => K.nicht(4, { n: z().bewohner, fehlt: "10⁴ Bewohner mit Hunger und Überfluss: " + z().bewohner + " am Messort, keiner isst aus einem Vorrat" }));
            await K.schritt(5, async () => K.nicht(5, { n: z().bewohner, fehlt: "eine Stadt ≥ 10⁸ vom Hinterland: " + z().bewohner + " Bewohner, kein Bissen hat Herkunft" }));
            await K.schritt(6, async () => K.nicht(6, { n: 1, fehlt: "16 Saaten × 100 Jahre: die Sitzung trägt eine Saat über Stunden" }));
            await K.schritt(1, async () =>
                K.leser(1, {
                    n: z().slotRollen.scheune || 0,
                    fehlt: "kein Vorrat: das Dorf erntet nicht — die Arbeit am Acker setzt nur den Akt (b.akt), keine Ernte und kein Bestand der Scheune (" + (z().slotRollen.scheune || 0) + " Scheunen, " + z().feld10 + " Bewohner um 10 Uhr am Acker)",
                    wo: "stamm/siedlung-bewohner.js:2299",
                })
            );
        },
        seite: { ZENSUS },
        sprossen: {
            1: { umfang: { soll: 1, wort: "Dorf mit Scheune, das erntet und lagert" }, masse: [{ key: "saegezahn", wort: "Sägezahn des Scheunen-Vorrats (Ernten je Jahr)", soll: 1, richtung: "≥" }, { key: "vollLeer", wort: "Scheune voll ↔ leer im Bildpaar (ja = 1)", soll: 1, richtung: "≥" }], erwartet: "leser", fehlt: "kein Vorrat, keine Ernte", wo: "stamm/siedlung-bewohner.js:2299" },
            2: { auge: { pose: "8 m diagonal vor der Mitte des Mahls um 12:30 Uhr, Ego 1,7 m", vorbild: "Foto eines realen Dorf-Mahls (Gericht auf dem Teller, Korb vom Feld): ≤ 65 % vom Foto trennbar, der Korb Feld → Teller verfolgt" }, erwartet: "nicht", fehlt: "10² Bewohner beim Mahl und eine Speise" },
            3: { umfang: { soll: 10, wort: "Orte mit Markt" }, masse: [{ key: "preisPlus", wort: "Preis in A nach Missernte", soll: 0.5, richtung: "≥" }, { key: "wagenAusB", wort: "Wagen aus B unterwegs", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "10 Orte mit Markt und Preis" },
            4: { umfang: { soll: 1e4, wort: "Bewohner mit Hunger und Überfluss" }, masse: [{ key: "bevDuerre", wort: "Rückgang der Bevölkerung nach Dürre (Anteil)", soll: 0.1, richtung: "≥" }, { key: "wanderstrom", wort: "Wandernde nach der Dürre", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "10⁴ Bewohner, Hunger" },
            5: { umfang: { soll: 1e8, wort: "Einwohner einer Stadt vom Hinterland" }, masse: [{ key: "bissen", wort: "Bissen bis Feld/Stall verfolgt", soll: 0.9, richtung: "≥" }], erwartet: "nicht", fehlt: "eine Stadt ≥ 10⁸" },
            6: { umfang: { soll: 16, wort: "Saaten × 100 Jahre" }, masse: [{ key: "hungerOhne", wort: "Hunger ohne Ursache", soll: 0, richtung: "≤" }], erwartet: "nicht", fehlt: "16 Saaten × 100 Jahre" },
        },
        proben: {
            3: [{ name: "ATTRAPPE: der Preis steigt, doch kein Wagen aus B fährt — der Strom ist nur eine Zahl", j: { leiter: "mensch.nahrung.strom", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 10, werte: { preisPlus: 0.6, wagenAusB: 0 } } } }, gruen: false, zahl: /ROT an Wagen aus B unterwegs 0 / }],
        },
    }),

    // ───────── DIE HAND: der Spieler sammelt, bestellt; die Bewohner arbeiten ─────────
    F.leiter("mensch.nahrung.hand", {
        sek: 50,
        mutiert: true,
        pfad: [...SIEDLUNG, "stamm/vegetation-wiese.js", "stamm/feld-leben.js", "stamm/kampf.js", "stamm/koerper-seele.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            let G = null, gf = "";
            try {
                G = await ruf("HAND", { felder: Z ? Z.felder : [] });
                H.zeile("gepflückt " + G.art + " (" + G.d + " m): fort " + G.weg + ", Ernte +" + G.ernte + " " + G.ernteStoff + ", Dauer " + G.dauerH + " h, früh " + G.frueh + ", zurück " + G.zurueck + " nach " + G.takte + " Takten");
            } catch (e) {
                gf = String((e && e.message) || e).slice(0, 200);
            }
            const g = () => {
                if (!G) throw new Error("keine Messung der Hand: " + gf);
                return G;
            };
            await K.schritt(2, async () => K.leser(2, { fehlt: "kein Verb bestellt den Acker: die Kette des Klicks kennt abbau · zuenden · pfluecken · graben · hieb, kein Pflügen und keine Saat — keine Furche", wo: "stamm/kampf.js:2308" }));
            await K.schritt(3, async () => {
                const n = z().feld10;
                if (n < 50) return K.nicht(3, { n, fehlt: "50 Bewohner sichtbar bei der Feldarbeit: um 10 Uhr " + n + " am Acker (" + z().bewohner + " Bewohner)" });
                const f = z().felder[0];
                const b = await K.bild(3, { px: f.x + 12, py: "+1.7", pz: f.z + 12, lx: f.x, ly: "+1.0", lz: f.z });
                K.auge(3, { bild: b.datei, pose: "12 m diagonal vor dem ersten Acker um 10 Uhr, Ego 1,7 m", mass: n + " am Acker" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: g().bodenGeaendert, fehlt: "Werkzeug jeder Epoche mit Spur: nach " + g().dauerH + " gerafften Stunden änderte die Arbeit den Boden an " + g().bodenGeaendert + " von " + g().aecker + " Äckern" }));
            await K.schritt(5, async () => K.nicht(5, { n: z().bewohner, fehlt: "ein Fest des Jahres mit 10³ Menschen in der Erntezeit (16 Saaten): " + z().bewohner + " Bewohner, keine Erntezeit" }));
            await K.schritt(6, async () => K.nicht(6, { n: g().weg, fehlt: "20 Zufallsrollen der Nahrung: der Spieler spielt " + g().weg + " (das Sammeln) — kein Bestellen, Hüten, Fischen, Kochen" }));
            await K.schritt(1, async () =>
                K.zahl(1, {
                    // „der Spieler sammelt“: die Ernte liegt im Inventar (der Umfang); verschwindet und kehrt sind die Maße
                    n: g().ernte >= 1 ? 1 : 0,
                    werte: { weg: g().weg, frueh: g().frueh, zurueck: g().zurueck },
                    beleg: g().art + " " + g().d + " m vom Spieler, Ernte +" + g().ernte + " " + g().ernteStoff + ", Nachwuchs-Zeit " + g().dauerH + " Welt-Stunden, zurück nach " + g().takte + " Takten",
                    taeter: !g().weg ? "die Pflanze bleibt im Block (stamm/vegetation-wiese.js _streuNehmen)" : g().frueh ? "die Pflanze kehrt vor ihrer Nachwuchs-Zeit (stamm/vegetation-wiese.js _tickScatterRegrow)" : !g().zurueck ? "die Pflanze kehrt nach ihrer Nachwuchs-Zeit nicht (stamm/vegetation-wiese.js _nahStreuTat / _tickNahStreu)" : null,
                })
            );
        },
        seite: { ZENSUS, HAND },
        sprossen: {
            1: { umfang: { soll: 1, wort: "gesammelte Wildpflanze im Inventar" }, masse: [{ key: "weg", wort: "Pflanze fort nach dem Pflücken", soll: 1, richtung: "≥" }, { key: "frueh", wort: "Gegenlauf: zurück vor der Nachwuchs-Zeit", soll: 0, richtung: "≤" }, { key: "zurueck", wort: "zurück nach der Nachwuchs-Zeit", soll: 1, richtung: "≥" }] },
            2: { umfang: { soll: 1, wort: "vom Spieler bestellter Acker" }, masse: [{ key: "furchen", wort: "Furchen in Zugrichtung im Bildpaar (ja = 1)", soll: 1, richtung: "≥" }], erwartet: "leser", fehlt: "kein Verb bestellt den Acker", wo: "stamm/kampf.js:2308" },
            3: { auge: { pose: "12 m diagonal vor dem ersten Acker um 10 Uhr, Ego 1,7 m", vorbild: "Foto eines realen Erntetags (50 Menschen bei der Ernte): ≤ 65 % trennbar; Fläche je Stunde ± 30 % gegen Agrargeschichte" }, erwartet: "nicht", fehlt: "50 Bewohner bei der Feldarbeit" },
            4: { umfang: { soll: 1, wort: "Feldarbeit, die den Acker ändert (je Werkzeug und Epoche)" }, masse: [{ key: "haTag", wort: "Abweichung ha/Tag gegen Agrargeschichte", soll: 0.3, richtung: "≤" }, { key: "spur", wort: "Spur je Werkzeug erkannt", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "die Arbeit ändert den Acker nicht" },
            5: { umfang: { soll: 1000, wort: "Menschen am Fest des Jahres" }, masse: [{ key: "festErnte", wort: "Saaten mit Fest in der Erntezeit der eigenen Frucht", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "kein Fest, keine Erntezeit" },
            6: { umfang: { soll: 20, wort: "Zufallsrollen der Nahrung" }, masse: [{ key: "spielbarS", wort: "Zeit bis spielbar p95 (s)", soll: 5, richtung: "≤" }, { key: "aendert", wort: "Tat ändert die Welt", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "eine Rolle der Nahrung statt 20" },
        },
        proben: {
            1: [{ name: "ATTRAPPE: die Pflanze steht vor ihrer Nachwuchs-Zeit wieder (der Block baut sie sofort neu)", j: { leiter: "mensch.nahrung.hand", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { weg: 1, frueh: 1, zurueck: 1 } } } }, gruen: false, zahl: /ROT an Gegenlauf: zurück vor der Nachwuchs-Zeit 1 / }],
        },
    }),

    // ───────── JENSEITS DES ACKERS: Garten, Gewächshaus, Turm, Ozean ─────────
    F.leiter("mensch.nahrung.jenseits", {
        sek: 35,
        pfad: [...SIEDLUNG],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            const bau = (re) => Object.entries(z().slotRollen).filter(([k]) => re.test(k)).reduce((a, [, v]) => a + v, 0);
            const rollen = () => Object.keys(z().slotRollen).join("/");
            await K.schritt(2, async () => K.nicht(2, { n: bau(/gewaechs|glas|treib/i), fehlt: "ein Gewächshausmeer von 10² km²: kein Gewächshaus im Plan (Rollen " + rollen() + ")" }));
            await K.schritt(3, async () => K.nicht(3, { n: bau(/nahrungsturm|vertikal|farm/i), fehlt: "Nahrungstürme einer Megastadt: keiner im Plan (Rollen " + rollen() + ")" }));
            await K.schritt(4, async () => K.nicht(4, { n: bau(/ozean|aqua|fischzucht/i), fehlt: "eine Ozeanfarm: keine im Plan" }));
            await K.schritt(5, async () => K.nicht(5, { n: 1, fehlt: "64 Saaten mit Habitat-Agrar: die Sitzung trägt eine Saat ohne Habitat" }));
            await K.schritt(6, async () => K.nicht(6, { n: 1, fehlt: "16 Saaten über Sonnensysteme mit Import: die Sitzung trägt eine Welt" }));
            await K.schritt(1, async () => {
                const gt = z().garten;
                if (!gt) return K.nicht(1, { n: 0, fehlt: "Gewächshaus und Garten im Ort: keiner unter " + z().haeuser + " Häusern (Rollen " + rollen() + ")" });
                const b = await K.bild(1, { px: gt.x + 10, py: "+1.7", pz: gt.z + 10, lx: gt.x, ly: "+1.0", lz: gt.z });
                K.auge(1, { bild: b.datei, pose: "10 m diagonal vor dem ersten Garten/Gewächshaus, Ego 1,7 m", mass: gt.rolle });
            });
        },
        seite: { ZENSUS },
        sprossen: {
            1: { auge: { pose: "10 m diagonal vor dem ersten Garten/Gewächshaus, Ego 1,7 m", vorbild: "Bildpaar realer Bauerngarten und Gewächshaus (Mitteleuropa): ≤ 65 % trennbar, nur in passendem Klima" }, erwartet: "nicht", fehlt: "kein Garten, kein Gewächshaus im Ort" },
            2: { auge: { pose: "Orbit über dem Ort", vorbild: "Satellitenbild Almería (Gewächshausmeer, Albedo-Fleck): Blindurteil ≤ 65 %" }, erwartet: "nicht", fehlt: "kein Gewächshausmeer" },
            3: { umfang: { soll: 1, wort: "Nahrungsturm einer Megastadt" }, masse: [{ key: "r", wort: "Stadtnahrung ↔ Bodenpreis (r)", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "kein Nahrungsturm" },
            4: { umfang: { soll: 1, wort: "Ozeanfarm" }, masse: [{ key: "r", wort: "Farmfläche ↔ Küstenbevölkerung (r)", soll: 0, richtung: ">" }], erwartet: "nicht", fehlt: "keine Ozeanfarm" },
            5: { umfang: { soll: 64, wort: "Saaten mit Habitat-Agrar" }, masse: [{ key: "anteil", wort: "Saaten, die sich sichtbar ernähren", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "64 Saaten mit Habitat" },
            6: { umfang: { soll: 16, wort: "Saaten über Sonnensysteme" }, masse: [{ key: "import", wort: "Welten ohne Überschuss, die sichtbar importieren", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "16 Saaten über Sonnensysteme" },
        },
        proben: {
            3: [{ name: "ATTRAPPE: ein Turm steht, seine Nahrung folgt keinem Bodenpreis (r 0,2)", j: { leiter: "mensch.nahrung.jenseits", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 1, werte: { r: 0.2 } } } }, gruen: false, zahl: /ROT an Stadtnahrung ↔ Bodenpreis \(r\) 0\.2 / }],
        },
    }),
];
