class AnazhRealm_siedlung_menge {
    // ===== ATLAS · Siedlung/menge — Die Menge der Bewohner: der Leib im Ring (an · ab · Stand) · der Satz der Menge · Pose und Lagen · Gang im Feld · Backen · die Matrizen des Satzes =====
    // DAS BEIN SEINES BAUS OHNE LEIB (w28-leib-im-ring; Leser: der Gang-Takt `_gaitTakt`, das Rig seines Leibs): Ober- und
    // Unterschenkel der Gestalt in ihrer Ruhe (`G.mass`, am ersten Leib gemessen), gestellt von demselben Gesetz, das die
    // Knochen seines Leibs stellt (koerper `leibBauAuf` auf Daten-Knoten: nur die Höhen von Knie und Knöchel) — dieselben
    // Zahlen wie `_gaitBeinMass` am gebauten Leib.
    _bewohnerBeinMass(G, b) {
        const M = G.mass;
        const P = () => ({ position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } });
        const t = { mensch: P(), torso: P(), head: P() };
        for (const s of ["1", "-1"]) for (const n of ["arm", "elbow", "hand", "knee", "ankle"]) t[n + s] = P();
        window.__koerperCore.leibBauAuf(t, G.dK, b.bauZu);
        const laenge = (p, dy) => Math.sqrt(p.x * p.x + (p.y + dy) * (p.y + dy) + p.z * p.z);
        const l1 = laenge(M.knie, t[M.knieName].position.y);
        const l2 = laenge(M.fuss, t[M.fussName].position.y);
        const [wpl, wz] = [M.wpl * b.groesse, M.wz * b.groesse];
        return { l1, l2, wpl, wz, L: (l1 + l2) * wpl };
    }

    // DER LEIB ZIEHT IN DIE HÜLLE (w28-leib-im-ring): der EINE Mensch-Bau unter den Dials seiner Gestalt (die Übergabe des
    // Spielers ruht — der Sentinel des Mitspielers) — Haut, Knochen und Grobstufe hängen an der Hülle des Bewohners, was der
    // Bau an seiner Gruppe trägt (`rig`, `_gelenk`, …), an ihrem `userData` (`_leibTeile` merkt die Namen für den Abschied).
    // Er hält seine Haltung jenseits der Stufen-Grenze (`haltungFest`: kein Sprung in die A-Pose der Vorlage). → trägt er ihn?
    _bewohnerLeibAn(S, b) {
        const G = S.gestalten[b.gestalt];
        const g = b.leib;
        const u = g.userData;
        if (u.rig) return true;
        const alt = this._activePeerUebergabe;
        this._activePeerUebergabe = {};
        let k = null;
        try {
            k = this._buildHumanGroup(G.ov);
        } finally {
            this._activePeerUebergabe = alt;
        }
        const gl = k && k.userData._gelenk;
        if (!k || !k.userData.rig || !gl) {
            if (k) this._disposeSoulGroup(k);
            this._bruchMelden(`BEWOHNER: der Mensch-Bau lieferte keinen Leib („${S.plan.name || "?"}")`);
            return false;
        }
        u._leibTeile = Object.keys(k.userData);
        Object.assign(u, k.userData);
        while (k.children.length) g.add(k.children[0]);
        // Breite und Tiefe seines Genoms tragen die Hüllen (im Raum des Leibs, nach der Haut — wie die Matrix seines Satzes);
        // das Rig, die Glieder des Felds und der Stand bleiben in seiner Höhe.
        // DER WURF IST DER SATZ (`_bewohnerSatz`): kein Teil des Leibs wirft, auch der nahe nicht — die Kaskaden zeichnen jeden
        // Bewohner im Nah-Kreis aus dem Wurf-Satz seiner Gestalt; sichtbar wird der Leib erst durch die Nah-Wahl (`_tickBewohner`)
        g.traverse((n) => {
            if (n.isSkinnedMesh) n.scale.set(b.breite, 1, b.tiefe);
            if (n.isMesh) [n.userData.__ton, n.castShadow] = [b.tonZeilen, false];
        });
        gl.haltungFest = true;
        const teile = {};
        gl.nah.traverse((n) => {
            if ((n.isGroup || n.isBone) && n.name) teile[n.name] = n;
        });
        // SEIN BAU AUF SEINEN KNOCHEN (w28-leib-genom, koerper BAU_GESETZ): der Guss seiner Gestalt steht im Kanon des Skeletts — die
        // Knochen DIESES Leibs stehen, wo der Guss seines eigenen Baus sie stellt (koerper `leibBauAuf`: dasselbe Gesetz, das den
        // Guss und die Tafel der Menge stellt — die Glieder in ihrer Länge, die Schulter in Abstand und Höhe; die Zeile des
        // Menschen, kein Baum: Mikrosekunden); die Ruhe der Gelenk-Gestalt (`_gelenkRuhe`) merkt sie. Die Ruhe seiner ARME an
        // seinem Rumpf rechnet der Löser am Baum des Gesetzes (~3,7 ms) — erst, wenn er nah gezeigt wird (`_tickBewohner`,
        // `bauZu`). Gang, Feld und Stand lesen diese Knochen.
        // DAS MASS DER GESTALT (am ersten Leib, vor seinem Bau): Knie und Knöchel in ihrer Ruhe, die Welt-Skala der Hüfte je
        // Größe 1, die Beinlänge je Größe 1 (das Tempo des Tags, `_bewohnerGeburt`) und die Zeile ihrer Gelenk-Gestalt (die
        // Grenze der Grobstufe, `_bewohnerGelenkAb`) — wer ohne Leib steht und geht, liest sie hier (`_bewohnerBeinMass`)
        const rig = u.rig;
        if (!G.mass) {
            const M0 = this._gaitBeinMass(rig);
            G.mass = {
                knie: rig.legL.knee.position.clone(),
                fuss: rig.legL.ankle.position.clone(),
                knieName: rig.legL.knee.name,
                fussName: rig.legL.ankle.name,
                wpl: M0.wpl / b.groesse,
                wz: M0.wz / b.groesse,
                beinL: M0.L / b.groesse,
                gelenk: { art: gl.art, abM: gl.abM, hyst: gl.hyst },
            };
            // die Glieder der Gattung zerlegt der Vorrat an einem Leib (`_gliederBestellen`, im Leerlauf): an diesem — wer
            // ohne Leib steht, bestellt nicht (`_gattungGlieder`)
            const echt = !(this.state.renderer && this.state.renderer._isHeadlessNull);
            if (echt && !(this._trefferGliedNamen && this._trefferGliedNamen.has(u.gattung))) this._gliederBestellen(g);
        }
        const kc = window.__koerperCore;
        kc.leibBauAuf(teile, G.dK, b.bauZu);
        for (const e of gl.ruhe || []) e[1].copy(e[0].position);
        const ruhe = {};
        for (const [k, p, q, s] of gl.ruhe || []) if (k.name) ruhe[k.name] = { position: p, quaternion: q, scale: s };
        u._tierBaum = { teile, wrap: gl.nah.parent, ruhe };
        // das Bein seines Baus ist EINE Zahl (`_bewohnerBeinMass`): sein Rig liest sie, wie sein Stand sie las
        rig._beinMass = b.beinMass || undefined;
        b.armeOffen = true; // die Ruhe der Arme seines Baus stellt die Nah-Wahl an DIESEM Leib (`_tickBewohner`)
        this._stoffstromHand(b); // trägt er ein Werkzeug der Kette, hängt es an seiner Hand (mensch.wirtschaft.stoffstrom#1)
        this._leibMatrix(g);
        return true;
    }

    // DER LEIB GEHT (w28-leib-im-ring): Haut, Knochen und Grobstufe verlassen die Hülle über den EINEN Abschied
    // (`_disposeSoulGroup`: die Geometrie der Vorlage bleibt, die Render-Objekte lösen sich, die Vorlage zählt ihn ab) — der
    // Stand bleibt (Lage, Feld, Satz, Gang: Phase und Gewicht liegen am Bewohner). Wer als Leib im Bild steht, gibt ihn nicht.
    _bewohnerLeibAb(b) {
        const g = b.leib;
        const u = g && g.userData;
        if (!u || !u.rig || b.backt) return; // (an wem gebacken wird, der hält ihn: `_bewohnerBackt`)
        const k = new THREE.Group();
        while (g.children.length) k.add(g.children[0]);
        for (const n of u._leibTeile) delete u[n];
        for (const n of ["_leibTeile", "_tierBaum", "_trefferGlieder", "_gaitIK", "werkzeugMesh"]) delete u[n];
        this._disposeSoulGroup(k);
        b.armeOffen = false;
        g.visible = false;
    }

    // DIE GRENZE DER GROBSTUFE eines Bewohners in Metern (der Takt seines Gangs, `_creatureAnimDiv`): die Zeile der
    // Gelenk-Gestalt seiner Gestalt (`G.mass.gelenk`) × seine Größe — mit und ohne Leib dieselbe Zahl (`_gelenkAb`).
    _bewohnerGelenkAb(S, b) {
        return this._gelenkGrenzen(S.gestalten[b.gestalt].mass.gelenk).grenzen[0].ab * (b.leib.scale.x || 1);
    }

    // DER STAND DES LEIBS an (x, z): auf dem Boden jedes Körpers (Q4: die Fels-Grenze, nie das Dach), an der Tür auf ihrer
    // Stufe (`_bewohnerTritt`) — die Sohle PLAYER_FOOT_OFFSET unter dem Ursprung (Lehre 22). Leser: die Geburt, die Ankunft.
    _bewohnerStellen(b, g, x, z) {
        const h0 = this._koerperBodenUnter(x, NaN, z);
        const h = Number.isFinite(h0) ? this._bewohnerTritt(x, z, h0, h0) : 0;
        g.position.set(x, h + AnazhRealm.PLAYER_FOOT_OFFSET * b.groesse, z);
        [b.grundH, b.frist] = [undefined, null]; // der Grund des Schritts liest neu, er wählt neu
    }

    // DER SATZ DER MENGE (der EINE Gang-Satz, `_gangSatz` — Lehre 23: die Kosten der Menge hängen nie an der Kopfzahl): EINER je
    // Siedlung, ihr Leib-Raum (`_bewohnerRaum`, w26-leib-raum): der Leib der Menge im Auge (`leib`, die Mengen-Stufe 2 — mensch.K4:
    // EINE Hülle, die Farben in ihren Ecken) und sein Wurf aus der NUR-WURF-Stufe 3 (`wurf`, Studio-Vertrag B2: nie gezeigt, nur
    // auf der Wurf-Ebene, jeder im Nah-Kreis, auch die Nah-Wahl; Lehre 26: der Schatten ist derselbe Leib), EINE Senke je Stufe —
    // jede die Vorlage ihrer Stufe samt Formziel-Tafel (`raum`), jede Instanz ihr Punkt (die Zeile ihrer Palette, `satzZeilen`).
    // Befehle je Siedlung: einer im Auge, der Wurf je Kaskade (bis w26-leib-raum je Gestalt, 8 je Siedlung). DER GANG IM SATZ: das
    // EINE Gang-Gesetz des nahen Leibs in EINEM Band — `gangPhasen` Phasen des Doppelschritts und der Stand, am Leib `b` gestellt
    // und auf die Knochen der Vorlage gelegt (`_bewohnerRaumStellen`), je Instanz Phase und Gewicht ihres Gangs
    // (`_bewohnerSatzSchreiben`). Ein Bewohner im Satz ist eine Matrix und ein Punkt; der Satz geht mit seiner Siedlung.
    _bewohnerSatz(S, b) {
        const R = S.raum;
        const senken = [];
        const quellen = [];
        let gesicht = null;
        for (const [lod, teil] of [
            [2, "leib"],
            [3, "wurf"],
        ]) {
            const t = this._ofenMenschTemplate(R.dK, R.f.skin, R.f.hair, lod);
            const q = [];
            if (t && t.root && t.raum)
                t.root.traverse(
                    (m) => m.isSkinnedMesh && q.push({ m, beid: m.material.side === THREE.DoubleSide, raum: t.raum })
                );
            if (q.length !== 1) {
                this._bruchMelden(
                    `BEWOHNER: die Mengen-Stufe ${lod} trägt ihre Vorlage nicht („${S.plan.name || "?"}")`
                );
                return false;
            }
            quellen.push(q[0]);
            senken.push({ teil, quellen: q, stoff: q[0].m.material, wurf: teil === "wurf" });
            // DAS GESICHT DES SATZES (w28-satz-menge): die Züge der Vorlage reisen mit ihrem Guss (`gesicht`, foundry-core
            // `__gesichtFern`) — ohne sie zeigte jeder Bewohner im Satz EINE Fläche unter der Haar-Kappe; nie still ohne
            if (lod === 2) {
                if (!t.gesicht) {
                    this._bruchMelden(
                        `BEWOHNER: die Mengen-Stufe 2 trägt das Gesetz ihres Gesichts nicht („${S.plan.name || "?"}")`
                    );
                    return false;
                }
                gesicht = t.gesicht;
            }
        }
        return this._gangSatz(
            {
                name: "bewohner-satz",
                gesicht,
                inventar: "bewohner",
                n: AnazhRealm.BEWOHNER.gangPhasen,
                baender: window.__koerperCore.LEIB_SATZ.baender.length, // (je Gang des Satzes ein Band: der Gesunde, der Kranke)
                staende: AnazhRealm._bewohnerStandZahl(),
                standZeilen: window.__koerperCore.STAND.zeilen,
                quellen,
                cap: S.liste.length,
                senken,
                raum: true,
            },
            // die erste Zeile jedes Stands zuerst (der Satz steht, bis sein Gang gebacken ist, und steht in der ersten Zeile, bis die
            // Zeilen seiner Stände gebacken sind — `_bewohnerGangBacken` im Takt)
            (Z) => {
                Object.assign(Z, { gebacken: 0, tempo: b.tempoBand });
                for (let z = 0; z < Z.staende; z += Z.standZeilen)
                    this._bewohnerGangPose(b.leib, Z, Z.baender * Z.n + z, S);
            }
        );
    }

    // DIE POSE k (k < n: die Phase 2πk/n des Doppelschritts im EINEN Gang-Gesetz — `_gaitTick` mit dem Tempo des Leibs,
    // eingeschwungen, dann `_animateHuman`; k = n + z: die Stand-Zeile z, die Haltung ihres Namens zur Uhr ihres Teils des Zyklus
    // (`_bewohnerStandZeit`, koerper STAND — stand-lebt) — im Gesetz ändert die Haltung nur den Stand, nie den Gang) am Leib `g`: mit der Siedlung `S` die
    // Zeile k des Gang-Puffers ihres Satzes `Z` — die Pose auf die Knochen der Vorlage gelegt (`_bewohnerRaumStellen`) und in den
    // Raum des Leibs geskinnt (`_gangSatzPose`) —, ohne sie die Lagen der Zeile k einer Gestalt `Z` (`_bewohnerLagePose`: der Gang
    // des Felds). Danach steht der Leib wieder im Stand.
    // DIE BÄNDER DES GANGS (leib-liest-satz-2, koerper LEIB_SATZ.baender): k < baender·n trägt das Band ⌊k/n⌋ — der Gesunde, der
    // Kranke: sein Tempo aus derselben Zeile wie sein Stand (`leibSatzTempo`), seine Pose aus seinem Namen (`tagesHaltung` des
    // Satzes → `leibSatzPose` im Gang); die Stände ab baender·n. Bis hier buk der Satz EIN Band: fern ging der Kranke wie der Gesunde.
    _bewohnerGangPose(g, Z, k, S) {
        const KC = window.__koerperCore;
        const B = Z.baender;
        if (k < B * Z.n) {
            const band = Math.floor(k / Z.n);
            const G = Z.gaenge || (Z.gaenge = []);
            if (!G[band]) {
                const satz = { krank: KC.LEIB_SATZ.baender[band] === "krank" };
                const [h, v] = [{}, KC.leibSatzTempo(Z.tempo, satz)];
                let gang = null;
                for (let i = 0; i < 40; i++) gang = this._gaitTick(g, h, v, 0.1, null);
                G[band] = { gang, gemuet: band ? { haltung: KC.tagesHaltung(null, null, satz) } : null };
            }
            this._animateHuman(g, 0, (2 * Math.PI * (k % Z.n)) / Z.n, true, false, G[band].gemuet, G[band].gang);
        } else {
            // (die Stand-Zeile zur Uhr ihres Teils des Zyklus, `_bewohnerStandZeit` — eingeschwungen, ohne die Zeile davor)
            const h = k - B * Z.n;
            window.__koerperCore.leibRigEingeschwungen(g.userData.rig);
            this._animateHuman(g, this._bewohnerStandZeit(h), 0, false, false, this._bewohnerStandGemuet(h));
        }
        this._leibMatrix(g);
        if (S) {
            const P = this._bewohnerRaumStellen(S, g);
            this._gangSatzPose(Z, k, P.teile, P.wurzel.matrixWorld);
        } else this._bewohnerLagePose(Z, k, g);
        if (k !== B * Z.n) {
            this._animateHuman(g, 0, 0, false, false, null);
            this._leibMatrix(g);
        }
    }

    // DIE KNOCHEN DER VORLAGE (w26-leib-raum): das Skelett der Mengen-Stufe 2 der Siedlung (ihr Leib-Raum, `_bewohnerRaum`) in
    // demselben Rahmen wie ein Leib (`_buildHumanoidRig`: die Hülle × Welt-Maß, die Sohle der Vorlage auf der Sohle der Kapsel),
    // einmal je Siedlung; `ruhe` die Lage jedes Knochens beim Bau.
    _bewohnerRaumPose(S) {
        const R = S.raum;
        if (R.pose) return R.pose;
        const t = this._ofenMenschTemplate(R.dK, R.f.skin, R.f.hair, 2);
        const klon = t.root.clone(true);
        const meshes = [];
        klon.traverse((n) => n.isMesh && meshes.push(n));
        for (const m of meshes) m.parent.remove(m);
        const teile = {};
        klon.traverse((n) => {
            if ((n.isGroup || n.isBone) && n.name) teile[n.name] = n;
        });
        const f = (8 * AnazhRealm.PLAYER_KH) / 6;
        const wrap = new THREE.Group();
        wrap.scale.setScalar(f);
        wrap.position.y = -AnazhRealm.PLAYER_FOOT_OFFSET - f * AnazhRealm._ofenSohleY(t);
        wrap.add(klon);
        const wurzel = new THREE.Group();
        wurzel.add(wrap);
        const ruhe = {};
        for (const nm in teile)
            ruhe[nm] = {
                position: teile[nm].position.clone(),
                quaternion: teile[nm].quaternion.clone(),
                scale: teile[nm].scale.clone(),
            };
        wurzel.updateMatrixWorld(true);
        return (R.pose = { wurzel, teile, ruhe });
    }
    // DIE POSE EINES LEIBS AUF DER VORLAGE (w26-leib-raum, SMPL: dieselbe Pose θ, die Gelenke des Raums): je Knochen der Vorlage die
    // Winkel des gestellten Leibs `g` über seiner Ruhe (`_tierBaum.ruhe`; das Pose-Gesetz koerper `leibRigPose` ADDIERT sie) auf der Ruhe
    // der Vorlage — wo beide gleich ruhen, seine Drehung —, dazu der Schritt seiner Lage und das Maß seiner Skala (die Gelenke weichen quer
    // höchstens 21 mm ab: Schulter, Geschlecht). Bis hier galt die Drehung auch, wo der Arm nach seinem Bau anders ruht (`leibBauArme`): der
    // Pfarrer #16036 (1,2° anders) stand in sad 1,3° anders als sein Stand im Satz (gate:kreatur-takt bewohner, die Haltung).
    // DIE ABSPREIZUNG DER SCHULTER ist keine Summe über der Ruhe (a-haltung): die Pose nennt ihren Winkel vom Lot (`rig.armLot`), die
    // Ruhe ist der Boden — auf der Vorlage steht sie auf deren Ruhe. Bis hier trug die Vorlage den Winkel über der Ruhe des gestellten
    // Leibs: der Satz stand in joy und showcase 3,1° anders als der nahe Leib (gate:kreatur-takt bewohner an c42df2b0).
    _bewohnerRaumStellen(S, g) {
        const [P, tb] = [this._bewohnerRaumPose(S), g.userData._tierBaum];
        const [q, eR, eS] = this._bewohnerRaumQ || (this._bewohnerRaumQ = [new THREE.Quaternion(), new THREE.Euler(), new THREE.Euler()]); // prettier-ignore
        const rig = g.userData.rig;
        const lot = rig && rig.armLot && rig.armLot.length === 2 ? rig.armLot : null;
        for (const nm in P.teile) {
            const [d, r, s, sr] = [P.teile[nm], P.ruhe[nm], tb.teile[nm], tb.ruhe[nm]];
            if (!s || !sr) continue;
            if (Math.abs(r.quaternion.dot(sr.quaternion)) > 1 - 1e-9) d.quaternion.copy(r.quaternion).multiply(q.copy(sr.quaternion).invert().multiply(s.quaternion)); // prettier-ignore
            else d.rotation.set(eR.setFromQuaternion(r.quaternion, s.rotation.order).x + s.rotation.x - eS.setFromQuaternion(sr.quaternion, s.rotation.order).x, eR.y + s.rotation.y - eS.y, lot && s === rig.armL.shoulder ? Math.max(eR.z, lot[0]) : lot && s === rig.armR.shoulder ? Math.min(eR.z, lot[1]) : eR.z + s.rotation.z - eS.z, s.rotation.order); // prettier-ignore
            d.position.copy(r.position).add(s.position).sub(sr.position);
            d.scale.copy(r.scale).multiply(s.scale).divide(sr.scale);
        }
        P.wurzel.updateMatrixWorld(true);
        return P;
    }

    // DIE LAGEN DER ZEILE k (der Gang des Felds, Lehre 14): je Teil des Leibs (`_tierBaum.teile`, "" = die Hülle — die Anker der
    // Glieder, `_kreaturGliederBacken`) seine Welt-Matrix im Raum des Leibs, gestellt wie die Zeile k des Gang-Puffers; die
    // Größe trägt die Wurzel jedes Leibs (`_bewohnerFeldLage`).
    _bewohnerLagePose(satz, k, g) {
        const tb = g.userData._tierBaum;
        if (!satz.lageTeile) {
            satz.lageTeile = ["", ...Object.keys(tb.teile)];
            satz.lagen = new Float32Array((satz.baender * satz.n + AnazhRealm._bewohnerStandZahl()) * satz.lageTeile.length * 16); // prettier-ignore
        }
        const inv = (this._bewohnerLageInv || (this._bewohnerLageInv = new THREE.Matrix4()))
            .copy(g.matrixWorld)
            .invert();
        const m = this._bewohnerLageM || (this._bewohnerLageM = new THREE.Matrix4());
        const K = satz.lageTeile.length;
        satz.lageTeile.forEach((nm, i) => {
            const a = nm ? tb.teile[nm] : tb.wrap || g;
            m.multiplyMatrices(inv, a.matrixWorld).toArray(satz.lagen, (k * K + i) * 16);
        });
    }

    // DER GANG IM FELD (mensch.K1, Lehre 14 und 25: der Takt kostet, was ihn betrifft): jenseits des Nah-Kreises trägt das Feld
    // den Leib, und seine Glieder gehen den EINEN gebackenen Gang seiner Gestalt — die Lagen der Zeilen (`_bewohnerLagePose`),
    // gemischt, wie der Knoten des Satzes mischt (`_gangSatzKnoten`: der Stand gegen die Phasen k0 und k1 nach dem Gewicht des
    // Gangs; ungebacken der Stand), auf der Wurzel des Leibs. Ein Leib ohne Glieder (die Liste des Felds erschöpft) zeichnet
    // nirgends und kostet nichts, eine Gestalt ohne Satz brach laut an ihm (`_bewohnerSatz`). Jedes Glied trägt den Namen
    // seines Ankers (`_kreaturGliederBacken`): bis treffer-kalt las die Lage dafür die Gattung und hielt still an, war sie kalt.
    // Bis stadt-takt-z15d ging je Schritt das Rig (`_animateHuman`) und die Welt-Matrix des ganzen Leibs (`_leibMatrix`) — am
    // Messort stadt mittags (165 Gehende) `_bewohnerGangSchritt` 108,7 → 25,6 ms je Sekunde (Radeon); die Lage der Glieder
    // weicht vom Rig höchstens 3,7 cm ab (der Atem, das Tempo des Back-Leibs). DER STAND LEBT (stand-lebt): der Stand ist die Zeile
    // seiner Uhr im Zyklus seines Stands, gemischt mit der nächsten (`_bewohnerStandLage`) — wie der Gang k0 und k1 mischt.
    _bewohnerFeldLage(b, S, an = this.state.creaturesHidden !== true) {
        const g = b.leib;
        const gl = g.userData._kzGlieder;
        const Z = S.gestalten[b.gestalt].lage;
        if (!gl || !Z) return;
        // je Name die Zeile seiner Lage — der Leib trägt seine Glieder oder fern EIN Feld, die Hülle an der Wurzel ""
        // (`_leibSatzStufe`): die Zuordnung liest den Namen des Eintrags, nie seine Stelle
        if (Z.lageVon === undefined) Z.lageVon = new Map(Z.lageTeile.map((nm, i) => [nm, i]));
        if (Z.lageVon && gl.some((x) => !Z.lageVon.has(x.name))) {
            Z.lageVon = false;
            this._bruchMelden(`BEWOHNER: ein Glied ohne Lage im Gang der Gestalt („${S.plan.name || "?"}")`);
        }
        if (!Z.lageVon) return;
        const K = Z.lageTeile.length;
        const L = Z.lagen;
        const w = Z.fertig ? b._gaitW || 0 : 0;
        const ph = Z.fertig ? (b.walkPhase || 0) / (2 * Math.PI) : 0;
        const f = (ph - Math.floor(ph)) * Z.n;
        const k0 = Math.min(Z.n - 1, Math.floor(f));
        const k1 = (k0 + 1) % Z.n;
        const t = f - k0;
        const st = this._bewohnerStandLage(b, Z);
        const u = st[2];
        const R = (this._bewohnerFeldR || (this._bewohnerFeldR = new THREE.Matrix4())).compose(
            g.position,
            g.quaternion,
            g.scale
        );
        const M = this._bewohnerFeldM || (this._bewohnerFeldM = new THREE.Matrix4());
        const W = this._bewohnerFeldW || (this._bewohnerFeldW = new THREE.Matrix4());
        const E = M.elements;
        const kB = Z.fertig ? (b.gangBand || 0) * Z.n : 0; // (das Band seines Gangs: der Kranke geht in seinen Zeilen)
        for (let i = 0; i < gl.length; i++) {
            const j = Z.lageVon.get(gl[i].name);
            const s0 = ((Z.baender * Z.n + st[0]) * K + j) * 16;
            const s1 = ((Z.baender * Z.n + st[1]) * K + j) * 16;
            const a0 = ((kB + k0) * K + j) * 16;
            const a1 = ((kB + k1) * K + j) * 16;
            for (let e = 0; e < 16; e++) {
                const q = L[a0 + e] + (L[a1 + e] - L[a0 + e]) * t;
                const sv = L[s0 + e] + (L[s1 + e] - L[s0 + e]) * u;
                E[e] = sv + (q - sv) * w;
            }
            this._weltFeldMatrix(gl[i].handle, W.multiplyMatrices(R, M));
            this._weltFeldAktiv(gl[i].handle, an);
        }
    }

    // DER ANKER EINES GLIEDS IM FELD (w28-leib-im-ring; Leser: das Backen der Glieder, `_kreaturGliederBacken`): die Welt-Matrix
    // des Teils `name` ("" = die Hülle) im Stand seiner Gestalt (die Zeile n ihrer Lagen, `_bewohnerLagePose`) an der Lage des
    // Bewohners — der Bewohner im Feld steht nie an Knochen. null: die Gestalt trägt die Lage (noch) nicht.
    _bewohnerFeldAnker(L, name) {
        const Z = L.S.gestalten && L.S.gestalten[L.b.gestalt].lage;
        const j = Z && Z.lageTeile ? Z.lageTeile.indexOf(name) : -1;
        if (j < 0) return null;
        const g = L.b.leib;
        const R = (this._bewohnerFeldR || (this._bewohnerFeldR = new THREE.Matrix4())).compose(
            g.position,
            g.quaternion,
            g.scale
        );
        const M = (this._bewohnerFeldM || (this._bewohnerFeldM = new THREE.Matrix4())).fromArray(
            Z.lagen,
            (Z.baender * Z.n * Z.lageTeile.length + j) * 16
        );
        return (this._bewohnerFeldW || (this._bewohnerFeldW = new THREE.Matrix4())).multiplyMatrices(R, M);
    }

    // AN IHM WIRD GEBACKEN (w28-leib-im-ring): er hält seinen Leib, bis der Satz der Siedlung, die Lagen seiner Gestalt und die
    // Glieder seiner Gattung stehen (`_bewohnerGangBacken` gibt ihn frei) — der Ring nimmt ihn so lange nicht.
    _bewohnerBackt(S, b) {
        if (!b.backt) (S.backt || (S.backt = [])).push(b);
        b.backt = true;
        return b;
    }

    // DER GANG WIRD GEBACKEN (Lehre 14: schwere deterministische Arbeit im Takt, nie als Spitze): je Takt höchstens `je`
    // Phasen — zuerst der Satz der Siedlung (am ersten Leib, der nicht als Leib lebt: ein Leib der Nah-Wahl trägt seine eigene
    // Pose), dann die Lagen jeder Gestalt (das Feld, an einem ihrer Leiber); ist der Satz gebacken, lädt die Textur EINMAL neu und
    // er geht (`fertig`). DIE ZEILEN DER STÄNDE (stand-lebt): nach dem Gang die übrigen Zeilen jedes Stands über seinen Zyklus (die
    // erste stand ab der Geburt) — sind sie gebacken (`standFertig`, die Textur lädt noch einmal), liest jeder Bewohner die Zeile
    // seiner Uhr (`_bewohnerStandLage`). Liefert, ob der Satz eben fertig wurde (sein Gang oder seine Stände).
    _bewohnerGangBacken(S, je) {
        let fertig = false;
        // (w28-leib-im-ring: gebacken wird an einem Leib — der Erste, der frei ist, trägt ihn für das Backen, `backt`, und
        // gibt ihn zurück, sobald Satz, Lagen und die Glieder seiner Gattung stehen)
        const frei = (gi) => {
            // (mittag-heiler: nie an einem, der seinen Leib für das Auge trägt — der Ring hält ihn wach, `_bewohnerRuhig`)
            const x = S.liste.find(
                (x) =>
                    (gi < 0 || x.gestalt === gi) && x.leib && !x.nah && !x.amSteuer && (x.backt || !x.leib.userData.rig)
            );
            return x && this._bewohnerLeibAn(S, x) ? this._bewohnerBackt(S, x) : null;
        };
        if (S.backt && S.backt.length) {
            const echt = !(this.state.renderer && this.state.renderer._isHeadlessNull);
            const warm = (x) =>
                !echt || (this._trefferGliedNamen && this._trefferGliedNamen.has(x.leib.userData.gattung));
            S.backt = S.backt.filter((x) => {
                const L = S.gestalten[x.gestalt].lage;
                x.backt = !(
                    (!S.satz || (S.satz.fertig && S.satz.standFertig)) &&
                    L &&
                    L.fertig &&
                    L.standFertig &&
                    warm(x)
                );
                // der Leib des Backens geht mit ihm (mittag-heiler): der Ruhende käme sonst erst in seinem Takt an den Ring
                if (!x.backt && !x.nah && !x.amSteuer) this._bewohnerLeibAb(x);
                return x.backt;
            });
        }
        // die Zeilen der Stände nach dem Gang, je Stand ohne seine erste (`standGebacken`: die nächste Zeile unter allen); → ob alle stehen
        const [N, H] = [window.__koerperCore.STAND.zeilen, AnazhRealm._bewohnerStandZahl()];
        const staende = (X, leib, S2) => {
            if (!(X.standGebacken > 0)) X.standGebacken = 1;
            for (; je > 0 && X.standGebacken < H; X.standGebacken++) {
                if (X.standGebacken % N === 0) continue;
                this._bewohnerGangPose(leib, X, X.baender * X.n + X.standGebacken, S2);
                je--;
            }
            return X.standGebacken >= H;
        };
        const Z = S.satz;
        const b = Z && !(Z.fertig && Z.standFertig) && je > 0 ? frei(-1) : null;
        if (b) {
            for (; je > 0 && Z.gebacken < Z.baender * Z.n; je--) this._bewohnerGangPose(b.leib, Z, Z.gebacken++, S);
            if (!Z.fertig && Z.gebacken >= Z.baender * Z.n) {
                Z.tex.needsUpdate = true;
                Z.fertig = fertig = true;
            }
            if (Z.fertig && !Z.standFertig && staende(Z, b.leib, S)) {
                Z.tex.needsUpdate = true;
                Z.standFertig = fertig = true;
            }
        }
        S.gestalten.forEach((G, gi) => {
            const L = G.lage;
            if (!L || (L.fertig && L.standFertig) || je <= 0) return;
            const c = frei(gi);
            if (!c) return;
            for (; je > 0 && L.gebacken < L.baender * L.n; je--) this._bewohnerGangPose(c.leib, L, L.gebacken++, null);
            if (L.gebacken >= L.baender * L.n) L.fertig = true;
            if (L.fertig && !L.standFertig && staende(L, c.leib, null)) L.standFertig = true;
        });
        return fertig;
    }

    // DIE MATRIZEN DES SATZES (nur, wenn sich eine Wahl oder Lage ändert — Lehre 25): dicht ([0, n) lebt) — im Auge (der Leib)
    // jeder Bewohner im Nah-Kreis, den die Nah-Wahl nicht trägt, im Wurf jeder im Nah-Kreis. Je Instanz Phase (`walkPhase` / 2π)
    // und Gewicht (`_gaitW`) seines Gangs — bis der Gang gebacken ist, der Stand — und die Zeilen seiner Palette (`satzZeilen`:
    // seine, darin sein Punkt im Leib-Raum, und die der Vorlage). Die Laufzeit-Marke `_satz` sagt jedem Leser, dass der Leib im
    // Satz gezeichnet wird. Jeder merkt seine Plätze (`satzOrt`: Wurf, Leib); wechselt keine Wahl, rückt der Takt nur die Bewegten
    // (`bewegt`) an ihren Plätzen — der Takt kostet die Gehenden, nie die Menge (mensch.K3: der Morgengang trägt das ganze Dorf).
    _bewohnerSatzSchreiben(S, bewegt = null) {
        const m4 = this._bewohnerM4 || (this._bewohnerM4 = new THREE.Matrix4());
        const v3 = this._bewohnerV3 || (this._bewohnerV3 = new THREE.Vector3());
        const o3 = this._bewohnerO3 || (this._bewohnerO3 = new THREE.Vector3());
        // je Art die Senke des Satzes: der Wurf, der Leib
        const ARTEN = ["wurf", "leib"];
        const Z = S.satz || null;
        // seine Matrix: Ort, Blick, seine Größe gegen die Vorlage (`raumSkala`) und Breite und Tiefe seines Genoms, wie sie die
        // Hüllen seines Leibs tragen (w28-gestalt) — die Sohle bleibt, wo die seines Leibs steht
        // (der Ursprung liegt PLAYER_FOOT_OFFSET × Skala über ihr, `_bewohnerStellen`)
        const lage = (g, b) =>
            m4.compose(
                o3.set(
                    g.position.x,
                    g.position.y + AnazhRealm.PLAYER_FOOT_OFFSET * (b.raumSkala - g.scale.y),
                    g.position.z
                ),
                g.quaternion,
                v3.set(b.raumSkala * b.breite, b.raumSkala, b.raumSkala * b.tiefe)
            );
        // (der Stand: die Zeile seiner Uhr und der Anteil der nächsten, `_bewohnerStandLage` — stand-lebt)
        const setze = (k, i, b) => {
            const st = this._bewohnerStandLage(b, Z);
            AnazhRealm._gangSatzInstanz(
                Z[k],
                i,
                m4,
                Z.fertig ? b.gangBand || 0 : 0, // (das Band seines Gangs, `_bewohnerGang`: der Kranke)
                Z.fertig ? (b.walkPhase || 0) / (2 * Math.PI) : 0,
                Z.fertig ? b._gaitW || 0 : 0,
                b.satzZeilen,
                st[0],
                st[2]
            );
        };
        if (bewegt) {
            if (!Z) return;
            const dran = new Set();
            for (const b of bewegt) {
                if (!b.satzOrt || !b.leib) continue;
                lage(b.leib, b);
                b.satzOrt.forEach((i, j) => {
                    if (i < 0) return;
                    setze(ARTEN[j], i, b);
                    dran.add(Z[ARTEN[j]]);
                });
            }
            for (const m of dran) AnazhRealm._gangSatzNeu(m);
            return;
        }
        const zahl = [0, 0];
        for (const b of S.liste) {
            const g = b.leib;
            if (!g) continue;
            g.userData._satz = !!b.kreis && !b.nah && !!Z;
            b.satzOrt = null;
            if (!b.kreis || !Z) continue;
            lage(g, b);
            b.satzOrt = ARTEN.map((k, j) => {
                if (k === "leib" && b.nah) return -1;
                const i = zahl[j]++;
                setze(k, i, b);
                return i;
            });
        }
        if (Z) ARTEN.forEach((k, j) => AnazhRealm._gangSatzZahl(Z[k], zahl[j]));
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_menge]);
