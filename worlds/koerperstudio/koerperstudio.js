const params=Object.assign({},window.__koerperCore.START_PARAMS);   // START-GESTALT — lebt seit W-A6 im Kern ../../koerper-core.js (EINE Quelle, sha256-Beleg im Wellen-Bericht); die UI mutiert den Klon
const parts={};const base={};var emoMode='idle';
function PD(kp,kd){this.target=0;this.current=0;this.vel=0;this.kp=kp;this.kd=kd;}
PD.prototype.update=function(dt){var f=(this.target-this.current)*this.kp-this.vel*this.kd;this.vel+=f*dt;this.current+=this.vel*dt;return this.current;};
var physBase={headY:{kp:28,kd:4.5},headX:{kp:28,kd:4.5},headZ:{kp:12,kd:2.5},spineY:{kp:30,kd:4.5},spineX:{kp:28,kd:4.5},spineZ:{kp:15,kd:3},chestY:{kp:45,kd:6},breath:{kp:38,kd:5},armLY:{kp:42,kd:6},armRY:{kp:42,kd:6},armLZ:{kp:48,kd:7},armRZ:{kp:48,kd:7},armLX:{kp:36,kd:5},armRX:{kp:36,kd:5},elbowL:{kp:65,kd:9},elbowR:{kp:65,kd:9},hipLY:{kp:40,kd:5.5},hipRY:{kp:40,kd:5.5},hipLX:{kp:45,kd:6},hipRX:{kp:45,kd:6},hipLZ:{kp:28,kd:4},hipRZ:{kp:28,kd:4},kneeL:{kp:70,kd:9},kneeR:{kp:70,kd:9},ankleL:{kp:55,kd:7},ankleR:{kp:55,kd:7},bicepR:{kp:55,kd:8},bicepL:{kp:55,kd:8},quadR:{kp:48,kd:6},quadL:{kp:48,kd:6},bodyX:{kp:32,kd:5},bodyZ:{kp:22,kd:4}};
const phys={};for(var pk in physBase)phys[pk]=new PD(physBase[pk].kp,physBase[pk].kd);
var bodyPhys={y:0,vy:0};var fistState={l:0,r:0};var palmState={l:0,r:0};var groundSmooth=0;
const L1=0.245*6,L2=0.246*6,footBelowAnkle=0.30,standYBase=-(3.18-footBelowAnkle),standYWalk=standYBase*0.997,standYRun=standYBase*0.83;
function solveIK(ty,tz,l1,l2){var d=Math.sqrt(ty*ty+tz*tz);d=Math.max(Math.abs(l1-l2)+0.001,Math.min(d,l1+l2-0.001));var c=(d*d-l1*l1-l2*l2)/(2*l1*l2);c=Math.max(-1,Math.min(1,c));var kr=Math.acos(c);var hb=-Math.atan2(tz,-ty);var g=Math.atan2(l2*Math.sin(kr),l1+l2*Math.cos(kr));return{hip:hb-g,knee:kr};}
function footPath(ph,stride,lift,sY,duty){var y,z;if(ph<duty){var sp=ph/duty;z=stride*(0.5-sp);y=sY+Math.sin(sp*Math.PI)*0.015;}else{var sw=(ph-duty)/(1-duty);z=stride*(-0.5+sw);y=sY+Math.sin(sw*Math.PI)*lift;}return{y:y,z:z};}
function anklePhase(ph,duty){if(ph<duty){var sp=ph/duty;if(sp<0.1)return -0.12*(1-sp/0.1);if(sp<0.7)return 0;return 0.35*(sp-0.7)/0.3;}var sw=(ph-duty)/(1-duty);return -0.1+0.03*Math.sin(sw*Math.PI);}
function ankleYFromAngles(hx,kr){return -(L1+L2*Math.cos(kr))*Math.cos(hx)+L2*Math.sin(kr)*Math.sin(hx);}
var emo={cur:{headY:0,headX:0,headZ:0,spineY:0,spineX:0,spineZ:0,bodyX:0,bodyZ:0,armL:0,armR:0,armLX:0,armRX:0,elbowL:0.1,elbowR:0.1,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.03,sway:0.012,freq:1.2,kpMul:1.0,irisSpeed:0.3,blinkRate:0.5},tgt:null,name:'idle',behTimer:0,behType:null,behStart:0,
presets:window.__koerperCore.MOTION,   // BEWEGUNGS-PROFILE — das motion-Feld lebt im Kern (W-A6, EINE Quelle; emo.set kopiert je Wahl)
set:function(name){this.tgt=Object.assign({},this.presets[name]);this.name=name;this.behTimer=0;this.behType=null;var sY=standYBase;if(name==='run')sY=standYRun;if(name==='fear')sY=standYBase*0.96;if(name==='sad')sY=standYBase*0.99;if(name!=='run'&&name!=='fight'&&name!=='pwalk'&&name!=='slide'){var zL=0,zR=0;var ikL=solveIK(sY,zL,L1,L2),ikR=solveIK(sY,zR,L1,L2);this.tgt.hipLX=ikL.hip;this.tgt.hipRX=ikR.hip;this.tgt.kneeL=ikL.knee;this.tgt.kneeR=ikR.knee;}},
update:function(dt,t){if(!this.tgt)return;var c=this.cur,g=this.tgt,l=1-Math.exp(-3.1*dt);var keys=['headY','headX','headZ','spineY','spineX','spineZ','bodyX','bodyZ','armL','armR','armLX','armRX','elbowL','elbowR','hipLX','hipRX','hipLZ','hipRZ','kneeL','kneeR','breath','sway','freq','kpMul','irisSpeed','blinkRate'];for(var i=0;i<keys.length;i++)c[keys[i]]+=(g[keys[i]]-c[keys[i]])*l;this.behTimer+=dt;if(this.name==='idle'){var ib=['walk','walk','walk','lookaround','shift','breathe','glance','headtilt'];if(this.behTimer>2.5+Math.random()*3){this.behTimer=0;this.behType=ib[Math.floor(Math.random()*ib.length)];this.behStart=t;}}else if(this.name==='joy'){var jb=['dance','dance','jump','wave','spin','bounce','clap'];if(this.behTimer>2+Math.random()*2.5){this.behTimer=0;this.behType=jb[Math.floor(Math.random()*jb.length)];this.behStart=t;}}else if(this.name==='sad'){var sb=['wipetear','sigh','lookdown','droop','wilt'];if(this.behTimer>4+Math.random()*3){this.behTimer=0;this.behType=sb[Math.floor(Math.random()*sb.length)];this.behStart=t;}}else if(this.name==='angry'){var ab=['shout','clench','lunge','stomp','pound','glare'];if(this.behTimer>1.5+Math.random()*2){this.behTimer=0;this.behType=ab[Math.floor(Math.random()*ab.length)];this.behStart=t;}}else if(this.name==='fear'){var fb=['shrink','tremble','cower','flinch','cringe'];if(this.behTimer>1.2+Math.random()*1.5){this.behTimer=0;this.behType=fb[Math.floor(Math.random()*fb.length)];this.behStart=t;}}else if(this.name==='run'){this.behType='running';}else if(this.name==='pwalk'){this.behType='pwalking';}else if(this.name==='slide'){this.behType='sliding';}else if(this.name==='fight'){var fb2=['jab','cross','hook','guard','dodge','kick','combo'];if(this.behTimer>0.5+Math.random()*1.0){this.behTimer=0;this.behType=fb2[Math.floor(Math.random()*fb2.length)];this.behStart=t;}}else if(this.name==='showcase'){this.behType='showcase';}},
getBeh:function(t){var m={headY:0,headX:0,headZ:0,spineY:0,spineX:0,spineZ:0,bodyX:0,bodyZ:0,armL:0,armR:0,armLX:0,armRX:0,elbowL:0,elbowR:0,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,ankleL:0,ankleR:0,breathBoost:1,jumpY:0,tensionBoost:0,mouthBoost:0,browBoost:0};var pt;function guardBase(m){var ikL=solveIK(standYBase,0.2,L1,L2),ikR=solveIK(standYBase,-0.2,L1,L2);m.armRZ=0.1;m.armLZ=0.1;m.armRX=-0.45;m.armLX=-0.45;m.elbowR=1.35;m.elbowL=1.35;m.hipLX=ikL.hip;m.hipRX=ikR.hip;m.hipLZ=-0.12;m.hipRZ=0.12;m.kneeR=ikR.knee;m.kneeL=ikL.knee;m.ankleR=0.05;m.ankleL=0.05;}
if(this.behType==='walk'){var ph=(t*1.0)%1.0,pL=ph,pR=(ph+0.5)%1.0;var fL=footPath(pL,0.5,0.12,standYWalk,0.6),fR=footPath(pR,0.5,0.12,standYWalk,0.6);var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);m.hipLX=ikL.hip;m.kneeL=ikL.knee;m.ankleL=anklePhase(pL,0.6);m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=anklePhase(pR,0.6);m.armLX=Math.cos(ph*2*Math.PI)*0.3;m.armRX=-Math.cos(ph*2*Math.PI)*0.3;m.elbowL=0.15+Math.abs(Math.cos(ph*2*Math.PI))*0.1;m.elbowR=0.15+Math.abs(Math.cos(ph*2*Math.PI+Math.PI))*0.1;m.spineY=Math.cos(ph*2*Math.PI)*0.05;m.bodyZ=Math.cos(ph*2*Math.PI+Math.PI/2)*0.02;m.jumpY=Math.abs(Math.sin(ph*2*Math.PI))*0.02;m.breathBoost=1.3;m.headY=Math.sin(ph*Math.PI)*0.04;m.tensionBoost=0.15;return m;}
if(this.behType==='running'){var ph=(t*2.85)%1.0,pL=ph,pR=(ph+0.5)%1.0;var fL=footPath(pL,2.85,1.55,standYRun,0.35),fR=footPath(pR,2.85,1.55,standYRun,0.35);var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);m.hipLX=ikL.hip;m.kneeL=ikL.knee;m.ankleL=anklePhase(pL,0.35);m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=anklePhase(pR,0.35);var aS=Math.cos(ph*2*Math.PI);m.armLX=aS*1.25;m.armRX=-aS*1.25;m.armR=0.12;m.armL=0.12;m.elbowL=1.4+Math.max(0,aS)*0.55;m.elbowR=1.4+Math.max(0,-aS)*0.55;m.spineY=aS*0.26;m.headY=-aS*0.14;m.spineX=0.30;m.spineZ=aS*0.05;m.bodyX=0.18;m.bodyZ=-aS*0.06;m.jumpY=Math.pow(Math.abs(Math.sin(ph*2*Math.PI)),0.65)*0.30;m.breathBoost=2.0;m.headX=-0.08;m.tensionBoost=0.55;return m;}
if(this.behType==='pwalking'){var ph=(t*1.78)%1.0,pL=ph,pR=(ph+0.5)%1.0;var fL=footPath(pL,1.2,0.42,standYBase,0.62),fR=footPath(pR,1.2,0.42,standYBase,0.62);var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);m.hipLX=ikL.hip;m.kneeL=ikL.knee;m.ankleL=anklePhase(pL,0.62);m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=anklePhase(pR,0.62);var aS=Math.cos(ph*2*Math.PI);m.armLX=aS*0.42;m.armRX=-aS*0.42;m.armR=0.04;m.armL=0.04;m.elbowL=0.32+Math.max(0,aS)*0.15;m.elbowR=0.32+Math.max(0,-aS)*0.15;m.spineY=aS*0.09;m.headY=-aS*0.05;m.spineZ=aS*0.035;m.spineX=0.05;m.bodyX=0.04;m.bodyZ=-aS*0.035;m.jumpY=Math.pow(Math.abs(Math.sin(ph*2*Math.PI)),0.8)*0.055;m.breathBoost=1.3;m.headX=-0.03;m.tensionBoost=0.12;return m;}
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
const SKIN_TONES={porzellan:{hex:0xf0d5c0,name:'Porzellan'},hell:{hex:0xe3b898,name:'Hell'},sand:{hex:0xd4a17e,name:'Sand'},karamell:{hex:0xc48566,name:'Karamell'},bronze:{hex:0xa86a4d,name:'Bronze'},umbra:{hex:0x7d4a33,name:'Umbra'},mahagoni:{hex:0x5f3826,name:'Mahagoni'},ebenholz:{hex:0x3f2418,name:'Ebenholz'}};
var _skinRepaint=null;   // HAUTTON live umfaerben: EIN material fuer alle haut-shells -> keine rebuilds, sofort
function skinTex(){const aC=document.createElement('canvas');aC.width=aC.height=1024;const a=aC.getContext('2d');
const al=new THREE.CanvasTexture(aC);
_skinRepaint=function(hexNum){var hs='#'+('000000'+hexNum.toString(16)).slice(-6);
 var r=(hexNum>>16)&255,g2=(hexNum>>8)&255,b2=hexNum&255;
 a.fillStyle=hs;a.fillRect(0,0,1024,1024);
 for(let i=0;i<200;i++){var f=0.82+Math.random()*0.34;   // sommersprossen/flecken RELATIV zum ton (dunkle haut: dunkle flecken)
  a.fillStyle='rgba('+Math.min(255,r*f|0)+','+Math.min(255,g2*f|0)+','+Math.min(255,b2*f|0)+',0.15)';
  a.beginPath();a.arc(Math.random()*1024,Math.random()*1024,50+Math.random()*150,0,Math.PI*2);a.fill();}
 al.needsUpdate=true;};
_skinRepaint(0xc48566);al.wrapS=al.wrapT=THREE.RepeatWrapping;const nC=document.createElement('canvas');nC.width=nC.height=1024;const n=nC.getContext('2d');n.fillStyle='#8080ff';n.fillRect(0,0,1024,1024);const nI=n.getImageData(0,0,1024,1024);const hM=new Float32Array(1024*1024);for(let i=0;i<hM.length;i++)hM[i]=Math.random();for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){const idx=y*1024+x;const dx=(hM[y*1024+Math.min(1023,x+1)]-hM[y*1024+Math.max(0,x-1)])*60;const dy=(hM[Math.min(1023,y+1)*1024+x]-hM[Math.max(0,y-1)*1024+x])*60;const l=Math.sqrt(dx*dx+dy*dy+1);const p=idx*4;nI.data[p]=((dx/l)*0.5+0.5)*255;nI.data[p+1]=((dy/l)*0.5+0.5)*255;nI.data[p+2]=((1/l)*0.5+0.5)*255;nI.data[p+3]=255;}n.putImageData(nI,0,0);const nm=new THREE.CanvasTexture(nC);nm.wrapS=nm.wrapT=THREE.RepeatWrapping;al.repeat.set(12,12);nm.repeat.set(12,12);return{albedo:al,normal:nm};}
const st=skinTex();
const matSkin=new THREE.MeshPhysicalMaterial({map:st.albedo,roughness:0.62,metalness:0,clearcoat:0.12,clearcoatRoughness:0.6,normalMap:st.normal,normalScale:new THREE.Vector2(0.8,0.8)});matSkin.userData.uTime={value:0};matSkin.onBeforeCompile=(sh)=>{sh.uniforms.uTime=matSkin.userData.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common> uniform float uTime; vec3 mod289_s(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 mod289_s(vec4 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 permute_s(vec4 x){return mod289_s(((x*34.0)+1.0)*x);} vec4 taylorInvSqrt_s(vec4 r){return 1.79284291400159-0.85373472095314*r;} float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289_s(i);vec4 p=permute_s(permute_s(permute_s(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt_s(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`);sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex> float noise=snoise(position*3.0+uTime*0.1);transformed+=normal*noise*0.0035;`);sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );',`gl_FragColor=vec4(outgoingLight,diffuseColor.a);float NdotV=dot(vNormal,normalize(-vViewPosition));float sss=pow(1.0-abs(NdotV),3.0);gl_FragColor.rgb+=vec3(1.0,0.4,0.25)*sss*0.15;`);};
const matLips=new THREE.MeshPhysicalMaterial({color:0xaa5544,roughness:0.4,clearcoat:0.8,clearcoatRoughness:0.2});const matEye=new THREE.MeshPhysicalMaterial({color:0xf5f5f0,roughness:0.05,clearcoat:1.0});const matIris=new THREE.MeshStandardMaterial({color:0x2a4a6a,roughness:0.1});const matCornea=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:0,transparent:true,opacity:0.05,ior:1.38,clearcoat:1.0});const matSocket=new THREE.MeshStandardMaterial({color:0x5a3320,roughness:0.6});const matDark=new THREE.MeshBasicMaterial({color:0x050000});const matJoint=new THREE.MeshStandardMaterial({color:0x806060,roughness:0.6});const matShadow=new THREE.MeshStandardMaterial({color:0x8a5840,roughness:0.7});
function createDeepFurMat(hex,rough){const mat=new THREE.MeshStandardMaterial({color:hex,roughness:rough||0.82,metalness:0,side:THREE.DoubleSide});mat.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aStrandY;\nvarying float vStrandY;');sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStrandY=aStrandY;');sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vStrandY;');sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(vec3(0.02,0.01,0.005),diffuseColor.rgb,vStrandY);');sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );','gl_FragColor=vec4(outgoingLight,diffuseColor.a);\nfloat NdotV=dot(vNormal,normalize(-vViewPosition));\nfloat tipRim=pow(1.0-abs(NdotV),3.0)*vStrandY;\ngl_FragColor.rgb+=vec3(0.35,0.18,0.05)*tipRim;\nfloat spec=pow(max(NdotV,0.0),8.0)*vStrandY*0.3;\ngl_FragColor.rgb+=vec3(0.3,0.15,0.04)*spec;');};mat.customProgramCacheKey=function(){return'deep_human_fur_v1';};return mat;}
const HAIR_COLORS={
black:{base:0x141014,lt:0x2a2228,name:'Schwarz'},
darkbrown:{base:0x2a1a10,lt:0x42291a,name:'Dunkelbraun'},
brown:{base:0x472c18,lt:0x6b4226,name:'Braun'},
chestnut:{base:0x6b3a1a,lt:0x8f5a2e,name:'Kastanie'},
blond:{base:0xa9803f,lt:0xceac6a,name:'Blond'},
platinum:{base:0xcfc097,lt:0xe8ddbf,name:'Platin'},
ginger:{base:0x8a3b18,lt:0xb35e2a,name:'Rot'},
grey:{base:0x6e6a66,lt:0x9a958f,name:'Grau'},
white:{base:0xcecbc5,lt:0xeeece8,name:'Weiß'},
blue:{base:0x244a8a,lt:0x4a78c0,name:'Blau'},
pink:{base:0xb0497a,lt:0xd47aa6,name:'Pink'},
teal:{base:0x1f6a66,lt:0x3a9a94,name:'Teal'}};
var _hairMatCache={};
function hairMatFor(hex,rough){var k=hex+'_'+rough;if(!_hairMatCache[k])_hairMatCache[k]=createDeepFurMat(hex,rough);return _hairMatCache[k];}
var matHair=hairMatFor(HAIR_COLORS.darkbrown.base,0.85),matHairLt=hairMatFor(HAIR_COLORS.darkbrown.lt,0.75);
function setHairColor(key){var c=HAIR_COLORS[key]||HAIR_COLORS.darkbrown;matHair=hairMatFor(c.base,0.85);matHairLt=hairMatFor(c.lt,0.75);}
function s(r,m,sc){const me=new THREE.Mesh(new THREE.SphereGeometry(r,64,64),m);if(sc)me.scale.set(sc[0],sc[1],sc[2]);me.castShadow=true;me.receiveShadow=true;return me;}
function c(rt,rb,h,m){const me=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,64,Math.max(1,Math.round(h/0.05))),m);me.castShadow=true;me.receiveShadow=true;return me;}
function reg(name,mesh){parts[name]=mesh;if(mesh&&!mesh.name)mesh.name=name;if(mesh.scale)base[name]=mesh.scale.clone();return mesh;}
const {H,headSeg,acromionY,nippleY,trochanterY,shoulderHW,hipHW,baseArmX,thighLen,calfLen,upperArmLen,forearmLen,skullBaseR,skullCY,skullRX,skullRY,skullRZ,eyeDist,jawW,chinW,browY,eyeY,cheekY,noseY,lipY,chinY,jawY,hairlineY}=window.__koerperCore.labProportionen();   // ULTRAGUSS U3: die 6-kopfhoehen-loomis-proportionen wohnen im gesetzbuch (koerper-core.labProportionen) -- die shell liest die EINE quelle
// KONVERGENZ-WELLE: der teile-baum wohnt im gesetzbuch (koerper-core.bauMensch, verbatim Z.100-158 gewandert; beweis: bau-gitter 288 knoten / 108 parts / 0 abweichungen) -- die shell baut ihn mit THREE-fabriken, der stamm mit daten-knoten -> metaball-haut; labMorph trifft in BEIDEN lesern dieselben teil-namen.
const __MATK={skin:matSkin,joint:matJoint,dark:matDark,eye:matEye,iris:matIris,cornea:matCornea,socket:matSocket,shadow:matShadow,lips:matLips,hair:matHair,pupil:new THREE.MeshBasicMaterial({color:0x000000})};
const __B=window.__koerperCore.bauMensch({gruppe:()=>new THREE.Group(),kugel:(r,k,sc)=>s(r,__MATK[k],sc),zylinder:(rt,rb,h,k)=>c(rt,rb,h,__MATK[k])});
const character=__B.character;Object.assign(parts,__B.parts);Object.assign(base,__B.base);
const torsoG=parts.torso,headGroup=parts.head,pelvis=parts.pelvis,ribcage=parts.ribcage,waist=parts.waist,upperBack=parts.upperBack,chin=parts.chin,noseTip=parts.noseTip,neckBase=parts.neckBase,neckMain=parts.neckMain;
const neckTop=__B.extra.neckTop,adamsApple=__B.extra.adamsApple,nape=__B.extra.nape;
var eyeL=__B.augen.eyeL,eyeR=__B.augen.eyeR,irisL=__B.augen.irisL,irisR=__B.augen.irisR,lidTL=__B.augen.lidTL,lidTR=__B.augen.lidTR,lidBL=__B.augen.lidBL,lidBR=__B.augen.lidBR,browL=__B.augen.browL,browR=__B.augen.browR,upperLipRef=__B.augen.upperLipRef,lowerLipRef=__B.augen.lowerLipRef;
scene.add(character);
var _geomCache={};function getStrandGeo(len,thick){var k=Math.round(len*1000)+'_'+Math.round(thick*10000);if(!_geomCache[k]){var w=thick*1.8,wt=Math.max(0.001,thick*0.65),l=len;var p=[-w,0,0,w,0,0,wt,-l,0,-wt,-l,0,0,0,-w,0,0,w,0,-l,wt,0,-l,-wt];var i=[0,1,2,0,2,3,4,5,6,4,6,7];var sy=[0,0,1,1,0,0,1,1];var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('aStrandY',new THREE.Float32BufferAttribute(sy,1));g.setIndex(i);g.computeVertexNormals();_geomCache[k]=g;}return _geomCache[k];}
const hairGroup=new THREE.Group();var hairStrandsData=[];hairGroup.name='hair';
function skullPos(t,p,o){o+=0.16;const sp=Math.sin(p);return new THREE.Vector3(skullRX*o*sp*Math.cos(t),skullCY+skullRY*o*Math.cos(p),skullRZ*o*sp*Math.sin(t));}
function hairFlow(t,p){if(p<0.04)return new THREE.Vector3(0,-0.1,-0.85).normalize();var st=Math.sin(t),ct=Math.cos(t),sp=Math.sin(p);var dx=0,dy=-1.0,dz=-0.08;if(p<0.25){var topF=(0.25-p)/0.25;dz=-0.08-topF*0.2;dy=-0.7-topF*0.15;}if(st<-0.2)dz=-0.08+st*0.08;if(Math.abs(st)<0.5&&sp>0.15)dx=ct*sp*0.04;if(st>0.4&&p>0.1&&p<0.4)dz=st*0.05;if(p>1.0){dx=ct*0.02;dy=-1.0;dz=st*0.02;}dx+=Math.sin(t*5.3)*0.015;dz+=Math.cos(t*3.7)*0.015;var L=Math.sqrt(dx*dx+dy*dy+dz*dz);if(L<0.01)return new THREE.Vector3(0,-1,0);return new THREE.Vector3(dx/L,dy/L,dz/L);}
function isFace(t,p){const fr=Math.sin(t);if(fr>0.3&&p>0.9)return true;if(fr>0.5&&p>0.7)return true;return false;}
function addHairStrand(t,p,o,len,thick,mat){var pos=skullPos(t,p,o);var dir=hairFlow(t,p);var qlen=Math.round((len+Math.random()*0.015)/0.004)*0.004;var geo=getStrandGeo(qlen,thick);var quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),dir.clone().normalize());hairStrandsData.push({pos:pos,quat:quat,mat:mat,geoId:geo.uuid,geo:geo});}
// ===== HAIR STYLE SYSTEM — all styles built on skullPos/hairFlow/addHairStrand =====
function addHairStrandDir(t,p,o,len,thick,mat,dir){var pos=skullPos(t,p,o);var qlen=Math.round((len+Math.random()*0.015)/0.004)*0.004;var geo=getStrandGeo(qlen,thick);var quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),dir.clone().normalize());hairStrandsData.push({pos:pos,quat:quat,mat:mat,geoId:geo.uuid,geo:geo});}
function pushStrand(pos,dir,len,thick,mat){var qlen=Math.round((len+Math.random()*0.015)/0.004)*0.004;var geo=getStrandGeo(qlen,thick);var quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),dir.clone().normalize());hairStrandsData.push({pos:pos.clone(),quat:quat,mat:mat,geoId:geo.uuid,geo:geo});}
function skullNormal(t,p){var pp=skullPos(t,p,1.0);pp.y-=skullCY;return pp.normalize();}
function scalpBase(density,o,lenFn,thick,mat,mode,maxP){maxP=maxP||1.5;for(var i=0;i<density;i++){var p=0.03+Math.random()*(maxP-0.03);var t=Math.random()*Math.PI*2;if(isFace(t,p))continue;var len=lenFn(t,p);var dir;if(mode==='out'){dir=skullNormal(t,p);dir.x+=(Math.random()-0.5)*0.5;dir.y+=(Math.random()-0.5)*0.4;dir.z+=(Math.random()-0.5)*0.5;dir.normalize();}else if(mode==='outdown'){var n=skullNormal(t,p);dir=n.clone().multiplyScalar(0.6);dir.y-=0.7;dir.x+=(Math.random()-0.5)*0.4;dir.z+=(Math.random()-0.5)*0.4;dir.normalize();}else{dir=hairFlow(t,p);}addHairStrandDir(t,p,o+Math.random()*0.02,len,thick,mat,dir);}}
function crownCowlick(){for(var i=0;i<6;i++){var ct=Math.random()*Math.PI*2,cp=0.005+Math.random()*0.025;var cpos=skullPos(ct,cp,1.08);var cdir=new THREE.Vector3(Math.sin(ct)*0.25,0.85+Math.random()*0.15,Math.cos(ct)*0.25).normalize();pushStrand(cpos,cdir,0.04+Math.random()*0.02,0.006,matHair);}}
function pulledBackScalp(mat,density){for(var i=0;i<density;i++){var p=0.03+Math.random()*1.0,t=Math.random()*Math.PI*2;if(isFace(t,p))continue;var n=skullNormal(t,p);var dir=new THREE.Vector3(n.x*0.15,-0.35,-0.92);dir.x+=(Math.random()-0.5)*0.12;dir.z+=(Math.random()-0.5)*0.08;dir.normalize();addHairStrandDir(t,p,1.04+Math.random()*0.02,0.05+Math.random()*0.07,0.02,mat,dir);}}
function ponytailTail(mat){var origin=skullPos(-Math.PI/2,0.95,1.05);for(var i=0;i<240;i++){var off=new THREE.Vector3((Math.random()-0.5)*0.14,(Math.random()-0.5)*0.05,(Math.random()-0.5)*0.10);var pos=origin.clone().add(off);var dir=new THREE.Vector3((Math.random()-0.5)*0.12,-1,-0.22+(Math.random()-0.5)*0.12).normalize();pushStrand(pos,dir,0.45+Math.random()*0.55,0.02,mat);}}
function bunCluster(mat){var c=skullPos(-Math.PI/2,0.5,1.06);for(var i=0;i<420;i++){var th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),rr=0.22;var pos=new THREE.Vector3(c.x+rr*Math.sin(ph)*Math.cos(th)*1.1,c.y+rr*Math.cos(ph),c.z+rr*Math.sin(ph)*Math.sin(th)*0.9);var dir=pos.clone().sub(c).normalize();dir.x+=(Math.random()-0.5)*0.3;dir.y+=(Math.random()-0.5)*0.3;dir.z+=(Math.random()-0.5)*0.3;dir.normalize();pushStrand(pos,dir,0.06+Math.random()*0.06,0.018,mat);}}
function style_glatze(){scalpBase(150,1.03,function(){return 0.010+Math.random()*0.010;},0.018,matHair,'out',1.5);}
function style_buzz(){scalpBase(780,1.05,function(){return 0.028+Math.random()*0.022;},0.022,matHair,'out',1.5);scalpBase(230,1.06,function(){return 0.026+Math.random()*0.02;},0.016,matHairLt,'out',1.45);}
function style_kurz(){crownCowlick();scalpBase(560,1.05,function(t,p){return 0.055+(p<0.4?0.04:0)+Math.random()*0.04;},0.024,matHair,'flow',1.45);scalpBase(290,1.07,function(){return 0.08+Math.random()*0.05;},0.02,matHair,'flow',1.4);scalpBase(140,1.08,function(){return 0.05+Math.random()*0.04;},0.016,matHairLt,'flow',1.4);}
function style_mittel(){crownCowlick();
for(var i=0;i<280;i++){var p=0.03+Math.random()*1.35,t=Math.random()*Math.PI*2;if(isFace(t,p))continue;addHairStrand(t,p,1.04+Math.random()*0.02,0.025+Math.random()*0.03,0.032+Math.random()*0.008,matHair);}
for(var i=0;i<80;i++){var t=Math.PI/2+(Math.random()-0.5)*1.2;addHairStrand(t,0.7+Math.random()*0.3,1.10,0.16+Math.random()*0.06,0.024+Math.random()*0.004,matHair);}
for(var i=0;i<70;i++){var p=0.04+Math.random()*0.4,t=Math.random()*Math.PI*2;if(isFace(t,p))continue;addHairStrand(t,p,1.08,0.12+Math.random()*0.06,0.022+Math.random()*0.004,matHair);}
for(var i=0;i<100;i++){var p=0.15+Math.random()*1.3,t=Math.random()*Math.PI*2;if(isFace(t,p))continue;var fr=Math.sin(t);addHairStrand(t,p,1.09,0.20+((1-fr)/2)*0.15+Math.random()*0.05,0.022+Math.random()*0.005,matHair);}
for(var i=0;i<120;i++){var t=-Math.PI/2+(Math.random()-0.5)*1.4;addHairStrand(t,0.2+Math.random()*1.5,1.09,0.55+Math.random()*0.2,0.018+Math.random()*0.004,matHair);}
for(var i=0;i<80;i++){var sd2=Math.random()>0.5?1:-1;var st2=sd2>0?Math.random()*0.4:Math.PI-Math.random()*0.4;addHairStrand(st2,0.25+Math.random()*0.45,1.12,0.18+Math.random()*0.1,0.020+Math.random()*0.004,matHair);}
for(var i=0;i<40;i++){var sd3=Math.random()>0.5?1:-1;var t=sd3>0?Math.random()*0.5:Math.PI-Math.random()*0.5;addHairStrand(t,0.4+Math.random()*0.8,1.09,0.20+Math.random()*0.08,0.018+Math.random()*0.004,matHair);}
for(var i=0;i<30;i++){var p=0.2+Math.random()*1.3,t=-Math.PI/2+(Math.random()-0.5)*2.5;if(isFace(t,p))continue;var fr=Math.sin(t);addHairStrand(t,p,1.11,0.18+((1-fr)/2)*0.4+Math.random()*0.08,0.016+Math.random()*0.003,matHairLt);}
for(var i=0;i<100;i++){var p=0.1+Math.random()*1.4,t=Math.random()*Math.PI*2;if(isFace(t,p))continue;addHairStrand(t,p,1.07,0.06+Math.random()*0.06,0.016+Math.random()*0.004,matHair);}
for(var i=0;i<40;i++){var sd4=Math.random()>0.5?1:-1;var t=sd4>0?(Math.random()*0.25):(Math.PI-Math.random()*0.25);addHairStrand(t,0.5+Math.random()*0.9,1.09,0.25+Math.random()*0.15,0.018+Math.random()*0.004,matHair);}
for(var i=0;i<40;i++){var t=-Math.PI/2+(Math.random()-0.5)*1.0;addHairStrand(t,0.1+Math.random()*1.3,1.08,0.15+Math.random()*0.2,0.02+Math.random()*0.005,matHair);}}
function style_lang(){crownCowlick();scalpBase(300,1.04,function(){return 0.06+Math.random()*0.05;},0.03,matHair,'flow',1.5);scalpBase(220,1.07,function(){return 0.16+Math.random()*0.1;},0.022,matHair,'flow',0.6);
for(var i=0;i<340;i++){var t=Math.random()*Math.PI*2,p=0.15+Math.random()*1.4;if(isFace(t,p))continue;var fr=Math.sin(t);addHairStrand(t,p,1.09,0.55+((1-fr)/2)*0.6+Math.random()*0.25,0.018+Math.random()*0.004,matHair);}
for(var i=0;i<160;i++){var t=-Math.PI/2+(Math.random()-0.5)*2.6,p=0.2+Math.random()*1.4;if(isFace(t,p))continue;addHairStrand(t,p,1.11,0.7+Math.random()*0.5,0.016+Math.random()*0.003,matHairLt);}
for(var i=0;i<120;i++){var sd=Math.random()>0.5?1:-1;var t=sd>0?Math.random()*0.6:Math.PI-Math.random()*0.6;addHairStrand(t,0.4+Math.random()*1.0,1.1,0.6+Math.random()*0.4,0.018,matHair);}}
function style_locken(){crownCowlick();scalpBase(680,1.06,function(){return 0.10+Math.random()*0.08;},0.026,matHair,'outdown',1.45);scalpBase(360,1.09,function(){return 0.12+Math.random()*0.1;},0.022,matHair,'out',1.4);scalpBase(170,1.1,function(){return 0.1+Math.random()*0.08;},0.018,matHairLt,'out',1.4);}
function style_afro(){scalpBase(1150,1.07,function(){return 0.16+Math.random()*0.1;},0.026,matHair,'out',1.55);scalpBase(520,1.12,function(){return 0.18+Math.random()*0.12;},0.022,matHair,'out',1.5);scalpBase(240,1.14,function(){return 0.16+Math.random()*0.1;},0.018,matHairLt,'out',1.5);}
function style_zopf(){pulledBackScalp(matHair,560);ponytailTail(matHair);}
function style_dutt(){pulledBackScalp(matHair,560);bunCluster(matHair);}
function style_undercut(){scalpBase(420,1.04,function(){return 0.018+Math.random()*0.014;},0.018,matHair,'out',1.5);
for(var i=0;i<430;i++){var p=0.03+Math.random()*0.52,t=Math.random()*Math.PI*2;if(isFace(t,p))continue;var n=skullNormal(t,p);var dir=new THREE.Vector3(0.5+n.x*0.2,-0.55,-0.2+n.z*0.2);dir.x+=(Math.random()-0.5)*0.15;dir.normalize();addHairStrandDir(t,p,1.07+Math.random()*0.02,0.12+Math.random()*0.14,0.02,matHair,dir);}
for(var i=0;i<120;i++){var p=0.03+Math.random()*0.4,t=Math.random()*Math.PI*2;if(isFace(t,p))continue;var dir=new THREE.Vector3(0.55,-0.5,-0.2).normalize();addHairStrandDir(t,p,1.09,0.16+Math.random()*0.1,0.016,matHairLt,dir);}}
var HAIRSTYLES={glatze:style_glatze,buzz:style_buzz,kurz:style_kurz,mittel:style_mittel,lang:style_lang,locken:style_locken,afro:style_afro,zopf:style_zopf,dutt:style_dutt,undercut:style_undercut};
function buildInstancedHair(){var groups={};for(var i=0;i<hairStrandsData.length;i++){var st=hairStrandsData[i];var key=st.mat.uuid+'_'+st.geoId;if(!groups[key])groups[key]={mat:st.mat,strands:[],geo:st.geo};groups[key].strands.push(st);}var result=new THREE.Group();for(var key in groups){var g=groups[key];var inst=new THREE.InstancedMesh(g.geo,g.mat,g.strands.length);inst.castShadow=true;inst.userData.strands=g.strands;var dummy=new THREE.Object3D();for(var i=0;i<g.strands.length;i++){dummy.position.copy(g.strands[i].pos);dummy.quaternion.copy(g.strands[i].quat);dummy.scale.set(1,1,1);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);}inst.instanceMatrix.needsUpdate=true;result.add(inst);}return result;}
var hairMesh=null;
function buildHair(){setHairColor(params.hairColor);hairStrandsData=[];(HAIRSTYLES[params.hairStyle]||style_mittel)();if(hairMesh){hairGroup.remove(hairMesh);}hairMesh=buildInstancedHair();hairGroup.add(hairMesh);updateHairScale();}
headGroup.add(hairGroup);hairGroup.scale.setScalar(1.10);   // grosse koepfe: straehnen tauchten in die (gesund gemessene) shell -- lift hebt die wurzeln freibuildHair();   // HAAR-LIFT: straehnen sitzen auf den PRIMITIVEN, die schaedel-SHELL liegt ~0.045 drueber -> 7% radial raus, sonst versinken sie
function updateHairScale(){if(!hairMesh)return;var vol=params.hairVol,len=params.hairLen;hairMesh.children.forEach(function(inst){var strands=inst.userData.strands;if(!strands)return;var dummy=new THREE.Object3D();for(var i=0;i<strands.length;i++){dummy.position.copy(strands[i].pos);dummy.quaternion.copy(strands[i].quat);dummy.scale.set(vol,len,vol);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);}inst.instanceMatrix.needsUpdate=true;});}
// ===== CLOTHING SYSTEM — a garment is an offset shell of the body's OWN primitives =====
// (same principle as fur: the covering is derived from the body surface, so it inherits every
//  morph, pose rotation and per-frame flex/breath for free.)
const CLOTH_COLORS={white:{hex:0xe8e6e0,name:'Weiß'},charcoal:{hex:0x2a2c30,name:'Anthrazit'},grey:{hex:0x6b6e73,name:'Grau'},black:{hex:0x161618,name:'Schwarz'},navy:{hex:0x233047,name:'Navy'},blue:{hex:0x3a5a8a,name:'Blau'},red:{hex:0x8f3328,name:'Rot'},green:{hex:0x3a5a3a,name:'Grün'},olive:{hex:0x57592f,name:'Oliv'},mustard:{hex:0xb8893a,name:'Senf'},burgundy:{hex:0x5a2530,name:'Bordeaux'},sand:{hex:0xc9b487,name:'Sand'},teal:{hex:0x2a6a6a,name:'Petrol'}};
function lighten(hex,amt){var c=new THREE.Color(hex);c.r=Math.min(1,c.r+amt);c.g=Math.min(1,c.g+amt);c.b=Math.min(1,c.b+amt);return c.getHex();}
function clothMat(hex,rough,fuzzAmt,fuzzHex){var m=new THREE.MeshStandardMaterial({color:hex,roughness:rough,metalness:0,side:THREE.DoubleSide});var fc=new THREE.Color(fuzzHex||hex);var fr=fc.r.toFixed(3),fg=fc.g.toFixed(3),fb=fc.b.toFixed(3),fa=fuzzAmt.toFixed(3);m.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vClothUv;');sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvClothUv=vec2(position.x+position.z,position.y);');sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vClothUv;');sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nvec2 cw=vClothUv*30.0;\nfloat weave=0.5+0.35*sin(cw.x*6.2831)+0.15*sin(cw.y*6.2831);\ndiffuseColor.rgb*=0.90+0.10*weave;');sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );','gl_FragColor=vec4(outgoingLight,diffuseColor.a);\nfloat NdotVc=dot(normalize(vNormal),normalize(-vViewPosition));\nfloat fuzz=pow(1.0-abs(NdotVc),3.0);\ngl_FragColor.rgb+=vec3('+fr+','+fg+','+fb+')*fuzz*'+fa+';');};m.customProgramCacheKey=function(){return'cloth_'+fr+fg+fb+fa+rough;};return m;}
function sheenMat(hex,rough,cc){return new THREE.MeshPhysicalMaterial({color:hex,roughness:rough,metalness:0,clearcoat:cc==null?0.5:cc,clearcoatRoughness:0.35,side:THREE.DoubleSide});}
var _clothMatCache={};
function getCloth(hex,rough,fuzz,fuzzHex,type){var k=(type||'c')+'_'+hex+'_'+rough+'_'+fuzz+'_'+(fuzzHex||0);if(_clothMatCache[k])return _clothMatCache[k];var m;if(type==='leather')m=sheenMat(hex,rough,0.6);else if(type==='rubber')m=sheenMat(hex,rough,0.3);else m=clothMat(hex,rough,fuzz,fuzzHex);_clothMatCache[k]=m;return m;}
var garmentObjs=[];
function shellClone(part,mat,off){if(!part)return;var meshes=[];part.traverse(function(o){if(o.isMesh&&o.geometry&&!o.userData.isGarment)meshes.push(o);});meshes.forEach(function(o){var c=new THREE.Mesh(o.geometry,mat);c.scale.setScalar(off);c.castShadow=true;c.userData.isGarment=true;o.add(c);garmentObjs.push(c);});}
function cs(r,mat,sc,seg){var m=new THREE.Mesh(new THREE.SphereGeometry(r,seg||24,seg||20),mat);if(sc)m.scale.set(sc[0],sc[1],sc[2]);m.castShadow=true;m.userData.isGarment=true;m.userData.ownGeo=true;return m;}
function ctube(rt,rb,h,mat,seg,open){var m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||24,1,open!==false),mat);m.castShadow=true;m.userData.isGarment=true;m.userData.ownGeo=true;return m;}
function addG(parent,mesh,pos,rot){if(!parent)return mesh;if(pos)mesh.position.set(pos[0],pos[1],pos[2]);if(rot)mesh.rotation.set(rot[0],rot[1],rot[2]);parent.add(mesh);garmentObjs.push(mesh);return mesh;}
function clearGarments(){for(var i=0;i<garmentObjs.length;i++){var o=garmentObjs[i];if(o.parent)o.parent.remove(o);if(o.userData.ownGeo&&o.geometry)o.geometry.dispose();}garmentObjs=[];}

/* ===== WATERTIGHT LOFTED GARMENTS (replaces the shellClone sphere-pile) =====
   Garments are sampled from the real body silhouette and built as continuous
   lofted surfaces (DoubleSide), so there are no slits, gaps or open hems.
   Sampling is in ROOT-local space (attach to `character`) or ARM-local (attach
   to the arm group); buildOutfit() runs after morph() so they reconform live. */
var _GN=28;
function collectWorldTagged(root){
  root.updateMatrixWorld(true);
  var V=[],tags=[],v=new THREE.Vector3();
  root.traverse(function(o){
    if(o.isMesh&&o.geometry&&!o.userData.isGarment){
      var owner='',p=o;while(p){if(p.name){owner=p.name;break;}p=p.parent;}
      var pos=o.geometry.attributes.position;
      for(var i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
        V.push([v.x,v.y,v.z]);tags.push(owner);}
    }});
  return {V:V,tags:tags};
}
function vertsFor(WT,names){var set={};for(var i=0;i<names.length;i++)set[names[i]]=1;
  var out=[];for(var j=0;j<WT.V.length;j++)if(set[WT.tags[j]])out.push(WT.V[j]);return out;}
function toFrame(V,node){var inv=new THREE.Matrix4().copy(node.matrixWorld).invert();
  var out=[],v=new THREE.Vector3();
  for(var i=0;i<V.length;i++){v.set(V[i][0],V[i][1],V[i][2]).applyMatrix4(inv);out.push([v.x,v.y,v.z]);}return out;}
function rootLocal(V){return toFrame(V,character);}
function _band(V,y,b){var o=[];for(var i=0;i<V.length;i++)if(Math.abs(V[i][1]-y)<b)o.push(V[i]);return o;}
function sampleProfile(V,yLo,yHi,nLev,padX,padZ,padZB,padZF){
  padX=(padX==null?0.06:padX);padZ=(padZ==null?0.06:padZ);
  var pzb=(padZB==null?padZ:padZB),pzf=(padZF==null?padZ:padZF);
  var step=(yHi-yLo)/Math.max(1,nLev-1),band0=step*0.9,out=[],ys=[];
  for(var k=0;k<nLev;k++){var y=yLo+step*k;ys.push(y);
    var b=band0,sel=_band(V,y,b);
    while(sel.length<4&&b<step*4){b*=1.6;sel=_band(V,y,b);}
    if(sel.length<4){out.push(null);continue;}
    var xmin=1e9,xmax=-1e9,zmin=1e9,zmax=-1e9;
    for(var i=0;i<sel.length;i++){var x=sel[i][0],z=sel[i][2];
      if(x<xmin)xmin=x;if(x>xmax)xmax=x;if(z<zmin)zmin=z;if(z>zmax)zmax=z;}
    var zb=zmin-pzb,zf=zmax+pzf;
    out.push({y:y,cx:(xmin+xmax)/2,cz:(zb+zf)/2,rx:(xmax-xmin)/2+padX,rz:(zf-zb)/2});
  }
  var known=[];for(var m=0;m<out.length;m++)if(out[m])known.push(m);
  if(known.length){for(var n=0;n<out.length;n++){if(out[n])continue;
    var lo=known[0],hi=known[known.length-1];
    for(var a=0;a<known.length;a++){if(known[a]<n)lo=known[a];if(known[a]>n){hi=known[a];break;}}
    var t=(lo===hi)?0.5:(ys[n]-ys[lo])/(ys[hi]-ys[lo]+1e-9),A=out[lo],B=out[hi];
    out[n]={y:ys[n],cx:A.cx+(B.cx-A.cx)*t,cz:A.cz+(B.cz-A.cz)*t,rx:A.rx+(B.rx-A.rx)*t,rz:A.rz+(B.rz-A.rz)*t};
  }}
  return out;
}
function ellipseRing(cx,cy,cz,rx,rz,n){var r=[];for(var i=0;i<n;i++){var p=2*Math.PI*i/n;
  r.push([cx+rx*Math.cos(p),cy,cz+rz*Math.sin(p)]);}return r;}
function ringFromSlice(s,n,ix,iz){return ellipseRing(s.cx,s.y,s.cz,s.rx+(ix||0),s.rz+(iz||0),n);}
function loftGeo(rings,opt){opt=opt||{};var n=rings[0].length,V=[],F=[];
  for(var r=0;r<rings.length;r++)for(var k=0;k<n;k++)V.push(rings[r][k]);
  function idx(ri,k){return ri*n+((k%n+n)%n);}
  for(var ri=0;ri<rings.length-1;ri++)for(var k=0;k<n;k++){
    var a=idx(ri,k),b=idx(ri,k+1),c=idx(ri+1,k),d=idx(ri+1,k+1);F.push(a,c,d);F.push(a,d,b);}
  var last=rings.length-1,rl=rings[last],cx=0,cy=0,cz=0;
  for(var q=0;q<n;q++){cx+=rl[q][0];cy+=rl[q][1];cz+=rl[q][2];}cx/=n;cy/=n;cz/=n;
  var drop=opt.domeDrop||0;
  if(opt.ridge){var zf=opt.ridge[0],zb2=opt.ridge[1],Sf=V.length;V.push([cx,cy-drop,zf]);
    var Sb=V.length;V.push([cx,cy-drop,-zb2]);
    for(var k3=0;k3<n;k3++){var a=idx(last,k3),b=idx(last,k3+1),za=rl[k3][2]-cz,zc=rl[(k3+1)%n][2]-cz,
      sa=(za>=0)?Sf:Sb,sb=(zc>=0)?Sf:Sb;
      if(sa===sb)F.push(a,b,sa);else{F.push(a,b,Sf);F.push(b,Sb,Sf);}}
  }else if(opt.capEnd){var ctr=V.length;V.push([cx,cy-drop,cz]);
    for(var k4=0;k4<n;k4++)F.push(ctr,idx(last,k4),idx(last,k4+1));}
  var pos=new Float32Array(V.length*3);
  for(var i=0;i<V.length;i++){pos[i*3]=V[i][0];pos[i*3+1]=V[i][1];pos[i*3+2]=V[i][2];}
  var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setIndex(F);g.computeVertexNormals();return g;
}
function garmentMesh(geo,mat){var m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;
  m.userData.isGarment=true;m.userData.ownGeo=true;return m;}
function addGarment(parent,geo,mat){var m=garmentMesh(geo,mat);parent.add(m);garmentObjs.push(m);return m;}

// ---- convex-hull cross-section rings (bridge muscle bumps like real cloth) ----
function _bandXZ(V,y,b){var o=[];for(var i=0;i<V.length;i++)if(Math.abs(V[i][1]-y)<b)o.push([V[i][0],V[i][2]]);return o;}
function _cross(o,a,b){return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);}
function _hull2d(pts){var P=pts.slice().sort(function(a,b){return (a[0]-b[0])||(a[1]-b[1]);});
  if(P.length<3)return P;var lo=[],up=[],i;
  for(i=0;i<P.length;i++){while(lo.length>=2&&_cross(lo[lo.length-2],lo[lo.length-1],P[i])<=0)lo.pop();lo.push(P[i]);}
  for(i=P.length-1;i>=0;i--){while(up.length>=2&&_cross(up[up.length-2],up[up.length-1],P[i])<=0)up.pop();up.push(P[i]);}
  lo.pop();up.pop();return lo.concat(up);}
function hullRings(V,yLo,yHi,nLev,n,pad,padBack){
  pad=(pad==null?0.06:pad);var pb=(padBack==null?pad:padBack);
  var step=(yHi-yLo)/Math.max(1,nLev-1),band0=step*0.9,ca=[],sa=[],i;
  for(i=0;i<n;i++){var p=2*Math.PI*i/n;ca.push(Math.cos(p));sa.push(Math.sin(p));}
  var rings=new Array(nLev),ys=new Array(nLev),li;
  for(li=0;li<nLev;li++){var y=yLo+step*li;ys[li]=y;
    var b=band0,sel=_bandXZ(V,y,b);
    while(sel.length<6&&b<step*4){b*=1.6;sel=_bandXZ(V,y,b);}
    if(sel.length<6){rings[li]=null;continue;}
    var H=_hull2d(sel);if(H.length<3){rings[li]=null;continue;}
    var cx=0,cz=0,h;for(h=0;h<H.length;h++){cx+=H[h][0];cz+=H[h][1];}cx/=H.length;cz/=H.length;
    var nH=H.length,ring=[];
    for(i=0;i<n;i++){var dx=ca[i],dz=sa[i],best=-1,e;
      for(e=0;e<nH;e++){var x1=H[e][0]-cx,z1=H[e][1]-cz,x2=H[(e+1)%nH][0]-cx,z2=H[(e+1)%nH][1]-cz;
        var ex=x2-x1,ez=z2-z1,det=dx*(-ez)-(-ex)*dz;if(Math.abs(det)<1e-9)continue;
        var t=(-x1*ez+ex*z1)/det,s=(dx*z1-dz*x1)/det;
        if(t>0&&s>=-1e-6&&s<=1+1e-6){if(t>best)best=t;}}
      if(best<0){best=0;for(h=0;h<nH;h++){var rr=Math.hypot(H[h][0]-cx,H[h][1]-cz);if(rr>best)best=rr;}}
      var padv=pad+(pb-pad)*Math.max(0,Math.min(1,-sa[i]));var rad=best+padv;
      ring.push([cx+rad*ca[i],y,cz+rad*sa[i]]);}
    rings[li]=ring;}
  var known=[],k;for(k=0;k<nLev;k++)if(rings[k])known.push(k);
  if(known.length){for(k=0;k<nLev;k++){if(rings[k])continue;
    var loi=known[0],hii=known[known.length-1],a;
    for(a=0;a<known.length;a++){if(known[a]<k)loi=known[a];if(known[a]>k){hii=known[a];break;}}
    var tt=(loi===hii)?0.5:(ys[k]-ys[loi])/(ys[hii]-ys[loi]+1e-9),rg=[],q;
    for(q=0;q<n;q++)rg.push([rings[loi][q][0]+(rings[hii][q][0]-rings[loi][q][0])*tt,ys[k],
      rings[loi][q][2]+(rings[hii][q][2]-rings[loi][q][2])*tt]);rings[k]=rg;}}
  for(var pass=0;pass<2;pass++){var prev=rings.map(function(r){return r.map(function(pp){return[pp[0],pp[1],pp[2]];});});
    for(li=1;li<nLev-1;li++)for(var q2=0;q2<n;q2++){
      rings[li][q2][0]=0.25*prev[li-1][q2][0]+0.5*prev[li][q2][0]+0.25*prev[li+1][q2][0];
      rings[li][q2][2]=0.25*prev[li-1][q2][2]+0.5*prev[li][q2][2]+0.25*prev[li+1][q2][2];}}
  return rings;}
function cuffRings(c0,drop,flare){drop=(drop==null?0.09:drop);flare=(flare==null?1.13:flare);
  var cx=c0.cx,cz=c0.cz,y=c0.y,rx=c0.rx,rz=c0.rz;
  return [ellipseRing(cx,y-drop,cz,rx*1.04,rz*1.04,_GN),
          ellipseRing(cx,y-drop*0.45,cz,rx*flare,rz*flare,_GN),
          ellipseRing(cx,y,cz,rx,rz,_GN)];}

var _outfitWT=null;  // body point cache shared across buildTop/buildBottom per rebuild
// ===== voxel + naive surface-nets garment shell (browser-portable) =====
// grid flat index i + nx*(j + ny*k); 6-connectivity to match scipy defaults.
function _vox_dilate(g,nx,ny,nz,iters){
  for(var it=0;it<iters;it++){var o=new Uint8Array(g.length);
    for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var id=i+nx*(j+ny*k);
      if(g[id]){o[id]=1;continue;}
      if((i>0&&g[id-1])||(i<nx-1&&g[id+1])||(j>0&&g[id-nx])||(j<ny-1&&g[id+nx])||(k>0&&g[id-nx*ny])||(k<nz-1&&g[id+nx*ny]))o[id]=1;}
    g=o;}
  return g;}
function _vox_erode(g,nx,ny,nz,iters){
  for(var it=0;it<iters;it++){var o=new Uint8Array(g.length);
    for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var id=i+nx*(j+ny*k);
      if(!g[id])continue;
      var keep=1;
      if(i==0||!g[id-1])keep=0;else if(i==nx-1||!g[id+1])keep=0;
      else if(j==0||!g[id-nx])keep=0;else if(j==ny-1||!g[id+nx])keep=0;
      else if(k==0||!g[id-nx*ny])keep=0;else if(k==nz-1||!g[id+nx*ny])keep=0;
      o[id]=keep;}
    g=o;}
  return g;}
function _vox_fill(g,nx,ny,nz){               // fill enclosed holes (flood bg from border)
  var reach=new Uint8Array(g.length),st=[];
  function push(id){if(!g[id]&&!reach[id]){reach[id]=1;st.push(id);}}
  for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){
    if(i==0||i==nx-1||j==0||j==ny-1||k==0||k==nz-1)push(i+nx*(j+ny*k));}
  while(st.length){var id=st.pop();var i=id%nx,j=((id/nx)|0)%ny,k=(id/(nx*ny))|0;
    if(i>0)push(id-1);if(i<nx-1)push(id+1);if(j>0)push(id-nx);if(j<ny-1)push(id+nx);
    if(k>0)push(id-nx*ny);if(k<nz-1)push(id+nx*ny);}
  var o=new Uint8Array(g.length);
  for(var x=0;x<g.length;x++)o[x]=(g[x]||!reach[x])?1:0;
  return o;}
function _gauss1d(sig){var r=Math.max(1,Math.ceil(sig*3)),w=[],s=0;
  for(var i=-r;i<=r;i++){var e=Math.exp(-(i*i)/(2*sig*sig));w.push(e);s+=e;}
  for(var i=0;i<w.length;i++)w[i]/=s;return {w:w,r:r};}
function _blur3(f,nx,ny,nz,sig){var K=_gauss1d(sig),w=K.w,r=K.r,tmp=new Float32Array(f.length);
  // x
  for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var a=0;
    for(var t=-r;t<=r;t++){var ii=i+t;if(ii<0)ii=0;if(ii>=nx)ii=nx-1;a+=w[t+r]*f[ii+nx*(j+ny*k)];}
    tmp[i+nx*(j+ny*k)]=a;}
  var out=new Float32Array(f.length);
  // y
  for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var a=0;
    for(var t=-r;t<=r;t++){var jj=j+t;if(jj<0)jj=0;if(jj>=ny)jj=ny-1;a+=w[t+r]*tmp[i+nx*(jj+ny*k)];}
    out[i+nx*(j+ny*k)]=a;}
  // z
  for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var a=0;
    for(var t=-r;t<=r;t++){var kk=k+t;if(kk<0)kk=0;if(kk>=nz)kk=nz-1;a+=w[t+r]*out[i+nx*(j+ny*kk)];}
    tmp[i+nx*(j+ny*k)]=a;}
  return tmp;}
var _CPOS=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
var _SNED=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
function surfaceNets(F,nx,ny,nz,level,ox,oy,oz,vox){
  var cnx=nx-1,cny=ny-1,cnz=nz-1;
  var vid=new Int32Array(cnx*cny*cnz);for(var q=0;q<vid.length;q++)vid[q]=-1;
  var verts=[],faces=[],c=new Float32Array(8);
  function CID(i,j,k){return i+cnx*(j+cny*k);}
  for(var k=0;k<cnz;k++)for(var j=0;j<cny;j++)for(var i=0;i<cnx;i++){
    for(var e=0;e<8;e++)c[e]=F[(i+(e&1))+nx*((j+((e>>1)&1))+ny*(k+((e>>2)&1)))];
    var mask=0;for(var e=0;e<8;e++)if(c[e]<level)mask|=(1<<e);
    if(mask==0||mask==255)continue;
    var px=0,py=0,pz=0,cnt=0;
    for(var e=0;e<12;e++){var a=_SNED[e][0],b=_SNED[e][1];
      if((c[a]<level)!=(c[b]<level)){var t=(level-c[a])/(c[b]-c[a]+1e-12);
        px+=_CPOS[a][0]+t*(_CPOS[b][0]-_CPOS[a][0]);
        py+=_CPOS[a][1]+t*(_CPOS[b][1]-_CPOS[a][1]);
        pz+=_CPOS[a][2]+t*(_CPOS[b][2]-_CPOS[a][2]);cnt++;}}
    var vi=verts.length;verts.push([(px/cnt+i)*vox+ox,(py/cnt+j)*vox+oy,(pz/cnt+k)*vox+oz]);
    vid[CID(i,j,k)]=vi;
    var s0=(c[0]<level);
    for(var ax=0;ax<3;ax++){var corner=ax==0?1:ax==1?2:4;
      if((c[0]<level)==(c[corner]<level))continue;
      var iu=(ax+1)%3,iv=(ax+2)%3;
      var dux=iu==0?1:0,duy=iu==1?1:0,duz=iu==2?1:0;
      var dvx=iv==0?1:0,dvy=iv==1?1:0,dvz=iv==2?1:0;
      var a0=i,b0=j,c0=k;
      var a1=i-dux,b1=j-duy,c1=k-duz;
      var a2=i-dux-dvx,b2=j-duy-dvy,c2=k-duz-dvz;
      var a3=i-dvx,b3=j-dvy,c3=k-dvz;
      if(a1<0||b1<0||c1<0||a2<0||b2<0||c2<0||a3<0||b3<0||c3<0)continue;
      var A=vid[CID(a0,b0,c0)],B=vid[CID(a1,b1,c1)],C=vid[CID(a2,b2,c2)],D=vid[CID(a3,b3,c3)];
      if(A<0||B<0||C<0||D<0)continue;
      if(s0){faces.push([A,B,C]);faces.push([A,C,D]);}
      else {faces.push([A,C,B]);faces.push([A,D,C]);}}
  }
  return {verts:verts,faces:faces};}

// ---- build occupancy from point list (Nx3 array) ----
function shellFromParts(inclPts,cutPts,vox,sigma,level,cuts){
  // bbox
  var lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9],i,p;
  for(i=0;i<inclPts.length;i++){p=inclPts[i];for(var d=0;d<3;d++){if(p[d]<lo[d])lo[d]=p[d];if(p[d]>hi[d])hi[d]=p[d];}}
  for(var d=0;d<3;d++){lo[d]-=0.3;hi[d]+=0.3;}
  var nx=Math.ceil((hi[0]-lo[0])/vox)+3,ny=Math.ceil((hi[1]-lo[1])/vox)+3,nz=Math.ceil((hi[2]-lo[2])/vox)+3;
  function splat(pts,dil){var g=new Uint8Array(nx*ny*nz);
    for(var i=0;i<pts.length;i++){var a=Math.floor((pts[i][0]-lo[0])/vox),b=Math.floor((pts[i][1]-lo[1])/vox),cc=Math.floor((pts[i][2]-lo[2])/vox);
      if(a<0)a=0;if(a>=nx)a=nx-1;if(b<0)b=0;if(b>=ny)b=ny-1;if(cc<0)cc=0;if(cc>=nz)cc=nz-1;g[a+nx*(b+ny*cc)]=1;}
    if(dil)g=_vox_dilate(g,nx,ny,nz,dil);return g;}
  var g=splat(inclPts,1);
  var _cl2=(typeof _shellClosing!=='undefined'&&_shellClosing)||2;
  g=_vox_dilate(g,nx,ny,nz,_cl2); g=_vox_erode(g,nx,ny,nz,_cl2);   // closing (default 2; hand-shell nutzt 1 fuer finger-rillen)
  g=_vox_fill(g,nx,ny,nz);                                    // fill interior
  // to float field (1 inside / 0 out), blur
  var f=new Float32Array(g.length);for(i=0;i<g.length;i++)f[i]=g[i];
  f=_blur3(f,nx,ny,nz,sigma);
  // carve openings on the FIELD (post-blur => crisp): cut parts + planes
  if(cutPts&&cutPts.length){var cg=splat(cutPts,2);
    for(i=0;i<f.length;i++)if(cg[i])f[i]=-1;}
  var planeCuts=[],cylCuts=[];
  if(cuts){for(var ci=0;ci<cuts.length;ci++){var cu=cuts[ci];
    if(cu.type=='neckClamp'){                    // HALS-FELD-CLAMP v2, GEFEATHERT: der harte cliff (v1) erzeugte den saegezahn-
      var FE=0.075;                               // papierkranz am kragen. jetzt weicher konus: attenuation waechst glatt in r UND y
      for(var kN=0;kN<nz;kN++)for(var jN=0;jN<ny;jN++)for(var iN=0;iN<nx;iN++){   // -> nets sieht eine sanfte schulter-hals-flanke statt einer klippe.
        var wxN=lo[0]+iN*vox,wyN=lo[1]+jN*vox,wzN=lo[2]+kN*vox;
        if(wyN<=cu.y0||wyN>=cu.y1||Math.abs(wxN)>=0.34)continue;
        var tK=Math.min(1,Math.max(0,(wyN-cu.y0)/(cu.y1-cu.y0)));
        var rEff=cu.r+0.085*(1-tK);                        // KONISCH statt rohr: breit am trapez-ansatz, schmal unterm kinn (echte hals-anatomie, rein aus landmarken)
        var rrN=Math.hypot(wxN-cu.cx,wzN-cu.cz);if(rrN<=rEff)continue;
        var aN=Math.min(1,(rrN-rEff)/FE)*Math.min(1,(wyN-cu.y0)/FE);
        var idN=iN+nx*(jN+ny*kN);f[idN]=f[idN]*(1-aN)-aN;}}
    else if(cu.type=='sphere'){if(cu.r>0){var st9=0;for(var k9=0;k9<nz;k9++)for(var j9=0;j9<ny;j9++)for(var i9=0;i9<nx;i9++){
        var wx9=lo[0]+i9*vox,wy9=lo[1]+j9*vox,wz9=lo[2]+k9*vox,dx9=wx9-cu.cx,dy9=wy9-cu.cy,dz9=wz9-cu.cz;
        if(dx9*dx9+dy9*dy9+dz9*dz9<cu.r*cu.r){f[i9+nx*(j9+ny*k9)]=-1;st9++;}}}}
    else if(cu.type=='cyl'){cylCuts.push(cu);}   // WURZEL-FIX: cyl carvt NICHT mehr ins feld (das erzeugte eine versiegelnde
                                                 // iso-INNENWAND am loch -- n=0 offene kanten, die 'bisse' waren ihre voxel-oberkante).
                                                 // stattdessen face-drop nach dem meshing (wie leghem) -> ECHTE offene kante.
    else if(cu.type=='cyl')cylCuts.push(cu);
    else planeCuts.push(cu);}}
  var sn=surfaceNets(f,nx,ny,nz,level,lo[0],lo[1],lo[2],vox);

  function _cz(tag){if(_shellKind!=='skinBody')return;var c=0;
    for(var q=0;q<sn.verts.length;q++){var v=sn.verts[q];
      if(v[1]>5.0&&v[1]<5.35&&Math.hypot(v[0],v[2])<0.24)c++;}
    console.log('ZAEHL['+tag+'] hals-verts='+c+' gesamt='+sn.verts.length);}
  _cz('nach-nets');
  if(planeCuts.length){var V=sn.verts,kept=[];
    for(var fi=0;fi<sn.faces.length;fi++){var a=sn.faces[fi][0],b=sn.faces[fi][1],c=sn.faces[fi][2],drop=false;
      var mx=(V[a][0]+V[b][0]+V[c][0])/3,my=(V[a][1]+V[b][1]+V[c][1])/3,mz=(V[a][2]+V[b][2]+V[c][2])/3;
      for(var pc=0;pc<planeCuts.length;pc++){var cu=planeCuts[pc];
        if(cu.type=='plane3'){var sd=mx*cu.nx+my*cu.ny+mz*cu.nz-cu.d;
          if(sd*cu.side>0){if(cu.lr){var ax=mx-cu.lp[0],ay=my-cu.lp[1],az=mz-cu.lp[2],dot=ax*cu.ld[0]+ay*cu.ld[1]+az*cu.ld[2];if(!(cu.ray&&dot*cu.ray<0)){var ex=ax-dot*cu.ld[0],ey=ay-dot*cu.ld[1],ez=az-dot*cu.ld[2];if(ex*ex+ey*ey+ez*ez<cu.lr*cu.lr){drop=true;break;}}}else{drop=true;break;}}}
        else{var cc=cu.axis==0?mx:cu.axis==1?my:mz;if((cu.dir>0&&cc>cu.val)||(cu.dir<0&&cc<cu.val)){drop=true;break;}}}
      if(!drop)kept.push(sn.faces[fi]);}
    sn.faces=kept;
    var SN=vox*1.4;
    for(var vi=0;vi<V.length;vi++){var v=V[vi];
      for(var pc2=0;pc2<planeCuts.length;pc2++){var cu2=planeCuts[pc2];
        if(cu2.type=='plane3'){var sd2=v[0]*cu2.nx+v[1]*cu2.ny+v[2]*cu2.nz-cu2.d,ks=-sd2*cu2.side;
          if(ks>=0&&ks<SN){if(cu2.lr){var ax=v[0]-cu2.lp[0],ay=v[1]-cu2.lp[1],az=v[2]-cu2.lp[2],dt2=ax*cu2.ld[0]+ay*cu2.ld[1]+az*cu2.ld[2];if(cu2.ray&&dt2*cu2.ray<0)continue;var ex=ax-dt2*cu2.ld[0],ey=ay-dt2*cu2.ld[1],ez=az-dt2*cu2.ld[2];if(ex*ex+ey*ey+ez*ez>=cu2.lr*cu2.lr)continue;}
            v[0]-=sd2*cu2.nx;v[1]-=sd2*cu2.ny;v[2]-=sd2*cu2.nz;}}
        else{var cc2=cu2.axis==0?v[0]:cu2.axis==1?v[1]:v[2],ks2=(cu2.val-cc2)*(cu2.dir>0?1:-1);
          if(ks2>=0&&ks2<SN){if(cu2.axis==0)v[0]=cu2.val;else if(cu2.axis==1)v[1]=cu2.val;else v[2]=cu2.val;}}}}
    for(vi=0;vi<V.length;vi++){var v=V[vi];
      for(var cy2=0;cy2<cylCuts.length;cy2++){var cu3=cylCuts[cy2];
        if(v[1]<=cu3.ymin-SN)continue;var dx3=v[0]-cu3.cx,dz3=v[2]-cu3.cz,d3=Math.hypot(dx3,dz3);
        if(d3>1e-6&&Math.abs(d3-cu3.r)<SN){var s3=cu3.r/d3;v[0]=cu3.cx+dx3*s3;v[2]=cu3.cz+dz3*s3;}}}
    // KRAGEN-LOCH: face-drop im zylinder (erzeugt die echte offene kante), dann hard-snap exakt auf r
    if(cylCuts.length){var FK=[],fi9;
      for(fi9=0;fi9<sn.faces.length;fi9++){var ff=sn.faces[fi9];
        var A9=sn.verts[ff[0]],B9=sn.verts[ff[1]],C9=sn.verts[ff[2]];
        var mx9=(A9[0]+B9[0]+C9[0])/3,my9=(A9[1]+B9[1]+C9[1])/3,mz9=(A9[2]+B9[2]+C9[2])/3;
        var drop=false;
        for(var cq=0;cq<cylCuts.length;cq++){var cu0=cylCuts[cq];
          var ddx=mx9-cu0.cx,ddz=mz9-cu0.cz;
          if(my9>cu0.ymin&&ddx*ddx+ddz*ddz<cu0.r*cu0.r){drop=true;break;}}   // ZENTROID-drop: die alle-3-regel liess bei muskel-100% spike-faces stehen (V-kerben)
        if(!drop)FK.push(ff);}
      sn.faces=FK;}
    if(cylCuts.length){var EC9={},k9,i9,F9=sn.faces;
      for(i9=0;i9<F9.length;i9++){var f9=F9[i9],e9=[[f9[0],f9[1]],[f9[1],f9[2]],[f9[2],f9[0]]];
        for(var q9=0;q9<3;q9++){k9=e9[q9][0]<e9[q9][1]?e9[q9][0]+'_'+e9[q9][1]:e9[q9][1]+'_'+e9[q9][0];EC9[k9]=(EC9[k9]||0)+1;}}
      var bd9={};for(k9 in EC9)if(EC9[k9]===1){var p9=k9.split('_');bd9[+p9[0]]=1;bd9[+p9[1]]=1;}
      for(var v9 in bd9){var vv=sn.verts[+v9];
        for(var c9=0;c9<cylCuts.length;c9++){var cu9=cylCuts[c9];
          if(vv[1]<=cu9.ymin-0.02)continue;
          var dx9=vv[0]-cu9.cx,dz9=vv[2]-cu9.cz,d9=Math.hypot(dx9,dz9);
          if(d9>1e-6&&d9<cu9.r+0.22){var s9=cu9.r/d9;vv[0]=cu9.cx+dx9*s9;vv[2]=cu9.cz+dz9*s9;break;}}}}
    if(cylCuts.length){var ymax5=-1e9;                 // KRAGEN-BUENDCHEN: wulst-ring um die cyl-kante (echte shirts haben einen bund, keinen schnittrand)
      for(var b5=0;b5<V.length;b5++)if(V[b5][1]>ymax5)ymax5=V[b5][1];
      for(b5=0;b5<V.length;b5++){var v5=V[b5];if(v5[1]<ymax5-0.42)continue;
        for(var cc5=0;cc5<cylCuts.length;cc5++){var cu5=cylCuts[cc5];
          var dx5=v5[0]-cu5.cx,dz5=v5[2]-cu5.cz,d5=Math.hypot(dx5,dz5);if(d5<1e-6)continue;
          var t5=(d5-cu5.r-0.05)/0.05,w5=0.016*Math.exp(-t5*t5);
          if(w5>0.001){v5[0]+=dx5/d5*w5;v5[2]+=dz5/d5*w5;}}}}
    // SAUM-GLAETTUNG: boundary-loops tangential glaetten (2x jacobi), dann exakt zurueck auf die
    // schnittflaeche projizieren -> saegezahn auf voxel-skala weg (achsel-/aermelkante), plane/cyl bleiben scharf
    (function(){var EC2={},e2i,F2=sn.faces;
      for(e2i=0;e2i<F2.length;e2i++){var f5=F2[e2i],ee5=[[f5[0],f5[1]],[f5[1],f5[2]],[f5[2],f5[0]]];
        for(var q5=0;q5<3;q5++){var k5=ee5[q5][0]<ee5[q5][1]?ee5[q5][0]+'_'+ee5[q5][1]:ee5[q5][1]+'_'+ee5[q5][0];EC2[k5]=(EC2[k5]||0)+1;}}
      var BN={},kk5;
      for(kk5 in EC2)if(EC2[kk5]===1){var pq5=kk5.split('_'),a5=+pq5[0],b5=+pq5[1];(BN[a5]||(BN[a5]=[])).push(b5);(BN[b5]||(BN[b5]=[])).push(a5);}
      var _sp5=(_shellKind==='skinFace'||_shellKind==='skinSkull')?6:3;   // gesichts-/schaedelhoehlen-raender doppelt glaetten (lid-/mund-zacken)
      for(var it5=0;it5<_sp5;it5++){var upd={};
        for(kk5 in BN){var nb5=BN[kk5];if(nb5.length!==2)continue;var v5=V[+kk5],n1=V[nb5[0]],n2=V[nb5[1]];
          upd[kk5]=[0.5*v5[0]+0.25*(n1[0]+n2[0]),0.5*v5[1]+0.25*(n1[1]+n2[1]),0.5*v5[2]+0.25*(n1[2]+n2[2])];}
        for(kk5 in upd){var vv5=V[+kk5],u5=upd[kk5];vv5[0]=u5[0];vv5[1]=u5[1];vv5[2]=u5[2];}}
      for(kk5 in BN){var v6=V[+kk5];                       // re-projektion (gleiche snap-logik, nur boundary-verts)
        for(var pc6=0;pc6<planeCuts.length;pc6++){var cu6=planeCuts[pc6];
          if(cu6.type=='plane3'){var sd6=v6[0]*cu6.nx+v6[1]*cu6.ny+v6[2]*cu6.nz-cu6.d,ks6=-sd6*cu6.side;
            if(ks6>=-SN&&ks6<SN){if(cu6.lr){var ax6=v6[0]-cu6.lp[0],ay6=v6[1]-cu6.lp[1],az6=v6[2]-cu6.lp[2],dt6=ax6*cu6.ld[0]+ay6*cu6.ld[1]+az6*cu6.ld[2];if(cu6.ray&&dt6*cu6.ray<0)continue;var ex6=ax6-dt6*cu6.ld[0],ey6=ay6-dt6*cu6.ld[1],ez6=az6-dt6*cu6.ld[2];if(ex6*ex6+ey6*ey6+ez6*ez6>=cu6.lr*cu6.lr)continue;}
              v6[0]-=sd6*cu6.nx;v6[1]-=sd6*cu6.ny;v6[2]-=sd6*cu6.nz;}}
          else{var cc6=cu6.axis==0?v6[0]:cu6.axis==1?v6[1]:v6[2],ks7=(cu6.val-cc6)*(cu6.dir>0?1:-1);
            if(ks7>=-SN&&ks7<SN){if(cu6.axis==0)v6[0]=cu6.val;else if(cu6.axis==1)v6[1]=cu6.val;else v6[2]=cu6.val;}}}
        for(var cy6=0;cy6<cylCuts.length;cy6++){var cu7=cylCuts[cy6];
          if(v6[1]<=cu7.ymin-SN)continue;var dx7=v6[0]-cu7.cx,dz7=v6[2]-cu7.cz,d7=Math.hypot(dx7,dz7);
          if(d7>1e-6&&Math.abs(d7-cu7.r)<SN){var s7=cu7.r/d7;v6[0]=cu7.cx+dx7*s7;v6[2]=cu7.cz+dz7*s7;}}}})();}
  (function(){var F=sn.faces,nF=F.length;if(!nF)return;var par=new Array(sn.verts.length);   // KOMPONENTEN-FILTER: nur groesste flaeche bleibt
    function find(a){while(par[a]!==a)a=par[a]=par[par[a]];return a;}
    for(var i=0;i<par.length;i++)par[i]=i;
    for(i=0;i<nF;i++){var f=F[i],r0=find(f[0]),r1=find(f[1]),r2=find(f[2]);if(r1!==r0)par[r1]=r0;if(find(f[2])!==r0)par[find(f[2])]=r0;}
    var cnt={},best=-1,bid=-1;
    for(i=0;i<nF;i++){var r=find(F[i][0]);cnt[r]=(cnt[r]||0)+1;}
    for(var k in cnt)if(cnt[k]>best){best=cnt[k];bid=+k;}
    if(best<nF){var kept=[];for(i=0;i<nF;i++)if(find(F[i][0])===bid)kept.push(F[i]);sn.faces=kept;}})();
  (function(){var F=sn.faces,V=sn.verts,nF=F.length;if(!nF)return;var em={},i,e;   // ORIENTIERUNG: BFS-konsistenz + outward-vote (FrontSide-korrekt, kein DoubleSide-pflaster)
    function ek(a,b){return a<b?a+'_'+b:b+'_'+a;}
    for(i=0;i<nF;i++){var f=F[i];for(e=0;e<3;e++){var k=ek(f[e],f[(e+1)%3]);(em[k]||(em[k]=[])).push(i);}}
    var vis=new Uint8Array(nF),st=[0];vis[0]=1;
    while(st.length){var fi=st.pop(),f=F[fi];
      for(e=0;e<3;e++){var a=f[e],b=f[(e+1)%3],lst=em[ek(a,b)];
        for(var q=0;q<lst.length;q++){var nj=lst[q];if(nj===fi||vis[nj])continue;
          var g=F[nj],same=false;
          for(var e2=0;e2<3;e2++){if(g[e2]===a&&g[(e2+1)%3]===b){same=true;break;}}
          if(same){var t=g[1];g[1]=g[2];g[2]=t;}
          vis[nj]=1;st.push(nj);}}}
    var cx=0,cy=0,cz=0;for(i=0;i<V.length;i++){cx+=V[i][0];cy+=V[i][1];cz+=V[i][2];}cx/=V.length;cy/=V.length;cz/=V.length;
    var s=0;
    for(i=0;i<nF;i++){var f2=F[i],A=V[f2[0]],B=V[f2[1]],C=V[f2[2]];
      var nx=(B[1]-A[1])*(C[2]-A[2])-(B[2]-A[2])*(C[1]-A[1]),ny=(B[2]-A[2])*(C[0]-A[0])-(B[0]-A[0])*(C[2]-A[2]),nz=(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]);
      s+=nx*((A[0]+B[0]+C[0])/3-cx)+ny*((A[1]+B[1]+C[1])/3-cy)+nz*((A[2]+B[2]+C[2])/3-cz);}
    if(s<0)for(i=0;i<nF;i++){var f3=F[i],t2=f3[1];f3[1]=f3[2];f3[2]=t2;}})();
  (function(){var F=sn.faces,V=sn.verts,EC={},adj={},i,k;   // ORIENTIERUNGS-FLOODFILL (industrie-repair):
    function ek(a,b){return a<b?a+'_'+b:b+'_'+a;}            // der globale mehrheits-vote liess REGIONEN hinter bowtie-kanten
    for(i=0;i<F.length;i++){var f=F[i];                      // falsch gewickelt (harness: 58% der linken wange einwaerts=UNSICHTBAR).
      for(var q=0;q<3;q++){k=ek(f[q],f[(q+1)%3]);EC[k]=(EC[k]||0)+1;(adj[k]||(adj[k]=[])).push(i);}}
    var comp=new Int32Array(F.length);for(i=0;i<F.length;i++)comp[i]=-1;
    var flip=new Uint8Array(F.length),cid=0;
    function hasDirEdge(g,a,b){for(var q=0;q<3;q++)if(g[q]===a&&g[(q+1)%3]===b)return true;return false;}
    for(var s0=0;s0<F.length;s0++){if(comp[s0]>=0)continue;
      var stack=[s0];comp[s0]=cid;
      while(stack.length){var fi=stack.pop(),f2=F[fi];
        for(var q2=0;q2<3;q2++){var a=f2[q2],b=f2[(q2+1)%3],kk=ek(a,b);
          if(EC[kk]!==2)continue;                            // nonman-/rand-kanten nicht traversieren
          var L=adj[kk];
          for(var w=0;w<L.length;w++){var nj=L[w];if(nj===fi||comp[nj]>=0)continue;
            comp[nj]=cid;
            var fa=flip[fi]?b:a,fb=flip[fi]?a:b;             // effektive laufrichtung von fi auf dieser kante
            flip[nj]=hasDirEdge(F[nj],fa,fb)?1:0;            // nachbar laeuft GLEICH -> flippen (konsistenz = gegenlaeufig)
            stack.push(nj);}}}
      cid++;}
    var cN=cid,ccx=new Float64Array(cN),ccy=new Float64Array(cN),ccz=new Float64Array(cN),ccn=new Float64Array(cN);
    for(i=0;i<F.length;i++){var f3=F[i],c9=comp[i];
      for(var q3=0;q3<3;q3++){var v=V[f3[q3]];ccx[c9]+=v[0];ccy[c9]+=v[1];ccz[c9]+=v[2];ccn[c9]++;}}
    var vote=new Float64Array(cN);
    for(i=0;i<F.length;i++){var f4=F[i],c8=comp[i],A=V[f4[0]],B=V[f4[1]],C=V[f4[2]];
      var ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
      var nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
      if(flip[i]){nx=-nx;ny=-ny;nz=-nz;}
      var mx=(A[0]+B[0]+C[0])/3-ccx[c8]/ccn[c8],my=(A[1]+B[1]+C[1])/3-ccy[c8]/ccn[c8],mz=(A[2]+B[2]+C[2])/3-ccz[c8]/ccn[c8];
      vote[c8]+=nx*mx+ny*my+nz*mz;}
    for(i=0;i<F.length;i++){var doF=flip[i]^(vote[comp[i]]<0?1:0);
      if(doF){var t=F[i][1];F[i][1]=F[i][2];F[i][2]=t;}}
  })();
  if(_shellKind==='top'||_shellKind==='bottom'||_shellKind==='shoe')(function(){   // SAUM-KREIS-FIT: gliedmassen-oeffnungen (aermel/cuff/schuhkragen) werden ECHTE runde saeume
    var V=sn.verts,F=sn.faces,EC9={},i9,k9;                                        // (voxel-zacken raus); torso-saeume (radius>0.62) bleiben elliptisch/drapiert
    for(i9=0;i9<F.length;i9++){var f9=F[i9],ee9=[[f9[0],f9[1]],[f9[1],f9[2]],[f9[2],f9[0]]];
      for(var q9=0;q9<3;q9++){k9=ee9[q9][0]<ee9[q9][1]?ee9[q9][0]+'_'+ee9[q9][1]:ee9[q9][1]+'_'+ee9[q9][0];EC9[k9]=(EC9[k9]||0)+1;}}
    var adj9={},seen9={};
    for(k9 in EC9)if(EC9[k9]===1){var pq9=k9.split('_'),a9=+pq9[0],b9=+pq9[1];(adj9[a9]||(adj9[a9]=[])).push(b9);(adj9[b9]||(adj9[b9]=[])).push(a9);}
    var loops9=[];
    for(k9 in adj9){if(seen9[k9])continue;var lp9=[+k9];seen9[k9]=1;var cur9=+k9,prev9=-1;
      while(true){var nx9=null,nb9=adj9[cur9];for(var q8=0;q8<nb9.length;q8++){if(nb9[q8]!==prev9&&!seen9[nb9[q8]]){nx9=nb9[q8];break;}}
        if(nx9===null)break;prev9=cur9;cur9=nx9;seen9[cur9]=1;lp9.push(cur9);}
      if(lp9.length>=8)loops9.push(lp9);}
    for(var li9=0;li9<loops9.length;li9++){var L9=loops9[li9],n9=L9.length,cx9=0,cy9=0,cz9=0;
      for(i9=0;i9<n9;i9++){var v9=V[L9[i9]];cx9+=v9[0];cy9+=v9[1];cz9+=v9[2];}cx9/=n9;cy9/=n9;cz9/=n9;
      var nxs=0,nys=0,nzs=0;                                                       // newell-normale des saum-polygons
      for(i9=0;i9<n9;i9++){var p1=V[L9[i9]],p2=V[L9[(i9+1)%n9]];
        nxs+=(p1[1]-p2[1])*(p1[2]+p2[2]);nys+=(p1[2]-p2[2])*(p1[0]+p2[0]);nzs+=(p1[0]-p2[0])*(p1[1]+p2[1]);}
      var nl9=Math.hypot(nxs,nys,nzs);if(nl9<1e-9)continue;nxs/=nl9;nys/=nl9;nzs/=nl9;
      var hx9=0,hy9=1,hz9=0;if(Math.abs(nys)>0.9){hx9=1;hy9=0;}
      var ux9=nys*hz9-nzs*hy9,uy9=nzs*hx9-nxs*hz9,uz9=nxs*hy9-nys*hx9,ul9=Math.hypot(ux9,uy9,uz9)||1;ux9/=ul9;uy9/=ul9;uz9/=ul9;
      var wx9=nys*uz9-nzs*uy9,wy9=nzs*ux9-nxs*uz9,wz9=nxs*uy9-nys*ux9;
      var rm9=0,rs9=[],hs9=[];
      for(i9=0;i9<n9;i9++){var v8=V[L9[i9]],dx8=v8[0]-cx9,dy8=v8[1]-cy9,dz8=v8[2]-cz9;
        var pu8=dx8*ux9+dy8*uy9+dz8*uz9,pw8=dx8*wx9+dy8*wy9+dz8*wz9,pn8=dx8*nxs+dy8*nys+dz8*nzs;
        var r8=Math.hypot(pu8,pw8);rs9.push(r8);hs9.push(pn8);rm9+=r8;}
      rm9/=n9;if(rm9<1e-4||rm9>0.62)continue;
      var vr9=0,vh9=0;for(i9=0;i9<n9;i9++){vr9+=(rs9[i9]-rm9)*(rs9[i9]-rm9);vh9+=hs9[i9]*hs9[i9];}
      vr9=Math.sqrt(vr9/n9);vh9=Math.sqrt(vh9/n9);
      if(vr9/rm9>0.45||vh9>0.22)continue;                                          // zu elliptisch / nicht planar -> gehoert so (drapierter saum)
      for(i9=0;i9<n9;i9++){var v7=V[L9[i9]],dx7=v7[0]-cx9,dy7=v7[1]-cy9,dz7=v7[2]-cz9;
        var pu7=dx7*ux9+dy7*uy9+dz7*uz9,pw7=dx7*wx9+dy7*wy9+dz7*wz9,pn7=dx7*nxs+dy7*nys+dz7*nzs;
        var r7=Math.hypot(pu7,pw7)||1e-9,rt7=r7+(rm9-r7)*0.7,sc7=rt7/r7,hn7=pn7*0.45;
        v7[0]=cx9+(pu7*sc7)*ux9+(pw7*sc7)*wx9+hn7*nxs;
        v7[1]=cy9+(pu7*sc7)*uy9+(pw7*sc7)*wy9+hn7*nys;
        v7[2]=cz9+(pu7*sc7)*uz9+(pw7*sc7)*wz9+hn7*nzs;}}
  })();
  
  var _pin=(function(){var EC={},P=new Uint8Array(sn.verts.length);
    for(var i3=0;i3<sn.faces.length;i3++){var f3=sn.faces[i3];
      for(var e3=0;e3<3;e3++){var a3=f3[e3],b3=f3[(e3+1)%3],k3=a3<b3?a3+'_'+b3:b3+'_'+a3;EC[k3]=(EC[k3]||0)+1;}}
    for(var kk in EC)if(EC[kk]===1){var pq=kk.split('_');P[+pq[0]]=1;P[+pq[1]]=1;}
    return P;})();
  sn.verts=_taubin(sn.verts,sn.faces,7,0.5,-0.53,_pin);   // smooth sawtooth cut edges + faceting
  return sn;}
function _taubin(V,F,iters,lam,mu,pin){
  var nv=V.length,adj=new Array(nv),i,k;
  for(i=0;i<nv;i++)adj[i]={};
  for(var f=0;f<F.length;f++){var a=F[f][0],b=F[f][1],c=F[f][2];
    adj[a][b]=1;adj[a][c]=1;adj[b][a]=1;adj[b][c]=1;adj[c][a]=1;adj[c][b]=1;}
  var nbr=new Array(nv);for(i=0;i<nv;i++)nbr[i]=Object.keys(adj[i]).map(Number);
  var P=new Float32Array(nv*3);for(i=0;i<nv;i++){P[i*3]=V[i][0];P[i*3+1]=V[i][1];P[i*3+2]=V[i][2];}
  var Q=new Float32Array(nv*3);
  for(var it=0;it<iters;it++){var s=(it%2===0)?lam:mu;
    for(i=0;i<nv;i++){var A=nbr[i],n=A.length;
      if((pin&&pin[i])||!n){Q[i*3]=P[i*3];Q[i*3+1]=P[i*3+1];Q[i*3+2]=P[i*3+2];continue;}
      var ax=0,ay=0,az=0;for(k=0;k<n;k++){var j=A[k];ax+=P[j*3];ay+=P[j*3+1];az+=P[j*3+2];}
      ax/=n;ay/=n;az/=n;
      Q[i*3]=P[i*3]+s*(ax-P[i*3]);Q[i*3+1]=P[i*3+1]+s*(ay-P[i*3+1]);Q[i*3+2]=P[i*3+2]+s*(az-P[i*3+2]);}
    var t=P;P=Q;Q=t;}
  var out=new Array(nv);for(i=0;i<nv;i++)out[i]=[P[i*3],P[i*3+1],P[i*3+2]];return out;}
function addShellGarment(sn,mat){
  var V=sn.verts,F=sn.faces,pos=new Float32Array(V.length*3),i;
  for(i=0;i<V.length;i++){pos[i*3]=V[i][0];pos[i*3+1]=V[i][1];pos[i*3+2]=V[i][2];}
  var idx=new Uint32Array(F.length*3);
  for(i=0;i<F.length;i++){idx[i*3]=F[i][0];idx[i*3+1]=F[i][1];idx[i*3+2]=F[i][2];}
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
  return addGarment(character,g,mat);
}
function _neckAxis(pts){var ncx=0,ncz=0,nn=0;
  for(var q=0;q<pts.length;q++)if(Math.abs(pts[q][1]-((typeof LM!=='undefined'&&LM)?LM.collarY+0.12:acromionY+0.14))<0.25){ncx+=pts[q][0];ncz+=pts[q][2];nn++;}
  return nn?[ncx/nn,ncz/nn]:[0,0];}

// ===== garment skinning: bake once in a spread pose, follow bones via weighted LBS =====
var _skins=[];  // {geo, infl:[ [ [boneNode,w,lx,ly,lz], ... ] per vertex ]}
function _addSkinned(sn,mat,infl,isSkin){
  var V=sn.verts,F=sn.faces,pos=new Float32Array(V.length*3),i;
  for(i=0;i<V.length;i++){pos[i*3]=V[i][0];pos[i*3+1]=V[i][1];pos[i*3+2]=V[i][2];}
  var idx=new Uint32Array(F.length*3);
  for(i=0;i<F.length;i++){idx[i*3]=F[i][0];idx[i*3+1]=F[i][1];idx[i*3+2]=F[i][2];}
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
  var _gm=addGarment(character,g,mat);if(isSkin){_gm.userData.isGarment=false;_gm.userData.isSkinShell=true;}_skins.push({geo:g,infl:infl,isSkin:!!isSkin,kind:(typeof _shellKind!=='undefined'?_shellKind:null)});return g;}
var _skTmp=new THREE.Vector3();
function updateSkin(skipN){
  if(!_skins.length)return;
  character.updateMatrixWorld(true);
  var ciM=new THREE.Matrix4().copy(character.matrixWorld).invert(),ci=ciM.elements;
  for(var s=0;s<_skins.length;s++){var sk=_skins[s],pos=sk.geo.attributes.position,arr=pos.array,INF=sk.infl;
    for(var i=0;i<INF.length;i++){var inf=INF[i],x=0,y=0,z=0;
      for(var b=0;b<inf.length;b++){var e=inf[b],m=e[0].matrixWorld.elements,w=e[1],lx=e[2],ly=e[3],lz=e[4];
        x+=w*(m[0]*lx+m[4]*ly+m[8]*lz+m[12]);
        y+=w*(m[1]*lx+m[5]*ly+m[9]*lz+m[13]);
        z+=w*(m[2]*lx+m[6]*ly+m[10]*lz+m[14]);}
      arr[i*3]=ci[0]*x+ci[4]*y+ci[8]*z+ci[12];
      arr[i*3+1]=ci[1]*x+ci[5]*y+ci[9]*z+ci[13];
      arr[i*3+2]=ci[2]*x+ci[6]*y+ci[10]*z+ci[14];}}
  if(_hemDyn&&!_romMeasure){                               // SAUM-DYNAMIK: verlet-traegheit + schwerkraft auf den saum-baendern
    var HD=Math.min(_lastDT,0.033),g9=-2.2*HD*HD,kst=0.30,dmp=0.80;   // (sims-kleidung ist starr geskinnt -- unsere saeume schwingen nach)
    for(var hq=0;hq<_hemDyn.length;hq++){var HB=_hemDyn[hq],pa2=HB.sk.geo.attributes.position.array,ix=HB.idx,st=HB.st;
      for(var m2=0;m2<ix.length;m2++){var j2=ix[m2],b6=m2*6;
        var tx=pa2[j2*3],ty=pa2[j2*3+1],tz=pa2[j2*3+2];
        var px=st[b6],py=st[b6+1],pz=st[b6+2],vx=(px-st[b6+3])*dmp,vy=(py-st[b6+4])*dmp+g9,vz=(pz-st[b6+5])*dmp;
        var nx=px+vx+(tx-px)*kst,ny=py+vy+(ty-py)*kst,nz=pz+vz+(tz-pz)*kst;
        var ox=nx-tx,oy=ny-ty,oz=nz-tz,ol=Math.sqrt(ox*ox+oy*oy+oz*oz);
        if(ol>0.055){var k9=0.055/ol;nx=tx+ox*k9;ny=ty+oy*k9;nz=tz+oz*k9;}   // leine: nie weiter als 0.055 vom LBS-ziel (klammern/ROM bleiben gueltig)
        st[b6+3]=px;st[b6+4]=py;st[b6+5]=pz;st[b6]=nx;st[b6+1]=ny;st[b6+2]=nz;
        pa2[j2*3]=nx;pa2[j2*3+1]=ny;pa2[j2*3+2]=nz;}}}
  if(_rtClamps.length){                                    // LAUFZEIT-KLAMMERN (proxy-kollision der profis, auf LBS-shells uebersetzt):
    var ap=_rtAnchorCache;ap.clear();                      // jeder gepaarte innen-vert wird JEDEN frame radial (um seinen bind-knoten)
    for(var q=0;q<_rtClamps.length;q++){var C=_rtClamps[q];// unter seinen stoff-partner-vert gedrueckt -> durchstoss ist geometrisch unmoeglich
      var c=ap.get(C.a);
      if(!c){_skTmp.setFromMatrixPosition(C.a.matrixWorld).applyMatrix4(ciM);c=[_skTmp.x,_skTmp.y,_skTmp.z];ap.set(C.a,c);}
      var sp2=C.s.geo.attributes.position.array,dp2=C.d.geo.attributes.position.array;
      var sx=sp2[C.i*3]-c[0],sy=sp2[C.i*3+1]-c[1],sz=sp2[C.i*3+2]-c[2];
      var gx=dp2[C.j*3]-c[0],gy=dp2[C.j*3+1]-c[1],gz=dp2[C.j*3+2]-c[2];
      var Ls=Math.sqrt(sx*sx+sy*sy+sz*sz),Lg=Math.sqrt(gx*gx+gy*gy+gz*gz),lim=Lg-C.m;
      if(lim>0.02&&Ls>lim&&Ls>1e-6){
        if(_romMeasure){_romCount++;var ex9=Ls-lim;if(ex9>_romMax)_romMax=ex9;}
        var kf=lim/Ls;
        sp2[C.i*3]=c[0]+sx*kf;sp2[C.i*3+1]=c[1]+sy*kf;sp2[C.i*3+2]=c[2]+sz*kf;}}}
  for(s=0;s<_skins.length;s++){var sk2=_skins[s];
    sk2.geo.attributes.position.needsUpdate=true;if(!skipN)sk2.geo.computeVertexNormals();}}
var _rtClamps=[],_rtAnchorCache=new Map();
var _romMeasure=false,_romCount=0,_romMax=0,_nrmAcc=9;var _hemDyn=null,_lastDT=1/60;
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

// Generic: generate the offset-surface shell in a SPREAD pose (so limbs don't fuse
// in the voxel union), then bind every vertex to nearby body-part bones with smooth
// inverse-distance weights, baked in each bone's local frame. updateSkin() then
// deforms via weighted LBS -> connected, no blob on pose, smooth across joints.
// Canonical bind pose: arms in A-pose, forearms/knees/spine straight, legs slightly
// spread. Generating here means limbs never fuse AND the bake is pose-independent
// (immune to whatever animation pose the body is in when buildOutfit fires).
var BIND_ARM=1.15, BIND_LEG=0.42;                   // Hampelmann bind pose: limbs spread clear of torso -> clean shell seams
function _bindPose(){
  var sv={arm:{},elb:{},hip:{},knee:{},ank:{},torso:null};
  ['1','-1'].forEach(function(sd){
    var aG=parts['arm'+sd],eG=parts['elbow'+sd],hG=parts['hip'+sd],kG=parts['knee'+sd],nG=parts['ankle'+sd];
    if(aG){sv.arm[sd]=[aG.rotation.z,aG.rotation.x];aG.rotation.z=(sd==='1'?1:-1)*BIND_ARM;aG.rotation.x=0;}
    if(eG){sv.elb[sd]=eG.rotation.x;eG.rotation.x=0;}
    if(hG){sv.hip[sd]=[hG.rotation.z,hG.rotation.x];hG.rotation.z=(sd==='1'?1:-1)*BIND_LEG;hG.rotation.x=0;}
    if(kG){sv.knee[sd]=kG.rotation.x;kG.rotation.x=0;}
    if(nG){sv.ank[sd]=nG.rotation.x;nG.rotation.x=0;}});
  if(parts.torso){sv.torso=[parts.torso.rotation.x,parts.torso.rotation.y,parts.torso.rotation.z];parts.torso.rotation.set(0,0,0);}
  ['chest','abs','ribcage','bicep1','bicep-1','quad1','quad-1'].forEach(function(nm){var m=parts[nm];if(m&&m.userData.baseScaleY!==undefined)m.scale.y=m.userData.baseScaleY;});
  if(parts.chest&&parts.chest.userData.baseScaleX!==undefined){parts.chest.scale.x=parts.chest.userData.baseScaleX;parts.chest.scale.z=parts.chest.userData.baseScaleZ;}
  return function(){
    ['1','-1'].forEach(function(sd){
      var aG=parts['arm'+sd],eG=parts['elbow'+sd],hG=parts['hip'+sd],kG=parts['knee'+sd],nG=parts['ankle'+sd];
      if(aG&&sv.arm[sd]){aG.rotation.z=sv.arm[sd][0];aG.rotation.x=sv.arm[sd][1];}
      if(eG&&sv.elb[sd]!==undefined)eG.rotation.x=sv.elb[sd];
      if(hG&&sv.hip[sd]){hG.rotation.z=sv.hip[sd][0];hG.rotation.x=sv.hip[sd][1];}
      if(kG&&sv.knee[sd]!==undefined)kG.rotation.x=sv.knee[sd];
      if(nG&&sv.ank[sd]!==undefined)nG.rotation.x=sv.ank[sd];});
    if(parts.torso&&sv.torso)parts.torso.rotation.set(sv.torso[0],sv.torso[1],sv.torso[2]);};
}
function _buildSkinnedShell(mat,incl,cut,cuts,spreadFn,boneFor,vox,sigma,level,clrMul,isSkin,wEps){
  var restore=_bindPose();                          // canonical bind pose (ignores spreadFn)
  character.updateMatrixWorld(true);
  var WT=collectWorldTagged(character);
  function pts(n){return rootLocal(vertsFor(WT,n));}
  function _densePts(names,spacing){                 // flaechen-dichte quellpunkte (dreiecks-supersampling) fuer feine gitter (vox<0.05):
    var set={},out=[],v0=new THREE.Vector3(),v1=new THREE.Vector3(),v2=new THREE.Vector3();   // part-verts allein sind bei 0.03 zu duenn -> geloecherte kruste, fill scheitert
    for(var q2=0;q2<names.length;q2++)set[names[q2]]=1;
    character.traverse(function(o){
      if(!o.isMesh||!o.geometry||o.userData.isGarment||o.userData.isSkinShell)return;
      var ow='',p=o;while(p){if(p.name){ow=p.name;break;}p=p.parent;}
      if(!set[ow])return;
      var pos=o.geometry.attributes.position,idx=o.geometry.index,M=o.matrixWorld;
      function tri(a,b,c){v0.fromBufferAttribute(pos,a).applyMatrix4(M);v1.fromBufferAttribute(pos,b).applyMatrix4(M);v2.fromBufferAttribute(pos,c).applyMatrix4(M);
        var e=Math.max(v0.distanceTo(v1),v1.distanceTo(v2),v2.distanceTo(v0)),n=Math.max(1,Math.ceil(e/spacing));
        for(var ii=0;ii<=n;ii++)for(var jj=0;jj<=n-ii;jj++){var u=ii/n,w=jj/n,s=1-u-w;
          out.push([v0.x*s+v1.x*u+v2.x*w,v0.y*s+v1.y*u+v2.y*w,v0.z*s+v1.z*u+v2.z*w]);}}
      if(idx){for(var f2=0;f2<idx.count;f2+=3)tri(idx.getX(f2),idx.getX(f2+1),idx.getX(f2+2));}
      else{for(var f3=0;f3<pos.count;f3+=3)tri(f3,f3+1,f3+2);}});
    return rootLocal(out);}
  var na=_neckAxis(pts(['neckBase','neckMain']));
  for(var q=0;q<cuts.length;q++){var cu=cuts[q];
    if(cu.type=='cyl'&&cu.auto){cu.cx=na[0];cu.cz=na[1];}
    if(cu.type=='armhem'||cu.type=='armhole'){          // resolve perpendicular-to-arm plane in bind pose
      var isHole=(cu.type=='armhole'),sd=cu.side,s=(sd==='1')?1:-1;
      var ref=isHole?pts(['deltoid'+sd]):pts(['bicep'+sd]);
      if(ref.length){var cx=0,cy=0,cz=0;for(var p=0;p<ref.length;p++){cx+=ref[p][0];cy+=ref[p][1];cz+=ref[p][2];}cx/=ref.length;cy/=ref.length;cz/=ref.length;
        var nx=Math.sin(s*BIND_ARM),ny=-Math.cos(BIND_ARM),nz=0,L=Math.hypot(nx,ny,nz);nx/=L;ny/=L;
        var f=isHole?-0.16:cu.frac;                     // armhole: shift up toward shoulder; armhem: down toward elbow
        var px=cx+nx*f,py=cy+ny*f,pz=cz+nz*f;
        cu.type='plane3';cu.nx=nx;cu.ny=ny;cu.nz=nz;cu.d=px*nx+py*ny+pz*nz;cu.side=isHole?-1:1;
        if(cu.flip)cu.side*=-1;                         // flip: KOERPER-seite faellt (hand-haut behaelt die hand)
        cu.lp=[px,py,pz];cu.ld=[nx,ny,nz];cu.ray=cu.flip?-1:1;   // ray: schlauch nur auf der DROP-seite der achse (flip kehrt die richtung: koerper-seite faellt -> rueckwaerts-strahl)
      }else{cu.type='plane3';cu.nx=0;cu.ny=1;cu.nz=0;cu.d=1e9;cu.side=1;}}
    if(cu.type=='sphere'&&cu.ref){                    // kugel-aussparung an mimik-ankern (augen/lippen) -- positionen in BIND aufgeloest
      var refs={eyeL:(typeof eyeL!=='undefined')?eyeL:null,eyeR:(typeof eyeR!=='undefined')?eyeR:null,
                lipU:(typeof upperLipRef!=='undefined')?upperLipRef:null,lipL:(typeof lowerLipRef!=='undefined')?lowerLipRef:null};
      var ro=refs[cu.ref];
      if(ro){var rw=new THREE.Vector3();ro.getWorldPosition(rw);var rl=rootLocal([[rw.x,rw.y,rw.z]])[0];cu.cx=rl[0];cu.cy=rl[1];cu.cz=rl[2]+(cu.dz||0);}   // dz: nach vorn versetzen, damit die kugel die hautflaeche DURCHSTOESST (sonst innen-blase -> komponenten-filter frisst sie)
      else cu.r=0;}
    if(cu.type=='leghem'){                            // ring SENKRECHT zur bein-achse (bake) -> horizontal in der stance ('winklig geschnittene' cuffs geheilt)
      var sd2=cu.side,hG2=parts['hip'+sd2],nG2=parts['ankle'+sd2];
      if(hG2&&nG2){var hW=new THREE.Vector3(),aW=new THREE.Vector3();
        hG2.getWorldPosition(hW);nG2.getWorldPosition(aW);
        var hp=rootLocal([[hW.x,hW.y,hW.z]])[0],ap2=rootLocal([[aW.x,aW.y,aW.z]])[0];
        var axv=[hp[0]-ap2[0],hp[1]-ap2[1],hp[2]-ap2[2]],LL=Math.hypot(axv[0],axv[1],axv[2]);
        axv[0]/=LL;axv[1]/=LL;axv[2]/=LL;
        var ankleStanceY=hp[1]-LL;                    // stance: bein vertikal unterm hueftgelenk (beinlaenge posen-invariant)
        var along=cu.val-ankleStanceY;                // cu.val = gewuenschte STANCE-hoehe des rings
        var p0=[ap2[0]+axv[0]*along,ap2[1]+axv[1]*along,ap2[2]+axv[2]*along];
        cu.type='plane3';cu.nx=axv[0];cu.ny=axv[1];cu.nz=axv[2];cu.d=p0[0]*axv[0]+p0[1]*axv[1]+p0[2]*axv[2];
        cu.side=-1;if(cu.flip)cu.side*=-1;cu.lp=p0;cu.ld=axv;   // side -1: fuss-seite faellt (flip: BEIN-seite faellt, fuer schuh-shells); lr lokalisiert auf DIESES bein
      }else{cu.type='plane3';cu.nx=0;cu.ny=1;cu.nz=0;cu.d=1e9;cu.side=1;}}}
  var sn=shellFromParts((vox<0.05||_shellKind==='skinBody')?_densePts(incl,vox*0.8):pts(incl),pts(cut),vox,sigma,level,cuts);   // BODY IMMER dense: der pts/vertsFor-pfad verlor die halssaeule (9-schichten-obduktion, siehe waechter)
  if(!isSkin)(function(){                              // HANG-WELLEN an haengenden saeumen (cloth-sculpting: hem ripples) -- der ballon-look stirbt hier
    var A=0.038,K=9,L=0.18,REACH=0.45,V=sn.verts,F=sn.faces,EC={},k;
    for(var f=0;f<F.length;f++){var f4=F[f],ee=[[f4[0],f4[1]],[f4[1],f4[2]],[f4[2],f4[0]]];
      for(var e=0;e<3;e++){var kk=ee[e][0]<ee[e][1]?ee[e][0]+'_'+ee[e][1]:ee[e][1]+'_'+ee[e][0];EC[kk]=(EC[kk]||0)+1;}}
    var adj={},bset={};
    for(k in EC)if(EC[k]===1){var pq=k.split('_'),a=+pq[0],b=+pq[1];(adj[a]||(adj[a]=[])).push(b);(adj[b]||(adj[b]=[])).push(a);bset[a]=1;bset[b]=1;}
    var seen={},loops=[];
    for(k in adj){if(seen[k])continue;var loop=[+k];seen[k]=1;var cur=+k,prev=-1;
      while(true){var nx2=null,nb=adj[cur];for(var q=0;q<nb.length;q++){if(nb[q]!==prev&&!seen[nb[q]]){nx2=nb[q];break;}}
        if(nx2===null)break;prev=cur;cur=nx2;seen[cur]=1;loop.push(cur);}
      if(loop.length>=10)loops.push(loop);}
    var ymid=0;for(var i=0;i<V.length;i++)ymid+=V[i][1];ymid/=V.length;
    // KOMPRESSIONS-RINGE: an geneigten oeffnungen (aermel: |ny|<0.985) quer-riffel LAENGS der achse
    for(var li0=0;li0<loops.length;li0++){var lp0=loops[li0],c0=[0,0,0];
      for(var q0=0;q0<lp0.length;q0++){c0[0]+=V[lp0[q0]][0];c0[1]+=V[lp0[q0]][1];c0[2]+=V[lp0[q0]][2];}
      c0[0]/=lp0.length;c0[1]/=lp0.length;c0[2]/=lp0.length;
      if(c0[1]>ymid||Math.abs(c0[0])<0.35)continue;      // nur AERMEL-oeffnungen (seitlich, unten)
      for(i=0;i<V.length;i++){var v0=V[i];
        var bd=1e9;for(q0=0;q0<lp0.length;q0++){var w0=V[lp0[q0]],dx0=v0[0]-w0[0],dy0=v0[1]-w0[1],dz0=v0[2]-w0[2],dd0=dx0*dx0+dy0*dy0+dz0*dz0;if(dd0<bd)bd=dd0;}
        bd=Math.sqrt(bd);if(bd>0.30)continue;
        var rx0=v0[0]-c0[0],rz0=v0[2]-c0[2],rl0=Math.hypot(rx0,rz0);if(rl0<1e-6)continue;
        if(bd<0.06)continue;var disp0=0.012*Math.sin((bd-0.06)*34.0)*Math.exp(-bd/0.22);   // ~2 ringe, KANTE bleibt frei (sonst zacken-kranz)
        v0[0]+=rx0/rl0*disp0;v0[2]+=rz0/rl0*disp0;}}
    for(var li=0;li<loops.length;li++){var lp=loops[li],c=[0,0,0];
      for(var q2=0;q2<lp.length;q2++){c[0]+=V[lp[q2]][0];c[1]+=V[lp[q2]][1];c[2]+=V[lp[q2]][2];}
      c[0]/=lp.length;c[1]/=lp.length;c[2]/=lp.length;
      if(c[1]>ymid)continue;                           // nur HAENGENDE kanten (saum/cuff/aermel), nicht kragen/bund
      var rloop=0;for(q2=0;q2<lp.length;q2++)rloop+=Math.hypot(V[lp[q2]][0]-c[0],V[lp[q2]][2]-c[2]);rloop/=lp.length;
      var Aeff=A*Math.min(1,rloop/0.65);               // amplitude skaliert mit ring-radius (kleine cuffs kriegen sanfte wellen, keine fetzen)
      var phase=li*1.7;
      for(i=0;i<V.length;i++){var v=V[i];
        var best=1e9;for(q2=0;q2<lp.length;q2++){var w=V[lp[q2]],dx=v[0]-w[0],dy=v[1]-w[1],dz=v[2]-w[2],dd=dx*dx+dy*dy+dz*dz;if(dd<best)best=dd;}
        var d=Math.sqrt(best);if(d>REACH)continue;
        var rx=v[0]-c[0],rz=v[2]-c[2],rl=Math.hypot(rx,rz);if(rl<1e-6)continue;
        var th=Math.atan2(rz,rx),disp=Aeff*Math.sin(K*th+phase)*Math.exp(-d/L);
        v[0]+=rx/rl*disp;v[2]+=rz/rl*disp;}}})();
  (function(){var vv=sn.verts,ff=sn.faces,vol9=0;                     // WINDING-WAECHTER: negatives volumen = invertiert (unsichtbar bei front-side) -> flippen
    for(var f9=0;f9<ff.length;f9++){var A9=vv[ff[f9][0]],B9=vv[ff[f9][1]],C9=vv[ff[f9][2]];
      vol9+=A9[0]*(B9[1]*C9[2]-B9[2]*C9[1])+A9[1]*(B9[2]*C9[0]-B9[0]*C9[2])+A9[2]*(B9[0]*C9[1]-B9[1]*C9[0]);}
    if(vol9<0)for(f9=0;f9<ff.length;f9++){var t9=ff[f9][1];ff[f9][1]=ff[f9][2];ff[f9][2]=t9;}})();
  var CLR=parseFloat((typeof process!=='undefined'&&process.env&&process.env.CLR)||'0.02')*(clrMul===undefined?1:clrMul);  // klein: nesting+gemeinsame bindung tragen; 0.055 blaehte  // STOFF-CLEARANCE: LBS schneidet bei tiefer beugung kurven -> shell nach aussen
  if(CLR>0)(function(){var n=sn.verts.length,VN=new Float64Array(n*3),cx=0,cy=0,cz=0,i2;
    for(i2=0;i2<n;i2++){var v=sn.verts[i2];cx+=v[0];cy+=v[1];cz+=v[2];}cx/=n;cy/=n;cz/=n;
    for(i2=0;i2<sn.faces.length;i2++){var f=sn.faces[i2],a=sn.verts[f[0]],b=sn.verts[f[1]],c=sn.verts[f[2]];
      var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      var nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
      VN[f[0]*3]+=nx;VN[f[0]*3+1]+=ny;VN[f[0]*3+2]+=nz;VN[f[1]*3]+=nx;VN[f[1]*3+1]+=ny;VN[f[1]*3+2]+=nz;VN[f[2]*3]+=nx;VN[f[2]*3+1]+=ny;VN[f[2]*3+2]+=nz;}
    var vote=0;                                                                        // orientierung pro SHELL (mehrheitsvotum), NIE pro vertex:
    for(i2=0;i2<n;i2++){var v=sn.verts[i2];vote+=(VN[i2*3]*(v[0]-cx)+VN[i2*3+1]*(v[1]-cy)+VN[i2*3+2]*(v[2]-cz))>0?1:-1;}
    var flip=vote<0?-1:1;                                                              // per-vertex-flip drueckte innenschenkel-waende ineinander (backface-splitter)
    var EC={},BND=new Uint8Array(n);                                                    // RAENDER UNANTASTBAR: kragen-rim/saum/aermel nie pushen
    for(i2=0;i2<sn.faces.length;i2++){var f2=sn.faces[i2];
      for(var e2=0;e2<3;e2++){var a2=f2[e2],b2=f2[(e2+1)%3],k2=a2<b2?a2+'_'+b2:b2+'_'+a2;EC[k2]=(EC[k2]||0)+1;}}
    for(var k3 in EC)if(EC[k3]===1){var pq=k3.split('_');BND[+pq[0]]=1;BND[+pq[1]]=1;}
    for(i2=0;i2<n;i2++){if(BND[i2])continue;
      var v=sn.verts[i2],nx=VN[i2*3]*flip,ny=VN[i2*3+1]*flip,nz=VN[i2*3+2]*flip,L=Math.hypot(nx,ny,nz)||1;
      v[0]+=nx/L*CLR;v[1]+=ny/L*CLR;v[2]+=nz/L*CLR;}})();
  // Bind each vertex to its nearest body PARTS (not bone groups). Each part's
  // matrixWorld carries BOTH its bone rotation AND its live scale, so the garment
  // follows muscle flex / breathing (no poke) and tracks the real surface across
  // joints. Top-K inverse-distance weights -> smooth blend, no tearing.
  var iNodes=[];
  for(var ci=0;ci<incl.length;ci++){var nm=incl[ci],nd=parts[nm],P=pts([nm]);if(!nd||!P.length)continue;
    var cx=0,cy=0,cz=0;for(var p=0;p<P.length;p++){cx+=P[p][0];cy+=P[p][1];cz+=P[p][2];}cx/=P.length;cy/=P.length;cz/=P.length;
    iNodes.push({node:nd,c:[cx,cy,cz]});}
  var charM=character.matrixWorld,invB=new Map();
  function invOf(nd){var m=invB.get(nd);if(!m){m=new THREE.Matrix4().copy(nd.matrixWorld).invert();invB.set(nd,m);}return m;}
  var infl=[],wv=new THREE.Vector3(),e=(wEps||0.04);   // kleines eps (haende): benachbarte finger-knoten schmieren nicht
  for(var vi=0;vi<sn.verts.length;vi++){var v=sn.verts[vi];
    var ws=[],sum=0;
    for(var ni=0;ni<iNodes.length;ni++){var c=iNodes[ni].c,dx=v[0]-c[0],dy=v[1]-c[1],dz=v[2]-c[2],d2=dx*dx+dy*dy+dz*dz,w=1/((d2+e)*(d2+e));ws.push(w);sum+=w;}
    var kept=[],ks=0;                                // 1/d^4 falloff -> only nearest parts survive the cut
    for(var ni=0;ni<iNodes.length;ni++){var w=ws[ni]/sum;if(w>0.06){kept.push([ni,w]);ks+=w;}}
    wv.set(v[0],v[1],v[2]).applyMatrix4(charM);
    var inf=[];
    for(var ki=0;ki<kept.length;ki++){var nd=iNodes[kept[ki][0]].node,w=kept[ki][1]/ks;
      _skTmp.copy(wv).applyMatrix4(invOf(nd));inf.push([nd,w,_skTmp.x,_skTmp.y,_skTmp.z]);}
    infl.push(inf);}
  _addSkinned(sn,mat,infl,isSkin);
  if(_USE_SDF&&isSkin&&_shellKind&&typeof _SDF_K!=='undefined'&&_SDF_K[_shellKind]!==undefined){var _pl=_sdfPolish(_skins[_skins.length-1],incl,_shellKind);_tuckStats.sdf=(_tuckStats.sdf||0)+_pl;}
  restore();character.updateMatrixWorld(true);
}

function buildTop(style,colorKey){if(style==='none')return;
  var hex=(CLOTH_COLORS[colorKey]||CLOTH_COLORS.navy).hex;
  var mat=(style==='pullover')?getCloth(hex,0.92,0.28,lighten(hex,0.08),'knit')
         :(style==='tank')?getCloth(hex,0.82,0.08,lighten(hex,0.05),'cotton')
         :(style==='poncho')?getCloth(hex,0.88,0.18,lighten(hex,0.07),'wool')
         :getCloth(hex,0.85,0.11,lighten(hex,0.06),'cotton');
  var torsoCore=['ribcage','waist','chest','abs','upperBack','pec1','pec-1','oblique1','oblique-1',
    'lat1','lat-1','breast1','breast-1','neckBase','neckMain','scm1','scm-1'];   // tneck RAUS (blaehte den nacken des tops zum buckel auf); pelvis/glutes RAUS: top folgt torso komplett; scm/tneck fuellen den kragen anatomisch
  var incl=torsoCore.slice().concat(['trap1','trap-1','deltoid1','deltoid-1','pelvis','glute1','glute-1']);   // pelvis/glute ZURUECK: hueftbreite+gemeinsame bindung im band (nesting bei slim/female!); hemY-plane carvt drunter, haut-klammer sichert durchstoss
  if(style==='pullover')incl=incl.concat(['bicep1','bicep-1','tricep1','tricep-1','uarm1','uarm-1','forearm1','forearm-1','elbow1','elbow-1']);
  else if(style==='tshirt'||style==='poncho')incl=incl.concat(['bicep1','bicep-1','tricep1','tricep-1','uarm1','uarm-1']);
  var cut=['head','jaw','chin','buccal1','buccal-1','cheekbone1','cheekbone-1','masseter1','masseter-1'];   // adamsApple/nape/neckTop RAUS: cyl definiert den kragen allein
  ['1','-1'].forEach(function(hsd){cut.push('palm'+hsd,'tA_'+hsd,'tB_'+hsd);for(var hfi=0;hfi<4;hfi++)cut.push('fA'+hfi+'_'+hsd,'fB'+hfi+'_'+hsd,'fC'+hfi+'_'+hsd);});   // hand-cluster ist jetzt fein benannt
  var hemY=(style==='poncho')?LM.waistY-1.35:LM.waistY-0.30;             // saum TAILLEN-relativ (landmarke): ueberlappt den hosenbund bei jedem koerper (untucked, deckt po)
  var cuts=[{axis:1,dir:-1,val:hemY},{type:'cyl',auto:true,r:(style==='poncho')?0.40:Math.max(0.26,LM.neckR*1.9),ymin:LM.collarY+0.12}];
  if(style==='tshirt'){cuts.push({type:'armhem',side:'1',frac:0.34,lr:0.55});cuts.push({type:'armhem',side:'-1',frac:0.34,lr:0.55});}
  if(false&&style==='poncho'){cuts.push({type:'armhem',side:'1',frac:0.30});cuts.push({type:'armhem',side:'-1',frac:0.30});}                  // wide cut -> open draping poncho
  var armBase={deltoid:1,bicep:1,tricep:1,uarm:1},foreBase={forearm:1,elbow:1};
  function spread(){return function(){};}
  function boneFor(nm){var sd=/-1$/.test(nm)?'-1':(/1$/.test(nm)?'1':null),b=nm.replace(/(1|-1)$/,'');
    if(foreBase[b]&&sd&&parts['elbow'+sd])return parts['elbow'+sd];
    if(armBase[b]&&sd&&parts['arm'+sd])return parts['arm'+sd];
    return parts.torso;}
  if(_USE_HUELLE&&style!=='poncho'&&_garmentFromSkin('top',incl.concat(['waist','elbow1','elbow-1']),['neckBase','neckMain','neckTop','scm1','scm-1','napeFill1','napeFill2'],0.032,mat))return;   // HUELLEN-EXTRUSION (poncho: legacy-drape)
  _shellKind='top';_buildSkinnedShell(mat,incl,cut,cuts,spread,boneFor,0.06,1.5,0.54);_shellKind=null;     // (over pants)
}
function buildBottom(style,colorKey){if(style==='none')return;
  var hex=(CLOTH_COLORS[colorKey]||CLOTH_COLORS.charcoal).hex;
  var mat=(style==='pants')?getCloth(hex,0.82,0.06,lighten(hex,0.05),'denim')
                           :getCloth(hex,0.85,0.08,lighten(hex,0.05),'cotton');
  var troch=trochanterY;
  var incl=['pelvis','glute1','glute-1','quad1','quad-1','hamstring1','hamstring-1',
    'adduct1','adduct-1','vlat1','vlat-1','kneecap1','kneecap-1','waist'];   // WAIST dazu: high-rise -- die hose reicht garantiert UNTER jeden top-saum (keine haut-luecke an der huefte)
  if(style==='pants')incl=incl.concat(['calf1','calf-1','shin1','shin-1']);
  var cut=['foot1','foot-1','toe1','toe-1','heel1','heel-1'];          // ankle NICHT schneiden: cuff reicht ueber den knoechel
  var cuts=[{axis:1,dir:1,val:troch+0.90}];                                                                                          // high-rise bund: deckt midriff auch bei vollem torso-pitch
  var ankPts2=rootLocal(vertsFor(_outfitWT,['ankle1','ankle-1'])),aT2=0.30;
  for(var q2=0;q2<ankPts2.length;q2++)if(ankPts2[q2][1]>aT2)aT2=ankPts2[q2][1];
  var cuffV=(params.shoes==='boot')?aT2+0.56:(params.shoes==='sneaker')?aT2+0.06:aT2+0.04;   // cuff KNOECHEL-relativ (landmarke), nicht absolut
  cuts.push({type:'leghem',side:'1',val:cuffV,lr:0.62});cuts.push({type:'leghem',side:'-1',val:cuffV,lr:0.62});   // ring senkrecht zum bein statt globaler y-ebene (bake-spreizung kippte 23°)
  if(style!=='pants'){cuts.push({type:'leghem',side:'1',val:LM.kneeY+0.28,lr:0.62});cuts.push({type:'leghem',side:'-1',val:LM.kneeY+0.28,lr:0.62});}
  var thighB={quad:1,hamstring:1,vlat:1,adduct:1,kneecap:1},shankB={calf:1,shin:1};
  // spread the legs so the inner thighs don't fuse in the voxel union, then bind
  // thigh verts to hipG and shank verts to kneeG; pelvis/glute stay on character.
  function spread(){var sv={};['1','-1'].forEach(function(sd){var hG=parts['hip'+sd];if(hG){sv[sd]=hG.rotation.z;hG.rotation.z=(sd==='1'?1:-1)*0.26;}});
    return function(){['1','-1'].forEach(function(sd){var hG=parts['hip'+sd];if(hG&&sv[sd]!==undefined)hG.rotation.z=sv[sd];});};}
  function boneFor(nm){var sd=/-1$/.test(nm)?'-1':(/1$/.test(nm)?'1':null),b=nm.replace(/(1|-1)$/,'');
    if(thighB[b]&&sd&&parts['hip'+sd])return parts['hip'+sd];
    if(shankB[b]&&sd&&parts['knee'+sd])return parts['knee'+sd];
    return character;}
  if(_USE_HUELLE&&_garmentFromSkin('bottom',incl,[],0.024,mat))return;   // HUELLEN-EXTRUSION
  _shellKind='bottom';_buildSkinnedShell(mat,incl,cut,cuts,spread,boneFor,0.06,1.5,0.54);_shellKind=null;      // EINE feld-familie mit top+haut
  // (belt removed: it poked through the untucked shirt; a visible belt needs a tucked-shirt style)
}

function buildShoes(style,colorKey){
if(style==='none'){                                                   // BARFUSS: fuss-haut-shell (wie hand-haut) statt sichtbarem kugel-cluster
  ['1','-1'].forEach(function(s2){_shellKind='skinFoot'+s2;
    _buildSkinnedShell(matSkin,['ankle'+s2],[],[{type:'leghem',side:s2,val:0.40,lr:0.9,flip:1}],function(){return function(){};},function(){return parts.torso;},0.020,1.15,0.52,0,true);
    _shellKind=null;});
  return;}
var hex=(CLOTH_COLORS[colorKey]||CLOTH_COLORS.white).hex;var soleMat=getCloth(0xe9e7e2,0.6,0,0,'rubber');var upMat=(style==='boot')?getCloth(hex,0.45,0,0,'leather'):getCloth(hex,0.55,0.05,lighten(hex,0.05),'cotton');var laceMat=getCloth(0x202020,0.5,0,0,'rubber');
['1','-1'].forEach(function(s){var akG=parts['ankle'+s];if(!akG)return;
addG(akG,cs(0.32,soleMat,[1.0,0.40,2.05],20),[0,-0.255,0.26]);                       // sohle bleibt primitiv (harte kante gewollt)
if(style==='boot'){addG(akG,ctube(0.23,0.28,0.6,upMat,20),[0,0.30,-0.02]);addG(akG,cs(0.25,upMat,[1.05,0.55,1.05],18),[0,0.58,-0.02]);}else{addG(akG,cs(0.13,upMat,[0.7,0.55,0.8],14),[0,0.03,0.18]);for(var k=0;k<3;k++){addG(akG,ctube(0.02,0.02,0.32,laceMat,8,false),[0,0.0-k*0.045,0.13+k*0.08],[0,0,Math.PI/2]);}}});
['1','-1'].forEach(function(s2){                                      // SCHUH-SHELL: EINE glatte obermaterial-form; der alte kugel-berg entfaellt (blob-toebox weg)
  var cutV=(style==='boot')?1.02:0.46;
  _shellKind='shoe';
  _buildSkinnedShell(upMat,['ankle'+s2],[],[{type:'leghem',side:s2,val:cutV,lr:0.9,flip:1}],function(){return function(){};},function(){return parts.torso;},0.028,1.35,0.42,0,true);
  _shellKind=null;});}
function buildBodySkin(){                                             // DIE EINE HAUT: ganzkoerper-shell, primitiven werden rig-interna
  var incl=['abs','adduct1','adduct-1','arm1','arm-1','bicep1','bicep-1','breast1','breast-1','calf1','calf-1','chest',
    'deltoid1','deltoid-1','elbow1','elbow-1','forearm1','forearm-1','glute1','glute-1','hamstring1','hamstring-1',
    'kneecap1','kneecap-1','lat1','lat-1','napeFill1','napeFill2','neckBase','neckMain','oblique1','oblique-1','pec1','pec-1','pelvis',
    'quad1','quad-1','ribcage','scm1','scm-1','shin1','shin-1','tneck1','tneck-1','torso','trap1','trap-1','tricep1','tricep-1','uarm1','uarm-1',
    'upperBack','vlat1','vlat-1','waist'];
  var headPts=rootLocal(vertsFor(_outfitWT,['chin','jaw'])),ankPts=rootLocal(vertsFor(_outfitWT,['ankle1','ankle-1']));
  var neckTop=1e9,ankTop=-1e9,i;
  for(i=0;i<headPts.length;i++)if(headPts[i][1]<neckTop)neckTop=headPts[i][1];
  for(i=0;i<ankPts.length;i++)if(ankPts[i][1]>ankTop)ankTop=ankPts[i][1];
  var chinCutY=neckTop+0.18;
  try{var cw9=new THREE.Vector3();parts.chin.getWorldPosition(cw9);
    cw9.applyMatrix4(new THREE.Matrix4().copy(character.matrixWorld).invert());
    chinCutY=cw9.y-0.04;}catch(e){}                       // BUG-WURZEL: min(chin/jaw)-splat reichte bis ~4.85 -> schnitt bei ~5.03 ENTHAUPTETE die halssaeule
  var cuts=[{type:'neckClamp',y0:LM.shoulderTopY,y1:chinCutY+0.06,cx:LM.neckCX,cz:LM.neckCZ,r:LM.neckR+0.045},{axis:1,dir:1,val:chinCutY},{axis:1,dir:-1,val:ankTop+0.02},   // hals-schnitt IM kopf-cluster: offener ring unsichtbar, uebergang geschlossen (michis 'kopf schwebt')
    {type:'armhem',side:'1',frac:LM.wristFrac+LM.wristOverlap,lr:1.2},{type:'armhem',side:'-1',frac:LM.wristFrac+LM.wristOverlap,lr:1.2}];
  _shellKind='skinBody';
  _buildSkinnedShell(matSkin,incl,[],cuts,function(){return function(){};},function(){return parts.torso;},0.06,1.7,0.66,0,true);
  (function(){var g=_skins[_skins.length-1].geo,pa=g.attributes.position.array,ia=g.index.array,u=new Uint8Array(pa.length/3),i,c=0;
    for(i=0;i<ia.length;i++)u[ia[i]]=1;
    for(i=0;i<pa.length/3;i++)if(u[i]){var _ry=Math.hypot(pa[i*3]-LM.neckCX,pa[i*3+2]-LM.neckCZ);if(pa[i*3+1]>LM.collarY&&pa[i*3+1]<LM.neckTopY-0.04&&_ry>LM.neckR*0.45&&_ry<LM.neckR+0.23)c++;}
    if(c<20)console.warn('HALS-WAECHTER: halssaeule fehlt/duenn (verts='+c+') -- primitive vs iso-level pruefen!');
    else console.log('HALS-OK verts='+c);})();            // permanenter regressions-waechter: duenne strukturen sterben lautlos am iso-level   // sigma 1.7 / level 0.66: HARNESS-KALIBRIERT -> offset 0.042 == schaedel/hand-shells (naht-spruenge weg)
  _shellKind=null;
}
function buildHandSkin(sd){                                           // HAND-HAUT v3: finger-SEGMENTE sind bind-knoten -> faust/spreizung/handdrehung animieren die shell,
  var hnd=parts['hand'+sd],saved=[];                                  // finger sind im shell getrennt (vox 0.022 + permanente ruhespreizung im rig)
  function zx(g){if(g&&g.rotation){saved.push([g,g.rotation.x]);g.rotation.x=0;}}
  if(hnd&&hnd.userData.fingers)hnd.userData.fingers.forEach(function(f){zx(f.mcp);zx(f.pip);zx(f.dip);});   // bake IMMER mit gestreckten fingern (rebuild waehrend faust!)
  if(hnd&&hnd.userData.thumbs)hnd.userData.thumbs.forEach(function(t){zx(t.mcp);zx(t.ip);});
  var savedPalm=null;if(hnd&&hnd.userData.palmG){savedPalm=hnd.userData.palmG.rotation.y;hnd.userData.palmG.rotation.y=0;}
  character.updateMatrixWorld(true);
  var incl=['palm'+sd,'tA_'+sd,'tB_'+sd,'forearm'+sd,'elbow'+sd];
  for(var fi=0;fi<4;fi++)incl.push('fA'+fi+'_'+sd,'fB'+fi+'_'+sd,'fC'+fi+'_'+sd);
  var cuts=[{type:'armhem',side:sd,frac:LM.wristFrac,lr:1.4,flip:1}];   // flip: koerper-seite faellt -> ueberlapp = LM.wristOverlap unter der koerperhaut (EIN vertrag)
  _shellClosing=1;_shellKind='skinHand'+sd;
  _buildSkinnedShell(matSkin,incl,[],cuts,function(){return function(){};},function(){return parts.torso;},0.019,1.1,0.50,0,true,0.006);
  _shellKind=null;_shellClosing=2;
  var rbp=_bindPose();character.updateMatrixWorld(true);   // messung IMMER in bind: haengender arm liesse sonst den oberschenkel in den mess-radius rutschen
  (function(){var sk=_skins[_skins.length-1];
    character.updateMatrixWorld(true);updateSkin(true);               // GELENK-RAMPE in konsistenter pose (positions+matrizen synchron!)
    var pa=sk.geo.attributes.position.array,n=pa.length/3,ia9=sk.geo.index.array;
    var ymax=-1e9;for(var i=0;i<ia9.length;i++){var yv9=pa[ia9[i]*3+1];if(yv9>ymax)ymax=yv9;}   // NUR referenzierte verts (verwaiste fragmente verfaelschen ymax!)
    var hp=new THREE.Vector3(),ep=new THREE.Vector3(),invC9=new THREE.Matrix4().copy(character.matrixWorld).invert();
    if(parts['hand'+sd])parts['hand'+sd].getWorldPosition(hp);hp.applyMatrix4(invC9);   // anker in CHARACTER-LOKAL (positions-frame!)
    if(parts['elbow'+sd])parts['elbow'+sd].getWorldPosition(ep);ep.applyMatrix4(invC9);
    var axx=ep.x-hp.x,axy=ep.y-hp.y,axz=ep.z-hp.z,al=Math.hypot(axx,axy,axz)||1;axx/=al;axy/=al;axz/=al;
    var tSum=0,tN=0,rH=0;                                             // ADAPTIVE RAMPE: hand-ring-radius vs koerperhaut-radius am schnitt MESSEN statt raten
    for(var i=0;i<n;i++){if(ymax-pa[i*3+1]>0.04)continue;
      var vx0=pa[i*3]-hp.x,vy0=pa[i*3+1]-hp.y,vz0=pa[i*3+2]-hp.z;
      var dt0=vx0*axx+vy0*axy+vz0*axz,rx0=vx0-dt0*axx,ry0=vy0-dt0*axy,rz0=vz0-dt0*axz;
      tSum+=dt0;rH+=Math.hypot(rx0,ry0,rz0);tN++;}
    var amp=0.035;
    if(tN>3){var tTop=tSum/tN;rH/=tN;var bo=_skinByKind('skinBody');
      if(bo){var bp=bo.geo.attributes.position.array,rB=0,bN=0;
        for(var bi=0;bi<bp.length/3;bi++){var vx1=bp[bi*3]-hp.x,vy1=bp[bi*3+1]-hp.y,vz1=bp[bi*3+2]-hp.z;
          var dt1=vx1*axx+vy1*axy+vz1*axz;if(dt1<tTop-0.04||dt1>tTop+0.18)continue;
          var rx1=vx1-dt1*axx,ry1=vy1-dt1*axy,rz1=vz1-dt1*axz,rr1=Math.hypot(rx1,ry1,rz1);
          if(rr1>0.30)continue;rB+=rr1;bN++;}
        if(bN>3)amp=Math.max(0,Math.min(0.09,rB/bN-rH));}}
    for(i=0;i<n;i++){var d=ymax-pa[i*3+1];if(d>0.26)continue;
      var w=amp*(1-d/0.26);                                           // linear auslaufende aufweitung: trifft die koerperhaut EXAKT
      var vx=pa[i*3]-hp.x,vy=pa[i*3+1]-hp.y,vz=pa[i*3+2]-hp.z;
      var dt=vx*axx+vy*axy+vz*axz,rx=vx-dt*axx,ry=vy-dt*axy,rz=vz-dt*axz,rl=Math.hypot(rx,ry,rz);
      if(rl<1e-6)continue;
      pa[i*3]+=rx/rl*w;pa[i*3+1]+=ry/rl*w;pa[i*3+2]+=rz/rl*w;}
    var infl=sk.infl,inv=new Map(),wv=new THREE.Vector3(),chM=character.matrixWorld;   // rest-daten exakt nachziehen
    for(i=0;i<n;i++){if(ymax-pa[i*3+1]>0.26)continue;
      wv.set(pa[i*3],pa[i*3+1],pa[i*3+2]).applyMatrix4(chM);
      var inf=infl[i];
      for(var b3=0;b3<inf.length;b3++){var nd=inf[b3][0],m3=inv.get(nd);
        if(!m3){m3=new THREE.Matrix4().copy(nd.matrixWorld).invert();inv.set(nd,m3);}
        _skTmp.copy(wv).applyMatrix4(m3);inf[b3][2]=_skTmp.x;inf[b3][3]=_skTmp.y;inf[b3][4]=_skTmp.z;}}
    })();
  rbp();character.updateMatrixWorld(true);
  saved.forEach(function(e){e[0].rotation.x=e[1];});
  if(savedPalm!==null&&hnd&&hnd.userData.palmG)hnd.userData.palmG.rotation.y=savedPalm;
}
function buildSkullSkin(){                                            // SCHAEDEL-SCHALE (B10-lehre: NIE die zuege ueberschalen!): glaettet NUR kalotte/schlaefen/hinterkopf/kieferbogen;
  var incl=['head','jaw','gonion1','gonion-1','masseter1','masseter-1','neckMain'];   // das gesicht (z>schnitt) bleibt komplett primitiv, mimik unberuehrt
  var zFront=0.125,yBot=5.10;                                         // schnitt-ebenen von schaedel- und gesichts-schale AUFEINANDER ausgerichtet (0.125/0.115 -> minimaler ueberlapp statt 0.02-wulst)
  try{var cw=new THREE.Vector3();parts.chin&&parts.chin.getWorldPosition(cw);yBot=cw.y-0.48;}catch(e){}
  var cuts=[{axis:2,dir:1,val:zFront},{axis:1,dir:-1,val:yBot}];
  _shellKind='skinSkull';
  _buildSkinnedShell(matSkin,incl,[],cuts,function(){return function(){};},function(){return parts.torso;},0.035,1.4,0.58,0,true);
  _shellKind=null;
}
function buildFaceSkin(){                                             // GESICHTS-SCHALE v2 (B10-obduktion eingebaut): NUR die zone vor z=0.11 (komplement der
  var incl=['noseBr','noseTip','noseA1','noseA-1','head','jaw','chin','buccal1','buccal-1','cheekbone1','cheekbone-1','masseter1','masseter-1','gonion1','gonion-1'];   // schaedel-schale), mimik-fenster ausgespart,
  var yBot=5.10;try{var cw=new THREE.Vector3();parts.chin&&parts.chin.getWorldPosition(cw);yBot=cw.y-0.34;}catch(e){}             // level 0.52 ENG (kein aufblaehen) -- glaettet die FUGEN zwischen den struktur-formen
  var cuts=[{axis:2,dir:-1,val:0.115},{axis:1,dir:-1,val:yBot},
    {type:'sphere',ref:'eyeL',r:0.145,dz:0.09},{type:'sphere',ref:'eyeR',r:0.145,dz:0.09},   // augen+lider+brauen primitiv (mimik!)
    {type:'sphere',ref:'lipU',r:0.105,dz:0.07},{type:'sphere',ref:'lipL',r:0.105,dz:0.07}];  // lippen (matLips) ragen aus der mulde
  _shellKind='skinFace';
  _buildSkinnedShell(matSkin,incl,[],cuts,function(){return function(){};},function(){return parts.torso;},0.024,1.9,0.36,0,true);
  _shellKind=null;
}
var HIDE_KEEP={'hair':1,'head':1,'jaw':1,'chin':1,'buccal1':1,'buccal-1':1,'cheekbone1':1,'cheekbone-1':1,'masseter1':1,'masseter-1':1,'gonion1':1,'gonion-1':1};
function _hideRigParts(){
  var keepC=[],KR=[0.21,0.21,0.15,0.15];                              // mimik-anker: augen (lider+brauen im radius), lippen
  [typeof eyeL!=='undefined'?eyeL:null,typeof eyeR!=='undefined'?eyeR:null,
   typeof upperLipRef!=='undefined'?upperLipRef:null,typeof lowerLipRef!=='undefined'?lowerLipRef:null].forEach(function(r){
    if(r){var w=new THREE.Vector3();r.getWorldPosition(w);keepC.push(w);}else keepC.push(null);});
  var mw=new THREE.Vector3();
  character.traverse(function(o){if(!o.isMesh||o.userData.isGarment||o.userData.isSkinShell)return;
  var ow='',p=o;while(p){if(p.name){ow=p.name;break;}p=p.parent;}
  if(!ow||HIDE_KEEP[ow])return;
  if(ow==='head'){o.getWorldPosition(mw);                             // gesichts-MIMIK sichtbar lassen (blinzeln/brauen/lippen leben weiter)
    for(var ki=0;ki<keepC.length;ki++){if(keepC[ki]&&mw.distanceTo(keepC[ki])<KR[ki])return;}}
  if(ow==='ankle1'||ow==='ankle-1'){o.visible=false;return;}   // fuss-cluster liegt IMMER unter einer shell (schuh ODER fuss-haut)
  o.visible=false;});}
var _shellKind=null,_shellClosing=2,_tuckStats={};
// KLAMMER-FAMILIE: verdeckte flaechen duerfen die decke nie durchstossen.
// _tuckUnder(src,dsts,opts): verts von src, die knapp AUSSERHALB der dst-oberflaechen liegen,
// werden IN DER AKTUELLEN POSE hinter die flaeche gezogen (ziel q+(q-p)*MARGIN) und exakt
// durch die posed-matrizen in die rest-daten geschrieben. schutz: 3-achsen-parity-vote
// (einzelstrahl streift in falten falsch), ZIEL-CHECK (auswaerts-zug verboten),
// saum-lippen-abstand, optional INSEL-REGEL (grosse nackt-komponenten = design-oeffnungen).
function _tuckUnder(src,dsts,opts){
  var MARGIN=opts.margin,MAXD=opts.maxd,BNDR=opts.bndr,CELL=0.20,ISLE=400;
  character.updateMatrixWorld(true);updateSkin(true);
  var sp=src.geo.attributes.position.array,sn2=sp.length/3;
  var tris=[],bnd=[],gRange=[],yzb={},YZC=0.08,i;
  for(var s=0;s<dsts.length;s++){var g=dsts[s].geo,pa=g.attributes.position.array,ia=g.index.array;
    var EC={},k,t0=tris.length;
    for(var f=0;f<ia.length;f+=3){var a=ia[f],b=ia[f+1],c=ia[f+2];
      var T=[pa[a*3],pa[a*3+1],pa[a*3+2],pa[b*3],pa[b*3+1],pa[b*3+2],pa[c*3],pa[c*3+1],pa[c*3+2]];
      var ti=tris.length;tris.push(T);
      var ylo=Math.floor(Math.min(T[1],T[4],T[7])/YZC),yhi=Math.floor(Math.max(T[1],T[4],T[7])/YZC);
      var zlo=Math.floor(Math.min(T[2],T[5],T[8])/YZC),zhi=Math.floor(Math.max(T[2],T[5],T[8])/YZC);
      var xlo=Math.floor(Math.min(T[0],T[3],T[6])/YZC),xhi=Math.floor(Math.max(T[0],T[3],T[6])/YZC);
      for(var yy=ylo;yy<=yhi;yy++)for(var zz=zlo;zz<=zhi;zz++){var bk='x'+s+'|'+yy+'_'+zz;(yzb[bk]||(yzb[bk]=[])).push(ti);}
      for(var xx=xlo;xx<=xhi;xx++)for(var zz2=zlo;zz2<=zhi;zz2++){var bk2='y'+s+'|'+xx+'_'+zz2;(yzb[bk2]||(yzb[bk2]=[])).push(ti);}
      for(var xx2=xlo;xx2<=xhi;xx2++)for(var yy2=ylo;yy2<=yhi;yy2++){var bk3='z'+s+'|'+xx2+'_'+yy2;(yzb[bk3]||(yzb[bk3]=[])).push(ti);}
      var ee=[[a,b],[b,c],[c,a]];
      for(var e2=0;e2<3;e2++){var p2=ee[e2][0]<ee[e2][1]?ee[e2][0]+'_'+ee[e2][1]:ee[e2][1]+'_'+ee[e2][0];EC[p2]=(EC[p2]||0)+1;}}
    gRange.push([t0,tris.length,s]);
    for(k in EC)if(EC[k]===1){var pq=k.split('_');bnd.push([pa[+pq[0]*3],pa[+pq[0]*3+1],pa[+pq[0]*3+2]]);bnd.push([pa[+pq[1]*3],pa[+pq[1]*3+1],pa[+pq[1]*3+2]]);}}
  if(!tris.length)return 0;
  function _par(px,py,pz,ax){
    var D=ax==='x'?[1,0,0]:(ax==='y'?[0,1,0]:[0,0,1]);
    var kk=ax==='x'?(Math.floor(py/YZC)+'_'+Math.floor(pz/YZC)):(ax==='y'?(Math.floor(px/YZC)+'_'+Math.floor(pz/YZC)):(Math.floor(px/YZC)+'_'+Math.floor(py/YZC)));
    for(var gi=0;gi<gRange.length;gi++){var s2=gRange[gi][2],L=yzb[ax+s2+'|'+kk];
      if(!L)continue;var hits=0;
      for(var q=0;q<L.length;q++){var T=tris[L[q]];
        var e1x=T[3]-T[0],e1y=T[4]-T[1],e1z=T[5]-T[2],e2x=T[6]-T[0],e2y=T[7]-T[1],e2z=T[8]-T[2];
        var pvx=D[1]*e2z-D[2]*e2y,pvy=D[2]*e2x-D[0]*e2z,pvz=D[0]*e2y-D[1]*e2x;
        var det=e1x*pvx+e1y*pvy+e1z*pvz;if(det>-1e-12&&det<1e-12)continue;
        var inv=1/det,tx=px-T[0],ty=py-T[1],tz=pz-T[2];
        var u=(tx*pvx+ty*pvy+tz*pvz)*inv;if(u<0||u>1)continue;
        var qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x;
        var v=(qx*D[0]+qy*D[1]+qz*D[2])*inv;if(v<0||u+v>1)continue;
        var t2=(qx*e2x+qy*e2y+qz*e2z)*inv;if(t2>1e-9)hits++;}
      if(hits%2===1)return true;}
    return false;}
  function outsideVotes(px,py,pz){return (_par(px,py,pz,'x')?0:1)+(_par(px,py,pz,'y')?0:1)+(_par(px,py,pz,'z')?0:1);}
  var grid={},bgrid={};
  function key(x,y,z){return Math.floor(x/CELL)+'_'+Math.floor(y/CELL)+'_'+Math.floor(z/CELL);}
  for(i=0;i<tris.length;i++){var t=tris[i],cx=(t[0]+t[3]+t[6])/3,cy=(t[1]+t[4]+t[7])/3,cz=(t[2]+t[5]+t[8])/3,kk2=key(cx,cy,cz);(grid[kk2]||(grid[kk2]=[])).push(i);}
  for(i=0;i<bnd.length;i++){var kb=key(bnd[i][0],bnd[i][1],bnd[i][2]);(bgrid[kb]||(bgrid[kb]=[])).push(i);}
  function nearBnd(x,y,z){var gx=Math.floor(x/CELL),gy=Math.floor(y/CELL),gz=Math.floor(z/CELL);
    for(var dx=-1;dx<=1;dx++)for(var dy=-1;dy<=1;dy++)for(var dz=-1;dz<=1;dz++){var L=bgrid[(gx+dx)+'_'+(gy+dy)+'_'+(gz+dz)];if(!L)continue;
      for(var q=0;q<L.length;q++){var b2=bnd[L[q]],ddx=b2[0]-x,ddy=b2[1]-y,ddz=b2[2]-z;if(ddx*ddx+ddy*ddy+ddz*ddz<BNDR*BNDR)return true;}}
    return false;}
  function closest(px,py,pz){var gx=Math.floor(px/CELL),gy=Math.floor(py/CELL),gz=Math.floor(pz/CELL),best=1e9,bq=null;
    for(var dx=-1;dx<=1;dx++)for(var dy=-1;dy<=1;dy++)for(var dz=-1;dz<=1;dz++){var L=grid[(gx+dx)+'_'+(gy+dy)+'_'+(gz+dz)];if(!L)continue;
      for(var q=0;q<L.length;q++){var t=tris[L[q]];
        var ax=t[0],ay=t[1],az=t[2],abx=t[3]-ax,aby=t[4]-ay,abz=t[5]-az,acx=t[6]-ax,acy=t[7]-ay,acz=t[8]-az;
        var apx=px-ax,apy=py-ay,apz=pz-az;
        var d1=abx*apx+aby*apy+abz*apz,d2=acx*apx+acy*apy+acz*apz;
        var bpx=px-t[3],bpy=py-t[4],bpz=pz-t[5],d3=abx*bpx+aby*bpy+abz*bpz,d4=acx*bpx+acy*bpy+acz*bpz;
        var cpx=px-t[6],cpy=py-t[7],cpz=pz-t[8],d5=abx*cpx+aby*cpy+abz*cpz,d6=acx*cpx+acy*cpy+acz*cpz;
        var va=d3*d6-d5*d4,vb=d5*d2-d1*d6,vc=d1*d4-d3*d2,u2,v2;
        if(d1<=0&&d2<=0){u2=0;v2=0;}
        else if(d3>=0&&d4<=d3){u2=1;v2=0;}
        else if(d6>=0&&d5<=d6){u2=0;v2=1;}
        else if(vc<=0&&d1>=0&&d3<=0){u2=d1/(d1-d3);v2=0;}
        else if(vb<=0&&d2>=0&&d6<=0){u2=0;v2=d2/(d2-d6);}
        else if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){var w2=(d4-d3)/((d4-d3)+(d5-d6));u2=1-w2;v2=w2;}
        else{var dn=1/(va+vb+vc);u2=vb*dn;v2=vc*dn;}
        var qx=ax+abx*u2+acx*v2,qy=ay+aby*u2+acy*v2,qz=az+abz*u2+acz*v2;
        var ddx2=px-qx,ddy2=py-qy,ddz2=pz-qz,dd=ddx2*ddx2+ddy2*ddy2+ddz2*ddz2;
        if(dd<best){best=dd;bq=[qx,qy,qz];}}}
    return bq?{d:Math.sqrt(best),q:bq}:null;}
  var dil=null;
  if(opts.islands){                                        // INSEL-REGEL (nur haut-pass)
    var unc2=new Uint8Array(sn2);
    for(i=0;i<sn2;i++)if(outsideVotes(sp[i*3],sp[i*3+1],sp[i*3+2])>=2)unc2[i]=1;
    var sidx=src.geo.index.array,adj=[];
    for(i=0;i<sn2;i++)adj.push([]);
    for(i=0;i<sidx.length;i+=3){var a4=sidx[i],b4=sidx[i+1],c4=sidx[i+2];adj[a4].push(b4,c4);adj[b4].push(a4,c4);adj[c4].push(a4,b4);}
    var comp=new Int32Array(sn2),csz=[0];comp.fill(-1);
    for(i=0;i<sn2;i++){if(!unc2[i]||comp[i]>=0)continue;var cid=csz.length,stack=[i];comp[i]=cid;var cnt=0;
      while(stack.length){var v4=stack.pop();cnt++;var nb=adj[v4];
        for(var n4=0;n4<nb.length;n4++){var w4=nb[n4];if(unc2[w4]&&comp[w4]<0){comp[w4]=cid;stack.push(w4);}}}
      csz.push(cnt);}
    dil=new Uint8Array(sn2);
    for(i=0;i<sn2;i++){if(!unc2[i]||csz[comp[i]]>=ISLE)continue;dil[i]=1;var nb2=adj[i];for(var n5=0;n5<nb2.length;n5++)dil[nb2[n5]]=1;}}
  var charM=character.matrixWorld,invB=new Map(),moved=0,wv=new THREE.Vector3();
  function invOf(nd){var m=invB.get(nd);if(!m){m=new THREE.Matrix4().copy(nd.matrixWorld).invert();invB.set(nd,m);}return m;}
  function _pass(){var mv=0;
    for(i=0;i<sn2;i++){var px=sp[i*3],py=sp[i*3+1],pz=sp[i*3+2];
      if(opts.ymin!==undefined&&py<opts.ymin)continue;     // band-pass: nur ueberlapp-band (hose ueberm top-saum)
      var vo=outsideVotes(px,py,pz);
      if(vo>0&&dil&&!dil[i])continue;                      // insel-regel NUR fuer draussen-zug (mindestabstand gilt ueberall unterm stoff)
      var r=closest(px,py,pz);if(!r||r.d<1e-6||r.d>MAXD)continue;
      if(nearBnd(px,py,pz))continue;                       // saum-/kragen-lippe: NICHT anfassen
      var ux,uy,uz,nx2,ny2,nz2;
      if(vo===0){                                          // DRIN aber z-fighting-nah (<0.035): auf mindestabstand nachziehen (glitzer!)
        if(r.d>=0.035)continue;
        ux=(px-r.q[0])/r.d;uy=(py-r.q[1])/r.d;uz=(pz-r.q[2])/r.d;   // vom stoff WEG (tiefer rein)
        nx2=px+ux*(0.05-r.d);ny2=py+uy*(0.05-r.d);nz2=pz+uz*(0.05-r.d);
      }else{                                               // DRAUSSEN: hinter die flaeche ziehen
        ux=(r.q[0]-px)/r.d;uy=(r.q[1]-py)/r.d;uz=(r.q[2]-pz)/r.d;
        nx2=r.q[0]+ux*MARGIN;ny2=r.q[1]+uy*MARGIN;nz2=r.q[2]+uz*MARGIN;
      }
      if(outsideVotes(nx2,ny2,nz2)>=2)continue;            // ZIEL-CHECK: ziel muss drin liegen (auswaerts-zug verboten)
      wv.set(nx2,ny2,nz2).applyMatrix4(charM);
      var inf=src.infl[i];
      for(var b3=0;b3<inf.length;b3++){var nd=inf[b3][0];_skTmp.copy(wv).applyMatrix4(invOf(nd));inf[b3][2]=_skTmp.x;inf[b3][3]=_skTmp.y;inf[b3][4]=_skTmp.z;}
      sp[i*3]=nx2;sp[i*3+1]=ny2;sp[i*3+2]=nz2;
      mv++;}
    return mv;}
  moved=_pass();moved+=_pass();
  return moved;}

// ============ SDF-VEREDELUNG (der 'geniale weg' statt brute-force-verts) ============
// voxel-feld liefert nur noch TOPOLOGIE; die FORM kommt aus exakter mathematik:
// jede primitive hat ihre analytische distanzfunktion, verschmolzen per SMOOTH-MIN
// (dreams/metaball-prinzip: scharfe nase UND weiche wange -- gauss kann nur beides matschen).
// nach dem meshing wird jeder haut-vert per newton auf sdf = -OFFSET projiziert:
// saegezaehne, primitiv-klumpen und offset-drift sterben in EINEM schlag.
var _USE_SDF=true,_USE_HUELLE=false;   // SDF PROMOTED (einzeln, nach doppel-koerper-beweis); huelle bleibt aus   // EXPERIMENT-SCHALTER: beide architekturen bleiben im code, sind aber AUS bis der randomisierte pruefstand + du sie freigeben
var _SDF_OFFSET=0.026,_SDF_K={skinBody:0.10,skinSkull:0.075,skinFace:0.065,skinHand1:0.035,'skinHand-1':0.035,skinFoot1:0.05,'skinFoot-1':0.05};
var _SDF_TGT={skinBody:0.004,skinSkull:0.026,skinFace:0.023,skinHand1:0.016,'skinHand-1':0.016,skinFoot1:0.018,'skinFoot-1':0.018};   // nach skalen-fix neu kalibriert (alte werte waren MIT dem welt-radius-bug rueckwaerts gestimmt)   // k-kompensiert: smin senkt d in blendzonen um ~k/4 -> ziel pro schale rueckwaerts kalibriert
function _sdfPrepPrims(incl){
  var prims=[],tv=new THREE.Vector3();
  character.updateMatrixWorld(true);
  var cs=character.scale.x||1;                              // GROESSEN-BUG (B44): zentren wurden nach LOKAL geteilt, radien blieben WELT (xcharacter.scale)!
                                                            // bei groesse 1.06 waren alle sdf-primitive 6% zu fett -> haut frass das stoff-polster (deine korrelation).
  for(var q=0;q<incl.length;q++){var nd=parts[incl[q]];if(!nd)continue;
    nd.traverse(function(o){if(!o.isMesh||o.userData.isGarment||o.userData.isSkinShell)return;
      var g=o.geometry;if(!g||!g.type)return;
      var m=o.matrixWorld.elements;
      var ax=[m[0],m[1],m[2]],ay=[m[4],m[5],m[6]],az=[m[8],m[9],m[10]];
      var sx=Math.hypot(ax[0],ax[1],ax[2])||1,sy=Math.hypot(ay[0],ay[1],ay[2])||1,sz=Math.hypot(az[0],az[1],az[2])||1;
      var P={cx:m[12],cy:m[13],cz:m[14],
        rx:[ax[0]/sx,ax[1]/sx,ax[2]/sx],ry:[ay[0]/sy,ay[1]/sy,ay[2]/sy],rz:[az[0]/sz,az[1]/sz,az[2]/sz]};
      if(g.type==='SphereGeometry'){var r0=(g.parameters&&g.parameters.radius)||1;
        P.t=0;P.a=r0*sx/cs;P.b=r0*sy/cs;P.c=r0*sz/cs;P.reach=Math.max(P.a,P.b,P.c);}
      else if(g.type==='CylinderGeometry'){var pp=g.parameters||{};
        P.t=1;P.a=((pp.radiusTop||0)+(pp.radiusBottom||0))*0.5*((sx+sz)*0.5)/cs;P.b=(pp.height||1)*0.5*sy/cs;P.c=0;
        P.reach=Math.hypot(P.a,P.b);}
      else return;
      prims.push(P);});}
  // welt->character-lokal (shell-verts sind character-lokal!)
  var inv=new THREE.Matrix4().copy(character.matrixWorld).invert();
  for(q=0;q<prims.length;q++){var P2=prims[q];
    tv.set(P2.cx,P2.cy,P2.cz).applyMatrix4(inv);P2.cx=tv.x;P2.cy=tv.y;P2.cz=tv.z;
    // rotationsachsen mitdrehen (character meist unrotiert+uniform -- achsen bleiben orthonormal genug)
  }
  return prims;}
function _sdfEval(prims,x,y,z){
  var d=1e9;
  for(var q=0;q<prims.length;q++){var P=prims[q];
    var px=x-P.cx,py=y-P.cy,pz=z-P.cz;
    if(px*px+py*py+pz*pz>(P.reach+0.35)*(P.reach+0.35))continue;   // reichweiten-cull
    var lx=px*P.rx[0]+py*P.rx[1]+pz*P.rx[2];
    var ly=px*P.ry[0]+py*P.ry[1]+pz*P.ry[2];
    var lz=px*P.rz[0]+py*P.rz[1]+pz*P.rz[2];
    var di;
    if(P.t===0){var k0=Math.hypot(lx/P.a,ly/P.b,lz/P.c);           // IQ-ellipsoid-approx
      var k1=Math.hypot(lx/(P.a*P.a),ly/(P.b*P.b),lz/(P.c*P.c))||1e-9;
      di=k0*(k0-1)/k1;}
    else{var dxy=Math.hypot(lx,lz)-P.a,dy2=Math.abs(ly)-P.b;        // capped cylinder
      var ox=Math.max(dxy,0),oy=Math.max(dy2,0);
      di=Math.min(Math.max(dxy,dy2),0)+Math.hypot(ox,oy);}
    var kk=_sdfCurK;
    if(di<d){var h9=Math.max(kk-Math.abs(d-di),0)/kk;d=Math.min(d,di)-h9*h9*kk*0.25;}   // polynomial smin
    else{var h8=Math.max(kk-Math.abs(di-d),0)/kk;d=d-h8*h8*kk*0.25;}}
  return d;}
var _sdfCurK=0.08;
function _sdfPolish(sk,incl,kind){
  var kk=_SDF_K[kind];if(kk===undefined)return 0;
  _sdfCurK=kk;
  var prims=_sdfPrepPrims(incl);if(!prims.length)return 0;
  var geo=sk.geo,pa=geo.attributes.position.array,ia=geo.index.array,n=pa.length/3,i;
  var bnd={};(function(){var EC={},k;                               // rand-verts (kragen/saeume/loecher) NICHT projizieren
    for(i=0;i<ia.length;i+=3){var ee=[[ia[i],ia[i+1]],[ia[i+1],ia[i+2]],[ia[i+2],ia[i]]];
      for(var q=0;q<3;q++){k=ee[q][0]<ee[q][1]?ee[q][0]+'_'+ee[q][1]:ee[q][1]+'_'+ee[q][0];EC[k]=(EC[k]||0)+1;}}
    for(k in EC)if(EC[k]===1){var pq=k.split('_');bnd[+pq[0]]=1;bnd[+pq[1]]=1;}})();
  var H=0.012,moved=0;
  for(i=0;i<n;i++){if(bnd[i])continue;
    var x=pa[i*3],y=pa[i*3+1],z=pa[i*3+2];
    for(var it=0;it<3;it++){
      var d0=_sdfEval(prims,x,y,z);
      var gx=(_sdfEval(prims,x+H,y,z)-_sdfEval(prims,x-H,y,z))/(2*H);
      var gy=(_sdfEval(prims,x,y+H,z)-_sdfEval(prims,x,y-H,z))/(2*H);
      var gz=(_sdfEval(prims,x,y,z+H)-_sdfEval(prims,x,y,z-H))/(2*H);
      var gl=gx*gx+gy*gy+gz*gz;if(gl<1e-8)break;
      var tgt9=(_SDF_TGT[kind]!==undefined)?_SDF_TGT[kind]:_SDF_OFFSET;
      var st=(d0-tgt9)/gl;                                  // newton auf sdf = +OFFSET (flaeche AUSSERHALB der primitive)
      if(st>0.05)st=0.05;if(st<-0.05)st=-0.05;
      x-=gx*st;y-=gy*st;z-=gz*st;
      if(Math.abs(d0-tgt9)<0.002)break;}
    var mvx=x-pa[i*3],mvy=y-pa[i*3+1],mvz=z-pa[i*3+2];
    var mv=Math.hypot(mvx,mvy,mvz);
    if(mv>0.09){var sc=0.09/mv;x=pa[i*3]+mvx*sc;y=pa[i*3+1]+mvy*sc;z=pa[i*3+2]+mvz*sc;}   // leine gegen ausreisser
    pa[i*3]=x;pa[i*3+1]=y;pa[i*3+2]=z;moved++;}
  // rest-daten nachziehen (bindung bleibt exakt)
  character.updateMatrixWorld(true);
  var charM=character.matrixWorld,inv=new Map(),wv=new THREE.Vector3();
  for(i=0;i<n;i++){if(bnd[i])continue;
    wv.set(pa[i*3],pa[i*3+1],pa[i*3+2]).applyMatrix4(charM);
    var inf=sk.infl[i];
    for(var b=0;b<inf.length;b++){var nd=inf[b][0],m3=inv.get(nd);
      if(!m3){m3=new THREE.Matrix4().copy(nd.matrixWorld).invert();inv.set(nd,m3);}
      _skTmp.copy(wv).applyMatrix4(m3);inf[b][2]=_skTmp.x;inf[b][3]=_skTmp.y;inf[b][4]=_skTmp.z;}}
  geo.computeVertexNormals();
  return moved;}


// ============ HUELLEN-EXTRUSION: kleidung wird AUS der haut extrudiert ============
// der endpunkt des 'ein feld'-prinzips: stoff = selektierte haut-region + fester normalen-
// offset, mit IDENTISCHEN vertex-indizes und identischer bindung. durchstossen ist damit
// DEFINITIONSUNMOEGLICH -- fuer jeden gewuerfelten koerper, jede pose. und zwei komplette
// voxel-felder (top+hose) entfallen ersatzlos: das ankleiden wird SCHNELLER.
function _garmentFromSkin(kind,inclNames,exclNames,tOff,mat){
  var bo=_skinByKind('skinBody');if(!bo)return false;
  var geo=bo.geo,pa=geo.attributes.position.array,ia=geo.index.array,n=pa.length/3,i,q;
  geo.computeVertexNormals();var na=geo.attributes.normal.array;
  var inS={},exS={};for(i=0;i<inclNames.length;i++)inS[inclNames[i]]=1;
  for(i=0;i<(exclNames?exclNames.length:0);i++)exS[exclNames[i]]=1;
  var sel=new Uint8Array(n);
  for(i=0;i<n;i++){var inf=bo.infl[i],bw=-1,bn='';
    for(q=0;q<inf.length;q++)if(inf[q][1]>bw){bw=inf[q][1];bn=inf[q][0].name||'';}
    if(inS[bn]&&!exS[bn])sel[i]=1;}
  var adj=new Array(n);                                     // 2x mehrheits-glaettung: keine ausgefransten saum-inseln
  for(i=0;i<ia.length;i+=3){var a=ia[i],b=ia[i+1],c=ia[i+2];
    (adj[a]||(adj[a]=[])).push(b,c);(adj[b]||(adj[b]=[])).push(a,c);(adj[c]||(adj[c]=[])).push(a,b);}
  for(var p=0;p<2;p++){var ns=new Uint8Array(n);
    for(i=0;i<n;i++){var nb=adj[i];if(!nb){ns[i]=sel[i];continue;}
      var cnt=sel[i]*2;for(q=0;q<nb.length;q++)cnt+=sel[nb[q]];
      ns[i]=(cnt*2>nb.length+2)?1:0;}
    sel=ns;}
  for(p=0;p<3;p++){var f2=0;                                 // LOCH-FUELLUNG: unselektierte insel-verts, deren nachbarn fast alle drin sind
    for(i=0;i<n;i++){if(sel[i])continue;var nb3=adj[i];if(!nb3)continue;
      var c3=0;for(q=0;q<nb3.length;q++)c3+=sel[nb3[q]];
      if(c3*10>=nb3.length*8){sel[i]=1;f2++;}}
    if(!f2)break;}
  var map=new Int32Array(n),m=0;for(i=0;i<n;i++)map[i]=sel[i]?m++:-1;
  if(m<30)return false;
  var faces=[];
  for(i=0;i<ia.length;i+=3){var a2=ia[i],b2=ia[i+1],c2=ia[i+2];
    if(sel[a2]&&sel[b2]&&sel[c2])faces.push([map[a2],map[b2],map[c2]]);}
  if(faces.length<30)return false;
  var verts=new Array(m),infl=new Array(m);
  character.updateMatrixWorld(true);
  var charM=character.matrixWorld,invC=new Map(),wv=new THREE.Vector3();
  function invOf(nd){var mm=invC.get(nd);if(!mm){mm=new THREE.Matrix4().copy(nd.matrixWorld).invert();invC.set(nd,mm);}return mm;}
  for(i=0;i<n;i++){if(!sel[i])continue;var j=map[i];
    var x=pa[i*3]+na[i*3]*tOff,y=pa[i*3+1]+na[i*3+1]*tOff,z=pa[i*3+2]+na[i*3+2]*tOff;
    verts[j]=[x,y,z];
    wv.set(x,y,z).applyMatrix4(charM);
    var src=bo.infl[i],ninf=[];
    for(q=0;q<src.length;q++){var nd=src[q][0];_skTmp.copy(wv).applyMatrix4(invOf(nd));
      ninf.push([nd,src[q][1],_skTmp.x,_skTmp.y,_skTmp.z]);}
    infl[j]=ninf;}
  // saum-ring 3x glaetten (offene kanten der selektion)
  (function(){var EC={},k;for(i=0;i<faces.length;i++){var f=faces[i],ee=[[f[0],f[1]],[f[1],f[2]],[f[2],f[0]]];
      for(q=0;q<3;q++){k=ee[q][0]<ee[q][1]?ee[q][0]+'_'+ee[q][1]:ee[q][1]+'_'+ee[q][0];EC[k]=(EC[k]||0)+1;}}
    var badj={};for(k in EC)if(EC[k]===1){var pq=k.split('_'),a3=+pq[0],b3=+pq[1];
      (badj[a3]||(badj[a3]=[])).push(b3);(badj[b3]||(badj[b3]=[])).push(a3);}
    for(var it=0;it<3;it++){var upd={};
      for(k in badj){var nb2=badj[k],sx=0,sy=0,sz=0;
        for(q=0;q<nb2.length;q++){var v2=verts[nb2[q]];sx+=v2[0];sy+=v2[1];sz+=v2[2];}
        var v0=verts[+k];upd[k]=[(v0[0]+sx)/(nb2.length+1),(v0[1]+sy)/(nb2.length+1),(v0[2]+sz)/(nb2.length+1)];}
      for(k in upd)verts[+k]=upd[k];}
    for(k in badj){var j2=+k,v3=verts[j2];                   // rest-daten der geglaetteten saum-verts nachziehen
      wv.set(v3[0],v3[1],v3[2]).applyMatrix4(charM);
      var inf2=infl[j2];
      for(q=0;q<inf2.length;q++){var nd2=inf2[q][0];_skTmp.copy(wv).applyMatrix4(invOf(nd2));
        inf2[q][2]=_skTmp.x;inf2[q][3]=_skTmp.y;inf2[q][4]=_skTmp.z;}}})();
  _shellKind=kind;
  var g2=_addSkinned({verts:verts,faces:faces},mat,infl,false);
  var GG=_skins[_skins.length-1];GG.exact=true;GG.srcMap=map;GG.srcSel=sel;GG.tOff=tOff;   // exakte coverage + 1:1-index fuer cull & direktklammern
  if(!_exactSel)_exactSel=new Uint8Array(n);
  for(i=0;i<n;i++)if(sel[i])_exactSel[i]=1;
  _shellKind=null;return true;}
var _exactSel=null;


// ============ LANDMARKEN-SCHICHT: die eine wahrheitstabelle ============
// bei JEDEM ankleiden frisch aus dem lebenden rig gemessen. alle schnitte,
// schutzzonen und waechter leiten sich hieraus ab -- aendert sich der koerper
// (slider/wuerfel), wandern ALLE naehte gemeinsam. der flickenteppich wird gewebe.
var LM=null;
function _landmarks(){
  character.updateMatrixWorld(true);
  var v=new THREE.Vector3(),inv=new THREE.Matrix4().copy(character.matrixWorld).invert();
  var cs=character.scale.x||1;
  function P(n){var p=parts[n];if(!p)return null;p.getWorldPosition(v);v.applyMatrix4(inv);return {x:v.x,y:v.y,z:v.z};}
  function radOf(n){var p=parts[n];if(!p)return 0.13;
    var g=null;p.traverse(function(o){if(!g&&o.isMesh&&o.geometry&&o.geometry.parameters)g=o.geometry;});
    var m=p.matrixWorld.elements,sx=Math.hypot(m[0],m[1],m[2]),sz=Math.hypot(m[8],m[9],m[10]);
    var r=(g&&(g.parameters.radiusBottom||g.parameters.radius))||0.13;
    return r*(sx+sz)*0.5/cs;}
  // ULTRAGUSS U3: das landmarken-URTEIL wohnt im gesetzbuch (__koerperCore.labLandmarks) -- die shell MISST am lebenden rig (P/radOf), der kern traegt offsets, fallbacks + den handgelenks-VERTRAG (wristFrac/wristOverlap).
  LM=window.__koerperCore.labLandmarks({chin:P('chin'),neckBase:P('neckBase'),waist:P('waist'),knee:P('knee1'),neckBaseRad:radOf('neckBase')});
  return LM;}

function _skinByKind(k){for(var i=0;i<_skins.length;i++)if(_skins[i].kind===k)return _skins[i];return null;}
// GEWICHTS-VERERBUNG (profi-standard "weight transfer"): jeder stoff-vert von top/hose KOPIERT die
// einflussliste (knoten + gewichte) seines naechstgelegenen haut-verts und behaelt nur eigene
// rest-koordinaten. haut und stoff sind danach EIN deformationsfeld: pos_stoff - pos_haut wird in
// jeder pose nur noch starr mitrotiert -> der nesting-abstand ist konstruktionsbedingt konstant,
// durchstoss verliert seine URSACHE (feld-drift) statt nur gedaempft zu werden.
function _inheritWeights(){
  var srcs=[],i,s;
  for(i=0;i<_skins.length;i++){var kd=String(_skins[i].kind||'');
    if(kd==='skinBody'||kd.indexOf('skinHand')===0)srcs.push(_skins[i]);}   // KEINE fuss-shells als spender: hosensaum soll der bein-achse folgen, nicht der fussspitze
  if(!srcs.length)return;
  character.updateMatrixWorld(true);updateSkin(true);
  var CELL=0.10,grid={},sv=[];
  for(s=0;s<srcs.length;s++){var pa=srcs[s].geo.attributes.position.array;
    var isHand=String(srcs[s].kind||'').indexOf('skinHand')===0;
    for(i=0;i<pa.length/3;i++){var vi=sv.length;sv.push([srcs[s],i,pa[i*3],pa[i*3+1],pa[i*3+2],isHand]);
      var k=Math.floor(pa[i*3]/CELL)+'_'+Math.floor(pa[i*3+1]/CELL)+'_'+Math.floor(pa[i*3+2]/CELL);(grid[k]||(grid[k]=[])).push(vi);}}
  var charM=character.matrixWorld,inv=new Map(),n=0;
  function invOf(nd){var m=inv.get(nd);if(!m){m=new THREE.Matrix4().copy(nd.matrixWorld).invert();inv.set(nd,m);}return m;}
  var wv=new THREE.Vector3(),RINGS=[1,3,5];               // suchradien 0.15 / 0.35 / 0.55 (poncho-saum haengt weit)
  for(s=1;s<_skins.length;s++){var G=_skins[s];if(G.kind!=='top'&&G.kind!=='bottom')continue;if(G.exact)continue;   // 1:1-huellen sind schon perfekt gebunden
    var gp=G.geo.attributes.position.array,gi;
    for(gi=0;gi<gp.length/3;gi++){var px=gp[gi*3],py=gp[gi*3+1],pz=gp[gi*3+2];
      var gx=Math.floor(px/CELL),gy=Math.floor(py/CELL),gz=Math.floor(pz/CELL);
      var noHand=(G.kind==='bottom');                      // hose erbt NIE von hand-haut (haengende haende neben der huefte poisonten die spender!)
      var cN=0,cJ=[-1,-1,-1,-1],cD=[1e9,1e9,1e9,1e9];      // K=4 naechste spender: INTERPOLIERTER transfer statt nearest-copy
      for(var ri=0;ri<RINGS.length&&cN===0;ri++){var ring=RINGS[ri];   // (nearest-copy war unstetig: an spender-grenzen riss der stoff auf!)
        for(var dx=-ring;dx<=ring;dx++)for(var dy=-ring;dy<=ring;dy++)for(var dz=-ring;dz<=ring;dz++){
          var L=grid[(gx+dx)+'_'+(gy+dy)+'_'+(gz+dz)];if(!L)continue;
          for(var q=0;q<L.length;q++){var S=sv[L[q]];if(noHand&&S[5])continue;
            var ddx=S[2]-px,ddy=S[3]-py,ddz=S[4]-pz,dd=ddx*ddx+ddy*ddy+ddz*ddz;
            if(dd<cD[3]){var ip=3;                          // insertion in die 4er-bestenliste
              while(ip>0&&dd<cD[ip-1]){cD[ip]=cD[ip-1];cJ[ip]=cJ[ip-1];ip--;}
              cD[ip]=dd;cJ[ip]=L[q];if(cN<4)cN++;}}}}
      if(cN===0||cD[0]>0.55*0.55)continue;                 // kein spender in reichweite -> originale distanz-bindung bleibt (fallback)
      wv.set(px,py,pz).applyMatrix4(charM);
      var acc=new Map();
      for(var c=0;c<cN;c++){var dwt=1/(cD[c]+1e-4),dinf=sv[cJ[c]][0].infl[sv[cJ[c]][1]];
        for(var b=0;b<dinf.length;b++){var nd=dinf[b][0];acc.set(nd,(acc.get(nd)||0)+dwt*dinf[b][1]);}}
      var ents=[];acc.forEach(function(w9,nd9){ents.push([nd9,w9]);});
      ents.sort(function(e1,e2){return e2[1]-e1[1];});if(ents.length>6)ents.length=6;
      var ws=0;for(b=0;b<ents.length;b++)ws+=ents[b][1];
      var ninf=[];
      for(b=0;b<ents.length;b++){var nd2=ents[b][0];_skTmp.copy(wv).applyMatrix4(invOf(nd2));
        ninf.push([nd2,ents[b][1]/ws,_skTmp.x,_skTmp.y,_skTmp.z]);}
      G.infl[gi]=ninf;n++;}
    _smoothInfl(G,2);}                                     // gewichtsfeld-glaettung: C0-stetig ueber die stoff-nachbarschaft -> risse UNMOEGLICH
  _tuckStats.erb=n;}
// GEWICHTSFELD-GLAETTUNG: jeder stoff-vert mischt seine einflussliste mit denen seiner mesh-nachbarn
// (0.6 eigen / 0.4 nachbarn, 2 jacobi-paesse). rest-koordinaten werden aus der vert-position neu
// berechnet -> die geometrie bleibt exakt, nur das DEFORMATIONSFELD wird stetig. das ist der
// 'smooth bind' schritt professioneller weight-transfers.
function _smoothInfl(G,passes){
  var ia=G.geo.index.array,pos=G.geo.attributes.position.array,nV=pos.length/3,i;
  var adj=new Array(nV);
  for(i=0;i<ia.length;i+=3){var a1=ia[i],a2=ia[i+1],a3=ia[i+2];
    (adj[a1]||(adj[a1]=[])).push(a2,a3);(adj[a2]||(adj[a2]=[])).push(a1,a3);(adj[a3]||(adj[a3]=[])).push(a1,a2);}
  var charM=character.matrixWorld,inv=new Map(),wv=new THREE.Vector3();
  function invOf(nd){var m=inv.get(nd);if(!m){m=new THREE.Matrix4().copy(nd.matrixWorld).invert();inv.set(nd,m);}return m;}
  for(var p=0;p<passes;p++){
    var out=new Array(nV);
    for(i=0;i<nV;i++){var nb=adj[i],own=G.infl[i];
      if(!nb||!nb.length||!own){out[i]=own;continue;}
      var acc=new Map(),b2;
      for(b2=0;b2<own.length;b2++)acc.set(own[b2][0],(acc.get(own[b2][0])||0)+own[b2][1]*0.6);
      var nw=0.4/nb.length;
      for(var q=0;q<nb.length;q++){var lf=G.infl[nb[q]];if(!lf)continue;
        for(b2=0;b2<lf.length;b2++)acc.set(lf[b2][0],(acc.get(lf[b2][0])||0)+lf[b2][1]*nw);}
      var ents=[];acc.forEach(function(w9,nd9){ents.push([nd9,w9]);});
      ents.sort(function(e1,e2){return e2[1]-e1[1];});if(ents.length>6)ents.length=6;
      var ws=0;for(b2=0;b2<ents.length;b2++)ws+=ents[b2][1];
      wv.set(pos[i*3],pos[i*3+1],pos[i*3+2]).applyMatrix4(charM);
      var ninf=[];
      for(b2=0;b2<ents.length;b2++){var nd3=ents[b2][0];_skTmp.copy(wv).applyMatrix4(invOf(nd3));
        ninf.push([nd3,ents[b2][1]/ws,_skTmp.x,_skTmp.y,_skTmp.z]);}
      out[i]=ninf;}
    G.infl=out;}}
function _clothDsts(){var d=[];for(var s=1;s<_skins.length;s++)if(!_skins[s].isSkin||_skins[s].kind==='shoe')d.push(_skins[s]);return d;}
function _tuckSkinUnderCloth(){                            // pass 1: HAUT unter (top∪hose∪schuh...)
  if(!_skins.length||!_skins[0].isSkin)return;
  var dsts=_clothDsts();if(!dsts.length)return;
  var n=_tuckUnder(_skins[0],dsts,{margin:0.09,maxd:0.22,bndr:0.03,islands:true});
  for(var s=1;s<_skins.length;s++)if(String(_skins[s].kind||'').indexOf('skinHand')===0)   // hand-haut unter pullover-cuffs
    n+=_tuckUnder(_skins[s],dsts,{margin:0.06,maxd:0.18,bndr:0.03,islands:true});
  _tuckStats.haut=n;}
function _cullSkin(){                                      // UEBERBACKEN in BIND-pose: dort liegt der stoff ueberall gleichmaessig ueber der haut
  if(!_skins.length||!_skins[0].isSkin)return;             // -> der test ist posen-INVARIANT (geloescht ist geloescht, kein durchstoss in keiner pose)
  var dsts=_clothDsts();if(!dsts.length)return;
  var r=_bindPose();
  _tuckStats.cull=_cullHiddenSkin(_skins[0],dsts);
  r();character.updateMatrixWorld(true);}
// LAUFZEIT-KLAMMER-PAARE (bauzeit): fuer jeden verbliebenen innen-vert (saum-band-haut, hose-unter-top,
// schuh-unter-cuff) wird in BIND-pose der naechste stoff-partner-vert + der dominante bind-knoten als
// radial-anker gespeichert. updateSkin drueckt den vert dann JEDEN frame unter seinen partner --
// das ist die kapsel-proxy-idee der spiele-engines, direkt auf unsere LBS-shells uebersetzt.
function _buildRuntimeClamps(){
  _rtClamps=[];
  var r=_bindPose();character.updateMatrixWorld(true);updateSkin(true);
  function domNode(sk,vi){var inf=sk.infl[vi],best=null,bw=-1;
    for(var b=0;b<inf.length;b++)if(inf[b][1]>bw){bw=inf[b][1];best=inf[b][0];}return best;}
  var ciB=new THREE.Matrix4().copy(character.matrixWorld).invert(),anch=new Map();
  function anchPos(nd){var c=anch.get(nd);if(!c){_skTmp.setFromMatrixPosition(nd.matrixWorld).applyMatrix4(ciB);c=[_skTmp.x,_skTmp.y,_skTmp.z];anch.set(nd,c);}return c;}
  function pairGroup(src,dsts,margin,skipSel){
    if(!src||!dsts.length)return 0;
    var CELL=0.10,R=0.22,grid={},dv=[],s,i;var RC=Math.max(1,Math.ceil(R/CELL));
    for(s=0;s<dsts.length;s++){var dp=dsts[s].geo.attributes.position.array;
      for(i=0;i<dp.length/3;i++){var di=dv.length;dv.push([dsts[s],i,dp[i*3],dp[i*3+1],dp[i*3+2]]);
        var k=Math.floor(dp[i*3]/CELL)+'_'+Math.floor(dp[i*3+1]/CELL)+'_'+Math.floor(dp[i*3+2]/CELL);(grid[k]||(grid[k]=[])).push(di);}}
    var ia=src.geo.index.array,used=new Uint8Array(src.geo.attributes.position.array.length/3);
    for(i=0;i<ia.length;i++)used[ia[i]]=1;                 // nur verts, die noch faces tragen (cull-waisen ausgeschlossen)
    var sp=src.geo.attributes.position.array,made=0;
    for(i=0;i<used.length;i++){if(!used[i])continue;
      if(skipSel&&src===_skins[0]&&skipSel[i])continue;      // 1:1-zone hat direktklammern
      var px=sp[i*3],py=sp[i*3+1],pz=sp[i*3+2];
      var gx=Math.floor(px/CELL),gy=Math.floor(py/CELL),gz=Math.floor(pz/CELL),best=R*R,bi=-1;
      for(var dx=-RC;dx<=RC;dx++)for(var dy=-RC;dy<=RC;dy++)for(var dz=-RC;dz<=RC;dz++){var L=grid[(gx+dx)+'_'+(gy+dy)+'_'+(gz+dz)];if(!L)continue;
        for(var q=0;q<L.length;q++){var D=dv[L[q]],ddx=D[2]-px,ddy=D[3]-py,ddz=D[4]-pz,dd=ddx*ddx+ddy*ddy+ddz*ddz;
          if(dd<best){best=dd;bi=L[q];}}}
      if(bi<0)continue;
      var nd=domNode(src,i);if(!nd)continue;
      var c=anchPos(nd),D2=dv[bi];
      var Ls=Math.hypot(px-c[0],py-c[1],pz-c[2]),Lg=Math.hypot(D2[2]-c[0],D2[3]-c[1],D2[4]-c[2]);
      if(Lg<0.06)continue;                                 // partner praktisch im anker -> degeneriert
      if(Ls>Lg+0.06)continue;                              // vert ist AUSSEN-haut relativ zum stoff -> gehoert nicht geklammert
      _rtClamps.push({s:src,i:i,d:D2[0],j:D2[1],a:nd,m:margin});made++;}
    return made;}
  var top=null,bot=null,i2;
  for(i2=1;i2<_skins.length;i2++){if(_skins[i2].kind==='top')top=_skins[i2];if(_skins[i2].kind==='bottom')bot=_skins[i2];}
  var n=0;
  if(bot&&top)n+=pairGroup(bot,[top],0.015);               // stoff-stoff ZUERST (klammer-reihenfolge pro frame = array-reihenfolge)
  for(i2=1;i2<_skins.length;i2++){var kd=String(_skins[i2].kind||'');
    if(bot&&(kd==='shoe'||kd.indexOf('skinFoot')===0))n+=pairGroup(_skins[i2],[bot],0.015);}
  for(i2=1;i2<_skins.length;i2++){var GE=_skins[i2];        // INDEX-DIREKTKLAMMERN fuer 1:1-huellen: haut i <-> huelle map[i], kein radial-raten
    if(!GE.exact||!GE.srcMap)continue;
    var bo9=_skins[0],ia9=bo9.geo.index.array,used9=new Uint8Array(bo9.geo.attributes.position.array.length/3),i9;
    for(i9=0;i9<ia9.length;i9++)used9[ia9[i9]]=1;
    for(i9=0;i9<GE.srcSel.length;i9++){if(!GE.srcSel[i9]||!used9[i9]||GE.srcMap[i9]<0)continue;
      var nd9=domNode(bo9,i9);if(!nd9)continue;
      _rtClamps.push({s:bo9,i:i9,d:GE,j:GE.srcMap[i9],a:nd9,m:GE.tOff*0.5});n++;}}
  var cd=_clothDsts();
  if(cd.length){n+=pairGroup(_skins[0],cd,0.02,_exactSel);
    for(i2=1;i2<_skins.length;i2++)if(String(_skins[i2].kind||'').indexOf('skinHand')===0)n+=pairGroup(_skins[i2],cd,0.02);}
  _tuckStats.klam=n;
  r();character.updateMatrixWorld(true);}
function _tuckShoesUnderPants(){                           // schuh-/fuss-shell unter den hosen-cuff (jeans-break ohne durchstoss)
  var bot=null,sh=[],s;
  for(s=1;s<_skins.length;s++){if(_skins[s].kind==='bottom')bot=_skins[s];
    if(_skins[s].kind==='shoe'||String(_skins[s].kind||'').indexOf('skinFoot')===0)sh.push(_skins[s]);}
  if(!bot||!sh.length)return;var n=0;
  for(s=0;s<sh.length;s++)n+=_tuckUnder(sh[s],[bot],{margin:0.05,maxd:0.18,bndr:0.03,islands:true});
  _tuckStats.schuh=n;}
// NAHT-SCHWEISSEN: offene raender einer haut-schale werden auf die OBERFLAECHE der nachbar-schale
// gezogen (handgelenk->koerperhaut, gesicht<->schaedel, fuss->koerperhaut). schreibt durch die
// geposten matrizen in die rest-daten -> die naht haelt in jeder pose.
function _boundaryVerts(geo){var ia=geo.index.array,EC={},i;
  for(i=0;i<ia.length;i+=3){var ee=[[ia[i],ia[i+1]],[ia[i+1],ia[i+2]],[ia[i+2],ia[i]]];
    for(var q=0;q<3;q++){var k=ee[q][0]<ee[q][1]?ee[q][0]+'_'+ee[q][1]:ee[q][1]+'_'+ee[q][0];EC[k]=(EC[k]||0)+1;}}
  var out={};for(var k2 in EC)if(EC[k2]===1){var pq=k2.split('_');out[+pq[0]]=1;out[+pq[1]]=1;}return out;}
function _seamBlend(a,b,maxR,f,opts){opts=opts||{};
  character.updateMatrixWorld(true);updateSkin(true);
  var pairs=opts.oneWay?[[a,b]]:[[a,b],[b,a]],charM=character.matrixWorld,inv=new Map(),wv=new THREE.Vector3(),moved=0;
  function invOf(nd){var m=inv.get(nd);if(!m){m=new THREE.Matrix4().copy(nd.matrixWorld).invert();inv.set(nd,m);}return m;}
  for(var pi=0;pi<pairs.length;pi++){var S=pairs[pi][0],D=pairs[pi][1];
    var bd=_boundaryVerts(S.geo),sp=S.geo.attributes.position.array;
    if(opts.lowBand){var mny=1e9,vk;for(vk in bd){var yv=sp[(+vk)*3+1];if(yv<mny)mny=yv;}
      for(vk in bd)if(sp[(+vk)*3+1]>mny+opts.lowBand)delete bd[vk];}   // nur der UNTERSTE ring (z.b. schaedelbasis), nicht die gesichtsoeffnung
    var dp=D.geo.attributes.position.array,dn=dp.length/3;
    var CELL=0.12,g={},i;
    for(i=0;i<dn;i++){var k=Math.floor(dp[i*3]/CELL)+'_'+Math.floor(dp[i*3+1]/CELL)+'_'+Math.floor(dp[i*3+2]/CELL);(g[k]||(g[k]=[])).push(i);}
    for(var vi in bd){var i2=+vi,px=sp[i2*3],py=sp[i2*3+1],pz=sp[i2*3+2];
      var gx=Math.floor(px/CELL),gy=Math.floor(py/CELL),gz=Math.floor(pz/CELL),best=maxR*maxR,bx=0,by=0,bz=0,hit=false;
      var RC=Math.max(1,Math.ceil(maxR/CELL));   // scan-radius an maxR gekoppelt (BUG: ±1 zelle fand bei maxR 0.34 nie einen partner -> hit=false -> naht tat NICHTS)
      for(var dx=-RC;dx<=RC;dx++)for(var dy=-RC;dy<=RC;dy++)for(var dz=-RC;dz<=RC;dz++){var L=g[(gx+dx)+'_'+(gy+dy)+'_'+(gz+dz)];if(!L)continue;
        for(var q2=0;q2<L.length;q2++){var j=L[q2],ddx=dp[j*3]-px,ddy=dp[j*3+1]-py,ddz=dp[j*3+2]-pz,dd=ddx*ddx+ddy*ddy+ddz*ddz;
          if(dd<best){best=dd;bx=dp[j*3];by=dp[j*3+1];bz=dp[j*3+2];hit=true;}}}
      if(!hit)continue;
      if(opts.minGap&&best<opts.minGap*opts.minGap)continue;   // echte luecke noetig -- anliegende raender nicht verziehen
      var nx=px+(bx-px)*f,ny=py+(by-py)*f,nz=pz+(bz-pz)*f;
      wv.set(nx,ny,nz).applyMatrix4(charM);
      var inf=S.infl[i2];for(var b3=0;b3<inf.length;b3++){var nd=inf[b3][0];_skTmp.copy(wv).applyMatrix4(invOf(nd));inf[b3][2]=_skTmp.x;inf[b3][3]=_skTmp.y;inf[b3][4]=_skTmp.z;}
      sp[i2*3]=nx;sp[i2*3+1]=ny;sp[i2*3+2]=nz;moved++;}}
  return moved;}
// KOMPAKTIERUNG: cull & insel-filter hinterlassen waisen-verts (harness: ~26k!), die das LBS
// jeden frame mitrechnet. remap auf nur-benutzte verts: -40% skinning-kosten, saubere raender.
function _compactSkins(){var saved=0;
  for(var s=0;s<_skins.length;s++){var sk=_skins[s],pa=sk.geo.attributes.position.array,ia=sk.geo.index.array,n=pa.length/3;
    var used=new Uint8Array(n),i;for(i=0;i<ia.length;i++)used[ia[i]]=1;
    var cnt=0;for(i=0;i<n;i++)if(used[i])cnt++;
    if(cnt===n)continue;
    var map=new Int32Array(n),np=new Float32Array(cnt*3),ninf=new Array(cnt),j=0;
    for(i=0;i<n;i++){if(!used[i]){map[i]=-1;continue;}map[i]=j;np[j*3]=pa[i*3];np[j*3+1]=pa[i*3+1];np[j*3+2]=pa[i*3+2];ninf[j]=sk.infl[i];j++;}
    var nix=new Uint32Array(ia.length);for(i=0;i<ia.length;i++)nix[i]=map[ia[i]];
    if(s===0){var _bm=map,_bn=cnt;                          // body-remap merken: exakt-huellen zeigen per index auf die haut!
      if(_exactSel){var ne=new Uint8Array(_bn);for(i=0;i<n;i++)if(_bm[i]>=0&&_exactSel[i])ne[_bm[i]]=1;_exactSel=ne;}
      for(var s9=1;s9<_skins.length;s9++){var GE9=_skins[s9];if(!GE9.exact||!GE9.srcSel)continue;
        var nsel=new Uint8Array(_bn),nmap=new Int32Array(_bn);nmap.fill(-1);
        for(i=0;i<n;i++)if(_bm[i]>=0){nsel[_bm[i]]=GE9.srcSel[i];nmap[_bm[i]]=GE9.srcMap[i];}
        GE9.srcSel=nsel;GE9.srcMap=nmap;}}
    sk.geo.setAttribute('position',new THREE.BufferAttribute(np,3));
    sk.geo.setIndex(new THREE.BufferAttribute(nix,1));
    if(sk.geo.attributes.normal)delete sk.geo.attributes.normal;
    sk.geo.computeVertexNormals();
    sk.infl=ninf;saved+=n-cnt;}
  _tuckStats.kompakt=saved;}
function _buildHemDyn(){_hemDyn=[];
  for(var s=1;s<_skins.length;s++){var sk=_skins[s];if(sk.kind!=='top'&&sk.kind!=='bottom')continue;
    var bd=_boundaryVerts(sk.geo),pa=sk.geo.attributes.position.array,vk;
    var bpos=[];for(vk in bd)bpos.push([pa[(+vk)*3],pa[(+vk)*3+1],pa[(+vk)*3+2]]);
    if(!bpos.length)continue;
    var n=pa.length/3,idx=[],i;
    for(i=0;i<n;i++){var px=pa[i*3],py=pa[i*3+1],pz=pa[i*3+2],near=false;
      for(var q=0;q<bpos.length;q++){var dx=bpos[q][0]-px,dy=bpos[q][1]-py,dz=bpos[q][2]-pz;
        if(dx*dx+dy*dy+dz*dz<0.01){near=true;break;}}
      if(near)idx.push(i);}
    if(!idx.length)continue;
    var m=idx.length,st=new Float32Array(m*6);
    for(i=0;i<m;i++){var j=idx[i];st[i*6]=pa[j*3];st[i*6+1]=pa[j*3+1];st[i*6+2]=pa[j*3+2];st[i*6+3]=pa[j*3];st[i*6+4]=pa[j*3+1];st[i*6+5]=pa[j*3+2];}
    _hemDyn.push({sk:sk,idx:idx,st:st});}
  var tot=0;_hemDyn.forEach(function(hb){tot+=hb.idx.length;});_tuckStats.saum=tot;}
function _weldSeams(){var bo=_skinByKind('skinBody'),n=0;
  var fa=_skinByKind('skinFace'),sk=_skinByKind('skinSkull');
  if(fa&&sk)n+=_seamBlend(fa,sk,0.10,0.6);
  ['1','-1'].forEach(function(sd){var h=_skinByKind('skinHand'+sd);if(h&&bo)n+=_seamBlend(h,bo,0.12,0.55);
    var ft=_skinByKind('skinFoot'+sd);if(ft&&bo)n+=_seamBlend(ft,bo,0.10,0.5);});
  _tuckStats.naht=n;}
// ROM-SELBSTTEST (range of motion, wie im studio-rigging): nach JEDEM ankleiden faehrt der
// charakter unsichtbar durch 6 extremposen; gezaehlt wird, wie oft die laufzeit-klammern
// eingreifen mussten und wie gross der groesste ausreisser (in einheiten) war. qualitaet
// wird damit MESSBAR: 'klammern' nahe 0 = die gewichts-vererbung traegt; grosse 'max'-werte
// zeigen die pose, in der die architektur noch arbeitet. regression = zahl, nicht zufallsfund.
function _romTest(){
  if(!_skins.length)return;
  var sv=[];function st(o,ax,v){if(!o)return;sv.push([o,ax,o.rotation[ax]]);o.rotation[ax]=v;}
  function pose(p){['1','-1'].forEach(function(sd){var s=(sd==='1')?1:-1;
    if(p.one&&sd==='-1')return;
    st(parts['arm'+sd],'z',s*p.aZ);st(parts['arm'+sd],'x',p.aX);st(parts['elbow'+sd],'x',-p.el);
    if(p.hX!==undefined){st(parts['hip'+sd],'x',p.hX);st(parts['hip'+sd],'z',s*(p.hZ||0));st(parts['knee'+sd],'x',p.kX||0);}});}
  var runs=[['ruhe',{aZ:0.10,aX:0.05,el:0.14}],
            ['guard',{aZ:0.14,aX:-0.45,el:1.35}],
            ['punch',{aZ:0.15,aX:-1.05,el:0.10}],
            ['jubel',{aZ:2.10,aX:-0.30,el:0.50}],
            ['hocke',{aZ:0.12,aX:0.05,el:0.20,hX:-0.85,kX:1.35,hZ:0.10}],
            ['kick',{aZ:0.30,aX:-0.25,el:0.60,hX:-1.35,kX:0.15,hZ:0.06,one:true}]];
  var rep=[],worst=0,worstName='';
  for(var r=0;r<runs.length;r++){sv.length=0;pose(runs[r][1]);_poseGuard();
    character.updateMatrixWorld(true);
    _romMeasure=true;_romCount=0;_romMax=0;updateSkin(true);_romMeasure=false;
    rep.push(runs[r][0]+' klammern='+_romCount+' max='+_romMax.toFixed(3));
    if(_romMax>worst){worst=_romMax;worstName=runs[r][0];}
    for(var u=sv.length-1;u>=0;u--)sv[u][0].rotation[sv[u][1]]=sv[u][2];}
  character.updateMatrixWorld(true);updateSkin();
  if(typeof console!=='undefined')console.log('ROM-test: '+rep.join(' | ')+(worst>0.05?('  <<< schlimmste pose: '+worstName):'  (alles im soll)'));}
// FACE-CULLING: tief verdeckte haut-faces LOESCHEN (industrie-standard) — was weg ist,
// kann in KEINER pose durchstechen. nur faces deren verts >=0.10 unter stoff liegen und
// deren gesamte 1-ring-nachbarschaft ebenfalls tief liegt (drift-sicherheitsband).
function _cullHiddenSkin(src,dsts){
  if(typeof process!=='undefined'&&process.env&&process.env.CULL==='0')return 0;
  character.updateMatrixWorld(true);updateSkin(true);
  var sp=src.geo.attributes.position.array,sn2=sp.length/3;
  var tris=[],yzb={},YZC=0.08,i,s;
  var bnd=[],bgrid={},BC=0.12;                            // stoff-GRENZEN (saeume/kragen): haut in deren naehe bleibt (ueberlapp-band)
  for(s=0;s<dsts.length;s++){var g=dsts[s].geo,pa=g.attributes.position.array,ia=g.index.array;
    var EC8={},k8;
    for(var f=0;f<ia.length;f+=3){var a=ia[f],b=ia[f+1],c=ia[f+2];
      var ee8=[[a,b],[b,c],[c,a]];
      for(var q8=0;q8<3;q8++){k8=ee8[q8][0]<ee8[q8][1]?ee8[q8][0]+'_'+ee8[q8][1]:ee8[q8][1]+'_'+ee8[q8][0];EC8[k8]=(EC8[k8]||0)+1;}
      var T=[pa[a*3],pa[a*3+1],pa[a*3+2],pa[b*3],pa[b*3+1],pa[b*3+2],pa[c*3],pa[c*3+1],pa[c*3+2]];
      var ti=tris.length;tris.push(T);
      var ylo=Math.floor(Math.min(T[1],T[4],T[7])/YZC),yhi=Math.floor(Math.max(T[1],T[4],T[7])/YZC);
      var zlo=Math.floor(Math.min(T[2],T[5],T[8])/YZC),zhi=Math.floor(Math.max(T[2],T[5],T[8])/YZC);
      for(var yy=ylo;yy<=yhi;yy++)for(var zz=zlo;zz<=zhi;zz++){var bk=s+'|'+yy+'_'+zz;(yzb[bk]||(yzb[bk]=[])).push(ti);}}
    for(k8 in EC8)if(EC8[k8]===1){var pq8=k8.split('_');
      var v8a=+pq8[0],v8b=+pq8[1];
      bnd.push([pa[v8a*3],pa[v8a*3+1],pa[v8a*3+2]]);bnd.push([pa[v8b*3],pa[v8b*3+1],pa[v8b*3+2]]);}}
  for(i=0;i<bnd.length;i++){var bb=bnd[i],bk8=Math.floor(bb[0]/BC)+'_'+Math.floor(bb[1]/BC)+'_'+Math.floor(bb[2]/BC);(bgrid[bk8]||(bgrid[bk8]=[])).push(i);}
  function nearBnd(px,py,pz,R){var gx=Math.floor(px/BC),gy=Math.floor(py/BC),gz=Math.floor(pz/BC),R2=R*R;
    for(var dx=-1;dx<=1;dx++)for(var dy=-1;dy<=1;dy++)for(var dz=-1;dz<=1;dz++){var L=bgrid[(gx+dx)+'_'+(gy+dy)+'_'+(gz+dz)];if(!L)continue;
      for(var q=0;q<L.length;q++){var bb2=bnd[L[q]],ddx=bb2[0]-px,ddy=bb2[1]-py,ddz=bb2[2]-pz;
        if(ddx*ddx+ddy*ddy+ddz*ddz<R2)return true;}}
    return false;}
  if(!tris.length)return 0;
  function insideDeep(px,py,pz){                          // +x-parity UND naechster oberflaechen-abstand grob (vert-sampling der getroffenen tris)
    var kk=Math.floor(py/YZC)+'_'+Math.floor(pz/YZC),deep=1e9,inAny=false;
    for(var s2=0;s2<dsts.length;s2++){var L=yzb[s2+'|'+kk];if(!L)continue;var hits=0;
      for(var q=0;q<L.length;q++){var T=tris[L[q]];
        var e1x=T[3]-T[0],e1y=T[4]-T[1],e1z=T[5]-T[2],e2x=T[6]-T[0],e2y=T[7]-T[1],e2z=T[8]-T[2];
        var pvy=-e2z,pvz=e2y,det=e1y*pvy+e1z*pvz;if(det>-1e-12&&det<1e-12)continue;
        var inv=1/det,ty=py-T[1],tz=pz-T[2];
        var u=(ty*pvy+tz*pvz)*inv;if(u<0||u>1)continue;
        var tx=px-T[0],qx=ty*e1z-tz*e1y;
        var v=qx*inv;if(v<0||u+v>1)continue;
        var qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x;
        var t2=(qx*e2x+qy*e2y+qz*e2z)*inv;
        if(t2>1e-9){hits++;if(t2<deep)deep=t2;}}
      if(hits%2===1)inAny=true;}
    return inAny?deep:-1;}
  var deep=new Uint8Array(sn2);
  for(i=0;i<sn2;i++){var px9=sp[i*3],py9=sp[i*3+1],pz9=sp[i*3+2];
    var dd=insideDeep(px9,py9,pz9);
    if(LM&&py9>LM.collarY-0.10&&Math.hypot(px9-LM.neckCX,pz9-LM.neckCZ)<Math.min(LM.neckR+0.20,LM.neckR*1.9-0.035))continue;  // KRAGENZONE ist per definition EINSEHBAR (blick ins kragenloch!) -- hals/nacken werden NIE gecullt
    if(_exactSel&&_exactSel[i]){if(!nearBnd(px9,py9,pz9,0.09))deep[i]=1;continue;}   // EXAKTE coverage: huellen-selektion IST die bedeckung (kein paritaets-raten)
    if(dd>0.018&&!nearBnd(px9,py9,pz9,0.07))deep[i]=1;}   // UEBERBACKEN: bedeckte haut wird GELOESCHT (profi-standard: hidden surface removal / body-mask), nur das saum-band bleibt
  var idx=src.geo.index.array,adj=[];                     // 1-ring erosion: nur wenn ALLE nachbarn tief
  for(i=0;i<sn2;i++)adj.push([]);
  for(i=0;i<idx.length;i+=3){var a4=idx[i],b4=idx[i+1],c4=idx[i+2];adj[a4].push(b4,c4);adj[b4].push(a4,c4);adj[c4].push(a4,b4);}
  var core=new Uint8Array(sn2);
  for(i=0;i<sn2;i++){if(!deep[i])continue;var ok=1,nb=adj[i];
    for(var n=0;n<nb.length;n++)if(!deep[nb[n]]){ok=0;break;}
    core[i]=ok;}
  var keep=[],culled=0;
  for(i=0;i<idx.length;i+=3){
    if(core[idx[i]]&&core[idx[i+1]]&&core[idx[i+2]]){culled++;continue;}
    keep.push(idx[i],idx[i+1],idx[i+2]);}
  src.geo.setIndex(keep);src.geo.index.needsUpdate=true;
  return culled;}
function _tuckPantsUnderTop(){                             // pass 2: HOSE unter TOP im ueberlapp-band (nesting-garantie fuer ALLE params)
  var top=null,bot=null;
  for(var s=1;s<_skins.length;s++){if(_skins[s].kind==='top')top=_skins[s];if(_skins[s].kind==='bottom')bot=_skins[s];}
  if(!top||!bot)return;
  var ia=top.geo.index.array,pa=top.geo.attributes.position.array,EC={},k;   // top-saum-y aus boundary-verts (p10)
  for(var f=0;f<ia.length;f+=3){var ee=[[ia[f],ia[f+1]],[ia[f+1],ia[f+2]],[ia[f+2],ia[f]]];
    for(var e2=0;e2<3;e2++){var p2=ee[e2][0]<ee[e2][1]?ee[e2][0]+'_'+ee[e2][1]:ee[e2][1]+'_'+ee[e2][0];EC[p2]=(EC[p2]||0)+1;}}
  var ys=[];
  for(k in EC)if(EC[k]===1){var pq=k.split('_');ys.push(pa[+pq[0]*3+1]);ys.push(pa[+pq[1]*3+1]);}
  if(!ys.length)return;
  ys.sort(function(a,b){return a-b;});
  var saumY=ys[0];                                         // echtes saum-minimum (p10 mischte aermel-loops rein)
  _tuckStats.hose=_tuckUnder(bot,[top],{margin:0.05,maxd:0.22,bndr:0.03,ymin:saumY+0.04});}
function buildOutfit(){clearGarments();_landmarks();_skins=[];_rtClamps=[];_hemDyn=null;_exactSel=null;_tuckStats.sdf=0;_outfitWT=collectWorldTagged(character);buildBodySkin();buildSkullSkin();buildFaceSkin();buildHandSkin('1');buildHandSkin('-1');buildTop(params.top,params.topColor);buildBottom(params.bottom,params.bottomColor);buildShoes(params.shoes,params.shoeColor);var _rb=_bindPose();character.updateMatrixWorld(true);_inheritWeights();_tuckSkinUnderCloth();_cullSkin();_compactSkins();_tuckPantsUnderTop();_tuckShoesUnderPants();_weldSeams();_buildRuntimeClamps();_rb();character.updateMatrixWorld(true);_buildHemDyn();if(typeof console!=='undefined')console.log('dress: erbe='+(_tuckStats.erb||0)+' haut='+(_tuckStats.haut||0)+' hose='+(_tuckStats.hose||0)+' schuh='+(_tuckStats.schuh||0)+' cull='+(_tuckStats.cull||0)+' kompakt='+(_tuckStats.kompakt||0)+' naht='+(_tuckStats.naht||0)+' saum='+(_tuckStats.saum||0)+' sdf='+(_tuckStats.sdf||0)+' klammern='+(_tuckStats.klam||0));_outfitWT=null;updateSkin();_hideRigParts();_romTest();}
var _dressT=null;function dressSoon(){if(_dressT)clearTimeout(_dressT);_dressT=setTimeout(buildOutfit,150);}  // debounce: rebuild garments after slider settles
function morph(){/* KONVERGENZ-WELLE: die morph-ANWENDUNG (teil->formel-tabelle) wohnt im gesetzbuch (__koerperCore.morphAuf, verbatim gewandert; beweis: 5-kombi-gitter 0 abweichungen) -- die shell reicht nur noch dials, dann UI. */window.__koerperCore.morphAuf({character:character,parts:parts,base:base},params);updateHairScale();updateLabel();updateSkin();}
function updateLabel(){const lbl=document.getElementById('presetLabel');const age=Math.round(18+params.age*62);let body='athletisch',gen='Mann';if(params.mass>0.6)body='übergewichtig';else if(params.mass<0.2)body='mager';else if(params.tone>0.7)body='muskulös';else if(params.tone<0.3)body='schlank';if(params.gender<0.3)gen='Frau';else if(params.gender<0.6)gen='androgyn';lbl.textContent=`${body} ${gen} · ${age}`;}
var gC=document.createElement('canvas');gC.width=gC.height=512;var gx=gC.getContext('2d');var gg=gx.createRadialGradient(256,256,40,256,256,250);gg.addColorStop(0,'#1a1610');gg.addColorStop(0.4,'#0d0a07');gg.addColorStop(1,'#050302');gx.fillStyle=gg;gx.fillRect(0,0,512,512);var gTex=new THREE.CanvasTexture(gC);var groundMat=new THREE.MeshStandardMaterial({map:gTex,roughness:0.96,metalness:0});var groundMesh=new THREE.Mesh(new THREE.CircleGeometry(20,64),groundMat);groundMesh.rotation.x=-Math.PI/2;groundMesh.position.y=-0.002;groundMesh.receiveShadow=true;scene.add(groundMesh);
var csMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false});var contactShadow=new THREE.Mesh(new THREE.CircleGeometry(1,48),csMat);contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=0.001;scene.add(contactShadow);
scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.6));
const key=new THREE.DirectionalLight(0xffe0b0,3.0);key.position.set(5,8,5);key.castShadow=true;key.shadow.mapSize.width=2048;key.shadow.mapSize.height=2048;key.shadow.bias=-0.0001;key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;scene.add(key);
const rimL=new THREE.DirectionalLight(0x33aaff,2.0);rimL.position.set(-5,4,-5);scene.add(rimL);
const composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.3,0.4,0.9));const fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
const cine={uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float time;varying vec2 vUv;float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}float getLum(vec2 uv){return dot(texture2D(tDiffuse,uv).rgb,vec3(0.299,0.587,0.114));}void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float dist=length(dir);vec2 offset=dir*dist*0.0035;float r=texture2D(tDiffuse,uv+offset).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-offset).b;vec3 color=vec3(r,g,b);float lum=getLum(uv);float lL=getLum(uv-vec2(0.001,0.0)),lR=getLum(uv+vec2(0.001,0.0)),lU=getLum(uv-vec2(0.0,0.001)),lD=getLum(uv+vec2(0.0,0.001));float edge=abs(lL-lum)+abs(lR-lum)+abs(lU-lum)+abs(lD-lum);color*=(1.0+edge*0.55);color*=smoothstep(1.2,0.1,dist*1.3);color+=random(uv+time)*0.014-0.007;gl_FragColor=vec4(color,1.0);}`};const cinePass=new THREE.ShaderPass(cine);cinePass.renderToScreen=true;composer.addPass(cinePass);
const controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,trochanterY,0);controls.minDistance=3;controls.maxDistance=15;controls.autoRotateSpeed=0.8;controls.update();
const slMap={height:'sHeight',mass:'sMass',tone:'sTone',age:'sAge',gender:'sGender',hairLen:'sHairLen',hairVol:'sHairVol',arms:'sArms'};const valMap={height:'vHeight',mass:'vMass',tone:'vTone',age:'vAge',gender:'vGender',hairLen:'vHairLen',hairVol:'vHairVol',arms:'vArms'};function fmtVal(k){if(k==='height')return params.height.toFixed(2);if(k==='age')return Math.round(18+params.age*62);return Math.round(params[k]*100)+'%';}function syncUI(){for(let k in slMap){document.getElementById(slMap[k]).value=params[k];document.getElementById(valMap[k]).textContent=fmtVal(k);}}for(let k in slMap){document.getElementById(slMap[k]).addEventListener('input',e=>{params[k]=parseFloat(e.target.value);document.getElementById(valMap[k]).textContent=fmtVal(k);morph();dressSoon();});}document.getElementById('btnReset').addEventListener('click',()=>{Object.assign(params,{height:1.0,mass:0.35,tone:0.5,age:0.15,gender:1.0,hairLen:1.0,hairVol:1.0,arms:0.0,hairStyle:'mittel',hairColor:'darkbrown',top:'tshirt',topColor:'navy',bottom:'pants',bottomColor:'charcoal',shoes:'sneaker',shoeColor:'white'});syncUI();syncPickers();_skinRepaint(SKIN_TONES[params.skinTone].hex);buildHair();morph();buildOutfit();});document.getElementById('btnRandom').addEventListener('click',()=>{params.height=0.9+Math.random()*0.25;params.mass=Math.random();params.tone=Math.random();params.age=Math.random()*0.8;params.gender=Math.random();params.hairLen=0.3+Math.random()*1.5;params.hairVol=0.6+Math.random()*1.2;params.arms=Math.random()*0.3;var hk=Object.keys(HAIRSTYLES);params.hairStyle=hk[Math.floor(Math.random()*hk.length)];params.hairColor=randKey(HAIR_COLORS);params.top=randPick(['tshirt','pullover','tank','poncho','tshirt','pullover']);params.topColor=randKey(CLOTH_COLORS);params.bottom=randPick(['pants','shorts','pants']);params.bottomColor=randKey(CLOTH_COLORS);params.shoes=randPick(['sneaker','boot','sneaker']);params.shoeColor=randKey(CLOTH_COLORS);params.skinTone=randKey(SKIN_TONES);_skinRepaint(SKIN_TONES[params.skinTone].hex);syncUI();syncPickers();buildHair();morph();buildOutfit();});document.querySelectorAll('#emotions button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#emotions button').forEach(function(b2){b2.classList.remove('active');});b.classList.add('active');emoMode=b.dataset.e;emo.set(emoMode);});});
function randPick(a){return a[Math.floor(Math.random()*a.length)];}
function randKey(o){var k=Object.keys(o);return k[Math.floor(Math.random()*k.length)];}
function buildSwatches(containerId,palette,getKey,onPick){var cont=document.getElementById(containerId);if(!cont)return;cont.innerHTML='';Object.keys(palette).forEach(function(key){var sw=document.createElement('div');sw.className='sw';sw.title=palette[key].name;var hex=(palette[key].base!=null)?palette[key].base:palette[key].hex;sw.style.background='#'+('000000'+hex.toString(16)).slice(-6);if(key===getKey())sw.classList.add('active');sw.addEventListener('click',function(){cont.querySelectorAll('.sw').forEach(function(x){x.classList.remove('active');});sw.classList.add('active');onPick(key);});cont.appendChild(sw);});}
function wirePicker(containerId,attr,onPick){var cont=document.getElementById(containerId);if(!cont)return;cont.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){cont.querySelectorAll('button').forEach(function(x){x.classList.remove('active');});b.classList.add('active');onPick(b.dataset[attr]);});});}
function syncPickers(){[['hairStyles','h','hairStyle'],['topStyles','t','top'],['botStyles','b','bottom'],['shoeStyles','s','shoes']].forEach(function(c){var cont=document.getElementById(c[0]);if(cont)cont.querySelectorAll('button').forEach(function(b){b.classList.toggle('active',b.dataset[c[1]]===params[c[2]]);});});buildSwatches('skinTones',SKIN_TONES,function(){return params.skinTone;},function(k){params.skinTone=k;_skinRepaint(SKIN_TONES[k].hex);});buildSwatches('hairColors',HAIR_COLORS,function(){return params.hairColor;},function(k){params.hairColor=k;buildHair();});buildSwatches('topColors',CLOTH_COLORS,function(){return params.topColor;},function(k){params.topColor=k;buildOutfit();});buildSwatches('botColors',CLOTH_COLORS,function(){return params.bottomColor;},function(k){params.bottomColor=k;buildOutfit();});buildSwatches('shoeColors',CLOTH_COLORS,function(){return params.shoeColor;},function(k){params.shoeColor=k;buildOutfit();});}
wirePicker('hairStyles','h',function(v){params.hairStyle=v;buildHair();});
wirePicker('topStyles','t',function(v){params.top=v;buildOutfit();});
wirePicker('botStyles','b',function(v){params.bottom=v;buildOutfit();});
wirePicker('shoeStyles','s',function(v){params.shoes=v;buildOutfit();});
syncPickers();
morph();buildOutfit();syncUI();emo.set('idle');
const clock=new THREE.Clock(); var blinkTimer=0;
function animate(){requestAnimationFrame(animate);var dt=1/60,t=clock.getElapsedTime();matSkin.userData.uTime.value=t;cinePass.uniforms.time.value=t;controls.autoRotate=(emoMode==='showcase');if(play.on)playInput(dt);emo.update(dt,t);var bm=emo.getBeh(t);var e=emo.cur;
var targetY=bm.jumpY||0;var dy=targetY-bodyPhys.y;bodyPhys.vy+=dy*300*dt;bodyPhys.vy-=25*dt;bodyPhys.vy*=0.88;bodyPhys.y+=bodyPhys.vy*dt;if(bodyPhys.y<0){bodyPhys.y=0;if(bodyPhys.vy<0)bodyPhys.vy*=-0.15;}
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
var tensionMul=1+bm.tensionBoost;phys.bicepR.target=_pn(t,1.5,17)*0.018*tensionMul;phys.bicepL.target=_pn(t,1.5,18)*0.018*tensionMul;phys.quadR.target=_pn(t,1.2,19)*0.012*tensionMul;phys.quadL.target=_pn(t,1.2,20)*0.012*tensionMul;
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
if(parts.chest){parts.chest.scale.x=parts.chest.userData.baseScaleX*(1+phys.chestY.current);parts.chest.scale.y=parts.chest.userData.baseScaleY*(1+phys.breath.current);parts.chest.scale.z=parts.chest.userData.baseScaleZ*(1+phys.breath.current*0.5);}
if(parts.abs)parts.abs.scale.y=parts.abs.userData.baseScaleY*(1+phys.breath.current*0.7);
if(parts.ribcage&&parts.ribcage.userData.baseScaleY)parts.ribcage.scale.y=parts.ribcage.userData.baseScaleY*(1+phys.breath.current*0.3);
if(parts['bicep1'])parts['bicep1'].scale.y=parts['bicep1'].userData.baseScaleY*(1+phys.bicepR.current);
if(parts['bicep-1'])parts['bicep-1'].scale.y=parts['bicep-1'].userData.baseScaleY*(1+phys.bicepL.current);
if(parts['quad1'])parts['quad1'].scale.y=parts['quad1'].userData.baseScaleY*(1+phys.quadR.current);
if(parts['quad-1'])parts['quad-1'].scale.y=parts['quad-1'].userData.baseScaleY*(1+phys.quadL.current);
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
var fistTarget=0,palmTarget=0;if(emoMode==='fight'){fistTarget=1.0;palmTarget=1.0;}else if(emoMode==='angry'){fistTarget=0.6;palmTarget=0.5;}else if(emoMode==='fear'){fistTarget=0.22+_pn(t,7.0,26)*0.05;}else if(emoMode==='run'){fistTarget=0.15;}else{fistTarget=0.06+_pn(t,0.35,24)*0.05;}
var _fk=1-Math.exp(-3.7*dt);fistState.r+=(fistTarget-fistState.r)*_fk;fistState.l+=(fistTarget-fistState.l)*_fk;palmState.r+=(palmTarget-palmState.r)*_fk;palmState.l+=(palmTarget-palmState.l)*_fk;
function applyFP(hand,fs,ps){if(!hand)return;if(hand.userData.palmG)hand.userData.palmG.rotation.y=hand.userData.sd*ps*Math.PI/2;if(hand.userData.fingers)hand.userData.fingers.forEach(function(f){f.mcp.rotation.x=fs*1.0;f.pip.rotation.x=fs*1.3;f.dip.rotation.x=fs*0.8;});if(hand.userData.thumbs)hand.userData.thumbs.forEach(function(th){th.mcp.rotation.x=fs*0.5;th.ip.rotation.x=fs*0.6;});}
applyFP(parts['hand1'],fistState.r,palmState.r);applyFP(parts['hand-1'],fistState.l,palmState.l);
blinkTimer+=dt;var rate=Math.max(0.1,e.blinkRate);
if(blinkTimer>=_blkNext){blinkTimer=0;_blkNext=(0.55+Math.random()*0.95)/rate;_blkPh=0;}   // randomisierte intervalle: kein metronom-blinzeln mehr
if(_gz.blinkKick){_gz.blinkKick=false;if(_blkPh>0.1)_blkPh=0;}                             // sakkade loest blinzeln aus (menschlicher reflex)
var blink=1.0;
if(_blkPh<0.09){_blkPh+=dt;var _bf=Math.min(1,_blkPh/0.09);blink=_bf<0.45?1.0-(_bf/0.45)*0.7:0.3+((_bf-0.45)/0.55)*0.7;}
if(lidTL)lidTL.scale.y=0.35*blink;if(lidTR)lidTR.scale.y=0.35*blink;
var irisX=_gz.x*0.016+_pn(t,2.0+e.irisSpeed*2.0,22)*0.003;var irisY=_gz.y*0.010+_pn(t,1.6+e.irisSpeed*1.6,23)*0.002;if(irisL)irisL.position.set(irisX,irisY,0.08);if(irisR)irisR.position.set(irisX,irisY,0.08);
var browAng=0;if(emoMode==='angry')browAng=-0.15+bm.browBoost;else if(emoMode==='sad')browAng=0.1;else if(emoMode==='fear')browAng=0.16;else if(emoMode==='joy')browAng=0.05;else if(emoMode==='fight')browAng=-0.08;else browAng=bm.browBoost;if(browL){browL.rotation.z=-0.1-browAng*0.5;browL.position.y=browY+0.03+browAng*0.02;}if(browR){browR.rotation.z=0.1+browAng*0.5;browR.position.y=browY+0.03+browAng*0.02;}
var smile=0;if(emoMode==='joy')smile=0.18;else if(emoMode==='sad')smile=-0.1;else if(emoMode==='angry')smile=-0.06;else if(emoMode==='fear')smile=-0.03;else if(emoMode==='run')smile=-0.02;else if(emoMode==='fight')smile=-0.04;smile+=bm.mouthBoost;var lipBreath=Math.sin(t*e.freq)*0.004;if(upperLipRef)upperLipRef.scale.x=1.6+smile;if(lowerLipRef)lowerLipRef.scale.x=1.45+smile*0.8;if(upperLipRef)upperLipRef.position.y=lipY+0.02+lipBreath;if(lowerLipRef)lowerLipRef.position.y=lipY-0.06-lipBreath;
if(contactShadow){var bh=bodyPhys.y+groundSmooth;contactShadow.material.opacity=0.35*Math.max(0.1,1-bh*2);contactShadow.scale.setScalar(3.0*Math.max(0.3,1+bh*0.5));}
fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);if(play.on)playPhysics(dt);else controls.update();_lastDT=dt;_poseGuard();updateSkin(true);_nrmAcc+=dt;if(_nrmAcc>0.12){_nrmAcc=0;for(var _si=0;_si<_skins.length;_si++)_skins[_si].geo.computeVertexNormals();}composer.render();}
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
var keys={};
function setAnim(n){if(play.anim!==n){play.anim=n;emoMode=n;emo.set(n);}}
addEventListener('keydown',function(ev){if(!play.on)return;keys[ev.code]=true;
  if(ev.code==='KeyC')play.cam=(play.cam==='third')?'fps':'third';
  if(ev.code==='Escape')exitPlay();
  if(ev.code==='Space'&&!ev.repeat)play.jbuf=0.12;                                    // JUMP BUFFER (Celeste-standard)
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
  play.coyote=play.onGround?0.12:Math.max(0,play.coyote-dt);                          // COYOTE TIME (Celeste)
  play.jbuf=Math.max(0,play.jbuf-dt);play.wallT=Math.max(0,play.wallT-dt);
  if(play.slide>0){ play.slide-=dt; var sk=Math.pow(0.43,dt); play.vx*=sk; play.vz*=sk; if(play.slide<=0){play.vx*=0.72;play.vz*=0.72;} return; }
  var fx=Math.sin(play.yaw),fz=Math.cos(play.yaw),rx=-Math.cos(play.yaw),rz=Math.sin(play.yaw);   // right = cross(forward,up): A/D korrekt
  var mf=(keys['KeyW']?1:0)-(keys['KeyS']?1:0),ms=(keys['KeyD']?1:0)-(keys['KeyA']?1:0);
  play.sprint=!!keys['ShiftLeft']; var moving=(mf||ms),sp0=Math.hypot(play.vx,play.vz);
  play.crouch=!!keys['ControlLeft']&&play.onGround&&play.slide<=0&&sp0<=7.0;          // HOLD-CROUCH (Apex: slide chained in crouch)
  var spd=play.crouch?4.6:(keys['ControlLeft']?6.0:(play.sprint?18:10.5));
  var tx=fx*mf+rx*ms,tz=fz*mf+rz*ms,L=Math.hypot(tx,tz);if(L>0){tx/=L;tz/=L;}
  var ka=play.onGround?((L>0)?(1-Math.pow(0.002,dt)):(1-Math.pow(0.00008,dt))):(1-Math.pow(0.18,dt));  // MOMENTUM zwei-raten: sanft ran (flow), knackig stoppen, luft traege
  play.vx+=(tx*spd-play.vx)*ka; play.vz+=(tz*spd-play.vz)*ka;
  if(moving)play.faceYaw=Math.atan2(play.vx,play.vz);
  if(play.jbuf>0){
    if(play.coyote>0){play.vy=15.5;play.onGround=false;play.coyote=0;play.jbuf=0;play.crouch=false;}          // gepufferter bodensprung
    else if(play.wallT>0&&mf<=0){play.vy=14.5;play.vx=play.wallNX*11+play.vx*0.25;play.vz=play.wallNZ*11+play.vz*0.25;  // WANDSPRUNG (kick weg; W halten = klettern)
      play.faceYaw=Math.atan2(play.vx,play.vz);play.wjT=0.34;play.jbuf=0;play.wallT=0;}
    else if(play.airJumps>0){play.airJumps--;play.vy=Math.max(play.vy+2.5,13.8);play.djT=0.42;play.jbuf=0;}   // DOPPELSPRUNG (tuck)
  }
  if(play.touchWall&&keys['Space']&&mf>0&&!play.onGround)play.vy=Math.max(play.vy,8.5);
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
// koerper fuehren, nur nicht IN ihn. also: torso-kapsel (pelvis->neckBase, folgt der lehne, radius
// skaliert mit der taille) -- nur bei echter penetration wird der arm minimal herausrotiert.
var _pgV1,_pgV2,_pgV3,_pgM;                               // lazy-init im guard: immun gegen aufruf-reihenfolge (buildOutfit->romTest laeuft VOR dieser zeile!)
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
  if(!parts.pelvis||!parts.neckBase)return;
  character.updateMatrixWorld(true);
  _pgM.copy(character.matrixWorld).invert();
  parts.pelvis.getWorldPosition(_pgV1);_pgV1.applyMatrix4(_pgM);
  parts.neckBase.getWorldPosition(_pgV2);_pgV2.applyMatrix4(_pgM);
  var wR=(parts.waist&&base.waist)?(parts.waist.scale.x/base.waist.x):1;
  var torsoR=0.30*Math.max(0.8,wR)+0.08;                  // torso-radius + unterarm-radius/marge (fette figur schiebt kauernde arme weiter raus -- korrekt!)
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
  var cad=sp*0.155+moveB*0.45;                         // cadence ~ speed (limits foot-slip)
  play.gaitPhase=(play.gaitPhase+cad*dt)%1;var ph=play.gaitPhase,T=Math.PI*2,aS=Math.cos(ph*T);
  var cb=play.crB=play.crB+((play.crouch?1:0)-play.crB)*(1-Math.pow(0.0008,dt));      // crouch-blend
  var lk=play.landK;
  var stride=(0.5+g*2.4)*(1-cb*0.45),lift=(0.28+g*1.30)*(1-cb*0.5),duty=0.64-g*0.30,standY=standYBase*(1-g*0.16);
  standY=_mix(standY,standYBase*0.66,cb)+lk*0.95;                                      // crouch-tiefe + LANDE-KOMPRESSION
  var pL=ph,pR=(ph+0.5)%1;
  var fL=footPath(pL,stride,lift,standY,duty),fR=footPath(pR,stride,lift,standY,duty);
  // PER-FOOT GROUND-ADAPTIVE IK (Uncharted-stil): jeder fuss sampelt seinen support an seiner geplanten XZ
  var yw=character.rotation.y,sYw=Math.sin(yw),cYw=Math.cos(yw),ppx=character.position.x,ppz=character.position.z,cSup=play.posY-FOOT;
  var dfL=footSupOff(ppx+(-0.52)*cYw+fL.z*sYw,ppz-(-0.52)*sYw+fL.z*cYw,cSup),dfR=footSupOff(ppx+(0.52)*cYw+fR.z*sYw,ppz-(0.52)*sYw+fR.z*cYw,cSup);
  play.fOffL+=_clamp(dfL-play.fOffL,-6*dt,6*dt);play.fOffR+=_clamp(dfR-play.fOffR,-6*dt,6*dt);  // slew-limit gegen pops
  fL.y+=play.fOffL+play.susp;fR.y+=play.fOffR+play.susp;                              // feder von den BEINEN geschluckt: koerper=smY, sohlen=support
  var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);
  var stL=solveIK(standY+play.fOffL+play.susp,0,L1,L2),stR=solveIK(standY+play.fOffR+play.susp,0,L1,L2);   // auch im STAND per-fuss (idle auf treppe)
  var hipR=_mix(stR.hip,ikR.hip,moveB),knR=_mix(stR.knee,ikR.knee,moveB),ankR=-(hipR+knR)+_mix(0,anklePhase(pR,duty),moveB);  // ankle WELT-referenziert: sohle flach + rollkurve
  var hipL=_mix(stL.hip,ikL.hip,moveB),knL=_mix(stL.knee,ikL.knee,moveB),ankL=-(hipL+knL)+_mix(0,anklePhase(pL,duty),moveB);
  P['hip1'].rotation.set(hipR,0,0.05);P['knee1'].rotation.x=knR;P['ankle1'].rotation.x=ankR;
  P['hip-1'].rotation.set(hipL,0,-0.05);P['knee-1'].rotation.x=knL;P['ankle-1'].rotation.x=ankL;
  var armAmp=(0.12+g*1.15)*moveB;
  _setArm('1',-aS*armAmp,(0.05+g*0.10)*moveB,0.15+moveB*(g*0.9+Math.max(0,-aS)*0.45*g));
  _setArm('-1', aS*armAmp,(0.05+g*0.10)*moveB,0.15+moveB*(g*0.9+Math.max(0, aS)*0.45*g));
  var accel=_clamp((sp-play.prevSp)/Math.max(dt,1e-3)*0.010,-0.10,0.16);
  var turn=_clamp(((((play.faceYaw-play.prevFace+Math.PI)%T)+T)%T-Math.PI)/Math.max(dt,1e-3)*0.05,-0.22,0.22);
  if(lk>0.25){_setArm('1',-0.7*lk,0.3*lk+0.05,0.9*lk+0.2);_setArm('-1',-0.7*lk,0.3*lk+0.05,0.9*lk+0.2);}   // arme fangen den aufprall
  parts.torso.rotation.set(g*0.30+cb*0.24+lk*0.35+play.susp*0.30, aS*g*0.22*moveB, aS*(0.03+g*0.04)*moveB + Math.sin(t*0.8)*0.01*(1-moveB));
  character.rotation.x=g*0.16+accel; character.rotation.z=-turn*moveB;
  headGroup.rotation.set(-0.03-g*0.07-cb*0.10-lk*0.18-play.susp*0.12, -aS*g*0.13*moveB, 0);
  if(play.cam==='third'){var dh=((play.yaw-yw+Math.PI)%T+T)%T-Math.PI;headGroup.rotation.y+=_clamp(dh,-0.6,0.6)*0.38*(1-g*0.4);}      // HEAD-LOOK zur kamera (TLOU)
  var wS=Math.max(0.12,1-moveB),wR=(pR<duty?1:wS),wL=(pL<duty?1:wS);                  // stance-gewichteter pelvis-plant
  var cR=play.fOffR+footBelowAnkle-trochanterY-ankleYFromAngles(hipR,knR),cL=play.fOffL+footBelowAnkle-trochanterY-ankleYFromAngles(hipL,knL);
  var gY=(cR*wR+cL*wL)/(wR+wL);
  var bob=Math.pow(Math.abs(Math.sin(ph*T)),0.6)*(g*0.30)*moveB;
  character.position.y=play.posY+gY+bob;
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
  play.vy-=44*dt;if(play.vy<-40)play.vy=-40;play.posY+=play.vy*dt;footY=play.posY-FOOT;
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
    var ks=1-Math.pow(0.0016,dt);
    play.camX=_mix(play.camX,icx,ks);play.camY=_mix(play.camY,icy,ks);play.camZ=_mix(play.camZ,icz,ks);
    play.lookX=_mix(play.lookX,ltx,ks*1.4);play.lookY=_mix(play.lookY,lty,ks*1.4);play.lookZ=_mix(play.lookZ,ltz,ks*1.4);
    // keep camera above ground / out of platforms
    var camG=0;for(var i=0;i<parkBoxes.length;i++){var b=parkBoxes[i];if(inXZ(play.camX,play.camZ,b,0.3)&&b.maxY<character.position.y+6&&b.maxY+0.8>camG)camG=b.maxY+0.8;}
    if(play.camY<camG)play.camY=camG;
    camera.position.set(play.camX,play.camY,play.camZ);camera.lookAt(play.lookX,play.lookY,play.lookZ);
  }else{
    if(headGroup)headGroup.visible=false;if(typeof hairGroup!=='undefined'&&hairGroup)hairGroup.visible=false;
    var hp=new THREE.Vector3();if(headGroup)headGroup.getWorldPosition(hp);else hp.set(character.position.x,character.position.y+5,character.position.z);
    camera.position.set(hp.x,hp.y+0.15,hp.z);
    var lx=Math.sin(play.yaw)*Math.cos(play.pitch),ly=Math.sin(play.pitch),lz=Math.cos(play.yaw)*Math.cos(play.pitch);
    camera.lookAt(hp.x+lx,hp.y+0.15+ly,hp.z+lz);}
}
// ===================== END PLAY SYSTEM =====================
var BUILD='B64·benchmark';console.log('%cDA VINCI BUILD '+BUILD,'color:#7fd;font-weight:bold');
/* ============================== META-REGELN (B25 -> B31) ==============================
   Jede aenderung an dieser datei wird an diesen prinzipien gemessen:
   1. FEHLERKLASSEN toeten, nicht instanzen -- erst die ursache benennen, dann patchen.
   2. Was nie sichtbar sein kann, darf nicht EXISTIEREN (verdeckte haut wird geloescht, nicht versteckt).
   3. Invarianten in POSEN-INVARIANTEN raeumen herstellen -- die gesamte ankleide-pipeline misst in der bind-pose.
   4. EIN deformationsfeld: stoff ERBT haut-gewichte (K=4 interpoliert + 2x geglaettet) -- drift hat keine ursache mehr.
   5. Garantien PRO FRAME statt pro rebuild (laufzeit-klammern, kapsel-pushout) -- gilt fuer ALLE posen, nicht fuer gemessene.
   6. Verhindern an der QUELLE statt kaschieren am ende (gelenk-limits laufen VOR dem skinning).
   7. MESSEN statt anschauen -- der ROM-selbsttest macht qualitaet zur zahl (konsole: klammern/max pro extrempose).
   8. Jede neue regel gegen LEGITIME faelle pruefen -- hook-punch und angst-kauern brachen an den v1-limits!
   9. Schichten duerfen versagen, das system nicht: erben traegt > klammern versichern > cull eliminiert > limits verhindern > ROM misst.
   ====================================================================================== */
(function(){var d=document.createElement('div');d.id='buildtag';d.textContent=BUILD;d.style.cssText='position:fixed;right:8px;bottom:6px;font:10px monospace;color:#9fb2c8;opacity:.45;z-index:99;pointer-events:none;';document.body.appendChild(d);})();
animate();addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});

/* ==================== W12-PORTAL-BRÜCKE (AnazhRealm-Heimat) ==================== */
/* Das fachwerk.js-Muster: enter/ready-Handshake, die DSL spricht die ECHTEN
   UI-Pfade — die acht Bewegungs-/Emotions-Profile leben als #emotions-Buttons
   (data-e, click() → emo.set), "zufall"/"zuruecksetzen" klicken btnRandom/
   btnReset (exakt der Nutzer-Pfad). DSL-Wörter deutsch (Registry == Brücke
   wortgleich). Esc meldet die Heimkehr — im Ninja-Park-Spielmodus gehört Esc
   dem exitPlay (eigener Handler oben), die Brücke schweigt dort. */
(function () {
    if (typeof window === "undefined" || !window.parent || window.parent === window) return;
    function post(m) {
        try {
            window.parent.postMessage(m, "*");
        } catch (_e) {}
    }
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
    var DSL = Object.keys(EMOTION).concat(["zufall", "zuruecksetzen"]);
    var LABEL = "Da Vinci Studio — Lebendiger Mensch";
    function clickId(id) {
        var b = document.getElementById(id);
        if (b) b.click();
        return !!b;
    }
    window.addEventListener("message", function (ev) {
        if (ev.source !== window.parent) return;
        var msg = ev.data;
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "enter") {
            post({ type: "ready", world: "koerperstudio", label: LABEL, dsl: DSL });
        } else if (msg.type === "dsl" && Array.isArray(msg.program)) {
            for (var i = 0; i < msg.program.length; i++) {
                var op = msg.program[i];
                var word = String((op && op[0]) || op || "")
                    .toLowerCase()
                    .trim();
                if (EMOTION[word]) {
                    var b = document.querySelector('#emotions button[data-e="' + EMOTION[word] + '"]');
                    if (b) b.click();
                } else if (word === "zufall") clickId("btnRandom");
                else if (word === "zuruecksetzen") clickId("btnReset");
            }
        }
    });
    window.addEventListener("keydown", function (ev) {
        if (ev.key !== "Escape") return;
        if (typeof play !== "undefined" && play && play.on) return; /* Esc = Ninja-Park verlassen (exitPlay) */
        post({ type: "exit", world: "koerperstudio" });
    });
    post({ type: "ready", world: "koerperstudio", label: LABEL, dsl: DSL });
})();
