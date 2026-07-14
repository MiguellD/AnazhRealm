// AnazhRealm — porta-core.js: DER TOR-STUDIO-KERN (Studio-Vertrag Phase 2, der ε-BEWEIS).
// Die generative Substanz des Porta-Labors (worlds/portale/porta.js — PORTA ·
// ORDNUNGEN + FRAKTAL): die sieben Tor-Ordnungen · die Stich→Schub→Dicke-Lehre
// (deriveGate) · der EINE Builder (Strategien Mauerwerk/Geflecht/Monolith/Filigran
// × zurückweichende Ordnungen) · Türen E/R · Fundament-Vokabular. Byte-treu aus
// dem Schöpfer-Werk extrahiert (Zeilen-Slices, Paritäts-Hash-bewiesen) — die
// Shell UND AnazhRealm lesen DIESE eine Quelle (G2.1), ein Nachbau ist verboten.
//
// FORM (Vertrag v1.1 §7 N7.2): namespaced IIFE __portaCore — jeder WEITERE Kern
// einer Laufzeit trägt keine Top-Level-Globals (const-Kollision mit foundry-core
// STUDIO_VERTRAG/PORTAL_RENDER_CONFIG/PRESETS im selben Worker). Die Manifest-
// Blöcke (B1 PRESETS · B2 buildInstance+kindStages · B4 PARAMS · STUDIO_VERTRAG)
// leben unter dem Namensraum, namens- und formgleich zu §3; der Validator
// (gate:studio-vertrag) mappt per Manifest-ns — exakt die vehicle-core-Form.
//
// DETERMINISMUS (G2.3): der Bau zieht seine Zufälligkeit aus dem LAB-FESTEN
// Strom mulberry32(0x50FA) (Verwitterungs-Jitter · Ruinen-Schutt — byte-treu zur
// Vorlage). Das seed-Argument reist mit (Vertrags-Signatur) und ist RESERVIERT
// wie beim Fahrzeug-Kern: buildInstance(id, 7, …) == buildInstance(id, 12345, …)
// byte-gleich — eingefroren in spec/asset-contract/v4 (cv:4). Eine künftige
// Seed-Variation ist ein bewusster Golden-Re-Mint, kein Drift.
//
// SCHNITT-GRENZE (bewusst): der Kern trägt die STRUKTUR des Tors (Rahmen-
// Ordnungen · Türen · Fundament · Apertur-Glut-Kante). Die PASSAGE-Membran
// (Raymarch-ShaderMaterial) + der volumetrische Bodennebel bleiben in der
// Lab-Shell — sie sind Renderer-gebundene Portal-FX (depthRT/Kamera/Composer),
// keine Mesh-Substanz; in der Hauptwelt ist der Welt-Übergang das Host-Verb
// `portal` (Nervensystem-Plan §2.3), der benannte ε-Folge-Anschluss.
//
// B5-STAND (benannte Schuld, kein Verstecken): das Lab trägt seine Lehre
// (Stich→Schub→Dicke) als FORMEL (deriveGate → updateLaw-Anzeige), nicht als
// pass/warn-BÄNDER — darum exportiert der Kern `messen(P)` (dieselbe Formel,
// M3 Ableitungs-Pflicht), aber KEIN LEHREN-Array (B5 ist SOLL; die Bänder
// kommen mit einer künftigen Schöpfer-Edition, nie erfunden).
//
// THREE ist zur Laufzeit global (Browser/Worker: worlds/terrain/lib/
// three-r128.min.js VOR diesem Skript; Node-Gate: global.THREE vor require).
// Der Manifest-Teil (Daten + Funktions-Definitionen) läuft THREE-frei
// (Validator-vm mit Stub) — kein THREE-Aufruf auf Top-Level.
(function (root) {
    "use strict";

    var VERSION = "1.0.0";
    var STUDIO_VERTRAG = 1; // G4.3 — EINE Versions-Semantik (v1.1 ist Adressierungs-Norm, kein Block-Bruch)

    // ── B2-Daten: die Stufen-Wahrheit der Domäne (kindStages-Vertrag) ──
    // Tore tragen NUR Stufe 0 (fein); L1=L0-Grade + L2-Auto-Impostor sind Sache
    // des Wirts (docs/studio-vertrag.md B2 / N7.5-Merge am EINEN Ingest).
    var PORTAL_RENDER_CONFIG = {
        lod: { kindStages: { gate: [0] } },
    };

    // ── B4-Quelle: die Regler des Schöpfer-Labs (byte-treu aus worlds/portale/porta.js;
    //    Zeile = [id, lab, min, max, step, default, law, grp-Farbklasse] · ['X','h'] = Gruppen-Kopf) ──
    // prettier-ignore
    var SLIDERS=[
      ['VOK','h'],
      ['wMason','Mauerwerk',0,1,0.01,0.0,'',1],['wBraid','Geflecht',0,1,0.01,1.0,'',1],['wMono','Monolith',0,1,0.01,0.0,'',1],['wLace','Filigran',0,1,0.01,0.25,'',1],
      ['DEP','h'],
      ['orders','Ordnungen',1,9,1,3,'Staffel-Ebenen (Türfreiheit autom.)',2],['depth','Tiefe',0,1,0.01,0.45,'z-Staffelung Rahmen',2],['wave','Welle',0,1,0.01,0.45,'Oberflächen-Verformung (z)',2],['tunnel','Innentiefe',0,1,0.01,0.6,'Raymarch-Tiefe',2],['fractal','Fraktal',0,1,0.01,0.6,'Innen-Selbstähnlichkeit',2],['twist','Drall',0,1,0.01,0.4,'Drall',2],
      ['realm','Innenwelt',0,1,0.01,0.0,'Wurmloch↔Kristall',2],['swirl','Sog',0,1,0.01,0.3,'Gravitationslinse',2],['reflect','Spiegel',0,1,0.01,0.5,'Oberflächen-Spiegelung',2],['fog','Nebel',0,1.6,0.01,0.85,'Bodennebel (volumetrisch)',2],
      ['FORM','h'],
      ['k','Spitze',1.0,3.4,0.01,2.6,''],['rise','Stich',0.55,1.25,0.01,1.0,''],['ogee','Ogee',0,1,0.01,0,''],['horse','Hufeisen',0,1,0.01,0,''],['aspect','Schlank',1.4,2.8,0.01,2.4,''],['mass','Dicke',0,1,0.01,0.7,''],
      ['MAT','h'],
      ['metal','Metall',0,1,0.01,0.5,''],['glow','Glut',0,1,0.01,0.4,''],['hue','Farbe',0,1,0.01,0.45,''],['weather','Alter',0,1,0.01,0.1,''],['ruin','Ruine',0,1,0.01,0,''],['temp','Schwelle°',0,1,0.01,0.5,''],['energy','Energie',0,1,0.01,0.6,'']
    ];

    // Slider-id → Bau-Parameter-Schlüssel (byte-treu; Shell-readParams UND gateParams teilen sie).
    // prettier-ignore
    function pk(id){return id==='k'?'k':id==='rise'?'riseScale':id==='horse'?'horseshoe':id;}

    // ── B4 PARAMS (Vertrags-Form) — ABGELEITET aus SLIDERS (eine Quelle, zwei Sichten:
    //    das Lab baut seine Regler-Reihen aus SLIDERS, der Vertrag liest PARAMS) ──
    var PARAMS = (function () {
        var GRP = { VOK: "VOKABULAR", DEP: "TIEFE / PASSAGE", FORM: "FORM", MAT: "MATERIAL / SCHWELLE" };
        var out = [];
        var grp = "";
        for (var i = 0; i < SLIDERS.length; i++) {
            var s = SLIDERS[i];
            if (s[1] === "h") {
                grp = GRP[s[0]] || s[0];
                continue;
            }
            out.push({
                id: s[0],
                lab: s[1],
                min: s[2],
                max: s[3],
                step: s[4],
                def: s[5],
                law: s[6] || undefined,
                grp: grp,
            });
        }
        return out;
    })();

    // ── B1 REZEPTE: die sieben Tor-Ordnungen (Dial-Vektoren byte-treu aus dem Lab;
    //    ids im Vertrags-Namensraum [a-z0-9_-]+, `lab` = der Schöpfer-Wortlaut der Buttons).
    //    fx.place (N5.6, Wörterbuch v1 §2.4): das Platzierungs-GESETZ reist als DATEN —
    //    mode "site" + siteTag "tor" (die Welt-Nische Schrein/Tor); der Host-Dispatch
    //    hält site heute bewusst ohne Worldgen-Kanal (streut NICHT, gate:place-policy d). ──
    // prettier-ignore
    var PRESETS = {
        drachentor: { kind: "gate", lab: "Drachentor", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0,wBraid:1,wMono:0,wLace:0.25,orders:2,depth:0.45,wave:0.5,tunnel:0.65,fractal:0.6,twist:0.5,realm:0.25,swirl:0.5,reflect:0.55,k:2.6,rise:1,ogee:0,horse:0,aspect:2.4,mass:0.7,metal:0.55,glow:0.45,hue:0.5,weather:0.1,ruin:0,temp:0.5,energy:0.6} },
        kathedrale: { kind: "gate", lab: "Kathedrale", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0.95,wBraid:0,wMono:0.15,wLace:0.8,orders:4,depth:0.75,wave:0.3,tunnel:0.5,fractal:0.4,twist:0.2,realm:0.7,swirl:0.2,reflect:0.35,k:2.6,rise:1,ogee:0,horse:0,aspect:2.45,mass:0.8,metal:0.1,glow:0.15,hue:0.1,weather:0.3,ruin:0,temp:0.85,energy:0.3} },
        maschine: { kind: "gate", lab: "Maschine", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0,wBraid:0.25,wMono:0.95,wLace:0.1,orders:3,depth:0.55,wave:0.4,tunnel:0.85,fractal:0.7,twist:0.6,realm:0.55,swirl:0.35,reflect:0.8,k:2,rise:1,ogee:0,horse:0,aspect:2.1,mass:0.6,metal:0.95,glow:0.5,hue:0.5,weather:0.05,ruin:0,temp:0.12,energy:0.78} },
        geisttor: { kind: "gate", lab: "Geisttor", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0,wBraid:0,wMono:0.05,wLace:1,orders:2,depth:0.3,wave:0.75,tunnel:0.95,fractal:1,twist:0.85,realm:0.85,swirl:0.7,reflect:0.3,k:2.4,rise:1.1,ogee:0.5,horse:0,aspect:2.3,mass:0.5,metal:0.4,glow:1,hue:0.6,weather:0,ruin:0,temp:0.6,energy:0.85} },
        verkalkt: { kind: "gate", lab: "Verkalkt", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0.55,wBraid:0.55,wMono:0.1,wLace:0.3,orders:3,depth:0.55,wave:0.45,tunnel:0.6,fractal:0.5,twist:0.4,realm:0.45,swirl:0.4,reflect:0.5,k:2.4,rise:1,ogee:0,horse:0,aspect:2.2,mass:0.75,metal:0.4,glow:0.3,hue:0.3,weather:0.4,ruin:0,temp:0.6,energy:0.4} },
        ruine: { kind: "gate", lab: "Ruine", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0.85,wBraid:0,wMono:0.1,wLace:0.2,orders:2,depth:0.6,wave:0.3,tunnel:0.45,fractal:0.3,twist:0.2,realm:0.2,swirl:0.15,reflect:0.25,k:1,rise:1,ogee:0,horse:0,aspect:1.55,mass:0.8,metal:0.1,glow:0.1,hue:0.2,weather:0.85,ruin:0.6,temp:0.5,energy:0.2} },
        maurentor: { kind: "gate", lab: "Maurentor", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0.7,wBraid:0.3,wMono:0.1,wLace:0.45,orders:3,depth:0.5,wave:0.4,tunnel:0.6,fractal:0.5,twist:0.3,realm:0.6,swirl:0.3,reflect:0.45,k:1.2,rise:1,ogee:0,horse:0.8,aspect:1.95,mass:0.7,metal:0.25,glow:0.3,hue:0.35,weather:0.3,ruin:0,temp:0.78,energy:0.35} },
    };

    // ── Der Parameter-Merge — reproduziert das Lab (setParams(preset) → readParams():
    //    Preset-Werte wo definiert, Slider-DEFAULTS sonst, M fest 1.4; pk mappt die
    //    Slider-ids auf die Bau-Schlüssel). ov reist als Override NACH s+fx (die
    //    vehicle-Merge-Ordnung); unbekannte Schlüssel sind harmlos (der Bau liest
    //    nur seine Dial-Namen — fx.place quert als Daten-Passagier). ──
    function gateParams(pre, ov) {
        var P = { M: 1.4 };
        var i;
        var s;
        for (i = 0; i < SLIDERS.length; i++) {
            s = SLIDERS[i];
            if (s[1] === "h") continue;
            P[pk(s[0])] = s[5];
        }
        var srcs = [pre && pre.s, pre && pre.fx, ov];
        for (i = 0; i < srcs.length; i++) {
            var src = srcs[i];
            if (!src || typeof src !== "object") continue;
            for (var key in src) {
                if (!Object.prototype.hasOwnProperty.call(src, key)) continue;
                P[pk(key)] = src[key];
            }
        }
        return P;
    }

    // ═══ die geteilten Helfer (byte-treu, worlds/portale/porta.js Z.24–25) ═══
    // prettier-ignore
    function lerp(a,b,t){return a+(b-a)*t;}
    // prettier-ignore
    function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
    // prettier-ignore
    function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

    // ═══ die Lehre: Bogen-Profil + Stich→Schub→Dicke (byte-treu, Z.27–43) ═══
    // prettier-ignore
    function archProfile(p,steps){
      steps=steps||56;var M=p.M,k=Math.max(1.0,p.k),R=k*M,cx=(k-1)*M,i,x,y;var P=[];
      for(i=0;i<=steps;i++){x=-M+2*M*i/steps;var c=(x<=0)?cx:-cx;y=Math.sqrt(Math.max(0,R*R-(x-c)*(x-c)));P.push([x,y]);}
      for(i=0;i<P.length;i++)P[i][1]*=p.riseScale;
      if(p.ogee>0)for(i=0;i<P.length;i++){var f=Math.abs(P[i][0]/M);P[i][1]+=p.ogee*M*0.20*Math.sin(f*Math.PI)*(1-f);if(f<0.25)P[i][1]+=p.ogee*M*0.24*(1-f/0.25);}
      if(p.horseshoe>0)for(i=0;i<P.length;i++){var xr=Math.abs(P[i][0]/M);P[i][1]+=p.horseshoe*M*0.26*(1-Math.min(1,xr));P[i][0]*=(1-p.horseshoe*0.12*xr);}
      var rise=0;for(i=0;i<P.length;i++)rise=Math.max(rise,P[i][1]);
      var Q=[P[0]];for(i=1;i<P.length;i++)if(P[i][0]>Q[Q.length-1][0]+1e-5)Q.push(P[i]);
      return {pts:Q,rise:rise};
    }
    // prettier-ignore
    function interpTop(prof,x){var p=prof.pts;if(x<=p[0][0])return p[0][1];if(x>=p[p.length-1][0])return p[p.length-1][1];for(var i=1;i<p.length;i++)if(p[i][0]>=x){var t=(x-p[i-1][0])/(p[i][0]-p[i-1][0]);return p[i-1][1]+t*(p[i][1]-p[i-1][1]);}return 0;}
    // prettier-ignore
    function deriveGate(p){
      var M=p.M,span=2*M,baseY=0,prof=archProfile(p,56),rise=prof.rise;
      var jambH=clamp(p.aspect*span-rise,span*0.4,span*3.2),springY=baseY+jambH,apexY=springY+rise;
      var thrustNorm=(M*Math.sqrt(3))/Math.max(0.25,rise),jambW=clamp(M*0.5*thrustNorm*p.mass,0.02,M*1.7);
      return {M:M,span:span,baseY:baseY,prof:prof,rise:rise,jambH:jambH,springY:springY,apexY:apexY,aspect:(apexY-baseY)/span,thrustNorm:thrustNorm,jambW:jambW,p:p,leftSpringX:prof.pts[0][0],rightSpringX:prof.pts[prof.pts.length-1][0],centerY:baseY+jambH*0.58};
    }

    // ── B5-Mess-Funktion (M3: der Export der SELBEN Formel, die das Lab anzeigt —
    //    updateLaw: Stich→Schub→Dicke; pass/warn-Bänder trägt das Lab nicht, s. Kopf) ──
    function messen(P) {
        var d = deriveGate(gateParams({ s: P || {} }));
        return { stich: d.rise, schub: d.thrustNorm, dicke: d.jambW, streckung: d.aspect };
    }

    // ═══ Geometrie-Hilfen (byte-treu, Z.46–51) ═══
    // prettier-ignore
    function tubeMesh(pts,r,m,seg,rad){return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'centripetal'),seg||140,r,rad||8,false),m);}
    // prettier-ignore
    function torusMesh(R,r,m,x,y,z){var me=new THREE.Mesh(new THREE.TorusGeometry(R,r,8,20),m);me.position.set(x,y,z);return me;}
    // prettier-ignore
    function barBetween(x0,y0,x1,y1,m,z,th){var dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||0.01;var b=new THREE.Mesh(new THREE.BoxGeometry(len,th||0.04,0.1),m);b.position.set((x0+x1)/2,(y0+y1)/2,z);b.rotation.z=Math.atan2(dy,dx);return b;}
    // prettier-ignore
    function quadBlock(c,depth,mat,zOff,jit){var cx=(c[0].x+c[1].x+c[2].x+c[3].x)/4,cy=(c[0].y+c[1].y+c[2].y+c[3].y)/4;var sh=new THREE.Shape();sh.moveTo(c[0].x-cx,c[0].y-cy);sh.lineTo(c[1].x-cx,c[1].y-cy);sh.lineTo(c[2].x-cx,c[2].y-cy);sh.lineTo(c[3].x-cx,c[3].y-cy);sh.lineTo(c[0].x-cx,c[0].y-cy);var g=new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:true,bevelThickness:0.015,bevelSize:0.015,bevelSegments:1});g.translate(0,0,-depth/2);var me=new THREE.Mesh(g,mat);me.position.set(cx,cy,zOff+jit);me.castShadow=me.receiveShadow=true;return me;}
    // in-plane Normalen entlang Pfad (auswaerts vom Aperturzentrum)
    // prettier-ignore
    function normalsAlong(pts,refY){var N=pts.length,F=[];for(var i=0;i<N;i++){var a=pts[Math.max(0,i-1)],b=pts[Math.min(N-1,i+1)];var tx=b.x-a.x,ty=b.y-a.y,L=Math.hypot(tx,ty)||1;tx/=L;ty/=L;var nx=-ty,ny=tx;if((pts[i].x)*nx+(pts[i].y-refY)*ny<0){nx=-nx;ny=-ny;}F.push([nx,ny]);}return F;}

    // ============================================================
    //  EIN BUILDER — Strategien × ORDNUNGEN (gestaffelt, zurueckweichend).
    //  Byte-treu aus worlds/portale/porta.js Z.56–184 extrahiert; die Naht:
    //  Szene-Glue (scene.add/remove · Membran · Nebel · Kamera · UI) blieb in
    //  der Shell — hier nur die STRUKTUR-Substanz. doorAngles {front,back}
    //  (Radiant, Default 0=zu) ersetzt die Shell-Globals doorAngle/doorAngleB;
    //  Rückgabe: {gate, D, leafL, leafR, leafLB, leafRB, rimMat} — die Shell
    //  verdrahtet daraus ihre Animations-Referenzen.
    // ============================================================
    // ── die RAHMEN-STAFFELUNG als reine Ableitung (V18.464, extrahiert byte-treu
    //    aus buildGate — der Beweis ist gate:porta-contract; membranUniforms +
    //    der Welt-Leser [Kollisions-Hülle] lesen DIESELBE Formel, kein Nachbau). ──
    // prettier-ignore
    function deriveFrame(p,D){
      var M=D.M;
      var frameDepth=Math.max(0.4,M*0.7);
      var depthStep=(frameDepth*0.6)*(0.4+p.depth);
      var ordersUser=Math.max(1,Math.round(p.orders));
      var orders=(p.wLace>0.03)?Math.max(ordersUser,1+Math.ceil(1.0/Math.max(0.18,depthStep))):ordersUser;   // Türfreiheit als Funktion der Tiefe, nicht fix 5
      return {frameDepth:frameDepth,depthStep:depthStep,orders:orders,zFace:(orders-1)*depthStep+0.06};
    }

    // prettier-ignore
    function buildGate(p,doorAngles){
      var doorAngle=doorAngles&&typeof doorAngles.front==="number"?doorAngles.front:0;
      var doorAngleB=doorAngles&&typeof doorAngles.back==="number"?doorAngles.back:0;
      var leafL=null,leafR=null,leafLB=null,leafRB=null,rimMat=null;
      var D=deriveGate(p);var rng=mulberry32(0x50FA);
      var M=D.M,baseY=D.baseY,springY=D.springY,apexY=D.apexY,jambW=D.jambW,prof=D.prof;
      var FR=deriveFrame(p,D);
      var frameDepth=FR.frameDepth,refY=baseY+D.jambH*0.5;
      var depthStep=FR.depthStep;
      var orders=FR.orders;
      D.orders=orders;D.depthStep=depthStep;D.zFace=FR.zFace;
      var gate=new THREE.Group();
      var stone=new THREE.Color().setHSL(0.62-(0.62-0.07)*p.hue,0.16+0.14*p.hue,0.40);
      var fmat=new THREE.MeshStandardMaterial({color:stone,roughness:lerp(0.88,0.16,p.metal),metalness:lerp(0.05,0.97,p.metal),emissive:new THREE.Color().setHSL(0.09,0.7,0.5),emissiveIntensity:lerp(0.04,0.55,p.glow)});
      var amat=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.11,0.6,0.55),roughness:0.28,metalness:1.0,emissive:0x2a1c06,emissiveIntensity:0.3+0.6*p.glow});
      var bmatG=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.11,0.7,0.55),roughness:0.2,metalness:1.0,emissive:new THREE.Color().setHSL(0.09,0.8,0.4),emissiveIntensity:0.4+0.6*p.glow});
      var bmatB=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.6,0.7,0.5),roughness:0.28,metalness:0.92,emissive:new THREE.Color().setHSL(0.62,0.8,0.35),emissiveIntensity:0.4+0.5*p.glow});
      var laceMat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.11,0.7,0.6).multiplyScalar(0.55+1.05*Math.max(p.glow,0.25))});
      rimMat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.11,0.6,0.55).multiplyScalar(0.55+1.5*Math.max(p.glow,0.25))});

      // ---- symmetrische Halbkante (Basis->Scheitel) + Normalen, einmal ----
      var nJ=7,j,half=[];
      for(j=0;j<=nJ;j++)half.push(new THREE.Vector3(D.leftSpringX,baseY+(springY-baseY)*j/nJ,0));
      for(var i=0;i<prof.pts.length;i++)if(prof.pts[i][0]<=1e-6)half.push(new THREE.Vector3(prof.pts[i][0],springY+prof.pts[i][1],0));
      var H=[half[0]];for(i=1;i<half.length;i++)if(half[i].distanceToSquared(H[H.length-1])>1e-6)H.push(half[i]);
      var hc=new THREE.CatmullRomCurve3(H,false,'centripetal'),hLen=hc.getLength();
      var Nh=Math.max(5,Math.round(hLen/(M*0.42)));var sp=hc.getSpacedPoints(Nh),nrm=normalsAlong(sp,refY);
      // volle Kante (Pfosten-Bogen-Pfosten) fuer Geflecht/Monolith
      var full=[];for(j=0;j<=nJ;j++)full.push(new THREE.Vector3(D.leftSpringX,baseY+(springY-baseY)*j/nJ,0));
      for(i=0;i<prof.pts.length;i++)full.push(new THREE.Vector3(prof.pts[i][0],springY+prof.pts[i][1],0));
      for(j=0;j<=nJ;j++)full.push(new THREE.Vector3(D.rightSpringX,springY-(springY-baseY)*j/nJ,0));
      var FU=[full[0]];for(i=1;i<full.length;i++)if(full[i].distanceToSquared(FU[FU.length-1])>1e-6)FU.push(full[i]);
      var fnrm=normalsAlong(FU,refY);

      function offsetFull(off){var o=[];for(var i=0;i<FU.length;i++)o.push(new THREE.Vector3(FU[i].x+fnrm[i][0]*off,FU[i].y+fnrm[i][1]*off,0));return o;}

      // ======== Pro ORDNUNG: zurueckweichend in z, nach aussen versetzt ========
      for(var o=0;o<orders;o++){
        var outOff=o*jambW, dep=frameDepth*(1+o*0.18), dens=(o===0?1:(o===1?0.7:0.5));
        var zoffs=(o===0)?[0]:[o*depthStep,-o*depthStep];                       // symmetrisch um z=0 → beidseitig durchgehbar
        for(var zi=0;zi<zoffs.length;zi++){var zO=zoffs[zi];
          if(p.wMason>0.03){var rad=jambW*p.wMason;
            for(i=0;i<Nh-1;i++){
              var inA=new THREE.Vector3(sp[i].x+nrm[i][0]*outOff,sp[i].y+nrm[i][1]*outOff,0);
              var inB=new THREE.Vector3(sp[i+1].x+nrm[i+1][0]*outOff,sp[i+1].y+nrm[i+1][1]*outOff,0);
              var ouA=new THREE.Vector3(sp[i].x+nrm[i][0]*(outOff+rad),sp[i].y+nrm[i][1]*(outOff+rad),0);
              var ouB=new THREE.Vector3(sp[i+1].x+nrm[i+1][0]*(outOff+rad),sp[i+1].y+nrm[i+1][1]*(outOff+rad),0);
              if(!(p.ruin>0&&rng()<p.ruin*0.4))gate.add(quadBlock([inA,inB,ouB,ouA],dep,fmat,zO,(rng()-0.5)*p.weather*0.02));
              if(!(p.ruin>0&&rng()<p.ruin*0.4)){var mA=inA.clone();mA.x*=-1;var mB=inB.clone();mB.x*=-1;var oA=ouA.clone();oA.x*=-1;var oB=ouB.clone();oB.x*=-1;gate.add(quadBlock([mB,mA,oA,oB],dep,fmat,zO,(rng()-0.5)*p.weather*0.02));}
            }
          }
          if(p.wBraid>0.03&&(o<2||orders<3)){
            var oc=offsetFull(outOff+jambW*0.5),Fb=new THREE.CatmullRomCurve3(oc,false,'centripetal').getSpacedPoints(280);
            var fn=normalsAlong(Fb,refY),rho=jambW*0.5*p.wBraid,fib=lerp(0.02,0.05,p.wBraid)*dens,turns=14,zoBr=zO;
            var strands=function(cnt,rh,hd,ph0,mat){for(var c=0;c<cnt;c++){var ph=ph0+c*(Math.PI*2/cnt)+rng()*0.1;var pts=[];for(var q=0;q<Fb.length;q++){var s=q/(Fb.length-1),er=Math.min(s,1-s),ramp=Math.max(0,1-er/0.12),rE=rh*(1+0.7*ramp),ang=ph+hd*turns*2*Math.PI*s;var off=Math.cos(ang)*rE,zz=Math.sin(ang)*rE;pts.push(new THREE.Vector3(Fb[q].x+fn[q][0]*off,Fb[q].y+fn[q][1]*off-ramp*0.18,zoBr+zz));}var t=tubeMesh(pts,fib,mat,240,6);t.castShadow=true;gate.add(t);}};
            var ns=Math.round(6*dens);strands(ns,rho*1.05,1,0,bmatG);strands(ns,rho*0.8,-1,Math.PI/6,bmatB);
          }
          if(p.wMono>0.03){var oc2=offsetFull(outOff+jambW*0.5),mt=tubeMesh(oc2,jambW*0.5*p.wMono+0.01,fmat,170,12);mt.position.z=zO;mt.castShadow=true;gate.add(mt);}
          if(o===0&&p.wMason>0.03){var rad2=jambW*p.wMason,ay=springY+D.rise;                       // Schlussstein zentral (von beiden Seiten sichtbar)
            var kb=new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.12,M*0.28),rad2*1.25,dep*1.15),fmat);kb.position.set(0,ay+rad2*0.12,0);kb.castShadow=true;gate.add(kb);
            var jw=new THREE.Mesh(new THREE.OctahedronGeometry(rad2*0.34,0),amat);jw.position.set(0,ay+rad2*0.12,0);gate.add(jw);}
        }
      }
      // --- TÜREN: vordere (E) + hintere (R) Flügel, beide an der vordersten Maueröffnung gelagert ---
      if(p.wLace>0.03){
        var zFace=D.zFace, nMull=Math.round(lerp(1,5,p.wLace));
        var frontOff=(orders-1)*jambW, FB=offsetFull(frontOff), apexIdx=0;        // vorderste Öffnung (= innere Kante des vordersten Ordens)
        for(var ii=0;ii<FB.length;ii++)if(FB[ii].y>FB[apexIdx].y)apexIdx=ii;
        var lxg=FB[0].x, rxg=FB[FB.length-1].x;
        var makeLeaf=function(side,zf){                                            // ein Flügel = halbe Maueröffnung, gelagert an der Außenkante
          var grp=new THREE.Group();
          var seg=side<0?FB.slice(0,apexIdx+1):FB.slice(apexIdx).reverse();        // von Außenkante(unten) → Scheitel(Mitte)
          var hingeX=seg[0].x, apexX=seg[seg.length-1].x, apY=seg[seg.length-1].y;
          grp.add(tubeMesh(seg,0.05,laceMat,Math.max(48,seg.length*4),6));         // Außenstiel + Bogen folgen dem Stein
          // (kein mittiger Schlagstiel — er stand als Balken vor dem Sheet; die Flügel treffen sich am Maßwerk-Rand & Bogenscheitel)
          grp.add(barBetween(hingeX,baseY+0.02,apexX,baseY+0.02,laceMat,0,0.05));  // unteres Holz auf der Schwelle
          grp.add(barBetween(hingeX,springY,apexX,springY,laceMat,0,0.05));        // Kämpferholz
          if(D.jambH>2.0)grp.add(barBetween(hingeX,baseY+D.jambH*0.5,apexX,baseY+D.jambH*0.5,laceMat,0,0.045));
          var segTopY=function(x){var best=baseY;for(var si=0;si<seg.length-1;si++){var pa=seg[si],pb=seg[si+1];if((pa.x-x)*(pb.x-x)<=0.0&&Math.abs(pb.x-pa.x)>1e-5){var tt=(x-pa.x)/(pb.x-pa.x),yy=pa.y+tt*(pb.y-pa.y);if(yy>best)best=yy;}}return best;};
          var nM2=Math.max(2,Math.round(2+nMull*0.6)),innerXs=[];                  // Pfosten bis zur BOGENLINIE (füllt das Feld)
          for(var k=1;k<=nM2;k++){var fx=hingeX+(apexX-hingeX)*k/(nM2+1);innerXs.push(fx);grp.add(barBetween(fx,baseY+0.02,fx,segTopY(fx)-0.03,laceMat,0,0.04));}
          var edgesX=[hingeX].concat(innerXs,[apexX]);
          for(var bj=0;bj<edgesX.length-1;bj++){                                   // je Feld: Haupt-Spitzbogen + verschachtelte Sub-Tracery (Tiefe)
            var a0=edgesX[bj],a1=edgesX[bj+1],am=(a0+a1)/2,ww=Math.abs(a1-a0);if(Math.abs(am)<0.42)continue;  // nur innerstes Feld frei → Mittelnaht sauber (volle Tracery sonst)
            var topF=Math.min(segTopY(am)-0.04, springY+ww*1.15);
            var Lp=[],Rp=[];for(var s=0;s<=8;s++){var tt=s/8;Lp.push(new THREE.Vector3(lerp(a0,am,tt),lerp(springY,topF,tt*tt),0));Rp.push(new THREE.Vector3(lerp(a1,am,tt),lerp(springY,topF,tt*tt),0));}
            grp.add(tubeMesh(Lp,0.022,laceMat,20,5));grp.add(tubeMesh(Rp,0.022,laceMat,20,5));
            if(ww>0.46){                                                           // NESTED Sub-Tracery auf ALLEN Feldern (volle gotische Tiefe — nicht abtragen)
              var subTop=springY+(topF-springY)*0.60, qL=(a0+am)/2, qR=(am+a1)/2;
              grp.add(barBetween(am,springY,am,subTop+0.03,laceMat,0,0.018));
              var sA=[],sB=[],sC=[],sD=[];for(var s2=0;s2<=6;s2++){var u=s2/6;
                sA.push(new THREE.Vector3(lerp(a0,qL,u),lerp(springY,subTop,u*u),0));sB.push(new THREE.Vector3(lerp(am,qL,u),lerp(springY,subTop,u*u),0));
                sC.push(new THREE.Vector3(lerp(am,qR,u),lerp(springY,subTop,u*u),0));sD.push(new THREE.Vector3(lerp(a1,qR,u),lerp(springY,subTop,u*u),0));}
              grp.add(tubeMesh(sA,0.012,laceMat,14,4));grp.add(tubeMesh(sB,0.012,laceMat,14,4));grp.add(tubeMesh(sC,0.012,laceMat,14,4));grp.add(tubeMesh(sD,0.012,laceMat,14,4));
              var foilR=Math.min(ww*0.15,0.12),foilY=subTop+(topF-subTop)*0.55,nFoil=4+Math.floor((p.realm*3.0+Math.abs(am)*1.7)%3.0);grp.add(torusMesh(foilR*0.5,0.010,laceMat,am,foilY,0));for(var pf=0;pf<nFoil;pf++){var pfa=pf/nFoil*6.2831+p.realm*1.5;grp.add(torusMesh(foilR*0.42,0.009,(p.wBraid>0.25&&pf%2)?bmatB:laceMat,am+Math.cos(pfa)*foilR*0.6,foilY+Math.sin(pfa)*foilR*0.6,0));}  // Mehrpass: Blattzahl aus realm+Feld (symmetrisch); Geflecht>0.25 → blaue Akzente = Verschmelzung Braid×Lace
              grp.add(torusMesh(ww*0.07,0.008,laceMat,qL,subTop*0.5+springY*0.5+0.05,0));                 // Dreipass in Sub-Zwickeln
              grp.add(torusMesh(ww*0.07,0.008,laceMat,qR,subTop*0.5+springY*0.5+0.05,0));
            }
            var zw=segTopY(am)-topF;if(zw>0.09)grp.add(torusMesh(Math.min(ww*0.17,zw*0.42),0.013,laceMat,am,topF+zw*0.5,0));
          }
          var oRos=Math.min(0.15,Math.abs(apexX-hingeX)*0.16);                     // Halb-Rose am Scheitel (zwei Flügel → volle Rose) — Math.abs: auch rechter Flügel
          if(oRos>0.05){var oy=apY-oRos*1.7;grp.add(torusMesh(oRos,0.016,laceMat,apexX,oy,0));var nf=5;for(var fi=0;fi<nf;fi++){var fa=fi/nf*6.2831;grp.add(torusMesh(oRos*0.33,0.011,laceMat,apexX+Math.cos(fa)*oRos*0.62,oy+Math.sin(fa)*oRos*0.62,0));}}
          // (kein mittiger Griff — E/R öffnet; nichts soll vor dem Sheet stehen)
          grp.children.forEach(function(c){c.position.x-=hingeX;});grp.position.set(hingeX,0,zf);grp.userData.side=side;return grp;
        };
        leafL=makeLeaf(-1,zFace);leafR=makeLeaf(1,zFace);leafLB=makeLeaf(-1,-zFace);leafRB=makeLeaf(1,-zFace);
        leafL.rotation.y=-doorAngle;leafR.rotation.y=doorAngle;leafLB.rotation.y=doorAngleB;leafRB.rotation.y=-doorAngleB;  // vorne→+z, hinten→-z
        gate.add(leafL);gate.add(leafR);gate.add(leafLB);gate.add(leafRB);
        var hxA=[lxg,rxg];                                                          // Scharniere an beiden Maueröffnungen → am Stein, Bügel zur Tür
        for(var zfi=0;zfi<2;zfi++){var zf=zfi===0?zFace:-zFace;for(var hsI=0;hsI<2;hsI++){var hx=hxA[hsI],hsg=hsI===0?-1:1;for(var hk=0;hk<5;hk++){var hy=baseY+0.2+hk*((springY-baseY-0.35)/4);var cyl=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.26,10),amat);cyl.position.set(hx,hy,zf);cyl.castShadow=true;gate.add(cyl);var br=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.045,0.06),amat);br.position.set(hx-hsg*0.08,hy,zf);gate.add(br);}}}
      }
      // --- FUNDAMENT: parametrisches Vokabular (abgeleitet aus Strategie × Masse × Ruine) ---
      var fullW=2*(M+jambW*orders),baseDepth=frameDepth+0.6+depthStep*2*orders,baseZ=0;
      if(p.wMason*p.mass>0.05){var nStep=1+Math.round(p.wMason*2),sH=0.12+0.32*p.mass;          // 1) Stylobat: zurueckspringende Stufen
        for(var st=0;st<nStep;st++){var sw=fullW+0.4+st*0.7,sd2=baseDepth+st*0.7;var me=new THREE.Mesh(new THREE.BoxGeometry(sw,sH,sd2),fmat);me.position.set(0,baseY-sH/2-st*sH,baseZ);me.castShadow=me.receiveShadow=true;gate.add(me);}}
      if(p.wBraid*p.mass>0.05){var nR=Math.round(lerp(3,7,p.wBraid)),jx=Math.abs(D.leftSpringX)+jambW*0.5;   // 2) Wurzeln am PFOSTENFUSS (außen), tauchen schräg in den Boden — nie in Öffnung/Sheet-Ebene
        for(var sdb=-1;sdb<=1;sdb+=2)for(var rr2=0;rr2<nR;rr2++){var spread=0.16+rr2*0.13,zr=(rr2-(nR-1)*0.5)*0.16;
          var pts=[new THREE.Vector3(sdb*jx,baseY+0.05,zr*0.5),new THREE.Vector3(sdb*(jx+spread*0.6),baseY-0.18,zr*0.9),new THREE.Vector3(sdb*(jx+spread),baseY-0.50-rr2*0.05,zr*1.3)];
          var tb=tubeMesh(pts,0.05+0.03*(1-rr2/nR),(rr2%2)?bmatB:bmatG,36,5);tb.castShadow=true;gate.add(tb);}}
      if(p.wMono*p.mass>0.05){var pw=fullW+0.5,ph=0.2+0.3*p.mass;                                // 3) Tech-Podest mit Leuchtnaht
        var pl=new THREE.Mesh(new THREE.BoxGeometry(pw,ph,baseDepth+0.3),fmat);pl.position.set(0,baseY-ph/2,baseZ);pl.castShadow=pl.receiveShadow=true;gate.add(pl);
        var seam=new THREE.Mesh(new THREE.BoxGeometry(pw*0.9,0.03,baseDepth*0.25),rimMat);seam.position.set(0,baseY-ph+0.05,baseZ+baseDepth*0.25);gate.add(seam);}
      if(p.glow>0.3||(p.wLace>0.4&&p.mass<0.4)){var rg=new THREE.Mesh(new THREE.TorusGeometry(M+jambW*0.5+0.3,0.05+0.05*p.glow,10,48),rimMat);rg.rotation.x=Math.PI/2;rg.position.set(0,baseY+0.02,baseZ);gate.add(rg);  // 4) Leuchtende Dais
        var disc=new THREE.Mesh(new THREE.CircleGeometry(M+jambW*0.5,40),new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.11,0.5,0.5).multiplyScalar(0.3+p.glow),transparent:true,opacity:0.2+0.4*p.glow,side:THREE.DoubleSide}));disc.rotation.x=-Math.PI/2;disc.position.set(0,baseY+0.012,baseZ);gate.add(disc);}
      if(p.ruin>0.2){var nRub=Math.round(p.ruin*8);for(var rbk=0;rbk<nRub;rbk++){var rsz=0.15+rng()*0.38;var rk=new THREE.Mesh(new THREE.BoxGeometry(rsz,rsz*0.7,rsz),fmat);rk.position.set((rng()-0.5)*fullW*1.3,baseY+rsz*0.3,baseZ+(rng()-0.5)*baseDepth*0.6);rk.rotation.set(rng()*1.5,rng()*3,rng()*1.5);rk.castShadow=true;gate.add(rk);}}  // 5) Schutt

      // --- gluehende Apertur-Kante (Trichter) ---
      var rimPts=[];for(i=0;i<prof.pts.length;i++)rimPts.push(new THREE.Vector3(prof.pts[i][0],springY+prof.pts[i][1],0.0));gate.add(tubeMesh(rimPts,0.04,rimMat,170,8));

      return {gate:gate,D:D,leafL:leafL,leafR:leafR,leafLB:leafLB,leafRB:leafRB,rimMat:rimMat};
    }

    // ── B2: buildInstance(rezeptId, seed, lod, ov?) — die EINE Bau-Funktion ──
    // Deterministisch (Lab-fester rng-Strom, s. Kopf: seed reserviert, Goldens
    // cv:4 frieren die Seed-Invarianz ein); lod wird auf die einzige getragene
    // Stufe 0 geklemmt (kindStages.gate=[0] — L1/L2 gradet der Wirt). ov reist
    // als Parameter-Override. Ausgang: EINE THREE.Group (Türen geschlossen,
    // doorAngles 0/0), Welt-Matrizen aktualisiert — die Naht sind die
    // Float32-Attribute ihrer Meshes (G2.2).
    function buildInstance(rezeptId, seed, lod, ov) {
        var pre = PRESETS[rezeptId];
        if (!pre) return null;
        var p = gateParams(pre, ov || null);
        var R = buildGate(p, null);
        var g = R.gate;
        g.userData = { kind: "gate", rezeptId: rezeptId, seed: seed, lod: 0 };
        g.updateMatrixWorld(true);
        return g;
    }

    // ── Der Namensraum (Vertrag v1.1 §7): Manifest-Blöcke + Bau-Vokabular ──

    // ULTRAGUSS U6 — DAS MEMBRAN-FARB-GESETZ (verbatim aus der Lab-Shell):
    // Kern-Farbe warm/kalt aus temp; saturierte IQ-Kosinus-Palette
    // a+b·cos(2π(c·t+d)) — Familie aus temp, Sättigung aus energy,
    // Verschiebung aus realm. Reine Zahlen (MESHFREI-artig; die Shell/der
    // Ofen machen daraus Uniforms).
    function membranPalette(p) {
        var lerp = function (a, b, t) { return a + (b - a) * t; };
        var warm = [1.95, 1.45, 0.85], cold = [0.4, 0.6, 1.5];
        var core = [lerp(cold[0], warm[0], p.temp), lerp(cold[1], warm[1], p.temp), lerp(cold[2], warm[2], p.temp)];
        var dWarm = [0.0, 0.12, 0.2], dCool = [0.6, 0.5, 0.42], dCryst = [0.3, 0.55, 0.85];
        var dd = [lerp(dCool[0], dWarm[0], p.temp), lerp(dCool[1], dWarm[1], p.temp), lerp(dCool[2], dWarm[2], p.temp)];
        dd = [lerp(dd[0], dCryst[0], p.realm * 0.5), lerp(dd[1], dCryst[1], p.realm * 0.5), lerp(dd[2], dCryst[2], p.realm * 0.5)];
        var sat = 0.42 + 0.34 * p.energy;
        return {
            core: core,
            PA: [0.5, 0.5, 0.5],
            PB: [sat, sat, sat],
            PC: [1.0 + p.realm * 0.8, 1.0 + p.realm * 0.4, 1.0],
            PD: dd,
        };
    }

    // ── DIE MEMBRAN ALS GESETZ (V18.464, rein additiv — W9-Muster): die
    // PASSAGE-Zahlen der Lab-Shell (worlds/portale/porta.js buildMembrane)
    // als EINE Tabelle. Die Shell INJIZIERT diese Zahlen in ihr GLSL
    // (semantischer Beweis alt==neu, diag-membran-gesetz), die Welt (TSL)
    // LIEST dieselbe Tabelle für ihr Portal-Passage-Material. Die TECHNIK
    // (GLSL-Raymarch vs TSL-Knoten) bleibt Leser-Sache; hier wohnen NUR
    // Zahlen + reine Ableitungen (THREE-frei, MESHFREI-artig). Arrays sind
    // POSITIONAL — die Shell-GLSL-Zeilen sind die Lesart-Referenz.
    var MEMBRAN_GESETZ = {
        profilW: 64, // Bogen-Oberkante: Sample-Breite der Top-Textur/Tabelle
        seg: 90, // Plane-Unterteilung (Vertex-Welle braucht Dichte)
        eps: 0.06, // Normalen-Differenzschritt e (Vertex-Shader)
        om: 3.0, // Wellen-Kreisfrequenz om = t*3.0
        kk: 13.8, // Wellenzahl (radiale Tropfenwelle)
        refl: 0.72, // reflektierte Welle (Pfad 2-rr) Gewicht
        damp: 0.7, // exp(-rr*0.7) Randverdichtung
        twistK: 2.0, // twist = a*2.0 + swirl/(r+0.25)
        swirlR0: 0.25,
        pierce: [2.2, 6.0, 1.5], // sin(t*2.2)*exp(-rr²*6)*1.5
        micro: [3.0, 0.3, 0.1], // fbm(c*3 - t*0.3)*0.10
        hGain: [0.55, 0.62], // h = clamp((wave*0.55+pierce+micro)*0.62,-1,1)
        waveDepthK: [0.65, 0.35], // * uWaveDepth*(0.65+0.35*wave)
        waveDepthMin: 0.05,
        waveDepthZ: 0.1, // uWaveDepth = max(0.05, zFace*0.10)
        stepK: [0.06, 0.2], // uStep = 0.06 + tunnel*0.20
        rimAyK: 0.52, // uRimAy = (apexY-baseY)*0.52
        swirlK: 0.5, // uSwirl = swirl*0.5
        openK: [0.4, 0.6], // uOpen = clamp(0.4+energy*0.6, 0, 1)
        centerK: 0.55, // Zentrum-Y = baseY + jambH*0.55
        march: {
            steps: 12,
            t0: 0.04, // Strahl-Versatz je Schritt: i*uStep + 0.04
            depK: [1.6, 0.1], // dep = i*uStep*1.6 + r*0.1
            spK: [0.3, 0.6], // sp = t*(0.3 + energy*0.6)
            lpK: 2.0, // lp = log(r)*2.0 - sp
            frqK: [1.0, 2.2], // frq = 1.0 + fractal*2.2
            win: 0.4, // Realm-Fenster-Breite
            winC: [0.0, 0.34, 0.67, 1.0], // Realm-Fenster-Zentren
            vCut: [0.1, 1.4], // v = max(0, v-0.10)*1.4
            gDen: [2.2, 0.35], // g = v/(1 + r²*2.2 + dep*0.35)
            att: 0.9, // Transmissions-Dämpfung je Schritt
            // die vier Innenwelt-Modi (Wurmloch·Facette·Plasma·Nebel) —
            // positional, Referenz: porta.js Fragment w0..w3-Zeilen.
            wurm: [3.0, 2.0, 4.0, 0.15, 0.5],
            facet: [8.0, 9.0, 4.0, 1.5, 0.1],
            plasma: [0.7, 0.6, 0.2, 2.4, 3.5, 1.4, 0.5, 3.0, 1.25, 1.3, 0.08, 0.15],
            nebel: [1.0, 0.6, 0.7, 0.12, 2.2, 1.5, 1.3, 0.2, 2.0, 2.0, 1.0, 1.2, 0.18],
        },
        look: {
            star: [0.955, 95.0, 5.0, 0.42], // step(0.955, hash(Rf*95+z*5))*0.42
            skyK: [0.5, 0.5, 0.3], // pal(Rf.y*0.5+0.5)*0.30
            fresPow: 3.0,
            specDir: [0.4, 0.7, 0.6],
            specPow: 60.0,
            specCol: [1.0, 0.95, 0.85],
            specK: 1.5,
            core: [12.0, 0.5, 0.5, 0.7, 0.3, 1.4], // exp(-dc²*12)*(0.5+open*0.5)*(0.7+0.3*sin(t*1.4))
            corePal: 0.1,
            mixK: [1.35, 0.55, 1.5, 1.0], // inter·1.35 + sky·fres·refl·0.55 + spec·1.5 + core·1.0
            finalK: [1.4, 0.55, 0.55, 0.9, 0.13], // ·1.4·(0.55+0.55·act)·(0.90+0.13·pulse)
        },
        puls: 1.25, // uPulse = 0.5+0.5*sin(t*1.25)
        aktivDepth: [0.1, 0.85], // Atem: uWaveDepth = zFace*(0.10+0.85*open)
    };

    // membranUniforms(p) — die REINE Ableitung der Membran-Uniform-Zahlen aus
    // einem vollen Parametersatz (gateParams-Ausgang). Byte-treu zur Shell
    // (buildMembrane Z.36–51): Geometrie-Rahmen aus deriveGate, Bogen-Oberkante
    // als 64er-Sample-Tabelle (0..1 normiert — die Shell macht daraus ihre
    // DataTexture, die Welt ihre eigene), Palette aus membranPalette. Kein
    // THREE, keine Technik — nur Zahlen.
    function membranUniforms(p) {
        var MG = MEMBRAN_GESETZ;
        var D = deriveGate(p);
        var FR = deriveFrame(p, D);
        D.orders = FR.orders;
        D.depthStep = FR.depthStep;
        D.zFace = FR.zFace;
        var left = D.leftSpringX,
            right = D.rightSpringX;
        var spanW = right - left;
        var height = D.apexY - D.baseY;
        var midY = (D.baseY + D.apexY) / 2;
        var W = MG.profilW;
        var profil = [];
        for (var i = 0; i < W; i++) {
            var xx = left + (spanW * i) / (W - 1);
            var ty = interpTop(D.prof, xx) + D.springY;
            profil.push(clamp((ty - D.baseY) / Math.max(0.001, height), 0, 1));
        }
        return {
            left: left,
            right: right,
            spanW: spanW,
            height: height,
            midY: midY,
            baseY: D.baseY,
            springY: D.springY,
            apexY: D.apexY,
            jambH: D.jambH,
            jambW: D.jambW,
            M: D.M,
            zFace: D.zFace,
            orders: FR.orders,
            frameDepth: FR.frameDepth,
            depthStep: FR.depthStep,
            centerY: D.baseY + D.jambH * MG.centerK,
            springX: Math.max(Math.abs(left), Math.abs(right)),
            rimAx: Math.abs(D.leftSpringX),
            rimAy: (D.apexY - D.baseY) * MG.rimAyK,
            step: MG.stepK[0] + p.tunnel * MG.stepK[1],
            waveDepth: Math.max(MG.waveDepthMin, D.zFace * MG.waveDepthZ),
            swirl: p.swirl * MG.swirlK,
            open: clamp(MG.openK[0] + p.energy * MG.openK[1], 0, 1),
            wave: clamp(p.wave, 0, 1),
            twist: p.twist,
            fractal: p.fractal,
            energy: p.energy,
            realm: p.realm,
            reflect: p.reflect,
            glow: p.glow,
            fog: p.fog,
            profil: profil,
            pal: membranPalette(p),
        };
    }

    root.__portaCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { gate: PARAMS },
        SLIDERS: SLIDERS,
        pk: pk,
        gateParams: gateParams,
        buildInstance: buildInstance,
        // Mess- & Lehren-Fläche (Shell + Wirt lesen dieselben Gesetze)
        messen: messen,
        deriveGate: deriveGate,
        deriveFrame: deriveFrame,
        membranPalette: membranPalette,
        MEMBRAN_GESETZ: MEMBRAN_GESETZ,
        membranUniforms: membranUniforms,
        archProfile: archProfile,
        interpTop: interpTop,
        // Bau-Fläche (die Shell baut ihre Struktur aus DIESER Quelle)
        buildGate: buildGate,
        // Geometrie-Vokabular + Helfer
        lerp: lerp,
        clamp: clamp,
        mulberry32: mulberry32,
        tubeMesh: tubeMesh,
        torusMesh: torusMesh,
        barBetween: barBetween,
        quadBlock: quadBlock,
        normalsAlong: normalsAlong,
    };
})(typeof self !== "undefined" ? self : globalThis);
