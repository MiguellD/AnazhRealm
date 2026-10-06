#!/usr/bin/env node
"use strict";
// diag-analog-e-metrology.cjs — ANALOG-E Metrologie-Linse (fail-closed).
// Quell-Vertrag (Flugschreiber + Chat-Zeile) + optional Function-Extrakt-Smoke
// (kein Browser / keine Desktop-Sonde).
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const DEFAULT_PERF = path.join(root, "anazhRealmPerf.json");
const SRC = path.join(root, "anazhRealm.js");
const errs = [];
function check(name, ok, detail) {
  console.log("  " + (ok ? "OK" : "FAIL") + " " + name + (detail ? " — " + detail : ""));
  if (!ok) errs.push(name);
}
function note(msg) { console.log("  · " + msg); }

function ladeTrace(pfad) {
  if (!fs.existsSync(pfad)) return { err: "fehlt: " + pfad };
  let raw, j;
  try { raw = fs.readFileSync(pfad, "utf8"); } catch (e) { return { err: "nicht lesbar: " + e.message }; }
  try { j = JSON.parse(raw); } catch (e) { return { err: "JSON kaputt: " + e.message }; }
  if (!j || typeof j !== "object") return { err: "kein Objekt" };
  if (j.kind && j.kind !== "anazh-flight-recorder") return { err: "unerwartetes kind=" + j.kind };
  return { trace: j };
}
function pruefeWeltMarch(wm, label) {
  const maengel = [];
  if (!wm || typeof wm !== "object") { maengel.push(label + ": weltMarch fehlt (null)"); return maengel; }
  ["belegt", "gesetzBloecke"].forEach(function (k) {
    if (typeof wm[k] !== "number") maengel.push(label + "." + k + " nicht numerisch");
  });
  return maengel;
}
function extrahiereDcTris(trace) {
  const ss = (trace && trace.steadyState) || {};
  const worst = Array.isArray(trace.worstFrames) ? trace.worstFrames : [];
  const liveWorst = worst.filter(function (w) {
    return w && (typeof w.drawCalls === "number" || typeof w.triangles === "number");
  });
  const pick = liveWorst.find(function (w) {
    return (w.drawCalls || 0) > 0 || (w.triangles || 0) > 0;
  }) || liveWorst[0] || null;
  return {
    steady: {
      drawCalls: typeof ss.drawCalls === "number" ? ss.drawCalls : null,
      triangles: typeof ss.triangles === "number" ? ss.triangles : null
    },
    worstPick: pick ? { drawCalls: pick.drawCalls, triangles: pick.triangles, frameMs: pick.frameMs } : null,
    worstN: worst.length
  };
}
function schneide(quelle, marker) {
  const i = quelle.indexOf(marker);
  if (i < 0) return null;
  const start = quelle.indexOf("{", i);
  if (start < 0) return null;
  let tiefe = 0;
  for (let j = start; j < quelle.length; j++) {
    const c = quelle[j];
    if (c === "{") tiefe++;
    else if (c === "}") {
      tiefe--;
      if (tiefe === 0) return quelle.slice(i, j + 1);
    }
  }
  return null;
}
function codeVertrag(src) {
  function hit(re) { return re.test(src); }
  return {
    exportBelegt: hit(/belegt:\s*this\.state\.weltMarch\.belegt/),
    // V18.528: die Voxel-Bricks sind verabschiedet — der Export trägt keinen brickCache mehr (Absenz-Wand)
    exportOhneBricks: !hit(/brickCache/) && !hit(/freiGross|freiKlein/),
    exportGesetz: hit(/gesetzBloecke:\s*this\.state\.weltMarch\.gesetzBloecke/),
    exportKapselCache: hit(/kapseln:\s*this\.state\.weltMarch\.kapselCache/) || hit(/kapseln:\s*[^\n]*kapselCache/),
    kapselCacheExists: hit(/kapselCache:\s*new Map\(/),
    exportDcTris: hit(/drawCalls:\s*Math\.round\(s\.renderCalls/) && hit(/triangles:\s*Math\.round\(s\.renderTris/),
    metrologieHelper: src.includes("_analogEMetrologieZeile"),
    metrologieChat: hit(/vc === "metrologie"/) && hit(/vc === "analog e"/) && hit(/vc === "zahlen"/),
    metrologieMentionsKapseln: hit(/_analogEMetrologieZeile[\s\S]{0,1200}?kapseln/),
    stempelLog: src.includes("_analogEMetrologieStempelLog"),
    stempelExport: hit(/eMetrologieStamps:\s*\(this\._eMetrologieStamps/)
  };
}
function selbstTest() {
  const fake = { steadyState: { drawCalls: 1, triangles: 2 } };
  return pruefeWeltMarch(fake.steadyState.weltMarch, "fake.steadyState").length > 0;
}
function smokeMetrologieZeile(src) {
  const marker = "_analogEMetrologieZeile() {";
  const block = schneide(src, marker);
  if (!block) return { ok: false, detail: "Methode nicht extrahierbar" };
  const body = block.slice(block.indexOf("{"));
  let fn;
  try {
    global.AnazhRealm = { VERSION: "18.491.79-smoke" };
    fn = new Function("return function() " + body + ";")();
  } catch (e) {
    return { ok: false, detail: "Function(): " + (e && e.message) };
  }
  const fakeThis = {
    state: {
      weltMarch: {
        belegt: 84,
        kapselCache: { size: 36 },
        gesetzBloecke: 0,
        gesetzPlaetze: 0
      },
      renderer: { info: { render: { drawCalls: 43, triangles: 258821 } } },
      playerMesh: { position: { x: 48, y: 52, z: 0 } },
      perfSense: null
    }
  };
  let zeile;
  try {
    zeile = fn.call(fakeThis);
  } catch (e) {
    return { ok: false, detail: "Aufruf: " + (e && e.message) };
  }
  const okHead = typeof zeile === "string" && /^E OK /.test(zeile);
  const okKapseln = typeof zeile === "string" && /kapseln=36/.test(zeile);
  const okTris = typeof zeile === "string" && /tris=258821/.test(zeile);
  const okVer = typeof zeile === "string" && /V18\.491\.79-smoke/.test(zeile);
  if (!okHead || !okKapseln || !okTris || !okVer) {
    return { ok: false, detail: "Zeile=" + JSON.stringify(zeile) };
  }
  // fail-closed: fehlende kapseln → E ROT
  const rotThis = {
    state: {
      weltMarch: { belegt: 1, gesetzBloecke: 0, gesetzPlaetze: 0 },
      renderer: { info: { render: { drawCalls: 1, triangles: 2 } } },
      playerMesh: { position: { x: 0, y: 0, z: 0 } }
    }
  };
  let rotZeile;
  try {
    rotZeile = fn.call(rotThis);
  } catch (e) {
    return { ok: false, detail: "ROT-Aufruf: " + (e && e.message) };
  }
  if (typeof rotZeile !== "string" || !/^E ROT /.test(rotZeile) || !/kapseln=\?/.test(rotZeile)) {
    return { ok: false, detail: "fail-closed erwartet E ROT kapseln=?, got " + JSON.stringify(rotZeile) };
  }
  return { ok: true, detail: zeile, rot: rotZeile };
}
function main() {
  const perfPfad = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PERF;
  console.log("ANALOG-E Metrologie — fail-closed Linse");
  console.log("  Perf-Quelle: " + perfPfad);
  let src = null;
  try { src = fs.readFileSync(SRC, "utf8"); } catch (e) { check("anazhRealm.js lesbar", false, e.message); }

  console.log("\n[A] Code-Vertrag (_flightRecorderBuildTrace + Chat-Metrologie)");
  let vertrag = null;
  if (src) {
    vertrag = codeVertrag(src);
    check("Export trägt belegt", vertrag.exportBelegt);
    check("Export trägt KEINE Voxel-Bricks mehr (brickCache/freiGross/freiKlein abwesend, V18.528)", vertrag.exportOhneBricks);
    check("Export trägt gesetzBloecke", vertrag.exportGesetz);
    check("Export trägt dc/tris (steady)", vertrag.exportDcTris);
    check("kapselCache existiert im State", vertrag.kapselCacheExists);
    check("Flugschreiber exportiert kapseln (Kapsel-Dedup)", vertrag.exportKapselCache);
    check("_analogEMetrologieZeile existiert", vertrag.metrologieHelper);
    check("Chat-Hooks metrologie|analog e|zahlen", vertrag.metrologieChat);
    check("Metrologie-Zeile nennt kapseln", vertrag.metrologieMentionsKapseln);
    check("_analogEMetrologieStempelLog existiert", vertrag.stempelLog);
    check("Flugschreiber exportiert eMetrologieStamps", vertrag.stempelExport);
  }

  console.log("\n[B] Flugschreiber-JSON");
  const geladen = ladeTrace(perfPfad);
  if (geladen.err) {
    check("Perf-JSON ladbar", false, geladen.err);
    note("Live-Pfad: Perf-Panel Export → anazhRealmPerf.json");
  } else {
    const t = geladen.trace;
    check("kind=anazh-flight-recorder", !t.kind || t.kind === "anazh-flight-recorder", t.kind || "(kein kind)");
    note("version=" + (t.version || "?") + " savedAt=" + (t.savedAt || "?"));
    const wm = t.steadyState && t.steadyState.weltMarch;
    const wmMaengel = pruefeWeltMarch(wm, "steadyState");
    check("steadyState.weltMarch numerisch", wmMaengel.length === 0, wmMaengel.join("; ") || undefined);
    if (wm && typeof wm === "object") {
      console.log("  weltMarch Snapshot:");
      console.log("    belegt=" + wm.belegt + "  gesetzBloecke=" + wm.gesetzBloecke +
        (wm.gesetzPlaetze != null ? "  gesetzPlaetze=" + wm.gesetzPlaetze : "") +
        (wm.stellvertreter != null ? "  stellvertreter=" + wm.stellvertreter : ""));
      if (wm.felderFrei != null) note("frei: felder=" + wm.felderFrei);
      if (typeof wm.kapseln === "number") {
        note("kapseln=" + wm.kapseln + " (Dedup-Sätze)");
        check("steadyState.weltMarch.kapseln numerisch", true, String(wm.kapseln));
      } else {
        check("steadyState.weltMarch.kapseln numerisch", false, "fehlt im Export — Code trägt Feld ab ≥18.491.54; neu exportieren");
      }
    }
    const dc = extrahiereDcTris(t);
    console.log("  Tris / Draw-Calls:");
    note("steady: dc=" + dc.steady.drawCalls + " tris=" + dc.steady.triangles +
      (dc.steady.drawCalls === 0 && dc.steady.triangles === 0 ? " (oft 0 bei Idle-Export — worstFrames nutzen)" : ""));
    if (dc.worstPick) {
      note("worstPick: dc=" + dc.worstPick.drawCalls + " tris=" + dc.worstPick.triangles +
        (dc.worstPick.frameMs != null ? " @ " + dc.worstPick.frameMs + "ms" : "") + " (n=" + dc.worstN + ")");
      check("mindestens ein Frame mit dc|tris", typeof dc.worstPick.drawCalls === "number" || typeof dc.worstPick.triangles === "number");
    } else {
      check("worstFrames mit dc/tris", false, "keine worstFrames — Live-Sonde nötig");
    }
    // V18.491.90 — optionale Chat-Stempel im Trace (fail-soft wenn absent)
    const stamps =
      (t.steadyState && Array.isArray(t.steadyState.eMetrologieStamps) && t.steadyState.eMetrologieStamps) ||
      (Array.isArray(t.eMetrologieStamps) && t.eMetrologieStamps) ||
      null;
    if (stamps && stamps.length) {
      const last = stamps[stamps.length - 1];
      note(
        "eMetrologieStamps n=" +
          stamps.length +
          " last=" +
          (last && last.zeile != null
            ? String(last.zeile)
            : JSON.stringify(last)) +
          (last && last.ver ? " ver=" + last.ver : "") +
          (last && last.t ? " t=" + last.t : "")
      );
    } else {
      note("eMetrologieStamps absent (fail-soft — Chat metrologie noch nicht gelaufen / alter Trace)");
    }
  }

  console.log("\n[C] Function-Extrakt Smoke (_analogEMetrologieZeile, kein Browser)");
  if (src) {
    const smoke = smokeMetrologieZeile(src);
    check("Fake weltMarch+renderer → E OK inkl. kapseln", smoke.ok, smoke.detail);
    if (smoke.ok && smoke.rot) note("fail-closed ROT: " + smoke.rot);
  } else {
    check("Fake weltMarch+renderer → E OK inkl. kapseln", false, "keine Quelle");
  }

  console.log("\n[D] Live-Browser (nicht von dieser Linse gemessen)");
  note("Chat: metrologie | analog e | zahlen → _analogEMetrologieZeile + Stempel-Ring");
  note("Oder: Perf-Panel Export → anazhRealmPerf.json (trägt kapseln + eMetrologieStamps).");
  note("Bild-Stempel je Klasse A–D: menschliche Sonde / Feel — nicht headless.");

  console.log("\n[E] Selbst-Test");
  check("Fake ohne weltMarch wird erkannt", selbstTest());
  console.log("");
  if (errs.length) { console.log("ROT — " + errs.length + " Mangel: " + errs.join(" · ")); process.exit(1); }
  console.log("GRÜN — Metrologie-Kanal (Flugschreiber kapseln + Stempel-Ring + Chat-Zeile + Extrakt-Smoke).");
  process.exit(0);
}
main();
