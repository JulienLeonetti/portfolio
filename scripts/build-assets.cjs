/* Deterministic, local assets. No network or API key is needed. */
const fs=require('node:fs');const path=require('node:path');const {chromium}=require('@playwright/test');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public','projects'),portraitDir=path.join(root,'public','portrait');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(portraitDir,{recursive:true});
const specs=[
 ['forma','Forma','IDENTITÉ GRAPHIQUE','#fc6c35','#f4eedc'],
 ['onde','Onde','INTERFACE MUSICALE','#c5ff64','#27213f'],
 ['atelier-04','Atelier 04','SITE DE STUDIO','#e9e4d9','#252422'],
 ['flux','Flux','MOTION DESIGN','#ec482e','#efe7ff'],
 ['rivage','Rivage','EXPÉRIENCE ÉDITORIALE','#c6e8f3','#1a405d'],
 ['module','Module','TABLEAU DE BORD','#151b1a','#b9f2d4'],
 ['sillage','Sillage','PACKAGING','#d9c4a3','#455748'],
 ['orbite','Orbite','EXPLORATION 3D','#a8b4f1','#202780'],
 ['echo','Écho','AFFICHE TYPOGRAPHIQUE','#eff500','#1a1a1a'],
 ['traverse','Traverse','APPLICATION DE VOYAGE','#21715b','#f0f1da'],
];
const text=(x,y,size,value,extra='')=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" '+extra+'>'+value+'</text>';
const line=(x1,y1,x2,y2,color='#ffffff',opacity='.2')=>'<path d="M'+x1+' '+y1+'H'+x2+'" stroke="'+color+'" opacity="'+opacity+'"/>';
const wrap=(inner,bg)=>'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><filter id="shadow"><feDropShadow dx="0" dy="22" stdDeviation="24" flood-opacity=".18"/></filter><linearGradient id="sheen" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient></defs><rect width="1200" height="900" fill="'+bg+'"/><g font-family="Arial,Helvetica,sans-serif">'+inner+'</g></svg>';
function artwork(i,v){
 const [slug,title,category,bg,fg]=specs[i];let s='';
 if(i===0){
  s+='<g fill="'+fg+'">'+text(60,105,24,'FORMA® / '+(v===0?'L’IDÉE PREND FORME':v===1?'UN SYSTÈME OUVERT':'SIGNES EN LIBERTÉ'));
  if(v===0){s+=text(45,420,260,'forma','letter-spacing="-19" font-weight="700"');s+='<circle cx="850" cy="620" r="165"/><path d="M570 455h165v330H570z"/><path d="m570 455-165 330h330z"/>';}
  if(v===1){for(let y=0;y<3;y++)for(let x=0;x<5;x++)s+='<g transform="translate('+(90+x*220)+' '+(230+y*205)+') rotate('+((x+y)*45)+' 65 65)"><path d="M0 0h130v65H65v65H0z" fill="'+((x+y)%3===0?'#252422':fg)+'"/></g>';}
  if(v===2){s+='<g transform="translate(280 170) rotate(-12 250 300)" filter="url(#shadow)"><rect width="650" height="560" fill="'+fg+'"/><g fill="'+bg+'">'+text(36,115,90,'forme &amp; fond','letter-spacing="-6"')+text(36,510,34,'01 / UNE IDENTITÉ QUI SE CONSTRUIT')+'</g><circle cx="330" cy="300" r="110" fill="'+bg+'"/></g>';}s+='</g>';
 }
 if(i===1){
  s+='<g fill="'+fg+'">'+text(55,90,26,'ONDE / ÉCOUTER AUTREMENT');
  if(v===0){s+='<circle cx="690" cy="440" r="305" fill="'+fg+'"/>';for(let r=70;r<290;r+=18)s+='<circle cx="690" cy="440" r="'+r+'" fill="none" stroke="'+bg+'" opacity=".15"/>';s+='<circle cx="690" cy="440" r="84" fill="'+bg+'"/>';s+=text(52,730,210,'onde.','letter-spacing="-14" font-weight="700"');}
  else {s+='<rect x="70" y="150" width="1060" height="650" rx="24" fill="'+fg+'" filter="url(#shadow)"/><g fill="'+bg+'">'+text(110,210,32,'onde.')+text(370,210,18,'DÉCOUVRIR       MA BIBLIOTHÈQUE       FAVORIS')+'</g>';for(let n=0;n<3;n++){const x=110+n*320;s+='<rect x="'+x+'" y="260" width="290" height="290" rx="8" fill="'+['#8179b4','#e69f90','#45645b'][n]+'"/><circle cx="'+(x+145)+'" cy="405" r="'+(v===1?88:65)+'" fill="'+bg+'" opacity=".75"/><g fill="'+bg+'">'+text(x,592,25,['À la lisière','Le bleu des heures','Ralentir'][n])+text(x,628,17,'SÉLECTION / ÉCOUTE LIBRE')+'</g>';}s+='<rect x="110" y="701" width="960" height="4" fill="#696176"/><rect x="110" y="701" width="'+(v===1?350:640)+'" height="4" fill="'+bg+'"/><g fill="'+bg+'">'+text(112,755,20,'NOUVELLE ÉCOUTE')+text(906,755,26,'◀  II  ▶')+'</g>';}s+='</g>';
 }
 if(i===2){
  s+='<g fill="'+fg+'">'+text(50,80,20,'ATELIER 04                 DESIGN INDÉPENDANT                 CORSE, FRANCE');
  s+='<path d="M50 110H1150M50 785H1150" stroke="'+fg+'" stroke-width="1"/>';
  if(v===0){s+=text(45,370,230,'Atelier','font-family="Georgia" font-style="italic" letter-spacing="-15"')+text(810,605,300,'04','letter-spacing="-30"');s+='<rect x="80" y="430" width="500" height="280" fill="#a2a393"/><path d="M100 690 300 450 560 690" fill="none" stroke="'+bg+'" stroke-width="42"/>';}
  else if(v===1){s+=text(50,230,83,'Des idées. Des formes.','font-family="Georgia" font-style="italic"');for(let j=0;j<3;j++)s+='<rect x="'+(50+j*375)+'" y="'+(j%2?420:340)+'" width="350" height="300" fill="'+['#a2a393','#c76e49','#3c4c57'][j]+'"/>'+text(50+j*375,j%2?760:680,20,['01 / MAISON','02 / ÉDITION','03 / OBJET'][j]);}
  else{s+='<g transform="translate(240 200) rotate(-8)" filter="url(#shadow)"><rect width="760" height="450" fill="#252422"/><g fill="'+bg+'">'+text(55,110,64,'Atelier 04','font-family="Georgia" font-style="italic"')+text(55,350,22,'Design, direction artistique &amp; création numérique.')+text(55,390,18,'ÉTUDE DE CARTE — AUCUNE COORDONNÉE RÉELLE')+'</g></g>';}s+='</g>';
 }
 if(i===3){
  s+='<g fill="'+fg+'">'+text(55,90,22,'FLUX / LE MOUVEMENT COMME LANGAGE');
  for(let j=0;j<14;j++)s+='<path d="M'+(-260+j*130)+' 850 Q'+(400+j*50)+' '+(v===1?-350:150)+' '+(1100+j*120)+' -50" fill="none" stroke="'+fg+'" stroke-width="'+(v===2?38:58)+'" opacity="'+(.1+j*.055)+'"/>';
  s+=text(v===1?180:40,660,330,v===2?'→→':'flux','letter-spacing="-24" font-weight="700"')+text(60,820,23,['01 / TRAJECTOIRE','02 / ACCÉLÉRATION','03 / CONTINUITÉ'][v]);s+='</g>';
 }
 if(i===4){
  s+='<g fill="'+fg+'">'+text(55,85,22,'RIVAGE / JOURNAL DES HORIZONS');
  for(let j=0;j<18;j++)s+='<path d="M-100 '+(300+j*27)+' C250 '+(100+j*20)+' 540 '+(700-j*8)+' 1300 '+(240+j*25)+'" fill="none" stroke="'+fg+'" stroke-width="'+(j%3===0?4:1)+'" opacity=".5"/>';
  if(v===0)s+=text(55,750,195,'Rivage','font-family="Georgia" font-style="italic" letter-spacing="-12"');
  else{s+='<rect x="'+(v===1?640:80)+'" y="170" width="450" height="560" fill="'+bg+'" opacity=".95"/>';s+=text(v===1?675:115,255,58,v===1?'Entre terre':'Prendre le large','font-family="Georgia" font-style="italic"')+text(v===1?675:115,320,58,v===1?'et lumière.':'','font-family="Georgia" font-style="italic"');for(let j=0;j<7;j++)s+='<rect x="'+(v===1?680:120)+'" y="'+(400+j*28)+'" width="'+(j===6?210:330)+'" height="5" opacity=".3"/>';}s+='</g>';
 }
 if(i===5){
  s+='<g fill="'+fg+'">'+text(50,90,36,'module /')+text(960,88,17,'ESPACE DE TRAVAIL');
  s+='<rect x="50" y="140" width="1100" height="680" rx="14" fill="#222b29"/><path d="M250 140V820" stroke="#50625c"/>';
  ['Vue d’ensemble','Mes espaces','Activité','Bibliothèque','Paramètres'].forEach((label,j)=>{s+=text(76,210+j*58,17,label);});
  s+=text(290,215,35,v===2?'Votre prochain espace.':'Tout, au même endroit.','letter-spacing="-1"');
  for(let j=0;j<3;j++){s+='<rect x="'+(290+j*275)+'" y="265" width="250" height="125" rx="8" fill="#334b42"/>'+text(315+j*275,310,16,['EN COURS','À EXPLORER','TERMINÉ'][j])+text(315+j*275,360,35,['12','08','24'][j]);}
  s+='<rect x="290" y="425" width="795" height="325" rx="8" fill="#18221e"/>';for(let j=0;j<10;j++)s+='<rect x="'+(320+j*73)+'" y="'+(690-(60+Math.sin(j*.8+v)*40+j*12))+'" width="36" height="'+(60+Math.sin(j*.8+v)*40+j*12)+'" rx="3" fill="'+fg+'" opacity="'+(.25+j*.07)+'"/>';s+=text(315,468,19,'Rythme de création — données illustratives');s+='</g>';
 }
 if(i===6){
  s+='<g fill="'+fg+'">'+text(55,90,23,'SILLAGE / LES OBJETS LAISSENT UNE TRACE');
  if(v===0||v===2){s+='<g filter="url(#shadow)" transform="translate('+(v===0?400:230)+' 175) rotate('+(v===0?-9:9)+' 160 250)"><path d="m0 65 250-65 160 70-245 70z" fill="#89967b"/><path d="M0 65 165 140v450L0 505z" fill="#425341"/><path d="m165 140 245-70v450l-245 70z" fill="#f2ead8"/><g fill="#455748" transform="translate(220 190)">'+text(0,70,45,'Sillage','font-family="Georgia" font-style="italic"')+text(0,115,15,'ÉDITION BOTANIQUE')+'</g><path d="m215 500 30-230 18 170 40-160 20 200" fill="none" stroke="#455748" stroke-width="8"/></g>';}
  else{for(let j=0;j<4;j++)s+='<rect x="'+(70+j*280)+'" y="'+(180+j%2*80)+'" width="240" height="480" rx="100" fill="'+(j%2?fg:'#f3ecdc')+'"/><g fill="'+(j%2?bg:fg)+'">'+text(93+j*280,410+j%2*80,47,'Sillage','font-family="Georgia" font-style="italic"')+'</g>';}
  s+=text(55,820,20,'MATIÈRE / LIGNE / EMPREINTE');s+='</g>';
 }
 if(i===7){
  s+='<g fill="'+fg+'">'+text(55,90,23,'ORBITE / ÉTUDE DE VOLUME');
  const cx=v===1?520:650,cy=450;for(let j=0;j<34;j++){const angle=j/34*Math.PI*2;const x=cx+Math.cos(angle)*265,y=cy+Math.sin(angle)*265;s+='<path d="M'+cx+' '+cy+' '+x+' '+y+' '+(x+Math.sin(angle)*90)+' '+(y-Math.cos(angle)*90)+'Z" fill="'+fg+'" opacity="'+(.15+.8*j/34)+'"/>';}
  s+='<circle cx="'+cx+'" cy="'+cy+'" r="82" fill="'+bg+'"/>'+text(50,795,170,v===2?'↗':'orbite','letter-spacing="-10" font-weight="700"');s+='</g>';
 }
 if(i===8){
  s+='<g fill="'+fg+'">'+text(55,85,23,'ÉCHO / CE QUI RESTE APRÈS LE SIGNE');
  if(v===0){s+=text(35,620,470,'écho','font-weight="700" letter-spacing="-50"');}
  else{for(let j=0;j<5;j++)s+=text(v===1?40+j*30:40,220+j*135,180,j%2?'ÉCHO':'écho','font-weight="700" letter-spacing="-18" opacity="'+(.2+j*.18)+'"');}
  s+='<path d="M60 800H1140" stroke="'+fg+'" stroke-width="2"/>'+text(60,846,19,'ÉTUDE TYPOGRAPHIQUE / JL. / 2026');s+='</g>';
 }
 if(i===9){
  s+='<g fill="'+fg+'">'+text(55,90,30,'traverse ↗')+text(915,87,17,'LE GOÛT DU DÉTOUR');
  for(let j=0;j<14;j++)s+='<path d="M-50 '+(180+j*48)+'Q400 '+(60+j*50)+' 700 '+(250+j*35)+'T1300 '+(170+j*55)+'" fill="none" stroke="'+fg+'" opacity=".16" stroke-width="2"/>';
  if(v===0){s+='<path d="M290 670Q150 250 580 280T880 600" fill="none" stroke="'+fg+'" stroke-width="8" stroke-dasharray="10 15"/><circle cx="290" cy="670" r="25"/><circle cx="880" cy="600" r="25"/>'+text(60,465,150,'Un peu plus loin.','font-family="Georgia" font-style="italic" letter-spacing="-8"');}
  else{for(let j=0;j<3;j++){const x=140+j*320;s+='<g filter="url(#shadow)"><rect x="'+x+'" y="170" width="270" height="550" rx="30" fill="#f0f1da"/><rect x="'+(x+14)+'" y="215" width="242" height="310" rx="15" fill="'+['#abc2ab','#d2be9b','#a9c9cb'][j]+'"/><path d="m'+(x+20)+' 460 70-150 60 100 70-130 55 180" fill="none" stroke="#21715b" stroke-width="4"/><g fill="#21715b">'+text(x+30,575,29,['Le sentier','L’escale','L’horizon'][j])+text(x+30,620,15,'ITINÉRAIRE IMAGINAIRE')+'</g></g>';}}
  s+='</g>';
 }
 return wrap(s,bg);
}
for(let i=0;i<specs.length;i++)for(let v=0;v<3;v++){const file=path.join(out,specs[i][0]+(v===0?'-cover':'-0'+(v+1))+'.svg');if(!fs.existsSync(file)||process.argv.includes('--demo-visuals'))fs.writeFileSync(file,artwork(i,v));}
(async()=>{
 const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();
 const configured=JSON.parse(fs.readFileSync(path.join(root,'src','data','projects.json'),'utf8'));
 const covers=configured.map(p=>{const file=path.resolve(root,'public',p.image.src.replace(/^\.\//,''));const ext=path.extname(file).toLowerCase();const mime=ext==='.svg'?'image/svg+xml':ext==='.png'?'image/png':ext==='.webp'?'image/webp':'image/jpeg';return 'data:'+mime+';base64,'+fs.readFileSync(file).toString('base64');});
 const source='data:image/png;base64,'+fs.readFileSync(path.join(portraitDir,'source.png')).toString('base64');
 const result=await page.evaluate(async({covers,source})=>{
   const load=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
   const imgs=await Promise.all(covers.map(load));const photo=await load(source);
   const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=Math.ceil(imgs.length/4)*192;const ctx=atlas.getContext('2d');
   const averages=[];
   imgs.forEach((img,i)=>{ctx.drawImage(img,i%4*256,Math.floor(i/4)*192,256,192);const data=ctx.getImageData(i%4*256,Math.floor(i/4)*192,256,192).data;let l=0;for(let k=0;k<data.length;k+=4)l+=(data[k]*.2126+data[k+1]*.7152+data[k+2]*.0722)/255;averages.push(l/(256*192));});
   const mask=document.createElement('canvas');mask.width=132;mask.height=176;const mc=mask.getContext('2d');mc.drawImage(photo,0,0,132,176);const px=mc.getImageData(0,0,132,176).data;
   const points=[];const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
   const poster=document.createElement('canvas');poster.width=1056;poster.height=1408;const pc=poster.getContext('2d');pc.fillStyle='#080808';pc.fillRect(0,0,poster.width,poster.height);
   for(let y=1;y<175;y++)for(let x=1;x<131;x++){
     const p=(y*132+x)*4,l=(px[p]+px[p+1]+px[p+2])/765,seed=y*132+x;
     if(l<.024)continue;
     const jx=(hash(seed)-.5)*.12,jy=(hash(seed+3)-.5)*.12,id=Math.floor(hash(seed+9)*imgs.length);
     const target=.025+Math.pow(l,.9)*.92,gain=target/averages[id];
     const z=(l*.40+Math.exp(-((x/132-.56)**2/.022+(y/176-.48)**2/.05))*.4-.25);
     points.push(Number(((x/132-.5+jx/132)*6.7).toFixed(5)),Number(((.5-y/176+jy/176)*9).toFixed(5)),Number(z.toFixed(4)),Number(gain.toFixed(4)),id,Number(hash(seed+20).toFixed(5)));
     // Every visible mark in the static alternative is also a miniature cover.
     pc.save();pc.globalAlpha=Math.min(1,target*1.75+.06);
     pc.drawImage(imgs[id],(x+jx)*8,(y+jy)*8,6.2,4.65);pc.restore();
     // Preserve the source luminance without placing any portrait photo behind the tiles.
     if(target<.5){pc.fillStyle='rgba(8,8,8,'+(1-target*1.65)+')';pc.fillRect((x+jx)*8,(y+jy)*8,6.2,4.65);}
   }
   return {atlas:atlas.toDataURL('image/webp',.94),poster:poster.toDataURL('image/webp',.95),layout:{columns:132,rows:176,stride:6,projectCount:imgs.length,points},count:points.length/6};
 },{covers,source});
 fs.writeFileSync(path.join(portraitDir,'atlas.webp'),Buffer.from(result.atlas.split(',')[1],'base64'));
 fs.writeFileSync(path.join(portraitDir,'poster.webp'),Buffer.from(result.poster.split(',')[1],'base64'));
 fs.writeFileSync(path.join(portraitDir,'layout.json'),JSON.stringify(result.layout));
 console.log('Generated 30 project visuals, atlas, portrait fallback and '+result.count+' deterministic portrait tiles.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
