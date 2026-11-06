import { useLayoutEffect, useRef, useState } from 'react';
import type { Project } from '../data/projects';

type Props={project:Project;index:number;total:number;origin:DOMRect|null;reduced:boolean;onClose:()=>void;onPortrait:()=>void};
export default function ProjectModal({project,index,total,origin,reduced,onClose,onPortrait}:Props){
 const panel=useRef<HTMLElement>(null),scrollport=useRef<HTMLDivElement>(null),presentation=useRef<HTMLElement>(null);
 const [copied,setCopied]=useState(false),[manualLink,setManualLink]=useState(false);
 useLayoutEffect(()=>{
   const el=panel.current;if(!el||reduced)return;
   const rect=el.getBoundingClientRect();
   const from=origin?{transform:'translate('+(origin.left-rect.left)+'px,'+(origin.top-rect.top)+'px) scale('+(origin.width/rect.width)+','+(origin.height/rect.height)+')',opacity:.35,borderRadius:'12px'}:{transform:'translateY(16px) scale(.97)',opacity:0,borderRadius:'22px'};
   const animation=el.animate([from,{transform:'none',opacity:1,borderRadius:'22px'}],{duration:560,easing:'cubic-bezier(.22,1,.36,1)'});
   return()=>animation.cancel();
 },[origin,reduced]);
 async function copy(){
   const value=location.href;
   try{
     if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(value);
     else{
       const textarea=document.createElement('textarea');textarea.value=value;textarea.style.position='fixed';textarea.style.opacity='0';panel.current?.appendChild(textarea);textarea.select();const ok=document.execCommand('copy');textarea.remove();if(!ok)throw new Error('Copy unavailable');
     }
     setCopied(true);setManualLink(false);
   }catch{setManualLink(true);}
 }
 function goToPresentation(){
   if(scrollport.current&&presentation.current)scrollport.current.scrollTo({top:presentation.current.getBoundingClientRect().top-scrollport.current.getBoundingClientRect().top+scrollport.current.scrollTop-24,behavior:'instant'});
 }
 const images=[project.image,...project.gallery];
 return <section ref={panel} className="project-modal overlay-panel" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" aria-describedby="project-dialog-description" style={{'--project-accent':project.accent} as React.CSSProperties}>
   <div className="project-toolbar">
     <button data-close className="pill-button" onClick={onClose}><span aria-hidden="true">‹</span> Fermer</button>
     <div className="project-toolbar-actions"><button className="pill-button" onClick={copy}><span aria-hidden="true">↗</span> {copied?'Lien copié':'Copier le lien'}</button><button className="pill-button light-button" onClick={goToPresentation}>Présentation <span aria-hidden="true">↓</span></button></div>
   </div>
   <div className="project-scroll" ref={scrollport} tabIndex={0} aria-label={'Visuels et présentation de '+project.title}>
     <div className="project-topline eyebrow"><span>{String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')} — {project.title}</span><span>{project.demonstration?'Projet de démonstration':project.category}</span></div>
     {manualLink&&<label className="manual-link">Lien à copier<input readOnly value={location.href} onFocus={event=>event.currentTarget.select()}/></label>}
     <span className="sr-only" role="status">{copied?'Lien copié dans le presse-papiers':''}</span>
     <div className="project-visuals">{images.map((image,i)=><figure key={image.src}><img src={image.src} alt={image.alt} width="1200" height="900" loading={i===0?'eager':'lazy'} decoding="async"/><figcaption className="eyebrow">{String(i+1).padStart(2,'0')} / {String(images.length).padStart(2,'0')} <span>{i===0?'LE CONCEPT':'EXPLORATION VISUELLE'}</span></figcaption></figure>)}</div>
     <section className="project-presentation" id="project-presentation" ref={presentation}>
       <div className="project-intro"><span className="eyebrow">{project.category}</span><h2 id="project-dialog-title">{project.title}<span>.</span></h2><p id="project-dialog-description">{project.description}</p></div>
       <div className="project-story"><p>{project.context}</p><h3>La démarche</h3>{project.approach.map((step,i)=><p key={i}>{step}</p>)}<p className="project-role">{project.role}</p></div>
       {project.demonstration&&<p className="demonstration-note"><span className="status-dot"/> Projet de démonstration. Ce concept est fictif et a été créé pour ce portfolio. Il ne correspond à aucune commande client ni à des résultats commerciaux.</p>}
       {project.links.length>0&&<div className="project-links">{project.links.map(link=><a key={link.url} href={link.url}>{link.label} ↗</a>)}</div>}
       <button className="portrait-return-inline" onClick={onPortrait}>Retour au portrait <span aria-hidden="true">↖</span></button>
     </section>
   </div>
 </section>;
}
