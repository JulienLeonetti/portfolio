import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { portraitAssets } from '../data/portrait';

type Layout={stride:number;points:number[];projectCount:number};
type Props={progress:RefObject<number>;reduced:boolean;paused:boolean;onReady:()=>void;onFailure:()=>void};
const vertexShader=`
attribute vec3 portrait;
attribute float gain;
attribute float projectId;
attribute float seed;
attribute float peripheral;
uniform float formation;
uniform float progress;
uniform float portraitShift;
uniform float portraitLift;
uniform float atlasRows;
uniform vec2 pointer;
varying vec2 tileUv;
varying float brightness;
varying float visibility;
float hash(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
void main(){
  float approach=smoothstep(.015,.24,progress);
  float f=smoothstep(seed*.23,1.,formation);
  vec3 scatter=vec3(sin(seed*61.)*3.,cos(seed*93.)*3.,(seed-.5)*10.);
  vec3 face=portrait;
  face.x+=portraitShift;face.y+=portraitLift;
  face.xy+=pointer*portrait.z*.10;
  vec3 formed=mix(face+scatter,face,f);
  float angle=hash(seed*1000.+3.)*6.2831853;
  float depth=5.+hash(seed*1000.+19.)*210.;
  float radius=(3.8+hash(seed*1000.+7.)*13.)*(1.+depth/32.);
  vec3 tunnel=vec3(cos(angle)*radius,sin(angle)*radius*.8,-depth);
  vec3 center=mix(formed,tunnel,approach);
  float peripheralFade=mix(.16,1.,approach);
  float size=mix(.042,.15,approach);
  center.xy+=position.xy*vec2(size,size*.75);
  vec4 mv=modelViewMatrix*vec4(center,1.);
  gl_Position=projectionMatrix*mv;
  float col=mod(projectId,4.);
  float row=floor(projectId/4.);
  tileUv=(vec2(col,atlasRows-1.-row)+mix(vec2(.008),vec2(.992),uv))/vec2(4.,atlasRows);
  brightness=mix(gain,.65+seed*.65,approach);
  float fieldVisibility=.04+.96*smoothstep(.72,.88,hash(seed*733.+31.));
  visibility=mix(1.,peripheralFade,peripheral)*smoothstep(.35,1.8,-mv.z)*mix(1.,fieldVisibility,approach);
}`;
const fragmentShader=`
uniform sampler2D atlas;
varying vec2 tileUv;
varying float brightness;
varying float visibility;
void main(){
  vec3 c=texture2D(atlas,tileUv).rgb;
  float luminance=dot(c,vec3(.2126,.7152,.0722));
  c=mix(c,vec3(luminance),.12)*brightness;
  gl_FragColor=vec4(c,visibility);
}`;

export default function PortraitScene({progress,reduced,paused,onReady,onFailure}:Props){
  const host=useRef<HTMLDivElement>(null);
  const settings=useRef({reduced,paused});
  const requestDraw=useRef<()=>void>(()=>{});
  useEffect(()=>{settings.current={reduced,paused};requestDraw.current();},[reduced,paused]);
  useEffect(()=>{
    const element=host.current!;let disposed=false,frame=0,renderer:THREE.WebGLRenderer|undefined;
    let geometry:THREE.InstancedBufferGeometry|undefined,material:THREE.ShaderMaterial|undefined,texture:THREE.Texture|undefined;
    let resize:ResizeObserver|undefined;const abort=new AbortController();
    const input={x:0,y:0},pointer={x:0,y:0};let stopListeners=()=>{};
    (async()=>{
      try{
        const [layout,loadedTexture]=await Promise.all([
          fetch(new URL(portraitAssets.layout,document.baseURI),{signal:abort.signal}).then(response=>{if(!response.ok)throw new Error('Portrait unavailable');return response.json() as Promise<Layout>;}),
          new THREE.TextureLoader().loadAsync(new URL(portraitAssets.atlas,document.baseURI).href),
        ]);
        texture=loadedTexture;if(disposed){texture.dispose();return;}
        texture.colorSpace=THREE.NoColorSpace;
        texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
        renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'high-performance'});
        renderer.setClearColor(0x080808,0);element.appendChild(renderer.domElement);
        renderer.domElement.setAttribute('aria-hidden','true');
        const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,320);
        const quad=new THREE.PlaneGeometry(1,1);geometry=new THREE.InstancedBufferGeometry();
        geometry.index=quad.index!.clone();geometry.setAttribute('position',quad.getAttribute('position').clone());geometry.setAttribute('uv',quad.getAttribute('uv').clone());quad.dispose();
        const rows:Array<{p:number[];background:number}>=[];
        for(let i=0;i<layout.points.length;i+=layout.stride)rows.push({p:layout.points.slice(i,i+layout.stride),background:0});
        rows.sort((a,b)=>a.p[5]-b.p[5]);
        const random=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
        for(let i=0;i<450;i++)rows.unshift({p:[(random(i+1)-.5)*24,(random(i+3)-.5)*14,(random(i+5)-.5)*4,.22,Math.floor(random(i+7)*layout.projectCount),random(i+9)],background:1});
        const positions=new Float32Array(rows.length*3),gains=new Float32Array(rows.length),ids=new Float32Array(rows.length),seeds=new Float32Array(rows.length),backgrounds=new Float32Array(rows.length);
        rows.forEach(({p,background},i)=>{positions.set(p.slice(0,3),i*3);gains[i]=p[3];ids[i]=p[4];seeds[i]=p[5];backgrounds[i]=background;});
        geometry.setAttribute('portrait',new THREE.InstancedBufferAttribute(positions,3));
        geometry.setAttribute('gain',new THREE.InstancedBufferAttribute(gains,1));
        geometry.setAttribute('projectId',new THREE.InstancedBufferAttribute(ids,1));
        geometry.setAttribute('seed',new THREE.InstancedBufferAttribute(seeds,1));
        geometry.setAttribute('peripheral',new THREE.InstancedBufferAttribute(backgrounds,1));
        material=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{atlas:{value:texture},atlasRows:{value:Math.ceil(layout.projectCount/4)},formation:{value:0},progress:{value:0},portraitShift:{value:0},portraitLift:{value:0},pointer:{value:new THREE.Vector2()}},transparent:true,depthWrite:false,depthTest:false});
        const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);
        const memory=(navigator as Navigator&{deviceMemory?:number}).deviceMemory;
        let dpr=Math.min(devicePixelRatio,memory&&memory<=4?1:1.5),slow=0,ready=false;
        const start=performance.now();
        const size=()=>{
          if(!renderer||!geometry||!material)return;
          const w=element.clientWidth,h=element.clientHeight;
          renderer.setPixelRatio(dpr);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
          material.uniforms.portraitShift.value=w/h>1.1?.85:0;material.uniforms.portraitLift.value=w<700?.4:0;
          geometry.instanceCount=w<700||memory&&memory<=4?Math.floor(rows.length*.73):rows.length;
          element.dataset.tileCount=String(geometry.instanceCount);schedule();
        };
        const draw=(now:number)=>{
          frame=0;if(disposed||document.hidden||!renderer||!material)return;
          const before=performance.now(),s=settings.current;
          const f=s.reduced||s.paused?1:Math.min(1,(now-start)/1900);
          const p=progress.current;
          pointer.x+=(input.x-pointer.x)*.1;pointer.y+=(input.y-pointer.y)*.1;
          material.uniforms.formation.value=Math.max(f,Math.min(1,p*15));
          material.uniforms.progress.value=p;
          material.uniforms.pointer.value.set(s.reduced||s.paused?0:pointer.x,s.reduced||s.paused?0:pointer.y);
          const travel=Math.max(0,(p-.18)/.82);
          camera.position.set(Math.sin(travel*4)*.16,Math.sin(travel*3)*.12,(element.clientWidth<700?15.5:14)-travel*108);
          camera.lookAt(camera.position.x*.65,camera.position.y*.65,camera.position.z-14);
          renderer.render(scene,camera);
          if(!ready){ready=true;onReady();}
          element.dataset.formed=f>=1?'true':'false';
          if(performance.now()-before>24&&++slow===20){dpr=1;renderer.setPixelRatio(dpr);geometry!.instanceCount=Math.floor(rows.length*.73);}
          if(f<1||Math.abs(pointer.x-input.x)+Math.abs(pointer.y-input.y)>.001)schedule();
        };
        function schedule(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(draw);}
        requestDraw.current=schedule;
        const move=(event:PointerEvent)=>{if(event.pointerType==='touch'||settings.current.paused||settings.current.reduced)return;input.x=(event.clientX/innerWidth-.5);input.y=-(event.clientY/innerHeight-.5);schedule();};
        const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();};
        const lost=(event:Event)=>{event.preventDefault();onFailure();};
        resize=new ResizeObserver(size);resize.observe(element);size();
        addEventListener('pointermove',move,{passive:true});addEventListener('scroll',schedule,{passive:true});addEventListener('portfolio:render',schedule);
        document.addEventListener('visibilitychange',visibility);renderer.domElement.addEventListener('webglcontextlost',lost);
        stopListeners=()=>{removeEventListener('pointermove',move);removeEventListener('scroll',schedule);removeEventListener('portfolio:render',schedule);document.removeEventListener('visibilitychange',visibility);renderer?.domElement.removeEventListener('webglcontextlost',lost);};
      }catch(error){if(!disposed&&!(error instanceof DOMException&&error.name==='AbortError'))onFailure();}
    })();
    return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);resize?.disconnect();stopListeners();requestDraw.current=()=>{};geometry?.dispose();material?.dispose();texture?.dispose();renderer?.dispose();renderer?.domElement.remove();};
  },[progress,onReady,onFailure]);
  return <div className="portrait-canvas" ref={host}/>;
}
