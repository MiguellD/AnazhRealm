// ════════════════════════════════════════════════════════════════════
// ANATOMIE · KLINGE & KOLBEN
//   1. LEHREN    — Soll-Eigenschaften der Dynamik, die urteilen (Metrologie)
//   2. RÜCKGRAT  — Mittellinie + benannte Stationen (Knauf→Griff→Parier→Spitze)
//   3. GELENKE   — die dynamischen Punkte: Hand(Drehpunkt) · Balance · Stoßmittelpunkt
//   4. STAHL     — die Haut, ABGELEITET aus Rückgrat × Schnittprofil
// Kernsatz: EIN Schnittpolygon → Loft-Mesh UND Massenintegral. Eine Wahrheit.
// ════════════════════════════════════════════════════════════════════
/* V18.491.475 — Lab Studio Fog dens ← DUNST_GESETZ fail-soft; Host none (DUNST_VIS). PATINA/SCHLEIER/HUB/GITTER/LIFT untouched; arena fog 0.006 + lights/bloom left bare. */
const _DNS=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.DUNST_GESETZ)||null;
const DUNST_DENS=(_DNS&&Number.isFinite(_DNS.dens))?_DNS.dens:0.045;
/* V18.491.489 — Lab Studio bg/fog color ← HINTER_GESETZ fail-soft; Host none (HINTER_VIS). BANKM/BELICHT/DUNST-dens/BENCH/LIFT untouched. */
const _HIN=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.HINTER_GESETZ)||null;
const HINTER_COLOR=(_HIN&&Number.isFinite(_HIN.color))?_HIN.color:0x0a0807;
const scene=new THREE.Scene();scene.background=new THREE.Color(HINTER_COLOR);scene.fog=new THREE.FogExp2(HINTER_COLOR,DUNST_DENS);
/* V18.491.485 — Lab Studio Camera ← BLICK_GESETZ fail-soft; Host none (BLICK_VIS). SCHATTEN/FRUSTUM/FOV-labFovK/Orbit/exposure/LIFT untouched. */
const _BLI=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.BLICK_GESETZ)||null;
const BLICK_FOV=(_BLI&&Number.isFinite(_BLI.fov))?_BLI.fov:33;
const BLICK_NEAR=(_BLI&&Number.isFinite(_BLI.near))?_BLI.near:0.05;
const BLICK_FAR=(_BLI&&Number.isFinite(_BLI.far))?_BLI.far:100;
const BLICK_X=(_BLI&&Number.isFinite(_BLI.x))?_BLI.x:0.16;
const BLICK_Y=(_BLI&&Number.isFinite(_BLI.y))?_BLI.y:0.74;
const BLICK_Z=(_BLI&&Number.isFinite(_BLI.z))?_BLI.z:1.78;
const cam=new THREE.PerspectiveCamera(BLICK_FOV,innerWidth/innerHeight,BLICK_NEAR,BLICK_FAR);cam.position.set(BLICK_X,BLICK_Y,BLICK_Z);
const R=new THREE.WebGLRenderer({antialias:true});R.setSize(innerWidth,innerHeight);R.setPixelRatio(Math.min(devicePixelRatio,2));
/* V18.491.487 — Lab Studio Exposure ← BELICHT_GESETZ fail-soft; Host none (BELICHT_VIS). ORBIT/BLICK/BENCH/SCHATTEN/BLUETE/LIFT untouched. */
const _BEL=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.BELICHT_GESETZ)||null;
const BELICHT_EXPO=(_BEL&&Number.isFinite(_BEL.exposure))?_BEL.exposure:1.06;
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=BELICHT_EXPO;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(R.domElement);

// ── Schmiede-Env (PMREM aus Leinwand-Verlauf, wie mkEnv): warmes Oberlicht, Funken-Streifen ──
/* V18.491.490 — Lab Studio PMREM Leinwand ← LEIN_GESETZ fail-soft; Host none (LEIN_VIS). HINTER/BANKM/DUNST/PATINA/LEINE/LIFT untouched; Esse-Fenster + grade left bare. */
const _LNW=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.LEIN_GESETZ)||null;
const LEIN_TOP=(_LNW&&Number.isFinite(_LNW.top))?_LNW.top:0x5a4836;
const LEIN_MID=(_LNW&&Number.isFinite(_LNW.mid))?_LNW.mid:0x241a12;
const LEIN_BOT=(_LNW&&Number.isFinite(_LNW.bot))?_LNW.bot:0x080604;
const LEIN_MIDT=(_LNW&&Number.isFinite(_LNW.midT))?_LNW.midT:0.4;
const _leinHex=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
(function(){const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,_leinHex(LEIN_TOP));g.addColorStop(LEIN_MIDT,_leinHex(LEIN_MID));g.addColorStop(1,_leinHex(LEIN_BOT));
  x.fillStyle=g;x.fillRect(0,0,1024,512);
  /* V18.491.491 — Lab Studio Esse-Fenster ← FENSTER_GESETZ fail-soft; Host none (FENSTER_VIS). LEIN/HINTER/BANKM/PATINA/LIFT untouched; Funken-Streifen + grade left bare. */
  const _FEN=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.FENSTER_GESETZ)||null;
  const FEN_R=(_FEN&&Number.isFinite(_FEN.r))?_FEN.r:255;
  const FEN_G=(_FEN&&Number.isFinite(_FEN.g))?_FEN.g:180;
  const FEN_B=(_FEN&&Number.isFinite(_FEN.b))?_FEN.b:90;
  const FEN_A=(_FEN&&Number.isFinite(_FEN.a))?_FEN.a:0.30;
  const FEN_X0=(_FEN&&Number.isFinite(_FEN.x0))?_FEN.x0:140;
  const FEN_Y0=(_FEN&&Number.isFinite(_FEN.y0))?_FEN.y0:30;
  const FEN_W0=(_FEN&&Number.isFinite(_FEN.w0))?_FEN.w0:200;
  const FEN_H0=(_FEN&&Number.isFinite(_FEN.h0))?_FEN.h0:90;
  const FEN_X1=(_FEN&&Number.isFinite(_FEN.x1))?_FEN.x1:650;
  const FEN_Y1=(_FEN&&Number.isFinite(_FEN.y1))?_FEN.y1:40;
  const FEN_W1=(_FEN&&Number.isFinite(_FEN.w1))?_FEN.w1:170;
  const FEN_H1=(_FEN&&Number.isFinite(_FEN.h1))?_FEN.h1:70;
  x.fillStyle='rgba('+FEN_R+','+FEN_G+','+FEN_B+','+FEN_A+')';x.fillRect(FEN_X0,FEN_Y0,FEN_W0,FEN_H0);x.fillRect(FEN_X1,FEN_Y1,FEN_W1,FEN_H1);  // Esse-Fenster (Glanzlichter)
  /* V18.491.492 — Lab Studio Funken-Streifen ← FUNKEN_GESETZ fail-soft; Host none (FUNKEN_VIS). FENSTER/LEIN/HINTER/PATINA/STREIF/LIFT untouched; grade left bare. */
  const _FNK=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.FUNKEN_GESETZ)||null;
  const FNK_R=(_FNK&&Number.isFinite(_FNK.r))?_FNK.r:255;
  const FNK_G=(_FNK&&Number.isFinite(_FNK.g))?_FNK.g:120;
  const FNK_B=(_FNK&&Number.isFinite(_FNK.b))?_FNK.b:40;
  const FNK_A=(_FNK&&Number.isFinite(_FNK.a))?_FNK.a:0.18;
  const FNK_X=(_FNK&&Number.isFinite(_FNK.x))?_FNK.x:420;
  const FNK_Y=(_FNK&&Number.isFinite(_FNK.y))?_FNK.y:300;
  const FNK_W=(_FNK&&Number.isFinite(_FNK.w))?_FNK.w:260;
  const FNK_H=(_FNK&&Number.isFinite(_FNK.h))?_FNK.h:40;
  x.fillStyle='rgba('+FNK_R+','+FNK_G+','+FNK_B+','+FNK_A+')';x.fillRect(FNK_X,FNK_Y,FNK_W,FNK_H);
  const t=new THREE.CanvasTexture(c);const p=new THREE.PMREMGenerator(R);scene.environment=p.fromEquirectangular(t).texture;t.dispose();})();

// ── Werkbank + Raster ──
/* V18.491.253 — Lab Werkbank floor ← BANK_GESETZ fail-soft; Host none (BANK_VIS). Dead LIFT stays unhoisted. */
const _BKG=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.BANK_GESETZ)||null;
const FLOOR_Y=(_BKG&&Number.isFinite(_BKG.floorY))?_BKG.floorY:-0.26;
const LIFT=0.30; // dead local — stays unhoisted (≠ HEBE_GESETZ; do not Fake-merge LIFT↔weapon.y)
/* V18.491.468 — Lab Werkbank-Plane ← BENCH_GESETZ fail-soft; Host none (BENCH_VIS). SPUR/BANK/TISCH/PLATTE/BODEN/LIFT untouched; grid/ground left bare. */
const _BCH=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.BENCH_GESETZ)||null;
const BENCH_SIZE=(_BCH&&Number.isFinite(_BCH.size))?_BCH.size:5;
/* V18.491.488 — Lab Studio Bench Mat ← BANKM_GESETZ fail-soft; Host none (BANKM_VIS). BELICHT/ORBIT/BLICK/BENCH-size/BANK/LIFT untouched; bg color left bare. */
const _BKM=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.BANKM_GESETZ)||null;
const BANKM_COLOR=(_BKM&&Number.isFinite(_BKM.color))?_BKM.color:0x090706;
const BANKM_ROUGH=(_BKM&&Number.isFinite(_BKM.rough))?_BKM.rough:0.8;
const BANKM_METAL=(_BKM&&Number.isFinite(_BKM.metal))?_BKM.metal:0.2;
const BANKM_ENV=(_BKM&&Number.isFinite(_BKM.env))?_BKM.env:0.6;
const bench=new THREE.Mesh(new THREE.PlaneGeometry(BENCH_SIZE,BENCH_SIZE),
  new THREE.MeshStandardMaterial({color:BANKM_COLOR,roughness:BANKM_ROUGH,metalness:BANKM_METAL,envMapIntensity:BANKM_ENV}));
bench.rotation.x=-Math.PI/2;bench.position.y=FLOOR_Y;bench.receiveShadow=true;scene.add(bench);
/* V18.491.471 — Lab Studio GridHelper ← GITTER_GESETZ fail-soft; Host none (GITTER_VIS). NETZ/FELD/RAST/BENCH/LIFT untouched; colors/opacity/yOff left bare. */
const _GTR=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.GITTER_GESETZ)||null;
const GITTER_SIZE=(_GTR&&Number.isFinite(_GTR.size))?_GTR.size:4.5;
const GITTER_DIVS=(_GTR&&Number.isFinite(_GTR.divs))?_GTR.divs:18;
/* V18.491.472 — Lab Studio Grid Y-Hub ← HUB_GESETZ fail-soft; Host none (HUB_VIS). GITTER/NETZ/FELD/NARBZ/LIFT untouched; opacity left bare. */
const _HUB=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.HUB_GESETZ)||null;
const HUB_YOFF=(_HUB&&Number.isFinite(_HUB.yOff))?_HUB.yOff:0.001;
/* V18.491.473 — Lab Studio Grid Opacity ← SCHLEIER_GESETZ fail-soft; Host none (SCHLEIER_VIS). HUB/GITTER/NETZ/FELD/LIFT untouched; colors left bare. */
const _SLR=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.SCHLEIER_GESETZ)||null;
const SCHLEIER_OP=(_SLR&&Number.isFinite(_SLR.opacity))?_SLR.opacity:0.26;
/* V18.491.474 — Lab Studio Grid Colors ← PATINA_GESETZ fail-soft; Host none (PATINA_VIS). SCHLEIER/HUB/GITTER/NETZ/LIFT untouched; lights/fog left bare. */
const _PTN=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.PATINA_GESETZ)||null;
const PATINA_CENTER=(_PTN&&Number.isFinite(_PTN.center))?_PTN.center:0x241b10;
const PATINA_GRID=(_PTN&&Number.isFinite(_PTN.grid))?_PTN.grid:0x130d07;
const grid=new THREE.GridHelper(GITTER_SIZE,GITTER_DIVS,PATINA_CENTER,PATINA_GRID);grid.position.y=FLOOR_Y+HUB_YOFF;grid.material.opacity=SCHLEIER_OP;grid.material.transparent=true;scene.add(grid);

// ── Licht (Avatar/Schmiede-Stack) ──
/* V18.491.478 — Lab Studio Hemi ← HEMI_GESETZ fail-soft; Host none (HEMI_VIS). BLUETE/DUNSTA/DUNST/PATINA/LIFT untouched; key/rim/fill/edge left bare. */
const _HMI=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.HEMI_GESETZ)||null;
const HEMI_SKY=(_HMI&&Number.isFinite(_HMI.sky))?_HMI.sky:0x6a5a44;
const HEMI_GROUND=(_HMI&&Number.isFinite(_HMI.ground))?_HMI.ground:0x0c0806;
const HEMI_INT=(_HMI&&Number.isFinite(_HMI.intensity))?_HMI.intensity:0.5;
scene.add(new THREE.HemisphereLight(HEMI_SKY,HEMI_GROUND,HEMI_INT));
/* V18.491.479 — Lab Studio Key ← KEY_GESETZ fail-soft; Host none (KEY_VIS). HEMI/BLUETE/DUNSTA/LIFT untouched; rim/fill/edge + shadow frustum left bare. */
const _KEY=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.KEY_GESETZ)||null;
const KEY_COLOR=(_KEY&&Number.isFinite(_KEY.color))?_KEY.color:0xffe8c8;
const KEY_INT=(_KEY&&Number.isFinite(_KEY.intensity))?_KEY.intensity:3.0;
const KEY_X=(_KEY&&Number.isFinite(_KEY.x))?_KEY.x:2.4;
const KEY_Y=(_KEY&&Number.isFinite(_KEY.y))?_KEY.y:3.6;
const KEY_Z=(_KEY&&Number.isFinite(_KEY.z))?_KEY.z:2.2;
const key=new THREE.DirectionalLight(KEY_COLOR,KEY_INT);key.position.set(KEY_X,KEY_Y,KEY_Z);key.castShadow=true;
/* V18.491.484 — Lab Studio Key Shadow Map ← SCHATTEN_GESETZ fail-soft; Host none (SCHATTEN_VIS). FRUSTUM/EDGE/KEY/FILL/RIM/HEMI/LIFT untouched. */
const _SCHT=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.SCHATTEN_GESETZ)||null;
const SCHT_SIZE=(_SCHT&&Number.isFinite(_SCHT.size))?_SCHT.size:2048;
const SCHT_BIAS=(_SCHT&&Number.isFinite(_SCHT.bias))?_SCHT.bias:-0.00018;
key.shadow.mapSize.set(SCHT_SIZE,SCHT_SIZE);key.shadow.bias=SCHT_BIAS;
/* V18.491.483 — Lab Studio Key Shadow Frustum ← FRUSTUM_GESETZ fail-soft; Host none (FRUSTUM_VIS). EDGE/KEY/FILL/RIM/HEMI/LIFT untouched; mapSize/bias left bare. */
const _FRU=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.FRUSTUM_GESETZ)||null;
const FRU_L=(_FRU&&Number.isFinite(_FRU.left))?_FRU.left:-1.3;
const FRU_R=(_FRU&&Number.isFinite(_FRU.right))?_FRU.right:1.3;
const FRU_T=(_FRU&&Number.isFinite(_FRU.top))?_FRU.top:1.2;
const FRU_B=(_FRU&&Number.isFinite(_FRU.bottom))?_FRU.bottom:-0.8;
const FRU_N=(_FRU&&Number.isFinite(_FRU.near))?_FRU.near:0.5;
const FRU_F=(_FRU&&Number.isFinite(_FRU.far))?_FRU.far:9;
Object.assign(key.shadow.camera,{left:FRU_L,right:FRU_R,top:FRU_T,bottom:FRU_B,near:FRU_N,far:FRU_F});scene.add(key);
/* V18.491.480 — Lab Studio Rim ← RIM_GESETZ fail-soft; Host none (RIM_VIS). KEY/HEMI/BLUETE/LIFT untouched; fill/edge + key shadow frustum left bare. */
const _RIM=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.RIM_GESETZ)||null;
const RIM_COLOR=(_RIM&&Number.isFinite(_RIM.color))?_RIM.color:0x66a8ff;
const RIM_INT=(_RIM&&Number.isFinite(_RIM.intensity))?_RIM.intensity:1.5;
const RIM_X=(_RIM&&Number.isFinite(_RIM.x))?_RIM.x:-2.6;
const RIM_Y=(_RIM&&Number.isFinite(_RIM.y))?_RIM.y:1.6;
const RIM_Z=(_RIM&&Number.isFinite(_RIM.z))?_RIM.z:-2.2;
const rim=new THREE.DirectionalLight(RIM_COLOR,RIM_INT);rim.position.set(RIM_X,RIM_Y,RIM_Z);scene.add(rim);   // kühles Gegenlicht → Stahlkante singt
/* V18.491.481 — Lab Studio Fill ← FILL_GESETZ fail-soft; Host none (FILL_VIS). RIM/KEY/HEMI/BLUETE/LIFT untouched; edge + key shadow frustum left bare. */
const _FILL=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.FILL_GESETZ)||null;
const FILL_COLOR=(_FILL&&Number.isFinite(_FILL.color))?_FILL.color:0xff8a44;
const FILL_INT=(_FILL&&Number.isFinite(_FILL.intensity))?_FILL.intensity:0.6;
const FILL_X=(_FILL&&Number.isFinite(_FILL.x))?_FILL.x:0.4;
const FILL_Y=(_FILL&&Number.isFinite(_FILL.y))?_FILL.y:0.8;
const FILL_Z=(_FILL&&Number.isFinite(_FILL.z))?_FILL.z:-2.6;
const fill=new THREE.DirectionalLight(FILL_COLOR,FILL_INT);fill.position.set(FILL_X,FILL_Y,FILL_Z);scene.add(fill);
/* V18.491.482 — Lab Studio Edge ← EDGE_GESETZ fail-soft; Host none (EDGE_VIS). FILL/RIM/KEY/HEMI/BLUETE/LIFT untouched; key shadow frustum left bare. */
const _EDGE=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.EDGE_GESETZ)||null;
const EDGE_COLOR=(_EDGE&&Number.isFinite(_EDGE.color))?_EDGE.color:0xfff0d8;
const EDGE_INT=(_EDGE&&Number.isFinite(_EDGE.intensity))?_EDGE.intensity:0.8;
const EDGE_DIST=(_EDGE&&Number.isFinite(_EDGE.dist))?_EDGE.dist:4;
const EDGE_X=(_EDGE&&Number.isFinite(_EDGE.x))?_EDGE.x:0.6;
const EDGE_Y=(_EDGE&&Number.isFinite(_EDGE.y))?_EDGE.y:0.5;
const EDGE_Z=(_EDGE&&Number.isFinite(_EDGE.z))?_EDGE.z:0.9;
const edgeL=new THREE.PointLight(EDGE_COLOR,EDGE_INT,EDGE_DIST);edgeL.position.set(EDGE_X,EDGE_Y,EDGE_Z);scene.add(edgeL);

// ── Post: Bloom auf Glanzlichtern + FXAA + leichte Vignette/Korn ──
const composer=new THREE.EffectComposer(R);composer.addPass(new THREE.RenderPass(scene,cam));
/* V18.491.477 — Lab Studio Bloom ← BLUETE_GESETZ fail-soft; Host none (BLUETE_VIS). DUNSTA/DUNST/PATINA/SCHLEIER/LIFT untouched; lights left bare. */
const _BLT=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.BLUETE_GESETZ)||null;
const BLUETE_STR=(_BLT&&Number.isFinite(_BLT.strength))?_BLT.strength:0.42;
const BLUETE_RAD=(_BLT&&Number.isFinite(_BLT.radius))?_BLT.radius:0.65;
const BLUETE_THR=(_BLT&&Number.isFinite(_BLT.threshold))?_BLT.threshold:0.82;
const bloom=new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),BLUETE_STR,BLUETE_RAD,BLUETE_THR);composer.addPass(bloom);
const fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms.resolution.value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
/* V18.491.493 — Lab Studio Grade ← GRADE_GESETZ fail-soft; Host none (GRADE_VIS). FUNKEN/FENSTER/LEIN/HINTER/BLUETE/LIFT untouched; hof terrain left bare. */
const _GRD=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.GRADE_GESETZ)||null;
const GRADE_OUTER=(_GRD&&Number.isFinite(_GRD.outer))?_GRD.outer:1.15;
const GRADE_INNER=(_GRD&&Number.isFinite(_GRD.inner))?_GRD.inner:0.18;
const GRADE_MUL=(_GRD&&Number.isFinite(_GRD.mul))?_GRD.mul:1.25;
const GRADE_GRAIN=(_GRD&&Number.isFinite(_GRD.grain))?_GRD.grain:0.03;
const GRADE_GRAINOFF=(_GRD&&Number.isFinite(_GRD.grainOff))?_GRD.grainOff:0.015;
const grade={uniforms:{tDiffuse:{value:null},t:{value:0}},
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:['uniform sampler2D tDiffuse;uniform float t;varying vec2 v;',
   'float rnd(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);}',
   'void main(){vec3 c=texture2D(tDiffuse,v).rgb;float d=length(v-0.5);',
   'c*=smoothstep('+GRADE_OUTER+','+GRADE_INNER+',d*'+GRADE_MUL+');c+=(rnd(v+t)*'+GRADE_GRAIN+'-'+GRADE_GRAINOFF+');gl_FragColor=vec4(c,1.0);}'].join('\n')};
const gradePass=new THREE.ShaderPass(grade);gradePass.renderToScreen=true;composer.addPass(gradePass);

/* V18.491.486 — Lab Studio Orbit ← ORBIT_GESETZ fail-soft; Host none (ORBIT_VIS). BLICK/SCHATTEN/BENCH/exposure/LIFT untouched. */
const _ORB=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.ORBIT_GESETZ)||null;
const ORBIT_DAMP=(_ORB&&Number.isFinite(_ORB.damp))?_ORB.damp:0.08;
const ORBIT_TY=(_ORB&&Number.isFinite(_ORB.ty))?_ORB.ty:0.30;
const ORBIT_MIND=(_ORB&&Number.isFinite(_ORB.minD))?_ORB.minD:0.5;
const ORBIT_MAXD=(_ORB&&Number.isFinite(_ORB.maxD))?_ORB.maxD:4.5;
const ORBIT_POLAR=(_ORB&&Number.isFinite(_ORB.polar))?_ORB.polar:0.95;
const controls=new THREE.OrbitControls(cam,R.domElement);controls.enableDamping=true;controls.dampingFactor=ORBIT_DAMP;
controls.target.set(0,ORBIT_TY,0);controls.minDistance=ORBIT_MIND;controls.maxDistance=ORBIT_MAXD;controls.maxPolarAngle=Math.PI*ORBIT_POLAR;controls.update();
// ════════════════════════════════════════════════════════════════════
// DER KERN-ANSCHLUSS (W-A4a, Studio-Vertrag §7): die generative Substanz (Schnitt-
// Gesetz · Haut/Loft · Ausstattung · Schlagköpfe · Bogen · Rückgrat · Lehren ·
// Gattungen/Traditionen · Aufgaben-Gesetze · Materialien) lebt in
// ../../schmiede-core.js (__schmiedeCore, VOR diesem Skript geladen) — EINE Quelle
// für Shell UND AnazhRealm-Foundry (kein Nachbau; Split-Parität 21/21 hash-bewiesen).
// Die Shell behält Szene/UI/Overlays/Harmonik/Prüfstand und LIEST den Kern.
// ════════════════════════════════════════════════════════════════════
const SC=window.__schmiedeCore;
/* V18.491.570 — Lab Arena popText Warn ← WARNM_GESETZ fail-soft; Host none (WARNM_VIS). ARENAM HUD title / chrome / stam mid left bare (same hex ≠ same law); LIFT untouched. */
const _WRN=(SC&&SC.WARNM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WARNM_GESETZ)||null;
const WARNM_COLOR=(_WRN&&Number.isFinite(_WRN.color))?_WRN.color:0xd4a843;
const WARNM_CSS='#'+WARNM_COLOR.toString(16).padStart(6,'0');
/* V18.491.574 — Lab Arena popText Success/Fail ← TREFFM_GESETZ fail-soft; Host none (TREFFM_VIS). SPEKOM meter ends left bare; HUD verdict wired .576; LIFT untouched. */
const _TRF=(SC&&SC.TREFFM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TREFFM_GESETZ)||null;
const TREFFM_OK=(_TRF&&Number.isFinite(_TRF.ok))?_TRF.ok:0x6fcf73;
const TREFFM_BAD=(_TRF&&Number.isFinite(_TRF.bad))?_TRF.bad:0xd96a4a;
const TREFFM_OK_CSS='#'+TREFFM_OK.toString(16).padStart(6,'0');
const TREFFM_BAD_CSS='#'+TREFFM_BAD.toString(16).padStart(6,'0');
/* V18.491.575 — Lab Arena popText Gold ← GOLDM_GESETZ fail-soft; Host none (GOLDM_VIS). ENTEM.ring0 left bare; HUD-score wired GOLDM; HUD verdict wired TREFFM; reticle → RETIKELM .576; TREFFM/SPEKOM/LIFT untouched. */
const _GLD=(SC&&SC.GOLDM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GOLDM_GESETZ)||null;
const GOLDM_COLOR=(_GLD&&Number.isFinite(_GLD.color))?_GLD.color:0xffe07a;
const GOLDM_CSS='#'+GOLDM_COLOR.toString(16).padStart(6,'0');
/* V18.491.577 — Lab Arena Neutral/Mid Silver ← NEUTM_GESETZ fail-soft; Host none (NEUTM_VIS). arena-hint → HINTM .578; TREFFM/GOLDM/SPEKOM/LIFT untouched. */
const _NEU=(SC&&SC.NEUTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NEUTM_GESETZ)||null;
const NEUTM_COLOR=(_NEU&&Number.isFinite(_NEU.color))?_NEU.color:0x9fb3c8;
const NEUTM_CSS='#'+NEUTM_COLOR.toString(16).padStart(6,'0');
/* V18.491.579 — Lab Arena Player-Danger popText ← GEFAHRM_GESETZ fail-soft; Host none (GEFAHRM_VIS). ≠ TREFFM.bad; #7a7f8c → MISSM .580; #ffae6a → DECKM .581; LIFT untouched. */
const _GFR=(SC&&SC.GEFAHRM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GEFAHRM_GESETZ)||null;
const GEFAHRM_COLOR=(_GFR&&Number.isFinite(_GFR.color))?_GFR.color:0xff6a4a;
const GEFAHRM_CSS='#'+GEFAHRM_COLOR.toString(16).padStart(6,'0');
/* V18.491.580 — Lab Arena Miss/Dud popText ← MISSM_GESETZ fail-soft; Host none (MISSM_VIS). ≠ NEUTM/HINTM; #ffae6a → DECKM .581; LIFT untouched. */
const _MSM=(SC&&SC.MISSM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.MISSM_GESETZ)||null;
const MISSM_COLOR=(_MSM&&Number.isFinite(_MSM.color))?_MSM.color:0x7a7f8c;
const MISSM_CSS='#'+MISSM_COLOR.toString(16).padStart(6,'0');
/* V18.491.581 — Lab Arena Deckung Status popText ← DECKM_GESETZ fail-soft; Host none (DECKM_VIS). ≠ GEFAHRM/GOLDM/WARNM; LIFT untouched. */
const _DCM=(SC&&SC.DECKM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DECKM_GESETZ)||null;
const DECKM_COLOR=(_DCM&&Number.isFinite(_DCM.color))?_DCM.color:0xffae6a;
const DECKM_CSS='#'+DECKM_COLOR.toString(16).padStart(6,'0');
/* V18.491.586 — Lab Arena Near/Invite popText ← INVITEM_GESETZ fail-soft; Host none (INVITEM_VIS). ≠ TREFFM.ok; fuge → FUGEM .587; wucht left bare; LIFT untouched. */
const _INV=(SC&&SC.INVITEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.INVITEM_GESETZ)||null;
const INVITEM_COLOR=(_INV&&Number.isFinite(_INV.color))?_INV.color:0xcfe0a0;
const INVITEM_CSS='#'+INVITEM_COLOR.toString(16).padStart(6,'0');
/* V18.491.587 — Lab Arena Harnisch-Fuge Success ← FUGEM_GESETZ fail-soft; Host none (FUGEM_VIS). ≠ TREFFM.ok/INVITEM; #ffd24a → WUCHTM .588; #9fe0a0 → STICHM .589; LIFT untouched. */
const _FUG=(SC&&SC.FUGEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FUGEM_GESETZ)||null;
const FUGEM_COLOR=(_FUG&&Number.isFinite(_FUG.color))?_FUG.color:0x8fe39a;
const FUGEM_CSS='#'+FUGEM_COLOR.toString(16).padStart(6,'0');
/* V18.491.588 — Lab Arena Wucht/Impact ← WUCHTM_GESETZ fail-soft; Host none (WUCHTM_VIS). ≠ GOLDM/FUGEM; #9fe0a0 → STICHM .589; LIFT untouched. */
const _WUC=(SC&&SC.WUCHTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WUCHTM_GESETZ)||null;
const WUCHTM_COLOR=(_WUC&&Number.isFinite(_WUC.color))?_WUC.color:0xffd24a;
const WUCHTM_CSS='#'+WUCHTM_COLOR.toString(16).padStart(6,'0');
/* V18.491.589 — Lab Arena Stich/Schnitt Success ← STICHM_GESETZ fail-soft; Host none (STICHM_VIS). ≠ FUGEM; #7fe0a0 → SIEGM .590; LIFT untouched. */
const _STH=(SC&&SC.STICHM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STICHM_GESETZ)||null;
const STICHM_COLOR=(_STH&&Number.isFinite(_STH.color))?_STH.color:0x9fe0a0;
const STICHM_CSS='#'+STICHM_COLOR.toString(16).padStart(6,'0');
/* V18.491.590 — Lab Arena Down/Victory ← SIEGM_GESETZ fail-soft; Host none (SIEGM_VIS). ≠ STICHM hit; LIFT untouched. */
const _SIE=(SC&&SC.SIEGM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SIEGM_GESETZ)||null;
const SIEGM_COLOR=(_SIE&&Number.isFinite(_SIE.color))?_SIE.color:0x7fe0a0;
const SIEGM_CSS='#'+SIEGM_COLOR.toString(16).padStart(6,'0');
/* V18.491.591 — Lab Arena Gerät→Spieler Hit ← GERATM_GESETZ fail-soft; Host none (GERATM_VIS). ≠ GEFAHRM; #cdbf9a → GERTTM .592; #ff5a4a → BRUCHM .593; LIFT untouched. */
const _GER=(SC&&SC.GERATM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GERATM_GESETZ)||null;
const GERATM_COLOR=(_GER&&Number.isFinite(_GER.color))?_GER.color:0xff6a6a;
const GERATM_CSS='#'+GERATM_COLOR.toString(16).padStart(6,'0');
/* V18.491.592 — Lab Arena Spieler→Gerät Hit ← GERTTM_GESETZ fail-soft; Host none (GERTTM_VIS). ≠ GERATM; #cd9a6a → DREHTTM .594; #ff5a4a → BRUCHM .593; LIFT untouched. */
const _GTT=(SC&&SC.GERTTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GERTTM_GESETZ)||null;
const GERTTM_COLOR=(_GTT&&Number.isFinite(_GTT.color))?_GTT.color:0xcdbf9a;
const GERTTM_CSS='#'+GERTTM_COLOR.toString(16).padStart(6,'0');
/* V18.491.593 — Lab Arena Deckung-Bruch ← BRUCHM_GESETZ fail-soft; Host none (BRUCHM_VIS). ≠ GEFAHRM/DECKM/GERATM; #cd9a6a → DREHTTM .594; LIFT untouched. */
const _BRU=(SC&&SC.BRUCHM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BRUCHM_GESETZ)||null;
const BRUCHM_COLOR=(_BRU&&Number.isFinite(_BRU.color))?_BRU.color:0xff5a4a;
const BRUCHM_CSS='#'+BRUCHM_COLOR.toString(16).padStart(6,'0');
/* V18.491.594 — Lab Arena Drehbaum-Hit popText ← DREHTTM_GESETZ fail-soft; Host none (DREHTTM_VIS). ≠ GERTTM/DREHM mats; LIFT untouched. */
const _DHT=(SC&&SC.DREHTTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DREHTTM_GESETZ)||null;
const DREHTTM_COLOR=(_DHT&&Number.isFinite(_DHT.color))?_DHT.color:0xcd9a6a;
const DREHTTM_CSS='#'+DREHTTM_COLOR.toString(16).padStart(6,'0');
/* V18.491.595 — Lab Arena Quintain Hit pops ← QUINTHM_GESETZ fail-soft; Host none (QUINTHM_VIS). ≠ QUINTM mats · ≠ LATERNEM.glow coincidence; #ffce6a left bare; LIFT untouched. */
const _QHM=(SC&&SC.QUINTHM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.QUINTHM_GESETZ)||null;
const QUINTHM_SACK=(_QHM&&Number.isFinite(_QHM.sack))?_QHM.sack:0xd8c089;
const QUINTHM_SHIELD=(_QHM&&Number.isFinite(_QHM.shield))?_QHM.shield:0xffd479;
const QUINTHM_SACK_CSS='#'+QUINTHM_SACK.toString(16).padStart(6,'0');
const QUINTHM_SHIELD_CSS='#'+QUINTHM_SHIELD.toString(16).padStart(6,'0');
/* V18.491.596 — Lab Arena Ritter/Kämpfer Rise ← ERHEBM_GESETZ fail-soft; Host none (ERHEBM_VIS). ≠ WUCHTM/GOLDM/QUINTHM.shield; #ff8a6a/#d8c050 left bare; LIFT untouched. */
const _ERE=(SC&&SC.ERHEBM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ERHEBM_GESETZ)||null;
const ERHEBM_COLOR=(_ERE&&Number.isFinite(_ERE.color))?_ERE.color:0xffce6a;
const ERHEBM_CSS='#'+ERHEBM_COLOR.toString(16).padStart(6,'0');
/* V18.491.597 — Lab Arena Drehbaum-Erwischt ← DREHERM_GESETZ fail-soft; Host none (DREHERM_VIS). ≠ GERATM/GEFAHRM/BRUCHM/DREHTTM; #d8c050/#ff8a4a left bare; LIFT untouched. */
const _DHR=(SC&&SC.DREHERM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DREHERM_GESETZ)||null;
const DREHERM_COLOR=(_DHR&&Number.isFinite(_DHR.color))?_DHR.color:0xff8a6a;
const DREHERM_CSS='#'+DREHERM_COLOR.toString(16).padStart(6,'0');
/* V18.491.598 — Lab Arena Clay PULL ← PULLM_GESETZ fail-soft; Host none (PULLM_VIS). ≠ CLOUTM.flag coincidence; #ff8a4a left bare; LIFT untouched. */
const _PLL=(SC&&SC.PULLM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PULLM_GESETZ)||null;
const PULLM_COLOR=(_PLL&&Number.isFinite(_PLL.color))?_PLL.color:0xd8c050;
const PULLM_CSS='#'+PULLM_COLOR.toString(16).padStart(6,'0');
/* V18.491.599 — Lab Arena Streitpuppe-Angriff ← GREIFM_GESETZ fail-soft; Host none (GREIFM_VIS). ≠ DREHERM/GEFAHRM/GERATM/ZIPFELM; #d8b46a Pell left bare; LIFT untouched. */
const _GRF=(SC&&SC.GREIFM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GREIFM_GESETZ)||null;
const GREIFM_COLOR=(_GRF&&Number.isFinite(_GRF.color))?_GRF.color:0xff8a4a;
const GREIFM_CSS='#'+GREIFM_COLOR.toString(16).padStart(6,'0');
/* V18.491.600 — Lab Arena Pell-Hit popText ← PELLTM_GESETZ fail-soft; Host none (PELLTM_VIS). ≠ PELLM mats · ≠ PULLM; LIFT untouched. */
const _PLT=(SC&&SC.PELLTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PELLTM_GESETZ)||null;
const PELLTM_COLOR=(_PLT&&Number.isFinite(_PLT.color))?_PLT.color:0xd8b46a;
const PELLTM_CSS='#'+PELLTM_COLOR.toString(16).padStart(6,'0');
/* V18.491.602 — Lab Arena popText Bubble Chrome ← POPUM_GESETZ fail-soft; Host none (POPUM_VIS). ≠ PANELM/HINTER; drawmeter/reticle rgba left bare; LIFT untouched. */
const _POP=(SC&&SC.POPUM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.POPUM_GESETZ)||null;
const POPUM_SHADOW=(_POP&&Number.isFinite(_POP.shadow))?_POP.shadow:0x000000;
const POPUM_GLOWA=(_POP&&Number.isFinite(_POP.glowA))?_POP.glowA:0.85;
const POPUM_BG=(_POP&&Number.isFinite(_POP.bg))?_POP.bg:0x090705;
const POPUM_BGA=(_POP&&Number.isFinite(_POP.bgA))?_POP.bgA:0.46;
const POPUM_BORDER=(_POP&&Number.isFinite(_POP.border))?_POP.border:0xffffff;
const POPUM_BORDERA=(_POP&&Number.isFinite(_POP.borderA))?_POP.borderA:0.09;
const POPUM_BOXA=(_POP&&Number.isFinite(_POP.boxA))?_POP.boxA:0.4;
const POPUM_SR=(POPUM_SHADOW>>>16)&255,POPUM_SG=(POPUM_SHADOW>>>8)&255,POPUM_SB=POPUM_SHADOW&255;
const POPUM_BR=(POPUM_BG>>>16)&255,POPUM_BG_G=(POPUM_BG>>>8)&255,POPUM_BB=POPUM_BG&255;
const POPUM_BOR=(POPUM_BORDER>>>16)&255,POPUM_BOG=(POPUM_BORDER>>>8)&255,POPUM_BOB=POPUM_BORDER&255;
const POPUM_SHADOW_CSS='#'+POPUM_SHADOW.toString(16).padStart(6,'0');
const POPUM_GLOW_CSS='rgba('+POPUM_SR+','+POPUM_SG+','+POPUM_SB+','+POPUM_GLOWA+')';
const POPUM_BG_CSS='rgba('+POPUM_BR+','+POPUM_BG_G+','+POPUM_BB+','+POPUM_BGA+')';
const POPUM_BORDER_CSS='rgba('+POPUM_BOR+','+POPUM_BOG+','+POPUM_BOB+','+POPUM_BORDERA+')';
const POPUM_BOX_CSS='rgba('+POPUM_SR+','+POPUM_SG+','+POPUM_SB+','+POPUM_BOXA+')';
/* V18.491.603 — Lab Arena Drawmeter Track ← METERBM_GESETZ fail-soft; Host none (METERBM_VIS). ≠ POPUM/PANELM; reticle rgba left bare; LIFT untouched. */
const _MTB=(SC&&SC.METERBM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.METERBM_GESETZ)||null;
const METERBM_COLOR=(_MTB&&Number.isFinite(_MTB.color))?_MTB.color:0x000000;
const METERBM_A=(_MTB&&Number.isFinite(_MTB.a))?_MTB.a:0.45;
const METERBM_R=(METERBM_COLOR>>>16)&255,METERBM_G=(METERBM_COLOR>>>8)&255,METERBM_B=METERBM_COLOR&255;
const METERBM_CSS='rgba('+METERBM_R+','+METERBM_G+','+METERBM_B+','+METERBM_A+')';
/* V18.491.604 — Lab Arena Reticle Ring Border ← RINGRM_GESETZ fail-soft; Host none (RINGRM_VIS). ≠ RETIKELM/POPUM.border/KREISM; LIFT untouched. */
const _RRG=(SC&&SC.RINGRM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RINGRM_GESETZ)||null;
const RINGRM_COLOR=(_RRG&&Number.isFinite(_RRG.color))?_RRG.color:0xffffff;
const RINGRM_A=(_RRG&&Number.isFinite(_RRG.a))?_RRG.a:0.5;
const RINGRM_R=(RINGRM_COLOR>>>16)&255,RINGRM_G=(RINGRM_COLOR>>>8)&255,RINGRM_B=RINGRM_COLOR&255;
const RINGRM_CSS='rgba('+RINGRM_R+','+RINGRM_G+','+RINGRM_B+','+RINGRM_A+')';
/* V18.491.605 — Lab UI Muted Caption Opacity ← MUTEM_GESETZ fail-soft; Host none (MUTEM_VIS). ≠ RINGRM/SCHLEIER; befund .65 + stam .85/.25 left bare; LIFT untouched. */
const _MUT=(SC&&SC.MUTEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.MUTEM_GESETZ)||null;
const MUTEM_A=(_MUT&&Number.isFinite(_MUT.a))?_MUT.a:0.6;
const MUTEM_CSS='opacity:'+MUTEM_A;
/* V18.491.606 — Lab Befund Intent Caption Opacity ← LEISEM_GESETZ fail-soft; Host none (LEISEM_VIS). ≠ MUTEM; HUD .7/.85/.25 left bare; LIFT untouched. */
const _LIS=(SC&&SC.LEISEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEISEM_GESETZ)||null;
const LEISEM_A=(_LIS&&Number.isFinite(_LIS.a))?_LIS.a:0.65;
const LEISEM_CSS='opacity:'+LEISEM_A;
/* V18.491.607 — Lab Arena HUD Stats Caption ← STATSM_GESETZ fail-soft; Host none (STATSM_VIS). ≠ MUTEM/LEISEM; stam .85/.25 left bare; LIFT untouched. */
const _STS=(SC&&SC.STATSM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STATSM_GESETZ)||null;
const STATSM_A=(_STS&&Number.isFinite(_STS.a))?_STS.a:0.7;
const STATSM_CSS='opacity:'+STATSM_A;
/* V18.491.608 — Lab Arena HUD Ausdauer Label ← AUSDM_GESETZ fail-soft; Host none (AUSDM_VIS). ≠ MUTEM/LEISEM/STATSM/SCHIEB; stam empty .25 + thresholds left bare; LIFT untouched. */
const _ADM=(SC&&SC.AUSDM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.AUSDM_GESETZ)||null;
const AUSDM_A=(_ADM&&Number.isFinite(_ADM.a))?_ADM.a:0.85;
const AUSDM_CSS='opacity:'+AUSDM_A;
/* V18.491.609 — Lab Arena HUD Ausdauer leere Leiste ← LEERM_GESETZ fail-soft; Host none (LEERM_VIS). ≠ AUSDM .85; stam thresholds 0.5/0.25 left bare; LIFT untouched. */
const _LER=(SC&&SC.LEERM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEERM_GESETZ)||null;
const LEERM_A=(_LER&&Number.isFinite(_LER.a))?_LER.a:0.25;
const LEERM_CSS='opacity:'+LEERM_A;
/* V18.491.610 — Lab Arena Pell-Station Position ← PELLPOS_GESETZ fail-soft; Host none (PELLPOS_VIS). ≠ PELL geo/PELLM/AUFSTELL/HOF; other station Vector3 left bare; LIFT untouched. */
const _PPS=(SC&&SC.PELLPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PELLPOS_GESETZ)||null;
const PELLPOS_X=(_PPS&&Number.isFinite(_PPS.x))?_PPS.x:4.0;
const PELLPOS_Y=(_PPS&&Number.isFinite(_PPS.y))?_PPS.y:0;
const PELLPOS_Z=(_PPS&&Number.isFinite(_PPS.z))?_PPS.z:5.0;
/* V18.491.611 — Lab Arena Waffentisch-Station Position ← WAFFTISCHPOS_GESETZ fail-soft; Host none (WAFFTISCHPOS_VIS). ≠ TISCH/TISCHM/RACK/PELLPOS; other station Vector3 left bare; LIFT untouched. */
const _WTP=(SC&&SC.WAFFTISCHPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WAFFTISCHPOS_GESETZ)||null;
const WAFFTISCHPOS_X=(_WTP&&Number.isFinite(_WTP.x))?_WTP.x:-3.0;
const WAFFTISCHPOS_Y=(_WTP&&Number.isFinite(_WTP.y))?_WTP.y:0;
const WAFFTISCHPOS_Z=(_WTP&&Number.isFinite(_WTP.z))?_WTP.z:0;
/* V18.491.612 — Lab Arena Stechringe-Station Position ← STECHPOS_GESETZ fail-soft; Host none (STECHPOS_VIS). ≠ STECH geo/STECHM/STECHF/PELLPOS; other station Vector3 left bare; LIFT untouched. */
const _SCP=(SC&&SC.STECHPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STECHPOS_GESETZ)||null;
const STECHPOS_X=(_SCP&&Number.isFinite(_SCP.x))?_SCP.x:8.5;
const STECHPOS_Y=(_SCP&&Number.isFinite(_SCP.y))?_SCP.y:0;
const STECHPOS_Z=(_SCP&&Number.isFinite(_SCP.z))?_SCP.z:5.0;
/* V18.491.613 — Lab Arena Quintane-Station Position ← QUINTPOS_GESETZ fail-soft; Host none (QUINTPOS_VIS). ≠ QUINT geo/QUINTM/QUINTHM/PELLPOS; other station Vector3 left bare; LIFT untouched. */
const _QTP=(SC&&SC.QUINTPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.QUINTPOS_GESETZ)||null;
const QUINTPOS_X=(_QTP&&Number.isFinite(_QTP.x))?_QTP.x:4.0;
const QUINTPOS_Y=(_QTP&&Number.isFinite(_QTP.y))?_QTP.y:0;
const QUINTPOS_Z=(_QTP&&Number.isFinite(_QTP.z))?_QTP.z:10.5;
/* V18.491.614 — Lab Arena Pendel-Kugel-Station Position ← PENDELPOS_GESETZ fail-soft; Host none (PENDELPOS_VIS). ≠ PENDEL geo/PENDELM/Pendel-Gasse; other station Vector3 left bare; LIFT untouched. */
const _PDP=(SC&&SC.PENDELPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PENDELPOS_GESETZ)||null;
const PENDELPOS_X=(_PDP&&Number.isFinite(_PDP.x))?_PDP.x:9.0;
const PENDELPOS_Y=(_PDP&&Number.isFinite(_PDP.y))?_PDP.y:0;
const PENDELPOS_Z=(_PDP&&Number.isFinite(_PDP.z))?_PDP.z:10.0;
/* V18.491.615 — Lab Arena Drehbaum-Station Position ← DREHPOS_GESETZ fail-soft; Host none (DREHPOS_VIS). ≠ DREH geo/DREHM/DREHTTM/DREHERM; 8.5 coincidence; other station Vector3 left bare; LIFT untouched. */
const _DRP=(SC&&SC.DREHPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DREHPOS_GESETZ)||null;
const DREHPOS_X=(_DRP&&Number.isFinite(_DRP.x))?_DRP.x:1.0;
const DREHPOS_Y=(_DRP&&Number.isFinite(_DRP.y))?_DRP.y:0;
const DREHPOS_Z=(_DRP&&Number.isFinite(_DRP.z))?_DRP.z:8.5;
/* V18.491.616 — Lab Arena Federpfahl-Station Position ← FEDERPOS_GESETZ fail-soft; Host none (FEDERPOS_VIS). ≠ FEDER logic/FEDERM/PELLPOS; other station Vector3 left bare; LIFT untouched. */
const _FDP=(SC&&SC.FEDERPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FEDERPOS_GESETZ)||null;
const FEDERPOS_X=(_FDP&&Number.isFinite(_FDP.x))?_FDP.x:2.0;
const FEDERPOS_Y=(_FDP&&Number.isFinite(_FDP.y))?_FDP.y:0;
const FEDERPOS_Z=(_FDP&&Number.isFinite(_FDP.z))?_FDP.z:2.5;
/* V18.491.617 — Lab Arena Trefferfolge-Station Position ← SEQPOS_GESETZ fail-soft; Host none (SEQPOS_VIS). ≠ FOLGE logic/PAD geo/FOLGEM; other station Vector3 left bare; LIFT untouched. */
const _SQP=(SC&&SC.SEQPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SEQPOS_GESETZ)||null;
const SEQPOS_X=(_SQP&&Number.isFinite(_SQP.x))?_SQP.x:-6.0;
const SEQPOS_Y=(_SQP&&Number.isFinite(_SQP.y))?_SQP.y:0;
const SEQPOS_Z=(_SQP&&Number.isFinite(_SQP.z))?_SQP.z:13.0;
/* V18.491.618 — Lab Arena Streitpuppe-Station Position ← CHARGEPOS_GESETZ fail-soft; Host none (CHARGEPOS_VIS). ≠ STREIT logic/STREITM/GREIFM; home stays pos.clone(); other station Vector3 left bare; LIFT untouched. */
const _CHP=(SC&&SC.CHARGEPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.CHARGEPOS_GESETZ)||null;
const CHARGEPOS_X=(_CHP&&Number.isFinite(_CHP.x))?_CHP.x:5.0;
const CHARGEPOS_Y=(_CHP&&Number.isFinite(_CHP.y))?_CHP.y:0;
const CHARGEPOS_Z=(_CHP&&Number.isFinite(_CHP.z))?_CHP.z:19.0;
/* V18.491.619 — Lab Arena Pendel-Gasse-Station Position ← GASSEPOS_GESETZ fail-soft; Host none (GASSEPOS_VIS). ≠ GASSE logic/GASSEM/PENDELPOS; other station Vector3 left bare; LIFT untouched. */
const _GSP=(SC&&SC.GASSEPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GASSEPOS_GESETZ)||null;
const GASSEPOS_X=(_GSP&&Number.isFinite(_GSP.x))?_GSP.x:10.0;
const GASSEPOS_Y=(_GSP&&Number.isFinite(_GSP.y))?_GSP.y:0;
const GASSEPOS_Z=(_GSP&&Number.isFinite(_GSP.z))?_GSP.z:18.0;
/* V18.491.620 — Lab Arena Bambus-Stand-Station Position ← BAMBUSPOS_GESETZ fail-soft; Host none (BAMBUSPOS_VIS). ≠ BAMBUS stand/SOCKEL/PELLPOS/QUINTPOS; Schnittgasse + other station Vector3 left bare; LIFT untouched. */
const _BBP=(SC&&SC.BAMBUSPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BAMBUSPOS_GESETZ)||null;
const BAMBUSPOS_X=(_BBP&&Number.isFinite(_BBP.x))?_BBP.x:4.0;
const BAMBUSPOS_Y=(_BBP&&Number.isFinite(_BBP.y))?_BBP.y:0;
const BAMBUSPOS_Z=(_BBP&&Number.isFinite(_BBP.z))?_BBP.z:-5.0;
/* V18.491.621 — Lab Arena Schnittgasse-Station Position ← SCHNITTPOS_GESETZ fail-soft; Host none (SCHNITTPOS_VIS). ≠ SCHNITT layout/SCHWELLE/STECHPOS/BAMBUSPOS; other station Vector3 left bare; LIFT untouched. */
const _SNP=(SC&&SC.SCHNITTPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHNITTPOS_GESETZ)||null;
const SCHNITTPOS_X=(_SNP&&Number.isFinite(_SNP.x))?_SNP.x:8.5;
const SCHNITTPOS_Y=(_SNP&&Number.isFinite(_SNP.y))?_SNP.y:0;
const SCHNITTPOS_Z=(_SNP&&Number.isFinite(_SNP.z))?_SNP.z:-5.0;
/* V18.491.622 — Lab Arena schwingende Tatami-Station Position ← TATAMIPOS_GESETZ fail-soft; Host none (TATAMIPOS_VIS). ≠ TATAMI logic/GALGEN/TATAMIM; x 4.0 coincidence; other station Vector3 left bare; LIFT untouched. */
const _TTP=(SC&&SC.TATAMIPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TATAMIPOS_GESETZ)||null;
const TATAMIPOS_X=(_TTP&&Number.isFinite(_TTP.x))?_TTP.x:4.0;
const TATAMIPOS_Y=(_TTP&&Number.isFinite(_TTP.y))?_TTP.y:0;
const TATAMIPOS_Z=(_TTP&&Number.isFinite(_TTP.z))?_TTP.z:-10.0;
/* V18.491.623 — Lab Arena Harnisch-Puppe-Station Position ← HARNISCHPOS_GESETZ fail-soft; Host none (HARNISCHPOS_VIS). ≠ HARNISCH logic/HARNISCHM/GASSEPOS; Ritter-Arenen + other station Vector3 left bare; LIFT untouched. */
const _HNP=(SC&&SC.HARNISCHPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HARNISCHPOS_GESETZ)||null;
const HARNISCHPOS_X=(_HNP&&Number.isFinite(_HNP.x))?_HNP.x:10.0;
const HARNISCHPOS_Y=(_HNP&&Number.isFinite(_HNP.y))?_HNP.y:0;
const HARNISCHPOS_Z=(_HNP&&Number.isFinite(_HNP.z))?_HNP.z:-9.0;
/* V18.491.624 — Lab Arena Kirmes-Enten-Station Position ← KIRMESPOS_GESETZ fail-soft; Host none (KIRMESPOS_VIS). ≠ KIRMES logic/PFAD/BAHN (no Fake-Wire); Torii + Ritter-Arenen left bare; LIFT untouched. */
const _KMP=(SC&&SC.KIRMESPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KIRMESPOS_GESETZ)||null;
const KIRMESPOS_X=(_KMP&&Number.isFinite(_KMP.x))?_KMP.x:36;
const KIRMESPOS_Y=(_KMP&&Number.isFinite(_KMP.y))?_KMP.y:0;
const KIRMESPOS_Z=(_KMP&&Number.isFinite(_KMP.z))?_KMP.z:0;
/* V18.491.625 — Lab Arena Torii Position ← TORIIPOS_GESETZ fail-soft; Host none (TORIIPOS_VIS). ≠ TORII geo/TORIIM/TORP/BAHN/PFAD (no Fake-Wire); Ritter-Arenen left bare; LIFT untouched. */
const _TIP=(SC&&SC.TORIIPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TORIIPOS_GESETZ)||null;
const TORIIPOS_X=(_TIP&&Number.isFinite(_TIP.x))?_TIP.x:13.0;
const TORIIPOS_Z=(_TIP&&Number.isFinite(_TIP.z))?_TIP.z:0.0;
/* V18.491.626 — Lab Arena Ritter-Arenen Positions ← RITTERPOS_GESETZ fail-soft; Host none (RITTERPOS_VIS). ≠ AUFSTELL/RITTER (no Fake-Wire); count 3/2 + armored flag left bare; LIFT untouched. */
const _RTP=(SC&&SC.RITTERPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RITTERPOS_GESETZ)||null;
const RITTERPOS_ARMX=(_RTP&&Number.isFinite(_RTP.armX))?_RTP.armX:6;
const RITTERPOS_ARMY=(_RTP&&Number.isFinite(_RTP.armY))?_RTP.armY:0;
const RITTERPOS_ARMZ=(_RTP&&Number.isFinite(_RTP.armZ))?_RTP.armZ:-18.5;
const RITTERPOS_BAREX=(_RTP&&Number.isFinite(_RTP.bareX))?_RTP.bareX:-7;
const RITTERPOS_BAREY=(_RTP&&Number.isFinite(_RTP.bareY))?_RTP.bareY:0;
const RITTERPOS_BAREZ=(_RTP&&Number.isFinite(_RTP.bareZ))?_RTP.bareZ:-18.5;
/* V18.491.627 — Lab Arena Wand-Schiessen-Station Position ← WANDPOS_GESETZ fail-soft; Host none (WANDPOS_VIS). ≠ WAND H/WANDM (no Fake-Wire); Clout/Wurfscheibe/Pendelziel/Papagei-Feld left bare; LIFT untouched. */
const _WDP=(SC&&SC.WANDPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WANDPOS_GESETZ)||null;
const WANDPOS_X=(_WDP&&Number.isFinite(_WDP.x))?_WDP.x:20;
const WANDPOS_Y=(_WDP&&Number.isFinite(_WDP.y))?_WDP.y:0;
const WANDPOS_Z=(_WDP&&Number.isFinite(_WDP.z))?_WDP.z:3.0;
/* V18.491.628 — Lab Arena Clout-Station Position ← CLOUTPOS_GESETZ fail-soft; Host none (CLOUTPOS_VIS). ≠ CLOUT/CLOUTM (no Fake-Wire); Wurfscheibe/Pendelziel/Papagei-Feld left bare; LIFT untouched. */
const _CLP=(SC&&SC.CLOUTPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.CLOUTPOS_GESETZ)||null;
const CLOUTPOS_X=(_CLP&&Number.isFinite(_CLP.x))?_CLP.x:38;
const CLOUTPOS_Y=(_CLP&&Number.isFinite(_CLP.y))?_CLP.y:0;
const CLOUTPOS_Z=(_CLP&&Number.isFinite(_CLP.z))?_CLP.z:7;
/* V18.491.629 — Lab Arena Wurfscheibe-Station Position ← CLAYPOS_GESETZ fail-soft; Host none (CLAYPOS_VIS). ≠ TON logic/TONM (no Fake-Wire); Pendelziel/Papagei-Feld left bare; LIFT untouched. */
const _CYP=(SC&&SC.CLAYPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.CLAYPOS_GESETZ)||null;
const CLAYPOS_X=(_CYP&&Number.isFinite(_CYP.x))?_CYP.x:23;
const CLAYPOS_Y=(_CYP&&Number.isFinite(_CYP.y))?_CYP.y:0;
const CLAYPOS_Z=(_CYP&&Number.isFinite(_CYP.z))?_CYP.z:-8;
/* V18.491.630 — Lab Arena Pendelziel-Station Position ← SWINGPOS_GESETZ fail-soft; Host none (SWINGPOS_VIS). ≠ SCHAUKEL/SCHAUKELM/ZIELP/PENDELPOS (no Fake-Wire); Papagei-Feld left bare; LIFT untouched. */
const _SWP=(SC&&SC.SWINGPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SWINGPOS_GESETZ)||null;
const SWINGPOS_X=(_SWP&&Number.isFinite(_SWP.x))?_SWP.x:30;
const SWINGPOS_Y=(_SWP&&Number.isFinite(_SWP.y))?_SWP.y:0;
const SWINGPOS_Z=(_SWP&&Number.isFinite(_SWP.z))?_SWP.z:4;
/* V18.491.631 — Lab Arena Papagei-Feld Positions ← PAPAGEIPOS_GESETZ fail-soft (exactly 4 finite x/z pairs, else whole FALLBACK); Host none (PAPAGEIPOS_VIS). ≠ PAPAGEI/PAPAGEIM/CLAYPOS/CLOUTPOS; y stays 0; LIFT untouched. */
const _PGP=(SC&&SC.PAPAGEIPOS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PAPAGEIPOS_GESETZ)||null;
const PAPAGEIPOS_FALLBACK=[[16,8],[22,-8],[28,7],[33,-6]];
function _papageiSpotsOk(s){if(!Array.isArray(s)||s.length!==4)return false;for(const r of s){if(!Array.isArray(r)||r.length!==2)return false;for(const v of r)if(!Number.isFinite(v))return false;}return true;}
const PAPAGEIPOS_SPOTS=(_PGP&&_papageiSpotsOk(_PGP.spots))?_PGP.spots.map(r=>r.slice()):PAPAGEIPOS_FALLBACK.map(r=>r.slice());
const M=SC.materials();   // die geteilten Materialien (byte-treu im Kern; nie disposen)
const {box,cyl,B,sectionAt,sectionMoments,curveY,RHO,hnoise,
       buildPommel,buildGuard,buildGrip,buildHaft,buildHead,buildBogen,
       stations,measure,evalLehren,befund,
       PARAMS_BLADE,PARAMS_IMPACT,GATTUNGEN,TRADITIONEN,snapBases,shapeByTradition,
       ZIELMAT,tradWerkstoff,applyTask,griffD,intentControl}=SC;
const buildWeaponModel=(name)=>SC.buildWeaponModel(name);   // Kern-Tradition folgt via SC.setTradition
const loftBlade=(P,S)=>SC.loftBlade(P,S,bladeMat);          // NAHT: der Stahl/Roh-Umschalter bleibt Shell-Zustand
let bladeMat=M.steel; // umschaltbar Stahl/Roh

// ── Geometrie-Helfer (wie B/C in der Karosseriebasis) ──
// box/cyl/B leben im Kern (__schmiedeCore, oben aliast) — dot/seg/polyline/ringMesh/tube/label/caliper bleiben Shell (Overlays).
/* V18.491.451 — Lab Lehren/Spine-Punkte ← PUNKT_GESETZ fail-soft; Host none (PUNKT_VIS). FLACH/HAND/KIESEL/LIFT untouched. */
const _PUN=(SC&&SC.PUNKT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PUNKT_GESETZ)||null;
const PUNKT_STATION=(_PUN&&Number.isFinite(_PUN.station))?_PUN.station:0.009;
const PUNKT_MARK=(_PUN&&Number.isFinite(_PUN.mark))?_PUN.mark:0.013;
/* V18.491.452 — Lab default/cutcard Dot ← TUPF_GESETZ fail-soft; Host none (TUPF_VIS). PUNKT/HAND/FLACH/LIFT untouched; streu left bare. */
const _TUP=(SC&&SC.TUPF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TUPF_GESETZ)||null;
const TUPF_R=(_TUP&&Number.isFinite(_TUP.r))?_TUP.r:0.008;
function dot(p,m,r){const e=new THREE.Mesh(new THREE.SphereGeometry(r||TUPF_R,16,12),m);e.position.set(p[0],p[1],p[2]);return e;}
function seg(a,b,m){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);return new THREE.Line(g,m);}
function polyline(pts,m){const g=new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(...p)));return new THREE.Line(g,m);}
/* V18.491.457 — Lab Overlay ringMesh tube ← SCHLAUCH_GESETZ fail-soft; Host none (SCHLAUCH_VIS). ZITTER/ROHR/HAND/TUPF/LIFT untouched; Zielscheibe face 0.004 left bare. */
const _SLC=(SC&&SC.SCHLAUCH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHLAUCH_GESETZ)||null;
const SCHLAUCH_TUBE=(_SLC&&Number.isFinite(_SLC.tube))?_SLC.tube:0.004;
function ringMesh(rad,tube,m){const e=new THREE.Mesh(new THREE.TorusGeometry(rad,tube||SCHLAUCH_TUBE,10,32),m);return e;}
// Achs-Zylinder (a→b), beliebige Richtung
function tube(a,b,r,m,seg){const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b);const d=new THREE.Vector3().subVectors(Bv,A);const len=d.length();
  const e=cyl(r,r,len,m,seg||16);e.position.copy(A).addScaledVector(d,0.5);e.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return e;}

// ── Text-Label als Sprite (für Maßlinien & Stationen) ──
/* V18.491.501 — Lab Overlay Label ← ETIK_GESETZ fail-soft; Host none (ETIK_VIS). NAHTM/PELLM/STREUM/SCHILD/LIFT untouched; caliper left bare. */
const _ETK=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.ETIK_GESETZ)||(typeof SC!=="undefined"&&SC&&SC.ETIK_GESETZ)||null;
const ETIK_SCALE=(_ETK&&Number.isFinite(_ETK.scale))?_ETK.scale:0.05;
const ETIK_FS=(_ETK&&Number.isFinite(_ETK.fs))?_ETK.fs:44;
const ETIK_PAD=(_ETK&&Number.isFinite(_ETK.pad))?_ETK.pad:10;
const ETIK_R=(_ETK&&Number.isFinite(_ETK.r))?_ETK.r:10;
const ETIK_G=(_ETK&&Number.isFinite(_ETK.g))?_ETK.g:7;
const ETIK_B=(_ETK&&Number.isFinite(_ETK.b))?_ETK.b:5;
const ETIK_A=(_ETK&&Number.isFinite(_ETK.a))?_ETK.a:0.80;
const ETIK_RR=(_ETK&&Number.isFinite(_ETK.rr))?_ETK.rr:11;
function label(text,hex,scale){scale=scale||ETIK_SCALE;
  const fs=ETIK_FS,pad=ETIK_PAD;const cv=document.createElement('canvas');const cx=cv.getContext('2d');
  cx.font='600 '+fs+'px ui-monospace,Menlo,monospace';const w=cx.measureText(text).width;
  cv.width=w+pad*2;cv.height=fs+pad*2;cx.font='600 '+fs+'px ui-monospace,Menlo,monospace';
  cx.fillStyle='rgba('+ETIK_R+','+ETIK_G+','+ETIK_B+','+ETIK_A+')';const rr=ETIK_RR;cx.beginPath();
  cx.moveTo(rr,0);cx.arcTo(cv.width,0,cv.width,cv.height,rr);cx.arcTo(cv.width,cv.height,0,cv.height,rr);
  cx.arcTo(0,cv.height,0,0,rr);cx.arcTo(0,0,cv.width,0,rr);cx.fill();
  cx.fillStyle=hex;cx.textBaseline='middle';cx.fillText(text,pad,cv.height/2+2);
  const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  sp.scale.set(cv.width/cv.height*scale,scale,1);sp.renderOrder=999;return sp;}
// Maßlinie (Caliper): Linie a→b mit End-Häkchen + Label  (analog buildCalipers)
/* V18.491.502 — Lab Overlay Caliper ← SCHIEB_GESETZ fail-soft; Host none (SCHIEB_VIS). ETIK/NAHTM/PELLM/LIFT untouched. */
const _SHB=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.SCHIEB_GESETZ)||(typeof SC!=="undefined"&&SC&&SC.SCHIEB_GESETZ)||null;
const SCHIEB_OP=(_SHB&&Number.isFinite(_SHB.opacity))?_SHB.opacity:0.85;
const SCHIEB_TICK=(_SHB&&Number.isFinite(_SHB.tick))?_SHB.tick:0.012;
const SCHIEB_LABSC=(_SHB&&Number.isFinite(_SHB.labScale))?_SHB.labScale:0.046;
const SCHIEB_LABY=(_SHB&&Number.isFinite(_SHB.labY))?_SHB.labY:0.045;
function caliper(a,b,hex,text){const g=new THREE.Group();
  const lm=new THREE.LineBasicMaterial({color:hex,transparent:true,opacity:SCHIEB_OP});
  g.add(seg(a,b,lm));
  const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),up=new THREE.Vector3(0,SCHIEB_TICK,0);
  g.add(seg([a[0],a[1]-SCHIEB_TICK,a[2]],[a[0],a[1]+SCHIEB_TICK,a[2]],lm));
  g.add(seg([b[0],b[1]-SCHIEB_TICK,b[2]],[b[0],b[1]+SCHIEB_TICK,b[2]],lm));
  const mid=A.clone().add(Bv).multiplyScalar(0.5);
  const lb=label(text,'#'+hex.toString(16).padStart(6,'0'),SCHIEB_LABSC);lb.position.set(mid.x,mid.y+SCHIEB_LABY,mid.z);g.add(lb);
  return g;}

// DAS GESETZ · DER QUERSCHNITT (halfH/sectionAt/sectionMoments/curveY/RHO) — lebt im Kern (__schmiedeCore).

// LOFT + DIE HAUT (hnoise/pbrHaut/stahlHaut/loftBlade) — lebt im Kern (__schmiedeCore; loftBlade oben als
// Alias mit dem Shell-bladeMat verdrahtet).

// AUSSTATTUNG (latheX/accentMat/wrapMat/buildPommel/buildGuard/buildGrip) — lebt im Kern (__schmiedeCore).

// SCHLAGKÖPFE-Basis (holzHaut/woodColors/buildHaft/latheZ/spikeZ) — lebt im Kern (__schmiedeCore).

// GESCHMIEDETES BLATT (bitField/forgeBit/leafFlange) + BOGEN (buildBogen) — leben im Kern (__schmiedeCore).

// ════════════════════════════════════════════════════════════════════
// PRÜFSTAND — Geometrie: Fechtpuppe (Pell), Zielscheibe, Pfeil
// ════════════════════════════════════════════════════════════════════
function matCol(hex,rough,metal){const m=new THREE.MeshStandardMaterial({color:hex,roughness:rough!=null?rough:0.8,metalness:metal||0});if(m.color)m.color._metal=metal||0;return m;}
// — Fechtpuppe: Pfosten + strohgestopfter Rumpf + Lederkopf + Stummelarme. Trefferzonen in userData. —
/* V18.491.288 — Lab straw pell ← PELL_GESETZ fail-soft; Host none (PELL_VIS). HARNISCH / FEDER / LIFT untouched. */
const _PLG=(SC&&SC.PELL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PELL_GESETZ)||null;
const PELL_POSTH=(_PLG&&Number.isFinite(_PLG.postH))?_PLG.postH:1.65;
const PELL_TORSOY=(_PLG&&Number.isFinite(_PLG.torsoY))?_PLG.torsoY:1.12;
const PELL_TORSOH=(_PLG&&Number.isFinite(_PLG.torsoH))?_PLG.torsoH:0.62;
const PELL_TORSOR=(_PLG&&Number.isFinite(_PLG.torsoR))?_PLG.torsoR:0.17;
/* V18.491.383 — Lab straw-pell spine post ← DORN_GESETZ fail-soft; Host none (DORN_VIS). PELL.H · STAB R0 coincidence · PFOST/PAD/PFAHL/STEHER/SAULE/STANGE/MAST/FUSS/ARM/LIFT untouched. */
const _DOR=(SC&&SC.DORN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DORN_GESETZ)||null;
const DORN_R0=(_DOR&&Number.isFinite(_DOR.R0))?_DOR.R0:0.035;
const DORN_R1=(_DOR&&Number.isFinite(_DOR.R1))?_DOR.R1:0.05;
/* V18.491.384 — Lab straw-pell Kreuzfuß ← KREUZ_GESETZ fail-soft; Host none (KREUZ_VIS). DORN/FUSS/SOCKEL/STAND/PODES/PLINT/TELLER/SPARREN/LIFT untouched. */
const _KRZ=(SC&&SC.KREUZ_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KREUZ_GESETZ)||null;
const KREUZ_R0=(_KRZ&&Number.isFinite(_KRZ.R0))?_KRZ.R0:0.02;
const KREUZ_R1=(_KRZ&&Number.isFinite(_KRZ.R1))?_KRZ.R1:0.025;
const KREUZ_H=(_KRZ&&Number.isFinite(_KRZ.H))?_KRZ.H:0.5;
const KREUZ_RAD=(_KRZ&&Number.isFinite(_KRZ.rad))?_KRZ.rad:0.16;
const KREUZ_Y=(_KRZ&&Number.isFinite(_KRZ.y))?_KRZ.y:0.04;
const KREUZ_TILT=(_KRZ&&Number.isFinite(_KRZ.tilt))?_KRZ.tilt:0.5;
/* V18.491.385 — Lab straw-pell Stummelarm ← STUMMEL_GESETZ fail-soft; Host none (STUMMEL_VIS). ARM/OBERARM/BEIN/DORN/KREUZ/STANGE/STUTZE/LIFT untouched; aring next. */
const _STM=(SC&&SC.STUMMEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STUMMEL_GESETZ)||null;
const STUMMEL_R0=(_STM&&Number.isFinite(_STM.R0))?_STM.R0:0.05;
const STUMMEL_R1=(_STM&&Number.isFinite(_STM.R1))?_STM.R1:0.06;
const STUMMEL_H=(_STM&&Number.isFinite(_STM.H))?_STM.H:0.34;
const STUMMEL_ZOFF=(_STM&&Number.isFinite(_STM.zOff))?_STM.zOff:0.22;
const STUMMEL_YOFF=(_STM&&Number.isFinite(_STM.yOff))?_STM.yOff:0.05;
const STUMMEL_ROTX=(_STM&&Number.isFinite(_STM.rotX))?_STM.rotX:0.5;
/* V18.491.386 — Lab straw-pell Arm-Seilring ← SCHLINGE_GESETZ fail-soft; Host none (SCHLINGE_VIS). SEIL/RING/REIF/MUFFE/STUMMEL/ARM/TORII/LIFT untouched. */
const _SLG=(SC&&SC.SCHLINGE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHLINGE_GESETZ)||null;
const SCHLINGE_R=(_SLG&&Number.isFinite(_SLG.R))?_SLG.R:0.052;
const SCHLINGE_TUBE=(_SLG&&Number.isFinite(_SLG.tube))?_SLG.tube:0.01;
const SCHLINGE_ZOFF=(_SLG&&Number.isFinite(_SLG.zOff))?_SLG.zOff:0.30;
const SCHLINGE_YOFF=(_SLG&&Number.isFinite(_SLG.yOff))?_SLG.yOff:0.12;
/* V18.491.387 — Lab straw-pell Hals ← KEHLE_GESETZ fail-soft; Host none (KEHLE_VIS). HALS/NACKEN/SCHLINGE/STUMMEL/DORN/KOPF/LIFT untouched. */
const _KEH=(SC&&SC.KEHLE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KEHLE_GESETZ)||null;
const KEHLE_R0=(_KEH&&Number.isFinite(_KEH.R0))?_KEH.R0:0.05;
const KEHLE_R1=(_KEH&&Number.isFinite(_KEH.R1))?_KEH.R1:0.07;
const KEHLE_H=(_KEH&&Number.isFinite(_KEH.H))?_KEH.H:0.10;
const KEHLE_YOFF=(_KEH&&Number.isFinite(_KEH.yOff))?_KEH.yOff:0.05;
/* V18.491.388 — Lab straw-pell Kopf ← BIRNE_GESETZ fail-soft; Host none (BIRNE_VIS). KOPF/SCHAEDEL/KEHLE/HELM/HAUBE/LIFT untouched; seam Torus stays bare. */
const _BIR=(SC&&SC.BIRNE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BIRNE_GESETZ)||null;
const BIRNE_R=(_BIR&&Number.isFinite(_BIR.R))?_BIR.R:0.135;
const BIRNE_SCALEY=(_BIR&&Number.isFinite(_BIR.scaleY))?_BIR.scaleY:1.12;
const BIRNE_YOFF=(_BIR&&Number.isFinite(_BIR.yOff))?_BIR.yOff:0.20;
/* V18.491.389 — Lab straw-pell Kopf-Naht ← NAHT_GESETZ fail-soft; Host none (NAHT_VIS). BIRNE.R coinc · SCHLINGE/RING/REIF/MUFFE/NAHE/LIFT untouched. */
const _NHT=(SC&&SC.NAHT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NAHT_GESETZ)||null;
const NAHT_R=(_NHT&&Number.isFinite(_NHT.R))?_NHT.R:0.135;
const NAHT_TUBE=(_NHT&&Number.isFinite(_NHT.tube))?_NHT.tube:0.006;
const NAHT_R1=(_NHT&&Number.isFinite(_NHT.R1))?_NHT.R1:0.118;
const NAHT_TUBE1=(_NHT&&Number.isFinite(_NHT.tube1))?_NHT.tube1:0.005;
/* V18.491.390 — Lab straw-pell Rumpf-Seilringe ← GURT_GESETZ fail-soft; Host none (GURT_VIS). SCHLINGE/NAHT/RING/REIF/MUFFE/BAND/BIRNE/LIFT untouched. */
const GURT_YS_FALLBACK=[0.22,0.02,-0.20];
const _GUR=(SC&&SC.GURT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GURT_GESETZ)||null;
const GURT_MUL=(_GUR&&Number.isFinite(_GUR.mul))?_GUR.mul:1.01;
const GURT_TUBE=(_GUR&&Number.isFinite(_GUR.tube))?_GUR.tube:0.012;
const GURT_YS=(_GUR&&Array.isArray(_GUR.ys)&&_GUR.ys.length===3&&_GUR.ys.every(function(y){return Number.isFinite(y);}))
  ?_GUR.ys.slice()
  :GURT_YS_FALLBACK.slice();
/* V18.491.391 — Lab straw-pell Rumpf-Taper ← KEGEL_GESETZ fail-soft; Host none (KEGEL_VIS). GURT/RUMPF/LEIB/STUMMEL/DORN/PELL/LIFT untouched. */
const _KEG=(SC&&SC.KEGEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KEGEL_GESETZ)||null;
const KEGEL_MUL=(_KEG&&Number.isFinite(_KEG.mul))?_KEG.mul:0.92;
/* V18.491.392 — Lab straw-pell Schulter-Ansatz ← ANSATZ_GESETZ fail-soft; Host none (ANSATZ_VIS). SCHULTER/ACHSEL/KEGEL/GURT/STUMMEL/LIFT untouched. */
const _ANS=(SC&&SC.ANSATZ_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ANSATZ_GESETZ)||null;
const ANSATZ_YOFF=(_ANS&&Number.isFinite(_ANS.yOff))?_ANS.yOff:0.26;
/* V18.491.393 — Lab straw-pell ReachX ← REICH_GESETZ fail-soft; Host none (REICH_VIS). ANSATZ/STUMMEL/ARM/SCHULTER/ACHSEL/NAHE/VOR/TREFF/LIFT untouched. */
const _REC=(SC&&SC.REICH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.REICH_GESETZ)||null;
const REICH_PAD=(_REC&&Number.isFinite(_REC.pad))?_REC.pad:0.05;
/* V18.491.394 — Lab straw-pell zone-fallback ← SPIEGEL_GESETZ fail-soft; Host none (SPIEGEL_VIS). ARENA.zonen/ZONE_PICK/REICH/ANSATZ/LIFT untouched. */
const _SPI=(SC&&SC.SPIEGEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPIEGEL_GESETZ)||null;
const SPIEGEL_HEADR=(_SPI&&Number.isFinite(_SPI.headR))?_SPI.headR:0.15;
const SPIEGEL_HEADDMG=(_SPI&&Number.isFinite(_SPI.headDmg))?_SPI.headDmg:2.4;
const SPIEGEL_CHESTYOFF=(_SPI&&Number.isFinite(_SPI.chestYOff))?_SPI.chestYOff:0.20;
const SPIEGEL_RPAD=(_SPI&&Number.isFinite(_SPI.rPad))?_SPI.rPad:0.02;
const SPIEGEL_CHESTDMG=(_SPI&&Number.isFinite(_SPI.chestDmg))?_SPI.chestDmg:1.5;
const SPIEGEL_BELLYYOFF=(_SPI&&Number.isFinite(_SPI.bellyYOff))?_SPI.bellyYOff:-0.18;
const SPIEGEL_BELLYDMG=(_SPI&&Number.isFinite(_SPI.bellyDmg))?_SPI.bellyDmg:1.2;
const SPIEGEL_ARMYOFF=(_SPI&&Number.isFinite(_SPI.armYOff))?_SPI.armYOff:-0.08;
const SPIEGEL_ARMR=(_SPI&&Number.isFinite(_SPI.armR))?_SPI.armR:0.09;
const SPIEGEL_ARMDMG=(_SPI&&Number.isFinite(_SPI.armDmg))?_SPI.armDmg:0.7;
const SPIEGEL_LEGY=(_SPI&&Number.isFinite(_SPI.legY))?_SPI.legY:0.6;
const SPIEGEL_LEGR=(_SPI&&Number.isFinite(_SPI.legR))?_SPI.legR:0.06;
const SPIEGEL_LEGDMG=(_SPI&&Number.isFinite(_SPI.legDmg))?_SPI.legDmg:0.8;
function buildDummy(){const G=new THREE.Group();
  /* V18.491.499 — Lab Pell Mats ← PELLM_GESETZ fail-soft; Host none (PELLM_VIS). STREUM/STREU/RINGF/DISK/PELL-geo/LIFT untouched; seam left bare. */
  const _PLM=(SC&&SC.PELLM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PELLM_GESETZ)||null;
  const PELLM_STROH=(_PLM&&Number.isFinite(_PLM.stroh))?_PLM.stroh:0xb89a52;
  const PELLM_STROHR=(_PLM&&Number.isFinite(_PLM.strohR))?_PLM.strohR:0.95;
  const PELLM_LEDER=(_PLM&&Number.isFinite(_PLM.leder))?_PLM.leder:0x6e4a2c;
  const PELLM_LEDERR=(_PLM&&Number.isFinite(_PLM.lederR))?_PLM.lederR:0.7;
  const PELLM_HOLZ=(_PLM&&Number.isFinite(_PLM.holz))?_PLM.holz:0x4a3520;
  const PELLM_HOLZR=(_PLM&&Number.isFinite(_PLM.holzR))?_PLM.holzR:0.85;
  const PELLM_SEIL=(_PLM&&Number.isFinite(_PLM.seil))?_PLM.seil:0x8a7240;
  const PELLM_SEILR=(_PLM&&Number.isFinite(_PLM.seilR))?_PLM.seilR:0.95;
  const stroh=matCol(PELLM_STROH,PELLM_STROHR,0), leder=matCol(PELLM_LEDER,PELLM_LEDERR,0), holz=matCol(PELLM_HOLZ,PELLM_HOLZR,0), seil=matCol(PELLM_SEIL,PELLM_SEILR,0);
  const postH=PELL_POSTH, baseY=0;
  // Pfosten (Rückgrat) + Kreuzfuß
  const postV=new THREE.Mesh(new THREE.CylinderGeometry(DORN_R0,DORN_R1,postH,12),holz); postV.position.set(0,baseY+postH/2,0); postV.castShadow=true; G.add(postV);
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2;const foot=new THREE.Mesh(new THREE.CylinderGeometry(KREUZ_R0,KREUZ_R1,KREUZ_H,8),holz);foot.position.set(Math.cos(a)*KREUZ_RAD,baseY+KREUZ_Y,Math.sin(a)*KREUZ_RAD);foot.rotation.z=Math.cos(a)*KREUZ_TILT;foot.rotation.x=-Math.sin(a)*KREUZ_TILT;foot.castShadow=true;G.add(foot);}
  // Rumpf (Stroh-Tonne) — Brust oben, Bauch unten
  const torsoY=baseY+PELL_TORSOY, torsoH=PELL_TORSOH, torsoR=PELL_TORSOR;
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(torsoR*KEGEL_MUL,torsoR,torsoH,16),stroh); torso.position.set(0,torsoY,0); torso.castShadow=torso.receiveShadow=true; G.add(torso);
  // Seil-Bindungen
  for(const yo of GURT_YS){const ring=new THREE.Mesh(new THREE.TorusGeometry(torsoR*GURT_MUL,GURT_TUBE,7,18),seil);ring.rotation.x=Math.PI/2;ring.position.set(0,torsoY+yo,0);G.add(ring);}
  // Schultern + Stummelarme (nach −Z und +Z, dem Fechter zugewandt seitlich)
  const shoulderY=torsoY+ANSATZ_YOFF;
  for(const dz of [1,-1]){const arm=new THREE.Mesh(new THREE.CylinderGeometry(STUMMEL_R0,STUMMEL_R1,STUMMEL_H,10),stroh);arm.position.set(0,shoulderY-STUMMEL_YOFF,dz*STUMMEL_ZOFF);arm.rotation.x=dz*STUMMEL_ROTX;arm.castShadow=true;G.add(arm);
    const aring=new THREE.Mesh(new THREE.TorusGeometry(SCHLINGE_R,SCHLINGE_TUBE,6,12),seil);aring.rotation.y=Math.PI/2;aring.position.set(0,shoulderY-SCHLINGE_YOFF,dz*SCHLINGE_ZOFF);G.add(aring);}
  // Hals + Kopf (Lederball)
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(KEHLE_R0,KEHLE_R1,KEHLE_H,10),leder);neck.position.set(0,torsoY+torsoH/2+KEHLE_YOFF,0);G.add(neck);
  const headY=torsoY+torsoH/2+BIRNE_YOFF;
  const head=new THREE.Mesh(new THREE.SphereGeometry(BIRNE_R,16,14),leder);head.position.set(0,headY,0);head.scale.set(1,BIRNE_SCALEY,1);head.castShadow=true;G.add(head);
  // Naht über den Kopf
  /* V18.491.500 — Lab Pell Naht Mat ← NAHTM_GESETZ fail-soft; Host none (NAHTM_VIS). PELLM/STREUM/PELL/NAHT-geo/LIFT untouched. */
  const _NHM=(SC&&SC.NAHTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NAHTM_GESETZ)||null;
  const NAHTM_COLOR=(_NHM&&Number.isFinite(_NHM.color))?_NHM.color:0x4a3018;
  const NAHTM_ROUGH=(_NHM&&Number.isFinite(_NHM.rough))?_NHM.rough:0.8;
  const NAHTM_METAL=(_NHM&&Number.isFinite(_NHM.metal))?_NHM.metal:0;
  const seam=new THREE.Mesh(new THREE.TorusGeometry(NAHT_R,NAHT_TUBE,6,20),matCol(NAHTM_COLOR,NAHTM_ROUGH,NAHTM_METAL));seam.position.set(0,headY,0);seam.rotation.y=Math.PI/2;head.add(new THREE.Mesh(new THREE.TorusGeometry(NAHT_R1,NAHT_TUBE1,6,18),matCol(NAHTM_COLOR,NAHTM_ROUGH,NAHTM_METAL)));
  // Trefferzonen (lokale Koordinaten; x=0 Vorderseite, Treffer kommt aus −X).
  // Quelle der Wahrheit: SC.ARENA.zonen (+ zoneMulAt/zoneKindAt). Absolute y/r = yFrac/rFrac×postH.
  // .114: zOffFrac×postH → zOff (Lab-Geo); Host bleibt XZ-blind für WELCHE Zone (Feel residual).
  G.userData.postH=postH;
  const Z=(SC&&SC.ARENA&&SC.ARENA.zonen)||null;
  const _znName=k=>k==='chest'?'Brust':k==='belly'?'Bauch':k==='head'?'Kopf':k==='arm'?'Arm':k==='leg'?'Bein':k;
  if(Z&&Z.length){
    G.userData.zones=Z.map(z=>{
      const o={name:_znName(z.kind), y:(Number(z.yFrac)||0)*postH, r:(Number(z.rFrac)||0.08)*postH, dmgMul:z.dmgMul, kind:z.kind};
      if(z.zOff!=null)o.zOff=z.zOff;
      if(z.zOffFrac!=null)o.zOff=(Number(z.zOffFrac)||0)*postH; // ARENA named → Lab absolut
      return o;
    });
  }else{
    // fail-soft: vorherige Absolute (Didaktik-Spiegel), falls Core nicht geladen
    G.userData.zones=[
      {name:'Kopf',   y:headY,                              r:SPIEGEL_HEADR,           dmgMul:SPIEGEL_HEADDMG, kind:'head'},
      {name:'Brust',  y:torsoY+SPIEGEL_CHESTYOFF,           r:torsoR+SPIEGEL_RPAD,     dmgMul:SPIEGEL_CHESTDMG, kind:'chest'},
      {name:'Bauch',  y:torsoY+SPIEGEL_BELLYYOFF,           r:torsoR+SPIEGEL_RPAD,     dmgMul:SPIEGEL_BELLYDMG, kind:'belly'},
      {name:'Arm',    y:shoulderY+SPIEGEL_ARMYOFF,          r:SPIEGEL_ARMR,            dmgMul:SPIEGEL_ARMDMG, kind:'arm'},
      {name:'Bein',   y:baseY+SPIEGEL_LEGY,                 r:SPIEGEL_LEGR,            dmgMul:SPIEGEL_LEGDMG, kind:'leg'},
    ];
  }
  G.userData.reachX=-(torsoR+REICH_PAD);   // wo die Vorderfläche steht (−X Seite)
  return G;}
/* V18.491.250 — Lab Zielscheibe ← SCHEIBE_GESETZ fail-soft; Host none (SCHEIBE_VIS). KETTE/SEIL/SCHNEIDE untouched. */
const SCHEIBE_RINGS_FALLBACK=[[1.0,0xfff15a],[0.8,0xfff15a],[0.6,0xf24b4b],[0.45,0xf24b4b],[0.32,0x3aa0e0],[0.20,0x3aa0e0],[0.10,0x222222]];
const _SBG=(SC&&SC.SCHEIBE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHEIBE_GESETZ)||null;
const SCHEIBE_R=(_SBG&&Number.isFinite(_SBG.R))?_SBG.R:0.40;
const SCHEIBE_RINGS=(_SBG&&Array.isArray(_SBG.rings)&&_SBG.rings.length===7)
  ? _SBG.rings.map(function(rg){return [rg[0],rg[1]];})
  : SCHEIBE_RINGS_FALLBACK.map(function(rg){return [rg[0],rg[1]];});
/* V18.491.413 — Lab Zielscheibe Dreibock ← DREIB_GESETZ fail-soft; Host none (DREIB_VIS). BEIN/BOCK/FUSS/STUTZE/KNICK/ZIELP/PFYL/DORN/PFOST/LIFT untouched. */
const _DRB=(SC&&SC.DREIB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DREIB_GESETZ)||null;
const DREIB_R0=(_DRB&&Number.isFinite(_DRB.R0))?_DRB.R0:0.018;
const DREIB_R1=(_DRB&&Number.isFinite(_DRB.R1))?_DRB.R1:0.022;
const DREIB_FRONTH=(_DRB&&Number.isFinite(_DRB.frontH))?_DRB.frontH:1.05;
const DREIB_FRONTX=(_DRB&&Number.isFinite(_DRB.frontX))?_DRB.frontX:0.12;
const DREIB_FRONTY=(_DRB&&Number.isFinite(_DRB.frontY))?_DRB.frontY:-0.38;
const DREIB_FRONTZ=(_DRB&&Number.isFinite(_DRB.frontZ))?_DRB.frontZ:0.30;
const DREIB_FRONTTILT=(_DRB&&Number.isFinite(_DRB.frontTilt))?_DRB.frontTilt:0.26;
const DREIB_BACKH=(_DRB&&Number.isFinite(_DRB.backH))?_DRB.backH:1.10;
const DREIB_BACKX=(_DRB&&Number.isFinite(_DRB.backX))?_DRB.backX:0.40;
const DREIB_BACKY=(_DRB&&Number.isFinite(_DRB.backY))?_DRB.backY:-0.40;
const DREIB_BACKTILT=(_DRB&&Number.isFinite(_DRB.backTilt))?_DRB.backTilt:0.40;
/* V18.491.458 — Lab Zielscheibe Strohballen-Butt ← BUTT_GESETZ fail-soft; Host none (BUTT_VIS). SCHLAUCH/SCHEIBE/DREIB/TUPF/LIFT untouched; face/pos left bare. */
const _BUT=(SC&&SC.BUTT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BUTT_GESETZ)||null;
const BUTT_RMUL=(_BUT&&Number.isFinite(_BUT.rMul))?_BUT.rMul:1.06;
const BUTT_H=(_BUT&&Number.isFinite(_BUT.H))?_BUT.H:0.18;
/* V18.491.459 — Lab Zielscheibe Papier-Face/Disc ← SCHEIBF_GESETZ fail-soft; Host none (SCHEIBF_VIS). BUTT/SCHLAUCH/SCHEIBE/TUPF/LIFT untouched; stack/pos left bare. */
const _SBF=(SC&&SC.SCHEIBF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHEIBF_GESETZ)||null;
const SCHEIBF_H=(_SBF&&Number.isFinite(_SBF.H))?_SBF.H:0.004;
/* V18.491.460 — Lab Zielscheibe Butt-X-Lage ← BUTTP_GESETZ fail-soft; Host none (BUTTP_VIS). SCHEIBF/BUTT/SCHLAUCH/LIFT untouched; disc stack left bare. */
const _BTP=(SC&&SC.BUTTP_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BUTTP_GESETZ)||null;
const BUTTP_X=(_BTP&&Number.isFinite(_BTP.x))?_BTP.x:0.10;
/* V18.491.461 — Lab Zielscheibe Disc-Stack ← STAPEL_GESETZ fail-soft; Host none (STAPEL_VIS). BUTTP/SCHEIBF/BUTT/LIFT untouched; faceX left bare. */
const _SPL=(SC&&SC.STAPEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STAPEL_GESETZ)||null;
const STAPEL_X0=(_SPL&&Number.isFinite(_SPL.x0))?_SPL.x0:-0.003;
const STAPEL_DX=(_SPL&&Number.isFinite(_SPL.dx))?_SPL.dx:0.0006;
/* V18.491.462 — Lab Zielscheibe Paper-Face Hit-X ← FACEX_GESETZ fail-soft; Host none (FACEX_VIS). STAPEL/SCHEIBF/BUTTP/BUTT/LIFT untouched. */
const _FCX=(SC&&SC.FACEX_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FACEX_GESETZ)||null;
const FACEX_X=(_FCX&&Number.isFinite(_FCX.x))?_FCX.x:-0.006;
// — Zielscheibe: Strohballen + Papierscheibe mit Wettkampf-Ringen (Gold/Rot/Blau/Schwarz/Weiß) auf einem Bock —
function buildZielscheibe(){const G=new THREE.Group();
  const R=SCHEIBE_R, rings=SCHEIBE_RINGS; // 10er Gold innen
  /* V18.491.508 — Lab Zielscheibe Mats ← SCHEIBM_GESETZ fail-soft; Host none (SCHEIBM_VIS). PFEILM/SCHEIBE/BUTT/SCHEIBF/PELLM/LIFT untouched. */
  const _SBM=(SC&&SC.SCHEIBM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHEIBM_GESETZ)||null;
  const SCHEIBM_BUTT=(_SBM&&Number.isFinite(_SBM.butt))?_SBM.butt:0xc6a85a;
  const SCHEIBM_BUTTR=(_SBM&&Number.isFinite(_SBM.buttR))?_SBM.buttR:0.98;
  const SCHEIBM_FACE=(_SBM&&Number.isFinite(_SBM.face))?_SBM.face:0xf4f0e8;
  const SCHEIBM_FACER=(_SBM&&Number.isFinite(_SBM.faceR))?_SBM.faceR:0.9;
  const SCHEIBM_LEG=(_SBM&&Number.isFinite(_SBM.leg))?_SBM.leg:0x4a3520;
  const SCHEIBM_LEGR=(_SBM&&Number.isFinite(_SBM.legR))?_SBM.legR:0.85;
  const SCHEIBM_RINGR=(_SBM&&Number.isFinite(_SBM.ringR))?_SBM.ringR:0.85;
  // Strohballen hinter der Scheibe
  const butt=new THREE.Mesh(new THREE.CylinderGeometry(R*BUTT_RMUL,R*BUTT_RMUL,BUTT_H,28),matCol(SCHEIBM_BUTT,SCHEIBM_BUTTR,0));butt.rotation.z=Math.PI/2;butt.position.set(BUTTP_X,0,0);butt.castShadow=butt.receiveShadow=true;G.add(butt);
  // Ringe als dünne Zylinder-Scheiben, gestapelt nach −X (zum Schützen)
  const face=new THREE.Mesh(new THREE.CylinderGeometry(R,R,SCHEIBF_H,40),matCol(SCHEIBM_FACE,SCHEIBM_FACER,0));face.rotation.z=Math.PI/2;face.position.set(0.0,0,0);G.add(face);
  rings.forEach((rg,i)=>{const disc=new THREE.Mesh(new THREE.CylinderGeometry(R*rg[0],R*rg[0],SCHEIBF_H,40),matCol(rg[1],SCHEIBM_RINGR,0));disc.rotation.z=Math.PI/2;disc.position.set(STAPEL_X0-i*STAPEL_DX,0,0);G.add(disc);});
  // Beine (Dreibock)
  for(const dz of [-DREIB_FRONTZ,DREIB_FRONTZ]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(DREIB_R0,DREIB_R1,DREIB_FRONTH,8),matCol(SCHEIBM_LEG,SCHEIBM_LEGR,0));leg.position.set(DREIB_FRONTX,DREIB_FRONTY,dz);leg.rotation.x=dz>0?DREIB_FRONTTILT:-DREIB_FRONTTILT;leg.castShadow=true;G.add(leg);}
  const backleg=new THREE.Mesh(new THREE.CylinderGeometry(DREIB_R0,DREIB_R1,DREIB_BACKH,8),matCol(SCHEIBM_LEG,SCHEIBM_LEGR,0));backleg.position.set(DREIB_BACKX,DREIB_BACKY,0);backleg.rotation.z=-DREIB_BACKTILT;backleg.castShadow=true;G.add(backleg);
  G.userData.R=R; G.userData.faceX=FACEX_X;
  return G;}
/* V18.491.251 — Lab arrow shaft ← PFEIL_GESETZ fail-soft; Host none (PFEIL_VIS). SCHEIBE/KETTE/SEIL untouched; LIFT stays dead. */
const _PFG=(SC&&SC.PFEIL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PFEIL_GESETZ)||null;
const PFEIL_L=(_PFG&&Number.isFinite(_PFG.L))?_PFG.L:0.72;
const PFEIL_SHR=(_PFG&&Number.isFinite(_PFG.shR))?_PFG.shR:0.0035;
/* V18.491.440 — Lab Pfeil-Befiederung ← KIEL_GESETZ fail-soft; Host none (KIEL_VIS). FEDER/FLUEGEL/PFEIL/RAST/AST/LIFT untouched; tip/nock left bare. */
const _KIE=(SC&&SC.KIEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KIEL_GESETZ)||null;
const KIEL_W=(_KIE&&Number.isFinite(_KIE.W))?_KIE.W:0.05;
const KIEL_H=(_KIE&&Number.isFinite(_KIE.H))?_KIE.H:0.022;
const KIEL_D=(_KIE&&Number.isFinite(_KIE.D))?_KIE.D:0.0015;
const KIEL_XOFF=(_KIE&&Number.isFinite(_KIE.xOff))?_KIE.xOff:0.04;
const KIEL_Y=(_KIE&&Number.isFinite(_KIE.y))?_KIE.y:0.011;
/* V18.491.445 — Lab Pfeil-Bodkin ← BODKIN_GESETZ fail-soft; Host none (BODKIN_VIS). SPITZE/DORN/SCHNABEL/KIEL/KEGEL/ROHR/PFEIL/LIFT untouched; nock left bare. */
const _BDK=(SC&&SC.BODKIN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BODKIN_GESETZ)||null;
const BODKIN_MUL=(_BDK&&Number.isFinite(_BDK.mul))?_BDK.mul:1.8;
const BODKIN_H=(_BDK&&Number.isFinite(_BDK.H))?_BDK.H:0.035;
const BODKIN_XOFF=(_BDK&&Number.isFinite(_BDK.xOff))?_BDK.xOff:0.017;
/* V18.491.446 — Lab Pfeil-Nocke ← NOCK_GESETZ fail-soft; Host none (NOCK_VIS). BODKIN/KIEL/SCHNABEL/KEHLE/PFEIL/LIFT untouched. */
const _NOC=(SC&&SC.NOCK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NOCK_GESETZ)||null;
const NOCK_MUL=(_NOC&&Number.isFinite(_NOC.mul))?_NOC.mul:1.5;
const NOCK_H=(_NOC&&Number.isFinite(_NOC.H))?_NOC.H:0.02;
const NOCK_XOFF=(_NOC&&Number.isFinite(_NOC.xOff))?_NOC.xOff:0.01;
// — Pfeil: Schaft + Bodkin-Spitze + Nocke + drei Federn. Liegt entlang +X (Flugrichtung). —
function buildPfeil(){const G=new THREE.Group(); const L=PFEIL_L, shR=PFEIL_SHR;
  /* V18.491.507 — Lab Pfeil Mats ← PFEILM_GESETZ fail-soft; Host none (PFEILM_VIS). KONTUR/WIRBEL/ACHSE/PFEIL/BODKIN/NOCK/KIEL/LIFT untouched. */
  const _PFM=(SC&&SC.PFEILM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PFEILM_GESETZ)||null;
  const PFEILM_SHAFT=(_PFM&&Number.isFinite(_PFM.shaft))?_PFM.shaft:0x9a7a4a;
  const PFEILM_SHAFTR=(_PFM&&Number.isFinite(_PFM.shaftR))?_PFM.shaftR:0.8;
  const PFEILM_TIP=(_PFM&&Number.isFinite(_PFM.tip))?_PFM.tip:0x9099a0;
  const PFEILM_TIPR=(_PFM&&Number.isFinite(_PFM.tipR))?_PFM.tipR:0.5;
  const PFEILM_TIPM=(_PFM&&Number.isFinite(_PFM.tipM))?_PFM.tipM:0.7;
  const PFEILM_NOCK=(_PFM&&Number.isFinite(_PFM.nock))?_PFM.nock:0x222428;
  const PFEILM_NOCKR=(_PFM&&Number.isFinite(_PFM.nockR))?_PFM.nockR:0.6;
  const PFEILM_KIEL0=(_PFM&&Number.isFinite(_PFM.kiel0))?_PFM.kiel0:0xd24b4b;
  const PFEILM_KIEL1=(_PFM&&Number.isFinite(_PFM.kiel1))?_PFM.kiel1:0xe8e0d0;
  const PFEILM_KIELR=(_PFM&&Number.isFinite(_PFM.kielR))?_PFM.kielR:0.9;
  const shaft=cyl(shR,shR,L,matCol(PFEILM_SHAFT,PFEILM_SHAFTR,0),8); shaft.rotation.z=Math.PI/2; shaft.position.set(0,0,0); G.add(shaft);
  const head=new THREE.Mesh(new THREE.ConeGeometry(shR*BODKIN_MUL,BODKIN_H,8),matCol(PFEILM_TIP,PFEILM_TIPR,PFEILM_TIPM)); head.rotation.z=-Math.PI/2; head.position.set(L/2+BODKIN_XOFF,0,0); G.add(head);
  const nock=new THREE.Mesh(new THREE.CylinderGeometry(shR*NOCK_MUL,shR,NOCK_H,8),matCol(PFEILM_NOCK,PFEILM_NOCKR,0)); nock.rotation.z=Math.PI/2; nock.position.set(-L/2-NOCK_XOFF,0,0); G.add(nock);
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2; const fl=new THREE.Mesh(new THREE.BoxGeometry(KIEL_W,KIEL_H,KIEL_D),matCol(i===0?PFEILM_KIEL0:PFEILM_KIEL1,PFEILM_KIELR,0));
    const grp=new THREE.Group(); fl.position.set(-L/2+KIEL_XOFF,KIEL_Y,0); grp.add(fl); grp.rotation.x=a; G.add(grp);}
  return G;}
// chiselZ · grabeBlatt · buildHead (Axt/Hammer/Sledge/Kolben/Pick/Grabeblatt/Keule) — leben im Kern (__schmiedeCore).

// 2 · DAS RÜCKGRAT — stations(P) lebt im Kern (__schmiedeCore).

// 1 · DIE LEHREN — bladeBeta · headModel · measure (alles INTEGRIERT aus der Geometrie) — leben im Kern (__schmiedeCore).

// BANDS (Bänder je Absicht) · bandFor · LEHREN-Tafel · evalLehren · befund — leben im Kern (__schmiedeCore).

// ════════════════════════════════════════════════════════════════════
// RÜCKGRAT-Zeichnung (Mittellinie + Stationen)
// ════════════════════════════════════════════════════════════════════
function buildSpine(P){const g=new THREE.Group();const S=stations(P);
  /* V18.491.504 — Lab Rückgrat-Linie ← WIRBEL_GESETZ fail-soft; Host none (WIRBEL_VIS). FORTE/SCHIEB/ETIK/RUECK/LIFT untouched; section axes + pfeil mats left bare. */
  const _WIR=(SC&&SC.WIRBEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WIRBEL_GESETZ)||null;
  const WIRBEL_COLOR=(_WIR&&Number.isFinite(_WIR.color))?_WIR.color:0xe7c887;
  const WIRBEL_OP=(_WIR&&Number.isFinite(_WIR.opacity))?_WIR.opacity:0.8;
  const lm=new THREE.LineBasicMaterial({color:WIRBEL_COLOR,transparent:true,opacity:WIRBEL_OP});
  // Mittellinie (folgt Krümmung im Klingenteil)
  const pts=[[S.xButt,0,0]];
  if(!S.impact){for(let i=0;i<=24;i++){const s=i/24;pts.push([S.xBlade0+s*P.klinge,curveY(s,P),0]);}}
  else pts.push([S.xTip,0,0]);
  g.add(polyline(pts,lm));
  const stns = S.impact
    ? [['KNAUF',S.xButt],['GRIFF',S.xGripEnd*0.5],['KOPF',S.xHead0],['SPITZE',S.xTip]]
    : [['KNAUF',S.xButt],['GRIFF',S.xGripEnd*0.5],['PARIER',S.xGuard],['KLINGE',(S.xBlade0+S.xPoint)/2],['SPITZE',S.xPoint]];
  /* V18.491.565 — Lab Rückgrat Station-Labels ← SPINEM_GESETZ fail-soft; Host none (SPINEM_VIS). KARTENM/Host M.bone/LEHREM/LIFT untouched. */
  const _SPM=(SC&&SC.SPINEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPINEM_GESETZ)||null;
  const SPINEM_COLOR=(_SPM&&Number.isFinite(_SPM.color))?_SPM.color:0xcdb38a;
  const SPINEM_CSS='#'+SPINEM_COLOR.toString(16).padStart(6,'0');
  for(const [nm,xx] of stns){const yy=(!S.impact&&xx>=S.xBlade0)?curveY((xx-S.xBlade0)/P.klinge,P):0;
    g.add(dot([xx,yy,0],M.bone,PUNKT_STATION));
    const lb=label(nm,SPINEM_CSS,0.04);lb.position.set(xx,yy+SPINELAB_LIFT,0);g.add(lb);}
  return g;}

// ════════════════════════════════════════════════════════════════════
// 3 · GELENKE / dynamische Lehren — Hand · Balance · Schlagpunkt(Knoten)
//   Maßlinien (Caliper) machen die Zahlen am Körper sichtbar (analog Karosserie).
// ════════════════════════════════════════════════════════════════════
/* V18.491.447 — Lab Lehren-Hand-Drehpunkt ← HAND_GESETZ fail-soft; Host none (HAND_VIS). NOCK/REIF/OESE/RING/MUFFE/ROHR/ZIER/LIFT untouched; tufts left bare. */
const _HND=(SC&&SC.HAND_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HAND_GESETZ)||null;
const HAND_R=(_HND&&Number.isFinite(_HND.R))?_HND.R:0.02;
const HAND_TUBE=(_HND&&Number.isFinite(_HND.tube))?_HND.tube:0.0035;
/* V18.491.633 — Lab Lehren HAND·Drehpunkt label dy ← HANDLAB_GESETZ fail-soft; Host none (HANDLAB_VIS). ≠ HAND ring/LEHREM/SCHIEB; sizes 0.044/0.042 left bare; LIFT untouched. */
const _HLB=(SC&&SC.HANDLAB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HANDLAB_GESETZ)||null;
const HANDLAB_DY=(_HLB&&Number.isFinite(_HLB.dy))?_HLB.dy:-0.055;
/* V18.491.634 — Lab Lehren BALANCE/SCHLAGPUNKT label lift ← LEHRLAB_GESETZ fail-soft; Host none (LEHRLAB_VIS). ≠ HANDLAB/SCHIEB/spine +0.05; other 0.06 left bare; HAND duplicate label untouched; LIFT untouched. */
const _LLB=(SC&&SC.LEHRLAB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEHRLAB_GESETZ)||null;
const LEHRLAB_LIFT=(_LLB&&Number.isFinite(_LLB.lift))?_LLB.lift:0.06;
/* V18.491.635 — Lab Rückgrat station label lift ← SPINELAB_GESETZ fail-soft; Host none (SPINELAB_VIS). ≠ LEHRLAB/HANDLAB/SCHIEB/PUNKT/RUECK; other 0.05 left bare; LIFT untouched. */
const _SLB=(SC&&SC.SPINELAB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPINELAB_GESETZ)||null;
const SPINELAB_LIFT=(_SLB&&Number.isFinite(_SLB.lift))?_SLB.lift:0.05;
/* V18.491.636 — Lab Lehren BALANCE/SCHLAGPUNKT label size ← LEHRLABSC_GESETZ fail-soft; Host none (LEHRLABSC_VIS). ≠ ETIK/SCHIEB/LEHRLAB; HAND 0.044 dup + 0.042 untouched; LIFT untouched. */
const _LLS=(SC&&SC.LEHRLABSC_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEHRLABSC_GESETZ)||null;
const LEHRLABSC_SC=(_LLS&&Number.isFinite(_LLS.sc))?_LLS.sc:0.044;
function buildLehrenOverlay(P,m){const g=new THREE.Group();const S=m.S;const yb=0.075;
  /* V18.491.562 — Lab Lehren Overlay Colors ← LEHREM_GESETZ fail-soft; Host none (LEHREM_VIS). ABKLINGM/ACHSE/Host M.hand|bal|node/befund/LIFT untouched. */
  const _LHM=(SC&&SC.LEHREM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEHREM_GESETZ)||null;
  const LEHREM_HAND=(_LHM&&Number.isFinite(_LHM.hand))?_LHM.hand:0x66a8ff;
  const LEHREM_BAL=(_LHM&&Number.isFinite(_LHM.bal))?_LHM.bal:0x7fc98a;
  const LEHREM_NODE=(_LHM&&Number.isFinite(_LHM.node))?_LHM.node:0xff9a3c;
  const LEHREM_HAND_CSS='#'+LEHREM_HAND.toString(16).padStart(6,'0');
  const LEHREM_BAL_CSS='#'+LEHREM_BAL.toString(16).padStart(6,'0');
  const LEHREM_NODE_CSS='#'+LEHREM_NODE.toString(16).padStart(6,'0');
  const yAt=x=>(!S.impact&&x>=S.xBlade0)?curveY((x-S.xBlade0)/P.klinge,P):0;
  // Hand (Drehpunkt) — Ring um den Griff
  const hand=new THREE.Mesh(new THREE.TorusGeometry(HAND_R,HAND_TUBE,10,28),M.hand);hand.rotation.y=Math.PI/2;hand.position.set(S.pivot,0,0);g.add(hand);
  g.add(label('HAND · Drehpunkt',LEHREM_HAND_CSS,0.044).translateX(0));const hl=label('HAND · Drehpunkt',LEHREM_HAND_CSS,0.042);hl.position.set(S.pivot,HANDLAB_DY,0);g.add(hl);
  // Balance-Punkt
  g.add(dot([m.xcm,yAt(m.xcm),0],M.bal,PUNKT_MARK));
  const bl=label('BALANCE',LEHREM_BAL_CSS,LEHRLABSC_SC);bl.position.set(m.xcm,yAt(m.xcm)+LEHRLAB_LIFT,0);g.add(bl);
  g.add(caliper([S.pivot,yb,0.02],[m.xcm,yb,0.02],LEHREM_BAL,(Math.abs(m.xcm-S.pivot)*1000|0)+' mm  PoB'));
  // Schlagpunkt / harmonischer Knoten (CoP) — falls auf der Klinge
  if(m.xcop>S.xBlade0 && m.xcop<S.xTip+0.05){
    g.add(dot([Math.min(m.xcop,S.xTip),yAt(Math.min(m.xcop,S.xTip)),0],M.node,PUNKT_MARK));
    const nl=label('SCHLAGPUNKT · Knoten',LEHREM_NODE_CSS,LEHRLABSC_SC);nl.position.set(Math.min(m.xcop,S.xTip),yAt(Math.min(m.xcop,S.xTip))+LEHRLAB_LIFT,0);g.add(nl);
    g.add(caliper([S.pivot,-yb,-0.02],[Math.min(m.xcop,S.xTip),-yb,-0.02],LEHREM_NODE,(Math.abs(m.xcop-S.pivot)*1000|0)+' mm  Stoßzentrum'));
  }
  return g;}

// ════════════════════════════════════════════════════════════════════
// SCHNITT-KARTE (das Organ) — reales Profil an der Fehlschärfe (forte),
//   vergrößert über der Klinge, mit neutralen Achsen + I-Träger-Beschriftung.
// ════════════════════════════════════════════════════════════════════
function buildSectionCard(P){const g=new THREE.Group();const S=stations(P);if(S.impact)return g;
  /* V18.491.503 — Lab Schnitt-Karte Forte ← FORTE_GESETZ fail-soft; Host none (FORTE_VIS). SCHIEB/ETIK/NAHTM/RUECK/SCHNITT/LIFT untouched; spine/axes left bare. */
  const _FOR=(SC&&SC.FORTE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FORTE_GESETZ)||null;
  const FORTE_T=(_FOR&&Number.isFinite(_FOR.t))?_FOR.t:0.18;
  const FORTE_SC=(_FOR&&Number.isFinite(_FOR.sc))?_FOR.sc:4.2;
  const FORTE_XOFF=(_FOR&&Number.isFinite(_FOR.xOff))?_FOR.xOff:0.12;
  const FORTE_PY=(_FOR&&Number.isFinite(_FOR.py))?_FOR.py:0.30;
  /* V18.491.632 — Lab Schnitt-Karte Caption-Abstand ← KARTENABST_GESETZ fail-soft; Host none (KARTENABST_VIS). ≠ FORTE/KARTENM/SCHIEB; 2.8 left bare; LIFT untouched. */
  const _KAB=(SC&&SC.KARTENABST_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KARTENABST_GESETZ)||null;
  const KARTENABST_GAP=(_KAB&&Number.isFinite(_KAB.gap))?_KAB.gap:0.02;
  /* V18.491.637 — Lab Schnitt-Karte caption sizes ← KARTENSC_GESETZ fail-soft; Host none (KARTENSC_VIS). ≠ ETIK/spine/mass/Steg/Flansch; LIFT untouched. */
  const _KSC=(SC&&SC.KARTENSC_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KARTENSC_GESETZ)||null;
  const KARTENSC_TITLE=(_KSC&&Number.isFinite(_KSC.title))?_KSC.title:0.05;
  const KARTENSC_META=(_KSC&&Number.isFinite(_KSC.meta))?_KSC.meta:0.04;
  const t=FORTE_T, poly=sectionAt(t,P), sc=FORTE_SC;                 // forte
  const shape=new THREE.Shape();poly.forEach((p,i)=>{const z=p[0]*sc,y=p[1]*sc;i?shape.lineTo(z,y):shape.moveTo(z,y);});shape.closePath();
  const geo=new THREE.ShapeGeometry(shape);const face=new THREE.Mesh(geo,M.cardFill);
  const px=S.xBlade0+FORTE_XOFF, py=FORTE_PY, pz=0;
  face.position.set(px,py,pz);face.castShadow=false;g.add(face);
  // Kontur (Glanz)
  /* V18.491.506 — Lab Schnitt-Kontur ← KONTUR_GESETZ fail-soft; Host none (KONTUR_VIS). ACHSE/WIRBEL/FORTE/RIM/LIFT untouched; pfeil mats left bare. */
  const _KON=(SC&&SC.KONTUR_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KONTUR_GESETZ)||null;
  const KONTUR_COLOR=(_KON&&Number.isFinite(_KON.color))?_KON.color:0xe7c887;
  const KONTUR_ZOFF=(_KON&&Number.isFinite(_KON.zOff))?_KON.zOff:0.001;
  const ept=poly.map(p=>new THREE.Vector3(px+p[0]*sc,py+p[1]*sc,pz+KONTUR_ZOFF));ept.push(ept[0].clone());
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ept),new THREE.LineBasicMaterial({color:KONTUR_COLOR})));
  // neutrale Achsen
  /* V18.491.505 — Lab Schnitt-Achsen ← ACHSE_GESETZ fail-soft; Host none (ACHSE_VIS). WIRBEL/FORTE/SCHIEB/RIM/LIFT untouched; Kontur + pfeil mats left bare. */
  const _AXS=(SC&&SC.ACHSE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ACHSE_GESETZ)||null;
  const ACHSE_COLOR=(_AXS&&Number.isFinite(_AXS.color))?_AXS.color:0x66a8ff;
  const ACHSE_OPH=(_AXS&&Number.isFinite(_AXS.opH))?_AXS.opH:0.7;
  const ACHSE_OPV=(_AXS&&Number.isFinite(_AXS.opV))?_AXS.opV:0.5;
  const ACHSE_MULH=(_AXS&&Number.isFinite(_AXS.mulH))?_AXS.mulH:1.1;
  const ACHSE_MULV=(_AXS&&Number.isFinite(_AXS.mulV))?_AXS.mulV:2.6;
  const hw=P.w0/2*sc, ht=P.th0/2*sc;
  g.add(seg([px-hw*ACHSE_MULH,py,pz+0.002],[px+hw*ACHSE_MULH,py,pz+0.002],new THREE.LineBasicMaterial({color:ACHSE_COLOR,transparent:true,opacity:ACHSE_OPH})));
  g.add(seg([px,py-ht*ACHSE_MULV,pz+0.002],[px,py+ht*ACHSE_MULV,pz+0.002],new THREE.LineBasicMaterial({color:ACHSE_COLOR,transparent:true,opacity:ACHSE_OPV})));
  /* V18.491.564 — Lab Schnitt-Karte Captions ← KARTENM_GESETZ fail-soft; Host none (KARTENM_VIS). LEHREM/Host bone/spine #cdb38a/LIFT untouched. */
  const _KCM=(SC&&SC.KARTENM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KARTENM_GESETZ)||null;
  const KARTENM_TITLE=(_KCM&&Number.isFinite(_KCM.title))?_KCM.title:0xcdb38a;
  const KARTENM_META=(_KCM&&Number.isFinite(_KCM.meta))?_KCM.meta:0x8c7d6b;
  const KARTENM_TITLE_CSS='#'+KARTENM_TITLE.toString(16).padStart(6,'0');
  const KARTENM_META_CSS='#'+KARTENM_META.toString(16).padStart(6,'0');
  const cap=label('SCHNITT @ forte  ·  '+(P.fuller>0?'Hohlkehle = I-Träger':'voll'),KARTENM_TITLE_CSS,KARTENSC_TITLE);cap.position.set(px,py+ht*2.8+KARTENABST_GAP,pz);g.add(cap);
  const cap2=label((P.w0*1000|0)+'×'+(P.th0*1000|0)+' mm  ·  '+P.fam,KARTENM_META_CSS,KARTENSC_META);cap2.position.set(px,py-ht*2.8-KARTENABST_GAP,pz);g.add(cap2);
  /* prior wire — section-card fuller labels → LEHREM_GESETZ (Steg=node · Flansch=bal; ≠ KARTENM). */
  if(P.fuller>0){
    const _LHM2=(SC&&SC.LEHREM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEHREM_GESETZ)||null;
    const LEHREM_BAL2=(_LHM2&&Number.isFinite(_LHM2.bal))?_LHM2.bal:0x7fc98a;
    const LEHREM_NODE2=(_LHM2&&Number.isFinite(_LHM2.node))?_LHM2.node:0xff9a3c;
    const LEHREM_BAL2_CSS='#'+LEHREM_BAL2.toString(16).padStart(6,'0');
    const LEHREM_NODE2_CSS='#'+LEHREM_NODE2.toString(16).padStart(6,'0');
    const fl=label('Steg (Hohlkehle)',LEHREM_NODE2_CSS,0.034);fl.position.set(px,py+0.005,pz+0.01);g.add(fl);
    for(const sx of[-1,1]){const efl=label('Flansch',LEHREM_BAL2_CSS,0.032);efl.position.set(px+sx*hw*0.8,py,pz);g.add(efl);}}
  return g;}

// ════════════════════════════════════════════════════════════════════
// MASSE-STREIFEN (die verborgene Wahrheit) — λ(x) als Linie unter der Waffe
// ════════════════════════════════════════════════════════════════════
function buildMassStrip(P){const g=new THREE.Group();const S=stations(P);
  /* V18.491.509 — Lab Masse-Streifen ← MASSE_GESETZ fail-soft; Host none (MASSE_VIS). SCHEIBM/PFEILM/PELLM/STREIF/LIFT untouched; GLIED mats left bare. */
  const _MAS=(SC&&SC.MASSE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.MASSE_GESETZ)||null;
  const MASSE_Y0=(_MAS&&Number.isFinite(_MAS.y0))?_MAS.y0:-0.16;
  const MASSE_SC=(_MAS&&Number.isFinite(_MAS.sc))?_MAS.sc:0.9;
  const MASSE_N=(_MAS&&Number.isFinite(_MAS.N))?_MAS.N:120;
  const MASSE_AMP=(_MAS&&Number.isFinite(_MAS.amp))?_MAS.amp:0.09;
  const MASSE_COLOR=(_MAS&&Number.isFinite(_MAS.color))?_MAS.color:0x8a93a0;
  const y0=MASSE_Y0, sc=MASSE_SC;
  // λ(x) abtasten
  const N=MASSE_N, xs=[], lam=[];let lmax=1e-9;
  function lambdaAt(x){
    if(!S.impact){
      if(x>=S.xBlade0 && x<=S.xPoint){const t=(x-S.xBlade0)/P.klinge;return RHO.stahl*sectionMoments(sectionAt(t,P)).A;}
      if(x>=S.xGuard-S.gThk && x<=S.xGuard+S.gThk)return RHO.stahl*(P.parier*2*0.010*0.016)/(2*S.gThk);
      if(x>=S.xGrip0 && x<=S.xGripEnd)return RHO.griff*Math.PI*0.013*0.013;
      if(x<S.xGrip0+0.01)return RHO.bronze*(4/3)*Math.PI*Math.pow(P.knaufR,3)*0.72/0.04;
      return 0;
    } else {
      if(x>=S.xHead0)return (P.kopfTyp==='keule'?RHO.holz:RHO.stahl)*Math.PI*P.socketR*P.socketR*0.55;
      if(x>=S.xGrip0)return RHO.holz*Math.PI*P.schaftR*P.schaftR;
      return 0;
    }}
  for(let i=0;i<=N;i++){const x=S.xButt+i/N*S.L;const l=lambdaAt(x);xs.push(x);lam.push(l);if(l>lmax)lmax=l;}
  const top=[];for(let i=0;i<=N;i++)top.push(new THREE.Vector3(xs[i],y0-lam[i]/lmax*MASSE_AMP*sc,0));
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(top),new THREE.LineBasicMaterial({color:MASSE_COLOR})));
  // Füllung (Dreiecksband zur Grundlinie)
  const verts=[],idx=[];for(let i=0;i<=N;i++){verts.push(xs[i],y0,0, xs[i],y0-lam[i]/lmax*MASSE_AMP*sc,0);}
  for(let i=0;i<N;i++){const a=i*2;idx.push(a,a+1,a+2,a+2,a+1,a+3);}
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));fg.setIndex(idx);
  g.add(new THREE.Mesh(fg,M.mass));
  // Schwerpunkt-Marke auf der Grundlinie
  const m=measure(P);g.add(dot([m.xcm,y0,0],M.bal,TUPF_R));
  const lb=label('λ(x) · Schwerpunkt','#'+(MASSE_COLOR>>>0).toString(16).padStart(6,'0'),0.04);lb.position.set(m.xcm,y0-0.105,0);g.add(lb);
  return g;}

// ════════════════════════════════════════════════════════════════════
// ZUSTAND · GATTUNGEN · TRADITIONEN · REGLER
// ════════════════════════════════════════════════════════════════════
const P={
  modus:'klinge', intent:'hieb',
  klinge:0.95, w0:0.045, wTip:0.30, th0:0.0065, thTip:0.40, fam:'sechs', flat:0.42, single:false,
  fuller:0.55, fullerW:0.6, kruemmung:0.0, _kBase:0.0,
  griff:0.24, knaufR:0.021, knaufFill:0.72, parier:0.11,
  // Schaft & Kopf (Wucht)
  schaft:0.58, schaftR:0.016, kopfTyp:'kolben', kopfLen:0.12, socketR:0.022, beta:30, reach:0.052, edgeLen:0.10, flangeN:6, flangeLen:0.085, backSpike:false, beak:false, kopfAccent:'schwarzstahl',
};
// — Regler-Tabellen (PARAMS_BLADE/PARAMS_IMPACT, mit Gesetz) — leben im Kern (__schmiedeCore; B4 PARAMS mit def).
// GATTUNGEN · TRADITIONEN · snapBases · shapeByTradition — leben im Kern (__schmiedeCore).

// DIE AUFGABEN-GESETZE (ZIELMAT/WERKSTOFF/MAT/ANTHROPOS · betaFromMechanik · ableitenKeil/
// Pick/Graben/Klinge/Bogen · applyTask · hamonGesetz/edgeBeta/kantenLast) — leben im Kern (__schmiedeCore).
let currentTrad=TRADITIONEN.Frank, currentGattung='Langschwert';
SC.setTradition(currentTrad);   // Kern-Zustand spiegeln (measure liest die Tradition für die Gehilz-Masse)

const show={spine:false,section:true,lehren:true,mass:false,steel:true};
let gSpine,gSection,gLehren,gMass,gWeapon,gBladeMesh;
/* V18.491.255 — Lab weapon eye-height ← HEBE_GESETZ fail-soft; Host none (HEBE_VIS). LIFT stays dead; ≠ BANK. */
const _HEG=(SC&&SC.HEBE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HEBE_GESETZ)||null;
const HEBE_Y=(_HEG&&Number.isFinite(_HEG.y))?_HEG.y:0.30;
const weapon=new THREE.Group();weapon.position.y=HEBE_Y;scene.add(weapon);

function clear(g){if(!g)return;if(g.parent)g.parent.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose();
  if(o.isSprite&&o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});}

function rebuild(){
  clear(gSpine);clear(gSection);clear(gLehren);clear(gMass);clear(gWeapon);
  if(P.modus==='wucht') P.schaftR=griffD(intentControl(P))*0.5;          // Schaftradius aus dem Greifer-Kontakt abgeleitet
  if(P.modus==='bogen'){
    gWeapon=new THREE.Group(); gWeapon.add(buildBogen(P,M.wood)); gWeapon.visible=show.steel; weapon.add(gWeapon);
    gSpine=new THREE.Group();gSection=new THREE.Group();gLehren=new THREE.Group();gMass=new THREE.Group();
    weapon.position.set(-((P.riserLen||0.13)+2*(P.limbLen||0.6))/2, HEBE_Y, 0);   // V18.491.631 wire: Augenhöhe ← HEBE_GESETZ.y (no bump; ≠ LIFT dead)
    renderBogenTafel(P); return;
  }
  const S=stations(P), m=measure(P), res=evalLehren(P);
  // — STAHL (die Haut) —
  gWeapon=new THREE.Group();gBladeMesh=null;
  if(!S.impact){
    gBladeMesh=loftBlade(P,S);gWeapon.add(gBladeMesh);
    gWeapon.add(buildGuard(P,S,currentTrad));
    gWeapon.add(buildGrip(P,S,currentTrad));
    gWeapon.add(buildPommel(P,S,currentTrad));
  } else {
    gWeapon.add(buildHaft(P,S));
    gWeapon.add(buildHead(P,S));
  }
  gWeapon.visible=show.steel;weapon.add(gWeapon);
  // — Hilfs-Ebenen —
  gSpine=buildSpine(P);gSpine.visible=show.spine;weapon.add(gSpine);
  gSection=buildSectionCard(P);gSection.visible=show.section&&!S.impact;weapon.add(gSection);
  gLehren=buildLehrenOverlay(P,m);gLehren.visible=show.lehren;weapon.add(gLehren);
  gMass=buildMassStrip(P);gMass.visible=show.mass;weapon.add(gMass);
  // — zentrieren & auf Augenhöhe heben —
  weapon.position.set(-S.L/2,HEBE_Y,0);   // V18.491.631 wire: Augenhöhe ← HEBE_GESETZ.y (no bump; ≠ LIFT dead)
  renderTafel(res,m);
}
// — Lehren-Tafel rendern —
function pct(v,band){const lo=band[0],hi=band[1],pad=(hi-lo)*0.8;const a=lo-pad,b=hi+pad;return Math.max(2,Math.min(98,(v-a)/(b-a)*100));}
const INTENT_LAB={hieb:'HIEB',stich:'STICH',schlag:'SCHLAG',spalten:'SPALTEN',nutz:'NUTZ'};
function renderTafel(res,m){const list=document.getElementById('lrlist');let html='',ok=0,tot=0;
  for(const{L,v,st,band}of res){
    if(st==='na'){html+='<div class="lr na"><div class="lr-h"><span class="lr-lab">'+L.lab+'</span><span class="lr-val">—</span></div><div class="lr-hint">'+L.hint+'</div></div>';continue;}
    tot++;if(st==='pass')ok++;
    const p=pct(v,band),lo=pct(band[0],band),hi=pct(band[1],band);
    const vtxt=(L.id==='Inorm'||L.id==='mEff')?v.toFixed(3):v.toFixed(2);
    html+='<div class="lr '+st+'"><div class="lr-h"><span class="lr-lab">'+L.lab+'</span><span class="lr-val">'+vtxt+L.unit+'</span></div>'
      +'<div class="lr-bar"><div class="lr-band" style="left:'+lo+'%;width:'+(hi-lo)+'%"></div><div class="lr-mark" style="left:'+p+'%"></div></div>'
      +'<div class="lr-hint">'+L.hint+'</div></div>';}
  list.innerHTML=html;
  document.getElementById('score').innerHTML='<b>'+ok+'</b> / '+tot+' in Toleranz';
  const f=m.f1>0?(' · Grundton ~'+(m.f1|0)+' Hz (flach)'):'';
  /* V18.491.566 — Lab Befund Verdict Colors ← BEFUNDM_GESETZ fail-soft; Host none (BEFUNDM_VIS). SPINEM/LEHREM/bogen/reg #8a7a5a/LIFT untouched. */
  const _BFM=(SC&&SC.BEFUNDM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BEFUNDM_GESETZ)||null;
  const BEFUNDM_KRIEG=(_BFM&&Number.isFinite(_BFM.krieg))?_BFM.krieg:0xe0664a;
  const BEFUNDM_WERK=(_BFM&&Number.isFinite(_BFM.werk))?_BFM.werk:0x7fc98a;
  const BEFUNDM_MID=(_BFM&&Number.isFinite(_BFM.mid))?_BFM.mid:0xe8b54a;
  const bf=befund(P,m);const bcHex=bf.v==='KRIEGSWAFFE'?BEFUNDM_KRIEG:(bf.v==='WERKZEUG'?BEFUNDM_WERK:BEFUNDM_MID);
  const bc='#'+bcHex.toString(16).padStart(6,'0');
  /* V18.491.567 — Lab Befund Reg-Fußzeile ← REGM_GESETZ fail-soft; Host none (REGM_VIS). BEFUNDM/bogen-title/LIFT untouched. */
  const _RGM=(SC&&SC.REGM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.REGM_GESETZ)||null;
  const REGM_COLOR=(_RGM&&Number.isFinite(_RGM.color))?_RGM.color:0x8a7a5a;
  const REGM_CSS='#'+REGM_COLOR.toString(16).padStart(6,'0');
  document.getElementById('intentline').innerHTML=
    '<span style="color:'+bc+';font-weight:700;letter-spacing:.04em">BEFUND · '+bf.v+'</span>'
    +'<span style="'+LEISEM_CSS+'"> — Absicht '+INTENT_LAB[P.intent]+' · '+m.M.toFixed(2)+' kg'+f+'</span>'
    +'<div style="font-size:9px;color:'+REGM_CSS+';margin-top:4px;line-height:1.45">'+bf.reg.join(' · ')+'</div>';
}
function renderBogenTafel(P){
  // V18.491.165 — Lab Bogen-UI keRefJ ← ARENA.gefuehl fail-soft (Host juice already reads it)
  var _keRefJ=(SC&&SC.ARENA&&SC.ARENA.gefuehl&&Number.isFinite(SC.ARENA.gefuehl.keRefJ))?SC.ARENA.gefuehl.keRefJ:114;
  /* V18.491.567 — Lab Bogen Reg-Fußzeile ← REGM_GESETZ fail-soft; Host none (REGM_VIS). */
  const _RGM2=(SC&&SC.REGM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.REGM_GESETZ)||null;
  const REGM_COLOR2=(_RGM2&&Number.isFinite(_RGM2.color))?_RGM2.color:0x8a7a5a;
  const REGM_CSS2='#'+REGM_COLOR2.toString(16).padStart(6,'0');
  /* V18.491.568 — Lab Bogen-Befund Title ← BOGENM_GESETZ fail-soft; Host none (BOGENM_VIS). REGM/BEFUNDM/LIFT untouched. */
  const _BGM=(SC&&SC.BOGENM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BOGENM_GESETZ)||null;
  const BOGENM_COLOR=(_BGM&&Number.isFinite(_BGM.color))?_BGM.color:0x8ab4e8;
  const BOGENM_CSS='#'+BOGENM_COLOR.toString(16).padStart(6,'0');
  document.getElementById('intentline').innerHTML=
    '<span style="color:'+BOGENM_CSS+';font-weight:700;letter-spacing:.04em">BEFUND · BOGEN</span>'
    +'<span style="'+LEISEM_CSS+'"> — Zugkraft '+Math.round(P.zugN)+' N · Pfeilenergie '+Math.round(P.energie)+' J</span>'
    +'<div style="font-size:9px;color:'+REGM_CSS2+';margin-top:4px;line-height:1.45">Wurfarm '+((P.limbLen*100)|0)+' cm · Recurve '+(P.recurve||0).toFixed(2)+' · '+(P.bogenMat||'holz')+' · Breite '+((P.wBase*1000)|0)+' mm</div>';
  document.getElementById('lrlist').innerHTML=
    '<div class="lr na"><div class="lr-h"><span class="lr-lab">ZUGKRAFT (Ziel)</span><span class="lr-val">'+Math.round(P.zugN)+' N</span></div><div class="lr-hint">Breite des Wurfarms aus Zugkraft ÷ Steifigkeit gewählt</div></div>'
    +'<div class="lr na"><div class="lr-h"><span class="lr-lab">GESPEICHERT → PFEIL</span><span class="lr-val">'+Math.round(P.stored||0)+' → '+Math.round(P.energie)+' J</span></div><div class="lr-hint">½·F·Auszug·Kurve, dann ×η='+((P.eta||0).toFixed(2))+' — echte SI-Joule, gegen '+_keRefJ+' J geeicht</div></div>'
    +'<div class="lr na"><div class="lr-h"><span class="lr-lab">RECURVE</span><span class="lr-val">'+(P.recurve||0).toFixed(2)+'</span></div><div class="lr-hint">emergiert: kurzer Auszug / dehnbares Material speichert Energie früh</div></div>';
  document.getElementById('score').innerHTML='<b>Bogen</b> · Balkentheorie';
}

// ════════════════════════════════════════════════════════════════════
// UI
// ════════════════════════════════════════════════════════════════════
const sdiv=document.getElementById('sliders');let sliderEls={};
function buildSliders(){sdiv.innerHTML='';sliderEls={};let lastGrp='';
  const set=(P.modus==='wucht')?PARAMS_IMPACT:PARAMS_BLADE;
  set.forEach(pp=>{
    if(pp.grp!==lastGrp){const t=document.createElement('div');t.className='sec-t';t.textContent=pp.grp;sdiv.appendChild(t);lastGrp=pp.grp;}
    const wrap=document.createElement('div');wrap.className='sl';
    const fmt=v=>pp.step>=1?v.toFixed(0):(pp.step>=.01?v.toFixed(2):v.toFixed(4));
    wrap.innerHTML='<div class="sl-h"><span>'+pp.lab+'</span><span class="v" id="v_'+pp.id+'">'+fmt(P[pp.id])+'</span></div>';
    const inp=document.createElement('input');inp.type='range';inp.min=pp.min;inp.max=pp.max;inp.step=pp.step;inp.value=P[pp.id];
    inp.oninput=()=>{P[pp.id]=parseFloat(inp.value);document.getElementById('v_'+pp.id).textContent=fmt(P[pp.id]);
      [...pdiv.children].forEach(c=>c.classList.remove('on'));rebuild();};
    wrap.appendChild(inp);
    const lw=document.createElement('div');lw.className='law';lw.textContent='→ '+pp.law;wrap.appendChild(lw);
    sdiv.appendChild(wrap);sliderEls[pp.id]=inp;});
}
// Gattungen
const pdiv=document.getElementById('presets');
function gattLabel(t){const d=document.createElement('div');d.className='sec-t';d.style.cssText='flex:1 1 100%;margin-top:4px';d.textContent=t;return d;}
{let lastTool=null;const names=Object.keys(GATTUNGEN).sort((a,b)=>(GATTUNGEN[a].tool?1:0)-(GATTUNGEN[b].tool?1:0));
 for(const name of names){const isTool=!!GATTUNGEN[name].tool;
   if(isTool!==lastTool){pdiv.appendChild(gattLabel(isTool?'WERKZEUGE':'WAFFEN'));lastTool=isTool;}
   const b=document.createElement('button');b.className='btn'+(isTool?' tool':'');b.textContent=name;
   if(name===currentGattung)b.classList.add('on');
   b.onclick=()=>{delete P.guardOverride;P.backSpike=false;P.beak=false;delete P.task;delete P.cheekMul;delete P.pickLen;Object.assign(P,GATTUNGEN[name]);if(!P.task)snapBases(P);currentGattung=name;
     applyTrad(currentTrad,false);
     [...pdiv.querySelectorAll('button')].forEach(c=>c.classList.remove('on'));b.classList.add('on');
     buildSliders();rebuild();};
   pdiv.appendChild(b);}}
// Traditionen
const tdiv=document.getElementById('trads');
function applyTrad(T,doRebuild){currentTrad=T;SC.setTradition(T);
  if(P.task){ P.task.werkstoff=tradWerkstoff(T); applyTask(P); snapBases(P); }   // Kopf neu aus Aufgabe × Kultur-Metall ableiten (β/Wange/Masse)
  shapeByTradition(P,T);
  if(doRebuild)rebuild();}
for(const tn in TRADITIONEN){const b=document.createElement('button');b.className='btn';b.textContent=tn;
  if(TRADITIONEN[tn]===currentTrad)b.classList.add('on');
  b.onclick=()=>{[...tdiv.children].forEach(c=>c.classList.remove('on'));b.classList.add('on');applyTrad(TRADITIONEN[tn],true);};
  tdiv.appendChild(b);}
// Ebenen
const ldiv=document.getElementById('layers');
const LY=[['spine','Rückgrat'],['section','Schnitt'],['lehren','Lehren'],['mass','Masse'],['steel','Stahl']];
LY.forEach(([key,lab])=>{const b=document.createElement('button');b.className='btn'+(show[key]?' on':'');b.textContent=lab;
  b.onclick=()=>{show[key]=!show[key];b.classList.toggle('on');applyVis();};ldiv.appendChild(b);});
function applyVis(){const imp=P.modus==='wucht';
  if(gSpine)gSpine.visible=show.spine;if(gSection)gSection.visible=show.section&&!imp;
  if(gLehren)gLehren.visible=show.lehren;if(gMass)gMass.visible=show.mass;if(gWeapon)gWeapon.visible=show.steel;}
// Stahl/Roh + Schnitt-Karte
document.getElementById('finish').onclick=function(){bladeMat=(bladeMat===M.steel)?M.steelRaw:M.steel;this.classList.toggle('on');rebuild();};
const schliffB=document.getElementById('schliff');schliffB.onclick=()=>{show.section=!show.section;schliffB.classList.toggle('on',show.section);applyVis();};

// ════════════════════════════════════════════════════════════════════
// HARMONIK — die Klinge anschlagen: Grundmodus mit Knoten an Hand & Schlagpunkt
//   y(x,t)=A·φ(x)·sin(ωt)·e^{-t/τ}, φ kubisch mit Nullstellen bei x1=Hand, x2=CoP.
//   Der Knoten bleibt STILL → man SIEHT den Sweet-Spot (wie beim Anschlagen).
// ════════════════════════════════════════════════════════════════════
let ring={active:false,t0:0,phiMax:1,x1:0,x2:0,xTip:1,f1:0};
function modeRaw(x){const x3=ring.xTip+(ring.xTip-ring.x2)*0.6;return (x-ring.x1)*(x-ring.x2)*(x-x3);}
document.getElementById('ring').onclick=triggerRing;
function triggerRing(){if(P.modus!=='klinge'||!gBladeMesh)return;const m=measure(P),S=m.S;
  ring.x1=S.pivot;ring.x2=Math.min(m.xcop,S.xPoint*0.98);ring.xTip=S.xPoint;ring.f1=m.f1;
  let mx=1e-9;for(let s=0;s<=40;s++){const x=S.xBlade0+s/40*P.klinge;mx=Math.max(mx,Math.abs(modeRaw(x)));}ring.phiMax=mx;
  ring.active=true;ring.t0=clock.getElapsedTime();
  const info=document.getElementById('ring-info');info.style.display='block';
  document.getElementById('ring-txt').innerHTML='Grundton <b>~'+(m.f1|0)+' Hz</b> (flach) · der <b>Knoten</b> steht still — das ist der Schlagpunkt. <span style="'+MUTEM_CSS+'">(verlangsamt dargestellt)</span>';}

// ════════════════════════════════════════════════════════════════════
// PRÜFSTAND — EGO, ANATOMISCH GEFÜHRT.
//   Kopf–Schulter–Arm als echte Kette: Schulter ~16cm unter dem Auge & ~18cm seitlich,
//   gebeugter Arm (~45cm) trägt die Hand → das Schwert sitzt, wo deine Hand wäre.
//   NAHKAMPF: linke Maus HALTEN = die Maus führt den Arm (Schwung um die SCHULTER, gemessene Trägheit) = Schnitt.
//             rechte Maus = Stich (Arm stößt vor). BOGEN: linke Maus = ans Auge heben, rechte = spannen, loslassen = Schuss.
//   H = Hand. Pfeile stecken & sammeln sich. Klinge zieht Spuren.
// ════════════════════════════════════════════════════════════════════
// V18.491.189 ARENA.bogen labRaiseK/labDrawDecay fail-soft (aim raise/undraw ← _bogenFov().raiseK/drawDecay); Host none = AIM_VIS; Do NOT Fake-add Host aim
// V18.491.188 ARENA.bogen.labRebuildEps fail-soft (drawFrac mesh rebuild ← _bogenFov().rebuildEps); Host none = REBUILD_VIS; Do NOT Fake-add Host rebuild
// V18.491.187 ARENA.bogen labTargetNear/labTargetDepth fail-soft (target X-slab ← _bogenFov()); Host capsule-radius = TARGET_VIS; ≠ schwung.bladeRadiusM (coincidental); Do NOT Fake-merge
// V18.491.183 ARENA.bogen labKickBack/labKickY/labKickShake fail-soft (doRelease kick ← _bogenFov()); Host none = KICK_VIS; Do NOT Fake-add Host kick
// V18.491.181 ARENA.bogen.labMuzzleAlongGrip fail-soft (doRelease muzzle ← _bogenFov().muzzle); Host muendungM-1.2 = MUENDUNG_VIS; Do NOT Fake-align 0.2→1.2
// V18.491.178 ARENA.bogen.labEnergieFallback fail-soft (Schuss E ← P.energie||_bogenFov().eFallback); Host zugJouleRef-product = SCHUSS_VIS; Do NOT Fake-merge energie↔zugJouleRef
// V18.491.177 ARENA.bogen.labLifeSec fail-soft (arrow life cull ← _bogenFov().lifeSec); Host maxFlugSec-5 = FLUG_VIS; Do NOT Fake-align 9→5
// V18.491.176 ARENA.bogen labHoldSec/labSwayGain/labSwaySpread fail-soft (hold/sway ← _bogenFov()); Host none = HOLD_SWAY_VIS; Do NOT Fake-add Host sway
// V18.491.175 ARENA.bogen.labStuckMax fail-soft (stuck mesh ring ← _bogenFov().stuckMax); Host MAX_PFEILE-16 = STUCK_VIS; Do NOT Fake-align 40→16
// V18.491.174 ARENA.bogen.labXMax fail-soft (arrow X-cull ← _bogenFov().xMax); Host none (FLUG_VIS time dual stays)
// V18.491.173 ARENA.bogen.labLuftDrag fail-soft (arrow air drag ← _bogenFov().luftDrag); Host none = SCHUSS_DRAG_VIS
// V18.491.168 ARENA.bogen.radiusM fail-soft (target hit ← _bogenFov().radius)
// V18.491.167 ARENA.bogen.minAuszugFrac fail-soft (doRelease ← _bogenFov().minAus)
// V18.491.139 ARENA.bogen.mArrow fail-soft
// V18.491.140 studio g; Host state.gravity stays world.
// V18.491.145 ARENA.studio fail-soft (eHuman/sens/eyeY/walk/swGain); Host camera/player untouched.
// V18.491.190 ARENA.studio.labFovK fail-soft (_fovK); applyCamera FOV lerp; Host camera none; FOV_VIS.
// V18.491.191 ARENA.studio.labReadyK fail-soft (_readyK); melee ready lerp; Host none; READY_VIS.
// V18.491.192 ARENA.studio.labBobHz/labBobAmp fail-soft (_bobHz/_bobAmp); applyCamera walk bob; ≠ labFovK; Host none; BOB_VIS.
// V18.491.193 ARENA.studio.labKick/ShakeDecay* fail-soft (_kickVDecay/_kickDecay/_shakeDecay/_shakeKill); applyCamera kick/shake; Host none; CAM_DECAY_VIS.
// V18.491.195 ARENA.gefuehl.labFreezeDtMul fail-soft (_fDt); arenaUpdate freeze dt scale; Host hitStop wall-clock dual; FREEZE_VIS.
// V18.491.195 ARENA.studio.labTrailOpacity fail-soft (_trailOp); ensureTrailMesh opacity; Host none; TRAIL_VIS.
// V18.491.146 ARENA.studio dummyPos/targetPos arrays → Vector3 fail-soft.
// V18.491.147 ARENA.studio.anthro fail-soft (camera-space; not ANTHROPOS gripOptD).
// V18.491.148 STUDIO_VIS.lab=pruefstand
// V18.491.149 GRAVITY_VIS.lab=arena-g-plus
// V18.491.153 ARENA.g ← Kern fail-soft; Host state.gravity dual stays GRAVITY_VIS .149; FAHR.G 9.8 untouched.
const _BG=(SC&&SC.ARENA&&SC.ARENA.bogen)||null;
const _ST=(SC&&SC.ARENA&&SC.ARENA.studio)||null;
const _AG=(SC&&SC.ARENA&&isFinite(SC.ARENA.g))?SC.ARENA.g:9.81;
function _studioV3(key, fx,fy,fz){
  var a=_ST&&_ST[key];
  if(a&&a.length>=3&&isFinite(a[0])&&isFinite(a[1])&&isFinite(a[2]))
    return new THREE.Vector3(a[0],a[1],a[2]);
  return new THREE.Vector3(fx,fy,fz);
}
const ARENA={ dummyPos:_studioV3('dummyPos',2.4,0,0), targetPos:_studioV3('targetPos',17,1.42,0),
  mArrow:(_BG&&isFinite(_BG.mArrow))?_BG.mArrow:0.050, g:_AG,
  eHuman:(_ST&&isFinite(_ST.eHuman))?_ST.eHuman:78,
  sens:(_ST&&isFinite(_ST.sens))?_ST.sens:0.0022,
  eyeY:(_ST&&isFinite(_ST.eyeY))?_ST.eyeY:1.62,
  walk:(_ST&&isFinite(_ST.walk))?_ST.walk:2.8,
  swGain:(_ST&&isFinite(_ST.swGain))?_ST.swGain:0.011 };
const _fovK=(_ST&&isFinite(_ST.labFovK))?_ST.labFovK:9;/* V18.491.190 FOV_VIS.lab */
const _readyK=(_ST&&isFinite(_ST.labReadyK))?_ST.labReadyK:16;/* V18.491.191 READY_VIS.lab */
const _bobHz=(_ST&&isFinite(_ST.labBobHz))?_ST.labBobHz:9;/* V18.491.192 BOB_VIS.lab Hz; ≠ labFovK */
const _bobAmp=(_ST&&isFinite(_ST.labBobAmp))?_ST.labBobAmp:0.012;/* V18.491.192 BOB_VIS.lab amp */
const _kickVDecay=(_ST&&isFinite(_ST.labKickVDecay))?_ST.labKickVDecay:0.0003;/* V18.491.193 CAM_DECAY_VIS.lab */
const _kickDecay=(_ST&&isFinite(_ST.labKickDecay))?_ST.labKickDecay:0.015;/* V18.491.193 CAM_DECAY_VIS.lab */
const _shakeDecay=(_ST&&isFinite(_ST.labShakeDecay))?_ST.labShakeDecay:0.0006;/* V18.491.193 CAM_DECAY_VIS.lab */
const _shakeKill=(_ST&&isFinite(_ST.labShakeKill))?_ST.labShakeKill:0.0008;/* V18.491.193 CAM_DECAY_VIS.lab */
const _trailOp=(_ST&&isFinite(_ST.labTrailOpacity))?_ST.labTrailOpacity:0.72;/* V18.491.195 TRAIL_VIS.lab */
const _GF=(SC&&SC.ARENA&&SC.ARENA.gefuehl)||null;
const _fDt=(_GF&&isFinite(_GF.labFreezeDtMul))?_GF.labFreezeDtMul:0.05;/* V18.491.195 FREEZE_VIS.lab dt mul; Host hitStop no dt mul */
function _bogenFov(){
  var B=(SC&&SC.ARENA&&SC.ARENA.bogen)||null;
  return {
    aus: (B&&isFinite(B.auszugSec))?B.auszugSec:0.9,
    ruhe: (B&&isFinite(B.fovRuhe))?B.fovRuhe:75,
    zug: (B&&isFinite(B.fovZug))?B.fovZug:54,
    minAus: (B&&isFinite(B.minAuszugFrac))?B.minAuszugFrac:0.25 /* V18.491.167 */,
    radius: (B&&isFinite(B.radiusM))?B.radiusM:0.12 /* V18.491.168 */,
    luftDrag: (B&&isFinite(B.labLuftDrag))?B.labLuftDrag:0.0016 /* V18.491.173 */,
    xMax: (B&&isFinite(B.labXMax))?B.labXMax:30 /* V18.491.174 */,
    stuckMax: (B&&isFinite(B.labStuckMax))?B.labStuckMax:40 /* V18.491.175 STUCK_VIS.lab */,
    holdSec: (B&&isFinite(B.labHoldSec))?B.labHoldSec:0.7 /* V18.491.176 */,
    swayGain: (B&&isFinite(B.labSwayGain))?B.labSwayGain:0.5 /* V18.491.176 */,
    swaySpread: (B&&isFinite(B.labSwaySpread))?B.labSwaySpread:0.04 /* V18.491.176 HOLD_SWAY_VIS.lab */,
    lifeSec: (B&&isFinite(B.labLifeSec))?B.labLifeSec:9 /* V18.491.177 FLUG_VIS.lab */,
    eFallback: (B&&isFinite(B.labEnergieFallback))?B.labEnergieFallback:40 /* V18.491.178 SCHUSS_VIS.lab */,
    muzzle: (B&&isFinite(B.labMuzzleAlongGrip))?B.labMuzzleAlongGrip:0.2 /* V18.491.181 MUENDUNG_VIS.lab */,
    kickBack: (B&&isFinite(B.labKickBack))?B.labKickBack:5 /* V18.491.183 KICK_VIS.lab */,
    kickY: (B&&isFinite(B.labKickY))?B.labKickY:1.5 /* V18.491.183 */,
    kickShake: (B&&isFinite(B.labKickShake))?B.labKickShake:0.04 /* V18.491.183 KICK_VIS.lab */,
    targetNear: (B&&isFinite(B.labTargetNear))?B.labTargetNear:0.05 /* V18.491.187 TARGET_VIS.lab */,
    targetDepth: (B&&isFinite(B.labTargetDepth))?B.labTargetDepth:0.35 /* V18.491.187; ≠ bladeRadiusM */,
    rebuildEps: (B&&isFinite(B.labRebuildEps))?B.labRebuildEps:0.05 /* V18.491.188 REBUILD_VIS.lab */,
    raiseK: (B&&isFinite(B.labRaiseK))?B.labRaiseK:8 /* V18.491.189 AIM_VIS.lab */,
    drawDecay: (B&&isFinite(B.labDrawDecay))?B.labDrawDecay:2 /* V18.491.189 AIM_VIS.lab */
  };
}
// Anthropometrie im Kamera-Raum (Auge=0, vorne=−Z, rechts=+X, hoch=+Y) — durchschnittlicher Erwachsener
function _studioAnthro(){
  var A=_ST&&_ST.anthro, fb={shoulder:[0.19,-0.16,-0.02],elbow:[0.21,-0.42,-0.18],grip:[0.10,-0.40,-0.48]};
  function trip(k){var a=A&&A[k];return (a&&a.length>=3&&isFinite(a[0])&&isFinite(a[1])&&isFinite(a[2]))?[a[0],a[1],a[2]]:fb[k].slice();}
  return { shoulder:trip('shoulder'), elbow:trip('elbow'), grip:trip('grip') };
}
const ANTHRO=_studioAnthro(); // V18.491.147 ARENA.studio.anthro fail-soft
const arena={ active:false, kind:null, group:null, vm:null, arm:null, vmWeapon:null, dummy:null, target:null,
  arrows:[], stuck:[], drawFrac:0, drawing:false, _builtFrac:-1, raise:0, holdT:0, sway:0, recoil:0, locked:false, right:true,
  player:new THREE.Vector3(0,0,0), yaw:0, pitch:0, bob:0, keys:{w:0,a:0,s:0,d:0},
  swinging:false, thrusting:false, holdView:false, ready:0, twoH:false, gripLen:0.2, sw:{yaw:0,pitch:0,reach:0}, cooldown:0, prevTip:null, bladeL:0.9,
  baseQuat:new THREE.Quaternion(), trail:{pts:[],mesh:null}, _mdx:0, _mdy:0, lastHit:null, lastShot:null, score:{shots:0,sum:0} };
const fx={ shake:0, kick:new THREE.Vector3(), kickV:new THREE.Vector3(), fov:75, fovT:75, freeze:0 };
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const _AX=new THREE.Vector3(1,0,0), _Y=new THREE.Vector3(0,1,0), _X=new THREE.Vector3(1,0,0), _RC=new THREE.Raycaster();
const V=(a)=>new THREE.Vector3(a[0],a[1],a[2]);

/* V18.491.469 — Lab Hof Erd-Scheibe ← FELD_GESETZ fail-soft; Host none (FELD_VIS). BENCH/BODEN/HOF/LIFT untouched; segs 64 + grid left bare. */
const _FLD=(SC&&SC.FELD_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FELD_GESETZ)||null;
const FELD_SIZE=(_FLD&&Number.isFinite(_FLD.size))?_FLD.size:72;
/* V18.491.470 — Lab Hof Erd-Scheibe Tessellation ← NETZ_GESETZ fail-soft; Host none (NETZ_VIS). FELD/BENCH/BODEN/LIFT untouched; GridHelper left bare. */
const _NTZ=(SC&&SC.NETZ_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NETZ_GESETZ)||null;
const NETZ_SEGS=(_NTZ&&Number.isFinite(_NTZ.segs))?_NTZ.segs:64;
function buildGround(){const g=new THREE.Group();
  // Erd-Scheibe mit Vertex-Variation (Nebel verdeckt die Ränder)
  const geo=new THREE.PlaneGeometry(FELD_SIZE,FELD_SIZE,NETZ_SEGS,NETZ_SEGS),pa=geo.attributes.position,col=[];
  /* V18.491.494 — Lab Hof Terrain-Farben ← ERDE_GESETZ fail-soft; Host none (ERDE_VIS). GRADE/FUNKEN/FELD/NETZ/PATINA/HINTER/HOF/LIFT untouched; noise/rough left bare. */
  const _ERD=(SC&&SC.ERDE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ERDE_GESETZ)||null;
  const ERDE_DARK=(_ERD&&Number.isFinite(_ERD.dark))?_ERD.dark:0x17130e;
  const ERDE_MID=(_ERD&&Number.isFinite(_ERD.mid))?_ERD.mid:0x2a241b;
  const ERDE_LIGHT=(_ERD&&Number.isFinite(_ERD.light))?_ERD.light:0x3c3327;
  const cD=new THREE.Color(ERDE_DARK),cM=new THREE.Color(ERDE_MID),cL=new THREE.Color(ERDE_LIGHT);
  /* V18.491.495 — Lab Hof Erd-Noise ← RAUSCH_GESETZ fail-soft; Host none (RAUSCH_VIS). ERDE/GRADE/FELD/NETZ/PATINA/LIFT untouched; rough/ring left bare. */
  const _RAU=(SC&&SC.RAUSCH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RAUSCH_GESETZ)||null;
  const RAUSCH_F0=(_RAU&&Number.isFinite(_RAU.f0))?_RAU.f0:0.21;
  const RAUSCH_F1=(_RAU&&Number.isFinite(_RAU.f1))?_RAU.f1:0.055;
  const RAUSCH_W0=(_RAU&&Number.isFinite(_RAU.w0))?_RAU.w0:0.45;
  const RAUSCH_W1=(_RAU&&Number.isFinite(_RAU.w1))?_RAU.w1:0.55;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i);
    const n=hnoise(x*RAUSCH_F0,0,y*RAUSCH_F0)*RAUSCH_W0+hnoise(x*RAUSCH_F1,0,y*RAUSCH_F1)*RAUSCH_W1,t=clamp(n*0.5+0.5,0,1);
    const c=t<0.5?cD.clone().lerp(cM,t*2):cM.clone().lerp(cL,(t-0.5)*2);col.push(c.r,c.g,c.b);}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  /* V18.491.496 — Lab Hof Erd-Disk Mat ← DISK_GESETZ fail-soft; Host none (DISK_VIS). RAUSCH/ERDE/GRADE/BANKM/SCHEIBE/LIFT untouched; HOF ring left bare. */
  const _DSK=(SC&&SC.DISK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DISK_GESETZ)||null;
  const DISK_ROUGH=(_DSK&&Number.isFinite(_DSK.rough))?_DSK.rough:0.98;
  const DISK_METAL=(_DSK&&Number.isFinite(_DSK.metal))?_DSK.metal:0;
  const disk=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:DISK_ROUGH,metalness:DISK_METAL}));
  disk.rotation.x=-Math.PI/2;disk.receiveShadow=true;g.add(disk);
  // Übungshof-Ringe — V18.491.293 ← HOF_GESETZ fail-soft
  /* V18.491.497 — Lab Hof Ring Mat ← RINGF_GESETZ fail-soft; Host none (RINGF_VIS). DISK/RAUSCH/ERDE/RIM/HOF-geo/REIF/LIFT untouched. */
  const _RGF=(SC&&SC.RINGF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RINGF_GESETZ)||null;
  const RINGF_COLOR=(_RGF&&Number.isFinite(_RGF.color))?_RGF.color:0x393530;
  const RINGF_ROUGH=(_RGF&&Number.isFinite(_RGF.rough))?_RGF.rough:0.9;
  const RINGF_METAL=(_RGF&&Number.isFinite(_RGF.metal))?_RGF.metal:0;
  for(let i=1;i<=HOF_N;i++){const rr=i*HOF_STEP;const r=new THREE.Mesh(new THREE.RingGeometry(rr-HOF_HALFW,rr+HOF_HALFW,HOF_SEGS),matCol(RINGF_COLOR,RINGF_ROUGH,RINGF_METAL));r.rotation.x=-Math.PI/2;r.position.y=HOF_Y;g.add(r);}
/* V18.491.448 — Lab Grasbüschel ← GRAS_GESETZ fail-soft; Host none (GRAS_VIS). HAND/HALM/BUSCH/KEGEL/LIFT untouched; H random; Feldsteine left bare. */
const _GRA=(SC&&SC.GRAS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GRAS_GESETZ)||null;
const GRAS_R=(_GRA&&Number.isFinite(_GRA.R))?_GRA.R:0.012;
/* V18.491.449 — Lab Feldstein ← KIESEL_GESETZ fail-soft; Host none (KIESEL_VIS). GRAS/HALM/BUSCH/LIFT untouched; scaleY random left bare. */
const _KSL=(SC&&SC.KIESEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KIESEL_GESETZ)||null;
const KIESEL_R0=(_KSL&&Number.isFinite(_KSL.r0))?_KSL.r0:0.04;
const KIESEL_RSPAN=(_KSL&&Number.isFinite(_KSL.rSpan))?_KSL.rSpan:0.11;
/* V18.491.450 — Lab Feldstein-Abflachung ← FLACH_GESETZ fail-soft; Host none (FLACH_VIS). KIESEL/GRAS/PLATTE/LIFT untouched. */
const _FLA=(SC&&SC.FLACH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FLACH_GESETZ)||null;
const FLACH_Y0=(_FLA&&Number.isFinite(_FLA.y0))?_FLA.y0:0.55;
const FLACH_YSPAN=(_FLA&&Number.isFinite(_FLA.ySpan))?_FLA.ySpan:0.35;
/* V18.491.453 — Lab Hof Streu-Kosmetik ← STREU_GESETZ fail-soft; Host none (STREU_VIS). TUPF/PUNKT/GRAS/KIESEL/LIFT untouched; tuft H/nb left bare. */
const _STR=(SC&&SC.STREU_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STREU_GESETZ)||null;
const STREU_COUNT=(_STR&&Number.isFinite(_STR.count))?_STR.count:82;
const STREU_R0=(_STR&&Number.isFinite(_STR.r0))?_STR.r0:3;
const STREU_RSPAN=(_STR&&Number.isFinite(_STR.rSpan))?_STR.rSpan:26;
/* V18.491.454 — Lab Grasbüschel Halm-Anzahl ← BUESCHEL_GESETZ fail-soft; Host none (BUESCHEL_VIS). STREU/GRAS/HALM/BUSCH/LIFT untouched; H/jitter left bare. */
const _BUE=(SC&&SC.BUESCHEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BUESCHEL_GESETZ)||null;
const BUESCHEL_N0=(_BUE&&Number.isFinite(_BUE.n0))?_BUE.n0:3;
const BUESCHEL_NSPAN=(_BUE&&Number.isFinite(_BUE.nSpan))?_BUE.nSpan:3;
/* V18.491.455 — Lab Gras-Halm-Höhe ← HALMH_GESETZ fail-soft; Host none (HALMH_VIS). BUESCHEL/GRAS/HALM/STREU/LIFT untouched; jitter left bare. */
const _HMH=(SC&&SC.HALMH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HALMH_GESETZ)||null;
const HALMH_H0=(_HMH&&Number.isFinite(_HMH.h0))?_HMH.h0:0.06;
const HALMH_HSPAN=(_HMH&&Number.isFinite(_HMH.hSpan))?_HMH.hSpan:0.11;
/* V18.491.456 — Lab Grasbüschel Halm-Zitter ← ZITTER_GESETZ fail-soft; Host none (ZITTER_VIS). HALMH/BUESCHEL/GRAS/STREU/LIFT untouched. */
const _ZIT=(SC&&SC.ZITTER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ZITTER_GESETZ)||null;
const ZITTER_POS=(_ZIT&&Number.isFinite(_ZIT.pos))?_ZIT.pos:0.07;
const ZITTER_TILT=(_ZIT&&Number.isFinite(_ZIT.tilt))?_ZIT.tilt:0.55;
  // Streu-Kosmetik: Feldsteine + Grasbüschel
  /* V18.491.498 — Lab Hof Streu Mats ← STREUM_GESETZ fail-soft; Host none (STREUM_VIS). RINGF/DISK/RAUSCH/ERDE/STREU/KIESEL/GRAS/LIFT untouched. */
  const _SMAT=(SC&&SC.STREUM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STREUM_GESETZ)||null;
  const STREUM_S0=(_SMAT&&Number.isFinite(_SMAT.s0))?_SMAT.s0:0x4a453d;
  const STREUM_S1=(_SMAT&&Number.isFinite(_SMAT.s1))?_SMAT.s1:0x3a352d;
  const STREUM_S2=(_SMAT&&Number.isFinite(_SMAT.s2))?_SMAT.s2:0x504a40;
  const STREUM_SR0=(_SMAT&&Number.isFinite(_SMAT.sR0))?_SMAT.sR0:0.95;
  const STREUM_SR1=(_SMAT&&Number.isFinite(_SMAT.sR1))?_SMAT.sR1:0.95;
  const STREUM_SR2=(_SMAT&&Number.isFinite(_SMAT.sR2))?_SMAT.sR2:0.92;
  const STREUM_GRAS=(_SMAT&&Number.isFinite(_SMAT.gras))?_SMAT.gras:0x36412a;
  const STREUM_GR=(_SMAT&&Number.isFinite(_SMAT.gR))?_SMAT.gR:0.95;
  const sMat=[matCol(STREUM_S0,STREUM_SR0,0),matCol(STREUM_S1,STREUM_SR1,0),matCol(STREUM_S2,STREUM_SR2,0)],gMat=matCol(STREUM_GRAS,STREUM_GR,0);
  for(let i=0;i<STREU_COUNT;i++){const a=Math.random()*6.283,rad=STREU_R0+Math.random()*STREU_RSPAN,x=Math.cos(a)*rad,z=Math.sin(a)*rad;
    if(Math.random()<0.5){const sR=KIESEL_R0+Math.random()*KIESEL_RSPAN,st=new THREE.Mesh(new THREE.IcosahedronGeometry(sR,0),sMat[i%3]);
      st.position.set(x,sR*0.5,z);st.scale.set(1,FLACH_Y0+Math.random()*FLACH_YSPAN,1);st.rotation.set(Math.random(),Math.random()*6.28,Math.random());st.castShadow=true;st.receiveShadow=true;g.add(st);}
    else{const tuft=new THREE.Group(),nb=BUESCHEL_N0+(Math.random()*BUESCHEL_NSPAN|0);
      for(let k=0;k<nb;k++){const h=HALMH_H0+Math.random()*HALMH_HSPAN,bl=new THREE.Mesh(new THREE.ConeGeometry(GRAS_R,h,4),gMat);bl.position.set((Math.random()-0.5)*ZITTER_POS,h*0.5,(Math.random()-0.5)*ZITTER_POS);bl.rotation.z=(Math.random()-0.5)*ZITTER_TILT;tuft.add(bl);}
      tuft.position.set(x,0,z);g.add(tuft);}}
  return g;}
function buildArenaWeapon(){const g=new THREE.Group();const S=stations(P);
  if(!S.impact){g.add(loftBlade(P,S));g.add(buildGuard(P,S,currentTrad));g.add(buildGrip(P,S,currentTrad));g.add(buildPommel(P,S,currentTrad));}
  else{if(P.modus==='wucht')P.schaftR=griffD(intentControl(P))*0.5;g.add(buildHaft(P,S));g.add(buildHead(P,S));}
  g.userData.S=S;return g;}
function orientBone(mesh,A,B){const dir=B.clone().sub(A);const len=Math.max(0.02,dir.length());dir.normalize();
  mesh.position.copy(A).addScaledVector(dir,len/2);mesh.quaternion.setFromUnitVectors(_Y,dir);mesh.scale.set(1,len,1);}

/* V18.491.414 — Lab View-Model Arm-Glieder ← GLIED_GESETZ fail-soft; Host none (GLIED_VIS). OBERARM/ARM/STUMMEL/BEIN/DREIB/BIRNE/SCHLINGE/KNICK/LIFT untouched; hand/up/el/fo ONE twin. */
const _GLI=(SC&&SC.GLIED_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GLIED_GESETZ)||null;
const GLIED_HANDR=(_GLI&&Number.isFinite(_GLI.handR))?_GLI.handR:0.052;
const GLIED_HANDSX=(_GLI&&Number.isFinite(_GLI.handSx))?_GLI.handSx:1.1;
const GLIED_HANDSY=(_GLI&&Number.isFinite(_GLI.handSy))?_GLI.handSy:0.85;
const GLIED_HANDSZ=(_GLI&&Number.isFinite(_GLI.handSz))?_GLI.handSz:1.3;
const GLIED_UPR0=(_GLI&&Number.isFinite(_GLI.upR0))?_GLI.upR0:0.036;
const GLIED_UPR1=(_GLI&&Number.isFinite(_GLI.upR1))?_GLI.upR1:0.044;
const GLIED_ELR=(_GLI&&Number.isFinite(_GLI.elR))?_GLI.elR:0.05;
const GLIED_FOR0=(_GLI&&Number.isFinite(_GLI.foR0))?_GLI.foR0:0.03;
const GLIED_FOR1=(_GLI&&Number.isFinite(_GLI.foR1))?_GLI.foR1:0.04;
// — View-Model = die Arm-Kette, im Weltraum an die Kamera gerechnet, Drehpunkt SCHULTER —
function buildViewModel(){ if(arena.vm){clear(arena.vm);} arena.vm=new THREE.Group(); arena.group.add(arena.vm);
  /* V18.491.510 — Lab VM Arm Mats ← GLIEDM_GESETZ fail-soft; Host none (GLIEDM_VIS). MASSE/SCHEIBM/PFEILM/GLIED-geo/PELLM/LIFT untouched. */
  const _GLM=(SC&&SC.GLIEDM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GLIEDM_GESETZ)||null;
  const GLIEDM_METAL=(_GLM&&Number.isFinite(_GLM.metal))?_GLM.metal:0x6e4a2c;
  const GLIEDM_METALR=(_GLM&&Number.isFinite(_GLM.metalR))?_GLM.metalR:0.7;
  const GLIEDM_SKIN=(_GLM&&Number.isFinite(_GLM.skin))?_GLM.skin:0x7a5436;
  const GLIEDM_SKINR=(_GLM&&Number.isFinite(_GLM.skinR))?_GLM.skinR:0.75;
  const metal=matCol(GLIEDM_METAL,GLIEDM_METALR,0),skin=matCol(GLIEDM_SKIN,GLIEDM_SKINR,0);
  const mk=()=>{const h=new THREE.Mesh(new THREE.SphereGeometry(GLIED_HANDR,12,10),metal);h.scale.set(GLIED_HANDSX,GLIED_HANDSY,GLIED_HANDSZ);
    return {up:new THREE.Mesh(new THREE.CylinderGeometry(GLIED_UPR0,GLIED_UPR1,1,12),skin),el:new THREE.Mesh(new THREE.SphereGeometry(GLIED_ELR,14,10),skin),fo:new THREE.Mesh(new THREE.CylinderGeometry(GLIED_FOR0,GLIED_FOR1,1,12),skin),ha:h};};
  const Ah=mk(),Oh=mk();arena.vm.add(Ah.up,Ah.el,Ah.fo,Ah.ha,Oh.up,Oh.el,Oh.fo,Oh.ha);
  if(arena.kind==='bow'){P.drawFrac=arena.drawFrac;arena.vmWeapon=buildBogen(P,M.wood);arena.twoH=false;arena._mass=FEEL.massRef;}
  else{const S=stations(P);arena._stations=S;
    try{const mm=measure(P);arena._mass=mm.M;
      const IS=Math.max(FEEL.iMin,(mm.Inorm||0.1)*mm.M*S.L*S.L);                                            // DIESELBE Trägheit wie im Schwung (ein Modell)
      var scW=typeof window!=="undefined"&&window.__schmiedeCore;
      arena._windF=(scW&&typeof scW.handlingWindF==="function")?scW.handlingWindF(IS):clamp((1+Math.pow(IS/FEEL.iRef,FEEL.pow)*FEEL.dragAmp-1)/FEEL.denom,FEEL.windMin,FEEL.windMax); // V18.491.154 ARENA.handling fail-soft (.123 live)
    }catch(e){arena._mass=FEEL.massRef;arena._windF=1;}
    const gx=S.impact?(S.xGripEnd*0.55):(S.xGuard-0.03);                          // Führhand ans Gehilz (unteres Drittel bei Wucht)
    arena._gripXdom=gx;arena._gripXoff=(S.xGrip0||0)+0.05;arena._impact=S.impact;
    arena.bladeL=S.L-gx;                                                          // Hand->Spitze (NICHT Gesamtlänge!)
    arena._edge0=(S.impact?S.xHead0:S.xBlade0)-gx;                                // Schneide-Beginn relativ zur Hand
    arena._edge1=S.xPoint-gx;                                                     // Spitze relativ zur Hand
    arena.gripLen=Math.max(0.10,(S.xGrip0!=null&&S.xGripEnd!=null)?(S.xGripEnd-S.xGrip0):0.2);arena.twoH=arena.gripLen>0.17;arena.vmWeapon=buildArenaWeapon();}
  arena.vm.add(arena.vmWeapon);arena.arm=Ah;arena.armO=Oh;computeBaseQuat();
}
function computeBaseQuat(){const s=arena.right?1:-1;
  if(arena.kind==='bow'){const fwd=new THREE.Quaternion().setFromUnitVectors(_AX,new THREE.Vector3(0,0.02,-1).normalize());
    const cant=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-s*0.55);arena.baseQuat=fwd.multiply(cant);}      // Bogen leicht gekantet → Krümmung sichtbar
  else{ arena.idleQuat=new THREE.Quaternion().setFromUnitVectors(_AX,new THREE.Vector3(-s*0.20,0.48,-0.85).normalize());           // Ruhe: vorn-hoch
        arena.guardQuat=new THREE.Quaternion().setFromUnitVectors(_AX,new THREE.Vector3(-s*0.10,0.97,0.15).normalize());          // Hut (vom Tag): Klinge vertikal-hoch
        arena.baseQuat=arena.idleQuat.clone(); }
}
function camBasis(){const cy=Math.cos(arena.yaw),sy=Math.sin(arena.yaw),cp=Math.cos(arena.pitch),sp=Math.sin(arena.pitch);
  return {fwd:new THREE.Vector3(cy*cp,sp,sy*cp), fwdG:new THREE.Vector3(cy,0,sy), right:new THREE.Vector3(-sy,0,cy)};}          // FIX: rechts = (−sy,0,cy)

function mirX(a,s){return new THREE.Vector3(a[0]*s,a[1],a[2]);}
function placeViewModel(dt){if(!arena.vm)return;const s=arena.right?1:-1;cam.updateMatrixWorld(true);const A=arena.arm,S0z=new THREE.Vector3(0,0,0);
  if(arena.kind==='melee'){
    const rd=arena.ready;
    const yawQuat=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(S0z,new THREE.Vector3(Math.cos(arena.yaw),0,Math.sin(arena.yaw)),_Y));   // stabile Schulter (nur Yaw)
    const shL=mirX(ANTHRO.shoulder,s), shO=shL.clone().applyQuaternion(yawQuat);
    arena.vm.position.set(arena.player.x+shO.x,ARENA.eyeY-(arena._crouchY||0)+shO.y,arena.player.z+shO.z);
    if((arena.sw.reach||0)>0.001){const lf=new THREE.Vector3(Math.cos(arena.yaw)*Math.cos(arena.pitch),Math.sin(arena.pitch),Math.sin(arena.yaw)*Math.cos(arena.pitch));arena.vm.position.addScaledVector(lf,arena.sw.reach*0.72);}
    const lookPitch=arena.pitch*rd;                                                                   // FADEN: Klinge folgt dem Blick, sobald in Hut/Schwung -> reale Lage zum Ziel
    const cpL=Math.cos(lookPitch),spL=Math.sin(lookPitch);
    const lookFrame=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(S0z,new THREE.Vector3(Math.cos(arena.yaw)*cpL,spL,Math.sin(arena.yaw)*cpL),_Y));
    const layPitch=-(arena.swLay||0)*1.18;                                                            // vom Tag (auf) -> waagrecht durch die Schwungdrehung
    const reach=arena.sw.reach||0, thrustExt=clamp(reach/0.30,0,1);                                     // Stich-Streckung (vorgezogen)
    arena.vm.quaternion.copy(lookFrame).multiply(new THREE.Quaternion().setFromAxisAngle(_Y,arena.sw.yaw)).multiply(new THREE.Quaternion().setFromAxisAngle(_X,arena.sw.pitch));   // KEIN Fliehkraft-Pitch mehr → Schwenk bleibt waagrecht (kein U)
    arena.baseQuat=arena.idleQuat.clone().slerp(arena.guardQuat,rd);                                  // Ruhe->Hut
    const idleGrip=mirX(ANTHRO.grip,s).sub(shL), guardGrip=new THREE.Vector3(-s*0.05,-0.06,-0.34);     // Heft auf Brusthöhe
    let gripR=idleGrip.clone().lerp(guardGrip,rd);
    const idleElb=mirX(ANTHRO.elbow,s).sub(shL), guardElb=new THREE.Vector3(s*0.05,-0.22,-0.18);
    let elbowR=idleElb.clone().lerp(guardElb,rd);
    const _prF=Math.max(arena._aimF||0, rd*(1-(arena._windF||1)))*(1-thrustExt);                      // Streckung: Bereitschaft ODER leichte-Waffen-Führung (armgeführt) — der Stich übersteuert
    if(_prF>0.001){gripR.lerp(new THREE.Vector3(-s*0.03,-0.07,-0.47),_prF);elbowR.lerp(new THREE.Vector3(s*0.10,-0.19,-0.27),_prF);}
    if(thrustExt>0.001){gripR.lerp(new THREE.Vector3(-s*0.02,-0.10,-0.58),thrustExt);elbowR.lerp(new THREE.Vector3(s*0.13,-0.16,-0.34),thrustExt);}   // Hand fährt vor, Ellbogen weitet — Arm streckt, dreht nicht runter
    orientBone(A.up,S0z,elbowR);A.el.position.copy(elbowR);orientBone(A.fo,elbowR,gripR);A.ha.position.copy(gripR);
    let weaponQ=arena.baseQuat.clone();const aimW01=Math.max(thrustExt,arena._aimF||0);
    if(aimW01>0.001){arena.vm.updateMatrixWorld(true);
      const _eye=cam.position, _ld=new THREE.Vector3(Math.cos(arena.yaw)*Math.cos(arena.pitch),Math.sin(arena.pitch),Math.sin(arena.yaw)*Math.cos(arena.pitch));
      const _gW=arena.vm.localToWorld(gripR.clone()), _bL=arena.bladeL||1.0, _d=_gW.clone().sub(_eye), _aa=_ld.dot(_d), _disc=_aa*_aa-_d.lengthSq()+_bL*_bL;
      let _aimW;if(_disc>=0)_aimW=_ld.clone().multiplyScalar(_aa+Math.sqrt(_disc)).sub(_d).normalize();else _aimW=_ld.clone().multiplyScalar(Math.max(_aa,0.25)).sub(_d).normalize();   // Spitze auf dem Blickstrahl; unlösbar (kurze Klinge) -> nächster Punkt der Linie (GEMESSEN, Linienabstand: Dolch 31.1 -> 1.9 cm)
      const _bdVM=new THREE.Vector3(1,0,0).applyQuaternion(arena.baseQuat), _aimVM=_aimW.clone().applyQuaternion(arena.vm.quaternion.clone().invert());
      const _aimedQ=new THREE.Quaternion().setFromUnitVectors(_bdVM,_aimVM).multiply(arena.baseQuat);
      weaponQ=arena.baseQuat.clone().slerp(_aimedQ,aimW01);}                                          // Spitze auf das Fadenkreuz — beim Stich UND in Bereitschaft, egal wie lang die Klinge
    if(arena._rollRend&&!arena._impact)weaponQ.multiply(new THREE.Quaternion().setFromAxisAngle(_AX,arena._rollRend));   // wahre Schneide: Roll um die Klingenachse — Spitze bleibt, Schneidenebene und Krümmung drehen (Treffer folgt via _curveDir/bladeCurve)
    const bladeDir=new THREE.Vector3(1,0,0).applyQuaternion(weaponQ);
    const gXd=arena._gripXdom||0.2, gXo=arena._gripXoff||0.04;
    arena.vmWeapon.position.copy(gripR).addScaledVector(bladeDir,-gXd);                                 // 0-Punkt: Knauf-Ursprung unter die Hand -> Führhand ans Gehilz
    arena.vmWeapon.quaternion.copy(weaponQ);arena._gripR=gripR;arena._weaponQ=weaponQ;
    const O=arena.armO,vis=!!arena.twoH;[O.up,O.el,O.fo,O.ha].forEach(o=>o.visible=vis);                // zweite Hand ans untere Heft
    if(vis){const offHand=gripR.clone().addScaledVector(bladeDir,-(gXd-gXo));
      const offSh=new THREE.Vector3(-s*0.30,-0.05,-0.05), offElb=offSh.clone().lerp(offHand,0.5).add(new THREE.Vector3(0,-0.10,-0.04));
      orientBone(O.up,offSh,offElb);O.el.position.copy(offElb);orientBone(O.fo,offElb,offHand);O.ha.position.copy(offHand);}
  }else{
    arena.vm.position.copy(cam.position);
    const q=cam.quaternion.clone();const lift=lerp(-0.5,0,arena.raise);q.multiply(new THREE.Quaternion().setFromAxisAngle(_X,lift));arena.vm.quaternion.copy(q);
    const bx=arena.right?-1:1;                                                            // Bogenhand = Gegenhand
    const gripR=new THREE.Vector3(bx*0.16,-0.42,-0.34).lerp(new THREE.Vector3(bx*0.06,-0.05,-0.55),arena.raise);
    const elbowR=new THREE.Vector3(bx*0.20,-0.34,-0.22).lerp(new THREE.Vector3(bx*0.12,-0.22,-0.30),arena.raise);
    const Sb=new THREE.Vector3(bx*0.22,-0.20,-0.05);
    orientBone(A.up,Sb,elbowR);A.el.position.copy(elbowR);orientBone(A.fo,elbowR,gripR);A.ha.position.copy(gripR);
    arena.vmWeapon.position.copy(gripR);arena.vmWeapon.quaternion.copy(arena.baseQuat);arena._gripR=gripR;
  }
}

// ═══════════ TRAININGSPLATZ — Tisch, Bambus, Range ═══════════
// buildWeaponModel lebt im Kern (__schmiedeCore) — oben als SC-Alias verdrahtet (eine Quelle).
/* V18.491.290 — Lab weapon rack ← RACK_GESETZ fail-soft; Host none (RACK_VIS). KIRMES ducks / DOJO / LIFT untouched. */
const _RKG=(SC&&SC.RACK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RACK_GESETZ)||null;
const RACK_PITCH=(_RKG&&Number.isFinite(_RKG.pitch))?_RKG.pitch:0.55;
const RACK_MARGIN=(_RKG&&Number.isFinite(_RKG.margin))?_RKG.margin:0.6;
/* V18.491.336 — Lab weapon-table body height ← TISCH_GESETZ fail-soft; Host none (TISCH_VIS). RACK pitch·margin / ttop·rail / LIFT untouched. */
const _TISG=(SC&&SC.TISCH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TISCH_GESETZ)||null;
const TISCH_H=(_TISG&&Number.isFinite(_TISG.H))?_TISG.H:0.82;
/* V18.491.337 — Lab weapon-table top ← PLATTE_GESETZ fail-soft; Host none (PLATTE_VIS). TISCH/RACK/rail/LIFT untouched. */
const _PLTG=(SC&&SC.PLATTE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PLATTE_GESETZ)||null;
const PLATTE_X=(_PLTG&&Number.isFinite(_PLTG.X))?_PLTG.X:0.62;
const PLATTE_H=(_PLTG&&Number.isFinite(_PLTG.H))?_PLTG.H:0.06;
const PLATTE_Y=(_PLTG&&Number.isFinite(_PLTG.y))?_PLTG.y:0.85;
/* V18.491.338 — Lab weapon-table rail ← SCHIENE_GESETZ fail-soft; Host none (SCHIENE_VIS). RACK.pitch as rail Y-extent kept; PLATTE.H coincidence separate; TISCH/LIFT untouched. */
const _SCNG=(SC&&SC.SCHIENE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHIENE_GESETZ)||null;
const SCHIENE_T=(_SCNG&&Number.isFinite(_SCNG.T))?_SCNG.T:0.06;
const SCHIENE_X=(_SCNG&&Number.isFinite(_SCNG.x))?_SCNG.x:-0.27;
const SCHIENE_Y=(_SCNG&&Number.isFinite(_SCNG.y))?_SCNG.y:1.13;
/* V18.491.339 — Lab rack weapon pose ← HALTUNG_GESETZ fail-soft; Host none (HALTUNG_VIS). RACK/SCHIENE/PLATTE/TISCH/LIFT untouched; Math.PI/2 upright left literal. */
const _HALTG=(SC&&SC.HALTUNG_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HALTUNG_GESETZ)||null;
const HALTUNG_Y=(_HALTG&&Number.isFinite(_HALTG.y))?_HALTG.y:0.9;
const HALTUNG_ROTX=(_HALTG&&Number.isFinite(_HALTG.rotX))?_HALTG.rotX:-0.12;
function buildTable(pos){const g=new THREE.Group();g.position.copy(pos);const names=Object.keys(GATTUNGEN);
  const W=names.length*RACK_PITCH+RACK_MARGIN;
  /* V18.491.511 — Lab Waffen-Tisch Mats ← TISCHM_GESETZ fail-soft; Host none (TISCHM_VIS). GLIEDM/MASSE/TISCH/PLATTE/SCHIENE/PELLM/LIFT untouched. */
  const _TSM=(SC&&SC.TISCHM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TISCHM_GESETZ)||null;
  const TISCHM_BODY=(_TSM&&Number.isFinite(_TSM.body))?_TSM.body:0x4a3522;
  const TISCHM_BODYR=(_TSM&&Number.isFinite(_TSM.bodyR))?_TSM.bodyR:0.92;
  const TISCHM_TOP=(_TSM&&Number.isFinite(_TSM.top))?_TSM.top:0x5a4530;
  const TISCHM_TOPR=(_TSM&&Number.isFinite(_TSM.topR))?_TSM.topR:0.85;
  const TISCHM_RAIL=(_TSM&&Number.isFinite(_TSM.rail))?_TSM.rail:0x33251a;
  const TISCHM_RAILR=(_TSM&&Number.isFinite(_TSM.railR))?_TSM.railR:0.9;
  const body=new THREE.Mesh(new THREE.BoxGeometry(RACK_PITCH,TISCH_H,W),matCol(TISCHM_BODY,TISCHM_BODYR,0));body.position.set(0,TISCH_H/2,0);
  const ttop=new THREE.Mesh(new THREE.BoxGeometry(PLATTE_X,PLATTE_H,W),matCol(TISCHM_TOP,TISCHM_TOPR,0));ttop.position.set(0,PLATTE_Y,0);
  const rail=new THREE.Mesh(new THREE.BoxGeometry(SCHIENE_T,RACK_PITCH,W),matCol(TISCHM_RAIL,TISCHM_RAILR,0));rail.position.set(SCHIENE_X,SCHIENE_Y,0);g.add(body,ttop,rail);
  arena.rack=[];
  names.forEach((name,i)=>{const z=(i-(names.length-1)/2)*RACK_PITCH;
    const wm=buildWeaponModel(name);wm.position.set(0,HALTUNG_Y,z);wm.rotation.z=Math.PI/2;wm.rotation.x=HALTUNG_ROTX;          // stehend an der Schiene, Klinge hoch
    g.add(wm);arena.rack.push({name,pos:pos.clone().add(new THREE.Vector3(0,0,z)),mesh:wm});});
  return g;}
/* V18.491.294 — Lab bamboo culm ← HALM_GESETZ fail-soft; Host none (HALM_VIS). BAMBUS stand / SOCKEL / HULL / HOF / LIFT untouched. */
const _HLMG=(SC&&SC.HALM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HALM_GESETZ)||null;
const HALM_NODELEN=(_HLMG&&Number.isFinite(_HLMG.nodeLen))?_HLMG.nodeLen:0.32;
const HALM_RTOP=(_HLMG&&Number.isFinite(_HLMG.rTop))?_HLMG.rTop:0.042;
const HALM_RBOT=(_HLMG&&Number.isFinite(_HLMG.rBot))?_HLMG.rBot:0.048;
const HALM_CYLSEGS=(_HLMG&&Number.isFinite(_HLMG.cylSegs))?_HLMG.cylSegs:10;
const HALM_KNOTR=(_HLMG&&Number.isFinite(_HLMG.knotR))?_HLMG.knotR:0.047;
const HALM_KNOTT=(_HLMG&&Number.isFinite(_HLMG.knotT))?_HLMG.knotT:0.011;
const HALM_TORUSTUB=(_HLMG&&Number.isFinite(_HLMG.torusTub))?_HLMG.torusTub:6;
const HALM_TORUSRAD=(_HLMG&&Number.isFinite(_HLMG.torusRad))?_HLMG.torusRad:12;
function makeBamboo(h){const g=new THREE.Group();const seg=Math.max(2,Math.round(h/HALM_NODELEN));
  /* V18.491.512 — Lab Bambus-Halm Mats ← HALMM_GESETZ fail-soft; Host none (HALMM_VIS). TISCHM/GLIEDM/HALM/HALMH/STREUM/LIFT untouched; SOCKEL/FASSUNG left bare. */
  const _HMM=(SC&&SC.HALMM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HALMM_GESETZ)||null;
  const HALMM_CULM=(_HMM&&Number.isFinite(_HMM.culm))?_HMM.culm:0x86a544;
  const HALMM_CULMR=(_HMM&&Number.isFinite(_HMM.culmR))?_HMM.culmR:0.72;
  const HALMM_KNOT=(_HMM&&Number.isFinite(_HMM.knot))?_HMM.knot:0x5f7e2c;
  const HALMM_KNOTR=(_HMM&&Number.isFinite(_HMM.knotR))?_HMM.knotR:0.8;
  const cyl=new THREE.Mesh(new THREE.CylinderGeometry(HALM_RTOP,HALM_RBOT,h,HALM_CYLSEGS),matCol(HALMM_CULM,HALMM_CULMR,0));cyl.position.y=h/2;g.add(cyl);
  for(let s=1;s<seg;s++){const r=new THREE.Mesh(new THREE.TorusGeometry(HALM_KNOTR,HALM_KNOTT,HALM_TORUSTUB,HALM_TORUSRAD),matCol(HALMM_KNOT,HALMM_KNOTR,0));r.rotation.x=Math.PI/2;r.position.y=s*h/seg;g.add(r);}
  return g;}
/* V18.491.259 — Lab bamboo stand ← BAMBUS_GESETZ fail-soft; Host none (BAMBUS_VIS). ≠ TORII/PERGOLA; lane N=7 dual stays. */
const _BMG=(SC&&SC.BAMBUS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BAMBUS_GESETZ)||null;
const BAMBUS_N=(_BMG&&Number.isFinite(_BMG.N))?_BMG.N:4;
const BAMBUS_GAP=(_BMG&&Number.isFinite(_BMG.gap))?_BMG.gap:0.65;
const BAMBUS_HBASE=(_BMG&&Number.isFinite(_BMG.hBase))?_BMG.hBase:1.1;
const BAMBUS_HALT=(_BMG&&Number.isFinite(_BMG.hAlt))?_BMG.hAlt:0.3;
/* V18.491.291 — Lab bamboo plinth ← SOCKEL_GESETZ fail-soft; Host none (SOCKEL_VIS). BAMBUS culms / GALGEN / KIRMES / LIFT untouched. */
const _SKLG=(SC&&SC.SOCKEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SOCKEL_GESETZ)||null;
const SOCKEL_L=(_SKLG&&Number.isFinite(_SKLG.L))?_SKLG.L:2.7;
const SOCKEL_H=(_SKLG&&Number.isFinite(_SKLG.H))?_SKLG.H:0.16;
const SOCKEL_D=(_SKLG&&Number.isFinite(_SKLG.D))?_SKLG.D:0.45;
/* V18.491.295 — Lab bamboo holder cup ← FASSUNG_GESETZ fail-soft; Host none (FASSUNG_VIS). HALM / BAMBUS / SOCKEL / SCHNITT / LIFT untouched. */
const _FSG=(SC&&SC.FASSUNG_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FASSUNG_GESETZ)||null;
const FASSUNG_RTOP=(_FSG&&Number.isFinite(_FSG.rTop))?_FSG.rTop:0.06;
const FASSUNG_RBOT=(_FSG&&Number.isFinite(_FSG.rBot))?_FSG.rBot:0.07;
const FASSUNG_H=(_FSG&&Number.isFinite(_FSG.H))?_FSG.H:0.18;
const FASSUNG_SEGS=(_FSG&&Number.isFinite(_FSG.segs))?_FSG.segs:8;
const FASSUNG_Y=(_FSG&&Number.isFinite(_FSG.y))?_FSG.y:0.13;
function buildBamboo(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.513 — Lab Bambus-Stand Mats ← SOCKELM_GESETZ fail-soft; Host none (SOCKELM_VIS). HALMM/TISCHM/SOCKEL/FASSUNG-geo/LIFT untouched. */
  const _SKM=(SC&&SC.SOCKELM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SOCKELM_GESETZ)||null;
  const SOCKELM_SOCKEL=(_SKM&&Number.isFinite(_SKM.sockel))?_SKM.sockel:0x3a2a1a;
  const SOCKELM_FASSUNG=(_SKM&&Number.isFinite(_SKM.fassung))?_SKM.fassung:0x2a2018;
  const SOCKELM_ROUGH=(_SKM&&Number.isFinite(_SKM.rough))?_SKM.rough:0.9;
  const base=new THREE.Mesh(new THREE.BoxGeometry(SOCKEL_L,SOCKEL_H,SOCKEL_D),matCol(SOCKELM_SOCKEL,SOCKELM_ROUGH,0));base.position.y=SOCKEL_H/2;g.add(base);
  arena.bamboo=[];const N=BAMBUS_N;
  for(let i=0;i<N;i++){const px=(i-(N-1)/2)*BAMBUS_GAP, h=BAMBUS_HBASE+(i%2)*BAMBUS_HALT;
    const holder=new THREE.Mesh(new THREE.CylinderGeometry(FASSUNG_RTOP,FASSUNG_RBOT,FASSUNG_H,FASSUNG_SEGS),matCol(SOCKELM_FASSUNG,SOCKELM_ROUGH,0));holder.position.set(px,FASSUNG_Y,0);g.add(holder);
    const pole=makeBamboo(h);pole.position.set(px,SOCKEL_H,0);g.add(pole);   // V18.491.609 wire: Halm steht auf Sockel-Oberkante ← SOCKEL_GESETZ.H (no bump; ≠ SCHWELLE.H coincidence)
    arena.bamboo.push({mesh:pole,wx:pos.x+px,wz:pos.z,baseY:pos.y+0.16,h,cut:false,wobble:0});}
  return g;}
/* V18.491.261 — Lab striking wand height ← WAND_GESETZ fail-soft; Host none (WAND_VIS). ≠ BANNER.H; LIFT untouched. */
const _WDG=(SC&&SC.WAND_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WAND_GESETZ)||null;
const WAND_H=(_WDG&&Number.isFinite(_WDG.H))?_WDG.H:2.35;
/* V18.491.262 — Lab wand strike bands ← BAND_GESETZ fail-soft; Host none (BAND_VIS). ≠ WAND.H. */
const BAND_YS_FALLBACK=[1.00,1.20,1.40,1.60,1.80];
const _BDG=(SC&&SC.BAND_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BAND_GESETZ)||null;
const BAND_YS=(_BDG&&Array.isArray(_BDG.ys)&&_BDG.ys.length===5&&_BDG.ys.every(function(y){return Number.isFinite(y);}))
  ? _BDG.ys.slice()
  : BAND_YS_FALLBACK.slice();
/* V18.491.292 — Lab wand hit hull ← HULL_GESETZ fail-soft; Host none (HULL_VIS). WAND.H / BAND.ys / PENDEL / LIFT untouched. */
const _HLG=(SC&&SC.HULL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HULL_GESETZ)||null;
const HULL_R=(_HLG&&Number.isFinite(_HLG.R))?_HLG.R:0.22;
const HULL_Y0=(_HLG&&Number.isFinite(_HLG.y0))?_HLG.y0:0.90;
const HULL_Y1=(_HLG&&Number.isFinite(_HLG.y1))?_HLG.y1:1.92;
/* V18.491.331 — Lab striking-wand rod ← STAB_GESETZ fail-soft; Host none (STAB_VIS). WAND.H/BAND.ys/HULL/bands·cone·flag·base/LIFT untouched. */
const _STAB=(SC&&SC.STAB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STAB_GESETZ)||null;
const STAB_R0=(_STAB&&Number.isFinite(_STAB.R0))?_STAB.R0:0.035;
const STAB_R1=(_STAB&&Number.isFinite(_STAB.R1))?_STAB.R1:0.055;
/* V18.491.332 — Lab wand strike-band mesh ← STREIF_GESETZ fail-soft; Host none (STREIF_VIS). BAND.ys/STAB/WAND/cone·flag·base/LIFT untouched. */
const _STRFG=(SC&&SC.STREIF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STREIF_GESETZ)||null;
const STREIF_R=(_STRFG&&Number.isFinite(_STRFG.R))?_STRFG.R:0.065;
const STREIF_H=(_STRFG&&Number.isFinite(_STRFG.H))?_STRFG.H:0.20;
/* V18.491.333 — Lab wand tip cone ← SPITZE_GESETZ fail-soft; Host none (SPITZE_VIS). STAB.R1 coincidence kept separate; STREIF/BAND/flag·base/LIFT untouched. */
const _SPIG=(SC&&SC.SPITZE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPITZE_GESETZ)||null;
const SPITZE_R=(_SPIG&&Number.isFinite(_SPIG.R))?_SPIG.R:0.055;
const SPITZE_H=(_SPIG&&Number.isFinite(_SPIG.H))?_SPIG.H:0.16;
const SPITZE_YOFF=(_SPIG&&Number.isFinite(_SPIG.yOff))?_SPIG.yOff:0.06;
/* V18.491.334 — Lab wand find-flag ← WIMPEL_GESETZ fail-soft; Host none (WIMPEL_VIS). FAHNE/SPITZE/STREIF/STAB/base/LIFT untouched. */
const _WIMG=(SC&&SC.WIMPEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WIMPEL_GESETZ)||null;
const WIMPEL_W=(_WIMG&&Number.isFinite(_WIMG.W))?_WIMG.W:0.44;
const WIMPEL_H=(_WIMG&&Number.isFinite(_WIMG.H))?_WIMG.H:0.28;
const WIMPEL_XOFF=(_WIMG&&Number.isFinite(_WIMG.xOff))?_WIMG.xOff:0.24;
const WIMPEL_YOFF=(_WIMG&&Number.isFinite(_WIMG.yOff))?_WIMG.yOff:0.12;
/* V18.491.335 — Lab wand base ← STAND_GESETZ fail-soft; Host none (STAND_VIS). HULL.R coincidence kept separate; SOCKEL/FUSS/WIMPEL/SPITZE/STREIF/STAB/LIFT untouched. */
const _STND=(SC&&SC.STAND_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STAND_GESETZ)||null;
const STAND_R0=(_STND&&Number.isFinite(_STND.R0))?_STND.R0:0.16;
const STAND_R1=(_STND&&Number.isFinite(_STND.R1))?_STND.R1:0.22;
const STAND_H=(_STND&&Number.isFinite(_STND.H))?_STND.H:0.18;
const STAND_Y=(_STND&&Number.isFinite(_STND.y))?_STND.y:0.09;
/* V18.491.293 — Lab courtyard rings ← HOF_GESETZ fail-soft; Host none (HOF_VIS). SOCKEL / GALGEN / KIRMES / RITTER / FOLGE / LIFT untouched. */
const _HFG=(SC&&SC.HOF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HOF_GESETZ)||null;
const HOF_N=(_HFG&&Number.isFinite(_HFG.n))?_HFG.n:6;
const HOF_STEP=(_HFG&&Number.isFinite(_HFG.step))?_HFG.step:2.5;
const HOF_HALFW=(_HFG&&Number.isFinite(_HFG.halfW))?_HFG.halfW:0.025;
const HOF_SEGS=(_HFG&&Number.isFinite(_HFG.segs))?_HFG.segs:56;
const HOF_Y=(_HFG&&Number.isFinite(_HFG.y))?_HFG.y:0.006;
function buildWand(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.514 — Lab Treffer-Wand Mats ← WANDM_GESETZ fail-soft; Host none (WANDM_VIS). SOCKELM/HALMM/TISCHM/WAND/STREIF/LIFT untouched. */
  const _WDM=(SC&&SC.WANDM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WANDM_GESETZ)||null;
  const WANDM_WIL=(_WDM&&Number.isFinite(_WDM.wil))?_WDM.wil:0x9a8a4a;
  const WANDM_WILR=(_WDM&&Number.isFinite(_WDM.wilR))?_WDM.wilR:0.85;
  const WANDM_RED=(_WDM&&Number.isFinite(_WDM.red))?_WDM.red:0xc23b2b;
  const WANDM_REDR=(_WDM&&Number.isFinite(_WDM.redR))?_WDM.redR:0.72;
  const WANDM_WHITE=(_WDM&&Number.isFinite(_WDM.white))?_WDM.white:0xe8e2d4;
  const WANDM_WHITER=(_WDM&&Number.isFinite(_WDM.whiteR))?_WDM.whiteR:0.72;
  const WANDM_DARK=(_WDM&&Number.isFinite(_WDM.dark))?_WDM.dark:0x3a2a18;
  const WANDM_DARKR=(_WDM&&Number.isFinite(_WDM.darkR))?_WDM.darkR:0.9;
  const wil=matCol(WANDM_WIL,WANDM_WILR,0),red=matCol(WANDM_RED,WANDM_REDR,0),white=matCol(WANDM_WHITE,WANDM_WHITER,0),dark=matCol(WANDM_DARK,WANDM_DARKR,0);
  const H=WAND_H;
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(STAB_R0,STAB_R1,H,8),wil);rod.position.set(0,H/2,0);rod.castShadow=true;g.add(rod);
  const bandYs=BAND_YS;                                                                              // rot-weiss gestreiftes Trefferband (klar sichtbar)
  for(let i=0;i<bandYs.length;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(STREIF_R,STREIF_R,STREIF_H,12),i%2?white:red);b.position.set(0,bandYs[i],0);g.add(b);}
  const cone=new THREE.Mesh(new THREE.ConeGeometry(SPITZE_R,SPITZE_H,8),dark);cone.position.set(0,H+SPITZE_YOFF,0);g.add(cone);
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(WIMPEL_W,WIMPEL_H),red);flag.position.set(WIMPEL_XOFF,H-WIMPEL_YOFF,0);flag.material.side=2;g.add(flag);   // Wimpel zum Auffinden
  const base=new THREE.Mesh(new THREE.CylinderGeometry(STAND_R0,STAND_R1,STAND_H,12),dark);base.position.set(0,STAND_Y,0);g.add(base);
  arena.wand={x:pos.x,z:pos.z,R:HULL_R,y0:HULL_Y0,y1:HULL_Y1,rod,grp:g,struck:false,respawnAt:0};
  return g;}
function updateWand(){const W=arena.wand;if(W&&W.struck&&W.respawnAt&&clock.getElapsedTime()>W.respawnAt){W.struck=false;W.rod.visible=true;W.respawnAt=0;}}
/* V18.491.263 — Lab clout target ← CLOUT_GESETZ fail-soft; Host none (CLOUT_VIS). ≠ SCHEIBE/BAND; LIFT untouched. */
const CLOUT_COLS_FALLBACK=[0xe0d088,0xc85a3a,0xcab876];
const _CLG=(SC&&SC.CLOUT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.CLOUT_GESETZ)||null;
const CLOUT_COLS=(_CLG&&Array.isArray(_CLG.cols)&&_CLG.cols.length===3)
  ? _CLG.cols.slice()
  : CLOUT_COLS_FALLBACK.slice();
const CLOUT_STEP=(_CLG&&Number.isFinite(_CLG.step))?_CLG.step:0.5;
const CLOUT_POLEH=(_CLG&&Number.isFinite(_CLG.poleH))?_CLG.poleH:1.7;
const CLOUT_HITR=(_CLG&&Number.isFinite(_CLG.hitR))?_CLG.hitR:1.5;
/* V18.491.341 — Lab clout find-flag ← FAEHNE_GESETZ fail-soft; Host none (FAEHNE_VIS). WIMPEL/FAHNE/CLOUT cols·step·poleH·hitR/PAD/LIFT untouched. */
const _FAEH=(SC&&SC.FAEHNE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FAEHNE_GESETZ)||null;
const FAEHNE_W=(_FAEH&&Number.isFinite(_FAEH.W))?_FAEH.W:0.5;
const FAEHNE_H=(_FAEH&&Number.isFinite(_FAEH.H))?_FAEH.H:0.3;
const FAEHNE_XOFF=(_FAEH&&Number.isFinite(_FAEH.xOff))?_FAEH.xOff:0.27;
const FAEHNE_Y=(_FAEH&&Number.isFinite(_FAEH.y))?_FAEH.y:1.45;
/* V18.491.342 — Lab clout mast mesh ← MAST_GESETZ fail-soft; Host none (MAST_VIS). CLOUT.poleH · FAEHNE · WIMPEL/FAHNE · PAD/PFOSTEN/STEHER/SAULE/LIFT untouched. */
const _MAST=(SC&&SC.MAST_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.MAST_GESETZ)||null;
const MAST_R0=(_MAST&&Number.isFinite(_MAST.R0))?_MAST.R0:0.03;
const MAST_R1=(_MAST&&Number.isFinite(_MAST.R1))?_MAST.R1:0.03;
const MAST_Y=(_MAST&&Number.isFinite(_MAST.y))?_MAST.y:0.85;
/* V18.491.343 — Lab clout ring mesh ← RING_GESETZ fail-soft; Host none (RING_VIS). MAST.R coincidence · CLOUT.step · FAEHNE · REIF/OESE/ROLLE/LIFT untouched. */
const _RING=(SC&&SC.RING_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RING_GESETZ)||null;
const RING_H=(_RING&&Number.isFinite(_RING.H))?_RING.H:0.03;
const RING_Y0=(_RING&&Number.isFinite(_RING.y0))?_RING.y0:0.015;
const RING_YSTEP=(_RING&&Number.isFinite(_RING.yStep))?_RING.yStep:0.004;
function buildClout(pos){const g=new THREE.Group();g.position.copy(pos);const cols=CLOUT_COLS;
  /* V18.491.516 — Lab Clout Ring Mat ← RINGCM_GESETZ fail-soft; Host none (RINGCM_VIS). CLOUTM/CLOUT cols/RING geo/RINGF/LIFT untouched. */
  const _RCM=(SC&&SC.RINGCM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RINGCM_GESETZ)||null;
  const RINGCM_R=(_RCM&&Number.isFinite(_RCM.rough))?_RCM.rough:0.7;
  const RINGCM_M=(_RCM&&Number.isFinite(_RCM.metal))?_RCM.metal:0;
  for(let i=3;i>=1;i--){const ring=new THREE.Mesh(new THREE.CylinderGeometry(i*CLOUT_STEP,i*CLOUT_STEP,RING_H,28),matCol(cols[3-i],RINGCM_R,RINGCM_M));ring.position.set(0,RING_Y0+(3-i)*RING_YSTEP,0);g.add(ring);}
  /* V18.491.515 — Lab Clout Mast+Fahne Mats ← CLOUTM_GESETZ fail-soft; Host none (CLOUTM_VIS). WANDM/CLOUT/MAST/FAEHNE geo/LIFT untouched; ring mat rough left bare. */
  const _CLM=(SC&&SC.CLOUTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.CLOUTM_GESETZ)||null;
  const CLOUTM_POLE=(_CLM&&Number.isFinite(_CLM.pole))?_CLM.pole:0x4a3520;
  const CLOUTM_POLER=(_CLM&&Number.isFinite(_CLM.poleR))?_CLM.poleR:0.9;
  const CLOUTM_FLAG=(_CLM&&Number.isFinite(_CLM.flag))?_CLM.flag:0xd8c050;
  const CLOUTM_FLAGR=(_CLM&&Number.isFinite(_CLM.flagR))?_CLM.flagR:0.7;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(MAST_R0,MAST_R1,CLOUT_POLEH,8),matCol(CLOUTM_POLE,CLOUTM_POLER,0));pole.position.set(0,MAST_Y,0);g.add(pole);
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(FAEHNE_W,FAEHNE_H),matCol(CLOUTM_FLAG,CLOUTM_FLAGR,0));flag.position.set(FAEHNE_XOFF,FAEHNE_Y,0);flag.material.side=2;g.add(flag);
  arena.clout={x:pos.x,z:pos.z,R:CLOUT_HITR,grp:g};return g;}
const _AH=(typeof window!=="undefined"&&window.__schmiedeCore&&window.__schmiedeCore.ARENA&&window.__schmiedeCore.ARENA.handling)||null;
const FEEL={
  massRef:(_AH&&isFinite(_AH.massRef))?_AH.massRef:1.4,
  massMin:(_AH&&isFinite(_AH.massMin))?_AH.massMin:0.42,
  massMax:(_AH&&isFinite(_AH.massMax))?_AH.massMax:2.30,
  iMin:(_AH&&isFinite(_AH.iMin))?_AH.iMin:0.02,
  iRef:(_AH&&isFinite(_AH.iRef)&&_AH.iRef>0)?_AH.iRef:0.16,
  pow:(_AH&&isFinite(_AH.pow))?_AH.pow:0.45,
  dragAmp:(_AH&&isFinite(_AH.dragAmp))?_AH.dragAmp:0.45,
  denom:(_AH&&isFinite(_AH.denom)&&_AH.denom>0)?_AH.denom:0.5,
  windMin:(_AH&&isFinite(_AH.windMin))?_AH.windMin:0.3,
  windMax:(_AH&&isFinite(_AH.windMax))?_AH.windMax:1
}; // V18.491.138 mass · V18.491.154 windF ← ARENA.handling fail-soft
function wMass(){                                                                    // V18.491.122 — core handlingMul first; FEEL fallback
  var sc=typeof window!=="undefined"&&window.__schmiedeCore;
  if(sc&&typeof sc.handlingMul==="function") return sc.handlingMul(arena._mass);
  return clamp((arena._mass||FEEL.massRef)/FEEL.massRef,FEEL.massMin,FEEL.massMax);}   // 1.0 = mittlere Waffe, <1 leicht, >1 schwer
function dentArmor(worldPt,depth){const A=arena.armored;if(!A||!A.torso)return;
  const geo=A.torso.geometry,pos=geo.attributes.position;
  const lp=A.torso.worldToLocal(worldPt.clone());const iA=Math.atan2(lp.z,lp.x),iY=lp.y;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
    let dA=Math.atan2(z,x)-iA;while(dA>Math.PI)dA-=2*Math.PI;while(dA<-Math.PI)dA+=2*Math.PI;
    const d=Math.hypot(dA*0.22,y-iY),fall=1-d/0.27;
    if(fall>0){const push=depth*fall*fall,r=Math.hypot(x,z)||1e-4,nr=Math.max(r*0.45,r-push);pos.setX(i,x*nr/r);pos.setZ(i,z*nr/r);}}
  pos.needsUpdate=true;geo.computeVertexNormals();}
/* V18.491.272 — Lab armored dummy ← HARNISCH_GESETZ fail-soft; Host none (HARNISCH_VIS). FEDER/KETTE/LIFT untouched. */
const _HNG=(SC&&SC.HARNISCH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HARNISCH_GESETZ)||null;
const HARNISCH_SCALE=(_HNG&&Number.isFinite(_HNG.scale))?_HNG.scale:0.82;
const HARNISCH_HITCD=(_HNG&&Number.isFinite(_HNG.hitCD))?_HNG.hitCD:0.28;
const HARNISCH_HITR=(_HNG&&Number.isFinite(_HNG.hitR))?_HNG.hitR:0.42;
const HARNISCH_Y0=(_HNG&&Number.isFinite(_HNG.y0))?_HNG.y0:0.7;
const HARNISCH_Y1=(_HNG&&Number.isFinite(_HNG.y1))?_HNG.y1:2.18;
/* V18.491.344 — Lab armored-dummy base ← PODES_GESETZ fail-soft; Host none (PODES_VIS). HARNISCH logic · STAND H/y coincidence · FUSS/SOCKEL/PFOSTEN/post/LIFT untouched. */
const _POD=(SC&&SC.PODES_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PODES_GESETZ)||null;
const PODES_R0=(_POD&&Number.isFinite(_POD.R0))?_POD.R0:0.40;
const PODES_R1=(_POD&&Number.isFinite(_POD.R1))?_POD.R1:0.50;
const PODES_H=(_POD&&Number.isFinite(_POD.H))?_POD.H:0.18;
const PODES_Y=(_POD&&Number.isFinite(_POD.y))?_POD.y:0.09;
/* V18.491.345 — Lab armored-dummy post ← PFOST_GESETZ fail-soft; Host none (PFOST_VIS). PODES · PAD · PFOSTEN/STEHER/SAULE/STUTZE · GESTELL R coincidence · MAST/HARNISCH/LIFT untouched. */
const _PFST=(SC&&SC.PFOST_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PFOST_GESETZ)||null;
const PFOST_R0=(_PFST&&Number.isFinite(_PFST.R0))?_PFST.R0:0.06;
const PFOST_R1=(_PFST&&Number.isFinite(_PFST.R1))?_PFST.R1:0.07;
const PFOST_H=(_PFST&&Number.isFinite(_PFST.H))?_PFST.H:0.85;
const PFOST_Y=(_PFST&&Number.isFinite(_PFST.y))?_PFST.y:0.52;
/* V18.491.346 — Lab armored-dummy legs ← BEIN_GESETZ fail-soft; Host none (BEIN_VIS). PFOST · STUTZE.R0 coincidence · PAD/PODES/STEHER/torso/LIFT untouched. */
const _BEIN=(SC&&SC.BEIN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BEIN_GESETZ)||null;
const BEIN_R0=(_BEIN&&Number.isFinite(_BEIN.R0))?_BEIN.R0:0.09;
const BEIN_R1=(_BEIN&&Number.isFinite(_BEIN.R1))?_BEIN.R1:0.07;
const BEIN_H=(_BEIN&&Number.isFinite(_BEIN.H))?_BEIN.H:0.7;
const BEIN_XOFF=(_BEIN&&Number.isFinite(_BEIN.xOff))?_BEIN.xOff:0.13;
const BEIN_Y=(_BEIN&&Number.isFinite(_BEIN.y))?_BEIN.y:0.95;
/* V18.491.347 — Lab armored-dummy torso ← RUMPF_GESETZ fail-soft; Host none (RUMPF_VIS). BEIN · HARNISCH · PFOST/PODES · knight torso · ridge/LIFT untouched. */
const _RMPF=(SC&&SC.RUMPF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RUMPF_GESETZ)||null;
const RUMPF_R0=(_RMPF&&Number.isFinite(_RMPF.R0))?_RMPF.R0:0.27;
const RUMPF_R1=(_RMPF&&Number.isFinite(_RMPF.R1))?_RMPF.R1:0.22;
const RUMPF_H=(_RMPF&&Number.isFinite(_RMPF.H))?_RMPF.H:0.78;
const RUMPF_Y=(_RMPF&&Number.isFinite(_RMPF.y))?_RMPF.y:1.56;
const RUMPF_SCALEZ=(_RMPF&&Number.isFinite(_RMPF.scaleZ))?_RMPF.scaleZ:0.72;
/* V18.491.348 — Lab armored-dummy ridge ← GRAT_GESETZ fail-soft; Host none (GRAT_VIS). RUMPF.y coincidence · HARNISCH · BEIN · knight ridge · surcoat/LIFT untouched. */
const _GRAT=(SC&&SC.GRAT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GRAT_GESETZ)||null;
const GRAT_W=(_GRAT&&Number.isFinite(_GRAT.W))?_GRAT.W:0.03;
const GRAT_H=(_GRAT&&Number.isFinite(_GRAT.H))?_GRAT.H:0.7;
const GRAT_D=(_GRAT&&Number.isFinite(_GRAT.D))?_GRAT.D:0.16;
const GRAT_Y=(_GRAT&&Number.isFinite(_GRAT.y))?_GRAT.y:1.56;
const GRAT_Z=(_GRAT&&Number.isFinite(_GRAT.z))?_GRAT.z:0.20;
/* V18.491.349 — Lab armored-dummy surcoat ← WAMS_GESETZ fail-soft; Host none (WAMS_VIS). RUMPF · HARNISCH · GRAT · knight surcoat · pauldron/LIFT untouched. */
const _WAMS=(SC&&SC.WAMS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WAMS_GESETZ)||null;
const WAMS_R0=(_WAMS&&Number.isFinite(_WAMS.R0))?_WAMS.R0:0.28;
const WAMS_R1=(_WAMS&&Number.isFinite(_WAMS.R1))?_WAMS.R1:0.25;
const WAMS_H=(_WAMS&&Number.isFinite(_WAMS.H))?_WAMS.H:0.46;
const WAMS_Y=(_WAMS&&Number.isFinite(_WAMS.y))?_WAMS.y:1.42;
const WAMS_SCALEZ=(_WAMS&&Number.isFinite(_WAMS.scaleZ))?_WAMS.scaleZ:0.74;
/* V18.491.350 — Lab armored-dummy pauldron ← SCHULTER_GESETZ fail-soft; Host none (SCHULTER_VIS). WAMS · knight y=1.67 · RUMPF/HARNISCH · neck/helm/LIFT untouched. */
const _SCHU=(SC&&SC.SCHULTER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHULTER_GESETZ)||null;
const SCHULTER_R=(_SCHU&&Number.isFinite(_SCHU.R))?_SCHU.R:0.15;
const SCHULTER_XOFF=(_SCHU&&Number.isFinite(_SCHU.xOff))?_SCHU.xOff:0.29;
const SCHULTER_Y=(_SCHU&&Number.isFinite(_SCHU.y))?_SCHU.y:1.95;
const SCHULTER_SCALEY=(_SCHU&&Number.isFinite(_SCHU.scaleY))?_SCHU.scaleY:0.82;
const SCHULTER_SCALEZ=(_SCHU&&Number.isFinite(_SCHU.scaleZ))?_SCHU.scaleZ:0.92;
/* V18.491.351 — Lab armored-dummy neck ← HALS_GESETZ fail-soft; Host none (HALS_VIS). SCHULTER · HELM · RUMPF · knight neck y=1.78 · LIFT untouched. */
const _HALS=(SC&&SC.HALS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HALS_GESETZ)||null;
const HALS_R0=(_HALS&&Number.isFinite(_HALS.R0))?_HALS.R0:0.10;
const HALS_R1=(_HALS&&Number.isFinite(_HALS.R1))?_HALS.R1:0.12;
const HALS_H=(_HALS&&Number.isFinite(_HALS.H))?_HALS.H:0.12;
const HALS_Y=(_HALS&&Number.isFinite(_HALS.y))?_HALS.y:2.06;
/* V18.491.352 — Lab armored-dummy helm ← HELM_GESETZ fail-soft; Host none (HELM_VIS). HALS · knight y=1.95 · SCHULTER · VISIER/KAMM/LIFT untouched. */
const _HELM=(SC&&SC.HELM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HELM_GESETZ)||null;
const HELM_R=(_HELM&&Number.isFinite(_HELM.R))?_HELM.R:0.17;
const HELM_Y=(_HELM&&Number.isFinite(_HELM.y))?_HELM.y:2.23;
const HELM_SCALEY=(_HELM&&Number.isFinite(_HELM.scaleY))?_HELM.scaleY:1.12;
const HELM_SCALEZ=(_HELM&&Number.isFinite(_HELM.scaleZ))?_HELM.scaleZ:1.05;
/* V18.491.353 — Lab armored-dummy visor ← VISIER_GESETZ fail-soft; Host none (VISIER_VIS). HELM · KAMM · knight visor y=1.94 · LIFT untouched. */
const _VIS=(SC&&SC.VISIER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.VISIER_GESETZ)||null;
const VISIER_W=(_VIS&&Number.isFinite(_VIS.W))?_VIS.W:0.30;
const VISIER_H=(_VIS&&Number.isFinite(_VIS.H))?_VIS.H:0.035;
const VISIER_D=(_VIS&&Number.isFinite(_VIS.D))?_VIS.D:0.06;
const VISIER_Y=(_VIS&&Number.isFinite(_VIS.y))?_VIS.y:2.22;
const VISIER_Z=(_VIS&&Number.isFinite(_VIS.z))?_VIS.z:0.16;
/* V18.491.354 — Lab armored-dummy crest ← KAMM_GESETZ fail-soft; Host none (KAMM_VIS). GRAT.W coincidence · knight crest · VISIER/HELM/LIFT untouched. */
const _KAMM=(SC&&SC.KAMM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KAMM_GESETZ)||null;
const KAMM_W=(_KAMM&&Number.isFinite(_KAMM.W))?_KAMM.W:0.03;
const KAMM_H=(_KAMM&&Number.isFinite(_KAMM.H))?_KAMM.H:0.12;
const KAMM_D=(_KAMM&&Number.isFinite(_KAMM.D))?_KAMM.D:0.22;
const KAMM_Y=(_KAMM&&Number.isFinite(_KAMM.y))?_KAMM.y:2.40;
function buildArmoredDummy(pos){const g=new THREE.Group();g.position.copy(pos);g.scale.setScalar(HARNISCH_SCALE);
  /* V18.491.517 — Lab Harnisch-Dummy Mats ← HARNISCHM_GESETZ fail-soft; Host none (HARNISCHM_VIS). RINGCM/CLOUTM/HARNISCH logic/PELLM/knight mats/LIFT untouched. */
  const _HRM=(SC&&SC.HARNISCHM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HARNISCHM_GESETZ)||null;
  const HARNISCHM_STEEL=(_HRM&&Number.isFinite(_HRM.steel))?_HRM.steel:0x9298a0;
  const HARNISCHM_STEELR=(_HRM&&Number.isFinite(_HRM.steelR))?_HRM.steelR:0.40;
  const HARNISCHM_STEELM=(_HRM&&Number.isFinite(_HRM.steelM))?_HRM.steelM:0.80;
  const HARNISCHM_DARK=(_HRM&&Number.isFinite(_HRM.dark))?_HRM.dark:0x26262c;
  const HARNISCHM_DARKR=(_HRM&&Number.isFinite(_HRM.darkR))?_HRM.darkR:0.6;
  const HARNISCHM_DARKM=(_HRM&&Number.isFinite(_HRM.darkM))?_HRM.darkM:0.3;
  const HARNISCHM_WOOD=(_HRM&&Number.isFinite(_HRM.wood))?_HRM.wood:0x4a3520;
  const HARNISCHM_WOODR=(_HRM&&Number.isFinite(_HRM.woodR))?_HRM.woodR:0.9;
  const HARNISCHM_TABARD=(_HRM&&Number.isFinite(_HRM.tabard))?_HRM.tabard:0x6a2a28;
  const HARNISCHM_TABARDR=(_HRM&&Number.isFinite(_HRM.tabardR))?_HRM.tabardR:0.6;
  const steel=matCol(HARNISCHM_STEEL,HARNISCHM_STEELR,HARNISCHM_STEELM),dark=matCol(HARNISCHM_DARK,HARNISCHM_DARKR,HARNISCHM_DARKM),wood=matCol(HARNISCHM_WOOD,HARNISCHM_WOODR,0),tabard=matCol(HARNISCHM_TABARD,HARNISCHM_TABARDR,0);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(PODES_R0,PODES_R1,PODES_H,16),dark);base.position.y=PODES_Y;g.add(base);
  const post=new THREE.Mesh(new THREE.CylinderGeometry(PFOST_R0,PFOST_R1,PFOST_H,8),wood);post.position.y=PFOST_Y;g.add(post);
  for(const sx of [-BEIN_XOFF,BEIN_XOFF]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(BEIN_R0,BEIN_R1,BEIN_H,10),steel);leg.position.set(sx,BEIN_Y,0);g.add(leg);}
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(RUMPF_R0,RUMPF_R1,RUMPF_H,22,9),steel);torso.position.y=RUMPF_Y;torso.scale.z=RUMPF_SCALEZ;torso.castShadow=true;g.add(torso);
  const ridge=new THREE.Mesh(new THREE.BoxGeometry(GRAT_W,GRAT_H,GRAT_D),dark);ridge.position.set(0,GRAT_Y,GRAT_Z);g.add(ridge);                 // Mittelgrat des Harnischs
  const surcoat=new THREE.Mesh(new THREE.CylinderGeometry(WAMS_R0,WAMS_R1,WAMS_H,18),tabard);surcoat.position.y=WAMS_Y;surcoat.scale.z=WAMS_SCALEZ;g.add(surcoat);
  for(const sx of [-SCHULTER_XOFF,SCHULTER_XOFF]){const pa=new THREE.Mesh(new THREE.SphereGeometry(SCHULTER_R,12,10),steel);pa.position.set(sx,SCHULTER_Y,0);pa.scale.set(1,SCHULTER_SCALEY,SCHULTER_SCALEZ);g.add(pa);}
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(HALS_R0,HALS_R1,HALS_H,10),dark);neck.position.y=HALS_Y;g.add(neck);
  const helm=new THREE.Mesh(new THREE.SphereGeometry(HELM_R,14,12),steel);helm.position.y=HELM_Y;helm.scale.set(1,HELM_SCALEY,HELM_SCALEZ);g.add(helm);
  const visor=new THREE.Mesh(new THREE.BoxGeometry(VISIER_W,VISIER_H,VISIER_D),dark);visor.position.set(0,VISIER_Y,VISIER_Z);g.add(visor);
  const crest=new THREE.Mesh(new THREE.BoxGeometry(KAMM_W,KAMM_H,KAMM_D),tabard);crest.position.set(0,KAMM_Y,0);g.add(crest);
  arena.armored={grp:g,torso,mat:steel,flash:0,spark:0,hitCD:0,dent:0,breach:0,deflect:0};
  return g;}
function updateArmored(dt){const A=arena.armored;if(!A)return;
  /* V18.491.556 — Lab Panzer-Blitz RGB ← BLITZM_GESETZ fail-soft; Host none (BLITZM_VIS). LEBENM/PIPM/HARNISCHM/gambeson-flash/tel/LIFT untouched. */
  const _BLM=(SC&&SC.BLITZM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BLITZM_GESETZ)||null;
  const BLITZM_R0=(_BLM&&Number.isFinite(_BLM.r0))?_BLM.r0:0.57;
  const BLITZM_G0=(_BLM&&Number.isFinite(_BLM.g0))?_BLM.g0:0.60;
  const BLITZM_B0=(_BLM&&Number.isFinite(_BLM.b0))?_BLM.b0:0.63;
  const BLITZM_FR=(_BLM&&Number.isFinite(_BLM.fr))?_BLM.fr:0.45;
  const BLITZM_FG=(_BLM&&Number.isFinite(_BLM.fg))?_BLM.fg:0.40;
  const BLITZM_FB=(_BLM&&Number.isFinite(_BLM.fb))?_BLM.fb:0.18;
  const BLITZM_SR=(_BLM&&Number.isFinite(_BLM.sr))?_BLM.sr:0.5;
  const BLITZM_SG=(_BLM&&Number.isFinite(_BLM.sg))?_BLM.sg:-0.20;
  const BLITZM_SB=(_BLM&&Number.isFinite(_BLM.sb))?_BLM.sb:-0.22;
  /* V18.491.561 — Lab Blitz/Funke Abklingen ← ABKLINGM_GESETZ fail-soft; Host none (ABKLINGM_VIS). TELM/BLITZM RGB/STECHF ring-decay/LIFT untouched. */
  const _AKM=(SC&&SC.ABKLINGM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ABKLINGM_GESETZ)||null;
  const ABKLINGM_FLASH=(_AKM&&Number.isFinite(_AKM.flash))?_AKM.flash:3.2;
  const ABKLINGM_SPARK=(_AKM&&Number.isFinite(_AKM.spark))?_AKM.spark:4.5;
  if(A.hitCD>0)A.hitCD-=dt;
  if(A.flash>0)A.flash=Math.max(0,A.flash-dt*ABKLINGM_FLASH);
  if(A.spark>0)A.spark=Math.max(0,A.spark-dt*ABKLINGM_SPARK);
  const c=A.mat&&A.mat.color;if(c&&c.setRGB){const f=A.flash,sp=A.spark;c.setRGB(BLITZM_R0+BLITZM_FR*f+BLITZM_SR*sp,BLITZM_G0+BLITZM_FG*f+BLITZM_SG*sp,BLITZM_B0+BLITZM_FB*f+BLITZM_SB*sp);}   // Blitz gold (Treffer), Funke rot (abgeglitten)
}
function tryHitArmored(handW,bladeDir,vel){const A=arena.armored;if(!A||A.hitCD>HARNISCH_HITCD)return false;
  A.grp.updateMatrixWorld(true);const bw=A.torso.getWorldPosition(new THREE.Vector3());let hit=false,hitPt=null;
  hitPt=bladeHitsColumn(handW,bladeDir,bw,HARNISCH_HITR,HARNISCH_Y0,HARNISCH_Y1);hit=!!hitPt;
  if(!hit)return false;
  A.hitCD=HARNISCH_HITCD;const mm=arena._m||measure(P),M=mm.M;
  const vAx=Math.abs(vel.dot(bladeDir)),vLat=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir)).length();
  const thrust=vAx>vLat*0.9,sharp=(mm.edgeWinkel!=null&&mm.edgeWinkel<32),pointy=(mm.betaDeg!=null&&mm.betaDeg<30);
  const mEff=Math.max(0.02,(mm.mEffFrac||0.2)*M);
  if(thrust){
    if(pointy){const KE=0.5*mEff*vAx*vAx;A.breach++;A.flash=1;if(hitPt)dentArmor(hitPt,0.022);popText('➤ in die Harnisch-Fuge gestochen — '+KE.toFixed(0)+' J',FUGEM_CSS,0,-0.04);fx.shake=Math.max(fx.shake,0.10);fx.freeze=Math.max(fx.freeze,0.06);arena.cooldown=0.30;}
    else{A.spark=1;A.deflect++;popText('✗ am Plattenrand abgewiesen — kein spitzer Ort',TREFFM_BAD_CSS,0,0);bladeRecoil(0.70);}
  }else if(sharp){
    A.spark=1;A.deflect++;popText('✗ vom Harnisch abgeglitten — Schnitt prallt von der Platte',TREFFM_BAD_CSS,0,0);bladeRecoil(0.85);
  }else{
    const KE=0.5*mEff*vLat*vLat,mom=M*vLat;A.dent++;   // Energie: mEff · Impuls/Beule: volle MasseA.flash=1;if(hitPt)dentArmor(hitPt,clamp(mom*0.006,0.025,0.07));popText('✹ Wucht durch den Harnisch — '+KE.toFixed(0)+' J Erschütterung',WUCHTM_CSS,0,-0.04);
    fx.shake=Math.max(fx.shake,0.16+clamp(mom*0.02,0,0.20));fx.freeze=Math.max(fx.freeze,0.08);const B=camBasis();fx.kickV.addScaledVector(B.fwd,-1.1);arena.cooldown=0.32;
  }
  return true;}

/* V18.491.271 — Lab spring-pell ← FEDER_GESETZ fail-soft; Host none (FEDER_VIS). KETTE/PENDEL/LIFT untouched. */
const _FDG=(SC&&SC.FEDER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FEDER_GESETZ)||null;
const FEDER_H=(_FDG&&Number.isFinite(_FDG.H))?_FDG.H:1.15;
const FEDER_K=(_FDG&&Number.isFinite(_FDG.k))?_FDG.k:26;
const FEDER_DAMP=(_FDG&&Number.isFinite(_FDG.damp))?_FDG.damp:2.6;
const FEDER_HITR=(_FDG&&Number.isFinite(_FDG.hitR))?_FDG.hitR:0.27;
/* V18.491.355 — Lab spring-pell base ← TELLER_GESETZ fail-soft; Host none (TELLER_VIS). FEDER logic · PODES/SOCKEL/STAND/FUSS/LIFT untouched. */
const _TEL=(SC&&SC.TELLER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TELLER_GESETZ)||null;
const TELLER_R0=(_TEL&&Number.isFinite(_TEL.R0))?_TEL.R0:0.30;
const TELLER_R1=(_TEL&&Number.isFinite(_TEL.R1))?_TEL.R1:0.40;
const TELLER_H=(_TEL&&Number.isFinite(_TEL.H))?_TEL.H:0.22;
const TELLER_Y=(_TEL&&Number.isFinite(_TEL.y))?_TEL.y:0.11;
/* V18.491.356 — Lab spring-pell coils ← WENDEL_GESETZ fail-soft; Host none (WENDEL_VIS). FEDER · TELLER · REIF/RING/OESE/LIFT untouched. */
const _WEN=(SC&&SC.WENDEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WENDEL_GESETZ)||null;
const WENDEL_R0=(_WEN&&Number.isFinite(_WEN.R0))?_WEN.R0:0.18;
const WENDEL_DR=(_WEN&&Number.isFinite(_WEN.dR))?_WEN.dR:0.01;
const WENDEL_TUBE=(_WEN&&Number.isFinite(_WEN.tube))?_WEN.tube:0.03;
const WENDEL_Y0=(_WEN&&Number.isFinite(_WEN.y0))?_WEN.y0:0.22;
const WENDEL_YSTEP=(_WEN&&Number.isFinite(_WEN.yStep))?_WEN.yStep:0.07;
const WENDEL_N=(_WEN&&Number.isFinite(_WEN.N))?_WEN.N:3;
/* V18.491.357 — Lab spring-pell pole ← STANGE_GESETZ fail-soft; Host none (STANGE_VIS). FEDER logic · TELLER/WENDEL/PFOST/MAST/knight-post/LIFT untouched. */
const _STA=(SC&&SC.STANGE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STANGE_GESETZ)||null;
const STANGE_R0=(_STA&&Number.isFinite(_STA.R0))?_STA.R0:0.06;
const STANGE_R1=(_STA&&Number.isFinite(_STA.R1))?_STA.R1:0.08;
/* V18.491.358 — Lab spring-pell bands ← MUFFE_GESETZ fail-soft; Host none (MUFFE_VIS). FEDER · TELLER/WENDEL/STANGE · REIF/RING/OESE/STREIF/BAND/LIFT untouched. */
const MUFFE_YS_FALLBACK=[0.45,0.75,1.05];
const _MUF=(SC&&SC.MUFFE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.MUFFE_GESETZ)||null;
const MUFFE_R=(_MUF&&Number.isFinite(_MUF.R))?_MUF.R:0.075;
const MUFFE_TUBE=(_MUF&&Number.isFinite(_MUF.tube))?_MUF.tube:0.016;
const MUFFE_YS=(_MUF&&Array.isArray(_MUF.ys)&&_MUF.ys.length===3&&_MUF.ys.every(function(y){return Number.isFinite(y);}))
  ?_MUF.ys.slice()
  :MUFFE_YS_FALLBACK.slice();
/* V18.491.359 — Lab spring-pell head ← KOPF_GESETZ fail-soft; Host none (KOPF_VIS). FEDER logic · TELLER/WENDEL/STANGE/MUFFE/HELM/LIFT untouched. */
const _KOP=(SC&&SC.KOPF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KOPF_GESETZ)||null;
const KOPF_R=(_KOP&&Number.isFinite(_KOP.R))?_KOP.R:0.16;
/* V18.491.361 — Lab spring-pell pivot ← ZAPFEN_GESETZ fail-soft; Host none (ZAPFEN_VIS). FEDER · TELLER/STANGE/KOPF/MUFFE/WENDEL/DREH/LIFT untouched. */
const _ZAP=(SC&&SC.ZAPFEN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ZAPFEN_GESETZ)||null;
const ZAPFEN_Y=(_ZAP&&Number.isFinite(_ZAP.y))?_ZAP.y:0.35;
function buildSpringPell(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.518 — Lab Feder-Pell Mats ← FEDERM_GESETZ fail-soft; Host none (FEDERM_VIS). HARNISCHM/PELLM/NAHTM/FEDER logic/sequence/LIFT untouched. */
  const _FDM=(SC&&SC.FEDERM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FEDERM_GESETZ)||null;
  const FEDERM_WOOD=(_FDM&&Number.isFinite(_FDM.wood))?_FDM.wood:0x6b4f2f;
  const FEDERM_WOODR=(_FDM&&Number.isFinite(_FDM.woodR))?_FDM.woodR:0.85;
  const FEDERM_DARK=(_FDM&&Number.isFinite(_FDM.dark))?_FDM.dark:0x2a1d12;
  const FEDERM_DARKR=(_FDM&&Number.isFinite(_FDM.darkR))?_FDM.darkR:0.9;
  const FEDERM_IRON=(_FDM&&Number.isFinite(_FDM.iron))?_FDM.iron:0x3a3832;
  const FEDERM_IRONR=(_FDM&&Number.isFinite(_FDM.ironR))?_FDM.ironR:0.4;
  const FEDERM_PAD=(_FDM&&Number.isFinite(_FDM.pad))?_FDM.pad:0x8a5a3a;
  const FEDERM_PADR=(_FDM&&Number.isFinite(_FDM.padR))?_FDM.padR:0.7;
  const wood=matCol(FEDERM_WOOD,FEDERM_WOODR,0),dark=matCol(FEDERM_DARK,FEDERM_DARKR,0),iron=matCol(FEDERM_IRON,FEDERM_IRONR,0),pad=matCol(FEDERM_PAD,FEDERM_PADR,0);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(TELLER_R0,TELLER_R1,TELLER_H,14),dark);base.position.y=TELLER_Y;g.add(base);
  for(let i=0;i<WENDEL_N;i++){const coil=new THREE.Mesh(new THREE.TorusGeometry(WENDEL_R0-i*WENDEL_DR,WENDEL_TUBE,6,16),iron);coil.position.y=WENDEL_Y0+i*WENDEL_YSTEP;coil.rotation.x=Math.PI/2;g.add(coil);}
  const piv=new THREE.Group();piv.position.set(0,ZAPFEN_Y,0);g.add(piv);const H=FEDER_H;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(STANGE_R0,STANGE_R1,H,10),wood);pole.position.y=H/2;piv.add(pole);
  for(const yy of MUFFE_YS){const r=new THREE.Mesh(new THREE.TorusGeometry(MUFFE_R,MUFFE_TUBE,6,14),dark);r.position.y=yy;r.rotation.x=Math.PI/2;piv.add(r);}
  const head=new THREE.Mesh(new THREE.SphereGeometry(KOPF_R,14,11),pad);head.position.y=H;piv.add(head);
  arena.springPell={grp:g,piv,head,H,ax:0,az:0,vx:0,vz:0,hitCD:0,combo:0,lastHitT:-9};return g;}
function updateSpringPell(dt){const P=arena.springPell;if(!P)return;
  if(dt>0){const k=FEDER_K,damp=FEDER_DAMP;P.vx+=(-k*P.ax-damp*P.vx)*dt;P.vz+=(-k*P.az-damp*P.vz)*dt;P.ax+=P.vx*dt;P.az+=P.vz*dt;
    const mag=Math.hypot(P.ax,P.az);if(mag>0.95){const sc=0.95/mag;P.ax*=sc;P.az*=sc;P.vx*=0.4;P.vz*=0.4;}}
  P.piv.rotation.z=-P.ax;P.piv.rotation.x=P.az;
  if(P.hitCD>0)P.hitCD-=dt;
  if(P.combo>0&&clock.getElapsedTime()-P.lastHitT>2.2)P.combo=0;}
function tryHitSpringPell(handW,bladeDir,vel){const P=arena.springPell;if(!P||P.hitCD>0.16)return false;
  P.grp.updateMatrixWorld(true);const chk=[P.piv.localToWorld(new THREE.Vector3(0,0.72,0)),P.piv.localToWorld(new THREE.Vector3(0,0.95,0)),P.piv.localToWorld(new THREE.Vector3(0,P.H,0))];
  const e0=arena._edge0,e1=arena._edge1,eLen=Math.max(0.02,e1-e0);let hit=false;
  outer:for(let i=0;i<=6;i++){const p=e0+(i/6)*eLen,pt=handW.clone().addScaledVector(bladeDir,p);for(const hp of chk){if(pt.distanceTo(hp)<FEDER_HITR){hit=true;break outer;}}}
  if(!hit)return false;
  const ms=wMass();P.vx+=clamp(vel.x,-9,9)*0.32*ms;P.vz+=clamp(vel.z,-9,9)*0.32*ms;P.hitCD=0.14;
  const sp=Math.hypot(vel.x,vel.z)*ms;
  if(sp>2.5){P.combo++;P.lastHitT=clock.getElapsedTime();popText('Treffer'+(P.combo>1?' x'+P.combo:'')+' — Pfahl federt zurueck',TREFFM_OK_CSS,0,-0.04);fx.shake=Math.max(fx.shake,0.07);fx.freeze=Math.max(fx.freeze,0.035);arena.cooldown=0.12;}
  else{popText('zu zaghaft',WARNM_CSS,0,0);bladeRecoil(0.4);}
  return true;}

/* V18.491.273 — Lab sequence arc ← FOLGE_GESETZ fail-soft; Host none (FOLGE_VIS). HARNISCH/FEDER/LIFT untouched. */
const _FLG=(SC&&SC.FOLGE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FOLGE_GESETZ)||null;
const FOLGE_N=(_FLG&&Number.isFinite(_FLG.N))?_FLG.N:5;
const FOLGE_SPREAD=(_FLG&&Number.isFinite(_FLG.spread))?_FLG.spread:Math.PI*0.66;
const FOLGE_R=(_FLG&&Number.isFinite(_FLG.r))?_FLG.r:2.5;
/* V18.491.340 — Lab sequence pads ← PAD_GESETZ fail-soft; Host none (PAD_VIS). FOLGE N/spread/r · PLATTE/TISCH/SCHIENE/RACK/STAND/SOCKEL/FUSS/LIFT untouched. */
const _PADG=(SC&&SC.PAD_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PAD_GESETZ)||null;
const PAD_POSTR0=(_PADG&&Number.isFinite(_PADG.postR0))?_PADG.postR0:0.05;
const PAD_POSTR1=(_PADG&&Number.isFinite(_PADG.postR1))?_PADG.postR1:0.07;
const PAD_POSTH=(_PADG&&Number.isFinite(_PADG.postH))?_PADG.postH:1.45;
const PAD_POSTY=(_PADG&&Number.isFinite(_PADG.postY))?_PADG.postY:0.72;
const PAD_PADXY=(_PADG&&Number.isFinite(_PADG.padXY))?_PADG.padXY:0.42;
const PAD_PADZ=(_PADG&&Number.isFinite(_PADG.padZ))?_PADG.padZ:0.07;
const PAD_PADY=(_PADG&&Number.isFinite(_PADG.padY))?_PADG.padY:1.5;
const PAD_RIMR=(_PADG&&Number.isFinite(_PADG.rimR))?_PADG.rimR:0.24;
const PAD_RIMTUBE=(_PADG&&Number.isFinite(_PADG.rimTube))?_PADG.rimTube:0.025;
function buildSequence(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.519 — Lab Folge/Sequence Mats ← FOLGEM_GESETZ fail-soft; Host none (FOLGEM_VIS). FEDERM/PELLM/HARNISCHM/FOLGE/PAD geo/lit RGB/LIFT untouched. */
  const _FGM=(SC&&SC.FOLGEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FOLGEM_GESETZ)||null;
  const FOLGEM_WOOD=(_FGM&&Number.isFinite(_FGM.wood))?_FGM.wood:0x4a3520;
  const FOLGEM_WOODR=(_FGM&&Number.isFinite(_FGM.woodR))?_FGM.woodR:0.9;
  const FOLGEM_DARK=(_FGM&&Number.isFinite(_FGM.dark))?_FGM.dark:0x2a1d12;
  const FOLGEM_DARKR=(_FGM&&Number.isFinite(_FGM.darkR))?_FGM.darkR:0.9;
  const FOLGEM_PAD=(_FGM&&Number.isFinite(_FGM.pad))?_FGM.pad:0x556070;
  const FOLGEM_PADR=(_FGM&&Number.isFinite(_FGM.padR))?_FGM.padR:0.55;
  const wood=matCol(FOLGEM_WOOD,FOLGEM_WOODR,0),dark=matCol(FOLGEM_DARK,FOLGEM_DARKR,0);
  arena.sequence={grp:g,pads:[],active:0,hitCD:0,combo:0,best:0,lastT:-9};
  const N=FOLGE_N,spread=FOLGE_SPREAD,r=FOLGE_R;
  for(let i=0;i<N;i++){const a=-spread/2+spread*(i/(N-1)),px=Math.sin(a)*r,pz=Math.cos(a)*r;
    const post=new THREE.Mesh(new THREE.CylinderGeometry(PAD_POSTR0,PAD_POSTR1,PAD_POSTH,8),wood);post.position.set(px,PAD_POSTY,pz);g.add(post);
    const pad=new THREE.Mesh(new THREE.BoxGeometry(PAD_PADXY,PAD_PADXY,PAD_PADZ),matCol(FOLGEM_PAD,FOLGEM_PADR,0));pad.position.set(px,PAD_PADY,pz);pad.lookAt(new THREE.Vector3(pos.x,pos.y+PAD_PADY,pos.z));g.add(pad);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(PAD_RIMR,PAD_RIMTUBE,6,18),dark);rim.position.copy(pad.position);rim.quaternion.copy(pad.quaternion);g.add(rim);
    arena.sequence.pads.push({mesh:pad,wx:pos.x+px,wy:pos.y+PAD_PADY,wz:pos.z+pz,lit:false});}
  const mid=Math.floor(N/2);arena.sequence.pads[mid].lit=true;arena.sequence.active=mid;return g;}
function updateSequence(dt){const S=arena.sequence;if(!S)return;
  /* V18.491.524 — Lab Folge Lit/Dim RGB ← LEUCHT_GESETZ fail-soft; Host none (LEUCHT_VIS). PIPM/FOLGEM/FOLGE/RINGF/RINGCM/arena/LIFT untouched. */
  const _FLIT=(SC&&SC.LEUCHT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEUCHT_GESETZ)||null;
  const LEUCHT_LITR=(_FLIT&&Number.isFinite(_FLIT.litR))?_FLIT.litR:0.92;
  const LEUCHT_LITG=(_FLIT&&Number.isFinite(_FLIT.litG))?_FLIT.litG:0.74;
  const LEUCHT_LITB=(_FLIT&&Number.isFinite(_FLIT.litB))?_FLIT.litB:0.18;
  const LEUCHT_DIMR=(_FLIT&&Number.isFinite(_FLIT.dimR))?_FLIT.dimR:0.33;
  const LEUCHT_DIMG=(_FLIT&&Number.isFinite(_FLIT.dimG))?_FLIT.dimG:0.38;
  const LEUCHT_DIMB=(_FLIT&&Number.isFinite(_FLIT.dimB))?_FLIT.dimB:0.44;
  for(const p of S.pads){const c=p.mesh.material.color;if(c&&c.setRGB){if(p.lit)c.setRGB(LEUCHT_LITR,LEUCHT_LITG,LEUCHT_LITB);else c.setRGB(LEUCHT_DIMR,LEUCHT_DIMG,LEUCHT_DIMB);}}
  if(S.hitCD>0)S.hitCD-=dt;
  if(S.combo>0&&clock.getElapsedTime()-S.lastT>3.5){if(S.combo>S.best)S.best=S.combo;S.combo=0;}}
function tryHitSequence(handW,bladeDir,vel){const S=arena.sequence;if(!S||S.hitCD>0.18)return false;
  const e0=arena._edge0,e1=arena._edge1,eLen=Math.max(0.02,e1-e0);
  for(let pi=0;pi<S.pads.length;pi++){const p=S.pads[pi];let hit=false;
    for(let i=0;i<=5;i++){const pp=e0+(i/5)*eLen,pt=handW.clone().addScaledVector(bladeDir,pp);if(Math.hypot(pt.x-p.wx,pt.z-p.wz)<0.30&&Math.abs(pt.y-p.wy)<0.32){hit=true;break;}}
    if(!hit)continue;
    if(p.lit){p.lit=false;let nx;do{nx=Math.floor(Math.random()*S.pads.length);}while(nx===pi);S.pads[nx].lit=true;S.active=nx;S.combo++;S.lastT=clock.getElapsedTime();popText('Folge '+S.combo+(S.combo>S.best&&S.combo>2?' — Bestwert!':''),TREFFM_OK_CSS,0,-0.04);fx.shake=Math.max(fx.shake,0.05);fx.freeze=Math.max(fx.freeze,0.03);arena.cooldown=0.18;}
    else{popText('falsches Ziel — Folge bricht',TREFFM_BAD_CSS,0,0);if(S.combo>S.best)S.best=S.combo;S.combo=0;arena.cooldown=0.2;}
    S.hitCD=0.2;return true;}
  return false;}

// ═══ RITTER-ARENA: zwei Felder (gepanzert / ungepanzert), echter Schwertkampf ═══
/* V18.491.363 — Lab knight body base ← PLINT_GESETZ fail-soft; Host none (PLINT_VIS). PODES/TELLER/SOCKEL/STAND/FUSS/PFAHL/LIFT untouched. */
const _PLI=(SC&&SC.PLINT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PLINT_GESETZ)||null;
const PLINT_R0=(_PLI&&Number.isFinite(_PLI.R0))?_PLI.R0:0.17;
const PLINT_R1=(_PLI&&Number.isFinite(_PLI.R1))?_PLI.R1:0.21;
const PLINT_H=(_PLI&&Number.isFinite(_PLI.H))?_PLI.H:0.10;
const PLINT_Y=(_PLI&&Number.isFinite(_PLI.y))?_PLI.y:0.05;
/* V18.491.364 — Lab knight legs ← SCHENKEL_GESETZ fail-soft; Host none (SCHENKEL_VIS). BEIN xOff coincidence · PLINT/PFOST/STUTZE/LIFT untouched. */
const _SKL=(SC&&SC.SCHENKEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHENKEL_GESETZ)||null;
const SCHENKEL_R0=(_SKL&&Number.isFinite(_SKL.R0))?_SKL.R0:0.085;
const SCHENKEL_R1=(_SKL&&Number.isFinite(_SKL.R1))?_SKL.R1:0.07;
const SCHENKEL_H=(_SKL&&Number.isFinite(_SKL.H))?_SKL.H:0.92;
const SCHENKEL_XOFF=(_SKL&&Number.isFinite(_SKL.xOff))?_SKL.xOff:0.13;
const SCHENKEL_Y=(_SKL&&Number.isFinite(_SKL.y))?_SKL.y:0.54;
/* V18.491.365 — Lab knight torso ← LEIB_GESETZ fail-soft; Host none (LEIB_VIS). RUMPF coincidence · SCHENKEL/PLINT/GRAT/WAMS/HARNISCH/LIFT untouched. */
const _LEI=(SC&&SC.LEIB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEIB_GESETZ)||null;
const LEIB_R0A=(_LEI&&Number.isFinite(_LEI.R0a))?_LEI.R0a:0.27;
const LEIB_R0B=(_LEI&&Number.isFinite(_LEI.R0b))?_LEI.R0b:0.29;
const LEIB_R1=(_LEI&&Number.isFinite(_LEI.R1))?_LEI.R1:0.22;
const LEIB_H=(_LEI&&Number.isFinite(_LEI.H))?_LEI.H:0.78;
const LEIB_Y=(_LEI&&Number.isFinite(_LEI.y))?_LEI.y:1.28;
const LEIB_SCALEZ=(_LEI&&Number.isFinite(_LEI.scaleZ))?_LEI.scaleZ:0.72;
/* V18.491.366 — Lab knight ridge ← RIPPE_GESETZ fail-soft; Host none (RIPPE_VIS). GRAT W/H/D/z coincidence · LEIB/RUMPF/KAMM/LIFT untouched. */
const _RIP=(SC&&SC.RIPPE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RIPPE_GESETZ)||null;
const RIPPE_W=(_RIP&&Number.isFinite(_RIP.W))?_RIP.W:0.03;
const RIPPE_H=(_RIP&&Number.isFinite(_RIP.H))?_RIP.H:0.7;
const RIPPE_D=(_RIP&&Number.isFinite(_RIP.D))?_RIP.D:0.16;
const RIPPE_Y=(_RIP&&Number.isFinite(_RIP.y))?_RIP.y:1.28;
const RIPPE_Z=(_RIP&&Number.isFinite(_RIP.z))?_RIP.z:0.20;
/* V18.491.367 — Lab knight surcoat ← KOTTE_GESETZ fail-soft; Host none (KOTTE_VIS). WAMS Ha/ya/scaleZ coincidence · LEIB/RIPPE/RUMPF/LIFT untouched. */
const _KOT=(SC&&SC.KOTTE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KOTTE_GESETZ)||null;
const KOTTE_R0=(_KOT&&Number.isFinite(_KOT.R0))?_KOT.R0:0.30;
const KOTTE_R1=(_KOT&&Number.isFinite(_KOT.R1))?_KOT.R1:0.26;
const KOTTE_HA=(_KOT&&Number.isFinite(_KOT.Ha))?_KOT.Ha:0.46;
const KOTTE_HB=(_KOT&&Number.isFinite(_KOT.Hb))?_KOT.Hb:0.70;
const KOTTE_YA=(_KOT&&Number.isFinite(_KOT.ya))?_KOT.ya:1.42;
const KOTTE_YB=(_KOT&&Number.isFinite(_KOT.yb))?_KOT.yb:1.30;
const KOTTE_SCALEZ=(_KOT&&Number.isFinite(_KOT.scaleZ))?_KOT.scaleZ:0.74;
/* V18.491.368 — Lab knight pauldron ← ACHSEL_GESETZ fail-soft; Host none (ACHSEL_VIS). SCHULTER R/xOff/scales coincidence · KOTTE/LEIB/RIPPE/LIFT untouched. */
const _ACH=(SC&&SC.ACHSEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ACHSEL_GESETZ)||null;
const ACHSEL_R=(_ACH&&Number.isFinite(_ACH.R))?_ACH.R:0.15;
const ACHSEL_XOFF=(_ACH&&Number.isFinite(_ACH.xOff))?_ACH.xOff:0.29;
const ACHSEL_Y=(_ACH&&Number.isFinite(_ACH.y))?_ACH.y:1.67;
const ACHSEL_SCALEY=(_ACH&&Number.isFinite(_ACH.scaleY))?_ACH.scaleY:0.82;
const ACHSEL_SCALEZ=(_ACH&&Number.isFinite(_ACH.scaleZ))?_ACH.scaleZ:0.92;
/* V18.491.369 — Lab knight neck ← NACKEN_GESETZ fail-soft; Host none (NACKEN_VIS). HALS R0/R1/H coincidence · ACHSEL/KOTTE/LEIB/LIFT untouched. */
const _NAC=(SC&&SC.NACKEN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NACKEN_GESETZ)||null;
const NACKEN_R0=(_NAC&&Number.isFinite(_NAC.R0))?_NAC.R0:0.10;
const NACKEN_R1=(_NAC&&Number.isFinite(_NAC.R1))?_NAC.R1:0.12;
const NACKEN_H=(_NAC&&Number.isFinite(_NAC.H))?_NAC.H:0.12;
const NACKEN_Y=(_NAC&&Number.isFinite(_NAC.y))?_NAC.y:1.78;
/* V18.491.370 — Lab knight helm ← HAUBE_GESETZ fail-soft; Host none (HAUBE_VIS). HELM R/scales coincidence · NACKEN/ACHSEL/KOPF/VISIER/KAMM/hood/LIFT untouched. */
const _HAU=(SC&&SC.HAUBE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HAUBE_GESETZ)||null;
const HAUBE_R=(_HAU&&Number.isFinite(_HAU.R))?_HAU.R:0.17;
const HAUBE_Y=(_HAU&&Number.isFinite(_HAU.y))?_HAU.y:1.95;
const HAUBE_SCALEY=(_HAU&&Number.isFinite(_HAU.scaleY))?_HAU.scaleY:1.12;
const HAUBE_SCALEZ=(_HAU&&Number.isFinite(_HAU.scaleZ))?_HAU.scaleZ:1.05;
/* V18.491.371 — Lab knight visor ← BLEND_GESETZ fail-soft; Host none (BLEND_VIS). VISIER W/H/D/z coincidence · HAUBE/HELM/NACKEN/KAMM/LIFT untouched. */
const _BLD=(SC&&SC.BLEND_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BLEND_GESETZ)||null;
const BLEND_W=(_BLD&&Number.isFinite(_BLD.W))?_BLD.W:0.30;
const BLEND_H=(_BLD&&Number.isFinite(_BLD.H))?_BLD.H:0.035;
const BLEND_D=(_BLD&&Number.isFinite(_BLD.D))?_BLD.D:0.06;
const BLEND_Y=(_BLD&&Number.isFinite(_BLD.y))?_BLD.y:1.94;
const BLEND_Z=(_BLD&&Number.isFinite(_BLD.z))?_BLD.z:0.16;
/* V18.491.372 — Lab knight crest ← BUSCH_GESETZ fail-soft; Host none (BUSCH_VIS). KAMM.W coincidence · BLEND/HAUBE/GRAT/RIPPE/LIFT untouched. */
const _BUS=(SC&&SC.BUSCH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BUSCH_GESETZ)||null;
const BUSCH_W=(_BUS&&Number.isFinite(_BUS.W))?_BUS.W:0.03;
const BUSCH_H=(_BUS&&Number.isFinite(_BUS.H))?_BUS.H:0.13;
const BUSCH_D=(_BUS&&Number.isFinite(_BUS.D))?_BUS.D:0.24;
const BUSCH_Y=(_BUS&&Number.isFinite(_BUS.y))?_BUS.y:2.13;
/* V18.491.373 — Lab knight hood ← KAPUZE_GESETZ fail-soft; Host none (KAPUZE_VIS). HAUBE.R coincidence · BUSCH/BLEND/KOPF/HELM/LIFT untouched. */
const _KAP=(SC&&SC.KAPUZE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KAPUZE_GESETZ)||null;
const KAPUZE_R=(_KAP&&Number.isFinite(_KAP.R))?_KAP.R:0.17;
const KAPUZE_Y=(_KAP&&Number.isFinite(_KAP.y))?_KAP.y:1.99;
const KAPUZE_SCALEY=(_KAP&&Number.isFinite(_KAP.scaleY))?_KAP.scaleY:0.7;
const KAPUZE_ROTX=(_KAP&&Number.isFinite(_KAP.rotX))?_KAP.rotX:-0.3;
/* V18.491.374 — Lab knight head ← SCHAEDEL_GESETZ fail-soft; Host none (SCHAEDEL_VIS). KOPF/HAUBE/KAPUZE/HELM/NACKEN/LIFT untouched. */
const _SDL=(SC&&SC.SCHAEDEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHAEDEL_GESETZ)||null;
const SCHAEDEL_R=(_SDL&&Number.isFinite(_SDL.R))?_SDL.R:0.155;
const SCHAEDEL_Y=(_SDL&&Number.isFinite(_SDL.y))?_SDL.y:1.93;
/* V18.491.375 — Lab knight upper arm ← OBERARM_GESETZ fail-soft; Host none (OBERARM_VIS). STANGE.R0 coincidence · ACHSEL/SCHENKEL/BEIN/LIFT untouched. */
const _OBE=(SC&&SC.OBERARM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.OBERARM_GESETZ)||null;
const OBERARM_R0=(_OBE&&Number.isFinite(_OBE.R0))?_OBE.R0:0.06;
const OBERARM_R1=(_OBE&&Number.isFinite(_OBE.R1))?_OBE.R1:0.055;
const OBERARM_H=(_OBE&&Number.isFinite(_OBE.H))?_OBE.H:0.40;
const OBERARM_X=(_OBE&&Number.isFinite(_OBE.x))?_OBE.x:0.05;
const OBERARM_Y=(_OBE&&Number.isFinite(_OBE.y))?_OBE.y:-0.17;
const OBERARM_Z=(_OBE&&Number.isFinite(_OBE.z))?_OBE.z:0;
const OBERARM_ROTZ=(_OBE&&Number.isFinite(_OBE.rotZ))?_OBE.rotZ:-0.3;
/* V18.491.376 — Lab knight sword grip ← HEFT_GESETZ fail-soft; Host none (HEFT_VIS). OBERARM/STANGE/STAB/LIFT untouched. */
const _HEF=(SC&&SC.HEFT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HEFT_GESETZ)||null;
const HEFT_R0=(_HEF&&Number.isFinite(_HEF.R0))?_HEF.R0:0.02;
const HEFT_R1=(_HEF&&Number.isFinite(_HEF.R1))?_HEF.R1:0.02;
const HEFT_H=(_HEF&&Number.isFinite(_HEF.H))?_HEF.H:0.16;
const HEFT_ROTX=(_HEF&&Number.isFinite(_HEF.rotX))?_HEF.rotX:Math.PI/2;
/* V18.491.377 — Lab knight sword guard ← PARIER_GESETZ fail-soft; Host none (PARIER_VIS). HEFT/OBERARM/STANGE/QUER/LIFT untouched. */
const _PAR=(SC&&SC.PARIER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PARIER_GESETZ)||null;
const PARIER_W=(_PAR&&Number.isFinite(_PAR.W))?_PAR.W:0.20;
const PARIER_H=(_PAR&&Number.isFinite(_PAR.H))?_PAR.H:0.03;
const PARIER_D=(_PAR&&Number.isFinite(_PAR.D))?_PAR.D:0.03;
const PARIER_Z=(_PAR&&Number.isFinite(_PAR.z))?_PAR.z:0.10;
/* V18.491.378 — Lab knight sword blade ← KLINGE_GESETZ fail-soft; Host none (KLINGE_VIS). HEFT/PARIER/STAB/SPITZE/SCHNEIDE/LIFT untouched. */
const _KLI=(SC&&SC.KLINGE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KLINGE_GESETZ)||null;
const KLINGE_W=(_KLI&&Number.isFinite(_KLI.W))?_KLI.W:0.045;
const KLINGE_H=(_KLI&&Number.isFinite(_KLI.H))?_KLI.H:0.012;
const KLINGE_D=(_KLI&&Number.isFinite(_KLI.D))?_KLI.D:0.82;
const KLINGE_Z=(_KLI&&Number.isFinite(_KLI.z))?_KLI.z:0.54;
/* V18.491.379 — Lab knight HP pip ← PIP_GESETZ fail-soft; Host none (PIP_VIS). KLINGE/HEFT/PARIER/RING/PAD/LIFT untouched. */
const _PIP=(SC&&SC.PIP_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PIP_GESETZ)||null;
const PIP_W=(_PIP&&Number.isFinite(_PIP.W))?_PIP.W:0.11;
const PIP_H=(_PIP&&Number.isFinite(_PIP.H))?_PIP.H:0.11;
const PIP_Y=(_PIP&&Number.isFinite(_PIP.y))?_PIP.y:2.40;
const PIP_PITCH=(_PIP&&Number.isFinite(_PIP.pitch))?_PIP.pitch:0.17;
/* V18.491.380 — Lab knight arm group ← ARM_GESETZ fail-soft; Host none (ARM_VIS). OBERARM/PIP/HEFT/PARIER/KLINGE/LIFT untouched; sw group next. */
const _ARM=(SC&&SC.ARM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ARM_GESETZ)||null;
const ARM_X=(_ARM&&Number.isFinite(_ARM.x))?_ARM.x:0.30;
const ARM_Y=(_ARM&&Number.isFinite(_ARM.y))?_ARM.y:1.60;
const ARM_Z=(_ARM&&Number.isFinite(_ARM.z))?_ARM.z:0.08;
/* V18.491.381 — Lab knight sword group ← SCHWERT_GESETZ fail-soft; Host none (SCHWERT_VIS). ARM/OBERARM/KLINGE/HEFT/PARIER/PIP/LIFT untouched. */
const _SWE=(SC&&SC.SCHWERT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHWERT_GESETZ)||null;
const SCHWERT_X=(_SWE&&Number.isFinite(_SWE.x))?_SWE.x:0.12;
const SCHWERT_Y=(_SWE&&Number.isFinite(_SWE.y))?_SWE.y:-0.34;
const SCHWERT_Z=(_SWE&&Number.isFinite(_SWE.z))?_SWE.z:0.04;
/* V18.491.382 — Lab knight HP pip z ← NAHE_GESETZ fail-soft; Host none (NAHE_VIS). PIP.W/H/y/pitch closed .379 untouched (no retrofit); SCHWERT/ARM/VOR/LIFT untouched. */
const _NAH=(SC&&SC.NAHE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NAHE_GESETZ)||null;
const NAHE_Z=(_NAH&&Number.isFinite(_NAH.z))?_NAH.z:0.05;
function buildKnightBody(armored,tabardHex,crestHex,maxHp){const g=new THREE.Group();
  /* V18.491.520 — Lab Ritter-Körper Mats ← RITTERM_GESETZ fail-soft; Host none (RITTERM_VIS). FOLGEM/HARNISCHM/RITTER logic/head/hood/sword/pip/LIFT untouched. */
  const _RTM=(SC&&SC.RITTERM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RITTERM_GESETZ)||null;
  const RITTERM_DARK=(_RTM&&Number.isFinite(_RTM.dark))?_RTM.dark:0x26262c;
  const RITTERM_DARKR=(_RTM&&Number.isFinite(_RTM.darkR))?_RTM.darkR:0.6;
  const RITTERM_DARKM=(_RTM&&Number.isFinite(_RTM.darkM))?_RTM.darkM:0.3;
  const RITTERM_WOOD=(_RTM&&Number.isFinite(_RTM.wood))?_RTM.wood:0x4a3520;
  const RITTERM_WOODR=(_RTM&&Number.isFinite(_RTM.woodR))?_RTM.woodR:0.9;
  const RITTERM_STEEL=(_RTM&&Number.isFinite(_RTM.steel))?_RTM.steel:0x9298a0;
  const RITTERM_STEELR=(_RTM&&Number.isFinite(_RTM.steelR))?_RTM.steelR:0.40;
  const RITTERM_STEELM=(_RTM&&Number.isFinite(_RTM.steelM))?_RTM.steelM:0.80;
  const RITTERM_GAMB=(_RTM&&Number.isFinite(_RTM.gambeson))?_RTM.gambeson:0x6a5840;
  const RITTERM_GAMBR=(_RTM&&Number.isFinite(_RTM.gambesonR))?_RTM.gambesonR:0.85;
  const dark=matCol(RITTERM_DARK,RITTERM_DARKR,RITTERM_DARKM),wood=matCol(RITTERM_WOOD,RITTERM_WOODR,0);
  const body=armored?matCol(RITTERM_STEEL,RITTERM_STEELR,RITTERM_STEELM):matCol(RITTERM_GAMB,RITTERM_GAMBR,0);   // Stahl vs. Gambeson
  const base=new THREE.Mesh(new THREE.CylinderGeometry(PLINT_R0,PLINT_R1,PLINT_H,12),dark);base.position.y=PLINT_Y;g.add(base);
  for(const sx of [-SCHENKEL_XOFF,SCHENKEL_XOFF]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(SCHENKEL_R0,SCHENKEL_R1,SCHENKEL_H,10),body);leg.position.set(sx,SCHENKEL_Y,0);leg.castShadow=true;g.add(leg);}
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(armored?LEIB_R0A:LEIB_R0B,LEIB_R1,LEIB_H,22,9),body);torso.position.y=LEIB_Y;torso.scale.z=LEIB_SCALEZ;torso.castShadow=true;g.add(torso);
  if(armored){const ridge=new THREE.Mesh(new THREE.BoxGeometry(RIPPE_W,RIPPE_H,RIPPE_D),dark);ridge.position.set(0,RIPPE_Y,RIPPE_Z);g.add(ridge);}
  /* V18.491.557 — Lab Ritter Kotte/Busch Rough ← KOTTEM_GESETZ fail-soft; Host none (KOTTEM_VIS). BLITZM/KOTTE/BUSCH geo/RITTERM/TUCHM/LIFT untouched; tabardHex/crestHex stay caller. */
  const _KTM=(SC&&SC.KOTTEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KOTTEM_GESETZ)||null;
  const KOTTEM_SURCOATR=(_KTM&&Number.isFinite(_KTM.surcoatR))?_KTM.surcoatR:0.7;
  const KOTTEM_CRESTR=(_KTM&&Number.isFinite(_KTM.crestR))?_KTM.crestR:0.6;
  const surcoat=new THREE.Mesh(new THREE.CylinderGeometry(KOTTE_R0,KOTTE_R1,armored?KOTTE_HA:KOTTE_HB,18),matCol(tabardHex,KOTTEM_SURCOATR,0));surcoat.position.y=armored?KOTTE_YA:KOTTE_YB;surcoat.scale.z=KOTTE_SCALEZ;g.add(surcoat);
  if(armored)for(const sx of [-ACHSEL_XOFF,ACHSEL_XOFF]){const pa=new THREE.Mesh(new THREE.SphereGeometry(ACHSEL_R,12,10),body);pa.position.set(sx,ACHSEL_Y,0);pa.scale.set(1,ACHSEL_SCALEY,ACHSEL_SCALEZ);g.add(pa);}
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(NACKEN_R0,NACKEN_R1,NACKEN_H,10),dark);neck.position.y=NACKEN_Y;g.add(neck);
  if(armored){const helm=new THREE.Mesh(new THREE.SphereGeometry(HAUBE_R,14,12),body);helm.position.y=HAUBE_Y;helm.scale.set(1,HAUBE_SCALEY,HAUBE_SCALEZ);helm.castShadow=true;g.add(helm);
    const visor=new THREE.Mesh(new THREE.BoxGeometry(BLEND_W,BLEND_H,BLEND_D),dark);visor.position.set(0,BLEND_Y,BLEND_Z);g.add(visor);
    const crest=new THREE.Mesh(new THREE.BoxGeometry(BUSCH_W,BUSCH_H,BUSCH_D),matCol(crestHex,KOTTEM_CRESTR,0));crest.position.set(0,BUSCH_Y,0);g.add(crest);}
  else{
    /* V18.491.521 — Lab Ritter Kopf/Kapuze Mats ← SCHAEDELM_GESETZ fail-soft; Host none (SCHAEDELM_VIS). RITTERM/HARNISCHM/SCHAEDEL/KAPUZE geo/sword/pip/LIFT untouched. */
    const _SDM=(SC&&SC.SCHAEDELM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHAEDELM_GESETZ)||null;
    const SCHAEDELM_SKIN=(_SDM&&Number.isFinite(_SDM.skin))?_SDM.skin:0x8a6a4a;
    const SCHAEDELM_SKINR=(_SDM&&Number.isFinite(_SDM.skinR))?_SDM.skinR:0.7;
    const SCHAEDELM_HOOD=(_SDM&&Number.isFinite(_SDM.hood))?_SDM.hood:0x4a3e30;
    const SCHAEDELM_HOODR=(_SDM&&Number.isFinite(_SDM.hoodR))?_SDM.hoodR:0.85;
    const head=new THREE.Mesh(new THREE.SphereGeometry(SCHAEDEL_R,14,12),matCol(SCHAEDELM_SKIN,SCHAEDELM_SKINR,0));head.position.y=SCHAEDEL_Y;head.castShadow=true;g.add(head);
    const hood=new THREE.Mesh(new THREE.SphereGeometry(KAPUZE_R,12,10),matCol(SCHAEDELM_HOOD,SCHAEDELM_HOODR,0));hood.position.y=KAPUZE_Y;hood.scale.set(1,KAPUZE_SCALEY,1);hood.rotation.x=KAPUZE_ROTX;g.add(hood);}
  const arm=new THREE.Group();arm.position.set(ARM_X,ARM_Y,ARM_Z);g.add(arm);
  const upper=new THREE.Mesh(new THREE.CylinderGeometry(OBERARM_R0,OBERARM_R1,OBERARM_H,8),body);upper.position.set(OBERARM_X,OBERARM_Y,OBERARM_Z);upper.rotation.z=OBERARM_ROTZ;arm.add(upper);
  const sw=new THREE.Group();sw.position.set(SCHWERT_X,SCHWERT_Y,SCHWERT_Z);arm.add(sw);
  const grip=new THREE.Mesh(new THREE.CylinderGeometry(HEFT_R0,HEFT_R1,HEFT_H,6),wood);grip.rotation.x=HEFT_ROTX;sw.add(grip);
  /* V18.491.522 — Lab Ritter-Schwert Mats ← SCHWERTM_GESETZ fail-soft; Host none (SCHWERTM_VIS). SCHAEDELM/RITTERM grip/HARNISCHM/SCHWERT geo/pip/LIFT untouched. */
  const _SWM=(SC&&SC.SCHWERTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHWERTM_GESETZ)||null;
  const SCHWERTM_PARIER=(_SWM&&Number.isFinite(_SWM.parier))?_SWM.parier:0x6a6258;
  const SCHWERTM_PARIERR=(_SWM&&Number.isFinite(_SWM.parierR))?_SWM.parierR:0.5;
  const SCHWERTM_PARIERM=(_SWM&&Number.isFinite(_SWM.parierM))?_SWM.parierM:0.4;
  const SCHWERTM_BLADE=(_SWM&&Number.isFinite(_SWM.blade))?_SWM.blade:0xb8c0c8;
  const SCHWERTM_BLADER=(_SWM&&Number.isFinite(_SWM.bladeR))?_SWM.bladeR:0.35;
  const SCHWERTM_BLADEM=(_SWM&&Number.isFinite(_SWM.bladeM))?_SWM.bladeM:0.85;
  const sg=new THREE.Mesh(new THREE.BoxGeometry(PARIER_W,PARIER_H,PARIER_D),matCol(SCHWERTM_PARIER,SCHWERTM_PARIERR,SCHWERTM_PARIERM));sg.position.z=PARIER_Z;sw.add(sg);
  const blade=new THREE.Mesh(new THREE.BoxGeometry(KLINGE_W,KLINGE_H,KLINGE_D),matCol(SCHWERTM_BLADE,SCHWERTM_BLADER,SCHWERTM_BLADEM));blade.position.z=KLINGE_Z;blade.castShadow=true;sw.add(blade);
  // Lebenspunkt-Pips über dem Kopf (zur Kamera gerichtet, da der Ritter den Spieler ansieht)
  /* V18.491.523 — Lab Ritter HP-Pip Mat ← PIPM_GESETZ fail-soft; Host none (PIPM_VIS). SCHWERTM/RITTERM/SCHAEDELM/PIP geo/lit/LIFT untouched. */
  const _PPM=(SC&&SC.PIPM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PIPM_GESETZ)||null;
  const PIPM_COLOR=(_PPM&&Number.isFinite(_PPM.color))?_PPM.color:0x40e060;
  const PIPM_ROUGH=(_PPM&&Number.isFinite(_PPM.rough))?_PPM.rough:0.6;
  const pips=[];for(let i=0;i<maxHp;i++){const pip=new THREE.Mesh(new THREE.PlaneGeometry(PIP_W,PIP_H),matCol(PIPM_COLOR,PIPM_ROUGH,0));
    pip.position.set((i-(maxHp-1)/2)*PIP_PITCH,PIP_Y,NAHE_Z);pip.material.side=2;pip.visible=false;g.add(pip);pips.push(pip);}
  return {grp:g,torso,bodyMat:body,arm,pips};}

/* V18.491.275 — Lab knight arena ← RITTER_GESETZ fail-soft; Host none (RITTER_VIS). HARNISCH dummy / GASSE / LIFT untouched. */
const _RTG=(SC&&SC.RITTER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RITTER_GESETZ)||null;
const RITTER_RINGIN=(_RTG&&Number.isFinite(_RTG.ringIn))?_RTG.ringIn:4.4;
const RITTER_RINGOUT=(_RTG&&Number.isFinite(_RTG.ringOut))?_RTG.ringOut:4.62;
const RITTER_BANNERR=(_RTG&&Number.isFinite(_RTG.bannerR))?_RTG.bannerR:4.75;
const RITTER_HPARM=(_RTG&&Number.isFinite(_RTG.hpArm))?_RTG.hpArm:3;
const RITTER_HPBARE=(_RTG&&Number.isFinite(_RTG.hpBare))?_RTG.hpBare:2;
/* V18.491.360 — Lab knight arena post ← PFAHL_GESETZ fail-soft; Host none (PFAHL_VIS). PFOST/STANGE R coincidence · PFOSTEN/SAULE/STEHER/MAST/LIFT untouched. */
const _PFH=(SC&&SC.PFAHL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PFAHL_GESETZ)||null;
const PFAHL_R0=(_PFH&&Number.isFinite(_PFH.R0))?_PFH.R0:0.06;
const PFAHL_R1=(_PFH&&Number.isFinite(_PFH.R1))?_PFH.R1:0.07;
const PFAHL_H=(_PFH&&Number.isFinite(_PFH.H))?_PFH.H:3.0;
const PFAHL_Y=(_PFH&&Number.isFinite(_PFH.y))?_PFH.y:1.5;
/* V18.491.362 — Lab knight arena banner ← TUCH_GESETZ fail-soft; Host none (TUCH_VIS). FAHNE/FAEHNE/WIMPEL/BANNER.H/PFAHL/LIFT untouched. */
const _TUC=(SC&&SC.TUCH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TUCH_GESETZ)||null;
const TUCH_W=(_TUC&&Number.isFinite(_TUC.W))?_TUC.W:0.6;
const TUCH_H=(_TUC&&Number.isFinite(_TUC.H))?_TUC.H:1.2;
const TUCH_Y=(_TUC&&Number.isFinite(_TUC.y))?_TUC.y:2.25;
function buildKnightArena(pos,count,armored){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.525 — Lab Ritter-Arena Ring Mats ← KREISM_GESETZ fail-soft; Host none (KREISM_VIS). LEUCHT/FOLGEM/RINGF/RINGCM/RITTER geo/banner/LIFT untouched. */
  const _KRM=(SC&&SC.KREISM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KREISM_GESETZ)||null;
  const KREISM_ARM=(_KRM&&Number.isFinite(_KRM.arm))?_KRM.arm:0x5a4a38;
  const KREISM_BARE=(_KRM&&Number.isFinite(_KRM.bare))?_KRM.bare:0x4a5a40;
  const KREISM_ROUGH=(_KRM&&Number.isFinite(_KRM.rough))?_KRM.rough:0.9;
  const ring=new THREE.Mesh(new THREE.RingGeometry(RITTER_RINGIN,RITTER_RINGOUT,48),matCol(armored?KREISM_ARM:KREISM_BARE,KREISM_ROUGH,0));ring.rotation.x=-Math.PI/2;ring.position.y=0.012;g.add(ring);
  /* V18.491.526 — Lab Ritter-Arena Banner-Cols ← TUCHM_GESETZ fail-soft; Host none (TUCHM_VIS). KREISM/TUCH geo/RINGF/RINGCM/CLOUTM/post/LIFT untouched. */
  const _TCM=(SC&&SC.TUCHM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TUCHM_GESETZ)||null;
  const TUCHM_ARM_FALL=[0x6a2a28,0x2a3a5a,0x3a5a2a,0x5a4a1a];
  const TUCHM_BARE_FALL=[0x3a5040,0x504a30,0x405040,0x4a4030];
  const TUCHM_ARM=(_TCM&&Array.isArray(_TCM.arm)&&_TCM.arm.length===4&&_TCM.arm.every(function(v){return Number.isFinite(v);}))?_TCM.arm.slice():TUCHM_ARM_FALL.slice();
  const TUCHM_BARE=(_TCM&&Array.isArray(_TCM.bare)&&_TCM.bare.length===4&&_TCM.bare.every(function(v){return Number.isFinite(v);}))?_TCM.bare.slice():TUCHM_BARE_FALL.slice();
  const TUCHM_ROUGH=(_TCM&&Number.isFinite(_TCM.rough))?_TCM.rough:0.7;
  const bCol=armored?TUCHM_ARM:TUCHM_BARE;
  /* V18.491.527 — Lab Ritter-Arena Pfahl Mat ← PFAHLM_GESETZ fail-soft; Host none (PFAHLM_VIS). TUCHM/KREISM/PFAHL geo/CLOUTM/HARNISCHM/LIFT untouched. */
  const _PHLM=(SC&&SC.PFAHLM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PFAHLM_GESETZ)||null;
  const PFAHLM_COLOR=(_PHLM&&Number.isFinite(_PHLM.color))?_PHLM.color:0x3a2c1c;
  const PFAHLM_ROUGH=(_PHLM&&Number.isFinite(_PHLM.rough))?_PHLM.rough:0.9;
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,bx=Math.cos(a)*RITTER_BANNERR,bz=Math.sin(a)*RITTER_BANNERR;
    const post=new THREE.Mesh(new THREE.CylinderGeometry(PFAHL_R0,PFAHL_R1,PFAHL_H,8),matCol(PFAHLM_COLOR,PFAHLM_ROUGH,0));post.position.set(bx,PFAHL_Y,bz);post.castShadow=true;g.add(post);
    const ban=new THREE.Mesh(new THREE.PlaneGeometry(TUCH_W,TUCH_H),matCol(bCol[i],TUCHM_ROUGH,0));ban.position.set(bx,TUCH_Y,bz);ban.material.side=2;g.add(ban);}
  const maxHp=armored?RITTER_HPARM:RITTER_HPBARE;
  /* V18.491.528 — Lab Ritter-Arena Aufstellung ← AUFSTELL_GESETZ fail-soft; Host none (AUFSTELL_VIS). PFAHLM/RITTERM/TUCHM/KREISM/charger/LIFT untouched. */
  const _AUF=(SC&&SC.AUFSTELL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.AUFSTELL_GESETZ)||null;
  const AUFSTELL_A_FALL=[[-2.4,-3.0,0x6a2a28,0xc0b020],[0,-3.6,0x2a3a5a,0xc8c8d0],[2.4,-3.0,0x3a5a2a,0xb05030]];
  const AUFSTELL_U_FALL=[[-1.6,-3.2,0x7a4030,0x000000],[1.6,-3.2,0x40607a,0x000000]];
  function _aufstellOk(rows,n){return Array.isArray(rows)&&rows.length===n&&rows.every(function(r){return Array.isArray(r)&&r.length===4&&r.every(function(v){return Number.isFinite(v);});});}
  const cfgA=(_AUF&&_aufstellOk(_AUF.A,3))?_AUF.A.map(function(r){return r.slice();}):AUFSTELL_A_FALL.map(function(r){return r.slice();});
  const cfgU=(_AUF&&_aufstellOk(_AUF.U,2))?_AUF.U.map(function(r){return r.slice();}):AUFSTELL_U_FALL.map(function(r){return r.slice();});
  const cfg=(count>=3)?cfgA:cfgU;
  const F={center:pos.clone(),active:false,won:false,deckung:3,armored:armored,knights:[],_nearShown:false};
  for(const c of cfg.slice(0,count)){const K=buildKnightBody(armored,c[2],c[3],maxHp);K.grp.position.set(c[0],0,c[1]);g.add(K.grp);
    F.knights.push({grp:K.grp,arm:K.arm,torso:K.torso,bodyMat:K.bodyMat,pips:K.pips,armored:armored,field:F,
      home:new THREE.Vector3(pos.x+c[0],0,pos.z+c[1]),maxHp:maxHp,hp:maxHp,state:'dormant',windT:0,actCD:0,stagT:0,downT:0,flash:0,spark:0,knockSpeed:1.5,_lunge:0,_dealt:false,_hitHead:false});}
  if(!arena.knightArenas)arena.knightArenas=[];arena.knightArenas.push(F);
  return g;}

function knightFieldReset(F){const ctr=F.center;
  for(const K of F.knights){K.grp.position.set(K.home.x-ctr.x,0,K.home.z-ctr.z);K.grp.rotation.set(0,0,0);K.state='dormant';K.hp=K.maxHp;K.windT=0;K.actCD=0;K.stagT=0;K._lunge=0;K._dealt=false;if(K.arm)K.arm.rotation.x=0;}
  F.active=false;F.won=false;F.deckung=3;}

function updateKnights(dt){
  /* V18.491.555 — Lab Ritter HP-Pip Zustandsfarben ← LEBENM_GESETZ fail-soft; Host none (LEBENM_VIS). NARBM/PIPM/DOJOM/LIFT untouched. */
  const _LVM=(SC&&SC.LEBENM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEBENM_GESETZ)||null;
  const LEBENM_LOST=(_LVM&&Number.isFinite(_LVM.lost))?_LVM.lost:0x3a1a1a;
  const LEBENM_CRIT=(_LVM&&Number.isFinite(_LVM.crit))?_LVM.crit:0xff4040;
  const LEBENM_WARN=(_LVM&&Number.isFinite(_LVM.warn))?_LVM.warn:0xe0a040;
  const LEBENM_OK=(_LVM&&Number.isFinite(_LVM.ok))?_LVM.ok:0x40e060;
  /* V18.491.556 — Lab Panzer-Blitz RGB ← BLITZM_GESETZ fail-soft (ritter armored path); Host none (BLITZM_VIS). gambeson-flash/tel left bare. */
  const _BLM=(SC&&SC.BLITZM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BLITZM_GESETZ)||null;
  const BLITZM_R0=(_BLM&&Number.isFinite(_BLM.r0))?_BLM.r0:0.57;
  const BLITZM_G0=(_BLM&&Number.isFinite(_BLM.g0))?_BLM.g0:0.60;
  const BLITZM_B0=(_BLM&&Number.isFinite(_BLM.b0))?_BLM.b0:0.63;
  const BLITZM_FR=(_BLM&&Number.isFinite(_BLM.fr))?_BLM.fr:0.45;
  const BLITZM_FG=(_BLM&&Number.isFinite(_BLM.fg))?_BLM.fg:0.40;
  const BLITZM_FB=(_BLM&&Number.isFinite(_BLM.fb))?_BLM.fb:0.18;
  const BLITZM_SR=(_BLM&&Number.isFinite(_BLM.sr))?_BLM.sr:0.5;
  const BLITZM_SG=(_BLM&&Number.isFinite(_BLM.sg))?_BLM.sg:-0.20;
  const BLITZM_SB=(_BLM&&Number.isFinite(_BLM.sb))?_BLM.sb:-0.22;
  /* V18.491.559 — Lab Gambeson/Wams Flash RGB ← WAMSM_GESETZ fail-soft; Host none (WAMSM_VIS). STECHF/BLITZM/tel/LIFT untouched. */
  const _WMM=(SC&&SC.WAMSM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.WAMSM_GESETZ)||null;
  const WAMSM_R0=(_WMM&&Number.isFinite(_WMM.r0))?_WMM.r0:0.42;
  const WAMSM_G0=(_WMM&&Number.isFinite(_WMM.g0))?_WMM.g0:0.345;
  const WAMSM_B0=(_WMM&&Number.isFinite(_WMM.b0))?_WMM.b0:0.25;
  const WAMSM_FR=(_WMM&&Number.isFinite(_WMM.fr))?_WMM.fr:0.50;
  const WAMSM_FG=(_WMM&&Number.isFinite(_WMM.fg))?_WMM.fg:-0.10;
  const WAMSM_FB=(_WMM&&Number.isFinite(_WMM.fb))?_WMM.fb:-0.10;
  /* V18.491.560 — Lab Ritter Telegraph ← TELM_GESETZ fail-soft; Host none (TELM_VIS). WAMSM/BLITZM/STECHF/LIFT untouched. */
  const _TLM=(SC&&SC.TELM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TELM_GESETZ)||null;
  const TELM_AMP=(_TLM&&Number.isFinite(_TLM.amp))?_TLM.amp:0.5;
  const TELM_FREQ=(_TLM&&Number.isFinite(_TLM.freq))?_TLM.freq:16;
  const TELM_BIAS=(_TLM&&Number.isFinite(_TLM.bias))?_TLM.bias:0.5;
  const TELM_AR=(_TLM&&Number.isFinite(_TLM.ar))?_TLM.ar:0.40;
  const TELM_AG=(_TLM&&Number.isFinite(_TLM.ag))?_TLM.ag:0.10;
  const TELM_AB=(_TLM&&Number.isFinite(_TLM.ab))?_TLM.ab:-0.18;
  const TELM_GR=(_TLM&&Number.isFinite(_TLM.gr))?_TLM.gr:0.28;
  const TELM_GG=(_TLM&&Number.isFinite(_TLM.gg))?_TLM.gg:0.10;
  /* V18.491.561 — Lab Blitz/Funke Abklingen ← ABKLINGM_GESETZ fail-soft (ritter path); Host none (ABKLINGM_VIS). */
  const _AKM=(SC&&SC.ABKLINGM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ABKLINGM_GESETZ)||null;
  const ABKLINGM_FLASH=(_AKM&&Number.isFinite(_AKM.flash))?_AKM.flash:3.2;
  const ABKLINGM_SPARK=(_AKM&&Number.isFinite(_AKM.spark))?_AKM.spark:4.5;
  if(!arena.knightArenas)return;arena._nearKnightField=null;
  for(const F of arena.knightArenas){
    const pdx=arena.player.x-F.center.x,pdz=arena.player.z-F.center.z,pDist=Math.hypot(pdx,pdz);
    if(!F.active){if(pDist<5.5){arena._nearKnightField=F;if(!F._nearShown){F._nearShown=true;popText('drücke [E] — '+(F.armored?'die Ritter herausfordern':'die Kämpfer herausfordern'),INVITEM_CSS,0,-0.16);}}else F._nearShown=false;}
    if(F.won&&pDist>10){knightFieldReset(F);continue;}
    for(const K of F.knights){
      const showPips=F.active&&K.state!=='down';
      for(let i=0;i<K.pips.length;i++){K.pips[i].visible=showPips;if(showPips){const lost=i>=K.hp;K.pips[i].material.color.setHex(lost?LEBENM_LOST:(K.hp===1?LEBENM_CRIT:K.hp===2&&K.maxHp>2?LEBENM_WARN:LEBENM_OK));}}
      if(K.state==='down'){if(K.downT>0)K.downT-=dt;continue;}
      if(K.actCD>0)K.actCD-=dt; if(K.flash>0)K.flash=Math.max(0,K.flash-dt*ABKLINGM_FLASH); if(K.spark>0)K.spark=Math.max(0,K.spark-dt*ABKLINGM_SPARK);
      const c=K.bodyMat.color,tel=(K.state==='wind')?(TELM_AMP*Math.sin(clock.getElapsedTime()*TELM_FREQ)+TELM_BIAS):0;
      if(c&&c.setRGB){if(K.armored)c.setRGB(BLITZM_R0+BLITZM_FR*K.flash+BLITZM_SR*K.spark+TELM_AR*tel,BLITZM_G0+BLITZM_FG*K.flash+BLITZM_SG*K.spark+TELM_AG*tel,BLITZM_B0+BLITZM_FB*K.flash+BLITZM_SB*K.spark+TELM_AB*tel);
        else c.setRGB(WAMSM_R0+WAMSM_FR*K.flash+TELM_GR*tel,WAMSM_G0+WAMSM_FG*K.flash+TELM_GG*tel,WAMSM_B0+WAMSM_FB*K.flash);}
      if(!F.active)continue;
      const kw=K.grp.position,dx=arena.player.x-(F.center.x+kw.x),dz=arena.player.z-(F.center.z+kw.z),dist=Math.hypot(dx,dz)||1e-4;
      K.grp.rotation.y=Math.atan2(dx,dz);
      if(K.state==='stagger'){K.stagT-=dt;K.grp.rotation.z=Math.sin(clock.getElapsedTime()*24)*0.14*Math.max(0,K.stagT*2);kw.x-=(dx/dist)*K.knockSpeed*dt;kw.z-=(dz/dist)*K.knockSpeed*dt;
        if(K.stagT<=0){K.state='approach';K.grp.rotation.z=0;}continue;}
      K.grp.rotation.z=0;
      if(K.state==='approach'){
        if(dist>2.05){const sp=1.4*dt;kw.x+=(dx/dist)*sp;kw.z+=(dz/dist)*sp;kw.y=Math.abs(Math.sin(clock.getElapsedTime()*5+kw.x))*0.025;}
        else{kw.y=0;if(K.actCD<=0){K.state='wind';K.windT=0.95;}}
      } else if(K.state==='wind'){
        K.windT-=dt;const u=clamp(1-K.windT/0.95,0,1);if(K.arm)K.arm.rotation.x=-2.1*u;
        if(K.windT<=0){K.state='strike';K._lunge=0;K._dealt=false;}
      } else if(K.state==='strike'){
        K._lunge+=dt;const u=clamp(K._lunge/0.18,0,1);if(K.arm)K.arm.rotation.x=-2.1*(1-u)+0.55*u;
        if(u>=0.5&&!K._dealt){K._dealt=true;
          if(dist<2.45){F.deckung=Math.max(0,F.deckung-1);
            fx.shake=Math.max(fx.shake,0.40);fx.freeze=Math.max(fx.freeze,0.10);const B=camBasis();fx.kickV.addScaledVector(B.fwd,-2.4);fx.kickV.y-=1.0;
            if(F.deckung>0){popText('✖ HIEB DURCH DEINE DECKUNG',GEFAHRM_CSS,0,0);popText('Deckung '+F.deckung+'/3',DECKM_CSS,0.12,0.07);}
            else{popText('✖ DEINE DECKUNG ZERBRICHT',BRUCHM_CSS,0,0);knightFieldReset(F);}}
          else popText('— Hieb verfehlt, ausgewichen',NEUTM_CSS,0,-0.04);}
        if(K._lunge>=0.28){K.state='approach';K.actCD=0.60;K._dealt=false;if(K.arm)K.arm.rotation.x=0;}
      }
    }
    if(F.active&&!F.won){let down=0;for(const K of F.knights)if(K.state==='down')down++;
      if(down>=F.knights.length){F.won=true;popText('⚔ '+(F.armored?'ALLE RITTER GEFALLEN':'DAS FELD IST GERÄUMT')+' — verlasse den Ring',SIEGM_CSS,0,-0.06);}}
  }
}

function dentArmorKnight(K,worldPt,depth){const torso=K.torso;if(!torso.geometry)return;const gm=torso.geometry,pa=gm.attributes.position;
  const local=torso.worldToLocal(worldPt.clone());
  for(let i=0;i<pa.count;i++){const vx=pa.getX(i),vy=pa.getY(i),vz=pa.getZ(i),d=Math.hypot(vx-local.x,vy-local.y,vz-local.z);
    if(d<0.18){const f=(1-d/0.18)*depth,r=Math.hypot(vx,vz)||1e-4;pa.setX(i,vx-(vx/r)*f);pa.setZ(i,vz-(vz/r)*f);}}
  pa.needsUpdate=true;gm.computeVertexNormals();}

function tryHitKnight(handW,bladeDir,vel){if(!arena.knightArenas)return false;
  let best=null,bestPt=null,bestD=1e9,bestF=null,bestHead=false;
  for(const F of arena.knightArenas){if(!F.active)continue;for(const K of F.knights){if(K.state==='down')continue;K.grp.updateMatrixWorld(true);
    const ow=K.grp.getWorldPosition(new THREE.Vector3());                                  // Fuß-Ursprung am Boden
    const headC=new THREE.Vector3(ow.x,ow.y+1.95,ow.z),torsoC=new THREE.Vector3(ow.x,ow.y+1.28,ow.z);
    const hpt=bladeHitsColumn(handW,bladeDir,headC,0.22,1.78,2.18);                          // Kopf: eng, hoch (Visier)
    const tpt=hpt?null:bladeHitsColumn(handW,bladeDir,torsoC,0.40,0.55,1.74);                // Rumpf: breit (Fugen)
    const pt=hpt||tpt;if(pt){const d=pt.distanceTo(handW);if(d<bestD){bestD=d;best=K;bestPt=pt;bestF=F;bestHead=!!hpt;}}}}
  if(!best)return false;const K=best,F=bestF;
  const mm=arena._m||measure(P),M=mm.M;
  const vAx=Math.abs(vel.dot(bladeDir)),vLat=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir)).length();
  const thrust=vAx>vLat*0.9,sharp=(mm.edgeWinkel!=null&&mm.edgeWinkel<32),pointy=(mm.betaDeg!=null&&mm.betaDeg<42),mEff=Math.max(0.02,(mm.mEffFrac||0.2)*M);
  const mom=M*Math.max(vAx,vLat);                                                            // Stoß-Impuls → Rückstoß
  /* V18.491.591 WIRE — Lab knight-hit default col ← TREFFM_GESETZ.bad (same reject/fail bad as TREFFM_BAD_CSS; used when Platte abweist without overwrite; no new twin; VERSION stays .590). ≠ GEFAHRM · ≠ SPEKOM meter; LIFT untouched. */
  let dmg=0,msg='',col=TREFFM_BAD_CSS;
  if(F.armored){
    if(thrust&&bestHead&&mm.betaDeg!=null){const KE=0.5*mEff*vAx*vAx;dmg=2;msg='➤ Stich in den Augenschlitz! — '+KE.toFixed(0)+' J';col=STICHM_CSS;}   // GEMESSEN: Streitkolben/Kriegshammer betaDeg=null — ein Wuchtkopf passt in keinen Schlitz
    else if(thrust&&pointy){const KE=0.5*mEff*vAx*vAx;dmg=1;msg='➤ Stich in die Fuge (Achsel/Leiste) — '+KE.toFixed(0)+' J';col=FUGEM_CSS;}
    else if(!thrust&&!sharp){const KE=0.5*mEff*vLat*vLat;dmg=1;msg='✹ Wucht durch den Harnisch — '+KE.toFixed(0)+' J';col=WUCHTM_CSS;}   // Energie am Kopf: mEff; Impuls (mom) trägt weiter die volle Masse
    else if(thrust){K.spark=1;msg='✗ am Plattenrand abgewiesen — kein spitzer Ort';bladeRecoil(0.70);}
    else{K.spark=1;msg='✗ Schnitt prallt von der Platte ab';bladeRecoil(0.85);}
  } else {
    if(thrust){const KE=0.5*mEff*vAx*vAx;dmg=bestHead?2:1;msg=bestHead?'➤ Stich in die Kehle! — '+KE.toFixed(0)+' J':'➤ Stich trifft — '+KE.toFixed(0)+' J';col=STICHM_CSS;}
    else if(sharp){const edgeQ=clamp(arena._edgeAlign!=null?arena._edgeAlign:1,0.15,1),KE=0.5*mEff*vLat*vLat*(0.25+0.75*edgeQ);dmg=bestHead?2:1;msg=(bestHead?'⚔ Schnitt zum Kopf — ':'⚔ Schnitt trifft tief — ')+KE.toFixed(0)+' J'+(edgeQ<=0.75?' · Schneide quer':'');col=STICHM_CSS;}
    else{const KE=0.5*mEff*vLat*vLat;dmg=1;msg='✹ Schlag trifft — '+KE.toFixed(0)+' J';col=WUCHTM_CSS;}
  }
  if(dmg>0){K.flash=1;if(bestPt&&F.armored)dentArmorKnight(K,bestPt,bestHead?0.018:clamp(M*vLat*0.006,0.022,0.07));
    K.knockSpeed=clamp(mom*0.16,0.9,4.5);K.stagT=clamp(0.40+mom*0.018,0.45,0.9);                  // variabler Rückstoß
    if(K.state==='wind'||K.state==='strike'){if(K.arm)K.arm.rotation.x=0;}K.state='stagger';K._dealt=false;
    K.hp-=dmg;fx.shake=Math.max(fx.shake,0.10);fx.freeze=Math.max(fx.freeze,0.05);arena.cooldown=0.28;
    if(K.hp<=0){K.state='down';K.downT=600;K.grp.rotation.x=Math.PI*0.42;K.grp.position.y=0.10;msg+=(F.armored?' — RITTER FÄLLT':' — GESTRECKT');col=SIEGM_CSS;}
    popText(msg,col,0,-0.04);}
  else popText(msg,col,0,0);
  return true;}

/* V18.491.277 — Lab charger ← STREIT_GESETZ fail-soft; Host none (STREIT_VIS). TON / RITTER / LIFT untouched. */
const _STG=(SC&&SC.STREIT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STREIT_GESETZ)||null;
const STREIT_SPEED=(_STG&&Number.isFinite(_STG.speed))?_STG.speed:3.0;
const STREIT_NEARR=(_STG&&Number.isFinite(_STG.nearR))?_STG.nearR:6.5;
const STREIT_HITR=(_STG&&Number.isFinite(_STG.hitR))?_STG.hitR:1.7;
/* V18.491.395 — Lab Streitpuppe Schlitten-Base ← SCHLITT_GESETZ fail-soft; Host none (SCHLITT_VIS). SPIEGEL/SOCKEL/STAND/PODES/PLINT/TELLER/STREIT/LIFT untouched. */
const _SLT=(SC&&SC.SCHLITT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHLITT_GESETZ)||null;
const SCHLITT_W=(_SLT&&Number.isFinite(_SLT.W))?_SLT.W:0.8;
const SCHLITT_H=(_SLT&&Number.isFinite(_SLT.H))?_SLT.H:0.16;
const SCHLITT_D=(_SLT&&Number.isFinite(_SLT.D))?_SLT.D:1.15;
const SCHLITT_Y=(_SLT&&Number.isFinite(_SLT.y))?_SLT.y:0.18;
/* V18.491.396 — Lab Streitpuppe Räder ← RAD_GESETZ fail-soft; Host none (RAD_VIS). SCHLITT/ROLLE/RING/REIF/MUFFE/DORN/LIFT untouched. */
const _RAD=(SC&&SC.RAD_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RAD_GESETZ)||null;
const RAD_R=(_RAD&&Number.isFinite(_RAD.R))?_RAD.R:0.14;
const RAD_H=(_RAD&&Number.isFinite(_RAD.H))?_RAD.H:0.08;
const RAD_XOFF=(_RAD&&Number.isFinite(_RAD.xOff))?_RAD.xOff:0.33;
const RAD_ZOFF=(_RAD&&Number.isFinite(_RAD.zOff))?_RAD.zOff:0.42;
const RAD_Y=(_RAD&&Number.isFinite(_RAD.y))?_RAD.y:0.14;
/* V18.491.397 — Lab Streitpuppe Körper ← TONNE_GESETZ fail-soft; Host none (TONNE_VIS). RAD/SCHLITT/RUMPF/LEIB/TON/DORN/STANGE/LIFT untouched. */
const _TNE=(SC&&SC.TONNE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TONNE_GESETZ)||null;
const TONNE_R0=(_TNE&&Number.isFinite(_TNE.R0))?_TNE.R0:0.13;
const TONNE_R1=(_TNE&&Number.isFinite(_TNE.R1))?_TNE.R1:0.16;
const TONNE_H=(_TNE&&Number.isFinite(_TNE.H))?_TNE.H:1.6;
const TONNE_Y=(_TNE&&Number.isFinite(_TNE.y))?_TNE.y:1.08;
/* V18.491.398 — Lab Streitpuppe Ausleger ← AUSLEG_GESETZ fail-soft; Host none (AUSLEG_VIS). ARM/OBERARM/STUMMEL/TONNE/SCHLITT/RAD/SPARREN/LIFT untouched. */
const _AUS=(SC&&SC.AUSLEG_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.AUSLEG_GESETZ)||null;
const AUSLEG_W=(_AUS&&Number.isFinite(_AUS.W))?_AUS.W:1.15;
const AUSLEG_H=(_AUS&&Number.isFinite(_AUS.H))?_AUS.H:0.13;
const AUSLEG_D=(_AUS&&Number.isFinite(_AUS.D))?_AUS.D:0.13;
const AUSLEG_Y=(_AUS&&Number.isFinite(_AUS.y))?_AUS.y:1.52;
/* V18.491.399 — Lab Streitpuppe Kopf ← KNOLLE_GESETZ fail-soft; Host none (KNOLLE_VIS). KOPF/BIRNE/SCHAEDEL/HAUBE/AUSLEG/TONNE/SCHLITT/LIFT untouched. */
const _KNO=(SC&&SC.KNOLLE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KNOLLE_GESETZ)||null;
const KNOLLE_R=(_KNO&&Number.isFinite(_KNO.R))?_KNO.R:0.18;
const KNOLLE_Y=(_KNO&&Number.isFinite(_KNO.y))?_KNO.y:1.99;
/* V18.491.400 — Lab Streitpuppe Schild ← SCHILD_GESETZ fail-soft; Host none (SCHILD_VIS). KNOLLE/AUSLEG/TONNE/SCHLITT/RING/REIF/NAHE/LIFT untouched. */
const _SHD=(SC&&SC.SCHILD_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHILD_GESETZ)||null;
const SCHILD_R=(_SHD&&Number.isFinite(_SHD.R))?_SHD.R:0.28;
const SCHILD_H=(_SHD&&Number.isFinite(_SHD.H))?_SHD.H:0.05;
const SCHILD_Y=(_SHD&&Number.isFinite(_SHD.y))?_SHD.y:1.32;
const SCHILD_Z=(_SHD&&Number.isFinite(_SHD.z))?_SHD.z:0.24;
/* V18.491.401 — Lab Streitpuppe Fahnenstange ← LANZE_GESETZ fail-soft; Host none (LANZE_VIS). STANGE/MAST/PFOST/DORN/SCHILD/KNOLLE/KREUZ/SCHLITT/SPITZE/LIFT untouched. */
const _LAN=(SC&&SC.LANZE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LANZE_GESETZ)||null;
const LANZE_R=(_LAN&&Number.isFinite(_LAN.R))?_LAN.R:0.025;
const LANZE_H=(_LAN&&Number.isFinite(_LAN.H))?_LAN.H:0.5;
const LANZE_X=(_LAN&&Number.isFinite(_LAN.x))?_LAN.x:0.18;
const LANZE_Y=(_LAN&&Number.isFinite(_LAN.y))?_LAN.y:2.25;
/* V18.491.402 — Lab Streitpuppe Ruhe-Wimpel ← ZIPFEL_GESETZ fail-soft; Host none (ZIPFEL_VIS). FAHNE/WIMPEL/FAEHNE/TUCH/BANNER/LANZE/SPITZE/KEGEL/KNOLLE/LIFT untouched. */
const _ZIP=(SC&&SC.ZIPFEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ZIPFEL_GESETZ)||null;
const ZIPFEL_R=(_ZIP&&Number.isFinite(_ZIP.R))?_ZIP.R:0.12;
const ZIPFEL_H=(_ZIP&&Number.isFinite(_ZIP.H))?_ZIP.H:0.32;
const ZIPFEL_X=(_ZIP&&Number.isFinite(_ZIP.x))?_ZIP.x:0.18;
const ZIPFEL_Y=(_ZIP&&Number.isFinite(_ZIP.y))?_ZIP.y:2.5;
function buildCharger(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.529 — Lab Streitpuppe/Charger Mats ← STREITM_GESETZ fail-soft; Host none (STREITM_VIS). AUFSTELL/RITTERM/TUCHM/PFAHLM/STREIT logic/head/shield/flag/LIFT untouched. */
  const _STRM=(SC&&SC.STREITM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STREITM_GESETZ)||null;
  const STREITM_WOOD=(_STRM&&Number.isFinite(_STRM.wood))?_STRM.wood:0x5a4530;
  const STREITM_WOODR=(_STRM&&Number.isFinite(_STRM.woodR))?_STRM.woodR:0.9;
  const STREITM_DARK=(_STRM&&Number.isFinite(_STRM.dark))?_STRM.dark:0x2a1d12;
  const STREITM_DARKR=(_STRM&&Number.isFinite(_STRM.darkR))?_STRM.darkR:0.9;
  const STREITM_CLOTH=(_STRM&&Number.isFinite(_STRM.cloth))?_STRM.cloth:0x6a5a4a;
  const STREITM_CLOTHR=(_STRM&&Number.isFinite(_STRM.clothR))?_STRM.clothR:0.7;
  const STREITM_METAL=(_STRM&&Number.isFinite(_STRM.metal))?_STRM.metal:0x4a4842;
  const STREITM_METALR=(_STRM&&Number.isFinite(_STRM.metalR))?_STRM.metalR:0.4;
  const wood=matCol(STREITM_WOOD,STREITM_WOODR,0),dark=matCol(STREITM_DARK,STREITM_DARKR,0),cloth=matCol(STREITM_CLOTH,STREITM_CLOTHR,0),metal=matCol(STREITM_METAL,STREITM_METALR,0);
  const sled=new THREE.Group();g.add(sled);
  const base=new THREE.Mesh(new THREE.BoxGeometry(SCHLITT_W,SCHLITT_H,SCHLITT_D),dark);base.position.y=SCHLITT_Y;sled.add(base);
  for(const wx of [-RAD_XOFF,RAD_XOFF])for(const wz of [-RAD_ZOFF,RAD_ZOFF]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(RAD_R,RAD_R,RAD_H,12),metal);wheel.rotation.z=Math.PI/2;wheel.position.set(wx,RAD_Y,wz);sled.add(wheel);}
  const body=new THREE.Mesh(new THREE.CylinderGeometry(TONNE_R0,TONNE_R1,TONNE_H,10),cloth);body.position.y=TONNE_Y;sled.add(body);
  const arms=new THREE.Mesh(new THREE.BoxGeometry(AUSLEG_W,AUSLEG_H,AUSLEG_D),wood);arms.position.y=AUSLEG_Y;sled.add(arms);
  /* V18.491.530 — Lab Streitpuppe Kopf-Mat ← KNOLLEM_GESETZ fail-soft; Host none (KNOLLEM_VIS). STREITM/AUFSTELL/TUCHM/CLOUTM/KNOLLE geo/shield/flag/LIFT untouched. */
  const _KNM=(SC&&SC.KNOLLEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KNOLLEM_GESETZ)||null;
  const KNOLLEM_COLOR=(_KNM&&Number.isFinite(_KNM.color))?_KNM.color:0x7a6a5a;
  const KNOLLEM_ROUGH=(_KNM&&Number.isFinite(_KNM.rough))?_KNM.rough:0.6;
  const head=new THREE.Mesh(new THREE.SphereGeometry(KNOLLE_R,12,10),matCol(KNOLLEM_COLOR,KNOLLEM_ROUGH,0));head.position.y=KNOLLE_Y;sled.add(head);
  /* V18.491.531 — Lab Streitpuppe Schild-Mat ← SCHILDM_GESETZ fail-soft; Host none (SCHILDM_VIS). KNOLLEM/STREITM/TUCHM/CLOUTM/SCHILD geo/flag/LIFT untouched. */
  const _SHLM=(SC&&SC.SCHILDM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHILDM_GESETZ)||null;
  const SCHILDM_COLOR=(_SHLM&&Number.isFinite(_SHLM.color))?_SHLM.color:0x8a3a28;
  const SCHILDM_ROUGH=(_SHLM&&Number.isFinite(_SHLM.rough))?_SHLM.rough:0.6;
  const shield=new THREE.Mesh(new THREE.CylinderGeometry(SCHILD_R,SCHILD_R,SCHILD_H,18),matCol(SCHILDM_COLOR,SCHILDM_ROUGH,0));shield.rotation.x=Math.PI/2;shield.position.set(0,SCHILD_Y,SCHILD_Z);sled.add(shield);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(LANZE_R,LANZE_R,LANZE_H,6),wood);pole.position.set(LANZE_X,LANZE_Y,0);sled.add(pole);
  /* V18.491.532 — Lab Streitpuppe Flag/Zipfel-Mat ← ZIPFELM_GESETZ fail-soft; Host none (ZIPFELM_VIS). SCHILDM/KNOLLEM/STREITM/TUCHM/CLOUTM/ZIPFEL geo/LIFT untouched. */
  const _ZPM=(SC&&SC.ZIPFELM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ZIPFELM_GESETZ)||null;
  const ZIPFELM_COLOR=(_ZPM&&Number.isFinite(_ZPM.color))?_ZPM.color:0x6fcf73;
  const ZIPFELM_ROUGH=(_ZPM&&Number.isFinite(_ZPM.rough))?_ZPM.rough:0.6;
  const flag=new THREE.Mesh(new THREE.ConeGeometry(ZIPFEL_R,ZIPFEL_H,4),matCol(ZIPFELM_COLOR,ZIPFELM_ROUGH,0));flag.position.set(ZIPFEL_X,ZIPFEL_Y,0);flag.rotation.x=Math.PI;sled.add(flag);   // Ruhe-Wimpel: schläft, mit E wecken
  arena.charger={grp:g,sled,head,flag,home:pos.clone(),speed:STREIT_SPEED,state:'dormant',hitCD:0,wob:0,_wasNear:false};return g;}
function updateCharger(dt){const C=arena.charger;if(!C)return;
  C.grp.updateMatrixWorld(true);const dummyW=C.sled.getWorldPosition(new THREE.Vector3());
  const dx=arena.player.x-dummyW.x,dz=arena.player.z-dummyW.z,dist=Math.hypot(dx,dz)||1e-4;
  if(C.hitCD>0)C.hitCD-=dt;
  const near=(C.state==='dormant'&&dist<STREIT_NEARR);arena._nearCharger=near;
  if(near&&!C._wasNear)popText('drücke [E] — Streitpuppe wecken',INVITEM_CSS,0,-0.16);C._wasNear=(dist<8);
  if(C.flag)C.flag.visible=(C.state==='dormant');
  if(C.state==='dormant'){C.sled.rotation.y=Math.atan2(dx,dz);}                                  // wartet, schaut dich an
  else if(C.state==='charge'){const step=C.speed*dt;C.sled.position.x+=(dx/dist)*step;C.sled.position.z+=(dz/dist)*step;C.sled.rotation.y=Math.atan2(dx,dz);
    if(dist<STREIT_HITR&&C.hitCD<=0){fx.shake=Math.max(fx.shake,0.42);fx.freeze=Math.max(fx.freeze,0.12);const B=camBasis();fx.kickV.addScaledVector(B.fwd,-3.2);fx.kickV.y-=1.5;popText('✖ DIE STREITPUPPE RAMMT DICH',GEFAHRM_CSS,0,0);popText('rechtzeitig treffen!',TREFFM_BAD_CSS,0.12,0.07);C.state='retreat';C.hitCD=1.0;}}
  else if(C.state==='retreat'){const hx=-C.sled.position.x,hz=-C.sled.position.z,hd=Math.hypot(hx,hz);
    if(hd<0.25){C.sled.position.set(0,0,0);C.sled.rotation.y=0;C.state='dormant';C._wasNear=true;}else{const step=C.speed*1.5*dt;C.sled.position.x+=(hx/hd)*step;C.sled.position.z+=(hz/hd)*step;}}
  if(C.wob>0.001){C.wob*=Math.pow(0.015,dt);C.sled.rotation.z=Math.sin(clock.getElapsedTime()*26)*C.wob;}else C.sled.rotation.z=0;}
function tryArrowCharger(a){const C=arena.charger;if(!C||C.state==='retreat')return false;
  C.grp.updateMatrixWorld(true);const dummyW=C.sled.getWorldPosition(new THREE.Vector3());
  if(Math.hypot(a.pos.x-dummyW.x,a.pos.z-dummyW.z)<0.5&&a.pos.y>0.6&&a.pos.y<2.1){
    C.wob=0.55;C.state='retreat';C.hitCD=0.8;fx.shake=Math.max(fx.shake,0.1);popText('Pfeil stoppt die Streitpuppe!',TREFFM_OK_CSS,0,0);popText('+15',TREFFM_OK_CSS,0.12,0.06);
    arena.score.shots++;arena.score.sum+=15;arena.score.last={ring:15,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};updateHUD();return true;}
  return false;}
function tryHitCharger(handW,bladeDir,vel){const C=arena.charger;if(!C||C.state!=='charge'||C.hitCD>0.4)return false;
  C.grp.updateMatrixWorld(true);const dummyW=C.sled.getWorldPosition(new THREE.Vector3());
  const e1=arena._edge1;let hit=false;
  hit=!!bladeHitsColumn(handW,bladeDir,dummyW,0.45,0.5,2.1);
  if(!hit)return false;
  const ms=wMass(),sp=vel.length()*ms;C.wob=0.45*Math.min(1.5,ms);C.hitCD=0.5;
  const _dist=Math.hypot(dummyW.x-arena.player.x,dummyW.z-arena.player.z),_reach=Math.max(0.3,e1),_jam=clamp((_dist-_reach*0.15)/(_reach*0.45),0.15,1),spEff=sp*_jam;
  if(spEff>3.5){C.state='retreat';C.hitCD=0.8;popText('Streitpuppe zurueckgeschlagen!',TREFFM_OK_CSS,0,-0.04);fx.shake=Math.max(fx.shake,0.13);fx.freeze=Math.max(fx.freeze,0.06);arena.cooldown=0.25;}
  else if(sp>3.5&&_jam<0.6){C.wob=0.30;popText('zu nah — '+currentGattung+' kommt nicht zur Geltung!',WARNM_CSS,0,0);bladeRecoil(0.5);}
  else{popText('zu schwach — sie draengt weiter',WARNM_CSS,0,0);bladeRecoil(0.6);}
  return true;}

/* V18.491.274 — Lab gauntlet corridor ← GASSE_GESETZ fail-soft; Host none (GASSE_VIS). KETTE rope / FOLGE / LIFT untouched. */
const _GSG=(SC&&SC.GASSE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GASSE_GESETZ)||null;
const GASSE_N=(_GSG&&Number.isFinite(_GSG.N))?_GSG.N:4;
const GASSE_GAP=(_GSG&&Number.isFinite(_GSG.gap))?_GSG.gap:1.8;
const GASSE_H=(_GSG&&Number.isFinite(_GSG.H))?_GSG.H:3.0;
/* V18.491.403 — Lab Gauntlet-Seil ← TAU_GESETZ fail-soft; Host none (TAU_VIS). ZIPFEL/SEIL/SCHLINGE/GURT/STRICK/LEINE/STRANG/OESE/KETTE/PFOST/DORN/LATTE/LIFT untouched. */
const _TAU=(SC&&SC.TAU_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TAU_GESETZ)||null;
const TAU_R=(_TAU&&Number.isFinite(_TAU.R))?_TAU.R:0.014;
/* V18.491.404 — Lab Gauntlet-Endpfosten ← PFYL_GESETZ fail-soft; Host none (PFYL_VIS). PFOST/PFOSTEN/DORN/PFAHL/STEHER/SAULE/TAU/RAD/LIFT untouched; H stays GASSE_H. */
const _PFY=(SC&&SC.PFYL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PFYL_GESETZ)||null;
const PFYL_R0=(_PFY&&Number.isFinite(_PFY.R0))?_PFY.R0:0.08;
const PFYL_R1=(_PFY&&Number.isFinite(_PFY.R1))?_PFY.R1:0.1;
const PFYL_XOFF=(_PFY&&Number.isFinite(_PFY.xOff))?_PFY.xOff:0.55;
const PFYL_ZPAD=(_PFY&&Number.isFinite(_PFY.zPad))?_PFY.zPad:0.1;
/* V18.491.405 — Lab Gauntlet-Querbalken ← RIEGEL_GESETZ fail-soft; Host none (RIEGEL_VIS). PFYL/LATTE/BALKEN/QUER/TRAEGER/SAULE/TAU/PFOST/DORN/LIFT untouched; xOff own (≠ retrofit PFYL). */
const _RIE=(SC&&SC.RIEGEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RIEGEL_GESETZ)||null;
const RIEGEL_W=(_RIE&&Number.isFinite(_RIE.W))?_RIE.W:0.12;
const RIEGEL_H=(_RIE&&Number.isFinite(_RIE.H))?_RIE.H:0.14;
const RIEGEL_ZEXTRA=(_RIE&&Number.isFinite(_RIE.zExtra))?_RIE.zExtra:0.4;
const RIEGEL_XOFF=(_RIE&&Number.isFinite(_RIE.xOff))?_RIE.xOff:0.55;
const RIEGEL_YOFF=(_RIE&&Number.isFinite(_RIE.yOff))?_RIE.yOff:0.06;
/* V18.491.406 — Lab Gauntlet-Pivot ← ANGEL_GESETZ fail-soft; Host none (ANGEL_VIS). RIEGEL/PFYL/TAU/DREH/ZAPFEN/LIFT untouched. */
const _ANG=(SC&&SC.ANGEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ANGEL_GESETZ)||null;
const ANGEL_YOFF=(_ANG&&Number.isFinite(_ANG.yOff))?_ANG.yOff:0.12;
/* V18.491.412 — Lab Gauntlet-Seil Anfangs-Knick ← KNICK_GESETZ fail-soft; Host none (KNICK_VIS). ZIELP/DORN/NAHE/REICH/OESE/ANGEL/RIEGEL/TAU/LIFT untouched; Verlet X-bias only. */
const _KNI=(SC&&SC.KNICK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KNICK_GESETZ)||null;
const KNICK_AMP=(_KNI&&Number.isFinite(_KNI.amp))?_KNI.amp:0.05;
function buildGauntlet(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.533 — Lab Pendel-Gasse/Gauntlet Mats ← GASSEM_GESETZ fail-soft; Host none (GASSEM_VIS). ZIPFELM/STREITM/GASSE logic/clay/swing/LIFT untouched. */
  const _GSM=(SC&&SC.GASSEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GASSEM_GESETZ)||null;
  const GASSEM_WOOD=(_GSM&&Number.isFinite(_GSM.wood))?_GSM.wood:0x4a3520;
  const GASSEM_WOODR=(_GSM&&Number.isFinite(_GSM.woodR))?_GSM.woodR:0.9;
  const GASSEM_DARK=(_GSM&&Number.isFinite(_GSM.dark))?_GSM.dark:0x2a1d12;
  const GASSEM_DARKR=(_GSM&&Number.isFinite(_GSM.darkR))?_GSM.darkR:0.9;
  const GASSEM_ROPE=(_GSM&&Number.isFinite(_GSM.rope))?_GSM.rope:0x6e5a3a;
  const GASSEM_ROPER=(_GSM&&Number.isFinite(_GSM.ropeR))?_GSM.ropeR:0.8;
  const GASSEM_BALL=(_GSM&&Number.isFinite(_GSM.ball))?_GSM.ball:0x484440;
  const GASSEM_BALLR=(_GSM&&Number.isFinite(_GSM.ballR))?_GSM.ballR:0.5;
  const wood=matCol(GASSEM_WOOD,GASSEM_WOODR,0),dark=matCol(GASSEM_DARK,GASSEM_DARKR,0);
  const N=GASSE_N,gap=GASSE_GAP,len=N*gap,H=GASSE_H;arena.gauntlet={grp:g,ropes:[]};
  for(let i=0;i<N;i++){const cz=-len/2+gap*0.5+i*gap;const pivot=new THREE.Vector3(pos.x,pos.y+H-ANGEL_YOFF,pos.z+cz);
    const L=KETTE_L,ballR=KETTE_BALLR,NS=KETTE_NS,segLen=L/NS;const pts=[],ptsPrev=[];
    for(let k=0;k<=NS;k++){const p=new THREE.Vector3(pivot.x,pivot.y-segLen*k,pivot.z);pts.push(p.clone());ptsPrev.push(p.clone());}
    const sign=i%2?1:-1;for(let k=1;k<=NS;k++)ptsPrev[k].x-=sign*KNICK_AMP*(k/NS);
    const ropeSegs=[];for(let k=0;k<NS;k++){const seg=new THREE.Mesh(new THREE.CylinderGeometry(TAU_R,TAU_R,segLen,5),matCol(GASSEM_ROPE,GASSEM_ROPER,0));g.add(seg);ropeSegs.push(seg);}
    const ball=new THREE.Mesh(new THREE.SphereGeometry(ballR,14,11),matCol(GASSEM_BALL,GASSEM_BALLR,0));ball.castShadow=true;g.add(ball);
    arena.gauntlet.ropes.push({ball,ropeSegs,pivot,N:NS,segLen,L,ballR,pts,ptsPrev,hitCD:0});}
  for(const cz of [-len/2-PFYL_ZPAD,len/2+PFYL_ZPAD]){for(const cx of [-PFYL_XOFF,PFYL_XOFF]){const post=new THREE.Mesh(new THREE.CylinderGeometry(PFYL_R0,PFYL_R1,H,8),wood);post.position.set(cx,H/2,cz);post.castShadow=true;g.add(post);}}
  for(const cx of [-RIEGEL_XOFF,RIEGEL_XOFF]){const beam=new THREE.Mesh(new THREE.BoxGeometry(RIEGEL_W,RIEGEL_H,len+RIEGEL_ZEXTRA),dark);beam.position.set(cx,H-RIEGEL_YOFF,0);g.add(beam);}
  updateGauntlet(0);return g;}
function updateGauntlet(dt){const G=arena.gauntlet;if(!G)return;
  for(const P of G.ropes){const N=P.N;
    stepRope(P,dt);
    drawRope(P,G.grp.position.x,G.grp.position.y,G.grp.position.z);
    const bw=P.pts[N];
    if(P.hitCD>0)P.hitCD-=dt;
    if(dt>0&&P.hitCD<=0){const spd=Math.hypot(bw.x-P.ptsPrev[N].x,bw.z-P.ptsPrev[N].z)/Math.max(1e-4,dt);if(spd>1.5){const dh=Math.hypot(bw.x-arena.player.x,bw.z-arena.player.z);if(dh<P.ballR+0.42&&bw.y<1.85){fx.shake=Math.max(fx.shake,0.35);fx.freeze=Math.max(fx.freeze,0.09);popText('✖ Pendel erwischt dich',GERATM_CSS,0,0);P.hitCD=1.0;}}}}}
function tryHitGauntlet(handW,bladeDir,vel){const G=arena.gauntlet;if(!G)return false;
  for(const P of G.ropes){if(P.hitCD>0.55)continue;const N=P.N,bw=P.pts[N];let hit=false;
    hit=!!bladeHitsPoint(handW,bladeDir,bw,P.ballR+0.07);
    if(!hit)continue;
    P.ptsPrev[N].x-=clamp(vel.x,-7,7)*0.014*wMass();P.ptsPrev[N].z-=clamp(vel.z,-7,7)*0.014*wMass();P.ptsPrev[N].y-=clamp(vel.y,-5,5)*0.007*wMass();
    fx.shake=Math.max(fx.shake,0.07);fx.freeze=Math.max(fx.freeze,0.04);popText('Pendel getroffen',GERTTM_CSS,0,-0.04);arena.cooldown=0.16;return true;}
  return false;}

/* V18.491.276 — Lab clay thrower ← TON_GESETZ fail-soft; Host none (TON_VIS). SCHEIBE archery / RITTER / LIFT untouched. */
const _TNG=(SC&&SC.TON_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TON_GESETZ)||null;
const TON_NEARR=(_TNG&&Number.isFinite(_TNG.nearR))?_TNG.nearR:30;
const TON_NEXTT0=(_TNG&&Number.isFinite(_TNG.nextT0))?_TNG.nextT0:1.5;
const TON_LIFTY=(_TNG&&Number.isFinite(_TNG.liftY))?_TNG.liftY:0.95;
const TON_VYBASE=(_TNG&&Number.isFinite(_TNG.vyBase))?_TNG.vyBase:7.5;
const TON_HITR=(_TNG&&Number.isFinite(_TNG.hitR))?_TNG.hitR:0.45;
/* V18.491.407 — Lab Clay-Thrower Sockel ← BLOCK_GESETZ fail-soft; Host none (BLOCK_VIS). ANGEL/RIEGEL/PFYL/SCHLITT/SOCKEL/FUSS/BANK/PODES/TON/LIFT untouched. */
const _BLK=(SC&&SC.BLOCK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BLOCK_GESETZ)||null;
const BLOCK_W=(_BLK&&Number.isFinite(_BLK.W))?_BLK.W:0.6;
const BLOCK_H=(_BLK&&Number.isFinite(_BLK.H))?_BLK.H:0.3;
const BLOCK_D=(_BLK&&Number.isFinite(_BLK.D))?_BLK.D:0.6;
const BLOCK_Y=(_BLK&&Number.isFinite(_BLK.y))?_BLK.y:0.15;
/* V18.491.408 — Lab Clay-Thrower Hebel ← HEBEL_GESETZ fail-soft; Host none (HEBEL_VIS). BLOCK/ARM/AUSLEG/RIEGEL/ANGEL/PFYL/STANGE/LIFT untouched; geom+y+rotX one twin. */
const _HEB=(SC&&SC.HEBEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HEBEL_GESETZ)||null;
const HEBEL_W=(_HEB&&Number.isFinite(_HEB.W))?_HEB.W:0.14;
const HEBEL_H=(_HEB&&Number.isFinite(_HEB.H))?_HEB.H:0.8;
const HEBEL_D=(_HEB&&Number.isFinite(_HEB.D))?_HEB.D:0.14;
const HEBEL_Y=(_HEB&&Number.isFinite(_HEB.y))?_HEB.y:0.55;
const HEBEL_ROTX=(_HEB&&Number.isFinite(_HEB.rotX))?_HEB.rotX:-0.55;
/* V18.491.409 — Lab Clay-Thrower Becher ← BECHER_GESETZ fail-soft; Host none (BECHER_VIS). HEBEL/BLOCK/TONNE/KNOLLE/TON/LIFT untouched. */
const _BEC=(SC&&SC.BECHER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BECHER_GESETZ)||null;
const BECHER_R0=(_BEC&&Number.isFinite(_BEC.R0))?_BEC.R0:0.18;
const BECHER_R1=(_BEC&&Number.isFinite(_BEC.R1))?_BEC.R1:0.14;
const BECHER_H=(_BEC&&Number.isFinite(_BEC.H))?_BEC.H:0.1;
const BECHER_Y=(_BEC&&Number.isFinite(_BEC.y))?_BEC.y:0.95;
const BECHER_Z=(_BEC&&Number.isFinite(_BEC.z))?_BEC.z:0.22;
/* V18.491.410 — Lab Clay-Thrower Wurfscheibe ← SCHEIB_GESETZ fail-soft; Host none (SCHEIB_VIS). SCHEIBE/BECHER/HEBEL/BLOCK/RAD/TONNE/TELLER/PLATTE/PELL/HELM/LIFT untouched; pose dynamic. */
const _SCB=(SC&&SC.SCHEIB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHEIB_GESETZ)||null;
const SCHEIB_R=(_SCB&&Number.isFinite(_SCB.R))?_SCB.R:0.17;
const SCHEIB_H=(_SCB&&Number.isFinite(_SCB.H))?_SCB.H:0.04;
function buildClayThrower(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.534 — Lab Ton-Wurf/Clay Mats ← TONM_GESETZ fail-soft; Host none (TONM_VIS). GASSEM/ZIPFELM/STREITM/TON logic/SCHEIBM/swing/LIFT untouched. */
  const _TNM=(SC&&SC.TONM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TONM_GESETZ)||null;
  const TONM_DARK=(_TNM&&Number.isFinite(_TNM.dark))?_TNM.dark:0x33312c;
  const TONM_DARKR=(_TNM&&Number.isFinite(_TNM.darkR))?_TNM.darkR:0.45;
  const TONM_WOOD=(_TNM&&Number.isFinite(_TNM.wood))?_TNM.wood:0x4a3520;
  const TONM_WOODR=(_TNM&&Number.isFinite(_TNM.woodR))?_TNM.woodR:0.9;
  const TONM_METAL=(_TNM&&Number.isFinite(_TNM.metal))?_TNM.metal:0x4a4842;
  const TONM_METALR=(_TNM&&Number.isFinite(_TNM.metalR))?_TNM.metalR:0.4;
  const TONM_DISC=(_TNM&&Number.isFinite(_TNM.disc))?_TNM.disc:0xc85a3a;
  const TONM_DISCR=(_TNM&&Number.isFinite(_TNM.discR))?_TNM.discR:0.6;
  const dark=matCol(TONM_DARK,TONM_DARKR,0),wood=matCol(TONM_WOOD,TONM_WOODR,0),metal=matCol(TONM_METAL,TONM_METALR,0);
  const base=new THREE.Mesh(new THREE.BoxGeometry(BLOCK_W,BLOCK_H,BLOCK_D),dark);base.position.y=BLOCK_Y;g.add(base);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(HEBEL_W,HEBEL_H,HEBEL_D),wood);arm.position.set(0,HEBEL_Y,0);arm.rotation.x=HEBEL_ROTX;g.add(arm);
  const cup=new THREE.Mesh(new THREE.CylinderGeometry(BECHER_R0,BECHER_R1,BECHER_H,12),metal);cup.position.set(0,BECHER_Y,BECHER_Z);g.add(cup);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(SCHEIB_R,SCHEIB_R,SCHEIB_H,16),matCol(TONM_DISC,TONM_DISCR,0));disc.visible=false;g.add(disc);
  arena.clay={grp:g,thrower:pos.clone(),disc,active:false,nextT:TON_NEXTT0,vel:new THREE.Vector3(),pos:new THREE.Vector3(),broke:0};return g;}
function updateClay(dt){const C=arena.clay;if(!C)return;const t=clock.getElapsedTime();
  if(!C.active){if(t>C.nextT&&Math.hypot(arena.player.x-C.thrower.x,arena.player.z-C.thrower.z)<TON_NEARR){C.pos.copy(C.thrower);C.pos.y+=TON_LIFTY;C.vel.set((Math.random()-0.5)*3,TON_VYBASE+Math.random()*2.5,(Math.random()<0.5?1:-1)*(4+Math.random()*4));C.active=true;C.disc.visible=true;popText('PULL! — Wurfscheibe steigt',PULLM_CSS,0,-0.22);}return;}
  C.vel.y-=ARENA.g*dt;C.pos.addScaledVector(C.vel,dt);
  C.disc.position.set(C.pos.x-C.grp.position.x,C.pos.y-C.grp.position.y,C.pos.z-C.grp.position.z);C.disc.rotation.x+=dt*7;C.disc.rotation.z+=dt*4;
  if(C.pos.y<0.12){C.active=false;C.disc.visible=false;C.nextT=t+2.0+Math.random()*2.2;}}
function tryArrowClay(a){const C=arena.clay;if(!C||!C.active)return false;
  if(a.pos.distanceTo(C.pos)<TON_HITR){C.active=false;C.disc.visible=false;C.nextT=clock.getElapsedTime()+1.6+Math.random()*1.5;C.broke++;
    fx.shake=Math.max(fx.shake,0.1);popText('SCHEIBE ZERSPLITTERT — in der Luft getroffen!',GOLDM_CSS,0,0);popText('+25',TREFFM_OK_CSS,0.12,0.06);arena.score.shots++;arena.score.sum+=25;arena.score.last={ring:25,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};updateHUD();return true;}
  return false;}

/* V18.491.278 — Lab swing target ← SCHAUKEL_GESETZ fail-soft; Host none (SCHAUKEL_VIS). PENDEL rope-ball / STREIT / LIFT untouched. */
const _SKG=(SC&&SC.SCHAUKEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHAUKEL_GESETZ)||null;
const SCHAUKEL_L=(_SKG&&Number.isFinite(_SKG.L))?_SKG.L:1.55;
const SCHAUKEL_R=(_SKG&&Number.isFinite(_SKG.R))?_SKG.R:0.36;
const SCHAUKEL_ANG0=(_SKG&&Number.isFinite(_SKG.ang0))?_SKG.ang0:0.6;
/* V18.491.305 — Lab swing-target hang rope ← LEINE_GESETZ fail-soft; Host none (LEINE_VIS). STRICK / SCHAUKEL dynamics / SEIL / LIFT untouched. */
const _LNG=(SC&&SC.LEINE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEINE_GESETZ)||null;
const LEINE_R=(_LNG&&Number.isFinite(_LNG.R))?_LNG.R:0.012;
const LEINE_L=(_LNG&&Number.isFinite(_LNG.L))?_LNG.L:1.5;
/* V18.491.306 — Lab swing-target frame ← GESTELL_GESETZ fail-soft; Host none (GESTELL_VIS). PERGOLA / BOCK / LEINE / SCHAUKEL / GASSE / LIFT untouched. */
const _GTLG=(SC&&SC.GESTELL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GESTELL_GESETZ)||null;
const GESTELL_HALFZ=(_GTLG&&Number.isFinite(_GTLG.halfZ))?_GTLG.halfZ:1.1;
const GESTELL_POSTR0=(_GTLG&&Number.isFinite(_GTLG.postR0))?_GTLG.postR0:0.08;
const GESTELL_POSTR1=(_GTLG&&Number.isFinite(_GTLG.postR1))?_GTLG.postR1:0.1;
const GESTELL_POSTH=(_GTLG&&Number.isFinite(_GTLG.postH))?_GTLG.postH:3.3;
const GESTELL_BEAMW=(_GTLG&&Number.isFinite(_GTLG.beamW))?_GTLG.beamW:0.14;
const GESTELL_BEAMH=(_GTLG&&Number.isFinite(_GTLG.beamH))?_GTLG.beamH:0.14;
const GESTELL_BEAML=(_GTLG&&Number.isFinite(_GTLG.beamL))?_GTLG.beamL:2.6;
const GESTELL_BEAMY=(_GTLG&&Number.isFinite(_GTLG.beamY))?_GTLG.beamY:3.3;
/* V18.491.307 — Lab swing-target face rings ← BLATT_GESETZ fail-soft; Host none (BLATT_VIS). SCHEIBE / ROLLE / ENTE / GESTELL / LIFT untouched. */
const _BLTG=(SC&&SC.BLATT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BLATT_GESETZ)||null;
const BLATT_N=(_BLTG&&Number.isFinite(_BLTG.n))?_BLTG.n:4;
const BLATT_RSTEP=(_BLTG&&Number.isFinite(_BLTG.rStep))?_BLTG.rStep:0.09;
const BLATT_THK0=(_BLTG&&Number.isFinite(_BLTG.thk0))?_BLTG.thk0:0.045;
const BLATT_DTHK=(_BLTG&&Number.isFinite(_BLTG.dThk))?_BLTG.dThk:0.004;
/* V18.491.308 — Lab swing-target rest height ← RUHE_GESETZ fail-soft; Host none (RUHE_VIS). GESTELL / SCHAUKEL / LEINE / BLATT / REIHE / LIFT untouched. */
const _RUG=(SC&&SC.RUHE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RUHE_GESETZ)||null;
const RUHE_Y=(_RUG&&Number.isFinite(_RUG.y))?_RUG.y:1.75;
function buildSwingTarget(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.535 — Lab Pendelziel/Swing Mats ← SCHAUKELM_GESETZ fail-soft; Host none (SCHAUKELM_VIS). TONM/GASSEM/ZIPFELM/SCHAUKEL logic/BLATT geo/LIFT untouched. */
  const _SWGM=(SC&&SC.SCHAUKELM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHAUKELM_GESETZ)||null;
  const SCHAUKELM_WOOD=(_SWGM&&Number.isFinite(_SWGM.wood))?_SWGM.wood:0x4a3520;
  const SCHAUKELM_WOODR=(_SWGM&&Number.isFinite(_SWGM.woodR))?_SWGM.woodR:0.9;
  const SCHAUKELM_DARK=(_SWGM&&Number.isFinite(_SWGM.dark))?_SWGM.dark:0x2a1d12;
  const SCHAUKELM_DARKR=(_SWGM&&Number.isFinite(_SWGM.darkR))?_SWGM.darkR:0.9;
  const SCHAUKELM_COLS_FALL=[0xd8cab0,0x2f4858,0xc85a3a,0xd8cab0];
  const SCHAUKELM_COLS=(_SWGM&&Array.isArray(_SWGM.cols)&&_SWGM.cols.length===4&&_SWGM.cols.every(function(v){return Number.isFinite(v);}))?_SWGM.cols.slice():SCHAUKELM_COLS_FALL.slice();
  const SCHAUKELM_RINGR=(_SWGM&&Number.isFinite(_SWGM.ringR))?_SWGM.ringR:0.6;
  const SCHAUKELM_FALL=(_SWGM&&Number.isFinite(_SWGM.fallback))?_SWGM.fallback:0x888888;
  const wood=matCol(SCHAUKELM_WOOD,SCHAUKELM_WOODR,0),dark=matCol(SCHAUKELM_DARK,SCHAUKELM_DARKR,0);
  for(const sz of [-GESTELL_HALFZ,GESTELL_HALFZ]){const post=new THREE.Mesh(new THREE.CylinderGeometry(GESTELL_POSTR0,GESTELL_POSTR1,GESTELL_POSTH,10),wood);post.position.set(0,GESTELL_POSTH/2,sz);post.castShadow=true;g.add(post);}
  const beam=new THREE.Mesh(new THREE.BoxGeometry(GESTELL_BEAMW,GESTELL_BEAMH,GESTELL_BEAML),dark);beam.position.set(0,GESTELL_BEAMY,0);g.add(beam);
  const rope=new THREE.Mesh(new THREE.CylinderGeometry(LEINE_R,LEINE_R,LEINE_L,5),dark);g.add(rope);
  const tgt=new THREE.Group();g.add(tgt);const cols=SCHAUKELM_COLS;
  for(let i=BLATT_N;i>=1;i--){const ring=new THREE.Mesh(new THREE.CylinderGeometry(i*BLATT_RSTEP,i*BLATT_RSTEP,BLATT_THK0+(BLATT_N-i)*BLATT_DTHK,20),matCol(cols[BLATT_N-i]||SCHAUKELM_FALL,SCHAUKELM_RINGR,0));ring.rotation.z=Math.PI/2;tgt.add(ring);}
  arena.swingTgt={grp:g,tgt,rope,pivot:new THREE.Vector3(pos.x,pos.y+GESTELL_BEAMY,pos.z),L:SCHAUKEL_L,R:SCHAUKEL_R,ang:SCHAUKEL_ANG0,vel:0,struck:false,respawnAt:0,_wz:pos.z,_wy:pos.y+RUHE_Y};
  updateSwingTarget(0);return g;}
function updateSwingTarget(dt){const S=arena.swingTgt;if(!S)return;
  if(dt>0&&!S.struck){S.vel+=(-(ARENA.g/S.L)*Math.sin(S.ang))*dt;S.vel*=0.9985;S.ang+=S.vel*dt;}
  const tz=Math.sin(S.ang)*S.L,ty=-Math.cos(S.ang)*S.L,wz=S.pivot.z+tz,wy=S.pivot.y+ty;
  S.tgt.position.set(0,wy-S.grp.position.y,wz-S.grp.position.z);
  S.rope.position.set(0,(S.pivot.y+wy)/2-S.grp.position.y,(S.pivot.z+wz)/2-S.grp.position.z);
  const rdir=new THREE.Vector3(0,ty,tz),rl=rdir.length()||1e-4;S.rope.scale.y=rl/1.5;S.rope.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),rdir.normalize());
  if(S.struck&&clock.getElapsedTime()>S.respawnAt){S.struck=false;S.tgt.visible=true;}
  S._wz=wz;S._wy=wy;}
function tryArrowSwing(a){const S=arena.swingTgt;if(!S||S.struck)return false;
  const dx=a.pos.x-S.pivot.x,dz=a.pos.z-S._wz,dy=a.pos.y-S._wy;
  if(Math.abs(dx)<0.22&&Math.hypot(dz,dy)<S.R){const r=Math.hypot(dz,dy),ring=clamp(Math.ceil(4*(1-r/S.R)),1,4);
    S.struck=true;S.respawnAt=clock.getElapsedTime()+2.5;S.tgt.visible=false;S.vel+=(a.vel&&a.vel.z>0?2:-2);
    fx.shake=Math.max(fx.shake,0.08);popText('PENDELZIEL getroffen — vorgehalten! · '+ring,GOLDM_CSS,0,0);popText('+'+(ring*5),TREFFM_OK_CSS,0.12,0.06);arena.score.shots++;arena.score.sum+=ring*5;arena.score.last={ring:ring*5,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};updateHUD();return true;}
  return false;}

/* V18.491.286 — Lab range specs ← BAHN_GESETZ fail-soft; Host none (BAHN_VIS). SCHEIBE face / PAPAGEI / LIFT untouched. */
const BAHN_SPECS_FALLBACK=[[17,1.42,-0.5,0.40],[23,1.42,0.4,0.40],[31,1.42,1.0,0.40],[20,1.2,-3.2,0.20]];
const _BHG=(SC&&SC.BAHN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BAHN_GESETZ)||null;
/* V18.491.411 — Lab Bahn-Zielpfosten ← ZIELP_GESETZ fail-soft; Host none (ZIELP_VIS). PFYL/PFOST/DORN/PFAHL/STEHER/MAST/SCHEIB/SCHEIBE/RIEGEL/STAB/LIFT untouched; H stays target y. */
const _ZLP=(SC&&SC.ZIELP_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ZIELP_GESETZ)||null;
const ZIELP_R0=(_ZLP&&Number.isFinite(_ZLP.R0))?_ZLP.R0:0.04;
const ZIELP_R1=(_ZLP&&Number.isFinite(_ZLP.R1))?_ZLP.R1:0.05;
function _bahnSpecsOk(s){if(!Array.isArray(s)||s.length!==4)return false;for(const r of s){if(!Array.isArray(r)||r.length!==4)return false;for(const v of r)if(!Number.isFinite(v))return false;}return true;}
function buildRange(){arena.targets=[];const specs=_bahnSpecsOk(_BHG&&_BHG.specs)?_BHG.specs.map(r=>r.slice()):BAHN_SPECS_FALLBACK.map(r=>r.slice());
  /* V18.491.539 — Lab Bahn-Zielpfosten Mat ← ZIELPM_GESETZ fail-soft; Host none (ZIELPM_VIS). BUDEM/ENTEM/ZIELP geo/TATAMIM/TORII/LIFT untouched. */
  const _ZLM=(SC&&SC.ZIELPM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ZIELPM_GESETZ)||null;
  const ZIELPM_COLOR=(_ZLM&&Number.isFinite(_ZLM.color))?_ZLM.color:0x3a2a1a;
  const ZIELPM_ROUGH=(_ZLM&&Number.isFinite(_ZLM.rough))?_ZLM.rough:0.9;
  for(const sp of specs){const x=sp[0],y=sp[1],z=sp[2],R=sp[3];
    const t=buildZielscheibe();t.position.set(x,y,z);t.traverse(o=>{if(o.material)o.material.side=THREE.DoubleSide;});arena.group.add(t);
    const post=new THREE.Mesh(new THREE.CylinderGeometry(ZIELP_R0,ZIELP_R1,y,8),matCol(ZIELPM_COLOR,ZIELPM_ROUGH,0));post.position.set(x,y/2,z);arena.group.add(post);
    arena.targets.push({mesh:t,pos:new THREE.Vector3(x,y,z),R});}}
function equipWeapon(name){if(!GATTUNGEN[name])return;
  delete P.guardOverride;P.backSpike=false;P.beak=false;delete P.task;delete P.cheekMul;delete P.pickLen;
  Object.assign(P,GATTUNGEN[name]);if(!P.task)snapBases(P);currentGattung=name;applyTrad(currentTrad,false);
  arena.kind=(P.modus==='bogen')?'bow':'melee';
  arena.swinging=arena.thrusting=false;arena.holdView=false;arena.ready=0;arena.sw={yaw:0,pitch:0,reach:0};arena.swRoll=0;arena._rollRend=0;arena._aimF=0;arena._edgeAlign=1;
  arena.drawFrac=0;arena.drawing=false;arena._wantAim=false;arena.raise=0;arena.prevTip=null;arena._builtFrac=-1;arena.swP=0;arena.swY=0;arena._prevSwY=0;arena._prevSwP=0;arena._restT=0;arena.swLay=0;
  buildViewModel();placeViewModel(0);hudHint();updateHUD();}
function pickupCheck(){if(!arena.rack)return;let best=null,bd=1.7;
  for(const r of arena.rack){const d=Math.hypot(arena.player.x-r.pos.x,arena.player.z-r.pos.z);if(d<bd){bd=d;best=r;}}
  arena._near=best;const pe=document.getElementById('pickup');if(!pe)return;
  if(best&&best.name!==currentGattung){pe.style.display='block';pe.innerHTML='<b>E</b> — '+best.name+' nehmen';}else pe.style.display='none';}
function updateFalling(dt){if(!arena.fallingBamboo)return;
  for(let i=arena.fallingBamboo.length-1;i>=0;i--){const f=arena.fallingBamboo[i];f.vel.y-=ARENA.g*dt;
    f.mesh.position.addScaledVector(f.vel,dt);f.mesh.rotation.x+=f.ang.x*dt;f.mesh.rotation.z+=f.ang.z*dt;f.life+=dt;
    if(f.mesh.position.y<0.06){f.mesh.position.y=0.06;f.vel.x*=0.4;f.vel.z*=0.4;f.vel.y=Math.abs(f.vel.y)*0.25;f.ang.multiplyScalar(0.5);}
    if(f.life>6){if(f.mesh.parent)f.mesh.parent.remove(f.mesh);arena.fallingBamboo.splice(i,1);}}}
function bladeRecoil(strength){const s=clamp(strength,0,1.2),B=camBasis(),ms=wMass();
  fx.shake=Math.max(fx.shake,0.18+0.24*s*ms);
  fx.freeze=Math.max(fx.freeze,0.08+0.07*s);                                                   // Hitstop — der Schlag „steht" kurz
  fx.kickV.addScaledVector(B.fwd,-1.6*s*Math.min(1.5,ms));fx.kickV.y+=1.2*s*Math.min(1.5,ms);                                     // Sicht ruckt zurück/hoch (Rückstoss)
  arena._mdx=0;arena._mdy=0;                                                                    // Schwung gestoppt — Klinge prallt ab statt durchzugehen
  arena.swP=clamp((arena.swP||0)+0.30*s,-1.95,0.7);                                             // Klinge springt zurück hoch (Rückschlag)
  arena.swY=(arena.swY||0)*0.5;                                                                 // seitlicher Schwung gebremst
  arena.cooldown=Math.max(arena.cooldown,0.14+0.05*s);}
function tryCutBamboo(handW,bladeDir,vel){if(!arena.bamboo)return;const m=measure(P),S=m.S;
  const sharp=(m.edgeWinkel!=null&&m.edgeWinkel<32);   // EIN sharp-Prädikat im ganzen System (harmonisiert von 30)
  const e0=arena._edge0,e1=arena._edge1,gXd=arena._gripXdom||0,eLen=Math.max(0.02,e1-e0),xcop=(m.xcop!=null?m.xcop:S.xBlade0+0.65*(S.xPoint-S.xBlade0));
  const vAxT=Math.abs(vel.dot(bladeDir)),vLatT=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir)).length();
  for(const b of arena.bamboo){if(b.cut)continue;
    let best=null;const NS=SCHNEIDE_NS;                                                         // ganze Schneide gegen den Pfahl prüfen
    for(let i=0;i<=NS;i++){const p=e0+(i/NS)*eLen,pt=handW.clone().addScaledVector(bladeDir,p).add(bladeCurve(i/NS)),dH=Math.hypot(pt.x-b.wx,pt.z-b.wz);
      if(dH<0.14&&pt.y>b.baseY+0.06&&pt.y<b.baseY+b.h-0.03&&(!best||dH<best.dH))best={p:p,pt:pt,dH:dH};}
    if(!best)continue;
    const xLoc=gXd+best.p, velFac=clamp(best.p/Math.max(0.05,e1),0.12,1.0), eff=clamp(1-1.4*Math.abs(xLoc-xcop)/S.L,0.25,1.0); // Tempo ~ Abstand vom Handgelenk, Effizienz ~ Nähe zum Stoßmittelpunkt
    const vAx=vAxT*velFac, vLat=vLatT*velFac, mEff=Math.max(0.02,(m.mEffFrac||0.2)*m.M);
    const edgeQ=clamp(arena._edgeAlign!=null?arena._edgeAlign:1,0.15,1), KE=0.5*mEff*vLat*vLat*eff*(0.25+0.75*edgeQ);   // wahre Schneide: EIN Faktor überall
    const where=Math.abs(xLoc-xcop)/S.L<0.12?'Sweetspot':best.p>e1*0.85?'Spitze':best.p<e1*0.4?'gehilznah':'Mitte';
    if(!sharp){b.wobble=0.35;popText('stumpf — keine Schneide',TREFFM_BAD_CSS,0,0);bladeRecoil(0.7);b.cut='miss';setTimeout(()=>{if(b.cut==='miss')b.cut=false;},350);return;}
    if(vLat<vAx*0.8){b.wobble=0.32;popText('Stich — Bambus splittert nicht, kein Schnitt',TREFFM_BAD_CSS,0,0);bladeRecoil(0.95);return;}
    if(edgeQ<0.45){b.wobble=0.30;popText('flach — die Schneide liegt quer',TREFFM_BAD_CSS,0,0);bladeRecoil(0.8);return;}
    if(KE<10){b.wobble=0.45;popText('zu schwach — die Klinge prallt ab ('+KE.toFixed(0)+' J · '+where+')',WARNM_CSS,0,0);bladeRecoil(0.85);b.cut='miss';setTimeout(()=>{if(b.cut==='miss')b.cut=false;},350);return;}
    const cutDir=vel.clone().setY(0);if(cutDir.lengthSq()<1e-4)cutDir.set(0,0,1);cutDir.normalize();
    cutBambooPole(b,best.pt.y,cutDir,KE);if(where==='Sweetspot')popText('Schwingungsknoten — voll',TREFFM_OK_CSS,0.14,-0.12);arena.cooldown=0.25;return;}}
function cutBambooPole(b,yCut,cutDir,KE){b.cut=true;if(!arena.fallingBamboo)arena.fallingBamboo=[];
  const bottomH=Math.max(0.05,yCut-b.baseY),topH=Math.max(0.05,(b.baseY+b.h)-yCut);
  if(b.mesh.parent)b.mesh.parent.remove(b.mesh);
  const stump=makeBamboo(bottomH);stump.position.set(b.wx,b.baseY,b.wz);arena.group.add(stump);b.mesh=stump;
  const top=makeBamboo(topH);top.position.set(b.wx,yCut,b.wz);arena.group.add(top);
  arena.fallingBamboo.push({mesh:top,vel:cutDir.clone().multiplyScalar(0.6+Math.min(2.5,KE*0.006)).add(new THREE.Vector3(0,0.4,0)),ang:new THREE.Vector3((Math.random()-0.5)*5,0,(Math.random()-0.5)*5),life:0});
  b.respawnAt=clock.getElapsedTime()+(b.lane?0.9:1.6);
  fx.shake=Math.max(fx.shake,0.05);fx.freeze=Math.max(fx.freeze,0.05);
  popText('✁ SAUBERER SCHNITT — '+KE.toFixed(0)+' J',GOLDM_CSS,0,-0.04);popText('die Spitze fällt',NEUTM_CSS,0.12,0.05);}
/* V18.491.281 — Lab swing-tatami ← TATAMI_GESETZ fail-soft; Host none (TATAMI_VIS). SCHAUKEL archery / DREH / LIFT untouched. */
const _TMG=(SC&&SC.TATAMI_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TATAMI_GESETZ)||null;
const TATAMI_LEN=(_TMG&&Number.isFinite(_TMG.len))?_TMG.len:0.55;
const TATAMI_ROLLLEN=(_TMG&&Number.isFinite(_TMG.rollLen))?_TMG.rollLen:1.0;
const TATAMI_AMP=(_TMG&&Number.isFinite(_TMG.amp))?_TMG.amp:0.7;
const TATAMI_W=(_TMG&&Number.isFinite(_TMG.w))?_TMG.w:1.4;
/* V18.491.302 — Lab swing-tatami frame ← BOCK_GESETZ fail-soft; Host none (BOCK_VIS). TATAMI swing / GALGEN / ENTE / LIFT untouched. */
const _BOG=(SC&&SC.BOCK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BOCK_GESETZ)||null;
const BOCK_HALFX=(_BOG&&Number.isFinite(_BOG.halfX))?_BOG.halfX:0.75;
const BOCK_POSTR0=(_BOG&&Number.isFinite(_BOG.postR0))?_BOG.postR0:0.06;
const BOCK_POSTR1=(_BOG&&Number.isFinite(_BOG.postR1))?_BOG.postR1:0.07;
const BOCK_POSTH=(_BOG&&Number.isFinite(_BOG.postH))?_BOG.postH:2.4;
const BOCK_BARR=(_BOG&&Number.isFinite(_BOG.barR))?_BOG.barR:0.05;
const BOCK_BARL=(_BOG&&Number.isFinite(_BOG.barL))?_BOG.barL:1.7;
const BOCK_BARY=(_BOG&&Number.isFinite(_BOG.barY))?_BOG.barY:2.4;
/* V18.491.303 — Lab tatami roll ← ROLLE_GESETZ fail-soft; Host none (ROLLE_VIS). TATAMI / BOCK / ENTE / LIFT untouched. */
const _RLG=(SC&&SC.ROLLE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ROLLE_GESETZ)||null;
const ROLLE_R=(_RLG&&Number.isFinite(_RLG.R))?_RLG.R:0.085;
const ROLLE_RINGYS_FB=[-0.34,0,0.34];
const ROLLE_RINGYS=(_RLG&&Array.isArray(_RLG.ringYs)&&_RLG.ringYs.length===3&&_RLG.ringYs.every(function(y){return Number.isFinite(y);}))?_RLG.ringYs.slice():ROLLE_RINGYS_FB.slice();
const ROLLE_RINGR=(_RLG&&Number.isFinite(_RLG.ringR))?_RLG.ringR:0.09;
const ROLLE_RINGT=(_RLG&&Number.isFinite(_RLG.ringT))?_RLG.ringT:0.014;
/* V18.491.304 — Lab tatami hang rope ← STRICK_GESETZ fail-soft; Host none (STRICK_VIS). SEIL.iters / SCHAUKEL rope / ROLLE / LIFT untouched. */
const _STK=(SC&&SC.STRICK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STRICK_GESETZ)||null;
const STRICK_R=(_STK&&Number.isFinite(_STK.R))?_STK.R:0.012;
/* V18.491.536 — Lab Swing-Tatami Mats ← TATAMIM_GESETZ fail-soft; Host none (TATAMIM_VIS). SCHAUKELM/TATAMI/BOCK/ROLLE/STRICK geo/ZIELP/LIFT untouched. */
const _TTM=(SC&&SC.TATAMIM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TATAMIM_GESETZ)||null;
const TATAMIM_POST=(_TTM&&Number.isFinite(_TTM.post))?_TTM.post:0x3a2a1a;
const TATAMIM_POSTR=(_TTM&&Number.isFinite(_TTM.postR))?_TTM.postR:0.9;
const TATAMIM_BAR=(_TTM&&Number.isFinite(_TTM.bar))?_TTM.bar:0x33251a;
const TATAMIM_BARR=(_TTM&&Number.isFinite(_TTM.barR))?_TTM.barR:0.9;
const TATAMIM_ROLL=(_TTM&&Number.isFinite(_TTM.roll))?_TTM.roll:0xcab793;
const TATAMIM_ROLLR=(_TTM&&Number.isFinite(_TTM.rollR))?_TTM.rollR:0.85;
const TATAMIM_RING=(_TTM&&Number.isFinite(_TTM.ring))?_TTM.ring:0x6a5535;
const TATAMIM_RINGR=(_TTM&&Number.isFinite(_TTM.ringR))?_TTM.ringR:0.8;
const TATAMIM_ROPE=(_TTM&&Number.isFinite(_TTM.rope))?_TTM.rope:0x5a4525;
const TATAMIM_ROPER=(_TTM&&Number.isFinite(_TTM.ropeR))?_TTM.ropeR:0.9;
function buildSwingTatami(pos){const g=new THREE.Group();g.position.copy(pos);
  for(const sx of [-BOCK_HALFX,BOCK_HALFX]){const post=new THREE.Mesh(new THREE.CylinderGeometry(BOCK_POSTR0,BOCK_POSTR1,BOCK_POSTH,8),matCol(TATAMIM_POST,TATAMIM_POSTR,0));post.position.set(sx,BOCK_POSTH/2,0);g.add(post);}
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(BOCK_BARR,BOCK_BARR,BOCK_BARL,8),matCol(TATAMIM_BAR,TATAMIM_BARR,0));bar.rotation.z=Math.PI/2;bar.position.set(0,BOCK_BARY,0);g.add(bar);
  arena.tatami={grp:g,pivot:new THREE.Vector3(pos.x,pos.y+BOCK_BARY,pos.z),len:TATAMI_LEN,rollLen:TATAMI_ROLLLEN,amp:TATAMI_AMP,w:TATAMI_W,phase:0,cut:false,respawnAt:0,roll:null,rope:null};
  spawnTatamiRoll();return g;}
function spawnTatamiRoll(){const T=arena.tatami;
  const roll=new THREE.Mesh(new THREE.CylinderGeometry(ROLLE_R,ROLLE_R,T.rollLen,12),matCol(TATAMIM_ROLL,TATAMIM_ROLLR,0));
  for(const yy of ROLLE_RINGYS){const ring=new THREE.Mesh(new THREE.TorusGeometry(ROLLE_RINGR,ROLLE_RINGT,6,14),matCol(TATAMIM_RING,TATAMIM_RINGR,0));ring.rotation.x=Math.PI/2;ring.position.y=yy;roll.add(ring);}
  roll.position.set(T.pivot.x,T.pivot.y-T.len-T.rollLen*0.5,T.pivot.z);arena.group.add(roll);T.roll=roll;
  const rope=new THREE.Mesh(new THREE.CylinderGeometry(STRICK_R,STRICK_R,T.len,5),matCol(TATAMIM_ROPE,TATAMIM_ROPER,0));arena.group.add(rope);T.rope=rope;T.cut=false;}
function swingTatamiUpdate(t){const T=arena.tatami;if(!T||!T.roll)return;const ang=T.amp*Math.sin(T.w*t+T.phase);
  const rx=T.pivot.x+Math.sin(ang)*T.len, ry=T.pivot.y-Math.cos(ang)*T.len;
  T.rope.position.set((T.pivot.x+rx)/2,(T.pivot.y+ry)/2,T.pivot.z);T.rope.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(rx-T.pivot.x,ry-T.pivot.y,0).normalize());
  const cx=rx+Math.sin(ang)*T.rollLen*0.5, cy=ry-Math.cos(ang)*T.rollLen*0.5;
  T.roll.position.set(cx,cy,T.pivot.z);T.roll.rotation.z=ang;T.rollCenter=new THREE.Vector3(cx,cy,T.pivot.z);}
function tryCutTatami(handW,bladeDir,vel){const T=arena.tatami;if(!T||!T.roll||T.cut)return;const m=measure(P),S=m.S;
  const sharp=(m.edgeWinkel!=null&&m.edgeWinkel<32),c=T.rollCenter;if(!c)return;   // harmonisiert (war 30)
  const e0=arena._edge0,e1=arena._edge1,gXd=arena._gripXdom||0,eLen=Math.max(0.02,e1-e0),xcop=(m.xcop!=null?m.xcop:S.xBlade0+0.65*(S.xPoint-S.xBlade0));
  const vAxT=Math.abs(vel.dot(bladeDir)),vLatT=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir)).length();
  let best=null;const NS=SCHNEIDE_NS;
  for(let i=0;i<=NS;i++){const p=e0+(i/NS)*eLen,pt=handW.clone().addScaledVector(bladeDir,p).add(bladeCurve(i/NS)),dH=Math.hypot(pt.x-c.x,pt.z-c.z),dV=Math.abs(pt.y-c.y);
    if(dH<0.17&&dV<T.rollLen*0.5+0.06&&(!best||dH<best.dH))best={p:p,pt:pt,dH:dH};}
  if(!best)return;
  const xLoc=gXd+best.p, velFac=clamp(best.p/Math.max(0.05,e1),0.12,1.0), eff=clamp(1-1.4*Math.abs(xLoc-xcop)/S.L,0.25,1.0);
  const vAx=vAxT*velFac, vLat=vLatT*velFac, mEff=Math.max(0.02,(m.mEffFrac||0.2)*m.M);
  const edgeQ=clamp(arena._edgeAlign!=null?arena._edgeAlign:1,0.15,1), KE=0.5*mEff*vLat*vLat*eff*(0.25+0.75*edgeQ);   // wahre Schneide: EIN Faktor überall
  if(!sharp){popText('stumpf — Matte schwingt nur',TREFFM_BAD_CSS,0,0);arena.cooldown=0.3;return;}
  if(vLat<vAx*0.8){popText('zu flach — kein Schnitt',TREFFM_BAD_CSS,0,0);arena.cooldown=0.3;return;}
  if(edgeQ<0.45){popText('flach — die Schneide liegt quer',TREFFM_BAD_CSS,0,0);bladeRecoil(0.6);return;}
  if(KE<12){popText('zu schwach — Klinge prallt ab ('+KE.toFixed(0)+' J)',WARNM_CSS,0,0);bladeRecoil(0.55);return;}
  const cutDir=vel.clone().setY(0);if(cutDir.lengthSq()<1e-4)cutDir.set(0,0,1);cutDir.normalize();
  const ang=T.roll.rotation.z||0, ca=Math.max(0.25,Math.cos(ang));                                     // Rolle am KONTAKTPUNKT teilen
  const rTop=T.rollCenter.y+(T.rollLen*0.5)*ca, rBot=T.rollCenter.y-(T.rollLen*0.5)*ca;
  const cutY=clamp(best.pt.y,rBot+0.04,rTop-0.04), topLen=(rTop-cutY)/ca, botLen=T.rollLen-topLen;
  if(!arena.fallingBamboo)arena.fallingBamboo=[];
  if(T.roll&&T.roll.parent)T.roll.parent.remove(T.roll);T.roll=null;
  if(T.rope&&T.rope.parent)T.rope.parent.remove(T.rope);T.rope=null;
  if(botLen>0.04){const bx=T.rollCenter.x+Math.sin(ang)*(T.rollLen*0.5-botLen*0.5), by=cutY-(botLen*0.5)*ca;
    const bot=new THREE.Mesh(new THREE.CylinderGeometry(ROLLE_R,ROLLE_R,botLen,12),matCol(TATAMIM_ROLL,TATAMIM_ROLLR,0));bot.position.set(bx,by,T.rollCenter.z);bot.rotation.z=ang;arena.group.add(bot);
    arena.fallingBamboo.push({mesh:bot,vel:cutDir.clone().multiplyScalar(0.6+Math.min(2,KE*0.005)).add(new THREE.Vector3(0,0.15,0)),ang:new THREE.Vector3((Math.random()-0.5)*4,0,(Math.random()-0.5)*4),life:0});}
  if(topLen>0.30){T.rollLen=topLen;T.cut=false;spawnTatamiRoll();}                                      // oberes Stück bleibt am Seil → weiter schneidbar
  else{T.cut=true;T.respawnAt=clock.getElapsedTime()+2.2;T.rollLen=1.0;}
  fx.shake=Math.max(fx.shake,0.05);fx.freeze=Math.max(fx.freeze,0.05);
  popText('✁ DURCHTRENNT — '+KE.toFixed(0)+' J'+(topLen>0.30?' · weiter!':''),eff>0.7?GOLDM_CSS:WARNM_CSS,0,-0.04);arena.cooldown=0.22;return;}
function regrowTatami(){const T=arena.tatami;if(T&&T.cut&&T.respawnAt&&clock.getElapsedTime()>T.respawnAt&&!T.roll)spawnTatamiRoll();}
/* V18.491.301 — Lab carnival duck mesh ← ENTE_GESETZ fail-soft; Host none (ENTE_VIS). TREFF / KIRMES / VOR / REIHE / BUDE / LIFT untouched. */
const _ETG=(SC&&SC.ENTE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ENTE_GESETZ)||null;
const ENTE_BODYR=(_ETG&&Number.isFinite(_ETG.bodyR))?_ETG.bodyR:0.18;
const ENTE_SX=(_ETG&&Number.isFinite(_ETG.sx))?_ETG.sx:1.3;
const ENTE_SY=(_ETG&&Number.isFinite(_ETG.sy))?_ETG.sy:1.0;
const ENTE_SZ=(_ETG&&Number.isFinite(_ETG.sz))?_ETG.sz:0.6;
const ENTE_HEADR=(_ETG&&Number.isFinite(_ETG.headR))?_ETG.headR:0.1;
const ENTE_HEADX=(_ETG&&Number.isFinite(_ETG.headX))?_ETG.headX:0.17;
const ENTE_HEADY=(_ETG&&Number.isFinite(_ETG.headY))?_ETG.headY:0.15;
const ENTE_BEAKR=(_ETG&&Number.isFinite(_ETG.beakR))?_ETG.beakR:0.04;
const ENTE_BEAKH=(_ETG&&Number.isFinite(_ETG.beakH))?_ETG.beakH:0.1;
const ENTE_BEAKX=(_ETG&&Number.isFinite(_ETG.beakX))?_ETG.beakX:0.27;
const ENTE_BEAKY=(_ETG&&Number.isFinite(_ETG.beakY))?_ETG.beakY:0.15;
const ENTE_RINGN=(_ETG&&Number.isFinite(_ETG.ringN))?_ETG.ringN:3;
const ENTE_RINGR0=(_ETG&&Number.isFinite(_ETG.ringR0))?_ETG.ringR0:0.05;
const ENTE_RINGDR=(_ETG&&Number.isFinite(_ETG.ringDr))?_ETG.ringDr:0.045;
const ENTE_RINGT=(_ETG&&Number.isFinite(_ETG.ringT))?_ETG.ringT:0.014;
const ENTE_RINGX=(_ETG&&Number.isFinite(_ETG.ringX))?_ETG.ringX:-0.04;
const ENTE_RINGZ=(_ETG&&Number.isFinite(_ETG.ringZ))?_ETG.ringZ:0.33;
function buildDuck(){const g=new THREE.Group();
  /* V18.491.537 — Lab Kirmes-Ente Mats ← ENTEM_GESETZ fail-soft; Host none (ENTEM_VIS). TATAMIM/SCHAUKELM/ENTE geo/BUDE/ZIELP/TORII/LIFT untouched. */
  const _ETM=(SC&&SC.ENTEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ENTEM_GESETZ)||null;
  const ENTEM_BODY=(_ETM&&Number.isFinite(_ETM.body))?_ETM.body:0xd8553a;
  const ENTEM_BODYR=(_ETM&&Number.isFinite(_ETM.bodyR))?_ETM.bodyR:0.7;
  const ENTEM_BEAK=(_ETM&&Number.isFinite(_ETM.beak))?_ETM.beak:0xe0a020;
  const ENTEM_BEAKR=(_ETM&&Number.isFinite(_ETM.beakR))?_ETM.beakR:0.6;
  const ENTEM_RING0=(_ETM&&Number.isFinite(_ETM.ring0))?_ETM.ring0:0xffe07a;
  const ENTEM_RING1=(_ETM&&Number.isFinite(_ETM.ring1))?_ETM.ring1:0xffffff;
  const ENTEM_RING2=(_ETM&&Number.isFinite(_ETM.ring2))?_ETM.ring2:0xd8553a;
  const ENTEM_RINGR=(_ETM&&Number.isFinite(_ETM.ringR))?_ETM.ringR:0.5;
  const body=new THREE.Mesh(new THREE.SphereGeometry(ENTE_BODYR,12,10),matCol(ENTEM_BODY,ENTEM_BODYR,0));body.scale.set(ENTE_SX,ENTE_SY,ENTE_SZ);g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(ENTE_HEADR,10,8),matCol(ENTEM_BODY,ENTEM_BODYR,0));head.position.set(ENTE_HEADX,ENTE_HEADY,0);g.add(head);
  const beak=new THREE.Mesh(new THREE.ConeGeometry(ENTE_BEAKR,ENTE_BEAKH,6),matCol(ENTEM_BEAK,ENTEM_BEAKR,0));beak.rotation.z=-Math.PI/2;beak.position.set(ENTE_BEAKX,ENTE_BEAKY,0);g.add(beak);
  for(let i=0;i<ENTE_RINGN;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(ENTE_RINGR0+i*ENTE_RINGDR,ENTE_RINGT,6,16),matCol(i===0?ENTEM_RING0:i===1?ENTEM_RING1:ENTEM_RING2,ENTEM_RINGR,0));ring.position.set(ENTE_RINGX,0,ENTE_RINGZ);g.add(ring);}
  return g;}
/* V18.491.283 — Lab carnival ducks ← KIRMES_GESETZ fail-soft; Host none (KIRMES_VIS). GALGEN frame / TATAMI / LIFT untouched. */
const _KMG=(SC&&SC.KIRMES_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KIRMES_GESETZ)||null;
const KIRMES_AMP=(_KMG&&Number.isFinite(_KMG.amp))?_KMG.amp:2.7;
const KIRMES_W0=(_KMG&&Number.isFinite(_KMG.w0))?_KMG.w0:0.55;
const KIRMES_DW=(_KMG&&Number.isFinite(_KMG.dw))?_KMG.dw:0.18;
/* V18.491.297 — Lab carnival booth ← BUDE_GESETZ fail-soft; Host none (BUDE_VIS). KIRMES ducks / GALGEN / SCHWELLE / LIFT untouched. */
const _BUG=(SC&&SC.BUDE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BUDE_GESETZ)||null;
const BUDE_WALLW=(_BUG&&Number.isFinite(_BUG.wallW))?_BUG.wallW:0.3;
const BUDE_WALLH=(_BUG&&Number.isFinite(_BUG.wallH))?_BUG.wallH:2.4;
const BUDE_WALLL=(_BUG&&Number.isFinite(_BUG.wallL))?_BUG.wallL:7.2;
const BUDE_WALLX=(_BUG&&Number.isFinite(_BUG.wallX))?_BUG.wallX:0.25;
const BUDE_WALLY=(_BUG&&Number.isFinite(_BUG.wallY))?_BUG.wallY:1.2;
const BUDE_RAILYS_FB=[0.8,1.5,2.2];
const BUDE_RAILYS=(_BUG&&Array.isArray(_BUG.railYs)&&_BUG.railYs.length===3&&_BUG.railYs.every(function(y){return Number.isFinite(y);}))?_BUG.railYs.slice():BUDE_RAILYS_FB.slice();
const BUDE_RAILW=(_BUG&&Number.isFinite(_BUG.railW))?_BUG.railW:0.08;
const BUDE_RAILH=(_BUG&&Number.isFinite(_BUG.railH))?_BUG.railH:0.06;
const BUDE_RAILL=(_BUG&&Number.isFinite(_BUG.railL))?_BUG.railL:7.2;
const BUDE_TOPW=(_BUG&&Number.isFinite(_BUG.topW))?_BUG.topW:0.5;
const BUDE_TOPH=(_BUG&&Number.isFinite(_BUG.topH))?_BUG.topH:0.25;
const BUDE_TOPL=(_BUG&&Number.isFinite(_BUG.topL))?_BUG.topL:7.4;
const BUDE_TOPX=(_BUG&&Number.isFinite(_BUG.topX))?_BUG.topX:0.1;
const BUDE_TOPY=(_BUG&&Number.isFinite(_BUG.topY))?_BUG.topY:2.5;
/* V18.491.298 — Lab carnival duck rows ← REIHE_GESETZ fail-soft; Host none (REIHE_VIS). BUDE.railYs / KIRMES / LIFT untouched. */
const _RHG=(SC&&SC.REIHE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.REIHE_GESETZ)||null;
const REIHE_YS_FB=[0.85,1.5,2.15];
const REIHE_YS=(_RHG&&Array.isArray(_RHG.ys)&&_RHG.ys.length===3&&_RHG.ys.every(function(y){return Number.isFinite(y);}))?_RHG.ys.slice():REIHE_YS_FB.slice();
/* V18.491.299 — Lab carnival duck X ← VOR_GESETZ fail-soft; Host none (VOR_VIS). REIHE / BUDE / KIRMES / LIFT untouched. */
const _VRG=(SC&&SC.VOR_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.VOR_GESETZ)||null;
const VOR_X=(_VRG&&Number.isFinite(_VRG.x))?_VRG.x:-0.1;
/* V18.491.300 — Lab carnival hit hull ← TREFF_GESETZ fail-soft; Host none (TREFF_VIS). VOR / BUDE / HULL / KIRMES / LIFT untouched. */
const _TFG=(SC&&SC.TREFF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TREFF_GESETZ)||null;
const TREFF_XNEG=(_TFG&&Number.isFinite(_TFG.xNeg))?_TFG.xNeg:0.22;
const TREFF_XPOS=(_TFG&&Number.isFinite(_TFG.xPos))?_TFG.xPos:0.3;
const TREFF_ZHALF=(_TFG&&Number.isFinite(_TFG.zHalf))?_TFG.zHalf:0.28;
const TREFF_YHALF=(_TFG&&Number.isFinite(_TFG.yHalf))?_TFG.yHalf:0.26;
function buildCarnival(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.538 — Lab Kirmes-Bude Mats ← BUDEM_GESETZ fail-soft; Host none (BUDEM_VIS). ENTEM/BUDE geo/KIRMES/ZIELP/TORII/LIFT untouched. */
  const _BDM=(SC&&SC.BUDEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BUDEM_GESETZ)||null;
  const BUDEM_WALL=(_BDM&&Number.isFinite(_BDM.wall))?_BDM.wall:0x2c2438;
  const BUDEM_WALLR=(_BDM&&Number.isFinite(_BDM.wallR))?_BDM.wallR:0.92;
  const BUDEM_RAIL=(_BDM&&Number.isFinite(_BDM.rail))?_BDM.rail:0x4a4458;
  const BUDEM_RAILR=(_BDM&&Number.isFinite(_BDM.railR))?_BDM.railR:0.6;
  const BUDEM_TOP=(_BDM&&Number.isFinite(_BDM.top))?_BDM.top:0x8a3050;
  const BUDEM_TOPR=(_BDM&&Number.isFinite(_BDM.topR))?_BDM.topR:0.7;
  const wall=new THREE.Mesh(new THREE.BoxGeometry(BUDE_WALLW,BUDE_WALLH,BUDE_WALLL),matCol(BUDEM_WALL,BUDEM_WALLR,0));wall.position.set(BUDE_WALLX,BUDE_WALLY,0);g.add(wall);
  for(const yy of BUDE_RAILYS){const rail=new THREE.Mesh(new THREE.BoxGeometry(BUDE_RAILW,BUDE_RAILH,BUDE_RAILL),matCol(BUDEM_RAIL,BUDEM_RAILR,0));rail.position.set(0,yy,0);g.add(rail);}
  const top=new THREE.Mesh(new THREE.BoxGeometry(BUDE_TOPW,BUDE_TOPH,BUDE_TOPL),matCol(BUDEM_TOP,BUDEM_TOPR,0));top.position.set(BUDE_TOPX,BUDE_TOPY,0);g.add(top);
  arena.movers=[];const yrows=REIHE_YS;
  for(let i=0;i<3;i++){const duck=buildDuck();const yy=yrows[i];duck.position.set(VOR_X,yy,0);g.add(duck);
    arena.movers.push({mesh:duck,grp:g,baseX:pos.x+VOR_X,baseY:pos.y+yy,z0:pos.z,amp:KIRMES_AMP,w:KIRMES_W0+i*KIRMES_DW,phase:i*2.0,worldZ:pos.z,hit:false,hitAt:0});}
  return g;}
function carnivalUpdate(t){if(!arena.movers)return;
  for(const mv of arena.movers){if(mv.hit){const dt2=t-mv.hitAt;if(dt2>2.8){mv.hit=false;mv.mesh.rotation.set(0,0,0);}else{mv.mesh.rotation.x=Math.min(1.5,dt2*6);}continue;}
    const wz=mv.z0+mv.amp*Math.sin(mv.w*t+mv.phase);mv.mesh.position.z=wz-mv.grp.position.z;mv.worldZ=wz;}}
function hitMover(a){if(!arena.movers)return false;const t=clock.getElapsedTime();
  for(const mv of arena.movers){if(mv.hit)continue;
    if(a.pos.x>=mv.baseX-TREFF_XNEG&&a.pos.x<mv.baseX+TREFF_XPOS&&Math.abs(a.pos.z-mv.worldZ)<TREFF_ZHALF&&Math.abs(a.pos.y-mv.baseY)<TREFF_YHALF){
      mv.hit=true;mv.hitAt=t;fx.shake+=0.06;arena.score.shots++;arena.score.sum+=10;arena.score.last={ring:10,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};
      popText('ENTE GETROFFEN!',GOLDM_CSS,0,0);popText('+10',TREFFM_OK_CSS,0.12,0.06);stickArrow(a);updateHUD();return true;}}
  return false;}
function regrowBamboo(){if(!arena.bamboo)return;const t=clock.getElapsedTime();
  for(const b of arena.bamboo){if(b.cut===true&&b.respawnAt&&t>b.respawnAt){
    if(b.mesh&&b.mesh.parent)b.mesh.parent.remove(b.mesh);
    const pole=makeBamboo(b.h);pole.position.set(b.wx,b.baseY,b.wz);arena.group.add(pole);b.mesh=pole;b.cut=false;b.respawnAt=0;}}}
function scoreArrowOn(a,T,r){const R=T.R;let ring=0;if(r<=R)ring=clamp(Math.ceil(10*(1-r/R)),1,10);const pen=a.KE*0.18;
  const dist=Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z);arena.score.shots++;arena.score.sum+=ring;arena.score.last={ring,pen,v0:a.v0,KE:a.KE,dist};
  if(ring>0){fx.shake+=0.04;popText(ring+'! · '+dist.toFixed(0)+' m',ring>=9?GOLDM_CSS:ring>=6?NEUTM_CSS:TREFFM_BAD_CSS,0,0);if(ring>=10)popText('GOLD!',GOLDM_CSS,0.14,0.06);}else popText('Scheibe verfehlt',MISSM_CSS,0,0);
  stickArrow(a);updateHUD();}

function orientToNormal(z,x){z=z.clone().normalize();let xx=x.clone().sub(z.clone().multiplyScalar(x.dot(z)));
  if(xx.lengthSq()<1e-6){xx=new THREE.Vector3(0,1,0).sub(z.clone().multiplyScalar(z.y));if(xx.lengthSq()<1e-6)xx=new THREE.Vector3(1,0,0);}
  xx.normalize();const yy=z.clone().cross(xx).normalize();return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx,yy,z));}
/* V18.491.463 — Lab Dummy-Narben STICH/SCHLAG ← NARB_GESETZ fail-soft; Host none (NARB_VIS). FACEX/SCHNITT/TUPF/LIFT untouched; Schnitt-plane + scar lift left bare. */
const _NAR=(SC&&SC.NARB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NARB_GESETZ)||null;
const NARB_STICH=(_NAR&&Number.isFinite(_NAR.stich))?_NAR.stich:0.022;
const NARB_SCHLAG=(_NAR&&Number.isFinite(_NAR.schlag))?_NAR.schlag:0.058;
/* V18.491.464 — Lab Dummy-Schnitt-Schramme ← SCHRAMM_GESETZ fail-soft; Host none (SCHRAMM_VIS). NARB/SCHNITT/FACEX/TUPF/LIFT untouched; scar lift left bare. */
const _SRM=(SC&&SC.SCHRAMM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHRAMM_GESETZ)||null;
const SCHRAMM_W=(_SRM&&Number.isFinite(_SRM.W))?_SRM.W:0.15;
const SCHRAMM_H=(_SRM&&Number.isFinite(_SRM.H))?_SRM.H:0.014;
/* V18.491.465 — Lab Dummy-Narben Normal-Lift ← NARBZ_GESETZ fail-soft; Host none (NARBZ_VIS). SCHRAMM/NARB/FACEX/LIFT untouched. */
const _NRZ=(SC&&SC.NARBZ_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NARBZ_GESETZ)||null;
const NARBZ_N=(_NRZ&&Number.isFinite(_NRZ.n))?_NRZ.n:0.006;
/* V18.491.466 — Lab Dummy-Narben Cap ← NARBC_GESETZ fail-soft; Host none (NARBC_VIS). NARBZ/NARB/TUPF/LIFT untouched; recoilKeMul left bare. */
const _NBC=(SC&&SC.NARBC_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NARBC_GESETZ)||null;
const NARBC_MAX=(_NBC&&Number.isFinite(_NBC.max))?_NBC.max:30;
function addDummyScar(point,normal,cutDir,hit){if(!arena.dummy||!point)return;arena.scars=arena.scars||[];
  /* V18.491.554 — Lab Narben/Scar Mats ← NARBM_GESETZ fail-soft; Host none (NARBM_VIS). DOJOM/NARB geo/SCHRAMM/LIFT untouched. */
  const _NBM=(SC&&SC.NARBM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NARBM_GESETZ)||null;
  const NARBM_STICH=(_NBM&&Number.isFinite(_NBM.stich))?_NBM.stich:0x100704;
  const NARBM_STICHR=(_NBM&&Number.isFinite(_NBM.stichR))?_NBM.stichR:0.45;
  const NARBM_SCHLAG=(_NBM&&Number.isFinite(_NBM.schlag))?_NBM.schlag:0x351d12;
  const NARBM_SCHLAGR=(_NBM&&Number.isFinite(_NBM.schlagR))?_NBM.schlagR:0.4;
  const NARBM_SCHNITT=(_NBM&&Number.isFinite(_NBM.schnitt))?_NBM.schnitt:0x0e0604;
  const NARBM_SCHNITTR=(_NBM&&Number.isFinite(_NBM.schnittR))?_NBM.schnittR:0.5;
  const NARBM_DIRTY=(_NBM&&Number.isFinite(_NBM.dirty))?_NBM.dirty:0x281610;
  const NARBM_DIRTYR=(_NBM&&Number.isFinite(_NBM.dirtyR))?_NBM.dirtyR:0.5;
  arena.dummy.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(arena.dummy.matrixWorld).invert();
  const lp=point.clone().applyMatrix4(inv), ln=normal.clone().transformDirection(inv).normalize(), ld=cutDir.clone().transformDirection(inv).normalize();
  const art=hit?hit.art:'SCHNITT', clean=hit?hit.clean:true; let mesh;
  if(art==='STICH'){mesh=new THREE.Mesh(new THREE.CircleGeometry(NARB_STICH,8),matCol(NARBM_STICH,NARBM_STICHR,0));}
  else if(art==='SCHLAG'){mesh=new THREE.Mesh(new THREE.CircleGeometry(NARB_SCHLAG,12),matCol(NARBM_SCHLAG,NARBM_SCHLAGR,0));}
  else{mesh=new THREE.Mesh(new THREE.PlaneGeometry(SCHRAMM_W,SCHRAMM_H),matCol(clean?NARBM_SCHNITT:NARBM_DIRTY,clean?NARBM_SCHNITTR:NARBM_DIRTYR,0));}              // Schnitt: Strich entlang Klingenbahn
  mesh.quaternion.copy(orientToNormal(ln,ld));mesh.position.copy(lp).addScaledVector(ln,NARBZ_N);
  arena.dummy.add(mesh);arena.scars.push(mesh);
  if(arena.scars.length>NARBC_MAX){const o=arena.scars.shift();if(o.parent)o.parent.remove(o);}}
/* V18.491.284 — Lab cutting lane ← SCHNITT_GESETZ fail-soft; Host none (SCHNITT_VIS). GASSE gauntlet / BAMBUS stand / LIFT untouched. */
const _SNG=(SC&&SC.SCHNITT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHNITT_GESETZ)||null;
const SCHNITT_N=(_SNG&&Number.isFinite(_SNG.N))?_SNG.N:7;
const SCHNITT_SPAN=(_SNG&&Number.isFinite(_SNG.span))?_SNG.span:4.4;
const SCHNITT_H0=(_SNG&&Number.isFinite(_SNG.h0))?_SNG.h0:1.25;
const SCHNITT_DH=(_SNG&&Number.isFinite(_SNG.dh))?_SNG.dh:0.55;
/* V18.491.296 — Lab cutting-lane base ← SCHWELLE_GESETZ fail-soft; Host none (SCHWELLE_VIS). SOCKEL / SCHNITT / FASSUNG / LIFT untouched. */
const _SWG=(SC&&SC.SCHWELLE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHWELLE_GESETZ)||null;
const SCHWELLE_W=(_SWG&&Number.isFinite(_SWG.W))?_SWG.W:0.5;
const SCHWELLE_H=(_SWG&&Number.isFinite(_SWG.H))?_SWG.H:0.16;
const SCHWELLE_L=(_SWG&&Number.isFinite(_SWG.L))?_SWG.L:4.6;
const SCHWELLE_Y=(_SWG&&Number.isFinite(_SWG.y))?_SWG.y:0.08;
function buildCuttingLane(pos){const g=new THREE.Group();const PX=pos.x,PZ=pos.z;
  /* V18.491.541 — Lab Schnittgasse-Schwelle Mats ← SCHWELLEM_GESETZ fail-soft; Host none (SCHWELLEM_VIS). TORIIM/ZIELPM/SOCKELM/SCHWELLE geo/PERGOLA/LIFT untouched. */
  const _SWLM=(SC&&SC.SCHWELLEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHWELLEM_GESETZ)||null;
  const SCHWELLEM_BASE=(_SWLM&&Number.isFinite(_SWLM.base))?_SWLM.base:0x3a2a1a;
  const SCHWELLEM_BASER=(_SWLM&&Number.isFinite(_SWLM.baseR))?_SWLM.baseR:0.9;
  const SCHWELLEM_HOLDER=(_SWLM&&Number.isFinite(_SWLM.holder))?_SWLM.holder:0x2a2018;
  const SCHWELLEM_HOLDERR=(_SWLM&&Number.isFinite(_SWLM.holderR))?_SWLM.holderR:0.9;
  const base=new THREE.Mesh(new THREE.BoxGeometry(SCHWELLE_W,SCHWELLE_H,SCHWELLE_L),matCol(SCHWELLEM_BASE,SCHWELLEM_BASER,0));base.position.set(PX,SCHWELLE_Y,PZ);g.add(base);
  const N=SCHNITT_N;for(let i=0;i<N;i++){const z=PZ-SCHNITT_SPAN/2+i*(SCHNITT_SPAN/(N-1)), h=SCHNITT_H0+(i%2)*SCHNITT_DH;                                    // Zickzack-Höhen
    const holder=new THREE.Mesh(new THREE.CylinderGeometry(FASSUNG_RTOP,FASSUNG_RBOT,FASSUNG_H,FASSUNG_SEGS),matCol(SCHWELLEM_HOLDER,SCHWELLEM_HOLDERR,0));holder.position.set(PX,FASSUNG_Y,z);g.add(holder);
    const pole=makeBamboo(h);pole.position.set(PX,SCHWELLE_Y+SCHWELLE_H/2,z);g.add(pole);   // V18.491.609 wire: Halm steht auf Schwellen-Oberkante ← SCHWELLE_GESETZ y+H/2 (no bump; ≠ SOCKEL_H coincidence)
    arena.bamboo.push({mesh:pole,wx:PX,wz:z,baseY:0.16,h,cut:false,wobble:0,lane:true});}
  return g;}
/* V18.491.256 — Lab Torii gate ← TORII_GESETZ fail-soft; Host none (TORII_VIS). ≠ HEBE/BANK/PENDEL; LIFT untouched. */
const _TRG=(SC&&SC.TORII_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TORII_GESETZ)||null;
const TORII_H=(_TRG&&Number.isFinite(_TRG.H))?_TRG.H:3.6;
const TORII_W=(_TRG&&Number.isFinite(_TRG.W))?_TRG.W:3.0;
/* V18.491.309 — Lab Torii lintels ← BALKEN_GESETZ fail-soft; Host none (BALKEN_VIS). TORII H/W / posts/feet / LIFT untouched. */
const _BALG=(SC&&SC.BALKEN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BALKEN_GESETZ)||null;
const BALKEN_KASW=(_BALG&&Number.isFinite(_BALG.kasW))?_BALG.kasW:0.4;
const BALKEN_KASH=(_BALG&&Number.isFinite(_BALG.kasH))?_BALG.kasH:0.2;
const BALKEN_KASDL=(_BALG&&Number.isFinite(_BALG.kasDL))?_BALG.kasDL:1.3;
const BALKEN_KASY=(_BALG&&Number.isFinite(_BALG.kasY))?_BALG.kasY:0.16;
const BALKEN_KASROT=(_BALG&&Number.isFinite(_BALG.kasRot))?_BALG.kasRot:0.03;
const BALKEN_SHIW=(_BALG&&Number.isFinite(_BALG.shiW))?_BALG.shiW:0.32;
const BALKEN_SHIH=(_BALG&&Number.isFinite(_BALG.shiH))?_BALG.shiH:0.14;
const BALKEN_SHIDL=(_BALG&&Number.isFinite(_BALG.shiDL))?_BALG.shiDL:0.9;
const BALKEN_SHIY=(_BALG&&Number.isFinite(_BALG.shiY))?_BALG.shiY:-0.02;
const BALKEN_NUKW=(_BALG&&Number.isFinite(_BALG.nukW))?_BALG.nukW:0.24;
const BALKEN_NUKH=(_BALG&&Number.isFinite(_BALG.nukH))?_BALG.nukH:0.18;
const BALKEN_NUKDL=(_BALG&&Number.isFinite(_BALG.nukDL))?_BALG.nukDL:0.2;
const BALKEN_NUKY=(_BALG&&Number.isFinite(_BALG.nukY))?_BALG.nukY:-0.7;
const BALKEN_GAKW=(_BALG&&Number.isFinite(_BALG.gakW))?_BALG.gakW:0.06;
const BALKEN_GAKH=(_BALG&&Number.isFinite(_BALG.gakH))?_BALG.gakH:0.5;
const BALKEN_GAKD=(_BALG&&Number.isFinite(_BALG.gakD))?_BALG.gakD:0.34;
const BALKEN_GAKY=(_BALG&&Number.isFinite(_BALG.gakY))?_BALG.gakY:-0.38;
/* V18.491.310 — Lab Torii posts + feet ← PFOSTEN_GESETZ fail-soft; Host none (PFOSTEN_VIS). TORII H/W / BALKEN / LIFT untouched. */
const _PFOG=(SC&&SC.PFOSTEN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PFOSTEN_GESETZ)||null;
const PFOSTEN_POSTR0=(_PFOG&&Number.isFinite(_PFOG.postR0))?_PFOG.postR0:0.13;
const PFOSTEN_POSTR1=(_PFOG&&Number.isFinite(_PFOG.postR1))?_PFOG.postR1:0.17;
const PFOSTEN_FOOTR0=(_PFOG&&Number.isFinite(_PFOG.footR0))?_PFOG.footR0:0.22;
const PFOSTEN_FOOTR1=(_PFOG&&Number.isFinite(_PFOG.footR1))?_PFOG.footR1:0.26;
const PFOSTEN_FOOTH=(_PFOG&&Number.isFinite(_PFOG.footH))?_PFOG.footH:0.18;
const PFOSTEN_FOOTY=(_PFOG&&Number.isFinite(_PFOG.footY))?_PFOG.footY:0.09;
function buildTorii(x,z){const g=new THREE.Group();
  /* V18.491.540 — Lab Torii Mats ← TORIIM_GESETZ fail-soft; Host none (TORIIM_VIS). ZIELPM/BUDEM/SCHILDM/TORII geo/SCHWELLE/LIFT untouched. */
  const _TIM=(SC&&SC.TORIIM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TORIIM_GESETZ)||null;
  const TORIIM_RED=(_TIM&&Number.isFinite(_TIM.red))?_TIM.red:0x8a3a28;
  const TORIIM_REDR=(_TIM&&Number.isFinite(_TIM.redR))?_TIM.redR:0.82;
  const TORIIM_DARK=(_TIM&&Number.isFinite(_TIM.dark))?_TIM.dark:0x241410;
  const TORIIM_DARKR=(_TIM&&Number.isFinite(_TIM.darkR))?_TIM.darkR:0.9;
  const red=matCol(TORIIM_RED,TORIIM_REDR,0),dark=matCol(TORIIM_DARK,TORIIM_DARKR,0);const H=TORII_H,W=TORII_W;
  for(const sz of [-W/2,W/2]){const post=new THREE.Mesh(new THREE.CylinderGeometry(PFOSTEN_POSTR0,PFOSTEN_POSTR1,H,12),red);post.position.set(x,H/2,z+sz);g.add(post);
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(PFOSTEN_FOOTR0,PFOSTEN_FOOTR1,PFOSTEN_FOOTH,12),dark);foot.position.set(x,PFOSTEN_FOOTY,z+sz);g.add(foot);}
  const kasagi=new THREE.Mesh(new THREE.BoxGeometry(BALKEN_KASW,BALKEN_KASH,W+BALKEN_KASDL,1,1,1),dark);kasagi.position.set(x,H+BALKEN_KASY,z);kasagi.rotation.x=BALKEN_KASROT;g.add(kasagi);
  const shimagi=new THREE.Mesh(new THREE.BoxGeometry(BALKEN_SHIW,BALKEN_SHIH,W+BALKEN_SHIDL),red);shimagi.position.set(x,H+BALKEN_SHIY,z);g.add(shimagi);
  const nuki=new THREE.Mesh(new THREE.BoxGeometry(BALKEN_NUKW,BALKEN_NUKH,W+BALKEN_NUKDL),red);nuki.position.set(x,H+BALKEN_NUKY,z);g.add(nuki);
  const gaku=new THREE.Mesh(new THREE.BoxGeometry(BALKEN_GAKW,BALKEN_GAKH,BALKEN_GAKD),dark);gaku.position.set(x,H+BALKEN_GAKY,z);g.add(gaku);
  return g;}
/* V18.491.257 — Lab Pergola height ← PERGOLA_GESETZ fail-soft; Host none (PERGOLA_VIS). ≠ TORII.H; LIFT untouched. */
const _PRG=(SC&&SC.PERGOLA_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PERGOLA_GESETZ)||null;
const PERGOLA_H=(_PRG&&Number.isFinite(_PRG.H))?_PRG.H:3.3;
/* V18.491.311 — Lab Pergola posts + braces ← STUTZE_GESETZ fail-soft; Host none (STUTZE_VIS). PERGOLA.H / PFOSTEN / TORII / LIFT untouched. */
const _STUG=(SC&&SC.STUTZE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STUTZE_GESETZ)||null;
const STUTZE_POSTR0=(_STUG&&Number.isFinite(_STUG.postR0))?_STUG.postR0:0.09;
const STUTZE_POSTR1=(_STUG&&Number.isFinite(_STUG.postR1))?_STUG.postR1:0.12;
const STUTZE_BRACEW=(_STUG&&Number.isFinite(_STUG.braceW))?_STUG.braceW:0.45;
const STUTZE_BRACEH=(_STUG&&Number.isFinite(_STUG.braceH))?_STUG.braceH:0.45;
const STUTZE_BRACED=(_STUG&&Number.isFinite(_STUG.braceD))?_STUG.braceD:0.08;
const STUTZE_BRACEOFF=(_STUG&&Number.isFinite(_STUG.braceOff))?_STUG.braceOff:0.3;
const STUTZE_BRACEYOFF=(_STUG&&Number.isFinite(_STUG.braceYOff))?_STUG.braceYOff:0.45;
/* V18.491.312 — Lab Pergola edge beams ← RAND_GESETZ fail-soft; Host none (RAND_VIS). STUTZE/PERGOLA/DOJO 0.15×0.16 / LIFT untouched. */
const _RDG=(SC&&SC.RAND_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RAND_GESETZ)||null;
const RAND_EXTRA=(_RDG&&Number.isFinite(_RDG.extra))?_RDG.extra:0.4;
const RAND_BEAMH=(_RDG&&Number.isFinite(_RDG.beamH))?_RDG.beamH:0.15;
const RAND_BEAMT=(_RDG&&Number.isFinite(_RDG.beamT))?_RDG.beamT:0.16;
/* V18.491.313 — Lab Pergola rafters ← SPARREN_GESETZ fail-soft; Host none (SPARREN_VIS). RAND/STUTZE/BOCK.halfX/LIFT untouched. */
const _SPRG=(SC&&SC.SPARREN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPARREN_GESETZ)||null;
const SPARREN_STEP=(_SPRG&&Number.isFinite(_SPRG.step))?_SPRG.step:0.75;
const SPARREN_MINN=(_SPRG&&Number.isFinite(_SPRG.minN))?_SPRG.minN:4;
const SPARREN_EXTRA=(_SPRG&&Number.isFinite(_SPRG.extra))?_SPRG.extra:0.2;
const SPARREN_H=(_SPRG&&Number.isFinite(_SPRG.h))?_SPRG.h:0.05;
const SPARREN_T=(_SPRG&&Number.isFinite(_SPRG.t))?_SPRG.t:0.06;
const SPARREN_YOFF=(_SPRG&&Number.isFinite(_SPRG.yOff))?_SPRG.yOff:0.1;
/* V18.491.314 — Lab Pergola paper lanterns ← LEUCHTE_GESETZ fail-soft; Host none (LEUCHTE_VIS). LATERNE/SPARREN/RAND/STUTZE/LIFT untouched. */
const _LEUG=(SC&&SC.LEUCHTE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LEUCHTE_GESETZ)||null;
const LEUCHTE_R=(_LEUG&&Number.isFinite(_LEUG.R))?_LEUG.R:0.11;
const LEUCHTE_H=(_LEUG&&Number.isFinite(_LEUG.H))?_LEUG.H:0.24;
const LEUCHTE_OFF=(_LEUG&&Number.isFinite(_LEUG.off))?_LEUG.off:0.35;
const LEUCHTE_YOFF=(_LEUG&&Number.isFinite(_LEUG.yOff))?_LEUG.yOff:0.5;
const LEUCHTE_CAPR0=(_LEUG&&Number.isFinite(_LEUG.capR0))?_LEUG.capR0:0.04;
const LEUCHTE_CAPR1=(_LEUG&&Number.isFinite(_LEUG.capR1))?_LEUG.capR1:0.12;
const LEUCHTE_CAPH=(_LEUG&&Number.isFinite(_LEUG.capH))?_LEUG.capH:0.05;
const LEUCHTE_CAPYOFF=(_LEUG&&Number.isFinite(_LEUG.capYOff))?_LEUG.capYOff:0.36;
function buildPergola(cx,cz,hw,hd){const g=new THREE.Group();
  /* V18.491.542 — Lab Pergola Mats ← PERGOLAM_GESETZ fail-soft; Host none (PERGOLAM_VIS). SCHWELLEM/TORIIM/TATAMIM/PERGOLA geo/LIFT untouched. */
  const _PGM=(SC&&SC.PERGOLAM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PERGOLAM_GESETZ)||null;
  const PERGOLAM_WOOD=(_PGM&&Number.isFinite(_PGM.wood))?_PGM.wood:0x4a3522;
  const PERGOLAM_WOODR=(_PGM&&Number.isFinite(_PGM.woodR))?_PGM.woodR:0.9;
  const PERGOLAM_DARK=(_PGM&&Number.isFinite(_PGM.dark))?_PGM.dark:0x33251a;
  const PERGOLAM_DARKR=(_PGM&&Number.isFinite(_PGM.darkR))?_PGM.darkR:0.92;
  const PERGOLAM_PAPER=(_PGM&&Number.isFinite(_PGM.paper))?_PGM.paper:0xd6c596;
  const PERGOLAM_PAPERR=(_PGM&&Number.isFinite(_PGM.paperR))?_PGM.paperR:0.5;
  const wood=matCol(PERGOLAM_WOOD,PERGOLAM_WOODR,0),dark=matCol(PERGOLAM_DARK,PERGOLAM_DARKR,0),paper=matCol(PERGOLAM_PAPER,PERGOLAM_PAPERR,0);const H=PERGOLA_H;
  for(const [px,pz] of [[cx-hw,cz-hd],[cx+hw,cz-hd],[cx-hw,cz+hd],[cx+hw,cz+hd]]){
    const post=new THREE.Mesh(new THREE.CylinderGeometry(STUTZE_POSTR0,STUTZE_POSTR1,H,10),wood);post.position.set(px,H/2,pz);post.castShadow=true;g.add(post);
    const brace=new THREE.Mesh(new THREE.BoxGeometry(STUTZE_BRACEW,STUTZE_BRACEH,STUTZE_BRACED),dark);brace.position.set(px+(px<cx?STUTZE_BRACEOFF:-STUTZE_BRACEOFF),H-STUTZE_BRACEYOFF,pz);g.add(brace);}
  for(const pz of [cz-hd,cz+hd]){const b=new THREE.Mesh(new THREE.BoxGeometry(hw*2+RAND_EXTRA,RAND_BEAMH,RAND_BEAMT),dark);b.position.set(cx,H,pz);g.add(b);}
  for(const px of [cx-hw,cx+hw]){const b=new THREE.Mesh(new THREE.BoxGeometry(RAND_BEAMT,RAND_BEAMH,hd*2+RAND_EXTRA),dark);b.position.set(px,H,cz);g.add(b);}
  const n=Math.max(SPARREN_MINN,Math.round(hd*2/SPARREN_STEP));for(let i=0;i<=n;i++){const pz=cz-hd+i*hd*2/n;const r=new THREE.Mesh(new THREE.BoxGeometry(hw*2+SPARREN_EXTRA,SPARREN_H,SPARREN_T),wood);r.position.set(cx,H+SPARREN_YOFF,pz);g.add(r);}
  for(const [lx,lz] of [[cx-hw+LEUCHTE_OFF,cz-hd+LEUCHTE_OFF],[cx+hw-LEUCHTE_OFF,cz+hd-LEUCHTE_OFF]]){const lan=new THREE.Mesh(new THREE.CylinderGeometry(LEUCHTE_R,LEUCHTE_R,LEUCHTE_H,12),paper);lan.position.set(lx,H-LEUCHTE_YOFF,lz);g.add(lan);const cap=new THREE.Mesh(new THREE.CylinderGeometry(LEUCHTE_CAPR0,LEUCHTE_CAPR1,LEUCHTE_CAPH,12),dark);cap.position.set(lx,H-LEUCHTE_CAPYOFF,lz);g.add(cap);}
  return g;}
/* V18.491.260 — Lab banner pole height ← BANNER_GESETZ fail-soft; Host none (BANNER_VIS). ≠ PERGOLA/TORII; LIFT untouched. */
const _BNG=(SC&&SC.BANNER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BANNER_GESETZ)||null;
const BANNER_H=(_BNG&&Number.isFinite(_BNG.H))?_BNG.H:4.4;
/* V18.491.315 — Lab banner mast mesh ← FAHNE_GESETZ fail-soft; Host none (FAHNE_VIS). BANNER.H / other 0.05/0.07 sites / LIFT untouched. */
const _FHNG=(SC&&SC.FAHNE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FAHNE_GESETZ)||null;
const FAHNE_POLER0=(_FHNG&&Number.isFinite(_FHNG.poleR0))?_FHNG.poleR0:0.05;
const FAHNE_POLER1=(_FHNG&&Number.isFinite(_FHNG.poleR1))?_FHNG.poleR1:0.07;
const FAHNE_FINR=(_FHNG&&Number.isFinite(_FHNG.finR))?_FHNG.finR:0.08;
const FAHNE_ARMW=(_FHNG&&Number.isFinite(_FHNG.armW))?_FHNG.armW:0.04;
const FAHNE_ARMH=(_FHNG&&Number.isFinite(_FHNG.armH))?_FHNG.armH:0.04;
const FAHNE_ARML=(_FHNG&&Number.isFinite(_FHNG.armL))?_FHNG.armL:0.72;
const FAHNE_ARMYOFF=(_FHNG&&Number.isFinite(_FHNG.armYOff))?_FHNG.armYOff:0.25;
const FAHNE_ARMZ=(_FHNG&&Number.isFinite(_FHNG.armZ))?_FHNG.armZ:0.36;
const FAHNE_CLOTHW=(_FHNG&&Number.isFinite(_FHNG.clothW))?_FHNG.clothW:0.62;
const FAHNE_CLOTHH=(_FHNG&&Number.isFinite(_FHNG.clothH))?_FHNG.clothH:1.5;
const FAHNE_CLOTHYOFF=(_FHNG&&Number.isFinite(_FHNG.clothYOff))?_FHNG.clothYOff:1.0;
const FAHNE_CLOTHZ=(_FHNG&&Number.isFinite(_FHNG.clothZ))?_FHNG.clothZ:0.68;
const FAHNE_TIPR=(_FHNG&&Number.isFinite(_FHNG.tipR))?_FHNG.tipR:0.31;
const FAHNE_TIPH=(_FHNG&&Number.isFinite(_FHNG.tipH))?_FHNG.tipH:0.22;
const FAHNE_TIPYOFF=(_FHNG&&Number.isFinite(_FHNG.tipYOff))?_FHNG.tipYOff:1.86;
function buildBannerPole(x,z,col){const g=new THREE.Group();
  /* V18.491.543 — Lab Banner-Fahne Mats ← FAHNEM_GESETZ fail-soft; Host none (FAHNEM_VIS). PERGOLAM/TUCHM/BANNER/FAHNE geo/CLOUTM/LIFT untouched; cloth hex stays caller col. */
  const _FHM=(SC&&SC.FAHNEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FAHNEM_GESETZ)||null;
  const FAHNEM_DARK=(_FHM&&Number.isFinite(_FHM.dark))?_FHM.dark:0x2a1d12;
  const FAHNEM_DARKR=(_FHM&&Number.isFinite(_FHM.darkR))?_FHM.darkR:0.9;
  const FAHNEM_FIN=(_FHM&&Number.isFinite(_FHM.fin))?_FHM.fin:0xc8a44a;
  const FAHNEM_FINR=(_FHM&&Number.isFinite(_FHM.finR))?_FHM.finR:1.0;
  const FAHNEM_CLOTHR=(_FHM&&Number.isFinite(_FHM.clothR))?_FHM.clothR:0.5;
  const dark=matCol(FAHNEM_DARK,FAHNEM_DARKR,0);const H=BANNER_H;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(FAHNE_POLER0,FAHNE_POLER1,H,8),dark);pole.position.set(x,H/2,z);pole.castShadow=true;g.add(pole);
  const fin=new THREE.Mesh(new THREE.SphereGeometry(FAHNE_FINR,8,6),matCol(FAHNEM_FIN,FAHNEM_FINR,0));fin.position.set(x,H,z);g.add(fin);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(FAHNE_ARMW,FAHNE_ARMH,FAHNE_ARML),dark);arm.position.set(x,H-FAHNE_ARMYOFF,z+FAHNE_ARMZ);g.add(arm);
  const ban=new THREE.Mesh(new THREE.PlaneGeometry(FAHNE_CLOTHW,FAHNE_CLOTHH),matCol(col,FAHNEM_CLOTHR,0));ban.position.set(x,H-FAHNE_CLOTHYOFF,z+FAHNE_CLOTHZ);ban.rotation.y=Math.PI/2;ban.material.side=2;g.add(ban);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(FAHNE_TIPR,FAHNE_TIPH,3),matCol(col,FAHNEM_CLOTHR,0));tip.position.set(x,H-FAHNE_TIPYOFF,z+FAHNE_CLOTHZ);tip.rotation.x=Math.PI;tip.rotation.y=Math.PI/2;tip.material.side=2;g.add(tip);
  return g;}
/* V18.491.266 — Lab hay bale ← HEU_GESETZ fail-soft; Host none (HEU_VIS). ≠ CLOUT; LIFT untouched. */
const _HEU=(SC&&SC.HEU_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HEU_GESETZ)||null;
const HEU_R=(_HEU&&Number.isFinite(_HEU.r))?_HEU.r:0.42;
const HEU_LEN=(_HEU&&Number.isFinite(_HEU.len))?_HEU.len:0.78;
const HEU_BANDR=(_HEU&&Number.isFinite(_HEU.bandR))?_HEU.bandR:0.43;
const HEU_BANDTUBE=(_HEU&&Number.isFinite(_HEU.bandTube))?_HEU.bandTube:0.018;
const HEU_BANDOFF=(_HEU&&Number.isFinite(_HEU.bandOff))?_HEU.bandOff:0.2;
function buildHayBale(x,z,rot){const g=new THREE.Group();
  /* V18.491.544 — Lab Heu-Ballen Mats ← HEUM_GESETZ fail-soft; Host none (HEUM_VIS). FAHNEM/PELLM/HEU geo/LATERNE/KOHLE/LIFT untouched. */
  const _HYM=(SC&&SC.HEUM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HEUM_GESETZ)||null;
  const HEUM_HAY=(_HYM&&Number.isFinite(_HYM.hay))?_HYM.hay:0xb89a52;
  const HEUM_HAYR=(_HYM&&Number.isFinite(_HYM.hayR))?_HYM.hayR:0.95;
  const HEUM_BAND=(_HYM&&Number.isFinite(_HYM.band))?_HYM.band:0x6e5a38;
  const HEUM_BANDR=(_HYM&&Number.isFinite(_HYM.bandR))?_HYM.bandR:0.9;
  const hay=matCol(HEUM_HAY,HEUM_HAYR,0);
  const bale=new THREE.Mesh(new THREE.CylinderGeometry(HEU_R,HEU_R,HEU_LEN,12),hay);bale.rotation.x=Math.PI/2;bale.rotation.z=rot||0;bale.position.set(x,HEU_R,z);bale.castShadow=true;g.add(bale);
  for(const o of [-HEU_BANDOFF,HEU_BANDOFF]){const band=new THREE.Mesh(new THREE.TorusGeometry(HEU_BANDR,HEU_BANDTUBE,6,16),matCol(HEUM_BAND,HEUM_BANDR,0));band.position.set(x,HEU_R,z+o);g.add(band);}
  return g;}
/* V18.491.267 — Lab stone lantern ← LATERNE_GESETZ fail-soft; Host none (LATERNE_VIS). ≠ HEU; LIFT untouched. */
const LATERNE_FALLBACK={baseR0:0.19,baseR1:0.23,baseH:0.2,baseY:0.1,postR0:0.07,postR1:0.08,postH:0.66,postY:0.53,boxW:0.29,boxH:0.27,boxD:0.29,boxY:0.99,capR:0.27,capH:0.2,capY:1.22,topR:0.05,topY:1.35};
const _LTR=(SC&&SC.LATERNE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LATERNE_GESETZ)||null;
function _laterneF(k){return (_LTR&&Number.isFinite(_LTR[k]))?_LTR[k]:LATERNE_FALLBACK[k];}
function buildStoneLantern(x,z){const g=new THREE.Group();
  /* V18.491.545 — Lab Stein-Laterne Mats ← LATERNEM_GESETZ fail-soft; Host none (LATERNEM_VIS). HEUM/LATERNE geo/LEUCHTE/KOHLE/PFAD/LIFT untouched. */
  const _LTM=(SC&&SC.LATERNEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LATERNEM_GESETZ)||null;
  const LATERNEM_STONE=(_LTM&&Number.isFinite(_LTM.stone))?_LTM.stone:0x7a756c;
  const LATERNEM_STONER=(_LTM&&Number.isFinite(_LTM.stoneR))?_LTM.stoneR:0.97;
  const LATERNEM_DARK=(_LTM&&Number.isFinite(_LTM.dark))?_LTM.dark:0x55504a;
  const LATERNEM_DARKR=(_LTM&&Number.isFinite(_LTM.darkR))?_LTM.darkR:0.97;
  const LATERNEM_GLOW=(_LTM&&Number.isFinite(_LTM.glow))?_LTM.glow:0xd8c089;
  const LATERNEM_GLOWR=(_LTM&&Number.isFinite(_LTM.glowR))?_LTM.glowR:0.45;
  const stone=matCol(LATERNEM_STONE,LATERNEM_STONER,0),dark=matCol(LATERNEM_DARK,LATERNEM_DARKR,0);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(_laterneF('baseR0'),_laterneF('baseR1'),_laterneF('baseH'),8),dark);base.position.set(x,_laterneF('baseY'),z);g.add(base);
  const post=new THREE.Mesh(new THREE.CylinderGeometry(_laterneF('postR0'),_laterneF('postR1'),_laterneF('postH'),8),stone);post.position.set(x,_laterneF('postY'),z);g.add(post);
  const box=new THREE.Mesh(new THREE.BoxGeometry(_laterneF('boxW'),_laterneF('boxH'),_laterneF('boxD')),matCol(LATERNEM_GLOW,LATERNEM_GLOWR,0));box.position.set(x,_laterneF('boxY'),z);g.add(box);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(_laterneF('capR'),_laterneF('capH'),4),stone);cap.position.set(x,_laterneF('capY'),z);cap.rotation.y=Math.PI/4;g.add(cap);
  const top=new THREE.Mesh(new THREE.SphereGeometry(_laterneF('topR'),6,5),stone);top.position.set(x,_laterneF('topY'),z);g.add(top);return g;}
/* V18.491.268 — Lab brazier ← KOHLE_GESETZ fail-soft; Host none (KOHLE_VIS). ≠ LATERNE/HEU; LIFT untouched. */
const KOHLE_FALLBACK={legs:3,legR0:0.02,legR1:0.025,legH:0.82,legRad:0.17,legY:0.4,legTilt:0.32,bowlR0:0.3,bowlR1:0.17,bowlH:0.22,bowlY:0.84,coalR:0.26,coalH:0.07,coalY:0.95};
const _KOH=(SC&&SC.KOHLE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KOHLE_GESETZ)||null;
function _kohleF(k){return (_KOH&&Number.isFinite(_KOH[k]))?_KOH[k]:KOHLE_FALLBACK[k];}
function buildBrazier(x,z){const g=new THREE.Group();
  /* V18.491.546 — Lab Kohlenbecken/Brazier Mats ← KOHLEM_GESETZ fail-soft; Host none (KOHLEM_VIS). LATERNEM/KOHLE geo/HEUM/PFAD/LIFT untouched. */
  const _KHM=(SC&&SC.KOHLEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KOHLEM_GESETZ)||null;
  const KOHLEM_IRON=(_KHM&&Number.isFinite(_KHM.iron))?_KHM.iron:0x2a2620;
  const KOHLEM_IRONR=(_KHM&&Number.isFinite(_KHM.ironR))?_KHM.ironR:0.35;
  const KOHLEM_COAL=(_KHM&&Number.isFinite(_KHM.coal))?_KHM.coal:0xd8662a;
  const KOHLEM_COALR=(_KHM&&Number.isFinite(_KHM.coalR))?_KHM.coalR:0.25;
  const iron=matCol(KOHLEM_IRON,KOHLEM_IRONR,0);
  for(let i=0;i<_kohleF('legs');i++){const a=i/_kohleF('legs')*Math.PI*2;const leg=new THREE.Mesh(new THREE.CylinderGeometry(_kohleF('legR0'),_kohleF('legR1'),_kohleF('legH'),6),iron);leg.position.set(x+Math.cos(a)*_kohleF('legRad'),_kohleF('legY'),z+Math.sin(a)*_kohleF('legRad'));leg.rotation.z=Math.cos(a)*_kohleF('legTilt');leg.rotation.x=-Math.sin(a)*_kohleF('legTilt');g.add(leg);}
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(_kohleF('bowlR0'),_kohleF('bowlR1'),_kohleF('bowlH'),12),iron);bowl.position.set(x,_kohleF('bowlY'),z);g.add(bowl);
  const coals=new THREE.Mesh(new THREE.CylinderGeometry(_kohleF('coalR'),_kohleF('coalR'),_kohleF('coalH'),12),matCol(KOHLEM_COAL,KOHLEM_COALR,0));coals.position.set(x,_kohleF('coalY'),z);g.add(coals);return g;}
/* V18.491.269 — Lab stone path ← PFAD_GESETZ fail-soft; Host none (PFAD_VIS). ≠ KOHLE/LATERNE; LIFT untouched. */
const PFAD_FALLBACK={x0:-3,x1:40,step:1.45,slabW:1.25,slabH:0.06,slabD:2.4,slabY:0.03,curbZ:1.35,curbW:43,curbH:0.1,curbD:0.14,curbX:18.5,curbY:0.05};
const _PFAD=(SC&&SC.PFAD_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PFAD_GESETZ)||null;
function _pfadF(k){return (_PFAD&&Number.isFinite(_PFAD[k]))?_PFAD[k]:PFAD_FALLBACK[k];}
function buildStonePath(){const g=new THREE.Group();
  /* V18.491.547 — Lab Stein-Pfad Mats ← PFADM_GESETZ fail-soft; Host none (PFADM_VIS). KOHLEM/LATERNEM/PFAD geo/LIFT untouched. */
  const _PDM=(SC&&SC.PFADM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PFADM_GESETZ)||null;
  const PFADM_STONE=(_PDM&&Number.isFinite(_PDM.stone))?_PDM.stone:0x453f37;
  const PFADM_STONER=(_PDM&&Number.isFinite(_PDM.stoneR))?_PDM.stoneR:0.97;
  const PFADM_EDGE=(_PDM&&Number.isFinite(_PDM.edge))?_PDM.edge:0x35302a;
  const PFADM_EDGER=(_PDM&&Number.isFinite(_PDM.edgeR))?_PDM.edgeR:0.97;
  const stone=matCol(PFADM_STONE,PFADM_STONER,0),edge=matCol(PFADM_EDGE,PFADM_EDGER,0);
  for(let x=_pfadF('x0');x<_pfadF('x1');x+=_pfadF('step')){const slab=new THREE.Mesh(new THREE.BoxGeometry(_pfadF('slabW'),_pfadF('slabH'),_pfadF('slabD')),stone);slab.position.set(x,_pfadF('slabY'),0);g.add(slab);}
  for(const sz of [-_pfadF('curbZ'),_pfadF('curbZ')]){const curb=new THREE.Mesh(new THREE.BoxGeometry(_pfadF('curbW'),_pfadF('curbH'),_pfadF('curbD')),edge);curb.position.set(_pfadF('curbX'),_pfadF('curbY'),sz);g.add(curb);}
  return g;}

/* V18.491.252 — Lab Pendel-Seil ← PENDEL_GESETZ fail-soft; Host none (PENDEL_VIS). ≠ KETTE/SEIL/SCHNEIDE. */
const _PDG=(SC&&SC.PENDEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PENDEL_GESETZ)||null;
const PENDEL_L=(_PDG&&Number.isFinite(_PDG.L))?_PDG.L:1.26;
const PENDEL_BALLR=(_PDG&&Number.isFinite(_PDG.ballR))?_PDG.ballR:0.22;
const PENDEL_N=(_PDG&&Number.isFinite(_PDG.segs))?_PDG.segs:8;
/* V18.491.282 — Lab pendulum frame ← GALGEN_GESETZ fail-soft; Host none (GALGEN_VIS). PENDEL rope / TATAMI / LIFT untouched. */
const _GLG=(SC&&SC.GALGEN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GALGEN_GESETZ)||null;
const GALGEN_H=(_GLG&&Number.isFinite(_GLG.H))?_GLG.H:2.7;
const GALGEN_SPAN=(_GLG&&Number.isFinite(_GLG.span))?_GLG.span:1.7;
/* V18.491.321 — Lab GALGEN knee braces ← STREBE_GESETZ fail-soft; Host none (STREBE_VIS). KNIE/STUTZE/GALGEN H·span/post·foot·beam/LIFT untouched. */
const _STBG=(SC&&SC.STREBE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STREBE_GESETZ)||null;
const STREBE_W=(_STBG&&Number.isFinite(_STBG.W))?_STBG.W:0.5;
const STREBE_H=(_STBG&&Number.isFinite(_STBG.H))?_STBG.H:0.5;
const STREBE_D=(_STBG&&Number.isFinite(_STBG.D))?_STBG.D:0.08;
const STREBE_OFF=(_STBG&&Number.isFinite(_STBG.off))?_STBG.off:0.3;
const STREBE_YOFF=(_STBG&&Number.isFinite(_STBG.yOff))?_STBG.yOff:0.45;
/* V18.491.322 — Lab GALGEN posts ← SAULE_GESETZ fail-soft; Host none (SAULE_VIS). PFOSTEN/STUTZE/STEHER/GALGEN H·span/STREBE/foot·beam/LIFT untouched. */
const _SAUG=(SC&&SC.SAULE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SAULE_GESETZ)||null;
const SAULE_R0=(_SAUG&&Number.isFinite(_SAUG.R0))?_SAUG.R0:0.08;
const SAULE_R1=(_SAUG&&Number.isFinite(_SAUG.R1))?_SAUG.R1:0.10;
/* V18.491.323 — Lab GALGEN foot ← FUSS_GESETZ fail-soft; Host none (FUSS_VIS). PFOSTEN foot/SAULE/STREBE/GALGEN H·span/beam/LIFT untouched. */
const _FUSG=(SC&&SC.FUSS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FUSS_GESETZ)||null;
const FUSS_W=(_FUSG&&Number.isFinite(_FUSG.W))?_FUSG.W:0.42;
const FUSS_H=(_FUSG&&Number.isFinite(_FUSG.H))?_FUSG.H:0.12;
const FUSS_D=(_FUSG&&Number.isFinite(_FUSG.D))?_FUSG.D:0.55;
const FUSS_Y=(_FUSG&&Number.isFinite(_FUSG.y))?_FUSG.y:0.06;
/* V18.491.324 — Lab GALGEN crossbeam ← QUER_GESETZ fail-soft; Host none (QUER_VIS). BALKEN/RAND/TRAEGER/FUSS/SAULE/STREBE/eye/LIFT untouched. */
const _QUEG=(SC&&SC.QUER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.QUER_GESETZ)||null;
const QUER_EXTRA=(_QUEG&&Number.isFinite(_QUEG.extra))?_QUEG.extra:0.4;
const QUER_H=(_QUEG&&Number.isFinite(_QUEG.H))?_QUEG.H:0.17;
const QUER_T=(_QUEG&&Number.isFinite(_QUEG.T))?_QUEG.T:0.18;
/* V18.491.325 — Lab GALGEN eye ← OESE_GESETZ fail-soft; Host none (OESE_VIS). ROLLE/ENTE/QUER/FUSS/SAULE/STREBE/rope·ball·band/LIFT untouched. */
const _OESG=(SC&&SC.OESE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.OESE_GESETZ)||null;
const OESE_R=(_OESG&&Number.isFinite(_OESG.R))?_OESG.R:0.05;
const OESE_TUBE=(_OESG&&Number.isFinite(_OESG.tube))?_OESG.tube:0.014;
const OESE_YOFF=(_OESG&&Number.isFinite(_OESG.yOff))?_OESG.yOff:0.05;
/* V18.491.326 — Lab pendulum rope-seg R ← STRANG_GESETZ fail-soft; Host none (STRANG_VIS). STRICK/LEINE/SEIL/OESE/ball·band/LIFT untouched. */
const _STRNG=(SC&&SC.STRANG_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STRANG_GESETZ)||null;
const STRANG_R=(_STRNG&&Number.isFinite(_STRNG.R))?_STRNG.R:0.016;
/* V18.491.327 — Lab pendulum ball band ← REIF_GESETZ fail-soft; Host none (REIF_VIS). BAND/OESE/ROLLE/STRANG/PENDEL/LIFT untouched. */
const _REIG=(SC&&SC.REIF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.REIF_GESETZ)||null;
const REIF_MUL=(_REIG&&Number.isFinite(_REIG.mul))?_REIG.mul:0.86;
const REIF_TUBE=(_REIG&&Number.isFinite(_REIG.tube))?_REIG.tube:0.02;
function buildPendulumBall(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.548 — Lab Pendel/Galgen Mats ← PENDELM_GESETZ fail-soft; Host none (PENDELM_VIS). PFADM/PENDEL geo/GALGEN/FEDERM/STREITM/LIFT untouched. */
  const _PNM=(SC&&SC.PENDELM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PENDELM_GESETZ)||null;
  const PENDELM_WOOD=(_PNM&&Number.isFinite(_PNM.wood))?_PNM.wood:0x4a3520;
  const PENDELM_WOODR=(_PNM&&Number.isFinite(_PNM.woodR))?_PNM.woodR:0.9;
  const PENDELM_DARK=(_PNM&&Number.isFinite(_PNM.dark))?_PNM.dark:0x2a1d12;
  const PENDELM_DARKR=(_PNM&&Number.isFinite(_PNM.darkR))?_PNM.darkR:0.92;
  const PENDELM_IRON=(_PNM&&Number.isFinite(_PNM.iron))?_PNM.iron:0x33312c;
  const PENDELM_IRONR=(_PNM&&Number.isFinite(_PNM.ironR))?_PNM.ironR:0.4;
  const PENDELM_ROPE=(_PNM&&Number.isFinite(_PNM.rope))?_PNM.rope:0x6e5a3a;
  const PENDELM_ROPER=(_PNM&&Number.isFinite(_PNM.ropeR))?_PNM.ropeR:0.8;
  const PENDELM_BALL=(_PNM&&Number.isFinite(_PNM.ball))?_PNM.ball:0x484440;
  const PENDELM_BALLR=(_PNM&&Number.isFinite(_PNM.ballR))?_PNM.ballR:0.5;
  const PENDELM_BAND=(_PNM&&Number.isFinite(_PNM.band))?_PNM.band:0x2c2824;
  const PENDELM_BANDR=(_PNM&&Number.isFinite(_PNM.bandR))?_PNM.bandR:0.45;
  const wood=matCol(PENDELM_WOOD,PENDELM_WOODR,0),dark=matCol(PENDELM_DARK,PENDELM_DARKR,0),iron=matCol(PENDELM_IRON,PENDELM_IRONR,0);
  const H=GALGEN_H, span=GALGEN_SPAN;
  for(const px of [-span/2,span/2]){const post=new THREE.Mesh(new THREE.CylinderGeometry(SAULE_R0,SAULE_R1,H,10),wood);post.position.set(px,H/2,0);post.castShadow=true;g.add(post);
    const foot=new THREE.Mesh(new THREE.BoxGeometry(FUSS_W,FUSS_H,FUSS_D),dark);foot.position.set(px,FUSS_Y,0);g.add(foot);
    const brace=new THREE.Mesh(new THREE.BoxGeometry(STREBE_W,STREBE_H,STREBE_D),dark);brace.position.set(px+(px<0?STREBE_OFF:-STREBE_OFF),H-STREBE_YOFF,0);g.add(brace);}
  const beam=new THREE.Mesh(new THREE.BoxGeometry(span+QUER_EXTRA,QUER_H,QUER_T),dark);beam.position.set(0,H,0);g.add(beam);
  const eye=new THREE.Mesh(new THREE.TorusGeometry(OESE_R,OESE_TUBE,6,14),iron);eye.position.set(0,H-OESE_YOFF,0);eye.rotation.x=Math.PI/2;g.add(eye);
  const L=PENDEL_L, ballR=PENDEL_BALLR, N=PENDEL_N, segLen=L/N;                                        // echtes Seil: segs Verlet-Segmente
  const pivot=new THREE.Vector3(pos.x,pos.y+H-OESE_YOFF,pos.z);
  const pts=[],ptsPrev=[];for(let i=0;i<=N;i++){const p=new THREE.Vector3(pivot.x,pivot.y-segLen*i,pivot.z);pts.push(p.clone());ptsPrev.push(p.clone());}
  const ropeSegs=[];for(let i=0;i<N;i++){const seg=new THREE.Mesh(new THREE.CylinderGeometry(STRANG_R,STRANG_R,segLen,6),matCol(PENDELM_ROPE,PENDELM_ROPER,0));g.add(seg);ropeSegs.push(seg);}
  const ball=new THREE.Mesh(new THREE.SphereGeometry(ballR,18,14),matCol(PENDELM_BALL,PENDELM_BALLR,0));ball.castShadow=true;g.add(ball);
  const band=new THREE.Mesh(new THREE.TorusGeometry(ballR*REIF_MUL,REIF_TUBE,6,18),matCol(PENDELM_BAND,PENDELM_BANDR,0));ball.add(band);
  arena.pendulum={grp:g,ball,ropeSegs,pivot,N,segLen,L,ballR,pts,ptsPrev,hitCD:0};
  updatePendulum(0);return g;}
/* V18.491.238 — Lab rope solver iters ← SEIL_GESETZ fail-soft; Host none (SEIL_VIS). */
const _SG=(SC&&SC.SEIL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SEIL_GESETZ)||null;
const ROPE_ITERS=(_SG&&Number.isFinite(_SG.iters))?_SG.iters:18;                                     // eine Wahrheit für alle Seile (vorher 18 Pendel / 16 Gasse — Drift)
/* V18.491.244 — Lab thrust/lunge ← AUSFALL_GESETZ fail-soft; Host none (AUSFALL_VIS). */
const _AFG=(SC&&SC.AUSFALL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.AUSFALL_GESETZ)||null;
const TL=(_AFG&&Number.isFinite(_AFG.durSec))?_AFG.durSec:0.34;
const REACH_AMP=(_AFG&&Number.isFinite(_AFG.reachAmp))?_AFG.reachAmp:0.55;
/* V18.491.245 — Lab edge samples ← SCHNEIDE_GESETZ fail-soft; Host none (SCHNEIDE_VIS). */
const _SCHG=(SC&&SC.SCHNEIDE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHNEIDE_GESETZ)||null;
const SCHNEIDE_NS=(_SCHG&&Number.isFinite(_SCHG.samples))?_SCHG.samples:8;
/* V18.491.247 — Lab gauntlet rope ← KETTE_GESETZ fail-soft; Host none (KETTE_VIS). SEIL/SCHNEIDE untouched. */
const _KTG=(SC&&SC.KETTE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KETTE_GESETZ)||null;
const KETTE_NS=(_KTG&&Number.isFinite(_KTG.segs))?_KTG.segs:7;
const KETTE_L=(_KTG&&Number.isFinite(_KTG.len))?_KTG.len:1.35;
const KETTE_BALLR=(_KTG&&Number.isFinite(_KTG.ballR))?_KTG.ballR:0.20;
function stepRope(R,dt){if(dt<=0)return;const grav=ARENA.g*dt*dt,N=R.N;                                   // Verlet-Integration + Distanz-Constraints, Pivot fest
  for(let i=1;i<=N;i++){const p=R.pts[i],pp=R.ptsPrev[i];const vx=(p.x-pp.x)*0.994,vy=(p.y-pp.y)*0.994,vz=(p.z-pp.z)*0.994;pp.set(p.x,p.y,p.z);p.x+=vx;p.y+=vy-grav;p.z+=vz;}
  for(let it=0;it<ROPE_ITERS;it++){R.pts[0].copy(R.pivot);for(let i=1;i<=N;i++){const a=R.pts[i-1],b=R.pts[i];const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,dist=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-6,diff=(dist-R.segLen)/dist;const wA=(i-1===0)?0:0.5,wB=(i-1===0)?1:0.5;a.x+=dx*diff*wA;a.y+=dy*diff*wA;a.z+=dz*diff*wA;b.x-=dx*diff*wB;b.y-=dy*diff*wB;b.z-=dz*diff*wB;}}}
function drawRope(R,ox,oy,oz){const N=R.N;                                                            // Segmente + Kugel zeichnen (Gruppen-Offset)
  for(let i=0;i<N;i++){const a=R.pts[i],b=R.pts[i+1],seg=R.ropeSegs[i];seg.position.set((a.x+b.x)/2-ox,(a.y+b.y)/2-oy,(a.z+b.z)/2-oz);const dir=new THREE.Vector3(b.x-a.x,b.y-a.y,b.z-a.z),ln=dir.length();seg.scale.y=ln/R.segLen;seg.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());}
  const bw=R.pts[N];R.ball.position.set(bw.x-ox,bw.y-oy,bw.z-oz);}
const _ZEROV=new THREE.Vector3();
function bladeCurve(s){if(arena._impact||!arena._curveDir)return _ZEROV;return arena._curveDir.clone().multiplyScalar(curveY(s,P));}   // seitlicher Klingen-Versatz im Weltraum
function bladeHitsPoint(handW,bladeDir,c,R){const e0=arena._edge0,e1=arena._edge1,eLen=Math.max(0.02,e1-e0),N=Math.max(6,Math.ceil(eLen/0.09));   // Schneide (gekrümmt) gegen Kugelziel
  for(let i=0;i<=N;i++){const s=i/N,pt=handW.clone().addScaledVector(bladeDir,e0+s*eLen).add(bladeCurve(s));if(pt.distanceTo(c)<R)return pt;}return null;}
function bladeHitsColumn(handW,bladeDir,c,R,yLo,yHi){const e0=arena._edge0,e1=arena._edge1,eLen=Math.max(0.02,e1-e0),N=Math.max(6,Math.ceil(eLen/0.09));  // Schneide (gekrümmt) gegen Säulenziel
  for(let i=0;i<=N;i++){const s=i/N,pt=handW.clone().addScaledVector(bladeDir,e0+s*eLen).add(bladeCurve(s));if(Math.hypot(pt.x-c.x,pt.z-c.z)<R&&pt.y>yLo&&pt.y<yHi)return pt;}return null;}
function updatePendulum(dt){const P=arena.pendulum;if(!P)return;const N=P.N;
  stepRope(P,dt);
  drawRope(P,P.grp.position.x,P.grp.position.y,P.grp.position.z);
  const bw=P.pts[N];
  if(P.hitCD>0)P.hitCD-=dt;
  if(dt>0&&P.hitCD<=0){const spd=Math.hypot(bw.x-P.ptsPrev[N].x,bw.z-P.ptsPrev[N].z)/Math.max(1e-4,dt);
    if(spd>1.6){const dh=Math.hypot(bw.x-arena.player.x,bw.z-arena.player.z);if(dh<P.ballR+0.42&&bw.y<1.85){fx.shake=Math.max(fx.shake,0.4);fx.freeze=Math.max(fx.freeze,0.1);popText('✖ DIE KUGEL TRIFFT DICH',GERATM_CSS,0,0);P.hitCD=1.0;}}}}
function tryHitPendulum(handW,bladeDir,vel){const P=arena.pendulum;if(!P||P.hitCD>0.55)return false;const N=P.N,bw=P.pts[N];let hit=false;
  hit=!!bladeHitsPoint(handW,bladeDir,bw,P.ballR+0.07);
  if(!hit)return false;
  P.ptsPrev[N].x-=clamp(vel.x,-7,7)*0.014*wMass();P.ptsPrev[N].z-=clamp(vel.z,-7,7)*0.014*wMass();P.ptsPrev[N].y-=clamp(vel.y,-5,5)*0.007*wMass();   // Impuls auf den Ball-Punkt (Seil schwingt + biegt)
  fx.shake=Math.max(fx.shake,0.08);fx.freeze=Math.max(fx.freeze,0.05);popText('Kugel getroffen — sie schwingt!',GERTTM_CSS,0,-0.04);arena.cooldown=0.18;return true;}
/* V18.491.417 — Lab Drehbaum-Kappe ← KAPPE_GESETZ fail-soft; Host none (KAPPE_VIS). STUMPF/BAUM/DREH untouched; pad 0.13 left bare; HAUBE/KNOLLE/BLOCK/LIFT untouched. */
const _KPE=(SC&&SC.KAPPE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KAPPE_GESETZ)||null;
const KAPPE_R0=(_KPE&&Number.isFinite(_KPE.R0))?_KPE.R0:0.13;
const KAPPE_R1=(_KPE&&Number.isFinite(_KPE.R1))?_KPE.R1:0.11;
const KAPPE_H=(_KPE&&Number.isFinite(_KPE.H))?_KPE.H:0.1;
const KAPPE_YOFF=(_KPE&&Number.isFinite(_KPE.yOff))?_KPE.yOff:0.05;
/* V18.491.419 — Lab Drehbaum-Polster ← POLSTER_GESETZ fail-soft; Host none (POLSTER_VIS). DREH.padR/KAPPE/BAUM/STUMPF/HOLM/PAD untouched; stripe Torus left bare. */
const _POL=(SC&&SC.POLSTER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.POLSTER_GESETZ)||null;
const POLSTER_R=(_POL&&Number.isFinite(_POL.R))?_POL.R:0.13;
const POLSTER_H=(_POL&&Number.isFinite(_POL.H))?_POL.H:0.18;
/* V18.491.420 — Lab Drehbaum-Zierstreifen ← ZIER_GESETZ fail-soft; Host none (ZIER_VIS). POLSTER/KAPPE/BAUM/HOLM/DREH/STREIF/REIF/BAND/RING/SCHLINGE/GURT/MUFFE/LIFT untouched. */
const _ZIR=(SC&&SC.ZIER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ZIER_GESETZ)||null;
const ZIER_R=(_ZIR&&Number.isFinite(_ZIR.R))?_ZIR.R:0.13;
const ZIER_TUBE=(_ZIR&&Number.isFinite(_ZIR.tube))?_ZIR.tube:0.016;
/* V18.491.423 — Lab Drehbaum-Speiche ← SPEICHE_GESETZ fail-soft; Host none (SPEICHE_VIS). DREH.armLen/NABE/ARM/AUSLEG/HEBEL/POLSTER/ZIER/LIFT untouched. */
const _SPE=(SC&&SC.SPEICHE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPEICHE_GESETZ)||null;
const SPEICHE_THICK=(_SPE&&Number.isFinite(_SPE.thick))?_SPE.thick:0.075;
/* V18.491.431 — Lab Drehbaum-Hub/Pivot ← SPINN_GESETZ fail-soft; Host none (SPINN_VIS). GELENK/KAPPE/NABE/BAUM/HOLM/DREH/LIFT untouched; hub+pivot same yOff ≠ KAPPE Fake-merge. */
const _SPN=(SC&&SC.SPINN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPINN_GESETZ)||null;
const SPINN_YOFF=(_SPN&&Number.isFinite(_SPN.yOff))?_SPN.yOff:0.05;
/* V18.491.416 — Lab Drehbaum-Stumpf ← STUMPF_GESETZ fail-soft; Host none (STUMPF_VIS). BAUM/DREH untouched; cap left bare; STAND/PODES/SOCKEL/FUSS/TELLER/PLINT/BLOCK/GLIED/DREIB/LIFT untouched. */
const _STP=(SC&&SC.STUMPF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STUMPF_GESETZ)||null;
const STUMPF_R0=(_STP&&Number.isFinite(_STP.R0))?_STP.R0:0.34;
const STUMPF_R1=(_STP&&Number.isFinite(_STP.R1))?_STP.R1:0.44;
const STUMPF_H=(_STP&&Number.isFinite(_STP.H))?_STP.H:0.18;
const STUMPF_Y=(_STP&&Number.isFinite(_STP.y))?_STP.y:0.09;
/* V18.491.415 — Lab Drehbaum-Pfosten ← BAUM_GESETZ fail-soft; Host none (BAUM_VIS). DREH H/armLen/padR untouched; QUINT post coinc. left bare; STEHER/SAULE/MAST/PFOST/PFYL/DORN/ZIELP/GLIED/DREIB/LIFT untouched. */
const _BAU=(SC&&SC.BAUM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BAUM_GESETZ)||null;
const BAUM_R0=(_BAU&&Number.isFinite(_BAU.R0))?_BAU.R0:0.09;
const BAUM_R1=(_BAU&&Number.isFinite(_BAU.R1))?_BAU.R1:0.13;
/* V18.491.280 — Lab spintree ← DREH_GESETZ fail-soft; Host none (DREH_VIS). QUINT / SCHAUKEL / LIFT untouched. */
const _DRG=(SC&&SC.DREH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DREH_GESETZ)||null;
const DREH_H=(_DRG&&Number.isFinite(_DRG.H))?_DRG.H:1.5;
const DREH_ARMLEN=(_DRG&&Number.isFinite(_DRG.armLen))?_DRG.armLen:0.92;
const DREH_PADR=(_DRG&&Number.isFinite(_DRG.padR))?_DRG.padR:0.18;
function buildSpinTree(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.549 — Lab Drehbaum Mats ← DREHM_GESETZ fail-soft; Host none (DREHM_VIS). PENDELM/DREH/BAUM/STUMPF/FEDERM/STREITM/LIFT untouched. */
  const _DRM=(SC&&SC.DREHM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DREHM_GESETZ)||null;
  const DREHM_WOOD=(_DRM&&Number.isFinite(_DRM.wood))?_DRM.wood:0x4a3520;
  const DREHM_WOODR=(_DRM&&Number.isFinite(_DRM.woodR))?_DRM.woodR:0.9;
  const DREHM_DARK=(_DRM&&Number.isFinite(_DRM.dark))?_DRM.dark:0x2a1d12;
  const DREHM_DARKR=(_DRM&&Number.isFinite(_DRM.darkR))?_DRM.darkR:0.92;
  const DREHM_PAD=(_DRM&&Number.isFinite(_DRM.pad))?_DRM.pad:0x6e4a32;
  const DREHM_PADR=(_DRM&&Number.isFinite(_DRM.padR))?_DRM.padR:0.85;
  const DREHM_LIN=(_DRM&&Number.isFinite(_DRM.lin))?_DRM.lin:0xb6a06a;
  const DREHM_LINR=(_DRM&&Number.isFinite(_DRM.linR))?_DRM.linR:0.7;
  const wood=matCol(DREHM_WOOD,DREHM_WOODR,0),dark=matCol(DREHM_DARK,DREHM_DARKR,0),pad=matCol(DREHM_PAD,DREHM_PADR,0),lin=matCol(DREHM_LIN,DREHM_LINR,0);
  const H=DREH_H;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(BAUM_R0,BAUM_R1,H,12),wood);post.position.set(0,H/2,0);post.castShadow=true;g.add(post);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(STUMPF_R0,STUMPF_R1,STUMPF_H,12),dark);base.position.set(0,STUMPF_Y,0);g.add(base);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(KAPPE_R0,KAPPE_R1,KAPPE_H,12),dark);cap.position.set(0,H+KAPPE_YOFF,0);g.add(cap);
  const hub=new THREE.Group();hub.position.set(0,H+SPINN_YOFF,0);g.add(hub);
  const armLen=DREH_ARMLEN;
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2;const arm=new THREE.Mesh(new THREE.BoxGeometry(armLen,SPEICHE_THICK,SPEICHE_THICK),wood);arm.position.set(Math.cos(a)*armLen/2,0,Math.sin(a)*armLen/2);arm.rotation.y=-a;hub.add(arm);
    const p=new THREE.Mesh(new THREE.CylinderGeometry(POLSTER_R,POLSTER_R,POLSTER_H,12),pad);p.position.set(Math.cos(a)*armLen,0,Math.sin(a)*armLen);p.rotation.x=Math.PI/2;hub.add(p);
    const stripe=new THREE.Mesh(new THREE.TorusGeometry(ZIER_R,ZIER_TUBE,6,16),lin);stripe.position.copy(p.position);hub.add(stripe);}
  arena.spintree={grp:g,hub,armLen,pivot:new THREE.Vector3(pos.x,pos.y+H+SPINN_YOFF,pos.z),padR:DREH_PADR,ang:0,angVel:0,hitCD:0};return g;}
function updateSpinTree(dt){const T=arena.spintree;if(!T)return;
  if(Math.abs(T.angVel)>0.02){T.ang+=T.angVel*dt;T.angVel*=Math.max(0,1-0.62*dt);T.hub.rotation.y=T.ang;}else T.angVel=0;
  if(T.hitCD>0)T.hitCD-=dt;
  if(Math.abs(T.angVel)>2.6&&T.hitCD<=0){for(let i=0;i<4;i++){const a=T.ang+i/4*Math.PI*2,px=T.pivot.x+Math.cos(a)*T.armLen,pz=T.pivot.z+Math.sin(a)*T.armLen;if(Math.hypot(px-arena.player.x,pz-arena.player.z)<T.padR+0.42&&T.pivot.y<1.85){fx.shake=Math.max(fx.shake,0.34);fx.freeze=Math.max(fx.freeze,0.09);popText('✖ der Drehbaum erwischt dich',DREHERM_CSS,0,0);T.hitCD=0.9;break;}}}}
function tryHitSpinTree(handW,bladeDir,vel){const T=arena.spintree;if(!T)return false;
  const e0=arena._edge0,e1=arena._edge1,eLen=Math.max(0.02,e1-e0);let hp=null;
  for(let j=0;j<4&&!hp;j++){const a=T.ang+j/4*Math.PI*2,pw=new THREE.Vector3(T.pivot.x+Math.cos(a)*T.armLen,T.pivot.y,T.pivot.z+Math.sin(a)*T.armLen);
    if(bladeHitsPoint(handW,bladeDir,pw,T.padR+0.07))hp=pw;}
  if(!hp)return false;
  const r=hp.clone().sub(T.pivot);r.y=0;const radius=Math.max(0.3,r.length());
  const tang=new THREE.Vector3(r.z,0,-r.x).normalize();const vt=vel.dot(tang);
  T.angVel+=clamp(vt/radius,-10,10)*0.8;
  fx.shake=Math.max(fx.shake,0.07);fx.freeze=Math.max(fx.freeze,0.05);popText('Drehbaum getroffen!',DREHTTM_CSS,0,-0.04);arena.cooldown=0.18;return true;}
/* V18.491.418 — Lab Quintain-Pfosten ← HOLM_GESETZ fail-soft; Host none (HOLM_VIS). BAUM coinc. untouched; QUINT postH/armLen/shieldR untouched; KAPPE/STUMPF/DREH/PFYL/PFOST/DORN/ZIELP/LIFT untouched. */
const _HOL=(SC&&SC.HOLM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HOLM_GESETZ)||null;
const HOLM_R0=(_HOL&&Number.isFinite(_HOL.R0))?_HOL.R0:0.09;
const HOLM_R1=(_HOL&&Number.isFinite(_HOL.R1))?_HOL.R1:0.13;
/* V18.491.421 — Lab Quintain-Boden ← BODEN_GESETZ fail-soft; Host none (BODEN_VIS). HOLM/BLOCK/STUMPF/STAND/PODES/PLINT/SOCKEL/FUSS/ZIER/POLSTER/LIFT untouched. */
const _BOD=(SC&&SC.BODEN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BODEN_GESETZ)||null;
const BODEN_R0=(_BOD&&Number.isFinite(_BOD.R0))?_BOD.R0:0.3;
const BODEN_R1=(_BOD&&Number.isFinite(_BOD.R1))?_BOD.R1:0.38;
const BODEN_H=(_BOD&&Number.isFinite(_BOD.H))?_BOD.H:0.2;
const BODEN_Y=(_BOD&&Number.isFinite(_BOD.y))?_BOD.y:0.1;
/* V18.491.422 — Lab Quintain-Nabe ← NABE_GESETZ fail-soft; Host none (NABE_VIS). BODEN/HOLM/RAD/RIEGEL/PFYL/LIFT untouched; y stays postH. */
const _NAB=(SC&&SC.NABE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.NABE_GESETZ)||null;
const NABE_R=(_NAB&&Number.isFinite(_NAB.R))?_NAB.R:0.08;
const NABE_H=(_NAB&&Number.isFinite(_NAB.H))?_NAB.H:0.14;
/* V18.491.424 — Lab Quintain-Querbalken ← QUERB_GESETZ fail-soft; Host none (QUERB_VIS). SPEICHE/NABE/RIEGEL/PFYL/HOLM/QUER/BALKEN/LIFT untouched; L stays armLen*2. */
const _QRB=(SC&&SC.QUERB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.QUERB_GESETZ)||null;
const QUERB_THICK=(_QRB&&Number.isFinite(_QRB.thick))?_QRB.thick:0.08;
/* V18.491.425 — Lab Quintain-Schildscheibe ← SCHIRM_GESETZ fail-soft; Host none (SCHIRM_VIS). SCHILD/QUINT.shieldR/SCHEIB/QUERB/POLSTER/LIFT untouched. */
const _SCM=(SC&&SC.SCHIRM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHIRM_GESETZ)||null;
const SCHIRM_R=(_SCM&&Number.isFinite(_SCM.R))?_SCM.R:0.33;
const SCHIRM_H=(_SCM&&Number.isFinite(_SCM.H))?_SCM.H:0.04;
/* V18.491.426 — Lab Quintain-Schildbuckel ← BUCKEL_GESETZ fail-soft; Host none (BUCKEL_VIS). SCHIRM/NABE/KNOLLE/BIRNE/GLIED/LIFT untouched; cross left bare. */
const _BUC=(SC&&SC.BUCKEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BUCKEL_GESETZ)||null;
const BUCKEL_R=(_BUC&&Number.isFinite(_BUC.R))?_BUC.R:0.07;
const BUCKEL_X=(_BUC&&Number.isFinite(_BUC.x))?_BUC.x:0.04;
/* V18.491.427 — Lab Quintain-Schildkreuz ← KREUZB_GESETZ fail-soft; Host none (KREUZB_VIS). KREUZ/BUCKEL/SCHIRM/QUERB/LATTE/LIFT untouched; bag H coinc. left bare. */
const _KZB=(SC&&SC.KREUZB_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KREUZB_GESETZ)||null;
const KREUZB_W=(_KZB&&Number.isFinite(_KZB.W))?_KZB.W:0.02;
const KREUZB_H=(_KZB&&Number.isFinite(_KZB.H))?_KZB.H:0.52;
const KREUZB_D=(_KZB&&Number.isFinite(_KZB.D))?_KZB.D:0.05;
const KREUZB_X=(_KZB&&Number.isFinite(_KZB.x))?_KZB.x:0.028;
/* V18.491.428 — Lab Quintain-Sandsack ← SACK_GESETZ fail-soft; Host none (SACK_VIS). KREUZB/KEGEL/TONNE/BIRNE/NABE/RAD/LIFT untouched; bcap left bare. */
const _SCK=(SC&&SC.SACK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SACK_GESETZ)||null;
const SACK_R0=(_SCK&&Number.isFinite(_SCK.R0))?_SCK.R0:0.14;
const SACK_R1=(_SCK&&Number.isFinite(_SCK.R1))?_SCK.R1:0.17;
const SACK_H=(_SCK&&Number.isFinite(_SCK.H))?_SCK.H:0.52;
const SACK_Y=(_SCK&&Number.isFinite(_SCK.y))?_SCK.y:-0.12;
const SACK_ROTZ=(_SCK&&Number.isFinite(_SCK.rotZ))?_SCK.rotZ:0.12;
/* V18.491.429 — Lab Quintain-Sandsack-Kuppe ← KUPPE_GESETZ fail-soft; Host none (KUPPE_VIS). SACK/BIRNE/KNOLLE/BUCKEL/GLIED/KAPPE/HAUBE/LIFT untouched. */
const _KUP=(SC&&SC.KUPPE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KUPPE_GESETZ)||null;
const KUPPE_R=(_KUP&&Number.isFinite(_KUP.R))?_KUP.R:0.15;
const KUPPE_XOFF=(_KUP&&Number.isFinite(_KUP.xOff))?_KUP.xOff:0.06;
const KUPPE_Y=(_KUP&&Number.isFinite(_KUP.y))?_KUP.y:-0.35;
/* V18.491.430 — Lab Quintain-Arm-Gelenk ← GELENK_GESETZ fail-soft; Host none (GELENK_VIS). ANGEL/ZAPFEN/KUPPE/NABE/ANSATZ/HOLM/BAUM/KAPPE/LIFT untouched; arm+pivot same yOff. */
const _GEL=(SC&&SC.GELENK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.GELENK_GESETZ)||null;
const GELENK_YOFF=(_GEL&&Number.isFinite(_GEL.yOff))?_GEL.yOff:0.07;
/* V18.491.279 — Lab quintain ← QUINT_GESETZ fail-soft; Host none (QUINT_VIS). SCHAUKEL swing / PENDEL / LIFT untouched. */
const _QNG=(SC&&SC.QUINT_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.QUINT_GESETZ)||null;
const QUINT_POSTH=(_QNG&&Number.isFinite(_QNG.postH))?_QNG.postH:1.32;
const QUINT_ARMLEN=(_QNG&&Number.isFinite(_QNG.armLen))?_QNG.armLen:1.0;
const QUINT_SHIELDR=(_QNG&&Number.isFinite(_QNG.shieldR))?_QNG.shieldR:0.36;
function buildQuintain(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.550 — Lab Quintain Mats ← QUINTM_GESETZ fail-soft; Host none (QUINTM_VIS). DREHM/PENDELM/QUINT geo/SCHILDM/LIFT untouched. */
  const _QNM=(SC&&SC.QUINTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.QUINTM_GESETZ)||null;
  const QUINTM_WOOD=(_QNM&&Number.isFinite(_QNM.wood))?_QNM.wood:0x4a3520;
  const QUINTM_WOODR=(_QNM&&Number.isFinite(_QNM.woodR))?_QNM.woodR:0.9;
  const QUINTM_DARK=(_QNM&&Number.isFinite(_QNM.dark))?_QNM.dark:0x2a1d12;
  const QUINTM_DARKR=(_QNM&&Number.isFinite(_QNM.darkR))?_QNM.darkR:0.92;
  const QUINTM_SHIELD=(_QNM&&Number.isFinite(_QNM.shield))?_QNM.shield:0x9a3528;
  const QUINTM_SHIELDR=(_QNM&&Number.isFinite(_QNM.shieldR))?_QNM.shieldR:0.55;
  const QUINTM_BOSS=(_QNM&&Number.isFinite(_QNM.boss))?_QNM.boss:0xc8a44a;
  const QUINTM_BOSSR=(_QNM&&Number.isFinite(_QNM.bossR))?_QNM.bossR:1;
  const QUINTM_CROSS=(_QNM&&Number.isFinite(_QNM.cross))?_QNM.cross:0xe8dcc0;
  const QUINTM_CROSSR=(_QNM&&Number.isFinite(_QNM.crossR))?_QNM.crossR:0.45;
  const QUINTM_BAG=(_QNM&&Number.isFinite(_QNM.bag))?_QNM.bag:0x6e5a38;
  const QUINTM_BAGR=(_QNM&&Number.isFinite(_QNM.bagR))?_QNM.bagR:0.8;
  const QUINTM_CAP=(_QNM&&Number.isFinite(_QNM.cap))?_QNM.cap:0x5a4a2e;
  const QUINTM_CAPR=(_QNM&&Number.isFinite(_QNM.capR))?_QNM.capR:0.8;
  const wood=matCol(QUINTM_WOOD,QUINTM_WOODR,0),dark=matCol(QUINTM_DARK,QUINTM_DARKR,0);const postH=QUINT_POSTH;
  const base=new THREE.Mesh(new THREE.CylinderGeometry(BODEN_R0,BODEN_R1,BODEN_H,12),dark);base.position.y=BODEN_Y;g.add(base);
  const post=new THREE.Mesh(new THREE.CylinderGeometry(HOLM_R0,HOLM_R1,postH,12),wood);post.position.y=postH/2;post.castShadow=true;g.add(post);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(NABE_R,NABE_R,NABE_H,10),dark);hub.position.y=postH;g.add(hub);
  const arm=new THREE.Group();arm.position.set(0,postH+GELENK_YOFF,0);g.add(arm);const armLen=QUINT_ARMLEN;
  const beam=new THREE.Mesh(new THREE.BoxGeometry(armLen*2,QUERB_THICK,QUERB_THICK),wood);arm.add(beam);
  const shield=new THREE.Group();shield.position.set(armLen,0,0);arm.add(shield);                          // Schild
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(SCHIRM_R,SCHIRM_R,SCHIRM_H,16),matCol(QUINTM_SHIELD,QUINTM_SHIELDR,0));sh.rotation.z=Math.PI/2;sh.castShadow=true;shield.add(sh);
  const boss=new THREE.Mesh(new THREE.SphereGeometry(BUCKEL_R,10,8),matCol(QUINTM_BOSS,QUINTM_BOSSR,0));boss.position.x=BUCKEL_X;shield.add(boss);
  const cross=new THREE.Mesh(new THREE.BoxGeometry(KREUZB_W,KREUZB_H,KREUZB_D),matCol(QUINTM_CROSS,QUINTM_CROSSR,0));cross.position.x=KREUZB_X;shield.add(cross);
  const bag=new THREE.Mesh(new THREE.CylinderGeometry(SACK_R0,SACK_R1,SACK_H,10),matCol(QUINTM_BAG,QUINTM_BAGR,0));bag.position.set(-armLen,SACK_Y,0);bag.rotation.z=SACK_ROTZ;bag.castShadow=true;arm.add(bag);   // Sandsack-Gegengewicht
  const bcap=new THREE.Mesh(new THREE.SphereGeometry(KUPPE_R,10,8),matCol(QUINTM_CAP,QUINTM_CAPR,0));bcap.position.set(-armLen+KUPPE_XOFF,KUPPE_Y,0);arm.add(bcap);
  const initAng=Math.PI/2;arm.rotation.y=initAng;                                                          // Schild zeigt anfangs nach -z
  arena.quintain={grp:g,arm,ang:initAng,angVel:0,armLen,pivot:new THREE.Vector3(pos.x,postH+GELENK_YOFF,pos.z),shieldR:QUINT_SHIELDR,hitCD:0};return g;}
function tryHitQuintain(handW,bladeDir,vel){const Q=arena.quintain;if(!Q)return false;
  Q.arm.updateMatrixWorld(true);
  const sp=new THREE.Vector3(Q.armLen,0,0).applyMatrix4(Q.arm.matrixWorld);     // Schild (+Arm)
  const bg=new THREE.Vector3(-Q.armLen,0,0).applyMatrix4(Q.arm.matrixWorld);    // Sandsack (−Arm)
  const e0=arena._edge0,e1=arena._edge1,eLen=Math.max(0.02,e1-e0);let hp=null,bag=false;
  for(let i=0;i<=6;i++){const p=e0+(i/6)*eLen,pt=handW.clone().addScaledVector(bladeDir,p);
    if(!hp&&pt.distanceTo(sp)<Q.shieldR+0.06){hp=sp;}
    else if(!hp&&pt.distanceTo(bg)<0.36){hp=bg;bag=true;}}
  if(!hp)return false;
  const r=hp.clone().sub(Q.pivot);r.y=0;const radius=Math.max(0.3,r.length());
  const tang=new THREE.Vector3(r.z,0,-r.x).normalize();const vt=vel.dot(tang);                             // richtige Drehrichtung: Treffer stösst den Arm in Schlagrichtung weg
  Q.angVel+=clamp(vt/radius,-9,9)*0.75*wMass();
  fx.shake=Math.max(fx.shake,0.06);fx.freeze=Math.max(fx.freeze,0.05);
  popText(bag?'Sandsack getroffen — er schwingt herum!':'Schild getroffen — weiche dem Sandsack!',bag?QUINTHM_SACK_CSS:QUINTHM_SHIELD_CSS,0,-0.04);arena.cooldown=0.2;return true;}
function updateQuintain(dt){const Q=arena.quintain;if(!Q)return;
  if(Math.abs(Q.angVel)>0.02){Q.ang+=Q.angVel*dt;Q.angVel*=Math.max(0,1-1.05*dt);Q.arm.rotation.y=Q.ang;}else Q.angVel=0;
  if(Q.hitCD>0)Q.hitCD-=dt;
  Q.arm.updateMatrixWorld(true);const bp=new THREE.Vector3(-Q.armLen,-0.2,0).applyMatrix4(Q.arm.matrixWorld);
  const dh=Math.hypot(bp.x-arena.player.x,bp.z-arena.player.z);                                            // erwischt der Sack den Spieler?
  if(dh<0.75&&Math.abs(Q.angVel)>0.6&&Q.hitCD<=0){Q.hitCD=1.3;fx.shake=Math.max(fx.shake,0.42);fx.freeze=Math.max(fx.freeze,0.12);const B=camBasis();fx.kickV.addScaledVector(B.fwd,-3.2);fx.kickV.y-=1.5;popText('✖ DER SANDSACK ERWISCHT DICH',GEFAHRM_CSS,0,0);popText('schneller ausweichen!',TREFFM_BAD_CSS,0.12,0.08);}}
/* V18.491.287 — Lab thrust rings ← STECH_GESETZ fail-soft; Host none (STECH_VIS). BAHN / SCHEIBE / LIFT untouched. ≠ STREIT charger. */
const STECH_SPOTS_FALLBACK=[[-0.85,1.50],[0,1.42],[0.85,1.55]];
const _STCG=(SC&&SC.STECH_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STECH_GESETZ)||null;
const STECH_R=(_STCG&&Number.isFinite(_STCG.R))?_STCG.R:0.16;
const STECH_BARH=(_STCG&&Number.isFinite(_STCG.barH))?_STCG.barH:2.5;
const STECH_POSTX=(_STCG&&Number.isFinite(_STCG.postX))?_STCG.postX:1.35;
/* V18.491.441 — Lab Stechbahn-Torpfosten ← TORP_GESETZ fail-soft; Host none (TORP_VIS). STECH barH/postX/R untouched; KIEL/BUCKEL/SCHWANZ/BAUM/HOLM/PFYL/RUTE/LIFT untouched. */
const _TRP=(SC&&SC.TORP_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TORP_GESETZ)||null;
const TORP_R0=(_TRP&&Number.isFinite(_TRP.R0))?_TRP.R0:0.07;
const TORP_R1=(_TRP&&Number.isFinite(_TRP.R1))?_TRP.R1:0.09;
/* V18.491.442 — Lab Stechbahn-Querbarre ← BARRE_GESETZ fail-soft; Host none (BARRE_VIS). TORP/QUERB/RIEGEL/AST/STECH/LIFT untouched; y stays STECH_BARH. */
const _BAR=(SC&&SC.BARRE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BARRE_GESETZ)||null;
const BARRE_W=(_BAR&&Number.isFinite(_BAR.W))?_BAR.W:3.0;
const BARRE_THICK=(_BAR&&Number.isFinite(_BAR.thick))?_BAR.thick:0.1;
/* V18.491.443 — Lab Stechbahn-Hängeschnur ← FADEN_GESETZ fail-soft; Host none (FADEN_VIS). BARRE/TAU/SEIL/STRANG/STRICK/GURT/SCHLINGE/STECH/LIFT untouched; H derived. */
const _FAD=(SC&&SC.FADEN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FADEN_GESETZ)||null;
const FADEN_R=(_FAD&&Number.isFinite(_FAD.R))?_FAD.R:0.006;
/* V18.491.444 — Lab Stechbahn-Ring-Rohr ← ROHR_GESETZ fail-soft; Host none (ROHR_VIS). STECH.R/FADEN/ZIER/MUFFE/SCHLINGE/OESE/REIF/RING/LIFT untouched. */
const _ROH=(SC&&SC.ROHR_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ROHR_GESETZ)||null;
const ROHR_TUBE=(_ROH&&Number.isFinite(_ROH.tube))?_ROH.tube:0.026;
function _stechSpotsOk(s){if(!Array.isArray(s)||s.length!==3)return false;for(const p of s){if(!Array.isArray(p)||p.length!==2)return false;if(!Number.isFinite(p[0])||!Number.isFinite(p[1]))return false;}return true;}
const STECH_SPOTS=_stechSpotsOk(_STCG&&_STCG.spots)?_STCG.spots.map(p=>p.slice()):STECH_SPOTS_FALLBACK.map(p=>p.slice());
function buildThrustRings(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.551 — Lab Stechbahn Mats ← STECHM_GESETZ fail-soft; Host none (STECHM_VIS). QUINTM/STECH geo/DREHM/PENDELM/LIFT untouched. */
  const _TRM=(SC&&SC.STECHM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STECHM_GESETZ)||null;
  const STECHM_WOOD=(_TRM&&Number.isFinite(_TRM.wood))?_TRM.wood:0x4a3520;
  const STECHM_WOODR=(_TRM&&Number.isFinite(_TRM.woodR))?_TRM.woodR:0.9;
  const STECHM_DARK=(_TRM&&Number.isFinite(_TRM.dark))?_TRM.dark:0x2a1d12;
  const STECHM_DARKR=(_TRM&&Number.isFinite(_TRM.darkR))?_TRM.darkR:0.9;
  const STECHM_RING=(_TRM&&Number.isFinite(_TRM.ring))?_TRM.ring:0xc8a44a;
  const STECHM_RINGR=(_TRM&&Number.isFinite(_TRM.ringR))?_TRM.ringR:1;
  const wood=matCol(STECHM_WOOD,STECHM_WOODR,0),dark=matCol(STECHM_DARK,STECHM_DARKR,0);
  for(const sx of [-STECH_POSTX,STECH_POSTX]){const post=new THREE.Mesh(new THREE.CylinderGeometry(TORP_R0,TORP_R1,STECH_BARH,10),wood);post.position.set(sx,STECH_BARH/2,0);post.castShadow=true;g.add(post);}
  const bar=new THREE.Mesh(new THREE.BoxGeometry(BARRE_W,BARRE_THICK,BARRE_THICK),dark);bar.position.set(0,STECH_BARH,0);g.add(bar);
  arena.thrustRings=[];const spots=STECH_SPOTS;                                     // x, Höhe (Stichlinie) — durchstechen entlang z
  for(const [rx,ry] of spots){const ring=new THREE.Mesh(new THREE.TorusGeometry(STECH_R,ROHR_TUBE,8,22),matCol(STECHM_RING,STECHM_RINGR,0));ring.position.set(rx,ry,0);g.add(ring);
    const str=new THREE.Mesh(new THREE.CylinderGeometry(FADEN_R,FADEN_R,STECH_BARH-ry,4),dark);str.position.set(rx,(STECH_BARH+ry)/2,0);g.add(str);
    arena.thrustRings.push({center:new THREE.Vector3(pos.x+rx,pos.y+ry,pos.z),R:STECH_R,axis:new THREE.Vector3(0,0,1),mesh:ring,scored:false,flash:0});}
  return g;}
function tryThrustBamboo(tip,prev){if(!arena.bamboo)return false;
  for(const b of arena.bamboo){if(b.cut)continue;
    const dH=Math.hypot(tip.x-b.wx,tip.z-b.wz);
    if(dH<0.13&&tip.y>b.baseY+0.06&&tip.y<b.baseY+b.h-0.03){
      b.wobble=0.5;popText('Bambus — die Spitze dringt nicht durch',TREFFM_BAD_CSS,0,0);bladeRecoil(1.0);arena.thrusting=false;return true;}}
  return false;}
function tryThrustRing(tip,prev){if(!arena.thrustRings||!prev)return;
  for(const r of arena.thrustRings){if(r.scored)continue;const c=r.center,ax=r.axis;
    const d0=prev.clone().sub(c).dot(ax),d1=tip.clone().sub(c).dot(ax);
    if(d0*d1<=0&&Math.abs(d1-d0)>1e-5){const t=d0/(d0-d1),cr=prev.clone().lerp(tip,t);const rad=cr.clone().sub(c).addScaledVector(ax,-cr.clone().sub(c).dot(ax)).length();
      if(rad<r.R-0.035){r.scored=true;r.scoreUntil=clock.getElapsedTime()+1.4;r.flash=1;popText('◎ RING DURCHSTOCHEN — sauber durch die Mitte!',TREFFM_OK_CSS,0,-0.04);fx.freeze=Math.max(fx.freeze,0.06);}
      else if(rad<r.R*1.7&&!r.falling){r.falling=true;r.homePos=r.mesh.position.clone();r.fallVel=new THREE.Vector3((Math.random()-0.5)*0.5+(d1-d0>0?0.3:-0.3),0.3,0.6);r.fallSpin=new THREE.Vector3((Math.random()-0.5)*6,(Math.random()-0.5)*6,(Math.random()-0.5)*7);r.respawnAt=clock.getElapsedTime()+5;popText('Rand erwischt — Ring kippt vom Posten!',WARNM_CSS,0,-0.04);fx.shake=Math.max(fx.shake,0.16);fx.freeze=Math.max(fx.freeze,0.05);}
      else if(rad<r.R*2.8){popText('knapp — '+(rad*100).toFixed(0)+' cm daneben',WARNM_CSS,0,-0.04);}}}}
function updateRings(dt){
  /* V18.491.558 — Lab Stechbahn Ring-Flash RGB ← STECHF_GESETZ fail-soft; Host none (STECHF_VIS). KOTTEM/BLITZM/STECHM/STECH geo/LIFT untouched. */
  const _SFM=(SC&&SC.STECHF_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STECHF_GESETZ)||null;
  const STECHF_R0=(_SFM&&Number.isFinite(_SFM.r0))?_SFM.r0:0.78;
  const STECHF_G0=(_SFM&&Number.isFinite(_SFM.g0))?_SFM.g0:0.64;
  const STECHF_B0=(_SFM&&Number.isFinite(_SFM.b0))?_SFM.b0:0.29;
  const STECHF_FR=(_SFM&&Number.isFinite(_SFM.fr))?_SFM.fr:-0.4;
  const STECHF_FG=(_SFM&&Number.isFinite(_SFM.fg))?_SFM.fg:0.25;
  /* V18.491.563 — Lab Stechbahn Ring-Flash Abklingen ← RINGABKM_GESETZ fail-soft; Host none (RINGABKM_VIS). LEHREM/ABKLINGM/STECHF RGB/LIFT untouched. */
  const _RAK=(SC&&SC.RINGABKM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RINGABKM_GESETZ)||null;
  const RINGABKM_FLASH=(_RAK&&Number.isFinite(_RAK.flash))?_RAK.flash:0.8;
  if(!arena.thrustRings)return;for(const r of arena.thrustRings){
  if(r.scored&&r.scoreUntil&&clock.getElapsedTime()>r.scoreUntil){r.scored=false;r.scoreUntil=0;}
  if(r.falling){r.fallVel.y-=ARENA.g*dt;r.mesh.position.addScaledVector(r.fallVel,dt);
    r.mesh.rotation.x+=r.fallSpin.x*dt;r.mesh.rotation.y+=r.fallSpin.y*dt;r.mesh.rotation.z+=r.fallSpin.z*dt;
    if(r.mesh.position.y<0.16){r.mesh.position.y=0.16;r.fallVel.set(0,0,0);r.fallSpin.multiplyScalar(0.86);}    // am Boden liegen, austrudeln
    if(clock.getElapsedTime()>r.respawnAt){r.falling=false;r.mesh.position.copy(r.homePos);r.mesh.rotation.set(0,0,0);}   // nach 5 s zurück an den Posten
    continue;}
  if(r.flash>0)r.flash=Math.max(0,r.flash-dt*RINGABKM_FLASH);
  if(r.mesh&&r.mesh.material&&r.mesh.material.color&&r.mesh.material.color.setRGB)r.mesh.material.color.setRGB(STECHF_R0+STECHF_FR*r.flash,STECHF_G0+STECHF_FG*r.flash,STECHF_B0);}}
/* V18.491.285 — Lab popinjay ← PAPAGEI_GESETZ fail-soft; Host none (PAPAGEI_VIS). CLOUT / BANNER / LIFT untouched. */
const _PPG=(SC&&SC.PAPAGEI_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PAPAGEI_GESETZ)||null;
const PAPAGEI_POLEH=(_PPG&&Number.isFinite(_PPG.poleH))?_PPG.poleH:4.6;
const PAPAGEI_HITR=(_PPG&&Number.isFinite(_PPG.hitR))?_PPG.hitR:0.36;
/* V18.491.432 — Lab Popinjay-Mast ← RUTE_GESETZ fail-soft; Host none (RUTE_VIS). PAPAGEI poleH/hitR untouched; MAST/STANGE/PFAHL/PFOST/PFYL/BAUM/HOLM/SPINN/DORN/ZIELP/LIFT untouched. */
const _RUT=(SC&&SC.RUTE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RUTE_GESETZ)||null;
const RUTE_R0=(_RUT&&Number.isFinite(_RUT.R0))?_RUT.R0:0.06;
const RUTE_R1=(_RUT&&Number.isFinite(_RUT.R1))?_RUT.R1:0.1;
/* V18.491.433 — Lab Popinjay-Sitzast ← AST_GESETZ fail-soft; Host none (AST_VIS). RUTE/LATTE/KREUZB/QUERB/RIEGEL/SPEICHE/LIFT untouched; y stays poleH. */
const _AST=(SC&&SC.AST_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.AST_GESETZ)||null;
const AST_W=(_AST&&Number.isFinite(_AST.W))?_AST.W:0.55;
const AST_THICK=(_AST&&Number.isFinite(_AST.thick))?_AST.thick:0.05;
/* V18.491.434 — Lab Popinjay-Vogelkörper ← VOGEL_GESETZ fail-soft; Host none (VOGEL_VIS). AST/RUMPF/LEIB/BIRNE/KNOLLE/BUCKEL/KUPPE/GLIED/RAD/LIFT untouched; head/beak/tail left bare. */
const _VOG=(SC&&SC.VOGEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.VOGEL_GESETZ)||null;
const VOGEL_R=(_VOG&&Number.isFinite(_VOG.R))?_VOG.R:0.12;
const VOGEL_SX=(_VOG&&Number.isFinite(_VOG.sx))?_VOG.sx:1.5;
const VOGEL_SY=(_VOG&&Number.isFinite(_VOG.sy))?_VOG.sy:1;
const VOGEL_SZ=(_VOG&&Number.isFinite(_VOG.sz))?_VOG.sz:0.9;
/* V18.491.435 — Lab Popinjay-Vogelkopf ← KUKEN_GESETZ fail-soft; Host none (KUKEN_VIS). VOGEL/KOPF/SCHAEDEL/HAUBE/BIRNE/KNOLLE/BUCKEL/KUPPE/SPEICHE/LIFT untouched; beak/tail left bare. */
const _KUK=(SC&&SC.KUKEN_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KUKEN_GESETZ)||null;
const KUKEN_R=(_KUK&&Number.isFinite(_KUK.R))?_KUK.R:0.075;
const KUKEN_X=(_KUK&&Number.isFinite(_KUK.x))?_KUK.x:0.18;
const KUKEN_Y=(_KUK&&Number.isFinite(_KUK.y))?_KUK.y:0.08;
/* V18.491.436 — Lab Popinjay-Schnabel ← SCHNABEL_GESETZ fail-soft; Host none (SCHNABEL_VIS). KUKEN/VOGEL/KEGEL/DORN/SPITZE/RUTE/LIFT untouched; tail/wings left bare. */
const _SNB=(SC&&SC.SCHNABEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHNABEL_GESETZ)||null;
const SCHNABEL_R=(_SNB&&Number.isFinite(_SNB.R))?_SNB.R:0.03;
const SCHNABEL_H=(_SNB&&Number.isFinite(_SNB.H))?_SNB.H:0.1;
const SCHNABEL_X=(_SNB&&Number.isFinite(_SNB.x))?_SNB.x:0.27;
const SCHNABEL_Y=(_SNB&&Number.isFinite(_SNB.y))?_SNB.y:0.08;
/* V18.491.437 — Lab Popinjay-Schwanz ← SCHWANZ_GESETZ fail-soft; Host none (SCHWANZ_VIS). SCHNABEL/KUKEN/VOGEL/KEGEL/BUCKEL/ZIPFEL/LIFT untouched; wings left bare. */
const _SWZ=(SC&&SC.SCHWANZ_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SCHWANZ_GESETZ)||null;
const SCHWANZ_R=(_SWZ&&Number.isFinite(_SWZ.R))?_SWZ.R:0.07;
const SCHWANZ_H=(_SWZ&&Number.isFinite(_SWZ.H))?_SWZ.H:0.34;
const SCHWANZ_X=(_SWZ&&Number.isFinite(_SWZ.x))?_SWZ.x:-0.24;
/* V18.491.438 — Lab Popinjay-Flügel ← FLUEGEL_GESETZ fail-soft; Host none (FLUEGEL_VIS). SCHWANZ/VOGEL/AST/QUERB/SPEICHE/LIFT untouched; restY left bare. */
const _FLU=(SC&&SC.FLUEGEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.FLUEGEL_GESETZ)||null;
const FLUEGEL_W=(_FLU&&Number.isFinite(_FLU.W))?_FLU.W:0.12;
const FLUEGEL_H=(_FLU&&Number.isFinite(_FLU.H))?_FLU.H:0.025;
const FLUEGEL_D=(_FLU&&Number.isFinite(_FLU.D))?_FLU.D:0.2;
const FLUEGEL_Y=(_FLU&&Number.isFinite(_FLU.y))?_FLU.y:0.03;
const FLUEGEL_ZOFF=(_FLU&&Number.isFinite(_FLU.zOff))?_FLU.zOff:0.12;
/* V18.491.439 — Lab Popinjay-Ruhehöhe ← RAST_GESETZ fail-soft; Host none (RAST_VIS). FLUEGEL/PAPAGEI/AST/RUTE/ANSATZ/GELENK/SPINN/RUHE/LIFT untouched; bird+base same yOff. */
const _RST=(SC&&SC.RAST_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RAST_GESETZ)||null;
const RAST_YOFF=(_RST&&Number.isFinite(_RST.yOff))?_RST.yOff:0.13;
function buildPopinjay(pos){const g=new THREE.Group();g.position.copy(pos);
  /* V18.491.552 — Lab Popinjay/Papagei Mats ← PAPAGEIM_GESETZ fail-soft; Host none (PAPAGEIM_VIS). STECHM/PAPAGEI geo/ENTEM/LIFT untouched. */
  const _PYM=(SC&&SC.PAPAGEIM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PAPAGEIM_GESETZ)||null;
  const PAPAGEIM_WOOD=(_PYM&&Number.isFinite(_PYM.wood))?_PYM.wood:0x4a3520;
  const PAPAGEIM_WOODR=(_PYM&&Number.isFinite(_PYM.woodR))?_PYM.woodR:0.9;
  const PAPAGEIM_BODY=(_PYM&&Number.isFinite(_PYM.body))?_PYM.body:0x2f7a45;
  const PAPAGEIM_BODYR=(_PYM&&Number.isFinite(_PYM.bodyR))?_PYM.bodyR:0.55;
  const PAPAGEIM_HEAD=(_PYM&&Number.isFinite(_PYM.head))?_PYM.head:0xc83828;
  const PAPAGEIM_HEADR=(_PYM&&Number.isFinite(_PYM.headR))?_PYM.headR:0.55;
  const PAPAGEIM_BEAK=(_PYM&&Number.isFinite(_PYM.beak))?_PYM.beak:0xe0a830;
  const PAPAGEIM_BEAKR=(_PYM&&Number.isFinite(_PYM.beakR))?_PYM.beakR:0.5;
  const PAPAGEIM_TAIL=(_PYM&&Number.isFinite(_PYM.tail))?_PYM.tail:0x245a35;
  const PAPAGEIM_TAILR=(_PYM&&Number.isFinite(_PYM.tailR))?_PYM.tailR:0.55;
  const PAPAGEIM_WING=(_PYM&&Number.isFinite(_PYM.wing))?_PYM.wing:0x3f8a55;
  const PAPAGEIM_WINGR=(_PYM&&Number.isFinite(_PYM.wingR))?_PYM.wingR:0.55;
  const wood=matCol(PAPAGEIM_WOOD,PAPAGEIM_WOODR,0);const poleH=PAPAGEI_POLEH;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(RUTE_R0,RUTE_R1,poleH,10),wood);pole.position.y=poleH/2;pole.castShadow=true;g.add(pole);
  const perch=new THREE.Mesh(new THREE.BoxGeometry(AST_W,AST_THICK,AST_THICK),wood);perch.position.y=poleH;g.add(perch);
  const bird=new THREE.Group();const restY=poleH+RAST_YOFF;bird.position.set(0,restY,0);g.add(bird);
  const body=new THREE.Mesh(new THREE.SphereGeometry(VOGEL_R,12,10),matCol(PAPAGEIM_BODY,PAPAGEIM_BODYR,0));body.scale.set(VOGEL_SX,VOGEL_SY,VOGEL_SZ);bird.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(KUKEN_R,10,8),matCol(PAPAGEIM_HEAD,PAPAGEIM_HEADR,0));head.position.set(KUKEN_X,KUKEN_Y,0);bird.add(head);
  const beak=new THREE.Mesh(new THREE.ConeGeometry(SCHNABEL_R,SCHNABEL_H,6),matCol(PAPAGEIM_BEAK,PAPAGEIM_BEAKR,0));beak.rotation.z=-Math.PI/2;beak.position.set(SCHNABEL_X,SCHNABEL_Y,0);bird.add(beak);
  const tail=new THREE.Mesh(new THREE.ConeGeometry(SCHWANZ_R,SCHWANZ_H,6),matCol(PAPAGEIM_TAIL,PAPAGEIM_TAILR,0));tail.rotation.z=Math.PI/2;tail.position.set(SCHWANZ_X,0,0);bird.add(tail);
  for(const dz of [FLUEGEL_ZOFF,-FLUEGEL_ZOFF]){const wing=new THREE.Mesh(new THREE.BoxGeometry(FLUEGEL_W,FLUEGEL_H,FLUEGEL_D),matCol(PAPAGEIM_WING,PAPAGEIM_WINGR,0));wing.position.set(0,FLUEGEL_Y,dz);bird.add(wing);}
  arena.popinjays=arena.popinjays||[];arena.popinjays.push({grp:g,bird,base:new THREE.Vector3(pos.x,pos.y+restY,pos.z),restY,struck:false,fallV:0,respawnAt:0});return g;}
function updatePopinjay(dt){if(!arena.popinjays)return;for(const P2 of arena.popinjays){if(!P2.bird)continue;
  if(P2.struck){P2.fallV-=9.8*dt;P2.bird.position.y+=P2.fallV*dt;P2.bird.rotation.z+=dt*5;P2.bird.position.x+=dt*0.4;
    if(P2.bird.position.y<0.3&&clock.getElapsedTime()>P2.respawnAt){P2.struck=false;P2.fallV=0;P2.bird.position.set(0,P2.restY,0);P2.bird.rotation.set(0,0,0);}}}}
/* V18.491.289 — Lab dojo court ← DOJO_GESETZ fail-soft; Host none (DOJO_VIS). PERGOLA shade / PELL / LIFT untouched. */
const _DJG=(SC&&SC.DOJO_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DOJO_GESETZ)||null;
const DOJO_POSTH=(_DJG&&Number.isFinite(_DJG.postH))?_DJG.postH:3.3;
const DOJO_X0=(_DJG&&Number.isFinite(_DJG.x0))?_DJG.x0:0.2;
const DOJO_X1=(_DJG&&Number.isFinite(_DJG.x1))?_DJG.x1:6.9;
const DOJO_Z0=(_DJG&&Number.isFinite(_DJG.z0))?_DJG.z0:-0.4;
const DOJO_Z1=(_DJG&&Number.isFinite(_DJG.z1))?_DJG.z1:6.5;
const DOJO_WALLH=(_DJG&&Number.isFinite(_DJG.wallH))?_DJG.wallH:2.7;
/* V18.491.316 — Lab dojo roof edge beams ← TRAEGER_GESETZ fail-soft; Host none (TRAEGER_VIS). RAND/DOJO layout/PERGOLA/LIFT untouched. */
const _TRAG=(SC&&SC.TRAEGER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TRAEGER_GESETZ)||null;
const TRAEGER_LX=(_TRAG&&Number.isFinite(_TRAG.Lx))?_TRAG.Lx:7.1;
const TRAEGER_LZ=(_TRAG&&Number.isFinite(_TRAG.Lz))?_TRAG.Lz:7.3;
const TRAEGER_H=(_TRAG&&Number.isFinite(_TRAG.H))?_TRAG.H:0.15;
const TRAEGER_T=(_TRAG&&Number.isFinite(_TRAG.T))?_TRAG.T:0.16;
const TRAEGER_X=(_TRAG&&Number.isFinite(_TRAG.x))?_TRAG.x:3.55;
const TRAEGER_Z=(_TRAG&&Number.isFinite(_TRAG.z))?_TRAG.z:3.05;
const TRAEGER_Y=(_TRAG&&Number.isFinite(_TRAG.y))?_TRAG.y:3.25;
/* V18.491.317 — Lab dojo roof rafters ← LATTE_GESETZ fail-soft; Host none (LATTE_VIS). SPARREN/TRAEGER/DOJO/LIFT untouched. */
const _LATG=(SC&&SC.LATTE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.LATTE_GESETZ)||null;
const LATTE_N=(_LATG&&Number.isFinite(_LATG.n))?_LATG.n:9;
const LATTE_Z0=(_LATG&&Number.isFinite(_LATG.z0))?_LATG.z0:-0.4;
const LATTE_SPAN=(_LATG&&Number.isFinite(_LATG.span))?_LATG.span:6.9;
const LATTE_L=(_LATG&&Number.isFinite(_LATG.L))?_LATG.L:7.1;
const LATTE_H=(_LATG&&Number.isFinite(_LATG.H))?_LATG.H:0.05;
const LATTE_T=(_LATG&&Number.isFinite(_LATG.T))?_LATG.T:0.06;
const LATTE_X=(_LATG&&Number.isFinite(_LATG.x))?_LATG.x:3.55;
const LATTE_Y=(_LATG&&Number.isFinite(_LATG.y))?_LATG.y:3.36;
/* V18.491.318 — Lab dojo corner posts ← STEHER_GESETZ fail-soft; Host none (STEHER_VIS). PFOSTEN/STUTZE/DOJO.postH/LATTE/LIFT untouched. */
const _STEHG=(SC&&SC.STEHER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STEHER_GESETZ)||null;
const STEHER_R0=(_STEHG&&Number.isFinite(_STEHG.R0))?_STEHG.R0:0.085;
const STEHER_R1=(_STEHG&&Number.isFinite(_STEHG.R1))?_STEHG.R1:0.11;
/* V18.491.319 — Lab dojo knee braces ← KNIE_GESETZ fail-soft; Host none (KNIE_VIS). STUTZE/STEHER/GALGEN L1620 brace/LIFT untouched. */
const _KNIG=(SC&&SC.KNIE_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.KNIE_GESETZ)||null;
const KNIE_W=(_KNIG&&Number.isFinite(_KNIG.W))?_KNIG.W:0.5;
const KNIE_H=(_KNIG&&Number.isFinite(_KNIG.H))?_KNIG.H:0.5;
const KNIE_D=(_KNIG&&Number.isFinite(_KNIG.D))?_KNIG.D:0.08;
const KNIE_OFF=(_KNIG&&Number.isFinite(_KNIG.off))?_KNIG.off:0.32;
const KNIE_Y=(_KNIG&&Number.isFinite(_KNIG.y))?_KNIG.y:2.95;
const KNIE_MID=(_KNIG&&Number.isFinite(_KNIG.mid))?_KNIG.mid:3.5;
/* V18.491.320 — Lab dojo paper lanterns ← PAPIER_GESETZ fail-soft; Host none (PAPIER_VIS). LEUCHTE/LATERNE/KNIE/sill/LIFT untouched. */
const _PAPG=(SC&&SC.PAPIER_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PAPIER_GESETZ)||null;
const PAPIER_R=(_PAPG&&Number.isFinite(_PAPG.R))?_PAPG.R:0.12;
const PAPIER_H=(_PAPG&&Number.isFinite(_PAPG.H))?_PAPG.H:0.26;
const PAPIER_Y=(_PAPG&&Number.isFinite(_PAPG.y))?_PAPG.y:2.78;
const PAPIER_CAPR0=(_PAPG&&Number.isFinite(_PAPG.capR0))?_PAPG.capR0:0.04;
const PAPIER_CAPR1=(_PAPG&&Number.isFinite(_PAPG.capR1))?_PAPG.capR1:0.13;
const PAPIER_CAPH=(_PAPG&&Number.isFinite(_PAPG.capH))?_PAPG.capH:0.05;
const PAPIER_CAPY=(_PAPG&&Number.isFinite(_PAPG.capY))?_PAPG.capY:2.93;
const PAPIER_STRR=(_PAPG&&Number.isFinite(_PAPG.strR))?_PAPG.strR:0.005;
const PAPIER_STRH=(_PAPG&&Number.isFinite(_PAPG.strH))?_PAPG.strH:0.34;
const PAPIER_STRY=(_PAPG&&Number.isFinite(_PAPG.strY))?_PAPG.strY:3.12;
const PAPIER_CORNERS=(Array.isArray(_PAPG&&_PAPG.corners)&&_PAPG.corners.length)?_PAPG.corners:[[1.1,0.1],[6.0,0.1],[1.1,6.0],[6.0,6.0]];
/* V18.491.328 — Lab dojo back wall panel ← RUECK_GESETZ fail-soft; Host none (RUECK_VIS). WAND/DOJO.wallH/studs/sill/PAPIER/LIFT untouched. */
const _RUEG=(SC&&SC.RUECK_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RUECK_GESETZ)||null;
const RUECK_T=(_RUEG&&Number.isFinite(_RUEG.T))?_RUEG.T:0.18;
const RUECK_L=(_RUEG&&Number.isFinite(_RUEG.L))?_RUEG.L:9.4;
const RUECK_X=(_RUEG&&Number.isFinite(_RUEG.x))?_RUEG.x:-3.4;
const RUECK_Z=(_RUEG&&Number.isFinite(_RUEG.z))?_RUEG.z:2.6;
/* V18.491.329 — Lab dojo wall studs ← STIEL_GESETZ fail-soft; Host none (STIEL_VIS). RUECK/LATTE/GASSE/sill/LIFT untouched. */
const _STIG=(SC&&SC.STIEL_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.STIEL_GESETZ)||null;
const STIEL_W=(_STIG&&Number.isFinite(_STIG.W))?_STIG.W:0.22;
const STIEL_T=(_STIG&&Number.isFinite(_STIG.T))?_STIG.T:0.1;
const STIEL_N=(_STIG&&Number.isFinite(_STIG.n))?_STIG.n:6;
const STIEL_STEP=(_STIG&&Number.isFinite(_STIG.step))?_STIG.step:1.8;
const STIEL_X=(_STIG&&Number.isFinite(_STIG.x))?_STIG.x:-3.32;
const STIEL_ZMID=(_STIG&&Number.isFinite(_STIG.zMid))?_STIG.zMid:2.6;
const STIEL_HALF=(_STIG&&Number.isFinite(_STIG.half))?_STIG.half:4.5;
/* V18.491.330 — Lab dojo sill ← SIMS_GESETZ fail-soft; Host none (SIMS_VIS). SCHWELLE/PAPIER/RUECK/STIEL/LIFT untouched (y=2.78 / L=9.4 coincidences kept separate). */
const _SIMG=(SC&&SC.SIMS_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SIMS_GESETZ)||null;
const SIMS_W=(_SIMG&&Number.isFinite(_SIMG.W))?_SIMG.W:0.4;
const SIMS_H=(_SIMG&&Number.isFinite(_SIMG.H))?_SIMG.H:0.12;
const SIMS_L=(_SIMG&&Number.isFinite(_SIMG.L))?_SIMG.L:9.4;
const SIMS_X=(_SIMG&&Number.isFinite(_SIMG.x))?_SIMG.x:-3.35;
const SIMS_Y=(_SIMG&&Number.isFinite(_SIMG.y))?_SIMG.y:2.78;
const SIMS_Z=(_SIMG&&Number.isFinite(_SIMG.z))?_SIMG.z:2.6;
function buildDojo(){const g=new THREE.Group();
  /* V18.491.553 — Lab Dojo Mats ← DOJOM_GESETZ fail-soft; Host none (DOJOM_VIS). PAPAGEIM/PERGOLAM/DOJO geo/LIFT untouched. */
  const _DJM=(SC&&SC.DOJOM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DOJOM_GESETZ)||null;
  const DOJOM_WOOD=(_DJM&&Number.isFinite(_DJM.wood))?_DJM.wood:0x4a3522;
  const DOJOM_WOODR=(_DJM&&Number.isFinite(_DJM.woodR))?_DJM.woodR:0.9;
  const DOJOM_DARK=(_DJM&&Number.isFinite(_DJM.dark))?_DJM.dark:0x33251a;
  const DOJOM_DARKR=(_DJM&&Number.isFinite(_DJM.darkR))?_DJM.darkR:0.92;
  const DOJOM_PAPER=(_DJM&&Number.isFinite(_DJM.paper))?_DJM.paper:0xd6c596;
  const DOJOM_PAPERR=(_DJM&&Number.isFinite(_DJM.paperR))?_DJM.paperR:0.55;
  const DOJOM_WALL=(_DJM&&Number.isFinite(_DJM.wall))?_DJM.wall:0x281d12;
  const DOJOM_WALLR=(_DJM&&Number.isFinite(_DJM.wallR))?_DJM.wallR:0.95;
  const wood=matCol(DOJOM_WOOD,DOJOM_WOODR,0), darkwood=matCol(DOJOM_DARK,DOJOM_DARKR,0), paper=matCol(DOJOM_PAPER,DOJOM_PAPERR,0);
  const cs=[[DOJO_X0,DOJO_Z0],[DOJO_X1,DOJO_Z0],[DOJO_X0,DOJO_Z1],[DOJO_X1,DOJO_Z1]];                                                  // Pergola-Eckpfosten um den Übungshof
  for(const [cx,cz] of cs){const post=new THREE.Mesh(new THREE.CylinderGeometry(STEHER_R0,STEHER_R1,DOJO_POSTH,10),wood);post.position.set(cx,DOJO_POSTH/2,cz);post.castShadow=true;g.add(post);
    const brace=new THREE.Mesh(new THREE.BoxGeometry(KNIE_W,KNIE_H,KNIE_D),darkwood);brace.position.set(cx+(cx<KNIE_MID?KNIE_OFF:-KNIE_OFF),KNIE_Y,cz);g.add(brace);}
  for(const cz of [DOJO_Z0,DOJO_Z1]){const beam=new THREE.Mesh(new THREE.BoxGeometry(TRAEGER_LX,TRAEGER_H,TRAEGER_T),darkwood);beam.position.set(TRAEGER_X,TRAEGER_Y,cz);g.add(beam);}
  for(const cx of [DOJO_X0,DOJO_X1]){const beam=new THREE.Mesh(new THREE.BoxGeometry(TRAEGER_T,TRAEGER_H,TRAEGER_LZ),darkwood);beam.position.set(cx,TRAEGER_Y,TRAEGER_Z);g.add(beam);}
  for(let i=0;i<=LATTE_N;i++){const z=LATTE_Z0+i*LATTE_SPAN/LATTE_N;const r=new THREE.Mesh(new THREE.BoxGeometry(LATTE_L,LATTE_H,LATTE_T),wood);r.position.set(LATTE_X,LATTE_Y,z);g.add(r);}   // Dachsparren → Tiefe/Schattenmuster
  for(const [lx,lz] of PAPIER_CORNERS){                                       // Papierlaternen
    const lan=new THREE.Mesh(new THREE.CylinderGeometry(PAPIER_R,PAPIER_R,PAPIER_H,12),paper);lan.position.set(lx,PAPIER_Y,lz);g.add(lan);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(PAPIER_CAPR0,PAPIER_CAPR1,PAPIER_CAPH,12),darkwood);cap.position.set(lx,PAPIER_CAPY,lz);g.add(cap);
    const str=new THREE.Mesh(new THREE.CylinderGeometry(PAPIER_STRR,PAPIER_STRR,PAPIER_STRH,4),darkwood);str.position.set(lx,PAPIER_STRY,lz);g.add(str);}
  const wall=new THREE.Mesh(new THREE.BoxGeometry(RUECK_T,DOJO_WALLH,RUECK_L),matCol(DOJOM_WALL,DOJOM_WALLR,0));wall.position.set(RUECK_X,DOJO_WALLH/2,RUECK_Z);g.add(wall);   // Rückwand hinter Spawn
  for(let i=0;i<STIEL_N;i++){const beam=new THREE.Mesh(new THREE.BoxGeometry(STIEL_W,DOJO_WALLH,STIEL_T),wood);beam.position.set(STIEL_X,DOJO_WALLH/2,STIEL_ZMID-STIEL_HALF+i*STIEL_STEP);g.add(beam);}
  const sill=new THREE.Mesh(new THREE.BoxGeometry(SIMS_W,SIMS_H,SIMS_L),darkwood);sill.position.set(SIMS_X,SIMS_Y,SIMS_Z);g.add(sill);
  return g;}
/* V18.491.476 — Lab Arena Fog dens ← DUNSTA_GESETZ fail-soft; Host none (DUNSTA_VIS). DUNST/PATINA/SCHLEIER/LIFT untouched; lights/bloom left bare. */
const _DUA=(SC&&SC.DUNSTA_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.DUNSTA_GESETZ)||null;
const DUNSTA_DENS=(_DUA&&Number.isFinite(_DUA.dens))?_DUA.dens:0.006;
function arenaEnter(){if(arena.active)return;arena.active=true;
  weapon.visible=false;controls.enabled=false;/* V18.491.565 — WIRE arena fog color → HINTER_COLOR (HINTER_GESETZ; dens stays DUNSTA). */
  scene.fog=new THREE.FogExp2(HINTER_COLOR,DUNSTA_DENS);
  arena.group=new THREE.Group();scene.add(arena.group);arena.group.add(buildGround());
  arena.camSaved={pos:cam.position.clone(),tgt:controls.target.clone(),fov:cam.fov};
  arena.player.set(0,0,0);arena.yaw=0;arena.pitch=0;fx.fov=fx.fovT=_bogenFov().ruhe;cam.fov=fx.fov;/* V18.491.139 fovRuhe fail-soft */arena.arrows.length=0;arena.stuck.length=0;arena.fallingBamboo=[];
  arena.swinging=arena.thrusting=false;arena.holdView=false;arena.ready=0;arena.sw={yaw:0,pitch:0,reach:0};arena.swRoll=0;arena._rollRend=0;arena._aimF=0;arena._edgeAlign=1;arena.drawFrac=0;arena.drawing=false;arena._wantAim=false;arena.raise=0;arena.prevTip=null;arena.swP=0;arena.swY=0;arena.swLay=0;arena._prevSwY=0;arena._pressing=false;arena._dragMag=0;arena.lungeT=0;arena.mStats={hits:0,dmg:0};arena.scars=[];arena.stam=1;arena._prevSwP=0;arena._restT=0;
  arena.trail.mesh=null;arena.trail.pts=[];
  arena.popinjays=[];
  arena.group.add(buildDojo());                                                     // Struktur: Pergolen, Rückwand, Banner, Laternen, Steinweg
  arena.group.add(buildTable(new THREE.Vector3(WAFFTISCHPOS_X,WAFFTISCHPOS_Y,WAFFTISCHPOS_Z)));                          // Waffentisch (am Spawn)
  // — Waffenhof (+z): aktiver Kampf —
  arena.dummy=buildDummy();arena.dummy.position.set(PELLPOS_X,PELLPOS_Y,PELLPOS_Z);arena.group.add(arena.dummy);    // Pell
  arena.group.add(buildThrustRings(new THREE.Vector3(STECHPOS_X,STECHPOS_Y,STECHPOS_Z)));                    // Stechringe (running at the ring)
  arena.group.add(buildQuintain(new THREE.Vector3(QUINTPOS_X,QUINTPOS_Y,QUINTPOS_Z)));                      // Quintane — frei, Raum zum Ausweichen
  arena.pendulum=null;arena.group.add(buildPendulumBall(new THREE.Vector3(PENDELPOS_X,PENDELPOS_Y,PENDELPOS_Z)));   // Pendel-Kugel: triff sie, weich der Rückkehr aus
  arena.spintree=null;arena.group.add(buildSpinTree(new THREE.Vector3(DREHPOS_X,DREHPOS_Y,DREHPOS_Z)));         // Drehbaum: vier Arme im Rhythmus schlagen
  arena.springPell=null;arena.group.add(buildSpringPell(new THREE.Vector3(FEDERPOS_X,FEDERPOS_Y,FEDERPOS_Z)));          // Federpfahl: im Pell-Hof, Kopf auf Hiebhöhe
  arena.sequence=null;arena.group.add(buildSequence(new THREE.Vector3(SEQPOS_X,SEQPOS_Y,SEQPOS_Z)));            // Trefferfolge: freier Bogen im Nordwesten
  arena.charger=null;arena.group.add(buildCharger(new THREE.Vector3(CHARGEPOS_X,CHARGEPOS_Y,CHARGEPOS_Z)));               // Streitpuppe: schläft, mit [E] wecken — dann greift sie an
  arena.gauntlet=null;arena.group.add(buildGauntlet(new THREE.Vector3(GASSEPOS_X,GASSEPOS_Y,GASSEPOS_Z)));            // Pendel-Gasse: Korridor im Norden
  // — Schnitthof (−z): Schnittproben —
  arena.group.add(buildBamboo(new THREE.Vector3(BAMBUSPOS_X,BAMBUSPOS_Y,BAMBUSPOS_Z)));                        // Bambus-Stand
  arena.group.add(buildCuttingLane(new THREE.Vector3(SCHNITTPOS_X,SCHNITTPOS_Y,SCHNITTPOS_Z)));                   // Schnittgasse (Zickzack)
  arena.group.add(buildSwingTatami(new THREE.Vector3(TATAMIPOS_X,TATAMIPOS_Y,TATAMIPOS_Z)));                  // schwingende Tatami
  arena.armored=null;arena.group.add(buildArmoredDummy(new THREE.Vector3(HARNISCHPOS_X,HARNISCHPOS_Y,HARNISCHPOS_Z)));
  arena.knightArenas=null;arena.group.add(buildKnightArena(new THREE.Vector3(RITTERPOS_ARMX,RITTERPOS_ARMY,RITTERPOS_ARMZ),3,true));arena.group.add(buildKnightArena(new THREE.Vector3(RITTERPOS_BAREX,RITTERPOS_BAREY,RITTERPOS_BAREZ),2,false));               // Harnisch-Puppe: Schnitt gleitet ab — Stich in die Fuge oder stumpfe Wucht
  // — Schießbahn (+x) —
  buildRange();
  arena.group.add(buildTorii(TORIIPOS_X,TORIIPOS_Z));                                              // Torii am Bahneingang
  arena.group.add(buildCarnival(new THREE.Vector3(KIRMESPOS_X,KIRMESPOS_Y,KIRMESPOS_Z)));                          // Kirmes-Enten (Bahnende)
  for(const pp of PAPAGEIPOS_SPOTS) arena.group.add(buildPopinjay(new THREE.Vector3(pp[0],0,pp[1])));   // Papagei-Feld
  arena.wand=null;arena.group.add(buildWand(new THREE.Vector3(WANDPOS_X,WANDPOS_Y,WANDPOS_Z)));                            // Wand-Schiessen: gestreifte Rute mit Wimpel, Präzision
  arena.clout=null;arena.group.add(buildClout(new THREE.Vector3(CLOUTPOS_X,CLOUTPOS_Y,CLOUTPOS_Z)));                           // Clout: fernes Bodenziel, triff die Wurfparabel
  arena.clay=null;arena.group.add(buildClayThrower(new THREE.Vector3(CLAYPOS_X,CLAYPOS_Y,CLAYPOS_Z)));                     // Wurfscheibe: Tontaube steigt — triff sie in der Luft
  arena.swingTgt=null;arena.group.add(buildSwingTarget(new THREE.Vector3(SWINGPOS_X,SWINGPOS_Y,SWINGPOS_Z)));                  // Pendelziel: schwingt quer — vorhalten
  // ── Geräte-Register: eine Wahrheit für Update + Nahkampf + Pfeil. Neues Gerät = eine Zeile. ──
  arena.devices=[
    {update:updateQuintain, melee:tryHitQuintain},
    {update:updatePendulum, melee:tryHitPendulum},
    {update:updateSpinTree, melee:tryHitSpinTree},
    {update:updateCharger,  melee:tryHitCharger,  arrow:tryArrowCharger},
    {update:updateSpringPell,melee:tryHitSpringPell},
    {update:updateSequence, melee:tryHitSequence},
    {update:updateGauntlet, melee:tryHitGauntlet},
    {update:updateArmored,  melee:tryHitArmored},
    {update:updateKnights,  melee:tryHitKnight},
    {update:updateRings},
    {update:updatePopinjay},
    {update:updateWand},
    {update:updateClay,     arrow:tryArrowClay},
    {update:updateSwingTarget,arrow:tryArrowSwing},
  ];
  equipWeapon(currentGattung);ensureTrailMesh();placeViewModel(0);
  document.getElementById('arena-ui').style.display='block';
  ['lehren','ctl','leg','hint','ring-info'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';});
  document.getElementById('arena-toggle').textContent='← Werkstatt';hudHint();updateHUD();}
function arenaExit(){if(!arena.active)return;arena.active=false;controls.enabled=true;weapon.visible=true;
  if(document.pointerLockElement)document.exitPointerLock();/* V18.491.565 — WIRE restore fog color → HINTER_COLOR (HINTER_GESETZ; dens stays DUNST). */
  scene.fog=new THREE.FogExp2(HINTER_COLOR,DUNST_DENS);
  if(arena.group){clear(arena.group);arena.group=null;}arena.arrows.length=0;arena.stuck.length=0;arena.trail.mesh=null;arena.trail.pts=[];
  arena.vm=arena.dummy=arena.target=arena.vmWeapon=arena.arm=null;arena.swinging=arena.thrusting=false;arena.drawing=false;
  if(arena.camSaved){cam.position.copy(arena.camSaved.pos);controls.target.copy(arena.camSaved.tgt);cam.fov=arena.camSaved.fov;cam.updateProjectionMatrix();}
  ['lehren','ctl','leg','hint'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='';});
  document.getElementById('arena-ui').style.display='none';document.getElementById('arena-toggle').textContent='Prüfstand ⚔';}
function arenaToggle(){arena.active?arenaExit():arenaEnter();}
function toggleHand(){arena.right=!arena.right;computeBaseQuat();popText(arena.right?'rechtshändig':'linkshändig',NEUTM_CSS,0,-0.1);}

function updateMovement(dt){const k=arena.keys,B=camBasis();let f=0,r=0;
  if(k.w)f+=1;if(k.s)f-=1;if(k.d)r+=1;if(k.a)r-=1;
  arena._vel=arena._vel||new THREE.Vector3();
  arena._crouchY=lerp(arena._crouchY||0,k.ctrl?0.42:0,clamp(dt*10,0,1));                                  // STRG: weich ducken
  const want=new THREE.Vector3();if(f||r){want.copy(B.fwdG).multiplyScalar(f).addScaledVector(B.right,r);if(want.lengthSq()>0)want.normalize();}
  const spd=k.ctrl?0.5:(k.shift?1.7:1.0);arena._sprinting=(spd>1.1&&want.lengthSq()>0.5);                 // Sprint in JEDE Richtung, geduckt langsamer
  const target=want.lengthSq()>0?want.clone().multiplyScalar(ARENA.walk*spd):new THREE.Vector3();
  arena._vel.lerp(target,clamp(dt*(want.lengthSq()>0?9:13),0,1));                                         // Trägheit: anlaufen / abbremsen
  if(arena._vel.length()<0.03&&want.lengthSq()===0){arena._vel.set(0,0,0);arena.bob*=0.9;return;}
  arena.player.addScaledVector(arena._vel,dt);
  const R=Math.hypot(arena.player.x,arena.player.z);if(R>30)arena.player.multiplyScalar(30/R);
  if(arena.dummy){const dp=arena.dummy.position,d=arena.player.clone().setY(0).sub(dp.clone().setY(0));if(d.length()<0.55){d.setLength(0.55);arena.player.x=dp.x+d.x;arena.player.z=dp.z+d.z;}}
  arena.bob=Math.min(1,arena.bob+dt*4*(arena._sprinting?1.6:1)*(k.ctrl?0.6:1));}

// — NAHKAMPF: Schwung (links, Maus führt) ODER Stich (rechts, Arm stößt vor) —
function aimDummy(){if(!arena.dummy)return null;_RC.setFromCamera({x:0,y:0},cam);const hits=_RC.intersectObject(arena.dummy,true);
  if(!hits.length)return null;const d=hits[0].distance;if(d>1.9)return null;const y=hits[0].point.y;
  // ZONE_PICK.lab = "mesh-ray" — Feel .117; intersectObject Fechtpuppe + nearest Y; zOffFrac = dummy geo.
  // Zone aus userData.zones (ARENA.zonen→absolut); nearest |y−zn.y|. Kein Fuß-Literal — Füße→Bein.
  const zones=(arena.dummy.userData&&arena.dummy.userData.zones)||[];
  const postH=(arena.dummy.userData&&arena.dummy.userData.postH)||1.65;
  let best=null,bestD=Infinity;
  for(const zn of zones){const dd=Math.abs(y-zn.y);if(dd<bestD){bestD=dd;best=zn;}}
  const z=best?{n:best.name,m:best.dmgMul}:{n:'Körper',m:(SC&&SC.zoneMulAt)?SC.zoneMulAt(y/postH):1};
  const nrm=hits[0].face?hits[0].face.normal.clone().transformDirection(hits[0].object.matrixWorld).normalize():new THREE.Vector3(1,0,0);
  return {zone:z,dist:d,y,point:hits[0].point.clone(),normal:nrm};}
function startThrust(){arena.thrusting=true;arena.lungeT=0;arena.swP=0;arena.swY=0;arena.swLay=0;arena.prevTip=null;arena.ready=Math.max(arena.ready,0.6);}  // Stich aus dem Klick-Impuls (Arm engagiert)
function meleeSwingUpdate(realDt,dt){const m=measure(P),S=m.S;arena._m=m;
  // Bereitschaft (Auftrag): Halten = zielen; der Schwung startet NUR noch aus dem Zug (>12px, mousemove) — kein Zeit-Auto-Schwung mehr, der die Klinge an den Bauch legte
  if(arena.thrusting){arena.lungeT=(arena.lungeT||0)+realDt;if(arena.lungeT>=TL){arena.thrusting=false;arena.cooldown=Math.max(arena.cooldown,0.10);}
    const u=clamp((arena.lungeT||0)/TL,0,1);arena.sw.reach=Math.sin(u*Math.PI)*REACH_AMP;}                                          // Ausfall: 0→reachAmp→0 (vor + zurück)
  else arena.sw.reach=lerp(arena.sw.reach||0,0,clamp(realDt*12,0,1));
  arena._aimF=lerp(arena._aimF||0,(arena._pressing&&!arena.swinging&&!arena.thrusting)?1:0,clamp(realDt*((arena._pressing&&!arena.swinging)?10:14),0,1));   // Bereitschaft: Spitze zur Blicklinie (zielen), fällt beim Schwung schnell ab
  const IS=Math.max(FEEL.iMin,(m.Inorm||0.1)*m.M*S.L*S.L),drag=1+Math.pow(IS/FEEL.iRef,FEEL.pow)*FEEL.dragAmp,sw=arena.sw;const stamF=clamp((arena.stam!=null?arena.stam:1)*1.5,0.35,1);   // V18.491.155 FEEL iMin/iRef/pow/dragAmp · Trägheit: I/iRef normiert (Schwert≈1), drag 1.0 leicht → 2.5 Vorschlaghammer
  const gain=(arena.holdView?0.0140:0.0090)/Math.sqrt(drag)*stamF;               // Blick halten = aus dem Körper schlagen: voller Klingenweg trotz fixiertem Auge
  if(arena.swinging){ arena.swP=(arena.swP||0)+(-arena._mdy*gain); arena.swY=(arena.swY||0)+(-arena._mdx*gain);
    arena.swP=clamp(arena.swP,-1.95,0.7); arena.swY=clamp(arena.swY,-1.6,1.6); }
  else if(!arena.holdView){ arena.swP=lerp(arena.swP||0,0,clamp(realDt*9,0,1)); arena.swY=lerp(arena.swY||0,0,clamp(realDt*9,0,1)); }   // Blick halten → Klinge hält ihre Lage (driftet nicht in die Vertikale)
  arena._mdx=0;arena._mdy=0;
  const yawRate=Math.abs(arena.swY-(arena._prevSwY||0))/Math.max(1e-3,realDt);
  const _angM=Math.abs(arena.swP-(arena._prevSwP||0))+Math.abs(arena.swY-(arena._prevSwY||0));arena._prevSwP=arena.swP;
  if(_angM>0.03)arena._restT=0;else arena._restT=(arena._restT||0)+realDt;
  arena.stam=clamp((arena.stam!=null?arena.stam:1)-_angM*(m.M/FEEL.massRef)*(isFinite(ARENA.swGain)?ARENA.swGain:0.011)+(arena._restT>0.25?0.25*realDt:0),0,1); // V18.491.155 FEEL.massRef · ARENA.swGain fail-soft
  arena._prevSwY=arena.swY;
  const layT=clamp(yawRate*0.50,0,1)*(arena.swinging?1:0);                                // Fliehkraft + Angriffsabsicht: horizontaler Schwung legt die Klinge waagrecht (max Reichweite)
  arena.swLay=lerp(arena.swLay||0,layT,clamp(realDt*(layT>(arena.swLay||0)?13:(arena.swinging?2:8)),0,1));   // gelegte Klinge verharrt beim Führen
  const rate=clamp(realDt*18/Math.sqrt(drag),0,1);                          // Trägheit: Klinge folgt verzögert (durchgezogen, federt nicht zurück)
  sw.pitch=lerp(sw.pitch,arena.swP,rate); sw.yaw=lerp(sw.yaw,arena.swY,rate);
  cam.updateMatrixWorld(true);arena.vm.updateMatrixWorld(true);
  const bladeDir=new THREE.Vector3(1,0,0).applyQuaternion(arena._weaponQ||arena.baseQuat).applyQuaternion(arena.vm.quaternion);arena._curveDir=new THREE.Vector3(0,1,0).applyQuaternion(arena._weaponQ||arena.baseQuat).applyQuaternion(arena.vm.quaternion);   // gezielte Klinge (Spitze auf Fadenkreuz)
  const gripW=arena.vm.localToWorld(arena._gripR.clone()), tip=gripW.clone().addScaledVector(bladeDir,arena.bladeL).add(bladeCurve(1));
  if(arena.prevTip&&arena.swinging&&!arena._impact){const _tv=tip.clone().sub(arena.prevTip);            // wahre Schneide (a): Ziel-Rolle aus der ECHTEN Spitzenbahn
    const _tvL=_tv.clone().addScaledVector(bladeDir,-_tv.dot(bladeDir));
    if(_tvL.length()/Math.max(1e-4,realDt)>1.2){const _f=new THREE.Vector3().crossVectors(bladeDir,arena._curveDir);
      arena.swRoll=(arena._rollRend||0)+Math.atan2(_tvL.dot(_f),_tvL.dot(arena._curveDir));}}            // kürzeste Drehung der Schneidenebene in die Bahn (um die Klingenachse)
  arena._rollRend=lerp(arena._rollRend||0,arena.swRoll||0,arena.swinging?rate:clamp(realDt*6,0,1));      // DIESELBE Trägheit wie Pitch/Yaw: schwere Klinge dreht die Schneide träger ein
  if(!arena.swinging&&!arena.thrusting){const _home=Math.round((arena._rollRend||0)/6.283185307)*6.283185307;arena.swRoll=lerp(arena.swRoll||0,_home,clamp(realDt*6,0,1));}   // Ruhe: Schneide kehrt in die natürliche Trage-Lage zurück
  if(arena.cooldown>0)arena.cooldown-=realDt;
  const aim=aimDummy();                                                                  // Blick → Zone (wohin du schaust)
  if(arena.prevTip&&(arena.swinging||arena.thrusting)){const vel=tip.clone().sub(arena.prevTip).divideScalar(Math.max(1e-4,realDt));   // reale Uhr: im Hit-Freeze läuft dt auf 5%, die Klinge aber real -> sonst ×20 Tempo / ×400 KE
    if(arena.thrusting){tryThrustRing(tip,arena.prevTip);tryThrustBamboo(tip,arena.prevTip);}
    if(arena.cooldown<=0&&vel.length()>1.8/Math.max(1,Math.pow(drag,0.7))){const _vlv=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir));const vAx=Math.abs(vel.dot(bladeDir)),vLat=_vlv.length();
      arena._edgeAlign=(!arena._impact&&vLat>1e-3)?Math.abs(_vlv.multiplyScalar(1/vLat).dot(arena._curveDir)):1;   // GEMESSEN am Treffer: |v̂_lat · Schneidenrichtung_Welt| — beide Vektoren real
      if(aim){landMelee(aim.zone,vLat,vAx);addDummyScar(aim.point,aim.normal,bladeDir,arena.lastHit);arena.cooldown=0.30;}else{let _mh=false;for(const d of (arena.devices||[])){if(d.melee&&d.melee(gripW,bladeDir,vel)){_mh=true;break;}}if(!_mh){tryCutBamboo(gripW,bladeDir,vel);tryCutTatami(gripW,bladeDir,vel);}}}}
  arena.prevTip=tip.clone();
  if(arena.swinging)pushTrail(tip);else if(arena.trail.pts.length)arena.trail.pts.shift();
  buildTrailGeom();}
function landMelee(z,vLat,vAx){const m=measure(P),mEff=Math.max(0.02,(m.mEffFrac||0.2)*m.M);
  const thrust=vAx>vLat*0.9,sharp=(m.edgeWinkel!=null&&m.edgeWinkel<32);let KE,art,clean,verdict;
  if(thrust){const beta=m.betaDeg!=null?m.betaDeg:90;KE=0.5*mEff*vAx*vAx;                             // kein Spitzenmaß (Wuchtkopf) -> stumpfer Grenzfall β=90°, kein Geschenk-25 mehr
    const sigEff=1e6*(0.3+ZIELMAT.holz.hart);                                                          // Pell ≈ Holz/Stroh: Fließwiderstand ~1 MPa, skaliert mit Ziel-Härte
    let pen;
    if(m.betaDeg!=null){const LB=m.S.xPoint-m.S.xBlade0,NX=36,dx=LB/NX;let W=0;pen=LB*100;             // Arbeit gegen die ECHTEN Sektionsflächen, von der Spitze rückwärts: W(x)=σ·∫A ds
      for(let i=0;i<NX;i++){const x=(i+0.5)*dx,A=sectionMoments(sectionAt(1-x/LB,P)).A;W+=sigEff*A*dx;if(W>=KE){pen=x*100;break;}}}
    else pen=100*Math.cbrt(3*KE/(Math.PI*sigEff));                                                     // Wuchtkopf: stumpfer 90°-Kegel-Grenzfall
    art='STICH';clean=(m.betaDeg!=null)&&pen>=6;verdict=clean?'spitzer Ort — durchdringt':(m.betaDeg!=null?'zu flach oder zu langsam — bleibt stecken':'kein Ort — prallt ab');arena.lastHit={art,KE,v:vAx,pen,clean,zone:z,verdict};}
  else{const cutF=sharp?(1.0+(32-(m.edgeWinkel||30))/32*0.9):0.5,nd=Math.abs((m.xcopL!=null?m.xcopL:0.7)-0.776),flex=clamp(50/(m.f1||50),0.4,3.0),nodeF=clamp(1-1.6*nd*flex,0.4,1);
    const edgeQ=sharp?clamp(arena._edgeAlign!=null?arena._edgeAlign:1,0.15,1):1;                        // wahre Schneide (a): am Treffer gemessen — nur wo eine Schneide ist
    KE=0.5*mEff*vLat*vLat*cutF*(0.55+0.45*nodeF)*(sharp?(0.25+0.75*edgeQ):1);art=sharp?'SCHNITT':'SCHLAG';clean=nodeF>0.82&&edgeQ>0.75;
    verdict=clean?'am Knoten, Schneide führt — sauber':(sharp&&edgeQ<=0.75?'die Schneide liegt quer — flach getroffen':'abseits des Knotens — '+(flex>1.2?'die biegsame Klinge schwingt':'Vibration'));arena.lastHit={art,KE,v:vLat,clean,zone:z,edgeQ,verdict};}
  const e=KE*z.m;arena.mStats=arena.mStats||{hits:0,dmg:0};arena.mStats.hits++;arena.mStats.dmg+=e;
  // V18.491.182 — FREEZE_VIS: Lab ke-formula coeffs ← gefuehl fail-soft; bounds .170; Host hitStop-lerp dual; no Fake-merge / ad-hoc freezes untouched.
  var _gf=SC&&SC.ARENA&&SC.ARENA.gefuehl;
  var _fMin=(_gf&&Number.isFinite(_gf.freezeMinSec))?_gf.freezeMinSec:0.04;
  var _fMax=(_gf&&Number.isFinite(_gf.freezeMaxSec))?_gf.freezeMaxSec:0.20;
  var _keMul=(_gf&&Number.isFinite(_gf.labFreezeKeMul))?_gf.labFreezeKeMul:0.0011;
  var _cleanAdd=(_gf&&Number.isFinite(_gf.labFreezeCleanAdd))?_gf.labFreezeCleanAdd:0.05;
  var _schlagMul=(_gf&&Number.isFinite(_gf.labFreezeSchlagMul))?_gf.labFreezeSchlagMul:1.25;
  fx.freeze=clamp(e*_keMul+(clean?_cleanAdd:0),_fMin,_fMax)*(art==='SCHLAG'?_schlagMul:1);
  // V18.491.184 — SHAKE_VIS: Lab ke-shake coeffs ← gefuehl fail-soft; Host dip-lerp dual; no Fake-merge.
  var _shakeKe=(_gf&&Number.isFinite(_gf.labShakeKeMul))?_gf.labShakeKeMul:0.004;
  var _shakeSchlag=(_gf&&Number.isFinite(_gf.labShakeSchlagMul))?_gf.labShakeSchlagMul:1.5;
  var _shakeOther=(_gf&&Number.isFinite(_gf.labShakeOtherMul))?_gf.labShakeOtherMul:0.9;
  var _shakeMin=(_gf&&Number.isFinite(_gf.labShakeMin))?_gf.labShakeMin:0.02;
  var _shakeMax=(_gf&&Number.isFinite(_gf.labShakeMax))?_gf.labShakeMax:0.42;
  fx.shake=clamp(e*_shakeKe*(art==='SCHLAG'?_shakeSchlag:_shakeOther),_shakeMin,_shakeMax);
  // V18.491.185 — RECOIL_VIS: Lab ke-kick-recoil coeffs ← gefuehl fail-soft; Host stoss-push dual; no Fake-merge.
  var _kickFwd=(_gf&&Number.isFinite(_gf.labKickFwdMul))?_gf.labKickFwdMul:0.012;
  var _kickY=(_gf&&Number.isFinite(_gf.labKickYMul))?_gf.labKickYMul:0.005;
  var _recoilKe=(_gf&&Number.isFinite(_gf.labRecoilKeMul))?_gf.labRecoilKeMul:0.008;
  var _recoilMin=(_gf&&Number.isFinite(_gf.labRecoilMin))?_gf.labRecoilMin:0.10;
  var _recoilMax=(_gf&&Number.isFinite(_gf.labRecoilMax))?_gf.labRecoilMax:0.7;
  const B=camBasis();fx.kickV.copy(B.fwd).multiplyScalar(-e*_kickFwd);fx.kickV.y-=e*_kickY;arena.recoil=clamp(e*_recoilKe,_recoilMin,_recoilMax);
  popText((art==='STICH'?'➤ ':art==='SCHNITT'?'✂ ':'✹ ')+KE.toFixed(0)+' J',clean?GOLDM_CSS:TREFFM_BAD_CSS,0,-0.04);
  popText(z.n+(clean?'':' · '+verdict),clean?NEUTM_CSS:TREFFM_BAD_CSS,0.1,0.05);updateHUD();}

/* V18.491.467 — Lab Blade-Trail Point-Cap ← SPUR_GESETZ fail-soft; Host none (SPUR_VIS). NARBC/TRAIL opacity/TUPF/LIFT untouched; recoilKeMul stays gefuehl .185. */
const _SPR=(SC&&SC.SPUR_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPUR_GESETZ)||null;
const SPUR_MAX=(_SPR&&Number.isFinite(_SPR.max))?_SPR.max:12;
function ensureTrailMesh(){if(arena.trail.mesh||!arena.group)return;const mat=new THREE.MeshBasicMaterial({transparent:true,opacity:_trailOp,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true});/* V18.491.195 labTrailOpacity fail-soft TRAIL_VIS.lab */
  arena.trail.mesh=new THREE.Mesh(new THREE.BufferGeometry(),mat);arena.trail.mesh.frustumCulled=false;arena.group.add(arena.trail.mesh);}
function pushTrail(tip){if(!arena.vm)return;const mid=arena.vm.localToWorld(arena._gripR.clone().addScaledVector(new THREE.Vector3(1,0,0).applyQuaternion(arena.baseQuat),arena.bladeL*0.4));
  arena.trail.pts.push({tip:tip.clone(),mid});if(arena.trail.pts.length>SPUR_MAX)arena.trail.pts.shift();}
function buildTrailGeom(){ensureTrailMesh();if(!arena.trail.mesh)return;const pts=arena.trail.pts;if(pts.length<2){arena.trail.mesh.visible=false;return;}arena.trail.mesh.visible=true;
  const pos=[],col=[],n=pts.length;
  for(let i=0;i<n-1;i++){const a=pts[i],b=pts[i+1],fa=(i/(n-1))*0.9,fb=((i+1)/(n-1))*0.9,ca=[fa*0.7,fa*0.85,fa],cb=[fb*0.7,fb*0.85,fb];
    pos.push(a.tip.x,a.tip.y,a.tip.z,a.mid.x,a.mid.y,a.mid.z,b.mid.x,b.mid.y,b.mid.z, a.tip.x,a.tip.y,a.tip.z,b.mid.x,b.mid.y,b.mid.z,b.tip.x,b.tip.y,b.tip.z);
    col.push(...ca,...ca,...cb,...ca,...cb,...cb);}
  const g=arena.trail.mesh.geometry;g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));}

// — BOGEN: links = ans Auge, rechts = spannen & halten, rechts loslassen = Schuss —
function doRelease(){if(arena.kind!=='bow')return;if(arena.drawFrac<_bogenFov().minAus){/* V18.491.167 minAuszugFrac fail-soft */arena.drawing=false;arena.drawFrac=0;arena._builtFrac=-1;return;}
  arena.drawing=false;fx.fovT=_bogenFov().ruhe;const E=Math.max(1,P.energie||_bogenFov().eFallback /* V18.491.178 SCHUSS_VIS */),v0=Math.sqrt(2*E/ARENA.mArrow)*arena.drawFrac,B=camBasis();
  const fwd=B.fwd.clone();const _ss=_bogenFov().swaySpread;/* V18.491.176 */fwd.x+=(Math.random()-0.5)*arena.sway*_ss;fwd.y+=(Math.random()-0.5)*arena.sway*_ss;fwd.normalize();
  cam.updateMatrixWorld(true);const start=arena.vm.localToWorld(arena._gripR.clone().addScaledVector(new THREE.Vector3(1,0,0).applyQuaternion(arena.baseQuat),_bogenFov().muzzle /* V18.491.181 MUENDUNG_VIS */));
  const arr=buildPfeil();arena.group.add(arr);arr.position.copy(start);const KE=0.5*ARENA.mArrow*v0*v0;
  arena.arrows.push({mesh:arr,pos:start.clone(),vel:fwd.clone().multiplyScalar(v0),v0,KE,scored:false,life:0,trail:[start.clone()],line:null});
  arena.drawFrac=0;arena._builtFrac=-1;arena.holdT=0;arena.sway=0;const bf=_bogenFov();/* V18.491.183 KICK_VIS.lab */fx.kickV.copy(B.fwd).multiplyScalar(-bf.kickBack);fx.kickV.y+=bf.kickY;fx.shake=bf.kickShake;arena.lastShot={v0,KE};updateHUD();}
function stickArrow(a){a.stuck=true;a.vel.set(0,0,0);arena.stuck.push(a.mesh);if(arena.stuck.length>_bogenFov().stuckMax){/* V18.491.175 labStuckMax fail-soft; STUCK_VIS lab:stuck-40 / host:MAX_PFEILE-16 — Do NOT Fake-align */const o=arena.stuck.shift();if(o.parent)o.parent.remove(o);}if(a.line&&a.line.parent)a.line.parent.remove(a.line);}


function arenaUpdate(realDt){if(!arena.active)return;const now=clock.getElapsedTime();
  if(fx.freeze>0)fx.freeze-=realDt;const dt=fx.freeze>0?realDt*_fDt:realDt;/* V18.491.195 labFreezeDtMul fail-soft */updateMovement(realDt);pickupCheck();updateFalling(realDt);regrowBamboo();regrowTatami();swingTatamiUpdate(now);carnivalUpdate(now);for(const d of (arena.devices||[])){if(d.update)d.update(realDt);}
  if(arena.kind==='bow'){arena.raise=lerp(arena.raise,(arena.drawing||arena._wantAim)?1:0,clamp(realDt*_bogenFov().raiseK,0,1));/* V18.491.189 AIM_VIS.lab raiseK fail-soft; Host none — Do NOT Fake-add Host raise */
    if(arena.drawing){const bf=_bogenFov();arena.drawFrac=Math.min(1,arena.drawFrac+dt/bf.aus);fx.fovT=lerp(bf.ruhe,bf.zug,arena.drawFrac);if(arena.drawFrac>=1){arena.holdT+=dt;arena.sway=clamp((arena.holdT-bf.holdSec)*bf.swayGain,0,1);/* V18.491.176 HOLD_SWAY_VIS.lab */}}
    else if(arena.drawFrac>0){arena.drawFrac=Math.max(0,arena.drawFrac-realDt*_bogenFov().drawDecay);}/* V18.491.189 AIM_VIS.lab drawDecay fail-soft; Host none — Do NOT Fake-add Host undraw */
    if(Math.abs(arena.drawFrac-arena._builtFrac)>_bogenFov().rebuildEps){/* V18.491.188 labRebuildEps fail-soft; REBUILD_VIS lab:drawFrac-eps / host:none — Do NOT Fake-add Host rebuild */const keep=arena.vmWeapon;arena.vm.remove(keep);P.drawFrac=arena.drawFrac;arena.vmWeapon=buildBogen(P,M.wood);arena.vm.add(arena.vmWeapon);arena._builtFrac=arena.drawFrac;}
    for(const a of arena.arrows){if(a.stuck)continue;a.vel.y-=ARENA.g*dt;const sp=a.vel.length();a.vel.multiplyScalar(Math.max(0,1-_bogenFov().luftDrag*sp*dt));/* V18.491.173 SCHUSS_DRAG_VIS.lab; Host none — Do NOT Fake-add Host drag */
      a.pos.addScaledVector(a.vel,dt);a.mesh.position.copy(a.pos);if(sp>0.01)a.mesh.quaternion.setFromUnitVectors(_AX,a.vel.clone().normalize());a.life+=dt;
      if(!a.scored)hitMover(a);
      if(!a.scored&&arena.popinjays){for(const P2 of arena.popinjays){if(P2.struck)continue;const bp=P2.base;if(Math.hypot(a.pos.x-bp.x,a.pos.y-bp.y,a.pos.z-bp.z)<PAPAGEI_HITR){P2.struck=true;P2.fallV=0.6;P2.respawnAt=clock.getElapsedTime()+3.5;popText('Papagei getroffen!',GOLDM_CSS,0,0);popText('+15',TREFFM_OK_CSS,0.12,0.06);a.scored=true;stickArrow(a);break;}}}
      if(!a.scored&&arena.dummy){const dp=arena.dummy.position;if(Math.hypot(a.pos.x-dp.x,a.pos.z-dp.z)<0.36&&a.pos.y>0.55&&a.pos.y<1.9){fx.shake+=0.05;popText('Pell getroffen',PELLTM_CSS,0,0);popText('+8',TREFFM_OK_CSS,0.12,0.06);arena.score.shots++;arena.score.sum+=8;arena.score.last={ring:8,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};a.scored=true;stickArrow(a);updateHUD();}}
      if(!a.scored&&arena.wand&&!arena.wand.struck){const W=arena.wand;if(Math.hypot(a.pos.x-W.x,a.pos.z-W.z)<W.R&&a.pos.y>W.y0&&a.pos.y<W.y1){W.struck=true;W.respawnAt=clock.getElapsedTime()+3.0;W.rod.visible=false;fx.shake+=0.05;popText('WAND GESPALTEN — reine Präzision',GOLDM_CSS,0,0);popText('+20',TREFFM_OK_CSS,0.12,0.06);arena.score.shots++;arena.score.sum+=20;arena.score.last={ring:20,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};a.scored=true;stickArrow(a);updateHUD();}}
      if(!a.scored&&arena.clout){const C=arena.clout,hd=Math.hypot(a.pos.x-C.x,a.pos.z-C.z);if(a.pos.y<0.35&&a.vel.y<0&&hd<C.R){const ring=clamp(Math.ceil(6*(1-hd/C.R)),1,6);fx.shake+=0.05;popText('CLOUT — die Parabel sitzt · '+ring,GOLDM_CSS,0,0);popText('+'+(ring*3),TREFFM_OK_CSS,0.12,0.06);arena.score.shots++;arena.score.sum+=ring*3;arena.score.last={ring:ring*3,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};a.scored=true;stickArrow(a);updateHUD();}}
      for(const d of (arena.devices||[])){if(!a.scored&&d.arrow&&d.arrow(a))a.scored=true;}
      if(!a.scored){for(const T of arena.targets){if(a.pos.x>=T.pos.x-_bogenFov().targetNear&&a.pos.x<T.pos.x+_bogenFov().targetDepth){const rr=Math.hypot(a.pos.y-T.pos.y,a.pos.z-T.pos.z);if(rr<=T.R+_bogenFov().radius){scoreArrowOn(a,T,rr);break;}/* V18.491.168+V18.491.187 TARGET_VIS.lab x-slab */}}}
      else if(a.pos.y<=0.02){a.pos.y=0.02;a.mesh.position.copy(a.pos);stickArrow(a);popText('im Boden',MISSM_CSS,0,0);}
      // FLUG_VIS.lab=life-9 ← labLifeSec (+labXMax); Host maxFlugSec-5 — Do NOT Fake-align 9→5. V18.491.177 labLifeSec fail-soft
      else if(a.life>_bogenFov().lifeSec||a.pos.x>_bogenFov().xMax){stickArrow(a);}}
  }else{arena.ready=lerp(arena.ready,(arena.swinging||arena.thrusting||arena._pressing)?1:0,clamp(realDt*_readyK,0,1));/* V18.491.191 labReadyK fail-soft */meleeSwingUpdate(realDt,dt);
    if(arena.recoil>0.001&&arena.dummy){arena.recoil*=Math.pow(0.0008,dt);arena.dummy.rotation.z=-arena.recoil*Math.sin(now*26)*0.85;arena.dummy.rotation.x=arena.recoil*Math.cos(now*26)*0.3;if(arena.recoil<0.004){arena.recoil=0;arena.dummy.rotation.z=0;arena.dummy.rotation.x=0;}}}
  applyCamera(realDt);placeViewModel(realDt);updateReticle();}

function applyCamera(dt){fx.fov=lerp(fx.fov,fx.fovT,clamp(dt*_fovK,0,1));cam.fov=fx.fov;/* V18.491.190 labFovK fail-soft */
  fx.kick.addScaledVector(fx.kickV,dt);fx.kickV.multiplyScalar(Math.pow(_kickVDecay,dt));fx.kick.multiplyScalar(Math.pow(_kickDecay,dt));/* V18.491.193 labKick*Decay fail-soft */
  const sh=fx.shake;fx.shake*=Math.pow(_shakeDecay,dt);if(fx.shake<_shakeKill)fx.shake=0;/* V18.491.193 labShakeDecay/Kill fail-soft */
  const bob=Math.sin(clock.getElapsedTime()*_bobHz)*arena.bob*_bobAmp,B=camBasis();/* V18.491.192 labBob* fail-soft */
  cam.position.set(arena.player.x+(Math.random()-0.5)*sh,ARENA.eyeY-(arena._crouchY||0)+bob+(Math.random()-0.5)*sh+fx.kick.y,arena.player.z+(Math.random()-0.5)*sh);
  cam.lookAt(cam.position.clone().add(B.fwd));cam.updateProjectionMatrix();}

function appendArenaUI(){
  /* V18.491.571 — Lab Arena Chrome Accent ← CHROMEM_GESETZ fail-soft; Host none (CHROMEM_VIS). ARENAM/WARNM left bare (same hex ≠ same law); LIFT untouched. */
  const _CRM=(SC&&SC.CHROMEM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.CHROMEM_GESETZ)||null;
  const CHROMEM_COLOR=(_CRM&&Number.isFinite(_CRM.color))?_CRM.color:0xd4a843;
  const CHROMEM_CSS='#'+CHROMEM_COLOR.toString(16).padStart(6,'0');
  /* V18.491.572 — Lab Arena Spectrum Mid ← SPEKM_GESETZ fail-soft; Host none (SPEKM_VIS). drawmeter mid; stam mid wired in updateHUD; CHROMEM/ARENAM/WARNM/LIFT untouched. */
  const _SPK=(SC&&SC.SPEKM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPEKM_GESETZ)||null;
  const SPEKM_COLOR=(_SPK&&Number.isFinite(_SPK.color))?_SPK.color:0xd4a843;
  const SPEKM_CSS='#'+SPEKM_COLOR.toString(16).padStart(6,'0');
  /* V18.491.573 — Lab Arena Spectrum Ok/Bad ← SPEKOM_GESETZ fail-soft; Host none (SPEKOM_VIS). drawmeter ends; stam ends+erschöpft in updateHUD; popText/HUD-verdict left bare; SPEKM/LIFT untouched. */
  const _SOM=(SC&&SC.SPEKOM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPEKOM_GESETZ)||null;
  const SPEKOM_OK=(_SOM&&Number.isFinite(_SOM.ok))?_SOM.ok:0x6fcf73;
  const SPEKOM_BAD=(_SOM&&Number.isFinite(_SOM.bad))?_SOM.bad:0xd96a4a;
  const SPEKOM_OK_CSS='#'+SPEKOM_OK.toString(16).padStart(6,'0');
  const SPEKOM_BAD_CSS='#'+SPEKOM_BAD.toString(16).padStart(6,'0');
  /* V18.491.576 — Lab Arena Reticle Aim Dot ← RETIKELM_GESETZ fail-soft; Host none (RETIKELM_VIS). ≠ GOLDM pop gold · ≠ ENTEM.ring0; LIFT untouched. */
  const _RTK=(SC&&SC.RETIKELM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.RETIKELM_GESETZ)||null;
  const RETIKELM_COLOR=(_RTK&&Number.isFinite(_RTK.color))?_RTK.color:0xffe07a;
  const RETIKELM_CSS='#'+RETIKELM_COLOR.toString(16).padStart(6,'0');
  /* V18.491.578 — Lab Arena Hint Chrome ← HINTM_GESETZ fail-soft; Host none (HINTM_VIS). ≠ NEUTM score/pop mid same hex; LIFT untouched. */
  const _HNT=(SC&&SC.HINTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.HINTM_GESETZ)||null;
  const HINTM_COLOR=(_HNT&&Number.isFinite(_HNT.color))?_HNT.color:0x9fb3c8;
  const HINTM_CSS='#'+HINTM_COLOR.toString(16).padStart(6,'0');
  /* V18.491.582 — Lab Arena UI Base Text ← TEXTM_GESETZ fail-soft; Host none (TEXTM_VIS). ≠ CHROMEM/HINTM; pickup → PICKM .584; LIFT untouched. */
  const _TXM=(SC&&SC.TEXTM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.TEXTM_GESETZ)||null;
  const TEXTM_COLOR=(_TXM&&Number.isFinite(_TXM.color))?_TXM.color:0xe8e6e0;
  const TEXTM_CSS='#'+TEXTM_COLOR.toString(16).padStart(6,'0');
  /* V18.491.583 — Lab Arena Toggle-Btn Shell ← BTNM_GESETZ fail-soft; Host none (BTNM_VIS). ≠ CHROMEM accent; LIFT untouched. */
  const _BTN=(SC&&SC.BTNM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.BTNM_GESETZ)||null;
  const BTNM_BG=(_BTN&&Number.isFinite(_BTN.bg))?_BTN.bg:0x1c1c26;
  const BTNM_BORDER=(_BTN&&Number.isFinite(_BTN.border))?_BTN.border:0x3a3a48;
  const BTNM_BG_CSS='#'+BTNM_BG.toString(16).padStart(6,'0');
  const BTNM_BORDER_CSS='#'+BTNM_BORDER.toString(16).padStart(6,'0');
  /* V18.491.584 — Lab Arena Pickup CTA Text ← PICKM_GESETZ fail-soft; Host none (PICKM_VIS). ≠ CHROMEM bg · ≠ TEXTM; LIFT untouched. */
  const _PKM=(SC&&SC.PICKM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PICKM_GESETZ)||null;
  const PICKM_COLOR=(_PKM&&Number.isFinite(_PKM.color))?_PKM.color:0x1a1408;
  const PICKM_CSS='#'+PICKM_COLOR.toString(16).padStart(6,'0');
  /* V18.491.585 — Lab Arena Readout Border ← READM_GESETZ fail-soft; Host none (READM_VIS). ≠ BTNM.border; combat pops left bare; LIFT untouched. */
  const _RDM=(SC&&SC.READM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.READM_GESETZ)||null;
  const READM_BORDER=(_RDM&&Number.isFinite(_RDM.border))?_RDM.border:0x2a2a38;
  const READM_BORDER_CSS='#'+READM_BORDER.toString(16).padStart(6,'0');
  /* V18.491.601 — Lab Arena Panel Shell rgba ← PANELM_GESETZ fail-soft; Host none (PANELM_VIS). ≠ BTNM/READM; popText/#000 chrome left bare; LIFT untouched. */
  const _PNL=(SC&&SC.PANELM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.PANELM_GESETZ)||null;
  const PANELM_COLOR=(_PNL&&Number.isFinite(_PNL.color))?_PNL.color:0x12121a;
  const PANELM_READOUTA=(_PNL&&Number.isFinite(_PNL.readoutA))?_PNL.readoutA:0.82;
  const PANELM_HINTA=(_PNL&&Number.isFinite(_PNL.hintA))?_PNL.hintA:0.7;
  const PANELM_LOCKA=(_PNL&&Number.isFinite(_PNL.lockA))?_PNL.lockA:0.85;
  const PANELM_R=(PANELM_COLOR>>>16)&255,PANELM_G=(PANELM_COLOR>>>8)&255,PANELM_B=PANELM_COLOR&255;
  const PANELM_READOUT_CSS='rgba('+PANELM_R+','+PANELM_G+','+PANELM_B+','+PANELM_READOUTA+')';
  const PANELM_HINT_CSS='rgba('+PANELM_R+','+PANELM_G+','+PANELM_B+','+PANELM_HINTA+')';
  const PANELM_LOCK_CSS='rgba('+PANELM_R+','+PANELM_G+','+PANELM_B+','+PANELM_LOCKA+')';
  const btn=document.createElement('button');btn.id='arena-toggle';btn.textContent='Prüfstand ⚔';
  btn.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:50;background:'+BTNM_BG_CSS+';color:'+CHROMEM_CSS+';border:1px solid '+BTNM_BORDER_CSS+';border-radius:8px;padding:9px 18px;font:600 13px system-ui;cursor:pointer';
  btn.onclick=arenaToggle;document.body.appendChild(btn);
  const ui=document.createElement('div');ui.id='arena-ui';ui.style.cssText='position:fixed;inset:0;z-index:45;display:none;pointer-events:none;font:13px system-ui;color:'+TEXTM_CSS;
  ui.innerHTML='<div id="reticle" style="position:absolute;left:50%;top:50%;width:22px;height:22px;transform:translate(-50%,-50%)"><div style="position:absolute;inset:0;border:1.5px solid '+RINGRM_CSS+';border-radius:50%"></div><div style="position:absolute;left:50%;top:50%;width:3px;height:3px;background:'+RETIKELM_CSS+';border-radius:50%;transform:translate(-50%,-50%)"></div></div>'
    +'<div id="drawmeter" style="position:absolute;left:50%;bottom:86px;transform:translateX(-50%);width:200px;height:8px;background:'+METERBM_CSS+';border-radius:4px;overflow:hidden;display:none"><div id="drawfill" style="height:100%;width:0%;background:linear-gradient(90deg,'+SPEKOM_OK_CSS+','+SPEKM_CSS+','+SPEKOM_BAD_CSS+')"></div></div>'
    +'<div id="popups" style="position:absolute;left:50%;top:42%;width:0;text-align:center"></div>'
    +'<div id="arena-readout" style="position:absolute;left:18px;bottom:18px;background:'+PANELM_READOUT_CSS+';border:1px solid '+READM_BORDER_CSS+';border-radius:9px;padding:10px 13px;min-width:260px;line-height:1.5;backdrop-filter:blur(5px)"></div>'
    +'<div id="arena-hint" style="position:absolute;left:50%;bottom:18px;transform:translateX(-50%);color:'+HINTM_CSS+';font-size:11.5px;background:'+PANELM_HINT_CSS+';padding:6px 12px;border-radius:7px"></div>'
    +'<div id="lockhint" style="position:absolute;left:50%;top:50%;transform:translate(-50%,44px);color:'+CHROMEM_CSS+';font-size:13px;background:'+PANELM_LOCK_CSS+';padding:8px 16px;border-radius:8px">Klick = Maus & Steuerung übernehmen</div>'+'<div id="pickup" style="position:absolute;left:50%;top:60%;transform:translateX(-50%);display:none;color:'+PICKM_CSS+';font-weight:700;font-size:14px;background:'+CHROMEM_CSS+';padding:7px 16px;border-radius:8px">E nehmen</div>';
  document.body.appendChild(ui);
  const cv=R.domElement;
  cv.addEventListener('click',()=>{if(arena.active&&!arena.locked)cv.requestPointerLock();});
  cv.addEventListener('contextmenu',e=>{if(arena.active)e.preventDefault();});
  document.addEventListener('pointerlockchange',()=>{arena.locked=(document.pointerLockElement===cv);const lh=document.getElementById('lockhint');if(lh)lh.style.display=arena.locked?'none':'block';});
  document.addEventListener('mousemove',e=>{if(!arena.active||!arena.locked)return;
    if(arena.kind==='melee'&&(arena.swinging||arena._pressing)){
      if(arena._pressing&&!arena.swinging){arena._dragMag=(arena._dragMag||0)+Math.abs(e.movementX)+Math.abs(e.movementY);if(arena._dragMag>12){arena.swinging=true;arena.swP=-1.20*(arena._windF||1);arena.swY=0;}}  // Zug → Schwung: leichte Klinge holt flach aus (Reichweite bleibt), schwere lädt voll
      if(arena.swinging){arena._mdx+=e.movementX;arena._mdy+=e.movementY;}
      if(!arena.holdView){arena.yaw+=e.movementX*ARENA.sens*0.5;arena.pitch=clamp(arena.pitch-e.movementY*ARENA.sens*0.5,-1.2,1.2);}}
    else{arena.yaw+=e.movementX*ARENA.sens;arena.pitch=clamp(arena.pitch-e.movementY*ARENA.sens,-1.2,1.2);}});
  document.addEventListener('mousedown',e=>{if(!arena.active||!arena.locked)return;
    if(arena.kind==='bow'){if(e.button===0)arena._wantAim=true;else if(e.button===2)arena.drawing=true;}
    else{if(e.button===0){arena._pressing=true;arena._downT=clock.getElapsedTime();arena._dragMag=0;arena.swP=0;arena.swY=0;arena.trail.pts=[];}else if(e.button===2){arena.holdView=true;}}});  // links: Klick-Impuls=Stich, Halten/Ziehen=Ausgangsstellung
  document.addEventListener('mouseup',e=>{if(!arena.active||!arena.locked)return;
    if(arena.kind==='bow'){if(e.button===2)doRelease();else if(e.button===0){arena._wantAim=false;}}
    else{if(e.button===0){if(arena._pressing&&!arena.swinging&&(arena._dragMag||0)<12&&arena.cooldown<=0)startThrust();arena.swinging=false;arena._pressing=false;}else if(e.button===2)arena.holdView=false;}});
  document.addEventListener('keydown',e=>{if(!arena.active)return;const k=e.key.toLowerCase();
    if(k==='w')arena.keys.w=1;else if(k==='s')arena.keys.s=1;else if(k==='a')arena.keys.a=1;else if(k==='d')arena.keys.d=1;else if(k==='shift')arena.keys.shift=1;else if(k==='control')arena.keys.ctrl=1;else if(k==='h')toggleHand();else if(k==='e'){if(arena._nearKnightField){const F=arena._nearKnightField;F.active=true;for(const KK of F.knights)if(KK.state==='dormant')KK.state='approach';popText(F.armored?'⚔ DIE RITTER ERHEBEN SICH':'⚔ DIE KÄMPFER STELLEN SICH',ERHEBM_CSS,0,-0.10);popText(F.armored?'Schnitt prallt ab — Stich ins Visier (Auge) oder stumpfe Wucht':'ungepanzert — jeder Hieb sitzt',INVITEM_CSS,0,0.06);}else if(arena._nearCharger&&arena.charger&&arena.charger.state==='dormant'){arena.charger.state='charge';arena.charger.hitCD=0;popText('Streitpuppe greift an!',GREIFM_CSS,0,0);}else if(arena._near)equipWeapon(arena._near.name);}});
  document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='w')arena.keys.w=0;else if(k==='s')arena.keys.s=0;else if(k==='a')arena.keys.a=0;else if(k==='d')arena.keys.d=0;else if(k==='shift')arena.keys.shift=0;else if(k==='control')arena.keys.ctrl=0;});
}
function hudHint(){document.getElementById('arena-hint').textContent=arena.kind==='bow'
  ?'WASD = laufen · Maus = zielen · LINKE Maus = ans Auge heben · RECHTE Maus = spannen & halten, loslassen = Schuss · H = Hand'
  :'WASD = laufen · SHIFT = sprinten · STRG = ducken · Maus = blicken · LINKE Maus halten = Schwung · kurz klicken = Stich · RECHTE Maus = Blick halten (Klinge führen) · H = Hand';
  document.getElementById('drawmeter').style.display=arena.kind==='bow'?'block':'none';}
function updateReticle(){const ret=document.getElementById('reticle');if(!ret)return;let s=22;if(arena.kind==='bow')s=lerp(40,14,arena.drawFrac)+arena.sway*40;else if(arena.swinging)s=30;ret.style.width=ret.style.height=s.toFixed(0)+'px';if(arena.kind==='bow')document.getElementById('drawfill').style.width=(arena.drawFrac*100).toFixed(0)+'%';}
function popText(txt,color,ox,oy){const c=document.getElementById('popups');if(!c)return;const d=document.createElement('div');
  d.textContent=txt;d.style.cssText='position:absolute;left:'+(ox*innerWidth*0.3)+'px;top:'+(oy*innerHeight)+'px;transform:translate(-50%,0);color:'+color+';font:800 25px system-ui;letter-spacing:.3px;text-shadow:0 1px 2px '+POPUM_SHADOW_CSS+',0 0 7px '+POPUM_GLOW_CSS+';background:'+POPUM_BG_CSS+';padding:6px 15px;border-radius:8px;border:1px solid '+POPUM_BORDER_CSS+';box-shadow:0 4px 14px '+POPUM_BOX_CSS+';opacity:1;transition:all .9s ease-out;white-space:nowrap';
  c.appendChild(d);requestAnimationFrame(()=>{d.style.top=(oy*innerHeight-60)+'px';d.style.opacity='0';});setTimeout(()=>d.remove(),950);}
function updateHUD(){const ro=document.getElementById('arena-readout');if(!ro)return;
  /* V18.491.569 — Lab Arena HUD Title ← ARENAM_GESETZ fail-soft; Host none (ARENAM_VIS). popText/chrome/stam mid #d4a843 left bare; BOGENM/LIFT untouched. */
  const _AHM=(SC&&SC.ARENAM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.ARENAM_GESETZ)||null;
  const ARENAM_COLOR=(_AHM&&Number.isFinite(_AHM.color))?_AHM.color:0xd4a843;
  const ARENAM_CSS='#'+ARENAM_COLOR.toString(16).padStart(6,'0');
  if(arena.kind==='bow'){const E=Math.max(1,P.energie||_bogenFov().eFallback /* V18.491.178 SCHUSS_VIS */),v=Math.sqrt(2*E/ARENA.mArrow)*arena.drawFrac;let dist=999;if(arena.targets)for(const T of arena.targets)dist=Math.min(dist,Math.hypot(T.pos.x-arena.player.x,T.pos.z-arena.player.z));
    let s='<b style="color:'+ARENAM_CSS+'">BOGEN</b> · Distanz '+dist.toFixed(0)+' m'+(arena.right?' · rechts':' · links')+'<br>Zug '+(arena.drawFrac*100|0)+'%  ·  v '+v.toFixed(0)+' m/s  ·  '+(0.5*ARENA.mArrow*v*v).toFixed(0)+' J';
    /* V18.491.576 WIRE — Lab HUD-score ring>=9 gold ← GOLDM_GESETZ (same excellence gold as popText). reticle → RETIKELM .576. */
    /* V18.491.577 WIRE — Lab HUD-score ring<6 bad ← TREFFM_GESETZ.bad (same outcome bad as popText ring score). mid → NEUTM TEIL .577; SPEKOM/LIFT untouched. */
    if(arena.score.last){const L=arena.score.last;s+='<br><span style="color:'+(L.ring>=9?GOLDM_CSS:L.ring>=6?NEUTM_CSS:TREFFM_BAD_CSS)+'">'+(L.ring>0?'Letzter: '+L.ring+' Ringe ('+L.dist.toFixed(0)+' m) · '+L.pen.toFixed(0)+' cm':'daneben')+'</span>';}
    if(arena.score.shots)s+='<br><span style="'+MUTEM_CSS+'">Schnitt '+(arena.score.sum/arena.score.shots).toFixed(1)+' über '+arena.score.shots+' · '+arena.stuck.length+' Pfeile stecken</span>';
    ro.innerHTML=s;
  }else{let s='<b style="color:'+ARENAM_CSS+'">NAHKAMPF</b> · '+currentGattung+(arena.right?' · rechts':' · links');const h=arena.lastHit;
    /* V18.491.576 WIRE — Lab HUD verdict h.clean ← TREFFM_GESETZ (same outcome ok/bad law as popText; no new twin; VERSION stays .575). SPEKOM/GOLDM/LIFT untouched. */
    if(h)s+='<br><b>'+h.art+'</b> '+h.KE.toFixed(0)+' J · '+h.v.toFixed(1)+' m/s'+(h.pen?' · '+h.pen.toFixed(0)+' cm':'')+'<br><span style="color:'+(h.clean?TREFFM_OK_CSS:TREFFM_BAD_CSS)+'">'+h.verdict+'</span> · '+h.zone.n;
    else s+='<br><span style="'+MUTEM_CSS+'">linke Maus halten = Schwung (trifft wohin du schaust) · rechte Maus = Blick halten</span>';
    if(arena.mStats)s+='<br><span style="'+STATSM_CSS+'">Treffer '+arena.mStats.hits+' · Schaden gesamt '+arena.mStats.dmg.toFixed(0)+' J</span>';{/* V18.491.572 — Lab Arena Spectrum Mid ← SPEKM_GESETZ fail-soft (stam mid); Host none (SPEKM_VIS). */
const _SPK2=(SC&&SC.SPEKM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPEKM_GESETZ)||null;
const SPEKM_COLOR2=(_SPK2&&Number.isFinite(_SPK2.color))?_SPK2.color:0xd4a843;
const SPEKM_CSS2='#'+SPEKM_COLOR2.toString(16).padStart(6,'0');
/* V18.491.573 — Lab Arena Spectrum Ok/Bad ← SPEKOM_GESETZ fail-soft (stam ends); Host none (SPEKOM_VIS). popText/HUD-verdict left bare. */
const _SOM2=(SC&&SC.SPEKOM_GESETZ)||(window.__schmiedeCore&&window.__schmiedeCore.SPEKOM_GESETZ)||null;
const SPEKOM_OK2=(_SOM2&&Number.isFinite(_SOM2.ok))?_SOM2.ok:0x6fcf73;
const SPEKOM_BAD2=(_SOM2&&Number.isFinite(_SOM2.bad))?_SOM2.bad:0xd96a4a;
const SPEKOM_OK_CSS2='#'+SPEKOM_OK2.toString(16).padStart(6,'0');
const SPEKOM_BAD_CSS2='#'+SPEKOM_BAD2.toString(16).padStart(6,'0');
const _st=(arena.stam!=null?arena.stam:1),_sb=Math.round(_st*10),_bc=_st>0.5?SPEKOM_OK_CSS2:_st>0.25?SPEKM_CSS2:SPEKOM_BAD_CSS2;s+='<br><span style="'+AUSDM_CSS+'">Ausdauer <span style="color:'+_bc+'">'+'\u2588'.repeat(_sb)+'<span style="'+LEERM_CSS+'">'+'\u2588'.repeat(10-_sb)+'</span></span>'+(_st<0.25?'  <span style="color:'+SPEKOM_BAD_CSS2+'">erschöpft</span>':'')+'</span>';}
    ro.innerHTML=s;}}


// ════════════════════════════════════════════════════════════════════
// ANIMATION
// ════════════════════════════════════════════════════════════════════
const clock=new THREE.Clock();
let _lastT=0;
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();const dt=Math.min(0.05,t-_lastT);_lastT=t;
  if(!arena.active)controls.update();gradePass.uniforms.t.value=t;
  if(arena.active)arenaUpdate(dt);
  // Harmonik-Welle auf der Klinge (verlangsamt zur Sichtbarkeit)
  if(ring.active&&gBladeMesh){const dt=t-ring.t0, decay=Math.exp(-dt/1.7), w=2*Math.PI*5.5;
    if(decay<0.04){ring.active=false;document.getElementById('ring-info').style.display='none';}
    const pos=gBladeMesh.geometry.attributes.position, bx=gBladeMesh.userData.bladeX, bz=gBladeMesh.userData.baseZ;
    const A=0.013;
    for(let i=0;i<pos.count;i++){const phi=modeRaw(bx[i])/ring.phiMax;
      pos.setZ(i, bz[i]+A*phi*Math.sin(w*dt)*decay);}
    pos.needsUpdate=true;gBladeMesh.geometry.computeVertexNormals();
  } else if(gBladeMesh){const pos=gBladeMesh.geometry.attributes.position,bz=gBladeMesh.userData.baseZ;
    let dirty=false;for(let i=0;i<pos.count;i++){if(pos.getZ(i)!==bz[i]){pos.setZ(i,bz[i]);dirty=true;}}
    if(dirty){pos.needsUpdate=true;gBladeMesh.geometry.computeVertexNormals();}}
  composer.render();}

addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
  R.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);fxaa.uniforms.resolution.value.set(1/innerWidth,1/innerHeight);});
addEventListener('keydown',e=>{if(arena.active)return;const k=e.key.toLowerCase();
  if('12345'.includes(k)){const i=+k-1;if(LY[i]){show[LY[i][0]]=!show[LY[i][0]];ldiv.children[i].classList.toggle('on');applyVis();}}
  else if(k===' '){e.preventDefault();triggerRing();}
  else if(k==='g'){const ks=Object.keys(GATTUNGEN);const ni=(ks.indexOf(currentGattung)+1)%ks.length;pdiv.children[ni].click();}
  else if(k==='t'){const ks=Object.keys(TRADITIONEN);const cur=Object.keys(TRADITIONEN).find(n=>TRADITIONEN[n]===currentTrad);const ni=(ks.indexOf(cur)+1)%ks.length;tdiv.children[ni].click();}});

// — Start —
P._kBase=P.kruemmung;buildSliders();rebuild();appendArenaUI();animate();

/* ==================== W12-PORTAL-BRÜCKE (AnazhRealm-Heimat) ==================== */
/* Dasselbe Muster wie worlds/garage + worlds/portale: enter/ready-Handshake, die
   DSL spricht über die ECHTEN UI-Pfade (Button-click = eine Quelle) — die 21
   Gattungen (#presets) + 4 Traditionen (#trads) + die Haupt-Gesten "anschlagen"
   (#ring, die Harmonik-Probe) und "stahl" (#finish, der Stahl/Roh-Umschalter).
   Umlaut-Namen reisen ASCII-gefaltet (saebel/grossschwert/faellaxt — die
   terrain-Konvention "fruehling"); dieselbe Faltung liegt auf dem Button-Text.
   Esc meldet die Heimkehr — im Prüfstand gehört Esc dem Pointer-Lock-Release
   (eigener Handler oben), die Brücke schweigt dort. */
(function () {
    if (typeof window === "undefined" || !window.parent || window.parent === window) return;
    function post(m) {
        try {
            window.parent.postMessage(m, "*");
        } catch (_e) {}
    }
    /* ASCII-Faltung — EINE Normalisierung für DSL-Wort UND Button-Text. */
    function norm(s) {
        return String(s || "")
            .toLowerCase()
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/ß/g, "ss")
            .trim();
    }
    var DSL = [
        "langschwert", "saebel", "degen", "grossschwert", "dolch", "messer",
        "langbogen", "kriegsbogen", "reiterbogen", "recurvebogen",
        "streitkolben", "kriegsaxt", "kriegshammer", "keule",
        "faellaxt", "spaltmaul", "vorschlaghammer", "beil", "spitzhacke", "spaten", "schaufel",
        "frank", "nihon", "pars", "urvolk",
        "anschlagen", "stahl",
    ];
    /* Gattungen leben in #presets, Traditionen in #trads — NUR dort matchen:
       die Ebenen-Buttons (#layers) tragen "Stahl" als Label, ein Match über
       alle #ctl-Buttons kollidierte (anders als in der garage, wo kein
       DSL-Wort mit einem Ebenen-Label kollidiert). */
    function clickIn(id, word) {
        var div = document.getElementById(id);
        if (!div) return false;
        var kids = div.querySelectorAll("button");
        for (var i = 0; i < kids.length; i++) {
            if (norm(kids[i].textContent) === word) {
                kids[i].click();
                return true;
            }
        }
        return false;
    }
    window.addEventListener("message", function (ev) {
        if (ev.source !== window.parent) return;
        var msg = ev.data;
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "enter") {
            post({ type: "ready", world: "schmiede", label: "Anatomie · Klinge", dsl: DSL });
        } else if (msg.type === "dsl" && Array.isArray(msg.program)) {
            for (var i = 0; i < msg.program.length; i++) {
                var op = msg.program[i];
                var word = norm((op && op[0]) || op || "");
                if (word === "anschlagen") {
                    var rg = document.getElementById("ring");
                    if (rg) rg.click();
                } else if (word === "stahl") {
                    var fi = document.getElementById("finish");
                    if (fi) fi.click();
                } else if (!clickIn("presets", word)) clickIn("trads", word);
            }
        }
    });
    window.addEventListener("keydown", function (ev) {
        if (ev.key !== "Escape") return;
        if (typeof arena !== "undefined" && arena && arena.active) return; /* Esc = Pointer-Lock im Prüfstand */
        post({ type: "exit", world: "schmiede" });
    });
    post({ type: "ready", world: "schmiede", label: "Anatomie · Klinge", dsl: DSL });
})();
