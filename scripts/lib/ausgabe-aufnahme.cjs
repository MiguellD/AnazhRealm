// ausgabe-aufnahme.cjs — DIE EINE AUFNAHME der Look-Sonden (V18.503, Gebot 10: die Linse nennt,
// was der Spieler SIEHT). Ein eigenes Render-Target liefert in r184 LINEARE, ungetonte Werte:
// `currentToneMapping`/`currentColorSpace` greifen nur am Ausgabe-Ziel (`isOutputTarget`). Die
// Beweisbilder aaa8–aaa11, die Wiesen- und die Fell-Linse lasen so — dunkle Schattenseiten, harte
// Kontraste, ausgebrannte Lichter, die das Spiel nie zeigt (gemessen 01.10.: Prüf-Kiste im Render-
// Target navy, im präsentierten Canvas hell-lavendel; das Ausgabe-Target trifft den Canvas-
// Screenshot pixelgleich im Bild).
//
// Der Weg hier: das Render-Target wird per `setOutputRenderTarget` zum Ausgabe-Puffer, dann läuft
// der ECHTE Frame (`_loopRender` → Post-Pipeline → ACES + sRGB + Post-FX) hinein. Gelesen wird
// TOP-DOWN RGBA. Der Aufrufer pausiert den Spiel-Loop (Lehre 17) und setzt Kamera/Schatten selbst.
//
// Gebrauch: einmal `await page.evaluate(AUSGABE_INSTALL)` nach dem Laden, im Seiten-Kontext
// `const { u8, info, ms } = await window.__ausgabeAufnahme(W, H)`.

function ausgabeAufnahme(W, H, warm) {
    return (async () => {
        const r = window.anazhRealm;
        const T = window.THREE;
        const rend = r.state.renderer;
        const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
        const prevOut = typeof rend.getOutputRenderTarget === "function" ? rend.getOutputRenderTarget() : null;
        rend.setOutputRenderTarget(rt);
        try {
            // Warm-Frames: der erste Frame nach dem Kamera-Umsetzen trägt die Feld-Formen noch nicht
            // (Listen-/Seiten-Upload + Pipelines, gemessen 30.09.).
            // Der Szenen-Pass der Post-Pipeline (PassNode) rendert nur einmal je NODE-FRAME; den schaltet
            // im Vendor die Animations-Schleife weiter. Bei ruhendem Loop schaltet die Aufnahme ihn selbst —
            // sonst überspringt der gezählte Frame die Szene (gemessen: dc=1, Dreiecke=1, nur das Quad).
            const frame = () => {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                r._loopRender(performance.now());
            };
            const nWarm = warm == null ? 1 : warm;
            for (let k = 0; k < nWarm; k++) frame();
            const t0 = performance.now();
            frame();
            // Die Frame-Last liest die EINE Quelle des Spiels (HUD/Flugschreiber): `_loopRender` setzt
            // renderer.info je Frame zurück und legt die Summe ALLER Pässe in state._perfFrame ab.
            const pf = r.state._perfFrame || {};
            const ri = (rend.info && rend.info.render) || {};
            const info = {
                drawCalls: pf.renderCalls != null ? pf.renderCalls : ri.drawCalls,
                triangles: pf.renderTris != null ? pf.renderTris : ri.triangles,
                infoDrawCalls: ri.drawCalls,
                infoTriangles: ri.triangles,
            };
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
            const ms = performance.now() - t0;
            return { u8: px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px), info, ms };
        } finally {
            rend.setOutputRenderTarget(prevOut);
            if (rt.dispose) rt.dispose();
        }
    })();
}

module.exports = { AUSGABE_INSTALL: `window.__ausgabeAufnahme = ${ausgabeAufnahme.toString()};` };
