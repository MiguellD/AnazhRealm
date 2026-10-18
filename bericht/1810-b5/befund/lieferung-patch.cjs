// 1810 B5 (OMEN, Finder): EIN Instrument-Eingriff in scripts/diag-boot-stage.cjs (KALT_PROBE) — die Lieferungen vor dem
// ersten Weltbild beim Namen: je Auftrag Einreihen (_foundryAuftrag: Rang, im Blick, Schlange) → Senden (postMessage, reqId,
// Bahn) → Ankunft (_foundryAntwort: Platte ja/nein, Atlas-Warten) → Erfüllung (Promise) → Satz (_foundryCacheSet) + Gruppen-Bau
// (_foundryBuildGroup, ms); der Leib (_ofenAssembleAsset, applyPlayerSoul); je Probe die Lücken mit Zahl und für
// bauten/streu/karten die Klassen (Art:Stufe, Grund, L1 da/reist). Zurück: git -c core.autocrlf=false checkout -- scripts/diag-boot-stage.cjs
//   node lieferung-patch.cjs <baum>
"use strict";
const fs = require("fs");
const path = require("path");
const baum = process.argv[2];
const f = path.join(baum, "scripts", "diag-boot-stage.cjs");
let s = fs.readFileSync(f, "utf8");
if (s.includes("OMEN 1810 B5")) {
    console.log(f, "schon gepatcht");
    process.exit(0);
}
const ers = (a, n) => {
    if (s.split(a).length !== 2) throw new Error(`Anker nicht eindeutig: ${JSON.stringify(a)}`);
    s = s.replace(a, n);
};
// (1) Senden: jede build-asset/export-Nachricht an einen Studio-Faden mit reqId
ers(
    '        if (!A.auftrag && m && m.type === "build-asset") A.auftrag = Math.round(performance.now());\n',
    '        if (!A.auftrag && m && m.type === "build-asset") A.auftrag = Math.round(performance.now());\n' +
        "        if (m && m.reqId != null && A.lf) {\n" +
        "            const k = A.lfKey(m);\n" +
        "            const l = A.lf.offen[k];\n" +
        "            A.lf.s.push([l && l.length ? l.shift() : -1, Math.round(performance.now()), String(m.reqId)]);\n" +
        "        }\n"
);
// (2) die Hüllen und der Detail-Leser
ers(
    "    let gewickelt = false;\n",
    "    // OMEN 1810 B5: die Lieferungen beim Namen\n" +
        "    A.lf = { q: [], s: [], an: [], erf: [], satz: [], grp: [], ofen: [], seele: [], tick: [], atlas: 0, offen: {}, stapel: [] };\n" +
        "    A.lfKey = (m) => (m.type || '?') + '#' + (typeof m.platte === 'string' ? m.platte : m.presetId + '|' + m.seed + '|' + m.lod) + (m.vorrat ? '|V' : '');\n" +
        "    const LF = A.lf;\n" +
        "    const rund = (x) => Math.round(x * 10) / 10;\n" +
        "    const wickleLf = (P) => {\n" +
        "        const w = (name, fn) => {\n" +
        "            const alt = P[name];\n" +
        "            if (typeof alt === 'function') P[name] = fn(alt);\n" +
        "        };\n" +
        "        w('_foundryAuftrag', (alt) => function (f, praefix, msg, wo) {\n" +
        "            const t = performance.now();\n" +
        "            let d = null, blick = null;\n" +
        "            try {\n" +
        "                const d2 = this._foundryAuftragD2(wo);\n" +
        "                blick = this._rangImErstenBlick(d2) ? 1 : 0;\n" +
        "                const A2 = this.constructor.ERSTER_BLICK.ausserD2;\n" +
        "                d = Number.isFinite(d2) ? Math.round(Math.sqrt(d2 >= A2 ? d2 - A2 : d2)) : -1;\n" +
        "            } catch (_e) {}\n" +
        "            const id = LF.q.length;\n" +
        "            if (d === -1 && !this.state._weltbildDa && LF.stapel.length < 40) LF.stapel.push([id, String(new Error().stack).split('\\n').slice(2, 10).map((z) => z.trim()).join(' < ')]);\n" +
        "            const k = A.lfKey(msg);\n" +
        "            LF.q.push([Math.round(t), k, d, blick, (f.warte || []).length, f.pending ? f.pending.size : 0, this.state._weltbildDa ? 1 : 0]);\n" +
        "            (LF.offen[k] || (LF.offen[k] = [])).push(id);\n" +
        "            const p = alt.apply(this, arguments);\n" +
        "            p.then((x) => LF.erf.push([id, Math.round(performance.now()), x ? (Array.isArray(x) ? x.length : 1) : 0]));\n" +
        "            return p;\n" +
        "        });\n" +
        "        w('_foundryAntwort', (alt) => function (f, m) {\n" +
        "            const ms = (m && m.meshes) || [];\n" +
        "            const atl = !f.blattAtlas && ms.some((x) => x && (x.kind === 'foliageTex' || x.kind === 'schatten')) ? 1 : 0;\n" +
        "            LF.an.push([Math.round(performance.now()), String(m && m.reqId), m && m.type, m && m.platte ? 1 : 0, ms.length, m && m.vorrat ? 1 : 0, atl, m && Array.isArray(m.b5) ? m.b5.map((x) => (x ? Math.round(x - performance.timeOrigin) : 0)) : null]);\n" +
        "            return alt.apply(this, arguments);\n" +
        "        });\n" +
        "        w('_foundryBlattAtlas', (alt) => function () {\n" +
        "            if (!LF.atlas) LF.atlas = Math.round(performance.now());\n" +
        "            return alt.apply(this, arguments);\n" +
        "        });\n" +
        "        w('_foundryCacheSet', (alt) => function (key) {\n" +
        "            LF.satz.push([Math.round(performance.now()), String(key)]);\n" +
        "            return alt.apply(this, arguments);\n" +
        "        });\n" +
        "        const dauer = (liste, was) => (alt) => function () {\n" +
        "            const t0 = performance.now();\n" +
        "            try {\n" +
        "                return alt.apply(this, arguments);\n" +
        "            } finally {\n" +
        "                liste.push([Math.round(t0), rund(performance.now() - t0)].concat(was ? was(arguments) : []));\n" +
        "            }\n" +
        "        };\n" +
        "        w('_foundryBuildGroup', dauer(LF.grp, (a) => [a[1] && a[1].preset, a[1] && a[1].lod]));\n" +
        "        w('_ofenAssembleAsset', dauer(LF.ofen));\n" +
        "        w('applyPlayerSoul', dauer(LF.seele, (a) => [String(a[0])]));\n" +
        "        w('_ankunftsBild', (alt) => function () {\n" +
        "            if (!this.state._weltbildDa) LF.tick.push(Math.round(performance.now()));\n" +
        "            return alt.apply(this, arguments);\n" +
        "        });\n" +
        "    };\n" +
        "    const lfDetail = (r, L) => {\n" +
        "        const st = r.state, pm = st.playerMesh, d = {};\n" +
        "        const f = r._foundry;\n" +
        "        if (f) d.q = [(f.warte || []).length, f.pending ? f.pending.size : 0, f.zuege ? f.zuege.size : 0, (r._foundryIngestQueue || []).length, f.nachAtlas ? f.nachAtlas.length : 0];\n" +
        "        if (!pm) return d;\n" +
        "        const p = pm.position;\n" +
        "        const terms = new Set(L.map((l) => l.term));\n" +
        "        const R = Number.isFinite(st.architectureCullingRadius) ? st.architectureCullingRadius : 150;\n" +
        "        const ding = r.constructor.ERSTER_BLICK.dingM;\n" +
        "        if (terms.has('bauten')) {\n" +
        "            const b = {};\n" +
        "            for (const e of st.architectures || []) {\n" +
        "                if (!e || !e.position) continue;\n" +
        "                const dx = e.position.x - p.x, dz = e.position.z - p.z;\n" +
        "                if (dx * dx + dz * dz > R * R || r._archIsRendered(e) || !r._imErstenBlick(e.position.x, e.position.z, ding)) continue;\n" +
        "                let pr = null;\n" +
        "                try { pr = r._foundryPresetForEntry(e); } catch (_e) {}\n" +
        "                const k = (pr || 'typ:' + String(e.type).slice(0, 28)) + ':L' + e._lodLevel;\n" +
        "                const z = b[k] || (b[k] = [0, 1e9]);\n" +
        "                z[0]++;\n" +
        "                z[1] = Math.min(z[1], Math.round(Math.hypot(dx, dz)));\n" +
        "            }\n" +
        "            d.bauten = b;\n" +
        "        }\n" +
        "        if (terms.has('streu')) {\n" +
        "            const SC = r.constructor.SCATTER, liste = [];\n" +
        "            r._streuWartet(p, liste, (rx, rz) => r._imErstenBlick((rx + 0.5) * SC.regionM, (rz + 0.5) * SC.regionM, SC.regionM * Math.SQRT1_2));\n" +
        "            const g = {};\n" +
        "            for (const x of liste) { const k = x.replace(/^\\S+ /, ''); g[k] = (g[k] || 0) + 1; }\n" +
        "            d.streu = g;\n" +
        "        }\n" +
        "        if (terms.has('karten')) {\n" +
        "            const at = r._impostorAtlas(), c = {};\n" +
        "            for (const k of r._impostorBakeQueue || []) {\n" +
        "                const z = at.zellen.get(k);\n" +
        "                if (z && !r._rangImErstenBlick(z._bedarfD2)) continue;\n" +
        "                let l1 = '?';\n" +
        "                try { l1 = f && f.cache.has(r._foundryKoerperKey(z.preset, z.variant, r._foundryServierStufe(z.preset, 1), z.ov)) ? 'L1da' : 'L1reist'; } catch (_e) {}\n" +
        "                const kk = (z ? z.preset : '?') + ':' + l1;\n" +
        "                c[kk] = (c[kk] || 0) + 1;\n" +
        "            }\n" +
        "            d.karten = c;\n" +
        "        }\n" +
        "        return d;\n" +
        "    };\n" +
        "    let gewickelt = false;\n"
);
ers(
    "                wickle(Object.getPrototypeOf(r));\n",
    "                wickle(Object.getPrototypeOf(r));\n                wickleLf(Object.getPrototypeOf(r));\n"
);
ers(
    "                o.fehlt = r._weltbildFehlt();\n",
    "                const L = r._weltbildLuecken();\n" +
        "                o.fehlt = L.map((l) => l.satz);\n" +
        "                o.lk = L.map((l) => l.term + ':' + l.n + (l.arbeitet ? '*' : ''));\n" +
        "                if (!r.state._weltbildDa) o.det = lfDetail(r, L);\n"
);
fs.writeFileSync(f, s);
console.log(f, "gepatcht (B5 Lieferungen)");
