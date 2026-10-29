"use strict";
// scripts/playtest/netz.cjs — der Richter von Netz (spec/stamm/modul-karte.json): Einladung · WebRTC-Mesh · Lockstep · Stimme · Welt-Bündel · Vibe-Pass · Signaturen · Regionen · Pins und Hallen · Bann · Portal-Eintritt · Ko-Präsenz · Dwelling · Portal-Server.
// 10 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const fs = require("fs");
const path = require("path");
const { safeEvaluate } = require("../playtest.cjs");
const SKRIPTE = path.join(__dirname, "..");

async function checkBandW13W14VibePassLibrary(ctx) {
    const { page, check, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Vibe-Pass: die souveräne Avatar-Identität ###
    const w13p1Results = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const out = {};
        // Identität ist nach init bereit.
        const vp = r.state.vibePass;
        out.ready = !!vp && vp.ready === true;
        // vibePassId — kanonisches ed25519:<64hex>-Format.
        const id = r.vibePassId();
        out.idFormat = typeof id === "string" && /^ed25519:[0-9a-f]{64}$/.test(id);
        // localStorage trägt den privaten Schlüssel als JWK.
        let stored = null;
        try {
            stored = JSON.parse(localStorage.getItem("anazh.vibePass"));
        } catch {
            stored = null;
        }
        out.persisted =
            !!stored &&
            stored.schemaVersion === "vibepass-1" &&
            !!stored.privateKeyJwk &&
            stored.privateKeyJwk.kty === "OKP" &&
            stored.privateKeyJwk.crv === "Ed25519" &&
            typeof stored.privateKeyJwk.d === "string" &&
            typeof stored.privateKeyJwk.x === "string";
        // Erneutes _ensureVibePass lädt denselben Schlüssel (kein Neu-Erzeugen).
        const idBefore = r.vibePassId();
        await r._ensureVibePass();
        out.idStable = r.vibePassId() === idBefore;
        // Fingerprint — Kurzform aus den ersten 16 Hex-Zeichen.
        out.fingerprint = typeof vp.fingerprint === "string" && vp.fingerprint.replace(/ /g, "").length === 16;
        // Signieren liefert eine 64-Byte-Signatur (128 Hex).
        const sig = await r._vibeSign("anazh-vibe-pass-test");
        out.signHex = typeof sig === "string" && /^[0-9a-f]{128}$/.test(sig);
        // Verifizieren: gültige Signatur → true.
        out.verifyValid = (await r._vibeVerify("anazh-vibe-pass-test", sig, vp.publicKeyHex)) === true;
        // Manipulierte Nachricht → false.
        out.verifyTampered = (await r._vibeVerify("anazh-vibe-pass-TAMPERED", sig, vp.publicKeyHex)) === false;
        // Falscher öffentlicher Schlüssel → false.
        out.verifyWrongKey = (await r._vibeVerify("anazh-vibe-pass-test", sig, "0".repeat(64))) === false;
        // Defensiv: Müll-Eingabe wirft nicht, liefert false.
        out.verifyDefensive =
            (await r._vibeVerify("x", null, null)) === false && (await r._vibeVerify("x", "zzz", "kurz")) === false;
        // Genesis-Erinnerung im Journal (Typ "ritual"): der 200-FIFO-Cap kann den frühen Eintrag evicten →
        // primär den cap-unabhängigen seen-Schlüssel "vibepass:genesis" (journalAppendOnce) prüfen,
        // den entries-Scan nur als Fallback.
        const wj = r.state.worldJournal || {};
        const entries = wj.entries || [];
        out.journalGenesis =
            !!(wj.seen && wj.seen["vibepass:genesis"] === true) ||
            entries.some((e) => e && e.type === "ritual" && /Vibe-Pass/.test(e.text || ""));
        // Sicherheit: der private Schlüssel darf NIE im Welt-Save landen.
        const snapJson = JSON.stringify(r.buildStateSnapshot());
        out.snapshotClean = snapJson.indexOf(vp._privateKeyJwk.d) === -1 && snapJson.indexOf('"vibePass"') === -1;
        // Export → Import-Rundlauf bewahrt die Identität.
        const exported = r.exportVibePass();
        out.exportShape = !!exported && exported.schemaVersion === "vibepass-1" && !!exported.privateKeyJwk;
        const imp = await r.importVibePass(exported, { skipConfirm: true });
        out.importRoundTrip = !!imp && imp.ok === true && r.vibePassId() === idBefore;
        const impBad = await r.importVibePass({ nonsense: true }, { skipConfirm: true });
        out.importRejectsGarbage = !!impBad && impBad.ok === false;
        // UI.
        out.uiSection = !!document.getElementById("vibe-pass-section");
        const body = document.getElementById("vibe-pass-body");
        out.uiBody = !!body && body.textContent.indexOf(vp.fingerprint) !== -1;
        out.uiButtons =
            !!document.getElementById("vibe-pass-export") &&
            !!document.getElementById("vibe-pass-import") &&
            !!document.getElementById("vibe-pass-file-input");
        return out;
    });

    if (w13p1Results && !w13p1Results.error) {
        check("W13 P1: Vibe-Pass ist nach init bereit", w13p1Results.ready);
        check("W13 P1: vibePassId liefert ed25519:<64hex>", w13p1Results.idFormat);
        check("W13 P1: privater Schlüssel als JWK in localStorage persistiert", w13p1Results.persisted);
        check("W13 P1: erneutes _ensureVibePass lädt denselben Schlüssel", w13p1Results.idStable);
        check("W13 P1: Fingerprint = 16 Hex-Zeichen in Vierergruppen", w13p1Results.fingerprint);
        check("W13 P1: _vibeSign liefert eine 64-Byte-Signatur (128 Hex)", w13p1Results.signHex);
        check("W13 P1: _vibeVerify akzeptiert eine gültige Signatur", w13p1Results.verifyValid);
        check("W13 P1: _vibeVerify weist eine manipulierte Nachricht ab", w13p1Results.verifyTampered);
        check("W13 P1: _vibeVerify weist einen falschen Schlüssel ab", w13p1Results.verifyWrongKey);
        check("W13 P1: _vibeVerify ist defensiv gegen Müll-Eingabe", w13p1Results.verifyDefensive);
        check("W13 P1: Genesis-Erinnerung (ritual) im Journal", w13p1Results.journalGenesis);
        check("W13 P1: privater Schlüssel leckt NICHT in den Welt-Save", w13p1Results.snapshotClean);
        check("W13 P1: exportVibePass liefert ein gültiges Sicherungs-Objekt", w13p1Results.exportShape);
        check("W13 P1: Export→Import-Rundlauf bewahrt die Identität", w13p1Results.importRoundTrip);
        check("W13 P1: importVibePass weist ungültige Daten ab", w13p1Results.importRejectsGarbage);
        check("W13 P1: Vibe-Pass-Sektion im DOM", w13p1Results.uiSection);
        check("W13 P1: Vibe-Pass-Body zeigt den Fingerprint", w13p1Results.uiBody);
        check("W13 P1: Sichern/Wiederherstellen-Knöpfe + File-Input im DOM", w13p1Results.uiButtons);
    } else {
        check("W13 P1: Vibe-Pass-Tests laufen", false, w13p1Results ? w13p1Results.error : "no result");
    }

    // ### Bauplan-Signaturen ###
    const w13p2Results = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const out = {};
        // Einen eigenen Bauplan mit einem Part anlegen.
        if (r.state.blueprints["_w13p2"]) delete r.state.blueprints["_w13p2"];
        r.createBlueprint("_w13p2", "W13P2-Werk");
        r.addPartToBlueprint("_w13p2", { shape: "box", material: "stein" });
        const bp = r.state.blueprints["_w13p2"];
        // _canonicalBlueprint ist deterministisch.
        out.canonDeterministic = r._canonicalBlueprint(bp) === r._canonicalBlueprint(bp);
        // Das Label ist NICHT Teil der signierten Substanz.
        const canonA = r._canonicalBlueprint(bp);
        bp.label = "Ein anderer Name";
        out.canonIgnoresLabel = r._canonicalBlueprint(bp) === canonA;
        bp.label = "W13P2-Werk";
        // Vor dem Signieren: Status "unsigned".
        out.statusUnsigned = (await r.verifyBlueprintSignature(bp)) === "unsigned";
        // Signieren.
        const signRes = await r.signBlueprint("_w13p2", { skipConfirm: true });
        out.signOk = !!signRes && signRes.ok === true;
        out.signFields =
            typeof bp.signature === "string" &&
            /^[0-9a-f]{128}$/.test(bp.signature) &&
            bp.authorPubKey === r.state.vibePass.publicKeyHex &&
            typeof bp.signedHash === "string" &&
            typeof bp.signedAt === "number";
        out.statusValid = (await r.verifyBlueprintSignature(bp)) === "valid";
        // Built-in lässt sich nicht signieren (stein_block — lebendes builtIn).
        const builtinRes = await r.signBlueprint("stein_block");
        out.rejectBuiltin = !!builtinRes && builtinRes.ok === false && builtinRes.reason === "builtin";
        const unknownRes = await r.signBlueprint("_does_not_exist_w13");
        out.rejectUnknown = !!unknownRes && unknownRes.ok === false && unknownRes.reason === "unknown";
        // Substanz ändern → "modified".
        bp.parts[0].material = "eisen";
        out.statusModified = (await r.verifyBlueprintSignature(bp)) === "modified";
        // Neu signieren heilt es.
        await r.signBlueprint("_w13p2", { skipConfirm: true });
        out.resignValid = (await r.verifyBlueprintSignature(bp)) === "valid";
        // Signatur fälschen (ein Hex-Zeichen kippen, Substanz unverändert) → "forged".
        const goodSig = bp.signature;
        bp.signature = (goodSig[0] === "a" ? "b" : "a") + goodSig.slice(1);
        out.statusForged = (await r.verifyBlueprintSignature(bp)) === "forged";
        bp.signature = goodSig;
        // Die Signatur reist mit dem Bauplan durch den Snapshot.
        const snap = r.buildStateSnapshot();
        const snapBp = (snap.blueprints || []).find((b) => b && b.name === "_w13p2");
        out.snapshotKeepsSig = !!snapBp && snapBp.signature === bp.signature && snapBp.authorPubKey === bp.authorPubKey;
        // Cross-Autor: ein mit FREMDEM Schlüssel signierter Bauplan
        // verifiziert ebenso (das Fundament für W13 Phase 3).
        const foreignPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
        const foreignJwk = await crypto.subtle.exportKey("jwk", foreignPair.privateKey);
        const foreignCanon = r._canonicalBlueprint(bp);
        const foreignSig = await crypto.subtle.sign(
            { name: "Ed25519" },
            foreignPair.privateKey,
            new TextEncoder().encode(foreignCanon)
        );
        bp.signature = r._vibeBytesToHex(new Uint8Array(foreignSig));
        bp.authorPubKey = r._vibeBytesToHex(r._vibeB64uToBytes(foreignJwk.x));
        bp.signedHash = r._fastHash(foreignCanon);
        out.crossAuthorValid = (await r.verifyBlueprintSignature(bp)) === "valid";
        out.crossAuthorForeign = bp.authorPubKey !== r.state.vibePass.publicKeyHex;
        // Ein Klon eines signierten Bauplans ist unsigniert (neues Werk).
        if (r.state.blueprints["_w13p2clone"]) delete r.state.blueprints["_w13p2clone"];
        r.cloneBlueprint("_w13p2", "_w13p2clone");
        const clone = r.state.blueprints["_w13p2clone"];
        out.cloneUnsigned = !!clone && !clone.signature && !clone.authorPubKey;
        // verifyBlueprintSignature ist defensiv.
        out.verifyDefensive = (await r.verifyBlueprintSignature(null)) === "unsigned";
        // UI: die Signatur-Sektion steht im „Werk"-Block #workshop-action-zone, über FERTIGEN.
        r.selectBlueprintForEdit("_w13p2");
        const machZone =
            document.getElementById("workshop-action-zone") || document.getElementById("workshop-stats-panel");
        out.uiSigRow = !!machZone && !!machZone.querySelector(".workshop-sig-row");
        out.uiSigBtn = !!machZone && !!machZone.querySelector(".workshop-sig-btn");
        delete r.state.blueprints["_w13p2"];
        delete r.state.blueprints["_w13p2clone"];
        return out;
    });

    if (w13p2Results && !w13p2Results.error) {
        check("W13 P2: _canonicalBlueprint ist deterministisch", w13p2Results.canonDeterministic);
        check(
            "W13 P2: _canonicalBlueprint ignoriert das Label (signiert die Substanz)",
            w13p2Results.canonIgnoresLabel
        );
        check("W13 P2: unsignierter Bauplan → Status 'unsigned'", w13p2Results.statusUnsigned);
        check("W13 P2: signBlueprint signiert einen eigenen Bauplan", w13p2Results.signOk);
        check("W13 P2: Signatur-Felder gesetzt (signature/authorPubKey/signedHash/signedAt)", w13p2Results.signFields);
        check("W13 P2: signierter Bauplan → Status 'valid'", w13p2Results.statusValid);
        check("W13 P2: Built-in lässt sich nicht signieren", w13p2Results.rejectBuiltin);
        check("W13 P2: unbekannter Bauplan-Name wird abgewiesen", w13p2Results.rejectUnknown);
        check("W13 P2: geänderte Substanz → Status 'modified'", w13p2Results.statusModified);
        check("W13 P2: neu signieren heilt 'modified' → 'valid'", w13p2Results.resignValid);
        check("W13 P2: gefälschte Signatur → Status 'forged'", w13p2Results.statusForged);
        check("W13 P2: Signatur überlebt den Snapshot-Rundlauf", w13p2Results.snapshotKeepsSig);
        check("W13 P2: fremd-signierter Bauplan verifiziert (Cross-Autor)", w13p2Results.crossAuthorValid);
        check("W13 P2: der Cross-Autor-Schlüssel ist nicht der eigene", w13p2Results.crossAuthorForeign);
        check("W13 P2: Klon eines signierten Bauplans ist unsigniert", w13p2Results.cloneUnsigned);
        check("W13 P2: verifyBlueprintSignature ist defensiv (null → 'unsigned')", w13p2Results.verifyDefensive);
        check("W13 P2: Signatur-Sektion im Werkstatt-Panel", w13p2Results.uiSigRow);
        check("W13 P2: Signier-Knopf im Werkstatt-Panel", w13p2Results.uiSigBtn);
    } else {
        check("W13 P2: Bauplan-Signatur-Tests laufen", false, w13p2Results ? w13p2Results.error : "no result");
    }

    // ### Vibe-Pass-Identität im Multi-User ###
    const w13p3Results = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const out = {};
        const p2p = r.state.p2p;
        // Peer-Entry trägt die Vibe-Pass-Felder.
        const probe = r._p2pEnsurePeerEntry("_w13p3probe");
        out.peerFields = "vibePassId" in probe && "vibeVerified" in probe;
        r._p2pRemovePeer("_w13p3probe");
        // --- _p2pBroadcastVibe: Payload + Beweis ---
        const origSend = r.p2pSend;
        const origEnabled = p2p.enabled;
        const origPeerId = p2p.peerId;
        let captured = null;
        r.p2pSend = (m) => {
            captured = m;
        };
        p2p.enabled = true;
        p2p.peerId = "_w13p3self";
        await r._p2pBroadcastVibe();
        out.broadcastShape =
            !!captured &&
            captured.type === "vibe" &&
            captured.vibePassId === r.vibePassId() &&
            typeof captured.proof === "string";
        out.broadcastProofVerifies =
            !!captured && (await r._vibeVerify("_w13p3self", captured.proof, r.state.vibePass.publicKeyHex)) === true;
        // Bei deaktiviertem P2P sendet _p2pBroadcastVibe nichts.
        captured = null;
        p2p.enabled = false;
        await r._p2pBroadcastVibe();
        out.broadcastSkipsDisabled = captured === null;
        p2p.enabled = true;
        r.p2pSend = origSend;
        // --- vibe-Empfang: ein fremder Peer, drei Beweis-Fälle ---
        const foreign = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
        const foreignJwk = await crypto.subtle.exportKey("jwk", foreign.privateKey);
        const foreignPubHex = r._vibeBytesToHex(r._vibeB64uToBytes(foreignJwk.x));
        const foreignId = "ed25519:" + foreignPubHex;
        const sign = async (text) =>
            r._vibeBytesToHex(
                new Uint8Array(
                    await crypto.subtle.sign({ name: "Ed25519" }, foreign.privateKey, new TextEncoder().encode(text))
                )
            );
        // (a) gültiger Beweis (signiert die eigene peerId).
        const proofA = await sign("_w13p3peerA");
        r.p2pHandleMessage(
            JSON.stringify({ type: "vibe", peerId: "_w13p3peerA", vibePassId: foreignId, proof: proofA })
        );
        // (b) manipulierter Beweis (ein Hex-Zeichen gekippt).
        const proofB = await sign("_w13p3peerB");
        const proofBad = (proofB[0] === "a" ? "b" : "a") + proofB.slice(1);
        r.p2pHandleMessage(
            JSON.stringify({ type: "vibe", peerId: "_w13p3peerB", vibePassId: foreignId, proof: proofBad })
        );
        // (c) Beweis über eine FREMDE peerId — die Bindung greift.
        const proofWrong = await sign("_w13p3WRONG");
        r.p2pHandleMessage(
            JSON.stringify({
                type: "vibe",
                peerId: "_w13p3peerC",
                vibePassId: foreignId,
                proof: proofWrong,
            })
        );
        // (d) ohne Beweis — vibePassId notiert, aber nicht verifiziert.
        r.p2pHandleMessage(JSON.stringify({ type: "vibe", peerId: "_w13p3peerD", vibePassId: foreignId, proof: "" }));
        // (e) eigene peerId — wird ignoriert.
        r.p2pHandleMessage(
            JSON.stringify({ type: "vibe", peerId: "_w13p3self", vibePassId: foreignId, proof: proofA })
        );
        await sleep(140);
        const peerA = p2p.peers.get("_w13p3peerA");
        const peerB = p2p.peers.get("_w13p3peerB");
        const peerC = p2p.peers.get("_w13p3peerC");
        const peerD = p2p.peers.get("_w13p3peerD");
        out.recvRecordsId = !!peerA && peerA.vibePassId === foreignId;
        out.recvValidVerifies = !!peerA && peerA.vibeVerified === true;
        out.recvTamperedRejected = !!peerB && peerB.vibeVerified === false;
        out.recvWrongBindingRejected = !!peerC && peerC.vibeVerified === false;
        out.recvNoProofUnverified = !!peerD && peerD.vibePassId === foreignId && peerD.vibeVerified === false;
        out.recvIgnoresSelf = !p2p.peers.has("_w13p3self");
        // Verifizierter Peer bekommt ein Name-Schild mit Fingerprint (zweizeilig).
        out.verifiedPeerLabel = !!peerA && !!peerA.nameLabel && Math.abs(peerA.nameLabel.scale.y - 0.98) < 0.05;
        // --- Name-Schild ein- vs. zweizeilig ---
        const oneLine = r._p2pBuildNameLabel("Reisender");
        const twoLine = r._p2pBuildNameLabel("Reisender", "a1b2 c3d4");
        out.labelOneLine = !!oneLine && Math.abs(oneLine.scale.y - 0.65) < 0.01;
        out.labelTwoLine = !!twoLine && Math.abs(twoLine.scale.y - 0.98) < 0.01;
        // Aufräumen.
        for (const id of ["_w13p3peerA", "_w13p3peerB", "_w13p3peerC", "_w13p3peerD"]) {
            r._p2pRemovePeer(id);
        }
        p2p.enabled = origEnabled;
        p2p.peerId = origPeerId;
        return out;
    });

    if (w13p3Results && !w13p3Results.error) {
        check("W13 P3: Peer-Entry trägt vibePassId + vibeVerified", w13p3Results.peerFields);
        check("W13 P3: _p2pBroadcastVibe sendet {type:vibe, vibePassId, proof}", w13p3Results.broadcastShape);
        check(
            "W13 P3: der gesendete Beweis verifiziert gegen den eigenen Schlüssel",
            w13p3Results.broadcastProofVerifies
        );
        check("W13 P3: _p2pBroadcastVibe sendet nichts bei deaktiviertem P2P", w13p3Results.broadcastSkipsDisabled);
        check("W13 P3: vibe-Empfang notiert die vibePassId des Peers", w13p3Results.recvRecordsId);
        check("W13 P3: gültiger Beweis → der Peer ist verifiziert", w13p3Results.recvValidVerifies);
        check("W13 P3: manipulierter Beweis → nicht verifiziert", w13p3Results.recvTamperedRejected);
        check(
            "W13 P3: Beweis über fremde peerId → nicht verifiziert (Bindung greift)",
            w13p3Results.recvWrongBindingRejected
        );
        check(
            "W13 P3: vibe ohne Beweis → vibePassId notiert, aber nicht verifiziert",
            w13p3Results.recvNoProofUnverified
        );
        check("W13 P3: vibe mit eigener peerId wird ignoriert", w13p3Results.recvIgnoresSelf);
        check("W13 P3: verifizierter Peer trägt ein Name-Schild mit Fingerprint", w13p3Results.verifiedPeerLabel);
        check("W13 P3: Name-Schild ohne Fingerprint bleibt einzeilig", w13p3Results.labelOneLine);
        check("W13 P3: Name-Schild mit Fingerprint wird zweizeilig", w13p3Results.labelTwoLine);
    } else {
        check("W13 P3: Vibe-Pass-Multi-User-Tests laufen", false, w13p3Results ? w13p3Results.error : "no result");
    }

    // den Relay des signaling-servers (vibe mit peerId-Stempel) urteilt gate:mp-sync am echten Broker.

    // ### Bibliothek: browsbare Welt-Registry ###
    const w14Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const REG = r.constructor.WORLD_REGISTRY;
        // Jeder Registry-Eintrag trägt jetzt eine Beschreibung.
        out.registryHasDesc = Object.values(REG).every((w) => typeof w.desc === "string" && w.desc.length > 0);
        // Tab + Drawer im DOM.
        out.tabInDom = !!document.querySelector('#topbar .tab[data-tab="bibliothek"]');
        // renderLibraryUI baut eine Karte pro Registry-Welt.
        r.renderLibraryUI();
        const cards = document.querySelectorAll("#library-list .library-card");
        out.cardPerWorld = cards.length === Object.keys(REG).length;
        // Eine Karte zeigt Label + DSL-Wörter + Stufen-Marke.
        const fluidCard = Array.from(cards).find((c) => /Strom-Welt/.test(c.textContent));
        out.cardShowsDsl =
            !!fluidCard && /sturm/.test(fluidCard.textContent) && /übersetzt/.test(fluidCard.textContent);
        // === der Welt-Browser auf Werkstatt-/Hof-/Ich-Niveau ===
        // _worldProfile bündelt den GEMESSENEN Welt-Vektor (EIN Vektor, viele Leser).
        const wpRef = REG.fluid;
        const wp = r._worldProfile(wpRef);
        out.worldProfileBundles =
            !!wp &&
            wp.id === "fluid" &&
            wp.label === wpRef.label &&
            Array.isArray(wp.dsl) &&
            (wp.trust === "trusted" || wp.trust === "sandboxed") &&
            typeof wp.searchText === "string" &&
            wp.searchText.includes("sturm");
        // die Karte ist eine WELT-SPEC-CARD (geteiltes .spec-*-Design + Trust-Siegel + Betreten-Akt).
        out.cardIsSpecCard =
            !!fluidCard &&
            fluidCard.classList.contains("lib-spec-sheet") &&
            !!fluidCard.querySelector(".spec-header") &&
            !!fluidCard.querySelector(".lib-trust-seal") &&
            !!fluidCard.querySelector(".spec-body") &&
            !!fluidCard.querySelector(".spec-footer .library-get");
        // Profi-Lightening: der Body ist EINE kompakte Meta-Zeile (DSL-Vokabular + Signatur),
        // KEIN beschriftetes Zwei-Spalten-Datenblatt mehr (die `.spec-col-head`-Form-Labels sind weg).
        out.cardLightened =
            !!fluidCard &&
            !!fluidCard.querySelector(".lib-card-body .lib-card-meta") &&
            !!fluidCard.querySelector(".lib-card-meta .library-dsl-word") &&
            !fluidCard.querySelector(".lib-card-body .spec-col-head");
        // === Feed (die Social-Media-Plattform) — 3 Spalten, der vereinte Feed, das WERTEN ===
        const libDrawer = document.querySelector('.drawer[data-drawer="bibliothek"]');
        const feedLayout = libDrawer && libDrawer.querySelector(".feed-layout");
        const feedLeft = feedLayout && feedLayout.querySelector(".feed-left");
        const feedCenter = feedLayout && feedLayout.querySelector(".feed-center");
        const feedRight = feedLayout && feedLayout.querySelector(".feed-right");
        out.feedThreeCol = !!feedLayout && !!feedLeft && !!feedCenter && !!feedRight;
        out.feedCenterHoldsStream = !!feedCenter && !!feedCenter.querySelector("#library-list");
        out.searchInHead = !!(feedCenter && feedCenter.querySelector(".library-head #library-search"));
        // die Schöpf-Werkzeuge leben jetzt RECHTS (Schöpfen & Andocken), mit Empfangen vereint;
        // die Welt-Katalog-Quelle im Hauptthread als Tab (X-Muster); das Tagebuch eingeklappt (Chronik im Hof).
        const schoepfen = feedRight && feedRight.querySelector(".feed-schoepfen");
        out.schoepfenRight =
            !!schoepfen &&
            !!schoepfen.querySelector("#translator-input") &&
            !!schoepfen.querySelector("#vendor-id") &&
            !!schoepfen.querySelector(".feed-3block #world-new") &&
            !!schoepfen.querySelector(".feed-3block #world-fuse-open") &&
            !!schoepfen.querySelector(".feed-3block #library-import");
        // das "Diese Welt"-Eiland — Identität + die Provenienz-Samen (Stammbaum + Tagebuch) links.
        const feedSelf = feedLeft && feedLeft.querySelector(".feed-self");
        r._renderActiveWorldIsland();
        out.feedSelfIsland =
            !!feedSelf &&
            !!feedSelf.querySelector("#feed-active-ident .feed-self-badge") &&
            !!feedSelf.querySelector("#world-lineage") &&
            !!feedSelf.querySelector("#world-journal-list") &&
            /Diese Welt|noch namenlos|.+/.test(feedSelf.querySelector("#feed-active-ident").textContent || "");
        // das Tagebuch ist eingeklappt (progressive disclosure; die Welt-Chronik lebt im Hof).
        const tagebuch = feedSelf && feedSelf.querySelector("details.feed-tagebuch");
        out.tagebuchCollapsed = !!tagebuch && !tagebuch.open && !!tagebuch.querySelector("#world-journal-list");
        // die fremde-Welt-Werkzeuge als Akkordeon (Glyph+Name+Zweck), die Formulare bewahrt.
        const feedTools = schoepfen ? schoepfen.querySelectorAll(".feed-tool") : [];
        out.feedToolsAccordion =
            feedTools.length >= 2 &&
            Array.from(feedTools).every((t) => !!t.querySelector(".feed-tool-head .feed-tool-name"));
        // die Feed-Tabs (Für dich | Aus dem Mesh) im Hauptthread; der Welt-Katalog im Mesh-Panel.
        const feedTabEls = feedCenter ? feedCenter.querySelectorAll(".feed-tabs .feed-tab") : [];
        const meshPanel = feedCenter && feedCenter.querySelector("#feed-mesh-panel");
        out.feedTabs =
            feedTabEls.length === 2 &&
            !!meshPanel &&
            !!meshPanel.querySelector("#mesh-world-catalog") &&
            !!feedCenter.querySelector("#feed-foryou-panel #library-list");
        // das Tab-Schalten WIRKT: mesh → foryou-Panel versteckt + mesh-Panel sichtbar; zurück sauber.
        r._setFeedTab("mesh");
        const meshOn =
            !!meshPanel && meshPanel.hidden === false && document.getElementById("feed-foryou-panel").hidden === true;
        r._setFeedTab("foryou");
        const foryouOn = document.getElementById("feed-foryou-panel").hidden === false && meshPanel.hidden === true;
        out.feedTabsWork = meshOn && foryouOn;
        // Feed-A0: _feedItems vereint Welten + Rezepte + Wesen (jedes liest seinen Vektor + seine Wertung).
        const fi = r._feedItems();
        const fkinds = new Set(fi.map((it) => it.kind));
        const hasCreatures = (r.state.creatures || []).length > 0;
        out.feedHasAllKinds = fkinds.has("world") && fkinds.has("recipe") && (!hasCreatures || fkinds.has("creature"));
        out.feedItemsBundle = fi.length >= 3 && fi.every((it) => it.id && it.prof && typeof it.rating === "number");
        // Feed-A: der Strom rendert die Arten (Welt=.library-card, Rezept=.feed-recipe, Wesen=.feed-creature).
        const stream = document.getElementById("library-list");
        out.feedRendersKinds =
            !!stream &&
            !!stream.querySelector(".library-card[data-kind='world']") &&
            !!stream.querySelector(".feed-recipe[data-kind='recipe']") &&
            (!hasCreatures || !!stream.querySelector(".feed-creature[data-kind='creature']"));
        // jede Feed-Karte trägt das WERTEN (5 Sterne).
        const anyCard = stream && stream.querySelector(".library-card, .feed-card");
        const ratingBar = anyCard && anyCard.querySelector(".feed-rating");
        out.feedRatingBars = !!ratingBar && ratingBar.querySelectorAll(".feed-star").length === 5;
        // das WERTEN wirkt: setzen + lesen + Toggle (das dritte Verb des Feldes, lokal).
        r._setFeedRating("world:fluid", 0); // reset
        r._setFeedRating("world:fluid", 4);
        const set4 = r._feedRating("world:fluid") === 4;
        r._setFeedRating("world:fluid", 4); // Toggle → 0
        out.feedRatingWorks = set4 && r._feedRating("world:fluid") === 0;
        // der Kind-Chip TREIBT den Strom (nur Rezepte sichtbar, Welten verborgen).
        r.state.feedKind = "recipe";
        r._applyLibraryFilter();
        const recCards = Array.from(stream.querySelectorAll(".feed-recipe"));
        const wCards = Array.from(stream.querySelectorAll(".library-card[data-kind='world']"));
        out.feedKindFilter =
            recCards.length > 0 &&
            recCards.every((c) => c.style.display !== "none") &&
            wCards.every((c) => c.style.display === "none");
        r.state.feedKind = "alle";
        r._applyLibraryFilter();
        out.feedKindChips = document.querySelectorAll("#feed-kinds .feed-kind-chip").length === 6; // V18.135 + „Gemerkt"; V18.142 + „Gefolgt"
        // jede Feed-Karte trägt eine VORSCHAU (Cover-Band, „quasi ein Bild") + den Art-Glyph.
        out.feedCovers =
            !!stream.querySelector(".library-card[data-kind='world'] .feed-cover .feed-cover-glyph") &&
            !!stream.querySelector(".feed-recipe .feed-cover") &&
            (!hasCreatures || !!stream.querySelector(".feed-creature .feed-cover"));
        // die Sortier-Chips + sort-by-rating WIRKT (ein 5★-Item steigt
        // nach oben). Die Chips wuchsen auf DREI (Neueste · ✦ Für dich
        // · ★ Bewertung) — der Test wandert mit.
        out.feedSortChips = document.querySelectorAll("#feed-sort .feed-kind-chip").length === 3;
        const aRecipe = Object.values(r.state.blueprints).find((b) => b && !b.instanced && b.role !== "portal");
        if (aRecipe) {
            r._setFeedRating("recipe:" + aRecipe.name, 0);
            r._setFeedRating("recipe:" + aRecipe.name, 5);
            r.state.feedSort = "rating";
            r.renderLibraryUI();
            const firstBar = document.querySelector(
                "#library-list .library-card .feed-rating, #library-list .feed-card .feed-rating"
            );
            out.feedSortWorks = !!firstBar && Number(firstBar.dataset.rating) === 5;
            r._setFeedRating("recipe:" + aRecipe.name, 5); // Toggle zurück → 0 (sauber)
            r.state.feedSort = "neueste";
            r.renderLibraryUI();
        }
        // der geteilte 3D-VORSCHAU-Bereich (EIN Renderer, das Hof-Bühnen-Muster) + die Klick-Fokus-Logik.
        out.feedPreviewPanel =
            !!document.querySelector(".feed-left .feed-preview-panel #feed-preview-canvas");
        const recForFocus = r._feedItems().find((x) => x.kind === "recipe");
        if (recForFocus) {
            const recCard = stream.querySelector(".feed-recipe");
            r._feedFocus(recForFocus, recCard);
            out.feedPreviewFocus =
                r.state.feedFocusId === recForFocus.id && !!recCard && recCard.classList.contains("is-previewing");
            // die Bühne idle lassen (kein RAF läuft ohne Drawer-Öffnen); Fokus zurücksetzen für spätere Bands.
            r.state.feedFocusId = null;
        }
        // der Drawer-Fit: box-sizing:border-box, sonst überläuft das max-height um padding (der Drawer ragt unten aus dem Bild).
        const bibDrawer = document.querySelector('.drawer[data-drawer="bibliothek"]');
        out.drawerBoxSizing = !!bibDrawer && getComputedStyle(bibDrawer).boxSizing === "border-box";
        // die Omnibox `welt:` surfaced die einzelnen Welten (wie `b:` die Baupläne, §D.4-Konsistenz).
        const omniWelt = r._omniboxSearch("welt:");
        out.omniboxWelt =
            Array.isArray(omniWelt) &&
            omniWelt.length >= 1 &&
            omniWelt.some((e) => /Welt/.test(e.kindLabel) && e.label && typeof e.run === "function");
        // Bestbewertet spiegelt eine Wertung zurück (das WERTEN sichtbar).
        r._setFeedRating("world:fluid", 5);
        r._renderFeedTrends();
        out.feedTrends = !!document.querySelector("#feed-trends .feed-trend-row");
        r._setFeedRating("world:fluid", 5); // Toggle zurück → sauber
        r._renderFeedTrends();
        // die Suche TREIBT den Feed (KONSUM auf Feature-Ebene — kein toter Knopf).
        const libSearch = document.getElementById("library-search");
        if (libSearch) {
            libSearch.value = "strom";
            r._applyLibraryFilter();
            const allCards = Array.from(document.querySelectorAll("#library-list .library-card"));
            const shown = allCards.filter((c) => c.style.display !== "none");
            out.searchDrivesGrid =
                shown.length >= 1 && shown.length < allCards.length && shown.every((c) => /strom/i.test(c.textContent));
            libSearch.value = "";
            r._applyLibraryFilter();
            out.searchClearsClean = Array.from(document.querySelectorAll("#library-list .library-card")).every(
                (c) => c.style.display !== "none"
            );
        }
        // obtainPortalForWorld: klont welt_portal, richtet, legt ins Inventar.
        const res1 = r.obtainPortalForWorld("fluid");
        out.obtainOk = res1.ok === true && res1.blueprint === "portal_fluid";
        const bp = r.state.blueprints.portal_fluid;
        out.bpIsPortal = !!bp && bp.role === "portal" && bp.builtIn !== true;
        out.bpAimedAtFluid = !!bp && !!bp.portalMeta && bp.portalMeta.world === REG.fluid.world;
        // Der geholte Bauplan ist betretbar (Affordance isPortal).
        out.bpEnterable = !!bp && r.computeBlueprintAffordances(bp).isPortal === true;
        // Im Inventar gelandet.
        const slot1 = r.state.player.inventory.find((s) => s && s.blueprintName === "portal_fluid");
        out.inInventory = !!slot1 && slot1.count >= 1;
        // Zweites Holen stackt — kein zweiter Bauplan.
        const bpCountBefore = Object.keys(r.state.blueprints).length;
        const res2 = r.obtainPortalForWorld("fluid");
        const bpCountAfter = Object.keys(r.state.blueprints).length;
        const slot2 = r.state.player.inventory.find((s) => s && s.blueprintName === "portal_fluid");
        out.secondStacks = res2.ok === true && !!slot2 && slot2.count >= 2 && bpCountAfter === bpCountBefore;
        // Unbekannte Welt → abgelehnt.
        out.unknownRejected = r.obtainPortalForWorld("nirgendwo").ok === false;
        // portalMeta + role:portal überleben den Save (buildStateSnapshot schreibt, loadState stellt her) —
        // sonst verlöre ein geholtes Portal beim Reload seine Ausrichtung (und träfe wieder _isMoveable).
        const snap = r.buildStateSnapshot();
        const snapBp = (snap.blueprints || []).find((b) => b && b.name === "portal_fluid");
        out.snapPersistsPortal =
            !!snapBp && snapBp.role === "portal" && !!snapBp.portalMeta && snapBp.portalMeta.world === REG.fluid.world;
        // Read-Seite: den Snapshot-Eintrag durch loadState zurückspielen.
        delete r.state.blueprints.portal_fluid;
        r.loadState({ blueprints: snapBp ? [snapBp] : [] });
        const reBp = r.state.blueprints.portal_fluid;
        out.loadRestoresPortal =
            !!reBp && reBp.role === "portal" && !!reBp.portalMeta && reBp.portalMeta.world === REG.fluid.world;
        out.loadKeepsEnterable = !!reBp && r.computeBlueprintAffordances(reBp).isPortal === true;
        // obtainPortalForWorld richtet bei jedem Aufruf neu aus —
        // heilt ein Portal, dem (etwa aus einem alten Save) die
        // Ausrichtung fehlt.
        if (reBp) {
            delete reBp.portalMeta;
            reBp.role = "architecture";
        }
        r.obtainPortalForWorld("fluid");
        const healedBp = r.state.blueprints.portal_fluid;
        out.reaimHeals =
            !!healedBp &&
            healedBp.role === "portal" &&
            !!healedBp.portalMeta &&
            healedBp.portalMeta.world === REG.fluid.world;
        // Aufräumen, damit spätere Blöcke einen sauberen Stand sehen.
        delete r.state.blueprints.portal_fluid;
        for (let i = 0; i < r.state.player.inventory.length; i++) {
            const s = r.state.player.inventory[i];
            if (s && s.blueprintName === "portal_fluid") r.state.player.inventory[i] = null;
        }
        return out;
    });

    if (w14Results && !w14Results.error) {
        check("W14 P1: jeder WORLD_REGISTRY-Eintrag trägt eine Beschreibung", w14Results.registryHasDesc);
        check("W14 P1: Bibliothek-Tab im Topbar", w14Results.tabInDom);
        check("W14 P1: renderLibraryUI baut eine Karte pro Welt", w14Results.cardPerWorld);
        check("W14 P1: Karte zeigt Label + DSL-Vokabular + Stufen-Marke", w14Results.cardShowsDsl);
        check(
            "Bib-A0: _worldProfile bündelt den Welt-Vektor (id/label/dsl/trust/searchText)",
            w14Results.worldProfileBundles
        );
        check(
            "Bib-A: die Karte ist eine Welt-Spec-Card (.spec-header + Trust-Siegel + Betreten-Akt)",
            w14Results.cardIsSpecCard
        );
        check(
            "die Karte ist Profi-leicht — EINE Meta-Zeile (DSL), keine Datenblatt-Spalten-Labels",
            w14Results.cardLightened
        );
        check(
            "Feed: 3 Spalten — 'Diese Welt' links | Feed Mitte | Schöpfen+Kuratieren rechts",
            w14Results.feedThreeCol
        );
        check("Feed: das #library-list ist der Feed-Strom in der Mitte", w14Results.feedCenterHoldsStream);
        check(
            "Feed: die Tabs (Für dich | Aus dem Mesh) im Hauptthread, der Katalog im Mesh-Panel (V18.73)",
            w14Results.feedTabs
        );
        check("Feed: das Tab-Schalten WIRKT — Für dich ↔ Aus dem Mesh (V18.73)", w14Results.feedTabsWork);
        check(
            "Feed: Schöpfen & Andocken liegt RECHTS (Übersetzen+Andocken + 3er-Block Neue/Verschmelzen/Empfangen)",
            w14Results.schoepfenRight
        );
        check(
            "Feed: das 'Diese Welt'-Eiland blüht links (Identität + Stammbaum + Tagebuch, V18.71)",
            w14Results.feedSelfIsland
        );
        check("Feed: das Tagebuch ist eingeklappt (Chronik im Hof, V18.73)", w14Results.tagebuchCollapsed);
        check(
            "Feed: die fremde-Welt-Werkzeuge sind ein klares Akkordeon (Glyph+Name, V18.72/.73)",
            w14Results.feedToolsAccordion
        );
        check("Feed: die Suche sitzt im Feed-Kopf", w14Results.searchInHead);
        check("Feed-A0: _feedItems vereint Welten + Rezepte + Wesen", w14Results.feedHasAllKinds);
        check("Feed-A0: jedes Feed-Item trägt id + Vektor + Wertung", w14Results.feedItemsBundle);
        check("Feed-A: der Strom rendert alle drei Arten als Karten", w14Results.feedRendersKinds);
        check("Feed: jede Karte trägt das WERTEN (5 Sterne)", w14Results.feedRatingBars);
        check("Feed: das WERTEN wirkt — setzen + lesen + Toggle (das dritte Verb, lokal)", w14Results.feedRatingWorks);
        check("Feed: der Kind-Filter TREIBT den Strom (nur Rezepte sichtbar)", w14Results.feedKindFilter);
        check(
            "Feed: die Kind-Chips tragen die Anzahl (Alle/Welten/Rezepte/Wesen/Gemerkt/Gefolgt, V18.142)",
            w14Results.feedKindChips
        );
        check("Feed: jede Karte trägt eine Vorschau (Cover-Bild + Art-Glyph, V18.74)", w14Results.feedCovers);
        check(
            "Feed: die Sortier-Chips (Neueste | Für dich | Bewertung) sind da (V18.74/.147)",
            w14Results.feedSortChips
        );
        check("Feed: sort-by-rating WIRKT — ein 5★-Item steigt nach oben (V18.74)", w14Results.feedSortWorks);
        check(
            "Feed: der geteilte 3D-Vorschau-Bereich (Canvas + Methoden) ist da (V18.75)",
            w14Results.feedPreviewPanel
        );
        check("Feed: Klick auf eine Karte fokussiert sie für die Vorschau (V18.75)", w14Results.feedPreviewFocus);
        check(
            "Drawer: box-sizing:border-box — der Drawer passt in den Viewport (kein Überlauf, V18.76)",
            w14Results.drawerBoxSizing
        );
        check("Omnibox: `welt:` surfaced die einzelnen Welten (wie `b:` die Baupläne, V18.76)", w14Results.omniboxWelt);
        check("Feed: Bestbewertet spiegelt eine Wertung zurück", w14Results.feedTrends);
        check("Bib-D: die Suche TREIBT den Feed (kein toter Knopf, V18.65)", w14Results.searchDrivesGrid);
        check("Bib-D: die Suche leeren zeigt alle Karten wieder", w14Results.searchClearsClean);
        check("W14 P1: obtainPortalForWorld liefert ok + portal_fluid", w14Results.obtainOk);
        check("W14 P1: der geholte Bauplan trägt role:portal + ist eigen (nicht built-in)", w14Results.bpIsPortal);
        check("W14 P1: der geholte Bauplan ist auf die Strom-Welt gerichtet", w14Results.bpAimedAtFluid);
        check("W14 P1: der geholte Portal-Bauplan ist betretbar (Affordance isPortal)", w14Results.bpEnterable);
        check("W14 P1: das Portal liegt im Inventar", w14Results.inInventory);
        check("W14 P1: zweites Holen stackt im Inventar (kein zweiter Bauplan)", w14Results.secondStacks);
        check("W14 P1: obtainPortalForWorld verwirft eine unbekannte Welt", w14Results.unknownRejected);
        check("W14 P1: buildStateSnapshot persistiert role:portal + portalMeta", w14Results.snapPersistsPortal);
        check("W14 P1: loadState stellt role:portal + portalMeta wieder her", w14Results.loadRestoresPortal);
        check("W14 P1: der wiederhergestellte Portal-Bauplan bleibt betretbar", w14Results.loadKeepsEnterable);
        check("W14 P1: obtainPortalForWorld richtet neu aus + heilt verlorenes portalMeta", w14Results.reaimHeals);
    } else {
        check("W14 P1: Bibliothek-Tests laufen", false, w14Results ? w14Results.error : "no result");
    }

    // ### Welt-Manifest-Signatur ###
    const w14p2Results = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const out = {};
        const REG = r.constructor.WORLD_REGISTRY;
        // _canonicalManifest deterministisch + ignoriert world/desc.
        const c1 = r._canonicalManifest(REG.fluid);
        const c2 = r._canonicalManifest({
            id: "fluid",
            label: "Strom-Welt",
            dsl: REG.fluid.dsl,
            world: "anderer/pfad",
            desc: "andere beschreibung",
        });
        out.canonDeterministic = c1 === c2 && c1.length > 0;
        out.canonIgnoresPath = !c1.includes("worlds/");
        // Vorzustand säubern.
        delete r.state.signedWorlds.fluid;
        delete r.state.signedWorlds.terrain;
        // Unsigniert → "unsigned".
        out.unsignedState = (await r.verifyWorldSignature("fluid")) === "unsigned";
        // signWorld signiert + persistiert.
        const signRes = await r.signWorld("fluid", { skipConfirm: true });
        out.signOk = signRes.ok === true && /^[0-9a-f]{64}$/i.test(signRes.authorPubKey || "");
        out.signStored =
            !!r.state.signedWorlds.fluid && /^[0-9a-f]+$/i.test(r.state.signedWorlds.fluid.signature || "");
        out.signValid = (await r.verifyWorldSignature("fluid")) === "valid";
        // signWorld verwirft eine unbekannte Welt.
        out.signUnknownRejected = (await r.signWorld("nirgendwo")).ok === false;
        // localStorage-Persistenz: _loadSignedWorlds liest die Signatur zurück.
        const reloaded = r._loadSignedWorlds();
        out.persistRoundtrip = !!reloaded.fluid && reloaded.fluid.signature === r.state.signedWorlds.fluid.signature;
        // "modified" — der Manifest-Hash passt nicht mehr.
        const realHash = r.state.signedWorlds.fluid.signedHash;
        r.state.signedWorlds.fluid.signedHash = "deadbeef";
        out.modifiedState = (await r.verifyWorldSignature("fluid")) === "modified";
        r.state.signedWorlds.fluid.signedHash = realHash;
        // "forged" — die Signatur passt nicht zum Autor.
        const realSig = r.state.signedWorlds.fluid.signature;
        r.state.signedWorlds.fluid.signature = (realSig[0] === "a" ? "b" : "a") + realSig.slice(1);
        out.forgedState = (await r.verifyWorldSignature("fluid")) === "forged";
        r.state.signedWorlds.fluid.signature = realSig;
        // Cross-Autor: ein mit FREMDEM Schlüssel signiertes Manifest verifiziert.
        const foreign = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
        const foreignJwk = await crypto.subtle.exportKey("jwk", foreign.privateKey);
        const foreignPubHex = r._vibeBytesToHex(r._vibeB64uToBytes(foreignJwk.x));
        const canonTerrain = r._canonicalManifest(REG.terrain);
        const foreignSig = r._vibeBytesToHex(
            new Uint8Array(
                await crypto.subtle.sign(
                    { name: "Ed25519" },
                    foreign.privateKey,
                    new TextEncoder().encode(canonTerrain)
                )
            )
        );
        r.state.signedWorlds.terrain = {
            authorPubKey: foreignPubHex,
            signature: foreignSig,
            signedHash: r._fastHash(canonTerrain),
            signedAt: Date.now(),
        };
        out.crossAuthorValid = (await r.verifyWorldSignature("terrain")) === "valid";
        // _loadSignedWorlds defensiv gegen korruptes localStorage.
        const savedRaw = localStorage.getItem("anazh.signedWorlds");
        localStorage.setItem("anazh.signedWorlds", "{kaputt");
        out.loadDefensive = JSON.stringify(r._loadSignedWorlds()) === "{}";
        if (savedRaw !== null) localStorage.setItem("anazh.signedWorlds", savedRaw);
        // UI: Bibliothek-Karte trägt eine Signatur-Zeile + einen Knopf.
        r.renderLibraryUI();
        out.uiSigRow = !!document.querySelector("#library-list .library-sig-row");
        out.uiSigBtn = !!document.querySelector("#library-list .library-sig-btn");
        // Portal-Overlay: das Betreten einer signierten Welt zeigt
        // „signiert von <Autor>".
        r._buildPortalOverlay({ world: REG.fluid.world, label: "Strom-Welt", dsl: REG.fluid.dsl });
        out.overlayHasSigEl = !!(r._portalOverlay && r._portalOverlay.sigEl);
        out.overlaySigInDom = !!document.querySelector("#portal-overlay .portal-sig");
        await sleep(180);
        const sigEl = r._portalOverlay && r._portalOverlay.sigEl;
        out.overlayShowsSigned = !!sigEl && sigEl.hidden === false && /signiert von/.test(sigEl.textContent);
        r._disposePortalOverlay();
        // Aufräumen.
        delete r.state.signedWorlds.fluid;
        delete r.state.signedWorlds.terrain;
        r._saveSignedWorlds();
        return out;
    });

    if (w14p2Results && !w14p2Results.error) {
        check("W14 P2: _canonicalManifest ist deterministisch", w14p2Results.canonDeterministic);
        check(
            "W14 P2: _canonicalManifest ignoriert world-Pfad + desc (signiert die Substanz)",
            w14p2Results.canonIgnoresPath
        );
        check("W14 P2: unsignierte Welt → Status 'unsigned'", w14p2Results.unsignedState);
        check("W14 P2: signWorld signiert eine registrierte Welt", w14p2Results.signOk);
        check("W14 P2: Signatur in state.signedWorlds gespeichert", w14p2Results.signStored);
        check("W14 P2: signierte Welt → Status 'valid'", w14p2Results.signValid);
        check("W14 P2: signWorld verwirft eine unbekannte Welt", w14p2Results.signUnknownRejected);
        check("W14 P2: Signatur überlebt den localStorage-Rundlauf (_loadSignedWorlds)", w14p2Results.persistRoundtrip);
        check("W14 P2: geändertes Manifest → Status 'modified'", w14p2Results.modifiedState);
        check("W14 P2: gefälschte Signatur → Status 'forged'", w14p2Results.forgedState);
        check("W14 P2: fremd-signiertes Manifest verifiziert (Cross-Autor)", w14p2Results.crossAuthorValid);
        check("W14 P2: _loadSignedWorlds ist defensiv gegen korruptes localStorage", w14p2Results.loadDefensive);
        check(
            "W14 P2: Bibliothek-Karte trägt eine Signatur-Zeile + Knopf",
            w14p2Results.uiSigRow && w14p2Results.uiSigBtn
        );
        check(
            "W14 P2: Portal-Overlay legt eine .portal-sig-Zeile an",
            w14p2Results.overlayHasSigEl && w14p2Results.overlaySigInDom
        );
        check("W14 P2: Betreten einer signierten Welt zeigt 'signiert von <Autor>'", w14p2Results.overlayShowsSigned);
    } else {
        check("W14 P2: Manifest-Signatur-Tests laufen", false, w14p2Results ? w14p2Results.error : "no result");
    }

    // ### das Schaffen reist mit ###
    const w13v2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const baseP = r._portalEnterPayload();
        out.payloadName = typeof baseP.name === "string" && baseP.name.length > 0;
        out.payloadVibeId = typeof baseP.vibePassId === "string" && /^ed25519:[0-9a-f]{64}$/i.test(baseP.vibePassId);
        out.payloadFingerprint = typeof baseP.fingerprint === "string" && baseP.fingerprint.length > 0;
        out.payloadSoul = !!baseP.soul && typeof baseP.soul.name === "string" && typeof baseP.soul.label === "string";
        // Eigene Materialien/Werkzeuge reisen mit — Built-ins NICHT.
        // Plus: der 16er-Deckel hält den postMessage-Payload klein.
        for (let i = 0; i < 20; i++) {
            r.state.materials["_w14m" + i] = {
                builtIn: false,
                color: 0x44cc88,
                label: "M" + i,
                tags: {},
            };
        }
        r.state.tools._w14tool = {
            builtIn: false,
            label: "Testfeile",
            opName: "test_op",
            opClass: "subtractive",
        };
        const ownP = r._portalEnterPayload();
        out.payloadOwnMaterials =
            ownP.materials.some((m) => m.name === "_w14m0") && !ownP.materials.some((m) => m.name === "stein");
        out.payloadMaterialCap = ownP.materials.length <= 16;
        out.payloadOwnTools =
            ownP.tools.some((t) => t.name === "_w14tool") && !ownP.tools.some((t) => t.name === "schmiede-hammer");
        for (let i = 0; i < 20; i++) delete r.state.materials["_w14m" + i];
        delete r.state.tools._w14tool;
        return out;
    });

    if (w13v2Results && !w13v2Results.error) {
        check("W13 V2: der enter-Payload trägt den Avatar-Namen", w13v2Results.payloadName);
        check("W13 V2: der enter-Payload trägt die vibePassId (ed25519)", w13v2Results.payloadVibeId);
        check("W13 V2: der enter-Payload trägt den Vibe-Pass-Fingerprint", w13v2Results.payloadFingerprint);
        check("W13 V2: der enter-Payload trägt die aktive Seele (name + label)", w13v2Results.payloadSoul);
        check("W13 V2: nur EIGENE Materialien reisen mit (Built-ins bleiben)", w13v2Results.payloadOwnMaterials);
        check("W13 V2: die Materialien-Liste ist auf 16 gedeckelt", w13v2Results.payloadMaterialCap);
        check("W13 V2: nur EIGENE Werkzeuge reisen mit (Built-ins bleiben)", w13v2Results.payloadOwnTools);
    } else {
        check("W13 V2: enter-Payload-Tests laufen", false, w13v2Results ? w13v2Results.error : "no result");
    }

    // ### fremde Welten empfangen ###
    const w14p3Results = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const out = {};
        const REG = r.constructor.WORLD_REGISTRY;
        // Vorzustand säubern.
        r.state.customWorlds = {};
        r.state.signedWorlds = r.state.signedWorlds || {};
        delete r.state.signedWorlds.fluid;
        // _worldEntry: Built-in auflösbar.
        out.worldEntryBuiltin = r._worldEntry("fluid") === REG.fluid;
        // _sanitizeImportedManifest: Built-in-id + Müll-id abgelehnt.
        out.sanitizeRejectsBuiltin =
            r._sanitizeImportedManifest({
                id: "fluid",
                label: "X",
                world: "worlds/skeleton/index.html",
                dsl: [],
            }) === null;
        out.sanitizeRejectsBadId =
            r._sanitizeImportedManifest({
                id: "BÖSE id!",
                label: "X",
                world: "worlds/skeleton/index.html",
            }) === null;
        // exportWorldManifest: unsigniert → not_signed.
        out.exportUnsignedRejected = r.exportWorldManifest("fluid").reason === "not_signed";
        // fluid signieren, dann exportieren.
        await r.signWorld("fluid", { skipConfirm: true });
        const exp = r.exportWorldManifest("fluid");
        out.exportOk =
            exp.ok === true &&
            !!exp.manifest &&
            exp.manifest.id === "fluid" &&
            exp.manifest.schemaVersion === "1.0" &&
            /^[0-9a-f]{64}$/i.test(exp.manifest.authorPubKey || "");
        // importWorldManifest: Built-in-id-Kollision + Müll.
        const clash = await r.importWorldManifest({
            schemaVersion: "1.0",
            id: "terrain",
            label: "X",
            world: "worlds/skeleton/index.html",
            dsl: [],
        });
        out.importBuiltinRejected = clash.ok === false && clash.reason === "id_is_builtin";
        const garbage = await r.importWorldManifest({ nonsense: true });
        out.importGarbageRejected = garbage.ok === false;
        // Cross-Autor: ein fremd-signiertes Manifest (neue id, erreichbarer Pfad).
        const foreign = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
        const foreignJwk = await crypto.subtle.exportKey("jwk", foreign.privateKey);
        const foreignPubHex = r._vibeBytesToHex(r._vibeB64uToBytes(foreignJwk.x));
        const fm = {
            schemaVersion: "1.0",
            id: "void-zwei",
            label: "Void Zwei",
            desc: "Eine fremde Leere.",
            world: "worlds/skeleton/index.html",
            dsl: ["skybox_color"],
        };
        const fmCanon = r._canonicalManifest(fm);
        const sign = async (canon) =>
            r._vibeBytesToHex(
                new Uint8Array(
                    await crypto.subtle.sign({ name: "Ed25519" }, foreign.privateKey, new TextEncoder().encode(canon))
                )
            );
        const fmSig = await sign(fmCanon);
        const importValid = await r.importWorldManifest(
            Object.assign({}, fm, {
                authorPubKey: foreignPubHex,
                signature: fmSig,
                signedHash: r._fastHash(fmCanon),
            })
        );
        out.importCrossAuthorValid =
            importValid.ok === true && importValid.signatureStatus === "valid" && importValid.reachable === true;
        out.customWorldStored = !!(r.state.customWorlds && r.state.customWorlds["void-zwei"]);
        out.verifyCustomValid = (await r.verifyWorldSignature("void-zwei")) === "valid";
        out.worldEntryCustom = !!r._worldEntry("void-zwei");
        out.libraryWorldsMerged =
            r._libraryWorlds().some((w) => w.id === "void-zwei") && r._libraryWorlds().length > Object.keys(REG).length;
        // Gefälschte Signatur → forged.
        const fmFalsch = Object.assign({}, fm, { id: "void-falsch" });
        const importForged = await r.importWorldManifest(
            Object.assign({}, fmFalsch, {
                authorPubKey: foreignPubHex,
                signature: (fmSig[0] === "a" ? "b" : "a") + fmSig.slice(1),
                signedHash: r._fastHash(r._canonicalManifest(fmFalsch)),
            })
        );
        out.importForged = importForged.ok === true && importForged.signatureStatus === "forged";
        // Unerreichbare Welt: die fetch-Probe schlägt fehl.
        const importUnreach = await r.importWorldManifest({
            schemaVersion: "1.0",
            id: "void-fern",
            label: "Ferne Welt",
            world: "worlds/erfundene-welt/index.html",
            dsl: [],
        });
        out.importUnreachable = importUnreach.ok === true && importUnreach.reachable === false;
        // obtainPortalForWorld: erreichbare custom-Welt ok, unerreichbare abgelehnt.
        out.obtainCustomReachable = r.obtainPortalForWorld("void-zwei").ok === true;
        const obUn = r.obtainPortalForWorld("void-fern");
        out.obtainCustomUnreachable = obUn.ok === false && obUn.reason === "world_unreachable";
        // DETERMINISMUS-BOGEN P3 — _runRaycast ist jetzt feld-nativ (DDA durch das
        // Dichtefeld + Struktur-Box-Ray, kein physicsWorld/rayTest mehr). Es darf
        // NIE crashen und liefert den Extractor-Wert (hier den hit-Bool) zurück.
        try {
            const rsA = r.setVec(r.state.tmpVec1, 0, 1000, 0);
            const reA = r.setVec(r.state.tmpVec2, 0, -1000, 0);
            const hit = r._runRaycast(rsA, reA, (_cb, h) => h);
            out.raycastNullSafe = typeof hit === "boolean";
        } catch {
            out.raycastNullSafe = false;
        }
        // localStorage-Rundlauf.
        const reloaded = r._loadCustomWorlds();
        out.customWorldsRoundtrip =
            !!reloaded["void-zwei"] && reloaded["void-zwei"].signature === r.state.customWorlds["void-zwei"].signature;
        // UI: renderLibraryUI rendert eine importierte Karte + Import-Knopf im DOM.
        r.renderLibraryUI();
        out.uiImportedCard =
            !!document.querySelector("#library-list .library-card-imported") &&
            !!document.querySelector("#library-list .library-imported-mark");
        // Aufräumen.
        r.state.customWorlds = {};
        r._saveCustomWorlds();
        delete r.state.signedWorlds.fluid;
        r._saveSignedWorlds();
        delete r.state.blueprints["portal_void-zwei"];
        for (let i = 0; i < r.state.player.inventory.length; i++) {
            const s = r.state.player.inventory[i];
            if (s && typeof s.blueprintName === "string" && s.blueprintName.indexOf("portal_void") === 0) {
                r.state.player.inventory[i] = null;
            }
        }
        r.renderLibraryUI();
        return out;
    });

    if (w14p3Results && !w14p3Results.error) {
        check("W14 P3: _worldEntry löst eine Built-in-Welt auf", w14p3Results.worldEntryBuiltin);
        check(
            "W14 P3: _sanitizeImportedManifest lehnt eine Built-in-id ab (kein Override)",
            w14p3Results.sanitizeRejectsBuiltin
        );
        check("W14 P3: _sanitizeImportedManifest lehnt eine ungültige id ab", w14p3Results.sanitizeRejectsBadId);
        check("W14 P3: exportWorldManifest verlangt eine signierte Welt", w14p3Results.exportUnsignedRejected);
        check("W14 P3: exportWorldManifest liefert das signierte §3.3-Manifest", w14p3Results.exportOk);
        check("W14 P3: importWorldManifest verwirft eine Built-in-id-Kollision", w14p3Results.importBuiltinRejected);
        check("W14 P3: importWorldManifest verwirft ein Müll-Manifest", w14p3Results.importGarbageRejected);
        check(
            "W14 P3: ein fremd-signiertes Manifest importiert + verifiziert (Cross-Autor)",
            w14p3Results.importCrossAuthorValid
        );
        check("W14 P3: die importierte Welt landet in state.customWorlds", w14p3Results.customWorldStored);
        check(
            "W14 P3: verifyWorldSignature liest die manifest-getragene Signatur (valid)",
            w14p3Results.verifyCustomValid
        );
        check(
            "W14 P3: _worldEntry + _libraryWorlds umfassen die importierte Welt",
            w14p3Results.worldEntryCustom && w14p3Results.libraryWorldsMerged
        );
        check("W14 P3: ein manipuliertes Manifest → Signatur 'forged'", w14p3Results.importForged);
        check(
            "W14 P3: eine Welt ohne erreichbare Dateien wird reachable:false markiert",
            w14p3Results.importUnreachable
        );
        check(
            "W14 P3: obtainPortalForWorld holt eine erreichbare importierte Welt",
            w14p3Results.obtainCustomReachable
        );
        check(
            "W14 P3: obtainPortalForWorld verweigert eine unerreichbare Welt (kein totes Portal)",
            w14p3Results.obtainCustomUnreachable
        );
        check("W14 P3: importierte Welten überleben den localStorage-Rundlauf", w14p3Results.customWorldsRoundtrip);
        check(
            "W14 P3: Bibliothek rendert eine 'empfangen'-Karte für die importierte Welt",
            w14p3Results.uiImportedCard
        );
        check(
            "W14 P3: _runRaycast ist feld-nativ + crash-frei (liefert den Extractor-Wert, kein rayTest)",
            w14p3Results.raycastNullSafe
        );
    } else {
        check("W14 P3: Welt-Import-Tests laufen", false, w14p3Results ? w14p3Results.error : "no result");
    }
}

// ===== G8 — die Angriffs-KORPORA: jeder Korpus impft bei JEDEM Push gegen genau einen Angriff =====
// R0 Trennung · R1 Flut · R2 souveräner Angriff · R3 Sandbox-Escape · R4 Infektion — ein Regress an
// einer alten Wand ist sofort rot.

// G8 R0 — der INNERSTE RING ist BENANNT + ABWESEND aus jedem geteilten Kanal.
// Die Wand: der private Schlüssel / die Identität lecken NIE in einen
// Welt-Snapshot oder Portal-Payload (GEMESSEN-schon-wahr, jetzt eingefroren).
async function checkBandG8R0Sovereign(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const K = r.constructor;
        const out = {};
        // (1) SOVEREIGN_STATE benannt + eingefroren + die kanonischen Schlüssel.
        const S = K.SOVEREIGN_STATE;
        out.frozen =
            !!S && Object.isFrozen(S) && Object.isFrozen(S.excludedStateKeys) && Object.isFrozen(S.privateFields);
        out.namesRing =
            !!S &&
            S.excludedStateKeys.includes("vibePass") &&
            S.excludedStateKeys.includes("signedWorlds") &&
            S.excludedStateKeys.includes("customWorlds") &&
            S.excludedStateKeys.includes("p2p") &&
            S.privateStorageKeys.includes("anazh.vibePass") &&
            S.privateFields.includes("_privateKeyJwk");
        // (2) Der Trennungs-Beweis: die Sonde meldet ok, keine Lecks.
        const audit = r._sovereignStateAudit();
        out.auditOk = !!audit && audit.ok === true && audit.leaks.length === 0;
        out.auditLeaks = audit ? audit.leaks.join(",") : "(no audit)";
        // (3) Der Snapshot DIREKT: kein souveräner Slot, kein privates Feld tief.
        const snap = r.buildStateSnapshot();
        out.snapNoSovereignSlot = S.excludedStateKeys.every((k) => !Object.prototype.hasOwnProperty.call(snap, k));
        const snapJson = JSON.stringify(snap);
        out.snapNoPrivateField =
            !/"_?privateKeyJwk"|"privateKey"/.test(snapJson) && snapJson.indexOf("anazh.vibePass") < 0;
        // (4) Der Portal-Payload trägt nur die ÖFFENTLICHE Identität.
        const pay = r._portalEnterPayload();
        const payJson = JSON.stringify(pay);
        out.payloadPublicOnly = !/"_?privateKeyJwk"|"privateKey"/.test(payJson);
        out.payloadIdPublic = !pay.vibePassId || /^ed25519:[0-9a-f]*$/.test(pay.vibePassId);
        // (5) DEFENSE: selbst ein injiziertes Privat-Feld in state.vibePass leckt
        // NICHT in den Snapshot (der fixe Key-Satz schließt vibePass ganz aus).
        const vp = r.state.vibePass || (r.state.vibePass = {});
        const hadKey = Object.prototype.hasOwnProperty.call(vp, "privateKey");
        const saved = vp.privateKey;
        vp.privateKey = "SECRET-LEAK-CANARY-d-jwk";
        const snap2 = JSON.stringify(r.buildStateSnapshot());
        out.injectedKeyStaysOut = snap2.indexOf("SECRET-LEAK-CANARY") < 0;
        if (hadKey) vp.privateKey = saved;
        else delete vp.privateKey;
        return out;
    });
    if (!res) {
        check("G8 R0: Sovereign-State-Sonde lief", false, "evaluate warf");
        return;
    }
    check("G8 R0: SOVEREIGN_STATE benannt + eingefroren (der innerste Ring)", res.frozen && res.namesRing);
    check("G8 R0: der Trennungs-Beweis (_sovereignStateAudit) ist sauber", res.auditOk, res.auditLeaks);
    check(
        "G8 R0: der Welt-Snapshot trägt KEINEN souveränen Slot + kein Privat-Feld",
        res.snapNoSovereignSlot && res.snapNoPrivateField
    );
    check(
        "G8 R0: der Portal-Payload trägt nur die öffentliche Identität",
        res.payloadPublicOnly && res.payloadIdPublic
    );
    check("G8 R0: ein injiziertes Privat-Feld leckt NICHT in den Snapshot (fixer Key-Satz)", res.injectedKeyStaysOut);
}

// G8 R4 — Netz-Immunität: Herkunfts-KETTE (4a) · RÜCKRUF (4b: ein revozierter Schlüssel stößt jedes
// Artefakt mit ihm in der Kette aus) · Quarantäne (4c: der welt-exponierte LLM formuliert keinen
// souveränen Akt).
async function checkBandG8R4Immunity(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const K = r.constructor;
        const out = {};
        // (1) revokedKeys benannt im innersten Ring + NIE im Snapshot.
        out.revokedInRing = K.SOVEREIGN_STATE.excludedStateKeys.includes("revokedKeys");
        out.revokedNotInSnapshot = JSON.stringify(r.buildStateSnapshot()).indexOf("revokedKeys") < 0;
        // Zustand sichern, den wir mutieren. revokedKeys ist eine Map → echte Map-Kopie; ein
        // Object.assign-Klon ergäbe {} und der Restore bräche das nächste .set().
        const savedRevoked = new Map(r.state.revokedKeys);
        const savedSigned = JSON.parse(JSON.stringify(r.state.signedWorlds || {}));
        const KA = "aa".repeat(32);
        const KB = "bb".repeat(32);
        const KEVIL = "cc".repeat(32);
        // (2) Herkunftskette: append baut die Kette (Ursprung → Überträger), dedup.
        const art = {};
        r._appendProvenance(art, KA);
        r._appendProvenance(art, KA); // dedup (schon letzter)
        r._appendProvenance(art, KB);
        out.chainBuilds = art.provenance.length === 2 && art.provenance[0].by === KA && art.provenance[1].by === KB;
        const summ = r._provenanceSummary(art);
        out.summaryShowsLineage = summ.chain.length === 2 && summ.passers === 1 && /Ursprung/.test(summ.label);
        // (3) Sanitize: eine eingehende Kette wird gesäubert (hex-gated, "ed25519:"-tolerant).
        const cleanChain = r._sanitizeProvenance([
            { by: "ed25519:" + KA, at: 1 },
            { by: "NOTHEX", at: 2 },
            { by: KB, at: 3 },
        ]);
        out.sanitizeDropsGarbage = cleanChain.length === 2 && cleanChain[0].by === KA && cleanChain[1].by === KB;
        // (4) RÜCKRUF: revoke KEVIL → erkannt; ein Artefakt mit KEVIL in der Kette
        // ist tainted + wird gepurged; ein sauberes bleibt.
        r.revokeKey(KEVIL, { silent: true });
        out.revoked = r._isKeyRevoked(KEVIL) === true && r._isKeyRevoked("ed25519:" + KEVIL) === true;
        out.taintDetected =
            r._artifactProvenanceTainted({
                authorPubKey: KA,
                provenance: [
                    { by: KA, at: 1 },
                    { by: KEVIL, at: 2 },
                ],
            }) === true;
        out.cleanNotTainted =
            r._artifactProvenanceTainted({
                authorPubKey: KA,
                provenance: [
                    { by: KA, at: 1 },
                    { by: KB, at: 2 },
                ],
            }) === false;
        r.state.signedWorlds = r.state.signedWorlds || {};
        r.state.signedWorlds["_g8r4_evil"] = {
            authorPubKey: KEVIL,
            signature: "ab",
            provenance: [{ by: KEVIL, at: 1 }],
        };
        r.state.signedWorlds["_g8r4_good"] = { authorPubKey: KA, signature: "cd", provenance: [{ by: KA, at: 1 }] };
        const purged = r._purgeRevokedArtifacts();
        out.purgeDropsEvil = !r.state.signedWorlds["_g8r4_evil"] && !!r.state.signedWorlds["_g8r4_good"] && purged >= 1;
        // (5) QUARANTÄNE (4c): ein LLM-Source-DSL mit souveränem Op → sovereign_blocked
        // (die R2-Wand hält für den welt-exponierten Pfad — das Dual-LLM-Pattern).
        const llmRun = r.dslRun(["sign_manifest"], { source: "llm:grok" });
        out.llmCannotSovereign = Array.isArray(llmRun.log) && llmRun.log.some((e) => e.event === "sovereign_blocked");
        // restore
        delete r.state.signedWorlds["_g8r4_evil"];
        delete r.state.signedWorlds["_g8r4_good"];
        r.unrevokeKey(KEVIL);
        r.state.revokedKeys = savedRevoked;
        r.state.signedWorlds = savedSigned;
        r._saveSignedWorlds();
        r._saveRevokedKeys();
        return out;
    });
    if (!res) {
        check("G8 R4: Immunsystem-Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "G8 R4: revokedKeys im innersten Ring + NIE im Snapshot",
        res.revokedInRing && res.revokedNotInSnapshot
    );
    check(
        "G8 R4 (4a): die Herkunftskette baut sich (Ursprung → Überträger, dedup) + zeigt die Lineage",
        res.chainBuilds && res.summaryShowsLineage
    );
    check("G8 R4 (4a): eine eingehende Kette wird gesäubert (hex-gated, ed25519:-tolerant)", res.sanitizeDropsGarbage);
    check(
        "G8 R4 (4b): Rückruf erkannt + tainted-Erkennung (vergiftet ja · sauber nein)",
        res.revoked && res.taintDetected && res.cleanNotTainted
    );
    check(
        "G8 R4 (4b): der Rückruf STÖSST AUS — ein revoziertes Artefakt fällt, ein sauberes bleibt",
        res.purgeDropsEvil
    );
    check(
        "G8 R4 (4c): der welt-exponierte LLM kann keinen souveränen Akt formulieren (R2-Wand)",
        res.llmCannotSovereign
    );
}

// G8 R5 — das LEBENDE Immunsystem (M5): die vier Angriffs-Korpora SIND das
// Antikörper-Archiv. Kein neuer Apparat — eine neue ROLLE für die Invarianten-
// Maschinerie: jeder Erreger impft bei jedem Push, ein Regress ist sofort rot.
async function checkBandG8R5LivingImmune(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const corpus = r._robustnessCorpus();
        out.fourClasses = Array.isArray(corpus) && corpus.length === 4;
        out.allLive = corpus.every((c) => c.live === true);
        const mechs = corpus.map((c) => String(c.mechanism));
        out.allMechanisms = ["M1", "M2", "M3", "M4"].every((m) => mechs.some((x) => x.indexOf(m) >= 0));
        out.classIds = corpus.map((c) => c.id).join(",");
        return out;
    });
    if (!res) {
        check("G8 R5: Immun-Archiv-Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "G8 R5: das Antikörper-Archiv ist enumeriert (_robustnessCorpus → vier Klassen)",
        res.fourClasses,
        res.classIds
    );
    check("G8 R5: jede Angriffsklasse hat eine LEBENDE Wand (alle Guards da)", res.allLive);
    check(
        "G8 R5: alle vier Mechanismen vertreten (M1 Lokalität · M2 Dämpfung · M3 Katalysator · M4 Immunität)",
        res.allMechanisms
    );
}

// Ω3 Re-Derive-Wand, Antikörper „der lügende Bauplan": ein fremdes Artefakt behauptet role=workshop-
// station + roleManual, schmuggelt ein portalMeta-Origin, trägt ein Gott-Material (härte=10⁶) und
// ein revoziertes Ketten-Glied → Rolle lokal emergiert, Portal sanitisiert, Klemme am Leser, Sieb.
async function checkBandTailleOmega3(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const C = r.constructor;
        const out = {};
        const KEVIL = "ef".repeat(32);
        const savedRevoked = r.state.revokedKeys;
        r.revokeKey(KEVIL, { silent: true });
        const mkPart = (material) => ({
            shape: "box",
            material,
            position: { x: 0, y: 0, z: 0 },
            size: { x: 1.5, y: 1.5, z: 1.5 },
            rotation: { x: 0, y: 0, z: 0 },
            opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
        });
        const srcId = "taille-omega3-src";
        const srcSave = {
            worldMeta: { worldId: srcId, slug: "ω3-quelle" },
            materials: [
                {
                    name: "o3_gott",
                    label: "Gott-Stoff",
                    tags: { härte: 1e6, dichte: 1e6 },
                },
            ],
            blueprints: [
                {
                    // der LÜGNER: eine Box behauptet workshop-station + roleManual
                    // + schmuggelt ein fremdes Portal-Origin.
                    name: "o3_luegner",
                    label: "Lügner",
                    role: "workshop-station",
                    roleManual: true,
                    portalMeta: { world: "https://evil.example/x.html", label: "Evil" },
                    parts: [mkPart("stein")],
                    connections: [],
                },
                {
                    // die GOTT-MAUER: ein Werk aus härte=10⁶.
                    name: "o3_mauer",
                    label: "Gott-Mauer",
                    parts: [mkPart("o3_gott")],
                    connections: [],
                },
                {
                    // das VERGIFTETE: ein revoziertes Glied in der Kette.
                    name: "o3_gift",
                    label: "Gift",
                    parts: [mkPart("stein")],
                    connections: [],
                    provenance: [{ by: KEVIL, at: 1 }],
                },
            ],
            tools: [
                { name: "o3_badtool", label: "Bad", opClass: "nichtexistent", opName: "x", precisionCap: 0.5 },
                { name: "o3_goodtool", label: "Gut", opClass: "plastic", opName: "schmieden", precisionCap: 0.5 },
            ],
        };
        localStorage.setItem(r.worldStorageKey(srcId), JSON.stringify(srcSave));
        const resImp = r.importRecipesFromWorld(srcId);
        out.importOk = !!(resImp && resImp.ok);
        const luegner = r.state.blueprints["o3_luegner"];
        const mauer = r.state.blueprints["o3_mauer"];
        const gift = r.state.blueprints["o3_gift"];
        const goodTool = r.state.tools["o3_goodtool"];
        const badTool = r.state.tools["o3_badtool"];
        // (1) Behauptung/Wahrheit: roleClaimed trägt die Lüge, role emergiert
        // lokal (eine Box ist KEINE Werkstatt-Station), roleManual fiel.
        out.claimSeparated =
            !!luegner &&
            luegner.roleClaimed === "workshop-station" &&
            luegner.role !== "workshop-station" &&
            luegner.roleManual === undefined;
        // (2) die Portal-Wand: das geschmuggelte fremde Origin ist sanitisiert
        // (worlds/-Pfad — _sanitizePortalMeta lief im EINEN Eingang).
        out.portalSanitized =
            !!luegner && (!luegner.portalMeta || !/evil\.example/.test(String(luegner.portalMeta.world)));
        // (3) die Klemme am Leser: die Gott-Mauer ist ABBAUBAR (fit klar über 0;
        // die Substanz selbst bleibt unangetastet — härte=10⁶ lebt im Material).
        out.matMagnitudeKept = r.state.materials["o3_gott"] && r.state.materials["o3_gott"].tags["härte"] === 1e6;
        const fit = r._harvestFitnessFromResist(r._architectureResistance({ type: "o3_mauer" }));
        out.wallBreakable = !!mauer && fit.fit > 0.01;
        out.ceilFrozen = Object.isFrozen(C.MATERIAL_TAG_CEIL) && C.MATERIAL_TAG_CEIL["härte"] === 2;
        // (4) das Rückruf-Sieb AM EINGANG: das Vergiftete kam NIE in den state.
        out.taintedFellAtGate = gift === undefined;
        // (5) die Tool-Wand: opClass-Müll fällt, das valide Werkzeug lebt.
        out.toolWall = badTool === undefined && !!goodTool;
        // (6) die Signatur bleibt prüfbar über roleClaimed (Kanon liest
        // roleClaimed ?? role) — der goldene Pfad: signieren → importieren →
        // verify bleibt valid, obwohl die lokale Rolle re-derived wurde.
        r.state.blueprints["_o3_signed"] = {
            name: "_o3_signed",
            label: "Ω3-Siegel",
            builtIn: false,
            role: "weapon",
            roleManual: true,
            parts: [mkPart("stein")],
            connections: [],
        };
        let sigChain = false;
        if (r.state.vibePass && r.state.vibePass.ready) {
            const s = await r.signBlueprint("_o3_signed", { skipConfirm: true });
            if (s.ok) {
                const wire = r._serializeBlueprint(r.state.blueprints["_o3_signed"]);
                const admitted = r._admitForeignArtifact(wire);
                sigChain =
                    !!admitted &&
                    admitted.roleClaimed === "weapon" &&
                    (await r.verifyBlueprintSignature(admitted)) === "valid";
            }
        } else {
            sigChain = true; // kein Secure Context → der Krypto-Teil ruht (headless-Wand anderswo)
        }
        out.signatureSurvivesRederive = sigChain;
        // Aufräumen.
        delete r.state.blueprints["o3_luegner"];
        delete r.state.blueprints["o3_mauer"];
        delete r.state.blueprints["_o3_signed"];
        delete r.state.materials["o3_gott"];
        delete r.state.tools["o3_goodtool"];
        localStorage.removeItem(r.worldStorageKey(srcId));
        r.unrevokeKey(KEVIL);
        r.state.revokedKeys = savedRevoked;
        return out;
    });
    if (!res) {
        check("Ω3: Antikörper-Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "Ω3: der Import läuft + die Lüge ist getrennt (roleClaimed trägt, role emergiert, roleManual fällt)",
        res.importOk && res.claimSeparated
    );
    check(
        "Ω3: die Portal-Wand hält am EINEN Eingang (fremdes Origin sanitisiert — kein Reload nötig)",
        res.portalSanitized
    );
    check(
        "Ω3: die Klemme sitzt am LESER — die Gott-Mauer ist abbaubar, die Substanz bleibt unangetastet (härte=10⁶ lebt)",
        res.wallBreakable && res.matMagnitudeKept && res.ceilFrozen
    );
    check("Ω3: das Rückruf-Sieb fällt Vergiftetes AM EINGANG (nicht erst beim Laden)", res.taintedFellAtGate);
    check("Ω3: die Tool-Wand gilt auch dem Import (opClass/opName whitelisted)", res.toolWall);
    check(
        "Ω3: die Signatur überlebt das Re-Derive (Kanon liest roleClaimed ?? role → valid)",
        res.signatureSurvivesRederive
    );
}

// Ω4 Konformanz-Korpus: die eingefrorenen goldenen Dateien (spec/golden/v1/ — NIE regeneriert) muss
// der heutige Code lesen; beide Signaturen verifizieren "valid", der Snapshot-Kopf trägt ⊇ das
// goldene Schema, jeder goldene p2p-Typ hat Handler + pv-Stempel. Bricht das: Taille verletzt.
async function checkBandTailleGolden(ctx) {
    const { page, check } = ctx;
    // Leuchtturm: jeder im signaling-server gelesene `msg.type === "X"`-Typ MUSS in §7 der Taille-Spec
    // dokumentiert sein (ein Broker-Typ ohne Andock-Vertrag ist der Riss von morgen); plus der
    // Ein-Befehl-Self-Host existiert.
    try {
        const brokerSrc = fs.readFileSync(path.join(SKRIPTE, "..", "signaling-server.js"), "utf8");
        const specDe = fs.readFileSync(path.join(SKRIPTE, "..", "docs", "taille-spec.md"), "utf8");
        const typen = new Set();
        for (const m of brokerSrc.matchAll(/msg\.type === "([a-z-]+)"/g)) typen.add(m[1]);
        const fehltDe = [...typen].filter((t) => !specDe.includes("`" + t));
        check(
            `Leuchtturm §7: alle ${typen.size} Broker-Typen sind im Andock-Vertrag dokumentiert${fehltDe.length ? " (fehlt: " + fehltDe.join(",") + ")" : ""}`,
            fehltDe.length === 0
        );
        const pkg = JSON.parse(fs.readFileSync(path.join(SKRIPTE, "..", "package.json"), "utf8"));
        check(
            "Leuchtturm: der Ein-Befehl-Self-Host steht (npm run leuchtturm + scripts/leuchtturm.cjs + README-Sektion)",
            !!(pkg.scripts && pkg.scripts.leuchtturm) &&
                fs.existsSync(path.join(SKRIPTE, "..", "scripts", "leuchtturm.cjs")) &&
                /Dein eigener Leuchtturm/.test(fs.readFileSync(path.join(SKRIPTE, "..", "README.md"), "utf8"))
        );
    } catch (e) {
        check("Leuchtturm §7: Drift-Wächter lesbar", false, e.message);
    }
    const goldenDir = path.join(SKRIPTE, "..", "spec", "golden", "v1");
    let golden = null;
    try {
        golden = {
            blueprint: JSON.parse(fs.readFileSync(path.join(goldenDir, "blueprint-signed.json"), "utf8")),
            manifest: JSON.parse(fs.readFileSync(path.join(goldenDir, "world-manifest.json"), "utf8")),
            snapshotHead: JSON.parse(fs.readFileSync(path.join(goldenDir, "snapshot-head.json"), "utf8")),
            envelopes: JSON.parse(fs.readFileSync(path.join(goldenDir, "p2p-envelopes.json"), "utf8")),
        };
    } catch (e) {
        check("Ω4: die goldenen Dateien existieren (spec/golden/v1 — NIE regenerieren)", false, e.message);
        return;
    }
    check("Ω4: die goldenen Dateien existieren (spec/golden/v1 — NIE regenerieren)", true);
    const res = await safeEvaluate(
        page,
        async (g) => {
            const r = window.anazhRealm;
            const out = {};
            // (1) der goldene Bauplan: lesbar + Signatur EWIG "valid" + die
            // Kette lebt + der Admit-Pfad (Re-Derive) bricht die Echtheit nicht.
            const deser = r._deserializeBlueprint(g.blueprint);
            out.bpReadable = !!deser && deser.parts.length === 3 && deser.connections.length === 2;
            out.bpProvenance = !!deser && Array.isArray(deser.provenance) && deser.provenance.length === 1;
            out.bpSigValid = deser ? (await r.verifyBlueprintSignature(deser)) === "valid" : false;
            const admitted = r._admitForeignArtifact(g.blueprint);
            out.bpAdmitValid =
                !!admitted &&
                admitted.roleClaimed === "weapon" &&
                (await r.verifyBlueprintSignature(admitted)) === "valid";
            // (2) das goldene Manifest: die Sanitize nimmt es + Signatur "valid".
            const man = r._sanitizeImportedManifest({ ...g.manifest, id: "taille-golden-band" });
            out.manReadable = !!man && !!man.signature;
            out.manSigValid = man
                ? await r._vibeVerify(r._canonicalManifest({ ...g.manifest }), man.signature, man.authorPubKey)
                : false;
            // (3) der Snapshot-Kopf: das heutige Schema ⊇ das goldene (additiv
            // wachsen erlaubt, verlieren = Taille verletzt) + Typen kompatibel.
            const snap = r.buildStateSnapshot();
            const missing = [];
            for (const k of Object.keys(g.snapshotHead.schema)) {
                const want = g.snapshotHead.schema[k];
                const v = snap[k];
                const got = Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
                if (v === undefined || (got !== want && want !== "null" && got !== "null"))
                    missing.push(`${k}:${want}→${got}`);
            }
            out.snapKeys = missing.length === 0;
            out.snapMissing = missing.join(",");
            const wmKeys = Object.keys(snap.worldMeta || {});
            out.snapWorldMeta = g.snapshotHead.worldMetaKeys.every((k) => wmKeys.includes(k));
            // (4) die p2p-Umschläge: pv-Vertrag + jeder goldene Typ hat einen
            // lebenden Handler (kanal-exklusiv ODER im ALLOWED-Durchreich-Satz).
            out.pvMatches = g.envelopes.pv === r.constructor.PROTO_VERSION;
            // am Ruf: je goldenem Typ erreicht ein Umschlag über den echten Kanal-Eingang seinen Handler (kanal-exklusiv steht an
            // der Liste KANAL, sonst die Registry hinter der ALLOWED-Durchreichung)
            const H = r.constructor.P2P_MESSAGE_HANDLERS;
            const KANAL = { "social-rating": "_socialRatingReceive" };
            const dead = g.envelopes.types
                .map((t) => t.type)
                .filter((t) => {
                    const prov = KANAL[t] || H[t];
                    const roh = JSON.stringify({ type: t });
                    return !(
                        typeof prov === "string" &&
                        typeof r[prov] === "function" &&
                        window.__consumes(r, "_p2pHandleChannelMessage", r, prov, ["__golden", roh])
                    );
                });
            r._p2pRemovePeer("__golden");
            out.typesAlive = dead.length === 0;
            out.deadTypes = dead.join(",");
            return out;
        },
        golden
    );
    if (!res) {
        check("Ω4: Konformanz-Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "Ω4: der goldene Bauplan ist lesbar (3 Parts · 2 Verbindungen · Kette lebt)",
        res.bpReadable && res.bpProvenance
    );
    check("Ω4: die goldene Bauplan-Signatur verifiziert EWIG valid (die Taille hält)", res.bpSigValid);
    check("Ω4: der Admit-Pfad bewahrt die goldene Echtheit (roleClaimed-Kanon)", res.bpAdmitValid);
    check("Ω4: das goldene Manifest ist lesbar + seine Signatur valid", res.manReadable && res.manSigValid);
    check("Ω4: der Snapshot-Kopf trägt ⊇ das goldene Schema (Typen kompatibel)", res.snapKeys, res.snapMissing);
    check("Ω4: worldMeta trägt ⊇ die goldenen Schlüssel", res.snapWorldMeta);
    check("Ω4: die goldenen p2p-Typen leben (Handler + pv-Vertrag)", res.pvMatches && res.typesAlive, res.deadTypes);
}

// Φ Welten-Netz: Φ1 Welt-Adressen + tragendes Portal · Φ2 Sichtbarkeit + Hausrecht (Welt verlinkt
// Welt, Portal = Hyperlink, Adresse = URL). Taille-konform additiv (alte Builds ignorieren neue
// worldMeta-Felder); Bann/Kick/Adress-Setter sind R2 — KEIN DSL-Op trägt sie (die Wand).
async function checkBandPhiArchipel(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const out = {};
        const AR = window.AnazhRealm || r.constructor;

        // (P1) FROZEN-Stufen-Sätze existieren + sind genau die Wörter aus dem Plan.
        out.visibilityStages =
            Array.isArray(AR.WORLD_VISIBILITY_STAGES) &&
            AR.WORLD_VISIBILITY_STAGES.join(",") === "privat,einladung,verlinkt,gelistet";
        out.guestRightsStages =
            Array.isArray(AR.WORLD_GUEST_RIGHTS_STAGES) &&
            AR.WORLD_GUEST_RIGHTS_STAGES.join(",") === "frieden,pfad,mitschöpfer";
        out.addressFields =
            Array.isArray(AR.WORLD_ADDRESS_SIGNED_FIELDS) &&
            AR.WORLD_ADDRESS_SIGNED_FIELDS.join(",") === "worldId,roomId,broker,label";

        // (P2) worldMeta trägt die NEUEN Felder mit Erst-Wurf-Defaults
        // (Migrations-tolerant: ein Legacy-"private" heilt zu "privat").
        const wm = r.state.worldMeta;
        out.wmGuestRights = wm && wm.guestRights === "frieden";
        out.wmBanList = wm && wm.banList && Array.isArray(wm.banList.peerIds) && Array.isArray(wm.banList.vibePassKeys);
        out.wmWorldAddressNull = wm && wm.worldAddress === null;
        // visibility — Migration: jeder Legacy-Wert (private) wird zu privat,
        // die kanonischen 4 Stufen werden akzeptiert.
        out.normPrivate = r._normalizeWorldVisibility("private") === "privat";
        out.normGelistet = r._normalizeWorldVisibility("gelistet") === "gelistet";
        out.normGarbage = r._normalizeWorldVisibility("kosmisch") === null;
        out.normGuestRights = r._normalizeGuestRights("mitschöpfer") === "mitschöpfer";

        // (P3) DIE R2-WAND: KEINE der neuen Methoden ist als DSL-Op registriert
        // (kein Skript kann sie automatisch auslösen — die Disjunktheit am Pool
        // ist die Wand; SOVEREIGN_ACTIONS bleibt FROZEN auf vier Akte).
        out.sovereignFrozen = AR.SOVEREIGN_ACTIONS.length === 4;
        // Die neuen Akte sind GAR KEINE Ops: die EINE Dispatch-Tafel der DSL (`dslEffects[op]`, sonst unknown_op) kennt sie nicht.
        const keinOp = (op) => !r.dslEffects[op];
        out.noKickOp = keinOp("kick_peer");
        out.noBanOp = keinOp("ban_peer");
        out.noSetVisibilityOp = keinOp("set_visibility");
        out.noSetPortalAddressOp = keinOp("set_portal_address");

        // (P4) Die EINE Signatur-Schicht: _canonicalWorldAddress ist deterministisch
        // (gleiche Substanz → gleicher String); die FROZEN-Felder + v:1 sind drin.
        const a1 = { worldId: "w1", roomId: "r1", broker: "ws://h:4313", label: "L" };
        const a2 = { worldId: "w1", roomId: "r1", broker: "ws://h:4313", label: "L", extra: "x" };
        out.canonicalDeterministic = r._canonicalWorldAddress(a1) === r._canonicalWorldAddress(a2);
        out.canonicalHasV1 = /"v":1/.test(r._canonicalWorldAddress(a1));
        out.canonicalHasAllFields = AR.WORLD_ADDRESS_SIGNED_FIELDS.every((f) =>
            r._canonicalWorldAddress(a1).includes(`"${f}":`)
        );

        // (P5) _admitForeignWorldAddress siebt Form + Signatur: kaputte Form fällt (kein worldId, kein
        // wss-broker …), gültige passt + bekommt die Hex-Hülle, revozierte Herkunft fällt am Eingang.
        out.admitNull = r._admitForeignWorldAddress(null) === null;
        out.admitNoBroker =
            r._admitForeignWorldAddress({ worldId: "w1", roomId: "r1", broker: "http://x", label: "L" }) === null;
        out.admitOk = !!r._admitForeignWorldAddress({
            worldId: "wabc123",
            roomId: "rabc123",
            broker: "ws://x.y:4313",
            label: "Test",
        });
        // Revozierte Herkunft (R4-Wand): Schlüssel revozieren, dann admittieren.
        const fakeKey = "f".repeat(64);
        const before = r.state.revokedKeys.size;
        r.revokeKey(fakeKey);
        out.admitRevoked =
            r._admitForeignWorldAddress({
                worldId: "wabc123",
                roomId: "rabc123",
                broker: "ws://x.y:4313",
                label: "Test",
                authorPubKey: fakeKey,
                sig: "deadbeef",
            }) === null;
        // Aufräumen — wir haben gerade einen Test-Schlüssel revoziert.
        r.state.revokedKeys.delete(fakeKey);
        r._saveRevokedKeys();
        out.revokeCleanup = r.state.revokedKeys.size === before;

        // (P6) Signieren + verifizieren mit dem vibePass (Round-Trip).
        const signed = await r.signWorldAddress({ skipConfirm: true, label: "test-welt", broker: "ws://h:4313" });
        out.signOk = !!(signed && signed.ok && signed.address && signed.address.sig);
        const status = signed && signed.ok ? await r.verifyWorldAddress(signed.address) : null;
        out.verifyValid = status === "valid";
        // Manipulierte Adresse (label geändert) → invalid (die Signatur deckt label).
        const manip = { ...signed.address, label: "GEÄNDERT" };
        const manipStatus = await r.verifyWorldAddress(manip);
        out.verifyInvalidOnManip = manipStatus === "invalid";

        // (P7) Portal trägt die Adresse als portalMeta-Feld; setPortalToActiveWorld
        // greift die signierte Adresse aus der aktiven Welt; Clear räumt sie weg.
        // Brauchen einen TEST-Bauplan.
        r.state.blueprints["phi_test_portal"] = {
            name: "phi_test_portal",
            label: "Φ-Test-Portal",
            builtIn: false,
            parts: [
                __teil("torus", "stein", 0, 1, 0, 2, 2, 0.4, { rotation: { x: 0, y: 0, z: 0 }, opChain: [] }),
            ],
            connections: [],
        };
        const setRes = r.setPortalToActiveWorld("phi_test_portal");
        out.portalSetOk = !!(setRes && setRes.ok);
        const bp = r.state.blueprints["phi_test_portal"];
        out.portalCarriesAddress = !!(bp && bp.portalMeta && bp.portalMeta.worldAddress);
        out.portalSigPreserved = !!(
            bp &&
            bp.portalMeta &&
            bp.portalMeta.worldAddress &&
            bp.portalMeta.worldAddress.sig
        );
        const clearRes = r.setPortalAddress("phi_test_portal", null);
        out.portalClearOk = !!(clearRes && clearRes.ok && clearRes.cleared) && !bp.portalMeta.worldAddress;
        delete r.state.blueprints["phi_test_portal"];

        // (P8) Visibility-Setter wirkt + gelistet ruft die Lobby-BRIDGE (am Ruf). Den echten Round-Trip
        // deckt smoke-multiuser; headless returnt publishToLobby früh {ok:false, reason:"not_connected"}.
        const visBefore = r.state.worldMeta.visibility;
        r.setWorldVisibility("gelistet");
        out.visGelistet = r.state.worldMeta.visibility === "gelistet";
        r.setWorldVisibility("privat");
        out.visPrivat = r.state.worldMeta.visibility === "privat";
        out.lobbyBridgePublishes = window.__consumes(r, "setWorldVisibility", r, "publishToLobby", ["gelistet"]);
        r.setWorldVisibility(visBefore || "privat");

        // (P9) Hausrecht-Sieb: ein gebannter peer fällt am _isPeerBanned, ein
        // unbekannter geht durch. Round-Trip ban → unban heilt das Sieb.
        const banRes = r.banPeer("test-peer-xyz");
        out.banPeerOk = !!(banRes && banRes.ok);
        out.bannedPeerSieb = r._isPeerBanned("test-peer-xyz", null) === true;
        out.unknownPeerPasses = r._isPeerBanned("never-seen-peer", null) === false;
        r.unbanPeer("test-peer-xyz");
        out.unbanHeals = r._isPeerBanned("test-peer-xyz", null) === false;

        // (P10) GuestRights-Setter: Default "frieden", Stufen klemmen ungültiges.
        r.setWorldGuestRights("mitschöpfer");
        out.guestRightsMitschoepfer = r.state.worldMeta.guestRights === "mitschöpfer";
        const badGR = r.setWorldGuestRights("kosmisch");
        out.guestRightsRejectsMüll = !badGR.ok;
        r.setWorldGuestRights("frieden");
        out.guestRightsBackToFrieden = r.state.worldMeta.guestRights === "frieden";

        // (P11) Snapshot-Round-Trip: die neuen Felder überleben buildStateSnapshot
        // + loadState bit-gleich (must-preserve am eigenen Welt-Save).
        const snap = r.buildStateSnapshot();
        out.snapHasGuestRights = snap.worldMeta && snap.worldMeta.guestRights === "frieden";
        out.snapHasBanList = !!(snap.worldMeta && snap.worldMeta.banList);
        out.snapHasWorldAddress = "worldAddress" in (snap.worldMeta || {});

        // Aufräumen — die signierte Test-Adresse aus der aktiven Welt entfernen.
        r.state.worldMeta.worldAddress = null;
        return out;
    });

    check(
        "Φ1+Φ2 (P1): FROZEN-Stufen-Sätze tragen genau die Plan-Wörter (visibility · guestRights · address-Felder)",
        res.visibilityStages && res.guestRightsStages && res.addressFields
    );
    check(
        "Φ2 (P2): worldMeta trägt die neuen Felder mit Erst-Wurf-Defaults (guestRights=frieden · banList · worldAddress=null)",
        res.wmGuestRights && res.wmBanList && res.wmWorldAddressNull
    );
    check(
        "Φ2 (P2-Migration): _normalizeWorldVisibility heilt Legacy 'private' → 'privat', verwirft Müll, kennt alle 4 Stufen",
        res.normPrivate && res.normGelistet && res.normGarbage && res.normGuestRights
    );
    check(
        "Φ-DISJUNKTHEIT (P3 — R2-Wand strukturell): KEIN DSL-Op trägt kick_peer/ban_peer/set_visibility/set_portal_address (kein Skript automatisch); SOVEREIGN_ACTIONS bleibt FROZEN auf 4 Akte",
        res.sovereignFrozen && res.noKickOp && res.noBanOp && res.noSetVisibilityOp && res.noSetPortalAddressOp
    );
    check(
        "Φ1 (P4): _canonicalWorldAddress deterministisch (extra-Felder ignoriert) + trägt v:1 + alle 4 FROZEN-Felder",
        res.canonicalDeterministic && res.canonicalHasV1 && res.canonicalHasAllFields
    );
    check(
        "Φ1 (P5): _admitForeignWorldAddress siebt strukturell (kein broker → null · gültig → admittiert) + R4-Wand (revozierte Herkunft fällt)",
        res.admitNull && res.admitNoBroker && res.admitOk && res.admitRevoked && res.revokeCleanup
    );
    check(
        "Φ1 (P6): signWorldAddress signiert + verifyWorldAddress liest 'valid' zurück + Manipulation am label kippt zu 'invalid'",
        res.signOk && res.verifyValid && res.verifyInvalidOnManip
    );
    check(
        "Φ1 (P7): setPortalToActiveWorld legt die signierte Adresse ins Portal (portalMeta.worldAddress + sig erhalten); setPortalAddress(null) räumt sie",
        res.portalSetOk && res.portalCarriesAddress && res.portalSigPreserved && res.portalClearOk
    );
    check(
        "Φ2 (P8): setWorldVisibility wirkt (gelistet · privat) + gelistet ruft die Lobby-BRIDGE publishToLobby — der echte Connected-Trip lebt im smoke-multiuser",
        res.visGelistet && res.visPrivat && res.lobbyBridgePublishes
    );
    check(
        "Φ2 (P9): _isPeerBanned siebt (gebannt → true · unbekannt → false · unban heilt)",
        res.banPeerOk && res.bannedPeerSieb && res.unknownPeerPasses && res.unbanHeals
    );
    check(
        "Φ2 (P10): setWorldGuestRights wirkt + klemmt Müll-Stufe",
        res.guestRightsMitschoepfer && res.guestRightsRejectsMüll && res.guestRightsBackToFrieden
    );
    check(
        "Φ1+Φ2 (P11 — must-preserve): die neuen worldMeta-Felder überleben den Snapshot bit-gleich (Round-Trip ohne Verlust)",
        res.snapHasGuestRights && res.snapHasBanList && res.snapHasWorldAddress
    );
}

// Φ3 Regions-Archipel (Regions-Bubbles, opt-in via regionsActive) · Φ4 Anwesenheit (regional
// aufgelöste Köpfe: Broker-Antwort, Client-Cache) · Φ5 Mittragen (Welten pinnen, mittragend
// antworten).
async function checkBandPhiArchipelV2(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const AR = window.AnazhRealm || r.constructor;
        const out = {};

        // ====================================================================
        // Φ3 — Regions-Archipel
        // ====================================================================

        // (Q1) FROZEN-Geometrie: 8 Chunks × 43.2m = 345.6m + 10m Hysterese.
        out.regionChunks = AR.REGION_CHUNKS === 8;
        out.regionSpan = AR.REGION_SPAN_M === 345.6;
        out.regionHyst = AR.REGION_HYSTERESIS_M === 10;

        // (Q2) Mathe-Helper: Position → Region → Bounds Round-Trip ist invertierbar.
        out.keyOrigin = r._regionKeyForPos(0, 0) === "r0_0";
        out.keyPositive = r._regionKeyForPos(500, 0) === "r1_0";
        out.keyNegative = r._regionKeyForPos(-1, -1) === "r-1_-1";
        const b = r._regionBoundsFromKey("r2_-3");
        out.boundsOk = b && b.rx === 2 && b.rz === -3 && b.minX === 691.2 && b.maxZ === -2 * 345.6;
        out.boundsMüllNull = r._regionBoundsFromKey("kaputt") === null;

        // (Q3) Room-ID-Bildung: regionKey leer → nur worldId (Fallback), gültig
        // → worldId:regionKey (das WEB-Muster für den Mesh-Broker).
        out.roomNoRegion = r._regionRoomId("welt-abc", "") === "welt-abc";
        out.roomWithRegion = r._regionRoomId("welt-abc", "r1_2") === "welt-abc:r1_2";
        out.roomMüllRegion = r._regionRoomId("welt-abc", "kaputt") === "welt-abc";
        out.roomNoWorld = r._regionRoomId("", "r0_0") === null;

        // (Q4) Default OFF: eine frische Welt hat regionsActive=false → eine Welt = ein Raum, kein Region-Suffix.
        const wmBefore = r.state.worldMeta;
        out.regionsDefaultOff = wmBefore && wmBefore.regionsActive === false;

        // (Q5) setRegionsActive wirkt + initialisiert currentRegionKey.
        const onRes = r.setRegionsActive(true);
        out.activateOk = !!(onRes && onRes.ok && onRes.regionsActive);
        out.activateCurrentKey =
            typeof onRes.currentRegionKey === "string" && /^r-?\d+_-?\d+$/.test(onRes.currentRegionKey);
        out.isActiveNow = r.isRegionsActive() === true;

        // (Q7) Übergangs-Detection: Spieler TIEF in eine neue Region setzen (≫ 10 m Hysterese-Margin) —
        // r2_2 hat Bounds 691.2–1036.8 je Achse, die Mitte 864 liegt 172.8 m von jeder Grenze.
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        let crossing = null;
        if (pm) {
            const oldX = pm.x;
            const oldZ = pm.z;
            pm.x = 864; // Mitte von r2 (691.2..1036.8)
            pm.z = 864; // Mitte von r2 (691.2..1036.8)
            crossing = r._regionTickDetectCrossing();
            pm.x = oldX;
            pm.z = oldZ;
        }
        out.crossingDetected = !!(crossing && crossing.crossed && crossing.newKey === "r2_2");

        // (Q8) Handoff-Helper: ohne P2P-Verbindung ist es ein no-op (Logge +
        // Override setzen, kein Wurf), with-mesh false.
        const handoffRes = r._p2pRegionHandoff("r0_0", "r1_0");
        out.handoffOkOffline = !!(handoffRes && handoffRes.ok && handoffRes.withMesh === false);
        out.handoffRoomCorrect = handoffRes && handoffRes.room && handoffRes.room.endsWith(":r1_0");

        // Wieder OFF schalten (clean state für nachfolgende Tests).
        r.setRegionsActive(false);
        out.deactivated = r.state.worldMeta.regionsActive === false;
        out.currentRegionGone = !("currentRegionKey" in r.state.worldMeta);

        // ====================================================================
        // Φ4 — Anwesenheits-Schicht (regional aufgelöste Köpfe)
        // ====================================================================

        // (Q9) presence-Map existiert + ist leer am Start.
        out.presenceMap = r.state.p2p && r.state.p2p.presence instanceof Map;
        out.presenceEmpty = r.state.p2p.presence.size === 0;

        // (Q10) worldPresence ohne Daten → null (sauber).
        out.presenceUnknownNull = r.worldPresence("never-polled") === null;

        // (Q11) _p2pMsgWorldPresence schreibt in den Cache (manuelle Injektion —
        // im Headless rennt kein echter Broker; smoke-multiuser deckt den
        // End-to-End-Trip).
        r._p2pMsgWorldPresence(
            {
                worldId: "welt-test",
                regions: [
                    { region: "", peers: 3 },
                    { region: "r0_0", peers: 2 },
                ],
            },
            r.state.p2p
        );
        const pres = r.worldPresence("welt-test");
        out.presenceCacheOk = !!(pres && pres.totalPeers === 5 && pres.regions.length === 2);

        // (Q12) requestWorldPresence ohne p2p.connected → false.
        out.requestNoConn = r.requestWorldPresence("welt-test") === false;

        // (Q13) HANDLER-Registry: der Broker→Client-Typ ist verdrahtet.
        out.handlerRegistered = AR.P2P_MESSAGE_HANDLERS["world-presence"] === "_p2pMsgWorldPresence";

        // ====================================================================
        // Φ5 — Mittragen (Torrent-Modell)
        // ====================================================================

        // (Q14) pinnedWorlds-Map existiert + ist leer am Start (im Test-Boot).
        out.pinnedMap = r.state.p2p && r.state.p2p.pinnedWorlds instanceof Map;
        const startPinned = r.state.p2p.pinnedWorlds.size;

        // (Q15) pinCurrentWorld pinnt + hash + bytes — und schreibt persistiert.
        const pinRes = r.pinCurrentWorld({ silent: true });
        out.pinOk = !!(pinRes && pinRes.ok && pinRes.worldId && pinRes.hash && pinRes.bytes > 0);
        out.pinInMap = r.state.p2p.pinnedWorlds.has(pinRes.worldId);
        const lsManifest = localStorage.getItem("anazh.pinnedManifest");
        out.pinPersisted = !!(lsManifest && lsManifest.includes(pinRes.worldId));
        const lsSnapshot = localStorage.getItem(`anazh.pinnedSnapshot.${pinRes.worldId}`);
        out.pinSnapshotPersisted = !!(lsSnapshot && lsSnapshot.length > 100);

        // (Q16) listPinnedWorlds liefert das Eintragsschema; bytes + hash drin.
        const pinned = r.listPinnedWorlds();
        out.listOk = pinned.length === startPinned + 1;
        out.listEntryShape = pinned.some(
            (p) => p.worldId === pinRes.worldId && typeof p.hash === "string" && p.bytes > 0
        );

        // (Q17) der Träger-Pfad: ein NICHT-Host beantwortet einen world-request
        // mit der gepinnten Welt (_p2pMaybeServeAsCarrier). Wir stellen den
        // p2p.room auf den gepinnten worldId + rufen den Helper direkt.
        const oldRoom = r.state.p2p.room;
        r.state.p2p.room = pinRes.worldId;
        // Captures: wir hooken _p2pSignal kurz, um zu sehen, ob ein
        // world-snapshot mit carrier=true rausging.
        let lastSignal = null;
        const origSignal = r._p2pSignal;
        r._p2pSignal = function (m) {
            lastSignal = m;
        };
        const served = r._p2pMaybeServeAsCarrier("test-joiner", {});
        r._p2pSignal = origSignal;
        r.state.p2p.room = oldRoom;
        out.carrierServed = served === true;
        out.carrierMsgValid =
            lastSignal &&
            lastSignal.type === "world-snapshot" &&
            lastSignal.to === "test-joiner" &&
            lastSignal.carrier === true &&
            typeof lastSignal.hash === "string";

        // (Q18) unpinWorld räumt; idempotent.
        const unpinRes = r.unpinWorld(pinRes.worldId);
        out.unpinOk = !!(unpinRes && unpinRes.ok && unpinRes.removed);
        out.unpinIdempotent = !r.state.p2p.pinnedWorlds.has(pinRes.worldId);
        // Aufräumen: localStorage-Snapshot lassen wir liegen (kein Müll, nur
        // ein orphan; ein erneuter pinCurrentWorld überschreibt).

        // (Q19) DISJUNKTHEIT: weder pin/unpin/setRegionsActive sind DSL-Ops (die Dispatch-Tafel `dslEffects` kennt sie nicht).
        out.noPinOp = !r.dslEffects.pin_world;
        out.noRegionOp = !r.dslEffects.set_regions_active;

        return out;
    });

    // Φ3 ——————
    check(
        "Φ3 (Q1): FROZEN-Geometrie REGION_CHUNKS=8 · REGION_SPAN=345.6m · HYSTERESIS=10m",
        res.regionChunks && res.regionSpan && res.regionHyst
    );
    check(
        "Φ3 (Q2): _regionKeyForPos + _regionBoundsFromKey invertierbar + Müll-Key → null",
        res.keyOrigin && res.keyPositive && res.keyNegative && res.boundsOk && res.boundsMüllNull
    );
    check(
        "Φ3 (Q3): _regionRoomId — leer/Müll-Region → nur worldId (Fallback); gültig → worldId:regionKey; ohne worldId → null",
        res.roomNoRegion && res.roomWithRegion && res.roomMüllRegion && res.roomNoWorld
    );
    check(
        "Φ3 (Q4): Default OFF — eine frische Welt hat regionsActive=false (bit-identisch zu V18.188; R6-Sanftheit)",
        res.regionsDefaultOff
    );
    check(
        "Φ3 (Q5): setRegionsActive(true) setzt das Flag + initialisiert currentRegionKey aus Spieler-Position; isRegionsActive() reagiert",
        res.activateOk && res.activateCurrentKey && res.isActiveNow
    );
    check(
        "Φ3 (Q7): Region-Übergangs-Detection feuert bei Sprung über die Grenze (mit ≥10m Margin) + identifiziert die neue Region",
        res.crossingDetected
    );
    check(
        "Φ3 (Q8): _p2pRegionHandoff ist offline ein sauberes no-op (Override gesetzt, kein WS-Wurf) + die neue Raum-ID stimmt",
        res.handoffOkOffline && res.handoffRoomCorrect
    );
    check(
        "Φ3 (Q9): setRegionsActive(false) räumt sauber (Flag aus + currentRegionKey weg)",
        res.deactivated && res.currentRegionGone
    );

    // Φ4 ——————
    check(
        "Φ4 (Q9): presence-Map existiert + ist initial leer (Privatheits-Default — opt-in pro Welt-Besuch)",
        res.presenceMap && res.presenceEmpty
    );
    check("Φ4 (Q10): worldPresence ohne Daten → null (sauberes Fehlsignal, kein Wurf)", res.presenceUnknownNull);
    check(
        "Φ4 (Q11): _p2pMsgWorldPresence schreibt in den Cache + worldPresence rechnet totalPeers korrekt",
        res.presenceCacheOk
    );
    check("Φ4 (Q12): requestWorldPresence returnt false ohne p2p.connected", res.requestNoConn);
    check(
        "Φ4 (Q13): P2P_MESSAGE_HANDLERS trägt world-presence → _p2pMsgWorldPresence (additiv, §4 minor)",
        res.handlerRegistered
    );

    // Φ5 ——————
    check(
        "Φ5 (Q14+Q15): pinnedWorlds-Map existiert + pinCurrentWorld erzeugt hash/bytes/persistiert (Manifest UND Snapshot)",
        res.pinnedMap && res.pinOk && res.pinInMap && res.pinPersisted && res.pinSnapshotPersisted
    );
    check(
        "Φ5 (Q16): listPinnedWorlds liefert das volle Eintragsschema (worldId · hash · bytes)",
        res.listOk && res.listEntryShape
    );
    check(
        "Φ5 (Q17): _p2pMaybeServeAsCarrier antwortet als Mitträger mit carrier=true + hash (Torrent-Modell wirkt; der Joiner kann hash-validieren)",
        res.carrierServed && res.carrierMsgValid
    );
    check("Φ5 (Q18): unpinWorld räumt sauber (Map + Persistenz)", res.unpinOk && res.unpinIdempotent);
    check(
        "Φ5 (Q19): R2-DISJUNKTHEIT strukturell — KEIN DSL-Op trägt pin_world/set_regions_active (kein Skript kann automatisch tragen oder Regionen schalten)",
        res.noPinOp && res.noRegionOp
    );
}

// Φ7 Portal-Hallen: kuratierte Welt-Verzeichnisse als signierte Artefakte (N Welt-Adressen + Label +
// Signatur + Provenance). Materialisiert wird jeder Slot ein eigenes Portal mit entry-level
// portalMeta (_enterPortal: entry → bauplan-portalMeta-Coalesce).
async function checkBandPhi7PortalHalls(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const out = {};

        // (H1) state.portalHalls ist eine Map (initial leer im Boot).
        out.hallMap = r.state.portalHalls instanceof Map;

        // (H2) createPortalHall mit drei gültigen Adressen.
        const mkAddr = (id) => ({
            worldId: `w-${id}`,
            roomId: `r-${id}`,
            broker: "ws://h.example:4313",
            label: `Welt ${id}`,
        });
        const created = r.createPortalHall("test-halle", "Test-Halle", [
            { address: mkAddr("alpha"), label: "Erste Welt" },
            { address: mkAddr("beta"), label: "Zweite Welt" },
            { address: mkAddr("gamma"), label: "Dritte Welt" },
        ]);
        out.createOk = !!(created && created.ok && created.entries === 3);
        out.hallStored = r.state.portalHalls.has("test-halle");

        // (H3) createPortalHall siebt kaputte Einträge (broker non-ws fällt).
        const partial = r.createPortalHall("partial-halle", "Partial", [
            { address: mkAddr("ok") },
            { address: { ...mkAddr("kaputt"), broker: "http://bad" } }, // fällt
            { address: null }, // fällt
        ]);
        const partialHall = r.state.portalHalls.get("partial-halle");
        out.partialOk = !!(partial && partial.ok && partial.entries === 1);
        out.partialStored = partialHall && partialHall.entries.length === 1;

        // (H4) createPortalHall ohne valide Einträge → ok:false.
        const emptyRes = r.createPortalHall("leere", "Leer", []);
        out.emptyRejected = !emptyRes.ok && emptyRes.reason === "no_valid_entries";

        // (H5) _canonicalPortalHall ist deterministisch (gleiche Substanz →
        // gleicher String); v:1 + alle entries-Hash drin.
        const hall1 = r.state.portalHalls.get("test-halle");
        const canon1 = r._canonicalPortalHall(hall1);
        // Mutiere ein Extra-Feld → der Canonical bleibt gleich (must-ignore).
        const hall2 = { ...hall1, xZukunft: { foo: 1 } };
        const canon2 = r._canonicalPortalHall(hall2);
        out.canonDeterministic = canon1 === canon2;
        out.canonHasV1 = /"v":1/.test(canon1);
        out.canonHasEntries = /"entries":/.test(canon1);

        // (H6) signPortalHall signiert + verifyPortalHall liest "valid";
        // Manipulation am label kippt zu "modified" (signedHash mismatch).
        const sigRes = await r.signPortalHall("test-halle", { skipConfirm: true });
        out.signOk = !!(sigRes && sigRes.ok);
        const hall = r.state.portalHalls.get("test-halle");
        out.signFieldsSet = !!(hall.sig && hall.authorPubKey && hall.signedHash);
        const status = await r.verifyPortalHall(hall);
        out.verifyValid = status === "valid";
        const manip = { ...hall, label: "GEÄNDERT" };
        const manipStatus = await r.verifyPortalHall(manip);
        out.verifyModified = manipStatus === "modified" || manipStatus === "forged";

        // (H7) _admitForeignPortalHall siebt strukturell + nimmt valide Hallen
        // an + kaputte Einträge fallen INNERHALB der Halle.
        const admittedClean = r._admitForeignPortalHall({
            name: "fremd-halle",
            label: "Fremde",
            entries: [{ address: mkAddr("foreign1"), label: "Fremde 1" }],
        });
        out.admitOk = !!(admittedClean && admittedClean.name === "fremd-halle" && admittedClean.entries.length === 1);
        const admittedNoName = r._admitForeignPortalHall({ entries: [{ address: mkAddr("x") }] });
        out.admitNoNameNull = admittedNoName === null;
        const admittedNoEntries = r._admitForeignPortalHall({ name: "leer", entries: [] });
        out.admitEmptyNull = admittedNoEntries === null;

        // (H8) R4 — Tainted Herkunft (revoziert) fällt am Eingang.
        const fakeKey = "9".repeat(64);
        r.revokeKey(fakeKey);
        const admittedTainted = r._admitForeignPortalHall({
            name: "tainted-halle",
            entries: [{ address: mkAddr("x") }],
            provenance: [{ by: fakeKey, at: 1700000000000 }],
        });
        out.admitTaintedNull = admittedTainted === null;
        r.state.revokedKeys.delete(fakeKey);
        r._saveRevokedKeys();

        // (H9) materializePortalHall braucht einen Portal-Bauplan + Position.
        // Wir nehmen den ersten Built-In-Portal-Bauplan oder bauen einen ad hoc.
        let portalBp = null;
        for (const bn of Object.keys(r.state.blueprints || {})) {
            const bp = r.state.blueprints[bn];
            if (bp && (bp.role === "portal" || /^portal_/.test(bn))) {
                portalBp = bn;
                break;
            }
        }
        // Falls keiner existiert, einen schnell-anlegen für den Test.
        if (!portalBp) {
            r.state.blueprints["portal_torus"] = {
                name: "portal_torus",
                label: "Test-Portal-Torus",
                builtIn: false,
                parts: [
                    __teil("torus", "stein", 0, 1.5, 0, 2, 2, 0.4, { rotation: { x: 0, y: 0, z: 0 }, opChain: [] }),
                ],
                connections: [],
                portalMeta: {},
            };
            portalBp = "portal_torus";
        }
        const archBefore = r.state.architectures.length;
        const matRes = r.materializePortalHall("test-halle", { x: 600, y: 0, z: 600 }, { portalBlueprint: portalBp });
        out.matOk = !!(matRes && matRes.ok && matRes.spawned.length === 3);
        out.matSpawnedArch = r.state.architectures.length === archBefore + 3;

        // (H10) Jeder gespawnte Slot trägt SEINE eigene entry.portalMeta mit
        // worldAddress + hallName (die echte Φ7-Wahrheit: drei Slot-Portale,
        // drei verschiedene Welten).
        const spawned = r.state.architectures.slice(-3);
        const allHavePortalMeta = spawned.every(
            (e) => e.portalMeta && e.portalMeta.worldAddress && e.portalMeta.hallName === "test-halle"
        );
        const distinctWorlds = new Set(spawned.map((e) => e.portalMeta.worldAddress.worldId));
        out.matEntryMeta = allHavePortalMeta && distinctWorlds.size === 3;

        // (H11) listPortalHalls — UI-/Test-API.
        const list = r.listPortalHalls();
        out.listHasTest = list.some((h) => h.name === "test-halle" && h.entries === 3 && h.signed === true);

        // (H12) Snapshot-Round-Trip: die Hallen reisen + die entry-level
        // portalMeta reist auch (sonst wären alle Slot-Portale nach Reload
        // gleich).
        const snap = r.buildStateSnapshot();
        out.snapHasHalls = Array.isArray(snap.portalHalls) && snap.portalHalls.length >= 2;
        const snapTestHall = snap.portalHalls.find((h) => h.name === "test-halle");
        out.snapHallShape = !!(
            snapTestHall &&
            snapTestHall.entries.length === 3 &&
            snapTestHall.sig &&
            snapTestHall.authorPubKey
        );
        const snapArchWithMeta = snap.architectures.filter((a) => a.portalMeta && a.portalMeta.worldAddress);
        out.snapArchHasPortalMeta = snapArchWithMeta.length === 3;

        // (H14) R2-DISJUNKTHEIT: keine der Φ7-Akte sind DSL-Ops (die Dispatch-Tafel `dslEffects` kennt sie nicht).
        out.noCreateHallOp = !r.dslEffects.create_portal_hall;
        out.noMatHallOp = !r.dslEffects.materialize_portal_hall;

        // Aufräumen: spawned-Portale + Halle aus dem Test.
        for (const e of spawned) {
            if (e.id !== undefined) {
                try {
                    r.removeArchitecture(e.id);
                } catch {
                    /* defensive */
                }
            }
        }
        r.state.portalHalls.delete("test-halle");
        r.state.portalHalls.delete("partial-halle");
        r.state.portalHalls.delete("fremd-halle");
        // Test-Bauplan, wenn von uns erzeugt, lassen wir liegen (kein Müll;
        // andere Tests dürfen ihn finden — _enterPortalToAddress nutzt ihn nicht).

        return out;
    });

    check(
        "Φ7 (H1+H2): state.portalHalls-Map existiert + createPortalHall legt eine Halle mit drei Adressen an",
        res.hallMap && res.createOk && res.hallStored
    );
    check(
        "Φ7 (H3+H4): createPortalHall siebt kaputte Einträge (http-broker → fällt) + lehnt leere Hallen ab",
        res.partialOk && res.partialStored && res.emptyRejected
    );
    check(
        "Φ7 (H5): _canonicalPortalHall deterministisch (extra-Felder ignoriert) + trägt v:1 + entries-Hash",
        res.canonDeterministic && res.canonHasV1 && res.canonHasEntries
    );
    check(
        "Φ7 (H6): signPortalHall signiert (sig+authorPubKey+signedHash) + verifyPortalHall liest 'valid' + Manipulation am label kippt",
        res.signOk && res.signFieldsSet && res.verifyValid && res.verifyModified
    );
    check(
        "Φ7 (H7): _admitForeignPortalHall nimmt gültige Hallen an + verwirft Müll (kein Name → null · keine Einträge → null)",
        res.admitOk && res.admitNoNameNull && res.admitEmptyNull
    );
    check(
        "Φ7 (H8): R4-Wand — eine Halle mit revoziertem Provenance-Glied fällt am Eingang (das Immunsystem deckt Hallen wie Baupläne)",
        res.admitTaintedNull
    );
    check(
        "Φ7 (H9+H10): materializePortalHall spawnt 3 Slot-Portale + jedes trägt SEINE eigene entry.portalMeta mit unterschiedlicher worldAddress (drei Welten, drei Tore)",
        res.matOk && res.matSpawnedArch && res.matEntryMeta
    );
    check("Φ7 (H11): listPortalHalls — UI-API liefert Hallen-Übersicht (name · entries · signed)", res.listHasTest);
    check(
        "Φ7 (H12 — must-preserve): Hallen reisen im Snapshot (Halle-Hülle + Signatur + Adressen) + entry-level portalMeta auch (sonst wären alle Slot-Portale nach Reload identisch — die Halle wäre tot)",
        res.snapHasHalls && res.snapHallShape && res.snapArchHasPortalMeta
    );
    check(
        "Φ7 (H14 — R2-DISJUNKTHEIT): keine Halle-Akte sind DSL-Ops (kein Skript kann automatisch Hallen erstellen oder materialisieren)",
        res.noCreateHallOp && res.noMatHallOp
    );
}

// Φ6 Compute-Spende (Geschenk-Schicht, KEINE Rechen-Währung): (a) Chunk-Beiträge signiert + Hash +
// Stichproben-Verify gegen die LOKAL nachgerechnete Wahrheit (verifizieren ist O(Build), schummeln
// gegen den Hash unmöglich); (b) Playtest-Lauf-Beiträge signiert + Commit + Resultat.
async function checkBandPhi6ComputeSpende(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const out = {};

        // (K1) Daten-Modelle existieren (Map + Array, initial leer).
        out.contribMap = r.state.computeContributions instanceof Map;
        out.runArray = Array.isArray(r.state.playtestContributions);

        // (K2) Input-Hash ist deterministisch + ändert sich mit cx/cz/lod.
        const spec1 = { kind: "chunk-density", worldSeed: "test-seed", cx: 0, cz: 0, lod: 0 };
        const spec2 = { kind: "chunk-density", worldSeed: "test-seed", cx: 0, cz: 0, lod: 0 };
        const spec3 = { kind: "chunk-density", worldSeed: "test-seed", cx: 1, cz: 0, lod: 0 };
        const h1 = r._computeJobInputHash(spec1);
        const h2 = r._computeJobInputHash(spec2);
        const h3 = r._computeJobInputHash(spec3);
        out.hashDeterministic = h1 && h1 === h2;
        out.hashChanges = h1 !== h3;

        // (K3) Output-Hash funktioniert auf einem echten Chunk-Build (das ist
        // die ECHTE Verify-Asymmetrie — der Hash ist O(Vertex), die Substanz
        // ist O(Welt × Build); bit-stabile Position-Hashes).
        const result = r._buildVoxelChunkData(2, 2, 0);
        const outputHash = r._computeChunkOutputHash(result);
        out.outputHashOk = typeof outputHash === "string" && outputHash.length === 8;
        // Bit-Stabilität: derselbe Build muss denselben Hash geben.
        const result2 = r._buildVoxelChunkData(2, 2, 0);
        const outputHash2 = r._computeChunkOutputHash(result2);
        out.outputHashStable = outputHash === outputHash2;
        // Aufräumen (Mesh-Heap nicht aufblasen).
        try {
            if (result && result.mesh && result.mesh.geometry) result.mesh.geometry.dispose();
            if (result2 && result2.mesh && result2.mesh.geometry) result2.mesh.geometry.dispose();
        } catch {
            /* defensive */
        }

        // (K4) Signieren + Verifizieren einer Compute-Contribution (ed25519).
        const sigRes = await r.signComputeContribution(h1, outputHash, { skipConfirm: true });
        out.signOk = !!(sigRes && sigRes.ok && sigRes.sig);

        // (K5) Pin-Pfad: eine valide Contribution wird angenommen + Status
        // ist "unverified" (Sig okay, aber noch nicht stichproben-verifiziert).
        const pinRes = await r.pinComputeContribution({
            inputHash: h1,
            outputHash,
            providedBy: sigRes.authorPubKey,
            sig: sigRes.sig,
        });
        out.pinOk = !!(pinRes && pinRes.ok && pinRes.status === "unverified");
        out.pinInMap = r.state.computeContributions.has(h1);

        // (K6) Müll fällt am Eingang (kaputter Hash, Hex-Form verletzt).
        const badPin = await r.pinComputeContribution({ inputHash: "X!?", outputHash: "Y!?" });
        out.badRejected = !badPin.ok && badPin.reason === "invalid";

        // (K7) STICHPROBEN-VERIFY — die echte Wand: der Spec wird lokal über den ECHTEN buildVoxelChunkData
        // nachgerechnet, der Hash verglichen → "verified" wenn gleich.
        const verifySpec = { kind: "chunk-density", worldSeed: "test-seed", cx: 2, cz: 2, lod: 0 };
        const verifyHash = r._computeJobInputHash(verifySpec);
        // Pin mit dem LOKAL korrekten outputHash (das ist der „ehrliche Spender"-Fall).
        await r.pinComputeContribution({
            inputHash: verifyHash,
            outputHash, // der oben berechnete Hash für (2,2,0)
            providedBy: sigRes.authorPubKey,
            sig: null, // sig optional für diesen Test (Sieb akzeptiert null)
        });
        const entry = r.state.computeContributions.get(verifyHash);
        const verifyRes = r.verifyComputeContribution(verifySpec, entry);
        out.verifyEhrlich = !!(verifyRes && verifyRes.ok && verifyRes.equal && entry.status === "verified");

        // (K8) FORGED-Wand: ein falscher outputHash → status forged + R4-
        // Eskalation (der Anbieter wird revoziert).
        const forgedSpec = { kind: "chunk-density", worldSeed: "test-seed", cx: 5, cz: 5, lod: 0 };
        const forgedHash = r._computeJobInputHash(forgedSpec);
        const fakeKey = "a".repeat(64);
        const revBefore = r.state.revokedKeys.size;
        await r.pinComputeContribution({
            inputHash: forgedHash,
            outputHash: "deadbeef", // falscher Hash
            providedBy: fakeKey,
            sig: null,
        });
        const forgedEntry = r.state.computeContributions.get(forgedHash);
        const forgedVerify = r.verifyComputeContribution(forgedSpec, forgedEntry);
        out.verifyForged = forgedVerify.equal === false && forgedEntry.status === "forged";
        out.revokedSchummler = r.state.revokedKeys.has(fakeKey) && r.state.revokedKeys.size === revBefore + 1;
        r.state.revokedKeys.delete(fakeKey);
        r._saveRevokedKeys();

        // (K9) PLAYTEST-Lauf signieren + recordPlaytestRun ehrlicher Pfad.
        const runRes = await r.signPlaytestRun(
            { commit: "abc12345", version: "18.191.0", result: "ok", total: 3500 },
            { skipConfirm: true }
        );
        out.runSignOk = !!(runRes && runRes.ok && runRes.run.sig);
        const recordRes = await r.recordPlaytestRun(runRes.run);
        out.recordOk = !!(recordRes && recordRes.ok);
        out.recordInArray = r.state.playtestContributions.some((e) => e.commit === "abc12345");

        // (K10) DEDUP: derselbe Anbieter darf denselben Commit nur einmal
        // bürgen (Update, kein Doppel-Eintrag).
        const beforeLen = r.state.playtestContributions.length;
        await r.recordPlaytestRun(runRes.run);
        out.dedupOk = r.state.playtestContributions.length === beforeLen;

        // (K11) FORGED Sig fällt: ein Lauf mit kaputtem Sig wird verworfen.
        const badRun = {
            commit: "xyz98765",
            version: "18.0",
            result: "ok",
            total: 100,
            providedBy: "b".repeat(64),
            sig: "deadbeef",
            signedAt: Date.now(),
        };
        const badRecord = await r.recordPlaytestRun(badRun);
        out.badRunRejected = !badRecord.ok;

        // (K12) listPlaytestContributions Aggregat + Snapshot-Round-Trip.
        const list = r.listPlaytestContributions("abc12345");
        out.listOk = list.length === 1 && list[0].providedBy === runRes.run.providedBy;
        const snap = r.buildStateSnapshot();
        out.snapHasContribs = Array.isArray(snap.computeContributions) && snap.computeContributions.length >= 1;
        out.snapHasRuns = Array.isArray(snap.playtestContributions) && snap.playtestContributions.length >= 1;

        // (K13) R2-DISJUNKTHEIT: keine Φ6-Akte sind DSL-Ops (die Dispatch-Tafel `dslEffects` kennt sie nicht).
        out.noPinComputeOp = !r.dslEffects.pin_compute;
        out.noSignPlaytestOp = !r.dslEffects.sign_playtest;

        // Aufräumen: die Test-Einträge.
        r.state.computeContributions.delete(h1);
        r.state.computeContributions.delete(verifyHash);
        r.state.computeContributions.delete(forgedHash);
        r.state.playtestContributions = r.state.playtestContributions.filter(
            (e) => e.commit !== "abc12345" && e.commit !== "xyz98765"
        );

        return out;
    });

    check(
        "Φ6 (K1): Daten-Modelle leben — computeContributions: Map, playtestContributions: Array",
        res.contribMap && res.runArray
    );
    check(
        "Φ6 (K2): _computeJobInputHash deterministisch (gleicher Spec → gleicher Hash) + ändert sich mit cx/cz/lod",
        res.hashDeterministic && res.hashChanges
    );
    check(
        "Φ6 (K3): _computeChunkOutputHash funktioniert auf einem echten Chunk-Build + ist bit-stabil (das Verify-Asymmetrie-Fundament — derselbe Build → derselbe Hash)",
        res.outputHashOk && res.outputHashStable
    );
    check("Φ6 (K4): signComputeContribution signiert über sign_manifest (SOUVERÄNE Geste, ed25519)", res.signOk);
    check(
        "Φ6 (K5): pinComputeContribution nimmt valide Spende an (status=unverified bis zur Stichprobe) + speichert in Map",
        res.pinOk && res.pinInMap
    );
    check(
        "Φ6 (K6): _admitForeignComputeContribution siebt Müll (kaputte Hex-Hashes fallen am Eingang)",
        res.badRejected
    );
    check(
        "Φ6 (K7): STICHPROBEN-VERIFY — ehrlicher Spender: lokal nachgerechneter Hash = gespendeter Hash → status=verified",
        res.verifyEhrlich
    );
    check(
        "Φ6 (K8): FORGED-WAND — falscher Hash → status=forged + R4-Eskalation (Anbieter revoziert, Schummler fällt für alles weitere)",
        res.verifyForged && res.revokedSchummler
    );
    check(
        "Φ6 (K9): signPlaytestRun signiert + recordPlaytestRun nimmt ehrlich an (Sig-Verify am Eingang)",
        res.runSignOk && res.recordOk && res.recordInArray
    );
    check("Φ6 (K10): DEDUP — derselbe Anbieter + Commit → Update, kein Doppel-Eintrag (Cap-Schutz)", res.dedupOk);
    check(
        "Φ6 (K11): FORGED Playtest-Sig fällt am Eingang (recordPlaytestRun verifiziert die Sig vor dem Speichern)",
        res.badRunRejected
    );
    check(
        "Φ6 (K12 — must-preserve): listPlaytestContributions Aggregat + Snapshot trägt BEIDE Pools mit (computeContributions + playtestContributions)",
        res.listOk && res.snapHasContribs && res.snapHasRuns
    );
    check(
        "Φ6 (K13 — R2-DISJUNKTHEIT): KEINE Φ6-Akte sind DSL-Ops (kein Skript kann automatisch pinnen/signieren — Anti-Scope §3: Geschenk-Schicht, keine Rechen-Währung)",
        res.noPinComputeOp && res.noSignPlaytestOp
    );
}

module.exports = {
    checkBandW13W14VibePassLibrary,
    checkBandG8R0Sovereign,
    checkBandG8R4Immunity,
    checkBandG8R5LivingImmune,
    checkBandTailleOmega3,
    checkBandTailleGolden,
    checkBandPhiArchipel,
    checkBandPhiArchipelV2,
    checkBandPhi7PortalHalls,
    checkBandPhi6ComputeSpende,
};
