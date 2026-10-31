// system-tafel.cjs — die Klassierung der Proben je System (nachgebaut nach w4-stadt-takt2, dieselben Regeln).
// Es zählt der TIEFSTE Rahmen eines Stapels, den eine Regel nennt (die Satz-Umlage unter `_passSicht` ist Satz-Pool, der
// Puffer-Bau unter `zeichne` ist Upload).
const SYSTEME = [
    ["Bewohner", /^(_tickBewohner|_bewohner[A-Z]\w*|_kzLeib|_kreaturGliederBacken|_kreaturGliederGruppen)$/],
    ["Verkehr", /^(_tickVerkehr|_verkehr[A-Z]\w*|_wagenSchritt|_fahrerSchritt)$/],
    ["Tiere/Vögel", /^(updateCreatures|_vogelTakt|_ruheImBild)$/],
    ["Leib-Löser/Physik", /^(_loopFixedStep|_stepFixedSim|_stepCharacter|_rittSchritt|_rescuePlayerFromVoid)$/],
    ["Streaming Chunks", /^(_tickVoxelChunkStreaming|_tickDirtyVoxelChunks|_tickMorphFolge|_tickPendingWaterIso|_rebuildVoxelChunk|_finalizeVoxelChunkBuild|_applyCrossLodGeomorph|_tickFernRing|_ensureFarWaterSheet|_ensureHydroTilesAround|_tickWorldWaterCA|_stauFelder)$/],
    ["Ingest Bauten", /^(_tickFoundryIngest|tickArchitectureCulling|_tickImpostorBake|_tickHuellenNach|_tickPendingVegSpawns|_foundryPumpe|_tickWegeKarte|_wegeRaeumen|_tickSaat|_tickWaldPlan)$/],
    ["Satz-Pool", /^(_tickChunkSatz|_tickBauSatz|_bauSatz[A-Z]\w*|_chunkSatzUmlegen|_chunkSatzGeometrie|_chunkSatzVAlloc|_chunkSatzEin|_chunkSatzLege|_chunkSatzDicht|_chunkSatzVerdichten|_satzPacke|_satzBlock\w*)$/],
    ["Streu", /^(_tickScatterStreaming|_tickPendingGrass|_tickScatterRegrow|_tickNahWiese|_tickNahStreu|_tickCanopyStreaming)$/],
    ["Stufen-Wahl", /^(_tickArchitectureLOD|_archBewegteUrteilen|_archStufeUrteil|_tickScatterLod)$/],
    ["Szene: Kehraus", /^(_gpuKehraus)$/],
    ["Szene: Pass-Wahl", /^(_passSicht|_chunkSatzPass|_chunkSatzAbschnitt|_instanzWahlPass|_instanzWahlGpu|_hoehlenSicht|_kaskadenPassen|_nahWieseSicht|_werferWahlPass)$/],
    ["Szene: Graph r184", /^(updateMatrixWorld|_projectObject)$/],
    ["Szenen-Pflege", /^(_loopCamera|_loopShadowUpdate|_leuchtTakt|_weltLichtTakt|_spiegelFeldTakt|_tickHausTueren|_updateDorfRauch|_funkenTakt|animatePlayerSoul|_applyFixedInterpolation|_tickMountedMovement|_loopFrustumCulling|_loopGroundCheck|_tickGenesisOrt|_ruheImBild)$/],
    ["Upload (Puffer)", /^(createAttribute|createBuffer|P\.createBuffer|createIndexAttribute|P\.createIndexAttribute|updateAttribute|P\.updateAttribute|writeBuffer|Q\.writeBuffer|writeTexture|Q\.writeTexture|updateTexture|T\.updateTexture|P\.updateTexture)( \[(three\.webgpu\.min\.js|werkbank)\])?$/],
    ["Knoten-Bau", /^(getNodeBuilderState|N\.getForRender|getForRender|getForCompute)$/],
    ["Befehls-Kodierung", /^(_renderObjects|_renderBundles|_renderBundle|renderer\._renderBundle|renderer\._renderBundles|renderObject|renderer\.renderObject|_renderObjectDirect|renderer\._renderObjectDirect|zeichne|draw|P\.draw|_draw|finishRender|be\.finishRender|beginRender|submit|_renderTransparents|_renderScene|renderer\._renderScene)( \[three\.webgpu\.min\.js\])?$/],
];
module.exports = { SYSTEME };
