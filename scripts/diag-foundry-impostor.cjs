// diag-foundry-impostor.cjs — W6 DER EINE KARTEN-ATLAS + S2 DIE KARTE BACKT IN DER WELT: die Welt-Fernstufe liest EINEN
// Karten-Atlas (eine Array-Textur, eine Schicht je Karte, EIN Material, EINE Gruppe); die Karte backt der Welt-Renderer
// aus der L1-Gestalt (`_karteWeltBacken`); Studio-Bäcker-Kanal, Welt-RTT-Nachbau, GL-Bake-iframe und Canvas-Atlas je Karte
// sind GESCHNITTEN. Zwei Teile:
//   A (Null-Renderer, HART): die MECHANIK — `_foundryEnsureImpostorRecord` legt eine Atlas-Zelle mit Rahmen an (aus
//     der L1-Geometrie; headless bäckt nie jemand); Eiche + Fichte teilen Quad, Material und EINE Karten-Gruppe, die
//     Schicht und der Rahmen reisen je Instanz (aKarte) über beide Slot-Chokepoints; KEIN asset-foundry-iframe im DOM; die
//     gefallenen Methoden wacht gate:constitution (G3).
//   C (echter Renderer — CI: WebGL2 auf swiftshader, lokal WebGPU auf der Karte; HART): das LAYOUT — eine Probe-Gestalt (links oben eine Tafel) backt durch den ECHTEN Bake
//     (`_karteWeltBacken`: Bühne, MRT, Ablage BC bzw. rgba8) und steht links oben (nicht gedreht, nicht gespiegelt) — und
//     die Kamera-Kleber-Wand (ein befreiter Slot zeichnet nie: die Gruppe verdichtet, der Lebende zieht mit Matrix und Karte
//     in die Lücke). C5: der Atlas wächst in SEINEN Texturen über den EINEN Abschied (`_texturAbschied`), die Vorlage des
//     Programms bindet die lebende (Selbsttest: das alte Wachsen). Teil C beginnt erst, wenn die Welt
//     steht (`weltRuht`, die EINE Ruhe); eine fremde Zelle im Probe-Atlas ist ROT beim Namen.
//   node scripts/diag-foundry-impostor.cjs
const { statikServer, starteBrowser, hauptLauf, wandEnde } = require("./lib/welt-boot.cjs");

const server = statikServer();

async function bootPage(browser, nullRenderer) {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((nr) => {
        if (nr) window.__anazhHeadlessNullRenderer = true;
    }, nullRenderer);
    await server.zeige(page, 30000);
    await page.evaluate(() => window.__weltDa((r) => r.state));
    return { page };
}

// DIE PROBE-GESTALTEN (Teil C): Dreiecke in Ansichts-Koordinaten (u, v ∈ 0..1, v = 0 Unterkante) im Rahmen 4 × 8 der
// Probe, eine Tafel, eine Säule — und der ECHTE Bake: die Gestalt steht als L1 im Foundry-Cache, `_karteWeltBacken`
// zeichnet sie auf dem Probe-Renderer in ihre Schicht. Zwei Anker setzen den Rahmen (impostorFrame: halfH = 0,51 · maxY,
// halfW = 1,04 · maxR). Eine bestehende Zelle statt des Schlüssels backt neu.
async function installiereBacke(page) {
    await page.evaluate(() => {
        const T = THREE;
        const R = 4 / 1.04,
            Y = 8 / 1.02;
        window.__fimpFlaeche = (dreiecke) => {
            const pos = [];
            for (const d of dreiecke)
                for (let i = 0; i < 6; i += 2) pos.push(Math.max(-R, Math.min(R, -4 + 8 * d[i])), Math.min(Y, 8 * d[i + 1]), 0);
            return new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute(pos, 3));
        };
        window.__fimpRechteck = (u0, v0, u1, v1) => [
            [u0, v0, u1, v0, u1, v1],
            [u0, v0, u1, v1, u0, v1],
        ];
        window.__fimpSaeule = () => new T.CylinderGeometry(R, R, Y, 32).translate(0, Y / 2, 0);
        // das Schicht-Format, das DIE WELT auf dem Probe-Renderer wählt (`_impostorAtlasFormat`: BC nur mit WebGPU-Ablage) —
        // bis S2b fragte die Probe `hasFeature`, und WebGL2 (s3tc) erzwang eine BC-Stufe, die die Welt dort nie fährt
        window.__fimpFormat = (ren) => {
            const vor = r.state.renderer;
            r.state.renderer = ren;
            try {
                return r._impostorAtlasFormat();
            } finally {
                r.state.renderer = vor;
            }
        };
        window.__fimpBacke = async (ren, at, key, variant, geo) => {
            const vor = r.state.renderer;
            r.state.renderer = ren;
            try {
                let z = key;
                if (typeof key === "string") {
                    z = r._impostorZelleNeu(at, key, "eiche", variant, null);
                    if (!r._impostorAtlasTexturen(at, z.idx + 1)) throw new Error("der Atlas hat keine Texturen (das Buch fehlt)");
                    const mat = new T.MeshStandardNodeMaterial({ color: 0x3ca028, side: T.DoubleSide });
                    const anker = new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute([0, Y, 0, R, 0, 0, R, 0, 0], 3));
                    const g = new T.Group();
                    g.add(new T.Mesh(geo, mat), new T.Mesh(anker, mat));
                    r._foundryCacheSet(r._foundryKoerperKey(z.preset, z.variant, r._foundryServierStufe(z.preset, 1), z.ov), g);
                }
                const q = r._impostorBakeQueue || [];
                if (q.includes(z.key)) q.splice(q.indexOf(z.key), 1);
                z._weltNeu = true;
                for (const weiter = window.__deckel(`der Bake von ${z.key}`, 4800); weiter(); ) {
                    if (at.fmt !== "bc" || r._karteRechner()) {
                        const e = r._karteWeltBacken(at, z);
                        if (e === true) return z;
                        if (e === false) throw new Error(`der Bake von ${z.key} scheiterte`);
                    }
                    await sleep(50);
                }
            } finally {
                r.state.renderer = vor;
            }
        };
    });
}

// Wartet, bis der Foundry-Worker ready ist + zwei Atlas-Zellen stehen (Eiche, Fichte — der Rahmen kommt headless aus
// der L1-Geometrie, die async lädt), baut ihre Karten-Flats und streut drei Instanzen in die Welt-Gruppen.
async function driveImpostor(page) {
    return await page.evaluate(async () => {
        const out = { ready: false, rec: null, err: null, hasIframe: null };
        try {
            const f = r._ensureAssetFoundry();
            await window.__weltDa(() => !(f && !f.ready));
            out.ready = !!f?.ready;
            if (!out.ready) {
                out.err = "Worker nicht ready";
                return out;
            }
            // Die Zellen treiben: erst lädt die L1-Geometrie (null), dann steht die Zelle mit Rahmen.
            let rec = null,
                rec2 = null,
                flat1 = null,
                flat2 = null;
            for (const weiter = window.__deckel("die Impostor-Rekorde", 1500); weiter(); ) {
                try {
                    r._gameLoopTick(performance.now());
                } catch {}
                rec = r._foundryEnsureImpostorRecord("eiche", 1) || rec;
                rec2 = r._foundryEnsureImpostorRecord("fichte", 1) || rec2;
                flat1 = r._foundryBuildImpostorFlat({ seed: 7 }, "eiche") || flat1;
                flat2 = r._foundryBuildImpostorFlat({ seed: 7 }, "fichte") || flat2;
                if (rec && rec2 && flat1 && flat2) break;
                await sleep(30);
            }
            const at = r._impostorAtlas();
            if (rec) {
                out.rec = {
                    imAtlas: !!(at && at.zellen.get(rec.key) === rec),
                    schicht: rec.idx,
                    hasFrame: !!(rec.frame && rec.frame.halfH > 0 && rec.frame.halfW > 0),
                    keineSaison: !/spring|summer|autumn|winter/.test(rec.key),
                };
            }
            // DER EINE ATLAS: zwei Arten teilen Quad + Material + Gruppe, die Schicht und der Rahmen reisen je Instanz.
            if (flat1 && flat2) {
                const l1 = flat1.leaves[0],
                    l2 = flat2.leaves[0];
                out.atlas = {
                    quadGeteilt: l1.geom === l2.geom,
                    materialGeteilt: l1.mat === l2.mat,
                    billboard: !!l1.mat?.userData?.impostorBillboard,
                    schichtenVerschieden: l1.zelle !== l2.zelle,
                    texturen: !!(at.map && at.nmap && at.lmap && at.cap >= at.n && at.map.image.depth === at.cap),
                    fmt: at.fmt,
                };
                // drei Instanzen über BEIDE Slot-Chokepoints: Streu (zwei Arten, Region 3,4) + ein gesetzter Eintrag
                const vor = new Set(r.state.archInstanceGroups ? r.state.archInstanceGroups.keys() : []);
                const sE = r._scatterInstanceAdd("fscatter:eiche:1:2", 10, 0, 10, 0.3, 1.1, null, "3,4", flat1);
                const sF = r._scatterInstanceAdd("fscatter:fichte:1:2", 20, 0, 10, 0.7, 0.9, null, "3,4", flat2);
                // BÜHNE: Eintrag einer Einheits-Probe, kein gesetzter Ort
                const entry = { type: "baum_eiche", position: { x: 30, y: 0, z: 10 }, rotation: 0, scale: 1.2, seed: 7 };
                r._archInstanceAdd(entry, flat1);
                const neu = [...r.state.archInstanceGroups.keys()].filter((k) => !vor.has(k));
                const karten = [...r.state.archInstanceGroups.keys()].filter((k) => /(^|#)fimp:/.test(k));
                const g = r.state.archInstanceGroups.get(r.constructor.IMPOSTOR_ATLAS_GRUPPE);
                const ak = g && g.mesh.geometry.attributes.aKarte; // (Schicht, Halbbreite, Höhe, ±Sichthöhe) je Slot
                const slot = (i) => (ak ? Array.from(ak.array.slice(i * 4, i * 4 + 4)) : [NaN, NaN, NaN, NaN]);
                // die WebGPU-Grenze: höchstens 8 Vertex-Puffer je Pipeline —
                // gezählt im schlimmsten Fall: ab 1024 Instanzen reist auch instanceMatrix als Vertex-Puffer (r184)
                const geo = g && g.mesh.geometry;
                const puffer = geo ? Object.keys(geo.attributes).length + (g.mesh.instanceColor ? 1 : 0) + 1 : 99;
                out.gruppen = {
                    neu,
                    karten,
                    // die Slots, die DIESE Probe belegt hat (die Welt kann die Gruppe schon füllen)
                    zellen: [sE[0].slot, sF[0].slot, entry.instSlots[0].slot].map((i) => slot(i)[0]),
                    rahmen: [sE[0].slot, sF[0].slot, entry.instSlots[0].slot].flatMap((i) => slot(i).slice(1, 3)),
                    slotGruppen: [sE[0].key, sF[0].key, entry.instSlots[0].key],
                    erwartet: [l1.zelle, l2.zelle, l1.zelle],
                    erwartetRahmen: [...l1.rahmen, ...l2.rahmen, ...l1.rahmen],
                    // die Sichthöhe je Slot = Höhe der Höhen-Stufe × Instanz-Skala (dieselbe Zahl wie der aH0-Stempel)
                    sicht: [sE[0].slot, sF[0].slot, entry.instSlots[0].slot].map((i) => slot(i)[3]),
                    erwartetSicht: [l1.sicht * 1.1, l2.sicht * 0.9, l1.sicht * 1.2],
                    // VOLL je Slot (das Vorzeichen): die Streu-Slots frei, die frisch gesetzte Primär-Stufe hält, bis ihre
                    // Band-Pflege urteilt (K36, `_lodSlotVoll`)
                    voll: [false, false, r._lodSlotVoll(entry)],
                    instanziert: !!(ak?.isInstancedBufferAttribute && ak.itemSize === 4),
                    vertexPuffer: puffer,
                    attribute: geo ? Object.keys(geo.attributes) : [],
                };
            }
            // DIE STRICH-WAND am Graphen (Integration W6): steht die Peilung auf einer Ansichts-Grenze, springt
            // die Atlas-Koordinate; nimmt die Hardware die Ableitung daraus, zieht der Filter einen senkrechten Strich über die
            // Krone (swiftshader sieht ihn nie). Jede Atlas-Stichprobe des Karten-Stoffs trägt darum explizite Gradienten
            // (die Albedo je Ansicht A und B, die Normale der nächsten, S2b) oder liest auf der Stufe 0 (die kubische Zelle). Selbsttest: ein Stoff,
            // der den Atlas ohne beides liest, fällt beim Namen.
            const atS = r._impostorAtlas();
            const strich = (m) => {
                const p = new Set();
                for (const w of [m.colorNode, m.normalNode])
                    if (w) w.traverse((n) => n.isTextureNode && n.referenceNode && [atS.mapNode, atS.nmapNode].includes(n.getBase()) && p.add(n));
                const g = (b) => [...p].filter((n) => n.gradNode && n.getBase() === b).length;
                // springend: die Ableitung kommt aus der eigenen (springenden) Stichproben-Koordinate statt aus der stetigen
                const quelle = (d) => (d.isVarNode ? d.node : d).aNode; // dFdx reist in r184 als VarNode um den MathNode
                const springend = [...p].filter((n) => n.gradNode?.some((d) => quelle(d) && quelle(d).id === n.uvNode.id)).length;
                return { gradMap: g(atS.mapNode), gradNmap: g(atS.nmapNode), ohne: [...p].filter((n) => !n.gradNode && !n.levelNode).length, springend };
            };
            out.strich = strich(r._impostorAtlasMaterial());
            const uS = THREE.TSL.uv();
            out.strichSelbst = strich({ colorNode: atS.mapNode.sample(uS).depth(0).add(atS.mapNode.sample(uS).grad(uS.dFdx(), uS.dFdy())) });
            // Kein asset-foundry-iframe im DOM (das Bake-iframe ist geschnitten).
            out.hasIframe = !!document.querySelector('iframe[src*="asset-foundry"]');
        } catch (e) {
            out.err = e?.message || String(e);
        }
        return out;
    });
}

// DIE RUHE VOR TEIL C (S2b-n2): jede Probe in C nimmt den EINEN Karten-Atlas der Welt — und jede Lieferung, die
// Teil A bestellte, legt bei ihrer Ankunft ihre Zelle in ihm an (`_foundryZug` → `nach` → `_foundryEnsureImpostorRecord`). Ab
// der neunten wächst er, das rgba8-Ziel wächst leer und die Probe-Karten backen nie nach (der Null-Renderer der Welt backt
// nicht): die Wand sah 0 px, je nachdem, wie viele Lieferungen der Läufer noch trug (Zelle der Eiche in A: Schicht 0 rot,
// Schicht 10 grün). Jede Probe leiht der Welt den echten Renderer: was sie noch baut, landet im Probe-Atlas. Teil C
// beginnt, wenn die Welt steht (A9) — Selbsttest: eine wartende Karte hält die Ruhe.
async function weltRuht(page) {
    return await page.evaluate(async () => {
        const takte = await window.__weltStehtNach(null, 1800);
        const q = r._impostorBakeQueue || (r._impostorBakeQueue = []);
        const karte = q.push("fimp:gateRuhe|1") && r._weltSteht();
        q.pop();
        return { takte, karte };
    });
}

// ===== TEIL C — DIE KARTEN-WAND auf echtem Renderer (CI: WebGL2 auf swiftshader, lokal WebGPU; frischer in-page Renderer) =====
// (1) DAS LAYOUT: eine Probe-Gestalt (eine Tafel in der LINKEN OBEREN Viertel-Fläche) backt durch den ECHTEN Bake
//     (`_karteWeltBacken`, BC wenn der Adapter es kann, sonst rgba8) in den Atlas — das Bild MUSS links oben stehen (die
//     Karte steht richtig herum und ist nicht gespiegelt).
// (2) DIE KAMERA-KLEBER-WAND (Schöpfer: „Felsen/Kristalle/Autos/Feueresse hängen an der Kamera"): Wurzel war
//     der FREIE Slot — seine Null-3×3 mit lebender Translation machte den Normal-Probe des Impostor-positionNode
//     singulär, der tote Slot wurde ein welt-spannendes camera-facing Quad. Seit 05.10. gibt es keinen freien Slot mehr:
//     _archGroupFree verdichtet (die letzte Instanz zieht mit Matrix, Farbe und Karte in die Lücke, count sinkt), der
//     Shader-Riegel (_lebt.select) fiel mit ihm.
//     SELBSTTEST — ein Monster-Slot (Skala 1000) MUSS den Schirm fluten; derselbe Slot durch den ECHTEN Free-Chokepoint
//     befreit ⇒ ~0 Pixel in seiner Schirm-Hälfte; der Lebende zeichnet aus seinem neuen Slot weiter, mit SEINER Karte
//     (das Layout links oben zählt nach dem Umzug).
async function kleberProbe(page, fmtWunsch) {
    return await page.evaluate(async (fmtWunsch) => {
        const out = { err: null };
        try {
            const T = THREE;
            const ren = new T.WebGPURenderer({ antialias: false });
            await ren.init();
            // die Regeln der Welt an der Klasse (die Seite fährt den Null-Renderer, der sie nie anlegt): Abschied und Register
            r._texturAbschied(ren);
            r._renderObjektRegister(ren);
            const W = 192,
                H = 128;
            ren.setSize(W, H, false);
            // Ein frischer Atlas im Format des Probe-Renderers (die Seite fährt den Null-Renderer).
            // BEIDE Format-Stufen desselben Pfads: BC (Adapter-Feature) und rgba8/rg8 (DataArrayTexture, GPU-Mips)
            if (fmtWunsch === "bc" && window.__fimpFormat(ren) !== "bc")
                return { fmt: "bc", ohneFeature: true };
            out.fmt = fmtWunsch;
            r._kartenAtlas = undefined;
            const at = r._impostorAtlas();
            at.fmt = out.fmt;
            const prevCf = r.state.foundryCrossfade;
            r.state.foundryCrossfade = false; // die Nah-Ausblendung des Crossfades maskiert die Probe sonst
            if (r.state._foliageMatCache)
                for (const [k, m] of r.state._foliageMatCache)
                    if (m.userData?.impostorBillboard) r.state._foliageMatCache.delete(k);
            const mat = r._impostorAtlasMaterial();
            r.state.foundryCrossfade = prevCf;
            out.billboard = !!mat?.userData?.impostorBillboard;
            if (!out.billboard) {
                out.err = "Impostor-TSL-Wiring: der Stoff trägt keinen Karten-Marker (impostorBillboard)";
                return out;
            }
            // (1) die Probe-Gestalten durch den ECHTEN Bake: links oben eine Tafel (in den Ansichten um die Peilung der
            // Kamera links), die Säule deckt jede Ansicht ganz (sie trägt den Monster-Slot)
            const H0 = 8; // die Sichthöhe der Probe-Karten (= ihr Rahmen 2 · halfH)
            const tafel = window.__fimpFlaeche(window.__fimpRechteck(0, 0.5, 0.5, 1));
            const z = await window.__fimpBacke(ren, at, "fimp:gateKarte|1", 91, tafel);
            const zV = await window.__fimpBacke(ren, at, "fimp:gateKarte|2", 92, window.__fimpSaeule());
            out.geschrieben = z.gebacken && zV.gebacken;
            const leaf = r._impostorLeaf(z, new T.Matrix4(), H0);
            const leafV = r._impostorLeaf(zV, new T.Matrix4(), H0);
            const geo = r._lodInstanceFacade(leaf.geom, 2);
            const mesh = new T.InstancedMesh(geo, mat, 2);
            mesh.frustumCulled = false;
            // Die Slots kommen aus dem ECHTEN Belege-Chokepoint (Marken, count, Sichtbarkeit).
            const gruppe = { key: "gate:kleber", mesh, capacity: 2, liveCount: 0, slotRef: [], slotEntry: [] };
            const refMonster = r._archGroupAlloc(gruppe, null);
            const refLebt = r._archGroupAlloc(gruppe, null);
            const M = new T.Matrix4();
            // Slot 0 (erst MONSTER, dann befreit): rechts im Bild. Slot 1 (LEBT): links im Bild — beim Befreien zieht er
            // in Slot 0 (Matrix UND Karte: das Layout der Nachher-Zählung liest seine umgezogene Schicht).
            M.compose(new T.Vector3(6, 0, 0), new T.Quaternion(), new T.Vector3(1000, 1000, 1000));
            mesh.setMatrixAt(refMonster.slot, M);
            M.compose(new T.Vector3(-6, 0, 0), new T.Quaternion(), new T.Vector3(1, 1, 1));
            mesh.setMatrixAt(refLebt.slot, M);
            mesh.instanceMatrix.needsUpdate = true;
            r._lodSlotStamp({ mesh }, refMonster.slot, 1, false, leafV);
            r._lodSlotStamp({ mesh }, refLebt.slot, 1, false, leaf);
            const szene = new T.Scene();
            szene.add(mesh);
            szene.add(new T.AmbientLight(0xffffff, 3));
            const cam = new T.PerspectiveCamera(60, W / H, 0.5, 500);
            // BÜHNE: eigene Szene des Impostor-Vergleichs
            cam.position.set(0, 4, 26);
            cam.lookAt(0, 4, 0);
            cam.updateMatrixWorld(true);
            const rt = new T.RenderTarget(W, H);
            ren.setRenderTarget(rt);
            // Die Schirm-Box des lebenden Quads (Anker −6, Halbbreite 4, Höhe 8) — in Quadranten geteilt.
            const px = (x, y) => {
                const v = new T.Vector3(x, y, 0).project(cam);
                return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
            };
            const [x0, yUnten] = px(-10, 0),
                [x1, yOben] = px(-2, 8);
            // EICHUNG der Lese-Richtung: ein Marker über dem Quad (allein gezeichnet) — liest die Rückgabe Zeile 0 oben?
            const marker = new T.Mesh(new T.BoxGeometry(2, 2, 2), new T.MeshBasicMaterial({ color: 0xffffff }));
            marker.position.set(-6, 14, 0);
            szene.add(marker);
            mesh.visible = false;
            await ren.renderAsync(szene, cam);
            const mb = await ren.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
            let sy = 0,
                ny = 0;
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++)
                    if (mb[(y * W + x) * 4 + 3] > 0) {
                        sy += y;
                        ny++;
                    }
            const yMarker = px(-6, 14)[1];
            const obenZuerst = ny > 0 && Math.abs(sy / ny - yMarker) < Math.abs(H - 1 - sy / ny - yMarker);
            out.eichung = { markerPx: ny, obenZuerst };
            szene.remove(marker);
            mesh.visible = true;
            const zaehle = async () => {
                await ren.renderAsync(szene, cam);
                const buf = await ren.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                const q = { lo: 0, ro: 0, lu: 0, ru: 0, links: 0, rechts: 0, zeilen: {} };
                const xm = (x0 + x1) / 2,
                    ym = (yOben + yUnten) / 2;
                for (let yr = 0; yr < H; yr++)
                    for (let x = 0; x < W; x++) {
                        if (!(buf[(yr * W + x) * 4 + 3] > 0)) continue;
                        const y = obenZuerst ? yr : H - 1 - yr; // Schirm-Zeile, 0 = oben
                        if (x < W / 2) q.links++;
                        else q.rechts++;
                        if (x >= x0 && x <= x1 && y >= yOben && y <= yUnten) {
                            q[y < ym ? (x < xm ? "lo" : "ro") : x < xm ? "lu" : "ru"]++;
                            q.zeilen[y] = (q.zeilen[y] || 0) + 1;
                        }
                    }
                return q;
            };
            const vorher = await zaehle();
            out.monsterPx = vorher.rechts;
            // (2) DIE WAND: den Monster-Slot durch den ECHTEN Free-Chokepoint befreien — die Gruppe verdichtet.
            r._archGroupFree(gruppe, refMonster);
            out.umzug = (() => {
                const chk = new T.Matrix4();
                mesh.getMatrixAt(0, chk);
                const e = chk.elements;
                return (
                    mesh.count === 1 &&
                    refLebt.slot === 0 &&
                    refMonster.slot === -1 &&
                    gruppe.slotRef[0] === refLebt &&
                    !gruppe.slotRef[1] &&
                    Math.abs(e[0] - 1) < 1e-6 &&
                    Math.abs(e[12] + 6) < 1e-6
                );
            })();
            const nachher = await zaehle();
            // der Probe-Atlas trägt nur die Probe-Karten: jede fremde Zelle ist eine Lieferung der Welt, die ihn nebenher füllte
            out.fremd = [...at.zellen.keys()].filter((k) => !k.startsWith("fimp:gateKarte|"));
            // das Layout zählt nach der Befreiung (der Monster-Slot deckt vorher auch die linke Box)
            out.layout = { lo: nachher.lo, ro: nachher.ro, lu: nachher.lu, ru: nachher.ru, zeilen: nachher.zeilen };
            out.box = { x0, x1, yOben, yUnten };
            out.lebtPx = nachher.links;
            out.totPx = nachher.rechts;
            // (3) C5 DAS WACHSEN (`_texturAbschied`): je Name EINE GPU-Textur in neuer Form, die alte fällt (WebGPU und WebGL2), dasselbe
            // Bild, die VORLAGE des Programms bindet die lebende (`Bindings._init` lädt ihre Textur je neuem Render-Objekt)
            const vorlagen = () =>
                (mesh.__renderObjekte || [])
                    .flatMap((ro) => ro.getNodeBuilderState().bindings.flatMap((g) => g.bindings))
                    .filter((b) => b.isSampledTexture && b.textureNode && /^karte-.*:atlas$/.test(b.texture.name || ""))
                    .map((b) => (b.texture === b.textureNode.value ? "" : `Vorlage ${b.texture.name}#${b.texture.id}`));
            const weg = new WeakSet(),
                P = (self.GPUTexture || class {}).prototype,
                zerstoere = P.destroy;
            P.destroy = function () {
                return (weg.add(this), zerstoere.call(this));
            };
            const gpu = (t) => ren.backend.get(t).texture || ren.backend.get(t).textureGPU;
            try {
                const alt = [at.map, at.nmap, at.lmap].map(gpu);
                const vorR = r.state.renderer;
                r.state.renderer = ren;
                try {
                    r._impostorAtlasTexturen(at, at.cap + 1);
                } finally {
                    r.state.renderer = vorR;
                }
                // rgba8: das Ziel wächst neu, die Schichten backen nach (bc: die GPU kopiert sie)
                if (at.fmt === "rgba8") for (const zz of [z, zV]) await window.__fimpBacke(ren, at, zz);
                const q = await zaehle();
                await sleep(0); // die alte Form fällt nach dem Submit
                const sonne = r._karteBuehneSatz?.schatten.textures || [];
                const leben = [...ren.info.memoryMap.keys()].filter(
                    (t) => t.isTexture && /^karte-.*:atlas$/.test(t.name || "") && !sonne.includes(t)
                );
                const form = (t) => `${t.name}:${t.image.depth}/${gpu(t).depthOrArrayLayers || t.image.depth}`;
                const v = vorlagen();
                out.wachsen = [
                    leben.length === 3 && leben.every((t) => form(t).endsWith(`:${at.cap}/${at.cap}`))
                        ? ""
                        : `bei der GPU ${leben.map(form).join(", ")} statt Albedo, Normale und Sonnen-Sicht in ${at.cap} Schichten`,
                    alt.every((g) => weg.has(g) || ren.backend.gl?.isTexture(g) === false) ? "" : "alte GPU-Form lebt",
                    ["lo", "ro", "lu", "ru"].every((k) => q[k] === nachher[k]) ? "" : "Bild anders nach dem Wachsen",
                    v.length >= 2 ? "" : "keine Vorlage gelesen — die Wand ist blind",
                    ...v,
                ].filter(Boolean);
                // SELBSTTEST: das Wachsen bis 16.10. (neue Texturen, der Knoten-Wert getauscht, die alten entsorgt) — an der
                // BC-Stufe (die rgba8-Schichten sind Ziel-Texturen eines Render-Ziels, ein Klon zeichnet dort nie)
                if (at.fmt !== "bc") return (out.wachsenSelbst = ["nur bc"]), ren.dispose(), out;
                const vor = [at.map, at.nmap];
                [at.map, at.nmap] = vor.map((t) => Object.assign(t.clone(), { needsUpdate: true }));
                [at.mapNode.value, at.nmapNode.value] = [at.map, at.nmap];
                for (const t of vor) t.dispose();
                await zaehle();
                out.wachsenSelbst = vorlagen().filter(Boolean);
                if (out.wachsenSelbst.length < 2) out.wachsen.push("SELBSTTEST: das alte Wachsen fällt nicht auf");
            } finally {
                P.destroy = zerstoere;
            }
            ren.dispose();
        } catch (e) {
            out.err = e?.message || String(e);
        }
        return out;
    }, fmtWunsch);
}

// ===== TEIL C2 — DIE VERGRÖSSERTE KARTE =====
// Die Stufe 0 der Karte ist binär (Karten-Gesetz, BC1). Bilinear gelesen schnitt der alphaTest jede vergrößerte Krone in
// Texel-Treppen (Werkbank, Radeon, Bestand von innen: Texel bis 3,3 px, Blöcke mit rechteckigen Löchern). Die Probe zeichnet
// eine Karte mit einer DIAGONALEN Kante so nah, dass ein Texel ~4 px misst, und liest die Kontur je Zeile: die Treppe ist
// der Anteil der Zeilen, deren Kanten-Spalte gleich bleibt (eine glatte Diagonale rückt je Zeile, eine Texel-Treppe steht
// so viele Zeilen still, wie ein Texel hoch ist). SELBSTTEST: dieselbe Kante in 8-Texel-Stufen gemalt MUSS treppig stehen.
async function vergroessertProbe(page, fmtWunsch) {
    return await page.evaluate(async (fmtWunsch) => {
        const out = { err: null, fmt: fmtWunsch };
        try {
            const T = THREE;
            const ren = new T.WebGPURenderer({ antialias: false });
            await ren.init();
            const W = 128,
                H = 128;
            ren.setSize(W, H, false);
            if (fmtWunsch === "bc" && window.__fimpFormat(ren) !== "bc")
                return { fmt: "bc", ohneFeature: true };
            r._kartenAtlas = undefined;
            const at = r._impostorAtlas();
            at.fmt = fmtWunsch;
            const prevCf = r.state.foundryCrossfade;
            r.state.foundryCrossfade = false;
            if (r.state._foliageMatCache)
                for (const [k, m] of r.state._foliageMatCache)
                    if (m.userData?.impostorBillboard) r.state._foliageMatCache.delete(k);
            const mat = r._impostorAtlasMaterial();
            r.state.foundryCrossfade = prevCf;
            if (!mat?.userData?.impostorBillboard) return { err: "kein Billboard-Stoff" };
            // die Kante: deckend, wo u + v > 1 (Ansichts-Koordinaten) — im Welt-Quad (8 × 8 m) die Diagonale x + y = 4; `stufe`
            // malt sie in Stufen von stufe × 2·stufe Texeln (der Selbsttest)
            const kante = (stufe) => {
                if (!stufe) return window.__fimpFlaeche([[0.98, 0.02, 0.98, 0.98, 0.02, 0.98]]);
                const d = [];
                for (let x = 0; x < at.cw; x += stufe) {
                    let y = 0;
                    while (y < at.ch && !((x + stufe / 2) / at.cw + (y + stufe) / at.ch > 1)) y += 2 * stufe;
                    if (y < at.ch) d.push(...window.__fimpRechteck(x / at.cw, y / at.ch, (x + stufe) / at.cw, 1));
                }
                return window.__fimpFlaeche(d);
            };
            const cam = new T.PerspectiveCamera(60, W / H, 0.05, 50);
            const d = 0.866; // ein Pixel 7,8 mm: ein Texel der Höhe (8 m / ch) misst ~4 px
            cam.position.set(0, 4, d);
            cam.lookAt(0, 4, 0);
            cam.updateMatrixWorld(true);
            out.pxJeTexel = +(8 / at.ch / ((2 * d * Math.tan(Math.PI / 6)) / H)).toFixed(2);
            const treppe = async (stufe, name) => {
                const z = await window.__fimpBacke(ren, at, "fimp:gateKante|" + name, stufe ? 94 : 93, kante(stufe));
                const leaf = r._impostorLeaf(z, new T.Matrix4(), 8);
                const mesh = new T.InstancedMesh(r._lodInstanceFacade(leaf.geom, 1), mat, 1);
                mesh.frustumCulled = false;
                const gruppe = {
                    key: "gate:kante:" + name,
                    mesh,
                    capacity: 1,
                    liveCount: 0,
                    slotRef: [],
                    slotEntry: [],
                };
                const ref = r._archGroupAlloc(gruppe, null);
                mesh.setMatrixAt(ref.slot, new T.Matrix4());
                mesh.instanceMatrix.needsUpdate = true;
                r._lodSlotStamp({ mesh }, ref.slot, 1, false, leaf);
                const szene = new T.Scene();
                szene.add(mesh);
                szene.add(new T.AmbientLight(0xffffff, 3));
                const rt = new T.RenderTarget(W, H);
                ren.setRenderTarget(rt);
                // der Wind ruht: die Probe misst die Karte, nie den Ausschlag des Augenblicks (die Treppe streute 0,248-0,372)
                if (r.state.windUniforms) r.state.windUniforms.uWindStrength.value = 0;
                await ren.renderAsync(szene, cam);
                const buf = await ren.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                let gleich = 0,
                    zeilen = 0,
                    vor = null;
                for (let y = 0; y < H; y++) {
                    let bx = -1;
                    for (let x = 0; x < W; x++)
                        if (buf[(y * W + x) * 4 + 3] > 0) {
                            bx = x;
                            break;
                        }
                    if (bx > 2 && bx < W - 3) {
                        if (vor !== null) {
                            zeilen++;
                            if (bx === vor) gleich++;
                        }
                        vor = bx;
                    } else vor = null;
                }
                rt.dispose();
                return { treppe: zeilen ? +(gleich / zeilen).toFixed(3) : null, zeilen };
            };
            out.kante = await treppe(0, "glatt");
            out.selbst = await treppe(8, "stufen");
            ren.dispose();
        } catch (e) {
            out.err = e?.message || String(e);
        }
        return out;
    }, fmtWunsch);
}

// ===== TEIL C3 — DIE KARTE SIEHT DAS AUGE =====
// r184 setzt den positionNode VOR die Instanz-Matrix (WGSL der Karte gelesen): las das Quad dort positionLocal und den
// Normal-Probe, blickte es aus dem Vorlagen-Raum und die Matrix drehte es danach mit dem Baum — jede Karte stand als
// feste Tafel in der Drehung ihrer Instanz (die Solitär-Eiche aus 22 m ein Strich, aus 70 m breit). Die Probe stellt
// EINE voll deckende Karte (Rahmen 4 × 8, Skala 1,5) abseits des Ursprungs in drei Drehungen auf und misst ihre Breite
// im Bild gegen die Breite der Tafel, die das Auge ansieht (12 m in 20 m Abstand). Täter beim Namen: der Karten-
// positionNode in `_buildPbrNodeMaterial` und `_instanzMatrixNode`.
const BLICK_DREHUNGEN = [0, 90, -119];
function blickUrteil(mess) {
    const v = [];
    for (const m of mess) {
        const q = m.soll > 0 ? m.breite / m.soll : 0;
        if (!(q >= 0.9 && q <= 1.1))
            v.push(
                `Drehung ${m.phi}°: Breite ${m.breite} px gegen ${m.soll} px (${q.toFixed(2)}) — die Karte sieht das Auge nicht`
            );
    }
    return v;
}
async function blickProbe(page) {
    return await page.evaluate(async (drehungen) => {
        const out = { err: null, mess: [] };
        try {
            const T = THREE;
            const ren = new T.WebGPURenderer({ antialias: false });
            await ren.init();
            const W = 128,
                H = 128;
            ren.setSize(W, H, false);
            r._kartenAtlas = undefined;
            const at = r._impostorAtlas();
            at.fmt = "rgba8";
            const prevCf = r.state.foundryCrossfade;
            r.state.foundryCrossfade = false;
            if (r.state._foliageMatCache)
                for (const [k, m] of r.state._foliageMatCache)
                    if (m.userData?.impostorBillboard) r.state._foliageMatCache.delete(k);
            const mat = r._impostorAtlasMaterial();
            r.state.foundryCrossfade = prevCf;
            if (!mat?.userData?.impostorBillboard) return { err: "kein Billboard-Stoff" };
            const z = await window.__fimpBacke(ren, at, "fimp:gateBlick|1", 95, window.__fimpSaeule());
            const leaf = r._impostorLeaf(z, new T.Matrix4(), 8);
            const anker = new T.Vector3(30, 0, -10),
                s = 1.5,
                d = 20;
            const cam = new T.PerspectiveCamera(60, W / H, 0.1, 200);
            cam.position.set(anker.x, 6, anker.z + d);
            cam.lookAt(anker.x, 6, anker.z);
            cam.updateMatrixWorld(true);
            const soll = Math.round((2 * 4 * s) / ((2 * d * Math.tan(Math.PI / 6)) / W));
            for (const phi of drehungen) {
                const mesh = new T.InstancedMesh(r._lodInstanceFacade(leaf.geom, 1), mat, 1);
                mesh.frustumCulled = false;
                const gruppe = {
                    key: "gate:blick:" + phi,
                    mesh,
                    capacity: 1,
                    liveCount: 0,
                    slotRef: [],
                    slotEntry: [],
                };
                const ref = r._archGroupAlloc(gruppe, null);
                const M = new T.Matrix4().compose(
                    anker,
                    new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), (phi * Math.PI) / 180),
                    new T.Vector3(s, s, s)
                );
                mesh.setMatrixAt(ref.slot, M);
                mesh.instanceMatrix.needsUpdate = true;
                r._lodSlotStamp({ mesh }, ref.slot, s, false, leaf);
                const szene = new T.Scene();
                szene.add(mesh);
                szene.add(new T.AmbientLight(0xffffff, 3));
                const rt = new T.RenderTarget(W, H);
                ren.setRenderTarget(rt);
                if (r.state.windUniforms) r.state.windUniforms.uWindStrength.value = 0; // der Wind ruht (wie C2)
                await ren.renderAsync(szene, cam);
                const buf = await ren.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                let breite = 0;
                for (let y = 0; y < H; y++) {
                    let x0 = -1,
                        x1 = -1;
                    for (let x = 0; x < W; x++)
                        if (buf[(y * W + x) * 4 + 3] > 0) {
                            if (x0 < 0) x0 = x;
                            x1 = x;
                        }
                    if (x0 >= 0 && x1 - x0 + 1 > breite) breite = x1 - x0 + 1;
                }
                rt.dispose();
                out.mess.push({ phi, breite, soll });
            }
            ren.dispose();
        } catch (e) {
            out.err = e?.message || String(e);
        }
        return out;
    }, BLICK_DREHUNGEN);
}

// ===== TEIL C4 — DER WIND WEHT IN DER WELT =====
// Dieselbe r184-Reihenfolge trägt jeder Stoff einer InstancedMesh (`_instanzMesh`): der positionNode läuft VOR der
// Instanz-Matrix. Addiert der Wind dort einen Versatz in Welt-Metern und Welt-Richtung, drehte und skalierte ihn die
// Matrix danach mit jedem Baum — jeder Baum bog sich in die Richtung seiner eigenen Drehung. Die Probe stellt EINE
// Säule (Vorlage 10 m, der Rinden-Stoff `_baumWindStoff` mit Wind-Daten) im Sturm (Wind-Zeile 1, Richtung +x, feste
// Wind-Uhr) in drei Instanz-Drehungen und zwei Skalen an DENSELBEN Anker und misst von oben den Versatz des Säulen-Bilds
// gegen die Säule ohne Wind (Schwerpunkt in Welt-Metern). Urteil: jeder Versatz zeigt in die Wind-Richtung (± 10°) und
// ist je Skala über die Drehungen gleich lang (± 10 %). Täter beim Namen: `_baumWindStoff` und `_instanzMatrixNode`.
const WIND_FAELLE = [
    { phi: 0, s: 1 },
    { phi: 90, s: 1 },
    { phi: -119, s: 1 },
    { phi: 0, s: 2 },
    { phi: 90, s: 2 },
    // die Wiese (`_windSwayOffset`, die Halme der Gras-Instanzen) liest dieselbe Naht
    { phi: 0, s: 1, stoff: "gras" },
    { phi: 90, s: 1, stoff: "gras" },
    { phi: -119, s: 1, stoff: "gras" },
];
function windUrteil(mess) {
    const v = [];
    const laenge = {};
    for (const m of mess) {
        const stoff = m.stoff || "rinde";
        const L = Math.hypot(m.dx, m.dz);
        // die Rinde weht in uWindDir (+x); die Wiese wiegt in Welt-x/z — sie misst gegen ihre Drehung 0
        const ref = m.stoff ? mess.find((q) => q.stoff === m.stoff && q.phi === 0 && q.s === m.s) : null;
        const w0 = ref ? (Math.atan2(ref.dz, ref.dx) * 180) / Math.PI : 0;
        const w = (((((Math.atan2(m.dz, m.dx) * 180) / Math.PI - w0 + 540) % 360) + 360) % 360) - 180;
        if (!(L > 0.05))
            v.push(`${stoff} Drehung ${m.phi}° Skala ${m.s}: kein Versatz (${L.toFixed(3)} m) — die Probe ist blind`);
        else if (Math.abs(w) > 10)
            v.push(
                `${stoff} Drehung ${m.phi}° Skala ${m.s}: der Wind weht ${w.toFixed(0)}° neben der Welt-Richtung — er dreht mit der Instanz`
            );
        (laenge[stoff + " " + m.s] = laenge[stoff + " " + m.s] || []).push(L);
    }
    for (const sk of Object.keys(laenge)) {
        const L = laenge[sk];
        const lo = Math.min(...L),
            hi = Math.max(...L);
        if (lo > 0 && hi / lo > 1.1)
            v.push(
                `Skala ${sk}: Versatz ${lo.toFixed(2)}–${hi.toFixed(2)} m über die Drehungen — er hängt an der Drehung`
            );
    }
    return v;
}
async function windProbe(page) {
    return await page.evaluate(async (faelle) => {
        const out = { err: null, mess: [] };
        try {
            const T = THREE;
            const ren = new T.WebGPURenderer({ antialias: false });
            await ren.init();
            const W = 256,
                H = 256;
            ren.setSize(W, H, false);
            r._windUniformsEnsure();
            const wu = r._ensureWindCoupling(T.TSL);
            const anker = new T.Vector3(30, 0, -10);
            const halb = 2; // Bild-Halbbreite in m (von oben): 1,6 cm je Pixel
            const cam = new T.OrthographicCamera(-halb, halb, halb, -halb, 0.1, 200);
            cam.position.set(anker.x, 60, anker.z);
            cam.up.set(0, 0, -1);
            cam.lookAt(anker.x, 0, anker.z);
            cam.updateMatrixWorld(true);
            const schwerpunkt = async (mesh) => {
                const szene = new T.Scene();
                szene.add(mesh);
                const rt = new T.RenderTarget(W, H);
                ren.setRenderTarget(rt);
                await ren.renderAsync(szene, cam);
                const buf = await ren.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                rt.dispose();
                let n = 0,
                    sx = 0,
                    sy = 0;
                for (let y = 0; y < H; y++)
                    for (let x = 0; x < W; x++)
                        if (buf[(y * W + x) * 4 + 3] > 0) {
                            n++;
                            sx += x;
                            sy += y;
                        }
                if (!n) return null;
                // Pixel → Welt (Bild-x = Welt +x, Bild-y (unten → oben) = Welt −z)
                const px = (2 * halb) / W;
                return { x: (sx / n + 0.5) * px - halb, z: -((sy / n + 0.5) * px - halb), n };
            };
            const baue = (phi, s, wind, stoff) => {
                const g = new T.CylinderGeometry(0.3, 0.3, 10, 8, 20);
                g.translate(0, 5, 0);
                g.setAttribute("aH0", new T.InstancedBufferAttribute(new Float32Array([10 * s]), 1));
                const mat = new T.MeshBasicNodeMaterial({ color: 0xffffff });
                if (wind && stoff === "gras")
                    mat.positionNode = T.TSL.positionLocal.add(
                        r._windSwayOffset(T.TSL, { ampX: 1.5, hoehe: T.TSL.positionGeometry.y })
                    );
                else if (wind) r._baumWindStoff(mat, "bark", { ht: 10, delta: 0.3, an: 1 });
                const mesh = new T.InstancedMesh(g, mat, 1);
                mesh.frustumCulled = false;
                const M = new T.Matrix4().compose(
                    anker,
                    new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), (phi * Math.PI) / 180),
                    new T.Vector3(s, s, s)
                );
                mesh.setMatrixAt(0, M);
                mesh.instanceMatrix.needsUpdate = true;
                return mesh;
            };
            wu.uWindDir.value.set(1, 0);
            wu.uWindStrength.value = r.constructor.WEATHER_WIND_AMP;
            wu.uWindTime.value = 3.0;
            for (const f of faelle) {
                const ruhe = await schwerpunkt(baue(f.phi, f.s, false, f.stoff));
                const sturm = await schwerpunkt(baue(f.phi, f.s, true, f.stoff));
                if (!ruhe || !sturm) {
                    out.mess.push({ phi: f.phi, s: f.s, stoff: f.stoff, dx: 0, dz: 0 });
                    continue;
                }
                out.mess.push({
                    phi: f.phi,
                    s: f.s,
                    stoff: f.stoff,
                    dx: +(sturm.x - ruhe.x).toFixed(3),
                    dz: +(sturm.z - ruhe.z).toFixed(3),
                });
            }
            ren.dispose();
        } catch (e) {
            out.err = e?.message || String(e);
        }
        return out;
    }, WIND_FAELLE);
}

hauptLauf(async () => {
    await server.lausche(0);
    const errs = [];

    // ===== TEIL A — MECHANIK (Null-Renderer, HART) =====
    const browserA = await starteBrowser({ art: "webgl", frist: 180000 });
    const { page: pageA } = await bootPage(browserA, true);
    const A = await driveImpostor(pageA);
    await installiereBacke(pageA);
    const ruhe = await weltRuht(pageA);
    const Cs =[await kleberProbe(pageA, "bc"), await kleberProbe(pageA, "rgba8")];
    const C2s = [await vergroessertProbe(pageA, "bc"), await vergroessertProbe(pageA, "rgba8")];
    const C3 = await blickProbe(pageA);
    const C4 = await windProbe(pageA);
    await browserA.close();

    console.log("=== P5/BÄCKER-VEREINIGUNG + W6 DER EINE KARTEN-ATLAS — TEIL A: MECHANIK (Null-Renderer) ===");
    console.log(`  Worker ready: ${A.ready}`);
    console.log(`  Atlas-Zelle: ${JSON.stringify(A.rec)}`);
    console.log(`  Atlas (Quad/Material geteilt, Schichten): ${JSON.stringify(A.atlas)}`);
    console.log(`  Gruppen (Streu ×2 Arten + gesetzt): ${JSON.stringify(A.gruppen)}`);
    console.log(`  asset-foundry-iframe im DOM: ${A.hasIframe} (erwartet false)`);
    if (A.err) console.log(`  Fehler: ${A.err}`);

    if (!A.ready) errs.push("A: der Worker wurde nicht ready");
    if (!A.rec) errs.push("A: keine Atlas-Zelle entstanden (die LOD1-Geometrie lud nicht?)");
    else {
        if (!A.rec.imAtlas) errs.push("A: die Zelle steht nicht im EINEN Atlas (_impostorAtlas().zellen)");
        if (!A.rec.hasFrame) errs.push("A: die Zelle hat keinen Rahmen");
        if (!A.rec.keineSaison) errs.push("A: der Zell-Schlüssel trägt eine Saison");
    }
    if (!A.atlas) errs.push("A: keine Karten-Flats (Eiche + Fichte) entstanden");
    else {
        if (!A.atlas.quadGeteilt) errs.push("A: zwei Arten tragen verschiedene Quads (je Karte eine Geometrie)");
        if (!A.atlas.materialGeteilt)
            errs.push("A: zwei Arten tragen verschiedene Materialien (je Karte ein Programm)");
        if (!A.atlas.billboard) errs.push("A: das Atlas-TSL-Wiring kam nicht zustande (kein Billboard-Marker)");
        if (!A.atlas.schichtenVerschieden) errs.push("A: zwei Arten teilen dieselbe Atlas-Schicht");
        if (!A.atlas.texturen) errs.push("A: der Atlas trägt keine Array-Texturen für seine Zellen");
    }
    if (A.gruppen) {
        const G = A.gruppen;
        if (G.karten.length !== 1)
            errs.push(`A: ${G.karten.length} Karten-Gruppen statt EINER (${G.karten.slice(0, 4).join(" · ")})`);
        if (!G.slotGruppen.every((k) => k === "impostor#fimp:atlas"))
            errs.push(`A: die Probe-Slots liegen nicht in der Atlas-Gruppe (${G.slotGruppen.join(" · ")})`);
        if (!G.instanziert) errs.push("A: aKarte ist kein Instanz-vec4 der Karten-Gruppe");
        if (!(G.vertexPuffer <= 8))
            errs.push(
                `A: die Karten-Pipeline trägt ${G.vertexPuffer} Vertex-Puffer (WebGPU-Grenze 8): ${G.attribute.join(" · ")}`
            );
        else {
            if (JSON.stringify(G.zellen) !== JSON.stringify(G.erwartet))
                errs.push(`A: aKarte.x je Slot ${JSON.stringify(G.zellen)} ≠ ${JSON.stringify(G.erwartet)}`);
            const rOk = G.rahmen.every((v, i) => Math.abs(v - G.erwartetRahmen[i]) < 1e-5);
            if (!rOk) errs.push(`A: aKarte.yz je Slot ${JSON.stringify(G.rahmen)} ≠ ${JSON.stringify(G.erwartetRahmen)}`);
            // die Sichthöhe der Maske: die Höhe der Höhen-Stufe × Instanz-Skala (der aH0-Stempel der L1), frei = positiv,
            // VOLL (verdeckt, Brücke, die Stufe im Halt — K36) = negativ
            const sOk = G.sicht.every(
                (v, i) => v < 0 === G.voll[i] && Math.abs(Math.abs(v) - G.erwartetSicht[i]) < 1e-3 * Math.max(1, G.erwartetSicht[i])
            );
            if (!sOk) errs.push(`A: aKarte.w je Slot ${JSON.stringify(G.sicht)} ≠ ±${JSON.stringify(G.erwartetSicht)} voll ${JSON.stringify(G.voll)} (Sichthöhe × Skala)`);
        }
    }
    if (A.strich) {
        const s = A.strich;
        console.log(`  Strich-Wand am Graphen: ${JSON.stringify(s)} · Selbsttest ${JSON.stringify(A.strichSelbst)}`);
        if (!(s.gradMap === 2 && s.gradNmap === 1 && s.ohne === 0 && s.springend === 0))
            errs.push(
                `A: Strich-Wand — die Albedo je Ansicht, die Normale der nächsten mit Gradienten der stetigen Koordinate (2/1), keine Stichprobe ohne (${JSON.stringify(s)})`
            );
        if (!(A.strichSelbst && A.strichSelbst.ohne === 1 && A.strichSelbst.springend === 1))
            errs.push("A-SELBSTTEST: ein Atlas-Stoff ohne Gradienten oder mit springender Ableitung bleibt ungesehen");
    } else if (A.ready) errs.push("A: die Strich-Proben liefen nicht");
    if (A.hasIframe) errs.push("A: ein asset-foundry-iframe LEBT noch im DOM (P3b nicht geschnitten)");

    console.log(`\n  RUHE VOR TEIL C: die Welt steht nach ${ruhe.takte} Takten · mit einer wartenden Karte: ${ruhe.karte}`);
    if (ruhe.karte) errs.push("C: eine wartende Karte bricht die Ruhe nicht (`_weltSteht` true)");
    for (const C of Cs) {
        const F = `C[${C.fmt}]`;
        console.log(
            `\n=== TEIL C [${C.fmt}] — DIE KARTEN-WAND (Layout + befreite Slots zeichnen NICHTS, echter Renderer) ===`
        );
        if (C.ohneFeature) {
            console.log(
                "  (die Welt wählt auf dem Probe-Renderer rgba8 — WebGL2 bzw. ohne texture-compression-bc; die BC-Stufe misst die Blick-Sonde)"
            );
            continue;
        }
        console.log(`  geschrieben: ${C.geschrieben} · Wiring: ${C.billboard}`);
        console.log(`  Eichung der Lese-Richtung: ${JSON.stringify(C.eichung)}`);
        console.log(
            `  LAYOUT (Karte: links oben opak) — Quadranten px: lo ${C.layout && C.layout.lo} · ro ${C.layout && C.layout.ro}` +
                ` · lu ${C.layout && C.layout.lu} · ru ${C.layout && C.layout.ru}`
        );
        if (C.layout) console.log(`  Schirm-Box ${JSON.stringify(C.box)} · Zeilen ${JSON.stringify(C.layout.zeilen)}`);
        console.log(`  Selbsttest Monster-Slot (Skala 1000) Pixel: ${C.monsterPx} (Linse MUSS Müll sehen)`);
        console.log(`  Free-Chokepoint verdichtet (count 1, der Lebende zog in Slot 0): ${C.umzug}`);
        console.log(`  nach _archGroupFree — lebender Slot: ${C.lebtPx} px · befreiter Slot: ${C.totPx} px`);
        if (C.err) {
            console.log(`  Fehler: ${C.err}`);
            errs.push(`${F}: Karten-Probe brach ab — ${C.err}`);
            continue;
        }
        if (!C.billboard) errs.push(`${F}: das Atlas-TSL-Wiring kam nicht zustande (kein Billboard-Marker)`);
        if (!C.geschrieben) errs.push(`${F}: die kodierte Schicht wurde nicht in den Atlas geschrieben`);
        if (!(C.eichung && C.eichung.markerPx > 4)) errs.push(`${F}: die Eichung sah den Marker nicht (Probe blind)`);
        const L = C.layout || {};
        const rest = (L.ro || 0) + (L.lu || 0) + (L.ru || 0);
        if (!(L.lo > 40 && L.lo > 6 * rest))
            errs.push(
                `${F}: die Karte steht NICHT links oben (lo ${L.lo} · Rest ${rest}) — Layout gedreht oder gespiegelt`
            );
        if (!(C.monsterPx > 200))
            errs.push(
                `${F}-SELBSTTEST: der Monster-Slot flutete den Schirm NICHT (${C.monsterPx} px) — die Linse ist blind`
            );
        if ((C.fremd || []).length)
            errs.push(`${F}: die Welt lieferte in den Probe-Atlas (${C.fremd.join(", ")}) — Teil C begann vor der Ruhe`);
        if (!C.umzug) errs.push(`${F}: _archGroupFree verdichtete nicht (count, Marke oder Matrix des Umzugs falsch)`);
        if (!(C.lebtPx > 40))
            errs.push(`${F}: der LEBENDE Slot zeichnet zu wenig (${C.lebtPx} px ≤ 40) — die Probe ist blind`);
        if (!(C.totPx <= 8))
            errs.push(`${F}: der befreite Slot zeichnet noch ${C.totPx} px (> 8) — die Gruppe ist NICHT dicht`);
        // C5 DAS WACHSEN (der EINE Abschied, `_texturAbschied`)
        console.log(`  C5 WACHSEN: ${(C.wachsen || []).join(" · ") || "GRÜN"} · Selbsttest: ${C.wachsenSelbst}`);
        for (const f of C.wachsen || ["keine Messung"]) errs.push(`${F} C5: ${f}`);
    }
    {
        console.log(
            "\n=== TEIL C3 — DIE KARTE SIEHT DAS AUGE (eine Karte, drei Instanz-Drehungen, Breite im Bild) ==="
        );
        if (C3.err) errs.push(`C3: Blick-Probe brach ab — ${C3.err}`);
        else {
            for (const m of C3.mess) console.log(`  Drehung ${m.phi}°: Breite ${m.breite} px (Soll ${m.soll} px)`);
            if (C3.mess.length !== BLICK_DREHUNGEN.length)
                errs.push("C3: nicht jede Drehung gemessen — die Probe ist blind");
            errs.push(...blickUrteil(C3.mess).map((x) => "C3: " + x));
        }
        const selbstRot = blickUrteil([{ phi: 90, breite: 6, soll: 66 }]).length === 1;
        const selbstGruen = blickUrteil([{ phi: 0, breite: 65, soll: 66 }]).length === 0;
        console.log(
            `  Selbsttest: die Tafel von der Seite feuert ${selbstRot} · die zugewandte Karte schweigt ${selbstGruen}`
        );
        if (!(selbstRot && selbstGruen))
            errs.push("C3-SELBSTTEST: das Blick-Urteil unterscheidet Tafel und Karte nicht");
    }
    {
        console.log("\n=== TEIL C4 — DER WIND WEHT IN DER WELT (eine Säule im Sturm, drei Drehungen, zwei Skalen) ===");
        if (C4.err) errs.push(`C4: Wind-Probe brach ab — ${C4.err}`);
        else {
            for (const m of C4.mess)
                console.log(`  ${m.stoff || "rinde"} Drehung ${m.phi}° Skala ${m.s}: Versatz (${m.dx}, ${m.dz}) m`);
            if (C4.mess.length !== WIND_FAELLE.length) errs.push("C4: nicht jeder Fall gemessen — die Probe ist blind");
            errs.push(...windUrteil(C4.mess).map((x) => "C4: " + x));
        }
        const selbstRot =
            windUrteil([
                { phi: 0, s: 1, dx: 0.8, dz: 0 },
                { phi: 90, s: 1, dx: 0, dz: -0.8 },
            ]).length === 1;
        const selbstLang =
            windUrteil([
                { phi: 0, s: 2, dx: 0.8, dz: 0 },
                { phi: 90, s: 2, dx: 1.6, dz: 0 },
            ]).length === 1;
        const selbstGruen =
            windUrteil([
                { phi: 0, s: 1, dx: 0.8, dz: 0.02 },
                { phi: 90, s: 1, dx: 0.79, dz: -0.03 },
            ]).length === 0;
        console.log(
            `  Selbsttest: der gedrehte Wind feuert ${selbstRot} · der skalierte feuert ${selbstLang} · der Welt-Wind schweigt ${selbstGruen}`
        );
        if (!(selbstRot && selbstLang && selbstGruen))
            errs.push("C4-SELBSTTEST: das Wind-Urteil unterscheidet Welt- und Instanz-Wind nicht");
    }
    for (const C2 of C2s) {
        const F = `C2[${C2.fmt}]`;
        console.log(
            `\n=== TEIL ${F} — DIE VERGRÖSSERTE KARTE (Treppe der Kanten-Kontur, ein Texel ~${C2.pxJeTexel} px) ===`
        );
        if (C2.ohneFeature) {
            console.log("  (die Welt wählt auf dem Probe-Renderer rgba8 — WebGL2 bzw. ohne texture-compression-bc; die BC-Stufe misst die Werkbank)");
            continue;
        }
        if (C2.err) {
            errs.push(`${F}: Kanten-Probe brach ab — ${C2.err}`);
            continue;
        }
        const k = C2.kante || {},
            s = C2.selbst || {};
        console.log(`  glatte Kante: Treppe ${k.treppe} über ${k.zeilen} Zeilen (Soll ≤ 0,35)`);
        console.log(`  Selbsttest 8-Texel-Stufen: Treppe ${s.treppe} über ${s.zeilen} Zeilen (MUSS > 0,6)`);
        if (!(k.zeilen >= 40))
            errs.push(`${F}: die Kante liegt nicht im Bild (${k.zeilen} Zeilen) — die Probe ist blind`);
        else if (!(k.treppe <= 0.35))
            errs.push(
                `${F}: die vergrößerte Karte steht in Texel-Treppen (Treppe ${k.treppe} > 0,35) — _liesA liest sie nicht kubisch`
            );
        if (!(s.zeilen >= 40 && s.treppe > 0.6))
            errs.push(`${F}-SELBSTTEST: die 8-Texel-Stufen stehen nicht treppig (${s.treppe}) — die Linse ist blind`);
    }

    server.close();
    wandEnde(errs, "die Welt-Fernstufe liest die im Welt-Renderer gebackene Karte über EINEN Karten-Atlas (eine Gruppe, ein Material, Schicht + Rahmen je Instanz), die Karte steht richtig herum, befreite Slots zeichnen nichts (die Gruppe verdichtet), jede Atlas-Stichprobe trägt die Gradienten der stetigen Koordinate (kein Stamm-Strich); Bäcker-Kanal, RTT-Nachbau, Bake-iframe und Canvas-Atlas je Karte sind geschnitten.");
});
