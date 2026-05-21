// V9.40-f — Ammo-Heap Pre-Grow auf 256 MB.
//
// Das vendored ammo.js wurde mit Emscripten ohne `-s ALLOW_MEMORY_GROWTH=1`
// gebaut — der C-Allocator ruft `memory.grow()` NIE, ein OOM ruft sofort
// `abort()`. `scripts/patch-ammo-memory.cjs` hat den WASM-Memory-Header
// growable gemacht (max 64→256 MB); dieser Bootstrap-Hook zieht die Memory
// beim Instantiate auf 256 MB hoch, BEVOR Emscripten irgendetwas allokiert.
// Damit sieht der C-Code von Anfang an einen großen Heap.
//
// Wer schreibt: muss VOR `<script src="vendor/ammo.js">` eingebunden werden.
// CSP-konform (separates Skript, kein inline).
window.Module = {
    instantiateWasm: function (imports, success) {
        fetch("vendor/ammo.wasm.wasm")
            .then((r) => r.arrayBuffer())
            .then((buf) => WebAssembly.instantiate(buf, imports))
            .then((result) => {
                try {
                    const mem = result.instance.exports.g || result.instance.exports.memory;
                    if (mem && typeof mem.grow === "function") {
                        const cur = mem.buffer.byteLength / 65536;
                        const want = 4096; // 4096 × 64 KB = 256 MB
                        if (cur < want) {
                            const grew = mem.grow(want - cur);
                            console.log(
                                `[V9.40-f] Ammo-Heap pre-grow: ${cur} → ${mem.buffer.byteLength / 65536} pages (${(mem.buffer.byteLength / 1024 / 1024).toFixed(0)} MB); grow() returned ${grew}`
                            );
                        }
                    }
                } catch (e) {
                    console.warn("[V9.40-f] Ammo-Memory pre-grow fehlgeschlagen:", e);
                }
                success(result.instance);
            })
            .catch((err) => {
                console.error("[V9.40-f] Ammo-WASM-Instantiate fehlgeschlagen:", err);
            });
        return {};
    },
};
