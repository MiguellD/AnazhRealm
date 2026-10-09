---
name: omen-messfolge
description: "The agreed AnazhRealm measurement sequence on the OMEN (boot order, werkbank commands, guards, report fields)"
metadata:
  node_type: memory
  type: reference
  originSessionId: 7a635cf9-e03c-4e66-8fea-b1e3ea8e7c95
  modified: 2026-10-07T12:12:55.752Z
---

**Per boot** (every state runs its OWN `scripts/werkbank.cjs` from its own worktree):
1. `PORT=4312 node save-server.js` from the state's worktree, then `node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312` (wait for "WERKBANK bereit").
2. Preparation:
   - `eval "window.__anazhAutoSettlement = false; return 1"`
   - `fenster 1920 1080`
   - `umstellen --ort wiese` (states before V18.534 lack `--ort`: use `umstellen -900 -850` + yaw 0, the same place and view)
   - `__buehne()` once, via eval
   - `eval "r.state.yaw = 0; r.state.pitch = 0; return 1"`
3. Measure, in this order:
   - `lauf 30 --ein 20 --ruhe 300 --tiere frei --regler voll`, then the same with `--regler frei`
   - `gpu-bank 12 --runden 3` at yaw 0 and yaw −0.88
   - `band` at yaw 0 and −0.88 (always AFTER lauf)
   - `zaehlen` (animals), `schirm --datei …` (image check)
   - `profil 12 --regler voll --top 60`
   - `zerlegen` / `sicht` only in ONE B boot, after everything else
4. Stop: `werkbank stop` and kill the save-server node process.

**Series:** ABABABAB, 4 fresh boots per side. Run as a background bash script in the scratchpad with a Monitor on a progress log; no other GPU load during the run.

**Validity:** a GPU A/B counts only with an identical scene (same draw commands + triangles) or ≥ 4 boots per side; boot-to-boot spread is up to 2.6 ms. Never quote `lauf` gpuMs from a run after `band` in the same boot on states before V18.533.

**Guards to check and report:** STEMPEL-POOL GRUEN (after band), `stempel.gueltig` in lauf, WETTER-WACHE (lauf output `wetterHalt`), Ort-Wache.

**Report per boot:**
- Frame p50/p95 and max
- CPU-Takt p50/p95
- render/creatures EWMA, under voll and frei
- gpu-bank GPU/CPU
- band commands/triangles/VRAM
- animals (zaehlen), weather at end

Then the medians A vs B, profile top 10, and the zerlegen table.

If a state contains `scripts/omen-messfolge.cjs` (wave K "Mess-Wahrheit"), read it fully and use it instead of hand-built scripts.

**Since order 0710-1 (2026-10-07): ONE instrument for both sides.** Use `omen-messfolge.cjs` + `werkbank.cjs` + `scripts/lib` from the newest state that has them. The measured side only delivers the world: `PORT=4312 node save-server.js` from that side's worktree. Per boot: `node <instr>/scripts/omen-messfolge.cjs --seite http://localhost:4312 --datei <N>.json` (cwd = instrument worktree, defaults otherwise). The folge runs boot · dorf-aus · fenster 1920×1080 · umstellen --ort wiese · buehne · lauf voll · lauf frei · gpu-bank (yaw 0 and −0.88) · band · profil, checks every guard after each step and writes one JSON; exit 0 = green, 1 = a guard red, 2 = abort. Run `--selbsttest` first.
- The wrapper script (template: `koordination/bericht/0710-1-p1/serie.sh`) adds a **side guard**: the sha256 of `anazhRealm.js` served on :4312 must match the side. It also re-runs red boots (keep `<N>-verworfen-k.json`, max 2 repeats), logs GPU temperature, clock and P-state per boot, and pauses 60 s between boots. One boot takes ~2:45 min; a full ABABABAB series about 40 min.
- Evaluation: `koordination/bericht/0710-1-p1/auswertung.cjs <dir>` (per boot, medians A vs B, profile top 10 by function name, refused weather moves).
- The folge has no `zaehlen`/`schirm` step yet. Wave K is adding an animal counter to `/wache`; until then report the creatures EWMA and the `tier*` row of the band table.
