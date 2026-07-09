/* ── DER KERN-ANSCHLUSS (Studio-Vertrag Phase 2, ε — docs/studio-vertrag.md §7):
   die generative Substanz (SLIDERS/PRESETS · Stich→Schub→Dicke-Lehre · der EINE
   Builder Strategien × Ordnungen · Türen · Fundament) lebt in ../../porta-core.js
   (__portaCore, VOR diesem Skript geladen) — EINE Quelle für Shell UND
   AnazhRealm-Foundry (G2.1, kein Nachbau; Split-Parität 14/14 hash-bewiesen).
   Die Shell behält Szene/UI/Membran/Bodennebel/Türsteuerung und LIEST den Kern. ── */
var PC=window.__portaCore;
var SLIDERS=PC.SLIDERS;
var PRESETS={};Object.keys(PC.PRESETS).forEach(function(id){PRESETS[PC.PRESETS[id].lab]=PC.PRESETS[id].s;});  // Anzeige-Map: Schöpfer-Wortlaut → Dial-Vektor (byte-gleiche Werte)
var lerp=PC.lerp,clamp=PC.clamp,interpTop=PC.interpTop,pk=PC.pk;

var scene,camera,renderer,composer,fxaa,cinePass,controls,clock;
var gate,membrane,memMat,rimMat,D,rebuildTimer=null,leafL=null,leafR=null,leafLB=null,leafRB=null,doorAngle=0,doorAngleB=0,doorTarget=0,doorTargetB=0,portalLight,fogGroup=null,fogMat=null,depthRT=null,DOOR_OPEN=1.95;

// archProfile · interpTop · deriveGate + die Geometrie-Hilfen (tubeMesh/torusMesh/
// barBetween/quadBlock/normalsAlong) leben im Kern (__portaCore) — eine Quelle.

// ============================================================
//  EIN BUILDER — Strategien × ORDNUNGEN (gestaffelt, zurueckweichend)
// ============================================================
function buildGate(p){
  if(!p)p=readParams();
  if(gate)scene.remove(gate);
  var R=PC.buildGate(p,{front:doorAngle,back:doorAngleB});                       // die EINE Bau-Quelle (Kern) — Struktur + Türen + Fundament
  gate=R.gate;D=R.D;leafL=R.leafL;leafR=R.leafR;leafLB=R.leafLB;leafRB=R.leafRB;rimMat=R.rimMat;
  scene.add(gate);buildMembrane();buildFog();controls.target.set(0,D.springY*0.55,0);controls.update();updateLaw();
}

// ============================================================
//  PASSAGE — VERFORMTE 3D-Oberflaeche (Wasser, extrem) + RAYMARCH.
//  Echte z-Verformung (Geometrie faengt Licht) + weltverankerter
//  Strahlmarsch ins fraktale Innere = echte Parallaxe. Kein flaches Sheet.
// ============================================================
function buildMembrane(){
  if(membrane)scene.remove(membrane);
  var prof=D.prof,springY=D.springY,baseY=D.baseY,M=D.M,p=D.p;
  var left=D.leftSpringX,right=D.rightSpringX,apexY=D.apexY;
  var spanW=right-left,height=apexY-baseY,midY=(baseY+apexY)/2;
  // Bogen-Oberkante als DataTexture (robuste Beschneidung im Shader, statt GLSL-Array)
  var W=64,data=new Uint8Array(W*4);
  for(var i=0;i<W;i++){var xx=left+spanW*i/(W-1);var ty=interpTop(prof,xx)+springY;var tn=clamp((ty-baseY)/Math.max(0.001,height),0,1);var b=Math.round(tn*255);data[i*4]=b;data[i*4+1]=b;data[i*4+2]=b;data[i*4+3]=255;}
  var topTex=new THREE.DataTexture(data,W,1,THREE.RGBAFormat);topTex.minFilter=THREE.LinearFilter;topTex.magFilter=THREE.LinearFilter;topTex.needsUpdate=true;
  var warm=[1.95,1.45,0.85],cold=[0.4,0.6,1.5],core=[lerp(cold[0],warm[0],p.temp),lerp(cold[1],warm[1],p.temp),lerp(cold[2],warm[2],p.temp)];
  var centerW=new THREE.Vector3(0,baseY+D.jambH*0.55,0.0);
  // SATURIERTE Kosinus-Palette (IQ): a+b·cos(2π(c·t+d)). Familie aus temp, Sättigung aus energy, Verschiebung aus realm.
  var dWarm=[0.00,0.12,0.20],dCool=[0.60,0.50,0.42],dCryst=[0.30,0.55,0.85];
  var dd=[lerp(dCool[0],dWarm[0],p.temp),lerp(dCool[1],dWarm[1],p.temp),lerp(dCool[2],dWarm[2],p.temp)];
  dd=[lerp(dd[0],dCryst[0],p.realm*0.5),lerp(dd[1],dCryst[1],p.realm*0.5),lerp(dd[2],dCryst[2],p.realm*0.5)];
  var sat=0.42+0.34*p.energy;
  var PA=[0.5,0.5,0.5],PB=[sat,sat,sat],PC=[1.0+p.realm*0.8,1.0+p.realm*0.4,1.0],PD=dd;
  memMat=new THREE.ShaderMaterial({uniforms:{
      uTime:{value:0},uCam:{value:new THREE.Vector3()},
      uTopTex:{value:topTex},uLeft:{value:left},uW:{value:spanW},uBaseY:{value:baseY},uHspan:{value:height},uSpringX:{value:Math.max(Math.abs(left),Math.abs(right))},
      uWave:{value:clamp(p.wave,0,1)},uWaveDepth:{value:Math.max(0.05,D.zFace*0.10)},uRimAx:{value:Math.abs(D.leftSpringX)},uRimAy:{value:(D.apexY-D.baseY)*0.52},uStep:{value:0.06+p.tunnel*0.20},uTwist:{value:p.twist},uFrac:{value:p.fractal},uEnergy:{value:p.energy},uOpen:{value:clamp(0.4+p.energy*0.6,0,1)},uCenter:{value:centerW},
      uRealm:{value:p.realm},uSwirl:{value:p.swirl*0.5},uReflect:{value:p.reflect},uActivate:{value:doorAngle/DOOR_OPEN},uPulse:{value:1},
      uPA:{value:new THREE.Vector3(PA[0],PA[1],PA[2])},uPB:{value:new THREE.Vector3(PB[0],PB[1],PB[2])},uPC:{value:new THREE.Vector3(PC[0],PC[1],PC[2])},uPD:{value:new THREE.Vector3(PD[0],PD[1],PD[2])}},
    side:THREE.DoubleSide,transparent:false,depthWrite:true,
    vertexShader:[
      "precision highp float;uniform float uTime,uWave,uSwirl,uWaveDepth,uRimAx,uRimAy;uniform vec3 uCenter;varying vec2 vXY;varying vec3 vW;varying vec3 vN;",
      "float hash(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}",
      "float vn(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}",
      "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*vn(p);p=p*2.05+1.3;a*=.5;}return s;}",
      "float Hfull(vec2 q){",
      " vec2 c=q-uCenter.xy;float r=length(c);float a=atan(c.y,c.x);float t=uTime;",
      " float Rb=1.0/sqrt(pow(cos(a)/uRimAx,2.0)+pow(sin(a)/uRimAy,2.0)+1e-4);",   // Randradius in Blickrichtung (Öffnungs-Ellipse)
      " float rr=clamp(r/Rb,0.0,1.4);",                                            // normiert: 1.0 = Sheetrand
      " float twist=a*2.0+uSwirl/(r+0.25);",                                        // gleiche Windung wie Farbspirale → verschmilzt
      " float om=t*3.0,kk=13.8;",                                                   // Wellenzahl skaliert mit Öffnung
      " float outw=sin(rr*kk-om+twist);",                                           // auslaufende Welle
      " float refl=sin((2.0-rr)*kk-om+twist);",                                     // am Rand REFLEKTIERT (Pfad 2-rr) → Interferenz
      " float wave=(outw+refl*0.72)*exp(-rr*0.7);",                                 // stehende Welle, am Rand verdichtet
      " float pierce=sin(t*2.2)*exp(-rr*rr*6.0)*1.5;",                             // zentraler Tropfen-Durchstoß (oszilliert durch)
      " float micro=fbm(c*3.0-vec2(t*0.3))*0.10;",
      " float h=clamp((wave*0.55+pierce+micro)*0.62,-1.0,1.0);",                    // normiert [-1,1]
      " return h*uWaveDepth*(0.65+0.35*uWave);",                                    // Tiefe aus Geometrie ((Ebenen-2)·Schritt), NIE über die Türebene
      "}",
      "void main(){vec2 xy=position.xy;vXY=xy;float e=0.06;float d0=Hfull(xy),dxx=Hfull(xy+vec2(e,0.0)),dyy=Hfull(xy+vec2(0.0,e));",
      " vec3 dx=vec3(e,0.0,dxx-d0),dy=vec3(0.0,e,dyy-d0);vec3 nrm=normalize(cross(dx,dy));",
      " vec3 pos=vec3(xy,d0);vec4 wp=modelMatrix*vec4(pos,1.0);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nrm);",
      " gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);}"].join('\n'),
    fragmentShader:[
      "precision highp float;uniform float uTime,uLeft,uW,uBaseY,uHspan,uSpringX,uStep,uTwist,uFrac,uEnergy,uOpen,uRealm,uSwirl,uReflect,uActivate,uPulse;uniform vec3 uCam,uCenter,uPA,uPB,uPC,uPD;uniform sampler2D uTopTex;varying vec2 vXY;varying vec3 vW;varying vec3 vN;",
      "float hash(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}",
      "float vn(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}",
      "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.05+1.3;a*=.5;}return s;}",
      "vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}",
      "vec3 pal(float t){return uPA+uPB*cos(6.28318*(uPC*t+uPD));}",
      "void main(){",
      " float u=clamp((vXY.x-uLeft)/uW,0.0,1.0);float topY=uBaseY+texture2D(uTopTex,vec2(u,0.5)).r*uHspan;",
      " if(vXY.y>topY+0.002||vXY.y<uBaseY-0.002||abs(vXY.x)>uSpringX+0.002)discard;",
      " vec3 N=normalize(vN);vec3 Vd=normalize(uCam-vW);vec3 rd=-Vd;",
      " float w0=max(0.0,1.0-abs(uRealm-0.0)/0.40);",
      " float w1=max(0.0,1.0-abs(uRealm-0.34)/0.40);",
      " float w2=max(0.0,1.0-abs(uRealm-0.67)/0.40);",
      " float w3=max(0.0,1.0-abs(uRealm-1.0)/0.40);",
      " float ws=w0+w1+w2+w3+1e-4;w0/=ws;w1/=ws;w2/=ws;w3/=ws;",
      " vec3 inter=vec3(0.0);float att=1.0;",
      " for(int i=0;i<12;i++){",
      "   vec3 q=vW+rd*(float(i)*uStep+0.04);vec3 rel=q-uCenter;",
      "   float r=max(length(rel.xy),0.003);float ang=atan(rel.y,rel.x);float dep=float(i)*uStep*1.6+r*0.1;",
      "   float t=uTime;float sp=t*(0.3+uEnergy*0.6);float lp=log(r)*2.0-sp;float swirl=ang+uSwirl/r;float frq=1.0+uFrac*2.2;",
      "   float v=0.0,tc=0.0;",
      "   if(w0>0.001){float s0=0.5+0.5*sin(lp*3.0*frq+swirl*2.0+uTwist*dep*4.0);v+=w0*s0*s0;tc+=w0*fract(lp*0.15+0.5*swirl/6.28318);}",
      "   if(w1>0.001){float K=8.0+uFrac*9.0;float fa=abs(mod(swirl,6.28318/K)-3.14159/K);float cc=0.5+0.5*cos(fa*K);v+=w1*cc*cc*cc*(0.5+0.5*sin(lp*4.0*frq));tc+=w1*fract(fa*1.5+lp*0.1);}",
      "   if(w2>0.001){float warp=fbm(vec2(lp*0.7*frq,dep*0.6+sp*0.2));float pf=fbm(vec2(ang*2.4+warp*3.5,dep*1.4*frq-sp*0.5));pf=1.0-abs(2.0*pf-1.0);float plasma=pow(clamp(pf,0.0,1.0),3.0);v+=w2*plasma*1.25;tc+=w2*fract(pf*1.3+lp*0.08+dep*0.15);}",
      "   if(w3>0.001){float n1=fbm(vec2(ang*1.0*frq+sin(lp)*0.6,dep*0.7+sp*0.12));float n2=fbm(vec2(ang*2.2*frq-n1*1.5,dep*1.3+sp*0.2));float neb=pow(clamp(n1*n2*2.0,0.0,1.0),2.0);v+=w3*neb*1.0;tc+=w3*fract(n1*1.2+dep*0.18);}",
      "   v=max(0.0,v-0.10)*1.4;",
      "   float g=v/(1.0+r*r*2.2+dep*0.35);",
      "   inter+=pal(tc)*g*att;att*=0.9;",
      " }",
      " vec3 Rf=reflect(-Vd,N);",
      " float st=step(0.955,hash(floor(Rf.xy*95.0+vec2(Rf.z*5.0))));",
      " vec3 sky=pal(Rf.y*0.5+0.5)*0.30+vec3(st)*0.42;",
      " float fres=pow(1.0-max(dot(N,Vd),0.0),3.0);",
      " float spec=pow(max(dot(Rf,normalize(vec3(0.4,0.7,0.6))),0.0),60.0);",
      " float dc=length((vW-uCenter).xy);float core=exp(-dc*dc*12.0)*(0.5+uOpen*0.5)*(0.7+0.3*sin(uTime*1.4));",
      " vec3 col=inter*1.35+sky*fres*uReflect*0.55+vec3(1.0,0.95,0.85)*spec*1.5*uReflect+pal(0.1)*core*1.0;",
      "  col*=1.4*(0.55+0.55*uActivate)*(0.90+0.13*uPulse);gl_FragColor=vec4(aces(col),1.0);",
      "}"].join('\n')});
  var geo=new THREE.PlaneGeometry(spanW,height,90,90);geo.translate(0,midY,0);
  membrane=new THREE.Mesh(geo,memMat);membrane.position.set(0,0,0.0);membrane.castShadow=false;membrane.frustumCulled=false;scene.add(membrane);
}

// pk (Slider-id → Bau-Schlüssel) lebt im Kern — oben als PC.pk aliast (eine Quelle).
function readParams(){var p={M:1.4};SLIDERS.forEach(function(s){if(s[1]==='h')return;p[pk(s[0])]=parseFloat(document.getElementById('s_'+s[0]).value);});return p;}
function setParams(v){SLIDERS.forEach(function(s){if(s[1]==='h')return;var el=document.getElementById('s_'+s[0]);if(v[s[0]]!==undefined){el.value=v[s[0]];document.getElementById('v_'+s[0]).textContent=(+v[s[0]]).toFixed(2);}});}
function updateLaw(){var el=document.getElementById('law');if(!el)return;el.textContent='Strategien: Mauer '+D.p.wMason.toFixed(2)+' Geflecht '+D.p.wBraid.toFixed(2)+' Mono '+D.p.wMono.toFixed(2)+' Lace '+D.p.wLace.toFixed(2)+'\nOrdnungen='+Math.round(D.p.orders)+' (gestaffelt, zurückweichend)\nStich='+D.rise.toFixed(2)+'→Schub='+D.thrustNorm.toFixed(2)+'→Dicke='+D.jambW.toFixed(2);}

function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x080808);
  camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,0.1,140);camera.position.set(0,3.6,15.6);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  try{var c=document.createElement('canvas');c.width=256;c.height=256;var x=c.getContext('2d');var g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#aabbcc');g.addColorStop(0.5,'#333');g.addColorStop(1,'#050505');x.fillStyle=g;x.fillRect(0,0,256,256);var t=new THREE.CanvasTexture(c);var pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(t).texture;t.dispose();}catch(e){}
  scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.6));
  var key=new THREE.DirectionalLight(0xffe0b0,3.0);key.position.set(5,8,5);key.castShadow=true;key.shadow.mapSize.width=2048;key.shadow.mapSize.height=2048;key.shadow.bias=-0.0001;key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=13;key.shadow.camera.bottom=-4;key.shadow.camera.near=0.5;key.shadow.camera.far=46;scene.add(key);
  var rl=new THREE.DirectionalLight(0x33aaff,2.0);rl.position.set(-5,4,-5);scene.add(rl);
  portalLight=new THREE.PointLight(0xffd9a0,0.3,14,2);portalLight.position.set(0,3,0.4);scene.add(portalLight);
  composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.24,0.5,1.05));
  var _pr=renderer.getPixelRatio()*0.42,_dw=Math.max(2,Math.floor(innerWidth*_pr)),_dh=Math.max(2,Math.floor(innerHeight*_pr));depthRT=new THREE.WebGLRenderTarget(_dw,_dh);depthRT.depthTexture=new THREE.DepthTexture(_dw,_dh);depthRT.depthTexture.type=THREE.UnsignedShortType;
  fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
  var cine={uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D tDiffuse;uniform float time;varying vec2 vUv;float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}float getLum(vec2 uv){return dot(texture2D(tDiffuse,uv).rgb,vec3(0.299,0.587,0.114));}void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float dist=length(dir);vec2 o=dir*dist*0.008;float r=texture2D(tDiffuse,uv+o).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-o).b;vec3 color=vec3(r,g,b);float lum=getLum(uv);float lL=getLum(uv-vec2(0.001,0.0)),lR=getLum(uv+vec2(0.001,0.0)),lU=getLum(uv-vec2(0.0,0.001)),lD=getLum(uv+vec2(0.0,0.001));float edge=abs(lL-lum)+abs(lR-lum)+abs(lU-lum)+abs(lD-lum);color*=(1.0+edge*2.0);color*=smoothstep(1.2,0.1,dist*1.3);color+=random(uv+time)*0.03-0.015;gl_FragColor=vec4(color,1.0);}'};
  cinePass=new THREE.ShaderPass(cine);cinePass.renderToScreen=true;composer.addPass(cinePass);
  controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=44;clock=new THREE.Clock();
  var sd=document.getElementById('sliders');
  SLIDERS.forEach(function(s){if(s[1]==='h'){var hd=document.createElement('div');hd.className='h';hd.textContent=s[0]==='VOK'?'— VOKABULAR —':s[0]==='DEP'?'— TIEFE / PASSAGE —':s[0]==='FORM'?'— FORM —':'— MATERIAL / SCHWELLE —';sd.appendChild(hd);return;}var cl=s[7]===1?' voc':s[7]===2?' dep':'';var row=document.createElement('div');row.className='sl'+cl;row.innerHTML='<label>'+s[1]+'</label><input type="range" id="s_'+s[0]+'" min="'+s[2]+'" max="'+s[3]+'" step="'+s[4]+'" value="'+s[5]+'"><span class="v" id="v_'+s[0]+'">'+(+s[5]).toFixed(2)+'</span>';sd.appendChild(row);});
  SLIDERS.forEach(function(s){if(s[1]==='h')return;document.getElementById('s_'+s[0]).addEventListener('input',function(){document.getElementById('v_'+s[0]).textContent=parseFloat(this.value).toFixed(2);clearTimeout(rebuildTimer);rebuildTimer=setTimeout(function(){buildGate();},90);[].forEach.call(document.getElementById('presets').children,function(b){b.classList.remove('active');});});});
  var pc=document.getElementById('presets');Object.keys(PRESETS).forEach(function(name,ix){var b=document.createElement('button');b.textContent=name;if(ix===0)b.className='active';b.onclick=function(){[].forEach.call(pc.children,function(x){x.classList.remove('active');});b.className='active';setParams(PRESETS[name]);buildGate();};pc.appendChild(b);});
  document.getElementById('rnd').onclick=function(){var v={};SLIDERS.forEach(function(s){if(s[1]==='h')return;v[s[0]]=s[4]>=1?Math.round(s[2]+Math.random()*(s[3]-s[2])):s[2]+Math.random()*(s[3]-s[2]);});setParams(v);[].forEach.call(pc.children,function(b){b.classList.remove('active');});buildGate();};
  setParams(PRESETS.Kathedrale);buildGate();animate();
}
function buildFog(){
  if(fogGroup&&fogGroup.parent)scene.remove(fogGroup);
  fogGroup=new THREE.Group();
  var cy=D.baseY+D.jambH*0.55, rimAx=Math.abs(D.leftSpringX), rimAy=(D.apexY-D.baseY)*0.52;
  var coneAdd=(D.orders-1)*D.jambW/rimAx;
  var hx=rimAx*(1.0+coneAdd)*1.08, hz=D.zFace*1.04;
  var mxY=cy+rimAy*(1.0+coneAdd)*1.08, mnY=D.baseY-0.12;                                                        // unten am Boden gekappt → Aura geht nicht durch den Boden
  fogMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uAct:{value:0},uPulse:{value:1},uCam:{value:new THREE.Vector3()},
      uBoxMin:{value:new THREE.Vector3(-hx,mnY,-hz)},uBoxMax:{value:new THREE.Vector3(hx,mxY,hz)},
      uCenter:{value:new THREE.Vector3(0,cy,0)},uRimAx:{value:rimAx},uRimAy:{value:rimAy},uSwirl:{value:D.p.swirl*0.5},uZFace:{value:D.zFace},uConeAdd:{value:coneAdd},uFloorY:{value:D.baseY},
      uPA:{value:new THREE.Vector3(0.6,0.6,0.7)},uPB:{value:new THREE.Vector3(0.3,0.3,0.3)},uPC:{value:new THREE.Vector3(1,1,1)},uPD:{value:new THREE.Vector3(0,0.1,0.2)},
      uDepth:{value:depthRT?depthRT.depthTexture:null},uResolution:{value:new THREE.Vector2(innerWidth,innerHeight)},
      uNear:{value:0.1},uFar:{value:140.0},uViewMatrix:{value:new THREE.Matrix4()}},
    vertexShader:`precision highp float;varying vec3 vW;varying vec4 vClip;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;vClip=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position=vClip;}`,
    fragmentShader:`precision highp float;
uniform float uTime,uAct,uPulse,uNear,uFar,uRimAx,uRimAy,uSwirl,uZFace,uConeAdd,uFloorY;uniform vec3 uCam,uBoxMin,uBoxMax,uCenter,uPA,uPB,uPC,uPD;
uniform vec2 uResolution;uniform mat4 uViewMatrix;uniform sampler2D uDepth;varying vec3 vW;varying vec4 vClip;
float h3(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm3(vec3 p){float s=0.,a=.5;for(int k=0;k<2;k++){s+=a*vn3(p);p=p*2.02+1.3;a*=.5;}return s*1.2;}
vec3 pal(float t){return uPA+uPB*cos(6.28318*(uPC*t+uPD));}
vec2 rayBox(vec3 ro,vec3 rd,vec3 bmin,vec3 bmax){vec3 t0=(bmin-ro)/rd,t1=(bmax-ro)/rd,tm=min(t0,t1),tx=max(t0,t1);return vec2(max(max(tm.x,tm.y),tm.z),min(min(tx.x,tx.y),tx.z));}
float h21(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}
float viewZ(float d){return (uNear*uFar)/((uFar-uNear)*d-uFar);}
void main(){
  vec3 ro=uCam, rd=normalize(vW-uCam);
  vec2 tb=rayBox(ro,rd,uBoxMin,uBoxMax);
  float tn=max(tb.x,0.0),tf=tb.y; if(tf<=tn)discard;
  vec2 suv=(vClip.xy/vClip.w)*0.5+0.5;
  float sceneVZ=viewZ(texture2D(uDepth,suv).x);
  float jit=h21(suv*uResolution+fract(uTime));
  float trans=1.0; vec3 acc=vec3(0.0); float dt=(tf-tn)/24.0;
  float om=uTime*3.0,kk=13.8;
  for(int i=0;i<24;i++){
    float tt=tn+(float(i)+jit)*dt; vec3 p=ro+rd*tt;
    if((uViewMatrix*vec4(p,1.0)).z < sceneVZ) break;
    vec2 c=p.xy-uCenter.xy; float r=length(c)+1e-3; float a=atan(c.y,c.x);
    float Rb=1.0/sqrt(pow(cos(a)/uRimAx,2.0)+pow(sin(a)/uRimAy,2.0)+1e-4);
    float rr=r/Rb;                                                          // 1.0 = Sheetrand (identisch zur Membran)
    float az=clamp(abs(p.z)/max(uZFace,0.2),0.0,1.0);
    float coneR=1.0+az*uConeAdd;                                           // konische Laibungswand (folgt dem Frame); az: 0=Sheet, 1=Tuer
    float twist=a*2.0+uSwirl/(r+0.25);
    float waveR=(sin(rr*kk-om+twist)+sin((2.0-rr)*kk-om+twist)*0.72)*exp(-rr*0.7);   // radiale Tropfenwelle (exakt Membran)
    float waveZ=sin(az*6.5-om*0.85+twist*0.4);                             // axiale Wellenfront zur Tuer -> 3D-Ausbreitung
    float w01=clamp((waveR*0.62+waveZ*0.38)*0.5+0.5,0.0,1.0);
    float fillIn=smoothstep(coneR*0.44,coneR*0.86,rr);                           // baut von der Achse zur konischen Wand auf
    float wallOut=smoothstep(coneR+0.06,coneR-0.20,rr);                    // an der Wand abschneiden -> aussen kaum sichtbar
    float n=fbm3(p*1.15+vec3(0.,0.,uTime*0.12));
    float radProf=fillIn*wallOut;
    float floorCut=smoothstep(uFloorY-0.12,uFloorY+0.10,p.y);                   // Aura endet am Boden, geht nicht hindurch
    float dens=radProf*floorCut*(0.12+0.88*smoothstep(0.15,0.85,w01))*(0.5+0.5*n)*uAct*(0.82+0.34*uPulse);
    if(dens>0.003){
      vec3 portalCol=max(pal(0.30+0.16*rr+0.16*w01),vec3(0.0));            // leuchtet in den Farben des Sheets
      float glow=0.42+0.95*w01;                                            // Wellenkaemme leuchten auf
      vec3 lum=mix(vec3(0.56,0.70,0.93),portalCol*1.85,0.78)*glow*(0.6+0.55*uPulse);
      float a2=1.0-exp(-dens*dt*6.5);
      acc+=trans*a2*lum; trans*=(1.0-a2);
    }
    if(trans<0.02)break;
  }
  float alpha=1.0-trans; if(alpha<0.01)discard;
  gl_FragColor=vec4(acc,alpha);
}`,
    transparent:true,depthWrite:false,depthTest:false,blending:THREE.NormalBlending,side:THREE.BackSide});
  var box=new THREE.Mesh(new THREE.BoxGeometry(hx*2.0,mxY-mnY,hz*2.0),fogMat);box.position.set(0,(mnY+mxY)*0.5,0);fogGroup.add(box);
  scene.add(fogGroup);
}
function updatePrompt(){var dp=document.getElementById('doorPrompt');if(!dp)return;dp.innerHTML='[E] Vordertür '+(doorTarget>0.5?'schließen':'öffnen')+'  ·  [R] Hintertür '+(doorTargetB>0.5?'schließen':'öffnen');}
function animate(){requestAnimationFrame(animate);var t=clock.getElapsedTime();
 doorAngle+=(doorTarget-doorAngle)*0.07;doorAngleB+=(doorTargetB-doorAngleB)*0.07;
 var openF=doorAngle/DOOR_OPEN,openB=doorAngleB/DOOR_OPEN,openM=Math.max(openF,openB);
 if(leafL)leafL.rotation.y=-doorAngle;if(leafR)leafR.rotation.y=doorAngle;
 if(leafLB)leafLB.rotation.y=doorAngleB;if(leafRB)leafRB.rotation.y=-doorAngleB;
 if(memMat){memMat.uniforms.uTime.value=t;memMat.uniforms.uCam.value.copy(camera.position);
  if(memMat.uniforms.uActivate)memMat.uniforms.uActivate.value=openM;
  if(memMat.uniforms.uPulse)memMat.uniforms.uPulse.value=0.5+0.5*Math.sin(t*1.25);
  if(memMat.uniforms.uWaveDepth&&D)memMat.uniforms.uWaveDepth.value=D.zFace*(0.10+0.85*openM);}   // zu: kaum; offen: bis zur Eingangsebene
 var pulse=0.5+0.5*Math.sin(t*1.25);                                   // gemeinsamer Atem — vereint Portal + Nebel
 if(fogMat&&D){fogMat.uniforms.uTime.value=t;fogMat.uniforms.uCam.value.copy(camera.position);fogMat.uniforms.uPulse.value=pulse;fogMat.uniforms.uAct.value=(D.p.fog!==undefined?D.p.fog:0.85)*(0.7+0.35*openM);
   if(memMat){fogMat.uniforms.uPA.value.copy(memMat.uniforms.uPA.value);fogMat.uniforms.uPB.value.copy(memMat.uniforms.uPB.value);fogMat.uniforms.uPC.value.copy(memMat.uniforms.uPC.value);fogMat.uniforms.uPD.value.copy(memMat.uniforms.uPD.value);}}
 if(portalLight&&D){portalLight.position.set(0,D.springY*0.55,0.0);portalLight.intensity=(0.3+openM*3.4)*(0.8+0.28*pulse);}
 cinePass.uniforms.time.value=t;if(rimMat){var pr=0.85+0.15*Math.sin(t*1.6);rimMat.color.setHSL(0.11,0.6,0.55);rimMat.color.multiplyScalar((0.7+2.6*Math.max(D.p.glow,0.25))*pr*(1.0+openM*0.9));}
 fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);controls.update();
 if(fogMat&&D&&depthRT){var pr=renderer.getPixelRatio()*0.42,dw=Math.max(2,Math.floor(innerWidth*pr)),dh=Math.max(2,Math.floor(innerHeight*pr));if(depthRT.width!==dw||depthRT.height!==dh)depthRT.setSize(dw,dh);fogGroup.visible=false;camera.updateMatrixWorld();renderer.setRenderTarget(depthRT);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(null);fogGroup.visible=true;fogMat.uniforms.uViewMatrix.value.copy(camera.matrixWorldInverse);fogMat.uniforms.uNear.value=camera.near;fogMat.uniforms.uFar.value=camera.far;fogMat.uniforms.uResolution.value.set(dw,dh);}
 composer.render();}
addEventListener('resize',function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);if(depthRT){var pr=renderer.getPixelRatio()*0.42;depthRT.setSize(Math.max(2,Math.floor(innerWidth*pr)),Math.max(2,Math.floor(innerHeight*pr)));}});
addEventListener('keydown',function(e){if(e.repeat)return;var ch=false;if(e.key==='e'||e.key==='E'){doorTarget=doorTarget>0.5?0.0:DOOR_OPEN;ch=true;}if(e.key==='r'||e.key==='R'){doorTargetB=doorTargetB>0.5?0.0:DOOR_OPEN;ch=true;}if(ch)updatePrompt();});
init();

/* ==================== W12-PORTAL-BRÜCKE (AnazhRealm-Heimat) ==================== */
(function () {
    if (typeof window === "undefined" || !window.parent || window.parent === window) return;
    function post(m) {
        try {
            window.parent.postMessage(m, "*");
        } catch (_e) {}
    }
    var DSL = ["drachentor", "kathedrale", "maschine", "geisttor", "verkalkt", "ruine", "maurentor", "zufall"];
    function clickPreset(word) {
        var pdiv = document.getElementById("presets");
        if (!pdiv) return false;
        var kids = pdiv.children;
        for (var i = 0; i < kids.length; i++) {
            if ((kids[i].textContent || "").toLowerCase() === word) {
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
            post({ type: "ready", world: "portale", label: "Porta — Ordnungen & fraktale Tiefe", dsl: DSL });
        } else if (msg.type === "dsl" && Array.isArray(msg.program)) {
            for (var i = 0; i < msg.program.length; i++) {
                var op = msg.program[i];
                var word = String((op && op[0]) || op || "").toLowerCase();
                if (word === "zufall") {
                    var r = document.getElementById("rnd");
                    if (r) r.click();
                } else clickPreset(word);
            }
        }
    });
    window.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") post({ type: "exit", world: "portale" });
    });
    post({ type: "ready", world: "portale", label: "Porta — Ordnungen & fraktale Tiefe", dsl: DSL });
})();
