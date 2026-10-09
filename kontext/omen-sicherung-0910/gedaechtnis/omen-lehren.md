---
name: omen-lehren
description: Measurement lessons learned on the OMEN for AnazhRealm werkbank runs (pitfalls that faked or broke numbers)
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7a635cf9-e03c-4e66-8fea-b1e3ea8e7c95
  modified: 2026-10-08T16:34:16.860Z
---

Lessons from the 2026-10-06/07 series. Each one once faked or broke a number.

- **`band` overflowed the timestamp pool** (states before V18.533): lauf gpuMs after band in the same boot were invalid. Fixed in V18.533 (STEMPEL-POOL GRUEN). For old states, run band last.
- **lauf reset the weather** (lauf calls `__buehne()` itself). Since V18.533 the weather guard exists; still check `wetterHalt`. In V18.534 rain still appeared once with the clock frozen.
- **The auto-village depended on the frame rate.** Always set `window.__anazhAutoSettlement = false` before umstellen.
- **The 25 ms "cap" is the 120 Hz VSync grid** (8.33 ms steps: 16.7 / 25.0 / 33.3). It is not a code limit.
- **`umstellen --ort <id>` exists only from V18.534.** Older states: `-900 -850` + yaw 0.
- **Pascal pass timestamps see only ~17–28 % of fragment work.** Trust gpu-bank / zerlegen, never pass stamps, for GPU time.
- **Run order matters within one boot** (world state, animals, regulator hysteresis): always use fresh boots per side, ABAB.
- **Animals vary a lot between boots.** Always report them (zaehlen class tier) and give medians with and without outliers.
- **zerlegen on f2361bb1-based states crashed on the `post` switch** (weak map key). Measure without post, then probe post separately.

- **The old weather guard (werkbank ≤ V18.534) was blind to rain mid-run**: it compared only word and clock before and after a lauf. Nexus could turn sunny → rainy and a world rule back to sunny inside one lauf, and the guard still said GRUEN (seen 07.10. in 7A, attempt 1). Earlier series on states ≤ V18.534 may hide rain phases. Rain cost +7 ms CPU-Takt p50 under voll (1A, attempt 1). States without the halt at `_setWeather` rained in 2 of 6 A attempts; the wave K weather spy (`__wetterBuch`) catches it by name.
- **The world comes from a fresh browser profile per werkbank start**; the save-server's `anazhRealmState.json` is only a backup the game writes and is not read at boot. A and B worlds are comparable without touching it.
- **The profile keys carry line numbers** (`anazhRealm.js:30978`). Compare A and B by function name only, because inserted lines shift them.

- **This machine checks out with CRLF** (system gitconfig `core.autocrlf=true`). Vendor fingerprints (gate:vendor-anker) and every byte-based gate then fail locally. `git config --worktree` has no effect (repositoryformatversion 0). For a workplace worktree, rewrite every unchanged file with LF: delete it, then `git checkout -- <file>`. Plain `checkout` and `checkout-index -f` skip files they consider up to date.
- **`npm run playtest` starts its own save-server on 4312.** Do not start one there first, or it fails after 5 s with "Save-Server startete nicht".
- **`werkbank bild --datei` resolves relative to the werkbank process cwd** (its worktree). Pass absolute Windows paths.

- **Never edit a worktree whose save-server feeds a running series.** Every boot loads the files from disk, so an edit becomes the measured side. The side guard (served hash) would abort the series. Develop in a patch file or a second worktree until the series ends (07.10.: caught within one A boot).

- **Decide a depth or shader question in ONE world, not across boots.** Across boots the water at ufer-nord drifts with clouds and streamed reeds (MSSIM 0.966–0.976 against a floor of 0.988), which looks like a regression. Swap the source live instead (`r._szeneTiefeKnoten`/`_szeneTiefeWert` + `_tiefenLeserNeuBinden()`, p2/ab-welt.sh), ABAB, frozen clocks. Run `band` first: without it the world is still streaming (18 dc / 67k triangles instead of 28 / 172k).
- **Luma-only MSSIM misses hue shifts.** The cyan pool (99/131/116 → 114/166/147) passed 2 of 4 luma pairs. `p2/vergleich.cjs` now counts 16×16 hue blocks (Δ(R−G, B−G) > 6); that column caught 4 of 4.
- **TSL: a node on an r32float color texture returns vec4.** A depth carried as color must be handed on as `.x`, otherwise every downstream expression promotes to vec4 (Beer-Lambert counted the 4th component). `QuadMesh` is not on the page's global THREE; use your own Scene + OrthographicCamera + Mesh(PlaneGeometry(2,2)).
- **The hydro water material draws BackSide** (iso winding points inward). A stage plane in a gate needs its front face DOWN (`rotateX(+π/2)`), otherwise it is drawn and culled. gate:post-kette's water never showed a pixel until 07.10.
- **Census, band and werkbank MB are MiB** (/1048576). 1920×1080×4 B = 7.91 MB.
- **Wall traps in the stem:** a new WebGPU global (e.g. `GPUCommandEncoder`) must go into eslint.config.mjs globals; gate:profiband H3 wants every `new THREE.*Texture(` assigned to a named variable with `.name` nearby, not inside an object literal.

- **TaskStop on a background Bash only kills the wrapper** (Git Bash on Windows). The child `bash script.sh` keeps running and appends to the same log, so two wall runs overlap (07.10.: the old run started the full playtest beside the new run's check). After TaskStop, list `Win32_Process` for the script name and kill the old tree by CreationDate.

- **Unauthenticated GitHub API = 60 calls per hour** (gh is not installed here; `p3/ci.sh` reads runs via curl). A watcher that polls two runs every 60 s empties the quota in 30 min and then reads `undefined` and exits early. Use `p3/ci-warte.sh <run-ids>`: 4-minute rhythm, sleeps until the reset when fewer than 6 calls remain.
- **Stage-local trial merges:** to name only MY conflicts against a follow-up branch, merge integ-l + the follow-up in a throwaway worktree first, commit that (markers included), then merge my branch on top. `git merge-tree <base> A B` over-reports (it counts the follow-up's own drift as conflicts).
- **Headless probes that put an animal in a scene must still its brain** (the steering law picks flight or wander with Math.random): `Object.create(A._steuerGesetz())` with a `steuerSchritt` that sets `v = 0`, installed on the class and restored afterwards. A probe that holds an animal in place must also hold its push velocity (`userData._stossV = null`).
- **carPhys mass in vehicle-core is a hull volume in m³**, not kg (GT ≈ 9.6). Multiply by a density (STOSS.dichteWagen 150 kg/m³ → GT ≈ 1.4 t) before any momentum math.
- **In headless (null renderer) the game loop does not tick by itself.** Probes drive `r._gameLoopTick(t)` manually; to see boot-order bugs that need the ring to stand before the book, hold back `_foundryIngestBook` (gate:streu-fern H).

- **Image A/B of one object (e.g. the LOD mask on the own car) must isolate the object:** a mask toggle changes every stamped plant in the frame, and ground jitter beats a 24-level threshold. Hide every other mesh with an `aLodLevel` attribute plus the Nah-Wiese group, take the background per mask state, and count only inside the projected hull box (`blockerAABBs`: minX/maxX/minZ/maxZ/botY/topY). The mounted car is instanced (`e.instSlots`; hide with a zero matrix), not `e.mesh`. The capture already warms TRAA with 32 frames. Tool: p3/geist.cjs (0710-2: head 0.2–1.9 %, old stamp 1 77 % at 10 m).

- **Lockstep: everything the fixed sim step reads must be written in the fixed step.** 0710-5 found two hidden frame-cadence readers with a per-step trace lens: it records the state after each `_stepFixedSim` at 60 fps and at mixed frames, then names the first differing step and quantity. Culprit 1: a mass used `getWorldScale`, but the render matrix carries the frame-smoothed slope pitch, so the mass must come from the chain of local scales. Culprit 2: the y of a gliding body was set by the frame tick. Gates that once drove pushed bodies through `updateCreatures(1/60)` must also call the sim-step part (`_kreaturStossSchritt` + `_leibKontakte`).
- **A tunnel lens needs the real mechanism.** One push impulse against a thin wall stops at the wall, so the lens stays blind. A car push is continuous: re-apply the push speed every frame for 45 frames. Then the base shows 9/10 at 30 fps.
- **Probe spawns fail silently at the creature cap.** Raise `st.maxCreatures` first. Use a fixed `bodySize: 1`, because random sizes made L5 vary.
- **git here is 2.30**, which has no `merge-tree --write-tree`. Trial merges go through throwaway worktrees.

- **Look at the image of every geometric cut.** In 0710-4 the rider lens was green (head, thighs, anchor, gaze), yet the image showed the shoes hanging under the car. The lens must measure containment: every skin vertex against the hull, plus rays against the drawn skin (instanced leaves filtered by the entry's slots).
- **Werkbank `/bild` hides the player mesh** (`playerMesh.visible = false`). To show a rider, `scene.attach` the rig's top child for the shot and attach it back afterwards.
- **Frame-sampled velocity hides impulses.** If the gait re-accelerates within the same frame, a frame-level "after contact" speed never shows the bounce. Measure inside the impulse call (`_stossPaar` wrapper), relative to the partner's velocity.
- **`fahr-leben` varies from run to run** with world state: the gait cadence follows emotion (0.81–1.44 m/s, once 6.94), and creatures spawn near the player during the probes. Run a new lens at least 3 times before trusting it, and hold the spawner inside lockstep probes.
- **The full playtest is not in per-push CI** (CI runs playtest:fast and the gates; the full run is nightly or manual). Run `npm run playtest` locally on every commit; A3e3 stayed red for two commits because only fast was run.
- **CI playtest job: 45-min cap.** On welle-m-impuls it ends around step 75. Local runs of the remaining steps are the proof.

- **A Nexus village turns the measuring view.** `spawn_village` (autonomous) → `spawnSettlement` → `_nachDorfOrientieren` sets `state.yaw` toward the houses mid-run. The ORT guard catches it (0710-6, 4B: yaw −2.745); discard and repeat. On states ≤ V18.535 the stage holds only the weather. From welle-m-nexus on (0710-7), `dslEval` holds every DSL world act under the stage (`_messHalt`), and the WELTAKT guard names it. A states are "blind" there.
- **Self-time names the victim, inclusive time names the caller.** `_segmentAABB` was the top self-time entry (8.9 %). The inclusive list showed `_loopCamera → _ceilingHeadroom` at 20 %: one 4.5 m ray per frame against 22 758 boxes. Count calls per frame and work per call before cutting.
- **A perf cut on a query proves byte-sameness against the old loop as an oracle inside the gate.** Ties need an order rule (the order of the list, then the box). A solver that moves the body during its loop can still use a neighbourhood: process candidates in list order, and re-query after each push for entries behind the cursor.
- **A merge checks out conflicted files with CRLF** (autocrlf). Normalize to LF before any exact-text patch script, otherwise no anchor matches.
- **A red full playtest after a merge: run the same playtest on the merged-in branch alone first.** Identical red lists mean the failure is not mine; `git bisect run` with the error text as criterion then names the commit (0710-8: 74f3a2c0, both parents good).
- **Count conflict braces from both sides.** The HEAD side of a conflict hunk can already contain a closing brace that looks shared.
- **`werkbank methode` swaps the method on the prototype.** An instance wrapper from a counter (`r._fieldRaycast = …`) shadows the swap. Delete instance wrappers before an ABBA swap.
- **Hitches per boot need their own werkbank session**, because the folge has no `haenger` step: after the folge, start a fresh werkbank at the same side, then dorf-aus, fenster, wiese, buehne, `haenger 30 --ein 20 --regler voll --tiere frei --json`. Template: abab535/serie.sh.
- **Band-table parsing: a zero has no "k"** (`0/60k`). A regex that requires `\d+k` silently grabs a later number. Anchor the regex to the row (`^\s*tier\*`, `k?`). Also: B's animals sat less often in the view cone (2 vs 9), so always compare animal-free boots as well.

- **A temporary `git checkout HEAD -- <file>` in an LF worktree writes CRLF** (system autocrlf), for example for a "before RED" run of a gate. Use `git -c core.autocrlf=false checkout`, or `git show HEAD:<file> > <file>`, and check afterwards with `grep -c $'\r'`.
- **A cut loop can leave the cost in place.** In 0710-10 the boost resonance loop was cut, but `tickPlayerBoosts` did not move (0.19 ms, peak 10–13 ms). The cost was `computeSpatialTags` (O(parts²), no memo) per nearby entry. Count calls and ms per call inside the method before claiming a gain.
- **render-EWMA rises when the CPU tick shrinks** (0710-9 +0.31, 0710-10 +0.41 ms), while gpu-bank, frame p50 and band stay the same. It likely carries the wait for the swap chain. Report it, but do not read it as GPU cost.

- **`st.playerMesh` is replaced during a probe** (the avatar rebuilds). A probe that keeps `const pm = st.playerMesh` moves a dead object, and every player-position check silently tests the old place (0710-11 door lens). Read `st.playerMesh` per call.
- **Headless spawns carry blockers over the whole body** (3–16 m reach for scaled trees). In the real game studio trees block only at the trunk. A neighbourhood lens that needs a small reach must set a trunk box and stamp it through `_blockerStampReach`.
- **Proxies on game objects poison the JIT for later timing.** Measure timings before any proxy-based lens in the same page.
- **A memo should key on content, not on writers,** when the writers cannot be proven complete. Prove instead that the key reads every input: a Proxy records the reads of the computation and of the key (0710-11 raum-tags: 25/25 paths).
- **Windows `% Prozessorleistung` cannot show the main-thread core state** (it averages all cores per second). Use a fixed in-page reference workload as a tachometer. The page's `performance.now()` resolves only 0.1 ms (no cross-origin isolation); averages over ~1 400 frames still hold.
- **Localized counters:** on this de-CH machine typeperf needs German paths (`\Prozessorinformationen(_Total)\% Prozessorleistung`).

**Why:** each of these produced wrong conclusions until isolated.

**How to apply:** check these before trusting any new series; mention deviations in the report.
