// diag-gegenstand-stoff.cjs — DIE STOFF-LINSE DER GEGENSTÄNDE (W5): was ein Fahrzeug und eine Klinge der WELT
// an Albedo liefern, je Stoff gegen das Band der Natur geurteilt (das FARB-GESETZ: ein Paletten-Hex ist eine sRGB-
// Absicht, die Albedo sein linearer Wert — Kreatur-Bäcker, Vegetation und Gegenstände lesen dieselbe Kurve).
//
// Node-DIREKT (r128-UMD + require, wie gate:vehicle-contract): je Fahrzeug-Rezept × Lack-Gestalt (Same 1..8) und je
// Schmiede-Rezept baut das Gesetzbuch seine Welt-Gestalt (`buildInstance`); je Mesh liest die Linse, was in die Welt
// reist — die Material-Farbe (ein Stoff ohne Vertex-Farben) bzw. das Mittel der Vertex-Farben je Vertex (der
// Wirt liest NUR das color-Attribut: eine Material-Tönung dazu zeigt das Labor, die Welt nie — Lab ≠ Welt).
// Benannte Täter (je einer eine Probe):
//   ohne-stoff   ein Material ohne userData.__stoff (das Gesetzbuch sagt nicht, was es ist)
//   labor-stoff  Ton (Clay) oder eine Lehre-Überlage in der Welt-Gestalt (der Wagen fuhr als Ton-Modell)
//   band         Albedo (bzw. F0 der Metalle) außerhalb des Bands ihres Stoffs (der Reifen lag roh bei 0,08)
//   klarlack     ein Lack ohne Lackschicht (in der Welt wurde er ein Metall: Tiefschwarz spiegelte nichts)
//   lack-art     ein Uni-Lack als Metall (der gefärbte Spiegel, metalness 0,85) oder ein Metallic-Lack ohne Flocken
//   durchsicht   eine Scheibe ohne Durchsicht
//   toenung      Vertex-Farben UND eine nicht-weiße Material-Farbe (das Labor tönt, die Welt nicht)
//   lack-gestalt die Gestalten tragen nicht die acht Lacke des LACK_GESETZ (linear)
//   transport    das Gesetz der Regler (phyto-core) macht aus Klarlack/Durchsicht nicht die Zahlen des Wirts
//   node scripts/diag-gegenstand-stoff.cjs [--selftest]
//
// DIE TAFEL-PROBE (stoffe.K1, `--tafel`, Port GEGENSTAND_STOFF_PORT): die EINE Stoff-Tafel in SI (`state.materials`) und je
// Stoff (holz, stein, eisen, gras, erde, laub, wasser) EINE Mutation je Wirkung mit beobachtbarer Folge in der echten Welt
// (Null-Renderer, am Ufer des Sees der Welt: Wasser, Eis, Wiese und Bauplatz an einem Ort):
//   rho      ρ × ½: die Masse eines Quaders aus dem Stoff (`_teilMasse`) halbiert, seine Eintauchtiefe im See folgt (am Grund,
//            wer dichter bleibt als Wasser); beim Wasser liegt ein Holz-Quader tiefer
//   mu       μ × ½: der Bremsweg eines mit 3 m/s gestoßenen Wolfs (`_kreaturStossSchritt`) auf einer Platte aus dem Stoff (das
//            Gras: die Wiese am Ufer) verdoppelt sich
//   albedo   OFFEN: die Luma braucht das Ausgabe-Bild der echten GPU, headless zählt sie nie
//   E        die Härte E × 2^(5/2), der Klang des Stoffs (klang SCHRITT, klang.K4: die Ferse schlägt im Band (E/1 GPa)^(2/5), ein
//            loses Korn knistert in (E/ρ)^(2/5)/d — beide Bänder × 2; bis w26 die Spalte `klang`, ein Zeiger in die Hand-Tafel des
//            Klang-Kerns): der Spektral-Schwerpunkt des Schritts (die Stimme des Wirts im OfflineAudioContext, das Mittel aus 8
//            Tritten) auf dem Stoff steigt (das Wasser: watend am Ufer)
//   tZuend   T_zünd − 100 K: der Stoff im Brennpunkt einer Linse (`_tickFocusingAffordances`) fängt früher Feuer
//   tSchmelz T_schmelz − 100 K: der See gefriert im Winter nicht (`_eisAt`)
//   c        c × ½: der Stoff im Brennpunkt ist nach 2 s wärmer; das Wasser folgt der Luft schneller, der See trägt im Herbst
//            über einen Tag früher (der Tag, ab dem `_eisAt` über den Linien `_eisLinien` trägt, auf die Stunde)
// DIE SABOTAGE (Selbsttest im selben Lauf): der EINE Leser der Tafel (`_stoff`) liefert die Zeilen von vor der Mutation — ein
// Leser, der ruft und verwirft —, und jede Wirkung jedes Stoffs ist ROT; eine, die grün bleibt, liest an der Tafel vorbei.
// Staffel 1 = je Stoff ≥ 3 von 7 Wirkungen, Staffel 2 = 7/7; die Zeile `TAFEL {…}` trägt die Messung.
// DER SCHRITT JE STOFF (klang.K4, w26-klang-schritt; aus denselben Tritten der Wirkung E, unmutiert): am Ausgang der Stimme
// hörbar ab |x| > 3·10⁻⁴ (die Schwelle der Station: rms 10⁻⁴ je Fenster) — jeder Schritt klingt mindestens so lang wie die
// Lastübernahme seines Gesetzes (`schrittBand` ladeSek; bis w26 klang Stein 60 ms, an der Station 0–38 ms, und fiel auf der GTX
// zwischen ihre Abfragen); die Zeile `SCHRITT {…}` trägt je Stoff den Überhang in ms und die zu kurzen beim Namen. Der Täter im Lauf
// der Sabotage (vorher ROT am Täter): jeder Stoff klickt wie die Hand-Tafel bis w26 (ein Band für alle, kürzer als die
// Lastübernahme) — die Wand nennt jeden Stoff „kurz". Die Schwerpunkte je Stoff (`vor` der Wirkung E) und ihr Abstand ≥ 300 Hz
// richtet die Station klang.K4 am Abgriff im Spiel.
// DIE GESETZ-PROBE (w28-stoff-gesetz, `--gesetz`, derselbe Port): der KONSUM-LESER der Staffel Breite „Licht, Bruch und Klang
// lesen DIESELBE Stoff-Zeile". Je eingebautem Stoff verstellt sie EINE Spalte seiner Zeile (`state.materials`: × ½, die
// Brechkraft n − 1 × ½) und misst jeden Leser am Chokepoint des Wirts (Null-Renderer):
//   licht  glanz       Rauheit und Metall eines gebauten Stoffs (`_buildPbrNodeMaterial`, live über `_stoffOptikWirkt`)
//          brennweite  der Abstand des Brennpunkts einer Linse aus dem Stoff (`_brennpunkte`; die durchsichtigen Stoffe)
//          spiegel     der Fresnel F0 je Kanal, den der Blick des Wassers liest (wasser, eis; `_wasserOptikLeser`)
//   bruch  bruchlast   die größte Platte aus dem Stoff, die eine Säule aus ihm trägt (`_failsUnderLoad`, schlank 1:20 und
//                      gedrungen 1:1,5; feste Stoffe — eine Flüssigkeit trägt nichts, lebendes Gewebe hält sich selbst)
//   klang  ton         der Spektral-Schwerpunkt des Treffers Stoff auf Stoff nach dem Kontakt (`_trefferPaar`, die Stimme
//                      des Wirts im OfflineAudioContext)
//          schritt     Band und Dauer der Ferse (`_schrittKlangParams` → klang `schrittBand`)
// Ein Leser STEHT AUF DER ZEILE, wenn sein Messwert einer ihrer Spalten folgt; ein geltender Leser, der keiner folgt, trägt
// eine eigene Zahl — der Täter beim Namen (`stoff.leser`). `eine` nennt je Stoff die Bereiche, die allein der DICHTE folgen
// (ρ → Gewicht, Schallgeschwindigkeit √(E/ρ) und Brechzahl nach Gladstone-Dale). DIE MUTANTE im selben Lauf: der EINE Leser
// `_stoff` liefert die Zeilen von vor der Mutation, die Wirk-Rufe der Optik schweigen — jeder Leser ist ROT; einer, der
// grün bleibt, liest an der Zeile vorbei. GRÜN: kein Täter, keiner vorbei, jeder feste Stoff trägt alle drei Bereiche.
// Die Zeile `GESETZ {…}` trägt die Messung; der Selbsttest (`--selftest`) verdirbt das Urteil an einem Leser mit eigener Zahl.
"use strict";
const { urteilEnde, studioKern, SELBSTTEST } = require("./lib/welt-boot.cjs");

const VC = studioKern("vehicle-core.js", "__vehicleCore");
const SC = studioKern("schmiede-core.js", "__schmiedeCore");
const PC = studioKern("phyto-core.js", "__phytoCore");

// DAS BAND DER NATUR je Stoff (lineare Albedo-Luminanz; bei Metallen F0) — die AAA-Referenz (PBR-Tafeln: Ruß/Gummi
// 0,02–0,04 · schwarzer Kunststoff 0,02–0,05 · Leder 0,03–0,2 · Holz 0,05–0,45 · Eisen F0 0,56 · Aluminium 0,91 · Messing
// F0 ~0,8; beschichtete/geschwärzte Metalle tiefer). Darunter liegt nur noch Ruß; ein Stoff dort ist ein Palettenfehler.
const BAND = {
    gummi: [0.015, 0.05],
    kunststoff: [0.015, 0.08],
    polster: [0.02, 0.35],
    lack: [0.0123, 0.9], // Dielektrikum ab sRGB 30 (Frostbite 2014)
    blank: [0.3, 0.95], // blankes Metall: Felge, Klinge, Roh-Stahl
    buntmetall: [0.25, 0.95], // Messing, Bronze
    metall: [0.1, 0.95], // beschichtet, geschwärzt, geschmiedet
    glas: [0, 0.06],
    leder: [0.02, 0.2],
    holz: [0.05, 0.45],
    schnur: [0.02, 0.4],
};
const LABOR = new Set(["ton", "lehre"]);
// Luma und sRGB → linear: die EINE Quelle der Linsen (abnahme-urteil)
const { luma709: lum, srgbLin } = require("./lib/abnahme-urteil.cjs");
const lin = (v) => srgbLin(v * 255);
const linHex = (h) => [lin(((h >> 16) & 255) / 255), lin(((h >> 8) & 255) / 255), lin((h & 255) / 255)];

// Was ein Mesh der Welt an Albedo liefert: Vertex-Farben (Mittel) oder die Material-Farbe.
function weltAlbedo(o) {
    const ca = o.geometry && o.geometry.attributes && o.geometry.attributes.color;
    if (ca && o.material.vertexColors) {
        const s = [0, 0, 0];
        for (let i = 0; i < ca.count; i++) {
            s[0] += ca.getX(i);
            s[1] += ca.getY(i);
            s[2] += ca.getZ(i);
        }
        return { c: s.map((v) => v / Math.max(1, ca.count)), vc: true };
    }
    return { c: o.material.color.toArray(), vc: false };
}

// Das Urteil über EINE Welt-Gestalt: Liste der Täter (je Stoff höchstens einer je Art).
function urteil(name, group) {
    const out = [];
    const gesehen = new Set();
    group.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const m = o.material;
        const st = m.userData && m.userData.__stoff;
        const w = weltAlbedo(o);
        const key = (st || "?") + "|" + m.uuid;
        if (gesehen.has(key)) return;
        gesehen.add(key);
        if (!st) return out.push(`${name}: ohne-stoff (${m.type} ${m.color ? m.color.getHexString() : ""})`);
        if (LABOR.has(st)) return out.push(`${name}: labor-stoff ${st} in der Welt-Gestalt`);
        if (st === "licht") {
            const em = m.emissive ? m.emissive.toArray() : [0, 0, 0];
            if (!(lum(em) * (m.emissiveIntensity || 0) >= 0.05)) out.push(`${name}: band licht glüht nicht`);
            return;
        }
        const b = BAND[st];
        if (!b) return out.push(`${name}: ohne-stoff (unbekannter Stoff ${st})`);
        const L = lum(w.c);
        if (!(L >= b[0] && L <= b[1]))
            out.push(`${name}: band ${st} ${L.toFixed(4)} ∉ [${b[0]}, ${b[1]}]${w.vc ? " (Vertex-Farben)" : ""}`);
        if (st === "lack" && m.userData.__lack && !(m.clearcoat > 0)) out.push(`${name}: klarlack fehlt`);
        // Die Lack-Art: ein Uni-Lack ist pigmentiert (Dielektrikum), ein Metallic-Lack spiegelt seine Farbe über Flocken.
        if (st === "lack" && m.userData.__lack) {
            const z = VC.LACK_GESETZ.find((r) => r[0] === m.userData.__lack);
            const metal = z && z[3] === "metallic";
            if (!z || (metal ? !(m.metalness >= 0.5) : !(m.metalness <= 0.05)))
                out.push(`${name}: lack-art ${m.userData.__lack} metalness ${m.metalness} (${z ? z[3] : "ohne Zeile"})`);
        }
        if (st === "glas" && !(m.transparent && m.opacity < 1)) out.push(`${name}: durchsicht fehlt`);
        if (w.vc && (m.color.r < 0.999 || m.color.g < 0.999 || m.color.b < 0.999))
            out.push(`${name}: toenung ${st} (Material-Farbe ${m.color.getHexString()} auf Vertex-Farben)`);
    });
    return out;
}

// Der Lack der Gestalten: Same 1..8 trägt die acht Lacke des Gesetzes (linear), der Körper (größte Lack-Fläche) zählt.
function lackGestalten() {
    const out = [];
    const soll = VC.LACK_GESETZ.slice(1).map((z) => linHex(z[1]));
    const ist = [];
    for (let s = 1; s <= soll.length; s++) {
        const g = VC.buildInstance("gt", s, 0);
        let best = null;
        g.traverse((o) => {
            // der Karosserie-Lack (lackStoff stempelt __lack; der Bremssattel ist Lack, aber nicht die Karosserie)
            if (!best && o.isMesh && o.material?.userData?.__lack)
                best = o.material.color.toArray();
        });
        ist.push(best);
        if (!best) out.push(`lack-gestalt: Same ${s} trägt keinen Karosserie-Lack`);
    }
    const treffer = soll.filter((c) => ist.some((x) => x && x.every((v, i) => Math.abs(v - c[i]) < 1e-6))).length;
    if (treffer !== soll.length) out.push(`lack-gestalt: ${treffer}/${soll.length} Lacke des LACK_GESETZ in den Gestalten`);
    return out;
}

// Der Transport am Gesetz der Regler: Klarlack und Durchsicht eines
// Stoffs werden die Material-Zahlen, aus denen der Wirt baut (phyto-core `budgetRegler`)
const LACK_GLAS = { clearcoat: 1, clearcoatRoughness: 0.1, opacity: 0.4 };
function transport(R) {
    if (R && R.cc === 1 && R.ccr === 0.1 && R.op === 0.4) return [];
    return [`transport: budgetRegler liest Klarlack/Durchsicht nicht (cc ${R && R.cc} · op ${R && R.op})`];
}

function alles() {
    const out = [];
    // je Same dazu eine Stufe der Zeit-Achse (EPOCHE_GESETZ, reihum alle sechs): Holz, Leder, Bronze, Messing, Eisen-Band,
    // Laterne und Licht-Kante liegen im Band ihrer Natur wie die Stoffe von heute
    for (const id of Object.keys(VC.PRESETS))
        for (let s = 1; s <= 8; s++)
            for (const ov of [null, { epoche: s % 6 }])
                out.push(...urteil(`fahrzeug ${id} Same ${s} ${JSON.stringify(ov)}`, VC.buildInstance(id, s, 0, ov)));
    for (const id of Object.keys(SC.PRESETS)) out.push(...urteil(`klinge ${id}`, SC.buildInstance(id, 1, 0)));
    out.push(...lackGestalten());
    out.push(...transport(PC.budgetRegler("unknown", LACK_GLAS)));
    return [...new Set(out)];
}

function selbstTest() {
    const fehl = [];
    const mk = (st, hex, extra) => {
        const m = new THREE.MeshStandardMaterial(Object.assign({ color: hex }, extra || {}));
        m.userData.__stoff = st;
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m));
        return g;
    };
    const roh = (h) => {
        const g = mk("gummi", h);
        g.children[0].material.color.setRGB(...linHex(h));
        return g;
    };
    if (urteil("t", roh(0x2a2c2f)).length) fehl.push("gesunder Reifen meldet");
    // je Täter-Gestalt: das Urteil nennt seinen Täter, sonst bleibt er still
    const still = (g, taeter, name) => urteil("t", g).some((s) => s.includes(taeter)) || fehl.push(name + " still");
    // der Reifen roh (r128 las 0x131519 als 0,08 linear)
    still(mk("gummi", 0x131519), "band gummi", "roher Reifen bleibt");
    still(mk("ton", 0x8d9499), "labor-stoff", "Ton-Karosserie bleibt");
    const lack = (name, metalness, cc) => {
        const g = mk("lack", 0x111319, { metalness });
        g.children[0].material.userData.__lack = name;
        g.children[0].material.clearcoat = cc;
        return g;
    };
    still(lack("Tiefschwarz", 0, 0), "klarlack", "Lack ohne Klarlack bleibt");
    // der Uni-Lack als gefärbter Spiegel (bis W5: jeder Lack metalness 0,85)
    still(lack("Signalrot", 0.85, 1), "lack-art", "Uni-Lack als Metall bleibt");
    still(mk("glas", 0x0a0f18), "durchsicht", "blinde Scheibe bleibt");
    const vc = mk("holz", 0x6b4a2a, { vertexColors: true });
    const geo = vc.children[0].geometry;
    geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(0.2), 3));
    still(vc, "toenung", "getönte Vertex-Farben bleiben");
    const namenlos = mk("gummi", 0x2a2c2f);
    delete namenlos.children[0].material.userData.__stoff;
    still(namenlos, "ohne-stoff", "Stoff ohne Namen bleibt");
    if (!transport(PC.budgetRegler("unknown", {})).length) fehl.push("Transport ohne Klarlack bleibt still");
    // die Gesetz-Probe: ein Leser mit eigener Zahl (folgt keiner Spalte) und einer, der unter der Mutante folgt, fallen beim Namen
    const L = (bruch) => ({ eisen: { glanz: { bereich: "licht", folgt: ["rauheit"] }, bruchlast: { bereich: "bruch", folgt: bruch }, ton: { bereich: "klang", folgt: ["E", "rho"] } } });
    const tot = { eisen: Object.fromEntries(Object.keys(L([]).eisen).map((k) => [k, { bereich: "x", folgt: [] }])) };
    if (!gesetzUrteil(L(["E"]), tot, ["eisen"]).gruen) fehl.push("die gesunde Gesetz-Zeile meldet");
    if (gesetzUrteil(L([]), tot, ["eisen"]).taeter.join() !== "eisen.bruchlast") fehl.push("der Bruch-Leser mit eigener Zahl bleibt still");
    if (gesetzUrteil(L(["E"]), L(["E"]), ["eisen"]).vorbei.length !== 3) fehl.push("ein Leser an der Zeile vorbei bleibt still");
    return fehl;
}

const STOFFE = ["holz", "stein", "eisen", "gras", "erde", "laub", "wasser"];
const WIRKUNGEN = ["rho", "mu", "albedo", "E", "tZuend", "tSchmelz", "c"];
async function tafelProbe(STOFFE, WIRKUNGEN, sabotage) {
    const M = st.materials;
    const pm = st.playerMesh;
    const { see } = await window.__wasserOrte({});
    const [UX, UZ] = see.ufer;
    const [SX, SZ] = see.mitte;
    const hh = (x, z) => r._voxelSurfaceY(x, z);
    const setz = (x, z, y = hh(x, z)) => pm.position.set(x, y + r.constructor.PLAYER_FOOT_OFFSET, z);
    // DER LEIB STEHT, WO DIE WELT IHN LÄSST: die Bühne hält ihn am Ufer, aber nie in einem Festen — schiebt ihn die Hülle eines
    // Werks hinaus (die Kapsel), hält sie ihn dort. Bis w28-strauch-gestalt setzte jeder Takt ihn zurück an `see.ufer`: der
    // Hasel-Horst 0,59 m westlich (Hülle 1,68 × 1,52 m, vorher 0,35 m) schob ihn je Sim-Schritt 0,354 m hinaus, das Auge
    // pendelte, das Band des Strauchs im Rand D1 + M sprang je Takt (L1 ↔ keins) und die Welt stand nie (2 224 Takte).
    const halt = [UX, UZ];
    await window.__weltStehtNach(() => {
        setz(halt[0], halt[1]);
        st._fixedSimPos = null;
        r._gameLoopTick(performance.now());
        [halt[0], halt[1]] = [pm.position.x, pm.position.z];
    });
    window.__buehne();
    st.autoSeason = false;
    // ein Werk `n` aus Quadern [Stoff, Breite, Höhe, Tiefe, Versatz x, Mitte y] bei (x, z, y); mit `fn` gemessen, dann abgerissen
    const werk = async (n, teile, x, z, y, fn) => {
        st.blueprints[n] = { parts: teile.map(([m, sx, sy, sz, px, py]) => ({ shape: "box", material: m, size: { x: sx, y: sy, z: sz }, position: { x: px, y: py, z: 0 } })) };
        const e = r.spawnArchitecture(n, { x, y, z }, { silent: true, precise: true });
        if (!fn) return e;
        try {
            return await fn(e);
        } finally {
            if (st.architectures.includes(e)) r.removeArchitecture(e);
        }
    };
    const linse = await werk("_linse", [["eisen", 0.2, 2.2, 0.2, 0.7, 1.1], ["quarz", 0.8, 0.8, 0.8, 0, 2.6]], UX + 30, UZ, hh(UX + 30, UZ));
    const grund = hh(SX, SZ);
    const spiegel = r._koerperWasser(SX, SZ, grund);
    const tiefe = spiegel - grund; // die Säule des Sees: der Körper, dessen Trägheit c trägt
    let watX = UX; // das Ufer, an dem der Spieler watet
    while (watX > UX - 30 && !(r._koerperWasser(watX, UZ, hh(watX, UZ)) > hh(watX, UZ) + 0.15)) watX -= 0.25;
    // der Boden aus X: Gras und Laub der Natur (4 m trocken längs −z, die EINE Orts-Suche nach dem Stoff unter dem Fuß), sonst
    // eine Platte 8 × 0,4 × 3 m an der Oberkante ihrer Hülle; `fn(x, z, y, längs x)`
    const boden = (X, fn, o = ["gras", "laub"].includes(X) && window.__weltOrt("stoff", { stoff: X, mitte: [UX, UZ], rMax: 126, schritt: 3 })) =>
        o ? fn(o.x, o.z, hh(o.x, o.z), 0) : werk("_platte", [[X, 8, 0.4, 3, 0, 0.2]], UX + 14, UZ, hh(UX + 14, UZ) + 0.5, (e) => fn(UX + 11, UZ, e.blockerAABBs[0].topY, 1));
    // der Stoff im Brennpunkt der Linse: [Erwärmung nach `dauer` s, Zündzeit oder null]
    const brenn = (X, dauer) => {
        const p = r._brennpunkte(linse, r._sonnenRichtung())[0];
        return werk("_ziel", [[X, 0.6, 0.6, 0.6, 0, 0]], p.x, p.z, p.y, (e) => {
            let t = 0;
            for (; t < dauer && st.architectures.includes(e); t += 0.25) r._tickFocusingAffordances(0.25);
            if (st.brandFeld) st.brandFeld.clear();
            return [e.heatBuildup, st.architectures.includes(e) ? null : t];
        });
    };
    const um = (k, v, fn) => {
        const alt = st[k];
        st[k] = v;
        try {
            return fn();
        } finally {
            st[k] = alt;
        }
    };
    // der Tag, ab dem der See trägt (Sommer 0,375 … Winter 0,875, halbiert auf die Stunde)
    const traegt = (lo = 0.375, hi = 0.875) => {
        for (let m; hi - lo > 1 / 8760; ) um("seasonPhase", (m = (lo + hi) / 2), () => r._eisAt(SX, SZ, NaN)) === null ? (lo = m) : (hi = m);
        return hi * 365;
    };
    // DER SCHRITT AM ABGRIFF (klang.K4): hörbar ab |x| > 3·10⁻⁴ (die Schwelle der Station, rms 10⁻⁴ eines Rauschens) — je Stoff
    // der knappste von 8 Tritten des ersten (unmutierten) Laufs, sein Überhang über die Lastübernahme seines Gesetzes in ms
    // (`schrittBand` ladeSek); den Schwerpunkt misst die Wirkung selbst (`vor`)
    const schritt = {};
    const hoer = (x) => x * x > 9e-8;
    // DER TÄTER (klang.K4, im Lauf der Sabotage): jeder Stoff klickt wie die Hand-Tafel bis w26 — ein Band (Stein) für alle, kürzer
    // als die Lastübernahme, über die EINE Leihe (`leihe`)
    const zurueck = leihe(r, sabotage ? { _schrittKlangParams: (m, ...a) => ({ ...Object.getPrototypeOf(r)._schrittKlangParams.call(r, "stein", ...a), ladeSek: 0.005 }) } : {});
    // je Wirkung [Mutation, Messung, Urteil (vorher, nachher), die Spalte der Mutation (sonst der Name der Wirkung)]
    const W = {
        rho: [
            (z) => (z.rho *= 0.5),
            (X) => werk("_tafel", [[X === "wasser" ? "holz" : X, 3, 0.6, 1.4, 0, 0.3]], SX, SZ, grund, (e) => [r._teilMasse(st.blueprints._tafel.parts[0]), spiegel - r._fahrBoden(e)(SX, SZ)]),
            (X, v, n) => (X === "wasser" ? n[1] - v[1] > 0.05 : Math.abs(n[0] / v[0] - 0.5) < 0.005 && (v[1] - n[1] > 0.02 || n[1] > tiefe - 0.05)),
        ],
        mu: [
            (z) => (z.mu *= 0.5),
            (X) =>
                boden(X, (x, z, y, ux) => {
                    st.maxCreatures = st.creatures.length + 1;
                    const w = r.spawnCreatureAt(x, y, z, "calm", "wolf", { precise: true, bodySize: 1 });
                    w.position.y = y;
                    w.userData._stossV = { x: 3 * ux, z: 3 * ux - 3 };
                    for (let i = 0; i < 3000 && w.userData._stossV; i++) r._kreaturStossSchritt(r.constructor.FIXED_DT);
                    r.removeCreature(w);
                    return Math.hypot(w.position.x - x, w.position.z - z);
                }),
            (X, v, n) => v > 0.1 && Math.abs(n / v - 2) < 0.3,
        ],
        E: [
            (z) => (z.E *= 2 ** 2.5),
            // je Tritt EIN Schritt (`_playSchrittOneShot`, Math.random wählt Versatz und Körner): sein Schwerpunkt streut, gemessen
            // wird das Mittel aus 8 Tritten, je einer im eigenen Kontext; der erste Lauf (unmutiert) misst dazu den Schritt wie die
            // Station (`schritt`: Schwerpunkt, hörbare Spanne, längste Lücke)
            async (X) => {
                const sym = st.symphony;
                const alt = { ...sym };
                const tritt = (x, z, y) => (setz(x, z, y), r._schrittKlangTick({ walkPhase: 0 }, 0, false, pm), r._schrittKlangEreignis(pm, false, 0));
                let summe = 0;
                const je = [];
                for (let i = 0; i < 8; i++) {
                    const ctx = new OfflineAudioContext(1, 24000, 48000);
                    Object.assign(sym, { enabled: true, ctx, masterGain: ctx.destination });
                    await (X === "wasser" ? tritt(watX, UZ) : boden(X, tritt));
                    Object.assign(sym, alt);
                    const d = (await ctx.startRendering()).getChannelData(0);
                    summe += window.__klangCore.schwerpunkt(d, 48000) / 8;
                    je.push((d.findLastIndex(hoer) - d.findIndex(hoer)) / 48);
                }
                schritt[X] ??= Math.min(...je) - window.__klangCore.schrittBand(r._stoff(X)).ladeSek * 1000;
                return summe;
            },
            (X, v, n) => n / v > 1.4,
        ],
        tZuend: [(z) => (z.tZuend -= 100), async (X) => (await brenn(X, 120))[1], (X, v, n) => n > 0 && n < 0.85 * v],
        tSchmelz: [
            (z) => (z.tSchmelz -= 100),
            (X) => {
                if (X !== "wasser") throw new Error("offen: kein Leser der Phase von " + X);
                return um("seasonPhase", 0.875, () => +(r._eisAt(SX, SZ, NaN) !== null));
            },
            (X, v, n) => v === 1 && n === 0,
        ],
        c: [
            (z) => (z.c *= 0.5),
            async (X) => (X === "wasser" ? traegt() : (await brenn(X, 2))[0]),
            (X, v, n) => (X === "wasser" ? v - n > 1 : v > 0 && n / v > 1.5),
        ],
    };
    const aus = { schritt };
    const leser = r._stoff;
    for (const X of STOFFE)
        for (const w of WIRKUNGEN) {
            const z = M[X];
            const f = W[w];
            const alt = z && z[w];
            aus[X] = aus[X] || {};
            try {
                if (!f) throw new Error("offen: die Luma braucht das Ausgabe-Bild (echte GPU)");
                if (alt === null) throw new Error("offen: die Zeile " + X + " trägt kein " + w + " (keine Wirkung zu mutieren)");
                const vor = await f[1](X);
                if (sabotage) {
                    const snap = Object.fromEntries(Object.keys(M).map((n) => [n, { ...M[n] }]));
                    r._stoff = (n) => snap[n];
                }
                f[0](z);
                const nach = await f[1](X);
                aus[X][w] = { vor, nach, ok: !!f[2](X, vor, nach) };
            } catch (e) {
                aus[X][w] = { ok: false, fehler: fehlerText(e).slice(0, 140) };
            } finally {
                if (z) z[w] = alt;
                r._stoff = leser;
            }
        }
    zurueck();
    r.removeArchitecture(linse);
    return aus;
}
// DAS URTEIL DES SCHRITTS (klang.K4): die Stoffe, deren Schritt kürzer klingt als ihre Lastübernahme (Überhang < 0 ms)
// DIE GESETZ-PROBE (Seite): → { stoff: { leser: { bereich, folgt: [Spalten] } } }; ein Leser, der dem Stoff nicht gilt, fehlt
async function gesetzProbe(sabotage) {
    const M = st.materials;
    const A = r.constructor;
    const K = window.__klangCore;
    window.__buehne();
    const licht = r._sonnenRichtung();
    const WG = A.Gesetz("terrain:WASSER_GESETZ", null);
    const fest = (X) => !["wasser", "essenz", "fleisch", "leib"].includes(X);
    const stoffe = {};
    // die Breite w der größten Platte (w × 0,3 × w m) aus X, die eine Säule 0,3 × h × 0,3 m aus X trägt (24-mal halbiert)
    const last = (X, h) => {
        const traegt = (w) => !r._failsUnderLoad({ parts: [["box", 0.3, h, 0.3, h / 2], ["box", w, 0.3, w, h + 0.15]].map(([shape, x, y, z, py]) => ({ shape, material: X, size: { x, y, z }, position: { x: 0, y: py, z: 0 } })) }).buckles;
        if (!traegt(0.31)) return 0;
        let [lo, hi] = [0.31, 4096];
        if (traegt(hi)) return Infinity;
        for (let i = 0; i < 24; i++) traegt((lo + hi) / 2) ? (lo = (lo + hi) / 2) : (hi = (lo + hi) / 2);
        return lo;
    };
    const ton = async (X) => {
        const sym = st.symphony;
        const alt = { ...sym };
        const ctx = new OfflineAudioContext(1, 24000, 48000);
        Object.assign(sym, { enabled: true, ctx, masterGain: ctx.destination });
        try {
            r._trefferPaar(X, X, null, 0);
        } finally {
            Object.assign(sym, alt);
        }
        const d = (await ctx.startRendering()).getChannelData(0).subarray(2880); // ab 60 ms: der Kontakt (50 ms) ist vorbei
        return d.some((x) => x * x > 1e-6) ? K.schwerpunkt(d, 48000) : null; // klingt nach: |x| > 10⁻³ (der Rest des Kontakts liegt bei 3·10⁻⁴)
    };
    const LESER = {
        glanz: ["licht", () => true, (X) => [stoffe[X].roughness, stoffe[X].metalness], ["rauheit"]],
        brennweite: [
            "licht",
            (X) => (M[X].tags.transparent || 0) >= A.AFFORDANCE_THRESHOLDS.focusing.transparentMin,
            (X) => {
                st.blueprints._gesetzLinse = { parts: [{ shape: "box", material: X, size: { x: 0.8, y: 0.8, z: 0.8 }, position: { x: 0, y: 0, z: 0 } }] };
                const p = r._brennpunkte({ type: "_gesetzLinse", position: { x: 0, y: 0, z: 0 } }, licht)[0];
                return p ? Math.hypot(p.x, p.y, p.z) : null;
            },
            ["n", "rho"],
        ],
        // an main liest der Blick des Wassers die eine Zahl des Terrain-Gesetzes (kein Leser der Zeile)
        spiegel: ["licht", (X) => X === "wasser" || X === "eis", (X) => (r._wasserOptikLeser ? r._wasserOptikLeser(THREE.TSL)[X === "eis" ? "f0Eis" : "f0"].value.toArray() : Array(3).fill(WG.fresnel[0])), ["n", "abbe", "rho"]],
        bruchlast: ["bruch", fest, (X) => [last(X, 6), last(X, 0.45)], ["E", "sigY", "rho"]],
        ton: ["klang", () => true, ton, ["E", "rho", "eta"]],
        schritt: [
            "klang",
            () => true,
            (X) => {
                const p = r._schrittKlangParams(X, false, 0);
                const b = p && K.schrittBand(p.boden, p);
                return b && [b.ferseHz, b.ferseSek, b.kornHz];
            },
            ["E", "rho", "eta"],
        ],
    };
    const anders = (v, n) => JSON.stringify(v) !== JSON.stringify(n) && [v, n].flat().some((x, i, a) => i < a.length / 2 && !(Math.abs((a[i + a.length / 2] || 0) / (x || 1e-300) - 1) < 0.01));
    const out = {};
    const namen = Object.keys(M).filter((X) => M[X].builtIn);
    for (const X of namen) stoffe[X] = r._buildPbrNodeMaterial({ stoff: X });
    const kopie = Object.fromEntries(Object.entries(M).map(([k, z]) => [k, Object.freeze({ ...z })]));
    const zurueck = leihe(r, sabotage ? { _stoff: (n) => kopie[n] || null, _stoffOptikWirkt: () => 0, _wasserOptikWirkt: () => {} } : {});
    try {
        for (const X of namen) {
            out[X] = {};
            for (const [name, [bereich, gilt, messen, spalten]] of Object.entries(LESER)) {
                if (!gilt(X)) continue;
                const vor = await messen(X);
                if (vor == null) continue; // der Leser misst an diesem Stoff nichts (ein Gewebe schwingt unhörbar)
                const folgt = [];
                for (const k of spalten) {
                    const alt = M[X][k];
                    if (!Number.isFinite(alt)) continue; // die Zeile trägt die Spalte nicht: nichts zu verstellen
                    M[X][k] = k === "n" ? 1 + (alt - 1) / 2 : alt / 2;
                    try {
                        if (anders(vor, await messen(X))) folgt.push(k);
                    } finally {
                        M[X][k] = alt;
                    }
                }
                out[X][name] = { bereich, folgt };
            }
        }
    } finally {
        zurueck();
        for (const X of namen) stoffe[X].dispose();
        delete st.blueprints._gesetzLinse;
    }
    return out;
}
// DAS URTEIL (rein): Täter = geltende Leser, die keiner Spalte folgen; vorbei = Leser, die unter der Mutante folgen; dreifach =
// Stoffe, deren Licht, Bruch UND Klang auf der Zeile stehen; eine = je Stoff die Bereiche, die allein der Dichte folgen
function gesetzUrteil(echt, sab, fest) {
    const paare = (T, ja) => Object.entries(T).flatMap(([X, L]) => Object.entries(L).filter(([, l]) => !!l.folgt.length === ja).map(([n]) => X + "." + n));
    const bereiche = (L, k) => [...new Set(Object.values(L).filter((l) => (k ? l.folgt.includes(k) : l.folgt.length)).map((l) => l.bereich))].sort();
    const je = Object.fromEntries(Object.entries(echt).map(([X, L]) => [X, bereiche(L).join("+")]));
    const dreifach = Object.keys(je).filter((X) => je[X] === "bruch+klang+licht");
    const [taeter, vorbei] = [paare(echt, false), paare(sab, true)];
    const leser = paare(echt, true).length + "/" + (paare(echt, true).length + taeter.length);
    const eine = Object.fromEntries(Object.entries(echt).map(([X, L]) => [X, bereiche(L, "rho").join("+")]));
    return { je, eine, dreifach: dreifach.length, leser, taeter, vorbei, gruen: !taeter.length && !vorbei.length && fest.every((X) => dreifach.includes(X)) };
}
const kurz = (T) => STOFFE.filter((X) => !(T.schritt[X] >= 0));
async function tafel() {
    const { statikServer, starteBrowser, nullRenderer, warteAufWelt, buehne } = require("./lib/welt-boot.cjs");
    const port = Number(process.env.GEGENSTAND_STOFF_PORT || 4677);
    const server = await statikServer().lausche(port);
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    try {
        const page = await browser.newPage();
        await nullRenderer(page);
        await server.zeige(page, 180000);
        await warteAufWelt(page, 180000);
        await page.evaluate(require("./lib/wasser-linse.cjs").WASSER_INSTALL);
        await buehne(page);
        const echt = await page.evaluate(tafelProbe, STOFFE, WIRKUNGEN, false);
        const sab = await page.evaluate(tafelProbe, STOFFE, WIRKUNGEN, true);
        const je = {};
        for (const X of STOFFE) console.log(X, (je[X] = WIRKUNGEN.filter((w) => echt[X][w].ok)).length + "/7", JSON.stringify(echt[X]));
        // an der Tafel vorbei: grün trotz Sabotage; stumm: die Sabotage maß nicht (ein Absturz ist kein Rot)
        const vorbei = STOFFE.flatMap((X) => WIRKUNGEN.filter((w) => sab[X][w].ok || (je[X].includes(w) && sab[X][w].fehler)).map((w) => X + "." + w));
        console.log("TAFEL " + JSON.stringify({ je, vorbei }));
        const gruen = !vorbei.length && STOFFE.every((X) => je[X].length >= 3);
        console.log(gruen ? "✅ TAFEL GRÜN — Staffel " + (STOFFE.every((X) => je[X].length === 7) ? 2 : 1) : "❌ TAFEL ROT — an der Tafel vorbei oder stumm: " + vorbei);
        // DER SCHRITT JE STOFF (klang.K4): die Wand am echten Gesetz und am Täter (ein Klick für jeden Stoff) im selben Lauf
        const [S, K] = [kurz(echt), kurz(sab)];
        const ok = !S.length && K.length;
        console.log("SCHRITT " + JSON.stringify({ ms: echt.schritt, kurz: S, taeter: K }));
        console.log(ok ? "✅ SCHRITT GRÜN" : "❌ SCHRITT ROT");
        return gruen && ok ? 0 : 1;
    } finally {
        await browser.close();
        server.close();
    }
}
async function gesetz() {
    const { statikServer, starteBrowser, nullRenderer, warteAufWelt, buehne } = require("./lib/welt-boot.cjs");
    const server = await statikServer().lausche(Number(process.env.GEGENSTAND_STOFF_PORT || 4677));
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    try {
        const page = await browser.newPage();
        await nullRenderer(page);
        await server.zeige(page, 180000);
        await warteAufWelt(page, 180000);
        await buehne(page);
        const echt = await page.evaluate(gesetzProbe, false);
        const U = gesetzUrteil(echt, await page.evaluate(gesetzProbe, true), Object.keys(echt).filter((X) => echt[X].bruchlast));
        for (const X of Object.keys(echt)) console.log(X, U.je[X] || "—", JSON.stringify(echt[X]));
        console.log("GESETZ " + JSON.stringify(U));
        console.log(U.gruen ? "✅ GESETZ GRÜN — " + U.leser + " Leser auf der Zeile, " + U.dreifach + " Stoffe mit Licht, Bruch und Klang" : "❌ GESETZ ROT — Leser mit eigener Zahl: " + (U.taeter.join(", ") || "—") + " · an der Zeile vorbei: " + (U.vorbei.join(", ") || "—") + " · " + U.dreifach + " Stoffe mit allen drei Bereichen");
        return U.gruen ? 0 : 1;
    } finally {
        await browser.close();
        server.close();
    }
}
if (process.argv.includes("--gesetz")) {
    gesetz().then(process.exit, (e) => {
        console.error(e);
        process.exit(2);
    });
    return;
}
if (process.argv.includes("--tafel")) {
    tafel().then(process.exit, (e) => {
        console.error(e);
        process.exit(2);
    });
    return;
}

const fehlSelbst = selbstTest();
if (SELBSTTEST) {
    urteilEnde(fehlSelbst.length, "❌ SELBST-TEST ROT — " + fehlSelbst.join(" · "), "✅ SELBST-TEST GRÜN — die Stoff-Linse feuert auf Ton, rohen Reifen, Lack ohne Lackschicht, blinde Scheibe, Tönung, Namenlose und fehlenden Transport.");
}
const befunde = alles();
console.log("=== DIE STOFF-LINSE DER GEGENSTÄNDE (Fahrzeuge × 8 Lacke · Klingen/Werkzeuge) ===");
const klassen = {};
for (const b of befunde) {
    const k = (b.split(": ")[1] || b).split(" ")[0];
    klassen[k] = (klassen[k] || 0) + 1;
}
for (const b of befunde.slice(0, 40)) console.log("  ❌ " + b);
if (befunde.length > 40) console.log(`  … ${befunde.length - 40} weitere`);
if (fehlSelbst.length) console.log("  ❌ Selbst-Test: " + fehlSelbst.join(" · "));
if (befunde.length || fehlSelbst.length) {
    console.error(`\n❌ ROT — ${befunde.length} Befund(e): ${JSON.stringify(klassen)}`);
    process.exit(1);
}
console.log("\n✅ GRÜN — jeder Stoff der Fahrzeuge und Klingen liegt im Band seiner Natur, der Lack trägt seine Lackschicht und die acht Lacke, jede Scheibe ihre Durchsicht, das Labor tönt nichts, was die Welt nicht sieht.");
process.exit(0);
