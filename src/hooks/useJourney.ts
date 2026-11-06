import { useLayoutEffect, type RefObject } from 'react';
export const clamp=(value:number,min=0,max=1)=>Math.min(max,Math.max(min,value));
const smooth=(a:number,b:number,value:number)=>{const t=clamp((value-a)/(b-a));return t*t*(3-2*t);};
export const projectProgress=(index:number,count:number)=>.2+index/Math.max(1,count-1)*.8;

export function useJourney(root:RefObject<HTMLElement|null>,progress:RefObject<number>,count:number,reading:boolean,fallback:boolean,blocked:boolean,onActive:(index:number)=>void){
 useLayoutEffect(()=>{
  const el=root.current;if(!el)return;
  const home=el.querySelector<HTMLElement>('.portrait-home')!,controls=el.querySelector<HTMLElement>('.exploration-controls')!,captions=el.querySelector<HTMLElement>('.project-caption')!;
  const cards=Array.from(el.querySelectorAll<HTMLElement>('.project-card'));
  let frame=0,last=-1;
  const render=()=>{
   frame=0;const h=innerHeight,w=el.clientWidth;
   el.style.setProperty('--scene-height',(reading||fallback?1:1.6+count*.55)*h+'px');
   const range=Math.max(1,el.offsetHeight-h),p=reading||fallback?0:clamp(scrollY/range);
   progress.current=p;
   const cursor=clamp((p-.2)/.8)*Math.max(0,count-1),active=Math.round(cursor),entry=smooth(.10,.20,p);
   const homeOpacity=1-smooth(.025,.16,p),exploreOpacity=smooth(.12,.20,p);
   el.dataset.phase=p>.16?'explore':'portrait';el.dataset.active=String(active);el.dataset.progress=p.toFixed(5);
   home.style.opacity=String(reading?0:homeOpacity);home.inert=blocked||reading||homeOpacity<.1;
   controls.style.opacity=String(exploreOpacity);controls.inert=blocked||reading||exploreOpacity<.2;
   captions.style.opacity=String(exploreOpacity);captions.setAttribute('aria-hidden',String(exploreOpacity<.1));
   captions.querySelectorAll<HTMLElement>('[data-project-caption]').forEach((caption,i)=>{caption.hidden=i!==active;});
   cards.forEach((card,i)=>{
     const d=i-cursor,width=Math.min(w<700?w*.72:w*.26,370);
     const scale=1/(1+Math.abs(d)*.75)*(.04+entry*.96);
     const opacity=entry*clamp(1-Math.abs(d)*.63);
     card.style.width=width+'px';card.style.opacity=String(opacity);
     card.style.transform='translate(-50%,-50%) translate3d('+(d*125)+'px,'+(d*15)+'px,'+(-Math.abs(d)*10)+'px) scale('+scale+')';
     card.style.zIndex=String(30-Math.round(Math.abs(d)*4));
     const enabled=active===i&&entry>.75&&!blocked&&!reading;
     card.inert=!enabled;card.setAttribute('aria-hidden',String(opacity<.05));
     card.style.pointerEvents=enabled?'auto':'none';
   });
   if(last!==active){last=active;onActive(active);}
   dispatchEvent(new Event('portfolio:render'));
  };
  const update=()=>{if(!frame)frame=requestAnimationFrame(render);};
  render();addEventListener('scroll',update,{passive:true});addEventListener('resize',update);
  return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',update);removeEventListener('resize',update);};
 },[root,progress,count,reading,fallback,blocked,onActive]);
}
