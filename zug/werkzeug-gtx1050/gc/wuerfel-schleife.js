// BAUSTEIN-MESSUNG (kein Schnitt): der Filter des Würfel-Schattens (der Wurf des Feuers, `_lichtWurf`) — r184s `PointShadowFilter`
// (fünf Vogel-Punkte, ausgeschrieben) als EIGENER Filter derselben Rechnung in EINER Schleife (`shadow.filterNode`: r184 nimmt ihn vor
// dem Filter des Karten-Typs). Frage: lohnt die Schleife auch hier?
if (P) {
    const W0 = P._lichtWurf;
    P._lichtWurf = function () {
        const K = W0.apply(this, arguments);
        const sh = K && K.licht && K.licht.shadow;
        if (sh && !sh.__schleife) {
            const T = THREE.TSL;
            sh.__schleife = true;
            sh.filterNode = T.Fn(({ depthTexture, bd3D, dp, shadow }) => {
                const radius = T.reference("radius", "float", shadow).setGroup(T.renderGroup);
                const mapSize = T.reference("mapSize", "vec2", shadow).setGroup(T.renderGroup);
                const texel = radius.div(mapSize.x).toVar();
                const absDir = T.abs(bd3D);
                const tangent = T.normalize(
                    T.cross(bd3D, absDir.x.greaterThan(absDir.z).select(T.vec3(0, 1, 0), T.vec3(1, 0, 0)))
                ).toVar();
                const bitangent = T.cross(bd3D, tangent).toVar();
                const phi = T.interleavedGradientNoise(T.screenCoordinate.xy).mul(6.28318530718).toVar();
                const s = T.float(0).toVar();
                T.Loop(5, ({ i }) => {
                    const o = T.vogelDiskSample(i, 5, phi);
                    s.addAssign(
                        T.cubeTexture(depthTexture, bd3D.add(tangent.mul(o.x).add(bitangent.mul(o.y)).mul(texel))).compare(dp)
                    );
                });
                return s.mul(0.2);
            });
        }
        return K;
    };
}
