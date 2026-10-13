const fs=require('node:fs');
for(const file of ['.env','.env.local','.env.production','.env.production.local','.env.development','.env.development.local']){
 if(!fs.existsSync(file))continue;for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){const match=line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);if(match&&match[2].replace(/[\"']/g,'').trim()&&!process.env[match[1]])process.env[match[1]]=match[2];}
}
const unsafe=Object.keys(process.env).filter(k=>/^(EXPO_PUBLIC|NEXT_PUBLIC)_.*(SECRET|PRIVATE_KEY|SERVICE_ROLE|ANTHROPIC_API_KEY|OPENAI_API_KEY|GEMINI_API_KEY|OPENROUTER_API_KEY)/i.test(k)&&process.env[k]);
if(unsafe.length){console.error('Private values are configured for client exposure: '+unsafe.join(', '));process.exit(1);}
const config=JSON.parse(fs.readFileSync('app.json','utf8')).expo;
if(!config.ios?.bundleIdentifier||!config.ios?.usesAppleSignIn)throw new Error('Apple bundle identity/capability is missing.');
console.log('Public environment names and Apple app identity checked. Secret values were not printed.');
