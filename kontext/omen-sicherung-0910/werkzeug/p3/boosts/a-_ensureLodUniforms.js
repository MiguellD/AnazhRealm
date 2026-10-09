_ensureLodUniforms() {
        const st = this.state;
        if (st.lodUniforms) return st.lodUniforms;
        let u = null;
        try {
            const _T = typeof THREE !== "undefined" && THREE.TSL;
            if (_T && typeof _T.uniform === "function") {
                const _ref = Number.isFinite(st.lodRef) && st.lodRef > 0 ? +st.lodRef : 14;
                // Crossfade-Band-Zahlen als LIVE-Uniforms, geseedet aus der EINEN Quelle `AnazhRealm.LOD_DISTANCES`
                // und pro Frame in `_loopRender` gespiegelt → ein Studio-Live-Ingest (`_foundryIngestRenderConfig`)
                // greift sofort in der Shader-Maske (kein eingefrorener Zweit-Satz).
                const _D = AnazhRealm.LOD_DISTANCES || {};
                u = {
                    uLodRef: _T.uniform(_ref),
                    uLodMaskOn: _T.uniform(st.lodMaskOn === false ? 0 : 1),
                    uDitherT: _T.uniform(0),
                    uLodD0: _T.uniform(Number.isFinite(_D.thresh01) ? _D.thresh01 : 20),
                    uLodD1: _T.uniform(Number.isFinite(_D.thresh12) ? _D.thresh12 : 40),
                    uLodFade: _T.uniform(Number.isFinite(_D.fade) ? _D.fade : 8),
                    uLodFade0: _T.uniform(Number.isFinite(_D.fade0) ? _D.fade0 : 4),
                    // DAS AUGE: die Welt-Position der Haupt-Kamera, je Frame gespiegelt. Jede LOD-Maske misst von
                    // HIER, nie von `cameraPosition` — die ist im Schattenpass die Kaskaden-Kamera (r184:
                    // `renderer.render(scene, shadow.camera)`; bis V18.529 stand sie 200 m über der Box, heute über
                    // dem höchsten Werfer): dort lagen nahe Bäume 145 m „weit", jenseits jeder Stufe, und die Maske
                    // verwarf ihre Schatten-Fragmente alle.
                    uLodAuge: _T.uniform(new THREE.Vector3()),
                    // DER PERF-STRECK der Wahrnehmungs-Distanz (_lodPerfMul, je Frame gespiegelt): jede Maske misst
                    // die Auge-Distanz × uLodPerf — dieselbe Distanz, nach der die CPU die Stufen legt.
                    uLodPerf: _T.uniform(1),
                };
            }
        } catch (_e) {
            u = null;
        }
        // UNIFORM-HEIMAT: der geteilte LOD-Satz reist als EIN renderGroup-Buffer.
        if (u) this._uniformHeimatTeilen(u);
        st.lodUniforms = u;
        return u;
    }