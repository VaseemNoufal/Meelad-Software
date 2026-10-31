/* Meelad Desk v2. Self-contained Canvas + PDF exporter. Offline and dependency-free. */
const INK='#1d3a32', DARK='#19352e', CREAM='#f6f4ee', GOLD='#b8864e', DIM='#687b71', LINE='#d5ddd5';
const PAGE_W=1400, PAGE_H=1980; // A4 210 x 297 mm at 6.67 px/mm
const mmA4=[210,297];
const makeCanvas=(w=PAGE_W,h=PAGE_H)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const fill=(ctx,color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
function rounded(ctx,x,y,w,h,r,bg,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(bg){ctx.fillStyle=bg;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function text(ctx,s,x,y,size=23,color=INK,weight='500',align='left',family='system-ui'){ctx.save();ctx.font=`${weight} ${size}px ${family}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(String(s??''),x,y);ctx.restore()}
function shrink(ctx,s,max,size,min=14,weight='600'){s=String(s??'');let z=size;ctx.save();for(;z>min;z-=1){ctx.font=`${weight} ${z}px system-ui`;if(ctx.measureText(s).width<=max)break}ctx.restore();return z}
function dateDisplay(d){if(!d)return '';const dt=new Date(d+'T12:00:00');return Number.isNaN(dt.getTime())?d:dt.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
async function loadImage(src){if(!src)return null;return new Promise(resolve=>{const i=new Image();i.onload=()=>{try{const test=makeCanvas(2,2);test.getContext('2d').drawImage(i,0,0,2,2);test.toDataURL();resolve(i)}catch(error){console.warn('Skipping logo that cannot be exported safely',error);resolve(null)}};i.onerror=()=>resolve(null);i.src=src})}
async function logosFor(event){return Promise.all([loadImage(event.madrasaLogo),loadImage(event.festivalLogo)])}
function logo(ctx,image,x,y,w,h){if(!image||!image.width||!image.height)return;const ratio=Math.min(w/image.width,h/image.height);const iw=image.width*ratio,ih=image.height*ratio;try{ctx.drawImage(image,x+(w-iw)/2,y+(h-ih)/2,iw,ih)}catch(e){console.warn('Could not draw logo:',e)}}
function logoBadge(ctx,image,x,y,w,h,letter){
 rounded(ctx,x,y,w,h,Math.min(16,w/7),'#f9faf4');
 if(image)logo(ctx,image,x+8,y+8,w-16,h-16);
 else text(ctx,letter,x+w/2,y+h/2+Math.round(h*.12),Math.min(40,Math.round(h*.44)),DARK,'700','center','Georgia');
}
function centeredTwoLines(ctx,value,x,y,maxWidth,size,lineHeight,color=INK){
 const str=String(value||'');ctx.save();ctx.font=`700 ${size}px system-ui`;
 if(ctx.measureText(str).width<=maxWidth){ctx.restore();text(ctx,str,x,y,size,color,'700','center');return}
 const parts=str.split(/\s+/),lines=[''];for(const word of parts){const next=lines[lines.length-1] ? lines[lines.length-1]+' '+word:word;
  if(ctx.measureText(next).width>maxWidth&&lines[lines.length-1]&&lines.length<2)lines.push(word);else lines[lines.length-1]=next;}
 ctx.restore();if(lines.length===1){text(ctx,str,x,y,shrink(ctx,str,maxWidth,size,17,'700'),color,'700','center')}
 else{const y1=y-lineHeight/2;for(let i=0;i<2;i++)text(ctx,lines[i],x,y1+i*lineHeight,shrink(ctx,lines[i],maxWidth,size,16,'700'),color,'700','center')}
}

/* A6 upright participant card. 4 A6 cut cards fit an A4 page. */
function participantCard(ctx,x,y,w,h,s,event,logos){
 ctx.save();ctx.translate(x,y);ctx.scale(w/700,h/990);
 fill(ctx,'#f8f7f2',0,0,700,990);fill(ctx,DARK,0,0,700,259);fill(ctx,GOLD,0,0,700,8);
 ctx.strokeStyle='#e0ded5';ctx.lineWidth=2;ctx.strokeRect(18,18,664,952);
 logoBadge(ctx,logos[0],42,37,112,111,'M');logoBadge(ctx,logos[1],546,37,112,111,'F');
 text(ctx,'OFFICIAL PARTICIPANT',350,73,15,'#e8d0b0','750','center');
 const fest=event.festivalName||'Meelad Festival';text(ctx,fest,350,143,shrink(ctx,fest,360,32,16,'700'),'#fff','700','center');
 const madrasa=event.madrasaName||'Madrasa';text(ctx,madrasa,350,181,shrink(ctx,madrasa,410,20,12,'500'),'#b8d0c4','500','center');
 text(ctx,'CHEST NUMBER',350,331,18,DIM,'800','center');
 fill(ctx,'#e6e8de',85,358,530,2);
 const code=String(s.chest);text(ctx,code,350,520,shrink(ctx,code,570,162,85,'800'),DARK,'800','center');
 fill(ctx,GOLD,286,549,128,6);
 text(ctx,'REGISTERED STUDENT',350,614,15,'#909b8f','800','center');
 centeredTwoLines(ctx,s.name||'',350,694,590,36,42,DARK);
 fill(ctx,LINE,80,768,540,2);
 text(ctx,`CLASS ${s.grade}   /   ${String(s.categoryName||'Participant').toUpperCase()}`,350,811,20,DIM,'700','center');
 rounded(ctx,116,844,468,71,12,'#e7eee8');
 const teamName=String(s.teamName||s.house||'TEAM UNASSIGNED');
 text(ctx,teamName.toLocaleUpperCase(),350,888,shrink(ctx,teamName,420,25,15,'800'),DARK,'800','center');
 if(event.date)text(ctx,dateDisplay(event.date),350,953,15,DIM,'500','center');
 ctx.restore();
}
export async function chestCardPdf(students,event,{single=false}={}){
 if(!students?.length)throw new Error('No students selected.');const logos=await logosFor(event),pages=[];
 if(single){for(const s of students){const c=makeCanvas(700,990);participantCard(c.getContext('2d'),0,0,700,990,s,event,logos);pages.push({canvas:c,mm:[105,148.5]})}}
 else for(let start=0;start<students.length;start+=4){const c=makeCanvas(),ctx=c.getContext('2d');fill(ctx,'#fff',0,0,PAGE_W,PAGE_H);
   for(let i=0;i<4;i++){if(!students[start+i])continue;participantCard(ctx,(i%2)*700,Math.floor(i/2)*990,700,990,students[start+i],event,logos)}
   // Subtle crop guides, not part of the card artwork.
   ctx.strokeStyle='#a4b1a6';ctx.lineWidth=1;ctx.setLineDash([7,7]);ctx.beginPath();ctx.moveTo(700,0);ctx.lineTo(700,1980);ctx.moveTo(0,990);ctx.lineTo(1400,990);ctx.stroke();ctx.setLineDash([]);
   pages.push({canvas:c,mm:mmA4});
 }
 return pdf(pages);
}

/* Each judge form is half of an A4 page. Bulk combines 2 forms per page. */
function judgeHalf(ctx,y,p,judge,participants,category,event,logos,part,total){
 const x=46,w=1308,h=908;
 rounded(ctx,x,y,w,h,11,'#fff','#c5d0c8');
 fill(ctx,DARK,x,y,w,142);fill(ctx,GOLD,x,y,w,6);
 logoBadge(ctx,logos[0],x+25,y+23,84,82,'M');logoBadge(ctx,logos[1],x+w-109,y+23,84,82,'F');
 text(ctx,event.festivalName||'Meelad Festival',x+w/2,y+58,shrink(ctx,event.festivalName||'Meelad Festival',780,32,18,'700'),'#fff','700','center');
 text(ctx,event.madrasaName||'Madrasa',x+w/2,y+94,shrink(ctx,event.madrasaName||'Madrasa',780,18,13,'500'),'#c0d6c9','500','center');
 text(ctx,'JUDGE MARK SHEET',x+w/2,y+124,14,'#e9c79e','800','center');
 text(ctx,'PROGRAM',x+36,y+189,15,DIM,'800');
 text(ctx,p.name,x+36,y+225,shrink(ctx,p.name,770,30,17,'700'),DARK,'750');
 rounded(ctx,x+w-245,y+166,201,67,9,'#eff2ec');
 text(ctx,'PROGRAM CODE',x+w-226,y+189,13,DIM,'750');text(ctx,p.code||'—',x+w-226,y+219,26,DARK,'800');
 text(ctx,`Judge: ${judge}`,x+36,y+271,19,DARK,'650');
 text(ctx,`Category: ${category}`,x+650,y+271,19,DIM,'600');
 const top=y+298,rowHeight=39;
 fill(ctx,DARK,x+36,top,w-72,43);
 text(ctx,'No.',x+56,top+29,16,'#fff','750');
 text(ctx,'PARTICIPANT CHEST CODE',x+190,top+29,16,'#fff','750');
 text(ctx,`MARK / ${p.maxScore||100}`,x+w-304,top+29,16,'#fff','750');
 ctx.strokeStyle='#d1dad0';ctx.lineWidth=1;
 for(let i=0;i<participants.length;i++){
  const sy=top+43+i*rowHeight,s=participants[i];
  if(i%2===0)fill(ctx,'#f4f6f2',x+36,sy,w-72,rowHeight);
  ctx.beginPath();ctx.moveTo(x+36,sy+rowHeight);ctx.lineTo(x+w-36,sy+rowHeight);ctx.stroke();
  text(ctx,String((part-1)*12+i+1).padStart(2,'0'),x+56,sy+29,17,DIM,'600');
  text(ctx,String(s.chest),x+190,sy+29,20,DARK,'800');
  ctx.beginPath();ctx.moveTo(x+w-380,sy);ctx.lineTo(x+w-380,sy+rowHeight);ctx.stroke();
 }
 const footer=y+h-56;
 text(ctx,`Sheet ${part} of ${total}`,x+36,footer,14,DIM,'550');
 ctx.strokeStyle='#87978a';ctx.beginPath();ctx.moveTo(x+w-385,footer-12);ctx.lineTo(x+w-41,footer-12);ctx.stroke();
 text(ctx,'JUDGE SIGNATURE',x+w-210,footer+16,13,DIM,'700','center');
}
export async function judgeSheetPdf(programs,allStudents,judges,categories,event){
 const logos=await logosFor(event),halves=[],studentIndex=new Map(allStudents.map(s=>[s.id,s])),judgeIndex=new Map(judges.map(j=>[j.id,j]));
 for(const p of programs){const roster=(p.participants||[]).map(id=>studentIndex.get(id)).filter(Boolean).sort((a,b)=>a.chest-b.chest);
  const judgeNames=(p.judges||[]).map(id=>judgeIndex.get(id)?.name).filter(Boolean);if(!judgeNames.length)judgeNames.push('__________________');
  const category=categories.find(c=>c.id===p.categoryId)?.name||'General';const total=Math.max(1,Math.ceil(roster.length/12));
  for(const judge of judgeNames)for(let part=1;part<=total;part++)halves.push({p,judge,participants:roster.slice((part-1)*12,part*12),category,part,total});
 }
 if(!halves.length)throw new Error('No programs to export.');const pages=[];
 for(let i=0;i<halves.length;i+=2){const c=makeCanvas(),ctx=c.getContext('2d');fill(ctx,'#fff',0,0,PAGE_W,PAGE_H);
  for(let n=0;n<2;n++){const sheet=halves[i+n];if(sheet)judgeHalf(ctx,n===0?34:1038,sheet.p,sheet.judge,sheet.participants,sheet.category,event,logos,sheet.part,sheet.total)}
  // Cut line at exact A5 half; single-sheet downloads deliberately leave bottom half blank.
  ctx.strokeStyle='#adb7ac';ctx.lineWidth=1;ctx.setLineDash([8,9]);ctx.beginPath();ctx.moveTo(0,990);ctx.lineTo(PAGE_W,990);ctx.stroke();ctx.setLineDash([]);
  pages.push({canvas:c,mm:mmA4});
 }
 return pdf(pages);
}

/* Print-ready A4 result poster. Works with draft and published results. */
export async function resultPosterCanvas(p,students,categories,event,teams=[]){
 const c=makeCanvas(1080,1528),ctx=c.getContext('2d');
 const logos=await logosFor(event);fill(ctx,'#f6f4ec',0,0,1080,1528);fill(ctx,DARK,0,0,1080,445);fill(ctx,GOLD,0,0,1080,10);
 ctx.strokeStyle='#547265';ctx.lineWidth=2;ctx.strokeRect(38,39,1004,366);
 logoBadge(ctx,logos[0],89,75,110,110,'M');logoBadge(ctx,logos[1],881,75,110,110,'F');
 text(ctx,'MEELAD RESULT BULLETIN',540,112,20,'#c7a276','800','center');
 text(ctx,event.festivalName||'Meelad Festival',540,227,shrink(ctx,event.festivalName||'Meelad Festival',770,55,26,'700'),'#fff','700','center');
 text(ctx,event.madrasaName||'Madrasa',540,283,shrink(ctx,event.madrasaName||'Madrasa',800,24,16,'500'),'#c3d7ca','500','center');
 fill(ctx,GOLD,467,322,146,4);
 text(ctx,p.result?.published?'OFFICIAL RESULTS':'DRAFT RESULTS',540,373,18,'#d2b083','800','center');
 text(ctx,`PROGRAM ${p.code||'—'}`,89,508,18,GOLD,'800');
 centeredTwoLines(ctx,p.name||'',89+450,602,900,54,60,INK);
 const cat=categories.find(c=>c.id===p.categoryId)?.name||'General';
 text(ctx,`${cat.toLocaleUpperCase()}  /  ${(p.type||'On-stage').toLocaleUpperCase()}`,540,683,19,DIM,'750','center');
 ctx.strokeStyle='#d3d8ce';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(85,716);ctx.lineTo(995,716);ctx.stroke();
 const winners=p.result?.places||{};
 for(let idx=0;idx<3;idx++){
  const rank=idx+1,y=748+idx*199;const student=students.find(s=>s.id===winners[rank]);
  const team=teams.find(t=>t.id===student?.teamId);const accent=['#b6884d','#788a86','#ab806b'][idx];
  rounded(ctx,85,y,910,171,14,'#fff','#e0e2db');fill(ctx,accent,85,y,9,171);
  rounded(ctx,119,y+39,95,95,12,idx===0?'#f3e9d6':'#f1f2ed');
  text(ctx,String(rank).padStart(2,'0'),166,y+104,46,accent,'800','center');
  text(ctx,['FIRST PRIZE','SECOND PRIZE','THIRD PRIZE'][idx],242,y+39,18,DIM,'800');
  text(ctx,student?.name||'Not awarded',242,y+92,shrink(ctx,student?.name||'Not awarded',720,33,18,'750'),INK,'750');
  text(ctx,student?`CHEST ${student.chest}   ·   CLASS ${student.grade}`:'—',242,y+122,17,DIM,'650');
  text(ctx,student?(team?.name||student.house||'Unassigned team'):'',242,y+149,19,accent,'750');
  text(ctx,`+${[5,3,1][idx]}`,935,y+43,21,accent,'800','right');
 }
 ctx.strokeStyle='#d5d4cb';ctx.beginPath();ctx.moveTo(86,1392);ctx.lineTo(994,1392);ctx.stroke();
 text(ctx,event.place||'',91,1442,17,DIM,'650');
 text(ctx,dateDisplay(event.date||p.date),990,1442,17,DIM,'650','right');
 text(ctx,'MEELAD DESK  /  FESTIVAL MANAGEMENT',540,1490,14,'#9da69b','750','center');
 return c;
}
export async function resultPosterPdf(p,students,categories,event,teams=[]){return pdf([{canvas:await resultPosterCanvas(p,students,categories,event,teams),mm:mmA4}])}
export function saveCanvasPng(canvas,filename){canvas.toBlob(blob=>{if(blob)download(blob,filename);else console.error('PNG export failed')},'image/png')}
export function download(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}

/* Small embedded-image PDF writer; preserves native-size pages without network libraries. */
const bytes=s=>new TextEncoder().encode(s);
function add(chunks,cursor,part){const arr=typeof part==='string'?bytes(part):part;chunks.push(arr);cursor.size+=arr.length}
function object(chunks,cursor,offsets,id,parts){offsets[id]=cursor.size;add(chunks,cursor,`${id} 0 obj\n`);for(const part of parts)add(chunks,cursor,part);add(chunks,cursor,'\nendobj\n')}
export function pdf(pages){
 if(!pages.length)throw new Error('Nothing to export.');const chunks=[],cursor={size:0},offsets=[0];
 add(chunks,cursor,new Uint8Array([37,80,68,70,45,49,46,52,10,37,226,227,207,211,10]));
 const ids=pages.map((_,i)=>3+i*3);
 object(chunks,cursor,offsets,1,['<< /Type /Catalog /Pages 2 0 R >>']);
 object(chunks,cursor,offsets,2,[`<< /Type /Pages /Kids [${ids.map(id=>`${id} 0 R`).join(' ')}] /Count ${pages.length} >>`]);
 for(let i=0;i<pages.length;i++){
  const {canvas,mm}=pages[i];const pageId=3+i*3,imageId=pageId+1,streamId=pageId+2;
  const wp=(mm[0]*72/25.4).toFixed(3),hp=(mm[1]*72/25.4).toFixed(3);
  const raw=atob(canvas.toDataURL('image/jpeg',.90).split(',')[1]);const jpeg=new Uint8Array(raw.length);for(let j=0;j<raw.length;j++)jpeg[j]=raw.charCodeAt(j);
  object(chunks,cursor,offsets,pageId,[`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wp} ${hp}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${streamId} 0 R >>`]);
  object(chunks,cursor,offsets,imageId,[`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,jpeg,'\nendstream']);
  const content=`q\n${wp} 0 0 ${hp} 0 0 cm\n/Im0 Do\nQ\n`;
  object(chunks,cursor,offsets,streamId,[`<< /Length ${bytes(content).length} >>\nstream\n${content}endstream`]);
 }
 const xref=cursor.size,size=3+pages.length*3;
 add(chunks,cursor,`xref\n0 ${size}\n0000000000 65535 f \n`);
 for(let i=1;i<size;i++)add(chunks,cursor,`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
 add(chunks,cursor,`trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
 return new Blob(chunks,{type:'application/pdf'});
}
