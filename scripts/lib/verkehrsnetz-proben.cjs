"use strict";
// scripts/lib/verkehrsnetz-proben.cjs — DER VERKEHR IM PLAN DER STADT (siedlung, PFLICHT-OFFEN C; w28-stadt-grammatik): die Proben
// der Settlement-Linse (`node scripts/diag-settlement.cjs`, Teil A am Tisch) am Verkehr des Fachwerk-Kerns — `verkehrVon` (welches
// Los einen Wagen trägt) und `verkehrsNetz` (die Wende jedes Endes: ihre Bahn, ihr Kranz der Plätze, der Stand des Fahrers) —
// samt den Selbst-Tests 15d bis 15g, je am Stand bis w28-stadt-grammatik ROT beim Namen. Der Konsum-Leser am Gerät ist
// gate:fahr-leben VK (der Fußweg zum Wagen, die Flotte vor der Wende, der Abstand Wagen an Wagen, der Fahrer ohne Weg).

// FC = der Fachwerk-Kern, wie die Linse ihn am Tisch lädt (`studioKern`), check = ihr Prüfer (Name, bestanden, Detail)
function verkehrsnetzProben(FC, check) {
    // DER WAGEN DER STADT GEHÖRT EINEM HAUS IM RING (w28-stadt-grammatik, fachwerk `verkehrVon`): kein Wagen an einem Los der
    // Vorstadt — sie hängt je Tor an EINER Ausfallstraße, ihr Ende liegt in der Luft nah an einem anderen Tor und zu Fuß weit
    // von ihm (stadt-voll: #548012 am Ende der Ausfallstraße des Ost-Tors trug Wagen 18 an der Wende des Nordost-Tors, 155 m
    // Luft, 512 m Weg; gate:fahr-leben VK fiel an ihm, ohne ihn zu nennen). Den Fußweg selbst misst der Plan am Tisch nicht
    // (der flache Plan trägt keine Wende, sie liegt erst im Plan v2 am Hang): er steht am Gerät, gate:fahr-leben VK.
    const wagenLose = (pl, wahl) => {
        const sl = pl.slots || [];
        const aus = { n: wahl.length, vorstadt: [] };
        for (const [w, i] of wahl.entries())
            if (sl[i] && sl[i].viertel === "vorstadt") aus.vorstadt.push(`Wagen ${w}: Los #${i} ${sl[i].rolle || ""} (Vorstadt)`);
        return aus;
    };
    {
        const wagenFehl = [];
        let [wagenN, vorLose] = [0, 0];
        for (const [seed, nH] of [
            [7, 120],
            [7, 300],
            [11, 200],
        ]) {
            const pl = FC.exportSettlement({ seed, nH });
            const w = wagenLose(pl, FC.verkehrVon(pl).slots);
            wagenN += w.n;
            vorLose += pl.slots.filter((q) => q.viertel === "vorstadt").length;
            if (w.vorstadt.length) wagenFehl.push(`${seed}/${nH}: ${w.vorstadt.slice(0, 2).join(" · ")}`);
        }
        check(
            `DER WAGEN DER STADT GEHÖRT EINEM HAUS IM RING: kein Wagen an einem Los der Vorstadt (3 Städte, ${wagenN} Wagen, ${vorLose} Lose der Vorstadt)`,
            wagenFehl.length === 0 && wagenN > 0 && vorLose > 0,
            wagenFehl.slice(0, 3).join(" · ") || (wagenN > 0 && vorLose > 0 ? "" : `${wagenN} Wagen, ${vorLose} Lose der Vorstadt (die Probe prüfte nichts)`)
        );
        // Selbst-Test 15d: die Wahl bis w28-stadt-grammatik (gleichmäßig über JEDES Los) setzt in der Metropole des Gesetzes
        // einen Wagen an die Vorstadt — beim Namen
        const st = FC.exportSettlement({ seed: 7, nH: 300 });
        const nW = FC.verkehrVon(st).n;
        const alt = wagenLose(st, Array.from({ length: nW }, (_, w) => Math.min(st.slots.length - 1, Math.floor(((w + 0.5) * st.slots.length) / nW)))); // prettier-ignore
        const neu = wagenLose(st, FC.verkehrVon(st).slots);
        check(
            "Selbst-Test 15d: der Wagen im Ring — die Wahl über jedes Los (wie bis w28-stadt-grammatik) setzt einen Wagen an die Vorstadt und fällt beim Namen, die Wahl des Gesetzes keinen",
            alt.vorstadt.length > 0 && neu.vorstadt.length === 0 && neu.n === alt.n,
            JSON.stringify({ alt: alt.vorstadt.slice(0, 2), wagen: nW, vorstadtLose: st.slots.filter((s) => s.viertel === "vorstadt").length }) // prettier-ignore
        );
    }
    // DIE WENDE TRÄGT KEINE BEGEGNUNG (w28-stadt-grammatik, fachwerk `verkehrsNetz`: die Bahn ohne Begegnung zuerst): die erste
    // Wende jedes Endes (die des Torplatzes) führt hinein und heraus, ohne dass zwei Wagen einander samt dem Ausscheren näher
    // kommen als zwei halbe Wagen (`engen` leer) — an stadt-voll trugen drei von vier eine Enge im Zulauf, die Schleife im
    // Südwesten fasste 6 Wagen bei 7 Plätzen, die Flotte stand vor ihr (gate:fahr-leben VK 20 m und 28 m je Minute).
    const wendeEngen = (N) => {
        const aus = { enden: 0, wenden: 0, taeter: [] };
        for (const K of N.kreuzungen || []) {
            if (!K.ende) continue;
            aus.enden++;
            const w = (K.wenden || [])[0];
            if (!w) continue;
            aus.wenden++;
            if ((w.engen || []).length)
                aus.taeter.push(`Ende ${K.x.toFixed(1)}/${K.z.toFixed(1)}: Wende ${w.x.toFixed(1)}/${w.z.toFixed(1)} mit ${w.engen.length} Enge(n) bei ${w.engen[0].x.toFixed(1)}/${w.engen[0].z.toFixed(1)}`);
        }
        return aus;
    };
    const netze = []; // [Name, Plan, Netz] der drei Städte — 15e bis 15g lesen dasselbe Netz
    {
        const engFehl = [];
        let [enden, wenden] = [0, 0];
        let erstes = null;
        for (const [seed, nH] of [
            [7, 120],
            [7, 300],
            [11, 200],
        ]) {
            const pl = FC.exportSettlement({ seed, nH });
            const N = FC.verkehrsNetz(pl, 0, 0);
            netze.push([`${seed}/${nH}`, pl, N]);
            const w = wendeEngen(N);
            enden += w.enden;
            wenden += w.wenden;
            if (!erstes && w.wenden) erstes = N;
            if (w.taeter.length) engFehl.push(`${seed}/${nH}: ${w.taeter.slice(0, 2).join(" · ")}`);
        }
        check(
            `DIE WENDE TRÄGT KEINE BEGEGNUNG: die erste Wende jedes Endes führt hinein und heraus ohne Enge (3 Städte, ${wenden} Wenden an ${enden} Enden)`,
            engFehl.length === 0 && wenden > 0,
            engFehl.slice(0, 3).join(" · ") || (wenden > 0 ? "" : `${wenden} Wenden an ${enden} Enden (die Probe prüfte nichts)`)
        );
        // Selbst-Test 15e: dieselbe Stadt, die erste Wende eines Endes mit einer Enge in ihrer Bahn (der Stand bis
        // w28-stadt-grammatik) — fällt beim Namen
        const mut = erstes && {
            kreuzungen: erstes.kreuzungen.map((K, i, L) =>
                K.ende && (K.wenden || []).length && L.findIndex((q) => q.ende && (q.wenden || []).length) === i
                    ? Object.assign({}, K, { wenden: [Object.assign({}, K.wenden[0], { engen: [{ x: K.wenden[0].x, z: K.wenden[0].z, r: 3 }] })].concat(K.wenden.slice(1)) }) // prettier-ignore
                    : K
            ),
        };
        const m = mut ? wendeEngen(mut) : { taeter: [] };
        check(
            "Selbst-Test 15e: die Wende ohne Begegnung — die Stadt des Gesetzes besteht, dieselbe mit einer Enge in der Bahn ihrer ersten Wende fällt beim Namen",
            !!erstes && wendeEngen(erstes).taeter.length === 0 && m.taeter.length === 1,
            JSON.stringify({ ohne: erstes ? wendeEngen(erstes).taeter.length : null, mit: m.taeter[0] || null })
        );
    }
    // DER KRANZ HÄLT DAS AUSSCHEREN (15f) · EIN PLATZ GILT NUR MIT FREIEM FAHRER-STAND (15g) — w28-stadt-grammatik, fachwerk
    // `verkehrsNetz`, je Platz der ersten Wende jedes Endes. 15f: zwischen dem geparkten Wagen und dem Wagen auf dem Ring samt
    // dem Ausscheren des größten im Bogen ((parkL/2)²/(2·r)) bleibt `parkRandM` — bis hier stand der Kranz um `halbM` +
    // `parkRandM`, der größte fuhr 0,6 − 0,52 = 0,08 m vorbei (stadt-voll 23 Uhr: Wagen 15 auf dem Ring 0,09 m neben Wagen 12
    // auf seinem Platz). 15g: außen am Platz, eine Wagenbreite vom Ring fort (dort steht sein Fahrer, der Wirt
    // `_verkehrAnlegen`), liegt kein Grundriss und keine Spur näher als zwei halbe Wagen, auch nicht das Stück der Trasse
    // zwischen Abzweig und Ende — bis hier lag der Stand am ersten Platz der Südwest-Wende von stadt-voll in der Spur, der Wirt
    // rückte ihn, und bis dahin fand der Fahrer #133030 keinen Weg zu ihm (gate:fahr-leben VK-V). Ob der Wirt den Weg vom Los
    // dorthin findet, urteilt er am Gerät (VK-V); der Plan hält die Ursache frei.
    const wendePlaetze = (pl, N) => {
        const V = FC.VERKEHR_GESETZ;
        const aus = { wenden: 0, plaetze: 0, kranz: [], stand: [] };
        const spuren = (N.strecken || []).flatMap((s) => s.spur || []);
        const zuLinie = (x, z, Q) => {
            let m = Infinity;
            for (let i = 1; i < Q.length; i++) {
                const [a, b] = [Q[i - 1], Q[i]];
                const [dx, dz] = [b.x - a.x, b.z - a.z];
                const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
                m = Math.min(m, Math.hypot(x - a.x - dx * t, z - a.z - dz * t));
            }
            return m;
        };
        const imHaus = (x, z) =>
            (pl.slots || []).some((sl) => {
                const o = sl.obb;
                if (!o) return false;
                const [c, s, dx, dz] = [Math.cos(o.phi), Math.sin(o.phi), x - o.cx, z - o.cz];
                return Math.abs(dx * c - dz * s) <= o.ex && Math.abs(dx * s + dz * c) <= o.ez;
            });
        for (const K of N.kreuzungen || []) {
            const w = K.ende && (K.wenden || [])[0];
            if (!w) continue;
            aus.wenden++;
            const schert = (V.parkL / 2) ** 2 / (2 * w.r);
            const wo = `Wende ${w.x.toFixed(1)}/${w.z.toFixed(1)}`;
            for (const [i, p] of (w.plaetze || []).entries()) {
                aus.plaetze++;
                const rand = Math.hypot(p.x - w.x, p.z - w.z) - V.parkB / 2 - (w.r + V.halbM + schert);
                if (rand < V.parkRandM - 1e-6)
                    aus.kranz.push(`${wo} Platz ${i}: ${rand.toFixed(2)} m zum Wagen auf dem Ring samt Ausscheren ${schert.toFixed(2)} m (Soll ≥ ${V.parkRandM} m)`);
                const [sx, sz] = [p.x + Math.cos(p.beta) * V.parkB, p.z + Math.sin(p.beta) * V.parkB];
                const d = Math.min(Infinity, ...spuren.map((Q) => zuLinie(sx, sz, Q)));
                if (imHaus(sx, sz)) aus.stand.push(`${wo} Platz ${i}: der Stand des Fahrers ${sx.toFixed(1)}/${sz.toFixed(1)} liegt in einem Grundriss`);
                else if (d < 2 * V.halbM - 1e-6)
                    aus.stand.push(`${wo} Platz ${i}: der Stand des Fahrers ${sx.toFixed(1)}/${sz.toFixed(1)} liegt ${d.toFixed(2)} m neben einer Spur (Soll ≥ ${2 * V.halbM} m)`);
            }
        }
        return aus;
    };
    {
        const [kranzFehl, standFehl] = [[], []];
        let [wendenN, plaetzeN] = [0, 0];
        for (const [name, pl, N] of netze) {
            const w = wendePlaetze(pl, N);
            wendenN += w.wenden;
            plaetzeN += w.plaetze;
            if (w.kranz.length) kranzFehl.push(`${name}: ${w.kranz[0]} (${w.kranz.length} Plätze)`);
            if (w.stand.length) standFehl.push(`${name}: ${w.stand[0]} (${w.stand.length} Plätze)`);
        }
        check(
            `DER KRANZ DER PLÄTZE HÄLT DAS AUSSCHEREN: jeder Platz der ersten Wende jedes Endes steht ${FC.VERKEHR_GESETZ.parkRandM} m hinter dem Wagen auf dem Ring samt seinem Ausscheren (3 Städte, ${plaetzeN} Plätze an ${wendenN} Wenden)`,
            kranzFehl.length === 0 && plaetzeN > 0,
            kranzFehl.slice(0, 3).join(" · ") || (plaetzeN > 0 ? "" : "0 Plätze (die Probe prüfte nichts)")
        );
        check(
            `EIN PLATZ GILT NUR MIT FREIEM FAHRER-STAND: außen am Platz kein Grundriss und keine Spur näher als zwei halbe Wagen (3 Städte, ${plaetzeN} Plätze an ${wendenN} Wenden)`,
            standFehl.length === 0 && plaetzeN > 0,
            standFehl.slice(0, 3).join(" · ") || (plaetzeN > 0 ? "" : "0 Plätze (die Probe prüfte nichts)")
        );
        // Selbst-Test 15f · 15g: dieselbe Stadt mit dem Kranz bis w28-stadt-grammatik (jeder Platz um das Ausscheren näher am
        // Ring) fällt je Wende beim Namen; ein Platz, dessen Fahrer-Stand auf einer Spur liegt, ebenso
        const st = netze.find(([, , N]) => (N.kreuzungen || []).some((K) => K.ende && (K.wenden || [])[0] && K.wenden[0].plaetze.length));
        const V = FC.VERKEHR_GESETZ;
        const mutiere = (N, fn) => {
            let erster = true;
            return Object.assign({}, N, {
                kreuzungen: N.kreuzungen.map((K) => {
                    if (!(erster && K.ende && (K.wenden || [])[0] && K.wenden[0].plaetze.length)) return K;
                    erster = false;
                    return Object.assign({}, K, { wenden: [Object.assign({}, K.wenden[0], { plaetze: fn(K.wenden[0]) })].concat(K.wenden.slice(1)) });
                }),
            });
        };
        const eng = st && wendePlaetze(st[1], mutiere(st[2], (w) => w.plaetze.map((p) => { const r = Math.hypot(p.x - w.x, p.z - w.z), k = (r - (V.parkL / 2) ** 2 / (2 * w.r)) / r; return Object.assign({}, p, { x: w.x + (p.x - w.x) * k, z: w.z + (p.z - w.z) * k }); }))); // prettier-ignore
        const spur0 = st && (st[2].strecken || []).flatMap((s) => s.spur || [])[0];
        const inSpur = st && spur0 && wendePlaetze(st[1], mutiere(st[2], (w) => { const q = spur0[spur0.length >> 1], b = Math.atan2(q.z - w.z, q.x - w.x); return w.plaetze.concat([{ x: q.x - Math.cos(b) * V.parkB, z: q.z - Math.sin(b) * V.parkB, beta: b, fahrt: 0 }]); })); // prettier-ignore
        const heil = st && wendePlaetze(st[1], st[2]);
        check(
            "Selbst-Test 15f: der Kranz samt Ausscheren — die Stadt des Gesetzes besteht, dieselbe mit dem Kranz um das Ausscheren näher am Ring (wie bis w28-stadt-grammatik) fällt je Platz beim Namen",
            !!heil && heil.kranz.length === 0 && !!eng && eng.kranz.length > 0,
            JSON.stringify({ heil: heil && heil.kranz.length, eng: eng && eng.kranz[0], plaetze: eng && eng.kranz.length })
        );
        check(
            "Selbst-Test 15g: der freie Fahrer-Stand — die Stadt des Gesetzes besteht, dieselbe mit einem Platz, dessen Fahrer-Stand auf einer Spur liegt, fällt beim Namen",
            !!heil && heil.stand.length === 0 && !!inSpur && inSpur.stand.length === 1,
            JSON.stringify({ heil: heil && heil.stand.length, inSpur: inSpur && inSpur.stand[0] })
        );
    }
}

module.exports = { verkehrsnetzProben };
