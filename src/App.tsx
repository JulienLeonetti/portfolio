import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { LivingType, MorphGrid, SensitiveSurface } from './components/Experiments';
import { experiments } from './data/experiments';
import { profile, contactLinks } from './data/site';
import { publishedProjects } from './data/projects';
import { useReducedMotion } from './hooks/useMotion';
import { useGallery } from './hooks/useGallery';

const Arrow=()=> <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5"/></svg>;
const items=[
  ...experiments.map(e=>({...e,kind:'experiment' as const})),
  ...publishedProjects.map((p,i)=>({slug:p.slug,title:p.title,category:p.category,description:p.description,instruction:p.context,number:String(i+4).padStart(2,'0'),kind:'project' as const})),
];
type Overlay={kind:'experience';slug:string}|{kind:'about'|'contact'}|null;
function hasWebGL(){try{const gl=document.createElement('canvas').getContext('webgl');if(!gl)return false;gl.getExtension('WEBGL_lose_context')?.loseContext();return true;}catch{return false;}}

export default function App(){
  const reduced=useReducedMotion();
  const [webgl,setWebgl]=useState(hasWebGL);
  const [simple,setSimple]=useState(false);
  const [overlay,setOverlay]=useState<Overlay>(null);
  const [paused,setPaused]=useState(false);
  const [gridStep,setGridStep]=useState(0);
  const [pulse,setPulse]=useState(0);
  const gallery=useRef<HTMLElement>(null);
  const opener=useRef<HTMLElement|null>(null);
  const savedScroll=useRef(0);
  const savedExplore=useRef(0);
  const mode=reduced||!webgl||simple?'index':'explore';
  const detail=overlay?.kind==='experience'?overlay.slug:null;
  const info=overlay?.kind==='about'||overlay?.kind==='contact'?overlay.kind:null;
  const failure=useCallback(()=>setWebgl(false),[]);
  const close=useCallback(()=>setOverlay(null),[]);
  useGallery(gallery,mode,detail,reduced,paused);

  useEffect(()=>{
    if(!overlay)return;
    const priorOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const panel=detail?gallery.current?.querySelector<HTMLElement>('[data-slug="'+detail+'"]'):document.querySelector<HTMLElement>('.info-panel');
    const focusFrame=requestAnimationFrame(()=>panel?.querySelector<HTMLButtonElement>('[data-close]')?.focus({preventScroll:true}));
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();close();}
      if(event.key==='Tab'){
        const nodes=Array.from(panel?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex="0"]')??[]);
        const first=nodes[0],last=nodes[nodes.length-1];
        if(event.shiftKey&&(document.activeElement===first||!panel?.contains(document.activeElement))){event.preventDefault();last?.focus({preventScroll:true});}
        else if(!event.shiftKey&&(document.activeElement===last||!panel?.contains(document.activeElement))){event.preventDefault();first?.focus({preventScroll:true});}
      }
    };
    document.addEventListener('keydown',key);
    return()=>{
      cancelAnimationFrame(focusFrame);document.body.style.overflow=priorOverflow;document.removeEventListener('keydown',key);
      requestAnimationFrame(()=>{
        window.scrollTo({top:savedScroll.current,behavior:'instant'});
        const trigger=detail?gallery.current?.querySelector<HTMLButtonElement>('[data-slug="'+detail+'"] .panel-hit'):opener.current;
        trigger?.focus({preventScroll:true});
      });
    };
  },[overlay,detail,close]);

  function open(next:Exclude<Overlay,null>,event:MouseEvent<HTMLButtonElement>){
    opener.current=event.currentTarget;savedScroll.current=window.scrollY;setPulse(0);setOverlay(next);
  }
  function explore(){window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});}
  function goToExperience(index:number){
    const range=Math.max(0,(gallery.current?.offsetHeight??innerHeight)-innerHeight);
    window.scrollTo({top:index/Math.max(1,items.length-1)*range,behavior:reduced?'instant':'smooth'});
  }
  function toggleReading(){
    if(mode==='explore')savedExplore.current=window.scrollY;
    setSimple(value=>!value);
    requestAnimationFrame(()=>window.scrollTo({top:mode==='explore'?0:savedExplore.current,behavior:'instant'}));
  }
  const blocked=Boolean(overlay);
  return <div className="portfolio" data-view={mode} data-detail={Boolean(detail)} data-info={info??''} data-paused={paused||reduced}>
    <a className="skip-link" href="#laboratoire">Aller aux expériences</a>
    <header className="header" inert={blocked}>
      <button className="monogram" onClick={explore} aria-label="JL — retour au début">JL<span>.</span></button>
      <div className="header-study"><span>Étudiant en BUT MMI</span><span>Design & développement</span></div>
      <div className="header-location"><span>Basé en</span><span>Corse, France</span></div>
      <nav aria-label="Navigation principale">
        <button onClick={explore} aria-current="location">Explorer</button><span aria-hidden="true">·</span>
        <button onClick={e=>open({kind:'about'},e)}>À propos</button><span aria-hidden="true">·</span>
        <button onClick={e=>open({kind:'contact'},e)}>Contact</button>
      </nav>
    </header>
    <main>
      <section id="laboratoire" className={'gallery '+(mode==='index'?'is-index':'')} ref={gallery} aria-label="Galerie interactive" tabIndex={-1} inert={Boolean(info)} style={{'--item-count':items.length} as React.CSSProperties}>
        <div className="gallery-stage">
          <div className="space-guides" aria-hidden="true"><div className="space-orbit"/><span className="cross cross-one">+</span><span className="cross cross-two">+</span><span className="space-coordinate">JL / ESPACE CRÉATIF</span></div>
          <div className="lab-heading" inert={Boolean(detail)}><span className="eyebrow"><i className="status-dot"/> LABORATOIRE — {String(experiments.length).padStart(2,'0')} EXPÉRIENCES</span><span>Expériences créées pour ce portfolio</span></div>
          {mode==='index'&&<div className="simple-heading" inert={blocked}><h2>{profile.name}</h2><p>Le laboratoire · lecture simplifiée</p></div>}
          {detail&&<div className="detail-backdrop" aria-hidden="true"/>}
          {items.map((item,i)=>{
            const selected=detail===item.slug;
            const project=publishedProjects.find(p=>p.slug===item.slug);
            return <article key={item.slug} className={'gallery-panel panel-'+i+(selected?' is-detail':'')+(project?' is-project':'')} data-slug={item.slug} role={selected?'dialog':undefined} aria-modal={selected?true:undefined} aria-labelledby={'title-'+item.slug} aria-describedby={selected?'instruction-'+item.slug:undefined} inert={Boolean(detail&&!selected)}>
              <div className="panel-visual">
                {i===0?<LivingType active={selected} reduced={reduced} paused={paused} pulse={pulse}/>:i===1?<MorphGrid step={gridStep} reduced={reduced||paused}/>:i===2?<SensitiveSurface active={selected} reduced={reduced||!webgl} paused={paused} pulse={pulse} onFailure={failure}/>:project?<img src={project.image.src} alt={project.image.alt}/>:null}
                {!selected&&<button className="panel-hit" onPointerDown={e=>e.preventDefault()} aria-label={'Ouvrir '+item.title} onClick={e=>open({kind:'experience',slug:item.slug},e)}><span className="panel-open">Explorer <Arrow/></span></button>}
              </div>
              <div className="panel-caption">
                <div className="panel-number eyebrow">{item.number}<span> / {item.kind==='experiment'?'LAB':'PROJET'}</span></div>
                <div>{project&&<span className="project-category eyebrow">{item.category}</span>}<h3 id={'title-'+item.slug}>{item.title}</h3><p>{selected?item.instruction:item.description}</p></div>
                {!selected&&<span className="caption-arrow" aria-hidden="true">↗</span>}
              </div>
              {selected&&<>
                <button className="detail-close" data-close onClick={close}>Retour à la galerie <span aria-hidden="true">×</span></button>
                <span className="sr-only" id={'instruction-'+item.slug}>{item.instruction}</span>
                {i<3&&<div className="experiment-controls">
                  {i===1?<><button className="control-secondary" onClick={()=>setGridStep(value=>(value+2)%3)} aria-label="État précédent">←</button><span className="eyebrow" aria-live="polite">{['STRUCTURE','DÉCALAGE','MONOGRAMME JL'][gridStep]} / {gridStep+1}—3</span><button className="control-primary" onClick={()=>setGridStep(value=>(value+1)%3)}>Transformer <span>↗</span></button></>:<><span className="eyebrow">POINTEUR · TACTILE · BOUTON</span><button className="control-primary" onClick={()=>setPulse(value=>value+1)}>{i===0?'Animer les lettres':'Créer une onde'}<span>↗</span></button></>}
                </div>}
                {project&&<div className="project-detail" tabIndex={0} aria-label="Présentation du projet"><p>{project.context}</p><h4>Mon rôle</h4><p>{project.role}</p><h4>La démarche</h4>{project.approach.map((p,j)=><p key={j}>{p}</p>)}{project.gallery.map(img=><img key={img.src} src={img.src} alt={img.alt} loading="lazy"/>)}{project.links.map(link=><a key={link.url} href={link.url}>{link.label} ↗</a>)}</div>}
              </>}
            </article>;
          })}
          <div className="gallery-intro" inert={blocked} aria-hidden={mode==='index'?true:undefined}>
            <div className="intro-copy"><p>{profile.introduction}</p><span className="eyebrow">DESIGN · CODE · INTERACTION</span></div>
            <h1><span>Julien</span> <span>Leonetti</span><i aria-hidden="true">.</i></h1>
          </div>
          <div className="journey-caption" inert={blocked}>{items.map(item=><div key={item.slug} data-caption><span className="eyebrow">{item.kind==='experiment'?'EXPÉRIENCE':'PROJET'} {item.number} / {item.category}</span><h2>{item.title}</h2><p>{item.description}</p></div>)}</div>
          <div className="journey-marker" inert={blocked}>
            <div className="journey-count eyebrow"><span className="exploration-current">01</span><span>/ {String(items.length).padStart(2,'0')}</span></div>
            {mode==='explore'&&<div className="experience-stops" aria-label="Accès direct aux expériences">{items.map((item,i)=><button key={item.slug} onClick={()=>goToExperience(i)} aria-label={'Centrer '+item.title}><span/></button>)}</div>}
            {mode==='explore'&&<button className="scroll-invite" onClick={()=>window.scrollBy({top:innerHeight*.8,behavior:'smooth'})}>Défiler pour explorer <span>↓</span></button>}
          </div>
          <div className="progress-track" role="progressbar" aria-label="Progression dans la galerie" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><div className="progress-fill"/></div>
        </div>
      </section>
    </main>
    <div className="accessibility-controls" inert={blocked}>
      {!reduced&&webgl?<button className="reading-toggle" onClick={toggleReading} aria-pressed={simple}>{simple?'Revenir à la galerie':'Lecture simplifiée'}</button>:<span className="reading-label">{reduced?'Mouvement réduit':'Lecture simplifiée'}</span>}
      {!reduced&&<button className="motion-toggle" onClick={()=>setPaused(value=>!value)} aria-pressed={paused} aria-label={paused?'Reprendre les animations':'Suspendre les animations'}><span aria-hidden="true">{paused?'▷':'Ⅱ'}</span></button>}
    </div>
    {info&&<div className="info-layer">
      <div className="info-backdrop" onClick={close} aria-hidden="true"/>
      <aside className="info-panel" role="dialog" aria-modal="true" aria-labelledby="info-title" aria-describedby="info-description">
        <div className="info-top"><span className="eyebrow">{info==='about'?'À PROPOS':'CONTACT'} / JULIEN LEONETTI</span><button data-close onClick={close} aria-label={'Fermer '+(info==='about'?'À propos':'Contact')}>×</button></div>
        <h2 id="info-title">{info==='about'?'Moi, c’est Julien.':'Et si on échangeait ?'}</h2>
        <p id="info-description">{info==='about'?profile.introduction:'Design, développement, création numérique.'}</p>
        {info==='about'?<div className="info-note eyebrow">BUT MMI · IUT DE CORSE<br/>BASÉ EN CORSE, FRANCE</div>:contactLinks.length>0?<div className="contact-links">{contactLinks.map(link=><a href={link.href} key={link.label}>{link.label}<Arrow/></a>)}</div>:null}
        <button className="info-return" onClick={close}>Retour à la galerie <Arrow/></button>
      </aside>
    </div>}
  </div>;
}
