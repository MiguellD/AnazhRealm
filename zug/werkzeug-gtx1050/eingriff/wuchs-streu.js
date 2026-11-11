// Eingriff zum Messen: der Wuchs der Baupläne reist an den Streu-Faden statt an den Wald-Faden — die Darts des Walds stehen
// dann nicht hinter ihm an (beide Fäden sind dieselbe Quelle, voxel-worker.js).
if (P) {
    const n0 = P._nebenAuftrag;
    P._nebenAuftrag = function (name, msg, transfer) {
        return n0.call(this, name === "wald" && msg && msg.type === "wuchs" ? "streu" : name, msg, transfer);
    };
}
