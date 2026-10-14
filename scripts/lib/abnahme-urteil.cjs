// abnahme-urteil.cjs — DIE ABNAHME-ZEILE (K32, Entscheidung 1110 §2.10 / D3): das EINE Ergebnis-Format, mit dem jedes Beweisbild
// sich selbst prüft. Anlass 13.10. (Augen-Befund 10): vier Beweisbilder anderer Karten waren unbrauchbar — die Kamera stand in
// Laub und Zweigen (K17 Dorfhang, K20 Waldrand, K24 Tanne, K16 1,7 m im Wald), die Aufnahme speicherte sie still.
//
// Die Messung (`m`) trägt die Aufnahme selbst (scripts/lib/ausgabe-aufnahme.cjs, `__abnahmeMessen` + `__bildMasse`):
//   stand  { version, sha }            der Stand aus dem LAUFENDEN Spiel (AnazhRealm.VERSION), die SHA setzt der Node-Aufrufer
//   buehne { saison, wetter, uhr, tiereGehalten }
//   geraet { backend, adapter, leinwand }
//   bild   { w, h, mittel, sigma, schwarz, weiss, kanten }   Luma der sRGB-Ausgabe (0–255), Anteile, Kanten-Gitter 32×18
//   sicht  { radius, deckung, taeter }  der Anteil des Schirms, den Laub · Rinde · Fels näher als `radius` am Auge decken
//                                      (scripts/lib/kamera-nah.cjs, dieselbe Formel wie gate:kamera-laub), Täter beim Namen
//   ziel   { name, imBild, ndc, frei, vor, abstand } | null     das benannte Ziel: im Bild und ohne Verdecker davor
//   pose   { kamera, blick }            wahl { versucht, posen }    seitenfehler (Zahl)
// Das Urteil liest die SCHWELLEN als Datum `{ feld, op, wert }`. Ein null-Wert ist ROT (ungemessen ist nie grün); ein Feld
// mit `wenn` gilt nur, wenn die Messung den Teil trägt (das Ziel ist benannt). Der Satz „messung" (ein Mess-Frame, kein
// Beweisbild: 32×18 Takt-Bilder, Luma-Proben der Post-Kette) prüft nur Stand, Bühne und Gerät — er steht in der Zeile.
"use strict";

const zlib = require("zlib");

// DIE SCHWELLEN je Satz (das Datum der Abnahme). Sicht: dieselbe Grenze wie die Nah-Deckung der Spieler-Kamera
// (diag-kamera-laub NAH_DECKUNG_MAX 2 %, Radius 3rd 2,0 m). Belichtung: Mittel 6–245, σ ≥ 4 (kein Flachbild), höchstens 60 %
// abgesoffen (Luma < 4) und 25 % ausgebrannt (Luma > 251).
const SCHWELLEN = Object.freeze({
    beweis: [
        { feld: "stand.version", op: "da" },
        { feld: "buehne.saison", op: "da" },
        { feld: "buehne.wetter", op: "da" },
        { feld: "buehne.uhr", op: "da" },
        { feld: "geraet.backend", op: "da" },
        { feld: "bild.mittel", op: ">=", wert: 6 },
        { feld: "bild.mittel", op: "<=", wert: 245 },
        { feld: "bild.sigma", op: ">=", wert: 4 },
        { feld: "bild.schwarz", op: "<=", wert: 0.6 },
        { feld: "bild.weiss", op: "<=", wert: 0.25 },
        { feld: "sicht.deckung", op: "<=", wert: 0.02 },
        { feld: "sicht.vordergrund.deckung", op: "<=", wert: 0.25, wenn: "ziel" },
        { feld: "ziel.imBild", op: "==", wert: true, wenn: "ziel" },
        { feld: "ziel.frei", op: "==", wert: true, wenn: "ziel" },
        { feld: "ziel.gezeichnet", op: "==", wert: true, wenn: "ziel" },
    ],
    messung: [
        { feld: "stand.version", op: "da" },
        { feld: "buehne.wetter", op: "da" },
        { feld: "geraet.backend", op: "da" },
    ],
});

// DAS URTEIL (rein; in der Seite als `__abnahmeUrteil` mit den Schwellen gebunden): { ok, rot: [{ feld, grund }], zeile }.
function abnahmeUrteil(m, S) {
    const satz = (m && m.satz) || "beweis";
    const regeln = (S && S[satz]) || null;
    const rot = [];
    const lies = (feld) => {
        let v = m;
        for (const k of feld.split(".")) v = v == null ? undefined : v[k];
        return v;
    };
    const pct = (x) => (x == null ? "?" : `${(x * 100).toFixed(1)} %`);
    const namen = (t) =>
        t && typeof t === "object"
            ? Object.entries(t)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([k, v]) => `${k} ${pct(v)}`)
                  .join(", ")
            : "";
    if (!m || typeof m !== "object") rot.push({ feld: "messung", grund: "keine Messung (vakuös)" });
    else if (!regeln) rot.push({ feld: "satz", grund: `unbekannter Satz „${satz}"` });
    else
        for (const s of regeln) {
            if (s.wenn && m[s.wenn] == null) continue;
            const v = lies(s.feld);
            if (v == null || (typeof v === "number" && !Number.isFinite(v))) {
                rot.push({ feld: s.feld, grund: `${s.feld} ungemessen` });
                continue;
            }
            const ok =
                s.op === "da"
                    ? v !== ""
                    : s.op === "=="
                      ? v === s.wert
                      : s.op === "<="
                        ? v <= s.wert
                        : s.op === ">="
                          ? v >= s.wert
                          : false;
            if (ok) continue;
            let grund = `${s.feld} ${typeof v === "number" ? +v.toFixed(4) : JSON.stringify(v)} ${s.op === "==" ? "≠" : s.op === "<=" ? ">" : "<"} ${s.wert}`;
            if (s.feld === "sicht.deckung")
                grund = `Sicht verdeckt ${pct(v)} (Laub · Rinde · Fels · Böschung näher als ${m.sicht.radius} m, Bau als ${m.sicht.radius / 2} m): ${namen(m.sicht.taeter) || "ohne Namen"}`;
            if (s.feld === "ziel.frei")
                grund = `Ziel ${m.ziel.name} verdeckt von ${m.ziel.vor || "?"} in ${m.ziel.vorAbstand} m`;
            if (s.feld === "sicht.vordergrund.deckung")
                grund = `Vordergrund ${pct(v)} näher als ${m.sicht.vordergrund.radius} m (der halbe Ziel-Abstand): ${namen(m.sicht.vordergrund.taeter) || "ohne Namen"}`;
            if (s.feld === "ziel.gezeichnet")
                grund = `Ziel ${m.ziel.name} nicht gezeichnet: ${(m.ziel.gestalt || []).filter((q) => / UNGEZEICHNET| fehlt/.test(q)).join(", ") || "?"}`;
            if (s.feld === "ziel.imBild")
                grund = `Ziel ${m.ziel.name} nicht im Bild (ndc ${JSON.stringify(m.ziel.ndc)})`;
            rot.push({ feld: s.feld, grund });
        }
    const t = [];
    if (m && m.sicht)
        t.push(
            `Sicht ${pct(m.sicht.deckung)}${m.sicht.taeter && Object.keys(m.sicht.taeter).length ? ` (${namen(m.sicht.taeter)})` : ""}`
        );
    if (m && m.ziel)
        t.push(
            `Ziel ${m.ziel.name} ${m.ziel.imBild ? "im Bild" : "NICHT im Bild"} ${m.ziel.frei ? "frei" : "VERDECKT"} ${m.ziel.abstand} m`
        );
    else if (m && satz === "beweis") t.push("Ziel ungenannt");
    if (m && m.bild)
        t.push(`Luma ${m.bild.mittel} σ ${m.bild.sigma} schwarz ${pct(m.bild.schwarz)} weiß ${pct(m.bild.weiss)}`);
    if (m && m.stand)
        t.push(`Stand ${m.stand.version || "?"}${m.stand.sha ? " " + String(m.stand.sha).slice(0, 8) : ""}`);
    if (m && m.buehne)
        t.push(
            `Bühne ${m.buehne.saison || "?"} ${m.buehne.wetter || "?"} ${m.buehne.uhr != null ? (+m.buehne.uhr).toFixed(2) : "?"}${m.buehne.tiereGehalten ? " Tiere gehalten" : ""}`
        );
    if (m && m.geraet) t.push(`Gerät ${m.geraet.backend || "?"}${m.geraet.adapter ? " " + m.geraet.adapter : ""}`);
    if (m && m.wahl) t.push(`Blick-Wahl ${m.wahl.versucht} Posen`);
    if (m && m.seitenfehler) t.push(`Seitenfehler ${m.seitenfehler}`);
    const kopf = rot.length ? `ABNAHME ROT [${rot.map((r) => r.grund).join(" · ")}]` : "ABNAHME GRÜN";
    return { ok: rot.length === 0, rot, zeile: `${kopf} · ${satz} · ${t.join(" · ")}` };
}

// DIE BILD-MASSE (rein; in der Seite als `__bildMasse`): Luma je Pixel der sRGB-Ausgabe (Rec. 709 auf den 0–255-Werten, wie
// `werkbank bild`), Mittel, σ, Anteil abgesoffen (< 4) und ausgebrannt (> 251), dazu das Kanten-Gitter 32×18 (Gradient-Betrag
// der Block-Mittel) für das Bild-Paar.
function bildMasse(u8, W, H) {
    const n = W * H;
    if (!u8 || !n || u8.length < n * 4) return null;
    let s = 0,
        s2 = 0,
        sw = 0,
        ws = 0;
    const GW = 32,
        GH = 18;
    const blk = new Float64Array(GW * GH);
    const cnt = new Float64Array(GW * GH);
    for (let y = 0; y < H; y++) {
        const gy = Math.min(GH - 1, Math.floor((y * GH) / H));
        for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;
            const l = 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
            s += l;
            s2 += l * l;
            if (l < 4) sw++;
            if (l > 251) ws++;
            const g = gy * GW + Math.min(GW - 1, Math.floor((x * GW) / W));
            blk[g] += l;
            cnt[g]++;
        }
    }
    for (let g = 0; g < GW * GH; g++) blk[g] = cnt[g] ? blk[g] / cnt[g] : 0;
    const kanten = [];
    for (let gy = 0; gy < GH; gy++)
        for (let gx = 0; gx < GW; gx++) {
            const a = blk[gy * GW + gx];
            const dx = gx + 1 < GW ? blk[gy * GW + gx + 1] - a : 0;
            const dy = gy + 1 < GH ? blk[(gy + 1) * GW + gx] - a : 0;
            kanten.push(Math.round(Math.hypot(dx, dy) * 10) / 10);
        }
    const mittel = s / n;
    return {
        w: W,
        h: H,
        mittel: +mittel.toFixed(1),
        sigma: +Math.sqrt(Math.max(0, s2 / n - mittel * mittel)).toFixed(1),
        schwarz: +(sw / n).toFixed(4),
        weiss: +(ws / n).toFixed(4),
        kanten,
    };
}

// DAS BILD-PAAR (rein): vorher↔nachher unter gleichen Bedingungen. ROT: ein Bild ohne Abnahme GRÜN, ein Stand ohne Version
// oder SHA, Lage oder Blick verschieden (1 cm, 0,1°), Bühne verschieden, die Kanten der beiden Bilder korrelieren unter 0,5
// (Posen-Drift: ein anderes Bild, kein Paar).
function paarUrteil(a, b, S) {
    const rot = [];
    for (const [k, m] of [
        ["vorher", a],
        ["nachher", b],
    ]) {
        const u = abnahmeUrteil(m, S);
        if (!u.ok) rot.push(`${k}: ${u.rot.map((r) => r.grund).join(" · ")}`);
        if (!m || !m.stand || !m.stand.version || !m.stand.sha)
            rot.push(`${k}: Stand ohne Version und SHA aus dem laufenden Spiel`);
    }
    if (a && b && a.pose && b.pose) {
        const d = Math.hypot(...a.pose.kamera.map((v, i) => v - b.pose.kamera[i]));
        const c = a.pose.blick.reduce((s, v, i) => s + v * b.pose.blick[i], 0);
        if (d > 0.01) rot.push(`Lage verschieden ${d.toFixed(3)} m`);
        if (c < Math.cos((0.1 * Math.PI) / 180))
            rot.push(`Blick verschieden ${((Math.acos(Math.min(1, c)) * 180) / Math.PI).toFixed(2)}°`);
    } else rot.push("Pose ungemessen");
    if (a && b && a.buehne && b.buehne) {
        for (const k of ["saison", "wetter"])
            if (a.buehne[k] !== b.buehne[k]) rot.push(`Bühne ${k} ${a.buehne[k]} ≠ ${b.buehne[k]}`);
        if (Math.abs((a.buehne.uhr || 0) - (b.buehne.uhr || 0)) > 0.001)
            rot.push(`Bühne uhr ${a.buehne.uhr} ≠ ${b.buehne.uhr}`);
    }
    const ka = a && a.bild && a.bild.kanten;
    const kb = b && b.bild && b.bild.kanten;
    let korr = null;
    if (ka && kb && ka.length === kb.length && ka.length) {
        const n = ka.length;
        const ma = ka.reduce((s, v) => s + v, 0) / n;
        const mb = kb.reduce((s, v) => s + v, 0) / n;
        let sab = 0,
            saa = 0,
            sbb = 0;
        for (let i = 0; i < n; i++) {
            sab += (ka[i] - ma) * (kb[i] - mb);
            saa += (ka[i] - ma) ** 2;
            sbb += (kb[i] - mb) ** 2;
        }
        korr = saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0;
        if (korr < 0.5) rot.push(`Kanten-Korrelation ${korr.toFixed(2)} < 0,5 (Posen-Drift)`);
    } else rot.push("Kanten ungemessen");
    return { ok: rot.length === 0, rot, korr: korr == null ? null : +korr.toFixed(3) };
}

// PNG lesen und schreiben (Node, nur zlib) — die Fixture-Bilder der Linse. Lesen: 8 Bit, RGB oder RGBA, ohne Interlace.
function pngLesen(buf) {
    if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("kein PNG");
    let p = 8,
        W = 0,
        H = 0,
        typ = 0;
    const idat = [];
    while (p < buf.length) {
        const len = buf.readUInt32BE(p);
        const art = buf.toString("ascii", p + 4, p + 8);
        const d = buf.subarray(p + 8, p + 8 + len);
        if (art === "IHDR") {
            W = d.readUInt32BE(0);
            H = d.readUInt32BE(4);
            if (d[8] !== 8 || d[12] !== 0) throw new Error("PNG: nur 8 Bit ohne Interlace");
            typ = d[9];
        } else if (art === "IDAT") idat.push(d);
        else if (art === "IEND") break;
        p += 12 + len;
    }
    const bpp = typ === 6 ? 4 : typ === 2 ? 3 : 0;
    if (!bpp) throw new Error(`PNG: Farbtyp ${typ} nicht gelesen`);
    const roh = zlib.inflateSync(Buffer.concat(idat));
    const zeile = W * bpp;
    const out = new Uint8Array(W * H * 4);
    let vor = new Uint8Array(zeile);
    for (let y = 0; y < H; y++) {
        const f = roh[y * (zeile + 1)];
        const z = roh.subarray(y * (zeile + 1) + 1, (y + 1) * (zeile + 1));
        const cur = new Uint8Array(zeile);
        for (let i = 0; i < zeile; i++) {
            const a = i >= bpp ? cur[i - bpp] : 0;
            const b = vor[i];
            const c = i >= bpp ? vor[i - bpp] : 0;
            let v = z[i];
            if (f === 1) v += a;
            else if (f === 2) v += b;
            else if (f === 3) v += (a + b) >> 1;
            else if (f === 4) {
                const pa = Math.abs(b - c),
                    pb = Math.abs(a - c),
                    pc = Math.abs(a + b - 2 * c);
                v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
            }
            cur[i] = v & 255;
        }
        for (let x = 0; x < W; x++) {
            out[(y * W + x) * 4] = cur[x * bpp];
            out[(y * W + x) * 4 + 1] = cur[x * bpp + 1];
            out[(y * W + x) * 4 + 2] = cur[x * bpp + 2];
            out[(y * W + x) * 4 + 3] = bpp === 4 ? cur[x * bpp + 3] : 255;
        }
        vor = cur;
    }
    return { W, H, u8: out };
}

function pngSchreiben(u8, W, H) {
    const crcT = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        crcT[n] = c;
    }
    const crc = (b) => {
        let c = -1;
        for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8);
        return (c ^ -1) >>> 0;
    };
    const chunk = (art, d) => {
        const kopf = Buffer.alloc(8);
        kopf.writeUInt32BE(d.length, 0);
        kopf.write(art, 4, "ascii");
        const c = Buffer.alloc(4);
        c.writeUInt32BE(crc(Buffer.concat([kopf.subarray(4), d])), 0);
        return Buffer.concat([kopf, d, c]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(W, 0);
    ihdr.writeUInt32BE(H, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    const roh = Buffer.alloc(H * (W * 4 + 1));
    for (let y = 0; y < H; y++) Buffer.from(u8.buffer, u8.byteOffset + y * W * 4, W * 4).copy(roh, y * (W * 4 + 1) + 1);
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk("IHDR", ihdr),
        chunk("IDAT", zlib.deflateSync(roh, { level: 9 })),
        chunk("IEND", Buffer.alloc(0)),
    ]);
}

// Flächen-Mittel auf W×H (das Fixture-Bild der Linse aus dem Original).
function verkleinern(b, W, H) {
    const u8 = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
            const y0 = Math.floor((y * b.H) / H),
                y1 = Math.max(y0 + 1, Math.floor(((y + 1) * b.H) / H));
            const x0 = Math.floor((x * b.W) / W),
                x1 = Math.max(x0 + 1, Math.floor(((x + 1) * b.W) / W));
            const s = [0, 0, 0, 0];
            for (let yy = y0; yy < y1; yy++)
                for (let xx = x0; xx < x1; xx++) for (let k = 0; k < 4; k++) s[k] += b.u8[(yy * b.W + xx) * 4 + k];
            const nn = (y1 - y0) * (x1 - x0);
            for (let k = 0; k < 4; k++) u8[(y * W + x) * 4 + k] = Math.round(s[k] / nn);
        }
    return { W, H, u8 };
}

// DIE FIXTURES (spec/abnahme/faelle.json): die Beweisbilder vom 13.10. ohne freie Sicht — je Fall das verkleinerte Bild
// (Luma aus dem Bild), was die Sonde damals vermerkte, und die Sicht, gemessen an der Pose in der echten Welt (Rohdatei).
function fixtureMessung(f, dir) {
    const path = require("path");
    const fs = require("fs");
    const b = pngLesen(fs.readFileSync(path.join(dir, f.bild)));
    return Object.assign({ satz: "beweis" }, f.messung, { bild: bildMasse(b.u8, b.W, b.H) });
}

// DER SELBSTTEST (rein bis auf das Lesen der Fixtures): jeder eingeschmuggelte Fall fällt ROT und steht beim Namen, der gesunde
// Fall bleibt GRÜN; jede Fixture fällt ROT mit ihrem erwarteten Grund. Rückgabe: Liste der Brüche (leer = grün).
function abnahmeSelbsttest(fixtureDir) {
    const v = [];
    const W = 64,
        H = 36;
    const bunt = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;
            bunt[i] = 40 + ((x * 3) % 160);
            bunt[i + 1] = 60 + ((y * 5) % 150);
            bunt[i + 2] = 90 + (((x + y) * 2) % 120);
            bunt[i + 3] = 255;
        }
    const gesund = () => ({
        satz: "beweis",
        stand: { version: "18.543.0", sha: "c5a4d0f8d96f5cbcd8cc8f7cd51925537b24aa16" },
        buehne: { saison: "sommer", wetter: "sunny", uhr: 0.5, tiereGehalten: true },
        geraet: { backend: "WebGPU", adapter: "amd rdna-3.5", leinwand: [1920, 1080] },
        bild: bildMasse(bunt, W, H),
        sicht: {
            radius: 2,
            deckung: 0.004,
            taeter: { "Laub baum_eiche": 0.004 },
            vordergrund: { radius: 3.1, deckung: 0.08, taeter: { "Laub baum_eiche": 0.08 } },
        },
        ziel: {
            name: "Wolf",
            imBild: true,
            ndc: [0.02, -0.1],
            frei: true,
            vor: null,
            vorAbstand: null,
            abstand: 6.2,
            gestalt: ["wolf 7"],
            gezeichnet: true,
        },
        pose: { kamera: [10, 2, 10], blick: [1, 0, 0] },
        seitenfehler: 0,
    });
    const g = abnahmeUrteil(gesund(), SCHWELLEN);
    if (!g.ok) v.push(`gesund: fälschlich ROT — ${g.zeile}`);
    const schwarz = new Uint8Array(W * H * 4);
    const weiss = new Uint8Array(W * H * 4).fill(255);
    const flach = new Uint8Array(W * H * 4).fill(128);
    const faelle = [
        [
            "Kamera im Laub",
            (m) =>
                (m.sicht = { radius: 2, deckung: 0.61, taeter: { "Laub baum_tanne": 0.58, "Rinde baum_tanne": 0.03 } }),
            "sicht.deckung",
            "Laub baum_tanne",
        ],
        [
            "Ziel hinter Fels",
            (m) => Object.assign(m.ziel, { frei: false, vor: "Natur stein_block", vorAbstand: 3.1 }),
            "ziel.frei",
            "Natur stein_block",
        ],
        [
            "Kuppe im Vordergrund",
            (m) =>
                (m.sicht.vordergrund = {
                    radius: 3.1,
                    deckung: 0.36,
                    taeter: { Gelände: 0.33, "Laub baum_eiche": 0.03 },
                }),
            "sicht.vordergrund.deckung",
            "Vordergrund 36.0 % näher als 3.1 m (der halbe Ziel-Abstand): Gelände 33.0 %",
        ],
        [
            "Ziel außerhalb",
            (m) => Object.assign(m.ziel, { imBild: false, ndc: [1.4, 0.2] }),
            "ziel.imBild",
            "nicht im Bild",
        ],
        [
            "Ziel ungezeichnet (der Baum ist nicht gebaut)",
            (m) => Object.assign(m.ziel, { gestalt: ["baum_birke 12 UNGEZEICHNET"], gezeichnet: false }),
            "ziel.gezeichnet",
            "nicht gezeichnet: baum_birke 12 UNGEZEICHNET",
        ],
        ["Schwarzbild", (m) => (m.bild = bildMasse(schwarz, W, H)), "bild.mittel", "bild.mittel"],
        ["Weißbild", (m) => (m.bild = bildMasse(weiss, W, H)), "bild.weiss", "bild.weiss"],
        ["Flachbild", (m) => (m.bild = bildMasse(flach, W, H)), "bild.sigma", "bild.sigma"],
        [
            "fremder Stand (keine Version)",
            (m) => (m.stand = { version: null, sha: null }),
            "stand.version",
            "stand.version ungemessen",
        ],
        ["Bühne ungemessen", (m) => delete m.buehne, "buehne.wetter", "buehne.wetter ungemessen"],
        ["Sicht ungemessen (null)", (m) => (m.sicht = null), "sicht.deckung", "sicht.deckung ungemessen"],
        ["Gerät ungemessen", (m) => (m.geraet = {}), "geraet.backend", "geraet.backend ungemessen"],
    ];
    for (const [name, fn, feld, wort] of faelle) {
        const m = gesund();
        fn(m);
        const u = abnahmeUrteil(m, SCHWELLEN);
        const r = u.rot.find((x) => x.feld === feld);
        if (u.ok || !r) v.push(`${name}: nicht ROT an ${feld} — ${u.zeile}`);
        else if (!u.zeile.includes(wort)) v.push(`${name}: ROT ohne Namen „${wort}" — ${u.zeile}`);
    }
    // der vakuöse Fall: keine Messung, ein leeres Objekt, ein unbekannter Satz
    if (abnahmeUrteil(null, SCHWELLEN).ok) v.push("vakuös: null ist grün");
    if (abnahmeUrteil({}, SCHWELLEN).ok) v.push("vakuös: {} ist grün");
    if (abnahmeUrteil({ satz: "frei" }, SCHWELLEN).ok) v.push("unbekannter Satz ist grün");
    // der Satz „messung" prüft Stand, Bühne, Gerät — ein Schwarzbild ist dort kein Bruch, ein fehlender Stand schon
    const ms = gesund();
    ms.satz = "messung";
    ms.bild = bildMasse(schwarz, W, H);
    if (!abnahmeUrteil(ms, SCHWELLEN).ok) v.push("messung: Schwarzbild fälschlich ROT");
    ms.stand = null;
    if (abnahmeUrteil(ms, SCHWELLEN).ok) v.push("messung: fehlender Stand ist grün");
    // das Bild-Paar: gleich grün; Posen-Drift, fremde Kanten und ein Stand ohne SHA ROT
    const a = gesund(),
        b = gesund();
    if (!paarUrteil(a, b, SCHWELLEN).ok) v.push(`Paar gesund: ROT — ${paarUrteil(a, b, SCHWELLEN).rot.join(" · ")}`);
    const b2 = gesund();
    b2.pose.kamera = [10.4, 2, 10];
    if (!paarUrteil(a, b2, SCHWELLEN).rot.some((x) => x.startsWith("Lage"))) v.push("Paar: Lage-Drift nicht ROT");
    const b3 = gesund();
    const quer = new Uint8Array(W * H * 4);
    for (let i = 0; i < W * H; i++)
        (quer.fill(((i % W) * 37 + Math.floor(i / W) * 91) % 256, i * 4, i * 4 + 3), (quer[i * 4 + 3] = 255));
    b3.bild = bildMasse(quer, W, H);
    if (!paarUrteil(a, b3, SCHWELLEN).rot.some((x) => x.startsWith("Kanten"))) v.push("Paar: fremdes Bild nicht ROT");
    const b4 = gesund();
    b4.stand.sha = null;
    if (!paarUrteil(a, b4, SCHWELLEN).rot.some((x) => x.includes("SHA"))) v.push("Paar: Stand ohne SHA nicht ROT");
    // PNG hin und zurück
    const rt = pngLesen(pngSchreiben(bunt, W, H));
    if (rt.W !== W || rt.H !== H || rt.u8.some((x, i) => x !== bunt[i]))
        v.push("PNG: Hin und Zurück nicht byte-gleich");
    // DIE FIXTURES: die Beweisbilder vom 13.10. — jede fällt ROT mit ihrem erwarteten Grund
    if (fixtureDir) {
        const fs = require("fs");
        const path = require("path");
        const F = JSON.parse(fs.readFileSync(path.join(fixtureDir, "faelle.json"), "utf8"));
        if (!F.faelle || F.faelle.length < 4) v.push(`Fixtures: ${F.faelle ? F.faelle.length : 0} statt 4 Bilder`);
        for (const f of F.faelle || []) {
            const u = abnahmeUrteil(fixtureMessung(f, fixtureDir), SCHWELLEN);
            if (u.ok) v.push(`Fixture ${f.name}: GRÜN — ${u.zeile}`);
            else
                for (const w of f.erwartet)
                    if (!u.zeile.includes(w)) v.push(`Fixture ${f.name}: ROT ohne „${w}" — ${u.zeile}`);
        }
    }
    return v;
}

module.exports = {
    SCHWELLEN,
    abnahmeUrteil,
    bildMasse,
    paarUrteil,
    pngLesen,
    pngSchreiben,
    verkleinern,
    fixtureMessung,
    abnahmeSelbsttest,
    ABNAHME_INSTALL:
        `window.__abnahmeUrteil = (m) => (${abnahmeUrteil.toString()})(m, ${JSON.stringify(SCHWELLEN)});` +
        `window.__bildMasse = ${bildMasse.toString()};`,
};
