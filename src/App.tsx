import { Component, Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { publishedProjects as projects } from './data/projects';
import { profile, contactLinks } from './data/site';
import { portraitAssets } from './data/portrait';
import { projectProgress, useJourney } from './hooks/useJourney';
import { useReducedMotion } from './hooks/useMotion';
import ProjectModal from './components/ProjectModal';
const PortraitScene=lazy(()=>import('./components/PortraitScene'));
class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return{failed:true};}componentDidCatch(){this.props.onFailure();}render(){return this.state.failed?null:this.props.children;}
}
const Arrow=()=> <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5"/></svg>;
type Overlay={kind:'project';slug:string}|{kind:'about'|'contact'}|null;
function hashProject(){try{const slug=decodeURIComponent(location.hash.replace(/^#projet\//,''));return projects.find(project=>project.slug===slug);}catch{return undefined;}}
function supportsWebGL(){try{const gl=document.createElement('canvas').getContext('webgl2');if(!gl)return false;gl.getExtension('WEBGL_lose_context')?.loseContext();return true;}catch{return false;}}

export default function App(){
 const reduced=useReducedMotion(),initialProject=useRef(hashProject());
 const [fallback,setFallback]=useState(()=>!supportsWebGL()),[ready,setReady]=useState(false),[paused,setPaused]=useState(false),[reading,setReading]=useState(false);
 const [active,setActive]=useState(()=>Math.max(0,projects.findIndex(project=>project.slug===initialProject.current?.slug)));
 const [overlay,setOverlay]=useState<Overlay>(()=>initialProject.current?{kind:'project',slug:initialProject.current.slug}:null);
 const root=useRef<HTMLElement>(null),progress=useRef(0),opener=useRef<HTMLElement|null>(null),origin=useRef<DOMRect|null>(null);
 const savedScroll=useRef(0),savedReadingScroll=useRef(0),openedFromApp=useRef(false),overlayRef=useRef(overlay);overlayRef.current=overlay;
 const onReady=useCallback(()=>setReady(true),[]),onFailure=useCallback(()=>{setFallback(true);setReady(false);},[]),onActive=useCallback((index:number)=>setActive(index),[]);
 const blocked=Boolean(overlay);
 useJourney(root,progress,projects.length,reading,fallback,blocked,onActive);

 const close=useCallback(()=>{
   if(overlayRef.current?.kind==='project'){
     if(openedFromApp.current&&history.state?.portfolioProject){openedFromApp.current=false;history.back();return;}
     history.replaceState({sceneScroll:savedScroll.current},'',location.pathname+location.search);
   }
   setOverlay(null);
 },[]);
 useLayoutEffect(()=>{
   const project=initialProject.current;if(!project||!root.current)return;
   const index=projects.findIndex(item=>item.slug===project.slug),range=Math.max(0,root.current.offsetHeight-innerHeight);
   const scroll=history.state?.sceneScroll??range*projectProgress(index,projects.length);
   savedScroll.current=scroll;progress.current=projectProgress(index,projects.length);
   window.scrollTo({top:scroll,behavior:'instant'});
 },[]);
 useEffect(()=>{
   const restoration=history.scrollRestoration;history.scrollRestoration='manual';
   const pop=()=>{
     const project=hashProject();savedScroll.current=history.state?.sceneScroll??savedScroll.current;
     setOverlay(project?{kind:'project',slug:project.slug}:null);
     if(project)setActive(projects.findIndex(item=>item.slug===project.slug));
     requestAnimationFrame(()=>window.scrollTo({top:savedScroll.current,behavior:'instant'}));
   };
   addEventListener('popstate',pop);
   return()=>{removeEventListener('popstate',pop);history.scrollRestoration=restoration;};
 },[]);
 useEffect(()=>{
   if(!overlay)return;
   const previous=document.body.style.overflow;document.body.style.overflow='hidden';
   const panel=document.querySelector<HTMLElement>('.overlay-panel');
   const frame=requestAnimationFrame(()=>panel?.querySelector<HTMLButtonElement>('[data-close]')?.focus({preventScroll:true}));
   const key=(event:KeyboardEvent)=>{
     if(event.key==='Escape'){event.preventDefault();close();}
     if(event.key==='Tab'){
       const nodes=Array.from(panel?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input,[tabindex="0"]')??[]);
       const first=nodes[0],last=nodes[nodes.length-1];
       if(event.shiftKey&&(document.activeElement===first||!panel?.contains(document.activeElement))){event.preventDefault();last?.focus({preventScroll:true});}
       else if(!event.shiftKey&&(document.activeElement===last||!panel?.contains(document.activeElement))){event.preventDefault();first?.focus({preventScroll:true});}
     }
   };
   document.addEventListener('keydown',key);
   return()=>{
     cancelAnimationFrame(frame);document.body.style.overflow=previous;document.removeEventListener('keydown',key);
     requestAnimationFrame(()=>{
       window.scrollTo({top:savedScroll.current,behavior:'instant'});
       const trigger=opener.current?.isConnected?opener.current:overlay.kind==='project'?document.querySelector<HTMLElement>('[data-project="'+overlay.slug+'"] button'):null;
       trigger?.focus({preventScroll:true});
     });
   };
 },[overlay,close]);

 function goTo(index:number,instant=false){
   if(fallback){setReading(true);return;}
   const target=Math.max(0,Math.min(projects.length-1,index)),range=Math.max(1,(root.current?.offsetHeight??innerHeight)-innerHeight);
   window.scrollTo({top:projectProgress(target,projects.length)*range,behavior:reduced||instant?'instant':'smooth'});
 }
 useEffect(()=>{
   const key=(event:KeyboardEvent)=>{
     if(overlay||reading||progress.current<.18||event.altKey||event.metaKey||event.ctrlKey)return;
     if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();goTo(active+(event.key==='ArrowRight'?1:-1));}
   };
   addEventListener('keydown',key);return()=>removeEventListener('keydown',key);
 });
 function explore(){if(fallback){setReading(true);return;}goTo(0);}
 function returnPortrait(){
   savedScroll.current=0;openedFromApp.current=false;
   if(hashProject())history.replaceState({sceneScroll:0},'',location.pathname+location.search);
   setOverlay(null);setReading(false);
   requestAnimationFrame(()=>window.scrollTo({top:0,behavior:reduced?'instant':'smooth'}));
 }
 function openProject(slug:string,event:MouseEvent<HTMLButtonElement>){
   opener.current=event.currentTarget;origin.current=event.currentTarget.querySelector('img')?.getBoundingClientRect()??event.currentTarget.getBoundingClientRect();
   window.scrollTo({top:scrollY,behavior:'instant'});savedScroll.current=scrollY;openedFromApp.current=true;
   history.replaceState({...history.state,sceneScroll:scrollY},'',location.href);
   history.pushState({portfolioProject:true,sceneScroll:scrollY,slug},'','#projet/'+slug);
   setOverlay({kind:'project',slug});
 }
 function openInfo(kind:'about'|'contact',event:MouseEvent<HTMLButtonElement>){opener.current=event.currentTarget;origin.current=null;window.scrollTo({top:scrollY,behavior:'instant'});savedScroll.current=scrollY;setOverlay({kind});}
 function toggleReading(){
   if(!reading){savedReadingScroll.current=scrollY;setReading(true);window.scrollTo({top:0,behavior:'instant'});}
   else{setReading(false);requestAnimationFrame(()=>window.scrollTo({top:savedReadingScroll.current,behavior:'instant'}));}
 }
 const project=overlay?.kind==='project'?projects.find(item=>item.slug===overlay.slug):undefined;
 return <div className="portfolio" data-fallback={fallback} data-reading={reading} data-paused={paused||reduced} data-overlay={blocked} data-ready={ready}>
   <a className="skip-link" href="#scene">Aller aux projets</a>
   <header className="header" inert={blocked}>
     <button className="monogram" onClick={returnPortrait} aria-label="JL — retour au portrait">JL<span>.</span></button>
     <div className="header-study"><span>Étudiant en BUT MMI</span><span>Design & développement</span></div>
     <div className="header-location"><span>Basé en</span><span>Corse, France</span></div>
     <nav aria-label="Navigation principale"><button onClick={explore}>Explorer</button><span aria-hidden="true">·</span><button onClick={event=>openInfo('about',event)}>À propos</button><span aria-hidden="true">·</span><button onClick={event=>openInfo('contact',event)}>Contact</button></nav>
   </header>
   <main>
     <section ref={root} id="scene" className="scene" aria-label="Portrait de projets et exploration" tabIndex={-1} style={{'--project-count':projects.length} as React.CSSProperties}>
       <div className="scene-frame" inert={blocked||reading}>
         <figure className="portrait-stage" aria-label={portraitAssets.provisional?"Portrait humain provisoire composé des couvertures des projets":"Portrait en miniatures de "+profile.name}>
           <img className="portrait-poster" src={portraitAssets.poster} alt="" aria-hidden="true" style={{opacity:ready&&!fallback?0:1}}/>
           {!fallback&&<SceneBoundary onFailure={onFailure}><Suspense fallback={null}><PortraitScene progress={progress} reduced={reduced} paused={paused||blocked} onReady={onReady} onFailure={onFailure}/></Suspense></SceneBoundary>}
           <figcaption className="sr-only">{portraitAssets.provisional?"Portrait humain fictif provisoire. ":""}Les couvertures de {projects.length} projets sont répétées pour construire plusieurs milliers de miniatures.</figcaption>
         </figure>
         <div className="portrait-home">
           <div className="home-topline eyebrow"><span><i className="status-dot"/> {String(projects.length).padStart(2,'0')} PROJETS · UN PORTRAIT</span><span>ESPACE CRÉATIF / JULIEN LEONETTI</span></div>
           <svg className="portrait-lines" viewBox="0 0 1440 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M-80 940C-10 700 440 565 1180 220M465 945C530 755 480 390 474 238" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
           <div className="home-copy"><p>{profile.introduction}</p><span className="eyebrow">DESIGN · CODE · CRÉATION NUMÉRIQUE</span></div>
           <button className="explore-button" onClick={explore}>Explorer les projets <span aria-hidden="true">↓</span></button>
           <h1><span>Julien</span> <span>Leonetti</span><i aria-hidden="true">.</i></h1>
         </div>
         <div className="project-field" aria-label="Projets en exploration">{projects.map((item,index)=><article className="project-card" key={item.slug} data-project={item.slug}>
           <button className="cover-button" onClick={event=>openProject(item.slug,event)} aria-label={'Voir le projet '+item.title}><img src={item.image.src} alt={item.image.alt} width="1200" height="900"/><span className="cover-action">Voir le projet <Arrow/></span></button>
           <span className="sr-only">{String(index+1).padStart(2,'0')} — {item.category}</span>
         </article>)}</div>
         <div className="project-caption">{projects.map((item,index)=><div data-project-caption key={item.slug}><span className="project-number">{String(index+1).padStart(2,'0')}</span><div><h2>{item.title}</h2><p>{item.category}</p></div></div>)}</div>
         <div className="exploration-controls">
           <span className="project-counter eyebrow" aria-live="polite">{String(active+1).padStart(2,'0')} / {String(projects.length).padStart(2,'0')}</span>
           <div className="step-buttons"><button onClick={()=>goTo(active-1)} disabled={active===0} aria-label="Projet précédent">←</button><button onClick={()=>goTo(active+1)} disabled={active===projects.length-1} aria-label="Projet suivant">→</button></div>
           <button className="portrait-return" onClick={returnPortrait}><span aria-hidden="true">↶</span> Retour au portrait</button>
         </div>
       </div>
       {reading&&<aside className="project-index" aria-labelledby="project-index-title" inert={blocked}>
         <div className="index-heading"><div><span className="eyebrow">PARCOURIR LES ÉTUDES</span><h2 id="project-index-title">Les projets<span> ({String(projects.length).padStart(2,'0')})</span></h2></div><button className="pill-button" onClick={toggleReading}>Retour à la scène ↗</button></div>
         <div className="index-scroll" tabIndex={0} aria-label="Liste des projets"><div className="index-grid">{projects.map((item,index)=><button className="index-project" key={item.slug} onClick={event=>openProject(item.slug,event)} aria-label={'Voir le projet '+item.title}><img src={item.image.src} alt={item.image.alt} width="1200" height="900" loading="lazy"/><span className="index-project-caption"><span className="eyebrow">{String(index+1).padStart(2,'0')}</span><span>{item.title}<small>{item.category}</small></span><Arrow/></span></button>)}</div></div>
       </aside>}
     </section>
   </main>
   <div className="scene-tools" inert={blocked}><button className="reading-toggle" onClick={toggleReading}>{reading?'Fermer la liste':'Liste des projets'}</button>{!reduced&&<button onClick={()=>setPaused(value=>!value)} className="motion-toggle" aria-pressed={paused} aria-label={paused?'Reprendre les animations':'Suspendre les animations'}>{paused?'▷':'Ⅱ'}</button>}</div>
   {overlay&&<div className="modal-layer"><div className="modal-backdrop" onClick={close} aria-hidden="true"/>
     {project?<ProjectModal key={project.slug} project={project} index={projects.indexOf(project)} total={projects.length} origin={origin.current} reduced={reduced} onClose={close} onPortrait={returnPortrait}/>:<aside className="info-panel overlay-panel" role="dialog" aria-modal="true" aria-labelledby="info-title" aria-describedby="info-description">
       <div className="info-top"><span className="eyebrow">{overlay.kind==='about'?'À PROPOS':'CONTACT'} / JULIEN LEONETTI</span><button data-close onClick={close} aria-label={'Fermer '+(overlay.kind==='about'?'À propos':'Contact')}>×</button></div>
       <h2 id="info-title">{overlay.kind==='about'?'Moi, c’est Julien.':'Et si on échangeait ?'}</h2><p id="info-description">{overlay.kind==='about'?profile.introduction:'Design, développement et création numérique.'}</p>
       {overlay.kind==='about'?<div className="info-note eyebrow">BUT MMI · IUT DE CORSE<br/>{portraitAssets.provisional||projects.some(item=>item.demonstration)?"Portrait et projets provisoires de démonstration.":"Basé en Corse, France."}</div>:contactLinks.length>0?<div className="contact-links">{contactLinks.map(link=><a href={link.href} key={link.label}>{link.label}<Arrow/></a>)}</div>:null}
       <button className="info-return" onClick={close}>Retour à la scène <Arrow/></button>
     </aside>}
   </div>}
 </div>;
}
