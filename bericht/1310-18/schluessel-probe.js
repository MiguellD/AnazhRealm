
        const r = window.anazhRealm;
        const T = window.THREE;
        const TSL = T.TSL;
        const k = (m) => m.customProgramCacheKey();
        const out = {};
        const a = r._foundryTreeMaterial("unknown", { roughness: 0.41, metalness: 0.1 });
        const b = r._foundryTreeMaterial("unknown", {
            roughness: 0.77,
            metalness: 0.3,
            emissive: [0.2, 0.1, 0],
            emissiveIntensity: 2,
        });
        const l1 = r._foundryTreeMaterial("unknown", { roughness: 0.5, leucht: 2 });
        const l2 = r._foundryTreeMaterial("unknown", { roughness: 0.5, leucht: 3.5 });
        const w1 = r._foundryTreeMaterial("bark", null, false, { ht: 9.5, delta: 0.021, an: 1 });
        const w2 = r._foundryTreeMaterial("bark", null, false, { ht: 14.25, delta: 0.034, an: 1 });
        out.regler = a !== b && k(a) === k(b);
        out.leucht =
            l1 !== l2 && k(l1) === k(l2) && l1.userData.stoffWerte.leucht === 2 && l2.userData.stoffWerte.leucht === 3.5;
        out.wind =
            w1 !== w2 &&
            k(w1) === k(w2) &&
            (!w1.positionNode || (w1.userData.windArt.x === 9.5 && w2.userData.windArt.x === 14.25));
        out.trennt = k(a) !== k(l1) && k(a) !== k(w1);
        const pc = globalThis.__portaCore;
        const tor = (n) => {
            const p = pc.gateParams(pc.PRESETS[n]);
            return { gestalt: n, p, mu: pc.membranUniforms(p), gesetz: pc.MEMBRAN_GESETZ };
        };
        const ta = tor("drachentor");
        const tb = tor("kathedrale");
        const ma = r._membranMaterialFor(ta);
        const mb = r._membranMaterialFor(tb);
        const fa = ma.mat.userData.tor.w;
        const fb = mb.mat.userData.tor.w;
        out.fensterVerschieden = fa.x > 0.001 !== fb.x > 0.001 || fa.w > 0.001 !== fb.w > 0.001;
        out.membran = k(ma.mat) === k(mb.mat);
        out.nebel = k(r._nebelMaterialFor(ta, ma.u).mat) === k(r._nebelMaterialFor(tb, mb.u).mat);
        out.atem = typeof ma.u.time.value === "number" && ma.u !== mb.u;
        const bau = () => {
            const m = new T.MeshStandardNodeMaterial();
            m.colorNode = TSL.vec4(TSL.attribute("color", "vec3").mul(0.5), 1.0);
            return m;
        };
        out.kontrolle = k(bau()) !== k(bau());
        return out;
