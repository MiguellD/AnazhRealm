var presets=__tetrapodaCore.GATTUNGEN;   // GESTALT-DIALS — leben seit W-A6 im Kern ../../tetrapoda-core.js (EINE Quelle, sha256-Beleg im Wellen-Bericht)
var emoMode='idle';
var scene,camera,renderer,composer,fxaa,cinePass,controls,clock;
var wolf;
var ribcage,belly,mane,throat,larynx,larynxUp,waist,flank,lowerAbd;
var gluteL,gluteR,quadL,quadR,hamL,hamR,tricepL,tricepR,deltL,deltR,gastroL,gastroR;
var headGroup,jawGroup,earL,earR,lidTL,lidTR,tailSegs=[],spineSegs=[],neckSegs=[];
var legFL,legFR,legHL,legHR,shoulderL,shoulderR,tailRoot;
var flU,flL,flP,frU,frL,frP,hlT,hlC,hlP,hrT,hrC,hrP;
var H,sY,hY,sZ,hZ,lv,by,tv,bt,P={};
var legNames=[['legFL','flU','flL','flP'],['legFR','frU','frL','frP'],['legHL','hlT','hlC','hlP'],['legHR','hrT','hrC','hrP']];
var groundMesh,contactShadow;
var _fp=new THREE.Vector3();
var pawOffsets=[0,0,0,0];
function PD(kp,kd){this.target=0;this.current=0;this.vel=0;this.kp=kp;this.kd=kd;}
PD.prototype.update=function(dt){var f=(this.target-this.current)*this.kp-this.vel*this.kd;this.vel+=f*dt;this.current+=this.vel*dt;return this.current;};
var cpgPhase=[0,0,0,0],cpgFreq=0;
// DIE GANGART AUS DEM TEMPO (Meisterkarte Tiere H3 — Labor = Welt): das Tempo v̂ (der Regler, v = v̂·√(g·L) an der Hüft-Höhe
// der gezeigten Gestalt, in Metern wie die Welt: MASSSTAB.meterJeEinheit) treibt DASSELBE Gang-Gesetz wie die Welt — tetrapoda
// gangSchritt wählt Takt, Fußweg und die Fußfolge nach der Froude-Zahl, cpgStep zieht die Beine in die Folge, gangFuss führt
// jeden Fuß (vor/zurück dz, Hub). Die Stimmung trägt die Haltung, nie den Gang; der Sinus je Gelenk (Stimmungs-Schritt ×
// Sprint-Faktor) fiel.
var gangWerte={tempo:0},gangRegler=null,gangS=0,gangTast=0.5,gangWinkel=0,gangFolge=null,gangArtIst='stand',gangL=1,gangH=[1,1,1,1];
function gangTempo(vh){gangWerte.tempo=Math.max(0,+vh||0);if(gangRegler)gangRegler.setzen({tempo:gangWerte.tempo},true);}
function gangTakt(dt,freqStand){var K=__tetrapodaCore,mE=K.MASSSTAB.meterJeEinheit,Lm=gangL*mE;var gs=K.gangSchritt(gangWerte.tempo*Math.sqrt(K.GANG_GESETZ.g*Lm),Lm,null,gangArtIst);
  if(!gangFolge)for(var i=0;i<4;i++)cpgPhase[i]=gs.folge[i];
  gangFolge=gs.folge;gangS=gs.S/mE;gangTast=gs.tast;gangWinkel=gangS>0?Math.atan(gangS/(2*gangL)):0;
  if(gs.art!==gangArtIst){gangArtIst=gs.art;var a=document.getElementById('gangart');if(a)a.textContent=gs.art;}
  cpgFreq=gangS>0?gs.omega:(freqStand===undefined?0.25:freqStand);K.cpgStep(cpgPhase,cpgFreq,dt,gangFolge);return gs;}
var bodyPhys={y:0,vy:0,vx:0,pitch:0,pitchVel:0};
function updateBodyPhysics(dt){
  var e=emo.cur;
  if(gangWinkel<0.002){bodyPhys.y*=0.6;bodyPhys.vy*=0.5;bodyPhys.vx*=0.8;bodyPhys.pitch*=0.7;bodyPhys.pitchVel*=0.7;return;}
  var support=0,fwdForce=0;
  for(var i=0;i<4;i++){var st=Math.max(0,-Math.sin(cpgPhase[i]));support+=st;if(st>0)fwdForce+=st*Math.cos(cpgPhase[i])*gangWinkel*30;}
  var targetY=-Math.max(0,1.5-support)*0.022*H*e.tension;
  var dy=targetY-bodyPhys.y;
  bodyPhys.vy+=dy*140*dt;bodyPhys.vy*=0.72;bodyPhys.y+=bodyPhys.vy*dt;
  if(bodyPhys.y<-0.04*H){bodyPhys.y=-0.04*H;if(bodyPhys.vy<0)bodyPhys.vy=0;}
  bodyPhys.vx+=fwdForce*dt;bodyPhys.vx*=0.85;
  bodyPhys.pitchVel+=(bodyPhys.vx*0.012-bodyPhys.pitch)*10*dt;
  bodyPhys.pitchVel*=0.82;bodyPhys.pitch+=bodyPhys.pitchVel*dt;
}
var standPose=__tetrapodaCore.STAND_POSE;   // Kern-Quelle (W-A6)
var phys={
  legPDs:{},spineZ:[],spineX:[],neckZ:[],neckX:[],neckY:[],
  headY:null,headX:null,headZ:null,tailPDs:[],
  earL:null,earR:null,jawPD:null,shoulderLPD:null,shoulderRPD:null,
  init:function(){
    var n=['legFL','flU','flL','flP','legFR','frU','frL','frP','legHL','hlT','hlC','hlP','legHR','hrT','hrC','hrP'];
    for(var i=0;i<n.length;i++)this.legPDs[n[i]]=new PD(250,15);
    this.spineZ=[];this.spineX=[];
    for(var i=0;i<spineSegs.length;i++){this.spineZ.push(new PD(80,8));this.spineX.push(new PD(80,8));}
    this.neckZ=[];this.neckX=[];this.neckY=[];
    for(var i=0;i<neckSegs.length;i++){this.neckZ.push(new PD(60,6));this.neckX.push(new PD(60,6));this.neckY.push(new PD(35,4));}
    this.headY=new PD(50,6);this.headX=new PD(50,6);this.headZ=new PD(20,3);
    this.tailPDs=[];for(var i=0;i<tailSegs.length;i++)this.tailPDs.push({y:new PD(100,10),x:new PD(50,5),z:new PD(35,4)});
    this.earL=new PD(55,5);this.earR=new PD(55,5);this.jawPD=new PD(80,8);
    this.shoulderLPD=new PD(120,10);this.shoulderRPD=new PD(120,10);
    this.legZPDs={};var lzn=['legFL','legFR','legHL','legHR'];for(var i=0;i<lzn.length;i++)this.legZPDs[lzn[i]]=new PD(150,10);
    this.spineY=[];for(var i=0;i<spineSegs.length;i++)this.spineY.push(new PD(60,6));
    this.neckYR=[];for(var i=0;i<neckSegs.length;i++)this.neckYR.push(new PD(40,4));
    this._prevSt=[0,0,0,0];cpgPhase=[0,0,0,0];bodyPhys={y:0,vy:0,vx:0,pitch:0,pitchVel:0};
    var sp=standPose,si=0;
    for(var li=0;li<4;li++){
      this.legPDs[n[si]].current=sp[li][0];this.legPDs[n[si]].target=sp[li][0];this.legPDs[n[si]].vel=0;
      this.legPDs[n[si+1]].current=sp[li][1];this.legPDs[n[si+1]].target=sp[li][1];this.legPDs[n[si+1]].vel=0;
      this.legPDs[n[si+2]].current=sp[li][2];this.legPDs[n[si+2]].target=sp[li][2];this.legPDs[n[si+2]].vel=0;
      this.legPDs[n[si+3]].current=sp[li][3];this.legPDs[n[si+3]].target=sp[li][3];this.legPDs[n[si+3]].vel=0;
      si+=4;
    }
  }
};
var emo={
  cur:{freq:0.25,bodyX:0,bodyZ:0,headX:-0.01,headY:0,ear:0.15,tailAmp:0.10,tailRate:0.5,tension:0.9,bob:0.002,sway:0.006,kpMul:1.0},
  tgt:null,name:'idle',behTimer:0,behType:null,behStart:0,
  presets:__tetrapodaCore.MOTION,   // BEWEGUNGS-PROFILE — das motion-Feld lebt im Kern (W-A6, EINE Quelle; Nachlese-Welle heilte den W-A6-Alias [presets war doppelt geschachtelt -> emo.set warf])
  set:function(name){this.tgt=this.presets[name];this.name=name;this.behTimer=0;this.behType=null;},
  update:function(dt,t){
    if(!this.tgt)return;var c=this.cur,g=this.tgt,l=0.05;
    c.freq+=(g.freq-c.freq)*l;c.bodyX+=(g.bodyX-c.bodyX)*l;c.bodyZ+=(g.bodyZ-c.bodyZ)*l;c.headX+=(g.headX-c.headX)*l;c.headY+=(g.headY-c.headY)*l;c.ear+=(g.ear-c.ear)*l;c.tailAmp+=(g.tailAmp-c.tailAmp)*l;c.tailRate+=(g.tailRate-c.tailRate)*l;c.tension+=(g.tension-c.tension)*l;c.bob+=(g.bob-c.bob)*l;c.sway+=(g.sway-c.sway)*l;c.kpMul+=(g.kpMul-c.kpMul)*l;
    this.behTimer+=dt;
    if(this.name==='joy'){var jb=['playbow','bound','spin','prance','hop'];if(this.behTimer>2.0+Math.random()*2.0){this.behTimer=0;this.behType=jb[Math.floor(Math.random()*jb.length)];this.behStart=t;}}
    else if(this.name==='hunt'){var hb=['pounce','freeze','stalk','hop','circle'];if(this.behTimer>1.2+Math.random()*1.5){this.behTimer=0;this.behType=hb[Math.floor(Math.random()*hb.length)];this.behStart=t;}}
    else if(this.name==='flee'){if(Math.random()<dt*0.12&&this.behType===null){this.behType='lookback';this.behStart=t;}else if(Math.random()<dt*0.06&&this.behType===null){this.behType='zigzag';this.behStart=t;}else if(Math.random()<dt*0.04&&this.behType===null){this.behType='circle';this.behStart=t;}}
    else if(this.name==='alert'){var ab=['scan','snap','earflick'];if(this.behTimer>3+Math.random()*4){this.behTimer=0;this.behType=ab[Math.floor(Math.random()*ab.length)];this.behStart=t;}}
    else if(this.name==='idle'){var ib=['relax','shake','lookaround','sniff','yawn'];if(this.behTimer>5+Math.random()*8){this.behTimer=0;this.behType=ib[Math.floor(Math.random()*ib.length)];this.behStart=t;}}
    else if(this.name==='showcase'){this.behType='showcase';}
  },
  getBeh:function(t){
    var m={bodyX:0,bodyZ:0,bodyRotY:0,bodyRotZ:0,headX:0,headY:0,headZ:0,tailBoost:1,tailDir:0,tailZ:0,legOv:null,freqOv:null,impulseY:0,impulseX:0,jawBoost:0,earBoost:0,spineBoost:0,muscleBoost:0,pounceY:0};var pt;
    if(this.behType==='playbow'){pt=(t-this.behStart)/1.2;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.bodyX=0.22*i;m.headX=-0.20*i;m.tailBoost=1+4*i;m.jawBoost=0.03*i;m.spineBoost=0.6*i;return m;}
    if(this.behType==='bound'){pt=t-this.behStart;if(pt>0.4){this.behType=null;return m;}var i=Math.sin(pt/0.4*Math.PI);m.legOv=-0.30*i;m.impulseY=0.06*i;m.bodyX=-0.05*i;m.spineBoost=0.4*i;m.jawBoost=0.03*i;return m;}
    if(this.behType==='hop'){pt=t-this.behStart;if(pt>0.6){this.behType=null;return m;}if(pt<0.10){var i=pt/0.10;m.legOv=-0.40*i;m.bodyX=0.15*i;m.muscleBoost=0.3*i;return m;}if(pt<0.14){m.legOv=0.65;m.impulseY=0.18;m.impulseX=0.10;m.bodyX=-0.08;m.spineBoost=-0.3;return m;}if(pt<0.40){var ft=(pt-0.14)/0.26;m.pounceY=Math.sin(ft*Math.PI)*0.06*H;m.legOv=0.15;m.spineBoost=-0.1+Math.sin(ft*Math.PI)*0.2;return m;}var ft2=(pt-0.40)/0.20;m.legOv=-0.20*(1-ft2);m.bodyX=0.06*(1-ft2);return m;}
    if(this.behType==='spin'){pt=(t-this.behStart)/1.5;if(pt>=1){this.behType=null;return m;}m.bodyRotY=Math.sin(pt*Math.PI*2)*0.9;m.legOv=Math.sin(pt*Math.PI*4)*0.12;m.tailBoost=1+Math.sin(pt*Math.PI*2)*0.6;m.headY=Math.sin(pt*Math.PI*2)*0.35;m.spineBoost=0.5;return m;}
    if(this.behType==='prance'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.headX=0.10*i;m.bodyZ=0.03*Math.sin(pt*Math.PI*10)*i;m.tailBoost=1+3*i;m.spineBoost=0.4*i;m.jawBoost=0.03*i;m.legOv=Math.sin(pt*Math.PI*6)*0.08*i;return m;}
    if(this.behType==='pounce'){pt=t-this.behStart;if(pt<0.28){var i=pt/0.28;m.legOv=-0.75*i;m.bodyX=0.28*i;m.headX=-0.18*i;m.freqOv=0;m.muscleBoost=0.6*i;m.spineBoost=-0.3*i;return m;}else if(pt<0.32){m.legOv=1.0;m.impulseY=0.35;m.impulseX=0.22;m.bodyX=-0.14;m.headX=0.05;m.muscleBoost=0.8;m.spineBoost=0.5;return m;}else if(pt<0.75){var ft=(pt-0.32)/0.43;m.pounceY=Math.sin(ft*Math.PI)*0.15*H;m.legOv=0.12;m.bodyX=-0.05;m.headX=-0.05;m.spineBoost=-0.2+Math.sin(ft*Math.PI)*0.4;return m;}else if(pt<1.0){var lt=(pt-0.75)/0.25;m.legOv=-0.30*(1-lt);m.bodyX=0.12*(1-lt);m.headX=-0.08*(1-lt);m.spineBoost=-0.15*(1-lt);return m;}else{this.behType=null;return m;}}
    if(this.behType==='circle'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}var ang=pt*Math.PI*2;m.bodyRotY=Math.sin(ang)*0.7;m.bodyZ=Math.sin(ang)*0.03;m.headY=-Math.sin(ang)*0.2;m.spineBoost=0.25;m.tailDir=Math.sin(ang)*0.05;return m;}
    if(this.behType==='freeze'){pt=t-this.behStart;if(pt>1.8){this.behType=null;return m;}var fi=1-Math.min(1,pt*4);m.freqOv=0.001*fi;m.legOv=0;m.muscleBoost=0.4*fi;m.headX=-0.06*fi;return m;}
    if(this.behType==='stalk'){pt=(t-this.behStart)/3;if(pt>=1){this.behType=null;return m;}m.bodyX=0.12;m.headX=-0.10+Math.sin(pt*Math.PI*3)*0.03;m.headY=Math.sin(pt*Math.PI*2)*0.12;m.muscleBoost=0.25;return m;}
    if(this.behType==='lookback'){pt=t-this.behStart;if(pt>0.6){this.behType=null;return m;}var i=Math.sin(pt/0.6*Math.PI);m.headY=0.55*i;m.headX=0.04*i;m.bodyRotY=0.18*i;return m;}
    if(this.behType==='zigzag'){pt=(t-this.behStart)/1.2;if(pt>=1){this.behType=null;return m;}m.bodyRotY=Math.sin(pt*Math.PI*3)*0.30;m.bodyZ=Math.sin(pt*Math.PI*3)*0.025;m.spineBoost=0.35;return m;}
    if(this.behType==='scan'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}m.headY=Math.sin(pt*Math.PI*2)*0.40;m.headX=-0.04+Math.sin(pt*Math.PI)*0.04;return m;}
    if(this.behType==='snap'){pt=t-this.behStart;if(pt>1.5){this.behType=null;return m;}if(pt<0.1){m.headY=0.45*(Math.random()>0.5?1:-1);m.earBoost=0.12;}return m;}
    if(this.behType==='earflick'){pt=t-this.behStart;if(pt>0.5){this.behType=null;return m;}m.earBoost=0.15*Math.sin(pt/0.5*Math.PI);return m;}
    if(this.behType==='relax'){pt=(t-this.behStart)/5;if(pt>=1){this.behType=null;return m;}m.headX=0.005;m.headY=Math.sin(pt*Math.PI)*0.02;return m;}
    if(this.behType==='shake'){pt=(t-this.behStart)/1.2;if(pt>=1){this.behType=null;return m;}var si=Math.sin(pt*Math.PI);m.bodyRotZ=Math.sin(t*28)*0.08*si;m.headZ=Math.sin(t*28)*0.05*si;m.spineBoost=0.6*si;m.earBoost=-0.06*si;return m;}
    if(this.behType==='lookaround'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}m.headY=Math.sin(pt*Math.PI*2)*0.30;m.headX=Math.sin(pt*Math.PI)*0.03-0.01;return m;}
    if(this.behType==='sniff'){pt=(t-this.behStart)/2;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.headX=0.15*i+Math.sin(pt*Math.PI*8)*0.03;m.jawBoost=0.015*i;return m;}
    if(this.behType==='yawn'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.jawBoost=0.14*i;m.headX=-0.04*i;return m;}
    if(this.behType==='showcase'){m.headY=Math.sin(t*0.12)*0.45;m.headX=Math.sin(t*0.12*0.7+0.5)*0.06-0.02;m.headZ=Math.sin(t*0.12*0.5)*0.025;m.tailBoost=1.4;return m;}
    return m;
  }
};
/* LABOR = WELT (K45, Synthese §4 W5d „das Labor zeigt den Ofen-Körper"): die Gestalt des Labors IST der Guss der Welt —
   DERSELBE Bäcker wie Foundry-Worker und Wirts-Ofen (foundry-core BAKERS_BY_KIND.kreatur, Saat 0 wie der Kalt-Guss
   `_ofenKreaturTemplate`), aus denselben Dials, mit derselben LOD-Kette: L0 nah, L1 jenseits `ab` (± `hyst`) der Budget-
   Zeile, an die Knochen der feinen gebunden, und die Grobstufe wirft als Zwilling (die Welt-Regel `_gelenkGestalt` /
   `_gelenkStufe`, Maßstab 1 = Lab-Einheit). Gefallen: die Labor-Streu (Kugel-Perlen + 1,3 M Strähnen-Instanzen aus
   Math.random — ein ANDERES Tier als die Welt, ×21 über ihrer Zeile), ihr Guide-Mantel, ihre Fell-Textur und ihre zwei
   Shader. Die Stoffe webt `laborStoff` aus dem Bäcker-Stoff und den Gesetz-Daten FELL_LOOK · FELL_SCHALE — dieselben
   Zahlen liest der Welt-Stoff (stamm `fellSchale`, TSL). */
var BZ=__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.budget.kreatur,STUFEN=__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.kindStages.kreatur;
var FL=__tetrapodaCore.FELL_LOOK,FS=__tetrapodaCore.FELL_SCHALE;
var uZeit={value:0},stufeWahl='auto',gestalt=null,kostenStufen=null;
function gf(x){var s=(+x).toString();return s.indexOf('.')<0&&s.indexOf('e')<0?s+'.0':s;}
function gv(a){return 'vec3('+gf(a[0])+','+gf(a[1])+','+gf(a[2])+')';}
var GLSL_RAUSCHEN='vec3 mod289_s(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 mod289_s(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 permute_s(vec4 x){return mod289_s(((x*34.0)+1.0)*x);}\nvec4 taylorInvSqrt_s(vec4 r){return 1.79284291400159-0.85373472095314*r;}\nfloat snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289_s(i);vec4 p=permute_s(permute_s(permute_s(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt_s(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}\n';
// DER LABOR-STOFF: der Bäcker-Stoff (Farbe linear, Rauheit, Seite, Glut — dieselben Zahlen, die als mp reisen) + die
// Vertex-Farbe als Farbe (die Welt liest nur sie) + die Look-Gesetze der Klasse als r128-GLSL: Fell (Rim · Sheen ·
// microFur · Wrap · Atem), Strähne/Schale (Spitzen-Rim · Spec über die Strähnen-Achse) und das Haar-Raster der Schale.
function laborStoff(m0,geo,skin,cache){
  var k=(m0.userData&&m0.userData.__klasse)||'dunkel',vc=!!geo.attributes.color,key=k+(skin?'|s':'')+(vc?'|c':'');
  if(cache[key])return cache[key];
  var m=m0.clone();m.skinning=skin;if(vc){m.vertexColors=true;m.color.setRGB(1,1,1);}
  var schale=k==='fellSchale',koerper=k==='fell',strand=schale||k.indexOf('straehne')===0;
  if(koerper||strand){
    var L=koerper?FL.koerper:FL.straehne,ton=m0.color,tonL=Math.max(1e-4,0.2126*ton.r+0.7152*ton.g+0.0722*ton.b);
    if(schale)m.alphaTest=0.5;
    m.onBeforeCompile=function(sh){
      sh.uniforms.uZeit=uZeit;
      var vk='uniform float uZeit;\nvarying vec3 vGeo;\n'+(schale?'attribute vec3 aSchale;\nattribute vec3 aWurzel;\nvarying vec3 vSchale;\nvarying vec3 vWurzel;\nvarying vec3 vKamm;\n':'')+(koerper?GLSL_RAUSCHEN:'');
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+vk).replace('#include <begin_vertex>','#include <begin_vertex>\nvGeo=position;'+(schale?'\nvSchale=aSchale;\nvWurzel=aWurzel;\nvKamm=position-aWurzel;vKamm-=normal*dot(vKamm,normal);':''));
      if(koerper)sh.vertexShader=sh.vertexShader.replace('#include <skinning_vertex>','#include <skinning_vertex>\ntransformed+=objectNormal*snoise(transformed*'+gf(L.atem.freq)+'+uZeit*'+gf(L.atem.t)+')*'+gf(L.atem.amp)+';');
      var fk='varying vec3 vGeo;\n'+(schale?'varying vec3 vSchale;\nvarying vec3 vWurzel;\nvarying vec3 vKamm;\n':'');
      var raster=schale?'\nfloat tS=vSchale.x;vec3 pS=vWurzel*vSchale.z;vec3 zS=floor(pS);'+
        'float h1=fract(sin(dot(zS,vec3('+gf(FS.hashA[0])+','+gf(FS.hashA[1])+','+gf(FS.hashA[2])+')))*'+gf(FS.hashA[3])+');'+
        'float h2=fract(sin(dot(zS,vec3('+gf(FS.hashB[0])+','+gf(FS.hashB[1])+','+gf(FS.hashB[2])+')))*'+gf(FS.hashB[3])+');'+
        'vec3 mS=(vec3(h1,h2,fract((h1+h2)*'+gf(FS.hashC)+'))-0.5)*'+gf(FS.mitte)+';vec3 qS=fract(pS)-0.5-mS;float lS=dot(qS,vKamm/max(length(vKamm),1e-6));float dS=sqrt((dot(qS,qS)-lS*lS)*'+gf(FS.strich)+'+lS*lS/'+gf(FS.strich)+');'+
        'float rS=sqrt(vSchale.y)*'+gf(FS.radius)+'*(1.0-tS*'+gf(FS.zulauf)+');'+
        'float haarS=step(dS,rS)*step(tS,h1*'+gf(FS.endeSpanne)+'+'+gf(FS.ende)+');float wolleS=step(tS,'+gf(FS.wolle)+')*step('+gf(FS.wolleAb)+',vSchale.y);'+
        'diffuseColor.rgb*=mix('+gf(FS.wurzel)+','+gf(FS.spitze)+',tS);diffuseColor.a=max(haarS,wolleS);':'';
      var look='\nvec3 vdL=normalize(-vViewPosition);float ndvL=clamp(dot(normal,vdL),-1.0,1.0);float rimL=clamp(1.0-abs(ndvL),0.0,1.0);';
      if(koerper){var mf=L.microFur;look+='totalEmissiveRadiance+='+gv(L.rimFarbe)+'*pow(rimL,'+gf(L.rimPow)+')*'+gf(L.rimAmt)+'+'+gv(L.sheenFarbe)+'*pow(max(ndvL,0.0),'+gf(L.sheenPow)+')*'+gf(L.sheenAmt)+
        '+'+gv(mf.farbe)+'*pow(rimL,3.0)*step('+gf(mf.schwelle)+',fract(sin(dot(floor(vGeo.xz*'+gf(mf.dichte)+'),vec2('+gf(FS.hashA[0])+','+gf(FS.hashA[1])+')))*'+gf(FS.hashA[3])+'))*'+gf(mf.amt)+';';}
      else{/* ohne Vertex-Farbe ist der Ton der Anker selbst (die Welt füllt color mit mp.color): die Achse steht bei 1 */var sT=schale?'vSchale.x':!vc?'1.0':'clamp((dot(vColor,vec3(0.2126,0.7152,0.0722))/'+gf(tonL)+'-'+gf(L.wurzelAnker)+')/'+gf(Math.max(1e-3,1-L.wurzelAnker))+',0.0,1.0)';
        look+='float sTL='+sT+';totalEmissiveRadiance+='+gv(L.tipRimFarbe)+'*pow(rimL,'+gf(L.tipRimPow)+')*sTL+'+gv(L.specFarbe)+'*pow(max(ndvL,0.0),'+gf(L.specPow)+')*sTL*'+gf(L.specAmt)+';';}
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+fk).replace('#include <color_fragment>','#include <color_fragment>'+raster).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>'+look);
      if(koerper)sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );','outgoingLight*=max(ndvL,0.0)*'+gf(L.wrap)+'+'+gf(1-L.wrap)+';\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );');
    };
    m.customProgramCacheKey=function(){return 'labor-welt-'+key;};
  }
  cache[key]=m;return m;
}
// DER GELENK-BAUM des Beipacks (die Welt: `_ofenAssembleAsset`): je Gelenk ein Knochen (die Haut bindet an ihn), benannt,
// in der Ruhe-Pose des Gusses.
function gelenkBaum(sk){var teile={},bones=Array.isArray(sk.skinJoints)&&sk.skinJoints.length>0,root=new THREE.Group();
  sk.joints.forEach(function(j){var b=bones?new THREE.Bone():new THREE.Group();b.name=j.name;teile[j.name]=b;});
  sk.joints.forEach(function(j){var b=teile[j.name];if(j.parent&&teile[j.parent])teile[j.parent].add(b);else if(j.name===sk.root)root.add(b);else(teile[sk.root]||root).add(b);b.position.fromArray(j.pos);b.quaternion.fromArray(j.quat);b.scale.fromArray(j.scale);});
  return {root:root,teile:teile};}
// EINE STUFE an den Baum: jedes Teil an sein Gelenk, jede Haut an die Knochen der FEINEN Stufe (die Grobstufe trägt dieselben
// Knochen — fehlt einer, bricht der Bau laut wie in der Welt).
function stufeAnlegen(lod,dials,baum,cache){
  var g=BAKERS_BY_KIND.kreatur(__tetrapodaCore,gattungAktiv,0,lod,dials),sk=g.userData.__skelett;
  if(!sk||!Array.isArray(sk.joints)||!sk.joints.length)throw new Error('Labor: der Ofen-Guss L'+lod+' trägt kein Skelett (fail-closed)');
  if(!baum)baum=gelenkBaum(sk);
  var liste=[];
  g.children.slice().forEach(function(m0){var geo=m0.geometry,skin=!!geo.attributes.skinIndex,mat=laborStoff(m0.material,geo,skin,cache);
    var n=skin?new THREE.SkinnedMesh(geo,mat):new THREE.Mesh(geo,mat),j=baum.teile[m0.userData.__assetJoint];
    if(!j)throw new Error('Labor: das Gelenk '+m0.userData.__assetJoint+' fehlt dem Baum (fail-closed)');
    n.userData.__seh=m0.material.userData.__seh;n.userData.__klasse=m0.material.userData.__klasse;n.receiveShadow=true;j.add(n);liste.push(n);});
  baum.root.updateMatrixWorld(true);
  var namen=Array.isArray(sk.skinJoints)?sk.skinJoints:[],bones=namen.map(function(nm){if(!baum.teile[nm])throw new Error('Labor: der Knochen '+nm+' der Stufe '+lod+' fehlt der feinen (fail-closed)');return baum.teile[nm];});
  liste.forEach(function(n){if(n.isSkinnedMesh)n.bind(new THREE.Skeleton(bones),n.matrixWorld.clone());});
  return {baum:baum,sk:sk,liste:liste};
}
function disposeAnimal(){if(!gestalt)return;scene.remove(gestalt.root);gestalt.root.traverse(function(o){if(o.isMesh){o.geometry.dispose();o.material.dispose();}});gestalt=null;wolf=null;tailSegs=[];spineSegs=[];neckSegs=[];}
// DER STUFEN-SCHALTER (die Welt-Regel `_gelenkStufe`): jenseits ab × (1 ± hyst) trägt L1 das Bild, diesseits L0 — und L1 wirft
// immer als Zwilling. r128 prüft den Wurf gegen die Ebenen der HAUPT-Kamera (WebGLShadowMap), eine Schatten-Ebene wie in der
// Welt (r184) wirft hier nicht: der Zwilling zeichnet nah ohne Farbe und Tiefe, sein Tiefen-Stoff wirft. Wählbar: auto · L0 · L1.
var _sp=new THREE.Vector3();
function stufeSchalten(){if(!gestalt)return;var fern;
  if(stufeWahl==='auto'){wolf.getWorldPosition(_sp);var d=camera.position.distanceTo(_sp),h=gestalt.hyst;fern=!(d<gestalt.ab*(gestalt.istFern?1-h:1+h));}
  else fern=stufeWahl==='1';
  if(fern===gestalt.istFern)return;gestalt.istFern=fern;
  gestalt.l0.forEach(function(m){m.visible=!fern;});gestalt.m1.forEach(function(mt){mt.colorWrite=fern;mt.depthWrite=fern;});
  var el=document.getElementById('stufeIst');if(el)el.textContent='zeigt L'+(fern?1:0);}
function laborStufe(){return gestalt?(gestalt.istFern?1:0):null;}
/* DIE HÜLLE (K41): die fünf allometrischen Dials leben in T (geschrieben vom EINEN Generator aus PARAMS_BY_KIND.kreatur), nie im DOM. */
var T={},regler=null,sitz=null,kosten=null,gattungAktiv='wolf';
function deriveParams(){/* ULTRAGUSS U4: die Allometrie wohnt im Gesetzbuch (__tetrapodaCore.deriveTierParams) — die Shell reicht die Dials, ruft das EINE Gesetz. */return __tetrapodaCore.deriveTierParams({size:T.size,neckLen:T.neck,legLen:T.leg,diet:T.diet,build:T.build});}
function buildAnimal(){
  disposeAnimal();P=deriveParams();
  var dials={size:T.size,neck:T.neck,leg:T.leg,diet:T.diet,build:T.build},cache={};
  var s0=stufeAnlegen(STUFEN[0],dials,null,cache),s1=stufeAnlegen(STUFEN[1],dials,s0.baum,{}),teile=s0.baum.teile,m=s0.sk.masse||{};
  wolf=teile[s0.sk.root];headGroup=teile.headGroup;jawGroup=teile.jawGroup||null;earL=teile.earL||null;earR=teile.earR||null;lidTL=teile.lidTL||null;lidTR=teile.lidTR||null;tailRoot=teile.tailRoot||null;
  legFL=teile.legFL;legFR=teile.legFR;legHL=teile.legHL;legHR=teile.legHR;flU=teile.flU;flL=teile.flL;flP=teile.flP;frU=teile.frU;frL=teile.frL;frP=teile.frP;hlT=teile.hlT;hlC=teile.hlC;hlP=teile.hlP;hrT=teile.hrT;hrC=teile.hrC;hrP=teile.hrP;
  shoulderL=shoulderR=ribcage=null;
  tailSegs=(s0.sk.tailSegs||[]).map(function(nm){return teile[nm];}).filter(Boolean);spineSegs=[];neckSegs=[];
  H=m.H;sY=m.sY;hY=m.hY;sZ=m.sZ;hZ=m.hZ;lv=m.lv;by=m.by;tv=m.tv;bt=m.bt;
  // DIE SOHLE (die Welt: `_ofenAssembleAsset`): der Stand liest die Haut, nie die Fell-Schalen darunter.
  var sohle=new THREE.Box3();s0.liste.forEach(function(n){if(!n.geometry.attributes.aSchale)sohle.expandByObject(n);});
  [flP,frP,hlP,hrP].forEach(function(p,i){p.getWorldPosition(_fp);pawOffsets[i]=_fp.y-sohle.min.y;});
  [legFL,legFR,legHL,legHR].forEach(function(b,i){b.getWorldPosition(_fp);gangH[i]=Math.max(1e-3,_fp.y-sohle.min.y);});gangL=gangH[2];gangFolge=null;
  // der Wurf: L0 wirft nach `schatten` der Zeile (1 = die Grobstufe ist ihr Zwilling), L1 mit ihrem Teil `wurf.seh`
  var z1=BZ[STUFEN[1]],seh=z1.wurf&&Array.isArray(z1.wurf.seh)?z1.wurf.seh:null;
  s0.liste.forEach(function(n){n.castShadow=BZ[STUFEN[0]].schatten===STUFEN[0];});
  s1.liste.forEach(function(n){n.castShadow=z1.schatten===STUFEN[1]&&(!seh||seh.indexOf(n.userData.__seh)>=0);});
  gestalt={root:s0.baum.root,l0:s0.liste,l1:s1.liste,m1:s1.liste.map(function(n){return n.material;}).filter(function(mt,i,a){return a.indexOf(mt)===i;}),ab:z1.ab,hyst:BZ.hyst,istFern:null};
  if(kosten){kosten.messen({traverse:function(f){s0.liste.forEach(f);}},STUFEN[0]);kosten.messen({traverse:function(f){s1.liste.forEach(f);}},STUFEN[1]);}
  scene.add(gestalt.root);stufeSchalten();
  if(contactShadow){contactShadow.scale.setScalar(H*0.55);contactShadow.position.y=0.002;}
  controls.target.set(0,sY*0.38,0);controls.update();phys.init();emo.set(emoMode);document.getElementById('loading').style.display='none';
  gehegeZeigen();
}
/* DAS GEHEGE (w4-gehege, Labor = Welt): der Knopf „Gehege" zeigt den festen Bestand einer Zeile nach DEMSELBEN Gesetz wie die
   Welt — tetrapoda gehegeZeile (geprüft, fail-closed) und gehegeTiere (je Platz k das Tier am Lager auf der Sonnenblumen-Spirale,
   in den Rand gerückt), die Raten aus GEHEGE_GESETZ. Der Rand ist hier der Boden des Labors (das Quadrat in seinem Kreis), die Art
   die gezeigte; Lager und Rand eines echten Geheges trägt der Ort-Plan. Das erste Tier am Lager lebt (es geht und atmet wie jedes),
   die übrigen ruhen als Zahl in der Stand-Pose — wie in der Welt jenseits des Blicks; jeder Leib ist DERSELBE Ofen-Guss. */
var gehegeAn=false,gehegeTeile=[];
function gehegeZeigen(){
  gehegeTeile.forEach(function(o){scene.remove(o);o.traverse(function(m){if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();});});gehegeTeile=[];
  var el=document.getElementById('gehegeIst');if(el)el.textContent='';
  if(!gehegeAn||!gestalt)return;
  var K=__tetrapodaCore,mE=K.MASSSTAB.meterJeEinheit,h=20*mE/Math.SQRT2,G=K.GEHEGE_GESETZ;
  var Z=K.gehegeZeile({gattung:gattungAktiv,n:3,lager:[0,0],rand:[[-h,-h],[h,-h],[h,h],[-h,h]]}),tiere=K.gehegeTiere(Z,G);
  var dials={size:T.size,neck:T.neck,leg:T.leg,diet:T.diet,build:T.build},cache={};
  gestalt.root.position.set(tiere[0].x/mE,0,tiere[0].z/mE);
  for(var k=1;k<tiere.length;k++){
    var s=stufeAnlegen(STUFEN[0],dials,null,cache),tt=s.baum.teile,minFY=Infinity;
    legNames.forEach(function(n,li){for(var j=0;j<4;j++)if(tt[n[j]])tt[n[j]].rotation.x=standPose[li][j];});
    s.baum.root.position.set(tiere[k].x/mE,0,tiere[k].z/mE);s.baum.root.rotation.y=k*2.39996;s.baum.root.updateMatrixWorld(true);
    [tt.flP,tt.frP,tt.hlP,tt.hrP].forEach(function(q,i){if(!q)return;q.getWorldPosition(_fp);minFY=Math.min(minFY,_fp.y-pawOffsets[i]);});
    if(isFinite(minFY))s.baum.root.position.y-=minFY;
    s.liste.forEach(function(m){m.castShadow=true;});
    scene.add(s.baum.root);gehegeTeile.push(s.baum.root);
  }
  var rand=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Z.rand.map(function(q){return new THREE.Vector3(q.x/mE,0.01,q.z/mE);})),new THREE.LineBasicMaterial({color:0x886633}));
  scene.add(rand);gehegeTeile.push(rand);
  if(el)el.textContent=tiere.length+' am Lager, Raten: Hunger '+G.raten.hunger+' · Durst '+G.raten.durst+' · Alter '+G.raten.alter;
}

function init(){
  // DIE HÜLLE (K41): Sitzung (Undo/Redo über T samt Gattung) + der EINE Generator + die Kosten-Leiste der Labor-Gestalt.
  sitz=AnazhHuelle.sitzung({werte:T,zustand:function(){return {gattung:gattungAktiv,markiert:!!document.querySelector("#presets button.active")};},zustandSetzen:function(z){gattungAktiv=z.gattung;gattungMarke(z.markiert?z.gattung:null);},anwenden:function(){buildAnimal();}});
  sitz.leiste(document.getElementById("sitzung"),{seed:false});
  regler=AnazhHuelle.regler(document.getElementById("sliders"),__tetrapodaCore.PARAMS_BY_KIND.kreatur,{werte:T,sitzung:sitz,gruppen:false,ruheMs:200,
    basis:function(){return presets[gattungAktiv]||null;},
    format:function(z,v){return z.id==="diet"?(v>0.7?"Carn":v>0.3?"Omni":"Herb"):z.id==="size"?(+v).toFixed(1):(+v).toFixed(2);},
    bei:function(){gattungMarke(null);},nachRuhe:function(){buildAnimal();}});
  kosten=AnazhHuelle.kosten(document.getElementById("kosten"),{budget:BZ,stufen:STUFEN,renderer:function(){return renderer;},
    quelle:"gemessen an der gezeigten Gestalt = dem Welt-Guss (foundry-core BAKERS_BY_KIND.kreatur, dieselben Dials, Saat 0): L0 nah, L1 jenseits "+BZ[STUFEN[1]].ab+" (± "+Math.round(BZ.hyst*100)+" %) und als Wurf"});
  scene=new THREE.Scene();scene.background=new THREE.Color(0x080604);camera=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,0.1,200);camera.position.set(6,2,7);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);if(THREE.sRGBEncoding!==undefined)renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  try{var c=document.createElement('canvas');c.width=256;c.height=256;var x=c.getContext('2d');var g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#ccaa88');g.addColorStop(0.5,'#443322');g.addColorStop(1,'#0a0805');x.fillStyle=g;x.fillRect(0,0,256,256);var t=new THREE.CanvasTexture(c);var p=new THREE.PMREMGenerator(renderer);scene.environment=p.fromEquirectangular(t).texture;t.dispose();}catch(e){}
  scene.add(new THREE.HemisphereLight(0xffeecc,0x332211,0.45));var key=new THREE.DirectionalLight(0xffd8a0,3.5);key.position.set(6,8,4);key.castShadow=true;key.shadow.mapSize.width=2048;key.shadow.mapSize.height=2048;key.shadow.bias=-0.0001;key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.camera.near=0.5;key.shadow.camera.far=30;scene.add(key);var rimL=new THREE.DirectionalLight(0x5588ff,1.4);rimL.position.set(-5,4,-5);scene.add(rimL);var fill=new THREE.DirectionalLight(0xaa7744,0.7);fill.position.set(0,2,-8);scene.add(fill);var goldBack=new THREE.DirectionalLight(0xff8833,0.5);goldBack.position.set(-3,3,8);scene.add(goldBack);
  var gC=document.createElement('canvas');gC.width=gC.height=512;var gx=gC.getContext('2d');var gg=gx.createRadialGradient(256,256,40,256,256,250);gg.addColorStop(0,'#1a1610');gg.addColorStop(0.4,'#0d0a07');gg.addColorStop(1,'#050302');gx.fillStyle=gg;gx.fillRect(0,0,512,512);var gTex=new THREE.CanvasTexture(gC);var groundMat=new THREE.MeshStandardMaterial({map:gTex,roughness:0.96,metalness:0});groundMesh=new THREE.Mesh(new THREE.CircleGeometry(20,64),groundMat);groundMesh.rotation.x=-Math.PI/2;groundMesh.position.y=-0.002;groundMesh.receiveShadow=true;scene.add(groundMesh);
  var csGeo=new THREE.CircleGeometry(1,48);var csMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false});contactShadow=new THREE.Mesh(csGeo,csMat);contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=0.001;scene.add(contactShadow);
  composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.35,0.4,0.85));fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
  var cine={uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:['varying vec2 vUv;','void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'].join('\n'),fragmentShader:['uniform sampler2D tDiffuse;','uniform float time;','varying vec2 vUv;','float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}','float getLum(vec2 uv){return dot(texture2D(tDiffuse,uv).rgb,vec3(0.299,0.587,0.114));}','void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float dist=length(dir);vec2 offset=dir*dist*0.008;float r=texture2D(tDiffuse,uv+offset).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-offset).b;vec3 color=vec3(r,g,b);float lum=getLum(uv);float lL=getLum(uv-vec2(0.001,0.0));float lR=getLum(uv+vec2(0.001,0.0));float lU=getLum(uv-vec2(0.0,0.001));float lD=getLum(uv+vec2(0.0,0.001));float edge=abs(lL-lum)+abs(lR-lum)+abs(lU-lum)+abs(lD-lum);color*=(1.0+edge*2.0);color*=smoothstep(1.2,0.1,dist*1.3);color+=random(uv+time)*0.03-0.015;gl_FragColor=vec4(color,1.0);}'].join('\n')};cinePass=new THREE.ShaderPass(cine);cinePass.renderToScreen=true;composer.addPass(cinePass);
  controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=80;controls.autoRotateSpeed=0.8;clock=new THREE.Clock();buildAnimal();
  document.querySelectorAll('#presets button').forEach(function(b){b.addEventListener('click',function(){sitz.schritt(function(){gattungMarke(b.dataset.p);var p=presets[b.dataset.p];regler.setzen({size:p.size,neck:p.neck,leg:p.leg,diet:p.diet,build:p.build},true);buildAnimal();});});});
  document.querySelectorAll('#stufen button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#stufen button').forEach(function(b2){b2.classList.toggle('active',b2===b);});stufeWahl=b.dataset.s;stufeSchalten();});});
  document.getElementById('gehegeKnopf').addEventListener('click',function(){gehegeAn=!gehegeAn;this.classList.toggle('active',gehegeAn);gehegeZeigen();});
  document.querySelectorAll('#emotions button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#emotions button').forEach(function(b2){b2.classList.remove('active');});b.classList.add('active');emoMode=b.dataset.e;emo.set(emoMode);});});
  gangRegler=AnazhHuelle.regler(document.getElementById("gang"),[{id:"tempo",lab:"Tempo v̂ (Froude-Wurzel)",min:0,max:4,step:0.05,def:0}],{werte:gangWerte,gruppen:false,ruheMs:0});
  animate();
}
function gattungMarke(g){gattungAktiv=g||gattungAktiv;document.querySelectorAll('#presets button').forEach(function(b){b.classList.toggle('active',!!g&&b.dataset.p===g);});}
function animate(){
  requestAnimationFrame(animate);if(!wolf)return;var t=clock.getElapsedTime(),dt=1/60;uZeit.value=t;cinePass.uniforms.time.value=t;controls.autoRotate=(emoMode==='showcase');emo.update(dt,t);var bm=emo.getBeh(t);var e=emo.cur;gangTakt(dt,bm.freqOv!==null?bm.freqOv:e.freq);var st=gangWinkel;updateBodyPhysics(dt);bodyPhys.vy+=bm.impulseY;bodyPhys.vx+=bm.impulseX;var breathing=(st<0.01)?Math.sin(t*0.6)*0.003*H:0;wolf.position.y=bodyPhys.y+bm.pounceY+breathing;
  // Body roll computed early for weight shift
  var bodyRollNow=Math.sin(cpgPhase[0]*2)*e.sway+e.bodyZ+bm.bodyRotZ;
  wolf.rotation.z=bodyRollNow;wolf.rotation.x=bodyPhys.pitch*0.15+e.bodyX+bm.bodyX;wolf.rotation.y=bm.bodyRotY;
  var legSides=[-1,1,-1,1];
  for(var leg=0;leg<4;leg++){
    var ph=cpgPhase[leg];var override=bm.legOv;var swing=Math.max(0,Math.sin(ph));var stanceA=Math.max(0,-Math.sin(ph));
    if(override!==null){
      phys.legPDs[legNames[leg][0]].target=override;
      phys.legPDs[legNames[leg][1]].target=override*0.5;
      phys.legPDs[legNames[leg][2]].target=Math.max(0,override+0.5)*0.3;
      phys.legPDs[legNames[leg][3]].target=Math.max(0,override+0.8)*0.2;
    }
    else if(gangWinkel<0.002){
      var wn=Math.sin(t*2.5+leg*1.7)*0.004+Math.sin(t*1.3+leg*2.3)*0.003;
      // Weight shift: body rolls right -> right legs extend, left legs compress
      var wShift=bodyRollNow*legSides[leg]*0.025;
      phys.legPDs[legNames[leg][0]].target=standPose[leg][0]+wn+wShift;
      phys.legPDs[legNames[leg][1]].target=standPose[leg][1]+wn*0.5+wShift*0.3;
      phys.legPDs[legNames[leg][2]].target=standPose[leg][2]+wn*0.3-wShift*0.2;
      phys.legPDs[legNames[leg][3]].target=standPose[leg][3]+wn*0.2;
    }
    else{
      // der Fuß folgt dem Gesetz (gangFuss): vor/zurück um dz unter dem Gelenk, im Schwung gehoben (der Hub des Gesetzes
      // als Knick, die Pfote faltet um GANG_GESETZ.falte) — die Hüfte schwenkt dorthin
      var GG=__tetrapodaCore.GANG_GESETZ,F=__tetrapodaCore.gangFuss(ph,gangS,gangTast),hl=gangH[leg];
      var knick=2*Math.acos(Math.max(-1,1-GG.hub*F.hub));
      phys.legPDs[legNames[leg][0]].target=standPose[leg][0]-Math.atan2(F.dz,hl)-knick*0.5;
      phys.legPDs[legNames[leg][1]].target=standPose[leg][1];
      phys.legPDs[legNames[leg][2]].target=standPose[leg][2]+knick;
      phys.legPDs[legNames[leg][3]].target=standPose[leg][3]+F.hub*GG.falte;
    }
  }
  for(var i=0;i<4;i++){var ns=Math.max(0,-Math.sin(cpgPhase[i]));if(phys._prevSt[i]<0.05&&ns>0.15&&gangWinkel>0.002){bodyPhys.vy-=0.01*e.tension;}phys._prevSt[i]=ns;}
  for(var name in phys.legPDs){var pd=phys.legPDs[name];pd.kp=Math.max(200,320*e.kpMul);pd.kd=18*e.kpMul;pd.update(dt);}
  legFL.rotation.x=phys.legPDs['legFL'].current;flU.rotation.x=phys.legPDs['flU'].current;flL.rotation.x=phys.legPDs['flL'].current;flP.rotation.x=phys.legPDs['flP'].current;legFR.rotation.x=phys.legPDs['legFR'].current;frU.rotation.x=phys.legPDs['frU'].current;frL.rotation.x=phys.legPDs['frL'].current;frP.rotation.x=phys.legPDs['frP'].current;legHL.rotation.x=phys.legPDs['legHL'].current;hlT.rotation.x=phys.legPDs['hlT'].current;hlC.rotation.x=phys.legPDs['hlC'].current;hlP.rotation.x=phys.legPDs['hlP'].current;legHR.rotation.x=phys.legPDs['legHR'].current;hrT.rotation.x=phys.legPDs['hrT'].current;hrC.rotation.x=phys.legPDs['hrC'].current;hrP.rotation.x=phys.legPDs['hrP'].current;
  phys.shoulderLPD.target=-phys.legPDs['legFL'].current*0.08;phys.shoulderRPD.target=-phys.legPDs['legFR'].current*0.08;phys.shoulderLPD.update(dt);phys.shoulderRPD.update(dt);if(shoulderL)shoulderL.rotation.x=phys.shoulderLPD.current;if(shoulderR)shoulderR.rotation.x=phys.shoulderRPD.current;
  if(bm.pounceY<0.01){
    wolf.updateMatrixWorld(true);
    var minFY=Infinity;var paws=[flP,frP,hlP,hrP];
    for(var i=0;i<paws.length;i++){paws[i].getWorldPosition(_fp);_fp.y-=pawOffsets[i];if(_fp.y<minFY)minFY=_fp.y;}
    if(minFY<0){wolf.position.y-=minFY;}
    else if(minFY>0.004&&gangWinkel<0.002){wolf.position.y-=(minFY-0.004)*0.5;}
  }
  if(contactShadow){var bodyH=wolf.position.y;contactShadow.material.opacity=0.35*Math.max(0.1,1-bodyH*2);contactShadow.scale.setScalar(H*0.55*Math.max(0.3,1+bodyH*0.5));}
  // Lateral Z: stronger response to body roll for natural compensation
  for(var leg=0;leg<4;leg++){var ph2=cpgPhase[leg];var legSide=legSides[leg];var swingP=Math.max(0,Math.sin(ph2));var latT=bodyRollNow*(0.6+e.sway*8)+(-bm.bodyRotY)*legSide*0.15+swingP*legSide*0.05;phys.legZPDs[legNames[leg][0]].target=latT;phys.legZPDs[legNames[leg][0]].update(dt);}legFL.rotation.z=phys.legZPDs['legFL'].current;legFR.rotation.z=phys.legZPDs['legFR'].current;legHL.rotation.z=phys.legZPDs['legHL'].current;legHR.rotation.z=phys.legZPDs['legHR'].current;flU.rotation.z=phys.legZPDs['legFL'].current*0.15;frU.rotation.z=phys.legZPDs['legFR'].current*0.15;hlT.rotation.z=phys.legZPDs['legHL'].current*0.15;hrT.rotation.z=phys.legZPDs['legHR'].current*0.15;
  var sb=bm.spineBoost;for(var i=0;i<phys.spineZ.length;i++){if(i===0){phys.spineZ[i].target=Math.sin(cpgPhase[0]*2)*e.sway*(3.0+sb*3);phys.spineX[i].target=Math.sin(cpgPhase[0]*2+1)*e.bob*(2.0+sb*2)+Math.sin(t*0.5+i*0.3)*0.01*(st<0.01?1:0);phys.spineY[i].target=Math.sin(cpgPhase[0]+i*0.4)*e.sway*(2.5+sb*2)+bm.bodyRotY*(i/phys.spineZ.length)*0.3;}else{phys.spineZ[i].target=phys.spineZ[i-1].current*0.7;phys.spineX[i].target=phys.spineX[i-1].current*0.7;phys.spineY[i].target=phys.spineY[i-1].current*0.7;}phys.spineZ[i].update(dt);phys.spineX[i].update(dt);phys.spineY[i].update(dt);spineSegs[i].rotation.z=phys.spineZ[i].current;spineSegs[i].rotation.x=phys.spineX[i].current+Math.sin(t*1.2+i*0.2)*0.008*(st<0.01?1:0);spineSegs[i].rotation.y=phys.spineY[i].current;}
  for(var i=0;i<phys.neckZ.length;i++){if(i===0){phys.neckZ[i].target=phys.spineZ[phys.spineZ.length-1].current*0.5+Math.sin(t*0.4+i*0.2)*0.014*(st<0.01?1:0);phys.neckX[i].target=phys.spineX[phys.spineX.length-1].current*0.5+Math.sin(t*0.5+i*0.1)*0.012*(st<0.01?1:0);phys.neckYR[i].target=phys.spineY[phys.spineY.length-1].current*0.4+Math.sin(t*0.3+i*0.15)*0.025*(st<0.01?1:0)+bm.headY*0.3;}else{phys.neckZ[i].target=phys.neckZ[i-1].current*0.7;phys.neckX[i].target=phys.neckX[i-1].current*0.7;phys.neckYR[i].target=phys.neckYR[i-1].current*0.7;}phys.neckY[i].target=Math.sin(t*0.3+i*0.15)*0.02*(st<0.01?1:0);phys.neckZ[i].update(dt);phys.neckX[i].update(dt);phys.neckY[i].update(dt);phys.neckYR[i].update(dt);neckSegs[i].rotation.z=phys.neckZ[i].current;neckSegs[i].rotation.x=phys.neckX[i].current;neckSegs[i].rotation.y=phys.neckYR[i].current+phys.neckY[i].current;}
  // Head: lifts and sways naturally, not just nods
  /* die Gelenk-Kette der Welt trägt keine Hals-Segmente (der Hals lebt in der Haut) — der Kopf folgt dann allein */
  var nYR=phys.neckYR.length?phys.neckYR[phys.neckYR.length-1].current:0,nX=phys.neckX.length?phys.neckX[phys.neckX.length-1].current:0;
  phys.headY.target=nYR*0.5+bm.headY+e.headY;
  phys.headX.target=nX*0.5+bm.headX+e.headX;
  phys.headZ.target=bm.headZ||Math.sin(t*0.3)*0.008*(st<0.01?1:0);
  // Idle head sway: slow side-to-side + gentle lift
  if(st<0.01){
    phys.headY.target+=Math.sin(t*0.12)*0.06+Math.sin(t*0.07)*0.03;
    phys.headX.target+=Math.sin(t*0.18)*0.012;
  }
  phys.headY.update(dt);phys.headX.update(dt);phys.headZ.update(dt);headGroup.rotation.y=phys.headY.current;headGroup.rotation.x=phys.headX.current;headGroup.rotation.z=phys.headZ.current;
  // NO dynamic muscle Y-scaling: fur always matches mesh
  if(ribcage)ribcage.scale.y=0.76+Math.sin(t*1.2)*0.012*(st<0.01?1:0)+Math.sin(t*0.5)*0.008*(e.tension-0.9);
  var jawRate=emoMode==='joy'?5:emoMode==='flee'?10:emoMode==='hunt'?0.5:0.3;phys.jawPD.target=0.02+Math.abs(Math.sin(t*jawRate))*0.06*(st>0.01?1:0)+bm.jawBoost;phys.jawPD.update(dt);if(jawGroup)jawGroup.rotation.x=phys.jawPD.current+Math.sin(t*0.3)*0.003*(st<0.01?1:0);
  var earDir=Math.sin(t*0.07);var earRate=emoMode==='alert'?1.5:emoMode==='hunt'?0.5:emoMode==='flee'?0.3:0.8;phys.earL.target=e.ear+earDir*0.03+Math.sin(t*earRate)*0.025+Math.sin(t*4)*0.015+bm.earBoost;phys.earR.target=-e.ear+earDir*0.03+Math.sin(t*earRate+1.2)*0.025+Math.sin(t*4+0.5)*0.015+bm.earBoost;phys.earL.update(dt);phys.earR.update(dt);if(earL)earL.rotation.z=phys.earL.current;if(earR)earR.rotation.z=phys.earR.current;
  var tailMood=(Math.sin(t*0.03)+1)*0.5;for(var i=0;i<phys.tailPDs.length;i++){if(i===0)phys.tailPDs[i].y.target=Math.sin(t*e.tailRate)*e.tailAmp*bm.tailBoost*(0.7+tailMood*0.6)+bm.tailDir;else phys.tailPDs[i].y.target=phys.tailPDs[i-1].y.current*0.8;phys.tailPDs[i].x.target=Math.sin(t*0.8+i*0.2)*0.03+bm.tailZ;phys.tailPDs[i].z.target=Math.sin(t*e.tailRate*0.7+i*0.2)*0.02;phys.tailPDs[i].y.update(dt);phys.tailPDs[i].x.update(dt);phys.tailPDs[i].z.update(dt);tailSegs[i].rotation.y=phys.tailPDs[i].y.current;tailSegs[i].rotation.x=phys.tailPDs[i].x.current;tailSegs[i].rotation.z=phys.tailPDs[i].z.current;}
  var bt2=t%4.0,blink=1.0;if(bt2<0.12)blink=1.0-(bt2/0.12)*0.7;else if(bt2<0.24)blink=0.3+((bt2-0.12)/0.12)*0.7;if(lidTL)lidTL.scale.y=0.32*blink;if(lidTR)lidTR.scale.y=0.32*blink;
  fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);controls.update();stufeSchalten();composer.render();
}
addEventListener('resize',function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
init();

/* ==================== DIE BRÜCKE ZUR HEIMAT (die Hülle, K41) ==================== */
/* EINE Brücke (../huelle/huelle.js): die DSL spricht die ECHTEN UI-Pfade — die vier Gattungen leben als #presets-Buttons
   (data-p, click() = exakt der Nutzer-Pfad, Regler + buildAnimal laufen), die sechs Bewegungsprofile als #emotions-
   Buttons (data-e, click() → emo.set). Die DSL-Wörter sind deutsch (Registry == Brücke wortgleich, Umlaute ASCII-
   gefaltet: baer), die Tabellen mappen auf die Lab-Werte. Esc meldet die Heimkehr. */
(function () {
    var GATTUNG = { wolf: "wolf", fuchs: "fox", baer: "bear", hirsch: "deer" };
    var EMOTION = {
        entspannt: "idle",
        freude: "joy",
        jagd: "hunt",
        flucht: "flee",
        wachsam: "alert",
        showcase: "showcase",
    };
    function clickBtn(sel) {
        var b = document.querySelector(sel);
        if (b) b.click();
        return !!b;
    }
    AnazhHuelle.bruecke({
        welt: "tetrapoda",
        // DAS ZIEL-BILD (D8): die Hülle rendert diese Welt als Panorama aus dem Blick ihrer Kamera — die Tor-Membran der Heimat zeigt es
        panorama: function () {
            return { THREE: THREE, renderer: renderer, scene: scene, kamera: camera };
        },
        label: "Tetrapoda — Evolution Lab",
        dsl: Object.keys(GATTUNG).concat(Object.keys(EMOTION)),
        wort: function (w) {
            if (GATTUNG[w]) clickBtn('#presets button[data-p="' + GATTUNG[w] + '"]');
            else if (EMOTION[w]) clickBtn('#emotions button[data-e="' + EMOTION[w] + '"]');
        },
        /* DAS WERK DER BÜHNE (der EINE Übergabe-Kanal der Hülle): die zuletzt gewählte Gattung (Regler-Feintuning löscht die
           active-Klasse, die Wahl bleibt gemerkt) mit den Dials ihrer Regler-Zeilen aus T (Saat 0 wie der Guss) — künftige
           Spawns der Gattung tragen sie; der Knopf steht nur im Portal. */
        werk: function () {
            var ov = {};
            __tetrapodaCore.PARAMS_BY_KIND.kreatur.forEach(function (z) {
                ov[z.id] = T[z.id];
            });
            return { kind: "kreatur", preset: gattungAktiv, seed: 0, ov: ov };
        },
        werkOrt: document.getElementById("werkOrt"),
    });
})();