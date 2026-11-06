import { test, expect, type Page } from '@playwright/test';

const intro='Moi, c’est Julien. Étudiant en MMI en Corse, je mêle design, développement et création numérique.';
const errors=(page:Page)=>{const list:string[]=[];page.on('pageerror',e=>list.push(e.message));page.on('console',m=>{if(m.type()==='error')list.push(m.text());});return list;};
async function settle(page:Page){await page.waitForTimeout(950);}
async function open(page:Page,name:string){await page.getByRole('button',{name:'Ouvrir '+name,exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await settle(page);}
async function poses(page:Page){return page.locator('.gallery-panel').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).transform));}

for(const width of [390,768,1440]){
  test('une scène continue et un premier écran lisible à '+width+' px',async({page})=>{
    const errs=errors(page);
    await page.setViewportSize({width,height:width===390?844:1000});await page.goto('/');await settle(page);
    await expect(page.locator('main>section')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Julien Leonetti.');
    await expect(page.locator('.intro-copy')).toContainText(intro);
    await expect(page.getByRole('navigation').getByRole('button')).toHaveCount(3);
    await expect(page.getByRole('navigation')).not.toContainText(/index|immersive/);
    await expect(page.locator('.gallery-panel')).toHaveCount(3);
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator('.about,.contact,.contact-surface')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const stage=await page.locator('.gallery-stage').boundingBox();expect(stage!.y).toBe(0);expect(stage!.height).toBe(width===390?844:1000);
    const panel=await page.locator('.panel-0 .panel-hit').boundingBox(),name=await page.locator('h1').boundingBox();
    expect(panel!.y+panel!.height).toBeLessThan(name!.y);
    await page.screenshot({path:'.artifacts/continuous-validated-'+width+'.png'});
    expect(errs).toEqual([]);
  });
}
test('scroll fini dans les deux sens et retour exact après un détail',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');await settle(page);
  const first=await poses(page);
  const end=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
  expect(end).toBeGreaterThan(1800);expect(end).toBeLessThan(4000);
  await page.evaluate(()=>window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)/2));
  await page.waitForTimeout(150);
  const middle=await poses(page),saved=await page.evaluate(()=>scrollY),url=page.url();
  expect(middle).not.toEqual(first);
  await expect(page.locator('.gallery')).toHaveAttribute('data-active','1');
  await open(page,'Grille en transformation');
  await expect(page.getByRole('button',{name:'Retour à la galerie',exact:true})).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Transformer'})).toBeFocused();
  await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Retour à la galerie',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');await settle(page);
  await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByRole('button',{name:'Ouvrir Grille en transformation'})).toBeFocused();
  expect(await page.evaluate(()=>scrollY)).toBe(saved);expect(await poses(page)).toEqual(middle);expect(page.url()).toBe(url);
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(150);
  await expect(page.locator('.gallery')).toHaveAttribute('data-active','2');
  expect((await page.locator('.gallery-stage').boundingBox())!.y).toBe(0);
  await page.screenshot({path:'.artifacts/continuous-validated-end.png'});
  await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(150);
  expect(await poses(page)).toEqual(first);
});
test('À propos et Contact intégrés : URL, focus et galerie préservés',async({page})=>{
  const errs=errors(page);await page.goto('/');await settle(page);
  await page.evaluate(()=>window.scrollTo(0,500));await page.waitForTimeout(150);
  const before=await poses(page),url=page.url(),saved=await page.evaluate(()=>scrollY);
  const about=page.getByRole('button',{name:'À propos',exact:true});await about.click();
  await expect(page.getByRole('dialog')).toContainText(intro);
  await expect(page.getByRole('button',{name:'Fermer À propos'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(page.getByRole('dialog').getByRole('button',{name:'Retour à la galerie'})).toBeFocused();
  await page.screenshot({path:'.artifacts/continuous-validated-about.png'});
  expect(await poses(page)).toEqual(before);expect(page.url()).toBe(url);
  await page.keyboard.press('Escape');await expect(about).toBeFocused();
  await page.getByRole('button',{name:'Contact',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Et si on échangeait ?');
  await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(0);
  await page.getByRole('button',{name:'Fermer Contact'}).click();
  await expect(page.getByRole('button',{name:'Contact',exact:true})).toBeFocused();
  expect(await page.evaluate(()=>scrollY)).toBe(saved);expect(page.url()).toBe(url);expect(errs).toEqual([]);
});
test('typographie existante : déformation locale et bouton tactile',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');await settle(page);await open(page,'Typographie vivante');
  const letter=page.locator('.living-letter').nth(2),rect=await page.locator('.type-art').boundingBox();
  await page.mouse.move(rect!.x+rect!.width*.5,rect!.y+rect!.height*.25);await page.waitForTimeout(500);
  expect(await letter.evaluate(el=>getComputedStyle(el).transform)).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.mouse.move(10,100);await page.waitForTimeout(500);
  expect(await letter.evaluate(el=>getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.getByRole('button',{name:'Animer les lettres'}).click();await page.waitForTimeout(300);
  expect(await letter.evaluate(el=>getComputedStyle(el).transform)).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.keyboard.press('Escape');await settle(page);
  await expect(page.getByRole('button',{name:'Ouvrir Typographie vivante'})).toBeFocused();
});
test('grille existante : trois états, réversibilité et conservation',async({page})=>{
  await page.goto('/');await settle(page);await page.getByRole('button',{name:'Centrer Grille en transformation'}).click();await settle(page);
  await open(page,'Grille en transformation');
  const first=await page.locator('.grid-module').nth(3).getAttribute('style');
  await page.getByRole('button',{name:'Transformer'}).click();await page.waitForTimeout(1150);
  await expect(page.locator('.grid-art')).toHaveAttribute('data-grid-state','1');
  expect(await page.locator('.grid-module').nth(3).getAttribute('style')).not.toBe(first);
  await page.getByRole('button',{name:'Transformer'}).click();await page.waitForTimeout(1150);
  await expect(page.locator('.grid-art')).toHaveAttribute('data-grid-state','2');
  await page.getByRole('button',{name:'État précédent'}).click();await expect(page.locator('.grid-art')).toHaveAttribute('data-grid-state','1');
  await page.keyboard.press('Escape');await settle(page);await open(page,'Grille en transformation');
  await expect(page.locator('.grid-art')).toHaveAttribute('data-grid-state','1');
});
test('surface existante : un seul canvas, réaction et retour dans la scène',async({page})=>{
  const errs=errors(page);await page.setViewportSize({width:1440,height:1000});await page.goto('/');await settle(page);
  await page.getByRole('button',{name:'Centrer Surface sensible'}).click();await settle(page);
  const saved=await page.evaluate(()=>scrollY);await open(page,'Surface sensible');
  const canvas=page.locator('canvas');await expect(canvas).toHaveCount(1);await expect(canvas).toHaveCSS('opacity','1');
  const first=await canvas.screenshot();await page.getByRole('button',{name:'Créer une onde'}).click();await page.waitForTimeout(300);
  expect(first.equals(await canvas.screenshot())).toBe(false);
  await page.screenshot({path:'.artifacts/continuous-validated-surface.png'});
  await page.keyboard.press('Escape');await settle(page);
  await expect(page.locator('canvas')).toHaveCount(0);expect(await page.evaluate(()=>scrollY)).toBe(saved);expect(errs).toEqual([]);
});
test('mobile : composition centrée, aperçu suivant et commandes tactiles',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();await page.goto('http://127.0.0.1:5173/');await settle(page);
  const a=await page.locator('.panel-0 .panel-visual').boundingBox(),b=await page.locator('.panel-1 .panel-visual').boundingBox();
  expect(Math.abs(a!.x+a!.width/2-195)).toBeLessThan(15);expect(b!.x).toBeLessThan(390);expect(b!.x+b!.width).toBeGreaterThan(390);
  await page.getByRole('button',{name:'Ouvrir Typographie vivante'}).tap();await settle(page);
  await page.getByRole('button',{name:'Animer les lettres'}).tap();
  await page.getByRole('button',{name:'Retour à la galerie',exact:true}).tap();await settle(page);
  await page.getByRole('button',{name:'Centrer Grille en transformation'}).tap();await settle(page);
  await page.getByRole('button',{name:'Ouvrir Grille en transformation'}).tap();await settle(page);
  await page.getByRole('button',{name:'Transformer'}).tap();await expect(page.locator('.grid-art')).toHaveAttribute('data-grid-state','1');
  await page.screenshot({path:'.artifacts/continuous-validated-touch.png'});
  await context.close();
});
test('lecture simplifiée et mouvement réduit',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});await page.goto('/');
  await expect(page.locator('.portfolio')).toHaveAttribute('data-view','index');await expect(page.locator('canvas')).toHaveCount(0);
  await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Aller aux expériences'})).toBeFocused();
  await open(page,'Grille en transformation');await page.getByRole('button',{name:'Transformer'}).click();
  await expect(page.locator('.grid-art')).toHaveAttribute('data-grid-state','1');
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'À propos',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText(intro);await page.keyboard.press('Escape');
  await page.screenshot({path:'.artifacts/continuous-validated-reduced.png'});
});
test('sans WebGL : lecture claire et surface alternative',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){
      if(type.includes('webgl'))return null;return original.apply(this,[type,...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('/');await expect(page.locator('.portfolio')).toHaveAttribute('data-view','index');await settle(page);
  await open(page,'Surface sensible');await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button',{name:'Créer une onde'}).click();await expect(page.locator('.surface-art')).toHaveCSS('--wave','1.045');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('redimensionnement, lecture simplifiée et fermetures rapides',async({page})=>{
  const errs=errors(page);await page.goto('/');await settle(page);
  const url=page.url();
  for(let i=0;i<4;i++)await page.locator('.reading-toggle').click();
  await expect(page.locator('.portfolio')).toHaveAttribute('data-view','explore');
  for(let i=0;i<3;i++){await page.getByRole('button',{name:'À propos',exact:true}).click();await page.keyboard.press('Escape');}
  await page.getByRole('button',{name:'Lecture simplifiée',exact:true}).click();await settle(page);
  await open(page,'Grille en transformation');
  await page.setViewportSize({width:390,height:640});await page.waitForTimeout(150);
  const rect=await page.getByRole('dialog').boundingBox();expect(rect!.x).toBeGreaterThanOrEqual(0);expect(rect!.x+rect!.width).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Ouvrir Grille en transformation'})).toBeFocused();
  expect(page.url()).toBe(url);expect(errs).toEqual([]);
});
test('un projet réel peut rejoindre les données et la même scène',async({page})=>{
  // Fixture de navigateur : aucun projet de démonstration n’est écrit dans les données livrées.
  const project={slug:'fixture-technique',title:'Fixture de validation',category:'Interface',description:'Validation de la structure',disciplines:['UI'],image:{src:'./favicon.svg',alt:'Visuel technique'},context:'Contexte vérifiable',role:'Validation',approach:['Démarche de validation'],gallery:[],links:[]};
  await page.route('**/src/data/projects.ts*',route=>route.fulfill({contentType:'application/javascript',body:'export const projects='+JSON.stringify([project])+';export const publishedProjects=projects;'}));
  await page.goto('/');await settle(page);await expect(page.locator('.gallery-panel')).toHaveCount(4);
  await page.getByRole('button',{name:'Lecture simplifiée',exact:true}).click();await settle(page);
  await open(page,'Fixture de validation');await expect(page.locator('.project-detail').getByText('Contexte vérifiable')).toBeVisible();
  await expect(page.locator('.project-detail').getByText('Démarche de validation')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.locator('main>section')).toHaveCount(1);
});
