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
                return { stand, takte, schuss: await __stufenZensus() };
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
    if (!A.fenster.wechsel.length)
        U.rot.push("LEER: der Schuss der Sitzung ließ kein Fenster zurück — der Wechsel des Fensters bliebe ungefragt");
    const kopf = `STUFEN AM SCHIRM · ${ort} · Sitzung ${A.stand.gelebt} Zeilen → Bild ${A.schuss.schirm[1]} (${A.takte} Takte bis zum Schuss) · ${Object.keys(B.schuss.klassen).length} Klassen, ${Object.keys(B.schuss.bewohner).length} Bewohner`; // prettier-ignore
    const taeter = `der Täter (die Welt auf ${A.stand.gelebt} Zeilen, ohne Takt geschossen — main): ${U.taeter.dinge} Dinge anders${U.taeter.dinge ? `: ${U.taeter.zeile}` : ""}`; // prettier-ignore
    const fenster = `das Fenster: gleich ${[A, B].map((x) => `${x.fenster.gleich.nach.join(" × ")} ${x.fenster.gleich.takte} Takte in ${x.fenster.gleich.ms} ms`).join(" · ")} · Wechsel ${A.fenster.wechsel.map((f) => `→ ${f.nach.join(" × ")} ${f.takte} Takte in ${f.ms} ms`).join(" ")}`; // prettier-ignore
    return U.rot.length
        ? [`${kopf}\n❌ ROT — ${U.rot.join("\n   ")}\n   ${taeter}\n   ${fenster}`, false]
        : [`${kopf}\n   ${taeter}\n   ${fenster}\n✅ GRÜN — jedes Ding trägt im Bild die Stufe der Welt, die ab dem Boot in ${B.schuss.schirm[1]} Zeilen lebte (0 Abweichungen)`, true]; // prettier-ignore
}

// DAS URTEIL DES FENSTERS (rein; `werkbank stufen --eigen`): `gleich` — die Antwort von `/fenster` am Fenster der frischen Welt: ohne
// Takt (der Täter von main 01a6714a ließ sie dort auswachsen); `wechsel` — je `/fenster`, vor dem der Schirm andere Zeilen trug als
// der letzte Takt der Welt: Takte > 0, und danach wählte sie zuletzt am Schirm (`gelebt` = `schirm`, die Worte des Stamms).
function fensterUrteil(name, { gleich, wechsel = [] }) {
    const rot = [];
    const wort = (f) => f.nach.join(" × ");
    if (gleich && gleich.takte !== 0)
        rot.push(`FENSTER: ${name} — \`/fenster\` am gleichen Fenster ${wort(gleich)} ${gleich.fehler ? `brach (${gleich.fehler})` : `ließ die frische Welt ${gleich.takte} Takte leben (${gleich.ms} ms)`} — der Schirm wechselte nicht, der Befehl antwortet ohne Takt`); // prettier-ignore
    for (const f of wechsel)
        if (!(f.takte > 0)) rot.push(`FENSTER: ${name} — nach dem Wechsel auf ${wort(f)} ging kein Takt (${f.fehler || `Takte ${f.takte}`}) — ein Bild trüge die Stufen des alten Schirms`); // prettier-ignore
        else if (f.gelebt !== f.schirm) rot.push(`FENSTER: ${name} — nach dem Wechsel auf ${wort(f)} wählte die Welt zuletzt in ${f.gelebt} Zeilen, der Schirm trägt ${f.schirm}`); // prettier-ignore
    return rot;
}

// DER SELBSTTEST DES FENSTERS (`werkbank bild --selbsttest`, neben S der Bild-Linsen; ohne Welt, Millisekunden): die Route an einer
// Seite aus Pappe — ein Fenster, eine Welt, deren letzter Takt in `gelebt` Zeilen ging; ihr Einschwingen kostet `preis` Takte und
// lässt sie am Schirm leben. Das gleiche Fenster in einer Welt, die nicht steht → 0 Takte, nichts gezahlt (die Mutante ist main
// 01a6714a: sie fragt `_weltSteht()` und zahlt den ganzen Preis); das Fenster wechselt → Takte > 0, die Welt wählte zuletzt am neuen
// Schirm und ruht (die Mutante ist der Stand vor w28-probe-schirm: kein Takt); ein Fenster, das ein anderer Weg ohne Takt stehen
// ließ → Takte > 0; eine Welt ohne Takt und eine stehende am gleichen Fenster → 0. Dazu das Urteil der Karte an beiden Tätern.
async function fensterSelbsttest() {
    const v = [];
    const pappe = (W, leben) => {
        const r = {
            get _weltStand() {
                return W.gelebt === undefined ? undefined : { zeilen: W.gelebt };
            },
            _schirm: () => ({ hoehe: W.fenster[1] }),
            _weltSteht: () => !!W.steht && W.gelebt === W.fenster[1],
        };
        const st = { renderer: { domElement: { get clientWidth() { return W.fenster[0]; } } } }; // prettier-ignore
        const umfeld = {
            r,
            st,
            __seitenTakt: async () => {},
            __weltStehtNach: async (takt) => (
                await takt(),
                (W.gelebt = W.fenster[1]),
                (W.steht = true),
                (W.gezahlt = W.preis)
            ),
            __loop: () => (W.ruht = true),
        };
        const inSeite = (fn, ...a) =>
            new Function(...Object.keys(umfeld), `return (${fn});`)(...Object.values(umfeld))(...a);
        return {
            setViewport: async (vp) => void (W.fenster = [vp.width, vp.height]),
            waitForFunction: async (fn, _o, ...a) =>
                inSeite(fn, ...a) || Promise.reject(new Error("die Leinwand folgt dem Fenster nicht")),
            evaluate: async (fn, ...a) => inSeite(fn === schirmLeben ? leben : fn, ...a),
        };
    };
    const fall = async (W, b, leben) => ({ a: await fensterRoute(pappe(W, leben), b), W });
    const FRAGE = "gelebt === undefined || r._schirm().hoehe === gelebt";
    const mutante = (b) => (String(schirmLeben).includes(FRAGE) || v.push("die Mutante greift nicht: die Frage steht nicht in schirmLeben"), String(schirmLeben).replace(FRAGE, b)); // prettier-ignore
    // je Klasse: die Route hält ihr Soll (`rot` falsch), ihre Mutante nicht
    const klasse = async (name, rot, mut) => {
        const [a, b] = [await rot(schirmLeben), await rot(mut)];
        if (a) v.push(`${name}: ${a}`);
        if (!b) v.push(`${name}-Mutante besteht — die Linse sieht den Täter nicht`);
    };
    await klasse(
        "das gleiche Fenster in einer Welt, die nicht steht",
        async (leben) => {
            const { a, W } = await fall({ fenster: [1920, 1080], gelebt: 1080, steht: false, preis: 2302 }, {}, leben);
            return (
                !(a.takte === 0 && W.gezahlt === undefined && String(a.fenster) === "1920,1080") &&
                `\`/fenster\` kostet ${a.takte} Takte`
            );
        },
        mutante("r._weltSteht()")
    );
    await klasse(
        "das Fenster wechselt",
        async (leben) => {
            const { a, W } = await fall(
                { fenster: [640, 360], gelebt: 360, steht: true, preis: 41 },
                { w: 1920, h: 1080 },
                leben
            );
            return (
                !(a.takte === 41 && W.gelebt === 1080 && W.ruht && String(a.fenster) === "1920,1080") &&
                `${a.takte} Takte, die Welt wählte zuletzt in ${W.gelebt} Zeilen`
            );
        },
        mutante("true")
    );
    const zurueck = await fall(
        { fenster: [640, 360], gelebt: 1080, steht: true, preis: 41 },
        { w: 640, h: 360 },
        schirmLeben
    );
    if (!(zurueck.a.takte === 41 && zurueck.W.gelebt === 360))
        v.push(`ein Fenster, das ein anderer Weg ohne Takt stehen ließ, bleibt stehen: ${zurueck.a.takte} Takte`);
    for (const [name, W] of [
        ["eine Welt ohne Takt", { gelebt: undefined, steht: false }],
        ["die stehende Welt am gleichen Fenster", { gelebt: 1080, steht: true }],
    ]) {
        const { a } = await fall({ fenster: [1920, 1080], preis: 7, ...W }, {}, schirmLeben);
        if (a.takte !== 0) v.push(`${name} kostet ${a.takte} Takte`);
    }
    // das Urteil der Karte: GRÜN am Soll, beide Täter und der Bruch der Route beim Namen
    const gut = {
        gleich: { nach: [1920, 1080], takte: 0, ms: 12, schirm: 1080, gelebt: 1080 },
        wechsel: [{ nach: [640, 360], takte: 41, ms: 900, schirm: 360, gelebt: 360 }],
    };
    const U = (o) => fensterUrteil("die Sitzung", { ...gut, ...o }).join(" | ");
    if (U({})) v.push(`das Urteil fällt am Soll: ${U({})}`);
    for (const [name, o, re] of [
        ["main (die frische Welt wächst am gleichen Fenster aus)", { gleich: { ...gut.gleich, takte: 2302, ms: 39500 } }, /^FENSTER: die Sitzung — `\/fenster` am gleichen Fenster 1920 × 1080 ließ die frische Welt 2302 Takte leben \(39500 ms\)/],
        ["die Route bricht", { gleich: { nach: [1920, 1080], fehler: "DIE WELT STEHT NICHT" } }, /am gleichen Fenster 1920 × 1080 brach \(DIE WELT STEHT NICHT\)/],
        ["kein Takt nach dem Wechsel", { wechsel: [{ ...gut.wechsel[0], takte: 0 }] }, /^FENSTER: die Sitzung — nach dem Wechsel auf 640 × 360 ging kein Takt \(Takte 0\)/],
        ["die Welt wählte am alten Schirm", { wechsel: [{ ...gut.wechsel[0], gelebt: 1080 }] }, /wählte die Welt zuletzt in 1080 Zeilen, der Schirm trägt 360$/],
    ]) if (!re.test(U(o))) v.push(`das Urteil nennt den Täter nicht — ${name}: ${U(o) || "GRÜN"}`); // prettier-ignore
    return v;
}

module.exports = { fensterRoute, fensterSelbsttest, stufenRoute, stufenGang };
