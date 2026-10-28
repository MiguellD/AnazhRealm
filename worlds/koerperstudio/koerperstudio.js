const params=Object.assign({},window.__koerperCore.START_PARAMS);   // START-GESTALT — lebt seit W-A6 im Kern ../../koerper-core.js (EINE Quelle, sha256-Beleg im Wellen-Bericht); die UI mutiert den Klon
const parts={};const base={};var emoMode='idle';
function PD(kp,kd){this.target=0;this.current=0;this.vel=0;this.kp=kp;this.kd=kd;}
PD.prototype.update=function(dt){var f=(this.target-this.current)*this.kp-this.vel*this.kd;this.vel+=f*dt;this.current+=this.vel*dt;return this.current;};
var physBase={headY:{kp:28,kd:4.5},headX:{kp:28,kd:4.5},headZ:{kp:12,kd:2.5},spineY:{kp:30,kd:4.5},spineX:{kp:28,kd:4.5},spineZ:{kp:15,kd:3},chestY:{kp:45,kd:6},breath:{kp:38,kd:5},armLY:{kp:42,kd:6},armRY:{kp:42,kd:6},armLZ:{kp:48,kd:7},armRZ:{kp:48,kd:7},armLX:{kp:36,kd:5},armRX:{kp:36,kd:5},elbowL:{kp:65,kd:9},elbowR:{kp:65,kd:9},hipLY:{kp:40,kd:5.5},hipRY:{kp:40,kd:5.5},hipLX:{kp:45,kd:6},hipRX:{kp:45,kd:6},hipLZ:{kp:28,kd:4},hipRZ:{kp:28,kd:4},kneeL:{kp:70,kd:9},kneeR:{kp:70,kd:9},ankleL:{kp:55,kd:7},ankleR:{kp:55,kd:7},bicepR:{kp:55,kd:8},bicepL:{kp:55,kd:8},quadR:{kp:48,kd:6},quadL:{kp:48,kd:6},bodyX:{kp:32,kd:5},bodyZ:{kp:22,kd:4}};
const phys={};for(var pk in physBase)phys[pk]=new PD(physBase[pk].kp,physBase[pk].kd);
var bodyPhys={y:0,vy:0};var fistState={l:0,r:0};var palmState={l:0,r:0};var groundSmooth=0;
// V18.491.162 — Lab IK L1/L2/standYBase ← labProportionen (EINE Quelle; cold-core byte-alt fallback = Loomis 6-KH)
// V18.491.163 — Lab IK stand offsets footBelowAnkle/standYWalkMul/standYRunMul ← labProportionen
// V18.491.164 — Lab coyote cold fail-soft 0.12→0.3 (was buffer twin; now = fx.bewegung.sprung.coyoteSec)
const _LP=(window.__koerperCore&&typeof window.__koerperCore.labProportionen==='function'&&window.__koerperCore.labProportionen())||{};
const _H=_LP.H||6,L1=_LP.thighLen||0.245*_H,L2=_LP.calfLen||0.246*_H,footBelowAnkle=isFinite(_LP.footBelowAnkle)?_LP.footBelowAnkle:0.30,standYBase=-((_LP.trochanterY!=null?_LP.trochanterY:0.530*_H)-footBelowAnkle),standYWalk=standYBase*(isFinite(_LP.standYWalkMul)?_LP.standYWalkMul:0.997),standYRun=standYBase*(isFinite(_LP.standYRunMul)?_LP.standYRunMul:0.83);
function solveIK(ty,tz,l1,l2){var d=Math.sqrt(ty*ty+tz*tz);d=Math.max(Math.abs(l1-l2)+0.001,Math.min(d,l1+l2-0.001));var c=(d*d-l1*l1-l2*l2)/(2*l1*l2);c=Math.max(-1,Math.min(1,c));var kr=Math.acos(c);var hb=-Math.atan2(tz,-ty);var g=Math.atan2(l2*Math.sin(kr),l1+l2*Math.cos(kr));return{hip:hb-g,knee:kr};}
function ankleYFromAngles(hx,kr){return -(L1+L2*Math.cos(kr))*Math.cos(hx)+L2*Math.sin(kr)*Math.sin(hx);}
// DAS EINE GANG-GESETZ (K07): Takt, Fussweg, Tastgrad und Hub aus tetrapoda gangSchritt/gangFuss mit der Zweibeiner-Zeile
// koerper-core fx.bewegung.gang -- dieselbe Formel, nach der Spieler, Peer, Bewohner und die Tiere gehen. Die Buehne traegt
// ihre eigene Schwere (G_BUEHNE, Einheiten/s^2): die Froude-Zahl misst v gegen sie und die gebaute Beinlaenge; vMax faellt
// (die Buehne kennt keine Lage-Spruenge). Fail-closed: ohne Kern kein Gang (kein Lab-Literal).
var G_BUEHNE=44;
var _TC=window.__tetrapodaCore,_GZ0=window.__koerperCore.bewegung&&window.__koerperCore.bewegung.gang;
// jedes Feld der Zeile ist Pflicht (fehlt eines, faehrt kein stiller Tier-Gang); das Becken traegt tetrapoda gangBecken
if(!_TC||typeof _TC.gangSchritt!=='function'||typeof _TC.gangFuss!=='function'||typeof _TC.gangBecken!=='function'||typeof _TC.gangReich!=='function'||typeof _TC.gangPhaseHaelt!=='function'||!_GZ0||!['schrittBasis','schrittFroude','tastgrad','tastgradLauf','laufFroude','maxWinkel','hub','hubLauf','hubForm','beckenHub','rollWinkel','fersenAb','ballen','knoechel'].every(function(k){return isFinite(_GZ0[k]);}))throw new Error('Kern-Pflicht: tetrapoda gangSchritt/gangFuss/gangBecken/gangReich/gangPhaseHaelt + koerper fx.bewegung.gang');
var _GZ=Object.assign({},_GZ0,{g:G_BUEHNE,vMax:Infinity});
function gangGesetz(v,Lg){var gs=_TC.gangSchritt(v,Lg,_GZ);return{cad:gs.omega/(2*Math.PI),omega:gs.omega,S:gs.S,tast:gs.tast,hubE:gs.hub*Lg};}
// der Fuss zur Studio-Phase ph (0..1, der Stand zuerst): die Phase des Gesetzes beginnt mit dem Schwung; cs = die Skala
// des Leibs (Welt-Einheiten je Gelenk-Einheit), Rk = die Reichweite der Kette (gangReich) im Gelenk-Mass. Der Fuss rollt
// im spaeten Stand ueber den Ballen (tetrapoda gangRolle wie in der Welt): heb hebt den Knoechel, roll kippt die Sohle --
// vorher drehte ein zweites Modell (anklePhase) den Knoechel nach eigener Kurve, ohne dass das Becken davon wusste.
function gangFussStudio(ph,gs,sY,cs,Rk){var f=_TC.gangFuss(2*Math.PI*((ph+1-gs.tast)%1),gs.S,gs.tast,_GZ,Rk*cs,_TC.gangReich(L1+L2)*cs);return{y:sY+f.hub*gs.hubE/cs+f.heb/cs,z:f.dz/cs,heb:f.heb/cs,roll:f.roll};}
// V18.491.157 — Lab emo.cur idle seed ← MOTION.idle (EINE Quelle; cold-core byte-alt fallback = core idle numbers)
var emo={cur:Object.assign({},(window.__koerperCore&&window.__koerperCore.MOTION&&window.__koerperCore.MOTION.idle)||{headY:0,headX:0,headZ:0,spineY:0,spineX:0,spineZ:0,bodyX:0,bodyZ:0,armL:0,armR:0,armLX:0,armRX:0,elbowL:0.14,elbowR:0.14,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.042,sway:0.022,freq:1.25,kpMul:1.0,irisSpeed:0.3,blinkRate:0.5}),tgt:null,name:'idle',behTimer:0,behType:null,behStart:0,
presets:window.__koerperCore.MOTION,   // BEWEGUNGS-PROFILE — das motion-Feld lebt im Kern (W-A6, EINE Quelle; emo.set kopiert je Wahl)
set:function(name){this.tgt=Object.assign({},this.presets[name]);this.name=name;this.behTimer=0;this.behType=null;var sY=standYBase;if(name==='run')sY=standYRun;if(name==='fear')sY=standYBase*0.96;if(name==='sad')sY=standYBase*0.99;if(name!=='run'&&name!=='fight'&&name!=='pwalk'&&name!=='slide'){var zL=0,zR=0;var ikL=solveIK(sY,zL,L1,L2),ikR=solveIK(sY,zR,L1,L2);this.tgt.hipLX=ikL.hip;this.tgt.hipRX=ikR.hip;this.tgt.kneeL=ikL.knee;this.tgt.kneeR=ikR.knee;}},
update:function(dt,t){if(!this.tgt)return;var c=this.cur,g=this.tgt,l=1-Math.exp(-3.1*dt);var keys=['headY','headX','headZ','spineY','spineX','spineZ','bodyX','bodyZ','armL','armR','armLX','armRX','elbowL','elbowR','hipLX','hipRX','hipLZ','hipRZ','kneeL','kneeR','breath','sway','freq','kpMul','irisSpeed','blinkRate'];for(var i=0;i<keys.length;i++)c[keys[i]]+=(g[keys[i]]-c[keys[i]])*l;this.behTimer+=dt;if(this.name==='idle'){var ib=['walk','walk','walk','lookaround','shift','breathe','glance','headtilt'];if(this.behTimer>2.5+Math.random()*3){this.behTimer=0;this.behType=ib[Math.floor(Math.random()*ib.length)];this.behStart=t;}}else if(this.name==='joy'){var jb=['dance','dance','jump','wave','spin','bounce','clap'];if(this.behTimer>2+Math.random()*2.5){this.behTimer=0;this.behType=jb[Math.floor(Math.random()*jb.length)];this.behStart=t;}}else if(this.name==='sad'){var sb=['wipetear','sigh','lookdown','droop','wilt'];if(this.behTimer>4+Math.random()*3){this.behTimer=0;this.behType=sb[Math.floor(Math.random()*sb.length)];this.behStart=t;}}else if(this.name==='angry'){var ab=['shout','clench','lunge','stomp','pound','glare'];if(this.behTimer>1.5+Math.random()*2){this.behTimer=0;this.behType=ab[Math.floor(Math.random()*ab.length)];this.behStart=t;}}else if(this.name==='fear'){var fb=['shrink','tremble','cower','flinch','cringe'];if(this.behTimer>1.2+Math.random()*1.5){this.behTimer=0;this.behType=fb[Math.floor(Math.random()*fb.length)];this.behStart=t;}}else if(this.name==='run'){this.behType='running';}else if(this.name==='pwalk'){this.behType='pwalking';}else if(this.name==='slide'){this.behType='sliding';}else if(this.name==='fight'){var fb2=['jab','cross','hook','guard','dodge','kick','combo'];if(this.behTimer>0.5+Math.random()*1.0){this.behTimer=0;this.behType=fb2[Math.floor(Math.random()*fb2.length)];this.behStart=t;}}else if(this.name==='showcase'){this.behType='showcase';}},
getBeh:function(t){var m={headY:0,headX:0,headZ:0,spineY:0,spineX:0,spineZ:0,bodyX:0,bodyZ:0,armL:0,armR:0,armLX:0,armRX:0,elbowL:0,elbowR:0,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,ankleL:0,ankleR:0,breathBoost:1,jumpY:0,tensionBoost:0,mouthBoost:0,browBoost:0};var pt;function guardBase(m){var ikL=solveIK(standYBase,0.2,L1,L2),ikR=solveIK(standYBase,-0.2,L1,L2);m.armRZ=0.1;m.armLZ=0.1;m.armRX=-0.45;m.armLX=-0.45;m.elbowR=1.35;m.elbowL=1.35;m.hipLX=ikL.hip;m.hipRX=ikR.hip;m.hipLZ=-0.12;m.hipRZ=0.12;m.kneeR=ikR.knee;m.kneeL=ikL.knee;m.ankleR=0.05;m.ankleL=0.05;}
if(this.behType==='walk'){var gs=gangGesetz(NINJA_FEEL.ctrlWalk,L1+L2),ph=(t*gs.cad)%1.0,pL=ph,pR=(ph+0.5)%1.0;var fL=gangFussStudio(pL,gs,standYWalk,1,_TC.gangReich(L1+L2)),fR=gangFussStudio(pR,gs,standYWalk,1,_TC.gangReich(L1+L2));var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);m.hipLX=ikL.hip;m.kneeL=ikL.knee;m.ankleL=fL.roll;m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=fR.roll;m.armLX=Math.cos(ph*2*Math.PI)*0.3;m.armRX=-Math.cos(ph*2*Math.PI)*0.3;m.elbowL=0.15+Math.abs(Math.cos(ph*2*Math.PI))*0.1;m.elbowR=0.15+Math.abs(Math.cos(ph*2*Math.PI+Math.PI))*0.1;m.spineY=Math.cos(ph*2*Math.PI)*0.05;m.bodyZ=Math.cos(ph*2*Math.PI+Math.PI/2)*0.02;m.jumpY=Math.abs(Math.sin(ph*2*Math.PI))*0.02;m.breathBoost=1.3;m.headY=Math.sin(ph*Math.PI)*0.04;m.tensionBoost=0.15;return m;}
if(this.behType==='running'){var gs=gangGesetz(NINJA_FEEL.sprintSpd,L1+L2),ph=(t*gs.cad)%1.0,pL=ph,pR=(ph+0.5)%1.0;var fL=gangFussStudio(pL,gs,standYRun,1,_TC.gangReich(L1+L2)),fR=gangFussStudio(pR,gs,standYRun,1,_TC.gangReich(L1+L2));var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);m.hipLX=ikL.hip;m.kneeL=ikL.knee;m.ankleL=fL.roll;m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=fR.roll;var aS=Math.cos(ph*2*Math.PI);m.armLX=aS*1.25;m.armRX=-aS*1.25;m.armR=0.12;m.armL=0.12;m.elbowL=1.4+Math.max(0,aS)*0.55;m.elbowR=1.4+Math.max(0,-aS)*0.55;m.spineY=aS*0.26;m.headY=-aS*0.14;m.spineX=0.30;m.spineZ=aS*0.05;m.bodyX=0.18;m.bodyZ=-aS*0.06;m.jumpY=Math.pow(Math.abs(Math.sin(ph*2*Math.PI)),0.65)*0.30;m.breathBoost=2.0;m.headX=-0.08;m.tensionBoost=0.55;return m;}
if(this.behType==='pwalking'){var gs=gangGesetz(NINJA_FEEL.walkSpd,L1+L2),ph=(t*gs.cad)%1.0,pL=ph,pR=(ph+0.5)%1.0;var fL=gangFussStudio(pL,gs,standYBase,1,_TC.gangReich(L1+L2)),fR=gangFussStudio(pR,gs,standYBase,1,_TC.gangReich(L1+L2));var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);m.hipLX=ikL.hip;m.kneeL=ikL.knee;m.ankleL=fL.roll;m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=fR.roll;var aS=Math.cos(ph*2*Math.PI);m.armLX=aS*0.42;m.armRX=-aS*0.42;m.armR=0.04;m.armL=0.04;m.elbowL=0.32+Math.max(0,aS)*0.15;m.elbowR=0.32+Math.max(0,-aS)*0.15;m.spineY=aS*0.09;m.headY=-aS*0.05;m.spineZ=aS*0.035;m.spineX=0.05;m.bodyX=0.04;m.bodyZ=-aS*0.035;m.jumpY=Math.pow(Math.abs(Math.sin(ph*2*Math.PI)),0.8)*0.055;m.breathBoost=1.3;m.headX=-0.03;m.tensionBoost=0.12;return m;}
if(this.behType==='sliding'){m.hipRX=-0.55;m.kneeR=0.35;m.ankleR=0.18;m.hipLX=0.15;m.kneeL=1.75;m.ankleL=0.1;m.spineX=0.34;m.bodyX=0.20;m.spineY=0.12;m.spineZ=0.06;m.armRX=0.55;m.armLX=-0.30;m.armR=0.22;m.armL=0.16;m.elbowR=0.85;m.elbowL=0.55;m.headX=-0.30;m.headY=-0.06;m.breathBoost=1.5;m.tensionBoost=0.6;return m;}
if(this.behType==='dance'){pt=t-this.behStart;if(pt>5){this.behType=null;return m;}var dT=pt*2.8;m.hipLZ=Math.sin(dT)*0.1;m.hipRZ=-Math.sin(dT)*0.1;m.bodyZ=Math.sin(dT)*0.08;m.spineY=Math.sin(dT*0.5)*0.1;m.spineZ=Math.sin(dT)*0.04;m.armL=0.3+Math.sin(dT)*0.2;m.armR=0.3-Math.sin(dT)*0.2;m.armLX=-0.2+Math.sin(dT*0.7)*0.15;m.armRX=-0.2+Math.sin(dT*0.7+Math.PI)*0.15;m.elbowL=0.4+Math.sin(dT*1.3)*0.2;m.elbowR=0.4+Math.sin(dT*1.3+Math.PI)*0.2;m.kneeL=0.1+Math.abs(Math.sin(dT))*0.1;m.kneeR=0.1+Math.abs(Math.sin(dT+Math.PI))*0.1;m.jumpY=Math.abs(Math.sin(dT*2))*0.03;m.mouthBoost=0.1;m.headY=Math.sin(dT*0.7)*0.1;m.headZ=Math.sin(dT)*0.04;return m;}
if(this.behType==='wipetear'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}if(pt<0.2){var i=pt/0.2;m.armR=0.35*i;m.armRX=-0.45*i;m.elbowR=1.0*i;m.headX=0.15+0.02*i;m.headY=0.02*i;}else if(pt<0.45){var i=(pt-0.2)/0.25;m.armR=0.35;m.armRX=-0.45;m.elbowR=1.0;m.headY=0.02+0.08*i;m.headX=0.17+0.03*i;}else if(pt<0.7){var i=(pt-0.45)/0.25;m.armR=0.35*(1-i);m.armRX=-0.45*(1-i);m.elbowR=1.0*(1-i);m.headY=0.1-0.1*i;m.headX=0.2-0.05*i;}return m;}
if(this.behType==='shout'){pt=t-this.behStart;if(pt>1.8){this.behType=null;return m;}if(pt<0.2){var i=pt/0.2;m.armR=2.0*i;m.armRX=-0.3*i;m.elbowR=0.1*i;m.armL=0.8*i;m.armLX=-0.2*i;m.elbowL=0.3*i;m.headX=-0.05-0.12*i;m.bodyX=-0.04-0.06*i;m.mouthBoost=0.18*i;m.tensionBoost=0.5*i;m.spineX=-0.05*i;}else if(pt<1.2){m.armR=2.0+Math.sin(pt*8)*0.05;m.armRX=-0.3;m.elbowR=0.1;m.armL=0.8;m.armLX=-0.2;m.elbowL=0.3+Math.sin(pt*6)*0.1;m.headX=-0.17;m.bodyX=-0.1;m.mouthBoost=0.18+Math.sin(pt*5)*0.04;m.tensionBoost=0.5;m.browBoost=-0.15;m.spineX=-0.05;}else{var ft=(pt-1.2)/0.6;m.armR=2.0*(1-ft);m.armRX=-0.3*(1-ft);m.elbowR=0.1*(1-ft);m.armL=0.8*(1-ft);m.armLX=-0.2*(1-ft);m.elbowL=0.3*(1-ft);m.headX=-0.17+0.12*ft;m.bodyX=-0.1+0.06*ft;m.mouthBoost=0.18*(1-ft);m.tensionBoost=0.5*(1-ft);m.spineX=-0.05*(1-ft);}return m;}
if(this.behType==='shrink'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.spineY=Math.sin(t*2.5)*0.25*i;m.headY=Math.sin(t*2.5)*0.15*i;m.headX=0.08*i+Math.sin(t*4)*0.02;m.spineX=0.06*i;m.bodyZ=Math.sin(t*1.8)*0.03*i;m.bodyX=0.04*i;var sY=standYBase*(1-0.05*i);var ik=solveIK(sY,0,L1,L2);m.kneeL=ik.knee;m.kneeR=ik.knee;m.hipLX=ik.hip;m.hipRX=ik.hip;m.elbowL=0.3+i*0.4;m.elbowR=0.3+i*0.4;m.armLX=0.08*i;m.armRX=0.08*i;m.armL=0.05*i;m.armR=0.05*i;m.tensionBoost=0.2*i;return m;}
if(this.behType==='guard'){pt=(t-this.behStart)/2.0;if(pt>=1){this.behType=null;return m;}guardBase(m);var i=Math.sin(t*3.5);m.kneeR+=i*0.06;m.kneeL-=i*0.06;m.bodyZ=i*0.04;m.spineY=Math.sin(t*2)*0.06;m.headY=Math.sin(t*1.8)*0.04;m.headX=-0.06+Math.sin(t*4)*0.01;return m;}
if(this.behType==='jab'){guardBase(m);pt=t-this.behStart;if(pt>0.32){this.behType=null;return m;}if(pt<0.06){var i=pt/0.06;m.armLX=-0.45-0.55*i;m.elbowL=1.35-1.25*i;m.spineY=0.08*i;m.bodyX=0.03*i;}else if(pt<0.15){m.armLX=-1.0;m.elbowL=0.1;m.spineY=0.08;m.bodyX=0.03;}else{var ft=(pt-0.15)/0.17;m.armLX=-1.0+0.55*ft;m.elbowL=0.1+1.25*ft;m.spineY=0.08*(1-ft);m.bodyX=0.03*(1-ft);}return m;}
if(this.behType==='cross'){guardBase(m);pt=t-this.behStart;if(pt>0.45){this.behType=null;return m;}if(pt<0.09){var i=pt/0.09;m.armRX=-0.45-0.55*i;m.elbowR=1.35-1.25*i;m.spineY=-0.12*i;m.bodyX=0.05*i;}else if(pt<0.2){m.armRX=-1.0;m.elbowR=0.1;m.spineY=-0.12;m.bodyX=0.05;}else{var ft=(pt-0.2)/0.25;m.armRX=-1.0+0.55*ft;m.elbowR=0.1+1.25*ft;m.spineY=-0.12*(1-ft);m.bodyX=0.05*(1-ft);}return m;}
if(this.behType==='hook'){guardBase(m);pt=t-this.behStart;if(pt>0.55){this.behType=null;return m;}if(pt<0.18){var i=pt/0.18;m.armRZ=0.1-0.25*i;m.armRX=-0.45-0.2*i;m.elbowR=1.35-0.15*i;m.spineY=0.1*i;m.bodyZ=0.06*i;}else if(pt<0.3){m.armRZ=-0.15;m.armRX=-0.65;m.elbowR=1.2;m.spineY=0.1;m.bodyZ=0.06;}else{var ft=(pt-0.3)/0.25;m.armRZ=-0.15+0.25*ft;m.armRX=-0.65+0.2*ft;m.elbowR=1.2+0.15*ft;m.spineY=0.1*(1-ft);m.bodyZ=0.06*(1-ft);}return m;}
if(this.behType==='kick'){guardBase(m);pt=t-this.behStart;if(pt>1.2){this.behType=null;return m;}if(pt<0.22){var i=pt/0.22;m.bodyZ=-0.15*i;m.spineX=0.08*i;var kY=standYBase+0.8*i,kZ=-0.2-0.15*i;var ik=solveIK(kY,kZ,L1,L2);m.hipRX=ik.hip;m.kneeR=ik.knee;}else if(pt<0.38){var i=(pt-0.22)/0.16;m.bodyZ=-0.15;m.spineX=0.08;var kY=standYBase+0.6-0.6*i,kZ=-0.35+0.8*i;var ik=solveIK(kY,kZ,L1,L2);m.hipRX=ik.hip;m.kneeR=ik.knee;m.ankleR=0.5*i;}else{var ft=(pt-0.38)/0.82;m.bodyZ=-0.15*(1-ft);m.spineX=0.08*(1-ft);var ikR=solveIK(standYBase,-0.2,L1,L2);m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=0.5*(1-ft);}return m;}
if(this.behType==='combo'){guardBase(m);pt=t-this.behStart;if(pt>0.9){this.behType=null;return m;}if(pt<0.1){var i=pt/0.1;m.armLX=-0.45-0.55*i;m.elbowL=1.35-1.25*i;m.spineY=0.08*i;}else if(pt<0.18){m.armLX=-1.0;m.elbowL=0.1;m.spineY=0.08;}else if(pt<0.28){var ft1=(pt-0.18)/0.1;m.armLX=-1.0+0.55*ft1;m.elbowL=0.1+1.25*ft1;m.spineY=0.08*(1-ft1)-0.12*ft1;m.armRX=-0.45-0.55*ft1;m.elbowR=1.35-1.25*ft1;m.bodyX=0.05*ft1;}else if(pt<0.4){m.armLX=-0.45;m.elbowL=1.35;m.spineY=-0.12;m.armRX=-1.0;m.elbowR=0.1;m.bodyX=0.05;}else if(pt<0.55){var ft2=(pt-0.4)/0.15;m.armRX=-1.0+0.55*ft2;m.elbowR=0.1+1.25*ft2;m.spineY=-0.12*(1-ft2);m.bodyX=0.05*(1-ft2);}else{var ft3=(pt-0.55)/0.35;guardBase(m);m.spineY=0.05*(1-ft3);}return m;}
if(this.behType==='dodge'){guardBase(m);pt=(t-this.behStart)/0.55;if(pt>=1){this.behType=null;return m;}m.bodyZ=Math.sin(pt*Math.PI)*0.14;m.spineY=-Math.sin(pt*Math.PI)*0.12;m.headY=-Math.sin(pt*Math.PI)*0.08;return m;}
if(this.behType==='lookaround'){pt=(t-this.behStart)/4.5;if(pt>=1){this.behType=null;return m;}m.headY=Math.sin(pt*Math.PI*2)*0.28;m.headX=Math.sin(pt*Math.PI)*0.04;return m;}
if(this.behType==='shift'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}m.bodyZ=Math.sin(pt*Math.PI)*0.04;m.hipLZ=Math.sin(pt*Math.PI)*0.05;m.hipRZ=-Math.sin(pt*Math.PI)*0.05;return m;}
if(this.behType==='breathe'){pt=(t-this.behStart)/3.5;if(pt>=1){this.behType=null;return m;}m.breathBoost=1+Math.sin(pt*Math.PI)*0.8;return m;}
if(this.behType==='glance'){pt=(t-this.behStart)/1.5;if(pt>=1){this.behType=null;return m;}m.headY=Math.sin(pt*Math.PI)*0.18;m.headX=-Math.sin(pt*Math.PI)*0.03;return m;}
if(this.behType==='headtilt'){pt=(t-this.behStart)/3;if(pt>=1){this.behType=null;return m;}m.headZ=Math.sin(pt*Math.PI)*0.08;m.headY=Math.sin(pt*Math.PI*0.5)*0.05;return m;}
if(this.behType==='jump'){pt=t-this.behStart;if(pt>1.0){this.behType=null;return m;}if(pt<0.15){var i=pt/0.15;var jk=solveIK(standYBase*(1-0.12*i),0,L1,L2);m.kneeL=jk.knee;m.kneeR=jk.knee;m.hipLX=jk.hip;m.hipRX=jk.hip;m.bodyX=0.05*i;m.armL=0.3*i;m.armR=0.3*i;}else if(pt<0.55){var ft=(pt-0.15)/0.4;m.jumpY=Math.sin(ft*Math.PI)*0.45;var ext=standYBase*(0.88+0.12*Math.sin(ft*Math.PI));var jk2=solveIK(ext,0,L1,L2);m.kneeL=jk2.knee;m.kneeR=jk2.knee;m.hipLX=jk2.hip;m.hipRX=jk2.hip;m.bodyX=0.03;m.armL=0.4;m.armR=0.4;}else{var lt=(pt-0.55)/0.45;var jk3=solveIK(standYBase*(1-0.08*(1-lt)),0,L1,L2);m.kneeL=jk3.knee;m.kneeR=jk3.knee;m.hipLX=jk3.hip;m.hipRX=jk3.hip;m.bodyX=0.03*(1-lt);m.armL=0.4*(1-lt);m.armR=0.4*(1-lt);}return m;}
if(this.behType==='wave'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}m.armR=0.55+Math.sin(pt*Math.PI*8)*0.15;m.armRX=-0.3+Math.sin(pt*Math.PI*8)*0.05;m.elbowR=0.3+Math.sin(pt*Math.PI*8)*0.12;m.headY=Math.sin(pt*Math.PI)*0.1;m.mouthBoost=0.08*Math.sin(pt*Math.PI);return m;}
if(this.behType==='spin'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}m.bodyZ=Math.sin(pt*Math.PI*2)*0.12;m.spineY=Math.sin(pt*Math.PI*2)*0.22;m.headY=Math.sin(pt*Math.PI*2)*0.28;m.armL=0.35;m.armR=0.35;return m;}
if(this.behType==='bounce'){pt=t-this.behStart;if(pt>1.5){this.behType=null;return m;}m.jumpY=Math.abs(Math.sin(pt*4.5))*0.1;m.armL=Math.sin(pt*4.5)*0.12;m.armR=-Math.sin(pt*4.5)*0.12;var bk=solveIK(standYBase*(1-0.06*Math.abs(Math.sin(pt*4.5))),0,L1,L2);m.kneeL=bk.knee;m.kneeR=bk.knee;m.hipLX=bk.hip;m.hipRX=bk.hip;m.mouthBoost=0.1;return m;}
if(this.behType==='clap'){pt=t-this.behStart;if(pt>1.5){this.behType=null;return m;}var ci=Math.abs(Math.sin(pt*8));m.armL=0.3+ci*0.15;m.armR=0.3+ci*0.15;m.armLX=-0.3;m.armRX=-0.3;m.elbowL=0.4+ci*0.2;m.elbowR=0.4+ci*0.2;m.mouthBoost=0.1;return m;}
if(this.behType==='sigh'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}m.breathBoost=1+Math.sin(pt*Math.PI)*1.0;m.headX=Math.sin(pt*Math.PI)*0.08;m.bodyX=Math.sin(pt*Math.PI)*0.03;m.spineX=Math.sin(pt*Math.PI)*0.04;return m;}
if(this.behType==='lookdown'){pt=(t-this.behStart)/4.5;if(pt>=1){this.behType=null;return m;}m.headX=Math.sin(pt*Math.PI)*0.2;m.headY=Math.sin(pt*Math.PI*2)*0.05;return m;}
if(this.behType==='droop'){pt=(t-this.behStart)/3.5;if(pt>=1){this.behType=null;return m;}m.spineX=Math.sin(pt*Math.PI)*0.07;m.headX=Math.sin(pt*Math.PI)*0.06;m.bodyX=Math.sin(pt*Math.PI)*0.02;return m;}
if(this.behType==='wilt'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}m.spineX=0.06*Math.sin(pt*Math.PI);m.headX=0.07*Math.sin(pt*Math.PI);m.bodyX=0.03*Math.sin(pt*Math.PI);return m;}
if(this.behType==='clench'){pt=(t-this.behStart)/1.5;if(pt>=1){this.behType=null;return m;}m.tensionBoost=Math.sin(pt*Math.PI)*0.45;m.elbowL=0.15+Math.sin(pt*Math.PI)*0.2;m.elbowR=0.15+Math.sin(pt*Math.PI)*0.2;m.armLX=-0.12*Math.sin(pt*Math.PI);m.armRX=-0.12*Math.sin(pt*Math.PI);return m;}
if(this.behType==='lunge'){pt=t-this.behStart;if(pt>0.9){this.behType=null;return m;}if(pt<0.2){var i=pt/0.2;m.bodyX=0.08*i;m.spineX=0.05*i;m.elbowL=0.15+0.15*i;m.elbowR=0.15+0.15*i;m.tensionBoost=0.4*i;m.armLX=-0.15*i;m.armRX=-0.15*i;}else{var ft=(pt-0.2)/0.7;m.bodyX=0.08*(1-ft);m.spineX=0.05*(1-ft);m.elbowL=0.3-0.15*ft;m.elbowR=0.3-0.15*ft;m.tensionBoost=0.4*(1-ft);m.armLX=-0.15*(1-ft);m.armRX=-0.15*(1-ft);}return m;}
if(this.behType==='glare'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}m.headX=-Math.sin(pt*Math.PI)*0.05;m.browBoost=-0.15;m.tensionBoost=0.15*Math.sin(pt*Math.PI);return m;}
if(this.behType==='stomp'){pt=t-this.behStart;if(pt>0.6){this.behType=null;return m;}if(pt<0.15){var i=pt/0.15;var stY=standYBase*(1+0.15*i);var ik=solveIK(stY,-0.1,L1,L2);m.hipRX=ik.hip;m.kneeR=ik.knee;m.jumpY=0.03*i;}else if(pt<0.25){m.jumpY=0.03;}else{var ft=(pt-0.25)/0.35;var stY2=standYBase*(1.15-0.15*ft);var ik2=solveIK(stY2,-0.1+0.1*ft,L1,L2);m.hipRX=ik2.hip;m.kneeR=ik2.knee;m.jumpY=0.03*(1-ft)+Math.sin(ft*Math.PI)*0.04;m.bodyX=0.06*Math.sin(ft*Math.PI);m.tensionBoost=0.3*Math.sin(ft*Math.PI);m.ankleR=0.3*Math.sin(ft*Math.PI);}return m;}
if(this.behType==='pound'){pt=t-this.behStart;if(pt>0.8){this.behType=null;return m;}if(pt<0.15){var i=pt/0.15;m.armR=0.4*i;m.armRX=-0.5*i;m.elbowR=0.3*i;}else if(pt<0.3){m.armR=0.4;m.armRX=-0.5;m.elbowR=0.3;}else{var ft=(pt-0.3)/0.5;m.armR=0.4*(1-ft);m.armRX=-0.5*(1-ft);m.elbowR=0.3*(1-ft);m.bodyX=0.04*Math.sin(ft*Math.PI);}return m;}
if(this.behType==='tremble'){pt=t-this.behStart;if(pt>1.8){this.behType=null;return m;}m.bodyZ=Math.sin(t*12)*0.004;m.spineZ=Math.sin(t*11)*0.004;m.headZ=Math.sin(t*10)*0.003;m.headX=Math.sin(t*9)*0.003;m.elbowL=0.08+Math.sin(t*13)*0.015;m.elbowR=0.08+Math.sin(t*13)*0.015;return m;}
if(this.behType==='cower'){pt=(t-this.behStart)/2.2;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.bodyX=i*0.08;m.spineX=i*0.1;m.headX=i*0.08;m.elbowL=0.15+i*0.6;m.elbowR=0.15+i*0.6;var cwY=standYBase*(1-0.08*i);var ik=solveIK(cwY,0,L1,L2);m.kneeL=ik.knee;m.kneeR=ik.knee;m.hipLX=ik.hip;m.hipRX=ik.hip;m.armLX=0.1*i;m.armRX=0.1*i;return m;}
if(this.behType==='flinch'){pt=t-this.behStart;if(pt>0.5){this.behType=null;return m;}if(pt<0.1){var i=pt/0.1;m.bodyX=0.06*i;m.headX=0.04*i;m.elbowL=0.15+0.4*i;m.elbowR=0.15+0.4*i;var flY=standYBase*(1-0.06*i);var ik=solveIK(flY,0,L1,L2);m.kneeL=ik.knee;m.kneeR=ik.knee;m.hipLX=ik.hip;m.hipRX=ik.hip;m.armLX=0.08*i;m.armRX=0.08*i;}else{var ft=(pt-0.1)/0.4;m.bodyX=0.06*(1-ft);m.headX=0.04*(1-ft);m.elbowL=0.55-0.4*ft;m.elbowR=0.55-0.4*ft;var flY2=standYBase*(0.94+0.06*ft);var ik2=solveIK(flY2,0,L1,L2);m.kneeL=ik2.knee;m.kneeR=ik2.knee;m.hipLX=ik2.hip;m.hipRX=ik2.hip;m.armLX=0.08*(1-ft);m.armRX=0.08*(1-ft);}return m;}
if(this.behType==='cringe'){pt=(t-this.behStart)/1.5;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.bodyX=0.04*i;m.spineX=0.06*i;m.headX=0.05*i;m.elbowL=0.1+i*0.5;m.elbowR=0.1+i*0.5;m.armLX=0.1*i;m.armRX=0.1*i;var crY=standYBase*(1-0.06*i);var ik=solveIK(crY,0,L1,L2);m.kneeL=ik.knee;m.kneeR=ik.knee;m.hipLX=ik.hip;m.hipRX=ik.hip;return m;}
if(this.behType==='showcase'){m.headY=Math.sin(t*0.15)*0.3;m.headX=Math.sin(t*0.15*0.7+0.5)*0.05-0.02;m.headZ=Math.sin(t*0.15*0.5)*0.03;m.spineY=Math.sin(t*0.12)*0.06;m.bodyZ=Math.sin(t*0.1)*0.02;return m;}
return m;}};
const scene=new THREE.Scene();scene.background=new THREE.Color(0x080808);
const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,0.1,100);camera.position.set(0,3,8);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
function env(){const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#aabbcc');g.addColorStop(0.5,'#333');g.addColorStop(1,'#050505');x.fillStyle=g;x.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);const p=new THREE.PMREMGenerator(renderer);const e=p.fromEquirectangular(t).texture;t.dispose();return e;}
scene.environment=env();
// die Paletten wohnen im Gesetzbuch (koerper-core SKIN_TONES · HAIR_COLORS · CLOTH_COLORS) — die Wahlen münzen daraus die Guss-Farben
const SKIN_TONES=window.__koerperCore.SKIN_TONES,HAIR_COLORS=window.__koerperCore.HAIR_COLORS,CLOTH_COLORS=window.__koerperCore.CLOTH_COLORS;
const {trochanterY}=window.__koerperCore.labProportionen();
/* LABOR = WELT (K45-2, Synthese §4 W5d „das Labor zeigt den Ofen-Körper"): die Gestalt des Labors IST der Guss der Welt —
   DERSELBE Bäcker wie Foundry-Worker und Wirts-Ofen (foundry-core BAKERS_BY_KIND.koerper, Saat 0 wie `_ofenMenschTemplate`),
   aus denselben Dials und Farben (params = START_PARAMS + die Wahlen, die die Übergabe der Welt reicht; Haut- und Haar-Ton aus
   den Paletten wie `_menschGussFarben`), mit derselben LOD-Kette: L0 nah, L1 jenseits `ab` (± `hyst`) der Budget-Zeile, an die
   Knochen der feinen gebunden, und die Grobstufe wirft als Zwilling. Gefallen: der eigene Leib des Labors (bauMensch mit
   64er-Kugeln, die Haut-, Schädel- und Gesichts-Schalen, die Kleid-Schnitte mit Säumen, Klammern und Nähten, die Strähnen-
   Frisuren aus Math.random, die Haut-Textur) — 332 645 Dreiecke gegen die Welt-Zeile 40 000. Die Kleid-Gewichts-Vererbung
   lebt im Ofen (`__stoffErbtHaut`). Die Stoffe webt `laborStoff` aus dem Bäcker-Stoff und den Look-Gesetzen HAUT_LOOK ·
   HAAR_LOOK und der Webung der Kleid-Zeile — dieselben Zahlen liest der Welt-Stoff (stamm, TSL). */
var KC=window.__koerperCore,BZ=KC.PORTAL_RENDER_CONFIG.lod.budget.koerper,STUFEN=KC.PORTAL_RENDER_CONFIG.lod.kindStages.koerper;
var HL=KC.HAUT_LOOK,HAL=KC.HAAR_LOOK;
var uZeit={value:0},stufeWahl='auto',gestalt=null;
var character=null,torsoG=null,headGroup=null,irisL=null,irisR=null,lidTL=null,lidTR=null,hairGroup=null,torsoR=0.38;
function gf(x){var s=(+x).toString();return s.indexOf('.')<0&&s.indexOf('e')<0?s+'.0':s;}
function gv(a){return 'vec3('+gf(a[0])+','+gf(a[1])+','+gf(a[2])+')';}
var GLSL_RAUSCHEN='vec3 mod289_s(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 mod289_s(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 permute_s(vec4 x){return mod289_s(((x*34.0)+1.0)*x);}\nvec4 taylorInvSqrt_s(vec4 r){return 1.79284291400159-0.85373472095314*r;}\nfloat snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289_s(i);vec4 p=permute_s(permute_s(permute_s(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt_s(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}\n';
// DIE WEBUNG je Kleid-Zeile (die Welt: stamm `mp.webe` — Frequenz und Tiefe der Mikro-Struktur)
var WEBE=window.__koerperCore.WEBE;   // die EINE Webungs-Tafel (koerper-core WEBE, K2)
// DER LABOR-STOFF: der Bäcker-Stoff (Farbe linear, Rauheit, Seite, Glut — dieselben Zahlen, die als mp reisen) + die Vertex-
// Farbe als Farbe (die Welt liest nur sie) + die Look-Gesetze der Klasse als r128-GLSL: Haut (SSS-Saum, Klarlack), Haar
// (Spitzen-Rim · Spec über die Strähnen-Achse), Stoff (die Webung).
function laborStoff(m0,geo,skin,cache){
  var k=(m0.userData&&m0.userData.__klasse)||'skin',vc=!!geo.attributes.color,key=k+(skin?'|s':'')+(vc?'|c':'');
  if(cache[key])return cache[key];
  var haut=k==='haut'||k==='skin',haar=k==='hair',webe=m0.userData&&m0.userData.__webe&&WEBE[m0.userData.__webe];
  var m;
  if(haut){m=new THREE.MeshPhysicalMaterial({color:m0.color.clone(),roughness:m0.roughness,metalness:m0.metalness,clearcoat:HL.clearcoat,clearcoatRoughness:HL.clearcoatRoughness});m.userData=Object.assign({},m0.userData);}
  else m=m0.clone();
  m.skinning=skin;if(vc){m.vertexColors=true;m.color.setRGB(1,1,1);}
  if(haut||haar||webe){
    var tonL=Math.max(1e-4,0.2126*m0.color.r+0.7152*m0.color.g+0.0722*m0.color.b);
    m.onBeforeCompile=function(sh){
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGeo;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGeo=position;');
      var fk='varying vec3 vGeo;\n'+(webe?GLSL_RAUSCHEN:'');
      var farbe=webe?'\ndiffuseColor.rgb*=1.0+snoise(vGeo*'+gf(webe[0])+')*'+gf(webe[1])+';':'';
      var look='\nvec3 vdL=normalize(-vViewPosition);float ndvL=clamp(dot(normal,vdL),-1.0,1.0);float rimL=clamp(1.0-abs(ndvL),0.0,1.0);';
      if(haut)look+='totalEmissiveRadiance+='+gv(HL.sssFarbe)+'*pow(rimL,'+gf(HL.sssPow)+')*'+gf(HL.sssAmt)+';';
      else if(haar){var sT=!vc?'1.0':'clamp((dot(vColor,vec3(0.2126,0.7152,0.0722))/'+gf(tonL)+'-'+gf(HAL.wurzelAnker)+')/'+gf(Math.max(1e-3,1-HAL.wurzelAnker))+',0.0,1.0)';
        look+='float sTL='+sT+';totalEmissiveRadiance+='+gv(HAL.tipRimFarbe)+'*pow(rimL,'+gf(HAL.tipRimPow)+')*sTL+'+gv(HAL.specFarbe)+'*pow(max(ndvL,0.0),'+gf(HAL.specPow)+')*sTL*'+gf(HAL.specAmt)+';';}
      else look='';
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+fk).replace('#include <color_fragment>','#include <color_fragment>'+farbe).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>'+look);
    };
    m.customProgramCacheKey=function(){return 'labor-welt-mensch-'+key+(webe?'|'+m0.userData.__webe:'');};
  }
  cache[key]=m;return m;
}
// DER GELENK-BAUM des Beipacks (die Welt: `_ofenAssembleAsset`): je Gelenk ein Knochen (die Haut bindet an ihn), benannt,
// in der Ruhe-Pose des Gusses.
function gelenkBaum(sk){var teile={},bones=Array.isArray(sk.skinJoints)&&sk.skinJoints.length>0,root=new THREE.Group();
  sk.joints.forEach(function(j){var b=bones?new THREE.Bone():new THREE.Group();b.name=j.name;teile[j.name]=b;});
  sk.joints.forEach(function(j){var b=teile[j.name];if(j.parent&&teile[j.parent])teile[j.parent].add(b);else if(j.name===sk.root)root.add(b);else(teile[sk.root]||root).add(b);b.position.fromArray(j.pos);b.quaternion.fromArray(j.quat);b.scale.fromArray(j.scale);});
  return {root:root,teile:teile};}
// die Guss-Eingabe der Welt: die Dials samt Wahlen, Haut- und Haar-Ton aus den Paletten (stamm `_menschGussFarben`)
function gussOv(){return {dials:Object.assign({},params),skinColor:SKIN_TONES[params.skinTone].hex>>>0,hairColor:HAIR_COLORS[params.hairColor].base>>>0};}
// EINE STUFE an den Baum: jedes Teil an sein Gelenk, jede Haut an die Knochen der FEINEN Stufe (die Grobstufe trägt dieselben
// Knochen — fehlt einer, bricht der Bau laut wie in der Welt).
function stufeAnlegen(lod,ov,baum,cache){
  var g=BAKERS_BY_KIND.koerper(KC,'mensch',0,lod,ov),sk=g.userData.__skelett;
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
function gestaltFort(){if(!gestalt)return;scene.remove(gestalt.root);gestalt.root.traverse(function(o){if(o.isMesh){o.geometry.dispose();o.material.dispose();}});gestalt=null;}
// DER STUFEN-SCHALTER (die Welt-Regel `_gelenkStufe`): jenseits ab × (1 ± hyst) trägt L1 das Bild, diesseits L0 — und L1 wirft
// immer als Zwilling (r128: der Zwilling zeichnet nah ohne Farbe und Tiefe, sein Tiefen-Stoff wirft). Wählbar: auto · L0 · L1.
var _sp=new THREE.Vector3();
function stufeSchalten(){if(!gestalt)return;var fern;
  if(stufeWahl==='auto'){(headGroup||character).getWorldPosition(_sp);var d=camera.position.distanceTo(_sp),h=gestalt.hyst;fern=!(d<gestalt.ab*(gestalt.istFern?1-h:1+h));}
  else fern=stufeWahl==='1';
  if(fern===gestalt.istFern)return;gestalt.istFern=fern;
  gestalt.l0.forEach(function(m){m.visible=!fern;});gestalt.m1.forEach(function(mt){mt.colorWrite=fern;mt.depthWrite=fern;});
  var el=document.getElementById('stufeIst');if(el)el.textContent='zeigt L'+(fern?1:0);}
function laborStufe(){return gestalt?(gestalt.istFern?1:0):null;}
// DER TORSO-HALBMESSER der Arm-Kapsel (_poseGuard) misst die gezeigte Haut: in der Taille (zwischen Hüft- und Kopf-Gelenk) der
// Median-Abstand der Haut-Ecken von der Leib-Achse — die Masse des Leibs schiebt kauernde Arme weiter hinaus.
function torsoHalbmesser(s0){var t=s0.baum.teile,inv=new THREE.Matrix4().copy(character.matrixWorld).invert(),v=new THREE.Vector3();
  var yH=0;['hip1','hip-1'].forEach(function(n){t[n].getWorldPosition(v);v.applyMatrix4(inv);yH+=v.y/2;});t.head.getWorldPosition(v);v.applyMatrix4(inv);var yW=yH+(v.y-yH)*0.35;
  var haut=s0.liste.find(function(n){return n.isSkinnedMesh&&n.userData.__klasse==='haut'&&n.parent===character;});if(!haut)return 0.38;
  var pa=haut.geometry.attributes.position,r=[],zc=0,i;for(i=0;i<pa.count;i++)if(Math.abs(pa.getY(i)-yW)<0.08){zc+=pa.getZ(i);r.push(i);}
  if(!r.length)return 0.38;zc/=r.length;var d=r.map(function(i){return Math.hypot(pa.getX(i),pa.getZ(i)-zc);}).sort(function(a,b){return a-b;});
  return d[d.length>>1]+0.08;}
// DER GUSS: beide Stufen aus EINEM Aufruf je Stufe, an EINEN Knochen-Baum (L0 nah, L1 fern und als Wurf) — die Regler, die Haar-
// und Kleid-Wahl und die Farben rufen ihn nach der Ruhe (die Welt bäckt je Dials+Farben, kein Live-Morph).
function gestaltNeu(){
  var lageAlt=character?{p:character.position.clone(),r:character.rotation.clone()}:null;
  gestaltFort();syncPickers();updateLabel();
  var ov=gussOv(),cache={};
  var s0=stufeAnlegen(STUFEN[0],ov,null,cache),s1=stufeAnlegen(STUFEN[1],ov,s0.baum,{}),t=s0.baum.teile;
  for(var k in parts)delete parts[k];Object.assign(parts,t);
  character=t[s0.sk.root];torsoG=t.torso;headGroup=t.head;irisL=t.irisL||null;irisR=t.irisR||null;lidTL=t.lidTL||null;lidTR=t.lidTR||null;
  ['arm1','arm-1'].forEach(function(n){if(t[n]){t[n].userData.baseRotZ=t[n].rotation.z;t[n].userData.baseRotX=t[n].rotation.x;}});
  if(lageAlt){character.position.copy(lageAlt.p);character.rotation.copy(lageAlt.r);}
  character.updateMatrixWorld(true);torsoR=torsoHalbmesser(s0);
  // der Wurf: L0 wirft nach `schatten` der Zeile (1 = die Grobstufe ist ihr Zwilling), L1 mit ihrem Teil `wurf.seh`
  var z1=BZ[STUFEN[1]],seh=z1.wurf&&Array.isArray(z1.wurf.seh)?z1.wurf.seh:null;
  s0.liste.forEach(function(n){n.castShadow=BZ[STUFEN[0]].schatten===STUFEN[0];});
  s1.liste.forEach(function(n){n.castShadow=z1.schatten===STUFEN[1]&&(!seh||seh.indexOf(n.userData.__seh)>=0);});
  gestalt={root:s0.baum.root,l0:s0.liste,l1:s1.liste,m1:s1.liste.map(function(n){return n.material;}).filter(function(mt,i,a){return a.indexOf(mt)===i;}),ab:z1.ab,hyst:BZ.hyst,istFern:null};
  if(kosten){kosten.messen({traverse:function(f){s0.liste.forEach(f);}},STUFEN[0]);kosten.messen({traverse:function(f){s1.liste.forEach(f);}},STUFEN[1]);
    /* die Fern-Stufen zeigt das Labor nicht — die Leiste misst sie am Welt-Guss derselben Dials (eine Wegwerf-Gestalt) */
    STUFEN.slice(2).forEach(function(s){var g=BAKERS_BY_KIND.koerper(KC,'mensch',0,s,ov);g.traverse(function(n){if(n.isMesh)n.castShadow=BZ[s].schatten===s;});kosten.messen(g,s,true);});}
  scene.add(gestalt.root);stufeSchalten();
}
function updateLabel(){const lbl=document.getElementById('presetLabel');const age=Math.round(18+params.age*62);let body='athletisch',gen='Mann';if(params.mass>0.6)body='übergewichtig';else if(params.mass<0.2)body='mager';else if(params.tone>0.7)body='muskulös';else if(params.tone<0.3)body='schlank';if(params.gender<0.3)gen='Frau';else if(params.gender<0.6)gen='androgyn';lbl.textContent=`${body} ${gen} · ${age}`;}
var gC=document.createElement('canvas');gC.width=gC.height=512;var gx=gC.getContext('2d');var gg=gx.createRadialGradient(256,256,40,256,256,250);gg.addColorStop(0,'#1a1610');gg.addColorStop(0.4,'#0d0a07');gg.addColorStop(1,'#050302');gx.fillStyle=gg;gx.fillRect(0,0,512,512);var gTex=new THREE.CanvasTexture(gC);var groundMat=new THREE.MeshStandardMaterial({map:gTex,roughness:0.96,metalness:0});var groundMesh=new THREE.Mesh(new THREE.CircleGeometry(20,64),groundMat);groundMesh.rotation.x=-Math.PI/2;groundMesh.position.y=-0.002;groundMesh.receiveShadow=true;scene.add(groundMesh);
var csMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false});var contactShadow=new THREE.Mesh(new THREE.CircleGeometry(1,48),csMat);contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=0.001;scene.add(contactShadow);
scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.6));
const key=new THREE.DirectionalLight(0xffe0b0,3.0);key.position.set(5,8,5);key.castShadow=true;key.shadow.mapSize.width=2048;key.shadow.mapSize.height=2048;key.shadow.bias=-0.0001;key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;scene.add(key);
const rimL=new THREE.DirectionalLight(0x33aaff,2.0);rimL.position.set(-5,4,-5);scene.add(rimL);
const composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.3,0.4,0.9));const fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
const cine={uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float time;varying vec2 vUv;float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}float getLum(vec2 uv){return dot(texture2D(tDiffuse,uv).rgb,vec3(0.299,0.587,0.114));}void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float dist=length(dir);vec2 offset=dir*dist*0.0035;float r=texture2D(tDiffuse,uv+offset).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-offset).b;vec3 color=vec3(r,g,b);float lum=getLum(uv);float lL=getLum(uv-vec2(0.001,0.0)),lR=getLum(uv+vec2(0.001,0.0)),lU=getLum(uv-vec2(0.0,0.001)),lD=getLum(uv+vec2(0.0,0.001));float edge=abs(lL-lum)+abs(lR-lum)+abs(lU-lum)+abs(lD-lum);color*=(1.0+edge*0.55);color*=smoothstep(1.2,0.1,dist*1.3);color+=random(uv+time)*0.014-0.007;gl_FragColor=vec4(color,1.0);}`};const cinePass=new THREE.ShaderPass(cine);cinePass.renderToScreen=true;composer.addPass(cinePass);
const controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,trochanterY,0);controls.minDistance=3;controls.maxDistance=15;controls.autoRotateSpeed=0.8;controls.update();
/* DIE HÜLLE (K41): die Sitzung trägt jede Tat (Regler-Zug, Haar-/Kleid-Wahl, Farbe, Zufall, Reset) als EINEN Rückgängig-Schritt über params; der EINE Generator liest PARAMS_BY_KIND.koerper (je grp ein Abschnitt) und schreibt params in place — der Guss folgt nach der Ruhe. */
function fmtVal(k){if(k==='height')return params.height.toFixed(2);if(k==='age')return Math.round(18+params.age*62);return Math.round(params[k]*100)+'%';}
var _gussT=null;function gussBald(){clearTimeout(_gussT);_gussT=setTimeout(gestaltNeu,150);}
const sitz=AnazhHuelle.sitzung({werte:params,anwenden:()=>{syncUI();gestaltNeu();}});sitz.leiste(document.getElementById('sitzung'));
const KPARAMS=window.__koerperCore.PARAMS_BY_KIND.koerper;
const kosten=AnazhHuelle.kosten(document.getElementById('kosten'),{budget:BZ,stufen:STUFEN,renderer:renderer,quelle:'gemessen an der gezeigten Gestalt = dem Welt-Guss (foundry-core BAKERS_BY_KIND.koerper, dieselben Dials und Farben, Saat 0): L0 nah, L1 jenseits '+BZ[STUFEN[1]].ab+' (± '+Math.round(BZ.hyst*100)+' %) und als Wurf'});
const reglerKoerper=['KOERPER','POSE','HAAR'].map(g=>AnazhHuelle.regler(document.getElementById(g==='KOERPER'?'reglerKoerper':g==='POSE'?'reglerPose':'reglerHaar'),KPARAMS.filter(z=>z.grp===g),{werte:params,sitzung:sitz,gruppen:false,zuruecksetzen:false,ruheMs:150,format:z=>fmtVal(z.id),bei:()=>updateLabel(),nachRuhe:()=>gussBald()}));
function syncUI(){reglerKoerper.forEach(r=>r.sync());}
const HAARSTILE=[...document.querySelectorAll('#hairStyles button')].map(b=>b.dataset.h);
document.getElementById('btnReset').addEventListener('click',()=>sitz.schritt(()=>{Object.assign(params,window.__koerperCore.START_PARAMS);syncUI();gestaltNeu();}));/* der Zufall zieht aus dem Samen der Sitzung (derselbe Same = derselbe Mensch) */document.getElementById('btnRandom').addEventListener('click',()=>{sitz.seedSetzen((Date.now()^((Math.random()*4294967296)>>>0))>>>0,true);const R=AnazhHuelle.zufall(sitz.seed);sitz.schritt(()=>{params.height=0.9+R()*0.25;params.mass=R();params.tone=R();params.age=R()*0.8;params.gender=R();params.hairLen=0.3+R()*1.5;params.hairVol=0.6+R()*1.2;params.arms=R()*0.3;params.hairStyle=HAARSTILE[Math.floor(R()*HAARSTILE.length)];params.hairColor=randKey(HAIR_COLORS,R);params.top=randPick(['tshirt','pullover','tank','poncho','tshirt','pullover'],R);params.topColor=randKey(CLOTH_COLORS,R);params.bottom=randPick(['pants','shorts','pants'],R);params.bottomColor=randKey(CLOTH_COLORS,R);params.shoes=randPick(['sneaker','boot','sneaker'],R);params.shoeColor=randKey(CLOTH_COLORS,R);params.skinTone=randKey(SKIN_TONES,R);syncUI();gestaltNeu();});});document.querySelectorAll('#emotions button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#emotions button').forEach(function(b2){b2.classList.remove('active');});b.classList.add('active');emoMode=b.dataset.e;emo.set(emoMode);});});
document.querySelectorAll('#stufen button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#stufen button').forEach(function(b2){b2.classList.toggle('active',b2===b);});stufeWahl=b.dataset.s;stufeSchalten();});});
function randPick(a,R){return a[Math.floor((R||Math.random)()*a.length)];}
function randKey(o,R){var k=Object.keys(o);return k[Math.floor((R||Math.random)()*k.length)];}
function buildSwatches(containerId,palette,getKey,onPick){var cont=document.getElementById(containerId);if(!cont)return;cont.innerHTML='';Object.keys(palette).forEach(function(key){var sw=document.createElement('div');sw.className='sw';sw.title=palette[key].name;var hex=(palette[key].base!=null)?palette[key].base:palette[key].hex;sw.style.background='#'+('000000'+hex.toString(16)).slice(-6);if(key===getKey())sw.classList.add('active');sw.addEventListener('click',function(){cont.querySelectorAll('.sw').forEach(function(x){x.classList.remove('active');});sw.classList.add('active');sitz.schritt(function(){onPick(key);});});cont.appendChild(sw);});}
function wirePicker(containerId,attr,onPick){var cont=document.getElementById(containerId);if(!cont)return;cont.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){cont.querySelectorAll('button').forEach(function(x){x.classList.remove('active');});b.classList.add('active');sitz.schritt(function(){onPick(b.dataset[attr]);});});});}
// jede Wahl ist eine Dial-Zeile des Gusses: Haut- und Haar-Ton, Frisur und Kleid backen neu (die Welt bäckt je Dials+Farben)
function syncPickers(){[['hairStyles','h','hairStyle'],['topStyles','t','top'],['botStyles','b','bottom'],['shoeStyles','s','shoes']].forEach(function(c){var cont=document.getElementById(c[0]);if(cont)cont.querySelectorAll('button').forEach(function(b){b.classList.toggle('active',b.dataset[c[1]]===params[c[2]]);});});buildSwatches('skinTones',SKIN_TONES,function(){return params.skinTone;},function(k){params.skinTone=k;gestaltNeu();});buildSwatches('hairColors',HAIR_COLORS,function(){return params.hairColor;},function(k){params.hairColor=k;gestaltNeu();});buildSwatches('topColors',CLOTH_COLORS,function(){return params.topColor;},function(k){params.topColor=k;gestaltNeu();});buildSwatches('botColors',CLOTH_COLORS,function(){return params.bottomColor;},function(k){params.bottomColor=k;gestaltNeu();});buildSwatches('shoeColors',CLOTH_COLORS,function(){return params.shoeColor;},function(k){params.shoeColor=k;gestaltNeu();});}
wirePicker('hairStyles','h',function(v){params.hairStyle=v;gestaltNeu();});
wirePicker('topStyles','t',function(v){params.top=v;gestaltNeu();});
wirePicker('botStyles','b',function(v){params.bottom=v;gestaltNeu();});
wirePicker('shoeStyles','s',function(v){params.shoes=v;gestaltNeu();});
gestaltNeu();syncUI();emo.set('idle');

// PROZEDURALE MIKRO-NOISE: zwei oszillatoren im goldenen-schnitt-verhaeltnis (x1.618) -> quasi-
// periodisch, wiederholt sich NIE. jeder kanal bekommt einen eigenen seed -> kopf/arme/huefte
// sind dekorreliert statt phasenstarr (der alte sinus-brei war nach ~20s als loop erkennbar,
// und beide arme teilten sich sin(t*0.8) in IDENTISCHER phase).
function _pn(t,f,s){return Math.sin(t*f+s*12.9898)*0.62+Math.sin(t*f*1.618+s*78.233)*0.38;}
// BLICK-SYSTEM: sakkaden-ziele pro emotion (angst: hektisch+weit / wut: starrer blick / trauer:
// gesenkt / freude: lebhaft / kampf: fokussiert). die augen springen SCHNELL zum ziel (14/s),
// der kopf bekommt dasselbe ziel klein aufaddiert und folgt TRAEGE ueber die PD-federn ->
// 'eyes lead, head follows'. jede ~2. sakkade loest ein blinzeln aus (menschlicher reflex).
var _gz={x:0,y:0,tx:0,ty:0,next:0,blinkKick:false},_blkNext=1.4,_blkPh=99;
function _gazeUpdate(dt,t,mode){
  if(t>_gz.next){var cad,ax,ay,by=0;
    if(mode==='fear'){cad=0.5+Math.random()*0.7;ax=1.0;ay=0.55;}
    else if(mode==='angry'){cad=2.6+Math.random()*2.4;ax=0.15;ay=0.10;}
    else if(mode==='sad'){cad=2.0+Math.random()*2.0;ax=0.40;ay=0.35;by=-0.55;}
    else if(mode==='joy'){cad=0.9+Math.random()*1.0;ax=0.90;ay=0.55;by=0.15;}
    else if(mode==='fight'){cad=0.8+Math.random()*0.8;ax=0.50;ay=0.20;}
    else{cad=1.4+Math.random()*2.2;ax=0.70;ay=0.40;}
    _gz.next=t+cad;_gz.tx=(Math.random()*2-1)*ax;_gz.ty=(Math.random()*2-1)*ay+by;
    _gz.blinkKick=Math.random()<0.55;}
  var k=1-Math.exp(-14*dt);_gz.x+=(_gz.tx-_gz.x)*k;_gz.y+=(_gz.ty-_gz.y)*k;}
const clock=new THREE.Clock(); var blinkTimer=0;
// DER TAKT DES LABORS: Emotion, Verhalten und PD-Federn treiben die GELENKE des Gusses (dieselben Namen liest der Stamm-Rig:
// mensch · torso · head · arm/elbow/hand · hip/knee/ankle · Lider · Iris) — was die Welt nicht als Gelenk trägt (Atem-Skalen
// der Brust, Muskel-Spannung, Finger-Faust, Brauen, Lippen), bewegt auch das Labor nicht mehr.
function animate(){requestAnimationFrame(animate);var dt=1/60,t=clock.getElapsedTime();uZeit.value=t;cinePass.uniforms.time.value=t;controls.autoRotate=(emoMode==='showcase');if(!character){composer.render();return;}if(play.on)playInput(dt);emo.update(dt,t);var bm=emo.getBeh(t);var e=emo.cur;
var targetY=bm.jumpY||0;var dy=targetY-bodyPhys.y;bodyPhys.vy+=dy*300*dt;bodyPhys.vy-=25*dt;bodyPhys.vy*=0.88;bodyPhys.y+=bodyPhys.vy*dt;if(bodyPhys.y<0){bodyPhys.y=0;if(bodyPhys.vy<0)bodyPhys.vy*=-0.15;}
// V18.491.141 KPMUL_VIS.lab=pd-gain
for(var k in phys){phys[k].kp=physBase[k].kp*e.kpMul;phys[k].kd=physBase[k].kd*e.kpMul;}
var microSway=(_pn(t,0.5,21)+_pn(t,0.27,25)*0.5)*e.sway;var breathWave=Math.sin(t*e.freq)*e.breath*bm.breathBoost;_gazeUpdate(dt,t,emoMode);
phys.bodyZ.target=e.bodyZ+bm.bodyZ+microSway;phys.bodyX.target=e.bodyX+bm.bodyX+_pn(t,0.7,7)*0.004;
phys.spineY.target=e.spineY+bm.spineY+_pn(t,0.25,5)*0.015;phys.spineX.target=e.spineX+bm.spineX+_pn(t,0.6,6)*0.008;phys.spineZ.target=e.spineZ+bm.spineZ+microSway*0.5;
phys.headY.target=e.headY+bm.headY+_pn(t,0.3,1)*0.04+_pn(t,0.17,2)*0.02+_gz.x*0.22;phys.headX.target=e.headX+bm.headX+_pn(t,0.5,3)*0.015+params.age*0.08+_gz.y*0.12;phys.headZ.target=e.headZ+bm.headZ+_pn(t,0.4,4)*0.008;
phys.breath.target=breathWave+Math.sin(t*e.freq*2.1)*e.breath*0.3*bm.breathBoost;phys.chestY.target=_pn(t,0.3,16)*0.012;
phys.armRZ.target=e.armR+bm.armR+_pn(t,0.8,8)*0.025+Math.sin(t*e.freq)*0.015*bm.breathBoost;phys.armLZ.target=e.armL+bm.armL+_pn(t,0.8,9)*0.025-Math.sin(t*e.freq)*0.015*bm.breathBoost;
phys.armRX.target=e.armRX+bm.armRX+_pn(t,0.5,10)*0.018;phys.armLX.target=e.armLX+bm.armLX+_pn(t,0.5,11)*0.018;
phys.elbowR.target=e.elbowR+bm.elbowR+_pn(t,1.2,12)*0.015;phys.elbowL.target=e.elbowL+bm.elbowL+_pn(t,1.2,13)*0.015;
phys.hipRX.target=e.hipRX+bm.hipRX+_pn(t,0.6,14)*0.008;phys.hipLX.target=e.hipLX+bm.hipLX+_pn(t,0.6,15)*0.008;
phys.hipRZ.target=e.hipRZ+bm.hipRZ;phys.hipLZ.target=e.hipLZ+bm.hipLZ;
phys.kneeR.target=e.kneeR+bm.kneeR;phys.kneeL.target=e.kneeL+bm.kneeL;
var comHeight=trochanterY*0.7;var comOffX=Math.sin(phys.bodyX.current)*comHeight;var comOffZ=Math.sin(phys.bodyZ.current)*comHeight;var balStrength=(emoMode==='run')?0.2:1.0;
phys.ankleR.target=Math.max(-0.2,Math.min(0.5,bm.ankleR+comOffX*0.03*balStrength));phys.ankleL.target=Math.max(-0.2,Math.min(0.5,bm.ankleL+comOffX*0.03*balStrength));
phys.kneeR.target+=Math.max(0,comOffZ)*0.05*balStrength;phys.kneeL.target+=Math.max(0,-comOffZ)*0.05*balStrength;
phys.hipRZ.target+=comOffZ*0.02*balStrength;phys.hipLZ.target-=comOffZ*0.02*balStrength;phys.kneeR.target+=Math.max(0,comOffX)*0.03*balStrength;phys.kneeL.target+=Math.max(0,comOffX)*0.03*balStrength;
for(var k2 in phys)phys[k2].update(dt);
// DYNAMIC BODY HEIGHT — from TARGETS (instant, no PD lag) + CLAMP to preset minimum
var tHR=e.hipRX+bm.hipRX,tKR=e.kneeR+bm.kneeR,tHL=e.hipLX+bm.hipLX,tKL=e.kneeL+bm.kneeL;
var aYR=ankleYFromAngles(tHR,tKR),aYL=ankleYFromAngles(tHL,tKL);
var gY=footBelowAnkle-trochanterY-Math.min(aYR,aYL);
var pGY=footBelowAnkle-trochanterY-Math.min(ankleYFromAngles(e.hipRX,e.kneeR),ankleYFromAngles(e.hipLX,e.kneeL));
gY=Math.max(gY,pGY-0.5); // clamp: can rise above preset (jump/flight) but not sink more than 0.5 below
groundSmooth+=(gY-groundSmooth)*(1-Math.exp(-40*dt));
character.position.y=bodyPhys.y+groundSmooth;
character.rotation.x=phys.bodyX.current;character.rotation.z=phys.bodyZ.current;
torsoG.rotation.y=phys.spineY.current;torsoG.rotation.x=phys.spineX.current;torsoG.rotation.z=phys.spineZ.current;
headGroup.rotation.y=phys.headY.current;headGroup.rotation.x=phys.headX.current;headGroup.rotation.z=phys.headZ.current;
if(parts['arm1']){parts['arm1'].rotation.z=parts['arm1'].userData.baseRotZ+phys.armRZ.current;parts['arm1'].rotation.x=parts['arm1'].userData.baseRotX+phys.armRX.current;}
if(parts['arm-1']){parts['arm-1'].rotation.z=parts['arm-1'].userData.baseRotZ-phys.armLZ.current;parts['arm-1'].rotation.x=parts['arm-1'].userData.baseRotX+phys.armLX.current;}
if(parts['elbow1'])parts['elbow1'].rotation.x=-phys.elbowR.current;
if(parts['elbow-1'])parts['elbow-1'].rotation.x=-phys.elbowL.current;
if(parts['hip1']){parts['hip1'].rotation.x=phys.hipRX.current;parts['hip1'].rotation.z=phys.hipRZ.current;}
if(parts['hip-1']){parts['hip-1'].rotation.x=phys.hipLX.current;parts['hip-1'].rotation.z=phys.hipLZ.current;}
if(parts['knee1'])parts['knee1'].rotation.x=phys.kneeR.current;
if(parts['knee-1'])parts['knee-1'].rotation.x=phys.kneeL.current;
if(parts['ankle1'])parts['ankle1'].rotation.x=phys.ankleR.current;
if(parts['ankle-1'])parts['ankle-1'].rotation.x=phys.ankleL.current;
// V18.491.131 AUGEN_VIS.lab=gaze-iris
blinkTimer+=dt;var rate=Math.max(0.1,e.blinkRate);
if(blinkTimer>=_blkNext){blinkTimer=0;_blkNext=(0.55+Math.random()*0.95)/rate;_blkPh=0;}   // randomisierte intervalle: kein metronom-blinzeln mehr
if(_gz.blinkKick){_gz.blinkKick=false;if(_blkPh>0.1)_blkPh=0;}                             // sakkade loest blinzeln aus (menschlicher reflex)
var blink=1.0;
if(_blkPh<0.09){_blkPh+=dt;var _bf=Math.min(1,_blkPh/0.09);blink=_bf<0.45?1.0-(_bf/0.45)*0.7:0.3+((_bf-0.45)/0.55)*0.7;}
if(lidTL)lidTL.scale.y=0.35*blink;if(lidTR)lidTR.scale.y=0.35*blink;
var irisX=_gz.x*0.016+_pn(t,2.0+e.irisSpeed*2.0,22)*0.003;var irisY=_gz.y*0.010+_pn(t,1.6+e.irisSpeed*1.6,23)*0.002;if(irisL)irisL.position.set(irisX,irisY,0.08);if(irisR)irisR.position.set(irisX,irisY,0.08);
if(contactShadow){var bh=bodyPhys.y+groundSmooth;contactShadow.material.opacity=0.35*Math.max(0.1,1-bh*2);contactShadow.scale.setScalar(3.0*Math.max(0.3,1+bh*0.5));}
fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);if(play.on)playPhysics(dt);else controls.update();_poseGuard();stufeSchalten();composer.render();}

// ===================== PLAYABLE CHARACTER + NINJA-WARRIOR PARK =====================
var FOOT=0.0;                                    // origin -> sole offset
var parkBoxes=[],parkGroup=new THREE.Group();parkGroup.visible=false;scene.add(parkGroup);
function pbox(cx,cy,cz,sx,sy,sz,col,wall){
  var mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color:col,roughness:0.92,metalness:0.0}));
  mesh.position.set(cx,cy,cz);mesh.castShadow=true;mesh.receiveShadow=true;parkGroup.add(mesh);
  parkBoxes.push({cx:cx,cy:cy,cz:cz,sx:sx,sy:sy,sz:sz,maxY:cy+sy/2,minY:cy-sy/2,wall:!!wall});return mesh;}
function buildPark(){
  pbox(0,-0.5,20,80,1,96,0x363b47);                                    // floor (top y=0)
  pbox(0,0.4,7,4.2,0.8,4.2,0x6f7d92); pbox(0,1.1,12.5,3.6,1.4,3.6,0x6f7d92);   // hop platforms
  pbox(0,1.9,18,3.2,2.0,3.2,0x6f7d92); pbox(0,1.1,23.5,3.6,1.4,3.6,0x6f7d92);
  pbox(0,0.5,29,5.5,1,4,0x7a86a0); pbox(0,1.3,32,5.5,1.6,3,0x7a86a0); pbox(0,2.1,34.5,5.5,2.4,3,0x7a86a0); // stairs
  pbox(0,3.0,39,7,1,6,0x8a7d6b);                                       // high pad
  pbox(0,5.2,43.6,7,3.4,1.1,0x596273,true);                            // CLIMB WALL
  pbox(0,4.7,47.5,7,1,5,0x8a7d6b);                                     // ledge beyond wall
  pbox(7.5,4.7,47.5,3.6,1,3.6,0x6b8f7d); pbox(12.5,5.7,49.5,3.2,1,3.2,0x6b8f7d); pbox(16.5,6.7,46.5,3.2,1,3.2,0x6b8f7d); // floating islands
  pbox(-9,1.0,18,1.1,1,22,0x9a6b6b); pbox(-9,0.4,5,5,0.8,5,0x6f7d92);  // balance beam + pad
  pbox(2.65,1.8,26.3,0.8,3.6,2.8,0x596273);pbox(-2.65,1.8,26.3,0.8,3.6,2.8,0x596273);pbox(0,4.15,26.3,6.1,1.1,2.8,0x596273); // CROUCH-TUNNEL (durchgang 3.6 hoch)
  pbox(0,0.06,0.5,3.2,0.12,3.2,0x4f86c6);                              // startpad (blau)
  pbox(0,3.56,39,2.4,0.12,2.4,0x37b98c); pbox(0,5.26,47.5,2.4,0.12,2.4,0x37b98c); // CHECKPOINTS (gruen)
  pbox(16.5,7.26,46.5,2.8,0.12,2.8,0xd9a441);                          // FINISH (gold)
}
buildPark();
var play={on:false,cam:'third',yaw:0,pitch:0.22,posY:0.05,vy:0,vx:0,vz:0,onGround:true,sprint:false,slide:0,touchWall:false,anim:'idle',faceYaw:0,gaitPhase:0,gaitAmt:0,prevSp:0,prevFace:0,camX:0,camY:5,camZ:-9,lookX:0,lookY:3,lookZ:0,coyote:0,jbuf:0,airJumps:1,djT:0,wjT:0,wallNX:0,wallNZ:1,wallT:0,landK:0,crouch:false,crB:0,fOffL:0,fOffR:0,fov:35,fovBase:35,run:'ready',t:0,best:0,cp:0,deaths:0,cpX:0,cpY:0.05,cpZ:0,cpFlash:0,smY:0.05,smV:0,susp:0};
// V18.491.179 — NINJA_FEEL ← __koerperCore.NINJA_FEEL fail-soft (byte-alt local if core cold).
// NINJA_VIS.lab=arcade-ninja / host=parkour-real — Do NOT Fake-merge arcade into Host parkour.
// Lab-Didaktik (Arcade Ninja Park). Kern-Parkour bleibt realitätsgeeicht (jumpPower~2.6, wandAbstoss 3, kletterV 0.6 …).
var _NF0={sprungVy:15.5,wandVy:14.5,wandKick:11,doppelVy:13.8,kletterVy:8.5,sprintSpd:18,walkSpd:10.5,crouchSpd:4.6,ctrlWalk:6.0};
var _NFc=(window.__koerperCore&&window.__koerperCore.NINJA_FEEL)||null;
var NINJA_FEEL={sprungVy:(_NFc&&Number.isFinite(_NFc.sprungVy))?_NFc.sprungVy:_NF0.sprungVy,wandVy:(_NFc&&Number.isFinite(_NFc.wandVy))?_NFc.wandVy:_NF0.wandVy,wandKick:(_NFc&&Number.isFinite(_NFc.wandKick))?_NFc.wandKick:_NF0.wandKick,doppelVy:(_NFc&&Number.isFinite(_NFc.doppelVy))?_NFc.doppelVy:_NF0.doppelVy,kletterVy:(_NFc&&Number.isFinite(_NFc.kletterVy))?_NFc.kletterVy:_NF0.kletterVy,sprintSpd:(_NFc&&Number.isFinite(_NFc.sprintSpd))?_NFc.sprintSpd:_NF0.sprintSpd,walkSpd:(_NFc&&Number.isFinite(_NFc.walkSpd))?_NFc.walkSpd:_NF0.walkSpd,crouchSpd:(_NFc&&Number.isFinite(_NFc.crouchSpd))?_NFc.crouchSpd:_NF0.crouchSpd,ctrlWalk:(_NFc&&Number.isFinite(_NFc.ctrlWalk))?_NFc.ctrlWalk:_NF0.ctrlWalk};
var _bew=(window.__koerperCore&&window.__koerperCore.bewegung)||null;
var _KAM=window.__koerperCore.bewegung.kamera;   // K06 — DER LEIB DER KAMERA: armRadiusM (die Kugel) + armRuhe (die Glaettung) aus fx.bewegung.kamera, fail-closed (kein Lab-Literal)
// die Strecke p + d*t (t 0..1) gegen die Park-Box b, um r aufgeblasen: der Eintritt t, Infinity ohne Schnitt (Slab)
function _kamSeg(px,py,pz,dx,dy,dz,b,r){var P=[px,py,pz],D=[dx,dy,dz],lo=[b.cx-b.sx/2-r,b.minY-r,b.cz-b.sz/2-r],hi=[b.cx+b.sx/2+r,b.maxY+r,b.cz+b.sz/2+r],t0=0,t1=1;for(var a=0;a<3;a++){if(Math.abs(D[a])<1e-9){if(P[a]<lo[a]||P[a]>hi[a])return Infinity;continue;}var u=(lo[a]-P[a])/D[a],v=(hi[a]-P[a])/D[a];if(u>v){var q=u;u=v;v=q;}if(u>t0)t0=u;if(v<t1)t1=v;if(t0>t1)return Infinity;}return t0;}
// der Punkt steht frei: in keiner Park-Box, um r aufgeblasen
function _kamFrei(x,y,z,r){for(var i=0;i<parkBoxes.length;i++){var b=parkBoxes[i];if(x>b.cx-b.sx/2-r&&x<b.cx+b.sx/2+r&&y>b.minY-r&&y<b.maxY+r&&z>b.cz-b.sz/2-r&&z<b.cz+b.sz/2+r)return false;}return true;}
var _coy=(_bew&&_bew.sprung&&Number.isFinite(_bew.sprung.coyoteSec))?_bew.sprung.coyoteSec:0.3;  // V18.491.164 — coyote cold was buffer twin; now matches fx.bewegung.sprung.coyoteSec
var _jbuf0=(_bew&&_bew.sprung&&Number.isFinite(_bew.sprung.bufferSec))?_bew.sprung.bufferSec:0.12;
var keys={};
function setAnim(n){if(play.anim!==n){play.anim=n;emoMode=n;emo.set(n);}}
addEventListener('keydown',function(ev){if(!play.on)return;keys[ev.code]=true;
  if(ev.code==='KeyC')play.cam=(play.cam==='third')?'fps':'third';
  if(ev.code==='Escape')exitPlay();
  if(ev.code==='Space'&&!ev.repeat)play.jbuf=_jbuf0;                                  // JUMP BUFFER — Kern fx.bewegung.sprung.bufferSec (fail-soft 0.12)
  if(ev.code==='KeyR'&&play.on)resetRun();
  if(ev.code==='ControlLeft'&&play.onGround&&play.slide<=0){var sp=Math.hypot(play.vx,play.vz);if(sp>7.0){play.vx=play.vx/sp*21;play.vz=play.vz/sp*21;play.slide=0.68;play.crouch=false;}}
  if(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ControlLeft'].indexOf(ev.code)>=0)ev.preventDefault();});
addEventListener('keyup',function(ev){keys[ev.code]=false;if(ev.code==='Space'&&play.on&&play.vy>7.5)play.vy=7.5+(play.vy-7.5)*0.42;});  // VARIABLE SPRUNGHOEHE: frueh loslassen = kuerzer
document.addEventListener('mousemove',function(ev){if(!play.on||document.pointerLockElement!==renderer.domElement)return;
  play.yaw-=ev.movementX*0.0024;play.pitch=Math.max(-0.85,Math.min(0.85,play.pitch-ev.movementY*0.0022));});
function enterPlay(){play.on=true;controls.enabled=false;parkGroup.visible=true;emoMode='play';
  character.position.set(0,0.05,0);character.rotation.set(0,0,0);play.posY=0.05;play.vy=0;play.vx=0;play.vz=0;play.yaw=0;play.faceYaw=0;play.onGround=true;
  document.getElementById('ui').style.display='none';document.getElementById('playHint').style.display='block';document.getElementById('hud').style.display='block';
  play.fovBase=camera.fov;play.fov=camera.fov;resetRun();play.airJumps=1;play.landK=0;play.crB=0;play.crouch=false;play.jbuf=0;
  setAnim('idle');renderer.domElement.requestPointerLock();}
function exitPlay(){play.on=false;controls.enabled=true;parkGroup.visible=false;
  if(headGroup)headGroup.visible=true;if(typeof hairGroup!=='undefined'&&hairGroup)hairGroup.visible=true;
  character.position.set(0,0,0);character.rotation.set(0,0,0);
  document.getElementById('ui').style.display='';document.getElementById('playHint').style.display='none';document.getElementById('hud').style.display='none';camera.fov=play.fovBase;camera.updateProjectionMatrix();
  if(document.pointerLockElement)document.exitPointerLock();emoMode='idle';emo.set('idle');controls.target.set(0,trochanterY,0);controls.update();}
renderer.domElement.addEventListener('click',function(){if(play.on&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock();});
document.getElementById('btnPlay').addEventListener('click',enterPlay);
function inXZ(x,z,b,r){return x>b.cx-b.sx/2-r&&x<b.cx+b.sx/2+r&&z>b.cz-b.sz/2-r&&z<b.cz+b.sz/2+r;}
function footSupOff(x,z,ref){var s=-1e9;for(var i=0;i<parkBoxes.length;i++){var b=parkBoxes[i];if(inXZ(x,z,b,0.10)&&b.maxY<=ref+1.15&&b.maxY>s)s=b.maxY;}
  return s<-1e8?-0.55:_clamp(s-ref,-0.85,0.85);}                                       // fuss ueber leere -> baumelt; sonst delta zum center-support
var CPS=[{x:0,y:3.62,z:39,r:2.6},{x:0,y:5.32,z:47.5,r:2.6}],FIN={x:16.5,y:7.32,z:46.5,r:2.2};
function resetRun(){play.run='ready';play.t=0;play.cp=0;play.deaths=0;play.cpX=0;play.cpY=0.05;play.cpZ=0;play.posY=0.05;play.vx=0;play.vy=0;play.vz=0;play.landK=0;play.fOffL=0;play.fOffR=0;play.smY=0.05;play.smV=0;play.susp=0;character.position.set(0,0.05,0);play.faceYaw=play.yaw;}
function runUpdate(dt){if(play.run==='running')play.t+=dt;
  if(play.run==='ready'&&character.position.z>2.5){play.run='running';play.t=0;}
  if(play.onGround&&play.run==='running'){var fy=play.posY-FOOT;
    if(play.cp<CPS.length){var c=CPS[play.cp];if(Math.hypot(character.position.x-c.x,character.position.z-c.z)<c.r&&Math.abs(fy-c.y)<1.2){play.cpX=c.x;play.cpY=c.y+FOOT+0.05;play.cpZ=c.z;play.cp++;play.cpFlash=1.2;}}
    if(Math.hypot(character.position.x-FIN.x,character.position.z-FIN.z)<FIN.r&&Math.abs(fy-FIN.y)<1.2){play.run='done';if(!play.best||play.t<play.best)play.best=play.t;}}
  play.cpFlash=Math.max(0,play.cpFlash-dt);
  var h=document.getElementById('hud');if(h&&play.on){var s=play.run==='done'?('ZIEL! '+play.t.toFixed(2)+'s'+(play.best?'  \u00b7  best '+play.best.toFixed(2)+'s':'')+'  \u00b7  R = neuer run'):((play.run==='running'?play.t.toFixed(2)+'s':'bereit')+'  \u00b7  cp '+play.cp+'/'+CPS.length+(play.deaths?'  \u00b7  \u2620 '+play.deaths:'')+(play.best?'  \u00b7  best '+play.best.toFixed(2)+'s':''));
    if(h.textContent!==s)h.textContent=s;h.style.background=play.cpFlash>0?'rgba(40,160,110,0.88)':(play.run==='done'?'rgba(190,150,30,0.88)':'rgba(10,12,18,0.82)');}}
function playInput(dt){
  play.coyote=play.onGround?_coy:Math.max(0,play.coyote-dt);                            // COYOTE — Kern fx.bewegung.sprung.coyoteSec (fail-soft 0.3)
  play.jbuf=Math.max(0,play.jbuf-dt);play.wallT=Math.max(0,play.wallT-dt);
  if(play.slide>0){ play.slide-=dt; var sk=Math.pow(0.43,dt); play.vx*=sk; play.vz*=sk; if(play.slide<=0){play.vx*=0.72;play.vz*=0.72;} return; }
  var fx=Math.sin(play.yaw),fz=Math.cos(play.yaw),rx=-Math.cos(play.yaw),rz=Math.sin(play.yaw);   // right = cross(forward,up): A/D korrekt
  var mf=(keys['KeyW']?1:0)-(keys['KeyS']?1:0),ms=(keys['KeyD']?1:0)-(keys['KeyA']?1:0);
  play.sprint=!!keys['ShiftLeft']; var moving=(mf||ms),sp0=Math.hypot(play.vx,play.vz);
  play.crouch=!!keys['ControlLeft']&&play.onGround&&play.slide<=0&&sp0<=7.0;          // HOLD-CROUCH (Apex: slide chained in crouch)
  // Ninja arcade speeds (NINJA_FEEL 15.5/18/…) bleiben Lab-Didaktik; Kern-Parkour realitätsgeeicht — Feel-Entscheid = eigene Welle.
  var spd=play.crouch?NINJA_FEEL.crouchSpd:(keys['ControlLeft']?NINJA_FEEL.ctrlWalk:(play.sprint?NINJA_FEEL.sprintSpd:NINJA_FEEL.walkSpd));
  var tx=fx*mf+rx*ms,tz=fz*mf+rz*ms,L=Math.hypot(tx,tz);if(L>0){tx/=L;tz/=L;}
  var ka=play.onGround?((L>0)?(1-Math.pow(0.002,dt)):(1-Math.pow(0.00008,dt))):(1-Math.pow(0.18,dt));  // MOMENTUM zwei-raten: sanft ran (flow), knackig stoppen, luft traege
  play.vx+=(tx*spd-play.vx)*ka; play.vz+=(tz*spd-play.vz)*ka;
  if(moving)play.faceYaw=Math.atan2(play.vx,play.vz);
  if(play.jbuf>0){
    if(play.coyote>0){play.vy=NINJA_FEEL.sprungVy;play.onGround=false;play.coyote=0;play.jbuf=0;play.crouch=false;} // gepufferter bodensprung (Lab-Didaktik)
    else if(play.wallT>0&&mf<=0){play.vy=NINJA_FEEL.wandVy;play.vx=play.wallNX*NINJA_FEEL.wandKick+play.vx*0.25;play.vz=play.wallNZ*NINJA_FEEL.wandKick+play.vz*0.25; // WANDSPRUNG
      play.faceYaw=Math.atan2(play.vx,play.vz);play.wjT=0.34;play.jbuf=0;play.wallT=0;}
    else if(play.airJumps>0){play.airJumps--;play.vy=Math.max(play.vy+2.5,NINJA_FEEL.doppelVy);play.djT=0.42;play.jbuf=0;} // DOPPELSPRUNG (tuck)
  }
  if(play.touchWall&&keys['Space']&&mf>0&&!play.onGround)play.vy=Math.max(play.vy,NINJA_FEEL.kletterVy);
}
// ---- PROCEDURAL BIOMECHANICAL LOCOMOTION: gait emerges from speed; IK feet; accel-lean; turn-bank ----
function _clamp(x,a,b){return x<a?a:(x>b?b:x);}
function _mix(a,b,t){return a+(b-a)*t;}
function _setArm(sd,rx,rz,elb){var a=parts['arm'+sd],e=parts['elbow'+sd];if(a){a.rotation.x=a.userData.baseRotX+rx;a.rotation.z=a.userData.baseRotZ+(sd==='1'?rz:-rz);}if(e)e.rotation.x=-elb;}
// GELENK-LIMITS (profi-rigging: "careful rigging"/joint limits): laeuft NACH jeder posen-quelle
// (emotion, kampf-combo, ninja-modus) und erzwingt anatomische envelopes -> der arm kann nicht
// mehr durch den eigenen torso, das knie nicht in den gegenschenkel. selbstkollision wird an der
// QUELLE verhindert statt hinterher kaschiert.
// GELENK-LIMITS v2: harte anatomische anschlaege + KAPSEL-PUSHOUT statt pauschal-abduktion.
// v1 erzwang mindest-abduktion bei gebeugtem ellbogen -- das brach hook-punch (schwingt ueber die
// mitte!) und die angst-emotion (arme kauern nach innen). menschen koennen gebeugte arme VOR den
// koerper fuehren, nur nicht IN ihn. also: torso-kapsel (hueft-mitte->kopf-gelenk, folgt der lehne, radius
// skaliert mit der taille) -- nur bei echter penetration wird der arm minimal herausrotiert.
var _pgV1,_pgV2,_pgV3,_pgM;                               // lazy-init im guard: immun gegen aufruf-reihenfolge
function _segPointDist(px,py,pz,ax,ay,az,bx,by,bz){var abx=bx-ax,aby=by-ay,abz=bz-az;
  var t=((px-ax)*abx+(py-ay)*aby+(pz-az)*abz)/((abx*abx+aby*aby+abz*abz)||1);t=t<0?0:(t>1?1:t);
  return Math.hypot(px-(ax+abx*t),py-(ay+aby*t),pz-(az+abz*t));}
function _poseGuard(){
  if(!_pgM){_pgM=new THREE.Matrix4();_pgV1=new THREE.Vector3();_pgV2=new THREE.Vector3();_pgV3=new THREE.Vector3();}
  ['1','-1'].forEach(function(sd){var s=(sd==='1')?1:-1;
    var a=parts['arm'+sd],e=parts['elbow'+sd],h=parts['hip'+sd],k=parts['knee'+sd];
    if(e){if(e.rotation.x<-2.5)e.rotation.x=-2.5;if(e.rotation.x>0.06)e.rotation.x=0.06;}    // beuge-anschlag + KEINE hyperextension
    if(a){if(s*a.rotation.z>2.95)a.rotation.z=s*2.95;                                        // ueberkopf-anschlag
      if(s*a.rotation.z<-0.9)a.rotation.z=s*-0.9;                                            // adduktion max ~51 grad ueber mitte (hug/hook/kauern LEGAL, unmoegliches nicht)
      if(a.rotation.x<-2.9)a.rotation.x=-2.9;if(a.rotation.x>0.95)a.rotation.x=0.95;}
    if(k){if(k.rotation.x<-0.06)k.rotation.x=-0.06;if(k.rotation.x>2.4)k.rotation.x=2.4;}    // knie: keine hyperextension
    if(h&&k){var kf=Math.max(0,k.rotation.x);
      var minSpread=0.02+0.06*Math.min(1,kf/1.2);
      if(s*h.rotation.z<minSpread)h.rotation.z=s*minSpread;
      if(h.rotation.x<-1.9)h.rotation.x=-1.9;if(h.rotation.x>0.6)h.rotation.x=0.6;}});
  // die Kapsel steht an den Gelenken des Gusses: von der Hüft-Mitte (hip1 · hip-1) zum Kopf-Gelenk (der Hals), ihr Halbmesser misst
  // die gezeigte Haut (torsoHalbmesser beim Guss — die fette Figur schiebt kauernde Arme weiter hinaus)
  if(!character||!parts.hip1||!parts['hip-1']||!parts.head)return;
  character.updateMatrixWorld(true);
  _pgM.copy(character.matrixWorld).invert();
  parts.hip1.getWorldPosition(_pgV1);parts['hip-1'].getWorldPosition(_pgV3);_pgV1.add(_pgV3).multiplyScalar(0.5).applyMatrix4(_pgM);
  parts.head.getWorldPosition(_pgV2);_pgV2.applyMatrix4(_pgM);
  ['1','-1'].forEach(function(sd){var s=(sd==='1')?1:-1,a=parts['arm'+sd],eG=parts['elbow'+sd],hnd=parts['hand'+sd];
    if(!a||!eG||!hnd)return;
    for(var it=0;it<2;it++){                              // 2 fixpunkt-iterationen genuegen
      eG.getWorldPosition(_pgV3);_pgV3.applyMatrix4(_pgM);
      var d1=_segPointDist(_pgV3.x,_pgV3.y,_pgV3.z,_pgV1.x,_pgV1.y,_pgV1.z,_pgV2.x,_pgV2.y,_pgV2.z);
      hnd.getWorldPosition(_pgV3);_pgV3.applyMatrix4(_pgM);
      var d2=_segPointDist(_pgV3.x,_pgV3.y,_pgV3.z,_pgV1.x,_pgV1.y,_pgV1.z,_pgV2.x,_pgV2.y,_pgV2.z);
      var pen=torsoR-Math.min(d1,d2);
      if(pen<=0.005)break;
      a.rotation.z+=s*pen*0.9;                            // abduktion oeffnet den kuerzesten weg nach draussen
      a.updateMatrixWorld(true);}});}                     // nur den arm-teilbaum nachziehen (parent-matrizen sind frisch)
function playGait(dt,t){
  var sp=Math.hypot(play.vx,play.vz),P=parts;
  if(play.slide>0){                                   // POWER-SLIDE pose
    P['hip1'].rotation.set(-0.55,0,0.04);P['knee1'].rotation.x=0.35;P['ankle1'].rotation.x=0.18;
    P['hip-1'].rotation.set(0.15,0,-0.04);P['knee-1'].rotation.x=1.75;P['ankle-1'].rotation.x=0.1;
    parts.torso.rotation.set(0.34,0.12,0.06);character.rotation.x=0.20;character.rotation.z*=0.85;
    _setArm('1',0.55,0.22,0.85);_setArm('-1',-0.30,0.16,0.55);headGroup.rotation.set(-0.30,-0.06,0);
    character.position.y=play.posY+(footBelowAnkle-trochanterY-Math.min(ankleYFromAngles(-0.55,0.35),ankleYFromAngles(0.15,1.75)));
    play.prevSp=sp;play.prevFace=play.faceYaw;return;
  }
  if(!play.onGround){                                 // AIRBORNE (leap/jump) — legs read vertical velocity
    var fl=_clamp(play.vy*0.035,-0.5,0.5);
    P['hip1'].rotation.set(-0.42+fl,0,0.05);P['knee1'].rotation.x=0.75-fl*0.5;P['ankle1'].rotation.x=0.1;
    P['hip-1'].rotation.set(0.22-fl,0,-0.05);P['knee-1'].rotation.x=0.5+fl*0.5;P['ankle-1'].rotation.x=0.0;
    parts.torso.rotation.set(0.10+fl*0.1,0,0);character.rotation.x=0.06;character.rotation.z*=0.9;
    _setArm('1',-0.55,0.15,0.9);_setArm('-1',-0.75,0.15,0.9);headGroup.rotation.set(-0.05,0,0);
    if(play.djT>0){var tk=Math.sin(_clamp(play.djT/0.42,0,1)*Math.PI);play.djT-=dt;   // DOPPELSPRUNG-TUCK
      P['hip1'].rotation.x-=1.05*tk;P['hip-1'].rotation.x-=1.05*tk;P['knee1'].rotation.x+=1.35*tk;P['knee-1'].rotation.x+=1.35*tk;
      parts.torso.rotation.x+=0.38*tk;_setArm('1',-0.9*tk-0.4,0.5*tk+0.15,1.6*tk+0.6);_setArm('-1',-0.9*tk-0.4,0.5*tk+0.15,1.6*tk+0.6);headGroup.rotation.x+=0.25*tk;}
    if(play.wjT>0){var wk=_clamp(play.wjT/0.34,0,1);play.wjT-=dt;                      // WANDSPRUNG-KICK
      parts.torso.rotation.y+=0.35*wk;parts.torso.rotation.x+=0.12*wk;P['knee-1'].rotation.x+=0.8*wk;P['hip1'].rotation.x-=0.4*wk;_setArm('1',-1.3*wk-0.3,0.35*wk+0.15,0.7);}
    character.position.y=play.posY+(footBelowAnkle-trochanterY-ankleYFromAngles(0.22,0.5));
    play.prevSp=sp;play.prevFace=play.faceYaw;return;
  }
  // CONTINUOUS GAIT — one system, walk<->run by speed (no discrete states)
  var ga=_clamp(sp/16,0,1);play.gaitAmt+=(ga-play.gaitAmt)*(1-Math.pow(0.0018,dt));var g=play.gaitAmt;
  var moveB=_clamp(sp/2.2,0,1);                        // 0 idle -> 1 striding
  var cb=play.crB=play.crB+((play.crouch?1:0)-play.crB)*(1-Math.pow(0.0008,dt));      // crouch-blend
  var lk=play.landK,cs=character.scale.x||1;
  // DAS GANG-GESETZ (K07): Takt, Fussweg, Tastgrad und Hub aus der gebauten Beinlaenge (geduckt die gebeugte: der Schritt
  // wird kuerzer und schneller, statt zu gleiten); die Huefte sinkt, wo der Fussweg sonst die Reichweite des Beins sprengt
  var gs=gangGesetz(sp,(L1+L2)*cs*_mix(1,0.66,cb)),duty=gs.tast;
  gs.hubE=gs.hubE/_mix(1,0.66,cb);                     // der Hub misst am gestreckten Bein: die Bodenfreiheit hockt nicht mit
  // DER STEHENDE FUSS HAELT (K07, tetrapoda gangPhaseHaelt wie in der Welt): aendert sich die Zeile, behaelt das stehende
  // Bein sein Fuss-Ziel; aus dem Stand setzt das naehere Bein in der Mitte seines Stands ein (die Phase zaehlt ab dem Aufsetzen)
  var g0=play._gs,S0=g0&&g0.S>0?g0.S:0,t0=g0?g0.tast:gs.tast;
  if(gs.omega>0&&(!S0||Math.abs(S0-gs.S)>1e-9||t0!==gs.tast)){var u1=_TC.gangPhaseHaelt(2*Math.PI*(play.gaitPhase+1-t0),S0,t0,gs.S,gs.tast);play.gaitPhase=((u1/(2*Math.PI)-1+gs.tast)%1+1)%1;}
  play._gs=gs.omega>0?gs:null;
  play.gaitPhase=(play.gaitPhase+gs.cad*dt)%1;var ph=play.gaitPhase,T=Math.PI*2,aS=Math.cos(ph*T);
  var standY=standYBase*(1-g*0.16);
  standY=_mix(standY,standYBase*0.66,cb);                                               // crouch-tiefe
  // DAS BECKEN DES GESETZES (K07): tetrapoda gangBecken wie in der Welt -- nur die stehenden Fuesse senken es, an der
  // Reichweite R der (geduckt gebeugten) Kette; im Lauf federt das Bein, in der Flugphase steigt der Leib ballistisch
  var Rk=_TC.gangReich((L1+L2)*_mix(1,0.66,cb)),phG=2*Math.PI*((ph+1-gs.tast)%1);
  standY=_mix(standY,-(Rk-_TC.gangBecken(phG,gs.S/cs,gs.tast,Rk,gs.omega,_GZ,cs,_TC.gangReich(L1+L2))),moveB)+lk*0.95;   // + LANDE-KOMPRESSION
  var pL=ph,pR=(ph+0.5)%1;
  var fL=gangFussStudio(pL,gs,standY,cs,Rk),fR=gangFussStudio(pR,gs,standY,cs,Rk);
  // PER-FOOT GROUND-ADAPTIVE IK (Uncharted-stil): jeder fuss sampelt seinen support an seiner geplanten XZ
  var yw=character.rotation.y,sYw=Math.sin(yw),cYw=Math.cos(yw),ppx=character.position.x,ppz=character.position.z,cSup=play.posY-FOOT;
  var dfL=footSupOff(ppx+(-0.52)*cYw+fL.z*sYw,ppz-(-0.52)*sYw+fL.z*cYw,cSup),dfR=footSupOff(ppx+(0.52)*cYw+fR.z*sYw,ppz-(0.52)*sYw+fR.z*cYw,cSup);
  play.fOffL+=_clamp(dfL-play.fOffL,-6*dt,6*dt);play.fOffR+=_clamp(dfR-play.fOffR,-6*dt,6*dt);  // slew-limit gegen pops
  fL.y+=play.fOffL+play.susp;fR.y+=play.fOffR+play.susp;                              // feder von den BEINEN geschluckt: koerper=smY, sohlen=support
  var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);
  var stL=solveIK(standY+play.fOffL+play.susp,0,L1,L2),stR=solveIK(standY+play.fOffR+play.susp,0,L1,L2);   // auch im STAND per-fuss (idle auf treppe)
  var hipR=_mix(stR.hip,ikR.hip,moveB),knR=_mix(stR.knee,ikR.knee,moveB),ankR=-(hipR+knR)+_mix(0,fR.roll,moveB);  // ankle WELT-referenziert: sohle flach + Abrollen des Gesetzes
  var hipL=_mix(stL.hip,ikL.hip,moveB),knL=_mix(stL.knee,ikL.knee,moveB),ankL=-(hipL+knL)+_mix(0,fL.roll,moveB);
  // die Beine haengen lotrecht unter dem geneigten Leib (die Neigung nick dreht sonst den Fussweg: der Stand-Fuss stieg 0,24 E)
  var accel=_clamp((sp-play.prevSp)/Math.max(dt,1e-3)*0.010,-0.10,0.16),nick=g*0.16+accel;
  P['hip1'].rotation.set(hipR-nick,0,0.05);P['knee1'].rotation.x=knR;P['ankle1'].rotation.x=ankR;
  P['hip-1'].rotation.set(hipL-nick,0,-0.05);P['knee-1'].rotation.x=knL;P['ankle-1'].rotation.x=ankL;
  var armAmp=(0.12+g*1.15)*moveB;
  _setArm('1',-aS*armAmp,(0.05+g*0.10)*moveB,0.15+moveB*(g*0.9+Math.max(0,-aS)*0.45*g));
  _setArm('-1', aS*armAmp,(0.05+g*0.10)*moveB,0.15+moveB*(g*0.9+Math.max(0, aS)*0.45*g));
  var turn=_clamp(((((play.faceYaw-play.prevFace+Math.PI)%T)+T)%T-Math.PI)/Math.max(dt,1e-3)*0.05,-0.22,0.22);
  if(lk>0.25){_setArm('1',-0.7*lk,0.3*lk+0.05,0.9*lk+0.2);_setArm('-1',-0.7*lk,0.3*lk+0.05,0.9*lk+0.2);}   // arme fangen den aufprall
  parts.torso.rotation.set(g*0.30+cb*0.24+lk*0.35+play.susp*0.30, aS*g*0.22*moveB, aS*(0.03+g*0.04)*moveB + Math.sin(t*0.8)*0.01*(1-moveB));
  character.rotation.x=nick; character.rotation.z=-turn*moveB;
  headGroup.rotation.set(-0.03-g*0.07-cb*0.10-lk*0.18-play.susp*0.12, -aS*g*0.13*moveB, 0);
  if(play.cam==='third'){var dh=((play.yaw-yw+Math.PI)%T+T)%T-Math.PI;headGroup.rotation.y+=_clamp(dh,-0.6,0.6)*0.38*(1-g*0.4);}      // HEAD-LOOK zur kamera (TLOU)
  var wS=1-moveB,wR=(pR<duty?1:wS),wL=(pL<duty?1:wS);                                 // stance-gewichteter pelvis-plant: der Schwung-Fuss traegt nie
  var cR=play.fOffR+footBelowAnkle+fR.heb*moveB-trochanterY-ankleYFromAngles(hipR,knR),cL=play.fOffL+footBelowAnkle+fL.heb*moveB-trochanterY-ankleYFromAngles(hipL,knL);   // der rollende Knoechel steht um heb ueber der Sohle
  // Flugphase (beide Fuesse im Schwung): das Becken des Gesetzes ueber dem gedachten Stand-Fuss (gangBecken steigt dort)
  var gY=wR+wL>1e-6?(cR*wR+cL*wL)/(wR+wL):footBelowAnkle-trochanterY-(standY+play.susp);
  character.position.y=play.posY+gY;
  play.prevSp=sp;play.prevFace=play.faceYaw;
}
function playPhysics(dt){
  var pr=0.75,charH=play.slide>0?2.7:(play.crouch?3.4:5.2),wasAir=!play.onGround;      // slide/crouch senken kollisionshoehe (tunnel!)
  var nx=character.position.x+play.vx*dt,nz=character.position.z+play.vz*dt;
  var footY=play.posY-FOOT,headY=footY+charH;play.touchWall=false;
  for(var i=0;i<parkBoxes.length;i++){var b=parkBoxes[i];
    if(b.maxY>footY+1.05&&b.minY<headY&&inXZ(nx,nz,b,pr)){
      var dxl=(b.cx-b.sx/2-pr)-nx,dxr=(b.cx+b.sx/2+pr)-nx,dzl=(b.cz-b.sz/2-pr)-nz,dzr=(b.cz+b.sz/2+pr)-nz;
      var ax=Math.abs(dxl)<Math.abs(dxr)?dxl:dxr,az=Math.abs(dzl)<Math.abs(dzr)?dzl:dzr;
      if(Math.abs(ax)<Math.abs(az)){nx+=ax;play.vx=0;play.wallNX=ax>0?1:-1;play.wallNZ=0;}else{nz+=az;play.vz=0;play.wallNZ=az>0?1:-1;play.wallNX=0;}play.touchWall=true;play.wallT=0.15;}}  // wand-normale + wand-coyote
  character.position.x=nx;character.position.z=nz;
  play.vy-=G_BUEHNE*dt;if(play.vy<-40)play.vy=-40;play.posY+=play.vy*dt;footY=play.posY-FOOT;
  var sup=-1e9;
  for(var i=0;i<parkBoxes.length;i++){var b=parkBoxes[i];
    if(inXZ(character.position.x,character.position.z,b,pr*0.55)&&b.maxY<=footY+1.05&&b.maxY>sup)sup=b.maxY;}
  if(footY<=sup+0.06&&play.vy<=0){if(wasAir){var iv=-play.vy;if(iv>9)play.landK=Math.min(1,play.landK+(iv-9)/26);play.airJumps=1;play.djT=0;play.wjT=0;}play.posY=sup+FOOT;play.vy=0;play.onGround=true;}else play.onGround=false;
  play.landK*=Math.pow(0.010,dt);                                                     // LANDE-FEDER klingt in ~0.3s ab (TLOU impact)
  if(play.onGround){var eS=play.posY-play.smY;play.smV+=eS*170*dt-play.smV*24*dt;play.smY+=play.smV*dt;}
  else{play.smY+=(play.posY-play.smY)*Math.min(1,20*dt);play.smV=play.vy;}
  play.susp=_clamp(play.posY-play.smY,-0.7,0.7);                                      // KOERPER-FEDER: physik snappt (auto-step), pelvis federt nach, beine schlucken
  if(play.posY<-25){play.posY=play.cpY;play.vy=0;play.vx=0;play.vz=0;character.position.set(play.cpX,play.cpY,play.cpZ);if(play.run==='running')play.deaths++;play.landK=0;play.fOffL=0;play.fOffR=0;play.smY=play.cpY;play.smV=0;}  // respawn am CHECKPOINT
  runUpdate(dt);
  var tf=(play.vx*play.vx+play.vz*play.vz>1.2)?play.faceYaw:play.yaw;
  var d=((tf-character.rotation.y+Math.PI)%(2*Math.PI))-Math.PI;if(d<-Math.PI)d+=2*Math.PI;character.rotation.y+=d*(1-Math.pow(0.00016,dt));
  playGait(dt,clock.getElapsedTime());            // procedural body pose + sets character.position.y
  character.updateMatrixWorld(true);
  var sp=Math.hypot(play.vx,play.vz);
  var fT=play.fovBase+_clamp(sp/18,0,1)*7+(play.slide>0?7:0);play.fov+=(fT-play.fov)*(1-Math.pow(0.02,dt));  // SPEED-FOV-KICK (Mirror's Edge)
  if(Math.abs(camera.fov-play.fov)>0.02){camera.fov=play.fov;camera.updateProjectionMatrix();}
  if(play.cam==='third'){
    if(headGroup)headGroup.visible=true;if(typeof hairGroup!=='undefined'&&hairGroup)hairGroup.visible=true;
    // look target leads slightly in the movement direction (look-ahead) + sits at chest height
    var lead=Math.min(sp*0.10,2.2);
    var ltx=character.position.x+Math.sin(play.faceYaw)*lead-Math.cos(play.yaw)*0.65, lty=character.position.y+3.15, ltz=character.position.z+Math.cos(play.faceYaw)*lead+Math.sin(play.yaw)*0.65;
    // ideal cam: behind the LOOK yaw, raised; pulls back & up a touch with speed
    var dist=11.6+sp*0.14, ldx=Math.sin(play.yaw)*Math.cos(play.pitch),ldy=Math.sin(play.pitch),ldz=Math.cos(play.yaw)*Math.cos(play.pitch);
    var shX=-Math.cos(play.yaw)*1.75,shZ=Math.sin(play.yaw)*1.75;                     // OVER-SHOULDER: kamera bildschirm-rechts, figur links im frame
    var icx=character.position.x-ldx*dist+shX, icy=character.position.y+3.85-ldy*dist, icz=character.position.z-ldz*dist+shZ;
    // critically-damped smoothing of camera + look target
    var ks=1-Math.pow(_KAM.armRuhe,dt);
    play.camX=_mix(play.camX,icx,ks);play.camY=_mix(play.camY,icy,ks);play.camZ=_mix(play.camZ,icz,ks);
    play.lookX=_mix(play.lookX,ltx,ks*1.4);play.lookY=_mix(play.lookY,lty,ks*1.4);play.lookZ=_mix(play.lookZ,ltz,ks*1.4);
    // K06 DIE KAMERA HAT EINEN LEIB (NP-03): die Strecke Blickziel -> Kamera gegen JEDE Park-Box (der Boden zuerst), um armRadiusM aufgeblasen (in Lab-Massen: die Kugel deckt die Nah-Ebene 0,1); die Kamera haelt vor dem ersten Eintritt. Beginnt die Strecke in der aufgeblasenen Box, haelt die Kamera armRadiusM vor der Box selbst (entlang der Strecke); beginnt sie in ihr, sagt die Box nichts. camG fiel: der Hoehen-Deckel hob die Kamera nur ueber Boxen unter ihr -- Wand, Tunnel und Kante standen zwischen Blickziel und Linse (9 von 48 Posen).
    // das Blickziel haelt die Kugel selbst frei (wie die Schulter des Wirts): seine Versetzung von der Brust (Schulter + Vorlauf) rueckt vor jeder aufgeblasenen Box ein -- die Figur am Tunnel-Dach trug das Ziel 0,1 vor die Kante
    var kbx=character.position.x,kbz=character.position.z,klx=play.lookX-kbx,klz=play.lookZ-kbz,ks2=1;
    for(var i=0;i<parkBoxes.length;i++){var h0=_kamSeg(kbx,play.lookY,kbz,klx,0,klz,parkBoxes[i],_KAM.armRadiusM+0.01);if(h0>0&&h0<ks2)ks2=h0;}
    var LX=kbx+klx*ks2,LY=play.lookY,LZ=kbz+klz*ks2;
    var kdx=play.camX-LX,kdy=play.camY-LY,kdz=play.camZ-LZ,kt=1;
    for(var i=0;i<parkBoxes.length;i++){var b=parkBoxes[i],h=_kamSeg(LX,LY,LZ,kdx,kdy,kdz,b,_KAM.armRadiusM);if(h===0){h=_kamSeg(LX,LY,LZ,kdx,kdy,kdz,b,0);h=h===0?Infinity:Math.max(0,h-_KAM.armRadiusM/Math.hypot(kdx,kdy,kdz));}if(h<kt)kt=h;}
    // streift die Strecke eine Box, an der sie beginnt (das Ziel an ihrer Kante), endet die Kamera nie in deren Kugel-Hülle: zurück zum Ziel, bis sie frei steht (Bisektion)
    if(!_kamFrei(LX+kdx*kt,LY+kdy*kt,LZ+kdz*kt,_KAM.armRadiusM)){var klo=0,khi=kt;for(var j=0;j<10;j++){var km=(klo+khi)/2;if(_kamFrei(LX+kdx*km,LY+kdy*km,LZ+kdz*km,_KAM.armRadiusM))klo=km;else khi=km;}kt=klo;}
    camera.position.set(LX+kdx*kt,LY+kdy*kt,LZ+kdz*kt);camera.lookAt(LX,LY,LZ);
  }else{
    if(headGroup)headGroup.visible=false;if(typeof hairGroup!=='undefined'&&hairGroup)hairGroup.visible=false;
    var hp=new THREE.Vector3();if(headGroup)headGroup.getWorldPosition(hp);else hp.set(character.position.x,character.position.y+5,character.position.z);
    camera.position.set(hp.x,hp.y+0.15,hp.z);
    var lx=Math.sin(play.yaw)*Math.cos(play.pitch),ly=Math.sin(play.pitch),lz=Math.cos(play.yaw)*Math.cos(play.pitch);
    camera.lookAt(hp.x+lx,hp.y+0.15+ly,hp.z+lz);}
}
// ===================== END PLAY SYSTEM =====================
var BUILD='B64·benchmark';console.log('%cDA VINCI BUILD '+BUILD,'color:#7fd;font-weight:bold');
(function(){var d=document.createElement('div');d.id='buildtag';d.textContent=BUILD;d.style.cssText='position:fixed;right:8px;bottom:6px;font:10px monospace;color:#9fb2c8;opacity:.45;z-index:99;pointer-events:none;';document.body.appendChild(d);})();
animate();addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});

/* ==================== DIE BRÜCKE ZUR HEIMAT (die Hülle, K41) ==================== */
/* EINE Brücke (../huelle/huelle.js): die DSL spricht die ECHTEN UI-Pfade — die acht Bewegungs-/Emotions-Profile leben
   als #emotions-Buttons (data-e, click() → emo.set), "zufall"/"zuruecksetzen" klicken btnRandom/btnReset (exakt der
   Nutzer-Pfad). DSL-Wörter deutsch (Registry == Brücke wortgleich). Esc meldet die Heimkehr — im Ninja-Park-Spielmodus
   gehört Esc dem exitPlay, die Brücke schweigt dort. */
(function () {
    var EMOTION = {
        entspannt: "idle",
        freude: "joy",
        trauer: "sad",
        wut: "angry",
        angst: "fear",
        rennen: "run",
        kampf: "fight",
        showcase: "showcase",
    };
    AnazhHuelle.bruecke({
        welt: "koerperstudio",
        // DAS ZIEL-BILD (D8): die Hülle rendert diese Welt als Panorama aus dem Blick ihrer Kamera — die Tor-Membran der Heimat zeigt es
        panorama: function () {
            return { THREE: THREE, renderer: renderer, scene: scene, kamera: camera };
        },
        label: "Da Vinci Studio — Lebendiger Mensch",
        dsl: Object.keys(EMOTION).concat(["zufall", "zuruecksetzen"]),
        wort: function (w) {
            if (EMOTION[w]) {
                var b = document.querySelector('#emotions button[data-e="' + EMOTION[w] + '"]');
                if (b) b.click();
            } else if (w === "zufall") document.getElementById("btnRandom").click();
            else if (w === "zuruecksetzen") document.getElementById("btnReset").click();
        },
        esc: function () {
            return !(typeof play !== "undefined" && play && play.on); /* Esc = Ninja-Park verlassen (exitPlay) */
        },
        /* DAS WERK DER BÜHNE (der EINE Übergabe-Kanal der Hülle): die Dials und Wahlen des Gusses (Saat 0 wie `gussOv`) —
           die Welt prägt den Avatar damit; der Knopf steht nur im Portal. */
        werk: function () {
            return { kind: "koerper", preset: Object.keys(window.__koerperCore.PRESETS)[0], seed: 0, ov: Object.assign({}, params) };
        },
        werkOrt: document.getElementById("werkOrt"),
    });
})();