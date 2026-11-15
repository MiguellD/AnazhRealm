"use strict";
// scripts/lib/band-proben.cjs — DIE PROBEN DES BANDS (`werkbank band`, `werkbank ratsche`, w28-werkbank-teilt): die Messung des Profi-Bands am
// Messort (einschwingen, Proben, Speicher, GPU-Bank, Stempel-Pool, Fluss) und die Ratsche aus einer Serie — das Urteil, der Haushalt und die
// Ratsche leben in scripts/lib/band-urteil.cjs, die Specs in spec/profiband/. Der Weg `/band` des Steuer-Servers (`bandRoute`: die Seite
// der Werkbank, ihre Stempel-Wache, ihr Speicher-Stand, ihr Ort) und die Gänge der Befehle über ihre Rufe (`bandGang`, `ratscheGang`).
const { path, jsonLesen, jsonSchreiben } = require("./welt-boot.cjs");
const BAND = require("./band-urteil.cjs");
const ZL = require("./zerlege-linse.cjs");

// DAS EINSCHWINGEN DER BAND-MESSUNG (Seiten-Kontext): der Spiel-Takt läuft mit der Bühne (Mittag · Sonne · Sommer),
// bis der Bau ruht — die Foundry-Schlange leer und kein Auftrag im Flug, kein Karten-Bake offen, kein Streu-Nachschub,
// keine aufgeschobene Streu-Region, kein Chunk im Bau, kein Dorf-Export unterwegs und keine wachsende Siedlung (der
// Messort dorf läuft mit dem Dorf-Zug; die EINE Liste `einschwingOffen`, band-urteil), und die Zahl der Chunks, der
// lebenden Instanzen und der
// ungebauten Bauten in der Mesh-Zone steht
// still — `ruhig` Takte am Stück. Ein Bau, der in Ruhe ungebaut bleibt (Bake-Lücke), steht im Ergebnis. Deckel `capMs`:
// dann `eingeschwungen: false`, und die Ratsche verweigert den Nachzug.
function bandEinschwingen(k) {
    return (async () => {
        const st = r.state;
        const RUHIG = k.ruhig || 30;
        // DIE VOLLE WELT: der Regler maß hier Takte mit 50 ms Pause (65 ms je Frame) und drosselte auf loadScale 0 —
        // je nach Vorgeschichte stand die Messung auf einer anderen Welt (Streu-Stufen, Laub-Radius). Die Decke geht hoch
        // (`perfTargetMs` 1000, wie `lauf --regler voll`), der PID wächst auf 1: das Band misst die volle Welt. Die
        // Werkbank setzt die Decke nach den Proben zurück.
        if (window.__bandDecke == null) window.__bandDecke = st.perfTargetMs;
        st.perfTargetMs = 1000;
        const t0 = performance.now();
        const dl = t0 + (k.capMs || 240000);
        let takte = 0,
            ruhig = 0,
            vor = null,
            o = {};
        const stand = () => {
            let instanzen = 0;
            if (st.archInstanceGroups)
                for (const g of st.archInstanceGroups.values()) instanzen += g.mesh ? g.mesh.count : 0;
            const ls = st.perfSense ? +st.perfSense.loadScale.toFixed(3) : 1;
            return { chunks: st.voxelChunks ? st.voxelChunks.size : 0, instanzen, ungebaut: __ungebaut(), loadScale: ls };
        };
        while (performance.now() < dl) {
            // DER TAKT UND SEIN BILD (`__werkTakt`, wie der Takt des Orts in `/umstellen` seit 4f098fa6): bis 31.10. schlief das
            // Band je Takt 50 ms — am Messort genesis (ferne.K2#2) trugen die 40 Takte des Einschwingens und 5 × 20 Takte zwischen
            // den Proben 7 s Schlaf, nie das Werk
            const bild = __werkTakt();
            takte++;
            // was die Welt noch baut — die EINE Liste (band-urteil `einschwingOffen`, mit der Dorf-Wache des Messorts dorf)
            o = __einschwingOffen(r);
            const s = stand();
            if (s.loadScale < 1) o.loadScale = s.loadScale;
            if (vor) for (const key of Object.keys(s)) if (s[key] !== vor[key]) o[key] = `${vor[key]}→${s[key]}`;
            vor = s;
            ruhig = Object.keys(o).length ? 0 : ruhig + 1;
            if (takte >= 40 && ruhig >= RUHIG) break;
            await bild;
        }
        return {
            eingeschwungen: ruhig >= RUHIG,
            takte,
            ms: Math.round(performance.now() - t0),
            stand: vor,
            offen: Object.keys(o).length ? o : null,
        };
    })();
}

// DIE PROBEN DER BAND-MESSUNG (Seiten-Kontext): `n` Zähl-Frames, zwischen zweien `zwischen` Spiel-Takte mit der Bühne
// (die Tiere wandern, der Takt rechnet weiter) — die Werkbank nimmt je Klasse × Pass das Maximum (`zensusMax`).
function bandProben(k) {
    return (async () => {
        const proben = [];
        for (let i = 0; i < (k.n || 6); i++) {
            if (i) for (let t = 0; t < (k.zwischen || 20); t++) await __werkTakt(); // ein Bild je Takt, wie das Einschwingen
            __buehne();
            try {
                if (r.state.fernRing) r._tickFeldPass(r.state.fernRing);
            } catch {}
            proben.push(await __drawZensus({ alle: true }));
        }
        return proben;
    })();
}

// DIE BAND-LINSE (der Weg `/band`): ein Zähl-Frame (alle Klassen) + der VRAM je Erzeuger + die Szenen-Puffer je Klasse + die GPU-Bank
// (nur mit GPU-Device) + der Fluss — geurteilt gegen Haushalt und Ratsche (spec/profiband) → die Antwort des Wegs
async function bandRoute(W, b) {
    const { page, geraetInfo, stempel, pufferStand, bootZeile, zeitAblage, ordnerFuer, ECHT } = W;
    // DIE BAND-MESSUNG: einschwingen (bis der Bau ruht), Proben (das Maximum je Klasse × Pass), dann der
    // VRAM je Erzeuger, die Szenen-Puffer je Klasse, der Fluss und die GPU-Bank — geurteilt gegen Haushalt
    // und Ratsche (spec/profiband).
    // Ein Toggle-Ort (bank) trägt keine Ratsche: das Band bricht VOR dem Messen laut.
    BAND.ratscheVon(BAND.ladeSpec(b.ort));
    // DAS GERÄT und DIE SICHT: sie wählen die Ratsche — der Adapter-Text gegen die Muster des Haushalts, der
    // Kamera-Modus des Stamms; ohne Schlüssel richtet keine Ratsche (das Urteil nennt es `ungemessen`).
    const hh = BAND.ladeSpec(b.ort).haushalt;
    const geraetText = await geraetInfo();
    const kamera = await page.evaluate(() => st.cameraMode);
    const geraet = { schluessel: BAND.geraetSchluessel(hh, geraetText), text: geraetText };
    const sicht = BAND.sichtSchluessel(hh, kamera);
    const bandSpec =
        geraet.schluessel && sicht
            ? BAND.ladeSpec(b.ort, { geraet: geraet.schluessel, sicht })
            : BAND.ladeSpec(b.ort);
    // DIE STEMPEL-WACHE je Phase: welche Frames den Pool füllen, ohne ihn aufzulösen, steht beim Namen.
    const w0 = await stempel();
    const messung = await page.evaluate(bandEinschwingen, {
        capMs: Number(b.capMs) || 240000,
        ruhig: Number(b.ruhig) || 30,
    });
    const w1 = await stempel();
    const proben = await page.evaluate(bandProben, { n: Number(b.proben) || 6, zwischen: 20 });
    const w2 = await stempel();
    // DER SPEICHER NACH DEM COLLECTOR (`pufferStand`): gemessen wird das Lebende, nicht die Laune des GC.
    const roh = Object.assign(await pufferStand(false, 1e5), await page.evaluate(() => {
        // Die Regler-Decke zurück (bandEinschwingen hob sie für die volle Welt).
        if (window.__bandDecke != null) st.perfTargetMs = window.__bandDecke;
        window.__bandDecke = null;
        const pm = st.playerMesh.position;
        return { spieler: [pm.x, pm.z].map((x) => +x.toFixed(1)), fluss: window.__flussBericht ? __flussBericht() : null };
    }));
    const gpu = await page.evaluate(ZL.gpuBank, { n: 12, runden: 3 });
    const w3 = await stempel();
    const ue = (a, c) =>
        a && c && Number.isFinite(c.ueberlauf) ? c.ueberlauf - (a.ueberlauf || 0) : null;
    const stempelBand = w3
        ? {
              einschwingen: ue(w0, w1),
              proben: ue(w1, w2),
              bank: ue(w2, w3),
              seitBoot: w3.ueberlauf,
              warnung: w3.warnung,
              spitze: w3.spitze,
              pool: w3.pool,
              taeter: w3.taeter,
              urteil: w3.ueberlauf === 0 && w3.warnung === 0 ? "GRUEN" : "ROT",
          }
        : null;
    const { haushalt, ort } = bandSpec;
    const ratsche = BAND.ratscheVon(bandSpec);
    const zensus = BAND.zensusMax(proben);
    const u = BAND.bandUrteil({
        zensus,
        vram: roh.vram,
        texturen: roh.texturen,
        gpu: gpu && !gpu.fehler ? gpu : null,
        haushalt,
        ratsche,
        ort,
        ratscheDatei:
            bandSpec.ratscheDatei ||
            `(Gerät ${geraet.schluessel || "? — " + (geraetText || "kein Adapter")} × Sicht ${sicht || "? — " + kamera})`,
    });
    // Der Foundry-Kanal dieser Ladung über alle Antwort-Arten (asset · impostor · book …): Platte gegen
    // Neubau — im Zweit-Boot der Serie die Neubau-Zahl, die der Spieler beim zweiten Start bezahlt.
    let fl = null;
    for (const k of Object.values(roh.fluss?.kanal || {})) {
        fl = fl || { n: 0, platte: 0, mb: 0, platteMb: 0, neuMb: 0 };
        for (const f of Object.keys(fl)) fl[f] += k[f] || 0;
    }
    if (fl) for (const f of ["mb", "platteMb", "neuMb"]) fl[f] = +fl[f].toFixed(1);
    const am = ort.ortPose ? W.aktStand : ort.spieler;
    const amMessort = !!am && Math.hypot(roh.spieler[0] - am[0], roh.spieler[1] - am[1]) <= 8;
    // DER GESTELLTE ORT (die Orts-Wache, `BAND.ortGestellt`): was beim Zählen wirklich stand — der Ort der
    // letzten Aufstellung, der Dorf-Zug, der Ort-Takt, die Gier —, nicht nur der Ort, den der Aufruf nennt.
    const zustand = Object.assign(
        { ort: W.aktOrt },
        await page.evaluate(() => ({
            dorfZug: window.__anazhAutoSettlement !== false,
            ortTakt: window.__ortTakt || [],
            gier: st.yaw,
        })),
        { sicht }
    );
    Object.assign(u, {
        kamera: proben.length ? proben[proben.length - 1].kamera : null,
        spieler: roh.spieler,
        amMessort,
        zustand,
        ortGestellt: BAND.ortGestellt(ort, zustand, W.aktSicht),
        geraet,
        sicht,
        version: await page.evaluate(() => r.constructor.VERSION),
        ratscheDatei: bandSpec.ratscheDatei,
        boot: bootZeile(),
        messung: Object.assign({ proben: proben.length }, messung),
        fluss: fl,
        gpu,
        stempel: stempelBand,
        puffer: roh.puffer,
        unbenannt: zensus.unbenannt,
        frameMs: proben.map((z) => z.frameMs),
        programme: proben.length ? proben[proben.length - 1].programme : null,
        // je Probe die Summe je Pass: die Streuung, aus der die Toleranz der Ratsche kommt
        proben: proben.map((z) => z.passe),
    });
    const datei = zeitAblage(b.datei, "band", "json");
    ordnerFuer(datei);
    // Das ROHE der Messung reist mit: `werkbank ratsche` urteilt eine Serie neu (gegen den Haushalt von
    // heute) und nimmt ihre Hülle — nie einen einzelnen Lauf.
    Object.assign(u, {
        echt: ECHT,
        roh: { zensus: zensus.klassen, vram: roh.vram, texturen: roh.texturen },
    });
    jsonSchreiben(datei, u);
    const sb = stempelBand;
    return ({
        urteil: u.urteil,
        linse: u.linse,
        stempel: sb,
        tabelle:
            BAND.bandTabelle(u) +
            (sb
                ? `\nSTEMPEL-POOL ${sb.urteil}: ${sb.seitBoot} verweigerte Abfragen seit Boot (Einschwingen ` +
                  `${sb.einschwingen} · Proben ${sb.proben} · Bank ${sb.bank}), Warnung ${sb.warnung}, Spitze ` +
                  `${sb.spitze}${sb.pool ? "/" + sb.pool.max : ""}` +
                  (sb.taeter && Object.keys(sb.taeter).length
                      ? " — Täter: " +
                        Object.entries(sb.taeter)
                            .sort((x, y) => y[1] - x[1])
                            .slice(0, 4)
                            .map(([k, n]) => `${k} ${n}`)
                            .join(" · ")
                      : "")
                : "\nSTEMPEL-POOL: kein Pool (kein timestamp-query)"),
        datei,
    });
}

// DER GANG DES BEFEHLS `werkbank band` → die Antwort, die die Werkbank ausgibt (mit Tabelle endet er selbst)
async function bandGang({ opt, rufe, endeMit }) {
    let o;
    o = await rufe("/band", {
        ort: opt("--ort"),
        datei: opt("--datei"),
        proben: opt("--proben"),
        capMs: opt("--cap") ? Number(opt("--cap")) * 1000 : undefined,
    });
    if (o?.tabelle) endeMit(o.tabelle + "\n\n" + (o.datei || ""), o.urteil === "GRUEN" && (!o.stempel || o.stempel.urteil === "GRUEN"));
    return o;
}

// DER GANG DES BEFEHLS `werkbank ratsche` (nur Node) — endet immer selbst
async function ratscheGang({ argv, opt, hat, endeMit }) {
    // DIE RATSCHE AUS EINER SERIE (nur Node): ≥ 4 eingeschwungene Band-Messungen aus Erst- UND Zweit-Boot an EINEM Ort ×
    // Gerät × Sicht und EINER Version; die Hülle zieht nur bei sauberer LINSE nach (setzt, senkt, hebt nie), `--neu`
    // ist der RE-MINT. Die Serie: jede .json der Befehlszeile (`--neu` ist ein Schalter ohne Wert).
    const dateien = argv
        .slice(1)
        .filter((x) => /\.json$/i.test(x))
        .map((f) => path.resolve(f));
    const laeufe = dateien.map((f) => {
        const j = jsonLesen(f);
        const e = Array.isArray(j.schritte) ? j.schritte.find((x) => x.name === "band") : null;
        return e ? e.ergebnis?.messung || null : j;
    });
    const neu = hat("neu");
    const nurVram = opt("--nur") === "vram";
    const fehler = [];
    if (laeufe.length < 4) fehler.push(`${laeufe.length} Läufe — die Serie braucht mindestens vier`);
    const eins = (name, werte) => {
        const w = [...new Set(werte)];
        if (w.length !== 1 || w[0] == null) fehler.push(`${name} ${w.join(" / ") || "?"} — die Serie steht an EINEM ${name}`);
        return w[0];
    };
    const ortId = eins("Ort", laeufe.map((u) => (u ? u.ort : null)));
    const geraet = eins("Gerät", laeufe.map((u) => (u?.geraet ? u.geraet.schluessel : null)));
    const sicht = eins("Sicht", laeufe.map((u) => (u ? u.sicht : null)));
    const version = eins("Version", laeufe.map((u) => (u ? u.version : null)));
    if (opt("--ort") && opt("--ort") !== ortId) fehler.push(`--ort ${opt("--ort")}, die Serie steht an ${ortId}`);
    if (fehler.length) endeMit("Ratsche NICHT nachgezogen:\n  " + fehler.join("\n  "));
    const ratscheSpec = BAND.ladeSpec(ortId, { geraet, sicht });
    const { haushalt, ort } = ratscheSpec;
    const alt = BAND.ratscheVon(ratscheSpec);
    if (!alt) endeMit(`Ratsche NICHT nachgezogen: ${ratscheSpec.ratscheDatei} fehlt — jeder Ort × Gerät × Sicht trägt seine Datei`);
    const ratsche = neu ? BAND.ratscheNeu(alt) : alt;
    const boots = new Set(laeufe.map((u) => u.boot && u.boot.art));
    if (!boots.has("erst") || !boots.has("zweit"))
        fehler.push(`Boot-Arten ${[...boots].join("/")} — Erst- UND Zweit-Boot`);
    laeufe.forEach((u, i) => {
        const n = path.basename(dateien[i]);
        if (!u.roh) fehler.push(`${n}: kein Rohes (eine Messung vor der Serien-Ratsche)`);
        if (u.echt !== true) fehler.push(`${n}: nicht die echte GPU (start --echt)`);
        if (u.amMessort !== true) fehler.push(`${n}: nicht am Messort ${ort.id} ${ort.ortPose ? "(Pose aus dem Plan)" : ort.spieler.join(" ")}`);
        // Die Orts-Wache: der Lauf stand im Zustand des Orts (Aufstellung, Dorf-Zug, Ort-Takt, Blick, Sicht).
        for (const f of BAND.ortGestellt(ort, u.zustand, sicht)) fehler.push(`${n}: ${f}`);
        if (!u.messung || u.messung.eingeschwungen !== true) fehler.push(`${n}: nicht eingeschwungen`);
    });
    if (fehler.length) endeMit("Ratsche NICHT nachgezogen:\n  " + fehler.join("\n  "));
    const h = BAND.bandHuelle(laeufe.map((u) => u.roh));
    const u = BAND.bandUrteil(Object.assign({ haushalt, ratsche: alt, ort, ratscheDatei: ratscheSpec.ratscheDatei }, h));
    Object.assign(u, { messung: null, boot: null });
    console.log(BAND.bandTabelle(u));
    // `--nur vram` zieht nur den Speicher nach: dann zählen nur die Speicher-Befunde der LINSE; der Re-Mint lässt die
    // Ratschen-Zeilen der alten Ratsche aus (er ersetzt sie), Haushalt, Namen und Lecks nie.
    const linse = (u.rot || []).filter((r) => ["unbenannt", "haushalt", "ratsche", "leck"].includes(r.art));
    const sperrt = nurVram ? BAND.vramBefunde(u) : neu ? linse.filter((r) => r.art !== "ratsche") : linse;
    if (sperrt.length) endeMit("\nRatsche NICHT nachgezogen: LINSE ROT — erst die Befunde heilen:\n  " + sperrt.map((r) => r.text).join("\n  "));
    const r = BAND.ratscheNachziehen(
        ratsche,
        u,
        {
            datum: new Date().toISOString(),
            version,
            ort: ort.id,
            geraet,
            geraetText: laeufe[0].geraet.text,
            sicht,
            eingeschwungen: true,
            neu: neu || undefined,
            laeufe: laeufe.length,
            boots: laeufe.map((x) => x.boot.art + "/" + x.boot.ladungen),
            dateien: dateien.map((d) => path.basename(d)),
        },
        opt("--nur")
    );
    // Was der Re-Mint HEBT, steht beim Namen (der Commit trägt es): jede Zeile über der alten Ratsche.
    const hebt = [];
    if (neu)
        for (const [id, rz] of Object.entries(r.ratsche.klassen))
            for (const [p, z] of Object.entries(rz))
                for (const g of ["befehle", "dreiecke"]) {
                    const a0 = ((alt.klassen[id] || {})[p] || {})[g];
                    if (z[g] != null && a0 != null && z[g] > a0) hebt.push(`${id}.${p}.${g} ${a0} → ${z[g]}`);
                }
    BAND.schreibeRatsche(ratscheSpec.ratscheDatei, r.ratsche);
    endeMit(
        `\nRatsche ${ratscheSpec.ratscheDatei} (Ort ${ort.id} × ${geraet} × ${sicht}, V${version}) ` +
            `${neu ? "NEU GEMINTET" : "nachgezogen"} (${r.aenderungen.length}): ${r.aenderungen.join(" · ") || "nichts fiel"}` +
            (neu ? `\nDer Re-Mint hebt ${hebt.length} Zeilen: ${hebt.join(" · ") || "keine"}` : ""),
        true
    );
}

module.exports = { bandRoute, bandGang, ratscheGang };
