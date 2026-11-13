/* ── DAS TOR-STUDIO AUF DER EINEN BÜHNE (w28-studio-seiten, studios.K4 „Studio = Welt im Bild").
   Das Studio trägt seine Regler (porta-core PARAMS_BY_KIND.gate über die Hülle), die Ordnungen, die Lehre Stich→Schub→Dicke
   und die Türen — gezeichnet wird das Werk, das seine Brücke in die Welt schickt, von der EINEN Bühne der Hülle
   (AnazhHuelle.studio → buehne.werk): der Foundry-Faden der Welt baut es, ihr Stoff kleidet es (der Stein aus STEIN_GESETZ:
   `_steinStoff`), ihr Licht an ihrer Uhr trifft es, ihre Membran (`_membranMaterialFor`) steht in der Öffnung.
   GEFALLEN mit diesem Schnitt: der eigene r128-Renderer samt Licht (Hemisphäre, zwei Richtlichter, Punktlicht), der Stein-Zwilling
   `steinLabor` (r128-GLSL über onBeforeCompile), der Membran-Zwilling (ShaderMaterial, 50 Zeilen GLSL neben dem TSL der Welt),
   Bloom, FXAA und der Kino-Pass (die Welt trägt keinen). ── */
var PC = window.__portaCore;
var ORDNUNGEN = {};
Object.keys(PC.PRESETS).forEach(function (id) {
    ORDNUNGEN[PC.PRESETS[id].lab] = PC.PRESETS[id].s; // Anzeige-Map: Schöpfer-Wortlaut → Dial-Vektor (byte-gleiche Werte)
});
// der Öffnungswinkel der Flügel wohnt im Kern (TUER_GESETZ.offen); Studio UND Welt lesen die EINE Quelle
var DOOR_OPEN = PC.TUER_GESETZ.offen;
// die Namen der Bühne (die Station studios.K4 und die Albedo-Tafel lesen sie: scripts/lib/albedo-tafel.cjs STUDIOS)
var scene, camera, renderer, controls, gate = null, membrane = null, STUDIO = null;
var D = null, doorAngle = 0, doorAngleB = 0, doorTarget = 0, doorTargetB = 0, zeit = 0, passageNr = 0;
// DIE HÜLLE (K41): die Regler-Werte leben in W (Slider-id → Wert, geschrieben vom EINEN Generator), nie im DOM.
var W = {}, regler = null, sitz = null, kostenLeiste = null, aktivPreset = "Kathedrale";

function setParams(v) {
    if (regler) regler.setzen(v, true);
    else Object.assign(W, v);
}
function presetMarke(name) {
    aktivPreset = name || aktivPreset;
    [].forEach.call(document.getElementById("presets").children, function (b) {
        b.classList.toggle("active", !!name && b.textContent === name);
    });
}
function rezeptId() {
    var ids = Object.keys(PC.PRESETS);
    for (var i = 0; i < ids.length; i++) if (PC.PRESETS[ids[i]].lab === aktivPreset) return ids[i];
    return ids[0];
}
// DAS WERK DER BÜHNE (der EINE Übergabe-Kanal der Hülle): die Ordnung mit Same 1 und den Werten ihrer Regler-Zeilen — die
// Bühne zeichnet GENAU dieses Werk, das nächste gesetzte Tor der Ordnung trägt es.
function werk() {
    var ov = {};
    PC.PARAMS_BY_KIND.gate.forEach(function (z) {
        ov[z.id] = W[z.id];
    });
    return { kind: "gate", preset: rezeptId(), seed: 1, ov: ov };
}
// V18.491.132 MESSEN_VIS.lab=law-ui — die Lehre liest die Ableitung des Kerns (deriveGate am Dial-Satz gateParams, wie die Welt)
function updateLaw() {
    var el = document.getElementById("law");
    D = PC.deriveGate(PC.gateParams(PC.PRESETS[rezeptId()], W));
    if (!el) return;
    var p = D.p;
    el.textContent =
        "Strategien: Mauer " + p.wMason.toFixed(2) + " Geflecht " + p.wBraid.toFixed(2) + " Mono " + p.wMono.toFixed(2) + " Lace " + p.wLace.toFixed(2) +
        "\nMotive: Leier " + p.wLyra.toFixed(2) + " Vitruv " + p.wVitruv.toFixed(2) + " Geweih " + p.wGeweih.toFixed(2) +
        "\nOrdnungen=" + Math.round(p.orders) + " (gestaffelt, zurückweichend)" +
        "\nStich=" + D.rise.toFixed(2) + "→Schub=" + D.thrustNorm.toFixed(2) + "→Dicke=" + D.jambW.toFixed(2);
}
// DIE PASSAGE (D8, das Tor als Fenster): die Membran der Welt in der Öffnung, neben dem Werk auf dem Teller der Bühne. Ein
// Gesetz-Wert (`uniform: true`, porta-core GESETZ_WERT) tauscht nur sie — derselbe Graph, kein Neubau des Tors (studios.K2).
function passageBauen() {
    var nr = ++passageNr;
    return STUDIO.buehne.passage(werk(), membrane ? [membrane] : []).then(function (m) {
        if (nr !== passageNr) return STUDIO.buehne.passageFort(m);
        STUDIO.buehne.passageFort(membrane);
        membrane = m;
        STUDIO.teller.add(m);
        STUDIO.wecke();
    });
}
function buildGate() {
    if (kostenLeiste) kostenLeiste.neu();
    updateLaw();
    return STUDIO.bau();
}
function updatePrompt() {
    var dp = document.getElementById("doorPrompt");
    if (dp) dp.textContent = "[E] Vordertür " + (doorTarget > 0.5 ? "schließen" : "öffnen") + "  ·  [R] Hintertür " + (doorTargetB > 0.5 ? "schließen" : "öffnen");
}

function init() {
    // DIE HÜLLE (K41): Sitzung (Undo/Redo · Same · Schloss je Achse) + der EINE Regler-Generator aus PARAMS_BY_KIND.gate
    // (Entprellung 90 ms wie zuvor) + die Kosten-Leiste der Welt-Gestalt je Stufe.
    var GATE_PARAMS = PC.PARAMS_BY_KIND.gate;
    STUDIO = AnazhHuelle.studio({
        welt: "portale",
        werk: werk,
        fov: 35,
        nachBau: function (g) {
            gate = g;
            passageBauen();
        },
        // die Türen schwingen, die Passage atmet: der Takt hält das Bild wach
        takt: function (dt) {
            zeit += dt;
            doorAngle += (doorTarget - doorAngle) * 0.07;
            doorAngleB += (doorTargetB - doorAngleB) * 0.07;
            if (gate)
                STUDIO.buehne.fluegel(gate, function (t) {
                    return (t.zf >= 0 ? doorAngle : doorAngleB) / DOOR_OPEN;
                });
            if (membrane) STUDIO.buehne.passageTakt(membrane, zeit, Math.max(doorAngle, doorAngleB) / DOOR_OPEN);
            return true;
        },
    });
    scene = STUDIO.szene;
    camera = STUDIO.kamera;
    renderer = STUDIO.buehne.renderer;
    controls = STUDIO.kugel;
    sitz = AnazhHuelle.sitzung({
        werte: W,
        sperren: true,
        zustand: function () {
            return { preset: aktivPreset };
        },
        zustandSetzen: function (z) {
            presetMarke(z.preset);
        },
        anwenden: function () {
            buildGate();
        },
    });
    sitz.leiste(document.getElementById("sitzung"));
    regler = AnazhHuelle.regler(document.getElementById("sliders"), GATE_PARAMS, {
        werte: W,
        ruheMs: 90,
        sitzung: sitz,
        basis: function () {
            return ORDNUNGEN[aktivPreset] || null;
        },
        bei: function () {
            presetMarke(null);
        },
        nachRuhe: function (ids, bau) {
            return bau ? buildGate() : passageBauen();
        },
    });
    kostenLeiste = AnazhHuelle.kosten(document.getElementById("kosten"), {
        budget: PC.PORTAL_RENDER_CONFIG.lod.budget.gate,
        stufen: PC.PORTAL_RENDER_CONFIG.lod.kindStages.gate,
        bauen: function (s) {
            return PC.buildInstance(rezeptId(), 1, s, W);
        },
        renderer: function () {
            return renderer;
        },
        quelle: "gemessen an der Welt-Gestalt (porta-core buildInstance, die Regler als ov); L3·Wurf = die NUR-WURF-Hülle",
    });
    var pc = document.getElementById("presets");
    Object.keys(ORDNUNGEN).forEach(function (name) {
        var b = document.createElement("button");
        b.textContent = name;
        b.onclick = function () {
            sitz.schritt(function () {
                presetMarke(name);
                setParams(ORDNUNGEN[name]);
                buildGate();
            });
        };
        pc.appendChild(b);
    });
    // Der Zufallspunkt ist der Würfel der Sitzung: ein neuer Same zieht jede freie Achse (das Schloss hält eine fest).
    document.getElementById("rnd").onclick = function () {
        presetMarke(null);
        sitz.wuerfeln(GATE_PARAMS);
    };
    presetMarke("Kathedrale");
    setParams(ORDNUNGEN.Kathedrale);
    updateLaw();
    updatePrompt();
}
addEventListener("keydown", function (e) {
    if (e.repeat) return;
    if (e.key === "e" || e.key === "E") doorTarget = doorTarget > 0.5 ? 0.0 : DOOR_OPEN;
    else if (e.key === "r" || e.key === "R") doorTargetB = doorTargetB > 0.5 ? 0.0 : DOOR_OPEN;
    else return;
    updatePrompt();
});
init();

/* ==================== DIE BRÜCKE ZUR HEIMAT (die Hülle, K41) ==================== */
/* EINE Brücke (../huelle/huelle.js): die Tor-Ordnungen über die Preset-Knöpfe (#presets), „zufall" über den Würfel der
   Sitzung (#rnd); das Einzelwort der Heimat ganz. */
AnazhHuelle.bruecke({
    welt: "portale",
    panorama: function () {
        return STUDIO.steht.then(function () {
            return { THREE: THREE, renderer: renderer, scene: scene, kamera: camera, verbergen: membrane ? [membrane] : [] };
        });
    },
    label: "Porta — Ordnungen & fraktale Tiefe",
    dsl: ["drachentor", "kathedrale", "maschine", "geisttor", "verkalkt", "ruine", "maurentor", "zufall"],
    wort: function (w) {
        if (w === "zufall") document.getElementById("rnd").click();
        else AnazhHuelle.knopfMitText(document.getElementById("presets"), w);
    },
    werk: werk,
    // DER RÜCKWEG: das reisende Werk der Welt stellt Ordnung und Regler der Bühne
    reise: function (w) {
        sitz.schritt(function () {
            presetMarke(PC.PRESETS[w.preset].lab);
            setParams(Object.assign({}, ORDNUNGEN[aktivPreset], w.ov));
            buildGate();
        });
    },
    wurzel: function () {
        return gate;
    },
    werkOrt: STUDIO.kopf ? STUDIO.kopf.werkOrt : null,
});
