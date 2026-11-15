"use strict";
// scripts/lib/schirm-proben.cjs — DIE STUFEN AM SCHIRM (w28-probe-schirm; `werkbank stufen`, `gate:schirm-stufen`): ein Bild in 1080
// Zeilen kommt aus einer Welt, die in 1080 Zeilen GELEBT hat. Der Täter (GTX 1050, Dorf, main 68d24688): die Werkbank lebt in 640 × 360
// und stellt das Fenster für jedes Bild auf seine Leinwand — die Welt stand danach ohne Takt (`_weltSteht` las den Schirm nicht), der
// Schuss zeichnete die Stufen-Wahl eines Drittel-Schirms: 10 von 50 Bewohnern als Feld-Kapseln bis 6,6 m ans Auge, die Tore des
// Genesis-Orts ohne ihr Gitter, die Menge am Markt der Stadt als Kapsel-Stapel. Das Urteil und der Zensus leben bei den Bild-Linsen
// (scripts/lib/ausgabe-aufnahme.cjs `stufenZensus` · `stufenAbweichung` · `stufenUrteil`, Selbsttest `werkbank bild --selbsttest` S);
// die Wand des Zugs ist gate:stand-takt (W: der Schirm-Schritt).
const AA = require("./ausgabe-aufnahme.cjs");

// DAS FENSTER (die Route `/fenster` der Werkbank, `werkbank fenster <w> <h>`): der Viewport wechselt wie bei einem Spieler (Fenster
// ziehen, Vollbild) — das resize-Ereignis stellt die Leinwand und misst den Schirm sofort (`_schirmMessen`). NACH EINEM WECHSEL LEBT
// DIE WELT AM NEUEN SCHIRM, ehe der Befehl antwortet (w28-probe-schirm): der Loop ruht zwischen den Befehlen — wer danach nur rendert
// (`gpu-bank`), zeichnete sonst die Stufen-Wahl des alten Fensters in das neue. GENAU DANN (w28-fenster-wechsel, `schirmLeben`): die
// Frage ist die des Stamms (`_weltSteht`, `_weltStandTakt`) — trägt der Schirm andere Zeilen als der letzte Takt der Welt? Sie deckt
// auch ein Fenster, das ein anderer Weg ohne Takt stehen ließ (`/bild` und `/stufen` stellen nach dem Schuss das Fenster der Sitzung
// zurück). Wechselte der Schirm nicht, antwortet der Befehl sofort mit `takte: 0`: wer eine stehende Welt braucht, schwingt sie
// selbst ein (`umstellen`, das Bild). DER TÄTER (Radeon, main 01a6714a, 15.11.): der Befehl fragte `_weltSteht()` — die frische Welt
// der Mess-Sitzung (`start --echt`, ab dem Boot 1920 × 1080) steht noch nicht, die Grundstellung der Punkte-Maschine stellt dasselbe
// Fenster, und der Befehl ließ die GANZE Welt am Spawn auswachsen (unter gehaltenem Regler, `__weltStehtNach`: der Laub-Rand blieb am
// Boot-Wert), ehe der Ort-Schritt sie woanders hinzog — „/fenster ohne Antwort binnen 30 s“, 124 von 124 Stationen UNGEMESSEN.
// Gemessen (Radeon, `start --echt --ort wiese`, je 3 Boots im Wechsel): main 1 221–2 261 Takte in 32,8–48,0 s, der Laub-Rand am Ort
// danach 129,6 m; hier 0 Takte in 34–216 ms, die Welt entsteht im Ort-Schritt, der Laub-Rand 216 m.
async function fensterRoute(page, b) {
    const [w, h] = [+b.w || 1920, +b.h || 1080];
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.waitForFunction((w) => st.renderer.domElement.clientWidth === w, {}, w);
    return { fenster: [w, h], takte: await page.evaluate(schirmLeben) };
}
// (Seite) die Welt lebt am Schirm: wechselten seine Zeilen seit ihrem letzten Takt, Takt um Takt, bis sie an ihm steht (das EINE
// Einschwingen, welt-boot `__weltStehtNach`) → die Takte; sonst 0, ohne einen Takt. Eine Welt ohne Takt wählte an keinem Schirm.
async function schirmLeben() {
    const gelebt = (r._weltStand || {}).zeilen;
    if (gelebt === undefined || r._schirm().hoehe === gelebt) return 0;
    const takte = await __weltStehtNach(() => __seitenTakt());
    __loop(); // die Welt ruht zwischen den Befehlen
    return takte;
}

// DER WEG JEDES BILDS, mit dem Zensus davor und danach (die Route `/stufen` der Werkbank): das Fenster auf die Leinwand (`b.w` × `b.h`,
// 1920 × 1080), die Kamera des Spiels, die Bühne, das Warten des Schusses (`__weltStehtWarten`) — `stand` direkt nach dem
// Fenster-Wechsel, ohne Takt (was main schoss), `schuss` was das Bild zeigt; danach das Fenster der Sitzung.
async function stufenRoute(page, b) {
    const vp = page.viewport();
    const [vw, vh] = [+b.w || 1920, +b.h || 1080];
    const wechsel = !(vp && vp.width === vw && vp.height === vh);
    if (wechsel) {
        await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1 });
        await page.waitForFunction((w) => st.renderer.domElement.clientWidth === w, {}, vw);
    }
    try {
        return await page.evaluate(
            async (uhr) => {
                st.renderer.setAnimationLoop(null);
                for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100);
                st.camera.updateMatrixWorld(true);
                __buehne({ uhr });
                const stand = await __stufenZensus();
                const takte = await __weltStehtWarten();
                return { stand, takte, schuss: await __stufenZensus(), laub: r._laubRand() }; // der Laub-Rand der Welt beim Schuss (Z6)
            },
            b.uhr == null ? 0.5 : Number(b.uhr)
        );
    } finally {
        if (wechsel) await page.setViewport(vp);
    }
}

// DER GANG DES BEFEHLS (`werkbank stufen [--ort dorf] [--eigen]`) → [Text, grün]. `--eigen`: zwei Welten am Messort — die Sitzung jeder
// Hand (640 × 360), die das Fenster für ihr Bild wechselt, und die Welt, die ab dem Boot in 1920 × 1080 lebt (`start --fenster`); jedes
// Ding unter dem Stufen-Gesetz trägt im Bild der ersten die Stufe der zweiten (0 Abweichungen). Der Täter steht daneben: der Zensus
// direkt nach dem Fenster-Wechsel — trägt dort kein Ding eine andere Stufe, ist die Probe LEER. Ohne `--eigen`: nur die laufende
// Sitzung, Stand ↔ Schuss (die schnelle Frage einer Pose: hängt hier eine Stufe am Schirm?).
// DAS FENSTER AN DER KARTE (w28-fenster-wechsel, `fensterUrteil`): jede eigene Welt fragt `/fenster` frisch an ihrem eigenen Fenster
// (`gleich`: sie steht noch nicht, ihr Schirm wechselt nicht — 0 Takte); die Sitzung nach ihrem Schuss, der ihr Fenster ohne Takt
// zurückließ, erst dorthin und dann auf das Bild (`wechsel`: Takte > 0, die Welt wählte zuletzt am Schirm).
const [SITZUNG, BILD] = [[640, 360], [1920, 1080]]; // prettier-ignore
async function stufenGang({ rufe, umstellen, eigeneWelt, opt, hat }) {
    const ort = opt("--ort", "dorf");
    const fensterAuf = async ([w, h]) => {
        const a = await rufe("/fenster", { w, h });
        const s =
            (await rufe("/eval", { code: "return [r._schirm().hoehe, (r._weltStand || {}).zeilen];" })).ergebnis || [];
        return { nach: [w, h], takte: a.takte, ms: a.ms, fehler: a.fehler, schirm: s[0], gelebt: s[1] };
    };
    const lies = async (fenster) => {
        const halt = await eigeneWelt(["--ort", ort, "--fenster", fenster.join("x")]);
        try {
            const gleich = halt && (await fensterAuf(fenster));
            if (halt) await umstellen({ ort });
            const z = await rufe("/stufen", { w: BILD[0], h: BILD[1], uhr: opt("--uhr", null) });
            if (!z.schuss) throw new Error(`stufen: kein Zensus (${z.fehler || "ohne Antwort"})`);
            const wechsel =
                halt && z.stand.gelebt !== z.schuss.schirm[1]
                    ? [await fensterAuf(fenster), await fensterAuf(BILD)]
                    : [];
            return Object.assign(z, { fenster: { gleich, wechsel } });
        } finally {
            halt?.();
        }
    };
    const A = await lies(SITZUNG);
    if (!hat("eigen")) {
        const d = AA.stufenAbweichung(A.stand, A.schuss);
        return [`STUFEN AM SCHIRM (die laufende Sitzung): nach dem Fenster-Wechsel ${A.stand.gelebt} → ${A.schuss.schirm[1]} Zeilen wählten ${d.dinge} Dinge neu (${A.takte} Takte)${d.dinge ? `: ${d.zeile}` : ""}`, true]; // prettier-ignore
    }
    const B = await lies(BILD);
    const U = AA.stufenUrteil({ schuss: A.schuss, gelebt: B.schuss, stand: A.stand });
    U.rot.push(...fensterUrteil("die Sitzung", A.fenster), ...fensterUrteil("die gelebte Welt", B.fenster));
    const kopf = `STUFEN AM SCHIRM · ${ort} · Laub-Rand ${A.laub} ↔ ${B.laub} m · Sitzung ${A.stand.gelebt} Zeilen → Bild ${A.schuss.schirm[1]} (${A.takte} Takte bis zum Schuss) · ${Object.keys(B.schuss.klassen).length} Klassen, ${Object.keys(B.schuss.bewohner).length} Bewohner`; // prettier-ignore
    const taeter = `der Täter (die Welt auf ${A.stand.gelebt} Zeilen, ohne Takt geschossen — main): ${U.taeter.dinge} Dinge anders${U.taeter.dinge ? `: ${U.taeter.zeile}` : ""}`; // prettier-ignore
    const fenster = `das Fenster: gleich ${[A, B].map((x) => `${x.fenster.gleich.takte} Takte in ${x.fenster.gleich.ms} ms`).join(" · ")} · Wechsel ${A.fenster.wechsel.map((f) => `→ ${f.nach[1]} Zeilen ${f.takte} Takte`).join(" ")}`; // prettier-ignore
    return U.rot.length
        ? [`${kopf}\n❌ ROT — ${U.rot.join("\n   ")}\n   ${taeter}\n   ${fenster}`, false]
        : [`${kopf}\n   ${taeter}\n   ${fenster}\n✅ GRÜN — jedes Ding trägt im Bild die Stufe der Welt, die ab dem Boot in ${B.schuss.schirm[1]} Zeilen lebte (0 Abweichungen)`, true]; // prettier-ignore
}

// DAS URTEIL DES FENSTERS (rein; `werkbank stufen --eigen`): `gleich` — die Antwort von `/fenster` am Fenster der frischen Welt: ohne
// Takt (der Täter von main 01a6714a ließ sie dort auswachsen); `wechsel` — je `/fenster`, vor dem der Schirm andere Zeilen trug als
// der letzte Takt der Welt: Takte > 0, und danach wählte sie zuletzt am Schirm (`gelebt` = `schirm`, die Worte des Stamms).
function fensterUrteil(name, { gleich, wechsel = [] }) {
    const rot = [];
    const kopf = (f, wo) =>
        `FENSTER (${name}): \`/fenster\` ${wo} ${f.nach.join(" × ")}: ${f.fehler || `${f.takte} Takte`}`;
    if (gleich && gleich.takte !== 0)
        rot.push(`${kopf(gleich, "am gleichen Fenster")} in ${gleich.ms} ms — der Schirm wechselte nicht`);
    for (const f of wechsel)
        if (!(f.takte > 0)) rot.push(`${kopf(f, "nach dem Wechsel auf")} — ein Bild trüge die Stufen des alten Schirms`);
        else if (f.gelebt !== f.schirm) rot.push(`${kopf(f, "nach dem Wechsel auf")}, zuletzt gewählt in ${f.gelebt} Zeilen, der Schirm trägt ${f.schirm}`); // prettier-ignore
    return rot;
}

// DER SELBSTTEST DES FENSTERS (`werkbank bild --selbsttest`, neben S der Bild-Linsen; ohne Welt, Millisekunden): die Route an einer
// Seite aus Pappe — ein Fenster [B, H], eine Welt, deren letzter Takt in `gelebt` Zeilen ging und die steht oder nicht; ihr
// Einschwingen kostet 41 Takte und lässt sie am Schirm leben. Je Fall das Soll „Fenster Takte Zeilen [ruht]“: das gleiche Fenster in
// einer Welt, die nicht steht → 0 Takte (die Mutante ist main 01a6714a: sie fragt `_weltSteht()` und zahlt das Einschwingen); das
// Fenster wechselt → Takte > 0, die Welt wählte zuletzt am neuen Schirm und ruht (die Mutante ist der Stand vor w28-probe-schirm:
// kein Takt); ein Fenster, das ein anderer Weg ohne Takt stehen ließ → Takte > 0; eine Welt ohne Takt → 0. Dazu das Urteil der Karte.
async function fensterSelbsttest() {
    const v = [];
    const FRAGE = "gelebt === undefined || r._schirm().hoehe === gelebt";
    if (!String(schirmLeben).includes(FRAGE))
        v.push("die Mutanten greifen nicht: die Frage steht nicht in schirmLeben");
    const fall = async (leben, [w, h, gelebt, steht], b) => {
        const W = { f: [w, h], gelebt };
        const umfeld = {
            r: { _schirm: () => ({ hoehe: W.f[1] }), _weltSteht: () => steht && W.gelebt === W.f[1], get _weltStand() { return W.gelebt && { zeilen: W.gelebt }; } }, // prettier-ignore
            st: { renderer: { domElement: { get clientWidth() { return W.f[0]; } } } }, // prettier-ignore
            __seitenTakt: async () => {},
            __weltStehtNach: async (takt) => (await takt(), (W.gelebt = W.f[1]), 41),
            __loop: () => (W.ruht = " ruht"),
        };
        const inSeite = (fn, ...a) =>
            new Function(...Object.keys(umfeld), `return (${fn});`)(...Object.values(umfeld))(...a);
        const page = {
            setViewport: async (vp) => void (W.f = [vp.width, vp.height]),
            waitForFunction: async (fn, _o, ...a) => inSeite(fn, ...a),
            evaluate: async (fn) => inSeite(fn === schirmLeben ? leben : fn),
        };
        const a = await fensterRoute(page, b);
        return `${a.fenster.join("x")} ${a.takte} ${W.gelebt}${W.ruht || ""}`;
    };
    for (const [name, welt, b, soll, mutante] of [
        [
            "das gleiche Fenster in einer Welt, die nicht steht",
            [1920, 1080, 1080, false],
            {},
            "1920x1080 0 1080",
            "r._weltSteht()",
        ],
        ["das Fenster wechselt", [640, 360, 360, true], { w: 1920, h: 1080 }, "1920x1080 41 1080 ruht", "true"],
        [
            "ein Fenster, das ein anderer Weg ohne Takt stehen ließ",
            [640, 360, 1080, true],
            { w: 640, h: 360 },
            "640x360 41 360 ruht",
        ],
        ["eine Welt ohne Takt", [1920, 1080, undefined, false], {}, "1920x1080 0 undefined"],
    ]) {
        const ist = await fall(schirmLeben, welt, b);
        if (ist !== soll) v.push(`${name}: „${ist}“ statt „${soll}“`);
        if (mutante && (await fall(String(schirmLeben).replace(FRAGE, mutante), welt, b)) === soll)
            v.push(`${name}: die Mutante (${mutante}) besteht — die Linse sieht den Täter nicht`);
    }
    const gut = { gleich: { nach: BILD, takte: 0 }, wechsel: [{ nach: SITZUNG, takte: 41, schirm: 360, gelebt: 360 }] };
    for (const [o, re] of [
        [{}, /^$/],
        [{ gleich: { nach: BILD, takte: 2302, ms: 39500 } }, /am gleichen Fenster 1920 × 1080: 2302 Takte in 39500 ms/],
        [{ gleich: { nach: BILD, fehler: "bricht" } }, /am gleichen Fenster 1920 × 1080: bricht/],
        [{ wechsel: [{ ...gut.wechsel[0], takte: 0 }] }, /nach dem Wechsel auf 640 × 360: 0 Takte — ein Bild/],
        [{ wechsel: [{ ...gut.wechsel[0], gelebt: 1080 }] }, /zuletzt gewählt in 1080 Zeilen, der Schirm trägt 360$/],
    ]) {
        const u = fensterUrteil("x", { ...gut, ...o }).join();
        if (!re.test(u)) v.push(`das Urteil der Karte: „${u}“ statt ${re}`);
    }
    return v;
}

module.exports = { fensterRoute, fensterSelbsttest, stufenRoute, stufenGang };
