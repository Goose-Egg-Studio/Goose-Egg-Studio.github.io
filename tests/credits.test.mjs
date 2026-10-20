import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync(new URL('../src/credits.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {validateData,displayGroups,displayCreators,displaySections,filterGroups}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
// Unit fixtures stay independent of the maintained production roster.
const fixture=()=>({
 schemaVersion:2,
 studio:{name:'Test Studio',intro:'Test intro',closing:'Test closing',demo:true},
 creators:[{name:'示例主创',alias:'CREATOR'}],
 memberOrder:'input',
 groups:[['direction','策划与统筹','DIRECTION'],['development','程序与技术','DEVELOPMENT'],['art','视觉与设计','ART'],['music','音乐与谱面','MUSIC'],['quality','测试与本地化','QUALITY'],['community','社区与运营','COMMUNITY']].map(([id,title,en],index)=>({id,title,en,members:Array.from({length:20},(_,i)=>`示例成员 ${String(index*20+i+1).padStart(3,'0')}`)}))
});

test('shuffle keeps the first person first and preserves all 120 entries without mutating data',()=>{
 const data=validateData(fixture()); data.memberOrder='shuffle'; const copy=JSON.stringify(data); const groups=displayGroups(data,()=>0);
 assert.equal(groups.reduce((n,g)=>n+g.members.length,0),120);
 for(let i=0;i<groups.length;i++){
  assert.equal(groups[i].members[0].name,data.groups[i].members[0]);
  assert.deepEqual(groups[i].members.map(p=>p.name).sort(),[...data.groups[i].members].sort());
  assert.notDeepEqual(groups[i].members.slice(1).map(p=>p.name),data.groups[i].members.slice(1));
 }
 assert.equal(JSON.stringify(data),copy);
});
test('all ordering modes pin the first item, including a detailed person object',()=>{
 const data=fixture();data.groups[0].members=[{name:'Z组长',alias:'LEAD'},'C','B','A'];
 for(const mode of ['shuffle','input','name']){
  data.memberOrder=mode;const members=displayGroups(data,()=>0.5)[0].members;
  assert.deepEqual(members[0],{name:'Z组长',alias:'LEAD'});
  if(mode==='input')assert.deepEqual(members.slice(1).map(p=>p.name),['C','B','A']);
  if(mode==='name')assert.deepEqual(members.slice(1).map(p=>p.name),['A','B','C']);
 }
});
test('empty and single-person groups are safe in every ordering mode',()=>{
 const data=fixture();data.groups[0].members=[];data.groups[1].members=['唯一成员'];
 for(const mode of ['shuffle','input','name']){
  data.memberOrder=mode;const groups=displayGroups(data);
  assert.deepEqual(groups[0].members,[]);assert.deepEqual(groups[1].members,[{name:'唯一成员'}]);
  assert.ok(!filterGroups(groups,'all','').some(g=>g.id===data.groups[0].id));
 }
});
test('validation rejects malformed files and duplicate entries while permitting cross-group contributions',()=>{
 for(const bad of [null,{},[],{...fixture(),schemaVersion:1},{...fixture(),memberOrder:'invalid'}])assert.throws(()=>validateData(bad));
 let data=fixture();data.groups[1].id=data.groups[0].id;assert.throws(()=>validateData(data),/唯一 ID/);
 data=fixture();data.groups[0].members.push(data.groups[0].members[0]);assert.throws(()=>validateData(data),/重复/);
 data=fixture();data.groups[0].members.push('   ');assert.throws(()=>validateData(data),/不能为空/);
 data=fixture();data.groups[0].members.push({name:'甲',alias:7});assert.throws(()=>validateData(data));
 data=fixture();data.groups[1].members.push(data.groups[0].members[0]);assert.doesNotThrow(()=>validateData(data));
});
test('search matches names, aliases, roles and groups without reshuffling or forcing unrelated leaders into results',()=>{
 const data=fixture();data.groups[0].members.push({name:'Chancy',alias:'LUO',contribution:'Android / iOS QC'});
 const groups=displayGroups(data,()=>0.5);const before=JSON.stringify(groups);
 assert.deepEqual(filterGroups(groups,'all','  luo ')[0].members.map(p=>p.name),['Chancy']);
 assert.equal(filterGroups(groups,'all','android')[0].members[0].name,'Chancy');
 assert.equal(filterGroups(groups,'development','luo').length,0);
 assert.equal(filterGroups(groups,'all','DIRECTION')[0].members.length,21);
 assert.equal(filterGroups(groups,'all','不会存在').length,0);
 assert.equal(filterGroups(groups,'all','示例成员 00')[0].members[0].name,'示例成员 001');
 assert.equal(JSON.stringify(groups),before);
});


test('creators are optional, independently displayed, validated and included in search',()=>{
 const data=fixture();const before=JSON.stringify(data);
 const creators=displayCreators(validateData(data),()=>0);
 assert.equal(creators.length,1);assert.equal(creators[0].members.length,1);
 assert.equal(creators[0].members[0].name,data.creators[0].name);
 assert.equal(filterGroups(creators,'__creators','creator')[0].members[0].name,'示例主创');
 assert.equal(filterGroups(creators,'development','').length,0);
 assert.equal(filterGroups(creators,'all','主创')[0].members.length,1);
 assert.equal(JSON.stringify(data),before);
 data.memberOrder='input';assert.deepEqual(displayCreators(data)[0].members,data.creators);
 const without=fixture();delete without.creators;assert.deepEqual(displayCreators(validateData(without)),[]);
 without.creators=[];assert.deepEqual(displayCreators(validateData(without)),[]);
 for(const invalid of ['wrong', [''], ['same','same'], [{name:'name',alias:7}]]){
   assert.throws(()=>validateData({...fixture(),creators:invalid}));
 }
 const collision=fixture();collision.groups[0].id='__creators';assert.throws(()=>validateData(collision));
});


test('platform links allow empty placeholders and validate external destinations',()=>{
 const data=fixture();const before=JSON.stringify(data.groups);
 data.links={taptap:'https://www.taptap.cn/app/267034',appStore:'',x:'https://x.com/SimpleOfficialD',googlePlay:'https://play.google.com/store/apps/details?id=com.gooseeggstudio.simple'};
 const validated=validateData(data);
 assert.deepEqual(validated.links,data.links);
 assert.equal(JSON.stringify(validated.groups),before);
 for(const links of [null,[],{x:7},{unknown:'https://example.com'},{x:'javascript:alert(1)'},{x:'http://example.com'},{x:'/relative'}]){
  assert.throws(()=>validateData({...fixture(),links}),/平台/);
 }
 assert.doesNotThrow(()=>validateData(fixture()));
});

test('published JSON preserves the listed order for every group and the creator',()=>{
 const data=validateData(JSON.parse(fs.readFileSync(new URL('../public/credits.json',import.meta.url),'utf8')));assert.equal(data.memberOrder,'input');
 const groups=displayGroups(data);
 for(let i=0;i<groups.length;i++){
   const expected=data.groups[i].members.map(p=>typeof p==='string'?p:p.name);
   assert.deepEqual(groups[i].members.map(p=>p.name),expected);
 }
 assert.deepEqual(displayCreators(data).flatMap(g=>g.members.map(p=>p.name)),(data.creators||[]).map(p=>typeof p==='string'?p:p.name));
 assert.equal(data.studio.demo,false);
});

test('section headings group adjacent roles without reordering or merging separate occurrences',()=>{
 const data=fixture();
 data.groups[0].section='早期开发组';data.groups[1].section='早期开发组';
 data.groups[2].section='现阶段开发组';data.groups[3].section='早期开发组';
 const groups=displayGroups(validateData(data));const before=JSON.stringify(groups);
 const sections=displaySections(groups);
 assert.deepEqual(sections.map(s=>s.title),['早期开发组','现阶段开发组','早期开发组',undefined]);
 assert.deepEqual(sections.map(s=>s.groups.length),[2,1,1,2]);
 assert.deepEqual(sections.flatMap(s=>s.groups),groups);
 assert.equal(new Set(sections.map(s=>s.id)).size,sections.length);
 assert.equal(JSON.stringify(groups),before);
 assert.deepEqual(displaySections([]),[]);
 for(const section of ['',false,7]){
  const invalid=fixture();invalid.groups[0].section=section;assert.throws(()=>validateData(invalid),/所属阶段/);
 }
});

test('bilingual titles preserve member names and ordering and validate translated fields',()=>{
 const data=fixture();const original=data.groups.map(g=>[g.id,[...g.members]]);
 data.studio.closingEn='Thank you.';
 data.groups[0].section=data.groups[1].section='制作成员';
 data.groups[0].sectionEn=data.groups[1].sectionEn='Production Credits';
 data.groups[0].en='Game Design';data.groups[1].en='Programming';
 const validated=validateData(data);const groups=displayGroups(validated);
 assert.equal(displaySections(groups)[0].en,'Production Credits');
 assert.deepEqual(groups.map(g=>[g.id,g.members.map(p=>p.name)]),original);
 assert.equal(validated.studio.closingEn,'Thank you.');
 for(const invalid of [null,7,false,'']){
  const bad=fixture();bad.groups[0].sectionEn=invalid;
  assert.throws(()=>validateData(bad),/英文分区标题/);
 }
 const bad=fixture();bad.studio.closingEn=7;assert.throws(()=>validateData(bad),/英文结束语/);
});

const dividerCode=ts.transpileModule(fs.readFileSync(new URL('../src/dividers.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {clipDivider,createDividerRenderer}=await import('data:text/javascript;base64,'+Buffer.from(dividerCode).toString('base64'));

test('dividers stop at the ellipse boundary and disappear outside the surface',()=>{
 const surface={left:0,top:0,width:200,height:100};
 assert.deepEqual(clipDivider(surface,{left:10,right:250,bottom:50}),{start:0,width:190});
 assert.deepEqual(clipDivider(surface,{left:10,right:250,bottom:101}),{start:0,width:0});
 assert.deepEqual(clipDivider(surface,{left:220,right:250,bottom:50}),{start:0,width:0});
});
test('divider clipping follows desktop and mobile geometry as rows scroll',()=>{
 for(const [width,height,mobile] of [[1440,900,false],[390,844,true]]){
  const surface={left:width*(mobile?-1.2:-.73),top:height*(mobile?-.55:-.75),width:width*(mobile?2.1:1.55),height:height*(mobile?2.1:2.5)};
  for(const bottom of [1,height/2,height-1]){
   const row={left:23,right:width-23,bottom};const clip=clipDivider(surface,row);
   assert.ok(clip.width>0);assert.ok(clip.width<row.right-row.left);
   const x=row.left+clip.start+clip.width;
   const cx=surface.left+surface.width/2,cy=surface.top+surface.height/2;
   const equation=((x-cx)/(surface.width/2))**2+((bottom-cy)/(surface.height/2))**2;
   assert.ok(Math.abs(equation-1)<1e-10);
  }
 }
});

test('dividers can extend beyond the content column to the arc without overflowing the viewport',()=>{
 const surface={left:0,top:0,width:200,height:100};
 const row={left:10,right:150,bottom:50};
 assert.deepEqual(clipDivider(surface,row),{start:0,width:140});
 assert.deepEqual(clipDivider(surface,row,250),{start:0,width:190});
 assert.deepEqual(clipDivider(surface,row,180),{start:0,width:170});
 assert.deepEqual(clipDivider(surface,{...row,bottom:101},250),{start:0,width:0});
});

function dividerFixture(bottoms=[50,150,1050]) {
 const state={scrollY:0,reads:0,queries:0,writes:0,surface:{left:0,top:0,width:200,height:100}};
 const lines=bottoms.map(()=>{
  const values={};
  return {values,style:{setProperty(key,value){state.writes++;values[key]=value;}}};
 });
 const rows=bottoms.map((bottom,i)=>({
  bottom,
  style:{setProperty(){throw new Error('Divider updates must not invalidate the whole member section');}},
  querySelector(){return lines[i];},
  getBoundingClientRect(){state.reads++;return {left:10,right:150,bottom:this.bottom-state.scrollY};}
 }));
 const plane={getBoundingClientRect(){state.reads++;return {...state.surface};}};
 const container={querySelectorAll(){state.queries++;return rows;}};
 return {state,lines,rows,plane,container};
}

test('scrolling reuses measured geometry and does no line work after the last section',()=>{
 const f=dividerFixture();const renderer=createDividerRenderer();
 renderer.measure(f.plane,f.container,0,250);
 assert.equal(f.state.reads,4);assert.equal(f.state.queries,1);
 renderer.render(0,100);
 assert.equal(f.lines[0].values['--divider-width'],'190px');
 assert.deepEqual(f.lines[1].values,{});assert.deepEqual(f.lines[2].values,{});
 const writes=f.state.writes;renderer.render(0,100);assert.equal(f.state.writes,writes);
 for(let y=10;y<=1000;y+=10){f.state.scrollY=y;renderer.render(y,100);}
 assert.equal(f.state.reads,4);assert.equal(f.state.queries,1);
 assert.equal(f.lines[2].values['--divider-width'],'190px');
 const footerWrites=f.state.writes;
 for(let y=1110;y<=1300;y+=10)renderer.render(y,100);
 assert.equal(f.state.writes,footerWrites);
});

test('remeasuring after a reflow refreshes document positions at the current scroll offset',()=>{
 const f=dividerFixture([50]);const renderer=createDividerRenderer();
 renderer.measure(f.plane,f.container,0,250);renderer.render(0,100);
 assert.equal(f.lines[0].values['--divider-width'],'190px');
 f.state.scrollY=100;f.state.surface.width=300;f.rows[0].bottom=150;
 renderer.measure(f.plane,f.container,100,250);renderer.render(100,100);
 assert.equal(f.lines[0].values['--divider-width'],'240px');
 assert.equal(f.state.reads,4);
});

test('a hidden or unavailable arc does not measure or update member sections',()=>{
 const f=dividerFixture();const renderer=createDividerRenderer();
 f.state.surface.width=0;
 renderer.measure(f.plane,f.container,0,390);renderer.render(0,844);
 assert.equal(f.state.reads,1);assert.equal(f.state.queries,0);assert.equal(f.state.writes,0);
 renderer.measure(undefined,f.container,0,390);renderer.render(100,844);
 assert.equal(f.state.writes,0);
});
