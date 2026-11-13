// VERGLEICHS-EINGRIFF „das Bild wartet nicht auf jeden" (HALT_STUFE 1 · 2 · 3, vom Vorspann gesetzt): die Bürger der Stufe reichen
// bis zum ersten Weltbild die Erst-Zeichnung nicht — kein Knoten-Bau, keine Pipeline, kein Draw, kein Warten des Bilds; eine
// Arena merkt sich wie jeder Vorbau ohne Draw vor (`E.vorgemerkt`: „Arena im Bild"). NACH dem Bild kommen sie in der Folge
// ihrer Schirm-Fläche (gemessen, bericht/1113-bild-wartet.md) an die Reihe: die nächste Klasse, sobald der Knoten-Bau der
// vorigen steht (ihre Pipeline ist bestellt, die GPU übersetzt daneben), sie in drei Bildern keinen Draw wünschte oder 1,5 s offen war. Kein Ersatz-Stoff: was nicht fertig ist, zeichnet nicht.
//   Stufe 1: die Naht des Fern-Rings · Stufe 2: dazu die acht mit 0,00 % der Pixel · Stufe 3: alle 16 unter 0,1 %.
// → extra.halten = { stufe, klassen: { name: [Draws übersprungen, offen ms nach dem Bild, gezeichnet ms nach dem Bild] }, unbekannt }
if (P && !P.__halten) {
    P.__halten = true;
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const H = (X.halten = { stufe: HALT_STUFE, klassen: {}, fehler: "" });
    // die Klassen in der Folge ihrer Schirm-Fläche im ersten Bild (Pixel über dem Boden der Zählung), mit ihrer Stufe
    const FOLGE = [
        ["grund-b", 3], // der dritte namenlose Grund-Stoff der Szene (551 px, 0,08 %)
        ["naht", 1], // die Naht des Fern-Rings (205 px)
        ["wurf:leib", 3], // der Leib des Spielers im Schatten-Pass, zwei Pipelines (114 · 45 px)
        ["wiese:schale", 3], // 86 px
        ["wurf:formationen", 3], // 84 px
        ["march", 3], // die Stellvertreter des Welt-Marchs (76 px)
        ["wiese:lf", 3], // 36 px
        ["formationen", 2], // 29 px — 0,00 %
        ["leben", 2], // 24 px
        ["wurf:teil02", 2], // die Würfe der Arenen Teil 0 und Teil 2 (20 · 19 px)
        ["baeume:0", 2], // 8 px
        ["wurf:boden", 2], // 4 px
        ["wiese:l", 2], // 3 px
        ["panorama", 2], // 0 px
    ].filter(([, s]) => s <= HALT_STUFE);
    const IN = new Map(FOLGE.map(([k], i) => [k, i]));
    for (const [k] of FOLGE) H.klassen[k] = [0, null, null, 0, false]; // übersprungen · offen ms · gezeichnet ms · Draws seit offen · gebaut
    const je = new WeakMap();
    const schluessel = (o) => {
        const g = o.isGeometrieArena === true && Array.isArray(o.glieder) ? o.glieder[0] : null;
        return g ? String((g.userData && g.userData.archInstanceKey) || g.name || "") : "";
    };
    const klasse = (w, o, m, wurf) => {
        const st = w.state;
        const k = schluessel(o);
        if (wurf) {
            if (o.name === "bodenSatz") return "wurf:boden";
            if (o.name === "formationenSatz") return "wurf:formationen";
            if (/:[02]#S$/.test(k)) return "wurf:teil02";
            if (o.isSkinnedMesh === true) for (let x = o.parent; x; x = x.parent) if (x.name === "mensch") return "wurf:leib";
            return null;
        }
        if (st.fernRing && m === st.fernRing.stoffe.naht) return "naht";
        if (st.feldPass && o === st.feldPass.march) return "march";
        if (st.feldPass && o === st.feldPass.mesh) return "panorama";
        if (o.name === "formationenSatz") return "formationen";
        if (/^(vogel|tier:)/.test(k)) return "leben";
        if (/^nahWiese:L[12]:/.test(k)) return "wiese:l";
        if (/^nahWiese:Lf:schale/.test(k)) return "wiese:schale";
        if (/^nahWiese:Lf:/.test(k)) return "wiese:lf";
        if (/^f:.*:0$/.test(k)) return "baeume:0";
        if (m.isMeshBasicNodeMaterial === true && !o.name && o.parent === st.scene && o !== st.skybox && o !== st.starField) return "grund-b";
        return null;
    };
    let [welt, auf, offenSeit] = [null, -1, 0]; // `auf`: der Index der zuletzt geöffneten Klasse (−1: das Bild steht noch nicht)
    const A0 = P._erstAbsageWache;
    P._erstAbsageWache = function (renderer) {
        try {
            welt = this;
            if (!renderer.__halten && typeof renderer._renderObjectDirect === "function") {
                renderer.__halten = true;
                const z0 = renderer._renderObjectDirect;
                renderer._renderObjectDirect = function (object, material, scene, ...rest) {
                    if (scene === welt.state.scene) {
                        const wurf = material.isShadowPassMaterial === true;
                        let e = je.get(object);
                        if (e === undefined) je.set(object, (e = [undefined, undefined]));
                        let k = e[wurf ? 1 : 0];
                        if (k === undefined || (k === null && object.isGeometrieArena === true && !schluessel(object))) k = e[wurf ? 1 : 0] = klasse(welt, object, material, wurf);
                        const i = k ? IN.get(k) : undefined;
                        if (i !== undefined) {
                            const z = H.klassen[k];
                            if (i > auf) {
                                z[0]++;
                                if (object.isGeometrieArena === true) {
                                    const E = welt._erstZeichnungStand();
                                    if (!E.vorgemerkt.has(object)) E.vorgemerkt.set(object, new Set());
                                }
                                return;
                            }
                            z[3]++;
                            const r = z0.call(this, object, material, scene, ...rest);
                            if (z[2] == null && welt._erstZeichnungStand().gezeichnet.has(object)) z[2] = Math.round(performance.now() - welt.state._weltbildDa);
                            return r;
                        }
                    }
                    return z0.call(this, object, material, scene, ...rest);
                };
            }
        } catch (err) {
            H.fehler = "haken: " + String(err.message);
        }
        return A0.apply(this, arguments);
    };
    const K0 = P._knotenRate;
    P._knotenRate = function (N, ro, E) {
        const r = K0.call(this, N, ro, E);
        try {
            if (r && auf >= 0 && auf < FOLGE.length && ro.scene === this.state.scene) {
                const e = je.get(ro.object);
                const k = e && e[ro.material && ro.material.isShadowPassMaterial === true ? 1 : 0];
                if (k === FOLGE[auf][0]) H.klassen[k][4] = true;
            }
        } catch (err) {
            H.fehler = "rate: " + String(err.message);
        }
        return r;
    };
    let bilderOffen = 0;
    const Z0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (...a) {
        const aus = Z0.apply(this, a);
        try {
            const da = this.state._weltbildDa;
            if (da && auf < FOLGE.length - 1) {
                const jetzt = performance.now();
                const vor = auf >= 0 ? H.klassen[FOLGE[auf][0]] : null;
                bilderOffen++;
                if (auf < 0 || vor[4] || vor[2] != null || (bilderOffen >= 3 && vor[3] === 0) || jetzt - offenSeit > 1500) {
                    auf++;
                    bilderOffen = 0;
                    offenSeit = jetzt;
                    H.klassen[FOLGE[auf][0]][1] = Math.round(jetzt - da);
                    // ein Bündel, das ohne den Bürger versiegelt wurde, nimmt neu auf
                    this.state.scene.traverse((o) => void (o.isBundleGroup === true && (o.needsUpdate = true)));
                }
            }
        } catch (err) {
            H.fehler = "folge: " + String(err.message);
        }
        return aus;
    };
}
