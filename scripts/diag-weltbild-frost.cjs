// diag-weltbild-frost.cjs — DIE FROST-WAND (gate:weltbild-frost:echt): jede Bühne (Werkstatt · Ich · Hof · Feed) zeichnet über den
// Welt-Renderer (`_buehneRenderer`: eine Leinwand, EIN Gerät; bis 30.10. je ein eigenes WebGPU-Backend) und teilt Geometrie
// und Stoffe mit der Welt; das Backend-Gesetz (`_backendGesetz`: schmaler Index · Index-Wache · GPU-Wache) gilt an jedem
// Backend. Die Chronik der Befunde steht in git.
//
// Je Schritt (Werkstatt mit Eiche · Tab/Ich-Bühne · Hof-Bühne) prüft die Wand am ECHTEN Renderer (der Null-Renderer ist blind):
//   I  DER INDEX-ZENSUS: jeder Index-Puffer der Welt-GPU trägt das Format, das der Draw bindet (Bytes des Arrays ≤ Puffer)
//   G  kein WebGPU-Validierungsfehler auf irgendeinem Device (eigener Hörer, unabhängig vom Spiel: `uncapturederror` jedes
//      Device UND die THREE-Konsolenzeile, mit der r184 eine Validierung aus seinem offenen Pipeline-Fehler-Bereich meldet)
//   W  die Wachen des Spiels stehen und schweigen (`_indexWache` · `_gpuWache`)
//   B  DAS BILD FOLGT: zwei Bilder bei gedrehter Kamera unterscheiden sich in ≥ 5 % der 16×16-Blöcke (der präsentierte
//      Canvas)
// Dann DIE ENTSORGUNG DER BÜHNEN (dieselbe Klasse: geteilte Geometrie und Stoffe über Renderer-Grenzen; `_disposeSoulGroup`
// ist die EINE Regel jeder Gruppe, die Welt-Vorlagen teilt, `_ofenVorlage` sagt, was eine Gruppe besitzt):
//   S1 der Spielerpfad (jede Tetrapoda-Art↔human; der Mitspieler empfängt jede Seele, dann sein Abschied) und die Hof-Bühne
//      entsorgen keine Welt-Geometrie, keinen Welt-Stoff; je Seele tragen Ich-Bühne und Mitspieler (S4) den Leib der Welt
//   S2 die GPU kompiliert dabei nicht nach (≤ 2 Module/Pipelines gegen die geschlossene Bühne, Welt und Bühnen auf EINEM
//      Gerät): der Knoten-Bau einer Seele überlebt die Lösung des Leibs, der ihn eben noch teilte — und je Gestalt EIN
//      Programm: kein Vertex-Zwilling, den nur NodeBuffer_<id> oder die Knochenzahl trennt, kein Foundry-Stoff, den nur das
//      Jahr trennt (jede Art des Jahrs trägt Ecken, `JAHR_ARTEN`)
//   S3 die Feed-Vorschau (4 Wesen + eine Rezept-Karte) entsorgt keine Welt-Geometrie, keinen Welt-Stoff
//   S5 der Werkstatt-Ofen, Regler-Zug 20 Werte: kein Einzelstück im Ofen-Memo, Grafikspeicher und Geometrie-Zahl der
//      Werkstatt (ihr Konto, nie der Zähler der lebenden Welt), die dispose-Hörer der geteilten Stoffe und der JS-Speicher
//      bleiben beschränkt (kein Welt-Satz verdichtet darin)
//   S6 10 Mitspieler-Erscheinungen und ihr Abschied: das Ofen-Memo hält danach höchstens OFEN_MEMO_RUHEND Vorlagen ohne
//      Leib, der JS-Speicher fällt zurück
//   P2 kein writeBuffer der Seite schief, auch kein Uint16-Index ungerader Länge der Ich-Bühne
// Danach DIE TÄTER (jeder Lauf — die Wand beweist sich selbst):
//   T1 ein Probe-Mesh zeichnet einen Index ≥ seiner Vertex-Zahl → die Index-Wache nennt es („bereich")
//   T2 ein Mensch-Index wird geweitet wie von einem fremden Backend → die Index-Wache nennt ihn („format") beim Pfad, die
//      GPU-Wache des Spiels und der eigene Hörer zählen, und die Bild-Probe sagt BILD STEHT
//   T3 ein writeBuffer von 6 Bytes → WebGPU wirft, die Puffer-Wache nennt Puffer, Länge, Aufrufer
//   T4 ein fremder Validierungsfehler im Bau einer Pipeline → keine Pipeline trägt die Fehler-Marke (`_erstAbsageWache` schließt
//      r184s Fehler-Bereich im Zug des Baus), die GPU-Wache zählt ihn; der Mutant (main: der Bereich bleibt offen) markiert sie
//   T5 DER TÄTER DER GESCHWISTER (frost-linse): die alte Weiche des Knochen-Takts (`if (!sk.previousBoneMatrices) return taktRoh…`,
//      bild-kosten.js 2776 bis buendel-mittag 3) + ein drittes Geschwister, Schatten zuerst → writeBuffer wirft im Szenen-Pass,
//      die Post-Kette bricht LAUT; danach folgt der Schirm der Kamera (B ≥ 5 % im Folgebild, `_rendererStand`) und die Ich-Bühne
//      zeichnet im Direktpfad (`_leinwandTiefeGilt`); der Mutant (die Rückkehr des Stands fällt aus) stellt den Schirm (B < 5 %)
// DIE GESCHWISTER (Schritt „geschwister“, frost-linse): das Tor lebte vom Zufall — der Täter (ROT seit w28-bewegungs-feld an NVIDIA
// und Radeon, „B das Bild folgt der Kamera — 0,00 %“) brauchte zwei Skelette mit geteiltem Bau UND eine Kaskade, die im
// Eintritts-Bild des zweiten fällig ist. Der Schritt erzwingt beides: zwei Geschwister (EINE Geometrie, EIN Stoff, gleiche
// Knochenzahl, je ein Skelett), das zweite betritt die Szene, während jede Kaskade fällig ist (`_shadowLast.k` leer). Eine Sonde
// am Knochen-Takt beweist „Schatten zuerst, der Szenen-Knoten folgt im selben Bild“ (sonst ROT als ungemessen); sein Skelett
// trägt danach sein Vor (`previousBoneMatrices`), die Post-Kette zeichnet weiter.
//
// EIN Weg (bis w27-swift-raus zwei: headless auf swiftshader zeichnete die CI eine PROBE-BÜHNE mit Rücklese-Bild — der Zwilling
// der Karte, er fiel mit ihm):
//   node scripts/diag-weltbild-frost.cjs --echt   sichtbares Chrome auf der echten GPU: der SPIELPFAD (Ankunft · dritte
//                                                 Person · Werkstatt · Tab · Hof) im laufenden Spiel, das Bild-Paar je Schritt —
//                                                 die EINE Stelle im Zug (check.yml echt, gate:weltbild-frost:echt)
//   … [--bilder <ordner>]                         legt je Bild-Paar beide Bilder ab
//   … [--s5=leck]                                 Mutant S5: kein Einzelstück entsorgt seine Geometrie (ROT: das Konto wächst)
// Exit 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, starteBrowser, selbsttest, hauptLauf, sleep, pruefer, argOpt, path, fs } = require("./lib/welt-boot.cjs");

if (!process.argv.includes("--echt")) throw new Error("diag-weltbild-frost: nur --echt (die Karte, der Spielpfad) — die Probe-Bühne fiel mit w27-swift-raus");
const LECK = process.argv.includes("--s5=leck"); // der Mutant von S5
const BILDER = argOpt("--bilder", null);
// Anteil bewegter 16×16-Blöcke der Bildmitte, ab dem das Bild der Kamera folgt: eine Drehung bewegt 40–100 %, ein stehendes
// Bild unter der zeitlichen Kantenglättung zittert bis 1,4 % — die Schwelle liegt dazwischen mit Abstand.
const FOLGT_MIN = 0.05;
const server = statikServer();

const { errs: fehler, check } = pruefer();

// Der eigene Hörer: jedes GPUDevice der Seite (Welt und Bühnen) meldet jede Validierung hierher — unabhängig davon, ob
// das Spiel eine Wache trägt (an altem Code ist diese Zahl der Befund).
function geraeteHoerer() {
    if (typeof GPUAdapter === "undefined" || window.__frostHoer) return;
    const H = (window.__frostHoer = { devices: 0, n: 0, erste: [], bauOffen: 0, bereiche: 0, verloren: [] });
    // Wer hält eine Meldung zurück? Offene async Pipeline-Bauten und offene Fehler-Bereiche (aller Devices) — die
    // Täter-Probe nennt beide, wenn das Wort einer Validierung ausbleibt.
    const P = GPUDevice.prototype;
    // Was jedes Device kompiliert (am Device-Objekt gezählt): die Seelen-Probe misst so, ob die Welt-GPU neu kompiliert.
    const zaehle = (dev, art) => (dev.__frostBau || (dev.__frostBau = { module: 0, pipelines: 0 }))[art]++;
    const modul = P.createShaderModule;
    P.createShaderModule = function (d) {
        zaehle(this, "module");
        return modul.call(this, d);
    };
    const pipe = P.createRenderPipeline;
    P.createRenderPipeline = function (d) {
        zaehle(this, "pipelines");
        return pipe.call(this, d);
    };
    const bau = P.createRenderPipelineAsync;
    if (bau)
        P.createRenderPipelineAsync = function (d) {
            zaehle(this, "pipelines");
            H.bauOffen++;
            const p = bau.call(this, d);
            p.then(
                () => H.bauOffen--,
                () => H.bauOffen--
            );
            return p;
        };
    const auf = P.pushErrorScope,
        zu = P.popErrorScope;
    P.pushErrorScope = function (f) {
        H.bereiche++;
        return auf.call(this, f);
    };
    P.popErrorScope = function () {
        H.bereiche--;
        return zu.call(this);
    };
    // DIE PUFFER-WACHE: WebGPU verlangt Versatz und Länge jedes writeBuffer in 4-Byte-Schritten
    const W = (H.puffer = { schief: [], n: 0 });
    const wb = GPUQueue.prototype.writeBuffer;
    GPUQueue.prototype.writeBuffer = function (buf, off, data, dOff, size) {
        W.n++;
        const bytes = (size ?? (data.length ?? data.byteLength) - (dOff | 0)) * (data.BYTES_PER_ELEMENT || 1);
        if ((off | 0) % 4 || bytes % 4) {
            const ruf = String(new Error().stack)
                .split("\n")
                .slice(2, 6)
                .map((z) => z.trim().replace(/^at |\?v=[^:]*|https?:\/\/[^/]+\//g, ""))
                .join(" < ");
            W.schief.push(`${buf.label} · ${data.constructor.name} · Versatz ${off} · ${bytes} B · ${ruf}`);
        }
        return wb.call(this, buf, off, data, dOff, size);
    };
    const rd = GPUAdapter.prototype.requestDevice;
    GPUAdapter.prototype.requestDevice = async function (d) {
        const dev = await rd.call(this, d);
        const nr = H.devices++;
        dev.lost.then((i) => H.verloren.push(`device ${nr}: ${i.reason} ${String(i.message).slice(0, 120)}`));
        dev.addEventListener("uncapturederror", (ev) => {
            H.n++;
            if (H.erste.length < 6)
                H.erste.push(
                    `device ${nr}: ` +
                        String(ev.error?.message || ev.error)
                            .split("\n")[0]
                            .slice(0, 220)
                );
        });
        return dev;
    };
}

// Der Prüf-Raum in der Seite: `wurzel` (was die Welt-GPU zeichnet und der Zensus liest), `zeichne(n)` (n Bilder der Welt-
// GPU), `drehe()` (63° Gier), `leib` (der Welt-Leib, dessen Index der Täter T2 weitet), `leibWechsel()` (zeichnet ihn).
function pruefRaum() {
    const T = window.THREE;
    const rend = st.renderer;
    const F = (window.__frostWand = {});
    // DAS EINE WARTEN AUF EINE BÜHNE (Werkstatt-Vorschau, Ich-, Hof-, Feed-Bühne), bis ihr Renderer `bis(Zeichnungen)` trägt:
    // der Deckel zählt einen Gang nur, wenn ihr Renderer bereit ist und ihr Gerät die eingereichte Arbeit abgegeben hat
    // (swiftshader kompiliert im GPU-Prozess, Compositor und Bühnen-Takt stehen derweil) — die Bühne urteilt in GPU-Ereignissen,
    // nie im Takt der Wanduhr (bis 25.10. zählte er je 50/200 ms, 20/180 s bis ROT); fehlt die Bühne, zählt er und nennt sie
    // die Bilder einer Bühne zählen erst, wenn jedes sichtbare Mesh in ihrem Blick gezeichnet hat (die Erst-Zeichnung baut
    // asynchron, ein Bild ohne seine Bürger ist kein Bild der Bühne)
    // DER EINE ZÄHLER DER UNGEZEICHNETEN (w28-frost-waerme; Bühne und Welt-Leib): jedes sichtbare Mesh unter `wurzel`, das die Kamera
    // zeichnen wird — auf einer ihrer Ebenen und in ihrem Blick (ein Mesh ohne Blick-Probe, `frustumCulled` false, immer) — und das
    // noch in keinem Pass zeichnete. Bis hier stand an beiden Stellen `fehlt += o.isMesh && …`: für die Szene, jede Gruppe und jeden
    // Knochen ist `isMesh` undefined, die Summe wurde NaN, und `fehlt ? 0 : bilder` las NaN als „nichts fehlt“ — das Warten dauerte
    // seit 30.10. (446e13eb, 5d4014be) EIN Bild. Gemessen (GTX 1060, main ab2f2eed, 7 von 7 Läufen S2 ROT, +3/+2 bis +4/+3): der
    // Wärm-Durchgang wechselte nach 50–220 ms je Seele weiter, vom Fuchs der Ich-Bühne standen 2 von 13 Meshes gezeichnet; das
    // Schweif-Mesh (3 611 Ecken, 10 Knochen) und die Haarsträhne (192 Ecken, 3 Knochen) bauten erst im gemessenen Durchgang.
    // Die Ebenen zählen: jeder Leib trägt eine zweite Kopf-Gruppe mit der Ebenen-Maske 4 oder 0, die keine Bühnen-Kamera (Maske 1)
    // zeichnet — ohne die Ebenen-Probe wartete der Zähler auf sie bis zum Deckel. Der Selbsttest (S2) hält die Zahl: Gruppen 0, ein Mesh 1.
    F.ungezeichnet = (wurzel, k) => {
        const blick = r._frustumVon(k, true);
        let fehlt = 0;
        wurzel.traverseVisible((o) => (fehlt += !!(o.isMesh && k.layers.test(o.layers) && !(o.frustumCulled && !blick.intersectsObject(o)) && !r._erstZeichnung.gezeichnet.get(o))));
        return fehlt;
    };
    F.gezeichnet = (s) => (s?.renderer?.buehne && !F.ungezeichnet(s.scene, s.camera) ? s.renderer.buehne.bilder : 0);
    // WER BAUT (die S2-Zeile nennt je Neubau Stoff · Ecken · Knochen · Szene, die Szene beim Namen ihres Halters im Zustand: `scene` die
    // Welt, `ichStage`, `hofStage` …): an der INSTANZ des Backends — die Hülle von welt-boot (`stoffHaken`) hält dort das Original
    // fest, ein Haken am Prototyp liefe nie
    F.bauten = [];
    const bauAlt = rend.backend.createRenderPipeline;
    rend.backend.createRenderPipeline = function (ro) {
        F.bauten.push([ro.material.userData.foundryKind || ro.material.type, ro.geometry.attributes.position?.count, ro.object.skeleton?.bones.length || 0, Object.keys(st).find((n) => (st[n]?.scene || st[n]) === ro.scene)].join(" · "));
        return bauAlt.apply(this, arguments);
    };
    F.buehne = async (name, holen, bis) => {
        let fragt = false;
        const offen = (s = holen()) =>
            !s || !s.rendererReady
                ? !!s
                : fragt || ((fragt = true), rend.backend.device.queue.onSubmittedWorkDone().then(() => (fragt = false)), false);
        for (const weiter = __deckel(name, 400, offen); !bis(F.gezeichnet(holen())) && weiter(); )
            await sleep(50);
    };
    r.setCameraMode("third");
    // der Leib von JETZT: der Seelenwechsel (S1, `applyPlayerSoul`) ersetzt den Spieler-Leib, T2 weitet nie den alten
    Object.defineProperty(F, "leib", { get: () => st.playerMesh });
    F.wurzel = st.scene;
    // der Leib steht GANZ im Bild, bevor die Probe weiterwechselt (das Ereignis, nie die Uhr)
    F.leibWechsel = async () => {
        for (let fehlt = 1, weiter = __deckel("der Leib im Bild", 100); fehlt && weiter(); ) {
            await F.zeichne(1);
            fehlt = F.ungezeichnet(st.playerMesh, st.camera);
        }
    };
    // n GEZEICHNETE BILDER (z133, `nodeFrame.frameId`): `info.render.calls` setzt sich je Bild zurück (r184 `info.reset`
    // im Animations-Takt) und zählte nichts — das Bild-Paar wartete die Wanduhr, 600 ms, und der ausgelastete Läufer
    // zeichnete darin weniger Bilder (T2-Wache 67 und 109 gegen 172–353 am Stamm). Im gefrorenen Bild des Täters T2 bewegen
    // sich nach der Drehung die Kanten des Leibs und das Innere der Portale (ohne Drehung 0,19 % der Blöcke, mit 2,6 %;
    // Läufer 5,68 und 8,05 %); ohne die Bühnen-Proben davor steht es nach 30 Bildern ganz (0,00 %).
    F.zeichne = async (n) => {
        const N = rend._nodes.nodeFrame,
            a = N.frameId;
        await sleep(600); // ein Bild steht mindestens 600 ms
        for (const weiter = __deckel("ein Bild", 2400); N.frameId - a < n && weiter(); ) await sleep(50);
    };
    F.drehe = () => (st.yaw += 1.1);
    F.mittag = () => {
        r._uhrSetzen(0.5, "regler");
        st.pitch = -0.18;
    };
    return { weg: "spielpfad" };
}

// DIE GESCHWISTER (frost-linse, Kopf-Kommentar): Skelette mit geteiltem Bau und die Sonde am Knochen-Takt. `neu(name, k)` baut
// ein Geschwister k Meter neben der Blickachse, 5 m vor der Kamera auf dem Boden; `eintritt(m)` fügt es ein und hält jede
// Kaskade fällig, bis sein Skelett zum ersten Mal rückte; `sonde()` nennt je Skelett, WER es in seinem Eintritts-Bild zuerst
// rückte (der Schatten-Knoten ohne Vor oder der Szenen-Knoten mit Vor) und ob der Szenen-Knoten im selben Bild folgte.
function geschwisterRaum() {
    const T = window.THREE;
    const F = window.__frostWand;
    const cam = st.camera;
    const geo = new T.CylinderGeometry(0.22, 0.22, 1.6, 8, 4).translate(0, 0.8, 0);
    const P = geo.attributes.position;
    const [si, sw] = [new Uint16Array(P.count * 4), new Float32Array(P.count * 4)];
    for (let i = 0; i < P.count; i++) {
        const o = Math.min(1, Math.max(0, P.getY(i) / 1.6));
        si[i * 4 + 1] = 1;
        sw[i * 4] = 1 - o;
        sw[i * 4 + 1] = o;
    }
    geo.setAttribute("skinIndex", new T.Uint16BufferAttribute(si, 4));
    geo.setAttribute("skinWeight", new T.Float32BufferAttribute(sw, 4));
    // ein Stoff im Licht: sein eigener Bau trägt die Kaskade, r184 zeichnet sie vor seinem ersten Zeichnen (`updateBefore` des
    // Schatten-Knotens) — die Reihenfolge „Schatten zuerst“ hängt nie an der Sortierung der Szene
    const stoff = new T.MeshStandardNodeMaterial({ color: 0xff7a00, roughness: 0.8 });
    const probe = new T.SkinnedMesh();
    probe.bind(new T.Skeleton([new T.Bone()]));
    const G = (F.geschwister = { alle: [], erst: new Map(), SN: T.TSL.skinning(probe).constructor });
    G.neu = (name, k) => {
        const [a, b] = [new T.Bone(), new T.Bone()];
        b.position.y = 0.8;
        a.add(b);
        const m = new T.SkinnedMesh(geo, stoff);
        m.name = name;
        m.add(a);
        m.bind(new T.Skeleton([a, b]));
        m.skeleton.__frostName = name;
        m.castShadow = true;
        m.receiveShadow = true;
        m.frustumCulled = false;
        const vor = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
        const p = cam.position.clone().addScaledVector(vor, 5).addScaledVector(new T.Vector3(-vor.z, 0, vor.x), k);
        m.position.set(p.x, r._voxelSurfaceY(p.x, p.z), p.z);
        G.alle.push(m);
        return m;
    };
    G.sonde = () => {
        const kopf = G.SN.prototype.update;
        G.SN.prototype.update = function (frame) {
            const sk = frame.object && frame.object.skeleton ? frame.object.skeleton : this.skinnedMesh.skeleton;
            const n = sk.__frostName;
            if (n) {
                const mitVor = this.previousBoneMatricesNode !== null;
                const e = G.erst.get(n);
                if (!e) G.erst.set(n, { bild: frame.frameId, zuerst: mitVor ? "szene" : "schatten", szeneFolgt: mitVor });
                else if (e.bild === frame.frameId && mitVor) e.szeneFolgt = true;
            }
            return kopf.call(this, frame);
        };
        return () => (G.SN.prototype.update = kopf);
    };
    G.eintritt = async (m) => {
        F.wurzel.add(m);
        // jede Kaskade fällig, bis das Skelett zum ersten Mal rückte (`_loopShadowUpdate` liest `_shadowLast.k`)
        const halte = () => {
            if (G.erst.has(m.name) || !m.parent) return;
            if (r._shadowLast) r._shadowLast.k.length = 0;
            requestAnimationFrame(halte);
        };
        halte();
        let bruch = "";
        try {
            for (const weiter = __deckel("das Geschwister " + m.name + " im Bild", 100); (!G.erst.has(m.name) || F.ungezeichnet(m, cam)) && weiter(); )
                await F.zeichne(1);
            await F.zeichne(4);
        } catch (e) {
            bruch = e.message;
        }
        return {
            name: m.name,
            ...(G.erst.get(m.name) || { zuerst: "nie gerückt" }),
            vor: m.skeleton.previousBoneMatrices instanceof Float32Array,
            kette: st.postProcessingFailed !== true,
            wirft: r._lichtWirft(),
            ...(bruch ? { bruch } : {}),
        };
    };
    G.fort = () => {
        for (const m of G.alle.splice(0)) F.wurzel.remove(m);
    };
    // DER TÄTER T5: die alte Weiche des Knochen-Takts (gewichen wurde nach dem SKELETT, nie nach dem Leser — r184s Takt trägt
    // die Marke `__anazhBewegung`, bild-kosten.js `_bewegungHaut`) + ein weiteres Geschwister; `standAus` nimmt dazu der Rückkehr
    // des Renderer-Stands ihre Wirkung (der Mutant des Klassen-Schnitts, `_rendererStand`), `G.heile()` stellt danach beides.
    // Jeder Bruch, den das Spiel in diesem Lauf meldet, steht in `brueche` (das Buch meldet denselben Text nur einmal laut).
    const stand = r.constructor.prototype._rendererStand;
    G.taeter = async (name, k, standAus) => {
        const roh = G.SN.__anazhBewegung;
        if (typeof roh !== "function" || typeof stand !== "function")
            return { fehlt: "SkinningNode.__anazhBewegung oder _rendererStand (bild-kosten.js) — der Täter ist nicht baubar" };
        const brueche = [];
        const eigen = Object.hasOwn(r, "_bruchMelden") ? r._bruchMelden : null;
        const melde = r._bruchMelden;
        r._bruchMelden = function (t) {
            brueche.push(String(t).slice(0, 240));
            return melde.apply(this, arguments);
        };
        const kopf = G.SN.prototype.update;
        G.SN.prototype.update = function (frame) {
            const sk = frame.object && frame.object.skeleton ? frame.object.skeleton : this.skinnedMesh.skeleton;
            return sk.previousBoneMatrices ? kopf.call(this, frame) : roh.call(this, frame);
        };
        const sondeAb = G.sonde();
        if (standAus) {
            G.merk = stand.call(r, st.renderer, []);
            r._rendererStand = function (R, M, zurueck) {
                return zurueck === true ? M : stand.call(this, R, M);
            };
        }
        try {
            return { ...(await G.eintritt(G.neu(name, k))), brueche };
        } finally {
            sondeAb();
            G.SN.prototype.update = kopf;
            if (eigen) r._bruchMelden = eigen;
            else delete r._bruchMelden;
        }
    };
    G.heile = () => {
        if (G.merk) {
            delete r._rendererStand;
            stand.call(r, st.renderer, G.merk, true);
            G.merk = null;
        }
        st.postProcessingFailed = false;
    };
    return { geschwister: "bereit" };
}

hauptLauf(async () => {
    await server.lausche(0);
    const browser = await starteBrowser({
        art: "echt",
        headless: false,
        frist: 1800000,
        viewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
        zusatz: ["--window-size=1300,820"],
    });
    const page = await browser.newPage();
    const t0 = Date.now();
    const zeit = () => `+${Math.round((Date.now() - t0) / 1000)} s`;
    let konsole = 0;
    // Der zweite Weg einer Validierung: r184 fängt sie in seinem offenen Pipeline-Fehler-Bereich und meldet sie als
    // THREE-Konsolenzeile (nie als uncapturederror) — der eigene Hörer zählt auch diese (die Zeilen des Spiels nicht).
    const konsoleGpu = { n: 0, erste: [] };
    page.on("console", (m) => {
        const t = m.text();
        if (!t.startsWith("[AnazhRealm") && /does not fit in|\[Invalid [A-Za-z]+|\n\s*-\s*While /.test(t)) {
            konsoleGpu.n++;
            if (konsoleGpu.erste.length < 3) konsoleGpu.erste.push("konsole: " + t.split("\n")[0].slice(0, 200));
        }
        if (/INDEX-WACHE|GPU-VALIDIERUNG/.test(t) && konsole++ < 10) console.log("  [Spiel] " + t.slice(0, 260));
    });
    await page.evaluateOnNewDocument(geraeteHoerer);
    await server.zeige(page, 120000, "index.html");
    const boot = await page.evaluate(
        async ({ minChunks }) => {
            // DER HÄNGER BEIM NAMEN (z637): der Deckel warf ohne Täter („die Welt hat nichts mehr offen“, Exit 2) — der Leib-Vorbau
            // hielt `_leibWarm` (GTX 1050 und OMEN: der Mensch mit 5 Teilen, je ein Kaskaden-Paar ohne Bau, `_vorbauFehlt`). Jetzt
            // urteilt die Boot-Zeile ROT und nennt, was der Vorbau hält: Leib · Takte · fehlende Teile · offene Leiber.
            let haenger = null;
            try {
                for (const weiter = __deckel("das erste Weltbild", 1200); weiter(); ) {
                    const st = r && r.state;
                    // B urteilt den Canvas: erst mit dem ersten Weltbild (`_weltbildDa`) weicht der Ladeschirm
                    if (
                        st?.rendererReady &&
                        st.playerMesh &&
                        !st._deferredAvatarSoul &&
                        st.voxelChunks &&
                        st.voxelChunks.size >= minChunks &&
                        st._leibWarm
                    )
                        break;
                    await sleep(300);
                }
            } catch (e) {
                const V = st && st._leibVorwaermung;
                haenger = `${e.message.split(" — ")[0]}${V && V.leib ? ` · Leib-Vorbau hält: ${V.leib.name} nach ${V.takte} Takten, ${r._vorbauFehlt(V.leib)} Teile fehlen, ${V.offen.length} Leiber offen` : ""}`;
            }
            const rend = r && st && st.renderer;
            return {
                bereit: !!(r && st.rendererReady),
                webgpu: !!(rend?.backend && rend.backend.isWebGPUBackend === true),
                chunks: r && st.voxelChunks ? st.voxelChunks.size : -1,
                weltbild: r && st._weltbildDa ? `${(st._weltbildDa / 1000).toFixed(1)} s` : "fehlt",
                warm: !!(r && st._leibWarm),
                ...(haenger ? { haenger } : {}),
            };
        },
        { minChunks: 25 }
    );
    console.log(
        `=== DIE FROST-WAND (echte GPU) — Boot ${zeit()} ${JSON.stringify(boot)} ===`
    );
    if (!boot.bereit || !boot.webgpu || !boot.warm) {
        check("die Welt steht mit ihrem ersten Weltbild auf einem WebGPU-Backend", false, boot);
        await browser.close();
        server.close();
        process.exit(1);
    }
    if (BILDER) fs.mkdirSync(BILDER, { recursive: true });
    const raum = await page.evaluate(pruefRaum);
    console.log(`  Prüf-Raum: ${JSON.stringify(raum)}`);

    const zeichne = (n) => page.evaluate((n) => window.__frostWand.zeichne(n), n);
    const clip = await page.evaluate(() => {
        const b = st.renderer.domElement.getBoundingClientRect();
        return { x: b.x + b.width * 0.2, y: b.y + b.height * 0.22, width: b.width * 0.6, height: b.height * 0.5 };
    });
    const schuss = async (datei) => {
        const b64 = await page.screenshot({ clip, encoding: "base64" });
        if (datei) fs.writeFileSync(datei, Buffer.from(b64, "base64"));
        return b64;
    };
    // Der Vergleich zweier Bilder in der Seite: Block-Mittel 16×16 — die zeitliche Kantenglättung zittert über einem
    // stehenden Bild Pixel für Pixel (Laub: 6 % der Pixel), ihr Block-Mittel bleibt (0,1 % der Blöcke); eine Drehung bewegt
    // 70–97 % der Blöcke.
    await page.evaluate(() => {
        const F = window.__frostWand;
        F.blockAnteil = (A, B) => {
            const K = 16,
                bw = Math.floor(A.w / K),
                bh = Math.floor(A.h / K);
            let anders = 0;
            for (let by = 0; by < bh; by++)
                for (let bx = 0; bx < bw; bx++) {
                    let s = 0;
                    for (let c = 0; c < 3; c++) {
                        let ma = 0,
                            mb = 0;
                        for (let y = 0; y < K; y++)
                            for (let x = 0; x < K; x++) {
                                const i = ((by * K + y) * A.w + bx * K + x) * 4 + c;
                                ma += A.d[i];
                                mb += B.d[i];
                            }
                        s += Math.abs(ma - mb) / (K * K);
                    }
                    if (s > 12) anders++;
                }
            return anders / Math.max(1, bw * bh);
        };
        F.ladePng = async (s) => {
            const bin = atob(s);
            const u8 = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
            const bm = await createImageBitmap(new Blob([u8], { type: "image/png" }));
            const c = new OffscreenCanvas(bm.width, bm.height);
            const g = c.getContext("2d");
            g.drawImage(bm, 0, 0);
            return { d: g.getImageData(0, 0, bm.width, bm.height).data, w: bm.width, h: bm.height };
        };
    });
    // B — das Bild-Paar, dazwischen 63° Gier: der präsentierte Canvas (was der Spieler sieht).
    const bildPaar = async (tag) => {
        await page.evaluate(() => window.__frostWand.mittag());
        await zeichne(30); // 30 gezeichnete Bilder je Schuss (`F.zeichne`), nie die Wanduhr
        const a = await schuss(BILDER && path.join(BILDER, tag + "-a.png"));
        await page.evaluate(() => window.__frostWand.drehe());
        await zeichne(30);
        const b = await schuss(BILDER && path.join(BILDER, tag + "-b.png"));
        return page.evaluate(
            async (a, b) => {
                const F = window.__frostWand;
                return F.blockAnteil(await F.ladePng(a), await F.ladePng(b));
            },
            a,
            b
        );
    };
    // I + G + W — der Index-Zensus der Welt-GPU, der eigene Hörer, die Wachen des Spiels.
    const lage = async () => {
        const l = await lageSeite();
        l.hoer += konsoleGpu.n;
        l.hoerErste = l.hoerErste.concat(konsoleGpu.erste);
        return l;
    };
    const lageSeite = () =>
        page.evaluate(() => {
            const be = st.renderer.backend;
            const kaputt = [];
            let n = 0,
                mensch = 0;
            window.__frostWand.wurzel.traverse((o) => {
                const g = o.geometry;
                if (!g || !g.index || !be.data.has(g.index)) return;
                const d = be.data.get(g.index);
                if (!d.buffer) return;
                n++;
                let pfad = [];
                for (let x = o; x && pfad.length < 6; x = x.parent) pfad.unshift(x.name || x.type);
                pfad = pfad.join("/");
                if (/mensch/.test(pfad)) mensch++;
                if (g.index.array.byteLength > d.buffer.size)
                    kaputt.push(
                        `${pfad} (Geometrie ${g.id}: ${g.index.count} × ${g.index.array.constructor.name} auf ${d.buffer.size} B)`
                    );
            });
            const H = window.__frostHoer;
            return {
                n,
                mensch,
                kaputt,
                hoer: H ? H.n : -1,
                hoerErste: H ? H.erste : [],
                bauOffen: H ? H.bauOffen : -1,
                bereiche: H ? H.bereiche : -1,
                verloren: H ? H.verloren : [],
                devices: H ? H.devices : -1,
                indexWache: r._indexWache ? { n: r._indexWache.n, brueche: r._indexWache.brueche.slice(0, 8) } : null,
                gpuWache: r._gpuWache ? { n: r._gpuWache.n } : null,
                wachenDa: typeof r._indexWacheDraw === "function" && typeof r._gpuWacheAn === "function",
            };
        });
    // Ein Schritt: tun, die Welt-GPU zeichnen lassen (die geteilten Gestalten im Bild), dann I · G · W · B (das Bild-Paar je Schritt).
    const schritt = async (tag, tu) => {
        const was = tu ? await tu() : null;
        const folgt = await bildPaar(tag);
        const l = await lage();
        console.log(
            `\n[${tag}] ${zeit()} · ${was ? JSON.stringify(was) + " · " : ""}${folgt === null ? "" : `Bild ${(folgt * 100).toFixed(1)} % der Blöcke bewegt · `}${l.n} Index-Puffer (${l.mensch} Mensch) · Devices ${l.devices}`
        );
        if (folgt !== null)
            check(
                `${tag}: B das Bild folgt der Kamera`,
                folgt >= FOLGT_MIN,
                `${(folgt * 100).toFixed(2)} % der Blöcke (Soll ≥ ${FOLGT_MIN * 100} %)`
            );
        check(
            `${tag}: I jeder Index-Puffer der Welt-GPU trägt das gebundene Format`,
            l.kaputt.length === 0,
            l.kaputt.slice(0, 4).join(" | ")
        );
        check(
            `${tag}: G kein WebGPU-Validierungsfehler`,
            l.hoer === 0,
            l.hoer ? `${l.hoer} Meldungen: ${l.hoerErste.join(" | ")}` : ""
        );
        check(
            `${tag}: W die Wachen des Spiels stehen und schweigen`,
            l.wachenDa && (!l.indexWache || l.indexWache.n === 0) && (!l.gpuWache || l.gpuWache.n === 0),
            l.wachenDa ? JSON.stringify({ index: l.indexWache, gpu: l.gpuWache }) : "_indexWacheDraw/_gpuWacheAn fehlen"
        );
        return l;
    };
    const warteBuehne = (wer) =>
        page.evaluate(async (wer) => {
            const holen = () =>
                wer === "ich"
                    ? st.ichStage
                    : wer === "hof"
                      ? st.hofStage
                      : st.workshop && st.workshop.preview;
            await window.__frostWand.buehne("die Bühne", holen, (n) => n >= 2);
            const s = holen();
            let meshes = 0;
            if (s?.scene) s.scene.traverse((o) => o.isMesh && meshes++);
            return { bühne: wer, gezeichnet: window.__frostWand.gezeichnet(s), meshes };
        }, wer);

    await schritt("ankunft");
    const start = await schritt("dritte-person");
    check(
        "die Welt-GPU zeichnet einen Menschen (Mensch-Indizes auf der Welt-GPU)",
        start.mensch > 0,
        `${start.mensch} Mensch-Index-Puffer`
    );
    // DIE GESCHWISTER (Kopf-Kommentar, `geschwisterRaum`): zwei Skelette mit geteiltem Bau, das zweite betritt die Szene, während
    // jede Kaskade fällig ist — die Reihenfolge, an der der Schirm stand, ist erzwungen und gemessen, nie erhofft
    console.log(`  Geschwister-Raum: ${JSON.stringify(await page.evaluate(geschwisterRaum))}`);
    const gZeile = (g) =>
        `${g.name}: zuerst ${g.zuerst}${g.szeneFolgt ? ", der Szenen-Knoten im selben Bild" : ""} · Vor ${g.vor ? "steht" : "fehlt"} · Kette ${g.kette ? "zeichnet" : "gebrochen"} · das Licht wirft ${g.wirft ? "ja" : "nein"}${g.bruch ? " · " + g.bruch : ""}`;
    await schritt("geschwister", async () => {
        const g = await page.evaluate(async () => {
            const G = window.__frostWand.geschwister;
            const ab = G.sonde();
            try {
                const eins = await G.eintritt(G.neu("frost-geschwister-1", -0.7));
                return { eins, zwei: await G.eintritt(G.neu("frost-geschwister-2", 0.7)) };
            } finally {
                ab();
                G.fort();
            }
        });
        check(
            "geschwister: die Reihenfolge stand — das zweite Skelett rückte zuerst der Schatten-Knoten (ohne Vor), der Szenen-Knoten folgte im selben Bild (sonst ungemessen)",
            g.zwei.zuerst === "schatten" && g.zwei.szeneFolgt === true && !g.zwei.bruch,
            `${gZeile(g.eins)} | ${gZeile(g.zwei)}`
        );
        check("geschwister: das zweite Skelett trägt sein Vor (`previousBoneMatrices`), die Post-Kette zeichnet weiter", g.zwei.vor && g.zwei.kette, gZeile(g.zwei));
        return { eins: g.eins.zuerst, zwei: g.zwei.zuerst };
    });
    await schritt("werkstatt-eiche", async () => {
        const wahl = await page.evaluate(() => {
            r.toggleDrawer("werkstatt");
            if (st.blueprints?.baum_eiche)
                return r.selectBlueprintForEdit("baum_eiche") ? "baum_eiche" : null;
            return null;
        });
        const b = await warteBuehne("werkstatt");
        await page.evaluate(() => r.closeAllDrawers());
        return { wahl, ...b };
    });
    await schritt("tab-ich-buehne", async () => {
        await page.evaluate(() => r.toggleInventoryOverlay(true));
        const b = await warteBuehne("ich");
        await page.evaluate(() => r.toggleInventoryOverlay(false));
        return b;
    });
    await schritt("hof-buehne", async () => {
        await page.evaluate(() => r.toggleDrawer("kreaturen"));
        const b = await warteBuehne("hof");
        await page.evaluate(() => r.closeAllDrawers());
        return b;
    });

    // S — DIE ENTSORGUNG DER BÜHNEN: Ich-, Hof-, Feed-Bühne, Werkstatt-Ofen und Mitspieler-Leib bauen aus denselben Vorlagen
    // wie die Welt. Die Probe zählt je Phase jede Welt-Geometrie und jeden Welt-Stoff, den ein Wechsel SELBST in die
    // Entsorgungs-Schlange legt (echt streamt die Welt nebenher), und leert die Schlange wie `_loopRender`.
    await page.evaluate(() => {
        const F = window.__frostWand;
        const dev = st.renderer.backend.device;
        const welt = new Map();
        const pfad = (o) => {
            const t = [];
            for (let x = o; x && t.length < 6; x = x.parent) t.unshift(x.name || x.type);
            return t.join("/");
        };
        const sammle = (w) =>
            w.traverse((o) => {
                if (o.geometry && !welt.has(o.geometry)) welt.set(o.geometry, "Geometrie " + pfad(o));
                const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
                for (const m of ms) if (!welt.has(m)) welt.set(m, `Stoff ${m.name || m.type} an ${pfad(o)}`);
            });
        sammle(st.scene);
        if (F.wurzel !== st.scene) sammle(F.wurzel);
        const E = (window.__frostEntsorgung = { phase: null, je: {}, welt: welt.size });
        // echt ruht der Spiel-Takt für die Entsorgungs-Proben (Lehre 17: sonst baut die laufende Welt nebenher neu); die Welt-GPU zeichnet über
        // `_loopRender` (Bild + Kehraus + die Entsorgungs-Schlange), die Bühnen zeichnen in ihrem eigenen Takt weiter.
        st.renderer.setAnimationLoop(null);
        F.zeichneTakt = F.zeichne;
        F.zeichne = async (n) => {
            for (let i = 0; i < n; i++) {
                r._loopRender();
                await dev.queue.onSubmittedWorkDone();
            }
        };
        const roh = r._queueDispose;
        r._queueDispose = function (obj) {
            const p = E.phase && (E.je[E.phase] || (E.je[E.phase] = { alle: 0, namen: [], objekte: new Set() }));
            if (p) {
                p.alle++;
                if (welt.has(obj)) {
                    p.namen.push(welt.get(obj));
                    p.objekte.add(obj);
                }
            }
            return roh.call(this, obj);
        };
        E.im = (phase, tu) => {
            E.phase = phase;
            try {
                return tu();
            } finally {
                E.phase = null;
            }
        };
        E.bericht = (phase) => {
            const p = E.je[phase] || { alle: 0, namen: [], objekte: new Set() };
            const geo = [...p.objekte].filter((o) => o.isBufferGeometry).length;
            return {
                alle: p.alle,
                welt: p.namen.length,
                geometrien: geo,
                stoffe: p.objekte.size - geo,
                namen: [...new Set(p.namen)].slice(0, 4),
            };
        };
        // Das Ende eines Frames wie `_loopRender`: der Kehraus (was kein Objekt des Graphen und kein Bild dieses Frames
        // zeichnet, verlässt die GPU — und mit ihr r184s Speicher-Buchung je Attribut) und die Entsorgungs-Schlange. Echt
        // zeichnet `_loopRender` selbst; die Kehraus-Uhr wird zurückgesetzt, damit er in diesem Frame läuft.
        E.leeren = async () => {
            st._gpuKehrausT = 0;
            return F.zeichne(8);
        };
        E.bau = (d) => Object.assign({ module: 0, pipelines: 0 }, d && d.__frostBau);
        E.warte = (holen, c0 = F.gezeichnet(holen())) => F.buehne("ein Bild der Bühne", holen, (n) => n > c0);
    });
    const entsorgtKeineWelt = (tag, b) =>
        check(
            `${tag}: keine Welt-Geometrie, kein Welt-Stoff entsorgt`,
            b.welt === 0,
            `${b.welt} von ${b.alle} Entsorgungen trafen die Welt (${b.geometrien} Geometrien + ${b.stoffe} Stoffe einzeln): ${b.namen.join(" | ")}`
        );

    // S1/S2/S4 — der Seelenwechsel über den Spielerpfad (`applyPlayerSoul` bei offenem Ich: Ich-Bühne UND Welt-Leib, der
    // Mitspieler empfängt ihn) je Art↔human, Hof-Bühne 4 Seelen ×2. Zwei Durchgänge: der erste wärmt, der zweite misst die Neubauten JE DEVICE gegen die geschlossene Bühne.
    // NEUBAU_MAX steht zwischen dem Rauschen und dem Rückfall. Der Rückfall, den die Wand fängt — die GPU kompiliert JE Wechsel
    // neu —, kostet ≥ 16 (8 Ich- und 8 Hof-Wechsel je Durchgang). Das Rauschen war bis w28-frost-waerme der Rest des Wärm-Durchgangs:
    // er wartete je Seele EIN Bild (`F.ungezeichnet` oben), was er nicht zeichnete, baute im gemessenen — GTX 1060, main ab2f2eed,
    // 7 Läufe am 11.11.: +3 Module / +2 Pipelines bis +4 / +3 (z374 und z377 +2 / +1, z379 dreimal ROT an der Schwelle 2, darum stand
    // sie für einen Zug auf 4). Mit dem Warten, das zählt: 6 von 6 Läufen +0 / +0 (150–185 s je Lauf). Die Schwelle 2 hält den
    // Abstand zu beiden Seiten.
    const NEUBAU_MAX = 2;
    const ICH_TRI_MIN = 10000; // der Block-Zwilling der Bauplan-Teile trägt 5 388
    const seelen = await page.evaluate(
        async () => {
            const F = window.__frostWand;
            const E = window.__frostEntsorgung;
            let tausch = 0;
            const wechsle = async (holen, zeige) => {
                const alt = holen() && holen().pivot;
                E.im("seelen", zeige);
                if (alt && holen().pivot !== alt) tausch++;
                await E.warte(holen);
            };
            // der Leib einer Gruppe gegen den Welt-Leib: sichtbare Meshes (der Peer ist unsichtbar geboren), Geometrien, die er
            // nicht trägt, Dreiecke
            const leiber = {};
            const leib = (pivot) => {
                const welt = new Set(),
                    b = [];
                F.leib.traverse((o) => o.isMesh && welt.add(o.geometry));
                if (pivot) for (const c of pivot.children) c.traverseVisible((o) => o.isMesh && b.push(o.geometry));
                const tri = b.reduce((n, g) => n + (g.index || g.attributes.position).count / 3, 0);
                return { meshe: b.length, fremd: b.filter((g) => !welt.has(g)).length, tri };
            };
            // der Mitspieler empfängt jede Seele, wie `_p2pBroadcastSoul` sie sendet (Name, Bauplan-Teile einer eigenen Seele)
            const peer = { peerId: "frost-peer" };
            const durchgang = async () => {
                r.toggleInventoryOverlay(true);
                for (const s of Object.keys(AnazhRealm.TETRAPODA_SOUL_MAP).flatMap((a) => [a, "human"])) {
                    await wechsle(
                        () => st.ichStage,
                        () => r.applyPlayerSoul(s === "human" ? s : "koerper_" + s)
                    );
                    peer.soulName = st.player.soul;
                    peer.bodyParts = (st.customSouls[peer.soulName] || {}).bodyParts;
                    E.im("seelen", () => r._p2pApplyPeerSoul(peer));
                    leiber[s] = { ich: leib(st.ichStage.pivot), peer: leib(peer.mesh) };
                    await F.leibWechsel();
                }
                r.toggleInventoryOverlay(false);
                r.toggleDrawer("kreaturen");
                for (let k = 0; k < 2; k++)
                    for (const s of ["wolf", "fuchs", "baer", "wesen"])
                        await wechsle(
                            () => st.hofStage,
                            () => r._hofStageShow(s)
                        );
                r.closeAllDrawers();
                await E.leeren();
                await F.zeichne(8);
            };
            await durchgang();
            // das EINE Gerät (die Bühnen zeichnen auf ihm): Bauten vor und nach der Ruhe, dann der gemessene Durchgang
            const dev = st.renderer.backend.device;
            const vor = E.bau(dev);
            await F.zeichne(8);
            const ruhe = E.bau(dev);
            const n0 = F.bauten.length;
            await durchgang();
            const nach = E.bau(dev),
                d = (g) => nach[g] - ruhe[g] - (ruhe[g] - vor[g]);
            const neubau = { module: d("module"), pipelines: d("pipelines") };
            const neu = F.bauten.slice(n0, n0 + 6);
            // der Selbsttest des Zählers der Ungezeichneten: Gruppen allein zählen 0 (nie NaN), ein Mesh ohne Blick-Probe, das nie
            // zeichnete, zählt 1
            const probe = new THREE.Group().add(new THREE.Group());
            const zaehlerSelbst = [F.ungezeichnet(probe, st.camera), F.ungezeichnet(probe.add(Object.assign(new THREE.Mesh(), { frustumCulled: false })), st.camera)];
            // ZWILLINGE: Vertex-Texte, die nur `NodeBuffer_<id>` trennt oder nur die Knochenzahl — r184 schreibt `skeleton.bones.length` als
            // Feldgröße der Knochen-Tafel in den Text (w28-fell-programm; GTX 1060, main ab2f2eed: acht Abdrücke für 29/27/22/21/10/7/6/3).
            // Je Gruppe gleicher Texte ihre Knochenzahlen.
            const zwillinge = (codes) => {
                const je = {};
                for (const c of codes) (je[c.replace(/NodeBuffer_\d+|(?<=array< mat4x4<f32>), \d+/g, "")] ||= []).push(c.match(/array< mat4x4<f32>, (\d+)/)?.[1] || "–");
                return Object.values(je).filter((z) => z[1]).map((z) => z.join("/")) + "";
            };
            const programmZwillinge = zwillinge([...st.renderer._pipelines.programs.vertex.keys()]);
            const zwillingSelbst = zwillinge(["NodeBuffer_1", "NodeBuffer_2", "x", "array< mat4x4<f32>, 29 >", "array< mat4x4<f32>, 3 >"]);
            // ZWILLINGE DES JAHRS (w28-baum-programm): zwei Foundry-Stoffe, deren Signatur (`_graphTeilen`) nur das Jahr trennt, bauen
            // je Zeichner-Form (Arena, Instanz, Satz) zwei Programme EINER Gestalt — an main c4010773 (GTX 1050, Wiese) vier Paare:
            // die Karten-Krone der Nadel, der Wurf der Nadelbäume und Bauten, ein Blumen-Teil nah und als wiegende Streu. Je Paar die
            // Signatur ohne das Jahr (sein Platz bleibt leer) und die Zahl der Stoffe mit und ohne.
            const jahrZwillinge = (sigs) => {
                const je = {};
                for (const s of sigs) {
                    const t = s.split("|");
                    const e = (je[t.map((x) => (x === "jahr" ? "" : x)).join("|")] ||= [0, 0]);
                    e[t.includes("jahr") ? 0 : 1]++;
                }
                return Object.entries(je)
                    .filter(([, [mit, ohne]]) => mit && ohne)
                    .map(([k, [mit, ohne]]) => `${k.split("|").filter(Boolean).join("|")} (${mit} mit, ${ohne} ohne)`) + "";
            };
            const stoffZwillinge = jahrZwillinge(Object.values(r._foundryMats).map((m) => m.userData.foundrySignatur).filter(Boolean));
            const jahrSelbst = jahrZwillinge(["foliage||krone", "foliage|jahr|krone", "foliage|jahr|krone", "bark|rinde|", "bark|rinde|"]);
            st.scene.remove(peer.mesh);
            E.im("seelen", () => r._disposeSoulGroup(peer.mesh)); // der Abschied des Mitspielers
            // der Selbsttest des Urteils: die leere Bühne und der Block-Zwilling aus den Bauplan-Teilen der Wolf-Seele
            const zw = r._buildFromBlueprint({ name: "frost-zwilling", parts: r._getSoulDef("bp_koerper_wolf").bodyParts });
            const selbst = { leer: leib(null), zwilling: leib(zw) };
            r._disposeSoulGroup(zw);
            return {
                ...E.bericht("seelen"),
                programmZwillinge,
                zwillingSelbst,
                stoffZwillinge,
                jahrSelbst,
                zaehlerSelbst,
                leiber,
                selbst,
                tausch,
                neubau,
                neu,
            };
        }
    );
    console.log(`\n[seelenwechsel] ${zeit()} · ${JSON.stringify(seelen).slice(0, 500)}`);
    entsorgtKeineWelt("S1 Seelenwechsel (Ich, Welt-Leib und Mitspieler jede Art↔human, Hof 4 Seelen ×2, zwei Durchgänge)", seelen);
    const leibGut = (u) => u.meshe > 0 && u.fremd === 0 && u.tri >= ICH_TRI_MIN;
    for (const [s, je] of Object.entries(seelen.leiber))
        for (const [wer, u] of [["S1 Ich-Bühne", je.ich], ["S4 Mitspieler", je.peer]])
            check(`${wer} ${s}: der Leib der Welt`, leibGut(u), `${JSON.stringify(u)} (Soll fremd 0, tri ≥ ${ICH_TRI_MIN})`);
    check("S1 Selbsttest: leere Bühne und Block-Zwilling sind ROT", !leibGut(seelen.selbst.leer) && !leibGut(seelen.selbst.zwilling), seelen.selbst);
    // nie vakuös: die Bühnen tauschten wirklich ihre Gestalt (dass sie Geometrie trugen, zeigt der Leib je Seele)
    check("S1 die Probe wechselt wirklich (Ich ×8 + Hof ×8 je Durchgang)", seelen.tausch >= 24, `${seelen.tausch} Wechsel`);
    // je gemessenem Durchgang, auf dem EINEN Gerät (Welt, Ich- und Hof-Bühne)
    const n = seelen.neubau;
    check(
        "S2 die GPU (Welt und Bühnen) kompiliert beim Seelenwechsel nicht nach (der Knoten-Bau der Zwischen-Seele bleibt)",
        n.module <= NEUBAU_MAX && n.pipelines <= NEUBAU_MAX,
        `+${n.module} Module / +${n.pipelines} Pipelines gegen die geschlossene Bühne (Soll ≤ ${NEUBAU_MAX})${seelen.neu.length ? " — neu: " + seelen.neu.join(", ") : ""}`
    );

    check("S2 Selbsttest: der Zähler der Ungezeichneten zählt 0 und 1", seelen.zaehlerSelbst + "" === "0,1", seelen.zaehlerSelbst);
    check("S2 je Gestalt EIN Programm (Welt und Bühnen: kein Zwilling, den nur NodeBuffer_<id> oder die Knochenzahl trennt)", seelen.programmZwillinge === "" && seelen.zwillingSelbst === "–/–,29/3", `Zwillinge ${seelen.programmZwillinge || "keine"} (je Gruppe die Knochenzahlen) · Selbsttest ${seelen.zwillingSelbst} (Soll –/–,29/3)`);
    check("S2 je Gestalt EIN Programm: kein Foundry-Stoff, den nur das Jahr trennt (jede Art des Jahrs trägt Ecken)", seelen.stoffZwillinge === "" && seelen.jahrSelbst === "foliage|krone (2 mit, 1 ohne)", `Paare ${seelen.stoffZwillinge || "keine"} · Selbsttest ${seelen.jahrSelbst} (Soll foliage|krone (2 mit, 1 ohne))`);

    // S3 — die Feed-Vorschau: Wesen-Karten (4 Seelen) und eine Rezept-Karte (Bauplan-Teile, eigene Geometrie), zweimal.
    const feed = await page.evaluate(async () => {
        const E = window.__frostEntsorgung;
        const st = r._feedEnsurePreview();
        if (!st) return { fehlt: "keine Feed-Bühne" };
        st.active = true;
        r._feedPreviewStartRAF();
        const bp = r.state.blueprints && r.state.blueprints.baum_eiche;
        const karten = ["wolf", "fuchs", "baer", "wesen"].map((s) => ({
            id: "w:" + s,
            kind: "creature",
            prof: { soul: s },
        }));
        if (bp) karten.push({ id: "r:eiche", kind: "recipe", prof: { bp } });
        let tausch = 0,
            vorgelegt = 0;
        for (let k = 0; k < 2; k++)
            for (const karte of karten) {
                const alt = st.pivot;
                E.im("feed", () => r._feedPreviewShow(karte));
                if (alt && st.pivot !== alt) {
                    tausch++;
                    alt.traverse((o) => o.geometry && vorgelegt++);
                }
                await E.warte(() => r.state.feedPreview);
            }
        st.active = false;
        await E.leeren();
        return { ...E.bericht("feed"), tausch, vorgelegt, karten: karten.length };
    });
    console.log(`\n[feed-vorschau] ${zeit()} · ${JSON.stringify(feed).slice(0, 300)}`);
    entsorgtKeineWelt("S3 Feed-Vorschau (4 Wesen + Rezept, zwei Durchgänge)", feed);
    check(
        "S3 die Probe wechselt wirklich (Feed, mit Geometrie)",
        !feed.fehlt && feed.tausch >= 8 && feed.vorgelegt > 0,
        feed.fehlt || `${feed.tausch} Wechsel, ${feed.vorgelegt} Geometrien vorgelegt`
    );

    // Der JS-Speicher nach erzwungener Sammlung (CDP: HeapProfiler.collectGarbage, Runtime.getHeapUsage) — genau, ohne die
    // Rundung von performance.memory.
    const cdp = await page.target().createCDPSession();
    const heapMB = async () => {
        for (let i = 0; i < 3; i++) {
            await cdp.send("HeapProfiler.collectGarbage");
            await sleep(150);
        }
        const h = await cdp.send("Runtime.getHeapUsage");
        // der JS-Heap UND die Puffer dahinter (Vertex- und Index-Arrays liegen als ArrayBuffer außerhalb des Heaps)
        return +(((h.usedSize || 0) + (h.backingStorageSize || 0) + (h.embedderHeapUsedSize || 0)) / 1048576).toFixed(
            1
        );
    };
    // DAS FENSTER OHNE VERDICHTUNG (S5, S6): ein Welt-Satz schrumpft `ruheTakte` Render-Takte nach dem Beginn seiner Frist
    // (`_chunkSatzVerdichten`), die alte Generation seiner Arrays hält jedes Render-Objekt, das ihn nicht neu zeichnet — fiel
    // das ins Fenster, zählte S5 die Welt mit. Darum ruht die Verdichtung der Welt für das Fenster (wie die Probe
    // `_queueDispose` zählt), danach nennt die Linse jeden Satz, der doch verdichtete.
    const fenster = (auf) =>
        page.evaluate((auf) => {
            const S = [...(st.chunkSaetze || new Map()).values()];
            if (!auf) delete r._chunkSatzVerdichten;
            else
                [window.__frostFenster, r._chunkSatzVerdichten] = [
                    new Map(S.map((s) => [s, s.verdichtet || 0])),
                    () => false,
                ];
            return [...(window.__frostFenster || [])]
                .filter(([s, v]) => (s.verdichtet || 0) !== v)
                .map(([s]) => s.mesh.name);
        }, auf);

    // S5 — der Werkstatt-Ofen, der Regler-Zug: 20 Werte eines Reglers am Wolf. Jeder Wert ist ein Einzelstück (es gehört dem
    // Ofen, nie dem Memo); der Ofen entsorgt das vorige beim Wechsel, mit den Render-Objekten des Werkstatt-Renderers.
    // Grafikspeicher, Geometrie-Zahl, Ofen-Memo, Stoff-Hörer und JS-Speicher bleiben beschränkt.
    const ofenStart = await page.evaluate(async (leck) => {
        const E = window.__frostEntsorgung;
        r.toggleDrawer("werkstatt");
        const f = r._foundry;
        const ids = f?.recipes ? Object.keys(f.recipes).filter((k) => f.recipes[k].kind === "kreatur") : [];
        const id = ids.includes("wolf") ? "wolf" : ids[0];
        if (!id) return { fehlt: "kein Kreatur-Rezept" };
        r.selectStudioRecipeForView(id);
        const ws = r._ensureWorkshopState();
        const holen = () => ws.preview;
        await E.warte(holen);
        const G = window.__tetrapodaCore.GATTUNGEN;
        const recId = AnazhRealm.TETRAPODA_SOUL_MAP?.[id] || id;
        const basis = G[recId] || G.wolf;
        const dial = Object.keys(basis).find((k) => typeof basis[k] === "number" && basis[k] > 0.2);
        const stoffe = new Set();
        const O = (window.__frostOfen = { id, dial, basis: basis[dial], stoffe });
        // DAS KONTO DER WERKSTATT (z133): sie zeichnet auf der Welt-GPU, deren Zähler (`info.memory`) die lebende Welt
        // mitzählt — im Fenster trat die Gras-Arena der Nah-Wiese (`nahWiese:Lf:1:0`) in ihren ersten Zug, S5 nannte die
        // Werkstatt um eine Geometrie gewachsen (Radeon: Stamm 25ac4c0c 1 von 2 Läufen, Kandidat z133 3 von 4, sein Läufer
        // zweimal). S5 führt ein Konto jeder Geometrie, die das Einzelstück trug, bis ihr dispose sie löst.
        const K = new Set();
        O.mess = () => {
            let hoerer = 0;
            for (const s of stoffe) hoerer += s._listeners?.dispose ? s._listeners.dispose.length : 0;
            let b = 0;
            for (const g of K) for (const a of Object.values(g.attributes)) b += a.array.byteLength;
            return {
                memo: AnazhRealm._tierOfenMemo ? AnazhRealm._tierOfenMemo.size : 0,
                geometrien: K.size,
                MB: +(b / 1048576).toFixed(2),
                stoffe: stoffe.size,
                hoerer,
            };
        };
        O.zug = async (i) => {
            ws.studioOv = ws.studioOv || {};
            ws.studioOv[id] = { [dial]: +(O.basis * (1 + 0.01 * i)).toFixed(4) };
            E.im("ofen", () => r._workshopRebuildPreviewMesh());
            await E.warte(holen);
            ws.preview.currentMesh.traverse((o) => {
                const g = o.geometry;
                if (o.material) [].concat(o.material).forEach((s) => stoffe.add(s));
                // der Mutant `--s5=leck`: kein Einzelstück entsorgt seine Geometrie — das Konto wächst, S5 ROT
                if (!g || K.has(g)) return;
                K.add(g);
                g.addEventListener("dispose", () => K.delete(g));
                if (leck) g.dispose = () => {};
            });
            await E.leeren();
        };
        for (let i = 0; i <= 2; i++) await O.zug(i);
        return { id, dial, vor: O.mess() };
    }, LECK);
    let ofen = ofenStart;
    if (!ofen.fehlt) {
        const ruhe = await fenster(true);
        const heapVor = await heapMB();
        const nach = await page.evaluate(async () => {
            const O = window.__frostOfen;
            for (let i = 3; i <= 20; i++) await O.zug(i);
            await window.__frostEntsorgung.leeren();
            return O.mess();
        });
        const heapNach = await heapMB();
        ruhe.push(...(await fenster(false)));
        const bericht = await page.evaluate(() => {
            r.closeAllDrawers();
            return window.__frostEntsorgung.bericht("ofen");
        });
        ofen = { ...bericht, ...ofenStart, nach, heapVor, heapNach, ruhe };
    }
    console.log(`\n[werkstatt-ofen] ${zeit()} · ${JSON.stringify(ofen).slice(0, 500)}`);
    if (ofen.fehlt) check("S5 Werkstatt-Ofen: ein Kreatur-Rezept trägt den Regler-Zug", false, ofen.fehlt);
    else {
        entsorgtKeineWelt(`S5 Werkstatt-Ofen (Regler-Zug ${ofen.id}.${ofen.dial}, 20 Werte)`, ofen);
        const { vor, nach, ruhe } = ofen;
        check(
            "S5 das Ofen-Memo hält kein Regler-Einzelstück",
            nach.memo === vor.memo,
            `Memo ${vor.memo} → ${nach.memo} über 18 Werte`
        );
        check(
            "S5 Grafikspeicher und Geometrie-Zahl der Werkstatt bleiben beschränkt",
            vor.geometrien > 0 && nach.geometrien <= vor.geometrien && nach.MB <= vor.MB + 0.5,
            `Geometrien ${vor.geometrien} → ${nach.geometrien}, Geometrie-Speicher ${vor.MB} → ${nach.MB} MB über 18 Werte (das Konto des Einzelstücks)`
        );
        check(
            "S5 die geteilten Stoffe sammeln keine Hörer (die Render-Objekte des Einzelstücks lösen sich)",
            nach.hoerer <= vor.hoerer,
            `${nach.stoffe} Stoffe, dispose-Hörer ${vor.hoerer} → ${nach.hoerer} über 18 Werte`
        );
        check(
            "S5 der JS-Speicher bleibt beschränkt (kein Welt-Satz verdichtet im Fenster)",
            ofen.heapNach - ofen.heapVor <= 10 && !ruhe.length,
            `${ofen.heapVor} → ${ofen.heapNach} MB über 18 Werte (Soll ≤ +10 MB)${ruhe.length ? ", im Fenster verdichtet " + ruhe.join(" · ") : ""}`
        );
    }

    // S6 — die Mitspieler-Erscheinungen: 10 Peers „human" mit je eigener Übergabe (height), jeder ein eigener Ofen-Guss (zwei
    // Vorlagen), dann ihr Abschied. Eine Vorlage ohne lebenden Leib fällt (die Grenze des Ofen-Memos, `_ofenVorlage`) — vorher
    // +2 Einträge und ~9,6 MB JS je Erscheinung, nie freigegeben.
    const peersVor = await page.evaluate(async () => ({
        memo: AnazhRealm._tierOfenMemo ? AnazhRealm._tierOfenMemo.size : 0,
        ruhend: AnazhRealm.OFEN_MEMO_RUHEND || 0,
    }));
    const ruhePeers = await fenster(true);
    const heapPeersVor = await heapMB();
    const peers = await page.evaluate(async () => {
        const F = window.__frostWand;
        const E = window.__frostEntsorgung;
        const leiber = [];
        let spitze = 0;
        for (let i = 1; i <= 10; i++) {
            const e = {
                peerId: "frost-erscheinung-" + i,
                soulName: "human",
                uebergabe: { height: +(1 + 0.04 * i).toFixed(3) },
            };
            E.im("peers", () => r._p2pApplyPeerSoul(e));
            if (e.mesh) leiber.push(e.mesh);
            await F.zeichne(2);
            spitze = Math.max(spitze, AnazhRealm._tierOfenMemo.size);
        }
        for (const m of leiber) {
            st.scene.remove(m);
            E.im("peers", () => r._disposeSoulGroup(m));
        }
        await E.leeren();
        return { ...E.bericht("peers"), leiber: leiber.length, spitze, memo: AnazhRealm._tierOfenMemo.size };
    });
    const heapPeersNach = await heapMB();
    ruhePeers.push(...(await fenster(false)));
    console.log(
        `\n[mitspieler-erscheinungen] ${zeit()} · ${JSON.stringify({ ...peers, memoVor: peersVor.memo, heapPeersVor, heapPeersNach }).slice(0, 400)}`
    );
    entsorgtKeineWelt("S6 Mitspieler-Erscheinungen (10 Peers human, Abschied)", peers);
    check(
        "S6 die Probe gießt zehn Erscheinungen (jede ihre Vorlagen)",
        peers.leiber === 10 && peers.spitze >= peersVor.memo + 10,
        `${peers.leiber} Leiber, Memo-Spitze ${peers.spitze} (vor ${peersVor.memo})`
    );
    check(
        "S6 das Ofen-Memo ist begrenzt: nach dem Abschied bleiben höchstens OFEN_MEMO_RUHEND Vorlagen ohne Leib",
        peers.memo <= peersVor.memo + peersVor.ruhend,
        `Memo ${peersVor.memo} → Spitze ${peers.spitze} → ${peers.memo} (Grenze +${peersVor.ruhend})`
    );
    check(
        "S6 der JS-Speicher fällt mit dem Abschied zurück",
        heapPeersNach - heapPeersVor <= 20 && !ruhePeers.length,
        `${heapPeersVor} → ${heapPeersNach} MB nach 10 Erscheinungen und Abschied (Soll ≤ +20 MB)${ruhePeers.length ? ", im Fenster verdichtet " + ruhePeers.join(" · ") : ""}`
    );

    await page.evaluate(() => {
        const F = window.__frostWand;
        delete r._queueDispose;
        if (F.zeichneTakt) {
            F.zeichne = F.zeichneTakt;
            st.renderer.setAnimationLoop(r._gameLoopTick);
        }
    });

    // DER NACHLAUF: eine Validierung, die r184 in einem offenen Pipeline-Fehler-Bereich fängt, meldet sich erst, wenn der
    // async Pipeline-Bau endet — fünf Bilder Zeichnen (je ≥ 600 ms), dann darf kein Wort nachkommen.
    await page.evaluate(async () => {
        for (let i = 0; i < 5; i++) await window.__frostWand.zeichne(1);
    });
    {
        const l = await lage();
        check(
            "Nachlauf: kein verspätetes Wort einer Validierung",
            l.hoer === 0 && (!l.gpuWache || l.gpuWache.n === 0),
            l.hoer ? `${l.hoer} Meldungen: ${l.hoerErste.join(" | ")}` : ""
        );
    }

    // P2 — DER PFAD UND DER ZWANG: ein Index ungerader Länge der Ich-Bühne, neu (wie `_gpuAbschied`), ganz und ab Element 1
    const p2 = await page.evaluate(async () => {
        const T = window.THREE,
            W = window.__frostHoer.puffer,
            st = r.state.ichStage;
        const g = new T.BufferGeometry().setIndex([0, 1, 2, 0, 1]);
        g.index.name = "Ich-Bühne Probe-Index";
        const m = new T.Mesh(g.setAttribute("position", new T.Float32BufferAttribute(new Array(9).fill(0), 3)));
        m.frustumCulled = false;
        st.scene.add(m);
        let bruch = "";
        try {
            for (const k of [0, 1, 2]) {
                if (k > 1) g.index.addUpdateRange(1, 3);
                g.index.needsUpdate = k > 0;
                r._buehneRender(st.renderer, st.scene, st.camera, "Ich-Bühne");
                // die Erst-Zeichnung baut asynchron: erst wenn die Probe zeichnete, schreibt der nächste Gang nach
                for (let i = 0; i < 200 && !r._erstZeichnung.gezeichnet.get(m); i++) {
                    await sleep(50);
                    r._buehneRender(st.renderer, st.scene, st.camera, "Ich-Bühne");
                }
            }
        } catch (e) {
            bruch = e.message;
        }
        st.scene.remove(m);
        g.dispose();
        return [...W.schief, bruch].filter(Boolean).join(" | ") || `${W.n} writeBuffer, keiner schief`;
    });
    check(
        "P2 kein writeBuffer schief: der Pfad und ein Index ungerader Länge der Ich-Bühne",
        /keiner schief$/.test(p2),
        p2
    );

    // DIE TÄTER — die Wand beweist sich an jedem Lauf.
    console.log("\n=== DIE TÄTER (die Wachen und die Bild-Probe beißen) ===");
    // T1 — ein Index über der Vertex-Zahl, zweimal: als Index des Vendors (Uint16) und als Storage-Index (`_sichtSpeicher`, wie
    // der Bau-Satz seit E9 — der Compute der Sicht liest ihn, wo er liegt). Die Wache nennt BEIDE beim Namen. Gelesen wird, wenn
    // beide gezeichnet haben (das Ereignis der Erst-Zeichnung, `F.ungezeichnet`), nie nach einer Zahl von Bildern: der neue Stoff
    // baut in Raten (`_knotenRate`) — GTX 1050 im Spiel-Takt, main a71e06c7 und einheit-sicht 9f1c5ff3: erst nach 49 und 59
    // Bildern (6,0 und 6,6 s) zeichnete der Täter, die Wache nannte ihn an beiden. Bis hier las T1 nach 600 ms + 8 Bildern und
    // urteilte die Bau-Ration statt der Wache (z637 ROT am Kandidaten).
    const t1 = await page.evaluate(async () => {
        const T = window.THREE;
        const F = window.__frostWand;
        const cam = st.camera;
        const taeter = (name, index) => {
            const geo = new T.BufferGeometry();
            geo.setAttribute("position", new T.BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
            geo.setIndex(index);
            const m = new T.Mesh(geo, new T.MeshBasicNodeMaterial({ color: 0xff00ff }));
            m.name = name;
            m.frustumCulled = false;
            m.position.copy(new T.Vector3(0, 0, -2).applyQuaternion(cam.quaternion).add(cam.position));
            F.wurzel.add(m);
            return m;
        };
        const ms = [
            taeter("frost-taeter-bereich", new T.BufferAttribute(new Uint16Array([0, 1, 3]), 1)),
            taeter("frost-taeter-speicher", r._sichtSpeicher(new Uint32Array([0, 1, 3]))),
        ];
        const N = st.renderer._nodes.nodeFrame,
            a = N.frameId;
        let bruch = "";
        try {
            for (const weiter = __deckel("die Täter T1 im Bild", 100); ms.some((m) => F.ungezeichnet(m, cam)) && weiter(); )
                await F.zeichne(1);
        } catch (e) {
            bruch = e.message;
        }
        for (const m of ms) F.wurzel.remove(m);
        const W = r._indexWache;
        return {
            bilder: N.frameId - a,
            bruch,
            namen: W ? W.brueche.filter((b) => b.art === "bereich").map((b) => `${b.objekt}: ${b.detail}`) : [],
        };
    });
    check(
        "T1 die Index-Wache nennt den Index über der Vertex-Zahl beim Namen — Vendor- und Storage-Index",
        ["frost-taeter-bereich", "frost-taeter-speicher"].every((n) => t1.namen.some((s) => s.includes(n))),
        `gezeichnet nach ${t1.bilder} Bildern${t1.bruch ? " · " + t1.bruch : ""} · ${t1.namen.join(" | ") || "keiner genannt"}`
    );
    // T3 — die Puffer-Wache beißt: 3 × Uint16 (6 Bytes) auf einen eigenen Puffer der Welt-GPU
    const t3 = await page.evaluate(() => {
        const W = window.__frostHoer.puffer,
            dev = st.renderer.backend.device;
        const buf = dev.createBuffer({ label: "frost-taeter-puffer", size: 8, usage: GPUBufferUsage.COPY_DST });
        try {
            dev.queue.writeBuffer(buf, 0, new Uint16Array(3));
        } catch (e) {
            return `${W.schief[W.schief.length - 1]} · geworfen: ${e.message}`;
        } finally {
            buf.destroy();
        }
        return "nicht geworfen";
    });
    check(
        "T3 die Puffer-Wache nennt den schiefen writeBuffer beim Namen, WebGPU wirft",
        /frost-taeter-puffer · Uint16Array · Versatz 0 · 6 B .*geworfen: \S/.test(t3),
        t3
    );
    selbsttest("T4 (der fremde Fehler im Bau einer Pipeline), T5 (der Wurf im Szenen-Pass) und T2 (der geweitete Mensch-Index)"); // jede Meldung der Seite ab hier ist der Täter der Wand, kein Fehler der Welt
    // T4 — DER FREMDE FEHLER IM BAU EINER PIPELINE (leib-nah-ganz, `_erstAbsageWache`): r184 hält den Fehler-Bereich eines asynchronen
    // Pipeline-Baus über dessen Versprechen offen; die Validierung eines FREMDEN Befehls dazwischen markierte die Pipeline für immer
    // als kaputt, jeder Stoff ihres Programms zeichnete nie wieder (stadt-voll, main 6699a813: 4 von 4 Bewohnern näher als 6 m ohne
    // Haut und Stoff). Der Täter wirft im Zug nach jedem Ruf eines Pipeline-Baus eine fremde Validierung (ein writeBuffer über das
    // Ende seines Puffers), während ein Probe-Mesh mit eigenem Programm baut. Am Spiel trägt KEINE Pipeline die Marke, der Abgriff
    // schloss r184s Bereich, die GPU-Wache zählt die fremde Validierung; der Mutant (main: der Abgriff am `pushErrorScope` gelöst,
    // der Bereich bleibt über das Versprechen offen) markiert die Pipeline. Gelesen wird, wenn jeder Bau und jedes Urteil eines
    // Fehler-Bereichs seit dem Täter sich entschieden hat (das Ereignis, nie die Uhr).
    const t4Ab = Date.now();
    const t4 = await page.evaluate(async () => {
        const T = window.THREE;
        const F = window.__frostWand;
        const [cam, rend, E] = [st.camera, st.renderer, r._erstZeichnung];
        const [be, dev] = [rend.backend, rend.backend.device];
        const P = Object.getPrototypeOf(dev);
        const puffer = dev.createBuffer({ label: "frost-taeter-fremd", size: 8, usage: GPUBufferUsage.COPY_DST });
        const [bauAlt, zuAlt] = [P.createRenderPipelineAsync, P.popErrorScope];
        const offen = new Set();
        const haelt = (p) => (offen.add(p), p.then(() => offen.delete(p), () => offen.delete(p)), p); // prettier-ignore
        let [fremd, bauten] = [0, 0];
        P.createRenderPipelineAsync = function (d) {
            bauten++;
            // der fremde Befehl im NÄCHSTEN Zug: nach dem Ruf des Baus, vor seinem Versprechen
            queueMicrotask(() => (fremd++, this.queue.writeBuffer(puffer, 0, new Uint8Array(16))));
            return haelt(bauAlt.call(this, d));
        };
        P.popErrorScope = function () {
            return haelt(zuAlt.call(this));
        };
        // die Pipelines, die r184 für kaputt hält (`error`: `backend.draw` kehrt für sie still um)
        const marken = () => [...rend._pipelines.caches.values()].filter((p) => p && p.vertexProgram && be.get(p).error === true);
        const lauf = async (name, farbe) => {
            const geo = new T.BufferGeometry();
            geo.setAttribute("position", new T.BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
            const stoff = new T.MeshBasicNodeMaterial();
            stoff.name = name;
            stoff.colorNode = T.TSL.vec3(farbe, 0.25, 1 - farbe); // ein eigenes Programm: kein Stoff der Welt trägt diese Zeile
            const m = new T.Mesh(geo, stoff);
            m.name = name;
            m.frustumCulled = false;
            m.position.copy(new T.Vector3(0, 0, -2).applyQuaternion(cam.quaternion).add(cam.position));
            const vor = { marken: new Set(marken()), fremd, bauten, wache: r._gpuWache ? r._gpuWache.n : 0, bereiche: E.bereichN };
            F.wurzel.add(m);
            let bruch = "";
            try {
                for (const weiter = __deckel(`der Täter ${name} baut`, 100); (bauten === vor.bauten || F.ungezeichnet(m, cam)) && weiter(); ) await F.zeichne(1);
                for (const weiter = __deckel(`der Täter ${name}: Bau und Urteil entschieden`, 400); offen.size && weiter(); ) await sleep(50);
                await F.zeichne(1);
            } catch (e) {
                bruch = e.message;
            }
            F.wurzel.remove(m);
            const neu = marken().filter((p) => !vor.marken.has(p)).map((p) => E.namen.get(p) || "?");
            return { marken: neu, fremd: fremd - vor.fremd, bauten: bauten - vor.bauten, wache: (r._gpuWache ? r._gpuWache.n : 0) - vor.wache, bereiche: E.bereichN - vor.bereiche, bruch };
        };
        const aus = {};
        try {
            aus.spiel = await lauf("frost-taeter-fremd-spiel", 0.31);
            const abgriff = Object.hasOwn(dev, "pushErrorScope") ? dev.pushErrorScope : null;
            delete dev.pushErrorScope;
            try {
                aus.mutant = await lauf("frost-taeter-fremd-mutant", 0.73);
            } finally {
                if (abgriff) dev.pushErrorScope = abgriff;
            }
        } finally {
            [P.createRenderPipelineAsync, P.popErrorScope] = [bauAlt, zuAlt];
            puffer.destroy();
        }
        return aus;
    });
    const t4Ms = Date.now() - t4Ab;
    const t4Zeile = (x) => `${x.bauten} Bauten, ${x.fremd} fremde Validierungen, ${x.bereiche} Bereiche geschlossen, GPU-Wache +${x.wache}, Marken: ${x.marken.join(", ") || "keine"}${x.bruch ? " · " + x.bruch : ""}`;
    check(
        "T4 ein fremder Fehler im Bau einer Pipeline markiert keine Pipeline — der Abgriff schließt r184s Bereich, die GPU-Wache zählt den Fehler",
        t4.spiel.marken.length === 0 && t4.spiel.bauten > 0 && t4.spiel.fremd > 0 && t4.spiel.bereiche > 0 && t4.spiel.wache > 0,
        t4Zeile(t4.spiel)
    );
    check(
        "T4 der Mutant (main 6699a813: r184s Fehler-Bereich bleibt über das Versprechen des Baus offen) markiert die Pipeline des Täters",
        t4.mutant.marken.length > 0 && t4.mutant.bereiche === 0,
        `${t4Zeile(t4.mutant)} · T4 mit beiden Läufen in ${t4Ms} ms`
    );
    // T5 — DER TÄTER DER GESCHWISTER (Kopf-Kommentar): unter der alten Weiche des Knochen-Takts wirft der Szenen-Pass am
    // Geschwister (writeBuffer mit null als Daten). Am Kopf bricht die Post-Kette LAUT, der Stand des Renderers kehrt zurück
    // (`_rendererStand`): der Schirm folgt der Kamera im Direktpfad, und die Ich-Bühne — ihr Leinwand-Deskriptor entstand unter
    // der Kette — zeichnet weiter (`_leinwandTiefeGilt`). Der Mutant (die Rückkehr fällt aus) stellt den Schirm: Ziel und MRT des
    // Szenen-Passes bleiben stehen, der Direktpfad zeichnet in das Ziel der Kette.
    const t5Ab = Date.now();
    const t5 = await page.evaluate(async () => {
        const G = window.__frostWand.geschwister;
        const ab = G.sonde();
        let vorlauf;
        try {
            vorlauf = await G.eintritt(G.neu("frost-geschwister-3", -0.7));
        } finally {
            ab();
        }
        return { vorlauf, kopf: await G.taeter("frost-geschwister-4", 0.7, false) };
    });
    const t5Wurf = (x) => (x.brueche || []).find((b) => /^STOFF: die Post-Kette \(Render-Lauf/.test(b));
    const t5Zeile = (x) => (x.fehlt ? x.fehlt : `${gZeile(x)} · Brüche: ${(x.brueche || []).join(" | ") || "keine"}`);
    if (t5.kopf.fehlt) check("T5 der Täter der Geschwister ist baubar", false, t5.kopf.fehlt);
    else {
        check(
            "T5 die alte Weiche wirft im Szenen-Pass — Schatten zuerst, die Post-Kette bricht LAUT beim Namen",
            t5.kopf.zuerst === "schatten" && !!t5Wurf(t5.kopf) && t5.kopf.kette === false,
            `Vorlauf ${gZeile(t5.vorlauf)} | ${t5Zeile(t5.kopf)}`
        );
        const folgt = await bildPaar("t5-wurf");
        check(
            "T5 EIN Wurf stellt den Schirm nicht — das Folgebild folgt der Kamera im Direktpfad",
            folgt >= FOLGT_MIN,
            `${(folgt * 100).toFixed(2)} % der Blöcke (Soll ≥ ${FOLGT_MIN * 100} %)`
        );
        const ich = await page.evaluate(async () => {
            const F = window.__frostWand;
            const brueche = [];
            const melde = r._bruchMelden;
            r._bruchMelden = function (t) {
                brueche.push(String(t).slice(0, 240));
                return melde.apply(this, arguments);
            };
            const bilder = () => st.ichStage?.renderer?.buehne?.bilder || 0;
            const vor = bilder();
            let bruch = "";
            try {
                r.toggleInventoryOverlay(true);
                await F.buehne("die Ich-Bühne im Direktpfad", () => st.ichStage, (n) => n >= vor + 2);
            } catch (e) {
                bruch = e.message;
            } finally {
                r.toggleInventoryOverlay(false);
                delete r._bruchMelden;
            }
            return { direkt: st.postProcessingFailed === true, bilder: bilder() - vor, tiefe: st.renderer.depth, brueche, bruch };
        });
        check(
            "T5 die Ich-Bühne zeichnet im Direktpfad weiter — ihre Leinwand gilt für die Tiefe des Wegs",
            ich.direkt && ich.bilder >= 2 && !ich.brueche.length && !ich.bruch,
            JSON.stringify(ich)
        );
        // der Mutant: die Kette zurück, die Rückkehr des Stands fällt aus, ein weiteres Geschwister wirft
        const mut = await page.evaluate(async () => {
            const G = window.__frostWand.geschwister;
            G.heile();
            await window.__frostWand.zeichne(8);
            return G.taeter("frost-geschwister-5", 2.1, true);
        });
        const steht = await bildPaar("t5-mutant");
        check(
            "T5 der Mutant (die Rückkehr des Renderer-Stands fällt aus) stellt den Schirm",
            !!t5Wurf(mut) && steht < FOLGT_MIN,
            `${(steht * 100).toFixed(2)} % der Blöcke bewegt · ${t5Zeile(mut)}`
        );
        await page.evaluate(() => {
            const G = window.__frostWand.geschwister;
            G.heile();
            G.fort();
        });
        const zurueck = await bildPaar("t5-zurueck");
        const kette = await page.evaluate(() => st.postProcessingFailed !== true);
        check(
            "T5 nach dem Täter zeichnet die Post-Kette wieder, das Bild folgt der Kamera",
            kette && zurueck >= FOLGT_MIN,
            `${(zurueck * 100).toFixed(2)} % der Blöcke · Kette ${kette ? "zeichnet" : "gebrochen"} · T5 in ${Date.now() - t5Ab} ms`
        );
    }
    const hoerVor = (await lage()).hoer;
    const t2 = await page.evaluate(() => {
        const be = st.renderer.backend;
        let ziel = null;
        window.__frostWand.leib.traverse((o) => {
            const g = o.geometry;
            if (ziel || !o.visible || !g || !g.index || !(g.index.array instanceof Uint16Array)) return;
            if (be.data.has(g.index) && be.data.get(g.index).buffer) ziel = o;
        });
        if (!ziel) return null;
        const vor = r._gpuWache ? r._gpuWache.n : 0;
        // genau, was ein fremdes r184-Backend beim Anlegen tut: die geweitete Form zurück in das geteilte Attribut. Das Leib-
        // Bündel (E2) spielt seine schmale Aufnahme ab, bis es neu aufnimmt (Stufe, Sicht, Gerät): der Täter ist diese Aufnahme
        ziel.geometry.index.array = new Uint32Array(ziel.geometry.index.array);
        for (let o = ziel; o; o = o.parent) if (o.isBundleGroup === true) o.needsUpdate = true;
        return { geometrie: ziel.geometry.id, name: ziel.name || ziel.type, vor };
    });
    if (!t2) check("T2 der Mensch trägt einen schmalen Index auf der Welt-GPU", false, "kein Ziel");
    else {
        const steht = await bildPaar("taeter-format");
        // Das Wort der Validierung kommt, wenn sie gemeldet wird: sofort (uncapturederror) oder mit dem Ende des async
        // Pipeline-Baus, der den Fehler-Bereich offen hielt — die Wand zeichnet, solange ein Bau oder Fehler-Bereich offen ist (mindestens 8 Bilder).
        const tWort = Date.now();
        let l = await lage();
        for (let n = 0; (l.hoer === hoerVor || !l.gpuWache || !(l.gpuWache.n > t2.vor)) && (n++ < 8 || l.bauOffen || l.bereiche); ) {
            await zeichne(1);
            await sleep(250);
            l = await lage();
        }
        console.log(
            `  T2 das Wort der Validierung nach ${Date.now() - tWort} ms (offene Pipeline-Bauten ${l.bauOffen}, offene Fehler-Bereiche ${l.bereiche}, verlorene Devices ${JSON.stringify(l.verloren)})`
        );
        const genannt =
            l.indexWache && l.indexWache.brueche.find((b) => b.art === "format" && b.geometrie === t2.geometrie);
        check(
            "T2 die Index-Wache nennt den geweiteten Index beim Pfad",
            !!genannt,
            genannt ? `${genannt.objekt}: ${genannt.detail}` : JSON.stringify(l.indexWache)
        );
        check(
            "T2 die GPU-Wache des Spiels zählt die Validierung",
            !!l.gpuWache && l.gpuWache.n > t2.vor,
            l.gpuWache
        );
        check(
            "T2 der eigene Hörer hört die Validierung (Device oder r184-Fehler-Bereich)",
            l.hoer > hoerVor,
            `${l.hoer - hoerVor} Meldungen: ${l.hoerErste.slice(-2).join(" | ")}`
        );
        check(
            "T2 die Bild-Probe erkennt das stehende Bild",
            steht < FOLGT_MIN,
            `${(steht * 100).toFixed(2)} % der Blöcke bewegt`
        );
    }
    console.log(`\n  Dauer ${zeit()}`);

    await browser.close();
    server.close();
    require("./lib/welt-boot.cjs").wandEnde(
        fehler,
        "DIE FROST-WAND steht — durch Werkstatt, Ich- und Hof-Bühne trägt jeder Index-Puffer der Welt-GPU sein Format, kein Device meldet, das Bild folgt der Kamera; die Täter (Index über der Vertex-Zahl, ein fremd geweiteter Mensch-Index) nennen die Wachen beim Namen, ein fremder Fehler im Bau einer Pipeline markiert keine, ein Wurf im Szenen-Pass stellt den Schirm nicht (die Geschwister in erzwungener Reihenfolge), und das stehende Bild wird erkannt."
    );
});
