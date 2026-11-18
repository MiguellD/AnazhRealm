"use strict";
// SPIKE FINGERABDRUCK — die Welt als Funktion: headless (Null-Renderer) an festen Orten booten, je BENANNTEM Ding ein Inhalt-Hash.
//   node fp.cjs <baum> <aus.json> [orte=genesis,wiese,dorf] [takte=240]
// Kein Gate, nicht im Stamm. Der Boot ist der EINE Welt-Boot des Baums (scripts/lib/welt-boot.cjs, Rezept null).
const path = require("path");
const fs = require("fs");
const BAUM = path.resolve(process.argv[2] || ".");
const AUS = path.resolve(process.argv[3] || "fp.json");
const ORTE = (process.argv[4] || "genesis,wiese,dorf").split(",");
const TAKTE = Number(process.argv[5] || 240);
const WB = require(path.join(BAUM, "scripts/lib/welt-boot.cjs"));
const { messort } = require(path.join(BAUM, "scripts/lib/welt-orte.cjs"));

// ---- in der Seite ----
const SEITE = String.raw`
(() => {
  // FNV-1a, zwei Ströme (64 bit), über Bytes; Wörter wenn ausgerichtet
  const H = () => ({ a: 0x811c9dc5, b: 0x01000193 ^ 0x9e3779b9 });
  const byte = (h, x) => { h.a = Math.imul(h.a ^ x, 0x01000193); h.b = Math.imul(h.b ^ x, 0x01000193) + 0x7f4a7c15 | 0; };
  const u8 = (h, u) => { for (let i = 0; i < u.length; i++) byte(h, u[i]); };
  const txt = (h, s) => { s = String(s); for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); byte(h, c & 255); if (c > 255) byte(h, c >> 8); } byte(h, 0); };
  const hex = (h) => (h.a >>> 0).toString(16).padStart(8, "0") + (h.b >>> 0).toString(16).padStart(8, "0");
  const typed = (h, v) => { const u = new Uint8Array(v.buffer, v.byteOffset, v.byteLength); if (u.byteLength % 4 === 0 && u.byteOffset % 4 === 0) { const w = new Uint32Array(u.buffer, u.byteOffset, u.byteLength >> 2); for (let i = 0; i < w.length; i++) { h.a = Math.imul(h.a ^ w[i], 0x01000193); h.b = Math.imul(h.b ^ (w[i] >>> 7), 0x01000193) + 0x7f4a7c15 | 0; } } else u8(h, u); };
  // kanonischer Wert-Hash: Objekte nach sortierten Schlüsseln, Map/Set sortiert, Typed als Bytes; Zahlen auf 1e-6
  const SKIP = /^(uuid|id|version|_listeners|parent|__|_cache|matrixWorld|modelViewMatrix|normalMatrix|_t0|zeit|seit|ms$|t$|stamp)/;
  const wert = (h, v, tiefe, gesehen) => {
    if (v == null) return txt(h, "~");
    const t = typeof v;
    if (t === "number") return txt(h, Number.isFinite(v) ? Math.round(v * 1e6) / 1e6 : String(v));
    if (t === "string" || t === "boolean" || t === "bigint") return txt(h, v);
    if (t === "function") return txt(h, "fn:" + (v.name || ""));
    if (t !== "object") return txt(h, t);
    if (ArrayBuffer.isView(v)) return txt(h, v.constructor.name), typed(h, v);
    if (v instanceof ArrayBuffer) return typed(h, new Uint8Array(v));
    if (gesehen.has(v)) return txt(h, "@zyklus");
    if (tiefe <= 0) return txt(h, "@tief");
    if (v.isObject3D || v.isBufferGeometry || v.isTexture || (typeof Node !== "undefined" && v instanceof Node)) return txt(h, "@" + (v.type || "dom") + ":" + (v.name || ""));
    if (v.isNode && typeof v.getCacheKey === "function") { try { return txt(h, "node:" + v.getCacheKey(true)); } catch { return txt(h, "node?"); } }
    gesehen.add(v);
    if (v instanceof Map) { const e = [...v].map(([k, x]) => [typeof k === "object" ? "obj" : String(k), x]).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)); txt(h, "M" + e.length); for (const [k, x] of e) txt(h, k), wert(h, x, tiefe - 1, gesehen); }
    else if (v instanceof Set) { const e = [...v].map((x) => { const g = H(); wert(g, x, tiefe - 1, gesehen); return hex(g); }).sort(); txt(h, "S" + e.length); for (const k of e) txt(h, k); }
    else if (Array.isArray(v)) { txt(h, "A" + v.length); for (const x of v) wert(h, x, tiefe - 1, gesehen); }
    else { const ks = Object.keys(v).filter((k) => !SKIP.test(k)).sort(); txt(h, "O"); for (const k of ks) { let x; try { x = v[k]; } catch { continue; } txt(h, k); wert(h, x, tiefe - 1, gesehen); } }
    gesehen.delete(v);
  };
  const W = (v, tiefe = 8) => { const h = H(); wert(h, v, tiefe, new Set()); return hex(h); };
  window.__fpW = W;
  const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const geoH = (g) => { const h = H(); if (!g || !g.attributes) return "~"; for (const k of Object.keys(g.attributes).sort()) { const a = g.attributes[k]; const arr = a.array || a.data?.array; txt(h, k); if (arr) typed(h, arr); } if (g.index) typed(h, g.index.array); return hex(h); };
  // A2 · DIE SÄTZE ohne Pack-Reihenfolge: je Block (Schlüssel) die Quell-Geometrie, die er in den Satz legte
  window.__fpSaetze = () => {
    const aus = {};
    for (const [sk, s] of st.chunkSaetze || []) for (const [bk, b] of s.bloecke || []) aus[(String(sk) + "|" + String(bk)).replace(UUID, "uuid")] = b.geom ? geoH(b.geom) : "~" + b.vAnzahl;
    return aus;
  };
  // A3 · DIE INSTANZEN ohne Reihenfolge: je Instanz-Mesh die sortierte Menge seiner Instanzen (Matrix auf 1e-4 + jedes Instanz-Attribut)
  window.__fpInstanzen = () => {
    const aus = {};
    st.scene.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const n = Math.min(o.count, o.instanceMatrix.count), M = o.instanceMatrix.array, C = o.instanceColor?.array;
      const inst = Object.entries(o.geometry?.attributes || {}).filter(([, a]) => a.isInstancedBufferAttribute || a.meshPerAttribute);
      const je = [];
      for (let i = 0; i < n; i++) {
        const h = H();
        for (let j = 0; j < 16; j++) txt(h, Math.round(M[i * 16 + j] * 1e4));
        if (C) for (let j = 0; j < 3; j++) txt(h, Math.round(C[i * 3 + j] * 1e4));
        for (const [k, a] of inst) { const s = a.itemSize, arr = a.array || a.data?.array; if (arr) for (let j = 0; j < s; j++) txt(h, Math.round(arr[i * s + j] * 1e4)); }
        je.push(hex(h));
      }
      je.sort();
      const h = H(); for (const x of je) txt(h, x);
      let key = ((o.name || o.userData?.archInstanceKey || o.type) + "").replace(UUID, "uuid"), k2 = key, i = 1;
      while (aus[k2]) k2 = key + "#" + i++;
      aus[k2] = hex(h) + "/" + n;
    });
    return aus;
  };

  // A · DIE HALTER: jedes ArrayBuffer-Byte der Welt am Pfad seines ersten Halters (Breitensuche ab r, wie heapHalter), Gruppe = Pfad
  // Tiefe 3 (Map-Schlüssel als [], Indizes als []), Ding = voller Pfad mit Schlüssel → Hash der Bytes
  window.__fpHalter = (tiefe = 3) => {
    const gesehen = new WeakSet(), q = [[r, "r"]], aus = {};
    let bytes = 0;
    for (let i = 0; i < q.length; i++) {
      const [o, p] = q[i]; q[i] = null;
      const kinder = [];
      if (o instanceof Map) for (const [k, v] of o) kinder.push([v, p + "[=" + (typeof k === "object" ? "obj" : String(k)) + "]"]);
      else if (o instanceof Set) { let j = 0; for (const v of o) kinder.push([v, p + "[#" + j++ + "]"]); }
      else if (Array.isArray(o)) o.forEach((v, j) => kinder.push([v, p + "[" + j + "]"]));
      if (!Array.isArray(o)) for (const k of Object.keys(o)) { try { kinder.push([o[k], p + "." + k]); } catch {} }
      for (const [v, pp] of kinder) {
        if (!v || typeof v !== "object" || gesehen.has(v)) continue;
        gesehen.add(v);
        const buf = ArrayBuffer.isView(v) ? v : v instanceof ArrayBuffer ? new Uint8Array(v) : null;
        if (buf) {
          if (buf.buffer !== v && gesehen.has(buf.buffer)) continue;
          gesehen.add(buf.buffer);
          const g = pp.split(/(?=[.[])/).slice(0, tiefe).map((s) => (s[0] === "[" ? "[]" : s)).join("");
          const h = H(); typed(h, buf); bytes += buf.byteLength;
          (aus[g] ||= {})[pp.replace(UUID, "uuid")] = hex(h);
        } else if (v !== globalThis && !(typeof Node !== "undefined" && v instanceof Node) && !(v instanceof Window)) q.push([v, pp]);
      }
    }
    return { aus, bytes };
  };

  // B · DIE PLATTE: jeder Eintrag der IDB anazhFoundryAssets/assets; Name = Schlüssel ohne die SHA der Kerne, Inhalt = Wert-Hash
  window.__fpPlatte = () => new Promise((fertig) => {
    const q = indexedDB.open("anazhFoundryAssets", 1);
    q.onupgradeneeded = () => q.result.createObjectStore("assets");
    q.onerror = () => fertig({ fehler: String(q.error) });
    q.onsuccess = () => {
      const db = q.result;
      try {
        const s = db.transaction("assets", "readonly").objectStore("assets");
        const ks = s.getAllKeys(), vs = s.getAll();
        vs.onsuccess = () => {
          const aus = {}, voll = {};
          ks.result.forEach((k, i) => { const n = String(k).replace(/[0-9a-f]{16}/g, "#"); aus[n] = W(vs.result[i], 10); voll[n] = String(k); });
          db.close(); fertig({ aus, voll });
        };
        vs.onerror = () => fertig({ fehler: String(vs.error) });
      } catch (e) { fertig({ fehler: String(e) }); }
    };
  });

  // C · DIE STOFFE: jeder Stoff der Szene (einmal je uuid), Name = Stoff-Name|Typ @ Name des ersten Trägers; Inhalt = Werte + Knoten-Schlüssel
  window.__fpStoffe = () => {
    const aus = {}, je = new Map();
    st.scene.traverse((o) => {
      for (const m of [o.material].flat()) {
        if (!m || je.has(m.uuid)) continue;
        je.set(m.uuid, 1);
        const n = (m.name || m.type) + "@" + (o.name || o.userData?.archInstanceKey || o.type);
        let k = ""; try { k = typeof m.customProgramCacheKey === "function" ? m.customProgramCacheKey() : ""; } catch {}
        let key = n.replace(UUID, "uuid"), i = 1; const n2 = key; while (aus[key]) key = n2 + "#" + i++;
        const pj = { programm: W(k, 1) };
        for (const p of Object.keys(m).sort()) { if (/^(uuid|id|version|_listeners|userData)$/.test(p)) continue; let v; try { v = m[p]; } catch { continue; } pj[p] = W(v, 3); }
        aus[key] = pj;
      }
    });
    return aus;
  };

  // D · DER PLAN: Zellen der Siedlungen, Pläne der lebenden Siedlungen, die Bau-Liste (Art, Lage, Drehung)
  window.__fpPlan = () => {
    const aus = {};
    const cells = st.worldMeta?.settlementCells || {};
    for (const k of Object.keys(cells)) aus["zelle:" + k] = W(cells[k], 6);
    for (const [k, S] of r._bewohnerSiedlungen || []) aus["plan:" + k] = W(S.plan, 7);
    for (const e of st.architectures || []) {
      const n = "bau:" + (e.type || "?") + ":" + (e.position ? [e.position.x, e.position.z].map((x) => Math.round(x * 100) / 100).join(",") : e.id);
      aus[n] = W({ t: e.type, p: e.position, r: e.rotation, s: e.scale, params: e.params, ud: e.userData && e.userData.archInstanceKey }, 5);
    }
    return aus;
  };

  // E · DER BESTAND nach den festen Takten: Tiere und Bewohner (Art, Lage auf 1 cm, Gier)
  window.__fpBestand = () => {
    const aus = {};
    const art = {};
    (st.creatures || []).forEach((c) => {
      const p = c.mesh?.position || c.position || c.group?.position;
      const a = c.species || c.userData?.species || c.userData?.art || c.art || c.kind || c.name || "?";
      (art[a] ||= []).push(W({ p: p && [p.x, p.z].map((x) => Math.round(x * 10) / 10), z: c.state || c.zustand || c.mode || c.userData?.state }, 3));
    });
    for (const [a, l] of Object.entries(art)) aus["tier:" + a] = W(l.sort(), 2) + "/" + l.length;
    for (const [k, S] of r._bewohnerSiedlungen || []) {
      const L = S.bewohner || S.leute || S.npcs || [];
      (Array.isArray(L) ? L : [...L.values?.() || []]).forEach((b, i) => {
        const p = b.pos || b.position || b.mesh?.position || b.leib?.position;
        aus["bewohner:" + k + ":" + (b.id ?? i)] = W({ p: p && [p.x, p.y ?? 0, p.z].map((x) => Math.round(x * 100) / 100), z: b.ziel?.art || b.zustand || b.state }, 3);
      });
      if (S.verkehr) aus["verkehr:" + k] = W(S.verkehr, 4);
    }
    return aus;
  };

  // F · DAS LICHT an fünf Stunden: jedes Licht der Szene (Farbe, Stärke, Richtung) + Belichtung
  window.__fpLicht = () => {
    const aus = {}, t0 = st.timeOfDay;
    for (const h of [6, 9, 12, 17, 21]) {
      st.timeOfDay = h / 24;
      try { r._applyDayNightToScene(); } catch (e) { aus["fehler:" + h] = String(e.message); continue; }
      const L = [];
      st.scene.traverse((o) => { if (o.isLight) L.push([o.type, o.name, o.color?.getHex(), Math.round(o.intensity * 1e5) / 1e5, o.position && [o.position.x, o.position.y, o.position.z].map((x) => Math.round(x * 1e3) / 1e3)]); });
      L.sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
      aus["licht:" + h + "h"] = W(L, 4);
      aus["belichtung:" + h + "h"] = W([st.renderer?.toneMappingExposure, st.exposure, st._belichtung, st.scene.background?.getHex?.(), st.scene.fog && [st.scene.fog.color?.getHex(), st.scene.fog.density, st.scene.fog.near, st.scene.fog.far]], 3);
    }
    st.timeOfDay = t0; try { r._applyDayNightToScene(); } catch {}
    return aus;
  };

  // G · DAS GESETZ DES BODENS: die Makro-Höhe auf 33×33 Punkten im Ring 256 m um den Ort (reine Funktion) + die gebaute Fläche
  window.__fpBoden = (x0, z0) => {
    const a = [], b = [];
    for (let i = -16; i <= 16; i++) for (let j = -16; j <= 16; j++) { const x = x0 + i * 16, z = z0 + j * 16; a.push(r._terrainMacroSurfaceY ? r._terrainMacroSurfaceY(x, z, true) : NaN); b.push(r._voxelSurfaceY(x, z)); }
    return { "gesetz:hoehe": W(a, 2), "gebaut:flaeche": W(b, 2) };
  };
})();
`;

async function main() {
    const t0 = Date.now();
    const server = WB.statikServer({ root: BAUM });
    const { browser, page } = await WB.nullWelt(server, { frist: 600000, da: "() => true" }, 600000);
    const tBoot = Date.now() - t0;
    await page.evaluate(SEITE);
    const erg = { baum: BAUM, kopf: require("child_process").execSync("git rev-parse HEAD", { cwd: BAUM }).toString().trim(), orte: {}, zeiten: { boot_s: tBoot / 1000 } };
    for (const ort of ORTE) {
        const m = messort(ort);
        const t1 = Date.now();
        const steh = await page.evaluate(
            async (x, z, dorf, TAKTE) => {
                // DIE FESTE UHR: der Takt bekommt t in festen 1/60 s, unabhängig von der Wanduhr
                window.__fpT ??= performance.now();
                const takt = () => {
                    st._frameOverBudget = false;
                    if (st._activeRingRadius < ziel) st._activeRingRadius = ziel;
                    try { r._gameLoopTick((window.__fpT += 1000 / 60)); } catch (e) { r._loopErrorBoundary(e); }
                    return sleep(0);
                };
                window.__anazhAutoSettlement = !!dorf;
                st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                st.yaw = 0; st.pitch = 0; st.timeOfDay = 0.5;
                st.perfTargetMs = 1000;
                const ziel = Math.min(12, st.chunkRingRadius || 4);
                let n = await __gebautNach("fp: Ring " + ziel, { fertig: () => r._builtRingRadius() >= ziel, takt, max: 1800 });
                n += await __weltStehtNach(takt, 1800);
                // DIE FESTEN TAKTE des Lebens bei fester Uhr (Mittag)
                for (let i = 0; i < TAKTE; i++) { st.timeOfDay = 0.5; await takt(); }
                return { takte: n, ring: r._builtRingRadius(), tiere: (st.creatures || []).length, siedlungen: (r._bewohnerSiedlungen || new Map()).size, bauten: (st.architectures || []).length };
            },
            m.x, m.z, m.dorfZug, TAKTE
        );
        const t2 = Date.now();
        const fp = await page.evaluate(async (x, z) => {
            const z0 = performance.now(), d = {};
            const halter = __fpHalter(3);
            d.halter = halter.aus; d.halterBytes = halter.bytes; d.ms_halter = performance.now() - z0;
            const z1 = performance.now(); d.platte = await __fpPlatte(); d.ms_platte = performance.now() - z1;
            const z2 = performance.now(); d.stoffe = __fpStoffe(); d.saetze = __fpSaetze(); d.instanzen = __fpInstanzen(); d.plan = __fpPlan(); d.bestand = __fpBestand(); d.licht = __fpLicht(); d.boden = __fpBoden(x, z); d.ms_rest = performance.now() - z2;
            return d;
        }, m.x, m.z);
        erg.orte[ort] = Object.assign({ stand: steh, s_stehen: (t2 - t1) / 1000, s_abdruck: (Date.now() - t2) / 1000 }, fp);
        console.log(ort, JSON.stringify(steh), "stehen", (t2 - t1) / 1000, "s · abdruck", (Date.now() - t2) / 1000, "s · halter MB", (fp.halterBytes / 1048576).toFixed(1));
    }
    erg.zeiten.gesamt_s = (Date.now() - t0) / 1000;
    erg.zeiten.cpu_s = process.cpuUsage().user / 1e6;
    fs.writeFileSync(AUS, JSON.stringify(erg));
    console.log("gesamt", erg.zeiten.gesamt_s, "s →", AUS);
    await browser.close();
    server.close();
}
main().catch((e) => {
    console.error("FP BRACH:", e && e.stack ? e.stack.split("\n").slice(0, 6).join("\n") : e);
    process.exit(1);
});
