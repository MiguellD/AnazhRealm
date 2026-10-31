/* ── DER KERN-ANSCHLUSS (Studio-Vertrag Phase 2, ε — docs/studio-vertrag.md §7):
   die generative Substanz (SLIDERS/PRESETS · Stich→Schub→Dicke-Lehre · der EINE
   Builder Strategien × Ordnungen · Türen · Fundament) lebt in ../../porta-core.js
   (__portaCore, VOR diesem Skript geladen) — EINE Quelle für Shell UND
   AnazhRealm-Foundry (G2.1, kein Nachbau; Split-Parität 14/14 hash-bewiesen).
   Die Shell behält Szene/UI/Membran/Türsteuerung und LIEST den Kern. ── */
var PC=window.__portaCore;
var SLIDERS=PC.SLIDERS;
var PRESETS={};Object.keys(PC.PRESETS).forEach(function(id){PRESETS[PC.PRESETS[id].lab]=PC.PRESETS[id].s;});  // Anzeige-Map: Schöpfer-Wortlaut → Dial-Vektor (byte-gleiche Werte)
var lerp=PC.lerp,clamp=PC.clamp,interpTop=PC.interpTop,pk=PC.pk;
/* V18.464 — DIE MEMBRAN LIEST DAS GESETZ (W9-Muster): die Passage-Zahlen wohnen
   in porta-core.MEMBRAN_GESETZ; die Shell INJIZIERT sie in ihr GLSL (GN = Zahl →
   GLSL-float-Literal; semantischer Beweis alt==neu: scripts/diag-membran-gesetz.cjs). */
var MG=PC.MEMBRAN_GESETZ;
function GN(x){var s=String(x);return s.indexOf('.')>=0||s.indexOf('e')>=0||s.indexOf('E')>=0?s:s+'.0';}

var scene,camera,renderer,composer,fxaa,cinePass,controls,clock;
/* ZENSUS 17.07. — der Fluegel-Oeffnungswinkel wohnt im Kern (TUER_GESETZ.offen);
   Shell UND Welt (anazhRealm _tuerOffenRad) lesen die EINE Quelle (fail-soft 1.95). */
var gate,membrane,memMat,rimMat,D,rebuildTimer=null,leafL=null,leafR=null,leafLB=null,leafRB=null,doorAngle=0,doorAngleB=0,doorTarget=0,doorTargetB=0,portalLight,DOOR_OPEN=(PC.TUER_GESETZ&&isFinite(PC.TUER_GESETZ.offen))?PC.TUER_GESETZ.offen:1.95;

// archProfile · interpTop · deriveGate + die Geometrie-Hilfen (tubeMesh/torusMesh/
// barBetween/quadBlock/normalsAlong) leben im Kern (__portaCore) — eine Quelle.

// ============================================================
//  EIN BUILDER — Strategien × ORDNUNGEN (gestaffelt, zurueckweichend)
// ============================================================
function buildGate(p){
  if(!p)p=readParams();
  if(kostenLeiste)kostenLeiste.neu();
  if(gate)scene.remove(gate);
  var R=PC.buildGate(p,{front:doorAngle,back:doorAngleB});                       // die EINE Bau-Quelle (Kern) — Struktur + Türen + Fundament
  gate=R.gate;D=R.D;leafL=R.leafL;leafR=R.leafR;leafLB=R.leafLB;leafRB=R.leafRB;rimMat=R.rimMat;steinLabor(gate);
  scene.add(gate);buildMembrane();controls.target.set(0,D.springY*0.55,0);controls.update();updateLaw();
}

/* DAS STEIN-GESETZ IM LABOR (w4-genesis-tore, porta-core STEIN_GESETZ): derselbe Stein wie in der Welt (`_steinStoff`). Die Lage im
   Verband reist im uv jedes Rahmen-Teils (u = Stein + Weg durch ihn, eine ganze Zahl ist eine Fuge; v = seine Länge in m): der
   Bruchton je Stein, die Fuge als Box-Abdeckung des Pixels, die Kante als Normale (die Fase fällt 45° zur Fuge; der Gradient von u
   in der Fläche aus den Ableitungen am Schirm, Mikkelsen 2010). Die Zahlen injiziert die Shell aus der EINEN Quelle (GN). */
function steinLabor(g){
  var SG=PC.STEIN_GESETZ;if(!SG)return;
  g.traverse(function(o){var m=o.material;if(!o.isMesh||!m||!m.userData||!SG[m.userData.__stein]||m.userData.__steinLabor)return;
    var G=SG[m.userData.__stein],F=GN(G.fuge),K=GN(G.fuge+G.fase);m.userData.__steinLabor=true;
    m.customProgramCacheKey=function(){return 'stein:'+m.userData.__stein;};
    m.onBeforeCompile=function(s){
      s.vertexShader='varying vec2 vSteinUv;\n'+s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n\tvSteinUv = uv;');
      s.fragmentShader='varying vec2 vSteinUv;\n'+s.fragmentShader
        .replace('#include <map_fragment>','#include <map_fragment>\n'+
          '\tfloat sU = vSteinUv.x, sL = max(vSteinUv.y, 1e-3), sT = fract(sU);\n'+
          '\tfloat sD = min(sT, 1.0 - sT) * sL, sAA = max(fwidth(sU) * sL, 1e-5), sH = 0.5 * sAA;\n'+
          '\tfloat sF = clamp((min(sD + sH, '+F+') - max(sD - sH, -'+F+')) / sAA, 0.0, 1.0);\n'+
          '\tfloat sZ = fract(sin(floor(sU) * 12.9898) * 43758.5453);\n'+
          '\tdiffuseColor.rgb *= (1.0 + (2.0 * sZ - 1.0) * '+GN(G.ton)+') * mix(1.0, '+GN(G.fugeTon)+', sF);')
        .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n'+
          '\t{ vec3 sP = -vViewPosition, sX = dFdx(sP), sY = dFdy(sP), sR1 = cross(sY, normal);\n'+
          '\t  float sDet = dot(sX, sR1); sDet = abs(sDet) > 1e-12 ? sDet : 1e-12;\n'+
          '\t  vec3 sG = (sR1 * dFdx(sU) + cross(normal, sX) * dFdy(sU)) / sDet * (sT < 0.5 ? 1.0 : -1.0);\n'+
          '\t  float sGl = length(sG);\n'+
          '\t  float sK = smoothstep('+F+' - sH, '+F+' + sH, sD) * (1.0 - smoothstep('+K+' - sH, '+K+' + sH, sD)) * clamp('+GN(G.fase)+' / sAA, 0.0, 1.0) * step(1e-6, sGl);\n'+
          '\t  normal = normalize(normal - sG / max(sGl, 1e-6) * sK); }');
    };
    m.needsUpdate=true;});
}

// ============================================================
//  PASSAGE — DAS TOR ALS FENSTER (D8): die verformte Oberfläche (die Welle, z) zeigt das ZIEL —
//  das Panorama der Welt (AnazhHuelle.panorama: die Welt des Labors, einmal je Bau von der Tor-Mitte
//  aus, die Membran verborgen) über die Stellvertreter-Kugel des Gesetzes, darüber der Seifenfilm.
//  Dieselben Zahlen wie die Welt (porta-core MEMBRAN_GESETZ.film), dieselbe Technik.
// ============================================================
var laborPano=null;
// DER GESETZ-WERT OHNE NEUBAU (studios.K2): eine Zeile mit `uniform: true` (porta-core GESETZ_WERT) setzt nur die Uniforms der
// Membran aus derselben Quelle (membranUniforms), der Rahmen und das Panorama bleiben.
function membranSetzen(){
  if(!memMat||!D)return;
  var p=readParams();D.p=p;var MU=PC.membranUniforms(p),u=memMat.uniforms,PAL=MU.pal;
  u.uWave.value=MU.wave;u.uSwirl.value=MU.swirl;
  u.uPA.value.fromArray(PAL.PA);u.uPB.value.fromArray(PAL.PB);u.uPC.value.fromArray(PAL.PC);u.uPD.value.fromArray(PAL.PD);
}
function buildMembrane(){
  if(membrane)scene.remove(membrane);
  var p=D.p;
  /* V18.464 — die EINE Zahlen-Quelle: porta-core.membranUniforms (Rahmen aus deriveGate,
     Bogen-Profil-Tabelle, Palette) + MEMBRAN_GESETZ (die GLSL-injizierten Konstanten). */
  var MU=window.__portaCore.membranUniforms(p);
  var FI=MG.film;
  // Bogen-Oberkante als DataTexture (robuste Beschneidung im Shader, statt GLSL-Array)
  var W=MG.profilW,data=new Uint8Array(W*4);
  for(var i=0;i<W;i++){var b=Math.round(MU.profil[i]*255);data[i*4]=b;data[i*4+1]=b;data[i*4+2]=b;data[i*4+3]=255;}
  var topTex=new THREE.DataTexture(data,W,1,THREE.RGBAFormat);topTex.minFilter=THREE.LinearFilter;topTex.magFilter=THREE.LinearFilter;topTex.needsUpdate=true;
  /* ULTRAGUSS U6: das Farb-Gesetz wohnt im Gesetzbuch (__portaCore.membranPalette). */
  var PAL=MU.pal,PA=PAL.PA,PB=PAL.PB,PC=PAL.PC,PD=PAL.PD;
  var centerW=new THREE.Vector3(0,MU.centerY,0.0);
  // DAS ZIEL DES LABORS: die Welt des Labors selbst (ohne Membran), von der Tor-Mitte aus — dieselbe Funktion, die der Welt
  // das Panorama jedes Studios exportiert
  if(laborPano)laborPano.textur.dispose();
  laborPano=AnazhHuelle.panorama(THREE,renderer,scene,[0,MU.centerY,0]);
  memMat=new THREE.ShaderMaterial({uniforms:{
      uTime:{value:0},uCam:{value:new THREE.Vector3()},uPano:{value:laborPano.textur},
      uTopTex:{value:topTex},uLeft:{value:MU.left},uW:{value:MU.spanW},uBaseY:{value:MU.baseY},uHspan:{value:MU.height},uSpringX:{value:MU.springX},
      uWave:{value:MU.wave},uWaveDepth:{value:MU.waveDepth},uRimAx:{value:MU.rimAx},uRimAy:{value:MU.rimAy},uCenter:{value:centerW},
      uSwirl:{value:MU.swirl},uActivate:{value:doorAngle/DOOR_OPEN},uPulse:{value:1},
      uPA:{value:new THREE.Vector3(PA[0],PA[1],PA[2])},uPB:{value:new THREE.Vector3(PB[0],PB[1],PB[2])},uPC:{value:new THREE.Vector3(PC[0],PC[1],PC[2])},uPD:{value:new THREE.Vector3(PD[0],PD[1],PD[2])}},
    side:THREE.DoubleSide,transparent:false,depthWrite:true,
    vertexShader:[
      "precision highp float;uniform float uTime,uWave,uSwirl,uWaveDepth,uRimAx,uRimAy;uniform vec3 uCenter;varying vec2 vXY;varying vec3 vW;varying vec3 vN;varying float vWelle;",
      "float hash(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}",
      "float vn(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}",
      "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*vn(p);p=p*2.05+1.3;a*=.5;}return s;}",
      "float Hfull(vec2 q){",
      " vec2 c=q-uCenter.xy;float r=length(c);float a=atan(c.y,c.x);float t=uTime;",
      " float Rb=1.0/sqrt(pow(cos(a)/uRimAx,2.0)+pow(sin(a)/uRimAy,2.0)+1e-4);",   // Randradius in Blickrichtung (Öffnungs-Ellipse)
      " float rr=clamp(r/Rb,0.0,1.4);",                                            // normiert: 1.0 = Sheetrand
      " float twist=a*"+GN(MG.twistK)+"+uSwirl/(r+"+GN(MG.swirlR0)+");",
      " float om=t*"+GN(MG.om)+",kk="+GN(MG.kk)+";",
      " float outw=sin(rr*kk-om+twist);",                                           // auslaufende Welle
      " float refl=sin((2.0-rr)*kk-om+twist);",                                     // am Rand REFLEKTIERT (Pfad 2-rr) → Interferenz
      " float wave=(outw+refl*"+GN(MG.refl)+")*exp(-rr*"+GN(MG.damp)+");",
      " float pierce=sin(t*"+GN(MG.pierce[0])+")*exp(-rr*rr*"+GN(MG.pierce[1])+")*"+GN(MG.pierce[2])+";",
      " float micro=fbm(c*"+GN(MG.micro[0])+"-vec2(t*"+GN(MG.micro[1])+"))*"+GN(MG.micro[2])+";",
      " float h=clamp((wave*"+GN(MG.hGain[0])+"+pierce+micro)*"+GN(MG.hGain[1])+",-1.0,1.0);",
      " return h*uWaveDepth*("+GN(MG.waveDepthK[0])+"+"+GN(MG.waveDepthK[1])+"*uWave);",
      "}",
      "void main(){vec2 xy=position.xy;vXY=xy;float e="+GN(MG.eps)+";float d0=Hfull(xy),dxx=Hfull(xy+vec2(e,0.0)),dyy=Hfull(xy+vec2(0.0,e));",
      " vec3 dx=vec3(e,0.0,dxx-d0),dy=vec3(0.0,e,dyy-d0);vec3 nrm=normalize(cross(dx,dy));vWelle=d0;",
      " vec3 pos=vec3(xy,d0);vec4 wp=modelMatrix*vec4(pos,1.0);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nrm);",
      " gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);}"].join('\n'),
    fragmentShader:[
      "precision highp float;uniform float uTime,uLeft,uW,uBaseY,uHspan,uSpringX,uRimAx,uRimAy,uWaveDepth,uActivate,uPulse;uniform vec3 uCam,uCenter,uPA,uPB,uPC,uPD;uniform sampler2D uTopTex,uPano;varying vec2 vXY;varying vec3 vW;varying vec3 vN;varying float vWelle;",
      "vec3 pal(float t){return uPA+uPB*cos(6.28318*(uPC*vec3("+GN(FI.welle[0])+","+GN(FI.welle[1])+","+GN(FI.welle[2])+")*t+uPD));}",
      "vec2 equi(vec3 d){return vec2(atan(d.z,d.x)*0.15915494309+0.5,asin(clamp(d.y,-1.0,1.0))*0.31830988618+0.5);}",
      "void main(){",
      " float u=clamp((vXY.x-uLeft)/uW,0.0,1.0);float topY=uBaseY+texture2D(uTopTex,vec2(u,0.5)).r*uHspan;",
      " if(vXY.y>topY+0.002||vXY.y<uBaseY-0.002||abs(vXY.x)>uSpringX+0.002)discard;",
      " vec3 Vd=normalize(uCam-vW);vec3 rd=-Vd;vec3 N0=normalize(vN);vec3 N=dot(N0,Vd)<0.0?-N0:N0;",
      // die Parallaxe: der Strahl trifft die Stellvertreter-Kugel (Radius Tor-Höhe × kugel) um die Tor-Mitte
      " float R=uHspan*"+GN(FI.kugel)+";vec3 oc=vW-uCenter;float bq=dot(oc,rd);float cq=dot(oc,oc)-R*R;float tq=-bq+sqrt(max(bq*bq-cq,0.0));",
      " vec3 dir=normalize((oc+rd*tq)/R-vec3(N.xy,0.0)*"+GN(FI.brechung)+");vec3 ziel=texture2D(uPano,equi(dir)).rgb;",
      // der Seifenfilm: Dicke aus Rand-Abstand und Welle, Gangunterschied je Blickwinkel (Brechzahl n)
      " float rr=length((vXY-uCenter.xy)/vec2(uRimAx,uRimAy));float cosI=max(dot(N,Vd),0.0);",
      " float cosT=sqrt(1.0-(1.0-cosI*cosI)/("+GN(FI.n)+"*"+GN(FI.n)+"));",
      " float dk="+GN(FI.dicke[0])+"+rr*"+GN(FI.dicke[1])+"+vWelle/max(uWaveDepth,1e-3)*"+GN(FI.dicke[2])+"+sin(uTime*"+GN(FI.dicke[4])+"+vXY.y*"+GN(FI.dicke[5])+")*"+GN(FI.dicke[3])+";",
      " vec3 f0=max(pal(dk*cosT*2.0),vec3(0.0));float fL=dot(f0,vec3(0.2126,0.7152,0.0722));vec3 film=max(mix(vec3(fL),f0,"+GN(FI.farbe)+"),vec3(0.0));",
      " float fres="+GN(FI.fresnel[0])+"+(1.0-"+GN(FI.fresnel[0])+")*pow(1.0-cosI,"+GN(FI.fresnel[1])+");",
      " float rand=smoothstep("+GN(FI.rand[0])+","+GN(FI.rand[1])+",rr);",
      " float fw=min(fres+rand*"+GN(FI.rand[2])+"+"+GN(FI.basis)+","+GN(FI.gewichtMax)+")*("+GN(FI.act[0])+"+"+GN(FI.act[1])+"*uActivate);",
      " vec3 spiegel=texture2D(uPano,equi(reflect(rd,N))).rgb;",
      " vec3 glanz=film*spiegel*"+GN(FI.glanz[0])+"*("+GN(FI.glanz[1])+"+"+GN(FI.glanz[2])+"*uPulse);",
      " gl_FragColor=vec4(mix(ziel,glanz,fw),1.0);",
      " #include <tonemapping_fragment>",
      " #include <encodings_fragment>",
      "}"].join('\n')});
  var geo=new THREE.PlaneGeometry(MU.spanW,MU.height,MG.seg,MG.seg);geo.translate(0,MU.midY,0);
  membrane=new THREE.Mesh(geo,memMat);membrane.position.set(0,0,0.0);membrane.castShadow=false;membrane.frustumCulled=false;scene.add(membrane);
}

// pk (Slider-id → Bau-Schlüssel) lebt im Kern — oben als PC.pk aliast (eine Quelle).
// DIE HÜLLE (K41): die Regler-Werte leben in W (Slider-id → Wert, geschrieben vom EINEN Generator), nie im DOM.
var W={},regler=null,sitz=null,kostenLeiste=null,aktivPreset='Kathedrale';
function readParams(){var p={M:1.4};SLIDERS.forEach(function(s){if(s[1]==='h')return;p[pk(s[0])]=W[s[0]];});return p;}
function setParams(v){if(regler)regler.setzen(v,true);else Object.assign(W,v);}
function presetMarke(name){aktivPreset=name;[].forEach.call(document.getElementById('presets').children,function(b){b.classList.toggle('active',b.textContent===name);});}
function rezeptId(){var ids=Object.keys(PC.PRESETS);for(var i=0;i<ids.length;i++)if(PC.PRESETS[ids[i]].lab===aktivPreset)return ids[i];return ids[0];}
// V18.491.132 MESSEN_VIS.lab=law-ui
function updateLaw(){var el=document.getElementById('law');if(!el)return;el.textContent='Strategien: Mauer '+D.p.wMason.toFixed(2)+' Geflecht '+D.p.wBraid.toFixed(2)+' Mono '+D.p.wMono.toFixed(2)+' Lace '+D.p.wLace.toFixed(2)+'\nMotive: Leier '+D.p.wLyra.toFixed(2)+' Vitruv '+D.p.wVitruv.toFixed(2)+' Geweih '+D.p.wGeweih.toFixed(2)+'\nOrdnungen='+Math.round(D.p.orders)+' (gestaffelt, zurückweichend)\nStich='+D.rise.toFixed(2)+'→Schub='+D.thrustNorm.toFixed(2)+'→Dicke='+D.jambW.toFixed(2);}

function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x080808);
  camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,0.1,140);camera.position.set(0,3.6,15.6);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  try{var c=document.createElement('canvas');c.width=256;c.height=256;var x=c.getContext('2d');var g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#aabbcc');g.addColorStop(0.5,'#333');g.addColorStop(1,'#050505');x.fillStyle=g;x.fillRect(0,0,256,256);var t=new THREE.CanvasTexture(c);var pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(t).texture;t.dispose();}catch(e){}
  scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.6));
  var key=new THREE.DirectionalLight(0xffe0b0,3.0);key.position.set(5,8,5);key.castShadow=true;key.shadow.mapSize.width=2048;key.shadow.mapSize.height=2048;key.shadow.bias=-0.0001;key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=13;key.shadow.camera.bottom=-4;key.shadow.camera.near=0.5;key.shadow.camera.far=46;scene.add(key);
  var rl=new THREE.DirectionalLight(0x33aaff,2.0);rl.position.set(-5,4,-5);scene.add(rl);
  /* V18.491.126 — GLUT_GESETZ: Lab+Host portal PointLight (fail-soft Literale). */
  var _G=(PC&&PC.GLUT_GESETZ)?PC.GLUT_GESETZ:{};portalLight=new THREE.PointLight(_G.color!=null?_G.color:0xffd9a0,_G.i0!=null?_G.i0:0.3,_G.dist!=null?_G.dist:14,_G.decay!=null?_G.decay:2);portalLight.position.set(0,3,0.4);scene.add(portalLight);
  composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.24,0.5,1.05));
  fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
  var cine={uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D tDiffuse;uniform float time;varying vec2 vUv;float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}float getLum(vec2 uv){return dot(texture2D(tDiffuse,uv).rgb,vec3(0.299,0.587,0.114));}void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float dist=length(dir);vec2 o=dir*dist*0.008;float r=texture2D(tDiffuse,uv+o).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-o).b;vec3 color=vec3(r,g,b);float lum=getLum(uv);float lL=getLum(uv-vec2(0.001,0.0)),lR=getLum(uv+vec2(0.001,0.0)),lU=getLum(uv-vec2(0.0,0.001)),lD=getLum(uv+vec2(0.0,0.001));float edge=abs(lL-lum)+abs(lR-lum)+abs(lU-lum)+abs(lD-lum);color*=(1.0+edge*2.0);color*=smoothstep(1.2,0.1,dist*1.3);color+=random(uv+time)*0.03-0.015;gl_FragColor=vec4(color,1.0);}'};
  cinePass=new THREE.ShaderPass(cine);cinePass.renderToScreen=true;composer.addPass(cinePass);
  controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=44;clock=new THREE.Clock();
  // DIE HÜLLE (K41): Sitzung (Undo/Redo · Same · Schloss je Achse) + der EINE Regler-Generator aus PARAMS_BY_KIND.gate
  // (die Vertrags-Sicht von SLIDERS; Entprellung 90 ms wie zuvor) + die Kosten-Leiste der Welt-Gestalt je Stufe.
  var GATE_PARAMS=PC.PARAMS_BY_KIND.gate;
  sitz=AnazhHuelle.sitzung({werte:W,sperren:true,zustand:function(){return {preset:aktivPreset};},
    zustandSetzen:function(z){presetMarke(z.preset);},anwenden:function(){buildGate();}});
  sitz.leiste(document.getElementById('sitzung'));
  regler=AnazhHuelle.regler(document.getElementById('sliders'),GATE_PARAMS,{werte:W,ruheMs:90,sitzung:sitz,
    basis:function(){return PRESETS[aktivPreset]||null;},
    bei:function(){presetMarke(null);},nachRuhe:function(ids,bau){if(bau)buildGate();else membranSetzen();}});
  kostenLeiste=AnazhHuelle.kosten(document.getElementById('kosten'),{budget:PC.PORTAL_RENDER_CONFIG.lod.budget.gate,
    stufen:PC.PORTAL_RENDER_CONFIG.lod.kindStages.gate,bauen:function(s){return PC.buildInstance(rezeptId(),1,s,W);},renderer:function(){return renderer;},
    quelle:'gemessen an der Welt-Gestalt (porta-core buildInstance, die Regler als ov); L3·Wurf = die NUR-WURF-Hülle'});
  var pc=document.getElementById('presets');Object.keys(PRESETS).forEach(function(name){var b=document.createElement('button');b.textContent=name;b.onclick=function(){sitz.schritt(function(){presetMarke(name);setParams(PRESETS[name]);buildGate();});};pc.appendChild(b);});
  // Der Zufallspunkt ist der Würfel der Sitzung: ein neuer Same zieht jede freie Achse (das Schloss hält eine fest).
  document.getElementById('rnd').onclick=function(){presetMarke(null);sitz.wuerfeln(GATE_PARAMS);};
  presetMarke('Kathedrale');setParams(PRESETS.Kathedrale);buildGate();animate();
}
function updatePrompt(){var dp=document.getElementById('doorPrompt');if(!dp)return;dp.innerHTML='[E] Vordertür '+(doorTarget>0.5?'schließen':'öffnen')+'  ·  [R] Hintertür '+(doorTargetB>0.5?'schließen':'öffnen');}
function animate(){requestAnimationFrame(animate);var t=clock.getElapsedTime();
 doorAngle+=(doorTarget-doorAngle)*0.07;doorAngleB+=(doorTargetB-doorAngleB)*0.07;
 var openF=doorAngle/DOOR_OPEN,openB=doorAngleB/DOOR_OPEN,openM=Math.max(openF,openB);
 if(leafL)leafL.rotation.y=-doorAngle;if(leafR)leafR.rotation.y=doorAngle;
 if(leafLB)leafLB.rotation.y=doorAngleB;if(leafRB)leafRB.rotation.y=-doorAngleB;
 if(memMat){memMat.uniforms.uTime.value=t;memMat.uniforms.uCam.value.copy(camera.position);
  if(memMat.uniforms.uActivate)memMat.uniforms.uActivate.value=openM;
  if(memMat.uniforms.uPulse)memMat.uniforms.uPulse.value=0.5+0.5*Math.sin(t*MG.puls);
  if(memMat.uniforms.uWaveDepth&&D)memMat.uniforms.uWaveDepth.value=D.zFace*(MG.aktivDepth[0]+MG.aktivDepth[1]*openM);}   // zu: kaum; offen: bis zur Eingangsebene (Gesetz aktivDepth)
 var pulse=0.5+0.5*Math.sin(t*MG.puls);                                // gemeinsamer Atem — Portal + Glut (Gesetz puls)
 // V18.491.159 GLUT_GESETZ cold fallback fail-soft (i0/iOpen/pulseBase/pulseAmp; live glutIntensity first)
 if(portalLight&&D){var _Gy=(PC&&PC.GLUT_GESETZ)?PC.GLUT_GESETZ:{};portalLight.position.set(0,D.springY*(_Gy.ySpring||0.55),0.0);portalLight.intensity=(PC&&typeof PC.glutIntensity==='function')?PC.glutIntensity(openM,pulse):((_Gy.i0||0.3)+openM*(_Gy.iOpen||3.4))*((_Gy.pulseBase||0.8)+(_Gy.pulseAmp||0.28)*pulse);}
 cinePass.uniforms.time.value=t;if(rimMat){var pr=0.85+0.15*Math.sin(t*1.6);rimMat.color.setHSL(0.11,0.6,0.55);rimMat.color.multiplyScalar((0.7+2.6*Math.max(D.p.glow,0.25))*pr*(1.0+openM*0.9));}
 fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);controls.update();
 composer.render();}
addEventListener('resize',function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
addEventListener('keydown',function(e){if(e.repeat)return;var ch=false;if(e.key==='e'||e.key==='E'){doorTarget=doorTarget>0.5?0.0:DOOR_OPEN;ch=true;}if(e.key==='r'||e.key==='R'){doorTargetB=doorTargetB>0.5?0.0:DOOR_OPEN;ch=true;}if(ch)updatePrompt();});
init();

/* ==================== DIE BRÜCKE ZUR HEIMAT (die Hülle, K41) ==================== */
/* EINE Brücke (../huelle/huelle.js): die Tor-Ordnungen über die Preset-Knöpfe (#presets), „zufall" über den Würfel der
   Sitzung (#rnd); das Einzelwort der Heimat ganz. */
AnazhHuelle.bruecke({
    welt: "portale",
    panorama: function () {
        return { THREE: THREE, renderer: renderer, scene: scene, kamera: camera, verbergen: membrane ? [membrane] : [] };
    },
    label: "Porta — Ordnungen & fraktale Tiefe",
    dsl: ["drachentor", "kathedrale", "maschine", "geisttor", "verkalkt", "ruine", "maurentor", "zufall"],
    wort: function (w) {
        if (w === "zufall") document.getElementById("rnd").click();
        else AnazhHuelle.knopfMitText(document.getElementById("presets"), w);
    },
    // DAS WERK DER BÜHNE (der EINE Übergabe-Kanal der Hülle): die Ordnung mit Same 1 und den Werten ihrer Regler-Zeilen (die
    // Welt-Gestalt der Kosten-Leiste) — das nächste gesetzte Tor der Ordnung trägt es.
    werk: function () {
        var ov = {};
        PC.PARAMS_BY_KIND.gate.forEach(function (z) {
            ov[z.id] = W[z.id];
        });
        return { kind: "gate", preset: rezeptId(), seed: 1, ov: ov };
    },
});