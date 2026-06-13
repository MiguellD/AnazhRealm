# THE WAIST — normative specification (v1) · English mirror

> **Status: NORMATIVE + FROZEN (Ω1, 2026-06-11).** This document is the contract, not a
> description. MUST/MAY language. The four golden files in `spec/golden/v1/` are the
> executable form of this contract — they are **NEVER regenerated** (conformance band Ω4
> loads them forever; `scripts/diag-taille.cjs` checks them on every run). If the waist
> ever grows beyond this one page + four files + five laws, THAT is the smell of the
> mistake (`docs/archiv/taille-plan.md` §4 — anti-scope).
>
> *This is the English mirror of `docs/taille-spec.md` (R-035 — the docking document for
> foreign builders). The German original is authoritative; on divergence, German wins.*

## The two sentences (everything else follows from them)

1. **The vector meets the signatures.** An artifact travels as descriptive substance
   (parts ⊕ connections ⊕ material definitions + provenance + signature). The receiver
   computes every MEANING (role, power, cost, domain) with its OWN frozen signatures.
   What is claimed is metadata; what is measured is truth.
2. **The work costs; the cycle nets zero.** Every making-act pays as a pure function of
   substance (`computeBuildCost` — no price table exists). No transformation cycle is
   net-positive (perpetuum ban, living invariant Ω5).

## §1 · The four wire artifacts

### 1a — The blueprint (golden: `blueprint-signed.json`)

The signed substance is exactly the `_canonicalBlueprint` form:
`{ v: 1, role, parts[], connections[] }` with `parts[i] = { shape, material, refName, color,
position{x,y,z}, size{x,y,z}, rotation{x,y,z}, opChain[{tool, op, cap}] }` and
`connections[i] = { type, partA, partB }` (numbers rounded to 4 decimals).

- Material travels as a **NAME** (string). Material DEFINITIONS (`{name, label, tags{}}`)
  travel separately (recipe import); their tag magnitudes are **claims** — the reader
  clamps (§3).
- Unsigned travelling envelope: `name, label, signature, authorPubKey, signedHash,
  signedAt, provenance[], forgedPrecision, toolMeta, portalMeta` + unknowns (§2).
- Tags/stats/costs are DERIVED and **NEVER** travel as truth.

### 1b — The world manifest (golden: `world-manifest.json`)

Signed substance = `_canonicalManifest`: `{ v: 1, id, label, dsl[] }`. Unsigned envelope:
`world` (path), `desc`, `multiplayer`, `serverMode`, `trust`, `vendored`, `bundleHash`,
`provenance[]`. Security fields (`world`, `trust`, `vendored`) MUST be sanitized locally
on receipt — they are never carriers of trust.

### 1c — The snapshot HEAD (golden: `snapshot-head.json`)

The snapshot is a **local** storage format, NOT a travel artifact — but it CARRIES travel
artifacts (blueprints/materials in the `world-pull` bundle). What is frozen is its
**schema** (top-level keys + types + `worldMeta` keys): a future build MUST keep producing
these keys (additive growth allowed) and MUST read a snapshot containing only these keys.
`version` is the app version (a diagnostic metadatum), **not** the schema version — the
schema versions via `snapshot-head.json` v1.

### 1d — The p2p envelope (golden: `p2p-envelopes.json`)

Every mesh message MUST carry `type`; `p2pSend` stamps `pv` (= `PROTO_VERSION`).
Receivers MUST silently discard unknown types and ignore unknown FIELDS of known types
(MEASURED: the channel passes the original object through — `_p2pHandleChannelMessage`
re-serializes `msg` in full). A future peer RELAY (star-beyond-6) MUST pass the original
object on, never rebuild it.

## §2 · The two reading laws

- **must-ignore:** unknown tags/axes project to 0 (MEASURED structurally:
  `_blueprintResonance` iterates the SIGNATURE axes — an `x:foreign` tag only resonates
  if a local signature carries the axis). Unknown fields are read as if absent. An
  artifact is **NEVER rejected** because of unknowns.
- **must-preserve:** unknown fields survive every round-trip bit-identically (a V18 relay
  does not strip a V25 blueprint's future). ONE source: `_carryUnknown(src, dst,
  knownKeys)` (Ω2). Size wall: an unknown field above 8 KiB JSON MAY drop (damping — a
  documented protection, not silent stripping of small futures). Security-sanitized
  KNOWN fields (portalMeta, trust, world) stay sanitized — must-preserve applies to the
  UNKNOWN, never as a bypass of a known wall.

## §3 · The receiver's law (the receiver is sovereign)

No import path adopts derived data as truth:

- A foreign `role` becomes `roleClaimed` (metadata, keeps travelling); the local role
  emerges (`computeBlueprintRole`). A foreign `roleManual` is a SUGGESTION — the local
  intent override requires the local gesture. Signature verification reads
  `roleClaimed ?? role` (backwards-compatible, no v2).
- Foreign tag magnitudes are clamped at the **READER** (`MATERIAL_TAG_CEIL` per axis,
  frozen): the substance stays untouched (a world with a higher ceiling reads the full
  splendor), but this world carries only what it carries. Covers EVERY entry path by
  construction (MEASURED Ω0: hardness=10⁶ → `_architectureResistance` mineResist 6.1e6,
  fit→0 = god-wall).
- Every artifact import passes through **ONE entrance** (`_admitForeignArtifact`):
  signature status attached to the artifact, revocation sieve AT the entrance,
  provenance appended, claim/truth separated.

## §4 · The version rule (ONE semantics)

- **minor = additive:** new fields, new tags, new message types, new snapshot keys.
  Readers ignore + preserve. No version field changes.
- **major = reinterpretation of an existing field/axis: FORBIDDEN** — except as a
  consciously born NEW waist (`v: 2` = a new universe with its own golden set).
- A tag axis is **NEVER reinterpreted**. It can only die (weight 0 in all local
  signatures) or be born (additively, default 0 — old artifacts stay valid by
  construction).
- The three fields: `v` (artifact schema, golden-anchored) · `pv` (mesh protocol) ·
  `version` (app diagnostics, NO schema semantics). A reader facing an unknown higher
  version: read what it knows; preserve what it doesn't; never reject.

## §5 · The ledger law

Quantities (inventory counts) **NEVER** travel across the waist — only definitions
(plans, material KINDS, tools, vocabulary). MEASURED: `importRecipesFromWorld` already
satisfies this; now it is law. Making-acts pay as a function of substance; build→harvest
is never net-positive (`yieldMult ≤ 1` ✓); every further cycle is Ω5-audited
(antibody band).

## §6 · The namespace (Ω6)

Bare tags = the frozen anazh core (`MATERIAL_TAG_KEYS` + form axes — meaning frozen from
now on). Prefixed tags (`x:…` / `<world>:…`) = foreign vocabulary: travels
(must-preserve), resonates only with a local signature (must-ignore carries that
structurally). The signature TABLES (`FORM_ROLE_SIGNATURES`, `WORKSHOP_DOMAIN_SIGNATURES`,
weights, cost constant k) are **WORLD-LOCAL** — the reading, never the waist; every world
may fork them without breaking anything.

## §7 · The broker protocol (the lighthouse — R-035)

> §7 DOCUMENTS the existing wire form of the WebSocket broker
> (`signaling-server.js` — the sister of the p2p envelope 1d). It does NOT extend the
> waist (anti-scope §0 stands): anyone can run their own lighthouse
> (`npm run leuchtturm`), and THIS chapter is the docking contract.

**Principle: the broker RELAYS; it owns nothing.** Rooms + peer sets live in RAM (no
persistence path); it stamps the `peerId` AUTHORITATIVELY onto every relayed message (a
client can never impersonate another); it does not validate CONTENT (trust lives in the
client sandbox — dslRun/receiver's law), only FORMS (size caps, type checks). It
**never** sees: private keys (the vibe pass never leaves the browser — §0 sovereignty),
inventory quantities (§5), or persistent world ownership (`world-snapshot` is a
pass-through).

- **Client → broker:** `join {room, peerId}` (authenticates the socket; everything
  before it except `stats`/`world-presence` is dropped) · room broadcasts `pos {x,y,z,yaw}` ·
  `creature-pos {list ≤64}` · `dsl {program: array 1..256}` · `soul` · `aura` · `vibe` ·
  `companion-say` · `subworld-net` · `portal-invite` · `world-request`/`world-snapshot`
  (world pull, pass-through) · addressed `rtc-offer`/`rtc-answer`/`rtc-ice {to}` (WebRTC
  rendezvous) · lobby `lobby-publish {label}` / `lobby-unpublish` / `lobby-list` ·
  `stats` · `world-presence {worldId}` (Φ4 — regional head-counts of a world; answer only
  to the requester).
- **Broker → client:** `welcome {peers[], lanAddresses[]}` · `peer-join {peerId}` ·
  `peer-leave {peerId}` · the stamped relays (original fields + `peerId`) ·
  `lobby-rooms {rooms[{room,label,peers}]}` · `stats {rooms, peers}` ·
  `world-presence {worldId, regions[{region, peers}]}` (Φ4 — region="" for the base room,
  "rRX_RZ" for a bubble).
- **Version rule:** §4 applies literally — new types are additive (minor); a broker MUST
  silently discard unknown types; a client MUST ignore unknown response types. Fields of
  existing types are NEVER reinterpreted.
- **Operation:** HTTP 4312 (static + local saves, localhost-only POST) · WS 4313;
  TLS/wss terminates at a reverse proxy in front; TURN is optional and client-side
  (`localStorage.anazhTurn`). German original: `docs/taille-spec.md`.
