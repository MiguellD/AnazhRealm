// diag-nervensystem-schmiede.cjs — DER ε-BEWEIS DER WAFFEN-DOMAENE (Katalysator-Bogen
// W-A4a; Nervensystem-Plan TEIL IV Phase ε). Die Klingen-Domaene (schmiede-core.js,
// __schmiedeCore) dockt NUR ueber die Checkliste §ε an: Manifest-Zeile (N2) +
// KIND_POLICY-Zeile + Donor-Blueprint (N1, beides DATEN) + fx.place als Rezept-Daten
// (N5.5, mode "hand") — der Stamm bekam KEINEN Logik-Zweig (M8; den strukturellen
// „kein kind-if im AutoRegister"-Wall traegt zusaetzlich das Verfassungs-Gesetz N1 in
// gate:constitution). Gestraffte Schwester zu diag-nervensystem-porta.cjs:
//   S (statisch, Node, Absenzen): der Auto-Register-Chokepoint vergleicht keinen kind-String (M8) ·
//     die Donor-Zeile geraet_schwert traegt kein portalMeta/roleManual (der Alt-Blueprint ist PHYSISCH
//     gefallen) · die Hand waermt keine Pipeline vor. --selftest: das Faust-Verdikt (H-F).
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die Klingen-
//     Rezepte seines Kerns (Waffen UND Werkzeuge, das Soll aus schmiede-core) · kindStages.weapon == die Deklaration des Kerns gemerged (tree/
//     vehicle/gate unberuehrt) · Auto-Blueprint klinge_langschwert entsteht am
//     EINEN Chokepoint (Donor-Klon, KEIN _grownSpecies) · die generische
//     klinge_-Regel loest auf · die Place-Aufloesung liefert mode "hand", der
//     Dispatch streut NICHT + keine klinge_-Wald-Nische ·
//     _foundryRequest("langschwert",7,0) liefert Meshes end-to-end (Mesh-Zahl
//     geloggt; mat.color reist, BuildGroup baut) · die Distanz-Wahl lod=2 klemmt
//     fail-closed auf Stufe 0.
//   H (W-A4b — DIE STUDIO-GESTALT IN DER HAND, eigener Abschnitt + eigene Zaehlung):
//     equipHeld zeigt SOFORT den Part-Bau als Interim (die Hand ist nie leer) und
//     tauscht bei Asset-Ankunft GENAU EINMAL auf die Studio-Wrapper (sharedGeom/
//     sharedMat, foundryHeld) · Skala/Anker-Zahlen geloggt (Template-BBox je Achse
//     fuer langschwert + spitzhacke, gripX aus dem LIVE-Buch; H-F die FAUST in Welt-Metern:
//     Länge, Griff-Versatz, Winkel zum Unterarm — W5) · der Unequip zerstoert das GETEILTE Asset NICHT
//     (_queueDispose instrumentiert; die Cache-Gruppe baut danach noch eine
//     Werkstatt-Vorschau; _liveRefs-Rueckgabe) · foundry-off (lokaler Hook,
//     sichern/wiederherstellen) -> der Part-Pfad byte-alt.
//   node scripts/diag-nervensystem-schmiede.cjs [--selftest]
const { statikServer, hauptLauf, pruefer, wandEnde, selbsttestEnde, fehlerText, SELBSTTEST, stammLib } = require("./lib/welt-boot.cjs");
const kernStufen = require("./lib/kern-stufen.cjs");

const PORT = Number(process.env.NERV_SCHMIEDE_PORT || 4433);
const server = statikServer();

// ── H-F (W5 Gegenstände) — DAS FAUST-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test). Die gehaltene
// Studio-Klinge in der Hand des Studio-Menschen, gemessen in WELT-Metern:
//   laenge  0,95–1,05 — Welt-Länge / Gesetzbuch-Länge (die Hand skaliert nie im Anker-Raum)
//   versatz ≤ 0,03 m  — die Griff-Mitte gegen die Hand-Mitte (Schwerpunkt der Haut-Vertices am Handgelenk-Gelenk)
//   winkel  50–130°   — Griff-Achse gegen den Unterarm: eine Faust greift quer
const FAUST = { laenge: [0.95, 1.05], versatzM: 0.03, winkel: [50, 130] };
function faustVerdict(h) {
    if (!h || !Number.isFinite(h.laenge)) return ["probe"];
    const out = [];
    if (!(h.laenge >= FAUST.laenge[0] && h.laenge <= FAUST.laenge[1])) out.push(`laenge ${h.laenge.toFixed(3)}`);
    if (!(h.versatzM <= FAUST.versatzM)) out.push(`versatz ${(h.versatzM || 0).toFixed(3)} m`);
    if (!(h.winkel >= FAUST.winkel[0] && h.winkel <= FAUST.winkel[1])) out.push(`winkel ${(h.winkel || 0).toFixed(1)}°`);
    return out;
}
// ── H-S (physik.K4) — DAS SEIL AM LEIB (pure Funktion; Browser-Probe UND Selbst-Test): die Täter der Klasse „kein Seil am Leib"
// beim Namen. Der Flegel der Schmiede in der Hand; das Auge erst fern (jenseits `SEIL_NAH_M`), dann 3 m vor dem Leib; der Leib
// geht 0,5 s mit 3 m/s und steht, je Takt ruft der Takt der Seile (`_seilTakt`, der benannte Konsum-Leser) das EINE Gesetz des
// Kerns). Urteil, je Täter ein Schlüssel: `teile` die Gestalt trägt die Teile, die das Gesetz nennt (Glieder + Kopf,
// `userData.__seil` — die Brücke reicht `seil`) · `schwung` der Kopf schwingt nach dem Halt ≥ 5 cm (der Leser rechnet und legt
// die Kette) · `ruht` nach 15 s Stille ruht das Seil (die Kosten gehören der Änderung) · `fern` mit dem Auge jenseits
// SEIL_NAH_M rechnet es nicht (die Kosten gehören dem Schirm). Länge (±2 % längs des Seils) und Dämpfung misst die Station
// physik.K4#1 der Punkte-Maschine in der Tiefe.
const seilVerdict = (h) => (h ? Object.keys(h).filter((k) => h[k] === false || h[k] === 0) : ["probe"]);
const { errs, check } = pruefer();
/// ===== TEIL S: die statischen Gesetze — die Absenzen über den EINEN Helfer `stammLib.fehlt` (kommentarfrei; ein totes
// Glied wirft beim Namen). (S3, M8 — kein kind-String-Vergleich im Auto-Register-Chokepoint — hält gate:pipeline-
// constitution N1 wörtlich; Policy, Substanz und donorTool beweist Teil D.) `q` die Wandlung des Vor-Stands, leer = der
// Arbeitsbaum.
function staticLaws(q) {
    return [
        // S6 (Absenz): die Donor-Zeile geraet_schwert trägt keinen Blueprint-Namen, kein portalMeta/roleManual; Teile und
        // Klon prüft Teil D.
        [
            "S6: die Donor-SUBSTANZ geraet_schwert trägt kein portalMeta/roleManual — der Alt-Blueprint-Block ist GEFALLEN",
            stammLib.fehlt(/\n {4}geraet_schwert: [^{\n]*\{/, /name:\s*"geraet_schwert"|portalMeta|roleManual/, q),
            stammLib.fehlt.wo,
        ],
        // S8 (Absenz): die Hand wärmt keine Pipeline vor — die Erst-Zeichnung trägt; die Hand-Quelle beweist Teil H am Verhalten.
        ["S8: die Hand wärmt keine Pipeline vor", stammLib.fehlt("_refreshHeldMesh", /compileAsync|_warmCompilePipeline/, q), stammLib.fehlt.wo],
    ];
}

hauptLauf(async () => {
    if (SELBSTTEST) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V6/V8: portalMeta in der Donor-Zeile, ein Vorwärmen in der Hand -> S6 und S8 feuern beim Namen
        const rot = staticLaws((t) =>
            stammLib.ersetze(t, [
                [null, /(\n {4}geraet_schwert: \{)/, "$1\n        portalMeta: {},"],
                [null, /(\n {4}_refreshHeldMesh\([^)]*\) \{)/, "$1\n        this._warmCompilePipeline();"],
            ])
        ).filter((l) => !l[1]);
        check("Selbst-Test 6/8: portalMeta in geraet_schwert, Vorwärmen in der Hand -> S6 S8 feuern", rot.length === 2, rot.map((l) => l[2]).join(" · "));

        // V4 (H-F, W5): das Faust-Verdikt feuert auf jeden der drei gemessenen Täter des Vor-Stands.
        const gesund = { laenge: 1.0, versatzM: 0.012, winkel: 88 };
        check("Selbst-Test 4 (H-F): gesunde Faust == 0 Verstoesse", faustVerdict(gesund).length === 0);
        for (const [name, bruch] of [
            ["das Langschwert misst 0,17 m (Anker-Raum)", { laenge: 0.14 }],
            ["der Griff sitzt 0,04 m neben der Hand-Mitte", { versatzM: 0.042 }],
            ["die Klinge steht den Unterarm hinauf (160°)", { winkel: 160 }],
        ])
            check(
                `Selbst-Test 5 (H-F): ‚${name}' → die Faust-Linse feuert`,
                faustVerdict(Object.assign({}, gesund, bruch)).length === 1
            );
        // V9 (H-S, physik.K4): das Seil-Verdikt feuert auf jeden Täter der Klasse „kein Seil am Leib" beim Namen.
        for (const [n, b] of Object.entries({
            "": {},
            teile: { teile: false },
            schwung: { schwung: false },
            ruht: { ruht: false },
            fern: { fern: false },
        }))
            check(
                `Selbst-Test 9 (H-S): ${n || "gesund"}`,
                seilVerdict({ teile: true, schwung: true, ruht: true, fern: true, ...b }).join() === n
            );
        selbsttestEnde(errs, "die Linse feuert auf alle Verletzungs-Klassen (Faust, Seil).");
        process.exit(0);
    }

    console.log("=== ε-BEWEIS SCHMIEDE — TEIL S: die statischen Absenzen (Node) ===");
    for (const [name, ok, detail] of staticLaws()) check(name, ok, detail);

    const W = { bp: "klinge_langschwert", donor: "geraet_schwert", preset: "langschwert", entry: "klinge_spitzhacke", praefix: "klinge_", wahl: 2, name: "eine Klinge", art: "weapon", teile: 4, label: "Langschwert", place: { mode: "hand", dispatch: null } };
    const [eps, out] = await kernStufen.epsilonDraht(server, PORT, W, check, async () => {
        const res = { b: {}, d: {}, h: {} };
        const A = AnazhRealm;
        const f = r._ensureAssetFoundry();
        const weapon = Object.values(f.recipes).filter((x) => x?.kind === "weapon");
        res.b.toolCount = weapon.filter((x) => x.fx?.tool).length;
        res.b.paramsWeapon = f.paramsByKind?.weapon?.length ?? -1;
        // ===== D (dazu): die Werkzeug-Klasse dockt ueber donorTool (geraet_spitzhacke-Substanz), die Rollen =====
        try {
            const B = st.blueprints || {};
            const KS = A.KIND_SUBSTANCE || {};
            res.d.spitzAbsent = !B.geraet_spitzhacke;
            res.d.substanzSpitz = KS.geraet_spitzhacke?.parts?.length || 0;
            res.d.weaponRole = B.klinge_langschwert ? r.computeBlueprintRole(B.klinge_langschwert) : null;
            const tbp = B.klinge_spitzhacke;
            res.d.toolPartsMatch = !!tbp && JSON.stringify(tbp.parts) === JSON.stringify(KS.geraet_spitzhacke?.parts);
            res.d.toolRole = tbp ? r.computeBlueprintRole(tbp) : null;
        } catch (e) {
            res.d.err = fehlerText(e);
        }
        // ===== H: DIE HAND (W-A4b) — die Studio-Gestalt am EINEN Equip-Chokepoint =====
        try {
            // Welt-bereit (Spieler-Mesh baut parallel zum Foundry-Handshake).
            await __weltDa(() => st.playerMesh && st.player);
            const pm = st.playerMesh;
            res.h.playerReady = !!(pm && st.player);
            if (res.h.playerReady) {
                // (1) INTERIM auf einem JUNGFRAEULICHEN Schluessel (klinge_degen — kein anderer
                // Abschnitt fragte ihn an; langschwert|8|0 kollidiert mit der F-Anfrage):
                // der Equip zeigt SOFORT den Part-Bau, die Ankunft tauscht auf Studio.
                r.equipHeld("klinge_degen");
                const studio = async (name) => {
                    for (const weiter = __deckel(name, 300); weiter() && !pm.userData.heldMesh.userData.foundryHeld;)
                        await sleep(150);
                    return pm.userData.heldMesh;
                };
                const hm0 = pm.userData.heldMesh;
                res.h.interimVisible = hm0.children.length > 0 && !hm0.userData.foundryHeld;
                res.h.degenStudio = !!(await studio("der Degen der Schmiede")).userData.foundryHeld;
                // (2) WARM: langschwert equipen, auf die Studio-Gestalt warten, Zahlen messen.
                r.equipHeld("klinge_langschwert");
                const hm = await studio("das Langschwert der Schmiede");
                res.h.studio = !!hm.userData.foundryHeld;
                if (res.h.studio) {
                    res.h.preset = hm.userData.heldPreset;
                    res.h.meshCount = hm.children.length;
                    res.h.allShared = hm.children.every((c) => c.userData.sharedGeom && c.userData.sharedMat);
                    // die WELT-Skala (W5: die Hand teilt die Anker-Skala heraus — lokal 1/0,27, in der Welt 1:1)
                    hm.updateMatrixWorld(true);
                    const hmWs = hm.getWorldScale(new THREE.Vector3()).x;
                    res.h.scale = Number(hmWs.toFixed(4));
                    res.h.scaleOk = hmWs > 0 && hmWs <= AnazhRealm.HELD_MESH.maxScale;
                    res.h.gripX = hm.userData.heldGripX;
                    res.h.axis = hm.userData.heldAxis;
                    const parts = pm.userData.parts || {};
                    res.h.anchored = hm.parent === (parts.rightArm || parts.rightWing || pm);
                    const src = hm.userData.foundrySrcGroup;
                    res.h.liveRefs = src ? src._liveRefs : -1;
                    // H-F (W5): DIE FAUST in Welt-Metern — Länge gegen das Gesetzbuch, Griff-Mitte gegen die Hand-Mitte
                    // (Schwerpunkt der Haut-Vertices, die das Handgelenk-Gelenk zu > 60 % trägt, Bind-Pose im Gelenk-
                    // Raum), Winkel Griff-Achse ↔ Unterarm (Ellbogen → Handgelenk).
                    try {
                        pm.updateMatrixWorld(true);
                        const bbT = src ? new THREE.Box3().setFromObject(src) : null;
                        const W = (x) => new THREE.Vector3(x, 0, 0).applyMatrix4(hm.matrixWorld);
                        const a = W(bbT.min.x);
                        const b = W(bbT.max.x);
                        const g = W(hm.userData.heldGripX || 0);
                        const wrist = hm.parent;
                        let palm = null;
                        pm.traverse((o) => {
                            if (palm || !o.isSkinnedMesh) return;
                            const bi = o.skeleton.bones.indexOf(wrist);
                            const SI = o.geometry.attributes.skinIndex;
                            const SW = o.geometry.attributes.skinWeight;
                            if (bi < 0 || !SI || !SW) return;
                            const P = o.geometry.attributes.position;
                            const v = new THREE.Vector3();
                            const sum = new THREE.Vector3();
                            let n = 0;
                            for (let i = 0; i < P.count; i++) {
                                let w = 0;
                                for (let k = 0; k < 4; k++) if (SI.getComponent(i, k) === bi) w += SW.getComponent(i, k);
                                if (w < 0.6) continue;
                                v.fromBufferAttribute(P, i).applyMatrix4(o.bindMatrix).applyMatrix4(o.skeleton.boneInverses[bi]);
                                sum.add(v);
                                n++;
                            }
                            if (n) palm = sum.multiplyScalar(1 / n).applyMatrix4(wrist.matrixWorld);
                        });
                        const unterarm = wrist
                            .getWorldPosition(new THREE.Vector3())
                            .sub(wrist.parent.getWorldPosition(new THREE.Vector3()))
                            .normalize();
                        const achse = b.clone().sub(g).normalize();
                        res.h.faust = {
                            laenge: a.distanceTo(b) / (bbT.max.x - bbT.min.x),
                            weltM: a.distanceTo(b),
                            versatzM: palm ? g.distanceTo(palm) : null,
                            winkel: (Math.acos(Math.max(-1, Math.min(1, achse.dot(unterarm)))) * 180) / Math.PI,
                        };
                    } catch (e) {
                        res.h.faustErr = fehlerText(e);
                    }
                    // (3) UNEQUIP zerstoert das GETEILTE Asset NICHT — _queueDispose instrumentiert.
                    const sharedGeos = [];
                    hm.traverse((o) => o.userData.sharedGeom && sharedGeos.push(o.geometry));
                    const refsBefore = src ? src._liveRefs : 0;
                    const queued = [];
                    const protoQD = AnazhRealm.prototype._queueDispose;
                    r._queueDispose = function (obj) {
                        queued.push(obj);
                        return protoQD.call(this, obj);
                    };
                    r.equipHeld(null);
                    delete r._queueDispose;
                    res.h.unequipNoMesh = !pm.userData.heldMesh;
                    res.h.sharedSurvives = !queued.some((q) => sharedGeos.includes(q));
                    res.h.refReturned = !src || src._liveRefs === Math.max(0, refsBefore - 1);
                    res.h.srcAlive = !!(src && !src._geomDisposed && src.children[0]?.geometry?.attributes?.position);
                    // (4) die Cache-Gruppe baut DANACH noch eine Werkstatt-Vorschau (ein Zug, viele Leser).
                    const wsWrap = src ? r._workshopWrapFoundryGroup(src) : null;
                    res.h.workshopAfter = wsWrap?.children.length > 0;
                    // (4b) KONSUM statt Quelltext: die Hand-Quelle zieht den Welt-Cache und die EINE Wrapper-Quelle (Spion je Glied).
                    const spion = (k) => ((f, z) => ((r[k] = (...a) => (z.n++, f.apply(r, a))), () => (delete r[k], z.n)))(r[k], { n: 0 });
                    const [zuW, zuC] = [spion("_workshopWrapFoundryGroup"), spion("_foundryCacheGet")];
                    const wK = r._heldFoundryGroup("klinge_langschwert");
                    res.h.konsum = { wrap: zuW(), cache: zuC() };
                    if (wK && wK !== "pending") r._disposeSoulGroup(wK);
                }
                // (5) SPITZHACKE-Probe (Werkzeug-Klasse, s.schaft-Griff) — direkte Quelle + Zahlen.
                let probe;
                for (
                    const weiter = __deckel("die Spitzhacke", 300);
                    (probe = r._heldFoundryGroup("klinge_spitzhacke")) === "pending" && weiter();
                )
                    await sleep(150);
                if (probe && probe !== "pending") {
                    res.h.spitzGrip = probe.userData.heldGripX;
                    res.h.spitzAxis = probe.userData.heldAxis;
                    r._disposeSoulGroup(probe); // Ref-Rueckgabe (die Probe haelt nichts fest)
                }
                // (5b) H-S (physik.K4): DAS SEIL AM LEIB — der Flegel in der Hand (das Urteil oben bei seilVerdict)
                try {
                    r.equipHeld("klinge_flegel");
                    const hf = await studio("der Flegel"),
                        cam = r.state.camera.position,
                        weit = AnazhRealm.SEIL_NAH_M * 2,
                        st = hf.children.filter((t) => t.userData.__seil >= 0),
                        e = [...r._seile].find((x) => x.mesh === hf) || { seil: {} },
                        kopf = () => new THREE.Box3().setFromObject(st[st.length - 1]).getCenter(new THREE.Vector3()),
                        takt = (n, dx) => {
                            for (let k = 0; k < n; k++) ((pm.position.x += dx), r._seilTakt(1 / 60));
                        },
                        h = { teile: st.length === e.seil.glieder + 1 };
                    cam.copy(hf.getWorldPosition(cam)).z += weit;
                    takt(30, 0.01);
                    h.fern = !e.z;
                    cam.z -= weit - 3;
                    takt(31, 0.05);
                    const k0 = kopf();
                    let w = 0;
                    for (let k = 0; k < 120; k++) (takt(1, 0), (w = Math.max(w, kopf().distanceTo(k0))));
                    takt(900, 0);
                    res.h.seil = Object.assign(h, { schwung: w >= 0.05, ruht: e.z.ruht });
                    pm.position.x -= 1.85;
                    r.equipHeld(null);
                } catch (e) {
                    res.h.seilErr = fehlerText(e);
                }
                // (6) FOUNDRY-OFF — lokaler Hook, SICHERN + WIEDERHERSTELLEN (die Gate-Hook-Lehre).
                const prevHook = window.__anazhGateNoFoundry;
                window.__anazhGateNoFoundry = true;
                r.equipHeld("klinge_langschwert");
                const hmOff = pm.userData.heldMesh;
                res.h.offIsPart = hmOff?.children.length > 0 && !hmOff.userData.foundryHeld;
                r.equipHeld(null);
                if (prevHook) window.__anazhGateNoFoundry = prevHook;
                else delete window.__anazhGateNoFoundry;
            }
        } catch (e) {
            res.h.err = fehlerText(e);
        }
        return res;
    });
    check("B: die Regler-Daten fliessen (langschwert.s.griff == 0.24)", eps.b.s.griff === 0.24, String(eps.b.s.griff));
    check(
        "B: die Werkzeug-Marke reist (9 tool:true — Messer/Faellaxt/Spaltmaul/Vorschlaghammer/Beil/Spitzhacke/Spaten/Schaufel/Sichel)",
        out.b.toolCount === 9,
        String(out.b.toolCount)
    );
    check("B: die B4-Regler-Tabelle reist (paramsByKind.weapon == 18 Dials, W-A1-Generik)", out.b.paramsWeapon === 18, String(out.b.paramsWeapon));
    // kindStages.weapon == die Deklaration von schmiede-core urteilt der EINE Draht je Art gegen den Kern (keine Abschrift)
    check("D: builtIn == false (Policy-Zeile; User-Werk-Sicht wie Fahrzeug/Tor)", eps.d.builtIn === false);
    check(
        "D: auch der Werkzeug-Donor ist ABWESEND, seine Substanz trägt 2 Parts (KIND_SUBSTANCE.geraet_spitzhacke)",
        out.d.spitzAbsent && out.d.substanzSpitz === 2,
        out.d.err || `spitz=${out.d.substanzSpitz}`
    );
    check('D: die reine Waffe traegt role "weapon" (klinge_langschwert)', out.d.weaponRole === "weapon", `role=${out.d.weaponRole}`);
    check(
        'D: das Werkzeug traegt die WERKZEUG-Substanz byte-gleich + role "tool" (klinge_spitzhacke == KIND_SUBSTANCE.geraet_spitzhacke)',
        out.d.toolPartsMatch && out.d.toolRole === "tool",
        `role=${out.d.toolRole}`
    );
    check(
        "F: die Distanz-Wahl 2 klemmt fuer kind:weapon auf Stufe 0 (fail-closed [0])",
        /^[^|]*\|[^|]*\|0(\||$)/.test(eps.f.key || ""), // Körper-Schlüssel preset|gestalt|stufe[|ov] (V18.527)
        eps.f.err || String(eps.f.key)
    );
    // ===== H: DIE HAND (W-A4b) — eigene Zaehlung =====
    check("H: Spieler-Mesh bereit (der Hand-Beweis hat einen Traeger)", out.h.playerReady, out.h.err);
    check(
        "H: INTERIM — der Equip zeigt SOFORT den Part-Bau (klinge_degen, jungfraeulicher Schluessel; die Hand ist nie leer)",
        out.h.interimVisible,
        out.h.err
    );
    check(
        "H: die Asset-Ankunft tauscht GENAU EINMAL auf die Studio-Gestalt (foundryHeld, ohne zweiten Equip)",
        out.h.degenStudio
    );
    check(
        "H: warm equipHeld(klinge_langschwert) -> der Held-Mesh traegt Studio-Wrapper (foundryHeld, preset langschwert)",
        out.h.studio && out.h.preset === "langschwert",
        String(out.h.preset)
    );
    check(
        "H: JEDES Wrapper-Kind teilt Geometrie+Material (sharedGeom/sharedMat — die EINE Wrapper-Quelle)",
        out.h.allShared && out.h.meshCount > 3,
        `meshes=${out.h.meshCount}`
    );
    check(
        "H: Welt-Skala in der Hand (0 < Welt-Skala <= maxScale) + am Arm-Anker geparentet",
        out.h.scaleOk && out.h.anchored,
        `scale=${out.h.scale}`
    );
    check(
        'H: Anker-Daten — handAxis "x" (KIND_POLICY-Daten), gripX == fx.held.gripX (langschwert 0.12 == griff 0.24/2)',
        out.h.axis === "x" && Math.abs((out.h.gripX || 0) - 0.12) < 1e-6,
        `gripX=${out.h.gripX}`
    );
    // H-S (physik.K4): das Seil am Leib — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test)
    check(
        "H-S/physik.K4: DAS SEIL AM LEIB (teile · schwung · ruht · fern)",
        !seilVerdict(out.h.seil).length,
        seilVerdict(out.h.seil) + (out.h.seilErr || "")
    );
    // H-F (W5): die Faust — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const fv = faustVerdict(out.h.faust);
    const fz = out.h.faust || {};
    check(
        "H-F/W5: DIE FAUST — das Langschwert trägt in der Hand seine Gesetzbuch-Länge, der Griff sitzt in der Hand-Mitte, die Klinge steht quer zum Unterarm",
        fv.length === 0,
        out.h.faustErr ||
            `Länge ${(fz.weltM || 0).toFixed(3)} m (Welt/Gesetz ${(fz.laenge || 0).toFixed(3)}) · Versatz ${fz.versatzM === null || fz.versatzM === undefined ? "—" : fz.versatzM.toFixed(3)} m · Winkel ${(fz.winkel || 0).toFixed(1)}°${fv.length ? " — Täter: " + fv.join(", ") : ""}`
    );
    check(
        "H: die Werkzeug-Klasse ankert ueber fx.held.gripX (klinge_spitzhacke gripX > 0, axis x — Vertrags-Daten aus stations(P))",
        out.h.spitzAxis === "x" && Number.isFinite(out.h.spitzGrip) && out.h.spitzGrip > 0,
        `gripX=${out.h.spitzGrip}`
    );
    check(
        "H: der Unequip zerstoert das GETEILTE Asset NICHT (kein sharedGeom in _queueDispose, Quell-Gruppe lebt, Ref zurueckgegeben)",
        out.h.unequipNoMesh && out.h.sharedSurvives && out.h.srcAlive && out.h.refReturned,
        `refs=${out.h.liveRefs}`
    );
    check(
        "H: die Cache-Gruppe baut nach dem Unequip noch eine Werkstatt-Vorschau (ein Zug, viele Leser)",
        out.h.workshopAfter
    );
    const kH = out.h.konsum || {};
    check(
        "H: die Hand-Quelle zieht den Welt-Cache und die EINE Wrapper-Quelle (Konsum)",
        kH.wrap > 0 && kH.cache > 0,
        JSON.stringify(kH)
    );
    check("H: foundry-off (lokaler Hook, gesichert/wiederhergestellt) -> der Part-Pfad byte-alt", out.h.offIsPart);

    wandEnde(errs, "DER ε-BEWEIS STEHT: die Waffen-/Werkzeug-Domaene dockt NUR ueber die Checkliste §ε an (Manifest-Zeile + KIND_POLICY-Zeile + Donor-DATENBLOCK + fx.place-Daten), der Stamm traegt KEINEN neuen kind-Zweig — schmiede-core reist durch den EINEN Foundry-Worker (Rezepte + kindStages + B4-Regler + Asset), klinge_<id> entsteht am EINEN Chokepoint, hand reist als Daten ohne Streu (N5.5) — UND (W-A4b) die gehaltene Klinge traegt die STUDIO-GESTALT: Part-Interim -> Ankunfts-Tausch, sharedGeom-Wrapper, daten-getriebener Griff-Anker, Unequip laesst das geteilte Asset stehen, foundry-off bleibt Part byte-alt.");
});
