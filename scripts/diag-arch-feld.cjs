// diag-arch-feld.cjs — DIE LINSE „gesetzte Dinge erscheinen": im Analog-Pfad ist ein gesetzter Bau nur sichtbar, wenn er
// einen Feld-Slot bekommt (_archZiegelFern). Die Linse fährt den ECHTEN Renderer (WebGPU/swiftshader — der Null-Renderer ist für
// den ganzen Analog-Pfad blind) auf der Mess-Wiese −900/−850 und prüft:
//   A  nah (10 m · 26 m): gesetzte Eiche UND Haus sind binnen 200 Takten sichtbar — das Studio-Mesh steht
//      ODER eine Brücke trägt (das Haus sein Feld-Slot, die Eiche ihre gedockte Karte; nah ist das Mesh die Gestalt). Die
//      Eiche hat keinen Satz: beim Erst-Boot trägt nur ihr Mesh,
//      und das wartet nie hinter einem Karten-Bake (der Bäcker hat seinen Faden, gate:takt T7)
//   AM nah steht danach das Studio-Mesh (Grenze 800 Takte) — erst dann schießt die Linse: das Bild zeigt die
//      Gestalt, nicht die Brücke
//   A' fern (jenseits der Mesh-Zone): das gesetzte Haus bekommt seinen Feld-Slot — der Feld-Bake-Takt geht
//      nah zuerst über alle Verbraucher, der ferne Bau wartet auf die Näheren und verhungert nie (Grenze 1000 Takte); die
//      gesetzte Eiche steht dort als ihre Karte (Karten-Zone),
//      sobald der Bäcker ihre Zelle erreicht: das Karten-Buch prüft das Gesetz (keine fernere Zelle überholt die ihre,
//      sie kommt an — Grenze 4000 Takte), die Dauer ist der Durchsatz des Bäckers und steht daneben
//   B  kein Foundry-Bau ist „aufgegeben" ohne Slot (ausgebrannt)
//   C  die Eiche trägt fern KEINEN Feld-Satz (ein Karten-Ding ist jenseits der Mesh-Zone seine Karte, B2c fernform,
//      gate:fernwald)
// Das Licht des Felds misst der Lichtweg
// (`werkbank licht --laub feld,feld0,feld90,feld180 --uhr 0.5,0.27,0.05`, gate:licht-weg:echt): je Uhr und Lage im Band 0,9–1,1.
//   node scripts/diag-arch-feld.cjs
"use strict";
const { statikServer, starteBrowser, hauptLauf, SELBSTTEST } = require("./lib/welt-boot.cjs");
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");

const PORT = Number(process.env.ARCH_FELD_PORT || 4467);
const W = 640,
    H = 360;
const server = statikServer();

// A' — das Gesetz des Bäckers über das Karten-Buch (je begonnenem Bake: Zelle, ihr Rang d, der Rang dF der Zelle der
// fernen Eiche im Moment der Wahl): bis die Zelle der Eiche dran ist, überholt sie keine fernere (Rang −1 = ohne Bedarf).
function kartenGesetz(buch, zelleF) {
    const fern = (x) => (x < 0 ? Infinity : x);
    const iF = buch.findIndex((b) => b.key === zelleF);
    const vorF = iF < 0 ? buch : buch.slice(0, iF);
    return { iF, ueberholt: vorF.filter((b) => fern(b.d) > fern(b.dF)) };
}

{
    if (SELBSTTEST) {
        // Das Karten-Gesetz feuert: eine fernere Zelle (40 m, ohne Bedarf) vor der Eichen-Zelle (Rang 15 m) ist überholt,
        // nähere (9 m, 15 m) sind es nicht.
        const F = "fimp:eiche|2";
        const gut = kartenGesetz(
            [
                { key: "fimp:strauch|1", d: 9, dF: 15 },
                { key: "fimp:weide|1", d: 15, dF: 15 },
                { key: F, d: 15, dF: 15 },
            ],
            F
        );
        const schlecht = kartenGesetz(
            [
                { key: "fimp:birke|1", d: 40, dF: 15 },
                { key: "fimp:buche|1", d: -1, dF: 15 },
                { key: F, d: 15, dF: 15 },
            ],
            F
        );
        const gesetzOk = gut.ueberholt.length === 0 && gut.iF === 2 && schlecht.ueberholt.length === 2;
        console.log(
            `${gesetzOk ? "✅" : "❌"} SELBST-TEST A': nähere Zellen vor der Eiche überholt ${gut.ueberholt.length} · ` +
                `fernere (40 m, ohne Bedarf) überholt ${schlecht.ueberholt.length}`
        );
        process.exit(gesetzOk ? 0 : 1);
    }
}

hauptLauf(async () => {
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "linse", frist: 900000 });
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    page.on("console", (m) => {
        const t = m.text();
        if (t.startsWith("[D]")) console.log("  " + t);
    });
    await page.evaluateOnNewDocument(WELT_ORTE_INSTALL); // der Messort aus spec/profiband/haushalt.json (`__messWiese`)
    await server.zeige(page, 60000);
    const res = await page.evaluate(async () => {
        await window.__weltDa((r) => r.state);
        if (!r || !r.state.renderer || r.state.renderer._isHeadlessNull) return { fatal: "kein echter Renderer" };
        await window.__weltDa(() => !(r._foundry && !(r._foundry.ready && r._foundry.recipes)));
        // Eine Ausnahme im Spiel-Takt wird gezählt und beim Namen genannt, nie geschluckt: sie bricht den Takt dort
        // ab, wo sie fliegt — jeder Bau dahinter in der Liste bleibt ungebaut (das sah die Linse sonst als „AM null").
        let taktFehlerN = 0,
            taktFehler1 = null;
        const tick = async (n) => {
            for (let i = 0; i < n; i++) {
                try {
                    if (r.state.world) r.state.world.timeOfDay = 0.5;
                    r._gameLoopTick(performance.now());
                } catch (e) {
                    taktFehlerN++;
                    if (!taktFehler1)
                        taktFehler1 = String(e?.stack || e)
                            .split("\n")
                            .slice(0, 4)
                            .join(" | ");
                }
                await sleep(40);
            }
        };
        const [X, Z] = window.__messWiese;
        r.state.playerMesh.position.set(X, r._voxelSurfaceY(X, Z) + 1.8, Z);
        await tick(80);
        const pm = r.state.playerMesh.position;
        const hausName = Object.keys(r.state.blueprints || {})
            .filter((n) => n.startsWith("haus_"))
            .sort()[0];
        const setze = (name, d) => {
            const x = pm.x + d,
                z = pm.z + d * 0.2;
            const y = r._voxelSurfaceY(x, z) + 0.5;
            const e = r.spawnArchitecture(name, { x, y, z }, { rotationY: 0 });
            return { e, x, y, z };
        };
        // Die Takt-Verbraucher (wer bekommt den Feld-Bake-Takt, wer nicht) — die Linse nennt den Hunger beim Namen.
        const taktZaehl = {};
        const taktRoh = r._weltBakeErlaubt.bind(r);
        r._weltBakeErlaubt = function (...a) {
            const ok = taktRoh(...a); // die Distanz reist mit — sonst gälte im Gate jeder Wunsch als „ganz nah"
            const k = (new Error().stack.split("\n")[2] || "").trim().split(" ")[1] || "?";
            const z2 = taktZaehl[k] || (taktZaehl[k] = { ja: 0, nein: 0 });
            if (ok) z2.ja++;
            else z2.nein++;
            return ok;
        };
        const B = setze("baum_eiche", 10);
        const Hh = setze(hausName, 26);
        // FERN: jenseits der Mesh-Zone (Cull-Radius) ist das Feld die Gestalt des Hauses, die Karte die der Eiche.
        const fernD = Math.round((r.state.architectureCullingRadius || 130) + 40);
        const BF = setze("baum_eiche", fernD);
        const HF = setze(hausName, fernD + 16);
        const eb = B.e,
            eh = Hh.e;
        const ebF = BF.e,
            ehF = HF.e;
        const idx = { baum: r.state.architectures.indexOf(eb), haus: r.state.architectures.indexOf(eh) };
        // Sichtbar = das Mesh steht ODER der Feld-Slot trägt (AAA nah: das Feld überbrückt nur, bis das Mesh steht).
        const sichtbar = (e) => !!(e && (r._archIsRendered(e) || e._ziegelSlot));
        // Die ferne Eiche ist ihre Karte (die Stufe 2 steht als Instanz); ein Feld-Satz an ihr ist der Täter von C.
        const karte = (e) => !!(e && r._archIsRendered(e) && e._lodLevel === 2);
        // DAS KARTEN-BUCH: jeder Bake, den der Bäcker nach dem Pflanzen beginnt, mit dem Rang seiner Zelle (dem nächsten
        // Gestalt-Bedarf, m; −1 = ohne Bedarf) und dem Rang der Zelle der fernen Eiche im Moment der WAHL — die Linse prüft
        // das GESETZ des Bäckers (nah zuerst, nie verhungert), nicht seinen Durchsatz.
        const presetF = r._foundryPresetForEntry(ebF);
        const zelleF = "fimp:" + r._foundryKartenKey(presetF, r._foundryGestaltFor(ebF, presetF), null);
        const backBuch = [];
        const rang = (z) => (z && Number.isFinite(z._bedarfD2) ? Math.round(Math.sqrt(z._bedarfD2)) : -1);
        const gebackene = () => (r._kartenAtlas ? [...r._kartenAtlas.zellen].filter(([, z]) => z.gebacken).map(([k]) => k) : []);
        const gesehen = new Set(gebackene());
        const buche = (t) => {
            const at = r._kartenAtlas;
            for (const k of gebackene()) {
                if (!at || gesehen.has(k)) continue;
                gesehen.add(k);
                const zF = at.zellen.get(zelleF);
                if (!zF?.gebacken) backBuch.push({ key: k, d: rang(at.zellen.get(k)), dF: rang(zF), t });
            }
        };
        let satzBF = false;
        let slotB = null,
            slotH = null,
            karteBF = null,
            slotHF = null;
        for (let t = 1; t <= 200; t++) {
            await tick(1);
            buche(t);
            if (slotB == null && sichtbar(eb)) slotB = t;
            if (slotH == null && sichtbar(eh)) slotH = t;
            if (karteBF == null && karte(ebF)) karteBF = t;
            if (ebF?._ziegelSlot) satzBF = true;
            if (slotHF == null && ehF?._ziegelSlot) slotHF = t;
            if (slotB != null && slotH != null && karteBF != null && slotHF != null && t >= 40) break;
        }
        // NAH IST DAS MESH: die Feld-Brücke trägt nur, bis das Studio-Mesh steht — weiter takten, bis beide nahen
        // Bauten als Mesh rendern; FERN gilt nah zuerst, nie verhungert: der Takt geht in Distanz-Ordnung, der ferne
        // Bau wartet auf die Näheren und kommt an (Grenze 1000 Takte gesamt). Erst dann schießt die Linse.
        // Die Brücke (die Karte eines kalten Baums, dessen Wunsch-Stufe lädt) zählt nicht als Gestalt.
        const gestalt = (e) => r._archIsRendered(e) && !e._bruecke;
        let meshB = gestalt(eb) ? 0 : null,
            meshH = gestalt(eh) ? 0 : null;
        for (let t = 201; t <= 1000; t++) {
            if (meshB != null && meshH != null && karteBF != null && slotHF != null) break;
            await tick(1);
            buche(t);
            if (meshB == null && gestalt(eb)) meshB = t - 200;
            if (meshH == null && gestalt(eh)) meshH = t - 200;
            if (karteBF == null && karte(ebF)) karteBF = t;
            if (ebF?._ziegelSlot) satzBF = true;
            if (slotHF == null && ehF?._ziegelSlot) slotHF = t;
        }
        // DIE FERNE KARTE kommt an, sobald der Bäcker ihre Zelle erreicht: nah zuerst (der Rang einer Zelle ist ihr
        // nächster Gestalt-Bedarf), nie verhungert. Wie lange das dauert, ist der DURCHSATZ des Bäckers, nicht sein
        // Gesetz — auf CPU-Raster unter Fremdlast 65–745 Takte je Karte. Die Linse wartet bis 4000 Takte und prüft,
        // dass keine fernere Zelle die ihre überholt.
        for (let t = 1001; t <= 4000 && karteBF == null; t++) {
            await tick(1);
            buche(t);
            if (karte(ebF)) karteBF = t;
            if (ebF?._ziegelSlot) satzBF = true;
        }
        r._weltBakeErlaubt = taktRoh;
        // B — ausgebrannte Foundry-Bauten (aufgegeben ohne Slot):
        let foundryN = 0,
            ausgebrannt = 0,
            mitSlot = 0;
        for (const a of r.state.architectures) {
            if (!r._archFoundryPreset || !r._archFoundryPreset(a)) continue;
            foundryN++;
            if (a._ziegelSlot) mitSlot++;
            else if (a._ziegelGebacken) ausgebrannt++;
        }
        const wm = r.state.weltMarch;
        // Der Zustand je gesetztem Bau (die Linse nennt den Täter, nicht nur „Takt null").
        const zustand = (e) =>
            e
                ? {
                      mesh: !!r._archIsRendered(e),
                      slot: !!e._ziegelSlot,
                      gebacken: !!e._ziegelGebacken,
                      versuche: e._ziegelVersuche || 0,
                      // Der Mesh-Weg: Wunsch-Stufe, Instanz-Flag und was der EINE Flat-Chokepoint für sie liefert
                      // (lädt · kann nicht · bereit) — der Täter, wenn nah kein Mesh steht.
                      stufe: e._lodLevel,
                      instanz: !!e.instanced,
                      weg: (() => {
                          const p = r._archFoundryPreset(e);
                          if (!p) return "grammatik";
                          const fl = r._foundryFlattenFor(e, p, e._lodLevel | 0);
                          return fl === null ? "laedt" : fl === false ? "kann-nicht" : fl.instanceable ? "bereit:L" + fl.lod : "nicht-instanzierbar";
                      })(),
                      // Foundry-Bau: steht die L1-Flat (Quelle des Fits) schon? Ist er ein Karten-Ding?
                      flat: r._archFoundryPreset(e)
                          ? r._foundry.cache.has(
                                r._foundryKoerperKey(
                                    r._archFoundryPreset(e),
                                    r._foundryGestaltFor(e, r._archFoundryPreset(e)),
                                    1
                                )
                            )
                          : null,
                      karte: !!r._archKartenPreset(e),
                      d: Math.round(Math.hypot(e.position.x - pm.x, e.position.z - pm.z)),
                  }
                : null;
        return {
            hausName,
            idx,
            n: r.state.architectures.length,
            slotB,
            slotH,
            karteBF,
            slotHF,
            backBuch,
            zelleF,
            meshB,
            meshH,
            fernD,
            takt: taktZaehl,
            zBF: zustand(ebF),
            zHF: zustand(ehF),
            versucheB: eb ? eb._ziegelVersuche || 0 : null,
            foundryN,
            mitSlot,
            ausgebrannt,
            // C: keine der beiden Eichen trug je einen Feld-Satz, und kein Satz-Schlüssel eines Karten-Dings lebt
            satzBF: satzBF || !!eb?._ziegelSlot,
            kartenSaetze: wm
                ? [...wm.kapselCache.keys()].filter((k) => /^aarch:/.test(k) && /baum|busch|strauch/.test(k)).length
                : 0,
            zB: zustand(eb),
            zH: zustand(eh),
            taktFehler: { n: taktFehlerN, erster: taktFehler1 },
            // Die Fäden: was im Werk offen ist (ein Karten-Bake im Werk hielt bis 05.10. jede nahe Geometrie hinter sich —
            // seit S2 backt die Karte im Welt-Renderer).
            werk: {
                offen: r._foundry?.pending ? r._foundry.pending.size : null,
                angefragt: r._foundry?.requested ? r._foundry.requested.size : null,
                stau: r._foundryIngestQueue ? r._foundryIngestQueue.length : 0,
            },
            felderFrei: wm ? wm.freiFelder.length : null,
            felderVoll: !!r._weltFelderVollWarn,
            radius: Math.round(r.state.architectureCullingRadius || 0),
        };
    });
    if (!res || res.fatal) {
        console.log("FEHLER:", res ? res.fatal : "?");
        await browser.close();
        server.close();
        process.exit(1);
    }
    console.log(`Liste: ${res.n} Bauten · Eiche auf Platz ${res.idx.baum} · ${res.hausName} auf Platz ${res.idx.haus}`);
    console.log(
        `Zustand: Eiche ${JSON.stringify(res.zB)} · Haus ${JSON.stringify(res.zH)} · Feld-Liste frei ${res.felderFrei}` +
            `${res.felderVoll ? " (VOLL gemeldet)" : ""} · Mesh-Zone ${res.radius} m · Foundry ${JSON.stringify(res.werk)}`
    );
    const A = res.slotB != null && res.slotH != null;
    // A' die ferne Eiche: ihre Karte kam an, und bis ihre Zelle gebacken war, buk der Bäcker keine fernere (Rang −1 =
    // ohne Bedarf zählt als unendlich fern). Das Haus: sein Feld-Slot binnen 1000 Takten.
    const { iF, ueberholt } = kartenGesetz(res.backBuch, res.zelleF);
    const AF = res.karteBF != null && res.slotHF != null && res.slotHF <= 1000 && ueberholt.length === 0;
    const AM = res.meshB != null && res.meshH != null;
    const Bk = res.ausgebrannt === 0;
    const C = !res.satzBF && res.kartenSaetze === 0;
    console.log(
        `${A ? "✅" : "❌"} A  nah sichtbar (Mesh oder Feld-Brücke): Eiche ab Takt ${res.slotB} · Haus ab Takt ${res.slotH} (Grenze 200)`
    );
    console.log(
        `${AM ? "✅" : "❌"} AM nah steht das Studio-Mesh: Eiche ${res.meshB} · Haus ${res.meshH} Takte nach der Brücke (Grenze 800)`
    );
    console.log(
        `${AF ? "✅" : "❌"} A' fern (${res.fernD} m, jenseits der Mesh-Zone): Eiche als Karte ab Takt ${res.karteBF} ` +
            `(ihre Zelle ${res.zelleF.replace("fimp:", "")} ` +
            (iF < 0
                ? `schon vor dem Pflanzen gebacken oder im Bäcker, ${res.backBuch.length} Bakes danach`
                : `als ${iF + 1}. von ${res.backBuch.length} begonnenen Bakes, Rang ${res.backBuch[iF].dF} m`) +
            ` · überholt von ferneren ${ueberholt.length}` +
            `${ueberholt.length ? " " + JSON.stringify(ueberholt.slice(0, 3)) : ""}; Grenze 4000 Takte) · ` +
            `Haus-Feld-Slot ab Takt ${res.slotHF} (Grenze 1000 — nah zuerst, nie verhungert) · begonnen ` +
            `${res.backBuch.map((b) => b.key.replace("fimp:", "") + "@" + b.t + "/" + b.d + "m").join(" ")}` +
            (AF ? "" : ` — ${JSON.stringify(res.zBF)} · ${JSON.stringify(res.zHF)} · Takt ${JSON.stringify(res.takt)}`)
    );
    console.log(
        `${Bk ? "✅" : "❌"} B  Foundry-Bauten: ${res.foundryN} · mit Slot ${res.mitSlot} · ausgebrannt ${res.ausgebrannt}`
    );
    console.log(
        `${C ? "✅" : "❌"} C  die Eiche trägt keinen Feld-Satz (Satz an einer Eiche: ${res.satzBF} · ` +
            `Satz-Schlüssel eines Karten-Dings: ${res.kartenSaetze})`
    );
    await browser.close();
    server.close();
    const TF = !(res.taktFehler && res.taktFehler.n > 0);
    console.log(
        TF
            ? "✅ T  keine Ausnahme im Spiel-Takt"
            : `❌ T  ${res.taktFehler.n} Ausnahmen im Spiel-Takt — erste: ${res.taktFehler.erster}`
    );
    const gruen = A && AM && AF && Bk && C && TF;
    console.log(
        gruen
            ? "✅ GRÜN — gesetzte Dinge erscheinen: nah als Mesh (das Feld überbrückt), fern im Feld oder als Karte."
            : "❌ ROT"
    );
    process.exit(gruen ? 0 : 1);
});
