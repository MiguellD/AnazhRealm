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
// Bühne ruft sie, und jede Schleife, die Takte am Stück fährt (`werkbank lauf`, die Schirm-Wand), ruft sie je Takt. Die
// eingefrorene Uhr IST der Halt: der EINE Wetter-Schreiber des Spiels (`_setWeather`) verweigert jeden Zug, solange sie
// unter 0 steht — Emotions-Effekt, Nexus, Gesetz, Mitspieler, Auto-Zug; im Spiel zählt die Uhr von 0 aufwärts. Bis 07.10.
// hielt die Wache nur die Uhr (OMEN, V18.534, ein B-Boot: die Uhr eingefroren, das Wetter trotzdem sunny → rainy), davor
// taute die Bühne selbst die Uhr (jede Bühne, 120 s freier Takte später zog Regen ins Bild).
function wetterHalten() {
    const st = window.anazhRealm.state;
    window.__wetterSpion();
    const u = st.weatherEffectTime;
    if (!(Number.isFinite(u) && u < 0)) st.weatherEffectTime = -1e9;
}

// DER STAPEL DER SPIONE: die Spiel-Rahmen des Stapels (anazhRealm.js), der jüngste zuerst — die Rahmen der Linse zählen nicht.
// Ein DSL-Programm trägt beliebig tief verschachtelte Interpreter-Rahmen (dslEval ← random ← dslEval ← repeat …): der Name ist
// dann der Effekt und wer `dslRun` rief (der Täter: Emotion, Nexus, Gesetz …).
function spielStapel() {
    const lim = Error.stackTraceLimit;
    Error.stackTraceLimit = 60;
    const zeilen = String(new Error().stack || "").split("\n");
    Error.stackTraceLimit = lim;
    const namen = [];
    for (const l of zeilen) {
        if (!/anazhRealm\.js/.test(l)) continue;
        const m = /at (?:async )?(?:new )?([^\s(]+) \(/.exec(l);
        namen.push(m ? m[1].replace(/^(AnazhRealm|Object)\./, "") : "(anonym)");
    }
    if (!namen.length) return "Sonde (kein Spiel-Rahmen)";
    const lauf = namen.indexOf("dslRun");
    if (lauf > 1) return [namen[0], "…", ...namen.slice(lauf, lauf + 4)].join(" ← ");
    return namen.slice(0, 6).join(" ← ");
}

// DER WETTER-SPION (die Linse der Wache): JEDER Schreiber des Wetters beim Namen. Der EINE Wetter-Schreiber des Spiels
// (`_setWeather`) bucht je Aufruf seine Quelle (die DSL-Quelle — `emotion:sorrow` · `nexus` · `rule:…` · `human` · `remote:…`
// —, „auto-zug", „buehne") und die Spiel-Rahmen seines Stapels; ein verweigerter Zug (die Wache hält) steht als
// „verweigert" im Buch. `state.weather` selbst trägt einen Accessor: wer das Wort am `_setWeather` vorbei schreibt, steht
// als „roh" mit seinem Stapel im Buch. Die Hülle ruft den Schreiber des Prototyps je Aufruf (`werkbank methode` tauscht
// ihn live). Das Buch liest `__wetterBuch(seit)`, das Urteil `wetterUrteil` (rein, unten).
function wetterSpion() {
    const r = window.anazhRealm;
    const st = r.state;
    const S =
        window.__wetterSpionBuch ||
        (window.__wetterSpionBuch = { seq: 0, buch: [], staende: new WeakSet(), quelle: null, stapel: null });
    if (S.staende.has(st)) return S;
    S.staende.add(st);
    const wer = () => window.__spielStapel();
    const buche = (e) => {
        e.seq = ++S.seq;
        e.t = Math.round(performance.now());
        // die Spiel-Zeit eines getakteten Laufs (`window.__taktZeit`, Sekunden): der Takt der Uhr-Wache rechnet in ihr
        if (Number.isFinite(window.__taktZeit)) e.tv = +window.__taktZeit.toFixed(2);
        e.uhr = Number.isFinite(st.weatherEffectTime) ? +st.weatherEffectTime.toFixed(1) : null;
        S.buch.push(e);
        if (S.buch.length > 500) S.buch.splice(0, S.buch.length - 500);
    };
    let wert = st.weather;
    Object.defineProperty(st, "weather", {
        configurable: true,
        enumerable: true,
        get: () => wert,
        set: (v) => {
            if (v !== wert)
                buche({
                    art: S.quelle != null ? "schreiber" : "roh",
                    von: wert,
                    zu: v,
                    quelle: S.quelle,
                    stapel: S.stapel || wer(),
                });
            wert = v;
        },
    });
    if (!Object.prototype.hasOwnProperty.call(r, "_setWeather"))
        r._setWeather = function (name, quelle) {
            const vor = this.state.weather;
            const q0 = S.quelle,
                s0 = S.stapel;
            S.quelle = S.buehne ? "buehne" : quelle || "?";
            S.stapel = wer();
            try {
                const ok = Object.getPrototypeOf(this)._setWeather.call(this, name, quelle);
                // ein Wunsch der Welt an den Wetter-Zug (das Gesetz der Schreiber): gebucht, nicht geschrieben
                if (ok === "wunsch")
                    buche({ art: "gewuenscht", von: vor, zu: name, quelle: S.quelle, stapel: S.stapel });
                else if (ok === false && name !== vor && name in this.constructor.WEATHER_INTENSITY)
                    buche({ art: "verweigert", von: vor, zu: name, quelle: S.quelle, stapel: S.stapel });
                return ok;
            } finally {
                S.quelle = q0;
                S.stapel = s0;
            }
        };
    return S;
}

// Das Buch des Spions seit `seit` (seq) und der Stand der Wache jetzt.
function wetterBuch(seit) {
    const S = window.__wetterSpion();
    const st = window.anazhRealm.state;
    const u = st.weatherEffectTime;
    return {
        seq: S.seq,
        wetter: st.weather,
        uhr: Number.isFinite(u) ? +u.toFixed(1) : null,
        fest: Number.isFinite(u) && u < 0,
        buch: S.buch.filter((e) => e.seq > (seit || 0)),
    };
}

// Die Bühne setzt das Wetter IHRER Messung: der Halter selbst ist der eine Schreiber, den der Halt durchlässt — die Uhr
// taut für DIESEN Zug (im Buch Quelle „buehne") und steht danach wieder, wie sie stand (oder eingefroren). Der Cross-Fade
// fällt. Die Bühne spricht wie der Spieler („setze wetter sonnig", wie jede Spur der Leben-Schau): das Gesetz der Schreiber
// (Leben-Schau 2, 09.10.) lässt die Welt das Wetter nie direkt schreiben — sie wünscht nur das nächste Wort des Zugs.
function wetterSetzen(wort) {
    const r = window.anazhRealm;
    const st = r.state;
    const S = window.__wetterSpion();
    const uhr = st.weatherEffectTime;
    st.weatherEffectTime = 0;
    S.buehne = true;
    try {
        r._setWeather(wort, "human");
    } finally {
        S.buehne = false;
    }
    st.weatherEffectTime = uhr;
    window.__wetterHalten();
    st.weatherTransition = null;
    return st.weather;
}

// DER UHR-SPION (die Linse der Uhr, Leben-Schau 2, 09.10.): JEDER Schreiber der Tageszeit (`state.timeOfDay`) beim Namen.
// Der EINE Uhr-Schreiber des Spiels (`_uhrSetzen`, falls es ihn gibt) bucht je Aufruf seine Quelle (`human` · `regler` ·
// `nexus` · `rule:…` · `laden` …) und einen verweigerten Zug als „verweigert"; `state.timeOfDay` selbst trägt einen Accessor:
// wer die Uhr am Schreiber vorbei setzt, steht als „roh" mit den Spiel-Rahmen seines Stapels im Buch (in der Schau: ein
// Nexus-Gesetz „time_of_day ← dslEval ← _tickWorldRules"). Der eigene Gang der Uhr (Quelle „uhr", oder ohne Schreiber ein
// Stapel aus `tickDayNight`) bucht nicht je Takt, er summiert: Schritte, Weg (Tag-Bruchteile vorwärts), größter Schritt.
function uhrSpion() {
    const r = window.anazhRealm;
    const st = r.state;
    const S =
        window.__uhrSpionBuch ||
        (window.__uhrSpionBuch = {
            seq: 0,
            buch: [],
            staende: new WeakSet(),
            quelle: null,
            stapel: null,
            gang: { n: 0, weg: 0, max: 0 },
        });
    if (S.staende.has(st)) return S;
    S.staende.add(st);
    const buche = (e) => {
        e.seq = ++S.seq;
        e.t = Math.round(performance.now());
        if (Number.isFinite(window.__taktZeit)) e.tv = +window.__taktZeit.toFixed(2);
        S.buch.push(e);
        if (S.buch.length > 500) S.buch.splice(0, S.buch.length - 500);
    };
    let wert = st.timeOfDay;
    Object.defineProperty(st, "timeOfDay", {
        configurable: true,
        enumerable: true,
        get: () => wert,
        set: (v) => {
            if (v !== wert) {
                const stapel = S.quelle === "uhr" ? "uhr" : S.stapel || window.__spielStapel();
                if (S.quelle === "uhr" || (S.quelle == null && /^tickDayNight\b/.test(stapel))) {
                    const d = (((v - wert) % 1) + 1) % 1;
                    S.gang.n++;
                    S.gang.weg += d;
                    if (d > S.gang.max) S.gang.max = d;
                } else
                    buche({ art: S.quelle != null ? "schreiber" : "roh", von: wert, zu: v, quelle: S.quelle, stapel });
            }
            wert = v;
        },
    });
    if (typeof r._uhrSetzen === "function" && !Object.prototype.hasOwnProperty.call(r, "_uhrSetzen"))
        r._uhrSetzen = function (t, quelle) {
            const vor = this.state.timeOfDay;
            const q0 = S.quelle,
                s0 = S.stapel;
            S.quelle = quelle || "?";
            S.stapel = S.quelle === "uhr" ? "uhr" : window.__spielStapel();
            try {
                const ok = Object.getPrototypeOf(this)._uhrSetzen.call(this, t, quelle);
                if (ok === false && Number.isFinite(Number(t)) && Number(t) !== vor)
                    buche({ art: "verweigert", von: vor, zu: Number(t), quelle: S.quelle, stapel: S.stapel });
                return ok;
            } finally {
                S.quelle = q0;
                S.stapel = s0;
            }
        };
    return S;
}

// Das Buch des Uhr-Spions seit `seit` (seq), der Gang der Uhr (Summe seit dem Einbau) und die Uhr jetzt.
function uhrBuch(seit) {
    const S = window.__uhrSpion();
    return {
        seq: S.seq,
        uhr: window.anazhRealm.state.timeOfDay,
        gang: Object.assign({}, S.gang),
        buch: S.buch.filter((e) => e.seq > (seit || 0)),
    };
}

// DER WELT-AKT-SPION (die Linse der Welt-Wache, 0710-7): jeder Welt-Akt der DSL beim Namen. Unter dem Halt einer Messung (die
// Uhr des Wetter-Zugs unter 0, `__wetterHalten`) verweigert die EINE Engstelle des Spiels (`dslEval`) jeden Welt-Akt
// (`AnazhRealm.DSL_WELTAKTE`) und bucht ihn (`_weltaktGehalten`) — der Spion hört dort mit: „verweigert" mit Op und Quelle.
// Und er hüllt jeden Welt-Akt der Effekt-Tafel (`dslEffects`): läuft einer unter dem Halt trotzdem, steht er als „durch" mit
// Quelle und Stapel im Buch — der Täter. Nennt das Spiel keine Welt-Akte, ist der Spion blind (das Urteil ROT); er hüllt dann
// die Akte, die sein Aufrufer nennt (`ersatz`), damit der Täter trotzdem beim Namen steht. Das Buch liest `__weltaktBuch(seit)`,
// das Urteil `weltaktUrteil` (rein, unten).
function weltaktSpion(ersatz) {
    const r = window.anazhRealm;
    const S =
        window.__weltaktSpionBuch ||
        (window.__weltaktSpionBuch = { seq: 0, buch: [], blind: false, huellen: new WeakMap() });
    const liste = r.constructor.DSL_WELTAKTE;
    S.blind = !Array.isArray(liste);
    const halt = () => {
        const u = window.anazhRealm.state.weatherEffectTime;
        return Number.isFinite(u) && u < 0;
    };
    const buche = (e) => {
        e.seq = ++S.seq;
        e.t = Math.round(performance.now());
        S.buch.push(e);
        if (S.buch.length > 500) S.buch.splice(0, S.buch.length - 500);
    };
    const tafel = r.dslEffects;
    let gehuellt = S.huellen.get(tafel);
    if (!gehuellt) S.huellen.set(tafel, (gehuellt = new Set()));
    for (const op of S.blind ? ersatz || [] : liste) {
        const fn = tafel[op];
        if (gehuellt.has(op) || typeof fn !== "function") continue;
        gehuellt.add(op);
        tafel[op] = function (args, ctx) {
            if (halt()) buche({ art: "durch", op, quelle: (ctx && ctx.source) || "?", stapel: window.__spielStapel() });
            return fn.call(this, args, ctx);
        };
    }
    if (!S.blind && !Object.prototype.hasOwnProperty.call(r, "_weltaktGehalten"))
        r._weltaktGehalten = function (op, ctx) {
            buche({ art: "verweigert", op, quelle: (ctx && ctx.source) || "?" });
            return Object.getPrototypeOf(this)._weltaktGehalten.call(this, op, ctx);
        };
    return S;
}

// Das Buch des Welt-Akt-Spions seit `seit` (seq) und der Halt jetzt.
function weltaktBuch(seit) {
    const S = window.__weltaktSpion();
    const u = window.anazhRealm.state.weatherEffectTime;
    return {
        seq: S.seq,
        gehalten: Number.isFinite(u) && u < 0,
        blind: S.blind,
        buch: S.buch.filter((e) => e.seq > (seit || 0)),
    };
}

function buehne() {
    const r = window.anazhRealm;
    const st = r.state;
    window.__weltaktSpion();
    st.autoSeason = false;
    if (typeof r.setSeason === "function") r.setSeason("sommer");
    if (st.world) st.world.timeOfDay = 0.5;
    st.timeOfDay = 0.5;
    // Das Wetter hält wie die Saison: Sonne über den EINEN Schreiber, dann eingefroren (`__wetterSetzen`).
    window.__wetterSetzen("sunny");
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

// DIE RUHE DER ERST-ZEICHNUNG (Welle K, `_configureRenderer`) — die EINE Regel jeder Linse, die ein angekommenes Bild
// misst (die Ausgabe-Aufnahme, der Ziel-Zensus): was zum ersten Mal zeichnet, baut je Render-Aufruf einen Stoff und lässt
// seine Pipeline asynchron entstehen; in Frames am Stück erfüllt sich kein Versprechen. `frame` schaltet Frames mit einer
// Pause für den GPU-Prozess, bis ein Frame nichts mehr baut oder verschiebt, kein Draw auf seine Pipeline wartet und keine
// Pipeline offen ist. Steht die Erst-Zeichnung `opt.erstFristMs` (120 s) ohne Fortschritt oder fünfmal so lange insgesamt,
// bricht `wer` LAUT ab und nennt jede offene Pipeline beim Namen. Ohne Erst-Zeichnung (Null-Renderer) null.
function erstRuhe(frame, opt, wer) {
    return (async () => {
        const E = window.anazhRealm._erstZeichnung;
        if (!E) return null;
        const tE = performance.now();
        let tFort = tE,
            stand = "";
        // der Name einer Pipeline: ihr Label (`renderPipeline_<Stoff>_<id>`), sonst Programm-Name und Schlüssel
        const name = (p) =>
            (E.namen && E.namen.get(p)) ||
            `${(p.vertexProgram && p.vertexProgram.name) || "(ohne Stoff-Namen)"} [${p.cacheKey}]`;
        for (;;) {
            const b0 = E.bauN,
                v0 = E.verschoben,
                w0 = E.wartetN;
            frame();
            await new Promise((res) => setTimeout(res, 0));
            // der Blick steht, wenn ein Frame nichts baut, nichts verschiebt, kein Draw auf seine Pipeline wartet
            // und kein Bundle ohne einen Bürger versiegelt ist (der wartende Draw zählt auf jedem Backend)
            if (E.offen.size === 0 && E.bauN === b0 && E.verschoben === v0 && E.wartetN === w0) break;
            const jetzt = performance.now();
            const s = `${E.bauN}|${E.verschoben}|${E.offen.size}|${E.bereitN}`;
            if (s !== stand) {
                stand = s;
                tFort = jetzt;
            }
            const frist = opt && opt.erstFristMs > 0 ? opt.erstFristMs : 120000;
            if (jetzt - tFort > frist || jetzt - tE > 5 * frist) {
                const namen = [];
                for (const p of E.offen.keys()) namen.push(name(p));
                const wartet =
                    E.wartetN !== w0 && E.wartetAuf
                        ? `; ein Draw wartet auf ${name(E.wartetAuf)}${E.abgesagt && E.abgesagt.has(E.wartetAuf) ? " (ABGESAGT)" : ""}`
                        : "";
                throw new Error(
                    `ERST-ZEICHNUNG OFFEN — ${wer || "die Aufnahme"} bricht ab: offen ${E.offen.size} nach ${Math.round(
                        (jetzt - tE) / 1000
                    )} s (davon ${Math.round((jetzt - tFort) / 1000)} s ohne Fortschritt), Bauten ${E.bauN - b0} und ` +
                        `verschoben ${E.verschoben - v0} im letzten Frame; offene Pipelines: ${namen.slice(0, 12).join(" · ") || "-"}${wartet}`
                );
            }
        }
        return { offen: E.offen.size, warteMs: Math.round(performance.now() - tE) };
    })();
}

// DAS GANZE BILD (04.10., echte GPU): ein Ausgabe-Ziel kleiner als der Canvas lieferte die linke obere Ecke
// des Frames in Originalgröße, nie das verkleinerte Bild — 1280×720 aus 1920×1080 waren ein 2/3-Ausschnitt,
// 640×360 ein Drittel (gemessen: dieselbe Kamera, 640 = die linke obere 640×360-Ecke des 1920er Bildes). Die
// Aufnahme rendert darum IMMER in Canvas-Größe (was der Spieler sieht) und mittelt danach auf W×H herunter.
function ausgabeAufnahme(W, H, warm, opt) {
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
            // DIE ERST-ZEICHNUNG (Welle K, `_configureRenderer`): was in diesem Blick zum ersten Mal zeichnet, baut je
            // Render-Aufruf einen Stoff und lässt seine Pipeline asynchron entstehen — in den 32 Frames am Stück unten
            // erfüllt sich kein Versprechen (gemessen 07.10., Werkbank, Wiese: ein Bär, der eben ins Bild kam, fehlte im
            // Beweisbild). Die Aufnahme zeigt, was der Spieler nach dem Ankommen sieht: sie schaltet Frames mit einer Pause
            // für den GPU-Prozess, bis ein Frame nichts mehr baut oder verschiebt und keine Pipeline offen ist. Steht die
            // Erst-Zeichnung 120 s ohne Fortschritt (kein Bau, keine Pipeline wird bereit; `opt.erstFristMs`, die Wand prüft mit
            // einer kurzen Frist) oder fünfmal so lange insgesamt, bricht die Aufnahme LAUT ab und nennt jede offene
            // Pipeline beim Namen — ein Bild mit einem unsichtbaren Bürger ist kein Beweis (bis 07.10. brach sie nach 60 s
            // still ab und lieferte das Bild ohne Marke).
            const erst = await window.__erstRuhe(frame, opt, "die Aufnahme");
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
                // die Erst-Zeichnung vor dem Schuss: offen 0 (sonst brach die Aufnahme oben ab) und die Wartezeit
                erst,
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

// DAS URTEIL DER WETTER-WACHE (rein, Node): `w` = { vorher, nachher, uhrVorher, uhrNachher, buch } — `buch` die Einträge des
// Spions im Fenster einer Messung. ROT: ein Schreiber (nicht die Bühne) drehte das Wetter, ein roher Schreiber schrieb am
// `_setWeather` vorbei, die Uhr taut nach der Messung, oder ein eingefrorenes Wort ist danach ein anderes. Verweigerte Züge
// (die Wache hielt) sind grün und stehen je Quelle beim Namen.
function wetterUrteil(w) {
    const fest = (u) => Number.isFinite(u) && u < 0;
    const taeter = [];
    const verweigert = {};
    for (const e of w.buch || []) {
        if (e.art === "verweigert") {
            const k = `${e.quelle} → ${e.zu}`;
            verweigert[k] = (verweigert[k] || 0) + 1;
            continue;
        }
        if (e.quelle === "buehne") continue;
        const name = e.quelle && e.quelle !== "?" ? `${e.quelle} (${e.stapel})` : e.stapel;
        taeter.push(`${e.art === "roh" ? "ROH am _setWeather vorbei: " : ""}${e.von} → ${e.zu} durch ${name}`);
    }
    if (!fest(w.uhrNachher)) taeter.push(`die Uhr des Auto-Zugs taut (${w.uhrNachher})`);
    if (fest(w.uhrVorher) && w.nachher !== w.vorher && !taeter.length)
        taeter.push(`${w.vorher} → ${w.nachher} ohne gebuchten Schreiber (der Spion ist blind)`);
    return Object.assign({}, w, { urteil: taeter.length ? "ROT" : "GRUEN", taeter, verweigert });
}

// DER SELBSTTEST DES URTEILS (rein): jeder Täter fällt rot und steht beim Namen, Verweigerung und Bühne bleiben grün.
function wetterSelbsttest() {
    const v = [];
    const fest = { vorher: "sunny", nachher: "sunny", uhrVorher: -1e9, uhrNachher: -1e9 };
    const nex = { art: "schreiber", von: "sunny", zu: "rainy", quelle: "nexus", stapel: "weather ← dslEval ← dslRun" };
    const faelle = [
        ["ruhig", Object.assign({ buch: [] }, fest), "GRUEN", null],
        ["nexus", Object.assign({}, fest, { nachher: "rainy", buch: [nex] }), "ROT", "nexus"],
        [
            "hin und zurück",
            Object.assign({}, fest, { buch: [nex, Object.assign({}, nex, { von: "rainy", zu: "sunny" })] }),
            "ROT",
            "nexus",
        ],
        [
            "roh",
            Object.assign({}, fest, {
                nachher: "rainy",
                buch: [{ art: "roh", von: "sunny", zu: "rainy", quelle: null, stapel: "_loopFoo" }],
            }),
            "ROT",
            "ROH",
        ],
        [
            "alter Stand",
            Object.assign({}, fest, {
                nachher: "rainy",
                buch: [
                    Object.assign({}, nex, { quelle: "?", stapel: "weather ← dslEval ← dslRun ← _loopNexusUpdate" }),
                ],
            }),
            "ROT",
            "_loopNexusUpdate",
        ],
        ["taut", Object.assign({ buch: [] }, fest, { uhrNachher: 17.6 }), "ROT", "taut"],
        ["blind", Object.assign({ buch: [] }, fest, { nachher: "rainy" }), "ROT", "blind"],
        [
            "bühne",
            Object.assign({}, fest, {
                buch: [{ art: "schreiber", von: "rainy", zu: "sunny", quelle: "buehne", stapel: "x" }],
            }),
            "GRUEN",
            null,
        ],
        [
            "verweigert",
            Object.assign({}, fest, {
                buch: [{ art: "verweigert", von: "sunny", zu: "rainy", quelle: "emotion:sorrow", stapel: "y" }],
            }),
            "GRUEN",
            null,
        ],
    ];
    for (const [name, w, soll, taeter] of faelle) {
        const u = wetterUrteil(w);
        if (u.urteil !== soll) v.push(`${name}: ${u.urteil} statt ${soll}`);
        if (taeter && !u.taeter.some((t) => t.includes(taeter)))
            v.push(`${name}: der Täter „${taeter}" steht nicht im Urteil`);
    }
    const vw = wetterUrteil(faelle[8][1]).verweigert;
    if (vw["emotion:sorrow → rainy"] !== 1) v.push("verweigert: die verweigerte Quelle steht nicht beim Namen");
    return v;
}

// DAS URTEIL DER HIMMELS-WACHE (rein, Node; Leben-Schau 2, 09.10.: „Uhr und Wetter gehören dem Spieler"). `g` = ein getakteter
// Lauf des Spiels mit laufendem Nexus NACH dem Wort des Spielers: { phase: "gesetz" | "frei", uhr: { buch, gang, start, ende },
// takt: { schritte, schrittSek, tagMin }, wetter: { buch, wort, ende, freiAb }, zugSek, taeter: [{ name, wo, quelle, stapel }] }.
// ROT, beim Namen:
//   UHR    jeder Schreiber der Uhr im Fenster außer ihrem eigenen Gang (der Spieler sprach vorher; ein roher Schreiber am
//          Uhr-Schreiber vorbei); der Gang läuft nicht im Gesetz der Tag-Länge (Weg ≠ Schritte · Schritt / Tag) oder springt;
//          die Uhr steht am Ende anderswo als ihr Gang sagt, ohne gebuchten Schreiber (der Spion ist blind);
//   WETTER „gesetz": jede Änderung gegen das Wort des Spielers; „frei": jeder Schreiber außer dem Wetter-Zug (die Welt wünscht
//          nur), ein Zug schneller als `zugSek`, kein Wunsch der Welt im Buch, kein Zug zieht ein gewünschtes Wort;
//   TÄTER  ein Täter des Laufs steht nicht im Buch (er schrieb nicht oder der Spion ist blind).
// Verweigerte Züge und Wünsche sind grün und stehen je Quelle beim Namen.
function himmelUrteil(g) {
    const taeter = [];
    const verweigert = {};
    const gewuenscht = {};
    const hm = (t) => {
        const x = (((Number(t) % 1) + 1) % 1) * 24;
        const h = Math.floor(x);
        return `${String(h).padStart(2, "0")}:${String(Math.floor((x - h) * 60)).padStart(2, "0")}`;
    };
    const wer = (e) => (e.quelle && e.quelle !== "?" ? `${e.quelle} (${e.stapel})` : e.stapel);
    const U = g.uhr || { buch: [], gang: { n: 0, weg: 0, max: 0 } };
    const W = g.wetter || { buch: [] };
    let uhrSchreiber = 0;
    for (const e of U.buch || []) {
        if (e.art === "verweigert") {
            const k = `${e.quelle} → Uhr ${hm(e.zu)}`;
            verweigert[k] = (verweigert[k] || 0) + 1;
            continue;
        }
        uhrSchreiber++;
        taeter.push(
            `${e.art === "roh" ? "ROH am Uhr-Schreiber vorbei: " : ""}Uhr ${hm(e.von)} → ${hm(e.zu)} durch ${wer(e)}`
        );
    }
    const T = g.takt || {};
    const schritt = Math.min(1, T.schrittSek) / (T.tagMin * 60);
    const soll = T.schritte * schritt;
    const gang = U.gang || { n: 0, weg: 0, max: 0 };
    if (!(Number.isFinite(soll) && Math.abs(gang.weg - soll) <= 1e-6 + 1e-9 * T.schritte))
        taeter.push(
            `die Uhr läuft nicht im Gesetz der Tag-Länge: ihr Gang ${(gang.weg * T.tagMin * 60).toFixed(1)} s statt ` +
                `${(soll * T.tagMin * 60).toFixed(1)} s (${T.schritte} Takte zu ${T.schrittSek} s, Tag ${T.tagMin} min)`
        );
    if (gang.max > schritt + 1e-9)
        taeter.push(
            `die Uhr springt: größter Schritt ${(gang.max * 1440).toFixed(2)} min statt ${(schritt * 1440).toFixed(2)}`
        );
    const d = ((((U.ende - (U.start + gang.weg)) % 1) + 1.5) % 1) - 0.5;
    if (!uhrSchreiber && !(Math.abs(d) <= 1e-6))
        taeter.push(
            `die Uhr steht bei ${hm(U.ende)} statt ${hm(U.start + gang.weg)} ohne gebuchten Schreiber (der Spion ist blind)`
        );
    const zuege = [];
    let wetterSchreiber = 0;
    for (const e of W.buch || []) {
        if (e.art === "verweigert") {
            const k = `${e.quelle} → ${e.zu}`;
            verweigert[k] = (verweigert[k] || 0) + 1;
            continue;
        }
        if (e.art === "gewuenscht") {
            const k = `${e.quelle} → ${e.zu}`;
            gewuenscht[k] = (gewuenscht[k] || 0) + 1;
            continue;
        }
        if (g.phase === "frei" && e.quelle === "auto-zug") {
            zuege.push(e);
            continue;
        }
        wetterSchreiber++;
        taeter.push(
            g.phase === "frei"
                ? `${wer(e)} schreibt das Wetter selbst (${e.von} → ${e.zu}), statt dem Wetter-Zug sein Wort zu wünschen`
                : `Wetter ${e.von} → ${e.zu} gegen das Wort des Spielers („${W.wort}") durch ${wer(e)}`
        );
    }
    if (g.phase !== "frei" && !wetterSchreiber && W.ende !== W.wort)
        taeter.push(
            `das Wetter ist „${W.ende}" statt des Worts „${W.wort}" ohne gebuchten Schreiber (der Spion ist blind)`
        );
    if (g.phase === "frei") {
        let vor = Number.isFinite(W.freiAb) ? W.freiAb : null;
        const zugSek = g.zugSek || 120;
        for (const z of zuege) {
            if (vor != null && Number.isFinite(z.tv) && z.tv - vor < zugSek - (T.schrittSek || 0) - 1e-6)
                taeter.push(
                    `der Wetter-Zug zieht nach ${(z.tv - vor).toFixed(1)} s (${z.von} → ${z.zu}) statt nach ≥ ${zugSek} s`
                );
            if (Number.isFinite(z.tv)) vor = z.tv;
        }
        const wuensche = (W.buch || []).filter((e) => e.art === "gewuenscht");
        if (!wuensche.length) taeter.push("kein Wunsch der Welt im Buch (die Welt schweigt oder der Spion ist blind)");
        else if (!zuege.some((z) => wuensche.some((w) => w.seq < z.seq && w.zu === z.zu)))
            taeter.push(
                `kein Wetter-Zug zieht ein gewünschtes Wort (${zuege.length} Züge, ${wuensche.length} Wünsche)`
            );
    }
    for (const t of g.taeter || []) {
        const buch = t.wo === "uhr" ? U.buch || [] : W.buch || [];
        const da = buch.some(
            (e) =>
                (t.quelle && e.quelle && e.quelle.startsWith(t.quelle)) ||
                (t.stapel && String(e.stapel).includes(t.stapel))
        );
        if (!da) taeter.push(`${t.name}: nicht im Buch (${t.wo}) — er schrieb nicht oder der Spion ist blind`);
    }
    return { urteil: taeter.length ? "ROT" : "GRUEN", taeter, verweigert, gewuenscht, zuege: zuege.length };
}

// DER SELBSTTEST DES HIMMELS-URTEILS (rein): jeder eingeschmuggelte Täter fällt rot und steht beim Namen; der ruhige Lauf —
// die Uhr geht ihren Gang, die Welt wird verweigert oder wünscht, der Zug zieht im Takt das gewünschte Wort — bleibt grün.
function himmelSelbsttest() {
    const v = [];
    const takt = { schritte: 1000, schrittSek: 0.25, tagMin: 60 };
    const s = 0.25 / 3600;
    const gang = { n: 1000, weg: 1000 * s, max: s };
    const nein = (wo, quelle, zu) => ({
        art: "verweigert",
        von: wo === "uhr" ? 0.5 : "sunny",
        zu,
        quelle,
        stapel: "x",
    });
    const taeterG = [
        { name: "Nexus-Gesetz Uhr", wo: "uhr", quelle: "rule:nexus", stapel: "_tickWorldRules" },
        { name: "Nexus-Gesetz Regen", wo: "wetter", quelle: "rule:nexus", stapel: "_tickWorldRules" },
    ];
    const gesetz = (o) =>
        Object.assign(
            {
                phase: "gesetz",
                takt,
                uhr: { buch: [nein("uhr", "rule:nexus", 0.17)], gang, start: 0.5, ende: 0.5 + 1000 * s },
                wetter: { buch: [nein("wetter", "rule:nexus", "rainy")], wort: "sunny", ende: "sunny" },
                taeter: taeterG,
            },
            o
        );
    const frei = (buch, o) =>
        Object.assign(
            {
                phase: "frei",
                takt,
                zugSek: 120,
                uhr: { buch: [nein("uhr", "rule:nexus", 0.17)], gang, start: 0.5, ende: 0.5 + 1000 * s },
                wetter: { buch, wort: null, ende: "rainy", freiAb: 5 },
                taeter: taeterG,
            },
            o
        );
    const wunsch = {
        art: "gewuenscht",
        von: "sunny",
        zu: "rainy",
        quelle: "rule:nexus",
        stapel: "_tickWorldRules",
        tv: 10,
        seq: 1,
    };
    const zug = (tv, seq, von, zu) => ({
        art: "schreiber",
        von,
        zu,
        quelle: "auto-zug",
        stapel: "_loopWeatherAndGrowth",
        tv,
        seq,
    });
    const roh = {
        art: "roh",
        von: 0.5,
        zu: 0.17,
        quelle: null,
        stapel: "time_of_day ← dslEval ← _tickWorldRules ← loop",
    };
    const faelle = [
        ["gesetz ruhig", gesetz({}), "GRUEN", null],
        [
            "Nexus schreibt die Uhr",
            gesetz({
                uhr: {
                    buch: [
                        {
                            art: "schreiber",
                            von: 0.5,
                            zu: 0.17,
                            quelle: "rule:nexus",
                            stapel: "set_time_of_day ← _tickWorldRules",
                        },
                    ],
                    gang,
                    start: 0.5,
                    ende: 0.17,
                },
            }),
            "ROT",
            "rule:nexus",
        ],
        [
            "roh an der Uhr",
            gesetz({ uhr: { buch: [roh], gang, start: 0.5, ende: 0.17 } }),
            "ROT",
            "ROH am Uhr-Schreiber vorbei",
        ],
        [
            "die Uhr springt",
            gesetz({
                uhr: { buch: [], gang: Object.assign({}, gang, { max: 0.2 }), start: 0.5, ende: 0.5 + 1000 * s },
            }),
            "ROT",
            "springt",
        ],
        ["der Gang lahmt", gesetz({ takt: Object.assign({}, takt, { tagMin: 8 }) }), "ROT", "Gesetz der Tag-Länge"],
        [
            "blinde Uhr",
            gesetz({ uhr: { buch: [nein("uhr", "rule:nexus", 0.17)], gang, start: 0.5, ende: 0.17 } }),
            "ROT",
            "blind",
        ],
        [
            "Zug gegen das Wort",
            gesetz({
                wetter: {
                    buch: [nein("wetter", "rule:nexus", "rainy"), zug(130, 2, "sunny", "rainy")],
                    wort: "sunny",
                    ende: "rainy",
                },
            }),
            "ROT",
            "auto-zug",
        ],
        [
            "blindes Wetter",
            gesetz({ wetter: { buch: [nein("wetter", "rule:nexus", "rainy")], wort: "sunny", ende: "rainy" } }),
            "ROT",
            "blind",
        ],
        [
            "Täter fehlt",
            gesetz({ uhr: { buch: [], gang, start: 0.5, ende: 0.5 + 1000 * s } }),
            "ROT",
            "Nexus-Gesetz Uhr: nicht im Buch",
        ],
        ["frei ruhig", frei([wunsch, zug(130, 2, "sunny", "rainy")]), "GRUEN", null],
        [
            "frei: die Welt schreibt selbst",
            frei([wunsch, Object.assign({}, wunsch, { art: "schreiber", seq: 2 }), zug(130, 3, "rainy", "rainy")]),
            "ROT",
            "statt dem Wetter-Zug",
        ],
        [
            "frei: Zug im Galopp",
            frei([wunsch, zug(130, 2, "sunny", "rainy"), zug(160, 3, "rainy", "stormy")]),
            "ROT",
            "zieht nach 30.0 s",
        ],
        ["frei: die Welt schweigt", frei([zug(130, 2, "sunny", "rainy")]), "ROT", "kein Wunsch"],
        [
            "frei: der Zug hört nicht",
            frei([wunsch, zug(130, 2, "sunny", "stormy")]),
            "ROT",
            "kein Wetter-Zug zieht ein gewünschtes",
        ],
    ];
    for (const [name, g, soll, t] of faelle) {
        const u = himmelUrteil(g);
        if (u.urteil !== soll) v.push(`${name}: ${u.urteil} statt ${soll} (${u.taeter.join(" · ")})`);
        if (t && !u.taeter.some((x) => x.includes(t))) v.push(`${name}: der Täter „${t}" steht nicht im Urteil`);
    }
    const ruhig = himmelUrteil(faelle[0][1]);
    if (ruhig.verweigert["rule:nexus → Uhr 04:04"] !== 1 || ruhig.verweigert["rule:nexus → rainy"] !== 1)
        v.push(`verweigert: die Quellen stehen nicht beim Namen (${JSON.stringify(ruhig.verweigert)})`);
    if (himmelUrteil(faelle[9][1]).gewuenscht["rule:nexus → rainy"] !== 1)
        v.push("gewünscht: der Wunsch steht nicht beim Namen");
    return v;
}

// DAS URTEIL DER WELT-WACHE (rein, Node): `b` = das Buch des Welt-Akt-Spions im Fenster einer Messung (`__weltaktBuch(seit)`).
// ROT: kein Spion (die Werkbank kennt das Buch nicht), ein blinder Spion (das Spiel nennt keine Welt-Akte), ein Welt-Akt lief
// unter dem Halt durch — beim Op, bei der Quelle und beim Stapel. Verweigerte Akte (die Engstelle hielt) sind grün und stehen
// je Quelle und Op beim Namen.
function weltaktUrteil(b) {
    const taeter = [];
    const verweigert = {};
    if (!b) taeter.push("kein Welt-Akt-Spion (die Wache kennt `__weltaktBuch` nicht)");
    else {
        if (b.blind)
            taeter.push("das Spiel nennt keine Welt-Akte (AnazhRealm.DSL_WELTAKTE fehlt) — der Halt ist blind");
        for (const e of b.buch || []) {
            if (e.art === "verweigert") {
                const k = `${e.quelle} → ${e.op}`;
                verweigert[k] = (verweigert[k] || 0) + 1;
                continue;
            }
            taeter.push(`${e.op} durch ${e.quelle} unter dem Halt (${e.stapel})`);
        }
    }
    return Object.assign({}, b, { urteil: taeter.length ? "ROT" : "GRUEN", taeter, verweigert });
}

// DER SELBSTTEST DES URTEILS (rein): jeder durchgelaufene Akt fällt rot beim Namen, Blindheit und fehlender Spion fallen rot,
// Verweigerung bleibt grün und steht beim Namen.
function weltaktSelbsttest() {
    const v = [];
    const dorf = {
        art: "durch",
        op: "spawn_village",
        quelle: "nexus",
        stapel: "dslEval ← … ← dslRun ← _loopNexusUpdate",
    };
    const halt = { art: "verweigert", op: "creatures_size_mul", quelle: "nexus" };
    const buch = (eintraege, o) =>
        Object.assign({ seq: eintraege.length, gehalten: true, blind: false, buch: eintraege }, o);
    const faelle = [
        ["ruhig", buch([]), "GRUEN", null],
        ["nexus-dorf", buch([dorf]), "ROT", "spawn_village durch nexus"],
        [
            "gehalten und durch",
            buch([halt, Object.assign({}, dorf, { op: "spawn_creature" })]),
            "ROT",
            "spawn_creature",
        ],
        ["blind", buch([], { blind: true }), "ROT", "DSL_WELTAKTE fehlt"],
        ["kein spion", null, "ROT", "kein Welt-Akt-Spion"],
        ["verweigert", buch([halt, halt]), "GRUEN", null],
    ];
    for (const [name, b, soll, taeter] of faelle) {
        const u = weltaktUrteil(b);
        if (u.urteil !== soll) v.push(`${name}: ${u.urteil} statt ${soll}`);
        if (taeter && !u.taeter.some((t) => t.includes(taeter)))
            v.push(`${name}: der Täter „${taeter}" steht nicht im Urteil`);
    }
    if (weltaktUrteil(faelle[5][1]).verweigert["nexus → creatures_size_mul"] !== 2)
        v.push("verweigert: die verweigerte Quelle steht nicht beim Namen");
    return v;
}

module.exports = {
    wetterUrteil,
    wetterSelbsttest,
    himmelUrteil,
    himmelSelbsttest,
    weltaktUrteil,
    weltaktSelbsttest,
    AUSGABE_INSTALL:
        `window.__erstRuhe = ${erstRuhe.toString()};` +
        `window.__ausgabeAufnahme = ${ausgabeAufnahme.toString()};` +
        `window.__spielStapel = ${spielStapel.toString()};` +
        `window.__weltaktSpion = ${weltaktSpion.toString()};` +
        `window.__weltaktBuch = ${weltaktBuch.toString()};` +
        `window.__wetterSpion = ${wetterSpion.toString()};` +
        `window.__wetterBuch = ${wetterBuch.toString()};` +
        `window.__wetterSetzen = ${wetterSetzen.toString()};` +
        `window.__wetterHalten = ${wetterHalten.toString()};` +
        `window.__uhrSpion = ${uhrSpion.toString()};` +
        `window.__uhrBuch = ${uhrBuch.toString()};` +
        `window.__buehne = ${buehne.toString()};` +
        `window.__tiereHalten = ${tiereHalten.toString()};` +
        `(${saisonFest.toString()})();`,
};
