const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'store', 'source-art');
const output = path.join(root, 'store', 'assets');
fs.mkdirSync(output, {recursive:true});
const icon = fs.readFileSync(path.join(source,'icon.svg'),'utf8').replace(/<\/?svg[^>]*>/g,'').replace(/<title>.*?<\/title>/,'');
const mark = (x,y,size) => `<g transform="translate(${x} ${y}) scale(${size/128})">${icon}</g>`;
const hex = (cx,cy,r) => Array.from({length:6},(_,i)=>{
  const a=(60*i-30)*Math.PI/180;return `${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`;
}).join(' ');
const header = (w,h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#163e38"/><g font-family="Arial, Helvetica, sans-serif">`;
const footer = '</g></svg>';
const small = header(440,280) + `
  <polygon points="${hex(402,245,127)}" fill="none" stroke="#94d7b7" stroke-opacity=".13" stroke-width="2"/>
  <polygon points="${hex(402,245,98)}" fill="none" stroke="#e5b966" stroke-opacity=".15" stroke-width="2"/>
  ${mark(330,17,84)}
  <text x="30" y="44" fill="#94d7b7" font-size="12" font-weight="700" letter-spacing="2">BOARD → INSIGHT</text>
  <text x="28" y="112" fill="#fbf4df" font-size="40" font-weight="700">Catan BGA</text>
  <text x="28" y="157" fill="#fbf4df" font-size="40" font-weight="700">Analyzer</text>
  <rect x="30" y="180" width="48" height="4" rx="2" fill="#e5b966"/>
  <text x="30" y="220" fill="#dceae2" font-size="19">Your board. A clearer start.</text>
  <text x="30" y="252" fill="#94d7b7" font-size="11">Unofficial extension · catan.soft2u.ro</text>` + footer;
let board='';
const palette=['#789f7c','#c6a252','#d1b992','#92bc89','#7b9895','#bb7c5e'];
let n=0;
for(let row=-2;row<=2;row++) {
  const count=5-Math.abs(row);
  for(let col=0;col<count;col++) {
    const cx=1035+(col-(count-1)/2)*92, cy=280+row*80;
    board+=`<polygon points="${hex(cx,cy,50)}" fill="${palette[n++%palette.length]}" stroke="#163e38" stroke-width="5"/>`;
  }
}
const wide=header(1400,560)+`
  <circle cx="1045" cy="280" r="282" fill="#214b43"/>
  <circle cx="1045" cy="280" r="267" fill="none" stroke="#94d7b7" stroke-opacity=".18"/>
  ${board}
  <circle cx="1035" cy="280" r="85" fill="#163e38" stroke="#e5b966" stroke-width="3"/>
  ${mark(971,216,128)}
  ${mark(50,36,88)}
  <text x="154" y="90" fill="#94d7b7" font-size="18" font-weight="700" letter-spacing="3">BOARD → INSIGHT</text>
  <text x="62" y="224" fill="#fbf4df" font-size="70" font-weight="700">Catan BGA</text>
  <text x="62" y="302" fill="#fbf4df" font-size="70" font-weight="700">Analyzer</text>
  <rect x="65" y="335" width="72" height="5" rx="2" fill="#e5b966"/>
  <text x="62" y="394" fill="#dceae2" font-size="28">Your board. A clearer start.</text>
  <text x="64" y="446" fill="#94d7b7" font-size="19">Visible board import · Opening analysis</text>
  <text x="64" y="514" fill="#94d7b7" font-size="14">Unofficial extension · catan.soft2u.ro</text>`+footer;
for(const [name,svg] of [['promo-small-440x280',small],['promo-marquee-1400x560',wide]]) {
  const file=path.join(source,name+'.svg');fs.writeFileSync(file,svg);
  execFileSync('magick',['-background','none',file,'PNG24:'+path.join(output,name+'.png')],{windowsHide:true});
}
fs.copyFileSync(path.join(root,'icons','icon-128.png'),path.join(output,'store-icon-128.png'));
console.log('Created the two promotional PNGs and copied the store icon.');
