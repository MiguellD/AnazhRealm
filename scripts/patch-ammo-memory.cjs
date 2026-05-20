#!/usr/bin/env node
// V9.40-f — Ammo-WASM-Memory-Patch
//
// Das vendored ammo.wasm.wasm trägt einen FIXEN Heap-Cap (initial=max=64 MB,
// nicht-growable). Eine Voxel-Welt mit Sicht-Ring 4-8 (81-289 Chunks) braucht
// mehr — jeder Voxel-Chunk hält btBvhTriangleMeshShape + BVH-Baum + Vertices.
// Schöpfer-Wahl V9.40-f: max auf 256 MB heben, Memory wird growable.
//
// Der Patch ist ein 2-Byte-Edit in der Memory-Section des WASM-Binary. Er ist
// idempotent (zweiter Lauf ist no-op) und reproduzierbar bei Vendor-Updates.
//
// Aufruf: node scripts/patch-ammo-memory.cjs
// Default: vendor/ammo.wasm.wasm → max 64 MB → 256 MB
//
// Lehre: ein WASM-Memory-Header ist editierbar; LEB128-encoded initial/max-
// pages stehen in der Memory-Section (ID 5). Wer den Vendor-Build aktualisiert,
// muss diesen Patch erneut laufen lassen (in vendor/README.md notiert).

const fs = require("fs");
const path = require("path");

const TARGET_FILE = path.join(__dirname, "..", "vendor", "ammo.wasm.wasm");
const PAGE_SIZE_KB = 64; // WASM-Page = 64 KiB
const NEW_MAX_PAGES = 4096; // 4096 × 64 KB = 256 MB
const EXPECTED_OLD_MAX = 1024; // V8.50-Vendor-Default = 64 MB

function readLeb128(buf, off) {
    let val = 0,
        shift = 0,
        bytes = 0,
        b;
    do {
        b = buf[off + bytes];
        val |= (b & 0x7f) << shift;
        shift += 7;
        bytes++;
    } while (b & 0x80);
    return { val, bytes };
}

function writeLeb128(val) {
    // 2-byte LEB128 für Werte 128..16383 — exakt was wir brauchen (1024 + 4096)
    if (val < 128) return Buffer.from([val]);
    if (val < 16384) return Buffer.from([(val & 0x7f) | 0x80, (val >> 7) & 0x7f]);
    if (val < 2097152)
        return Buffer.from([(val & 0x7f) | 0x80, ((val >> 7) & 0x7f) | 0x80, (val >> 14) & 0x7f]);
    throw new Error(`LEB128 für ${val} braucht > 3 Bytes — nicht unterstützt`);
}

function patch() {
    if (!fs.existsSync(TARGET_FILE)) {
        console.error(`[patch-ammo] ${TARGET_FILE} nicht gefunden`);
        process.exit(1);
    }
    const buf = fs.readFileSync(TARGET_FILE);
    if (buf.readUInt32LE(0) !== 0x6d736100) {
        console.error("[patch-ammo] Datei ist kein WASM-Binary (magic-bytes falsch)");
        process.exit(1);
    }

    // Sections durchlaufen, Memory-Section (ID 5) finden
    let off = 8;
    while (off < buf.length) {
        const id = buf[off];
        off++;
        const len = readLeb128(buf, off);
        off += len.bytes;
        const secStart = off;
        const secEnd = off + len.val;

        if (id === 5) {
            // Memory section: count + each (flags + initial + maybe max)
            let p = secStart;
            const count = readLeb128(buf, p);
            p += count.bytes;
            if (count.val !== 1) {
                console.error(`[patch-ammo] erwartet 1 Memory, gefunden ${count.val}`);
                process.exit(1);
            }
            const flags = buf[p++];
            const initial = readLeb128(buf, p);
            p += initial.bytes;
            if ((flags & 1) === 0) {
                console.error("[patch-ammo] Memory hat kein max-Feld — Patch nicht möglich");
                process.exit(1);
            }
            const max = readLeb128(buf, p);
            const maxOff = p;
            p += max.bytes;

            console.log(
                `[patch-ammo] gefunden: initial=${initial.val} pages (${(initial.val * PAGE_SIZE_KB) / 1024} MB), max=${max.val} pages (${(max.val * PAGE_SIZE_KB) / 1024} MB)`
            );

            if (max.val === NEW_MAX_PAGES) {
                console.log(`[patch-ammo] schon gepatcht (max=${NEW_MAX_PAGES}) — no-op`);
                return;
            }
            if (max.val !== EXPECTED_OLD_MAX) {
                console.warn(
                    `[patch-ammo] unerwartete max=${max.val} (erwartet ${EXPECTED_OLD_MAX}). Patche trotzdem auf ${NEW_MAX_PAGES}.`
                );
            }

            // Patch: max-Bytes durch NEW_MAX_PAGES ersetzen
            const newMaxBytes = writeLeb128(NEW_MAX_PAGES);
            if (newMaxBytes.length !== max.bytes) {
                console.error(
                    `[patch-ammo] LEB128-Länge ändert sich (${max.bytes} → ${newMaxBytes.length}) — Section-Länge müsste mit-verschoben werden. Nicht implementiert.`
                );
                process.exit(1);
            }
            const patched = Buffer.from(buf);
            newMaxBytes.copy(patched, maxOff);

            // Verifikation: re-lesen
            const verify = readLeb128(patched, maxOff);
            if (verify.val !== NEW_MAX_PAGES) {
                console.error(`[patch-ammo] Verifikation fehlgeschlagen (gelesen ${verify.val})`);
                process.exit(1);
            }

            fs.writeFileSync(TARGET_FILE, patched);
            console.log(
                `[patch-ammo] ✅ max patched: ${max.val} → ${NEW_MAX_PAGES} pages (${(max.val * PAGE_SIZE_KB) / 1024} MB → ${(NEW_MAX_PAGES * PAGE_SIZE_KB) / 1024} MB)`
            );
            console.log(
                `[patch-ammo] Memory ist jetzt growable von ${(initial.val * PAGE_SIZE_KB) / 1024} MB bis ${(NEW_MAX_PAGES * PAGE_SIZE_KB) / 1024} MB`
            );
            return;
        }
        off = secEnd;
    }
    console.error("[patch-ammo] keine Memory-Section gefunden");
    process.exit(1);
}

patch();
