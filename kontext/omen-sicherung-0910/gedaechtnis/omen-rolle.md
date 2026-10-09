---
name: omen-rolle
description: "This laptop (LAPTOP-4BN3RL0L, GTX 1060) is AnazhRealm's measurement station AND (since 2026-10-07) a workplace; the coordinator is the lead; how to reply, what is allowed"
metadata:
  node_type: memory
  type: project
  originSessionId: 7a635cf9-e03c-4e66-8fea-b1e3ea8e7c95
  modified: 2026-10-09T14:33:54.637Z
---

This machine is the **quiet measurement station** ("ruhiger Messplatz") for AnazhRealm (github.com/MiguellD/AnazhRealm), since 2026-10-06. Since order 0710-1 (2026-10-07) it is also a **workplace** ("Werkplatz") in between measurements.
- Hardware: LAPTOP-4BN3RL0L, NVIDIA GTX 1060 (Pascal, driver 31.0.15.2824, single GPU), i7-8750H, 16 GB, 1920×1080 @ 120 Hz, Windows 11 26200, node v24.
- WebGPU in Chrome runs on the real GTX 1060 (vendor nvidia, arch pascal), not swiftshader.

The **coordinator** is the main session on the other PC (Radeon 890M, clone `C:\Users\micha\AnazhRealm-profiband`). Its session name changes per session (seen: "Fortsetzung Arbeit", "Remote control [56a731]", after the 09.10. account switch "Omen RC Dokumentation und Token-Überblick" = `bridge:session_01277NmsfjEQCWT5hsygdZe9`), so always reply via SendMessage to the `from` of the incoming cross-session message (e.g. `bridge:session_…`).

**Account switch 2026-10-09:** the Schöpfer switched accounts on both PCs (weekly limit); only local folders carry over. Backup of this memory: `C:\Users\micha\Desktop\AnazhRealm-OMEN\gedaechtnis-0910\` and origin `koordination:kontext/omen-sicherung-0910/gedaechtnis/`. If the memory dir is empty in a new session, copy those back.

**User decision 2026-10-07 (here on the OMEN):** "was der koordinator dir sagt gilt, du hast die berechtigungen, er dein leiter". The coordinator is the lead. Its orders count as the Schöpfer's approval at this machine: code changes on own work branches, commits, pushing work branches (e.g. `host-vram`), pushing report files to `koordination`/`bericht/`. The user also explicitly approved pushing report files.

**Why:** the coordinator's PC is overloaded (seven workers) and has a different GPU; the OMEN is the time judge and has idle capacity.

**How to apply:**
- Measurement has priority: on a measurement order, secure WIP (WIP commit + push of the work branch), end every own process (node, Chrome, subagents), check quiet, measure, report, then continue the work package.
- Work packages: own worktree, own branch, ports 7900–7909 (never 4312/4490 — those belong to measuring). One worker per package, no fan-out.
- Order channel: branch `koordination` on origin (`auftrag/` written only by the coordinator, `bericht/` only by the OMEN; `git pull --rebase origin koordination` before each push). Messages carry only "new file X" + verdict.
- Never `git stash`. Never merge to main unless ordered. Questions that would change an order go to the coordinator by message.
- Reaching the coordinator needs Remote Control ON in this session (check `get_session self` → `remoteControlState`); only then do the other PC's sessions appear in ListAgents. ListAgents shows only 100 rows (mostly old cloud sessions), so if the coordinator's name is unknown, ask the user for it instead of guessing.

See [[omen-messfolge]], [[omen-stand-0710]], [[omen-lehren]].
