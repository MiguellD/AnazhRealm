// Stationen der Gruppe II (src/g2.js). Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst: jedes Kriterium mit Punkten am Kopf (tiere.K1 · tiere.K3 · oekologie.K5 · mensch.K2 · mensch.K3), mensch.K4 (Zweig w3v-leib-menge), luftwasser.K1 (Zweig vogel-zensus), luftwasser.K2#1 (Zweig w3s-schwarm) und #2 (Zweig w3u-leittier), luftwasser.K5 (Zweig schwarm), mensch.K5#1, vegetation.K2#1 (Zweig boe-zeit), vegetation.K1 und K5 (Zweig w3w-wald) und jedes der
// Messschuld M30–M43 (M40 mensch.K1 · M41 vegetation.K4 · M42 tiere.K3); kein Stau-Zweig kippt ein Kriterium der Gruppe II.
// Was sich nicht als Station fassen lässt, steht in `fehlt` (befehl: null, grund beim Namen) — die Liste der Stationen
// bleibt dadurch lauffähig (pruefeStationen verlangt je Eintrag ein argv).
"use strict";
const PW = require("./proben-welt.cjs"); // die Proben der Welt in der Sitzung (tiere.K5#1)
const { jsonZeile } = require("../hilfe.cjs");
const { seiteProbe } = require("./seite.cjs");

// die Zeile „  ✅|❌ <probe> {…}" der Kreatur-Linse (diag-kreatur-takt.cjs, padEnd 9)
const probeZeile = (stdout, probe) => jsonZeile(stdout, new RegExp("^\\s*(✅|❌) " + probe + "\\s"));

// vegetation.K4 #1 + #2 (Zwillinge, EIN Lauf; Zweig proben-leib, stationen/seite.cjs): W9 von gate:haus-welt `--phasen=grund
// --bild` in der Welt der Sitzung — `proben`, die Seiten-Funktion der Linse, mit ihren Phasen grund · bild · start (das Start-Dorf
// erwacht im Takt der Welt, je Box des Körper-Satzes zwei Blicke aus dem Ausgabe-Pfad, je Haus Third, das Haus des Spielers über
// die Werkstatt, See und Fluss der Mess-Wiese je Ego und Third), die Bilder neben {AUS} (<AUS>-grund-<i>-<j>-<art>-<v>.png), das
// JSON nach {AUS} wie die Linse (HAUS_WELT_JSON). Bis 29.10. der eigene Boot der Linse (6–8 Soll-Minuten).
async function vegetationK4Seite(H) {
    const D = H.quelle("scripts/diag-haus-welt.cjs", ["proben"]);
    const WA = require(path.resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL;
    await H.ruf("/fenster", { w: 640, h: 360 });
    await H.frist();
    await H.seite("await window.__weltStehtNach(() => { try { r._gameLoopTick(performance.now()); } catch (e) {} });\n" + WA + "\nreturn 1;");
    H.schritt("welt");
    const o = await H.seite("return await (" + D.proben + ")([\"grund\", \"bild\", \"start\"]);");
    H.schritt("grund");
    const bild = (x, name) => {
        for (const [v, png] of [].concat(x.png || []).entries()) H.WB.pngDatei(H.aus + "-" + name + "-" + v + ".png", png);
        if (x.png) x.png = name;
    };
    const w = (o && o.w9) || {};
    (w.haeuser || []).forEach((h, i) => {
        if (h.png) bild(h, "grund-" + i + "-aussen");
        (h.koerper || []).forEach((b, j) => bild(b, "grund-" + i + "-" + j + "-" + b.art));
        if (h.third) bild(h.third, "grund-" + i + "-third");
    });
    for (const x of w.wasser || []) for (const z of x.blicke || []) bild(z, "wasser-" + x.ort + "-" + z.sicht);
    fs.writeFileSync(H.aus, JSON.stringify(o, null, 1));
    console.log("W9 " + (w.haeuser || []).length + " Häuser · Bild " + w.bild + " · Wasser " + (w.wasser || []).length + " · Werkstatt " + (o && o.werkstatt) + (o && o.fehler ? " · " + o.fehler : ""));
    return 0;
}
const VEGETATION_K4 = seiteProbe(33, vegetationK4Seite, {
    mutiert: true,
    
});

// R6 der Tier-Gesetze (Zweig tier-gesetz-k5): Kern, Kreatur-Stamm, Leben-Feld, Leib und die Kreatur-Linse
const KREATUR = [
    "tetrapoda-core.js",
    "stamm/kreatur-*.js",
    "stamm/feld-leben.js",
    "stamm/daten.js",
    "stamm/koerper-leib.js",
    "scripts/diag-kreatur-takt.cjs",
    "scripts/diag-kreatur-leben.cjs",
    "scripts/lib/kreatur-proben.cjs",
    "scripts/lib/welt-boot.cjs",
];

// der Schwarm (luftwasser.K5): das Gesetz, der Takt und sein Zeichner, die Bühne und der Draw-Zähler der Werkbank
const SCHWARM = [
    "tetrapoda-core.js",
    "stamm/kreatur-leben.js",
    "stamm/dirigent-takt.js",
    "stamm/stoff-instanz.js",
    "stamm/siedlung-satz.js",
    "scripts/werkbank.cjs",
    "scripts/lib/welt-boot.cjs",
    "scripts/lib/draw-zaehler.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/software-gpu.cjs",
];

// ───────── DIE HERDE AM HANG (tiere.K1 Staffel 2): drei Funktionen, ihr Text geht in den Befehl (und in den Abdruck) ─────────
// In der Seite der Werkbank (`werkbank eval`, r = Welt, T = THREE): o.phase "start" stellt die Bühne (Mittag, Sonne, Sommer), den
// Frieden und das Ego, nimmt jedes Tier der Welt und setzt den Wurf scheuer Hirsche (`_kreaturWurf`, wie die Probe herde) an
// den nächsten trockenen Hang 15–30° um den Spieler (das Gesetz über ±4 m; die Fall-Linie 50 m bergab bis 60 m bergauf trocken,
// kein Werk in 70 m); der Spieler geht 60 m über ihr bergab mit 1,4 m/s im Kreatur-Takt der Probe herde (Stoß-Schritt,
// Leib-Kontakte, `updateCreatures`), bis ein Glied flieht, und bleibt stehen; die Alarm-Kette läuft, bis jedes Glied flieht,
// dann eine halbe Sekunde. Der Standort des Blicks steht 43 m quer zur Fall-Linie auf ihrer tieferen Seite (der Hang zeigt die
// Herde im Profil; von oben sah das Ego aus 40 m nur ihr Heck, 4–15 px breit zwischen den Stämmen). "weiter" schreitet o.takte
// Takte. Zurück die Pose des Ego-Schusses (das Auge `EGO_AUGE_M` über dem Boden, der Blick auf das Mittel der Herde), die
// Mitte jedes Leibs (`punkte`, das Ziel der Blick-Wahl) und die Lage der Herde.
function herdeSzene(r, T, o) {
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
    // die Mitte eines Leibs (die Lage um die halbe Höhe seiner Box, wie `herdePulk`): die Punkte des Ziels der Blick-Wahl
    const leibMitte = (c) => {
        const b = new T.Box3().setFromObject(c);
        return [c.position.x, c.position.y + (b.isEmpty() ? 0.5 : Math.min(3, b.max.y - b.min.y) / 2), c.position.z].map((v) => +v.toFixed(2));
    };
    const pose = () => {
        const g = lebend();
        const m = mitte(g);
        const a = Z.auge || pm;
        const ey = H(a.x, a.z) + A.EGO_AUGE_M;
        return {
            kamera: [a.x, ey, a.z, m.x, m.y + 0.6, m.z].map((v) => +v.toFixed(2)),
            abstand: +Math.hypot(m.x - a.x, m.y + 0.6 - ey, m.z - a.z).toFixed(1),
            punkte: g.map(leibMitte),
            glieder: g.length,
            fliehen: g.filter(flieht).length,
            takte: Z.takte,
        };
    };
    if (o.phase !== "start") {
        for (let k = 0; k < o.takte; k++) takt();
        return pose();
    }
    s.renderer.setAnimationLoop(null);
    window.__buehne();
    r.setGameMode("frieden");
    r.setCameraMode("first");
    for (const c of s.creatures.slice()) r.removeCreature(c);
    const trocken = (x, z) => r._landAt(x, z) && !r._nassAt(x, z);
    let hang = null;
    for (let ring = 0; ring < 50 && !hang; ring++)
        for (let q = 0, n = Math.max(1, ring * 6); q < n && !hang; q++) {
            const a = (q / n) * 2 * Math.PI;
            const x = pm.x + Math.cos(a) * ring * 12;
            const z = pm.z + Math.sin(a) * ring * 12;
            if (!trocken(x, z)) continue;
            const gx = (H(x + 4, z) - H(x - 4, z)) / 8;
            const gz = (H(x, z + 4) - H(x, z - 4)) / 8;
            const t = Math.hypot(gx, gz);
            const grad = (Math.atan(t) * 180) / Math.PI;
            if (!(grad >= 15 && grad <= 30)) continue;
            const [ux, uz] = [gx / t, gz / t];
            let frei = true;
            for (let d = -50; d <= 60 && frei; d += 5) frei = trocken(x + ux * d, z + uz * d);
            if (frei && !(s.architectures || []).some((e) => e && e.position && Math.hypot(e.position.x - x, e.position.z - z) < 70))
                hang = { x, z, ux, uz, neigung: +grad.toFixed(1) };
        }
    if (!hang) return { fehler: "kein trockener Hang 15–30° in 600 m um den Spieler" };
    // der Wurf wie in der Probe herde: der Spieler 140 m fort, sein Blick von ihm weg (der Wurf wirft nur fern und außer Blick)
    pm.set(hang.x + 140, H(hang.x + 140, hang.z) + 0.5, hang.z);
    s.camera.position.set(pm.x, pm.y + 1.6, pm.z);
    s.camera.lookAt(pm.x + 1, pm.y + 1.6, pm.z);
    s.camera.updateMatrixWorld(true);
    r._loopFrustumCulling();
    Object.assign(s, { maxCreatures: 64, creatureAnimationTime: 100 });
    r._faunaStroeme = null;
    Z.glieder = r._kreaturWurf({ x: hang.x, z: hang.z }, "wesen", "happy", r._faunaRng("verband"), 7);
    // kein Tier der Welt wächst in das Bild nach
    s.maxCreatures = s.creatures.length;
    // DER SCHUSS HÄLT DIE HERDE (wie `__tiereHalten`): die Aufnahme wartet im Takt der Seite, bis die Welt steht — dort steht
    // jedes Tier an seiner Lage; der eigene Takt oben ruft den Kreatur-Takt am Prototyp vorbei
    r.updateCreatures = function (dt) {
        const fest = this.state.creatures.map((c) => [c, c.position.x, c.position.z]);
        const aus = A.prototype.updateCreatures.call(this, dt);
        for (const [c, x, z] of fest) [c.position.x, c.position.z] = [x, z];
        return aus;
    };
    // der Spieler 60 m ÜBER ihr, er geht bergab: die Herde flieht talwärts, der Blick fällt auf sie (von unten verdeckte der Hang sie)
    let d = 60;
    for (; Z.takte < 3600 && !Z.glieder.some(flieht); d -= 1.4 / 60) {
        [Z.sx, Z.sz] = [hang.x + hang.ux * d, hang.z + hang.uz * d];
        takt();
    }
    if (!Z.glieder.some(flieht)) return Object.assign(pose(), { fehler: "die Herde flieht nicht (der Spieler ging bis " + d.toFixed(0) + " m)" });
    // die Alarm-Kette läuft (≤ 1 s), dann eine halbe Sekunde Flucht: jedes Glied flieht im ersten Schuss
    for (let k = 0; k < 120 && lebend().some((c) => !flieht(c)); k++) takt();
    for (let k = 0; k < 30; k++) takt();
    // DER STANDORT des Blicks: 43 m quer zur Fall-Linie (der Flucht) auf der tieferen Seite, das Auge Ego — der Hang zeigt die
    // Herde im Profil; die Blick-Wahl dreht von dort, bis jedes Glied frei steht
    const m = mitte(lebend());
    const seiten = [1, -1].map((s) => ({ x: m.x - s * hang.uz * 43, z: m.z + s * hang.ux * 43 }));
    Z.auge = seiten.sort((a, b) => H(a.x, a.z) - H(b.x, b.z))[0];
    return Object.assign(pose(), { hang: { x: +hang.x.toFixed(1), z: +hang.z.toFixed(1), neigung: hang.neigung }, wurf: Z.glieder.length, fluchtBei: +d.toFixed(1) });
}
// DER PULK IM BILD (in der Seite, nach `bild --klasse ^tier`): die Teilung des Schusses (`__letzteTeilung`, werkbank) gegen die
// Glieder der Herde. Je Glied die Tier-Pixel im Kreis seines Leibs am Schirm (Mitte über der Lage um die halbe Höhe seiner Box,
// Radius `_kreaturRaum`) — sichtbar ab 20 Pixeln; die Flecken: alle Tier-Pixel in 4-px-Blöcken, verbunden über einen Leib (den
// Median-Durchmesser der Glieder), gezählt ab 20 Pixeln. EIN Pulk = jedes lebende Glied sichtbar und EIN Fleck.
function herdePulk(r, T, o) {
    const L = window.__letzteTeilung;
    const Z = window.__herdeHang;
    if (!L || !Z) return { fehler: "keine Teilung oder keine Herde in der Seite" };
    const { teil, W, H } = L;
    const cam = r.state.camera.clone();
    const [px, py, pz, lx, ly, lz] = o.kamera;
    cam.position.set(px, py, pz);
    cam.lookAt(lx, ly, lz);
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    const g = Z.glieder.filter((c) => r.state.creatures.includes(c));
    const kreise = g.map((c) => {
        const b = new T.Box3().setFromObject(c);
        const h = b.isEmpty() ? 1 : Math.min(3, b.max.y - b.min.y);
        const v = new T.Vector3(c.position.x, c.position.y + h / 2, c.position.z).project(cam);
        const d = cam.position.distanceTo(c.position);
        const rp = (Math.max(0.5, r._kreaturRaum(c)) / d / Math.tan((cam.fov * Math.PI) / 360)) * (H / 2);
        return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H, r: Math.max(2, rp), vorn: v.z < 1 };
    });
    const im = kreise.map((k) => {
        let n = 0;
        if (k.vorn)
            for (let y = Math.max(0, Math.floor(k.y - k.r)); y < Math.min(H, Math.ceil(k.y + k.r)); y++)
                for (let x = Math.max(0, Math.floor(k.x - k.r)); x < Math.min(W, Math.ceil(k.x + k.r)); x++)
                    if (teil[y * W + x] && (x - k.x) ** 2 + (y - k.y) ** 2 <= k.r * k.r) n++;
        return n;
    });
    const B = 4;
    const [bw, bh] = [Math.ceil(W / B), Math.ceil(H / B)];
    const voll = new Uint16Array(bw * bh);
    let pixel = 0;
    for (let p = 0; p < W * H; p++)
        if (teil[p]) {
            pixel++;
            voll[Math.floor(Math.floor(p / W) / B) * bw + Math.floor((p % W) / B)]++;
        }
    const rs = kreise.map((k) => k.r).sort((a, b) => a - b);
    const weit = Math.max(1, Math.ceil((2 * (rs[rs.length >> 1] || 2)) / B));
    const marke = new Int32Array(bw * bh).fill(-1);
    const flecken = [];
    for (let i = 0; i < bw * bh; i++) {
        if (!voll[i] || marke[i] >= 0) continue;
        const st = [i];
        let n = 0;
        marke[i] = flecken.length;
        while (st.length) {
            const j = st.pop();
            n += voll[j];
            for (let dy = -weit; dy <= weit; dy++)
                for (let dx = -weit; dx <= weit; dx++) {
                    const x = (j % bw) + dx;
                    const y = Math.floor(j / bw) + dy;
                    const k = y * bw + x;
                    if (x >= 0 && y >= 0 && x < bw && y < bh && voll[k] && marke[k] < 0) {
                        marke[k] = flecken.length;
                        st.push(k);
                    }
                }
        }
        flecken.push(n);
    }
    const gross = flecken.filter((n) => n >= 20);
    return {
        glieder: g.length,
        sichtbar: im.filter((n) => n >= 20).length,
        je: im,
        flecken: gross.length,
        kruemel: flecken.length - gross.length,
        pixel,
        leibPx: +(2 * (rs[rs.length >> 1] || 0)).toFixed(1),
    };
}
// Der Lauf (im Spiel-Baum, cwd): EINE Werkbank headless an der Weiche (die Karte; `[linse-gpu]` nennt sie), Port {PORT}+20000
// (die Seite eins darunter); darin (a)–(d) der Probe herde (`diag-kreatur-takt --werkbank`), dann die Serie: der Schirm
// 1280×720, `herdeSzene`, je Schuss `bild --klasse ^tier --ziel Herde --punkte … --wahl 14` (die Blick-Wahl EINES Rings: Abstand
// und Augenhöhe des Ego bleiben, nur der Azimut dreht, bis JEDES Glied frei steht — die Mitte einer Herde zwischen Stämmen sagt
// nichts über ihre Glieder) mit `herdePulk` an der Pose des Schusses, drei Schüsse je 0,5 s Spielzeit; der Beobachter bleibt an
// der Pose, die die Wahl ihm gab. Bilder und Abnahmen neben {AUS}, das Ergebnis in {AUS}. Die beiden
// Seiten-Funktionen reisen als eigene Argumente (`knapp`): an der Kommandozeile von Windows endet jedes nach 8191 Zeichen.
async function herdeHang() {
    const fs = require("fs");
    const path = require("path");
    const cp = require("child_process");
    const { werkbankRuf } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const [aus, port, szene, pulk] = process.argv.slice(1);
    const W = Number(port) + 20000;
    const B = aus.replace(/\.json$/, "");
    const erg = { serie: [] };
    const ruf = async (src, o) => {
        const a = await werkbankRuf(W, "/eval", { code: "return (" + src + ")(r, T, " + JSON.stringify(o || {}) + ");" });
        if (!a || a.ergebnis === undefined) throw new Error("eval: " + JSON.stringify(a).slice(0, 300));
        return a.ergebnis;
    };
    // die Welt der Sitzung (punkte.cjs fahreSitzung): ihr Log nennt die Karte; sie startet und endet nie hier
    const tor = { log: fs.readFileSync(process.env.PUNKTE_SITZUNG_LOG, "utf8"), bereit: Promise.resolve(), stop: () => {} };
    try {
        await tor.bereit;
        for (const z of tor.log.split(/\r?\n/)) if (/^\[linse-gpu\] /.test(z)) console.log(z);
        const p = cp.spawnSync(process.execPath, ["scripts/diag-kreatur-takt.cjs", "--werkbank", String(W), "--proben", "herde"], {
            encoding: "utf8",
            maxBuffer: 1 << 26,
        });
        process.stdout.write(p.stdout || "");
        process.stderr.write(p.stderr || "");
        await werkbankRuf(W, "/fenster", { w: 1280, h: 720 });
        erg.szene = await ruf(szene, { phase: "start" });
        let auge = null;
        for (let i = 0; i < 3 && !erg.szene.fehler; i++) {
            const q = i ? await ruf(szene, { phase: "weiter", takte: 30 }) : erg.szene;
            const [, , , lx, ly, lz] = q.kamera;
            const [px, py, pz] = auge || q.kamera;
            const datei = B + "-herde-" + (i + 1) + ".png";
            const b = await werkbankRuf(W, "/bild", { px, py, pz, lx, ly, lz, klasse: "^tier", ziel: "Herde", punkte: q.punkte, wahl: 14, datei });
            const kl = b && b.klasse ? Object.fromEntries(Object.entries(b.klasse.klassen || {}).map(([k, v]) => [k, v.pixel])) : null;
            const kam = b && Array.isArray(b.kamera) ? [...b.kamera, lx, ly, lz] : q.kamera;
            auge = kam;
            erg.serie.push({
                schuss: i + 1,
                abstand: +Math.hypot(kam[0] - lx, kam[1] - ly, kam[2] - lz).toFixed(1),
                spieler: q.abstand,
                glieder: q.glieder,
                fliehen: q.fliehen,
                takte: q.takte,
                kamera: kam,
                abnahme: (b && b.abnahme) || null,
                fehler: (b && b.fehler) || null,
                klassen: kl,
                pulk: kl ? await ruf(pulk, { kamera: kam }) : null,
                datei,
            });
        }
    } catch (e) {
        erg.fehler = String((e && e.message) || e).split("\n")[0].slice(0, 400);
    } finally {
        tor.stop();
    }
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
    const kurz = erg.serie.map((x) => [x.abstand, x.fliehen + "/" + x.glieder, x.pulk, x.fehler]);
    console.log("HERDE AM HANG " + JSON.stringify({ szene: erg.szene, fehler: erg.fehler || null, serie: kurz }));
}

// der Text einer Funktion ohne Einzug und Kommentar-Zeilen (ein Argument des Befehls, s. herdeHang)
const knapp = (fn) => String(fn).replace(/\n\s*\/\/[^\n]*/g, "").replace(/\n\s+/g, "\n");

// ───────── luftwasser.K5 — DER SCHWARM IST FERN EIN AGENT (Zweig schwarm) ─────────
// DIE PRÜFBÜHNE DES SCHWARMS (in der Seite der Werkbank, r = Welt, T = THREE): Mittag · Sonne · Sommer (`__buehne`, das Wort
// des Spielers), Ego; die Schwarm-Karte frisch, die Zelle unter dem Auge trägt den FESTEN Schwarm von o.n Gliedern (ihr Wurf
// der Glieder gesetzt), jede andere Zelle keinen. Je Reihe steht das Auge o.abstand m quer zur Flugrichtung des Zentrums auf
// Augenhöhe über dem Boden, der Blick auf das Zentrum (die Hülle im Blick, nah: die Separation rechnet); ein ungemessener Takt
// legt neue Zellen an (sie tragen keinen Schwarm), dann o.je gemessene Takte des Schwarms auf der Uhr der Welt (1/60 s je
// Takt). Zurück die ms je Takt jeder Reihe und die Lage des Takts (`state.schwarm`) je Reihe, dazu die Pose der letzten Reihe.
function schwarmSzene(r, T, o) {
    const s = r.state;
    const A = r.constructor;
    const VG = A._vogelGesetz();
    const V = VG.V;
    const S = V.schwarm;
    const pm = s.playerMesh.position;
    const H = (x, z) => r.getTerrainHeightAt(x, z);
    s.renderer.setAnimationLoop(null);
    window.__buehne();
    r.setCameraMode("first");
    const sonne = r._sonnenRichtung().y;
    const regen = r._weatherFieldFor(s.weather).rain;
    r._schwarmKarte = null;
    r._vogelSchwarmTakt(sonne, regen);
    const sk = r._schwarmKarte;
    const Z = S.zelleM;
    const c = sk.zellen.get(Math.floor(s.camera.position.x / Z) * 1048576 + Math.floor(s.camera.position.z / Z));
    if (!c) return { fehler: "keine Schwarm-Zelle unter dem Auge" };
    c.revier = true;
    c.wurf[4] = (o.n - S.glieder[0]) / (S.glieder[1] - S.glieder[0]);
    const zt = {};
    let pose = null;
    const stelle = () => {
        if (!VG.schwarmZentrum(c.wurf, s.spielZeit + o.je / 120, sonne, regen, V, zt)) return null;
        const [x, z] = [c.x + zt.dx, c.z + zt.dz];
        const y = r._terrainMacroSurfaceY(x, z) + zt.h;
        const [ex, ez] = [x + Math.cos(zt.gier) * o.abstand, z - Math.sin(zt.gier) * o.abstand];
        pm.set(ex, H(ex, ez) + 0.5, ez);
        s.camera.position.set(ex, H(ex, ez) + A.EGO_AUGE_M, ez);
        s.camera.lookAt(x, y, z);
        s.camera.updateMatrixWorld(true);
        r._loopFrustumCulling();
        r._vogelSchwarmTakt(sonne, regen);
        for (const q of sk.zellen.values()) {
            q.revier = q === c;
            q.frisch = s.spielZeit; // das Revier frischt erst nach frischeS nach: die Reihe hält die Bühne
        }
        const e = s.camera.position;
        return (pose = { kamera: [e.x, e.y, e.z, x, y, z].map((v) => +v.toFixed(2)), abstand: +Math.hypot(x - e.x, y - e.y, z - e.z).toFixed(1) });
    };
    const ms = [];
    const lagen = [];
    for (let b = 0; b < o.reihen; b++) {
        if (!stelle()) return { fehler: "der Schwarm fliegt nicht (Sonne " + sonne.toFixed(2) + ", Regen " + regen + ")" };
        const t0 = performance.now();
        for (let k = 0; k < o.je; k++) {
            s.spielZeit += 1 / 60;
            r._vogelSchwarmTakt(sonne, regen);
        }
        ms.push((performance.now() - t0) / o.je);
        lagen.push(Object.assign({}, s.schwarm));
    }
    const P = s.vogelSchwarmPool;
    return { ms, lagen, pose, instanzen: P ? P.mesh.count : 0, je: V.leib.teile.length + 2 };
}

// Der Lauf (im Spiel-Baum, cwd): EINE Werkbank an der Weiche (`[linse-gpu]` nennt die Karte), Port {PORT}+20000; darin die
// Prüfbühne (60 Reihen × 20 Takte, 100 Glieder, das Auge 40 m quer), dann EIN gezählter Frame (`__drawZensus`, der Draw-Zähler
// am Renderer) an der Pose der letzten Reihe: die Befehle der Klasse vogel je Pass (Sänger und Schwarm zeichnen im Stoff der
// Vogel-Pools). Das Ergebnis in {AUS}, die Zeile „SCHWARM {…}".
async function schwarmLauf() {
    const fs = require("fs");
    const path = require("path");
    const { werkbankRuf } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const [aus, port, szene] = process.argv.slice(1);
    const W = Number(port) + 20000;
    const erg = {};
    // die Welt der Sitzung (punkte.cjs fahreSitzung): ihr Log nennt die Karte; sie startet und endet nie hier
    const tor = { log: fs.readFileSync(process.env.PUNKTE_SITZUNG_LOG, "utf8"), bereit: Promise.resolve(), stop: () => {} };
    try {
        await tor.bereit;
        for (const z of tor.log.split(/\r?\n/)) if (/^\[linse-gpu\] /.test(z)) console.log(z);
        await werkbankRuf(W, "/fenster", { w: 1280, h: 720 });
        const a = await werkbankRuf(W, "/eval", {
            code: "return (" + szene + ")(r, T, " + JSON.stringify({ n: 100, abstand: 40, reihen: 60, je: 20 }) + ");",
        });
        const b = a && a.ergebnis;
        if (!b || b.fehler) throw new Error("Bühne: " + JSON.stringify(b || a).slice(0, 300));
        const z = await werkbankRuf(W, "/eval", {
            code: "const z = await window.__drawZensus({ alle: true }); const k = z.klassen.find((x) => x.klasse === 'vogel') || {}; return { cmd: k.cmd || 0, je: k.je || {}, inst: k.inst || 0, dMin: k.dMin, dMax: k.dMax, gesamt: z.gesamt };",
        });
        const q = b.ms.slice().sort((x, y) => x - y);
        const im = b.lagen.map((l) => (l.imBild === 1 && l.nah === 1 ? l.glieder : 0));
        Object.assign(erg, {
            msMedian: +q[q.length >> 1].toFixed(4),
            msP95: +q[Math.floor(0.95 * (q.length - 1))].toFixed(4),
            imBildMin: Math.min(...im),
            paare: b.lagen.reduce((x, l) => x + l.paare, 0),
            instanzen: b.instanzen,
            teileJe: b.je,
            pose: b.pose,
            vogel: z && z.ergebnis,
        });
    } catch (e) {
        erg.fehler = String((e && e.message) || e).split("\n")[0].slice(0, 400);
    } finally {
        tor.stop();
    }
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
    console.log("SCHWARM " + JSON.stringify(erg));
}

// ───────── oekologie.K5 Staffel 2 — DIE ANSTECKUNG GEGEN bond = 0 UND DIE BINDUNG ÜBER DEN RELOAD ─────────
// Null-Renderer, Produktions-Boot, ein Statik-Server auf {PORT} (R3: die Stimmung ist Zustand der Welt, kein Bild). Vier Läufe
// im Wechsel A B A B, jeder in einem frischen Browser-Kontext (kein Lauf erbt Stimmung, Feld-Abdruck oder Speicher des vorigen):
// am Spieler-Ort der Welt (Land, kein Bau in 14 m) ein Fuchs 3 m neben dem Spieler, „happy“ (CONTAGION_TARGET.happy), Gefühle
// und Stimmung des Spielers 0, dann die Geste „folge mir“ (`assignCreatureTask` follow_player: das Gefühl der Geste und der
// Bindungs-Sprung); 120 s Spiel-Takt wie der Loop (updatePlayerEmotions · _loopFixedStep · _loopWeatherAndGrowth, 60 Hz), der
// Spieler steht. A ist die Welt (die Bindung wächst, solange das Tier nah folgt), B der Gegenlauf bond = 0 (EMOTION_CONTAGION
// ohne Sprung und Wachstum, bond vor jedem Takt 0) — sonst gleich. Gemessen die STIMMUNG des Spielers (`_moodValence`, die EMA
// der Emotion über EMOTION_MOOD_TAU) nach 120 s. Nach dem zweiten A im selben Kontext `saveState`, der IDB-Put landet, Reload:
// derselbe Fuchs (beim Namen) trägt bond (Hundertstel) und follow_player. Zeile `BINDUNG {…}`, das Ergebnis in {AUS}.
async function bindungAnsteckung() {
    const fs = require("fs");
    const path = require("path");
    const { statikServer, starteBrowser, warteAufWelt, nullRenderer } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const [aus, port] = process.argv.slice(1);
    const erg = { sek: 120, laeufe: [], fehler: [] };
    const lauf = async (o) => {
        // erst das Erwachen des Boots samt der Heimat aus dem Faden (die Warte von `__weltDa`): ein Lauf, der vorher setzt, setzt in
        // eine halbe Welt (25.10. unter Last: die Heimat kam nach dem Setzen, der Fuchs stand 30,8 m entfernt)
        while (!(window.anazhRealm && window.anazhRealm.erwacht)) await new Promise((ok) => setTimeout(ok, 50));
        await window.anazhRealm.erwacht;
        const r = window.anazhRealm;
        const s = r.state;
        const p = s.player;
        const pm = s.playerMesh.position;
        s.renderer.setAnimationLoop(null);
        if (typeof r._gliederBestellen === "function") await r._gliederBestellen("fuchs");
        r.setGameMode("pfad");
        r.clearCreatures();
        const P = pm.clone();
        const bau = (e) => Math.hypot(e.position.x - P.x, e.position.z - P.z) < 14;
        for (let i = 0; i < 40 && (s.architectures.some(bau) || !r._landAt(P.x, P.z, 0.2)); i++) P.x += 24;
        P.y = r.getTerrainHeightAt(P.x, P.z) + r.constructor.PLAYER_FOOT_OFFSET;
        pm.copy(P);
        s.playerVel.setValue(0, 0, 0);
        if (o.bondNull) {
            AnazhRealm.EMOTION_CONTAGION = Object.freeze({ ...AnazhRealm.EMOTION_CONTAGION, bondGrowPerSec: 0, bondFollowBump: 0 });
            if (AnazhRealm.EMOTION_CONTAGION.bondGrowPerSec !== 0) throw new Error("die Mutation bond = 0 greift nicht");
        }
        let t = 1e4;
        for (const k in p.emotions) p.emotions[k] = 0;
        p.mood = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
        p.emotionLastTick = t;
        const f = r.spawnCreatureAt(P.x + 3, P.y, P.z, "happy", "fuchs", { bodySize: 1, precise: true });
        if (!f) throw new Error("kein Fuchs");
        f.position.y = r.getTerrainHeightAt(f.position.x, f.position.z);
        f.userData.name = "K5-Bindung";
        r.assignCreatureTask(f, "follow_player");
        const bond0 = f.userData.bond || 0;
        const ab = [];
        const kurve = [];
        for (let k = 1; k <= o.sek * 60; k++) {
            t += 1 / 60;
            s.spielZeit += 1 / 60;
            if (o.bondNull) for (const c of s.creatures) c.userData.bond = 0;
            r.updatePlayerEmotions(t);
            r._loopFixedStep(1 / 60, t);
            r._loopWeatherAndGrowth(1 / 60);
            if (k % 60 === 0) ab.push(Math.hypot(f.position.x - pm.x, f.position.z - pm.z));
            if (k % 1200 === 0)
                kurve.push([r._moodValence(), p.emotions.joy || 0, p.emotions.peace || 0, f.userData.bond || 0].map((v) => +v.toFixed(4)));
        }
        ab.sort((x, y) => x - y);
        const g = (o2) => Object.fromEntries(Object.entries(o2).map(([k, v]) => [k, +(+v).toFixed(4)]));
        return {
            valenz: +r._moodValence().toFixed(4),
            stimmung: g(p.mood),
            gefuehl: g(p.emotions),
            bond: [+bond0.toFixed(3), +(f.userData.bond || 0).toFixed(3)],
            auftrag: f.userData.task && f.userData.task.name,
            lebt: s.creatures.includes(f),
            abstand: { p50: +ab[ab.length >> 1].toFixed(2), max: +ab[ab.length - 1].toFixed(2) },
            ort: [+P.x.toFixed(1), +P.z.toFixed(1)],
            verschoben: +Math.hypot(pm.x - P.x, pm.z - P.z).toFixed(2),
            kurve,
        };
    };
    const abdruck = () => {
        const f = window.anazhRealm.state.creatures.find((c) => c.userData.name === "K5-Bindung");
        return f ? [Math.round(f.userData.bond * 100) / 100, f.userData.task && f.userData.task.name] : null;
    };
    const server = statikServer();
    await new Promise((ok) => server.listen(Number(port), "127.0.0.1", ok));
    const browser = await starteBrowser({ art: "null", frist: 900000 });
    try {
        for (const art of ["A", "B", "A", "B"]) {
            const kontext = await browser.createBrowserContext();
            try {
                const seite = await kontext.newPage();
                seite.setDefaultTimeout(600000);
                seite.on("pageerror", (e) => erg.fehler.push(art + ": " + String(e.message || e).split("\n")[0].slice(0, 200)));
                await nullRenderer(seite);
                await seite.goto("http://127.0.0.1:" + port + "/index.html", { waitUntil: "networkidle0", timeout: 180000 });
                await warteAufWelt(seite, 300000);
                const e = await seite.evaluate(lauf, { sek: erg.sek, bondNull: art === "B" });
                erg.laeufe.push({ art, ...e });
                console.log("  Lauf " + art + " Stimmung " + e.valenz + " · bond " + e.bond.join(" → ") + " · Abstand p50 " + e.abstand.p50 + " m");
                if (art === "A" && erg.laeufe.length === 3) {
                    const vor = await seite.evaluate(abdruck);
                    await seite.evaluate(() => window.anazhRealm.saveState());
                    await new Promise((ok) => setTimeout(ok, 1500));
                    await seite.reload({ waitUntil: "networkidle0", timeout: 180000 });
                    await warteAufWelt(seite, 300000);
                    await seite.evaluate(async () => {
                        while (!(window.anazhRealm && window.anazhRealm.erwacht)) await new Promise((ok) => setTimeout(ok, 50));
                        await window.anazhRealm.erwacht;
                    });
                    const h = await seite.waitForFunction(abdruck, { timeout: 90000, polling: 500 }).catch(() => null);
                    erg.reload = { vor, nach: h ? await h.jsonValue() : null };
                    console.log("  Reload " + JSON.stringify(erg.reload));
                }
            } finally {
                await kontext.close();
            }
        }
    } catch (e) {
        erg.fehler.push(String((e && e.message) || e).split("\n")[0].slice(0, 400));
    } finally {
        await browser.close();
        server.close();
    }
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
    console.log("BINDUNG " + JSON.stringify({ laeufe: erg.laeufe.map((x) => [x.art, x.valenz, x.bond[1]]), reload: erg.reload || null, fehler: erg.fehler }));
    process.exit(erg.fehler.length ? 1 : 0);
}


// ───────── DIE WERTUNG ANTWORTET GANZ (affekt.K1#2, oekologie.K4#2; Zweig affekt-wert): zwei Seiten-Funktionen, ihr Text geht in
// den Befehl (`knapp`), und EIN Lauf (`wertLauf`) ─────────
// DER WERT-GANG (affekt.K1#2), in der Seite der Werkbank (r = Welt, T = THREE): am Baum nächst (o.x, o.z) zur Uhr o.uhr (über das
// Wort des Spielers), in der Sicht o.sicht, im Frieden, der Nexus ruht: fällen (das Fadenkreuz auf den Stamm, der Hieb des Spiels
// tryMouseBreak, bis der Baum fällt), töten (ein Wesen neben dem Spieler, das Schadens-Tor damageCreature von Spieler-Hand),
// pflegen („pflege das land"), je 30 s Spielzeit Abstand; dann 30 min Ruhe (Spielzeit) und wieder pflegen. Je Tat ihr δ und
// Ertrag (das Buch `state.taten`, `_tatWerten`) und die Antwort des Orts im Ausgabe-Pfad: der Graph der Umwelt (`zensus`), sobald
// er die Mischung der Lage nach der Tat trägt (Takte bis dahin, höchstens 2 s), gegen dieselbe Lage ohne Antwort — die Stimme,
// die singt (Vogel-Chor am Tag, Grillen in der Nacht) — und 32 m daneben.
function wertGang(r, T, o) {
    const st = r.state;
    const K = window.__klangCore;
    const pm = st.playerMesh.position;
    const cam = st.camera;
    const y = (x, z) => r._voxelSurfaceY(x, z);
    if (st.renderer && st.renderer.setAnimationLoop) st.renderer.setAnimationLoop(null);
    const takt = (n) => {
        for (let i = 0; i < n; i++) r._gameLoopTick((window.__gangUhr = (window.__gangUhr || 1e6) + 1000 / 60));
    };
    if (!window.__wertGang) {
        window.__wertGang = 1;
        r._loopNexusUpdate = () => {};
        st.worldRules = [];
        st.perfRegulator = false;
        window.__buehne();
        st.weatherEffectTime = 0;
        r._setWeather("sunny", "regler");
        r.initSymphony();
    }
    r.setGameMode("frieden");
    r.setTimeOfDay(o.uhr, "regler");
    r.setCameraMode(o.sicht);
    const um = st.symphony.umwelt;
    const baum = (a) => /baum/.test(a._lodSpecies || a.type) && r._istNatur(a);
    const ab = (a) => Math.hypot(a.position.x - o.x, a.position.z - o.z);
    const B = st.architectures.filter(baum).sort((a, b) => ab(a) - ab(b))[0];
    if (!B) return { fehler: "kein Baum nahe der Wiese" };
    const ziel = { x: B.position.x, y: y(B.position.x, B.position.z) + 1, z: B.position.z };
    const stand = { x: ziel.x + 2.2, z: ziel.z };
    const halte = (n) => {
        for (let i = 0; i < n; i++) (pm.set(stand.x, y(stand.x, stand.z) + 1.8, stand.z), takt(1));
    };
    halte(30);
    const stimme = () => (Number.isFinite(K.umweltMischung(r._umweltLage()).vogel.db) ? "vogel" : "grille");
    // vor jeder Tat singt eine Stimme des Orts (die Vögel kreisen nach der Uhr der Welt): je 5 s Spielzeit, höchstens 24 Schritte
    const singt = () => {
        for (let w = 0; w < 24 && !Number.isFinite(K.umweltMischung(r._umweltLage())[stimme()].db); w++) (st.spielZeit += 5), halte(4);
    };
    const tat = () => {
        const e = st.taten && st.taten[st.taten.length - 1];
        return e ? { op: e.op, delta: +e.delta.toFixed(4), ertrag: +e.ertrag.toFixed(4) } : {};
    };
    const antwort = () => {
        const alt = um.lage;
        um.letzteMischung = -Infinity;
        let takte = 0;
        let a = null;
        let vor = null;
        for (; takte < 120 && !a; takte++) {
            halte(1);
            if (um.lage !== alt && !vor) vor = um.mix;
            const v = stimme();
            const z = um.graph.zensus().find((x) => x.name === v);
            // die Mischung der neuen Lage ist gerechnet und angewandt (die Folge des Takts: Lage → Mischung → Graph)
            if (vor && um.mix !== vor && um.folge !== 2 && z && Number.isFinite(z.db) && Math.abs(z.db - um.mix[v].db) < 0.3)
                a = { stimme: v, db: +(z.db - K.umweltMischung({ ...um.lage, antwort: null })[v].db).toFixed(2) };
        }
        pm.x += 32;
        const l = r._umweltLage();
        pm.x -= 32;
        const v = stimme();
        const nachbar = +(K.umweltMischung(l)[v].db - K.umweltMischung({ ...l, antwort: null })[v].db).toFixed(2) || 0;
        return { ...(a || { stimme: v, db: null }), s: +(takte / 60).toFixed(3), nachbar };
    };
    const pause = () => ((st.spielZeit += 30), halte(4), singt());
    const aus = { uhr: o.uhr, sicht: st.cameraMode, sonne: +r._sonnenRichtung().y.toFixed(2), baum: [+ziel.x.toFixed(1), +ziel.z.toFixed(1)] };
    pause();
    let hiebe = 0;
    for (let i = 0; i < 64 && st.architectures.includes(B); i++) {
        const g = y(stand.x, stand.z);
        pm.set(stand.x, g + 1.8, stand.z);
        cam.position.set(stand.x, g + 1.6, stand.z);
        cam.lookAt(ziel.x, ziel.y, ziel.z);
        cam.updateMatrixWorld(true);
        if ((r._pickArchitectureAtCrosshair() || {}).entry === B) (r.tryMouseBreak(), hiebe++);
        else takt(1);
    }
    if (st.architectures.includes(B)) return { ...aus, fehler: "der Baum fällt nicht (" + hiebe + " Hiebe)" };
    aus.faellen = { hiebe, ...tat(), ...antwort() };
    pause();
    st.maxCreatures = Math.max(st.maxCreatures || 0, st.creatures.length + 2);
    const c = r.spawnCreatureAt(stand.x + 2.5, y(stand.x + 2.5, stand.z + 1), stand.z + 1, "happy", "wesen");
    if (!c) return { ...aus, fehler: "kein Wesen" };
    r.damageCreature(c, 9999, { source: "player", fromPos: { x: pm.x, y: pm.y, z: pm.z } });
    aus.toeten = { ...tat(), ...antwort() };
    pause();
    r.processChatCommand("pflege das land");
    aus.pflegen = { ...tat(), ...antwort() };
    st.spielZeit += 1800;
    halte(4);
    singt();
    r.processChatCommand("pflege das land");
    aus.ruhe = { ...tat(), ...antwort() };
    // der nächste Gang beginnt wieder an der Baseline
    st.spielZeit += 1800;
    halte(30);
    return aus;
}

// DAS RUDEL UND DAS GEFÜHL (oekologie.K4#2), in der Seite der Werkbank: jedes Tier fort, ein Rudel aus dem Wurf (`_kreaturWurf`)
// 45 m westlich vom stehenden Spieler wie in Staffel 1 (Gesundheit voll, der Nexus ruht); im pfad pirscht und umstellt es ihn — der Biss ruht: gemessen
// wird das Umstellen, nicht die Wunde (der Biss stempelt `damage`) —, im Gegenlauf (o.gegen, Frieden) dieselbe Szene ohne Jagd.
// Gelesen werden die Emotion-Achsen des Spielers am echten Takt (`_gameLoopTick`, je 1/60 s): das erste Umstellen wie Staffel 1
// (≥ 3 Jäger näher als 2 × hetzM, die größte Lücke ≤ 540°/n), die Furcht (chaos, sorrow) 20 s danach; dann fallen seine Jäger
// (`_spielerJaeger`) von seiner Hand (damageCreature), der Triumph ist der Gipfel von joy und hope in den 5 s danach über ihrem
// Wert beim Fall. Der Gegenlauf läuft dieselbe Zeit und tötet dieselbe Zahl Wölfe; die Szene räumt ihre Tiere und Risse.
function rudelGefuehl(r, T, o) {
    const s = r.state;
    const pm = s.playerMesh.position;
    const p = s.player;
    const y = (x, z) => r._voxelSurfaceY(x, z);
    if (s.renderer && s.renderer.setAnimationLoop) s.renderer.setAnimationLoop(null);
    const takt = () => r._gameLoopTick((window.__gangUhr = (window.__gangUhr || 1e6) + 1000 / 60));
    window.__buehne();
    s.weatherEffectTime = 0;
    r._loopNexusUpdate = () => {};
    s.worldRules = [];
    s.perfRegulator = false;
    r.setGameMode(o.gegen ? "frieden" : "pfad");
    r.setCameraMode(o.sicht);
    for (const c of [...s.creatures, ...(s.leichname || [])]) r.removeCreature(c);
    s.faunaLifecycle.lastTick = 1e12;
    const n0 = (s.worldMeta.taten ||= []).length;
    p.hp = p.stats.hpMax;
    const heim = { x: o.x - 45, z: o.z };
    pm.set(heim.x + 140, y(heim.x + 140, heim.z) + 1.8, heim.z);
    s.maxCreatures = Math.max(s.maxCreatures || 0, 12);
    const woelfe = r._kreaturWurf({ x: heim.x, z: heim.z }, "wolf", "happy", r._faunaRng("rudel"), 7);
    for (const c of woelfe) {
        c.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
        c.userData.nextHuntStrikeAt = 1e12;
    }
    const steh = () => pm.set(o.x, y(o.x, o.z) + 1.8, o.z);
    steh();
    for (const k in p.emotions) p.emotions[k] = 0;
    p.wohlBaseline = undefined;
    p.appraisalDelta = 0;
    const H = r.constructor._verhaltenGesetz().jagd.hetzM;
    const jaeger = () =>
        woelfe.filter((c) => c.userData._jagdZiel === "spieler" && /^(jagd|hetzen)$/.test(c.userData._motionZustand) && !c.userData.dying);
    const luecke = (R) => {
        const w = R.map((c) => Math.atan2(c.position.x - pm.x, c.position.z - pm.z)).sort((a, b) => a - b);
        return (Math.max(...w.map((a, i) => (i + 1 < w.length ? w[i + 1] : w[0] + 2 * Math.PI) - a)) * 180) / Math.PI;
    };
    const e = () => ({ chaos: +p.emotions.chaos.toFixed(3), sorrow: +p.emotions.sorrow.toFixed(3), joy: +p.emotions.joy.toFixed(3), hope: +p.emotions.hope.toFixed(3) });
    const sit = () => +r._playerSituationWohl(r.auraAt(pm.x, pm.z)).toFixed(3);
    const aus = { woelfe: woelfe.length, gegen: !!o.gegen, sicht: s.cameraMode };
    let k = 0;
    let umstelltK = null;
    const ende = o.gegen ? Math.round(o.dauer * 60) : 36000;
    for (; k < ende && !(umstelltK !== null && k >= umstelltK + 1200); k++) {
        steh();
        takt();
        const R = jaeger();
        const nah = R.length >= 3 && R.every((c) => Math.hypot(c.position.x - pm.x, c.position.z - pm.z) < 2 * H);
        if (!o.gegen && umstelltK === null && nah && luecke(R) <= 540 / R.length) umstelltK = k;
    }
    aus.dauer = +(k / 60).toFixed(2);
    aus.umstelltS = umstelltK === null ? null : +(umstelltK / 60).toFixed(2);
    aus.umstellt = +r._spielerUmstellt().toFixed(3);
    aus.furcht = e();
    const opfer = o.gegen ? woelfe.slice(0, o.opfer) : (r._spielerJaeger || []).filter((c) => woelfe.includes(c) && !c.userData.dying);
    aus.opfer = opfer.length;
    aus.situation = [sit(), +(p.wohlBaseline || 0).toFixed(3)];
    for (const c of opfer) r.damageCreature(c, 9999, { source: "player", fromPos: { x: pm.x, y: pm.y, z: pm.z } });
    aus.situation.push(sit());
    const vor = e();
    const gipfel = { joy: vor.joy, hope: vor.hope };
    for (let i = 0; i < 300; i++) {
        steh();
        takt();
        gipfel.joy = Math.max(gipfel.joy, p.emotions.joy);
        gipfel.hope = Math.max(gipfel.hope, p.emotions.hope);
    }
    aus.triumph = { joy: +(gipfel.joy - vor.joy).toFixed(3), hope: +(gipfel.hope - vor.hope).toFixed(3) };
    aus.chaosNach = +p.emotions.chaos.toFixed(3);
    for (const c of [...s.creatures, ...(s.leichname || [])]) r.removeCreature(c);
    s.worldMeta.taten.length = n0;
    return aus;
}

// Der Lauf (im Spiel-Baum, cwd): EINE Werkbank an der Weiche (`[linse-gpu]` nennt die Karte) an der Mess-Wiese, Port {PORT}+20000;
// art „wert": der Wert-Gang zur Uhr 12 und 22 Uhr (die Wiese hat dann 13,8 °C — um Mitternacht schweigen die Grillen unter
// tStumm 12 °C, Dolbear), je Ego und Third; art „rudel": je Sicht der Lauf im pfad und sein Gegenlauf. Je Ergebnis eine Zeile
// „WERT-GANG {…}" bzw. „RUDEL-GEFUEHL {…}", alle in {AUS}.
// IN DER SITZUNG (29.10.): „wert" läuft die Diagonale — 12 Uhr in Ego, 22 Uhr in Third (Tag und Nacht, Ego und Third: jede Spalte
// der Staffel EINMAL; bis dahin das volle Kreuz, 4 Gänge); „rudel" läuft Ego und seinen Gegenlauf (die Staffel nennt keine Sicht,
// die Furcht liest die Situation, nie die Kamera; bis dahin dazu Third)
const WERT_GAENGE = [[0.5, "first"], [0.92, "third"]];
const RUDEL_SICHTEN = ["first"];
async function wertLauf() {
    const fs = require("fs");
    const path = require("path");
    const { werkbankRuf } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const M = require(path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const [aus, port, art, szene] = process.argv.slice(1);
    const W = Number(port) + 20000;
    const erg = { art, laeufe: [] };
    const ruf = async (o) => {
        const a = await werkbankRuf(W, "/eval", { code: "return (" + szene + ")(r, T, " + JSON.stringify({ x: M.x, z: M.z, ...o }) + ");" });
        if (!a || a.ergebnis === undefined) throw new Error("eval: " + JSON.stringify(a).slice(0, 300));
        console.log((art === "wert" ? "WERT-GANG " : "RUDEL-GEFUEHL ") + JSON.stringify(a.ergebnis));
        erg.laeufe.push(a.ergebnis);
        return a.ergebnis;
    };
    // die Welt der Sitzung (punkte.cjs fahreSitzung): ihr Log nennt die Karte; sie startet und endet nie hier
    const tor = { log: fs.readFileSync(process.env.PUNKTE_SITZUNG_LOG, "utf8"), bereit: werkbankRuf(W, "/umstellen", { ort: "wiese" }).then((a) => { if (!a || a.fehler) throw new Error("umstellen --ort wiese: " + JSON.stringify(a).slice(0, 200)); }), stop: () => {} };
    try {
        await tor.bereit;
        for (const z of tor.log.split(/\r?\n/)) if (/^\[linse-gpu\] /.test(z)) console.log(z);
        if (art === "wert") for (const [uhr, sicht] of [[0.5, "first"], [0.92, "third"]]) await ruf({ uhr, sicht });
        else
            for (const sicht of ["first"]) {
                const a = await ruf({ sicht });
                await ruf({ sicht, gegen: true, dauer: a.dauer, opfer: a.opfer });
            }
    } catch (e) {
        erg.fehler = String((e && e.message) || e).split("\n")[0].slice(0, 400);
        console.log("FEHLER " + erg.fehler);
    } finally {
        tor.stop();
    }
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
}
// ───────── DIE EMOTION FORMT DIE WELT (affekt.K2#1) und DER NEXUS WÄHLT AUS (affekt.K3#1; Zweig affekt-emotion): zwei Szenen
// der Werkbank, ein Lauf (`affektLauf`) ─────────
// Gemeinsam: der eigene Takt der Szene (`_gameLoopTick` je 0,1 s Ereignis-Uhr, nie die Wanduhr, die Seite steht still), jeder
// Lauf beginnt am selben Anfang (Uhr, Welt-Uhr, Ströme der Welt `bauSame`, Leben- und Gefühls-Feld, Taten, die Wesen und Werke
// des ersten Laufs) — so unterscheidet die Läufe nur ihre Mutante; der Halt der Messung fällt (`weatherEffectTime` 0).
// DIE HOFFNUNG UND DAS WETTER (affekt.K2#1), in der Seite der Werkbank: der Spieler steht an der Mess-Wiese im Frieden, 12 Uhr
// und Sonne über sein Wort, dann gibt er das Wetter frei; der Nexus ruht. Die Tat: alle 30 s Spielzeit baut er einen Felsblock
// aus der Leiste (`confirmBuild`, der Stein dafür im Inventar), 25 min lang; 30 Spielminuten zieht der Wetter-Zug (alle
// `WETTER_ZUG_SEK`) — das Wort, das die Welt sich wünscht, sonst die Front am Ort. Gezählt: je Zug das Wort, der Wunsch und
// seine Quelle, die Front; die Hoffnung über der Schwelle des Spielers; das Feuern des Gesetzes `emotion:hope`. o.mutante
// „starr" friert die Achse hope auf 0, „gesetz-aus" pausiert das Gesetz (`disabled`, der Schalter des Gesetze-Pults).
function gemuetWetter(r, T, o) {
    const s = r.state;
    const p = s.player;
    const pm = s.playerMesh.position;
    const y = (x, z) => r._voxelSurfaceY(x, z);
    if (s.renderer && s.renderer.setAnimationLoop) s.renderer.setAnimationLoop(null);
    const A = window.__affektAnfang || (window.__affektAnfang = {
        u: window.__gangUhr || performance.now(), sz: s.spielZeit, same: JSON.stringify(s.worldMeta.bauSame || {}),
        regel: s.dsl.nextRuleId, wesen: new Set(s.creatures), werke: new Set(s.architectures),
    });
    let u = A.u;
    s.spielZeit = A.sz;
    s.worldMeta.bauSame = JSON.parse(A.same);
    for (const c of [...s.creatures]) if (!A.wesen.has(c)) r.removeCreature(c);
    for (const a of [...s.architectures]) if (!A.werke.has(a)) r.removeArchitecture(a, { still: true });
    r._clearBuildMode();
    p.inventory = new Array(27).fill(null);
    Object.assign(s, { lifeField: new Map(), wohlBaseline: new Map(), emotionField: new Map(), taten: [], tatErwartung: new Map() });
    s.weatherEffectTime = 0;
    s.nexusEvolutionQueue.length = 0;
    s.dsl.pending = [];
    s.perfRegulator = false;
    s.worldRules = s.worldRules.filter((g) => /^emotion:/.test(g.source));
    for (const g of s.worldRules) Object.assign(g, { lastFired: -Infinity, fires: 0, disabled: o.mutante === "gesetz-aus" && g.source === "emotion:hope" });
    for (const k in p.emotions) p.emotions[k] = 0;
    if (p.mood) for (const k in p.mood) p.mood[k] = 0;
    p.wohlBaseline = undefined;
    p.appraisalDelta = 0;
    r.setGameMode("frieden");
    r.setTimeOfDay(0.5, "regler");
    r._setWeather("sunny", "regler");
    r._wetterFreigeben("regler");
    if (o.mutante === "starr") Object.defineProperty(p.emotions, "hope", { configurable: true, enumerable: true, get: () => 0, set: () => {} });
    const takt = () => {
        s.nexusLastEvolution = Infinity;
        r._gameLoopTick((window.__gangUhr = u += 100));
    };
    const bauen = () => {
        if (!s.buildMode.active || s.buildMode.blueprintName !== "stein_block") (r.setHotbarSlot(0, "stein_block"), r.selectHotbarSlot(0));
        for (const [m, n] of Object.entries(r.computeBuildCost("stein_block") || {})) r.addMaterialToInventory(m, n);
        return r.confirmBuild() ? 1 : 0;
    };
    const Z = r.constructor.WETTER_ZUG_SEK;
    const zuege = [];
    let bauten = 0;
    let ueber = 0;
    try {
        for (let k = 0; k < 18000; k++) {
            if (k % 300 === 0 && k < 15000) bauten += bauen();
            pm.set(o.x, y(o.x, o.z) + 1.8, o.z);
            const zug = Math.floor(s.spielZeit / Z);
            const w = s.wetterWunsch && s.wetterWunsch.quelle;
            takt();
            if (Math.floor(s.spielZeit / Z) !== zug) zuege.push({ wort: s.weather, quelle: w || null, front: r._wetterAmOrt(pm.x, pm.z, (zug + 1) * Z) });
            if (p.emotions.hope > p.emotionThreshold) ueber++;
        }
    } finally {
        if (o.mutante === "starr") (delete p.emotions.hope, (p.emotions.hope = 0));
        for (const g of s.worldRules) g.disabled = false;
    }
    const g = s.worldRules.find((x) => x.source === "emotion:hope");
    const n = (f) => zuege.filter(f).length;
    return {
        mutante: o.mutante || null, bauten, zuege: zuege.length, sonne: n((z) => z.wort === "sunny"), frontSonne: n((z) => z.front === "sunny"),
        ausGesetz: n((z) => z.quelle === "rule:emotion:hope"), gesetz: g ? { id: g.id, feuer: g.fires } : null, hoffnungS: ueber / 10,
        folge: zuege.map((z) => z.wort[0] + (z.quelle ? "*" : "")).join(""),
    };
}

// DER NEXUS IM ZEITRAFFER (affekt.K3#1), in der Seite der Werkbank: der Spieler steht an der Mess-Wiese im Frieden, der Nexus
// spielt — die Szene treibt seine Evolution je `nexusEvolutionInterval` (24 s; der Takt der Mess-Welt wirft headless nichts,
// `evolveNexus`, ein Treiber ruft `generateEvolution`), alles Weitere ist das Spiel (das Wirk-Tor, `_loopNexusUpdate`, die
// Regeln, ihre Wertung, Erneuerung und Mutation). 30 Spielminuten in 18 000 Takten (Zeitraffer ≈ ×10 an der Wand), o.saat
// versetzt den Strom des Nexus (`bauSame.nexus`). Je 30 s die Nexus-Regeln mit value > 0 und alle, je Drittel gepoolt. o.mutante „gemischt": der Ertrag jedes Feuerns (aus dem EMA-Schritt der echten Wertung
// zurückgerechnet) lernt die Regel mit zufälligem Vorzeichen — gezählt wird dann value > 0 nach dem Wert, den die echte Wertung
// ihr gäbe (`_wahr`); „aus": die Wertung schweigt. Dazu die Taten des Nexus und die Zeilen der Stimme des Felds über sie.
function nexusZeitraffer(r, T, o) {
    const s = r.state;
    const pm = s.playerMesh.position;
    const y = (x, z) => r._voxelSurfaceY(x, z);
    if (s.renderer && s.renderer.setAnimationLoop) s.renderer.setAnimationLoop(null);
    const A = window.__affektAnfang || (window.__affektAnfang = {
        u: window.__gangUhr || performance.now(), sz: s.spielZeit, same: JSON.stringify(s.worldMeta.bauSame || {}),
        regel: s.dsl.nextRuleId, wesen: new Set(s.creatures), werke: new Set(s.architectures),
    });
    let u = A.u;
    s.spielZeit = A.sz;
    s.worldMeta.bauSame = JSON.parse(A.same);
    s.worldMeta.bauSame.nexus = (s.worldMeta.bauSame.nexus || 0) + 1000 * (o.saat || 0);
    s.dsl.nextRuleId = A.regel;
    for (const c of [...s.creatures]) if (!A.wesen.has(c)) r.removeCreature(c);
    Object.assign(s, { lifeField: new Map(), wohlBaseline: new Map(), emotionField: new Map(), taten: [], tatErwartung: new Map() });
    s.weatherEffectTime = 0;
    s.worldRules = [];
    s.nexusEvolutionQueue.length = 0;
    s.dsl.pending = [];
    s.dsl.pendingOutcomes = [];
    s.perfRegulator = false;
    s.nexusWirk = undefined;
    r._stimme = null;
    for (const k in s.player.emotions) s.player.emotions[k] = 0;
    s.player.wohlBaseline = undefined;
    r.setGameMode("frieden");
    let saat = 12345;
    const zufall = () => (saat = (Math.imul(saat, 1664525) + 1013904223) >>> 0) / 4294967296;
    const B = r.constructor.WERTUNG.ruleValueBeta;
    const echt = r._measureRuleReward;
    if (o.mutante === "aus") r._measureRuleReward = (rule) => (rule._vPending = false);
    if (o.mutante === "gemischt")
        r._measureRuleReward = function (rule, now) {
            if (!rule._vPending) return;
            const v = rule.value || 0;
            rule.value = rule._wahr || 0;
            echt.call(this, rule, now);
            const ertrag = (rule._wahr || 0) + (rule.value - (rule._wahr || 0)) / B;
            rule._wahr = rule.value;
            rule.value = v + B * ((zufall() < 0.5 ? -ertrag : ertrag) - v);
        };
    const wert = (x) => (o.mutante === "gemischt" ? x._wahr || 0 : x.value || 0);
    const proben = [];
    let evo = u / 1000;
    try {
        for (let k = 0; k < 18000; k++) {
            pm.set(o.x, y(o.x, o.z) + 1.8, o.z);
            s.nexusLastEvolution = Infinity;
            if (u / 1000 >= evo) (s.nexusEvolutionQueue.push(r.generateEvolution()), (evo = u / 1000 + s.nexusEvolutionInterval));
            r._gameLoopTick((window.__gangUhr = u += 100));
            if (k % 300 === 0) {
                const R = s.worldRules.filter((x) => x && x.source === "nexus");
                proben.push([R.filter((x) => wert(x) > 0).length, R.length]);
            }
        }
    } finally {
        r._measureRuleReward = echt;
    }
    const drittel = (a) => a.reduce(([g, n], [x, y]) => [g + x, n + y], [0, 0]);
    const L = proben.length;
    const taten = s.taten.filter((e) => /^(rule:)*nexus$/.test(String(e.wer)));
    return {
        mutante: o.mutante || null, saat: o.saat || 0, erstes: drittel(proben.slice(0, L / 3)), letztes: drittel(proben.slice((2 * L) / 3)),
        verlauf: proben.map(([g, n]) => g + "/" + n).join(" "), taten: taten.length,
        gesprochen: taten.filter((e) => e.zeile).length,
        zeilen: taten.filter((e) => e.zeile && e.regel != null).map((e) => e.zeile).slice(-2),
    };
}

// Der Lauf (im Spiel-Baum, cwd): EINE Werkbank an der Weiche (`[linse-gpu]` nennt die Karte) an der Mess-Wiese, Port {PORT}+20000;
// das Weltbild ist da und die Bühne steht (der Wetter-Zug und der Nexus warten auf sie: höchstens 9 000 Takte der Seite), dann je Mutante der Lauf
// „art" — „gemuet": echt · starr · gesetz-aus, „nexus": je Saat 0, 1, 2 echt · gemischt · aus. Je Lauf eine Zeile „AFFEKT-<art> {…}", alle in {AUS}.
async function affektLauf() {
    const fs = require("fs");
    const path = require("path");
    const { werkbankTor, werkbankRuf } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const M = require(path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const [aus, port, art, szene] = process.argv.slice(1);
    const W = Number(port) + 20000;
    const erg = { art, laeufe: [] };
    const tor = werkbankTor(W, ["--ort", "wiese"]);
    try {
        await tor.bereit;
        for (const z of tor.log.split(/\r?\n/)) if (/^\[linse-gpu\] /.test(z)) console.log(z);
        const b = await werkbankRuf(W, "/eval", { code: "const da = () => !!r.state._weltbildDa && r._buehneSteht(); for (let i = 0; i < 9000 && !da(); i++) await window.__seitenTakt(); return da();" });
        if (!b || b.ergebnis !== true) throw new Error("die Bühne steht nicht: " + JSON.stringify(b).slice(0, 200));
        const plan = art === "gemuet" ? [null, "starr", "gesetz-aus"].map((m) => [m, 0]) : [0, 1, 2].flatMap((n) => [null, "gemischt", "aus"].map((m) => [m, n]));
        for (const [mutante, saat] of plan) {
            const a = await werkbankRuf(W, "/eval", { code: "return (" + szene + ")(r, T, " + JSON.stringify({ x: M.x, z: M.z, mutante, saat }) + ");" });
            if (!a || a.ergebnis === undefined) throw new Error("eval: " + JSON.stringify(a).slice(0, 300));
            console.log("AFFEKT-" + art + " " + JSON.stringify(a.ergebnis));
            erg.laeufe.push(a.ergebnis);
        }
    } catch (e) {
        erg.fehler = String((e && e.message) || e).split("\n")[0].slice(0, 400);
        console.log("FEHLER " + erg.fehler);
    } finally {
        tor.stop();
    }
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
}

// ───────── DIE SICHTBARE BÖE (vegetation.K2#1; Zweig boe-zeit): EIN Lauf (`boeLauf`) ─────────
// Der Lauf (im Spiel-Baum, cwd): EINE Werkbank an der Weiche (`[linse-gpu]` nennt die Karte) an der Mess-Wiese, Port {PORT}+20000;
// das Auge 1,6 m über dem Spieler-Ort des Messorts blickt zum Blick-Punkt (`wahl` 0: die Kamera steht) und schießt `bild --zeit
// 0,25` — am Kamm und im Tal der Böe in der Mitte des Nah-Felds je zwei Paare in Quadratur der Halm-Phase, je Paar der Rausch-Boden
// derselben Bild-Uhren bei Wind 0. Die Mutante „wind0" legt die Böen-Drift der Welt auf 0 (`_windWob`): ohne Wind MUSS das Urteil
// ROT sein. Die Zeile „BOE-ZEIT {…}" und {AUS} tragen das Maß, die zwei Bilder am Kamm liegen neben {AUS} (`-boe-zeit-0/1.png`).
async function boeLauf() {
    const fs = require("fs");
    const path = require("path");
    const { werkbankRuf } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const M = require(path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const [aus, port, mutante] = process.argv.slice(1);
    const W = Number(port) + 20000;
    // die Welt der Sitzung (punkte.cjs fahreSitzung): ihr Log nennt die Karte; sie startet und endet nie hier
    const tor = { log: fs.readFileSync(process.env.PUNKTE_SITZUNG_LOG, "utf8"), bereit: werkbankRuf(W, "/umstellen", { ort: "wiese" }).then((a) => { if (!a || a.fehler) throw new Error("umstellen --ort wiese: " + JSON.stringify(a).slice(0, 200)); }), stop: () => {} };
    let erg;
    try {
        await tor.bereit;
        for (const z of tor.log.split(/\r?\n/)) if (/^\[linse-gpu\] /.test(z)) console.log(z);
        if (mutante === "wind0") await werkbankRuf(W, "/eval", { code: "r._windWob = () => 0; return 1;" });
        const b = await werkbankRuf(W, "/bild", {
            px: M.x, py: "+1.6", pz: M.z, lx: M.blick.x, ly: "+0", lz: M.blick.z, wahl: 0, zeit: 0.25, datei: aus.replace(/\.json$/, "") + "-boe.png",
        });
        erg = b.zeit ? Object.assign({ abnahme: b.abnahme, mutante: mutante || null }, b.zeit) : { fehler: String(b.fehler || "keine Zeit-Messung").slice(0, 400) };
    } catch (e) {
        erg = { fehler: String((e && e.message) || e).split("\n")[0].slice(0, 400) };
    } finally {
        tor.stop();
    }
    console.log("BOE-ZEIT " + JSON.stringify(erg));
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
}

// ───────── DIE STIMME DES FELDS (affekt.K4#1; Zweig w3s-stimme): EIN Lauf (`stimmeLauf`), die Seite `stimmeGang` ─────────
// DER GANG (in der Seite, Null-Renderer): 30 Spielminuten an der Mess-Wiese im Takt des Spiels (`_gameLoopTick` je 0,1 s
// Spielzeit), das Wetter über das Wort des Spielers (sonnig, nach 10 min „setze wetter frei"), der Nexus wirkt wie im Spiel
// (seine Evolution je `nexusEvolutionInterval` — der Treiber ruft `generateEvolution` wie `evolveNexus` außerhalb der Mess-Welt —,
// seine Gesetze, sein Wirk-Budget), die KI handelt auf vier Worte (ohne Modell: die Antwort steht fest), der Spieler pflegt einmal
// selbst. Die WAHRHEIT hört an der Effekt-Tafel mit (jeder Welt-Akt und das Wetter: Schreiber `ctx.source`, Gesetz, die Bedingung
// des Zweigs, Wort, Programm, der erste Ort und sein Blick in der Kamera, ob die Tat wirkte: neue Wesen, ein geändertes Wetter oder
// Wort oder ein neuer Wunsch), nie am Buch der Stimme; jede Zeile der Dialog-Box steht gegen sie in der Folge der Ereignisse
// (die letzte wirkende Tat der Welt oder KI im Blick vor ihr, die übrigen sind „weitere"): Schreiber beim Namen (ein Gesetz mit
// dem seines Gebers), Ort in Abstand und Richtung, Ursache, Gesetz oder Programm, die Zahl der übrigen. Mutanten: „schreiber"
// (jede Zeile nennt den Nexus), „takt" (die Pause der Stimme fällt).
async function stimmeGang(o) {
    const r = window.anazhRealm;
    const [st, P] = [r.state, Object.getPrototypeOf(r)];
    const pm = st.playerMesh.position;
    pm.set(o.x, r._voxelSurfaceY(o.x, o.z) + 1.8, o.z);
    let t = performance.now();
    const takt = () => (pm.setX(o.x).setZ(o.z), r._gameLoopTick((t += 100)), pm.setX(o.x).setZ(o.z));
    await window.__weltStehtNach(takt);
    window.__buehne();
    st.weatherEffectTime = 0;
    r._setWeather("sunny", "regler");
    [st.taten, st.llm.enabled] = [[], true];
    const t0 = st.spielZeit;
    const [W, Z, tafel, pos, gr, gs, wetter] = [[], [], r.dslEffects, r.dslEvalPos, r.grokRender, r.grokSpeak, () => [st.weather, st.wetterWort, st.wetterWunsch]];
    let [jetzt, art, seq] = [null, null, 0];
    const blick = (x, z) =>
        new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(st.camera.projectionMatrix, st.camera.matrixWorldInverse))
            .containsPoint(new THREE.Vector3(x, r.getTerrainHeightAt(x, z) + 1, z));
    for (const op of [...P.constructor.DSL_WELTAKTE, "weather"]) {
        const f = tafel[op];
        tafel[op] = (a, ctx) => {
            const w = { op, wer: ctx.source, regel: ctx.regel, weil: ctx.weil, grund: ctx.grund, prog: ctx.programId, t: st.spielZeit - t0, n: st.creatures.length, vor: wetter(), aussen: jetzt };
            jetzt = w;
            try {
                const x = f(a, ctx);
                w.ok = op !== "spawn_creature" || st.creatures.length > w.n;
                return x;
            } finally {
                [jetzt, w.seq, w.wunsch] = [w.aussen, ++seq, st.wetterWunsch !== w.vor[2]];
                w.ok = !!w.ok && (op !== "weather" || wetter().some((x, k) => x !== w.vor[k]));
                W.push(w);
            }
        };
    }
    r.dslEvalPos = function (node, ...x) {
        const p = pos.call(this, node, ...x);
        if (jetzt && !jetzt.ort && p) jetzt.ort = { x: p.x, z: p.z, k: node && node[0], blick: blick(p.x, p.z) };
        return p;
    };
    r.grokSpeak = function (k, ...x) {
        const a = art;
        art = "begleiter:" + k;
        try {
            return gs.call(this, k, ...x);
        } finally {
            art = a;
        }
    };
    r.grokRender = function (text) {
        Z.push({ t: st.spielZeit - t0, seq: ++seq, text, art: st.taten.some((e) => e.zeile === text && e.gesprochen === st.spielZeit) ? "stimme" : art });
        return gr.call(this, text);
    };
    if (o.mutante === "schreiber") r._tatSchreiber = () => ({ nom: "Der Nexus", gen: "des Nexus" });
    if (o.mutante === "takt")
        r._feldStimmeTakt = function () {
            if (this._stimme) this._stimme.t = -Infinity;
            return P._feldStimmeTakt.call(this);
        };
    const KI = {
        "pflege den Ort vor mir": ["deposit_life", ["at_player_forward", 15]],
        "ein paar frohe Tiere": ["spawn_creature", ["at_player_forward", 12], 3, "happy"],
        "wann immer hier Leben fehlt, pflege es": ["rule", ["field_below", "lebendig", 1.01], ["deposit_life", ["at_player_forward", 12]], { everySec: 60, ttlSec: 900 }],
        "es soll regnen": ["weather", "rainy"],
    };
    r.llmCall = async (text, _, h) => (h && h.hintergrund ? {} : { say: "Ich tue es.", program: KI[text] });
    const plan = { 2400: "pflege den Ort vor mir", 4800: "pflege das land", 6000: "setze wetter frei", 7200: "ein paar frohe Tiere", 12000: "wann immer hier Leben fehlt, pflege es", 15000: "es soll regnen" };
    for (let i = 0, evo = 0; i <= 18000; i++) {
        if (st.spielZeit - t0 >= evo * st.nexusEvolutionInterval) evo++, st.nexusEvolutionQueue.push(r.generateEvolution());
        if (KI[plan[i]]) (art = "antwort"), await r.maybeAnswerWithLlm(plan[i], () => {}), (art = null);
        else if (plan[i]) r.processChatCommand(plan[i]);
        takt();
    }
    const welt = W.filter((w) => w.ok && /^(rule:)*(nexus|llm:|emotion:|creature:)/.test(w.wer) && (!w.ort || w.ort.blick));
    const RI = ["nördlich", "nordöstlich", "östlich", "südöstlich", "südlich", "südwestlich", "westlich", "nordwestlich"];
    let k = 0;
    const zeilen = Z.filter((z) => z.art === "stimme").map((z) => {
        const seit = welt.slice(k, (k = welt.filter((w) => w.seq < z.seq).length));
        const w = seit[seit.length - 1] || { wer: "keine Tat" };
        const b = w.wer.replace(/^(rule:)+/, "");
        const NAME = { nexus: ["Der Nexus", "des Nexus"], llm: ["Die KI", "der KI"], emotion: [`Die Stimmung „${b.slice(8)}“`, `der Stimmung „${b.slice(8)}“`], creature: [`Das Wesen „${b.slice(9)}“`, `des Wesens „${b.slice(9)}“`] };
        const [nom0, gen] = NAME[b.split(":")[0]] || ["?", "?"];
        const nom = b === w.wer ? nom0 : "Ein Gesetz " + gen;
        const [dx, dz] = w.ort ? [w.ort.x - o.x, w.ort.z - o.z] : [0, 0];
        const d = Math.round(Math.hypot(dx, dz));
        const wo = !w.ort ? " — überall, " : d < 2 ? " — bei dir, " : ` — ${d} m ${RI[Math.round((Math.atan2(dx, -dz) / Math.PI) * 4 + 8) % 8]} von dir, `;
        const weil = [w.regel, w.weil].filter(Boolean).map((x) => r._describeDslCondition(x.cond)).concat(w.weil && !w.weil.ja ? ["nicht gilt, dass"] : []);
        const ursache = w.regel || w.weil ? "weil " : w.grund ? `auf dein Wort „${w.grund}“` : w.ort && w.ort.k === "at_field_need" ? "weil das Feld dort am ärmsten war" : "aus eigenem Antrieb";
        const was = w.op === "weather" && w.wunsch ? `wünscht sich das Wetter „` : "";
        const soll = [nom + " ", was, wo, ...weil, ursache, w.regel ? `(Gesetz Nr. ${w.regel.id} ${gen}` : `(Programm ${w.prog}`, seit.length > 1 ? `dazu ${seit.length - 1} weitere Tat` : ""];
        const falsch = soll.filter((x) => !z.text.includes(x)).concat(seit.length > 1 || !/weitere/.test(z.text) ? [] : ["weitere"]);
        return { t: +z.t.toFixed(1), text: z.text, falsch: z.text.startsWith(nom) ? falsch : [nom, ...falsch] };
    });
    const rest = welt.slice(k);
    const ende = st.spielZeit - t0;
    const n = (re, f) => W.filter((w) => w.ok && re.test(w.wer) && f(w)).length;
    const imBlick = (w) => welt.includes(w);
    return {
        mutante: o.mutante || null,
        minuten: +(ende / 60).toFixed(2),
        zeilen: zeilen.length,
        falschN: zeilen.filter((z) => z.falsch.length).length,
        falsch: zeilen.filter((z) => z.falsch.length).slice(0, 6),
        abstand: zeilen.length > 1 ? Math.min(...zeilen.slice(1).map((z, i) => +(z.t - zeilen[i].t).toFixed(2))) : null,
        offen: rest.length ? +(ende - Math.max(rest[0].t, zeilen.length ? zeilen[zeilen.length - 1].t + 30 : 0)).toFixed(1) : 0,
        ohneTat: Z.filter((z) => !z.art || z.art === "begleiter:dslSay").map((z) => z.text),
        begleiter: Z.filter((z) => /^begleiter:/.test(z.art || "")).length,
        klassen: {
            nexus: n(/^nexus$/, imBlick),
            "rule:nexus": n(/^rule:nexus$/, imBlick),
            llm: n(/^llm:/, imBlick),
            "rule:llm": n(/^rule:llm:/, imBlick),
            wunsch: n(/^(rule:)*nexus$/, (w) => w.op === "weather" && w.wunsch),
            human: n(/^human$/, () => true),
            fern: n(/^(rule:)*(nexus|llm:)/, (w) => w.ort && !w.ort.blick),
        },
        beispiele: zeilen.filter((z, i) => i % 12 === 0).map((z) => "[" + z.t + " s] " + z.text),
    };
}

// DAS URTEIL DES GANGS (rein): die Befunde beim Namen, leer = GRÜN
function stimmeUrteil(g) {
    if (!g || !g.klassen) return ["kein Gang"];
    const leer = Object.keys(g.klassen).filter((k) => !(g.klassen[k] > 0));
    return [
        ...(g.minuten >= 30 ? [] : [g.minuten + " Spielminuten, nicht 30"]),
        ...(g.zeilen > 0 ? [] : ["keine Zeile"]),
        ...(leer.length ? ["keine wirkende Tat von " + leer.join(", ")] : []),
        ...(g.falschN ? [g.falschN + " Zeilen falsch"] : []),
        ...g.falsch.map((z) => "falsch [" + z.t + " s] " + z.falsch.join(" | ") + ": " + z.text),
        ...(g.abstand === null || g.abstand >= 30 - 1e-6 ? [] : ["zwei Zeilen binnen " + g.abstand + " s"]),
        ...(g.offen > 0.5 ? ["eine Tat im Blick wartet " + g.offen + " s über ihre Pause ohne Zeile"] : []),
        ...g.ohneTat.map((x) => "Zeile ohne Tat: „" + x + "“"),
    ];
}

// Der Lauf (im Spiel-Baum, cwd): EINE Null-Seite (Rezept null, der Seiten-Server lauscht frei), die Welt an der Mess-Wiese, dann je
// Mutante (argv: „-" = echt) ein Gang auf frischer Seite. Je Gang eine Zeile „STIMME {…}" mit seinem Urteil, alle in {AUS}.
async function stimmeLauf() {
    const fs = require("fs");
    const path = require("path");
    const { statikServer, nullSeite } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const { AUSGABE_INSTALL } = require(path.resolve("scripts/lib/ausgabe-aufnahme.cjs"));
    const M = require(path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const [aus, mutanten, seite, urteil] = process.argv.slice(1);
    const erg = { laeufe: [] };
    const server = statikServer();
    let browser;
    try {
        await server.lausche(0);
        for (const m of mutanten.split(",")) {
            const s = await nullSeite({ frist: 900000 });
            browser = s.browser;
            await server.zeige(s.page, 60000);
            await s.page.evaluate(() => window.__weltDa((r) => r.state && r.state.rendererReady && r.state.blueprints && r.nexus));
            await s.page.evaluate(AUSGABE_INSTALL);
            const g = await s.page.evaluate("(" + seite + ")(" + JSON.stringify({ x: M.x, z: M.z, mutante: m === "-" ? null : m }) + ")");
            g.rot = eval("(" + urteil + ")")(g);
            console.log("STIMME " + JSON.stringify(g));
            erg.laeufe.push(g);
            await browser.close();
            browser = null;
        }
    } catch (e) {
        erg.fehler = String((e && e.message) || e).split("\n")[0].slice(0, 400);
        console.log("FEHLER " + erg.fehler);
    } finally {
        if (browser) await browser.close();
        server.close();
    }
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
    process.exit(0);
}

// die Zeilen eines Laufs (stdout) als Objekte
const zeilenVon = (lauf, marke) =>
    String(lauf.stdout || "")
        .split(/\r?\n/)
        .filter((z) => z.startsWith(marke + " {"))
        .map((z) => JSON.parse(z.slice(marke.length + 1)));

// ───────── HAAR UND FELL IN DER SOLL-TAFEL (haar.K1#1, haar.K2#1; Zweig haar-fell-soll) ─────────
// EINE Werkbank-Sitzung `--echt` gegen einen eigenen save-server an der Mess-Wiese, 1920×1080; zwei Schüsse der Klasse aus dem
// Ausgabe-Pfad (`werkbank bild --klasse … --ist <id>`), nach jedem das Urteil der EINEN Soll-Tafel (abnahme-urteil
// `sollTafelUrteil`, K5) als Zeile „<NAME> {…}": `strich` (die Kohärenz des Strichs im Inneren der Maske) gegen das Band,
// das die Linse aus der REF rechnet (spec/abnahme/ref-<id>.png), bei haar dazu die Albedo (die Zeile haar der Albedo-Tafel).
// `vorher` stellt die Szene (bash-Zeilen), `schuesse` je Name die Argumente von `werkbank bild` (die Kamera aus `$K`).
// DER FEHLER DES BILDS BEIM NAMEN (w4-stationen-heil): die Antwort der Werkbank liegt neben {AUS} („$B-<n>.txt“); scheitert ein
// Bild, trägt die Zeile „BILD <n> FEHLER …“ ihren `fehler` in die Ausgabe, und der Schuss ist ROT — die Tafel-Zeile danach liest
// sonst die eingecheckte Messung (mensch-kopf trägt eine vom 17.10.), und haar.K2#1 hieß zwei Tage nur „strich ungemessen“, wo
// die Werkbank „Ziel Blickziel nicht im Bild“ und „keine Kopf-Haut am Gelenk head“ sagte.
const bildFehler =
    "fehl() { node -e 'const t = require(\"fs\").readFileSync(process.argv[1], \"utf8\"); let f = null; try { f = JSON.parse(t.slice(t.indexOf(\"{\"))).fehler; } catch (e) {} " +
    "console.log(\"BILD \" + process.argv[2] + \" FEHLER \" + String(f || t.trim().split(\"\\n\").pop() || \"ohne Antwort\").replace(/\\s+/g, \" \").slice(0, 300))' \"$1\" \"$2\"; }";
const sollUrteil = (id, name) =>
    "node -e 'const AU = require(\"./scripts/lib/abnahme-urteil.cjs\"); const u = AU.sollTafelUrteil(require(\"./spec/abnahme/soll-tafel.json\"), " +
    "AU.standLeser(process.cwd()).sollQuelle()); const z = u.zeilen.find((x) => x.id === \"" + id + "\"); console.log(\"" + name + " \" + " +
    "JSON.stringify({ urteil: z.urteil, ist: z.ist, band: z.band, grund: z.grund, taeter: z.taeter, teile: z.teile, stand: z.stand }))'";
// IN DER SITZUNG (29.10.): EIN Teleport an die Wiese, die Szene, zwei Schüsse — Ziel 15 s, Deckel 45 s; `o.mutiert`, wo die Szene
// Tiere räumt oder setzt
function sollKlasseStation(o) {
    return {
        kriterium: o.kriterium,
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { sek: o.sek || 15, ...(o.mutiert ? { mutiert: true } : {}), befehl: [
            "bash",
            "-c",
            [
                "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"",
                "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
                "trap 'git checkout spec/abnahme/soll-tafel.json' EXIT",
                "node scripts/werkbank.cjs fenster 1920 1080 > /dev/null 2>&1",
                "erg() { node -e 'const t = require(\"fs\").readFileSync(0, \"utf8\"); console.log(JSON.stringify(JSON.parse(t.slice(t.indexOf(\"{\"))).ergebnis))'; }",
                bildFehler,
                ...o.vorher,
                ...Object.entries(o.schuesse).flatMap(([n, a]) => [
                    "node scripts/werkbank.cjs bild " + a + " --wahl 0 --klasse '" + o.klasse + "' --ist " + o.id + " --datei \"$B-" + n + ".png\" > \"$B-" + n + ".txt\" 2>&1; e=$?; echo \"BILD " + n + " $e\"; [ $e = 0 ] || fehl \"$B-" + n + ".txt\" " + n,
                    sollUrteil(o.id, n.toUpperCase()),
                ]),
            ].join("\n"),
        ] },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const z = Object.keys(o.schuesse).map((n) => {
                const bild = (new RegExp("^BILD " + n + " (\\d+)\\s*$", "m").exec(lauf.stdout) || [])[1];
                const fehler = (new RegExp("^BILD " + n + " FEHLER (.*)$", "m").exec(lauf.stdout) || [])[1];
                return [n, jsonZeile(lauf.stdout, new RegExp("^" + n.toUpperCase() + " ")), bild === "0", (fehler || "").trim() || (bild == null ? "ohne BILD-Zeile" : "Exit " + bild)];
            });
            return {
                gruen: z.every(([, x, ok]) => ok && x && x.urteil === "GRÜN"),
                zahl: z
                    .map(([n, x, ok, f]) =>
                        n + " " + (!ok ? "ROT Bild: " + f : x ? x.urteil + " strich " + x.ist + " Soll [" + x.band + "]" + (x.grund ? " — " + x.grund : "") + (x.teile ? " · " + x.teile : "") : "ohne Zeile (Exit " + lauf.exit + ")"))
                    .join(" · "),
            };
        },
        // die Ausgabe eines Laufs: beide Bilder und Tafel-Zeilen GRÜN; ein Bild, das scheitert, ist ROT, auch wenn die Tafel-Zeile
        // danach eine eingecheckte grüne Messung liest
        proben: (() => {
            const tafel = (n, u, ist) => n.toUpperCase() + " " + JSON.stringify({ urteil: u, ist, band: [0.3, 0.6], grund: u === "GRÜN" ? null : "strich ungemessen", taeter: null, teile: null, stand: null });
            const lauf = (fehlt) => Object.keys(o.schuesse).flatMap((n) => n === fehlt
                ? ["BILD " + n + " 1", "BILD " + n + " FEHLER ABNAHME ROT [Ziel Blickziel nicht im Bild (ndc [0,0])]", tafel(n, "GRÜN", 0.45)]
                : ["BILD " + n + " 0", tafel(n, "GRÜN", 0.45)]).join("\n");
            return [
                { name: "jedes Bild und jede Tafel-Zeile GRÜN", stdout: lauf(null), gruen: true },
                { name: "ein Bild scheitert, die Tafel liest eine alte grüne Messung", stdout: lauf(Object.keys(o.schuesse)[0]), gruen: false },
            ];
        })(),
        pfad: [
            ...o.pfad,
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "save-server.js",
            "spec/abnahme/soll-tafel.json",
            "spec/abnahme/ref-" + o.id + ".png",
            "scripts/werkbank.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: o.quelle,
    };
}

// DIE PROBE BEWOHNER IN DER SITZUNG (mensch.K1#1 und mensch.K2#2, Zwillinge: EIN Lauf, zwei Urteile): `diag-kreatur-takt --werkbank
// --proben bewohner` (das Start-Dorf wächst, bis jeder Bewohner seinen Leib trägt; der Tag über 24 Spielstunden) und `platz-8.js` (Third
// am Dorfplatz, Uhr 8) mit dem Bild aus dem Ausgabe-Pfad. Die Probe des Spiels trägt ihre Spielstunden fest (headless 446 s, DAUER_S
// der Linse) — über dem Deckel der Sitzung, bis sie im Spiel-Baum kürzt
const BEWOHNER_SITZUNG = { sek: 40, befehl: [
    "bash",
    "-c",
    [
        "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"; SK=\"$(printf %s '{KOORD}' | tr '\\\\' /)/bericht/2210-messschuld-6cfce/skripte\"",
        "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
        "node scripts/diag-kreatur-takt.cjs --werkbank $W --proben bewohner",
        "node scripts/werkbank.cjs eval \"$(cat \"$SK/platz-8.js\")\" > \"$B-platz.txt\"",
        "node \"$SK/b64png.cjs\" \"$B-platz.txt\" \"$B-platz-8uhr-third.png\"",
    ].join("\n"),
] };

// ───────── vegetation.K1 · K5 — DIE WIESE BIS ZUM SAUM, DAS JAHR ALS GESTALT (Zweig w3w-wald) ─────────
// EIN Lauf (`vegetationLauf`, im Spiel-Baum; die Werkbank der Sitzung auf {PORT} + 20000) je Station, `plan` = die Schüsse
// [Ort, Sicht, Uhr, Saison, Was]. „wiese“: die Kamera des Spiels (`umstellen --ort … --sicht …`, 30 Takte `_loopCamera`), die
// Teilung der Wiese mit den FESTEN Ringen der Meisterkarte (`bild --klasse '^(nahWiese:.*|streuSatz|bodenSatz)$' --abstand
// --ringe 2,5,10,20,40` — nie der Radius der gemessenen Welt) und der Zähler an derselben Kamera (`zaehlen --alle`). „krone“: der
// nächste Laubbaum (eiche · birke · buche) 15–80 m um den Spieler, das Auge 14 m vor seinem Fuß zum Spieler hin auf 1,7 m, der
// Blick 6 m über den Fuß, die Maske `^f:(eiche|birke|buche):L[01]$` (die Stufen, die das Auge nah zeichnet; die Karte L2 trägt
// den Laubfall nicht — offen benannt im Zweig). Die Jahreszeit über das Wort des Spielers (`bild --saison`: die Phase springt auf
// die Mitte der Jahreszeit — nie durch Warten); jedes Bild 1920 × 1080 aus dem Ausgabe-Pfad, `--wahl 0`. Die Zeile
// „VEGETATION {…}“ trägt je Schuss das Rohe, die Urteile rechnen daraus.
// DAS BLICKZIEL DER WIESE (w4-stationen-heil) ist, wo der Mittel-Strahl der Kamera des Spiels den GEZEICHNETEN Boden trifft
// (`_bodenSichtAt`, Lehre 22; ohne Karte das Gesetz `_voxelSurfaceY`; trifft er keinen binnen 2 km, der Himmel 100 m voraus) —
// bis dahin lag es 100 m voraus auf dem Strahl: die Third-Kamera blickt auf die Wiese hinab, der Punkt lag im Hang, und die
// Abnahme nannte ihn „verdeckt von Gelände in 14,76 m“ (715754fc Radeon, 73bdf938 GTX), das Bild der Wiese entstand nie. Die
// Pose bleibt die Kamera des Spiels (dieselbe Richtung, `posePasst`). DER STAND: umgestellt wird nur, wenn Ort oder Sicht
// wechseln — ein Schuss am selben Stand (die Jahreszeiten der Krone, die Uhren der Wiese) steht an derselben Pose und zahlt das
// Einschwingen des Orts (Mess-Wiese 41,3 s, Radeon 715754fc) einmal. Jeder Ruf an die Werkbank nennt seine Dauer (SCHRITT):
// endet ein Lauf am Deckel, steht in der Roh-Ausgabe, welcher Schritt ihn trug.
async function vegetationLauf() {
    const fs = require("fs");
    const path = require("path");
    const { werkbankRuf } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    // `zaehlen`: "ohne-budget", wo kein Urteil des Laufs das Budget der Nah-Wiese liest — das Jahr (`jahrUrteil`) liest es nie,
    // vegetation.K1 (`wieseUrteil`) immer
    const [aus, port, plan, zaehlen] = process.argv.slice(1);
    const W = Number(port) + 20000;
    const B = aus.replace(/\.json$/, "");
    const erg = { schuesse: [] };
    const ruf = async (weg, o) => {
        const t0 = Date.now();
        const a = await werkbankRuf(W, weg, o);
        console.log("SCHRITT " + weg + " " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
        if (!a || a.fehler) throw new Error(weg + ": " + JSON.stringify(a).slice(0, 300));
        return a;
    };
    const SPIEL =
        "const s = r.state; for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100); const c = s.camera, d = new T.Vector3(); c.getWorldDirection(d); const p = c.position; " +
        "const unter = (t) => { const x = p.x + d.x * t, z = p.z + d.z * t, b = r._bodenSichtAt(x, z), y = b == null ? r._voxelSurfaceY(x, z) : b; return y != null && p.y + d.y * t <= y; }; " +
        "let a = 0, t = 0.5; while (t < 2000 && !unter(t)) { a = t; t += Math.max(0.25, t * 0.01); } " +
        "if (t < 2000) { for (let k = 0; k < 24; k++) { const m = (a + t) / 2; if (unter(m)) t = m; else a = m; } } else t = 100; " +
        "return [p.x, p.y, p.z, p.x + d.x * t, p.y + d.y * t, p.z + d.z * t].map((v) => +v.toFixed(3));";
    const KRONE = "const p = r.state.playerMesh.position; let e0 = null, d0 = Infinity; for (const e of r.state.architectures) { if (!e || !e.position || !/^(eiche|birke|buche)$/.test(r._foundryPresetForEntry(e) || \"\")) continue; const d = Math.hypot(e.position.x - p.x, e.position.z - p.z); if (d >= 15 && d <= 80 && d < d0) [e0, d0] = [e, d]; } if (!e0) return \"kein Laubbaum 15–80 m um den Spieler\"; const q = e0.position, x = q.x + ((p.x - q.x) / d0) * 14, z = q.z + ((p.z - q.z) / d0) * 14; return [x, r._voxelSurfaceY(x, z) + 1.7, z, q.x, q.y + 6, q.z].map((v) => +v.toFixed(3));";
    for (const z of fs.readFileSync(process.env.PUNKTE_SITZUNG_LOG, "utf8").split(/\r?\n/)) if (/^\[linse-gpu\] /.test(z)) console.log(z);
    try {
        await ruf("/fenster", { w: 1920, h: 1080 });
        let stand = null;
        for (const [ort, sicht, uhr, saison, was] of JSON.parse(plan)) {
            const n = [ort, sicht, uhr, saison, was].join("-");
            if (stand !== ort + "|" + sicht) await ruf("/umstellen", { ort, sicht });
            stand = ort + "|" + sicht;
            const k = (await ruf("/eval", { code: was === "krone" ? KRONE : SPIEL })).ergebnis;
            if (!Array.isArray(k)) throw new Error(n + ": " + JSON.stringify(k));
            const [px, py, pz, lx, ly, lz] = k;
            const wiese = was === "wiese";
            const datei = B + "-" + n + ".png";
            const b = await ruf("/bild", {
                px, py, pz, lx, ly, lz, w: 1920, h: 1080, wahl: 0, uhr, saison: saison || undefined, datei, abstand: wiese, ringe: wiese ? "2,5,10,20,40" : undefined,
                klasse: wiese ? "^(nahWiese:.*|streuSatz|bodenSatz)$" : "^f:(eiche|birke|buche):L[01]$",
            });
            const ab = JSON.parse(fs.readFileSync(datei.replace(/\.png$/, ".abnahme.json"), "utf8"));
            const kl = b.klasse || {};
            const sch = { n, was, kamera: k, pose: ab.pose, leinwand: [ab.bild.w, ab.bild.h], ok: ab.ok, zeile: String(ab.zeile || "").slice(0, 300), pixel: Object.values(kl.klassen || {}).reduce((q, v) => q + (v.pixel || 0), 0) };
            if (wiese) {
                const a = kl.abstand;
                Object.assign(sch, { baender: a.baender, cos: a.cos, klassen: a.klassen, farbton: a.farbton.kacheln });
                if (zaehlen !== "ohne-budget") {
                    const zl = (await ruf("/zaehlen", { px, py, pz, lx, ly, lz, alle: true })).klassen.filter((x) => /^nahWiese:L[12]$/.test(x.klasse));
                    sch.budget = [zl.reduce((q, x) => q + ((x.je || {}).haupt || 0), 0), zl.reduce((q, x) => q + ((x.jeTris || {}).haupt || 0), 0)];
                }
            }
            erg.schuesse.push(sch);
        }
    } catch (e) {
        erg.fehler = String((e && e.message) || e).split("\n")[0].slice(0, 400);
    }
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
    console.log("VEGETATION " + JSON.stringify(erg));
}
// DIE RINGE EINES WIESEN-SCHUSSES: je fester Ring (die Bänder 2–5 · 5–10 · 10–20 · 20–40 m) der wirksame Blatt-Flächen-Index wie
// abnahme-urteil `laiWirk` (Nilson: P = Grund / (Halm + Grund), LAI = −ln P · cos θ / G, G 0,5; Halm = nahWiese + streuSatz, Grund =
// bodenSatz). Ein Ring mit Halmen und OHNE Grund-Pixel ist geschlossen („satt“): die Lücke 0 misst Nilson nur als untere Schranke
// (−ln(0,5/n) · cos θ / G, unter flachem Blick klein) — er zählt als dicht; sein Sprung zum Nachbarn ist ungemessen, den Nachbarn
// hält dort sein eigenes LAI ≥ 1,7.
const wieseRinge = (s) =>
    s.baender.slice(1, -1).map((von, i) => {
        let h = 0, g = 0; // prettier-ignore
        for (const [n, z] of Object.entries(s.klassen || {}))
            if (/^(nahWiese:.*|streuSatz)$/.test(n)) h += z[i + 1] || 0;
            else if (n === "bodenSatz") g += z[i + 1] || 0;
        const lai = h + g && s.cos[i + 1] > 0 ? (-Math.log(Math.max(g, 0.5) / (h + g)) * s.cos[i + 1]) / 0.5 : null;
        return { ring: von + "–" + s.baender[i + 2], h, g, lai, satt: h > 0 && g === 0 };
    });
// die Farbton-Streuung 2–5 m wie abnahme-urteil `farbtonStreuung` (σh je 2-m-Kachel ab 400 Proben, gewichtet nach Proben)
const wieseFarbton = (s) => {
    const ks = (s.farbton || []).filter((k) => k[1] >= 400);
    const sig = (k) => (Math.sqrt(-2 * Math.log(Math.max(1e-9, Math.min(1, k[4] ? Math.hypot(k[2], k[3]) / k[4] : 1)))) * 180) / Math.PI;
    const n = ks.reduce((a, k) => a + k[1], 0);
    return n ? ks.reduce((a, k) => a + sig(k) * k[1], 0) / n : null;
};
// die Pose des Schusses ist die Kamera, die der Lauf rechnete — Ort UND Blick (die Blick-Wahl verschiebt sie nie, `--wahl 0`)
const posePasst = (s) => {
    const [pk, pb] = [(s.pose && s.pose.kamera) || [], (s.pose && s.pose.blick) || []];
    const d = Math.hypot(s.kamera[3] - s.kamera[0], s.kamera[4] - s.kamera[1], s.kamera[5] - s.kamera[2]) || 1;
    return pk.length === 3 && pb.length === 3 && [0, 1, 2].every((i) => Math.abs(s.kamera[i] - pk[i]) <= 0.05 && Math.abs((s.kamera[i + 3] - s.kamera[i]) / d - pb[i]) <= 0.01);
};
// das Urteil eines Wiesen-Schusses (K1): jeder feste Ring LAI ≥ 1,7 (oder satt), der Sprung zwischen Nachbar-Ringen ≤ 15 % des
// inneren, die Farbton-Streuung 2–5 m ≥ 10,7°, nahWiese im Haupt-Pass ≤ 4 Befehle / 80k Dreiecke (spec/profiband/haushalt.json),
// die Pose = die Kamera des Spiels, 1920 × 1080, die Abnahme des Bilds ok
function wieseUrteil(s) {
    const R = wieseRinge(s);
    const ft = wieseFarbton(s);
    const dicht = R.every((x) => x.satt || (x.lai != null && x.lai >= 1.7));
    const saum = R.slice(1).every((x, i) => x.satt || R[i].satt || (x.lai != null && R[i].lai > 0 && Math.abs(x.lai - R[i].lai) / R[i].lai <= 0.15));
    const budget = !!s.budget && s.budget[0] <= 4 && s.budget[1] <= 80000;
    const bild = s.leinwand[0] === 1920 && s.leinwand[1] === 1080 && s.ok === true && posePasst(s);
    return {
        gruen: dicht && saum && ft != null && ft >= 10.7 && budget && bild,
        zahl:
            s.n + ": LAI " + R.map((x) => x.ring + " " + (x.satt ? "satt" : x.lai == null ? "—" : x.lai.toFixed(2))).join(" · ") + (saum ? "" : " (Saum springt > 15 %)") +
            ", Farbton 2–5 m " + (ft == null ? "ungemessen" : ft.toFixed(2) + "°") + ", nahWiese " + (s.budget ? s.budget[0] + " Befehle / " + s.budget[1] + " Dreiecke" : "ungezählt") +
            (bild ? "" : ", Bild/Pose WEICHT AB (" + s.leinwand.join("×") + ", ok " + s.ok + ", Pose " + posePasst(s) + ")"),
    };
}
// das Rohe der Zeile (stdout, so urteilt auch die Probe des Selbsttests) oder {AUS}
const vegetationRoh = (j, lauf) => jsonZeile(lauf.stdout, /^VEGETATION /) || j;
// DER DECKEL EINES VEGETATIONS-LAUFS aus seinem Plan (w4-stationen-heil, in Sitzungsform w4-sitzung-reif) — die Arbeit, einmal (DIE
// DECKEL der Fahrt: der gemessene Lauf, punkte.cjs): den Ort des ersten Stands stellt die Sitzung VOR dem Deckel (punkte.cjs `probeOrt`
// liest ihn aus dem Plan), er schwingt dort warm ein; ein Stand am selben Ort (eine andere Sicht, der Teleport in den gebauten Ring)
// 5 s, ein Stand an einem anderen Ort 15 s (der Ort der Sitzung: Mess-Wiese 9,2–13,6 s, Genesis 9,5–10,2 s, Radeon eich5/eich6), je
// Schuss 10 s (die Krone im Sommer 10 s, Radeon 715754fc; die Wiese mit Ringen und Zähler ungemessen, ihr Bild ist das der Krone —
// die SCHRITT-Zeilen der Fahrt messen sie). w4-stationen-heil rechnete doppelt und mit dem kalten Ort je Stand (41,3 s, eigener Boot):
// 150/840/210/450 s — über dem Gesetz der Fahrt (≤ 45 s, mit Ausnahme ≤ 90 s). Ein Plan über 90 s ist keine Probe (vegetation.K1#2
// steht in `fehlt`).
const vegetationDeckel = (plan) => {
    let s = 0;
    plan.forEach((p, i) => {
        if (i && p[0] !== plan[i - 1][0]) s += 15;
        else if (!i || p[1] !== plan[i - 1][1]) s += 5;
        s += 10;
    });
    return Math.ceil(s / 5) * 5;
};
// die Ausnahme eines Plans über 45 s beim Namen seiner Arbeit; `zaehlen` "ohne-budget", wo kein Urteil das Budget der Nah-Wiese liest
const vegetationProbe = (plan, zaehlen = "") => {
    const sek = vegetationDeckel(plan);
    const n = (was) => plan.filter((p) => p[4] === was).length;
    return { sek, ...(sek > 45 ? { ausnahme: n("krone") + " Schüsse der Krone und " + n("wiese") + " der Wiese je 10 s an einem Stand — die Arbeit des Plans, nie das Einschwingen" } : {}),
        befehl: ["node", "-e", "(" + knapp(vegetationLauf) + ")()", "{AUS}", "{PORT}", JSON.stringify(plan), ...(zaehlen ? [zaehlen] : [])] };
};
const wieseStation = (staffel, posen, quelle) => ({
    kriterium: "vegetation.K1",
    staffel,
    geraet: ["radeon", "gtx"],
    probe: vegetationProbe(posen.map((p) => [...p, null, "wiese"])),
    gpu: true,
    zeit: false,
    minuten: staffel === 1 ? 2 : 6,
    urteil: (j, lauf) => {
        const e = vegetationRoh(j, lauf);
        if (!e || e.fehler || !Array.isArray(e.schuesse) || e.schuesse.length !== posen.length)
            return { gruen: false, zahl: "ohne alle Schüsse: " + ((e && e.fehler) || "kein VEGETATION (Exit " + lauf.exit + ")") };
        const u = e.schuesse.map(wieseUrteil);
        return { gruen: u.every((x) => x.gruen), zahl: u.map((x) => x.zahl).join(" | ") };
    },
    proben: wieseProben(posen),
    pfad: VEGETATION_PFAD,
    quelle,
});
// die Schlupflöcher als Mutanten (der Selbsttest urteilt jede): eine Wiese, die bis 40 m dicht steht, ist GRÜN; ein dünner Ring
// 5–10 m, ein Saum, der bei 20 m abreißt, ein Budget über 4 Befehle, eine verschobene Pose und ein fehlender Schuss sind ROT
function wieseProben(posen) {
    const ring = (h, g) => ({ "nahWiese:L1:0:0": [9, h, h, h, h], bodenSatz: [9, g[0], g[1], g[2], g[3]] });
    const schuss = (o) => ({ n: "probe", was: "wiese", kamera: [0, 1.7, 0, 100, 1.7, 0], pose: { kamera: [0, 1.7, 0], blick: [1, 0, 0] }, leinwand: [1920, 1080], ok: true, baender: [0, 2, 5, 10, 20, 40], cos: [0.9, 0.5, 0.3, 0.15, 0.08], klassen: ring(20000, [400, 0, 0, 0]), farbton: [["0,0", 800, 0.6, 0.55, 1]], budget: [4, 52000], ...o }); // prettier-ignore
    const zeile = (o, n = posen.length) => "VEGETATION " + JSON.stringify({ schuesse: Array.from({ length: n }, () => schuss(o)) });
    return [
        { name: "dicht bis 40 m", stdout: zeile({}), gruen: true },
        { name: "Ring 5–10 m dünn", stdout: zeile({ klassen: ring(20000, [400, 8000, 0, 0]) }), gruen: false },
        { name: "Saum reißt bei 20 m", stdout: zeile({ klassen: ring(20000, [400, 0, 0, 15000]) }), gruen: false },
        { name: "Saum springt 19 %", stdout: zeile({ klassen: ring(20000, [400, 100, 0, 0]) }), gruen: false },
        { name: "5 Befehle", stdout: zeile({ budget: [5, 52000] }), gruen: false },
        { name: "Pose verschoben", stdout: zeile({ kamera: [0.5, 1.7, 0, 100, 1.7, 0] }), gruen: false },
        { name: "ein Schuss fehlt", stdout: zeile({}, posen.length - 1), gruen: false },
    ];
}
// das Jahr (K5): je Saison die Pixel der Laub-Maske an DERSELBEN Pose; Winter ≤ 0,3 × Sommer, der Frühling dazwischen (der
// Austrieb); die Wiese (Staffel 2): der LAI 2–10 m (Pixel-Mittel der Ringe 2–5 und 5–10 m) im Winter ≤ 0,5 × Sommer, der Frühling
// dazwischen. Ohne Krone im Bild (< 2 000 Pixel im Sommer) misst der Schuss nichts: ROT.
function jahrUrteil(e, zeiten) {
    const je = (was) => Object.fromEntries(e.schuesse.filter((s) => s.was === was).map((s) => [s.n.split("-")[3], s]));
    const [k, w] = [je("krone"), je("wiese")];
    const lai = (s) => {
        const R = wieseRinge(s).slice(0, 2).filter((x) => x.lai != null);
        const n = R.reduce((a, x) => a + x.h + x.g, 0);
        return n ? R.reduce((a, x) => a + x.lai * (x.h + x.g), 0) / n : null;
    };
    const L = Object.fromEntries(Object.entries(w).map(([z, s]) => [z, lai(s)]));
    const P = Object.fromEntries(Object.entries(k).map(([z, s]) => [z, s.pixel]));
    const bild = Object.values({ ...k, ...w }).every((s) => s.ok === true && posePasst(s) && s.leinwand[0] === 1920) && Object.values(k).every((s) => JSON.stringify(s.kamera) === JSON.stringify(k.sommer && k.sommer.kamera));
    const krone = P.sommer >= 2000 && P.winter <= 0.3 * P.sommer && (!zeiten.includes("fruehling") || (P.fruehling > P.winter && P.fruehling < P.sommer));
    const wiese = !w.sommer || (L.sommer > 0 && L.winter <= 0.5 * L.sommer && L.fruehling > L.winter && L.fruehling < L.sommer);
    const f = (x, n = 0) => (x == null ? "—" : Number(x).toFixed(n));
    return {
        gruen: bild && krone && wiese && Object.keys(k).length === zeiten.length,
        zahl:
            "Krone " + zeiten.map((z) => z + " " + f(P[z]) + " px").join(" · ") + " → Winter " + (P.sommer ? f(P.winter / P.sommer, 3) : "—") + " × Sommer" +
            (w.sommer ? ", Wiese LAI 2–10 m " + zeiten.map((z) => z + " " + f(L[z], 2)).join(" · ") + " → Winter " + (L.sommer ? f(L.winter / L.sommer, 3) : "—") + " × Sommer" : "") +
            (bild ? "" : ", Bild/Pose WEICHT AB"),
    };
}
// die Schlupflöcher des Jahrs als Mutanten: ein Laubfall auf 0,15 und eine Wiese auf 0,3 ihres Sommers sind GRÜN; ein Winter, der
// nur färbt (die Krone deckt 0,9), ein Frühling ohne Austrieb, eine Wiese, die im Winter steht, und ein Schuss an anderer Pose ROT.
// Die Zeile trägt den ganzen Lauf (`lauf`; die Zwillinge der Sitzung: Staffel 1 urteilt ihre Schüsse aus dem Lauf der Staffel 2), die
// Mutanten treffen, was die Station urteilt (`eigen`); fällt der Lauf nach den Kronen von Sommer und Winter, hält, wer nur sie urteilt
function jahrProben(lauf, eigen) {
    const px = { sommer: 40000, winter: 6000, fruehling: 30000 };
    const ring = (g) => ({ "nahWiese:L1:0:0": [0, 20000, 20000, 0, 0], bodenSatz: [0, g, g, 0, 0] });
    const lg = { sommer: 400, winter: 9000, fruehling: 2500 };
    const schuss = ([, , , z, was], o = {}) => ({ n: "wiese-ego-0.5-" + z + "-" + was, was, kamera: [0, 1.7, 0, 100, 1.7, 0], pose: { kamera: [0, 1.7, 0], blick: [1, 0, 0] }, leinwand: [1920, 1080], ok: true, pixel: px[z], baender: [0, 2, 5, 10, 20, 40], cos: [0.9, 0.5, 0.3, 0.15, 0.08], klassen: ring(lg[z]), ...((o[was] || {})[z] || {}) }); // prettier-ignore
    const zeile = (o, L = lauf, fehler) => "VEGETATION " + JSON.stringify({ schuesse: L.map((p) => schuss(p, o)), ...(fehler ? { fehler } : {}) });
    const mit = [
        { name: "Laub und Wiese fallen", o: {}, gruen: true },
        { name: "der Winter färbt nur", o: { krone: { winter: { pixel: 36000 } } }, gruen: false },
        { name: "die Wiese steht im Winter", o: { wiese: { winter: { klassen: ring(500) } } }, gruen: false },
        { name: "der Winter an anderer Pose", o: { krone: { winter: { kamera: [3, 1.7, 0, 103, 1.7, 0], pose: { kamera: [3, 1.7, 0], blick: [1, 0, 0] } } } }, gruen: false },
    ];
    if (eigen.some((p) => p[3] === "fruehling")) mit.push({ name: "kein Austrieb", o: { krone: { fruehling: { pixel: 5000 } } }, gruen: false });
    const zwei = lauf.slice(0, 2), nurZwei = eigen.every((p) => zwei.includes(p));
    return [
        ...mit.filter((m) => eigen.some((p) => p[4] === "wiese") || !m.o.wiese).map((m) => ({ name: m.name, stdout: zeile(m.o), gruen: m.gruen })),
        { name: "der Lauf fiel nach den Kronen von Sommer und Winter", stdout: zeile({}, zwei, "/bild: ABNAHME ROT [Ziel Blickziel nicht im Bild]"), gruen: nurZwei },
    ];
}
// der Lauf des Jahrs: die Kronen in Sommer, Winter, Frühling, dann die Wiese — am EINEN Stand (Mess-Wiese, Ego, Mittag)
const JAHR_LAUF = ["krone", "wiese"].flatMap((was) => ["sommer", "winter", "fruehling"].map((z) => ["wiese", "ego", 0.5, z, was]));
// `lauf` der Plan der Probe (die Zwillinge fahren ihn EINMAL), `eigen` die Schüsse, die diese Station urteilt
const jahrStation =(staffel, lauf, eigen, zeiten, quelle) => ({
    kriterium: "vegetation.K5",
    staffel,
    geraet: ["radeon", "gtx"],
    probe: vegetationProbe(lauf, "ohne-budget"),
    gpu: true,
    zeit: false,
    minuten: staffel === 1 ? 2 : 6,
    urteil: (j, l) => {
        const e = vegetationRoh(j, l);
        const da = e && Array.isArray(e.schuesse) ? e.schuesse.filter((s) => eigen.some((p) => p.join("-") === s.n)) : [];
        if (!e || da.length !== eigen.length)
            return { gruen: false, zahl: "ohne alle Schüsse: " + ((e && e.fehler) || "kein VEGETATION (Exit " + l.exit + ")") };
        const u = jahrUrteil({ schuesse: da }, zeiten);
        return e.fehler ? { gruen: u.gruen, zahl: u.zahl + " · der Lauf danach: " + String(e.fehler).slice(0, 160) } : u;
    },
    proben: jahrProben(lauf, eigen),
    pfad: VEGETATION_PFAD,
    quelle,
});
// R6 der Vegetation: die Gestalt (Stamm Vegetation · Stoff · Bild · Studio), die Gesetzbücher (Saison und Gras im foundry-core,
// Blatt-Atlas im phyto-core), die Werkbank und ihre Linsen-Hilfen, der Haushalt des Budgets
const VEGETATION_PFAD = [
    "stamm/vegetation-*.js",
    "stamm/stoff-*.js",
    "stamm/bild-*.js",
    "stamm/dirigent-*.js",
    "stamm/studio-*.js",
    "stamm/daten.js",
    "foundry-core.js",
    "phyto-core.js",
    "index.html",
    "spec/profiband/haushalt.json",
    "scripts/werkbank.cjs",
    "scripts/lib/abnahme-urteil.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/draw-zaehler.cjs",
    "scripts/lib/software-gpu.cjs",
    "scripts/lib/welt-boot.cjs",
];

const stationen = [
    {
        kriterium: "mensch.K3",
        staffel: 1,
        geraet: "headless",
        // die Wege der Bewohner im Start-Dorf am echten Kreatur-Takt (Kontakt-Mechanik, Null-Renderer, R3; Präzedenz Siedlung K1)
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "bewohner"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = jsonZeile(lauf.stdout, /^\s*(✅|❌) bewohner\s/);
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const w = z.wege || {};
            const gruen = w.wandN === 0 && w.durch > 0 && w.tuer === w.durch && z.huellen === z.haeuser && z.haeuser > 0;
            return {
                gruen,
                zahl:
                    "Durchdringung " + w.wandN + ", Tür " + w.tuer + "/" + w.durch + ", Hüllen " + z.huellen + "/" +
                    z.haeuser + ", Gangzeit auf Wegen " + w.aufWeg,
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = 0 Durchdringung und Eintritt zu 100 % über die Tür im Start-Dorf",
    },
    {
        kriterium: "mensch.K3",
        staffel: 2,
        geraet: "headless",
        // die Wege einer Stadt am echten Kreatur-Takt (Null-Renderer, R3): am Messort `stadt` des Profi-Bands
        // (spec/profiband/haushalt.json) gründet die Probe bewohner das Wort des Spielers mit 30 Häusern (nH ≥ 27), 24
        // Spielstunden mit der Uhr des Spiels; je Takt jeder Leib als Kapsel — Steckenbleiber (ein Ziel, < 1 m in 5
        // Spielminuten), Gangzeit auf Wegen, Weg je Bewohner, Berührung zweier Kapseln, Durchdringung und Tür wie Staffel 1
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "bewohner"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "bewohner");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner (Exit " + lauf.exit + ")" };
            const st = z.stadt || {};
            const w = st.wege;
            if (z.fehler || st.fehler || !w) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || st.fehler || "keine Stadt") };
            const gruen =
                st.haeuser >= 27 &&
                w.steckenN === 0 &&
                w.aufWeg >= 0.85 &&
                w.kurzN === 0 &&
                w.streckeMin >= 100 &&
                w.beruehrN === 0 &&
                w.wandN === 0 &&
                w.durch > 0 &&
                w.tuer === w.durch;
            return {
                gruen,
                zahl:
                    "Stadt " + st.haeuser + " Häuser: Steckenbleiber " + w.steckenN + ", Gangzeit auf Wegen " + w.aufWeg +
                    ", Strecke min " + w.streckeMin + " m, Berührung " + w.beruehrN + ", Durchdringung " + w.wandN +
                    ", Tür " + w.tuer + "/" + w.durch,
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
            "spec/profiband/haushalt.json",
        ],
        quelle:
            "2 = 24 h ohne Steckenbleiber in einer Stadt, Gangzeit auf Wegen ≥ 0,85, ≥ 100 m Weg je Bewohner und Tag, Ausweichen ohne Berührung",
    },
    {
        kriterium: "mensch.K2",
        staffel: 1,
        geraet: "headless",
        // der Tag der Bewohner im Zeitraffer der Spieler-Uhr (`_uhrSetzen`, 24 Spielstunden) am echten Bewohner-Takt — die
        // Tagesablauf-Mechanik (R3), gemessen wie M32 headless (bericht/2210-messschuld-6cfce.md § M32 K2). Strenger als die
        // Staffel: jeder Bewohner ≥ 0,9 (trefferMin, das Soll der Linse); das Schlupfloch Teleport fällt an sprungN, der
        // Plan muss bei gleichem Samen bit-gleich sein.
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "bewohner"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "bewohner");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const gruen =
                z.planGleich === true &&
                z.leiber > 0 &&
                typeof z.trefferMin === "number" &&
                z.trefferMin >= 0.9 &&
                sprungVon(z) === 0;
            return {
                gruen,
                zahl:
                    "Soll-Orte über 24 Spielstunden min " + z.trefferMin + " (" + (z.leiber - z.unterN) + "/" +
                    z.leiber + " ≥ 0,9), Plan bit-gleich " + z.planGleich + ", Schmiede 10/2 Uhr " + z.schmiede10 +
                    "/" + z.schmiede2 + ", Sprünge " + sprungVon(z),
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/bild-himmel.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = ein Bewohner trifft ≥ 0,9 seiner Soll-Orte über 24 Spielstunden",
    },
    {
        kriterium: "tiere.K1",
        staffel: 1,
        geraet: "headless",
        // (a) Kohäsion des Verbands am ECHTEN Wurf (`_kreaturWurf`, scheue Hirsche) wandernd und fliehend — Verband ist Mechanik
        // (R3: der Null-Renderer beweist Gesetz, Kontakt, Verband); die Probe herde der Kreatur-Linse (Q11), wie S6 (475a446a)
        // „bei jedem Push". Soll aus `messung`: wandernd ≥ 0,9, auf der Flucht ≥ 0,8; das Schlupfloch (klebende Glieder,
        // vakuöse Probe) fällt an Gliedern ≥ 3, Fluchtanteil ≥ 0,1, wandernd 0 Flucht.
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "herde"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "herde");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe herde (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const V = z.verband || {};
            const W = V.wander || {};
            const F = V.flucht || {};
            const echt = Math.min(W.n, F.n) >= 3 && F.fluchtAnteil >= 0.1 && W.fluchtAnteil === 0;
            const gruen = echt && W.mittel >= 0.9 && F.fluchtMittel !== null && F.fluchtMittel >= 0.8;
            return {
                gruen,
                zahl:
                    "Kohäsion wandernd " + W.mittel + " (" + W.n + " Glieder), fliehend " + F.fluchtMittel + " (min " +
                    F.fluchtMin + ", in Flucht " + F.fluchtAnteil + ")",
            };
        },
        pfad: [
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "tetrapoda-core.js",
            "gelaende-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = (a) Kohäsion an einem Gerät",
    },
    // ───────── tiere.K1 Staffel 2 — der Verband ganz (Zweig tiere-k1-s2, tetrapoda fluchtRadius: fernstes Glied + FURCHT_GESETZ.fluchtWegJeRadius Radien) ─────────
    // (a)–(d) der Probe herde am echten Kreatur-Takt, AUF DER KARTE (die Werkbank headless an der Weiche, `diag-kreatur-takt
    // --werkbank`; Port {PORT}+20000): (a) Kohäsion wandernd ≥ 0,9, fliehend ≥ 0,8; (b) Φ = |Σv̂|/N der laufenden Glieder (ab 1 m/s)
    // ≥ 0,8 über ≥ 60 Flucht-Takte; (c) der letzte Flüchter läuft ≤ 1,0 s nach dem ersten, ≥ 1 Glied aus zweiter Hand; (d) 600 s
    // neben einem fremden Verband derselben Art, beide fliehen ≥ 3 s, die Glieder des Gesetzes bleiben dieselben Leiber;
    // Schlupfloch: Glieder ≥ 3, Fluchtanteil ≥ 0,1, Fluchtweg je Glied ≥ 30 m. Dazu die Bild-Serie „Herde am Hang" in derselben
    // Werkbank (`herdeHang` oben): drei Ego-Schüsse aus dem Ausgabe-Pfad, der erste 40–50 m vom Auge zum Mittel der Herde, je
    // Schuss flieht die Herde (jedes Glied in Flucht), die Abnahme des Bilds hält, und sie steht als EIN Pulk im Bild (jedes
    // lebende Glied ≥ 20 Tier-Pixel in seinem Kreis, die Tier-Pixel EIN Fleck über einen Leib).
    {
        kriterium: "tiere.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // DAS BUDGET DER SITZUNG (29.10.): die Probe herde läuft ihre Spiel-Sekunden am Kreatur-Takt (headless 37 s, DAUER_S der
        // Linse), dazu drei Schüsse — die Herde bleibt in der Welt (mutiert)
        probe: { sek: 33, befehl: [
            "node",
            "-e",
            "(" + knapp(herdeHang) + ")()",
            "{AUS}",
            "{PORT}",
            knapp(herdeSzene),
            knapp(herdePulk),
        ],  mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "herde");
            if (!z || z.fehler || !z.alarm || !z.id)
                return { gruen: false, zahl: "keine Zeile (a)–(d) der Probe herde (Exit " + lauf.exit + (z && z.fehler ? ": " + z.fehler : "") + ")" };
            const { wander: W, flucht: F } = z.verband;
            const [R, K, I] = [z.ausrichtung, z.alarm, z.id];
            const echt = Math.min(W.n, F.n, z.fremdN, ...I.fluchtS) >= 3 && F.fluchtAnteil >= 0.1 && W.fluchtAnteil === 0 && K.zweiteHand >= 1;
            const ad =
                echt && W.mittel >= 0.9 && F.fluchtMittel >= 0.8 && R.takte >= 60 && R.mittel >= 0.8 && K.letzterS !== null &&
                K.letzterS <= 1 && z.fluchtWegM >= 30 && !I.bruch;
            const S = (j && j.serie) || [];
            const sz = (j && j.szene) || {};
            const schuss = (x) =>
                !x.fehler && !!x.pulk && !x.pulk.fehler && x.glieder >= 3 && x.fliehen === x.glieder && x.pulk.glieder === x.glieder &&
                x.pulk.sichtbar === x.pulk.glieder && x.pulk.flecken === 1;
            const bild = S.length === 3 && S[0].abstand >= 40 && S[0].abstand <= 50 && S.every(schuss);
            const serie = !j
                ? "ohne Ergebnis in {AUS}"
                : j.fehler || sz.fehler
                  ? "ROT: " + (j.fehler || sz.fehler)
                  : (bild ? "GRÜN" : "ROT") + " am Hang " + (sz.hang ? sz.hang.neigung + "° " + sz.hang.x + "/" + sz.hang.z : "?") + ", Flucht bei " + sz.fluchtBei +
                    " m: " + S.map((x) => x.abstand + " m " + x.fliehen + "/" + x.glieder + " fliehen" + (x.pulk ? ", " + x.pulk.sichtbar + " sichtbar, " + x.pulk.flecken +
                    " Fleck(en) (" + x.pulk.pixel + " px)" : "") + (x.fehler ? " " + x.fehler : "")).join(" · ");
            return {
                gruen: ad && bild,
                zahl:
                    "(a)–(d) auf der Karte " + (ad ? "GRÜN" : "ROT") + ": Kohäsion " + W.mittel + " / " + F.fluchtMittel + ", Φ " + R.mittel +
                    " über " + R.takte + " Takte, letzter Flüchter " + K.letzterS + " s (" + K.zweiteHand + " aus zweiter Hand), Fluchtweg " +
                    z.fluchtWegM + " m, ID 600 s " + (I.bruch ? "bricht nach " + I.bruch[0] + " s" : "hält") + " (Flucht " + I.fluchtS.join(" / ") +
                    " s) · Bild-Serie „Herde am Hang“ " + serie,
            };
        },
        pfad: [
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/vegetation-*.js",
            "stamm/gelaende-boden.js",
            "stamm/daten.js",
            "tetrapoda-core.js",
            "gelaende-core.js",
            "phyto-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/kamera-nah.cjs",
            "scripts/lib/software-gpu.cjs",
            "stamm/dirigent-*.js",
            "stamm/dienst.js",
        ],
        quelle: "2 = (a)–(d) auf beiden Geräten mit der Bild-Serie „Herde am Hang“",
    },
    {
        kriterium: "tiere.K3",
        staffel: 1,
        geraet: "headless",
        // der Stand-Fuß gleitet nicht — Kontakt-Mechanik (R3), wie der Beleg die 1 frisch hält: gate:tier-gang, jede Gattung bei
        // v̂ 0,3 · 0,74 · 1,2 · 3,5 als Leib (auch unter Last) UND im Satz (jenseits `nahLeiber`: `_tierSatzGang`, gemessen am
        // Knochen-Puffer, wie der Knoten zeichnet — seit tiere-gang-tastgrad dort statt in der Probe tiersatz der Kreatur-Linse).
        // Gerichtet wird nur der Schlupf der Tiere (Staffel 1), nicht Mensch, Becken, Labor.
        befehl: ["node", "scripts/diag-tier-gang.cjs"],
        env: { TIER_GANG_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const zeilen = (re) =>
                String(lauf.stdout || "")
                    .split(/\r?\n/)
                    .map((l) => re.exec(l))
                    .filter(Boolean)
                    .map((m) => ({ seele: m[2], vh: m[3], schlupf: m[4] === "null" ? null : Number(m[4]) }));
            const tiere = zeilen(/^\s*(✅|❌) (\S+)\s+v̂ (\S+) \S+ m\/s(?: \(.*\))? · Hüfte \S+ m · Stand \S+ · Schlupf (\S+)\s*$/);
            const satz = zeilen(/^\s*(✅|❌) satz (\S+)\s+v̂ (\S+) \S+ m\/s · Band \S+ · Hüfte \S+ m · Stand \S+ · Schlupf (\S+)\s*$/);
            const [gL, gS] = [tiere, satz].map((a) => new Set(a.map((t) => t.seele)).size);
            const gleiten = [...tiere, ...satz.map((t) => ({ ...t, seele: "satz " + t.seele }))].filter(
                (t) => !(t.schlupf !== null && t.schlupf <= 0.05)
            );
            const max = (a) => a.reduce((m, t) => (t.schlupf === null ? m : Math.max(m, t.schlupf)), 0);
            const gruen = tiere.length >= 16 && gL >= 4 && satz.length >= 16 && gS >= 4 && gleiten.length === 0;
            return {
                gruen,
                zahl:
                    "Schlupf des Stand-Fußes max " + max(tiere) + " in " + tiere.length + " Läufen als Leib (" + gL +
                    " Gattungen), max " + max(satz) + " in " + satz.length + " im Satz (" + gS + " Gattungen)" +
                    (gleiten.length ? ", über 0,05: " + gleiten.map((t) => t.seele + " v̂ " + t.vh).join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/stoff-instanz.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "tetrapoda-core.js",
            "koerper-core.js",
            "gelaende-core.js",
            "scripts/diag-tier-gang.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = der Fuß steht (Schlupf ≤ 0,05)",
    },
    // ───────── tiere.K3#2 — der Gang aus Fr in Welt (Leib und Satz) und Labor, am Querhang, im Bild aus 10 m (tiere-gang-tastgrad) ─────────
    // Kern: gate:tier-gang — je Gattung bei v̂ 0,3 · 0,74 · 1,2 · 3,5 Fußfolge und Tastgrad im Band als Leib, im Satz (jenseits
    // `nahLeiber`, gemessen am Knochen-Puffer, wie der Knoten zeichnet) und im Labor; Welt − Labor und Satz − Labor ≤ 0,05 Zyklus
    // über die Phasen (das Aufsetzen je Fuß); die Kreuz-Probe Stimmung × Tempo im lateinischen Quadrat (die Welt-Zeilen tragen
    // Freude · Furcht · Trauer · Jagd), unter Last (30 fps, Raten-Leiter) der Schlupf — dazu gate:kreatur-takt querhang (Hang
    // 20–30° der Welt und Rampe 29,9°: Bein-Lot ≤ 10°, Schlupf ≤ 0,05). Bild: die Gang-Bühne (die vier Gattungen im Schritt
    // v̂ 0,5 nebeneinander auf dem Boden der Welt, der Loop ruht, der Lebenszyklus der Fauna hält — kein Hunger-Tod im Schuss)
    // aus 10 m im Profil; je Tier drei Füße am Boden (BUEHNE-Zeile,
    // derselbe Aufsetz-Punkt wie gate:tier-gang), jede Gattung im Bild (`--klasse '^tier:'`). Ports: save-server {PORT},
    // tier-gang {PORT}+10000, Werkbank {PORT}+20000, Kreatur-Linse {PORT}+30000.
    // IN DER SITZUNG (29.10.): gate:tier-gang und der Querhang sind Mechanik in je eigener Null-Welt (headless, ohne Karte) — sie
    // laufen NEBEN der Bühne der Sitzung (zugleich, ihre Zeilen danach), nie vor ihr; die Bühne räumt die Tiere (mutiert)
    {
        kriterium: "tiere.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { sek: 33, befehl: [
            "bash",
            "-c",
            [
                "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"",
                "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
                "( TIER_GANG_PORT=$(( {PORT} + 10000 )) node scripts/diag-tier-gang.cjs; echo \"TIER-GANG EXIT=$?\" ) > \"$B-tiergang.out\" 2>&1 &",
                "( KREATUR_TAKT_PORT=$(( {PORT} + 30000 )) node scripts/diag-kreatur-takt.cjs --proben querhang; echo \"QUERHANG EXIT=$?\" ) > \"$B-querhang.out\" 2>&1 &",
                "node scripts/werkbank.cjs fenster 1920 1080 > /dev/null 2>&1",
                "erg() { node -e 'const t = require(\"fs\").readFileSync(0, \"utf8\"); console.log(JSON.stringify(JSON.parse(t.slice(t.indexOf(\"{\"))).ergebnis))'; }",
                "G=$(node scripts/werkbank.cjs eval 'const s = r.state, pm = s.playerMesh.position, h = (x, z) => r.getTerrainHeightAt(x, z), V = () => new window.THREE.Vector3(); r.setGameMode(\"pfad\"); for (const c of [...s.creatures, ...s.leichname]) r.removeCreature(c); s.renderer.setAnimationLoop(null); s.faunaLifecycle.lastTick = 1e12; const z0 = pm.z + 24; const tiere = [\"wolf\", \"fuchs\", \"baer\", \"wesen\"].map((seele, n) => { const x0 = pm.x - 5 + n * 3.4; s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4); const c = r.spawnCreatureAt(x0, h(x0, z0) + 0.3, z0, \"happy\", seele, { precise: true, bodySize: 1 }); c.userData.task = { name: \"wait\", args: {}, since: 0 }; c.userData.emotions = null; c.rotation.set(0, Math.PI / 2, 0); c.userData._animFade = 1; const tb = c.userData._tierBaum, T = tb.teile, P = [T.flP, T.frP, T.hlP, T.hrP]; r._tierBaumNeutralStance(c); c.updateMatrixWorld(true); const lokal = P.map((p) => { const w = V().setFromMatrixPosition(p.matrixWorld); w.y = c.position.y; return p.worldToLocal(w); }); const hl = V().setFromMatrixPosition(T.legHL.matrixWorld).y - c.position.y; const v = 0.5 * Math.sqrt(-s.gravity * tb.beinL * (c.scale.x || 1)); c.position.x = x0 - v * 4.3; for (let i = 0, t = 0; i < 258 + n * 7; i++) { c.position.x += v / 60; const y = h(c.position.x, c.position.z); c.position.y = y; c.userData._traegerY = y; c.userData._traegerStruktur = false; r._animateCompoundMotion(c, r._motionRolesForSoul(c.userData.soul), (t += 1 / 60), 0, true, null); } c.updateMatrixWorld(true); const amBoden = P.filter((p, j) => { const w = p.localToWorld(lokal[j].clone()); return w.y - h(w.x, w.z) <= 0.05 * hl; }).length; return { seele, x: +c.position.x.toFixed(1), art: tb._gang.art, amBoden }; }); const xc = tiere.reduce((a, t) => a + t.x, 0) / 4; return { tiere, kamera: [xc, h(xc, z0 - 10) + 2, z0 - 10, xc, h(xc, z0) + 0.5, z0].map((v) => +v.toFixed(2)) };' | erg); echo \"BUEHNE $G\"",
                "node scripts/werkbank.cjs bild $(node -e 'console.log(JSON.parse(process.argv[1]).kamera.join(\" \"))' \"$G\") --w 1920 --h 1080 --klasse '^tier:' --ziel gang --datei \"$B-gang.png\" > \"$B-bild.txt\" 2>&1",
                "echo \"BILD $(grep -o '\"abnahme\": \"[^\"]*\"' \"$B-bild.txt\")\"",
                "cp \"$B-gang.abnahme.json\" \"$A\"",
                "wait",
                "cat \"$B-tiergang.out\" \"$B-querhang.out\"",
            ].join("\n"),
        ],  mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 14,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const z = out.split(/\r?\n/);
            const gang = z.map((l) => /^\s*(✅|❌) Gangart (Welt|Satz|Labor) (\S+)/.exec(l)).filter(Boolean);
            const je = (wo) => gang.filter((m) => m[2] === wo);
            const gat = (wo) => new Set(je(wo).map((m) => m[3])).size;
            const kreuz = z.filter((l) => /^\s*✅ Gangart Welt \S+ \((Freude|Furcht|Trauer|Jagd)\)/.test(l)).length;
            const lab = z.filter((l) => /^\s*(✅|❌) Gangart Labor/.test(l) && /Welt − Labor/.test(l) && /Satz − Labor/.test(l));
            const ab = (wer) => Math.max(0, ...lab.map((l) => Number((new RegExp(wer + " − Labor (\\S+)").exec(l) || [])[1])));
            const kern =
                /TIER-GANG EXIT=0/.test(out) && gang.every((m) => m[1] === "✅") && ["Welt", "Satz", "Labor"].every((w) => je(w).length >= 16 && gat(w) >= 4) &&
                kreuz >= 16 && lab.length >= 16 && ab("Welt") <= 0.05 && ab("Satz") <= 0.05;
            const q = probeZeile(out, "querhang");
            const quer = !!q && !q.fehler && /^\s*✅ querhang\s/m.test(out) && q.hangGrad >= 20;
            const bu = jsonZeile(out, /^BUEHNE /);
            const T = (bu && bu.tiere) || [];
            const K = (j && j.klasse && j.klasse.klassen) || {};
            const px = ["wolf", "fuchs", "baer", "wesen"].map((s) => (K["tier:" + s] || {}).pixel || 0);
            const b = (j && j.bild) || {};
            const bild = T.length === 4 && T.every((t) => t.amBoden >= 3 && t.art === "schritt") && px.every((p) => p >= 400) && b.w === 1920 && b.h === 1080 && j.ok === true;
            return {
                gruen: kern && quer && bild,
                zahl:
                    "Gangart " + gang.filter((m) => m[1] === "✅").length + "/" + gang.length + " grün (Welt " + je("Welt").length + ", Satz " + je("Satz").length +
                    ", Labor " + je("Labor").length + ", Kreuz " + kreuz + "), Welt − Labor ≤ " + ab("Welt") + ", Satz − Labor ≤ " +
                    ab("Satz") + " Zyklus · Querhang " + (q ? (q.fehler ? "Fehler " + q.fehler : q.hangGrad + "°, Schlupf " + JSON.stringify(q.schlupf)) : "ohne Zeile") +
                    " · Bühne " + (T.length ? T.map((t) => t.seele + " " + t.art + " " + t.amBoden + " Füße").join(", ") : "ohne Zeile") + " · tier-Pixel " + px.join("/") +
                    " in " + b.w + "×" + b.h + ", " + ((j && j.zeile) || "ohne Abnahme-Zeile"),
            };
        },
        pfad: [
            ...KREATUR,
            "stamm/stoff-*.js",
            "stamm/bild-*.js",
            "stamm/gelaende-boden.js",
            "stamm/gelaende-kollision.js",
            "koerper-core.js",
            "gelaende-core.js",
            "worlds/tetrapoda/*",
            "save-server.js",
            "scripts/diag-tier-gang.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle:
            "2 = Fußfolge aus Fr für alle 4 Gattungen, Tastgrad im Band, Querhang 20°, Labor = Welt über die Phasen, Third-Bild aus 10 m",
    },
    {
        kriterium: "mensch.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M40 = M32 wiederholt (bericht/2210-messschuld-6cfce.md § M32, skripte/sitzung.sh + m32b-schritte.txt): EINE echte
        // Werkbank-Sitzung `--echt` gegen einen eigenen save-server, darin `diag-kreatur-takt --werkbank --proben bewohner`
        // (Quote, gegangene Menschen im Blick) und `platz-8.js` als `werkbank eval` (Third am Rand des Dorfplatzes, Uhr 8 als
        // Spieler-Wort, Loop 12 s, gezählt im Frustum der Spiel-Kamera, gezeichnet, Sichtlinie frei) mit dem Bild aus dem
        // Ausgabe-Pfad (`b64png.cjs` → <aus>-platz-8uhr-third.png). Ports: save-server {PORT}, Werkbank {PORT}+20000 (Seite −1).
        // platz-8.js und b64png.cjs leben im Koord-Baum (R6 sieht sie nicht; ihr Text steht hier per Pfad im Abdruck).
        // IN DER SITZUNG (29.10.): EIN Lauf der Probe bewohner für mensch.K1#1 und mensch.K2#2 (BEWOHNER_SITZUNG, Zwillinge) —
        // bis dahin fuhr jede ihn ganz
        probe: { ...BEWOHNER_SITZUNG,  mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "bewohner");
            const p = jsonZeile(lauf.stdout, /^\{"uhr":/);
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner im Fenster (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            if (!p) return { gruen: false, zahl: "kein Platz-Bild um 8 Uhr (platz-8.js / b64png, Exit " + lauf.exit + ")" };
            if (p.fehler) return { gruen: false, zahl: "Platz-Bild: " + p.fehler };
            const ib = z.imBlick || {};
            const gruen =
                z.leiber > 0 &&
                typeof z.quote === "number" &&
                Math.abs(z.quote - 1) <= 0.05 &&
                z.leerN === 0 &&
                ib.ego >= 10 &&
                ib.third >= 10 &&
                p.imBild >= 10 &&
                p.sicht === "third";
            return {
                gruen,
                zahl:
                    "Quote " + z.leiber + "/" + z.sollSumme + " = " + z.quote + ", Häuser ohne Bewohner " + z.leerN +
                    ", gegangene im Blick " + ib.ego + " Ego / " + ib.third + " Third; Third-Bild 8 Uhr am Dorfplatz " +
                    p.imBild + " Menschen im Bild, " + p.gehendImBild + " gehend, " + p.fps + " fps",
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/stoff-instanz.js",
            "stamm/studio-bruecke.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "foundry-bruecke.js",
            "save-server.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Start-Dorf voll: Körper mit Menschen-Leib je Siedlung ÷ Σ leute = 1,0 ±0,05, ≥ 10 Menschen im Bild am Dorfplatz an einem Gerät",
    },
    // mensch.K1 Staffel 2 — die Stadt lebt: in `fehlt` (w4-sitzung-reif; die Probe riss in jeder GPU-Fahrt den Deckel)
    {
        kriterium: "vegetation.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M41 = M24 wiederholt (bericht/2110-messschuld-radeon/m24-grund-bild.*): W9 aus dem Ausgabe-Bild, echter Renderer —
        // das Start-Dorf (erwacht in Raten) und das gesetzte Haus des Spielers, je Box des Körper-Satzes Halm- und Boden-Pixel,
        // das Büschel am Gesetz, die Gegenprobe vor der Tür. Gerichtet werden die Häuser des Start-Dorfs (Staffel 1); die
        // Phasen Waise/Ausstattung sind im Bild-Lauf blind und machen den Exit 1 (so auch M24) — das Urteil liest das JSON.
        // Eine Box ohne freies Auge (M24: haus_skandinavisch, haupt) steht beim Namen in der Zahl als ungemessen, nie als ROT
        // (wie M24: 26/27 gesehen, die blinde Box offen benannt); gesehen sein müssen ≥ 90 %. Halm- UND Boden-Pixel zählen wie
        // in M24 und im W9 der Linse: der Boden-Pixel ist der Grund IN der Box (grün = die Halm-Schicht des Boden-Stoffs; trägt
        // die Box eine Diele, jeder Grund durch sie) — 23.10. an 7c6f4b49 der Turm des haus_gotisch, Bild grund-41-0-turm-*.png.
        // Jede Box heißt beim Namen wie das Bild der Linse: Haus-Index/Box-Index (seit 29.10. <AUS>-grund-<i>-<j>-<art>-<v>.png).
        // Seit 29.10. die Probe VEGETATION_K4 in der Welt der Sitzung (oben; vorher der eigene Boot, 6 Soll-Minuten).
        probe: VEGETATION_K4,
        gpu: true,
        zeit: false,
        minuten: 2,
        urteil: (j) => {
            const w = j && j.w9;
            if (!w || !Array.isArray(w.haeuser)) return { gruen: false, zahl: "kein W9 im JSON der Linse (HAUS_WELT_JSON)" };
            if (!w.bild) return { gruen: false, zahl: "W9 ohne Bild (der Lauf fuhr nicht --bild)" };
            const dorf = w.haeuser.filter((h) => !h.spieler);
            const boxen = dorf.flatMap((h) => (h.koerper || []).map((b, jb) => ({ ...b, typ: h.typ, wo: w.haeuser.indexOf(h) + "-" + jb })));
            const name = (b) => b.typ + " " + b.wo + " " + b.art;
            const gesehen = boxen.filter((b) => b.blicke > 0);
            const blind = boxen.filter((b) => !(b.blicke > 0));
            const halm = gesehen.filter((b) => b.halm > 0 || b.boden > 0);
            const bueschel = boxen.filter((b) => b.bueschel > 0);
            const gegen = Math.max(0, ...w.haeuser.map((h) => h.gegenprobe || 0));
            const gruen =
                dorf.length >= 10 &&
                gesehen.length >= Math.ceil(0.9 * boxen.length) &&
                halm.length === 0 &&
                bueschel.length === 0 &&
                gegen > 0;
            const sum = (f) => gesehen.reduce((a, b) => a + (b[f] || 0), 0);
            return {
                gruen,
                zahl:
                    dorf.length + " Häuser des Start-Dorfs, " + gesehen.length + "/" + boxen.length + " Boxen im Bild: Halm " +
                    sum("halm") + " px, Boden " + sum("boden") + " px, Büschel am Gesetz " + bueschel.length +
                    " Boxen; Gegenprobe " + gegen + " px" +
                    (halm.length ? "; Halm/Boden in " + halm.map((b) => name(b) + " " + (b.halm || 0) + "/" + (b.boden || 0) + " px").join(" · ") : "") +
                    (bueschel.length ? "; Büschel in " + bueschel.map((b) => name(b) + " " + b.bueschel).join(" · ") : "") +
                    (blind.length ? "; ungemessen (ohne freies Auge) " + blind.map(name).join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/vegetation-*.js",
            "stamm/siedlung-*.js",
            "stamm/gelaende-*.js",
            "stamm/stoff-*.js",
            "stamm/bild-*.js",
            "stamm/daten.js",
            "fachwerk-core.js",
            "foundry-bruecke.js",
            "phyto-core.js",
            "gelaende-core.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = Halm- und Büschel-Pixel 0 in jeder Haus-Box des Start-Dorfs an einem Gerät",
    },
    {
        kriterium: "vegetation.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // Dieselbe Linse wie #1 (Zwilling: ein Lauf je Gerät), seit vegetation-k4-wasser mit der Wasser-Hälfte: das Haus des
        // Spielers setzt die Werkstatt (`confirmBuild`, die Prägung des Rezepts, schöpfer), jedes Haus wird zusätzlich in Third
        // gesehen (5 m vor der Front, 2,6 m hoch: die Büschel jeder Box gegen das Bild ohne sie), und am See und am Fluss der
        // Mess-Wiese (`__wasserOrte`) je Ego und Third: wo das Wasser vorn liegt (Maske des Wasser-Stoffs) ändert die Natur
        // (Nah-Wiese und Nah-Streu, ohne Schattenwurf) das Bild ohne Wasser-Klasse nicht, der Grund trägt dort keine Halm-Schicht,
        // und am Gesetz steht keine Pflanze im gezeichneten Wasser (`__wasserFlora`). Je Wasser-Blick 20 px Saum (die Kante des
        // Spiegels, wie die Bild-Schwelle der Linse), sonst 0. Blind (ROT): ein Wasser ohne Spiegel im Bild (< 500 px) oder ohne
        // Gegenprobe vor dem Spiegel, ein Haus ohne Third, das Haus des Spielers fehlt. Seit 29.10. dieselbe Probe (Zwilling von #1).
        probe: VEGETATION_K4,
        gpu: true,
        zeit: false,
        minuten: 2,
        urteil: (j) => {
            const w = j && j.w9;
            if (!w || !Array.isArray(w.haeuser)) return { gruen: false, zahl: "kein W9 im JSON der Linse (HAUS_WELT_JSON)" };
            if (!w.bild || !Array.isArray(w.wasser)) return { gruen: false, zahl: "W9 ohne Bild oder ohne Wasser (Linse vor vegetation-k4-wasser)" };
            const boxen = w.haeuser.flatMap((h, i) => (h.koerper || []).map((b, jb) => ({ ...b, n: h.typ + " " + i + "-" + jb + " " + b.art })));
            const gesehen = boxen.filter((b) => b.blicke > 0);
            const haus = gesehen.filter((b) => b.halm > 0 || b.boden > 0 || b.bueschel > 0).map((b) => b.n + " " + b.halm + "/" + b.boden + "/" + b.bueschel);
            const third = w.haeuser.map((h, i) => [h.typ + " " + i, h.third ? h.third.halm + h.third.boden : null]);
            const thirdRot = third.filter(([, v]) => v !== 0);
            const gegen = Math.max(0, ...w.haeuser.map((h) => h.gegenprobe || 0));
            const spieler = w.haeuser.filter((h) => h.spieler).length;
            const blicke = w.wasser.flatMap((x) => x.blicke.map((z) => ({ ...z, ort: x.ort })));
            const wasserRot = w.wasser.filter(
                (x) => x.wiese + x.streu > 0 || x.blicke.length < 2 || x.blicke.some((z) => z.spiegel < 500 || z.halm + z.boden > 20) || !x.blicke.some((z) => z.gegen > 0)
            );
            const gruen =
                w.haeuser.length >= 11 &&
                spieler === 1 &&
                j.werkstatt === true &&
                gesehen.length >= Math.ceil(0.9 * boxen.length) &&
                !haus.length &&
                !thirdRot.length &&
                gegen > 0 &&
                w.wasser.length === 2 &&
                !wasserRot.length;
            return {
                gruen,
                zahl:
                    w.haeuser.length + " Häuser (" + spieler + " gesetzt über die Werkstatt " + j.werkstatt + "), " + gesehen.length + "/" +
                    boxen.length + " Boxen im Bild" + (haus.length ? ": Halm/Boden/Büschel in " + haus.join(" · ") : " ohne Halm") +
                    "; Third " + (thirdRot.length ? "ROT " + thirdRot.map(([n, v]) => n + " " + v).join(" · ") : "0 px vor " + third.length + " Häusern") +
                    "; Gegenprobe " + gegen + " px; Wasser " + w.wasser.map((x) => x.ort + " Pflanzen im Wasser " + (x.wiese + x.streu)).join(", ") +
                    "; je Blick Spiegel/Halm/Grund/Gegenprobe " + blicke.map((z) => z.ort + "-" + z.sicht + " " + [z.spiegel, z.halm, z.boden, z.gegen].join("/")).join(" · "),
            };
        },
        pfad: [
            "stamm/vegetation-*.js",
            "stamm/siedlung-*.js",
            "stamm/gelaende-*.js",
            "stamm/wasser-*.js",
            "stamm/stoff-*.js",
            "stamm/bild-*.js",
            "stamm/werkstatt-*.js",
            "stamm/daten.js",
            "fachwerk-core.js",
            "foundry-bruecke.js",
            "phyto-core.js",
            "gelaende-core.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "2 = jedes Haus und jedes Wasser, auch gesetzte Bauten, beide Geräte",
    },

    // ───────── oekologie.K3 — EIN Furcht-Gesetz (Zweig tier-gesetz-k5, tetrapoda FURCHT_GESETZ) ─────────
    // Probe furcht der Kreatur-Linse (Null-Renderer, R3: sie misst ein Gesetz): je Rolle 4 Orte, das Tier reist über
    // `_serializeCreature` → `_restoreCreatureFromSnapshot` (Speichern), dann geht der Spieler auf es zu; Schlag und Gabe über
    // die Chokepoints damageCreature (source player) und activateCreatureConsumable. Staffel 2 dazu (z.ort): ein Riss in der
    // Zelle der Herde gegen den Gegenlauf mit Feld-Furcht 0. An main fehlt die Probe (ROT „keine Zeile").
    ...[1, 2].map((staffel) => ({
        kriterium: "oekologie.K3",
        staffel,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "furcht"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "furcht");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe furcht (Exit " + lauf.exit + ")" };
            if (z.fehler || !z.erinnert || !z.ort) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne erinnert/ort") };
            const { kontrolle: K, geschlagen: G, gefuettert: F } = z.erinnert;
            const O = z.ort;
            const wesen =
                [...G.erinnerungen, ...F.erinnerungen].every((n) => n >= 1) &&
                K.medianM >= 5 &&
                G.medianM >= 2 * K.medianM &&
                F.medianM <= 0.5 * K.medianM &&
                F.naeherM >= 2;
            const ort = O.gegenlauf >= 0.2 && O.aufenthalt <= 0.5 * O.gegenlauf;
            return {
                gruen: wesen && (staffel === 1 || ort),
                zahl:
                    "geschlagen " + G.medianM + " m gegen Kontrolle " + K.medianM + " m · gefüttert " + F.medianM + " m, selbst " +
                    F.naeherM + " m näher · Gedächtnis nach dem Laden " + G.erinnerungen + " / " + F.erinnerungen +
                    " · Riss-Zelle Aufenthalt " + O.aufenthalt + " gegen Gegenlauf " + O.gegenlauf,
            };
        },
        pfad: [...KREATUR],
        quelle:
            staffel === 1
                ? "1 = ein Wesen, das der Spieler schlug, hält bei der nächsten Begegnung Abstand (Median ≥ 2× ein Kontroll-Wesen), ein gefüttertes nähert sich, ohne Modell, über Speichern"
                : "2 = dazu deponiert ein Riss Furcht am Ort, und die Herde meidet die Zelle (Aufenthalt −50 % gegen den Gegenlauf)",
    })),

    // ───────── tiere.K2 — der Jagd-Kreislauf (Zweig tier-gesetz-k5, tetrapoda JAGD_GESETZ) ─────────
    // Probe jagdkreis (A) je Jagd: die Beute trägt die HP aus dem Leib-Gesetz (Hirsch 168, Kitz 60), drei Szenen — 1 Wolf und
    // 4 Wölfe gegen den gesunden Hirsch, das Rudel gegen das Kitz — mit dem Band nach MacNulty (Schlupfloch hp 1e6 / HP 1:
    // das Band hat ein Oben und ein Unten, hp0 ≥ 100 verlangt den Leib). An main zählt die Probe Riss je Ort (ROT „ohne quote").
    {
        kriterium: "tiere.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "jagdkreis"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "jagdkreis");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe jagdkreis (Exit " + lauf.exit + ")" };
            const Q = z.riss && z.riss.quote;
            if (z.fehler || !Q) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne riss.quote") };
            const band = { einWolf: [0, 0.1], rudel: [0.2, 0.4], kitz: [0.6, 1] };
            const je = Object.entries(band).map(([sz, [lo, hi]]) => {
                const q = Q[sz] || {};
                const v = q.jagden ? q.risse / q.jagden : null;
                return { sz, ok: q.jagden >= 10 && v != null && v >= lo && v <= hi, t: sz + " " + q.risse + "/" + q.jagden + " (HP " + q.hp0 + ")" };
            });
            const hp = Q.rudel && Q.rudel.hp0 >= 100;
            return {
                gruen: je.every((x) => x.ok) && hp && z.riss.rissS != null,
                zahl: "Riss je Jagd " + je.map((x) => (x.ok ? "" : "✗ ") + x.t).join(" · ") + " · erster Riss " + z.riss.rissS + " s",
            };
        },
        pfad: [...KREATUR],
        quelle: "1 = Hetze und Riss mit HP aus dem Leib-Gesetz, Quote im Band über ≥ 10 Seeds",
    },

    // ───────── tiere.K4 — Lebensraum (Zweig tier-gesetz-k5, tetrapoda LEBENSRAUM_GESETZ) ─────────
    // Probe lebensraum: neun Orte (Raster 300 m) je 25 natürliche Geburten, je Tier die Boden-Klasse am Ort gegen die Gattung;
    // die Gegenprobe in einer importierten Welt anderer Saat (lebensraum-gegen). Schlupfloch Hand-Setzen: Saat-Wechsel. An
    // main fehlt die Probe (ROT „keine Zeile").
    {
        kriterium: "tiere.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "lebensraum"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "lebensraum");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe lebensraum (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const g = z.gegen || {};
            const gruen =
                z.n >= 150 && Object.keys(z.gattung || {}).length >= 3 && z.anteil >= 0.9 &&
                !g.fehler && g.n >= 150 && g.anteil >= 0.9 && !!g.saat && g.saat !== z.saat;
            return {
                gruen,
                zahl:
                    "im Lebensraum " + z.drin + "/" + z.n + " = " + z.anteil + " (Saat " + z.saat + ", " + JSON.stringify(z.gattung) + ") · Gegenprobe " +
                    (g.fehler ? g.fehler : g.drin + "/" + g.n + " = " + g.anteil + " (Saat " + g.saat + ")"),
            };
        },
        pfad: [
            ...KREATUR,
            "gelaende-core.js",
            "phyto-core.js",
            "stamm/gelaende-boden.js",
            "stamm/vegetation-wiese.js",
            "stamm/wasser-hydro.js",
            "spec/pruefbuehne/welt.json",
        ],
        quelle: "1 = ≥ 0,9 der Geburten in der Boden-Klasse der Gattung, mit Gegenprobe bei anderem Seed",
    },

    // ───────── tiere.K4 Staffel 2 — der Tag (Zweig tiere-k2k4, tetrapoda ETHOGRAMM_GESETZ) ─────────
    // Probe tagesbudget: je Gattung drei Tiere am Ufer, 12 Spielstunden der Spieler-Uhr eingelaufen, 24 gemessen — das Budget
    // ruhen · nahrung · ziehen gegen das Ethogramm (±20 %; was die Gattung nicht tut, ≤ 0,01), jedes Tier trinkt am Wasser, der
    // Gegenlauf „Durst aus“ trinkt 0, die Ruhe steht (< 3 % bewegt); Probe lebensraum: je Wurf der Bär am Fluss gegen abseits in
    // zwei Saaten (Schlupfloch Zeitplan: das Budget kommt aus den Pegeln, die Täter alte Uhr und leerer Ruhe-Pegel sind ROT). An
    // main fehlt die Probe tagesbudget (ROT „keine Zeile“).
    {
        kriterium: "tiere.K4",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "lebensraum,tagesbudget"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const t = probeZeile(lauf.stdout, "tagesbudget");
            const l = probeZeile(lauf.stdout, "lebensraum");
            if (!t || !l) return { gruen: false, zahl: "keine Zeile der Probe " + (t ? "lebensraum" : "tagesbudget") + " (Exit " + lauf.exit + ")" };
            if (t.fehler || l.fehler || !l.baer) return { gruen: false, zahl: "Probe-Fehler: " + (t.fehler || l.fehler || "ohne baer") };
            const je = Object.entries(t.soll || {}).flatMap(([g, S]) =>
                Object.entries(S).map(([k, v]) => {
                    const ist = t.budget[g][k];
                    return { ok: v > 0 ? Math.abs(ist / v - 1) <= 0.2 : ist <= 0.01, t: g + " " + k + " " + ist + "/" + v };
                })
            );
            const tr = t.truenke || [];
            const durst = tr.length >= 12 && tr.every((n) => n >= 1) && t.amWasser === tr.reduce((a, b) => a + b, 0) && t.durstAus === 0;
            const ruhe = t.ruhe[0] >= 1000 && t.ruhe[1] < 0.03 * t.ruhe[0];
            const gb = (l.gegen && l.gegen.baer) || { fluss: [0, 0], sonst: [0, 0] };
            const [F, N] = ["fluss", "sonst"].map((k) => [l.baer[k][0] + gb[k][0], l.baer[k][1] + gb[k][1]]);
            const baer = F[0] >= 10 && N[0] >= 10 && F[1] > 0 && F[1] / F[0] >= (2 * N[1]) / N[0];
            return {
                gruen: je.length >= 12 && je.every((x) => x.ok) && durst && ruhe && baer,
                zahl:
                    "Budget " + je.map((x) => (x.ok ? "" : "✗ ") + x.t).join(" · ") + " · Trünke " + tr.join(",") + " (am Wasser " +
                    t.amWasser + ", Durst aus " + t.durstAus + ") · Ruhe bewegt " + t.ruhe[1] + "/" + t.ruhe[0] + " · Bär am Fluss " +
                    F[1] + "/" + F[0] + " Würfe, abseits " + N[1] + "/" + N[0],
            };
        },
        pfad: [
            ...KREATUR,
            "gelaende-core.js",
            "phyto-core.js",
            "stamm/gelaende-boden.js",
            "stamm/wasser-hydro.js",
            "stamm/bild-himmel.js",
            "spec/pruefbuehne/welt.json",
        ],
        quelle: "2 = dazu das Tages-Budget je Gattung ±20 % am Ethogramm, Trinken aus Durst (Mutante „Durst aus“ → 0), am Fluss Bären-Sichtung ≥ 2× wahrscheinlicher",
    },

    // ───────── tiere.K2 Staffel 2 — das Mahl und das Wolfsrevier im Bild (Zweig tiere-k2k4) ─────────
    // (1) das Mahl headless wie tiere.K2#1 (`diag-kreatur-takt --proben jagdkreis`, Port {PORT}+10000): nach dem ersten Riss des Rudels
    // am gesunden Hirsch frisst es ≥ 60 s der 120 s (z.riss.fressS), Fuchs oder Bär sind ≤ 120 s am Aas (gaeste[].kommtS) — im
    // Fenster der Werkbank misst die Probe ihren Sprinter am Spieler des Fensters (Sprint 7,88 m/s), darum nicht dort; (2) EINE
    // Werkbank-Sitzung `--echt` gegen einen eigenen save-server, das Wolfsrevier: der nächste Ort der Boden-Klasse wald 50–400 m
    // um den Spieler, der Spieler 30 m daneben (`umstellen`), vier Wölfe als Verband reißen am echten Takt ein Kitz und fressen
    // (≥ 2), geschossen aus dem Ausgabe-Pfad 8 m vor dem Riss, 2,2 m hoch, 1920×1080: die Wölfe im Bild (Klasse tier:wolf ≥ 800 px —
    // vier Sichtungen zu 200 px), die Abnahme GRÜN. Ports: save-server {PORT}, Werkbank {PORT}+20000.
    // IN DER SITZUNG (29.10.): das Mahl (jagdkreis, Null-Welt headless) läuft NEBEN dem Wolfsrevier der Sitzung, seine Zeilen danach;
    // das Revier räumt die Tiere und lässt vier Wölfe am Riss (mutiert)
    {
        kriterium: "tiere.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { sek: 10, befehl: [
            "bash",
            "-c",
            [
                "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"",
                "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
                "( KREATUR_TAKT_PORT=$(( {PORT} + 10000 )) node scripts/diag-kreatur-takt.cjs --proben jagdkreis ) > \"$B-jagdkreis.out\" 2>&1 &",
                "node scripts/werkbank.cjs fenster 1920 1080 > /dev/null 2>&1",
                "erg() { node -e 'const t = require(\"fs\").readFileSync(0, \"utf8\"); console.log(JSON.stringify(JSON.parse(t.slice(t.indexOf(\"{\"))).ergebnis))'; }",
                "O=$(node scripts/werkbank.cjs eval 'const pm = r.state.playerMesh.position; let O = null; for (let ring = 2; ring <= 16 && !O; ring++) for (let q = 0, n = ring * 6; q < n && !O; q++) { const a = (q / n) * 2 * Math.PI, x = pm.x + Math.cos(a) * ring * 25, z = pm.z + Math.sin(a) * ring * 25; if (r._landAt(x, z) && r._bodenKlasseAt(x, z) === \"wald\" && r._bodenKlasseAt(x + 30, z) !== \"fluss\" && r._kreaturGrundFrei(x, z) && r._kreaturGrundFrei(x + 30, z)) O = [+x.toFixed(1), +z.toFixed(1)]; } return O;' | erg); echo \"ORT $O\"",
                "node scripts/werkbank.cjs umstellen $(node -e 'const o = JSON.parse(process.argv[1]); console.log(o[0] + 30, o[1])' \"$O\") > \"$B-umstellen.txt\" 2>&1",
                "R=$(node scripts/werkbank.cjs eval 'const s = r.state, pm = s.playerMesh.position; r.setGameMode(\"pfad\"); const O = { x: pm.x - 30, z: pm.z }; for (const c of [...s.creatures, ...s.leichname]) r.removeCreature(c); const neu = (x, z, seele, gr) => { const c = r.spawnCreatureAt(x, r.getTerrainHeightAt(x, z) + 0.5, z, \"happy\", seele, { precise: true, bodySize: gr }); c.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 }; return c; }; const kitz = neu(O.x, O.z, \"wesen\", 0.6); const W = [0, 1, 2, 3].map((i) => neu(O.x + Math.cos(Math.PI + (i - 1.5) * 0.5) * 25, O.z + Math.sin(Math.PI + (i - 1.5) * 0.5) * 25, \"wolf\", 1)); r._kreaturVerbinden(W); let rissS = null, k = 0; const frisst = () => W.filter((c) => c.userData._motionZustand === \"fressen\").length; for (; k < 7200 && (rissS === null || (frisst() < 3 && k / 60 < rissS + 20)); k++) { r._kreaturStossSchritt(1 / 60); r._leibKontakte(); r.updateCreatures(1 / 60); if (rissS === null && s.leichname.includes(kitz)) rissS = +(k / 60).toFixed(1); } const fressen = frisst(); const nah = W.filter((c) => Math.hypot(c.position.x - kitz.position.x, c.position.z - kitz.position.z) < 4).length; const K = kitz.position, d = Math.hypot(pm.x - K.x, pm.z - K.z) || 1, ax = K.x + ((pm.x - K.x) / d) * 8, az = K.z + ((pm.z - K.z) / d) * 8; return { ort: r._bodenKlasseAt(O.x, O.z), kamera: [ax, r.getTerrainHeightAt(ax, az) + 2.2, az, K.x, K.y + 0.4, K.z].map((v) => +v.toFixed(2)), klasse: r._bodenKlasseAt(kitz.position.x, kitz.position.z), rissS, fressen, nah, woelfe: W.length };' | erg); echo \"REVIER $R\"",
                "node scripts/werkbank.cjs bild $(node -e 'console.log(JSON.parse(process.argv[1]).kamera.join(\" \"))' \"$R\") --w 1920 --h 1080 --klasse '^tier:' --ziel Riss --datei \"$B-wolfsrevier.png\" > \"$B-bild.txt\" 2>&1",
                "echo \"BILD $(grep -o '\"abnahme\": \"[^\"]*\"' \"$B-bild.txt\")\"",
                "cp \"$B-wolfsrevier.abnahme.json\" \"$A\"",
                "wait",
                "cat \"$B-jagdkreis.out\"",
            ].join("\n"),
        ],  mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "jagdkreis");
            const R = z && z.riss;
            if (!R || z.fehler) return { gruen: false, zahl: "keine Zeile der Probe jagdkreis (Exit " + lauf.exit + (z && z.fehler ? ": " + z.fehler : "") + ")" };
            const rv = jsonZeile(lauf.stdout, /^REVIER /);
            const w = j && j.klasse && (j.klasse.klassen || {})["tier:wolf"];
            const b = (j && j.bild) || {};
            const gaeste = (R.gaeste || []).map((G) => G.seele + " " + G.kommtS + " s");
            const mahl = R.rissS != null && R.fressS >= 60 && (R.gaeste || []).some((G) => G.kommtS != null && G.kommtS <= 120);
            const bild = !!rv && rv.ort === "wald" && rv.rissS != null && rv.fressen >= 2 && !!w && w.pixel >= 800 && b.w === 1920 && b.h === 1080 && j.ok === true;
            return {
                gruen: mahl && bild,
                zahl:
                    "Fressen " + R.fressS + " s nach dem Riss bei " + R.rissS + " s, am Aas " + gaeste.join(", ") + " · Wolfsrevier " +
                    (rv ? rv.ort + ", Riss " + rv.rissS + " s, " + rv.fressen + " fressen" : "ohne REVIER-Zeile") + ": tier:wolf " +
                    (w ? w.pixel : 0) + " px in " + b.w + "×" + b.h + ", " + ((j && j.zeile) || "ohne Abnahme-Zeile"),
            };
        },
        pfad: [
            ...KREATUR,
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/vegetation-*.js",
            "stamm/gelaende-boden.js",
            "gelaende-core.js",
            "phyto-core.js",
            "save-server.js",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = dazu Fressen ≥ 60 s, der Kadaver lockt Fuchs oder Bär ≤ 120 s, Station Wolfsrevier im Bild beider Geräte",
    },

    // ───────── tiere.K5 Staffel 1 — Begegnung im Bild (Zweig tier-sicht, `werkbank lauf --wandern kreis`) ─────────
    // DIE WELT DER SITZUNG (punkte.cjs fahreSitzung) an der Mess-Wiese, 1280×720 (das Maß der Sichtung), der
    // Bestand des Spiels (`--tiere frei`, das Bestands-Gesetz; keine Tiere der Bühne). Je Sicht (Ego, Third) `umstellen --ort
    // wiese` und der Kreis der Werkbank (`lauf`, `wandern: kreis`): der Spieler GEHT 600 Spiel-s (Taste W, das Tempo des Spiels) eine Runde, der
    // Blick dreht mit; eine Sichtung = ein Tier deckt ≥ 200 px der Klassen-Maske tier im Ausgabe-Bild (zwei Schüsse mit und ohne
    // Tiere unter der EINEN Uhr, je Pixel das nächste Tier, dessen Körper-Kugel ihn deckt), jedes Tier zählt einmal. GRÜN: in
    // BEIDEN Sichten ≥ 3 Sichtungen über ≥ 600 Spiel-s und kein Tier erschien im Blick (`imBlick` 0, das Schlupfloch). Die
    // Mutante „Bestand 0" (keine Geburt, kein Tier) ist ROT mit 0 Sichtungen. Genesis fehlt der Station: der Ring der Tore
    // liegt auf dem Kreis (R 11 m um den Start), der Gang ginge durch ein Tor — die Wiese trägt beide Sichten.
    // Headless (swiftshader 320×180, die Schwelle auf 1280×720 normiert, 28.10., Zweig tier-sicht): main Ego 1 Sichtung (Hirsch
    // 90 m), Third 3 (Hirsch 94/54/51 m), keines im Blick erschienen — ROT an Ego; mit oeko-k2-bestand (d9928c7e) Ego 3 (Bär 5 m,
    // Wolf 19/31 m), Third 5, aber 3 bzw. 2 Tiere erschienen im Blick (die Verkörperung prüft nur den Anker der Gruppe auf „außer
    // Blick", `_bestandLeiber` → `_kreaturWurf`) — ROT am Schlupfloch; Mutante „Bestand 0" 0 Sichtungen — ROT. Das Urteil fällt an
    // Radeon oder GTX bei 1280×720.
    // IN DER SITZUNG (29.10., proben-welt.cjs `tierKreis`): der Kreis im ZEITRAFFER der Schleife (10 Takte zu 0,1 s Spiel-Zeit je
    // Bild) — 600 Spiel-s je Sicht sind das Kriterium, die Wanduhr nicht; bis 29.10. zwei mal zehn Minuten im eigenen Boot (Radeon
    // b3f9ae95: 32,07 min Arbeit).
    // DER RISS BEIM NAMEN (w4-fehlt-acht): in jeder GPU-Fahrt am Deckel (Radeon 90/99 s) — die Sichtung schoss je ungesehenem Tier im Blick
    // ein Paar aus drei Aufnahmen zu 33 Bildern (1280×720). Jetzt schießt sie bis zur Staffel (3 je Sicht) und der Kreis wacht danach
    // bis 600 Spiel-s über das Schlupfloch (proben-welt.cjs `tierKreis`, STAFFEL); je 10 s eine FORTSCHRITT-Zeile nennt am Deckel, wo er stand
    // EIN Gerät (die Staffel: „an einem Gerät"; w4-fehlt-acht): die Radeon, die schnellere CPU (der Kreis rechnet 12 000 Takte; Bewohner-Takt
    // Radeon 1,98 gegen GTX 3,25 ms, 715754fc). DER DECKEL DER ARBEIT (geschätzt, ungemessen in der Sitzung): 12 000 Takte zu 0,1 Spiel-s,
    // ≤ 2 Bilder je Raffer-Bild unter der GPU-Leine, die Sichtung bis zur Staffel, Third am selben Ort — 55 s
    {
        kriterium: "tiere.K5",
        staffel: 1,
        geraet: "radeon",
        probe: {
            befehl: PW.torBefehl(PW.tierKreis),
            sek: 55,
            ausnahme: "1200 Spiel-s (je Sicht 600, „je 10 Spielminuten“) im Zeitraffer der Schleife, die Sichtung bis zur Staffel — die Arbeit, nie das Einschwingen",
            mutiert: false,
        },
        gpu: true,
        zeit: false,
        minuten: 30,
        urteil: (j, lauf) => {
            const K = ["ego", "third"].map((s) => [s, jsonZeile(lauf.stdout, new RegExp("^KREIS-" + s + " "))]);
            const fehlt = K.filter(([, k]) => !k || !Array.isArray(k.gesehen));
            if (fehlt.length) return { gruen: false, zahl: "keine KREIS-Zeile in " + fehlt.map(([s]) => s).join(", ") + " (Exit " + lauf.exit + ")" };
            const gut = (s, k) => k.gesehen.length >= 3 && k.imBlick === 0 && k.spielS >= 600 && k.sicht === { ego: "first", third: "third" }[s];
            return {
                gruen: K.every(([s, k]) => gut(s, k)),
                zahl: K.map(([s, k]) => s + " (" + k.sicht + ") " + k.gesehen.length + " Sichtungen in " + k.spielS + " Spiel-s (" + k.gesehen.map((g) => g.join(" ")).join(" · ") +
                    "), " + k.schuesse + " Schuss-Paare, Bestand bis " + k.max + ", im Blick erschienen " + k.imBlick).join(" | "),
            };
        },
        pfad: [
            ...KREATUR,
            "stamm/bild-*.js",
            "stamm/koerper-bewegung.js",
            "stamm/dirigent-takt.js",
            "save-server.js",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = ≥ 3 Tier-Sichtungen im Ausgabe-Bild je 10 Spielminuten an einem Gerät",
    },

    // ───────── affekt.K1 — die Wertung antwortet am Ort (affekt-k1-ort) ─────────
    {
        kriterium: "affekt.K1",
        staffel: 1,
        geraet: "headless",
        // gate:weltakt-wache (T) an der Mess-Wiese, Null-Renderer, der Leib steht — 10× „pflege das land" je 30 s Spielzeit über den
        // echten Weg (processChatCommand → dslEval → _tatWerten), δ aus der Situation (`_playerSituationWohl`), die Antwort im
        // Vogel-Chor der Lage, die der Ausgabe-Pfad abtastet, gegen 32 m daneben; die gestempelte Freude trägt 0 (Schlupfloch)
        befehl: ["node", "scripts/diag-weltakt-wache.cjs"],
        env: { WELTAKT_WACHE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const z = jsonZeile(lauf.stdout, /^\s*(✅|❌) tat-k1 \{/);
            if (!z || !Array.isArray(z.delta) || !z.delta.length || !Array.isArray(z.antwortDb))
                return { gruen: false, zahl: "keine Zeile tat-k1 (Exit " + lauf.exit + ")" };
            const [d1, dn] = [z.delta[0], z.delta[z.delta.length - 1]];
            const st = z.stempel || {};
            const gruen = z.gruen === true && d1 > 0 && Math.abs(dn) <= 0.3 * d1 && z.antwortDb[0] > 0 && z.nachbarDb <= 0.5 && !st.delta && !st.antwort;
            return {
                gruen,
                zahl:
                    "δ Tat 1 " + d1 + " → Tat " + z.delta.length + " " + dn + " (" + (Math.abs(dn) / d1).toFixed(3) + " ≤ 0,3), Vogel-Chor am Ort " +
                    z.antwortDb[0] + " dB, Nachbar " + z.nachbarDb + " dB, Stempel " + st.delta + "/" + st.antwort,
            };
        },
        pfad: ["stamm/feld-sprache.js", "stamm/feld-dsl.js", "stamm/feld-leben.js", "stamm/klang.js", "klang-core.js",
            "stamm/dirigent-takt.js", "scripts/diag-weltakt-wache.cjs", "scripts/lib/welt-boot.cjs", "scripts/lib/ausgabe-aufnahme.cjs"],
        quelle: "1 = Gewöhnung (δ von Tat 10 ≤ 0,3 × Tat 1) und Antwort am Ort (ΔE ≥ 2 am Ort der Tat gegen die Nachbarzelle, oder ein Klang-Parameter am Ort) an einer Pose",
    },

    // ───────── affekt.K4 Staffel 1 — die Stimme des Felds (Zweig w3s-stimme) ─────────
    // Der Gang (`stimmeGang`, oben) auf einer Null-Seite: 30 Spielminuten mit Nexus, KI und Spieler; jede Zeile der Dialog-Box gegen
    // die Wahrheit der Effekt-Tafel (Schreiber, Ort, Ursache, Gesetz, die übrigen Taten), je 30 s höchstens eine Zeile, keine Zeile
    // ohne Tat, keine Tat im Blick ohne Zeile, jede Klasse wirkt (Nexus, sein Gesetz, sein Wetter-Wunsch, KI, ihr Gesetz, Spieler,
    // fern). Headless (Null-Renderer, Zweig w3s-stimme am Kopf 232b6f23, trocken über diesen Befehl): 30 Spielminuten, 55 Zeilen, 0 falsch,
    // Abstand 30 s, 0 ohne Tat, Klassen Nexus 66 · sein Gesetz 214 · sein Wetter-Wunsch 21 · KI 3 · ihr Gesetz 11 · Spieler 2 · fern
    // 86 — GRÜN; Mutante „schreiber" ROT (jede Gesetzes-Zeile „Der Nexus"), Mutante „takt" ROT (243 Zeilen, Abstand 0 s). Vorher
    // (main 557d4aad, derselbe Gang): der Nexus würfelte `say` aus dem Pool (Zeile ohne Tat), sein Wetter war keine Tat (ohne Zeile),
    // die Ursache einer Tat im Zweig eines `when` hieß „aus eigenem Antrieb".
    {
        kriterium: "affekt.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + knapp(stimmeLauf) + ")()", "{AUS}", "-", knapp(stimmeGang), knapp(stimmeUrteil)],
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j) => {
            const g = j && Array.isArray(j.laeufe) ? j.laeufe[0] : null;
            if (!g || j.fehler || g.mutante) return { gruen: false, zahl: "kein Gang" + (j && j.fehler ? ": " + j.fehler : "") };
            const rot = stimmeUrteil(g);
            return {
                gruen: rot.length === 0,
                zahl: g.minuten + " Spielminuten, " + g.zeilen + " Zeilen, " + g.falschN + " falsch, Abstand " + g.abstand + " s, offen " + g.offen +
                    " s, ohne Tat " + g.ohneTat.length + ", Klassen " + JSON.stringify(g.klassen) + (rot.length ? " · " + rot.slice(0, 3).join(" · ") : ""),
            };
        },
        pfad: ["stamm/feld-sprache.js", "stamm/feld-dsl.js", "stamm/feld-nexus.js", "stamm/feld-leben.js", "stamm/werkstatt-hud.js",
            "stamm/bild-himmel.js", "stamm/dirigent-takt.js", "stamm/kreatur-leben.js", "scripts/lib/welt-boot.cjs", "scripts/lib/ausgabe-aufnahme.cjs"],
        quelle: "1 = jede Tat von Nexus oder KI im Blick schreibt eine Zeile mit Ort, Ursache und Gesetz in die Dialog-Box, Faktentreue gegen state 100 %, ≤ 1 Zeile je 30 s (Vorlage ohne Modell)",
    },

    // ───────── affekt.K1 Staffel 2 — die schädliche Tat kehrt das Vorzeichen um (Zweig affekt-wert) ─────────
    // Der Wert-Gang (`wertGang`, oben) in EINER Werkbank an der Weiche an der Mess-Wiese, Port {PORT}+20000: vier Gänge (12 und
    // 22 Uhr × Ego und Third) mit den echten Verben — fällen (tryMouseBreak), töten (damageCreature von Spieler-Hand), pflegen
    // („pflege das land") —, dann 30 min Ruhe in Spielzeit und wieder pflegen. GRÜN, wenn in jedem Gang: fällen und töten werten
    // negativ (δ < 0) und die Stimme des Orts im Ausgabe-Pfad verstummt (< 0 dB), pflegen wertet positiv und sie singt auf
    // (> 0 dB), nach der Ruhe wertet pflegen wieder ≥ 0,9 seines Ertrags (die Erwartung des Orts ist vergessen: die Baseline),
    // jede Antwort binnen 2 s, 32 m daneben |Antwort| ≤ 0,5 dB; am Tag antwortet der Vogel-Chor, in der Nacht die Grillen.
    // Headless (Null-Renderer, affekt-wert): fällen δ −0,12 / −4,79 dB, töten −0,03 / −1,2 dB, pflegen +0,25 / +9,0 dB, Ruhe
    // 0,243–0,246 von 0,247–0,25, Antwort 0,05 s, Nachbar 0 — in allen vier Gängen. Vorher (main 19606f2e, derselbe Gang
    // headless) ROT: fällen und töten keine Tat (das Buch nennt keinen Op, 0 dB), nachts 0 dB auch beim Pflegen.
    // IN DER SITZUNG (29.10.): die Diagonale WERT_GAENGE (12 Uhr Ego, 22 Uhr Third) — die Gänge fällen, töten und bauen in der Welt
    // (mutiert)
    {
        kriterium: "affekt.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 43,2 s GRÜN am Deckel 45 — die GTX risse ihn): der Deckel steht in der Tafel der Fahrt (punkte.cjs DIE DECKEL)
        // DER DECKEL NACH SEINER MESSUNG (w4-fehlt-acht): Radeon eich3–5 (4f098fa6, 00763f54) 3,0 · 3,0 · 2,4 s am selben Abdruck —
        // 10 s, das Mindeste der Fahrt (vorher die Kappe 33 s)
        probe: { sek: 10, befehl: ["node", "-e", "(" + knapp(wertLauf) + ")()", "{AUS}", "{PORT}", "wert", knapp(wertGang)], mutiert: true, },
        gpu: true,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const G = zeilenVon(lauf, "WERT-GANG");
            const kaputt = G.find((g) => g.fehler);
            if (G.length !== WERT_GAENGE.length || kaputt)
                return { gruen: false, zahl: "Gänge " + G.length + "/" + WERT_GAENGE.length + " (Exit " + lauf.exit + (kaputt ? ": " + kaputt.fehler : "") + ")" };
            const am = (x) => x.db !== null && x.s <= 2 && Math.abs(x.nachbar) <= 0.5;
            const gut = (g) => {
                const [f, t, p, ruhe] = [g.faellen, g.toeten, g.pflegen, g.ruhe];
                return (
                    [f, t, p, ruhe].every(am) && f.op === "faellen" && t.op === "toeten" && f.delta < 0 && t.delta < 0 && f.db < 0 && t.db < 0 && p.delta > 0 && p.db > 0 &&
                    ruhe.delta >= 0.9 * ruhe.ertrag && ruhe.delta > 0 && ruhe.db > 0 && f.stimme === (g.sonne > 0 ? "vogel" : "grille")
                );
            };
            const ganz = G.some((g) => g.sonne > 0) && G.some((g) => g.sonne < 0) && new Set(G.map((g) => g.sicht)).size === 2;
            const db = (x) => x.delta + " " + x.db + " dB";
            return {
                gruen: ganz && G.every(gut),
                zahl: G.map((g) => (g.sonne > 0 ? "Tag " : "Nacht ") + g.sicht + " " + (gut(g) ? "GRÜN" : "ROT") + ": fällen " + db(g.faellen) + " · töten " +
                    db(g.toeten) + " · pflegen " + db(g.pflegen) + " · nach 30 min " + db(g.ruhe) + " (Ertrag " + g.ruhe.ertrag + ")").join(" | "),
            };
        },
        pfad: ["stamm/feld-sprache.js", "stamm/feld-dsl.js", "stamm/feld-leben.js", "stamm/klang.js", "klang-core.js", "stamm/werkstatt-bauen.js",
            "stamm/kreatur-leben.js", "stamm/kampf.js", "stamm/dirigent-takt.js", "scripts/werkbank.cjs", "scripts/lib/welt-boot.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs", "scripts/lib/welt-orte.cjs"],
        quelle: "2 = eine schädliche Tat kehrt das Vorzeichen um, nach 30 min Ruhe Baseline, Tag und Nacht, Ego und Third, beide Geräte",
    },

    // ───────── affekt.K2 Staffel 1 — die Emotion formt die Welt über ein Gesetz mit Quelle (Zweig affekt-emotion) ─────────
    // Die Szene `gemuetWetter` (oben) in EINER Werkbank an der Weiche an der Mess-Wiese, Port {PORT}+20000, drei Läufe vom selben
    // Anfang: echt, die Achse hope eingefroren (starr), das Gesetz emotion:hope pausiert (gesetz-aus). GRÜN, wenn alle drei gleich
    // oft bauen (dieselbe Tat), echt die Hoffnung über die Schwelle trägt und ihr Gesetz feuert, mindestens ein Zug den Wunsch
    // mit der Quelle rule:emotion:hope zieht, echt ≥ 3 Züge mehr Sonne zieht als starr, starr der Front folgt (Sonne = Sonne der
    // Front) und gesetz-aus starr gleicht (ohne das Gesetz keine Kopplung — kein fester Trigger daneben).
    // Headless (Werkbank, swiftshader, Stationslauf am Zweig affekt-emotion): 49 Bauten je Lauf; echt Sonne 12/15 (10 Züge aus
    // rule:emotion:hope, Hoffnung 908 s über 0,7, das Gesetz feuert 34×), starr 3/15 = Front, gesetz-aus 3/15. Vorher (main
    // a03b7b06): die Kopplung war ein fester Trigger in updatePlayerEmotions, kein Gesetz emotion:hope — die Station ROT.
    {
        kriterium: "affekt.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + knapp(affektLauf) + ")()", "{AUS}", "{PORT}", "gemuet", knapp(gemuetWetter)],
        gpu: false,
        zeit: false,
        minuten: 20,
        urteil: (j, lauf) => {
            const L = zeilenVon(lauf, "AFFEKT-gemuet");
            const [e, st, aus] = [null, "starr", "gesetz-aus"].map((m) => L.find((x) => x.mutante === m));
            if (!e || !st || !aus) return { gruen: false, zahl: "Läufe " + L.length + "/3 (Exit " + lauf.exit + ")" };
            const gleich = e.bauten > 0 && e.bauten === st.bauten && e.bauten === aus.bauten;
            const gruen =
                gleich && e.gesetz && e.gesetz.feuer > 0 && e.hoffnungS > 0 && e.ausGesetz >= 1 && e.sonne - st.sonne >= 3 &&
                st.sonne === st.frontSonne && aus.sonne === st.sonne && st.ausGesetz === 0 && aus.ausGesetz === 0;
            return {
                gruen,
                zahl:
                    "Sonne echt " + e.sonne + "/" + e.zuege + " (" + e.ausGesetz + " Züge aus rule:emotion:hope, das Gesetz feuert " +
                    (e.gesetz ? e.gesetz.feuer : "—") + "×, Hoffnung " + e.hoffnungS + " s über der Schwelle) · starr " + st.sonne +
                    " (Front " + st.frontSonne + ") · Gesetz pausiert " + aus.sonne + " · Bauten " + [e, st, aus].map((x) => x.bauten).join("/"),
            };
        },
        pfad: ["stamm/feld-sprache.js", "stamm/feld-dsl.js", "stamm/feld-leben.js", "stamm/bild-himmel.js", "stamm/dirigent-takt.js",
            "stamm/werkstatt-bauen.js", "stamm/speicher-laden.js", "phyto-core.js", "scripts/werkbank.cjs", "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs"],
        quelle: "1 = eine getragene Stimmung verschiebt am Ort EINE Größe (Wetter-Wahrscheinlichkeit, Kreatur-Laune, Klang oder Materie-Antwort) gegen den Gegenlauf mit eingefrorener Emotion-Achse",
    },

    // ───────── affekt.K3 Staffel 1 — der Nexus wählt aus: die Wertung δ trägt seine Regeln (Zweig affekt-emotion) ─────────
    // Die Szene `nexusZeitraffer` (oben) in EINER Werkbank an der Weiche an der Mess-Wiese, Port {PORT}+20000: je Saat des
    // Nexus-Stroms (0, 1, 2) drei Läufe zu 30 Spielminuten vom selben Anfang — echt, mit gemischtem δ (zufälliges Vorzeichen,
    // gezählt nach dem Wert der echten Wertung), mit stummer Wertung. Je Variante über die Saaten gepoolt: Regeln mit value > 0
    // durch alle Regeln im ersten und im letzten Drittel. GRÜN, wenn echt im letzten Drittel einen höheren Anteil trägt als im
    // ersten UND als das gemischte δ im letzten, die stumme Wertung nicht steigt, und die Stimme des Felds mindestens eine Tat
    // eines Nexus-Gesetzes im Blick spricht (Ort, Ursache, „Gesetz Nr. … des Nexus").
    // Headless (Werkbank, swiftshader, zwei Stationsläufe am Zweig affekt-emotion; das Wirk-Tor liest die fps, die Läufe streuen):
    // echt 0,493 → 0,761 und 0,302 → 0,795, gemischt 0,233 → 0,286 und 0,317 → 0,100, stumm 0 → 0; die Zeile „Ein Gesetz des
    // Nexus trägt Leben ins Feld an einer Stelle — 48 m südwestlich von dir, weil lebendig am Ort hoch ist (>0.59). (Gesetz Nr. 17
    // des Nexus …)". Vorher (main a03b7b06): unter dem Takt der Szene verfiel jede Nexus-Regel im
    // ersten Takt (die Geburt auf der Wanduhr), und mit der Uhr des Takts erneuerte die Fitness-Summe jede feuernde Regel bis
    // value −0,67 (echt 0,80 → 0,75, gemischt 0,59 → 0,52) — ROT.
    {
        kriterium: "affekt.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + knapp(affektLauf) + ")()", "{AUS}", "{PORT}", "nexus", knapp(nexusZeitraffer)],
        gpu: false,
        zeit: false,
        minuten: 30,
        urteil: (j, lauf) => {
            const L = zeilenVon(lauf, "AFFEKT-nexus");
            if (L.length !== 9) return { gruen: false, zahl: "Läufe " + L.length + "/9 (Exit " + lauf.exit + ")" };
            const pool = (m) => {
                const q = L.filter((x) => x.mutante === m);
                const s = (k, i) => q.reduce((a, x) => a + x[k][i], 0);
                return { e: s("erstes", 0) / Math.max(1, s("erstes", 1)), l: s("letztes", 0) / Math.max(1, s("letztes", 1)), q };
            };
            const [e, g, a] = [pool(null), pool("gemischt"), pool("aus")];
            const zeile = e.q.flatMap((x) => x.zeilen).find((z) => /Gesetz Nr\. \d+ des Nexus/.test(z));
            const f = (x) => x.toFixed(3);
            return {
                gruen: e.l > e.e && e.l > g.l && !(a.l > a.e) && !!zeile,
                zahl:
                    "value > 0 echt " + f(e.e) + " → " + f(e.l) + " · gemischt " + f(g.e) + " → " + f(g.l) + " · stumm " + f(a.e) + " → " +
                    f(a.l) + " · Stimme: " + (zeile ? zeile.slice(0, 120) : "keine Zeile eines Nexus-Gesetzes"),
            };
        },
        pfad: ["stamm/feld-dsl.js", "stamm/feld-nexus.js", "stamm/feld-leben.js", "stamm/feld-sprache.js", "stamm/dirigent-takt.js",
            "stamm/speicher-laden.js", "scripts/werkbank.cjs", "scripts/lib/welt-boot.cjs", "scripts/lib/welt-orte.cjs"],
        quelle: "1 = Selektion gemessen: der Anteil der Regeln mit value > 0 steigt vom ersten zum letzten Drittel UND schlägt den Gegenlauf mit gemischtem δ",
    },

    // ───────── oekologie.K2 / K1 / K5 — Zweig oeko-bestand-k2 (tetrapoda BESTAND_GESETZ, UMWEG_GESETZ) ─────────
    // Proben der Kreatur-Linse (Null-Renderer, R3: sie messen ein Gesetz). kaskade: der echte Lebenszyklus
    // (tickFaunaLifecycle) im Zeitraffer an EINEM Ort, die Bühne leer, der Spieler ruhig; folgen: „folge mir“ über die
    // Chat-DSL, der Spieler geht 10 min mit W im echten Sim-Schritt um Wand und gedrehtes Haus, über einen Sockel. An main
    // fehlen die Proben (ROT „keine Zeile“).
    {
        kriterium: "oekologie.K2",
        staffel: 1,
        geraet: "headless",
        // seit heim-z29b ein Szenario der Kaskade (die Probe bestand an EINER Saat fiel, Linse ersetzt Linse): das Leben des
        // Felds ab der ersten Stunde halbiert gegen den Grundlauf, je Saat der Bestand der 6. Stunde — Effekt und Intervall
        // [kleinste, größte Differenz] über 8 Saaten; der Grundbestand der 2. Stunde je Saat (nie vakuös), die Hungertode
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "kaskade"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "kaskade");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe kaskade (Exit " + lauf.exit + ")" };
            const [N, T] = [z.richtungen && z.richtungen.nahrung, z.hungertod];
            if (z.fehler || !N || !T || !Array.isArray(z.saaten))
                return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne Richtung nahrung, Hungertod oder Saaten") };
            const grund = Math.min(...z.saaten.map((je) => Object.values(je).reduce((s, [a]) => s + a, 0)));
            const gruen =
                z.saaten.length >= 8 && grund >= 4 && N.effekt <= -0.3 && N.ki[1] < 0 && T.n >= 1 && T.aeltester === T.n &&
                z.kappe === 0;
            return {
                gruen,
                zahl:
                    z.saaten.length + " Saaten · Grundbestand min " + grund.toFixed(2) + " · halbe Nahrung " + N.effekt + " [" +
                    N.ki.join(", ") + "] · " + T.n + " Hungertode, " + T.aeltester + " die Ältesten · Takte an der Kappe " + z.kappe,
            };
        },
        pfad: [...KREATUR],
        quelle: "1 = Geburt und Tod folgen der Nahrung an einem Ort (Mutante Nahrung halbiert → Bestand fällt)",
    },
    // Staffel 2 (Zweig oeko-k2-bestand-neu, neu gesetzt auf main 715754fc): der Teil bestand der Probe kaskade (Familie der Station #1, derselbe Lauf, Null-
    // Renderer) — der Bestand ist das Verzeichnis je Region (Kachel der Revier-Fläche, `state.faunaBestand`), ein Leib nur
    // seine Zeichnung. Je Saat 8 Spielstunden am echten Lebenszyklus, der Spieler an der Ecke von vier Regionen: Grundlauf mit
    // der Kappe des Spiels (20), Mutante „Kappe halbiert“ (der Eingriff ohne Wolf bei Kappe 10 gegen denselben Eingriff bei 20 —
    // Soll: je Takt und naher Region dieselben Tiere, Leiber ≤ Kappe, der Bestand über der Kappe), Mutante „Nahrung halbiert“
    // (Soll: in jeder Region, nah UND fern, Effekt ≤ −15 % mit 95-%-Intervall < 0); vier ferne Regionen als Zahl gelesen (ohne
    // Leib), kein Leib aus einer fernen Region; der Takt des Lebenszyklus p95 ≤ 5,8 ms (der CPU-Takt des Profi-Bands). An main
    // fehlt der Teil (ROT „ohne Bestand“). Am Zweig oeko-k2-bestand-neu (headless, trocken am Lauf der Linse): 0 von 17280
    // Takten andere Tiere, Leiber 20/10 bei Bestand 34,5, halbe Nahrung senkt 8 von 8 Regionen (−0,345 … −0,416); der Takt p95
    // 6,7 ms auf der geteilten Cloud-VM (der alte Zweig d9928c7e am selben Ort 8,0, an seiner eigenen 5,1) — das Urteil der
    // Kosten fällt an der Farm.
    {
        kriterium: "oekologie.K2",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "kaskade"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "kaskade");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe kaskade (Exit " + lauf.exit + ")" };
            const B = z.bestand;
            if (z.fehler || !B || !Array.isArray(B.nahrung) || !Array.isArray(z.saaten) || !(B.ms >= 0))
                return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne Bestand, Nahrung, Saaten oder Kosten") };
            const N = B.nahrung;
            const fern = N.slice(B.nah);
            const senkt = N.filter((o) => o.grund >= 1 && o.effekt <= -0.15 && o.ki[1] < 0).length;
            const gruen =
                z.saaten.length >= 8 && B.nah >= 2 && B.takte > 0 && B.anders === 0 && B.leiber[0] <= 20 && B.leiber[1] <= 10 &&
                B.zahl > 20 && B.fremd === 0 && fern.length >= 4 && senkt === N.length && B.ms <= 5.8;
            return {
                gruen,
                zahl:
                    z.saaten.length + " Saaten · Kappe halbiert: " + B.anders + " von " + B.takte + " Takten andere Tiere in " +
                    B.nah + " nahen Regionen, Leiber " + B.leiber.join("/") + " bei Bestand " + B.zahl + " · halbe Nahrung senkt " +
                    senkt + " von " + N.length + " Regionen (" + fern.length + " fern, Effekt " +
                    Math.max(...N.map((o) => o.effekt)) + " … " + Math.min(...N.map((o) => o.effekt)) + ") · Takt p95 " + B.ms +
                    " ms",
            };
        },
        pfad: [...KREATUR],
        quelle: "2 = überall; fern als Zahl, nah als Körper; die Kappe am Schirm ändert nur, wer gezeichnet wird, nie den Bestand; im Profi-Band",
    },
    {
        kriterium: "oekologie.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "kaskade"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "kaskade");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe kaskade (Exit " + lauf.exit + ")" };
            if (z.fehler || !Array.isArray(z.saaten)) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne saaten") };
            const paare = z.saaten.flatMap((je) => Object.values(je));
            const da = paare.filter(([a]) => a >= 1);
            const bruch = paare.filter(([a, e]) => (a >= 1 ? !(e >= a / 3 && e <= 3 * a) : e > 3));
            const q = da.map(([a, e]) => e / a);
            return {
                gruen: z.saaten.length >= 8 && da.length >= 16 && !bruch.length && z.kappe === 0,
                zahl:
                    z.saaten.length + " Saaten · " + da.length + " ansässige Bestände · Stunde 8 gegen 2: " +
                    (q.length ? Math.min(...q).toFixed(2) + "–" + Math.max(...q).toFixed(2) + "×" : "–") + " · außer Band " +
                    bruch.length + " · Takte an der Kappe " + z.kappe,
            };
        },
        pfad: [...KREATUR],
        quelle: "1 = jede Art bleibt in [⅓×, 3×] des Starts, ohne Aussterben und ohne Ausbruch, über ≥ 8 Seeds",
    },
    {
        kriterium: "oekologie.K1",
        staffel: 2,
        geraet: "headless",
        // derselbe Lauf wie Staffel 1 (Zwilling): je Saat 6 Spielstunden je Szenario gegen den Grundlauf — die Wölfe entfernt,
        // die Hirsche bejagt, die Mutante „Fraß-Leser aus“ ohne Wölfe; je Richtung der Effekt (Mittel der Differenzen je Saat
        // durch das Mittel des Grundlaufs) und das Intervall [kleinste, größte Differenz] der Saaten (Ordnungs-Statistik: über
        // 8 Saaten deckt es den Median mit 99,2 %). Gelesen werden die Zahlen, nie das Urteil der Probe.
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "kaskade"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "kaskade");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe kaskade (Exit " + lauf.exit + ")" };
            const R = z.richtungen;
            if (z.fehler || !R || !R.mutante || !Array.isArray(z.saaten))
                return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne Richtungen, Mutante oder Saaten") };
            const traegt = (q, soll) => (soll > 0 ? q.effekt >= soll && q.ki[0] > 0 : q.effekt <= soll && q.ki[1] < 0);
            const mutanteRot = !traegt(R.mutante, -0.2);
            const zu = (k) => k + " " + R[k].effekt + " [" + R[k].ki.join(", ") + "]";
            return {
                gruen:
                    z.saaten.length >= 8 && traegt(R.hirsche, 0.3) && traegt(R.jungwuchs, -0.2) && traegt(R.woelfe, 0) &&
                    mutanteRot,
                zahl:
                    z.saaten.length + " Saaten · " + ["hirsche", "jungwuchs", "woelfe", "mutante"].map(zu).join(" · ") +
                    " · Mutante " + (mutanteRot ? "ROT" : "trägt"),
            };
        },
        pfad: [...KREATUR],
        quelle: "2 = die drei Richtungen (Wölfe weg → Hirsche +≥ 30 % und Jungwuchs −≥ 20 %; Hirsche bejagt → Wölfe nehmen ab) mit Konfidenz-Intervall, das 0 nicht schneidet; die Mutante „Fraß-Leser aus“ ist ROT",
    },
    {
        kriterium: "oekologie.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "folgen"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "folgen");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe folgen (Exit " + lauf.exit + ")" };
            if (z.fehler || !z.hindernisse) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne hindernisse") };
            const W = z.hindernisse.filter((h) => h.art !== "sockel");
            const S = z.hindernisse.find((h) => h.art === "sockel") || {};
            const halt =
                W.length >= 3 && W.every((h) => h.kontakt > 0 && h.drin === 0 && h.quer === 0 && h.vornMinM > 0) &&
                S.ueber >= 30 && !S.imSockel;
            const gruen =
                z.bindung[0] > 0 && z.bindung[1] > z.bindung[0] && z.proben >= 600 && z.aufgabe === z.proben &&
                z.abstand.p95 <= 10 && halt && z.gegenlauf.abstandM >= 30;
            return {
                gruen,
                zahl:
                    z.proben + " s gebunden (bond " + z.bindung.join(" → ") + "): Abstand p50 " + z.abstand.p50 + " · p95 " +
                    z.abstand.p95 + " · max " + z.abstand.max + " m · " + W.length + " Wände ohne Durchdringung, Sockel " +
                    S.ueber + " Takte darüber · Hang > 15° " + z.steilS + " s, nass " + z.nassS + " s · ungebunden " +
                    z.gegenlauf.abstandM + " m",
            };
        },
        pfad: [
            ...KREATUR,
            "stamm/koerper-bewegung.js",
            "stamm/gelaende-kollision.js",
            "stamm/feld-sprache.js",
            "stamm/feld-dsl.js",
        ],
        quelle: "1 = ein gebundenes Tier folgt ≥ 10 min über Hindernisse",
    },
    {
        kriterium: "oekologie.K5",
        staffel: 2,
        geraet: "headless",
        // `bindungAnsteckung` (oben): A B A B je 120 s Spiel-Takt, gebunden gegen bond = 0, dann Speichern → Reload. Messbar heißt:
        // jedes A über jedem B und Δ der Mittel ≥ 3 × das Rauschen der Wiederholung (mindestens 0,01 der Valenz); jedes Tier lebt,
        // folgt und steht im Median ≤ 10 m vom Spieler, der Spieler bleibt ≤ 1 m an seinem Ort (sonst misst der Lauf keine Ansteckung)
        befehl: ["node", "-e", "(" + bindungAnsteckung.toString() + ")()", "{AUS}", "{PORT}"],
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            if (!j || !Array.isArray(j.laeufe)) return { gruen: false, zahl: "kein Ergebnis in {AUS} (Exit " + lauf.exit + ")" };
            const F = j.fehler || [];
            const A = j.laeufe.filter((x) => x.art === "A");
            const B = j.laeufe.filter((x) => x.art === "B");
            if (A.length !== 2 || B.length !== 2)
                return { gruen: false, zahl: "Läufe A " + A.length + " · B " + B.length + " von je 2 (" + F.join("; ").slice(0, 240) + ")" };
            const va = A.map((x) => x.valenz);
            const vb = B.map((x) => x.valenz);
            const delta = (va[0] + va[1]) / 2 - (vb[0] + vb[1]) / 2;
            const rausch = Math.max(Math.abs(va[0] - va[1]), Math.abs(vb[0] - vb[1]));
            const nah = j.laeufe.every((x) => x.lebt && x.auftrag === "follow_player" && x.abstand.p50 <= 10 && x.verschoben <= 1);
            const bondA = A.every((x) => x.bond[0] > 0 && x.bond[1] > x.bond[0]);
            const bondB = B.every((x) => x.bond[0] === 0 && x.bond[1] === 0);
            const rl = j.reload || {};
            const reload =
                Array.isArray(rl.vor) && Array.isArray(rl.nach) && rl.vor[0] > 0 && rl.vor[1] === "follow_player" &&
                JSON.stringify(rl.vor) === JSON.stringify(rl.nach);
            const messbar = Math.min(...va) > Math.max(...vb) && delta >= Math.max(0.01, 3 * rausch);
            return {
                gruen: lauf.exit === 0 && !F.length && nah && bondA && bondB && messbar && reload,
                zahl:
                    "Stimmung nach 120 s gebunden " + va.join("/") + " gegen bond = 0 " + vb.join("/") + " (Δ " + delta.toFixed(4) +
                    ", Rauschen " + rausch.toFixed(4) + ") · bond A " + A.map((x) => x.bond.join(" → ")).join(", ") + " · Abstand p50 " +
                    j.laeufe.map((x) => x.abstand.p50).join("/") + " m, Spieler verschoben " + j.laeufe.map((x) => x.verschoben).join("/") +
                    " m · Reload " + JSON.stringify(rl.vor || null) + " → " +
                    JSON.stringify(rl.nach || null) + (F.length ? " · " + F.join("; ").slice(0, 200) : ""),
            };
        },
        pfad: [
            ...KREATUR,
            "stamm/feld-sprache.js",
            "stamm/koerper-bewegung.js",
            "stamm/gelaende-boden.js",
            "stamm/siedlung-ort.js",
            "stamm/speicher-*.js",
            "stamm/dienst.js",
            "stamm/dirigent-*.js",
            "index.html",
        ],
        quelle:
            "2 = die Ansteckung verschiebt die Stimmung des Spielers messbar gegen einen Gegenlauf mit bond = 0, und die Bindung übersteht den Reload",
    },

    // ───────── oekologie.K4 Staffel 1 — der Spieler als Beute (Zweig ok4-beute: EINE Witterung für Tier und Spieler) ─────────
    // Probe rudel der Kreatur-Linse (Null-Renderer): ein Rudel aus dem Wurf (`_kreaturWurf`, die Leine am Wurf-Ort), der
    // stehende Spieler 45 m vom Wurf-Ort (jenseits der Neugier, in der Witterung jagd.scentRangeM), höchstens 600 s der
    // Kreatur-Uhr, davor je 2 s Frieden und der leere Anker vor dem Guss des Leibs (keine Pirsch). Gelesen werden die
    // Ereignisse, nie das Urteil der Probe: die erste Pirsch auf den Spieler (ein Wolf im Zustand „jagd" mit dem Ziel
    // „spieler") und das erste Umstellen (≥ 3 Jäger näher als 2 × jagd.hetzM, die größte Winkel-Lücke ≤ anderthalb Plätze,
    // 540°/n). An main 9ceeca71 ROT: der Spieler war Ziel nur in jagd.radius 12 m, das Rudel blieb 47–51 m fern, keine
    // Pirsch. „im Bild" zählt diese Station nicht: das Bild bleibt eine Radeon-Schau.
    {
        kriterium: "oekologie.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "rudel"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "rudel");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe rudel (Exit " + lauf.exit + ")" };
            if (z.fehler || !Array.isArray(z.ohnePirsch))
                return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne ohnePirsch (die Probe vor ok4-beute)") };
            const im = (t) => t !== null && t <= 600;
            return {
                gruen: im(z.pirschS) && im(z.umstelltS) && z.ohnePirsch.every((n) => n === 0),
                zahl:
                    z.woelfe + " Wölfe aus dem Wurf, der Spieler 45 m im Revier: Pirsch " + z.pirschS + " s · umstellt " +
                    z.umstelltS + " s · Lücke beim ersten Biss " + z.lueckeBeimBiss + "° · Pirsch im Frieden / am leeren Anker " +
                    z.ohnePirsch.join(" / ") + " Takte (Soll ≤ 600 s Kreatur-Uhr, 0 / 0)",
            };
        },
        pfad: [...KREATUR],
        quelle: "1 = im Wolfsrevier wird der Spieler in 10 Spielminuten ≥ 1× gepirscht und umstellt (im Bild)",
    },

    // ───────── oekologie.K4 Staffel 2 — Furcht und Triumph aus der Situation (Zweig affekt-wert) ─────────
    // Das Rudel und das Gefühl (`rudelGefuehl`, oben) in EINER Werkbank an der Weiche an der Mess-Wiese, Port {PORT}+20000: je Sicht
    // (Ego, Third) der Lauf im pfad und sein Gegenlauf (Frieden, dieselbe Zeit, dieselbe Zahl gefallener Wölfe). GRÜN, wenn in
    // beiden Sichten: das Rudel umstellt ihn (≤ 600 s), seine Furcht steht 20 s danach (chaos ≥ 0,3, Gegenlauf ≤ 0,05), ≥ 1 Jäger
    // fällt, und der Triumph steigt (joy + hope in 5 s ≥ 0,1 über dem Wert beim Fall, Gegenlauf ≤ 0,02). Gelesen wird die Emotion,
    // die δ aus der Situation schreibt (`_playerSituationWohl`: das Umstellen der Jäger des Spielers), nie ein Stempel — der
    // Triumph-Stempel fiel mit affekt-wert. Headless (Null-Renderer, frische Seite wie hier, zwei Läufe): Ego umstellt 15,6 /
    // 16,4 s, chaos 0,99 / 1,0, Triumph joy + hope +0,308 / +0,240; Third 14,7 / 15,2 s, chaos 0,93 / 1,0, +0,559 / +0,610; die
    // Gegenläufe 0. Vorher (main 19606f2e, dieselbe Szene headless) ROT: umstellt 16,2–19,9 s, chaos 0.
    // IN DER SITZUNG (29.10.): Ego und sein Gegenlauf (RUDEL_SICHTEN) — die Szene schaltet Nexus und Weltgesetze ab (mutiert)
    {
        kriterium: "oekologie.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // DER DECKEL NACH SEINER MESSUNG (w4-fehlt-acht): Radeon eich3 · eich5 30,6 · 23,4 s am selben Abdruck — 31 s (vorher die
        // Kappe 33 s)
        probe: { sek: 31, befehl: ["node", "-e", "(" + knapp(wertLauf) + ")()", "{AUS}", "{PORT}", "rudel", knapp(rudelGefuehl)],  mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 10,
        urteil: (j, lauf) => {
            const L = zeilenVon(lauf, "RUDEL-GEFUEHL");
            const paare = RUDEL_SICHTEN.map((s) => [L.find((x) => x.sicht === s && !x.gegen), L.find((x) => x.sicht === s && x.gegen)]);
            if (paare.some(([a, g]) => !a || !g)) return { gruen: false, zahl: "Läufe " + L.length + "/" + 2 * RUDEL_SICHTEN.length + " (Exit " + lauf.exit + ")" };
            const tr = (x) => +(x.triumph.joy + x.triumph.hope).toFixed(3);
            const gut = ([a, g]) =>
                a.umstelltS !== null && a.umstelltS <= 600 && a.opfer >= 1 && a.furcht.chaos >= 0.3 && g.furcht.chaos <= 0.05 && tr(a) >= 0.1 && tr(g) <= 0.02;
            return {
                gruen: paare.every(gut),
                zahl: paare.map(([a, g]) => a.sicht + " " + (gut([a, g]) ? "GRÜN" : "ROT") + ": umstellt " + a.umstelltS + " s, Furcht chaos " + a.furcht.chaos +
                    " (Gegenlauf " + g.furcht.chaos + "), " + a.opfer + " Jäger fallen, Triumph joy+hope " + tr(a) + " (Gegenlauf " + tr(g) + ")").join(" | "),
            };
        },
        pfad: [...KREATUR, "stamm/feld-sprache.js", "scripts/werkbank.cjs", "scripts/lib/ausgabe-aufnahme.cjs", "scripts/lib/welt-orte.cjs"],
        quelle: "2 = seine Emotion-Achsen antworten (Furcht beim Umstellen, Triumph nach dem Fall des Jägers) gegen einen Gegenlauf, beide Geräte",
    },

    // ───────── mensch.K2 Staffel 2 — die Ankunft der Bewohner (mensch-bewohner-k5 1e4e725a) ─────────
    {
    kriterium: "mensch.K2",
    staffel: 2,
    geraet: ["radeon", "gtx"],
    // die Ankunft (`_bewohnerAnkunft`, mensch-bewohner-k5) im Fenster der echten GPU, wie M40: EINE Werkbank-Sitzung `--echt`
    // gegen einen eigenen save-server, darin `diag-kreatur-takt --werkbank --proben bewohner` — alle Bewohner des Start-Dorfs
    // über 24 Spielstunden je ≥ 0,9 ihrer Soll-Orte (unterN 0), 4–10 Wege je Bewohner und Tag, und je 1,5 h die Lage, die sah,
    // wer blieb, gegen die, die findet, wer 1 h fort war (16 Prüf-Stunden, die Liste neu, die Uhr gesprungen): jeder ±2 m.
    // Das Schlupfloch Teleport fällt an sprungN, der Plan bit-gleich je Same. Ports: save-server {PORT}, Werkbank {PORT}+20000.
    // IN DER SITZUNG (29.10.): der Zwilling von mensch.K1#1 (BEWOHNER_SITZUNG) — EIN Lauf der Probe bewohner, das Urteil liest die
    // Zeile bewohner (die Platz-Zeile daneben liest es nicht)
    probe: { ...BEWOHNER_SITZUNG,  mutiert: true },
    gpu: true,
    zeit: false,
    minuten: 10,
    urteil: (j, lauf) => {
        const z = probeZeile(lauf.stdout, "bewohner");
        if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner im Fenster (Exit " + lauf.exit + ")" };
        if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
        const w = z.wege || {};
        const k = z.wiederkehr || {};
        const alle = z.leiber > 0 && z.unterN === 0 && typeof z.trefferMin === "number" && z.trefferMin >= 0.9;
        const wege = w.ausserN === 0 && w.wegeMin >= 4 && w.wegeMax <= 10;
        const zurueck = k.n >= z.leiber && k.ueberN === 0 && k.maxM <= 2;
        const gruen = z.planGleich === true && sprungVon(z) === 0 && alle && wege && zurueck;
        return {
            gruen,
            zahl:
                "Soll-Orte alle " + (z.leiber - z.unterN) + "/" + z.leiber + " ≥ 0,9 (min " + z.trefferMin +
                "), Wege je Tag " + w.wegeMin + "–" + w.wegeMax + " (außer 4–10: " + w.ausserN + "), Wiederkehr nach 1 h " +
                k.ueberN + " von " + k.n + " Lagen über ±2 m (max " + k.maxM + " m), Sprünge " + sprungVon(z) +
                ", Plan bit-gleich " + z.planGleich,
        };
    },
    pfad: [
        "stamm/siedlung-*.js",
        "stamm/kreatur-*.js",
        "stamm/koerper-*.js",
        "stamm/stoff-instanz.js",
        "stamm/studio-bruecke.js",
        "stamm/gelaende-kollision.js",
        "stamm/bild-himmel.js",
        "stamm/daten.js",
        "koerper-core.js",
        "fachwerk-core.js",
        "foundry-bruecke.js",
        "save-server.js",
        "scripts/diag-kreatur-takt.cjs",
        "scripts/werkbank.cjs",
        "scripts/lib/kreatur-proben.cjs",
        "scripts/lib/software-gpu.cjs",
        "scripts/lib/welt-boot.cjs",
    ],
    quelle: "2 = alle Bewohner einer Siedlung, 4–10 Wege am Tag, Wiederkehr nach 1 h Abwesenheit auf ±2 m",
    },

    // ───────── luftwasser.K1 — DER VOGEL FLIEGT UND RUFT AUS SEINEM KÖRPER (Zweig vogel-zensus) ─────────
    // Der Lauf von klang.K1 (`diag-klang-zensus --json`, derselbe Befehl und dieselbe Umgebung: ein Zwilling, EIN Lauf). Der Vogel
    // ist das Gesetzbuch tetrapoda VOGEL_GESETZ (`_vogelGesetz`, fail-closed), im Spielpfad je Takt `_vogelTakt` (dirigent-takt), sein
    // Leib im Pool `vogelPool` (`_vogelZeichnen`, EIN Befehl). Je Ort misst der Zensus 4,5 s lang Takt für Takt die Lagen der
    // gezeichneten Teile aus dem Pool: ihr Weg je Sekunde (Median der Takte gleicher Zahl) und ihre Höhe über dem Boden (Median) —
    // `zensus.leiber {gehoert, gezeichnet, flug {mps, hoeheM}}`; die Ruf←Leib-Wand der Linse (R) ist ROT an jedem Ruf ohne
    // fliegenden Körper, ihr Selbsttest S12 friert die Bahn auf einer Uhr ein (der stehende Vogel) und lässt das Phantom ohne Leib
    // singen. Staffel 1 an der Wiese: gezeichnete Leiber > 0 rufen (die Stimme vogel spielt), fliegen ≥ 1 m/s ≥ 2 m über Grund, kein
    // Befund R und keiner G an der Wiese. Staffel 2 an jedem Ort: gehört == gezeichnet, wo der Chor singt ≥ 1 Leib, jeder Leib
    // fliegt, kein Befund R; die Mutation `wieseOhneLeib` (das Revier-Gesetz ohne Revier) zeichnet 0 Leiber und der Chor schweigt.
    // Gefahren 27.10. in der Cloud am Zweig vogel-zensus 03f3c822 (headless, Null-Renderer): Wiese 14 Leiber, 5,64 m/s, 11,0 m über Grund,
    // vogel −37,9 dB; an sechs Orten gehört = gezeichnet (6–20), Flug 4,7–5,6 m/s; ohne Leib 0 und still. An main a03b7b06 ROT
    // (die Linse misst keinen Flug).
    {
        kriterium: "luftwasser.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const w = j && j.daten && j.daten.wiese;
            const L = w && w.zensus && w.zensus.leiber;
            if (!L || !L.flug) return { gruen: false, zahl: "kein Flug der Leiber an der Wiese im Zensus (Exit " + lauf.exit + ")" };
            const ruft = w.zensus.stimmen.some((v) => v.name === "vogel" && v.an);
            const rot = (j.rot || []).filter((t) => /^(R|G) wiese:/.test(t));
            const db = w.mixMitte && w.mixMitte.vogel ? w.mixMitte.vogel.db : -999;
            return {
                gruen: L.gezeichnet > 0 && ruft && L.flug.mps >= 1 && L.flug.hoeheM >= 2 && rot.length === 0,
                zahl:
                    "Wiese " + L.gezeichnet + " Vogel-Leiber gezeichnet (" + L.gehoert + " gehört), Flug " + L.flug.mps + " m/s " +
                    L.flug.hoeheM + " m über Grund, Ruf " + (ruft ? db.toFixed(1) + " dB" : "STUMM") +
                    (rot.length ? " · " + rot.join(" · ") : "") + " (Soll: > 0 Leiber rufen, ≥ 1 m/s, ≥ 2 m)",
            };
        },
        pfad: [
            "klang-core.js",
            "tetrapoda-core.js",
            "stamm/klang.js",
            "stamm/kreatur-*.js",
            "stamm/stoff-instanz.js",
            "stamm/dirigent-takt.js",
            "stamm/gelaende-*.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "1 = ein Vogel-Körper aus einem Gesetzbuch fliegt und ruft",
    },
    {
        kriterium: "luftwasser.K1",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const d = (j && j.daten) || {};
            const orte = Object.keys(d).filter((o) => o !== "wieseOhneLeib");
            const ohne = d.wieseOhneLeib && d.wieseOhneLeib.zensus;
            if (!["wiese", "seeufer", "wald", "dorf"].every((o) => d[o] && d[o].zensus && d[o].zensus.leiber) || !ohne)
                return { gruen: false, zahl: "kein Zensus der Leiber an den vier Orten und der Mutation (Exit " + lauf.exit + ")" };
            const singt = (z) => z.stimmen.some((v) => v.name === "vogel" && v.an);
            const leer = { gehoert: 0, gezeichnet: 0 };
            const falsch = orte.filter((o) => {
                const L = d[o].zensus.leiber || leer;
                return L.gehoert !== L.gezeichnet || (singt(d[o].zensus) && !(L.gezeichnet > 0)) ||
                    (L.gezeichnet > 0 && !(L.flug && L.flug.mps >= 1 && L.flug.hoeheM >= 2));
            });
            const rot = (j.rot || []).filter((t) => /^R /.test(t));
            const stumm = (ohne.leiber || leer).gezeichnet === 0 && !singt(ohne);
            return {
                gruen: falsch.length === 0 && rot.length === 0 && stumm,
                zahl:
                    orte.map((o) => { const L = d[o].zensus.leiber || leer; return o + " " + L.gehoert + "/" + L.gezeichnet +
                        (L.flug ? " " + L.flug.mps + " m/s" : ""); }).join(" · ") + " (gehört/gezeichnet) · ohne Leib " +
                    (ohne.leiber || leer).gezeichnet + " Leiber, Chor " + (singt(ohne) ? "SINGT" : "still") +
                    (falsch.length ? " · ROT an " + falsch.join(", ") : "") + (rot.length ? " · " + rot.join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "tetrapoda-core.js",
            "stamm/klang.js",
            "stamm/kreatur-*.js",
            "stamm/stoff-instanz.js",
            "stamm/dirigent-takt.js",
            "stamm/gelaende-*.js",
            "stamm/daten.js",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
        ],
        quelle: "2 = jeder Vogel-Pegel im Klang-Zensus hat einen Körper (Konsum-Kette Ruf ← Leib), ohne Körper ROT",
    },

    // ───────── luftwasser.K2 Staffel 1 — der Schwarm aus dem Verbands-Gesetz (Zweig w3s-schwarm: `_schwarmVerband`, tetrapoda verbandZug) ─────────
    // Die Probe schwarm der Kreatur-Linse (Null-Renderer, R3: der Verband ist Mechanik, wie tiere.K1#1): der feste Schwarm von
    // 100 Gliedern im Takt des Spiels (`_vogelTakt`, 60 Hz, 60 s; Mittag und Sonne als Wort des Reglers), das Auge 40 m quer
    // zum Kurs des Zentrums (nah: der Verband fliegt). Gemessen ab 10 s an den Lagen, die der Takt zeichnet: Φ = |Σv̂|/N aus dem
    // Weg je Takt (wie die Herde), die Kohäsion = der Anteil der Glieder im größten Verbund, Glied zu Glied binnen fensterRaum ×
    // Paar-Raum (raumM) — die Zahl der Herde (binnen fensterRaum Paar-Räumen vom Mittel) trägt fünf Leiber, hundert Glieder
    // füllen einen Ball weiter als das Fenster —, und je Takt die Züge je Glied durch DIE Funktion der Herde (`verbandZug`).
    // Soll aus der Staffel: Φ ≥ 0,8 und Kohäsion ≥ 0,9; das Schlupfloch Zwilling (eigener Boid-Code) fällt an 1 Zug je Glied
    // und Takt, vakuös unter 60 Gliedern und 3000 Takten. Gefahren 28.10. in der Cloud am Zweig w3s-schwarm 1e214869: Φ 0,966,
    // Kohäsion 1,0 (min 1,0), 1,0 Züge; die Mutante „Verband aus" (der Zug gibt den Wunsch zurück) Kohäsion 0,143 ROT, der
    // Zwilling (eine Kopie des Zugs) 0 Züge ROT.
    {
        kriterium: "luftwasser.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "schwarm"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "schwarm");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe schwarm (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const echt = z.glieder >= 60 && z.takte >= 3000 && z.zuegeJeGlied >= 0.99;
            return {
                gruen: echt && z.phi >= 0.8 && z.kohaesion >= 0.9,
                zahl:
                    "Φ " + z.phi + ", Kohäsion " + z.kohaesion + " (min " + z.kohaesionMin + ", Glied zu Glied ≤ " + z.fensterM +
                    " m) bei " + z.glieder + " Gliedern, " + z.zuegeJeGlied + " Züge je Glied und Takt durch verbandZug (Soll Φ ≥ 0,8, " +
                    "Kohäsion ≥ 0,9, 1 Zug)",
            };
        },
        pfad: KREATUR,
        quelle: "1 = Vogel- oder Fischschwarm mit Φ ≥ 0,8 und Kohäsion ≥ 0,9 aus `verbandZug`",
    },
    // ───────── luftwasser.K2 Staffel 2 — die Flucht als EIN Pulk, die Landung auf den Bäumen der Welt (Zweig w3u-leittier: tetrapoda
    // schwarmLeittier, `_schwarmLeittier`, der Scheitel der Kronen-Karte `_kronenOben`) ─────────
    // Derselbe Lauf der Probe schwarm (ein Zwilling der Staffel 1, Null-Renderer, R3: Ereignis und Landung sind Mechanik), ihr
    // Akt II nach den 60 s: ein Baum an der Mitte des Kreises (im Bild gebaut), jede Krone der Welt daneben zählt; der Spieler geht
    // dem Leittier mit 5 m/s entgegen, bis es auffliegt, dann steht er. Soll aus der Staffel: der Pulk flieht — das Mittel der
    // Glieder entfernt sich vom Spieler bis zur Ruhe um ≥ 40 m, ≥ 95 % der Glieder ≥ 20 m mit, sein größter Verbund im Flug
    // (Glied zu Glied wie Staffel 1) ≥ 0,9 —, und er landet in der Ruhe auf einer Krone der Welt: das Leittier ± 0,25 m auf dem
    // Scheitel aus der Quelle, die den Baum baut (Eintrag: Fuß + `_lodTreeVisHeight`, Streu-Zelle: Fuß + `_scatterSichtHoehe`),
    // ≥ 99 % der Glieder auf der Krone (binnen Radius, unter dem Scheitel). Schlupflöcher: das Leittier als Funktion der Uhr ohne
    // Ereignis (ROT „flieht nie“), die Landung auf einer zweiten Höhe (ROT „neben dem Scheitel“). Gefahren 29.10. lokal (Laptop,
    // headless) am Zweig w3u-leittier e00c21fb: Flucht nach 5,3 s, Abstand 30,2 → 95,6 m, 1,0 der Glieder mit, Verbund 1,0;
    // Landung nach 25 s auf a:1298, Δ 0,000 m über dem Scheitel 79,0 m, 1,0 auf der Krone; die Mutanten Uhr und Höhe ROT.
    {
        kriterium: "luftwasser.K2",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "schwarm"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "schwarm");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe schwarm (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const [F, L] = [z.flucht || {}, z.landung || {}];
            if (F.ausloesS == null) return { gruen: false, zahl: "das Leittier flieht nie vor dem Spieler (30 s im Gang auf es zu)" };
            const pulk = F.ruheM - F.abstandM >= 40 && F.wegAnteil >= 0.95 && F.kohaesion >= 0.9 && F.kohaesion <= 1;
            const landet = L.nachS != null && L.dyM <= 0.25 && L.aufKrone >= 0.99;
            return {
                gruen: pulk && landet,
                zahl:
                    "Flucht nach " + (+F.ausloesS).toFixed(1) + " s, Abstand " + F.abstandM + " → " + F.ruheM + " m, " + F.wegAnteil +
                    " der Glieder mit, Verbund " + F.kohaesion + "; " +
                    (L.nachS != null
                        ? "Landung nach " + (+L.nachS).toFixed(1) + " s auf " + L.krone + ", Δ " + L.dyM + " m zum Scheitel " +
                          L.scheitelM + " m, " + L.aufKrone + " auf der Krone"
                        : "keine Landung (Modus " + L.modus + ")") +
                    " (Soll + 40 m, 0,95, 0,9; ± 0,25 m, 0,99)",
            };
        },
        pfad: [...KREATUR, "stamm/siedlung-satz.js", "stamm/vegetation-streu.js"],
        quelle: "2 = Flucht vor dem Spieler als EIN Pulk, Landung auf Bäumen der Welt",
    },

    // ───────── luftwasser.K5 — der Schwarm fern EIN Agent (Zweig schwarm: tetrapoda VOGEL_GESETZ.schwarm, `_vogelSchwarmTakt`) ─────────
    // EINE Werkbank an der Weiche (`schwarmLauf` oben, Port {PORT}+20000), die Prüfbühne mit dem festen Schwarm von 100 Gliedern,
    // das Auge 40 m quer zur Flugrichtung (nah: die Separation rechnet mit): 60 Reihen × 20 Takte des Schwarm-Takts auf der Uhr
    // der Welt, je Reihe die ms je Takt (performance.now um die Reihe) und die Lage des Takts; danach EIN gezählter Frame
    // (`__drawZensus`) an der Pose der letzten Reihe. Staffel 1: der Median ≤ 0,3 ms an der GTX-CPU, in JEDER Reihe der Schwarm
    // im Blick (seine Hülle im Frustum des Auges) mit 100 Gliedern. Staffel 2 (die Zwillings-Messung, beide Geräte): die Klasse
    // vogel (Sänger und Schwarm, EIN Stoff) ≤ 10 Befehle über alle Pässe, und der gezählte Frame zeichnet die 100 Glieder
    // (≥ 100 × Teile Instanzen der Klasse). Schlupfloch „Schwärme nur außerhalb des Blicks": die Bühne zählt die Glieder im
    // Blick je Reihe, eine Reihe ohne sie ist ROT. Gefahren 27.10. in der Cloud am Zweig schwarm 08a97885 (headless, swiftshader auf
    // 4 Kernen): 0,135 ms je Takt (Median, p95 0,735), 100 Glieder im Blick in 60/60 Reihen, Klasse vogel 2 Befehle (haupt).
    {
        kriterium: "luftwasser.K5",
        staffel: 1,
        geraet: "gtx",
        // IN DER SITZUNG (29.10.): 60 × 20 Schwarm-Takte und EIN gezählter Frame (Gegenlauf b3f9ae95: 0,04 min); die Bühne legt die
        // Schwarm-Karte neu und stellt das Fenster auf 1280×720 (mutiert) — beide Staffeln EIN Lauf (Zwillinge)
        probe: { sek: 10, befehl: ["node", "-e", "(" + knapp(schwarmLauf) + ")()", "{AUS}", "{PORT}", knapp(schwarmSzene)], mutiert: true }, // DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 0,6 s GRÜN)
        gpu: true,
        zeit: true,
        minuten: 4,
        urteil: (j) => {
            if (!j || j.fehler || !(j.msMedian >= 0))
                return { gruen: false, zahl: "ohne Messung der Prüfbühne" + (j && j.fehler ? ": " + j.fehler : "") };
            return {
                gruen: j.msMedian <= 0.3 && j.imBildMin >= 100,
                zahl:
                    "Schwarm-Takt " + j.msMedian + " ms je Takt (Median, p95 " + j.msP95 + ") bei " + j.imBildMin +
                    " Gliedern im Blick in jeder Reihe, " + j.paare + " Paare der Separation, Auge " + (j.pose && j.pose.abstand) +
                    " m (Soll ≤ 0,3 ms, 100 im Bild)",
            };
        },
        pfad: SCHWARM,
        quelle: "1 = 100 Vögel im Bild ≤ 0,3 ms CPU an der GTX-CPU",
    },
    {
        kriterium: "luftwasser.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // IN DER SITZUNG (29.10.): 60 × 20 Schwarm-Takte und EIN gezählter Frame (Gegenlauf b3f9ae95: 0,04 min); die Bühne legt die
        // Schwarm-Karte neu und stellt das Fenster auf 1280×720 (mutiert) — beide Staffeln EIN Lauf (Zwillinge)
        probe: { sek: 10, befehl: ["node", "-e", "(" + knapp(schwarmLauf) + ")()", "{AUS}", "{PORT}", knapp(schwarmSzene)], mutiert: true }, // DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 0,6 s GRÜN)
        gpu: true,
        zeit: true,
        minuten: 4,
        urteil: (j) => {
            const v = j && j.vogel;
            if (!j || j.fehler || !v) return { gruen: false, zahl: "ohne gezählten Frame" + (j && j.fehler ? ": " + j.fehler : "") };
            return {
                gruen: v.cmd >= 1 && v.cmd <= 10 && v.inst >= 100 * j.teileJe && j.imBildMin >= 100,
                zahl:
                    "Klasse vogel " + v.cmd + " Befehle " + JSON.stringify(v.je) + ", " + v.inst + " Instanzen (" + j.instanzen +
                    " des Schwarms, " + j.teileJe + " Teile je Glied), " + j.imBildMin + " Glieder im Blick je Reihe (Soll ≤ 10 Befehle)",
            };
        },
        pfad: SCHWARM,
        quelle: "2 = dazu im Haushalt ≤ 10 Befehle, beide Geräte",
    },

    // ───────── mensch.K5 Staffel 1 — die Begegnung ohne Modell (mensch-begegnung) ─────────
    {
    kriterium: "mensch.K5",
    staffel: 1,
    geraet: ["radeon", "gtx"],
    // die Begegnungs-Probe (`diag-kreatur-takt --proben begegnung`, Familie kreatur-proben) im Fenster der echten GPU, wie
    // mensch.K2#2: EINE Werkbank-Sitzung `--echt` gegen einen eigenen save-server. Im Start-Dorf um 10 Uhr (Uhr und Wetter als
    // Wort des Reglers) geht der Spieler in Ego mit 1,4 m/s an einem Stehenden vorbei (2 m daneben, die Peilung auf 3 m 40–90°
    // neben seinem Blick) und dreimal durch seinen Stand; vor dem vierten Gang schlägt er ein Wesen 5 m neben ihm
    // (`damageCreature`, Quelle Spieler). Je Takt der echte Frame (`_loopRender`, Ego-Kamera längs des Wegs), gelesen wird der
    // Kopf-Knoten nach ihm (seine Welt-Matrix, wie das Bild ihn zeichnet; gezeichnet und im Frustum). Grün: je Gang der Kopf auf
    // 10° zum Spieler ≤ 0,5 s ab 3 m (der Vorbeigang ab ≥ 30° am Ereignis — keine geschenkte Zuwendung), als Leib und im Bild;
    // kein Bewohner draußen näher als zwei Kapseln (0,7 m) zum Spieler; die Erinnerung (Furcht > 0) weitet den kleinsten
    // Abstand des vierten Gangs um ≥ 0,3 m gegen den zweiten, die Gegenprobe ohne Erinnerung (der dritte) bleibt auf 0,15 m bei
    // ihm. Ports: save-server {PORT}, Werkbank {PORT}+20000.
    // IN DER SITZUNG (29.10.): die Probe begegnung des Spiels (das Start-Dorf wächst, vier Gänge zu 1,4 m/s, je Takt ein Bild) —
    // das Dorf und das geschlagene Wesen bleiben (mutiert)
    probe: { sek: 10, befehl: [
        "bash",
        "-c",
        [
            "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"",
            "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
            "node scripts/diag-kreatur-takt.cjs --werkbank $W --proben begegnung",
        ].join("\n"),
    ],  mutiert: true },
    gpu: true,
    zeit: false,
    minuten: 8,
    // DIE FORM DER ZEILE seit mensch-begegnung 03da8f59 (27.10.): je Gang `imBild` = als Leib UND im Bild (das getrennte `nah`
    // fiel), `beruehrt` = die Takte, in denen ein Bewohner draußen näher als zwei Kapseln stand (vorher die Liste der Berührten).
    // Bis w4-stationen-heil las das Urteil die alte Form und warf („z.nah is not iterable“, b3f9ae95 bis 73bdf938 auf beiden
    // Geräten); eine fremde Form ist ein Probe-Fehler beim Namen, nie ein Wurf.
    urteil: (j, lauf) => {
        const z = probeZeile(lauf.stdout, "begegnung");
        if (!z) return { gruen: false, zahl: "keine Zeile der Probe begegnung im Fenster (Exit " + lauf.exit + ")" };
        const fremd = ["zuS", "imBild", "dMin", "beruehrt"].filter((k) => !Array.isArray(z[k]) || z[k].length !== 4);
        if (z.fehler || fremd.length) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne je vier Gänge in " + fremd.join(", ")) };
        const d = z.dMin;
        const kopf = z.zuS.every((t) => t !== null && t <= 0.5) && z.amEreignis >= 30 && z.imBild.every((x) => x === true);
        const ohne = z.beruehrt.every((n) => n === 0) && Math.min(...d) > 0.7;
        const erinnert = z.furcht > 0 && d[3] - d[1] >= 0.3 && Math.abs(d[2] - d[1]) <= 0.15;
        return {
            gruen: kopf && ohne && erinnert,
            zahl:
                z.wer + ": Kopf-Zuwendung ab 3 m " + z.zuS.join(" / ") + " s (Vorbeigang ab " + z.amEreignis +
                "°, als Leib im Bild " + z.imBild.join("/") + ") · Berührung " + z.beruehrt.join("/") + " Takte, kleinster Abstand " +
                d.join(" / ") + " m (Radien 0,7) · ohne Erinnerung " + d[1] + ", Gegenprobe " + d[2] + ", nach der Gewalt " +
                d[3] + " m (Furcht " + z.furcht + ")",
        };
    },
    // die echte Zeile der GTX an 73bdf938 (GRÜN, wie die Probe selbst urteilt) und ihre Schlupflöcher; die alte Form ROT beim Namen
    proben: (() => {
        const echt = { wer: "gasthaus/gasthaus #419347", furcht: 1, zuS: [0.267, 0, 0, 0], amEreignis: 71, imBild: [true, true, true, true], dMin: [2, 1.239, 1.239, 1.897], beruehrt: [0, 0, 0, 0] };
        const zeile = (o) => "  ✅ begegnung " + JSON.stringify({ ...echt, ...o });
        return [
            { name: "73bdf938 GTX", stdout: zeile({}), gruen: true },
            { name: "eine Berührung im dritten Gang", stdout: zeile({ beruehrt: [0, 0, 2, 0] }), gruen: false },
            { name: "der zweite Gang nicht als Leib im Bild", stdout: zeile({ imBild: [true, false, true, true] }), gruen: false },
            { name: "der Vorbeigang schenkt die Zuwendung", stdout: zeile({ amEreignis: 12 }), gruen: false },
            { name: "die Erinnerung lenkt nicht", stdout: zeile({ dMin: [2, 1.239, 1.239, 1.3] }), gruen: false },
            { name: "die alte Form (nah getrennt, Berührte als Liste)", stdout: zeile({ nah: [true, true, true, true], beruehrt: [] }), gruen: false },
        ];
    })(),
    pfad: [
        "stamm/siedlung-*.js",
        "stamm/kreatur-*.js",
        "stamm/koerper-*.js",
        "stamm/stoff-instanz.js",
        "stamm/studio-bruecke.js",
        "stamm/gelaende-kollision.js",
        "stamm/bild-himmel.js",
        "stamm/dirigent-takt.js",
        "stamm/daten.js",
        "koerper-core.js",
        "fachwerk-core.js",
        "tetrapoda-core.js",
        "foundry-bruecke.js",
        "save-server.js",
        "scripts/diag-kreatur-takt.cjs",
        "scripts/werkbank.cjs",
        "scripts/lib/kreatur-proben.cjs",
        "scripts/lib/software-gpu.cjs",
        "scripts/lib/welt-boot.cjs",
    ],
    quelle: "1 = ohne Modell im Bild: Kopf-Zuwendung ≤ 0,5 s auf 3 m, Ausweichen ohne Berührung, die Erinnerung lenkt den Abstand",
    },
    // ───────── vegetation.K2 Staffel 1 — die sichtbare Böe nah (0–15 m) an einem Gerät (Zweig boe-zeit) ─────────
    // Der Lauf `boeLauf` (oben): `werkbank bild --zeit 0,25` an der Mess-Wiese. GRÜN, wenn das Nah-Feld (0–15 m aus der Tiefe des
    // Schusses) ≥ 5 % des Bilds trägt, die zeitliche Luma-Varianz am Kamm der Böe ≥ 2× über dem Rausch-Boden liegt (dieselben Uhren
    // bei Wind 0, nie unter 1 Stufe²) und der Kamm ≥ 2× so viel bewegt wie das Tal (Varianz über dem Boden) — die EINE wandernde
    // Böe (WIND_BOE, λ ≈ 164 m, ≈ 10,4 m/s) erreicht den Ort zu ihrer Laufzeit; TAAU-Flimmern und ein eigener Sinus je Schicht
    // heben Kamm und Tal gleich. Dazu die Abnahme des Bilds GRÜN. Headless (Werkbank, swiftshader, Mess-Wiese, Zweig boe-zeit 572ca42e):
    // Kamm 2999 über Boden 0,001, Tal 878 — Kamm/Tal 3,42, Nah-Feld 53,6 % GRÜN; die Mutante wind0 ROT (Kamm 0,0 = Boden, ueber · lauf).
    {
        kriterium: "vegetation.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // IN DER SITZUNG (29.10.): EIN Teleport an die Wiese (der zweite fiel), EIN Schuss `bild --zeit` — Ziel 15 s
        // DER DECKEL NACH SEINER MESSUNG (w4-fehlt-acht): Radeon eich3–6 10,2 · 10,2 · 10,2 · 13,2 s am selben Abdruck — 14 s
        probe: { sek: 18, befehl: ["node", "-e", "(" + knapp(boeLauf) + ")()", "{AUS}", "{PORT}"] },
        gpu: true,
        zeit: false,
        minuten: 10,
        urteil: (j) => {
            if (!j || j.fehler || !j.kamm || !j.tal) return { gruen: false, zahl: "ohne Zeit-Messung: " + ((j && j.fehler) || "kein {AUS}") };
            const [K, T] = [j.kamm, j.tal];
            const z = { nah: j.nahAnteil * 40, ueber: K.v / Math.max(K.boden, 1), lauf: (K.v - K.boden) / Math.max(T.v - T.boden, 1e-3) };
            const rot = Object.keys(z).filter((k) => !(z[k] >= 2)).concat(/ABNAHME GRÜN/.test(j.abnahme || "") ? [] : ["abnahme"]);
            const r = (x, n) => Number(x).toFixed(n);
            return {
                gruen: !rot.length,
                zahl:
                    "Kamm " + r(K.v, 1) + " über Rausch-Boden " + r(K.boden, 3) + " (×" + r(z.ueber, 1) + "), Tal " + r(T.v, 1) + " — Kamm/Tal " + r(z.lauf, 2) +
                    " bei Böe " + r(K.boe, 2) + "/" + r(T.boe, 2) + " (t " + r(K.t, 1) + "/" + r(T.t, 1) + " s), Nah-Feld " + r(j.nahAnteil * 100, 1) + " % in 0–15 m, Δt " +
                    j.dt + " s" + (rot.length ? " · ROT " + rot.join(",") : ""),
            };
        },
        pfad: ["stamm/stoff-material.js", "stamm/stoff-instanz.js", "stamm/dirigent-takt.js", "stamm/daten.js", "phyto-core.js", "stamm/vegetation-*.js",
            "scripts/werkbank.cjs", "scripts/lib/abnahme-urteil.cjs", "scripts/lib/ausgabe-aufnahme.cjs", "scripts/lib/welt-boot.cjs", "scripts/lib/welt-orte.cjs"],
        quelle: "1 = nah (0–15 m) an einem Gerät: zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit",
    },
    // ───────── mensch.K4 Staffel 1 — der Kopf des Spielers an der Kamera des Spiels (Zweig w3v-leib-menge, Messschuld M7) ─────────
    // Im Stand umkreist die Third-Kamera den Leib frei (`_loopCamera`: er dreht erst beim Gehen, Springen, Reiten oder einer
    // gehaltenen Aktion auf die Gier). Die Pose des Spiels: an der Mess-Wiese in Third die Gier um π gedreht, 30 Bilder des
    // echten Takts — der Leib bleibt (`leib` ≤ 0,01 rad), die Kamera steht vor dem Gesicht (`vorn`); dann die Soll-Tafel
    // mensch-kopf aus dieser Pose: die Kamera im Abstand der Third-Kamera (`cameraThirdDistance`) vor dem Kopf
    // (`werkbank bild --gesicht <d>`), die Klasse spieler:kopf/ (abnahme-urteil `sollTafelUrteil`, KOPF_SOLL im Bild). Die Tafel
    // trägt keine REF dieser Klasse (die Kopf-Züge stehen im Gesetz): ihr Pfad fällt aus der Liste. GPU: an der Station.
    (() => {
        const st = sollKlasseStation({
            kriterium: "mensch.K4",
            id: "mensch-kopf",
            sek: 28,
            klasse: "^spieler:kopf/",
            vorher: [
                "node scripts/werkbank.cjs umstellen --ort wiese --sicht third > \"$B-umstellen.txt\" 2>&1",
                "K=$(node scripts/werkbank.cjs eval 'const s = r.state, pm = s.playerMesh, y0 = pm.rotation.y; s.yaw = y0 + Math.PI; for (let i = 0; i < 30; i++) { window.__buehne(); r._gameLoopTick(performance.now()); await sleep(30); } let k = null; pm.traverse((o) => { if (!k && o.name === \"head\") k = o; }); const h = k.getWorldPosition(new T.Vector3()), fw = new T.Vector3(0, 0, 1).applyQuaternion(pm.getWorldQuaternion(new T.Quaternion())), c = s.camera.position; return { leib: +Math.abs(Math.atan2(Math.sin(pm.rotation.y - y0), Math.cos(pm.rotation.y - y0))).toFixed(3), vorn: (c.x - h.x) * fw.x + (c.z - h.z) * fw.z > 0, abstand: +h.distanceTo(c).toFixed(2), d: s.cameraThirdDistance };' | erg); echo \"KAMERA $K\"",
            ],
            schuesse: { third: "0 0 0 0 0 0 --gesicht \"$(node -e 'console.log(JSON.parse(process.argv[1]).d)' \"$K\")\" --spieler" },
            pfad: ["koerper-core.js", "foundry-core.js", "stamm/koerper-*.js", "stamm/studio-bruecke.js"],
            quelle: "1 = mensch-kopf GRÜN im Third an der Kamera des Spiels an einem Gerät, frisch am Kopf",
        });
        const tafel = st.urteil;
        st.urteil = (j, lauf) => {
            const k = jsonZeile(lauf.stdout, /^KAMERA /);
            const u = tafel(j, lauf);
            const pose = !!k && k.vorn === true && k.leib <= 0.01;
            return {
                gruen: pose && u.gruen,
                zahl: (k ? "Spiel-Pose: Leib " + k.leib + " rad, Kamera " + (k.vorn ? "vor" : "hinter") + " dem Gesicht auf " + k.abstand + " m" : "ohne Spiel-Pose") + " · " + u.zahl,
            };
        };
        st.pfad = st.pfad.filter((p) => !p.startsWith("spec/abnahme/ref-"));
        // die Proben der Soll-Klasse an der Spiel-Pose (die Zeile KAMERA wie an 73bdf938 GTX), dazu die Kamera hinter dem Gesicht ROT
        const kamera = (vorn) => "KAMERA " + JSON.stringify({ leib: 0, vorn, abstand: 6.12, d: 6 }) + "\n";
        st.proben = [
            ...st.proben.map((p) => ({ ...p, stdout: kamera(true) + p.stdout })),
            { name: "die Kamera hinter dem Gesicht", stdout: kamera(false) + st.proben[0].stdout, gruen: false },
        ];
        return st;
    })(),
    // ───────── mensch.K4 Staffel 2 — die Menge: 50 Bewohner aus 50 Samen (Zweig w3v-leib-menge) ─────────
    // Headless (Null-Renderer, 1920×1080): die Linse `bewohner --ort stadt-voll` (die Metropole, der Spieler am Markt, 7 Uhr, 600
    // Takte) liefert roh die 50 Nächsten draußen — je Bewohner [Same, Typ, Höhe, Breite, Tiefe, nah] (die Matrix seines
    // Satzes: das eigene Genom über der Gestalt seines Typs, `_bewohnerGenome`), je Typ Dials, Maße der Vorlage in m und die
    // Dreiecke seiner Senken (Leib · Wurf), die Bildpunkte je m am Rand der Nah-Wahl, die Kaskaden, den Takt; danach
    // misst die Anatomie-Linse (`messe`) die Gesichtsmaße jedes Typs, dazu die Zeilen 2 und 3 des Kerns (Zeile GESICHT). Grün: 50 aus 50 Samen; keine zwei gleich
    // (die Gestalt-Distanz je Paar: gleicher Typ und gleiche Farben — dann der größte Unterschied der Maße in Bildpunkten — unter
    // 1 px ist gleich); die Höhe ±8 % um ihre Mitte, ihre Spanne ≥ 8 %; jedes Gesichtsmaß in MENSCH_SOLL (die Breiten × der Breite
    // des Bewohners); je Typ Leib ≤ Zeile 2, Wurf ≤ Zeile 3; die 50 ≤ 150k Dreiecke (im Auge der Leib jedes, der Wurf je
    // Kaskade; die Nah-Wahl trägt ihren Leib für sich); der Takt je 50 Bewohner ≤ 1 ms. Am Kopf des Zweigs (Cloud, 29.10.):
    // 50 aus 50 Samen, Höhe 1,703–1,951 m um 1,82, Gesicht 50 von 50, Leib/Wurf je Typ 1700/360, die 50: 132 200 Dreiecke,
    // 0,253 ms je 50 — ROT nur an „keine zwei gleich" (14 von 1 225 Paaren unter 1 px, je desselben Typs, min 0,284 px): die Farbe
    // je Person verlangt den Knoten des Gang-Satzes (stoff-instanz `_gangSatzKnoten`). Mutanten ROT: zwei gleiche Samen
    // (samen, gleich), die Zeile 2 halbiert (budget).
    {
        kriterium: "mensch.K4",
        staffel: 2,
        geraet: "headless",
        befehl: [
            "bash",
            "-c",
            [
                "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"",
                "export KREATUR_TAKT_PORT=$(( {PORT} ))",
                "node scripts/diag-kreatur-takt.cjs --proben bewohner --ort stadt-voll | tee \"$B-probe.txt\"",
                "node -e 'const t = require(\"fs\").readFileSync(process.argv[1], \"utf8\").split(\"\\n\").find((z) => /^\\s*(✅|❌) bewohner\\s/.test(z)); const m = JSON.parse(t.slice(t.indexOf(\"{\"))).stadt.menge; const A = require(\"./scripts/diag-mensch-anatomie.cjs\"), sb = A.ladeWelt(); const K = sb.__koerperCore; console.log(\"GESICHT \" + JSON.stringify({ typ: m.typ.map((x) => A.messe(sb, null, x.dials)), soll: K.MENSCH_SOLL, zeile: [2, 3].map((l) => K.PORTAL_RENDER_CONFIG.lod.budget.koerper[l].tris) }))' \"$B-probe.txt\"",
            ].join("\n"),
        ],
        gpu: false,
        zeit: true,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "bewohner");
            const g = jsonZeile(lauf.stdout, /^GESICHT /);
            const m = z && z.stadt && z.stadt.menge;
            if (!m || !g) return { gruen: false, zahl: "ohne Menge oder Gesicht (Exit " + lauf.exit + ")" };
            const r3 = (x) => Math.round(x * 1000) / 1000;
            const T = m.typ;
            // je Bewohner seine Maße (m) und sein Kleid: die Vorlage seines Typs × Breite · Höhe · Tiefe
            const B = m.je.map(([seed, t, h, b, d, nah]) => ({ seed, t, nah, b, mass: [b * h, h, d * h].map((x, e) => x * T[t].mass[e]) }));
            const farbe = (x) => ["skinTone", "hairColor", "topColor", "bottomColor", "shoeColor", "gender"].map((k) => T[x.t].dials[k]).join();
            let [min, paar, gleich] = [Infinity, null, 0];
            for (let i = 0; i < B.length; i++)
                for (let k = i + 1; k < B.length; k++) {
                    const d = farbe(B[i]) === farbe(B[k]) ? Math.max(...B[i].mass.map((x, e) => Math.abs(x - B[k].mass[e]))) * m.pxM : 99;
                    if (d < 1) gleich++;
                    if (d < min) [min, paar] = [d, B[i].seed + "/" + B[k].seed];
                }
            const H = B.map((x) => x.mass[1]);
            const mitte = H.reduce((a, h) => a + h, 0) / H.length;
            const [hMin, hMax] = [Math.min(...H), Math.max(...H)];
            const aus = [];
            for (const k of ["kopfH", "kopfB", "augenAbstand", "augapfel", "iris", "mund"])
                for (const x of B) {
                    const v = g.typ[x.t][k] * (k === "kopfH" ? 1 : x.b);
                    if (v < g.soll[k][0] || v > g.soll[k][1]) aus.push(k + " " + r3(v) + " (Typ " + x.t + ")");
                }
            const zeile = g.zeile;
            const dreiecke = B.reduce((a, x) => a + T[x.t].dreiecke[1] * m.kaskaden + (x.nah ? 0 : T[x.t].dreiecke[0]), 0);
            const takt50 = (m.takt[0] / z.stadt.ring.gesamt) * 50;
            const rot = {
                samen: !(B.length === 50 && new Set(B.map((x) => x.seed)).size === 50),
                gleich: !(min >= 1),
                hoehe: !(hMax <= 1.08 * mitte && hMin >= 0.92 * mitte && hMax - hMin >= 0.08 * mitte),
                gesicht: aus.length > 0,
                budget: !T.every((x) => x.dreiecke[0] <= zeile[0] && x.dreiecke[1] <= zeile[1]),
                dreiecke: !(dreiecke <= 150000),
                takt: !(takt50 <= 1),
            };
            const fehlt = Object.keys(rot).filter((k) => rot[k]);
            return {
                gruen: !fehlt.length,
                zahl:
                    B.length + " Bewohner aus " + new Set(B.map((x) => x.seed)).size + " Samen, " + T.length + " Typen · Gestalt-Distanz min " + r3(min) + " px (" + paar + "; " + gleich + " Paare unter 1 px) · Höhe " +
                    r3(hMin) + "–" + r3(hMax) + " m um " + r3(mitte) + " · Gesicht " + (aus.length ? "außerhalb: " + aus.slice(0, 3).join(", ") : "50 von 50 in MENSCH_SOLL") + " · Leib/Wurf je Typ " +
                    T.map((x) => x.dreiecke.join("/")).join(" ") + " (Zeilen " + zeile + ") · die 50: " + Math.round(dreiecke) + " Dreiecke · Takt " + m.takt[0] + " ms für " + z.stadt.ring.gesamt +
                    " → " + r3(takt50) + " ms je 50" + (fehlt.length ? " · ROT " + fehlt.join(",") : ""),
            };
        },
        pfad: [
            "stamm/siedlung-bewohner.js",
            "stamm/koerper-*.js",
            "stamm/stoff-instanz.js",
            "koerper-core.js",
            "foundry-core.js",
            "fachwerk-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/diag-mensch-anatomie.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
            "spec/profiband/haushalt.json",
        ],
        quelle: "2 = 50 Bewohner aus 50 Seeds ohne zwei gleiche, Körperhöhe ±8 %, Gesichtsmaße in MENSCH_SOLL, ≤ 150k Dreiecke und ≤ 1 ms CPU, beide Geräte",
    },
    // haar.K1 Staffel 1 — der Wolf aus dem Gesetz der Tetrapoda (fellStreu) 3 m vor dem Ego-Auge, gehalten; arm: die Kamera 0,7 m
    // vor seinem Fell quer zum Leib, 0,5 m über seiner Mitte; third: 4 m quer, 1 m darüber (der Blick des Third). Soll: strich der REF
    // ref-fell.png ± 20 % = [0,4358; 0,6538]. Headless/swiftshader (kienspan, 1920×1080, Spawn) am Kopf haar-fell-soll: arm
    // 0,3026 (vor dem Strich der Schale 0,2804), third 0,2518 — ROT erwartet, bis die Strähne Kontrast gegen die Unterwolle trägt.
    sollKlasseStation({
        kriterium: "haar.K1",
        id: "fell",
        sek: 39,
        klasse: "^tier:wolf$",
        mutiert: true,
        vorher: [
            "node scripts/werkbank.cjs umstellen --ort wiese --sicht ego > \"$B-umstellen.txt\" 2>&1",
            "K=$(node scripts/werkbank.cjs eval 'const s = r.state, p = s.playerMesh.position; for (const c of [...s.creatures]) r.removeCreature(c); const x = p.x - Math.sin(s.yaw) * 3, z = p.z - Math.cos(s.yaw) * 3; const c = r.spawnCreatureAt(x, r._voxelSurfaceY(x, z) + 0.5, z, \"happy\", \"wolf\", { precise: true }); for (let i = 0; i < 60; i++) { window.__buehne(); r._gameLoopTick(performance.now()); await sleep(50); } window.__tiereHalten(); const b = new T.Box3().setFromObject(c), m = b.getCenter(new T.Vector3()), g = b.getSize(new T.Vector3()), q = g.x > g.z; const kam = (d, h) => [m.x + (q ? 0 : d), m.y + h, m.z + (q ? d : 0), m.x, m.y, m.z].map((v) => +v.toFixed(2)); return { arm: kam(0.7 + Math.min(g.x, g.z) / 2, 0.5), third: kam(4 + Math.min(g.x, g.z) / 2, 1) };' | erg); echo \"WOLF $K\"",
        ],
        schuesse: {
            arm: "$(node -e 'console.log(JSON.parse(process.argv[1]).arm.join(\" \"))' \"$K\")",
            third: "$(node -e 'console.log(JSON.parse(process.argv[1]).third.join(\" \"))' \"$K\")",
        },
        pfad: ["tetrapoda-core.js", "foundry-core.js", "stamm/kreatur-*.js", "stamm/studio-bruecke.js"],
        quelle: "1 = Klasse fell in der Soll-Tafel (Soll aus externer REF), GRÜN auf Armlänge (0,7 m) und im Third (4 m) an einem Gerät",
    }),
    // haar.K2 Staffel 1 — das Haar des Spielers (haarStreu, Genom START_PARAMS): arm die Kamera 0,7 m vor dem Gesicht
    // (`--gesicht 0.7`), third 4 m hinter dem Kopf (`--gesicht -4`, der Blick des Third); der Kopf in Stoffen, die Klasse
    // spieler:kopf/hair. Soll: strich der REF ref-haar.png ± 20 % = [0,3554; 0,533] UND die Albedo der Zeile haar der Albedo-Tafel
    // im Natur-Band [0,01; 0,3] — die Zeile fehlt (die Tafel misst nur ganz auf der Karte), ROT „albedo: … ohne Ist“ bis sie steht.
    sollKlasseStation({
        kriterium: "haar.K2",
        id: "haar",
        sek: 32,
        klasse: "^spieler:kopf/hair$",
        vorher: ["node scripts/werkbank.cjs umstellen --ort wiese --sicht third > \"$B-umstellen.txt\" 2>&1"],
        schuesse: { arm: "0 0 0 0 0 0 --gesicht 0.7 --spieler", third: "0 0 0 0 0 0 --gesicht -4 --spieler" },
        pfad: ["koerper-core.js", "stamm/koerper-*.js", "stamm/studio-bruecke.js", "spec/farbe/albedo-tafel.json"],
        quelle: "1 = Klasse haar (Strähnen-Kohärenz gegen REF, Albedo-Band) an einem Gerät",
    }),
    // ───────── vegetation.K1 — die Wiese bis zum Saum (Zweig w3w-wald): Staffel 1 EINE Pose (Mess-Wiese, Third, Mittag),
    // Staffel 2 Mess-Wiese UND Genesis × Ego UND Third × Uhr 0,5 und 0,3 (vegetationLauf, wieseUrteil) ─────────
    // (Staffel 2 — Mess-Wiese UND Genesis × Ego UND Third × Uhr 0,5 und 0,3 — steht in `fehlt`: acht Schüsse an zwei Orten sind
    // 150 s Arbeit, über dem Gesetz der Fahrt)
    wieseStation(1, [["wiese", "third", 0.5]], "1 = eine Pose (Ort × Sicht × Uhr) grün in allen festen Ringen, im Budget"),
    // ───────── vegetation.K5 — das Jahr als Gestalt (Zweig w3w-wald): Staffel 1 die Laub-Maske an EINER Pose im Sommer und Winter,
    // Staffel 2 dazu der Frühling und die Wiese an der Kamera des Spiels (Ego, Mittag) in allen drei (vegetationLauf, jahrUrteil) ─────────
    // DIE ARBEIT GETEILT (w4-sitzung-reif): beide Staffeln sind EIN Lauf (Zwillinge) — seine ersten Schüsse sind die Kronen von Sommer und
    // Winter am Stand der Staffel 1; sie urteilt nur sie (der Rest des Laufs, auch sein Fehler, ist Sache der Staffel 2). Getrennt kosteten
    // sie 25 s + 65 s der Fahrt, so 65 s
    // DAS TEMPO (w4-proben-tempo, 30.10.; GTX 379e5f56 ≥ 90 s am Eich-Deckel, „zuletzt: SCHRITT /eval“): DIE TÄTER je Schuss — die
    // Klassen-Maße je Teil-Klasse mit dem ganzen Bild (Luma, Spiegel-Projektion; abnahme-urteil `klassenMasse` jetzt mit `pass`, Node
    // 567 → 242 ms je Klasse), der Licht-Pool fest 20 × 50 ms (`bild --uhr`, jetzt bis zu seinem Fixpunkt), der Zähler je Wiesen-Schuss
    // (`/zaehlen`, sein Budget liest nur vegetation.K1 — das Jahr läuft „ohne-budget“). Offen beim Namen: der Abstands-Marsch der Wiese
    // (je 2×2-Block ein Strahl bis 200 m, ~20 Mio. Rufe `_bodenSichtAt`, 6–11 s je Wiesen-Schuss) — der EINE Boden-Leser im Spiel
    jahrStation(1, JAHR_LAUF, ["sommer", "winter"].map((z) => JAHR_LAUF.find((p) => p[3] === z && p[4] === "krone")), ["sommer", "winter"], "1 = Kronen-Deckung der Laubbäume (Maske f:eiche|birke|buche) im Winter ≤ 0,3 × Sommer, an einer Pose"),
    jahrStation(2, JAHR_LAUF, JAHR_LAUF, ["sommer", "winter", "fruehling"], "2 = dazu Wiesen-LAI im Winter ≤ 0,5 × Sommer und der Austrieb im Frühling, beide Geräte"),
];

// Nicht als Station fassbar (heute): je Kriterium und Staffel der Grund beim Namen. Sie tragen keine Punkte der Maschine;
// was hier steht, bucht weiter die Hand oder bleibt 0, bis das Werkzeug steht.
const fehlt = [
    // vegetation.K3 (Zweig w3w-wald, 29.10.): das Band der REF real-mischwald (Stämme je Bildbreite, Unterholz-Deckung 0–2 m) steht
    // nirgends — weder im Spiel-Baum (spec/abnahme) noch hier; aus der Cloud ist die Quelle nicht ladbar (Wikimedia: 403 am Proxy).
    {
        kriterium: "vegetation.K3",
        staffel: 1,
        befehl: null,
        grund: "die REF real-mischwald fehlt (kein Band für Stämme je Bildbreite und Unterholz-Deckung 0–2 m im Repo, aus der Cloud nicht ladbar): ohne Band urteilt keine Station; die Licht-Flecken (Boden-Luma unter Kronen gegen offenen Boden, zwei Uhrzeiten) misst erst die Station Wald mit diesem Band",
    },
    {
        kriterium: "vegetation.K3",
        staffel: 2,
        befehl: null,
        grund: "dieselbe fehlende REF real-mischwald wie Staffel 1, dazu fehlt das Gesetz der Strahlen: Volumen-Licht über die EINE Luft gibt es nicht (Strahl-Kontrast im Gegenlicht ungemessen)",
    },
    // vegetation.K1#2 (w4-sitzung-reif, 30.10.): die Staffel verlangt acht Schüsse an zwei Orten — die Arbeit ihres Plans (vegetationDeckel:
    // Mess-Wiese Ego und Third warm 2 × 5 s, Genesis kalt 15 s und Third 5 s, je Wiesen-Schuss 15 s) ist 150 s, über dem Gesetz der Fahrt
    {
        kriterium: "vegetation.K1",
        staffel: 2,
        befehl: null,
        grund: "nicht in der Fahrt (w4-fehlt-acht, 30.10.): DER TÄTER BEIM NAMEN — ein Wiesen-Schuss (`/bild` mit abstand und klasse, scripts/werkbank.cjs) trägt ≈ 18–29 s, die meiste Zeit in der CPU der Seite: der Abstands-Marsch (je 2×2-Block ein Strahl bis 200 m, ~20 Mio. Rufe `_bodenSichtAt`, 6–11 s), die Klassen-Maße der vier Teil-Klassen samt Spiegel-Partner (5–8 s, `wieseUrteil` liest sie nicht), acht Aufnahmen zu 33 Bildern (≈ 4–7 s GPU), je Schuss 20 × 50 ms am Licht-Pool — der Plan (acht Schüsse, vier Stände) ≈ 155–250 s, das Deckel-Modell rechnete 10 s je Schuss. Die Schnitte liegen im Spiel-Baum (der EINE Boden-Leser schneller, die Bild-Pässe der Maße einmal je Bild, der Pool zum Fixpunkt in `/bild`) — mit ihnen ≈ 85–145 s, über dem Deckel der Fahrt (≤ 90 s). DAS LINEAL: `ringe` liest die Werkbank nirgends, die Bänder stehen fest auf 0 · 2 · 5 · 10 · 14 (NAH_WIESE.radius) · 30 · 80 · 200 m — `wieseRinge` urteilt über 10–14 · 14–30 · 30–80 · 80–200 statt 10–20 · 20–40 (Staffel 1 ebenso, ihr 15-s-Deckel reißt am ersten echten Wiesen-Bild). Die Fahrt trägt sie nicht: jede Karte steht bei 1 800 von 1 800 s. Die Probe (vegetationLauf, wieseUrteil) misst heute Staffel 1",
    },
    // DIE ZAHL ERSETZT DIE SCHÄTZUNG (w4-sitzung-reif, 30.10.; punkte.cjs DIE DECKEL: „die GPU-Fahrt nennt, wer warm am Deckel fällt“):
    // zwei Proben rissen in JEDER GPU-Fahrt ihren Deckel — am 90-s-Deckel des Gegenlaufs b3f9ae95 und an 99/100 s in den Eichläufen 1–6
    // (gegenlauf/eich*.json, Radeon) —, ihre Arbeit liegt über dem Gesetz der Fahrt; ihre 66 s trugen nie eine Messung (und jeder Riss eine
    // Tür samt neuem Ring). Sie trugen keinen Punkt.
    {
        kriterium: "mensch.K1",
        staffel: 2,
        befehl: null,
        grund: "nicht in der Fahrt (w4-fehlt-acht, 30.10.): DIE TÄTER BEIM NAMEN — (i) das zweite `umstellen --ort stadt-voll --sicht third` der Probe geht erst an den Anlauf [400, 400] (scripts/werkbank.cjs `/umstellen`), 438 m vom Ursprung der Stadt: die Bewohner gehen (`_bewohnerFort`), zwei kalte Ringe, die Stadt bevölkert sich neu (≈ 35–60 s); (ii) nach dem Uhr-Sprung backt `uhrAuf` die Felder der Leiber unter dem Regler mit 4 statt 16 Fits je Wand-Sekunde (scripts/lib/kreatur-proben.cjs, der Takt über Budget) — die Linse `stadtTag` dauerte an Radeon und GTX gleich 61–68 s; dazu `haenger 10` (10 s Einschwingen, 10 s Fenster). Der Ort stadt-voll allein 87,4–119,1 s vor dem Deckel (eich3–6). DER SCHNITT: nur die Sicht statt des zweiten Umstellens, das Backen unter Regler voll — geschätzt 45–62 s je Probe. DAS URTEIL liest `z.voll`, die Linse liefert seit 8dd1227c `stadt.ring` (gesamt, ring, nah, nahGang): jede Messung hieß „Probe-Fehler: keine volle Stadt“ (715754fc, 98ef98bb, je Radeon und GTX: 1 089 Bewohner, 149–150 nah, 67–70 im Gang — im Soll). Die Fahrt trägt sie nicht: jede Karte steht nach den gemessenen Deckeln und den fünf Neuen bei 1 800 von 1 800 s. Die Station (Befehl, Urteil) steht in w4-koord-sitzung bdc3c14a",
    },
];
// die Sprünge der Bewohner-Probe: seit z36 unter `wege`, davor oben (beide Köpfe bleiben buchbar)
const sprungVon = (z) => (z.wege && z.wege.sprungN !== undefined ? z.wege.sprungN : z.sprungN);

module.exports = stationen;
module.exports.fehlt = fehlt;
