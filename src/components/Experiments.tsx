import { useEffect, useRef, useState, type PointerEvent } from 'react';
import gsap from 'gsap';

type Props = { active: boolean; reduced: boolean; paused: boolean; pulse: number };
export function LivingType({active,reduced,pulse}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const warp = (x: number, y: number, force = 1) => {
    const letters = root.current?.querySelectorAll('.living-letter');
    letters?.forEach((letter,i) => {
      const influence = Math.max(0, 1 - Math.abs(x - (i + .5) / 5) * 2.4) * force;
      gsap.to(letter, {scaleX:1 + influence * .24, scaleY:1 - influence * .13, y:(y-.5)*influence*62, rotation:(x-(i+.5)/5)*influence*16, duration:reduced?0:.42, ease:'power3.out', overwrite:true});
    });
  };
  useEffect(() => {
    if (!active || !pulse) return;
    warp(.55,.12);
    const timer = window.setTimeout(() => warp(.5,.5,0),reduced?900:1100);
    return () => clearTimeout(timer);
  }, [pulse,active,reduced]);
  useEffect(() => () => { root.current?.querySelectorAll('.living-letter').forEach(el => gsap.killTweensOf(el)); }, []);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!active) return;
    const r = e.currentTarget.getBoundingClientRect();
    warp((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);
  };
  return <div className="type-art" ref={root} onPointerMove={move} onPointerDown={move} onPointerLeave={()=>warp(.5,.5,0)}>
    <div className="art-top"><span>ÉTUDE DE CARACTÈRE</span><span>JL—001</span></div>
    <div className="type-guides" aria-hidden="true"><i/><i/><i/></div>
    <div className="living-word" aria-label="CRÉER">{[...'CRÉER'].map((letter,i)=><span className="living-letter" key={i} aria-hidden="true">{letter}</span>)}</div>
    <div className="art-bottom"><span>UNE IDÉE PREND FORME.</span><span className="art-plus">✳</span></div>
  </div>;
}

const monogram = [[60,40],[98,40],[136,40],[174,40],[212,40],[212,82],[212,124],[212,166],[212,208],[60,250],[98,250],[136,250],[174,250],[212,250],[60,208],[288,40],[288,82],[288,124],[288,166],[288,208],[288,250],[326,250],[364,250],[402,250]];
export function MorphGrid({step,reduced}: {step:number;reduced:boolean}) {
  const root = useRef<SVGSVGElement>(null);
  useEffect(() => {
    root.current?.querySelectorAll<SVGRectElement>('.grid-module').forEach((el,i)=>{
      const col=i%6,row=Math.floor(i/6);
      const targets = [
        {x:80+col*62,y:45+row*62,rotation:0,scale:1},
        {x:80+col*62+(row%2?22:-22),y:48+row*62+Math.sin(col*1.4)*25,rotation:(col+row)%2?45:-45,scale:.72},
        {x:monogram[i][0],y:monogram[i][1],rotation:0,scale:.76},
      ];
      gsap.to(el,{...targets[step],fill:step===2?'#b6ff00':i%7===0?'#f3f3ef':i%5===0?'none':'#b6ff00',duration:reduced?0:.85,delay:reduced?0:i*.009,ease:'power3.inOut',overwrite:true,transformOrigin:'22px 22px'});
    });
  },[step,reduced]);
  return <div className="grid-art" data-grid-state={step}>
    <div className="art-top"><span>ORDRE / DÉSORDRE</span><span>JL—002</span></div>
    <svg ref={root} viewBox="0 0 520 320" aria-label={['Grille structurée','Composition décalée','Monogramme JL'][step]} role="img">
      <defs><pattern id="graph-grid" width="31" height="31" patternUnits="userSpaceOnUse"><path d="M31 0H0V31" fill="none" stroke="#f3f3ef" strokeOpacity=".08" strokeWidth=".6"/></pattern></defs>
      <rect width="520" height="320" fill="url(#graph-grid)"/>
      {Array.from({length:24},(_,i)=><rect className="grid-module" key={i} width="44" height="44" fill={i%7===0?'#f3f3ef':i%5===0?'none':'#b6ff00'} stroke={i%5===0?'#b6ff00':'none'} strokeWidth="1" style={{transform:'translate('+(80+i%6*62)+'px,'+(45+Math.floor(i/6)*62)+'px)'}}/>)}
    </svg>
    <div className="art-bottom"><span>{['01 — STRUCTURE','02 — DÉCALAGE','03 — SIGNATURE'][step]}</span><span>24 MODULES. ∞ POSSIBILITÉS.</span></div>
  </div>;
}

export function SensitiveSurface({active,reduced,paused,pulse,onFailure}: Props & {onFailure:()=>void}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const point = useRef({x:.5,y:.5,energy:0});
  const requestDraw = useRef<()=>void>(()=>{});
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    if (!active || reduced) return;
    const el=canvas.current!;
    const gl=el.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
    if (!gl) {onFailure();return;}
    let stopped=false, frame=0, visible=true, energy=0, slow=0, dpr=Math.min(devicePixelRatio,1.5);
    const shader=(type:number,source:string)=>{
      const s=gl.createShader(type)!;gl.shaderSource(s,source);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw new Error('Shader unavailable');}
      return s;
    };
    let vertex:WebGLShader,fragment:WebGLShader,program:WebGLProgram;
    try {
      vertex=shader(gl.VERTEX_SHADER,'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}');
      fragment=shader(gl.FRAGMENT_SHADER,`
        precision mediump float;
        varying vec2 uv; uniform vec2 pointer; uniform vec2 size; uniform float energy;
        void main(){
          vec2 p=uv; vec2 d=p-pointer; d.x*=size.x/size.y;
          float r=length(d);
          p+=normalize(d+vec2(.0001))*sin(r*34.-energy*4.)*exp(-r*4.)*energy*.035;
          vec2 q=p-vec2(.52,.48); q.x*=1.5;
          float radius=length(q*vec2(1.,1.18));
          float angle=atan(q.y,q.x);
          float contour=radius+.055*sin(angle*3.+radius*7.);
          float bands=smoothstep(.36,.55,sin(contour*120.));
          float shape=1.-smoothstep(.57,.64,radius);
          vec3 green=vec3(.714,1.,0.);
          vec3 ink=vec3(.035);
          vec3 col=mix(ink,green,bands*shape);
          col+=vec3(.05)*exp(-r*7.)*energy;
          gl_FragColor=vec4(col,1.);
        }`);
      program=gl.createProgram()!;gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Program unavailable');
    } catch {onFailure();return;}
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    gl.useProgram(program);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const pLoc=gl.getUniformLocation(program,'pointer'),sLoc=gl.getUniformLocation(program,'size'),eLoc=gl.getUniformLocation(program,'energy');
    const draw=()=>{
      frame=0;if(stopped||document.hidden||!visible)return;
      const start=performance.now();
      const w=Math.max(1,Math.round(el.clientWidth*dpr)),h=Math.max(1,Math.round(el.clientHeight*dpr));
      if(el.width!==w||el.height!==h){el.width=w;el.height=h;gl.viewport(0,0,w,h);}
      energy=paused?point.current.energy:energy+(point.current.energy-energy)*.16;
      gl.uniform2f(pLoc,point.current.x,1-point.current.y);gl.uniform2f(sLoc,w,h);gl.uniform1f(eLoc,energy);gl.drawArrays(gl.TRIANGLES,0,6);
      if(performance.now()-start>20&&++slow>8)dpr=1;
      if(!paused&&Math.abs(energy-point.current.energy)>.002)frame=requestAnimationFrame(draw);
    };
    const schedule=()=>{if(!frame&&!stopped)frame=requestAnimationFrame(draw);};
    requestDraw.current=schedule;
    const resize=new ResizeObserver(schedule);resize.observe(el);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else cancelAnimationFrame(frame);});observer.observe(el);
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();};
    const lost=(e:Event)=>{e.preventDefault();stopped=true;setReady(false);onFailure();};
    el.addEventListener('webglcontextlost',lost);document.addEventListener('visibilitychange',visibility);
    setReady(true);schedule();
    return ()=>{stopped=true;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();el.removeEventListener('webglcontextlost',lost);document.removeEventListener('visibilitychange',visibility);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);requestDraw.current=()=>{};};
  },[active,reduced,paused,onFailure]);
  useEffect(()=>{
    if(!active||!pulse)return;
    point.current={x:.52,y:.45,energy:1};requestDraw.current();
    root.current?.style.setProperty('--wave','1.045');
    const timer=setTimeout(()=>{point.current.energy=0;requestDraw.current();root.current?.style.setProperty('--wave','1');},1100);
    return()=>clearTimeout(timer);
  },[pulse,active]);
  const move=(event:PointerEvent<HTMLDivElement>)=>{
    if(!active)return;const r=event.currentTarget.getBoundingClientRect();
    point.current={x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height,energy:1};
    root.current?.style.setProperty('--wave','1.045');requestDraw.current();
  };
  return <div ref={root} className="surface-art" onPointerMove={move} onPointerDown={move} onPointerLeave={()=>{point.current.energy=0;requestDraw.current();root.current?.style.setProperty('--wave','1');}}>
    <div className="art-top"><span>TOUT EST SENSIBLE</span><span>JL—003</span></div>
    <svg viewBox="0 0 520 340" className="surface-fallback" style={{opacity:active&&ready&&!reduced?0:1}} aria-hidden="true">
      <g transform="translate(260 170) rotate(-24)">{Array.from({length:26},(_,i)=><ellipse key={i} rx={20+i*7} ry={10+i*4.4} fill="none" stroke="#b6ff00" strokeWidth={i%3===0?3:1.5}/>)}</g>
    </svg>
    {active&&!reduced&&<canvas ref={canvas} aria-label="Surface d’ondes réactive au pointeur" style={{opacity:ready?1:0}}/>}
    <span className="surface-mark" aria-hidden="true">S.</span>
    <div className="art-bottom"><span>LE GESTE DEVIENT UNE ONDE.</span><span>↗</span></div>
  </div>;
}
