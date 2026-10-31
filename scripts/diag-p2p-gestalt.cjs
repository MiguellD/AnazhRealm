// diag-p2p-gestalt.cjs — P2P-GESTALT: DIE STUDIO-ÜBERGABE REIST ZU DEN PEERS.
// Der soul-Kanal (_p2pBroadcastSoul) trägt die Avatar-Übergabe additiv, der Empfänger (_p2pMsgSoul)
// validiert sie durch DENSELBEN Validator (_studioUebergabeValidate — EINE Quelle) und legt
// sie als PER-PEER-Wahrheit (entry.uebergabe) ab; der Peer-Guss (_p2pApplyPeerSoul) führt sie
// transient über _activePeerUebergabe in den EINEN Leser _koerperStudioDials (try/finally räumt
// sie IMMER — kein Leck in den lokalen Stat-/Guss-Read). Diese Linse hält die Naht:
//
//   (S) SELBST-TEST (nicht vakuös): ein Peer OHNE uebergabe-Feld baut den DEFAULT-Avatar
//       (Farb-Fingerabdruck == der lokale Default) — d. h. die Linse KANN Gleichheit sehen.
//   (N) NAHT: ein Peer-soul mit Übergabe (skinTone porzellan · topColor blue · hairColor black,
//       direkt an _p2pMsgSoul) ⇒ sein Avatar trägt MESSBAR die FREMDE Gestalt (Farb-Set enthält
//       porzellan-Haut, ≠ Default-Peer, ≠ eigener Avatar).
//   (W) WÄNDE: kaputte Payloads (falsches kind · NaN-only · Riesen-String > Taille · erfundene
//       Farben) fallen am SELBEN Validator fail-closed ⇒ der Peer baut den Default (kein Wurf).
//   (M) KEINE VERGIFTUNG: zwei Peers mit VERSCHIEDENER Gestalt ⇒ zwei DISTINKTE Ofen-Memo-
//       Einträge (der mensch-Ofen-Key trägt Dials+Gestalt+Guss-Farben) — die Avatare bleiben
//       eigenständig.
//   (E) DER EIGENE AVATAR bleibt byte-identisch, wenn ein Peer-Payload ankommt (der transiente
//       Kontext leckt nicht: _activePeerUebergabe ist nach dem Peer-Guss wieder leer).
//
//   node scripts/diag-p2p-gestalt.cjs
"use strict";
const { statikServer, hauptLauf, nullSeite, pruefer, wandEnde } = require("./lib/welt-boot.cjs");

const server = statikServer();

const { errs, check } = pruefer();

hauptLauf(async () => {
    await server.lausche(0);
    const { browser, page } = await nullSeite({ frist: 300000 });
    await server.zeige(page, 30000);

    const out = await page.evaluate(async () => {
        const res = { s: {}, n: {}, w: {}, m: {}, e: {}, k: {} };
        // Farb-Set eines Peer-Meshes (Vertex-color-Attribut, Render-Diät-Muster).
        const colorsOf = (g) => {
            const set = new Set();
            if (!g) return set;
            g.traverse((o) => {
                const c = o.geometry && o.geometry.attributes && o.geometry.attributes.color;
                if (c && c.array && c.array.length >= 3)
                    set.add([c.array[0], c.array[1], c.array[2]].map((v) => v.toFixed(3)).join(","));
            });
            return set;
        };
        const fpGroup = window.__abdruck; // der EINE Abdruck (welt-boot)
        const lin = (hx) => {
            const f = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
            return [f(((hx >> 16) & 255) / 255), f(((hx >> 8) & 255) / 255), f((hx & 255) / 255)]
                .map((v) => v.toFixed(3))
                .join(",");
        };

        // ── Warm-Anker: Boot → f.ready → mensch-Rezept ──
        await window.__weltDa();
        const A = AnazhRealm;
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.mensch && !f._vorrat);
        if (!(f && f.ready && f.recipes && f.recipes.mensch)) return { fatal: "mensch-Rezept kam nie" };
        const kc = window.__koerperCore;
        if (!kc) return { fatal: "koerper-Core fehlt" };
        const porzellanLin = lin(kc.SKIN_TONES.porzellan.hex >>> 0);

        // Minimales P2P-Bett (kein echtes Netz — der Empfangs-Chokepoint direkt).
        st.p2p = st.p2p || {};
        st.p2p.enabled = true;
        st.p2p.peerId = "self";
        st.p2p.peers = new Map();

        // Der eigene Avatar existiert (playerMesh) — Fingerabdruck VOR jedem Peer.
        try {
            r.applyPlayerSoul("human");
        } catch {}
        res.e.eigenVorher = fpGroup(st.playerMesh);

        const peerMesh = (pid) => {
            const ent = st.p2p.peers.get(pid);
            return ent && ent.mesh;
        };

        // ── (S) DEFAULT-PEER: soul human OHNE uebergabe ⇒ Default-Gestalt ──
        r._p2pMsgSoul({ peerId: "D", soulName: "human" }, st.p2p);
        const cD = colorsOf(peerMesh("D"));
        res.s.defaultBuilt = cD.size > 0;
        // der lokale Default (kein Übergabe-State) — dieselbe Gestalt wie der Default-Peer.
        const cLocal = colorsOf(st.playerMesh);
        res.s.defaultGleichtLokal = [...cD].some((x) => cLocal.has(x)) && cD.size === cLocal.size;

        // ── (N) ÜBERGABE-PEER: fremde Gestalt reist im soul-Payload ──
        r._p2pMsgSoul(
            {
                peerId: "A",
                soulName: "human",
                uebergabe: { koerper: { height: 1.0, skinTone: "porzellan", topColor: "blue", hairColor: "black" } },
            },
            st.p2p
        );
        const cA = colorsOf(peerMesh("A"));
        res.n.built = cA.size > 0;
        res.n.traegtFremdHaut = cA.has(porzellanLin);
        res.n.verschiedenVomDefault = [...cA].some((x) => !cD.has(x)) || cA.size !== cD.size;
        res.n.entryUebergabe = !!(st.p2p.peers.get("A") && st.p2p.peers.get("A").uebergabe);

        // ── (W) WÄNDE: kaputte Payloads fallen am SELBEN Validator ──
        // (a) falsches kind (die Broadcast-Form trägt nur koerper — ein kreatur-Feld
        //     wird gar nicht erst als koerper gelesen); (b) NaN-only s + erfundene Farbe.
        r._p2pMsgSoul(
            {
                peerId: "W",
                soulName: "human",
                uebergabe: { koerper: { height: NaN, skinTone: "erfunden_xyz" } },
            },
            st.p2p
        );
        const cW = colorsOf(peerMesh("W"));
        res.w.faelltAufDefault = [...cW].every((x) => cD.has(x)) && cW.size === cD.size;
        res.w.keineFremdHaut = !cW.has(porzellanLin);
        res.w.entryLeer = !(st.p2p.peers.get("W") && st.p2p.peers.get("W").uebergabe);
        // (c) Riesen-String > Taille-Cap ⇒ Validator null ⇒ Default.
        const riese = "x".repeat((A.TAILLE_UNKNOWN_FIELD_MAX || 8192) + 100);
        r._p2pMsgSoul(
            {
                peerId: "R",
                soulName: "human",
                uebergabe: { koerper: { height: 1, topColor: riese } },
            },
            st.p2p
        );
        res.w.rieseEntryLeerOderGeclampt = (() => {
            const u = st.p2p.peers.get("R") && st.p2p.peers.get("R").uebergabe;
            // Der Riesen-String fällt (Taille-Cap, nicht in CLOTH_COLORS + FORM-Wand) ⇒ die Prägung trägt NIE den Riesen.
            return !u || u.topColor !== riese;
        })();

        // ── (M) KEINE VERGIFTUNG: zwei Peers, zwei distinkte Ofen-Keys ──
        const memo = A._tierOfenMemo;
        const keysMit = memo ? [...memo.keys()].filter((k) => k.indexOf("mensch|") === 0) : [];
        // Peer B: andere Haut ⇒ anderer skinColor im Key ⇒ eigener Memo-Eintrag.
        r._p2pMsgSoul(
            {
                peerId: "B",
                soulName: "human",
                uebergabe: { koerper: { height: 1.0, skinTone: "sand", topColor: "grey" } },
            },
            st.p2p
        );
        const keysNach = memo ? [...memo.keys()].filter((k) => k.indexOf("mensch|") === 0) : [];
        res.m.distinkteKeys = new Set(keysNach).size >= 3; // Default + porzellan + sand
        res.m.peerBFremd = (() => {
            const cB = colorsOf(peerMesh("B"));
            return [...cB].some((x) => !cA.has(x)) && cB.size > 0;
        })();
        res.m.keysVor = keysMit.length;
        res.m.keysNach = keysNach.length;

        // ── (E) DER EIGENE AVATAR bleibt byte-identisch (kein transienter Leck) ──
        res.e.eigenNachher = fpGroup(st.playerMesh);
        res.e.activeLeer = r._activePeerUebergabe === undefined || r._activePeerUebergabe === null;
        // Erneuter EIGENER Guss nach all den Peer-Güssen ⇒ Default (die eigene Übergabe ist leer).
        try {
            r.applyPlayerSoul("human");
        } catch {}
        const cLocalNach = colorsOf(st.playerMesh);
        res.e.eigenKeineFremdHaut = !cLocalNach.has(porzellanLin);

        // ── (K) DIE NAHT AM VERHALTEN: der Broadcast trägt nur koerper (ohne den Samen), der Peer führt vor der eigenen
        // Prägung, der Empfang klemmt durch DENSELBEN Prüfer ──
        const pr = r._ensureWorkshopState().studioOv,
            pr0 = JSON.stringify(pr),
            p2pAn = st.p2p.enabled,
            sent = [],
            echtV = r._studioWerkPruefen;
        r.p2pSend = (m) => sent.push(m);
        st.p2p.enabled = true;
        pr.mensch = { height: 1.1, __gestalt: 3 };
        pr.wolf = { size: 3 };
        r._p2pBroadcastSoul();
        delete r.p2pSend;
        res.k.nurKoerper = !!sent[0] && JSON.stringify(sent[0].uebergabe) === '{"koerper":{"height":1.1}}';
        r._activePeerUebergabe = { height: 1.3 };
        res.k.peerFuehrt = r._koerperStudioDials().height === 1.3;
        r._activePeerUebergabe = null;
        res.k.eigen = r._koerperStudioDials().height === 1.1;
        r._ensureWorkshopState().studioOv = JSON.parse(pr0);
        st.p2p.enabled = p2pAn;
        let validiert = 0;
        r._studioWerkPruefen = function (art, ...x) {
            if (art === "koerper") validiert++;
            return echtV.call(this, art, ...x);
        };
        try {
            r._p2pMsgSoul({ peerId: "K", soulName: "human", uebergabe: { koerper: { height: 1 } } }, st.p2p);
        } catch {}
        delete r._studioWerkPruefen;
        res.k.einValidator = validiert > 0;

        return res;
    });

    await browser.close();
    server.close();

    console.log("\n===== P2P-GESTALT — die Übergabe reist zu den Peers =====\n");
    if (!out || out.fatal) {
        console.log("FEHLER:", out ? out.fatal : "?");
        process.exit(1);
    }
    check("(S) ein Peer OHNE Übergabe baut den Default-Avatar", out.s.defaultBuilt === true);
    check(
        "(S) der Default-Peer gleicht dem lokalen Default (die Linse KANN Gleichheit sehen)",
        out.s.defaultGleichtLokal === true
    );
    check(
        "(N) der Übergabe-Peer wurde gebaut + trägt einen entry.uebergabe",
        out.n.built === true && out.n.entryUebergabe === true
    );
    check("(N) der Peer-Avatar trägt die FREMDE Haut (porzellan im Farb-Set)", out.n.traegtFremdHaut === true);
    check("(N) und ist verschieden vom Default-Peer", out.n.verschiedenVomDefault === true);
    check(
        "(W) kaputter Payload (NaN + erfundene Farbe) fällt fail-closed auf den Default",
        out.w.faelltAufDefault === true && out.w.keineFremdHaut === true && out.w.entryLeer === true
    );
    check("(W) Riesen-String > Taille wird gesiebt (nie getragen)", out.w.rieseEntryLeerOderGeclampt === true);
    check(
        `(M) zwei Peers ⇒ distinkte Ofen-Memo-Keys (${out.m.keysVor}→${out.m.keysNach})`,
        out.m.distinkteKeys === true
    );
    check("(M) Peer B trägt eine eigenständige Gestalt (keine Vergiftung von A)", out.m.peerBFremd === true);
    check(
        `(E) der EIGENE Avatar bleibt byte-identisch (${out.e.eigenVorher} == ${out.e.eigenNachher})`,
        out.e.eigenVorher === out.e.eigenNachher
    );
    check("(E) der transiente Peer-Kontext leckt nicht (_activePeerUebergabe leer)", out.e.activeLeer === true);
    check("(E) der eigene Neu-Guss trägt KEINE fremde Haut", out.e.eigenKeineFremdHaut === true);
    check("(K) der soul-Broadcast trägt die Übergabe additiv, nur koerper", out.k.nurKoerper === true);
    check(
        "(K) beim Peer-Guss führt die Übergabe des Senders vor der eigenen",
        out.k.peerFuehrt === true && out.k.eigen === true
    );
    check(
        "(K) der Empfang klemmt durch DENSELBEN Prüfer wie der Übergabe-Kanal (_studioWerkPruefen)",
        out.k.einValidator === true
    );

    wandEnde(errs, "die Studio-Übergabe reist zu den Peers: der soul-Kanal trägt die Avatar-Gestalt, der Empfänger validiert am SELBEN Validator, der Peer-Guss führt sie transient (kein Leck), zwei Peers bleiben eigenständig (distinkte Ofen-Keys), und der eigene Avatar ist unberührt.");
});
