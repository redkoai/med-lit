import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
// Supply a package.json from a local Playwright installation when not installed here.
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||import.meta.url);
const {chromium}=require('@playwright/test');
const base=process.env.MEDLIT_UI_URL||'http://localhost:8118';
const out='output/uiux-2026-09-18';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
let checks=0;
const routes=['/','/history','/settings','/chatgpt','/import','/shared','/methodology','/learn','/faq','/auth','/connect','/about','/privacy','/terms','/example','/compare','/analysis'];
try{
 const context=await browser.newContext();await context.addInitScript({path:'scripts/browser-fixture-init.js'});
 const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const visit=async(path)=>p.goto(base+path,{waitUntil:'networkidle'});
 for(const width of (process.env.INTERACTIONS_ONLY?[]:[320,390,768,1440])){await p.setViewportSize({width,height:667});for(const path of routes){await visit(path);const clipped=await p.evaluate(()=>[...document.querySelectorAll('button,input,h1,h2,h3,[role="heading"],[role="button"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.left<innerWidth&&(r.right>innerWidth+2||r.left< -2)&&!e.closest('[role="tablist"]')}).map(e=>e.textContent.slice(0,65)));assert.deepEqual(clipped,[],`${width}px ${path} clipped`);checks++;}}
 assert.deepEqual(errors,[]);
 await p.setViewportSize({width:1440,height:1000});await visit('/');await p.screenshot({path:`${out}/medlit-desktop-final.png`});
 await p.getByRole('button',{name:'Unknown',exact:true}).click();await p.getByText(/A protocol is not supplied/).waitFor();
 await p.getByRole('button',{name:'Connect AI provider',exact:true}).click();await p.getByRole('dialog',{name:'Connect your AI'}).waitFor();await p.getByRole('button',{name:'Already have an API key?',exact:true}).click();assert.equal(await p.getByRole('textbox',{name:'Anthropic API key'}).getAttribute('type'),'password');await p.keyboard.press('Escape');await p.getByRole('dialog',{name:'Connect your AI'}).waitFor({state:'hidden'});checks+=2;
 await visit('/example');await p.locator('#tab-evidence').click();await p.getByRole('switch',{name:'Guided critical appraisal teaching mode'}).waitFor();await p.keyboard.press('ArrowRight');assert.equal(await p.evaluate(()=>document.activeElement.id),'tab-methods');await p.keyboard.press('End');await p.getByRole('button',{name:'Create read-only share link'}).waitFor();await p.keyboard.press('Home');assert.equal(await p.evaluate(()=>document.activeElement.id),'tab-overview');checks++;
 await visit('/faq');await p.getByRole('textbox',{name:'Search frequently asked questions'}).fill('unlikely-xyz-none');await p.getByText(/No matching questions/).waitFor();checks++;
 await visit('/learn');await p.getByRole('button',{name:'2. Read the score',exact:true}).click();await p.getByText('Traceability is not truth.',{exact:true}).waitFor();checks++;
 const state='a'.repeat(64);await visit('/');await p.evaluate(({state,base})=>sessionStorage.setItem('medlit.openrouter.pending.v1',JSON.stringify({state,verifier:'b'.repeat(64),origin:base,article:'10.1056/NEJMoa1511939',createdAt:Date.now()})),{state,base});await visit(`/connect?state=${state}&code=medlit-browser-test`);await p.getByRole('button',{name:'Change AI connection'}).waitFor();assert.equal(await p.evaluate(()=>window.__medlitTestCalls.auth),1);assert.equal(await p.evaluate(()=>window.__medlitTestCalls.generation),0);assert.equal(await p.getByRole('textbox',{name:'Article URL or DOI'}).inputValue(),'10.1056/NEJMoa1511939');await p.getByRole('textbox',{name:'Article URL or DOI'}).fill('not-a-paper');await p.getByRole('button',{name:'Appraise this paper',exact:true}).click();await p.getByRole('alert').waitFor();assert.equal(await p.evaluate(()=>window.__medlitTestCalls.generation),0);await p.reload({waitUntil:'networkidle'});await p.getByRole('button',{name:'Connect AI provider'}).waitFor();checks++;
 await p.setViewportSize({width:390,height:667});await visit('/');await p.screenshot({path:`${out}/medlit-phone-final.png`});await p.getByRole('button',{name:'Open navigation',exact:true}).click();await p.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Learn',exact:true}).click();await p.waitForURL('**/learn');await p.getByRole('button',{name:'Open navigation',exact:true}).waitFor();checks++;
 await visit('/');await p.getByRole('button',{name:'See what you’ll get',exact:true}).click();await p.getByRole('button',{name:'Unknown',exact:true}).click();await p.getByText(/A protocol is not supplied/).waitFor();checks++;
 await p.emulateMedia({reducedMotion:'reduce'});await visit('/');assert.ok(await p.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('[data-motion="paper"]')).animationDuration)<=.01));assert.deepEqual(errors,[]);checks++;
 console.log(`PASS ${checks} MedLit responsive and interaction checks; provider exchange mocked, zero paid AI requests`);
}finally{await browser.close();}
