// BAUSTEIN-MESSUNG (kein Schnitt): der Licht-Pool (`_lichtPoolTerm`) als SCHLEIFE über seine Plätze (`T.Loop` über Uniform-Reihen)
// statt vier ausgeschriebener Zweige — dieselbe Rechnung je Platz, nur der Text (die Werte der Reihen spiegeln den Pool nicht:
// gemessen wird nur die Übersetzung). Die Schleife lebt in einer Fn (ohne Layout, am Ort ihres Rufs eingesetzt): nur im Bau einer
// Fn hat `Loop` einen Stapel — außerhalb fiel sie still, und der Pool verschwand (erste Fassung, 18:58: 1 GGX statt 5).
// Frage: trägt das Ausschreiben der vier Plätze die Übersetzungszeit des Pools?
if (P) {
    P._lichtPoolTerm = function (Te, atmo, himmel) {
        const W = this._lichtWurf();
        const A =
            this.__poolReihe ||
            (this.__poolReihe = {
                lage: Te.uniformArray(atmo.lichtLage.map((u) => u.value.clone()), "vec4"),
                farbe: Te.uniformArray(atmo.lichtFarbe.map((u) => u.value.clone()), "vec4"),
                ersatz: Te.uniformArray(atmo.lichtErsatz.map((u) => Number(u.value) || 0), "float"),
                kern: Te.uniformArray(atmo.lichtKern.map((u) => Number(u.value) || 0), "float"),
            });
        const n = atmo.lichtLage.length;
        const welt = this;
        return Te.Fn(() => {
            const N = Te.normalView.toVar();
            const Pv = Te.positionView.toVar();
            const wurf = W.faktor.toVar();
            const summe = Te.vec3(0).toVar();
            Te.Loop(n, ({ i: k }) => {
                const lage = A.lage.element(k);
                const farbe = A.farbe.element(k);
                const ersatz = A.ersatz.element(k);
                const kern = A.kern.element(k);
                const gewicht = himmel ? ersatz.mul(himmel).oneMinus() : ersatz.oneMinus();
                const Lv = Te.cameraViewMatrix.mul(Te.vec4(lage.xyz, 1)).xyz.sub(Pv);
                const d = Lv.length();
                const bedingung = lage.w
                    .greaterThan(0)
                    .and(gewicht.greaterThan(0))
                    .and(d.lessThan(lage.w))
                    .and(N.dot(Lv).greaterThan(0));
                const L = Lv.div(d);
                const nl = N.dot(L).clamp();
                const q = d.div(lage.w).pow2();
                const abst = q
                    .pow2()
                    .oneMinus()
                    .clamp()
                    .pow2()
                    .mul(d.mul(d).add(kern).pow(farbe.a.mul(-0.5)));
                const beitrag = farbe.rgb
                    .mul(nl.mul(abst).mul(gewicht))
                    .mul(welt._punktLichtBrdf(Te, N, L, Pv.negate().normalize(), nl));
                summe.addAssign(
                    Te.select(bedingung, beitrag, Te.vec3(0)).mul(Te.mix(Te.float(1), wurf, Te.float(W.platz.equal(k))))
                );
            });
            return summe;
        })();
    };
}
