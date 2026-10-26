import type {AcquisitionSource} from './core';
/** Evaluate only after consent. Raw referrers and campaign strings never leave this function. */
export function classifyAcquisition(referrer:string,search:string,currentHost:string):AcquisitionSource{
 const campaign=new URLSearchParams(search).get('utm_source')?.toLowerCase();
 const known:Record<string,AcquisitionSource>={'chatgpt.com':'chatgpt',chatgpt:'chatgpt',perplexity:'perplexity','perplexity.ai':'perplexity',gemini:'gemini','gemini.google.com':'gemini',newsletter:'email',email:'email',linkedin:'social',reddit:'social',youtube:'social',redko:'owned',gameer:'owned',redvest:'owned',medlit:'owned',synaptik:'owned'};
 if(campaign&&known[campaign])return known[campaign];
 let host='';try{host=new URL(referrer).hostname.toLowerCase();}catch{}
 if(!host)return campaign?'other':'direct';
 const is=(domain:string)=>host===domain||host.endsWith('.'+domain);
 if(is('chatgpt.com')||host==='chat.openai.com')return 'chatgpt';
 if(is('perplexity.ai'))return 'perplexity';
 if(host==='gemini.google.com')return 'gemini';
 if(/^(www\.)?google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/.test(host))return 'google';
 if(is('bing.com'))return 'bing';
 if(host===currentHost||['theredko.com','gameer.io','redvest.app','synaptik-beta.vercel.app','medlit-evidence-appraisal.vercel.app'].some(is))return 'owned';
 if(['linkedin.com','reddit.com','youtube.com','facebook.com','instagram.com','t.co'].some(is))return 'social';
 return 'other';
}
