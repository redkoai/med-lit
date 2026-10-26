/** Local-only browser fixture. Never imported by the app or served by Vercel.
 * All provider requests are synthetic. Do not enter real credentials here. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fixtureArticle, fixtureModelOutput } from '../tests/testFixture';
const root=path.resolve('dist');
const init=`(()=>{
 const real=window.fetch.bind(window), fixture=${JSON.stringify(fixtureModelOutput)};
 const xml=${JSON.stringify(`<PubmedArticle><ArticleTitle>${fixtureArticle.title}</ArticleTitle><AbstractText>${fixtureArticle.fullText}</AbstractText><Title>Journal of Transparent Tests</Title><Year>2025</Year><Author><LastName>Rivera</LastName><ForeName>Ana</ForeName></Author></PubmedArticle>`)};
 window.fetch=async(input,options={})=>{
  const url=new URL(typeof input==='string'?input:input.url,location.origin);
  const hosts=['api.openai.com','api.anthropic.com','generativelanguage.googleapis.com','openrouter.ai'];
  if(hosts.includes(url.hostname)){
   const headers=new Headers(options.headers), key=headers.get('Authorization')||headers.get('x-api-key')||headers.get('x-goog-api-key')||'';
   if(!key.includes('synthetic-browser-fixture'))return Response.json({error:'Fixture accepts synthetic keys only'},{status:401});
   if((options.method||'GET')==='GET')return Response.json(url.hostname==='generativelanguage.googleapis.com'?{models:[{name:'models/fixture-text',supportedGenerationMethods:['generateContent']}]}:{data:[{id:'gpt-fixture-text',name:'Fixture text model'}]});
   const body=String(options.body),text=body.includes('connected')?'\\{"connected\\":true}':JSON.stringify(fixture);
   return Response.json(url.hostname==='api.openai.com'?{status:'completed',output:[{content:[{type:'output_text',text}]}]}:url.hostname==='api.anthropic.com'?{stop_reason:'end_turn',content:[{type:'text',text}]}:url.hostname==='generativelanguage.googleapis.com'?{candidates:[{finishReason:'STOP',content:{parts:[{text}]}}]}:{choices:[{finish_reason:'stop',message:{content:text}}]});
  }
  if(url.hostname==='eutils.ncbi.nlm.nih.gov')return new Response(xml,{headers:{'Content-Type':'application/xml'}});
  if(url.hostname.endsWith('ebi.ac.uk'))return Response.json({resultList:{result:[]}});
  return real(input,options);
 };
 addEventListener('DOMContentLoaded',()=>{const banner=document.createElement('div');banner.textContent='LOCAL QA FIXTURE: synthetic providers and paper. No paid generation. Use synthetic-browser-fixture keys only.';banner.style='position:fixed;bottom:0;left:0;right:0;z-index:999999;background:#fff0bb;color:#161616;font:12px monospace;padding:6px;text-align:center';document.body.appendChild(banner);});
})();`;
http.createServer((req,res)=>{
 const url=new URL(req.url||'/', 'http://localhost:4179');
 if(url.pathname==='/__qa-provider.js'){res.setHeader('Content-Type','application/javascript');return res.end(init);}
 let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)&&fs.existsSync(file+'.html'))file+='.html';
 if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
 let data=fs.readFileSync(file);const ext=path.extname(file);
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'} as Record<string,string>)[ext]||'application/octet-stream');
 if(ext==='.html')data=Buffer.from(data.toString().replace('<head>','<head><script src="/__qa-provider.js"></script>'));
 res.end(data);
}).listen(4179,'127.0.0.1',()=>console.log('LOCAL FIXTURE ONLY: http://localhost:4179/settings?analytics_qa=1'));
