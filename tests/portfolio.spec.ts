import { test,expect,type Page } from '@playwright/test';

const errors=(page:Page)=>{const list:string[]=[];page.on('pageerror',error=>list.push(error.message));page.on('console',message=>{if(message.type()==='error')list.push(message.text());});return list;};
async function formed(page:Page){await expect(page.locator('.portrait-canvas')).toHaveAttribute('data-formed','true',{timeout:20000});}
async function explore(page:Page){await page.getByRole('button',{name:'Explorer les projets',exact:true}).click();await expect.poll(async()=>Math.abs(Number(await page.locator('.scene').getAttribute('data-progress'))-.2)).toBeLessThan(.001);await page.waitForTimeout(250);}
async function open(page:Page,title:string){await page.getByRole('button',{name:'Voir le projet '+title,exact:true}).click();await expect(page.locator('.project-modal')).toBeVisible();await page.locator('.project-modal').evaluate(async el=>{await Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{})));});}
async function step(page:Page,index:number){
 const current=Number(await page.locator('.scene').getAttribute('data-active'));
 const target=Math.min(9,Math.max(0,current+(index>0?1:-1)));
 await page.getByRole('button',{name:index>0?'Projet suivant':'Projet précédent',exact:true}).click();
 await expect.poll(()=>page.evaluate(p=>Math.abs(scrollY-p*(document.documentElement.scrollHeight-innerHeight)),.2+target/9*.8)).toBeLessThan(1.1);
 await page.waitForTimeout(150);
}

for(const [width,height] of [[390,844],[768,1000],[1440,1000]]){
 test('portrait reconnaissable et rendu à '+width+' px',async({page})=>{
   const errs=errors(page);await page.setViewportSize({width,height});await page.goto('/');await formed(page);
   await expect(page.locator('canvas')).toHaveCount(1);
   expect(Number(await page.locator('.portrait-canvas').getAttribute('data-tile-count'))).toBeGreaterThan(5000);
   await expect(page.locator('h1')).toContainText('Julien');await expect(page.locator('h1')).toContainText('Leonetti');
   await expect(page.locator('main>section')).toHaveCount(1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await expect(page.locator('.portrait-stage img[src*="source.png"]')).toHaveCount(0);
   await page.screenshot({path:'.artifacts/mosaic-validated-home-'+width+'.png'});
   expect(errs).toEqual([]);
 });
}
test('entrée interrompue par le scroll : accès immédiat au premier projet',async({page})=>{
 const errs=errors(page);await page.goto('/',{waitUntil:'domcontentloaded'});await explore(page);await open(page,'Forma');
 await expect(page.locator('.project-topline')).toContainText('Projet de démonstration');
 await page.keyboard.press('Escape');await expect(page.locator('.project-modal')).toHaveCount(0);expect(errs).toEqual([]);
});
test('traversée finie, dix projets réels dans le compteur, et scroll inverse',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');await formed(page);await explore(page);
 await expect(page.locator('.project-counter')).toHaveText('01 / 10');
 await expect(page.getByRole('button',{name:'Projet précédent',exact:true})).toBeDisabled();
 const names=['Onde','Atelier 04','Flux','Rivage','Module','Sillage','Orbite','Écho','Traverse'];
 for(let i=0;i<names.length;i++){await step(page,1);await expect(page.locator('.scene')).toHaveAttribute('data-active',String(i+1));await expect(page.getByRole('button',{name:'Voir le projet '+names[i],exact:true})).toBeVisible();}
 await expect(page.locator('.project-counter')).toHaveText('10 / 10');await expect(page.getByRole('button',{name:'Projet suivant',exact:true})).toBeDisabled();
 const range=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);expect(range).toBeGreaterThan(4500);expect(range).toBeLessThan(8500);
 await page.screenshot({path:'.artifacts/mosaic-validated-last.png'});
 await page.evaluate(()=>window.scrollTo(0,0));await expect(page.locator('.scene')).toHaveAttribute('data-progress','0.00000');await expect(page.locator('.portrait-home')).toHaveCSS('opacity','1');
 await page.screenshot({path:'.artifacts/mosaic-validated-return.png'});
});
test('fiche : scroll indépendant, barre fixe, présentation et restauration exacte',async({page})=>{
 const errs=errors(page);await page.setViewportSize({width:1440,height:1000});await page.goto('/');await formed(page);await explore(page);await step(page,1);
 const transform=await page.locator('[data-project="onde"]').getAttribute('style');
 await open(page,'Onde');const saved=await page.evaluate(()=>history.state.sceneScroll as number);await expect(page).toHaveURL(/#projet\/onde$/);
 const toolbar=await page.locator('.project-toolbar').boundingBox();
 const scroller=page.locator('.project-scroll');await scroller.hover();await page.mouse.wheel(0,850);await expect.poll(()=>scroller.evaluate(el=>el.scrollTop)).toBeGreaterThan(300);
 expect(await scroller.evaluate(el=>el.scrollTop)).toBeGreaterThan(300);expect(await page.evaluate(()=>scrollY)).toBe(saved);
 expect(Math.abs((await page.locator('.project-toolbar').boundingBox())!.y-toolbar!.y)).toBeLessThan(1);
 await page.getByRole('button',{name:/Présentation/}).click();await expect(page.locator('#project-dialog-title')).toBeInViewport();
 await expect(page.locator('.demonstration-note')).toContainText('Ce concept est fictif');
 await page.screenshot({path:'.artifacts/mosaic-validated-presentation.png'});
 await page.getByRole('button',{name:'Fermer',exact:true}).click();await expect(page.locator('.project-modal')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Voir le projet Onde',exact:true})).toBeFocused();
 expect(await page.evaluate(()=>scrollY)).toBe(saved);expect(await page.locator('[data-project="onde"]').getAttribute('style')).toBe(transform);
 expect(errs).toEqual([]);
});
test('copie du lien fonctionnelle et lien direct vers la bonne fiche',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/');await formed(page);await explore(page);await open(page,'Forma');
 await page.getByRole('button',{name:/Copier le lien/}).click();await expect(page.getByRole('status')).toContainText('Lien copié');
 const copied=await page.evaluate(()=>navigator.clipboard.readText());expect(copied).toBe(page.url());
 const direct=await context.newPage();await direct.goto(copied);await expect(direct.locator('.project-topline')).toContainText('Forma');
 await direct.getByRole('button',{name:'Fermer',exact:true}).click();await expect(direct.locator('.project-modal')).toHaveCount(0);expect(new URL(direct.url()).hash).toBe('');await direct.close();
});
test('historique navigateur, Échap et focus contenu dans la fiche',async({page})=>{
 await page.goto('/#projet/orbite');await expect(page.locator('.project-topline')).toContainText('Orbite');await page.waitForTimeout(650);
 await expect(page.getByRole('button',{name:'Fermer',exact:true})).toBeFocused();
 await page.keyboard.press('Shift+Tab');await expect(page.getByRole('dialog').getByRole('button',{name:'Retour au portrait',exact:true})).toBeFocused();
 await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Fermer',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.locator('.project-modal')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Voir le projet Orbite',exact:true})).toBeFocused();
 const saved=await page.evaluate(()=>scrollY);await open(page,'Orbite');await page.goBack();await expect(page.locator('.project-modal')).toHaveCount(0);
 await page.goForward();await expect(page.locator('.project-topline')).toContainText('Orbite');await page.goBack();await expect(page.locator('.project-modal')).toHaveCount(0);
 expect(await page.evaluate(()=>scrollY)).toBe(saved);
});
test('mobile tactile : portrait, couverture, fiche et fermeture accessible',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await page.goto('/');await formed(page);
 await page.getByRole('button',{name:'Explorer les projets',exact:true}).tap();await expect.poll(async()=>Math.abs(Number(await page.locator('.scene').getAttribute('data-progress'))-.2)).toBeLessThan(.001);
 await page.getByRole('button',{name:'Voir le projet Forma',exact:true}).tap();await page.waitForTimeout(650);
 const rect=await page.locator('.project-modal').boundingBox();expect(rect!.x).toBeGreaterThanOrEqual(0);expect(rect!.x+rect!.width).toBeLessThanOrEqual(390);
 await page.locator('.project-scroll').evaluate(el=>el.scrollTop=600);await page.getByRole('button',{name:'Fermer',exact:true}).tap();await expect(page.locator('.project-modal')).toHaveCount(0);
 await page.screenshot({path:'.artifacts/mosaic-validated-mobile-explore.png'});await context.close();
});
test('À propos et Contact restent dans le même environnement',async({page})=>{
 const errs=errors(page);await page.goto('/');await formed(page);const url=page.url();
 await page.getByRole('button',{name:'À propos',exact:true}).click();await expect(page.locator('.info-panel')).toContainText('Moi, c’est Julien');
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'À propos',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Contact',exact:true}).click();await expect(page.locator('.info-panel a')).toHaveCount(0);
 await page.getByRole('button',{name:'Fermer Contact',exact:true}).click();expect(page.url()).toBe(url);expect(errs).toEqual([]);
});
test('mouvement réduit : portrait déjà formé et transitions simples',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await formed(page);await expect(page.locator('.portfolio')).toHaveAttribute('data-paused','true');
 await explore(page);await open(page,'Forma');await page.getByRole('button',{name:/Présentation/}).click();await expect(page.locator('#project-dialog-title')).toBeInViewport();
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Retour au portrait',exact:true}).click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
 await page.screenshot({path:'.artifacts/mosaic-validated-reduced.png'});
});
test('sans WebGL : portrait statique et liste des dix projets',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){if(type.includes('webgl'))return null;return original.apply(this,[type,...args] as Parameters<typeof original>);} as typeof original;});
 await page.goto('/');await expect(page.locator('canvas')).toHaveCount(0);await expect(page.locator('.portrait-poster')).toHaveCSS('opacity','1');
 await page.getByRole('button',{name:'Explorer les projets',exact:true}).click();await expect(page.locator('.index-project')).toHaveCount(10);
 await page.getByRole('button',{name:'Voir le projet Module',exact:true}).click();await expect(page.locator('.project-topline')).toContainText('Module');
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Voir le projet Module',exact:true})).toBeFocused();
 await page.screenshot({path:'.artifacts/mosaic-validated-no-webgl.png'});
});
test('redimensionnement, clics rapides et ouvertures répétées',async({page})=>{
 const errs=errors(page);await page.goto('/');await formed(page);const canvas=await page.locator('canvas').elementHandle();
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(200);
 expect(await canvas!.evaluate(el=>el===document.querySelector('canvas'))).toBe(true);await expect(page.locator('.portrait-canvas')).toHaveAttribute('data-formed','true');
 await explore(page);
 for(let i=0;i<3;i++){await page.getByRole('button',{name:'Voir le projet Forma',exact:true}).click();await page.waitForTimeout(70);await page.keyboard.press('Escape');await expect(page.locator('.project-modal')).toHaveCount(0);}
 await page.getByRole('button',{name:'Liste des projets',exact:true}).click();await expect(page.locator('.index-project')).toHaveCount(10);
 await page.screenshot({path:'.artifacts/mosaic-validated-index.png'});await page.getByRole('button',{name:'Retour à la scène',exact:false}).click();
 await expect(page.locator('.project-index')).toHaveCount(0);expect(errs).toEqual([]);
});

test('commandes clavier précédent/suivant et perte de WebGL',async({page})=>{
 await page.goto('/');await formed(page);await explore(page);
 await page.keyboard.press('ArrowRight');await expect(page.locator('.scene')).toHaveAttribute('data-active','1');
 await page.waitForTimeout(800);await page.keyboard.press('ArrowLeft');await expect(page.locator('.scene')).toHaveAttribute('data-active','0');
 await page.locator('canvas').evaluate((canvas:HTMLCanvasElement)=>canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext());
 await expect(page.locator('.portfolio')).toHaveAttribute('data-fallback','true');
 await expect(page.locator('canvas')).toHaveCount(0);
 await page.getByRole('button',{name:'Liste des projets',exact:true}).click();await expect(page.locator('.index-project')).toHaveCount(10);
});