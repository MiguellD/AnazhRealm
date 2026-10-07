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
// `window.__buehne()` vor jedem Schuss und `const { u8, info, ms } = await window.__ausgabeAufnahme(W, H)`.

// DIE BÜHNE der Beweisbilder: Mittag · Sonne · Sommer, fest — „vorher↔nachher unter gleichen
// Bedingungen". Zwei Uhren des Spiels liefen in den Sonden frei:
// - das WETTER zieht alle 120 s weiter (Auto-Zug in `_loopWeatherAndGrowth`). Gemessen 01.10. an
//   derselben Wiese, derselben Kamera: sonnig 90,2 · Regen 40,3 · Sturm 16,8 Boden-Helligkeit; der
//   dunkle Lauf `wiese-ausgabe2` (29,0) war Schlechtwetter, kein Licht- oder Boden-Befund.
// - die JAHRESZEIT driftet (Jahr = 2400 s): ab Sommer 0,375 ist nach ~5 min Herbst, der Saison-Flip
//   baut jedes Foundry-Asset neu (Laub-Farbe) — mitten in einer Sonde, die Stufen und Ungebaute zählt.
// Die Saison hält `saisonFest` an, sobald die Welt existiert (der Drift beginnt erst, wenn die Bühne
// steht); die Bühne setzt Zeit und Wetter über den EINEN Wetter-Schreiber und schneidet den
// 45-s-Cross-Fade ab (das Bild zeigt den Endzustand), der Regen fällt im selben Zug weg.
function saisonFest() {
    const r = window.anazhRealm;
    if (r && r.state) r.state.autoSeason = false;
    else setTimeout(saisonFest, 50);
}

// DIE WETTER-WACHE der Bühne (die EINE Stelle, die das Wetter einer Messung hält): die Uhr des Auto-Zugs
// (`weatherEffectTime`, Zug bei 120 s) steht eingefroren unter 0 — ein schon eingefrorener Wert bleibt, wie er ist. Die
// Bühne ruft sie, und jede Schleife, die Takte am Stück fährt (`werkbank lauf`, die Schirm-Wand), ruft sie je Takt: der
// EINE Wetter-Schreiber des Spiels (`_setWeather`, auch der Emotions-Effekt „hope → sunny") setzt die Uhr auf 0, der
// nächste Takt friert sie wieder ein. Bis 07.10. setzte die Bühne selbst die Uhr auf 0 (über `_setWeather`): jede Bühne
// (`lauf`, `band`, jede Sonde) taute ein eingefrorenes Wetter auf, und 120 s freier Takte später zog Regen ins Bild (OMEN:
// „rainy" in 2 von 4 Boots; Werkbank: eingefroren → lauf → Uhr 17,6 → 120 s frei → rainy).
function wetterHalten() {
    const st = window.anazhRealm.state;
    const u = st.weatherEffectTime;
    if (!(Number.isFinite(u) && u < 0)) st.weatherEffectTime = -1e9;
}

function buehne() {
    const r = window.anazhRealm;
    const st = r.state;
    st.autoSeason = false;
    if (typeof r.setSeason === "function") r.setSeason("sommer");
    if (st.world) st.world.timeOfDay = 0.5;
    st.timeOfDay = 0.5;
    // Das Wetter hält wie die Saison: Sonne, und die Uhr des Auto-Zugs wie vor dem Schreiber — dann eingefroren
    // (`__wetterHalten`).
    const wetterUhr = st.weatherEffectTime;
    if (typeof r._setWeather === "function") r._setWeather("sunny");
    else st.weather = "sunny";
    st.weatherEffectTime = wetterUhr;
    window.__wetterHalten();
    st.weatherTransition = null;
    if (typeof r._tickRain === "function") r._tickRain(performance.now());
    if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
    // Die Himmels-Umgebung (IBL) malt der Loop aus der Nebel-Farbe — gedrosselt und nur bei Drift. Bei
    // ruhendem Loop hielt sie den Himmel des LETZTEN Laufs (gemessen 01.10.: nach einem Mitternachts-Schuss
    // lag mittags die Nacht-Umgebung, Himmel E 0,28 statt 1,89). Die Bühne malt sie mit, dann sieht die
    // Belichtung (sie liest die Umgebung) denselben Himmel wie die Materialien — wenn der Himmel driftet, nach
    // der Drift-Schwelle des Loops; für die Bühne fällt nur die Raten-Drossel (SKY_ENV_REGEN_MIN_MS). Bis 07.10.
    // erzwang jeder Aufruf eine PMREM-Regeneration (`_ensureSkyEnvironment(true)`, ~25 Render-Pässe), und das
    // Einschwingen von `werkbank band` ruft die Bühne je Takt: der Zeitstempel-Pool lief voll (die Stempel-Wache
    // nannte 806 von 815 verweigerten Abfragen „OrthographicCamera → PMREM.cubeUv"), jede Pass-Zeit danach war blind.
    if (typeof r._ensureSkyEnvironment === "function") {
        st._skyEnvLastRegenMs = -Infinity;
        r._ensureSkyEnvironment(false);
    }
    if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
    return { saison: st.season, phase: st.seasonPhase, wetter: st.weather };
}

// DIE TIERE HALTEN STILL: zwischen Blick-Wahl und Schuss liegen hunderte Takte, in denen Tiere wandern —
// gemessen 01.10. (aaa13 Haus fern, aaa14 Kreatur fern): ein Tier lief in die Kamera und füllte das
// Bild. Nach jedem Kreatur-Tick fallen x/z auf den Stand davor zurück; Animation, Haut, Boden-Höhe
// und LOD laufen weiter.
function tiereHalten() {
    const r = window.anazhRealm;
    const P = Object.getPrototypeOf(r);
    if (P.__tiereGehalten) return;
    const org = P.updateCreatures;
    P.__tiereGehalten = true;
    P.updateCreatures = function (delta) {
        const fest = (this.state.creatures || []).map((c) => [c, c.position.x, c.position.z]);
        const o = org.call(this, delta);
        for (const [c, x, z] of fest) {
            c.position.x = x;
            c.position.z = z;
        }
        return o;
    };
}

// DAS GANZE BILD (04.10., echte GPU): ein Ausgabe-Ziel kleiner als der Canvas lieferte die linke obere Ecke
// des Frames in Originalgröße, nie das verkleinerte Bild — 1280×720 aus 1920×1080 waren ein 2/3-Ausschnitt,
// 640×360 ein Drittel (gemessen: dieselbe Kamera, 640 = die linke obere 640×360-Ecke des 1920er Bildes). Die
// Aufnahme rendert darum IMMER in Canvas-Größe (was der Spieler sieht) und mittelt danach auf W×H herunter.
function ausgabeAufnahme(W, H, warm) {
    return (async () => {
        const r = window.anazhRealm;
        const T = window.THREE;
        const rend = r.state.renderer;
        const db = rend.getDrawingBufferSize(new T.Vector2());
        const BW = Math.max(1, Math.round(db.x));
        const BH = Math.max(1, Math.round(db.y));
        const rt = new T.RenderTarget(BW, BH, { depthBuffer: true, samples: 0 });
        const prevOut = typeof rend.getOutputRenderTarget === "function" ? rend.getOutputRenderTarget() : null;
        // DAS ZIEL DES RENDERERS mit zurück (06.10., echte GPU, `werkbank zerlegen --bilder`): im Direktpfad (ohne Post-Kette)
        // stellt r184 am Ende von `_renderScene` das aktuelle Ziel auf `_renderTarget || _outputRenderTarget` — nach einer
        // Aufnahme stand das Aufnahme-Ziel als aktuelles Ziel, jeder folgende Frame schrieb in das entsorgte Ziel und jede
        // weitere Aufnahme las ein nie beschriebenes (`copyTextureToBuffer: format of undefined`).
        const prevZiel = rend.getRenderTarget();
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
            // Die NAH-WIESE folgt der Kamera (Kachel-Ring, `_tickNahWiese` im scatterDeco-Takt). Bei ruhendem
            // Loop stand der Ring noch um die VORIGE Kamera — die Aufnahme schwingt ihn für diese ein (eine
            // Kachel je Takt, bis keine mehr fehlt).
            if (typeof r._tickNahWiese === "function") for (let i = 0; i < 200 && r._tickNahWiese() > 0; i++);
            // DIE ZEITLICHE AUFLÖSUNG (TRAA) zeigt ein ruhendes Bild erst nach ihrer Geschichte: die Halton-Folge
            // läuft 31 Versätze, die Dither-Blende rotiert je Frame — die Aufnahme zeigt, was der Spieler nach einer
            // halben Sekunde Stillstand sieht (32 Frames), nie den ersten, ungemittelten Frame nach dem Kamera-Sprung.
            const nWarm = Math.max(warm == null ? 1 : warm, r.state.traaNode ? 32 : 0);
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
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, BW, BH);
            const ms = performance.now() - t0;
            // WebGPU kopiert Zeilen auf 256 Byte ausgerichtet (bytesPerRow), r184 reicht das Polster
            // durch: bei W·4 ∤ 256 (z. B. 480 oder 160 px) lag jede Zeile versetzt — gestreifte Bilder,
            // Mittel über Polster-Nullen (gemessen 01.10.: 8×8-Probe exakt ¼ zu dunkel). Hier fällt es.
            const roh = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const zeile = BW * 4;
            const schritt = roh.length > zeile * BH ? Math.ceil(zeile / 256) * 256 : zeile;
            let voll = roh;
            if (schritt !== zeile) {
                voll = new Uint8Array(zeile * BH);
                for (let y = 0; y < BH; y++) voll.set(roh.subarray(y * schritt, y * schritt + zeile), y * zeile);
            }
            if (BW === W && BH === H) return { u8: voll, info, ms };
            // Flächen-Mittel: jedes Ziel-Pixel mittelt die Canvas-Pixel, die es überdeckt (Box-Filter).
            const u8 = new Uint8Array(W * H * 4);
            for (let y = 0; y < H; y++) {
                const y0 = Math.floor((y * BH) / H);
                const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * BH) / H));
                for (let x = 0; x < W; x++) {
                    const x0 = Math.floor((x * BW) / W);
                    const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * BW) / W));
                    let s0 = 0,
                        s1 = 0,
                        s2 = 0,
                        s3 = 0;
                    for (let yy = y0; yy < y1; yy++)
                        for (let xx = x0; xx < x1; xx++) {
                            const i = (yy * BW + xx) * 4;
                            s0 += voll[i];
                            s1 += voll[i + 1];
                            s2 += voll[i + 2];
                            s3 += voll[i + 3];
                        }
                    const n = (y1 - y0) * (x1 - x0);
                    const o = (y * W + x) * 4;
                    u8[o] = Math.round(s0 / n);
                    u8[o + 1] = Math.round(s1 / n);
                    u8[o + 2] = Math.round(s2 / n);
                    u8[o + 3] = Math.round(s3 / n);
                }
            }
            return { u8, info, ms };
        } finally {
            rend.setOutputRenderTarget(prevOut);
            rend.setRenderTarget(prevZiel);
            if (rt.dispose) rt.dispose();
        }
    })();
}

module.exports = {
    AUSGABE_INSTALL:
        `window.__ausgabeAufnahme = ${ausgabeAufnahme.toString()};` +
        `window.__wetterHalten = ${wetterHalten.toString()};` +
        `window.__buehne = ${buehne.toString()};` +
        `window.__tiereHalten = ${tiereHalten.toString()};` +
        `(${saisonFest.toString()})();`,
};
