// zug/a-spawn.cjs — DIE ZELLEN AM SPAWN (Pflicht A: „jede sichtbare Klasse der Soll-Tafel hält ihr Soll am HEUTIGEN Bild aus
// dem Ausgabe-Pfad, aus jeder Perspektive"). Die Station zug/a-spawn.sh fährt es an der OMEN; lokal fährt es jede Werkbank.
//
//   node zug/a-spawn.cjs messen --baum <Baum> --port <Werkbank> --ordner <d> [--sicht ego,third] [--uhr 0.5,0.3,0] [--blicke 8] [--nur <ids>]
//   node zug/a-spawn.cjs urteil --baum <Baum> --ordner <d>      die Tafel Klasse × Zelle (Text, <d>/tafel.json), Exit 1 bei ROT
//   node zug/a-spawn.cjs selbsttest --baum <Baum>               die Täter des Urteils beim Namen, ohne Welt
//
// DIE ZELLE = Sicht × Abstand × Uhr am Genesis-Ort (`umstellen --ort genesis`, der Spieler an `_genesisMitte`, die Ankunft):
//   Sicht   die Kamera des Spiels (`_loopCamera`, Neigung 0): Ego im Auge, Third am Arm (`cameraThirdDistance`). Der Blick neigt
//           sich nie zum Boden — die Plattform (13 × 13 m, 2,4 m unter dem Auge) füllte ab 10° Neigung über 25 % des Bilds näher
//           als der halbe Ziel-Abstand, die Abnahme K32 nähme kein solches Bild.
//   Abstand DIE WAHL zur ersten Uhr: acht Blicke je 45° ab der Ankunft (0, +45, −45, +90 …), je Blick EIN Schuss aller Ausdrücke
//           (nur Pixel) und der Median der Tiefe je Teil-Klasse (`__letzteTeilung` × `__letzteSpiegel` des Schusses) — nah ist der
//           erste Blick, der die Klasse näher als 30 m zeigt, fern der erste, der sie dahinter zeigt — je auf ≥ 0,1 % des Bilds;
//           die Tiere stehen (`__tiereHalten`). Der Blick hält für jede Uhr.
//   Uhr     die Bühne hält sie (`bild --uhr`): Mittag 0,5, tiefe Sonne 0,3, Nacht 0.
// Je Zelle und Ausdruck der Tafel EIN Bild aus dem Ausgabe-Pfad (`/bild` mit der Teilung der Klasse, `messung`: der Block, den
// `--ist` in die Tafel schriebe); Zeilen desselben Ausdrucks teilen den Schuss. Der Kopf: Ego zeigt ihn nie (`_applyEgoSicht`),
// Third blickt ihn am Arm des Spiels an (`--gesicht`). Albedo-Zeilen fragen nur ihre Pixel — ihr Maß liest die Albedo-Tafel. Das
// Licht misst `licht` am Mittag (die Bilanz steht unter der Bühne, ihr Soll gilt Mittag klar); zu jeder anderen Uhr ist es ROT.
// DAS URTEIL je Klasse × Zelle ist K5 (`sollTafelUrteil` des Baums) über die Messung der Zelle, gefiltert auf den Ausdruck der Zeile;
// ein Stufen-Maß liest den Schuss als die Stufe, in der er die Tore zeigt (`mass.zelle`). Nicht im Bild ist eine Klasse, die kein
// Blick ihrer Pose zeigt — zeichnet sie in derselben Kamera zu einer anderen Uhr, ist die fehlende Zelle ROT beim Namen.
"use strict";
const fs = require("fs");
const path = require("path");

const arg = (n, d) => {
    const i = process.argv.indexOf("--" + n);
    return i > 0 ? process.argv[i + 1] : d;
};
const BAUM = path.resolve(arg("baum", process.cwd()));
const AU = require(path.join(BAUM, "scripts", "lib", "abnahme-urteil.cjs"));
const TAFEL = JSON.parse(fs.readFileSync(path.join(BAUM, "spec", "abnahme", "soll-tafel.json"), "utf8"));
const LESER = AU.standLeser(BAUM);
const Q = LESER.sollQuelle();
const NAH_M = 30;
// im Bild ist eine Klasse für die Wahl ab einem Tausendstel des Bilds (1920 × 1080: 2 074 Pixel) — die 186 Pixel Fern-Wasser
// hinter dem Tor-Ring der Radeon am 31.10. (Blick 270°) waren kein Wasser, das sich messen ließe
const IM_BILD = 1e-3;

// DER AUSDRUCK EINER ZEILE: die Pixel, die ihr Maß liest — Apertur und Tor ihrer Rechnung (die drei Tor-Zeilen teilen EINEN Schuss),
// sonst der ihrer Messung, die Klasse ihrer Albedo-Zeile (`rohdatei` → `welt.klasse`), das `--klasse` ihres Werkzeugs; null: die
// Zeile misst kein Bild (das Licht). EINE Quelle: die Zelle liest, was die Zeile misst — nie eine zweite Liste von Ausdrücken.
function ausdruck(k) {
    const ma = k.mass || {},
        rc = ma.rechnung || {},
        me = ma.messung && typeof ma.messung === "object" ? ma.messung : {};
    if (rc.apertur && rc.tor) return `${rc.apertur}|${rc.tor}`;
    const a = me.ausdruck || Object.values(me).map((x) => x && x.ausdruck).find(Boolean);
    if (a) return a;
    const ro = ma.rohdatei && Q.lesen(ma.rohdatei.datei),
        z = ro && (JSON.parse(ro).zeilen || []).find((x) => x.id === ma.rohdatei.zeile);
    if (z && z.welt && z.welt.klasse) return z.welt.klasse;
    return (/--klasse '([^']+)'/.exec(ma.werkzeug || "") || [])[1] || null;
}

// DAS URTEIL DER ZELLEN: je Klasse × Zelle K5. Die Zelle trägt je Klasse ihre Messung, `weg` (nicht im Bild) oder `fehlt` (der
// Schuss scheiterte — die Abnahme K32 —, die Uhr hat kein Soll: ROT). Der Mangel und das Bild der Wirkung gehören der Pose der
// Zeile, nie der Zelle (`wirkung: {}`).
function zellenUrteil(tafel, zellen) {
    const px = (me, re) => Object.entries(me.klassen || {}).reduce((s, [n, x]) => s + (re.test(n) ? x.pixel || 0 : 0), 0);
    const zeilen = (tafel.klassen || []).map((k) => {
        const a = ausdruck(k),
            ma = k.mass || {},
            rc = ma.rechnung || {};
        const re = new RegExp(a || "^$"),
            albedo = /^albedo/.test(ma.name);
        const eigen = (o) => Object.fromEntries(Object.entries(o || {}).filter(([n]) => re.test(n)));
        const sieht = (c) => {
            const r = c.klassen[k.id] || {};
            return !!r.messung && (r.messung.werkzeug !== "bild" || px(r.messung, re) > 0);
        };
        const zelle = (c) => {
            const r = c.klassen[k.id] || { fehlt: "ungemessen" };
            const z = { zelle: c.zelle, urteil: "ROT", ist: null, band: null, grund: r.fehlt || null, taeter: null, bild: r.bild || null };
            const um = zellen.filter((d) => d.sicht === c.sicht && d.abstand === c.abstand && sieht(d)).map((d) => d.uhr);
            if (r.weg || (r.messung && !sieht(c)))
                return Object.assign(
                    z,
                    um.length
                        ? { grund: `fehlt um ${c.uhr} (zeichnet in derselben Kamera um ${um.join(", ")})${r.weg ? ": " + r.weg : ""}` }
                        : { urteil: "nicht im Bild", grund: r.weg || `kein Pixel von /${a}/` }
                );
            if (!r.messung) return z;
            let me = albedo ? undefined : r.messung;
            if (me && me.werkzeug === "bild") {
                me = Object.assign({}, me, { klassen: eigen(me.klassen) }, me.abstand ? { abstand: Object.assign({}, me.abstand, { klassen: eigen(me.abstand.klassen) }) } : {});
                if (rc.stufen) {
                    const tor = new RegExp(rc.tor);
                    const st = Object.entries(me.klassen)
                        .map(([n, x]) => [tor.exec(n), x.pixel])
                        .filter(([m]) => m)
                        .sort((x, y) => y[1] - x[1])[0];
                    // ohne Tor im Namen zeigt der Schuss die Fernform: die NUR-WURF-Stufe L3 (porta-core lod.budget.gate[3])
                    me = { [`L${st ? st[0][st[0].length - 1] : 3}`]: me };
                }
            }
            const u = AU.sollTafelUrteil({ klassen: [Object.assign({}, k, { wirkung: {}, mass: Object.assign({}, ma, { messung: me, zelle: true }) })] }, Q);
            const x = u.zeilen[0];
            return Object.assign(z, {
                urteil: x.urteil,
                ist: x.ist,
                band: x.band,
                taeter: x.taeter,
                grund: x.urteil === "GRÜN" ? null : x.ist == null && u.fehler.length ? u.fehler.join(" · ") : x.grund,
            });
        };
        return { id: k.id, mass: ma.name, ausdruck: a, zellen: zellen.map(zelle) };
    });
    return { zeilen };
}

// DIE TAFEL ALS TEXT: je Klasse grün in n von m Zellen im Bild, die roten mit Maß und Täter, die ohne Bild beim Grund
function tafelText(u) {
    const alle = [].concat(...u.zeilen.map((z) => z.zellen)).filter((x) => x.urteil !== "nicht im Bild");
    return u.zeilen
        .map((z) => {
            const im = z.zellen.filter((x) => x.urteil !== "nicht im Bild");
            return [`${z.id} (${z.mass}): grün in ${im.filter((x) => x.urteil === "GRÜN").length} von ${im.length} Zellen im Bild · nicht im Bild ${z.zellen.length - im.length}`]
                .concat(
                    z.zellen
                        .filter((x) => x.urteil !== "GRÜN")
                        .map(
                            (x) =>
                                `  ${x.urteil === "ROT" ? "ROT" : "OHNE BILD"} ${x.zelle}: ${x.ist == null ? "" : `${z.mass} ${x.ist} · `}${x.grund}` +
                                `${x.taeter ? ` · Täter ${x.taeter}` : ""}${x.bild ? ` · ${x.bild}` : ""}`
                        )
                )
                .join("\n");
        })
        .concat(`A AM SPAWN: ${alle.filter((x) => x.urteil === "GRÜN").length} von ${alle.length} Zellen im Bild GRÜN (K5)`)
        .join("\n");
}

// DER SELBSTTEST (ohne Welt, an den echten Zeilen laub-kante und tor-fern des Baums): jede Zeile außer dem Licht trägt einen
// Ausdruck; die gute Zelle ist GRÜN; ein Täter, der das Laub um 0 Uhr aus dem Bild nimmt, ist ROT beim Namen „fehlt um 0"; ein Ist
// über dem Band ROT mit Maß und Täter; ein veralteter Stand ROT; eine Klasse, die keine Uhr ihrer Pose zeigt, „nicht im Bild"; ein
// gescheiterter Schuss ROT mit seinem Grund; das Tor urteilt über die Stufe, die seine Zelle zeigt; der Text zählt.
function selbsttest() {
    const v = TAFEL.klassen.filter((k) => !ausdruck(k) && k.mass.name !== "lichtVerhaeltnis").map((k) => `die Zeile ${k.id} trägt keinen Ausdruck — keine Zelle sähe sie`);
    const [kk, kt] = ["laub-kante", "tor-fern"].map((id) => TAFEL.klassen.find((k) => k.id === id));
    if (!kk || !kt) return v.concat("die Zeilen laub-kante und tor-fern fehlen (die Fälle der Zellen)");
    const quellen = Object.fromEntries([...kk.quellen, ...kt.quellen].map((d) => [d, LESER.pruefsumme(d)]));
    const teil = (kante) => ({ pixel: 4000, kante, kr: 300, wt: 40, wtZiel: 40 });
    const block = (klassen, alt) => ({
        werkzeug: "bild",
        datum: "2026-10-31",
        stand: { version: Q.version, sha: "5e1b5e1b" },
        geraet: { adapter: "selbsttest" },
        leinwand: [160, 90],
        schwelle: 18,
        rauschen: { anteil: 0 },
        klassen,
        quellen: alt ? Object.assign({}, quellen, { [kk.quellen[0]]: "c:0000000000000000" }) : quellen,
    });
    const gut = { "f:tanne:L1": teil(0.15), "fimp:atlas:L2": teil(0.18), "portal-membran": teil(0), "f:drachentor:L2": teil(0) };
    const zelle = (n, r) => ({ zelle: n, sicht: n.split("-")[0], abstand: n.split("-")[1], uhr: +n.split("-")[2], klassen: { "laub-kante": r, "tor-fern": r } });
    const u = zellenUrteil({ klassen: [kk, kt] }, [
        zelle("ego-nah-0.5", { messung: block(gut), bild: "gut.png" }),
        zelle("ego-nah-0.3", { messung: block({ "f:tanne:L1": teil(0.31) }) }),
        zelle("ego-nah-0", { messung: block({ "f:gt:L1": teil(0.5) }) }),
        zelle("ego-fern-0.5", { messung: block(gut, true) }),
        zelle("third-nah-0.5", { weg: "in acht Blicken kein Pixel" }),
        zelle("third-fern-0.5", { fehlt: "ABNAHME ROT [bild.mittel 1.2 < 6]" }),
    ]);
    const soll = (id, n, urteil, re) => {
        const x = u.zeilen.find((z) => z.id === id).zellen.find((c) => c.zelle === n);
        if (x.urteil !== urteil || !re.test(`${x.grund} · ${x.taeter}`)) v.push(`${id} ${n} ist ${x.urteil} (${x.grund} · Täter ${x.taeter}) statt ${urteil} ${re}`);
    };
    soll("laub-kante", "ego-nah-0.5", "GRÜN", /^null/);
    soll("laub-kante", "ego-nah-0.3", "ROT", /^kante 0\.31 > 0\.22 · f:tanne:L1/);
    soll("laub-kante", "ego-nah-0", "ROT", /^fehlt um 0 \(zeichnet in derselben Kamera um 0\.5, 0\.3\)/);
    soll("laub-kante", "ego-fern-0.5", "ROT", /veraltet seit 5e1b5e1b/);
    soll("laub-kante", "third-nah-0.5", "nicht im Bild", /^in acht Blicken kein Pixel/);
    soll("laub-kante", "third-fern-0.5", "ROT", /^ABNAHME ROT \[bild\.mittel 1\.2 < 6\]/);
    soll("tor-fern", "ego-nah-0.5", "GRÜN", /^null/);
    if (!/^laub-kante \(kante\): grün in 1 von 5 Zellen im Bild · nicht im Bild 1\n {2}ROT ego-nah-0\.3: kante 0\.31/.test(tafelText(u)))
        v.push(`der Text zählt falsch: ${tafelText(u).split("\n").slice(0, 2).join(" | ")}`);
    return v;
}

// DER MEDIAN DER TIEFE je Teil-Klasse des letzten Schusses (in der Seite): die Teilung des Schusses (`__letzteTeilung`, je Pixel
// 1 + Index des Namens) über der Tiefe seines Szenen-Passes (`__letzteSpiegel`, dieselbe Pose) — ohne Tiefe (Himmel) unendlich fern
const TIEFE_JE_KLASSE = `const { teil, namen, W, H } = window.__letzteTeilung, S = window.__letzteSpiegel;
    const iv = new T.Matrix4().fromArray(S.ivp), auge = new T.Vector3().fromArray(S.auge), d = namen.map(() => []);
    for (let p = 0; p < W * H; p += 5) {
        const c = teil[p];
        if (!c) continue;
        const i = Math.floor(((Math.floor(p / W) + 0.5) * S.th) / H) * S.tw + Math.floor((((p % W) + 0.5) * S.tw) / W), z = S.tiefe[i];
        d[c - 1].push(z < 0.99999 ? new T.Vector3((2 * (i % S.tw) + 1) / S.tw - 1, 1 - (2 * Math.floor(i / S.tw) + 1) / S.th, z).applyMatrix4(iv).distanceTo(auge) : 1e9);
    }
    return Object.fromEntries(namen.map((n, j) => [n, d[j].length ? Math.round(d[j].sort((a, b) => a - b)[d[j].length >> 1]) : null]));`;

async function messen() {
    const { werkbankRuf } = require(path.join(BAUM, "scripts", "lib", "welt-boot.cjs"));
    const port = +arg("port", 4575),
        ordner = path.resolve(arg("ordner")),
        nur = new RegExp(arg("nur", "."));
    const rufe = (weg, o) => werkbankRuf(port, weg, o);
    const evalRuf = async (code) => {
        const o = await rufe("/eval", { code });
        if (o.fehler) throw new Error(`eval: ${o.fehler}`);
        return o.ergebnis;
    };
    fs.mkdirSync(ordner, { recursive: true });
    const gruppen = new Map();
    for (const k of TAFEL.klassen.filter((x) => nur.test(x.id))) gruppen.set(ausdruck(k), (gruppen.get(ausdruck(k)) || []).concat(k));
    const quellen = Object.fromEntries([...new Set(TAFEL.klassen.flatMap((k) => k.quellen || []))].map((d) => [d, LESER.pruefsumme(d)]));
    const frisch = (me) => Object.assign(me, { stand: Object.assign({ version: LESER.stammVersion() }, me.stand), quellen });
    const kopf = (a) => /spieler:kopf\//.test(a || "");
    const uhren = String(arg("uhr", "0.5,0.3,0")).split(",").map(Number);
    const blicke = [0, 1, 7, 2, 6, 3, 5, 4].slice(0, +arg("blicke", 8));
    for (const sicht of String(arg("sicht", "ego,third")).split(",")) {
        const t0 = Date.now();
        const u = await rufe("/umstellen", { ort: "genesis", sicht });
        if (u.fehler) throw new Error(`umstellen ${sicht}: ${u.fehler}`);
        // die Leinwand der Klasse (1920 × 1080) erst nach dem Einschwingen: headless schwang die Welt sonst in jedem Takt in ihr ein
        // (swiftshader: über 80 statt 6 min am Genesis-Ort)
        const f = await rufe("/fenster", { w: 1920, h: 1080 });
        if (f.fehler) throw new Error(`fenster: ${f.fehler}`);
        // DIE TIERE STEHEN, wo sie sind (`__tiereHalten`, die Bühne nennt es): die Wahl sah den Wolf bei 90°, der Schuss danach nicht mehr
        // (Radeon 31.10.: jeder Schuss tickt die Welt, bis sie steht)
        const [g0, arm] = await evalRuf("window.__tiereHalten(); return [r.state.yaw, r.state.cameraThirdDistance]");
        console.log(`${sicht}: am Genesis-Ort nach ${Math.round((Date.now() - t0) / 1000)} s (Gier ${g0.toFixed(3)}, Arm ${arm} m)`);
        // der Blick k: die Gier der Ankunft + k · 45°, das Rig des Spiels setzt die Kamera; das Ziel der Abnahme ist der Anker des Blicks
        // (Ego 9 m voraus im Ring, Third die Brust des Spielers), ohne Fuß — er ist kein Werk, sein Fuß kein Beweis
        const pose = (k) =>
            evalRuf(`const st = r.state; st.yaw = ${g0 + (k * Math.PI) / 4}; st.pitch = 0;
                for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100);
                const c = st.camera.position, z = c.clone().addScaledVector(st.camera.getWorldDirection(new T.Vector3()), ${sicht === "third" ? arm : 9});
                return [c.x, c.y, c.z, z.x, z.y, z.z];`);
        const schuss = async (a, k, uhr, name, mehr) => {
            const [px, py, pz, lx, ly, lz] = kopf(a) ? [0, 0, 0, 0, 0, 0] : await pose(k);
            const bild = path.join(ordner, `${sicht}-${name}.png`);
            const o = await rufe(
                "/bild",
                Object.assign({ px, py, pz, lx, ly, lz, uhr, klasse: a, wahl: 0, fuss: false, spieler: true, messung: true, datei: bild }, kopf(a) ? { gesicht: arm } : {}, mehr)
            );
            return o.messung
                ? { messung: frisch(o.messung), bild, gier: k * 45, abnahme: o.abnahme, ms: o.gesamtMs }
                : { fehlt: String(o.fehler || JSON.stringify(o).slice(0, 300)), bild };
        };
        // DIE WAHL zur ersten Uhr: je Ausdruck (ohne Kopf und Licht) und Abstand der erste Blick, der ihn im Band zeigt
        const wahl = new Map();
        for (const k of blicke) {
            const offen = [...gruppen.keys()].filter((a) => a && !kopf(a)).flatMap((a) => ["nah", "fern"].filter((b) => !wahl.has(`${a}|${b}`)).map((b) => [a, b]));
            if (!offen.length) break;
            const o = await schuss([...new Set(offen.map((x) => `(?:${x[0]})`))].join("|"), k, uhren[0], `wahl-${k * 45}`, { nurPixel: true });
            const d = o.messung ? await evalRuf(TIEFE_JE_KLASSE) : {};
            const neu = [];
            const genug = o.messung ? IM_BILD * o.messung.leinwand[0] * o.messung.leinwand[1] : Infinity;
            for (const [a, b] of offen) {
                const n = Object.entries(o.messung ? o.messung.klassen : {}).reduce((s, [nm, x]) => s + (new RegExp(a).test(nm) && d[nm] != null && (b === "nah" ? d[nm] < NAH_M : d[nm] >= NAH_M) ? x.pixel : 0), 0);
                if (n >= genug) wahl.set(`${a}|${b}`, k), neu.push(`${b} ${a.slice(0, 40)} ${n} px`);
            }
            console.log(`  Blick ${k * 45}°: ${o.messung ? `${Object.keys(d).length} Teil-Klassen — ${neu.length ? neu.join(" · ") : "nichts Neues"}` : o.fehlt}`);
        }
        const geschossen = new Map();
        let licht = null;
        for (const abstand of String(arg("abstand", "nah,fern")).split(","))
            for (const uhr of uhren) {
                const zelle = `${sicht}-${abstand}-${uhr}`,
                    datei = path.join(ordner, zelle + ".json");
                const klassen = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")).klassen : {};
                for (const [a, ks] of gruppen) {
                    let r;
                    if (!a) {
                        if (uhr !== 0.5) r = { fehlt: "kein Soll zu dieser Uhr: die Zeile gilt Mittag klar, die Licht-Bilanz misst unter der Bühne nur Mittag (`__lichtBilanz` ruft `__buehne()`)" };
                        else {
                            licht = licht || (await rufe("/licht", { messung: true }));
                            r = licht.messung ? { messung: frisch(licht.messung) } : { fehlt: String(licht.fehler) };
                        }
                    } else if (kopf(a) && (sicht === "ego" || abstand === "fern"))
                        r = { weg: sicht === "ego" ? "Ego zeigt den eigenen Kopf nie (`_applyEgoSicht` nimmt ihn dem Auge)" : `der Kopf steht in Third am Arm des Spiels (${arm} m), nie jenseits ${NAH_M} m` };
                    else {
                        const k = kopf(a) ? 0 : wahl.get(`${a}|${abstand}`);
                        if (k == null) r = { weg: `kein Blick der Wahl (${blicke.length} je 45°) zeigt sie ${abstand === "nah" ? "näher als" : "jenseits"} ${NAH_M} m auf ≥ ${IM_BILD * 100} % des Bilds` };
                        else {
                            const s = `${a}|${k}|${uhr}`;
                            if (!geschossen.has(s))
                                geschossen.set(
                                    s,
                                    await schuss(a, k, uhr, `${uhr}-${ks[0].id}-${k * 45}`, {
                                        nurPixel: ks.every((x) => /^albedo/.test(x.mass.name)),
                                        abstand: ks.some((x) => /--abstand/.test(x.mass.werkzeug || "")),
                                    })
                                );
                            r = geschossen.get(s);
                        }
                    }
                    for (const x of ks) klassen[x.id] = r;
                    // je Ausdruck geschrieben: ein Lauf, den sein Deckel bricht, hinterlässt jede gemessene Klasse
                    fs.writeFileSync(datei, JSON.stringify({ zelle, sicht, abstand, uhr, klassen }, null, 1));
                }
                console.log(`${zelle}: ${Object.entries(klassen).map(([id, r]) => `${id} ${r.messung ? (r.gier != null ? `${r.gier}°` : "Licht") : r.weg ? "nicht im Bild" : "FEHLT"}`).join(" · ")}`);
            }
        console.log(`${sicht}: ${Math.round((Date.now() - t0) / 1000)} s`);
    }
}

function urteil() {
    const ordner = path.resolve(arg("ordner"));
    const zellen = fs
        .readdirSync(ordner)
        .filter((f) => /^(ego|third)-(nah|fern)-[\d.]+\.json$/.test(f))
        .map((f) => JSON.parse(fs.readFileSync(path.join(ordner, f), "utf8")));
    if (!zellen.length) throw new Error(`keine Zelle in ${ordner}`);
    const u = zellenUrteil(TAFEL, zellen);
    fs.writeFileSync(path.join(ordner, "tafel.json"), JSON.stringify(u, null, 1));
    console.log(tafelText(u));
    return u.zeilen.every((z) => z.zellen.every((x) => x.urteil !== "ROT"));
}

const befehl = process.argv[2];
(async () => {
    if (befehl === "selbsttest") {
        const v = selbsttest();
        console.log(v.length ? `SELBSTTEST ROT:\n  ${v.join("\n  ")}` : "SELBSTTEST GRÜN — das Urteil der Zellen nennt jeden Täter beim Namen");
        process.exit(v.length ? 1 : 0);
    }
    if (befehl === "messen") return messen();
    if (befehl === "urteil") process.exit(urteil() ? 0 : 1);
    console.log(fs.readFileSync(__filename, "utf8").split('"use strict"')[0].trimEnd());
    process.exit(2);
})().catch((e) => {
    console.error(`A-SPAWN BRUCH: ${e && e.stack ? e.stack.split("\n").slice(0, 4).join(" | ") : e}`);
    process.exit(2);
});
