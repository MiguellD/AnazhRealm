// ausgabe-aufnahme.cjs — DIE EINE AUFNAHME der Look-Sonden (Gebot 10: die Linse nennt,
// was der Spieler SIEHT). Ein eigenes Render-Target liefert in r184 LINEARE, ungetonte Werte:
// `currentToneMapping`/`currentColorSpace` greifen nur am Ausgabe-Ziel (`isOutputTarget`). Die
// Beweisbilder aaa8–aaa11, die Wiesen- und die Fell-Linse lasen so — dunkle Schattenseiten, harte
// Kontraste, ausgebrannte Lichter, die das Spiel nie zeigt (das Ausgabe-Target trifft den Canvas-
// Screenshot pixelgleich im Bild).
//
// Der Weg hier: das Render-Target wird per `setOutputRenderTarget` zum Ausgabe-Puffer, dann läuft
// der ECHTE Frame (`_loopRender` → Post-Pipeline → Tonkurve + sRGB + Post-FX) hinein. Gelesen wird
// TOP-DOWN RGBA. Der Aufrufer pausiert den Spiel-Loop (Lehre 17) und setzt Kamera/Schatten selbst.
//
// Gebrauch: einmal `await page.evaluate(AUSGABE_INSTALL)` nach dem Laden, im Seiten-Kontext
// `window.__buehne()` vor jedem Schuss und `const { u8, info, ms } = await window.__ausgabeAufnahme(W, H)`.

// DIE BÜHNE der Beweisbilder: Mittag · Sonne · Sommer, fest — „vorher↔nachher unter gleichen Bedingungen“. Drei Uhren
// liefen in den Sonden frei: das WETTER (Auto-Zug alle 120 s; an derselben Wiese sonnig 90,2 · Regen 40,3 Helligkeit),
// die JAHRESZEIT (Jahr 2400 s, der Saison-Flip baut jedes Foundry-Asset neu), jede SHADER-ZEIT des Bilds (A8: wasser
// 0,17–0,69 am selben Code). Die Saison hält `saisonFest`, sobald die Welt existiert; die Bühne setzt Zeit und Wetter
// über den EINEN Wetter-Schreiber (ohne 45-s-Cross-Fade, der Regen fällt im selben Zug), die EINE Bild-Uhr auf T (A9).
// Die Tageszeit ist ein Wort der Bühne wie Wetter und Saison (`o.uhr`, die Uhr der Zelle; ohne Wort Mittag).
const { KAMERA_NAH_INSTALL } = require("./kamera-nah.cjs");
const { ABNAHME_INSTALL, cielab, linSrgb, SCHWELLEN } = require("./abnahme-urteil.cjs");

// DER SEITENFEHLER-ZÄHLER der Abnahme (das Feld `seitenfehler`): jeder ungefangene Fehler und jede verworfene Zusage seit dem
// Einbau der Aufnahme.
function seitenfehlerZaehlen() {
    if (window.__seitenfehlerZaehlt) return;
    window.__seitenfehlerZaehlt = true;
    window.__seitenfehler = 0;
    window.addEventListener("error", () => window.__seitenfehler++);
    window.addEventListener("unhandledrejection", () => window.__seitenfehler++);
}

function saisonFest() {
    if (r?.state) st.autoSeason = false;
    else setTimeout(saisonFest, 50);
}

// DIE WETTER-WACHE der Bühne (die EINE Stelle, die das Wetter einer Messung hält): der Halt (`weatherEffectTime`) steht
// eingefroren unter 0 — ein schon eingefrorener Wert bleibt, wie er ist. Die Bühne ruft sie, und jede Schleife, die Takte am
// Stück fährt (`werkbank lauf`, die Schirm-Wand), ruft sie je Takt. Solange er unter 0 steht, verweigert der EINE
// Wetter-Schreiber des Spiels (`_setWeather`) jeden Zug — Emotions-Effekt, Nexus, Gesetz, Mitspieler — und der Auto-Zug
// verbraucht seinen Takt der Welt-Uhr ohne Wort; im Spiel steht der Halt auf 0. Gehalten ist, was unter 0 steht — die Regel des
// Spiels (`_messHalt`), jeder Leser hier liest sie so.
function wetterHalten() {
    window.__wetterSpion();
    const u = st.weatherEffectTime;
    if (!(u < 0)) st.weatherEffectTime = -1e9;
}

// DER STAPEL DER SPIONE: die Spiel-Rahmen des Stapels (stamm/), der jüngste zuerst — die Rahmen der Linse zählen nicht.
// Ein DSL-Programm trägt beliebig tief verschachtelte Interpreter-Rahmen (dslEval ← random ← dslEval ← repeat …): der Name ist
// dann der Effekt und wer `dslRun` rief (der Täter: Emotion, Nexus, Gesetz …).
function spielStapel() {
    const lim = Error.stackTraceLimit;
    Error.stackTraceLimit = 60;
    const zeilen = String(new Error().stack || "").split("\n");
    Error.stackTraceLimit = lim;
    const namen = [];
    for (const l of zeilen) {
        if (!/anazhRealm\.js|\/stamm\/[a-z0-9-]+\.js/.test(l)) continue;
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
    if (!Object.hasOwn(r, "_setWeather"))
        r._setWeather = function (name, quelle) {
            const vor = this.state.weather;
            const q0 = S.quelle,
                s0 = S.stapel;
            S.quelle = S.buehne ? "buehne" : quelle || "?";
            S.stapel = wer();
            try {
                // der Zug (sein Übergang, sein Wunsch) und der Akt reisen durch die Hülle (`arguments`) — bis feld.K2#2 fielen sie hier weg
                const ok = Object.getPrototypeOf(this)._setWeather.apply(this, arguments);
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
    const u = st.weatherEffectTime;
    return {
        seq: S.seq,
        wetter: st.weather,
        uhr: Number.isFinite(u) ? +u.toFixed(1) : null,
        fest: u < 0,
        buch: S.buch.filter((e) => e.seq > (seit || 0)),
    };
}

// Die Bühne setzt das Wetter IHRER Messung: der Halter selbst ist der eine Schreiber, den der Halt durchlässt — die Uhr
// taut für DIESEN Zug (im Buch Quelle „buehne") und steht danach wieder, wie sie stand (oder eingefroren). Der Cross-Fade
// fällt. Die Bühne spricht wie der Spieler („setze wetter sonnig", wie jede Spur der Leben-Schau): das Gesetz der Schreiber
// lässt die Welt das Wetter nie direkt schreiben — sie wünscht nur das nächste Wort des Zugs. `zug`: der Übergang des Spiels
// bleibt (der Wetter-Zug der Licht-Linse). Ohne Zug fällt der Übergang im Bild UND auf dem Weg des Regens: `__uebergangFaellt`
// (welt-boot.cjs, in jeder Seite: der Zweig des Spiels für ein Wort ohne Übergang). Bis
// w28-wetter-ohne-rampe fiel nur der Übergang des Bilds, die Stempel blieben als Rampe von 45 s ± Gemüt liegen (`_setWeather` hatte
// sie gelegt): 10 s Niesel stempelten 23,6–24,4 s, jeder Leser von Pegel und Abfluss nach der Bühne las die Rampe mit
// (planet.wasser.kreislauf S1: Bilanz 2,087 / 2,332 statt ≈ 1).
function wetterSetzen(wort, zug) {
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
    if (!zug) window.__uebergangFaellt(r);
    return st.weather;
}

// DER UHR-SPION (die Linse der Uhr, Leben-Schau 2): JEDER Schreiber der Tageszeit (`state.timeOfDay`) beim Namen.
// Der EINE Uhr-Schreiber des Spiels (`_uhrSetzen`, falls es ihn gibt) bucht je Aufruf seine Quelle (`human` · `regler` ·
// `nexus` · `rule:…` · `laden` …) und einen verweigerten Zug als „verweigert"; `state.timeOfDay` selbst trägt einen Accessor:
// wer die Uhr am Schreiber vorbei setzt, steht als „roh" mit den Spiel-Rahmen seines Stapels im Buch (in der Schau: ein
// Nexus-Gesetz „time_of_day ← dslEval ← _tickWorldRules"). Der eigene Gang der Uhr (Quelle „uhr", oder ohne Schreiber ein
// Stapel aus `tickDayNight`) bucht nicht je Takt, er summiert: Schritte, Weg (Tag-Bruchteile vorwärts), größter Schritt.
function uhrSpion() {
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
    if (!Object.hasOwn(r, "_uhrSetzen"))
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

// DER WELT-AKT-SPION (die Linse der Welt-Wache, 0710-7): jeder Welt-Akt der DSL beim Namen. Unter dem Halt einer Messung (die
// Uhr des Wetter-Zugs unter 0, `__wetterHalten`) verweigert die EINE Engstelle des Spiels (`dslEval`) jeden Welt-Akt
// (`AnazhRealm.DSL_WELTAKTE`) und bucht ihn (`_weltaktGehalten`) — der Spion hört dort mit: „verweigert" mit Op und Quelle.
// Und er hüllt jeden Welt-Akt der Effekt-Tafel (`dslEffects`): läuft einer unter dem Halt trotzdem, steht er als „durch" mit
// Quelle und Stapel im Buch — der Täter. Nennt das Spiel keine Welt-Akte, ist der Spion blind (das Urteil ROT); er hüllt dann
// die Akte, die sein Aufrufer nennt (`ersatz`), damit der Täter trotzdem beim Namen steht. Das Buch liest `__weltaktBuch(seit)`,
// das Urteil `weltaktUrteil` (rein, unten).
function weltaktSpion(ersatz) {
    const S =
        window.__weltaktSpionBuch ||
        (window.__weltaktSpionBuch = { seq: 0, buch: [], blind: false, huellen: new WeakMap() });
    const liste = AnazhRealm.DSL_WELTAKTE;
    S.blind = !Array.isArray(liste);
    const halt = () => {
        const u = st.weatherEffectTime;
        return u < 0;
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
            if (halt()) buche({ art: "durch", op, quelle: ctx?.source || "?", stapel: window.__spielStapel() });
            return fn.call(this, args, ctx);
        };
    }
    if (!S.blind && !Object.hasOwn(r, "_weltaktGehalten"))
        r._weltaktGehalten = function (op, ctx) {
            buche({ art: "verweigert", op, quelle: ctx?.source || "?" });
            return Object.getPrototypeOf(this)._weltaktGehalten.call(this, op, ctx);
        };
    return S;
}

// Das Buch des Welt-Akt-Spions seit `seit` (seq) und der Halt jetzt.
function weltaktBuch(seit) {
    const S = window.__weltaktSpion();
    const u = st.weatherEffectTime;
    return {
        seq: S.seq,
        gehalten: u < 0,
        blind: S.blind,
        buch: S.buch.filter((e) => e.seq > (seit || 0)),
    };
}

// DIE LESER DER BILD-UHR `_bildZeit` (A9), [Name, Halter, Schlüssel] — die Uhr-Wache prüft, dass jeder mit ihr steht.
function bildUhren() {
    const wu = st.windUniforms || {};
    const v2 = wu.uWindDir?.value;
    const u = [
        ["himmel", st.skyboxUniforms?.time, "value"],
        ["wasser", st.hydroSurfaceUniforms?.time, "value"],
        ["wind", wu.uWindTime, "value"],
        ["böe-phase", wu.uBoePhase, "value"],
        ["wind-x", v2, "x"],
        ["wind-z", v2, "y"],
        ["böe", r, "_weatherWob"],
        ["fell", st.renderer?._nodes?.nodeFrame, "time"],
        ["regen", r._rainSystem?.uZeit, "value"],
    ];
    for (const [n, m] of r._portalMembranes || [])
        if (m.u) u.push([`tor ${n}`, m.u.time, "value"], [`puls ${n}`, m.u.pulse, "value"], [`glut ${n}`, m, "puls"]);
    return u.filter((x) => x[1]);
}

// DIE UHR DER BÜHNE (A9): die Bühne hält die Bild-Uhr `_bildZeit` und die Wolken-Uhr `_wolkenZeit` auf T = 12,5 s und zählt jeden Zug des Loops, den
// sie verweigert (die Uhr-Wache liest ihn); das Tor, das im Takt schreibt, liest sie einmal beim Halt.
function uhrHalten() {
    const S = window.__buehneUhr || (window.__buehneUhr = { T: 12.5, verweigert: 0 });
    const d = Object.getOwnPropertyDescriptor(r, "_bildZeit");
    if (d?.get?.__buehne) return;
    const get = Object.assign(() => S.T, { __buehne: true });
    // … und die Wolken-Uhr (w28-wolke-zeit, Spiel-Zeit + Saat) auf demselben T: die Wolken der Bühne liegen wie vorher
    for (const uhr of ["_bildZeit", "_wolkenZeit"])
        Object.defineProperty(r, uhr, { configurable: true, enumerable: true, get, set: () => void S.verweigert++ });
    r._tickPortalMembranes(r.state.spielZeit); // das Tor altert auf der Spiel-Zeit wie im Takt (w28-welt-uhr)
}

// DIE WELT STEHT (A9, `_weltSteht`): vor jedem Schuss wartet die Bühne auf sie über das EINE Einschwingen (welt-boot
// `__weltStehtNach`, der Takt der Seite) und stellt nach jedem Takt Kamera und Stunde zurück; der Deckel `max` zählt
// nur Takte ohne Offenes (`_weltOffen`) — den Bau bricht seine Frist. Sonst bricht der Schuss LAUT beim Täter.
async function weltStehtWarten(max) {
    // EINE GEHALTENE TASTE (w28-linse-wahr, F): der Leib geht, der Wagen fährt — die Welt steht nie. Die Fahrt der Augen-Karte (fahrt/01)
    // brach nach der Frist bei „archLod“; der Grund ist die Taste, und ein Bild aus Bewegung schießt `werkbank bild --bewegung`
    const g = Object.entries(st.verbTafel?.gehalten || {}).filter(([, an]) => an).map(([k]) => k);
    if (g.length) throw new Error(`DIE WELT STEHT NIE: ${g.join(", ")} gehalten — ein Bild aus Bewegung schießt \`werkbank bild --bewegung <Taste>[:m]\``);
    const cam = st.camera;
    const [p, q, fov, uhr] = [cam.position.clone(), cam.quaternion.clone(), cam.fov, st.timeOfDay];
    const takt = async () => {
        await __seitenTakt();
        cam.position.copy(p);
        cam.quaternion.copy(q);
        if (cam.fov !== fov) (cam.fov = fov), cam.updateProjectionMatrix();
        cam.updateMatrixWorld(true);
    };
    // steht sie schon, schießt die Bühne ohne Takt (ein Takt rendert und tickt, was die Linse für den Schuss gesetzt hat)
    const n = r._weltSteht() ? 0 : await __weltStehtNach(takt, max);
    if (st.timeOfDay !== uhr) r._uhrSetzen(uhr, "regler");
    // DER HIMMEL DES SCHUSSES (A9-n2): die Umgebung frisch aus der Stunde, die jetzt gilt (die Drift-Schwelle hielt sonst die
    // Malung des Boots: Belichtung Erst-Boot 0,9935, Zweit-Boot 0,9904), das Gemüt ruhig wie in der Bühne
    for (const k in st.player?.emotions || {}) st.player.emotions[k] = 0;
    r._applyDayNightToScene();
    await r._himmelFrisch();
    r._applyDayNightToScene();
    const W = r._weltStand || {};
    if (!r._weltSteht()) throw new Error(`DIE WELT STEHT NICHT nach dem Himmel des Schusses: zuletzt brach sie: ${W.grund}`);
    return n;
}

function buehne(o) {
    // die Bühne bindet die Welt selbst: ihr Selbsttest ruft sie in Node mit einem gestellten `window` (`buehneSelbsttest`)
    const r = window.anazhRealm;
    const st = r.state;
    // DIE ZEIT DES ORTS (messort-zeit): steht die Welt an einem Ort mit Zeit, hält die Bühne ohne Wort der Zelle, was die Welt dort
    // nahm (`__ortZeit`: Uhr, Wetter, Saison nach den Worten des Spielers — ihr EINER Leser ist `werkbank umstellen --ort`); ohne
    // Ort mit Zeit Mittag, Sonne und Sommer
    const z = window.__ortZeit || null;
    const w = o?.wetter || z?.wetter || "sunny";
    // DIE UHR DER BÜHNE (w4-himmel-uhr): das Wort der Zelle (`o.uhr` 0..1 — werkbank `bild --uhr`, `licht --uhr`, die Zellen am
    // Spawn), ohne Wort die Uhr des Orts, sonst Mittag. Bis dahin hielt die Bühne nur Mittag: die Licht-Bilanz (`__lichtBilanz`) maß
    // um 0,3 und 0 den Mittag, der Schuss setzte seine Stunde erst danach. Die fehlende Uhr prüft `== null` zuerst
    // (`Number(null) === 0`, Lehre 17), ein Wort außerhalb [0, 1] bricht laut, ehe die Bühne etwas setzt
    const uhr = o?.uhr == null ? (z ? z.uhr : 0.5) : o.uhr;
    if (!(typeof uhr === "number" && uhr >= 0 && uhr <= 1)) throw new Error(`DIE BÜHNE: die Uhr ${uhr} gilt nicht`);
    window.__weltaktSpion();
    st.autoSeason = false;
    const s = r.setSeason(o?.saison || z?.saison || "sommer");
    // … über den EINEN Schreiber der Uhr (`_uhrSetzen`, das Wort des Reglers): die Bühne BESTELLT die Stunde bei der Welt — der Anker
    // des Gangs, der Sprung des Himmels und die Wahl des Licht-Pools folgen ihr. Bis beobachter-ein-weg schrieb sie `state.timeOfDay`
    // daneben (und einen `state.world`, den es nicht gibt)
    if (!r._uhrSetzen(uhr, "regler")) throw new Error(`DIE BÜHNE: die Welt nimmt die Uhr ${uhr} nicht`);
    // … und der Pool der Leuchtquellen zu seinem Fixpunkt (bis 31.10. wartete `bild` ihn ab, bis zu 20 × 50 ms je Schuss): jede
    // Gewählte hält ihren Platz mit Blende 1, jede Abgewählte fällt mit 0 — danach ändert kein Takt mehr etwas (die Bild-Uhr steht,
    // die Wahl am stehenden Auge)
    if (o?.uhr != null || z)
        for (let i = 0, P; i < 3; i++)
            if ((r._leuchtTakt(), (P = r._leuchtPool)))
                P.halter.forEach((h, j) => (P.blende[j] = h && P.wahl.some((w) => w.id === h.id) ? 1 : 0));
    // Wetter und Saison: das Wort des Spielers (`o`, werkbank `bild --wetter --saison`), sonst Sonne und Sommer — über den
    // EINEN Schreiber, dann eingefroren (`__wetterSetzen`), der Regen zur Bild-Uhr; ein falsches Wort bricht laut
    if (!s || window.__wetterSetzen(w) !== w) throw new Error(`DIE BÜHNE: das Wort gilt nicht ${JSON.stringify(o)}`);
    window.__uhrHalten();
    // DER GANG DES TAGS STEHT (die Uhr der Zelle, Lehre 17): die Tag-Länge des Halts, mit der `werkbank sicht --tag steht` den Tag
    // hält — eine Linse, die die Sonne laufen lässt, setzt ihre eigene (`sicht --sonne`, die Erstarrung der Wasser-Linse); das Laden
    // setzt sie nie, die Grundstellung der Sitzung trägt sie zurück. Bis w14-lod-uebergang ging der Tag unter der Bühne nach der
    // Wanduhr weiter: lod.K2#1 (Radeon, 1–3 s Wanduhr je Schuss-Paar) drehte die Sonne zwischen zwei Schüssen derselben Pose, jede
    // Stufe der Sonne schob die Halm-Schatten der ganzen Wiese — im Stand 55 000 von 60 000 Pop-Pixeln je Schritt.
    st.dayLengthMinutes = 1e12;
    // die Nässe der Bühne: `o.naesse` Sekunden des Worts (die Linse `werkbank licht --naesse`), sonst sein Ruhezustand
    r._naesseTakt(o?.naesse ?? 1e6);
    r._tickRain();
    // Das Gemüt des Spielers färbt das Licht (die Tönung, `_dayNightComputeTint`): die Bühne hält es ruhig (A9-n2, Licht-Bilanz 5,156 ↔ 5,169)
    for (const k in st.player?.emotions || {}) st.player.emotions[k] = 0;
    // Die Bühne SPRINGT Uhr, Wetter und Saison: der Sprung des Himmels (`_himmelSprung`, das Gesetz des Uhr-Schreibers) malt
    // die Himmels-Umgebung beim Anwenden des Tags aus den Quellen, die jetzt gelten — an der Raten-Drossel vorbei, nie an der
    // Drift-Schwelle; ohne Drift malt der Sprung nichts (das Einschwingen von `werkbank band` ruft die Bühne je Takt).
    r._himmelSprung = true;
    r._applyDayNightToScene();
    // … und die Saison im Takt des Jahrs (`_tickSeason`): Tönung und Schneegrenze (stoffe.K3-2) — bis dahin zeigte `--saison
    // winter` den Boden des Sommers, bis der Loop sie zufällig tickte
    r._tickSeason();
    // DIE TIERE DER BÜHNE (`o.tiere` n, `werkbank lauf --tiere 50`, Profiband K1 „Sturm"): n Tiere frei im Ring 15–60 m um den
    // Spieler, aus EINEM Samen, mit der Seele des Spiels (`spawnCreatureAt`, die Kappe hebt sich um sie); ein zweiter Ruf füllt
    // nur auf, was fehlt. Stehen nicht alle, bricht die Bühne laut.
    const buehnenTiere = () => st.creatures.filter((c) => c.userData.buehne).length;
    if (o?.tiere > 0) {
        const p = st.playerMesh.position;
        st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + o.tiere - buehnenTiere());
        let saat = 11;
        const zufall = () => (saat = (saat * 1664525 + 1013904223) >>> 0) / 4294967296;
        for (let i = 0; i < 400 && buehnenTiere() < o.tiere; i++) {
            const w = zufall() * 2 * Math.PI, d = 15 + 45 * zufall(), x = p.x + d * Math.cos(w), z = p.z + d * Math.sin(w);
            const c = r._landAt(x, z, 0.3) && r.spawnCreatureAt(x, r.getTerrainHeightAt(x, z) + 0.3, z, "happy");
            if (c) c.userData.buehne = true;
        }
        if (buehnenTiere() < o.tiere) throw new Error(`DIE BÜHNE: ${buehnenTiere()} von ${o.tiere} Tieren stehen`);
    }
    return { saison: st.season, phase: st.seasonPhase, wetter: st.weather, tiere: buehnenTiere() };
}

// DIE TIERE DER BÜHNE im Selbsttest (ohne Welt, Attrappen; Land nur östlich des Spielers): 50 Tiere stehen im Ring 15–60 m auf
// Land, ein zweiter Ruf stellt keines dazu, eine Welt ohne Platz bricht laut. DIE UHR DER BÜHNE: das Wort 0,3 steht in Welt und
// Stand, ohne Wort (`null`) steht Mittag (`Number(null) === 0` wäre Mitternacht), ein falsches Wort bricht laut und lässt die Uhr,
// wo sie stand.
function buehneSelbsttest() {
    const v = [], tiere = [], w0 = global.window;
    let uhr0; // die Uhr der Attrappe: ihr Zustand liest sie, nur ihr Schreiber (`_uhrSetzen`) stellt sie
    const r = {
        state: {
            creatures: tiere,
            maxCreatures: 10,
            playerMesh: { position: { x: 5, z: 7 } },
            get timeOfDay() {
                return uhr0;
            },
        },
        setSeason: () => true,
        _naesseTakt() {},
        _tickRain() {},
        _tickSeason() {},
        _applyDayNightToScene() {},
        _leuchtTakt() {},
        _uhrSetzen: (t) => ((uhr0 = t), true),
        getTerrainHeightAt: () => 0,
        _landAt: (x) => x > 5,
        spawnCreatureAt: (x, y, z) => tiere[tiere.push({ position: { x, z }, userData: {} }) - 1],
    };
    global.window = { anazhRealm: r, __weltaktSpion() {}, __wetterSetzen: (w) => (r.state.weather = w), __uhrHalten() {} };
    try {
        buehne({ wetter: "stormy", tiere: 50 });
        const ring = tiere.filter(
            (c) => c.position.x > 5 && Math.abs(Math.hypot(c.position.x - 5, c.position.z - 7) - 37.5) <= 22.5
        );
        if (tiere.length !== 50 || ring.length !== 50 || r.state.weather !== "stormy")
            v.push(`Sturm + 50 Tiere: ${tiere.length} gestellt, ${ring.length} im Ring auf Land, Wetter ${r.state.weather}`);
        if (buehne({ tiere: 50 }).tiere !== 50 || tiere.length !== 50) v.push(`der zweite Ruf stellt ${tiere.length - 50} dazu`);
        r._landAt = () => false;
        let laut = "still";
        try {
            buehne({ tiere: 60 });
        } catch (e) {
            laut = e.message;
        }
        if (!/50 von 60/.test(laut)) v.push(`eine Welt ohne Platz bricht nicht laut (${laut})`);
        const uhr = (o) => {
            try {
                return buehne(o) && `${r.state.timeOfDay}`;
            } catch {
                return `laut/${r.state.timeOfDay}`;
            }
        };
        const ist = [0.3, null, "nacht"].map((u) => uhr({ uhr: u })).join(" ");
        if (ist !== "0.3 0.5 laut/0.5") v.push(`die Uhr der Bühne: ${ist}`);
        // DIE ZEIT DES ORTS (messort-zeit): ohne Wort der Zelle hält die Bühne Uhr, Wetter und Saison, die die Welt am Ort nahm
        // (`__ortZeit`), das Wort der Zelle geht vor
        const saison = [];
        r.setSeason = (s) => saison.push(s) > 0;
        window.__ortZeit = { uhr: 0.3, wetter: "foggy", saison: "autumn" };
        const amOrt = [uhr({}), r.state.weather, saison.at(-1), uhr({ uhr: 0.6, wetter: "sunny", saison: "winter" }), r.state.weather, saison.at(-1)];
        if (amOrt.join(" ") !== "0.3 foggy autumn 0.6 sunny winter") v.push(`die Zeit des Orts in der Bühne: ${amOrt.join(" ")}`);
    } finally {
        global.window = w0;
    }
    return v;
}

// DIE MEMBRAN OHNE FILM (D8, die Linse milchweiss — K5 `klassenMasse` liest Milch gegen das Bild ohne Film): `an` setzt jeder
// Membran der Welt den Ziel-Knoten ihres Graphen (`_membranGraph` → ohneFilm: nur das Panorama der Ziel-Welt) als Farbe, `an`
// false den Stoff zurück. Dieselbe Pose, dieselbe Uhr, derselbe Ausgabe-Pfad: der Unterschied zweier Bilder ist der Film.
// EINE MEMBRAN OHNE ZIEL IM GRAPHEN (D8-n1, Prüfer: der stille Rückfall las die Milch der Basis als Ziel — milchweiss 0,0004 auf
// dem milchigen Bild): ihre Schicht hat nichts, was als Ziel gälte — das Bild ohne sie zeigt die Öffnung OHNE die Schicht (jedes
// Mesh des Eintrags, auch ein Nebel-Kasten von vor D8, über die Sichtbarkeit seines Stoffs, die der Membran-Tick nie setzt). So
// liest dieselbe Regel jede Basis: Milch ist, was die Schicht dem hinzufügt, was ohne sie dort stünde. Zurück die Zahl der
// Membranen und wie viele davon ohne Ziel standen.
function membranOhneFilm(an) {
    let n = 0,
        ohneZiel = 0;
    for (const rec of r._portalMembranes ? r._portalMembranes.values() : []) {
        const mat = rec.mesh?.material;
        if (!mat) continue;
        n++;
        const G =
            rec.tor?.gesetz ? r._membranGraph(rec.tor.gesetz) : null;
        if (G?.ohneFilm) {
            if (an) {
                rec.__farbeVorFilm = mat.colorNode;
                mat.colorNode = G.ohneFilm;
            } else if (Object.hasOwn(rec, "__farbeVorFilm")) {
                mat.colorNode = rec.__farbeVorFilm;
                delete rec.__farbeVorFilm;
            }
            mat.needsUpdate = true;
            continue;
        }
        ohneZiel++;
        if (an) {
            const stoffe = [];
            for (const v of Object.values(rec))
                if (v?.isObject3D)
                    v.traverse((o) => {
                        for (const m of [].concat(o.material || [])) if (m && !stoffe.includes(m)) stoffe.push(m);
                    });
            rec.__sichtVorFilm = stoffe.map((m) => [m, m.visible]);
            for (const m of stoffe) m.visible = false;
        } else if (rec.__sichtVorFilm) {
            for (const [m, v] of rec.__sichtVorFilm) m.visible = v;
            delete rec.__sichtVorFilm;
        }
    }
    return { n, ohneZiel };
}

// DER HALTER (mess, Gebot 10): EINE Stelle hält, was sich zwischen zwei Schüssen bewegt — je Quelle ein Schalter
// (`window.__halteQuellen`; `window.__offen` lässt eine laufen, so misst die Rausch-Linse Δ je Quelle und nennt den Täter beim Namen).
//   Im Schuss (`__ausgabeAufnahme`): `spiegel` — der Spiegel-Pass (Wasser, Glanz) rechnet nur im ersten gezählten Frame; seine
//     Ruhe-Regel (500 ms und 24 Bilder, der Stand von Feld und Licht) rechnete ihn in jedem Schuss zu einer anderen Frame-Zahl
//     neu: Radeon, S2 (Genesis, Blick 0), je Uhr vier Paare — Third bis 0,20 / 0,54 / 0,58 % der Pixel über der Schwelle (Uhr
//     0,5 / 0,3 / 0), Ego bis 0,015 %; gehalten 0 in 24 von 24 Paaren (die GTX-Tafel a-spawn-gtx3: 0,23–0,57 % in jeder
//     Third-Zelle) · `zitter` — TAAU-Zitter, Geschichte und Dither beginnen je Schuss von vorn · `uhr` — die Bild-Uhr der Bühne
//     (Wind, Wolken, Wasser, Membran, Brunnen, Fell).
//   Zwischen den Schüssen (`__halten(quellen)`, die Takte von Blick-Wahl und Einschwingen; ohne Wort nur `tiere`): `tiere` — x/z
//     nach jedem Kreatur-Takt zurück (Animation, Haut, Boden und LOD laufen weiter, die Vögel fliegen) · `bewohner` und `wagen` —
//     ihr Takt ruht · `leib` — Atem und Kontrapost des Spielers stehen in der Pose ihres Halts.
// Die Marke trägt die Hülle, nie der Prototyp: er trägt nie Stand (`_weltAbschied` bricht beim Namen) — bis 30.10. lag
// `__tiereGehalten` auf ihm, und jeder Tausch am Ort nach einem gehaltenen Lauf brach an dieser Marke. Offen rechnet der
// Spiegel in jedem Frame des Schusses neu (die Rausch-Linse der Station zug/a-spawn.cjs misst so seinen Lauf).
// Die Hülle ist ein Instrument der Werkbank, keine Probe: sie trägt ihre Absicht für die Wirt-Wache (`__wirtBleibt`, lib/wirt-wache.cjs)
// — ohne gehaltene Quelle reicht sie durch, und was gehalten bleibt, gibt der Halt der Sitzung frei (punkte.cjs `messHaltRuf`)
function halten(quellen) {
    const P = Object.getPrototypeOf(r),
        H = (window.__gehalten ||= new Set()),
        zu = (q) => H.has(q) && !window.__offen?.has(q),
        bleibt = "die Hülle des Halters der Werkbank (ausgabe-aufnahme halten)",
        huelle = (m, f) => P[m].__gehalten || (P[m] = Object.assign(f(P[m]), { __gehalten: true, __wirtBleibt: bleibt }));
    for (const q of quellen || ["tiere"]) H.add(q);
    huelle("updateCreatures", (g) =>
        function (d) {
            const v = zu("tiere") ? this.state.creatures.map((c) => [c.position, c.position.x, c.position.z]) : [];
            g.call(this, d);
            for (const [p, x, z] of v) (p.x = x), (p.z = z);
        });
    huelle("_tickBewohner", (g) =>
        function (d) {
            zu("bewohner") || g.call(this, d);
        });
    huelle("_tickVerkehr", (g) =>
        function () {
            zu("wagen") || g.call(this);
        });
    huelle("animatePlayerSoul", (g) =>
        function (t) {
            g.call(this, zu("leib") ? (H.t ??= t) : (H.t = t));
        });
    // DIE SKALA DES SCHUSSES (w28-bild-preis, `ausgabeAufnahme`): gehalten zeichnet die Szene in `SZENE_SKALA`, nie in der am Gerät
    // eingemessenen (`_szeneSkalaMessen`); der Wert des Spielers gilt immer, ohne zeitliche Auflösung ist sie 1 wie im Spiel
    huelle("_szeneSkalaWirk", (g) =>
        function () {
            return zu("skala") && this.state._traa && this.state.szeneSkala == null ? this.constructor.SZENE_SKALA : g.call(this);
        });
    // im Schuss rechnet der Pass gehalten nur über den Sprung des ersten gezählten Frames (`_traaR.neu` → `L.an` 0), offen in jedem
    huelle("_spiegelPassWach", (g) =>
        function (L) {
            return window.__imSchuss ? !zu("spiegel") : g.call(this, L);
        });
}

// DIE RUHE DER ERST-ZEICHNUNG (`_configureRenderer`) — die EINE Regel jeder Linse, die ein angekommenes Bild
// misst (die Ausgabe-Aufnahme, der Ziel-Zensus): was zum ersten Mal zeichnet, baut je Render-Aufruf einen Stoff und lässt
// seine Pipeline asynchron entstehen; in Frames am Stück erfüllt sich kein Versprechen. `frame` schaltet Frames mit einer
// Pause für den GPU-Prozess, bis ein Frame nichts mehr baut oder verschiebt, kein Draw auf seine Pipeline wartet und keine
// Pipeline offen ist. Steht die Erst-Zeichnung `opt.erstFristMs` (120 s) ohne Fortschritt oder fünfmal so lange insgesamt,
// bricht `wer` LAUT ab und nennt jede offene Pipeline beim Namen. Ohne Erst-Zeichnung (Null-Renderer) null.
// `opt.nurGezeichnete`: ein Bild, das nur einen Teil der Szene zeichnet (eine Render-Objekt-Funktion lässt Bürger
// aus), wartet nur auf das, was es zeichnet — der Frame baut nichts, verschiebt nichts, kein Draw wartet; offene Pipelines
// ausgelassener Bürger (die Welt stieß sie vor dem Bild an) zählen nicht.
function erstRuhe(frame, opt, wer) {
    return (async () => {
        const E = r._erstZeichnung;
        if (!E) return null;
        const offenZaehlt = !opt?.nurGezeichnete;
        const tE = performance.now();
        let tFort = tE,
            stand = "";
        // der Grund einer Absage: die letzten Meldungen des Übersetzers und der Pipeline in der GPU-Wache (`_gpuWacheMeldung`)
        const grund = () => {
            const m = (r._gpuWache?.meldungen || []).filter(
                (x) => x.quelle === "three" || x.quelle === "pipeline"
            );
            return m.length
                ? " — " +
                      m
                          .slice(-2)
                          .map((x) => x.kopf)
                          .join(" | ")
                : "";
        };
        // der Name einer Pipeline: ihr Label (`renderPipeline_<Stoff>_<id>`), sonst Programm-Name und Schlüssel
        const name = (p) =>
            E.namen?.get(p) ||
            `${p.vertexProgram?.name || "(ohne Stoff-Namen)"} [${p.cacheKey}]`;
        for (;;) {
            const b0 = E.bauN,
                v0 = E.verschoben,
                w0 = E.wartetN;
            frame();
            // DER GEGENDRUCK DER GPU: der nächste Frame kommt erst, wenn das Gerät diesen abgegeben hat. Eine Pause
            // von 0 ms schob Frames schneller in den GPU-Prozess, als swiftshader sie rastert — die Rückmeldung jedes
            // asynchronen Pipeline-Baus wartete hinter dem Rückstau (Erst-Zeichnungs-Wand: Rückstau bis 63 s, ein unbeleuchteter
            // Würfel 46 s; mit Gegendruck Rückstau ≤ 3,8 s, die Probe 68 → 4 s)
            await st.renderer?.backend?.device?.queue?.onSubmittedWorkDone?.();
            await sleep(0);
            // der Blick steht, wenn ein Frame nichts baut, nichts verschiebt, kein Draw auf seine Pipeline wartet
            // und kein Bundle ohne einen Bürger versiegelt ist (der wartende Draw zählt auf jedem Backend)
            if ((!offenZaehlt || E.offen.size === 0) && E.bauN === b0 && E.verschoben === v0 && E.wartetN === w0) break;
            const jetzt = performance.now();
            const s = `${E.bauN}|${E.verschoben}|${E.offen.size}|${E.bereitN}`;
            if (s !== stand) {
                stand = s;
                tFort = jetzt;
            }
            const frist = opt?.erstFristMs > 0 ? opt.erstFristMs : 120000;
            if (jetzt - tFort > frist || jetzt - tE > 5 * frist) {
                const namen = [];
                for (const p of E.offen.keys()) namen.push(name(p));
                const wartet =
                    E.wartetN !== w0 && E.wartetAuf
                        ? `; ein Draw wartet auf ${name(E.wartetAuf)}${E.abgesagt?.has(E.wartetAuf) ? ` (ABGESAGT)${grund()}` : ""}`
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

// DIE ABNAHME DES BLICKS (K32, scripts/lib/abnahme-urteil.cjs): was die Aufnahme über ihr Bild weiß, ohne Pixel — Stand aus dem
// laufenden Spiel, Bühne, Gerät, Pose, die Nah-Deckung des Schirms (Laub · Rinde · Fels näher als 2 m am Auge, Gelände und Bau
// näher als 1 m, Gelände näher als 2 m und höchstens 1 m unter dem Auge — die Kamera an der Böschung oder in der Wand; die Linse der
// Spieler-Kamera scripts/lib/kamera-nah.cjs) und das benannte Ziel (`opt.ziel` = { x, y, z, name, ohne, r, punkte }: jeder Punkt im Bild, ohne
// Verdecker davor). Das Ziel selbst zählt nie: seine ids (`ohne`) und jedes Werk, dessen Fuß näher als `r` (1,5 m) am Ziel
// steht.
// DIE GESTALT EINES ZIELS (rein; C der Augen-Karte 11.11., w28-linse-wahr): `teile` = [{ name, gezeichnet, fehlt }] — Werke, Kreaturen,
// Wasser am Ziel. Gezeichnet ist das Ziel, wenn jeder Teil gezeichnet ist; ein BENANNTES Ziel (`--ziel <name>`, nie der Blick-Punkt
// „Blickziel“ der Pose) ohne jeden Teil ist leer — ROT beim Namen. Bis hier war `[].every(…)` wahr: nah/tier-wiese, -genesis, -stadt,
// -dorf standen GRÜN ohne ein Tier im Bild (die Gestalt sammelte nur Werke, das Tier war fortgegangen).
function zielGestalt(z, teile) {
    const benannt = !!z?.name && z.name !== "Blickziel" && z.benannt !== false;
    const gestalt = teile.map((t) => `${t.name}${t.fehlt ? " fehlt" : t.gezeichnet ? "" : " UNGEZEICHNET"}`);
    if (!teile.length && benannt) return { gestalt: [`${z.name} fehlt (keine Gestalt binnen ${z.r ?? 1.5} m)`], gezeichnet: false };
    return { gestalt, gezeichnet: teile.every((t) => !t.fehlt && t.gezeichnet) };
}
// DAS LEBEN AM ZIEL (Seite): jede Kreatur, deren Ursprung binnen r eines Ziel-Punkts steht — gezeichnet als Leib oder im Satz
// (`_tierSatzEin` verbirgt den Leib, der Satz zeichnet ihn), nie unter `creaturesHidden` —, und das Wasser, dessen Spiegel am
// Ziel-Punkt binnen r liegt (`_nassAt` · `_koerperWasser`, die EINE Wahrheit), gezeichnet, wenn ein Wasser-Körper der Szene
// sichtbar über ihm steht.
function gestaltLeben(z, um) {
    const teile = [];
    if (!z || !um) return teile;
    const nah = (p) => um.punkte.some(([x, , zz]) => Math.hypot(p.x - x, p.z - zz) <= um.r);
    (st.creatures || []).forEach((c, i) => {
        if (c?.position && nah(c.position))
            teile.push({ name: `${r._taeterKlasse(c)} ${i}`, gezeichnet: st.creaturesHidden !== true && (c.visible !== false || !!c.userData?._satz) });
    });
    const spiegel = r._nassAt?.(z.x, z.z) ? r._koerperWasser(z.x, z.z, -Infinity) : -Infinity;
    if (Math.abs(spiegel - z.y) <= um.r) {
        let da = false;
        const bs = new window.THREE.Sphere();
        st.scene.traverseVisible((o) => {
            if (da || !o.geometry || !(o.userData.isHydrosphere || /^(wasserSatz|farWater|chunk-water-)/.test(r._taeterKlasse(o)))) return;
            if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
            bs.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld);
            da = !Number.isFinite(bs.radius) || bs.radius > 1e5 || Math.hypot(bs.center.x - z.x, bs.center.z - z.z) <= bs.radius + um.r;
        });
        teile.push({ name: "wasser", gezeichnet: da });
    }
    return teile;
}

// DER LEIB GANZ (leib-nah-ganz, 22.11.): jeder Leib im Blick näher als `nahM` (6 m) an der Kamera zeichnet JEDES seiner Teile — gemessen
// an der TIEFE DES BILDS (`__spiegelDaten`: der Szenen-Pass des Schusses oder des letzten Loop-Bilds), nie am Szenengraph.
// DAS SOLL nennt die Szene (`leiberNah`): je Leib — Spieler, Bewohner, Tier; die EINE Grenze `__istLeib` — jedes Teil, das die Kamera
// zeichnet und das Tiefe schreibt, beim Namen des EINEN Gesetzes (`_kopfKlasse`: `bewohner:kopf/haut`, `bewohner:leib/stoff`) und seines
// Stoffs (`<Stoff>_<id>`; die Pipeline seines Programms trägt die Nummer des ERSTEN Stoffs, der es baute — `renderPipeline_<Stoff>_<id>`
// in der GPU-Wache —, ein Programm teilen viele Stoffe: an main fehlte so das Haar von Stoff 734 an der Pipeline von 745).
// DAS IST liest das Bild (`leiberMessen`): je Teil bis zu `proben` Ecken seiner gezeichneten Dreiecke über die Haut der CPU in die Welt
// und auf ihr Pixel. Steht dort (± 1 Pixel) die Fläche des Bilds an der Ecke (|Δ| ≤ `saumM`), ist sie gezeichnet; steht eine davor,
// ist sie verdeckt und zählt nicht; sonst zeigt das Bild durch das Teil hindurch (leer). Ein Teil mit ≥ `probenMin` unverdeckten
// Ecken, von denen ≥ `leerAb` leer sind, ist UNGEZEICHNET — ROT beim Namen: Leib, Teil, Stoff.
// Bis hier urteilte die Abnahme „Leib im Vordergrund 5,7 %“ GRÜN über ein Bild, in dem von vier Bewohnern nur das Haar stand
// (stadt-voll, Radeon 6699a813): r184 hielt die Pipelines von Haut und Stoff für immer für kaputt (`_erstAbsageWache`).
function leiberNah(o) {
    const T = window.THREE;
    const cam = st.camera;
    const nahM = o?.nahM ?? 6;
    cam.updateMatrixWorld(true);
    const E = new T.Vector3().setFromMatrixPosition(cam.matrixWorld);
    const wer = new Map();
    for (const S of r._bewohnerSiedlungen?.values() || []) for (const b of S?.liste || []) if (b?.leib) wer.set(b.leib, `bewohner ${b.nr}`);
    (st.creatures || []).forEach((c, i) => c && !wer.has(c) && wer.set(c, `${r._taeterKlasse(c)} ${i}`));
    const je = new Map();
    const p = new T.Vector3();
    st.scene.traverseVisible((c) => {
        const m = c.material;
        if (!c.isMesh || c.isInstancedMesh || c.userData?.gang || !m || Array.isArray(m) || !window.__kameraZeichnet(c, cam)) return;
        if (m.depthWrite === false || m.transparent === true) return; // ohne Tiefe im Bild kein Urteil am Bild
        const klasse = r._taeterKlasse(c);
        if (!/^(spieler|bewohner|tier:)/.test(klasse)) return;
        let top = c,
            name = null;
        for (let q = c; q && q !== st.scene; q = q.parent) (top = q), (name = name || wer.get(q) || null);
        let L = je.get(top);
        if (!L) {
            const d = top.getWorldPosition(p).distanceTo(E);
            je.set(top, (L = { name: name || klasse, d: +d.toFixed(2), teile: [] }));
        }
        L.teile.push({ c, teil: r._kopfKlasse ? r._kopfKlasse(c)[1] : klasse, stoff: `${m.name || m.type}_${m.id}` });
    });
    return [...je.values()].filter((L) => L.d <= nahM).sort((a, b) => a.d - b.d);
}
function leiberMessen(S, nahe, o) {
    const T = window.THREE;
    const q = Object.assign({ nahM: 6, proben: 48, probenMin: 6, saumM: 0.06, leerAb: 0.8 }, o || {});
    const leiber = nahe || window.__leiberNah(q);
    const E = new T.Vector3().fromArray(S.auge);
    const vp = S.vp;
    const [P, W4] = [new T.Vector3(), [0, 0, 0, 0]];
    // die Fläche des Bilds am Pixel (x, y): ihr Abstand zum Auge (der Himmel: unendlich)
    const flaeche = (x, y) => (x < 0 || y < 0 || x >= S.tw || y >= S.th ? Infinity : (S.punkt(y * S.tw + x)?.distanceTo(E) ?? Infinity));
    const aus = { nahM: q.nahM, n: 0, halb: 0, teile: 0, ganz: true, fehlt: [] };
    for (const L of leiber) {
        let gemessen = 0,
            fehlt = 0;
        for (const t of L.teile) {
            const g = t.c.geometry;
            const [idx, pos] = [g.index, g.attributes.position];
            const von = Math.max(0, g.drawRange.start || 0);
            const bis = Math.min(idx ? idx.count : pos.count, von + (Number.isFinite(g.drawRange.count) ? g.drawRange.count : Infinity));
            const schritt = Math.max(1, Math.floor((bis - von) / q.proben));
            const z = { da: 0, leer: 0, verdeckt: 0 };
            for (let k = von; k < bis; k += schritt) {
                const i = idx ? idx.getX(k) : k;
                (t.c.isSkinnedMesh ? t.c.getVertexPosition(i, P) : P.fromBufferAttribute(pos, i)).applyMatrix4(t.c.matrixWorld);
                for (let a = 0; a < 4; a++) W4[a] = vp[a] * P.x + vp[4 + a] * P.y + vp[8 + a] * P.z + vp[12 + a];
                if (!(W4[3] > 1e-3) || Math.abs(W4[0]) > 0.98 * W4[3] || Math.abs(W4[1]) > 0.98 * W4[3]) continue; // außerhalb des Bilds
                const [x, y] = [Math.floor(((W4[0] / W4[3] + 1) / 2) * S.tw), Math.floor(((1 - W4[1] / W4[3]) / 2) * S.th)];
                const Ld = P.distanceTo(E);
                let da = false;
                for (let dy = -1; dy <= 1 && !da; dy++) for (let dx = -1; dx <= 1 && !da; dx++) da = Math.abs(flaeche(x + dx, y + dy) - Ld) <= q.saumM;
                z[da ? "da" : flaeche(x, y) < Ld - q.saumM ? "verdeckt" : "leer"]++;
            }
            const frei = z.da + z.leer;
            if (frei < q.probenMin) continue; // verdeckt oder außerhalb des Bilds: kein Urteil über dieses Teil
            gemessen++;
            if (z.leer < q.leerAb * frei) continue;
            fehlt++;
            aus.fehlt.push(`${L.name} in ${L.d} m: ${t.teil} (${t.stoff}) ${z.da} von ${frei} Ecken im Bild`);
        }
        if (!gemessen) continue;
        aus.n++;
        aus.teile += gemessen;
        if (fehlt) aus.halb++;
    }
    aus.ganz = aus.fehlt.length === 0;
    return aus;
}

function abnahmeMessen(opt) {
    const T = window.THREE;
    const cam = st.camera;
    const o = opt || {};
    cam.updateMatrixWorld(true);
    const z = o.ziel || null;
    const ohne = [];
    if (z) {
        if (Array.isArray(z.ohne)) ohne.push(...z.ohne);
        const rz = z.r ?? 1.5;
        for (const e of st.architectures || [])
            if (e?.position && Math.hypot(e.position.x - z.x, e.position.z - z.z) <= rz) ohne.push(e.id);
    }
    const E = cam.position;
    // ein Ziel in Armlänge (material.K2, `bild --arm`) ist selbst die nahe Fläche: verdeckt ist, was näher als die halbe Armlänge liegt
    const RADIUS = z ? Math.min(2, 0.5 * Math.hypot(z.x - E.x, z.y - E.y, z.z - E.z)) : 2;
    // DER VORDERGRUND (mit benanntem Ziel): jede Täter-Fläche näher als der halbe Ziel-Abstand (2–8 m); ohne Ziel der Nah-Radius
    const V = z ? Math.max(RADIUS, Math.min(8, Math.hypot(z.x - E.x, z.y - E.y, z.z - E.z) / 2)) : RADIUS;
    // DER FUSS DES ZIELS (hinter einer Kuppe zeigt ein Baum nur die Krone, der Strahl zum Ziel-Punkt ist frei): steht das Ziel 0,6–40 m über seinem Boden, muss auch sein Fuß (Boden + 0,3 m) frei
    // sein; `ziel.fussY` nennt ihn selbst, `ziel.fuss === false` fragt ihn nicht (ein Ziel in einer Felswand). Dazu jeder
    // genannte Punkt des Ziels (`ziel.punkte`, [x, y, z]: die Glieder einer Herde) — die Prüfung fragt jeden.
    const punkte = (q) => {
        const g = r._voxelSurfaceY(q.x, q.z);
        const y = Number.isFinite(q.fussY) ? q.fussY : Number.isFinite(g) && q.y - g > 0.6 && q.y - g <= 40 ? g + 0.3 : NaN;
        return (q.fuss === false || !Number.isFinite(y) ? [] : [[q.x, y, q.z]]).concat(q.punkte || []);
    };
    // die Punkte des Ziels beim Namen (der Grund nennt den, der durchfällt): der Fuß, dann die genannten Glieder
    const zp = z ? punkte(z) : [];
    const fussDa = zp.length > (z?.punkte || []).length;
    const zielUm = z ? { punkte: [[z.x, z.y, z.z], ...zp], r: z.r ?? 1.5 } : null;
    // Der Satz „messung" (Takt- und Luma-Frames) misst keine Sicht: die Strahlen kosteten jeden Mess-Frame Zeit, die er nicht prüft. Die
    // Blick-Wahl fragt je Pose zuerst das Ziel allein (`o.nurZiel`): ohne die Strahlen der Nah-Deckung, `sicht` bleibt ungemessen.
    // DER LEIB (w28-linse-wahr, w28-ziel-plan): ohne Ziel ein Täter der Sicht bis zum Nah-Radius (`sicht.deckung` ≤ 2 %: ein Kopf vor
    // der Linse), mit Ziel EIN Täter des Vordergrunds V (unten, ≤ 25 %) und nie der Sicht — der Tag des Menschen bindet die Bewohner an
    // Orte nach Angebot (Gruppen am Markt), ein Bewohner am Platz ist Szene. Bis hier zählte er mit Ziel ZWEIMAL, im Vordergrund und
    // obendrauf in `sicht.deckung`: am Dorf stand am Mittag ein Bewohner 2,6 m vor der Linse, „Sicht verdeckt 3.3 % (Leib bewohner)“,
    // GTX 1050 zweimal identisch bei freiem Blickziel 5,2 m
    const nd =
        o.satz === "messung"
            ? { deckung: null, taeter: null, ziel: null }
            : window.__nahDeckung({
                  nurZiel: o.nurZiel,
                  radien: { Laub: RADIUS, Rinde: RADIUS, Fels: RADIUS, Gelände: RADIUS, Bau: RADIUS / 2, ...(z ? {} : { Leib: RADIUS }) },
                  ueber: { Gelände: E.y - 1 },
                  gw: 48,
                  gh: 27,
                  ort: { id: "abnahme", x: E.x, z: E.z, r: RADIUS + 2 },
                  neu: true,
                  ohne,
                  zielUm,
                  ziel: z ? { ...z, punkte: zp, punktNamen: zp.map((_, i) => (fussDa && !i ? "Fuß" : `Punkt ${i + !fussDa}`)), tiefe: o.tiefe || null } : null,
              });
    // DER VORDERGRUND: mit benanntem Ziel zählt jede Täter-Fläche (Laub · Rinde · Fels · Bau · Böschung · Leib) näher als der halbe
    // Ziel-Abstand (2–8 m) — das Bild zeigt sein Ziel, nicht, was davor steht. Der Leib zählt darin wie jede Fläche und steht als
    // `vordergrund.leib` beim Namen; was das Ziel selbst verdeckt, urteilt `ziel.frei`.
    let vorn = null;
    if (z && nd.ziel && !o.nurZiel) {
        const v = window.__nahDeckung({
            radien: { Laub: V, Rinde: V, Fels: V, Bau: V, Gelände: V, Leib: V },
            ueber: { Gelände: E.y - 1 },
            gw: 32,
            gh: 18,
            ort: { id: "abnahme-vorn", x: E.x, z: E.z, r: V + 2 },
            neu: true,
            ohne,
            zielUm,
        });
        vorn = { radius: +V.toFixed(2), deckung: v.deckung, taeter: v.taeter, leib: { deckung: v.leib ? v.leib.deckung : 0, taeter: v.leib ? v.leib.taeter : {} } }; // prettier-ignore
    }
    const sicht = { radius: RADIUS, deckung: nd.deckung, taeter: nd.taeter, vordergrund: vorn };
    // der Leib der Sicht (nur ohne Ziel): sein Anteil an `sicht.deckung`, der Schlüssel der Ratsche liest ihn (`rotSchluessel`)
    if (!z && nd.deckung != null) sicht.leib = { radius: RADIUS, deckung: nd.leib ? nd.leib.deckung : 0, taeter: nd.leib ? nd.leib.taeter : {} }; // prettier-ignore
    const rend = st.renderer;
    const be = rend?.backend;
    const db =
        rend?.getDrawingBufferSize?.(new T.Vector2());
    const dir = cam.getWorldDirection(new T.Vector3());
    const werk = (id) => (st.architectures || []).find((q) => q?.id === id);
    return {
        satz: o.satz || "beweis",
        stand: { version: AnazhRealm.VERSION || null, sha: o.sha || null },
        buehne: {
            saison: st.season || null,
            wetter: st.weather || null,
            uhr: Number.isFinite(st.timeOfDay) ? +st.timeOfDay.toFixed(3) : null,
            bildUhr: window.__buehneUhr ? window.__buehneUhr.T : null, // die Bild-Uhr (A9), ohne Bühne frei
            tiereGehalten: !!window.__gehalten?.has("tiere"),
        },
        geraet: {
            backend: !be ? null : be.isWebGPUBackend ? "WebGPU" : be.isWebGLBackend ? "WebGL" : null,
            adapter: (() => {
                const i = be?.device?.adapterInfo || be?.adapter?.info || null;
                return i ? [i.vendor, i.architecture, i.device, i.description].filter(Boolean).join(" ") : null;
            })(),
            leinwand: db ? [Math.round(db.x), Math.round(db.y)] : null,
        },
        sicht,
        // DIE GESTALT DES ZIELS: jedes Werk am Ziel (`ohne`) muss im Bild stehen (`_archImBild`: Mesh, Instanz oder jenseits des
        // Cull-Radius seine Fernform im Welt-March), jede Kreatur an einem Punkt des Ziels gezeichnet (als Leib oder im Satz), das
        // Wasser am Ziel-Punkt gezeichnet — und ein BENANNTES Ziel ohne jede Gestalt ist leer (`zielGestalt`)
        ziel: nd.ziel ? Object.assign(nd.ziel, window.__zielGestalt(z, [...ohne.map((id, _i, _a, e = werk(id)) => (e ? { name: `${e.type} ${id}`, gezeichnet: r._archImBild(e) } : { name: id, fehlt: true })), ...window.__gestaltLeben(z, zielUm)])) : null, // prettier-ignore
        pose: {
            kamera: [E.x, E.y, E.z].map((v) => +v.toFixed(3)),
            blick: [dir.x, dir.y, dir.z].map((v) => +v.toFixed(5)),
        },
        seitenfehler: window.__seitenfehler || 0,
    };
}

// DIE NAH-SÄTZE FOLGEN DER KAMERA (der Schuss und die Pose der Blick-Wahl): Wiese und Streu schwingen ihre Kachel-Ringe um sie ein,
// Kachel um Kachel, bis keine mehr fehlt
function nahFolgt() {
    for (const t of ["_tickNahWiese", "_tickNahStreu"]) for (let i = 0; i < 200 && r[t]() > 0; i++);
}

// DIE BLICK-WAHL (K32; Lehre 17 „die Blick-Wahl sucht freie Sicht"): vor dem Schuss sucht die Aufnahme bis zu `opt.wahl` Posen
// um den Ort — der Abstand zum Ziel und die Augenhöhe über dem Boden bleiben, der Azimut dreht 0, ±15° … ±90°, ±135°, 180°,
// je Runde von 14 Posen vier Meter höher und 20 % näher —, je Pose die Abnahme des Blicks nach den EINEN Schwellen (ohne die Bild-Zeilen:
// Pixel gibt es erst nach dem Schuss). Die erste freie Pose steht; findet keine, bleibt die Kamera, wo sie war, und die
// Abnahme nach dem Schuss wirft beim Namen.
// DIE REIHE (w18-abnahme-sicht-3): die genannte Pose zuerst, dann die übrigen nach ihrem Blick von oben — der Höhe des Auges über dem
// Ziel je Meter Abstand (gehoben, vom Hügel): wer über Mauer und Wald schaut, kommt vor dem, der zwischen ihnen steht. Bis dahin lief
// sie Runde um Runde, siedlung.K4#2 fand die freie Pose als 39. (Radeon f83813df, 16,5 s im Schritt BILD; die GTX riss dort 90 s); mit den
// billigen Stufen unten Runde um Runde als 39. in 4,2 s (Radeon aa5aa11b), nach dem Blick von oben als 11. in 2,3 s (de48171f).
// DIE STUFEN JE POSE, die billige zuerst: (1) das Ziel im Bild und gezeichnet (`nurZiel`, ohne Bild); (2) das Ziel frei im Augenblick, an
// EINEM Bild des Loops (`__zielMessen` mit `nurZiel`: ohne die Strahlen der Nah-Deckung, das Bild ohne Boden-Schicht nur, wo etwas vor
// dem Ziel steht); (3) die Nah-Deckung der CPU (Sicht, Vordergrund); (4) IN IHRER WELT: unter der Bühne wartet die Wahl, bis die Welt an
// der Pose steht (`__weltStehtWarten`), und urteilt am Bild der Tiefe nach der Ruhe der Erst-Zeichnung (`opt.tiefe`) die ganze Abnahme
// — dieselbe Welt, die der Schuss danach zeichnet. Was eine Stufe verwirft, kostet die nächste nicht. Bis dahin rechnete jede Pose
// die Nah-Deckung bis zu dreimal und zwei Bilder samt Nah-Sätzen (`__nahFolgt`), auch wo das Ziel schon verdeckt war.
// Bis w18-abnahme-sicht urteilte ein Strahl über die Dreiecke der CPU: siedlung.K4#2 Radeon f3911ab9 Pose 6 im Wald, „frei 210,41
// m“, am Ziel-Pixel zeigte das Bild die Karte einer Erle in 33,31 m; Radeon fe57747a wählte Pose 6 in der Welt der vorigen Pose, der
// Schuss fand dort die Tanne, die sie dann warf („Blickziel verdeckt von Rinde baum_tanne in 13.35 m“).
async function blickWahl(opt) {
    const cam = st.camera;
    const z = opt.ziel;
    const n = Math.max(1, Math.floor(opt.wahl));
    const P0 = cam.position.clone();
    const Q0 = cam.quaternion.clone();
    const boden = (x, zz) => r._voxelSurfaceY(x, zz);
    const h0 = Math.max(0.35, P0.y - boden(P0.x, P0.z));
    const d0 = Math.max(0.5, Math.hypot(P0.x - z.x, P0.z - z.z));
    const a0 = Math.atan2(P0.z - z.z, P0.x - z.x);
    const winkel = [0, 15, -15, 30, -30, 45, -45, 60, -60, 90, -90, 135, -135, 180];
    const reihe = [];
    for (let k = 0; k < n; k++) {
        const ring = Math.floor(k / winkel.length);
        const a = a0 + (winkel[k % winkel.length] * Math.PI) / 180;
        const d = d0 * 0.8 ** ring;
        const p = [z.x + Math.cos(a) * d, 0, z.z + Math.sin(a) * d];
        p[1] = boden(p[0], p[2]) + h0 + 4 * ring;
        if (Number.isFinite(p[1])) reihe.push({ k, p, oben: k ? (p[1] - z.y) / d : Infinity });
    }
    reihe.sort((a, b) => b.oben - a.oben);
    const posen = [];
    const ms = (t) => Math.round(performance.now() - t);
    const t0 = performance.now();
    let gewaehlt = null;
    for (const { k, p } of reihe) {
        const tk = performance.now();
        cam.position.set(...p);
        cam.lookAt(z.x, z.y, z.z + 1e-4);
        cam.updateMatrixWorld(true);
        const nur = { ...opt, nurZiel: true };
        let m = window.__abnahmeMessen(nur);
        const urteil = (ohne) => window.__abnahmeUrteil(m).rot.filter((q) => !ohne.test(q.feld));
        let rest = urteil(/^(bild|sicht)\.|^ziel\.frei/);
        if (!rest.length) (m = await window.__zielMessen(nur, (window.__loopBild(), await window.__spiegelDaten()))), (rest = urteil(/^(bild|sicht)\./)); // prettier-ignore
        if (!rest.length) (m = window.__abnahmeMessen(opt)), (rest = urteil(/^bild\.|^ziel\.frei/));
        if (!rest.length) {
            if (window.__buehneUhr) await window.__weltStehtWarten();
            await window.__ausgabeAufnahme(64, 36, 1, { satz: "messung", tiefe: true });
            m = await window.__zielMessen(opt, await window.__spiegelDaten());
            rest = urteil(/^bild\./);
        }
        posen.push({ k, kamera: m.pose.kamera, rot: rest.map((q) => q.grund), ms: ms(tk) });
        if (!rest.length) {
            gewaehlt = k;
            break;
        }
    }
    if (gewaehlt == null) cam.position.copy(P0), cam.quaternion.copy(Q0), cam.updateMatrixWorld(true);
    return { versucht: posen.length, gewaehlt, posen, ms: ms(t0) };
}

// DIE ABNAHME AM BILD (w18-abnahme-sicht, kamera-nah `o.ziel.tiefe`): gemessen mit der Tiefe S des Bilds; zeigt S an einem Ziel-Punkt eine
// Fläche davor (`ziel.frei` ungemessen), misst sie noch einmal mit `S.boden`, demselben Bild mit verborgenen Halmen der Nah-Wiese, Streu
// und Wasser (EIN Bild des Loops; ihre Stoffe stehen schon): was dort am Ziel-Pixel steht, ist keine Boden-Schicht; `aus` nennt die
// Verborgenen. Nur wo das Bild etwas vor dem Ziel zeigt, kostet es das zweite Bild. DER LEIB (w27-ort-pose-voll): zeigt auch
// `S.boden` etwas davor, fragt ein drittes Bild `S.leib` — ohne Boden-Schicht UND ohne die Leiber (`leiber`: der Leib als Mesh
// mit Skelett, der Satz einer Gestalt mit `userData.gang`, dieselbe Grenze wie kamera-nah `zaehlt`), denn ein Leib ist nie
// Fläche der Linse, auch nicht vor dem Ziel.
async function zielMessen(opt, S) {
    let m = window.__abnahmeMessen({ ...opt, tiefe: S });
    for (const welches of ["boden", "leib"]) {
        if (m.ziel?.frei !== null) return m;
        const aus = new Set();
        const leiber = new Set();
        st.scene.traverseVisible((o) => (o.userData.isHydrosphere || /^(nahWiese:|streuNah:|wasserSatz|farWater|chunk-water-)/.test(r._taeterKlasse(o))) && aus.add(o)); // prettier-ignore
        if (welches === "leib") st.scene.traverseVisible((o) => window.__istLeib(o) && (aus.add(o), leiber.add(o)));
        for (const o of aus) o.visible = false;
        window.__bundlesNeu();
        try {
            window.__loopBild();
            S[welches] = Object.assign(await window.__spiegelDaten(), { aus, leiber });
        } finally {
            for (const o of aus) o.visible = true;
            window.__bundlesNeu();
        }
        m = window.__abnahmeMessen({ ...opt, tiefe: S });
    }
    return m;
}

// DAS GANZE BILD (echte GPU): ein Ausgabe-Ziel kleiner als der Canvas lieferte die linke obere Ecke
// des Frames in Originalgröße, nie das verkleinerte Bild — 1280×720 aus 1920×1080 waren ein 2/3-Ausschnitt,
// 640×360 ein Drittel (gemessen: dieselbe Kamera, 640 = die linke obere 640×360-Ecke des 1920er Bildes). Die
// Aufnahme rendert darum IMMER in Canvas-Größe (was der Spieler sieht) und mittelt danach auf W×H herunter.
function ausgabeAufnahme(W, H, warm, opt) {
    return (async () => {
        const T = window.THREE;
        const rend = st.renderer;
        const db = rend.getDrawingBufferSize(new T.Vector2());
        const BW = Math.max(1, Math.round(db.x));
        const BH = Math.max(1, Math.round(db.y));
        const rt = new T.RenderTarget(BW, BH, { depthBuffer: true, samples: 0 });
        const prevOut = rend.getOutputRenderTarget();
        // DAS ZIEL DES RENDERERS mit zurück: im Direktpfad (ohne Post-Kette)
        // stellt r184 am Ende von `_renderScene` das aktuelle Ziel auf `_renderTarget || _outputRenderTarget` — nach einer
        // Aufnahme stand das Aufnahme-Ziel als aktuelles Ziel, jeder folgende Frame schrieb in das entsorgte Ziel und jede
        // weitere Aufnahme las ein nie beschriebenes (`copyTextureToBuffer: format of undefined`).
        const prevZiel = rend.getRenderTarget();
        // DAS BILD URTEILT DEN INHALT, NIE DAS GERÄT (w28-bild-preis): die Szenen-Skala misst sich je Sitzung am Gerät ein
        // (`_szeneSkalaMessen`, die Radeon an der Wiese 0,5) — jede Station, die Schärfe am Bild misst (material.K2#1, laub-kante,
        // vegetation.K2#1, Pop), verschöbe sich am Gerät, ohne dass sich der Inhalt ändert. Der Schuss hält darum die Skala am
        // Standard (`__halten` skala: `SZENE_SKALA`, solange der Spieler keine gesetzt hat) — ab dem Einschwingen und der Blick-Wahl
        // und über den Schuss hinaus für jede Lesung derselben Linse (die Tiefen der Klassen-Teilung lesen nach der Aufnahme);
        // der Preis-Lauf und die GPU-Bank öffnen sie (`lauf`, `gpuBank` in scripts/lib/zerlege-linse.cjs) und urteilen das Gerät.
        window.__halten(["skala"]);
        // DIE WELT STEHT (A9): unter der Bühne wartet jeder Beweis-Schuss auf sie (Mess-Frames eines Satzes schießen in derselben)
        // … außer im Bild AUS BEWEGUNG (`opt.bewegt`, `werkbank bild --bewegung`): die Welt steht dort nie, der Schuss friert sie ein
        const weltTakte =
            opt?.bewegt ? "bewegt" : window.__buehneUhr && opt?.satz !== "messung" ? await window.__weltStehtWarten() : null;
        // DIE BLICK-WAHL vor dem Schuss: nur mit benanntem Ziel und `opt.wahl` Posen
        // (`opt.wahl` eine Zahl: die Wahl hier; ihr Ergebnis `{ posen, … }`: die Wahl lief schon, `werkbank bild` vor dem EINEN Schuss)
        const wahl = opt?.wahl?.posen ? opt.wahl : opt?.ziel && opt.wahl > 0 ? await window.__blickWahl(opt) : null;
        // DIE ABNAHME (K32, scripts/lib/abnahme-urteil.cjs): jedes Bild prüft sich selbst — Sicht frei, Ziel im Bild und frei,
        // Belichtung im Band, Stand · Bühne · Gerät vermerkt. Ein Bild, das sie nicht hält, wirft beim Namen: der Aufrufer
        // speichert nie still. Der Satz „messung" (`opt.satz`) prüft nur Stand, Bühne und Gerät (Mess-Frames, kein Beweisbild).
        // DAS ROTE BILD (w28-linse-wahr, F): ein Rufer, der es als ROT ablegt (`opt.rotBild`: `werkbank bild` speichert `*-rot.png` und
        // meldet ROT beim Namen), bekommt das Bild mit `ok: false` und den Gründen (`m.rot`); jeder andere bricht wie bisher. Bis hier warf
        // die Abnahme vor jedem Speichern, und den Täter (bauSatz 45 m, P06) sah niemand.
        const abnahme = (u8, W2, H2, m) => {
            m.buehne.weltTakte = weltTakte; // so viele Takte wartete der Schuss, bis die Welt stand (A9)
            m.bild = window.__bildMasse(u8, W2, H2);
            if (wahl) m.wahl = wahl;
            // (der Schirm der Welt, `schirmRot`: die Zeilen ihres letzten Takts gegen die des Bilds)
            m.buehne.zeilen = r._weltStand ? r._weltStand.zeilen : null;
            const u = window.__schirmRot(window.__leinwandRot(window.__abnahmeUrteil(m), m.satz, [BW, BH], [W2, H2]), m.satz, m.buehne.zeilen, BH);
            m.ok = u.ok;
            m.zeile = u.zeile;
            m.rot = u.rot;
            if (!u.ok && !opt?.rotBild) {
                const fehler = new Error(
                    `${u.zeile}${wahl && wahl.gewaehlt == null ? ` — die Blick-Wahl fand in ${wahl.versucht} Posen keine freie` : ""} — die Aufnahme speichert nichts`
                );
                fehler.abnahme = m;
                throw fehler;
            }
            return m;
        };
        rend.setOutputRenderTarget(rt);
        // DER RÜCKSTRAHL STEHT (`opt.rueckstrahl` "halten": die Schüsse einer Klassen-Teilung OHNE ihren Teil, w28-wald-saum): jeder
        // Schuss misst den Boden seiner Szene neu (`_rueckstrahlZeichne` unter `_rueckstrahlJetzt`) — ohne den verborgenen Teil trüge
        // O_k ein anderes Licht von unten als G, und jedes Pixel, das es liest (Stamm, Strauch, Unterseite der Krone), zählte zu dem
        // Teil, der fehlt (die Wirkungs-Teilung `wirkungTeilung`: wessen Fehlen das Pixel am stärksten ändert). Mess-Wiese, Third, Mittag, GTX 1050,
        // b269f840: 168 „Grund“-Pixel im Ring 20–40 m, 53 % am Strahl durch Baum oder Strauch (am Merge 6afdda0a 2 059, 86 %),
        // gehalten 7. Der Schuss zeichnet dann unter dem Boden, der steht; ein Schreiber, der ihn doch bewegt, bricht beim Namen.
        const RL = opt?.rueckstrahl === "halten" ? st.rueckstrahlLeser : null;
        const lichtVor = RL && [RL.an.value, ...RL.boden.value.toArray()];
        const ruht = RL ? ["_rueckstrahlZeichne", "_rueckstrahlSprung"].map((m) => [m, Object.hasOwn(r, m), r[m]]) : [];
        for (const [m] of ruht) r[m] = () => {};
        try {
            // Warm-Frames: der erste Frame nach dem Kamera-Umsetzen trägt die Feld-Formen noch nicht
            // (Listen-/Seiten-Upload + Pipelines).
            // Der Szenen-Pass der Post-Pipeline (PassNode) rendert nur einmal je NODE-FRAME; den schaltet
            // im Vendor die Animations-Schleife weiter. Bei ruhendem Loop schaltet die Aufnahme ihn selbst —
            // sonst überspringt der gezählte Frame die Szene (gemessen: dc=1, Dreiecke=1, nur das Quad).
            // Der Frame zeichnet zur Bild-Uhr (A9; unter der Bühne steht sie).
            const frame = () => window.__loopBild();
            // Die NAH-SÄTZE folgen der Kamera (Wiese und Streu, die Kachel-Ringe im scatterDeco-Takt). Bei ruhendem
            // Loop standen die Ringe noch um die VORIGE Kamera — die Aufnahme schwingt sie für diese ein (Kachel um
            // Kachel, bis keine mehr fehlt; A9-n2: die Streu trug die Armlänge des vorigen Schusses).
            window.__nahFolgt();
            // DER NEUBEGINN DER FOLGE (die Schatten-Karten neu; Versatz, Geschichte, Dither-Phase — offen `__offen` zitter läuft
            // die Folge weiter): vor dem Bild des Rückstrahls und vor den gezählten Frames. Das Bild, an dem der Rückstrahl den Boden
            // misst, trug bis w12-lod-ende die Kaskaden, die der Lauf vor dem Schuss hielt (`_kaskadeHaelt`): der Boden der ersten
            // Aufnahme lag unter fremden Schatten (Radeon, Wiese: 0,069 statt 0,095), Stamm und Laub trugen ihn — zwei Aufnahmen
            // derselben Szene wichen in 1 786 078 Bytes ab, die zweite gleich der dritten
            const neubeginn = () => {
                // die Tiefe allein (`opt.tiefe`) trägt keinen Schatten
                if (!opt?.tiefe) r._schattenAlleNeu();
                // DER SPIEGEL DIESER SZENE (w20-lack-spiegel): der gehaltene Pass (`__halten` spiegel) rechnet im ersten Bild danach
                // neu (`an` 0 → `_spiegelPassZeichne`). Bis hier tat das nur der Sprung der zeitlichen Auflösung (`_traaR.neu`): ohne
                // sie (Holz kienspan, swiftshader) hielt der Schuss den Pass von VOR dem Wagen — sein Lack las ein leeres Pass-Ziel
                // (Grund der Sitzung, GT am Spawn: an 1, Deckung 0 an jedem Lack-Pixel)
                if (st.spiegelLeser) st.spiegelLeser.an.value = 0;
                if (window.__offen?.has("zitter")) return;
                const tn = st.traaNode;
                if (tn) {
                    tn._jitterIndex = 0;
                    // die Geschichte neu: ein Größen-Wechsel lässt den Vendor sie aus dem ersten Bild kopieren (TRAANode
                    // `needsRestart`)
                    tn._historyRenderTarget?.setSize(1, 1);
                }
                if (st._traaR) st._traaR.neu = true;
                const lu = st.lodUniforms;
                if (lu?.uDitherT) lu.uDitherT.value = 0;
            };
            // DIE ERST-ZEICHNUNG (`_configureRenderer`): was in diesem Blick zum ersten Mal zeichnet, baut je
            // Render-Aufruf einen Stoff und lässt seine Pipeline asynchron entstehen — in den 32 Frames am Stück unten
            // erfüllt sich kein Versprechen. Die Aufnahme zeigt, was der Spieler nach dem Ankommen sieht: sie schaltet Frames mit einer Pause
            // für den GPU-Prozess, bis ein Frame nichts mehr baut oder verschiebt und keine Pipeline offen ist. Steht die
            // Erst-Zeichnung 120 s ohne Fortschritt (kein Bau, keine Pipeline wird bereit; `opt.erstFristMs`, die Wand prüft mit
            // einer kurzen Frist) oder fünfmal so lange insgesamt, bricht die Aufnahme LAUT ab und nennt jede offene
            // Pipeline beim Namen — ein Bild mit einem unsichtbaren Bürger ist kein Beweis.
            // Sie ruht unter den Schatten-Karten DIESES Blicks (der Neubeginn): die Werfer, die erst die frische Box wählt, bauen hier
            neubeginn();
            const erst = await window.__erstRuhe(frame, opt, "die Aufnahme");
            // DER RÜCKSTRAHL DIESER SZENE (schatten.K4, `_rueckstrahlJetzt`): seine Lesung kommt ein Bild nach der Messung zurück —
            // der Schuss wartet auf sie, sonst trüge er den Boden des vorigen Schusses; sein Schalter steht danach für die Bilder des
            // Schusses (w10-treue: der erste Schuss nach dem Lesen zeichnete ohne den eben gemessenen Boden)
            // (die Tiefe allein, `opt.tiefe`, trägt keinen Boden-Rückstrahl)
            if (!opt?.tiefe) await r._rueckstrahlJetzt(() => (neubeginn(), frame()));
            // DIE ZEITLICHE AUFLÖSUNG (TRAA) zeigt ein ruhendes Bild erst nach ihrer Geschichte: die Halton-Folge
            // läuft 31 Versätze, die Dither-Blende rotiert je Frame — die Aufnahme zeigt, was der Spieler nach einer
            // halben Sekunde Stillstand sieht (32 Frames), nie den ersten, ungemittelten Frame nach dem Kamera-Sprung.
            // Nach dem Sprung läuft die Geschichte als MITTEL an (K68, `_zeitAufloesung` `_anlauf`): jeder der 32 Frames
            // wiegt gleich, die Dither-Blende steht als Mischton im Bild, nie als Schachbrett des ersten Frames. JEDER Schuss
            // beginnt Folge, Geschichte und Dither-Phase von vorn (A8-n1; bis dahin nur mit `opt.fest`, K63-n1): die Geschichte
            // hält je Frame 95 % (TRAANode), die Frames vor dem Schuss tragen nichts hinein — zwei Schüsse derselben Szene
            // sind dasselbe Bild.
            // DER HALTER (`__halten`): der Spiegel-Pass steht in den gezählten Frames, offen (`__offen` zitter) läuft die Folge weiter
            // der Versatz des Laubs beginnt mit der Geschichte (A3b, `_zeitAufloesung`); die Schatten-Karten: der Takt rendert
            // eine Kaskade nur, wenn sie fällig ist — die Karte des ersten Frames sah die Szene vor der Erst-Zeichnung (A8-n1)
            window.__halten(["spiegel"]);
            neubeginn();
            window.__imSchuss = 1;
            // DIE TIEFE ALLEIN (`opt.tiefe`: der Arm von `werkbank bild --arm` sucht in ihr die Klasse): die Tiefe trägt keine
            // Geschichte — EIN Bild nach dem Neubeginn der Folge, mit dem Versatz jedes Neubeginns (zwei Tiefen unterscheiden
            // sich nur, wo die Szene sich unterscheidet; `__spiegelDaten` liest den Szenen-Pass dieses Bilds), ohne die 32 Bilder
            // der Geschichte, ohne Rücklese der Farbe. Bis dahin las der Arm sie hinter zwei ganzen Aufnahmen (material.K2: je
            // Armlänge 2 × 33 Bilder, sechs Armlängen)
            if (opt?.tiefe) return frame();
            const nWarm = Math.max(warm ?? 1, st.traaNode ? 32 : 0);
            for (let k = 0; k < nWarm; k++) frame();
            const t0 = performance.now();
            frame();
            // Die Frame-Last liest die EINE Quelle des Spiels (HUD/Flugschreiber): `_loopRender` setzt
            // renderer.info je Frame zurück und legt die Summe ALLER Pässe in state._perfFrame ab.
            const pf = st._perfFrame || {};
            const ri = rend.info?.render || {};
            const info = {
                drawCalls: pf.renderCalls ?? ri.drawCalls,
                triangles: pf.renderTris ?? ri.triangles,
                // die Erst-Zeichnung vor dem Schuss: offen 0 (sonst brach die Aufnahme oben ab) und die Wartezeit
                erst,
                // DAS LICHT DES GEZÄHLTEN BILDS (w28-pop-treue): die Belichtung und der Boden des Rückstrahls, mit denen es zeichnete —
                // die Treue des Gangs nennt den Lichtmesser beim Namen (`werkbank pop`, `treueLicht`)
                licht: { k: rend.toneMappingExposure, boden: st.rueckstrahlLeser ? st.rueckstrahlLeser.boden.value.toArray() : null },
            };
            // die EINE Ziel-Lesung (welt-boot): das Polster der 256-Byte-Zeilen fällt dort
            const voll = await window.__zielLesen(rt, BW, BH);
            const ms = performance.now() - t0;
            // DAS BILD AM ZIEL (w18-abnahme-sicht): die Abnahme misst an der Tiefe DIESES Schusses (der Szenen-Pass des gezählten Bilds,
            // `__zielMessen`); der Aufrufer liest sie als `tiefe`, nie neu (das Bild ohne Boden-Schicht kann danach stehen)
            const tiefe = opt?.ziel && opt.satz !== "messung" ? await window.__spiegelDaten() : null;
            // DER LEIB GANZ (leib-nah-ganz, `leiberMessen`): an derselben Tiefe, vor jedem weiteren Bild der Abnahme (`__zielMessen` zeichnet
            // ohne Boden-Schicht und ohne Leiber). Ein Mess-Frame und ein Bild, das Bürger auslässt (`nurGezeichnete`), urteilen ihn nie
            const nahe = opt?.satz !== "messung" && !opt?.nurGezeichnete && st.scenePass ? window.__leiberNah() : [];
            const leiber = nahe.length ? window.__leiberMessen(tiefe || (await window.__spiegelDaten()), nahe) : null;
            const m = tiefe ? await window.__zielMessen(opt, tiefe) : window.__abnahmeMessen(opt);
            if (leiber && leiber.n) m.leiber = leiber;
            if (BW === W && BH === H) return { u8: voll, info, ms, tiefe, abnahme: abnahme(voll, W, H, m) };
            // Flächen-Mittel: jedes Ziel-Pixel mittelt die Canvas-Pixel, die es überdeckt (Box-Filter).
            const u8 = new Uint8Array(W * H * 4);
            for (let y = 0; y < H; y++) {
                const y0 = Math.floor((y * BH) / H);
                const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * BH) / H));
                for (let x = 0; x < W; x++) {
                    const x0 = Math.floor((x * BW) / W);
                    const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * BW) / W));
                    const n = (y1 - y0) * (x1 - x0);
                    for (let c = 0; c < 4; c++) {
                        let s = 0;
                        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) s += voll[(yy * BW + xx) * 4 + c];
                        u8[(y * W + x) * 4 + c] = Math.round(s / n);
                    }
                }
            }
            return { u8, info, ms, tiefe, abnahme: abnahme(u8, W, H, m) };
        } finally {
            window.__imSchuss = 0;
            rend.setOutputRenderTarget(prevOut);
            rend.setRenderTarget(prevZiel);
            rt.dispose();
            for (const [m, eigen, alt] of ruht) eigen ? (r[m] = alt) : delete r[m];
            if (RL && [RL.an.value, ...RL.boden.value.toArray()].some((v, i) => v !== lichtVor[i]))
                throw new Error("die Aufnahme: der Rückstrahl des Bodens bewegte sich in einem gehaltenen Schuss — O_k trägt ein anderes Licht als G");
        }
    })();
}

// DAS URTEIL DER WETTER-WACHE (rein, Node): `w` = { vorher, nachher, uhrVorher, uhrNachher, buch } — `buch` die Einträge des
// Spions im Fenster einer Messung. ROT: ein Schreiber (nicht die Bühne) drehte das Wetter, ein roher Schreiber schrieb am
// `_setWeather` vorbei, die Uhr taut nach der Messung, oder ein eingefrorenes Wort ist danach ein anderes. Verweigerte Züge
// (die Wache hielt) sind grün und stehen je Quelle beim Namen.
function wetterUrteil(w) {
    const fest = (u) => u < 0;
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
    return { ...w, urteil: taeter.length ? "ROT" : "GRUEN", taeter, verweigert };
}

// DER SELBSTTEST DES URTEILS (rein): jeder Täter fällt rot und steht beim Namen, Verweigerung und Bühne bleiben grün.
// DIE FÄLLE EINES URTEILS (Wetter-Wache, Welt-Akt-Wache): je Fall [Name, Eingang, Soll, Täter] — das Urteil trifft sein Soll und
// nennt den Täter beim Namen; jede Abweichung in `v`
function faelleUrteil(faelle, urteil, v) {
    for (const [name, e, soll, taeter] of faelle) {
        const u = urteil(e);
        if (u.urteil !== soll) v.push(`${name}: ${u.urteil} statt ${soll}`);
        if (taeter && !u.taeter.some((t) => t.includes(taeter))) v.push(`${name}: der Täter „${taeter}" steht nicht im Urteil`);
    }
}
function wetterSelbsttest() {
    const v = [];
    const fest = { vorher: "sunny", nachher: "sunny", uhrVorher: -1e9, uhrNachher: -1e9 };
    const nex = { art: "schreiber", von: "sunny", zu: "rainy", quelle: "nexus", stapel: "weather ← dslEval ← dslRun" };
    const faelle = [
        ["ruhig", { buch: [], ...fest }, "GRUEN", null],
        ["nexus", { ...fest, nachher: "rainy", buch: [nex] }, "ROT", "nexus"],
        [
            "hin und zurück",
            { ...fest, buch: [nex, { ...nex, von: "rainy", zu: "sunny" }] },
            "ROT",
            "nexus",
        ],
        [
            "roh",
            {
                ...fest,
                nachher: "rainy",
                buch: [{ art: "roh", von: "sunny", zu: "rainy", quelle: null, stapel: "_loopFoo" }],
            },
            "ROT",
            "ROH",
        ],
        [
            "alter Stand",
            {
                ...fest,
                nachher: "rainy",
                buch: [
                    { ...nex, quelle: "?", stapel: "weather ← dslEval ← dslRun ← _loopNexusUpdate" },
                ],
            },
            "ROT",
            "_loopNexusUpdate",
        ],
        ["taut", { buch: [], ...fest, uhrNachher: 17.6 }, "ROT", "taut"],
        ["blind", { buch: [], ...fest, nachher: "rainy" }, "ROT", "blind"],
        [
            "bühne",
            {
                ...fest,
                buch: [{ art: "schreiber", von: "rainy", zu: "sunny", quelle: "buehne", stapel: "x" }],
            },
            "GRUEN",
            null,
        ],
        [
            "verweigert",
            {
                ...fest,
                buch: [{ art: "verweigert", von: "sunny", zu: "rainy", quelle: "emotion:sorrow", stapel: "y" }],
            },
            "GRUEN",
            null,
        ],
    ];
    faelleUrteil(faelle, wetterUrteil, v);
    const vw = wetterUrteil(faelle[8][1]).verweigert;
    if (vw["emotion:sorrow → rainy"] !== 1) v.push("verweigert: die verweigerte Quelle steht nicht beim Namen");
    return v;
}

// DAS URTEIL DER HIMMELS-WACHE (rein, Node: Uhr und Wetter gehören dem Spieler). `g` = ein getakteter
// Lauf des Spiels mit laufendem Nexus NACH dem Wort des Spielers: { phase: "gesetz" | "frei", uhr: { buch, gang, start, ende },
// takt: { schritte, schrittSek, weltSek, tagMin }, wetter: { buch, wort, ende, freiAb }, zugSek, taeter: [{ name, wo, quelle, stapel }] }.
// ROT, beim Namen:
//   UHR    jeder Schreiber der Uhr im Fenster außer ihrem eigenen Gang (der Spieler sprach vorher; ein roher Schreiber am
//          Uhr-Schreiber vorbei); der Gang läuft nicht im Gesetz der Tag-Länge (Weg ≠ Schritte · Schritt / Tag) oder springt;
//          die Uhr steht am Ende anderswo als ihr Gang sagt, ohne gebuchten Schreiber (der Spion ist blind);
//   WETTER „gesetz": jede Änderung gegen das Wort des Spielers; „frei": jeder Schreiber außer dem Wetter-Zug (die Welt wünscht
//          nur), ein Zug schneller als `zugSek`, kein Wunsch der Welt im Buch, kein Zug zieht ein gewünschtes Wort;
//   TÄTER  ein Täter des Laufs steht nicht im Buch (er schrieb nicht oder der Spion ist blind).
// Verweigerte Züge und Wünsche sind grün und stehen je Quelle beim Namen.
// DIE UHR ALS „hh:mm" (der Tag-Bruchteil `t`, jede Zahl auf den Tag gefaltet) — das Urteil und die Himmels-Wache lesen sie
const hm = (t) => {
    const x = (((Number(t) % 1) + 1) % 1) * 24;
    const h = Math.floor(x);
    return `${String(h).padStart(2, "0")}:${String(Math.floor((x - h) * 60)).padStart(2, "0")}`;
};
function himmelUrteil(g) {
    const taeter = [];
    const verweigert = {};
    const gewuenscht = {};
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
    // DER GANG AN DER WELT-UHR (w28-nacht-licht): der Tag geht um die Spielzeit des Fensters (`weltSek`, Δ spielZeit) durch die
    // Tag-Länge, je Takt gleich — nie um die Wanduhr der Takte (bis w28-nacht-licht maß das Urteil den Zwilling: min(1 s, Schritt)
    // je Takt, unter 250-ms-Takten 2,5-mal die Welt)
    const soll = T.weltSek / (T.tagMin * 60);
    const schritt = soll / T.schritte;
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
                (t.quelle && e.quelle?.startsWith(t.quelle)) ||
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
    const takt = { schritte: 1000, schrittSek: 0.25, weltSek: 100, tagMin: 60 };
    const s = 0.1 / 3600;
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
    const basis = {
        takt,
        uhr: { buch: [nein("uhr", "rule:nexus", 0.17)], gang, start: 0.5, ende: 0.5 + 1000 * s },
        taeter: taeterG,
    };
    const gesetz = (o) => ({
        ...basis,
        phase: "gesetz",
        wetter: { buch: [nein("wetter", "rule:nexus", "rainy")], wort: "sunny", ende: "sunny" },
        ...o,
    });
    const frei = (buch, o) => ({
        ...basis,
        phase: "frei",
        zugSek: 120,
        wetter: { buch, wort: null, ende: "rainy", freiAb: 5 },
        ...o,
    });
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
    // das Wesen beim Stapel (seine Quelle trägt welchen Namen auch immer)
    const wesenE = (art, seq) => ({
        art,
        von: "sunny",
        zu: "rainy",
        quelle: "creature:Fuchs",
        stapel: "_setWeather ← … ← dslRun ← _executeCreatureProgram ← _handleCreatureProposedProgram",
        tv: 20,
        seq: seq || 1,
    });
    const taeterW = taeterG.concat([
        { name: "Wesen im Schöpfer-Modus", wo: "wetter", quelle: null, stapel: "_executeCreatureProgram" },
    ]);
    const wesenWetter = (extra, ende) => ({
        buch: [nein("wetter", "rule:nexus", "rainy"), ...extra],
        wort: "sunny",
        ende,
    });
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
                uhr: { buch: [], gang: { ...gang, max: 0.2 }, start: 0.5, ende: 0.5 + 1000 * s },
            }),
            "ROT",
            "springt",
        ],
        ["der Gang lahmt", gesetz({ takt: { ...takt, tagMin: 8 } }), "ROT", "Gesetz der Tag-Länge"],
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
            frei([wunsch, { ...wunsch, art: "schreiber", seq: 2 }, zug(130, 3, "rainy", "rainy")]),
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
        // DAS WESEN IM SCHÖPFER-MODUS: sein Vorschlag läuft von selbst — verweigert/gewünscht grün, als
        // Schreiber rot beim Namen, und fehlt es im Buch, ist es ungeprüft
        [
            "Wesen verweigert",
            gesetz({ wetter: wesenWetter([wesenE("verweigert")], "sunny"), taeter: taeterW }),
            "GRUEN",
            null,
        ],
        [
            "Wesen gegen das Wort",
            gesetz({ wetter: wesenWetter([wesenE("schreiber")], "rainy"), taeter: taeterW }),
            "ROT",
            "creature:Fuchs",
        ],
        [
            "frei: das Wesen wünscht",
            frei([wunsch, wesenE("gewuenscht", 2), zug(130, 3, "sunny", "rainy")], { taeter: taeterW }),
            "GRUEN",
            null,
        ],
        [
            "frei: das Wesen schreibt selbst",
            frei([wunsch, wesenE("schreiber", 2), zug(130, 3, "rainy", "rainy")], { taeter: taeterW }),
            "ROT",
            "statt dem Wetter-Zug",
        ],
        [
            "das Wesen fehlt",
            gesetz({ wetter: wesenWetter([], "sunny"), taeter: taeterW }),
            "ROT",
            "Wesen im Schöpfer-Modus: nicht im Buch",
        ],
        [
            "der Gang an der Wanduhr",
            gesetz({ uhr: { buch: [], gang: { n: 1000, weg: 2.5 * gang.weg, max: 2.5 * s }, start: 0.5, ende: 0.5 + 2.5 * gang.weg } }),
            "ROT",
            "Gesetz der Tag-Länge",
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
    return { ...b, urteil: taeter.length ? "ROT" : "GRUEN", taeter, verweigert };
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
        ({ seq: eintraege.length, gehalten: true, blind: false, buch: eintraege, ...o });
    const faelle = [
        ["ruhig", buch([]), "GRUEN", null],
        ["nexus-dorf", buch([dorf]), "ROT", "spawn_village durch nexus"],
        [
            "gehalten und durch",
            buch([halt, { ...dorf, op: "spawn_creature" }]),
            "ROT",
            "spawn_creature",
        ],
        ["blind", buch([], { blind: true }), "ROT", "DSL_WELTAKTE fehlt"],
        ["kein spion", null, "ROT", "kein Welt-Akt-Spion"],
        ["verweigert", buch([halt, halt]), "GRUEN", null],
    ];
    faelleUrteil(faelle, weltaktUrteil, v);
    if (weltaktUrteil(faelle[5][1]).verweigert["nexus → creatures_size_mul"] !== 2)
        v.push("verweigert: die verweigerte Quelle steht nicht beim Namen");
    return v;
}

// DIE LEINWAND (rein, Seite und Node; F der Augen-Karte): ein Beweisbild größer als der Puffer, der es zeichnet, ist hochgerechnet —
// ROT beim Maß (standorte/wiese und genesis: 640 × 360 gerendert, als 1280 × 720 gespeichert; die GPU-Probe: 960 × 540 aus 640 × 360).
// `u` das Urteil der Abnahme ({ ok, rot, zeile }); ein Mess-Frame (`messung`) ist kein Beweisbild.
function leinwandRot(u, satz, [BW, BH], [W, H]) {
    if (satz === "messung" || (BW >= W && BH >= H)) return u;
    const kopf = u.ok ? "ABNAHME GRÜN" : `ABNAHME ROT [${u.rot.map((q) => q.grund).join(" · ")}]`;
    const rot = [...u.rot, { feld: "geraet.leinwand", grund: `Leinwand ${BW} × ${BH} trägt kein Bild ${W} × ${H} (hochgerechnet)` }];
    return { ok: false, rot, zeile: `ABNAHME ROT [${rot.map((q) => q.grund).join(" · ")}]` + u.zeile.slice(kopf.length) };
}

// DER SCHIRM DER WELT (rein, Seite und Node; w28-probe-schirm): ein Beweisbild zeichnet in den Zeilen seines Puffers — die Welt wählte
// ihre Stufen in den Zeilen ihres letzten Takts (`_weltStand.zeilen`, der Stamm). Wechselte das Fenster dazwischen ohne Takt, trägt das
// Bild die Stufen eines anderen Schirms: ROT beim Maß. Der Täter: die Werkbank lebt in 640 × 360 und stellt das Fenster für jedes Bild
// auf seine Leinwand — bis w28-probe-schirm stand die Welt danach ohne Takt (GTX 1050, Dorf: 10 von 50 Bewohnern als Feld-Kapseln bis
// 6,6 m ans Auge, die Grenze des Felds bei 64 px von 360 statt von 1080 Zeilen). `gelebt` ohne Zahl: die Welt nennt ihren Schirm nicht.
function schirmRot(u, satz, gelebt, BH) {
    if (satz === "messung" || gelebt === BH) return u;
    const kopf = u.ok ? "ABNAHME GRÜN" : `ABNAHME ROT [${u.rot.map((q) => q.grund).join(" · ")}]`;
    const grund = Number.isFinite(gelebt) ? `die Welt wählte ihre Stufen zuletzt in ${gelebt} Zeilen, das Bild zeichnet ${BH}` : `die Welt nennt den Schirm ihres letzten Takts nicht (das Bild zeichnet ${BH} Zeilen)`; // prettier-ignore
    const rot = [...u.rot, { feld: "geraet.schirm", grund }];
    return { ok: false, rot, zeile: `ABNAHME ROT [${rot.map((q) => q.grund).join(" · ")}]` + u.zeile.slice(kopf.length) };
}

// DER STUFEN-ZENSUS (Seite; w28-probe-schirm, `werkbank stufen`): an der Kamera des Spiels je Täter-Klasse (`_taeterKlasse`: die Stufe
// steht im Namen — `fimp:atlas:L2`, `nahWiese:Lf`, `bewohner-satz`, `bauSatz` / `bauWurf`) die Instanzen im Hauptbild (`__drawZensus`),
// je Bewohner seine Gestalt (leib · satz · feld · drinnen), dazu der Schirm und das Wort der Welt. Was lebt oder ein Pass ist, trägt
// keine Stufe des Schirms (`STUFEN_OHNE`: seine Zahl folgt der Uhr, nie den Zeilen) und zählt nicht. Ebenso der Gast des Vorbaus
// (`vorbau:<Bauplan>`, der Stamm `_vorbauGast`: Maßstab 0, je Bauplan der Leiste einige Takte in der Szene, nach der Wanduhr gefragt)
// — Radeon 15.11., gate:schirm-stufen: „vorbau:baum_eiche 0→3“, die Welt ab dem Boot in 1080 Zeilen trug ihn im Schuss eben noch.
function stufenZensus() {
    return (async () => {
        const s = r._schirm();
        const steht = r._weltSteht();
        const z = await window.__drawZensus({ alle: true });
        const klassen = {};
        for (const k of z.klassen) if (!window.__stufenOhne.test(k.klasse) && (k.inst || k.cmd)) klassen[k.klasse] = k.inst || k.cmd;
        const bewohner = {};
        for (const [sid, S] of r._bewohnerSiedlungen || [])
            (S.liste || []).forEach((b, i) => {
                if (b.leib) bewohner[sid + ":" + i] = b.drinnen ? "drinnen" : b.nah ? "leib" : b.kreis ? "satz" : "feld";
            });
        return { schirm: [s.breite, s.hoehe], gelebt: r._weltStand ? r._weltStand.zeilen : null, steht, klassen, bewohner };
    })();
}
const STUFEN_OHNE = /^(tier:|vogel$|dorf-rauch$|vorbau:|rueckstrahl:|spiegel:|kontakt:|feld-pass$|Render Pipeline$|TRAA$|himmel)/;

// DER BAUM OHNE STUFE (Seite; w28-nadel-bestand, gate:laub-kante an der Tafel-Pose): jeder Baum des Samens im Blick trägt an jedem
// Schirm genau EINE Stufe. Der Same steht hier aus dem Haushalt, nie aus dem Rand, den die Welt gerade hält: jeder gebaute Chunk im
// Sichtkegel, dessen Mitte binnen des Laub-Haushalts (PERF_FOLIAGE_RADIUS_MAX, so weit der gebaute Ring reicht) liegt, ist gesät und
// wartet nicht — sonst trägt jeder Baum seines Plans keine Stufe (die Zahl, wo das Gedächtnis des Stands seine Zellen kennt); jeder
// gesäte Baum des Walds (`_waldDart`) im Kegel trägt eine Instanz oder ein Mesh. Der Täter (Radeon und GTX 1050, Mess-Wiese, main
// a71e06c7): der Laub-Rand wuchs nur im Regler (`_nexusPerfActuate`), jede Probe hält ihn (`__weltStehtNach`) — im Fenster 1920 × 1080
// stand die Saat bei 129,6 m, 53 Chunks warteten, 565 statt 1 416 Bäume, der Nadel-Bestand hinter dem Waldmantel fehlte.
function baumStufeZensus() {
    const st = r.state;
    const F = r._frustumVon(st.camera); // der EINE Bau des Sichtkegels (die Ein-Schreiber-Wand: kein eigenes Frustum)
    const p = st.playerMesh.position;
    const { span } = r._voxelChunkConfig();
    const ring =
        st._activeRingRadius != null ? st._activeRingRadius : Math.max(1, Math.min(12, st.chunkRingRadius || 4));
    const R = Math.min(AnazhRealm.PERF_FOLIAGE_RADIUS_MAX, (ring + 1) * span);
    const box = new THREE.Box3();
    const kugel = new THREE.Sphere(new THREE.Vector3(), 12);
    const imBlick = (q) => (kugel.center.set(q.x, (Number.isFinite(q.y) ? q.y : p.y) + 8, q.z), F.intersectsSphere(kugel));
    const wartet = (k) =>
        !!(
            (r._saatOffen && r._saatOffen.has(k)) ||
            (r._saatGehend && r._saatGehend.has(k)) ||
            (r._waldPflanzWarten && r._waldPflanzWarten.has(k)) || // der Pflanz-Gang wartet auf den Plan seines Walds
            (st.pendingFoliageChunks && st.pendingFoliageChunks.has(k))
        );
    const memo = r._forestDartMemo;
    const C = AnazhRealm.FOREST.cell;
    const chunks = [];
    for (const k of st.voxelChunks ? st.voxelChunks.keys() : []) {
        const i = k.indexOf(",");
        const [cx, cz] = [+k.slice(0, i), +k.slice(i + 1)];
        const [mx, mz] = [(cx + 0.5) * span, (cz + 0.5) * span];
        const y = r._voxelSurfaceY(mx, mz);
        const y0 = Number.isFinite(y) ? y : p.y;
        box.min.set(cx * span, y0 - 60, cz * span);
        box.max.set((cx + 1) * span, y0 + 60, (cz + 1) * span);
        if (!F.intersectsBox(box)) continue;
        // die Bäume seines Plans im Blick: das Gedächtnis des Stands, wo es jede Zelle des Chunks kennt (sonst null)
        let baeume = 0;
        for (let gx = Math.floor((cx * span) / C); baeume !== null && gx <= Math.floor(((cx + 1) * span - 1e-6) / C); gx++)
            for (let gz = Math.floor((cz * span) / C); baeume !== null && gz <= Math.floor(((cz + 1) * span - 1e-6) / C); gz++) {
                const a = memo && memo.get(gx + "," + gz);
                if (!a) baeume = null;
                else
                    for (const d of a)
                        if (d.x >= cx * span && d.x < (cx + 1) * span && d.z >= cz * span && d.z < (cz + 1) * span)
                            baeume += imBlick({ x: d.x, y: d.surfaceY, z: d.z }) ? 1 : 0;
            }
        const gesaet = !!(st.voxelPopulatedChunks && st.voxelPopulatedChunks.has(k)) && !wartet(k);
        chunks.push({ k, d: Math.round(Math.hypot(mx - p.x, mz - p.z)), gesaet, baeume });
    }
    // DAS DACH TRÄGT, WAS NOCH NICHT EINTRAT (K53 · w22): jenseits der inneren Kante des Kronendachs im Boden-Stoff (die Uniform
    // `fernKroneNah.U.waldR`, vom Spieler gemessen) trägt der Boden den Baum, der noch keine Karte zeichnet; steht die Karte des
    // Dachs nicht (`bereit`), trägt es nichts — jeder Baum ohne Instanz und Mesh ist dann ohne Stufe
    const nk = st.fernKroneNah;
    const dachAb = nk && nk.U && nk.U.bereit.value > 0 ? nk.U.waldR.value : Infinity;
    let wald = 0;
    let dach = 0;
    const ohne = [];
    for (const e of st.architectures || []) {
        if (!e || e._waldDart !== true || !e.position || !imBlick(e.position)) continue;
        wald++;
        if ((e.instSlots && e.instSlots.length) || e.mesh) continue;
        const d = Math.hypot(e.position.x - p.x, e.position.z - p.z);
        if (d > dachAb) dach++;
        else ohne.push({ typ: e.type, d: Math.round(d) });
    }
    return { R, ring, laubRand: r._laubRand(), dachAb, zeilen: r._schirm().hoehe, chunks, wald, dach, ohne };
}
// DAS URTEIL DES BAUMS OHNE STUFE (rein; `baumStufeZensus`): ROT je Chunk des Samens im Blick (Mitte ≤ R), der nicht gesät ist oder
// wartet — mit den Bäumen seines Plans —, und je Baum des Walds im Blick ohne Instanz und Mesh. → { rot, zeile }
function baumStufeUrteil(z) {
    const rot = [];
    const ungesaet = z.chunks.filter((c) => c.d <= z.R && !c.gesaet);
    if (ungesaet.length) {
        const b = ungesaet.reduce((n, c) => n + (c.baeume || 0), 0);
        const unbekannt = ungesaet.filter((c) => c.baeume === null).length;
        rot.push(
            `BAUM OHNE STUFE: ${ungesaet.length} Chunks des Samens im Blick (Mitte ≤ ${z.R.toFixed(1)} m) sind nicht gesät, der Laub-Rand der Welt steht bei ${z.laubRand.toFixed(1)} m — ${b} Bäume des Plans ohne Stufe${unbekannt ? ` (+ ${unbekannt} Chunks ohne Plan im Gedächtnis)` : ""}: ` +
                ungesaet
                    .sort((a, c) => a.d - c.d)
                    .slice(0, 6)
                    .map((c) => `${c.k} ${c.d} m${c.baeume !== null ? ` ${c.baeume} Bäume` : ""}`)
                    .join(" · ")
        );
    }
    if (z.ohne.length)
        rot.push(
            `BAUM OHNE STUFE: ${z.ohne.length} gesäte Bäume des Walds im Blick tragen weder Instanz noch Mesh noch Dach (das Dach ab ${Number.isFinite(z.dachAb) ? z.dachAb.toFixed(1) + " m" : "nirgends"}): ${z.ohne
                .slice(0, 6)
                .map((e) => `${e.typ} ${e.d} m`)
                .join(" · ")}`
        );
    const gesaet = z.chunks.filter((c) => c.d <= z.R && c.gesaet).length;
    const zeile = `Same im Blick: ${gesaet} von ${gesaet + ungesaet.length} Chunks gesät (≤ ${z.R.toFixed(1)} m, Ring ${z.ring}, Laub-Rand ${z.laubRand.toFixed(1)} m, ${z.zeilen} Zeilen), ${z.wald} Bäume des Walds, ${z.dach || 0} unterm Dach, ${z.ohne.length} ohne Stufe`; // prettier-ignore
    return { rot, zeile };
}

// DER BAUM VOR DEM ORT (w28-ort-vor-wald; Seite, vor dem Sprung gerufen — `werkbank pop`, gate:pop): je Baum des Walds (`_waldDart`),
// den die Welt nimmt (`removeArchitecture`), Zeit, Abstand zum Spieler und sein Grund — die Marke trägt der Ruf, der ihn nimmt: der
// Plan folgt dem Rand eines Orts, der nach der Pflanzung kam (`saum`: `_waldNachwuchs`, gerufen vom Saum `_saumRaeumen`), eine Fläche
// des Dorfs (`wege`: `_wegeRaeumen` — Weg, Platz, Acker, Feldweg) oder ein Haus (`grundriss`: `_grundrissRaeumen`), sonst `sonst`.
// `__baumFall(ab)` liest, was seit `ab` (performance.now) fiel und was davon im Laub-Rand.
function baumFallHaken() {
    if (window.__baumFall) return "da";
    const st = r.state;
    const L = [];
    let grund = null;
    const marke = (name, g) => {
        const ur = r[name];
        r[name] = function (...a) {
            const vor = grund;
            grund = grund || g;
            try {
                return ur.apply(this, a);
            } finally {
                grund = vor;
            }
        };
    };
    marke("_waldNachwuchs", "saum");
    marke("_wegeRaeumen", "wege");
    marke("_grundrissRaeumen", "grundriss");
    const rm = r.removeArchitecture;
    r.removeArchitecture = function (e, ...a) {
        if (e && e._waldDart === true && e.position) {
            const p = st.playerMesh.position;
            const d = Math.round(Math.hypot(e.position.x - p.x, e.position.z - p.z));
            L.push({ t: performance.now(), d, typ: e.type, grund: grund || "sonst" });
        }
        return rm.call(this, e, ...a);
    };
    window.__baumFall = (ab) => {
        const R = r._laubRand();
        const seit = L.filter((f) => f.t > ab);
        return { laubRand: R, faelle: seit.length, nach: seit.filter((f) => f.d <= R).map(({ d, typ, grund }) => ({ d, typ, grund })) }; // prettier-ignore
    };
    return "ok";
}
// DIE ORTE LIEGEN (w28-ort-vor-wald; Seite, nach dem Sprung): Takt um Takt mit seinem Bild (`__werkTakt`), bis kein Vorrat ohne Grund
// (`_dorfVorraete`; einer ohne Plan v2 legt ihn erst beim Erwachen), kein Dorf-Akt (`_dorfOffen`) und kein wartender Pflanz-Gang
// (`_waldPflanzWarten`) 120 Takte am Stück offen steht → { takte, ms }. Das EINE Warten (`__deckel`, welt-boot): es zählt einen Takt
// nur, wenn weder die Welt noch die Orte offen haben, und wirft beim Namen, wenn die Orte nie liegen (die Warte-Wand: keine Wanduhr-Frist).
function baumFallWarten() {
    return (async () => {
        const t0 = performance.now();
        let [takte, ruhig, offen] = [0, 0, null];
        for (const weiter = window.__deckel("die Orte liegen", 1200, () => offen !== null); ruhig < 120 && weiter(); ) {
            const bild = __werkTakt();
            takte++;
            const V = [...(r._dorfVorraete || new Map())].filter(([, w]) => !w.grund && !(w.da && !w.v2)).map(([k]) => k);
            const d = r._dorfOffen();
            const p = r._waldPflanzWarten ? r._waldPflanzWarten.size : 0;
            offen = V.length || d || p ? `Vorräte ohne Grund ${V.length}${V.length ? ` (${V.slice(0, 3).join(" ")})` : ""} · Dorf offen ${d} · Pflanz-Gänge warten ${p}` : null; // prettier-ignore
            ruhig = offen ? 0 : ruhig + 1;
            await bild;
        }
        return { takte, ms: Math.round(performance.now() - t0) };
    })();
}
// DAS URTEIL DES BAUMS VOR DEM ORT (rein; `__baumFall` und `baumFallWarten` nach dem Sprung): ROT, wenn im Laub-Rand ein Baum des Walds
// fiel, den keine Fläche des Erwachens nahm — der Saum seines Orts, der nach seiner Pflanzung kam (`saum`), oder ein anderer Weg
// (`sonst`). Die Flächen des Erwachens (Wege, Grundriss: sie legt das Erwachen, nie der Grund im Vorlauf) stehen offen beim Namen;
// liegen die Orte nie, wirft schon das Warten beim Namen. → { rot, zeile }
function baumFallUrteil(f) {
    const rot = [];
    const je = (g) => f.nach.filter((e) => e.grund === g).length;
    const taeter = f.nach.filter((e) => e.grund !== "wege" && e.grund !== "grundriss");
    if (taeter.length)
        rot.push(
            `BAUM VOR DEM ORT: ${taeter.length} Bäume des Walds fielen nach dem Sprung im Laub-Rand (≤ ${Math.round(f.laubRand)} m) — sie standen vor dem Grund ihres Orts: ${taeter
                .slice()
                .sort((a, b) => a.d - b.d)
                .slice(0, 6)
                .map((e) => `${e.typ} ${e.d} m (${e.grund})`)
                .join(" · ")}`
        );
    const zeile = `${f.faelle} Bäume des Walds fielen nach dem Sprung, ${f.nach.length} im Laub-Rand (≤ ${Math.round(f.laubRand)} m): Saum ${je("saum")}, sonst ${je("sonst")} · offen (die Fläche legt das Erwachen): Wege ${je("wege")}, Grundriss ${je("grundriss")} · die Orte lagen nach ${f.takte} Takten (${f.ms} ms)`; // prettier-ignore
    return { rot, zeile };
}

// DIE ABWEICHUNG ZWEIER ZENSUS (rein): die Dinge, die in `b` eine andere Stufe tragen als in `a` — je Bewohner sein Wechsel, je Klasse
// die Differenz ihrer Instanzen. `dinge` zählt sie (ein Bewohner einmal: sein Satz `bewohner-satz` zählt nicht noch als Klasse).
function stufenAbweichung(a, b) {
    const wechsel = {};
    for (const k of new Set([...Object.keys(a.bewohner), ...Object.keys(b.bewohner)]))
        if (a.bewohner[k] !== b.bewohner[k]) {
            const w = `${a.bewohner[k] || "—"}→${b.bewohner[k] || "—"}`;
            wechsel[w] = (wechsel[w] || 0) + 1;
        }
    const klassen = [...new Set([...Object.keys(a.klassen), ...Object.keys(b.klassen)])]
        .filter((k) => !/^bewohner(-satz)?$/.test(k) && (a.klassen[k] || 0) !== (b.klassen[k] || 0))
        .sort()
        .map((k) => ({ klasse: k, a: a.klassen[k] || 0, b: b.klassen[k] || 0 }));
    const dinge = Object.values(wechsel).reduce((n, x) => n + x, 0) + klassen.reduce((n, k) => n + Math.abs(k.a - k.b), 0);
    const zeile = [...Object.entries(wechsel).map(([w, n]) => `${n} Bewohner ${w}`), ...klassen.map((k) => `${k.klasse} ${k.a}→${k.b}`)].join(" · ");
    return { dinge, wechsel, klassen, zeile };
}
// DAS URTEIL DER STUFEN AM SCHIRM (rein; `werkbank stufen`): `schuss` der Zensus, wie das Bild ihn schießt (nach dem Fenster-Wechsel und
// dem Warten der Bühne), `gelebt` der einer Welt, die ab dem Boot in den Zeilen des Bilds lebte, `stand` der direkt nach dem
// Fenster-Wechsel, ohne Takt (die Welt auf dem Schirm der Sitzung — der Täter von main). GRÜN: `schuss` = `gelebt`, 0 Dinge. Die Probe
// ist LEER (ROT), wo `stand` = `gelebt`: an dieser Pose hängt keine Stufe am Schirm, die Linse sähe den Täter nicht.
function stufenUrteil({ schuss, gelebt, stand }) {
    const rot = [];
    for (const [name, z] of [["das Bild", schuss], ["die gelebte Welt", gelebt]]) // prettier-ignore
        if (z.gelebt !== z.schirm[1]) rot.push(`SCHIRM: ${name} zeichnet ${z.schirm[1]} Zeilen, die Welt wählte ihre Stufen zuletzt in ${z.gelebt}`);
    if (schuss.schirm[1] !== gelebt.schirm[1]) rot.push(`SCHIRM: das Bild zeichnet ${schuss.schirm[1]} Zeilen, die gelebte Welt ${gelebt.schirm[1]}`);
    const A = stufenAbweichung(schuss, gelebt);
    if (A.dinge) rot.push(`STUFEN: ${A.dinge} Dinge tragen im Bild eine andere Stufe als in der Welt, die in ${gelebt.schirm[1]} Zeilen lebte: ${A.zeile}`);
    const T = stufenAbweichung(stand, gelebt);
    if (!T.dinge) rot.push(`LEER: an dieser Pose trägt nach dem Fenster-Wechsel ${stand.gelebt} → ${gelebt.schirm[1]} Zeilen kein Ding eine andere Stufe — die Probe sähe den Täter nicht`);
    return { rot, schuss: A, taeter: T };
}

// DER INHALT DES ORTS (rein; D der Augen-Karte, w28-linse-wahr): was ein Messort IST, zeigt sein Bild — je Klasse seines `imBild`
// (spec/profiband/haushalt.json, die Familie: der Schlüssel und jede Klasse, die mit `-` `_` `:` weitergeht) ein Mindest-Anteil der
// Leinwand und am Tag (Uhr 0,25–0,75; ohne Wort Mittag) das Band ihrer Farbe aus der EINEN Tafel `inhaltBand` (der Farbton
// h = atan2(b*, a*) des Mittels ihrer Pixel in linearem Licht, CIELAB D65 wie die Farbton-Streuung, ab Buntheit C* 5; die Luma
// Rec. 709 des Mittels). Bis hier fragte nur das Dorf und die Stadt den Anteil, und Gras in Magenta, Türkis und Violett stand GRÜN
// (P50 0136ab62-wiese). `klassen`: { name: { pixel, farbe: [r, g, b] linear } }. Ein Ort ohne `imBild` ist ROT, eine Klasse ohne
// Band ebenso; der Anteil steht auch bei GRÜN in der Zeile.
// die Familie eines Schlüssels: er selbst und jede Klasse, die mit `-` `_` `:` weitergeht (`bewohner-satz`, `fahrzeug_gt`, `nahWiese:L1`)
const inhaltFamilie = (k) => new RegExp(`^${k}([-_:].*)?$`);
function inhaltUrteil(inhalt, band, klassen, flaeche, uhr) {
    if (!inhalt || !Object.keys(inhalt).length) return { rot: [{ schluessel: "imBild", grund: "der Messort trägt kein imBild — sein Inhalt bliebe ungefragt" }], zeile: "Inhalt ungefragt" }; // prettier-ignore
    const pct = (x) => `${(100 * x).toFixed(1)} %`;
    const tag = uhr == null || (uhr >= 0.25 && uhr <= 0.75);
    const rot = [];
    const zeilen = [];
    for (const [k, anteil] of Object.entries(inhalt)) {
        const re = inhaltFamilie(k);
        const B = band?.[k];
        const tr = Object.entries(klassen || {}).filter(([kl]) => re.test(kl));
        const px = tr.reduce((n, [, m]) => n + (m.pixel || 0), 0);
        const lin = [0, 1, 2].map((c) => (px ? tr.reduce((s, [, m]) => s + (m.farbe ? m.farbe[c] * m.pixel : 0), 0) / px : 0));
        const [, A, Bb] = cielab(lin);
        const [h, C] = [((Math.atan2(Bb, A) * 180) / Math.PI + 360) % 360, Math.hypot(A, Bb)];
        const l = 255 * (0.2126 * linSrgb(lin[0]) + 0.7152 * linSrgb(lin[1]) + 0.0722 * linSrgb(lin[2]));
        let z = `${k} ${pct(px / flaeche)} (≥ ${pct(anteil)})`;
        if (!(px >= anteil * flaeche)) rot.push({ schluessel: `imBild.${k}`, grund: `kein ${k} im Bild: ${pct(px / flaeche)} < ${pct(anteil)}` });
        if (!B) rot.push({ schluessel: `band.${k}`, grund: `${k} ohne Band (inhaltBand) — seine Farbe bliebe ungefragt` });
        else if (tag && px) {
            const imBand = ([a, b], v) => (a <= b ? v >= a && v <= b : v >= a || v <= b);
            if (B.farbton && C < 5) rot.push({ schluessel: `band.${k}`, grund: `${k} farblos (C* ${C.toFixed(1)} < 5, Soll Farbton ${B.farbton.join("–")}°)` });
            else if (B.farbton && !imBand(B.farbton, h)) rot.push({ schluessel: `band.${k}`, grund: `${k} im Farbton ${h.toFixed(0)}° außerhalb ${B.farbton.join("–")}°` });
            if (B.luma && !imBand(B.luma, l)) rot.push({ schluessel: `band.${k}`, grund: `${k} in Luma ${l.toFixed(0)} außerhalb ${B.luma.join("–")}` });
            z += `${B.farbton ? ` h ${h.toFixed(0)}°` : ""} Luma ${l.toFixed(0)}`;
        }
        zeilen.push(z);
    }
    return { rot, zeile: `Inhalt ${zeilen.join(", ")}${tag ? "" : " (Nacht: Farbe ungefordert)"}` };
}

// DER SCHLÜSSEL EINES ROTS (rein): das Feld der Abnahme — die Sicht, die nur der Leib reißt, heißt `leib` (ohne ihn hielte sie)
function rotSchluessel(q, m) {
    const S = SCHWELLEN.beweis.find((s) => s.feld === "sicht.deckung").wert;
    if (q.feld === "sicht.deckung" && m?.sicht?.leib?.deckung > 0 && m.sicht.deckung - m.sicht.leib.deckung <= S) return "leib";
    return q.schluessel || q.feld;
}

// ROT WIE AN MAIN (rein; die Ratsche des Messorts, `bekannt` in spec/profiband/haushalt.json): ein ROT, dessen Schlüssel der Ort als
// bekannt führt (Zahl, Gerät, Quelle), reißt die Probe nicht — die Zeile sagt „ROT wie an main (bekannt)“, der Leser des Urteils
// (scripts/lib/urteil-zeile.cjs) liest es BEKANNT; jedes andere ROT reißt. Ein bekannter Schlüssel, der hält, steht als „hält jetzt“
// in der Zeile: sein Eintrag fällt mit dem Commit, der ihn heilte.
function ortUrteil(rot, bekannt, ort) {
    const b = bekannt || {};
    const [neu, alt] = [rot.filter((q) => !Object.hasOwn(b, q.schluessel)), rot.filter((q) => Object.hasOwn(b, q.schluessel))];
    const geheilt = Object.keys(b).filter((k) => !rot.some((q) => q.schluessel === k));
    const bek = alt.length ? ` · ROT wie an main (bekannt): ${alt.map((q) => `${ort}.${q.schluessel} ${q.grund}`).join(" · ")}` : "";
    const hält = geheilt.length ? ` · bekannt ${geheilt.map((k) => `${ort}.${k}`).join(", ")} hält jetzt (der Eintrag fällt)` : "";
    if (neu.length) return { u: "ROT", kopf: `ABNAHME ROT [${neu.map((q) => q.grund).join(" · ")}]${bek}${hält}` };
    return { u: alt.length ? "BEKANNT" : "GRÜN", kopf: `ABNAHME ${alt.length ? "BEKANNT" : "GRÜN"}${bek}${hält}` };
}

// DER SELBSTTEST DER BILD-LINSEN (w28-linse-wahr; `werkbank bild --selbsttest`, in npm run check): je Klasse der Augen-Karte die Linse
// an einer gestellten Lage und ihre Mutante — die Fassung von main —, die ROT stehen muss, wo die Linse ROT sagt:
//   B  der Leib vor der Linse: eine echte Szene (three aus vendor/) mit Kopf 0,8 m vor der Kamera — die Nah-Linse nennt „Leib spieler“
//      über 2 %, ein Leib am Ziel zählt nie; die Mutante (der Leib zählt nie, `zaehlt` von main) sieht 0
//   F  der Punkt, der durchfällt: der Fuß unter dem Bild steht im Namen, die Mutante nennt die Mitte
//   C  das leere Ziel: ein benanntes Ziel ohne Gestalt ist nicht gezeichnet, der Blick-Punkt bleibt frei; die Mutante (`[].every`) GRÜN
//   D  der Inhalt: Gras in Magenta, ein Ort ohne imBild, eine Klasse ohne Band, zu wenig Gras — ROT; die Mutante ohne Band GRÜN
//   F  die Leinwand: 640 × 360 als 960 × 540 ROT, ein Mess-Frame frei; die Mutante (ohne Schwelle) GRÜN
//   R  die Ratsche: bekannt reißt nicht, neu reißt, geheilt steht beim Namen
async function bildLinsenSelbsttest() {
    const v = [];
    // three aus vendor/ als Modul (die Seite lädt dasselbe), nie als Text
    const T = await import(require("url").pathToFileURL(require("path").join(__dirname, "../../vendor/three.core.min.js")).href);
    const KN = require("./kamera-nah.cjs");
    // die Mutante: der Text der Linse mit EINER Stelle von main, in ihrem Umfeld (`umfeld`: die freien Namen des Moduls)
    const mutante = (fn, a, b, umfeld = { cielab, linSrgb, SCHWELLEN, inhaltFamilie }) => {
        const s = fn.toString();
        if (!s.includes(a)) v.push(`die Mutante greift nicht: „${a.slice(0, 40)}“ steht nicht in ${fn.name}`);
        return new Function(...Object.keys(umfeld), `return (${s.replace(a, b)});`)(...Object.values(umfeld));
    };
    // je Klasse: die Linse hält ihr Soll (`rot` falsch), ihre Mutante nicht (`rot` wahr)
    const klasse = (name, rot, linse, mut) => {
        const [a, b] = [rot(linse), rot(mut)];
        if (a) v.push(`${name}: ${a === true ? "ROT" : a}`);
        if (!b) v.push(`${name}-Mutante (main) besteht — die Linse sieht den Täter nicht`);
    };
    // B, F: die Szene — Kamera im Ursprung blickt nach −z; der Kopf eines Leibs (ein Mesh mit Skelett) 0,8 m vor ihr, ein Haus 30 m fern
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
    const knochen = new T.Bone();
    const kopfGeo = new T.BoxGeometry(0.4, 0.4, 0.4);
    const n = kopfGeo.attributes.position.count;
    kopfGeo.setAttribute("skinIndex", new T.Uint16BufferAttribute(new Uint16Array(n * 4), 4));
    kopfGeo.setAttribute("skinWeight", new T.Float32BufferAttribute(new Float32Array(n * 4).map((_, i) => +!(i % 4)), 4));
    const kopf = new T.SkinnedMesh(kopfGeo, new T.MeshBasicMaterial());
    const spieler = new T.Group();
    kopf.add(knochen);
    spieler.add(kopf);
    spieler.position.set(0.15, -0.25, -0.8);
    const haus = new T.Mesh(new T.BoxGeometry(8, 6, 8), new T.MeshBasicMaterial());
    haus.name = "haus";
    haus.position.set(0, 0, -30);
    scene.add(cam, spieler, haus);
    scene.updateMatrixWorld(true);
    kopf.bind(new T.Skeleton([knochen])); // gebunden in der Lage, die das Bild zeigt
    const r = {
        state: { camera: cam, scene, architectures: [], lodUniforms: {}, player: {} },
        _taeterKlasse: (o) => (o === kopf || o === spieler ? "spieler" : o.name || "UNBENANNT"),
        _kopfKlasse: (o) => [r._taeterKlasse(o)],
        _istNatur: () => false,
    };
    const welt = { THREE: T, anazhRealm: r, __kameraZeichnet: KN.kameraZeichnet, __istLeib: KN.istLeib };
    const lauf = (fn, o) => {
        const alt = [global.window, global.st, global.r, global.AnazhRealm];
        Object.assign(global, { window: welt, st: r.state, r, AnazhRealm: {} });
        try {
            return fn(o);
        } finally {
            [global.window, global.st, global.r, global.AnazhRealm] = alt;
        }
    };
    const leibFrage = { radien: { Laub: 2, Leib: 2 }, gw: 48, gh: 27, neu: true };
    const leibRot = (fn) => ((L) => !(L.jeKlasse.Leib > 0.02 && L.leib?.taeter["Leib spieler"]) && `der Kopf 0,8 m vor der Linse: ${JSON.stringify(L.jeKlasse)}`)(lauf(fn, leibFrage)); // prettier-ignore
    klasse("B Leib vor der Linse", leibRot, KN.nahDeckungInSeite, mutante(KN.nahDeckungInSeite, "(LEIB || !leib(obj))", "!leib(obj)", {}));
    if (lauf(KN.nahDeckungInSeite, { ...leibFrage, zielUm: { punkte: [[0.15, -0.25, -0.8]], r: 1.5 } }).jeKlasse.Leib) v.push("B: der Leib am Ziel deckt — er ist das Ziel, nie sein Täter"); // prettier-ignore
    if (lauf(KN.nahDeckungInSeite, { radien: { Laub: 2 }, gw: 48, gh: 27, neu: true }).jeKlasse.Leib) v.push("B: ohne Radius zählt der Leib (die Kamera-Laub-Wand fragt ihn nie)"); // prettier-ignore
    // L: der Leib mit Ziel (w28-ziel-plan) — die volle Messung der Abnahme an derselben Szene, das Haus 30 m fern ist das Blickziel: der
    // Kopf 0,8 m vor der Linse zählt im Vordergrund beim Namen („Leib spieler“ in `vordergrund.leib`), nie in `sicht.deckung`; ohne
    // Ziel zählt er dort wie bisher. Die Mutante (main: der Leib auch mit Ziel in der Sicht) steht ROT in der Sicht.
    Object.assign(welt, { __nahDeckung: KN.nahDeckungInSeite, __zielGestalt: zielGestalt, __gestaltLeben: gestaltLeben });
    Object.assign(r, { _voxelSurfaceY: () => NaN, _archImBild: () => true });
    const haus30 = { ziel: { x: 0, y: 0, z: -30, name: "Blickziel", fuss: false } }; // BÜHNE: die gestellte Szene des Selbsttests, kein Ort der Welt
    const leibZielRot = (fn) => ((m) => !(m.sicht.deckung <= 0.02 && !m.sicht.leib && m.sicht.vordergrund?.leib?.taeter["Leib spieler"] > 0.02 && m.sicht.vordergrund.deckung >= m.sicht.vordergrund.leib.deckung) && `mit Ziel: ${JSON.stringify(m.sicht)}`)(lauf(fn, haus30)); // prettier-ignore
    klasse("L Leib mit Ziel", leibZielRot, abnahmeMessen, mutante(abnahmeMessen, "...(z ? {} : { Leib: RADIUS })", "Leib: RADIUS", {}));
    {
        const m = lauf(abnahmeMessen, {});
        if (!(m.sicht.deckung > 0.02 && m.sicht.leib?.taeter["Leib spieler"] > 0.02)) v.push(`L: ohne Ziel zählt der Kopf vor der Linse nicht in der Sicht: ${JSON.stringify(m.sicht)}`); // prettier-ignore
    }
    // G: der Leib ganz (leib-nah-ganz) — ein Bewohner 4 m vor der Kamera, Kopf (Haut) und Hemd (Stoff) an einem bewegten Knochen; das
    // Bild ist seine Tiefe (je Pixel der Strahl gegen die Kisten der GEZEICHNETEN Teile, dahinter eine Wand in 30 m). Gezeichnet ist er
    // ganz; fehlt das Hemd im Bild (stadt-voll an main 6699a813: die Pipeline des Stoffs galt r184 für immer als kaputt), steht es ROT
    // beim Namen — Bewohner, Teil, Stoff; ein Pfeiler vor dem Hemd verdeckt es (kein Urteil), jenseits von 6 m misst die Linse nicht.
    // Die Mutante (main: kein Urteil über das Teil) besteht nicht.
    {
        const [sz, kam, bein] = [new T.Scene(), new T.PerspectiveCamera(60, 16 / 9, 0.1, 1000), new T.Bone()];
        const teil = (w, h, y, name) => {
            const g = new T.BoxGeometry(w, h, 0.3, 4, 4, 2);
            const n = g.attributes.position.count;
            g.setAttribute("skinIndex", new T.Uint16BufferAttribute(new Uint16Array(n * 4), 4));
            g.setAttribute("skinWeight", new T.Float32BufferAttribute(new Float32Array(n * 4).map((_, i) => +!(i % 4)), 4));
            const c = new T.SkinnedMesh(g, new T.MeshBasicMaterial({ name }));
            c.position.y = y;
            return c;
        };
        const [kopfG, hemd, leib] = [teil(0.3, 0.3, 1.6, "Haut"), teil(0.5, 0.7, 1.0, "Hemd"), new T.Group()];
        const pfeiler = new T.Mesh(new T.BoxGeometry(0.9, 0.4, 0.2), new T.MeshBasicMaterial());
        pfeiler.position.set(0.25, 0, -2);
        leib.add(kopfG, hemd, bein);
        leib.position.set(0, -1, -4);
        sz.add(kam, leib, pfeiler);
        sz.updateMatrixWorld(true);
        const skelett = new T.Skeleton([bein]);
        for (const c of [kopfG, hemd]) c.bind(skelett);
        bein.position.x = 0.25; // der Knochen trägt beide Teile aus der Ruhelage: die Linse liest die Haut der CPU, nie die Ruhelage
        sz.updateMatrixWorld(true);
        const rG = {
            state: { camera: kam, scene: sz, creatures: [] },
            _bewohnerSiedlungen: new Map([["dorf", { liste: [{ nr: 7, leib }] }]]),
            _taeterKlasse: (o) => (o === pfeiler ? "pfeiler" : "bewohner"),
            _kopfKlasse: (o) => ["bewohner", o === hemd ? "bewohner:leib/stoff" : "bewohner:kopf/haut"],
        };
        const weltG = { THREE: T, anazhRealm: rG, __kameraZeichnet: KN.kameraZeichnet, __leiberNah: leiberNah };
        const bild = (gezeichnet) => {
            const [tw, th] = [320, 180];
            const vp = new T.Matrix4().multiplyMatrices(kam.projectionMatrix, kam.matrixWorldInverse);
            const ivp = vp.clone().invert();
            const kisten = gezeichnet.map((c, _i, _a, k = c.isSkinnedMesh ? c : c.geometry) => (k.computeBoundingBox(), k.boundingBox.clone().applyMatrix4(c.matrixWorld))); // prettier-ignore
            const strahl = new T.Ray();
            const punkt = (j) => {
                strahl.direction.set((2 * (j % tw) + 1) / tw - 1, 1 - (2 * Math.floor(j / tw) + 1) / th, 0.5).applyMatrix4(ivp).normalize();
                const treffer = kisten.map((k) => strahl.intersectBox(k, new T.Vector3())).filter(Boolean).sort((a, b) => a.length() - b.length())[0]; // prettier-ignore
                return treffer || strahl.direction.clone().multiplyScalar(-30 / strahl.direction.z);
            };
            return { tw, th, vp: vp.elements, auge: [0, 0, 0], punkt };
        };
        const laufG = (fn, gezeichnet) => {
            const alt = [global.window, global.st, global.r];
            Object.assign(global, { window: weltG, st: rG.state, r: rG });
            try {
                return fn(bild(gezeichnet));
            } finally {
                [global.window, global.st, global.r] = alt;
            }
        };
        const ganz = laufG(leiberMessen, [kopfG, hemd]);
        if (!(ganz.ganz && ganz.n === 1 && ganz.halb === 0 && ganz.teile === 2)) v.push(`G: der ganze Leib steht nicht ganz: ${JSON.stringify(ganz)}`);
        const halbRot = (fn) => ((L) => !(!L.ganz && L.halb === 1 && L.fehlt.length === 1 && /^bewohner 7 in 4\.\d+ m: bewohner:leib\/stoff \(Hemd_\d+\) 0 von \d+ Ecken im Bild$/.test(L.fehlt[0])) && `ohne Hemd im Bild: ${JSON.stringify(L)}`)(laufG(fn, [kopfG])); // prettier-ignore
        klasse("G Leib ganz", halbRot, leiberMessen, mutante(leiberMessen, "if (z.leer < q.leerAb * frei) continue;", "continue;", {}));
        const verdeckt = laufG(leiberMessen, [kopfG, pfeiler]);
        if (!(verdeckt.ganz && verdeckt.n === 1 && verdeckt.teile === 1)) v.push(`G: das Hemd hinter dem Pfeiler ist verdeckt, nie ungezeichnet: ${JSON.stringify(verdeckt)}`);
        leib.position.z = -9;
        sz.updateMatrixWorld(true);
        const fern = laufG(leiberMessen, [kopfG]);
        if (fern.n !== 0 || !fern.ganz) v.push(`G: jenseits von 6 m misst die Linse nicht: ${JSON.stringify(fern)}`);
    }
    // F: das Haus im Bild, sein Fuß 40 m tiefer unter dem Bild — der Grund nennt den Fuß mit SEINER Projektion
    const zielFrage = { radien: {}, nurZiel: true, ziel: { x: 0, y: 0, z: -30, name: "Haus", punkte: [[0, -40, -30]], punktNamen: ["Fuß"] } }; // BÜHNE: die gestellte Szene des Selbsttests, kein Ort der Welt
    const fussRot = (fn) => ((Z) => !(!Z.imBild && /am Fuß/.test(Z.name) && Z.ndc[1] < -0.95) && `${Z.name} ndc ${Z.ndc}`)(lauf(fn, zielFrage).ziel);
    klasse("F Punkt, der durchfällt", fussRot, KN.nahDeckungInSeite, mutante(KN.nahDeckungInSeite, "punkte[Math.max(0, aussen)]", "punkte[0]", {}));
    // C: das leere Ziel
    const tier = { name: "Tier", r: 1.5 };
    klasse("C leeres Ziel", (f) => f(tier, []).gezeichnet !== false && JSON.stringify(f(tier, [])), zielGestalt, mutante(zielGestalt, "if (!teile.length && benannt)", "if (false)", {})); // prettier-ignore
    if (zielGestalt({ name: "Blickziel" }, []).gezeichnet !== true) v.push("C: der Blick-Punkt ohne Werk ist kein leeres Ziel");
    if (zielGestalt(tier, [{ name: "tier:wolf 3", gezeichnet: false }]).gezeichnet) v.push("C: ein ungezeichnetes Tier am Ziel gilt als gezeichnet");
    if (!zielGestalt(tier, [{ name: "tier:wolf 3", gezeichnet: true }]).gezeichnet) v.push("C: das gezeichnete Tier am Ziel fällt");
    // D: der Inhalt der Wiese — Gras in Grün, in Magenta, zu wenig, ohne Band, ohne imBild, nachts
    const band = { nahWiese: { farbton: [70, 160], luma: [30, 200] } };
    const gras = (farbe, pixel = 500) => ({ "nahWiese:L1": { pixel, farbe }, bodenSatz: { pixel: 100, farbe: [0.2, 0.2, 0.2] } });
    const [gruen, magenta] = [[0.12, 0.2, 0.03], [0.4, 0.05, 0.45]];
    const D = (k, b = band, uhr, f = inhaltUrteil) => f({ nahWiese: 0.15 }, b, k, 1000, uhr).rot.map((q) => q.grund).join(" · ");
    klasse("D Gras in Magenta", (f) => !/Farbton/.test(D(gras(magenta), band, null, f)), inhaltUrteil, mutante(inhaltUrteil, "else if (B.farbton && !imBand(B.farbton, h))", "else if (false)")); // prettier-ignore
    if (D(gras(gruen))) v.push(`D: grünes Gras fällt: ${D(gras(gruen))}`);
    if (D(gras(magenta), band, 0.02)) v.push("D: nachts fragt das Band die Farbe");
    if (!/kein nahWiese/.test(D(gras(gruen, 100)))) v.push("D: 10 % Gras halten 15 %");
    if (!/ohne Band/.test(D(gras(gruen), {}))) v.push("D: eine Klasse ohne Band hält");
    if (!inhaltUrteil(null, band, {}, 1000).rot.length) v.push("D: ein Ort ohne imBild hält");
    // F: die Leinwand
    const gut = { ok: true, rot: [], zeile: "ABNAHME GRÜN · beweis · x" };
    const lwRot = (f) => ((u) => !(!u.ok && /^ABNAHME ROT \[Leinwand 640 × 360 trägt kein Bild 960 × 540 \(hochgerechnet\)\] · beweis · x$/.test(u.zeile)) && u.zeile)(f(gut, "beweis", [640, 360], [960, 540])); // prettier-ignore
    klasse("F Leinwand", lwRot, leinwandRot, mutante(leinwandRot, "(BW >= W && BH >= H)", "true", {}));
    if (!leinwandRot(gut, "messung", [64, 36], [960, 540]).ok || !leinwandRot(gut, "beweis", [1920, 1080], [960, 540]).ok) v.push("F: ein Mess-Frame oder ein verkleinertes Bild fällt"); // prettier-ignore
    // S: der Schirm der Welt (w28-probe-schirm) — das Bild in 1080 Zeilen aus einer Welt, die zuletzt in 360 wählte; die Mutante ist main
    const scRot = (f) => ((u) => !(!u.ok && /^ABNAHME ROT \[die Welt wählte ihre Stufen zuletzt in 360 Zeilen, das Bild zeichnet 1080\] · beweis · x$/.test(u.zeile)) && u.zeile)(f(gut, "beweis", 360, 1080)); // prettier-ignore
    klasse("S Schirm der Welt", scRot, schirmRot, mutante(schirmRot, "gelebt === BH", "true", {}));
    if (!schirmRot(gut, "beweis", 1080, 1080).ok || !schirmRot(gut, "messung", 360, 1080).ok) v.push("S: ein Bild am Schirm der Welt oder ein Mess-Frame fällt");
    if (!/nennt den Schirm ihres letzten Takts nicht/.test(schirmRot(gut, "beweis", null, 1080).zeile)) v.push("S: eine Welt ohne Schirm ihres Takts hält");
    // S: die Stufen am Schirm (`werkbank stufen`) — das Dorf: 10 Bewohner im Feld, die in 1080 Zeilen im Satz stehen
    {
        const zens = (zeilen, gelebt, feld) => ({ schirm: [(zeilen * 16) / 9, zeilen], gelebt, steht: true, klassen: { "fimp:atlas:L2": 232, "bewohner-satz": feld ? 3 : 6 }, bewohner: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`d:${i}`, i < 2 ? "leib" : feld && i < 12 ? "feld" : "satz"])) }); // prettier-ignore
        const [stand, wahr] = [zens(1080, 360, true), zens(1080, 1080, false)];
        const U = (schuss, st = stand, f = stufenUrteil) => f({ schuss, gelebt: wahr, stand: st }).rot.join(" | ");
        if (U(wahr)) v.push(`S: das Bild der gelebten Welt fällt: ${U(wahr)}`);
        klasse("S Stufen eines anderen Schirms", (f) => !/^SCHIRM: das Bild zeichnet 1080 Zeilen, die Welt wählte ihre Stufen zuletzt in 360 \| STUFEN: 10 Dinge .*: 10 Bewohner feld→satz$/.test(U(stand, stand, f)) && (U(stand, stand, f) || "kein ROT"), stufenUrteil, mutante(stufenUrteil, "if (A.dinge)", "if (false)", { stufenAbweichung })); // prettier-ignore
        klasse("S leere Pose", (f) => !/^LEER: an dieser Pose trägt nach dem Fenster-Wechsel 1080 → 1080 Zeilen kein Ding/.test(U(wahr, wahr, f)) && (U(wahr, wahr, f) || "kein ROT"), stufenUrteil, mutante(stufenUrteil, "if (!T.dinge)", "if (false)", { stufenAbweichung })); // prettier-ignore
        const kl = stufenAbweichung(wahr, { ...wahr, klassen: { "fimp:atlas:L2": 230, "f:haus:L1": 2, "bewohner-satz": 9 } });
        if (kl.dinge !== 4 || kl.zeile !== "f:haus:L1 0→2 · fimp:atlas:L2 232→230") v.push(`S: die Klassen-Abweichung zählt falsch: ${kl.dinge} · ${kl.zeile}`);
        if (!STUFEN_OHNE.test("tier:bestaeuber") || !STUFEN_OHNE.test("dorf-rauch") || !STUFEN_OHNE.test("vorbau:baum_eiche") || STUFEN_OHNE.test("fimp:atlas:L2") || STUFEN_OHNE.test("bewohner-satz")) v.push("S: die Liste ohne Stufe trennt Leben und Stufen nicht"); // prettier-ignore
    }
    // S: der Baum ohne Stufe (w28-nadel-bestand) — die Mess-Wiese im Fenster 1080 an main: der Laub-Rand der Welt hielt bei 129,6 m, der
    // Same reicht bis 216 m (Ring 4); die Mutante liest den Samen am Rand der Welt (die Linse sähe den Täter nicht), die zweite schweigt
    // zum gesäten Baum ohne Instanz
    {
        const c = (k, d, gesaet, baeume = 20) => ({ k, d, gesaet, baeume });
        const wahr = { R: 216, ring: 4, laubRand: 216, dachAb: 184, zeilen: 1080, wald: 400, dach: 12, ohne: [], chunks: [c("-6,-24", 40, true), c("-9,-27", 132, true), c("-4,-25", 153, true, null), c("-12,-30", 240, false)] }; // prettier-ignore
        const taeter = { ...wahr, laubRand: 129.6, chunks: [c("-6,-24", 40, true), c("-9,-27", 132, false), c("-4,-25", 153, false, null), c("-12,-30", 240, false)] }; // prettier-ignore
        const U = (z, f = baumStufeUrteil) => f(z).rot.join(" | ");
        if (U(wahr)) v.push(`S: der gesäte Same fällt: ${U(wahr)}`);
        klasse("S Baum ohne Stufe", (f) => !/^BAUM OHNE STUFE: 2 Chunks des Samens im Blick \(Mitte ≤ 216\.0 m\) sind nicht gesät, der Laub-Rand der Welt steht bei 129\.6 m — 20 Bäume des Plans ohne Stufe \(\+ 1 Chunks ohne Plan im Gedächtnis\): -9,-27 132 m 20 Bäume · -4,-25 153 m$/.test(U(taeter, f)) && (U(taeter, f) || "kein ROT"), baumStufeUrteil, mutante(baumStufeUrteil, "c.d <= z.R && !c.gesaet", "c.d <= z.laubRand && !c.gesaet", {})); // prettier-ignore
        const leer = { ...wahr, ohne: [{ typ: "baum_fichte", d: 150 }] };
        klasse("S gesäter Baum ohne Instanz", (f) => !/^BAUM OHNE STUFE: 1 gesäte Bäume des Walds im Blick tragen weder Instanz noch Mesh noch Dach \(das Dach ab 184\.0 m\): baum_fichte 150 m$/.test(U(leer, f)) && (U(leer, f) || "kein ROT"), baumStufeUrteil, mutante(baumStufeUrteil, "if (z.ohne.length)", "if (false)", {})); // prettier-ignore
    }
    // S: der Baum vor dem Ort (w28-ort-vor-wald) — GTX 1050, Sprung an die Mess-Wiese am Kopf 3d180ada: 264 Bäume fielen im Saum ihres
    // Orts nach dem Sprung, dazu 14 auf Wegen, 5 unter Häusern; die Mutante stellt den Saum zu den offenen Flächen (sie sähe den Täter nie)
    {
        const F = (z, f = baumFallUrteil) => f(z).rot.join(" | ");
        const flaeche = [{ d: 95, typ: "baum_fichte", grund: "wege" }, { d: 195, typ: "baum_birke", grund: "grundriss" }]; // prettier-ignore
        const ruhig = { laubRand: 216, faelle: 543, takte: 900, ms: 21000, nach: flaeche };
        const taeter = { ...ruhig, nach: [...flaeche, { d: 150, typ: "baum_fichte", grund: "saum" }, { d: 96, typ: "baum_kiefer", grund: "saum" }] }; // prettier-ignore
        if (F(ruhig)) v.push(`S: die offenen Flächen des Erwachens fallen ROT: ${F(ruhig)}`);
        if (!/Saum 0, sonst 0 · offen \(die Fläche legt das Erwachen\): Wege 1, Grundriss 1 · die Orte lagen nach 900 Takten/.test(baumFallUrteil(ruhig).zeile)) v.push(`S: die Zeile des Baums vor dem Ort nennt die Flächen nicht: ${baumFallUrteil(ruhig).zeile}`); // prettier-ignore
        if (!/^BAUM VOR DEM ORT: 1 Bäume .*: baum_eiche 40 m \(sonst\)$/.test(F({ ...ruhig, nach: [{ d: 40, typ: "baum_eiche", grund: "sonst" }] }))) v.push("S: ein Fall ohne Marke geht still durch"); // prettier-ignore
        klasse("S Baum vor dem Ort", (f) => !/^BAUM VOR DEM ORT: 2 Bäume des Walds fielen nach dem Sprung im Laub-Rand \(≤ 216 m\) — sie standen vor dem Grund ihres Orts: baum_kiefer 96 m \(saum\) · baum_fichte 150 m \(saum\)$/.test(F(taeter, f)) && (F(taeter, f) || "kein ROT"), baumFallUrteil, mutante(baumFallUrteil, 'e.grund !== "wege" && e.grund !== "grundriss"', 'e.grund === "sonst"', {})); // prettier-ignore
    }
    // R: die Ratsche des Orts
    const rot = [{ schluessel: "leib", grund: "Sicht verdeckt 4.9 %" }];
    const R = ortUrteil(rot, { leib: "main 5 %" }, "stadt");
    if (R.u !== "BEKANNT" || !/^ABNAHME BEKANNT · ROT wie an main \(bekannt\): stadt\.leib/.test(R.kopf)) v.push(`R: das bekannte Leib-ROT reißt: ${R.kopf}`);
    if (ortUrteil(rot, {}, "stadt").u !== "ROT") v.push("R: ein neues ROT hält");
    if (!/stadt\.leib hält jetzt/.test(ortUrteil([], { leib: "x" }, "stadt").kopf)) v.push("R: der geheilte Eintrag schweigt");
    const sk = (l) => rotSchluessel({ feld: "sicht.deckung" }, { sicht: { deckung: 0.05, leib: { deckung: l } } });
    if (sk(0.04) !== "leib" || sk(0.01) !== "sicht.deckung") v.push("R: der Schlüssel trennt Leib und Laub nicht");
    return v;
}

module.exports = {
    bildLinsenSelbsttest,
    baumStufeUrteil,
    baumFallUrteil,
    stufenUrteil,
    stufenAbweichung,
    inhaltFamilie,
    inhaltUrteil,
    rotSchluessel,
    ortUrteil,
    wetterUrteil,
    wetterSelbsttest,
    himmelUrteil,
    hm,
    himmelSelbsttest,
    weltaktUrteil,
    weltaktSelbsttest,
    buehneSelbsttest,
    AUSGABE_INSTALL:
        KAMERA_NAH_INSTALL +
        ABNAHME_INSTALL +
        `window.__abnahmeMessen = ${abnahmeMessen}; window.__zielGestalt = ${zielGestalt}; window.__gestaltLeben = ${gestaltLeben}; window.__leinwandRot = ${leinwandRot};` +
        `window.__leiberNah = ${leiberNah}; window.__leiberMessen = ${leiberMessen};` +
        `window.__schirmRot = ${schirmRot}; window.__stufenZensus = ${stufenZensus}; window.__stufenOhne = ${STUFEN_OHNE};` +
        `window.__baumStufeZensus = ${baumStufeZensus}; window.__baumFallHaken = ${baumFallHaken}; window.__baumFallWarten = ${baumFallWarten};` +
        `window.__blickWahl = ${blickWahl}; window.__nahFolgt = ${nahFolgt};` +
        // DIE TIEFE DES BILDS an der Kamera (EIN Bild nach dem Neubeginn, `opt.tiefe` der Aufnahme): die Blick-Wahl und der Arm
        `window.__zielMessen = ${zielMessen};` +
        `(${seitenfehlerZaehlen})();` +
        `window.__erstRuhe = ${erstRuhe};` +
        `window.__ausgabeAufnahme = ${ausgabeAufnahme};` +
        `window.__spielStapel = ${spielStapel};` +
        `window.__weltaktSpion = ${weltaktSpion};` +
        `window.__weltaktBuch = ${weltaktBuch};` +
        `window.__wetterSpion = ${wetterSpion};` +
        `window.__wetterBuch = ${wetterBuch};` +
        `window.__wetterSetzen = ${wetterSetzen};` +
        `window.__wetterHalten = ${wetterHalten};` +
        `window.__uhrSpion = ${uhrSpion};` +
        `window.__bildUhren = ${bildUhren};` +
        `window.__uhrHalten = ${uhrHalten};` +
        require("./welt-boot.cjs").WARTEN_SEITE +
        `window.__weltStehtWarten = ${weltStehtWarten};` +
        `window.__buehne = ${buehne};` +
        `window.__halten = ${halten}; window.__halteQuellen = "spiegel zitter uhr tiere bewohner wagen leib".split(" ");` +
        `window.__membranOhneFilm = ${membranOhneFilm};` +
        `(${saisonFest})();`,
};
