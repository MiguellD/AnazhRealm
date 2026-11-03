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
// ── H-S (physik.K4) — DAS SEIL AM LEIB (pure Funktion; Browser-Probe UND Selbst-Test). Der Flegel der Schmiede in der Hand:
// der Leib geht 0,5 s (der Anker folgt der Hand), dann steht er; je Takt ruft der Takt der Seile (`_seilTakt`, der benannte
// Konsum-Leser) das EINE Gesetz des Kerns (`__schmiedeCore.seilSchritt`). Gemessen in der WELT: der Schwung des Kopfs um den
// Anker nach dem Halt, die Länge längs des Seils (Anker → die Ruhe-Enden jedes Teils durch seine Welt-Matrix → Kopf-Mitte) als
// Band, die Energie des Kopfs (mittleres v² der ersten gegen die dritte Sekunde), und nach 12 s Stille ruht das Seil (kein
// Schritt des Gesetzes mehr: die Kosten gehören der Änderung). Steht das Auge ferner als `SEIL_NAH_M`, rechnet das Seil nicht
// (die Kosten gehören dem Schirm): dieselbe Bewegung mit dem Auge in der Ferne macht 0 Schritte.
//   teile   = Glieder + Kopf (das Gesetz nennt sie, die Gestalt trägt sie, `userData.__seil`)
//   schwung ≥ 0,05 m · band ≤ 2 % · v² dritte ≤ ½ erste Sekunde (erste > 0) · ruht · schritte > 0 (der Leser ruft das Gesetz)
//   · fern 0 Schritte (das Auge jenseits SEIL_NAH_M)
const SEIL = { schwungM: 0.05, band: 0.02, energie: 0.5 };
function seilVerdict(h) {
    if (!h || !Number.isFinite(h.schwungM)) return ["probe"];
    const out = [];
    if (!(h.teile > 0 && h.teile === h.soll)) out.push(`teile ${h.teile} von ${h.soll}`);
    if (!(h.schritte > 0)) out.push("kein Schritt des Gesetzes (_seilTakt ruft seilSchritt nicht)");
    if (!(h.schwungM >= SEIL.schwungM)) out.push(`schwung ${h.schwungM.toFixed(3)} m`);
    if (!(h.band <= SEIL.band)) out.push(`länge ±${(100 * h.band).toFixed(1)} %`);
    if (!(h.energie[0] > 0 && h.energie[1] <= SEIL.energie * h.energie[0])) out.push(`v² ${h.energie.map((x) => x.toFixed(3)).join(" → ")}`);
    if (!h.ruht) out.push("ruht nie");
    if (h.fernSchritte !== 0) out.push(`fern ${h.fernSchritte} Schritte (die Kosten folgen der Welt, nicht dem Schirm)`);
    return out;
}
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
        const seil = { teile: 8, soll: 8, schritte: 600, fernSchritte: 0, schwungM: 0.3, band: 0.004, energie: [2.1, 0.2], ruht: true };
        check("Selbst-Test 9 (H-S): gesundes Seil == 0 Verstoesse", seilVerdict(seil).length === 0, seilVerdict(seil).join(" · "));
        for (const [name, bruch] of [
            ["die Gestalt trägt keine Seil-Teile (die Brücke verliert `seil`)", { teile: 0 }],
            ["der Takt ruft das Gesetz nicht (kein Leser)", { schritte: 0 }],
            ["die Kette starr am Stiel", { schwungM: 0.002 }],
            ["das Seil dehnt sich (Relaxation ohne harte Länge)", { band: 0.14 }],
            ["der Schwung bleibt (ohne Dämpfung)", { energie: [2.1, 2.0] }],
            ["das Seil ruht nie (der Leser rechnet die stille Kette)", { ruht: false }],
            ["das ferne Seil rechnet (die Kosten an der Weltgröße)", { fernSchritte: 30 }],
        ])
            check(
                `Selbst-Test 10 (H-S): ‚${name}' → die Seil-Linse feuert`,
                seilVerdict(Object.assign({}, seil, bruch)).length === 1,
                seilVerdict(Object.assign({}, seil, bruch)).join(" · ")
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
        const weapon = Object.values(f.recipes).filter((x) => x && x.kind === "weapon");
        res.b.toolCount = weapon.filter((x) => x.fx && x.fx.tool).length;
        res.b.paramsWeapon = f.paramsByKind && Array.isArray(f.paramsByKind.weapon) ? f.paramsByKind.weapon.length : -1;
        // ===== D (dazu): die Werkzeug-Klasse dockt ueber donorTool (geraet_spitzhacke-Substanz), die Rollen =====
        try {
            const B = st.blueprints || {};
            const KS = A.KIND_SUBSTANCE || {};
            res.d.spitzAbsent = !B.geraet_spitzhacke;
            res.d.substanzSpitz = KS.geraet_spitzhacke && Array.isArray(KS.geraet_spitzhacke.parts) ? KS.geraet_spitzhacke.parts.length : 0;
            res.d.weaponRole = B.klinge_langschwert ? r.computeBlueprintRole(B.klinge_langschwert) : null;
            const tbp = B.klinge_spitzhacke;
            res.d.toolPartsMatch = !!tbp && !!KS.geraet_spitzhacke && JSON.stringify(tbp.parts) === JSON.stringify(KS.geraet_spitzhacke.parts);
            res.d.toolRole = tbp ? r.computeBlueprintRole(tbp) : null;
        } catch (e) {
            res.d.err = fehlerText(e);
        }
        // ===== H: DIE HAND (W-A4b) — die Studio-Gestalt am EINEN Equip-Chokepoint =====
        try {
            const box3 = (obj) => {
                obj.updateMatrixWorld(true);
                const bb = new THREE.Box3().setFromObject(obj);
                const rnd = (v) => Number(v.toFixed(3));
                return {
                    x: [rnd(bb.min.x), rnd(bb.max.x)],
                    y: [rnd(bb.min.y), rnd(bb.max.y)],
                    z: [rnd(bb.min.z), rnd(bb.max.z)],
                };
            };
            // Welt-bereit (Spieler-Mesh baut parallel zum Foundry-Handshake).
            await __weltDa(() => !(!st.playerMesh || !st.player));
            const pm = st.playerMesh;
            res.h.playerReady = !!(pm && st.player);
            if (res.h.playerReady) {
                // (1) INTERIM auf einem JUNGFRAEULICHEN Schluessel (klinge_degen — kein anderer
                // Abschnitt fragte ihn an; langschwert|8|0 kollidiert mit der F-Anfrage):
                // der Equip zeigt SOFORT den Part-Bau, die Ankunft tauscht auf Studio.
                r.equipHeld("klinge_degen");
                const hm0 = pm.userData && pm.userData.heldMesh;
                res.h.interimVisible = !!(
                    hm0 &&
                    hm0.children &&
                    hm0.children.length > 0 &&
                    !(hm0.userData && hm0.userData.foundryHeld)
                );
                for (const weiter = __deckel("der Degen der Schmiede", 300); weiter(); ) {
                    const w = pm.userData && pm.userData.heldMesh;
                    if (w && w.userData && w.userData.foundryHeld) break;
                    await sleep(150);
                }
                const hmD = pm.userData && pm.userData.heldMesh;
                res.h.degenStudio = !!(hmD && hmD.userData && hmD.userData.foundryHeld);
                // (2) WARM: langschwert equipen, auf die Studio-Gestalt warten, Zahlen messen.
                r.equipHeld("klinge_langschwert");
                for (const weiter = __deckel("das Langschwert der Schmiede", 300); weiter(); ) {
                    const w = pm.userData && pm.userData.heldMesh;
                    if (w && w.userData && w.userData.foundryHeld) break;
                    await sleep(150);
                }
                const hm = pm.userData && pm.userData.heldMesh;
                res.h.studio = !!(hm && hm.userData && hm.userData.foundryHeld);
                if (res.h.studio) {
                    res.h.preset = hm.userData.heldPreset;
                    res.h.meshCount = hm.children.length;
                    res.h.allShared = hm.children.every(
                        (c) => c.userData && c.userData.sharedGeom && c.userData.sharedMat
                    );
                    // die WELT-Skala (W5: die Hand teilt die Anker-Skala heraus — lokal 1/0,27, in der Welt 1:1)
                    hm.updateMatrixWorld(true);
                    const hmWs = hm.getWorldScale(new THREE.Vector3()).x;
                    res.h.scale = Number(hmWs.toFixed(4));
                    res.h.scaleOk = hmWs > 0 && hmWs <= AnazhRealm.HELD_MESH.maxScale;
                    res.h.gripX = hm.userData.heldGripX;
                    res.h.axis = hm.userData.heldAxis;
                    res.h.rotZ = Number(hm.rotation.z.toFixed(4));
                    const parts = pm.userData && pm.userData.parts;
                    const armAnchor = parts && (parts.rightArm || parts.rightWing);
                    res.h.anchored = hm.parent === (armAnchor || pm);
                    const src = hm.userData.foundrySrcGroup;
                    res.h.liveRefs = src ? src._liveRefs : -1;
                    if (src) res.h.bboxLang = box3(src); // Template-Raum (Quell-Gruppe, unskaliert)
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
                    hm.traverse((o) => {
                        if (o.userData && o.userData.sharedGeom && o.geometry) sharedGeos.push(o.geometry);
                    });
                    const refsBefore = src ? src._liveRefs : 0;
                    const queued = [];
                    const protoQD = AnazhRealm.prototype._queueDispose;
                    r._queueDispose = function (obj) {
                        queued.push(obj);
                        return protoQD.call(this, obj);
                    };
                    r.equipHeld(null);
                    delete r._queueDispose;
                    res.h.unequipNoMesh = !(pm.userData && pm.userData.heldMesh);
                    res.h.sharedSurvives = !queued.some((q) => sharedGeos.indexOf(q) >= 0);
                    res.h.refReturned = !src || src._liveRefs === Math.max(0, refsBefore - 1);
                    res.h.srcAlive = !!(
                        src &&
                        !src._geomDisposed &&
                        src.children.length > 0 &&
                        src.children[0].geometry &&
                        src.children[0].geometry.attributes &&
                        src.children[0].geometry.attributes.position
                    );
                    // (4) die Cache-Gruppe baut DANACH noch eine Werkstatt-Vorschau (ein Zug, viele Leser).
                    const wsWrap = src ? r._workshopWrapFoundryGroup(src) : null;
                    res.h.workshopAfter = !!(wsWrap && wsWrap.children.length > 0);
                    // (4b) KONSUM statt Quelltext: die Hand-Quelle zieht den Welt-Cache und die EINE Wrapper-Quelle (Spion je Glied).
                    const spion = (k) => ((f, z) => ((r[k] = (...a) => (z.n++, f.apply(r, a))), () => (delete r[k], z.n)))(r[k], { n: 0 });
                    const [zuW, zuC] = [spion("_workshopWrapFoundryGroup"), spion("_foundryCacheGet")];
                    const wK = r._heldFoundryGroup("klinge_langschwert");
                    res.h.konsum = { wrap: zuW(), cache: zuC() };
                    if (wK && wK !== "pending") r._disposeSoulGroup(wK);
                }
                // (5) SPITZHACKE-Probe (Werkzeug-Klasse, s.schaft-Griff) — direkte Quelle + Zahlen.
                let probe = r._heldFoundryGroup("klinge_spitzhacke");
                for (const weiter = __deckel("die Spitzhacke", 300); probe === "pending" && weiter(); ) {
                    await sleep(150);
                    probe = r._heldFoundryGroup("klinge_spitzhacke");
                }
                if (probe && probe !== "pending") {
                    res.h.spitzGrip = probe.userData.heldGripX;
                    res.h.spitzAxis = probe.userData.heldAxis;
                    res.h.bboxSpitz = box3(probe);
                    r._disposeSoulGroup(probe); // Ref-Rueckgabe (die Probe haelt nichts fest)
                }
                // (5b) H-S (physik.K4): DAS SEIL AM LEIB — der Flegel in der Hand, der Leib geht 0,5 s und steht, je Takt der
                // Takt der Seile (`_seilTakt`); der Spion zählt die Schritte des EINEN Gesetzes.
                try {
                    r.equipHeld("klinge_flegel");
                    for (const weiter = __deckel("der Flegel der Schmiede", 300); weiter(); ) {
                        const w = pm.userData && pm.userData.heldMesh;
                        if (w && w.userData && w.userData.foundryHeld) break;
                        await sleep(150);
                    }
                    const hf = pm.userData && pm.userData.heldMesh;
                    const SC = window.__schmiedeCore;
                    const e = r._seile && [...r._seile].find((x) => x.mesh === hf);
                    const sg = e && e.seil;
                    const st = [];
                    if (hf) hf.traverse((m) => m.isMesh && Number.isInteger(m.userData.__seil) && (st[m.userData.__seil] = m));
                    let wurzel = hf;
                    while (wurzel && wurzel.parent) wurzel = wurzel.parent;
                    res.h.seil = {
                        teile: st.filter(Boolean).length,
                        soll: sg ? sg.glieder + 1 : -1,
                        schritte: 0,
                        schwungM: NaN,
                        inSzene: wurzel === r.state.scene,
                        augeM: hf && r.state.camera ? r.state.camera.position.distanceTo(hf.getWorldPosition(new THREE.Vector3())) : null,
                    };
                    if (e && sg && st.length === sg.glieder + 1) {
                        const R = SC.seilRuhe(sg, sg.anker, sg.unten, 1);
                        const P = (i) => new THREE.Vector3(R[3 * i], R[3 * i + 1], R[3 * i + 2]);
                        const echt = SC.seilSchritt;
                        let schritte = 0;
                        SC.seilSchritt = function () {
                            const ok = echt.apply(this, arguments);
                            if (ok) schritte++;
                            return ok;
                        };
                        const lage = () => {
                            pm.updateMatrixWorld(true);
                            const a = new THREE.Vector3().fromArray(sg.anker).applyMatrix4(hf.matrixWorld);
                            let l = 0,
                                vor = a.clone();
                            st.forEach((m, i) => {
                                const p = P(i).applyMatrix4(m.matrixWorld),
                                    q = P(i + 1).applyMatrix4(m.matrixWorld);
                                l += vor.distanceTo(p) + p.distanceTo(q);
                                vor = q;
                            });
                            return { a, kopf: P(sg.glieder + 1).applyMatrix4(st[sg.glieder].matrixWorld).sub(a), l };
                        };
                        const takt = () => r._seilTakt(1 / 60);
                        const cam = r.state.camera;
                        const camVor = cam.position.clone();
                        try {
                            // FERN: das Auge jenseits SEIL_NAH_M — der Leib geht, das Seil rechnet nicht
                            const hand = hf.getWorldPosition(new THREE.Vector3());
                            cam.position.copy(hand).add(new THREE.Vector3(0, 0, AnazhRealm.SEIL_NAH_M + 20));
                            for (let k = 0; k < 30; k++) {
                                pm.position.x += 0.01;
                                takt();
                            }
                            res.h.seil.fernSchritte = schritte;
                            pm.position.x -= 0.3;
                            // NAH: das Auge 3 m vor dem Leib (wo die Kamera des Spiels steht)
                            cam.position.copy(hand).add(new THREE.Vector3(0, 1, 3));
                            takt();
                            for (let k = 0; k < 30; k++) {
                                pm.position.x += 0.05; // der Leib geht 3 m/s
                                takt();
                            }
                            const k0 = lage().kopf;
                            let schwung = 0,
                                lmin = Infinity,
                                lmax = 0,
                                vor = k0;
                            const v2 = [];
                            for (let k = 0; k < 180; k++) {
                                takt();
                                const L = lage();
                                schwung = Math.max(schwung, L.kopf.distanceTo(k0));
                                lmin = Math.min(lmin, L.l);
                                lmax = Math.max(lmax, L.l);
                                v2.push(L.kopf.distanceToSquared(vor) * 3600);
                                vor = L.kopf;
                            }
                            for (let k = 0; k < 720; k++) takt();
                            const vorher = schritte;
                            takt();
                            const mittel = (x) => x.reduce((s, y) => s + y, 0) / Math.max(1, x.length);
                            Object.assign(res.h.seil, {
                                schritte: vorher - res.h.seil.fernSchritte,
                                schwungM: schwung,
                                band: lmax / lmin - 1,
                                laengeM: [lmin, lmax],
                                energie: [mittel(v2.slice(0, 60)), mittel(v2.slice(120))],
                                ruht: !!e.z.ruht && schritte === vorher,
                            });
                        } finally {
                            SC.seilSchritt = echt;
                            pm.position.x -= 1.5;
                            cam.position.copy(camVor);
                        }
                    }
                    r.equipHeld(null);
                } catch (e) {
                    res.h.seilErr = fehlerText(e);
                }
                // (6) FOUNDRY-OFF — lokaler Hook, SICHERN + WIEDERHERSTELLEN (die Gate-Hook-Lehre).
                const prevHook = window.__anazhGateNoFoundry;
                window.__anazhGateNoFoundry = true;
                r.equipHeld("klinge_langschwert");
                const hmOff = pm.userData && pm.userData.heldMesh;
                res.h.offIsPart = !!(
                    hmOff &&
                    hmOff.children &&
                    hmOff.children.length > 0 &&
                    !(hmOff.userData && hmOff.userData.foundryHeld)
                );
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
        out.d.spitzAbsent === true && out.d.substanzSpitz === 2,
        out.d.err || `spitz=${out.d.substanzSpitz}`
    );
    check('D: die reine Waffe traegt role "weapon" (klinge_langschwert)', out.d.weaponRole === "weapon", `role=${out.d.weaponRole}`);
    check(
        'D: das Werkzeug traegt die WERKZEUG-Substanz byte-gleich + role "tool" (klinge_spitzhacke == KIND_SUBSTANCE.geraet_spitzhacke)',
        out.d.toolPartsMatch === true && out.d.toolRole === "tool",
        `role=${out.d.toolRole}`
    );
    check(
        "F: die Distanz-Wahl 2 klemmt fuer kind:weapon auf Stufe 0 (fail-closed [0])",
        /^[^|]*\|[^|]*\|0(\||$)/.test(eps.f.key || ""), // Körper-Schlüssel preset|gestalt|stufe[|ov] (V18.527)
        eps.f.err || String(eps.f.key)
    );
    // ===== H: DIE HAND (W-A4b) — eigene Zaehlung =====
    check("H: Spieler-Mesh bereit (der Hand-Beweis hat einen Traeger)", out.h.playerReady === true, out.h.err);
    check(
        "H: INTERIM — der Equip zeigt SOFORT den Part-Bau (klinge_degen, jungfraeulicher Schluessel; die Hand ist nie leer)",
        out.h.interimVisible === true,
        out.h.err
    );
    check(
        "H: die Asset-Ankunft tauscht GENAU EINMAL auf die Studio-Gestalt (foundryHeld, ohne zweiten Equip)",
        out.h.degenStudio === true
    );
    check(
        "H: warm equipHeld(klinge_langschwert) -> der Held-Mesh traegt Studio-Wrapper (foundryHeld, preset langschwert)",
        out.h.studio === true && out.h.preset === "langschwert",
        String(out.h.preset)
    );
    check(
        "H: JEDES Wrapper-Kind teilt Geometrie+Material (sharedGeom/sharedMat — die EINE Wrapper-Quelle)",
        out.h.allShared === true && out.h.meshCount > 3,
        `meshes=${out.h.meshCount}`
    );
    console.log(`      ↳ Hand-Mesh-Zahl langschwert: ${out.h.meshCount}`);
    check(
        "H: Welt-Skala in der Hand (0 < Welt-Skala <= maxScale) + am Arm-Anker geparentet",
        out.h.scaleOk === true && out.h.anchored === true,
        `scale=${out.h.scale}`
    );
    check(
        'H: Anker-Daten — handAxis "x" (KIND_POLICY-Daten), gripX == fx.held.gripX (langschwert 0.12 == griff 0.24/2)',
        out.h.axis === "x" && Math.abs((out.h.gripX || 0) - 0.12) < 1e-6,
        `gripX=${out.h.gripX}`
    );
    // H-S (physik.K4): das Seil am Leib — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const sv = seilVerdict(out.h.seil);
    console.log("  [H-S] Seil: " + JSON.stringify(out.h.seil) + (out.h.seilErr ? " FEHLER " + out.h.seilErr : ""));
    check(
        "H-S/physik.K4: DAS SEIL AM LEIB — der Flegel trägt sein Seil (Gesetz im Buch, Teile in der Gestalt), der Takt der Seile (`_seilTakt`) ruft das EINE Gesetz, die Kette schwingt nach dem Halt, hält ihre Länge, verliert Energie und ruht",
        sv.length === 0,
        sv.join(" · ") + (out.h.seilErr ? " · " + out.h.seilErr : "")
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
    console.log(
        `      ↳ Skala/Anker langschwert: scale=${out.h.scale} gripX=${out.h.gripX} axis=${out.h.axis} bbox=${JSON.stringify(out.h.bboxLang)}`
    );
    check(
        "H: die Werkzeug-Klasse ankert ueber fx.held.gripX (klinge_spitzhacke gripX > 0, axis x — Vertrags-Daten aus stations(P))",
        out.h.spitzAxis === "x" && Number.isFinite(out.h.spitzGrip) && out.h.spitzGrip > 0,
        `gripX=${out.h.spitzGrip}`
    );
    console.log(`      ↳ Skala/Anker spitzhacke: gripX=${out.h.spitzGrip} bbox=${JSON.stringify(out.h.bboxSpitz)}`);
    check(
        "H: der Unequip zerstoert das GETEILTE Asset NICHT (kein sharedGeom in _queueDispose, Quell-Gruppe lebt, Ref zurueckgegeben)",
        out.h.unequipNoMesh === true &&
            out.h.sharedSurvives === true &&
            out.h.srcAlive === true &&
            out.h.refReturned === true,
        `refs=${out.h.liveRefs}`
    );
    check(
        "H: die Cache-Gruppe baut nach dem Unequip noch eine Werkstatt-Vorschau (ein Zug, viele Leser)",
        out.h.workshopAfter === true
    );
    const kH = out.h.konsum || {};
    check("H: die Hand-Quelle zieht den Welt-Cache und die EINE Wrapper-Quelle (Konsum)", kH.wrap > 0 && kH.cache > 0, JSON.stringify(kH));
    check(
        "H: foundry-off (lokaler Hook, gesichert/wiederhergestellt) -> der Part-Pfad byte-alt",
        out.h.offIsPart === true
    );

    wandEnde(errs, "DER ε-BEWEIS STEHT: die Waffen-/Werkzeug-Domaene dockt NUR ueber die Checkliste §ε an (Manifest-Zeile + KIND_POLICY-Zeile + Donor-DATENBLOCK + fx.place-Daten), der Stamm traegt KEINEN neuen kind-Zweig — schmiede-core reist durch den EINEN Foundry-Worker (Rezepte + kindStages + B4-Regler + Asset), klinge_<id> entsteht am EINEN Chokepoint, hand reist als Daten ohne Streu (N5.5) — UND (W-A4b) die gehaltene Klinge traegt die STUDIO-GESTALT: Part-Interim -> Ankunfts-Tausch, sharedGeom-Wrapper, daten-getriebener Griff-Anker, Unequip laesst das geteilte Asset stehen, foundry-off bleibt Part byte-alt.");
});
