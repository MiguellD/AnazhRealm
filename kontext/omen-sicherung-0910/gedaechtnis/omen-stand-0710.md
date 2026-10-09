---
name: omen-stand-0710
description: "State of the OMEN measurement station as of 2026-10-07 (clone, worktrees, reports, number history, open findings, next job)"
metadata:
  node_type: memory
  type: project
  originSessionId: 7a635cf9-e03c-4e66-8fea-b1e3ea8e7c95
  modified: 2026-10-09T14:34:01.031Z
---

As of 2026-10-07 ~10:10.

**Folder:** `C:\Users\micha\Desktop\AnazhRealm-OMEN`. Measurement clone `AnazhRealm-mess` (on 2b60988b; reports `messung-omen-*.md` live there, uncommitted).

**Worktrees** (sibling folders):
| Worktree | Commit | Note |
|---|---|---|
| mess-a | 2b60988b | V18.531 |
| mess-b | 251f2f72 | final kandidat-v18532 |
| mess-c | 516e704a | integ-probe, ≈ V18.533 |
| mess-v533 | 2f237817 | main V18.533 |
| mess-d | 78d66a63 | V18.534 |
| AnazhRealm-kand | cf9a07ba | |
| AnazhRealm-kandz | f2361bb1 | kandidat-zerlegen |
| AnazhRealm-csicht | 44f41dcf | welle-c-sicht |
| AnazhRealm-zerlegen | 7ff4b81a | werkzeug-zerlegen |
| AnazhRealm-gboden | d812a15e | |
| AnazhRealm-gfeldpass | fd383b38 | |
| AnazhRealm-gpost | 24c955cc | |

**Raw data:** abba, aufloesung, profilBA, abab, csicht, zerlegen, zerlegen-kand, welle-g2, ab532, trenn532, ab533, ab534 (each with JSON/txt per boot; ab533/ab534 also have `zusammen.json`).

**Number history (medians, GTX 1060, 1080p):**
- V18.531 → V18.533: gpu-bank 24.85 → 14.70 ms; frame p50 under Regler frei 25.0 → 16.8 ms.
- V18.533 → V18.534, Regler voll: frame p50 25.0 → 20.8 ms (16.7 in boots with few animals); CPU-Takt p50 22.3 → 13.5 ms; render EWMA 11.1 → 4.7 ms.
- Halo margins cost +6–16 % triangles but no measurable GPU time.
- The next CPU lever is the creature AI (`_fieldRaycast`); the next GPU lever is the trees (`baum`, 3.5–6.4 ms depending on the scene).

**Open findings (handled by wave K):**
- Single-frame hitches of 0.4–1.7 s.
- WETTER-WACHE red in boot 2B of the V18.534 series: rain with the weather clock frozen.

**Next job:** candidate V18.535 (wave L + K) against main, or V18.534 after its CI fix. Nothing is running here; there are no subagents.
- 2026-10-07 ~11:30: the coordinator (Radeon PC, then called "Remote control [56a731]") confirmed the plan. Its four strands are running again: integrator V18.534-CI, wave L integration, wasser, wave K. The order comes once V18.534 is green or V18.535 is ready: OMEN ABAB against main, ≥4 boots per side. The OMEN rests until then.
- Order details agreed: A = main (2f237817 V18.533 today; moves to V18.534 after green CI), B = V18.535 (built on integ-probe after waves K + L). No new run for V18.534 on its own; it was already measured. The full SHA for each side comes by message, and the OMEN creates the worktrees itself (git fetch + worktree add). `scripts/omen-messfolge.cjs` comes only with V18.535 (wave K family "mess-wahrheit"). If it is in B, read it fully and use it; otherwise run the agreed sequence.
- **Order 0710-1** (file `auftrag/0710-1-omen-mess-und-werkplatz.md` on branch `koordination`). **P1 is reported**: commit 758354e8, `bericht/0710-1-p1-messfolge.md`, raw data in `Desktop\AnazhRealm-OMEN\messfolge0710`. A = mess-d 78d66a63 (game bytes of 6f1aa252), B = new worktree `mess-kmw` 9f50dc1d. 8/8 green. Time is equal: gpu-bank 15.0 / 13.5 ms (yaw 0 / −0.88), band GPU 16.9 ms, frame p50 16.7–16.8 ms. VRAM 149.4 MB against the 118 MB band; the screen targets alone are 71.1 MB, cascades 24 MB. **P2 HOST-VRAM** (workplace, branch `host-vram` from 6f1aa252, ports 7900–7909) started after that.
- New worktrees: `koordination` (branch koordination, the order/report channel), `mess-kmw`, and `host-vram` (branch host-vram, the P2 workplace, base 6f1aa252). Working files for P2 live in `Desktop\AnazhRealm-OMEN\p2` (boot.sh, bilder.sh, vergleich.cjs, diffbild.cjs, waende.sh, abab-p2.sh, the images and the census JSONs).
- **0710-3 reported (2026-10-07 ~20:20):** the coordinator's review of 884111fc found one red point (the abbild read via screenUV picks the neighbour block on odd canvases). Fix + gate:post-kette (f) on 321×241, the prior-depth draw as a raw pass, the encoder hook installed once → host-vram head **520e941d** (pushed). Report `bericht/0710-3-host-vram-nachbesserung.md` (koordination d542f5ae). A trial merge against integ-probe 7df27bef is clean except check.yml + the package.json `check` line (keep both). CI 37664758294 was pending at report time.
- **09.10. (account switch, session 60cfd55d):** order **0910-S** (secure the OMEN). The old session a67cd5fb hit the weekly limit on 08.10./09.10. while writing the handover. It had pushed welle-m-schatten **bf01c035** (WIP "Zwischenstand-Sicherung … UNGEPRUEFT": only scripts/diag-schatten-bias.cjs, the law is NOT in anazhRealm.js yet) and copied 342 files (41 MB) to `koordination/kontext/omen-sicherung-0910/` via `p3/sicherung-kopieren.sh`. The new session wrote the memory copies, UEBERGABE-OMEN-0910.md and `bericht/0910-omen-sicherung.md`. All 30 worktrees are on origin; no `sicherung/` branch was needed (no detached worktree had changes).
  - Line on 09.10.: main = integ-probe = 76c9624d (V18.536); welle-m-boosts cce9da43 and welle-m-brennglas 3da7e286 are being integrated into **V18.537**.
  - Announced: the measurement order V18.537 vs main (ABABABAB, 4 boots per side, template 0710-9) has priority as soon as the integrator pushes the candidate.
  - 0710-12 law design (decided, not built): normalBias = factor × max(texel) per cascade in `_kaskadeFit`; the factor comes from `atmosphere.shadowBias`; `setShadowBias` stores the factor; the main-light fallback uses 2·shRange/mapSize. Known probe faults: the sky regen after the sun change spoils LEER, the bush is only an impostor, the player is hidden in ego view (`setCameraMode("third")`), acne noise, the teeth need depth bias 0.
- **0710-11 REPORTED (2026-10-08 ~18:40): boosts, render-EWMA, house door.** Branch/worktree **welle-m-boosts** on welle-m-brennglas.
  - Commits: 63b62cf5 (`computeSpatialTags` memo, content key `_raumTagSchluessel`, gate:raum-tags), 80bde1e3 (`#ladeschirm[hidden]`, messfolge label "render-Wanduhr"), 34ccaeba (review fixes: far target, mover, binding source wall, gate:takt T1/T2), **cce9da43** (`_tickHausTueren` `> 1` + `_blockerUmPlatz`, lens (H)). CI green.
  - Numbers: boost tick 8.4/8.9 → 0.17 ms, peak 11–15 → 0.4 ms. ABABABAB vs V18.536 (data `abab0710-11`, B worktree **abab-boosts** cce9da43): CPU p95 voll 7.3 → 6.0, frei 7.2 → 5.6 ms.
  - render-EWMA cause: the lingering loading screen (real, cut) plus the CPU power state (accounting: the same reference loop runs 12–15 % faster under load).
  - Report koordination **0dd8d2e4**; message sent (unconfirmed).
  - Open: `_loopAutoSave` is the next takt spike at the Wiese (11.9 ms).
  - Next: order **0710-12** (shadow bias; `auftrag/0710-12-omen-schatten-bias.md`, branch welle-m-schatten from main).
- **0710-10 REPORTED (2026-10-08 ~16:20): Brennglas tick and its class over the neighbourhood.**
  - Branch/worktree **welle-m-brennglas**, head **3da7e286** (base main 76c9624d), pushed, CI green 5/5.
  - The cut: a Verzeichnis per name in `_blockerNetz` (`_blockerMit`: affordance keys and "rauch"); the Brennglas tick uses platz cells around the glasses plus the `warm` set; the class (radiating, balancing, lifting, portal/`_findNearestAffordanceEntry`, Dorf-Rauch, boost resonance, Lofi pad) no longer loops over `state.architectures`.
  - Gate: `gate:brennglas-takt` (CI group 2), with the old tick as oracle over a day; on main it is red.
  - Numbers: entries per Brennglas tick 1 578 → 1. ABABABAB vs V18.536 (data `Desktop\AnazhRealm-OMEN\abab0710-10`, B worktree **abab-glas** 3da7e286 with node_modules junction): CPU p50 voll 4.6 → 3.9 ms, frei 4.3 → 3.5 ms; GPU, band and hitches equal.
  - Report on koordination **dd73ac86**; message sent to the coordinator (delivery unconfirmed).
  - Open, proposed as the next order: `computeSpatialTags` has no memo (Wiese: 10 calls per second, 8.3 ms, peak 10.3 ms). Also open: render-EWMA +0.41 ms on B without more GPU work.
  - Tools: `p3/abba-glas.sh`, `p3/glas-ziele.js`, `p3/raum-zaehler.js`, `p3/raum-mess.sh`, `p3/waende-0710-10.sh`, `p3/serie-0710-10.sh`, `p3/auswertung-0710-10.cjs`.
  - Resting.
- **0710-9 REPORTED (2026-10-08 ~14:20): V18.536 ABAB.**
  - Sides: A = main c966b9c3 (worktree abab-b535); B = integ-probe 76c9624d (new worktree **abab-b536**, node_modules junction → welle-m-nexus).
  - Data: `Desktop\AnazhRealm-OMEN\abab536`. Scripts: `p3/serie-0710-9.sh` (blind rule for A + hänger + zerlegen/band genesis) and `p3/auswertung-0710-9.cjs`.
  - Verdict: B is not slower. Medians A → B:

    | | A | B |
    |---|---|---|
    | CPU voll p50/p95 | 6.3/9.3 | 4.7/7.0 |
    | CPU frei p50/p95 | 6.3/9.6 | 4.3/6.6 |
    | frame p95 voll | 25.0 | 20.9 |
    | hitches | 2 | 0 |
    | `_loopCamera` share of CPU | 20.4 % | 1.5 % |

    GPU equal.
  - Finding: `_tickFocusingAffordances` ×2.7 (138 → 376 ms per 14.5 s). The Brennglas tick since 773ed3a2 iterates the whole Bestand; candidate fix is the platz neighbourhood.
  - Report on koordination 46177a01. Resting.
- **0710-8 REPORTED (2026-10-08 ~11:00):** welle-m-nexus head **dc877d19**, which merges origin/integ-probe af3ff253. The report is on koordination **9679298f**.
  - Commits:
    - e062eb8b: fernwald lens wake.
    - cef16f72: creature body near-list via platz cells + `_blockerBewegt`.
    - 969aaad6: `SPIELER_QUELLEN`.
    - 4b97d1d4: monotonic `frage` + marker probe.
    - a0d53ab2: AST box wall + `--selftest`.
  - Merge: intent = `verlangt` only; the village center comes from the placed houses (`res.haeuser`); `durchPflanzen` lives in the net loop; the solver unifies `eigen`/`quelle`/`quellen`; the churn lens uses `_messHalt`.
  - CI a0d53ab2 green; dc877d19 was pending at report time.
  - Found: the full playtest is red on integ-probe itself (22 invariants). Bisect points to merge 74f3a2c0. The playtest stub `phantomMesh: {position}` hits `_disposeSoulGroup` (`group.traverse`). With a real THREE.Group stub it is locally green.
  - Coordinator's answer: the integrator sets the stub line on integ-probe (not in welle-m-nexus). New rule for the integrator: a full playtest after every merge.
  - Next: round 2 of the cross-check on dc877d19, then the branch becomes a stage in V18.536. **The OMEN rests until the V18.536 ABAB order.**
- **0710-7 REPORTED (2026-10-08 ~09:05):** report on koordination **1952e2cb** (`bericht/0710-7-nexus-dorf-segmentaabb.md` + `bericht/0710-7/`); message sent to the coordinator's bridge (delivery unconfirmed).
  - ABABABAB vs V18.535 (raw data `abab0710-7`): 8/8 green in the first attempt. CPU p50/p95 voll 6.4/9.3 → 4.5/6.7 ms, frame p95 voll 25.0 → 16.9, fps 55.8 → 64.0; `_loopCamera` 20.0 → 1.6 % inclusive. GPU equal: the spread is on A, and 5A equals B.
  - CI 91c44f0f: group 3, step 40 gate:fernwald red after 28 s. Locally it is 4/4 green, and the 21 skipped steps pass locally (`p3/waende-g3rest.sh`). The job log needs admin rights, so I asked the coordinator to read the culprit and rerun.
  - Open: the creature body (`_kreaturHuellenKontakt`) still builds its near-list from the whole Bestand.
  - Resting.

  Earlier state of 0710-7: order `auftrag/0710-7-omen-nexus-dorf-und-segmentaabb.md`, branch/worktree
  **welle-m-nexus** (base main c966b9c3). Pushed commits:
  - 2f385609: (1) village view.
  - e0983fa6: (2) world-act halt, `DSL_WELTAKTE` + `_messHalt` in `dslEval`, spy `__weltaktSpion`, WELTAKT guard in omen-messfolge, gate:weltakt-wache. CI green.
  - 7c1bd6f2: (3) ray via `_blockerNetz` 8 m cells; ceiling probe 22 758 → 0 slabs; ABBA `_loopCamera` 1.46/1.66 → 0.09/0.08 ms.
  - 91c44f0f: capsule/hull solver via `_blockerNahe`; 12 041 → 26 box solves per step.

  gate:blocker-netz uses the old loop as oracle. Full playtest green on 91c44f0f (150 s).

  The ABAB series vs V18.535 runs from `p3/serie-0710-7.sh`: data in `Desktop\AnazhRealm-OMEN\abab0710-7`, B worktree `abab-b-nexus` (91c44f0f, node_modules junction → welle-m-nexus). A boots count as green when the only finding is "WELTAKT blind".

  Still to do: evaluation, report `bericht/0710-7-nexus-dorf-segmentaabb.md` (draft `p3/bericht-0710-7-entwurf.md`), message to the coordinator.

  Tools: `p3/seg-zaehler.js` (ray counter), `p3/kap-zaehler.js`, `p3/abba-netz.sh`, `p3/abba-kapsel.sh`. CI is read via `curl api.github.com/repos/MiguellD/AnazhRealm/actions/runs?branch=…` because gh is not installed.
- **0710-6 REPORTED (2026-10-08 ~06:50): V18.535 ABAB.** A = main 78ee56da (worktree `abab-a535`), B = integ-probe c966b9c3 (worktree `abab-b535`, node_modules junction → welle-m-fahren). Both are kept for follow-ups. The verdict: B is not slower. Medians A → B: CPU p50/p95 10.8/24.1 → 6.4/9.7 ms, frame p95 33.3 → 25.0, hitches 4 → 0 per 30 s, VRAM 148.8 → 122.8 MB, gpu-bank equal. Data: `Desktop\AnazhRealm-OMEN\abab535` (serie.sh, auswertung.cjs, raw hitch profiles); report koordination 4724dd57. Resting again.
- **0710-4/0710-5 REPORTED (2026-10-08 ~03:20):** welle-m-impuls head **35ba704c** (after 20b0a5ef: f8a539c6 rider seat in the car; b7573745 feet above the belly, knees to the center, L9 skin-vs-hull + drawn-skin rays, L6 bounce measured inside `_stossPaar`, L8 holds the spawner; f3240335 swimmer stays on its line, `_kreaturSchwimmt`, sitting up after swimming; 35ba704c `_kreaturSchwimmLinie`, swimmer lockstep 0.127 → 0). Report koordination c576d595 + addendum 1f403813 (bericht/0710-4-impuls-klasse.md, images bericht/0710-4/). CI f8a539c6: cancelled at step 75 (45-min cap, 74 green). CI f3240335 step 43 `gate:asset-inventory` red: foreign silhouette `siedlung-zaun` (the settlement fence pool has no emitter identity; it appears only when the auto-village spawns during the census). Not this branch; the integrator fixes the class on integ-probe. Integration note for integ-probe: 2 conflict spots in updateCreatures; resolution is in the report. **Now resting as the measurement station; next order: V18.535 ABAB (A = main 0c91ceb7, B = integ-probe after the full run) when the integrator reports the candidate.** Image tools: p3/bild-reiter.sh + reiter-bild.cjs (attach the rig to the scene for the shot, because the werkbank hides the player).
- **0710-4/0710-5 state (2026-10-08 ~01:30):** welle-m-impuls pushed head **20b0a5ef** (54480d58 mass+bite, 7bb086e9 leib-an-leib, 20b0a5ef stoss in sim step + playtest Kampf D/A3e3). Its CI 37696340913 failed only at fahr-leben L3 (CI-only: first contact at 6.63 m/s with 4 impulses without approach); the lens now names partners. Class 4 (rider seat) is cut locally (I4, p3/commit-i4.txt). Coordinator decisions: the GT/supersport lie at 61-64° (sitzLehneMaxRad 1.15) because the car depth from belly to roof is 0.89/0.855 m vs ~1.1 m needed. "Wagen-Tiefe" is a post of studio wave S3, so no re-mint here. Merge-file vs welle-l-wasser vehicle-core: 0 conflicts; my branch moves no golden lines. Still to do: walls (p3/waende-i4.sh) → commit I4 → push → CI; image pairs (p3/bild-reiter.sh <name> <worktree> <port>; before worktree `impuls-vorher` at 20b0a5ef with a node_modules junction, remove with `cmd /c rmdir` first); trial merges; report from p3/bericht-0710-4-entwurf.md → koordination bericht/0710-4-impuls-klasse.md; message the coordinator.
- **0710-4 IMPULS-KLASSE GANZ (started 2026-10-08):** order file auftrag/0710-4-omen-impuls-klasse-ganz.md. Branch/worktree **welle-m-impuls** on 7f97d339 (LF checkout, node_modules junction → welle-m-fahren; base side = welle-m-fahren). Four classes: (1) ONE mass source (car mass as vehicle-core FAHR data line next to huelleDichte instead of STOSS.dichteWagen; animal/human from the leib), lens = mass table per species; (2) bite through STOSS; (3) body-to-body impulse exchange (tier-separation), lockstep-deterministic; (4) rider seat inside the car (top ≤ roof; seat 0.925, rider top 2.175 vs roof 1.75 on GT). Walls: fahr-leben, kampf-gefuehl (T13 + bite), tier-separation, kreatur-leben, check, playtest:fast, full playtest; core under byte proof. Do not touch welle-lf-kampf topics (hit energy, swing pose, first person, death tilt). Report bericht/0710-4-impuls-klasse.md.
- **0710-2 FAHREN-2 state (2026-10-08 ~00:30):** welle-m-fahren head **7f97d339** pushed (20628d20 Hangfuß+Spalt, f9b3a6de impulse law, 45ce1a5d Nah-Wiese budget order + streu-fern H, db0f2dc2 garage ERGEBNIS view + garage-labor G6, 7f97d339 relative velocity + pinned leib + fahr-leben "Stoß ohne Annäherung"). All walls + full playtest green. Q14 ghost gone (fix 187b047c in base; measured 0.2–1.9 %). D5 shore creep persists on 79f25cbd (named only). Trial merges vs welle-l-wasser and integ-probe: no conflicts of mine; semantic: car mass (STOSS.dichteWagen) should move into vehicle-core FAHR next to wasser's huelleDichte after the wasser merge. **Reported**: koordination 3f36d451 (bericht/0710-2-fahren-2.md + bericht/0710-2/), message sent. CI 37675959470 hit the 45-min job cap (75 green, 0 red; runner ~1.5x slow); coordinator reran it and splits the playtest job on integ-probe; local steps 74-86 13/13 green count as proof. Waiting for the next order. host-vram CI 37664758294: check green, playtest cancelled at step 4 (apt) — sent to coordinator (delivery unconfirmed). Scratch worktrees and all save-servers removed/stopped.
- **0710-2 FAHREN-2 earlier:** worktree `welle-m-fahren` (base integ-l 79f25cbd, LF checkout, npm ci), checkpoint **20628d20** pushed (Hangfuß + Spaltkante cut; gate:fahr-leben K7/L1/L2). The comparison worktree `fahren-basis` (79f25cbd, node_modules junction → welle-m-fahren) stays for base runs; remove its junction with `cmd /c rmdir` before deleting it. Probe tools live in `p3/` (sonde-fahren.cjs, fahrt-bild.cjs, bild-fahren.sh). Still to do: class 3 (impact without consequence) + combat knockback as ONE impulse law (gate:kampf-gefuehl "Rückstoß je Masse und Waffe"), the budget line before the book, the lab measurement labels, the car-ghost check, image pairs, report `bericht/0710-2-fahren-2.md`.
- **P2 reported (2026-10-07 ~19:00):** host-vram head **884111fc** (pushed; 4 commits on 6f1aa252). Report `bericht/0710-1-p2-host-vram.md` + raw data `bericht/0710-1-p2/` on koordination **9a24ac00** (pushed); message sent to the coordinator's bridge (delivery unconfirmed). Numbers: census 108.8 → 90.9 MiB; band VRAM 149.3 → 133.6; timing series 2 (p2/abab2, A 78d66a63 vs B 884111fc, 8/8) gpu-bank 14.88 → 15.07 / 13.59 → 13.88 ms (ranges overlap); cascade texel density at the meadow k0 0.155 m, k1 0.408 m = pixel only at far edge (0 MB). Open: 25 MB goal misses by 7.1 (1.2 after welle-k-haenger). CI run 37646473869 failed at step 32 gate:sicht-arbeit, which also fails at base 6f1aa252 in CI (flake); locally it and steps 33–81 are green (p2/waende-rest.sh). All servers stopped. The coordinator runs the independent check; next order pending.
- **P2 state (2026-10-07 ~17:30):** commits 7e6caf8a (lens), af7caf9e (cascade colors, −8.0 MB), 7e5180d0 (TRAA prior depth depth16, −3.95 MB), plus the uncommitted 4th cut: the scene depth as a half-res 2×2-max abbild r32float (`_szeneTiefe`/`_tiefenAbbild`, −5.93 MB; text in p2/commit-4.txt). The census falls 108.8 → 90.9 MiB (−17.9); with the welle-k-haenger player skin (5.9) it is 23.8 against the 25 goal. Images: rest 6/6, motion 7/8 (the walk pair is noise); in ONE world with a live depth swap the water is identical. gate:post-kette (e) water A/B is built (stage winding fixed). Round-2 answers and the report draft are in koordination/bericht/0710-1-p2-host-vram.md (placeholders KOPF/ZEIT/DICHTE/WAENDE). Next: walls (p2/waende-voll.sh) → commit 4 → push → CI → ABAB timing series 2 (B = head) → cascade texel density (p2/kaskade-dichte.cjs) → report + message to the coordinator.
- **P2 state (2026-10-07 ~15:05):** local commits 7e6caf8a (lens: `werkbank ziele`, scripts/lib/ziel-zensus.cjs, VRAM tap moved to scripts/lib/vram-abgriff.cjs) and e495073d (cut: cascade shadow maps without a GPU color target in `_kaskadenZiele`, `gate:ziel-zensus`, 7 vendor anchors, schatten-werfer Z1). Result: VRAM 149.5 → 141.5 MB in the same scene; census 29 textures / 108.8 MB → 27 / 100.8 MB, 0 red. Every remaining host target has a reader, so the post chain (71.1 MB) is the minimum for this TRAA form. Format, lint, check, schatten-werfer, ziel-zensus, post-kette, kamera-treue and playtest:fast are green. Next: verdict of the full playtest, push host-vram, ABAB timing series (`p2/abab-p2.sh`), report `bericht/0710-1-p2-host-vram.md`.
