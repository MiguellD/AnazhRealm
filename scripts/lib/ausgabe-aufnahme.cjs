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
const { KAMERA_NAH_INSTALL } = require("./kamera-nah.cjs");
const { ABNAHME_INSTALL } = require("./abnahme-urteil.cjs");

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
    if (r?.state) r.state.autoSeason = false;
    else setTimeout(saisonFest, 50);
}

// DIE WETTER-WACHE der Bühne (die EINE Stelle, die das Wetter einer Messung hält): der Halt (`weatherEffectTime`) steht
// eingefroren unter 0 — ein schon eingefrorener Wert bleibt, wie er ist. Die Bühne ruft sie, und jede Schleife, die Takte am
// Stück fährt (`werkbank lauf`, die Schirm-Wand), ruft sie je Takt. Solange er unter 0 steht, verweigert der EINE
// Wetter-Schreiber des Spiels (`_setWeather`) jeden Zug — Emotions-Effekt, Nexus, Gesetz, Mitspieler — und der Auto-Zug
// verbraucht seinen Takt der Welt-Uhr ohne Wort; im Spiel steht der Halt auf 0.
function wetterHalten() {
    window.__wetterSpion();
    const u = st.weatherEffectTime;
    if (!(Number.isFinite(u) && u < 0)) st.weatherEffectTime = -1e9;
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
// lässt die Welt das Wetter nie direkt schreiben — sie wünscht nur das nächste Wort des Zugs. `zug`: der Übergang des Spiels
// bleibt (der Wetter-Zug der Licht-Linse).
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
    if (!zug) st.weatherTransition = null;
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
    if (!Object.prototype.hasOwnProperty.call(r, "_uhrSetzen"))
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
    const liste = r.constructor.DSL_WELTAKTE;
    S.blind = !Array.isArray(liste);
    const halt = () => {
        const u = r.state.weatherEffectTime;
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
    const u = r.state.weatherEffectTime;
    return {
        seq: S.seq,
        gehalten: Number.isFinite(u) && u < 0,
        blind: S.blind,
        buch: S.buch.filter((e) => e.seq > (seit || 0)),
    };
}

// DIE LESER DER BILD-UHR `_bildZeit` (A9), [Name, Halter, Schlüssel] — die Uhr-Wache prüft, dass jeder mit ihr steht.
function bildUhren() {
    const wu = st.windUniforms || {};
    const v2 = wu.uWindDir && wu.uWindDir.value;
    const u = [
        ["himmel", st.skyboxUniforms && st.skyboxUniforms.time, "value"],
        ["wasser", st.hydroSurfaceUniforms && st.hydroSurfaceUniforms.time, "value"],
        ["wind", wu.uWindTime, "value"],
        ["wind-x", v2, "x"],
        ["wind-z", v2, "y"],
        ["böe", r, "_weatherWob"],
        ["fell", st.renderer && st.renderer._nodes && st.renderer._nodes.nodeFrame, "time"],
        ["regen", r._rainSystem && r._rainSystem.uZeit, "value"],
    ];
    for (const [n, m] of r._portalMembranes || [])
        if (m.u) u.push([`tor ${n}`, m.u.time, "value"], [`puls ${n}`, m.u.pulse, "value"], [`glut ${n}`, m, "puls"]);
    return u.filter((x) => x[1]);
}

// DIE UHR DER BÜHNE (A9): die Bühne hält NUR die EINE Bild-Uhr `_bildZeit` auf T = 12,5 s und zählt jeden Zug des Loops, den
// sie verweigert (die Uhr-Wache liest ihn); das Tor, das im Takt schreibt, liest sie einmal beim Halt.
function uhrHalten() {
    const S = window.__buehneUhr || (window.__buehneUhr = { T: 12.5, verweigert: 0 });
    const d = Object.getOwnPropertyDescriptor(r, "_bildZeit");
    if (d?.get?.__buehne) return;
    const get = Object.assign(() => S.T, { __buehne: true });
    Object.defineProperty(r, "_bildZeit", { configurable: true, enumerable: true, get, set: () => void S.verweigert++ });
    r._tickPortalMembranes(performance.now() / 1000);
}

// DIE WELT STEHT (A9, `_weltSteht`): vor jedem Schuss wartet die Bühne auf sie über das EINE Einschwingen (welt-boot
// `__weltStehtNach`, der Takt der Seite) und stellt nach jedem Takt Kamera und Stunde zurück; der Deckel `max` zählt
// nur Takte ohne Offenes (`_weltOffen`) — den Bau bricht seine Frist. Sonst bricht der Schuss LAUT beim Täter.
async function weltStehtWarten(max) {
    const cam = st.camera;
    const [p, q, fov, uhr] = [cam.position.clone(), cam.quaternion.clone(), cam.fov, st.timeOfDay];
    const takt = async () => {
        await window.__seitenTakt();
        cam.position.copy(p);
        cam.quaternion.copy(q);
        if (cam.fov !== fov) (cam.fov = fov), cam.updateProjectionMatrix();
        cam.updateMatrixWorld(true);
    };
    // steht sie schon, schießt die Bühne ohne Takt (ein Takt rendert und tickt, was die Linse für den Schuss gesetzt hat)
    const n = r._weltSteht() ? 0 : await window.__weltStehtNach(takt, max);
    if (st.timeOfDay !== uhr) st.timeOfDay = st.world ? (st.world.timeOfDay = uhr) : uhr;
    // DER HIMMEL DES SCHUSSES (A9-n2): die Umgebung frisch aus der Stunde, die jetzt gilt (die Drift-Schwelle hielt sonst die
    // Malung des Boots: Belichtung Erst-Boot 0,9935, Zweit-Boot 0,9904), das Gemüt ruhig wie in der Bühne
    for (const k in (st.player && st.player.emotions) || {}) st.player.emotions[k] = 0;
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
    const w = o?.wetter || "sunny";
    window.__weltaktSpion();
    st.autoSeason = false;
    const s = r.setSeason(o?.saison || "sommer");
    if (st.world) st.world.timeOfDay = 0.5;
    st.timeOfDay = 0.5;
    // Wetter und Saison: das Wort des Spielers (`o`, werkbank `bild --wetter --saison`), sonst Sonne und Sommer — über den
    // EINEN Schreiber, dann eingefroren (`__wetterSetzen`), der Regen zur Bild-Uhr; ein falsches Wort bricht laut
    if (!s || window.__wetterSetzen(w) !== w) throw new Error(`DIE BÜHNE: das Wort gilt nicht ${JSON.stringify(o)}`);
    window.__uhrHalten();
    // die Nässe der Bühne: `o.naesse` Sekunden des Worts (die Linse `werkbank licht --naesse`), sonst sein Ruhezustand
    r._naesseTakt(o?.naesse ?? 1e6);
    r._tickRain();
    // Das Gemüt des Spielers färbt das Licht (`_emotionModulate`): die Bühne hält es ruhig (A9-n2, Licht-Bilanz 5,156 ↔ 5,169)
    for (const k in (st.player && st.player.emotions) || {}) st.player.emotions[k] = 0;
    // Die Bühne SPRINGT Uhr, Wetter und Saison: der Sprung des Himmels (`_himmelSprung`, das Gesetz des Uhr-Schreibers) malt
    // die Himmels-Umgebung beim Anwenden des Tags aus den Quellen, die jetzt gelten — an der Raten-Drossel vorbei, nie an der
    // Drift-Schwelle; ohne Drift malt der Sprung nichts (das Einschwingen von `werkbank band` ruft die Bühne je Takt).
    r._himmelSprung = true;
    r._applyDayNightToScene();
    // … und die Saison im Takt des Jahrs (`_tickSeason`): Tönung und Schneegrenze (stoffe.K3-2) — bis dahin zeigte `--saison
    // winter` den Boden des Sommers, bis der Loop sie zufällig tickte
    r._tickSeason(0);
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
// Land, ein zweiter Ruf stellt keines dazu, eine Welt ohne Platz bricht laut.
function buehneSelbsttest() {
    const v = [], tiere = [], w0 = global.window;
    const r = {
        state: { creatures: tiere, maxCreatures: 10, playerMesh: { position: { x: 5, z: 7 } } },
        setSeason: () => true,
        _naesseTakt() {},
        _tickRain() {},
        _tickSeason() {},
        _applyDayNightToScene() {},
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
        const mat = rec.mesh && rec.mesh.material;
        if (!mat) continue;
        n++;
        const G =
            rec.tor && rec.tor.gesetz ? r._membranGraph(rec.tor.gesetz) : null;
        if (G?.ohneFilm) {
            if (an) {
                rec.__farbeVorFilm = mat.colorNode;
                mat.colorNode = G.ohneFilm;
            } else if (Object.prototype.hasOwnProperty.call(rec, "__farbeVorFilm")) {
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

// DIE TIERE HALTEN STILL: zwischen Blick-Wahl und Schuss liegen hunderte Takte, in denen Tiere wandern
// (ein Tier liefe in die Kamera). Nach jedem Kreatur-Tick fallen x/z auf den Stand davor zurück; Animation, Haut, Boden-Höhe
// und LOD laufen weiter; die Vögel fliegen (sie folgen der Welt-Uhr, die Klang-Linse hört ihren Flug). Die Marke trägt die Hülle,
// nie der Prototyp: er trägt nie Stand (`_weltAbschied` bricht beim Namen) — bis 30.10. lag `__tiereGehalten` auf ihm, und jeder
// Tausch am Ort nach einem gehaltenen Lauf (`werkbank` vom Messort wiese zum Messort buehne) brach an dieser Marke.
function tiereHalten() {
    const P = Object.getPrototypeOf(r);
    if (P.updateCreatures.__gehalten) return;
    const org = P.updateCreatures;
    P.updateCreatures = Object.assign(
        function (delta) {
            const fest = (this.state.creatures || []).map((c) => [c, c.position.x, c.position.z]);
            const o = org.call(this, delta);
            for (const [c, x, z] of fest) {
                c.position.x = x;
                c.position.z = z;
            }
            return o;
        },
        { __gehalten: true }
    );
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
        const offenZaehlt = !(opt && opt.nurGezeichnete);
        const tE = performance.now();
        let tFort = tE,
            stand = "";
        // der Grund einer Absage: die letzten Meldungen des Übersetzers und der Pipeline in der GPU-Wache (`_gpuWacheMeldung`)
        const grund = () => {
            const m = ((r._gpuWache || {}).meldungen || []).filter(
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
            (E.namen && E.namen.get(p)) ||
            `${(p.vertexProgram && p.vertexProgram.name) || "(ohne Stoff-Namen)"} [${p.cacheKey}]`;
        for (;;) {
            const b0 = E.bauN,
                v0 = E.verschoben,
                w0 = E.wartetN;
            frame();
            // DER GEGENDRUCK DER GPU: der nächste Frame kommt erst, wenn das Gerät diesen abgegeben hat. Eine Pause
            // von 0 ms schob Frames schneller in den GPU-Prozess, als swiftshader sie rastert — die Rückmeldung jedes
            // asynchronen Pipeline-Baus wartete hinter dem Rückstau (Erst-Zeichnungs-Wand: Rückstau bis 63 s, ein unbeleuchteter
            // Würfel 46 s; mit Gegendruck Rückstau ≤ 3,8 s, die Probe 68 → 4 s)
            const dev =
                r.state.renderer &&
                r.state.renderer.backend &&
                r.state.renderer.backend.device;
            if (dev && dev.queue && typeof dev.queue.onSubmittedWorkDone === "function")
                await dev.queue.onSubmittedWorkDone();
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
            const frist = opt && opt.erstFristMs > 0 ? opt.erstFristMs : 120000;
            if (jetzt - tFort > frist || jetzt - tE > 5 * frist) {
                const namen = [];
                for (const p of E.offen.keys()) namen.push(name(p));
                const wartet =
                    E.wartetN !== w0 && E.wartetAuf
                        ? `; ein Draw wartet auf ${name(E.wartetAuf)}${E.abgesagt && E.abgesagt.has(E.wartetAuf) ? ` (ABGESAGT)${grund()}` : ""}`
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
function abnahmeMessen(opt) {
    const T = window.THREE;
    const cam = st.camera;
    const o = opt || {};
    cam.updateMatrixWorld(true);
    const z = o.ziel || null;
    const ohne = [];
    if (z) {
        if (Array.isArray(z.ohne)) ohne.push(...z.ohne);
        const rz = z.r != null ? z.r : 1.5;
        for (const e of st.architectures || [])
            if (e?.position && Math.hypot(e.position.x - z.x, e.position.z - z.z) <= rz) ohne.push(e.id);
    }
    const E = cam.position;
    // ein Ziel in Armlänge (material.K2, `bild --arm`) ist selbst die nahe Fläche: verdeckt ist, was näher als die halbe Armlänge liegt
    const RADIUS = z ? Math.min(2, 0.5 * Math.hypot(z.x - E.x, z.y - E.y, z.z - E.z)) : 2;
    // DER FUSS DES ZIELS (hinter einer Kuppe zeigt ein Baum nur die Krone, der Strahl zum Ziel-Punkt ist frei): steht das Ziel 0,6–40 m über seinem Boden, muss auch sein Fuß (Boden + 0,3 m) frei
    // sein; `ziel.fussY` nennt ihn selbst, `ziel.fuss === false` fragt ihn nicht (ein Ziel in einer Felswand). Dazu jeder
    // genannte Punkt des Ziels (`ziel.punkte`, [x, y, z]: die Glieder einer Herde) — die Prüfung fragt jeden.
    const punkte = (q) => {
        const g = r._voxelSurfaceY(q.x, q.z);
        const y = Number.isFinite(q.fussY) ? q.fussY : Number.isFinite(g) && q.y - g > 0.6 && q.y - g <= 40 ? g + 0.3 : NaN;
        return (q.fuss === false || !Number.isFinite(y) ? [] : [[q.x, y, q.z]]).concat(q.punkte || []);
    };
    // Der Satz „messung" (Takt- und Luma-Frames) misst keine Sicht: die Strahlen kosteten jeden Mess-Frame Zeit, die er nicht prüft.
    const nd =
        o.satz === "messung"
            ? { deckung: null, taeter: null, ziel: null }
            : window.__nahDeckung({
                  radien: { Laub: RADIUS, Rinde: RADIUS, Fels: RADIUS, Gelände: RADIUS, Bau: RADIUS / 2 },
                  ueber: { Gelände: E.y - 1 },
                  gw: 48,
                  gh: 27,
                  ort: { id: "abnahme", x: E.x, z: E.z, r: RADIUS + 2 },
                  neu: true,
                  ohne,
                  ziel: z ? { ...z, punkte: punkte(z) } : null,
              });
    // DER VORDERGRUND: mit benanntem Ziel zählt jede Täter-Fläche (Laub · Rinde · Fels · Bau · Böschung) näher als der halbe Ziel-Abstand
    // (2–8 m) — das Bild zeigt sein Ziel, nicht, was davor steht.
    let vorn = null;
    if (z && nd.ziel) {
        const V = Math.max(RADIUS, Math.min(8, nd.ziel.abstand / 2));
        const v = window.__nahDeckung({
            radien: { Laub: V, Rinde: V, Fels: V, Bau: V, Gelände: V },
            ueber: { Gelände: E.y - 1 },
            gw: 32,
            gh: 18,
            ort: { id: "abnahme-vorn", x: E.x, z: E.z, r: V + 2 },
            neu: true,
            ohne,
        });
        vorn = { radius: +V.toFixed(2), deckung: v.deckung, taeter: v.taeter };
    }
    const rend = st.renderer;
    const be = rend && rend.backend;
    const db =
        rend && typeof rend.getDrawingBufferSize === "function" ? rend.getDrawingBufferSize(new T.Vector2()) : null;
    const dir = cam.getWorldDirection(new T.Vector3());
    return {
        satz: o.satz || "beweis",
        stand: { version: r.constructor.VERSION || null, sha: o.sha || null },
        buehne: {
            saison: st.season || null,
            wetter: st.weather || null,
            uhr: Number.isFinite(st.timeOfDay) ? +st.timeOfDay.toFixed(3) : null,
            bildUhr: window.__buehneUhr ? window.__buehneUhr.T : null, // die Bild-Uhr (A9), ohne Bühne frei
            tiereGehalten: !!Object.getPrototypeOf(r).updateCreatures.__gehalten,
        },
        geraet: {
            backend: !be ? null : be.isWebGPUBackend ? "WebGPU" : be.isWebGLBackend ? "WebGL" : null,
            adapter: (() => {
                const i = (be && be.device && be.device.adapterInfo) || (be && be.adapter && be.adapter.info) || null;
                return i ? [i.vendor, i.architecture, i.device, i.description].filter(Boolean).join(" ") : null;
            })(),
            leinwand: db ? [Math.round(db.x), Math.round(db.y)] : null,
        },
        sicht: { radius: RADIUS, deckung: nd.deckung, taeter: nd.taeter, vordergrund: vorn },
        // DIE GESTALT DES ZIELS: jedes Werk am Ziel (`ohne`) muss gezeichnet sein (`_archIsRendered`) — sonst ist das Ziel nicht im Bild
        ziel: nd.ziel
            ? Object.assign(nd.ziel, {
                  gestalt: ohne.map((id) => {
                      const e = (st.architectures || []).find((q) => q && q.id === id);
                      return e ? `${e.type} ${id}${r._archIsRendered(e) ? "" : " UNGEZEICHNET"}` : `${id} fehlt`;
                  }),
                  gezeichnet: ohne.every((id) => {
                      const e = (st.architectures || []).find((q) => q && q.id === id);
                      return !!e && r._archIsRendered(e);
                  }),
              })
            : null,
        pose: {
            kamera: [E.x, E.y, E.z].map((v) => +v.toFixed(3)),
            blick: [dir.x, dir.y, dir.z].map((v) => +v.toFixed(5)),
        },
        seitenfehler: window.__seitenfehler || 0,
    };
}

// DIE BLICK-WAHL (K32; Lehre 17 „die Blick-Wahl sucht freie Sicht"): vor dem Schuss sucht die Aufnahme bis zu `opt.wahl` Posen
// um den Ort — der Abstand zum Ziel und die Augenhöhe über dem Boden bleiben, der Azimut dreht 0, ±15° … ±90°, ±135°, 180°,
// je Runde von 14 Posen ein Meter höher und 20 % näher —, je Pose die Abnahme des Blicks nach den EINEN Schwellen (ohne die Bild-Zeilen:
// Pixel gibt es erst nach dem Schuss). Die erste freie Pose steht; findet keine, bleibt die Kamera, wo sie war, und die
// Abnahme nach dem Schuss wirft beim Namen.
function blickWahl(opt) {
    const cam = r.state.camera;
    const z = opt.ziel;
    const n = Math.max(1, Math.floor(opt.wahl));
    const P0 = cam.position.clone();
    const Q0 = cam.quaternion.clone();
    const boden = (x, zz) => r._voxelSurfaceY(x, zz);
    const h0 = Math.max(0.35, P0.y - boden(P0.x, P0.z));
    const d0 = Math.max(0.5, Math.hypot(P0.x - z.x, P0.z - z.z));
    const a0 = Math.atan2(P0.z - z.z, P0.x - z.x);
    const winkel = [0, 15, -15, 30, -30, 45, -45, 60, -60, 90, -90, 135, -135, 180];
    const posen = [];
    let beste = null;
    for (let k = 0; k < n; k++) {
        const ring = Math.floor(k / winkel.length);
        const a = a0 + (winkel[k % winkel.length] * Math.PI) / 180;
        const d = d0 * Math.pow(0.8, ring);
        const x = z.x + Math.cos(a) * d,
            zz = z.z + Math.sin(a) * d;
        const g = boden(x, zz);
        if (!Number.isFinite(g)) continue;
        cam.position.set(x, g + h0 + ring, zz);
        cam.lookAt(z.x, z.y, z.z + 1e-4);
        cam.updateMatrixWorld(true);
        const m = window.__abnahmeMessen(opt);
        const u = window.__abnahmeUrteil(m);
        const rest = u.rot.filter((q) => !q.feld.startsWith("bild."));
        posen.push({ k, kamera: m.pose.kamera, rot: rest.map((q) => q.grund) });
        if (!rest.length) return { versucht: k + 1, gewaehlt: k, kamera: m.pose.kamera, posen };
        if (!beste || rest.length < beste.n) beste = { n: rest.length, k };
    }
    cam.position.copy(P0);
    cam.quaternion.copy(Q0);
    cam.updateMatrixWorld(true);
    return { versucht: posen.length, gewaehlt: null, beste: beste && beste.k, posen };
}

// DAS GANZE BILD (echte GPU): ein Ausgabe-Ziel kleiner als der Canvas lieferte die linke obere Ecke
// des Frames in Originalgröße, nie das verkleinerte Bild — 1280×720 aus 1920×1080 waren ein 2/3-Ausschnitt,
// 640×360 ein Drittel (gemessen: dieselbe Kamera, 640 = die linke obere 640×360-Ecke des 1920er Bildes). Die
// Aufnahme rendert darum IMMER in Canvas-Größe (was der Spieler sieht) und mittelt danach auf W×H herunter.
function ausgabeAufnahme(W, H, warm, opt) {
    return (async () => {
        const T = window.THREE;
        const rend = r.state.renderer;
        const db = rend.getDrawingBufferSize(new T.Vector2());
        const BW = Math.max(1, Math.round(db.x));
        const BH = Math.max(1, Math.round(db.y));
        const rt = new T.RenderTarget(BW, BH, { depthBuffer: true, samples: 0 });
        const prevOut = typeof rend.getOutputRenderTarget === "function" ? rend.getOutputRenderTarget() : null;
        // DAS ZIEL DES RENDERERS mit zurück: im Direktpfad (ohne Post-Kette)
        // stellt r184 am Ende von `_renderScene` das aktuelle Ziel auf `_renderTarget || _outputRenderTarget` — nach einer
        // Aufnahme stand das Aufnahme-Ziel als aktuelles Ziel, jeder folgende Frame schrieb in das entsorgte Ziel und jede
        // weitere Aufnahme las ein nie beschriebenes (`copyTextureToBuffer: format of undefined`).
        const prevZiel = rend.getRenderTarget();
        // DIE WELT STEHT (A9): unter der Bühne wartet jeder Beweis-Schuss auf sie (Mess-Frames eines Satzes schießen in derselben)
        const weltTakte =
            window.__buehneUhr && !(opt && opt.satz === "messung") ? await window.__weltStehtWarten() : null;
        // DIE BLICK-WAHL vor dem Schuss: nur mit benanntem Ziel und `opt.wahl` Posen
        const wahl = opt && opt.ziel && opt.wahl > 0 ? window.__blickWahl(opt) : null;
        // DIE ABNAHME (K32, scripts/lib/abnahme-urteil.cjs): jedes Bild prüft sich selbst — Sicht frei, Ziel im Bild und frei,
        // Belichtung im Band, Stand · Bühne · Gerät vermerkt. Ein Bild, das sie nicht hält, wirft beim Namen: der Aufrufer
        // speichert nie still. Der Satz „messung" (`opt.satz`) prüft nur Stand, Bühne und Gerät (Mess-Frames, kein Beweisbild).
        const abnahme = (u8, W2, H2) => {
            const m = window.__abnahmeMessen(opt);
            m.buehne.weltTakte = weltTakte; // so viele Takte wartete der Schuss, bis die Welt stand (A9)
            m.bild = window.__bildMasse(u8, W2, H2);
            if (wahl) m.wahl = wahl;
            const u = window.__abnahmeUrteil(m);
            m.ok = u.ok;
            m.zeile = u.zeile;
            if (!u.ok) {
                const fehler = new Error(
                    `${u.zeile}${wahl && wahl.gewaehlt == null ? ` — die Blick-Wahl fand in ${wahl.versucht} Posen keine freie` : ""} — die Aufnahme speichert nichts`
                );
                fehler.abnahme = m;
                throw fehler;
            }
            return m;
        };
        rend.setOutputRenderTarget(rt);
        try {
            // Warm-Frames: der erste Frame nach dem Kamera-Umsetzen trägt die Feld-Formen noch nicht
            // (Listen-/Seiten-Upload + Pipelines).
            // Der Szenen-Pass der Post-Pipeline (PassNode) rendert nur einmal je NODE-FRAME; den schaltet
            // im Vendor die Animations-Schleife weiter. Bei ruhendem Loop schaltet die Aufnahme ihn selbst —
            // sonst überspringt der gezählte Frame die Szene (gemessen: dc=1, Dreiecke=1, nur das Quad).
            // Der Frame zeichnet zur Bild-Uhr (A9; unter der Bühne steht sie).
            const frame = () => {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                r._loopRender();
            };
            // Die NAH-SÄTZE folgen der Kamera (Wiese und Streu, die Kachel-Ringe im scatterDeco-Takt). Bei ruhendem
            // Loop standen die Ringe noch um die VORIGE Kamera — die Aufnahme schwingt sie für diese ein (Kachel um
            // Kachel, bis keine mehr fehlt; A9-n2: die Streu trug die Armlänge des vorigen Schusses).
            for (const t of ["_tickNahWiese", "_tickNahStreu"]) for (let i = 0; i < 200 && r[t]() > 0; i++);
            // DIE ERST-ZEICHNUNG (`_configureRenderer`): was in diesem Blick zum ersten Mal zeichnet, baut je
            // Render-Aufruf einen Stoff und lässt seine Pipeline asynchron entstehen — in den 32 Frames am Stück unten
            // erfüllt sich kein Versprechen. Die Aufnahme zeigt, was der Spieler nach dem Ankommen sieht: sie schaltet Frames mit einer Pause
            // für den GPU-Prozess, bis ein Frame nichts mehr baut oder verschiebt und keine Pipeline offen ist. Steht die
            // Erst-Zeichnung 120 s ohne Fortschritt (kein Bau, keine Pipeline wird bereit; `opt.erstFristMs`, die Wand prüft mit
            // einer kurzen Frist) oder fünfmal so lange insgesamt, bricht die Aufnahme LAUT ab und nennt jede offene
            // Pipeline beim Namen — ein Bild mit einem unsichtbaren Bürger ist kein Beweis.
            const erst = await window.__erstRuhe(frame, opt, "die Aufnahme");
            // DIE ZEITLICHE AUFLÖSUNG (TRAA) zeigt ein ruhendes Bild erst nach ihrer Geschichte: die Halton-Folge
            // läuft 31 Versätze, die Dither-Blende rotiert je Frame — die Aufnahme zeigt, was der Spieler nach einer
            // halben Sekunde Stillstand sieht (32 Frames), nie den ersten, ungemittelten Frame nach dem Kamera-Sprung.
            // Nach dem Sprung läuft die Geschichte als MITTEL an (K68, `_zeitAufloesung` `_anlauf`): jeder der 32 Frames
            // wiegt gleich, die Dither-Blende steht als Mischton im Bild, nie als Schachbrett des ersten Frames. JEDER Schuss
            // beginnt Folge, Geschichte und Dither-Phase von vorn (A8-n1; bis dahin nur mit `opt.fest`, K63-n1): die Geschichte
            // hält je Frame 95 % (TRAANode), die Frames vor dem Schuss tragen nichts hinein — zwei Schüsse derselben Szene
            // sind dasselbe Bild.
            {
                const tn = r.state.traaNode;
                if (tn) {
                    tn._jitterIndex = 0;
                    // die Geschichte neu: ein Größen-Wechsel lässt den Vendor sie aus dem ersten Bild kopieren (TRAANode
                    // `needsRestart`)
                    if (tn._historyRenderTarget) tn._historyRenderTarget.setSize(1, 1);
                }
                if (r.state._traaR) r.state._traaR.neu = true;
                const lu = r.state.lodUniforms;
                if (lu && lu.uDitherT) lu.uDitherT.value = 0;
                // der Versatz des Laubs beginnt mit der Geschichte (A3b, `_zeitAufloesung`); die Schatten-Karten: der Takt rendert
                // eine Kaskade nur, wenn sie fällig ist — die Karte des ersten Frames sah die Szene vor der Erst-Zeichnung (A8-n1)
                r._schattenAlleNeu();
            }
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
            // Mittel über Polster-Nullen. Hier fällt es.
            const roh = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const zeile = BW * 4;
            const schritt = roh.length > zeile * BH ? Math.ceil(zeile / 256) * 256 : zeile;
            let voll = roh;
            if (schritt !== zeile) {
                voll = new Uint8Array(zeile * BH);
                for (let y = 0; y < BH; y++) voll.set(roh.subarray(y * schritt, y * schritt + zeile), y * zeile);
            }
            if (BW === W && BH === H) return { u8: voll, info, ms, abnahme: abnahme(voll, W, H) };
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
            return { u8, info, ms, abnahme: abnahme(u8, W, H) };
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

// DAS URTEIL DER HIMMELS-WACHE (rein, Node: Uhr und Wetter gehören dem Spieler). `g` = ein getakteter
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
    buehneSelbsttest,
    AUSGABE_INSTALL:
        KAMERA_NAH_INSTALL +
        ABNAHME_INSTALL +
        `window.__abnahmeMessen = ${abnahmeMessen.toString()};` +
        `window.__blickWahl = ${blickWahl.toString()};` +
        `(${seitenfehlerZaehlen.toString()})();` +
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
        `window.__bildUhren = ${bildUhren.toString()};` +
        `window.__uhrHalten = ${uhrHalten.toString()};` +
        require("./welt-boot.cjs").WARTEN_SEITE +
        `window.__weltStehtWarten = ${weltStehtWarten.toString()};` +
        `window.__buehne = ${buehne.toString()};` +
        `window.__tiereHalten = ${tiereHalten.toString()};` +
        `window.__membranOhneFilm = ${membranOhneFilm.toString()};` +
        `(${saisonFest.toString()})();`,
};
