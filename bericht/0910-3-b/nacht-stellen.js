// 0910-3 B: die echte Nacht. Seiten-Code für `werkbank eval` (r = Welt, T = THREE), Platzhalter __ZEIT__ und __BLICKE__.
// Die Uhr steht auf der Zeit (jeder Takt stellt sie zurück), 120 echte Spiel-Takte ziehen Himmel, Sterne, Nebel, Licht und
// Belichtung nach — KEINE Bühne (`__buehne` stellt Mittag). Danach stehen Wind-, Knoten- und Himmels-Uhr (1000) und die
// TRAA-Phase (0) für jede Aufnahme; die Tiere sind aus. Je Blick: das Bild aus dem Ausgabe-Pfad als PNG (dataURL).
const st = r.state;
const rend = st.renderer;
const ZEIT = __ZEIT__;
const halt = () => {
    st.timeOfDay = ZEIT;
    if (st.world) st.world.timeOfDay = ZEIT;
};
if (window.__wetterSetzen) window.__wetterSetzen("sunny");
halt();
r._applyDayNightToScene();
st._skyEnvLastRegenMs = -Infinity;
r._ensureSkyEnvironment(false);
for (let i = 0; i < 120; i++) {
    r._gameLoopTick(performance.now());
    halt();
    await new Promise((s) => setTimeout(s, 16));
}
rend.setAnimationLoop(null);
halt();
r._applyDayNightToScene();
for (const c of st.creatures || []) c.visible = false;
const P = Object.getPrototypeOf(r);
r._loopRender = function () {
    return P._loopRender.call(this, 1000);
};
const nf = rend._nodes.nodeFrame;
nf.update = function () {
    this.frameId++;
    this.deltaTime = 0;
    this.time = 1000;
};
if (st.skyboxUniforms && st.skyboxUniforms.time) st.skyboxUniforms.time.value = 1000;
return { zeit: ZEIT, belichtung: +rend.toneMappingExposure.toFixed(4), licht: +st.directionalLight.intensity.toFixed(4), nebel: st.scene.fog ? st.scene.fog.color.getHexString() : null };
