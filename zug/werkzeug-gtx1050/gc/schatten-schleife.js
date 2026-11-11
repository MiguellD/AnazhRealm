// BAUSTEIN-MESSUNG (kein Schnitt): der Filter jeder Kaskade (`_schattenFilter`) mit seinen fünf Abtastungen und der Suche des
// Werfers als SCHLEIFE (`T.Loop`) statt ausgeschrieben — dieselbe Rechnung in derselben Reihenfolge, nur der Text. Frage: trägt
// das Ausschreiben (3 × 5 Vergleiche + 5 Ladungen je Programm) die Übersetzungszeit des Kerns?
if (P) {
    P._schattenFilter = function (i) {
        const T = THREE.TSL;
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const je = (l) => l[Math.min(i, l.length - 1)];
        const sucheM = je(K.sucheM);
        return T.Fn(({ depthTexture, shadowCoord, shadow }, builder) => {
            const ref = (n, t) => T.reference(n, t, shadow).setGroup(T.renderGroup);
            const [box, karte] = [ref("anazhBoxM", "vec2"), ref("mapSize", "vec2")];
            const phi = this._ditherIGN(T, 2).mul(6.28318530718);
            const z = shadowCoord.z;
            const vogel = (k, r) => shadowCoord.xy.add(T.vogelDiskSample(k, 5, phi).mul(r));
            let r = T.vec2(je(K.filterTexel)).div(karte);
            if (sucheM > 0 && builder.renderer.backend.isWebGPUBackend === true) {
                const umgekehrt = builder.renderer.reversedDepthBuffer === true;
                const tiefe = ref("anazhTiefeM", "float");
                const kegel = (umgekehrt ? z.oneMinus() : z)
                    .mul(tiefe)
                    .sub(K.luftM)
                    .max(0)
                    .mul(K.sonneTan * 0.5)
                    .min(sucheM)
                    .toVar();
                const summe = T.float(0).toVar();
                const zahl = T.float(0).toVar();
                T.Loop(5, ({ i: k }) => {
                    const d = T.textureLoad(
                        depthTexture,
                        vogel(k, T.vec2(kegel).div(box)).clamp(0, 1).mul(karte).min(karte.sub(1))
                    );
                    const wirft = umgekehrt ? d.greaterThan(z) : d.lessThan(z);
                    summe.addAssign(T.select(wirft, d, 0));
                    zahl.addAssign(T.select(wirft, 1, 0));
                });
                const abstand = z
                    .sub(summe.div(zahl.max(1)))
                    .abs()
                    .mul(tiefe);
                const halb = T.select(zahl.greaterThan(0), abstand.mul(K.sonneTan * 0.5).min(sucheM), 0);
                const boden = T.vec2(Math.hypot(je(K.filterTexel), K.rampeTexel)).div(karte);
                const q = T.vec2(halb).div(box).add(boden);
                r = q
                    .mul(q)
                    .sub(T.vec2(K.rampeTexel ** 2).div(karte.mul(karte)))
                    .sqrt();
            }
            const rr = r.toVar();
            const s = T.float(0).toVar();
            T.Loop(5, ({ i: k }) => {
                s.addAssign(T.texture(depthTexture, vogel(k, rr)).compare(z));
            });
            return s.mul(0.2);
        });
    };
}
