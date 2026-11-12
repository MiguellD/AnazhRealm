// kamera-nah.cjs — DIE NAH-DECKUNG DER KAMERA (§6 #5): wie viel des Schirms eine Fläche
// deckt, die näher am Auge liegt als der Nah-Radius der Stellung — und wer sie ist, beim NAMEN.
// Die Linse rechnet in der Seite gegen die ECHTE Szene (headless oder echte GPU): je Stellung ein Strahlen-Gitter durch den
// Bildwinkel der Spieler-Kamera, je Strahl die Flächen bis zum Nah-Radius (Dreiecke der gezeichneten Meshes, Instanzen mit
// ihren Matrizen, Blatt-Karten mit dem Alpha ihres Atlas). Was eine Fläche dem Auge ist, sagt ihr Stoff: trägt er die
// Durchsicht der Kamera (`maskNode` aus `_kameraDurchsichtNode`), steht sie mit dem Gewicht der EINEN Formel
// (`_durchsichtGewicht` über `DURCHSICHT_ZAHLEN`, mit den Uniform-Werten, die die GPU liest), sonst ganz. Das Rauschen der
// Blende ist je Pixel EINES für alle Flächen: der Strahl zeigt für dh ∈ [0, 1) die erste Fläche mit w > dh — der Anteil, mit
// dem eine Fläche i sichtbar ist, ist max(0, w_i − max(w_0 … w_{i−1})). Die Deckung des Strahls ist die Summe dieser Anteile
// über die TÄTER-Flächen; Boden und Bau sind nie Täter (sie halten die Kamera, `_fieldRaycast`), sie decken nur, was hinter
// ihnen liegt.
//
// Täter-Klassen: Laub (Laub · Blatt-Karte), Rinde (Rinde · Stiel), Fels (Formationen, Streu-Steine, Natur ohne
// Pflanzen-Stoff), Wagen (der eigene, geritten), Leib (`istLeib`: der eigene und jeder fremde — nur, wo der Rufer ihm einen
// Radius gibt; sonst ist er weder Täter noch Deckung, wie bis w28-linse-wahr überall). Im 1st ist nur Laub ein Täter: der Leib
// steht an der Rinde (der Stamm, an dem man lehnt, bleibt ganz).
//
// DER ORTS-SPEICHER: die Szene ruht zwischen den Stellungen eines Orts (kein Takt) — die Welt-Dreiecke der Region (o.ort:
// { id, x, z, r }) werden EINMAL gerechnet und in 2-m-Zellen gelegt; je Stellung fragt die Linse nur die Zellen der Nah-Kugel.
// Der Stoff (und seine Maske) wird je Stellung frisch gelesen. Was sich bewegt (`o.dyn`: die id des Wagens) und was sich dreht
// (der Tür- und Tor-Flügel, leib.K4: im Speicher stand er in der Pose des ersten Schusses), rechnet sie je Stellung neu;
// `o.neu` verwirft den Speicher.
"use strict";

// Die Seiten-Funktion (als Quelle injiziert): o = { radien: { Klasse: m }, gw, gh, ort, dyn, neu } — Täter ist eine Fläche
// einer Klasse mit Radius, näher am Auge als ihr Radius.
function nahDeckungInSeite(o) {
    const T = window.THREE;
    const K = AnazhRealm;
    const cam = st.camera;
    cam.updateMatrixWorld(true);
    cam.updateProjectionMatrix();
    const E = cam.position.clone();
    const R = o.radien || {};
    const D = Math.max(0, ...Object.values(R));
    const D2 = D * D;
    // die Einträge, die nie zählen (o.ohne: ids — das benannte Ziel eines Beweisbilds, K32); sie wirken beim Sammeln, darum
    // fragt ein Aufrufer mit `ohne` stets mit `neu`
    const OHNE = new Set(o.ohne || []);
    // je Klasse die Höhe, über der ein Treffer erst zählt (o.ueber: { Klasse: y }) — die Böschung am Auge, nie der Boden darunter
    const UEBER = o.ueber || {};
    const lu = st.lodUniforms || {};
    // die Werte, die die GPU liest (uKamAuge · uKamZiel · uKamNah)
    const auge = lu.uKamAuge?.value;
    const ziel = lu.uKamZiel?.value;
    const nah = lu.uKamNah?.value;
    const knoten = r._kamDurchKnoten || null; // die Masken-Knoten je Art (Laub · Rinde), falls der Stamm sie hält
    const gewicht = (p, art) => {
        if (!auge || !ziel) return 1;
        const n = nah ? (art === "rinde" ? nah.y : art === "boden" ? nah.z : nah.x) : undefined;
        return K._durchsichtGewicht(K.DURCHSICHT_ZAHLEN, p, auge, ziel, ziel.w, n);
    };
    const ritt = st.player?.mountedArch != null ? r._mountedEntry : null;
    const archNachMesh = new Map();
    const eintragNachId = new Map();
    for (const e of st.architectures || []) {
        if (e?.mesh) archNachMesh.set(e.mesh, e);
        if (e?.id != null) eintragNachId.set(e.id, e);
    }
    // DIE MEMBRAN GEHÖRT IHREM TOR (studios.K4, w27-studio-mesh): die Welt zeichnet sie als eigenes Mesh neben dem Rahmen
    // (`_membranBauFor`, `_portalMembranes`) — ohne Eintrag hieß sie fremd, und das Tor am Ziel verdeckte sich selbst (Radeon
    // da0e790f: „Ziel Blickziel verdeckt von portal-membran in 18.98 m“, kein Bild der Welt für das Tor-Studio)
    r._portalMembranes?.forEach((q) => archNachMesh.set(q.mesh, q.entry));
    const eintragVon = (obj, inst) => {
        // der Pool der Fundamente (`st.archFundament`, EIN Mesh für jedes Bauwerk, `idAt[slot]` = die id des Eintrags)
        const fu = st.archFundament;
        if (fu && obj === fu.mesh) return eintragNachId.get(fu.idAt[inst]) || null;
        if (obj.isInstancedMesh && obj.userData.archInstanceKey)
            return st.archInstanceGroups?.get(obj.userData.archInstanceKey)?.slotEntry?.[inst] || null;
        for (let p = obj; p; p = p.parent) if (archNachMesh.has(p)) return archNachMesh.get(p);
        return null;
    };
    const artVonStoff = (mat) => {
        const k = mat?.userData?.foundryKind;
        return k === "foliage" || k === "foliageTex" ? "laub" : k === "bark" || k === "stem" ? "rinde" : null;
    };
    // die Klasse einer Fläche: { klasse, name } — klasse ∈ Laub · Rinde · Fels · Wagen (Täter) | Boden · Bau (halten)
    // | null (nie gezählt: Himmel, Wasser, Spieler, Kreatur)
    const klasseVon = (obj, mat, e) => {
        const nm = obj.name || "";
        if (LEIB && leib(obj)) return { klasse: "Leib", name: leibName(obj) };
        if (nm === "bodenSatz") return { klasse: "Gelände", name: "Gelände" };
        if (nm === "bauSatz") return { klasse: "Bau", name: "bauSatz" };
        if (nm === "formationenSatz") return { klasse: "Fels", name: "Formation" };
        // die Halm-Senken der Nah-Wiese (`nahWiese:L<stufe>:…`, `_nahWieseSenken`) sind die Boden-Schicht wie die
        // wiegende Streu
        if (nm.startsWith("nahWiese:L")) return { klasse: "Streu", name: nm };
        const art = artVonStoff(mat);
        // die Senken der Nah-Streu (`streuNah:<Art>:…`, `_streuNahSenke`; jede zeichnet in der Arena ihres Stoffs)
        if (nm.startsWith("streuNah:")) {
            // die wiegende Nah-Streu (Blume, Farn, Gestrüpp, Schilf) ist die Boden-Schicht
            if (wiegend.has(mat)) return { klasse: "Streu", name: "Streu " + (art || "?") };
            if (art === "laub") return { klasse: "Laub", name: "Streu-Laub" };
            if (art === "rinde") return { klasse: "Rinde", name: "Streu-Reisig" };
            return { klasse: "Fels", name: "Streu-Stein" };
        }
        if (ritt && e === ritt) return { klasse: "Wagen", name: "Wagen " + (e.type || "?") };
        // ohne Eintrag und Namen nennt die EINE Täter-Klasse des Stamms den Täter (`_taeterKlasse`: die Gruppe einer Instanz
        // `fscatter:<art>:L<n>` · `f:<art>:L<n>`, sonst der oberste Knoten) — bis w10-wiese hieß jede solche Fläche „Streu“, und
        // vegetation.K2 nannte am Kopf 2674ff9a „Rinde Streu 14,4 %“, ohne dass ein Leser wusste, welche Gestalt dort stand
        const wer = () => e?.type || nm || r._taeterKlasse(obj);
        if (art === "laub") return { klasse: "Laub", name: "Laub " + wer() };
        if (art === "rinde") return { klasse: "Rinde", name: "Rinde " + wer() };
        if (e && r._istNatur(e)) return { klasse: "Fels", name: "Natur " + e.type };
        return { klasse: "Bau", name: e?.type || nm || r._taeterKlasse(obj) };
    };
    // DER LEIB IST TÄTER (w28-linse-wahr, B der Augen-Karte 11.11.): als Leib (skinned), im Satz seiner Gestalt (`_gangSatz`, die
    // Senke trägt `userData.gang`) und als Baum der Glieder (`istLeib`) — der eigene wie jeder fremde. Bis hier zählte die Linse
    // keinen (`!isSkinnedMesh && !userData.gang`, der Spieler ganz außen): standorte/stadt (Radeon c4010773) zeigte einen Kopf
    // 0,5–1 m vor der Linse und schrieb „Sicht 0,0 %“, 14 Pakete ebenso. Ohne Radius (`o.radien.Leib`) bleibt er, was er war:
    // keine Fläche — so verdeckte er tiere.K1#2 nie das Glied der eigenen Herde. Ein Leib am Ziel (`o.zielUm`: sein Ursprung
    // binnen r eines Ziel-Punkts) ist das Ziel: er deckt nie und verdeckt nie, wie jedes Werk in `o.ohne`.
    const LEIB = R.Leib > 0;
    const leibVon = new Map();
    const leib = (obj) => (leibVon.has(obj) ? leibVon.get(obj) : (leibVon.set(obj, window.__istLeib(obj)), leibVon.get(obj)));
    const leibName = (o) => "Leib " + String(r._kopfKlasse(o)[0] || o.name || "?").replace(/-satz$/, "");
    const ZU = o.zielUm || null;
    const zq = new T.Vector3();
    const amZiel = (m) => !!ZU && (zq.setFromMatrixPosition(m), ZU.punkte.some(([x, , z]) => Math.hypot(zq.x - x, zq.z - z) <= ZU.r));
    const zaehlt = (obj) =>
        window.__kameraZeichnet(obj, st.camera) &&
        (LEIB || !leib(obj)) &&
        obj.name !== "himmel" &&
        !obj.userData.isHydrosphere;
    const TAETER = {};
    for (const [k, v] of Object.entries(R)) if (v > 0) TAETER[k] = v;
    // die Stoffe der wiegenden Nah-Streu: ihr Schlüssel im Stoff-Speicher des Stamms trägt das Glied „|wiegt", wo auch immer —
    // Krone und Jahr folgen ihm (`_foundryTreeMaterial`: „…|wiegt|krone|jahr"); die Linse las bis vegetation.K5 nur das Ende,
    // und die wiegende Streu des Jahrs hieß ihr Streu-Laub im ganzen Freiraum (Ufer 3rd 8,0 %, Ritt 8,1 %, Hang 2,1 %)
    const wiegend = new Set();
    for (const [k, m] of Object.entries(r._foundryMats || {})) if (k.includes("|wiegt")) wiegend.add(m);
    // die Blatt-Karte schneidet ihr Alpha aus dem EINEN Atlas (RGBA; ein komprimierter Atlas zählt die ganze Karte)
    const atlas = r._foliageAtlasTex?.image || null;
    const atlasA =
        atlas && atlas.data?.length === atlas.width * atlas.height * 4 // ohne Atlas (eine Welt ohne Laub: die Prüfbühne nach dem Laden) zählt die ganze Karte — bis w27-studio-mesh warf die Zeile dort (`atlas.width` von null)
            ? (u, v) => {
                  const x = Math.min(atlas.width - 1, Math.max(0, Math.floor(u * atlas.width)));
                  const y = Math.min(atlas.height - 1, Math.max(0, Math.floor(v * atlas.height)));
                  return atlas.data[(y * atlas.width + x) * 4 + 3] / 255;
              }
            : null;
    const m4 = new T.Matrix4();
    const im = new T.Matrix4();
    const va = new T.Vector3();
    const vb = new T.Vector3();
    const vc = new T.Vector3();
    const bs = new T.Sphere();
    // Die Dreiecke eines (Mesh, Instanz) in die Sammler legen, die `nimm(ax..cz)` zulässt. meta: { k, art, mat, cut, karte }
    const metaVon = new Map();
    const metaFuer = (kl, mat, karte) => {
        const key = kl.klasse + "|" + kl.name + "|" + mat.uuid + "|" + (karte ? 1 : 0);
        let me = metaVon.get(key);
        if (!me) {
            me = { k: kl, art: artVonStoff(mat), mat, cut: mat.alphaTest > 0 ? mat.alphaTest : 0.5, karte };
            metaVon.set(key, me);
        }
        return me;
    };
    // DER BESTAND, NIE DER LETZTE PASS (satz-pass): ein Satz (`st.chunkSaetze`: Boden · Wasser · Bau · Streu) zeichnet je Pass
    // nur seinen Abschnitt — Index und `drawRange` gelten der Kamera des letzten Passes (`_chunkSatzAbschnitt`), am
    // Null-Renderer keiner. Die Strahlen lesen darum jede Zelle jedes lebenden Bereichs (`bloecke` → `zellen[].idx`, die Ecken
    // im Satz), deren Hülle die Kugel der Frage trifft. Vorher hieß die Pose der Blick-Wahl frei, deren Haus hinter dem Blick
    // der vorigen Kamera lag (siedlung.K2 an 1ae62f88: der Bau-Satz verdeckte das Ziel in 41,26 m, die Wahl nahm Pose 0).
    // DAS ZIEL IM SATZ: ein Bau-Bereich ist eine Instanz-Gruppe (`_bauSatzBlock`), je lebende Instanz eine Zelle, sie gehört
    // `slotEntry[i]` ihrer Gruppe — die Zelle eines Eintrags in `o.ohne` deckt nie und verdeckt nie, wie jedes andere Ziel.
    const satzVon = new Map();
    for (const s of st.chunkSaetze ? st.chunkSaetze.values() : []) satzVon.set(s.mesh, s);
    const zs = new T.Sphere();
    // die Zelle k eines Bau-Bereichs gehört dem Ziel (`o.ohne`): der Eintrag ihres Slots
    const zielZelle = (b, k) => OHNE.has(st.archInstanceGroups?.get(b.key)?.slotEntry?.[k]?.id);
    const legeDreiecke = (obj, inst, nimm, sammle, kugel) => {
        const g = obj.geometry;
        const pos = g.attributes.position;
        const uv = g.attributes.uv || null;
        const idx = g.index ? g.index.array : null;
        const nIdx = idx ? idx.length : pos.count;
        const dr0 = Math.max(0, g.drawRange.start);
        const dr1 = Math.min(nIdx, g.drawRange.start + (Number.isFinite(g.drawRange.count) ? g.drawRange.count : nIdx));
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        // die Läufe [Index, von, bis, Stoff]: im Satz jede Zelle, sonst die Gruppen im gezeichneten Bereich
        const satz = satzVon.get(obj);
        const gruppen = [];
        if (satz)
            for (const b of satz.bloecke.values())
                b.zellen.forEach((z, i) => !zielZelle(b, i) && kugel(z.huelle.getBoundingSphere(zs)) && gruppen.push([z.idx, 0, z.idx.length, 0]));
        else
            for (const gr of g.groups?.length && Array.isArray(obj.material)
                ? g.groups
                : [{ start: dr0, count: dr1 - dr0, materialIndex: 0 }])
                gruppen.push([idx, Math.max(dr0, gr.start), Math.min(dr1, gr.start + gr.count), gr.materialIndex]);
        const e = eintragVon(obj, inst);
        if (e && OHNE.has(e.id)) return; // das Ziel selbst (o.ohne) deckt nie und verdeckt nie
        if (LEIB && leib(obj) && amZiel(m4)) return; // … und der Leib am Ziel
        // die Ecke, wie das Bild sie zeichnet: ein Leib mit Skelett in seiner Pose (`getVertexPosition`: die Knochen), nie in der Bindung
        const ecke = obj.isSkinnedMesh && obj.skeleton ? (v, i) => obj.getVertexPosition(i, v).applyMatrix4(m4) : (v, i) => v.fromBufferAttribute(pos, i).applyMatrix4(m4);
        for (const [I, s0, s1, mi] of gruppen) {
            const mat = mats[mi] || mats[0];
            if (!mat || mat.visible === false) continue;
            const kl = klasseVon(obj, mat, e);
            if (!kl) continue;
            const karte = !!(atlasA && uv && mat.userData?.foundryKind === "foliageTex");
            const me = metaFuer(kl, mat, karte);
            for (let t = s0; t + 2 < s1; t += 3) {
                const [i0, i1, i2] = I ? [I[t], I[t + 1], I[t + 2]] : [t, t + 1, t + 2];
                ecke(va, i0), ecke(vb, i1), ecke(vc, i2);
                if (!nimm(va, vb, vc)) continue;
                sammle(
                    va,
                    vb,
                    vc,
                    karte ? [uv.getX(i0), uv.getY(i0), uv.getX(i1), uv.getY(i1), uv.getX(i2), uv.getY(i2)] : null,
                    me
                );
            }
        }
    };
    // je (Mesh, Instanz) die Matrix und die Hülle; `fn(obj, inst)` nur für die, deren Hülle `kugel` schneidet
    const jeInstanz = (obj, kugel, fn) => {
        const g = obj.geometry;
        if (!g.boundingSphere) g.computeBoundingSphere();
        const gross = !Number.isFinite(g.boundingSphere.radius) || g.boundingSphere.radius > 1e5;
        const n = obj.isInstancedMesh ? obj.count : 1;
        for (let i = 0; i < n; i++) {
            m4.copy(obj.matrixWorld);
            if (obj.isInstancedMesh) {
                im.fromArray(obj.instanceMatrix.array, i * 16);
                if (Math.abs(im.determinant()) < 1e-12) continue; // ein freier Slot
                m4.multiply(im);
            }
            if (!gross) {
                bs.copy(g.boundingSphere).applyMatrix4(m4);
                if (!(typeof kugel === "function" ? kugel(bs) : bs.intersectsSphere(kugel))) continue;
            } else bs.radius = Infinity; // die Hülle eines Ganzen ohne Maß (der Satz, ein Netz über alles) trifft jedes Feld
            fn(obj, i);
        }
    };
    // was sich dreht, steht nie im Speicher: der Tür- und Tor-Flügel (seine Gruppe trägt `tuer`, `_tickTorFluegel`)
    const dreht = (obj) => !!st.archInstanceGroups?.get(obj.userData.archInstanceKey)?.tuer;
    // … und was wandert: jede Instanz-Schar ohne Gruppe der Welt (die Vögel, `vogel`, setzt jeder Takt neu) — je Frage frisch gelegt,
    // nie im Speicher. Bis w12-proben-tempo hielt der Speicher die Vögel seiner letzten Lage (er legte ohnehin fast jede Frage neu)
    const wandert = (obj) => obj.isInstancedMesh && !obj.userData.archInstanceKey;
    // … und was lebt: ein Leib atmet und geht (nur, wo er Täter ist)
    const bewegt = (obj) => dreht(obj) || wandert(obj) || (LEIB && leib(obj));
    const dynamisch = (obj, inst) => {
        const e = eintragVon(obj, inst);
        return bewegt(obj) || !!(e && o.dyn != null && e.id === o.dyn);
    };
    // der Sammler der Dreiecke (Ecken, Karten-UV, meta) in seine Listen
    const sammler = (tris, uvs, metas) => (a, b, c, u, me) => {
        tris.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
        uvs.push(...(u || [0, 0, 0, 0, 0, 0]));
        metas.push(me);
    };
    // ── DER ORTS-SPEICHER ──
    const ZELLE = 2;
    const zk = (ix, iz) => ix * 65536 + iz;
    let C = window.__nahSpeicher;
    // DER STAND DES GEZEICHNETEN (leib.K4): der Speicher gilt nur dem Bestand, aus dem er gelegt wurde — jeder Slot einer
    // Instanz-Gruppe, der kommt oder geht (der Stufen-Wechsel eines Hauses, `slotStand`), legt ihn neu. Vorher hielt der Gang
    // die Dreiecke seines ersten Bilds: das Haus in 12 m stand dort auf Stufe 1, ging nah auf Stufe 0, und die Linse zählte die
    // nicht mehr gezeichnete Stufe 1 vor der Hülle der Stufe 0 (Bild 1032, Bau 0,9 % — je nach Lade-Takt rot oder grün).
    // DER BESTAND DES FELDS (w12-proben-tempo): der Stand zählte JEDEN Slot jeder Gruppe der Welt (die Summe der `slotStand`) — jeder
    // Wechsel einer Streu oder eines Baums 200 m fern legte den Speicher neu: leib.K4 headless b62542c9 in 204 von 224 Fragen, je
    // Frage ~240 ms, ≈ 70 % des Gangs, und das Urteil hing am Takt der Neulagen (innen „Bau 1“ in der einen Welt, „{}“ in der anderen,
    // derselbe Code). Jetzt gilt der Speicher, solange die Kugel der Frage in SEINEM Feld liegt (`innen`) und dort derselbe Bestand
    // gezeichnet steht: je Satz-Zelle im Feld ihr Block, ihr Platz und ihr Index, je ruhender Instanz im Feld ihr Mesh, ihr Slot und
    // ihre Lage — der Stufen-Wechsel des Hauses im Feld (Mesh und Slot wechseln) legt weiter neu, ein Wechsel draußen nie.
    const feld = (cx, cz, R) => (s) => Math.abs(s.center.x - cx) <= R + s.radius && Math.abs(s.center.z - cz) <= R + s.radius;
    const durchs = (region, fn) => st.scene.traverseVisible((obj) => zaehlt(obj) && jeInstanz(obj, region, (ob, i) => dynamisch(ob, i) || fn(ob, i)));
    // die Quellen eines Felds (je Satz-Zelle und je ruhender Instanz ihr Schlüssel und ihre Hülle in x/z) und ihre Schlüssel in einem Feld
    const quellen = (region, a = []) => (durchs(region, (ob, i) => (satzVon.has(ob) ? satzVon.get(ob).bloecke.forEach((b, k) => b.zellen.forEach((z, j) => region(z.huelle.getBoundingSphere(zs)) && a.push(Object.assign(zs.clone(), { k: k + j + "|" + z.idx.length })))) : a.push(Object.assign(bs.clone(), { k: ob.id + "|" + i + "|" + m4.elements })))), a); // prettier-ignore
    const bei = (qs, region) => qs.filter(region).map((q) => q.k).join();
    // ── DAS ZIEL (K32, die Abnahme des Beweisbilds; o.ziel = { x, y, z, name, saum, r, punkte, tiefe }): liegt es im Bild
    // (Projektion der Spieler-Kamera, vor der Nah-Ebene, |ndc| ≤ 0,95), und zeigt das BILD es? Die EINE Quelle ist die Tiefe der
    // Aufnahme (`o.ziel.tiefe`, `__spiegelDaten`) und ihr Zwilling-Bild OHNE die Boden-Schicht (`tiefe.boden`, `__zielMessen`: Halme der
    // Nah-Wiese, Streu, Wasser verborgen). Je Punkt die Fläche W am Pixel: liegt sie höchstens `saum` (0,5 m) vor ihm, näher als `r`
    // (1,5 m) an ihm oder ist es Himmel, ist der Punkt frei. Sonst fragt das Bild ohne Boden-Schicht: zeigt es den Punkt, stand nur die
    // Boden-Schicht davor — sie verdeckt nur näher als der halbe Ziel-Abstand (wie der Vordergrund der Abnahme); in der fernen Hälfte
    // ist sie der Boden, auf dem das Ziel steht (vegetation.K1#1: der Blick-Punkt im Gras in 14,76 m, das Bild zeigt Halme in 12,62
    // m). Zeigt auch es eine Fläche davor, verdeckt sie — es sei denn, sie gehört dem Ziel (`o.ohne`). Das Urteil fällt allein in den
    // zwei Bildern; die Hülle nennt nur den Namen: die kleinste gezeichnete Hülle, über deren Fuß die Fläche senkrecht steht (eine
    // Fläche, die erst der Shader spannt, hält auf der CPU nur ihren Fuß: die Karte der Fern-Stufe eine Einheits-Linie, 0,9 m Hülle
    // für 3 m Bild; der breite Halm der Ferne, `_halmFerne`). Ohne Tiefe ist `frei` ungemessen. Ein Ziel aus mehreren
    // Leibern (die Herde, tiere.K1) oder mit Fuß nennt seine `punkte`: jeder liegt im Bild und frei, sonst ist das Ziel verdeckt.
    // BIS w18-abnahme-sicht urteilte ein Strahl Auge → Ziel über die Dreiecke der CPU, ohne die Streu, blind für jede Shader-Fläche:
    // siedlung.K4#2 Radeon f3911ab9 „frei 210,41 m“, am Ziel-Pixel stand die Karte einer Erle in 33,31 m — Wald.
    let zielOut = null;
    if (o.ziel) {
        const Z = o.ziel;
        const S = Z.tiefe;
        const punkte = [[Z.x, Z.y, Z.z]].concat(Z.punkte || []);
        // DER PUNKT, DER DURCHFÄLLT (w28-linse-wahr, F der Augen-Karte): `imBild` fragt jeden Punkt, der Grund nennt den ersten, der
        // draußen liegt, mit SEINER Projektion (`Z.punktNamen`: der Fuß, die Glieder). Bis hier nannte er die Mitte —
        // annaeherung-baum/08-4m: der Stamm groß in der Bildmitte, ROT „nicht im Bild (ndc [0,0])“, durchgefallen war der Fuß
        const ndcVon = ([x, y, z]) => {
            const v = new T.Vector3(x, y, z);
            const vorn = v.clone().applyMatrix4(cam.matrixWorldInverse).z < -cam.near;
            v.project(cam);
            return { vorn, ndc: [+v.x.toFixed(3), +v.y.toFixed(3)] };
        };
        const drin = ({ vorn, ndc }) => vorn && Math.abs(ndc[0]) <= 0.95 && Math.abs(ndc[1]) <= 0.95;
        const aussen = punkte.findIndex((p) => !drin(ndcVon(p)));
        const imBild = aussen < 0;
        const zv = ndcVon(punkte[Math.max(0, aussen)]);
        const sieht = ([x, y, z]) => {
            const P = new T.Vector3(x, y, z);
            const L = P.distanceTo(E);
            const v = P.clone().project(cam);
            // außerhalb des Bilds liest der Index ein fremdes Pixel — dann ist `imBild` schon ROT
            const i = Math.floor(((1 - v.y) / 2) * S.th) * S.tw + Math.floor(((v.x + 1) / 2) * S.tw);
            const vor = (W) => W?.distanceTo(E) < L - (Z.saum ?? 0.5) && W.distanceTo(P) > (Z.r ?? 1.5);
            const [W, W0] = [S.punkt(i), S.boden?.punkt(i)];
            const d = W?.distanceTo(E);
            if (!vor(W)) return { d };
            if (!S.boden) return { d, offen: true };
            if (!vor(W0)) return { d, vor: d < L / 2 && "Boden-Schicht" };
            // EIN LEIB IST NIE FLÄCHE DER LINSE — AUCH NICHT VOR DEM ZIEL (w27-ort-pose-voll): das dritte Bild (`S.leib`, ohne
            // Boden-Schicht und ohne Leiber, `__zielMessen`) entscheidet. Zeigt es den Punkt, standen nur Leiber davor: frei, gemeldet
            // beim Namen des nächsten (`leib`). Sonst steht der Verdecker in ihm, und der Name fragt dort: bis hier zeichnete die
            // Tiefe den Leib, die Namens-Suche zählte ihn nicht — an der vollen Stadt verdeckte ein Bewohner 3,7 m vor dem Auge den
            // Fuß des Wohnhauses, und die ±10-m-Hülle einer Kiefer 3,4 m neben der Linie hieß Verdecker („Laub baum_kiefer in 3.73 m";
            // ohne die Leiber GRÜN „frei 14.6 m")
            if (!S.leib) return { d, offen: true };
            const W1 = S.leib.punkt(i);
            if (!vor(W1)) return { d, leib: leibBei(W0) };
            // DER SATZ BEIM NAMEN (w27-ort-pose): seine Hülle ist ohne Maß, die Hüllen-Frage unten übergeht ihn — der Stamm nennt
            // die Zelle, in deren Kasten die Fläche liegt (`_satzZelleBei`). Vorher hieß die Wand eines Hauses im Bau-Satz
            // „fern-ring“, die einzige Hülle über ihrem Fuß (stadt, GTX 1050: „Ziel Blickziel verdeckt von fern-ring in 24.2 m“)
            let h = r._satzZelleBei(W1, S.leib.aus);
            const traegt = (s) => Math.hypot(s.center.x - W1.x, s.center.z - W1.z) <= s.radius + 0.25 && W1.y >= s.center.y - s.radius;
            // DAS ZIEL IM SATZ (wie `legeDreiecke`: die Zelle eines Bau-Bereichs gehört `slotEntry[i]` ihrer Gruppe): steht die Fläche
            // über der Zelle eines Eintrags des Ziels, ist sie das Ziel. Die Suche unten liest keinen Satz — ein Haus, das der
            // Bau-Satz zeichnet, fand so nie seinen Eigner, und die kleinste fremde Hülle über dem Punkt hieß Verdecker (Radeon
            // da0e790f, das Fachwerk-Haus der Station studios.K4: „Ziel Blickziel verdeckt von fern-ring in 27.09 m“)
            for (const s of satzVon.values())
                for (const b of s.bloecke.values())
                    if (b.zellen.some((z, k) => zielZelle(b, k) && traegt(z.huelle.getBoundingSphere(zs)))) return { d };
            st.scene.traverseVisible((obj) => zaehlt(obj) && !S.leib.aus.has(obj) && !satzVon.has(obj) && jeInstanz(obj, traegt, (ob, k) => !(h?.rad <= bs.radius) && (h = { rad: bs.radius, obj: ob, e: eintragVon(ob, k) }))); // prettier-ignore
            if (h?.e && OHNE.has(h.e.id)) return { d };
            return { d: W1.distanceTo(E), vor: h ? klasseVon(h.obj, Array.isArray(h.obj.material) ? h.obj.material[0] : h.obj.material, h.e).name : "Satz oder Gelände" };
        };
        // DER NAME EINES LEIBS: „Leib <klasse>" des Leibs, dessen Lage (die Instanz im Satz, sonst der Ursprung des Meshes) dem
        // Treffer am nächsten liegt — die Klasse des Stamms (`_kopfKlasse`) ohne „-satz" (bewohner, tier …)
        const leibBei = (W) => {
            const [q, m4] = [new T.Vector3(), new T.Matrix4()];
            let [best, bd] = [null, Infinity];
            const nimm = (o) => q.distanceTo(W) < bd && ([best, bd] = [o, q.distanceTo(W)]);
            for (const o of S.leib.leiber)
                if (o.isInstancedMesh) for (let k = 0; k < o.count; k++) o.getMatrixAt(k, m4), q.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld), nimm(o);
                else o.getWorldPosition(q), nimm(o);
            return best ? leibName(best) : "Leib ?";
        };
        const blick = S ? punkte.map(sieht) : [];
        const i = blick.findIndex((b) => b.vor);
        const leib = blick.filter((b) => b.leib);
        zielOut = {
            name: (Z.name || "Ziel") + (aussen > 0 ? ` am ${Z.punktNamen?.[aussen - 1] || `Punkt ${aussen}`}${zv.vorn ? "" : " hinter der Kamera"}` : ""),
            imBild,
            ndc: zv.ndc,
            frei: S && !blick.some((b) => b.offen) ? i < 0 : null,
            vor: i < 0 ? null : (i ? `an Punkt ${i} ` : "") + blick[i].vor,
            vorAbstand: i < 0 ? null : +blick[i].d.toFixed(2),
            // die Punkte, vor denen NUR Leiber standen (frei, gemeldet): ihre Zahl, der nächste Abstand, sein Name
            leiber: leib.length
                ? ((n) => ({ n: leib.length, naechster: +n.d.toFixed(2), name: n.leib }))(leib.reduce((a, b) => (b.d < a.d ? b : a)))
                : null,
            abstand: +Math.hypot(Z.x - E.x, Z.y - E.y, Z.z - E.z).toFixed(2),
        };
    }
    // DAS ZIEL ALLEIN (`o.nurZiel`, die Blick-Wahl je Pose, w18-abnahme-sicht-3): ohne den Speicher und ohne die Strahlen der Nah-Deckung
    if (o.nurZiel) return { ziel: zielOut };

    // gefragt wird nur, was die Zellen dieser Frage tragen: die Kugel und eine Zelle um sie
    const um = feld(E.x, E.z, D + ZELLE);
    if (o.neu || !C || !o.ort || C.id !== o.ort.id || !C.quellen || !C.innen({ center: E, radius: D }) || bei(C.quellen, um) !== bei(quellen(um), um)) {
        const tris = [];
        const uvs = [];
        const metas = [];
        // das Feld liegt um das AUGE der Frage (gefragt wird nur die Kugel um es; `innen` hält es, solange sie darin liegt)
        const R = o.ort ? o.ort.r : 60;
        const { x: cx, z: cz } = E;
        // die Hülle in x/z gegen das Feld
        const region = feld(cx, cz, R);
        const imFeld = (a, b, c) =>
            Math.max(a.x, b.x, c.x) >= cx - R &&
            Math.min(a.x, b.x, c.x) <= cx + R &&
            Math.max(a.z, b.z, c.z) >= cz - R &&
            Math.min(a.z, b.z, c.z) <= cz + R;
        const sammle = sammler(tris, uvs, metas);
        durchs(region, (ob, i) => legeDreiecke(ob, i, imFeld, sammle, region));
        const n = metas.length;
        const ft = new Float32Array(tris);
        const zellen = new Map();
        for (let t = 0; t < n; t++) {
            const b = t * 9;
            const [ix0, ix1, iz0, iz1] = [[0, Math.min], [0, Math.max], [2, Math.min], [2, Math.max]].map(([k, f]) => Math.floor(f(ft[b + k], ft[b + 3 + k], ft[b + 6 + k]) / ZELLE)); // prettier-ignore
            for (let ix = ix0; ix <= ix1; ix++)
                for (let iz = iz0; iz <= iz1; iz++) {
                    const k = zk(ix, iz);
                    let l = zellen.get(k);
                    if (!l) zellen.set(k, (l = []));
                    l.push(t);
                }
        }
        C = window.__nahSpeicher = {
            id: o.ort ? o.ort.id : "?",
            innen: feld(cx, cz, R - 2 * D),
            quellen: quellen(region),
            tris: ft,
            uvs: new Float32Array(uvs),
            metas,
            zellen,
            stempel: new Int32Array(n),
            lauf: 0,
        };
    }
    // ── die Dreiecke in der Nah-Kugel: aus dem Speicher (Zellen der Kugel) und das Bewegte frisch ──
    const tri = [];
    const uvt = [];
    const meta = [];
    // je Achse der Punkt der Dreiecks-Hülle, der dem Auge am nächsten liegt (geklemmt), sein Abstand gegen die Kugel
    // (dieselbe Klemme und Summe über die Vektor-Rechnung: die Schleife über Schlüssel-Texte trug 2,4 ms je Frage, leib.K4)
    const [lo, hi, nb] = [1, 2, 3].map(() => new T.Vector3());
    const inKugel = (a, b, c) => nb.copy(E).clamp(lo.copy(a).min(b).min(c), hi.copy(a).max(b).max(c)).distanceToSquared(E) <= D2;
    C.lauf++;
    {
        const ft = C.tris;
        for (let ix = Math.floor((E.x - D) / ZELLE); ix <= Math.floor((E.x + D) / ZELLE); ix++)
            for (let iz = Math.floor((E.z - D) / ZELLE); iz <= Math.floor((E.z + D) / ZELLE); iz++) {
                const l = C.zellen.get(zk(ix, iz));
                if (!l) continue;
                for (const t of l) {
                    if (C.stempel[t] === C.lauf) continue;
                    C.stempel[t] = C.lauf;
                    const b = t * 9;
                    if (!inKugel(va.fromArray(ft, b), vb.fromArray(ft, b + 3), vc.fromArray(ft, b + 6))) continue;
                    tri.push(...ft.subarray(b, b + 9));
                    uvt.push(...C.uvs.subarray(t * 6, t * 6 + 6));
                    meta.push(C.metas[t]);
                }
            }
    }
    const kugel = new T.Sphere(E, D);
    st.scene.traverseVisible((obj) => {
        if (!zaehlt(obj) || (o.dyn == null && !bewegt(obj))) return;
        jeInstanz(obj, kugel, (ob, i) => {
            if (dynamisch(ob, i)) legeDreiecke(ob, i, inKugel, sammler(tri, uvt, meta));
        });
    });
    // die Maske je Stoff, frisch gelesen (ein Schmuggel nimmt sie)
    const maskeVon = new Map();
    const maskeArt = (me) => {
        if (maskeVon.has(me.mat)) return maskeVon.get(me.mat);
        const mat = me.mat;
        const maske = !!mat.maskNode?.isNode;
        const a = !maske ? null : knoten ? ["laub", "rinde", "boden"].find((k) => mat.maskNode === knoten[k]) || "fremd" : me.art || "rinde";
        maskeVon.set(mat, a);
        return a;
    };
    // ── das Gitter: je Dreieck die Zellen, die seine Projektion deckt — vor der Nah-Ebene der Kamera geklippt (was hinter
    // ihr liegt, zeichnet die GPU nie) ──
    const gw = o.gw || 48;
    const gh = o.gh || 27;
    const zellen = Array.from({ length: gw * gh }, () => []);
    const V = cam.matrixWorldInverse.elements;
    const Pm = cam.projectionMatrix.elements;
    const near = cam.near;
    const nT = meta.length;
    // je Dreieck: Ecke 0 und die zwei Kanten (Möller–Trumbore), Skalare
    const G = new Float64Array(nT * 9);
    const vz = [0, 0, 0];
    const vx = [0, 0, 0];
    const vy = [0, 0, 0];
    const poly = [];
    for (let t = 0; t < nT; t++) {
        const b = t * 9;
        for (let k = 0; k < 3; k++) {
            [G[b + k], G[b + 3 + k], G[b + 6 + k]] = [tri[b + k], tri[b + 3 + k] - tri[b + k], tri[b + 6 + k] - tri[b + k]];
            const [x, y, z] = tri.slice(b + k * 3, b + k * 3 + 3);
            [vx[k], vy[k], vz[k]] = [0, 1, 2].map((j) => V[j] * x + V[4 + j] * y + V[8 + j] * z + V[12 + j]);
        }
        poly.length = 0;
        for (let k = 0; k < 3; k++) {
            const j = (k + 1) % 3;
            const vorn = vz[k] <= -near;
            if (vorn) poly.push(vx[k], vy[k], vz[k]);
            if (vorn !== vz[j] <= -near) {
                const s = (-near - vz[k]) / (vz[j] - vz[k]);
                poly.push(vx[k] + (vx[j] - vx[k]) * s, vy[k] + (vy[j] - vy[k]) * s, -near);
            }
        }
        if (!poly.length) continue;
        let x0 = Infinity,
            x1 = -Infinity,
            y0 = Infinity,
            y1 = -Infinity;
        for (let q = 0; q < poly.length; q += 3) {
            const w = -poly[q + 2];
            const nx = (Pm[0] * poly[q] + Pm[8] * poly[q + 2]) / w;
            const ny = (Pm[5] * poly[q + 1] + Pm[9] * poly[q + 2]) / w;
            [x0, x1, y0, y1] = [Math.min(x0, nx), Math.max(x1, nx), Math.min(y0, ny), Math.max(y1, ny)];
        }
        if (x1 < -1 || x0 > 1 || y1 < -1 || y0 > 1) continue;
        const cx0 = Math.max(0, Math.floor(((x0 + 1) / 2) * gw - 0.5));
        const cx1 = Math.min(gw - 1, Math.ceil(((x1 + 1) / 2) * gw - 0.5));
        const cy0 = Math.max(0, Math.floor(((1 - y1) / 2) * gh - 0.5));
        const cy1 = Math.min(gh - 1, Math.ceil(((1 - y0) / 2) * gh - 0.5));
        for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) zellen[cy * gw + cx].push(t);
    }
    // DER SCHNITT (Möller–Trumbore): der Strahl e + s·r gegen das Dreieck (Ecke a, Kanten k, l) — s, die Lage im Dreieck in UV,
    // NaN ohne Treffer; ihn rufen die Strahlen
    const UV = { u: 0, v: 0 };
    const schnitt = (rx, ry, rz, ax, ay, az, kx, ky, kz, lx, ly, lz) => {
        const px = ry * lz - rz * ly;
        const py = rz * lx - rx * lz;
        const pz = rx * ly - ry * lx;
        const det = kx * px + ky * py + kz * pz;
        if (det > -1e-12 && det < 1e-12) return NaN;
        const inv = 1 / det;
        const tx = E.x - ax;
        const ty = E.y - ay;
        const tz = E.z - az;
        const u = (tx * px + ty * py + tz * pz) * inv;
        if (u < 0 || u > 1) return NaN;
        const qx = ty * kz - tz * ky;
        const qy = tz * kx - tx * kz;
        const qz = tx * ky - ty * kx;
        const v = (rx * qx + ry * qy + rz * qz) * inv;
        if (v < 0 || u + v > 1) return NaN;
        UV.u = u;
        UV.v = v;
        return (lx * qx + ly * qy + lz * qz) * inv;
    };
    // ── die Strahlen ──
    const dir = new T.Vector3();
    const fwd = cam.getWorldDirection(new T.Vector3());
    const treffer = [];
    let deckung = 0;
    const jeKlasse = {};
    const jeName = {};
    const { x: ex, y: ey, z: ez } = E;
    for (let cy = 0; cy < gh; cy++)
        for (let cx = 0; cx < gw; cx++) {
            const l = zellen[cy * gw + cx];
            if (!l.length) continue;
            const nx = ((cx + 0.5) / gw) * 2 - 1;
            const ny = 1 - ((cy + 0.5) / gh) * 2;
            dir.set(nx, ny, 0.5).unproject(cam).sub(E).normalize();
            const { x: dx, y: dy, z: dz } = dir;
            // die Tiefe längs der Blickachse je Meter des Strahls: die GPU klippt an der Nah-EBENE (z = −near)
            const cosA = dx * fwd.x + dy * fwd.y + dz * fwd.z;
            treffer.length = 0;
            for (const t of l) {
                const b = t * 9;
                const d = schnitt(dx, dy, dz, G[b], G[b + 1], G[b + 2], G[b + 3], G[b + 4], G[b + 5], G[b + 6], G[b + 7], G[b + 8]);
                if (!(d <= D) || d * cosA < near) continue;
                const me = meta[t];
                if (me.karte) {
                    const { u, v } = UV;
                    const ub = t * 6;
                    const w0 = 1 - u - v;
                    const su = w0 * uvt[ub] + u * uvt[ub + 2] + v * uvt[ub + 4];
                    const sv = w0 * uvt[ub + 1] + u * uvt[ub + 3] + v * uvt[ub + 5];
                    if (atlasA(su, sv) < me.cut) continue;
                }
                treffer.push({ d, me });
            }
            if (!treffer.length) continue;
            treffer.sort((a, b) => a.d - b.d);
            let m = 0;
            for (const h of treffer) {
                const me = h.me;
                const ma = maskeArt(me);
                let w = 1;
                if (ma) {
                    const p = { x: ex + dx * h.d, y: ey + dy * h.d, z: ez + dz * h.d };
                    w = gewicht(p, ma === "fremd" ? me.art : ma);
                }
                if (w > m) {
                    if (TAETER[me.k.klasse] && h.d <= TAETER[me.k.klasse] && !(UEBER[me.k.klasse] > ey + dy * h.d)) {
                        const a = w - m;
                        deckung += a;
                        jeKlasse[me.k.klasse] = (jeKlasse[me.k.klasse] || 0) + a;
                        jeName[me.k.name] = (jeName[me.k.name] || 0) + a;
                    }
                    m = w;
                }
                if (m >= 1) break;
            }
        }
    const N = gw * gh;
    const rund = (x) => +(x / N).toFixed(4);
    const kl = {};
    for (const [k, v] of Object.entries(jeKlasse)) kl[k] = rund(v);
    const nm = {};
    for (const [k, v] of Object.entries(jeName)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4))
        nm[k] = rund(v);
    // die Leiber beim Namen (die drei größten), auch wo andere Täter die ersten vier Namen tragen
    const leibNamen = Object.entries(jeName).filter(([k]) => k.startsWith("Leib ")).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return {
        deckung: rund(deckung),
        jeKlasse: kl,
        taeter: nm,
        leib: jeKlasse.Leib ? { deckung: rund(jeKlasse.Leib), taeter: Object.fromEntries(leibNamen.map(([k, v]) => [k, rund(v)])) } : null,
        taeterDreiecke: meta.filter((me) => TAETER[me.k.klasse]).length,
        auge: [E.x, E.y, E.z].map((v) => +v.toFixed(2)),
        fremd: meta.some((me) => maskeArt(me) === "fremd"),
        ziel: zielOut,
    };
}

// WAS DIE KAMERA ZEICHNET (rein; die EINE Frage jeder Fläche der Linse): ein Mesh mit Ecken, sichtbarem Stoff, in den Lagen
// der Kamera (der Schatten-Zwilling, SHADOW_TWIN_LAYER, wirft nur in den Kaskaden) — und nie ein GAST DES VORBAUS
// (`__vorbauGast`, `_vorbauBedienung`: der Geist eines Hotbar-Bauplans, der Leib einer Seele). Der Render-Pfad baut ihn ohne
// Draw (`_renderObjectDirect`, stamm/bild-kosten.js: `gast` → `zeichne(…, nurBauen)`), und er steht am Ort des Spielers:
// bis w10-figur zählte die Linse ihn als Fläche — haar.K2#1 Radeon 2674ff9a „Vordergrund 27,8 % näher als 0,35 m:
// vorbau:fahrzeug_gt“ und „Ziel verdeckt von vorbau:fahrzeug_gt in 3,31 m“, ein Wagen, den kein Bild zeigt.
const kameraZeichnet = (o, cam) =>
    o.isMesh && o.geometry?.attributes.position && o.material?.visible !== false && !o.__vorbauGast && o.layers.test(cam.layers);

// IST DAS EIN LEIB (die EINE Grenze der Leib-Klasse: die Nah-Linse oben, das Bild ohne Leiber der Abnahme `__zielMessen`): ein Mesh
// mit Skelett, die Senke eines Gang-Satzes (`userData.gang`: Tier und Bewohner fern) oder ein Glied unter der Wurzel eines Leibs
// (`_taeterKlasse`: der Spieler `spieler`, jeder Bewohner `bewohner`, jedes Tier `tier:<seele>` — sein Baum der Glieder trägt
// auch Teile ohne Skelett, die bis hier „Bau“ hießen)
const istLeib = (o) => !!(o.isSkinnedMesh || o.userData?.gang || /^(spieler|bewohner|tier:)/.test(window.anazhRealm._taeterKlasse(o)));

module.exports = {
    kameraZeichnet,
    nahDeckungInSeite,
    istLeib,
    KAMERA_NAH_INSTALL: `window.__kameraZeichnet = ${kameraZeichnet}; window.__istLeib = ${istLeib}; window.__nahDeckung = ${nahDeckungInSeite};`,
};
