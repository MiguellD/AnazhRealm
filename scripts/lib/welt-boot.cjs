// welt-boot.cjs — DER EINE WELT-BOOT jeder Linse: Server, Browser und Fehler-Sammler leben EINMAL:
//   statikServer()   der Statik-Server der Welt (Wurzel des Repos, `/` → index.html, nie aus der Wurzel heraus)
//   starteBrowser()  der Browser über die EINE Adapter-Weiche (Rezepte: null · webgl · linse · echt, software-gpu.cjs)
//                    + der FEHLER-SAMMLER an jeder Seite: pageerror (auch unbehandelte Rejections), console.error, der Wurf
//                    im Takt, den die Fehler-Grenze des Loops fängt (`LOOP_WURF`), Absturz der Seite, Trennung des Browsers
//                    ohne Abbau — jeder Fehler macht den Lauf ROT mit Namen,
//                    nie Exit 0 (die Wache sitzt am Prozess-Ende: ein Exit 0 mit gesammeltem Fehler wird Exit 1);
//                    eine Linse trägt KEINEN eigenen pageerror-Sammler daneben (gate:welt-boot nennt jeden Zwilling beim Namen)
//   halteBis()       eine Taste halten, bis ihr Ereignis eintritt (nie nach der Wanduhr, gate:apparat Klinge 5)
//   buehne()         die Bühne (Mittag · Sonne · Sommer, scripts/lib/ausgabe-aufnahme.cjs)
//   uferStellen      (Seite) ein Leser der Szenen-Tiefe im Blick, der zeichnet: das Wasser am Bach der Mess-Wiese
//   DIE STALL-AKTE ein Hänger der Seite steht mit Täter im Log (unten); `--selbsttest` (gate:welt-boot) beweist es
// Die Wand: gate:altlasten DIE BOOT-WAND — ein Start außerhalb dieser Datei ist ROT, die Liste der noch eigenen Starts
// darf nur schrumpfen.
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const os = require("os");
const { linsenWebGpuArgs, linsenWebglArgs, echteWebGpuArgs, adapterZeile } = require("./software-gpu.cjs");
// DIE URTEILS-WACHE (Lehre 6, w28-probe-urteil): jede Linse dieses Boots — eine gedruckte ROTE Zeile (❌ · ⛔ · ROT) bei Exit 0 wird Exit 1
require("./urteil-zeile.cjs").wache();
// DAS MASS AM LANDE-TOR (w28-tor-bruch): eine Schwelle auf ZEIT oder AUSSEHEN meldet dort statt zu sperren; jeder Selbsttest unten
// (taeterFaelle, bruchFaelle) urteilt sie voll — die Mutante MUSS reißen
const { mass, alsSelbsttest } = require("./urteil-zeile.cjs");
const stammLib = require("./stamm.cjs");
const { ohneKommentare, ast, wandere, zeileVon } = stammLib;

// DER HAND-TAKT (`__handTakt()`, in jeder Seite): ein Bild des Loops von Hand, sein Wurf bricht die Reihe nicht — je Linse ein eigenes
// `try { r._gameLoopTick(performance.now()); } catch {}` war ein Zwilling (w4-arena-welt, 39 Stellen). Bis w28-loop-wurf lebte an
// DIESEM Chokepoint die Stille: ein Wurf an der Fehler-Grenze des Loops vorbei verschwand ganz. Jetzt geht er an die EINE Grenze
// (`_loopErrorBoundary`: gezählt, der EINE Melder) und ist im Sammler ROT beim Namen (`LOOP_WURF`).
function handTakt() {
    try {
        r._gameLoopTick(performance.now());
    } catch (e) {
        r._loopErrorBoundary(e);
    }
}
// DER EINE VERGLEICH und DIE EINE ADDITION (`xs.sort(aufsteigend)`, `xs.reduce(addiere, 0)`): in Node global, sobald welt-boot
// lädt (wie THREE mit studioKern), in jeder Seite derselbe Text — je Linse ein eigenes `(a, b) => a - b` und `(a, b) => a + b` war ein Zwilling (w4-arena-welt).
const aufsteigend = (globalThis.aufsteigend = (a, b) => a - b);
const addiere = (globalThis.addiere = (a, b) => a + b);
// … und DER EINE RANG (`rang(xs, 0.95)` das p95, `rang(xs)` der Median): das Element am Anteil q einer Reihe, am Rang ⌊q·n⌋, oben
// geklemmt — Node global, in jeder Seite derselbe Text. Je Linse ein eigenes `s[Math.min(s.length - 1, Math.floor(q * s.length))]`,
// ungeklemmt oder als Median `s[s.length >> 1]` war ein Zwilling (w21-laub-jahr-fern: 70 Stellen in 33 Dateien; die Rang-Wand)
const rang = (globalThis.rang = (s, q = 0.5) => s[Math.min(s.length - 1, Math.floor(q * s.length))]);
// DER EINE SCHLAF (`await sleep(ms)`): in Node der Export, in jeder Seite derselbe Text als `window.sleep` (`WARTEN_SEITE`) —
// eine Probe schläft in beiden Welten mit demselben Ruf, ein eigenes `new Promise((r) => setTimeout(r, ms))` ist ein Zwilling. In der
// Seite endet er am Abbruch (`seitenAbbruch`, w18-mensch-deckel): zählte die Epoche `__abbruchEpoche` hoch, während er
// schlief, wirft er beim Erwachen — die Arbeit eines toten Rufers endet an ihrem nächsten Schlaf (in Node zählt keine Epoche)
const sleep = (ms) => {
    const e = globalThis.__abbruchEpoche;
    return new Promise((r, f) => setTimeout(() => (globalThis.__abbruchEpoche === e ? r() : f(new Error("ABGEBROCHEN: der Rufer ist fort"))), ms)); // prettier-ignore
};
// DIE EINE LEIHE (`const zurueck = leihe(o, { name: wert, … })`, in jeder Seite als `window.leihe`, `WARTEN_SEITE`): tauscht
// Glieder eines Objekts (der Welt `r`, ihrer Klasse) und gibt beim Rückruf jedes zurück — ein eigenes, wie es war, ein geerbtes
// fällt (die Welt ruft wieder ihren Prototyp). Je Probe ein eigenes `hasOwnProperty`-Merken samt `delete` oder Zuweisen im
// finally war ein Zwilling.
// DER EINE FREMDE AUTOR (`const { pubHex, sign } = await __fremd()`, in jeder Seite, `WARTEN_SEITE`): ein frischer Ed25519-Schlüssel,
// sein öffentlicher Teil als Hex und `sign(text)` → die Signatur als Hex, wie der Vibe-Pass sie trägt — bis w26-ankunft-horizont
// erzeugte playtest/netz denselben Schlüssel samt Signatur viermal in eigenen Zeilen.
async function fremd() {
    const { privateKey: k } = await crypto.subtle.generateKey("Ed25519", true, ["sign"]);
    const hex = (b) => r._vibeBytesToHex(new Uint8Array(b));
    return {
        pubHex: hex(r._vibeB64uToBytes((await crypto.subtle.exportKey("jwk", k)).x)),
        sign: async (t) => hex(await crypto.subtle.sign("Ed25519", k, new TextEncoder().encode(t))),
    };
}
function leihe(o, tausch) {
    const alt = Object.keys(tausch).map((k) => [k, Object.getOwnPropertyDescriptor(o, k)]);
    Object.assign(o, tausch);
    return () => alt.forEach(([k, d]) => (d ? Object.defineProperty(o, k, d) : delete o[k]));
}
// DIE EINE WELT JEDER SEITE (`r`, `st`): jede Seite trägt `r` (window.anazhRealm) und `st` (ihr Zustand, den nur der Konstruktor
// setzt) als Getter (`WARTEN_SEITE`, vor jedem Skript) — eine Seiten-Funktion liest Welt und Zustand bei diesen Namen, ein eigenes
// `const r = window.anazhRealm` / `const st = r.state` ist ein Zwilling (872 Bindungen fielen in w3u-nachfolge); wer einen
// der Namen schreibt (ein fremdes Skript), bekommt eine gewöhnliche Variable; `halt` sind die gehaltenen Aktionen der EINEN
// Tasten-Tafel (`st.verbTafel.gehalten`: `halt.vor = true` hält das Vorwärts wie die Taste, die die Belegung trägt)
const weltR = `for (const [n, f] of [["r", () => window.anazhRealm], ["st", () => window.anazhRealm && window.anazhRealm.state], ["pm", () => st && st.playerMesh], ["halt", () => st && st.verbTafel.gehalten]]) Object.defineProperty(window, n, { get: f, set: (v) => Object.defineProperty(window, n, { value: v, writable: true }), configurable: true }); window.__handTakt = ${handTakt}; window.aufsteigend = ${aufsteigend}; window.addiere = ${addiere}; window.rang = ${rang};`;
// DIE EINE JSON-LESUNG (`jsonLesen(pfad)`): je Linse ein eigenes `JSON.parse(fs.readFileSync(pfad, "utf8"))` war ein Zwilling
// (w4-himmel-uhr: 57 Stellen in 26 Linsen); sie liest über den EINEN Datei-Leser `ausDatei` (`pfad` ab der Wurzel des Baums
// oder absolut) — bis w4-studios-heim3 trug er ein eigenes JSON-Flag, zwei Lesungen derselben Sache
// … und die EINE JSON-Schreibung (`jsonSchreiben(pfad, wert, einzug = 1, ende = "")`, dieselben Bytes wie `fs.writeFileSync(pfad,
// JSON.stringify(wert, null, einzug) + ende)`)
const jsonLesen = (p) => JSON.parse(ausDatei(p));
const jsonSchreiben = (p, o, n = 1, ende = "") => fs.writeFileSync(p, JSON.stringify(o, null, n) + ende);
// … und die EINE JSON-KOPIE (`jsonKlon(x)`, in jeder Seite als `window.jsonKlon`, `WARTEN_SEITE`): dieselben Bytes wie
// `JSON.parse(JSON.stringify(x))` — bis w4-verkehr-c2 derselbe Zwilling an 147 Stellen in 50 Skripten (diag-profiband allein 26)
const jsonKlon = (x) => JSON.parse(JSON.stringify(x));
// DAS EINE WORT EINES FEHLERS (in jeder Seite als `window.fehlerText` / `window.fehlerStapel`, `WARTEN_SEITE`): `fehlerText(e)`
// die Meldung, sonst der Fehler als Text; `fehlerStapel(e)` der Stapel, sonst der Text — bis w4-verkehr-c2 je Linse ein eigenes
// `(e && e.message) || String(e)` / `e?.message || String(e)` (61 Stellen in 41 Skripten) und dasselbe mit `stack` (33 in 8)
const fehlerText = (e) => e?.message || String(e);
const fehlerStapel = (e) => e?.stack || String(e);
// DIE UHR DES LAUFS (`const log = laufUhr()`): jede Zeile trägt die Sekunden seit dem Ruf — je Linse ein eigenes `T0` samt
// eigenem log war ein Zwilling
const laufUhr =
    (T0 = Date.now()) =>
    (z) =>
        console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);

// DAS EINE __codeOf: jede Seite trägt vor ihrem ersten Skript `window.__codeOf` (Code ohne Kommentare, der EINE Stripper
// aus stamm.cjs), `window.__dokuOf` (ungestrippt, für Marker im Kommentar) und `window.__fehlt(fn, re)` (true = das Muster
// fehlt im Code; was keine Funktion ist, wirft). Die Wand: gate:betriebsgesetz STRIPPER-WAND.
// DAS EINE WARTEN DER LINSEN (K-WANDUHR, Lehre 26: in Bau-Ereignissen, nie in Wanduhr-Sekunden) — Seiten-Funktionen als Text
// in jede Seite (`WARTEN_SEITE`): `window.__seitenTakt()` ist ein Bild des Loops, ruht er, ein Takt von Hand.
// DAS EINE BILD WIE IM LOOP (`window.__loopBild()`): der Schritt des Node-Frames (r184 rendert den Szenen-Pass je Frame,
// updateBefore FRAME), dann `_loopRender` — ohne den Schritt zeichnete ein Hand-Aufruf nur das Post-Quad neu; je Linse eine
// eigene Zeile davon war ein Zwilling (neun bis w4-b-knoten)
function loopBild() {
    st.renderer._nodes?.nodeFrame?.update();
    r._loopRender();
}
// DIE EINE ZIEL-LESUNG (`await window.__zielLesen(ziel, W, H, renderer)`): die Pixel eines Ziels als Uint8Array in Zeilen zu W·4
// Byte (ohne `renderer` der der Welt, ein Studio reicht seinen) —
// WebGPU kopiert jede Zeile auf 256 Byte ausgerichtet (bytesPerRow), r184 reicht das Polster durch (bei W·4 ∤ 256 lag jede Zeile
// versetzt); je Linse ein eigenes Entpolstern war ein Zwilling (sechs bis w4-b-knoten)
async function zielLesen(ziel, W, H, renderer = st.renderer) {
    const px = await renderer.readRenderTargetPixelsAsync(ziel, 0, 0, W, H);
    const roh = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
    const zeile = W * 4,
        schritt = roh.length > zeile * H ? Math.ceil(zeile / 256) * 256 : zeile;
    if (schritt === zeile) return roh;
    const u8 = new Uint8Array(zeile * H);
    for (let y = 0; y < H; y++) u8.set(roh.subarray(y * schritt, y * schritt + zeile), y * zeile);
    return u8;
}
// DIE EINE PUFFER-LESUNG (`await window.__pufferLesen(puffer, wer)`, gate:apparat Klinge 8): ein Puffer zurück von der GPU — liegt er
// dort nicht (gefallen, nie geladen, oder kein Puffer: die Liste der Wahl je Kamera ist seit w25-gpu-wahl-2 eine Karte), nennt sie
// Leser und Puffer; r184 brach anonym („reading 'size'" in getArrayBufferAsync: haar.K5, vegetation.K1 seit fbbeb318)
function pufferLesen(puffer, wer, renderer = st.renderer) {
    const q = puffer?.isInterleavedBufferAttribute ? puffer.data : puffer;
    if (!q || !renderer.backend.has(q) || !renderer.backend.get(q).buffer)
        throw new Error(`DIE PUFFER-LESUNG (${wer}): ${q?.name || q?.constructor.name} liegt nicht auf der GPU`);
    return renderer.getArrayBufferAsync(puffer);
}
async function seitenTakt() {
    const vor = r._weltStand ? r._weltStand.takte : -1;
    await new Promise((ok) => requestAnimationFrame(ok));
    if ((r._weltStand ? r._weltStand.takte : -1) === vor) r._gameLoopTick(performance.now());
}
// DIE BEDIENUNG DER STAFFEL 2 (spielgang.K3#2, `await __bedienung2()` · Reload · `await __bedienung2(vor)`): EINE Probe, zwei
// Wirte — `werkbank bedienung --staffel 2` am Gerät (der echte Reload) und der Playtest (der Reload ist die Platte, die der
// Konstruktor liest: `_loadKeybindings`). Vorher die Schrift, ihre Größe und ihr Kasten (das HUD mit einem gepflanzten 14-px-Text,
// einem 2 em engen Kasten und einem Zeichen im px-Kasten, das Ich und jede Schublade über den EINEN Schalter, je `_schriftZensus`) und die Umbelegung (der Knopf „vor“ der Belegung, dann KeyO als KeyboardEvent);
// nachher die Belegung, der Weg des Leibs je Taste (KeyO, KeyW und KeyW mit einem festverdrahteten Mutanten), die Standard-
// Belegung zurück. `taeter` nennt jeden Bruch, `blind` jeden Mutanten, den die Probe nicht sah. Ein Bild ist am Gerät ein Bild
// des laufenden Loops, am Null-Renderer EIN Sim-Schritt des Leibs (`_loopFixedStep`: Sammler, Bewegung, Physik) — die Probe
// streamt dort keine Welt weiter, die nach ihr misst (w12-menue: 4 × 32 Hand-Takte legten im Playtest die veralteten
// Wasser-Zellen des Genesis-Chunks −1,−1 frei, drift 489 auch am main ba87b158).
async function bedienung2(vor) {
    const taste = (code, art) =>
        window.dispatchEvent(new KeyboardEvent(art, { code, key: code.slice(3).toLowerCase() }));
    let t = performance.now() / 1000;
    const bilder = async (n) => {
        for (let i = 0; i < n; i++)
            if (st.renderer._isHeadlessNull) r._loopFixedStep(1 / 60, (t += 1 / 60));
            else await new Promise(requestAnimationFrame);
    };
    const taeter = (o) => [
        ...Object.entries(o.schrift).flatMap(([t, z]) => [
            ...z.klein.map((k) => `${t}: ${k.px} px — ${k.wo} „${k.text}“ (${k.n}×)`),
            ...z.ueber.map((k) => `${t}: aus dem Kasten — ${k.wo} „${k.text}“ ${k.grund} (${k.n}×)`),
        ]),
        ...(o.belegt === "KeyO" && o.platte === "KeyO" && o.nachReload === "KeyO"
            ? []
            : [`die Belegung trägt vor nicht (${o.belegt} · ${o.platte} · ${o.nachReload})`]),
        ...(o.neuM >= 0.1 ? [] : [`KeyO bewegt den Leib ${o.neuM} m`]),
        ...(o.altM < 0.1 ? [] : [`festverdrahtet: KeyW bewegt den Leib ${o.altM} m`]),
        ...(o.standardM >= 0.1 ? [] : [`die Standard-Belegung kehrt nicht zurück (W ${o.standardM} m)`]),
    ];
    if (!vor) {
        // die Täter des Selbsttests in der Hotbar, je [Liste, Stil, Text]: ein 14-px-Text · ein 2 em enger Kasten (der Text schneidet
        // ohne „…“ ab) · ein Zeichen im px-Kasten (der Hof vor w13-menue-heil: headless 8 px in 9 hält es, am Gerät ragt es — die
        // Dehnprobe des Zensus nennt es)
        const gepflanzt = [
            ["klein", "font-size: 14px", "Probe 14 px"],
            ["ueber", "display: inline-block; width: 2em; overflow: hidden; white-space: nowrap", "Probe Kasten zu eng"],
            ["ueber", "display: inline-block; width: 9px", "▸"],
        ].map(([liste, cssText, textContent]) => {
            const el = Object.assign(document.createElement("span"), { textContent });
            el.style.cssText = cssText;
            document.getElementById("hotbar").append(el);
            return [liste, el.textContent, el];
        });
        r._menueZeigen(null);
        __handTakt(); // die Leiste, wie ein Takt sie zeigt — nie der Stand des letzten Takts einer anderen Probe (Modus, Werte)
        const schrift = { hud: r._schriftZensus() };
        const blind = gepflanzt
            .filter(([liste, text, el]) => (el.remove(), !schrift.hud[liste].some((z) => z.text === text)))
            .map(([liste, text]) => `„${text}“ der Hotbar fehlt in ${liste} des Zensus`);
        for (const liste of ["klein", "ueber"])
            schrift.hud[liste] = schrift.hud[liste].filter((z) => !gepflanzt.some(([, text]) => text === z.text));
        for (const d of [
            document.getElementById("inventory-overlay"),
            ...document.querySelectorAll(".drawer[data-drawer]"),
        ]) {
            const z = d.dataset.drawer || "ich";
            r._menueZeigen(z, r._menueScheiben(z));
            await r._menueSteht();
            await bilder(2);
            schrift[z] = r._schriftZensus(d);
        }
        r.resetKeybindings();
        r._menueZeigen("einstellungen");
        document.querySelector('.keybind-rebind[data-action="vor"]').click();
        taste("KeyO", "keydown");
        taste("KeyO", "keyup");
        r._menueZeigen(null);
        return {
            schrift,
            blind,
            belegt: st.keybindings.vor,
            platte: JSON.parse(localStorage.getItem("anazh.keybindings")).vor,
        };
    }
    // der Weg einer Taste, gemessen ab der Ruhe des Leibs (kein Ausgleiten des vorigen Gangs zählt)
    const weg = async (code) => {
        for (let i = 0; i < 240 && Math.hypot(st.playerVel.x(), st.playerVel.z()) > 0.01; i++) await bilder(1);
        const [x, z] = [pm.position.x, pm.position.z];
        taste(code, "keydown");
        await bilder(12);
        taste(code, "keyup");
        await bilder(20);
        return +Math.hypot(pm.position.x - x, pm.position.z - z).toFixed(3);
    };
    const p0 = pm.position.clone();
    const o = Object.assign(vor, { nachReload: st.keybindings.vor, neuM: await weg("KeyO"), altM: await weg("KeyW") });
    const zurueck = leihe(r, {
        _tastenAktion: (e) => (e.code === "KeyW" ? "vor" : Object.getPrototypeOf(r)._tastenAktion.call(r, e)),
    });
    const mutantM = await weg("KeyW");
    zurueck();
    r.resetKeybindings();
    o.standardM = await weg("KeyW");
    // der Leib steht, wo die Probe ihn fand (wer nach ihr misst, misst seine Welt)
    [st._fixedPrevPos, st._fieldVy] = [null, 0];
    for (const p of [pm.position, st._fixedSimPos]) if (p) p.copy(p0);
    st.playerVel.setValue(0, 0, 0);
    o.taeter = taeter(o);
    if (!taeter({ ...o, altM: mutantM }).some((x) => x.startsWith("festverdrahtet")))
        o.blind.push(`die festverdrahtete Taste W fiel nicht (${mutantM} m)`);
    return o;
}
// DIE TAKTE VON HAND (`await window.__takte(n, ms)`): n Takte des Loops, je `ms` (ohne: 30) Schlaf dazwischen, ein werfender
// Takt bricht die Reihe nicht — bis w4-verkehr-c dreimal derselbe Zwilling (diag-ankunft, diag-v1-pfad, diag-werkstatt-weg),
// bis w4-verkehr-c2 neunmal mehr (diag-foundry-deadlock, playtest, diag-blick, diag-fern-wasser, diag-foundry-crossfade,
// playtest/studio zweimal, diag-kamera-laub, diag-pruefbuehne); je Takt der EINE stille Hand-Takt (`__handTakt`)
async function takte(n, ms) {
    for (let i = 0; i < n; i++) {
        __handTakt();
        await sleep(ms ?? 30);
    }
}
// DIE STREU-PUMPE (`await window.__streuTakte(n, ms)`): n Takte ohne Budget-Bremse (`_frameOverBudget`), je Takt die Streu um
// den Spieler (`_tickScatterStreaming`), `ms` Schlaf dazwischen — bis w4-verkehr-c2 viermal derselbe Zwilling (playtest/studio
// zweimal, diag-fluss, diag-asset-inventory)
async function streuTakte(n, ms) {
    for (let i = 0; i < n; i++) {
        st._frameOverBudget = false;
        try {
            r._gameLoopTick(performance.now());
            const pp = st.playerMesh && st.playerMesh.position;
            if (pp) r._tickScatterStreaming(pp);
        } catch (e) {
            r._loopErrorBoundary(e);
        }
        await sleep(ms);
    }
}
// DIE EICHUNG DES PROZESSES (`eichMs`, in der Seite `window.__eichMs`; w28-sim-takt-eich): eine feste Arbeit (`n` Schritte
// Gleitkomma, Sinus, Wurzel und gestreuter Zugriff in 8 MB), ihre Dauer in ms. Ein Kosten-Urteil teilt die gemessene Zeit durch die
// Eichung im SELBEN Prozess, unmittelbar neben der gemessenen Arbeit — fremde Last, Takt der CPU und Läufer treffen beide, das
// Verhältnis bleibt. Bis hier urteilten Sim-Takt (VK) und Reifen-Takt (K8) an der Wanduhr: unter 52 % fremder Last fiel VK mit
// 1,10–1,28 ms (Ruhe 0,52–0,70), K8 trug 4,01 statt 1,35 µs
function eichMs(n) {
    const a = eichMs.puffer || (eichMs.puffer = new Float64Array(1 << 20)); // 8 MB: die Arbeit liest und schreibt den Speicher wie die Sim
    const t0 = performance.now();
    let s = 0;
    for (let k = 0; k < n; k++) {
        const x = a[Math.imul(k + (s > 0 ? 1 : 0), 2654435761) >>> 12];
        s += Math.hypot(x + k * 1e-3, 1) * Math.sin(s * 1e-6 + k);
        a[Math.imul(k, 40503) >>> 12] = s * 1e-9;
    }
    const ms = performance.now() - t0;
    eichMs.summe = (eichMs.summe || 0) + s; // die Arbeit bleibt Arbeit (kein toter Code für den Übersetzer)
    return ms;
}
// DAS BILD-MUSTER DER LINSEN (`window.__MUSTER`, ms je Bild): Bilder ohne (8,3), mit einem (16,7 · 20 · 11,1) und mit zwei
// Sim-Schritten (25 · 33,3) — bis w4-verkehr-c viermal dasselbe Literal (fahr-proben, diag-kamera-laub, diag-werk-im-wasser zweimal)
// DER BILD-RENDERER RUHT (`window.__bildAus()`): render und renderAsync leer, die Nachbearbeitung aus — die Probe misst die Welt,
// nie das Bild (bis w4-verkehr-c dreimal derselbe Zwilling: diag-werk-im-wasser zweimal, wasser-linse `wasserStrom`)
function bildAus() {
    if (st.renderer) {
        st.renderer.render = function () {};
        if (typeof st.renderer.renderAsync === "function") st.renderer.renderAsync = () => Promise.resolve();
    }
    st.postProcessingFailed = true;
}
// DAS EINE EINSCHWINGEN (`await window.__weltStehtNach(takt, max)`): Takt um Takt (`takt(n)` oder der Takt der Seite, mindestens
// einer), bis die Welt steht (`_weltSteht`) und das Buch da ist; der Regler hält, solange sie schwingt. Der Deckel `max` zählt
// nur Takte ohne Offenes (`_weltOffen`); dann wirft er.
async function weltStehtNach(takt, max) {
    const W = () => r._weltStand || {};
    const steht = () => r._weltSteht() && !r._bepflanzungWartet();
    const regler = st.perfRegulator;
    st.perfRegulator = false;
    let n = 0;
    try {
        for (
            const weiter = window.__deckel("die Welt", max || 1800, () => r._bepflanzungWartet());
            !(n && steht()) && weiter();
            n++
        ) {
            // ein gebrochener Bau (`_foundry.gebrochen`, `_weltStandTakt`) steht nie: beim Namen, sofort
            if (r._foundry && r._foundry.gebrochen && r._foundry.gebrochen.size)
                throw new Error(`DER BAU IST GEBROCHEN: ${r._foundry.gebrochen.values().next().value}`);
            await (takt || window.__seitenTakt)(n);
            if (n % 5 === 4) await sleep(10);
        }
    } catch (f) {
        throw new Error(
            `DIE WELT STEHT NICHT nach ${n} Takten: ` +
                (r._bepflanzungWartet() ? "das Buch fehlt" : `Ruhe ${W().ruhe | 0}, zuletzt brach sie: ${W().grund}`) +
                ` (${f.message})`
        );
    } finally {
        st.perfRegulator = regler;
    }
    return n;
}
// DAS EINE WARTEN AUF EINEN BAU (`await window.__gebautNach(e, { takt, fertig, bau, max })`): Takt um Takt, bis `fertig()` (sonst
// `_archIsRendered(e)`) steht; vor jedem Takt ruft `bau(n)` ihn (ohne: `_rebuildArchitectureMesh(e)`). `e` ist ein Eintrag oder
// der NAME dessen, was die Welt bauen soll. Der Deckel `max` zählt nur Takte ohne Offenes (`_weltOffen`); dann wirft sie beim Namen.
async function gebautNach(e, { takt, fertig, bau, max, offen, warum } = {}) {
    const steht = fertig || (() => r._archIsRendered(e));
    const baue = bau || (e && typeof e === "object" ? () => r._rebuildArchitectureMesh(e) : () => {});
    let n = 0;
    try {
        for (
            const weiter = window.__deckel(
                typeof e === "string" ? e : e ? `${e.type}#${e.id}` : "kein Eintrag",
                max,
                offen
            );
            (baue(n), !steht()) && weiter();
            n++
        ) {
            await (takt || window.__seitenTakt)(n);
            await sleep(); // die Antwort des Workers landet zwischen zwei Takten
        }
    } catch (f) {
        // `warum()` nennt das Teil-Prädikat, das nicht steht
        if (warum) f.message += ` — ${warum()}`;
        throw f;
    }
    return n;
}
// DER EINE DECKEL jeder wartenden Schleife (`for (const weiter = window.__deckel(name, max, offen); weiter(); )`): er zählt einen
// Gang nur, wenn weder die Welt (`_weltOffen`) noch die Linse (`offen()`) offen hat, und wirft nach `max` (120) beim Namen —
// samt jeder Lücke des Weltbilds (`_weltbildFehlt`: nach dem Tausch am Ort stand das Licht des Orts nie, und der Deckel sagte
// nur „nichts mehr offen"); `offen === false`: jeder Gang zählt. Ein Offenes, das sich 3600 Gänge nicht rührt, wirft beim Namen.
function deckel(name, max, offen) {
    let n = 0,
        k = 0,
        still = 0,
        vor = "";
    return () => {
        const o = r?._weltOffen ? r._weltOffen() : { welt: 1 };
        const auf = Object.values(o).some(Boolean);
        const jetzt = JSON.stringify(o);
        still = auf && jetzt === vor ? still + 1 : 0;
        vor = jetzt;
        if (still > 3600)
            throw new Error(`DIE WELT HÄNGT: ${name} nach ${n} Takten — offen ${jetzt} ohne Bau-Ereignis · ${r._weltOffenAkte()}`);
        if ((offen === false || (!auf && !(offen && offen()))) && ++k > (max || 120))
            throw new Error(
                `DER BAU STEHT NICHT: ${name} nach ${n} Takten — ${offen === false ? "die Linse zählte jeden Gang" : "die Welt hat nichts mehr offen"}${(r?._weltbildFehlt?.(true) || []).map((l) => ` · dem Weltbild fehlt: ${l}`).join("")}`
            );
        return ++n > 0;
    };
}
// DIE WELT IST DA (`await window.__weltDa((r) => bedingung)`): bis der Stamm lebt (`_gameLoopTick`) und die Bedingung gilt — ohne
// Frist: hängt der Boot, nennt ihn die Stall-Akte samt der Bedingung, auf die er wartet (`__weltDaWartet`, im Puls jeder
// Sekunde).
async function weltDa(bed) {
    window.__weltDaWartet = bed ? String(bed).replace(/\s+/g, " ").slice(0, 160) : "den Stamm";
    // erst das Erwachen des Boots (`erwacht`: init samt der Heimat aus dem Faden) — eine Linse, die vorher taktet, taktet
    // eine halbe Welt (der Spieler fällt, ehe die Tiere geboren sind)
    while (!r?.erwacht) await sleep(50);
    // ein Boot, der brach (`erwacht` false: init warf), taktet nie — die Warte fällt beim Namen, statt ewig zu warten (w28-seiten-tod)
    if ((await r.erwacht) === false) throw new Error("BOOT GEBROCHEN: die Welt erwacht nicht, init warf — den Wurf nennt der Fehler-Sammler (pageerror)"); // prettier-ignore
    for (let r; !((r = window.anazhRealm) && typeof r._gameLoopTick === "function" && (!bed || bed(r)));)
        await sleep(50);
    window.__weltDaWartet = null;
    return r;
}
// DIE FARBEN EINER GESTALT (`window.__farben(g)`): je Mesh die erste Vertex-Farbe auf drei Stellen; `window.__lin(hex)` schreibt
// eine Farbe der Tafel (sRGB-Hex) linear in derselben Form. Bis w6-spielgang-decke trugen p2p-gestalt und studio-uebergabe je beide.
function farben(g) {
    const set = new Set();
    g?.traverse((o) => {
        const c = o.geometry?.attributes?.color?.array;
        if (c?.length >= 3) set.add([c[0], c[1], c[2]].map((v) => v.toFixed(3)).join(","));
    });
    return set;
}
const lin = (hx) =>
    [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255]
        .map((c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).toFixed(3))
        .join(",");
// DER EINE ABDRUCK einer Gestalt (`window.__abdruck(x, alle)`): FNV-1a über die Puffer einer Gruppe (traverse), eines Flats (je
// Geometrie seiner Blätter einmal, ohne Schatten-Zwilling) oder einer Geometrie — die Lage, mit `alle` jedes Attribut und der
// Index (ein Farb-Regler bewegt die Vertex-Farbe, nie die Lage); „hash/Teile".
function abdruck(x, alle) {
    let [h, n] = [0x811c9dc5, 0];
    const ein = (a) => {
        const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        for (let i = 0; i < u.length; i++) h = Math.imul(h ^ u[i], 0x01000193);
    };
    const geo = (g) => {
        const at = g?.attributes;
        if (!at || !at.position) return;
        n++;
        for (const k of alle ? Object.keys(at).sort() : ["position"]) ein(at[k].array || at[k].data.array);
        if (alle && g.index) ein(g.index.array);
    };
    if (x?.leaves) for (const g of new Set(x.leaves.filter((l) => !l.shadowTwin).map((l) => l.geom))) geo(g);
    else if (x?.traverse) x.traverse((o) => geo(o.geometry));
    else geo(x);
    return (h >>> 0).toString(16) + "/" + n;
}
// DER STAND DER LEBENDEN WELT, wie der Speicher-Faden ihn schrieb (`await window.__stand()`): alles Gesendete fest, dann sein JSON
// aus IndexedDB — der Leser jedes Save-Rundlaufs (der Platz im localStorage trägt nur abgelegte und verlassene Welten).
async function stand() {
    await r._speicherStill();
    return (await r._idbGetWorld(st.worldMeta.worldId)).json;
}
// … und ALS OBJEKT (`await window.__standJson()`): der Stand geparst, unlesbar `null` — bis w4-verkehr-c2 sechsmal derselbe
// Zwilling (playtest/feld-nexus, koerper, siedlung dreimal, werkstatt)
async function standJson() {
    const roh = await window.__stand();
    try {
        return JSON.parse(roh);
    } catch {
        return null;
    }
}
// DER PUTZ DER WERKSTATT-PROBEN (`window.__werkPutz()`): alle Schubladen zu (der Welt-Blick), Gier und Leib auf 0 — bis
// w4-verkehr-c2 achtmal derselbe Zwilling (playtest/bau-buch zweimal, bau, feld-nexus dreimal, werkstatt zweimal)
function werkPutz() {
    r.closeAllDrawers();
    st.yaw = 0;
    if (st.playerMesh) st.playerMesh.rotation.y = 0;
}
// DIE PEERS WEG (`window.__peersWeg()`): jeder Peer der Leitung fällt über `_p2pRemovePeer` — bis w8-snapshot-schlank elfmal
// derselbe Zwilling in playtest/netz-p2p
function peersWeg() {
    for (const pid of Array.from(st.p2p.peers.keys())) r._p2pRemovePeer(pid);
}
// DIE BAUTEN SEIT JETZT (`window.__bautenSeit()`): merkt die Architekturen und gibt den Rückweg — sein Ruf reißt jede seither
// gesetzte über `removeArchitecture` ab; bis w6-gesetzbuch fünfmal derselbe Zwilling (playtest/feld-leben viermal, koerper-seele)
function bautenSeit() {
    const vor = new Set(st.architectures);
    return () => st.architectures.filter((x) => !vor.has(x)).forEach((e) => r.removeArchitecture(e));
}
// DIE BAUTEN LEER (`window.__bautenLeer()`): der Bestand fällt ganz durch die EINE Tafel des Spiels (`_bautenLeeren`: Bild,
// Krone, jeder Takt, Instanz-Gruppen) — bis w4-verkehr-c2 sechsmal derselbe Zwilling in playtest/siedlung, bis z264 räumte er
// selbst (Mesh fort, Liste leer) und ließ jeden Takt seine Waisen weiter rechnen
function bautenLeer() {
    r._bautenLeeren();
}
// DER SPION AM RUF (`window.__rufe(wer, methode, lieferer, name, args)`): `lieferer[name]` zählt (und delegiert) über die EINE
// Leihe, solange `wer[methode](...args)` läuft — die Zahl der Rufe; ein Wurf nach dem Ruf entwertet den Konsum nicht. Bis
// w4-verkehr-c2 dreimal derselbe Zwilling (diag-ankunft, diag-settlement, diag-werkstatt-weg)
function rufe(wer, methode, lieferer, name, args) {
    const echt = lieferer[name];
    let n = 0;
    const zurueck = leihe(lieferer, {
        [name]: function (...x) {
            n++;
            return echt.apply(this, x);
        },
    });
    try {
        wer[methode](...args);
    } catch {
        // der Konsum zählt bis zum Wurf
    } finally {
        zurueck();
    }
    return n;
}
// DAS BILD ALS PNG: in jeder Seite `window.__png(u8, W, H)` — RGBA-Bytes W×H (ein Schuss, eine Maske) deckend als Daten-URL,
// in Node `pngDatei(datei, url)` schreibt sie; bis dahin baute jede Bild-Linse ihre Leinwand und ihren Puffer selbst
// (w4-proben-tempo2: die Bytes kopiert, das Alpha deckend gesetzt — dieselben Bytes wie die Abbildung je Byte, ohne 8 Mio. Rückrufe
// je 1920×1080)
function png(u8, W, H) {
    const cv = Object.assign(document.createElement("canvas"), { width: W, height: H });
    const d = new Uint8ClampedArray(u8.subarray(0, W * H * 4));
    for (let i = 3; i < d.length; i += 4) d[i] = 255;
    cv.getContext("2d").putImageData(new ImageData(d, W, H), 0, 0);
    return cv.toDataURL("image/png");
}
// ALLE BÜNDEL DER SZENE NEU (`window.__bundlesNeu()`): ein Bündel, das vor einer Sicht-Änderung aufnahm, zeichnet beim nächsten
// Bild neu (eine Linse blendet Klassen aus und ein, die Bühne wechselt)
const bundlesNeu = () => st.scene.traverse((o) => o.isBundleGroup && (o.needsUpdate = true));
// der Ordner des Bilds entsteht mit ihm (`licht --laub --ordner d` legte ihn nie an: der Lauf brach am ersten Bild ab)
const pngDatei = (datei, url) => (fs.mkdirSync(path.dirname(datei), { recursive: true }), fs.writeFileSync(datei, Buffer.from(url.split(",")[1], "base64")));
// DER RAHMEN EINER BOX (`rahmen(b)`, in jeder Seite als `window.rahmen`, `WARTEN_SEITE`): ihre OBB, sonst die achsgleiche im
// selben Maß wie `_boxAbstand2` (Mitte, Achsen c/s, Halb-Maße) — die Linsen der Blocker (kollision-bild, kreatur-leben, werk-im-wasser)
const rahmen = (b) =>
    b.obb || {
        cx: (b.minX + b.maxX) / 2,
        cz: (b.minZ + b.maxZ) / 2,
        c: 1,
        s: 0,
        hx: (b.maxX - b.minX) / 2,
        hz: (b.maxZ - b.minZ) / 2,
    };
const WARTEN_SEITE = `${weltR} window.rahmen = ${rahmen}; window.__png = ${png}; window.__bundlesNeu = ${bundlesNeu}; window.sleep = ${sleep}; window.leihe = ${leihe}; window.__fremd = ${fremd}; window.__loopBild = ${loopBild}; window.__zielLesen = ${zielLesen}; window.__pufferLesen = ${pufferLesen}; window.jsonKlon = ${jsonKlon}; window.fehlerText = ${fehlerText}; window.fehlerStapel = ${fehlerStapel}; window.__seitenTakt = ${seitenTakt}; window.__bedienung2 = ${bedienung2}; window.__takte = ${takte}; window.__streuTakte = ${streuTakte}; window.__bildAus = ${bildAus}; window.__MUSTER = [16.7, 8.3, 25, 16.7, 33.3, 11.1, 20, 16.7]; window.__eichMs = ${eichMs}; window.__weltStehtNach = ${weltStehtNach}; window.__gebautNach = ${gebautNach}; window.__deckel = ${deckel}; window.__weltDa = ${weltDa}; window.__abdruck = ${abdruck}; window.__farben = ${farben}; window.__lin = ${lin}; window.__stand = ${stand}; window.__standJson = ${standJson}; window.__werkPutz = ${werkPutz}; window.__bautenLeer = ${bautenLeer}; window.__bautenSeit = ${bautenSeit}; window.__peersWeg = ${peersWeg}; window.__rufe = ${rufe};`;
const CODE_OF_SEITE = `window.__codeOf = ((oK) => (f) => oK(String(f)))(${ohneKommentare}); window.__dokuOf = (f) => String(f); window.__fehlt = (f, re) => [].concat(f).every((g, i) => { if (typeof g !== "function") throw new Error("__fehlt: Glied " + i + " ist keine Funktion (" + typeof g + ") — die Absenz misst nichts"); re.lastIndex = 0; return !re.test(window.__codeOf(g)); }); ${WARTEN_SEITE}`;

const ROOT = path.resolve(__dirname, "..", "..");
// DIE ENGINE DER KERNE (w5-pipeline, pipeline.K5): das Modul, das die Import-Karte von index.html für das Manifest-Feld
// `engine` nennt (three r184 — dieselbe Datei wie Welt und Foundry-Faden, `_foundryStart`), als Pfad ab der Wurzel
// (`ENGINE_MODUL`) und in Node als THREE der Kerne (`ENGINE_THREE`: require des ES-Moduls, eine veränderbare Kopie, ohne
// ColorManagement wie im Faden — die Kerne rechnen ihre Farbe selbst). Ein Manifest ohne Engine oder eine Karte ohne ihr
// Modul bricht laut.
// das Modul der Import-Karte der Welt (index.html `<script type="importmap">`) für das Manifest-Feld `engine`, ab der
// Wurzel; ENGINE_THREE schweigt die Warnung von require(esm) (Node liest die typlose .js als ES-Modul — der Weg, kein Befund)
const ENGINE_MODUL = () =>
    JSON.parse(ausDatei("index.html").match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports[jsonLesen("cores.manifest.json").find((c) => c.engine).engine].slice(1); // prettier-ignore
function ENGINE_THREE() {
    const w = process.emitWarning;
    process.emitWarning = () => {};
    const T = require(ROOT + ENGINE_MODUL());
    process.emitWarning = w;
    T.ColorManagement.enabled = false;
    return { ...T };
}
// DER STUDIO-KERN in Node: die Engine der Kerne (einmal je Prozess — die Kerne bauen gegen das globale THREE) und der Kern `datei` (ab
// der Wurzel) → `globalThis[name]`; `frisch` lädt ihn neu (die Stoffe rechnen ihre Farbe beim ersten Bau). Bis zur Decke
// w3s-sukzession lud jede Linse three und Kern in eigenen Zeilen (fünfzehn Mal).
function studioKern(datei, name, frisch) {
    global.THREE ||= ENGINE_THREE();
    if (frisch) delete require.cache[require.resolve(path.join(ROOT, datei))];
    require(path.join(ROOT, datei));
    return globalThis[name];
}
// DER SCOPE EINES FADENS in Node: ein frischer vm-Kontext wie im Foundry-Worker — `self` · `globalThis` · `window` sind das
// globale Objekt, Math das des Gates (die Plattform-Probe erreicht so den Guss) — darin die `quellen` (Pfade ab der Wurzel, je
// Prozess einmal gelesen) der Reihe nach. Bis zur Decke w3s-sukzession baute jede Linse ihn selbst (vier Mal).
const QUELL_TEXT = {};
// die Kerne des Ofens (Tier und Mensch: foundry-core BAKERS_BY_KIND) in der Folge ihres Fadens
const OFEN_KERNE = ["phyto-core.js", "koerper-core.js", "tetrapoda-core.js", "foundry-core.js"];
// THREE ist die Engine des Fadens (`ENGINE_THREE`, je Scope eine eigene Kopie des Namensraums) — der Faden rechnet auf
// three r184, kein Linsen-Scope auf einer zweiten three.
function fadenScope(quellen) {
    const sb = { console, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
    sb.self = sb.globalThis = sb.window = sb;
    sb.THREE = ENGINE_THREE();
    require("vm").createContext(sb);
    for (const f of quellen)
        require("vm").runInContext((QUELL_TEXT[f] ||= ausDatei(f)), sb, {
            filename: f,
        });
    return sb;
}

const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
};

// DER MESS-SERVER LIEFERT WIE DER ECHTE (w28-mess-server-kopf, Labor = Welt): jede Datei trägt die Köpfe des save-servers aus
// seiner EINEN Quelle (save-server.js `statischerKopf`: ETag des Inhalts, `Cache-Control: no-cache`, COOP/COEP/CORP), die
// frische Nachfrage bekommt 304 (`frischBeimLeser`). Bis hier sandte er weder Validator noch Regel noch Isolation — die Linsen
// maßen an einem Server, den kein Spieler hat. Was sich an der Kalt-Zeile der Ankunft damit verschiebt (diag-boot-stage --kalt
// --echt, GTX 1050, main 1cd1c408, je 4 im Wechsel alt ↔ neu): „Skripte da“ 2,40 → 1,75 s (alt 1,39–3,40, neu 1,59–2,02),
// „Buch da“ 4,89 → 3,55 s (3,86–5,94 → 3,23–3,76), t(Kontrolle) kalt 26,52 → 25,89 s (25,86–27,36 → 25,59–26,41: die Spannen
// überlappen) — kein Lauf brach. DER FADEN-HÄNGER des kalten Boots (spätere Fäden derselben Skript-Adresse blieben in Chromes
// `HTTP_CACHE_OPEN_OR_CREATE_ENTRY` stehen, die Pflanzung hing, das Bild kam ohne Wald) hing NICHT an den Köpfen: mit ihnen
// hing dieser Server 12 von 12 kalten Boots, ohne sie 16 von 21 — er fiel mit der EINEN Skript-Quelle der Fäden
// (w28-faden-quelle: 0 von 21 unter jedem Kopf-Satz). Geladen wird der echte Server als Modul (er lauscht nur als
// Hauptprogramm), beim ersten Ruf.
let echterKopfModul = null;
function echterKopf() {
    return echterKopfModul || (echterKopfModul = require(path.join(ROOT, "save-server.js")));
}

// Der Statik-Server: die Datei unter der Wurzel (`/` heißt `start`, außerhalb 403, fehlt 404); `seiten` liefert eigene Seiten
// nach Pfad (Text, Puffer, Funktion, auch als Promise), `keinCache` setzt no-store; `wandle(pfad, daten)` ist der EINE Haken der
// Selbsttests (null heißt 404). Ein Wurf im Haken oder in einer Seite ist 500 und ein Fehler beim Namen.
// Der EINE Server-Start und die EINE Welt-Adresse: `await server.lausche(port)` (127.0.0.1, 0 = frei) und
// `server.zeige(seite, frist, rest = "index.html", warte = "domcontentloaded")` fährt die Seite an die Adresse, an der der Server
// WIRKLICH lauscht — eine Linse mit eigenem listen-Versprechen oder eigener 127.0.0.1-Adresse daneben ist ein Zwilling (gate:welt-boot).
function statikServer({ root = ROOT, start = "/index.html", seiten = null, keinCache = false, wandle = null } = {}) {
    const bruch = (res, p, e) => {
        melde("server", `${p}: ${(e && (e.stack || e.message)) || e}`);
        res.statusCode = 500;
        res.end();
    };
    // DER EINE SENDER JEDER ANTWORT — Datei wie eigene Seite (`seiten`) tragen den Kopf des echten Servers (`echterKopf`: ETag
    // des Inhalts, `no-cache`, die Isolation, ACAO) und bekommen 304 ohne Körper auf die frische Nachfrage, wie save-server.js
    // `sendStaticFile`. EINE Seite ohne ihn bricht unter der Isolation der anderen: bis hier (3d9efa3b) trugen nur die Dateien
    // den Kopf, die eigenen Seiten nicht — der Geschwister-Frame der Portal-Linse (`/__fremd.html`) lud im isolierten Dokument der
    // Heimat nie (COEP verlangt ihn von jedem Rahmen), seine Marke kehrte nie zurück (z419: gate:portal-konformanz riss nach
    // 180 s; am echten Server schließt der Handshake jeder Welt). `keinCache` tauscht nur die Cache-Regel (no-store, kein ETag).
    const sende = (req, res, inhalt, typ) => {
        const { statischerKopf, frischBeimLeser } = echterKopf();
        const koerper = inhalt == null ? "" : inhalt;
        const kopf = statischerKopf(koerper, typ);
        if (keinCache) {
            kopf["Cache-Control"] = "no-store";
            delete kopf.ETag;
        } else if (frischBeimLeser(req, kopf.ETag)) {
            delete kopf["Content-Type"];
            res.writeHead(304, kopf);
            return res.end();
        }
        res.writeHead(200, kopf);
        res.end(koerper);
    };
    const server = http.createServer((req, res) => {
        let p;
        try {
            p = decodeURIComponent(req.url.split("?")[0]);
        } catch {
            res.statusCode = 400;
            return res.end();
        }
        if (seiten && Object.hasOwn(seiten, p)) {
            const s = seiten[p];
            const typ = MIME[path.extname(p)] || "text/html";
            return Promise.resolve()
                .then(() => (typeof s === "function" ? s(req) : s))
                .then(
                    (inhalt) => sende(req, res, inhalt, typ),
                    (e) => bruch(res, p, e)
                );
        }
        if (p === "/") p = start;
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            const roh = err ? null : data;
            Promise.resolve()
                .then(() => (wandle ? wandle(p, roh) : roh))
                .then(
                    (inhalt) => {
                        if (inhalt == null) return ((res.statusCode = 404), res.end());
                        sende(req, res, inhalt, MIME[path.extname(fp)] || "application/octet-stream");
                    },
                    (e) => bruch(res, p, e)
                );
        });
    });
    server.lausche = (port) => new Promise((ok) => server.listen(port, "127.0.0.1", () => ok(server)));
    // DER ORT DER ANKUNFT (w12-dorf-probe): jede Seite kommt an der Ankunft an und trägt ihren im Haushalt erklärten Dorf-Zug
    // (`ortZug`, genesis: er ruht, sein Inhalt hinge an der Bildrate), solange sie selbst keinen erklärt hat — in jedem Renderer
    // derselbe. Bis w12-dorf-probe hielt ihn nur der Null-Renderer an (das Spiel fragte den Renderer), mit Bild lief er.
    server.zeige = async (seite, frist, rest = "index.html", warte = "domcontentloaded") => {
        await ortZug(seite, "genesis");
        return seite.goto(`http://127.0.0.1:${server.address().port}/${rest}`, { waitUntil: warte, timeout: frist });
    };
    return server;
}

// DER ZUG DES ORTS (`await ortZug(page, id)`, vor dem ersten Skript der Seite): der Dorf-Zug des Messorts aus dem Haushalt
// (scripts/lib/welt-orte.cjs `messort`, `dorfZug`) als Haken `__anazhAutoSettlement`, wo die Seite noch keinen trägt (das erste
// Wort gilt: `server.zeige` erklärt so die Ankunft) — derselbe in jedem Renderer: seit w12-dorf-probe hält den Zug nur der Ort, nie
// der Null-Renderer (bis dahin urteilte jede headless Probe am Dorf eine leere Welt).
const ortZug = (page, id) => page.evaluateOnNewDocument((z) => window.__anazhAutoSettlement ??= z, require("./welt-orte.cjs").messort(id).dorfZug);

// Die Browser-Rezepte: null (kein GPU-Prozess, der Null-Renderer) · webgl (WebGL2 an der Weiche) · standard (Chromes Wahl) ·
// linse (WebGPU an der Weiche: lokal und auf den Karten der CI die Karte, ohne Karte swiftshader) · echt (der Hardware-Adapter).
const REZEPTE = {
    null: () => ["--no-sandbox", "--disable-gpu"],
    webgl: () => linsenWebglArgs(),
    standard: () => ["--no-sandbox", "--disable-setuid-sandbox"],
    linse: () => linsenWebGpuArgs(),
    echt: () => echteWebGpuArgs(),
};
// DIE KLASSE DER CI: diese Rezepte zeichnen mit einem Echt-Renderer; in einer CPU-Gruppe (CI_KLASSE) ist eines ROT beim Namen,
// eines, das nie zeichnet, in jeder Gruppe (browser.close).
const GPU_REZEPTE = ["linse", "webgl", "echt"];

// Die Start-Optionen: `frist` = protocolTimeout (ms), `zusatz` hinter dem Rezept, `viewport`, `profil` = userDataDir; headless.
function browserOptionen({ art, frist, zusatz = [], headless = true, viewport, profil } = {}) {
    if (!REZEPTE[art])
        throw new Error(`welt-boot: unbekanntes Rezept "${art}" — erlaubt: ${Object.keys(REZEPTE).join(" · ")}`);
    const o = { headless, userDataDir: profil, __rezept: art };
    if (frist != null) o.protocolTimeout = frist;
    if (viewport !== undefined) o.defaultViewport = viewport;
    o.args = [...REZEPTE[art](), ...zusatz];
    return o;
}

// DER FEHLER-SAMMLER: eine Liste je Prozess, die Wache am Prozess-Ende. Harmlos ist nur Netz/Favicon/save-server im
// headless-Kontext und was die Linse als `erwartet` nennt.
const HARMLOS = /favicon|net::ERR|Failed to load resource|save-server|localhost:|127\.0\.0\.1:\d+\/api/i;
const KOSTEN = /^\[budget\] |BUDGET-BRUCH /;
// DIE POST-KETTE BRICHT NIE STILL: der EINE Melder (`_stoffBruch` → `_bruchMelden`) schreibt ihren Bruch — im Bau oder im
// Render-Lauf, danach zeichnet der Schirm direkt — als ERROR-Zeile über console.log; bis hier sah der Sammler nur console.error,
// und jede Linse außer gate:post-kette blieb über ihm grün (gate:fern-ring meldete auf main JEDEN Frame „STOFF: die Post-Kette
// (Render-Lauf …)", CI 41622260772). Jetzt ist er in JEDER Linse, die hier bootet, ROT beim Namen (der Selbsttest: wirft.html).
// DER GEFANGENE WURF IM TAKT BRICHT NIE STILL (w28-loop-wurf): die Fehler-Grenze des Loops (`_loopErrorBoundary`) fängt ihn, die
// Welt läuft weiter, und der EINE Melder schreibt ihn als ERROR-Zeile über console.log — bis hier sah ihn kein Sammler (11.11.,
// w27-ort-pose-voll: der Schritt des Verkehrs warf in JEDEM Sim-Schritt, die Stadt stand still, jede Linse blieb GRÜN). Jetzt ROT
// beim Namen in JEDER Linse, die hier bootet (`LOOP_WURF`): je Wurf-Text EIN Fehler (der Melder meldet jeden neuen Text sofort),
// seine Wiederholung zählt (`wuerfe`: der Zähler des Melders, er kommt je 2 s — „≥“). Ein Hand-Takt, der an der Grenze vorbei
// wirft, geht an dieselbe Grenze (`__handTakt`, `__streuTakte`).
const LOOP_WURF = /\[ERROR\] Loop-Frame-Fehler/;
const sammlung = { fehler: [], erwartet: null, wache: false, selbsttest: null, wuerfe: 0 };
// DER TÄTER, DEN DIE LINSE SELBST SETZT (`taeter(re)`): nimmt die gesammelten Fehler, die `re` trifft, aus der Liste und gibt sie
// zurück — die Mutante einer Linse beweist so, dass der EINE Sammler sie SAH (leer = still grün), statt sie als `erwartet` zu verschweigen
function taeter(re, t = []) {
    sammlung.fehler = sammlung.fehler.filter((f) => !re.test(f) || !t.push(f));
    return t;
}
// DAS BRUCH-BUCH GEHT IN DENSELBEN SAMMLER (w28-loop-vor-init): der EINE Melder des Spiels (`_bruchMelden`) schreibt jeden Bruch
// in sein Buch und als ERROR-Zeile über console.log — der Sammler las davon nur zwei Wörter (die Post-Kette, den Wurf im Takt).
// Eine Linse, die das Buch der Seite zu ihrem Zeitpunkt liest (die Kalt-Zeile von gate:boot-stage: am ersten Weltbild), reicht
// die Einträge `[Text, Zahl]` hier herein: jeder ist ROT beim Wort wie ein Wurf, ein gepflanzter fällt über `taeter(/^bruch: /)`.
// Was der Sammler aus der Konsole schon trägt, zählt nicht doppelt. Befund 11.11. (GTX 1050, 7 von 126 Zweit-Boots): „STOFF: die
// Spieler-Vorlagen …" und zweimal „FADEN-UMGANGEN: Guss „mensch“ …" standen vor dem Bild im Buch, der Leib goss 3,3–3,9 s im
// Haupt-Faden, und kein Tor las es. → die neu gesammelten Zeilen
function bruchBuch(eintraege, wann) {
    const neu = [];
    for (const [text, n] of eintraege || []) {
        const kern = String(text).slice(0, 120);
        if (sammlung.fehler.some((f) => f.includes(kern))) continue;
        const vor = sammlung.fehler.length;
        melde("bruch", `${wann} — ${n > 1 ? `${n}× ` : ""}${text}`);
        if (sammlung.fehler.length > vor) neu.push(sammlung.fehler[vor]);
    }
    return neu;
}

function melde(art, text) {
    const t = String(text || "")
        .split("\n")
        .slice(0, 3)
        .join(" | ")
        .slice(0, 400);
    if (sammlung.erwartet?.test(t)) return;
    // ab `selbsttest(name)` setzt die Linse ihren Täter selbst: was die Seite meldet, steht als SELBSTTEST
    if (sammlung.selbsttest && (art === "console.error" || art === "pageerror"))
        return console.log(`[welt-boot] SELBSTTEST ${sammlung.selbsttest} ${art}: ${t}`);
    sammlung.fehler.push(`${art}: ${t}`);
    console.log(`[welt-boot] FEHLER ${art}: ${t}`);
}

function wacheAnProzessEnde() {
    if (sammlung.wache) return;
    sammlung.wache = true;
    process.on("exit", (code) => {
        if (!sammlung.fehler.length) return;
        console.log(`[welt-boot] ROT — ${sammlung.fehler.length} Fehler der Welt${sammlung.wuerfe ? ` · im Takt ≥ ${sammlung.wuerfe}× gefangen` : ""}:`);
        // ❌ je Fehler: der Dienst der GPU-Probe zeigt die Zeilen mit Urteil — ein Fehler ohne Urteils-Zeichen fehlte seinem Post
        for (const f of sammlung.fehler.slice(0, 12)) console.log(`  ❌ ${f}`);
        if (code === 0) process.exitCode = 1;
    });
}

function fehlerSammler(page) {
    if (!page || page.__weltBootSammler) return page;
    page.__weltBootSammler = true;
    page.on("pageerror", (e) => melde("pageerror", (e && (e.stack || e.message)) || e));
    page.on("error", (e) => melde("absturz", e?.message || e));
    page.on("console", (m) => {
        const t = m.text();
        if (/\[ERROR\] STOFF: die Post-Kette/.test(t)) return melde("post-kette", t);
        if (LOOP_WURF.test(t)) {
            const n = /(\d+)× insgesamt\)$/.exec(t);
            return n ? (sammlung.wuerfe = Math.max(sammlung.wuerfe, n[1])) : melde("loop-wurf", t);
        }
        if (m.type() !== "error") return;
        if (HARMLOS.test(t)) return;
        // ein Budget-Bruch ist ein KOSTEN-Urteil mit eigenem Richter (gate:asset-contract, regler-wirkt), kein Absturz der Welt
        if (KOSTEN.test(t)) return console.log(`[welt-boot] KOSTEN (Richter gate:asset-contract): ${t.slice(0, 300)}`);
        melde("console.error", t);
    });
    return page;
}

// ── DIE STALL-AKTE: ein Hänger der Seite hat einen Namen — der PULS (ein Binding, je Sekunde mit der Phase) zeigt, ob der
// Haupt-Thread lebt; die STEMPEL gehen hinaus, bevor ein Aufruf blockiert; der Stich-Profiler der Seite liefert den Stapel der
// Lücke (antwortet er nicht, sprechen CPU je Prozess, Stempel und Stderr).
// DIE AKTE HÄLT DIE SEITE NIE AN (w9-ziel-leben): bis hier fragte sie den Stapel mit `Debugger.pause`. Die Pause dreht die
// Nachrichten-Schleife der Seite verschachtelt, und Chrome legt darin das Bild der WebGPU-Leinwand vor — ihre aktuelle Textur
// stirbt mitten im Frame. Hielt der Frame da einen Pass in sie (r184: der Ausgabe-Pass der Post-Kette ist offen, während der
// Szenen-Pass in ihm zeichnet — fast der ganze Frame), verwarf die GPU seinen Submit: „Destroyed texture [Texture (unlabeled
// 1280x720 px, TextureFormat::RGBA8Unorm)] used in a submit … renderContext_4" (CI voll 14/18 gate:kamera-leib, z200 und z203
// je 2 von 2: jede Meldung 1–3 s nach einer Akte, deren Stapel in `updateForRender`/`renderObject` stand). Der Stich-Profiler
// (`Profiler`, je 10 ms eine Probe) hält nichts an: die Leinwand lebt, bis ihr Frame eingereicht ist.
const AKTE_SEITEN = new Set();
const akten = [];
let akteN = 0;
let akteUhr = null;

const sek = (ms) => (ms / 1000).toFixed(1);
const ring = (liste, eintrag, n) => (liste.push(eintrag), liste.length > n && liste.splice(0, liste.length - n));
const kurz = (x) =>
    String(typeof x === "function" ? x.name || x.toString() : x)
        .replace(/\s+/g, " ")
        .slice(0, 90);

// Die Seite: Puls, Phase und Stempel (als Quelltext injiziert; läuft vor jedem Skript der Seite).
function pulsSeite() {
    if (window.top !== window || window.__weltPulsAn || typeof window.__weltPuls !== "function") return;
    window.__weltPulsAn = true;
    const B = window.__weltPuls;
    const Z = { programme: 0, sync: 0, letzt: "", syncLetzt: "" };
    const sende = (art, text) => {
        try {
            B(`${art}\t${String(text).slice(0, 300)}`);
        } catch {
            // das Binding ist fort: die Seite geht
        }
    };
    const stempel = (text) => ((Z.letzt = text), sende("stempel", text));
    const G = window.WebGL2RenderingContext?.prototype;
    if (G) {
        const lp = G.linkProgram;
        G.linkProgram = function () {
            stempel(`gl.linkProgram #${++Z.programme}`);
            return lp.apply(this, arguments);
        };
        // die synchronen Rückfragen an den GPU-Prozess (der Haupt-Thread wartet auf die Antwort): Stempel beim Namenswechsel
        for (const m of [
            "getProgramParameter",
            "getShaderParameter",
            "readPixels",
            "getBufferSubData",
            "finish",
            "getError",
            "clientWaitSync",
            "checkFramebufferStatus",
        ]) {
            const o = G[m];
            if (typeof o !== "function") continue;
            G[m] = function () {
                Z.sync++;
                if (m !== Z.syncLetzt) ((Z.syncLetzt = m), sende("stempel", `gl.${m} (synchron #${Z.sync})`));
                return o.apply(this, arguments);
            };
        }
    }
    const D = window.GPUDevice?.prototype;
    if (D)
        for (const m of [
            "createRenderPipeline",
            "createRenderPipelineAsync",
            "createComputePipeline",
            "createComputePipelineAsync",
        ]) {
            const o = D[m];
            if (typeof o !== "function") continue;
            D[m] = function (d) {
                stempel(`gpu.${m} #${++Z.programme} ${d?.label || ""}`);
                return o.apply(this, arguments);
            };
        }
    // der Stoff-Name je Pipeline am Backend der Welt (r184 createRenderPipeline(renderObject)), sobald es steht
    const stoffHaken = () => {
        const be = st?.renderer?.backend;
        if (!be || be.__weltPulsHaken || typeof be.createRenderPipeline !== "function") return;
        be.__weltPulsHaken = true;
        const crp = be.createRenderPipeline;
        be.createRenderPipeline = function (ro) {
            const m = ro?.material;
            const o = ro?.object;
            const p = ro?.pipeline;
            const len = (s) => (s && typeof s.code === "string" ? s.code.length : "?");
            const lichter = typeof ro?.lightsNode?.getLights === "function" ? ro.lightsNode.getLights().length : "?";
            const name = `${m?.name || m?.type || "?"} · ${o?.name || o?.type || "?"}`;
            stempel(
                `Pipeline ${name} · vs ${len(p?.vertexProgram)} fs ${len(p?.fragmentProgram)} Zeichen · ${lichter} Lichter`
            );
            const t0 = performance.now();
            const aus = crp.apply(this, arguments);
            const ms = performance.now() - t0;
            if (ms >= 500) sende("stempel", `Pipeline ${name} stand nach ${(ms / 1000).toFixed(1)} s (synchron)`);
            return aus;
        };
    };
    const phase = () => {
        stoffHaken();
        const st = r?.state;
        const t = [document.readyState];
        if (document.visibilityState === "hidden") t.push("verborgen");
        if (st) {
            t.push(`renderer ${st.rendererReady === true ? "bereit" : "—"}`, `weltbild ${st._weltbildDa ? "da" : "—"}`);
            if (st.flightRecorder) t.push(`frames ${st.flightRecorder.frames}`);
            const W = r._weltStand; // worauf das Einschwingen wartet (`__weltStehtNach`), beim Namen
            if (W) t.push(`welt ${W.takte} Takte · Ruhe ${W.ruhe} · zuletzt ${W.grund}`);
        } else t.push("anazhRealm —");
        if (window.__weltDaWartet) t.push(`__weltDa wartet auf ${window.__weltDaWartet}`);
        t.push(`programme ${Z.programme}`, `gl-sync ${Z.sync}`);
        if (Z.letzt) t.push(`zuletzt ${Z.letzt}`);
        return t.join(" · ");
    };
    sende("puls", "Dokument beginnt");
    setInterval(() => sende("puls", phase()), 1000);
}

// die Seite merkt, ob sie die GPU nimmt (Gerät, Renderer, Pipeline, Draw — nie die Adapter-Frage)
function zeichnetHaken() {
    const merke = (f) =>
        function (...a) {
            try {
                window.top.__gpuGenutzt = true;
            } catch {
                window.__gpuGenutzt = true;
            }
            return f.apply(this, a);
        };
    for (const K of [
        window.GPUAdapter,
        window.GPUQueue,
        window.GPUDevice,
        window.WebGL2RenderingContext,
        window.WebGLRenderingContext,
    ])
        for (const m of [
            "requestDevice",
            "submit",
            "createRenderPipeline",
            "createComputePipeline",
            "getSupportedExtensions",
            "drawArrays",
            "linkProgram",
        ])
            if (K?.prototype[m]) K.prototype[m] = merke(K.prototype[m]);
}
// DIE WEICHE: ein Echt-Rezept, dessen Welt-Seiten nie zeichnen, belegt die Karte umsonst — ROT beim Namen
async function weicheUrteil(browser, art) {
    const welt = (await browser.pages().catch(() => [])).filter((p) => /^https?:/.test(p.url()));
    const genutzt = async (p) => p.evaluate(() => !!window.__gpuGenutzt).catch(() => true);
    if (!GPU_REZEPTE.includes(art) || !welt.length || (await Promise.all(welt.map(genutzt))).some(Boolean)) return null;
    return `${path.basename(process.argv[1] || "?")} startet „${art}" und zeichnet nie (keine seiner ${welt.length} Seiten arbeitet auf der GPU): das Rezept ist „null"`;
}
// Je Seite: Ringe, Puls-Binding, Stich-Profiler (nur ohne Zeit-Urteil: ein Profiler färbt keine ms), umhüllte Aufrufe.
function akteAnSeite(page, b) {
    if (!page.__akteBereit)
        page.__akteBereit = Promise.all([
            page.evaluateOnNewDocument(CODE_OF_SEITE),
            page.evaluateOnNewDocument(zeichnetHaken),
            akteAnlegen(page, b),
        ]);
    return page.__akteBereit;
}
async function akteAnlegen(page, b) {
    const A = (page.__akte = {
        id: ++akteN,
        b,
        konsole: [],
        stempel: [],
        puls: null,
        pulsN: 0,
        offen: new Map(),
        gemeldet: false,
        s: null,
        profil: false,
    });
    AKTE_SEITEN.add(page);
    page.on("close", () => AKTE_SEITEN.delete(page));
    page.on("console", (m) => ring(A.konsole, `${m.type()}: ${m.text().replace(/\s+/g, " ").slice(0, 200)}`, 12));
    for (const n of [
        "goto",
        "reload",
        "evaluate",
        "evaluateHandle",
        "waitForFunction",
        "waitForSelector",
        "waitForNavigation",
        "screenshot",
    ]) {
        const o = page[n];
        if (typeof o !== "function") continue;
        page[n] = function (...a) {
            const auf = { was: `${n}(${kurz(a[0])})`, an: Date.now() };
            A.offen.set(auf, auf);
            return o.apply(this, a).then(
                (v) => (A.offen.delete(auf), v),
                async (e) => {
                    const msg = fehlerText(e);
                    if (e?.name === "TimeoutError" || /timed out/i.test(msg))
                        await akte(
                            page,
                            `${auf.was} riss nach ${sek(Date.now() - auf.an)} s: ${msg.split("\n")[0].slice(0, 160)}`
                        );
                    A.offen.delete(auf);
                    throw e;
                }
            );
        };
    }
    try {
        const s = (A.s = await page.createCDPSession());
        s.on("Runtime.bindingCalled", (e) => e.name === "__weltPuls" && puls(A, e.payload));
        await s.send("Runtime.enable");
        await s.send("Runtime.addBinding", { name: "__weltPuls" });
        await page.evaluateOnNewDocument(pulsSeite);
        // der Stich-Profiler läuft vor der Lücke an: sein Start wartet auf einen freien Haupt-Thread, in der Lücke käme er zu spät
        if (b.stapel)
            for (const [k, w] of [["enable"], ["setSamplingInterval", { interval: 1e4 }], ["start"]])
                (await s.send("Profiler." + k, w), (A.profil = true));
    } catch (e) {
        if (!page.isClosed()) console.log(`[stall-akte] Seite #${A.id} ohne Puls: ${e?.message || e}`);
    }
    if (!akteUhr) {
        akteUhr = setInterval(() => {
            for (const p of AKTE_SEITEN) {
                const P = p.__akte;
                if (p.isClosed() || !P.b.offen) {
                    AKTE_SEITEN.delete(p);
                    continue;
                }
                if (!P.puls || P.gemeldet || / verborgen /.test(` ${P.puls.text} `)) continue;
                const luecke = Date.now() - P.puls.an;
                if (luecke >= P.b.stallMs)
                    akte(p, `der Puls steht seit ${sek(luecke)} s`).catch((e) =>
                        console.log(`[stall-akte] Akte brach: ${e?.message}`)
                    );
            }
        }, 1000);
        akteUhr.unref();
    }
}

function puls(A, payload) {
    const i = String(payload).indexOf("\t");
    const art = String(payload).slice(0, i);
    const text = String(payload).slice(i + 1);
    if (art !== "puls") return ring(A.stempel, `${new Date().toISOString().slice(11, 23)} ${text}`, 12);
    if (A.gemeldet && A.puls && Date.now() - A.puls.an >= A.b.stallMs)
        console.log(
            `[stall-akte] Seite #${A.id}: der Puls kehrt zurück nach ${sek(Date.now() - A.puls.an)} s — ${text}`
        );
    A.gemeldet = false;
    A.puls = { an: Date.now(), text };
    A.pulsN++;
}

const stapelText = (rahmen) =>
    rahmen
        .slice(0, 8)
        .map(
            (f) => `${f.functionName || "(anonym)"} ${String(f.url).split("/").pop().split("?")[0]}:${f.lineNumber + 1}`
        )
        .join(" < ");

// DER STAPEL DER LÜCKE aus dem Stich-Profiler (`Profiler.stop`, danach läuft er neu an): die Proben seit `ab` (der letzte Puls,
// Wanduhr der Linse; das Ende des Profils ist die Antwort) — die häufigste Spitze mit Skript-Rahmen, deren Skript-Rahmen innen
// zuerst (eine native Spitze wie `writeBuffer` steht als ihr Rufer; Leerlauf, Programm und Kehraus tragen keinen). Der Stop
// wartet auf einen freien Haupt-Thread: er antwortet, wenn die Lücke endet.
async function profilStapel(A, ab) {
    const p = (await A.s.send("Profiler.stop").finally(() => A.s.send("Profiler.start").catch(() => {}))).profile;
    const k = new Map(p.nodes.map((n) => [n.id, n]));
    for (const n of p.nodes) for (const c of n.children || []) k.get(c).auf = n;
    const kette = (n) => (n ? (n.callFrame.url ? [n.callFrame] : []).concat(kette(n.auf)) : []);
    let [t, z, spitze] = [p.startTime - p.endTime + (Date.now() - ab) * 1e3, new Map(), []];
    p.samples.forEach((id, i) => (t += p.timeDeltas[i]) >= 0 && z.set(id, (z.get(id) || 0) + 1));
    for (const [id] of [...z].sort((x, y) => x[1] - y[1])) if (kette(k.get(id)).length) spitze = kette(k.get(id));
    return spitze.length ? spitze : null;
}

// DIE FÄDEN DES GPU-PROZESSES (Linux, /proc/<pid>/task): wer dort rechnet, nach Faden-Namen (swiftshader `Thread<NN>`,
// `CrGpuMain`, ANGLE, Compositor); Ticks = utime + stime (Felder 14 und 15).
function faedenProbe(pid) {
    if (process.platform !== "linux" || !pid) return null;
    const m = new Map();
    try {
        for (const t of fs.readdirSync(`/proc/${pid}/task`)) {
            try {
                const st = ausDatei(`/proc/${pid}/task/${t}/stat`);
                const rest = st.slice(st.lastIndexOf(")") + 2).split(" ");
                m.set(t, {
                    name: st.slice(st.indexOf("(") + 1, st.lastIndexOf(")")),
                    ticks: Number(rest[11]) + Number(rest[12]),
                });
            } catch {
                // der Faden endete zwischen Liste und Lesen
            }
        }
    } catch {
        return null;
    }
    return m;
}
function faedenText(a, z, ms) {
    if (!a || !z) return null;
    const g = new Map();
    for (const [t, v] of z) {
        const k = v.name.replace(/<[^>]*>$/, "<>").replace(/\d+$/, "");
        const e = g.get(k) || { n: 0, ticks: 0 };
        e.n++;
        e.ticks += v.ticks - ((a.get(t) && a.get(t).ticks) || 0);
        g.set(k, e);
    }
    const z2 = [...g].filter(([, e]) => e.ticks > 0).sort((x, y) => y[1].ticks - x[1].ticks);
    return z2.length
        ? z2
              .slice(0, 6)
              .map(([k, e]) => `${k}${e.n > 1 ? ` ×${e.n}` : ""} ${((e.ticks / (ms / 10)) * 100).toFixed(0)} %`)
              .join(" · ")
        : null;
}

// DIE AKTE: was offen ist, der Puls, die Stempel, CPU, der Stapel, Konsole, Stderr — und das Urteil beim Namen.
async function akte(page, grund) {
    const A = page.__akte;
    if (!A) return null;
    const schon = A.gemeldet;
    A.gemeldet = true;
    const luecke = A.puls ? Date.now() - A.puls.an : null;
    const cpu = A.b.cpu || { text: "keine Probe", renderer: 0, gpu: 0, faeden: null };
    let stapel = null;
    const fragen = A.profil && !schon && luecke != null && luecke > 2000;
    if (fragen) {
        stapel = await Promise.race([profilStapel(A, A.puls.an).catch(() => null), sleep(8000)]);
    }
    const letzt = A.stempel.length ? A.stempel[A.stempel.length - 1] : "kein Stempel";
    let urteil;
    if (!A.puls) urteil = "KEIN PULS — das Dokument lief nie an (Navigation oder Dokument-Start)";
    else if (luecke < 3000)
        urteil = `AWAIT — der Haupt-Thread lebt (Puls vor ${sek(luecke)} s), ein Versprechen der Seite kehrt nie zurück; zuletzt ${letzt}`;
    else if (stapel) urteil = `JS-SCHLEIFE — der Haupt-Thread rechnet in ${stapelText(stapel).split(" < ")[0]}`;
    else if (cpu.renderer >= 0.5)
        urteil = `NATIV — der Haupt-Thread rechnet in einem nativen Aufruf (${(cpu.renderer * 100).toFixed(0)} %, kein JS-Stapel); zuletzt ${letzt}`;
    else if (cpu.gpu >= 0.5)
        urteil = `GPU-PROZESS — der Haupt-Thread wartet nativ, der GPU-Prozess rechnet (${(cpu.gpu * 100).toFixed(0)} %${cpu.faeden ? `: ${cpu.faeden.split(" · ").slice(0, 2).join(" · ")}` : ""}); zuletzt ${letzt}`;
    else urteil = `VERKLEMMUNG — der Haupt-Thread wartet nativ, kein Prozess rechnet; zuletzt ${letzt}`;
    const z = [`═══ ${path.basename(process.argv[1] || "?")} · Seite #${A.id} ${kurz(page.url())} · ${grund}`];
    for (const o of A.offen.values()) z.push(`offen ${o.was} seit ${sek(Date.now() - o.an)} s`);
    z.push(A.puls ? `Puls ${A.pulsN}×, zuletzt vor ${sek(luecke)} s — ${A.puls.text}` : "Puls nie");
    for (const s of A.stempel) z.push(`Stempel ${s}`);
    z.push(`CPU (2 s) ${cpu.text}`);
    if (cpu.faeden) z.push(`Fäden des GPU-Prozesses (2 s) ${cpu.faeden}`);
    if (A.b.last.length) z.push(`Last je 2 s (GPU-Prozess/Renderer %, älteste zuerst) ${A.b.last.join(" · ")}`);
    z.push(
        `Stapel ${stapel ? stapelText(stapel) : fragen ? "kein Stapel in 8 s — der Haupt-Thread steht NATIV" : A.profil ? "(nicht gefragt: der Puls lebt oder die Akte fragte schon)" : "(kein Profiler: Zeit-Linse)"}`
    );
    for (const k of A.konsole) z.push(`Konsole ${k}`);
    for (const l of A.b.stderr.slice(-24)) z.push(`Stderr ${l}`);
    z.push(`URTEIL ${urteil}`);
    console.log(z.map((l) => `[stall-akte] ${l}`).join("\n"));
    const eintrag = { seite: A.id, grund, urteil, stapel: stapel ? stapelText(stapel) : null };
    akten.push(eintrag);
    return eintrag;
}

// DAS PROFIL JE START (w11-profil-leck): ohne eigenes Profil legte puppeteer `puppeteer_dev_chrome_profile-*` an, die Werkbank
// `werkbank-profil-*` — ein abgebrochener Lauf ließ es liegen (OMEN 04.11. 18:28: 201 + 131 Profile, ~32 GB, C: bei 0 MB, Push
// und echt-Job fielen). JEDER Browser startet hier (`startePuppeteer`: starteBrowser und die Werkbank): ohne `userDataDir` ein
// Scratch-Profil `anazh-profil-<PID des Besitzers>-*` (`tempNeu`), das mit `browser.close()`, am Prozess-Ende (auch nach einem
// Wurf; puppeteers Exit-Wache tötet Chrome vorher) und bei SIGINT/SIGTERM/SIGHUP stirbt. Ein harter Kill lässt nichts laufen:
// darum FEGT jeder Start die Profile toter Läufe — Besitzer tot (die Alt-Namen tragen keinen: tot),
// älter als 10 min und kein Chrome hält es (`haelt`: die offene `lockfile` eines Windows-Chrome lässt sich nicht löschen — ein
// Alt-Profil ohne Besitzer eines lebenden Laufs; ein `rmSync` auf ein gehaltenes löschte es halb). Ein lebender Lauf behält sein Profil.
const lebt = (pid) => {
    try {
        return process.kill(pid, 0);
    } catch (e) {
        return e.code === "EPERM";
    }
};
const haelt = (d) => {
    try {
        fs.unlinkSync(path.join(d, "lockfile"));
    } catch (e) {
        return e.code !== "ENOENT";
    }
};
// Löschen mit Geduld: ein eben getöteter Chrome (taskkill /T /F kehrt vor dem Ende seiner Kinder zurück) hält seine Dateien noch
// Augenblicke (EPERM), `maxRetries` wiederholt EPERM nicht (Node 24: der Wurf nach 1 ms) — synchron, das Prozess-Ende wartet nicht;
// nach 5 s steht der Rest beim Namen im Log (ein Profil fegt der nächste Start)
function loesche(d, mal = 50) {
    try {
        fs.rmSync(d, { recursive: true, force: true });
    } catch (e) {
        if (!mal) return console.log(`[welt-boot] bleibt liegen: ${fehlerText(e)}`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
        loesche(d, mal - 1);
    }
}
function profileFegen(tmp = os.tmpdir()) {
    for (const n of fs.readdirSync(tmp)) {
        const [d, m] = [path.join(tmp, n), /^(?:anazh-(\d+)-|werkbank-profil-|puppeteer_dev_)/.exec(n)];
        try {
            // EIN Versuch ohne Geduld: der Chrome eines toten Laufs ist seit 10 min tot — was dann noch hält (Virenscanner, ein
            // fremder Griff), hielt mit Geduld JEDEN Start 5 s je Profil an und steht hier beim Namen im Log
            if (m && !lebt(+m[1]) && Date.now() - fs.statSync(d).mtimeMs > 6e5 && !haelt(d)) loesche(d, 0);
        } catch {
            // ein Profil, das ein zweiter Starter im selben Augenblick fegt, oder eine Datei, die der Virenscanner hält: der nächste Start
        }
    }
}
const tempNeu = (name = "profil", pid = process.pid) => fs.mkdtempSync(path.join(os.tmpdir(), `anazh-${pid}-${name}-`));
const signalEnde = (s) => process.exit(128 + os.constants.signals[s]);
// DAS SICHTBARE FENSTER (Schöpfer 08./09.11.: „die GPU-Proben mit offenem Fenster, dann sehe ich, was geschieht“): LINSE_SICHTBAR=1
// (gpu-probe.yml je Läufer) öffnet JEDEN Browser dieses Starters als Fenster — Werkbank und Gates gehen beide hier durch. Die Drossel
// verdeckter Fenster schaltet Puppeteer selbst ab (ChromeLauncher-Vorgaben); der Weg der Welt bleibt derselbe.
// DER TOD DER SEITE BEIM NAMEN (w28-seiten-tod — die Geburt jeder Seite, Werkbank und Linsen): stirbt ein Seiten-Prozess, schweigt
// Puppeteer. Gemessen an einer leeren Seite (11.11., kopflos): am V8-OOM eines Arbeits-Fadens kein `error`, kein
// Inspector.targetCrashed, kein Target.targetCrashed — nur das Abbild unter <profil>/Crashpad; am Abschuss von außen allein
// Target.targetCrashed am Browser; und in KEINEM Fall fällt eine hängende Frage. So stand die Probe bild:gipfel-blick@0.5 stumm bis
// an ihren Deckel (der Seiten-Prozess starb beim Wecken der Metropole am V8-OOM, 6 von 9 Läufen, GTX 1060). Die Wache hört JEDES
// Zeichen — das Abbild (sein Grund beim Namen: Prozess-Art · „V8 javascript OOM (…)“ · Ausnahme-Code), das Ereignis des Browsers,
// das der Seite, den Riss der Verbindung — und nennt den Tod EINMAL:
// jede offene und jede spätere Frage an eine Seite fällt mit „ABSTURZ der Seite: <Grund>“, dann geht der Browser zu (was sonst noch
// an ihm hängt, fällt mit ihm). Das Abbild bleibt unter <temp>/anazh-absturz liegen.
// (Windows nennt den Code der Ausnahme, das Abbild des Linux-Läufers die Nummer des Signals: 5 SIGTRAP — so bricht V8 am Speicher-Ende
// und jede Absicht —, 6 SIGABRT, 11 SIGSEGV)
const ABSTURZ_CODE = { 0xe0000008: "Speicher erschöpft", 0xc0000005: "Zugriffsverletzung", 0x80000003: "Abbruch mit Absicht", 0x5: "Abbruch mit Absicht, SIGTRAP", 0x6: "Abbruch, SIGABRT", 0xb: "Zugriffsverletzung, SIGSEGV" }; // prettier-ignore
function absturzGrund(datei) {
    let b;
    try {
        b = fs.readFileSync(datei);
    } catch {
        return `Abbild ${path.basename(datei)} (nicht lesbar)`;
    }
    const t = b.toString("latin1");
    // die Art des Prozesses aus seiner Befehlszeile (UTF-16), der Satz der V8-Wache, der Code des Ausnahme-Stroms (Minidump, Strom 6)
    // (Windows trägt sie als UTF-16, das Abbild des Linux-Läufers als Bytes)
    const art = ((/-\0-\0t\0y\0p\0e\0=\0((?:[a-z-]\0)+)/.exec(t) || [])[1] || "").replace(/\0/g, "") || (/--type=([a-z-]+)/.exec(t) || [])[1] || "Prozess unbekannt"; // prettier-ignore
    const oom = (/V8 (?:javascript|process) OOM \([^)]{1,60}\)/.exec(t) || [])[0];
    let code = null;
    try {
        for (let i = 0, n = b.readUInt32LE(8), d = b.readUInt32LE(12); i < n; i++)
            if (b.readUInt32LE(d + i * 12) === 6) code = b.readUInt32LE(b.readUInt32LE(d + i * 12 + 8) + 8);
    } catch {
        // kein Minidump
    }
    let ort = datei;
    try {
        const ablage = path.join(os.tmpdir(), "anazh-absturz");
        fs.mkdirSync(ablage, { recursive: true });
        fs.copyFileSync(datei, (ort = path.join(ablage, path.basename(datei))));
    } catch {
        // das Abbild bleibt, wo es liegt
    }
    const ausnahme = code != null && `Ausnahme 0x${code.toString(16)}${ABSTURZ_CODE[code] ? ` (${ABSTURZ_CODE[code]})` : ""}`;
    return [art, oom, ausnahme, `Abbild ${ort}`].filter(Boolean).join(" · ");
}
// DER BOOT, DER BRICHT (Koordinator 11.11.): die Seite lebt, aber die Welt erwacht nie — init wirft (der Stand mit Mensch-Prägung
// {height 1.12} am alten Leser `_koerperStudioDials`: „leibGroesse ohne height/mass/tone", 30 s kein Takt, seit 4b1e4eee bis
// e21a131f), das Versprechen des Boots (`anazhRealm.erwacht`, `_bootAnazhRealm`) sagt false — und jede Warte einer Linse wartete bis
// an ihre Frist (`waitForFunction` 120 s) oder ewig (`__weltDa`). Die Seite meldet den Bruch des ERSTEN Boots ihres Dokuments (ein
// Welt-Wechsel setzt sein eigenes Versprechen und lädt bei einem Bruch selbst neu) samt dem Wurf davor; die Wache nennt ihn: jede
// offene und jede spätere Frage an DIESE Seite fällt mit „BOOT GEBROCHEN: <Grund>", der Browser bleibt, ein neues Dokument beginnt neu.
function bootWacheSeite() {
    if (window.top !== window || window.__bootWacheAn) return;
    window.__bootWacheAn = true;
    let grund = "";
    const merke = (x) => {
        const e = x && "reason" in x ? x.reason : x && x.error;
        grund = String((e && (e.stack || e.message)) || (x && x.message) || e || "").split("\n").slice(0, 2).join(" | ");
    };
    window.addEventListener("unhandledrejection", merke);
    window.addEventListener("error", merke);
    const t0 = Date.now();
    const sieh = setInterval(() => {
        const e = window.anazhRealm && window.anazhRealm.erwacht;
        if (!e && Date.now() - t0 < 6e5) return;
        clearInterval(sieh);
        if (e)
            Promise.resolve(e).then((ok) => {
                if (ok === false)
                    setTimeout(() => typeof window.__bootBrach === "function" && window.__bootBrach(grund || "init warf ohne Grund"), 50);
            });
    }, 50);
}
function todesWache(browser, profil) {
    let tot = null;
    let gewollt = false;
    const fallen = new Set();
    const seiten = new Set();
    const stirb = (grund, zu = true) => {
        if (tot || gewollt) return;
        tot = new Error(`ABSTURZ der Seite: ${grund}`);
        console.error(`\n❌ ${tot.message}`);
        for (const f of fallen) f(tot);
        fallen.clear();
        if (zu) setTimeout(() => browser.close().catch(() => {}), 100).unref();
    };
    // jede Frage an eine Seite läuft gegen den Tod (des Browsers und den gebrochenen Boot ihres Dokuments): sie fällt mit seinem
    // Namen, auch wenn sie vorher gestellt war; nach einem gebrochenen Boot fällt jede spätere WARTE (`warte`), eine Frage, die nur
    // liest, antwortet weiter (die Linse liest den Befund der Seite; `__weltDa` wirft dort selbst)
    const mitTod = (p, seite, warte) => {
        const t = tot || (warte && seite && seite.__bootTot);
        if (t) return p.catch(() => {}), Promise.reject(t);
        let fall;
        const q = Promise.race([p, new Promise((_, nein) => (fallen.add((fall = nein)), seite && seite.__bootFallen.add(nein)))]);
        const weg = () => (fallen.delete(fall), seite && seite.__bootFallen.delete(fall));
        q.then(weg, weg);
        return q;
    };
    const bootBrach = (seite, grund) => {
        if (tot || gewollt || seite.__bootTot || sammlung.erwartet?.test(grund)) return;
        const e = (seite.__bootTot = new Error(`BOOT GEBROCHEN: die Welt erwacht nicht, init warf — ${String(grund).slice(0, 300)}`));
        console.error(`\n❌ ${e.message}`);
        for (const f of seite.__bootFallen) f(e);
        seite.__bootFallen.clear();
    };
    const bootWache = async (seite) => {
        if (!seite || seite.__bootWache) return seite;
        seite.__bootWache = true;
        await seite.exposeFunction("__bootBrach", (g) => bootBrach(seite, g)).catch(() => {});
        await seite.evaluateOnNewDocument(bootWacheSeite).catch(() => {});
        return seite;
    };
    // die Abbilder des Profils (Crashpad legt sie je Plattform in reports, pending oder completed): ein neues, dessen Größe steht
    const abbilder = () => {
        const aus = [];
        (function geh(x) {
            let l = [];
            try {
                l = fs.readdirSync(x, { withFileTypes: true });
            } catch {
                return;
            }
            for (const e of l)
                if (e.isDirectory()) geh(path.join(x, e.name));
                else if (e.name.endsWith(".dmp")) aus.push(path.join(x, e.name));
        })(path.join(profil, "Crashpad"));
        return aus;
    };
    const gesehen = new Map(abbilder().map((d) => [d, -1])); // ein benanntes Profil (--serie) trägt die Abbilder früherer Läufe
    const abbild = () => {
        for (const d of abbilder()) {
            if (gesehen.get(d) === -1) continue;
            let n = 0;
            try {
                n = fs.statSync(d).size;
            } catch {
                continue;
            }
            if (gesehen.get(d) !== n) {
                gesehen.set(d, n); // es wächst noch
                continue;
            }
            gesehen.set(d, -1);
            const g = absturzGrund(d);
            if (/^(renderer|Prozess unbekannt)/.test(g)) return g;
            console.error(`[welt-boot] ABSTURZ im Browser (nicht die Seite): ${g}`);
        }
        return null;
    };
    // ein Ereignis nennt den Tod ohne Grund — das Abbild folgt binnen einer Sekunde und trägt ihn
    const ereignis = (grund) => setTimeout(() => stirb(abbild() || abbild() || grund), 1500).unref();
    const taufe = (page) => {
        if (!page || seiten.has(page)) return page;
        seiten.add(page);
        page.__bootTot = null;
        page.__bootFallen = new Set();
        page.once("close", () => seiten.delete(page));
        page.on("error", (e) => ereignis(`der Browser meldet die Seite als abgestürzt (${(e && e.message) || e})`));
        // ein neues Dokument beginnt neu: die Linse lädt (goto, reload) oder die Seite navigiert selbst
        page.on("framenavigated", (f) => f === page.mainFrame() && (page.__bootTot = null));
        for (const m of ["evaluate", "evaluateHandle", "waitForFunction", "goto", "reload", "screenshot"]) {
            const alt = page[m].bind(page);
            page[m] = (...a) => ((m === "goto" || m === "reload") && (page.__bootTot = null), mitTod(alt(...a), page, m === "waitForFunction")); // prettier-ignore
        }
        return page;
    };
    const neu = browser.newPage.bind(browser);
    browser.newPage = async (...a) => bootWache(taufe(await neu(...a)));
    const alle = browser.pages.bind(browser);
    browser.pages = async (...a) => Promise.all((await alle(...a)).map((p) => bootWache(taufe(p))));
    // die Sitzung am Browser: sein Ereignis (ein Abschuss von außen meldet sich je nach Ziel NUR hier)
    browser
        .target()
        .createCDPSession()
        .then((s) => {
            s.on("Target.targetCrashed", (e) => ereignis(`der Browser meldet einen Seiten-Prozess als ${e.status} (Code ${e.errorCode})`));
            return s.send("Target.setDiscoverTargets", { discover: true });
        })
        .catch(() => {});
    const uhr = setInterval(() => {
        const g = !tot && !gewollt && abbild();
        if (g) stirb(g);
    }, 1000);
    uhr.unref();
    browser.on("disconnected", () => {
        clearInterval(uhr);
        stirb(abbild() || abbild() || "die Verbindung zum Browser riss (der Browser-Prozess ist fort)", false);
    });
    const zu = browser.close.bind(browser);
    browser.close = (...a) => ((gewollt = true), zu(...a));
    // DER GEWOLLTE TOD (w28-seiten-tod, CI 43356443158): eine Linse, die ihren Browser selbst abschießt (die Persistenz-Härtung:
    // der Tab-Tod, `taskkill` / SIGKILL am Prozess), nennt ihn vorher gewollt — sonst rief die Wache je Tod „ABSTURZ der Seite: die
    // Verbindung zum Browser riss“, und die Urteils-Wache las 12 rote Zeilen bei Exit 0
    browser.todGewollt = () => void (gewollt = true);
    return browser;
}
// DER START TRÄGT SEIN REZEPT (z396, 12.11.: drei neue Fälle des Selbsttests starteten `{ headless: true }` ohne Rezept — lokal GRÜN, auf dem
// Linux-Läufer fehlte --no-sandbox und der Start starb ohne Namen, „Failed to launch the browser process: Code: null", 2/2): jede
// Option kommt aus browserOptionen (das Rezept, `__rezept`) oder nennt ihr Rezept selbst (die Werkbank); ohne Rezept wirft der Start
// auf JEDER Plattform beim Namen, bevor ein Browser entsteht
async function startePuppeteer(rezeptOpt) {
    if (!rezeptOpt || !REZEPTE[rezeptOpt.__rezept])
        throw new Error(`welt-boot: ein Browser ohne Rezept — jeder Start über browserOptionen({ art }) (${Object.keys(REZEPTE).join(" · ")}); ohne Rezept fehlen die Schalter der Plattform (--no-sandbox auf dem Linux-Läufer)`); // prettier-ignore
    const { __rezept, ...o } = rezeptOpt;
    o.headless &&= process.env.LINSE_SICHTBAR !== "1";
    profileFegen();
    // DAS ABBILD AUF JEDER PLATTFORM (w28-seiten-tod, CI 43356443158): die Wache liest den Tod eines Seiten-Prozesses aus seinem
    // Abbild unter <profil>/Crashpad — Windows legt es von selbst, der Linux-Läufer nicht: dort blieben „Absturz“ und „V8-OOM im
    // Faden“ 40 s stumm (die Seite war tot, kein Ereignis, kein Abbild). Jeder Start schaltet die Abbilder ein und nennt ihren
    // Ort (kopfloses Chrome: --enable-crash-reporter + --crash-dumps-dir, dazu BREAKPAD_DUMP_LOCATION), ohne Puppeteers
    // --disable-breakpad
    const mitAbbild = (profil) => {
        const ort = path.join(profil, "Crashpad");
        fs.mkdirSync(ort, { recursive: true });
        return {
            ...o,
            userDataDir: profil,
            args: [...(o.args || []), "--enable-crash-reporter", `--crash-dumps-dir=${ort}`],
            ignoreDefaultArgs: o.ignoreDefaultArgs === true ? true : [...(o.ignoreDefaultArgs || []), "--disable-breakpad"],
            env: { ...process.env, ...o.env, BREAKPAD_DUMP_LOCATION: ort },
        };
    };
    if (o.userDataDir) return todesWache(await require("puppeteer").launch(mitAbbild(o.userDataDir)), o.userDataDir);
    const d = tempNeu();
    const weg = () => loesche(d);
    const browser = await require("puppeteer")
        .launch(mitAbbild(d))
        .catch((e) => (weg(), Promise.reject(e)));
    process.on("exit", weg);
    for (const s of ["SIGINT", "SIGTERM", "SIGHUP"]) process.off(s, signalEnde).on(s, signalEnde);
    const zu = browser.close.bind(browser);
    browser.close = (...a) => zu(...a).then((x) => (process.off("exit", weg), weg(), x));
    browser.profil = d;
    return todesWache(browser, d);
}

// Der Browser über die EINE Weiche, jede Seite am Fehler-Sammler, die Linse nennt ihren Adapter.
async function starteBrowser(opts = {}) {
    if (opts.erwartet) sammlung.erwartet = opts.erwartet;
    wacheAnProzessEnde();
    if (process.env.CI_KLASSE === "cpu" && GPU_REZEPTE.includes(opts.art))
        melde(
            "klasse",
            `${path.basename(process.argv[1] || "?")} startet das Echt-Rezept „${opts.art}" in einer CPU-Gruppe der CI — der Schritt gehört auf die Karte (check.yml echt)`
        );
    const browser = await startePuppeteer(browserOptionen(opts));
    // die Stall-Akte des Browsers: Stderr-Ring (Chrome, GPU-Prozess), Browser-Sitzung für CPU je Prozess, die Schwelle
    const b = {
        stderr: [],
        cdp: null,
        stapel: opts.art !== "echt",
        stallMs: opts.stallMs || 20000,
        offen: true,
    };
    const proc = browser.process();
    if (proc?.stderr) {
        let rest = "";
        proc.stderr.on("data", (d) => {
            const z = (rest + d.toString()).split("\n");
            rest = z.pop();
            for (const l of z) if (l.trim()) ring(b.stderr, l.slice(0, 260), 60);
        });
    }
    b.cdp = await browser
        .target()
        .createCDPSession()
        .catch(() => null);
    // die LAST-SPUR: je 2 s die CPU je Prozess (`b.cpu`: die letzte Probe liest die Akte — bis w9-ziel-leben nahm sie eine eigene
    // über 2 s, ein Zwilling dieser Uhr) und als Ring der GPU-Prozess und der stärkste Renderer (wann begann die Arbeit, auf die
    // die Seite wartet)
    b.last = [];
    if (b.cdp) {
        let vor = null;
        let fVor = null;
        const uhr = setInterval(async () => {
            if (!b.offen) return clearInterval(uhr);
            try {
                const info = (await b.cdp.send("SystemInfo.getProcessInfo")).processInfo;
                const jetzt = new Map(info.map((p) => [`${p.type} ${p.id}`, p.cpuTime]));
                const fJetzt = faedenProbe((info.find((p) => p.type === "GPU") || {}).id);
                if (vor) {
                    const d = [...jetzt].map(([k, v]) => [k, (v - (vor.get(k) || 0)) / 2]).sort((x, y) => y[1] - x[1]);
                    const anteil = (typ) => Math.max(0, ...d.filter(([k]) => k.startsWith(typ)).map(([, v]) => v));
                    const pz = (v) => (v * 100).toFixed(0);
                    // unter Linux der stärkste Faden des GPU-Prozesses dazu (wer die Last trägt)
                    const f = faedenText(fVor, fJetzt, 2000);
                    b.cpu = { renderer: anteil("renderer"), gpu: anteil("GPU"), faeden: f };
                    b.cpu.text =
                        d
                            .filter(([k, v]) => v >= 0.01 || k.startsWith("GPU"))
                            .map(([k, v]) => `${k} ${pz(v)} %`)
                            .join(" · ") || "alles ruht";
                    ring(
                        b.last,
                        `${new Date().toISOString().slice(14, 19)} gpu ${pz(b.cpu.gpu)}${f ? ` [${f.split(" · ")[0]}]` : ""}/r ${pz(b.cpu.renderer)}`,
                        30
                    );
                }
                vor = jetzt;
                fVor = fJetzt;
            } catch {
                // die Browser-Sitzung geht mit dem Browser
            }
        }, 2000);
        uhr.unref();
    }
    let abbau = false;
    const zu = browser.close.bind(browser);
    browser.close = async (...a) => {
        const rot = await weicheUrteil(browser, opts.art);
        if (rot) melde("klasse", rot);
        [abbau, b.offen] = [true, false];
        return zu(...a);
    };
    browser.on("disconnected", () => {
        b.offen = false;
        if (!abbau) melde("absturz", "Browser getrennt ohne Abbau");
    });
    // jede neue Seite — auch die eines eigenen Kontexts — trägt ihre Werkzeuge vor dem ersten Skript (bis w3u-nachfolge hängte
    // `targetcreated` sie an die Kontext-Seite erst nach dem Start ihres ersten Dokuments)
    const angelegt =
        (neu) =>
        async (...a) => {
            const p = fehlerSammler(await neu(...a));
            await akteAnSeite(p, b);
            return p;
        };
    browser.newPage = angelegt(browser.newPage.bind(browser));
    const kontext = browser.createBrowserContext.bind(browser);
    browser.createBrowserContext = async (...a) => {
        const k = await kontext(...a);
        k.newPage = angelegt(k.newPage.bind(k));
        return k;
    };
    for (const p of await browser.pages()) await akteAnSeite(fehlerSammler(p), b);
    browser.on("targetcreated", async (t) => {
        if (t.type() !== "page") return;
        try {
            const p = await t.page();
            if (p) await akteAnSeite(fehlerSammler(p), b);
        } catch {
            // ein Ziel, das vor dem Anheften stirbt, meldet sich über disconnected/close
        }
    });
    // jede GPU-Linse nennt den Adapter, den der Browser WIRKLICH liefert (gate:start-rezept W4), die WebGL-Linse ihren
    // WebGL2-Renderer
    if (opts.art === "linse" || opts.art === "echt" || opts.art === "webgl")
        browser.adapter = await adapterZeile(browser, { webgl: opts.art === "webgl" });
    return browser;
}

// Der Null-Renderer (die Seite zeichnet nichts: `__anazhHeadlessNullRenderer`, der Schalter des Stamms; die Foundry baut auch
// ohne Bild, `_foundryEnabled`) — EINMAL hier, jede Linse ohne Bild ruft ihn vor dem Laden;
// `warteAufWelt` wartet, bis die Welt ihren Takt trägt — die EINE Warte jeder Linse.
async function nullRenderer(page) {
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
}
// DIE NULL-SEITE: der Browser im Rezept null und seine erste Seite mit dem Null-Renderer — der Start jeder Linse ohne Bild
// (`opts` wie `starteBrowser`), EINMAL hier statt in jeder Linse; `opts.bild` zeichnet (ohne Null-Renderer, das Rezept nennt `art`); mit
// `server` lauscht zuerst der Statik-Server (an `port`, sonst frei) — bis w12-verkehr trug jede von 38 Linsen ihr eigenes `lausche` davor.
async function nullSeite({ bild, ...opts } = {}, server, port = 0) {
    if (server) await server.lausche(port);
    const browser = await starteBrowser(Object.assign({ art: "null" }, opts));
    const page = await browser.newPage();
    if (!bild) await nullRenderer(page);
    return { browser, page };
}
// DIE NULL-WELT: die Null-Seite samt lauschendem Server (`opts.port`, sonst ein freier; `opts` wie `nullSeite`; `opts.fenster` ihr Viewport,
// `opts.vor` — eines oder eine Liste — trägt die Seite vor ihrem ersten Skript) fährt an die Welt-Adresse (`server.zeige` mit `zeige`:
// Frist, Adresse, Warte-Art) und wartet, wo `opts.da` es sagt, auf die Welt (`__weltDa(da)`) — bis w21-laub-unten stand dieselbe Folge
// in 25 Linsen, bis w24-strauch-saum dazu in 19 mit Bild, Viewport oder zwei Vor-Skripten (die Null-Probe aus w13-verkehr-heil fiel in sie).
async function nullWelt(server, { port = 0, vor, da, fenster, ...opts }, ...zeige) {
    const s = await nullSeite(opts, server, port);
    if (fenster) await s.page.setViewport(fenster);
    for (const v of [vor || []].flat()) await s.page.evaluateOnNewDocument(v);
    await server.zeige(s.page, ...zeige);
    if (da) await s.page.evaluate((d) => __weltDa((0, eval)(d)), `${da}`);
    return s;
}
async function warteAufWelt(page, frist = 120000, server) {
    if (server) await server.zeige(page, frist, "index.html", "networkidle0");
    await page.waitForFunction(() => r && typeof r._gameLoopTick === "function", {
        timeout: frist,
    });
}

// Eine Taste HALTEN, bis `ziel` auf `seite` (Page oder Frame) wahr wird — nie nach der Wanduhr (gate:apparat Klinge 5); `taste`
// über die Tastatur, sonst `druck`/`los`; losgelassen wird immer. → { erreicht, ms, wert }
async function halteBis(seite, { taste, druck, los, ziel, args = [], frist = 30000 }) {
    const t0 = Date.now();
    await (druck ? druck() : seite.keyboard.down(taste));
    let erreicht = true;
    let wert = null;
    try {
        const h = await seite.waitForFunction(ziel, { timeout: frist, polling: 100 }, ...args);
        wert = await h.jsonValue().catch(() => null);
    } catch {
        erreicht = false;
    } finally {
        await (los ? los() : seite.keyboard.up(taste));
    }
    return { erreicht, ms: Date.now() - t0, wert };
}

// DER LESER IM BLICK (Seite): der Spieler am Bach der Mess-Wiese, zurück, sobald das Wasser ZEICHNET, das Tiefen-Abbild gezogen
// ist und das Weltbild steht (`welt`: nur diese Terme); `kappe`: die Pixel-Kappe des Holzes.
// DIE POST-KETTE STEHT (diag-post-kette, diag-ziel-zensus): der erste Frame mit bereitem Renderer und Kette; ohne
// WebGPU-Backend wirft sie mit dem Grund der Linse (`blind`), sonst nennt sie die Wartezeit im Lauf-Log
async function postKetteBereit(page, log, blind) {
    const ms = await page.evaluate(async (t0 = performance.now()) => {
        await __weltDa((w, s = w.state) => !!(s?.rendererReady && s.renderer?.backend && s.postProcessing && s.camera));
        return st.renderer.backend.isWebGPUBackend === true ? performance.now() - t0 : -1;
    });
    if (ms < 0) throw new Error("kein WebGPU-Backend — " + blind);
    log(`Renderer und Post-Kette bereit nach ${Math.round(ms / 1000)} s`);
}
async function uferStellen(opts) {
    await window.__weltDa(
        (w) =>
            w.state.rendererReady &&
            w.state.renderer &&
            w.state.renderer.backend &&
            w.state.camera &&
            w.state.playerMesh
    );
    if (st.renderer.backend.isWebGPUBackend !== true) return { fehler: "kein WebGPU-Backend — die Wand wäre blind" };
    if (opts.kappe != null) st._holzPixelCap = opts.kappe;
    const [mx, mz] = opts.messort;
    let h = null;
    await window.__weltDa((w) => (w._ensureHydroTilesAround(mx, mz, 200), (h = w._hydroFor(mx, mz)) && h.ready));
    let P = null;
    for (const f of h?.rivers || [])
        f.points.forEach((q, i) => {
            const d = Math.hypot(q.x - mx, q.z - mz);
            if (!P || d < P.d) P = { x: q.x, z: q.z, d, f, i };
        });
    if (!P || P.d > 300) return { fehler: "kein Bach an der Mess-Wiese" };
    const a = P.f.points[Math.max(0, P.i - 1)],
        b = P.f.points[Math.min(P.f.points.length - 1, P.i + 1)];
    const L = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const s = (b.x - a.x) * (mz - P.z) - (b.z - a.z) * (mx - P.x) < 0 ? -1 : 1; // die Normale zeigt zur Mess-Wiese
    const nx = (-(b.z - a.z) / L) * s,
        nz = ((b.x - a.x) / L) * s;
    const ux = P.x + nx * 12,
        uz = P.z + nz * 12;
    st.playerMesh.position.set(ux, r.getTerrainHeightAt(ux, uz) + 1.2, uz);
    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
    st.yaw = Math.atan2(-nx, -nz); // der Blick zum Wasser (`_blickVorn`: vorn = (sin yaw, cos yaw))
    st.pitch = -0.25;
    // DAS RUHENDE WASSER (`_ensureFarWaterSheet`): der ruhende Leser des Holzes voll — das Software-Holz schaltet es ab, sein
    // nahes Wasser frischt je Pass ohnehin auf; ohne das Fern-Wasser stünde kein Leser im Bild, an dem die Klasse hängt.
    st.atmosphere.farWater = null;
    r._ensureFarWaterSheet();
    const E = r._erstZeichnungStand();
    const sichtbaresWasser = () => {
        let n = 0;
        st.scene.traverse((o) => {
            if (o.isMesh && o.visible && o.material === st.hydroSurfaceMaterial && E.gezeichnet.has(o)) n++;
        });
        return n;
    };
    const abbild = () => {
        const t = r._szeneTiefeKnoten && r._szeneTiefeKnoten.value;
        return t?.image ? t.image.width : 0;
    };
    const fern = () => !!st.farWater?.mesh?.parent;
    const welt = (l) => !opts.welt || opts.welt.includes(l.term); // und die Szenen-Tiefe trägt die Welt, nie nur Himmel
    const steht = () => sichtbaresWasser() > 0 && abbild() > 1 && fern() && E.gezeichnet.has(st.farWater.mesh);
    // das EINE Warten (`__gebautNach`): Takt um Takt der Seite, bis Wasser, Abbild und Weltbild stehen (Deckel: Takte ohne Offenes)
    await window.__gebautNach("das Ufer im Blick", {
        fertig: () => steht() && !r._weltbildLuecken(true).some(welt),
        takt: async () => (fern() || r._ensureFarWaterSheet(), await sleep(100)),
        max: 600,
        warum: () =>
            `Wasser ${sichtbaresWasser()} · Abbild ${abbild()} · fern ${fern()} gezeichnet ${fern() && E.gezeichnet.has(st.farWater.mesh)} · offen ${r
                ._weltbildLuecken(true)
                .filter(welt)
                .map((l) => l.term)}`,
    });
    return {
        bach: [Math.round(P.x), Math.round(P.z)],
        wasser: sichtbaresWasser(),
        fernWasser: fern() ? st.farWater.quads : 0,
        abbildBreite: abbild(),
    };
}

// Die Bühne: Mittag · Sonne · Sommer fest (window.__buehne aus AUSGABE_INSTALL).
async function buehne(page) {
    const { AUSGABE_INSTALL } = require("./ausgabe-aufnahme.cjs");
    const da = await page.evaluate(() => typeof window.__buehne === "function");
    if (!da) await page.evaluate(AUSGABE_INSTALL);
    await page.evaluate(() => window.__buehne());
}

// DER PRÜFER EINER LINSE (die Zeile je Urteil): `check(name, ok, detail)` schreibt ✅/❌ und sammelt jedes Rot in `errs`.
function pruefer() {
    const errs = [];
    // ein Detail, das kein Text ist, schreibt die Prüfung selbst als JSON (kein JSON.stringify je Aufrufer)
    const check = (name, ok, detail) => {
        const z = typeof detail === "object" && detail ? JSON.stringify(detail) : detail;
        console.log(`  ${ok ? "✅" : "❌"} ${name}${z ? " — " + z : ""}`);
        if (!ok) errs.push(name);
    };
    return { errs, check, wandEnde };
}

// DAS ENDE EINER WAND: das EINE Urteil (`urteilEnde`) über die gesammelten Verletzungen — ROT mit Exit 1 und jeder
// Verletzung beim Namen, sonst der Grün-Satz mit Exit 0 (kein `process.exit(0)` danach).
function wandEnde(errs, satz) {
    urteilEnde(errs.length, `\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`, "\n✅ GRÜN — " + satz);
}
// DIE ROTE LISTE (`rotListe(v)`): je Verletzung eine Zeile, dann Exit 1; leer geht der Lauf weiter — bis w4-verkehr-c2
// viermal derselbe Zwilling (diag-post-kette, diag-takt-atem, diag-verdeckungs-abfrage, diag-ego-schatten)
function rotListe(v) {
    if (!v.length) return;
    console.log(`\n❌ ROT — ${v.length} Verletzung(en):`);
    for (const s of v) console.log("   • " + s);
    process.exit(1);
}
// DAS ENDE DER SEITE einer Linse (`await seiteZu(browser, server, out, kopf, feld = "error")`): Browser und Server zu, die
// Kopfzeile, dann ohne Befund oder mit Fehler am Feld „FEHLER:" und Exit 1 — bis w4-verkehr-c2 zehnmal derselbe Zwilling
// (diag-post-kette, diag-takt-atem, diag-erstarren, diag-gpu-zeit, diag-ego-schatten, diag-kamera-treue, diag-chunk-satz; am
// Feld `fatal` diag-reload-treue, diag-p2p-gestalt, diag-blick)
async function seiteZu(browser, server, out, kopf, feld = "error") {
    await browser.close();
    server.close();
    if (kopf) console.log(kopf);
    if (!out || out[feld]) {
        console.log("FEHLER:", out ? out[feld] : "?");
        process.exit(1);
    }
}

// DIE TÄTER-FÄLLE eines Selbsttests ohne Browser: je Fall `[name, tat, muss]` (die Tat an einem frischen `klon()`) oder
// `{ name, z, muss }` das Urteil; jedes `muss` (ein Muster oder eine Liste) trifft einen Befund, `null` verlangt keinen — sonst steht
// der Fall beim Namen in `fehler`. `selbsttestEnde` schließt: ROT mit Exit 1, sonst der Grün-Satz.
// Der Täter eines Falls ist eine Funktion des Klons oder seine TAFEL `[pfad, wert]` („a.b.0"): „pfad=" setzt den Wert, sonst
// mischt er sich in den Knoten, ohne Wert fällt der Pfad — bis w6-stoffe-k5 schrieb jede Wand je Täter ihre eigene Closure.
// `gruen`: der grüne Befund — er steht als erster Fall („der grüne Lauf", kein Befund verlangt) und ist der Klon jeder Tat
// (bis w25-lod-pop prüfte und klonte ihn jede Wand selbst).
function taeterFaelle(faelle, urteil, { fehler = [], klon, gruen } = {}) {
    if (gruen) [faelle, klon] = [[{ name: "der grüne Lauf", z: gruen }, ...faelle], () => jsonKlon(gruen)];
    for (const f of faelle) {
        const [name, tat, muss] = Array.isArray(f) ? f : [f.name, null, f.muss];
        const z = tat ? klon() : f.z;
        if (Array.isArray(tat)) {
            const p = tat[0].replace(/=$/, "").split(".");
            const o = p.slice(0, -1).reduce((x, k) => x[k], z);
            if (tat.length < 2) delete o[p.at(-1)];
            else if (tat[0].endsWith("=")) o[p.at(-1)] = tat[1];
            else Object.assign(o[p.at(-1)], tat[1]);
        } else if (tat) tat(z);
        const v = alsSelbsttest(() => urteil(z));
        const fehlt =
            muss == null ? v.slice(0, v.length && 1) : [].concat(muss).filter((re) => !v.some((s) => re.test(s)));
        for (const re of fehlt) fehler.push(`${name}: die Wand nennt den Täter nicht (${re})`);
        console.log(
            `  ${fehlt.length ? "❌" : "✅"} Selbsttest „${name}" → ${muss == null ? "grün" : "rot"}: ${v.join(" · ") || "(nichts)"}`
        );
    }
    return fehler;
}
// DIE ABWANDLUNG eines grünen Befunds (der Täter eines Falls `{ name, z: mit(pfad, wert), muss }`): ein frischer Klon, `wert`
// gemischt in den Knoten unter `pfad` („a.b", leer = die Wurzel) — EINMAL hier statt eines Klon-Helfers je Linse
const abwandlung = (gruen) => (pfad, wert) => {
    const z = jsonKlon(gruen);
    Object.assign(pfad ? pfad.split(".").reduce((o, k) => o[k], z) : z, wert);
    return z;
};
// DIE TAFEL EINES SELBSTTESTS (`const { t, ende } = selbstTafel()`): `t(name, ok)` trägt einen Fall ein, `ende(satz)` schreibt jede
// Zeile und schließt mit `selbsttestEnde` — bis w26-winter-fichte-2 derselbe Zwilling in diag-albedo-tafel und diag-profiband
function selbstTafel(tests = []) {
    const ende = (satz) => {
        for (const x of tests) console.log(`${x.ok ? "✅" : "❌"} SELBST-TEST: ${x.name}`);
        selbsttestEnde(tests.filter((x) => !x.ok).map((x) => x.name), `${satz} (${tests.length}/${tests.length})`);
    };
    return { t: (name, ok) => tests.push({ name, ok: !!ok }), ende };
}
// DIE BRÜCHE EINES GESUNDEN BEFUNDS (`bruchFaelle(check, faelle)`): je Fall `[kurz, urteil, gesund, brueche]` nennt der gesunde
// Befund keinen Täter, jeder Bruch `[name, mischung, soll]` (in den gesunden gemischt) einen, der mit `soll` beginnt — bis
// w26-winter-fichte-2 dieselbe Schleife in diag-ankunft und diag-v1-pfad
function bruchFaelle(check, faelle) {
    for (const [kurz, urteil, gesund, brueche] of faelle) {
        const g = alsSelbsttest(() => urteil(gesund));
        check(`Selbst-Test ${kurz}: gesund == 0 Täter`, !g.length, g.join(" · "));
        for (const [name, bruch, soll] of brueche) {
            const v = alsSelbsttest(() => urteil(Object.assign({}, gesund, bruch)));
            check(`Selbst-Test ${kurz}: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
    }
}
// DAS URTEIL EINER PROBE (`probeUrteil(check, kurz, name, m, urteil, zeile)`): ihre Ausnahme ist ROT, sonst stehen die Täter des
// `urteil`s beim Namen, `zeile` das Detail der gestarteten Probe — bis w26-winter-fichte-2 derselbe Zwilling in diag-ankunft und diag-v1-pfad
function probeUrteil(check, kurz, name, m, urteil, zeile, mm = m || {}) {
    if (mm.err) check(`${kurz} Probe ohne Ausnahme`, false, mm.err.split("\n")[0]);
    const v = urteil(mm);
    check(`${kurz} ${name}`, !v.length, `${mm.gestartet ? zeile(mm) : "nicht gestartet"}${v.length ? " — Täter: " + v.join(", ") : ""}`);
}
function selbsttestEnde(fehler, satz = "jeder injizierte Täter fällt rot und wird beim Namen genannt.") {
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — " + satz);
}

// DAS FEHLER-WORT eines Kinds, das vor seiner Bereitschaft endete: seine letzte ABSTURZ-Zeile (`hauptLauf`), sonst das erste
// Fehler-Wort (EADDRINUSE, „Error: …“), sonst sein Ende — der EINE Leser für den Dienst (`startProc`) und die Werkbank (`werkbankTor`)
const fehlerWort = (text) => {
    const t = String(text);
    const wort = (t.match(/[^\n]*ABSTURZ[^\n]*/g) || []).pop() || (t.match(/\b(E[A-Z]{4,}|Error: [^\n]+)/) || [])[0];
    return (wort || t.slice(-200)).trim().slice(0, 300);
};
// DER DIENST ALS KIND (save-server, signaling-server): `script` (relativ zur Wurzel, `vor` davor, in `cwd`) mit `env` — bereit,
// sobald seine Ausgabe `bereit` trifft; endet er vorher, ROT mit seinem Fehler-Wort (EADDRINUSE). Das Urteil fällt am Ereignis,
// nie an einer Frist (K-WANDUHR).
function startProc(script, bereit, env = {}, { vor = [], cwd = ROOT } = {}) {
    return new Promise((resolve, reject) => {
        const proc = require("child_process").spawn(process.execPath, [...vor, path.resolve(ROOT, script)], {
            cwd,
            stdio: ["ignore", "pipe", "pipe"],
            env: Object.assign({}, process.env, env),
        });
        let fehler = "";
        proc.stderr.on("data", (c) => (fehler = (fehler + c).slice(-2000)));
        const ende = (code) =>
            reject(new Error(`${script} endete vor seiner Bereitschaft (Code ${code}): ${fehlerWort(fehler)}`));
        proc.stdout.on("data", (chunk) => bereit.test(chunk.toString()) && (proc.off("exit", ende), resolve(proc)));
        proc.on("exit", ende);
        proc.on("error", reject);
    });
}
// DIE EIGENEN PORTS einer Linse mit eigenem Server: je ihre Variable, sonst ein freier des Systems (alle zugleich gehalten) — nie
// 4312/4313, die Server des Schöpfers (lief `npm start`, fiel gate:taille nach 5 s mit „server timeout").
async function eigenePorte(...variablen) {
    const halt = [];
    const frei = () =>
        new Promise((ok, nein) => {
            const s = require("net").createServer();
            halt.push(s);
            s.on("error", nein);
            s.listen(0, "127.0.0.1", () => ok(s.address().port));
        });
    try {
        return await Promise.all(variablen.map((v) => (Number(process.env[v]) > 0 ? Number(process.env[v]) : frei())));
    } finally {
        await Promise.all(halt.map((s) => new Promise((ok) => s.close(() => ok()))));
    }
}
// DER EINE ABSTURZ-FÄNGER: `hauptLauf(async () => …)` fährt den Rumpf eines Skripts; wirft er, nennt die Zeile das Skript beim
// Namen mit dem Stapel, `zuletzt` räumt eigene Kinder-Prozesse, und der Lauf endet mit 2 — nie still grün (Lehre 6)
const hauptLauf = (rumpf, zuletzt) =>
    rumpf().catch((e) => {
        console.error(`${path.basename(process.argv[1] || "-e")} ABSTURZ:`, e?.stack || e);
        if (zuletzt) zuletzt();
        process.exit(2);
    });
// DER EINE DATEI-LESER einer Linse: `ausDatei(p)` der Text (utf8), sein JSON liest `jsonLesen` durch ihn — `p` ab der Wurzel des
// Baums oder absolut (bis zur Decke w3w-studios las jede Linse in eigenen Zeilen: fs.readFileSync(…, "utf8"), 86-mal)
const ausDatei = (p) => fs.readFileSync(path.resolve(ROOT, p), "utf8");
// DER EINE SCHALTER des Selbsttests jeder Linse (`--selftest`; bis zur Decke w3w-studios las ihn jede Linse selbst, 76-mal)
const SELBSTTEST = process.argv.includes("--selftest");
// DER EINE ARGUMENT-LESER einer Linse: `argOpt("--port", 4490)` — der Wert hinter dem Schalter, fehlt er (oder folgt ein
// Schalter), die Vorgabe
const argOpt = (k, d) => {
    const a = process.argv;
    const i = a.indexOf(k);
    return i >= 0 && a[i + 1] && !a[i + 1].startsWith("--") ? a[i + 1] : d;
};
// DAS EINE URTEIL AM ENDE einer Linse: `urteilEnde(rot, roteZeile, grueneZeile)` — rot (Zahl, Liste der Länge oder wahr) nennt die
// rote Zeile auf stderr und endet mit Exit 1, sonst die grüne auf stdout mit Exit 0 (Lehre 9: der Exit spricht); eine Zeile, die
// nur auf ihrer Seite gilt (sie liest den Befund), steht als Funktion und wird erst dort gelesen
const urteilEnde = (rot, roteZeile, grueneZeile) => {
    const z = (x) => (typeof x === "function" ? x() : x);
    if (rot) {
        console.error(z(roteZeile));
        process.exit(1);
    }
    console.log(z(grueneZeile));
    process.exit(0);
};
// DER ABBRUCH DER SEITE (`const abbrechen = await seitenAbbruch(page)`, w18-mensch-deckel; der Leser: die Werkbank, wenn ein Rufer
// stirbt): eine eigene CDP-Sitzung, angelegt, solange die Seite ruht (an einem belegten Faden legt der Browser keine neue an) —
// `Runtime.terminateExecution` stellt er am Haupt-Faden vorbei zu und beendet, was eben rechnet; dann zählt die Epoche des Abbruchs in
// der Seite hoch (`__abbruchEpoche`): jeder Schlaf, der vor ihr begann, wirft beim Erwachen (`sleep`), die Arbeit, die eben wartete,
// endet an ihrem nächsten Schritt. Antwortet die Seite nicht binnen 2 s (eine wartende Arbeit begann eben ihren nächsten synchronen
// Schritt), bricht `abbrechen` noch einmal ab, höchstens 5-mal. Rückgabe die Zahl der Abbrüche bis zur Antwort (0: keine)
async function seitenAbbruch(page) {
    const cdp = await page.target().createCDPSession();
    let e = 0;
    return async () => {
        e++;
        for (let i = 1; i <= 5; i++) {
            await cdp.send("Runtime.terminateExecution").catch(() => 0);
            if (await Promise.race([page.evaluate((n) => (window.__abbruchEpoche = n), e).then(() => 1, () => 0), sleep(2000)])) return i;
        }
        return 0;
    };
}
// DER EINE RUF an die Werkbank (POST JSON, ohne Frist; kein JSON: `{ roh }`) — der Rufer trägt seine Arbeit (`x-rufer: traegt`):
// stirbt er vor der Antwort, bricht die Werkbank sie in der Seite ab (`seitenAbbruch`)
function werkbankRuf(port, weg, nutzlast) {
    return new Promise((res, rej) => {
        const req = http.request(
            { host: "127.0.0.1", port, path: weg, method: "POST", headers: { "Content-Type": "application/json", "x-rufer": "traegt" } },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch {
                        res({ roh: d });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(0);
        req.end(JSON.stringify(nutzlast || {}));
    });
}
// --teil=k/n: Teil k von n Gruppen der CI, ohne --teil null (alles)
function teilAus(argv) {
    const a = argv.find((x) => x.startsWith("--teil="));
    if (!a) return null;
    const m = /^--teil=(\d+)\/(\d+)$/.exec(a);
    if (!m || !(+m[1] >= 1 && +m[1] <= +m[2])) throw new Error(`${a}: erwartet --teil=k/n mit 1 <= k <= n`);
    return { k: +m[1], n: +m[2] };
}
// DIE WERKBANK ALS TOR: `werkbank start`, bereit am Ereignis; jeder Befehl ohne Frist (ein Hänger endet am protocolTimeout der Seite)
function werkbankTor(port, zusatz = []) {
    const cp = require("child_process");
    const wb = path.join(ROOT, "scripts", "werkbank.cjs");
    const env = Object.assign({}, process.env, { WERKBANK_PORT: String(port) });
    const kind = cp.spawn(process.execPath, [wb, "start", "--port", String(port), ...zusatz], { env });
    const tor = {
        log: "",
        rufe: (args, ms) => cp.spawnSync(process.execPath, [wb, ...args], { env, encoding: "utf8", timeout: ms }),
    };
    tor.bereit = new Promise((ok, nein) => {
        for (const s of [kind.stdout, kind.stderr]) s.on("data", (d) => /WERKBANK bereit/.test((tor.log += d)) && ok());
        // endet sie vorher, mit ihrem Fehler-Wort (w28-stamm-krone: die GPU-Probe 21783ddb las nur „Exit 1" nach 13 s — der Grund
        // stand in der verschluckten Ausgabe des Kinds)
        kind.on("exit", (c) => nein(new Error(`die Werkbank endete vor dem Start (Exit ${c}): ${fehlerWort(tor.log)}`)));
    });
    tor.stop = () => (tor.rufe(["stop"], 30000), kind.kill());
    return tor;
}
// wartet, bis `fn(...args)` in der Seite wahr ist (das Ereignis, je 150 ms gefragt), und gibt die Wartezeit zurück — ohne Frist:
// ein Hänger endet an der Frist des Browsers (`frist` = protocolTimeout), die Stall-Akte nennt ihn mit `label`
async function waitFor(page, fn, label, ...args) {
    const t0 = Date.now();
    await page.evaluate((l) => (window.__weltDaWartet = l), label).catch(() => {});
    await page.waitForFunction(fn, { polling: 150, timeout: 0 }, ...args);
    await page.evaluate(() => (window.__weltDaWartet = null)).catch(() => {});
    return Date.now() - t0;
}

// DER BOOT, BIS DIE WELT STEHT (diag-pruefbuehne · diag-worker-dichte; der Null-Renderer: die Probe braucht Main und Worker,
// kein Bild): nach dem Erwachen (`__weltDa`) Takte des Spiels, bis mehr als 4 Chunks stehen und der Worker den Worldgen-
// Stand trägt — {ok, ms, seed}; am Deckel `name` (7,5 s) {ok: false}
function booteWelt(page, name = "der Boot der Welt") {
    return page.evaluate(async (name) => {
        const start = performance.now();
        await window.__weltDa();
        for (const weiter = window.__deckel(name, 7500); weiter();) {
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch {
                    /* der Boot reift */
                }
                const s = st;
                if (s?.voxelChunks?.size > 4 && s.voxelWorkerReady && s.voxelWorkerWorldgenSynced)
                    return { ok: true, ms: Math.round(performance.now() - start), seed: s.worldMeta.seed };
            }
            await sleep(16);
        }
        return { ok: false };
    }, name);
}

// DIE TÜR DER WELT — die EINE Stelle, an der eine Linse die Welt ihrer Seite wechselt: durch die Tür des Spiels, `welt` als
// Snapshot (`importWorldBeside(welt, {reload: true})`: daneben gelegt) oder als liegende worldId (`switchToWorld`), beide über
// `_weltWechsel` (die Sperre, der Zeiger, der Speicher-Faden still, der Tausch am Ort — seit tore-k5-tuer lädt die Seite nicht
// neu), bis die Ziel-Welt erwacht (`erwacht`, das Versprechen des Tauschs) → ihre worldId; ein Hänger endet an der Frist des
// Browsers. Bricht der Tausch, lädt die Seite neu, und die Tür öffnet NICHT: sie nennt den Satz des Melders (`_bruchBuch`) —
// bis heute wartete sie auf die worldId und hieß den Rückfall gut. Bis heil-glanz setzten fünf Linsen den Zeiger selbst und
// luden selbst neu: ein Leerlauf-saveState der alten Seite dazwischen setzte ihn auf die lebende Welt zurück (`saveState` →
// `activeWorldSet`), und die Prüfbühne erwachte als Wildnis (CI 40970322757) — die Tür-Wand im Selbsttest nennt jeden eigenen Zeiger.
async function weltTor(page, welt) {
    const res = await page.evaluate(async (w) => {
        const r = await window.__weltDa();
        const x = typeof w !== "string" ? r.importWorldBeside(w, { reload: true }) : r.switchToWorld(w, { reload: true }) ? { ok: true, worldId: w } : { ok: false, reason: `keine Welt ${w}` }; // prettier-ignore
        return x?.ok && !(await r.erwacht) ? { reason: [...r._bruchBuch.keys()].pop() } : x;
    }, welt);
    if (!res || !res.ok) throw new Error(`die Tür der Welt öffnete nicht: ${res?.reason || "kein Ergebnis"}`);
    return res.worldId;
}

// ZWEI SEITEN IM MESH (smoke-webrtc · smoke-copresence): save- und signaling-server auf den eigenen Ports (`eigenePorte` der
// Variablen portEnv, signalEnv), im Browser des Aufrufers (sein Rezept) die Seiten A und B (1024×640); beide laden das Spiel, bis init
// durchlief (`_gameLoopTick`: init wartet auf den IndexedDB-Vorlauf, BEVOR es die Welt wählt und die Auto-Verbindung prüft —
// ein Raum-Beitritt davor fiele in init hinein), `vor(seite, i)` läuft vor dem Beitritt (die Namen der Ko-Präsenz), dann
// tritt jede demselben Raum bei (der roomOverride zwingt Seiten verschiedener worldId zusammen), bis beide `meshActive`
// melden (alle Peer-Kanäle offen). Liefert {seiten, peerIds, ende}; `ende` schließt Browser und Server.
async function zweiImMesh(browser, portEnv, signalEnv, raum, vor = async () => {}) {
    const [port, signal] = await eigenePorte(portEnv, signalEnv);
    const env = { PORT: String(port), ANAZH_SIGNALING_PORT: String(signal) };
    const server = [
        await startProc("save-server.js", /läuft/, env),
        await startProc("signaling-server.js", /lauscht/, env),
    ];
    const ende = async () => (await browser.close().catch(() => {}), server.forEach((p) => p.kill()));
    try {
        const [seiten, peerIds] = [[await browser.newPage(), await browser.newPage()], []];
        for (const p of seiten) {
            await p.setViewport({ width: 1024, height: 640 });
            await p.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        }
        for (const [i, p] of seiten.entries()) {
            const r = () => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function";
            await waitFor(p, r, `Seite ${"AB"[i]} initialisiert`);
            await vor(p, i);
            const beitritt = (url, roomOverride) => {
                const r = window.anazhRealm;
                Object.assign(r.state.p2p, { url, roomOverride });
                r.initP2PSync(null);
                return r.state.p2p.peerId;
            };
            peerIds.push(await p.evaluate(beitritt, `ws://127.0.0.1:${signal}`, raum));
        }
        for (const [i, p] of seiten.entries())
            await waitFor(p, () => st.p2p.meshActive === true, `Mesh auf ${"AB"[i]} aktiv`);
        return { seiten, peerIds, ende };
    } catch (e) {
        await ende();
        throw e;
    }
}

// DIE WARTE-WAND der Linsen (gate:altlasten, K-WANDUHR): ROT eine Schleife, die selbst auf einen Bau wartet, eine Wanduhr-Frist
// (`performance.now()`/`Date.now()` im Kopf oder als break/return/throw), ein geschluckter `__gebautNach`; der REST
// (spec/ci/frist-rest.json) schrumpft nur.
const BAU = /^(instanced|mesh|instSlots|_hausHuelle)$/;
const hat = (x, f) => {
    let j = false;
    wandere(x, (c) => {
        j = j || !!f(c);
    });
    return j;
};
const uhr = (c) =>
    c.type === "CallExpression" &&
    c.callee.property &&
    c.callee.property.name === "now" &&
    /^(performance|Date)$/.test(c.callee.object.name);
const frist = (t) =>
    hat(
        t,
        (b) => b.type === "BinaryExpression" && /^[<>]=?$/.test(b.operator) && (hat(b.left, uhr) || hat(b.right, uhr))
    );
function scanWarteWand(dateien, rest = Object.assign({}, ...Object.values(require("../../spec/ci/frist-rest.json")))) {
    const errs = [];
    for (const [name, src] of dateien) {
        const schleifen = [];
        const fristen = new Set();
        wandere(ast(src), (n) => {
            if (/^(For|While|DoWhile)Statement$/.test(n.type)) {
                schleifen.push(n);
                if (n.test && frist(n.test)) fristen.add(n);
                const bau =
                    n.test &&
                    hat(
                        n.test,
                        (b) =>
                            b.operator === "!" &&
                            hat(b.argument, (x) => x.object?.type === "Identifier" && BAU.test(x.property.name))
                    );
                if (bau && name !== "scripts/lib/welt-boot.cjs")
                    errs.push(
                        `Warte-Wand: ${name}:${zeileVon(src, n.start)} wartet selbst auf einen Bau — das EINE Warten ist \`__gebautNach\``
                    );
            } else if (
                n.type === "IfStatement" &&
                frist(n.test) &&
                hat(n.consequent, (c) => /^(Break|Return|Throw)Statement$/.test(c.type))
            ) {
                const s = schleifen.filter((l) => l.body.start <= n.start && n.end <= l.body.end).pop();
                if (s) fristen.add(s);
            } else if (n.type === "CallExpression" && n.callee.property?.name === "catch") {
                const w = n.callee.object;
                const o = w.callee?.property?.name === "waitForFunction" && w.arguments[1];
                const f = n.arguments[0];
                const wirft = f && hat(f, (c) => c.type === "ThrowStatement");
                if (o && !wirft && (o.properties || []).some((p) => p.key?.name === "timeout" && p.value.value !== 0))
                    fristen.add(n);
                else if (
                    hat(w, (c) => (c.property || c).name === "__gebautNach") &&
                    f &&
                    f.body &&
                    f.body.type === "BlockStatement" &&
                    !f.body.body.length
                )
                    errs.push(
                        `Warte-Wand: ${name}:${zeileVon(src, n.start)} schluckt den Deckel von \`__gebautNach\` — er wirft beim Namen`
                    );
            }
        });
        const zeilen = [...fristen].map((n) => zeileVon(src, n.start));
        const soll = rest[name] || 0;
        if (zeilen.length > soll)
            errs.push(
                `Warte-Wand: ${name}:${zeilen.join(",")} urteilt an der Wanduhr (${zeilen.length} Frist-Schleifen, REST ${soll}) — das EINE Warten ist \`__deckel\` / \`__weltDa\``
            );
        else if (zeilen.length < soll)
            errs.push(
                `Warte-Wand: ${name} trägt nur ${zeilen.length} von ${soll} Frist-Schleifen im REST — die Zahl senken (sie schrumpft nur)`
            );
    }
    for (const name of Object.keys(rest))
        if (!dateien.some(([n]) => n === name))
            errs.push(`Warte-Wand: ${name} steht im REST, die Datei fehlt — streichen`);
    return errs;
}

// DIE ANTWORT DES SPIELERS (spielgang.K5): window.confirm/prompt/alert fielen — die Welt fragt über ihre eigene Oberfläche
// (#frage-dialog, `_frage`). Eine Linse, die bisher `page.on("dialog", (d) => d.accept())` sagte, legt `frageJa` vor die Seite
// (`evaluateOnNewDocument`/`addInitScript`) oder ruft es in der stehenden Seite (`evaluate`): jede Frage bekommt ihr Ja.
function frageJa() {
    const an = () => {
        const d = document.getElementById("frage-dialog");
        if (!d) return;
        new MutationObserver(() => {
            if (d.open) d.querySelector("#frage-ja").click();
        }).observe(d, { attributes: true, attributeFilter: ["open"] });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", an);
    else an();
}

module.exports = {
    mass,
    alsSelbsttest,
    eichMs,
    OFEN_KERNE,
    ENGINE_MODUL,
    ENGINE_THREE,
    frageJa,
    fs,
    path,
    stammLib,
    pufferLesen,
    crypto: require("crypto"),
    os,
    vm: require("vm"),
    studioKern,
    fadenScope,
    scanWarteWand,
    ROOT,
    MIME,
    REZEPTE,
    GPU_REZEPTE,
    CODE_OF_SEITE,
    WARTEN_SEITE,
    pngDatei,
    statikServer,
    ortZug,
    starteBrowser,
    startePuppeteer,
    tempNeu,
    lebt,
    loesche,
    warteAufWelt,
    nullRenderer,
    nullSeite,
    nullWelt,
    halteBis,
    buehne,
    uferStellen,
    postKetteBereit,
    rahmen,
    pruefer,
    taeterFaelle,
    bruchFaelle,
    selbstTafel,
    probeUrteil,
    abwandlung,
    selbsttestEnde,
    wandEnde,
    rotListe,
    seiteZu,
    startProc,
    eigenePorte,
    sleep,
    laufUhr,
    jsonLesen,
    jsonSchreiben,
    jsonKlon,
    fehlerText,
    fehlerStapel,
    hauptLauf,
    urteilEnde,
    argOpt,
    ausDatei,
    SELBSTTEST,
    waitFor,
    zweiImMesh,
    booteWelt,
    weltTor,
    werkbankTor,
    werkbankRuf,
    seitenAbbruch,
    teilAus,
    selbsttest: (name) => (sammlung.selbsttest = name),
    taeter,
    bruchBuch,
};

// DER SELBSTTEST DER STALL-AKTE (gate:welt-boot, Null-Rezept): eine JS-Schleife steht als JS-SCHLEIFE mit Namen in der Akte, ein
// nie erfülltes Versprechen als AWAIT, ein kurzer Block (0,8 s) trägt KEINE Akte.
// DER GEBROCHENE GUSS (w28-leib-kanon; Mutante „ein Guss wirft"): die Brücke antwortet mit dem Grund (`bruch`), der Stamm (die
// EINE Schale `_foundryRequest` + `_foundryAntwort`, `ladeKlasse`) legt ihn in `f.gebrochen`, stellt denselben Körper nie neu
// und die Welt nennt ihn (`_weltStandTakt`) — bis hier antwortete die Brücke leer und ein Bewohner wurde 10 109-mal bestellt.
async function gebrochenProbe() {
    const { AnazhRealm: A } = require("./stamm.cjs").ladeKlasse(ROOT);
    const logs = [];
    const r = Object.assign(Object.create(A.prototype), { state: {}, log: (t) => logs.push(String(t)) });
    const f = (r._foundry = { ready: true, worker: {}, pending: new Map() });
    Object.assign(r, { _foundryUhren() {}, _foundryLiefer() {}, _foundryIngestTakt: (x) => x, _foundryGestaltOv: (ov) => ov });
    let posts = 0;
    r._foundryWorkerRequest = () =>
        new Promise((ok) => {
            const reqId = "q" + ++posts;
            f.pending.set(reqId, ok);
            r._foundryAntwort(f, { type: "asset", reqId, presetId: "mensch", lod: 0, meshes: [], bruch: "mensch L0: LEIB-HAUT (Mutante)" });
        });
    const ov = { dials: { kopf: 0.9 } };
    const a = [await r._foundryRequest("mensch", 0, 0, ov, 5), await r._foundryRequest("mensch", 0, 0, ov, 5)];
    Object.assign(r, { _standGeht: () => null, _weltOffen: () => ({}) });
    r._weltStandTakt();
    return { posts, leer: a.every((x) => x === null), grund: r._weltStand.grund, laut: logs.some((t) => /^DER BAU IST GEBROCHEN: mensch L0: LEIB-HAUT/.test(t)) };
}
async function selbsttest() {
    const gb = await gebrochenProbe();
    // DER WURF IM TAKT (wirft.html): die Fehler-Grenze, der Melder und das Log des STAMMS selbst (`methodeAm`, nie ein abgeschriebener
    // Satz — ändert der Stamm sein Wort, fällt der blinde Sammler hier) — sieben Würfe an der Grenze, einer am Hand-Takt vorbei
    const S = stammLib.text(ROOT);
    const glied = (n) => ((m) => `${n}(${m.args}){${m.rumpf}}`)(stammLib.methodeAm(S, n));
    const boot = stammLib.ast(S).body.find((n) => n.type === "FunctionDeclaration" && n.id?.name === "_bootAnazhRealm");
    if (!boot) throw new Error("der Boot des Stamms (`_bootAnazhRealm`) ist fort — die Wache des gebrochenen Boots hört nichts mehr");
    const bootSeite = (init, danach = "") =>
        `<!doctype html><meta charset="utf-8"><script>window.THREE={};class AnazhRealm{init(){return ${init}}_sprachWahlInit(){}_ladeschirmStand(){}_t(k,o){return k+": "+(o&&o.grund)}};${S.slice(boot.start, boot.end)};_bootAnazhRealm();${danach}</script>`;
    const seiten = {
        "/ruhig.html":
            "<!doctype html><script>setTimeout(function(){var e=performance.now()+800;while(performance.now()<e){}},300)</script>",
        "/schleife.html":
            "<!doctype html><script>function __stallSchleife(){var e=performance.now()+7000;while(performance.now()<e){}}setTimeout(__stallSchleife,300)</script>",
        "/haenger.html": "<!doctype html><script>window.__nie=function(){return new Promise(function(){})}</script>",
        // DER BOOT, DER BRICHT (w28-seiten-tod): der ECHTE Boot des Stamms (`_bootAnazhRealm`, aus seinem Syntaxbaum — ändert der
        // Stamm sein Versprechen, fällt die Wache hier) an einer Seite ohne Welt; init wirft den Satz des Kerns am alten Leser, oder
        // init steht und ein Welt-Wechsel bricht danach (kein gebrochener Boot); `__takt` ist der erste Takt, auf den die Linse wartet
        "/bricht.html": bootSeite("Promise.reject(new Error('KERN-PFLICHT: leibGroesse ohne height/mass/tone'))"),
        "/steht.html": bootSeite(
            "new Promise((ok) => setTimeout(ok, 300))",
            "setTimeout(() => (anazhRealm.erwacht = Promise.resolve(false)), 1200); setTimeout(() => (window.__takt = 1), 2500);"
        ),
        "/abbruch.html":
            "<!doctype html><script>__los=()=>{(async()=>{for(;;)await sleep(20)})().catch((x)=>(__wort=x.message));setTimeout(()=>{for(const e=performance.now()+6e3;performance.now()<e;);},200)}</script>",
        "/wirft.html": `<!doctype html><meta charset="utf-8"><script>setTimeout(function(){console.log('[ERROR] STOFF: die Post-Kette');AnazhRealm={BRUCH_BUCH_MAX:9,BRUCH_WIEDER_MS:50};anazhRealm={state:{logBuffer:[],displayedLogs:[]},flushLog(){},${["log", "_bruchMelden", "_loopErrorBoundary"].map(glied)},_gameLoopTick(){throw Error('__handWurf')}};for(i=7;i--;)r._loopErrorBoundary(Error('__taktWurf'));__handTakt();throw new Error('__seitenWurf')},50)</script>`,
    };
    const server = statikServer({ seiten });
    await server.lausche(0);
    const browser = await starteBrowser({ art: "null", frist: 7000, stallMs: 3000 });
    const fall = async (pfad, tu, vor) => {
        const page = await browser.newPage();
        if (vor) await vor(page);
        await server.zeige(page, undefined, pfad.slice(1), "load");
        await tu(page);
        const id = page.__akte.id;
        await page.close().catch(() => {});
        return akten.filter((a) => a.seite === id);
    };
    // LANGSAM: der Bau steht nach 3,2 s, das Warten hält; TOT: nichts offen, ROT beim Namen; REGLER: das Einschwingen hält den
    // atmenden Regler und gibt ihn frei (die ruhige Seite, 4,5 s).
    let bau = null;
    const bauProbe = async () => {
        const r = (window.anazhRealm = {
            _weltStand: { takte: 0 },
            offen: 1,
            _gameLoopTick() {},
            _archIsRendered: (e) => !!e.mesh,
            _weltOffenAkte: String, // die Akte des Offenen, die der Deckel nennt (ohne Welt leer)
        });
        r._rebuildArchitectureMesh = (e) => e.ab != null && performance.now() >= e.ab && (e.mesh = {});
        r._weltOffen = () => ({ foundry: 0, chunks: 0, wald: 0, karten: r.offen });
        const takt = () => sleep(10);
        const langsam = { type: "langsam", id: 1, ab: performance.now() + 3200 };
        const t0 = performance.now();
        const takte = await window.__gebautNach(langsam, { max: 5, takt }).catch((x) => x.message);
        const aus = { langsam: { takte, steht: !!langsam.mesh, ms: Math.round(performance.now() - t0) } };
        r.offen = 0;
        r._weltbildFehlt = () => ["das Licht des Orts wird gemessen"];
        aus.tot = await window.__gebautNach({ type: "tot", id: 2 }, { max: 5, takt }).then(
            (n) => `steht nach ${n} Takten`,
            (x) => x.message
        );
        // HÄNGT: eine Karte bleibt offen und rührt sich nie
        r.offen = 1;
        try {
            for (const weiter = window.__deckel("haenger", 5); weiter(););
        } catch (x) {
            aus.haengt = x.message;
        }
        r.offen = 0;
        let still = 0;
        r.state = { renderer: {}, perfRegulator: true };
        r._weltSteht = () => still >= 30;
        r._bepflanzungWartet = () => false;
        const atmet = async () => (still = r.state.perfRegulator === false ? still + 1 : 0);
        aus.regler = await window.__weltStehtNach(atmet, 300).then(
            (n) => `steht nach ${n} Takten`,
            (x) => x.message.slice(0, 60)
        );
        aus.frei = r.state.perfRegulator === true;
        r._foundry = { gebrochen: new Map([["mensch|0|0", "mensch L0: LEIB-HAUT (Mutante)"]]) };
        aus.gebrochen = await window.__weltStehtNach(atmet, 300).then((n) => `steht nach ${n} Takten`, (x) => x.message);
        r._foundry = null;
        return aus;
    };
    // DIE WEICHE: ohne GPU-Arbeit ist ein Echt-Rezept ROT beim Namen, EIN Draw-Aufruf (der Haken) trägt es
    const weiche = [];
    let seitenSchlaf = null;
    const ruhig = await fall("/ruhig.html", async (p) => {
        [bau] = await Promise.all([p.evaluate(bauProbe), sleep(4500)]);
        seitenSchlaf = await p.evaluate(async () => (await sleep(1), String(sleep)));
        weiche.push(await weicheUrteil(browser, "echt"));
        await p.evaluate(() => WebGL2RenderingContext.prototype.drawArrays.call(null)).catch(() => {});
        weiche.push(await weicheUrteil(browser, "echt"));
    });
    // DIE AKTE HÄLT DIE SEITE NIE AN: ein Zeuge mit eigenem Debugger zählt jede Pause der Seite (eine Pause im Frame tötet die
    // Leinwand, die er noch einreicht — „Destroyed texture … used in a submit", w9-ziel-leben); der Stapel kommt ohne sie
    let pausen = 0;
    const schleife = await fall(
        "/schleife.html",
        async () => {
            for (let i = 0; i < 30 && !akten.some((a) => a.urteil); i++) await sleep(500);
            await sleep(500);
        },
        async (page) => {
            const zeuge = await page.createCDPSession();
            zeuge.on("Debugger.paused", () => pausen++);
            await zeuge.send("Debugger.enable");
        }
    );
    const haenger = await fall("/haenger.html", (p) => p.evaluate(() => window.__nie()).catch(() => {}));
    // DER ABBRUCH (w18-mensch-deckel, `seitenAbbruch`): in der Seite ein synchroner Schritt (6 s Schleife, wie der Tag der Probe bewohner
    // nach dem Deckel) und eine wartende Arbeit (Schlaf um Schlaf) — nach dem Abbruch antwortet die Seite binnen 2,5 s, und die wartende
    // Arbeit steht still beim Wort ihres Schlafs. Die MUTANTE: die CDP-Sitzung schweigt (kein terminateExecution) und die Seite schläft
    // mit dem Schlaf von vorher (ohne Epoche) — ROT beim Namen
    const abbruchProbe = async (stumm) => {
        const p = await browser.newPage();
        await server.zeige(p, undefined, "abbruch.html", "load");
        const ab = await seitenAbbruch(stumm ? { target: () => ({ createCDPSession: async () => ({ send: async () => 0 }) }), evaluate: p.evaluate.bind(p) } : p); // prettier-ignore
        await p.evaluate((s) => (s && (sleep = (ms) => new Promise((r) => setTimeout(r, ms))), __los()), stumm);
        await sleep(500);
        const t0 = Date.now();
        await ab();
        const ms = Date.now() - t0;
        await sleep(100);
        const wort = await p.evaluate(() => window.__wort);
        await p.close();
        return ms < 2500 && /^ABGEBROCHEN/.test(wort) ? "" : `${ms} ms, ${wort}`;
    };
    const [abbruch, abbruchMutante] = [await abbruchProbe(), await abbruchProbe(true)];
    // DER EINE SAMMLER: der Wurf einer Seite (auch in einem eigenen Kontext) steht beim Namen in der Liste und macht das
    // Prozess-Ende ROT — ein eigener pageerror-Sammler einer Linse daneben ist ein Zwilling (werkbank.cjs startet sein Fenster selbst)
    const kontext = await browser.createBrowserContext();
    await server.zeige(await kontext.newPage(), undefined, "wirft.html", "load");
    await sleep(400);
    const [wurf, kette, takt] = [/__seitenWurf/, /^post-kette: /, /^loop-wurf: /].map((re) => taeter(re));
    const code = fs
        .readdirSync(path.join(ROOT, "scripts"), { recursive: true })
        .map((f) => f.replace(/\\/g, "/"))
        .filter((f) => /\.cjs$/.test(f) && f !== "lib/welt-boot.cjs")
        .sort()
        .map((f) => [f, ohneKommentare(ausDatei("scripts/" + f))]);
    const zwillinge = code.filter(([f, c]) => f !== "werkbank.cjs" && /\.on\("pageerror"/.test(c)).map(([f]) => f);
    // DIE NAMENS-WAND: die Namen der Seiten-Werkzeuge (`CODE_OF_SEITE`) gehören welt-boot — setzt ein Skript einen selbst, nimmt es
    // der Seite das Werkzeug oder liest das Werkzeug als seinen Schalter (diag-mp-sync hielt die Pumpe an `window.__ruht`, die
    // Werkzeuge bekamen `__ruht()`: die Pumpe stand, B rechnete A nie, CI 40970310311)
    const seitenNamen = new Set(CODE_OF_SEITE.match(/(?<=window\.)\w+(?= = )/g));
    const vonHand = (c) => [...new Set(c.match(/(?<=window\.)\w+(?= *=[^=])/g))].filter((n) => seitenNamen.has(n));
    const namen = code.filter(([, c]) => vonHand(c).length).map(([f, c]) => `${f} (${vonHand(c)})`);
    // DIE WAND JE ZWILLING (EINE Form): die Träger im Code sind genau `fremd` (FREMD tragen ihn bis zum Schnitt ihres Besitzers, ein
    // geheilter Eintrag macht die Liste ROT, bis er fällt), beide gepflanzten Proben fassen, die saubere nicht. DER TÄTER BEIM NAMEN
    // (Gebot 10, w13-gtx-proben): die Träger gegen die FREMD-Liste, eine leere Seite als „keiner“ — nach der Heilung von ci-kopf.cjs las
    // die Wand nur „ (FREMD ci-kopf.cjs)“, ohne zu sagen, dass der Träger fehlt und der Eintrag fällt; ein neuer Träger steht mit Datei
    const wand = (name, zw, fremd, gepflanzt, sauber) => {
        const t = code.flatMap(([f, c]) => (zw(c) ? [f] : [])).join(", ");
        const n = gepflanzt.filter(zw).length;
        return [t === fremd && n === 2 && !zw(sauber), `${name}: Träger ${t || "keiner"} statt FREMD ${fremd || "keiner"} · gepflanzt ${n}/2 gefasst`];
    };
    // DIE ADRESS-WAND: lauscht eine Linse an einem statikServer selbst oder baut ihre 127.0.0.1-Adresse selbst, ist das ein Zwilling von
    // lausche/zeige
    const adressWand = wand(
        "eigene Server-Starts/Welt-Adressen neben lausche/zeige",
        (c) => /statikServer\(/.test(c) && /new Promise\(\(?\w+\)? => \w+\.listen\(|\.goto\(`http:\/\/127\.0\.0\.1:\$\{/.test(c),
        "werkbank.cjs",
        ["statikServer(); await new Promise((r) => s.listen(1, r));", "statikServer(); p.goto(`http://127.0.0.1:${P}/index.html`);"],
        "statikServer(); await s.lausche(1); s.zeige(p, 1);"
    );
    // DIE FÄNGER-WAND: fängt ein Skript seinen Absturz selbst (`})().catch(…)`/`main().catch(…)` bis process.exit), ist das ein
    // Zwilling von hauptLauf; ci-kopf.cjs fährt allein im sparse-checkout
    const faengerWand = wand(
        "eigene Absturz-Fänger neben hauptLauf",
        (c) => /(?:\}\)\(\)|\b\w+\(\))\.catch\(\(?\w*\)? => \{(?:(?!\}\);)[^]){0,300}process\.exit/.test(c),
        "ci-kopf.cjs",
        ["(async () => {})().catch((e) => { console.error(e); process.exit(1); });", "main().catch((err) => { console.error(`x ${err}`); process.exitCode = 2; });"],
        "hauptLauf(async () => {}); page.close().catch(() => {}); process.exit(1);"
    );
    // DIE SCHLAF-WAND: schläft ein Skript mit eigenem Versprechen (`new Promise((r) => setTimeout(r, ms))`, in Node wie in der
    // Seite), ist das ein Zwilling von sleep; am Token-Strom, Strings (gepflanzte Stamm-Proben) zählen nicht. ci-kopf.cjs (allein im
    // sparse-checkout, ohne welt-boot) schläft seit w13-gtx-proben über Node (`timers/promises`) — sein FREMD-Eintrag fiel
    const schlafWand = wand(
        "eigene Schlafe neben sleep",
        (c) =>
            /new Promise \( (?:\( )?(\w+) (?:\) )?=> (?:\{ )?setTimeout \( \1 (?:, (?:[^\s(),{};]+ |\( [^()]*\) )+)?\) (?:; )?(?:\} )?\)/.test(
                [...require("acorn").tokenizer(c, { ecmaVersion: "latest", allowHashBang: true })]
                    .map((k) => (/^(string|template|regexp)$/.test(k.type.label) ? "S" : c.slice(k.start, k.end)))
                    .join(" ")
            ),
        "",
        ["await new Promise((r) => setTimeout(r, 50));", "const s = (ms) => new Promise((ok) => { setTimeout(ok, Math.max(ms, 1) * Math.random()); });"],
        '"new Promise((r) => setTimeout(r, 5))"; new Promise((r) => setTimeout(() => r(1), 5)); new Promise((r) => setTimeout(r, 5, 1));'
    );
    // DIE TÜR-WAND: setzt ein Skript den Aktiv-Zeiger selbst (`activeWorldSet`), ist das ein Zwilling der EINEN Tür (`weltTor`); die
    // Proben der Datenschicht prüfen den Zeiger selbst und laden nie neu
    const tuerWand = wand(
        "eigene Welt-Wechsel neben weltTor (der Zeiger von Hand)",
        (c) => /\.activeWorldSet\(/.test(c),
        "playtest/netz-p2p.cjs, playtest/speicher.cjs",
        ["r.importWorldBeside(j); r.activeWorldSet(id);", "window.anazhRealm.activeWorldSet(res.worldId);"],
        "await weltTor(page, json);"
    );
    // DIE RANG-WAND: liest ein Skript das Element am Anteil q einer Reihe von Hand (geklemmt, ungeklemmt, der Median `/ 2` oder
    // `>> 1`), ist das ein Zwilling von rang; eine andere Definition (⌈q·n⌉ − 1, gerundet über n − 1) ist kein Zwilling
    const rangWand = wand(
        "eigene Ränge neben rang",
        (c) => /\[(?:Math\.min\([\w.$]+\.length - 1, )?Math\.floor\((?:[\w.$]+ \* [\w.$]+\.length|[\w.$]+\.length (?:\* [\w.$]+|\/ 2))\)\)?\]|\[[\w.$]+\.length >> 1\]/.test(c),
        "",
        ["s[Math.min(s.length - 1, Math.floor(q * s.length))];", "a.sort(aufsteigend)[Math.floor(a.length / 2)] + b[b.length >> 1];"],
        "rang(s, 0.95); s[Math.ceil(0.95 * s.length) - 1]; s[Math.floor(rnd() * s.length)];"
    );
    // EIN KIND der Linse: `rumpf` im hauptLauf eines eigenen Prozesses (`nach` hinter dem Rumpf)
    const kind = (rumpf, nach = "") =>
        require("child_process").spawnSync(process.execPath, ["-e", `const w = require(${JSON.stringify(__filename)}); w.hauptLauf(async () => { ${rumpf} }${nach})`], { encoding: "utf8" });
    const sturz = kind('throw new Error("__sturz");', ', () => console.error("__zuletzt")');
    // DAS PROFIL JE START (w11-profil-leck): der Selbsttest-Browser trägt seinen Besitzer und lässt nach close() nichts liegen; ein
    // Kind lässt nach Wurf und Signal nichts liegen, die MUTANTE ohne Aufräumen (`fs.rmSync` stumm) ihres; der Feger nimmt das
    // Profil eines toten Laufs (älter als 10 min), nie das eines lebenden oder ein junges
    const eigen = browser.profil;
    await browser.close();
    // das Kind nennt sein Profil an der Marke, nie als erste Zeile: sein Feger schreibt vorher „bleibt liegen" für ein gehaltenes
    // Alt-Profil (Vollprobe 04.11. 20:06, ~2000 Alt-Profile im Temp: die Linse las die Feger-Zeile als Pfad — ROT ohne Täter)
    const [mutante, ...kinder] = ['require("fs").rmSync = () => {}; await b.close()', "throw 0", 'process.emit("SIGTERM", "SIGTERM")'].map(
        (c) => kind(`const b = await w.starteBrowser({ art: "null" }); require("fs").writeSync(1, "PROFIL " + b.profil + "\\n"); ${c}`).stdout.match(/^PROFIL (.+)$/m)?.[1]
    );
    const liegen = [mutante, ...kinder].map((d) => !/anazh-/.test(d) || fs.existsSync(d));
    loesche(mutante);
    const [tot, lebend, jung] = [tempNeu("profil", 2147483600), tempNeu(), tempNeu("profil", 2147483600)];
    const alt = new Date(Date.now() - 66e4);
    for (const d of [tot, lebend]) fs.utimesSync(d, alt, alt);
    profileFegen();
    const nach = [tot, lebend, jung].map((d) => fs.existsSync(d));
    for (const d of [lebend, jung]) loesche(d);
    const profil = `${path.basename(eigen).startsWith(`anazh-${process.pid}-`)},${fs.existsSync(eigen)} ${liegen} ${nach}`;
    // BESETZT: ein Server auf einem belegten Port endet — der Start urteilt am Ereignis (EADDRINUSE), nie an einer Frist;
    // die eigenen Ports der Linsen sind nie 4312/4313
    const besetzt = require("net").createServer();
    const [belegt, frei] = await eigenePorte("WELT_BOOT_NIE_GESETZT_A", "WELT_BOOT_NIE_GESETZT_B");
    // DER TOD DER SEITE (w28-seiten-tod): drei Tode an einer leeren Seite, je ein eigener Browser des EINEN Starters — der Absturz
    // des Seiten-Prozesses selbst, der V8-OOM eines Arbeits-Fadens (der Fall des Gipfel-Blicks: Puppeteer meldet ihn nie), der
    // Abschuss von außen. Die Frage, die vorher hing, fällt mit dem Namen, jede spätere ebenso, die Wache spricht einmal; eine
    // gesunde Seite, die ihren Prozess beim Navigieren wechselt, lebt.
    const laut = [];
    const todFall = async (name, toete, muss) => {
        const b = await startePuppeteer(browserOptionen({ art: "null", zusatz: ["--js-flags=--max-old-space-size=96"] }));
        const t0 = Date.now();
        const fehlerAus = console.error;
        console.error = (...a) => laut.push(`${name}: ${a.join(" ").trim()}`);
        try {
            const p = await b.newPage();
            await p.goto("about:blank");
            const frage = p.evaluate(() => new Promise(() => {})).then(() => "erfüllt", (x) => x.message); // prettier-ignore
            await toete(p, b);
            const wort = await Promise.race([frage, sleep(40000).then(() => "STILLE nach 40 s")]);
            const danach = await Promise.race([p.evaluate("1").then(() => "antwortet", (x) => x.message), sleep(5000).then(() => "STILLE")]); // prettier-ignore
            const gesagt = laut.filter((z) => z.startsWith(`${name}: ❌ ABSTURZ der Seite`)).length;
            const s = ((Date.now() - t0) / 1000).toFixed(1);
            return [muss.test(wort) && wort === danach && gesagt === 1, `Tod der Seite (${name}): ${String(wort).slice(0, 170)} — nach ${s} s, danach dieselbe Antwort ${wort === danach}, laut ${gesagt}×`]; // prettier-ignore
        } finally {
            console.error = fehlerAus;
            await b.close().catch(() => {});
        }
    };
    const todWand = [
        await todFall("Absturz", (p) => void p.goto("chrome://crash").catch(() => {}), /^ABSTURZ der Seite: (renderer|der Browser meldet)/),
        await todFall(
            "V8-OOM im Faden",
            (p) => p.evaluate(() => void new Worker(URL.createObjectURL(new Blob(["const a=[];for(;;)a.push(new Array(1e5).fill(Math.random()))"])))), // prettier-ignore
            // Windows trägt den Satz der V8-Wache im Abbild („V8 javascript OOM (…)“); das Abbild des Linux-Läufers trägt ihn nicht (CI
            // 43391589287: „renderer · Ausnahme 0x5“, benannt nach 2,0 s) — dort gilt der Abbruch mit Absicht des Seiten-Prozesses
            process.platform === "win32" ? /^ABSTURZ der Seite: (renderer · V8 javascript OOM|der Browser meldet)/ : /^ABSTURZ der Seite: (renderer · (V8 javascript OOM|Ausnahme 0x5 \()|der Browser meldet)/ // prettier-ignore
        ),
        await todFall(
            "Abschuss",
            async (p, b) => {
                const s = await b.target().createCDPSession();
                for (const x of (await s.send("SystemInfo.getProcessInfo")).processInfo) if (x.type === "renderer") try { process.kill(x.id); } catch { /* schon fort */ } // prettier-ignore
            },
            /^ABSTURZ der Seite: der Browser meldet (die Seite|einen Seiten-Prozess) als/
        ),
    ];
    {
        // DER GEWOLLTE TOD bleibt still (die Persistenz-Härtung schießt ihren Browser selbst ab): `todGewollt`, dann der Abschuss des
        // Browser-Prozesses — die Wache nennt keinen Absturz, die offene Frage fällt mit Puppeteers eigenem Wort
        const b = await startePuppeteer(browserOptionen({ art: "null" }));
        const fehlerAus = console.error;
        const ab = laut.length;
        console.error = (...a) => laut.push(`gewollt: ${a.join(" ").trim()}`);
        try {
            const p = await b.newPage();
            await p.goto("about:blank");
            const frage = p.evaluate(() => new Promise(() => {})).then(() => "erfüllt", (x) => x.message); // prettier-ignore
            b.todGewollt();
            try {
                process.kill(b.process().pid, "SIGKILL");
            } catch {
                // schon fort
            }
            const wort = await Promise.race([frage, sleep(15000).then(() => "STILLE nach 15 s")]);
            const gesagt = laut.slice(ab).filter((z) => /ABSTURZ der Seite/.test(z)).length;
            todWand.push([gesagt === 0 && !/^(ABSTURZ|STILLE)/.test(wort), `ein gewollter Tod (todGewollt, dann der Abschuss des Browsers) bleibt still: laut ${gesagt}×, die offene Frage fällt mit „${String(wort).slice(0, 70)}“`]); // prettier-ignore
        } finally {
            console.error = fehlerAus;
            await b.close().catch(() => {});
        }
    }
    {
        const b = await startePuppeteer(browserOptionen({ art: "null" }));
        const p = await b.newPage();
        await p.goto("about:blank");
        // die Fahrt beim Namen: eine Seite, die nie ankam (der Server zu, 11.11. — der Fall blieb so still grün), navigierte nie
        const weg = await server.zeige(p, undefined, "ruhig.html", "load").then(() => "", (x) => x.message);
        await sleep(3500);
        const lebt = await Promise.race([p.evaluate("1 + 1").catch((x) => x.message), sleep(5000).then(() => "STILLE")]);
        const da = /\/ruhig\.html$/.test(p.url());
        await b.close().catch(() => {});
        todWand.push([lebt === 2 && da, `eine gesunde Seite, die navigiert, lebt: ${!da ? `sie kam nie an (${weg || p.url()})` : lebt === 2 ? "sie antwortet" : lebt}`]); // prettier-ignore
    }
    // DER BOOT, DER BRICHT: die offene Warte auf den ersten Takt fällt binnen Sekunden mit dem Wurf des Kerns, jede spätere Frage an die
    // Seite ebenso, die Wache spricht einmal; ein Boot, der steht, und ein Welt-Wechsel, der danach bricht, lassen die Warte leben
    const bootFall = async (seite) => {
        const b = await startePuppeteer(browserOptionen({ art: "null" }));
        const fehlerAus = console.error;
        const ab = laut.length;
        console.error = (...a) => laut.push(`${seite}: ${a.join(" ").trim()}`);
        try {
            const p = await b.newPage();
            const t0 = Date.now();
            // die Fahrt fällt nur am gebrochenen Boot selbst (die Wache nimmt jede offene Frage der Seite mit) — jeder andere Fehler
            // der Fahrt ist ein Wurf beim Namen (11.11.: der Server war zu, beide Fälle warteten 30 s auf einer leeren Seite)
            const fahrt = await server.zeige(p, undefined, seite, "load").then(() => "", (x) => x.message);
            if (fahrt && !/^BOOT GEBROCHEN/.test(fahrt)) return { wort: `die Seite kam nie an: ${fahrt}`, danach: "—", s: "0.0", gesagt: 0 }; // prettier-ignore
            const wort = await Promise.race([p.waitForFunction(() => window.__takt === 1, { timeout: 30000 }).then(() => "erfüllt", (x) => x.message), sleep(35000).then(() => "STILLE nach 35 s")]); // prettier-ignore
            const s = ((Date.now() - t0) / 1000).toFixed(1);
            const danach = await Promise.race([p.evaluate("1 + 1").then(String, (x) => x.message), sleep(5000).then(() => "STILLE")]); // prettier-ignore
            return { wort, danach, s, gesagt: laut.slice(ab).filter((z) => z.includes("❌ BOOT GEBROCHEN")).length };
        } finally {
            console.error = fehlerAus;
            await b.close().catch(() => {});
        }
    };
    {
        const [br, sth] = [await bootFall("bricht.html"), await bootFall("steht.html")];
        todWand.push([/^BOOT GEBROCHEN: die Welt erwacht nicht, init warf — .*leibGroesse ohne height\/mass\/tone/.test(br.wort) && br.danach === "2" && br.gesagt === 1 && +br.s < 10, `Boot gebrochen (der Boot des Stamms, init wirft): ${br.wort.slice(0, 170)} — nach ${br.s} s, eine lesende Frage danach ${br.danach}, laut ${br.gesagt}×`]); // prettier-ignore
        todWand.push([sth.wort === "erfüllt" && sth.danach === "2" && sth.gesagt === 0, `Boot steht, ein Welt-Wechsel bricht danach: die Warte ${sth.wort} nach ${sth.s} s, laut ${sth.gesagt}×`]); // prettier-ignore
    }
    // DIE MUTANTE DES REZEPTS (z396): ein Start ohne Rezept wirft beim Namen, bevor ein Browser entsteht — auf jeder Plattform
    {
        const ohne = await startePuppeteer({ headless: true }).then((b) => (b.close().catch(() => {}), "er startete"), (x) => String(x.message)); // prettier-ignore
        todWand.push([/ohne Rezept/.test(ohne), `ein Browser ohne Rezept: ${ohne.slice(0, 120)}`]);
    }
    server.close();
    await new Promise((ok) => besetzt.listen(belegt, "127.0.0.1", ok));
    const t1 = Date.now();
    const start = await startProc("save-server.js", /läuft/, { PORT: String(belegt) }).then(
        (p) => (p.kill(), "bereit"),
        (x) => x.message
    );
    const startMs = Date.now() - t1;
    // DAS FEHLER-WORT DER WERKBANK (w28-stamm-krone): ihr Log vor dem Start trägt Chromes eigene ERROR-Zeilen vor ihrer ABSTURZ-Zeile;
    // das Tor (`werkbankTor`) nennt die ABSTURZ-Zeile — das erste Fehler-Wort allein hieße „ERROR" (gemessen lokal: Seiten-Server auf
    // PORT − 1 belegt → „Exit 1: Error: listen EADDRINUSE …“, in der CPU-Gruppe „Exit 2: … CI_KLASSE=cpu …“). Die Werkbank startet
    // hier nicht: sie zeichnet, ihre Klasse ist die Karte (gate:ci-deckung (K))
    const wbLog = "[linse-gpu] nvidia/pascal\n[1:2:ERROR:google_apis/gcm/registration_request.cc:291] PHONE_REGISTRATION_ERROR\n" +
        "werkbank.cjs ABSTURZ: Error: listen EADDRINUSE: address already in use 127.0.0.1:4791\n"; // prettier-ignore
    const wbWort = fehlerWort(wbLog);
    besetzt.close();
    const urteile = [
        [
            profil === "true,false true,false,false false,true,true",
            `Profil je Start (Besitzer, liegt nach close() · nach Mutante/Wurf/Signal · nach dem Fegen tot/lebend/jung): ${profil}`,
        ],
        [
            /^pageerror: Error: __seitenWurf/.test(wurf[0]),
            `Seiten-Wurf: ${wurf[0] || "KEIN Fehler gesammelt — still grün"}`,
        ],
        [kette.length === 1, `Bruch der Post-Kette: ${kette[0] || "still grün"}`],
        [
            `${takt.map((f) => /Error: __\w+Wurf/.exec(f))}` === "Error: __taktWurf,Error: __handWurf" && sammlung.wuerfe === 7,
            `Wurf im Takt (7 an der Grenze, 1 am Hand-Takt): ${takt.join(" · ") || "still grün"} · gezählt ${sammlung.wuerfe}`,
        ],
        [!zwillinge.length, `eigene pageerror-Sammler neben dem EINEN: ${zwillinge.join(", ") || "keiner"}`],
        [
            !namen.length &&
                `${vonHand("window.__deckel = 1; (window.__weltDa = r); window.sleep == r;")}` === "__deckel,__weltDa",
            `Namen der ${seitenNamen.size} Seiten-Werkzeuge von Hand gesetzt: ${namen.join(", ") || "keiner"} · gepflanzt 2/2 gefasst`,
        ],
        adressWand,
        faengerWand,
        [
            sturz.status === 2 && /^-e ABSTURZ: Error: __sturz/.test(sturz.stderr) && /__zuletzt/.test(sturz.stderr),
            `Sturz Exit ${sturz.status}: ${sturz.stderr.split("\n")[0]}`,
        ],
        schlafWand,
        [seitenSchlaf === String(sleep), `die Seite schläft mit ${seitenSchlaf}`],
        [!abbruch && !!abbruchMutante, `Abbruch: ${abbruch || "die Seite antwortet, die wartende Arbeit endet"} · die Mutante ${abbruchMutante || "BLIND"}`],
        tuerWand,
        rangWand,
        [ruhig.length === 0, `ruhig (0,8 s Block): keine Akte — ${ruhig.length ? ruhig[0].urteil : "keine"}`],
        [
            schleife.length > 0 &&
                /^JS-SCHLEIFE/.test(schleife[0].urteil) &&
                /__stallSchleife/.test(schleife[0].stapel || "") &&
                pausen === 0,
            `Schleife: ${schleife.length ? `${schleife[0].urteil} · Stapel ${schleife[0].stapel}` : "KEINE Akte"} · Pausen der Seite ${pausen} (Soll 0)`,
        ],
        [
            haenger.length > 0 && /^AWAIT/.test(haenger[haenger.length - 1].urteil),
            `Versprechen: ${haenger.length ? haenger[haenger.length - 1].urteil : "KEINE Akte"}`,
        ],
        [
            !!bau && bau.langsam.steht && bau.langsam.ms >= 3000,
            `Bau LANGSAM (3,2 s, eine Karte offen): ${bau ? `steht nach ${bau.langsam.takte} Takten, ${bau.langsam.ms} ms` : "kein Befund"}`,
        ],
        [
            !!bau && /^DER BAU STEHT NICHT: tot#2 .* · dem Weltbild fehlt: das Licht des Orts/.test(bau.tot),
            `Bau TOT (nichts offen): ${bau ? bau.tot : "kein Befund"}`,
        ],
        [
            !!bau && /^DIE WELT HÄNGT: haenger nach 3601 Takten — offen .*"karten":1/.test(bau.haengt),
            `Bau HÄNGT: ${bau ? bau.haengt : "kein Befund"}`,
        ],
        [
            !!bau && /DER BAU IST GEBROCHEN: mensch L0: LEIB-HAUT/.test(bau.gebrochen || "") && /nach [0-9] Takten/.test(bau.gebrochen || ""),
            `Warten am gebrochenen Bau: ${bau ? bau.gebrochen : "kein Befund"}`,
        ],
        [
            !!bau && /^steht nach 30 /.test(bau.regler) && bau.frei,
            `Regler atmet (echter Renderer): ${bau ? `${bau.regler}, danach ${bau.frei ? "frei" : "GEHALTEN"}` : "kein Befund"}`,
        ],
        [
            /^welt-boot.cjs startet „echt" und zeichnet nie/.test(weiche[0]) && weiche[1] === null,
            `Weiche: ${weiche[0]} · nach einem Draw ${weiche[1] || "trägt"}`,
        ],
        [/EADDRINUSE/.test(start) && startMs < 5000, `Start auf belegtem Port: ${start} (${startMs} ms)`],
        [/^werkbank\.cjs ABSTURZ: Error: listen EADDRINUSE/.test(wbWort), `Fehler-Wort der Werkbank (die ABSTURZ-Zeile, nicht Chromes ERROR davor): ${wbWort}`],
        [
            gb.posts === 1 && gb.leer && gb.laut && /^GEBROCHEN: mensch L0: LEIB-HAUT/.test(gb.grund || ""),
            `Guss wirft (Mutante): ${gb.posts} Auftrag im Faden (Soll 1, keine Neubestellung), Welt: ${gb.grund}, laut ${gb.laut}`,
        ],
        [![belegt, frei].some((p) => p === 4312 || p === 4313) && belegt !== frei, `eigene Ports ${belegt}, ${frei}`],
        ...todWand,
    ];
    console.log("=== STALL-AKTE SELBSTTEST (gate:welt-boot) ===");
    for (const [ok, text] of urteile) console.log(`  ${ok ? "✅" : "❌"} ${text}`);
    const rot = urteile.filter(([ok]) => !ok).length;
    console.log(
        rot
            ? `ROT — ${rot} Fall/Fälle ohne Täter-Namen`
            : "GRÜN — die Akte nennt Schleife und Versprechen beim Namen, ein kurzer Block bleibt still; das Warten auf den Bau und der Start eines Servers urteilen am Ereignis"
    );
    process.exitCode = rot ? 1 : 0;
}

if (require.main === module) {
    if (!process.argv.includes("--selbsttest")) {
        console.log("node scripts/lib/welt-boot.cjs --selbsttest");
        process.exit(2);
    }
    hauptLauf(selbsttest);
}
