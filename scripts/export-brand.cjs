/** Mechanical exports from the canonical vector mark. Requires sharp (or SHARP_MODULE). */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'assets/brand/brand.json'), 'utf8'));
const svg = fs.readFileSync(path.join(root, 'assets/brand/mark.svg'));
const output = relative => path.join(root, relative);
async function png(relative, size, opaque = true, source = svg) {
  let job = sharp(source, {density: 768}).resize(size, size);
  if (opaque) job = job.flatten({background: config.background}).removeAlpha();
  await job.png().toFile(output(relative));
}
async function main() {
  fs.mkdirSync(output('public'), {recursive:true});
  await png('assets/icon.png', 1024);
  await png('assets/brand/mark.png', 1024, false);
  await png('assets/splash-icon.png', 1024, false);
  // Keep all painted content within the central Android adaptive-icon safe area.
  const foreground = await sharp(svg, {density:768}).resize(768,768).png().toBuffer();
  await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite([{input:foreground,left:128,top:128}]).png().toFile(output('assets/adaptive-icon.png'));
  for (const size of [192,512]) await png(`public/icon-${size}.png`,size);
  await png('public/apple-touch-icon.png',180);
  // Optical size: use the same mark with a tighter viewBox in tiny favicons.
  const favicon = Buffer.from(svg.toString().replace('viewBox="0 0 128 128"', `viewBox="${config.faviconViewBox}"`));
  await png('assets/favicon.png',64,true,favicon);
  await png('public/favicon-16x16.png',16,true,favicon);
  await png('public/favicon-32x32.png',32,true,favicon);
  const sizes=[16,32,48];const images=[];
  for(const size of sizes) images.push(await sharp(favicon,{density:768}).resize(size,size).flatten({background:config.background}).removeAlpha().png().toBuffer());
  const header=Buffer.alloc(6+16*images.length);header.writeUInt16LE(1,2);header.writeUInt16LE(images.length,4);let offset=header.length;
  images.forEach((data,i)=>{const pos=6+i*16;header[pos]=sizes[i];header[pos+1]=sizes[i];header.writeUInt16LE(1,pos+4);header.writeUInt16LE(32,pos+6);header.writeUInt32LE(data.length,pos+8);header.writeUInt32LE(offset,pos+12);offset+=data.length;});
  fs.writeFileSync(output('public/favicon.ico'),Buffer.concat([header,...images]));
  const shareCard=output('public/og-image.svg');
  if(fs.existsSync(shareCard)){
    const mark=svg.toString().replace('<svg ', '<svg x="92" y="105" width="112" height="112" ').replaceAll(config.foreground,'#FFFFFF');
    const card=fs.readFileSync(shareCard,'utf8').replace(/<!-- brand:start -->[\s\S]*?<!-- brand:end -->/,`<!-- brand:start -->\n${mark}  <!-- brand:end -->`);
    fs.writeFileSync(shareCard,card);
  }
  const ios=output(`ios/${config.iosName}/Images.xcassets`);
  if(fs.existsSync(ios)){
    const appIcon=path.join(ios,'AppIcon.appiconset');
    fs.mkdirSync(appIcon,{recursive:true});
    fs.copyFileSync(output('assets/icon.png'),path.join(appIcon,'App-Icon-1024x1024@1x.png'));
    const splash=path.join(ios,'SplashScreenLogo.imageset');fs.mkdirSync(splash,{recursive:true});
    for(const scale of [1,2,3])await png(path.relative(root,path.join(splash,`image${scale===1?'':`@${scale}x`}.png`)),100*scale,false);
    fs.writeFileSync(path.join(splash,'Contents.json'),JSON.stringify({images:[1,2,3].map(scale=>({idiom:'universal',filename:`image${scale===1?'':`@${scale}x`}.png`,scale:`${scale}x`})),info:{version:1,author:'expo'}},null,2)+'\n');
    const colors=path.join(ios,'SplashScreenBackground.colorset');fs.mkdirSync(colors,{recursive:true});
    const rgb=config.background.match(/[0-9a-f]{2}/gi).map(c=>parseInt(c,16)/255);
    fs.writeFileSync(path.join(colors,'Contents.json'),JSON.stringify({colors:[{color:{components:{alpha:'1.000',red:rgb[0].toFixed(6),green:rgb[1].toFixed(6),blue:rgb[2].toFixed(6)},'color-space':'srgb'},idiom:'universal'}],info:{version:1,author:'expo'}},null,2)+'\n');
  }
  console.log(`${config.name}: app, adaptive, splash, web, favicon and existing iOS asset exports complete.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
