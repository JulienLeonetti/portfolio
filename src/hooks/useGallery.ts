import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';

export type ViewMode='explore'|'index';
const clamp=(n:number,min=0,max=1)=>Math.min(max,Math.max(min,n));
export function useGallery(root:RefObject<HTMLElement|null>,mode:ViewMode,detail:string|null,reduced:boolean,paused:boolean){
  useLayoutEffect(()=>{
    const el=root.current;if(!el)return;
    const panels=Array.from(el.querySelectorAll<HTMLElement>('.gallery-panel'));
    const intro=el.querySelector<HTMLElement>('.gallery-intro')!;
    const caption=el.querySelector<HTMLElement>('.journey-caption')!;
    const marker=el.querySelector<HTMLElement>('.journey-marker')!;
    const progress=el.querySelector<HTMLElement>('.progress-fill')!;
    const progressbar=el.querySelector<HTMLElement>('.progress-track')!;
    const current=el.querySelector<HTMLElement>('.exploration-current')!;
    const stops=Array.from(el.querySelectorAll<HTMLButtonElement>('.experience-stops button'));
    const initialized=el.dataset.initialized==='true';
    let frame=0;
    const render=(transition=false)=>{
      frame=0;
      const w=el.clientWidth,h=innerHeight,mobile=w<700,short=h<600,n=panels.length,gutter=mobile?20:32;
      const indexHeight=mobile?Math.min(150,Math.max(118,(h-280)/3)):Math.min(390,h*.45);
      const columns=mobile?1:Math.min(3,n),rows=Math.ceil(n/columns);
      const indexLength=190+rows*(indexHeight+22)+75;
      el.style.setProperty('--scene-height',mode==='index'?Math.max(h,indexLength)+'px':Math.max(2.8,n*.8+.7)*h+'px');
      const range=Math.max(1,el.offsetHeight-h);
      const p=mode==='index'?0:clamp(window.scrollY/range);
      const active=Math.round(p*(n-1));
      const focus=clamp(p/.16);
      const positions=[{x:-.31*w,y:.035*h,z:0,ry:23,rz:-11},{x:.025*w,y:-.025*h,z:270,ry:-13,rz:6},{x:.39*w,y:-.08*h,z:480,ry:-24,rz:13}];
      for(let i=3;i<n;i++)positions.push({x:Math.sin(i*2)*.32*w,y:Math.cos(i)*.03*h,z:480+(i-2)*270,ry:16,rz:-6});
      const cameraStops=[{p:0,x:0,y:0,z:0},...positions.map((pos,i)=>({p:.14+i/Math.max(1,n-1)*.86,x:pos.x,y:pos.y,z:pos.z+330}))];
      let index=0;while(index<cameraStops.length-2&&p>cameraStops[index+1].p)index++;
      const a=cameraStops[index],b=cameraStops[index+1];
      const t=clamp((p-a.p)/(b.p-a.p)),e=t*t*(3-2*t);
      const camera={x:a.x+(b.x-a.x)*e,y:a.y+(b.y-a.y)*e,z:a.z+(b.z-a.z)*e};
      panels.forEach((panel,i)=>{
        let x:number,y:number,width:number,height:number,scale=1,rotation=0,rotationY=0,opacity=1;
        if(mode==='index'){
          width=(w-gutter*2-(columns-1)*18)/columns;height=indexHeight;
          x=gutter+(i%columns)*(width+18);
          y=190+Math.floor(i/columns)*(height+22)-window.scrollY;
        }else if(mobile){
          width=Math.min(w*.82,h*(short?.52:.68));height=width*.68;
          const distance=i-p*(n-1);
          scale=1-.36*clamp(Math.abs(distance));
          x=w/2+distance*w*.66-width/2;
          y=h*(short?.49:.40)+8-height/2-clamp(Math.abs(distance))*18;
          rotation=-4+clamp(distance,-1,1)*7;rotationY=clamp(distance,-1,1)*-8;
        }else{
          width=Math.min(w*.345,h*(short?.52:.68));height=width*.68;
          const pos=positions[i];
          scale=clamp(1000/Math.max(360,1000+pos.z-camera.z),.35,2.5);
          x=w/2+(pos.x-camera.x)*scale-width/2;
          y=h*(short?.49:.36+.07*focus)+(pos.y-camera.y)*scale-height/2;
          rotationY=pos.ry*(1-focus*.7);rotation=pos.rz*(1-focus*.65);
        }
        if(detail){
          if(panel.dataset.slug===detail){
            width=Math.min(960,w-gutter*2);height=Math.min(630,Math.max(260,h-155));
            x=(w-width)/2;y=(h-height)/2+12;
            scale=1;rotation=0;rotationY=0;
          }else{opacity=.2;scale*=.88;x+=(i%2?1:-1)*w*.055;}
        }
        panel.style.zIndex=detail?(panel.dataset.slug===detail?'30':'10'):String(20-i);
        const values={x,y,width,height,scale,rotation,rotationY,opacity,transformPerspective:1200,force3D:true};
        if(transition&&!reduced&&!paused){
          if(!initialized){
            gsap.set(panel,values);
            gsap.fromTo(panel,{scale:scale*.94,opacity:.5},{scale,opacity,duration:.85,delay:i*.05,ease:'power3.out',overwrite:true});
          }else gsap.to(panel,{...values,duration:.8,ease:'power3.inOut',overwrite:true});
        }else{gsap.killTweensOf(panel);gsap.set(panel,values);}
      });
      const introOpacity=mode==='index'||detail?0:1-clamp(p*7);
      gsap.set(intro,{opacity:introOpacity,y:-clamp(p*7)*30});
      intro.setAttribute('aria-hidden',String(introOpacity<.05));
      const captionOpacity=mode==='index'||detail?0:clamp((p-.13)*10);
      gsap.set(caption,{opacity:captionOpacity});
      caption.setAttribute('aria-hidden',String(captionOpacity<.05));
      caption.querySelectorAll<HTMLElement>('[data-caption]').forEach((node,i)=>{node.hidden=i!==active;});
      gsap.set(marker,{opacity:detail?0:1});
      gsap.set(progress,{scaleX:p});
      progressbar.setAttribute('aria-valuenow',String(Math.round(p*100)));
      current.textContent=String(active+1).padStart(2,'0');
      stops.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));
      el.dataset.active=String(active);
      el.style.setProperty('--caption-shade',String(captionOpacity));
      el.dataset.initialized='true';
    };
    const update=()=>{if(!frame)frame=requestAnimationFrame(()=>render());};
    render(true);
    addEventListener('scroll',update,{passive:true});addEventListener('resize',update);
    return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',update);removeEventListener('resize',update);panels.forEach(panel=>gsap.killTweensOf(panel));};
  },[root,mode,detail,reduced,paused]);
}
