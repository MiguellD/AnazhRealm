"use strict";
// scripts/lib/schirm-proben.cjs — DIE STUFEN AM SCHIRM (w28-probe-schirm; `werkbank stufen`, `gate:schirm-stufen`): ein Bild in 1080
// Zeilen kommt aus einer Welt, die in 1080 Zeilen GELEBT hat. Der Täter (GTX 1050, Dorf, main 68d24688): die Werkbank lebt in 640 × 360
// und stellt das Fenster für jedes Bild auf seine Leinwand — die Welt stand danach ohne Takt (`_weltSteht` las den Schirm nicht), der
// Schuss zeichnete die Stufen-Wahl eines Drittel-Schirms: 10 von 50 Bewohnern als Feld-Kapseln bis 6,6 m ans Auge, die Tore des
// Genesis-Orts ohne ihr Gitter, die Menge am Markt der Stadt als Kapsel-Stapel. Das Urteil und der Zensus leben bei den Bild-Linsen
// (scripts/lib/ausgabe-aufnahme.cjs `stufenZensus` · `stufenAbweichung` · `stufenUrteil`, Selbsttest `werkbank bild --selbsttest` S);
// die Wand des Zugs ist gate:stand-takt (W: der Schirm-Schritt).
const AA = require("./ausgabe-aufnahme.cjs");

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
async function stufenGang({ rufe, umstellen, eigeneWelt, opt, hat }) {
    const ort = opt("--ort", "dorf");
    const lies = async (zusatz) => {
        const halt = await eigeneWelt(["--ort", ort, ...zusatz]);
        try {
            if (halt) await umstellen({ ort });
            const z = await rufe("/stufen", { w: 1920, h: 1080, uhr: opt("--uhr", null) });
            if (!z.schuss) throw new Error(`stufen: kein Zensus (${z.fehler || "ohne Antwort"})`);
            return z;
        } finally {
            halt?.();
        }
    };
    const A = await lies([]);
    if (!hat("eigen")) {
        const d = AA.stufenAbweichung(A.stand, A.schuss);
        return [`STUFEN AM SCHIRM (die laufende Sitzung): nach dem Fenster-Wechsel ${A.stand.gelebt} → ${A.schuss.schirm[1]} Zeilen wählten ${d.dinge} Dinge neu (${A.takte} Takte)${d.dinge ? `: ${d.zeile}` : ""}`, true]; // prettier-ignore
    }
    const B = await lies(["--fenster", "1920x1080"]);
    const U = AA.stufenUrteil({ schuss: A.schuss, gelebt: B.schuss, stand: A.stand });
    const kopf = `STUFEN AM SCHIRM · ${ort} · Sitzung ${A.stand.gelebt} Zeilen → Bild ${A.schuss.schirm[1]} (${A.takte} Takte bis zum Schuss) · ${Object.keys(B.schuss.klassen).length} Klassen, ${Object.keys(B.schuss.bewohner).length} Bewohner`; // prettier-ignore
    const taeter = `der Täter (die Welt auf ${A.stand.gelebt} Zeilen, ohne Takt geschossen — main): ${U.taeter.dinge} Dinge anders${U.taeter.dinge ? `: ${U.taeter.zeile}` : ""}`; // prettier-ignore
    return U.rot.length
        ? [`${kopf}\n❌ ROT — ${U.rot.join("\n   ")}\n   ${taeter}`, false]
        : [`${kopf}\n   ${taeter}\n✅ GRÜN — jedes Ding trägt im Bild die Stufe der Welt, die ab dem Boot in ${B.schuss.schirm[1]} Zeilen lebte (0 Abweichungen)`, true]; // prettier-ignore
}

module.exports = { stufenRoute, stufenGang };
