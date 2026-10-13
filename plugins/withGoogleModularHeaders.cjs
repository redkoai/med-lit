const {withPodfile}=require('expo/config-plugins');
module.exports=config=>withPodfile(config,mod=>{
 let source=mod.modResults.contents;
 const additions=['GoogleUtilities','RecaptchaInterop'].filter(name=>!source.includes("pod '"+name+"'" )).map(name=>"  pod '"+name+"', :modular_headers => true").join('\n');
 if(additions){if(!/^target .+ do$/m.test(source))throw new Error('iOS target was not found for Google modular headers');source=source.replace(/^(target .+ do)$/m,'$1\n'+additions);}
 mod.modResults.contents=source;return mod;
});
