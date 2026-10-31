// abnahme-urteil.cjs — DIE ABNAHME-ZEILE (K32, Entscheidung 1110 §2.10 / D3): das EINE Ergebnis-Format, mit dem jedes Beweisbild
// sich selbst prüft — eine Kamera in Laub und Zweigen speichert kein Beweisbild still.
//
// Die Messung (`m`) trägt die Aufnahme selbst (scripts/lib/ausgabe-aufnahme.cjs, `__abnahmeMessen` + `__bildMasse`):
//   stand  { version, sha }            der Stand aus dem LAUFENDEN Spiel (AnazhRealm.VERSION), die SHA setzt der Node-Aufrufer
//   buehne { saison, wetter, uhr, tiereGehalten }
//   geraet { backend, adapter, leinwand }
//   bild   { w, h, mittel, sigma, schwarz, weiss }   Luma der sRGB-Ausgabe (0–255), Anteile
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
// `werkbank bild`), Mittel, σ, Anteil abgesoffen (< 4) und ausgebrannt (> 251).
function bildMasse(u8, W, H) {
    const n = W * H;
    if (!u8 || !n || u8.length < n * 4) return null;
    let s = 0,
        s2 = 0,
        sw = 0,
        ws = 0;
    for (let i = 0; i < n * 4; i += 4) {
        const l = luma709(u8, i);
        s += l;
        s2 += l * l;
        if (l < 4) sw++;
        if (l > 251) ws++;
    }
    const mittel = s / n;
    return {
        w: W,
        h: H,
        mittel: +mittel.toFixed(1),
        sigma: +Math.sqrt(Math.max(0, s2 / n - mittel * mittel)).toFixed(1),
        schwarz: +(sw / n).toFixed(4),
        weiss: +(ws / n).toFixed(4),
    };
}

// PNG lesen (Node, nur zlib) — die Fixture-Bilder der Linse: 8 Bit, RGB oder RGBA, ohne Interlace.
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
// DIE sRGB-KURVE (IEC 61966-2-1), EINE für jede Linse (rein, in der Seite global über ABNAHME_INSTALL): `srgbLin` ein Byte
// 0–255 → linear, `linSrgb` linear → 0–1.
const srgbLin = (u) => (u <= 10.31475 ? u / 3294.6 : ((u / 255 + 0.055) / 1.055) ** 2.4);
const linSrgb = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
// DIE LUMA (Rec. 709) der drei Kanäle ab Index i (ein Byte-Bild oder ein Tripel), EINE für jede Linse (in der Seite global)
const luma709 = (u, i = 0) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
// CIELAB (D65) eines linearen Tripels → [L*, a*, b*], EINE für jede Linse (in der Seite global)
const cielab = (c) => {
    const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
    const [x, y, z] = [[0.4124, 0.3576, 0.1805, 0.95047], [0.2126, 0.7152, 0.0722, 1], [0.0193, 0.1192, 0.9505, 1.08883]].map((w) => f((w[0] * c[0] + w[1] * c[1] + w[2] * c[2]) / w[3]));
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
// DIE KLASSEN-TEILUNG (rein, in der Seite als `__klassenTeilung`): welche Klasse ein Pixel des Ausgabe-Bilds zeichnet, aus
// Schüssen derselben Pose unter EINER Uhr (`__ausgabeAufnahme` unter der Bühne: dieselbe Zeit, dieselbe TRAA-Folge, dieselbe
// Dither-Phase je Schuss; `werkbank bild --klasse`): G die Szene, die gemessenen Klassen ohne Schattenwurf; O_k dieselbe ohne
// die Klasse k. Ein Pixel gehört der Klasse, deren Fehlen es am stärksten ändert (Summe der Kanal-Beträge 0–765), über der
// Schwelle: das Pixel ZEIGT sie — ihr Schatten fehlt in G wie in O_k, eine Wurzel unter dem Boden zeigt in keinem der beiden.
// Ein Misch-Pixel (zwei Klassen über der Schwelle, der Halm vor dem Grund) zählt EINMAL, bei der stärkeren; `misch` zählt sie.
// Die Schwelle hält das GEMESSENE Rauschen: je Aufruf zwei gleiche Schüsse G und G2 (`bildRauschen`), die Tafel bricht über
// RAUSCHEN_MAX.
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

// Die Spiegel-Treue aus den Summen `sp` = [n, 0, 0, ΣW, ΣW, ΣW·r] der Block-Zeilen (`klassenMasse`; in der Seite global): das mit
// W gewogene Mittel der Zeilen-r, null unter 8 Blöcken oder ohne Gewicht.
function spiegelPearson(sp) {
    return sp[0] >= 8 && sp[3] > 1e-9 ? sp[5] / sp[3] : null;
}

// DIE ACHSE DES SPIEGELS (A13, rein, in der Seite global): je Wasser-Pixel (Maske m) das Pixel, das ein idealer Spiegel dort zeigt,
// aus Tiefe (`s.tiefe` NDC-z, `tw` × `th`, ≥ 0,99999 Himmel) und Kamera (`vp`, `ivp`, `auge`) der Aufnahme: jedes andere Pixel über
// y_w (Median der Wasser-Höhe; der Himmel 10⁷ m fern) gespiegelt und projiziert, das nächste Spiegel-Bild gewinnt — die Achse liegt
// am Fuß jeder Gestalt, nie an der Wasser-Kante der Spalte (bis A13 maß dort selbst ein idealer Spiegel 0,16).
// DIE EBENE (material.K4): trägt `s.normale` (Einheits-Vektor, zum Auge), spiegelt die Achse an der Ebene n · P = Median über
// die Maske — die Scheibe eines Fensters wie die Fläche des Sees (ohne sie n = oben, y_w wie bisher).
function spiegelPartner(m, W, H, s) {
    const { tiefe, tw, th, vp: M, ivp: I, auge: C } = s;
    const n = s.normale || [0, 1, 0];
    const P = new Float32Array(W * H * 3),
        ys = [];
    const hoch = (p) => n[0] * P[p * 3] + n[1] * P[p * 3 + 1] + n[2] * P[p * 3 + 2];
    for (let p = 0; p < W * H; p++) {
        const x = p % W,
            y = (p - x) / W;
        const v = [((x + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, tiefe[(((y + 0.5) * th) / H | 0) * tw + (((x + 0.5) * tw) / W | 0)]];
        const w = I[3] * v[0] + I[7] * v[1] + I[11] * v[2] + I[15];
        for (let k = 0; k < 3; k++) P[p * 3 + k] = (I[k] * v[0] + I[k + 4] * v[1] + I[k + 8] * v[2] + I[k + 12]) / w;
        if (v[2] >= 0.99999) for (let k = 0; k < 3; k++) P[p * 3 + k] = C[k] + (P[p * 3 + k] - C[k]) * 1e4;
        if (m[p] === 1) ys.push(hoch(p));
    }
    const yw = ys.sort((a, b) => a - b)[ys.length >> 1];
    const partner = new Int32Array(W * H).fill(-1),
        nah = new Float32Array(W * H).fill(Infinity);
    for (let p = 0; p < W * H; p++) {
        const h = hoch(p),
            q = [0, 1, 2].map((k) => P[p * 3 + k] - 2 * (h - yw) * n[k]),
            w = M[3] * q[0] + M[7] * q[1] + M[11] * q[2] + M[15];
        if (m[p] === 1 || !(h > yw) || !(w > 0)) continue;
        const x = ((((M[0] * q[0] + M[4] * q[1] + M[8] * q[2] + M[12]) / w + 1) / 2) * W) | 0,
            y = (((1 - (M[1] * q[0] + M[5] * q[1] + M[9] * q[2] + M[13]) / w) / 2) * H) | 0,
            z = y * W + x;
        if (x >= 0 && y >= 0 && x < W && y < H && m[z] === 1 && w <= nah[z]) (nah[z] = w), (partner[z] = p);
    }
    return { partner, yw };
}

// DIE TIEFE DER AUFNAHME (A13, `__spiegelDaten` gleich nach dem Schuss): die Szenen-Tiefe samt Wasser (depth24plus kopiert WebGPU
// nie: ein Compute-Gang liest sie in einen Puffer, der danach geht, `_gpuAbschied`) und die Kamera des Schusses.
function spiegelDaten() {
    return (async () => {
        const S = window.THREE.TSL,
            cam = r.state.camera;
        const q = r.state.scenePass.getTextureNode("depth").value,
            [tw, th] = [q.image.width, q.image.height],
            a = S.instancedArray(tw * th, "float"),
            i = S.instanceIndex;
        r.state.renderer.compute(S.Fn(() => a.element(i).assign(S.texture(q).load(S.ivec2(S.int(i.mod(tw)), S.int(i.div(tw)))).r))().compute(tw * th));
        const tiefe = new Float32Array(await r.state.renderer.getArrayBufferAsync(a.value));
        r._gpuAbschied(a.value);
        cam.updateMatrixWorld(true);
        const vp = new window.THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
        const auge = new window.THREE.Vector3().setFromMatrixPosition(cam.matrixWorld).toArray();
        return { tiefe, tw, th, vp: vp.elements, ivp: vp.clone().invert().elements, auge };
    })();
}

// DAS URTEIL DER ARMLÄNGE (material.K2 Staffel 1, `werkbank bild --arm` → `klasse.urteil`): POSE — die Klasse steht im Ausgabe-Bild und
// die Tiefe der Bildmitte trägt die Armlänge (≤ 1,5 × Soll + 0,1 m); MIKRO — je Teil-Klasse nyquist ≥ 0,15 und glatte Blöcke ≤ 10 %.
// Rückgabe: die Befunde beim Namen, leer = grün.
const armUrteil = ({ ausdruck: x, arm: a, klassen: k }) =>
    (Object.keys(k).length && a.ist > 0 && a.ist <= 1.5 * a.soll + 0.1 ? [] : [`POSE ${x}: ${Object.keys(k).length} im Bild, Mitte ${a.ist} m`]).concat(
        Object.entries(k).filter(([, m]) => !(m.nyquist >= 0.15 && m.glatt <= 0.1)).map(([n, m]) => `MIKRO ${n}: nyquist ${m.nyquist} glatt ${m.glatt}`)
    );

// DIE KLASSEN-MASSE (rein, in der Seite als `__klassenMasse`): was das Bild F auf den Pixeln der Maske m zeigt (Luma = Rec. 709
// auf den sRGB-Werten 0–255, wie `bildMasse`):
//   luma          Mittel der Luma auf der Klasse (deckung, kontrast, nyquist, silhouette, deckungUnten fielen mit A13: kein Leser)
//   glatt/nyquist/beta  das Mikro-Detail je 8×8-Block (s. DAS MIKRO-DETAIL unten)
//   weiss/wt      Anteil und Zahl der Pixel, die als Weiß lesen statt als Farbe (s. MILCHWEISS unten)
//   kante/kr      die Geradheit des Umrisses gegen das Außen (s. DIE KANTE DER SILHOUETTE unten) und die Zahl seiner Pixel
function klassenMasse(F, m, W, H, aussen, ohne, spiegel) {
    const L = new Float32Array(W * H);
    for (let p = 0; p < W * H; p++) L[p] = luma709(F, p * 4);
    let n = 0,
        s = 0;
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
            const p = y * W + x;
            if (m[p] !== 1) continue;
            n++;
            s += L[p];
        }
    // ZWEITON (K63-n2, das Dither-Raster): je Fenster 8×8 (Schritt 4), in dem die Klasse ≥ ¼ der Pixel trägt, das BILD (nicht
    // die Maske — ein Raster über dem Himmel zeigt die Klasse nur auf jedem zweiten Pixel): Kontrast p90 − p10 ≥ 40, höchstens
    // 20 % Zwischentöne (|L − Mitte| < ¼ Kontrast) und Wechsel über die Mitte in BEIDEN Achsen an ≥ 30 % der Nachbar-Paare →
    // die Klassen-Pixel des Fensters sind Raster. Eine Kante wechselt einmal je Zeile, ein Halm nur quer, eine aufgelöste
    // Alpha-Kante trägt Zwischentöne; ein Muster aus zwei Tönen im Pixel-Takt ist das sichtbare Dither (Prüfer K63 R2).
    const zmark = new Uint8Array(W * H);
    const zw = new Float32Array(64);
    for (let y0 = 0; y0 + 8 <= H; y0 += 4)
        for (let x0 = 0; x0 + 8 <= W; x0 += 4) {
            let c = 0;
            for (let j = 0; j < 8; j++)
                for (let i = 0; i < 8; i++) {
                    const p = (y0 + j) * W + x0 + i;
                    if (m[p] === 1) c++;
                    zw[j * 8 + i] = L[p];
                }
            if (c < 16) continue;
            const so = zw.slice().sort();
            const lo = so[6],
                hi = so[57],
                kz = hi - lo;
            if (kz < 40) continue;
            const mid = (lo + hi) / 2;
            let zz = 0,
                tx = 0,
                ty = 0;
            for (let j = 0; j < 8; j++)
                for (let i = 0; i < 8; i++) {
                    const w0 = zw[j * 8 + i];
                    if (Math.abs(w0 - mid) < 0.25 * kz) zz++;
                    if (i < 7 && w0 > mid !== zw[j * 8 + i + 1] > mid) tx++;
                    if (j < 7 && w0 > mid !== zw[(j + 1) * 8 + i] > mid) ty++;
                }
            if (tx / 56 >= 0.3 && ty / 56 >= 0.3 && zz / 64 <= 0.2)
                for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) zmark[(y0 + j) * W + x0 + i] = 1;
        }
    let zt = 0;
    for (let p = 0; p < W * H; p++) if (m[p] === 1 && zmark[p]) zt++;
    // MILCHWEISS (K63-n4, die weiße Tafel): ein Pixel, das als Weiß liest statt als Farbe — ausgebrannt (Y > 240) oder unbunt
    // und hell (CIELAB D65 aus den linearisierten sRGB-Werten: C*ab < 5, zwei eben merkliche Unterschiede ΔE*ab 2,3 vom Grau,
    // Mahy et al. 1994; L* ≥ 50, heller als die 18-%-Karte)
    // DIE BUNTHEIT (D8, `oeffnungBunt`): je Pixel der Klasse C*ab im selben CIELAB — ihr Mittel `bunt` (ein Ziel in der Öffnung
    // trägt Farbe, Milch, Nebel und Grau lesen ≈ 0)
    // DIE MILCH DES FILMS (D8): trägt der Aufruf das Bild derselben Pose OHNE den Film (`ohne`, die Membran zeigt nur ihr Ziel —
    // `__membranOhneFilm`), zählt ein Pixel nur, wenn es weiß liest UND sein Ziel nicht: Milch ist, was der Film dem Ziel
    // hinzufügt; ein blasses Ziel (der helle Grund des Fachwerk-Studios) ist das Ziel, nicht Milch (`wtZiel` zählt es). Dieselbe
    // Regel liest beide Bilder.
    let wt = 0,
        wtZiel = 0,
        cs = 0;
    let cab = 0;
    const weissIn = (U, p) => {
        const [L, a, b] = cielab([0, 1, 2].map((k) => srgbLin(U[p * 4 + k])));
        cab = Math.hypot(a, b);
        if (luma709(U, p * 4) > 240) return true;
        return L >= 50 && cab < 5;
    };
    for (let p = 0; p < W * H; p++) {
        if (m[p] !== 1) continue;
        const w = weissIn(F, p);
        cs += cab;
        if (!w) continue;
        if (ohne && weissIn(ohne, p)) wtZiel++;
        else wt++;
    }
    // DIE KANTE DER SILHOUETTE: je Rand-Pixel der Klasse,
    // das ans Außen grenzt (`aussen`: kein gemessener Teil — Himmel, Boden, Holz; ohne `aussen` jedes Pixel außerhalb der
    // Klasse), die Kohärenz des Struktur-Tensors der geglätteten Maske (Gauß σ 2 px, Fenster 17 × 17 px):
    // ((Jxx − Jyy)² + 4 Jxy²) / (Jxx + Jyy)² — die gerade Kante einer Karte → 1, ein Umriss aus Blättern, Zweigen und Lücken
    // → klein. `kante` ist das Mittel über den Rand, `kr` die Zahl seiner Pixel (die Tafel fasst Teil-Klassen über sie).
    // DER STRICH IM INNEREN (haar.K1/K2, Fell und Haar): derselbe Tensor auf der LUMA des Bilds, je Pixel, dessen Fenster ganz
    // in der Klasse liegt — Σ √((Jxx − Jyy)² + 4 Jxy²) / Σ (Jxx + Jyy), die Kohärenz nach der Energie gewogen: Strähnen und
    // Fell-Strich, die gleich laufen → groß, eine glatte Schale oder Rauschen → klein (die Fläche trägt keine Energie).
    // `strich` dieses Mittel, `si` die Zahl der inneren Pixel.
    let kr = 0,
        ks = 0,
        si = 0,
        sz = 0,
        sn = 0;
    {
        const sig = 2,
            R = 6,
            r = 8,
            pad = R + r + 2;
        let bx0 = W,
            by0 = H,
            bx1 = -1,
            by1 = -1;
        for (let y = 0; y < H; y++)
            for (let x = 0; x < W; x++)
                if (m[y * W + x] === 1) {
                    if (x < bx0) bx0 = x;
                    if (x > bx1) bx1 = x;
                    if (y < by0) by0 = y;
                    if (y > by1) by1 = y;
                }
        if (bx1 >= 0) {
            const x0 = Math.max(0, bx0 - pad),
                y0 = Math.max(0, by0 - pad),
                w = Math.min(W - 1, bx1 + pad) - x0 + 1,
                h = Math.min(H - 1, by1 + pad) - y0 + 1;
            const gk = [];
            let gs = 0;
            for (let i = -R; i <= R; i++) {
                gk.push(Math.exp((-i * i) / (2 * sig * sig)));
                gs += gk[i + R];
            }
            for (let i = 0; i < gk.length; i++) gk[i] /= gs;
            const t = new Float32Array(w * h),
                sm = new Float32Array(w * h),
                lu = new Float32Array(w * h),
                w1 = w + 1;
            for (let y = 0; y < h; y++)
                for (let x = 0; x < w; x++) {
                    let a = 0;
                    for (let i = -R; i <= R; i++) {
                        const xx = Math.min(w - 1, Math.max(0, x + i));
                        a += gk[i + R] * (m[(y0 + y) * W + x0 + xx] === 1 ? 1 : 0);
                    }
                    t[y * w + x] = a;
                    lu[y * w + x] = L[(y0 + y) * W + x0 + x];
                }
            for (let y = 0; y < h; y++)
                for (let x = 0; x < w; x++) {
                    let a = 0;
                    for (let i = -R; i <= R; i++) a += gk[i + R] * t[Math.min(h - 1, Math.max(0, y + i)) * w + x];
                    sm[y * w + x] = a;
                }
            // DER TENSOR eines Felds f (w × h): die Summen-Tafeln seiner Teile gx², gy², gx·gy und der Maske (das Fenster in O(1));
            // `J(x, y)` → [Jxx, Jyy, Jxy, Pixel der Klasse] im Fenster 17 × 17 um das Pixel
            const tensor = (f) => {
                const S = [0, 1, 2, 3].map(() => new Float64Array(w1 * (h + 1))),
                    J = new Float64Array(4);
                for (let y = 0; y < h; y++)
                    for (let x = 0; x < w; x++) {
                        const p = y * w + x,
                            q = (y + 1) * w1 + x + 1;
                        J[0] = x > 0 && x < w - 1 ? (f[p + 1] - f[p - 1]) / 2 : 0;
                        J[1] = y > 0 && y < h - 1 ? (f[p + w] - f[p - w]) / 2 : 0;
                        [J[2], J[3]] = [J[0] * J[1], m[(y0 + y) * W + x0 + x] === 1 ? 1 : 0];
                        [J[0], J[1]] = [J[0] * J[0], J[1] * J[1]];
                        for (let k = 0; k < 4; k++) S[k][q] = J[k] + S[k][q - 1] + S[k][q - w1] - S[k][q - w1 - 1];
                    }
                return (x, y) => {
                    const a0 = Math.max(0, x - r),
                        a1 = Math.min(w - 1, x + r),
                        b0 = Math.max(0, y - r),
                        b1 = Math.min(h - 1, y + r);
                    for (let k = 0; k < 4; k++)
                        J[k] = S[k][(b1 + 1) * w1 + a1 + 1] - S[k][b0 * w1 + a1 + 1] - S[k][(b1 + 1) * w1 + a0] + S[k][b0 * w1 + a0];
                    return J;
                };
            };
            const Jm = tensor(sm),
                Jl = tensor(lu);
            const aus = (x, y) =>
                x >= 0 && y >= 0 && x < W && y < H && m[y * W + x] !== 1 && (!aussen || aussen[y * W + x] === 1);
            for (let y = Math.max(1, by0); y <= Math.min(H - 2, by1); y++)
                for (let x = Math.max(1, bx0); x <= Math.min(W - 2, bx1); x++) {
                    if (m[y * W + x] !== 1) continue;
                    const [lx, ly] = [x - x0, y - y0];
                    const [lxx, lyy, lxy, n2] = Jl(lx, ly);
                    if (n2 === (2 * r + 1) ** 2 && lxx + lyy > 1e-12)
                        [si, sz, sn] = [si + 1, sz + Math.sqrt((lxx - lyy) ** 2 + 4 * lxy * lxy), sn + lxx + lyy];
                    if (!(aus(x - 1, y) || aus(x + 1, y) || aus(x, y - 1) || aus(x, y + 1))) continue;
                    const [jxx, jyy, jxy] = Jm(lx, ly);
                    const tr = jxx + jyy;
                    if (!(tr > 1e-12)) continue;
                    kr++;
                    ks += ((jxx - jyy) * (jxx - jyy) + 4 * jxy * jxy) / (tr * tr);
                }
        }
    }
    // DIE SPIEGEL-TREUE (D10, Nordstern §4.1): je 8×8-Block ganz im Wasser das Luma-Mittel gegen das seiner Partner (`spiegelPartner`
    // aus der Tiefe der Aufnahme `spiegel`; ein Block zählt mit der Hälfte seiner Pixel), Pearson r JE BLOCK-ZEILE mit dem Gewicht
    // Σb² (`sp`): Fresnel und Himmels-Verlauf hängen an der Zeile, der Spiegel steht längs ihr. Ohne Tiefe null; `spiegelEbene` = y_w.
    const sa = spiegel ? spiegelPartner(m, W, H, spiegel) : null,
        pa = sa && sa.partner;
    const sp = [0, 0, 0, 0, 0, 0];
    for (let y0 = 0; pa && y0 + 8 <= H; y0 += 8) {
        const z = [0, 0, 0, 0, 0, 0]; // die Block-Mittel der Zeile: n, Σa, Σb, Σa², Σb², Σab
        bloecke: for (let x0 = 0; x0 + 8 <= W; x0 += 8) {
            let [a, b, k] = [0, 0, 0];
            for (let j = 0; j < 8; j++)
                for (let i = 0, p = (y0 + j) * W + x0; i < 8; i++, p++) {
                    if (m[p] !== 1) continue bloecke;
                    if (pa[p] >= 0) [a, b, k] = [a + L[p], b + L[pa[p]], k + 1];
                }
            if (k >= 32) [1, a / k, b / k, (a / k) ** 2, (b / k) ** 2, (a * b) / (k * k)].forEach((v, i) => (z[i] += v));
        }
        // die Zeile zählt mit dem, was ihre Partner zu spiegeln haben (Σb²): ein glatter Himmel als Partner wiegt nichts,
        // ein Wald voll; ihr r ist frei von der Stärke des Spiegels (Fresnel), ein Wasser ohne Struktur vor Struktur 0
        const [xx, yy, xy] = [z[3] - (z[1] * z[1]) / z[0], z[4] - (z[2] * z[2]) / z[0], z[5] - (z[1] * z[2]) / z[0]];
        if (!(z[0] >= 2 && yy > 1e-6)) continue;
        [sp[0], sp[3], sp[4]] = [sp[0] + z[0], sp[3] + yy, sp[4] + yy];
        if (xx > 1e-6) sp[5] += yy * (xy / Math.sqrt(xx * yy));
    }
    const mittel = n ? s / n : null;
    // DAS MIKRO-DETAIL (material.K2, `werkbank bild --arm`) je 8×8-Block ganz in der Klasse: `glatt` der Anteil mit Luma-σ < 4;
    // `nyquist` der Anteil der Schachbrett-Energie an der Gradient-Energie seiner 2×2-Zellen (k = (a−b−c+d)/4 gegen gx, gy: ein
    // Pixel-Raster 1, weißes Rauschen 1/3, eine glatte Fläche 0); `beta` die Steigung des Leistungsspektrums P ∝ f^−β aus der
    // Mittel-Pyramide (Band-Energie je Oktave ∝ f^(2−β): β = 2 + halbe Steigung von log2 E über die Stufen 0 … 2, Rauschen 0).
    const mk = [0, 0, 0, 0, 0, 0, 0]; // Blöcke, glatte, Σk², Σ(gx² + gy²), E je Stufe 0 … 2
    for (let y0 = 0; y0 + 8 <= H; y0 += 8)
        for (let x0 = 0; x0 + 8 <= W; x0 += 8) {
            let voll = true;
            const B = new Float32Array(64);
            for (let i = 0; i < 64 && voll; i++) {
                const p = (y0 + (i >> 3)) * W + x0 + (i & 7);
                voll = m[p] === 1;
                B[i] = L[p];
            }
            if (!voll) continue;
            const mb = B.reduce((a, b) => a + b, 0) / 64;
            mk[0]++;
            if (Math.sqrt(B.reduce((a, b) => a + (b - mb) * (b - mb), 0) / 64) < 4) mk[1]++;
            for (let st = 0, q = 8, P = B; st < 3; st++, q >>= 1) {
                const Q = new Float32Array((q * q) / 4);
                for (let i = 0; i < Q.length; i++) {
                    const o = 2 * (i % (q / 2)) + 2 * q * Math.floor(i / (q / 2));
                    const [a, b, c, d] = [P[o], P[o + 1], P[o + q], P[o + q + 1]];
                    const [kk, eg] = [((a - b - c + d) / 4) ** 2, ((a - b + c - d) / 4) ** 2 + ((a + b - c - d) / 4) ** 2];
                    if (st === 0) (mk[2] += kk), (mk[3] += eg);
                    mk[4 + st] += (kk + eg) / Q.length;
                    Q[i] = (a + b + c + d) / 4;
                }
                P = Q;
            }
        }
    const r4 = (x) => (x == null || !Number.isFinite(x) ? null : +x.toFixed(4));
    return {
        spiegelTreue: r4(spiegelPearson(sp)),
        spiegelEbene: sa && sa.yw != null ? +sa.yw.toFixed(3) : null,
        sp: sp.map((v, i) => (i ? +v.toFixed(2) : v)),
        zweiton: n ? r4(zt / n) : null,
        weiss: n ? r4(wt / n) : null,
        wt,
        wtZiel: ohne ? wtZiel : null,
        bunt: n ? +(cs / n).toFixed(2) : null,
        pixel: n,
        luma: mittel == null ? null : +mittel.toFixed(2),
        kante: kr ? r4(ks / kr) : null,
        kr,
        strich: sn > 0 ? r4(sz / sn) : null,
        si,
        bloecke: mk[0],
        glatt: mk[0] ? r4(mk[1] / mk[0]) : null,
        nyquist: mk[2] + mk[3] > 0 ? r4(mk[2] / (mk[2] + mk[3])) : null,
        beta: mk[4] > 0 && mk[6] > 0 ? r4(2 + Math.log2(mk[6] / mk[4]) / 2) : null,
    };
}

// DAS GESICHT IM BILD (rein, in der Seite als `__gesichtMasse`; K63-n2, `werkbank bild --gesicht`): die Züge, die KOPF_SOLL
// nennt, wie die AUSGABE sie zeigt (Prüfer K63 R2: Augen, Mund und Haar-Fleck maß nichts). `proben` sind die Vertices des Kopfs,
// projiziert: { z: iris|lippe|hoehle|haut|kappe, x, y, k (Teil der Teilung + 1), vorn, kalotte }; eine Probe ist SICHTBAR, wenn
// die Teilung an ihrem Pixel ihren eigenen Teil zeigt. Farben in CIELAB (D65) aus dem Mittel der linearisierten sRGB-Pixel (je
// Pixel einmal):
//   augeFrei     sichtbare vordere Iris-Proben / vordere Iris-Proben (Lider und Haut davor verdecken)
//   lippeL/A     ΔL*, Δa* der sichtbaren Lippe gegen die Wange (sichtbare Haut-Proben zwischen Augen- und Mund-Zeile, ohne
//                ihre Ränder) · hoehleL/A dasselbe für die Augenhöhle
//   haarDeckung  Anteil der vorderen Kalotten-Proben (über der Haarlinie KOPF_SOLL haarLinie), die als Haar lesen: dort zeigt
//                die Teilung eine Strähne (`haarK`), oder die Haut zeigt einen Ton näher am Haar als an der Wange
function gesichtMasse(F, teil, W, H, proben, haarK) {
    const lab = cielab;
    const px = (x, y) => y * W + x;
    const sicht = (p) => teil[px(p.x, p.y)] === p.k;
    const farbMittel = (liste) => {
        const seen = new Set(),
            c = [0, 0, 0];
        for (const p of liste) {
            const i = px(p.x, p.y);
            if (seen.has(i)) continue;
            seen.add(i);
            for (let ch = 0; ch < 3; ch++) c[ch] += srgbLin(F[i * 4 + ch]);
        }
        return seen.size ? { lab: lab(c.map((v) => v / seen.size)), n: seen.size } : null;
    };
    const von = (z, f) => proben.filter((p) => p.z === z && (!f || f(p)));
    const r = (x, d) => (x == null || !Number.isFinite(x) ? null : +x.toFixed(d));
    const irisV = von("iris", (p) => p.vorn);
    const irisS = irisV.filter(sicht);
    const mittelY = (l) => (l.length ? l.reduce((a, p) => a + p.y, 0) / l.length : null);
    const yAuge = mittelY(irisV),
        lippeS = von("lippe", sicht),
        yMund = mittelY(von("lippe", (p) => p.vorn));
    let wange = null;
    if (yAuge != null && yMund != null && yMund > yAuge) {
        const a = yAuge + 0.15 * (yMund - yAuge),
            b = yMund - 0.15 * (yMund - yAuge);
        wange = farbMittel(von("haut", (p) => p.vorn && sicht(p) && p.y >= a && p.y <= b));
    }
    const lippe = farbMittel(lippeS),
        hoehle = farbMittel(von("hoehle", sicht));
    const hk = new Set(haarK || []);
    const haarPx = [];
    for (let i = 0; i < W * H; i++) if (hk.has(teil[i])) haarPx.push({ x: i % W, y: Math.floor(i / W) });
    const haar = farbMittel(haarPx.length ? haarPx : von("kappe", sicht));
    let haarDeckung = null,
        kal = 0;
    if (wange && haar) {
        let h = 0;
        const d2 = (u, v) => (u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2 + (u[2] - v[2]) ** 2;
        for (const p of proben) {
            if (!p.kalotte || !p.vorn) continue;
            const t = teil[px(p.x, p.y)];
            if (hk.has(t)) {
                kal++;
                h++;
            } else if (t === p.k) {
                kal++;
                const i = px(p.x, p.y);
                const c = lab([srgbLin(F[i * 4]), srgbLin(F[i * 4 + 1]), srgbLin(F[i * 4 + 2])]);
                if (d2(c, haar.lab) < d2(c, wange.lab)) h++;
            }
        }
        haarDeckung = kal ? h / kal : null;
    }
    const d = (a, b, ch) => (a && b ? r(a.lab[ch] - b.lab[ch], 2) : null);
    return {
        augeFrei: irisV.length ? r(irisS.length / irisV.length, 3) : null,
        lippeL: d(lippe, wange, 0),
        lippeA: d(lippe, wange, 1),
        hoehleL: d(hoehle, wange, 0),
        hoehleA: d(hoehle, wange, 1),
        haarDeckung: r(haarDeckung, 3),
        proben: {
            iris: irisV.length,
            irisSicht: irisS.length,
            lippe: lippeS.length,
            wange: wange ? wange.n : 0,
            kalotte: kal,
            haarPixel: haarPx.length,
        },
        zeilen: { auge: r(yAuge, 1), mund: r(yMund, 1) },
    };
}

// DIE FARBTON-STREUUNG DER WIESE (W1; Spike 789af722): die Probe ist der 2 × 2-Block ab Byte i der Ausgabe (Breite W), sein
// Flächen-Mittel in linearem Licht nach CIELAB D65; die Kachel k = [Proben, Σcos h, Σsin h, bunte Proben] zählt den Farbton
// h = atan2(b*, a*) der Proben mit Buntheit C* > 5. Rein (läuft auch in der Seite, ABNAHME_INSTALL).
function farbtonProbe(k, u8, i, W) {
    const [r, g, b] = [0, 1, 2].map((c) => [0, 4, 4 * W, 4 * W + 4].reduce((a, d) => a + srgbLin(u8[i + d + c]) / 4, 0));
    const [, A, B] = cielab([r, g, b]),
        C = Math.hypot(A, B);
    k[0]++;
    if (C > 5) [k[1], k[2], k[3]] = [k[1] + A / C, k[2] + B / C, k[3] + 1];
    return k;
}
// σh einer Kachel in Grad: die zirkuläre Standard-Abweichung sqrt(−2 ln R)
const farbtonSigma = (k) =>
    (Math.sqrt(-2 * Math.log(Math.max(1e-9, Math.min(1, k[3] ? Math.hypot(k[1], k[2]) / k[3] : 1)))) * 180) / Math.PI;
// DIE RECHNUNGEN der Soll-Bänder (rein): ein Band, das die Tafel „[gerechnet]" nennt, rechnet DIESE Funktion — die Tafel trägt
// dann nur die Rechnung, nie ihr Ergebnis (Prüfer K63 R1: das Laub-Band [0,11; 0,16] stand ohne Skript im Baum, nachgerechnet
// 0,16–0,22).
//   einsDurch  { von: [a, b] }     das Band [1/b, 1/a] (Licht: E gesamt / E Himmel aus dem Diffus-Anteil des klaren Himmels)
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
function sollRechnung(r) {
    if (!r || typeof r !== "object") return { fehler: "keine Rechnung" };
    const paar = (x) => Array.isArray(x) && x.length === 2 && x.every((v) => typeof v === "number" && v > 0);
    if (r.art === "einsDurch") {
        if (!paar(r.von)) return { fehler: "einsDurch ohne von [a, b] > 0" };
        return { band: [+(1 / r.von[1]).toFixed(4), +(1 / r.von[0]).toFixed(4)] };
    }
    // zweiton1f { beta: [b0, b1] } (b0 ≥ 0, weißes Rauschen eingeschlossen): die obere Grenze [−∞, max] des Zweiton-Anteils in
    // Bildern ohne Muster, je β in Schritten von 0,4. Unschärfe der Kamera fügt nur Zwischentöne hinzu, Rauschen reicht bis β 0
    // — das Band gilt darum für JEDE Kamera (Prüfer K63 R2: das nyquist-Band aus Bildern ohne Unschärfe ließ das Raster grün).
    if (r.art === "zweiton1f") {
        const b = r.beta;
        if (!(Array.isArray(b) && b.length === 2 && b[0] >= 0 && b[1] >= b[0]))
            return { fehler: "zweiton1f ohne beta [b0 ≥ 0, b1 ≥ b0]" };
        let max = 0;
        for (let x = b[0]; x <= b[1] + 1e-9; x += 0.4) max = Math.max(max, zweitonNatur(+x.toFixed(2)));
        return { band: [null, max] };
    }
    // ref { bild, mass, rand } (haar.K1/K2): das Maß der REF (ein Foto unter spec/, Herkunft in der Quelle), mit derselben
    // Funktion über das ganze Bild gemessen — das Band ist [REF × (1 − rand), REF × (1 + rand)]; die Tafel trägt nie die Zahl
    if (r.art === "ref") {
        const fs = require("fs"),
            pfad = require("path").join(__dirname, "..", "..", String(r.bild));
        const b = /^spec\/[\w\-/]+\.png$/.test(r.bild) && fs.existsSync(pfad) ? pngLesen(fs.readFileSync(pfad)) : null,
            x = b ? klassenMasse(b.u8, new Uint8Array(b.W * b.H).fill(1), b.W, b.H)[r.mass] : null;
        if (!(x > 0 && r.rand > 0 && r.rand < 1)) return { fehler: `ref: ${r.bild} liest ${r.mass} ${x} (rand ${r.rand})` };
        return { band: [1 - r.rand, 1 + r.rand].map((v) => +(x * v).toFixed(4)) };
    }
    return { fehler: `Rechnung „${r.art}" unbekannt (einsDurch, zweiton1f, ref)` };
}
const ZWEITON_NATUR = new Map();
function zweitonNatur(beta) {
    if (ZWEITON_NATUR.has(beta)) return ZWEITON_NATUR.get(beta);
    const n = 128,
        voll = new Uint8Array(n * n).fill(1);
    let s = 0;
    for (let saat = 1; saat <= 4; saat++) s += klassenMasse(rauschBild(n, beta, 7919 * saat), voll, n, n).zweiton;
    ZWEITON_NATUR.set(beta, +(s / 4).toFixed(4));
    return ZWEITON_NATUR.get(beta);
}

// DIE SCHÜSSE DER APERTUR (K63-n4; D8: geteilt von milchweiss · oeffnungBunt · zielTreue): je Stufe ein Schuss (`messung.L<n>`, die
// Tore des Schusses in ihrer Stufe beim Namen, `rechnung.tor`), die Stufen liest die Linse im Kern (`rechnung.stufen`: porta-core
// PORTAL_RENDER_CONFIG lod.kindStages.gate ab der Stufe `ab`) — eine Stufe ohne Schuss lässt das Maß offen (ROT), ein Schuss, der
// seine Tore in einer anderen Stufe zeigt, ist ein Bruch. Rückgabe { schuesse: [{ s, m, ap: [[name, klasse]…] }], anteil,
// bloecke, offen } oder { fehler }; der Bildanteil ist der Schuss mit der größten Apertur.
function aperturSchuesse(ma, q) {
    const me = ma.messung || {},
        rc = ma.rechnung || {};
    if (!(rc.apertur && rc.tor && rc.stufen)) return { fehler: `${ma.name} ohne rechnung { apertur, tor, stufen }` };
    const apRe = new RegExp(rc.apertur),
        tor = new RegExp(rc.tor);
    const sv = rc.stufen;
    const K0 = q && q.kern ? q.kern(sv.datei, sv.symbol) : undefined;
    const pfad = (p) => {
        let v = K0;
        for (const f of String(p || "").split(".").filter(Boolean)) v = v == null ? v : v[f];
        return v;
    };
    const S = pfad(sv.feld);
    if (!Array.isArray(S) || !S.length)
        return { fehler: `die Stufen ${sv.datei} ${sv.symbol}.${sv.feld} sind dort nicht definiert` };
    // DIE NUR-WURF-STUFE (Studio-Vertrag B2c `lod.budget[kind][s].nurWurf`, der Wirt `_foundryDeclaredStage`): sie wird nie als
    // Mesh gezeigt — ihr Bild ist die Fernform jenseits der Mesh-Zone (der Spieler jenseits des Cull-Radius, die Membran wach).
    // Ihr Schuss zeigt darum KEIN Tor in einer Mesh-Stufe, aber die Apertur; das Budget liest die Linse im selben Kern.
    const B = sv.budget ? pfad(sv.budget) : null;
    if (sv.budget && (!B || typeof B !== "object"))
        return { fehler: `das Budget ${sv.datei} ${sv.symbol}.${sv.budget} ist dort nicht definiert` };
    const nurWurf = (s) => !!(B && B[s] && B[s].nurWurf === true);
    // DIE ZELLE AM SPAWN (`mass.zelle`, Pflicht A: Sicht × Abstand × Uhr an `_genesisMitte`, die Station zug/a-spawn.sh im Zweig
    // koordination) urteilt über die Stufe, die ihr Schuss zeigt — die ganze Stufen-Kette trägt die Zeile
    const soll = ma.zelle ? [] : S.filter((s) => s >= (sv.ab || 0));
    const namen = Object.keys(me).filter((k) => /^L\d$/.test(k));
    if (!namen.length) return { fehler: `${ma.name} ohne Schuss je Stufe (messung.L<n>)` };
    let anteil = 0;
    const schuesse = [];
    for (const s of namen.sort()) {
        const m = me[s];
        const f = bildMessungFehler(m);
        if (f) return { fehler: `${s}: ${f}` };
        const je = {};
        for (const [n, k] of Object.entries(m.klassen)) {
            const t = tor.exec(n);
            if (t && k.pixel >= 50) je[t[t.length - 1]] = (je[t[t.length - 1]] || 0) + k.pixel;
        }
        const st = Object.entries(je).sort((a, b) => b[1] - a[1])[0];
        if (nurWurf(+s.slice(1))) {
            if (st)
                return {
                    fehler: `${s}: der Schuss zeigt die Tore in Stufe L${st[0]} — die Stufe ${s} (nurWurf) zeigt nur die Fernform`,
                };
        } else {
            if (!st) return { fehler: `${s}: der Schuss zeigt kein Tor mit Stufe im Namen (${rc.tor})` };
            if (`L${st[0]}` !== s) return { fehler: `${s}: der Schuss zeigt die Tore in Stufe L${st[0]}` };
        }
        const ap = Object.entries(m.klassen).filter(([n]) => apRe.test(n));
        const pa = ap.reduce((a, [, k]) => a + k.pixel, 0);
        if (pa < 50)
            return { fehler: `${s}: der Schuss zeigt keine Apertur (${pa} Pixel — die Membran schläft jenseits ihrer Sicht?)` };
        anteil = Math.max(anteil, pa / flaeche(m));
        schuesse.push({ s, m, ap });
    }
    const fehlt = soll.filter((s) => !namen.includes(`L${s}`));
    return {
        schuesse,
        anteil,
        bloecke: schuesse.map((x) => x.m),
        offen: fehlt.length
            ? `Stufe ${fehlt.map((s) => "L" + s).join(", ")} ohne Schuss (${sv.datei} ${sv.feld} = [${S.join(", ")}])`
            : null,
    };
}

// DIE MASSE der Tafel (rein): je Maß-Name die Rechnung, die das Ist aus seiner Rohdatei LIEST — der Messung, die das Werkzeug in
// die Tafel schreibt (`mass.messung`, `werkbank bild --klasse … --ist <id>` bzw. `werkbank licht --ist <id>`), oder der Zeile
// einer anderen Tafel (`mass.rohdatei`: die Albedo-Tafel). Ein Ist von Hand gibt es nicht. Rückgabe { ist, taeter, anteil,
// teile, fehler }.
// DIE AUFLÖSUNG je Maß (ihre Schlüssel sind die Maße der Tafel): der kleinste Unterschied, den es trägt — der Abstand zum Band ist |ln((Ist + e)/(Rand + e))|,
// endlich auch an einem Rand 0 (ein Raster-Anteil Soll 0, ein Ist 0; Prüfer K63 R2: Ist 0 gab die Wirkung „Infinity").
const MASS_AUFLOESUNG = Object.freeze({
    laiWirk: 0.05,
    farbtonStreuung: 0.1,
    zweiton: 0.01,
    kante: 0.01,
    strich: 0.01,
    milchweiss: 0.01,
    oeffnungBunt: 0.5,
    zielTreue: 0.02,
    lichtVerhaeltnis: 0.05,
    schattenAnteil: 0.005,
    umgebungAzimut: 0.02,
    albedoVerhaeltnis: 0.01,
    albedo: 0.005,
    gesicht: 0.05,
    // die Spiegel-Treue ist ein r in [−1, 1]: der Versatz 1 trägt den Abstand auch für ein negatives r (ln über (0, 2])
    spiegelTreue: 1,
});
// DER ORT EINES BILDS der Tafel: relativ zur
// Wurzel des Baums unter `artifacts/` (gitignored, lokal, beim Namen — der Schreiber legt es nach `artifacts/soll-tafel/`), nie
// absolut, nie mit `..`, nie mit Backslash.
function bildPfadFehler(p) {
    if (typeof p !== "string" || !/^artifacts\/[\w\-./]+\.png$/.test(p) || /(^|\/)\.\.?\//.test(p))
        return `das Bild „${p}" liegt nicht unter artifacts/ (relativ zur Wurzel, ohne ..)`;
    return null;
}
// Die Messung eines Bilds: vom Werkzeug geschrieben, Stand · Gerät · Leinwand, ihr Rauschen unter der Wand.
function bildMessungFehler(me) {
    if (!me || typeof me !== "object") return "keine Messung";
    if (me.werkzeug !== "bild") return `die Messung stammt nicht aus \`werkbank bild\` (${me.werkzeug})`;
    for (const f of ["datum", "stand", "geraet", "leinwand", "klassen", "rauschen", "schwelle"])
        if (me[f] == null) return `die Messung ohne ${f}`;
    if (me.bild != null && bildPfadFehler(me.bild)) return bildPfadFehler(me.bild);
    if (!(me.rauschen.anteil <= RAUSCHEN_MAX))
        return `die Teilung hält ihr Rauschen nicht: ${me.rauschen.anteil} der Pixel zweier gleicher Schüsse über der Schwelle ${me.schwelle} (Wand ${RAUSCHEN_MAX})`;
    if (!Object.keys(me.klassen).length) return "die Messung zeigt keine Klasse";
    return null;
}
const pixelSumme = (me, re) =>
    Object.entries(me.klassen).reduce((a, [n, k]) => a + (!re || re.test(n) ? k.pixel || 0 : 0), 0);
const flaeche = (me) => me.leinwand[0] * me.leinwand[1];
// DAS MITTEL ÜBER DIE APERTUR (D8: milchweiss · oeffnungBunt · zielTreue): je Schuss × Klasse der Stufen-Schüsse
// (`aperturSchuesse`) `je(k, s, n)` → { fehler } oder [Zähler, Gewicht, Teil, Rang, Täter]; das Ist Σ Zähler / Σ Gewicht auf
// `stellen` Stellen, der Täter Schuss × Klasse mit dem größten Rang.
function aperturMittel(ma, q, stellen, je) {
    const A = aperturSchuesse(ma, q);
    if (A.fehler) return A;
    let z = 0,
        g = 0,
        arg = null;
    const teile = [];
    for (const { s, ap } of A.schuesse)
        for (const [n, k] of ap) {
            const x = je(k, s, n);
            if (x.fehler) return x;
            [z, g] = [z + x[0], g + x[1]];
            teile.push(`${s} ${n} ${x[2]}`);
            if (!arg || x[3] > arg[0]) arg = [x[3], `${n} in ${s} (${x[4]})`];
        }
    return { ist: +(z / g).toFixed(stellen), taeter: arg[1], anteil: A.anteil, teile: teile.join(" · "), bloecke: A.bloecke, offen: A.offen };
}
// DAS MITTEL EINER GRÖSSE der Teil-Klassen (`klassenMasse`), gewogen mit ihrer Zahl `n`; der Täter die Teil-Klasse (≥ 5 % der
// Pixel), die auf der Seite `dreh` am weitesten liegt (1 die größte, −1 die kleinste).
function teilMittel(ma, g, n, dreh, was) {
    const me = ma.messung;
    const f = bildMessungFehler(me);
    if (f) return { fehler: f };
    let s = 0,
        nr = 0,
        arg = null;
    const px = pixelSumme(me);
    for (const [k, z] of Object.entries(me.klassen)) {
        if (z[g] === undefined) return { fehler: `die Messung ohne ${g} (${k}) — vor dem Maß gemessen` };
        if (z[g] === null) continue;
        s += z[g] * z[n];
        nr += z[n];
        if (z.pixel >= 0.05 * px && (!arg || dreh * z[g] > dreh * arg[1])) arg = [k, z[g], z[n]];
    }
    if (!nr) return { fehler: `die Klasse zeigt keine ${was}` };
    return {
        ist: +(s / nr).toFixed(4),
        taeter: arg ? `${arg[0]} (${g} ${arg[1]} über ${arg[2]} ${was})` : null,
        anteil: px / flaeche(me),
    };
}
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
    // DIE FARBTON-STREUUNG der Wiese (`farbtonProbe`): das Ist ist das Mittel von σh über die Boden-Kacheln (`rechnung.kachel`
    // m) im Abstand `rechnung.band` mit ≥ `rechnung.minProben` Proben, gewichtet nach Proben — dieselbe Belichtung wie das
    // Soll-Bild gilt nur, was die Messung trägt (`farbton.belichtung`). Der Täter ist die einfarbigste Kachel.
    farbtonStreuung(ma) {
        const me = ma.messung,
            rc = ma.rechnung || {};
        const f = bildMessungFehler(me);
        if (f) return { fehler: f };
        const ft = me.abstand && me.abstand.farbton;
        if (!ft || !Array.isArray(ft.kacheln)) return { fehler: "die Messung ohne Farbton-Kacheln (werkbank bild --abstand)" };
        if (JSON.stringify([ft.kachel, ft.band, me.leinwand]) !== JSON.stringify([rc.kachel, rc.band, rc.leinwand]))
            return { fehler: `die Messung zählt ${ft.kachel}-m-Kacheln in ${ft.band} m auf ${me.leinwand}, die Rechnung ${rc.kachel} m in ${rc.band} m auf ${rc.leinwand}` };
        const ks = ft.kacheln.filter((k) => k[1] >= (rc.minProben || 1));
        if (!ks.length) return { fehler: `keine Kachel mit ≥ ${rc.minProben} Proben in ${ft.band} m` };
        const n = ks.reduce((a, k) => a + k[1], 0);
        const ist = ks.reduce((a, k) => a + farbtonSigma(k.slice(1)) * k[1], 0) / n;
        const arg = ks.reduce((a, k) => (farbtonSigma(k.slice(1)) < farbtonSigma(a.slice(1)) ? k : a));
        return {
            ist: +ist.toFixed(2),
            taeter: `die Kachel ${arg[0]} (${arg[1]} Proben): σh ${farbtonSigma(arg.slice(1)).toFixed(2)}° um h ${((Math.atan2(arg[3], arg[2]) * 180) / Math.PI).toFixed(1)}°`,
            anteil: n / (flaeche(me) / 4),
            teile: `${ks.length} Kacheln ${rc.kachel} m in ${rc.band.join("–")} m · Belichtung ${ft.belichtung}`,
        };
    },
    // DIE SPIEGEL-TREUE der Klasse (D10, `klassenMasse` spiegelTreue über die Summen `sp` ihrer Teil-Klassen): Pearson r der
    // Block-Luma gegen ihr Bild an der Wasser-Ebene (`spiegelPartner`); der Täter die Teil-Klasse mit den meisten Blöcken.
    spiegelTreue(ma) {
        const me = ma.messung;
        const f = bildMessungFehler(me);
        if (f) return { fehler: f };
        const sp = [0, 0, 0, 0, 0, 0];
        let arg = null;
        for (const [k, z] of Object.entries(me.klassen)) {
            if (z.spiegelEbene === undefined) return { fehler: `die Messung ohne Spiegel-Ebene (${k}) — vor A13 (die Ufer-Achse)` };
            z.sp.forEach((v, i) => (sp[i] += v));
            if (!arg || z.sp[0] > arg[1]) arg = [k, z.sp[0], z.spiegelTreue];
        }
        const r = spiegelPearson(sp);
        if (r == null) return { fehler: `${sp[0]} Blöcke mit Spiegel-Partner — kein Spiegel zu messen (die Messung ohne Tiefe?)` };
        return {
            ist: +r.toFixed(3),
            taeter: `${arg[0]} (r ${arg[2]} über ${arg[1]} Blöcke)`,
            anteil: pixelSumme(me) / flaeche(me),
        };
    },
    // DER ZWEITON-ANTEIL der Klasse (`klassenMasse` zweiton über die Pixel ihrer Teil-Klassen): der Anteil ihrer Pixel im
    // sichtbaren Dither-Raster; der Täter die Teil-Klasse (≥ 5 % der Pixel) mit dem höchsten Anteil.
    zweiton: (ma) => teilMittel(ma, "zweiton", "pixel", 1, "Pixel"),
    // DIE KANTE DER SILHOUETTE (K68-n2; `klassenMasse` kante über die Rand-Pixel ihrer Teil-Klassen gemittelt): wie gerade der
    // Umriss der Krone gegen das Außen läuft; der Täter die Teil-Klasse (≥ 5 % der Pixel) mit der geradesten Kante.
    kante: (ma) => teilMittel(ma, "kante", "kr", 1, "Rand-Pixel"),
    // DER STRICH IM INNEREN (haar.K1/K2; `klassenMasse` strich über die inneren Pixel ihrer Teil-Klassen gemittelt): wie gleich
    // Fell-Strich und Strähnen laufen, gegen die REF; der Täter die Teil-Klasse mit dem stumpfsten Strich. Die Albedo daneben (das
    // Haar: `rohdatei`, seine Zeile der Albedo-Tafel) urteilt die Tafel als Neben-Größe.
    strich: (ma) => (ma.messung == null ? { ungemessen: true } : teilMittel(ma, "strich", "si", -1, "inneren Pixel")),
    // MILCHWEISS (K63-n4; Prüfer K63 R3: die weiße Tafel der Tore hieß „geheilt", weil die Kamera den Spieler mitnahm — der
    // Portal-Nebel wacht am SPIELER, nicht am Auge): der Anteil der Apertur-Pixel (`rechnung.apertur`: Membran und Nebel), die
    // als Weiß lesen statt als Farbe (`klassenMasse` wt), über die Schüsse JE STUFE (`messung.L<n>`, die Tore des Schusses in
    // ihrer Stufe beim Namen, `rechnung.tor`). Die Stufen liest die Linse im Kern (`rechnung.stufen`: porta-core
    // PORTAL_RENDER_CONFIG lod.kindStages.gate ab der Stufe `ab`) — eine Stufe ohne Schuss lässt das Maß offen (ROT), ein
    // Schuss, der seine Tore in einer anderen Stufe zeigt, ist ein Bruch. Der Täter ist Schuss × Klasse mit den meisten weißen
    // Pixeln, der Bildanteil der Schuss mit der größten Apertur.
    milchweiss: (ma, q) =>
        aperturMittel(ma, q, 4, (k, s, n) =>
            k.wt == null
                ? { fehler: `${s}: die Messung ohne Milchweiß (${n}) — vor K63-n4 gemessen` }
                : k.wtZiel == null
                  ? { fehler: `${s}: die Messung ohne das Bild ohne Film (${n}) — vor D8 gemessen, ein blasses Ziel läse als Milch` }
                  : [k.wt, k.pixel, `${(k.wt / Math.max(1, k.pixel)).toFixed(2)} (${k.pixel} px, Ziel weiß ${(k.wtZiel / Math.max(1, k.pixel)).toFixed(2)})`, k.wt, `${k.wt} von ${k.pixel} Pixeln weiß`]
        ),
    // DIE BUNTE ÖFFNUNG (D8, Soll-Tafel tor-bunt; Nordstern §4.8 „die Membran zeigt das Ziel wie ein Seifenfilm"): das Mittel der
    // Buntheit C*ab (`klassenMasse` bunt) über alle Apertur-Pixel der Stufen-Schüsse — dieselben Schüsse wie milchweiss
    // (`aperturSchuesse`). Eine Öffnung, die ihr Ziel zeigt, trägt seine Farbe; Milch, Nebel und unbuntes Grau lesen ≈ 0. Der
    // Täter ist Schuss × Klasse mit der kleinsten Buntheit.
    oeffnungBunt: (ma, q) =>
        aperturMittel(ma, q, 2, (k, s, n) =>
            k.bunt == null
                ? { fehler: `${s}: die Messung ohne Buntheit (${n}) — vor D8 gemessen` }
                : [k.bunt * k.pixel, k.pixel, `C*ab ${k.bunt} (${k.pixel} px)`, -k.bunt, `C*ab ${k.bunt} über ${k.pixel} Pixel`]
        ),
    // DIE TREUE ZUM ZIEL (D8, Soll-Tafel tor-ziel): je Apertur-Klasse die Rang-Korrelation (Spearman) zwischen dem Bild der Öffnung
    // und dem Ziel-Panorama, das der Parallaxen-Strahl desselben Pixels trifft (`werkbank bild`: `ziel` { r, pixel, grund } je
    // Klasse) — rang-treu, damit Belichtung, Tonkurve und sRGB (monoton) das Maß nicht tragen. Hält die Welt kein Ziel-Panorama (die
    // Membran liest keinen Studio-Export), liest die Klasse r 0 und ist der Täter beim Namen; ein Schuss ohne `ziel` stammt von
    // vor D8.
    zielTreue: (ma, q) =>
        aperturMittel(ma, q, 3, (k, s, n) => {
            const zahl = Number.isFinite;
            const z = k.ziel;
            if (z === undefined) return { fehler: `${s}: die Messung ohne Ziel (${n}) — vor D8 gemessen` };
            if (!z || typeof z !== "object") return { fehler: `${s}: das Ziel von ${n} ist keine Messung` };
            const r = zahl(z.r) ? z.r : 0;
            const p = zahl(z.pixel) && z.pixel > 0 ? z.pixel : k.pixel;
            return [r * p, p, `r ${zahl(z.r) ? z.r : "—"}${z.grund ? " (" + z.grund + ")" : ""} (${p} px)`, -r, `r ${r} über ${p} Pixel${z.grund ? " — " + z.grund : ""}`];
        }),
    // DAS GESICHT IM BILD (K63-n2, `werkbank bild --gesicht`): die Züge des Kopfs, wie die Ausgabe sie zeigt (`gesichtMasse`:
    // Iris frei, Lippe und Höhle gegen die Wange in CIELAB, das Haar über der Haarlinie), je Zug gegen sein Band in KOPF_SOLL —
    // GELESEN (`verweis.felder`), nie kopiert. Das Ist = Anteil der Züge im Band; der Täter der Zug am weitesten draußen (in
    // Band-Breiten). Der Bildanteil kommt aus dem Bild der Wirkung (der Spieler im Third-Blick), nie aus der Nahaufnahme.
    gesicht(ma, q, band, sb) {
        const me = ma.messung;
        const f = bildMessungFehler(me);
        if (f) return { fehler: f };
        const g = me.gesicht;
        if (!g || typeof g !== "object") return { fehler: "die Messung ohne Gesicht (werkbank bild --gesicht)" };
        const felder = sb && sb.felder;
        if (!felder) return { fehler: "gesicht ohne die Bänder der Züge (verweis felder)" };
        let drin = 0,
            n = 0,
            arg = null;
        const teile = [];
        for (const [z, b] of Object.entries(felder)) {
            const x = g[z];
            n++;
            if (typeof x !== "number" || !Number.isFinite(x)) {
                teile.push(`${z} —`);
                if (!arg || arg[1] < 1e9) arg = [`${z} ungemessen`, 1e9];
                continue;
            }
            const br = Math.max(1e-6, b[1] - b[0]);
            const d = x < b[0] ? (b[0] - x) / br : x > b[1] ? (x - b[1]) / br : 0;
            if (d === 0) drin++;
            teile.push(`${z} ${+x.toFixed(3)} [${b[0]}, ${b[1]}]`);
            if (d > 0 && (!arg || d > arg[1])) arg = [`${z} ${+x.toFixed(3)} außerhalb [${b[0]}, ${b[1]}]`, d];
        }
        return { ist: +(drin / n).toFixed(3), taeter: arg ? arg[0] : null, teile: teile.join(" · ") };
    },
    // DAS LICHT-VERHÄLTNIS: E(Sonne + Himmel) / E(Himmel) an der waagrechten 18-%-Karte (`werkbank licht`, die Licht-Bilanz);
    // ihre Größen daneben (D3: `schattenAnteil`, `umgebungAzimut`) urteilt die Tafel als Neben-Größen (`sollTafelUrteil`).
    lichtVerhaeltnis(ma) {
        const me = ma.messung;
        if (!me || me.werkzeug !== "licht") return { fehler: "keine Messung aus `werkbank licht`" };
        for (const f of ["datum", "stand", "E_alle", "E_umgebung"]) if (me[f] == null) return { fehler: `die Messung ohne ${f}` };
        if (!(me.E_umgebung > 0 && me.E_alle > me.E_umgebung))
            return { fehler: `E alle ${me.E_alle}, E Himmel ${me.E_umgebung} — die Bilanz misst die Sonne nicht` };
        const ist = +(me.E_alle / me.E_umgebung).toFixed(3);
        return {
            ist,
            taeter: `E Himmel ${me.E_umgebung} gegen E Sonne ${+(me.E_alle - me.E_umgebung).toFixed(2)}`,
            teile: `lichtVerhaeltnis ${ist}`,
        };
    },
    // DER SCHATTEN-ANTEIL (D3): die waagrechte 18-%-Karte im Schatten (der Himmel allein) gegen die besonnte — der Diffus-
    // Anteil des klaren Mittags (Liu & Jordan 1960: 0,08–0,20). Bis D3 0,237: der Schatten trug ein getuntes Viertel der Sonne.
    schattenAnteil(ma) {
        const me = ma.messung;
        if (!me || me.werkzeug !== "licht") return { fehler: "keine Messung aus `werkbank licht`" };
        if (!(me.E_alle > 0) || me.E_umgebung == null) return { fehler: "die Messung ohne E_alle oder E_umgebung" };
        return {
            ist: +(me.E_umgebung / me.E_alle).toFixed(3),
            taeter: `E Himmel ${me.E_umgebung} von E alle ${me.E_alle}`,
        };
    },
    // DIE UMGEBUNG HAT EINE RICHTUNG (D3): die senkrechte Karte zur Sonne gegen die von ihr weg, im Himmel allein — der klare
    // Himmel ist zur Sonne heller (Mie-Hof, Rayleigh-Phase; Hillaire mit dem Welt-Gesetz 1,33–1,67). Bis D3 malte die CPU eine
    // azimut-konstante Umgebung: 1,0.
    umgebungAzimut(ma) {
        const me = ma.messung;
        if (!me || me.werkzeug !== "licht") return { fehler: "keine Messung aus `werkbank licht`" };
        const z = me.E_umgebung_zurSonne,
            v = me.E_umgebung_vonSonne;
        if (z == null || v == null) return { fehler: "die Messung ohne E_umgebung_zurSonne/vonSonne (vor D3 gemessen)" };
        if (!(v > 0)) return { fehler: `E von der Sonne ${v} — die Bilanz sieht keinen Himmel` };
        return { ist: +(z / v).toFixed(3), taeter: `zur Sonne ${z} gegen von ihr ${v}` };
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
    } catch {
        return { fehler: `Rohdatei ${ro.datei} ist kein JSON` };
    }
    const z = (t.zeilen || []).find((x) => x.id === ro.zeile);
    if (!z || !z.ist) return { fehler: `Rohdatei ${ro.datei}: Zeile „${ro.zeile}" ohne Ist` };
    const w = (t.gemessen && t.gemessen.welt) || {},
        l = (t.gemessen && t.gemessen.labor) || {};
    // beide Seiten tragen ihren Stand (`kernStand`, geschrieben von werkbank `albedo --tafel` und `--labor --datei`)
    return { t, z, stand: `${String(w.datum || "?").slice(0, 10)} ${w.geraet || "?"}`, bloecke: [w, l], quellen: z.quellen || [] };
}
// DER STAND einer Messung: ein Ist gilt für den CODE der Quellen seiner Klasse (`klasse.quellen`: das Gesetzbuch und der Ofen; `messung.quellen`
// die Code-Abdrücke, die das Werkzeug beim Schreiben nimmt, `codeAbdruck`) — nicht für die Version des Stamms (K63-n8: jede
// Integration hebt VERSION und machte jede Zeile veraltet, ohne dass ihr Code sich rührte; Version und Commit stehen als Beleg).
// Ein Block ohne Version, Commit oder Abdruck ist ungeprüft, einer mit fremdem Abdruck „veraltet seit <Commit der Messung>" —
// beides ROT, nie GRÜN. Dieselbe Regel liest die Albedo-Wand je Zeile (albedo-tafel `tafelStand`).
function messStand(bloecke, quellen, q) {
    for (const b of bloecke) {
        const st = (b && b.stand) || {};
        if (!(st.version || (b && b.version))) return "Stand ungeprüft: die Messung trägt keine Version";
        const sha = st.sha || (b && b.sha);
        if (!sha) return "Stand ungeprüft: die Messung trägt keinen Commit (stand.sha)";
        for (const d of quellen) {
            const h = b.quellen && b.quellen[d];
            if (!h) return `Stand ungeprüft: die Messung ohne Abdruck von ${d}`;
            if (!ABDRUCK.test(h)) return `Stand ungeprüft: ${d} trägt eine Prüfsumme alter Form (${h}), keinen Code-Abdruck`;
            const jetzt = q.pruefsumme ? q.pruefsumme(d) : null;
            if (h !== jetzt) return `${veraltetSeit(sha)}: ${d} geändert (${h} → ${jetzt})`;
        }
    }
    return null;
}
// „veraltet seit <Commit>": der Commit, an dem die Messung stand (8 Zeichen; „+geändert", wenn der Baum dort nicht sauber war)
const veraltetSeit = (sha) => `veraltet seit ${String(sha).slice(0, 8)}${/\+geaendert$/.test(sha) ? "+geändert" : ""}`;
MASS_RECHNER.albedoVerhaeltnis = (ma, q) => {
    const a = albedoZeile(ma, q);
    if (a.fehler) return a;
    const v = a.z.ist.verhaeltnis;
    return {
        ist: v,
        taeter: `Labor ${a.z.ist.labor.Y} gegen Welt ${a.z.ist.welt.Y} (${ma.rohdatei.zeile})`,
        stand: a.stand,
        bloecke: a.bloecke,
        quellen: a.quellen,
    };
};
MASS_RECHNER.albedo = (ma, q) => {
    const a = albedoZeile(ma, q);
    if (a.fehler) return a;
    return {
        ist: a.z.ist.welt.Y,
        taeter: `Welt-Albedo ${a.z.ist.welt.Y} (${ma.rohdatei.zeile})`,
        stand: a.stand,
        bloecke: a.bloecke,
        quellen: a.quellen,
    };
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
        if (wert === undefined)
            return { fehler: `${wo}: Verweis ${v.datei} ${v.symbol} — das Symbol ist dort nicht definiert` };
        // mehrere Züge (`felder`, das Gesicht): je Feld ein Band, gelesen; das Soll des Maßes ist „jeder Zug in seinem Band“ [1, 1]
        if (Array.isArray(v.felder)) {
            if (!v.felder.length) return { fehler: `${wo}: Verweis ${v.datei} ${v.symbol} ohne Felder` };
            const felder = {};
            for (const fe of v.felder) {
                const bf = wert && wert[fe];
                if (!(Array.isArray(bf) && bf.length === 2))
                    return { fehler: `${wo}: Verweis ${v.datei} ${v.symbol}.${fe} trägt kein Band [min, max]` };
                felder[fe] = bf.slice();
            }
            return { band: [1, 1], felder, gelesen: `${v.symbol}.{${v.felder.join(", ")}}` };
        }
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
    } catch {
        return { fehler: `${wo}: Verweis auf ${v.datei} — kein JSON` };
    }
    const wert = v.feld ? t[v.feld] : undefined;
    if (v.art === "toleranz" && typeof wert === "number")
        return { band: [+(1 - wert).toFixed(4), +(1 + wert).toFixed(4)], gelesen: `${v.datei} ${v.feld}` };
    return { fehler: `${wo}: Verweis ${v.datei} ${v.feld} — kein lesbares Band (art toleranz)` };
}

// DER CODE-ABDRUCK (K63-n8; eine Kommentarzeile macht keine Zeile veraltet): die Prüfsumme einer Quelle läuft über ihren CODE — die Token-Folge (acorn), ohne
// Kommentare und Leerraum zwischen den Token; JSON kanonisch (geparst, neu geschrieben). Eine andere Dateiart trägt keinen
// Stand (laut, nie still die Bytes); ein Token-Fehler bricht laut. Form `c:` + 16 Hex — eine Prüfsumme anderer Form (die
// Bytes bis K63-n7) ist ungeprüft, nie gleich.
const ABDRUCK = /^c:[0-9a-f]{16}$/;
function codeAbdruck(text, datei) {
    const h = require("crypto").createHash("sha256");
    if (/\.(c|m)?js$/.test(datei)) {
        const acorn = require("acorn");
        const opt = { ecmaVersion: "latest", sourceType: /\.mjs$/.test(datei) ? "module" : "script", allowHashBang: true };
        text = text.replace(/\.VERSION = "[^"]*"/, ".VERSION");
        for (const tok of acorn.tokenizer(text, opt)) h.update(text.slice(tok.start, tok.end) + "\u0000");
    } else if (/\.json$/.test(datei)) h.update(JSON.stringify(JSON.parse(text)));
    else throw new Error(`Code-Abdruck: ${datei} ist keine Code-Datei (js, cjs, mjs, json)`);
    return "c:" + h.digest("hex").slice(0, 16);
}

// DER STAND-LESER: die EINE Stelle, an der Werkzeug (werkbank `--ist`, `albedo --tafel`, diag-albedo-tafel `--labor`)
// und Linse (K5, gate:albedo-tafel) Version, Commit und Abdrücke lesen — AnazhRealm.VERSION aus der Naht des Stamms, der
// Code-Abdruck einer Datei des Baums (`codeAbdruck`); das Urteil ist CI-fest (keine git-Geschichte), nur der Schreiber nimmt
// den Commit, an dem er misst (`gitStand`: SHA, „+geaendert" bei Änderungen an versionierten Dateien außer den Tafeln).
function standLeser(root) {
    const fs = require("fs"),
        path = require("path");
    const gitStand = () => {
        try {
            const { execFileSync } = require("child_process");
            const sha = execFileSync("git", ["-C", root, "rev-parse", "HEAD"]).toString().trim();
            // die Tafeln zählen nicht: in sie schreiben die Werkzeuge selbst ihre Messungen (`--ist`, `--nachziehen`)
            const neu = execFileSync("git", [
                "-C",
                root,
                "status",
                "--porcelain",
                "--untracked-files=no",
                "--",
                ".",
                ":(exclude)spec/abnahme/soll-tafel.json",
                ":(exclude)spec/farbe/albedo-tafel.json",
            ])
                .toString()
                .trim();
            return sha + (neu ? "+geaendert" : "");
        } catch {
            return null;
        }
    };
    // die Version des Stamms (AnazhRealm.VERSION in seiner Versions-Datei): EIN Leser für Werkzeug, Kern-Stand und Urteil
    const stammVersion = () =>
        (/AnazhRealm\.VERSION = "([^"]+)"/.exec(fs.readFileSync(path.join(root, require("./stamm.cjs").versionsDatei(root)), "utf8")) || [])[1] || null;
    return {
        gitStand,
        stammVersion,
        pruefsumme,
        // der Stand einer Messung, die viele Klassen trägt (die Albedo-Tafel, K63-n3): die Version und die Prüfsumme JEDES Kerns
        // (cores.manifest.json) und JEDER Stamm-Zone (K63-n4, der Stand über den Inhalt: die Liste der Stamm-Tags,
        // scripts/lib/stamm.cjs `dateien`) — jede Klasse und jede Zeile prüft daraus die Quellen, die sie trägt
        kernStand: () => {
            const m = JSON.parse(fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8"));
            const quellen = {};
            for (const c of m) for (const d of c.scripts) quellen[d] = pruefsumme(d);
            for (const d of require("./stamm.cjs").dateien(root)) quellen[d] = pruefsumme(d);
            return { version: stammVersion(), sha: gitStand(), quellen };
        },
        // DIE QUELLE DES URTEILS (K63-n7, `sollTafelUrteil(tafel, q)`): Haushalt, Datei-Leser, Prüfsumme und die Symbole der Kerne
        // GELESEN — jeder Kern läuft in einer eigenen vm (wie diag-mensch-anatomie), sein Namensraum trägt das Symbol. EINE
        // Quelle für die Linse (K5) und den Schreiber der Tafel (`werkbank … --ist`): beide urteilen mit denselben Zahlen.
        sollQuelle: () => {
            const kerne = {};
            const vm = require("vm");
            return {
                version: stammVersion(),
                pruefsumme,
                haushalt: JSON.parse(fs.readFileSync(path.join(root, "spec", "profiband", "haushalt.json"), "utf8")),
                lesen: (d) => (fs.existsSync(path.join(root, d)) ? fs.readFileSync(path.join(root, d), "utf8") : null),
                kern: (d, sym) => {
                    if (!(d in kerne)) {
                        const sb = { console, Math };
                        sb.self = sb;
                        sb.window = sb;
                        sb.globalThis = sb;
                        vm.createContext(sb);
                        try {
                            vm.runInContext(fs.readFileSync(path.join(root, d), "utf8"), sb, { filename: d });
                        } catch {}
                        kerne[d] = sb;
                    }
                    for (const v of Object.values(kerne[d]))
                        if (v && typeof v === "object" && v !== kerne[d] && Object.prototype.hasOwnProperty.call(v, sym))
                            return v[sym];
                    return undefined;
                },
            };
        },
    };
    function pruefsumme(d) {
        const p = path.join(root, d);
        return fs.existsSync(p) ? codeAbdruck(fs.readFileSync(p, "utf8"), d) : null;
    }
}

// DER EINE SCHUSS (W1-n1; Prüfer W1 R1: drei Tor-Zeilen trugen denselben Schuss dreimal, 988 Zeilen Kopie): misst ein Schuss
// mehrere Ziele (`werkbank bild --ist a,b:L1`), trägt ihn das erste, jedes weitere NENNT es („<id>[:L<n>|:wirkung]") — gelesen
// nur hier, für jedes Maß; ein Name ins Leere oder auf einen Namen ist ein Bruch.
function schussVon(kl, m, bruch) {
    const st = m && typeof m === "object" ? Object.keys(m) : [];
    if (st.length && st.every((L) => /^L\d$/.test(L))) return Object.fromEntries(st.map((L) => [L, schussVon(kl, m[L], bruch)]));
    if (typeof m !== "string") return m;
    const [id, teil] = m.split(":"),
        k = kl.find((x) => x.id === id) || {};
    const s = teil === "wirkung" ? (k.wirkung || {}).messung : ((k.mass || {}).messung || {})[teil] || (!teil && (k.mass || {}).messung);
    return s && typeof s === "object" ? s : bruch(`der Schuss „${m}" fehlt in der Tafel`);
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
    const zahl = Number.isFinite;
    const ids = new Set();
    for (const k of kl) {
        const wo = `Klasse ${k.id || "?"}`;
        if (!k.id || ids.has(k.id)) fehler.push(`${wo}: id fehlt oder doppelt`);
        ids.add(k.id);
        if (!(k.referenz || []).some((r) => r.titel && r.technik))
            fehler.push(`${wo}: keine benannte AAA-Referenz (Titel + Technik)`);
        // DIE VORLAGE: ein Soll, das schon im System steht (K57 KOPF_SOLL, K58 BLATT_ATLAS_WEDEL), wird REFERENZIERT —
        // die Linse liest das Symbol im Kern; eine Vorlage ins Leere ist ein Bruch (Prüfer K63 R2: der K58-Verweis fiel still).
        for (const vl of k.vorlage || []) {
            const w = vl && vl.symbol && q.kern ? q.kern(vl.datei, vl.symbol) : undefined;
            if (w === undefined)
                fehler.push(
                    `${wo}: Vorlage ${(vl && vl.karte) || "?"} ${vl && vl.datei} ${vl && vl.symbol} — das Symbol ist dort nicht definiert`
                );
        }
        if (!Array.isArray(k.quellen))
            fehler.push(`${wo}: ohne quellen (die Dateien, deren Bytes das Ist trägt) — sein Stand ist unprüfbar`);
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
        const bruch = (f) => void fehler.push(`${wo}: ${f}`);
        const ma = Object.assign({}, k.mass, { messung: schussVon(kl, (k.mass || {}).messung, bruch) });
        if (!MASS_AUFLOESUNG[ma.name]) fehler.push(`${wo}: Maß „${ma.name}" unbekannt (${Object.keys(MASS_AUFLOESUNG).join(", ")})`);
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
        const r = !rechner
            ? { fehler: "kein Rechner" }
            : ma.messung == null && !ma.rohdatei
              ? { ungemessen: true }
              : rechner(ma, q, sb ? sb.band : null, sb, baender);
        // DIE NEBEN-GRÖSSEN: trägt die Klasse neben dem Maß weitere Größen mit Rechner (die Licht-Bilanz D3: schattenAnteil,
        // umgebungAzimut; das Haar: die Albedo seiner Zeile), urteilt das Maß über alle — eine Größe außerhalb ihres Bands,
        // ungemessen oder veraltet hält es offen: ROT mit ihrem Namen, nie GRÜN
        for (const [g, b] of Object.entries(baender))
            if (g !== (ma.soll || ma.name) && MASS_RECHNER[g] && !r.fehler && !r.ungemessen) {
                const x = MASS_RECHNER[g](ma, q),
                    [u, o] = b.band;
                const aus = x.fehler || (x.bloecke && messStand(x.bloecke, x.quellen, q));
                r.teile = `${r.teile ? r.teile + " · " : ""}${g} ${aus ? "—" : x.ist} [${u == null ? "–" : u}; ${o == null ? "–" : o}]`;
                const raus = aus ? `${g}: ${aus}` : (u != null && x.ist < u) || (o != null && x.ist > o) ? `${g} ${x.ist} außerhalb (${x.taeter})` : null;
                if (raus) r.offen = r.offen ? `${r.offen} · ${raus}` : raus;
            }
        if (r.fehler) fehler.push(`${wo}: ${r.fehler}`);
        const ist = zahl(r.ist) ? r.ist : null;
        // der Stand der Messung: veraltet oder ungeprüft ist ROT ohne Wirkung (die Zahl bleibt sichtbar)
        const bloecke = r.bloecke || (ma.messung ? [ma.messung] : []);
        // die Quellen der Klasse und die der gelesenen Zeile (die Albedo-Tafel trägt je Zeile ihre Kerne und Stamm-Zonen)
        const stand =
            ist != null && Array.isArray(k.quellen)
                ? messStand(bloecke, [...new Set([...k.quellen, ...(r.quellen || [])])], q)
                : null;
        const e = MASS_AUFLOESUNG[ma.name] || 0.01;
        const weit = (rand) => Math.abs(Math.log((ist + e) / (rand + e)));
        let urteil = "ROT",
            grund = null,
            abstand = null;
        if (ist == null) grund = `${ma.name} ungemessen`;
        else if (stand) grund = `${ma.name} ${ist} — ${stand}`;
        else if (band && band[0] != null && ist < band[0]) {
            grund = `${ma.name} ${ist} < ${band[0]}`;
            abstand = weit(band[0]);
        } else if (band && band[1] != null && ist > band[1]) {
            grund = `${ma.name} ${ist} > ${band[1]}`;
            abstand = weit(band[1]);
        } else if (band) {
            urteil = "GRÜN";
            abstand = 0;
        }
        // ein Maß, das nicht jede Stufe sah (milchweiss: eine Stufe des Kerns ohne Schuss), ist offen — ROT, nie GRÜN
        if (ist != null && !stand && r.offen) {
            if (urteil === "GRÜN") abstand = null;
            urteil = "ROT";
            grund = grund ? `${grund} · ${r.offen}` : `${ma.name} ${ist} — ${r.offen}`;
        }
        // DER BENANNTE MANGEL: trägt die Klasse einen Mangel mit Quelle (Augen-Befund, Plan), muss ihr Maß ihn sehen. DER GEHEILTE MANGEL trägt
        // Befund, Quelle, Bild-Paar und Warum in Zahlen. Widerspricht ein GEMESSENES Maß dem Stand der Klasse (GRÜN neben dem
        // Mangel: blind oder geheilt ohne Bild-Paar; ROT neben geheilt: der Mangel ist zurück), urteilt die ZEILE ROT beim Namen —
        // nie ein Bruch der Tafel (ein abgewiesenes ehrliches ROT wäre fail-soft); veraltet steht ohnehin ROT bis zur Neumessung
        const mg = (k.wirkung || {}).mangel;
        if (mg != null && !(mg.befund && mg.quelle)) fehler.push(`${wo}: der Mangel ohne Befund oder Quelle`);
        const gh = (k.wirkung || {}).geheilt;
        if (gh != null && !(gh.befund && gh.quelle && gh.warum && Array.isArray(gh.bildPaar) && gh.bildPaar.length === 2))
            fehler.push(`${wo}: der geheilte Mangel ohne Befund, Quelle, Warum oder Bild-Paar`);
        else if (gh != null)
            for (const p of gh.bildPaar) if (bildPfadFehler(p)) fehler.push(`${wo}: das Bild-Paar: ${bildPfadFehler(p)}`);
        if (gh != null && mg) fehler.push(`${wo}: der Mangel steht und heißt zugleich geheilt`);
        const widerspruch =
            ist == null || stand
                ? null
                : mg && urteil === "GRÜN"
                  ? `der benannte Mangel „${mg.befund}" (${mg.quelle}) steht, das Maß ${ma.name} ist GRÜN — es sieht ihn nicht`
                  : gh && urteil !== "GRÜN"
                    ? `der Mangel „${gh.befund}" heißt geheilt, das Maß ${ma.name} ist ${urteil} — er ist zurück`
                    : null;
        if (widerspruch) {
            if (urteil === "GRÜN") abstand = null;
            urteil = "ROT";
            grund = `${grund || `${ma.name} ${ist}`} · ${widerspruch}`;
        }
        // der Bildanteil: aus der Messung des Maßes, sonst aus dem Bild der Wirkung (`--ist <id>:wirkung`), von Hand nur ohne Bild
        // und mit Quelle (das Licht: jedes Pixel)
        let anteil = zahl(r.anteil) ? r.anteil : null;
        const wi = Object.assign({}, k.wirkung, { messung: schussVon(kl, (k.wirkung || {}).messung, bruch) });
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
        const me = (r.bloecke && r.bloecke[0]) || ma.messung;
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
            veraltet: !!stand,
            stand:
                r.stand ||
                (me && me.datum
                    ? `${String(me.datum).slice(0, 10)} ${String(me.stand.sha || "").slice(0, 8)} ${me.geraet.adapter || ""}`.trim()
                    : null),
            stufen,
        });
    }
    // DIE REIHENFOLGE nach Wirkung: ROT gemessen (Wirkung absteigend), ROT ungemessen, GRÜN
    const rangVon = (z) => (z.urteil === "GRÜN" ? 2 : z.ist == null || z.veraltet ? 1 : 0);
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
            : z.urteil === "ROT" && z.ist != null && !z.veraltet
              ? " · Wirkung ungemessen (der Bildanteil fehlt)"
              : "";
    return (
        `${z.rang}. ${z.urteil === "ROT" ? "ROT " : "GRÜN"} ${z.id}: ${z.mass} ${z.ist == null ? "—" : z.ist} Soll ${b} (${z.bandArt || "?"})${w}` +
        `${z.urteil === "ROT" ? ` — ${z.grund}${z.taeter ? ` · Täter ${z.taeter}` : ""}` : ""}` +
        `${z.teile ? ` · ${z.teile}` : ""} · Budget ${bud}${z.stand ? ` · gemessen ${z.stand}` : ""}`
    );
}

// DER SELBSTTEST der Soll-Tafel (rein): die Teilung zeigt die Klasse ohne ihren Schatten und ohne ihre Wurzel, ein Misch-Pixel
// zählt einmal, das Rauschen zweier gleicher Schüsse ist 0; die Maße treffen ihre Eichpunkte (Detail flach 0, der ideale Spiegel
// ≥ 0,95, 1/f^β fällt mit β, die Lücke einer Wiese mit LAI 2 liest LAI 2); jeder eingeschmuggelte Bruch der Tafel fällt
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
    // das Mikro-Detail (material.K2): ein Schachbrett nyquist 1, ein Verlauf 0 und glatt, das Spektrum 1/f^β trifft sein β
    {
        const n = 64,
            v1 = new Uint8Array(n * n).fill(1),
            grau = (f) => Uint8Array.from({ length: n * n * 4 }, (_, i) => (i % 4 === 3 ? 255 : f((i >> 2) % n, (i >> 2) / n | 0)));
        const sb = klassenMasse(grau((x, y) => ((x + y) & 1 ? 60 : 180)), v1, n, n);
        const vl = klassenMasse(grau((x) => 40 + x), v1, n, n);
        if (!(sb.nyquist > 0.99 && vl.nyquist < 0.01 && vl.glatt === 1 && sb.glatt === 0))
            v.push(`Maß Mikro: Schachbrett ${sb.nyquist}/${sb.glatt}, Verlauf ${vl.nyquist}/${vl.glatt} statt 1/0, 0/1`);
        for (const b of [0, 1, 2]) {
            const ist = klassenMasse(rauschBild(n, b, 7919), v1, n, n).beta;
            if (!(Math.abs(ist - b) < 0.35)) v.push(`Maß Mikro: β ${b} gemessen als ${ist}`);
        }
        // das Urteil der Armlänge: Korn (das Schachbrett) grün; ein Boden ohne Mikro-Term (der Verlauf) und eine Pose ohne Fels je ROT beim Namen
        const ab = [{ boden: sb }, { boden: vl }, {}].map((klassen) => armUrteil({ ausdruck: "fels", arm: { soll: 1, ist: 1 }, klassen })).join("|");
        if (ab !== "|MIKRO boden: nyquist 0 glatt 1|POSE fels: 0 im Bild, Mitte 1 m") v.push(`Urteil Arm: ${ab}`);
    }
    // DIE SPIEGEL-TREUE (D10, A13) geeicht an einer gebauten Welt, je Pixel per Strahl (Kamera 2 m über dem See, waagrecht, 60°;
    // rechts ein Sandstreifen 0,4 m hoch, Bäume dahinter, fern ein Ufer mit Wald, Wolken-Bänder): der ideale Spiegel (F = 1) → ≥ 0,95
    // (die Ufer-Achse bis A13: 0,37), unter dem Fresnel-Verlauf je Zeile (2 % → 100 %) > 0,9; ohne Himmel im Wasser und 12 px
    // versetzt → unter dem Soll 0,6; ein Wasser ohne Bild (Verlauf) → 0; das Foto Llyn Padarn (480 × 265) vor einer Kulisse (das Ufer
    // eine Wand, deren Fuß die Zeile 141,5 trifft) → 0,922 im Soll [0,6, ∞]
    {
        const kamera = (Wk, Hk) => {
            const [f, a, h, A, B] = [1.732, Wk / Hk, 2, 1000 / (0.1 - 1000), 100 / (0.1 - 1000)];
            const vp = [f / a, 0, 0, 0, 0, f, 0, 0, 0, 0, A, -1, 0, -f * h, B, 0],
                ivp = [a / f, 0, 0, 0, 0, 1 / f, 0, 0, 0, h / B, 0, 1 / B, 0, (h * A) / B, -1, A / B];
            const strahl = (x, y) => [(((x + 0.5) / Wk) * 2 - 1) * a / f, (1 - ((y + 0.5) / Hk) * 2) / f, -1].map((c, _i, s) => c / Math.hypot(...s));
            return { f, h, vp, ivp, strahl, auge: [0, h, 0], tw: Wk, th: Hk, tiefe: new Float32Array(Wk * Hk), ndc: (t) => (A * -t + B) / t };
        };
        const [Ws, Hs, K] = [384, 216, kamera(384, 216)];
        const kisten = [[5, -5, -400, 400, 0.4, 10, (x, y, z) => 150 + 25 * ((Math.floor(x) + Math.floor(z)) & 1)], [-400, -5, -600, 400, 1, -150, () => 110]];
        for (let i = 0; i < 12; i++) kisten.push([9 + (i % 3) * 4, 0, -10 - i * 7, 10.5 + (i % 3) * 4, 5 + ((i * 7) % 9), -8.5 - i * 7, (x, y) => (y > 3 ? 75 + 25 * (Math.floor(y * 2) & 1) : 35)]);
        for (let i = 0; i < 30; i++) kisten.push([-160 + i * 11, 0, -156, -154 + i * 11, 10 + ((i * 5) % 17), -150, (x, y) => 50 + 3 * ((y * 3) % 7)]);
        const spur = (o, d) => {
            let [t, ton] = [Infinity, null];
            for (const k of kisten) {
                const [u, w] = [0, 1, 2].map((i) => [(k[i] - o[i]) / d[i], (k[i + 3] - o[i]) / d[i]]).reduce(([a, b], [c, e]) => [Math.max(a, Math.min(c, e)), Math.min(b, Math.max(c, e))], [1e-4, Infinity]);
                if (u < w && u < t) [t, ton] = [u, k[6]];
            }
            if (d[1] < 0 && -o[1] / d[1] < t) return { t: -o[1] / d[1], wasser: true };
            if (ton) return { t, L: ton(o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]) };
            return { himmel: true, L: 120 + 80 * d[1] + 40 * (Math.sin(Math.atan2(d[0], -d[2]) * 11 + d[1] * 30) > 0.4) };
        };
        // das Bild des Spiegels zum Strahl durch (x, y): der an der Ebene gespiegelte Strahl aus seinem Treffer
        const bild = (x, y, d = K.strahl(x, y)) => (d[1] < 0 ? spur([(-K.h / d[1]) * d[0], 0, (-K.h / d[1]) * d[2]], [d[0], -d[1], d[2]]) : { L: 25 });
        const namen = ["ideal", "fresnel", "ohneHimmel", "verschoben", "verlauf"],
            B5 = namen.map(() => new Uint8Array(Ws * Hs * 4)),
            mw = new Uint8Array(Ws * Hs);
        for (let p = 0; p < Ws * Hs; p++) {
            const [x, y] = [p % Ws, Math.floor(p / Ws)],
                s = spur(K.auge, K.strahl(x, y)),
                r = s.wasser && bild(x, y),
                F = 0.02 + 0.98 * Math.pow(1 - (1 - ((y + 0.5) / Hs) * 2) / -K.f, 5);
            K.tiefe[p] = s.himmel ? 1 : K.ndc(-s.t * K.strahl(x, y)[2]);
            mw[p] = s.wasser ? 1 : 0;
            const w = s.wasser ? [r.L, F * r.L + (1 - F) * 25, r.himmel ? 25 : r.L, bild(x, y - 12).L, 60 + y / 4] : namen.map(() => s.L);
            B5.forEach((b, i) => b.set([w[i], w[i], w[i], 255], p * 4));
        }
        const soll = [(r) => r >= 0.95, (r) => r > 0.9, (r) => r < 0.6, (r) => r < 0.6, (r) => Math.abs(r) < 0.3];
        B5.forEach((b, i) => {
            const r = klassenMasse(b, mw, Ws, Hs, null, null, K).spiegelTreue;
            if (!soll[i](r)) v.push(`Maß spiegelTreue: der Spiegel „${namen[i]}" ${r} (Soll ${soll[i].toString().slice(7)})`);
        });
        // DIE EBENE (material.K4): dieselbe Welt um z gedreht (x, y, z) → (−y, x, z) — der See wird eine senkrechte Scheibe mit
        // der Normale (−1, 0, 0), der ideale Spiegel bleibt ≥ 0,95. Die Matrizen spaltenweise wie three: vp' = vp · R⁻¹ (die
        // Spalten x' = −y, y' = x), ivp' = R · ivp (je Spalte (a, b, c, d) → (−b, a, c, d))
        const vp = [...K.vp.slice(4, 8).map((x) => -x), ...K.vp.slice(0, 4), ...K.vp.slice(8)],
            ivp = K.ivp.map((x, i) => [-K.ivp[i + 1], K.ivp[i - 1], x, x][i % 4]);
        const Kd = { ...K, vp, ivp, auge: [-K.h, 0, 0], normale: [-1, 0, 0] };
        const rd = klassenMasse(B5[0], mw, Ws, Hs, null, null, Kd).spiegelTreue;
        if (!(rd >= 0.95)) v.push(`Maß spiegelTreue: die senkrechte Scheibe ${rd} (Soll ≥ 0,95)`);
        const fs = require("fs"),
            foto = require("path").join(__dirname, "..", "..", "spec", "abnahme", "llyn-padarn.png");
        const b = fs.existsSync(foto) ? pngLesen(fs.readFileSync(foto)) : null;
        if (!b) v.push("Maß spiegelTreue: das Foto spec/abnahme/llyn-padarn.png fehlt");
        else {
            const [Kf, mf] = [kamera(b.W, b.H), new Uint8Array(b.W * b.H)];
            for (let p = 0, wand = (Kf.h * Kf.f * b.H) / 2 / (141.5 - b.H / 2); p < b.W * b.H; p++) {
                const y = Math.floor(p / b.W);
                mf[p] = y >= 141 ? 1 : 0;
                Kf.tiefe[p] = Kf.ndc(mf[p] ? (Kf.h * Kf.f) / -(1 - ((y + 0.5) / b.H) * 2) : wand);
            }
            const rf = klassenMasse(b.u8, mf, b.W, b.H, null, null, Kf).spiegelTreue;
            if (!(Math.abs(rf - 0.922) < 0.005)) v.push(`Maß spiegelTreue: Llyn Padarn ${rf} statt 0,922`);
        }
    }
    const mA = new Uint8Array(W * H);
    for (let p = 0; p < W * H; p++) mA[p] = teil[p] === 1 ? 1 : 0;
    // die Klasse A zeigt 200, das Misch-Pixel 170: Mittel (24·200 + 170)/25
    if (!(Math.abs(klassenMasse(G, mA, W, H).luma - (24 * 200 + 170) / 25) < 1e-6)) v.push("Maß luma: die Klasse liest falsch");
    // die Rechnung einsDurch kehrt das Band um
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
    // die Farbton-Streuung: ein grauer Block zählt nicht (C* ≤ 5), ein grüner ja; eine Kachel aus zwei Tönen ±10° liest
    // sqrt(−2 ln cos 10°) = 10,03°, eine einfarbige 0° — das Ist ist das Proben-Mittel, der Täter die einfarbige Kachel
    const block = (rgb) => new Uint8Array(16).map((_, j) => (j % 4 < 3 ? rgb[j % 4] : 255));
    const grau = farbtonProbe(farbtonProbe([0, 0, 0, 0], block([128, 128, 128]), 0, 2), block([60, 140, 30]), 0, 2);
    const zwei = [2, 2 * Math.cos((10 * Math.PI) / 180), 0, 2];
    const ftMe = Object.assign({}, laiMe, {
        abstand: { farbton: { kachel: 2, band: [2, 5], belichtung: 1, kacheln: [["0,0", ...zwei], ["1,0", 2, 2, 0, 2]] } },
    });
    const ft = MASS_RECHNER.farbtonStreuung({ messung: ftMe, rechnung: { kachel: 2, band: [2, 5], leinwand: [1000, 1000], minProben: 1 } });
    if (!(grau[0] === 2 && grau[3] === 1 && Math.abs(farbtonSigma(zwei) - 10.03) < 0.01 && ft.ist === 5.01 && /1,0/.test(ft.taeter)))
        v.push(`Maß farbtonStreuung: Grau ${grau}, ±10° ${farbtonSigma(zwei)}, Ist ${ft.ist} (Soll 5,01), Täter ${ft.taeter || ft.fehler}`);
    // die Tafel: die echte ohne Bruch, jeder eingeschmuggelte Bruch beim Namen
    const echt = sollTafelUrteil(tafel, q);
    for (const f of echt.fehler) v.push(`Tafel: ${f}`);
    const klon = () => JSON.parse(JSON.stringify(tafel));
    const finde = (t, f) => (t.klassen || []).find(f);
    const mitMessung = (t) => finde(t, (k) => k.mass && k.mass.messung && k.mass.messung.werkzeug === "bild");
    const mitVerweis = (t) => finde(t, (k) => ((k.soll && k.soll.eigenschaften) || []).some((e) => e.verweis && e.verweis.symbol));
    const mitAlbedo = (t) => finde(t, (k) => k.mass && k.mass.rohdatei);
    // eine Messung auf den Stand DIESES Baums setzen (Version + Prüfsummen der Klassen-Quellen)
    const frisch = (k, me) => {
        me.stand = Object.assign({ sha: "0123456789abcdef0123456789abcdef01234567" }, me.stand, { version: q.version });
        me.quellen = Object.fromEntries((k.quellen || []).map((d) => [d, q.pruefsumme ? q.pruefsumme(d) : null]));
    };
    const mitMangel = (t, k = finde(t, (x) => x.wirkung && (x.wirkung.mangel || x.wirkung.geheilt) && x.mass && x.mass.name === "zweiton" && x.mass.messung)) =>
        k && k.wirkung.geheilt ? Object.assign(k, { wirkung: { ...k.wirkung, mangel: { befund: k.wirkung.geheilt.befund, quelle: k.wirkung.geheilt.quelle }, geheilt: undefined } }) : k;
    // die Zeile des Mangels (Zweiton mit Messung; ein geheilter öffnet für den Fall wieder, A3) als geheilt erklären — das Maß bleibt
    const heile = (t, bildPaar) => {
        const k = mitMangel(t);
        k.wirkung.geheilt = { befund: k.wirkung.mangel.befund, quelle: k.wirkung.mangel.quelle, warum: "x", bildPaar };
        delete k.wirkung.mangel;
    };
    // DIE MASSE DES MANGELS: das Raster aus zwei Tönen ist Zweiton 1, ein Verlauf 0, Bilder ohne Muster 0; die
    // Stufen-Treue ohne Stufen-Wechsel ist ein Bruch, mit Wechsel ein Verhältnis; das Gesicht nennt den Zug außerhalb
    const zw = klassenMasse(
        bild((x, y) => ((x + y) & 1 ? 40 : 200)),
        new Uint8Array(W * H).fill(1),
        W,
        H
    );
    if (!(zw.zweiton > 0.99)) v.push(`Maß zweiton: das Schachbrett zweier Töne ${zw.zweiton} statt 1`);
    if (
        klassenMasse(
            bild((x) => 40 + x * 8),
            new Uint8Array(W * H).fill(1),
            W,
            H
        ).zweiton !== 0
    )
        v.push("Maß zweiton: ein Verlauf trägt Raster");
    const zb = sollRechnung({ art: "zweiton1f", beta: [0, 2.4] });
    if (!(zb.band && zb.band[1] === 0))
        v.push(`Rechnung zweiton1f: Bilder ohne Muster tragen Raster (${JSON.stringify(zb)})`);
    // DIE KANTE DER SILHOUETTE: die Karte (ein Quadrat, gerade und gedreht gleich) liest gerade, der Umriss einer
    // Höhenlinie natürlichen Rauschens (1/f^β, β 1–3: Mischwald 0,160 ≈ β 2,4, Rudka 0,218 ≈ β 3) zerfranst und im Band der
    // Laub-Silhouette; nur der Rand gegen das Außen zählt
    {
        const n = 128,
            F0 = new Uint8Array(n * n * 4),
            q0 = new Uint8Array(n * n),
            q1 = new Uint8Array(n * n),
            halb = new Uint8Array(n * n);
        for (let y = 0; y < n; y++)
            for (let x = 0; x < n; x++) {
                if (x >= 24 && x < 104 && y >= 24 && y < 104) q0[y * n + x] = 1;
                const u = (x - 64) * 0.8 + (y - 64) * 0.6,
                    w = -(x - 64) * 0.6 + (y - 64) * 0.8;
                if (Math.abs(u) < 40 && Math.abs(w) < 40) q1[y * n + x] = 1;
                halb[y * n + x] = x < 64 ? 1 : 0;
            }
        const kq = klassenMasse(F0, q0, n, n),
            kd = klassenMasse(F0, q1, n, n);
        if (!(kq.kante > 0.75 && Math.abs(kq.kante - kd.kante) < 0.05))
            v.push(`Maß kante: die Karte liest ${kq.kante}, gedreht ${kd.kante} (Soll > 0,75, gleich)`);
        const ka = klassenMasse(F0, q0, n, n, halb);
        if (!(ka.kr > 0 && ka.kr < 0.6 * kq.kr)) v.push(`Maß kante: der Rand zählt ${ka.kr} von ${kq.kr} Pixeln, nur das Außen zählt`);
        // DER STRICH (haar.K1/K2): Streifen in der Karte (vor Schwarz — der Rand trägt nichts) → ≥ 0,9 und gedreht gleich,
        // weißes Rauschen → ≤ 0,2, die glatte Karte trägt keinen
        const streif = (a) =>
            klassenMasse(Uint8Array.from({ length: n * n * 4 }, (_, i) => (i % 4 > 2 ? 255 : q0[i >> 2] ? 128 + 80 * Math.sin(0.9 * (((i >> 2) % n) * Math.cos(a) + (i >> 2) / n * Math.sin(a))) : 0)), q0, n, n).strich;
        const sk = [streif(0), streif(0.6), klassenMasse(rauschBild(n, 0, 7919), q0, n, n).strich, kq.strich];
        if (!(sk[0] >= 0.9 && Math.abs(sk[0] - sk[1]) < 0.05 && sk[2] <= 0.2 && sk[3] === null))
            v.push(`Maß strich: Streifen ${sk[0]}, gedreht ${sk[1]}, Rauschen ${sk[2]}, glatt ${sk[3]}`);
        const linie = (beta) => {
            let s = 0;
            for (let saat = 1; saat <= 4; saat++) {
                const R = rauschBild(n, beta, 7919 * saat);
                const v0 = [];
                for (let p = 0; p < n * n; p++) v0.push(R[p * 4]);
                const med = v0.sort((a, b) => a - b)[(n * n) >> 1];
                const m = new Uint8Array(n * n);
                for (let p = 0; p < n * n; p++) m[p] = R[p * 4] > med ? 1 : 0;
                s += klassenMasse(R, m, n, n).kante;
            }
            return s / 4;
        };
        const l1 = linie(1),
            l24 = linie(2.4),
            l3 = linie(3);
        const lb = (tafel && tafel.klassen ? tafel.klassen : []).find((k) => k.id === "laub-kante");
        const grenze = lb ? ((lb.soll.eigenschaften || []).find((e) => e.groesse === "kante") || {}).band : null;
        if (!(l1 < l24 && l24 < l3 && l3 < kq.kante)) v.push(`Maß kante: β 1 ${l1} · 2,4 ${l24} · 3 ${l3} steigt nicht bis zur Karte`);
        if (grenze && !(l24 <= grenze[1])) v.push(`Maß kante: die Höhenlinie β 2,4 (${l24}) liegt über dem Band der Laub-Silhouette`);
    }
    const stufeMe = (namen) => ({
        werkzeug: "bild",
        datum: "x",
        stand: { sha: "x" },
        geraet: { adapter: "x" },
        leinwand: [100, 100],
        schwelle: 18,
        rauschen: { anteil: 0 },
        klassen: Object.fromEntries(namen.map(([n, l]) => [n, { pixel: 400, luma: l }])),
    });
    // MILCHWEISS: ein unbunt-heller Fleck liest 1 (auch ohne Ausbrand), ein bunter 0, Mittelgrau unter der 18-%-Karte 0; die
    // Stufen des Kerns: eine Stufe ohne Schuss lässt das Maß offen, ein Schuss mit den Toren in fremder Stufe ist ein Bruch
    // `zielTon`: das Bild ohne Film (D8) — die Membran zeigt nur ihr Ziel; ein weißer Fleck über einem weißen Ziel ist keine Milch
    const fleck = (ton, zielTon) => {
        const bild = (t) => {
            const F = new Uint8Array(W * H * 4);
            for (let p = 0; p < W * H; p++) F.set([t[0], t[1], t[2], 255], p * 4);
            return F;
        };
        return klassenMasse(bild(ton), new Uint8Array(W * H).fill(1), W, H, null, zielTon ? bild(zielTon) : null);
    };
    if (!(fleck([200, 200, 202]).weiss === 1 && fleck([99, 99, 99]).weiss === 0 && fleck([60, 140, 200]).weiss === 0))
        v.push(
            `Maß milchweiss: Weiß ${fleck([200, 200, 202]).weiss} statt 1, Grau 99 ${fleck([99, 99, 99]).weiss} und Blau ${fleck([60, 140, 200]).weiss} statt 0`
        );
    // das Ziel der Apertur-Schüsse ist bunt (Himmelblau), solange der Fall kein anderes nennt
    const BLAU = [60, 140, 200];
    const apMe = (stufe, ton, zielTon = BLAU) =>
        Object.assign(stufeMe([]), {
            klassen: { [`f:tor:L${stufe}`]: { pixel: 400, luma: 100 }, "portal-membran": fleck(ton, zielTon) },
        });
    // die Stufe 3 ist (wie im Kern der Tore) eine NUR-WURF-Stufe: ihr Schuss zeigt die Fernform — die Apertur ohne Tor-Mesh
    const fernMe = (ton, zielTon = BLAU) =>
        Object.assign(stufeMe([]), { klassen: { "portal-membran": fleck(ton, zielTon) } });
    const rcW = {
        apertur: "^portal-membran$",
        tor: "^(?:f|fimp):tor:L(\\d)$",
        stufen: { datei: "x.js", symbol: "CFG", feld: "lod.stufen", budget: "lod.budget", ab: 1 },
    };
    const qW = {
        kern: (d, s) =>
            d === "x.js" && s === "CFG" ? { lod: { stufen: [0, 1, 3], budget: { 1: {}, 3: { nurWurf: true } } } } : undefined,
    };
    const mw = (messung, zelle) => MASS_RECHNER.milchweiss({ messung, rechnung: rcW, zelle }, qW);
    const mwVoll = mw({ L1: apMe(1, [235, 235, 236]), L3: fernMe([200, 200, 200]) });
    if (!(mwVoll.ist === 1 && !mwVoll.offen && /portal-membran/.test(mwVoll.taeter || "")))
        v.push(`Maß milchweiss: zwei weiße Stufen lesen ${mwVoll.ist}${mwVoll.fehler ? " — " + mwVoll.fehler : ""}`);
    if (mw({ L1: apMe(1, [120, 60, 150]), L3: fernMe([60, 140, 200]) }).ist !== 0)
        v.push("Maß milchweiss: bunte Membranen lesen nicht 0");
    const mwMesh3 = mw({ L1: apMe(1, [235, 235, 236]), L3: apMe(3, [200, 200, 200]) });
    if (!(mwMesh3.fehler && /nurWurf/.test(mwMesh3.fehler)))
        v.push("Maß milchweiss: ein Tor-Mesh in der NUR-WURF-Stufe L3 nicht beim Namen");
    const mwBlind = mw({ L1: apMe(1, [235, 235, 236]), L3: stufeMe([["himmel", 180]]) });
    if (!(mwBlind.fehler && /L3: der Schuss zeigt keine Apertur/.test(mwBlind.fehler)))
        v.push("Maß milchweiss: ein Fern-Schuss ohne Apertur nicht beim Namen");
    const halb = { L1: apMe(1, [235, 235, 236]) },
        mwHalb = mw(halb);
    if (!(mwHalb.offen && /L3 ohne Schuss/.test(mwHalb.offen)))
        v.push(`Maß milchweiss: die Stufe L3 ohne Schuss nicht beim Namen (${mwHalb.offen || mwHalb.fehler})`);
    // DIE ZELLE AM SPAWN (`mass.zelle`) urteilt den Schuss ihrer Stufe allein
    if (mw(halb, true).offen !== null) v.push("Maß milchweiss: die Zelle verlangt fremde Stufen");
    const mwFremd = mw({ L3: apMe(1, [235, 235, 236]) });
    if (!(mwFremd.fehler && /in Stufe L1/.test(mwFremd.fehler)))
        v.push("Maß milchweiss: ein Schuss L3 mit Toren in L1 nicht beim Namen");
    // DIE MILCH DES FILMS (D8): eine weiße Öffnung über einem weißen Ziel ist das Ziel, keine Milch; über einem bunten Ziel Milch;
    // ein Schuss ohne das Bild ohne Film ist vor D8 gemessen (ein blasses Ziel läse als Milch)
    const mwBlass = mw({ L1: apMe(1, [235, 235, 236], [236, 236, 236]), L3: fernMe([200, 200, 200], [201, 201, 201]) });
    if (mwBlass.ist !== 0)
        v.push(`Maß milchweiss: ein weißes Ziel liest als Milch (${mwBlass.ist}${mwBlass.fehler ? " — " + mwBlass.fehler : ""})`);
    const mwOhne = mw({ L1: apMe(1, [235, 235, 236], null), L3: fernMe([200, 200, 200], null) });
    if (!(mwOhne.fehler && /ohne Film/.test(mwOhne.fehler)))
        v.push("Maß milchweiss: ein Schuss ohne das Bild ohne Film nicht beim Namen");
    // OEFFNUNG-BUNT (D8): die milchige Öffnung liest unter 5, die bunte (Rotviolett) über 20, der Täter ist die unbunteste Klasse
    if (!(fleck([200, 200, 202]).bunt < 5 && fleck([120, 60, 150]).bunt > 20))
        v.push(`Maß oeffnungBunt: Weiß C*ab ${fleck([200, 200, 202]).bunt}, Violett ${fleck([120, 60, 150]).bunt}`);
    const ob = (messung) => MASS_RECHNER.oeffnungBunt({ name: "oeffnungBunt", messung, rechnung: rcW }, qW);
    const obMilch = ob({ L1: apMe(1, [235, 235, 236]), L3: fernMe([200, 200, 200]) });
    const obBunt = ob({ L1: apMe(1, [120, 60, 150]), L3: fernMe([60, 140, 200]) });
    if (!(obMilch.ist < 5 && obBunt.ist > 20 && /portal-membran/.test(obMilch.taeter || "")))
        v.push(`Maß oeffnungBunt: Milch ${obMilch.ist}${obMilch.fehler ? " — " + obMilch.fehler : ""}, bunt ${obBunt.ist}`);
    // ZIEL-TREUE (D8): r je Klasse gewichtet mit ihren Pixeln; ohne Ziel-Panorama r 0 und der Grund beim Namen; ohne `ziel` vor D8
    const zt = (messung) => MASS_RECHNER.zielTreue({ name: "zielTreue", messung, rechnung: rcW }, qW);
    const mitZiel = (me, ziel) => {
        me.klassen["portal-membran"] = Object.assign({}, me.klassen["portal-membran"], { ziel });
        return me;
    };
    const ztTreu = zt({
        L1: mitZiel(apMe(1, [120, 60, 150]), { r: 0.8, pixel: 300 }),
        L3: mitZiel(fernMe([60, 140, 200]), { r: 0.6, pixel: 100 }),
    });
    const ztLeer = zt({
        L1: mitZiel(apMe(1, [120, 60, 150]), { r: null, pixel: 400, grund: "kein Ziel-Panorama" }),
        L3: mitZiel(fernMe([60, 140, 200]), { r: 0.9, pixel: 400 }),
    });
    const ztAlt = zt({ L1: apMe(1, [120, 60, 150]), L3: fernMe([60, 140, 200]) });
    if (!(ztTreu.ist === 0.75 && ztLeer.ist === 0.45 && /kein Ziel-Panorama/.test(ztLeer.taeter || "")))
        v.push(`Maß zielTreue: treu ${ztTreu.ist} statt 0,75, leer ${ztLeer.ist} statt 0,45 (${ztLeer.taeter})`);
    if (!(ztAlt.fehler && /vor D8/.test(ztAlt.fehler))) v.push("Maß zielTreue: ein Schuss ohne Ziel nicht beim Namen");
    const ge = MASS_RECHNER.gesicht(
        { messung: Object.assign(stufeMe([["spieler:kopf/haut", 100]]), { gesicht: { augeFrei: 0.45, lippeA: 6 } }) },
        q,
        [1, 1],
        { felder: { augeFrei: [0.9, 1], lippeA: [4, 14] } }
    );
    if (!(ge.ist === 0.5 && /augeFrei 0\.45/.test(ge.taeter || "")))
        v.push(`Maß gesicht: halb im Band liest ${ge.ist}, Täter ${ge.taeter}`);
    if (!Number.isFinite(Math.log((0 + MASS_AUFLOESUNG.zweiton) / (0 + MASS_AUFLOESUNG.zweiton))))
        v.push("Auflösung: ein Rand 0 ist unendlich");
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
        [
            "Rauschen über der Wand",
            (t) => (mitMessung(t).mass.messung.rauschen.anteil = 0.05),
            "hält ihr Rauschen nicht",
        ],
        ["Albedo-Zeile fehlt", (t) => (mitAlbedo(t).mass.rohdatei.zeile = "phantom"), '„phantom" ohne Ist'],
        [
            "Vorlage ins Leere",
            (t) => (finde(t, (k) => (k.vorlage || []).length).vorlage[0].symbol = "PHANTOM_ATLAS"),
            "Vorlage",
        ],
        ["Klasse ohne Quellen", (t) => delete t.klassen[0].quellen, "ohne quellen"],
        ["Mangel ohne Quelle", (t) => (mitMangel(t).wirkung.mangel.quelle = ""), "ohne Befund oder Quelle"],
        [
            "das Maß sieht den benannten Mangel nicht",
            (t) => {
                const k = mitMangel(t);
                for (const z of Object.values(k.mass.messung.klassen)) z.zweiton = 0;
                frisch(k, k.mass.messung);
            },
            "es sieht ihn nicht",
            "zeile",
        ],
        ["geheilt ohne Bild-Paar", (t) => heile(t, []), "ohne Befund, Quelle, Warum oder Bild-Paar"],
        // Prüfer K63 R3: die weiße Tafel der Tore hieß geheilt, das heutige Bild zeigte sie — geheilt neben einem ROTEN Maß; A10
        //: boden-nah-farbe hieß geheilt, die Neumessung 9,27 < 10,7 — die Zeile ROT „er ist zurück", der Schreiber schreibt
        [
            // das Maß FRISCH gestempelt (am heutigen Code), sonst stünde es veraltet und der Widerspruch ruhte bis zur Neumessung
            "geheilt neben einem roten Maß",
            (t) => {
                const k = mitMangel(t);
                for (const z of Object.values(k.mass.messung.klassen)) z.zweiton = 1; // jedes Pixel im Raster: ROT, was die Tafel auch misst
                frisch(k, k.mass.messung);
                heile(t, ["artifacts/soll-tafel/a.png", "artifacts/soll-tafel/b.png"]);
            },
            "heißt geheilt, das Maß zweiton ist ROT — er ist zurück",
            "zeile",
        ],
        // K63-n8: das Bild der Messung im Scratch (AppData) — ein Verweis aus dem Baum hinaus
        [
            "Bild im Scratch",
            (t) => (mitMessung(t).mass.messung.bild = "../../../../AppData/Local/Temp/claude/x/boden.png"),
            "liegt nicht unter artifacts/",
        ],
        ["Bild-Paar außerhalb", (t) => heile(t, ["C:/Users/x/a.png", "artifacts/soll-tafel/b.png"]), "liegt nicht unter artifacts/"],
        ["Schuss ins Leere", (t) => (mitMessung(t).mass.messung = "phantom:L1"), 'Schuss „phantom:L1" fehlt'],
    ];
    // ein Fall „zeile" (Maß gegen den Stand der Klasse) urteilt die ZEILE ROT beim Namen, und der Schreiber `--ist` schreibt ihn
    for (const [name, fn, wort, zeile] of faelle) {
        if (!tafel || !(tafel.klassen || []).length) break;
        const t = klon();
        try {
            fn(t);
        } catch (e) {
            v.push(`Tafel-Bruch „${name}": die Tafel trägt keinen Fall dafür (${e.message})`);
            continue;
        }
        const u = sollTafelUrteil(t, q);
        const ab = zeile ? sollIstAbweisung(klon(), t, q) : [];
        const beimNamen = zeile
            ? !ab.length && u.zeilen.some((z) => z.urteil === "ROT" && (z.grund || "").includes(wort))
            : !u.ok && u.fehler.some((f) => f.includes(wort));
        if (!beimNamen) v.push(`Tafel-Bruch „${name}": nicht beim Namen (${[...u.fehler, ...ab].join(" · ") || "grün"})`);
    }
    // DER EINE SCHUSS (W1-n1): die Zeile, die den Schuss einer anderen NENNT, liest dasselbe Ist wie sein Träger
    const tn = klon(),
        kn = mitMessung(tn) || {};
    (tn.klassen || []).push(Object.assign(JSON.parse(JSON.stringify(kn)), { id: "x-name", mass: Object.assign({}, kn.mass, { messung: kn.id }) }));
    const istN = sollTafelUrteil(tn, q).zeilen.filter((z) => z.id === kn.id || z.id === "x-name").map((z) => z.ist);
    if (!(istN.length === 2 && istN[0] != null && istN[0] === istN[1])) v.push(`der Name eines Schusses liest nicht dessen Ist (${istN})`);
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
        const k3 = finde(t3, (k) => k.mass && k.mass.name === "laiWirk" && k.mass.messung);
        if (k3) frisch(k3, k3.mass.messung);
        if (k3 && k3.mass.name === "laiWirk") {
            const ab = k3.mass.messung.abstand.klassen;
            for (const n of Object.keys(ab)) if (new RegExp(k3.mass.rechnung.grund).test(n)) ab[n] = ab[n].map(() => 0);
            const z3 = sollTafelUrteil(t3, q).zeilen.find((x) => x.id === k3.id);
            if (!z3 || z3.urteil !== "GRÜN") v.push(`${k3.id}: eine Wiese ohne Lücke ist nicht GRÜN (${z3 && z3.ist})`);
        }
    }
    // DER STRICH IN DER TAFEL (haar.K1/K2): fell frisch gemessen im Band der REF GRÜN, darunter ROT; haar trägt daneben die
    // Albedo seiner Zeile — fehlt sie in der Albedo-Tafel, ist es ROT mit ihrem Namen, nie GRÜN
    if (tafel && finde(klon(), (k) => k.id === "haar")) {
        const t5 = klon(),
            z5 = (id, s) => {
                const k = finde(t5, (x) => x.id === id);
                k.mass.messung = { werkzeug: "bild", datum: 1, geraet: {}, leinwand: [9, 9], schwelle: 1, rauschen: { anteil: 0 }, klassen: { w: { pixel: 9, strich: s, si: 9 } } };
                frisch(k, k.mass.messung);
                return sollTafelUrteil(t5, q).zeilen.find((x) => x.id === id);
            };
        const [fg, fr, hr] = [z5("fell", 0.54), z5("fell", 0.2), z5("haar", 0.44)];
        if (!(fg.urteil === "GRÜN" && fr.urteil === "ROT" && hr.urteil === "ROT" && /albedo: /.test(hr.grund)))
            v.push(`Maß strich: fell 0,54 ${fg.urteil} (${fg.grund}), 0,2 ${fr.urteil}, haar ohne Albedo-Zeile ${hr.urteil} (${hr.grund})`);
    }
    if (tafel && mitMangel(klon())) {
        const t4 = klon();
        const k4 = mitMangel(t4);
        for (const z of Object.values(k4.mass.messung.klassen)) z.zweiton = 0;
        frisch(k4, k4.mass.messung);
        k4.wirkung.mangel = undefined;
        const gruen = sollTafelUrteil(t4, q).zeilen.find((x) => x.id === k4.id);
        const zeile = (qq) => sollTafelUrteil(t4, qq).zeilen.find((x) => x.id === k4.id);
        // DER CODE-ABDRUCK: die erste Quelle der Klasse mit einer Kommentarzeile und neuem Leerraum → derselbe Stand
        // (GRÜN bleibt GRÜN); mit einem Token mehr → ROT „veraltet seit <Commit der Messung>" beim Namen der Datei
        const d0 = (k4.quellen || [])[0];
        const text0 = d0 && q.lesen ? q.lesen(d0) : null;
        const mitText = (neu) => Object.assign({}, q, { pruefsumme: (d) => (d === d0 ? codeAbdruck(neu, d) : q.pruefsumme(d)) });
        const kommentar = text0 && zeile(mitText(text0.replace("\n", "\n// eine Kommentarzeile\n\n   \n") + "\n/* Block */\n"));
        const code = text0 && zeile(mitText(text0 + "\n;0;\n"));
        // die Version des Stamms ist Beleg, kein Stand: eine Messung an V17.0.0 mit heutigem Abdruck bleibt GRÜN
        k4.mass.messung.stand.version = "17.0.0";
        const version = zeile(q);
        frisch(k4, k4.mass.messung);
        if (d0) k4.mass.messung.quellen[d0] = "0000000000000000";
        const altForm = zeile(q);
        frisch(k4, k4.mass.messung);
        delete k4.mass.messung.stand.sha;
        const ohneSha = zeile(q);
        if (!gruen || gruen.urteil !== "GRÜN")
            v.push(`Stand: die frische Messung ohne Raster ist nicht GRÜN (${gruen && gruen.grund})`);
        if (!text0) v.push(`Stand: die Quelle ${d0} der Klasse ${k4.id} ist nicht zu lesen`);
        else {
            if (!kommentar || kommentar.urteil !== "GRÜN")
                v.push(`Stand: eine Kommentarzeile in ${d0} veraltet die Messung (${kommentar && kommentar.grund})`);
            const sha8 = String(k4.mass.messung.stand.sha || gruen.stand || "").slice(0, 8);
            if (!code || code.urteil !== "ROT" || !/veraltet seit [0-9a-f]{8}/.test(code.grund || "") || !code.grund.includes(d0))
                v.push(`Stand: ein Token mehr in ${d0} bleibt GRÜN oder nennt Commit und Datei nicht (${code && code.grund}; ${sha8})`);
        }
        if (!version || version.urteil !== "GRÜN") v.push(`Stand: eine Messung an V17.0.0 mit heutigem Code ist ROT (${version && version.grund})`);
        if (d0 && (!altForm || altForm.urteil !== "ROT" || !/alter Form/.test(altForm.grund || "")))
            v.push(`Stand: eine Prüfsumme alter Form für ${d0} bleibt GRÜN`);
        if (!ohneSha || ohneSha.urteil !== "ROT" || !/keinen Commit/.test(ohneSha.grund || ""))
            v.push("Stand: eine Messung ohne Commit bleibt GRÜN");
    }
    // eine Stufe des Kerns ohne Schuss: das Maß bleibt offen — ROT mit der Stufe beim Namen, auch wenn sein Ist im Band läge
    const t5 = klon();
    const k5 = finde(t5, (k) => k.mass && k.mass.name === "milchweiss" && k.mass.messung);
    if (k5) {
        // die letzte Stufe fällt, solange eine bleibt (trägt die Tafel nur eine, fehlt die nächste des Kerns schon)
        const st5 = Object.keys(k5.mass.messung).filter((s) => /^L\d$/.test(s));
        if (st5.length > 1) delete k5.mass.messung[st5.pop()];
        for (const s of st5) {
            frisch(k5, k5.mass.messung[s]);
            for (const z of Object.values(k5.mass.messung[s].klassen)) if (z.wt != null) z.wt = 0;
        }
        delete k5.wirkung.mangel;
        delete k5.wirkung.geheilt;
        const z5 = sollTafelUrteil(t5, q).zeilen.find((x) => x.id === k5.id);
        if (!z5 || z5.urteil !== "ROT" || !/ohne Schuss/.test(z5.grund || ""))
            v.push(`${k5.id}: eine Stufe ohne Schuss ist nicht ROT beim Namen (${z5 && z5.urteil} ${z5 && z5.grund})`);
    } else v.push("die Tafel trägt kein Maß milchweiss mit Messung (der Fall der Stufen fehlt)");
    // DIE LICHT-BILANZ (D3): eine azimut-konstante Umgebung (zur Sonne = von ihr weg, die CPU-gemalte vor D3) hält das
    // Licht-Verhältnis ROT beim Namen umgebungAzimut, auch wenn das Verhältnis im Band liegt; ein Schatten mit einem Viertel
    // der Sonne (0,239 vor D3) beim Namen schattenAnteil; Verhältnis, Schatten und Richtung im Band sind GRÜN
    const t7 = klon();
    const k7 = finde(t7, (k) => k.mass && k.mass.name === "lichtVerhaeltnis" && k.mass.messung);
    if (k7 && ((k7.soll && k7.soll.eigenschaften) || []).some((e) => e.groesse === "umgebungAzimut")) {
        const me7 = k7.mass.messung;
        frisch(k7, me7);
        const fall = (werte) => {
            Object.assign(me7, werte);
            return sollTafelUrteil(t7, q).zeilen.find((x) => x.id === k7.id) || {};
        };
        const flach = fall({ E_alle: 7.8, E_umgebung: 1.5, E_umgebung_zurSonne: 1.0, E_umgebung_vonSonne: 1.0 });
        if (flach.urteil !== "ROT" || !/umgebungAzimut/.test(flach.grund || ""))
            v.push(`${k7.id}: eine azimut-konstante Umgebung ist nicht ROT beim Namen (${flach.urteil} ${flach.grund})`);
        const schatten = fall({ E_alle: 7.8, E_umgebung: 1.5 * 1.0, E_umgebung_zurSonne: 1.4 });
        const viertel = fall({ E_alle: 6.0, E_umgebung: 1.2 * 1.0, E_umgebung_zurSonne: 1.4 });
        if (schatten.urteil !== "GRÜN")
            v.push(`${k7.id}: Verhältnis 5,2 · Schatten 0,19 · Richtung 1,4 ist nicht GRÜN (${schatten.urteil} ${schatten.grund})`);
        if (viertel.urteil !== "GRÜN" || !(viertel.ist === 5))
            v.push(`${k7.id}: Verhältnis 5,0 · Schatten 0,20 am Rand ist nicht GRÜN (${viertel.urteil} ${viertel.grund})`);
        const vorher = fall({ E_alle: 9.44, E_umgebung: 2.26, E_umgebung_zurSonne: 2.29, E_umgebung_vonSonne: 2.29 });
        if (vorher.urteil !== "ROT" || !/schattenAnteil 0\.239/.test(vorher.grund || "") || !/umgebungAzimut 1/.test(vorher.grund || ""))
            v.push(`${k7.id}: die Licht-Bilanz vor D3 nennt Schatten und Richtung nicht (${vorher.urteil} ${vorher.grund})`);
    } else v.push("die Tafel trägt das Licht-Verhältnis ohne umgebungAzimut (der Fall der Licht-Bilanz fehlt)");
    // DER SCHREIBER PRÜFT (K63-n7, `sollIstAbweisung`): eine Messung, die nur Membran und Nebel zeigt — dieselbe Messung ohne die Tore der Stufe wird abgewiesen beim Namen; dieselbe Messung unverändert nicht
    const t6 = klon();
    const k6 = finde(t6, (k) => k.mass && k.mass.name === "milchweiss" && k.mass.messung);
    const s6 = k6 && Object.keys(k6.mass.messung).find((s) => /^L\d$/.test(s) && !/^L3$/.test(s));
    if (k6 && s6) {
        const torRe = new RegExp(k6.mass.rechnung.tor);
        for (const n of Object.keys(k6.mass.messung[s6].klassen))
            if (torRe.test(n)) delete k6.mass.messung[s6].klassen[n];
        const ab = sollIstAbweisung(klon(), t6, q);
        if (!ab.some((g) => g.includes(`${s6}: der Schuss zeigt kein Tor`)))
            v.push(`Schreiber: ein Schuss ${s6} ohne Tor der Stufe fiele in die Tafel (${ab.join(" · ") || "keine Abweisung"})`);
        const gleich = sollIstAbweisung(klon(), klon(), q);
        if (gleich.length) v.push(`Schreiber: die unveränderte Messung wird abgewiesen (${gleich.join(" · ")})`);
    } else v.push("die Tafel trägt kein Maß milchweiss mit Mesh-Stufe (der Fall des Schreibers fehlt)");
    if (sollTafelUrteil({ klassen: [] }, q).ok) v.push("die leere Tafel ist grün");
    return v;
}

// DER SCHREIBER PRÜFT (K63-n7; Prüfer K63-2 Rot B: ein L1-Schuss 14 s nach dem Umstellen zeigte nur Membran und Nebel, das
// Werkzeug schrieb ihn, die Linse las ihn nicht — tor-fern blieb auf dem Ist von 5a912d6e stehen): eine Messung fällt in die
// Tafel nur, wenn die Linse sie liest — sie bringt der Klasse keinen neuen Bruch, und wo vorher ein Ist stand, steht wieder eines.
// `alt` und `neu` sind die Tafel vor und nach dem Schreiben; zurück die Gründe der Abweisung (leer = schreiben). Geprüft wird
// JEDE Zeile (W1-n1, `schussVon`): wer den Schuss eines Ziels nennt, liest den neuen mit.
function sollIstAbweisung(alt, neu, q) {
    const a = sollTafelUrteil(alt, q),
        n = sollTafelUrteil(neu, q);
    const altF = new Set(a.fehler);
    const gruende = n.fehler.filter((f) => !altF.has(f));
    for (const za of a.zeilen)
        if (za.ist != null && !n.zeilen.some((x) => x.id === za.id && x.ist != null))
            gruende.push(`Klasse ${za.id}: die Messung ergibt kein Ist (vorher ${za.ist})`);
    return gruende;
}

module.exports = {
    SCHWELLEN,
    armUrteil,
    klassenMasse,
    sollTafelUrteil,
    standLeser,
    codeAbdruck,
    ABDRUCK,
    messStand,
    sollTafelZeile,
    sollTafelSelbsttest,
    sollIstAbweisung,
    abnahmeUrteil,
    pngLesen,
    fixtureMessung,
    abnahmeSelbsttest,
    srgbLin,
    linSrgb,
    luma709,
    cielab,
    ABNAHME_INSTALL:
        `window.__abnahmeUrteil = (m) => (${abnahmeUrteil.toString()})(m, ${JSON.stringify(SCHWELLEN)});` +
        `window.srgbLin = ${srgbLin};` +
        `window.linSrgb = ${linSrgb};` +
        `window.luma709 = ${luma709};` +
        `window.cielab = ${cielab};` +
        `window.__bildMasse = ${bildMasse.toString()};` +
        `window.__klassenTeilung = ${klassenTeilung.toString()};` +
        `window.__bildRauschen = ${bildRauschen.toString()};` +
        `window.spiegelPearson = ${spiegelPearson.toString()};` +
        `window.spiegelPartner = ${spiegelPartner.toString()};` +
        `window.__spiegelDaten = ${spiegelDaten.toString()};` +
        `window.__klassenMasse = ${klassenMasse.toString()};` +
        `window.__gesichtMasse = ${gesichtMasse.toString()};` +
        `window.__farbtonProbe = ${farbtonProbe.toString()};`,
};
