// DIE PERSPEKTIVE kultur DES KAPITELS mensch (Meisterkarte 2; die Fabrik k2-mensch.js): zehn Leitern, je EINE Probe am Messort
// stadt-voll (295 Häuser, 1092 Bewohner, die Mittelmeer-Stadt der Messbühne). Jede Probe zählt die Welt der Sitzung (ZENSUS: die
// stehenden Häuser des Plans mit Kultur und Rolle, die Bewohner, die Stücke des Kirchhofs und des Markts, jeden Text-Träger der
// Szene, die Werke, die Bühnen, die Lokale) und urteilt ihre Sprossen über DIESELBE Zählung (STUFEN): Umfang gemessen, sonst
// „Umfang nicht erzeugbar“; ein Richter ohne Beobachtbares im Spiel steht als „fehlender Leser“ an der Stelle, an der sein Haken
// sitzen müsste — und misst, sobald die Zählung ihn in der Welt findet (dann ROT, bis die Station neu geschnitten ist, nie still).
// Die Augen-Richter (Prüfer, Blindpaar, Vorbild) schießen das Bild an der Pose des Messorts, sobald die Welt ihren Umfang trägt.
// DER LESER DER SPRACHE ist EINER: die Zählung des DOM von g5.js (ZAEHLE, SPRACHE_SITZUNG — karte2.same.preis.zugang#1), hier
// byte-gleich aus dem argv jener Probe geholt, nie ein Zwilling; ohne sie lädt diese Datei nicht.
"use strict";

const SPRACHE_LESER = (() => {
    const st = require("./g5.js").find((s) => s && s.kriterium === "karte2.same.preis.zugang" && s.probe && Array.isArray(s.probe.befehl));
    const t = st ? String(st.probe.befehl[2]) : "";
    const a = t.indexOf("\nZAEHLE: ");
    const b = t.indexOf(",\nsprachZaehlung: ");
    if (!(a > 0 && b > a))
        throw new Error("k2-mensch-kultur: der Sprach-Leser ZAEHLE (g5.js SPRACHE_SITZUNG) fehlt im argv von karte2.same.preis.zugang — mensch.kultur.sprache misst nie mit einem Zwilling");
    return new Function("return (" + t.slice(a + 9, b) + ");")();
})();

// ───────── DIE ZÄHLUNG DER STADT (Seite der Welt: r = Welt, T = THREE) ─────────
async function zensus(r, T, arg) {
    const st = r.state;
    const FC = globalThis.__fachwerkCore;
    const cam = st.camera;
    const p = st.playerMesh ? st.playerMesh.position : cam.position;
    const alle = [...(r._bewohnerSiedlungen || new Map()).values()].filter((Q) => Q && Q.plan && Array.isArray(Q.plan.slots));
    const ab = (Q) => Math.hypot(Q.ox - p.x, Q.oz - p.z);
    alle.sort((a, b) => ab(a) - ab(b));
    if (!alle.length || ab(alle[0]) > 700) return { fehler: "keine Siedlung binnen 700 m des Spielers (" + alle.length + " geladen)" };
    const S = alle[0];
    // WAS STEHT (scripts/lib/stadt-proben.cjs stadtBreite): der Bau der Welt mit dem Samen des Slots an seinem Ort
    const jeSame = new Map();
    for (const e of st.architectures || [])
        if (e && e.position) {
            const k = e.seed >>> 0;
            if (!jeSame.has(k)) jeSame.set(k, []);
            jeSame.get(k).push(e);
        }
    const stehtIn = (Q) => Q.plan.slots.filter((sl) => (jeSame.get(sl.seed >>> 0) || []).some((e) => Math.hypot(e.position.x - Q.ox - sl.x, e.position.z - Q.oz - sl.z) < 1));
    const zaehle = (xs) => {
        const m = {};
        for (const x of xs) m[x] = (m[x] || 0) + 1;
        return m;
    };
    const rolle = (sl) => (typeof sl.rolle === "string" ? sl.rolle : "wohnhaus");
    const KULT = /^(kirche|kapelle|tempel|schrein|moschee|synagoge|kloster|dom)$/;
    const WOHN = /^(wohnhaus|scheune|wohnturm|patrizierhaus|turm)$/;
    const stehen = new Map(alle.map((Q) => [Q, stehtIn(Q)]));
    const orte = alle.map((Q) => {
        const sl = stehen.get(Q);
        const L = Q.liste || [];
        return {
            name: Q.plan.name || null,
            region: Q.plan.region || null,
            seed: Q.plan.seed >>> 0,
            jahr: Q.plan.jahr,
            groesse: Q.plan.groesse || null,
            staedtisch: !!Q.plan.staedtisch,
            ab: Math.round(ab(Q)),
            slots: Q.plan.slots.length,
            steht: sl.length,
            kulturen: zaehle(sl.map((x) => x.kultur || "?")),
            kultKulturen: [...new Set(sl.filter((x) => KULT.test(rolle(x))).map((x) => x.kultur || "?"))],
            bewohner: L.length,
            personenNamen: L.filter((b) => typeof b.name === "string" && b.name).map((b) => b.name).slice(0, 600),
            technik: Number.isFinite(Q.plan.technik) ? Q.plan.technik : null,
            sprache: Q.plan.sprache != null || Q.plan.verkehrssprache != null,
            kleidung: Q.plan.kleidung ? [Q.plan.kleidung.top, Q.plan.kleidung.bottom, Q.plan.kleidung.shoes].join("/") : null,
            glaube: Q.plan.glaube != null || Q.plan.goetter != null,
            wanderung: Q.plan.wanderung != null,
            sitten: Q.plan.sitten != null,
            kueche: Q.plan.kueche != null || Q.plan.gerichte != null,
            mode: Q.plan.mode != null,
        };
    });
    const steht = stehen.get(S);
    const L = S.liste || [];
    const leiber = L.filter((b) => b.leib).map((b) => b.leib.position);
    const nahS = (x, z, m) => Math.hypot(x - S.ox, z - S.oz) < m;
    // die Stücke des Plans (Kirchhof, Markt, Brunnen) und die Werke der Bildkunst unter den Bauten der Welt
    const stuecke = { grab: 0, stand: 0, brunnen: 0 };
    const graeber = [];
    let kunst = 0;
    const KUNST = /figur|statue|skulptur|wandbild|gemaelde|relief|ornament|denkmal|mosaik|fresko/i;
    for (const e of st.architectures || []) {
        if (!e || !e.position || !nahS(e.position.x, e.position.z, 700)) continue;
        const t = String(e.type || "");
        if (/^grabstein/.test(t)) (stuecke.grab++, graeber.push(e.position));
        else if (/^marktstand/.test(t)) stuecke.stand++;
        else if (/^brunnen/.test(t)) stuecke.brunnen++;
        if (KUNST.test(t)) kunst++;
    }
    // JEDER TEXT-TRÄGER DER SZENE: eine Leinwand-Textur mit Schrift im Namen oder ein Text am Objekt — das Namensschild der
    // Mitspieler (netz-p2p) ist kein Text der Welt
    const TXT = /schild|schrift|text|inschrift|tafel|buch|plakat|zeitung/i;
    const v = new T.Vector3();
    const texte = [];
    let videos = 0; // das bewegte Bild im Bild (eine Video-Textur an einem Objekt der Stadt)
    st.scene.traverse((o) => {
        if (!o.isMesh && !o.isSprite) return;
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        if (ms.some((m) => m && m.map && m.map.isVideoTexture)) videos++;
        if (ms.some((m) => m && m.map && m.map.name === "p2p-namensschild")) return;
        const ud = o.userData || {};
        const tx = ms.map((m) => m && m.map).find((t) => t && t.isCanvasTexture && TXT.test(t.name || ""));
        const wort = typeof ud.text === "string" ? ud.text : typeof ud.schrift === "string" ? ud.schrift : tx ? String((tx.userData && tx.userData.text) || tx.name) : null;
        if (!wort) return;
        o.getWorldPosition(v);
        if (!nahS(v.x, v.z, 700)) return;
        const leuchtet = ms.some((m) => m && m.emissive && m.emissiveIntensity > 0 && m.emissive.r + m.emissive.g + m.emissive.b > 0);
        texte.push({ wort: wort.slice(0, 80), x: v.x, z: v.z, leuchtet, sichtbar: !!o.visible });
    });
    const imGrund = (sl, x, z, m) => {
        const b = sl.obb;
        if (!b) return Math.hypot(x - S.ox - sl.x, z - S.oz - sl.z) < 4 + m;
        const c = Math.cos(b.phi), s = Math.sin(b.phi);
        const dx = x - S.ox - b.cx, dz = z - S.oz - b.cz;
        return Math.abs(dx * c - dz * s) <= b.ex + m && Math.abs(dx * s + dz * c) <= b.ez + m;
    };
    const sonder = steht.filter((sl) => !WOHN.test(rolle(sl)));
    // DIE STÜCKE, DIE DEN ORT AUSWEISEN (ort-ausstattung: Schild, Hauszeichen, Marktkreuz) — was STEHT, nie was der Plan nur trägt:
    // die Stücke des Plans aus dem EINEN Leser der Welt (`_ortStuecke`: am Haus `amHaus` [Stück, Nummer k], frei `liste` bis zur
    // Kappe), je Stück der Bau der Welt mit seinem Bauplan und dem Samen `_ausstattungSame` an seinem Ort (< 1 m), seine Gestalt
    // aus dem Stempel am Eintrag (`studioOv.__gestalt`, den `_foundryGestaltFor` zuerst liest). Das Wort des Schilds liest
    // fachwerk `schildArt` (der Export, den die Welt baut).
    const stueckeAm = {};
    for (const Z of typeof r._ortStuecke === "function" ? r._ortStuecke(S.plan) : []) {
        const xs = Z.amHaus.length ? Z.amHaus : Z.liste.slice(0, Z.kappe || Z.liste.length).map((q, k) => [q, k]);
        stueckeAm[Z.art] = xs.map(([q, k]) => {
            const same = r._ausstattungSame(S.plan, Z.art, k) >>> 0;
            const e = (jeSame.get(same) || []).find((e) => e.type === Z.bauplan && Math.hypot(e.position.x - S.ox - q.x, e.position.z - S.oz - q.z) < 1);
            const g = e && e.studioOv && Number.isInteger(e.studioOv.__gestalt) ? e.studioOv.__gestalt : null;
            return { q, e: e || null, g };
        });
    }
    // LESBAR (Band: Canada DOC 1981 Co24-3-8-705 — die Lettern der Punktschrift brauchen mindestens die Matrix 5 × 7, je Punkt ein
    // Pixel): die Letter des stehenden Schilds (`SCHILD_GESETZ.letterM` × Maß des Eintrags) misst ≥ 7 Pixel der Leinwand des Spiels
    // (Höhe der Zeichenfläche, fov der Kamera) am Stand des Auges vor ihm (`ZEICHEN_POSE.abstandM[0]`, die Regel „zeichen“ von
    // `_ortPose`) — dazu, wie viele es vom Stand der Kamera aus sind
    const AR = r.constructor;
    const SGz = FC && FC.SCHILD_GESETZ;
    const hPx = (st.renderer && st.renderer.domElement && st.renderer.domElement.height) || 0;
    const fovT = Math.tan(((cam.fov || 60) * Math.PI) / 360);
    const lesM = AR.ZEICHEN_POSE && AR.ZEICHEN_POSE.abstandM ? AR.ZEICHEN_POSE.abstandM[0] : NaN;
    const letterPx = (e, d) => (SGz && hPx && d > 0 ? ((SGz.letterM * (e.scale || 1)) / (2 * d * fovT)) * hPx : NaN);
    const schilde = (stueckeAm.schild || []).filter((s) => s.e && s.g != null).map((s) => {
        const a = FC.schildArt(s.g);
        return { slot: s.q.slot, wort: a.wort, form: a.form, px: letterPx(s.e, lesM), pxKamera: letterPx(s.e, Math.hypot(s.e.position.x - cam.position.x, s.e.position.y - cam.position.y, s.e.position.z - cam.position.z)) };
    });
    const schildVon = (sl) => schilde.filter((s) => s.slot === S.plan.slots.indexOf(sl));
    const schildLesbar = (s) => s.px >= 7;
    // DIE WERKE DER BILDKUNST (ort-ausstattung): je stehendes Hauszeichen die Rolle seines Motivs (fachwerk `reliefMass`: die Gestalt
    // g trägt das Motiv der Rolle SCHILD_WORT[(g − 1) mod 19], 20–38 dieselben Bilder neben der Tür — das Wort der Folge aus dem
    // Export `schildArt` der Gestalten 1–19), „in der Welt gefunden“, wo das Haus, an dem es hängt, STEHT und diese Rolle trägt;
    // das Marktkreuz, wo sein Platz Stände trägt. Paare gleicher Werke: zwei Hauszeichen desselben Motivs, zwei Kreuze derselben Gestalt.
    // (die Länge der Folge: die erste Gestalt nach 1, die wieder das Wort der ersten trägt — die Tafel des Gasthauses, 20)
    const nW = FC && FC.schildArt ? [...Array(40).keys()].findIndex((i) => i > 0 && FC.schildArt(i + 1).wort === FC.schildArt(1).wort) : -1;
    const steht1 = new Set(steht);
    const werkeH = (stueckeAm.relief || []).filter((s) => s.e && s.g != null).map((s) => {
        const sl = S.plan.slots[s.q.slot];
        const motiv = nW > 0 ? FC.schildArt(((s.g - 1) % nW) + 1).wort : null;
        return { art: "relief", bild: "relief:" + motiv, gefunden: !!(sl && steht1.has(sl) && rolle(sl) === motiv) };
    });
    const werkeK = (stueckeAm.denkmal || []).filter((s) => s.e).map((s) => ({ art: "denkmal", bild: "denkmal:" + s.g, gefunden: !!(S.plan.staende && S.plan.staende.length) }));
    const werkAlle = [...werkeH, ...werkeK];
    let werkGleich = 0;
    for (let i = 0; i < werkAlle.length; i++) for (let k = i + 1; k < werkAlle.length; k++) if (werkAlle[i].bild === werkAlle[k].bild) werkGleich++;
    const T0 = {
        n: texte.length,
        leuchtet: texte.filter((t) => t.leuchtet).length,
        nahBewohner: texte.filter((t) => leiber.some((q) => Math.hypot(q.x - t.x, q.z - t.z) < 3)).length,
        grab: texte.filter((t) => graeber.some((q) => Math.hypot(q.x - t.x, q.z - t.z) < 1.5)).length,
        haus: texte.filter((t) => steht.some((sl) => imGrund(sl, t.x, t.z, 1))).length,
        woerter: new Set(texte.flatMap((t) => t.wort.toLowerCase().split(/[^a-zäöüß]+/).filter((w) => w.length > 1))).size,
        beispiele: texte.slice(0, 4).map((t) => t.wort),
    };
    const rollen = zaehle(steht.map(rolle));
    const zahlRolle = (re) => Object.keys(rollen).filter((k) => re.test(k)).reduce((a, k) => a + rollen[k], 0);
    const jahre = steht.map((sl) => sl.baujahr).filter((j) => Number.isFinite(j));
    // DIE GRENZE ZWEIER KULTUREN (diffusion): das nächste Paar geladener Orte verschiedener Region binnen 2 km; ein Haus ist gemischt,
    // trägt es eine Kultur außerhalb des Vorrats seiner Region (fachwerk-core REGION_HIST) — der Streifen ist das Drittel jedes Orts
    // zum anderen hin, abseits das ferne Drittel
    let grenze = null;
    if (arg && arg.grenze) {
        const pool = (reg) => new Set(((FC && FC.REGION_HIST && FC.REGION_HIST[reg]) || []).flatMap((e) => e[1]));
        let paar = null, dMin = 2000;
        for (let i = 0; i < alle.length; i++)
            for (let k = i + 1; k < alle.length; k++) {
                const [A, B] = [alle[i], alle[k]];
                const d = Math.hypot(A.ox - B.ox, A.oz - B.oz);
                if (A.plan.region !== B.plan.region && d < dMin) [dMin, paar] = [d, [A, B]];
            }
        const regionen = new Set(alle.filter((Q) => Math.hypot(Q.ox - S.ox, Q.oz - S.oz) < 2000).map((Q) => Q.plan.region)).size;
        grenze = { paar: 0, regionen };
        if (paar) {
            const teil = (A, B) => {
                const ux = (B.ox - A.ox) / dMin, uz = (B.oz - A.oz) / dMin;
                const P = pool(A.plan.region);
                const hs = stehen.get(A).map((sl) => ({ t: sl.x * ux + sl.z * uz, fremd: !P.has(sl.kultur) })).sort((a, b) => b.t - a.t);
                const k = Math.max(1, Math.floor(hs.length / 3));
                return { nah: hs.slice(0, k), fern: hs.slice(-k) };
            };
            const [a, b] = [teil(paar[0], paar[1]), teil(paar[1], paar[0])];
            const anteil = (xs) => (xs.length ? xs.filter((h) => h.fremd).length / xs.length : NaN);
            grenze = { paar: 1, regionen: 2, d: Math.round(dMin), orte: [paar[0].plan.name, paar[1].plan.name], grenze: anteil([...a.nah, ...b.nah]), abseits: anteil([...a.fern, ...b.fern]) };
        }
    }
    const d = new T.Vector3();
    cam.getWorldDirection(d);
    const r2 = (x) => Math.round(x * 100) / 100;
    const kulturenAlle = new Set(orte.flatMap((o) => Object.keys(o.kulturen)));
    return {
        ort: {
            name: S.plan.name || null,
            region: S.plan.region || null,
            seed: S.plan.seed >>> 0,
            jahr: S.plan.jahr,
            groesse: S.plan.groesse || null,
            slots: S.plan.slots.length,
            steht: steht.length,
            kulturen: zaehle(steht.map((sl) => sl.kultur || "?")),
            rollen,
            kult: steht.filter((sl) => KULT.test(rolle(sl))).length,
            kultKulturen: [...new Set(steht.filter((sl) => KULT.test(rolle(sl))).map((sl) => sl.kultur || "?"))],
            sonder: sonder.length,
            // das Schild, das STEHT, an seinem Sonderbau: passend trägt es das Wort der Rolle seines Slots, lesbar misst die Letter ≥ 7 px
            sonderMitSchild: sonder.filter((sl) => schildVon(sl).length > 0).length,
            sonderPassend: sonder.filter((sl) => schildVon(sl).some((s) => s.wort === rolle(sl) && schildLesbar(s))).length,
            sonderWort: sonder.filter((sl) => schildVon(sl).some((s) => s.wort === rolle(sl))).length,
            schildePlan: (stueckeAm.schild || []).length,
            schildeStehen: schilde.length,
            schildPx: schilde.length ? Math.round(Math.min(...schilde.map((s) => s.px)) * 10) / 10 : null,
            schildLesbarKamera: schilde.filter((s) => s.pxKamera >= 7).length,
            ohneSchild: sonder.filter((sl) => !schildVon(sl).length).map(rolle).slice(0, 8),
            jahre: jahre.length ? { von: Math.min(...jahre), bis: Math.max(...jahre) } : null,
            chronik: !!S.plan.chronik,
        },
        orte,
        regionen: new Set(orte.map((o) => o.region)).size,
        kulturenAlle: kulturenAlle.size,
        kulturenGesetz: FC && Array.isArray(FC.KULTNAMES) ? FC.KULTNAMES.length : null,
        haeuserAlle: orte.reduce((a, o) => a + o.steht, 0),
        staedte: orte.filter((o) => o.staedtisch).length,
        trachten: new Set(orte.map((o) => o.kleidung).filter(Boolean)).size,
        bewohner: {
            n: L.length,
            leib: leiber.length,
            namen: L.filter((b) => typeof b.name === "string" && b.name).length,
            gruss: L.filter((b) => b.gruss != null).length,
            nah: leiber.filter((q) => Math.hypot(q.x - p.x, q.z - p.z) < 30).length,
            berufe: Object.keys(zaehle(L.map((b) => b.beruf))).length,
            alle: orte.reduce((a, o) => a + o.bewohner, 0),
        },
        stuecke,
        texte: T0,
        videos,
        kunst,
        werke: { n: werkAlle.length, hauszeichen: werkeH.length, kreuz: werkeK.length, plan: (stueckeAm.relief || []).length + (stueckeAm.denkmal || []).length, gefunden: werkAlle.filter((w) => w.gefunden).length, gleich: werkGleich },
        buehnen: zahlRolle(/buehne|theater|kino|oper|verlag|lichtspiel/),
        wissenArten: [/schule|akademie|universitaet/, /bibliothek|archiv/, /werkstatt/].filter((re) => zahlRolle(re) > 0).length,
        lokale: zahlRolle(/gasthaus|wirtshaus|taverne|schenke|cafe|bar/),
        laeden: stuecke.stand + zahlRolle(/kaufhaus|kontor|laden|krambude/),
        kreaturen: {
            n: (st.creatures || []).length,
            sprache: (st.creatures || []).filter((c) => c && (c.sprache != null || c.zeichen != null)).length,
        },
        grenze,
        pose: { px: r2(cam.position.x), py: r2(cam.position.y), pz: r2(cam.position.z), lx: r2(cam.position.x + d.x * 30), ly: r2(cam.position.y + d.y * 30), lz: r2(cam.position.z + d.z * 30) },
    };
}

// ───────── DER GANG IN DEN KULTBAU (glaube S1; Seite der Welt) ─────────
// Die Stunde des Ritus ist die Stunde, zu der der Tag der Bewohner (`_bewohnerSoll`, koerper-core tagesPlan) die meisten im und am
// Kultbau sieht (Gleichstand: die meisten in ihm); die Uhr springt dorthin (der Sprung von kreatur-proben `uhrAuf`: über die Gegen-Stunde, die
// Ankunft je Takt ohne Zeit), gezählt wird, wo die Leiber STEHEN — im Grundriss eines Kultbaus (oder drinnen, wohnt er dort) und an
// ihm (6 m). Dann je Tag (die Uhr des Gangs, „uhr“ + 1: der Tag der Welt zählt) dieselbe Stunde, bis zu `tage` Tage unter Frist.
// Am Ende die Uhr des Anfangs.
async function ritus(r, T, arg) {
    const st = r.state;
    const p = st.playerMesh ? st.playerMesh.position : st.camera.position;
    const S = [...(r._bewohnerSiedlungen || new Map()).values()]
        .filter((Q) => Q && Q.plan && Array.isArray(Q.liste))
        .sort((a, b) => Math.hypot(a.ox - p.x, a.oz - p.z) - Math.hypot(b.ox - p.x, b.oz - p.z))[0];
    if (!S) return { kult: 0, fehler: "keine Siedlung mit Bewohnern" };
    const seeds0 = new Set((st.architectures || []).filter((e) => e && e.position).map((e) => e.seed >>> 0));
    const KULT = /^(kirche|kapelle|tempel|schrein|moschee|synagoge|kloster|dom)$/;
    const kult = S.plan.slots.filter((sl) => typeof sl.rolle === "string" && KULT.test(sl.rolle) && seeds0.has(sl.seed >>> 0));
    if (!kult.length) return { kult: 0 };
    const seeds = new Set(kult.map((sl) => sl.seed >>> 0));
    const lage = (x, z, m) =>
        kult.some((sl) => {
            const b = sl.obb;
            if (!b) return Math.hypot(x - S.ox - sl.x, z - S.oz - sl.z) < 4 + m;
            const c = Math.cos(b.phi), s = Math.sin(b.phi);
            const dx = x - S.ox - b.cx, dz = z - S.oz - b.cz;
            return Math.abs(dx * c - dz * s) <= b.ex + m && Math.abs(dx * s + dz * c) <= b.ez + m;
        });
    const L = S.liste;
    let best = { h: 0, innen: -1, am: -1 };
    for (let h = 0; h < 24; h += 0.5) {
        let [innen, am] = [0, 0];
        for (const b of L) {
            const s = r._bewohnerSoll(b, h);
            if (s.drinnen ? seeds.has(b.heim) : s.ziel && lage(s.ziel.x, s.ziel.z, 0)) innen++;
            else if (!s.drinnen && s.ziel && lage(s.ziel.x, s.ziel.z, 6)) am++;
        }
        if (innen + am > best.innen + best.am || (innen + am === best.innen + best.am && innen > best.innen)) best = { h, innen, am };
    }
    const leute = (dt) => (r._bewohnerWerkTakt(Infinity), r._tickBewohner(dt));
    const da = () => L.every((b) => b.leib && !b.ankunft);
    const auf = (h) => {
        for (const t of [h + 12, h]) (r._uhrSetzen((t % 24) / 24, "regler"), leute(0));
        const t0 = performance.now();
        while (!da() && performance.now() - t0 < arg.jeMs) leute(0);
        return da();
    };
    const zaehle = () => {
        let [innen, am] = [0, 0];
        for (const b of L) {
            if (!b.leib) continue;
            const { x, z } = b.leib.position;
            if (b.drinnen ? seeds.has(b.heim) : lage(x, z, 0)) innen++;
            else if (!b.drinnen && lage(x, z, 6)) am++;
        }
        return { innen, am };
    };
    const uhr0 = st.timeOfDay;
    const ende = performance.now() + arg.budgetMs;
    const angekommen = auf(best.h);
    const erst = zaehle();
    const tage = [erst.innen + erst.am];
    for (let d = 1; d < arg.tage && performance.now() < ende - 2 * arg.jeMs; d++) {
        r._uhrSetzen(st.timeOfDay + 1, "uhr");
        auf(best.h);
        const c = zaehle();
        tage.push(c.innen + c.am);
    }
    auf(uhr0 * 24);
    return { kult: kult.length, bewohner: L.length, stunde: best.h, sollInnen: best.innen, sollAm: best.am, innen: erst.innen, am: erst.am, angekommen, tage };
}

// ───────── DER GRUSS (verstaendigung S1; Seite der Welt) ─────────
// Die Begegnung, wie mensch.K5 Staffel 1 sie misst (scripts/lib/kreatur-mensch.cjs begegnung): je Kultur der Stadt bis zu
// n/Kulturen Bewohner, die an ihrem Ort stehen; der Spieler tritt auf `abM` quer neben ihn (90° zu seinem Blick, der Stand frei
// von Grundriss), das Auge am Spieler (die Nah-Wahl liest es), dann der Takt der Leute je 1/60 s: geantwortet hat, wessen
// Kopf-Knoten (seine Welt-Matrix) binnen `schritte` Takten auf 10° zum Spieler zeigt — und wann (die Form des Grußes). Am Ende
// Spieler und Auge, wo sie standen.
async function begegnung(r, T, arg) {
    const st = r.state;
    const A = r.constructor;
    const pm = st.playerMesh.position;
    const cam = st.camera;
    const S = [...(r._bewohnerSiedlungen || new Map()).values()]
        .filter((Q) => Q && Q.plan && Array.isArray(Q.liste))
        .sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z))[0];
    if (!S) return { fehler: "keine Siedlung mit Bewohnern" };
    const kultur = new Map(S.plan.slots.map((sl) => [sl.seed >>> 0, sl.kultur || "?"]));
    const [p0, c0, q0] = [pm.clone(), cam.position.clone(), cam.quaternion.clone()];
    const wrap = (a) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
    const offen = (x, z) => r._landAt(x, z) && !["haus", "bau"].includes(r._imGrundriss(x, z, 0.5));
    const leute = (dt) => (r._bewohnerWerkTakt(Infinity), r._tickBewohner(dt));
    const stell = (x, z) => pm.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
    const auge = (x, z) => {
        cam.position.set(pm.x, pm.y + 1.6, pm.z);
        cam.lookAt(x, pm.y + 1.6, z);
        cam.updateMatrixWorld(true);
        r._lodAugeGesetzt();
        r._loopFrustumCulling();
    };
    const je = new Map();
    for (const b of S.liste)
        if (b.leib && b.da && !b.weg && !b.drinnen && !b.amSteuer) {
            const k = kultur.get(b.heim) || "?";
            if (!je.has(k)) je.set(k, []);
            je.get(k).push(b);
        }
    const wahl = [];
    const m = Math.ceil(arg.n / Math.max(1, je.size));
    for (const xs of je.values()) {
        const k = Math.min(m, xs.length);
        for (let j = 0; j < k; j++) wahl.push(xs[Math.floor((j * xs.length) / k)]);
    }
    const aus = [];
    let ohneOrt = 0;
    const dt = 1 / 60;
    try {
        for (const b of wahl) {
            const g = b.leib;
            let ort = null;
            for (const s of [1, -1]) {
                const a = g.rotation.y + (s * Math.PI) / 2;
                const [x, z] = [g.position.x + Math.sin(a) * arg.abM, g.position.z + Math.cos(a) * arg.abM];
                if (!ort && offen(x, z)) ort = { x, z };
            }
            if (!ort) {
                ohneOrt++;
                continue;
            }
            stell(ort.x, ort.z);
            r._spielerLageAlt = null;
            auge(g.position.x, g.position.z);
            let zuS = null;
            for (let i = 0; i < arg.schritte && zuS === null; i++) {
                leute(dt);
                const R = g.userData.rig;
                if (!R || !R.head || !b.nah) continue;
                g.updateMatrixWorld(true);
                const e = R.head.matrixWorld.elements;
                const gier = (Math.abs(wrap(Math.atan2(pm.x - e[12], pm.z - e[14]) - Math.atan2(e[8], e[10]))) * 180) / Math.PI;
                if (gier <= 10) zuS = Math.round((i + 1) * dt * 1000) / 1000;
            }
            aus.push({ k: kultur.get(b.heim) || "?", zuS, nah: !!b.nah });
        }
    } finally {
        pm.copy(p0);
        cam.position.copy(c0);
        cam.quaternion.copy(q0);
        cam.updateMatrixWorld(true);
        r._lodAugeGesetzt();
        r._loopFrustumCulling();
        r._spielerLageAlt = null;
        leute(0);
    }
    return { gewaehlt: wahl.length, ohneOrt, kulturen: je.size, aus };
}

// ───────── DAS URTEIL JE SPROSSE ÜBER DIE ZÄHLUNG (in der Probe, node) ─────────
// d: { n, art: "zahl" | "nicht" | "leser" | "auge", wert(z) → gemessener Umfang, um? (Zahl oder (z) → Zahl; sonst der Umfang der
// Spec), fehlt, wo (leser), da(z) (leser: der Leser steht in der Welt), zahl(z) → { n, werte, beleg }, pose, mass(z) (auge) }
// ───────── DIE NAMEN AM FÄCHER (kultur-aus-klima, Seite der Welt) ─────────
// Am Messort stadt-voll steht EINE Siedlung (die Metropole des Worts „dorf 7 300“): ihre Namen tragen EINE Region, die Zuordnung
// „aus 2 Saaten“ wäre dort nie messbar. Darum nennt die Welt die Namen von `arg.n` Zellen (die Ringe um den Ursprung, wie die
// Kultur-Leiter, stamm/siedlung-ort.js `_autoSettlementCellInfo`): je Zelle der Plan der Gießerei mit dem Auftrag des Spiels
// (`_ortDp`: die Zeit und das Klima ihres Orts; ohne das Raster des Grunds — der Name liest keinen Grund), sein Ortsname (fachwerk
// `ORTSNAME`) und `arg.leute` Bewohner aus dem Leser des Spiels (stamm/siedlung-bewohner.js `_bewohnerLauf` „name“: Vor- und
// Familienname; der Same des Bewohners „Plan-Same:k“, sein Haus k mod Häuser). DER ZEUGE: die Bewohner der geladenen Siedlung, durch
// denselben Ruf mit nichts als ihrem Plan (`{ plan }`) — Name für Name gleich dem Namen, den die Welt ihnen gibt (`b.name`).
// DIE SÄTZE (sprache#2): je Zelle `arg.saetze` Reden aus demselben Leser (`_bewohnerLauf` „rede“, die erste Rede des k-ten Bewohners)
// und die Sprache des Orts (fachwerk `spracheVon(region, same)`: Familie und Blatt — die Gruppe, nie ein Merkmal des Trenners).
// Kennt der Leser das Feld nicht, steht sein Wort wörtlich in `rede` (die Sprosse 2 urteilt es; Namen und Baum messen weiter).
async function namenFaecher(r, T, arg) {
    const zellen = [];
    for (let R = 0; R <= 26 && zellen.length < arg.n; R++)
        for (let cx = -R; cx <= R; cx++)
            for (let cz = -R; cz <= R; cz++) {
                if (Math.max(Math.abs(cx), Math.abs(cz)) !== R || zellen.length >= arg.n) continue;
                const c = r._autoSettlementCellInfo(cx, cz);
                if (c) zellen.push([cx + "," + cz, c]);
            }
    const orte = [], FC = globalThis.__fachwerkCore;
    let rede = null;
    for (const [key, c] of zellen) {
        const dp = r._ortDp(key, c);
        delete dp.ort;
        const P = await r._foundryRequestSettlement(dp);
        if (!P || !Array.isArray(P.slots) || !P.slots.length) return { fehler: "die Gießerei gibt der Zelle " + key + " keinen Plan (_foundryRequestSettlement(_ortDp))" };
        const Q = { plan: P }, nh = P.slots.length, leute = [], saetze = [];
        for (let k = 0; k < arg.leute; k++) leute.push(r._bewohnerLauf(Q, { seed: (P.seed >>> 0) + ":" + k, heim: k % nh, same: k }, "name"));
        for (let k = 0; k < (arg.saetze || 0) && !rede; k++)
            try {
                saetze.push(r._bewohnerLauf(Q, { seed: (P.seed >>> 0) + ":" + k, heim: k % nh, same: k }, "rede", 1));
            } catch (e) {
                rede = String((e && e.message) || e);
            }
        const L = FC && typeof FC.spracheVon === "function" ? FC.spracheVon(P.region, P.seed >>> 0) : null;
        orte.push({ name: P.name || null, region: P.region || null, seed: P.seed >>> 0, zelle: key, personenNamen: leute, saetze: rede ? [] : saetze, sprache: L ? L.region + "|" + L.blatt : null });
    }
    const S = [...(r._bewohnerSiedlungen || new Map()).values()].find((Q) => Q && Q.plan && Array.isArray(Q.liste) && Q.liste.length);
    let gleich = 0, n = 0;
    if (S)
        for (const b of S.liste.slice(0, arg.zeuge)) {
            if (typeof b.name !== "string" || !b.name) continue;
            n++;
            if (r._bewohnerLauf({ plan: S.plan }, b, "name") === b.name) gleich++;
        }
    return { orte, rede, zeuge: { gleich, n, ort: S ? S.plan.name : null } };
}

// ───────── DIE REDE DER MENGE (sprache#2, der Zeuge des Konsums, Seite der Welt) ─────────
// Der Satz des Fächers zählt nur, wenn die Welt ihn SPRICHT: der Klang steht (wie raumSeite, k2-erleben), der Loop des Spiels läuft
// bis `arg.sprecher` Bewohner der geladenen Siedlung eine Rede mit Satz tragen (klang.js `_bewohnerLautTakt`: `_mengeRede` je Sprecher
// Nummer und Satz; höchstens `arg.ms`) — je Sprecher derselbe Ruf `_bewohnerLauf(S, b, "rede", nr)`, Satz für Satz gleich, und die
// Kerne seiner Stimme (`sprachKerne`) aus den Vokalen des Gesetzes seiner Sprache.
async function redeZeuge(r, T, arg) {
    const s = r.state, rend = s.renderer, warte = (ms) => new Promise((f) => setTimeout(f, ms));
    const FC = globalThis.__fachwerkCore;
    const S = [...(r._bewohnerSiedlungen || new Map()).values()].find((Q) => Q && Q.plan && Array.isArray(Q.liste) && Q.liste.length);
    if (!S) return { fehler: "keine geladene Siedlung mit Bewohnern (r._bewohnerSiedlungen)" };
    const war = !!(s.symphony && s.symphony.enabled), t0 = performance.now();
    const mitSatz = () => S.liste.filter((b) => { const z = r._mengeRede && r._mengeRede.get(b); return !!z && typeof z.satz === "string"; }); // prettier-ignore
    const o = { ort: S.plan.name, saetze: 0, sprecher: 0, gleich: 0, fremd: [], beispiel: [], vokaleFremd: 0, ms: 0 };
    try {
        if (!war) r.initSymphony();
        const sy = s.symphony;
        if (sy.ctx && sy.ctx.state !== "running") await sy.ctx.resume();
        if (!sy.enabled || !sy.umwelt) return { fehler: "der Klang steht nicht (enabled " + !!sy.enabled + ", Umwelt " + !!sy.umwelt + ")" };
        rend.setAnimationLoop((t) => r._gameLoopTick(t));
        while (mitSatz().length < arg.sprecher && performance.now() - t0 < arg.ms) await warte(100);
        rend.setAnimationLoop(null);
        o.saetze = (sy.menge && sy.menge.saetze) || 0;
        const vokale = new Set(FC.spracheVon(S.plan.region, S.plan.seed >>> 0).gesetz.vokale.join(""));
        for (const b of mitSatz()) {
            const z = r._mengeRede.get(b);
            o.sprecher++;
            const soll = r._bewohnerLauf(S, b, "rede", z.nr);
            if (soll === z.satz) o.gleich++;
            else if (o.fremd.length < 3) o.fremd.push("„" + z.satz + "“ statt „" + soll + "“");
            if (o.beispiel.length < 3) o.beispiel.push(z.satz);
            for (const k of FC.sprachKerne(z.satz)) for (const c of k) if (!vokale.has(c)) o.vokaleFremd++;
        }
    } finally {
        rend.setAnimationLoop(null);
        if (!war && s.symphony && s.symphony.enabled) r.disposeSymphony();
    }
    o.ms = Math.round(performance.now() - t0);
    return o;
}

// ───────── DER STAMMBAUM AUS DEN WORTLISTEN (sprache#3, kultur-aus-klima, Seite der Welt) ─────────
// Je Familie (fachwerk `SPRACHE_GESETZ`, die Saat einer Region) die Blätter ihres Stammbaums (`SPRACH_BAUM.tiefe`; der Same des Orts
// wählt das Blatt, `spracheVon(region, same).blatt`), je Blatt die Wortliste der Bedeutungen (`SPRACH_BAUM.bedeutungen`) — das Wort,
// das der Ort spricht (`sprachWort`). Der Baum wird GELESEN, nie abgeschrieben: die Kompatibilitäts-Methode (Buneman 1971; Ringe,
// Warnow & Taylor 2002) — je Bedeutung die Klassen gleicher Wörter als Spaltung der Blätter, die häufigsten miteinander verträglichen
// Spaltungen bilden den Baum; Robinson-Foulds (1981) gegen den Baum des Gesetzes (die Knoten der Tiefe 1 … tiefe − 1), normiert auf
// 2(n − 3). U_eff: die verschiedenen Wortlisten. DER ZEUGE: die Orte des Fächers (Namen der Gießerei, `arg.orte`) — ihr
// Bestimmungswort ist ein Wort der Liste ihrer Sprache (`SPRACH_BAUM.bestimmung`), sonst misst der Baum eine Liste, die kein Ort spricht.
async function sprachBaum(r, T, arg) {
    const FC = globalThis.__fachwerkCore,
        SB = FC && FC.SPRACH_BAUM;
    if (!SB || typeof FC.sprachWort !== "function" || !Array.isArray(SB.bestimmung) || !Array.isArray(SB.bedeutungen))
        return { leer: "Sprachen: je Region EINE Silben-Tafel der Ortsnamen, keine Wortliste, keine Familie (fachwerk-core sprachWort / SPRACH_BAUM.bestimmung fehlt)" };
    const N = 1 << SB.tiefe,
        alle = [...Array(N).keys()];
    const kanon = (S) => {
        const M = new Set(S);
        return (M.has(0) ? alle.filter((k) => !M.has(k)) : [...M]).sort((a, b) => a - b).join(",");
    };
    const wahr = new Set();
    for (let t = 1; t < SB.tiefe; t++)
        for (let q = 0; q < 1 << t; q++) {
            const S = alle.filter((x) => x >> (SB.tiefe - t) === q);
            if (S.length > 1 && S.length < N - 1) wahr.add(kanon(S));
        }
    const vertraeglich = (A, B) => {
        const b = new Set(B);
        let ab = 0,
            an = 0;
        for (const x of A) b.has(x) ? ab++ : an++;
        const nb = B.length - ab;
        return !ab || !an || !nb || N - ab - an - nb === 0;
    };
    const rf = [],
        listen = new Set();
    for (const R of Object.keys(FC.SPRACHE_GESETZ)) {
        const blatt = new Array(N).fill(null);
        for (let s = 1; blatt.some((b) => !b) && s < 100000; s++) {
            const L = FC.spracheVon(R, s);
            if (!blatt[L.blatt]) blatt[L.blatt] = L;
        }
        if (blatt.some((b) => !b)) return { leer: "die Familie " + R + " trägt nicht alle " + N + " Blätter (spracheVon(region, same).blatt)" };
        const lex = blatt.map((L) => SB.bedeutungen.map((b) => FC.sprachWort(L, b)));
        lex.forEach((l) => listen.add(R + "|" + l.join(" ")));
        const zahl = new Map();
        for (let i = 0; i < SB.bedeutungen.length; i++) {
            const kl = new Map();
            lex.forEach((l, k) => (kl.has(l[i]) ? kl.get(l[i]).push(k) : kl.set(l[i], [k])));
            for (const S of kl.values()) if (S.length > 1 && S.length < N - 1) zahl.set(kanon(S), (zahl.get(kanon(S)) || 0) + 1);
        }
        const an = [];
        for (const [k] of [...zahl.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))) {
            const S = k.split(",").map(Number);
            if (an.every((a) => vertraeglich(a, S))) an.push(S);
            if (an.length >= N - 3) break;
        }
        const gelesen = new Set(an.map(kanon)),
            gemein = [...wahr].filter((w) => gelesen.has(w)).length;
        rf.push({ R, rf: +((wahr.size - gemein + gelesen.size - gemein) / (2 * (N - 3))).toFixed(3) });
    }
    let gleich = 0,
        n = 0;
    const fremd = [];
    for (const o of arg.orte || []) {
        if (typeof o.name !== "string" || !o.name) continue;
        n++;
        const L = FC.spracheVon(o.region, o.seed),
            w = o.name.toLowerCase();
        if (SB.bestimmung.some((b) => w.startsWith(FC.sprachWort(L, b)))) gleich++;
        else if (fremd.length < 3) fremd.push(o.name + "/" + o.region);
    }
    return { familien: rf.length, ueff: listen.size, blaetter: N, bedeutungen: SB.bedeutungen.length, rf, zeuge: { gleich, n, fremd } };
}

async function stufen(H, K, z, liste) {
    for (const d of liste)
        await K.schritt(d.n, async () => {
            const sp = K.SPEC.sprossen[d.n] || {};
            const um = typeof d.um === "function" ? d.um(z) : d.um != null ? d.um : sp.umfang ? sp.umfang.soll : 1;
            const n = d.wert(z);
            if (d.art === "leser" && !d.da(z)) return K.leser(d.n, { fehlt: d.fehlt, wo: d.wo, n });
            if ((d.art === "nicht" || d.art === "auge") && !(n >= um)) return K.nicht(d.n, { n, fehlt: d.fehlt + " (gemessen " + n + " < " + um + ")" });
            // DIE POSE aus der Station (SPEC.sprossen[n].auge.pose, EINE Quelle): bis pm-frist-messort las jeder Rumpf die Konstante POSE —
            // dieser Datei, die er im eigenen Prozess nie kennt: „ReferenceError: POSE is not defined“ an jeder
            // Probe mit einer Augen-Sprosse (sprache, schrift, glaube, gestalt, …), verdeckt von der Frist im Umstellen
            if (d.art === "auge") {
                const b = await K.bild(d.n, z.pose);
                return K.auge(d.n, { bild: b.datei, pose: (d.pose || (sp.auge && sp.auge.pose) || "die Pose fehlt in der Station") + " · Kamera " + [z.pose.px, z.pose.py, z.pose.pz].join("/"), mass: d.mass ? d.mass(z) : "Umfang " + n });
            }
            const o = d.zahl ? await d.zahl(z) : { n, werte: {} };
            return K.zahl(d.n, { taeter: "der Leser steht in der Welt (" + (d.wo || "Umfang " + n) + "), die Probe misst ihn noch nicht — die Station neu schneiden", ...o });
        });
}

const POSE = "stadt-voll · der Platz am Markt (Messort-Pose ortPose „platz“), Ego, die Kamera des Spiels nach dem Umstellen";
const ORT = ["fachwerk-core.js", "koerper-core.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-ort.js", "spec/profiband/haushalt.json"];
const KARTE = "[linse-gpu] amd/rdna-3 (Probe)";
const mut = (leiter, n, s) => ({ leiter, adapter: KARTE, sprossen: { [n]: s } });

module.exports = (F) => [
    // ═════ SPRACHE ═════
    F.leiter("mensch.kultur.sprache", {
        sek: 45,
        pfad: [...ORT, "stamm/feld-leben.js", "index.html", "gelaende-core.js", "stamm/klang.js", "klang-core.js"],
        seite: { ZENSUS: zensus, STUFEN: stufen, ZAEHLE: SPRACHE_LESER, NAMEN: namenFaecher, BAUM: sprachBaum, REDE: redeZeuge },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            // die Zeilen, die der Spieler liest (g5 ZAEHLE): welcher Name der Welt steht im Bild
            const dom = await K.welt("return (" + H.seite.ZAEHLE + ")(false);", 30000);
            const hart = (dom && Array.isArray(dom.hart) && dom.hart) || [];
            z.imBild = z.orte.filter((o) => o.name && hart.some((h) => h.includes(o.name))).length;
            H.zeile("Sprache: " + z.orte.length + " Orte (" + z.orte.map((o) => o.name + "/" + o.region).join(", ") + "), Namen im DOM " + z.imBild + " von " + ((dom && dom.zeilen) || 0) + " Zeilen, Personennamen " + z.bewohner.namen + " von " + z.bewohner.n);
            // DIE NAMEN AM FÄCHER (kultur-aus-klima): 32 Zellen der Welt, je Ortsname und 20 Bewohner — der Zeuge verlangt, dass der Ruf
            // des Fächers die Namen der geladenen Siedlung Name für Name trifft (sonst misst der Fächer einen Zwilling)
            const F = await K.welt("return await (" + H.seite.NAMEN + ")(r, T, " + JSON.stringify({ n: 32, leute: 20, zeuge: 50, saetze: 20 }) + ");", 30000);
            if (!F || F.fehler) throw new Error("die Namen am Fächer: " + ((F && F.fehler) || "ohne Antwort"));
            if (!(F.zeuge.n >= 20 && F.zeuge.gleich === F.zeuge.n))
                throw new Error("der Zeuge der Namen: der Ruf des Fächers trifft " + F.zeuge.gleich + " von " + F.zeuge.n + " Namen der Siedlung „" + F.zeuge.ort + "“ (Soll alle, ≥ 20) — der Fächer misst einen Zwilling");
            z.faecher = F.orte;
            H.zeile("Namen am Fächer: " + F.orte.length + " Zellen (" + [...new Set(F.orte.map((o) => o.region))].join("/") + "), Zeuge " + F.zeuge.gleich + " von " + F.zeuge.n + " Namen der Siedlung " + F.zeuge.ort + " gleich");
            const namen = (z) => {
                const O = [...z.orte, ...(z.faecher || [])];
                return [...O.filter((o) => o.name).map((o) => ({ w: o.name, s: o.region })), ...O.flatMap((o) => o.personenNamen.map((w) => ({ w, s: o.region })))];
            };
            // DIE ZUORDNUNG (S1): je Name die Saat (die Sprache seiner Region), deren Zweier-Laute ihn am besten tragen — ohne ihn selbst
            const zuordnung = (z) => {
                const L = namen(z);
                const bi = (w) => {
                    const t = "^" + String(w).toLowerCase() + "$";
                    const o = [];
                    for (let i = 0; i + 1 < t.length; i++) o.push(t.slice(i, i + 2));
                    return o;
                };
                const saaten = [...new Set(L.map((x) => x.s))];
                const tafel = new Map(saaten.map((s) => [s, new Map()]));
                const summe = new Map(saaten.map((s) => [s, 0]));
                const B = L.map((x) => bi(x.w));
                L.forEach((x, i) => {
                    const m = tafel.get(x.s);
                    for (const g of B[i]) m.set(g, (m.get(g) || 0) + 1);
                    summe.set(x.s, summe.get(x.s) + B[i].length);
                });
                let ok = 0;
                L.forEach((x, i) => {
                    const eigen = new Map();
                    for (const g of B[i]) eigen.set(g, (eigen.get(g) || 0) + 1);
                    let [best, bw] = [null, -Infinity];
                    for (const s of saaten) {
                        const m = tafel.get(s);
                        const selbst = s === x.s;
                        const tot = summe.get(s) - (selbst ? B[i].length : 0);
                        let w = 0;
                        for (const g of B[i]) w += Math.log(((m.get(g) || 0) - (selbst ? eigen.get(g) : 0) + 1) / (tot + 900));
                        if (w > bw) [best, bw] = [s, w];
                    }
                    if (best === x.s) ok++;
                });
                return { n: L.length, werte: { zugeordnet: L.length ? ok / L.length : NaN, saaten: saaten.length }, beleg: "Saaten " + saaten.join("/"), taeter: "die Namen der Bewohner (stamm/siedlung-bewohner.js) und der Orte (fachwerk-core ORTSNAME)" };
            };
            const sprachen = (z) => z.regionen;
            // DIE SÄTZE GETRENNT (sprache#2): je Sprache des Fächers (die Gruppe aus `spracheVon`) die 20 Sätze ihres ersten Orts — der
            // Trenner sieht NUR die Sätze: Cavnar & Trenkle (1994, „N-Gram-Based Text Categorization“, SDAIR-94) — Zeichen-N-Gramme
            // N = 1 … 5 der Wörter (nur Buchstaben, mit Leerzeichen gepolstert), das Rang-Profil der häufigsten P = 400, der Abstand
            // „out-of-place“ (fehlt ein Gramm: P). Hälfte gegen Hälfte: die Sätze 1–10 einer Sprache als EIN Dokument gegen die Profile der
            // Sätze 11–20 jeder Sprache, und umgekehrt; getrennt = der Anteil der Dokumente, deren nächstes Profil ihr eigenes ist.
            // U_eff: die Sprachen mit ≥ 20 Sätzen. Das Band der Quelle (Table 2): Dokumente ≤ 300 Bytes, Profil 400: 98,3 % richtig.
            const ct = { P: 400, N: 5, saetze: 20 };
            const profil = (texte) => {
                const m = new Map();
                for (const t of texte)
                    for (const w of String(t).toLowerCase().split(/[^\p{L}]+/u).filter(Boolean)) {
                        const s = "_" + w + "_".repeat(ct.N - 1);
                        for (let n = 1; n <= ct.N; n++)
                            for (let i = 0; i + n <= s.length; i++) {
                                const g = s.slice(i, i + n);
                                if (!/^_+$/.test(g)) m.set(g, (m.get(g) || 0) + 1);
                            }
                    }
                return new Map([...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, ct.P).map(([g], i) => [g, i]));
            };
            const abstand = (doc, kat) => {
                let d = 0;
                for (const [g, i] of doc) d += kat.has(g) ? Math.abs(kat.get(g) - i) : ct.P;
                return d;
            };
            const trennung = (z) => {
                const je = new Map();
                for (const o of z.faecher || []) if (o.sprache && o.saetze.length >= ct.saetze && !je.has(o.sprache)) je.set(o.sprache, o.saetze.slice(0, ct.saetze));
                const K2 = [...je.keys()], h = ct.saetze / 2;
                let ok = 0, n = 0;
                for (const [von, gegen] of [[0, h], [h, 0]]) {
                    const prof = new Map(K2.map((k) => [k, profil(je.get(k).slice(gegen, gegen + h))]));
                    for (const k of K2) {
                        const doc = profil(je.get(k).slice(von, von + h));
                        let [best, bd] = [null, Infinity];
                        for (const j of K2) {
                            const d = abstand(doc, prof.get(j));
                            if (d < bd) [best, bd] = [j, d];
                        }
                        n++;
                        if (best === k) ok++;
                    }
                }
                const fam = [...new Set(K2.map((k) => k.split("|")[0]))];
                return {
                    n: K2.length,
                    werte: { getrennt: n ? ok / n : NaN, saetze: K2.length ? Math.min(...K2.map((k) => je.get(k).length)) : 0 },
                    beleg: K2.length + " Sprachen aus " + fam.length + " Familien (" + fam.join("/") + ") · " + ok + " von " + n + " Hälften richtig (C&T N 1–5, P 400) · die Rede der Menge: " + z.rede.gleich + " von " + z.rede.sprecher + " Sprechern sprechen den Satz des Lesers (" + z.rede.saetze + " Sätze, " + z.rede.ms + " ms) · „" + z.rede.beispiel.join("“ · „") + "“",
                    taeter: "fachwerk-core.js sprachSatz (der Satz aus Laut, Silbe und Wortschatz der Sprache) · stamm/siedlung-bewohner.js _bewohnerLauf „rede“",
                };
            };
            // DER ZEUGE DES KONSUMS (sprache#2): spricht die Welt den Satz des Lesers nicht, misst der Fächer einen Satz, den keiner sagt
            const ZEUGE_REDE = { sprecher: 5, ms: 8000 };
            z.rede = F.rede ? { leer: "der Leser der Rede: " + F.rede } : await K.welt("return await (" + H.seite.REDE + ")(r, T, " + JSON.stringify(ZEUGE_REDE) + ");", 30000);
            if (!z.rede || z.rede.fehler) z.rede = { leer: "die Rede der Menge: " + ((z.rede && z.rede.fehler) || "ohne Antwort") };
            else if (!z.rede.leer && !(z.rede.sprecher >= ZEUGE_REDE.sprecher && z.rede.gleich === z.rede.sprecher && z.rede.vokaleFremd === 0))
                z.rede.leer = "die Rede der Menge (klang.js _bewohnerLautTakt) spricht nicht den Satz des Lesers: " + z.rede.gleich + " von " + z.rede.sprecher + " Sprechern gleich (Soll alle, ≥ " + ZEUGE_REDE.sprecher + "), " + z.rede.vokaleFremd + " Kerne fremder Vokale" + (z.rede.fremd.length ? " — " + z.rede.fremd.join(" · ") : "");
            H.zeile("Rede: " + (z.rede.leer || z.rede.gleich + " von " + z.rede.sprecher + " Sprechern der Siedlung " + z.rede.ort + " sprechen den Satz des Lesers (" + z.rede.ms + " ms)") + " · Sätze am Fächer " + z.faecher.reduce((a, o) => a + o.saetze.length, 0) + " in " + new Set(z.faecher.map((o) => o.sprache)).size + " Sprachen");
            // DER STAMMBAUM AUS DEN WORTLISTEN (sprache#3, kultur-aus-klima): der Zeuge sind die Orte des Fächers — ihr Name liest die Liste
            const B = await K.welt("return await (" + H.seite.BAUM + ")(r, T, " + JSON.stringify({ orte: F.orte.map((o) => ({ name: o.name, region: o.region, seed: o.seed })) }) + ");", 30000);
            if (!B) throw new Error("der Stammbaum der Sprachen: ohne Antwort");
            if (!B.leer && !(B.zeuge.n >= 20 && B.zeuge.gleich === B.zeuge.n))
                throw new Error("der Zeuge des Stammbaums: " + B.zeuge.gleich + " von " + B.zeuge.n + " Ortsnamen des Fächers tragen ein Wort der Liste ihrer Sprache (Soll alle, ≥ 20; fremd " + B.zeuge.fremd.join(", ") + ") — der Baum misst eine Liste, die kein Ort spricht");
            z.baum = B;
            if (!B.leer) H.zeile("Stammbaum: " + B.familien + " Familien × " + B.blaetter + " Blätter × " + B.bedeutungen + " Bedeutungen, U_eff " + B.ueff + ", RF " + B.rf.map((x) => x.R + " " + x.rf).join(" · ") + ", Zeuge " + B.zeuge.gleich + " von " + B.zeuge.n + " Ortsnamen");
            const baum = (z) => {
                const rf = z.baum.rf.map((x) => x.rf).sort((a, b) => a - b);
                return {
                    n: z.baum.ueff,
                    werte: { rf: rf.length ? rf[Math.floor(rf.length / 2)] : NaN, anteil: rf.length ? rf.filter((x) => x <= 0.3).length / rf.length : NaN, familien: z.baum.familien },
                    beleg: "RF je Familie " + z.baum.rf.map((x) => x.R + " " + x.rf).join(" · ") + " (Median gemeldet) · " + z.baum.bedeutungen + " Bedeutungen je Liste · Zeuge " + z.baum.zeuge.gleich + " von " + z.baum.zeuge.n + " Ortsnamen",
                    taeter: "fachwerk-core.js spracheVon / sprachWort (die Lautgesetze je Knoten, der Ersatz der Wortliste)",
                };
            };
            await H.seite.STUFEN(H, K, z, [
                { n: 1, art: "leser", wert: (z) => z.imBild + z.bewohner.namen, da: (z) => z.orte.some((o) => o.personenNamen.length > 0), zahl: zuordnung, wo: "stamm/siedlung-bewohner.js:887", fehlt: "Personennamen: kein Bewohner trägt einen Namen (der Satz des Bewohners ohne name); die Welt nennt nur den Ortsnamen je Siedlung (ORTSNAME)" },
                z.rede.leer
                    ? { n: 2, art: "leser", wert: () => 0, da: () => false, wo: "stamm/siedlung-bewohner.js _bewohnerLauf „rede“ · stamm/klang.js _bewohnerLautTakt", fehlt: "kein Bewohner spricht einen Satz seiner Sprache — " + z.rede.leer }
                    : { n: 2, art: "zahl", wert: (z) => trennung(z).n, zahl: trennung, wo: "fachwerk-core.js sprachSatz · stamm/siedlung-bewohner.js _bewohnerLauf „rede“" },
                z.baum.leer ? { n: 3, art: "nicht", wert: () => 0, fehlt: z.baum.leer } : { n: 3, art: "zahl", wert: (z) => z.baum.ueff, zahl: baum, wo: "fachwerk-core.js spracheVon · sprachWort" },
                { n: 4, art: "nicht", wert: sprachen, fehlt: "Sprachen mit Dialekt-Kontinuum: die Silben-Tafel einer Region kennt keinen Dialekt" },
                { n: 5, art: "auge", um: 7000, wert: sprachen, fehlt: "hörbare Sprachen: kein Laut einer Sprache in der Welt" },
                { n: 6, art: "nicht", wert: sprachen, fehlt: "Sprachstufen über Epochen: die Silben-Tafel ist zeitlos (dieselbe in jedem Jahr)" },
                { n: 7, art: "nicht", wert: sprachen, fehlt: "Sprachen über Planeten und fremde Medien: eine Welt, keine fremde Art spricht" },
            ]);
        },
        sprossen: {
            1: { umfang: { soll: 100, wort: "Namen (Orts- und Personennamen) aus 2 Saaten" }, masse: [{ key: "zugeordnet", wort: "Namen richtig zugeordnet", soll: 0.9, richtung: "≥" }, { key: "saaten", wort: "Saaten der Namen", soll: 2, richtung: "≥" }], erwartet: "leser", fehlt: "Personennamen: kein Bewohner trägt einen Namen", wo: "stamm/siedlung-bewohner.js:887" },
            2: { umfang: { soll: 10, wort: "Sprachen (U_eff)" }, masse: [{ key: "getrennt", wort: "Sprachen an Sätzen getrennt", soll: 0.85, richtung: "≥" }, { key: "saetze", wort: "Sätze", soll: 20, richtung: "≥" }] },
            3: { umfang: { soll: 100, wort: "Sprachen (U_eff)" }, masse: [{ key: "rf", wort: "Robinson-Foulds des Stammbaums", soll: 0.3, richtung: "≤" }, { key: "anteil", wort: "Anteil der Bäume mit RF ≤ 0,3", soll: 0.7, richtung: "≥" }, { key: "familien", wort: "Sprachfamilien", soll: 5, richtung: "≥" }] },
            4: { umfang: { soll: 1000, wort: "Sprachen (U_eff) mit Dialekt-Kontinua" }, masse: [{ key: "kl", wort: "KL der Laut-Verteilung", soll: 0.2, richtung: "≤" }, { key: "isoglossen", wort: "Isoglossen auf Barrieren", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "Dialekt-Kontinua: keine" },
            5: { auge: { pose: POSE, vorbild: "Tonaufnahme einer realen, den Hörern unbekannten Sprache (Linguisten-Blindtest 2AFC ≤ 60 %); Satz ↔ Handlung ≥ 80 %" }, erwartet: "nicht", fehlt: "hörbare Sprachen: kein Laut einer Sprache" },
            6: { umfang: { soll: 100000, wort: "Sprachstufen über Epochen" }, masse: [{ key: "swadesh", wort: "Swadesh-Retention je 1 000 J", von: 0.7, bis: 0.86 }, { key: "ursprache", wort: "Ursprache rekonstruiert", soll: 0.6, richtung: "≥" }], erwartet: "nicht", fehlt: "Sprachstufen: die Silben-Tafel ist zeitlos" },
            7: { umfang: { soll: 1000000, wort: "Sprachen über Planeten" }, masse: [{ key: "treffen", wort: "Treffen am genannten Ort", soll: 0.8, richtung: "≥" }, { key: "zipf", wort: "Zipf-Exponent", von: 0.8, bis: 1.2 }], erwartet: "nicht", fehlt: "Sprachen über Planeten: eine Welt" },
        },
        proben: {
            1: [{ name: "die Attrappe: hundert Namen, alle aus EINER Saat", j: mut("mensch.kultur.sprache", 1, { art: "zahl", n: 100, werte: { zugeordnet: 0.97, saaten: 1 } }), gruen: false, zahl: /ROT an Saaten der Namen / }],
            2: [
                { name: "die Attrappe: die Menge spricht Vokale aus EINER Tafel — jede Stadt klingt gleich (getrennt beim Zufall)", j: mut("mensch.kultur.sprache", 2, { art: "zahl", n: 24, werte: { getrennt: 0.04, saetze: 20 } }), gruen: false, zahl: /ROT an Sprachen an Sätzen getrennt / },
                { name: "die Attrappe: neun Sprachen, sauber getrennt (U_eff unter 10)", j: mut("mensch.kultur.sprache", 2, { art: "zahl", n: 9, werte: { getrennt: 1, saetze: 20 } }), gruen: false },
                { name: "die Sätze der Sprachen am Fächer (U_eff ≥ 10, getrennt ≥ 0,85)", j: mut("mensch.kultur.sprache", 2, { art: "zahl", n: 24, werte: { getrennt: 0.96, saetze: 20 } }), gruen: true },
            ],
            3: [
                { name: "die Attrappe: Wortlisten nur aus Lautgesetzen, kein Ersatz (RF 0,53–0,71, kein Baum gelesen)", j: mut("mensch.kultur.sprache", 3, { art: "zahl", n: 191, werte: { rf: 0.6, anteil: 0, familien: 6 } }), gruen: false, zahl: /ROT an Robinson-Foulds des Stammbaums / },
                { name: "der Stammbaum aus den Wortlisten (6 Familien, RF ≤ 0,21)", j: mut("mensch.kultur.sprache", 3, { art: "zahl", n: 192, werte: { rf: 0.12, anteil: 1, familien: 6 } }), gruen: true },
            ],
        },
    }),

    // ═════ SCHRIFT ═════
    F.leiter("mensch.kultur.schrift", {
        sek: 45,
        pfad: ORT,
        seite: { ZENSUS: zensus, STUFEN: stufen },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Schrift: " + z.texte.n + " Text-Träger (" + z.texte.leuchtet + " leuchten, " + z.texte.haus + " an Hauswänden, " + z.texte.grab + " an Gräbern), " + z.ort.sonder + " Sonderbauten, " + z.stuecke.grab + " Grabsteine");
            const traeger = (z) => z.texte.n;
            await H.seite.STUFEN(H, K, z, [
                {
                    n: 1, art: "leser", wert: (z) => z.ort.sonder, da: (z) => z.ort.sonderMitSchild > 0, wo: "stamm/siedlung-ort.js _hausStueckSetzen · fachwerk-core.js ortAusstattung",
                    fehlt: "kein Sonderbau trägt ein stehendes Schild: kein Bau `schild_dorf` mit dem Samen seines Stücks steht an der Tür-Wand",
                    // je Sonderbau, der STEHT: das Schild, das an ihm steht (Bau der Welt, Same, Ort), sein Wort (fachwerk schildArt) gegen die
                    // Rolle seines Slots, die Letter ≥ 7 px am Stand des Auges — der Anteil über ALLE stehenden Sonderbauten
                    zahl: (z) => ({
                        n: z.ort.sonder,
                        werte: { anteil: z.ort.sonder ? z.ort.sonderPassend / z.ort.sonder : NaN },
                        beleg: "Sonderbauten " + z.ort.sonder + " · mit stehendem Schild " + z.ort.sonderMitSchild + " · Wort der Rolle " + z.ort.sonderWort + " · passend und lesbar " + z.ort.sonderPassend + " · Schilde im Plan " + z.ort.schildePlan + ", stehend " + z.ort.schildeStehen + " · kleinste Letter " + z.ort.schildPx + " px am Stand des Auges, lesbar vom Stand der Kamera " + z.ort.schildLesbarKamera + " · ohne Schild " + JSON.stringify(z.ort.ohneSchild),
                        taeter: "fachwerk-core.js ortAusstattung (amTuerWand: wo die Wand das Brett nicht trägt, hängt kein Schild) · stamm/siedlung-ort.js _hausStueckSetzen",
                    }),
                },
                { n: 2, art: "nicht", wert: (z) => z.stuecke.grab, fehlt: "Grabsteine: der Kirchhof der Stadt trägt nur seine Lose (fachwerk-core STADT_GRAMMATIK kirchhof), keine Tafel mit Schrift" },
                { n: 3, art: "leser", wert: traeger, da: (z) => z.texte.haus > 0, wo: "fachwerk-core.js:4320", fehlt: "keine Hauswand trägt Schrift: die Viertel der Stadt-Grammatik nennen Gewerbe, kein Schild nennt es" },
                { n: 4, art: "auge", um: 100000, wert: (z) => z.texte.leuchtet, fehlt: "leuchtende Schilder: keines in der Stadt", mass: (z) => "leuchtende Schilder " + z.texte.leuchtet + " · Schrift-Träger " + z.texte.n },
                { n: 5, art: "auge", um: 100, wert: traeger, fehlt: "Schrift-Funde (Typus, Träger, Epoche): kein Text-Träger in der Welt" },
                { n: 6, art: "leser", wert: traeger, da: (z) => z.texte.n > 0, wo: "fachwerk-core.js:4509", fehlt: "kein lesbarer Text: die Chronik des Orts (Jahre, Leute, Wohl) steht in keinem Text der Welt" },
            ]);
        },
        sprossen: {
            1: { umfang: null, masse: [{ key: "anteil", wort: "Sonderbauten mit lesbarem, passendem Schild", soll: 0.9, richtung: "≥" }] },
            2: { umfang: { soll: 500, wort: "Grabsteine" }, masse: [{ key: "ocr", wort: "OCR liest zu den Akten zurück", soll: 0.8, richtung: "≥" }, { key: "typen", wort: "Schrift-Typen (U_eff)", soll: 10, richtung: "≥" }], erwartet: "nicht", fehlt: "Grabsteine: ≤ 36 Lose des Kirchhofs, keine Schrift" },
            3: { umfang: { soll: 100, wort: "Schrift-Typen an jeder Hauswand" }, masse: [{ key: "pixel", wort: "Text-Pixel-Anteil gegen Foto (Abweichung)", soll: 0.25, richtung: "≤" }, { key: "gewerbe", wort: "Schilder nennen das Gewerbe", soll: 0.9, richtung: "≥" }], erwartet: "leser", fehlt: "keine Hauswand trägt Schrift", wo: "fachwerk-core.js:4320" },
            4: { auge: { pose: POSE, vorbild: "Shinjuku (Kabukichō) bei Nacht: Leuchtdichte und Schriftdichte je Straßenzug, ≥ 20 Schriften im Viertel" }, erwartet: "nicht", fehlt: "leuchtende Schilder: keines" },
            5: { auge: { pose: POSE, vorbild: "reale Schrift-Funde je Epoche und Planet (Inschriften-Kataloge: Typus, Träger, Epoche), Prüfer N = 100, plausibel ≥ 85 %" }, erwartet: "nicht", fehlt: "Schrift-Funde: kein Text-Träger" },
            6: { umfang: { soll: 200, wort: "lesbare Texte" }, masse: [{ key: "widerspruchsfrei", wort: "Texte widerspruchsfrei", soll: 0.9, richtung: "≥" }, { key: "ereignis", wort: "Texte mit Verweis auf ein Ereignis", soll: 0.5, richtung: "≥" }], erwartet: "leser", fehlt: "kein lesbarer Text", wo: "fachwerk-core.js:4509" },
        },
        proben: {
            1: [{ name: "die Attrappe: Schilder ohne das Gewerbe ihres Hauses", j: mut("mensch.kultur.schrift", 1, { art: "zahl", n: 40, werte: { anteil: 0.5 } }), gruen: false, zahl: /ROT an Sonderbauten mit lesbarem, passendem Schild / },
                { name: "das Schild nur im Plan: 69 Sonderbauten, keines steht an seiner Tür-Wand", j: mut("mensch.kultur.schrift", 1, { art: "zahl", n: 69, werte: { anteil: 0 } }), gruen: false, zahl: /ROT an Sonderbauten mit lesbarem, passendem Schild 0 / },
                { name: "die Letter unter 7 Pixeln (kein Schild lesbar, kein Anteil)", j: mut("mensch.kultur.schrift", 1, { art: "zahl", n: 69, werte: { anteil: null } }), gruen: false, zahl: /ROT an Sonderbauten mit lesbarem, passendem Schild — verfehlt/ },
            ],
        },
    }),

    // ═════ GLAUBE ═════
    F.leiter("mensch.kultur.glaube", {
        sek: 60,
        mutiert: true,
        pfad: [...ORT, "stamm/bild-himmel.js"],
        seite: { ZENSUS: zensus, STUFEN: stufen, RITUS: ritus },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Glaube: " + z.ort.kult + " Kultbauten (" + z.ort.kultKulturen.join("/") + "), " + z.stuecke.grab + " Gräber, Baujahre " + JSON.stringify(z.ort.jahre));
            const glauben = (z) => new Set(z.orte.flatMap((o) => o.kultKulturen)).size;
            // DER RITUS (S1): wer zur Stunde des Kultbaus in ihm steht, und dieselbe Stunde über die Tage (der Festtag)
            const ritusZahl = async (z) => {
                const budget = Math.max(5000, (H.rest() - 14) * 1000);
                const R = await K.welt("return await (" + H.seite.RITUS + ")(r, T, " + JSON.stringify({ tage: 7, jeMs: 4000, budgetMs: budget }) + ");", budget + 15000);
                if (!R || !R.kult) return { n: 0, werte: {}, taeter: "kein Kultbau steht in der Stadt (fachwerk-core kirche)" + (R && R.fehler ? " — " + R.fehler : "") };
                H.zeile("Ritus: Stunde " + R.stunde + " · im Kultbau " + R.innen + " · an ihm " + R.am + " von " + R.bewohner + " · Tage " + R.tage.join("/") + (R.angekommen ? "" : " · nicht alle angekommen"));
                const t = R.tage.slice().sort((a, b) => a - b);
                const werktag = Math.max(1, t[Math.floor((t.length - 1) / 2)]);
                return {
                    n: R.kult,
                    werte: { imKultbau: R.bewohner ? R.innen / R.bewohner : NaN, fest: t.length >= 2 ? t[t.length - 1] / werktag : NaN },
                    beleg: "Stunde " + R.stunde + " h · im Kultbau " + R.innen + " · an ihm " + R.am + " · Soll des Tags " + R.sollInnen + "/" + R.sollAm + " · " + R.tage.length + " Tage " + R.tage.join("/") + " · Gläubige = alle " + R.bewohner + " Bewohner (kein Bekenntnis am Bewohner)",
                    taeter: "der Tag der Bewohner (koerper-core tagesPlan) kennt keinen Gang in den Kultbau und keinen Festtag",
                };
            };
            await H.seite.STUFEN(H, K, z, [
                { n: 1, art: "zahl", wert: (z) => z.ort.kult, zahl: ritusZahl },
                { n: 2, art: "auge", um: 10, wert: glauben, fehlt: "Glauben: die Kultbauten der Welt tragen eine Rolle (kirche/kapelle), kein Bekenntnis" },
                { n: 3, art: "nicht", wert: (z) => z.stuecke.grab, fehlt: "Gräber je Stadt: der Kirchhof trägt nur seine Lose (fachwerk-core STADT_GRAMMATIK kirchhof)" },
                { n: 4, art: "nicht", wert: glauben, fehlt: "Glauben mit heiliger Landschaft: kein Kultort außerhalb der Siedlung, kein Pilger" },
                { n: 5, art: "nicht", wert: glauben, fehlt: "Glaubens-Richtungen: keine Spaltung, kein Synkretismus" },
                { n: 6, art: "leser", wert: glauben, da: (z) => z.orte.some((o) => o.glaube), wo: "fachwerk-core.js:4462", fehlt: "kein Heiliges: die Kirche ist ein Bau der Marktkultur ohne Gott, kein Hauptgott liest ein Phänomen der Saat" },
            ]);
        },
        sprossen: {
            1: { umfang: { soll: 1, wort: "Glaube mit Kalender (sein Kultbau steht)" }, masse: [{ key: "imKultbau", wort: "Gläubige im Kultbau", soll: 0.3, richtung: "≥" }, { key: "fest", wort: "Festtag ÷ Werktag", soll: 3, richtung: "≥" }] },
            2: { auge: { pose: POSE, vorbild: "reale Kultbauten der Glauben (Ostung der Kirche, Qibla der Moschee, Ausrichtung ≤ 5° von der Regel), Blindpaar getrennt ≥ 80 %" }, erwartet: "nicht", fehlt: "Glauben: eine Rolle Kirche, kein Bekenntnis" },
            3: { umfang: { soll: 1000, wort: "Gräber je Stadt" }, masse: [{ key: "abweichung", wort: "Gräberzahl gegen Sterbefälle (Abweichung)", soll: 0.2, richtung: "≤" }, { key: "schichten", wort: "Schichten der Epochen (1320/1860)", soll: 2, richtung: "≥", herkunft: "„Schichtung 1320/1860“ nennt zwei Epochen: zwei Schichten im Kirchhof" }], erwartet: "nicht", fehlt: "Gräber: ≤ 36 Lose des Kirchhofs" },
            4: { umfang: { soll: 100, wort: "Glauben (U_eff)" }, masse: [{ key: "extreme", wort: "Kultorte an Extremen der Landschaft", soll: 0.7, richtung: "≥" }, { key: "pilger", wort: "Pilgerstrom vom Hügel", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "Glauben mit heiliger Landschaft: keine" },
            5: { umfang: { soll: 1000, wort: "Glaubens-Richtungen" }, masse: [{ key: "rf", wort: "Robinson-Foulds des Glaubens-Stammbaums", soll: 0.3, richtung: "≤" }, { key: "misch", wort: "Mischriten an Grenzorten", soll: 0.3, richtung: "≥" }], erwartet: "nicht", fehlt: "Glaubens-Richtungen: keine Spaltung" },
            6: { umfang: null, masse: [{ key: "goetter", wort: "Hauptgötter ↔ reales Phänomen der Saat", soll: 0.8, richtung: "≥" }], erwartet: "leser", fehlt: "kein Heiliges, kein Gott", wo: "fachwerk-core.js:4462" },
        },
        proben: {
            1: [
                { name: "die Attrappe: der Kultbau steht, jeder Tag gleich (kein Festtag)", j: mut("mensch.kultur.glaube", 1, { art: "zahl", n: 1, werte: { imKultbau: 0.4, fest: 1 } }), gruen: false, zahl: /ROT an Festtag ÷ Werktag / },
                { name: "die Attrappe: die Menge vor der Tür, keiner drinnen", j: mut("mensch.kultur.glaube", 1, { art: "zahl", n: 1, werte: { imKultbau: 0.001, fest: 4 } }), gruen: false, zahl: /ROT an Gläubige im Kultbau / },
            ],
        },
    }),

    // ═════ GESTALT ═════
    F.leiter("mensch.kultur.gestalt", {
        sek: 45,
        pfad: ORT,
        seite: { ZENSUS: zensus, STUFEN: stufen },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Gestalt: Kulturen der Stadt " + JSON.stringify(z.ort.kulturen) + " · alle Orte " + z.kulturenAlle + " · Gesetz " + z.kulturenGesetz + " · Häuser " + z.haeuserAlle);
            const stadt = (z) => Object.keys(z.ort.kulturen).length;
            const welt = (z) => z.kulturenAlle;
            const mass = (z) => "Kulturen der Stadt " + Object.keys(z.ort.kulturen).join("/") + " · geladen " + z.kulturenAlle;
            await H.seite.STUFEN(H, K, z, [
                { n: 1, art: "auge", um: 10, wert: stadt, mass, fehlt: "Kulturen an den Häusern der Stadt" },
                { n: 2, art: "auge", um: 100, wert: welt, mass, fehlt: "Kulturen aus dem Samen (alle geladenen Orte; das Gesetz trägt " + z.kulturenGesetz + " Namen)" },
                { n: 3, art: "auge", um: 1000, wert: welt, mass, fehlt: "Kulturen auf einem Kontinent" },
                { n: 4, art: "auge", um: 10000, wert: welt, mass, fehlt: "Kulturen mit Fest und Alltag (eine Tracht je Epoche, kein Fest)" },
                { n: 5, art: "auge", um: 100000, wert: welt, mass, fehlt: "Kulturen über alle Epochen" },
                { n: 6, art: "auge", um: 1000000, wert: welt, mass, fehlt: "Kulturen über Planeten und Arten (eine Welt, eine Art)" },
                { n: 7, art: "auge", um: 1000, wert: (z) => z.haeuserAlle, mass, fehlt: "irdische Stichproben (stehende Häuser aller geladenen Orte)" },
            ]);
        },
        sprossen: {
            1: { auge: { pose: POSE, vorbild: "Straßenfotos realer Häuser von 10 Kulturen, Blindpaar ≥ 12 Prüfer: getrennt ≥ 80 %" }, erwartet: "nicht", fehlt: "Kulturen der Stadt: 4 < 10" },
            2: { auge: { pose: POSE, vorbild: "die Saat-Probe: Häuserbilder zweier Saaten gegen Fotos realer Orte, getrennt ≥ 80 %, plausibel ≥ 90 %" }, erwartet: "nicht", fehlt: "Kulturen aus dem Samen: < 100" },
            3: { auge: { pose: POSE, vorbild: "Foto des realen Gegenstücks je Kultur (Merkmalsabstand im Foto-Band)" }, erwartet: "nicht", fehlt: "Kulturen auf einem Kontinent: < 1 000" },
            4: { auge: { pose: POSE, vorbild: "Fotos realer Festtrachten (≥ 60 %) und Tonaufnahmen der Musik je Kultur (zugeordnet ≥ 70 %)" }, erwartet: "nicht", fehlt: "Kulturen mit Fest und Alltag: < 10⁴" },
            5: { auge: { pose: POSE, vorbild: "100 Paare (Ort, Jahr) gegen datierte Fotos realer Orte: plausibel ≥ 85 %, Foto-Verwechslung ≥ 40 %" }, erwartet: "nicht", fehlt: "Kulturen über alle Epochen: < 10⁵" },
            6: { auge: { pose: POSE, vorbild: "Bauten fremder Arten gegen Leib und Schwerkraft ihrer Welt (Prüfer, R10): passen ≥ 90 %" }, erwartet: "nicht", fehlt: "Kulturen über Planeten und Arten: eine Welt" },
            7: { auge: { pose: POSE, vorbild: "1 000 irdische Fotos (Stichprobe der Wirklichkeit): Foto-Verwechslung ≥ 50 %, Wiederholung einer Gestalt ≤ 1 %" }, erwartet: "nicht", fehlt: "irdische Stichproben: < 1 000 Häuser" },
        },
        proben: {
            1: [
                { name: "die Attrappe: zehn Namen der Liste, vier Kulturen im Bild", j: mut("mensch.kultur.gestalt", 1, { art: "nicht", n: 4, fehlt: "Kulturen an den Häusern der Stadt (gemessen 4 < 10)" }), gruen: false, zahl: /Umfang nicht erzeugbar: Kulturen an den Häusern/ },
                { name: "das Bild fehlt (auge ohne Bild)", j: mut("mensch.kultur.gestalt", 1, { art: "auge", pose: "Probe", vorbild: "Probe" }), gruen: false, zahl: /keine Messung der Sprosse$/ },
            ],
        },
    }),

    // ═════ DIFFUSION ═════
    F.leiter("mensch.kultur.diffusion", {
        sek: 45,
        pfad: ORT,
        seite: { ZENSUS: zensus, STUFEN: stufen },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({ grenze: true }) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Diffusion: " + z.orte.length + " Orte, Regionen binnen 2 km " + z.grenze.regionen + ", Paar " + JSON.stringify(z.grenze));
            const herkuenfte = (z) => Object.keys(z.ort.kulturen).length;
            await H.seite.STUFEN(H, K, z, [
                {
                    n: 1, art: "nicht", wert: (z) => z.grenze.regionen, fehlt: "zwei Kulturen an einer Grenze: kein Ort einer anderen Region binnen 2 km",
                    zahl: (z) => ({ n: z.grenze.regionen, werte: { grenze: z.grenze.grenze, abseits: z.grenze.abseits }, beleg: "Paar " + (z.grenze.orte || []).join(" ↔ ") + " (" + z.grenze.d + " m)", taeter: "die Wahl der Kultur je Haus (fachwerk-core REGION_HIST, der Vorrat der Region)" }),
                },
                { n: 2, art: "nicht", wert: (z) => z.kulturenAlle, fehlt: "zehn Kulturen mit Wegen zwischen ihnen: die geladenen Orte tragen weniger" },
                { n: 3, art: "auge", um: 10, wert: herkuenfte, fehlt: "Herkünfte in der Stadt (Kulturen ihrer Häuser)", mass: (z) => "Herkünfte " + Object.keys(z.ort.kulturen).join("/") },
                { n: 4, art: "nicht", wert: herkuenfte, fehlt: "Herkünfte in der Stadt: die Kulturen des Stadt-Vorrats" },
                { n: 5, art: "leser", wert: (z) => z.regionen, da: (z) => z.orte.some((o) => o.wanderung), wo: "fachwerk-core.js:3609", fehlt: "keine Wanderung: die Kultur je Region und Jahr ist eine feste Tafel (REGION_HIST), kein Volk zieht" },
                { n: 6, art: "nicht", wert: (z) => z.bewohner.alle, fehlt: "Bewohner einer Stadt mit Herkünften mehrerer Planeten" },
            ]);
        },
        sprossen: {
            1: { umfang: { soll: 2, wort: "Kulturen an einer Grenze" }, masse: [{ key: "grenze", wort: "Grenzstreifen gemischt", soll: 0.3, richtung: "≥" }, { key: "abseits", wort: "abseits gemischt", soll: 0.05, richtung: "≤" }], erwartet: "nicht", fehlt: "kein Ort einer anderen Region binnen 2 km" },
            2: { umfang: { soll: 10, wort: "Kulturen mit Wegen" }, masse: [{ key: "mantel", wort: "Mantel-r über Wege", soll: 0.4, richtung: "≥" }, { key: "vorsprung", wort: "Mantel-r über Wege minus Luftlinie", soll: 0, richtung: ">" }, { key: "lehnwort", wort: "Lehnwort ↔ Distanz r", soll: -0.5, richtung: "≤" }], erwartet: "nicht", fehlt: "zehn Kulturen mit Wegen: < 10" },
            3: { auge: { pose: POSE, vorbild: "Straßenbilder realer Städte mit 10 Herkünften: Herkunft blind erkannt ≥ 75 % (Prüfer)" }, erwartet: "nicht", fehlt: "Herkünfte in der Stadt: < 10" },
            4: { umfang: { soll: 100, wort: "Herkünfte (in 10⁷)" }, masse: [{ key: "hybrid", wort: "neue Hybrid-Merkmale in 100 J (trennbar, ins Umland)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "Herkünfte: < 100" },
            5: { umfang: null, masse: [{ key: "richtung", wort: "Wanderrichtung rekonstruiert (Fehler in Grad)", soll: 30, richtung: "≤" }], erwartet: "leser", fehlt: "keine Wanderung", wo: "fachwerk-core.js:3609" },
            6: { umfang: { soll: 100000000, wort: "Bewohner (10⁸-Stadt)" }, masse: [{ key: "r", wort: "Divergenz ↔ Zeit × Abstand r", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "Bewohner: 1092 < 10⁸" },
        },
        proben: {
            1: [{ name: "die Attrappe: gemischt überall (auch abseits)", j: mut("mensch.kultur.diffusion", 1, { art: "zahl", n: 2, werte: { grenze: 0.4, abseits: 0.4 } }), gruen: false, zahl: /ROT an abseits gemischt / }],
        },
    }),

    // ═════ WISSEN ═════
    F.leiter("mensch.kultur.wissen", {
        sek: 30,
        pfad: ORT,
        seite: { ZENSUS: zensus, STUFEN: stufen },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Wissen: Orte " + z.orte.length + " (Städte " + z.staedte + "), Technikstand " + z.orte.map((o) => o.technik).join("/") + ", Arten Schule·Bibliothek·Werkstatt " + z.wissenArten + ", Text-Träger " + z.texte.n);
            const technik = (z) => z.orte.some((o) => o.technik != null);
            await H.seite.STUFEN(H, K, z, [
                { n: 1, art: "leser", wert: (z) => z.orte.length, da: technik, wo: "fachwerk-core.js:4168", fehlt: "kein Technikstand je Ort: die Epoche eines Jahrs (epocheBei) setzt den Bau, kein Stand wächst aus Bevölkerung und Vernetzung" },
                { n: 2, art: "nicht", wert: (z) => z.wissenArten, fehlt: "Schule und Bibliothek: keine Rolle im Bau-Gesetz (fachwerk-core BAU_NUTZUNG), kein Schüler, kein Meister mit Können" },
                { n: 3, art: "leser", wert: (z) => z.texte.n, da: (z) => z.texte.n > 0, wo: "stamm/siedlung-bewohner.js:2169", fehlt: "kein Buch, kein Medium: die Akten der Taten (c.akten) liest kein Text der Welt" },
                { n: 4, art: "leser", wert: (z) => z.orte.length, da: technik, wo: "fachwerk-core.js:4168", fehlt: "kein Stand, der fällt oder steigt: die Epoche folgt dem Jahr allein" },
                { n: 5, art: "nicht", wert: (z) => z.staedte, fehlt: "Städte mit Archiven und Handel über 10³ Jahre" },
                { n: 6, art: "nicht", wert: (z) => z.kreaturen.sprache, fehlt: "Arten mit Wissenschaft: keine nicht-menschliche Art trägt Zeichen oder Gesetz" },
            ]);
        },
        sprossen: {
            1: { umfang: null, masse: [{ key: "r", wort: "Stand ↔ Bevölkerung × Vernetzung r", soll: 0.5, richtung: "≥" }], erwartet: "leser", fehlt: "kein Technikstand je Ort", wo: "fachwerk-core.js:4168" },
            2: { umfang: { soll: 3, wort: "Arten (Schule, Bibliothek, Werkstatt)", herkunft: "„Schule, Bibliothek, Werkstatt“: drei Arten aufgezählt, jede muss stehen" }, masse: [{ key: "sd", wort: "Schüler eines Meisters über dem Mittel (SD)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "Schule und Bibliothek: keine Rolle" },
            3: { umfang: null, masse: [{ key: "ereignis", wort: "Texte mit Verweis auf ein reales Ereignis der letzten Tage", soll: 0.7, richtung: "≥" }], erwartet: "leser", fehlt: "kein Buch, kein Medium", wo: "stamm/siedlung-bewohner.js:2169" },
            4: { umfang: null, masse: [{ key: "fall", wort: "Stand fällt nach Ausbruch", soll: 1, richtung: "≥" }, { key: "fund", wort: "Stand steigt nach Fund", soll: 1, richtung: "≥" }], erwartet: "leser", fehlt: "kein Stand, der fällt oder steigt", wo: "fachwerk-core.js:4168" },
            5: { umfang: { soll: 1000, wort: "Städte" }, masse: [{ key: "r", wort: "Zitat-Netz ↔ Handelsnetz r", soll: 0.5, richtung: "≥" }], erwartet: "nicht", fehlt: "Städte: eine" },
            6: { umfang: { soll: 1, wort: "Arten mit Wissenschaft" }, masse: [{ key: "widerspruchsfrei", wort: "gelesene Naturgesetze widerspruchsfrei", soll: 0.9, richtung: "≥" }], erwartet: "nicht", fehlt: "Arten mit Wissenschaft: keine" },
        },
        proben: {
            2: [{ name: "die Attrappe: drei Häuser mit dem Namen, Schüler wie alle", j: mut("mensch.kultur.wissen", 2, { art: "zahl", n: 3, werte: { sd: 0.1 } }), gruen: false, zahl: /ROT an Schüler eines Meisters über dem Mittel / }],
        },
    }),

    // ═════ VERSTÄNDIGUNG ═════
    F.leiter("mensch.kultur.verstaendigung", {
        sek: 45,
        mutiert: true,
        pfad: [...ORT, "stamm/kreatur-verhalten.js", "stamm/vegetation-baum.js", "stamm/gelaende-boden.js", "stamm/dirigent-kern.js", "stamm/dirigent-takt.js", "stamm/koerper-bewegung.js"],
        seite: { ZENSUS: zensus, STUFEN: stufen, BEGEGNUNG: begegnung },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Verständigung: Bewohner " + z.bewohner.n + " (nah " + z.bewohner.nah + "), Text-Träger an Gräbern " + z.texte.grab + ", Wörter " + z.texte.woerter + ", Kreaturen " + z.kreaturen.n + " (mit Zeichen " + z.kreaturen.sprache + ")");
            // DER GRUSS (S1): wer antwortet (der Kopf wendet sich binnen 1,5 s auf 10° zum Spieler), und trägt die Form der Antwort
            // (die Zeit bis dahin) die Kultur seines Hauses — getrennt je Bewohner gegen die Mitten der Kulturen ohne ihn (Gleichstand: falsch)
            const gruss = async (z) => {
                const B = await K.welt("return await (" + H.seite.BEGEGNUNG + ")(r, T, " + JSON.stringify({ n: 24, abM: 2, schritte: 90 }) + ");", 40000);
                if (!B || B.fehler) return { n: 0, werte: {}, taeter: "die Begegnung: " + ((B && B.fehler) || "ohne Antwort") };
                const ja = B.aus.filter((x) => x.zuS !== null);
                const ks = [...new Set(ja.map((x) => x.k))];
                let ok = 0;
                ja.forEach((x, i) => {
                    let [best, bd, gleich] = [null, Infinity, false];
                    for (const k of ks) {
                        const ys = ja.filter((y, j) => j !== i && y.k === k);
                        if (!ys.length) continue;
                        const d = Math.abs(ys.reduce((a, y) => a + y.zuS, 0) / ys.length - x.zuS);
                        if (d < bd - 1e-9) [best, bd, gleich] = [k, d, false];
                        else if (Math.abs(d - bd) <= 1e-9) gleich = true;
                    }
                    if (best === x.k && !gleich) ok++;
                });
                H.zeile("Gruß: " + ja.length + " von " + B.aus.length + " antworten (" + B.ohneOrt + " ohne freien Stand), Kulturen " + ks.join("/"));
                return {
                    n: B.aus.length,
                    werte: { antwort: B.aus.length ? ja.length / B.aus.length : NaN, trennbar: ks.length >= 2 && ja.length ? ok / ja.length : NaN },
                    beleg: "geantwortet " + ja.length + "/" + B.aus.length + " · Zeit bis 10° " + ja.map((x) => x.k.slice(0, 4) + " " + x.zuS).slice(0, 8).join(", "),
                    taeter: "die Begegnung (stamm/siedlung-bewohner.js _bewohnerKopf): EIN Gesetz des Kopfes für jede Kultur, keine Gruß-Form",
                };
            };
            await H.seite.STUFEN(H, K, z, [
                { n: 1, art: "zahl", wert: (z) => z.bewohner.n, zahl: gruss },
                { n: 2, art: "auge", um: 20, wert: (z) => z.texte.woerter + z.regionen, fehlt: "Wörter der Welt, die ein Spieler lernen könnte (Wörter der Texte + Ortsnamen-Sprachen)" },
                { n: 3, art: "leser", wert: (z) => z.stuecke.grab, da: (z) => z.texte.grab > 0, wo: "fachwerk-core.js:6506", fehlt: "keine Inschrift: der Grabstein trägt seine Schrift-Seite ohne Schrift" },
                { n: 4, art: "leser", wert: (z) => z.bewohner.n, da: (z) => z.orte.some((o) => o.sitten), wo: "stamm/siedlung-bewohner.js:2154", fehlt: "keine Sitte, kein Tabu: der Zeuge weicht der Gewalt, gleich in jeder Kultur (menge.kollektiv misst ihn) — kein Bruch einer Sitte" },
                { n: 5, art: "leser", wert: (z) => z.regionen, da: (z) => z.orte.some((o) => o.sprache), wo: "fachwerk-core.js:3634", fehlt: "keine Verkehrssprache: je Region die Silben der Ortsnamen (NAMEN), keine Sprache am Handelsort" },
                { n: 6, art: "leser", wert: (z) => z.kreaturen.n, da: (z) => z.kreaturen.sprache > 0, wo: "stamm/kreatur-verhalten.js:2190", fehlt: "keine nicht-menschliche Sprache: die Aura der Kreatur ist ein Glanz ohne Zeichen" },
            ]);
        },
        sprossen: {
            1: { umfang: null, masse: [{ key: "antwort", wort: "Bewohner antworten", soll: 0.9, richtung: "≥" }, { key: "trennbar", wort: "Gruß-Form trennbar", soll: 0.8, richtung: "≥" }] },
            2: { auge: { pose: POSE, vorbild: "ein unbefangener Spieler lernt ≥ 20 Wörter einer realen Fremdsprache in 30 min (Lern-Probe am Gerät)" }, erwartet: "nicht", fehlt: "Wörter der Welt: < 20" },
            3: { umfang: null, masse: [{ key: "entziffert", wort: "Inschrift entziffert", soll: 0.5, richtung: "≥" }], erwartet: "leser", fehlt: "keine Inschrift", wo: "fachwerk-core.js:6506" },
            4: { umfang: null, masse: [{ key: "ablehnung", wort: "Ablehnung nach Bruch (×)", soll: 3, richtung: "≥" }], erwartet: "leser", fehlt: "keine Sitte, kein Tabu", wo: "stamm/siedlung-bewohner.js:2154" },
            5: { umfang: null, masse: [{ key: "anteil", wort: "Handelsorte mit Verkehrssprache", soll: 0.7, richtung: "≥" }], erwartet: "leser", fehlt: "keine Verkehrssprache", wo: "fachwerk-core.js:3634" },
            6: { umfang: null, masse: [{ key: "bedeutungen", wort: "Bedeutungen erschlossen", soll: 10, richtung: "≥" }], erwartet: "leser", fehlt: "keine nicht-menschliche Sprache", wo: "stamm/kreatur-verhalten.js:2190" },
        },
        proben: {
            1: [{ name: "die Attrappe: jeder antwortet, mit derselben Geste in jeder Kultur", j: mut("mensch.kultur.verstaendigung", 1, { art: "zahl", n: 50, werte: { antwort: 1, trennbar: 0.5 } }), gruen: false, zahl: /ROT an Gruß-Form trennbar / }],
        },
    }),

    // ═════ BILDKUNST ═════
    F.leiter("mensch.kultur.bildkunst", {
        sek: 45,
        pfad: ORT,
        seite: { ZENSUS: zensus, STUFEN: stufen },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Bildkunst: Werke " + z.kunst + " (Figur, Wandbild, Ornament, Denkmal …) binnen 700 m, am Ort stehend " + JSON.stringify(z.werke) + ", Bewohner " + z.bewohner.n);
            const werke = (z) => z.kunst;
            await H.seite.STUFEN(H, K, z, [
                // die Werke, die am Ort STEHEN (Hauszeichen und Marktkreuz, ort-ausstattung): ihr Motiv in der Welt gefunden, ihre gleichen Paare
                {
                    n: 1, art: "leser", wert: (z) => z.werke.n, da: (z) => z.werke.n > 0, wo: "fachwerk-core.js ortAusstattung · HAUSZEICHEN_MOTIV",
                    fehlt: "kein Werk steht am Ort: kein Hauszeichen, kein Marktkreuz mit dem Samen seines Stücks",
                    zahl: (z) => ({
                        n: z.werke.n,
                        werte: { motiv: z.werke.n ? z.werke.gefunden / z.werke.n : NaN, gleich: z.werke.gleich },
                        beleg: "Werke " + z.werke.n + " (Hauszeichen " + z.werke.hauszeichen + ", Marktkreuz " + z.werke.kreuz + "; im Plan " + z.werke.plan + ") · Motiv in der Welt gefunden " + z.werke.gefunden + " · gleiche Paare " + z.werke.gleich,
                        taeter: "fachwerk-core.js ortAusstattung (je Rolle EIN Hauszeichen, HAUSZEICHEN_MOTIV) · stamm/siedlung-ort.js _hausStueckSetzen",
                    }),
                },
                { n: 2, art: "auge", um: 10, wert: (z) => (z.kunst > 0 ? Object.keys(z.ort.kulturen).length : 0), fehlt: "Kulturen mit Werken" },
                { n: 3, art: "auge", um: 1000, wert: (z) => (z.kunst > 0 && z.ort.jahre ? z.ort.jahre.bis - z.ort.jahre.von : 0), fehlt: "Jahre der Werke eines Orts" },
                { n: 4, art: "leser", wert: werke, da: (z) => z.kunst > 0, wo: "fachwerk-core.js:6495", fehlt: "kein Werkstoff der Kunst: kein Werk, keine Malerei mit Pigment" },
                { n: 5, art: "auge", um: 10000, wert: werke, fehlt: "Werke der Stadt (Tempel, Galerie, Straßenkunst, Grabmal)" },
                { n: 6, art: "nicht", wert: (z) => z.bewohner.alle, fehlt: "Bewohner (10⁶) mit Künstlern als Personen" },
                { n: 7, art: "auge", um: 1, wert: (z) => z.kreaturen.sprache, fehlt: "fremde Arten mit Kunst für ihre Sinne" },
            ]);
        },
        sprossen: {
            1: { umfang: { soll: 10, wort: "Werke an einem Ort" }, masse: [{ key: "motiv", wort: "Motiv in der Welt gefunden", soll: 0.8, richtung: "≥" }, { key: "gleich", wort: "Paare gleicher Werke", soll: 0, richtung: "≤" }] },
            2: { auge: { pose: POSE, vorbild: "Werke realer Kunst von 10 Kulturen: blind der richtigen zugeordnet ≥ 70 % (Prüfer)" }, erwartet: "nicht", fehlt: "Kulturen mit Werken: keine" },
            3: { auge: { pose: POSE, vorbild: "Blind-Datierung realer Werke eines Orts über 1 000 Jahre (Fehler ≤ 15 % der Spanne, Prüfer)" }, erwartet: "nicht", fehlt: "Jahre der Werke: kein Werk" },
            4: { umfang: null, masse: [{ key: "gegenlauf", wort: "Werke aus fehlendem Stoff", soll: 0, richtung: "≤" }, { key: "pigment", wort: "Farbtöne im Band der Pigmente des Orts", soll: 1, richtung: "≥" }], erwartet: "leser", fehlt: "kein Werkstoff der Kunst", wo: "fachwerk-core.js:6495" },
            5: { auge: { pose: POSE, vorbild: "Fotos realer Kunst der Epoche (Blindpaar 2AFC ≤ 70 %); Dichte je Viertel ↔ Rang und Kult r ≥ 0,5" }, erwartet: "nicht", fehlt: "Werke der Stadt: < 10⁴" },
            6: { umfang: { soll: 1000000, wort: "Bewohner" }, masse: [{ key: "urheber", wort: "Werke mit auffindbarem Urheber", soll: 1, richtung: "≥" }, { key: "stil", wort: "Stil-Abstand Fremde ÷ Lehrer", soll: 1, richtung: ">" }], erwartet: "nicht", fehlt: "Bewohner: 1092 < 10⁶" },
            7: { auge: { pose: POSE, vorbild: "Fremdwelt-Probe (R10): Sinn und Glaube der Art aus dem Werk gelesen, Rang ≥ 0,7 (Prüfer)" }, erwartet: "nicht", fehlt: "fremde Arten mit Kunst: keine" },
        },
        proben: {
            1: [{ name: "die Attrappe: zehn Werke, zwei davon gleich", j: mut("mensch.kultur.bildkunst", 1, { art: "zahl", n: 10, werte: { motiv: 0.9, gleich: 1 } }), gruen: false, zahl: /ROT an Paare gleicher Werke / },
                { name: "kein Werk steht am Ort (Hauszeichen und Kreuz nur im Plan) — ROT am Umfang", j: mut("mensch.kultur.bildkunst", 1, { art: "zahl", n: 0, werte: { motiv: null, gleich: 0 } }), gruen: false, zahl: /ROT an Umfang 0 < 10 Werke an einem Ort/ },
                { name: "17 Werke, ihr Motiv nirgends in der Welt (das Bild fremder Rollen)", j: mut("mensch.kultur.bildkunst", 1, { art: "zahl", n: 17, werte: { motiv: 0.1, gleich: 0 } }), gruen: false, zahl: /ROT an Motiv in der Welt gefunden 0\.1 / },
            ],
        },
    }),

    // ═════ ERZÄHLKUNST ═════
    F.leiter("mensch.kultur.erzaehlkunst", {
        sek: 45,
        pfad: ORT,
        seite: { ZENSUS: zensus, STUFEN: stufen },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Erzählkunst: Bühnen " + z.buehnen + ", Lokale " + z.lokale + ", Text-Träger " + z.texte.n + ", Kulturen " + Object.keys(z.ort.kulturen).length + " von " + z.kulturenGesetz);
            const werke = (z) => z.texte.n;
            await H.seite.STUFEN(H, K, z, [
                { n: 1, art: "leser", wert: (z) => z.buehnen, da: (z) => z.buehnen > 0, wo: "koerper-core.js:5182", fehlt: "keine Bühne, kein Erzähler: der Abend trifft sich im Gasthaus (treff), kein Stück, kein Publikum" },
                { n: 2, art: "leser", wert: werke, da: (z) => z.texte.n > 0, wo: "stamm/siedlung-bewohner.js:2169", fehlt: "kein Werk: die Akten der Taten erzählt kein Text, kein Bild der Welt" },
                { n: 3, art: "auge", um: 100, wert: werke, fehlt: "Werke in 5 Gattungen" },
                { n: 4, art: "nicht", wert: (z) => (z.buehnen > 0 ? z.bewohner.alle : 0), fehlt: "Besucher eines Theaters, Kinos, Verlags am Tag (Bühnen " + z.buehnen + "; ohne Bühne kein Besucher)" },
                { n: 5, art: "nicht", wert: (z) => z.videos, fehlt: "Filme: kein bewegtes Bild im Bild (Video-Texturen der Stadt)" },
                { n: 6, art: "nicht", wert: (z) => (z.texte.n > 0 && z.ort.jahre ? z.ort.jahre.bis - z.ort.jahre.von : 0), fehlt: "Jahre der Werke (ohne Werk keine Spanne)" },
                { n: 7, art: "auge", um: (z) => z.kulturenGesetz || 32, wert: (z) => (z.texte.n > 0 ? Object.keys(z.ort.kulturen).length : 0), fehlt: "Kulturen mit Erzählkunst" },
            ]);
        },
        sprossen: {
            1: { umfang: { soll: 100, wort: "Zuhörer" }, masse: [{ key: "akte", wort: "Akte im Bild (Anfang, Wende, Ende)", soll: 3, richtung: "≥", herkunft: "„Anfang, Wende, Ende im Bild“: drei Stellen des Stücks aufgezählt" }, { key: "r", wort: "Publikum folgt dem Stück r", soll: 0.5, richtung: "≥" }], erwartet: "leser", fehlt: "keine Bühne, kein Erzähler", wo: "koerper-core.js:5182" },
            2: { umfang: { soll: 10, wort: "Werke einer Stadt" }, masse: [{ key: "kern", wort: "Kern (Wer, Was, Wo) gegen die Welt", soll: 0.8, richtung: "≥" }], erwartet: "leser", fehlt: "kein Werk", wo: "stamm/siedlung-bewohner.js:2169" },
            3: { auge: { pose: POSE, vorbild: "Übersetzungen realer Werke der Epoche (Epos, Posse, Tragödie, Lied, Chronik): Gattung ≥ 70 %, Blindpaar 2AFC ≤ 75 %" }, erwartet: "nicht", fehlt: "Werke: keines" },
            4: { umfang: { soll: 10000, wort: "Besucher am Tag" }, masse: [{ key: "folgt", wort: "Besucher ↔ Güte und Mode r", soll: 0, richtung: ">" }, { key: "gegenlauf", wort: "Anteil der Besucher des geschlossenen Hauses, die an anderen erscheinen", soll: 0, richtung: ">" }], erwartet: "nicht", fehlt: "Theater, Kino, Verlag: keines" },
            5: { umfang: { soll: 20, wort: "Filme" }, masse: [{ key: "drehort", wort: "Drehort in der Welt auffindbar", soll: 0.8, richtung: "≥" }, { key: "darsteller", wort: "Darsteller als Person mit Leben", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "Filme: keiner" },
            6: { umfang: { soll: 500, wort: "Jahre der Werke" }, masse: [{ key: "vorgaenger", wort: "Werke mit benennbarem Vorgänger", soll: 0.6, richtung: "≥" }], erwartet: "nicht", fehlt: "Werke über Jahrhunderte: keines" },
            7: { auge: { pose: POSE, vorbild: "ausgezeichnete Erzählungen der Gegenwart (Paarvergleich blinder Leser: unser Werk gewählt ≥ 30 %, zu Ende gelesen ≥ 50 %)" }, erwartet: "nicht", fehlt: "Kulturen mit Erzählkunst: keine" },
        },
        proben: {
            1: [{ name: "die Attrappe: ein Stück mit drei Akten, das Publikum klatscht im Takt der Uhr", j: mut("mensch.kultur.erzaehlkunst", 1, { art: "zahl", n: 120, werte: { akte: 3, r: 0.05 } }), gruen: false, zahl: /ROT an Publikum folgt dem Stück r / }],
        },
    }),

    // ═════ STRASSENLEBEN ═════
    F.leiter("mensch.kultur.strassenleben", {
        sek: 45,
        pfad: ORT,
        seite: { ZENSUS: zensus, STUFEN: stufen },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, " + JSON.stringify({}) + ");", 30000);
            if (!z || z.fehler) throw new Error("der Zensus der Stadt: " + ((z && z.fehler) || "ohne Antwort"));
            H.zeile("Straßenleben: Lokale " + z.lokale + ", Läden und Stände " + z.laeden + ", Bewohner " + z.bewohner.n + " (Berufe " + z.bewohner.berufe + "), Trachten " + z.trachten + ", Kulturen " + Object.keys(z.ort.kulturen).length + " von " + z.kulturenGesetz);
            await H.seite.STUFEN(H, K, z, [
                { n: 1, art: "nicht", wert: (z) => z.lokale, fehlt: "Lokale in einer Gasse: die Stadt trägt EIN Gasthaus (das Sonderbau-Gesetz), kein Gericht" },
                { n: 2, art: "leser", wert: (z) => z.lokale, da: (z) => z.orte.some((o) => o.kueche), wo: "koerper-core.js:5182", fehlt: "keine Küche: das Gasthaus bietet das Mahl als Güte (mahl 8), kein Gericht, keine Zutat" },
                { n: 3, art: "leser", wert: (z) => z.trachten, da: (z) => z.orte.some((o) => o.mode), wo: "fachwerk-core.js:3622", fehlt: "keine Mode: die Tracht ist eine je Epoche (EPOCHEN.tracht), kein Merkmal steigt und klingt" },
                { n: 4, art: "auge", um: 10000, wert: (z) => z.bewohner.alle, fehlt: "unterwegs in der Nacht (alle Bewohner der geladenen Orte)" },
                { n: 5, art: "nicht", wert: (z) => z.laeden, fehlt: "Läden und Buden (Marktstände, Kaufhaus, Kontor)" },
                { n: 6, art: "auge", um: 10, wert: (z) => z.trachten, fehlt: "Szenen mit eigener Tracht (eine Tracht je Ort)" },
                { n: 7, art: "auge", um: (z) => z.kulturenGesetz || 32, wert: (z) => Object.keys(z.ort.kulturen).length, fehlt: "Kulturen mit Straßenleben (die Kulturen der Stadt gegen das Gesetz der Kulturen KULTNAMES)" },
            ]);
        },
        sprossen: {
            1: { umfang: { soll: 3, wort: "Lokale in einer Gasse am Abend" }, masse: [{ key: "gaeste", wort: "Gäste nach ihrem Tagesplan verfolgt", soll: 20, richtung: "≥" }, { key: "gegenlauf", wort: "Gerichte trotz fehlender Zutat", soll: 0, richtung: "≤" }], erwartet: "nicht", fehlt: "Lokale: ein Gasthaus je Ort" },
            2: { umfang: { soll: 100, wort: "Gerichte" }, masse: [{ key: "umland", wort: "Zutaten im Umkreis oder im Handel gefunden", soll: 0.9, richtung: "≥" }], erwartet: "leser", fehlt: "keine Küche", wo: "koerper-core.js:5182" },
            3: { umfang: { soll: 10, wort: "Jahre der Mode" }, masse: [{ key: "kurve", wort: "Aufstieg und Abklingen im Band realer Mode-Kurven", soll: 1, richtung: "≥" }, { key: "jung", wort: "zuerst bei Jungen und Reichen", soll: 1, richtung: "≥" }], erwartet: "leser", fehlt: "keine Mode", wo: "fachwerk-core.js:3622" },
            4: { auge: { pose: POSE, vorbild: "Zählreihen realer Ausgehviertel je Stunde (±25 %) und Fotos einer Ausgehstraße bei Nacht (Blindpaar ≤ 75 %)" }, erwartet: "nicht", fehlt: "unterwegs: 1092 < 10⁴" },
            5: { umfang: { soll: 100000, wort: "Läden und Buden" }, masse: [{ key: "betretbar", wort: "Läden betretbar, Ware benutzbar, Wirt mit Leben", soll: 0.95, richtung: "≥" }, { key: "dichte", wort: "Dichte je 100 m ÷ Vergleichstitel", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "Läden: < 10⁵" },
            6: { auge: { pose: POSE, vorbild: "Fotos realer Szenen und Jugendkulturen (Tracht und Ort), blind getrennt ≥ 80 %" }, erwartet: "nicht", fehlt: "Szenen: eine Tracht je Ort" },
            7: { auge: { pose: POSE, vorbild: "datierte Bildquellen realen Straßenlebens (2AFC ≤ 70 %); fremd: Fremdwelt-Probe (R10)" }, erwartet: "nicht", fehlt: "Kulturen mit Straßenleben: < 32" },
        },
        proben: {
            1: [{ name: "die Attrappe: drei Lokale, das Gericht kommt auch ohne Zutat", j: mut("mensch.kultur.strassenleben", 1, { art: "zahl", n: 3, werte: { gaeste: 25, gegenlauf: 4 } }), gruen: false, zahl: /ROT an Gerichte trotz fehlender Zutat / }],
        },
    }),
];
