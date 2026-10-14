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

// ═══ DIE SOLL-TAFEL (K63, AAAA Schritt 0, Lehre 18 „erst das Soll-Bild, dann die Welle"; spec/abnahme/soll-tafel.json) ═══
//
// DIE KLASSEN-TEILUNG (rein, in der Seite als `__klassenTeilung`): welche Klasse ein Pixel des Ausgabe-Bilds zeichnet, aus
// Schüssen derselben Pose unter EINER Uhr (`__ausgabeAufnahme` mit `fest`: dieselbe Zeit, dieselbe TRAA-Folge, dieselbe
// Dither-Phase je Schuss; `werkbank bild --klasse`): G die Szene, die gemessenen Klassen ohne Schattenwurf; O_k dieselbe ohne
// die Klasse k. Ein Pixel gehört der Klasse, deren Fehlen es am stärksten ändert (Summe der Kanal-Beträge 0–765), über der
// Schwelle: das Pixel ZEIGT sie — ihr Schatten fehlt in G wie in O_k, eine Wurzel unter dem Boden zeigt in keinem der beiden.
// Ein Misch-Pixel (zwei Klassen über der Schwelle, der Halm vor dem Grund) zählt EINMAL, bei der stärkeren; `misch` zählt sie.
// Die Schwelle hält das GEMESSENE Rauschen: je Aufruf zwei gleiche Schüsse G und G2 (`bildRauschen`), die Tafel bricht über
// RAUSCHEN_MAX. Bis K63-n1 vier Schüsse unter freier Uhr und eine Schatten-Ausnahme nach der Farbart: zwei Schüsse derselben
// Pose unterschieden sich an 27,5 % der Nah-Pixel um mehr als 18, 34 673 Pixel standen in zwei Masken, Gras unter den Tannen
// in der Laub-Maske (Prüfer K63 R1).
const KLASSEN_SCHWELLE = 18;
const RAUSCHEN_MAX = 0.002;
function klassenTeilung(G, Os, W, H, schwelle) {
    const t = schwelle == null ? 18 : schwelle;
    const teil = new Uint8Array(W * H);
    let misch = 0;
    for (let p = 0; p < W * H; p++) {
        const i = p * 4;
        let best = 0,
            bestD = t,
            n = 0;
        for (let k = 0; k < Os.length; k++) {
            const O = Os[k];
            const d = Math.abs(G[i] - O[i]) + Math.abs(G[i + 1] - O[i + 1]) + Math.abs(G[i + 2] - O[i + 2]);
            if (d > t) {
                n++;
                if (d > bestD) {
                    bestD = d;
                    best = k + 1;
                }
            }
        }
        teil[p] = best;
        if (n > 1) misch++;
    }
    return { teil, misch };
}
// Das Rauschen zweier gleicher Schüsse (rein, in der Seite als `__bildRauschen`): Anteil der Pixel über der Schwelle, größter
// Unterschied.
function bildRauschen(A, B, W, H, schwelle) {
    const t = schwelle == null ? 18 : schwelle;
    let n = 0,
        max = 0;
    for (let p = 0; p < W * H; p++) {
        const i = p * 4;
        const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
        if (d > t) n++;
        if (d > max) max = d;
    }
    return { anteil: +(n / (W * H)).toFixed(6), pixel: n, max };
}

// DIE KLASSEN-MASSE (rein, in der Seite als `__klassenMasse`): was das Bild F auf den Pixeln der Maske m zeigt (Luma = Rec. 709
// auf den sRGB-Werten 0–255, wie `bildMasse`):
//   deckung       Anteil der Klasse am Bild · deckungUnten derselbe Anteil im unteren Drittel (der Boden vor dem Auge)
//   luma/kontrast Mittel und σ/Mittel der Luma auf der Klasse
//   detail        mittlerer Gradient-Betrag im Inneren / Mittel (die Normalen- und Textur-Frequenz: glatt → 0)
//   nyquist       Anteil der Schachbrett-Energie an der Gradient-Energie in 2×2-Blöcken ganz in der Klasse (k = (a−b−c+d)/4
//                 gegen gx, gy): ein Dither- oder Hash-Muster → 1, weißes Rauschen 1/3, eine glatte Fläche 0; `ek`/`eg` die
//                 Energien selbst (die Tafel fasst Klassen über ihre Summen zusammen)
//   silhouette    Rand-Pixel / √Fläche (der Kreis 2√π ≈ 3,5; eine zerfranste Krone, ein Gitter weit darüber)
function klassenMasse(F, m, W, H) {
    const L = new Float32Array(W * H);
    for (let p = 0; p < W * H; p++) L[p] = 0.2126 * F[p * 4] + 0.7152 * F[p * 4 + 1] + 0.0722 * F[p * 4 + 2];
    let n = 0,
        s = 0,
        s2 = 0,
        rand = 0,
        unten = 0,
        g = 0,
        ng = 0,
        ek = 0,
        eg = 0;
    const y3 = Math.floor((2 * H) / 3);
    const inM = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x] === 1;
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
            const p = y * W + x;
            if (m[p] !== 1) continue;
            n++;
            s += L[p];
            s2 += L[p] * L[p];
            if (y >= y3) unten++;
            const innen = inM(x - 1, y) && inM(x + 1, y) && inM(x, y - 1) && inM(x, y + 1);
            if (!innen) rand++;
            else {
                g += Math.hypot(L[p + 1] - L[p - 1], L[p + W] - L[p - W]) / 2;
                ng++;
            }
            if ((x & 1) === 0 && (y & 1) === 0 && inM(x + 1, y) && inM(x, y + 1) && inM(x + 1, y + 1)) {
                const a = L[p],
                    b = L[p + 1],
                    c = L[p + W],
                    d = L[p + W + 1];
                const k = (a - b - c + d) / 4,
                    gx = (a - b + c - d) / 4,
                    gy = (a + b - c - d) / 4;
                ek += k * k;
                eg += gx * gx + gy * gy;
            }
        }
    const mittel = n ? s / n : null;
    const r4 = (x) => (x == null || !Number.isFinite(x) ? null : +x.toFixed(4));
    return {
        pixel: n,
        deckung: r4(n / (W * H)),
        deckungUnten: r4(unten / (W * (H - y3))),
        luma: mittel == null ? null : +mittel.toFixed(2),
        kontrast: n ? r4(Math.sqrt(Math.max(0, s2 / n - mittel * mittel)) / Math.max(1, mittel)) : null,
        detail: ng ? r4(g / ng / Math.max(1, mittel)) : null,
        nyquist: ek + eg > 0 ? r4(ek / (ek + eg)) : null,
        ek: +ek.toFixed(1),
        eg: +eg.toFixed(1),
        silhouette: n ? r4(rand / Math.sqrt(n)) : null,
    };
}

// DIE RECHNUNGEN der Soll-Bänder (rein): ein Band, das die Tafel „[gerechnet]" nennt, rechnet DIESE Funktion — die Tafel trägt
// dann nur die Rechnung, nie ihr Ergebnis (Prüfer K63 R1: das Laub-Band [0,11; 0,16] stand ohne Skript im Baum, nachgerechnet
// 0,16–0,22).
//   einsDurch  { von: [a, b] }     das Band [1/b, 1/a] (Licht: E gesamt / E Himmel aus dem Diffus-Anteil des klaren Himmels)
//   nyquist1f  { beta: [b0, b1] }  `klassenMasse` nyquist auf Bildern mit Leistungsspektrum 1/f^β (zufällige Phase, Saat fest,
//                                  128², Grau σ 32 um 128, auf 0–255 gerundet wie die Ausgabe), je β das Mittel aus vier Saaten
// Ein Bild mit Leistungsspektrum 1/f^β (β = 0: weißes Rauschen), n² Pixel (n Zweierpotenz), RGBA grau.
function rauschBild(n, beta, saat) {
    let z = saat >>> 0 || 1;
    const zufall = () => {
        z ^= z << 13;
        z >>>= 0;
        z ^= z >>> 17;
        z ^= z << 5;
        z >>>= 0;
        return z / 4294967296;
    };
    const re = new Float64Array(n * n),
        im = new Float64Array(n * n);
    for (let v = 0; v < n; v++)
        for (let u = 0; u < n; u++) {
            const fu = u <= n / 2 ? u : u - n,
                fv = v <= n / 2 ? v : v - n;
            const f = Math.hypot(fu, fv) / n;
            const phi = 2 * Math.PI * zufall();
            const a = f > 0 ? Math.pow(f, -beta / 2) : 0;
            re[v * n + u] = a * Math.cos(phi);
            im[v * n + u] = a * Math.sin(phi);
        }
    // die 2-D-Rücktransformation als Zeilen- und Spalten-FFT (Radix 2, an Ort)
    const fft = (R, I, o, s) => {
        for (let i = 1, j = 0; i < n; i++) {
            let b = n >> 1;
            for (; j & b; b >>= 1) j ^= b;
            j ^= b;
            if (i < j) {
                const a = o + i * s,
                    c = o + j * s;
                [R[a], R[c]] = [R[c], R[a]];
                [I[a], I[c]] = [I[c], I[a]];
            }
        }
        for (let len = 2; len <= n; len <<= 1) {
            const w = (2 * Math.PI) / len;
            for (let i = 0; i < n; i += len)
                for (let k = 0; k < len / 2; k++) {
                    const cr = Math.cos(w * k),
                        ci = Math.sin(w * k);
                    const a = o + (i + k) * s,
                        b = o + (i + k + len / 2) * s;
                    const tr = R[b] * cr - I[b] * ci,
                        ti = R[b] * ci + I[b] * cr;
                    R[b] = R[a] - tr;
                    I[b] = I[a] - ti;
                    R[a] += tr;
                    I[a] += ti;
                }
        }
    };
    for (let v = 0; v < n; v++) fft(re, im, v * n, 1);
    for (let u = 0; u < n; u++) fft(re, im, u, n);
    let s = 0,
        s2 = 0;
    for (let p = 0; p < n * n; p++) {
        s += re[p];
        s2 += re[p] * re[p];
    }
    const mu = s / (n * n),
        sd = Math.sqrt(Math.max(1e-12, s2 / (n * n) - mu * mu));
    const u8 = new Uint8Array(n * n * 4);
    for (let p = 0; p < n * n; p++) {
        const c = Math.max(0, Math.min(255, Math.round(128 + (32 * (re[p] - mu)) / sd)));
        u8.set([c, c, c, 255], p * 4);
    }
    return u8;
}
const NYQUIST_NATUR = new Map();
function nyquistNatur(beta) {
    if (NYQUIST_NATUR.has(beta)) return NYQUIST_NATUR.get(beta);
    const n = 128,
        voll = new Uint8Array(n * n).fill(1);
    let s = 0;
    for (let saat = 1; saat <= 4; saat++) s += klassenMasse(rauschBild(n, beta, 7919 * saat), voll, n, n).nyquist;
    NYQUIST_NATUR.set(beta, +(s / 4).toFixed(4));
    return NYQUIST_NATUR.get(beta);
}
function sollRechnung(r) {
    if (!r || typeof r !== "object") return { fehler: "keine Rechnung" };
    const paar = (x) => Array.isArray(x) && x.length === 2 && x.every((v) => typeof v === "number" && v > 0);
    if (r.art === "einsDurch") {
        if (!paar(r.von)) return { fehler: "einsDurch ohne von [a, b] > 0" };
        return { band: [+(1 / r.von[1]).toFixed(4), +(1 / r.von[0]).toFixed(4)] };
    }
    if (r.art === "nyquist1f") {
        if (!paar(r.beta)) return { fehler: "nyquist1f ohne beta [b0, b1] > 0" };
        const a = nyquistNatur(r.beta[0]),
            b = nyquistNatur(r.beta[1]);
        return { band: [Math.min(a, b), Math.max(a, b)] };
    }
    return { fehler: `Rechnung „${r.art}" unbekannt (einsDurch, nyquist1f)` };
}

// DIE MASSE der Tafel (rein): je Maß-Name die Rechnung, die das Ist aus seiner Rohdatei LIEST — der Messung, die das Werkzeug in
// die Tafel schreibt (`mass.messung`, `werkbank bild --klasse … --ist <id>` bzw. `werkbank licht --ist <id>`), oder der Zeile
// einer anderen Tafel (`mass.rohdatei`: die Albedo-Tafel). Ein Ist von Hand gibt es nicht. Rückgabe { ist, taeter, anteil,
// teile, fehler }.
const SOLL_MASSE = Object.freeze([
    "laiWirk",
    "nyquist",
    "detail",
    "stufenTreue",
    "lichtVerhaeltnis",
    "albedoVerhaeltnis",
    "albedo",
]);
// Die Messung eines Bilds: vom Werkzeug geschrieben, Stand · Gerät · Leinwand, ihr Rauschen unter der Wand.
function bildMessungFehler(me) {
    if (!me || typeof me !== "object") return "keine Messung";
    if (me.werkzeug !== "bild") return `die Messung stammt nicht aus \`werkbank bild\` (${me.werkzeug})`;
    for (const f of ["datum", "stand", "geraet", "leinwand", "klassen", "rauschen", "schwelle"])
        if (me[f] == null) return `die Messung ohne ${f}`;
    if (!(me.rauschen.anteil <= RAUSCHEN_MAX))
        return `die Teilung hält ihr Rauschen nicht: ${me.rauschen.anteil} der Pixel zweier gleicher Schüsse über der Schwelle ${me.schwelle} (Wand ${RAUSCHEN_MAX})`;
    if (!Object.keys(me.klassen).length) return "die Messung zeigt keine Klasse";
    return null;
}
const pixelSumme = (me, re) =>
    Object.entries(me.klassen).reduce((a, [n, k]) => a + (!re || re.test(n) ? k.pixel || 0 : 0), 0);
const flaeche = (me) => me.leinwand[0] * me.leinwand[1];
const MASS_RECHNER = {
    // DIE DECKUNG DER WIESE als wirksamer Blatt-Flächen-Index (Nilson 1971: Lücke P(θ) = exp(−G·LAI/cos θ)): je Abstands-Band
    // (`werkbank bild --abstand`: der Strahl des Pixels bis zum gezeichneten Boden, `_bodenSichtAt`) die Lücke P = Grund /
    // (Halm + Grund) und cos θ des Blicks, LAI = −ln P · cos θ / G; das Ist ist das Pixel-Mittel über die Bänder im Ring der
    // Nah-Wiese (`abstand.ring`, ihr Radius in der gemessenen Welt). Der Täter ist das Band, das am meisten freien Grund
    // zeigt, den das Soll nicht zeigen dürfte (Pixel × (LAI-Soll − LAI)), und die Halm-Klasse, die dort zeichnet.
    laiWirk(ma, q, band) {
        const me = ma.messung,
            rc = ma.rechnung || {};
        const f = bildMessungFehler(me);
        if (f) return { fehler: f };
        const ab = me.abstand;
        if (!ab || !Array.isArray(ab.baender) || !ab.klassen || !Array.isArray(ab.cos))
            return { fehler: "die Messung ohne Abstands-Bänder (werkbank bild --abstand)" };
        if (!(rc.G > 0 && rc.halm && rc.grund)) return { fehler: "laiWirk ohne rechnung { G, halm, grund }" };
        const ring = ab.ring;
        if (!(ring > 0)) return { fehler: "die Messung ohne den Ring der Nah-Wiese (abstand.ring)" };
        const halm = new RegExp(rc.halm),
            grund = new RegExp(rc.grund);
        const baender = [];
        let sw = 0,
            sl = 0;
        for (let b = 0; b < ab.baender.length - 1; b++) {
            let h = 0,
                g = 0;
            const wer = {};
            for (const [n, z] of Object.entries(ab.klassen)) {
                if (halm.test(n)) {
                    h += z[b] || 0;
                    wer[n] = z[b] || 0;
                } else if (grund.test(n)) g += z[b] || 0;
            }
            const nb = h + g,
                c = ab.cos[b];
            const P = nb ? Math.max(g, 0.5) / nb : null;
            const lai = nb && c > 0 ? (-Math.log(P) * c) / rc.G : null;
            const imRing = ab.baender[b + 1] <= ring;
            baender.push({ von: ab.baender[b], bis: ab.baender[b + 1], halm: h, grund: g, P, cos: c, lai, imRing, wer });
            if (imRing && lai != null) {
                sw += nb;
                sl += lai * nb;
            }
        }
        if (!sw) return { fehler: `kein Boden-Pixel im Ring ≤ ${ring} m` };
        const imRingB = baender.filter((b) => b.imRing && b.lai != null);
        const soll = band && band[0] != null ? band[0] : 0;
        const fehlt = (b) => (b.halm + b.grund) * Math.max(0, soll - b.lai);
        const arg = imRingB.reduce((a, b) => (fehlt(b) > fehlt(a) ? b : a));
        const zeichner = Object.entries(arg.wer).sort((a, b) => b[1] - a[1])[0];
        const r2 = (x) => +x.toFixed(2);
        const taeter =
            `${arg.von}–${arg.bis} m vor dem Auge: Lücke ${r2(arg.P)} (${arg.grund} von ${arg.halm + arg.grund} Pixeln Grund) → LAI ${r2(arg.lai)}` +
            (zeichner && zeichner[1] ? `, dort zeichnet ${zeichner[0]} (${Math.round((100 * zeichner[1]) / Math.max(1, arg.halm))} % der Halme)` : ", dort zeichnet kein Halm");
        return {
            ist: +(sl / sw).toFixed(3),
            taeter,
            anteil: +(pixelSumme(me, halm) + pixelSumme(me, grund)) / flaeche(me),
            teile: baender.map((b) => `${b.von}–${b.bis} m ${b.lai == null ? "—" : r2(b.lai)}${b.imRing ? "" : " (jenseits)"}`).join(" · "),
        };
    },
    // DER SCHACHBRETT-ANTEIL der Klasse (`klassenMasse` nyquist über die Summen aller ihrer Teil-Klassen); der Täter die
    // Teil-Klasse (≥ 5 % der Pixel) mit dem höchsten Anteil.
    nyquist(ma) {
        const me = ma.messung;
        const f = bildMessungFehler(me);
        if (f) return { fehler: f };
        let ek = 0,
            eg = 0;
        const px = pixelSumme(me);
        let arg = null;
        for (const [n, k] of Object.entries(me.klassen)) {
            ek += k.ek || 0;
            eg += k.eg || 0;
            if (k.pixel >= 0.05 * px && k.nyquist != null && (!arg || k.nyquist > arg[1])) arg = [n, k.nyquist];
        }
        if (!(ek + eg > 0)) return { fehler: "keine 2×2-Blöcke in der Klasse" };
        return {
            ist: +(ek / (ek + eg)).toFixed(4),
            taeter: arg ? `${arg[0]} (nyquist ${arg[1]})` : null,
            anteil: px / flaeche(me),
        };
    },
    // DAS DETAIL der Klasse (`klassenMasse` detail, Pixel-Mittel über ihre Teil-Klassen): glatt → 0
    detail(ma) {
        const me = ma.messung;
        const f = bildMessungFehler(me);
        if (f) return { fehler: f };
        let s = 0,
            n = 0,
            arg = null;
        for (const [k, z] of Object.entries(me.klassen)) {
            if (z.detail == null) continue;
            s += z.detail * z.pixel;
            n += z.pixel;
            if (!arg || z.detail < arg[1]) arg = [k, z.detail];
        }
        if (!n) return { fehler: "kein Inneres in der Klasse" };
        return { ist: +(s / n).toFixed(4), taeter: `${arg[0]} (detail ${arg[1]})`, anteil: pixelSumme(me) / flaeche(me) };
    },
    // DIE STUFEN-TREUE: Luma desselben Exemplars aus der Ferne / aus der Nähe — gezählt nur die Teil-Klassen, die BEIDE Schüsse
    // zeigen (je ≥ 200 Pixel; bis K63-n1 verglich das Maß drei Tore nah mit einem Pavillon fern); der Täter die Teil-Klasse mit
    // dem größten Sprung.
    stufenTreue(ma) {
        const me = ma.messung || {};
        const fn = bildMessungFehler(me.nah),
            ff = bildMessungFehler(me.fern);
        if (fn || ff) return { fehler: `nah: ${fn || "ok"} · fern: ${ff || "ok"}` };
        const gemein = Object.keys(me.nah.klassen).filter(
            (n) => (me.nah.klassen[n].pixel || 0) >= 200 && me.fern.klassen[n] && (me.fern.klassen[n].pixel || 0) >= 200
        );
        if (!gemein.length) return { fehler: "nah und fern zeigen kein gemeinsames Exemplar (je ≥ 200 Pixel)" };
        const summe = (s) =>
            gemein.reduce((a, n) => [a[0] + s.klassen[n].luma * s.klassen[n].pixel, a[1] + s.klassen[n].pixel], [0, 0]);
        const [ln, pn] = summe(me.nah),
            [lf, pf] = summe(me.fern);
        let arg = null;
        for (const n of gemein) {
            const q = me.fern.klassen[n].luma / Math.max(1e-6, me.nah.klassen[n].luma);
            if (!arg || Math.abs(Math.log(q)) > Math.abs(Math.log(arg[1]))) arg = [n, q];
        }
        return {
            ist: +(lf / pf / Math.max(1e-6, ln / pn)).toFixed(3),
            taeter: `${arg[0]} (fern/nah ${arg[1].toFixed(2)})`,
            anteil: pn / flaeche(me.nah),
            teile: `gemeinsam ${gemein.join(", ")}`,
        };
    },
    // DAS LICHT-VERHÄLTNIS: E(Sonne + Himmel) / E(Himmel) an der waagrechten 18-%-Karte (`werkbank licht`, die Licht-Bilanz)
    lichtVerhaeltnis(ma) {
        const me = ma.messung;
        if (!me || me.werkzeug !== "licht") return { fehler: "keine Messung aus `werkbank licht`" };
        for (const f of ["datum", "stand", "E_alle", "E_umgebung"]) if (me[f] == null) return { fehler: `die Messung ohne ${f}` };
        if (!(me.E_umgebung > 0 && me.E_alle > me.E_umgebung))
            return { fehler: `E alle ${me.E_alle}, E Himmel ${me.E_umgebung} — die Bilanz misst die Sonne nicht` };
        return {
            ist: +(me.E_alle / me.E_umgebung).toFixed(3),
            taeter: `E Himmel ${me.E_umgebung} gegen E Sonne ${+(me.E_alle - me.E_umgebung).toFixed(2)}`,
        };
    },
};
// Die Zeile einer Albedo-Tafel (`mass.rohdatei` { datei, zeile }): gelesen, nie abgeschrieben.
function albedoZeile(ma, q) {
    const ro = ma.rohdatei || {};
    const text = ro.datei ? q.lesen(ro.datei) : null;
    if (text == null) return { fehler: `Rohdatei ${ro.datei} fehlt` };
    let t = null;
    try {
        t = JSON.parse(text);
    } catch (_e) {
        return { fehler: `Rohdatei ${ro.datei} ist kein JSON` };
    }
    const z = (t.zeilen || []).find((x) => x.id === ro.zeile);
    if (!z || !z.ist) return { fehler: `Rohdatei ${ro.datei}: Zeile „${ro.zeile}" ohne Ist` };
    const w = (t.gemessen && t.gemessen.welt) || {};
    return { t, z, stand: `${String(w.datum || "?").slice(0, 10)} ${w.geraet || "?"}` };
}
MASS_RECHNER.albedoVerhaeltnis = (ma, q) => {
    const a = albedoZeile(ma, q);
    if (a.fehler) return a;
    const v = a.z.ist.verhaeltnis;
    return {
        ist: v,
        taeter: `Labor ${a.z.ist.labor.Y} gegen Welt ${a.z.ist.welt.Y} (${ma.rohdatei.zeile})`,
        stand: a.stand,
    };
};
MASS_RECHNER.albedo = (ma, q) => {
    const a = albedoZeile(ma, q);
    if (a.fehler) return a;
    return { ist: a.z.ist.welt.Y, taeter: `Welt-Albedo ${a.z.ist.welt.Y} (${ma.rohdatei.zeile})`, stand: a.stand };
};

// Das Band einer Soll-Eigenschaft: eigen (`band` mit Quelle), gerechnet (`rechnung`, nie ein abgeschriebenes Ergebnis) oder
// GELESEN (`verweis` { datei, symbol, feld } in einem Kern — KOPF_SOLL — bzw. { datei, feld, art: "toleranz" } in einer
// Tafel: das Band [1 − t, 1 + t]). Ein Verweis, den nichts liest, ist ein Bruch.
function eigenschaftBand(e, q, wo) {
    const n = [e.band != null, e.rechnung != null, e.verweis != null].filter(Boolean).length;
    if (n !== 1) return { fehler: `${wo}: Soll ${e.groesse} trägt ${n} statt EINER Quelle des Bands (band · rechnung · verweis)` };
    if (/\[gerechnet\]/.test(e.quelle || "") && !e.rechnung)
        return { fehler: `${wo}: Soll ${e.groesse} heißt „[gerechnet]" ohne Rechnung — die Linse rechnet jedes gerechnete Band` };
    if (e.band != null)
        return Array.isArray(e.band) && e.band.length === 2 && (e.band[0] != null || e.band[1] != null)
            ? { band: e.band }
            : { fehler: `${wo}: Soll ${e.groesse} ohne Band [min, max]` };
    if (e.rechnung != null) {
        const r = sollRechnung(e.rechnung);
        return r.fehler ? { fehler: `${wo}: Soll ${e.groesse}: ${r.fehler}` } : { band: r.band, gerechnet: true };
    }
    const v = e.verweis;
    if (v.symbol) {
        const wert = q.kern ? q.kern(v.datei, v.symbol) : undefined;
        if (wert === undefined) return { fehler: `${wo}: Verweis ${v.datei} ${v.symbol} — das Symbol ist dort nicht definiert` };
        const b = v.feld != null ? wert && wert[v.feld] : wert;
        if (!(Array.isArray(b) && b.length === 2))
            return { fehler: `${wo}: Verweis ${v.datei} ${v.symbol}.${v.feld} trägt kein Band [min, max]` };
        return { band: b.slice(), gelesen: `${v.symbol}.${v.feld}` };
    }
    const text = q.lesen(v.datei);
    if (text == null) return { fehler: `${wo}: Verweis auf ${v.datei} — die Datei fehlt` };
    let t = null;
    try {
        t = JSON.parse(text);
    } catch (_e) {
        return { fehler: `${wo}: Verweis auf ${v.datei} — kein JSON` };
    }
    const wert = v.feld ? t[v.feld] : undefined;
    if (v.art === "toleranz" && typeof wert === "number")
        return { band: [+(1 - wert).toFixed(4), +(1 + wert).toFixed(4)], gelesen: `${v.datei} ${v.feld}` };
    return { fehler: `${wo}: Verweis ${v.datei} ${v.feld} — kein lesbares Band (art toleranz)` };
}

// DAS URTEIL DER TAFEL (rein): je Klasse das Soll (eigen, gerechnet oder gelesen), das Budget je LOD-Stufe aus dem Haushalt des
// Profi-Bands (`budget.haushalt`: die Klassen-Zeile ist L0, L1 ≤ 35 %, L2 ≤ 10 % — Nordstern M4; der VRAM-Anteil der Welt nach dem
// Dreiecks-Anteil der Zeile) und das Ist, das DIESE Funktion aus der Rohdatei rechnet. ROT/GRÜN aus Ist und Band, ungemessen ist
// ROT. Die WIRKUNG (die Reihenfolge der AAAA-Karten) = Bildanteil der Klasse am Messort × Abstand zum Band |ln(Ist/Rand)|, beides
// gerechnet; GRÜN wirkt 0. `fehler` sind Brüche der Tafel (Schema, ein Ist von Hand, ein Verweis ohne Ziel oder ohne Leser, ein
// gerechnetes Band ohne Rechnung, eine Messung über ihrem Rauschen) — sie machen die Wand ROT; ein ROTES Maß ist der Auftrag der
// nächsten AAAA-Karte. q = { haushalt, lesen(datei) → Text | null, kern(datei, symbol) → Wert | undefined }.
function sollTafelUrteil(tafel, q) {
    const fehler = [];
    const zeilen = [];
    const haushalt = (q && q.haushalt) || null;
    q = Object.assign({ lesen: () => null }, q);
    const kl = (tafel && tafel.klassen) || [];
    if (!kl.length) fehler.push("die Tafel trägt keine Klasse (vakuös)");
    const welt = haushalt ? haushalt.band.vramMB - ((haushalt.renderZiele && haushalt.renderZiele.mb) || 0) : null;
    const summeTris = haushalt ? haushalt.klassen.reduce((a, k) => a + (k.dreiecke || 0), 0) : 0;
    const zahl = (x) => typeof x === "number" && Number.isFinite(x);
    const ids = new Set();
    for (const k of kl) {
        const wo = `Klasse ${k.id || "?"}`;
        if (!k.id || ids.has(k.id)) fehler.push(`${wo}: id fehlt oder doppelt`);
        ids.add(k.id);
        if (!(k.referenz || []).some((r) => r.titel && r.technik))
            fehler.push(`${wo}: keine benannte AAA-Referenz (Titel + Technik)`);
        const so = k.soll || {};
        const baender = {};
        if (!(so.eigenschaften || []).length) fehler.push(`${wo}: kein Soll`);
        for (const e of so.eigenschaften || []) {
            if (!e.groesse || !e.quelle) {
                fehler.push(`${wo}: Soll-Eigenschaft ${e.groesse || "?"} ohne Größe oder Quelle`);
                continue;
            }
            const b = eigenschaftBand(e, q, wo);
            if (b.fehler) fehler.push(b.fehler);
            else baender[e.groesse] = b;
        }
        const b = k.budget || {};
        const hz = haushalt ? haushalt.klassen.find((x) => x.id === b.haushalt) : null;
        if (!hz)
            fehler.push(`${wo}: Budget ohne Haushalt-Klasse („${b.haushalt}" fehlt in spec/profiband/haushalt.json)`);
        const stufen = hz
            ? {
                  L0: { dreiecke: hz.dreiecke, befehle: hz.befehle },
                  L1: { dreiecke: Math.round(hz.dreiecke * 0.35), befehle: Math.ceil(hz.befehle * 0.35) },
                  L2: { dreiecke: Math.round(hz.dreiecke * 0.1), befehle: Math.ceil(hz.befehle * 0.1) },
                  vramMB: summeTris ? +((welt * hz.dreiecke) / summeTris).toFixed(1) : null,
              }
            : null;
        const ma = k.mass || {};
        if (!SOLL_MASSE.includes(ma.name)) fehler.push(`${wo}: Maß „${ma.name}" unbekannt (${SOLL_MASSE.join(", ")})`);
        for (const f of ["ist", "teile", "taeter"])
            if (ma[f] !== undefined)
                fehler.push(`${wo}: das Maß trägt „${f}" von Hand — Ist und Täter rechnet die Linse aus der Rohdatei`);
        const sb = baender[ma.soll || ma.name];
        if (!sb) fehler.push(`${wo}: das Maß ${ma.name} hat kein Soll-Band (soll „${ma.soll || ma.name}")`);
        for (const e of so.eigenschaften || [])
            if (e.verweis && (ma.soll || ma.name) !== e.groesse)
                fehler.push(`${wo}: Verweis ${e.verweis.datei} (${e.groesse}) — kein Maß liest ihn`);
        const band = sb ? sb.band : null;
        const rechner = MASS_RECHNER[ma.name];
        const r = !rechner ? { fehler: "kein Rechner" } : ma.messung == null && !ma.rohdatei ? { ungemessen: true } : rechner(ma, q, sb ? sb.band : null);
        if (r.fehler) fehler.push(`${wo}: ${r.fehler}`);
        const ist = zahl(r.ist) ? r.ist : null;
        let urteil = "ROT",
            grund = null,
            abstand = null;
        if (ist == null) grund = `${ma.name} ungemessen`;
        else if (band && band[0] != null && ist < band[0]) {
            grund = `${ma.name} ${ist} < ${band[0]}`;
            abstand = Math.abs(Math.log(ist / band[0]));
        } else if (band && band[1] != null && ist > band[1]) {
            grund = `${ma.name} ${ist} > ${band[1]}`;
            abstand = Math.abs(Math.log(ist / band[1]));
        } else if (band) {
            urteil = "GRÜN";
            abstand = 0;
        }
        // der Bildanteil: aus der Messung des Maßes, sonst aus dem Bild der Wirkung (`--ist <id>:wirkung`), von Hand nur ohne Bild
        // und mit Quelle (das Licht: jedes Pixel)
        let anteil = zahl(r.anteil) ? r.anteil : null;
        const wi = k.wirkung || {};
        if (anteil == null && wi.messung) {
            const fw = bildMessungFehler(wi.messung);
            if (fw) fehler.push(`${wo}: das Bild der Wirkung: ${fw}`);
            else anteil = pixelSumme(wi.messung) / flaeche(wi.messung);
        }
        if (zahl(wi.anteil)) {
            if (zahl(r.anteil) || wi.messung)
                fehler.push(`${wo}: der Bildanteil steht von Hand neben einer Messung — er kommt aus ihr`);
            else if (!wi.quelle) fehler.push(`${wo}: der Bildanteil von Hand ohne Quelle`);
            else anteil = wi.anteil;
        }
        const me = ma.messung && (ma.messung.nah || ma.messung);
        zeilen.push({
            id: k.id,
            titel: k.titel,
            mass: ma.name,
            ist,
            band,
            bandArt: sb ? (sb.gerechnet ? "gerechnet" : sb.gelesen ? `gelesen ${sb.gelesen}` : "eigen") : null,
            urteil,
            grund,
            taeter: urteil === "ROT" ? r.taeter || null : null,
            teile: r.teile || null,
            anteil: anteil == null ? null : +anteil.toFixed(3),
            wirkung: anteil == null || abstand == null ? null : +(anteil * abstand).toFixed(3),
            stand: r.stand || (me && me.datum ? `${String(me.datum).slice(0, 10)} ${String(me.stand.sha || "").slice(0, 8)} ${me.geraet.adapter || ""}`.trim() : null),
            stufen,
        });
    }
    // DIE REIHENFOLGE nach Wirkung: ROT gemessen (Wirkung absteigend), ROT ungemessen, GRÜN
    const rangVon = (z) => (z.urteil === "GRÜN" ? 2 : z.ist == null ? 1 : 0);
    zeilen.sort((a, b) => rangVon(a) - rangVon(b) || (b.wirkung || 0) - (a.wirkung || 0));
    zeilen.forEach((z, i) => (z.rang = i + 1));
    return { ok: fehler.length === 0, fehler, zeilen, rot: zeilen.filter((z) => z.urteil === "ROT").length };
}
function sollTafelZeile(z) {
    const b = z.band ? `[${z.band[0] == null ? "−∞" : z.band[0]}, ${z.band[1] == null ? "∞" : z.band[1]}]` : "?";
    const s = z.stufen;
    const bud = s
        ? `L0 ${s.L0.dreiecke}/${s.L0.befehle} · L1 ${s.L1.dreiecke}/${s.L1.befehle} · L2 ${s.L2.dreiecke}/${s.L2.befehle} · ${s.vramMB} MB`
        : "kein Budget";
    const w =
        z.wirkung != null
            ? ` · Wirkung ${z.wirkung} (Anteil ${z.anteil})`
            : z.urteil === "ROT" && z.ist != null
              ? " · Wirkung ungemessen (der Bildanteil fehlt)"
              : "";
    return (
        `${z.rang}. ${z.urteil === "ROT" ? "ROT " : "GRÜN"} ${z.id}: ${z.mass} ${z.ist == null ? "—" : z.ist} Soll ${b} (${z.bandArt || "?"})${w}` +
        `${z.urteil === "ROT" ? ` — ${z.grund}${z.taeter ? ` · Täter ${z.taeter}` : ""}` : ""}` +
        `${z.teile ? ` · ${z.teile}` : ""} · Budget ${bud}${z.stand ? ` · gemessen ${z.stand}` : ""}`
    );
}

// DER SELBSTTEST der Soll-Tafel (rein): die Teilung zeigt die Klasse ohne ihren Schatten und ohne ihre Wurzel, ein Misch-Pixel
// zählt einmal, das Rauschen zweier gleicher Schüsse ist 0; die Maße treffen ihre Eichpunkte (Schachbrett 1, glatt 0, weißes
// Rauschen ⅓, 1/f^β fällt mit β, die Lücke einer Wiese mit LAI 2 liest LAI 2); jeder eingeschmuggelte Bruch der Tafel fällt
// beim Namen; das Ist kommt aus der Rohdatei (eine geänderte Albedo-Tafel ändert das Urteil, ein Ist von Hand ist ein Bruch);
// ein Ist außerhalb ist ROT, ein ungemessenes nie GRÜN. Rückgabe: Liste der Brüche (leer = grün).
function sollTafelSelbsttest(tafel, q) {
    const v = [];
    const W = 16,
        H = 12;
    const bild = (f) => {
        const u = new Uint8Array(W * H * 4);
        for (let y = 0; y < H; y++)
            for (let x = 0; x < W; x++) {
                const c = f(x, y);
                u.set([c, c, c, 255], (y * W + x) * 4);
            }
        return u;
    };
    // die Klasse A ein Quadrat x 4–9, y 2–7, ihre Wurzel unter dem Boden x 7–8, y 9–10 (in keinem Schuss sichtbar: der Boden
    // deckt sie), ein Verdecker davor x 4–5; die Klasse B (der Boden) y ≥ 8; ein Misch-Pixel (3, 8): A über dem Boden, beide
    // ändern es, A stärker. G ohne Schattenwurf der Klassen — ihr Schatten (in F) zählt nicht.
    const inA = (x, y) => x >= 4 && x <= 9 && y >= 2 && y <= 7;
    const vor = (x) => x === 4 || x === 5;
    const misch = (x, y) => x === 3 && y === 8;
    const G = bild((x, y) => (inA(x, y) ? (vor(x) ? 30 : 200) : misch(x, y) ? 170 : y > 7 ? 120 : 220));
    const OA = bild((x, y) => (inA(x, y) && vor(x) ? 30 : misch(x, y) ? 120 : y > 7 ? 120 : 220));
    const OB = bild((x, y) => (inA(x, y) ? (vor(x) ? 30 : 200) : misch(x, y) ? 210 : 220));
    const { teil, misch: nm } = klassenTeilung(G, [OA, OB], W, H, 18);
    let falsch = 0;
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
            const e = (inA(x, y) && !vor(x)) || misch(x, y) ? 1 : y > 7 ? 2 : 0;
            if (teil[y * W + x] !== e) falsch++;
        }
    if (falsch) v.push(`Teilung: ${falsch} Pixel falsch (Wurzel, Verdecker oder Misch-Pixel in der falschen Klasse)`);
    if (nm !== 1) v.push(`Teilung: ${nm} Misch-Pixel statt 1`);
    if (bildRauschen(G, G, W, H, 18).anteil !== 0) v.push("Rauschen: zwei gleiche Schüsse rauschen");
    if (bildRauschen(G, OA, W, H, 18).pixel !== 25) v.push("Rauschen: 25 geänderte Pixel nicht gezählt");
    const voll = new Uint8Array(W * H).fill(1);
    const schach = klassenMasse(
        bild((x, y) => ((x + y) & 1 ? 40 : 200)),
        voll,
        W,
        H
    );
    if (!(schach.nyquist > 0.99)) v.push(`Maß nyquist: Schachbrett ${schach.nyquist} statt 1`);
    const glatt = klassenMasse(
        bild((x) => 40 + x * 8),
        voll,
        W,
        H
    );
    if (!(glatt.nyquist < 0.01)) v.push(`Maß nyquist: Verlauf ${glatt.nyquist} statt 0`);
    if (!(glatt.detail > 0)) v.push(`Maß detail: Verlauf ${glatt.detail} nicht > 0`);
    if (
        klassenMasse(
            bild(() => 99),
            voll,
            W,
            H
        ).detail !== 0
    )
        v.push("Maß detail: Flachbild nicht 0");
    const mA = new Uint8Array(W * H);
    for (let p = 0; p < W * H; p++) mA[p] = teil[p] === 1 ? 1 : 0;
    // die Klasse A zeigt 200, das Misch-Pixel 170: Mittel (24·200 + 170)/25
    if (!(Math.abs(klassenMasse(G, mA, W, H).luma - (24 * 200 + 170) / 25) < 1e-6)) v.push("Maß luma: die Klasse liest falsch");
    // die Rechnungen: weißes Rauschen ⅓, 1/f^β fällt mit β, einsDurch kehrt das Band um
    const weiss = nyquistNatur(0);
    if (!(Math.abs(weiss - 1 / 3) < 0.03)) v.push(`Rechnung nyquist1f: weißes Rauschen ${weiss} statt ⅓`);
    const n16 = nyquistNatur(1.6),
        n24 = nyquistNatur(2.4);
    if (!(n16 > n24 && n24 > 0.05)) v.push(`Rechnung nyquist1f: β 1,6 ${n16} nicht über β 2,4 ${n24}`);
    const ed = sollRechnung({ art: "einsDurch", von: [0.08, 0.2] }).band;
    if (!(ed && ed[0] === 5 && ed[1] === 12.5)) v.push(`Rechnung einsDurch: [0,08; 0,2] → ${ed} statt [5; 12,5]`);
    // der Blatt-Flächen-Index: eine Wiese mit LAI 2, Lücke je Band exp(−G·LAI/cos θ), liest LAI 2
    const cos = [0.6, 0.3, 0.15, 0.1, 0.05];
    const baender = [0, 2, 5, 10, 14, 30];
    const halmZ = [],
        grundZ = [];
    for (const c of cos) {
        const P = Math.exp((-0.5 * 2) / c);
        grundZ.push(Math.round(1e6 * P));
        halmZ.push(1e6 - Math.round(1e6 * P));
    }
    const laiMe = {
        werkzeug: "bild",
        datum: "x",
        stand: { sha: "x" },
        geraet: { adapter: "x" },
        leinwand: [1000, 1000],
        schwelle: 18,
        rauschen: { anteil: 0 },
        klassen: { "halm:L0": { pixel: 1 }, grund: { pixel: 1 } },
        abstand: { baender, ring: 14, cos, klassen: { "halm:L0": halmZ, grund: grundZ } },
    };
    const lai = MASS_RECHNER.laiWirk({ messung: laiMe, rechnung: { G: 0.5, halm: "^halm:", grund: "^grund$" } });
    if (!(Math.abs(lai.ist - 2) < 0.02)) v.push(`Maß laiWirk: eine Wiese mit LAI 2 liest ${lai.ist}${lai.fehler ? " — " + lai.fehler : ""}`);
    // die Tafel: die echte ohne Bruch, jeder eingeschmuggelte Bruch beim Namen
    const echt = sollTafelUrteil(tafel, q);
    for (const f of echt.fehler) v.push(`Tafel: ${f}`);
    const klon = () => JSON.parse(JSON.stringify(tafel));
    const finde = (t, f) => (t.klassen || []).find(f);
    const mitMessung = (t) => finde(t, (k) => k.mass && k.mass.messung && k.mass.messung.werkzeug === "bild");
    const mitVerweis = (t) => finde(t, (k) => ((k.soll && k.soll.eigenschaften) || []).some((e) => e.verweis && e.verweis.symbol));
    const mitAlbedo = (t) => finde(t, (k) => k.mass && k.mass.rohdatei);
    const faelle = [
        ["Haushalt-Klasse fehlt", (t) => (t.klassen[0].budget.haushalt = "phantom"), '„phantom" fehlt'],
        [
            "Verweis ins Leere",
            (t) => (mitVerweis(t).soll.eigenschaften.find((e) => e.verweis).verweis.symbol = "PHANTOM_SOLL"),
            "PHANTOM_SOLL",
        ],
        [
            "Verweis ohne Leser",
            (t) => mitVerweis(t).soll.eigenschaften.push({ groesse: "zier", verweis: { datei: "koerper-core.js", symbol: "KOPF_SOLL", feld: "augenLinie" }, quelle: "x" }),
            "kein Maß liest ihn",
        ],
        ["Maß unbekannt", (t) => (t.klassen[0].mass.name = "schoenheit"), '„schoenheit" unbekannt'],
        ["Referenz ohne Technik", (t) => (t.klassen[0].referenz = [{ titel: "X" }]), "keine benannte AAA-Referenz"],
        ["Ist von Hand", (t) => (t.klassen[0].mass.ist = 1), "von Hand"],
        [
            "gerechnet ohne Rechnung",
            (t) => t.klassen[0].soll.eigenschaften.push({ groesse: "x", band: [0, 1], quelle: "Natur [gerechnet]" }),
            "ohne Rechnung",
        ],
        [
            "Band und Rechnung zugleich",
            (t) => t.klassen[0].soll.eigenschaften.push({ groesse: "y", band: [5, 12], rechnung: { art: "einsDurch", von: [0.08, 0.2] }, quelle: "x" }),
            "statt EINER Quelle",
        ],
        ["Rauschen über der Wand", (t) => (mitMessung(t).mass.messung.rauschen.anteil = 0.05), "hält ihr Rauschen nicht"],
        ["Albedo-Zeile fehlt", (t) => (mitAlbedo(t).mass.rohdatei.zeile = "phantom"), "„phantom\" ohne Ist"],
    ];
    for (const [name, fn, wort] of faelle) {
        if (!tafel || !(tafel.klassen || []).length) break;
        const t = klon();
        try {
            fn(t);
        } catch (e) {
            v.push(`Tafel-Bruch „${name}": die Tafel trägt keinen Fall dafür (${e.message})`);
            continue;
        }
        const u = sollTafelUrteil(t, q);
        if (u.ok || !u.fehler.some((f) => f.includes(wort)))
            v.push(`Tafel-Bruch „${name}": nicht beim Namen (${u.fehler.join(" · ") || "grün"})`);
    }
    // das Ist kommt aus der Rohdatei: dieselbe Albedo-Zeile, ihr Verhältnis auf 1 — das Urteil folgt (Prüfer K63 R1: die Kopie
    // in der Tafel blieb grün, als die Albedo-Tafel sich änderte)
    const ka = tafel && mitAlbedo(klon());
    if (ka) {
        const ro = ka.mass.rohdatei;
        const q2 = Object.assign({}, q, {
            lesen: (d) => {
                const t = q.lesen(d);
                if (d !== ro.datei || t == null) return t;
                const j = JSON.parse(t);
                const z = j.zeilen.find((x) => x.id === ro.zeile);
                z.ist.verhaeltnis = 1;
                z.ist.welt.Y = 0.2;
                return JSON.stringify(j);
            },
        });
        const z0 = echt.zeilen.find((z) => z.id === ka.id);
        const z1 = sollTafelUrteil(tafel, q2).zeilen.find((z) => z.id === ka.id);
        if (!z0 || !z1 || z1.ist === z0.ist) v.push(`${ka.id}: das Ist liest nicht aus ${ro.datei} (geändert bleibt ${z1 && z1.ist})`);
    }
    if (tafel && (tafel.klassen || []).length) {
        const t = klon();
        delete t.klassen[0].mass.messung;
        delete t.klassen[0].mass.rohdatei;
        const z = sollTafelUrteil(t, q).zeilen.find((x) => x.id === t.klassen[0].id);
        if (!z || z.urteil !== "ROT") v.push("ein ungemessenes Ist ist GRÜN");
        const t3 = klon();
        const k3 = mitMessung(t3);
        if (k3 && k3.mass.name === "laiWirk") {
            const ab = k3.mass.messung.abstand.klassen;
            for (const n of Object.keys(ab)) if (new RegExp(k3.mass.rechnung.grund).test(n)) ab[n] = ab[n].map(() => 0);
            const z3 = sollTafelUrteil(t3, q).zeilen.find((x) => x.id === k3.id);
            if (!z3 || z3.urteil !== "GRÜN") v.push(`${k3.id}: eine Wiese ohne Lücke ist nicht GRÜN (${z3 && z3.ist})`);
        }
    }
    if (sollTafelUrteil({ klassen: [] }, q).ok) v.push("die leere Tafel ist grün");
    return v;
}

module.exports = {
    SCHWELLEN,
    SOLL_MASSE,
    KLASSEN_SCHWELLE,
    RAUSCHEN_MAX,
    klassenTeilung,
    bildRauschen,
    klassenMasse,
    rauschBild,
    nyquistNatur,
    sollRechnung,
    sollTafelUrteil,
    sollTafelZeile,
    sollTafelSelbsttest,
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
        `window.__bildMasse = ${bildMasse.toString()};` +
        `window.__klassenTeilung = ${klassenTeilung.toString()};` +
        `window.__bildRauschen = ${bildRauschen.toString()};` +
        `window.__klassenMasse = ${klassenMasse.toString()};`,
};
